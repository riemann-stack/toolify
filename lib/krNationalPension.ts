/* 국민연금 노령연금 예상액 추정 — 법정 수치·산식 단일 소스.
   공단 '간단계산' 산식 [기본연금액 = 1.29 × (A + B) × (1 + 0.05·n/12)] 기반 추정.
   실제 연금액은 가입연도별 재평가율·소득대체율 가중과 기준소득월액 이력에 따라 달라지므로 추정값임.
   출처: 국민연금공단(nps.or.kr). A값 적용기간 2025.12~2026.11. */

export const NP_A_VALUE_2026 = 3_193_511 // A값 (전체 가입자 3년 평균소득월액, 2026 적용)
export const NP_PROPORTION_CONSTANT = 1.29 // 비례상수 (공단 간단계산 근사, 2026 신규수급)

/** 기준소득월액 상·하한 (2026.7.~ 적용).
 *  ※ lib/krInsuranceRates.ts의 2026 pension minBase/maxBase(400,000/6,370,000)는 2026.6까지 값. */
export const NP_INCOME_FLOOR = 410_000
export const NP_INCOME_CAP = 6_590_000

export const NP_EARLY_RATE = 0.06 // 조기노령연금 감액 (연 6% = 월 0.5%)
export const NP_DEFER_RATE = 0.072 // 연기연금 가산 (연 7.2% = 월 0.6%)
export const NP_MAX_ADJUST_YEARS = 5 // 조기·연기 최대 5년

/** 부양가족연금액 (2026, 연액). 조기·연기 보정 미적용 정액 가산. */
export const NP_DEPENDENT_SPOUSE_YEAR = 306_630 // 배우자
export const NP_DEPENDENT_OTHER_YEAR = 204_360 // 자녀·부모 1인당

export const NP_MIN_COVERAGE_MONTHS = 120 // 노령연금 최소 가입기간 (10년)

/** 출생연도 → 노령연금 정상 수급개시연령 (만 나이) */
export function pensionStartAge(birthYear: number): number {
  if (birthYear <= 1952) return 60
  if (birthYear <= 1956) return 61
  if (birthYear <= 1960) return 62
  if (birthYear <= 1964) return 63
  if (birthYear <= 1968) return 64
  return 65
}

export type PensionMode = 'normal' | 'early' | 'defer'

export interface PensionInput {
  totalMonths: number // 총 가입월수
  avgIncome: number   // 평균 기준소득월액 (B값, 클램프 전)
  mode: PensionMode
  adjustYears: number // 조기/연기 연수 (0~5)
  spouse: boolean
  dependents: number  // 자녀·부모 수
}

export interface PensionResult {
  eligible: boolean      // 가입 10년(120월) 이상 여부
  totalMonths: number
  B: number              // 기준소득월액 (클램프 후)
  n: number              // 20년(240월) 초과 월수
  payRate: number        // 가입기간 지급률 P (0.5~1.0, 미달 시 0)
  basicAnnual: number    // 기본연금액 연액
  oldAgeAnnual: number   // 노령연금 연액 (기본 × P)
  adjustFactor: number   // 조기/연기 보정계수
  adjustedAnnual: number // 보정 후 노령연금 연액
  dependentAnnual: number // 부양가족연금 연액
  annual: number         // 연 예상액
  monthly: number        // 월 예상액
}

/** 노령연금 월 예상액 추정 */
export function calcPension(input: PensionInput): PensionResult {
  const totalMonths = Math.max(0, Math.round(input.totalMonths))
  const B = Math.min(NP_INCOME_CAP, Math.max(NP_INCOME_FLOOR, input.avgIncome))
  const eligible = totalMonths >= NP_MIN_COVERAGE_MONTHS

  const n = Math.max(0, totalMonths - 240) // 20년 초과분만 증액
  // 기본연금액(연액) = 비례상수 × (A + B) × (1 + 0.05 × n/12)
  const basicAnnual = NP_PROPORTION_CONSTANT * (NP_A_VALUE_2026 + B) * (1 + (0.05 * n) / 12)

  // 가입기간 지급률 P: 10년 50% → 1개월당 +5/12 %p → 20년 이상 100%.
  // (n은 240 초과분이므로 P=1 구간과 (1+0.05n/12)가 이중계산되지 않음)
  const payRate = eligible ? Math.min(1, 0.5 + (0.05 * (totalMonths - 120)) / 12) : 0
  const oldAgeAnnual = basicAnnual * payRate

  // 조기/연기 보정
  const yrs = Math.min(NP_MAX_ADJUST_YEARS, Math.max(0, input.adjustYears))
  let adjustFactor = 1
  if (input.mode === 'early') adjustFactor = 1 - NP_EARLY_RATE * yrs
  else if (input.mode === 'defer') adjustFactor = 1 + NP_DEFER_RATE * yrs
  const adjustedAnnual = oldAgeAnnual * adjustFactor

  // 부양가족연금 (수급 자격이 있을 때만, 정액 가산)
  const dependentAnnual = eligible
    ? (input.spouse ? NP_DEPENDENT_SPOUSE_YEAR : 0) +
      Math.max(0, Math.floor(input.dependents)) * NP_DEPENDENT_OTHER_YEAR
    : 0

  const annual = adjustedAnnual + dependentAnnual
  const monthly = Math.round(annual / 12)

  return {
    eligible,
    totalMonths,
    B,
    n,
    payRate,
    basicAnnual,
    oldAgeAnnual,
    adjustFactor,
    adjustedAnnual,
    dependentAnnual,
    annual,
    monthly,
  }
}
