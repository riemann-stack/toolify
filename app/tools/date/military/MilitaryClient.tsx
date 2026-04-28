'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './military.module.css'

/* ─────────────────────────────────────────────────────────
 * 복무 형태 (2026년 병무청 기준)
 * ───────────────────────────────────────────────────────── */
interface ServiceType {
  id: string
  name: string
  months: number
  group: string
  cls: string
}

const SERVICE_TYPES: ServiceType[] = [
  // 18개월
  { id: 'army',                  name: '육군',                     months: 18, group: '현역병',    cls: 'svc18' },
  { id: 'marine',                name: '해병대',                   months: 18, group: '현역병',    cls: 'svc18' },
  { id: 'reserve',               name: '상근예비역',               months: 18, group: '예비역',    cls: 'svc18' },
  // 20개월
  { id: 'navy',                  name: '해군',                     months: 20, group: '현역병',    cls: 'svc20' },
  // 21개월
  { id: 'airforce',              name: '공군',                     months: 21, group: '현역병',    cls: 'svc21' },
  { id: 'social',                name: '사회복무요원',             months: 21, group: '보충역',    cls: 'svc21' },
  // 23개월
  { id: 'industrial-supplement', name: '산업기능요원 (보충역)',     months: 23, group: '대체복무',  cls: 'svc23' },
  // 34개월
  { id: 'industrial-active',     name: '산업기능요원 (현역)',       months: 34, group: '대체복무',  cls: 'svc34' },
  // 36개월
  { id: 'research',              name: '전문연구요원',             months: 36, group: '대체복무',  cls: 'svc36' },
  { id: 'alternative',           name: '대체복무요원',             months: 36, group: '대체복무',  cls: 'svc36' },
]

const SERVICE_GROUPS = [
  { months: 18, label: '🪖 18개월',  hint: '현역병·예비역' },
  { months: 20, label: '⚓ 20개월',  hint: '현역병' },
  { months: 21, label: '✈️ 21개월',  hint: '현역병·보충역' },
  { months: 23, label: '🏭 23개월',  hint: '대체복무' },
  { months: 34, label: '🏗️ 34개월',  hint: '대체복무' },
  { months: 36, label: '🔬 36개월',  hint: '대체복무' },
]

/* ─────────────────────────────────────────────────────────
 * 유틸
 * ───────────────────────────────────────────────────────── */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
function pad(n: number): string {
  return String(n).padStart(2, '0')
}
function fmtISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function fmtKR(d: Date): string {
  const wd = ['일','월','화','수','목','금','토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`
}
function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0,0,0,0); return r
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}
function parseDirect(s: string): Date | null {
  const cleaned = s.replace(/[.\/]/g, '-').trim()
  const m = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const y = +m[1], mo = +m[2], dy = +m[3]
  if (mo < 1 || mo > 12) return null
  if (dy < 1 || dy > daysInMonth(y, mo)) return null
  return new Date(y, mo - 1, dy)
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function MilitaryClient() {
  /* 오늘 (SSR 안전) */
  const [todayState, setTodayState] = useState<Date | null>(null)
  useEffect(() => { setTodayState(startOfDay(new Date())) }, [])

  /* 입대일 — 단일 source of truth: { y, m, d } */
  const initialEnlist = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 6)
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
  }, [])
  const [enlistY, setEnlistY] = useState(initialEnlist.y)
  const [enlistM, setEnlistM] = useState(initialEnlist.m)
  const [enlistD, setEnlistD] = useState(initialEnlist.d)

  /* 입력 모드 */
  const [inputMode, setInputMode] = useState<'dropdown' | 'direct' | 'calendar'>('dropdown')
  const [directInput, setDirectInput] = useState('')
  const [directInvalid, setDirectInvalid] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(() => new Date(initialEnlist.y, initialEnlist.m - 1, 1))

  /* 입대일 Date 객체 */
  const enlistDate = useMemo(() => new Date(enlistY, enlistM - 1, enlistD), [enlistY, enlistM, enlistD])

  /* directInput과 dropdown 동기화 (mode 변경 시) */
  useEffect(() => {
    if (inputMode === 'direct') setDirectInput(fmtISO(enlistDate))
    if (inputMode === 'calendar') setCalMonth(new Date(enlistY, enlistM - 1, 1))
  }, [inputMode]) // eslint-disable-line react-hooks/exhaustive-deps

  /* 복무 형태 */
  const [serviceId, setServiceId] = useState('army')
  const [customMonths, setCustomMonths] = useState(18)

  /* 기준일 */
  const [refMode, setRefMode] = useState<'today' | 'custom'>('today')
  const [refY, setRefY] = useState(initialEnlist.y)
  const [refM, setRefM] = useState(initialEnlist.m)
  const [refD, setRefD] = useState(initialEnlist.d)

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 복무 개월 계산 ─── */
  const serviceMonths = serviceId === 'custom'
    ? clamp(customMonths, 1, 60)
    : (SERVICE_TYPES.find(s => s.id === serviceId)?.months ?? 18)
  const serviceLabel = serviceId === 'custom'
    ? `직접 입력 (${serviceMonths}개월)`
    : SERVICE_TYPES.find(s => s.id === serviceId)?.name ?? ''

  /* ─── 빠른 입대일 프리셋 ─── */
  const presets = useMemo(() => {
    if (!todayState) return []
    return [
      { id: 'today',  label: '오늘 입대',  date: todayState },
      { id: 'd-1',    label: '어제 입대',  date: addDays(todayState, -1) },
      { id: 'd-7',    label: '1주 전',     date: addDays(todayState, -7) },
      { id: 'd-30',   label: '1개월 전',   date: addDays(todayState, -30) },
      { id: 'd-90',   label: '3개월 전',   date: addDays(todayState, -90) },
      { id: 'd-180',  label: '6개월 전',   date: addDays(todayState, -180) },
      { id: 'd-365',  label: '1년 전',     date: addDays(todayState, -365) },
    ]
  }, [todayState])

  function applyEnlistDate(d: Date) {
    setEnlistY(d.getFullYear())
    setEnlistM(d.getMonth() + 1)
    setEnlistD(d.getDate())
    if (inputMode === 'direct') setDirectInput(fmtISO(d))
    if (inputMode === 'calendar') setCalMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    setDirectInvalid(false)
  }

  function activePresetId(): string | null {
    if (!todayState) return null
    const en = startOfDay(enlistDate)
    for (const p of presets) {
      if (diffDays(en, p.date) === 0) return p.id
    }
    return null
  }

  /* ─── 드롭다운 변경 핸들러 (월·년 변경 시 일 보정) ─── */
  const dimOf = daysInMonth(enlistY, enlistM)
  function setMonth(m: number) {
    setEnlistM(m)
    const dim = daysInMonth(enlistY, m)
    if (enlistD > dim) setEnlistD(dim)
  }
  function setYear(y: number) {
    setEnlistY(y)
    const dim = daysInMonth(y, enlistM)
    if (enlistD > dim) setEnlistD(dim)
  }

  /* ─── 직접 입력 ─── */
  function onDirectChange(s: string) {
    setDirectInput(s)
    const parsed = parseDirect(s)
    if (parsed) {
      setEnlistY(parsed.getFullYear())
      setEnlistM(parsed.getMonth() + 1)
      setEnlistD(parsed.getDate())
      setDirectInvalid(false)
    } else if (s.length >= 8) {
      setDirectInvalid(true)
    } else {
      setDirectInvalid(false)
    }
  }

  /* ─── 달력 ─── */
  const calCells = useMemo(() => {
    const y = calMonth.getFullYear(), m = calMonth.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const total = daysInMonth(y, m + 1)
    const cells: Array<{ d: number | null; date: Date | null }> = []
    for (let i = 0; i < firstDay; i++) cells.push({ d: null, date: null })
    for (let i = 1; i <= total; i++) cells.push({ d: i, date: new Date(y, m, i) })
    return cells
  }, [calMonth])

  /* ─── 기준일 ─── */
  const referenceDate = useMemo(() => {
    if (!todayState) return null
    if (refMode === 'today') return todayState
    return startOfDay(new Date(refY, refM - 1, refD))
  }, [refMode, refY, refM, refD, todayState])

  /* ─── 핵심 계산 ─── */
  const result = useMemo(() => {
    if (!referenceDate) return null
    const enlist = startOfDay(enlistDate)
    // 전역일 = 입대일 + 복무개월 - 1일
    const discharge = new Date(enlist)
    discharge.setMonth(discharge.getMonth() + serviceMonths)
    discharge.setDate(discharge.getDate() - 1)
    const dischargeStart = startOfDay(discharge)

    const totalDays = diffDays(dischargeStart, enlist) + 1  // 포함 일수
    const passedDays = clamp(diffDays(referenceDate, enlist), 0, totalDays)
    const remainingDays = clamp(diffDays(dischargeStart, referenceDate), 0, totalDays)
    const progress = totalDays > 0 ? (passedDays / totalDays) * 100 : 0

    const dayN = (n: number) => addDays(enlist, n)
    const ms = {
      enlist:       enlist,
      day100:       dayN(99),                              // 입대 100일 (포함)
      halfway:      dayN(Math.floor(totalDays / 2) - 1),
      threeQuarter: dayN(Math.floor(totalDays * 0.75) - 1),
      last100:      addDays(dischargeStart, -99),          // 전역 100일 전 (D-100 포함)
      last30:       addDays(dischargeStart, -29),
      discharge:    dischargeStart,
    }

    const reached = (d: Date) => diffDays(referenceDate, d) >= 0
    const daysUntil = (d: Date) => diffDays(d, referenceDate)

    /* 오늘 마일스톤 알림 (today === referenceDate일 때만) */
    let todayMilestone: { icon: string; text: string } | null = null
    if (todayState && diffDays(todayState, referenceDate) === 0) {
      if (diffDays(referenceDate, ms.day100) === 0)         todayMilestone = { icon: '🎉', text: '오늘은 입대 100일! 이병 → 일병 진급일이에요' }
      else if (diffDays(referenceDate, ms.halfway) === 0)   todayMilestone = { icon: '🎉', text: '오늘은 복무 절반 지점! 반환점 통과' }
      else if (diffDays(referenceDate, ms.last100) === 0)   todayMilestone = { icon: '🎉', text: '오늘부터 말년 (D-100)' }
      else if (diffDays(referenceDate, ms.last30) === 0)    todayMilestone = { icon: '🎉', text: '오늘부터 왕고 (D-30)' }
      else if (diffDays(referenceDate, ms.discharge) === 0) todayMilestone = { icon: '🎖️', text: '전역 축하합니다!' }
      else if (diffDays(referenceDate, ms.discharge) > 0)   todayMilestone = { icon: '🎖️', text: '이미 전역하셨네요. 수고하셨습니다' }
    }

    return {
      enlist, discharge: dischargeStart,
      totalDays, passedDays, remainingDays,
      progress,
      milestones: ms,
      reached: {
        day100:       reached(ms.day100),
        halfway:      reached(ms.halfway),
        threeQuarter: reached(ms.threeQuarter),
        last100:      reached(ms.last100),
        last30:       reached(ms.last30),
        discharge:    reached(ms.discharge),
      },
      countdown: {
        toDischarge: daysUntil(ms.discharge),
        toHalfway:   daysUntil(ms.halfway),
        toLast100:   daysUntil(ms.last100),
        toDay100:    daysUntil(ms.day100),
      },
      todayMilestone,
    }
  }, [enlistDate, serviceMonths, referenceDate, todayState])

  /* 게이지 SVG */
  const gauge = useMemo(() => {
    if (!result) return null
    const r = 96
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - result.progress / 100)
    return { r, circ, offset }
  }, [result])

  /* ─── 복사 ─── */
  function handleCopy() {
    if (!result) return
    const txt = [
      '🎖️ 군 복무 현황',
      `입대: ${fmtISO(result.enlist)} (${serviceLabel})`,
      `전역: ${fmtISO(result.discharge)} (D${result.countdown.toDischarge >= 0 ? '-' + result.countdown.toDischarge : '+' + Math.abs(result.countdown.toDischarge)})`,
      `복무율: ${result.progress.toFixed(1)}% · ${result.passedDays}/${result.totalDays}일`,
      'youtil.kr/tools/date/military',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* 년도 옵션 — 현재 ±1년, 과거 3년 */
  const currentYear = todayState?.getFullYear() ?? new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const arr: number[] = []
    for (let y = currentYear + 1; y >= currentYear - 4; y--) arr.push(y)
    return arr
  }, [currentYear])

  /* 첫 마운트 전(SSR) — 스켈레톤 */
  if (!todayState) {
    return <div className={styles.empty}>로딩 중…</div>
  }

  return (
    <div className={styles.wrap}>

      {/* ─── 빠른 프리셋 ─── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>빠른 입대일 선택</span>
          <span className={styles.cardLabelHint}>좌우로 스크롤</span>
        </div>
        <div className={styles.presetScroll}>
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              className={`${styles.presetBtn} ${activePresetId() === p.id ? styles.presetActive : ''}`}
              onClick={() => applyEnlistDate(p.date)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 입대일 입력 ─── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>입대일</span>
          <span className={styles.cardLabelHint}>{fmtKR(enlistDate)}</span>
        </div>

        <div className={styles.modeToggle}>
          <button type="button" className={`${styles.modeBtn} ${inputMode === 'dropdown' ? styles.modeActive : ''}`} onClick={() => setInputMode('dropdown')}>드롭다운</button>
          <button type="button" className={`${styles.modeBtn} ${inputMode === 'direct' ? styles.modeActive : ''}`}   onClick={() => setInputMode('direct')}>직접 입력</button>
          <button type="button" className={`${styles.modeBtn} ${inputMode === 'calendar' ? styles.modeActive : ''}`} onClick={() => setInputMode('calendar')}>달력</button>
        </div>

        {inputMode === 'dropdown' && (
          <div className={styles.dobRow}>
            <select className={styles.dobSelect} value={enlistY} onChange={e => setYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select className={styles.dobSelect} value={enlistM} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select className={styles.dobSelect} value={enlistD} onChange={e => setEnlistD(Number(e.target.value))}>
              {Array.from({ length: dimOf }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
        )}

        {inputMode === 'direct' && (
          <>
            <input
              className={`${styles.directInput} ${directInvalid ? styles.invalid : ''}`}
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD (예: 2026-01-15)"
              value={directInput}
              onChange={e => onDirectChange(e.target.value)}
            />
            {directInvalid && <p className={styles.validMsg}>⚠️ 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD 또는 YYYY.MM.DD)</p>}
          </>
        )}

        {inputMode === 'calendar' && (
          <>
            <button type="button" className={styles.calendarToggle} onClick={() => setCalOpen(true)}>
              📅 {fmtISO(enlistDate)} (클릭하여 선택)
            </button>

            {calOpen && (
              <div className={styles.modalBackdrop} onClick={() => setCalOpen(false)}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <div className={styles.modalNav}>
                      <button type="button" className={styles.modalNavBtn} onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}>‹</button>
                      <button type="button" className={styles.modalNavBtn} onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}>›</button>
                    </div>
                    <span className={styles.modalTitle}>{calMonth.getFullYear()}.{pad(calMonth.getMonth() + 1)}</span>
                    <button type="button" className={styles.modalClose} onClick={() => setCalOpen(false)} aria-label="닫기">✕</button>
                  </div>
                  <div className={styles.calGrid}>
                    {['일','월','화','수','목','금','토'].map(d => <div key={d} className={styles.calHead}>{d}</div>)}
                    {calCells.map((c, i) => {
                      if (c.d === null) return <div key={i} className={`${styles.calCell} ${styles.calCellEmpty}`} />
                      const isSelected = c.date && diffDays(startOfDay(c.date), startOfDay(enlistDate)) === 0
                      const isToday = c.date && diffDays(startOfDay(c.date), todayState) === 0
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`${styles.calCell} ${isSelected ? styles.calCellSelected : ''} ${isToday && !isSelected ? styles.calCellToday : ''}`}
                          onClick={() => { if (c.date) { applyEnlistDate(c.date); setCalOpen(false) } }}
                        >
                          {c.d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── 복무 형태 ─── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>복무 형태</span>
          <span className={styles.cardLabelHint}>2026년 병무청 기준</span>
        </div>

        {SERVICE_GROUPS.map(g => {
          const types = SERVICE_TYPES.filter(t => t.months === g.months)
          return (
            <div key={g.months} className={styles.serviceGroup}>
              <div className={styles.serviceGroupLabel}>
                <span>{g.label}</span>
                <small>{g.hint}</small>
              </div>
              <div className={styles.serviceRow}>
                {types.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.serviceBtn} ${styles[t.cls]} ${serviceId === t.id ? styles.serviceActive : ''}`}
                    onClick={() => setServiceId(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        <div className={styles.serviceGroup}>
          <div className={styles.serviceGroupLabel}>
            <span>⚙️ 직접 입력</span>
            <small>예외 사항·연장복무</small>
          </div>
          <div className={styles.serviceRow}>
            <button
              type="button"
              className={`${styles.serviceBtn} ${styles.svcCustom} ${serviceId === 'custom' ? styles.serviceActive : ''}`}
              onClick={() => setServiceId('custom')}
            >
              직접 입력 ({customMonths}개월)
            </button>
          </div>
          {serviceId === 'custom' && (
            <div className={styles.sliderRow}>
              <input
                className={styles.slider}
                type="range"
                min={1}
                max={60}
                step={1}
                value={customMonths}
                onChange={e => setCustomMonths(Number(e.target.value))}
              />
              <input
                className={styles.smallNum}
                type="number"
                min={1}
                max={60}
                value={customMonths}
                onChange={e => setCustomMonths(clamp(Number(e.target.value) || 1, 1, 60))}
              />
            </div>
          )}
        </div>

        <div className={styles.deprecatedNote}>
          ⓘ 의무경찰·의무소방·해양경찰 제도는 2023년 모두 폐지되었습니다.
          이전 복무자는 <strong style={{ color: 'var(--text)' }}>직접 입력</strong> 옵션을 사용하세요.
        </div>
      </div>

      {/* ─── 기준일 ─── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>기준일</span>
          <span className={styles.cardLabelHint}>휴가 복귀일·생일 기준 미리보기</span>
        </div>
        <div className={styles.refToggle}>
          <button type="button" className={`${styles.refBtn} ${refMode === 'today' ? styles.refActive : ''}`}  onClick={() => setRefMode('today')}>📅 오늘 기준</button>
          <button type="button" className={`${styles.refBtn} ${refMode === 'custom' ? styles.refActive : ''}`} onClick={() => { setRefMode('custom'); setRefY(currentYear); setRefM(todayState.getMonth() + 1); setRefD(todayState.getDate()) }}>🎯 특정 날짜</button>
        </div>
        {refMode === 'custom' && (
          <>
            <p className={styles.subLabel}>특정 기준일</p>
            <div className={styles.dobRow}>
              <select className={styles.dobSelect} value={refY} onChange={e => { const y = Number(e.target.value); setRefY(y); const dim = daysInMonth(y, refM); if (refD > dim) setRefD(dim) }}>
                {Array.from({ length: 6 }, (_, i) => currentYear + 1 - i).map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              <select className={styles.dobSelect} value={refM} onChange={e => { const m = Number(e.target.value); setRefM(m); const dim = daysInMonth(refY, m); if (refD > dim) setRefD(dim) }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
              </select>
              <select className={styles.dobSelect} value={refD} onChange={e => setRefD(Number(e.target.value))}>
                {Array.from({ length: daysInMonth(refY, refM) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ─── 결과 ─── */}
      {result && (
        <>
          {result.todayMilestone && (
            <div className={styles.todayBanner}>
              <span style={{ fontSize: 22 }}>{result.todayMilestone.icon}</span>
              <strong>{result.todayMilestone.text}</strong>
            </div>
          )}

          {/* 히어로 — 게이지 + 핵심 */}
          <div className={styles.heroWrap}>
            <div className={styles.gaugeSvgWrap}>
              <svg className={styles.gaugeSvg} viewBox="0 0 220 220" aria-hidden="true">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3EFF9B" />
                    <stop offset="100%" stopColor="#C8FF3E" />
                  </linearGradient>
                </defs>
                <circle cx="110" cy="110" r={gauge!.r} className={styles.gaugeBg} />
                <circle
                  cx="110"
                  cy="110"
                  r={gauge!.r}
                  className={styles.gaugeFg}
                  strokeDasharray={gauge!.circ}
                  strokeDashoffset={gauge!.offset}
                />
              </svg>
              <div className={styles.gaugeCenter}>
                <p className={styles.gaugeLabel}>전체 복무율</p>
                <p className={styles.gaugeValue}>
                  {result.progress >= 99.95 ? '100' : result.progress.toFixed(1)}
                  <span className={styles.gaugeUnit}>%</span>
                </p>
                <p className={styles.gaugeStatus}>
                  {result.countdown.toDischarge < 0
                    ? `전역 후 ${Math.abs(result.countdown.toDischarge)}일`
                    : result.passedDays === 0
                      ? '입대 전'
                      : `${result.passedDays}/${result.totalDays}일`}
                </p>
              </div>
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroInfoRow}>
                <span>입대일</span>
                <strong>{fmtKR(result.enlist)}</strong>
              </div>
              <div className={styles.heroInfoRow}>
                <span>전역일</span>
                <strong className={styles.dischargeAccent}>{fmtKR(result.discharge)}</strong>
              </div>
              <div className={styles.heroInfoRow}>
                <span>복무 형태</span>
                <strong>{serviceLabel} ({serviceMonths}개월)</strong>
              </div>
              <div className={styles.heroInfoRow}>
                <span>총 복무 일수</span>
                <strong>{result.totalDays.toLocaleString()}일</strong>
              </div>
              {refMode === 'custom' && referenceDate && (
                <div className={styles.heroInfoRow}>
                  <span>기준일</span>
                  <strong>{fmtKR(referenceDate)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* D-day 카드 4개 */}
          <div className={styles.dDayGrid}>
            <div className={styles.dDayCard}>
              <p className={styles.dDayLabel}>전역까지</p>
              <p className={`${styles.dDayValue} ${result.countdown.toDischarge < 0 ? styles.passed : result.countdown.toDischarge <= 100 ? styles.warn : ''}`}>
                {result.countdown.toDischarge < 0 ? '전역 완료' : `D-${result.countdown.toDischarge}`}
              </p>
              <p className={styles.dDaySub}>{fmtKR(result.discharge)}</p>
            </div>

            <div className={styles.dDayCard}>
              <p className={styles.dDayLabel}>절반까지</p>
              <p className={`${styles.dDayValue} ${result.reached.halfway ? styles.passed : ''}`}>
                {result.reached.halfway
                  ? '✅ 통과'
                  : `D-${result.countdown.toHalfway}`}
              </p>
              <p className={styles.dDaySub}>{fmtKR(result.milestones.halfway)}</p>
            </div>

            <div className={styles.dDayCard}>
              <p className={styles.dDayLabel}>말년 시작 (D-100)</p>
              <p className={`${styles.dDayValue} ${result.reached.last100 ? styles.danger : ''}`}>
                {result.reached.last100
                  ? '🔥 말년'
                  : `D-${result.countdown.toLast100}`}
              </p>
              <p className={styles.dDaySub}>{fmtKR(result.milestones.last100)}</p>
            </div>

            <div className={styles.dDayCard}>
              <p className={styles.dDayLabel}>입대 100일</p>
              <p className={`${styles.dDayValue} ${result.reached.day100 ? styles.passed : ''}`}>
                {result.reached.day100
                  ? `+${Math.abs(result.countdown.toDay100)}일`
                  : `D-${result.countdown.toDay100}`}
              </p>
              <p className={styles.dDaySub}>{fmtKR(result.milestones.day100)}</p>
            </div>
          </div>

          {/* 가로 진행 바 + 마커 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>복무 진행 바</span>
              <span className={styles.cardLabelHint}>주요 마일스톤 표시</span>
            </div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBarFill} style={{ width: `${result.progress}%` }} />
              {[10, 25, 50, 75, 90].map(p => (
                <div key={p} className={styles.progressBarMarker} style={{ left: `${p}%` }}>
                  <span className={styles.progressBarMarkerLabel}>{p}%</span>
                </div>
              ))}
              {/* 말년 시작 마커 (% 위치) */}
              {(() => {
                const last100Pct = ((result.totalDays - 100) / result.totalDays) * 100
                if (last100Pct > 0 && last100Pct < 100) {
                  return (
                    <div className={`${styles.progressBarMarker} ${styles.markerLast100}`} style={{ left: `${last100Pct}%` }}>
                      <span className={`${styles.progressBarMarkerLabel} ${styles.last100}`}>D-100</span>
                    </div>
                  )
                }
                return null
              })()}
              <div className={styles.progressBarCurrent} style={{ left: `${result.progress}%` }} title={`${result.progress.toFixed(1)}%`} />
            </div>
          </div>

          {/* 마일스톤 타임라인 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>복무 마일스톤</span>
              <span className={styles.cardLabelHint}>도달 시점 자동 표시</span>
            </div>
            <div className={styles.milestoneTimeline}>
              {[
                { key: 'enlist',       icon: '🎒', label: '입대일',                       sub: '신병교육 시작', date: result.milestones.enlist,       reached: true },
                { key: 'day100',       icon: '🥇', label: '입대 100일',                   sub: '이병 → 일병 진급', date: result.milestones.day100,    reached: result.reached.day100 },
                { key: 'halfway',      icon: '⏱️', label: '복무 50% (반환점)',           sub: '상병 진급 시점 근처', date: result.milestones.halfway, reached: result.reached.halfway },
                { key: 'threeQuarter', icon: '🎯', label: '복무 75%',                     sub: '병장 진급 시점',     date: result.milestones.threeQuarter, reached: result.reached.threeQuarter },
                { key: 'last100',      icon: '🔥', label: '전역 D-100 (말년 시작)',       sub: '복무 90% 통과',     date: result.milestones.last100,  reached: result.reached.last100 },
                { key: 'last30',       icon: '👑', label: '전역 D-30 (왕고)',             sub: '말년 후반',          date: result.milestones.last30,   reached: result.reached.last30 },
                { key: 'discharge',    icon: '🎖️', label: '전역일',                       sub: '수고하셨습니다',     date: result.milestones.discharge, reached: result.reached.discharge },
              ].map(m => {
                const isToday = todayState && diffDays(todayState, m.date) === 0
                return (
                  <div key={m.key} className={`${styles.milestoneItem} ${m.reached ? styles.milestoneReached : ''} ${isToday ? styles.milestoneToday : ''}`}>
                    <span className={`${styles.milestoneIcon} ${m.reached ? styles.reached : styles.muted}`}>{isToday ? '🎉' : m.icon}</span>
                    <span className={styles.milestoneTitle}>
                      {m.label}
                      <small>{m.sub}</small>
                    </span>
                    <span className={styles.milestoneDate}>{fmtISO(m.date)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 복무 형태 정보 */}
          <div className={styles.serviceInfoCard}>
            ⓘ 선택한 복무 형태 — <strong>{serviceLabel}</strong> ({serviceMonths}개월 / 약 {result.totalDays}일).
            포상휴가·징계·병가 등에 따라 실제 전역일은 본 계산 결과와 다를 수 있으며,
            정확한 전역일은 소속 부대 또는 병무청에 확인하세요.
          </div>

          <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
          </button>
        </>
      )}
    </div>
  )
}
