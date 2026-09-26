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
// 반복수 → 1RM 배수 (1RM = 들어 올린 전체 중량 × 배수)
// 1회는 정의상 그 무게가 곧 1RM이라 모든 공식에서 1.0으로 고정
// ─────────────────────────────────────────────────────────────
export type RepFormulaKey = 'epley' | 'brzycki' | 'lombardi' | 'oconner'
export const REP_FACTOR: Record<RepFormulaKey, (r: number) => number> = {
  epley:    (r) => r <= 1 ? 1 : 1 + r / 30,
  brzycki:  (r) => r <= 1 ? 1 : r < 37 ? 36 / (37 - r) : 1,
  lombardi: (r) => r <= 1 ? 1 : Math.pow(r, 0.1),
  oconner:  (r) => r <= 1 ? 1 : 1 + r / 40,
}
// 'auto' = 4개 공식 평균 — 1RM 평균과 같은 배수라 역산(반복수별 중량)에도 그대로 쓴다
export function repFactor(key: RepFormulaKey | 'auto', r: number): number {
  if (key !== 'auto') return REP_FACTOR[key](r)
  return (REP_FACTOR.epley(r) + REP_FACTOR.brzycki(r) + REP_FACTOR.lombardi(r) + REP_FACTOR.oconner(r)) / 4
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

// noBar: 맨몸·기타 종목처럼 바벨을 쓰지 않을 때 — 빈 봉 세트 없이 %만으로 세트 구성
export function generateWarmup(oneRM: number, workingPercent: number, opts: { noBar?: boolean } = {}): WarmupSet[] {
  if (!oneRM || oneRM <= 0) return []
  const intensityRatio = workingPercent / 100
  const noBar = opts.noBar === true

  const baseSets: WarmupSet[] = [
    { setNumber: 1, weightKg: 20,         weightPercent: 20 / oneRM * 100, reps: 10, restSec: 60,  notes: '빈 봉 (폼 워밍업)' },
    { setNumber: 2, weightKg: oneRM * 0.4, weightPercent: 40, reps: 8, restSec: 60 },
    { setNumber: 3, weightKg: oneRM * 0.6, weightPercent: 60, reps: 5, restSec: 90 },
    { setNumber: 4, weightKg: oneRM * 0.7, weightPercent: 70, reps: 3, restSec: 120 },
    { setNumber: 5, weightKg: oneRM * 0.8, weightPercent: 80, reps: 1, restSec: 180, notes: '예열 싱글' },
  ]

  // 본 세트 강도에 따라 워밍업 세트 수 조절
  let selected: WarmupSet[]
  if (intensityRatio < 0.6) selected = baseSets.slice(0, 2)
  else if (intensityRatio < 0.8) selected = baseSets.slice(0, 3)
  else if (intensityRatio >= 0.95) {
    // 95%+ 도전이면 워밍업 ↑
    selected = [
      ...baseSets,
      { setNumber: 6, weightKg: oneRM * 0.9, weightPercent: 90, reps: 1, restSec: 240, notes: '예열 싱글 2' },
    ]
  } else selected = baseSets

  // 가벼운 1RM 보정: 빈 봉(20kg)보다 가벼운 % 세트는 봉에 실을 수 없어 물리적으로 불가 →
  // 빈 봉 미만 세트 제거 + 중량이 단조 증가하는 세트만 남기고 번호 재부여.
  // 빈 봉 세트 자체도 본 세트 중량보다 가벼울 때만 넣는다(1RM 20kg 이하에서 봉이 1RM을 넘던 문제).
  const BAR_KG = 20
  const workingKg = oneRM * intensityRatio
  const out: WarmupSet[] = []
  let prevKg = 0
  for (const set of selected) {
    const isBar = set.weightKg === BAR_KG && set.setNumber === 1
    if (isBar && (noBar || BAR_KG >= workingKg - 0.001)) continue
    if (!isBar && !noBar && set.weightKg < BAR_KG - 0.001) continue
    if (set.weightKg <= prevKg + 0.001) continue
    out.push(set)
    prevKg = set.weightKg
  }
  return out.map((set, i) => ({ ...set, setNumber: i + 1 }))
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
