/* ──────────────────────────────────────────────────────
   lib/krLabor.ts
   연차 유급휴가(근로기준법 §60·§61) 규칙 — 단일 소스
   사용처: finance/annual-leave (계산기·가이드 표·골든 테스트)

   근거 (기준일 2026-09)
   · 근로기준법 §60①  1년간 80% 이상 출근 → 15일
   · 근로기준법 §60②  계속근로 1년 미만 또는 1년간 80% 미만 출근 → 1개월 개근 시 1일
   · 근로기준법 §60④  3년 이상 계속근로 → 최초 1년을 초과하는 계속근로연수 매 2년에 1일 가산, 총 25일 한도
   · 근로기준법 §60⑦  1년간(1년 미만자의 §60② 휴가는 최초 1년의 근로가 끝날 때까지) 쓰지 않으면 소멸
                      — 2027-06-10 시행 예정 개정(시간 단위 연차 §60⑤ 신설)부터 ⑤~⑦이 ⑥~⑧로 밀린다고 보도됨
                        (조문 원문 미확인 — 페이지 문구는 '알려져 있다'로 유보. 시행 전 law.go.kr 시행예정 조문으로 재확인)
   · 근로기준법 §11 + 시행령 §7 [별표 1]  상시 4명 이하 사업장에는 §60 미적용
   · 대법원 2021. 10. 14. 선고 2021다227100 — 1년 기간제 근로자의 연차는 최대 11일
   · 고용노동부 행정해석 변경(2021-12-16 시행) — 1년(1개월) 근로를 마친 '다음 날' 근로관계가 있어야 연차 발생
   · 고용노동부 근로기준과-5802(2009.12.31) — 회계연도 기준 부여 시 퇴직 시점에 입사일 기준보다 적으면 차이를 수당으로 정산
   날짜는 전부 기기 로컬 자정 Date — new Date('YYYY-MM-DD')(UTC 해석) 금지 (CLAUDE.md)
   ────────────────────────────────────────────────────── */

import { todayStr } from './date'

/** 이 파일의 법령 점검 시점 (UpdatedMeta date) */
export const LEAVE_REVIEWED = '2026년 9월'

/** 연차 일수 규칙 — 근로기준법 §60 */
export const ANNUAL_LEAVE = {
  /** §60① 1년간 80% 이상 출근한 근로자의 기본 연차(일) */
  base: 15,
  /** §60① 출근율 기준(%) */
  attendanceMinPct: 80,
  /** §60④ 가산휴가가 붙기 시작하는 계속근로연수 */
  addFromYears: 3,
  /** §60④ 최초 1년을 초과하는 계속근로연수 '매 N년'마다 1일 */
  addEveryYears: 2,
  /** §60④ 가산휴가를 포함한 총 휴가 일수 한도(일) */
  cap: 25,
  /** §60② 1년 미만: 1개월 개근 시 1일 → 최초 1년 동안 최대 11일 (12번째 달을 채운 다음 날은 이미 1년 이상 근로자) */
  firstYearMonthlyMax: 11,
  /** 회계연도 기준 입사 첫해 비례 연차 분모(일) — '15 × 재직일수 ÷ 365' (고용노동부 산정 예시) */
  prorataYearDays: 365,
} as const

/** §11① 상시 5명 이상 사업장에 적용 — 4명 이하는 시행령 §7 [별표 1]에 §60·§61이 없다 */
export const LEAVE_MIN_WORKERS = 5
/** §18③ 4주 평균 1주 소정근로시간이 15시간 미만인 근로자에게는 §60을 적용하지 않는다 */
export const LEAVE_MIN_WEEKLY_HOURS = 15
/** §50② 1일 근로시간 8시간 — 1일 통상임금 = 시간급 통상임금 × 1일 소정근로시간 */
export const DAILY_WORK_HOURS = 8
/** §49 임금채권(미사용 연차수당 포함) 소멸시효(년) */
export const WAGE_CLAIM_YEARS = 3

/** 규칙이 바뀐 날짜들 — 'YYYY-MM-DD' */
export const LEAVE_DATES = {
  /** 2017.11.28 개정(2018.5.29 시행): 이 날 이후 입사자부터 1년 미만 연차를 2년차 15일에서 빼지 않는다(§60③ 삭제) */
  separateFirstYearHiredFrom: '2017-05-30',
  /** 같은 개정: 이 날 이후 시작한 육아휴직 기간은 출근한 것으로 본다(§60⑥3호) */
  parentalLeaveAttendanceFrom: '2018-05-29',
  /** 2020.3.31 개정·시행: 1년 미만 연차 사용기간을 '최초 1년의 근로가 끝날 때까지'로 하고 사용촉진(§61②) 대상에 넣었다 */
  firstYearExpiryRuleFrom: '2020-03-31',
  /** 대법원 2021다227100 선고일 */
  supremeCourtRuling: '2021-10-14',
  /** 고용노동부 행정해석 변경 시행일 — '다음 날 근로관계' 요건 */
  moelNextDayRuleFrom: '2021-12-16',
  /** 시간 단위 연차(§60⑤ 신설) 시행 예정일 — 조문 번호 ⑤~⑦ → ⑥~⑧ (보도 기준, 조문 원문 미확인) */
  hourlyLeaveFrom: '2027-06-10',
} as const

/** §61 연차 사용촉진 기한 — 사용자가 이 절차를 모두 서면으로 밟았는데도 근로자가 쓰지 않아 소멸하면 수당 지급 의무가 없다
 *  ① 1년 이상 근로자: 사용기간 끝나기 6개월 전 기준 10일 안에 미사용 일수 통지·사용시기 지정 촉구 →
 *     근로자가 촉구 후 10일 안에 시기를 정해 알리지 않으면 → 끝나기 2개월 전까지 사용자가 시기를 정해 서면 통보
 *  ② 1년 미만 근로자(2020.3.31 신설): 최초 1년 끝나기 3개월 전 기준 10일 안에 촉구(촉구 후 생긴 휴가는 1개월 전 기준 5일 안) →
 *     10일 안에 통보 없으면 → 1개월 전까지(촉구 후 생긴 휴가는 10일 전까지) 사용자가 시기 지정 */
export const LEAVE_PROMOTION = {
  regular: { noticeMonthsBefore: 6, noticeWindowDays: 10, replyDays: 10, designateMonthsBefore: 2 },
  firstYear: {
    noticeMonthsBefore: 3, noticeWindowDays: 10, laterNoticeMonthsBefore: 1, laterNoticeWindowDays: 5,
    replyDays: 10, designateMonthsBefore: 1, laterDesignateDaysBefore: 10,
  },
} as const

/** 판례·행정해석 표기 */
export const LEAVE_PRECEDENTS = {
  oneYearContract: { court: '대법원', date: '2021. 10. 14.', caseNo: '2021다227100', holding: '1년 기간제 근로계약을 마치고 퇴직한 근로자의 연차는 최대 11일' },
  fiscalSettlement: { ref: '근로기준과-5802', date: '2009. 12. 31.' },
  /** 통상임금 = 소정근로의 대가로 정기적·일률적으로 지급하기로 정한 임금 — '고정성' 요건 폐기,
   *  재직·근무일수 조건부 정기상여금도 포함. 판결 선고일 이후의 통상임금 산정부터 적용(해당·병행 사건 제외) */
  ordinaryWage: { court: '대법원', date: '2024. 12. 19.', caseNo: '2020다247190', bench: '전원합의체' },
  /** 1개월을 넘는 주기로 정기적·일률적으로 주는 정기상여금도 통상임금 */
  regularBonus: { court: '대법원', date: '2013. 12. 18.', caseNo: '2012다89399', bench: '전원합의체' },
} as const

/* ── 날짜 헬퍼 (기기 로컬 자정) ───────────────────────── */

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** 'YYYY-MM-DD' → 로컬 자정 Date. 형식이 틀리거나 실존하지 않는 날짜('2026-02-30')면 null */
export function parseYmd(s: unknown): Date | null {
  if (typeof s !== 'string') return null
  const m = YMD_RE.exec(s)
  if (!m) return null
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null
  return dt
}

/** Date → 'YYYY-MM-DD' (기기 로컬) */
export const fmtYmd = (d: Date): string => todayStr(d)

/** n일 뒤(음수면 앞) — 로컬 달력 기준 */
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** b − a 달력 일수 (UTC 성분으로 계산해 서머타임 영향 없음) */
export function diffDays(a: Date, b: Date): number {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000)
}

/** 민법 §157 단서·§160: 기산일(입사일) start부터 months개월 기간이 끝난 '다음 날'.
 *  기간은 '기산일에 해당하는 날의 전날' 만료, 그 달에 해당일이 없으면 그 달 말일 만료 → 다음 날은 다음 달 1일.
 *  예) 1/31 입사 + 1개월 → 2/28(평년) 만료 → 3/1 · 2024-02-29 입사 + 12개월 → 2025-02-28 만료 → 2025-03-01 */
export function dayAfterMonths(start: Date, months: number): Date {
  const y = start.getFullYear(), m = start.getMonth() + months, d = start.getDate()
  const lastDay = new Date(y, m + 1, 0).getDate()
  return d <= lastDay ? new Date(y, m, d) : new Date(y, m + 1, 1)
}

/** at 시점까지 '다음 날'이 도래한 완성 개월 수 (dayAfterMonths(start, k) ≤ at 인 최대 k) */
export function completedMonthsAt(start: Date, at: Date): number {
  let k = Math.max(0, (at.getFullYear() - start.getFullYear()) * 12 + (at.getMonth() - start.getMonth()) - 1)
  while (k > 0 && dayAfterMonths(start, k) > at) k--
  while (dayAfterMonths(start, k + 1) <= at) k++
  return k
}

/** at 시점까지 '다음 날'이 도래한 완성 연수 — 연차 산정의 계속근로연수 */
export const completedYearsAt = (start: Date, at: Date): number => Math.floor(completedMonthsAt(start, at) / 12)

/* ── 일수 규칙 ─────────────────────────────────────── */

/** 계속근로 n년(각 해 출근율 80% 이상)을 마친 다음 날 발생하는 연차 — §60①④
 *  15 + ⌊(n − 1) ÷ 2⌋, 한도 25. n < 1이면 0 (1년 미만은 월 단위 §60②) */
export function annualLeaveDays(completedYears: number): number {
  if (!Number.isFinite(completedYears) || completedYears < 1) return 0
  const n = Math.floor(completedYears)
  const add = Math.floor((n - 1) / ANNUAL_LEAVE.addEveryYears)
  return Math.min(ANNUAL_LEAVE.cap, ANNUAL_LEAVE.base + add)
}

/** 한도(25일)에 처음 닿는 계속근로연수 — 15 + ⌊(n−1)/2⌋ = 25 → n = 21 */
export const leaveCapYears = (): number => 1 + ANNUAL_LEAVE.addEveryYears * (ANNUAL_LEAVE.cap - ANNUAL_LEAVE.base)

/** 비례 연차 소수점 처리 — 'r2' 소수 둘째 자리 반올림(계산기 기본) · 'ceil' 1일 단위 올림(회사 규정이 올림일 때) */
export type ProrataRounding = 'r2' | 'ceil'

/** 소수 둘째 자리 반올림 (부동소수 누적 오차 정리용) */
export const round2 = (x: number): number => Math.round(x * 100 + (x >= 0 ? 1e-9 : -1e-9)) / 100

/** 회계연도 기준 입사 첫해 비례 연차 = 15 × 재직일수 ÷ 365 (15일 한도) */
export function prorataLeave(serviceDays: number, rounding: ProrataRounding = 'r2'): number {
  if (!Number.isFinite(serviceDays) || serviceDays <= 0) return 0
  const raw = Math.min(ANNUAL_LEAVE.base, (ANNUAL_LEAVE.base * serviceDays) / ANNUAL_LEAVE.prorataYearDays)
  return rounding === 'ceil' ? Math.ceil(raw - 1e-9) : round2(raw)
}

/* ── 발생 일정 ─────────────────────────────────────── */

export type LeaveBasis = 'hire' | 'fiscal'
export type LeaveKind = 'monthly' | 'annual' | 'prorata' | 'lowAttendance'

export interface LeaveGrant {
  kind: LeaveKind
  /** 발생일 — 이 날 근로관계가 있어야 생긴다('다음 날' 요건) */
  arise: string
  /** 사용기한 마지막 날 (§60⑦) */
  expire: string
  days: number
  /** monthly: 몇 번째 달 · annual/lowAttendance: 발생 근거 계속근로연수 · prorata: 첫해 재직일수 */
  seq: number
}

export interface LeaveScheduleOptions {
  hire: Date
  basis: LeaveBasis
  /** 회계연도 시작월 1~12 (basis='fiscal') */
  fiscalStartMonth?: number
  /** 1년 미만 기간 중 개근하지 못한 달 수 — 앞쪽 달부터 뺀다(기준일까지 지난 달 기준) */
  absentMonths?: number
  prorataRounding?: ProrataRounding
}

/** 1년 미만 월 단위 연차(§60②) — 1~11번째 달. 결근 달은 앞에서부터 제외. 사용기한은 최초 1년 근로가 끝나는 날 */
function monthlyGrants(hire: Date, absent: number): LeaveGrant[] {
  const expire = fmtYmd(addDays(dayAfterMonths(hire, 12), -1))
  const skip = Math.max(0, Math.min(ANNUAL_LEAVE.firstYearMonthlyMax, Math.floor(absent)))
  const out: LeaveGrant[] = []
  for (let m = skip + 1; m <= ANNUAL_LEAVE.firstYearMonthlyMax; m++) {
    out.push({ kind: 'monthly', arise: fmtYmd(dayAfterMonths(hire, m)), expire, days: 1, seq: m })
  }
  return out
}

/** 회계연도 시작일(해당 연도) */
const fiscalStart = (year: number, month: number) => new Date(year, month - 1, 1)

/** 입사일 다음에 오는 첫 회계연도 시작일 (입사일이 곧 시작일이면 그다음 해) */
export function firstFiscalStartAfter(hire: Date, fiscalStartMonth: number): Date {
  const cand = fiscalStart(hire.getFullYear(), fiscalStartMonth)
  return cand > hire ? cand : fiscalStart(hire.getFullYear() + 1, fiscalStartMonth)
}

/** until(포함)까지 발생하는 연차 일정 — 모든 해 출근율 80% 이상·1년 이후 매달 개근 가정 */
export function leaveSchedule(opts: LeaveScheduleOptions, until: Date): LeaveGrant[] {
  const { hire, basis } = opts
  const fm = clampInt(opts.fiscalStartMonth ?? 1, 1, 12)
  const rounding = opts.prorataRounding ?? 'r2'
  const out: LeaveGrant[] = monthlyGrants(hire, opts.absentMonths ?? 0).filter(g => (parseYmd(g.arise) as Date) <= until)
  if (basis === 'hire') {
    for (let k = 1; k < 200; k++) {
      const arise = dayAfterMonths(hire, 12 * k)
      if (arise > until) break
      out.push({ kind: 'annual', arise: fmtYmd(arise), expire: fmtYmd(addDays(dayAfterMonths(hire, 12 * (k + 1)), -1)), days: annualLeaveDays(k), seq: k })
    }
    return out
  }
  const f1 = firstFiscalStartAfter(hire, fm)
  for (let j = 0; j < 200; j++) {
    const f = fiscalStart(f1.getFullYear() + j, fm)
    if (f > until) break
    const expire = fmtYmd(addDays(fiscalStart(f1.getFullYear() + j + 1, fm), -1))
    const n = completedYearsAt(hire, f)
    if (n === 0) {
      const days = diffDays(hire, f)
      out.push({ kind: 'prorata', arise: fmtYmd(f), expire, days: prorataLeave(days, rounding), seq: days })
    } else {
      out.push({ kind: 'annual', arise: fmtYmd(f), expire, days: annualLeaveDays(n), seq: n })
    }
  }
  return out
}

/** 일정의 일수 합계 (소수 둘째 자리) */
export const sumDays = (gs: readonly LeaveGrant[]): number => round2(gs.reduce((a, g) => a + g.days, 0))

function clampInt(v: number, lo: number, hi: number): number {
  const n = Math.floor(Number.isFinite(v) ? v : lo)
  return Math.min(hi, Math.max(lo, n))
}

/* ── 계산기 본체 ───────────────────────────────────── */

export interface AnnualLeaveInput {
  hireDate: string
  /** 재직 중: 기준일(보통 오늘) · 퇴사 정산: 마지막 근무일(재직 마지막 날) */
  refDate: string
  retire: boolean
  basis: LeaveBasis
  fiscalStartMonth: number
  prorataRounding: ProrataRounding
  /** 상시 5명 이상 사업장인가 (§11) */
  fivePlus: boolean
  /** 1년 미만 기간 중 개근하지 못한 달 수 */
  absentMonths: number
  /** 기준일 현재 연차를 만든 직전 산정기간의 출근율이 80% 이상인가 */
  attendance80: boolean
  /** attendance80=false일 때 그 기간에 개근한 달 수 (§60② 1개월 개근 1일) */
  lowAttendanceMonths: number
  /** 지금 쓸 수 있는 연차 중 이미 사용한 일수 (반차 0.5 등) */
  usedDays: number
  /** 1일 통상임금(원) */
  dailyWage: number
}

export interface BasisCompare {
  hireTotal: number
  fiscalTotal: number
  /** 입사일 기준이 더 많을 때 퇴사 시 추가로 수당 정산할 일수 (근로기준과-5802) */
  extraDays: number
  /** 회계연도 기준이 더 많은 일수 — 유리한 쪽 적용이므로 되돌리지 않는다 */
  fiscalAdvantage: number
}

export type AnnualLeaveResult =
  | { ok: false; reason: 'hire' | 'ref' | 'order' }
  | {
      ok: true
      applicable: boolean
      /** 입사일~기준일 재직일수(양 끝 포함) */
      serviceDays: number
      completedYears: number
      completedMonths: number
      /** 기준일까지 발생한 전체(선택 기준) */
      grants: LeaveGrant[]
      totalArisen: number
      /** 기준일에 사용기한이 남은(쓸 수 있는) 연차 */
      current: LeaveGrant[]
      currentTotal: number
      used: number
      remaining: number
      /** 가장 최근에 사용기한이 끝난 묶음 (미사용·미보상분은 수당 청구 대상일 수 있음) */
      lastExpired: LeaveGrant[]
      /** 기준일 다음부터 발생 예정 (최대 4건, 월 단위는 첫 건만) */
      upcoming: LeaveGrant[]
      /** 출근율 80% 미만이 적용된 연차 */
      lowApplied: boolean
      /** 회계연도 기준일 때 입사일 기준과 비교 (출근율 80% 미만을 넣으면 생략) */
      compare: BasisCompare | null
      /** 수당 산정 일수: 재직 중 = 잔여 · 퇴사 = 잔여 + 회계연도 차이 */
      payDays: number
      dailyWage: number
      /** 원 미만 버림 */
      pay: number
    }

/** 연차 발생·사용·잔여·수당 — 모든 법정 수치는 위 상수에서 */
export function calcAnnualLeave(input: AnnualLeaveInput): AnnualLeaveResult {
  const hire = parseYmd(input.hireDate)
  if (!hire) return { ok: false, reason: 'hire' }
  const ref = parseYmd(input.refDate)
  if (!ref) return { ok: false, reason: 'ref' }
  if (ref < hire) return { ok: false, reason: 'order' }

  const basis: LeaveBasis = input.basis === 'fiscal' ? 'fiscal' : 'hire'
  const fm = clampInt(input.fiscalStartMonth, 1, 12)
  const rounding: ProrataRounding = input.prorataRounding === 'ceil' ? 'ceil' : 'r2'
  const monthsDone = completedMonthsAt(hire, ref)
  const absent = clampInt(input.absentMonths, 0, Math.min(ANNUAL_LEAVE.firstYearMonthlyMax, monthsDone))
  const daily = Math.max(0, Math.floor(Number.isFinite(input.dailyWage) ? input.dailyWage : 0))
  const serviceDays = diffDays(hire, ref) + 1
  const completedYears = Math.floor(monthsDone / 12)

  if (!input.fivePlus) {
    return {
      ok: true, applicable: false, serviceDays, completedYears, completedMonths: monthsDone,
      grants: [], totalArisen: 0, current: [], currentTotal: 0, used: 0, remaining: 0,
      lastExpired: [], upcoming: [], lowApplied: false, compare: null, payDays: 0, dailyWage: daily, pay: 0,
    }
  }

  const opts: LeaveScheduleOptions = { hire, basis, fiscalStartMonth: fm, absentMonths: absent, prorataRounding: rounding }
  const grants = leaveSchedule(opts, ref)

  /* 출근율 80% 미만 — 기준일 현재 가장 최근 '연 단위' 연차(annual·prorata)에만 적용 */
  let lowApplied = false
  if (!input.attendance80) {
    for (let i = grants.length - 1; i >= 0; i--) {
      const g = grants[i]
      if (g.kind === 'annual') {
        grants[i] = { ...g, kind: 'lowAttendance', days: clampInt(input.lowAttendanceMonths, 0, ANNUAL_LEAVE.firstYearMonthlyMax) }
        lowApplied = true
        break
      }
      if (g.kind === 'prorata') { // 첫해 출근율 80% 미만 → 비례 연차 없음(월 단위 연차는 그대로)
        grants[i] = { ...g, days: 0 }
        lowApplied = true
        break
      }
    }
  }

  const refStr = fmtYmd(ref)
  const current = grants.filter(g => g.arise <= refStr && refStr <= g.expire)
  const currentTotal = sumDays(current)
  const usedRaw = Number.isFinite(input.usedDays) ? input.usedDays : 0
  const used = round2(Math.min(currentTotal, Math.max(0, usedRaw)))
  const remaining = round2(currentTotal - used)

  const expired = grants.filter(g => g.expire < refStr)
  const lastExp = expired.reduce((m, g) => (g.expire > m ? g.expire : m), '')
  const lastExpired = lastExp ? expired.filter(g => g.expire === lastExp) : []

  /* 발생 예정 — 기준일 다음 날부터 약 3년 */
  const horizon = dayAfterMonths(ref, 40)
  const future = leaveSchedule(opts, horizon).filter(g => g.arise > refStr)
  const upcoming: LeaveGrant[] = []
  for (const g of future) {
    if (g.kind === 'monthly' && upcoming.some(u => u.kind === 'monthly')) continue
    upcoming.push(g)
    if (upcoming.length >= 4) break
  }

  let compare: BasisCompare | null = null
  if (basis === 'fiscal' && input.attendance80) {
    const hireTotal = sumDays(leaveSchedule({ ...opts, basis: 'hire' }, ref))
    const fiscalTotal = sumDays(grants)
    compare = {
      hireTotal, fiscalTotal,
      extraDays: round2(Math.max(0, hireTotal - fiscalTotal)),
      fiscalAdvantage: round2(Math.max(0, fiscalTotal - hireTotal)),
    }
  }

  const payDays = round2(remaining + (input.retire && compare ? compare.extraDays : 0))
  const pay = Math.floor(daily * payDays + 1e-6)

  return {
    ok: true, applicable: true, serviceDays, completedYears, completedMonths: monthsDone,
    grants, totalArisen: sumDays(grants), current, currentTotal, used, remaining,
    lastExpired, upcoming, lowApplied, compare, payDays, dailyWage: daily, pay,
  }
}

/* ── 통상임금 ──────────────────────────────────────── */

/** 1일 통상임금(원 미만 버림) — 시급 × 1일 소정근로시간 · 월 통상임금 ÷ 월 소정근로시간 × 1일 소정근로시간 */
export function dailyWageFromHourly(hourly: number, hours: number = DAILY_WORK_HOURS): number {
  if (!Number.isFinite(hourly) || !Number.isFinite(hours) || hourly <= 0 || hours <= 0) return 0
  return Math.floor(hourly * hours + 1e-6)
}
export function dailyWageFromMonthly(monthly: number, monthlyHours: number, hours: number = DAILY_WORK_HOURS): number {
  if (!Number.isFinite(monthly) || monthly <= 0 || !(monthlyHours > 0) || !(hours > 0)) return 0
  return Math.floor((monthly * hours) / monthlyHours + 1e-6)
}

/* ── 가이드 표 (빌드 시 생성) ─────────────────────── */

export interface LeaveTableRow { years: number; days: number; add: number; cumulative: number }

/** 근속연수별 연차 — 1년 미만 11일을 포함한 입사 후 누적 */
export function leaveByYearsTable(maxYears: number): LeaveTableRow[] {
  const rows: LeaveTableRow[] = []
  let cum: number = ANNUAL_LEAVE.firstYearMonthlyMax
  for (let n = 1; n <= maxYears; n++) {
    const days = annualLeaveDays(n)
    cum += days
    rows.push({ years: n, days, add: days - ANNUAL_LEAVE.base, cumulative: cum })
  }
  return rows
}
