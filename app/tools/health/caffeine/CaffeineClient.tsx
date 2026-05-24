'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './caffeine.module.css'

/* ─── 데이터: 음료 프리셋 (한국 시장 기준) ─── */
type DrinkCat = 'coffee' | 'tea' | 'soda' | 'energy' | 'sweet' | 'custom'

interface DrinkPreset {
  id: string
  cat: DrinkCat
  name: string
  caffeine: number // mg
  icon: string
}

const DRINK_PRESETS: DrinkPreset[] = [
  // ☕ 커피
  { id: 'americano-t', cat: 'coffee', name: '아메리카노 (Tall)', caffeine: 150, icon: '☕' },
  { id: 'americano-g', cat: 'coffee', name: '아메리카노 (Grande)', caffeine: 225, icon: '☕' },
  { id: 'americano-v', cat: 'coffee', name: '아메리카노 (Venti)', caffeine: 300, icon: '☕' },
  { id: 'latte',       cat: 'coffee', name: '카페라떼 (Tall)',  caffeine: 75,  icon: '🥛' },
  { id: 'cold-brew',   cat: 'coffee', name: '콜드브루 (Tall)',  caffeine: 195, icon: '🧊' },
  { id: 'espresso',    cat: 'coffee', name: '에스프레소 1샷',    caffeine: 75,  icon: '☕' },
  { id: 'capsule',     cat: 'coffee', name: '캡슐커피 1개',      caffeine: 70,  icon: '🟤' },
  { id: 'mix',         cat: 'coffee', name: '믹스커피 1포',      caffeine: 50,  icon: '☕' },
  { id: 'decaf',       cat: 'coffee', name: '디카페인 (Tall)',   caffeine: 10,  icon: '☕' },
  // 🍵 차
  { id: 'green-tea',   cat: 'tea', name: '녹차 (티백 1개)',     caffeine: 30,  icon: '🍵' },
  { id: 'black-tea',   cat: 'tea', name: '홍차 (티백 1개)',     caffeine: 47,  icon: '🍵' },
  { id: 'matcha',      cat: 'tea', name: '말차 (1잔)',          caffeine: 70,  icon: '🍵' },
  { id: 'milk-tea',    cat: 'tea', name: '밀크티 (1잔)',        caffeine: 50,  icon: '🥤' },
  // 🥤 탄산
  { id: 'cola',        cat: 'soda', name: '콜라 355ml',         caffeine: 35,  icon: '🥤' },
  { id: 'diet-cola',   cat: 'soda', name: '다이어트콜라 355ml', caffeine: 47,  icon: '🥤' },
  { id: 'mountain-dew',cat: 'soda', name: '마운틴듀 355ml',     caffeine: 54,  icon: '🥤' },
  // ⚡ 에너지
  { id: 'redbull',     cat: 'energy', name: '레드불 250ml',      caffeine: 80,  icon: '⚡' },
  { id: 'monster',     cat: 'energy', name: '몬스터 473ml',      caffeine: 160, icon: '⚡' },
  { id: 'hot6',        cat: 'energy', name: '핫식스 250ml',      caffeine: 60,  icon: '⚡' },
  { id: 'bacchus',     cat: 'energy', name: '박카스',            caffeine: 30,  icon: '⚡' },
  { id: 'redbull-l',   cat: 'energy', name: '레드불 라지 355ml', caffeine: 114, icon: '⚡' },
  // 🍫 디저트
  { id: 'dark-choco',  cat: 'sweet', name: '다크초콜릿 28g',     caffeine: 24,  icon: '🍫' },
  { id: 'milk-choco',  cat: 'sweet', name: '밀크초콜릿 28g',     caffeine: 9,   icon: '🍫' },
  { id: 'choco-ice',   cat: 'sweet', name: '초코아이스크림',     caffeine: 8,   icon: '🍦' },
]

const CAT_LABELS: Record<DrinkCat, string> = {
  coffee: '☕ 커피', tea: '🍵 차', soda: '🥤 탄산',
  energy: '⚡ 에너지', sweet: '🍫 디저트', custom: '✏️ 직접 입력',
}

/* ─── 반감기 프리셋 ─── */
const HALF_LIFE_PRESETS = [
  { id: 'smoker',   label: '흡연자 (빠름)',   hours: 3.0, desc: '니코틴이 CYP1A2 활성화' },
  { id: 'fast',     label: '빠른 대사 (대략 1/3)', hours: 4.0, desc: '유전적 CYP1A2 fast' },
  { id: 'normal',   label: '보통 (성인 평균)',hours: 5.0, desc: '가장 흔한 기본값' },
  { id: 'slow',     label: '느린 대사 (대략 1/2)', hours: 6.5, desc: '유전적 CYP1A2 slow' },
  { id: 'pill',     label: '경구 피임약 복용', hours: 9.0, desc: '에스트로겐이 분해 억제' },
  { id: 'pregnant', label: '임신·수유 중',    hours: 12.0,desc: '간 효소 변화로 매우 느림' },
  { id: 'teen',     label: '청소년 (~18세)',  hours: 4.0, desc: '청소년 평균 (개인차 큼)' },
] as const

/* ─── 1일 권장량 (FDA·식약처) ─── */
const DAILY_LIMITS = [
  { id: 'adult',    label: '성인',         mg: 400 },
  { id: 'pregnant', label: '임산부·수유부', mg: 200 },
  { id: 'teen',     label: '청소년 (만 11~18)', mg: 125 },
  { id: 'kid',      label: '어린이 (~만 10)',  mg: 45 },
] as const

/* ─── 타입 ─── */
interface DrinkEntry {
  id: string
  presetId: string | 'custom'
  name: string
  caffeine: number    // mg
  consumedAtMs: number  // epoch ms
}

const STORAGE_KEY = 'youtil_caffeine_v1'
const KST_OFFSET_MS = 9 * 3600 * 1000

/* ─── 시각 포맷 ─── */
function fmtHM(ms: number): string {
  const d = new Date(ms + KST_OFFSET_MS)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function fmtRelative(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 0) return '미래'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h < 24) return `${h}시간${m > 0 ? ` ${m}분` : ''} 전`
  return `${Math.floor(h / 24)}일 전`
}

/* ─── 모델: 지수 붕괴 ─── */
function remainAtTime(dose: number, consumedMs: number, atMs: number, halfHours: number): number {
  if (atMs <= consumedMs) return 0
  const elapsedH = (atMs - consumedMs) / 3600000
  const k = Math.LN2 / halfHours
  return dose * Math.exp(-k * elapsedH)
}

/* ─── localStorage ─── */
function loadEntries(): DrinkEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as DrinkEntry[]
    // 36시간 지난 항목은 자동 정리
    const cutoff = Date.now() - 36 * 3600 * 1000
    return arr.filter(e => e.consumedAtMs > cutoff)
  } catch {
    return []
  }
}

function saveEntries(arr: DrinkEntry[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* quota */ }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function CaffeineClient() {
  const [entries, setEntries] = useState<DrinkEntry[]>([])
  const [halfLifeId, setHalfLifeId] = useState<typeof HALF_LIFE_PRESETS[number]['id']>('normal')
  const [dailyLimitId, setDailyLimitId] = useState<typeof DAILY_LIMITS[number]['id']>('adult')
  const [selectedCat, setSelectedCat] = useState<DrinkCat>('coffee')
  const [customName, setCustomName] = useState('')
  const [customMg, setCustomMg] = useState('')
  const [bedtime, setBedtime] = useState('23:30')

  // 입력 시각 — 기본 "지금", 직접 입력 가능
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now')
  const [customH, setCustomH] = useState<number>(() => new Date().getHours())
  const [customM, setCustomM] = useState<number>(() => new Date().getMinutes())

  // 실시간 시계
  const [nowMs, setNowMs] = useState(() => Date.now())
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    let last = 0
    const loop = () => {
      const t = Date.now()
      if (t - last >= 1000) { setNowMs(t); last = t }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // 초기 로드
  useEffect(() => {
    setEntries(loadEntries())
  }, [])
  // 저장
  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  // 현재 시각 입력 모드일 때 매분 customH/M 갱신
  useEffect(() => {
    if (timeMode !== 'now') return
    const d = new Date(nowMs)
    setCustomH(d.getHours())
    setCustomM(d.getMinutes())
  }, [timeMode, nowMs])

  const halfHours = HALF_LIFE_PRESETS.find(p => p.id === halfLifeId)?.hours ?? 5
  const dailyLimit = DAILY_LIMITS.find(p => p.id === dailyLimitId)?.mg ?? 400

  /* ─── 추가 ─── */
  const computeConsumedAtMs = useCallback((): number => {
    if (timeMode === 'now') return Date.now()
    const d = new Date()
    d.setHours(customH, customM, 0, 0)
    let ts = d.getTime()
    // 미래로 5분 이상이면 어제로 (밤늦게 어제 새벽 기록 등 케이스 회피)
    if (ts - Date.now() > 5 * 60 * 1000) ts -= 24 * 3600 * 1000
    return ts
  }, [timeMode, customH, customM])

  const addPreset = useCallback((p: DrinkPreset) => {
    setEntries(prev => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 5),
        presetId: p.id,
        name: p.name,
        caffeine: p.caffeine,
        consumedAtMs: computeConsumedAtMs(),
      },
    ])
  }, [computeConsumedAtMs])

  const addCustom = () => {
    const mg = parseFloat(customMg)
    const name = customName.trim() || '직접 입력'
    if (!mg || mg <= 0 || mg > 2000) return
    setEntries(prev => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 5),
        presetId: 'custom',
        name,
        caffeine: mg,
        consumedAtMs: computeConsumedAtMs(),
      },
    ])
    setCustomName('')
    setCustomMg('')
  }

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id))
  const clearAll = () => {
    if (confirm('오늘 기록을 모두 지울까요?')) setEntries([])
  }

  /* ─── 계산 ─── */
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.consumedAtMs - a.consumedAtMs),
    [entries],
  )

  // 오늘 누적 (KST 자정 ~ 지금)
  const todayStartMs = useMemo(() => {
    const d = new Date(nowMs + KST_OFFSET_MS)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime() - KST_OFFSET_MS
  }, [nowMs])

  const todayTotalMg = useMemo(
    () => entries.filter(e => e.consumedAtMs >= todayStartMs).reduce((s, e) => s + e.caffeine, 0),
    [entries, todayStartMs],
  )

  // 현재 체내 잔존 mg
  const currentBodyMg = useMemo(
    () => entries.reduce((s, e) => s + remainAtTime(e.caffeine, e.consumedAtMs, nowMs, halfHours), 0),
    [entries, nowMs, halfHours],
  )

  // 잠자리 영향 — 목표 취침 시각에서의 잔존량
  const bedtimeMs = useMemo(() => {
    const m = bedtime.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return null
    const h = parseInt(m[1], 10), mn = parseInt(m[2], 10)
    if (h > 23 || mn > 59) return null
    const d = new Date(nowMs + KST_OFFSET_MS)
    d.setUTCHours(h, mn, 0, 0)
    let ts = d.getTime() - KST_OFFSET_MS
    if (ts < nowMs) ts += 24 * 3600 * 1000
    return ts
  }, [bedtime, nowMs])

  const bedtimeBodyMg = useMemo(() => {
    if (bedtimeMs === null) return 0
    return entries.reduce((s, e) => s + remainAtTime(e.caffeine, e.consumedAtMs, bedtimeMs, halfHours), 0)
  }, [entries, bedtimeMs, halfHours])

  // 다음 마실 수 있는 시점 (취침까지 잔존 < 30mg 유지하려면)
  // 지금 카페인 추가 시 취침 시 잔존 (마실 양 = 0인 가상값 기준)
  // 100mg / 50mg / 30mg 마지노선까지 가능한 양 역산
  const maxAddableForSafe = useMemo(() => {
    if (bedtimeMs === null) return null
    const decayFromNowToBed = Math.exp(-Math.LN2 / halfHours * ((bedtimeMs - nowMs) / 3600000))
    // 새로 마신 mg은 그대로 잔존 시까지 decayFromNowToBed 만큼 줄어듦
    const result = (threshold: number) => Math.max(0, (threshold - bedtimeBodyMg) / decayFromNowToBed)
    return {
      safe30: result(30),
      ok50: result(50),
      caution100: result(100),
    }
  }, [bedtimeMs, nowMs, halfHours, bedtimeBodyMg])

  // 곡선 데이터 (6시간 전 ~ 12시간 후)
  const chartData = useMemo(() => {
    const startMs = nowMs - 6 * 3600 * 1000
    const endMs = nowMs + 12 * 3600 * 1000
    const points: { t: number; mg: number }[] = []
    const steps = 72
    for (let i = 0; i <= steps; i++) {
      const t = startMs + (endMs - startMs) * (i / steps)
      const mg = entries.reduce((s, e) => s + remainAtTime(e.caffeine, e.consumedAtMs, t, halfHours), 0)
      points.push({ t, mg })
    }
    return { points, startMs, endMs }
  }, [entries, nowMs, halfHours])

  /* ─── 상태 ─── */
  const sleepImpact = (() => {
    if (bedtimeMs === null) return null
    if (bedtimeBodyMg < 30) return { label: '😴 영향 거의 없음', color: '#059669' }
    if (bedtimeBodyMg < 50) return { label: '😌 가벼운 영향 가능', color: '#0891B2' }
    if (bedtimeBodyMg < 100) return { label: '😬 입면 지연 가능', color: '#D97706' }
    if (bedtimeBodyMg < 200) return { label: '😵 수면 질 큰 영향', color: '#EA580C' }
    return { label: '🚨 깊은 수면 차단 수준', color: '#DC2626' }
  })()

  const dailyPct = Math.min(100, (todayTotalMg / dailyLimit) * 100)
  const dailyStatus =
    dailyPct < 60 ? { label: '✅ 여유', color: '#059669' }
    : dailyPct < 90 ? { label: '⚠️ 권장량 근접', color: '#D97706' }
    : dailyPct < 100 ? { label: '🟠 권장량 거의 도달', color: '#EA580C' }
    : { label: '🚨 권장량 초과', color: '#DC2626' }

  /* ─── 차트 SVG ─── */
  const W = 600, H = 220, PL = 44, PR = 16, PT = 16, PB = 32
  const plotW = W - PL - PR, plotH = H - PT - PB
  const allMg = chartData.points.map(p => p.mg)
  const maxMg = Math.max(50, ...allMg) * 1.15
  const xFromT = (t: number) =>
    PL + ((t - chartData.startMs) / (chartData.endMs - chartData.startMs)) * plotW
  const yFromMg = (mg: number) => PT + (1 - mg / maxMg) * plotH
  const linePath = `M ${chartData.points.map(p => `${xFromT(p.t).toFixed(1)},${yFromMg(p.mg).toFixed(1)}`).join(' L ')}`
  const areaPath = `${linePath} L ${xFromT(chartData.endMs).toFixed(1)},${yFromMg(0).toFixed(1)} L ${xFromT(chartData.startMs).toFixed(1)},${yFromMg(0).toFixed(1)} Z`
  const nowX = xFromT(nowMs)
  const bedX = bedtimeMs !== null && bedtimeMs <= chartData.endMs ? xFromT(bedtimeMs) : null

  const filteredPresets = DRINK_PRESETS.filter(p => p.cat === selectedCat)

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/blood-alcohol', label: '혈중알코올 계산기' },
          { href: '/tools/cooking/brew',         label: '커피 브루잉 계산기' },
          { href: '/tools/life/pomodoro',        label: '뽀모도로 타이머' },
        ]}
        sources={[
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
          { label: '식품안전나라', href: 'https://www.foodsafetykorea.go.kr' },
        ]}
      >
        반감기 5시간 (성인 평균) 기반 지수 붕괴 모델. 개인차 ±30%, 일반 안내용입니다.
      </Disclaimer>

      {/* ─── 메인 히어로: 현재 체내 카페인 ─── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>현재 체내 카페인</div>
        <div className={s.heroNumRow}>
          <span className={s.heroNum}>{Math.round(currentBodyMg)}</span>
          <span className={s.heroUnit}>mg</span>
        </div>
        <div className={s.heroSub}>
          반감기 <strong>{halfHours}시간</strong> 기준 · 오늘 누적 <strong>{Math.round(todayTotalMg)}mg</strong> ({DAILY_LIMITS.find(l => l.id === dailyLimitId)?.label} 권장 {dailyLimit}mg)
        </div>
        <div className={s.dailyBar}>
          <div className={s.dailyBarFill}
               style={{ width: `${dailyPct}%`, background: dailyStatus.color }} />
        </div>
        <div className={s.dailyMeta}>
          <span style={{ color: dailyStatus.color, fontWeight: 700 }}>{dailyStatus.label}</span>
          <span>{dailyPct.toFixed(0)}% / {dailyLimit}mg</span>
        </div>
      </div>

      {/* ─── 설정: 반감기·일일 한도 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚙️ 개인 설정</div>

        <div className={s.subLabel}>반감기 (대사 속도)</div>
        <div className={s.optionGrid}>
          {HALF_LIFE_PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              className={`${s.optionBtn} ${halfLifeId === p.id ? s.optionActive : ''}`}
              onClick={() => setHalfLifeId(p.id)}
              title={p.desc}
            >
              <span className={s.optionTitle}>{p.label}</span>
              <span className={s.optionSub}>{p.hours}h</span>
            </button>
          ))}
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>일일 권장량 기준</div>
        <div className={s.limitRow}>
          {DAILY_LIMITS.map(p => (
            <button
              key={p.id}
              type="button"
              className={`${s.limitBtn} ${dailyLimitId === p.id ? s.optionActive : ''}`}
              onClick={() => setDailyLimitId(p.id)}
            >
              {p.label}<span className={s.limitMg}>{p.mg}mg</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 음료 추가 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>➕ 음료 추가</div>

        <div className={s.subLabel}>마신 시각</div>
        <div className={s.timeRow}>
          <button
            type="button"
            className={`${s.timeModeBtn} ${timeMode === 'now' ? s.optionActive : ''}`}
            onClick={() => setTimeMode('now')}
          >지금</button>
          <button
            type="button"
            className={`${s.timeModeBtn} ${timeMode === 'custom' ? s.optionActive : ''}`}
            onClick={() => setTimeMode('custom')}
          >직접 입력</button>
          {timeMode === 'custom' && (
            <div className={s.timeInputs}>
              <select className={s.timeSelect} value={customH} onChange={e => setCustomH(+e.target.value)}>
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}시</option>)}
              </select>
              <span className={s.colon}>:</span>
              <select className={s.timeSelect} value={customM} onChange={e => setCustomM(+e.target.value)}>
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>)}
              </select>
            </div>
          )}
        </div>

        <div className={s.subLabel} style={{ marginTop: 12 }}>음료 종류</div>
        <div className={s.catTabs}>
          {(['coffee', 'tea', 'soda', 'energy', 'sweet', 'custom'] as DrinkCat[]).map(c => (
            <button
              key={c}
              type="button"
              className={`${s.catTab} ${selectedCat === c ? s.catTabActive : ''}`}
              onClick={() => setSelectedCat(c)}
            >{CAT_LABELS[c]}</button>
          ))}
        </div>

        {selectedCat !== 'custom' ? (
          <div className={s.presetGrid}>
            {filteredPresets.map(p => (
              <button
                key={p.id}
                type="button"
                className={s.presetBtn}
                onClick={() => addPreset(p)}
              >
                <span className={s.presetIcon}>{p.icon}</span>
                <div className={s.presetText}>
                  <div className={s.presetName}>{p.name}</div>
                  <div className={s.presetMg}>{p.caffeine}mg</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={s.customRow}>
            <input
              type="text"
              className={s.customInput}
              placeholder="음료 이름 (예: 핫초코)"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              maxLength={20}
            />
            <input
              type="number"
              inputMode="decimal"
              className={s.customMg}
              placeholder="mg"
              value={customMg}
              onChange={e => setCustomMg(e.target.value)}
              min={1}
              max={2000}
              onKeyDown={e => { if (e.key === 'Enter') addCustom() }}
            />
            <button
              type="button"
              className={s.customAddBtn}
              onClick={addCustom}
              disabled={!customMg || !parseFloat(customMg)}
            >+ 추가</button>
          </div>
        )}
      </div>

      {/* ─── 오늘 기록 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          📋 기록 ({entries.length})
          {entries.length > 0 && (
            <button className={s.clearBtn} onClick={clearAll}>전체 삭제</button>
          )}
        </div>
        {entries.length === 0 ? (
          <p className={s.emptyMsg}>아직 기록된 음료가 없습니다. 위에서 음료를 추가하세요.</p>
        ) : (
          <ul className={s.entryList}>
            {sortedEntries.map(e => {
              const remain = remainAtTime(e.caffeine, e.consumedAtMs, nowMs, halfHours)
              const pctRemain = (remain / e.caffeine) * 100
              return (
                <li key={e.id} className={s.entryItem}>
                  <div className={s.entryMain}>
                    <span className={s.entryName}>{e.name}</span>
                    <span className={s.entryMeta}>
                      {fmtHM(e.consumedAtMs)} · {fmtRelative(e.consumedAtMs)} · 섭취 {Math.round(e.caffeine)}mg
                    </span>
                  </div>
                  <div className={s.entryRemain}>
                    <div className={s.entryRemainNum}>{Math.round(remain)}<span>mg</span></div>
                    <div className={s.entryRemainPct}>잔존 {pctRemain.toFixed(0)}%</div>
                  </div>
                  <button className={s.entryDel} onClick={() => removeEntry(e.id)} aria-label="삭제">×</button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ─── 수면 영향 ─── */}
      <div className={s.sleepCard}>
        <div className={s.cardLabel}>😴 수면 영향 예측</div>

        <div className={s.bedtimeRow}>
          <label className={s.subLabel}>목표 취침 시각</label>
          <input
            type="time"
            className={s.bedtimeInput}
            value={bedtime}
            onChange={e => setBedtime(e.target.value)}
          />
        </div>

        {bedtimeMs !== null && sleepImpact && (
          <>
            <div className={s.sleepResult}>
              <div className={s.sleepLeft}>
                <div className={s.sleepBigNum} style={{ color: sleepImpact.color }}>
                  {Math.round(bedtimeBodyMg)}<span>mg</span>
                </div>
                <div className={s.sleepLabel}>취침 시 잔존 카페인</div>
              </div>
              <div className={s.sleepStatus} style={{ color: sleepImpact.color, borderColor: `${sleepImpact.color}55` }}>
                {sleepImpact.label}
              </div>
            </div>

            {maxAddableForSafe && (
              <div className={s.addableBox}>
                <div className={s.addableTitle}>지금부터 추가로 마실 수 있는 한도 (취침까지)</div>
                <div className={s.addableGrid}>
                  <div className={s.addableItem}>
                    <span className={s.addableThresh}>💚 ~ 30mg 미만</span>
                    <span className={s.addableVal}>{Math.max(0, Math.round(maxAddableForSafe.safe30))}mg</span>
                  </div>
                  <div className={s.addableItem}>
                    <span className={s.addableThresh}>💙 ~ 50mg 미만</span>
                    <span className={s.addableVal}>{Math.max(0, Math.round(maxAddableForSafe.ok50))}mg</span>
                  </div>
                  <div className={s.addableItem}>
                    <span className={s.addableThresh}>🟡 ~ 100mg 미만</span>
                    <span className={s.addableVal}>{Math.max(0, Math.round(maxAddableForSafe.caution100))}mg</span>
                  </div>
                </div>
                <p className={s.addableNote}>
                  💡 100mg = 아메리카노 Tall 약 0.7잔 · 50mg = 콜라 1.4캔 · 30mg = 녹차 1잔
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── 시간별 곡선 ─── */}
      {entries.length > 0 && (
        <div className={s.chartCard}>
          <div className={s.cardLabel}>📈 시간별 체내 카페인 (6h 전 ~ 12h 후)</div>
          <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} preserveAspectRatio="xMidYMid meet">
            {/* 그리드 */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <line key={t} x1={PL} x2={W - PR} y1={PT + t * plotH} y2={PT + t * plotH}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            {/* Y축 */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <text key={t} x={PL - 6} y={PT + (1 - t) * plotH + 3}
                fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
                {Math.round(t * maxMg)}
              </text>
            ))}
            {/* X축 (시) */}
            {Array.from({ length: 7 }, (_, i) => {
              const t = chartData.startMs + (chartData.endMs - chartData.startMs) * (i / 6)
              return (
                <text key={i} x={xFromT(t)} y={H - PB + 14}
                  fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                  {fmtHM(t)}
                </text>
              )
            })}
            {/* 30·100·200mg 기준선 */}
            {[30, 100, 200].filter(t => t < maxMg).map(t => (
              <g key={t}>
                <line x1={PL} x2={W - PR} y1={yFromMg(t)} y2={yFromMg(t)}
                  stroke={t === 30 ? '#059669' : t === 100 ? '#D97706' : '#DC2626'}
                  strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
                <text x={W - PR - 4} y={yFromMg(t) - 3}
                  fill={t === 30 ? '#059669' : t === 100 ? '#D97706' : '#DC2626'}
                  fontSize="9" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{t}mg</text>
              </g>
            ))}
            {/* 영역·곡선 */}
            <path d={areaPath} fill="rgba(14,165,233,0.10)" />
            <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
            {/* 현재 시각 */}
            <line x1={nowX} x2={nowX} y1={PT} y2={H - PB}
              stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="2 3" />
            <circle cx={nowX} cy={yFromMg(currentBodyMg)} r="4" fill="var(--accent)" stroke="#000" strokeWidth="1.5" />
            <text x={nowX} y={PT - 4} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">지금</text>
            {/* 취침 시각 */}
            {bedX !== null && (
              <>
                <line x1={bedX} x2={bedX} y1={PT} y2={H - PB}
                  stroke="#B885DA" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                <text x={bedX} y={PT - 4} fill="#B885DA" fontSize="10" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">취침</text>
              </>
            )}
          </svg>
          <div className={s.chartLegend}>
            <span><span className={s.dot} style={{ background: 'var(--accent)' }} />체내 카페인</span>
            <span><span className={s.dot} style={{ background: '#059669' }} />수면 안전 (30mg)</span>
            <span><span className={s.dot} style={{ background: '#D97706' }} />경고 (100mg)</span>
            <span><span className={s.dot} style={{ background: '#DC2626' }} />수면 차단 (200mg)</span>
          </div>
        </div>
      )}

      {/* ─── 팁 ─── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 카페인 잘 다루는 팁</div>
        <ul className={s.tipList}>
          <li><strong>마지막 커피는 취침 6~8시간 전</strong> — 잠들기 직전 마셔도 입면은 가능하지만 깊은 수면(N3)이 줄어 다음날 피로 ↑</li>
          <li><strong>오후 2시 이후 카페인 피하기</strong> — 일반 권장. 본인 반감기 길면 정오까지 컷</li>
          <li><strong>커피 빈 속에 마시면 흡수 빠름 + 위 자극</strong> — 식후 30분이 안정적</li>
          <li><strong>「내성」은 진짜 + 의존성 가능</strong> — 매일 같은 양이면 효과 ↓, 끊을 때 두통·피로 1~3일</li>
          <li><strong>물 같이 마시기</strong> — 카페인은 약한 이뇨 작용 (큰 영향 X지만 수분 보충 도움)</li>
          <li><strong>20분 카페인 낮잠</strong> — 마신 직후 짧은 낮잠 → 깨어날 때 카페인 효과 시작 (Coffee Nap)</li>
        </ul>
      </div>
    </div>
  )
}
