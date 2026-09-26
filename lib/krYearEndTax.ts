/* 연말정산 환급·추가납부 간이 시뮬레이션 — 2026 기준 단일소스(핵심 공제만).
   재사용: lib/krIncomeTax(progressiveTax·earnedIncomeDeduction·earnedTaxCredit), lib/krInsuranceRates(추정용).
   ※ 핵심 공제만 반영한 추정 — 난임 의료비·중기감면·주택자금·부녀자/한부모 등 미반영(면책). 단위: 원. */

import { progressiveTax, earnedIncomeDeduction, earnedTaxCredit, LOCAL_INCOME_TAX_RATIO } from './krIncomeTax'
import { INSURANCE_RATES, clampPensionBase, pensionBaseAt } from './krInsuranceRates'

/** 시뮬레이터가 계산하는 귀속연도(과세기간). 연도에 따라 바뀌는 규칙은 아래 표에서 이 키로 조회한다. */
export const YEAR_END_TAX_YEAR = 2026

export const PERSONAL_DEDUCTION = 1_500_000 // 기본공제 1인당 150만
export const ELDERLY_ADD = 1_000_000 // 경로우대(70세↑) 1인 100만
export const DISABLED_ADD = 2_000_000 // 장애인 1인 200만
export const CARD_THRESHOLD_RATE = 0.25 // 신용카드 등 소득공제 문턱 = 총급여 25%
export const CARD_RATE_CREDIT = 0.15 // 신용카드
export const CARD_RATE_CHECK = 0.3 // 체크·현금영수증
export const CARD_RATE_MARKET = 0.4 // 전통시장·대중교통
export const CARD_RATE_CULTURE = 0.3 // 문화체육사용분(§126의2②3호, 총급여 7천만 이하) — 계산기 입력 없음, 안내 문구용
export const CARD_LIMIT_LOW = 3_000_000 // 총급여 7천만↓ 기본한도
export const CARD_LIMIT_HIGH = 2_500_000 // 총급여 7천만↑ 기본한도
/* 자녀 수별 기본한도 가산 — 조특법 §126의2 (2025.12 개정, 2026.1.1 이후 사용분부터 2028년까지).
   기본공제대상 자녀 1인당 50만원(총급여 7천만 초과 25만원), 최대 2명분 → 7천만 이하 350만/400만, 초과 275만/300만 */
export const CARD_CHILD_ADD_LOW = 500_000
export const CARD_CHILD_ADD_HIGH = 250_000
export const CARD_CHILD_ADD_MAX_KIDS = 2
/* 기본한도 초과분 추가공제 — 조특법 §126의2⑪ (2025.12.23 개정 조문, 2026년 사용분).
   기본한도(위 300만/250만 + 자녀 가산)를 넘는 금액은 ②1호 전통시장(40%)·2호 대중교통(40%) 공제액 합계까지 더 공제하되
   연 200만원 한도, 총급여 7천만원 이하는 ②3호 문화체육사용분(30%)까지 합쳐 연 300만원 한도.
   전통시장·대중교통분도 먼저 기본한도 안에서 공제되고, 넘친 부분만 여기서 더해진다. (이 계산기는 문화체육분 입력 없음) */
export const CARD_EXTRA_LIMIT_LOW = 3_000_000 // 총급여 7천만 이하 (전통시장+대중교통+문화체육)
export const CARD_EXTRA_LIMIT_HIGH = 2_000_000 // 총급여 7천만 초과 (전통시장+대중교통)
export const CARD_LOW_GROSS_CUT = 70_000_000 // 기본·추가한도의 총급여 경계 (이하 = 저소득 한도)
export const PENSION_SAVINGS_LIMIT = 6_000_000 // 연금저축 한도
export const PENSION_TOTAL_LIMIT = 9_000_000 // 연금저축+IRP 합산 한도
export const STANDARD_TAX_CREDIT = 130_000 // 표준세액공제
export const INSURANCE_CREDIT_LIMIT = 1_000_000 // 보장성보험 한도
export const INSURANCE_CREDIT_RATE = 0.12
export const MEDICAL_FLOOR_RATE = 0.03 // 의료비 총급여 3% 문턱
export const MEDICAL_RATE = 0.15
/* 소득세법 §59의4②1호: 본인·65세 이상·6세 이하·장애인·중증질환자 등(2호) 외 기본공제대상자의 의료비는
   총급여 3% 초과분 중 연 700만원까지. 1호 의료비가 3%에 못 미치면 모자란 만큼 2호 의료비에서 뺀다(2호 단서). */
export const MEDICAL_OTHERS_LIMIT = 7_000_000
/* 소득세법 §59의4② 본문 괄호: 3호 미숙아·선천성이상아 의료비 20%, 4호 난임시술비 30% (그 밖은 15%).
   이 계산기는 두 항목을 따로 입력받지 않아 15%로만 계산한다 — 페이지 '미반영' 안내 문구용. 기준일 2026-09. */
export const MEDICAL_RATE_PREMATURE = 0.2
export const MEDICAL_RATE_INFERTILITY = 0.3
export const EDUCATION_RATE = 0.15
export const DONATION_RATE_LOW = 0.15 // 기부금 1천만↓
export const DONATION_RATE_HIGH = 0.3 // 1천만 초과분
export const DONATION_THRESHOLD = 10_000_000
export const RENT_LIMIT = 10_000_000 // 월세 대상 한도
export const RENT_RATE_LOW = 0.17 // 총급여 5,500만↓
export const RENT_RATE_HIGH = 0.15 // 5,500만~8,000만
export const RENT_GROSS_CAP = 80_000_000 // 월세 세액공제 총급여 상한
export const PENSION_CREDIT_GROSS_CUT = 55_000_000 // 연금/월세 고율 적용 총급여 경계
export const PENSION_CREDIT_RATE_HIGH = 0.15 // 총급여 5,500만↓ 연금계좌 세액공제율
export const PENSION_CREDIT_RATE_LOW = 0.12 // 총급여 5,500만↑
export const LOCAL_TAX_RATE = LOCAL_INCOME_TAX_RATIO // 지방소득세 10% — lib/krIncomeTax 단일 소스(지방세법 §103의13)

/* 자녀세액공제 대상 나이 — 소득세법 §59의2① (개정 2026.4.21 법률 제21548호: '8세 이상' → '13세 이상').
   같은 법 부칙 §2②: 2026~2029년 과세기간분은 9·10·11·12세 이상으로 1세씩 단계 적용, 2030년부터 13세 이상.
   부칙 §2③: 2017년 출생 자녀는 단계 적용에서 빼고 본칙(13세 이상)을 적용 — 아동수당을 13세 전까지 끊김 없이
   받는 연령대라 중복 지원을 막는 취지. 따라서 2026~2029년에는 2016년 이전 출생 자녀만 공제된다.
   나이는 과세기간 중 해당 나이가 되는 날이 있으면 인정(§53⑤) — 국세청 안내의 출생연도 표기와 같게 '귀속연도 − 출생연도'로
   판정한다(예: 2023 귀속 '8세 이상 20세 이하' = 2003~2015년생).
   상한 20세는 기본공제대상 자녀 요건(§50①3호). 기준일 2026-09. */
export interface ChildCreditAgeRule {
  minAge: number                // 귀속연도 − 출생연도 ≥ minAge
  excludeBirthYears: number[]   // 나이와 무관하게 이 해 출생 자녀는 제외
}
export const CHILD_CREDIT_MAX_AGE = 20
export const CHILD_CREDIT_AGE_RULES: Record<2025 | 2026 | 2027 | 2028 | 2029 | 2030, ChildCreditAgeRule> = {
  2025: { minAge: 8, excludeBirthYears: [] },       // 개정 전
  2026: { minAge: 9, excludeBirthYears: [2017] },   // 부칙 §2②1호·③
  2027: { minAge: 10, excludeBirthYears: [2017] },
  2028: { minAge: 11, excludeBirthYears: [2017] },
  2029: { minAge: 12, excludeBirthYears: [2017] },
  2030: { minAge: 13, excludeBirthYears: [] },      // 본칙
}

/** 귀속연도에 적용되는 자녀세액공제 나이 규칙 — 표보다 뒤 연도는 마지막(본칙), 앞 연도는 첫 값 */
export function childCreditAgeRule(taxYear: number = YEAR_END_TAX_YEAR): ChildCreditAgeRule {
  const years = (Object.keys(CHILD_CREDIT_AGE_RULES).map(Number) as (keyof typeof CHILD_CREDIT_AGE_RULES)[]).sort((a, b) => a - b)
  let pick = years[0]
  for (const y of years) if (y <= taxYear) pick = y
  return CHILD_CREDIT_AGE_RULES[pick]
}

/** 출생연도 기준 자녀세액공제 대상 여부 (기본공제대상 자녀라는 전제) */
export function isChildCreditEligible(birthYear: number, taxYear: number = YEAR_END_TAX_YEAR): boolean {
  const rule = childCreditAgeRule(taxYear)
  const age = taxYear - birthYear
  return age >= rule.minAge && age <= CHILD_CREDIT_MAX_AGE && !rule.excludeBirthYears.includes(birthYear)
}

/** 자녀세액공제 대상 출생연도 범위 [from, to] — 제외 연도가 범위 끝에 걸리면 안쪽으로 좁힌다 (안내 문구용) */
export function childCreditBirthYears(taxYear: number = YEAR_END_TAX_YEAR): { from: number; to: number } {
  const from = taxYear - CHILD_CREDIT_MAX_AGE
  let to = taxYear - childCreditAgeRule(taxYear).minAge
  while (to >= from && !isChildCreditEligible(to, taxYear)) to--
  return { from, to }
}

/** 자녀세액공제 금액(§59의2①): 1명 25만·2명 55만·3명↑ 55만+40만/추가 — 대상 자녀 수는 위 나이 규칙으로 센다 */
export function childTaxCredit(children: number): number {
  if (children <= 0) return 0
  if (children === 1) return 250_000
  if (children === 2) return 550_000
  return 550_000 + (children - 2) * 400_000
}

/** 국민연금 본인부담 연액 추정 (입력 없을 때) — 2026 귀속.
 *  기준소득월액 상·하한은 7월에 바뀌므로 월별로 적용: 1~6월 2025.7 고시(40만~637만), 7~12월 2026.7 고시(41만~659만).
 *  (단일 소스 lib/krInsuranceRates PENSION_BASE_SCHEDULE — 날짜 무관·결정적) */
export function estimateNationalPension(gross: number): number {
  const rate = INSURANCE_RATES[YEAR_END_TAX_YEAR].pension.employee / 100
  const monthly = gross / 12
  let sum = 0
  for (let month = 1; month <= 12; month++) {
    sum += clampPensionBase(monthly, pensionBaseAt({ year: YEAR_END_TAX_YEAR, month })) * rate
  }
  return Math.round(sum)
}

/** 건강·장기요양·고용보험 본인부담 연액 추정 (입력 없을 때). 각 요율은 보수(총급여) 대비 % */
export function estimateOtherInsurance(gross: number): number {
  const r = INSURANCE_RATES[YEAR_END_TAX_YEAR]
  const health = gross * (r.health.employee / 100)
  const ltc = gross * (r.ltc.employee / 100) // 장기요양(보수월액 대비 %)
  const unemp = gross * (r.unemp.employee / 100) // 고용보험
  return Math.round(health + ltc + unemp)
}

export interface YearEndInput {
  gross: number              // 총급여(연, 비과세 제외)
  dependents: number         // 부양가족 수(본인 외, 자녀 포함) — 자녀 수보다 작으면 자녀 수로 간주
  children: number           // 자녀세액공제 대상 자녀 수 (childCreditBirthYears — 2026 귀속은 2006~2016년생)
  youngChildren?: number     // 그 밖의 기본공제대상 자녀 수 (나이 미달·2017년생 등 — 기본공제·카드 한도 가산만, 생략 시 0)
  elderly: number            // 경로우대(70세↑) 수
  disabled: number           // 장애인 수
  creditCard: number         // 신용카드 사용액
  checkCash: number          // 체크·현금영수증
  marketTransit: number      // 전통시장·대중교통
  pensionSavings: number     // 연금저축 납입
  irp: number                // IRP·퇴직연금 추가납입
  insurance: number          // 보장성보험료
  medical: number            // 의료비 — 본인·65세 이상·6세 이하·장애인 등 (한도 없음, §59의4②2호)
  medicalOthers?: number     // 의료비 — 그 밖의 기본공제대상자 (3% 초과분 연 700만 한도, §59의4②1호, 생략 시 0)
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
  insuranceDeduction: number // 보험료 특별소득공제 (실제 적용액 — 표준세액공제 선택 시 0)
  insurancePaid: number      // 건보·장기요양·고용 본인부담 연액 (입력 또는 추정)
  cardDeduction: number      // 신용카드 등 소득공제
  taxBase: number            // 과세표준
  computedTax: number        // 산출세액
  earnedCredit: number       // 근로소득세액공제
  childCredit: number        // 자녀세액공제
  pensionAccountCredit: number // 연금계좌 세액공제
  specialCredit: number      // 특별세액공제(보험·의료·교육·기부)
  rentCredit: number         // 월세 세액공제
  appliedSpecialBlock: number // 적용된 특별+월세 세액공제, 또는 표준 13만
  usedStandard: boolean      // 표준세액공제 적용 여부 (보험료 특별소득공제·특별·월세 세액공제 미적용 경로가 유리할 때)
  decidedIncomeTax: number   // 결정세액(소득세)
  localTax: number           // 지방소득세
  decidedTotal: number       // 결정세액(총)
  prepaidTotal: number       // 기납부세액(총, 입력 또는 추정)
  prepaidEstimated: boolean  // 기납부 추정 여부
  settlement: number         // 정산(+추가납부 / −환급)
  marginalRatePct: number    // 적용 한계세율(%)
}

/** 신용카드 등 소득공제 — 조특법 §126의2
 *  ① 공제대상액 = Σ(사용액 × 공제율) − 최저사용금액(총급여 25%)분. 문턱은 공제율 낮은 신용카드부터 채운다(⑥).
 *  ② 기본한도(⑩): 300만(총급여 7천만 초과 250만) + 자녀 가산 — 전통시장·대중교통분도 여기 먼저 들어간다.
 *  ③ 추가공제(⑪): min(기본한도 초과액, 전통시장·대중교통 사용액 × 40%, 300만 / 7천만 초과 200만) */
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
  const total = creditEff * CARD_RATE_CREDIT + checkEff * CARD_RATE_CHECK + marketEff * CARD_RATE_MARKET
  const low = input.gross <= CARD_LOW_GROSS_CUT
  const kids = Math.min(CARD_CHILD_ADD_MAX_KIDS, Math.max(0, input.children) + Math.max(0, input.youngChildren ?? 0))
  const baseLimit = (low ? CARD_LIMIT_LOW : CARD_LIMIT_HIGH) + kids * (low ? CARD_CHILD_ADD_LOW : CARD_CHILD_ADD_HIGH)
  const base = Math.min(total, baseLimit)
  const extra = Math.min(total - base, market * CARD_RATE_MARKET, low ? CARD_EXTRA_LIMIT_LOW : CARD_EXTRA_LIMIT_HIGH)
  return Math.round(base + extra)
}

/** 의료비 세액공제 대상액(공제율 곱하기 전) — 소득세법 §59의4②1·2호 */
export function medicalCreditBase(gross: number, medical: number, medicalOthers = 0): number {
  const floor = Math.max(0, gross) * MEDICAL_FLOOR_RATE
  const others = Math.max(0, medicalOthers)
  const othersEligible = Math.min(Math.max(0, others - floor), MEDICAL_OTHERS_LIMIT)
  const shortfall = Math.max(0, floor - others)
  return othersEligible + Math.max(0, Math.max(0, medical) - shortfall)
}

/** 인적공제 대상 부양가족 수(본인 외). 자녀세액공제·카드 한도 대상 자녀는 기본공제대상자여야 하므로
 *  입력한 부양가족 수가 자녀 수보다 작으면 자녀 수로 올려 잡는다. */
export function effectiveDependents(input: Pick<YearEndInput, 'dependents' | 'children' | 'youngChildren'>): number {
  const kids = Math.max(0, input.children) + Math.max(0, input.youngChildren ?? 0)
  return Math.max(Math.max(0, input.dependents), kids)
}

/** 표준세액공제 택일 (소득세법 §59의4⑨): 특별소득공제(건강·고용보험료 등)·특별세액공제·월세세액공제를
 *  하나도 신청하지 않은 근로자에게만 13만원. 두 경로의 결정세액(소득세)을 모두 구해 작은 쪽을 고른다.
 *  A = 보험료 특별소득공제 + 특별·월세 세액공제(itemized) / B = 둘 다 없이 표준 13만 */
function decideWithStandardChoice(p: {
  gross: number
  incomeAfterMandatory: number  // 근로소득금액 − 인적공제 − 연금보험료공제 − 신용카드 등 공제
  insurance: number             // 보험료 특별소득공제 대상액
  itemized: number              // 특별세액공제 + 월세 세액공제
  otherCredits: number          // 자녀·연금계좌 세액공제 (두 경로 공통)
}) {
  const path = (taxBase: number, block: number) => {
    const computedTax = Math.round(progressiveTax(taxBase))
    const earnedCredit = Math.round(earnedTaxCredit(computedTax, p.gross))
    const decided = Math.max(0, computedTax - earnedCredit - p.otherCredits - block)
    return { taxBase, computedTax, earnedCredit, decided }
  }
  const a = path(Math.max(0, p.incomeAfterMandatory - p.insurance), p.itemized)
  const b = path(Math.max(0, p.incomeAfterMandatory), STANDARD_TAX_CREDIT)
  const usedStandard = b.decided < a.decided
  return { ...(usedStandard ? b : a), usedStandard }
}

export function calcYearEnd(input: YearEndInput): YearEndResult {
  const gross = Math.max(0, input.gross)

  // STEP 1. 근로소득금액
  const earnedIncome = Math.max(0, gross - earnedIncomeDeduction(gross))

  // STEP 2. 종합소득공제
  const personalDeduction =
    PERSONAL_DEDUCTION * (1 + effectiveDependents(input)) +
    Math.max(0, input.elderly) * ELDERLY_ADD +
    Math.max(0, input.disabled) * DISABLED_ADD
  const pensionDeduction = input.nationalPension != null ? Math.max(0, input.nationalPension) : estimateNationalPension(gross)
  const insurancePaid = input.otherInsurance != null ? Math.max(0, input.otherInsurance) : estimateOtherInsurance(gross)
  const cardDed = cardDeduction(input)

  // STEP 3·4. 산출세액·세액공제 — 보험료 특별소득공제 적용 여부가 표준세액공제 택일에 달려 있어 아래에서 함께 계산
  const childCredit = childTaxCredit(Math.max(0, input.children))

  // 연금계좌
  const ps = Math.min(Math.max(0, input.pensionSavings), PENSION_SAVINGS_LIMIT)
  const pensionEligible = Math.min(ps + Math.max(0, input.irp), PENSION_TOTAL_LIMIT)
  const pensionRate = gross <= PENSION_CREDIT_GROSS_CUT ? PENSION_CREDIT_RATE_HIGH : PENSION_CREDIT_RATE_LOW
  const pensionAccountCredit = Math.round(pensionEligible * pensionRate)

  // 특별세액공제
  const insuranceCredit = Math.min(Math.max(0, input.insurance), INSURANCE_CREDIT_LIMIT) * INSURANCE_CREDIT_RATE
  const medicalCredit = medicalCreditBase(gross, input.medical, input.medicalOthers ?? 0) * MEDICAL_RATE
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

  // 항목별(보험료 특별소득공제 + 특별·월세 세액공제) vs 표준 13만 — 결정세액이 작은 쪽
  const itemized = specialCredit + rentCredit
  const chosen = decideWithStandardChoice({
    gross,
    incomeAfterMandatory: earnedIncome - personalDeduction - pensionDeduction - cardDed,
    insurance: insurancePaid,
    itemized,
    otherCredits: childCredit + pensionAccountCredit,
  })
  const { taxBase, computedTax, earnedCredit, usedStandard } = chosen
  const insuranceDeduction = usedStandard ? 0 : insurancePaid
  const appliedSpecialBlock = usedStandard ? STANDARD_TAX_CREDIT : itemized

  const decidedIncomeTax = chosen.decided
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
    earnedIncome, personalDeduction, pensionDeduction, insuranceDeduction, insurancePaid, cardDeduction: cardDed,
    taxBase, computedTax, earnedCredit, childCredit, pensionAccountCredit, specialCredit, rentCredit,
    appliedSpecialBlock, usedStandard, decidedIncomeTax, localTax, decidedTotal,
    prepaidTotal, prepaidEstimated, settlement, marginalRatePct,
  }
}

/** 기납부세액 추정: 선택공제(신용카드·연금계좌·특별·월세) 제외, 의무공제만 반영한 결정세액(총).
    실제 원천징수는 간이세액표(소득세법 시행령 별표2 — 특별공제 등을 총급여 구간별 공식으로 일괄 반영)를
    따르므로 이 값은 근사다. 표준세액공제 택일은 calcYearEnd와 같은 규칙(보험료 소득공제 경로와 비교)을 써서,
    선택공제를 하나도 입력하지 않으면 정산액이 0 근처가 되도록 맞춘다. */
export function estimatePrepaidWithholding(input: YearEndInput): number {
  const gross = Math.max(0, input.gross)
  const earnedIncome = Math.max(0, gross - earnedIncomeDeduction(gross))
  const personalDeduction = PERSONAL_DEDUCTION * (1 + effectiveDependents(input))
  const pension = input.nationalPension != null ? Math.max(0, input.nationalPension) : estimateNationalPension(gross)
  const other = input.otherInsurance != null ? Math.max(0, input.otherInsurance) : estimateOtherInsurance(gross)
  const { decided } = decideWithStandardChoice({
    gross,
    incomeAfterMandatory: earnedIncome - personalDeduction - pension,
    insurance: other,
    itemized: 0,
    otherCredits: childTaxCredit(Math.max(0, input.children)),
  })
  return Math.round(decided * (1 + LOCAL_TAX_RATE))
}
