'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import s from './sleep-debt.module.css'

/* ─── 타입 ─── */
interface SleepEntry {
  id: string
  date: string      // YYYY-MM-DD (기상한 날짜 기준)
  bedtime: string   // HH:MM
  wakeTime: string  // HH:MM
  hours: number     // 실제 잔 시간 (자동 또는 직접)
  quality?: 1 | 2 | 3 | 4 | 5
  isDirect?: boolean // 직접 입력 모드인지
}

type Period = 7 | 14 | 30

/* ─── 상수 ─── */
const STORAGE_KEY = 'youtil_sleep_debt_v1'
const KST_OFFSET_MS = 9 * 3600 * 1000
const RECOVERY_EFFICIENCY = 0.5  // 초과 수면 1h → 부채 0.5h 상쇄

/* ─── 유틸 ─── */
function pad2(n: number) { return n < 10 ? `0${n}` : `${n}` }

function todayKstStr(): string {
  const d = new Date(Date.now() + KST_OFFSET_MS)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function dateOffset(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays))
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`
}

function fmtKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const wd = ['일', '월', '화', '수', '목', '금', '토'][dt.getUTCDay()]
  return `${m}/${d} (${wd})`
}

function computeHours(bedtime: string, wakeTime: string): number | null {
  const bm = bedtime.match(/^(\d{1,2}):(\d{2})$/)
  const wm = wakeTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!bm || !wm) return null
  const bMin = parseInt(bm[1], 10) * 60 + parseInt(bm[2], 10)
  const wMin = parseInt(wm[1], 10) * 60 + parseInt(wm[2], 10)
  // wake 시각이 bed 시각보다 작으면 다음날
  let diffMin = wMin - bMin
  if (diffMin <= 0) diffMin += 24 * 60
  return diffMin / 60
}

/* ─── localStorage ─── */
function loadEntries(): SleepEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SleepEntry[]
  } catch { return [] }
}
function saveEntries(arr: SleepEntry[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* quota */ }
}

/* ─── 부채 모델 ─── */
interface DebtAnalysis {
  totalDebt: number       // 누적 부채 (시간, 음수 가능 → 0으로 클램프 표시)
  rawDebt: number         // 클램프 안 한 원본
  avgHours: number
  daysWithData: number
  daysInPeriod: number
  longestStreak: number   // 목표 달성 연속 일수
  shortestNight: number   // 가장 짧은 수면
  longestNight: number    // 가장 긴 수면
}

function analyze(
  entries: SleepEntry[],
  targetHours: number,
  period: Period,
  todayDate: string,
): DebtAnalysis {
  // 지난 N일 (오늘 포함)의 기록만
  const startDate = dateOffset(todayDate, -(period - 1))
  const relevant = entries.filter(e => e.date >= startDate && e.date <= todayDate)
  const byDate = new Map<string, SleepEntry>()
  relevant.forEach(e => byDate.set(e.date, e))

  let rawDebt = 0
  let totalHours = 0
  let daysWithData = 0
  let streak = 0, longestStreak = 0
  let shortest = Infinity, longest = -Infinity

  for (let i = 0; i < period; i++) {
    const d = dateOffset(startDate, i)
    const e = byDate.get(d)
    if (!e) {
      streak = 0
      continue
    }
    const h = e.hours
    totalHours += h
    daysWithData++
    if (h < shortest) shortest = h
    if (h > longest) longest = h
    const diff = targetHours - h
    if (diff > 0) {
      rawDebt += diff           // 부족
      streak = 0
    } else {
      rawDebt += diff * RECOVERY_EFFICIENCY  // 초과 → 부채 일부 상쇄
      streak++
      if (streak > longestStreak) longestStreak = streak
    }
  }

  return {
    totalDebt: Math.max(0, rawDebt),
    rawDebt,
    avgHours: daysWithData > 0 ? totalHours / daysWithData : 0,
    daysWithData,
    daysInPeriod: period,
    longestStreak,
    shortestNight: shortest === Infinity ? 0 : shortest,
    longestNight: longest === -Infinity ? 0 : longest,
  }
}

/* ─── 일관성 점수 ─── */
interface Consistency {
  bedtimeStdMin: number  // 표준편차 (분)
  wakeStdMin: number
  rating: { label: string; color: string }
}

function consistency(entries: SleepEntry[], period: Period, todayDate: string): Consistency | null {
  const startDate = dateOffset(todayDate, -(period - 1))
  const relevant = entries.filter(e => e.date >= startDate && e.date <= todayDate && !e.isDirect)
  if (relevant.length < 3) return null

  // 취침·기상 시각을 분 단위로 변환 — 취침은 자정 기준 ±12h 정규화
  const bedMins = relevant.map(e => {
    const m = e.bedtime.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return 0
    let v = parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
    // 오전 0~12시는 +24*60 처리해서 늦은 취침과 연속성 확보 (자정 넘긴 취침)
    if (v < 12 * 60) v += 24 * 60
    return v
  })
  const wakeMins = relevant.map(e => {
    const m = e.wakeTime.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return 0
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  })

  const std = (arr: number[]) => {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length
    const variance = arr.reduce((acc, v) => acc + (v - avg) ** 2, 0) / arr.length
    return Math.sqrt(variance)
  }

  const bedStd = std(bedMins)
  const wakeStd = std(wakeMins)
  const worst = Math.max(bedStd, wakeStd)

  let rating: { label: string; color: string }
  if (worst < 20) rating = { label: '🟢 매우 일관적', color: '#059669' }
  else if (worst < 40) rating = { label: '🟢 일관적', color: '#0891B2' }
  else if (worst < 75) rating = { label: '🟡 보통', color: '#D97706' }
  else if (worst < 120) rating = { label: '🟠 불규칙', color: '#EA580C' }
  else rating = { label: '🔴 매우 불규칙', color: '#DC2626' }

  return { bedtimeStdMin: bedStd, wakeStdMin: wakeStd, rating }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function SleepDebtClient() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [targetHours, setTargetHours] = useState(8)
  const [period, setPeriod] = useState<Period>(7)
  const [todayDate, setTodayDate] = useState(() => todayKstStr())

  // 입력 폼
  const [inputDate, setInputDate] = useState(() => todayKstStr())
  const [bedtime, setBedtime] = useState('23:30')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [directMode, setDirectMode] = useState(false)
  const [directHours, setDirectHours] = useState('7')
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5 | 0>(0)

  // 회복 계획
  const [recoveryDailyHours, setRecoveryDailyHours] = useState(9)
  const [tomorrowWakeTime, setTomorrowWakeTime] = useState('07:00')

  // 초기 로드
  useEffect(() => {
    setEntries(loadEntries())
  }, [])
  // 저장
  useEffect(() => {
    saveEntries(entries)
  }, [entries])
  // 오늘 날짜 매분 갱신 (자정 넘어가면 자동 반영)
  useEffect(() => {
    const id = setInterval(() => setTodayDate(todayKstStr()), 60_000)
    return () => clearInterval(id)
  }, [])

  /* ─── 분석 ─── */
  const analysis = useMemo(
    () => analyze(entries, targetHours, period, todayDate),
    [entries, targetHours, period, todayDate],
  )
  const cons = useMemo(
    () => consistency(entries, period, todayDate),
    [entries, period, todayDate],
  )

  /* ─── 부채 등급 ─── */
  const debtStatus = (() => {
    const d = analysis.totalDebt
    if (analysis.daysWithData === 0) return { label: '기록 없음', color: '#888', desc: '아래에서 수면 기록을 추가하세요' }
    if (d < 1) return { label: '✅ 정상', color: '#059669', desc: '현재 부채 거의 없음 — 잘 유지 중' }
    if (d < 5) return { label: '🟢 양호', color: '#0891B2', desc: '경미한 부채 — 1~2일 충분히 자면 회복' }
    if (d < 10) return { label: '🟡 경미한 부채', color: '#D97706', desc: '집중력·기분 영향 시작 — 회복 권장' }
    if (d < 20) return { label: '🟠 누적 부채', color: '#EA580C', desc: '명확한 인지·면역 영향 — 회복 우선' }
    return { label: '🔴 만성 부채', color: '#DC2626', desc: '심각 — 1~2주 집중 회복 + 생활 점검' }
  })()

  /* ─── 회복 계획 ─── */
  const recoveryPlan = (() => {
    if (analysis.totalDebt < 0.5) return null
    const surplusPerDay = (recoveryDailyHours - targetHours) * RECOVERY_EFFICIENCY
    if (surplusPerDay <= 0) {
      return {
        days: null,
        message: `목표(${targetHours}h)보다 더 자야 부채가 줄어듭니다. 회복 계획 시간을 늘려보세요.`,
      }
    }
    const days = Math.ceil(analysis.totalDebt / surplusPerDay)
    return { days, surplusPerDay, message: '' }
  })()

  // 권장 취침 시각 (내일 기상 + 목표 시간 역산)
  const recommendedBedtime = useMemo(() => {
    const m = tomorrowWakeTime.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return null
    const wakeMin = parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
    // 잠드는데 평균 15분 걸린다고 가정 → 목표 + 15분 전에 잠자리
    const bedTotalMin = wakeMin - targetHours * 60 - 15
    const norm = ((bedTotalMin % (24 * 60)) + 24 * 60) % (24 * 60)
    return `${pad2(Math.floor(norm / 60))}:${pad2(norm % 60)}`
  }, [tomorrowWakeTime, targetHours])

  /* ─── 막대 차트 데이터 ─── */
  const chartData = useMemo(() => {
    const startDate = dateOffset(todayDate, -(period - 1))
    const days: { date: string; hours: number | null }[] = []
    const byDate = new Map<string, SleepEntry>()
    entries.forEach(e => byDate.set(e.date, e))
    for (let i = 0; i < period; i++) {
      const d = dateOffset(startDate, i)
      const e = byDate.get(d)
      days.push({ date: d, hours: e ? e.hours : null })
    }
    return days
  }, [entries, todayDate, period])

  /* ─── 동작 ─── */
  const addEntry = () => {
    let hours: number
    if (directMode) {
      const v = parseFloat(directHours)
      if (!isFinite(v) || v <= 0 || v > 16) return
      hours = v
    } else {
      const h = computeHours(bedtime, wakeTime)
      if (h === null || h <= 0 || h > 16) return
      hours = h
    }
    const newEntry: SleepEntry = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 5),
      date: inputDate,
      bedtime: directMode ? '' : bedtime,
      wakeTime: directMode ? '' : wakeTime,
      hours: Math.round(hours * 100) / 100,
      quality: quality === 0 ? undefined : quality,
      isDirect: directMode,
    }
    // 같은 날짜 기존 항목 덮어쓰기
    setEntries(prev => [...prev.filter(e => e.date !== inputDate), newEntry])
  }

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id))

  const clearAll = () => {
    if (confirm('모든 수면 기록을 지울까요? 되돌릴 수 없습니다.')) setEntries([])
  }

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  )

  /* ─── 차트 SVG ─── */
  const W = 600, H = 200, PL = 36, PR = 12, PT = 16, PB = 36
  const plotW = W - PL - PR, plotH = H - PT - PB
  const maxY = Math.max(10, targetHours + 2, ...chartData.map(d => d.hours ?? 0))
  const barW = plotW / chartData.length
  const yFromH = (h: number) => PT + (1 - h / maxY) * plotH
  const targetY = yFromH(targetHours)

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/caffeine',      label: '카페인 잔존량 트래커' },
          { href: '/tools/health/blood-alcohol', label: '혈중알코올 계산기' },
          { href: '/tools/life/pomodoro',        label: '뽀모도로 타이머' },
        ]}
        sources={[
          { label: '대한수면연구학회', href: 'https://www.sleepnet.or.kr' },
          { label: '질병관리청 국가건강정보포털', href: 'https://health.kdca.go.kr' },
        ]}
      >
        본 도구는 일반 안내용입니다. 만성 불면·과수면·코골이·수면무호흡 의심 시 수면 클리닉 진단 권장.
      </Disclaimer>

      {/* ─── 메인 히어로 ─── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>누적 수면 부채 (지난 {period}일)</div>
        <div className={s.heroNumRow}>
          <span className={s.heroNum} style={{ color: debtStatus.color }}>
            {analysis.totalDebt.toFixed(1)}
          </span>
          <span className={s.heroUnit}>시간</span>
        </div>
        <div className={s.heroStatus} style={{ borderColor: `${debtStatus.color}55`, color: debtStatus.color }}>
          {debtStatus.label}
        </div>
        <div className={s.heroDesc}>{debtStatus.desc}</div>
        <div className={s.heroMeta}>
          <div className={s.heroMetaItem}>
            <span className={s.heroMetaLabel}>평균 수면</span>
            <span className={s.heroMetaVal}>
              {analysis.avgHours > 0 ? `${analysis.avgHours.toFixed(1)}h` : '—'}
            </span>
          </div>
          <div className={s.heroMetaItem}>
            <span className={s.heroMetaLabel}>목표</span>
            <span className={s.heroMetaVal}>{targetHours}h</span>
          </div>
          <div className={s.heroMetaItem}>
            <span className={s.heroMetaLabel}>기록 일수</span>
            <span className={s.heroMetaVal}>{analysis.daysWithData}/{analysis.daysInPeriod}</span>
          </div>
          <div className={s.heroMetaItem}>
            <span className={s.heroMetaLabel}>최장 달성</span>
            <span className={s.heroMetaVal}>{analysis.longestStreak}일 연속</span>
          </div>
        </div>
      </div>

      {/* ─── 설정 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚙️ 개인 설정</div>
        <div className={s.subLabel}>목표 수면 시간 / 일</div>
        <div className={s.sliderRow}>
          <input
            type="range"
            min={5} max={10} step={0.5}
            value={targetHours}
            onChange={e => setTargetHours(parseFloat(e.target.value))}
            className={s.slider}
          />
          <span className={s.sliderVal}>{targetHours}h</span>
        </div>
        <div className={s.sliderHint}>
          성인 권장 7~9h · 청소년 8~10h · 어르신 7~8h (CDC·NSF)
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>분석 기간</div>
        <div className={s.periodRow}>
          {([7, 14, 30] as Period[]).map(p => (
            <button
              key={p}
              type="button"
              className={`${s.periodBtn} ${period === p ? s.periodActive : ''}`}
              onClick={() => setPeriod(p)}
            >지난 {p}일</button>
          ))}
        </div>
      </div>

      {/* ─── 입력 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>➕ 수면 기록 추가</div>

        <div className={s.subLabel}>날짜 (기상한 날)</div>
        <div className={s.dateRow}>
          <input
            type="date"
            className={s.dateInput}
            value={inputDate}
            max={todayDate}
            onChange={e => setInputDate(e.target.value)}
          />
          <div className={s.dateQuickBtns}>
            <button type="button" className={s.quickBtn}
              onClick={() => setInputDate(todayDate)}>오늘</button>
            <button type="button" className={s.quickBtn}
              onClick={() => setInputDate(dateOffset(todayDate, -1))}>어제</button>
          </div>
        </div>

        <div className={s.subLabel} style={{ marginTop: 12 }}>입력 방식</div>
        <div className={s.modeRow}>
          <button type="button"
            className={`${s.modeBtn} ${!directMode ? s.modeActive : ''}`}
            onClick={() => setDirectMode(false)}>🛏️ 잠든 시각 · 일어난 시각</button>
          <button type="button"
            className={`${s.modeBtn} ${directMode ? s.modeActive : ''}`}
            onClick={() => setDirectMode(true)}>⏱️ 시간 직접 입력</button>
        </div>

        {!directMode ? (
          <div className={s.timePairRow}>
            <div className={s.timeField}>
              <label>잠든 시각</label>
              <input type="time" className={s.timeInput} value={bedtime}
                onChange={e => setBedtime(e.target.value)} />
            </div>
            <div className={s.timeField}>
              <label>일어난 시각</label>
              <input type="time" className={s.timeInput} value={wakeTime}
                onChange={e => setWakeTime(e.target.value)} />
            </div>
            <div className={s.timeField}>
              <label>자동 계산</label>
              <div className={s.autoCalc}>
                {(() => {
                  const h = computeHours(bedtime, wakeTime)
                  return h !== null ? `${h.toFixed(1)}h` : '—'
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className={s.directRow}>
            <input
              type="number" inputMode="decimal" step="0.5" min={0.5} max={16}
              className={s.directInput}
              value={directHours}
              onChange={e => setDirectHours(e.target.value)}
            />
            <span className={s.directUnit}>시간</span>
            <div className={s.directQuick}>
              {[5, 6, 7, 8, 9].map(h => (
                <button key={h} type="button"
                  className={s.quickBtn}
                  onClick={() => setDirectHours(String(h))}>{h}h</button>
              ))}
            </div>
          </div>
        )}

        <div className={s.subLabel} style={{ marginTop: 12 }}>수면 질 (선택)</div>
        <div className={s.qualityRow}>
          {[0, 1, 2, 3, 4, 5].map(q => (
            <button
              key={q}
              type="button"
              className={`${s.qualityBtn} ${quality === q ? s.qualityActive : ''}`}
              onClick={() => setQuality(q as 0 | 1 | 2 | 3 | 4 | 5)}
              title={
                q === 0 ? '입력 안함' :
                q === 1 ? '최악 (계속 깸·악몽)' :
                q === 2 ? '나쁨' :
                q === 3 ? '보통' :
                q === 4 ? '좋음' : '최고 (개운함)'
              }
            >
              {q === 0 ? '—' : '⭐'.repeat(q)}
            </button>
          ))}
        </div>

        <button type="button" className={s.addBtn} onClick={addEntry}>
          {entries.some(e => e.date === inputDate) ? '↻ 이 날 기록 덮어쓰기' : '+ 추가'}
        </button>
      </div>

      {/* ─── 차트 ─── */}
      {chartData.some(d => d.hours !== null) && (
        <div className={s.chartCard}>
          <div className={s.cardLabel}>📊 지난 {period}일 수면 패턴</div>
          <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} preserveAspectRatio="xMidYMid meet">
            {/* Y축 그리드 */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <line key={t} x1={PL} x2={W - PR} y1={PT + t * plotH} y2={PT + t * plotH}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <text key={t} x={PL - 6} y={PT + (1 - t) * plotH + 3}
                fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
                {(t * maxY).toFixed(0)}h
              </text>
            ))}
            {/* 목표선 */}
            <line x1={PL} x2={W - PR} y1={targetY} y2={targetY}
              stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            <text x={W - PR - 4} y={targetY - 4}
              fill="var(--accent)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
              목표 {targetHours}h
            </text>
            {/* 막대 */}
            {chartData.map((d, i) => {
              const cx = PL + (i + 0.5) * barW
              const bw = Math.max(4, barW * 0.7)
              if (d.hours === null) {
                // 빈 칸은 회색 점선
                return (
                  <g key={i}>
                    <rect x={cx - bw / 2} y={PT + plotH - 4} width={bw} height={4}
                      fill="rgba(255,255,255,0.1)" rx="2" />
                  </g>
                )
              }
              const diff = d.hours - targetHours
              const color = diff >= -0.5 ? '#059669' : diff >= -2 ? '#D97706' : '#DC2626'
              const y = yFromH(d.hours)
              return (
                <g key={i}>
                  <rect x={cx - bw / 2} y={y} width={bw} height={PT + plotH - y}
                    fill={color} opacity="0.85" rx="2" />
                  <text x={cx} y={y - 4} fill={color} fontSize="9"
                    textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                    {d.hours.toFixed(1)}
                  </text>
                </g>
              )
            })}
            {/* X축 레이블 — 적정 개수만 */}
            {chartData.map((d, i) => {
              const showEvery = period === 7 ? 1 : period === 14 ? 2 : 5
              if (i % showEvery !== 0 && i !== chartData.length - 1) return null
              const cx = PL + (i + 0.5) * barW
              return (
                <text key={i} x={cx} y={H - PB + 14}
                  fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                  {d.date.slice(5)}
                </text>
              )
            })}
          </svg>
          <div className={s.chartLegend}>
            <span><span className={s.dot} style={{ background: '#059669' }} />목표 이상</span>
            <span><span className={s.dot} style={{ background: '#D97706' }} />약간 부족</span>
            <span><span className={s.dot} style={{ background: '#DC2626' }} />심각 부족</span>
            <span><span className={s.dot} style={{ background: 'rgba(255,255,255,0.15)' }} />기록 없음</span>
          </div>
        </div>
      )}

      {/* ─── 일관성 ─── */}
      {cons && (
        <div className={s.card}>
          <div className={s.cardLabel}>🎯 수면 규칙성 (Sleep Consistency)</div>
          <div className={s.consGrid}>
            <div className={s.consBox}>
              <div className={s.consLabel}>취침 시각 변동</div>
              <div className={s.consVal}>±{Math.round(cons.bedtimeStdMin)}분</div>
            </div>
            <div className={s.consBox}>
              <div className={s.consLabel}>기상 시각 변동</div>
              <div className={s.consVal}>±{Math.round(cons.wakeStdMin)}분</div>
            </div>
            <div className={s.consBox} style={{ borderColor: `${cons.rating.color}55` }}>
              <div className={s.consLabel}>종합 등급</div>
              <div className={s.consVal} style={{ color: cons.rating.color }}>{cons.rating.label}</div>
            </div>
          </div>
          <p className={s.consNote}>
            💡 <strong>수면 규칙성은 총 수면 시간만큼 중요</strong>합니다 — 같은 8시간이라도 매일 같은 시각에 자고 일어나면 생체리듬·인지 기능이 훨씬 안정적.
          </p>
        </div>
      )}

      {/* ─── 회복 계획 ─── */}
      {analysis.totalDebt >= 0.5 && (
        <div className={s.recoveryCard}>
          <div className={s.cardLabel}>💤 회복 계획</div>

          <div className={s.recoveryRow}>
            <div className={s.recoveryField}>
              <label>매일 잘 시간</label>
              <div className={s.recoverySliderRow}>
                <input
                  type="range" min={targetHours} max={11} step={0.5}
                  value={recoveryDailyHours}
                  onChange={e => setRecoveryDailyHours(parseFloat(e.target.value))}
                  className={s.slider}
                />
                <span className={s.sliderVal}>{recoveryDailyHours}h</span>
              </div>
            </div>
          </div>

          {recoveryPlan && (
            recoveryPlan.days !== null ? (
              <div className={s.recoveryResult}>
                <strong>{recoveryPlan.days}일</strong> 후 부채 0 도달 예상
                <span className={s.recoverySub}>
                  (매일 {recoveryDailyHours}h × 잉여 {(recoveryPlan.surplusPerDay ?? 0).toFixed(2)}h/일 효과 적용)
                </span>
              </div>
            ) : (
              <div className={s.recoveryWarn}>{recoveryPlan.message}</div>
            )
          )}

          <div className={s.recoveryField} style={{ marginTop: 14 }}>
            <label>오늘 권장 취침 시각</label>
            <div className={s.bedtimeAdvice}>
              내일 <input type="time"
                className={s.miniTime}
                value={tomorrowWakeTime}
                onChange={e => setTomorrowWakeTime(e.target.value)}
              /> 기상 시 →
              <strong style={{ color: 'var(--accent)' }}> {recommendedBedtime ?? '—'}</strong>까지 잠자리
              <span className={s.bedtimeNote}>(잠들기 15분 여유 포함)</span>
            </div>
          </div>

          <div className={s.recoveryWarnBox}>
            ⚠️ <strong>주말 몰아 자기 (Sleep Bingeing)는 효과 제한적</strong>입니다.
            연구상 누적 부채의 30~50%만 회복되고, 일주일의 생체리듬을 더 망가뜨립니다.
            <strong>매일 +1~1.5시간씩 7일</strong>이 가장 효과적인 회복.
          </div>
        </div>
      )}

      {/* ─── 기록 리스트 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>📋 기록 ({entries.length})</span>
          {entries.length > 0 && (
            <button className={s.clearBtn} onClick={clearAll}>전체 삭제</button>
          )}
        </div>
        {entries.length === 0 ? (
          <p className={s.emptyMsg}>아직 기록이 없습니다. 위에서 어젯밤·최근 수면을 추가하세요.</p>
        ) : (
          <ul className={s.entryList}>
            {sortedEntries.slice(0, 30).map(e => {
              const diff = e.hours - targetHours
              const color = diff >= -0.5 ? '#059669' : diff >= -2 ? '#D97706' : '#DC2626'
              return (
                <li key={e.id} className={s.entryItem}>
                  <div className={s.entryDate}>{fmtKoreanDate(e.date)}</div>
                  <div className={s.entryMid}>
                    <span className={s.entryHours} style={{ color }}>{e.hours.toFixed(1)}h</span>
                    {!e.isDirect && (
                      <span className={s.entryTimes}>
                        {e.bedtime} → {e.wakeTime}
                      </span>
                    )}
                    {e.quality && (
                      <span className={s.entryQual}>{'⭐'.repeat(e.quality)}</span>
                    )}
                  </div>
                  <button className={s.entryDel} onClick={() => removeEntry(e.id)} aria-label="삭제">×</button>
                </li>
              )
            })}
          </ul>
        )}
        {entries.length > 30 && (
          <p className={s.emptyMsg} style={{ marginTop: 8 }}>최근 30개만 표시. 전체 {entries.length}개 저장됨.</p>
        )}
      </div>

      {/* ─── 가이드 ─── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 수면 부채 회복 가이드</div>
        <ul className={s.tipList}>
          <li><strong>1~2주 누적 부채는 회복 가능</strong> — 그 이상은 인지·면역 손상이 일부 영구화 가능</li>
          <li><strong>매일 +1시간씩 7~10일</strong>이 가장 효과적 — 주말 몰아 자기보다 우월</li>
          <li><strong>같은 시각 기상</strong> 유지 (주말 ±30분 이내) — 생체리듬 보호</li>
          <li><strong>20~30분 낮잠</strong> — 부채 일부 상쇄, 다만 오후 3시 이전</li>
          <li><strong>취침 1~2시간 전 카페인·알코올·과식 X</strong> — 깊은 수면 차단</li>
          <li><strong>침실 18~20℃ + 어둠 + 조용함</strong> — 환경 3박자</li>
          <li><strong>주말 늦잠 최대 +2시간</strong> — 더 자면 다음 주 부채 가속</li>
        </ul>
      </div>
    </div>
  )
}
