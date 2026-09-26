/* ──────────────────────────────────────────────────────
   health/child-height/childHeightUtils.ts
   자녀 예상 키 — 중간부모키법(Tanner mid-parental height, MPH)
   순수 계산 함수 (UI·부수효과 없음)
   ────────────────────────────────────────────────────── */

export type Sex = 'male' | 'female'

/* ── 상수 (단일 소스) ── */
/** 성인 남녀 평균 신장차 보정 (Tanner MPH 표준) */
export const MALE_ADJ = 13
/** 예측 범위 — 중앙값 ±BAND (≈ ±2SD, 3~97 백분위) */
export const BAND = 8.5
/** 키 입력 허용 범위(cm) — 범위 밖은 결과를 내지 않고 인라인 안내 */
export const HEIGHT_MIN = 100
export const HEIGHT_MAX = 220
/**
 * 비교 기준: 한국 20~24세 평균 키(cm) — 자녀가 성인이 될 무렵의 젊은 성인 세대와 비교하기 위함.
 * 출처: 사이즈코리아(국가기술표준원) 8차 한국인 인체치수조사(직접측정 2020~2021),
 *   20~24세 남 174.99 / 여 161.78cm (life/height-rank/heightRankData.ts BANDS와 동일 원자료).
 *   참고로 20~69세 전체 평균은 남 172.5 / 여 159.6cm.
 * TODO: height-rank와 공유하도록 lib/ 단일 소스로 이동.
 * 단순 차이만 표시 — 백분위·우열을 단정하지 말 것.
 */
export const KR_ADULT_AVG: Record<Sex, number> = {
  male: 175.0,
  female: 161.8,
}
/** 비교 기준 표기 (화면 라벨) */
export const KR_AVG_LABEL = '20~24세 평균(8차 사이즈코리아)'

/* ── 입력 정규화 ── */
/**
 * 키 문자열/숫자를 cm 수치로 파싱.
 * 비정상·범위 밖(HEIGHT_MIN~HEIGHT_MAX) 입력은 null — 조용히 클램프하지 않는다(1.78 → 100 처리 버그 방지).
 */
export function parseHeight(raw: string | number): number | null {
  const v = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(v) || v < HEIGHT_MIN || v > HEIGHT_MAX) return null
  return v
}

/** 입력 오류 안내 문구 — 빈칸이거나 정상이면 null */
export function heightError(raw: string): string | null {
  if (raw.trim() === '') return null
  const v = parseFloat(raw)
  if (!Number.isFinite(v) || v <= 0) return '숫자로 입력하세요 (예: 175)'
  if (v < 3) return '미터로 입력하신 것 같아요 — cm로 입력하세요 (예: 1.78m → 178)'
  if (v < HEIGHT_MIN || v > HEIGHT_MAX) return `${HEIGHT_MIN}~${HEIGHT_MAX}cm 사이로 입력하세요`
  return null
}

/* ── 예상 성인 키 (중앙값) ── */
/**
 * 중간부모키법(MPH) 예상 성인 키 중앙값.
 *   남아 TH = (fH + mH + 13) / 2
 *   여아 TH = (fH + mH − 13) / 2
 * fH·mH는 cm. 반올림하지 않은 원값을 반환(표시 직전에만 round).
 */
export function predictHeight(fH: number, mH: number, sex: Sex): number {
  const adj = sex === 'male' ? MALE_ADJ : -MALE_ADJ
  return (fH + mH + adj) / 2
}

/** 부모 중간키 원값 = (부 + 모) / 2 — 13cm 보정 전 값 */
export function midParent(fH: number, mH: number): number {
  return (fH + mH) / 2
}

/* ── 예측 범위 밴드 ── */
export interface HeightBand {
  low: number
  high: number
  margin: number
}

/**
 * 예상 키 중앙값 기준 ±margin 밴드.
 * 반올림하지 않은 원값을 반환(표시 직전에만 round).
 */
export function heightBand(th: number, margin: number = BAND): HeightBand {
  return { low: th - margin, high: th + margin, margin }
}

/* ── 한국 20~24세 평균(8차 사이즈코리아) 대비 단순 차이 ── */
/**
 * 예상 키 − 같은 성별 한국 20~24세 평균(8차 사이즈코리아, KR_ADULT_AVG).
 * 단순 차이만 — 백분위·우열 단정 금지.
 * 반올림하지 않은 원값 반환.
 */
export function diffFromKrAverage(th: number, sex: Sex): number {
  return th - KR_ADULT_AVG[sex]
}

/* ── 표시용 반올림 (0.1cm 단위) ── */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
