/* 실업급여(구직급여) 법정 수치·산식 단일 소스 — 이직일 연도별(2025~2027 이직자) 상·하한.
   근거(기준일 2026-09):
   · 고용보험법 §45① 기초일액 = 이직 전 평균임금, ② 그 금액이 통상임금보다 적으면 통상임금,
     ④ 최저기초일액 = 이직 전 1일 소정근로시간 × '이직일 당시' 시간급 최저임금, ⑤ 기초일액 상한 = 대통령령(시행령 §68).
   · §46① 구직급여일액 = 기초일액 × 60% (최저기초일액이면 × 80%), ② 60% 산정액이 최저구직급여일액보다 낮으면
     최저구직급여일액 — 하한은 상한보다 우선한다(상한 먼저 적용 → 하한).
   · 시행령 §68 기초일액 상한: 110,000원(2019.10.1~) → 113,500원(2025.12.16 국무회의 의결, 2026.1.1 이후 이직자).
     1일 상한 = 기초일액 상한 × 60% = 66,000 → 68,100원.
   · 하한은 최저시급(krInsuranceRates.minHourlyWageFor(이직 연도)) × 1일 소정근로시간(최대 8) × 80% — 2026 66,048원, 2027 68,480원.
   소정급여일수 표는 2019.10 이후 이직자 기준. 수급'자격'(자발/비자발·피보험 180일)은 계산 범위 밖. */

import { MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, minHourlyWageFor } from './krInsuranceRates'

export const UI_BENEFIT_RATE = 0.6              // 구직급여 = 기초일액(평균임금일액, 통상임금이 더 크면 통상임금 — §45②)의 60%
export const UI_DAILY_FLOOR_RATE = 0.8          // 하한액 = 최저기초일액(최저시급 × 1일 소정근로시간) × 80%
export const UI_DAILY_WORK_HOURS = 8            // 최저임금일액 환산 1일 소정근로시간 (풀타임 기준·상한)
export const UI_MIN_WORK_HOURS = 1              // 입력 하한 (주 15시간 미만 초단시간은 대부분 적용 제외 — 호출측 안내)
/** 연도를 지정하지 않은 호출(가이드·홈 수치 카드 등 '2026년 이직자' 문구)의 기본 이직 연도 */
export const UI_BASE_YEAR = 2026

/** 기초일액 상한(시행령 §68①) 구간표 — 이직일이 속한 해(fromYear 이상 중 가장 늦은 행)에 적용.
 *  1일 상한은 따로 두지 않고 wageCap × 60%로 파생(§46①1호 — 상한 기초일액의 60%). */
export const UI_WAGE_CAP_SCHEDULE: readonly { fromYear: number; wageCap: number; note: string }[] = [
  { fromYear: 2019, wageCap: 110_000, note: '2019.10.1 이후 이직자(구직급여율 60% 상향과 함께) — 1일 상한 66,000원' },
  { fromYear: 2026, wageCap: 113_500, note: '2025.12.16 국무회의 의결 시행령 개정, 2026.1.1 이후 이직자 — 1일 상한 68,100원' },
  /* 2027: 2026-09 현재 미고시. 정부가 2026.9.1 고용보험위원회에 보고한 개편안(상한 = 하한의 103%, 주 6일 지급)은
     시행령·법 개정 전이라 반영하지 않고 2026 상한을 그대로 쓴다. 그 결과 2027 이직자는 하한(68,480원)이 상한(68,100원)보다
     높아지고, §46②에 따라 하한이 지급된다. 상한이 고시되면 { fromYear: 2027, wageCap } 행을 추가하고 UI_CAP_CONFIRMED_THROUGH를 올릴 것. */
]
/** 상한이 실제 고시로 확인된 마지막 이직 연도 — 이후 연도는 마지막 고시 상한을 그대로 쓰므로 화면에서 안내 */
export const UI_CAP_CONFIRMED_THROUGH = 2026

/** 최저시급 표가 있는 이직 연도 범위 — 범위 밖은 minHourlyWageFor가 가장 가까운 해의 값을 쓰므로 화면에서 안내 */
const MIN_WAGE_YEARS = Object.keys(MIN_HOURLY_WAGE).map(Number).sort((a, b) => a - b)
export const UI_FIRST_YEAR = MIN_WAGE_YEARS[0]
export const UI_LAST_YEAR = MIN_WAGE_YEARS[MIN_WAGE_YEARS.length - 1]

/** 유한한 양수만 통과, 그 밖(NaN·음수·undefined)은 0 */
const pos = (n: number | undefined): number => (n !== undefined && Number.isFinite(n) && n > 0 ? n : 0)

/** 이직 연도 정규화 — 비정상 값이면 UI_BASE_YEAR */
function normYear(year: number): number {
  return Number.isFinite(year) ? Math.trunc(year) : UI_BASE_YEAR
}

/** 하한 계산에 실제로 쓰는 최저시급의 해 — 표 범위(UI_FIRST_YEAR~UI_LAST_YEAR) 밖이면 가장 가까운 해(minHourlyWageFor와 같은 규칙).
 *  화면에 '○○년 최저시급'을 표시할 때 입력 연도가 아니라 이 값을 써야 금액과 연도가 어긋나지 않는다. */
export function uiMinWageYearFor(year: number = UI_BASE_YEAR): number {
  return Math.min(Math.max(normYear(year), UI_FIRST_YEAR), UI_LAST_YEAR)
}

/** 이직 연도 → 기초일액 상한(원) */
export function uiWageCapFor(year: number = UI_BASE_YEAR): number {
  const y = normYear(year)
  let cap = UI_WAGE_CAP_SCHEDULE[0].wageCap
  for (const row of UI_WAGE_CAP_SCHEDULE) if (row.fromYear <= y) cap = row.wageCap
  return cap
}

/** 이직 연도 → 1일 구직급여 상한액(원) = 기초일액 상한 × 60% */
export function uiDailyCapFor(year: number = UI_BASE_YEAR): number {
  return Math.round(uiWageCapFor(year) * UI_BENEFIT_RATE)
}

/** 1일 구직급여 상한액 (2026 이직자) = 113,500 × 60% = 68,100원 */
export const UI_DAILY_CAP_2026 = uiDailyCapFor(2026)
/** 기초일액(임금일액) 상한 (2026 이직자) = 113,500원 */
export const UI_WAGE_DAILY_CAP_2026 = uiWageCapFor(2026)

/** 1일 소정근로시간 정규화 — 1~8시간(8시간 초과는 8시간으로 봄). NaN이면 8시간. */
export function normWorkHours(hours: number): number {
  if (!Number.isFinite(hours)) return UI_DAILY_WORK_HOURS
  return Math.min(UI_DAILY_WORK_HOURS, Math.max(UI_MIN_WORK_HOURS, hours))
}

/** 1일 구직급여 하한액(최저구직급여일액) = 이직일 당시 최저시급 × 이직 전 1일 소정근로시간 × 80%.
 *  고용보험법 §45④(최저기초일액 = 이직일 당시 최저임금 × 1일 소정근로시간)·§46②(하한 = 최저기초일액 × 80%).
 *  year: 이직일이 속한 해(최저임금은 매년 1월 1일 시행). 단시간 근로자(예: 1일 4시간)는 하한도 비례해 낮아진다. */
export function uiDailyFloor(hours: number = UI_DAILY_WORK_HOURS, year: number = UI_BASE_YEAR): number {
  return Math.round(minHourlyWageFor(normYear(year)) * normWorkHours(hours) * UI_DAILY_FLOOR_RATE)
}

/** 2026 1일 구직급여 하한액(1일 8시간 기준) = 10,320 × 8h × 80% = 66,048원 (최저시급 갱신 시 자동 반영) */
export const UI_DAILY_FLOOR_2026 = uiDailyFloor(UI_DAILY_WORK_HOURS, 2026)

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
  avgDailyWageRaw: number // 기초일액 = 평균임금일액(§45② 통상임금 비교 후) (상한 클램프 전)
  avgDailyWage: number    // 기초일액 (상한 클램프 후)
  wageCapped: boolean     // 기초일액 상한(wageCap) 적용 여부
  rawDaily: number        // 기초일액(상한 후) × 60% (1일 상·하한 적용 전)
  year: number            // 상·하한을 정한 이직 연도
  wageCap: number         // 적용된 기초일액 상한 (시행령 §68)
  dailyCap: number        // 적용된 1일 상한액 (= wageCap × 60%)
  dailyFloor: number      // 적용된 1일 하한액 (이직 연도 최저시급 × 1일 소정근로시간 × 80%)
  floorOverCap: boolean   // 하한이 상한보다 높은 해(예: 2027 — 상한 미고시) → 모두 하한 이상 지급
  capConfirmed: boolean   // 이 이직 연도의 상한이 고시로 확인됐는지(year <= UI_CAP_CONFIRMED_THROUGH) — false면 직전 고시 상한을 그대로 쓴 추정
  workHours: number       // 적용된 1일 소정근로시간 (1~8)
  dailyBenefit: number    // 1일 구직급여액 (상한 → 하한 순으로 적용 후)
  capped: 'upper' | 'lower' | 'none'
  benefitDays: number     // 소정급여일수
  totalBenefit: number    // 1일액 × 소정급여일수
  monthlyBenefit: number  // 1일액 × 30 (참고)
}

/** 기초일액 → 1일 구직급여액·총수급액.
 *  avgDailyWageRaw: 기초일액 — 퇴직 전 3개월 임금총액 ÷ 그 기간 총일수, 1일 통상임금이 더 크면 통상임금
 *                   (§45② 비교는 uiBaseDailyWage, 또는 비교까지 한 번에 하는 calcUnemploymentFromWages)
 *  workHours: 이직 전 1일 소정근로시간 (기본 8 — 하한액이 이 시간에 비례)
 *  year: 이직일이 속한 해 (기본 UI_BASE_YEAR=2026) — 기초일액 상한·하한(최저시급)을 이 해 값으로 정한다.
 *  적용 순서(§45⑤·§46): 기초일액 상한 → × 60% → 1일 상한 → 1일 하한(하한이 상한보다 높아도 하한이 이긴다). */
export function calcUnemployment(
  avgDailyWageRaw: number,
  age: number,
  disabled: boolean,
  totalMonths: number,
  workHours: number = UI_DAILY_WORK_HOURS,
  year: number = UI_BASE_YEAR,
): UnemploymentResult {
  const y = normYear(year)
  const wageCap = uiWageCapFor(y)
  const dailyCap = uiDailyCapFor(y)
  const base = pos(avgDailyWageRaw)
  const wageCapped = base > wageCap
  const avgDailyWage = Math.min(base, wageCap)
  const rawDaily = Math.round(avgDailyWage * UI_BENEFIT_RATE)
  const hours = normWorkHours(workHours)
  const dailyFloor = uiDailyFloor(hours, y)

  // 1) 상한(§46①1호 — 상한 기초일액의 60%)  2) 하한(§46② — 60% 산정액이 최저구직급여일액보다 낮으면 최저구직급여일액).
  // 하한을 나중에 적용하므로 하한 > 상한인 해(2027 이직자·상한 미고시)에는 하한이 지급된다.
  // 경계값(==상한/==하한)도 배지로 안내하도록 >= / <= 사용.
  let dailyBenefit = rawDaily
  let capped: 'upper' | 'lower' | 'none' = 'none'
  if (rawDaily >= dailyCap) {
    dailyBenefit = dailyCap
    capped = 'upper'
  }
  if (dailyBenefit <= dailyFloor) {
    dailyBenefit = dailyFloor
    capped = 'lower'
  }

  const days = benefitDays(age, disabled, totalMonths)
  return {
    avgDailyWageRaw: base,
    avgDailyWage,
    wageCapped,
    rawDaily,
    year: y,
    wageCap,
    dailyCap,
    dailyFloor,
    floorOverCap: dailyFloor > dailyCap,
    capConfirmed: y <= UI_CAP_CONFIRMED_THROUGH,
    workHours: hours,
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

/** 월 통상임금(기본급·고정수당) → 1일 통상임금 = 시간급 통상임금 × 1일 소정근로시간 (근로기준법 시행령 §6).
 *  주 5일 근무·주휴 포함 가정: 월 소정근로시간이 1일 소정근로시간에 비례(8시간 = MONTHLY_WORK_HOURS)하므로
 *  1일 통상임금 = 월 통상임금 × 8 ÷ 209 — 1일 근로시간과 무관. 퇴직금 계산기 calcOrdinaryWageDaily(월급, 8, 209)와 같은 값.
 *  (주 5일 미만 근무자는 실제 1일 통상임금이 이보다 커서 이 값은 보수적 추정) */
export function ordinaryDailyFromMonthly(monthlyOrdinary: number): number {
  if (!Number.isFinite(monthlyOrdinary) || monthlyOrdinary <= 0) return 0
  return (monthlyOrdinary * UI_DAILY_WORK_HOURS) / MONTHLY_WORK_HOURS
}

/** 기초일액(상한 클램프 전) — 고용보험법 §45①: 이직 전 평균임금일액. §45②: 그 금액이 1일 통상임금보다 적으면 통상임금.
 *  월급이 고정급뿐인 주 5일 근무자는 월급 × 8 ÷ 209 > 월급 × 3 ÷ 92 이므로 항상 통상임금이 기초일액이 된다.
 *  ordinaryDaily를 모르면 0(비교 생략 = 평균임금일액). */
export function uiBaseDailyWage(avgDaily: number, ordinaryDaily = 0): { base: number; ordinaryApplied: boolean } {
  const avg = pos(avgDaily)
  const ord = pos(ordinaryDaily)
  return ord > avg ? { base: ord, ordinaryApplied: true } : { base: avg, ordinaryApplied: false }
}

/** 평균임금일액·1일 통상임금 → §45② 비교 → calcUnemployment 한 번에 (계산기·페이지 예시·가이드 공용 경로).
 *  ordinaryDaily: 1일 통상임금(모르면 0 — 평균임금일액만 사용). year: 이직 연도(기본 2026). */
export function calcUnemploymentFromWages(p: {
  avgDaily: number
  ordinaryDaily?: number
  age: number
  disabled: boolean
  totalMonths: number
  workHours?: number
  year?: number
}): UnemploymentResult & { avgDaily: number; ordinaryDaily: number; ordinaryApplied: boolean } {
  const avgDaily = pos(p.avgDaily)
  const ordinaryDaily = pos(p.ordinaryDaily)
  const b = uiBaseDailyWage(avgDaily, ordinaryDaily)
  const r = calcUnemployment(b.base, p.age, p.disabled, p.totalMonths, p.workHours ?? UI_DAILY_WORK_HOURS, p.year ?? UI_BASE_YEAR)
  return { ...r, avgDaily, ordinaryDaily, ordinaryApplied: b.ordinaryApplied }
}

/** 'YYYY-MM-DD' → 이직 연도 (UTC 해석 없이 문자열 분해). 형식이 아니면 NaN. */
export function uiSeparationYear(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? parseInt(m[1], 10) : Number.NaN
}
