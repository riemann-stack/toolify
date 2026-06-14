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
/** 키 입력 허용 범위(cm) — 이상치 차단용 클램프 경계 */
export const HEIGHT_MIN = 100
export const HEIGHT_MAX = 220
/**
 * 한국 성인 평균 키(cm) — 참고치(verified=false).
 * KOSIS·언론 인용값 수준의 참고치이며 1차 공식 통계로 재확인되지 않음.
 * '참고치' 라벨로만 표시하고, 백분위·우열을 단정하지 말 것.
 */
export const KR_ADULT_AVG: Record<Sex, number> = {
  male: 174.5,
  female: 161.4,
}

/* ── 입력 정규화 ── */
/**
 * 키 문자열/숫자를 cm 수치로 파싱.
 * 비정상 입력은 null, 정상 입력은 HEIGHT_MIN~HEIGHT_MAX로 클램프.
 */
export function parseHeight(raw: string | number): number | null {
  const v = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(v) || v <= 0) return null
  return Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, v))
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

/* ── 한국 성인 평균 대비 단순 차이 (참고치) ── */
/**
 * 예상 키 − 같은 성별 한국 성인 평균(참고치).
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

/** 한 번의 입력으로 남아·여아 두 결과를 동시에 (비교 모드용) */
export function predictBoth(fH: number, mH: number): { male: number; female: number } {
  return {
    male: predictHeight(fH, mH, 'male'),
    female: predictHeight(fH, mH, 'female'),
  }
}
