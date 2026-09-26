'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import ResultHero, { BreakdownTable, type BreakdownRow } from '@/components/ResultHero'
import Callout from '@/components/Callout'
import UiIcon from '@/components/UiIcon'
import { minHourlyWageFor, MONTHLY_WORK_HOURS } from '@/lib/krInsuranceRates'
import { todayStr } from '@/lib/date'
import { LOCAL_INCOME_TAX_RATIO, TAX_ROUNDING_UNIT } from '@/lib/krFinancialIncomeTax'
import {
  WEEKLY_HOLIDAY_MIN_HOURS, PREMIUM_MIN_WORKERS, PREMIUM_RATES, HOLIDAY_SPLIT_HOURS, NIGHT_WINDOW,
  OVERTIME_WEEKLY_LIMIT, INSURANCE_MIN_MONTHLY_HOURS, UNEMP_MIN_WEEKLY_HOURS, BUSINESS_WITHHOLDING_RATE,
  PROBATION_MIN_WAGE, BREAK_RULES, WEEK_LEGAL_HOURS, DAY_LEGAL_HOURS, WEEKS_PER_MONTH, PREMIUM_ROUNDING_UNIT,
  BREAK_WAIVER_4H, EI_INCOME_BASIS, UNEMP_LONG_TERM_MONTHS, PENSION_SHORT_HOUR_EXCEPTIONS, pensionExceptionLabel,
} from '@/lib/krHourlyPay'
import {
  calcHourlyPay, commaInput, decimalInput, parseMoney, parseDec, won, hrs, pct,
  isPayYear, isPatternMode, isDeduction, defaultPayYear, PAY_YEARS, DAY_LABELS, DEFAULT_INPUT,
  MAX_HOURLY, MAX_DAY_HOURS, MAX_BREAK_MINUTES, MAX_WEEK_EXTRA_HOURS, MAX_NIGHT_HOURS,
  type PayYear, type PatternMode, type Deduction, type HourlyPayResult,
} from './hourlyPayUtils'
import s from './hourlyPay.module.css'

const STORAGE_KEY = 'youtil:hourly-pay:inputs-v1'

const DEDUCTION_OPTS: { id: Deduction; name: string }[] = [
  { id: 'none', name: '공제 없음' },
  { id: 'biz33', name: `${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))} 사업소득` },
  { id: 'insurance', name: '4대보험 근로자분' },
]

/** year·hourly는 사용자가 직접 고른·입력한 경우에만 저장한다(없으면 방문 날짜의 연도·최저시급을 따른다) */
interface Saved {
  year?: PayYear; hourly?: string; mode: PatternMode; days: string; hpd: string; byDay: string[]
  includesBreak: boolean; brk: string; ot: string; night: string; holDays: string; holHours: string
  fivePlus: boolean; attend: boolean; deduction: Deduction; longTerm: boolean
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
/** 소수 입력 + 상한 클램프 */
const capDec = (v: string, max: number): string => {
  const d = decimalInput(v)
  return parseFloat(d) > max ? String(max) : d
}
const capInt = (v: string, max: number): string => {
  const d = v.replace(/[^\d]/g, '').slice(0, 3)
  return d && parseInt(d, 10) > max ? String(max) : d
}
const capMoney = (v: string): string => {
  const c = commaInput(v)
  return parseMoney(c) > MAX_HOURLY ? MAX_HOURLY.toLocaleString('ko-KR') : c
}

/* 기준일 — SSG(빌드)와 hydration 첫 렌더는 page.tsx가 넘긴 빌드 날짜(buildDate)를 쓰고(불일치 없음),
   hydration 직후 기기 날짜(todayStr)로 다시 렌더한다 → 해가 바뀐 뒤 방문해도 기본 연도·최저시급이 맞다 (4-insurance 패턴) */
const noopSubscribe = () => () => {}
const useAsOfDate = (buildDate: string): string => useSyncExternalStore(noopSubscribe, todayStr, () => buildDate)
/** 'YYYY-MM-DD' → 'YYYY.M.D' */
const dotDate = (d: string): string => d.split('-').map((x, i) => (i === 0 ? x : String(Number(x)))).join('.')
const BREAK_WAIVER_YEAR = Number(BREAK_WAIVER_4H.since.slice(0, 4))
const EI_SINCE = dotDate(EI_INCOME_BASIS.since)

/** 월 환산 주 수 표기 (365 ÷ 7 ÷ 12 ≈ 4.345) */
const WPM = (Math.round(WEEKS_PER_MONTH * 1000) / 1000).toLocaleString('ko-KR')
const RULE_8 = BREAK_RULES.find(r => r.minWorkHours === DAY_LEGAL_HOURS)
const RULE_4 = BREAK_RULES[BREAK_RULES.length - 1]

export default function HourlyPayClient({ buildDate }: { buildDate?: string }) {
  const asOf = useAsOfDate(buildDate ?? todayStr())
  // 연도·시급은 '직접 고른 값'만 state에 두고, 없으면 기준일의 연도와 그 해 최저시급을 따른다
  const [yearSel, setYearSel] = useState<PayYear | null>(null)
  const year: PayYear = yearSel ?? defaultPayYear(asOf)
  const [hourlyIn, setHourly] = useState<string | null>(null)
  const hourly = hourlyIn ?? minHourlyWageFor(year).toLocaleString('ko-KR')
  const [mode, setMode] = useState<PatternMode>(DEFAULT_INPUT.mode)
  const [days, setDays] = useState(String(DEFAULT_INPUT.days))
  const [hpd, setHpd] = useState(String(DEFAULT_INPUT.hoursPerDay))
  const [byDay, setByDay] = useState<string[]>(DEFAULT_INPUT.byDay.map(String))
  const [includesBreak, setIncludesBreak] = useState(DEFAULT_INPUT.includesBreak)
  const [brk, setBrk] = useState(String(DEFAULT_INPUT.breakMinutes))
  const [ot, setOt] = useState('0')
  const [night, setNight] = useState('0')
  const [holDays, setHolDays] = useState('0')
  const [holHours, setHolHours] = useState(String(DEFAULT_INPUT.holidayHoursPerDay))
  const [fivePlus, setFivePlus] = useState(DEFAULT_INPUT.fivePlus)
  const [attend, setAttend] = useState(DEFAULT_INPUT.perfectAttendance)
  const [deduction, setDeduction] = useState<Deduction>(DEFAULT_INPUT.deduction)
  const [longTerm, setLongTerm] = useState(DEFAULT_INPUT.longTerm)
  const [extraOpen, setExtraOpen] = useState(false)
  const [siteOpen, setSiteOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState<'result' | 'link' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabRefs = useRef<Record<PatternMode, HTMLButtonElement | null>>({ simple: null, byDay: null })

  /* 복원 — 공유 링크(?w=…)가 있으면 그것을, 없으면 이 기기에 저장된 마지막 입력 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const apply = (v: Partial<Record<keyof Saved, unknown>>) => {
      if (isPayYear(v.year)) setYearSel(v.year)
      if (isStr(v.hourly) && v.hourly) setHourly(capMoney(v.hourly))
      if (isPatternMode(v.mode)) setMode(v.mode)
      if (isStr(v.days) && v.days) setDays(capInt(v.days, 7))
      if (isStr(v.hpd) && v.hpd) setHpd(capDec(v.hpd, MAX_DAY_HOURS))
      if (Array.isArray(v.byDay) && v.byDay.length === 7 && v.byDay.every(isStr)) setByDay(v.byDay.map(x => capDec(x, MAX_DAY_HOURS)))
      if (isBool(v.includesBreak)) setIncludesBreak(v.includesBreak)
      if (isStr(v.brk) && v.brk) setBrk(capInt(v.brk, MAX_BREAK_MINUTES))
      if (isStr(v.ot) && v.ot) setOt(capDec(v.ot, MAX_WEEK_EXTRA_HOURS))
      if (isStr(v.night) && v.night) setNight(capDec(v.night, MAX_NIGHT_HOURS))
      if (isStr(v.holDays) && v.holDays) setHolDays(capInt(v.holDays, 7))
      if (isStr(v.holHours) && v.holHours) setHolHours(capDec(v.holHours, MAX_DAY_HOURS))
      if (isBool(v.fivePlus)) setFivePlus(v.fivePlus)
      if (isBool(v.attend)) setAttend(v.attend)
      if (isDeduction(v.deduction)) setDeduction(v.deduction)
      if (isBool(v.longTerm)) setLongTerm(v.longTerm)
      // 기본값과 다른 옵션이 복원되면 해당 패널을 펼쳐 둔다 (이후에는 사용자의 열고 닫기를 따른다)
      const pos = (x: unknown) => isStr(x) && parseFloat(x) > 0
      if (pos(v.ot) || pos(v.night) || pos(v.holDays)) setExtraOpen(true)
      if (v.fivePlus === false || v.attend === false) setSiteOpen(true)
    }
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('w')) {
        const b = (k: string) => (q.get(k) === '1' ? true : q.get(k) === '0' ? false : undefined)
        const bd = (q.get('b') ?? '').split(',')
        apply({
          year: Number(q.get('y')), hourly: q.get('w') ?? '', mode: q.get('m'), days: q.get('d') ?? '', hpd: q.get('h') ?? '',
          byDay: bd.length === 7 ? bd : undefined, includesBreak: b('ib'), brk: q.get('bk') ?? '', ot: q.get('ot') ?? '',
          night: q.get('nt') ?? '', holDays: q.get('hd') ?? '', holHours: q.get('hh') ?? '', fivePlus: b('f5'),
          attend: b('pa'), deduction: q.get('dd'), longTerm: b('lt'),
        })
      } else {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const j: unknown = JSON.parse(raw)
          if (j && typeof j === 'object' && !Array.isArray(j)) apply(j as Record<string, unknown>)
        }
      }
    } catch { /* 저장소 접근 불가·손상 — 기본값 유지 */ }
    // 마운트 1회 외부 저장소(URL·localStorage) 복원 완료 표시 — 이후에만 저장 effect가 돈다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    try {
      const v: Saved = {
        ...(yearSel !== null && { year: yearSel }), ...(hourlyIn !== null && { hourly: hourlyIn }),
        mode, days, hpd, byDay, includesBreak, brk, ot, night, holDays, holHours, fivePlus, attend, deduction, longTerm,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    } catch { /* 저장 실패 무시 */ }
  }, [hydrated, yearSel, hourlyIn, mode, days, hpd, byDay, includesBreak, brk, ot, night, holDays, holHours, fivePlus, attend, deduction, longTerm])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const hourlyV = parseMoney(hourly)
  const r: HourlyPayResult = useMemo(() => calcHourlyPay({
    year, hourly: hourlyV, mode,
    days: parseInt(days, 10) || 0, hoursPerDay: parseDec(hpd), byDay: byDay.map(parseDec),
    includesBreak, breakMinutes: parseInt(brk, 10) || 0,
    overtimeHours: parseDec(ot), nightHours: parseDec(night),
    holidayDays: parseInt(holDays, 10) || 0, holidayHoursPerDay: parseDec(holHours),
    fivePlus, perfectAttendance: attend, deduction, longTerm,
  }), [year, hourlyV, mode, days, hpd, byDay, includesBreak, brk, ot, night, holDays, holHours, fivePlus, attend, deduction, longTerm])

  const minWage = minHourlyWageFor(year)
  const ready = hourlyV > 0 && r.totalWorkHours > 0

  /* ── 핸들러 ── */
  const switchYear = (y: PayYear) => {
    if (y === year) return
    // 시급이 이전 연도 최저시급 그대로면 새 연도 최저시급을 따르게 한다(직접 넣은 다른 시급은 유지)
    if (hourlyV === minHourlyWageFor(year)) setHourly(null)
    setYearSel(y)
  }
  const switchMode = (m: PatternMode) => {
    if (m === mode) return
    // 두 방식 사이에 같은 근무를 옮겨 준다
    if (m === 'byDay') {
      const n = Math.min(7, parseInt(days, 10) || 0)
      setByDay(Array.from({ length: 7 }, (_, k) => (k < n ? hpd || '0' : '0')))
    } else {
      const worked = byDay.map(parseDec).filter(x => x > 0)
      if (worked.length > 0) {
        setDays(String(worked.length))
        const avg = worked.reduce((a, x) => a + x, 0) / worked.length
        setHpd(String(Math.round(avg * 100) / 100))
      }
    }
    setMode(m)
  }
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next: PatternMode = e.key === 'Home' ? 'simple' : e.key === 'End' ? 'byDay' : mode === 'simple' ? 'byDay' : 'simple'
    switchMode(next)
    tabRefs.current[next]?.focus()
  }
  const setDay = (k: number, v: string) => setByDay(prev => prev.map((x, i) => (i === k ? capDec(v, MAX_DAY_HOURS) : x)))

  const flash = (kind: 'result' | 'link') => {
    setCopied(kind)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1500)
  }
  const writeClip = async (text: string, kind: 'result' | 'link') => {
    try { await navigator.clipboard.writeText(text); flash(kind) } catch { /* 권한 거부 — 조용히 무시 */ }
  }
  const patternText = mode === 'simple'
    ? `주 ${r.input.days}일 × ${hrs(r.input.hoursPerDay)}시간`
    : DAY_LABELS.map((d, k) => (r.input.byDay[k] > 0 ? `${d}${hrs(r.input.byDay[k])}` : '')).filter(Boolean).join('·')
  const copyResult = () => {
    const text = [
      `[알바 급여] ${year}년 · 시급 ${won(r.input.hourly)}원 · ${patternText} (주 소정 ${hrs(r.scheduled)}시간)`,
      `주휴수당 ${won(r.lines[1].amount)}원(주 ${hrs(r.weeklyHolidayHours)}시간) · 주급 ${won(r.weekly)}원`,
      `월 예상 급여(세전) ${won(r.monthlyGross)}원${deduction !== 'none' ? ` · 공제 후 ${won(r.monthlyNet)}원` : ''}`,
      window.location.origin + window.location.pathname,
    ].join('\n')
    void writeClip(text, 'result')
  }
  const copyLink = () => {
    const i = r.input
    const q = new URLSearchParams({
      y: String(year), w: String(i.hourly), m: mode, d: String(i.days), h: String(i.hoursPerDay), b: i.byDay.join(','),
      ib: includesBreak ? '1' : '0', bk: String(i.breakMinutes), ot: String(i.overtimeHours), nt: String(i.nightHours),
      hd: String(i.holidayDays), hh: String(i.holidayHoursPerDay), f5: fivePlus ? '1' : '0', pa: attend ? '1' : '0',
      dd: deduction, lt: longTerm ? '1' : '0',
    })
    void writeClip(`${window.location.origin}${window.location.pathname}?${q.toString()}`, 'link')
  }

  /* ── 결과 표 ── */
  const lineNote = (key: string): string | undefined => {
    const L = r.lines.find(l => l.key === key)
    if (!L) return undefined
    const hw = `${won(r.input.hourly)}원`
    switch (key) {
      case 'base': return `${hrs(L.hours)}시간 × ${hw}`
      case 'weeklyHoliday':
        return r.holidayReason === 'ok' ? `min(${hrs(r.scheduled)}, ${WEEK_LEGAL_HOURS})÷${WEEK_LEGAL_HOURS}×${DAY_LEGAL_HOURS} = ${hrs(L.hours)}시간 × ${hw}`
          : r.holidayReason === 'under15' ? `주 소정근로 ${WEEKLY_HOLIDAY_MIN_HOURS}시간 미만 — 발생 안 함`
          : r.holidayReason === 'absent' ? '소정근로일 결근 — 그 주 발생 안 함' : undefined
      case 'overtime': return `${hrs(L.hours)}시간 × ${hw} × ${fivePlus ? `${1 + PREMIUM_RATES.overtime}배` : `1배(${PREMIUM_MIN_WORKERS}인 미만)`}`
      case 'night': return fivePlus ? `${hrs(L.hours)}시간 × ${hw} × ${PREMIUM_RATES.night} (가산분만)` : `${PREMIUM_MIN_WORKERS}인 미만 — 가산 없음`
      case 'holiday': return fivePlus
        ? `${HOLIDAY_SPLIT_HOURS}시간 이내 ${hrs(r.holidayWithin)}시간 × ${1 + PREMIUM_RATES.holiday}배${r.holidayOver > 0 ? ` + 초과 ${hrs(r.holidayOver)}시간 × ${1 + PREMIUM_RATES.holidayOver}배` : ''}`
        : `${hrs(L.hours)}시간 × 1배(${PREMIUM_MIN_WORKERS}인 미만)`
      default: return undefined
    }
  }
  const weekRows: BreakdownRow[] = [
    ...r.lines
      .filter(l => l.key === 'base' || l.key === 'weeklyHoliday' || l.hours > 0)
      .map((l): BreakdownRow => ({
        label: l.label,
        note: lineNote(l.key),
        cols: [`${hrs(l.hours)}h`, `${won(l.amount)}`],
        color: l.key === 'base' ? 'data-3' : l.key === 'weeklyHoliday' ? 'data-1' : 'data-2',
      })),
    { label: '주급', cols: ['', won(r.weekly)], kind: 'sum' },
    { label: '월 환산', note: '주급 × 365 ÷ 7 ÷ 12', cols: ['', won(r.monthlyGross)], kind: 'net' },
  ]
  const dedNote = (key: string, excluded?: boolean): string | undefined => {
    if (excluded) {
      if (key === 'unemp') return `월 ${INSURANCE_MIN_MONTHLY_HOURS}시간 또는 주 ${UNEMP_MIN_WEEKLY_HOURS}시간 미만 — ${UNEMP_LONG_TERM_MONTHS}개월 미만 근무라 적용 제외`
      if (key === 'pension') return `월 소정근로 ${INSURANCE_MIN_MONTHLY_HOURS}시간 미만 — 적용 제외(예외는 아래 안내)`
      return `월 소정근로 ${INSURANCE_MIN_MONTHLY_HOURS}시간 미만 — 적용 제외`
    }
    switch (key) {
      case 'incomeTax': return `월 급여 × ${pct(BUSINESS_WITHHOLDING_RATE)} · ${TAX_ROUNDING_UNIT}원 미만 버림`
      case 'localTax': return `사업소득세 × ${pct(LOCAL_INCOME_TAX_RATIO)}`
      case 'pension': return `${year}년 법정 요율 ${r.pensionRate}% · 기준소득월액 상·하한 적용`
      case 'unemp':
        if (r.coverage?.unempPending) return `${r.ratesYear}년 요율 · ${EI_INCOME_BASIS.sinceYear}년 소득기준 미정 — 적용으로 가정`
        return `${r.ratesYear}년 요율 · ${PREMIUM_ROUNDING_UNIT}원 미만 버림`
      case 'ltc': return '건강보험료 × 장기요양 비율'
      default: return `${r.ratesYear}년 요율 · ${PREMIUM_ROUNDING_UNIT}원 미만 버림`
    }
  }
  const monthRows: BreakdownRow[] = [
    { label: '월 예상 급여(세전)', cols: [won(r.monthlyGross)], color: 'data-1' },
    ...r.deductions.map((d): BreakdownRow => ({ label: d.label, note: dedNote(d.key, d.excluded), cols: [d.amount > 0 ? `−${won(d.amount)}` : '0'], color: 'data-4' })),
    { label: '공제 합계', cols: [`−${won(r.deductionTotal)}`], kind: 'sum' },
    { label: '월 실수령(추정)', cols: [won(r.monthlyNet)], kind: 'net' },
  ]

  const holidayVerdict =
    r.holidayReason === 'ok' ? <>발생 — 주 <b>{hrs(r.weeklyHolidayHours)}시간</b>분 <b>{won(r.lines[1].amount)}원</b></>
    : r.holidayReason === 'under15' ? <>없음 — 주 소정근로 {hrs(r.scheduled)}시간 &lt; {WEEKLY_HOLIDAY_MIN_HOURS}시간</>
    : r.holidayReason === 'absent' ? <>없음 — 그 주 소정근로일 결근</>
    : <>근무시간을 입력하세요</>
  const paidPct = r.fullTime209 > 0 ? Math.round((r.monthlyPaidHours / MONTHLY_WORK_HOURS) * 1000) / 10 : 0

  const formula = <>주급 <b>{won(r.weekly)}</b> × 365 ÷ 7 ÷ 12 = <b>{won(r.monthlyGross)}원</b></>

  // §54① 단서(4시간 근로일 휴게 생략 요청) — 기준일이 시행일 이후이거나 선택 연도가 시행 다음 해 이후면 적용
  const waiverActive = asOf >= BREAK_WAIVER_4H.since || year > BREAK_WAIVER_YEAR
  const breakHardDays = r.breakShortDays - (waiverActive ? r.breakShortWaivable : 0)

  return (
    <>
      <div className="ui-card">
        <fieldset className="ui-fieldset">
          <legend className="ui-label">적용 연도 <span className="ui-hint">최저시급 기준</span></legend>
          <div className="ui-chips" role="group" aria-label="적용 연도">
            {PAY_YEARS.map(y => (
              <button key={y} type="button" className="ui-chip" aria-pressed={year === y} onClick={() => switchYear(y)}>
                {y}년 · {won(minHourlyWageFor(y))}원
              </button>
            ))}
          </div>
        </fieldset>

        <div className="ui-field">
          <label className="ui-label" htmlFor="hp-wage">시급 <span className="ui-hint">세전 · 계약서 금액</span></label>
          <div className="ui-input">
            <input id="hp-wage" type="text" inputMode="numeric" autoComplete="off" value={hourly}
              onChange={e => setHourly(capMoney(e.target.value))} placeholder="0"
              aria-invalid={r.belowMinWage || undefined} aria-describedby="hp-wage-help" />
            <span className="ui-unit">원</span>
          </div>
          <p className={`ui-helper${r.belowMinWage ? ' ui-err' : ''}`} id="hp-wage-help">
            {r.belowMinWage
              ? <>{year}년 최저시급 <strong>{won(minWage)}원</strong>보다 {won(minWage - hourlyV)}원 낮습니다 — 아래 안내 참고</>
              : <>{year}년 최저시급 <strong>{won(minWage)}원</strong>{hourlyV === minWage ? ' 적용 중' : ''}</>}
          </p>
          {hourlyV !== minWage && (
            <div className="ui-chips">
              <button type="button" className="ui-chip" onClick={() => setHourly(null)}>최저시급 넣기</button>
            </div>
          )}
        </div>

        <div className="ui-field">
          <p className="ui-label" id="hp-pattern-l">근무 패턴</p>
          <div className="ui-seg" role="tablist" aria-labelledby="hp-pattern-l">
            {(['simple', 'byDay'] as PatternMode[]).map(m => (
              <button key={m} type="button" role="tab" id={`hp-tab-${m}`}
                aria-selected={mode === m} aria-controls="hp-panel" tabIndex={mode === m ? 0 : -1}
                ref={el => { tabRefs.current[m] = el }}
                onClick={() => switchMode(m)} onKeyDown={onTabKey}
              >{m === 'simple' ? '주 N일 × 하루 M시간' : '요일별 시간'}</button>
            ))}
          </div>
          <div role="tabpanel" id="hp-panel" aria-labelledby={`hp-tab-${mode}`}>
            {mode === 'simple' ? (
              <div className="ui-row2">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="hp-days">주 근무일수 <span className="ui-hint">0~7일</span></label>
                  <div className="ui-input ui-sm">
                    <input id="hp-days" type="text" inputMode="numeric" autoComplete="off" value={days} onChange={e => setDays(capInt(e.target.value, 7))} />
                    <span className="ui-unit">일</span>
                  </div>
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="hp-hpd">하루 근무시간 <span className="ui-hint">30분 = 0.5</span></label>
                  <div className="ui-input ui-sm">
                    <input id="hp-hpd" type="text" inputMode="decimal" autoComplete="off" value={hpd} onChange={e => setHpd(capDec(e.target.value, MAX_DAY_HOURS))} />
                    <span className="ui-unit">시간</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={s.dayGrid}>
                {DAY_LABELS.map((d, k) => (
                  <div key={d} className={s.dayCell}>
                    <label className={s.dayLabel} htmlFor={`hp-day-${k}`}>{d}</label>
                    <input id={`hp-day-${k}`} className={s.dayInput} type="text" inputMode="decimal" autoComplete="off"
                      value={byDay[k]} onChange={e => setDay(k, e.target.value)} aria-label={`${d}요일 근무시간(시간)`} />
                  </div>
                ))}
              </div>
            )}
            <p className="ui-helper">
              주 소정근로 <strong>{hrs(r.scheduled)}시간</strong>{r.workDays > 0 && <> · {r.workDays}일 근무</>}
              {r.autoOvertime > 0 && <> · 하루 {DAY_LEGAL_HOURS}시간·주 {WEEK_LEGAL_HOURS}시간을 넘는 <strong>{hrs(r.autoOvertime)}시간은 연장근로</strong>로 계산</>}
            </p>
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="hp-break">하루 휴게시간 <span className="ui-hint">무급 · 근로시간 도중</span></label>
          <div className="ui-input ui-sm">
            <input id="hp-break" type="text" inputMode="numeric" autoComplete="off" value={brk}
              onChange={e => setBrk(capInt(e.target.value, MAX_BREAK_MINUTES))} aria-describedby="hp-break-help" />
            <span className="ui-unit">분</span>
          </div>
          <div className="ui-checks" style={{ marginTop: 12 }}>
            <label className="ui-check">
              <input type="checkbox" checked={includesBreak} onChange={e => setIncludesBreak(e.target.checked)} />
              <span>위 근무시간이 출근~퇴근 시간(휴게 포함)이에요<small>체크하면 휴게시간을 빼고 유급 근로시간으로 계산합니다 (예: 9시~18시 = 9시간 − 1시간)</small></span>
            </label>
          </div>
          <p className={`ui-helper${breakHardDays > 0 ? ' ui-err' : ''}`} id="hp-break-help">
            {r.breakShortDays > 0
              ? <>{r.breakShortDays}일은 법정 휴게({r.breakRequiredMax}분 이상)보다 짧습니다 — 근로기준법 §54①
                {r.breakShortWaivable > 0 && (waiverActive
                  ? <>. 단, 근로시간이 {BREAK_WAIVER_4H.workHours}시간인 날({r.breakShortWaivable}일)은 근로자가 휴게를 쓰지 않겠다고 명시적으로 요청했다면 휴게 없이 일할 수 있습니다(§54① 단서, {dotDate(BREAK_WAIVER_4H.since)} 시행)</>
                  : <>. {dotDate(BREAK_WAIVER_4H.since)}부터는 근로시간이 {BREAK_WAIVER_4H.workHours}시간인 날에 근로자가 명시적으로 요청하면 휴게 없이 일할 수 있게 바뀝니다(§54① 단서)</>)}</>
              : <>법정 최소: 근로 {RULE_4.minWorkHours}시간 {RULE_4.minBreakMinutes}분 · {RULE_8?.minWorkHours}시간 {RULE_8?.minBreakMinutes}분 이상 (§54①)</>}
          </p>
        </div>

        <details className="ui-opts" open={extraOpen} onToggle={e => setExtraOpen(e.currentTarget.open)}>
          <summary>
            <span className="ui-optsL">추가 근무</span>
            {/* 계산에 실제로 쓴 값 — 야간은 총 근로시간, 휴일은 7일 − 근무일까지 */}
            <span className="ui-optsV">연장 <b>{hrs(r.input.overtimeHours)}h</b> · 야간 <b>{hrs(r.night)}h</b> · 휴일 <b>{r.holidayDaysUsed}일</b></span>
            <span className="ui-optsBtn">바꾸기<UiIcon name="chev-d" size={16} /></span>
          </summary>
          <div className="ui-optsBody">
            <div className="ui-row2">
              <div className="ui-field">
                <label className="ui-label" htmlFor="hp-ot">연장·초과근무 <span className="ui-hint">주, 소정 외</span></label>
                <div className="ui-input ui-sm">
                  <input id="hp-ot" type="text" inputMode="decimal" autoComplete="off" value={ot} onChange={e => setOt(capDec(e.target.value, MAX_WEEK_EXTRA_HOURS))} />
                  <span className="ui-unit">시간</span>
                </div>
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="hp-night">야간근로 <span className="ui-hint">{NIGHT_WINDOW.start}~{String(NIGHT_WINDOW.end).padStart(2, '0')}시</span></label>
                <div className="ui-input ui-sm">
                  <input id="hp-night" type="text" inputMode="decimal" autoComplete="off" value={night} onChange={e => setNight(capDec(e.target.value, MAX_NIGHT_HOURS))} />
                  <span className="ui-unit">시간</span>
                </div>
              </div>
            </div>
            <p className="ui-helper">연장은 정해진 근무(소정근로) 밖에 더 일한 시간, 야간은 위 모든 근무 중 {NIGHT_WINDOW.start}시~다음 날 {NIGHT_WINDOW.end}시에 걸친 시간의 주 합계입니다. 야간은 기본급이 이미 들어 있어 가산분만 더합니다.</p>
            <div className="ui-row2">
              <div className="ui-field">
                <label className="ui-label" htmlFor="hp-hd">휴일근로 <span className="ui-hint">주휴일 등, 주</span></label>
                <div className="ui-input ui-sm">
                  <input id="hp-hd" type="text" inputMode="numeric" autoComplete="off" value={holDays} onChange={e => setHolDays(capInt(e.target.value, 7))} />
                  <span className="ui-unit">일</span>
                </div>
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="hp-hh">휴일 하루 근무 <span className="ui-hint">휴게 제외</span></label>
                <div className="ui-input ui-sm">
                  <input id="hp-hh" type="text" inputMode="decimal" autoComplete="off" value={holHours} onChange={e => setHolHours(capDec(e.target.value, MAX_DAY_HOURS))} />
                  <span className="ui-unit">시간</span>
                </div>
              </div>
            </div>
            <p className="ui-helper">휴일근로는 하루 {HOLIDAY_SPLIT_HOURS}시간까지 {1 + PREMIUM_RATES.holiday}배, 넘는 시간은 {1 + PREMIUM_RATES.holidayOver}배입니다({PREMIUM_MIN_WORKERS}인 이상, §56②).</p>
            {(r.night < r.input.nightHours || r.holidayDaysUsed < r.input.holidayDays) && (
              <p className="ui-helper">
                {r.night < r.input.nightHours && <>야간은 총 근로시간({hrs(r.totalWorkHours)}시간)까지만 계산합니다. </>}
                {r.holidayDaysUsed < r.input.holidayDays && <>휴일근로는 근무일({r.workDays}일)과 합쳐 주 7일까지라 {r.holidayDaysUsed}일만 계산합니다.</>}
              </p>
            )}
          </div>
        </details>

        <details className="ui-opts" open={siteOpen} onToggle={e => setSiteOpen(e.currentTarget.open)}>
          <summary>
            <span className="ui-optsL">사업장·근태</span>
            <span className="ui-optsV"><b>{fivePlus ? `상시 ${PREMIUM_MIN_WORKERS}명 이상` : `${PREMIUM_MIN_WORKERS}명 미만`}</b> · 이번 주 <b>{attend ? '개근' : '결근 있음'}</b></span>
            <span className="ui-optsBtn">바꾸기<UiIcon name="chev-d" size={16} /></span>
          </summary>
          <div className="ui-optsBody">
            <div className="ui-field">
              <div className="ui-checks">
                <label className="ui-check">
                  <input type="checkbox" checked={fivePlus} onChange={e => setFivePlus(e.target.checked)} />
                  <span>상시 근로자 {PREMIUM_MIN_WORKERS}명 이상 사업장<small>{PREMIUM_MIN_WORKERS}명 미만이면 연장·야간·휴일 가산수당 의무가 없고, 하루 {DAY_LEGAL_HOURS}시간·주 {WEEK_LEGAL_HOURS}시간 한도도 적용되지 않습니다(§11). 주휴·최저임금은 똑같이 적용</small></span>
                </label>
                <label className="ui-check">
                  <input type="checkbox" checked={attend} onChange={e => setAttend(e.target.checked)} />
                  <span>이번 주 정해진 근무일을 모두 출근<small>결근한 주는 주휴수당이 생기지 않습니다(시행령 §30①). 지각·조퇴는 결근이 아닙니다</small></span>
                </label>
              </div>
            </div>
          </div>
        </details>

        <fieldset className="ui-field ui-fieldset">
          <legend className="ui-label">공제</legend>
          <div className="ui-chips" role="group" aria-label="공제 방식">
            {DEDUCTION_OPTS.map(o => (
              <button key={o.id} type="button" className="ui-chip" aria-pressed={deduction === o.id} onClick={() => setDeduction(o.id)}>{o.name}</button>
            ))}
          </div>
          <p className="ui-helper">
            {deduction === 'none' && '세전 급여만 봅니다.'}
            {deduction === 'biz33' && <>사업소득세 {pct(BUSINESS_WITHHOLDING_RATE)} + 지방소득세(그 {pct(LOCAL_INCOME_TAX_RATIO)}) — 근로계약 없이 &lsquo;프리랜서&rsquo;로 처리할 때 떼는 방식</>}
            {deduction === 'insurance' && <>국민연금·건강·장기요양·고용보험 근로자 부담분. 근로소득세(간이세액)는 부양가족에 따라 달라 빼지 않습니다</>}
          </p>
          {deduction === 'insurance' && r.coverage && (r.coverage.underMin || r.coverage.unempUnderMin || r.coverage.unempBasis === 'income') && (
            <div className="ui-checks" style={{ marginTop: 12 }}>
              <label className="ui-check">
                <input type="checkbox" checked={longTerm} onChange={e => setLongTerm(e.target.checked)} />
                <span>{UNEMP_LONG_TERM_MONTHS}개월 이상 계속 근무<small>{r.coverage.unempBasis === 'hours'
                  ? <>월 {INSURANCE_MIN_MONTHLY_HOURS}시간(주 {UNEMP_MIN_WEEKLY_HOURS}시간) 미만이어도 {UNEMP_LONG_TERM_MONTHS}개월 이상 일하면 고용보험은 적용됩니다(고용보험법 시행령 §3②, {EI_INCOME_BASIS.sinceYear - 1}년 12월 31일까지 기준)</>
                  : <>{EI_INCOME_BASIS.sinceYear}년부터는 {UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하면 보수와 관계없이 고용보험이 적용됩니다(고용보험법 §10②2호)</>}</small></span>
              </label>
            </div>
          )}
        </fieldset>
      </div>

      <ResultHero
        label="월 예상 급여 (세전)"
        value={ready ? won(r.monthlyGross) : undefined}
        unit="원"
        pill={ready ? (r.weeklyHolidayHours > 0 ? `주휴 ${hrs(r.weeklyHolidayHours)}시간 포함` : '주휴수당 없음') : undefined}
        empty="시급과 근무시간을 입력하면 월 급여가 여기에 표시됩니다"
        sub={<>주급 <b>{won(r.weekly)}원</b> · 주휴수당 <b>{won(r.lines[1].amount)}원</b>{r.premiumWeekly > 0 && <> · 가산분 <b>{won(r.premiumWeekly)}원</b></>}{deduction !== 'none' && <> · 공제 후 <b>{won(r.monthlyNet)}원</b></>}</>}
        formula={formula}
        actions={
          <div className="ui-btnRow">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={copyLink}>
              <UiIcon name={copied === 'link' ? 'check' : 'share'} size={18} />{copied === 'link' ? '링크 복사됨' : '링크 공유'}
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={copyResult}>
              <UiIcon name={copied === 'result' ? 'check' : 'copy'} size={18} />{copied === 'result' ? '복사했어요' : '결과 복사'}
            </button>
          </div>
        }
      >
        <BreakdownTable caption="주급 내역" unit="원" head={['항목', '시간', '금액']} rows={weekRows} />
        {deduction !== 'none' && (
          <BreakdownTable caption={deduction === 'biz33' ? `월 공제 — ${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))}` : `월 공제 — 4대보험 근로자분(${r.ratesYear}년 요율)`} unit="원" head={['항목', '금액']} rows={monthRows} />
        )}

        <dl className={s.facts}>
          <div className={s.fact}>
            <dt>주휴수당</dt>
            <dd className={r.holidayReason === 'ok' ? s.good : undefined}>{holidayVerdict}</dd>
          </div>
          <div className={s.fact}>
            <dt>주휴 포함 실질 시급</dt>
            <dd><b>{won(r.effectiveHourly)}원</b> <span className={s.muted}>(기본급 + 주휴) ÷ {hrs(r.scheduled)}시간</span></dd>
          </div>
          <div className={s.fact}>
            <dt>월 유급시간 vs 월급제 {MONTHLY_WORK_HOURS}시간</dt>
            <dd><b>{hrs(r.monthlyPaidHours)}시간</b> <span className={s.muted}>= ({hrs(r.scheduled)} + 주휴 {hrs(r.weeklyHolidayHours)}) × {WPM} · {MONTHLY_WORK_HOURS}시간의 {paidPct}%</span></dd>
          </div>
          <div className={s.fact}>
            <dt>주 {WEEK_LEGAL_HOURS}시간 월급제라면</dt>
            <dd><b>{won(r.fullTime209)}원</b> <span className={s.muted}>시급 × {MONTHLY_WORK_HOURS}시간 (최저임금 월 환산 방식)</span></dd>
          </div>
          <div className={s.fact}>
            <dt>최저임금 ({year}년 {won(minWage)}원)</dt>
            <dd className={r.belowMinWage ? s.bad : s.good}>{r.belowMinWage ? <>미달 — 월 약 {won(r.minWageShortfallMonthly)}원 부족</> : <>충족</>}</dd>
          </div>
        </dl>
      </ResultHero>

      {ready && r.belowMinWage && (
        <Callout tone="warn" title={`${year}년 최저시급 ${won(minWage)}원보다 낮습니다`}>
          <p>최저임금법 §6①에 따라 사업장 규모와 관계없이 최저시급 이상을 줘야 합니다. 같은 근무를 최저시급으로 계산하면 월 <strong>{won(r.minWageShortfallMonthly)}원</strong>이 더 많습니다.
            일반 알바에게 적용될 수 있는 예외는 사실상 수습 감액입니다. {PROBATION_MIN_WAGE.minContractYears}년 이상 기간을 정해 계약한 근로자의 수습 {PROBATION_MIN_WAGE.maxMonths}개월 이내(단순노무직 제외)에 한해 최저시급의 {Math.round(PROBATION_MIN_WAGE.rate * 100)}%인 {won(r.probationFloor)}원까지 줄일 수 있습니다(§5②). 장애로 근로능력이 현저히 낮아 고용노동부장관 인가를 받은 경우 등의 적용 제외(§7)는 별도입니다.</p>
        </Callout>
      )}
      {ready && r.overtimeOverLimit && (
        <Callout tone="warn" title="1주 연장근로 한도를 넘습니다">
          <p>상시 {PREMIUM_MIN_WORKERS}명 이상 사업장에서 소정근로 밖의 근로(연장·휴일)는 1주 {OVERTIME_WEEKLY_LIMIT}시간까지입니다(근로기준법 §53①, 단시간근로자는 기간제법 §6①). 지금 입력은 {hrs(r.totalWorkHours - r.scheduled)}시간입니다. 수당 계산은 그대로 보여 드립니다.</p>
        </Callout>
      )}
      {ready && deduction === 'insurance' && r.ratesFallback && (
        <Callout tone="note" title={`${year}년 건강·장기요양·고용보험은 ${r.ratesYear}년 요율로 계산했습니다`}>
          <p>국민연금은 법정 {year}년 요율 {r.pensionRate}%(국민연금법 부칙 §4①)를 적용했고, 건강·장기요양·고용보험은 {year}년 요율이 이 계산기 요율표에 아직 없어 {r.ratesYear}년 근로자 요율로 계산했습니다. 해당 요율이 {year}년에 바뀌면 실제 공제액도 달라집니다.</p>
        </Callout>
      )}
      {ready && deduction === 'insurance' && r.coverage?.unempBasis === 'income' && (r.coverage.unempPending || r.coverage.unempUnderMin) && (
        <Callout tone="note" title={`${EI_SINCE}부터 고용보험 적용 기준이 근로시간에서 보수로 바뀝니다`}>
          <p>
            {EI_SINCE}부터 고용보험 적용 제외 기준은 소정근로시간(월 {INSURANCE_MIN_MONTHLY_HOURS}시간·주 {UNEMP_MIN_WEEKLY_HOURS}시간)이 아니라 &lsquo;보수가 시행령으로 정하는 소득기준 미만&rsquo;입니다(고용보험법 §10①2호, 법률 제{EI_INCOME_BASIS.act.no}호).
            {' '}{r.coverage.unempPending
              ? <>기준일 현재 소득기준 금액이 정해지지 않아, 이 계산은 {UNEMP_LONG_TERM_MONTHS}개월 미만 근무도 고용보험이 적용되는 것으로 가정해 {won(r.deductions.find(d => d.key === 'unemp')?.amount ?? 0)}원을 뺐습니다.</>
              : <>{UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하면 보수와 관계없이 적용됩니다(§10②2호).</>}
            {' '}일용근로자도 적용되고, {EI_SINCE} 전에 가입한 사람은 새 기준에 못 미쳐도 처음 이직하기 전까지 자격이 유지됩니다(부칙 §2).
          </p>
        </Callout>
      )}
      {ready && deduction === 'insurance' && r.coverage?.underMin && (
        <Callout tone="note" title={`월 소정근로 ${hrs(r.monthlyScheduledHours)}시간 — ${INSURANCE_MIN_MONTHLY_HOURS}시간 미만`}>
          <p>1개월 소정근로시간이 {INSURANCE_MIN_MONTHLY_HOURS}시간 미만인 단시간근로자는 국민연금·건강보험 직장가입 대상에서 빠집니다(국민연금법 시행령 §2 4호, 국민건강보험법 시행령 §9 1호). 다만 국민연금은 아래에 해당하면 가입 대상이라 공제가 이 계산보다 늘어납니다(시행령 §2 4호 단서).</p>
          <ul>
            {PENSION_SHORT_HOUR_EXCEPTIONS.map(e => (
              <li key={e.item}>{pensionExceptionLabel(e)}</li>
            ))}
          </ul>
          <p>마지막 경우의 고시 금액은 국민연금공단(국번 없이 1355)에 확인하세요. {r.coverage.unempBasis === 'hours'
            ? <>고용보험은 {UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하면 적용되고(고용보험법 시행령 §3②), </>
            : <>고용보험은 {EI_SINCE}부터 근로시간이 아니라 보수로 판단하고(위 안내), </>}산재보험은 근로시간과 관계없이 사업주가 부담합니다.</p>
        </Callout>
      )}
    </>
  )
}
