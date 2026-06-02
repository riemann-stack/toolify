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

/* ─── 근로소득세 (간이세액표 근사 = 연 결정세액 ÷ 12) ───
   기존 구현은 종합소득세 한계세율을 '월 급여'에 그대로 적용해 세금이 ~3배 과대 →
   근로소득공제·과세표준·세액공제를 반영한 연 결정세액 방식으로 교체 (실제 연봉계산기와 정합) */

// 근로소득공제 (총급여 기준, 2024~2026 동일)
function earnedIncomeDeduction(annualGross: number): number {
  let d: number
  if (annualGross <= 5_000_000)        d = annualGross * 0.7
  else if (annualGross <= 15_000_000)  d = 3_500_000 + (annualGross - 5_000_000) * 0.4
  else if (annualGross <= 45_000_000)  d = 7_500_000 + (annualGross - 15_000_000) * 0.15
  else if (annualGross <= 100_000_000) d = 12_000_000 + (annualGross - 45_000_000) * 0.05
  else                                 d = 14_750_000 + (annualGross - 100_000_000) * 0.02
  return Math.min(d, 20_000_000)
}

// 종합소득세 산출세액 (과세표준, 누진공제 방식)
function progressiveTax(taxBase: number): number {
  if (taxBase <= 0)             return 0
  if (taxBase <= 14_000_000)    return taxBase * 0.06
  if (taxBase <= 50_000_000)    return taxBase * 0.15 - 1_260_000
  if (taxBase <= 88_000_000)    return taxBase * 0.24 - 5_760_000
  if (taxBase <= 150_000_000)   return taxBase * 0.35 - 15_440_000
  if (taxBase <= 300_000_000)   return taxBase * 0.38 - 19_940_000
  if (taxBase <= 500_000_000)   return taxBase * 0.40 - 25_940_000
  if (taxBase <= 1_000_000_000) return taxBase * 0.42 - 35_940_000
  return taxBase * 0.45 - 65_940_000
}

// 근로소득세액공제 (산출세액 기준 + 총급여별 한도)
function earnedTaxCredit(computedTax: number, annualGross: number): number {
  const credit = computedTax <= 1_300_000
    ? computedTax * 0.55
    : 715_000 + (computedTax - 1_300_000) * 0.30
  let limit: number
  if (annualGross <= 33_000_000)       limit = 740_000
  else if (annualGross <= 70_000_000)  limit = Math.max(660_000, 740_000 - (annualGross - 33_000_000) * 0.008)
  else if (annualGross <= 120_000_000) limit = Math.max(500_000, 660_000 - (annualGross - 70_000_000) * 0.5)
  else                                 limit = Math.max(200_000, 500_000 - (annualGross - 120_000_000) * 0.5)
  return Math.min(credit, limit)
}

/** 월 원천징수 소득세 근사. annualPension = 국민연금 본인부담 연액(연금보험료공제) */
function getMonthlyIncomeTax(
  taxableMonthly: number, dependents: number, childrenCount: number, annualPension: number,
): number {
  const annualGross = taxableMonthly * 12
  if (annualGross <= 0) return 0
  const earnedIncome = Math.max(0, annualGross - earnedIncomeDeduction(annualGross))
  const personalDeduction = 1_500_000 * Math.max(1, dependents)  // 기본공제 (본인+부양 1인당 150만)
  const taxBase = Math.max(0, earnedIncome - personalDeduction - annualPension)
  const computedTax = progressiveTax(taxBase)
  const credit = earnedTaxCredit(computedTax, annualGross)
  // 자녀세액공제 (8~20세): 1명 25만·2명 55만·3명 이상 55만 + 40만/명
  const childCredit = childrenCount <= 0 ? 0
    : childrenCount === 1 ? 250_000
    : childrenCount === 2 ? 550_000
    : 550_000 + (childrenCount - 2) * 400_000
  const decidedAnnual = Math.max(0, computedTax - credit - childCredit)
  return Math.floor(decidedAnnual / 12 / 10) * 10
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

  const incomeTax = getMonthlyIncomeTax(taxableMonthly, input.dependents, input.childrenCount, pension * 12)
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

  // 공식(법정) 시급 — 주 40시간 + 주휴 = 월 209시간 기준
  const baseAnnualHours = 209 * 12  // 2,508h
  const baseHourlyGross = input.yearly / baseAnnualHours
  const baseHourlyNet = input.netYearly / baseAnnualHours

  // 실질·체감 시급은 '법정 기준시간 위에' 초과근무·출퇴근을 더해 산정 → 더 일할수록 시급 ↓
  // (40시간 초과 근무 + 야근)을 추가 노동시간으로 환산
  const extraWeeklyHours = Math.max(0, input.weeklyHours - 40) + input.weeklyOvertime
  const realAnnualHours = baseAnnualHours + extraWeeklyHours * (workingDays / 5)
  const realHourlyNet = input.netYearly / realAnnualHours

  // 체감 = 실질 + 출퇴근 시간
  const commuteHoursYear = (input.dailyCommuteMin / 60) * workingDays
  const perceivedAnnualHours = realAnnualHours + commuteHoursYear
  const perceivedHourlyNet = input.netYearly / perceivedAnnualHours

  return {
    baseHourlyGross: Math.round(baseHourlyGross),
    baseHourlyNet: Math.round(baseHourlyNet),
    realHourlyNet: Math.round(realHourlyNet),
    perceivedHourlyNet: Math.round(perceivedHourlyNet),
    yearlyTotalHours: Math.round(perceivedAnnualHours),
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
  if (yearly >= 100_000_000) return { percentile: 95, description: '상위 5%',     color: '#CA8A04' }
  if (yearly >= 80_000_000)  return { percentile: 90, description: '상위 10%',    color: '#CA8A04' }
  if (yearly >= 70_000_000)  return { percentile: 80, description: '상위 20%',    color: '#059669' }
  if (yearly >= 55_000_000)  return { percentile: 65, description: '상위 35%',    color: '#059669' }
  if (yearly >= 45_000_000)  return { percentile: 50, description: '중위 (50%)',  color: '#0891B2' }
  if (yearly >= 35_000_000)  return { percentile: 35, description: '하위 35%',    color: '#0891B2' }
  if (yearly >= 25_000_000)  return { percentile: 20, description: '하위 20%',    color: '#EA580C' }
  return                     { percentile: 10, description: '하위 10%',    color: '#EA580C' }
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
