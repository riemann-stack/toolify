/* 실업급여(구직급여) 법정 수치·산식 단일 소스 — 2026년 이직자 기준.
   출처: 고용노동부(moel.go.kr)·고용보험(ei.go.kr). 2026 상한 68,100원(6년 만에 인상),
   하한 66,048원(= 최저임금일액 × 80%). 하한은 최저시급에 연동되므로 krInsuranceRates에서 파생.
   소정급여일수 표는 2019.10 이후 이직자 기준. 수급'자격'(자발/비자발·피보험 180일)은 계산 범위 밖. */

import { MIN_HOURLY_WAGE } from './krInsuranceRates'

export const UI_BENEFIT_RATE = 0.6              // 구직급여 = 평균임금일액의 60%
export const UI_DAILY_CAP_2026 = 68_100         // 1일 구직급여 상한액 (2026)
export const UI_WAGE_DAILY_CAP_2026 = 113_500   // 임금일액(평균임금일액) 상한 (2026)
export const UI_DAILY_FLOOR_RATE = 0.8          // 하한액 = 최저임금일액 × 80%
export const UI_DAILY_WORK_HOURS = 8            // 최저임금일액 환산 1일 소정근로시간

/** 2026 1일 구직급여 하한액 = 최저시급 × 8h × 80% = 66,048원 (최저시급 갱신 시 자동 반영) */
export const UI_DAILY_FLOOR_2026 = Math.round(
  MIN_HOURLY_WAGE[2026] * UI_DAILY_WORK_HOURS * UI_DAILY_FLOOR_RATE,
)

export type AgeGroup = 'under50' | '50plus' // 50plus = 이직 당시 만 50세 이상 또는 장애인
export type CoverageBracket = 'lt1' | 'y1to3' | 'y3to5' | 'y5to10' | 'y10plus'

/** 소정급여일수 표 (2019.10. 이후 이직자) — [연령구분][고용보험 가입기간] */
export const BENEFIT_DAYS_2019: Record<AgeGroup, Record<CoverageBracket, number>> = {
  under50: { lt1: 120, y1to3: 150, y3to5: 180, y5to10: 210, y10plus: 240 },
  '50plus': { lt1: 120, y1to3: 180, y3to5: 210, y5to10: 240, y10plus: 270 },
}

export const COVERAGE_BRACKETS: { id: CoverageBracket; label: string }[] = [
  { id: 'lt1', label: '1년 미만' },
  { id: 'y1to3', label: '1년 이상 3년 미만' },
  { id: 'y3to5', label: '3년 이상 5년 미만' },
  { id: 'y5to10', label: '5년 이상 10년 미만' },
  { id: 'y10plus', label: '10년 이상' },
]

/** 총 가입월수 → 가입기간 구간 */
export function coverageBracket(totalMonths: number): CoverageBracket {
  if (totalMonths < 12) return 'lt1'
  if (totalMonths < 36) return 'y1to3'
  if (totalMonths < 60) return 'y3to5'
  if (totalMonths < 120) return 'y5to10'
  return 'y10plus'
}

export function ageGroup(age: number, disabled: boolean): AgeGroup {
  return age >= 50 || disabled ? '50plus' : 'under50'
}

/** 소정급여일수 */
export function benefitDays(age: number, disabled: boolean, totalMonths: number): number {
  return BENEFIT_DAYS_2019[ageGroup(age, disabled)][coverageBracket(totalMonths)]
}

export interface UnemploymentResult {
  avgDailyWageRaw: number // 평균임금일액 (상한 클램프 전)
  avgDailyWage: number    // 평균임금일액 (상한 클램프 후)
  wageCapped: boolean     // 임금일액 상한(113,500) 적용 여부
  rawDaily: number        // 평균임금일액 × 60% (상·하한 클램프 전)
  dailyBenefit: number    // 1일 구직급여액 (상·하한 클램프 후)
  capped: 'upper' | 'lower' | 'none'
  benefitDays: number     // 소정급여일수
  totalBenefit: number    // 1일액 × 소정급여일수
  monthlyBenefit: number  // 1일액 × 30 (참고)
}

/** 평균임금일액 → 1일 구직급여액·총수급액.
 *  avgDailyWageRaw: 퇴직 전 3개월 임금총액 ÷ 그 기간 총일수 (호출측에서 산정) */
export function calcUnemployment(
  avgDailyWageRaw: number,
  age: number,
  disabled: boolean,
  totalMonths: number,
): UnemploymentResult {
  const wageCapped = avgDailyWageRaw > UI_WAGE_DAILY_CAP_2026
  const avgDailyWage = Math.min(avgDailyWageRaw, UI_WAGE_DAILY_CAP_2026)
  const rawDaily = Math.round(avgDailyWage * UI_BENEFIT_RATE)

  // 상·하한 적용. 경계값(==상한/==하한)도 배지로 안내하도록 >= / <= 사용.
  // (2026 상·하한 폭이 좁아 대부분 하한 또는 상한에서 결정됨)
  let dailyBenefit = rawDaily
  let capped: 'upper' | 'lower' | 'none' = 'none'
  if (rawDaily >= UI_DAILY_CAP_2026) {
    dailyBenefit = UI_DAILY_CAP_2026
    capped = 'upper'
  } else if (rawDaily <= UI_DAILY_FLOOR_2026) {
    dailyBenefit = UI_DAILY_FLOOR_2026
    capped = 'lower'
  }

  const days = benefitDays(age, disabled, totalMonths)
  return {
    avgDailyWageRaw,
    avgDailyWage,
    wageCapped,
    rawDaily,
    dailyBenefit,
    capped,
    benefitDays: days,
    totalBenefit: dailyBenefit * days,
    monthlyBenefit: dailyBenefit * 30,
  }
}

/** 월급(세전) → 평균임금일액 (간편 모드): 월급 × 3 ÷ 총일수 */
export function avgDailyFromMonthly(monthly: number, totalDays = 90): number {
  return (monthly * 3) / totalDays
}

/** 최근 3개월 임금 합 → 평균임금일액 (상세 모드) */
export function avgDailyFromThreeMonths(
  m1: number,
  m2: number,
  m3: number,
  totalDays: number,
): number {
  return (m1 + m2 + m3) / totalDays
}
