/* ──────────────────────────────────────────────────────
   health/weightloss/weightLossUtils.ts
   안전 감량 속도, BMI 체크, 목표일 역산, 정체기, 운동 시간, 매크로
   ────────────────────────────────────────────────────── */

export type Gender = 'male' | 'female'
export type Severity = 'safe' | 'caution' | 'warning' | 'danger'

/* ─── 안전 감량 속도 ─── */
export interface SpeedOption {
  id: string
  name: string
  percentPerWeek: number
  desc: string
  stars: 0 | 1 | 2 | 3
  severity: Severity
  color: string
}

export const SAFE_SPEEDS: SpeedOption[] = [
  { id: 'very-slow',  name: '매우 천천히', percentPerWeek: 0.3, desc: '체중의 0.3%/주 · 가장 안전 · 근육 유지 ★★★', stars: 3, severity: 'safe',    color: '#059669' },
  { id: 'slow',       name: '안정 감량',   percentPerWeek: 0.5, desc: '체중의 0.5%/주 · 권장 표준 ★★★',           stars: 3, severity: 'safe',    color: '#059669' },
  { id: 'normal',     name: '보통 감량',   percentPerWeek: 0.7, desc: '체중의 0.7%/주 · 활동량 충분 시',          stars: 2, severity: 'caution', color: '#A16207' },
  { id: 'fast',       name: '적극 감량',   percentPerWeek: 1.0, desc: '체중의 1.0%/주 · 단기만 권장 ⚠️',         stars: 1, severity: 'warning', color: '#EA580C' },
  { id: 'aggressive', name: '매우 빠른',   percentPerWeek: 1.5, desc: '체중의 1.5%/주 · 의료 감독 시만 ⚠️⚠️',    stars: 0, severity: 'danger',  color: '#DC2626' },
]

/* ─── 운동 — METs 기반 ─── */
export interface ExerciseInfo {
  id: string
  name: string
  icon: string
  met: number
}

// METs 표준값 (Compendium of Physical Activities 참고)
export const EXERCISES: ExerciseInfo[] = [
  { id: 'walking',        name: '걷기 (4km/h)',        icon: '🚶', met: 3.5 },
  { id: 'fast-walk',      name: '빠른 걷기 (6km/h)',    icon: '🚶‍♂️', met: 5.0 },
  { id: 'jogging',        name: '조깅 (8km/h)',        icon: '🏃', met: 8.0 },
  { id: 'running-10',     name: '러닝 (10km/h)',       icon: '🏃‍♂️', met: 10.0 },
  { id: 'running-12',     name: '빠른 러닝 (12km/h)',  icon: '💨', met: 11.5 },
  { id: 'cycling-easy',   name: '자전거 (느린)',       icon: '🚲', met: 6.0 },
  { id: 'cycling-fast',   name: '자전거 (빠른)',       icon: '🚴', met: 8.5 },
  { id: 'swimming',       name: '수영 (자유형)',       icon: '🏊', met: 8.0 },
  { id: 'weight-lifting', name: '근력운동',           icon: '🏋️', met: 4.0 },
  { id: 'hiking',         name: '등산',               icon: '⛰️', met: 7.0 },
  { id: 'yoga',           name: '요가',               icon: '🧘', met: 3.0 },
  { id: 'hiit',           name: 'HIIT',               icon: '⚡', met: 10.5 },
]

/* METs 공식: kcal/h = METs × 체중(kg) × 1.05 */
export function exerciseKcalPerHour(metsValue: number, weightKg: number): number {
  return metsValue * weightKg * 1.05
}

export function exerciseTimeFor(targetKcal: number, ex: ExerciseInfo, weightKg: number): {
  minutes: number; hours: number
} {
  const kcalPerHour = exerciseKcalPerHour(ex.met, weightKg)
  if (kcalPerHour <= 0) return { minutes: 0, hours: 0 }
  const hours = targetKcal / kcalPerHour
  return {
    minutes: Math.round(hours * 60),
    hours: Math.round(hours * 100) / 100,
  }
}

/* ─── 단백질 목표 ─── */
export interface ProteinTarget {
  id: string
  name: string
  gPerKg: number
  desc: string
  recommended: boolean
}

export const PROTEIN_TARGETS: ProteinTarget[] = [
  { id: 'normal',  name: '일반',     gPerKg: 1.2, desc: '체중 유지·가벼운 운동',           recommended: false },
  { id: 'active',  name: '활동적',   gPerKg: 1.6, desc: '감량 + 근력 운동',                recommended: true  },
  { id: 'athlete', name: '운동선수', gPerKg: 2.0, desc: '강한 감량 (근손실 방지)',         recommended: false },
  { id: 'extreme', name: '대회 준비', gPerKg: 2.4, desc: '매우 강한 감량 (단기, 전문가)', recommended: false },
]

/* ─── 위험 임계값 ─── */
export const DANGER_THRESHOLDS = {
  weeklyLossPercent:  1.0,
  dailyDeficitMax:    1000,
  tdeeDeficitPercent: 30,
  minDailyKcalFemale: 1200,
  minDailyKcalMale:   1500,
  underBMIWarn:       18.5,
}

const KCAL_PER_KG = 7700  // 1kg 체지방 ≈ 7,700kcal

/* ─── BMI ─── */
export function calcBMI(height: number, weight: number): number {
  if (height <= 0) return 0
  const m = height / 100
  return weight / (m * m)
}

export function bmiCategoryName(bmi: number): { name: string; color: string; isUnder: boolean } {
  if (bmi < 18.5) return { name: '저체중', color: '#0891B2', isUnder: true }
  if (bmi < 23.0) return { name: '정상',   color: '#059669', isUnder: false }
  if (bmi < 25.0) return { name: '과체중', color: '#A16207', isUnder: false }
  if (bmi < 30.0) return { name: '비만 1단계', color: '#EA580C', isUnder: false }
  return { name: '비만 2~3단계', color: '#DC2626', isUnder: false }
}

/* ─── 메인 입력·결과 타입 ─── */
export interface WeightLossInput {
  currentWeight: number
  targetWeight: number
  height: number
  gender: Gender
  age: number
  tdee: number
  speedId: string
  startDate: string  // YYYY-MM-DD
}

export interface SafetyResult {
  isSafe: boolean
  warnings: string[]
  severity: Severity
}

export interface ProgressionPoint {
  week: number
  weight: number
  isMaintenance: boolean
}

export interface WeightLossPlan {
  totalLossKg: number
  weeksRequired: number
  daysRequired: number
  endDate: string
  dailyDeficit: number
  weeklyLossKg: number
  weeklyLossPercent: number
  targetDailyCalories: number
  weeklyProgression: ProgressionPoint[]
  currentBMI: number
  targetBMI: number
  safety: SafetyResult
}

/* ─── 날짜 헬퍼 ─── */
export function addDays(date: string, days: number): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
export function addWeeks(date: string, weeks: number): string {
  return addDays(date, Math.round(weeks * 7))
}
export function daysBetween(a: string, b: string): number {
  const da = new Date(a); const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0
  return Math.round((db.getTime() - da.getTime()) / (24 * 60 * 60 * 1000))
}
export function todayISO(): string {
  // 로컬(사용자 시간대) 기준 날짜 — toISOString()은 UTC라 자정 전후로 하루가 밀릴 수 있음
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function formatDateKo(date: string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

/* ─── 진행률 그래프 ─── */
export type PlateauMode = 'linear' | 'realistic' | 'with-maintenance'

export function generateProgression(
  input: WeightLossInput,
  weeklyLossKg: number,
  totalWeeks: number,
  options: { plateauMode: PlateauMode; maintenanceInterval?: number } = { plateauMode: 'realistic' },
): ProgressionPoint[] {
  const totalLoss = input.currentWeight - input.targetWeight

  // realistic: 앞 2주 +30%·마지막 4주 −15% 형태(수분 변동·정체기)를 유지하되,
  // 누적 손실을 정규화해 정확히 totalWeeks 주차에 목표 체중에 도달하도록 맞춘다
  // (그래프 종료 시점 = 표기된 소요 기간/종료일과 일치).
  if (options.plateauMode === 'realistic' && totalWeeks > 0 && totalWeeks <= 120 && totalLoss > 0) {
    const raw: number[] = []
    for (let w = 1; w <= totalWeeks; w++) {
      let m = 1
      if (w <= 2) m = 1.3
      else if (w > totalWeeks - 4) m = 0.85
      raw.push(weeklyLossKg * m)
    }
    const sumRaw = raw.reduce((acc, v) => acc + v, 0)
    const k = sumRaw > 0 ? totalLoss / sumRaw : 1
    const out: ProgressionPoint[] = [
      { week: 0, weight: Math.round(input.currentWeight * 100) / 100, isMaintenance: false },
    ]
    let weight = input.currentWeight
    for (let w = 1; w <= totalWeeks; w++) {
      weight -= raw[w - 1] * k
      if (w === totalWeeks) weight = input.targetWeight  // 마지막 주차는 정확히 목표 체중
      out.push({ week: w, weight: Math.round(weight * 100) / 100, isMaintenance: false })
    }
    return out
  }

  // linear / with-maintenance (등속 또는 유지기 삽입)
  const out: ProgressionPoint[] = []
  let currentWeight = input.currentWeight
  const cap = Math.min(120, totalWeeks + 4)

  for (let w = 0; w <= cap; w++) {
    let isMaintenance = false

    if (options.plateauMode === 'with-maintenance' && options.maintenanceInterval && options.maintenanceInterval > 0) {
      isMaintenance = w > 0 && w % options.maintenanceInterval === 0
    }

    if (!isMaintenance && w > 0) currentWeight -= weeklyLossKg

    out.push({
      week: w,
      weight: Math.round(currentWeight * 100) / 100,
      isMaintenance,
    })

    if (currentWeight <= input.targetWeight) break
  }
  return out
}

/* ─── 안전 검증 ─── */
export function checkSafety(
  input: WeightLossInput,
  dailyDeficit: number,
  weeklyLossKg: number,
  targetDailyCalories: number,
): SafetyResult {
  const warnings: string[] = []
  let severity: Severity = 'safe'

  const bumpUp = (s: Severity) => {
    const order: Severity[] = ['safe', 'caution', 'warning', 'danger']
    if (order.indexOf(s) > order.indexOf(severity)) severity = s
  }

  if (input.age < 18) {
    warnings.push('18세 미만 청소년은 본 도구가 부적합합니다. 소아청소년과 전문의 상담을 권장합니다.')
    bumpUp('danger')
  }

  const weeklyPct = (weeklyLossKg / input.currentWeight) * 100
  if (weeklyPct > DANGER_THRESHOLDS.weeklyLossPercent) {
    warnings.push(`주당 체중 ${weeklyPct.toFixed(1)}% 감량은 권장 한도(1.0%)를 초과합니다.`)
    bumpUp(weeklyPct > 1.5 ? 'danger' : 'warning')
  }

  if (dailyDeficit > DANGER_THRESHOLDS.dailyDeficitMax) {
    warnings.push(`하루 적자 ${Math.round(dailyDeficit)}kcal는 권장 한도(1,000kcal)를 초과합니다.`)
    bumpUp('danger')
  }

  if (input.tdee > 0) {
    const tdeePct = (dailyDeficit / input.tdee) * 100
    if (tdeePct > DANGER_THRESHOLDS.tdeeDeficitPercent) {
      warnings.push(`TDEE 대비 ${tdeePct.toFixed(0)}% 적자는 권장 한도(25~30%)를 초과합니다.`)
      bumpUp('warning')
    }
  }

  const minKcal = input.gender === 'male' ? DANGER_THRESHOLDS.minDailyKcalMale : DANGER_THRESHOLDS.minDailyKcalFemale
  if (targetDailyCalories < minKcal) {
    warnings.push(`목표 섭취량 ${Math.round(targetDailyCalories)}kcal는 권장 최소(${minKcal}kcal · ${input.gender === 'male' ? '남성' : '여성'})보다 낮습니다.`)
    bumpUp('danger')
  }

  const targetBMI = calcBMI(input.height, input.targetWeight)
  if (targetBMI < DANGER_THRESHOLDS.underBMIWarn) {
    warnings.push(`목표 체중의 BMI ${targetBMI.toFixed(1)}은 저체중 범위입니다. 건강상 권장하지 않습니다.`)
    bumpUp('warning')
  }

  return { isSafe: severity === 'safe', warnings, severity }
}

/* ─── 메인 계획 ─── */
export function calcWeightLossPlan(input: WeightLossInput, plateauMode: PlateauMode = 'realistic'): WeightLossPlan | null {
  const totalLossKg = input.currentWeight - input.targetWeight
  if (totalLossKg <= 0) return null
  const speed = SAFE_SPEEDS.find(s => s.id === input.speedId) ?? SAFE_SPEEDS[1]

  const weeklyLossKg = (input.currentWeight * speed.percentPerWeek) / 100
  if (weeklyLossKg <= 0) return null
  const weeksRequired = Math.ceil(totalLossKg / weeklyLossKg)
  const daysRequired = weeksRequired * 7
  const dailyDeficit = (weeklyLossKg * KCAL_PER_KG) / 7
  const targetDailyCalories = input.tdee - dailyDeficit
  const endDate = addDays(input.startDate, daysRequired)
  const weeklyProgression = generateProgression(input, weeklyLossKg, weeksRequired, { plateauMode })
  const currentBMI = calcBMI(input.height, input.currentWeight)
  const targetBMI = calcBMI(input.height, input.targetWeight)
  const safety = checkSafety(input, dailyDeficit, weeklyLossKg, targetDailyCalories)

  return {
    totalLossKg: Math.round(totalLossKg * 100) / 100,
    weeksRequired,
    daysRequired,
    endDate,
    dailyDeficit: Math.round(dailyDeficit),
    weeklyLossKg: Math.round(weeklyLossKg * 100) / 100,
    weeklyLossPercent: Math.round(speed.percentPerWeek * 100) / 100,
    targetDailyCalories: Math.round(targetDailyCalories),
    weeklyProgression,
    currentBMI: Math.round(currentBMI * 10) / 10,
    targetBMI: Math.round(targetBMI * 10) / 10,
    safety,
  }
}

/* ─── 목표일 역산 ─── */
export interface TargetDateResult {
  totalDays: number
  totalWeeks: number
  weeklyLossKg: number
  weeklyLossPercent: number
  dailyDeficit: number
  targetDailyCalories: number
  feasibility: 'safe' | 'caution' | 'aggressive' | 'dangerous'
  isFeasible: boolean
  warnings: string[]
}

const FEAS_ORDER: TargetDateResult['feasibility'][] = ['safe', 'caution', 'aggressive', 'dangerous']

export function calcDeficitForTargetDate(
  input: Omit<WeightLossInput, 'speedId'>,
  targetDate: string,
): TargetDateResult | null {
  const totalLossKg = input.currentWeight - input.targetWeight
  if (totalLossKg <= 0) return null
  const totalDays = daysBetween(input.startDate, targetDate)
  if (totalDays <= 0) return null
  const totalWeeks = totalDays / 7
  const weeklyLossKg = totalLossKg / totalWeeks
  const weeklyLossPercent = (weeklyLossKg / input.currentWeight) * 100
  const dailyDeficit = (weeklyLossKg * KCAL_PER_KG) / 7
  const targetDailyCalories = input.tdee - dailyDeficit

  // 속도 기반 계획과 동일한 안전 하한선을 목표일 역산에도 적용 (탭 간 안전도 일관).
  // 후보 심각도를 모아 가장 높은 것을 채택 (클로저 변이 대신 max-index).
  const feasCandidates: TargetDateResult['feasibility'][] = ['safe']
  if (weeklyLossPercent > 1.2)      feasCandidates.push('dangerous')
  else if (weeklyLossPercent > 1.0) feasCandidates.push('aggressive')
  else if (weeklyLossPercent > 0.5) feasCandidates.push('caution')

  const warnings: string[] = []
  if (input.age < 18) {
    warnings.push('18세 미만 청소년은 본 도구가 부적합합니다. 소아청소년과 전문의 상담을 권장합니다.')
    feasCandidates.push('dangerous')
  }
  if (dailyDeficit > DANGER_THRESHOLDS.dailyDeficitMax) {
    warnings.push(`하루 적자 ${Math.round(dailyDeficit)}kcal는 권장 한도(1,000kcal)를 초과합니다.`)
    feasCandidates.push('dangerous')
  }
  const minKcal = input.gender === 'male' ? DANGER_THRESHOLDS.minDailyKcalMale : DANGER_THRESHOLDS.minDailyKcalFemale
  if (targetDailyCalories < minKcal) {
    warnings.push(`목표 섭취량 ${Math.round(targetDailyCalories)}kcal는 권장 최소(${minKcal}kcal · ${input.gender === 'male' ? '남성' : '여성'})보다 낮습니다.`)
    feasCandidates.push('dangerous')
  }
  if (input.tdee > 0 && (dailyDeficit / input.tdee) * 100 > DANGER_THRESHOLDS.tdeeDeficitPercent) {
    warnings.push(`TDEE 대비 ${Math.round((dailyDeficit / input.tdee) * 100)}% 적자는 권장 한도(25~30%)를 초과합니다.`)
    feasCandidates.push('aggressive')
  }
  const targetBMI = calcBMI(input.height, input.targetWeight)
  if (targetBMI < DANGER_THRESHOLDS.underBMIWarn) {
    warnings.push(`목표 체중의 BMI ${targetBMI.toFixed(1)}은 저체중 범위입니다. 건강상 권장하지 않습니다.`)
    feasCandidates.push('aggressive')
  }
  const feasibility = FEAS_ORDER[Math.max(...feasCandidates.map(f => FEAS_ORDER.indexOf(f)))]

  return {
    totalDays,
    totalWeeks: Math.round(totalWeeks * 10) / 10,
    weeklyLossKg: Math.round(weeklyLossKg * 100) / 100,
    weeklyLossPercent: Math.round(weeklyLossPercent * 100) / 100,
    dailyDeficit: Math.round(dailyDeficit),
    targetDailyCalories: Math.round(targetDailyCalories),
    feasibility,
    isFeasible: feasibility !== 'dangerous',
    warnings,
  }
}

/* ─── 대안 기간 자동 추천 (목표일 위험 시) ─── */
export interface AlternativeWeeks {
  weeks: number
  weeklyLossKg: number
  weeklyLossPercent: number
  dailyDeficit: number
  feasibility: TargetDateResult['feasibility']
  isRecommended: boolean
}

export function calcAlternatives(
  totalLossKg: number, currentWeight: number, tdee: number, baseWeeks: number,
): AlternativeWeeks[] {
  const candidates = [baseWeeks, Math.round(baseWeeks * 1.5), Math.round(baseWeeks * 2), Math.round(baseWeeks * 2.5)]
  const seen = new Set<number>()
  const out: AlternativeWeeks[] = []
  for (const w of candidates) {
    if (w <= 0 || seen.has(w)) continue
    seen.add(w)
    const weeklyLossKg = totalLossKg / w
    const weeklyLossPercent = (weeklyLossKg / currentWeight) * 100
    const dailyDeficit = (weeklyLossKg * KCAL_PER_KG) / 7
    let feasibility: TargetDateResult['feasibility'] = 'safe'
    if (weeklyLossPercent > 1.2)      feasibility = 'dangerous'
    else if (weeklyLossPercent > 1.0) feasibility = 'aggressive'
    else if (weeklyLossPercent > 0.5) feasibility = 'caution'
    out.push({
      weeks: w,
      weeklyLossKg: Math.round(weeklyLossKg * 100) / 100,
      weeklyLossPercent: Math.round(weeklyLossPercent * 100) / 100,
      dailyDeficit: Math.round(dailyDeficit),
      feasibility,
      isRecommended: feasibility === 'safe' || feasibility === 'caution',
    })
  }
  return out
}

/* ─── 식단 vs 운동 분리 ─── */
export interface SplitResult {
  dietDailyDeficit: number
  exerciseDailyDeficit: number
  weeklyExerciseKcal: number
  perSessionKcal: number
  exerciseFreq: number
}

export function splitDietExercise(
  totalDailyDeficit: number, dietPortion: number, exerciseFreqPerWeek: number,
): SplitResult {
  const portion = Math.max(0, Math.min(1, dietPortion))
  const dietDailyDeficit = totalDailyDeficit * portion
  const exerciseDailyDeficit = totalDailyDeficit * (1 - portion)
  const weeklyExerciseKcal = exerciseDailyDeficit * 7
  const perSessionKcal = exerciseFreqPerWeek > 0 ? weeklyExerciseKcal / exerciseFreqPerWeek : 0
  return {
    dietDailyDeficit: Math.round(dietDailyDeficit),
    exerciseDailyDeficit: Math.round(exerciseDailyDeficit),
    weeklyExerciseKcal: Math.round(weeklyExerciseKcal),
    perSessionKcal: Math.round(perSessionKcal),
    exerciseFreq: exerciseFreqPerWeek,
  }
}

/* ─── 매크로 분배 ─── */
export interface Macros {
  protein: { g: number; kcal: number; percent: number }
  fat:     { g: number; kcal: number; percent: number }
  carb:    { g: number; kcal: number; percent: number }
}

export function calcMacros(
  targetCalories: number, weight: number, proteinPerKg: number = 1.6, fatRatio: number = 0.25,
): Macros {
  const proteinG = weight * proteinPerKg
  const proteinKcal = proteinG * 4
  const fatKcal = targetCalories * fatRatio
  const fatG = fatKcal / 9
  const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal)
  const carbG = carbKcal / 4
  return {
    protein: { g: Math.round(proteinG), kcal: Math.round(proteinKcal), percent: Math.round((proteinKcal / targetCalories) * 100) },
    fat:     { g: Math.round(fatG),     kcal: Math.round(fatKcal),     percent: Math.round((fatKcal / targetCalories) * 100) },
    carb:    { g: Math.round(carbG),    kcal: Math.round(carbKcal),    percent: Math.round((carbKcal / targetCalories) * 100) },
  }
}

/* ─── 끼니별 분배 ─── */
export interface MealSplit {
  name: string
  ratio: number
  protein: number
  carb: number
  fat: number
  kcal: number
}

export function calcMealSplit(macros: Macros, totalKcal: number): MealSplit[] {
  const meals: { name: string; ratio: number }[] = [
    { name: '아침',  ratio: 0.25 },
    { name: '점심',  ratio: 0.35 },
    { name: '저녁',  ratio: 0.30 },
    { name: '간식',  ratio: 0.10 },
  ]
  return meals.map(m => ({
    name: m.name,
    ratio: m.ratio,
    protein: Math.round(macros.protein.g * m.ratio),
    carb:    Math.round(macros.carb.g * m.ratio),
    fat:     Math.round(macros.fat.g * m.ratio),
    kcal:    Math.round(totalKcal * m.ratio),
  }))
}
