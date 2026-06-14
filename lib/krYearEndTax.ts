/* 연말정산 환급·추가납부 간이 시뮬레이션 — 2026 기준 단일소스(핵심 공제만).
   재사용: lib/krIncomeTax(progressiveTax·earnedIncomeDeduction·earnedTaxCredit), lib/krInsuranceRates(추정용).
   ※ 핵심 공제만 반영한 추정 — 난임 의료비·중기감면·주택자금·부녀자/한부모 등 미반영(면책). 단위: 원. */

import { progressiveTax, earnedIncomeDeduction, earnedTaxCredit } from './krIncomeTax'
import { INSURANCE_RATES } from './krInsuranceRates'

export const PERSONAL_DEDUCTION = 1_500_000 // 기본공제 1인당 150만
export const ELDERLY_ADD = 1_000_000 // 경로우대(70세↑) 1인 100만
export const DISABLED_ADD = 2_000_000 // 장애인 1인 200만
export const CARD_THRESHOLD_RATE = 0.25 // 신용카드 등 소득공제 문턱 = 총급여 25%
export const CARD_RATE_CREDIT = 0.15 // 신용카드
export const CARD_RATE_CHECK = 0.3 // 체크·현금영수증
export const CARD_RATE_MARKET = 0.4 // 전통시장·대중교통
export const CARD_LIMIT_LOW = 3_000_000 // 총급여 7천만↓ 기본한도
export const CARD_LIMIT_HIGH = 2_500_000 // 총급여 7천만↑ 기본한도
export const CARD_MARKET_EXTRA = 1_000_000 // 전통시장·대중교통 추가한도(간이 합산 100만)
export const PENSION_SAVINGS_LIMIT = 6_000_000 // 연금저축 한도
export const PENSION_TOTAL_LIMIT = 9_000_000 // 연금저축+IRP 합산 한도
export const STANDARD_TAX_CREDIT = 130_000 // 표준세액공제
export const INSURANCE_CREDIT_LIMIT = 1_000_000 // 보장성보험 한도
export const INSURANCE_CREDIT_RATE = 0.12
export const MEDICAL_FLOOR_RATE = 0.03 // 의료비 총급여 3% 문턱
export const MEDICAL_RATE = 0.15
export const EDUCATION_RATE = 0.15
export const DONATION_RATE_LOW = 0.15 // 기부금 1천만↓
export const DONATION_RATE_HIGH = 0.3 // 1천만 초과분
export const DONATION_THRESHOLD = 10_000_000
export const RENT_LIMIT = 10_000_000 // 월세 대상 한도
export const RENT_RATE_LOW = 0.17 // 총급여 5,500만↓
export const RENT_RATE_HIGH = 0.15 // 5,500만~8,000만
export const RENT_GROSS_CAP = 80_000_000 // 월세 세액공제 총급여 상한
export const PENSION_CREDIT_GROSS_CUT = 55_000_000 // 연금/월세 고율 적용 총급여 경계
export const LOCAL_TAX_RATE = 0.1 // 지방소득세 10%

/** 자녀세액공제(8~20세): 1명 25만·2명 55만·3명↑ 55만+40만/추가 */
export function childTaxCredit(children: number): number {
  if (children <= 0) return 0
  if (children === 1) return 250_000
  if (children === 2) return 550_000
  return 550_000 + (children - 2) * 400_000
}

/** 국민연금 본인부담 연액 추정 (입력 없을 때) */
export function estimateNationalPension(gross: number): number {
  const r = INSURANCE_RATES[2026].pension
  const monthlyBase = Math.min(r.maxBase, Math.max(0, gross / 12))
  return Math.round(monthlyBase * (r.employee / 100) * 12)
}

/** 건강·장기요양·고용보험 본인부담 연액 추정 (입력 없을 때). 각 요율은 보수(총급여) 대비 % */
export function estimateOtherInsurance(gross: number): number {
  const r = INSURANCE_RATES[2026]
  const health = gross * (r.health.employee / 100)
  const ltc = gross * (r.ltc.employee / 100) // 장기요양(보수월액 대비 %)
  const unemp = gross * (r.unemp.employee / 100) // 고용보험
  return Math.round(health + ltc + unemp)
}

export interface YearEndInput {
  gross: number              // 총급여(연, 비과세 제외)
  dependents: number         // 부양가족 수(본인 외)
  children: number           // 8~20세 자녀 수
  elderly: number            // 경로우대(70세↑) 수
  disabled: number           // 장애인 수
  creditCard: number         // 신용카드 사용액
  checkCash: number          // 체크·현금영수증
  marketTransit: number      // 전통시장·대중교통
  pensionSavings: number     // 연금저축 납입
  irp: number                // IRP·퇴직연금 추가납입
  insurance: number          // 보장성보험료
  medical: number            // 의료비
  education: number          // 교육비
  donation: number           // 기부금
  monthlyRent: number        // 월세 연납부액
  isHomeless: boolean        // 무주택 세대주(월세공제 요건)
  nationalPension: number | null   // 국민연금 본인부담(입력) — null이면 추정
  otherInsurance: number | null    // 건보·고용 본인부담(입력) — null이면 추정
  prepaidTax: number | null        // 기납부세액 — null이면 추정
  prepaidIncludesLocal: boolean    // 기납부세액에 지방세 포함 여부
}

export interface YearEndResult {
  earnedIncome: number       // 근로소득금액
  personalDeduction: number  // 인적공제
  pensionDeduction: number   // 연금보험료공제
  insuranceDeduction: number // 보험료 특별소득공제
  cardDeduction: number      // 신용카드 등 소득공제
  taxBase: number            // 과세표준
  computedTax: number        // 산출세액
  earnedCredit: number       // 근로소득세액공제
  childCredit: number        // 자녀세액공제
  pensionAccountCredit: number // 연금계좌 세액공제
  specialCredit: number      // 특별세액공제(보험·의료·교육·기부)
  rentCredit: number         // 월세 세액공제
  appliedSpecialBlock: number // max(특별+월세, 표준 13만)
  usedStandard: boolean      // 표준세액공제 적용 여부
  decidedIncomeTax: number   // 결정세액(소득세)
  localTax: number           // 지방소득세
  decidedTotal: number       // 결정세액(총)
  prepaidTotal: number       // 기납부세액(총, 입력 또는 추정)
  prepaidEstimated: boolean  // 기납부 추정 여부
  settlement: number         // 정산(+추가납부 / −환급)
  marginalRatePct: number    // 적용 한계세율(%)
}

/** 신용카드 등 소득공제 (문턱: 공제율 낮은 신용카드부터 차감) */
export function cardDeduction(input: YearEndInput): number {
  const threshold = input.gross * CARD_THRESHOLD_RATE
  const credit = Math.max(0, input.creditCard)
  const check = Math.max(0, input.checkCash)
  const market = Math.max(0, input.marketTransit)
  if (credit + check + market <= threshold) return 0
  let rem = threshold
  const creditEff = Math.max(0, credit - rem); rem = Math.max(0, rem - credit)
  const checkEff = Math.max(0, check - rem); rem = Math.max(0, rem - check)
  const marketEff = Math.max(0, market - rem)
  const general = creditEff * CARD_RATE_CREDIT + checkEff * CARD_RATE_CHECK
  const marketCredit = marketEff * CARD_RATE_MARKET
  const baseLimit = input.gross <= 70_000_000 ? CARD_LIMIT_LOW : CARD_LIMIT_HIGH
  return Math.round(Math.min(general, baseLimit) + Math.min(marketCredit, CARD_MARKET_EXTRA))
}

export function calcYearEnd(input: YearEndInput): YearEndResult {
  const gross = Math.max(0, input.gross)

  // STEP 1. 근로소득금액
  const earnedIncome = Math.max(0, gross - earnedIncomeDeduction(gross))

  // STEP 2. 종합소득공제
  const personalDeduction =
    PERSONAL_DEDUCTION * (1 + Math.max(0, input.dependents)) +
    Math.max(0, input.elderly) * ELDERLY_ADD +
    Math.max(0, input.disabled) * DISABLED_ADD
  const pensionDeduction = input.nationalPension != null ? Math.max(0, input.nationalPension) : estimateNationalPension(gross)
  const insuranceDeduction = input.otherInsurance != null ? Math.max(0, input.otherInsurance) : estimateOtherInsurance(gross)
  const cardDed = cardDeduction(input)
  const taxBase = Math.max(0, earnedIncome - personalDeduction - pensionDeduction - insuranceDeduction - cardDed)

  // STEP 3. 산출세액
  const computedTax = Math.round(progressiveTax(taxBase))

  // STEP 4. 세액공제
  const earnedCredit = Math.round(earnedTaxCredit(computedTax, gross))
  const childCredit = childTaxCredit(Math.max(0, input.children))

  // 연금계좌
  const ps = Math.min(Math.max(0, input.pensionSavings), PENSION_SAVINGS_LIMIT)
  const pensionEligible = Math.min(ps + Math.max(0, input.irp), PENSION_TOTAL_LIMIT)
  const pensionRate = gross <= PENSION_CREDIT_GROSS_CUT ? 0.15 : 0.12
  const pensionAccountCredit = Math.round(pensionEligible * pensionRate)

  // 특별세액공제
  const insuranceCredit = Math.min(Math.max(0, input.insurance), INSURANCE_CREDIT_LIMIT) * INSURANCE_CREDIT_RATE
  const medicalCredit = Math.max(0, Math.max(0, input.medical) - gross * MEDICAL_FLOOR_RATE) * MEDICAL_RATE
  const educationCredit = Math.max(0, input.education) * EDUCATION_RATE
  const dn = Math.max(0, input.donation)
  const donationCredit =
    dn <= DONATION_THRESHOLD ? dn * DONATION_RATE_LOW
    : DONATION_THRESHOLD * DONATION_RATE_LOW + (dn - DONATION_THRESHOLD) * DONATION_RATE_HIGH
  const specialCredit = Math.round(insuranceCredit + medicalCredit + educationCredit + donationCredit)

  // 월세
  let rentCredit = 0
  if (input.isHomeless && gross <= RENT_GROSS_CAP && input.monthlyRent > 0) {
    const rentRate = gross <= PENSION_CREDIT_GROSS_CUT ? RENT_RATE_LOW : RENT_RATE_HIGH
    rentCredit = Math.round(Math.min(Math.max(0, input.monthlyRent), RENT_LIMIT) * rentRate)
  }

  // 특별세액공제+월세 vs 표준 13만 (간이 비교)
  const itemized = specialCredit + rentCredit
  const usedStandard = itemized < STANDARD_TAX_CREDIT
  const appliedSpecialBlock = Math.max(itemized, STANDARD_TAX_CREDIT)

  const decidedIncomeTax = Math.max(
    0,
    computedTax - earnedCredit - childCredit - pensionAccountCredit - appliedSpecialBlock,
  )
  const localTax = Math.round(decidedIncomeTax * LOCAL_TAX_RATE)
  const decidedTotal = decidedIncomeTax + localTax

  // STEP 5. 기납부세액 비교
  let prepaidTotal: number
  let prepaidEstimated = false
  if (input.prepaidTax != null) {
    prepaidTotal = input.prepaidIncludesLocal
      ? Math.max(0, input.prepaidTax)
      : Math.round(Math.max(0, input.prepaidTax) * (1 + LOCAL_TAX_RATE))
  } else {
    prepaidTotal = estimatePrepaidWithholding(input)
    prepaidEstimated = true
  }
  const settlement = decidedTotal - prepaidTotal // +추가납부 / −환급

  // 한계세율(표기용)
  const marginalRatePct = Math.round((taxBase > 0 ? progressiveTax(taxBase + 1) - progressiveTax(taxBase) : 0.06) * 100)

  return {
    earnedIncome, personalDeduction, pensionDeduction, insuranceDeduction, cardDeduction: cardDed,
    taxBase, computedTax, earnedCredit, childCredit, pensionAccountCredit, specialCredit, rentCredit,
    appliedSpecialBlock, usedStandard, decidedIncomeTax, localTax, decidedTotal,
    prepaidTotal, prepaidEstimated, settlement, marginalRatePct,
  }
}

/** 기납부세액 추정: 선택공제(신용카드·연금계좌·특별·월세) 제외, 의무공제만 반영한 결정세액(총).
    간이세액표 원천징수 근사. */
export function estimatePrepaidWithholding(input: YearEndInput): number {
  const gross = Math.max(0, input.gross)
  const earnedIncome = Math.max(0, gross - earnedIncomeDeduction(gross))
  const personalDeduction = PERSONAL_DEDUCTION * (1 + Math.max(0, input.dependents))
  const pension = input.nationalPension != null ? Math.max(0, input.nationalPension) : estimateNationalPension(gross)
  const other = input.otherInsurance != null ? Math.max(0, input.otherInsurance) : estimateOtherInsurance(gross)
  const taxBase = Math.max(0, earnedIncome - personalDeduction - pension - other)
  const computedTax = Math.round(progressiveTax(taxBase))
  const earnedCredit = Math.round(earnedTaxCredit(computedTax, gross))
  const childCredit = childTaxCredit(Math.max(0, input.children))
  // 간이세액표 원천징수는 표준세액공제 수준을 반영한다고 보고 13만 포함
  const income = Math.max(0, computedTax - earnedCredit - childCredit - STANDARD_TAX_CREDIT)
  return Math.round(income * (1 + LOCAL_TAX_RATE))
}
