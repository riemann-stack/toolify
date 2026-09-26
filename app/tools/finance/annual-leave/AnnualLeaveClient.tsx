'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import ResultHero, { BreakdownTable, type BreakdownRow } from '@/components/ResultHero'
import Callout from '@/components/Callout'
import UiIcon from '@/components/UiIcon'
import { todayStr } from '@/lib/date'
import { MONTHLY_WORK_HOURS, WORK_HOURS_WEEK } from '@/lib/krInsuranceRates'
import {
  calcAnnualLeave, parseYmd, fmtYmd, dailyWageFromHourly, dailyWageFromMonthly, sumDays, round2,
  ANNUAL_LEAVE, LEAVE_MIN_WORKERS, DAILY_WORK_HOURS, LEAVE_DATES, LEAVE_PRECEDENTS, WAGE_CLAIM_YEARS,
  type AnnualLeaveInput, type LeaveBasis, type LeaveGrant, type ProrataRounding,
} from '@/lib/krLabor'
import {
  won, fmtDays, dotDate, korDate, commaInput, parseMoney, decimalInput, digitsInput, groupGrants, grantLabel,
  isTab, isBasis, isRounding, isWageMode, isYmd, isNumStr, minWageEntry, extendGain, ptEquivDailyHours,
  type Tab, type WageMode, type GrantStatus,
} from './annualLeaveUtils'
import s from './annualLeave.module.css'

const STORAGE_KEY = 'youtil:annual-leave:inputs-v1'
const MAX_USED = 100
const MAX_HOURS = 24
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const STATUS_LABEL: Record<GrantStatus, string> = { active: '사용 가능', expired: '사용기한 지남', upcoming: '발생 예정' }
/** 단시간 근로자 환산 1일 시간 안내 예시(주 24시간 = 주 3일 × 8시간) */
const PT_EX_WEEK = 24

interface Saved {
  tab: Tab; hire: string; retireDate: string; basis: LeaveBasis; fiscalMonth: string; rounding: ProrataRounding
  used: string; wageMode: WageMode; hourly: string; hours: string; monthly: string; daily: string
  fivePlus: boolean; absent: string; att80: boolean; lowMonths: string
}

/** 기본 입사일 — 오늘 기준 1년 6개월 전 달의 1일 (예시값, 사용자가 바로 바꾼다) */
function defaultHire(today: string): string {
  const t = parseYmd(today) ?? new Date()
  return fmtYmd(new Date(t.getFullYear() - 1, t.getMonth() - 6, 1))
}

export default function AnnualLeaveClient() {
  const [tab, setTab] = useState<Tab>('now')
  const [hire, setHire] = useState('')
  const [refNow, setRefNow] = useState('')
  const [retireDate, setRetireDate] = useState('')
  const [basis, setBasis] = useState<LeaveBasis>('hire')
  const [fiscalMonth, setFiscalMonth] = useState('1')
  const [rounding, setRounding] = useState<ProrataRounding>('r2')
  const [used, setUsed] = useState('0')
  const [wageMode, setWageMode] = useState<WageMode>('hourly')
  const [hourly, setHourly] = useState('')
  const [hours, setHours] = useState(String(DAILY_WORK_HOURS))
  const [monthly, setMonthly] = useState('')
  const [daily, setDaily] = useState('')
  const [fivePlus, setFivePlus] = useState(true)
  const [absent, setAbsent] = useState('0')
  const [att80, setAtt80] = useState(true)
  const [lowMonths, setLowMonths] = useState('0')
  const [optsOpen, setOptsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState<'result' | 'link' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** 공유 링크로 열었으면 사용자가 무언가 바꾸기 전까지 이 기기의 저장값을 덮어쓰지 않는다 */
  const skipSave = useRef(false)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ now: null, retire: null })

  /* 복원 — 이 기기에 저장된 마지막 입력을 먼저 읽고, 공유 링크(?h=…)가 있으면 링크에 담긴 값만 그 위에 덮는다
     (임금·근로 조건처럼 링크에 없는 값은 사용자의 저장값 유지). 오늘 날짜는 항상 기기 로컬 기준(todayStr) */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const today = todayStr()
    const acc: Partial<Saved> = {}
    const apply = (v: Partial<Record<keyof Saved, unknown>>) => {
      if (isTab(v.tab)) acc.tab = v.tab
      if (isYmd(v.hire)) acc.hire = v.hire
      if (isYmd(v.retireDate)) acc.retireDate = v.retireDate
      if (isBasis(v.basis)) acc.basis = v.basis
      if (typeof v.fiscalMonth === 'string' && MONTHS.includes(Number(v.fiscalMonth))) acc.fiscalMonth = String(Number(v.fiscalMonth)) // '04' → '4' (select 값과 일치)
      if (isRounding(v.rounding)) acc.rounding = v.rounding
      if (isNumStr(v.used)) acc.used = decimalInput(v.used)
      if (isWageMode(v.wageMode)) acc.wageMode = v.wageMode
      if (isNumStr(v.hourly)) acc.hourly = commaInput(v.hourly)
      if (isNumStr(v.hours) && v.hours) acc.hours = decimalInput(v.hours)
      if (isNumStr(v.monthly)) acc.monthly = commaInput(v.monthly)
      if (isNumStr(v.daily)) acc.daily = commaInput(v.daily)
      if (typeof v.fivePlus === 'boolean') acc.fivePlus = v.fivePlus
      if (isNumStr(v.absent)) acc.absent = digitsInput(v.absent, 2)
      if (typeof v.att80 === 'boolean') acc.att80 = v.att80
      if (isNumStr(v.lowMonths)) acc.lowMonths = digitsInput(v.lowMonths, 2)
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j: unknown = JSON.parse(raw)
        if (j && typeof j === 'object' && !Array.isArray(j)) apply(j as Record<string, unknown>)
      }
    } catch { /* 저장소 접근 불가·손상 — 기본값 유지 */ }
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('h')) {
        skipSave.current = true
        apply({
          tab: q.get('t'), hire: q.get('h'), retireDate: q.get('r'), basis: q.get('b'), fiscalMonth: q.get('f'),
          rounding: q.get('p'), used: q.get('u'), fivePlus: q.get('s') !== '0', // 링크는 5명 미만일 때만 s=0을 싣는다
        })
      }
    } catch { /* 잘못된 링크 — 무시 */ }
    // 마운트 1회: 복원값·오늘 날짜·예시 입사일 채우기 + 외부 저장소 복원 완료 표시(이후에만 저장 effect가 돈다)
    /* eslint-disable react-hooks/set-state-in-effect */
    if (acc.tab) setTab(acc.tab)
    setHire(acc.hire ?? defaultHire(today))
    if (acc.basis) setBasis(acc.basis)
    if (acc.fiscalMonth) setFiscalMonth(acc.fiscalMonth)
    if (acc.rounding) setRounding(acc.rounding)
    if (acc.used !== undefined) setUsed(acc.used)
    if (acc.wageMode) setWageMode(acc.wageMode)
    if (acc.hourly !== undefined) setHourly(acc.hourly)
    if (acc.hours) setHours(acc.hours)
    if (acc.monthly !== undefined) setMonthly(acc.monthly)
    if (acc.daily !== undefined) setDaily(acc.daily)
    if (acc.fivePlus !== undefined) setFivePlus(acc.fivePlus)
    if (acc.absent !== undefined) setAbsent(acc.absent)
    if (acc.att80 !== undefined) setAtt80(acc.att80)
    if (acc.lowMonths !== undefined) setLowMonths(acc.lowMonths)
    setRefNow(today)
    setRetireDate(acc.retireDate ?? today)
    // 기본값과 다른 근로 조건이 복원되면 펼쳐 둔다
    if (acc.fivePlus === false || acc.att80 === false || (acc.absent && acc.absent !== '0')) setOptsOpen(true)
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    if (skipSave.current) { skipSave.current = false; return } // 공유 링크로 연 직후 — 저장값 보존
    try {
      const v: Saved = { tab, hire, retireDate, basis, fiscalMonth, rounding, used, wageMode, hourly, hours, monthly, daily, fivePlus, absent, att80, lowMonths }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    } catch { /* 저장 실패 무시 */ }
  }, [hydrated, tab, hire, retireDate, basis, fiscalMonth, rounding, used, wageMode, hourly, hours, monthly, daily, fivePlus, absent, att80, lowMonths])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  /* ── 파생값 ── */
  const retire = tab === 'retire'
  const refDate = retire ? retireDate : refNow
  const refYear = parseYmd(refDate)?.getFullYear() ?? parseYmd(refNow)?.getFullYear() ?? 2026
  const baseInput: AnnualLeaveInput = {
    hireDate: hire, refDate, retire, basis, fiscalStartMonth: Number(fiscalMonth) || 1, prorataRounding: rounding,
    fivePlus, absentMonths: parseInt(absent, 10) || 0, attendance80: att80, lowAttendanceMonths: parseInt(lowMonths, 10) || 0,
    usedDays: parseFloat(used) || 0, dailyWage: 0,
  }
  /* 시급을 비웠을 때 쓸 최저시급의 연도 — 퇴사 정산: 마지막 근무일의 해.
     재직 중: 미사용 수당은 사용기한이 끝날 때 그때 임금으로 정산하므로 지금 연차 중 가장 늦은 사용기한의 해 */
  const sched = retire ? null : calcAnnualLeave(baseInput)
  const payExpire = sched && sched.ok ? sched.current.reduce((m, g) => (g.expire > m ? g.expire : m), '') : ''
  const wageYear = payExpire ? Number(payExpire.slice(0, 4)) : refYear
  const mw = minWageEntry(wageYear)
  const hoursV = Math.min(MAX_HOURS, parseFloat(hours) || DAILY_WORK_HOURS) // 비우면 자리표시값(8시간) 그대로
  const hourlyV = parseMoney(hourly) || mw.wage
  /* 월 통상임금: ÷ 209 × 8 — 209는 1일 8시간(주 40시간) 기준이라 1일 시간 입력과 섞지 않는다.
     단시간 근로자도 월급(주휴 포함 월 209 × 주 시간/40 기준) ÷ 209 × 8 = '통상 근로자 1일분'이 되어 [별표 2] 비례와 같아진다 */
  const dailyWage = wageMode === 'daily'
    ? Math.floor(parseMoney(daily))
    : wageMode === 'monthly'
      ? dailyWageFromMonthly(parseMoney(monthly), MONTHLY_WORK_HOURS)
      : dailyWageFromHourly(hourlyV, hoursV)

  const input: AnnualLeaveInput = { ...baseInput, dailyWage }
  const r = calcAnnualLeave(input)

  const ready = hydrated && r.ok
  const orderErr = hydrated && !r.ok && r.reason === 'order'
  const usedOver = r.ok && r.applicable && (parseFloat(used) || 0) > r.currentTotal
  const hasYearGrant = r.ok && r.grants.some(g => g.kind !== 'monthly')
  const inFirstYear = r.ok && r.completedYears < 1
  const hireEarly = r.ok && hire < LEAVE_DATES.separateFirstYearHiredFrom

  /* 퇴사 정산: 마지막 근무일 뒤 30일 안에 새 연차(월 단위 포함)가 생기면 그날까지 재직할 때 늘어나는 수당을 알려 준다 */
  const gain = retire && r.ok && r.applicable ? extendGain(input) : null

  /* ── 핸들러 ── */
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const next: Tab = e.key === 'Home' ? 'now' : e.key === 'End' ? 'retire' : tab === 'now' ? 'retire' : 'now'
    setTab(next)
    tabRefs.current[next]?.focus()
  }
  const onUsed = (v: string) => {
    const d = decimalInput(v)
    setUsed(parseFloat(d) > MAX_USED ? String(MAX_USED) : d)
  }
  const onHours = (v: string) => {
    const d = decimalInput(v)
    setHours(parseFloat(d) > MAX_HOURS ? String(MAX_HOURS) : d)
  }
  const onSmallInt = (set: (v: string) => void) => (v: string) => {
    const d = digitsInput(v, 2)
    set(d && parseInt(d, 10) > ANNUAL_LEAVE.firstYearMonthlyMax ? String(ANNUAL_LEAVE.firstYearMonthlyMax) : d)
  }

  const flash = (kind: 'result' | 'link') => {
    setCopied(kind)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1500)
  }
  const writeClip = async (text: string, kind: 'result' | 'link') => {
    try { await navigator.clipboard.writeText(text); flash(kind) } catch { /* 권한 거부 — 조용히 무시 */ }
  }
  const basisLabel = basis === 'hire' ? '입사일 기준' : `회계연도 기준(${fiscalMonth}월 시작)`
  const copyResult = () => {
    if (!r.ok) return
    const lines = [
      `[연차 계산] 입사 ${dotDate(hire)} · ${retire ? '마지막 근무일' : '기준일'} ${dotDate(refDate)} · ${basisLabel}`,
      r.applicable
        ? `발생 ${fmtDays(r.currentTotal)}일 / 사용 ${fmtDays(r.used)}일 / 잔여 ${fmtDays(r.remaining)}일`
        : `상시 ${LEAVE_MIN_WORKERS}명 미만 사업장 — 법정 연차 적용 없음`,
      r.applicable ? `${retire ? '퇴사 시 연차수당' : '미사용 시 연차수당'} ${won(r.pay)}원 (1일 통상임금 ${won(r.dailyWage)}원 × ${fmtDays(r.payDays)}일)` : '',
      window.location.origin + window.location.pathname,
    ].filter(Boolean)
    void writeClip(lines.join('\n'), 'result')
  }
  const copyLink = () => {
    const q = new URLSearchParams({ h: hire, t: tab, b: basis, u: used || '0' })
    if (retire) q.set('r', retireDate)
    if (basis === 'fiscal') { q.set('f', fiscalMonth); q.set('p', rounding) }
    if (!fivePlus) q.set('s', '0')
    void writeClip(`${window.location.origin}${window.location.pathname}?${q.toString()}`, 'link')
  }

  /* ── 결과 표 ── */
  const grantRows: BreakdownRow[] = r.ok && r.applicable
    ? groupGrants([...r.lastExpired, ...r.current], refDate).map(g => ({
        label: g.label,
        note: g.count > 1
          ? `${dotDate(g.arise)}~${dotDate(g.lastArise)} 매달 1일 · ${dotDate(g.expire)}까지`
          : `${dotDate(g.arise)} 발생 · ${dotDate(g.expire)}까지`,
        cols: [`${fmtDays(g.days)}일`, STATUS_LABEL[g.status]],
        color: g.status === 'active' ? 'data-1' : 'data-3',
      }))
    : []
  if (r.ok && r.applicable && r.current.length > 0) {
    grantRows.push({ label: '사용', cols: [`−${fmtDays(r.used)}일`, ''], kind: 'sum' })
    grantRows.push({ label: '남은 연차', cols: [`${fmtDays(r.remaining)}일`, ''], kind: 'net' })
  }

  const compareRows: BreakdownRow[] = r.ok && r.compare ? [
    { label: '입사일 기준 누적 발생', note: '입사일부터 1년마다', cols: [`${fmtDays(r.compare.hireTotal)}일`] },
    { label: '회계연도 기준 누적 발생', note: '첫해 비례 + 매 회계연도', cols: [`${fmtDays(r.compare.fiscalTotal)}일`] },
    r.compare.extraDays > 0
      ? { label: '퇴사 시 추가 정산', note: '입사일 기준이 더 많은 만큼 수당', cols: [`${fmtDays(r.compare.extraDays)}일`], kind: 'net' }
      : { label: '회계연도 기준이 유리', note: '더 받은 휴가는 되돌리지 않음', cols: [`+${fmtDays(r.compare.fiscalAdvantage)}일`], kind: 'sum' },
  ] : []

  /* ── 결과 카드 문구 ── */
  const extra = r.ok && retire && r.compare ? r.compare.extraDays : 0
  const heroValue = !ready ? undefined : !r.ok ? undefined : !r.applicable ? '0' : retire ? won(r.pay) : fmtDays(r.remaining)
  const heroUnit = retire ? '원' : '일'
  const heroLabel = retire ? '퇴사 시 받을 연차수당' : '지금 쓸 수 있는 연차'
  const refName = retire ? '마지막 근무일' : '기준일'
  const emptyMsg = orderErr
    ? `${refName}이 입사일보다 빠릅니다 — 날짜를 확인하세요`
    : hydrated && !r.ok && r.reason === 'ref'
      ? `${refName}을 입력하면 결과가 여기에 표시됩니다`
      : '입사일을 입력하면 발생·사용·잔여 연차가 여기에 표시됩니다'

  let pill: string | undefined
  let sub: ReactNode = null
  let formula: ReactNode = <>입사일과 기준일을 넣으면 계산식이 표시됩니다</>
  if (r.ok && !r.applicable) {
    pill = `상시 ${LEAVE_MIN_WORKERS}명 미만`
    sub = <>근로기준법 §60이 적용되지 않는 사업장입니다 · 재직 <b>{r.serviceDays.toLocaleString('ko-KR')}일</b></>
    formula = <>근로기준법 §11② · 시행령 §7 [별표 1]에 연차(§60) 없음 → 법정 연차 <b>0일</b></>
  } else if (r.ok && retire) {
    pill = `${fmtDays(r.payDays)}일분`
    sub = <>미사용 <b>{fmtDays(r.remaining)}일</b>{extra > 0 && <> + 회계연도 차이 <b>{fmtDays(extra)}일</b></>} · 재직 <b>{r.serviceDays.toLocaleString('ko-KR')}일</b></>
    formula = extra > 0
      ? <>1일 통상임금 <b>{won(r.dailyWage)}</b> × ({fmtDays(r.remaining)} + {fmtDays(extra)})일 = <b>{won(r.pay)}원</b></>
      : <>1일 통상임금 <b>{won(r.dailyWage)}</b> × {fmtDays(r.remaining)}일 = <b>{won(r.pay)}원</b></>
  } else if (r.ok) {
    pill = `발생 ${fmtDays(r.currentTotal)}일`
    sub = <>사용 <b>{fmtDays(r.used)}일</b> · 미사용 시 연차수당 <b>{won(r.pay)}원</b> · 재직 <b>{r.serviceDays.toLocaleString('ko-KR')}일</b></>
    formula = <>발생 <b>{fmtDays(r.currentTotal)}</b> − 사용 <b>{fmtDays(r.used)}</b> = 잔여 <b>{fmtDays(r.remaining)}일</b> × 1일 통상임금 {won(r.dailyWage)} = <b>{won(r.pay)}원</b></>
  }

  const lastExpDays = r.ok ? sumDays(r.lastExpired) : 0
  const lastExpDate = r.ok && r.lastExpired.length ? r.lastExpired[0].expire : ''
  /* 사용기한이 이미 끝난 연차의 수당은 그 사용기한이 끝난 해의 임금 — 시급을 비웠다면 그해 최저시급으로 어림 */
  const hourlyBlank = wageMode === 'hourly' && !parseMoney(hourly)
  const lastMw = hourlyBlank && lastExpDate ? minWageEntry(Number(lastExpDate.slice(0, 4))) : null
  const lastExpDaily = lastMw ? dailyWageFromHourly(lastMw.wage, hoursV) : r.ok ? r.dailyWage : 0

  return (
    <>
      <div className="ui-card">
        <div className="ui-seg" role="tablist" aria-label="계산 목적">
          {(['now', 'retire'] as Tab[]).map(t => (
            <button
              key={t} type="button" role="tab" id={`al-tab-${t}`}
              aria-selected={tab === t} aria-controls="al-panel" tabIndex={tab === t ? 0 : -1}
              ref={el => { tabRefs.current[t] = el }}
              onClick={() => setTab(t)} onKeyDown={onTabKey}
            >{t === 'now' ? '재직 중' : '퇴사 정산'}</button>
          ))}
        </div>

        <div role="tabpanel" id="al-panel" aria-labelledby={`al-tab-${tab}`}>
          <div className="ui-row2">
            <div className="ui-field">
              <label className="ui-label" htmlFor="al-hire">입사일 <span className="ui-hint">첫 출근일</span></label>
              <div className="ui-input ui-text ui-sm">
                <input id="al-hire" type="date" value={hire} onChange={e => setHire(e.target.value)} max={refDate || undefined} />
              </div>
            </div>
            <div className="ui-field">
              {retire ? (
                <>
                  <label className="ui-label" htmlFor="al-ref">마지막 근무일 <span className="ui-hint">재직 마지막 날</span></label>
                  <div className="ui-input ui-text ui-sm">
                    <input id="al-ref" type="date" value={retireDate} onChange={e => setRetireDate(e.target.value)} min={hire || undefined}
                      aria-invalid={orderErr || undefined} aria-describedby="al-ref-help" />
                  </div>
                  <p className="ui-helper" id="al-ref-help">근로관계가 끝나는 날(이날까지 재직). 연차는 1년·1개월을 마친 <strong>다음 날</strong>(회계연도 기준은 부여일 당일) 재직 중이어야 생깁니다.</p>
                </>
              ) : (
                <>
                  <label className="ui-label" htmlFor="al-ref">기준일 <span className="ui-hint">기본 오늘</span></label>
                  <div className="ui-input ui-text ui-sm">
                    <input id="al-ref" type="date" value={refNow} onChange={e => setRefNow(e.target.value)} min={hire || undefined}
                      aria-invalid={orderErr || undefined} aria-describedby="al-ref-help" />
                  </div>
                  <p className="ui-helper" id="al-ref-help">지금 쓸 수 있는 연차와 남은 일수를 봅니다. 미래 날짜를 넣으면 그날 기준으로 미리 볼 수 있습니다.</p>
                </>
              )}
            </div>
          </div>

          <fieldset className="ui-field ui-fieldset">
            <legend className="ui-label">회사의 연차 운영 방식</legend>
            <div className="ui-chips" role="group" aria-label="연차 운영 방식">
              <button type="button" className="ui-chip" aria-pressed={basis === 'hire'} onClick={() => setBasis('hire')}>입사일 기준</button>
              <button type="button" className="ui-chip" aria-pressed={basis === 'fiscal'} onClick={() => setBasis('fiscal')}>회계연도 기준</button>
            </div>
            <p className="ui-helper">
              {basis === 'hire'
                ? '사람마다 입사일로부터 1년이 될 때마다 새 연차가 생기는 방식(법의 원칙)입니다.'
                : '모든 직원에게 같은 날(예: 1월 1일) 연차를 한꺼번에 주는 방식입니다. 입사 첫해는 재직일수에 비례해 줍니다.'}
            </p>
          </fieldset>

          {basis === 'fiscal' && (
            <div className="ui-row2">
              <div className="ui-field">
                <label className="ui-label" htmlFor="al-fm">회계연도 시작월</label>
                <div className="ui-input ui-text ui-sm">
                  <select id="al-fm" className={s.select} value={fiscalMonth} onChange={e => setFiscalMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={String(m)}>{m}월 1일</option>)}
                  </select>
                </div>
              </div>
              <fieldset className="ui-field ui-fieldset">
                <legend className="ui-label">첫해 비례 연차 소수점</legend>
                <div className="ui-chips" role="group" aria-label="비례 연차 소수점 처리">
                  <button type="button" className="ui-chip" aria-pressed={rounding === 'r2'} onClick={() => setRounding('r2')}>소수 둘째 자리</button>
                  <button type="button" className="ui-chip" aria-pressed={rounding === 'ceil'} onClick={() => setRounding('ceil')}>1일 올림</button>
                </div>
              </fieldset>
            </div>
          )}

          <div className="ui-field">
            <label className="ui-label" htmlFor="al-used">
              {retire ? '퇴사 전까지 사용한 연차' : '지금까지 사용한 연차'}
              <span className="ui-hint">현재 사용기간 안에서 · 반차 0.5</span>
            </label>
            <div className="ui-input ui-sm">
              <input id="al-used" type="text" inputMode="decimal" autoComplete="off" value={used} onChange={e => onUsed(e.target.value)}
                aria-invalid={usedOver || undefined} aria-describedby={usedOver ? 'al-used-err' : undefined} placeholder="0" />
              <span className="ui-unit">일</span>
            </div>
            {usedOver && r.ok && <p className="ui-helper ui-err" id="al-used-err">지금 쓸 수 있는 연차({fmtDays(r.currentTotal)}일)보다 많습니다 — 발생일수까지만 뺍니다.</p>}
          </div>

          <fieldset className="ui-field ui-fieldset">
            <legend className="ui-label">1일 통상임금 <span className="ui-hint">연차수당 계산용</span></legend>
            <div className="ui-chips" role="group" aria-label="통상임금 입력 방식">
              <button type="button" className="ui-chip" aria-pressed={wageMode === 'hourly'} onClick={() => setWageMode('hourly')}>시급</button>
              <button type="button" className="ui-chip" aria-pressed={wageMode === 'monthly'} onClick={() => setWageMode('monthly')}>월 통상임금</button>
              <button type="button" className="ui-chip" aria-pressed={wageMode === 'daily'} onClick={() => setWageMode('daily')}>1일 금액 직접</button>
            </div>
            {wageMode === 'daily' ? (
              <div className="ui-field">
                <label className="ui-label" htmlFor="al-daily">1일 통상임금</label>
                <div className="ui-input">
                  <input id="al-daily" type="text" inputMode="numeric" autoComplete="off" value={daily} onChange={e => setDaily(commaInput(e.target.value))} placeholder="0" />
                  <span className="ui-unit">원</span>
                </div>
              </div>
            ) : wageMode === 'monthly' ? (
              <div className="ui-field">
                <label className="ui-label" htmlFor="al-monthly">월 통상임금</label>
                <div className="ui-input">
                  <input id="al-monthly" type="text" inputMode="numeric" autoComplete="off" value={monthly}
                    onChange={e => setMonthly(commaInput(e.target.value))} placeholder="0" aria-describedby="al-monthly-help" />
                  <span className="ui-unit">원</span>
                </div>
                <p className="ui-helper" id="al-monthly-help">
                  기본급 + 정기 수당 + 정기상여금 월 환산액(재직·근무일수 조건이 붙어도 포함) ÷ 월 {MONTHLY_WORK_HOURS}시간 × {DAILY_WORK_HOURS}시간.
                  주 {WORK_HOURS_WEEK}시간 기준식이라 단시간 근로자는 시급 방식이 더 정확합니다.
                </p>
              </div>
            ) : (
              <div className="ui-row2">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="al-hourly">시간급 통상임금</label>
                  <div className="ui-input ui-sm">
                    <input id="al-hourly" type="text" inputMode="numeric" autoComplete="off" value={hourly}
                      onChange={e => setHourly(commaInput(e.target.value))} placeholder={mw.wage.toLocaleString('ko-KR')} aria-describedby="al-hourly-help" />
                    <span className="ui-unit">원</span>
                  </div>
                  <p className="ui-helper" id="al-hourly-help">
                    {mw.exact
                      ? <>비워 두면 {mw.year}년 최저시급 <strong>{mw.wage.toLocaleString('ko-KR')}원</strong>{payExpire && wageYear !== refYear && <> — 미사용 수당은 사용기한({dotDate(payExpire)})이 끝날 때 그해 임금으로 정산</>}</>
                      : <>비워 두면 <strong>{mw.wage.toLocaleString('ko-KR')}원</strong>({mw.year}년 최저시급) — {wageYear}년 값은 이 계산기 표에 없으니 실제 시급을 넣으세요</>}
                  </p>
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="al-hours">1일 소정근로시간</label>
                  <div className="ui-input ui-sm">
                    <input id="al-hours" type="text" inputMode="decimal" autoComplete="off" value={hours} onChange={e => onHours(e.target.value)}
                      placeholder={String(DAILY_WORK_HOURS)} aria-describedby="al-hours-help" />
                    <span className="ui-unit">시간</span>
                  </div>
                  <p className="ui-helper" id="al-hours-help">주 5일 근무가 아니면 주 소정근로시간 × {DAILY_WORK_HOURS} ÷ {WORK_HOURS_WEEK} (예: 주 {PT_EX_WEEK}시간 → {ptEquivDailyHours(PT_EX_WEEK)}시간)</p>
                </div>
              </div>
            )}
            <p className="ui-helper">적용 1일 통상임금 <strong>{won(dailyWage)}원</strong></p>
          </fieldset>

          <details className="ui-opts" open={optsOpen} onToggle={e => setOptsOpen(e.currentTarget.open)}>
            <summary>
              <span className="ui-optsL">근로 조건</span>
              <span className="ui-optsV">
                <b>{fivePlus ? `상시 ${LEAVE_MIN_WORKERS}명 이상` : `${LEAVE_MIN_WORKERS}명 미만`}</b> · 결근 달 <b>{absent || '0'}개</b> · 출근율 <b>{att80 ? `${ANNUAL_LEAVE.attendanceMinPct}% 이상` : `${ANNUAL_LEAVE.attendanceMinPct}% 미만`}</b>
              </span>
              <span className="ui-optsBtn">바꾸기<UiIcon name="chev-d" size={16} /></span>
            </summary>
            <div className="ui-optsBody">
              <div className="ui-field">
                <div className="ui-checks">
                  <label className="ui-check">
                    <input type="checkbox" checked={fivePlus} onChange={e => setFivePlus(e.target.checked)} />
                    <span>상시 근로자 {LEAVE_MIN_WORKERS}명 이상 사업장<small>{LEAVE_MIN_WORKERS}명 미만이면 근로기준법상 연차 의무가 없습니다(§11)</small></span>
                  </label>
                  <label className="ui-check">
                    <input type="checkbox" checked={att80} onChange={e => setAtt80(e.target.checked)} />
                    <span>최근 1년 출근율 {ANNUAL_LEAVE.attendanceMinPct}% 이상<small>{hasYearGrant ? '지금 연차를 만든 직전 1년(회계연도 기준은 직전 회계연도) 기준' : '1년 미만 기간에는 영향 없음 — 1년 이후에 적용'}</small></span>
                  </label>
                </div>
              </div>
              {!att80 && (
                <div className="ui-field">
                  <label className="ui-label" htmlFor="al-low">그 1년 동안 개근한 달 수 <span className="ui-hint">0~{ANNUAL_LEAVE.firstYearMonthlyMax}</span></label>
                  <div className="ui-input ui-sm">
                    <input id="al-low" type="text" inputMode="numeric" autoComplete="off" value={lowMonths} onChange={e => onSmallInt(setLowMonths)(e.target.value)} />
                    <span className="ui-unit">개월</span>
                  </div>
                  <p className="ui-helper">출근율이 {ANNUAL_LEAVE.attendanceMinPct}% 미만이면 {ANNUAL_LEAVE.base}일 대신 1개월 개근마다 1일(§60②)입니다.</p>
                </div>
              )}
              <div className="ui-field">
                <label className="ui-label" htmlFor="al-absent">1년 미만 기간 중 결근한 달 수 <span className="ui-hint">0~{ANNUAL_LEAVE.firstYearMonthlyMax}</span></label>
                <div className="ui-input ui-sm">
                  <input id="al-absent" type="text" inputMode="numeric" autoComplete="off" value={absent} onChange={e => onSmallInt(setAbsent)(e.target.value)} aria-describedby="al-absent-help" />
                  <span className="ui-unit">개월</span>
                </div>
                <p className="ui-helper" id="al-absent-help">입사 첫 1년 동안 하루라도 결근한 달의 수(개근하지 못한 달은 월 단위 연차가 생기지 않음). {inFirstYear ? '지금까지 지난 달 기준으로 넣으세요.' : '모두 개근했다면 0.'}</p>
              </div>
            </div>
          </details>
        </div>
      </div>

      <ResultHero
        label={heroLabel}
        value={heroValue}
        unit={heroUnit}
        pill={ready ? pill : undefined}
        empty={emptyMsg}
        sub={sub}
        formula={formula}
        actions={
          <div className="ui-btnRow">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={copyLink}>
              <UiIcon name="share" size={18} />{copied === 'link' ? '링크 복사됨' : '링크 공유'}
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={copyResult}>
              <UiIcon name="copy" size={18} />{copied === 'result' ? '복사했어요' : '결과 복사'}
            </button>
          </div>
        }
      >
        {grantRows.length > 0 && <BreakdownTable caption={`기간별 연차 (${basisLabel})`} unit="일" head={['연차', '일수', '상태']} rows={grantRows} />}
        {compareRows.length > 0 && <BreakdownTable caption={`입사일 기준과 비교 — ${dotDate(refDate)}까지 누적`} unit="일" head={['항목', '일수']} rows={compareRows} />}
      </ResultHero>

      {ready && r.ok && !r.applicable && (
        <Callout tone="warn" title={`상시 ${LEAVE_MIN_WORKERS}명 미만 사업장은 법정 연차가 없습니다`}>
          근로기준법 §11②와 시행령 §7 [별표 1]은 상시 4명 이하 사업장에 적용할 조항을 따로 정하는데, 연차 유급휴가(§60)는 여기에 없습니다. 다만 근로계약서·취업규칙에 연차를 주기로 정했다면 그 약정에 따라야 합니다. 약정이 있다면 체크를 켜고 계산해 보세요.
        </Callout>
      )}

      {ready && r.ok && r.applicable && gain && (
        <Callout tone="warn" title={`${korDate(gain.date)}까지 재직하면 연차 ${fmtDays(gain.newDays)}일이 새로 생깁니다`}>
          연차는 1년(월 단위 연차는 1개월)을 채운 <strong>다음 날</strong>, 회계연도 기준은 <strong>부여일 당일</strong>에 재직 중이어야 발생합니다({LEAVE_PRECEDENTS.oneYearContract.court} {LEAVE_PRECEDENTS.oneYearContract.caseNo}, 고용노동부 {dotDate(LEAVE_DATES.moelNextDayRuleFrom)} 행정해석).
          {' '}마지막 근무일이 {dotDate(gain.date)} 이후라면 {grantNames(gain.grants)} {fmtDays(gain.newDays)}일이 생깁니다.
          {gain.extraNow > gain.extraThen && <> 대신 회계연도 기준 퇴직 정산 차이가 {fmtDays(gain.extraNow)}일에서 {fmtDays(gain.extraThen)}일로 줄어,</>}
          {' '}연차수당으로 받을 일수는 <strong>{fmtDays(gain.gainDays)}일</strong>, 지금 1일 통상임금 {won(r.dailyWage)}원 기준 <strong>{won(Math.floor(r.dailyWage * gain.gainDays + 1e-6))}원</strong> 늘어납니다.
          {' '}이미 생긴 연차 중 쓰지 못한 날은 사용기한이 지나도 수당으로 받는다는 전제입니다(§61 사용촉진이 없었을 때).
        </Callout>
      )}

      {ready && r.ok && r.applicable && lastExpDays > 0 && (
        <Callout tone="note" title={`직전 연차 ${fmtDays(lastExpDays)}일은 ${dotDate(lastExpDate)}에 사용기한이 끝났습니다`}>
          그중 쓰지 못한 날이 있고 회사가 근로기준법 §61의 서면 사용촉진을 하지 않았다면, 휴가는 소멸해도 <strong>미사용 연차수당</strong>(1일 통상임금 × 미사용 일수)을 받을 수 있습니다. 전부 쓰지 못했다면 {fmtDays(lastExpDays)}일 × {won(lastExpDaily)}원{lastMw && <>({lastMw.exact ? `${lastMw.year}년 최저시급 기준` : `표에 없는 해라 ${lastMw.year}년 최저시급으로 어림 — 실제 시급을 넣으세요`})</>} = <strong>{won(Math.floor(lastExpDaily * lastExpDays + 1e-6))}원</strong>입니다.{retire && <> 위 결과와 합치면 {fmtDays(round2(r.payDays + lastExpDays))}일분입니다.</>} 수당 청구권은 {WAGE_CLAIM_YEARS}년 안에 행사해야 합니다(§49).
        </Callout>
      )}

      {ready && r.ok && r.applicable && r.lowApplied && (
        <Callout tone="note" title={`출근율 ${ANNUAL_LEAVE.attendanceMinPct}% 미만 반영`}>
          최근 연 단위 연차를 {r.grants.some(g => g.kind === 'lowAttendance') ? `개근한 달 수(${parseInt(lowMonths, 10) || 0}일)로` : '비례 연차 0일로'} 바꿔 계산했습니다. 업무상 부상·질병 휴업, 출산전후휴가, 육아휴직 기간 등은 결근이 아니라 <strong>출근한 것으로 봅니다</strong>(§60⑥) — 이런 기간 때문에 80% 아래로 떨어졌다면 체크를 다시 켜세요. 회계연도 기준과 입사일 기준 비교는 해마다 출근율을 따로 따져야 해서 생략했습니다.
        </Callout>
      )}

      {ready && r.ok && r.applicable && hireEarly && (
        <p className={s.note}>
          {dotDate(LEAVE_DATES.separateFirstYearHiredFrom)} 이전 입사자의 입사 첫해 연차는 당시 법(1년 뒤 생기는 {ANNUAL_LEAVE.base}일에서 첫해 사용분을 뺌)이 적용되었습니다. 이 계산기는 현행 규칙으로 계산하므로 첫해 부분은 참고만 하세요.
        </p>
      )}

      {ready && r.ok && r.applicable && !retire && r.upcoming.length > 0 && (
        <section className={s.upcoming} aria-labelledby="al-up-h">
          <h3 className={s.upH} id="al-up-h"><UiIcon name="calendar" size={18} />앞으로 생길 연차</h3>
          <ul className={s.upList}>
            {r.upcoming.map(g => (
              <li key={`${g.kind}-${g.arise}`}>
                <span className={s.upDate}>{dotDate(g.arise)}</span>
                <span className={s.upLabel}>{g.kind === 'monthly' ? '다음 월 단위 연차' : grantLabel(g)}</span>
                <b className={s.upDays}>+{fmtDays(g.days)}일</b>
              </li>
            ))}
          </ul>
          <p className={s.upNote}>그날 재직 중이고 {attNote(basis)} 기준입니다. 사용기한은 발생일부터 1년(1년 미만 월 단위 연차는 입사 1년이 되는 날 전날까지)입니다.</p>
        </section>
      )}
    </>
  )
}

/** 새로 생기는 연차 이름 — 같은 날 여러 건(월 단위 + 비례)이면 이어 붙인다 */
function grantNames(gs: readonly LeaveGrant[]): string {
  return [...new Set(gs.map(g => (g.kind === 'monthly' ? '월 단위 연차' : grantLabel(g))))].join('·')
}

/** 발생 예정 안내의 출근율 조건 문구 */
function attNote(basis: LeaveBasis): string {
  return basis === 'fiscal'
    ? `직전 회계연도 출근율 ${ANNUAL_LEAVE.attendanceMinPct}% 이상(월 단위는 그달 개근)`
    : `직전 1년 출근율 ${ANNUAL_LEAVE.attendanceMinPct}% 이상(월 단위는 그달 개근)`
}
