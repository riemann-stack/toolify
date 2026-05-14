/* ──────────────────────────────────────────────────────
   health/bmr/bmrUtils.ts
   BMR 4공식, 정밀 활동, 운동일/휴식일, 목표별 칼로리, 안전 검증
   ────────────────────────────────────────────────────── */

export type Gender = 'male' | 'female'

/* ─── BMR 공식 4종 ─── */
export type FormulaId = 'mifflin' | 'harris-benedict' | 'katch-mcardle' | 'cunningham'

export interface BmrFormulaInput {
  gender: Gender
  height: number    // cm
  weight: number    // kg
  age: number
  bodyFat?: number  // %
  leanMass?: number // kg
}

export interface BmrFormulaInfo {
  id: FormulaId
  name: string
  desc: string
  needs: string[]
  accuracy: string
}

export const FORMULAS: BmrFormulaInfo[] = [
  { id: 'mifflin',         name: 'Mifflin-St Jeor', desc: '1990년 개발, 현대 의료계 표준 (가장 정확하다고 평가)',
    needs: ['키', '체중', '나이', '성별'], accuracy: '±5~10%' },
  { id: 'harris-benedict', name: 'Harris-Benedict', desc: '1919년 개발, 가장 널리 사용 (한국 표준)',
    needs: ['키', '체중', '나이', '성별'], accuracy: '±10%' },
  { id: 'katch-mcardle',   name: 'Katch-McArdle',   desc: '체지방률 입력 시 정확. 운동선수에게 권장',
    needs: ['체중', '체지방률'], accuracy: '±3~5% (체지방률 정확 시)' },
  { id: 'cunningham',      name: 'Cunningham',      desc: '제지방량(LBM) 입력 시. 근육량 많은 사람에게 권장',
    needs: ['제지방량(LBM)'], accuracy: '±3~5% (LBM 정확 시)' },
]

export function calcMifflin(input: BmrFormulaInput): number {
  const { gender, height, weight, age } = input
  return gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161
}

export function calcHarris(input: BmrFormulaInput): number {
  const { gender, height, weight, age } = input
  return gender === 'male'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
}

export function calcKatch(input: BmrFormulaInput): number | null {
  if (!input.bodyFat || input.bodyFat <= 0 || input.bodyFat >= 60) return null
  const lbm = input.weight * (1 - input.bodyFat / 100)
  return 370 + 21.6 * lbm
}

export function calcCunningham(input: BmrFormulaInput): number | null {
  if (!input.leanMass || input.leanMass <= 0) return null
  return 500 + 22 * input.leanMass
}

export function calcBMR(input: BmrFormulaInput, formula: FormulaId): number | null {
  if (formula === 'mifflin')         return Math.round(calcMifflin(input))
  if (formula === 'harris-benedict') return Math.round(calcHarris(input))
  if (formula === 'katch-mcardle')   { const v = calcKatch(input); return v ? Math.round(v) : null }
  if (formula === 'cunningham')      { const v = calcCunningham(input); return v ? Math.round(v) : null }
  return null
}

export interface FormulaResult {
  id: FormulaId
  name: string
  bmr: number | null
  available: boolean
  reason?: string
}

export function calcAllFormulas(input: BmrFormulaInput): FormulaResult[] {
  return FORMULAS.map(f => {
    if (f.id === 'katch-mcardle' && (!input.bodyFat || input.bodyFat <= 0))
      return { id: f.id, name: f.name, bmr: null, available: false, reason: '체지방률 입력 필요' }
    if (f.id === 'cunningham' && (!input.leanMass || input.leanMass <= 0))
      return { id: f.id, name: f.name, bmr: null, available: false, reason: '제지방량(LBM) 입력 필요' }
    const v = calcBMR(input, f.id)
    return { id: f.id, name: f.name, bmr: v, available: v !== null }
  })
}

/* ─── 활동 수준 (단순 5단계) ─── */
export interface ActivityFactor {
  id: string
  name: string
  desc: string
  factor: number
}

export const ACTIVITY_FACTORS: ActivityFactor[] = [
  { id: 'sedentary',  name: '거의 안 움직임', desc: '사무직, 운동 없음',     factor: 1.2 },
  { id: 'light',      name: '가벼운 활동',   desc: '주 1~3회 운동',         factor: 1.375 },
  { id: 'moderate',   name: '보통 활동',     desc: '주 3~5회 운동',         factor: 1.55 },
  { id: 'active',     name: '활동적',         desc: '주 6~7회 강도 운동',    factor: 1.725 },
  { id: 'very-active', name: '매우 활동적',   desc: '하루 2회 운동·육체노동', factor: 1.9 },
]

/* ─── 직업 활동량 ─── */
export interface JobActivityLevel {
  id: string
  name: string
  desc: string
  factor: number
}

export const JOB_ACTIVITY_LEVELS: JobActivityLevel[] = [
  { id: 'sedentary', name: '대부분 앉아 있음', desc: '사무직·재택',  factor: 1.0 },
  { id: 'standing',  name: '서 있는 시간 많음', desc: '판매·서비스',  factor: 1.05 },
  { id: 'walking',   name: '많이 걷는 직업',    desc: '교사·간호사',  factor: 1.10 },
  { id: 'physical',  name: '육체노동',          desc: '건설·물류',    factor: 1.20 },
]

/* ─── 운동 강도 ─── */
export interface ExerciseIntensity {
  id: string
  name: string
  desc: string
  kcalPerHour: number
}

export const EXERCISE_INTENSITIES: ExerciseIntensity[] = [
  { id: 'low',       name: '가벼운 강도',     desc: '걷기·요가',         kcalPerHour: 250 },
  { id: 'moderate',  name: '보통 강도',       desc: '조깅·자전거',       kcalPerHour: 400 },
  { id: 'high',      name: '높은 강도',       desc: '러닝·HIIT',         kcalPerHour: 600 },
  { id: 'very-high', name: '매우 높은 강도', desc: '경쟁 스포츠·격투기', kcalPerHour: 800 },
]

/* ─── 정밀 TDEE ─── */
export interface ActivityInput {
  jobLevel: string
  weeklyExercises: number
  exerciseDuration: number  // 분
  exerciseIntensity: string
  dailySteps?: number
}

export interface DetailedTDEE {
  bmr: number
  baseDailyTDEE: number
  dailyStepsBonus: number
  weeklyExerciseKcal: number
  dailyExerciseAvg: number
  avgTDEE: number
  restDayTDEE: number
  exerciseDayTDEE: number
}

export function calcDetailedTDEE(bmr: number, activity: ActivityInput): DetailedTDEE {
  const job = JOB_ACTIVITY_LEVELS.find(j => j.id === activity.jobLevel) ?? JOB_ACTIVITY_LEVELS[0]
  const intensity = EXERCISE_INTENSITIES.find(i => i.id === activity.exerciseIntensity)
                  ?? EXERCISE_INTENSITIES[1]

  const baseDailyTDEE = bmr * job.factor * 1.1
  const stepsBonus = activity.dailySteps && activity.dailySteps > 5000
    ? ((activity.dailySteps - 5000) / 1000) * 50
    : 0
  const exercisePerSession = (activity.exerciseDuration / 60) * intensity.kcalPerHour
  const weeklyExerciseKcal = exercisePerSession * activity.weeklyExercises
  const dailyExerciseAvg = weeklyExerciseKcal / 7

  return {
    bmr,
    baseDailyTDEE: Math.round(baseDailyTDEE),
    dailyStepsBonus: Math.round(Math.max(0, stepsBonus)),
    weeklyExerciseKcal: Math.round(weeklyExerciseKcal),
    dailyExerciseAvg: Math.round(dailyExerciseAvg),
    avgTDEE: Math.round(baseDailyTDEE + Math.max(0, stepsBonus) + dailyExerciseAvg),
    restDayTDEE: Math.round(baseDailyTDEE + Math.max(0, stepsBonus)),
    exerciseDayTDEE: Math.round(baseDailyTDEE + Math.max(0, stepsBonus) + exercisePerSession),
  }
}

/* ─── 활동계수 퀴즈 ─── */
export interface QuizAnswer {
  steps: number          // 1~4
  commute: number        // 1~3
  exerciseFreq: number   // 0~7
  exerciseDuration: number // 분
  sittingHours: number   // 1~4
  weekend: number        // 1~3
}

export interface QuizResult {
  factor: number
  description: string
  range: string
}

export function estimateActivityFactor(quiz: QuizAnswer): QuizResult {
  let score = 1.2

  if (quiz.steps === 2) score += 0.075
  else if (quiz.steps === 3) score += 0.15
  else if (quiz.steps === 4) score += 0.25

  if (quiz.commute === 2) score += 0.05
  else if (quiz.commute === 3) score += 0.075

  const exerciseHoursWeekly = (quiz.exerciseFreq * quiz.exerciseDuration) / 60
  if (exerciseHoursWeekly >= 1 && exerciseHoursWeekly < 3) score += 0.075
  else if (exerciseHoursWeekly >= 3 && exerciseHoursWeekly < 6) score += 0.15
  else if (exerciseHoursWeekly >= 6) score += 0.25

  if (quiz.sittingHours === 4) score -= 0.05

  if (quiz.weekend === 3) score += 0.05

  const factor = Math.min(1.9, Math.max(1.2, score))

  let description = ''
  let range = ''
  if (factor < 1.3)        { description = '거의 안 움직임';      range = '1.2~1.3' }
  else if (factor < 1.45)  { description = '가벼운 활동';         range = '1.3~1.45' }
  else if (factor < 1.6)   { description = '가벼운~보통 사이';    range = '1.45~1.55' }
  else if (factor < 1.7)   { description = '보통 활동';           range = '1.55~1.7' }
  else if (factor < 1.8)   { description = '활동적';              range = '1.7~1.8' }
  else                     { description = '매우 활동적';         range = '1.8~1.9' }

  return { factor: Math.round(factor * 100) / 100, description, range }
}

/* ─── 목표별 칼로리 ─── */
export interface GoalPreset {
  id: string
  name: string
  adjust: number  // TDEE 비율 (음수 감량)
  desc: string
  warning?: boolean
}

export const GOAL_PRESETS: GoalPreset[] = [
  { id: 'lose-fast',   name: '빠른 감량',    adjust: -0.20, desc: '주당 0.6~0.8kg 감량', warning: true },
  { id: 'lose-normal', name: '보통 감량',    adjust: -0.15, desc: '주당 0.4~0.5kg 감량' },
  { id: 'lose-slow',   name: '천천히 감량',  adjust: -0.10, desc: '주당 0.2~0.3kg 감량' },
  { id: 'maintain',    name: '체중 유지',    adjust: 0,     desc: '현재 체중 유지' },
  { id: 'bulk-slow',   name: '근육 증가 (천천히)', adjust: 0.075, desc: '주당 약 0.2kg 증량' },
  { id: 'bulk-normal', name: '근육 증가 (보통)',   adjust: 0.15,  desc: '주당 약 0.4kg 증량' },
  { id: 'race-prep',   name: '대회 준비',    adjust: 0,     desc: '탄수 비율 ↑' },
  { id: 'recovery',    name: '식단 회복기',  adjust: 0.05,  desc: '점진적 회복' },
]

export interface GoalResult {
  id: string
  name: string
  daily: number
  weekly: number
  weeklyChangeKg: number  // 음수: 감량 / 양수: 증량
  warning: boolean
}

export function calcGoalCalories(tdee: number, goalId: string): GoalResult | null {
  const goal = GOAL_PRESETS.find(g => g.id === goalId)
  if (!goal) return null
  const daily = Math.round(tdee * (1 + goal.adjust))
  const dailyDelta = daily - tdee
  const weeklyChangeKg = (dailyDelta * 7) / 7700  // 1kg 체지방 ≈ 7,700kcal
  return {
    id: goal.id,
    name: goal.name,
    daily,
    weekly: daily * 7,
    weeklyChangeKg: Math.round(weeklyChangeKg * 100) / 100,
    warning: !!goal.warning,
  }
}

export function calcAllGoals(tdee: number): GoalResult[] {
  return GOAL_PRESETS.map(g => calcGoalCalories(tdee, g.id)!).filter(Boolean)
}

/* ─── 안전 하한선 ─── */
export const SAFETY_LIMITS: Record<Gender, { min: number; warning: string }> = {
  female: { min: 1200, warning: '여성 권장 최소 1,200kcal' },
  male:   { min: 1500, warning: '남성 권장 최소 1,500kcal' },
}

export interface SafetyResult {
  isWarning: boolean
  isCritical: boolean
  warnings: string[]
}

export function checkSafety(targetKcal: number, gender: Gender, bmr: number, age?: number): SafetyResult {
  const warnings: string[] = []
  const limit = SAFETY_LIMITS[gender]
  let isCritical = false

  if (targetKcal < limit.min) {
    warnings.push(`${limit.warning}보다 낮습니다 (${targetKcal}kcal). 영양 부족·근손실·요요·호르몬 이상 위험.`)
    isCritical = true
  }
  if (targetKcal < bmr) {
    warnings.push(`기초대사량(${Math.round(bmr)}kcal)보다 낮습니다. 장기 지속 시 대사 적응(BMR↓)·건강 위험.`)
    isCritical = true
  }
  if (age !== undefined && age < 18) {
    warnings.push('18세 미만 청소년에게 본 도구는 부적합합니다. 소아청소년과 전문의 상담을 권장합니다.')
    isCritical = true
  }

  return { isWarning: warnings.length > 0, isCritical, warnings }
}

/* ─── 매크로 분배 ─── */
export interface MacroSplit {
  carb: { percent: number; grams: number; kcal: number }
  protein: { percent: number; grams: number; kcal: number }
  fat: { percent: number; grams: number; kcal: number }
}

export function calcMacros(daily: number, ratio: { c: number; p: number; f: number } = { c: 50, p: 25, f: 25 }): MacroSplit {
  const sum = ratio.c + ratio.p + ratio.f
  const c = ratio.c / sum
  const p = ratio.p / sum
  const f = ratio.f / sum
  return {
    carb:    { percent: ratio.c, grams: Math.round(daily * c / 4), kcal: Math.round(daily * c) },
    protein: { percent: ratio.p, grams: Math.round(daily * p / 4), kcal: Math.round(daily * p) },
    fat:     { percent: ratio.f, grams: Math.round(daily * f / 9), kcal: Math.round(daily * f) },
  }
}

/* ─── 주간 플랜 (운동일/휴식일) ─── */
export interface WeeklyPlan {
  restDays: number
  exerciseDays: number
  restDayKcal: number
  exerciseDayKcal: number
  weeklyTotal: number
  weeklyAverage: number
}

export function calcWeeklyPlan(tdee: DetailedTDEE, weeklyExercises: number): WeeklyPlan {
  const restDays = Math.max(0, 7 - weeklyExercises)
  const exerciseDays = Math.min(7, weeklyExercises)
  return {
    restDays,
    exerciseDays,
    restDayKcal: tdee.restDayTDEE,
    exerciseDayKcal: tdee.exerciseDayTDEE,
    weeklyTotal: tdee.restDayTDEE * restDays + tdee.exerciseDayTDEE * exerciseDays,
    weeklyAverage: tdee.avgTDEE,
  }
}

/* ─── 음식 환산 (근사값) ─── */
export const FOOD_REFERENCES = [
  { name: '밥 1공기 (210g)',     kcal: 300 },
  { name: '닭가슴살 100g',       kcal: 165 },
  { name: '사과 1개',            kcal: 95 },
  { name: '바나나 1개',          kcal: 105 },
  { name: '계란 1개',            kcal: 78 },
  { name: '식빵 1쪽',            kcal: 70 },
  { name: '라면 1봉',            kcal: 500 },
  { name: '아메리카노 1잔',      kcal: 5 },
  { name: '치킨 1조각',          kcal: 250 },
  { name: '김밥 1줄',            kcal: 480 },
]

/* ─── 스마트워치 비교 ─── */
export interface SmartwatchInput {
  device: 'apple' | 'garmin' | 'fitbit' | 'other'
  resting: number
  active: number
  period: 'day' | 'week' | 'month'
}

export interface SmartwatchComparison {
  formulaBmr: number
  formulaTdee: number
  watchResting: number
  watchActive: number
  watchTotal: number
  diffBmr: number     // 워치 - 공식
  diffActive: number
  diffTotal: number
  recommendedTdee: number  // 평균
}

export function compareWithWatch(formulaBmr: number, formulaTdee: number, watch: SmartwatchInput): SmartwatchComparison {
  const watchTotal = watch.resting + watch.active
  return {
    formulaBmr, formulaTdee,
    watchResting: watch.resting,
    watchActive: watch.active,
    watchTotal,
    diffBmr: watch.resting - formulaBmr,
    diffActive: watch.active - (formulaTdee - formulaBmr),
    diffTotal: watchTotal - formulaTdee,
    recommendedTdee: Math.round((formulaTdee + watchTotal) / 2),
  }
}

/* ─── localStorage ─── */
export interface BmrRecord {
  id: string
  date: string
  height: number
  weight: number
  age: number
  bmr: number
  tdee: number
  formula: FormulaId
  bodyFat?: number
}

const STORAGE_KEY = 'youtil_bmr_history_v1'

export function loadBmrHistory(): BmrRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveBmrHistory(items: BmrRecord[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 60))) } catch { /* */ }
}

export function newBmrId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
