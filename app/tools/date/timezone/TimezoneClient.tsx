'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './timezone.module.css'
import {
  CITIES, DEFAULT_SELECTED, City,
  partsInZone, offsetMinutes, formatOffset, isDSTActive,
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
  // 초기값은 빈 문자열 — SSG 빌드 시각이 HTML에 박혀 하이드레이션 불일치·묵은 시계 노출되는 것 방지 (마운트 후 채움)
  const [baseInput, setBaseInput] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [workStart, setWorkStart] = useState(9)
  const [workEnd, setWorkEnd] = useState(18)
  const [copyOk, setCopyOk] = useState(false)
  const [mounted, setMounted] = useState(false)
  const initRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

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
        // select 옵션 범위(시작 6~18·종료 12~24) 밖 값이 저장돼 있으면 무시 — 범위 밖이면 controlled select가 빈 표시가 됨
        if (typeof data.workStart === 'number' && Number.isInteger(data.workStart) && data.workStart >= 6 && data.workStart <= 18) setWorkStart(data.workStart)
        if (typeof data.workEnd === 'number' && Number.isInteger(data.workEnd) && data.workEnd >= 12 && data.workEnd <= 24) setWorkEnd(data.workEnd)
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
      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/jet-lag', label: '시차 계산기' },
          { href: '/tools/date/server-time', label: '실시간 서버 시간' },
          { href: '/tools/date/age', label: '나이 계산기' },
        ]}
      >
        표준시·오프셋은 IANA 시간대 데이터 기준입니다. <strong>서머타임(DST) 전환 시점·국가별 제도 변경</strong>에 따라 실제와 달라질 수 있으니 중요한 일정은 현지 공식 시각을 함께 확인하세요.
      </Disclaimer>

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
            aria-label="기준 시각"
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
            type="button"
            className={`${styles.nowBtn} ${liveNow ? styles.nowBtnLive : ''}`}
            aria-pressed={liveNow}
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
            // 마운트 전엔 시각 의존 값을 렌더하지 않음 — SSG HTML에 빌드 시각이 박히는 것 방지
            const p = mounted ? partsInZone(baseUtc, c.timeZone) : null
            const dateOff = p ? dateOffsetLabel(basePartsForOffset.year, basePartsForOffset.month, basePartsForOffset.day, p.year, p.month, p.day) : ''
            const dst = mounted && isDSTActive(baseUtc, c.timeZone)
            const bucket = p ? classifyHour(p.hour) : null
            const isBase = id === baseId
            const bucketCls = bucket ? (styles[`resCardBucket${bucket.charAt(0).toUpperCase() + bucket.slice(1)}` as keyof typeof styles] || '') : ''
            return (
              <div key={id} className={`${styles.resCard} ${isBase ? styles.resCardBase : ''} ${bucketCls}`}>
                <div className={styles.resHead}>
                  <div className={styles.resCity}>
                    <span className={styles.resFlag}>{c.flag}</span>
                    <span>{c.city}</span>
                  </div>
                  {!isBase && (
                    <button type="button" className={styles.resRemove} onClick={() => removeCity(id)} aria-label={`${c.city} 제거`}>✕</button>
                  )}
                </div>
                <div className={styles.resTime}>{p ? formatTime24(p) : '--:--'}</div>
                <div className={styles.resDate}>
                  {p ? <>{p.month}월 {p.day}일 ({WEEKDAY_KR[p.weekday]}) · {formatTime12(p)}</> : ' '}
                  {dateOff && (
                    <span className={`${styles.resDateOffset} ${dateOff.startsWith('+') ? styles.resDateOffsetPlus : ''}`}>
                      {dateOff}
                    </span>
                  )}
                </div>
                <div className={styles.resMeta}>
                  <span className={styles.resAbbr}>{dst && c.dstAbbr ? c.dstAbbr : c.abbr}</span>
                  <span>UTC{p ? formatOffset(offsetMinutes(baseUtc, c.timeZone)) : c.offsetLabel}</span>
                  {dst && <span className={styles.resDst}>DST</span>}
                  {p && !isBase && <span className={styles.resBucket}>· {diffLabel(offsetMinutes(baseUtc, baseCity.timeZone), offsetMinutes(baseUtc, c.timeZone))}</span>}
                  {bucket && <span className={styles.resBucket}>· {BUCKET_LABEL[bucket]}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.shareRow} style={{ marginTop: 12 }}>
          <button type="button" className={styles.shareBtn} aria-expanded={showAdd} onClick={() => setShowAdd(v => !v)}>
            {showAdd ? '도시 목록 닫기' : '＋ 도시 추가'}
          </button>
          <button type="button" className={styles.shareBtn} onClick={copyShare}>
            {copyOk ? '✓ 복사됨' : '텍스트 복사'}
          </button>
        </div>

        {showAdd && (
          <div className={styles.addRow} style={{ marginTop: 10 }}>
            <input
              className={styles.addInput}
              placeholder="도시·국가·약어 검색 (예: 뉴욕, paris, EST, KST)"
              aria-label="도시 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.cityGrid}>
              {filteredCities.map(c => {
                const isSel = selected.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.cityChip}
                    disabled={isSel}
                    onClick={() => addCity(c.id)}
                  >
                    <span className={styles.cityChipFlag}>{c.flag}</span>
                    <span className={styles.cityChipName}>{c.city}</span>
                    <span className={styles.cityChipOff}>UTC{mounted ? formatOffset(offsetMinutes(baseUtc, c.timeZone)) : c.offsetLabel}</span>
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
          <div className={styles.slotLegend}><span className={`${styles.slotDot} ${styles.slotDotYellow}`}/>확장 허용 (시작−1h·종료+2h)</div>
          <div className={styles.slotLegend}><span className={`${styles.slotDot} ${styles.slotDotRed}`}/>불가</div>
          <div className={styles.workInputs}>
            <span>근무시간</span>
            <select value={workStart} onChange={e => setWorkStart(parseInt(e.target.value))} aria-label="근무 시작 시각">
              {Array.from({ length: 13 }).map((_, i) => <option key={i} value={i + 6}>{i + 6}:00</option>)}
            </select>
            <span>~</span>
            <select value={workEnd} onChange={e => setWorkEnd(parseInt(e.target.value))} aria-label="근무 종료 시각">
              {Array.from({ length: 13 }).map((_, i) => <option key={i} value={i + 12}>{i + 12}:00</option>)}
            </select>
          </div>
        </div>

        {/* 도시별 24시간 바 — 시각 자료 (판독은 아래 베스트 슬롯 텍스트로 제공) */}
        <div className={styles.cityBars} aria-hidden="true">
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
                  {mounted && slots.map((s, i) => {
                    const p = partsInZone(s.utcDate, c.timeZone)
                    const bucket = classifyHour(p.hour)
                    const bucketCls = styles[`barCell${bucket.charAt(0).toUpperCase() + bucket.slice(1)}` as keyof typeof styles] || ''
                    // 기준 시각 마커: baseUtc와 가장 가까운 슬롯
                    const isMarker = Math.abs(s.utcDate.getTime() - baseUtc.getTime()) < 7.5 * 60000
                    return <div key={i} className={`${styles.barCell} ${bucketCls} ${isMarker ? styles.barCellMarker : ''}`} />
                  })}
                </div>
              </div>
            )
          })}

          {/* 도시 바 색상 안내 — 위 범례(판정 색)와 다른 체계임을 명시 */}
          <div className={styles.bucketLegend}>
            <div className={styles.slotLegend}><span className={`${styles.slotSq} ${styles.sqSleep}`}/>자는 시간</div>
            <div className={styles.slotLegend}><span className={`${styles.slotSq} ${styles.sqMorning}`}/>이른 아침</div>
            <div className={styles.slotLegend}><span className={`${styles.slotSq} ${styles.sqWork}`}/>근무</div>
            <div className={styles.slotLegend}><span className={`${styles.slotSq} ${styles.sqEvening}`}/>저녁</div>
            <div className={styles.slotLegend}><span className={`${styles.slotSq} ${styles.sqLate}`}/>늦은 밤</div>
          </div>

          {/* 전체 판정 바 — 상단 범례(녹/노/회)가 가리키는 행 */}
          <div className={styles.cityBar} style={{ marginTop: 4 }}>
            <div className={styles.cityBarLabel}>
              <span>🎯</span>
              <span>전체 판정</span>
            </div>
            <div className={styles.barTrack}>
              {mounted && slots.map((s, i) => {
                const isMarker = Math.abs(s.utcDate.getTime() - baseUtc.getTime()) < 7.5 * 60000
                const cls = s.quality === 'green' ? styles.barCellQGreen : s.quality === 'yellow' ? styles.barCellQYellow : styles.barCellQRed
                return <div key={i} className={`${styles.barCell} ${cls} ${isMarker ? styles.barCellMarker : ''}`} />
              })}
            </div>
          </div>
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
          {!mounted ? null : bestSlots.length === 0 ? (
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
