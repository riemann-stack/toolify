'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './timezone.module.css'
import {
  CITIES, DEFAULT_SELECTED, City,
  partsInZone, offsetMinutes, formatOffset, isDSTActive, observesDST,
  zonedTimeToUtc, dateOffsetLabel, classifyHour, BUCKET_LABEL,
  findMeetingSlots, diffLabel,
} from './timezoneData'

const STORAGE_KEY = 'tz-converter-v1'

function pad(n: number) { return String(n).padStart(2, '0') }

function formatLocalInput(d: Date, timeZone: string): string {
  const p = partsInZone(d, timeZone)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

function formatTime24(p: { hour: number, minute: number }) {
  return `${pad(p.hour)}:${pad(p.minute)}`
}
function formatTime12(p: { hour: number, minute: number }) {
  const ampm = p.hour < 12 ? 'AM' : 'PM'
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12
  return `${h12}:${pad(p.minute)} ${ampm}`
}

const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토']

export default function TimezoneClient() {
  // 기준 시각/도시
  const [baseId, setBaseId] = useState<string>('seoul')
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [liveNow, setLiveNow] = useState(true)
  const [baseInput, setBaseInput] = useState<string>(() => formatLocalInput(new Date(), 'Asia/Seoul'))
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [workStart, setWorkStart] = useState(9)
  const [workEnd, setWorkEnd] = useState(18)
  const [copyOk, setCopyOk] = useState(false)
  const initRef = useRef(false)

  // 로컬스토리지 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.baseId && CITIES.find(c => c.id === data.baseId)) setBaseId(data.baseId)
        if (Array.isArray(data.selected) && data.selected.length > 0) {
          const valid = data.selected.filter((id: string) => CITIES.find(c => c.id === id))
          if (valid.length > 0) setSelected(valid)
        }
        if (typeof data.workStart === 'number') setWorkStart(data.workStart)
        if (typeof data.workEnd === 'number') setWorkEnd(data.workEnd)
      }
    } catch { /* noop */ }
    initRef.current = true
  }, [])

  // 저장
  useEffect(() => {
    if (!initRef.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseId, selected, workStart, workEnd }))
    } catch { /* noop */ }
  }, [baseId, selected, workStart, workEnd])

  // 라이브 모드 → 매 30초 갱신
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!liveNow) return
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [liveNow])

  // 기준 도시
  const baseCity: City = CITIES.find(c => c.id === baseId) ?? CITIES[0]

  // 라이브 모드일 땐 기준 시각도 'now'
  const baseUtc: Date = useMemo(() => {
    if (liveNow) return new Date()
    // baseInput("YYYY-MM-DDTHH:MM")을 baseCity 기준으로 UTC 환산
    const m = baseInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (!m) return new Date()
    return zonedTimeToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], baseCity.timeZone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveNow, baseInput, baseCity.timeZone, tick])

  // 라이브 모드일 때 baseInput을 매번 동기화
  useEffect(() => {
    if (liveNow) {
      setBaseInput(formatLocalInput(new Date(), baseCity.timeZone))
    }
  }, [liveNow, baseCity.timeZone, tick])

  // 기준 도시가 바뀌면 baseInput을 새 도시 기준으로 재계산
  function changeBase(newId: string) {
    const c = CITIES.find(cc => cc.id === newId)
    if (!c) return
    if (!liveNow) {
      const m = baseInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
      if (m) {
        const utc = zonedTimeToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], baseCity.timeZone)
        setBaseInput(formatLocalInput(utc, c.timeZone))
      }
    }
    setBaseId(newId)
  }

  // 선택된 도시들 (중복 제거하고 기준 도시 제외)
  const otherIds = selected.filter(id => id !== baseId)
  const orderedIds = [baseId, ...otherIds]

  const basePartsForOffset = partsInZone(baseUtc, baseCity.timeZone)

  function removeCity(id: string) {
    if (id === baseId) return  // 기준 도시는 제거 불가 (변경만)
    setSelected(prev => prev.filter(x => x !== id))
  }
  function addCity(id: string) {
    setSelected(prev => prev.includes(id) ? prev : [...prev, id])
  }

  // ── 회의 슬롯: 기준 도시 기준 그 날짜의 00:00을 시작점으로
  const baseDayStart: Date = useMemo(() => {
    const p = partsInZone(baseUtc, baseCity.timeZone)
    return zonedTimeToUtc(p.year, p.month, p.day, 0, 0, baseCity.timeZone)
  }, [baseUtc, baseCity.timeZone])

  const meetingTimeZones = useMemo(() => orderedIds.map(id => CITIES.find(c => c.id === id)?.timeZone).filter(Boolean) as string[], [orderedIds])

  const slots = useMemo(
    () => findMeetingSlots(baseDayStart, meetingTimeZones, workStart, workEnd),
    [baseDayStart, meetingTimeZones, workStart, workEnd],
  )

  // 베스트 슬롯 후보 (green/yellow 중 정수 시각만, 인접한 슬롯 합치기)
  const bestSlots = useMemo(() => {
    type Run = { startIdx: number, endIdx: number, quality: 'green' | 'yellow' }
    const runs: Run[] = []
    let cur: Run | null = null
    slots.forEach((s, idx) => {
      if (s.quality === 'green' || s.quality === 'yellow') {
        if (cur && cur.quality === s.quality) {
          cur.endIdx = idx
        } else {
          if (cur) runs.push(cur)
          cur = { startIdx: idx, endIdx: idx, quality: s.quality }
        }
      } else {
        if (cur) runs.push(cur)
        cur = null
      }
    })
    if (cur) runs.push(cur)
    // green > yellow 정렬, 그리고 길이 긴 것 우선
    runs.sort((a, b) => {
      if (a.quality !== b.quality) return a.quality === 'green' ? -1 : 1
      return (b.endIdx - b.startIdx) - (a.endIdx - a.startIdx)
    })
    return runs.slice(0, 3)
  }, [slots])

  // 도시 추가용 검색
  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CITIES.filter(c => {
      if (!q) return true
      return (
        c.city.toLowerCase().includes(q) ||
        c.cityEn.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.abbr.toLowerCase().includes(q) ||
        c.timeZone.toLowerCase().includes(q)
      )
    })
  }, [search])

  // 공유 텍스트
  function shareText(): string {
    const lines: string[] = []
    lines.push(`📅 시간대 비교`)
    orderedIds.forEach(id => {
      const c = CITIES.find(cc => cc.id === id)
      if (!c) return
      const p = partsInZone(baseUtc, c.timeZone)
      const dateOff = dateOffsetLabel(basePartsForOffset.year, basePartsForOffset.month, basePartsForOffset.day, p.year, p.month, p.day)
      lines.push(`${c.flag} ${c.city} ${formatTime24(p)} ${dateOff ? `(${dateOff})` : ''}`.trim())
    })
    return lines.join('\n')
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText())
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <div className={styles.wrap}>

      {/* ── 기준 시각 입력 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>기준 시각</span>
          <span className={styles.cardHint}>도시별로 자동 변환됩니다</span>
        </div>
        <div className={styles.baseRow}>
          <input
            type="datetime-local"
            className={styles.dtInput}
            value={baseInput}
            onChange={e => { setBaseInput(e.target.value); setLiveNow(false) }}
            disabled={liveNow}
          />
          <select
            className={styles.baseSelect}
            value={baseId}
            onChange={e => changeBase(e.target.value)}
            aria-label="기준 도시"
          >
            {CITIES.map(c => (
              <option key={c.id} value={c.id}>{c.flag} {c.city} ({c.abbr})</option>
            ))}
          </select>
          <button
            className={`${styles.nowBtn} ${liveNow ? styles.nowBtnLive : ''}`}
            onClick={() => setLiveNow(v => !v)}
          >
            {liveNow ? '● LIVE' : '지금'}
          </button>
        </div>
      </div>

      {/* ── 도시별 변환 결과 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>도시별 시각</span>
          <span className={styles.cardHint}>{orderedIds.length}개 표시</span>
        </div>
        <div className={styles.resultGrid}>
          {orderedIds.map(id => {
            const c = CITIES.find(cc => cc.id === id)
            if (!c) return null
            const p = partsInZone(baseUtc, c.timeZone)
            const dateOff = dateOffsetLabel(basePartsForOffset.year, basePartsForOffset.month, basePartsForOffset.day, p.year, p.month, p.day)
            const off = offsetMinutes(baseUtc, c.timeZone)
            const dst = observesDST(c.timeZone) && isDSTActive(baseUtc, c.timeZone)
            const bucket = classifyHour(p.hour)
            const isBase = id === baseId
            const bucketCls = styles[`resCardBucket${bucket.charAt(0).toUpperCase() + bucket.slice(1)}` as keyof typeof styles] || ''
            return (
              <div key={id} className={`${styles.resCard} ${isBase ? styles.resCardBase : ''} ${bucketCls}`}>
                <div className={styles.resHead}>
                  <div className={styles.resCity}>
                    <span className={styles.resFlag}>{c.flag}</span>
                    <span>{c.city}</span>
                  </div>
                  {!isBase && (
                    <button className={styles.resRemove} onClick={() => removeCity(id)} aria-label="제거">✕</button>
                  )}
                </div>
                <div className={styles.resTime}>{formatTime24(p)}</div>
                <div className={styles.resDate}>
                  {p.month}월 {p.day}일 ({WEEKDAY_KR[p.weekday]}) · {formatTime12(p)}
                  {dateOff && (
                    <span className={`${styles.resDateOffset} ${dateOff.startsWith('+') ? styles.resDateOffsetPlus : ''}`}>
                      {dateOff}
                    </span>
                  )}
                </div>
                <div className={styles.resMeta}>
                  <span className={styles.resAbbr}>{c.abbr}</span>
                  <span>UTC{formatOffset(off)}</span>
                  {dst && <span className={styles.resDst}>DST</span>}
                  {!isBase && <span className={styles.resBucket}>· {diffLabel(offsetMinutes(baseUtc, baseCity.timeZone), off)}</span>}
                  <span className={styles.resBucket}>· {BUCKET_LABEL[bucket]}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={styles.shareBtn} onClick={() => setShowAdd(v => !v)}>
            {showAdd ? '도시 목록 닫기' : '＋ 도시 추가'}
          </button>
          <button className={styles.shareBtn} onClick={copyShare}>
            {copyOk ? '✓ 복사됨' : '📋 텍스트 복사'}
          </button>
        </div>

        {showAdd && (
          <div className={styles.addRow} style={{ marginTop: 10 }}>
            <input
              className={styles.addInput}
              placeholder="도시·국가·약어 검색 (예: 뉴욕, paris, EST, KST)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.cityGrid}>
              {filteredCities.map(c => {
                const isSel = selected.includes(c.id)
                const off = offsetMinutes(baseUtc, c.timeZone)
                return (
                  <button
                    key={c.id}
                    className={styles.cityChip}
                    disabled={isSel}
                    onClick={() => addCity(c.id)}
                  >
                    <span className={styles.cityChipFlag}>{c.flag}</span>
                    <span className={styles.cityChipName}>{c.city}</span>
                    <span className={styles.cityChipOff}>UTC{formatOffset(off)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 회의 슬롯 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>회의 슬롯 추천</span>
          <span className={styles.cardHint}>모든 도시의 근무시간이 겹치는 시간대</span>
        </div>

        <div className={styles.slotHead}>
          <div className={styles.slotLegend}><span className={`${styles.slotDot} ${styles.slotDotGreen}`}/>전원 근무시간</div>
          <div className={styles.slotLegend}><span className={`${styles.slotDot} ${styles.slotDotYellow}`}/>일부 ±2시간</div>
          <div className={styles.slotLegend}><span className={`${styles.slotDot} ${styles.slotDotRed}`}/>불가</div>
          <div className={styles.workInputs}>
            <span>근무시간</span>
            <select value={workStart} onChange={e => setWorkStart(parseInt(e.target.value))}>
              {Array.from({ length: 13 }).map((_, i) => <option key={i} value={i + 6}>{i + 6}:00</option>)}
            </select>
            <span>~</span>
            <select value={workEnd} onChange={e => setWorkEnd(parseInt(e.target.value))}>
              {Array.from({ length: 13 }).map((_, i) => <option key={i} value={i + 12}>{i + 12}:00</option>)}
            </select>
          </div>
        </div>

        {/* 도시별 24시간 바 */}
        <div className={styles.cityBars}>
          {orderedIds.map(id => {
            const c = CITIES.find(cc => cc.id === id)
            if (!c) return null
            return (
              <div key={id} className={styles.cityBar}>
                <div className={styles.cityBarLabel}>
                  <span>{c.flag}</span>
                  <span>{c.city}</span>
                </div>
                <div className={styles.barTrack}>
                  {slots.map((s, i) => {
                    const p = partsInZone(s.utcDate, c.timeZone)
                    const bucket = classifyHour(p.hour)
                    const bucketCls = styles[`barCell${bucket.charAt(0).toUpperCase() + bucket.slice(1)}` as keyof typeof styles] || ''
                    // 기준 시각 마커: baseUtc와 가장 가까운 슬롯
                    const slotMs = s.utcDate.getTime()
                    const baseMs = baseUtc.getTime()
                    const isMarker = Math.abs(slotMs - baseMs) < 7.5 * 60000
                    return <div key={i} className={`${styles.barCell} ${bucketCls} ${isMarker ? styles.barCellMarker : ''}`} />
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 시간 눈금 (기준 도시) */}
        <div className={styles.hourScale}>
          <div className={styles.cityBarLabel}><small>{baseCity.city} 기준</small></div>
          <div className={styles.hourScaleLabels}>
            {Array.from({ length: 24 }).map((_, i) => <span key={i}>{i}</span>)}
          </div>
        </div>

        {/* 베스트 슬롯 */}
        <div className={styles.bestSlots}>
          {bestSlots.length === 0 ? (
            <div className={styles.noSlots}>
              선택한 도시들의 근무시간이 겹치는 슬롯이 없습니다.<br/>
              근무 시간 폭을 늘리거나 도시를 줄여보세요.
            </div>
          ) : (
            bestSlots.map((run, i) => {
              const startSlot = slots[run.startIdx]
              const endSlot = slots[run.endIdx]
              const startP = partsInZone(startSlot.utcDate, baseCity.timeZone)
              const endP = partsInZone(new Date(endSlot.utcDate.getTime() + 15 * 60000), baseCity.timeZone)
              const lenMin = (run.endIdx - run.startIdx + 1) * 15
              const cls = run.quality === 'green' ? styles.bestSlotGreen : styles.bestSlotYellow
              return (
                <div key={i} className={`${styles.bestSlot} ${cls}`}>
                  <span className={styles.bestSlotRank}>#{i + 1}</span>
                  <div className={styles.bestSlotTime}>
                    {baseCity.city} 기준 <b>{formatTime24(startP)} ~ {formatTime24(endP)}</b>
                    {' · '}{lenMin >= 60 ? `${Math.floor(lenMin/60)}시간 ${lenMin%60 ? lenMin%60+'분':''}` : `${lenMin}분`}
                  </div>
                  <div className={styles.bestSlotMeta}>{run.quality === 'green' ? '🟢' : '🟡'}</div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
