/* ──────────────────────────────────────────────────────
   health/hba1c/hba1cData.ts
   당화혈색소(HbA1c) ↔ 추정 평균혈당(eAG) 변환
   ──────────────────────────────────────────────────────
   근거
   - eAG(mg/dL) = 28.7 × HbA1c − 46.7  (ADAG 연구, Nathan et al. 2008 / ADA·NGSP 공인)
     mmol/L = mg/dL ÷ 18.0 (18.016 근사)
   - 진단·구간 기준: 대한당뇨병학회 진료지침 / ADA — 정상 <5.7, 당뇨 전단계 5.7~6.4,
     당뇨 ≥6.5 (%). 관리 목표는 개인별 상이(일반 성인 <6.5% 권고, 고령·저혈당 위험군은 완화).
   ⚠️ 진단 도구가 아니라 참고 변환 — 실제 진단·치료는 의료진 판단.
   ────────────────────────────────────────────────────── */

export const EAG_SLOPE = 28.7
export const EAG_INTERCEPT = 46.7
export const MGDL_PER_MMOL = 18.0

/** HbA1c(%) → 추정 평균혈당 eAG (mg/dL) */
export function a1cToEag(a1c: number): number {
  return EAG_SLOPE * a1c - EAG_INTERCEPT
}
/** eAG(mg/dL) → HbA1c(%) */
export function eagToA1c(eag: number): number {
  return (eag + EAG_INTERCEPT) / EAG_SLOPE
}
export const mgdlToMmol = (mg: number) => mg / MGDL_PER_MMOL
export const mmolToMgdl = (mmol: number) => mmol * MGDL_PER_MMOL

/** .5 경계 float 오차 스크럽 후 정수 반올림 (ADA 공식표 6.0%→126 재현) */
export function roundScrub(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals)
  return Math.round(Number((n * f).toPrecision(12))) / f
}

export interface A1cBand {
  id: string
  label: string
  a1cLo: number
  a1cHi: number | null
  color: string
  note: string
}
/** 진단 구간 (KDA/ADA, %) */
export const A1C_BANDS: A1cBand[] = [
  { id: 'normal', label: '정상',        a1cLo: 0,   a1cHi: 5.7, color: 'var(--success)',    note: '정상 범위 — 정기 검진 유지' },
  { id: 'pre',    label: '당뇨 전단계', a1cLo: 5.7, a1cHi: 6.5, color: 'var(--warning)',    note: '생활습관 관리로 진행 예방이 중요한 구간' },
  { id: 'dm',     label: '당뇨병 범위', a1cLo: 6.5, a1cHi: null, color: 'var(--danger)',     note: '진단·치료는 의료진과 상의하세요' },
]

/** HbA1c 값이 속하는 진단 구간 */
export function bandForA1c(a1c: number): A1cBand {
  return A1C_BANDS.find((b) => a1c < (b.a1cHi ?? Infinity)) ?? A1C_BANDS[A1C_BANDS.length - 1]
}

/** 참고 환산표 행 */
export interface RefRow {
  a1c: number
  eagMg: number
  eagMmol: number
}
export function buildRefTable(): RefRow[] {
  const out: RefRow[] = []
  for (let a = 5; a <= 12; a += 0.5) {
    const mg = a1cToEag(a)
    out.push({ a1c: a, eagMg: roundScrub(mg), eagMmol: roundScrub(mgdlToMmol(mg), 1) })
  }
  return out
}
