// ─────────────────────────────────────────────────────────────
// 1RM & 훈련 중량 계산기 — 워밍업·성/연령별 수준·RPE 헬퍼
// ─────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female'
export type AgeBand = '20-30' | '30-40' | '40-50' | '50-60' | '60+'

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  '20-30': '20대',
  '30-40': '30대',
  '40-50': '40대',
  '50-60': '50대',
  '60+':   '60대+',
}

// 연령별 보정 계수 (20대 = 100% 기준)
export const AGE_FACTOR: Record<AgeBand, number> = {
  '20-30': 1.0,
  '30-40': 0.95,
  '40-50': 0.85,
  '50-60': 0.75,
  '60+':   0.65,
}

// 여성 = 남성 기준의 약 70% (체중 대비)
export const FEMALE_FACTOR = 0.70

// ─────────────────────────────────────────────────────────────
// 3대 운동 기준 수준표 (남성 20대, 체중 대비 배수)
// — 1RM 계산기·3대 측정기(strength-level)가 공유하는 단일 소스
// ─────────────────────────────────────────────────────────────
export type LevelTable = { 초보: number; 중급: number; 상급: number; 엘리트: number }

export const BIG3_BASE_LEVELS: Record<'squat' | 'bench' | 'deadlift', LevelTable> = {
  squat:    { 초보: 0.75, 중급: 1.25, 상급: 1.5,  엘리트: 2.0 },
  bench:    { 초보: 0.5,  중급: 1.0,  상급: 1.25, 엘리트: 1.5 },
  deadlift: { 초보: 1.0,  중급: 1.5,  상급: 2.0,  엘리트: 2.5 },
}

// ─────────────────────────────────────────────────────────────
// 워밍업 자동 생성
// ─────────────────────────────────────────────────────────────
export type WarmupSet = {
  setNumber: number
  weightKg: number
  weightPercent: number
  reps: number
  restSec: number
  notes?: string
}

export function generateWarmup(oneRM: number, workingPercent: number): WarmupSet[] {
  if (!oneRM || oneRM <= 0) return []
  const intensityRatio = workingPercent / 100

  const baseSets: WarmupSet[] = [
    { setNumber: 1, weightKg: 20,         weightPercent: 20 / oneRM * 100, reps: 10, restSec: 60,  notes: '빈 봉 (폼 워밍업)' },
    { setNumber: 2, weightKg: oneRM * 0.4, weightPercent: 40, reps: 8, restSec: 60 },
    { setNumber: 3, weightKg: oneRM * 0.6, weightPercent: 60, reps: 5, restSec: 90 },
    { setNumber: 4, weightKg: oneRM * 0.7, weightPercent: 70, reps: 3, restSec: 120 },
    { setNumber: 5, weightKg: oneRM * 0.8, weightPercent: 80, reps: 1, restSec: 180, notes: '예열 싱글' },
  ]

  // 본 세트 강도가 낮으면 워밍업 줄임
  if (intensityRatio < 0.6) return baseSets.slice(0, 2)
  if (intensityRatio < 0.8) return baseSets.slice(0, 3)
  // 95%+ 도전이면 워밍업 ↑
  if (intensityRatio > 0.95) {
    return [
      ...baseSets,
      { setNumber: 6, weightKg: oneRM * 0.9, weightPercent: 90, reps: 1, restSec: 240, notes: '예열 싱글 2' },
    ]
  }
  return baseSets
}

export function suggestRestForIntensity(percent: number): { sec: number; label: string } {
  if (percent >= 95) return { sec: 300, label: '3~5분' }
  if (percent >= 90) return { sec: 240, label: '3~4분' }
  if (percent >= 85) return { sec: 180, label: '2~3분' }
  if (percent >= 80) return { sec: 120, label: '90초~2분' }
  if (percent >= 70) return { sec: 90,  label: '60~90초' }
  return { sec: 60, label: '60초' }
}

// ─────────────────────────────────────────────────────────────
// RPE 보정 1RM
// ─────────────────────────────────────────────────────────────
// RPE 10 = AMRAP (한 번도 더 X) — 표준 공식
// RPE 9  = 1회 더 가능
// RPE 8  = 2~3회 더 가능
// 보정: reps + (10 - rpe) 로 가정 → 더 무거운 1RM 추정
export function rpeAdjustReps(reps: number, rpe: number): number {
  if (!rpe || rpe < 6 || rpe > 10) return reps
  return reps + (10 - rpe)
}

// ─────────────────────────────────────────────────────────────
// 성별·연령별 보정된 수준 임계값
// ─────────────────────────────────────────────────────────────
// 기본 levels (남성 20대 기준) × 여성 보정 × 연령 보정
export function adjustLevels(
  baseLevels: { 초보: number; 중급: number; 상급: number; 엘리트: number },
  gender: Gender,
  ageBand: AgeBand,
): { 초보: number; 중급: number; 상급: number; 엘리트: number } {
  const ageFactor = AGE_FACTOR[ageBand]
  const genderFactor = gender === 'female' ? FEMALE_FACTOR : 1.0
  const factor = ageFactor * genderFactor
  return {
    초보:    Math.round(baseLevels.초보 * factor * 100) / 100,
    중급:    Math.round(baseLevels.중급 * factor * 100) / 100,
    상급:    Math.round(baseLevels.상급 * factor * 100) / 100,
    엘리트:  Math.round(baseLevels.엘리트 * factor * 100) / 100,
  }
}
