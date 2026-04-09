/**
 * 연봉 실수령액 계산기 — 2026년 기준
 * 근로소득세, 4대보험 공제 계산
 *
 * [2026년 변경사항]
 * - 국민연금: 9.0% → 9.5% (근로자 4.5% → 4.75%) ※27년 만의 인상
 * - 건강보험: 7.09% → 7.19% (근로자 3.545% → 3.595%)
 * - 장기요양: 건강보험료의 12.95% → 13.14%
 * - 고용보험: 0.9% 동결
 * - 국민연금 기준소득월액 상한: 617만원 → 637만원
 */

// ── 4대보험 요율 (2026년 기준, 근로자 부담분) ──
const RATES = {
  nationalPension: 0.0475,   // 국민연금 4.75%
  healthInsurance: 0.03595,  // 건강보험 3.595%
  longTermCareRatio: 0.1314, // 장기요양보험 = 건강보험료 × 13.14%
  employmentIns:   0.009,    // 고용보험 0.9%
}

// 국민연금 기준소득월액 상한: 637만원 (2026년 7월까지)
const NP_MAX_MONTHLY = 6_370_000

// ── 근로소득세 간이세액표 (월 급여 기준, 2024년 국세청 기준) ──
interface TaxBracket {
  min: number
  max: number
  base: number
  rate: number
  threshold: number
}

const TAX_BRACKETS: TaxBracket[] = [
  { min:         0, max: 1_060_000, base:        0, rate: 0,    threshold:         0 },
  { min: 1_060_000, max: 1_500_000, base:        0, rate: 0.06, threshold: 1_060_000 },
  { min: 1_500_000, max: 3_000_000, base:   26_400, rate: 0.15, threshold: 1_500_000 },
  { min: 3_000_000, max: 4_500_000, base:  251_400, rate: 0.24, threshold: 3_000_000 },
  { min: 4_500_000, max: 8_800_000, base:  611_400, rate: 0.35, threshold: 4_500_000 },
  { min: 8_800_000, max: Infinity,  base: 2_116_400, rate: 0.38, threshold: 8_800_000 },
]

function getIncomeTax(monthlyGross: number, dependents: number): number {
  const bracket = TAX_BRACKETS.find(
    b => monthlyGross >= b.min && monthlyGross < b.max
  )
  if (!bracket) return 0

  let tax = bracket.base + (monthlyGross - bracket.threshold) * bracket.rate

  // 부양가족 공제 (본인 포함)
  const deductionPerPerson = monthlyGross <= 3_000_000 ? 25_000 : 30_000
  tax = Math.max(0, tax - deductionPerPerson * dependents)

  return Math.floor(tax / 10) * 10  // 10원 단위 절사
}

export interface SalaryResult {
  annualGross: number
  monthlyGross: number
  nationalPension: number
  healthInsurance: number
  longTermCare: number
  employmentIns: number
  totalInsurance: number
  incomeTax: number
  localIncomeTax: number
  totalTax: number
  totalDeduction: number
  monthlyNet: number
  annualNet: number
  effectiveRate: number
}

export function calcSalary(annualGross: number, dependents: number = 1): SalaryResult {
  const monthlyGross = Math.floor(annualGross / 12)

  // 4대보험
  const npBase        = Math.min(monthlyGross, NP_MAX_MONTHLY)
  const nationalPension = Math.floor(npBase * RATES.nationalPension / 10) * 10
  const healthInsurance = Math.floor(monthlyGross * RATES.healthInsurance / 10) * 10
  const longTermCare    = Math.floor(healthInsurance * RATES.longTermCareRatio / 10) * 10
  const employmentIns   = Math.floor(monthlyGross * RATES.employmentIns / 10) * 10
  const totalInsurance  = nationalPension + healthInsurance + longTermCare + employmentIns

  // 세금
  const incomeTax      = getIncomeTax(monthlyGross, dependents)
  const localIncomeTax = Math.floor(incomeTax * 0.1 / 10) * 10
  const totalTax       = incomeTax + localIncomeTax

  // 합계
  const totalDeduction = totalInsurance + totalTax
  const monthlyNet     = monthlyGross - totalDeduction
  const annualNet      = monthlyNet * 12
  const effectiveRate  = totalDeduction / monthlyGross * 100

  return {
    annualGross,
    monthlyGross,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentIns,
    totalInsurance,
    incomeTax,
    localIncomeTax,
    totalTax,
    totalDeduction,
    monthlyNet,
    annualNet,
    effectiveRate,
  }
}