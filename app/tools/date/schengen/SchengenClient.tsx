'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './schengen.module.css'

/* ─────────────────────────────────────────────────────────
 * 쉥겐 90/180 규칙
 *  - 임의의 날 기준 직전 180일(롤링) 동안 최대 90일 체류
 *  - 입국일·출국일 모두 '체류 1일'로 계산 (몇 시간이어도 하루)
 * ───────────────────────────────────────────────────────── */
const MS_DAY = 86_400_000
const WINDOW = 180
const LIMIT = 90
const WD = ['일', '월', '화', '수', '목', '금', '토']

const STORAGE_KEY = 'youtil_schengen_v1'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** ISO(YYYY-MM-DD) → UTC 자정 기준 정수 일 번호 */
function isoToDay(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const n = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / MS_DAY
  return Number.isFinite(n) ? n : null
}
function dayToISO(n: number): string {
  const d = new Date(n * MS_DAY)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
function dayToKr(n: number): string {
  const d = new Date(n * MS_DAY)
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WD[d.getUTCDay()]})`
}

/** 구간들의 [ws, we] 윈도우 내 '체류 일수' (중복 제거 후 합산) */
function countDays(intervals: [number, number][], ws: number, we: number): number {
  const clipped = intervals
    .map(([a, b]) => [Math.max(a, ws), Math.min(b, we)] as [number, number])
    .filter(([lo, hi]) => hi >= lo)
    .sort((a, b) => a[0] - b[0])
  if (clipped.length === 0) return 0
  let total = 0
  let [curLo, curHi] = clipped[0]
  for (let i = 1; i < clipped.length; i++) {
    const [lo, hi] = clipped[i]
    if (lo <= curHi + 1) curHi = Math.max(curHi, hi) // 인접·중복 병합
    else { total += curHi - curLo + 1; curLo = lo; curHi = hi }
  }
  total += curHi - curLo + 1
  return total
}

type Stay = { id: number; entry: string; exit: string }

export default function SchengenClient() {
  const [refDate, setRefDate] = useState('')
  const [stays, setStays] = useState<Stay[]>([{ id: 1, entry: '', exit: '' }])
  const [nextId, setNextId] = useState(2)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState(false)

  /* localStorage 복원 + 기준일 오늘로 (하이드레이션 안전) */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let savedRef = ''
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        if (Array.isArray(j.stays) && j.stays.length > 0) {
          const cleaned: Stay[] = j.stays
            .filter((x: unknown): x is Stay => !!x && typeof (x as Stay).id === 'number')
            .map((x: Stay) => ({ id: x.id, entry: String(x.entry ?? ''), exit: String(x.exit ?? '') }))
          if (cleaned.length > 0) {
            setStays(cleaned)
            setNextId(Math.max(...cleaned.map((x) => x.id)) + 1)
          }
        }
        if (typeof j.refDate === 'string') savedRef = j.refDate
      }
    } catch {}
    setRefDate(savedRef || todayISO())
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ stays, refDate })) } catch {}
  }, [stays, refDate, hydrated])

  function addStay() {
    setStays((prev) => [...prev, { id: nextId, entry: '', exit: '' }])
    setNextId((n) => n + 1)
  }
  function removeStay(id: number) {
    setStays((prev) => (prev.length > 1 ? prev.filter((st) => st.id !== id) : prev))
  }
  function updateStay(id: number, field: 'entry' | 'exit', value: string) {
    setStays((prev) => prev.map((st) => (st.id === id ? { ...st, [field]: value } : st)))
  }

  const calc = useMemo(() => {
    const refDay = isoToDay(refDate)
    if (refDay === null) return null

    const intervals: [number, number][] = []
    let invalid = 0
    for (const st of stays) {
      const a = isoToDay(st.entry)
      const b = isoToDay(st.exit)
      if (a === null || b === null) { if (st.entry || st.exit) invalid++; continue }
      if (b < a) { invalid++; continue }
      intervals.push([a, b])
    }

    const winStart = refDay - (WINDOW - 1)
    const used = countDays(intervals, winStart, refDay)
    const remaining = LIMIT - used

    /* 기준일에 입국 시 연속으로 머물 수 있는 최대 일수 */
    let lastDay = refDay - 1
    for (let d = refDay; d <= refDay + 200; d++) {
      const total = countDays([...intervals, [refDay, d]], d - (WINDOW - 1), d)
      if (total <= LIMIT) lastDay = d
      else break
    }
    const consecutive = lastDay >= refDay ? lastDay - refDay + 1 : 0

    /* 1일 이상 체류 가능한 가장 이른 입국일 */
    let nextEntry: number | null = null
    for (let d = refDay; d <= refDay + 366; d++) {
      const total = countDays([...intervals, [d, d]], d - (WINDOW - 1), d)
      if (total <= LIMIT) { nextEntry = d; break }
    }

    return { refDay, winStart, used, remaining, consecutive, lastDay, nextEntry, invalid, count: intervals.length }
  }, [refDate, stays])

  function handleCopy() {
    if (!calc) return
    const txt = [
      '── 쉥겐 90/180 체류일 ──',
      `기준일: ${dayToKr(calc.refDay)}`,
      `최근 180일(${dayToISO(calc.winStart)}~${dayToISO(calc.refDay)}) 중 ${calc.used}/90일 사용 · 잔여 ${Math.max(0, calc.remaining)}일`,
      calc.consecutive > 0
        ? `기준일 입국 시 최대 ${calc.consecutive}일 연속 체류 (마지막 체류일 ${dayToISO(calc.lastDay)})`
        : '기준일에는 입국 불가 (90일 소진)',
      calc.nextEntry !== null ? `다음 입국 가능일: ${dayToISO(calc.nextEntry)}` : '향후 1년 내 입국 가능일 없음',
      'youtil.kr/tools/date/schengen',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const usedPct = calc ? Math.min(100, (calc.used / LIMIT) * 100) : 0
  const over = calc ? calc.remaining < 0 : false
  const remainColor = !calc ? 'var(--text)' : over ? '#DC2626' : calc.remaining <= 10 ? '#EA580C' : calc.remaining <= 30 ? '#CA8A04' : '#059669'

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/timezone', label: '시간대 변환' },
          { href: '/tools/date/jet-lag', label: '시차 적응' },
          { href: '/tools/life/customs', label: '면세 한도' },
        ]}
      >
        쉥겐 회원국·규정은 변경될 수 있으며, 장기비자·거주허가 보유 시 별도 규칙이 적용됩니다. <strong>최종 입·출국 허가는 현지 입국심사관의 재량</strong>이며 본 계산은 참고용입니다.
      </Disclaimer>

      {/* 기준일 */}
      <div className={s.card}>
        <span className={s.cardLabel}>기준일</span>
        <div className={s.refRow}>
          <input
            className={s.input}
            type="date"
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
          />
          <button type="button" className={s.todayBtn} onClick={() => setRefDate(todayISO())}>오늘</button>
        </div>
        <p className={s.hintText}>이 날짜 기준 직전 180일을 계산합니다. 미래 여행 계획 시 <strong>입국 예정일</strong>로 바꿔보세요.</p>
      </div>

      {/* 출입국 기록 */}
      <div className={s.card}>
        <span className={s.cardLabel}>출입국 기록 (쉥겐 입·출국)</span>
        <div className={s.stayList}>
          {stays.map((st) => {
            const a = isoToDay(st.entry)
            const b = isoToDay(st.exit)
            const dur = a !== null && b !== null && b >= a ? b - a + 1 : null
            const bad = (st.entry !== '' && a === null) || (st.exit !== '' && b === null) || (a !== null && b !== null && b < a)
            return (
              <div key={st.id} className={s.stayRow}>
                <div className={s.stayFields}>
                  <div className={s.stayField}>
                    <label className={s.fieldLabel}>입국일</label>
                    <input className={s.input} type="date" value={st.entry} onChange={(e) => updateStay(st.id, 'entry', e.target.value)} />
                  </div>
                  <div className={s.stayField}>
                    <label className={s.fieldLabel}>출국일</label>
                    <input className={s.input} type="date" value={st.exit} onChange={(e) => updateStay(st.id, 'exit', e.target.value)} />
                  </div>
                </div>
                <div className={s.staySide}>
                  <span className={`${s.durBadge} ${bad ? s.durBad : ''}`}>
                    {bad ? '날짜 오류' : dur !== null ? `${dur}일` : '—'}
                  </span>
                  <button
                    type="button"
                    className={s.removeBtn}
                    onClick={() => removeStay(st.id)}
                    disabled={stays.length <= 1}
                    aria-label="기록 삭제"
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
        <button type="button" className={s.addBtn} onClick={addStay}>＋ 기록 추가</button>
      </div>

      {/* 결과 */}
      {calc && (
        <>
          <div className={s.hero}>
            <p className={s.heroLead}>최근 180일 잔여 체류 가능일</p>
            <div className={s.heroValue} style={{ color: remainColor }}>
              {over ? 0 : calc.remaining}<span className={s.heroUnit}>일</span>
            </div>
            <p className={s.heroSub}>
              {dayToISO(calc.winStart)} ~ {dayToISO(calc.refDay)} 중 <strong>{calc.used} / 90일</strong> 사용
            </p>
            <div className={s.usageBar}>
              <div className={s.usageFill} style={{ width: `${usedPct}%`, background: remainColor }} />
            </div>
            {over && (
              <p className={s.overWarn}>⚠️ 이미 90일을 <strong>{-calc.remaining}일 초과</strong>했습니다. 초과 체류는 입국금지·벌금 대상이 될 수 있습니다.</p>
            )}
            {calc.invalid > 0 && (
              <p className={s.invalidNote}>※ 날짜가 비었거나 잘못된 기록 {calc.invalid}건은 계산에서 제외했습니다.</p>
            )}
          </div>

          <div className={s.statGrid}>
            <div className={s.statCard}>
              <div className={s.statLabel}>기준일 입국 시 연속 체류</div>
              {calc.consecutive > 0 ? (
                <>
                  <div className={s.statValue}>{calc.consecutive}일</div>
                  <div className={s.statSub}>마지막 체류 가능일<br /><strong>{dayToKr(calc.lastDay)}</strong></div>
                </>
              ) : (
                <>
                  <div className={s.statValue} style={{ color: '#DC2626' }}>입국 불가</div>
                  <div className={s.statSub}>이 날짜엔 90일이 소진된 상태</div>
                </>
              )}
            </div>
            <div className={s.statCard}>
              <div className={s.statLabel}>다음 입국 가능일</div>
              {calc.nextEntry !== null ? (
                calc.nextEntry === calc.refDay ? (
                  <>
                    <div className={s.statValue} style={{ color: '#059669' }}>오늘 가능</div>
                    <div className={s.statSub}>기준일에 바로 입국할 수 있습니다</div>
                  </>
                ) : (
                  <>
                    <div className={s.statValue} style={{ fontSize: 18 }}>{dayToISO(calc.nextEntry)}</div>
                    <div className={s.statSub}>{dayToKr(calc.nextEntry)}<br />부터 1일 이상 체류 가능</div>
                  </>
                )
              ) : (
                <>
                  <div className={s.statValue} style={{ fontSize: 16 }}>1년 내 없음</div>
                  <div className={s.statSub}>기록을 확인해 주세요</div>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`${s.copyBtn} ${copied ? s.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
          </button>

          <p className={s.note}>
            🔒 입력한 출입국 날짜는 <strong>이 브라우저에만 저장</strong>되며 서버로 전송되지 않습니다. 입국일·출국일은 각각 체류 1일로 계산합니다.
          </p>
        </>
      )}
    </div>
  )
}
