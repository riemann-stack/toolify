/* ──────────────────────────────────────────────────────
   lib/krHourlyPay.ts
   시급제(알바·단시간) 급여 규칙 — 주휴수당·가산수당·휴게·월 환산·4대보험 적용 제외·3.3% — 단일 소스
   사용처: finance/hourly-pay (계산기·가이드 표·골든 테스트)

   근거 (기준일 2026-09)
   · 근로기준법 §2①8호·9호     소정근로시간·단시간근로자 정의
   · 근로기준법 §11①(상시 5명 이상 적용) · §11② + 시행령 §7 [별표 1]  상시 4명 이하 사업장에는 §50·§53·§56·§55② 등이 적용되지 않음
                                → 5명 미만이면 연장·야간·휴일 가산수당 의무 없음 (주휴 §55①·휴게 §54는 적용)
   · 근로기준법 §18③          4주 평균 1주 소정근로시간 15시간 미만 → §55(주휴)·§60(연차) 미적용
   · 근로기준법 시행령 §9① [별표 2]  단시간근로자 1일 소정근로시간 = 4주 소정근로시간 ÷ 4주 통상근로자 총 소정근로일수,
                                유급휴일 임금은 일급 통상임금 기준 → 주휴시간 = 주 소정근로시간 ÷ 5 (주 40시간이면 8시간)
   · 근로기준법 §50           1주 40시간·1일 8시간 (휴게시간 제외)
   · 근로기준법 §53① · 기간제법 §6①  연장(단시간은 소정근로시간 초과) 근로 1주 12시간 한도
   · 근로기준법 §54①          근로시간 4시간 → 휴게 30분 이상, 8시간 → 1시간 이상 (근로시간 도중)
                                단서(법률 제21784호, 2026.6.9 공포 · 2026.12.10 시행): 근로시간 4시간 + 근로자의 명시적 요청 → 휴게 없이 가능
   · 근로기준법 §55① + 시행령 §30①  1주 평균 1회 이상 유급휴일, 1주 소정근로일을 개근한 자에게
   · 근로기준법 §56①②③       연장 +50%, 휴일 8시간 이내 +50%·8시간 초과 +100%, 야간(22~06시) +50%
   · 기간제 및 단시간근로자 보호 등에 관한 법률 §6③  단시간근로자의 소정근로시간 초과 근로 +50% (상시 5명 이상, 같은 법 §3①)
   · 고용노동부 임금근로시간과-1736(2021-08-04)  1주 근로관계가 존속하고 개근했다면 8일째 근로 예정이 없어도 주휴 발생
   · 국민연금법 시행령 §2 4호 · 국민건강보험법 시행령 §9 1호 · 고용보험법 시행령 §3①·②
                                1개월 소정근로시간 60시간 미만 단시간근로자는 적용 제외
                                · 고용보험: 월 60시간 미만 또는 주 15시간 미만 제외, 3개월 이상 계속 근로·일용근로자는 적용(시행령 §3②)
                                  → 2027.1.1부터 제외 기준이 '보수(시행령 소득기준)'로 바뀜 (고용보험법 §10①2호·②, 법률 제21473호 부칙 §1·§2)
                                · 국민연금 예외(시행령 §2 4호 단서 가~라목): 3개월 이상 강사 · 3개월 이상 + 사용자 동의 희망자
                                  · 둘 이상 사업장 합산 60시간 이상 희망자 · 1개월 이상 근로 + 월 소득이 보건복지부 고시 금액 이상
                                  → 계산에는 넣지 않고 화면·가이드에서 안내 (고시 금액은 기준일 현재 원문 미확인)
                                · 건강보험: 예외 단서 없음
   · 소득세법 §129①3호         원천징수 대상 사업소득 3% + 지방소득세(소득세의 10%, 지방세법 §103의13) = 3.3%
                                소액부징수(§86 1호, 1천원 미만)는 2024.7.1 지급분부터 계속·반복적 인적용역 사업소득에 적용 안 됨
                                (시행령 §149의3, 법률 부칙 §6) → 소액이어도 3.3%를 뗀다
   · 국민연금 근로자 요율       연도별 법정 요율은 lib/krInsuranceRates.ts pensionTotalRateFor() (국민연금법 부칙 <법률 제20903호> §4①)
   · 최저임금법 §5② + 시행령 §3  1년 이상 계약·수습 3개월 이내(단순노무 제외) → 최저임금의 90%
   법정 1주 40시간·월 209시간·최저시급·4대보험 요율은 lib/krInsuranceRates.ts,
   1일 8시간·주 15시간·상시 5명 기준은 lib/krLabor.ts(연차와 같은 조문)에서 가져온다 — 여기서 다시 적지 않는다.
   ────────────────────────────────────────────────────── */

import { INSURANCE_RATES, WORK_HOURS_WEEK, type RateSet } from './krInsuranceRates'
import { DAILY_WORK_HOURS, LEAVE_MIN_WEEKLY_HOURS, LEAVE_MIN_WORKERS } from './krLabor'

/** 이 파일의 법령 점검 시점 (UpdatedMeta date) */
export const HOURLY_PAY_REVIEWED = '2026년 9월'

/** §18③ — 4주 평균 1주 소정근로시간이 이 시간 미만이면 주휴(§55)가 없다 (연차 §60과 같은 조항·같은 값) */
export const WEEKLY_HOLIDAY_MIN_HOURS: number = LEAVE_MIN_WEEKLY_HOURS
/** §11① — 상시 근로자 이 인원 이상 사업장부터 가산수당(§56)·연장 한도(§53)·1일 8시간/주 40시간(§50) 적용
 *  (4명 이하에 적용되는 조항은 §11② + 시행령 §7 [별표 1]) */
export const PREMIUM_MIN_WORKERS: number = LEAVE_MIN_WORKERS
/** §50② 1일 법정 근로시간 — 주 40시간 근로자의 1일 소정근로시간(= 주휴 1일분 상한) */
export const DAY_LEGAL_HOURS: number = DAILY_WORK_HOURS
/** §50① 1주 법정 근로시간 */
export const WEEK_LEGAL_HOURS: number = WORK_HOURS_WEEK

/** §56 가산율 (통상임금 대비, 기본 100%에 더하는 몫) */
export const PREMIUM_RATES = {
  /** §56① 연장근로 · 기간제법 §6③ 단시간근로자 초과근로 */
  overtime: 0.5,
  /** §56③ 야간근로 (오후 10시 ~ 다음 날 오전 6시) */
  night: 0.5,
  /** §56②1호 8시간 이내 휴일근로 */
  holiday: 0.5,
  /** §56②2호 8시간 초과 휴일근로 */
  holidayOver: 1.0,
} as const

/** §56② — 휴일근로 가산율이 바뀌는 1일 시간 경계 */
export const HOLIDAY_SPLIT_HOURS = 8
/** §56③ — 야간근로 시간대 (시) */
export const NIGHT_WINDOW = { start: 22, end: 6 } as const
/** §53① · 기간제법 §6① — 1주 연장(초과)근로 한도(시간). 5명 이상 사업장 */
export const OVERTIME_WEEKLY_LIMIT = 12

/** §54① — 근로시간 구간별 최소 휴게시간(분). 긴 구간부터 */
export const BREAK_RULES: readonly { minWorkHours: number; minBreakMinutes: number }[] = [
  { minWorkHours: 8, minBreakMinutes: 60 },
  { minWorkHours: 4, minBreakMinutes: 30 },
]

/** §54① 단서(개정 2026.6.9, 법률 제21784호 · 부칙 §1 단서 '공포 후 6개월이 경과한 날' = 2026-12-10 시행) —
 *  근로시간이 4시간인 날, 근로자가 휴게시간을 쓰지 않겠다고 명시적으로 요청하면 휴게 없이 일할 수 있다.
 *  조문이 '근로시간이 4시간인 경우'라고만 적고 있어 이 도구는 하루 근로시간이 정확히 이 값인 날에만 적용 안내한다. */
export const BREAK_WAIVER_4H = {
  /** 시행일 'YYYY-MM-DD' (포함) */
  since: '2026-12-10',
  /** 단서가 적용되는 1일 근로시간 */
  workHours: 4,
  act: { no: 21784, promulgated: '2026-06-09' },
} as const

/** 1일 근로시간(휴게 제외) → 법정 최소 휴게시간(분). 4시간 미만이면 0 */
export function requiredBreakMinutes(workHours: number): number {
  if (!Number.isFinite(workHours) || workHours <= 0) return 0
  for (const r of BREAK_RULES) if (workHours >= r.minWorkHours) return r.minBreakMinutes
  return 0
}

/** 월 환산 주 수 — 1년 365일 ÷ 7일 ÷ 12개월 ≈ 4.345 (고용노동부 월 환산 방식) */
export const WEEKS_PER_MONTH = 365 / 7 / 12
/** 주 단위 금액·시간 → 월 환산 (부동소수 오차 흡수 후 그대로 반환 — 반올림은 호출부) */
export const toMonthly = (weekly: number): number => (weekly * 365) / 84

/** 4대보험(국민연금·건강·고용) 적용 제외 기준 — 1개월 소정근로시간 (각 법 시행령) */
export const INSURANCE_MIN_MONTHLY_HOURS = 60
/** 보험료 끝수 — 10원 미만 버림 (이 사이트 연봉·4대보험 계산기와 같은 방식) */
export const PREMIUM_ROUNDING_UNIT = 10

/** 소득세법 §129①3호 — 원천징수 대상 사업소득(인적용역) 원천징수세율 */
export const BUSINESS_WITHHOLDING_RATE = 0.03
/** 소득세법 §86 1호 개정(2023.12.31) + 시행령 §149의3 — 계속·반복적 인적용역 사업소득은 이 날짜 이후 지급분부터
 *  소액부징수(원천징수세액 1천원 미만 면제, lib/krFinancialIncomeTax SMALL_TAX_EXEMPT_LIMIT) 대상이 아니다(법 부칙 §6).
 *  → 3.3% 계산에는 소액부징수를 적용하지 않는다 */
export const BIZ_SMALL_TAX_EXEMPT_REMOVED_SINCE = '2024-07-01'

/** 최저임금법 §5② + 시행령 §3 — 수습 감액 (1년 이상 계약 · 수습 시작 후 3개월 이내 · 단순노무업무 제외) */
export const PROBATION_MIN_WAGE = { rate: 0.9, maxMonths: 3, minContractYears: 1 } as const

/* ── 규칙 함수 ───────────────────────────────────────── */

/** 부동소수 꼬리 정리 (시간 합산 6.4 + 0.2 등) */
export const tidy = (x: number): number => Math.round(x * 1e6) / 1e6

/** 주휴시간 — min(주 소정근로시간, 40) ÷ 40 × 8 (§55①·별표 2).
 *  주 소정근로시간이 15시간 미만(§18③)이거나 그 주 소정근로일을 개근하지 않았으면(시행령 §30①) 0 */
export function weeklyHolidayHours(weeklyScheduled: number, perfectAttendance = true): number {
  if (!Number.isFinite(weeklyScheduled) || weeklyScheduled < WEEKLY_HOLIDAY_MIN_HOURS || !perfectAttendance) return 0
  return tidy((Math.min(weeklyScheduled, WEEK_LEGAL_HOURS) / WEEK_LEGAL_HOURS) * DAY_LEGAL_HOURS)
}

export type HolidayPayReason = 'ok' | 'under15' | 'absent' | 'none'

/** 주휴 판정 사유 — 화면 설명용 */
export function weeklyHolidayReason(weeklyScheduled: number, perfectAttendance: boolean): HolidayPayReason {
  if (!(weeklyScheduled > 0)) return 'none'
  if (weeklyScheduled < WEEKLY_HOLIDAY_MIN_HOURS) return 'under15'
  if (!perfectAttendance) return 'absent'
  return 'ok'
}

/** 요일별 근로시간 → 소정근로시간과 법정 한도 초과분.
 *  상시 5명 이상(fivePlus): 1일 8시간·1주 40시간(§50)을 넘는 부분은 소정근로가 될 수 없으므로 연장근로로 분리한다
 *  (1일 초과분을 먼저 빼고, 남은 합계가 40시간을 넘으면 그 차이도 연장).
 *  5명 미만: §50이 적용되지 않아 전부 소정근로(가산 없음). */
export function splitLegalHours(dayHours: readonly number[], fivePlus: boolean): { scheduled: number; overflow: number } {
  const hs = dayHours.map(h => (Number.isFinite(h) && h > 0 ? h : 0))
  const total = tidy(hs.reduce((a, h) => a + h, 0))
  if (!fivePlus) return { scheduled: total, overflow: 0 }
  const dailyOver = tidy(hs.reduce((a, h) => a + Math.max(0, h - DAY_LEGAL_HOURS), 0))
  const capped = tidy(total - dailyOver)
  const weeklyOver = Math.max(0, tidy(capped - WEEK_LEGAL_HOURS))
  return { scheduled: tidy(capped - weeklyOver), overflow: tidy(dailyOver + weeklyOver) }
}

/** 휴일근로 1일 h시간 → 8시간 이내분·초과분 (§56②) */
export function splitHolidayHours(hoursPerDay: number): { within: number; over: number } {
  const h = Number.isFinite(hoursPerDay) && hoursPerDay > 0 ? hoursPerDay : 0
  return { within: Math.min(h, HOLIDAY_SPLIT_HOURS), over: tidy(Math.max(0, h - HOLIDAY_SPLIT_HOURS)) }
}

/** 시간 종류별 지급 배율 (기본 1 + 가산). 5명 미만이면 가산 없이 1 */
export function payMultiplier(kind: 'overtime' | 'night' | 'holiday' | 'holidayOver', fivePlus: boolean): number {
  if (!fivePlus) return 1
  return 1 + PREMIUM_RATES[kind]
}

/** 4대보험 요율 — 연도 키. 표(INSURANCE_RATES)에 없는 연도는 그 이전 가장 최근 연도로 대체하고 fallback=true */
export function insuranceRatesFor(year: number): { year: keyof typeof INSURANCE_RATES; rates: RateSet; fallback: boolean } {
  const years = (Object.keys(INSURANCE_RATES).map(Number) as (keyof typeof INSURANCE_RATES)[]).sort((a, b) => a - b)
  let pick = years[0]
  for (const y of years) if (y <= year) pick = y
  return { year: pick, rates: INSURANCE_RATES[pick], fallback: pick !== year }
}

/** 고용보험법 시행령 §3①(개정 2023.6.27) — '1개월간 소정근로시간이 60시간 미만이거나 1주간의 소정근로시간이 15시간 미만인 근로자'의 1주 기준.
 *  §3②: 3개월 이상 계속 근로하는 근로자·일용근로자는 그래도 적용. 2026-12-31까지의 기준 (아래 EI_INCOME_BASIS) */
export const UNEMP_MIN_WEEKLY_HOURS = 15
/** 고용보험법 시행령 §3②1호 — 이 개월 수 이상 계속 근로하면 소정근로시간과 관계없이 적용 (2027년 이후 법 §10②2호도 같은 값) */
export const UNEMP_LONG_TERM_MONTHS = 3

/** 고용보험법 §10①2호·② 개정(법률 제21473호, 2026.3.17 공포) — 적용 제외 기준이 소정근로시간(60시간·15시간)에서
 *  '보수가 대통령령으로 정하는 소득기준 미만'으로 바뀐다. 부칙 §1 단서: 제10조 개정규정은 2027-01-01 시행.
 *  부칙 §2: 2027-01-01 전에 피보험자격을 취득한 근로자는 새 기준에 못 미쳐도 최초 이직 전까지 자격 유지.
 *  §10② — 일용근로자 · 3개월 이상 계속 근로자 · 둘 이상 사업 보수 합산이 소득기준 이상인 근로자(합산 신청)는 적용.
 *  기준일 2026-09: 소득기준 금액을 정한 시행령 개정은 아직 없다(현행 시행령 2026.8.18 공포본은 §3① 시간 기준만) → incomeThreshold null */
export const EI_INCOME_BASIS = {
  /** 시행일 'YYYY-MM-DD' */
  since: '2027-01-01',
  /** 이 연도부터 소득 기준 */
  sinceYear: 2027,
  act: { no: 21473, promulgated: '2026-03-17' },
  /** 시행령 소득기준(월, 원) — 확정되면 숫자로 */
  incomeThreshold: null as number | null,
} as const

/** 국민연금법 시행령 §2 4호 단서 — 월 60시간 미만 단시간근로자라도 사업장가입자(근로자)에 포함되는 경우.
 *  이 도구는 근속·강사 여부·다른 사업장·고시 금액을 입력받지 않으므로 계산에 넣지 않고 안내만 한다.
 *  라목의 보건복지부 고시 금액은 기준일(2026-09) 현재 고시 원문을 확인하지 못해 값으로 두지 않는다. */
export interface PensionShortHourException { item: string; minMonths: number | null; text: string }
export const PENSION_SHORT_HOUR_EXCEPTIONS: readonly PensionShortHourException[] = [
  { item: '가', minMonths: 3, text: '「고등교육법」 §14②에 따른 강사' },
  { item: '나', minMonths: 3, text: '사용자의 동의를 받아 가입을 희망하는 사람' },
  { item: '다', minMonths: null, text: `둘 이상 사업장의 1개월 소정근로시간 합이 ${INSURANCE_MIN_MONTHLY_HOURS}시간 이상이면서 가입을 희망하는 사람` },
  { item: '라', minMonths: 1, text: '1개월 동안의 소득이 보건복지부장관이 고시하는 금액 이상인 사람' },
]
/** 예외 한 줄 문장 — '3개월 이상 계속 일하는 사람으로서 …' (쉼표 없이 이어 붙일 수 있게) */
export const pensionExceptionLabel = (e: PensionShortHourException): string =>
  `${e.minMonths !== null ? `${e.minMonths}개월 이상 계속 일하는 사람으로서 ` : ''}${e.text}`

export interface InsuranceCoverage {
  pension: boolean
  health: boolean
  unemp: boolean
  /** 월 소정근로시간이 60시간 미만인가 (국민연금·건강보험 제외 기준) */
  underMin: boolean
  /** 고용보험 제외 기준(월 60시간 미만 또는 주 15시간 미만)에 걸리는가 (2026년까지의 시간 기준) */
  unempUnderMin: boolean
  /** 고용보험 적용 판단 기준 — 'hours': 시행령 §3 소정근로시간(~2026) · 'income': 법 §10①2호 소득기준(2027~) */
  unempBasis: 'hours' | 'income'
  /** 소득기준 금액이 아직 정해지지 않아 적용 여부를 확정할 수 없음 (2027년 이후 · 3개월 미만) — 계산은 적용으로 가정 */
  unempPending: boolean
}

/** 4대보험(근로자 부담 3종) 적용 여부.
 *  · 국민연금(시행령 §2 4호)·건강보험(시행령 §9 1호): 월 60시간 미만 단시간근로자 제외
 *    (국민연금 §2 4호 단서 가~라목 예외는 입력이 없어 계산에 넣지 않는다 — PENSION_SHORT_HOUR_EXCEPTIONS)
 *  · 고용보험 ~2026(시행령 §3①·②): 월 60시간 미만 또는 주 15시간 미만 제외 — 3개월 이상 계속 근로(longTerm)면 적용
 *  · 고용보험 2027~(법 §10①2호·②, EI_INCOME_BASIS): 시간 기준 폐지. 3개월 이상이면 적용 확정,
 *    3개월 미만이면 보수가 시행령 소득기준 이상인지에 달렸는데 그 금액이 미정이라 적용으로 가정하고 unempPending=true */
export function insuranceCoverage(
  monthlyScheduledHours: number, weeklyScheduledHours: number, longTerm: boolean,
  year: number = EI_INCOME_BASIS.sinceYear - 1, monthlyPay = 0,
): InsuranceCoverage {
  const underMin = !(monthlyScheduledHours >= INSURANCE_MIN_MONTHLY_HOURS)
  const unempUnderMin = underMin || !(weeklyScheduledHours >= UNEMP_MIN_WEEKLY_HOURS)
  const worked = monthlyScheduledHours > 0
  const incomeBasis = year >= EI_INCOME_BASIS.sinceYear
  const threshold = EI_INCOME_BASIS.incomeThreshold
  const unempPending = incomeBasis && worked && !longTerm && threshold === null
  const unemp = !worked ? false
    : !incomeBasis ? (!unempUnderMin || longTerm)
    : longTerm || threshold === null || monthlyPay >= threshold
  return {
    pension: !underMin,
    health: !underMin,
    unemp,
    underMin,
    unempUnderMin,
    unempBasis: incomeBasis ? 'income' : 'hours',
    unempPending,
  }
}

/** 월 60시간이 되는 최소 주 소정근로시간 (60 ÷ 4.345… = 13.81시간) — 가이드 표기용, 소수 둘째 자리 올림 */
export const MONTHLY60_MIN_WEEKLY_HOURS = Math.ceil((INSURANCE_MIN_MONTHLY_HOURS / WEEKS_PER_MONTH) * 100) / 100
