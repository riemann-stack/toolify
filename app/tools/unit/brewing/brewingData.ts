/* ──────────────────────────────────────────────────────
   unit/brewing/brewingData.ts
   양조·당도·도수 환산 — Brix · Plato · SG · Baumé · Oechsle
   + ABV (OG/FG) · Proof · pH/TA 참고치
   ──────────────────────────────────────────────────────
   ⚠️ 환산식은 다항식 보간 기반 — ±0.1° 정확도.
      매우 높은 당도(40 Brix+)나 점성 시럽에서는 굴절계 자체 보정 필요.
   ────────────────────────────────────────────────────── */

export type Scale = 'brix' | 'plato' | 'sg' | 'baume' | 'oechsle'

export interface ScaleInfo {
  id: Scale
  name: string
  fullName: string
  unit: string
  range: [number, number]
  desc: string
}

export const SCALES: ScaleInfo[] = [
  { id: 'brix',    name: 'Brix',    fullName: '브릭스 (당도)',         unit: '°Bx',  range: [0, 40],    desc: '식품·과실·음료 표준. 정제당 % (중량 기준) — 와인 머스트·잼·시럽' },
  { id: 'plato',   name: 'Plato',   fullName: '플라토 (맥주 당도)',     unit: '°P',   range: [0, 30],    desc: '맥주 워트(wort) 표준. Brix와 거의 동일하지만 양조 업계 관습' },
  { id: 'sg',      name: 'SG',      fullName: 'Specific Gravity (비중)', unit: '',    range: [0.980, 1.150], desc: '비중 (물=1.000). 가장 정확한 발효 추적 — 발효 전/후 모두 사용' },
  { id: 'baume',   name: 'Baumé',   fullName: '보메 (와인 전통)',       unit: '°Bé',  range: [0, 25],    desc: '프랑스 와인 전통 단위. 1°Bé ≈ 1.8°Bx — 와인 머스트 등급' },
  { id: 'oechsle', name: 'Oechsle', fullName: '왹슬레 (독일 와인)',     unit: '°Oe',  range: [0, 200],   desc: '독일 와인 머스트 단위. °Oe = (SG−1)×1000 — Kabinett·Spätlese 분류' },
]

// ─── 환산 함수 ────────────────────────────────────────────
/** SG → Brix (ASBC 3차 다항식, 0~30°Bx 범위에서 ±0.05° 정확) */
export function sgToBrix(sg: number): number {
  return ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622
}

/** Brix → SG (역산 — 근사 다항식, 0~30°Bx 범위) */
export function brixToSg(brix: number): number {
  return 1 + brix * 0.003875 + brix * brix * 0.00001351 + brix * brix * brix * 0.000000034
}

/** SG ↔ Plato — 양조 업계에서는 Plato ≈ Brix 로 취급 (오차 < 0.05°) */
export const sgToPlato = sgToBrix
export const platoToSg = brixToSg

/** Plato ↔ Brix — 거의 1:1 (식품용 Brix는 자당 기준, 맥주 Plato는 추출당 기준의 차이) */
export const brixToPlato = (b: number) => b
export const platoToBrix = (p: number) => p

/** SG ↔ Baumé — `Bé = 145 × (1 − 1/SG)` (heavier than water) */
export function sgToBaume(sg: number): number {
  if (sg <= 1) return 0
  return 145 * (1 - 1 / sg)
}
export function baumeToSg(be: number): number {
  if (be <= 0) return 1
  // be ≥ 145면 분모가 0 이하가 되어 SG가 발산/음수(쓰레기값). 물리적으로 불가능한 영역이라 NaN.
  if (be >= 145) return NaN
  return 145 / (145 - be)
}

/** SG ↔ Oechsle — 매우 단순: °Oe = (SG−1)×1000 */
export function sgToOechsle(sg: number): number {
  return (sg - 1) * 1000
}
export function oechsleToSg(oe: number): number {
  return 1 + oe / 1000
}

// 통합 환산
export interface Converted {
  brix: number
  plato: number
  sg: number
  baume: number
  oechsle: number
}

export function convertAll(scale: Scale, value: number): Converted {
  // 모두 SG 기준으로 통일 후 환산
  let sg = 1
  switch (scale) {
    case 'sg':      sg = value; break
    case 'brix':    sg = brixToSg(value); break
    case 'plato':   sg = platoToSg(value); break
    case 'baume':   sg = baumeToSg(value); break
    case 'oechsle': sg = oechsleToSg(value); break
  }
  return {
    sg,
    brix:    sgToBrix(sg),
    plato:   sgToPlato(sg),
    baume:   sgToBaume(sg),
    oechsle: sgToOechsle(sg),
  }
}

// ─── ABV 계산 ─────────────────────────────────────────────
/** 표준 공식 — `ABV% = (OG − FG) × 131.25`
 *  단순하지만 OG ≤ 1.090 / 결과 ≤ 12% 범위에서 적정.
 *  와인·하이 알코올용은 보정식 필요.
 */
export function abvSimple(og: number, fg: number): number {
  if (og <= fg) return 0
  return (og - fg) * 131.25
}

/** 보정 공식 — 고알코올 와인 (Cutaia et al. 2009)
 *  ABV% = (76.08 × (OG−FG) / (1.775−OG)) × (FG / 0.794) */
export function abvCorrected(og: number, fg: number): number {
  if (og <= fg || og >= 1.7) return 0
  return (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794)
}

/** 와인 머스트 Brix만 있을 때 예상 ABV (FG≈0.992 가정)
 *  ABV% ≈ Brix × 0.55 ~ 0.60. 효모·당 잔량에 따라 가변. */
export function abvFromBrix(brix: number): { low: number; high: number } {
  return { low: brix * 0.55, high: brix * 0.60 }
}

// ─── Proof 변환 ───────────────────────────────────────────
export const abvToUsProof = (abv: number) => abv * 2
export const usProofToAbv = (proof: number) => proof / 2
/** UK historical proof: 100°UK = 57.15% ABV. 현재 거의 사용 X */
export const abvToUkProof = (abv: number) => abv / 0.5715
export const ukProofToAbv = (uk: number) => uk * 0.5715

// ─── 카테고리별 권장 범위 ────────────────────────────────
export interface CategoryGuide {
  emoji: string
  name: string
  ogRangeSG?: [number, number]   // 발효 전 (또는 측정 시) SG 범위 — SG로 규격화하지 않는 식품(김치 등)은 생략
  fgRangeSG?: [number, number]   // 발효 후 SG (있을 때)
  brix?: [number, number]
  abv?: [number, number]
  ph?: [number, number]
  ta?: string                    // 산도 범위 (Titratable Acidity)
  note?: string
}

export const CATEGORY_GUIDES: CategoryGuide[] = [
  {
    emoji: '🍷', name: '와인 머스트',
    ogRangeSG: [1.075, 1.115], brix: [18, 28], abv: [11, 16], ph: [3.0, 4.0], ta: '5~9 g/L',
    note: '품종·지역별 권장: 화이트 19~22 Brix / 레드 22~26 Brix. 25 Brix↑ 디저트 와인',
  },
  {
    emoji: '🍺', name: '비어 워트',
    ogRangeSG: [1.040, 1.075], fgRangeSG: [1.008, 1.018], brix: [10, 18], abv: [4, 9], ph: [4.0, 4.6],
    note: '라거 10~12°P / 페일에일 11~14°P / 스타우트·IPA 14~18°P. 당화 중 pH 5.2~5.6',
  },
  {
    emoji: '🍎', name: '사이다·과실주',
    ogRangeSG: [1.045, 1.080], fgRangeSG: [0.998, 1.005], brix: [11, 19], abv: [4.5, 10], ph: [3.2, 3.8], ta: '4~8 g/L',
    note: '사과 즙 자체로 발효 가능. FG 0.998 가까이 떨어지면 드라이 — 당 첨가로 조정',
  },
  {
    emoji: '🍯', name: '잼·시럽',
    ogRangeSG: [1.319, 1.363], brix: [65, 72],
    note: '잼은 65°Bx↑이 보존성 기준점. 70°Bx↑은 결정화 위험. 굴절계 측정 필수(Brix↔SG 다항식 검증범위 밖이라 SG는 참고값)',
  },
  {
    emoji: '🧀', name: '치즈 (커드)',
    ogRangeSG: [1.020, 1.035], ph: [4.6, 6.6], ta: '0.1~1.0% 락트산',
    note: '카드 pH 6.0~6.6 / 숙성·표면 pH 5.0~5.5 / 페타·블루 4.6~5.0',
  },
  {
    emoji: '🥬', name: '김치 (한국 발효)',
    ph: [4.0, 4.5], ta: '0.6~0.8%',
    note: '김치는 SG(비중)가 아니라 pH·산도로 숙성을 판정합니다. 갓 담근 김치 pH 5.5~6.0 → 익으면 4.0~4.5(최적 ~4.2) / 군내 4.0 미만은 과발효',
  },
]

// ─── pH·TA 측정 참고 ──────────────────────────────────────
export const PH_GUIDE = [
  { range: '< 3.0', label: '매우 산성', note: '와인·시트러스 즙·식초류 영역. 보존성 ↑' },
  { range: '3.0~4.0', label: '산성',   note: '와인·요거트·김치 발효 적정' },
  { range: '4.0~4.6', label: '약산성',  note: '비어·사이다 발효 후 / 보툴리누스 차단선(4.6)' },
  { range: '4.6~6.0', label: '약산',    note: '치즈·우유 발효 / 미생물 활동 활발' },
  { range: '6.0~7.0', label: '중성',    note: '생수·우유 원유 / 발효 시작 전' },
  { range: '> 7.0', label: '염기성',   note: '베이킹소다·암모니아 / 식품 보존 X' },
]
