/* ──────────────────────────────────────────────────────
   finance/hourly-pay/hourlyPayUtils.ts
   알바 급여·주휴수당 계산 (순수 함수) — 법정 수치는 전부 lib 단일 소스
     · 주휴·가산·휴게·월 환산·60시간 규칙·3.3%: lib/krHourlyPay.ts
     · 최저시급·월 209시간·4대보험 요율·국민연금 연도별 법정 요율·상·하한: lib/krInsuranceRates.ts
     · 지방소득세 비율·세액 끝수: lib/krFinancialIncomeTax.ts
   금액 끝수: 주급 항목은 원 미만 버림, 월 환산은 주급 × 365 ÷ 84 원 미만 버림, 세금·보험료는 10원 미만 버림.
   ────────────────────────────────────────────────────── */

import {
  MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, minHourlyWageFor, pensionBaseAt, clampPensionBase, pensionTotalRateFor,
  type PensionBasePeriod,
} from '@/lib/krInsuranceRates'
import { LOCAL_INCOME_TAX_RATIO, TAX_ROUNDING_UNIT } from '@/lib/krFinancialIncomeTax'
import {
  BUSINESS_WITHHOLDING_RATE, PREMIUM_RATES, PREMIUM_ROUNDING_UNIT, OVERTIME_WEEKLY_LIMIT,
  WEEK_LEGAL_HOURS, DAY_LEGAL_HOURS, PROBATION_MIN_WAGE, BREAK_WAIVER_4H,
  weeklyHolidayHours, weeklyHolidayReason, splitLegalHours, splitHolidayHours, payMultiplier,
  requiredBreakMinutes, insuranceRatesFor, insuranceCoverage, toMonthly, tidy,
  type HolidayPayReason, type InsuranceCoverage,
} from '@/lib/krHourlyPay'

/* ── 입력 타입·상한 ──────────────────────────────────── */

export type PayYear = 2026 | 2027
export const PAY_YEARS: readonly PayYear[] = [2026, 2027]
export const isPayYear = (v: unknown): v is PayYear => PAY_YEARS.includes(v as PayYear)

/** 오늘 날짜('YYYY-MM-DD', lib/date todayStr) → 기본 적용 연도. 표 범위 밖이면 가장 가까운 끝 연도로 */
export function defaultPayYear(today: string): PayYear {
  const y = Number(today.slice(0, 4))
  const first = PAY_YEARS[0]
  const last = PAY_YEARS[PAY_YEARS.length - 1]
  if (!Number.isFinite(y) || y <= first) return first
  if (y >= last) return last
  return isPayYear(y) ? y : first
}

export type PatternMode = 'simple' | 'byDay'
export const isPatternMode = (v: unknown): v is PatternMode => v === 'simple' || v === 'byDay'

export type Deduction = 'none' | 'biz33' | 'insurance'
export const DEDUCTIONS: readonly Deduction[] = ['none', 'biz33', 'insurance']
export const isDeduction = (v: unknown): v is Deduction => DEDUCTIONS.includes(v as Deduction)

export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const

export const MAX_HOURLY = 1_000_000
export const MAX_DAY_HOURS = 24
export const MAX_BREAK_MINUTES = 600
export const MAX_WEEK_EXTRA_HOURS = 100
export const MAX_NIGHT_HOURS = 7 * 8   // 22~06시 = 하루 8시간 × 7일

export interface HourlyPayInput {
  year: PayYear
  /** 시급 (원) */
  hourly: number
  mode: PatternMode
  /** simple: 주 근무일수 */
  days: number
  /** simple: 하루 근무시간 */
  hoursPerDay: number
  /** byDay: 월~일 7칸 (시간) */
  byDay: readonly number[]
  /** 입력한 하루 시간이 출근~퇴근(휴게 포함)인가 — true면 휴게시간을 빼서 유급 근로시간으로 본다 */
  includesBreak: boolean
  /** 하루 휴게시간 (분) */
  breakMinutes: number
  /** 소정근로 외 추가 근무 (주, 시간) */
  overtimeHours: number
  /** 22~06시 근무시간 합계 (주, 시간) — 위 시간 안에 포함된 부분 */
  nightHours: number
  /** 휴일(주휴일·약정휴일)에 일한 날 수 (주) */
  holidayDays: number
  /** 휴일근로 하루 시간 */
  holidayHoursPerDay: number
  /** 상시 근로자 5명 이상 사업장 */
  fivePlus: boolean
  /** 그 주 소정근로일 개근 */
  perfectAttendance: boolean
  deduction: Deduction
  /** 3개월 이상 계속 근무 (월 60시간 미만일 때 고용보험 적용 판단) */
  longTerm: boolean
}

/** 가이드 예시·테스트용 기본 입력 — 연도는 표의 첫 해(화면의 기본 연도는 오늘 날짜로 defaultPayYear가 정한다) */
export const DEFAULT_INPUT: HourlyPayInput = {
  year: PAY_YEARS[0],
  hourly: minHourlyWageFor(PAY_YEARS[0]),
  mode: 'simple',
  days: 5,
  hoursPerDay: 4,
  byDay: [4, 4, 4, 4, 4, 0, 0],
  includesBreak: false,
  breakMinutes: 30,
  overtimeHours: 0,
  nightHours: 0,
  holidayDays: 0,
  holidayHoursPerDay: 8,
  fivePlus: true,
  perfectAttendance: true,
  deduction: 'none',
  longTerm: true,
}

/* ── 결과 타입 ───────────────────────────────────────── */

export type PayLineKey = 'base' | 'weeklyHoliday' | 'overtime' | 'night' | 'holiday'

export interface PayLine {
  key: PayLineKey
  label: string
  /** 대상 시간 (주) */
  hours: number
  /** 지급 배율 (야간은 가산분만이라 0.5) */
  multiplier: number
  /** 주 금액 (원 미만 버림) */
  amount: number
  /** 그중 가산분 (원) */
  premium: number
}

export type DeductionKey = 'incomeTax' | 'localTax' | 'pension' | 'health' | 'ltc' | 'unemp'

export interface DeductionLine {
  key: DeductionKey
  label: string
  amount: number
  /** 적용 제외(0원)인 이유 등 */
  excluded?: boolean
}

export interface HourlyPayResult {
  input: HourlyPayInput
  minWage: number
  belowMinWage: boolean
  /** 수습 감액 하한 (최저임금 × 90%, 원 미만 버림) */
  probationFloor: number
  /** 요일별 유급 근로시간 (휴게 차감 후, 7칸) */
  dayHours: number[]
  workDays: number
  /** 법정 휴게 미달 일수 · 그날 필요한 최소 휴게(분) */
  breakShortDays: number
  breakRequiredMax: number
  /** 그중 하루 근로시간이 정확히 4시간인 날 수 — §54① 단서(2026-12-10 시행) 대상 (BREAK_WAIVER_4H) */
  breakShortWaivable: number
  /** 주 소정근로시간 (5명 이상은 1일 8시간·주 40시간까지) */
  scheduled: number
  /** 법정 한도(8h/40h)를 넘어 연장으로 옮긴 시간 */
  autoOvertime: number
  /** 연장근로 합계 = autoOvertime + 입력한 추가근무 */
  overtime: number
  /** 실제 계산에 쓴 휴일근로 일수 (근무일과 합쳐 7일 이내로 클램프) */
  holidayDaysUsed: number
  holidayWorkHours: number
  holidayWithin: number
  holidayOver: number
  /** 야간 가산 대상 시간 (총 근로시간을 넘지 않게 클램프) */
  night: number
  totalWorkHours: number
  weeklyHolidayHours: number
  holidayReason: HolidayPayReason
  lines: PayLine[]
  weekly: number
  premiumWeekly: number
  monthlyGross: number
  monthlyScheduledHours: number
  monthlyPaidHours: number
  /** 주휴 포함 실질 시급 = (기본급 + 주휴수당) ÷ 주 소정근로시간 */
  effectiveHourly: number
  /** 주 40시간 월급제 기준 월급 = 시급 × 209 */
  fullTime209: number
  deductions: DeductionLine[]
  deductionTotal: number
  monthlyNet: number
  coverage: InsuranceCoverage | null
  /** 건강·장기요양·고용보험 요율 연도 (국민연금은 pensionRate) */
  ratesYear: number
  /** 선택 연도의 건강·장기요양·고용보험 요율이 표에 없어 ratesYear 요율로 대신했는가 */
  ratesFallback: boolean
  /** 국민연금 근로자 요율(%) — 국민연금법 부칙 §4① 연도별 법정 요율의 절반 (lib pensionTotalRateFor) */
  pensionRate: number
  pensionPeriod: PensionBasePeriod
  /** 5명 이상 · 소정근로 밖 근로(연장 + 휴일)가 주 12시간을 넘는가 (§53① 주 52시간 · 기간제법 §6①) */
  overtimeOverLimit: boolean
  /** 최저시급으로 같은 근무를 했을 때 월 급여 − 실제 월 급여 (미달일 때만 양수) */
  minWageShortfallMonthly: number
}

/* ── 끝수 ─────────────────────────────────────────────── */

/** 원 미만 버림 (부동소수 꼬리 흡수) */
export const wonFloor = (x: number): number => Math.floor(x + 1e-6)
/** unit원 미만 버림 */
export const floorUnit = (x: number, unit: number): number => Math.floor(x / unit + 1e-9) * unit
/** % → 소수 (4.75 → 0.0475, 부동소수 오차 제거 — salaryUtils와 같은 방식) */
const frac = (pct: number): number => Math.round(pct * 1e6) / 1e8

const clamp = (v: number, lo: number, hi: number): number => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo)

/** 입력 정규화 — 음수·NaN·과대값을 상한으로 */
export function normalizeInput(i: HourlyPayInput): HourlyPayInput {
  const byDay = Array.from({ length: 7 }, (_, k) => clamp(Number(i.byDay?.[k] ?? 0), 0, MAX_DAY_HOURS))
  return {
    year: isPayYear(i.year) ? i.year : DEFAULT_INPUT.year,
    hourly: clamp(i.hourly, 0, MAX_HOURLY),
    mode: isPatternMode(i.mode) ? i.mode : 'simple',
    days: Math.floor(clamp(i.days, 0, 7)),
    hoursPerDay: clamp(i.hoursPerDay, 0, MAX_DAY_HOURS),
    byDay,
    includesBreak: !!i.includesBreak,
    breakMinutes: clamp(i.breakMinutes, 0, MAX_BREAK_MINUTES),
    overtimeHours: clamp(i.overtimeHours, 0, MAX_WEEK_EXTRA_HOURS),
    nightHours: clamp(i.nightHours, 0, MAX_NIGHT_HOURS),
    holidayDays: Math.floor(clamp(i.holidayDays, 0, 7)),
    holidayHoursPerDay: clamp(i.holidayHoursPerDay, 0, MAX_DAY_HOURS),
    fivePlus: !!i.fivePlus,
    perfectAttendance: !!i.perfectAttendance,
    deduction: isDeduction(i.deduction) ? i.deduction : 'none',
    longTerm: !!i.longTerm,
  }
}

/** 입력한 하루 시간(7칸) — simple은 앞에서부터 days일 */
export function rawDayHours(i: HourlyPayInput): number[] {
  if (i.mode === 'byDay') return [...i.byDay]
  return Array.from({ length: 7 }, (_, k) => (k < i.days ? i.hoursPerDay : 0))
}

/* ── 본 계산 ─────────────────────────────────────────── */

export function calcHourlyPay(raw: HourlyPayInput): HourlyPayResult {
  const input = normalizeInput(raw)
  const h = input.hourly
  const brk = input.breakMinutes / 60

  // 유급 근로시간 = 입력 시간(휴게 포함이면 휴게 차감)
  const entered = rawDayHours(input)
  const dayHours = entered.map(x => (x > 0 ? tidy(Math.max(0, input.includesBreak ? x - brk : x)) : 0))
  const workDays = dayHours.filter(x => x > 0).length

  // 휴게 점검 (§54①) — 근무한 날마다 유급 근로시간 기준
  let breakShortDays = 0
  let breakRequiredMax = 0
  let breakShortWaivable = 0
  for (const x of dayHours) {
    if (x <= 0) continue
    const req = requiredBreakMinutes(x)
    breakRequiredMax = Math.max(breakRequiredMax, req)
    if (input.breakMinutes < req) {
      breakShortDays++
      if (x === BREAK_WAIVER_4H.workHours) breakShortWaivable++
    }
  }

  const { scheduled, overflow } = splitLegalHours(dayHours, input.fivePlus)
  const overtime = tidy(overflow + input.overtimeHours)

  // 휴일근로 — 근무일과 합쳐 주 7일을 넘지 않게
  const holidayDays = Math.min(input.holidayDays, Math.max(0, 7 - workDays))
  const hs = splitHolidayHours(input.holidayHoursPerDay)
  const holidayWithin = tidy(hs.within * holidayDays)
  const holidayOver = tidy(hs.over * holidayDays)
  const holidayWorkHours = tidy(holidayWithin + holidayOver)

  const totalWorkHours = tidy(scheduled + overtime + holidayWorkHours)
  const night = Math.min(input.nightHours, totalWorkHours)

  const whh = weeklyHolidayHours(scheduled, input.perfectAttendance)
  const holidayReason = weeklyHolidayReason(scheduled, input.perfectAttendance)

  const fp = input.fivePlus
  const mOver = payMultiplier('overtime', fp)
  const mHol = payMultiplier('holiday', fp)
  const mHolOver = payMultiplier('holidayOver', fp)
  const nightRate = fp ? PREMIUM_RATES.night : 0

  const line = (key: PayLineKey, label: string, hours: number, multiplier: number, baseAmount: number): PayLine => {
    const amount = wonFloor(hours * h * multiplier)
    return { key, label, hours, multiplier, amount, premium: Math.max(0, amount - wonFloor(baseAmount)) }
  }
  const holidayAmount = wonFloor(h * (holidayWithin * mHol + holidayOver * mHolOver))
  const lines: PayLine[] = [
    line('base', '기본급', scheduled, 1, scheduled * h),
    line('weeklyHoliday', '주휴수당', whh, 1, whh * h),
    line('overtime', '연장근로', overtime, mOver, overtime * h),
    line('night', '야간 가산', night, nightRate, 0),
    {
      key: 'holiday', label: '휴일근로', hours: holidayWorkHours,
      multiplier: holidayWorkHours > 0 ? tidy(holidayAmount / (holidayWorkHours * h || 1)) : mHol,
      amount: holidayAmount, premium: Math.max(0, holidayAmount - wonFloor(holidayWorkHours * h)),
    },
  ]
  const weekly = lines.reduce((a, l) => a + l.amount, 0)
  const premiumWeekly = lines.reduce((a, l) => a + l.premium, 0)
  const monthlyGross = wonFloor(toMonthly(weekly))

  const monthlyScheduledHours = tidy(toMonthly(scheduled))
  const monthlyPaidHours = tidy(toMonthly(scheduled + whh))
  const effectiveHourly = scheduled > 0 ? wonFloor((lines[0].amount + lines[1].amount) / scheduled) : 0
  const fullTime209 = wonFloor(h * MONTHLY_WORK_HOURS)

  // 공제 (월)
  const rf = insuranceRatesFor(input.year)
  const pensionRate = pensionTotalRateFor(input.year) / 2
  const pensionPeriod = pensionBaseAt(`${input.year}-12`)
  let deductions: DeductionLine[] = []
  let coverage: InsuranceCoverage | null = null
  if (input.deduction === 'biz33') {
    const incomeTax = floorUnit(monthlyGross * BUSINESS_WITHHOLDING_RATE, TAX_ROUNDING_UNIT)
    const localTax = floorUnit(incomeTax * LOCAL_INCOME_TAX_RATIO, TAX_ROUNDING_UNIT)
    deductions = [
      { key: 'incomeTax', label: '사업소득세', amount: incomeTax },
      { key: 'localTax', label: '지방소득세', amount: localTax },
    ]
  } else if (input.deduction === 'insurance') {
    const r = rf.rates
    coverage = insuranceCoverage(monthlyScheduledHours, scheduled, input.longTerm, input.year, monthlyGross)
    const pensionBase = clampPensionBase(monthlyGross, pensionPeriod)
    const ltcRatio = Math.round((r.ltc.rateOfSalary / r.health.total) * 1e4) / 1e4
    const pension = coverage.pension ? floorUnit(pensionBase * frac(pensionRate), PREMIUM_ROUNDING_UNIT) : 0
    const health = coverage.health ? floorUnit(monthlyGross * frac(r.health.employee), PREMIUM_ROUNDING_UNIT) : 0
    const ltc = coverage.health ? floorUnit(health * ltcRatio, PREMIUM_ROUNDING_UNIT) : 0
    const unemp = coverage.unemp ? floorUnit(monthlyGross * frac(r.unemp.employee), PREMIUM_ROUNDING_UNIT) : 0
    deductions = [
      { key: 'pension', label: '국민연금', amount: pension, excluded: !coverage.pension },
      { key: 'health', label: '건강보험', amount: health, excluded: !coverage.health },
      { key: 'ltc', label: '장기요양보험', amount: ltc, excluded: !coverage.health },
      { key: 'unemp', label: '고용보험', amount: unemp, excluded: !coverage.unemp },
    ]
  }
  const deductionTotal = deductions.reduce((a, d) => a + d.amount, 0)

  const minWage = minHourlyWageFor(input.year)
  const belowMinWage = h > 0 && h < minWage
  const minWageShortfallMonthly = belowMinWage
    ? Math.max(0, calcHourlyPay({ ...input, hourly: minWage, deduction: 'none' }).monthlyGross - monthlyGross)
    : 0

  return {
    input, minWage, belowMinWage,
    probationFloor: wonFloor(minWage * PROBATION_MIN_WAGE.rate),
    dayHours, workDays, breakShortDays, breakRequiredMax, breakShortWaivable,
    scheduled, autoOvertime: overflow, overtime,
    holidayDaysUsed: holidayDays, holidayWorkHours, holidayWithin, holidayOver, night, totalWorkHours,
    weeklyHolidayHours: whh, holidayReason,
    lines, weekly, premiumWeekly, monthlyGross,
    monthlyScheduledHours, monthlyPaidHours, effectiveHourly, fullTime209,
    deductions, deductionTotal, monthlyNet: monthlyGross - deductionTotal,
    coverage, ratesYear: rf.year, ratesFallback: rf.fallback, pensionRate, pensionPeriod,
    overtimeOverLimit: fp && tidy(totalWorkHours - scheduled) > OVERTIME_WEEKLY_LIMIT,
    minWageShortfallMonthly,
  }
}

/* ── 가이드 표 (빌드 시 생성) ─────────────────────────── */

/** 주 소정근로시간 h를 주 5일에 고르게 나눈 기본 패턴 (5명 이상 · 개근 · 가산 없음) */
export function evenWeek(year: PayYear, weeklyHours: number, hourly = minHourlyWageFor(year)): HourlyPayResult {
  const perDay = weeklyHours / 5
  return calcHourlyPay({ ...DEFAULT_INPUT, year, hourly, mode: 'byDay', byDay: [perDay, perDay, perDay, perDay, perDay, 0, 0] })
}

export interface HolidayTableRow {
  weeklyHours: number
  holidayHours: number
  monthlyScheduledHours: number
  insured: boolean
  /** 연도별 [주휴수당(주), 월 급여] */
  byYear: { year: PayYear; weeklyHolidayPay: number; monthlyGross: number }[]
}

/** 표 — 주 소정근로시간별 주휴시간·월 소정시간·4대보험 적용·연도별 주휴수당·월 급여 (최저시급 기준) */
export function holidayTable(hoursList: readonly number[]): HolidayTableRow[] {
  return hoursList.map(wh => {
    const first = evenWeek(PAY_YEARS[0], wh)
    return {
      weeklyHours: wh,
      holidayHours: first.weeklyHolidayHours,
      monthlyScheduledHours: first.monthlyScheduledHours,
      insured: !insuranceCoverage(first.monthlyScheduledHours, wh, false).underMin,
      byYear: PAY_YEARS.map(y => {
        const r = evenWeek(y, wh)
        return { year: y, weeklyHolidayPay: r.lines[1].amount, monthlyGross: r.monthlyGross }
      }),
    }
  })
}

export interface MinWageRow { year: number; hourly: number; withHoliday: number; weekly40: number; monthly209: number }

/** 표 — 연도별 최저시급·주휴 포함 시급·주 40시간 주급·월 209시간 환산 (lib MIN_HOURLY_WAGE 전 연도) */
export function minWageTable(): MinWageRow[] {
  return (Object.keys(MIN_HOURLY_WAGE).map(Number) as (keyof typeof MIN_HOURLY_WAGE)[])
    .sort((a, b) => a - b)
    .map(y => {
      const w = MIN_HOURLY_WAGE[y]
      const holiday = weeklyHolidayHours(WEEK_LEGAL_HOURS)
      return {
        year: y,
        hourly: w,
        withHoliday: wonFloor((w * (WEEK_LEGAL_HOURS + holiday)) / WEEK_LEGAL_HOURS),
        weekly40: wonFloor(w * (WEEK_LEGAL_HOURS + holiday)),
        monthly209: wonFloor(w * MONTHLY_WORK_HOURS),
      }
    })
}

/** 1일 근로시간 d시간을 주 n일 하는 5명 이상 근로자의 소정·연장 분리 (가이드 예시용) */
export const legalSplitExample = (perDay: number, days: number) =>
  splitLegalHours(Array.from({ length: 7 }, (_, k) => (k < days ? perDay : 0)), true)

export { DAY_LEGAL_HOURS }

/* ── 입력 문자열 도우미 (dsr 패턴) ───────────────────── */

/** 금액 입력 → 콤마 문자열 */
export function commaInput(v: string): string {
  const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
  return d ? Number(d.slice(0, 15)).toLocaleString('ko-KR') : ''
}
/** 콤마 문자열 → 숫자 (parseFloat 기반) */
export function parseMoney(v: string): number {
  const x = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(x) ? x : 0
}
/** 소수 입력 — 숫자와 첫 번째 점만, 소수 둘째 자리까지 */
export function decimalInput(v: string, maxDecimals = 2): string {
  let s = v.replace(/[^\d.]/g, '')
  const dot = s.indexOf('.')
  if (dot >= 0) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, maxDecimals)
  return s
}
/** 소수 문자열 → 숫자 (빈 값·점만 있으면 0) */
export const parseDec = (v: string): number => {
  const x = parseFloat(v)
  return Number.isFinite(x) ? x : 0
}

/* ── 표기 ─────────────────────────────────────────────── */

export const won = (n: number): string => Math.round(n).toLocaleString('ko-KR')
/** 시간 표기 — 소수 둘째 자리까지, 불필요한 0 제거 (6.4 · 104.29 · 20) */
export const hrs = (n: number): string => (Math.round(n * 100) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
export const manwon = (n: number): string => `${(Math.round(n / 1000) / 10).toLocaleString('ko-KR')}만원`
export const pct = (rate: number): string => `${Math.round(rate * 1000) / 10}%`
