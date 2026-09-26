/* annual-leave — 표시 포맷·입력 파싱·가이드 표 생성. 계산 규칙은 전부 lib/krLabor.ts(단일 소스) */
import {
  calcAnnualLeave, leaveSchedule, sumDays, parseYmd, fmtYmd, addDays, diffDays, prorataLeave, round2,
  firstFiscalStartAfter, dailyWageFromHourly, ANNUAL_LEAVE, DAILY_WORK_HOURS,
  type AnnualLeaveInput, type LeaveGrant, type LeaveKind, type LeaveBasis, type ProrataRounding,
} from '@/lib/krLabor'
import { MIN_HOURLY_WAGE, WORK_HOURS_WEEK } from '@/lib/krInsuranceRates'

/* ── 포맷 ─────────────────────────────────────────── */

export const won = (n: number) => Math.floor(n).toLocaleString('ko-KR')

/** 일수 — 정수는 그대로, 소수는 둘째 자리까지(끝 0 제거) */
export function fmtDays(n: number): string {
  const r = round2(n)
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** 'YYYY-MM-DD' → '2026.03.01' */
export const dotDate = (ymd: string) => ymd.replace(/-/g, '.')

/** 'YYYY-MM-DD' → '2026년 3월 1일' */
export function korDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  return m ? `${Number(m[1])}년 ${Number(m[2])}월 ${Number(m[3])}일` : ymd
}

/* ── 입력 ─────────────────────────────────────────── */

/** 금액 입력 — 숫자만 남기고 실시간 콤마 (최대 12자리) */
export function commaInput(v: string): string {
  const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '').slice(0, 12)
  return d ? Number(d).toLocaleString('ko-KR') : ''
}
export const parseMoney = (v: string): number => {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
/** 소수 입력 — 숫자와 점 하나만, 소수 둘째 자리까지 */
export function decimalInput(v: string): string {
  const cleaned = v.replace(/[^\d.]/g, '')
  const [i, ...rest] = cleaned.split('.')
  const int = i.slice(0, 4)
  return rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int
}
export const digitsInput = (v: string, max: number) => v.replace(/[^\d]/g, '').slice(0, max)

export type Tab = 'now' | 'retire'
export type WageMode = 'hourly' | 'monthly' | 'daily'
export const isTab = (v: unknown): v is Tab => v === 'now' || v === 'retire'
export const isBasis = (v: unknown): v is LeaveBasis => v === 'hire' || v === 'fiscal'
export const isRounding = (v: unknown): v is ProrataRounding => v === 'r2' || v === 'ceil'
export const isWageMode = (v: unknown): v is WageMode => v === 'hourly' || v === 'monthly' || v === 'daily'
export const isYmd = (v: unknown): v is string => parseYmd(v) !== null
/** 저장·공유 값 검증 — 콤마·소수 포함 숫자 문자열(길이 제한) */
export const isNumStr = (v: unknown): v is string => typeof v === 'string' && v.length <= 16 && /^[\d,]*\.?\d*$/.test(v)

/* ── 라벨 ─────────────────────────────────────────── */

export const KIND_LABEL: Record<LeaveKind, string> = {
  monthly: '1년 미만 월 단위 연차',
  annual: '연차',
  prorata: '입사 첫해 비례 연차',
  lowAttendance: `출근율 ${ANNUAL_LEAVE.attendanceMinPct}% 미만 — 개근 월 수`,
}

/** 근속은 '완성 연수'로만 적는다 — 'n년차'는 흔히 n번째 해(n−1년 근속)로 읽혀 한 해 어긋난다 */
export function grantLabel(g: LeaveGrant): string {
  if (g.kind === 'annual') return `${g.seq}년 근속 연차`
  if (g.kind === 'lowAttendance') return `${g.seq}년 근속 연차 (출근율 ${ANNUAL_LEAVE.attendanceMinPct}% 미만)`
  return KIND_LABEL[g.kind]
}

/* ── 최저시급 기본값 ─────────────────────────────── */

export interface MinWagePick { year: number; wage: number; exact: boolean }

/** 연도의 최저시급 — lib 표에 없는 해는 가장 가까운 해 값(앞이면 첫 해, 뒤면 최신 고시)을 쓰고 exact=false 로 알린다 */
export function minWageEntry(year: number): MinWagePick {
  const years = (Object.keys(MIN_HOURLY_WAGE).map(Number) as (keyof typeof MIN_HOURLY_WAGE)[]).sort((a, b) => a - b)
  let pick = years[0]
  for (const y of years) if (y <= year) pick = y
  return { year: pick, wage: MIN_HOURLY_WAGE[pick], exact: pick === year }
}

/* ── 단시간 근로자 (시행령 [별표 2]) ─────────────── */

/** [별표 2] 연차 시간 = 통상 근로자 연차일수 × (주 소정근로시간 ÷ 주 40시간) × 8시간 (1시간 미만은 1시간 — 여기선 올림 전 값) */
export const ptLeaveHours = (days: number, weeklyHours: number): number =>
  (days * weeklyHours * DAILY_WORK_HOURS) / WORK_HOURS_WEEK

/** 일 단위 계산기에 넣을 '환산 1일 소정근로시간' = 주 소정근로시간 × 8 ÷ 40 (= 주 시간 ÷ 5).
 *  발생 일수 × 이 시간 = [별표 2] 시간 수 */
export const ptEquivDailyHours = (weeklyHours: number): number => round2((weeklyHours * DAILY_WORK_HOURS) / WORK_HOURS_WEEK)

/* ── 퇴사 정산: 며칠 더 재직하면 ─────────────────── */

export interface ExtendGain {
  /** 새 연차가 생기는 날 — 마지막 근무일이 이날 이후(당일 포함)면 발생 */
  date: string
  /** 그날 새로 생기는 연차(월 단위 포함) */
  grants: LeaveGrant[]
  newDays: number
  /** 회계연도 기준 퇴직 정산 차이(근로기준과-5802) — 지금 / 그날까지 재직할 때 */
  extraNow: number
  extraThen: number
  /** 수당 일수 증가 = 새 연차 + (그날 정산 차이 − 지금 정산 차이) */
  gainDays: number
}

/** 퇴사 정산 — 마지막 근무일 뒤 withinDays일 안에 새 연차가 생기면 그날까지 재직할 때 늘어나는 수당 일수.
 *  · 이미 생긴 연차의 미사용분은 사용기한이 지나도 수당으로 남는다는 전제(§61 사용촉진 없음) → 증가분은 새 연차와 정산 차이 변화뿐
 *  · 회계연도 기준은 새 연차가 생기면 입사일 기준과의 차이(extraDays)가 줄거나 없어지므로 그만큼 뺀다
 *  · 새 연차의 출근율(지금 근무 중인 산정기간)은 80% 이상으로 가정 — 입력한 80% 미만은 이미 생긴 연차에 대한 것 */
export function extendGain(input: AnnualLeaveInput, withinDays = 30): ExtendGain | null {
  if (!input.retire) return null
  const now = calcAnnualLeave(input)
  const ref = parseYmd(input.refDate)
  if (!now.ok || !now.applicable || !ref) return null
  const refStr = fmtYmd(ref)
  const limit = fmtYmd(addDays(ref, withinDays))
  const date = now.upcoming.reduce((m, g) => (g.arise <= limit && (m === '' || g.arise < m) ? g.arise : m), '')
  if (!date) return null
  const then = calcAnnualLeave({ ...input, refDate: date, attendance80: true })
  if (!then.ok) return null
  const grants = then.grants.filter(g => g.arise > refStr && g.arise <= date)
  const newDays = sumDays(grants)
  const extraNow = now.compare ? now.compare.extraDays : 0
  const extraThen = now.compare && then.compare ? then.compare.extraDays : 0
  const gainDays = round2(newDays + extraThen - extraNow)
  return gainDays > 0 ? { date, grants, newDays, extraNow, extraThen, gainDays } : null
}

export type GrantStatus = 'active' | 'expired' | 'upcoming'
export interface GrantRow { key: string; label: string; days: number; arise: string; lastArise: string; expire: string; count: number; kind: LeaveKind; status: GrantStatus }

/** 월 단위 연차는 한 줄로 묶고 나머지는 한 건씩 — ref 기준 상태 */
export function groupGrants(gs: readonly LeaveGrant[], ref: string): GrantRow[] {
  const rows: GrantRow[] = []
  const status = (g: { arise: string; expire: string }): GrantStatus => (g.arise > ref ? 'upcoming' : g.expire < ref ? 'expired' : 'active')
  const monthly = gs.filter(g => g.kind === 'monthly')
  if (monthly.length) {
    const first = monthly[0], last = monthly[monthly.length - 1]
    rows.push({
      key: 'monthly', label: KIND_LABEL.monthly, days: sumDays(monthly), arise: first.arise, lastArise: last.arise,
      expire: first.expire, count: monthly.length, kind: 'monthly', status: status({ arise: first.arise, expire: first.expire }),
    })
  }
  for (const g of gs) {
    if (g.kind === 'monthly') continue
    rows.push({ key: `${g.kind}-${g.arise}`, label: grantLabel(g), days: g.days, arise: g.arise, lastArise: g.arise, expire: g.expire, count: 1, kind: g.kind, status: status(g) })
  }
  return rows.sort((a, b) => (a.arise < b.arise ? -1 : a.arise > b.arise ? 1 : 0))
}

/* ── 가이드 예시·표 (빌드 시점, 고정 날짜 → 결정적) ─────────────── */

/** 빌드 상수용 날짜 — 틀리면 빌드에서 바로 드러나게 throw */
export function mustYmd(s: string): Date {
  const d = parseYmd(s)
  if (!d) throw new Error(`annual-leave: bad date ${s}`)
  return d
}

/** 가이드 예시 입력 — 빠진 값은 계산기 기본값과 같게 */
export function exampleInput(over: Partial<AnnualLeaveInput>): AnnualLeaveInput {
  return {
    hireDate: '2025-09-01', refDate: '2026-08-31', retire: true, basis: 'hire', fiscalStartMonth: 1, prorataRounding: 'r2',
    fivePlus: true, absentMonths: 0, attendance80: true, lowAttendanceMonths: 0, usedDays: 0,
    dailyWage: dailyWageFromHourly(MIN_HOURLY_WAGE[2026]),
    ...over,
  }
}

/** 예시 계산 — 실패하면 빌드에서 바로 드러나게 throw */
export function runExample(over: Partial<AnnualLeaveInput>) {
  const r = calcAnnualLeave(exampleInput(over))
  if (!r.ok) throw new Error(`annual-leave 예시 계산 실패: ${r.reason}`)
  return r
}

export interface ProrataRow { hire: string; serviceDays: number; r2: number; ceil: number; firstFiscal: string }

/** 회계연도 시작월 fm 기준, year년 각 달 1일 입사 시 첫 부여일의 비례 연차 (입사일=시작일인 달은 제외) */
export function prorataByHireMonth(year: number, fm: number): ProrataRow[] {
  const rows: ProrataRow[] = []
  for (let m = 1; m <= 12; m++) {
    if (m === fm) continue
    const hire = new Date(year, m - 1, 1)
    const f1 = firstFiscalStartAfter(hire, fm)
    const days = diffDays(hire, f1)
    rows.push({ hire: fmtYmd(hire), serviceDays: days, r2: prorataLeave(days, 'r2'), ceil: prorataLeave(days, 'ceil'), firstFiscal: fmtYmd(f1) })
  }
  return rows
}

export interface CompareRow { ref: string; hireTotal: number; fiscalTotal: number; extra: number }

/** 같은 입사일로 입사일 기준·회계연도 기준 누적 발생을 여러 마지막 근무일에서 비교 */
export function basisTimeline(hireDate: string, fm: number, refs: readonly string[]): CompareRow[] {
  const hire = mustYmd(hireDate)
  return refs.map(ref => {
    const at = mustYmd(ref)
    const hireTotal = sumDays(leaveSchedule({ hire, basis: 'hire' }, at))
    const fiscalTotal = sumDays(leaveSchedule({ hire, basis: 'fiscal', fiscalStartMonth: fm }, at))
    return { ref, hireTotal, fiscalTotal, extra: round2(Math.max(0, hireTotal - fiscalTotal)) }
  })
}

export interface WageRow { year: number; hourly: number; daily: number }

/** lib 최저시급 표의 연도별 1일(8시간) 통상임금 */
export function minWageDailyRows(): WageRow[] {
  return (Object.keys(MIN_HOURLY_WAGE).map(Number) as (keyof typeof MIN_HOURLY_WAGE)[])
    .sort((a, b) => a - b)
    .map(year => ({ year, hourly: MIN_HOURLY_WAGE[year], daily: dailyWageFromHourly(MIN_HOURLY_WAGE[year]) }))
}
