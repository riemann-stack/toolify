/* ──────────────────────────────────────────────────────
   cooking/cake-pan/cakePanData.ts
   케이크 팬 호수 변환 — 부피 기반 레시피 배율 + 호수·인치·인원 참고
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 리서치+적대검증 워크플로)
   - 원형 팬 호수: 미니 12cm(11.3~12 판매처 편차), 1호 15 / 2호 18 / 3호 21 / 4호 24 / 5호 27cm
     — 1호=15cm 기점·호당 +3cm, 전 판매처 일치 (카우2004·웰베이킹·d&b베이킹몰 교차 확인).
   - 높이 이원 체계: 일반팬 4.5cm / 높은팬 7cm (제누와즈·생크림용 사실상 표준).
     무스링은 지름 체계 동일 + 높이 5cm 표준 (높은형 6~7cm 별도).
   - 배율 관행: 높이 같으면 (지름비)², 다르면 ×(높이비) — brunch·이홈베이킹·베이킹 유튜브 일관.
     검산 앵커: (18/15)²=1.44, (21/18)²≈1.3611, 15×H5→18×H7≈2.016배.
   - 부피 앵커(H7): 1호 ≈1,237ml · 2호 ≈1,781ml · 3호 ≈2,424ml. 반죽은 통상 틀의 60~70% 채움.
   - 인치 대응: 1호≈6in(15.24)·2호≈7in(17.78)은 근사 타당, 3호↔8in 0.68cm 차,
     9in=22.86cm는 약 3.6호 — 정확 대응 없음. 미국 표준팬 높이 2in(5cm) ≠ 한국 높은팬 7cm.
   - 인원 관행(편차 큼): 미니 1~2인, 1호 2~3, 2호 4~5, 3호 6~8, 4호 8~12.
   - 사각팬·파운드(오란다)팬은 표준 규격 없음(판매처별 상이) → 치수 직접 입력 방식.
   - 굽기 보정은 정량 규칙 없음 — 방향성(온도 소폭↓·시간↑·꼬치 테스트)만 안내, 수치 단정 금지.
   ────────────────────────────────────────────────────── */

export type PanShape = 'round' | 'square'

export interface HoPreset {
  label: string
  d: number // 지름 cm
  serving: string
  inch: string
}

export const HO_PRESETS: HoPreset[] = [
  { label: '미니', d: 12, serving: '1~2인', inch: '≈4.7in' },
  { label: '1호', d: 15, serving: '2~3인', inch: '≈6in' },
  { label: '2호', d: 18, serving: '4~5인', inch: '≈7in' },
  { label: '3호', d: 21, serving: '6~8인', inch: '8in+0.7cm' },
  { label: '4호', d: 24, serving: '8~12인', inch: '9in+1.1cm' },
  { label: '5호', d: 27, serving: '12인+', inch: '≈10.6in' },
]

export const HEIGHT_PRESETS = [
  { id: 'high', label: '높은팬 7cm', h: 7 },
  { id: 'low', label: '일반팬 4.5cm', h: 4.5 },
  { id: 'mousse', label: '무스링 5cm', h: 5 },
  { id: 'custom', label: '직접 입력', h: 0 },
] as const

export type HeightId = (typeof HEIGHT_PRESETS)[number]['id']

export interface PanSpec {
  shape: PanShape
  d: number      // round: 지름 cm
  w: number      // square: 가로 cm
  l: number      // square: 세로 cm
  h: number      // 높이 cm
}

/** 팬 부피 (cm³ = ml) */
export function panVolume(p: PanSpec): number | null {
  if (p.h <= 0) return null
  if (p.shape === 'round') {
    if (p.d <= 0) return null
    return Math.PI * Math.pow(p.d / 2, 2) * p.h
  }
  if (p.w <= 0 || p.l <= 0) return null
  return p.w * p.l * p.h
}

export interface ConvertResult {
  ratio: number
  fromVol: number
  toVol: number
}

export function convertPan(from: PanSpec, to: PanSpec): ConvertResult | null {
  const fv = panVolume(from)
  const tv = panVolume(to)
  if (fv === null || tv === null || fv <= 0) return null
  return { ratio: tv / fv, fromVol: fv, toVol: tv }
}

/** 호수 지름 → 근사 호수 라벨 (참고표용) */
export function hoLabelByDiameter(d: number): string | null {
  const hit = HO_PRESETS.find((p) => Math.abs(p.d - d) < 0.01)
  return hit ? hit.label : null
}
