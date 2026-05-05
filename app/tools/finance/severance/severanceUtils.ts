/* 퇴직금 실수령액 계산기 — 데이터·계산 유틸 (2023 개정 세법 반영) */

export type PensionMode = 'normal' | 'db' | 'dc' | 'irp'

/* ─────────────────────────────────────────────
   날짜 유틸
   ───────────────────────────────────────────── */

/** YYYY-MM-DD → Date */
export function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

/** Date → YYYY-MM-DD */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** 두 날짜 사이 일수 (포함, +1) */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / 86400000) + 1
}

/** 날짜에 일수 더하기 */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

/** 날짜에 개월 더하기 (음수 가능) */
export function addMonths(d: Date, months: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + months)
  return r
}

/** 퇴사 전 3개월 산정기간
 *  퇴사일이 5월 31일이면 → 2월 28일 ~ 5월 30일 (3개월 전 → 퇴사 전날)
 */
export function calcThreeMonthPeriod(exitDate: Date): { start: Date; end: Date; days: number } {
  const end = addDays(exitDate, -1)        // 퇴사 전날
  const start = addMonths(end, -3)         // 3개월 전 같은 날 + 1일
  // 정확히는 3개월 전 + 1일로 설정 (3개월 = 약 89~92일)
  const startCorrected = addDays(start, 1)
  return {
    start: startCorrected,
    end,
    days: daysBetween(startCorrected, end),
  }
}

/** 산정기간을 월별 3구간으로 분할 (월별 입력 칸용) */
export function splitMonths(start: Date, end: Date): { label: string; from: Date; to: Date; days: number }[] {
  const result: { label: string; from: Date; to: Date; days: number }[] = []
  const months: { y: number; m: number }[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    months.push({ y: cur.getFullYear(), m: cur.getMonth() })
    cur.setMonth(cur.getMonth() + 1)
  }
  months.forEach(({ y, m }) => {
    const monthStart = new Date(y, m, 1)
    const monthEnd = new Date(y, m + 1, 0)
    const from = monthStart < start ? start : monthStart
    const to = monthEnd > end ? end : monthEnd
    if (from <= to) {
      const label = `${y}년 ${m + 1}월 ${from.getDate()}일~${to.getDate()}일`
      result.push({ label, from, to, days: daysBetween(from, to) })
    }
  })
  return result
}

/* ─────────────────────────────────────────────
   평균임금 / 통상임금
   ───────────────────────────────────────────── */

export interface WageInputs {
  monthlyBase: number[]       // 각 구간 기본급 (만원)
  monthlyAllowance: number[]  // 각 구간 고정수당 (만원)
  yearlyBonusMan: number      // 최근 1년 상여금 총액 (만원)
  unusedLeaveMan: number      // 미사용 연차수당 (만원)
}

/** 3개월 임금 총액 (만원) */
export function calcThreeMonthTotal(inp: WageInputs): {
  baseTotal: number
  allowanceTotal: number
  bonusPortion: number
  leavePortion: number
  total: number
} {
  const baseTotal = inp.monthlyBase.reduce((a, b) => a + b, 0)
  const allowanceTotal = inp.monthlyAllowance.reduce((a, b) => a + b, 0)
  const bonusPortion = inp.yearlyBonusMan * 3 / 12
  const leavePortion = inp.unusedLeaveMan * 3 / 12
  const total = baseTotal + allowanceTotal + bonusPortion + leavePortion
  return { baseTotal, allowanceTotal, bonusPortion, leavePortion, total }
}

/** 1일 평균임금 (만원) */
export function calcAverageWageDaily(threeMonthTotalMan: number, periodDays: number): number {
  return periodDays > 0 ? threeMonthTotalMan / periodDays : 0
}

/** 1일 통상임금 (만원)
 *  월 통상임금 = 기본급 + 고정수당 (변동 X)
 *  1일 통상임금 = 월 통상임금 / 209 × 1일 소정시간
 *  본 도구: 마지막 월의 기본급+고정수당을 통상으로 가정
 */
export function calcOrdinaryWageDaily(
  monthlyOrdinaryMan: number,
  workHoursPerDay: number,
  monthlyHours = 209,
): number {
  const hourlyMan = monthlyOrdinaryMan / monthlyHours
  return hourlyMan * workHoursPerDay
}

/* ─────────────────────────────────────────────
   퇴직금 (만원)
   퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
   ───────────────────────────────────────────── */

export function calcSeverance(dailyWageMan: number, daysWorked: number): number {
  return dailyWageMan * 30 * (daysWorked / 365)
}

/* ─────────────────────────────────────────────
   퇴직소득세 (2023 개정)
   ───────────────────────────────────────────── */

/** 근속연수공제 (만원, N = 근속연수) */
export function deductionByYears(years: number): number {
  if (years <= 0) return 0
  if (years <= 5) return 100 * years
  if (years <= 10) return 500 + 200 * (years - 5)
  if (years <= 20) return 1500 + 250 * (years - 10)
  return 4000 + 300 * (years - 20)
}

/** 환산급여공제 (만원) */
export function envDeduction(envWageMan: number): number {
  if (envWageMan <= 800) return envWageMan
  if (envWageMan <= 7000) return 800 + (envWageMan - 800) * 0.6
  if (envWageMan <= 10000) return 4520 + (envWageMan - 7000) * 0.55
  if (envWageMan <= 30000) return 6170 + (envWageMan - 10000) * 0.45
  return 15170 + (envWageMan - 30000) * 0.35
}

/** 누진세율 (만원 기준)
 *  소득세법 §55 (2025 기준)
 */
const TAX_BRACKETS = [
  { up: 1400,   rate: 0.06,  cumPrev: 0 },
  { up: 5000,   rate: 0.15,  cumPrev: 84 },     // 1400 × 6% = 84
  { up: 8800,   rate: 0.24,  cumPrev: 624 },    // 84 + (5000-1400)×15%
  { up: 15000,  rate: 0.35,  cumPrev: 1536 },
  { up: 30000,  rate: 0.38,  cumPrev: 3706 },
  { up: 50000,  rate: 0.40,  cumPrev: 9406 },
  { up: 100000, rate: 0.42,  cumPrev: 17406 },
  { up: Infinity, rate: 0.45, cumPrev: 38406 },
]

/** 과세표준 → 산출세액 (만원) */
export function calcIncomeTax(taxableMan: number): number {
  if (taxableMan <= 0) return 0
  let prevUp = 0
  for (const b of TAX_BRACKETS) {
    if (taxableMan <= b.up) {
      return b.cumPrev + (taxableMan - prevUp) * b.rate
    }
    prevUp = b.up
  }
  return 0
}

/** 퇴직소득세 (만원) — 2023 개정 */
export interface SeveranceTaxResult {
  yearsTax: number             // 세법상 근속연수 (1년 미만 절상)
  yearsDeduction: number       // 근속연수공제 (만원)
  envWage: number              // 환산급여 (만원)
  envDeduction: number         // 환산급여공제 (만원)
  taxBase: number              // 과세표준 (만원)
  rawTax: number               // 산출세액 (만원)
  incomeTax: number            // 퇴직소득세 (rawTax × N / 12)
  localTax: number             // 지방소득세 (incomeTax × 10%)
  totalTax: number             // 합계 (만원)
  netSeverance: number         // 실수령 (만원)
  taxRatePct: number           // 세율 (%)
}

export function calcSeveranceTax(severanceMan: number, daysWorked: number): SeveranceTaxResult {
  /* 세법상 근속연수: 1년 미만은 절상하여 1년으로 (소득세법 §49) */
  const yearsRaw = daysWorked / 365
  const yearsTax = Math.ceil(yearsRaw)
  if (yearsTax <= 0 || severanceMan <= 0) {
    return {
      yearsTax: 0, yearsDeduction: 0, envWage: 0, envDeduction: 0,
      taxBase: 0, rawTax: 0, incomeTax: 0, localTax: 0, totalTax: 0,
      netSeverance: severanceMan, taxRatePct: 0,
    }
  }

  const yearsDed = deductionByYears(yearsTax)
  const remained = Math.max(0, severanceMan - yearsDed)
  const envWage = remained * 12 / yearsTax
  const envDed = envDeduction(envWage)
  const taxBase = Math.max(0, envWage - envDed)
  const rawTax = calcIncomeTax(taxBase)
  /* 퇴직소득세 = 산출세액 × 근속연수 / 12 */
  const incomeTax = rawTax * yearsTax / 12
  const localTax = incomeTax * 0.1
  const totalTax = incomeTax + localTax
  const netSeverance = severanceMan - totalTax
  const taxRatePct = severanceMan > 0 ? (totalTax / severanceMan) * 100 : 0

  return {
    yearsTax, yearsDeduction: yearsDed, envWage, envDeduction: envDed,
    taxBase, rawTax, incomeTax, localTax, totalTax, netSeverance, taxRatePct,
  }
}

/* ─────────────────────────────────────────────
   적격성 진단
   ───────────────────────────────────────────── */

export interface Eligibility {
  eligible: boolean
  daysWorked: number
  yearsRaw: number
  reasons: string[]
  warnings: string[]
}

export function checkEligibility(start: Date, end: Date, weekHours: number): Eligibility {
  const daysWorked = daysBetween(start, end) // 입사일~퇴사일 포함
  const yearsRaw = daysWorked / 365.25
  const reasons: string[] = []
  const warnings: string[] = []

  if (daysWorked < 365) {
    reasons.push(`계속근로기간 ${daysWorked}일 (1년 ${365 - daysWorked}일 부족) — 법정 퇴직금 발생 X`)
  }
  if (weekHours < 15) {
    reasons.push(`주 ${weekHours}시간 (15시간 미만) — 법정 퇴직금 발생 X`)
  }
  if (daysWorked >= 365 && daysWorked < 730) {
    warnings.push(`1년 이상 2년 미만 — 1년치 퇴직금만 해당`)
  }
  return {
    eligible: reasons.length === 0,
    daysWorked, yearsRaw,
    reasons, warnings,
  }
}

/* ─────────────────────────────────────────────
   퇴직연금 모드
   ───────────────────────────────────────────── */

export interface PensionMeta {
  id: PensionMode
  emoji: string
  label: string
  desc: string
  calculatedSame: boolean   // 일반 퇴직금과 동일 계산?
}

export const PENSIONS: PensionMeta[] = [
  { id: 'normal', emoji: '💼', label: '일반 퇴직금',  desc: '근로기준법 기준 법정 퇴직금. 회사가 직접 지급.', calculatedSame: true },
  { id: 'db',     emoji: '🏦', label: 'DB형 퇴직연금', desc: '확정급여형 — 평균임금 × 30 × 근속/365 (일반과 동일).',  calculatedSame: true },
  { id: 'dc',     emoji: '📊', label: 'DC형 퇴직연금', desc: '확정기여형 — 회사 적립 + 근로자 운용. 결과 변동.',     calculatedSame: false },
  { id: 'irp',    emoji: '🏛️', label: 'IRP 수령',     desc: '5,500만원 초과 시 의무 이전. 연금 수령 시 절세.',       calculatedSame: true },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtMan(man: number): string {
  if (Math.abs(man) >= 10000) {
    const eok = man / 10000
    return `${fmt(eok, eok < 10 ? 2 : 1)}억`
  }
  if (Math.abs(man) >= 1) return `${fmt(man, 0)}만원`
  return `${fmt(man * 10000, 0)}원`
}

export function fmtDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}
