/* ──────────────────────────────────────────────────────
   finance/salary/salaryUtils.ts
   2026년 실수령액·역산·인상 시뮬·시급·연봉표·비과세
   ※ 4대보험 요율은 lib/salaryCalc.ts와 동일 (2026 최신, 27년 만 인상 반영)
   ────────────────────────────────────────────────────── */

/* ─── 2026년 4대보험 요율 (근로자 부담분) ─── */
export const RATES_2026 = {
  nationalPension:    0.0475,    // 국민연금 4.75% (2026년 인상 반영)
  healthInsurance:    0.03595,   // 건강보험 3.595%
  longTermCareRatio:  0.1314,    // 장기요양 = 건강보험료의 13.14%
  employmentIns:      0.009,     // 고용보험 0.9%
}

// 국민연금 기준소득월액 상한 (2026년)
export const NP_MAX_MONTHLY = 6_370_000

/* ─── 비과세 항목 ─── */
export interface NonTaxableItem {
  id: string
  name: string
  monthlyMax: number
  desc: string
  recommended: boolean
}

export const NON_TAXABLE_ITEMS: NonTaxableItem[] = [
  { id: 'meal',      name: '식대',           monthlyMax: 200_000,
    desc: '월 20만원까지 비과세', recommended: true },
  { id: 'transport', name: '자가운전보조금', monthlyMax: 200_000,
    desc: '본인 차량 업무 사용 시 월 20만원',     recommended: false },
  { id: 'childcare', name: '육아수당',       monthlyMax: 200_000,
    desc: '6세 이하 자녀, 월 20만원',            recommended: false },
  { id: 'research',  name: '연구활동비',     monthlyMax: 200_000,
    desc: '연구원 등 특정 직군',                 recommended: false },
]

/* ─── 근로소득세 간이세액표 (2024 국세청 기준, 월 급여) ─── */
interface TaxBracket { min: number; max: number; base: number; rate: number; threshold: number }
const TAX_BRACKETS: TaxBracket[] = [
  { min:         0, max: 1_060_000, base:        0, rate: 0,    threshold:         0 },
  { min: 1_060_000, max: 1_500_000, base:        0, rate: 0.06, threshold: 1_060_000 },
  { min: 1_500_000, max: 3_000_000, base:    26_400, rate: 0.15, threshold: 1_500_000 },
  { min: 3_000_000, max: 4_500_000, base:   251_400, rate: 0.24, threshold: 3_000_000 },
  { min: 4_500_000, max: 8_800_000, base:   611_400, rate: 0.35, threshold: 4_500_000 },
  { min: 8_800_000, max: Infinity,  base: 2_116_400, rate: 0.38, threshold: 8_800_000 },
]

function getMonthlyIncomeTax(taxableMonthly: number, dependents: number, childrenCount: number): number {
  const bracket = TAX_BRACKETS.find(b => taxableMonthly >= b.min && taxableMonthly < b.max)
  if (!bracket) return 0
  let tax = bracket.base + (taxableMonthly - bracket.threshold) * bracket.rate
  // 부양가족 기본공제 (월 환산 근사)
  const deductionPerPerson = taxableMonthly <= 3_000_000 ? 25_000 : 30_000
  tax -= deductionPerPerson * Math.max(1, dependents)
  // 자녀세액공제 (8~20세, 1명당 월 약 12,500원 = 연 15만)
  tax -= childrenCount * 12_500
  return Math.max(0, Math.floor(tax / 10) * 10)
}

/* ─── 메인 입력·결과 ─── */
export interface SalaryInput {
  grossYearly: number
  dependents: number
  childrenCount: number
  nonTaxableMonthly: number
  isInsured: boolean
}

export interface SalaryResult {
  grossYearly: number
  grossMonthly: number
  nonTaxableMonthly: number
  taxableMonthly: number
  pension: number
  health: number
  longTermCare: number
  employment: number
  totalInsurance: number
  incomeTax: number
  localTax: number
  totalTax: number
  totalDeduction: number
  netMonthly: number
  netYearly: number
  takeHomeRate: number  // 실수령률 %
  effectiveRate: number // 공제율 %
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const grossMonthly = Math.floor(input.grossYearly / 12)
  const nonTaxable = Math.max(0, input.nonTaxableMonthly)
  const taxableMonthly = Math.max(0, grossMonthly - nonTaxable)

  // 4대보험 (과세 급여 기준)
  const pension = input.isInsured
    ? Math.floor(Math.min(taxableMonthly, NP_MAX_MONTHLY) * RATES_2026.nationalPension / 10) * 10
    : 0
  const health = input.isInsured
    ? Math.floor(taxableMonthly * RATES_2026.healthInsurance / 10) * 10
    : 0
  const longTermCare = input.isInsured
    ? Math.floor(health * RATES_2026.longTermCareRatio / 10) * 10
    : 0
  const employment = input.isInsured
    ? Math.floor(taxableMonthly * RATES_2026.employmentIns / 10) * 10
    : 0
  const totalInsurance = pension + health + longTermCare + employment

  const incomeTax = getMonthlyIncomeTax(taxableMonthly, input.dependents, input.childrenCount)
  const localTax = Math.floor(incomeTax * 0.1 / 10) * 10
  const totalTax = incomeTax + localTax

  const totalDeduction = totalInsurance + totalTax
  const netMonthly = grossMonthly - totalDeduction
  const netYearly = netMonthly * 12
  const takeHomeRate = grossMonthly > 0 ? (netMonthly / grossMonthly) * 100 : 0
  const effectiveRate = grossMonthly > 0 ? (totalDeduction / grossMonthly) * 100 : 0

  return {
    grossYearly: input.grossYearly,
    grossMonthly,
    nonTaxableMonthly: nonTaxable,
    taxableMonthly,
    pension, health, longTermCare, employment, totalInsurance,
    incomeTax, localTax, totalTax,
    totalDeduction,
    netMonthly,
    netYearly,
    takeHomeRate: Math.round(takeHomeRate * 10) / 10,
    effectiveRate: Math.round(effectiveRate * 10) / 10,
  }
}

/* ─── 역산 (월 실수령 → 세전 연봉) ─── */
export interface ReverseInput {
  targetNetMonthly: number
  dependents: number
  childrenCount: number
  nonTaxableMonthly: number
}

export interface ReverseResult {
  grossYearly: number
  grossMonthly: number
  netMonthly: number
  totalDeduction: number
  takeHomeRate: number
  rangeLow: number   // 협상 안정 범위 하한
  rangeHigh: number
}

export function reverseCalcSalary(input: ReverseInput): ReverseResult | null {
  if (input.targetNetMonthly <= 0) return null
  // 이진 탐색 (단조 증가 함수 가정)
  let low = input.targetNetMonthly * 12
  let high = input.targetNetMonthly * 12 * 2.5
  let safety = 0
  while (high - low > 10_000 && safety++ < 100) {
    const mid = (low + high) / 2
    const r = calcSalary({
      grossYearly: mid,
      dependents: input.dependents,
      childrenCount: input.childrenCount,
      nonTaxableMonthly: input.nonTaxableMonthly,
      isInsured: true,
    })
    if (r.netMonthly < input.targetNetMonthly) low = mid
    else high = mid
  }
  const grossYearly = Math.round(high / 100_000) * 100_000  // 10만원 단위
  const result = calcSalary({
    grossYearly, dependents: input.dependents,
    childrenCount: input.childrenCount,
    nonTaxableMonthly: input.nonTaxableMonthly, isInsured: true,
  })
  return {
    grossYearly,
    grossMonthly: result.grossMonthly,
    netMonthly: result.netMonthly,
    totalDeduction: result.totalDeduction,
    takeHomeRate: result.takeHomeRate,
    rangeLow:  Math.round(grossYearly * 1.012 / 100_000) * 100_000,
    rangeHigh: Math.round(grossYearly * 1.06 / 100_000) * 100_000,
  }
}

/* ─── 인상 시뮬레이션 ─── */
export interface RaiseSimResult {
  percent: number
  newYearly: number
  newNetMonthly: number
  monthlyIncreaseGross: number
  monthlyIncreaseNet: number
  yearlyIncreaseNet: number
  netRaisePercent: number
  extraTax: number
}

export function simulateRaise(
  currentYearly: number, raisePercent: number,
  dependents: number, childrenCount: number, nonTaxableMonthly: number,
): RaiseSimResult {
  const newYearly = Math.round(currentYearly * (1 + raisePercent / 100))
  const baseInput = { dependents, childrenCount, nonTaxableMonthly, isInsured: true as const }
  const cur = calcSalary({ grossYearly: currentYearly, ...baseInput })
  const aft = calcSalary({ grossYearly: newYearly, ...baseInput })
  const monthlyIncreaseNet = aft.netMonthly - cur.netMonthly
  const netRaisePercent = cur.netMonthly > 0
    ? ((aft.netMonthly - cur.netMonthly) / cur.netMonthly) * 100 : 0
  return {
    percent: raisePercent,
    newYearly,
    newNetMonthly: aft.netMonthly,
    monthlyIncreaseGross: aft.grossMonthly - cur.grossMonthly,
    monthlyIncreaseNet,
    yearlyIncreaseNet: monthlyIncreaseNet * 12,
    netRaisePercent: Math.round(netRaisePercent * 10) / 10,
    extraTax: (aft.totalDeduction - cur.totalDeduction) * 12,
  }
}

export const RAISE_OPTIONS = [3, 5, 7, 10, 15, 20, 30, 50]

/* ─── 시급 계산 ─── */
export interface HourlyInput {
  yearly: number
  netYearly: number
  weeklyHours: number
  weeklyOvertime: number
  dailyCommuteMin: number
  vacationDays: number
}

export interface HourlyResult {
  baseHourlyGross: number
  baseHourlyNet: number
  realHourlyNet: number
  perceivedHourlyNet: number
  yearlyTotalHours: number
}

export function calcHourlyWage(input: HourlyInput): HourlyResult {
  const weeksPerYear = 52
  const workingDays = Math.max(1, 5 * weeksPerYear - input.vacationDays)

  const baseMonthlyHours = 209  // 주 40시간 + 주휴
  const baseHourlyGross = input.yearly / 12 / baseMonthlyHours
  const baseHourlyNet = input.netYearly / 12 / baseMonthlyHours

  const totalWeeklyHours = input.weeklyHours + input.weeklyOvertime
  const yearlyHoursWithOvertime = totalWeeklyHours * weeksPerYear * (workingDays / 250)
  const realHourlyNet = yearlyHoursWithOvertime > 0 ? input.netYearly / yearlyHoursWithOvertime : 0

  const dailyCommuteHours = input.dailyCommuteMin / 60
  const totalDailyHours = (totalWeeklyHours / 5) + dailyCommuteHours
  const yearlyTotalHours = Math.max(1, totalDailyHours * workingDays)
  const perceivedHourlyNet = input.netYearly / yearlyTotalHours

  return {
    baseHourlyGross: Math.round(baseHourlyGross),
    baseHourlyNet: Math.round(baseHourlyNet),
    realHourlyNet: Math.round(realHourlyNet),
    perceivedHourlyNet: Math.round(perceivedHourlyNet),
    yearlyTotalHours: Math.round(yearlyTotalHours),
  }
}

// 2026 최저시급 (참고)
export const MIN_HOURLY_WAGE_2026 = 10_320

/* ─── 연봉 분포 ─── */
export interface Percentile {
  percentile: number
  description: string
  color: string
}

export function getSalaryPercentile(yearly: number): Percentile {
  if (yearly >= 100_000_000) return { percentile: 95, description: '상위 5%',     color: '#FFD700' }
  if (yearly >= 80_000_000)  return { percentile: 90, description: '상위 10%',    color: '#FFD700' }
  if (yearly >= 70_000_000)  return { percentile: 80, description: '상위 20%',    color: '#3EFF9B' }
  if (yearly >= 55_000_000)  return { percentile: 65, description: '상위 35%',    color: '#3EFF9B' }
  if (yearly >= 45_000_000)  return { percentile: 50, description: '중위 (50%)',  color: '#3EC8FF' }
  if (yearly >= 35_000_000)  return { percentile: 35, description: '하위 35%',    color: '#3EC8FF' }
  if (yearly >= 25_000_000)  return { percentile: 20, description: '하위 20%',    color: '#FF8C3E' }
  return                     { percentile: 10, description: '하위 10%',    color: '#FF8C3E' }
}

/* ─── 연봉표 생성 ─── */
export interface SalaryTableRow {
  yearly: number
  monthlyGross: number
  monthlyNet: number
  yearlyNet: number
  takeHomeRate: number
}

export function buildSalaryTable(
  dependents: number, childrenCount: number, nonTaxableMonthly: number,
): SalaryTableRow[] {
  const ranges: number[] = [
    18_000_000, 20_000_000, 22_000_000, 24_000_000, 25_000_000,
    26_000_000, 28_000_000, 30_000_000, 32_000_000, 35_000_000,
    38_000_000, 40_000_000, 42_000_000, 45_000_000, 48_000_000,
    50_000_000, 55_000_000, 60_000_000, 65_000_000, 70_000_000,
    75_000_000, 80_000_000, 90_000_000, 100_000_000, 120_000_000,
    150_000_000, 200_000_000,
  ]
  return ranges.map(yearly => {
    const r = calcSalary({
      grossYearly: yearly, dependents, childrenCount,
      nonTaxableMonthly, isInsured: true,
    })
    return {
      yearly,
      monthlyGross: r.grossMonthly,
      monthlyNet: r.netMonthly,
      yearlyNet: r.netYearly,
      takeHomeRate: r.takeHomeRate,
    }
  })
}

/* ─── 월 실수령 목표 표 ─── */
export interface NetTargetRow {
  targetNetMonthly: number
  grossYearly: number
  monthlyGross: number
  takeHomeRate: number
}

export function buildNetTargetTable(
  dependents: number, childrenCount: number, nonTaxableMonthly: number,
): NetTargetRow[] {
  const targets = [2_000_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 5_000_000, 7_000_000]
  return targets.map(t => {
    const r = reverseCalcSalary({
      targetNetMonthly: t, dependents, childrenCount, nonTaxableMonthly,
    })
    return {
      targetNetMonthly: t,
      grossYearly: r?.grossYearly ?? 0,
      monthlyGross: r?.grossMonthly ?? 0,
      takeHomeRate: r?.takeHomeRate ?? 0,
    }
  })
}

/* ─── 포맷 헬퍼 ─── */
export const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

export function formatEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000)
    const man = Math.floor((n % 100_000_000) / 10_000)
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  return Math.floor(n / 10_000).toLocaleString() + '만원'
}

export function parseAmount(s: string): number {
  const cleaned = s.replace(/[^\d]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : 0
}
