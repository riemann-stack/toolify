/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { todayStr } from '@/lib/date'
import { useEffect, useMemo, useState } from 'react'
import s from './interval-training.module.css'

// localStorage 키 (VDOT 자동 저장)
const STORAGE_KEY = 'youtil-interval-record-v1'

// 한국 인기 마라톤·러닝 대회
const KOREA_RACES: { name: string; month: number; distances: string }[] = [
  { name: '서울국제마라톤',  month: 3,  distances: '풀·하프·10km' },
  { name: '동아일보마라톤',  month: 3,  distances: '풀·하프' },
  { name: '대구국제마라톤',  month: 4,  distances: '풀·하프' },
  { name: '서울하프마라톤',  month: 5,  distances: '하프·10km' },
  { name: '춘천마라톤',      month: 10, distances: '풀·하프' },
  { name: 'JTBC서울마라톤',  month: 11, distances: '풀·하프·10km' },
]

function weeksUntilMonth(targetMonth: number): number {
  const now = new Date()
  const year = now.getMonth() + 1 < targetMonth ? now.getFullYear() : now.getFullYear() + 1
  const target = new Date(year, targetMonth - 1, 15)  // 대회 평균 중순
  const diffMs = target.getTime() - now.getTime()
  return Math.max(4, Math.min(16, Math.round(diffMs / (7 * 86400000))))
}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const n = (v: string | number, d = 0): number => {
  const x = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v
  return Number.isFinite(x) ? x : d
}
const pad = (v: number) => v.toString().padStart(2, '0')
const fmtMS = (totalSec: number): string => {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '-:--'
  const m = Math.floor(totalSec / 60)
  const s = Math.round(totalSec - m * 60)
  return `${m}:${pad(s)}`
}
const fmtHMS = (totalSec: number): string => {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '-:--:--'
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec - h * 3600) / 60)
  const s = Math.round(totalSec - h * 3600 - m * 60)
  return `${h}:${pad(m)}:${pad(s)}`
}
const toSec = (m: number, sec: number, h = 0) => h * 3600 + m * 60 + sec

// ─────────────────────────────────────────────
// VDOT 계산 (Daniels formula)
// ─────────────────────────────────────────────
function calcVDOT(timeSec: number, distanceM: number): number {
  if (timeSec <= 0 || distanceM <= 0) return 0
  const t = timeSec / 60
  const v = distanceM / t
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t)
  const VO2 = -4.60 + 0.182258 * v + 0.000104 * v * v
  return VO2 / pct
}

// VDOT별 강도 페이스 (sec/km) — Jack Daniels Running Formula
const VDOT_PACES: Record<number, { E: number; M: number; T: number; I: number; R: number }> = {
  35: { E: 430, M: 367, T: 350, I: 310, R: 290 },
  40: { E: 390, M: 330, T: 307, I: 279, R: 245 },
  45: { E: 355, M: 300, T: 280, I: 253, R: 225 },
  50: { E: 325, M: 279, T: 260, I: 235, R: 210 },
  55: { E: 300, M: 260, T: 244, I: 220, R: 195 },
  60: { E: 279, M: 244, T: 229, I: 207, R: 184 },
  65: { E: 260, M: 230, T: 216, I: 195, R: 175 },
  70: { E: 244, M: 220, T: 205, I: 185, R: 166 },
}

type Intensity = 'E' | 'M' | 'T' | 'I' | 'R'

function getPace(vdot: number, intensity: Intensity): number {
  const keys = Object.keys(VDOT_PACES).map(Number).sort((a, b) => a - b)
  if (vdot <= keys[0]) return VDOT_PACES[keys[0]][intensity]
  if (vdot >= keys[keys.length - 1]) return VDOT_PACES[keys[keys.length - 1]][intensity]
  for (let i = 0; i < keys.length - 1; i++) {
    const lo = keys[i], hi = keys[i + 1]
    if (vdot >= lo && vdot <= hi) {
      const t = (vdot - lo) / (hi - lo)
      const a = VDOT_PACES[lo][intensity]
      const b = VDOT_PACES[hi][intensity]
      return a + (b - a) * t
    }
  }
  return VDOT_PACES[keys[keys.length - 1]][intensity]
}

// 훈련 목적 → VDOT 강도 매핑
const GOAL_INTENSITY: Record<'speed' | '5k' | '10k' | 'half' | 'marathon', Intensity> = {
  speed: 'R',
  '5k':  'I',
  '10k': 'I',
  half:  'T',
  marathon: 'I',
}

const GOALS: { key: 'speed' | '5k' | '10k' | 'half' | 'marathon'; icon: string; label: string; intensity: string; cls: string }[] = [
  { key: 'speed',    icon: '🚀', label: '스피드',  intensity: 'R', cls: s.goalSpeed },
  { key: '5k',       icon: '🎯', label: '5km',     intensity: 'I', cls: s.goal5k },
  { key: '10k',      icon: '🎯', label: '10km',    intensity: 'I', cls: s.goal10k },
  { key: 'half',     icon: '🏃',  label: '하프',    intensity: 'T', cls: s.goalHalf },
  { key: 'marathon', icon: '🏁', label: '풀코스',  intensity: 'I', cls: s.goalMar },
]

const INTERVAL_DISTANCES = [200, 400, 600, 800, 1000, 1200, 1600]
const STANDARD_DISTANCES = new Set([400, 800, 1000])

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function IntervalTrainingClient() {
  const [tab, setTab] = useState<'pace' | 'yasso' | 'schedule'>('pace')

  // ── TAB 1 STATE ─────────────────────────────
  const [inputMode, setInputMode] = useState<'record' | 'target'>('record')
  const [recordType, setRecordType] = useState<'5k' | '10k' | 'half'>('5k')
  // 5km 기록
  const [r5min, setR5min] = useState<string>('22')
  const [r5sec, setR5sec] = useState<string>('30')
  // 10km
  const [r10min, setR10min] = useState<string>('48')
  const [r10sec, setR10sec] = useState<string>('00')
  // half
  const [rHh, setRHh] = useState<string>('1')
  const [rHmin, setRHmin] = useState<string>('45')
  const [rHsec, setRHsec] = useState<string>('00')

  // 직접 페이스
  const [targetMin, setTargetMin] = useState<string>('4')
  const [targetSec, setTargetSec] = useState<string>('30')

  const [goal, setGoal] = useState<'speed' | '5k' | '10k' | 'half' | 'marathon'>('5k')
  const [selectedDistances, setSelectedDistances] = useState<Set<number>>(new Set([400, 800, 1000]))

  // ── TAB 2 STATE ─────────────────────────────
  const [yassoMode, setYassoMode] = useState<'A' | 'B'>('A')
  const [yMin, setYMin] = useState<string>('3')
  const [yYsec, setYYsec] = useState<string>('30')
  const [yReps, setYReps] = useState<number>(8)
  const [yRecMin, setYRecMin] = useState<string>('3')
  const [yRecSec, setYRecSec] = useState<string>('30')
  const [splitsRaw, setSplitsRaw] = useState<string[]>(Array(12).fill(''))
  const [showSplits, setShowSplits] = useState<boolean>(false)
  // 모드 B
  const [tgH, setTgH] = useState<string>('3')
  const [tgM, setTgM] = useState<string>('30')

  // ── TAB 3 STATE ─────────────────────────────
  const [weeklyKm, setWeeklyKm] = useState<number>(40)
  const [schedRaceType, setSchedRaceType] = useState<'5k' | '10k' | 'half' | 'marathon'>('10k')
  const [schedRecord, setSchedRecord] = useState<{ min: string; sec: string }>({ min: '48', sec: '00' })
  const [weeksLeft, setWeeksLeft] = useState<number>(8)
  const [experience, setExperience] = useState<'none' | 'some' | 'regular'>('some')
  const [trackOk, setTrackOk] = useState<boolean>(true)
  const [injuryHistory, setInjuryHistory] = useState<boolean>(false)
  const [intervalsPerWeek, setIntervalsPerWeek] = useState<1 | 2>(1)

  // ── COPY STATE ─────────────────────────────
  const [copiedKey, setCopiedKey] = useState<string>('')
  const [resultCopied, setResultCopied] = useState<boolean>(false)

  // ── 추천 인터벌 세션 (거리·횟수 직접 선택) ──
  const [customDist, setCustomDist] = useState<number>(800)
  const [customReps, setCustomReps] = useState<number>(8)

  // ── localStorage 자동 저장 ──
  const [hydrated, setHydrated] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.r5min) setR5min(data.r5min)
        if (data.r5sec) setR5sec(data.r5sec)
        if (data.r10min) setR10min(data.r10min)
        if (data.r10sec) setR10sec(data.r10sec)
        if (data.rHh)   setRHh(data.rHh)
        if (data.rHmin) setRHmin(data.rHmin)
        if (data.rHsec) setRHsec(data.rHsec)
        if (data.recordType) setRecordType(data.recordType)
        if (data.weeklyKm) setWeeklyKm(data.weeklyKm)
        if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const data = {
        r5min, r5sec, r10min, r10sec, rHh, rHmin, rHsec, recordType, weeklyKm,
        lastSavedAt: todayStr(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [hydrated, r5min, r5sec, r10min, r10sec, rHh, rHmin, rHsec, recordType, weeklyKm])

  // ─────────────────────────────────────────────
  // VDOT 계산
  // ─────────────────────────────────────────────
  const vdotInfo = useMemo(() => {
    if (inputMode === 'target') {
      // 직접 입력 페이스 → 가상 VDOT (5km 기록으로 환산)
      const paceSec = toSec(n(targetMin, 0), n(targetSec, 0))
      if (paceSec <= 0) return { vdot: 0, baseTime: 0, baseDist: 5000, paceFromInput: 0 }
      const fakeFiveK = paceSec * 5
      return { vdot: calcVDOT(fakeFiveK, 5000), baseTime: paceSec, baseDist: 5000, paceFromInput: paceSec }
    }
    let timeSec = 0
    let distM = 5000
    if (recordType === '5k') {
      timeSec = toSec(n(r5min, 0), n(r5sec, 0))
      distM = 5000
    } else if (recordType === '10k') {
      timeSec = toSec(n(r10min, 0), n(r10sec, 0))
      distM = 10000
    } else {
      timeSec = toSec(n(rHmin, 0), n(rHsec, 0), n(rHh, 0))
      distM = 21097.5
    }
    return { vdot: calcVDOT(timeSec, distM), baseTime: timeSec, baseDist: distM, paceFromInput: 0 }
  }, [inputMode, recordType, r5min, r5sec, r10min, r10sec, rHh, rHmin, rHsec, targetMin, targetSec])

  // ─────────────────────────────────────────────
  // 인터벌 페이스 계산 (목적별 강도 적용)
  // ─────────────────────────────────────────────
  const intervalPaceSec = useMemo(() => {
    if (vdotInfo.vdot <= 0) return 0
    if (inputMode === 'target') return vdotInfo.paceFromInput
    const intensity: Intensity = GOAL_INTENSITY[goal]
    let pace = getPace(vdotInfo.vdot, intensity)
    // 10km 기록 향상: I 페이스보다 약간 느림 (+5초)
    if (goal === '10k') pace += 5
    // 마라톤: I + M 혼합 (M에 가깝게 -10초 빠르게 = I 페이스 유지)
    return pace
  }, [vdotInfo, goal, inputMode])

  // ─────────────────────────────────────────────
  // 거리별 랩타임
  // ─────────────────────────────────────────────
  const lapRows = useMemo(() => {
    return INTERVAL_DISTANCES.filter(d => selectedDistances.has(d)).map(d => ({
      distance: d,
      lapSec: (intervalPaceSec * d) / 1000,
      laps: d / 400,
    }))
  }, [intervalPaceSec, selectedDistances])

  // ─────────────────────────────────────────────
  // 야소 800
  // ─────────────────────────────────────────────
  type YassoResult =
    | {
        mode: 'A'
        predictSec: number
        avg800: number
        reliability: 'low' | 'mid' | 'high'
        variation: number
        firstHalfAvg: number
        secondHalfAvg: number
        decline: number
        hasSplits: boolean
      }
    | { mode: 'B'; targetSecHr: number; yassoSec: number }

  const yassoCalc: YassoResult = useMemo<YassoResult>(() => {
    if (yassoMode === 'A') {
      const avg = toSec(n(yMin, 0), n(yYsec, 0))
      // 800m 시간(분:초) → 풀코스 시간(시:분) — 3:30/800m → 3:30:00
      const m = Math.floor(avg / 60)
      const s = Math.round(avg - m * 60)
      const predictSec = m * 3600 + s * 60
      // 신뢰도
      const validSplits = splitsRaw.slice(0, yReps).filter(v => v.trim() !== '')
      let variation = 0
      let firstHalfAvg = 0
      let secondHalfAvg = 0
      if (showSplits && validSplits.length === yReps && yReps >= 4) {
        const sec: number[] = validSplits.map(parseSplitToSec).filter((v): v is number => v > 0)
        if (sec.length === yReps) {
          const max = Math.max(...sec)
          const min = Math.min(...sec)
          variation = max - min
          const half = Math.floor(yReps / 2)
          firstHalfAvg = sec.slice(0, half).reduce<number>((a, b) => a + b, 0) / half
          secondHalfAvg = sec.slice(yReps - half).reduce<number>((a, b) => a + b, 0) / half
        }
      }
      let reliability: 'low' | 'mid' | 'high' = 'low'
      if (yReps >= 10 && variation < 5) reliability = 'high'
      else if (yReps >= 6 && (variation < 10 || !showSplits)) reliability = 'mid'
      return {
        mode: 'A',
        predictSec,
        avg800: avg,
        reliability,
        variation,
        firstHalfAvg,
        secondHalfAvg,
        decline: secondHalfAvg - firstHalfAvg,
        hasSplits: showSplits && validSplits.length === yReps,
      }
    }
    // 모드 B: 목표 풀코스 → 야소 800 페이스
    const targetSecHr = n(tgH, 0) * 3600 + n(tgM, 0) * 60
    // 풀코스 X시간 Y분 → 야소 800: X분 Y초
    const yassoSec = n(tgH, 0) * 60 + n(tgM, 0)
    return { mode: 'B', targetSecHr, yassoSec }
  }, [yassoMode, yMin, yYsec, yReps, splitsRaw, showSplits, tgH, tgM])

  // ─────────────────────────────────────────────
  // 훈련 스케줄 생성
  // ─────────────────────────────────────────────
  const schedule = useMemo(() => {
    const recordSec = toSec(n(schedRecord.min, 0), n(schedRecord.sec, 0))
    const dist = schedRaceType === '5k' ? 5000 : 10000
    const vdot = calcVDOT(recordSec, dist)
    const intensity: Intensity = schedRaceType === 'half' ? 'T' : schedRaceType === 'marathon' ? 'I' : 'I'
    const basePace = vdot > 0 ? getPace(vdot, intensity) : 0
    // 부상 이력 시 강도 -10% (페이스 +10%)
    const finalPace = injuryHistory ? basePace * 1.1 : basePace

    type Menu = { name: string; goal: string; recovery: string; dist: number; reps: number }
    const menuPool: Record<typeof schedRaceType, Menu[]> = {
      '5k': [
        { name: '400m × 6회',  goal: '스피드',     recovery: '200m 조깅', dist: 400, reps: 6 },
        { name: '600m × 5회',  goal: '5km 페이스', recovery: '300m 조깅', dist: 600, reps: 5 },
        { name: '800m × 5회',  goal: '5km 페이스', recovery: '400m 조깅', dist: 800, reps: 5 },
        { name: '1km × 4회',   goal: 'V̇O2',       recovery: '400m 조깅', dist: 1000, reps: 4 },
        { name: '400m × 8회',  goal: '스피드',     recovery: '200m 조깅', dist: 400, reps: 8 },
      ],
      '10k': [
        { name: '800m × 5회',  goal: '10km 페이스', recovery: '400m 조깅', dist: 800, reps: 5 },
        { name: '800m × 6회',  goal: '10km 페이스', recovery: '400m 조깅', dist: 800, reps: 6 },
        { name: '1km × 5회',   goal: '10km 페이스', recovery: '400m 조깅', dist: 1000, reps: 5 },
        { name: '1.6km × 3회', goal: '역치',        recovery: '600m 조깅', dist: 1600, reps: 3 },
        { name: '1.2km × 4회', goal: 'V̇O2',        recovery: '400m 조깅', dist: 1200, reps: 4 },
        { name: '1.6km × 4회', goal: '역치',        recovery: '600m 조깅', dist: 1600, reps: 4 },
      ],
      half: [
        { name: '1km × 6회',   goal: '역치',        recovery: '400m 조깅', dist: 1000, reps: 6 },
        { name: '1.6km × 4회', goal: '역치',        recovery: '600m 조깅', dist: 1600, reps: 4 },
        { name: '2km × 3회',   goal: '역치',        recovery: '600m 조깅', dist: 2000, reps: 3 },
        { name: '3km × 2회',   goal: '하프 페이스', recovery: '800m 조깅', dist: 3000, reps: 2 },
        { name: '1.6km × 5회', goal: '역치',        recovery: '600m 조깅', dist: 1600, reps: 5 },
      ],
      marathon: [
        { name: '800m × 6회 (야소)',   goal: '야소 800', recovery: '400m 조깅', dist: 800, reps: 6 },
        { name: '800m × 8회 (야소)',   goal: '야소 800', recovery: '400m 조깅', dist: 800, reps: 8 },
        { name: '800m × 10회 (야소)',  goal: '야소 800', recovery: '400m 조깅', dist: 800, reps: 10 },
        { name: '1.6km × 4회',         goal: '역치',     recovery: '800m 조깅', dist: 1600, reps: 4 },
        { name: '2km × 3회 (M 페이스)', goal: 'M 페이스', recovery: '600m 조깅', dist: 2000, reps: 3 },
      ],
    }
    const pool = menuPool[schedRaceType]
    const expIdxStart = experience === 'none' ? 0 : experience === 'some' ? 1 : 2

    const weeks: {
      week: number
      label: string
      menu1: Menu
      menu2: Menu | null
      phase: 'adapt' | 'develop' | 'recover' | 'peak' | 'taper'
    }[] = []

    for (let i = 0; i < weeksLeft; i++) {
      const w = i + 1
      const isLast = w === weeksLeft
      const isSecondLast = w === weeksLeft - 1
      const isRecover = (w % 4 === 0) && !isLast && !isSecondLast
      let phase: typeof weeks[number]['phase']
      let label: string
      let menuIdx: number
      let secondMenu: Menu | null = null

      if (isLast) {
        phase = 'taper'
        label = '테이퍼 · 대회 준비'
        menuIdx = 0
      } else if (isSecondLast) {
        phase = 'taper'
        label = '테이퍼 시작'
        menuIdx = Math.min(pool.length - 1, expIdxStart + 1)
      } else if (isRecover) {
        phase = 'recover'
        label = '회복주'
        menuIdx = 0
      } else if (w <= 2) {
        phase = 'adapt'
        label = '적응'
        menuIdx = expIdxStart + (w - 1)
      } else if (w <= weeksLeft - 3) {
        phase = w >= weeksLeft - 4 ? 'peak' : 'develop'
        label = phase === 'peak' ? '피크' : '발전'
        menuIdx = Math.min(pool.length - 1, expIdxStart + Math.floor((w - 1) / 2))
        if (intervalsPerWeek === 2 && w >= 3) {
          secondMenu = pool[Math.max(0, menuIdx - 1)]
        }
      } else {
        phase = 'peak'
        label = '피크'
        menuIdx = Math.min(pool.length - 1, expIdxStart + Math.floor((w - 1) / 2))
        if (intervalsPerWeek === 2) {
          secondMenu = pool[Math.max(0, menuIdx - 1)]
        }
      }

      const menu1 = pool[Math.min(pool.length - 1, menuIdx)]
      weeks.push({ week: w, label, menu1, menu2: secondMenu, phase })
    }
    return { weeks, vdot, finalPace }
  }, [schedRaceType, schedRecord, weeksLeft, experience, intervalsPerWeek, injuryHistory])

  // ─────────────────────────────────────────────
  // 헬퍼
  // ─────────────────────────────────────────────
  function toggleDist(d: number) {
    setSelectedDistances(prev => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  function parseSplitToSec(v: string): number {
    const s = v.trim()
    if (!s) return 0
    if (s.includes(':')) {
      const [m, sec] = s.split(':').map(Number)
      return m * 60 + (sec || 0)
    }
    return Number(s) || 0
  }

  async function copyLap(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(label)
      setTimeout(() => setCopiedKey(''), 1200)
    } catch {}
  }

  async function copyResult() {
    let text = ''
    if (tab === 'pace') {
      const vdotLabel = vdotInfo.vdot > 0 ? `VDOT ${vdotInfo.vdot.toFixed(1)}` : '-'
      const goalLabel = GOALS.find(g => g.key === goal)?.label
      text = [
        `[인터벌 페이스]`,
        `${vdotLabel} · ${goalLabel} 목적`,
        `1km 인터벌 페이스: ${fmtMS(intervalPaceSec)}/km`,
        ``,
        ...lapRows.map(r => `· ${r.distance}m: ${fmtMS(r.lapSec)} (${r.laps}바퀴)`),
        ``,
        `https://youtil.kr/tools/sports/interval-training`,
      ].join('\n')
    } else if (tab === 'yasso') {
      if (yassoCalc.mode === 'A') {
        text = [
          `[야소 800 풀코스 예측]`,
          `평균 800m: ${fmtMS(yassoCalc.avg800)} × ${yReps}회`,
          `예상 풀코스: ${fmtHMS(yassoCalc.predictSec)}`,
          `신뢰도: ${yassoCalc.reliability === 'high' ? '높음' : yassoCalc.reliability === 'mid' ? '보통' : '참고 수준'}`,
          ``,
          `https://youtil.kr/tools/sports/interval-training`,
        ].join('\n')
      } else {
        text = [
          `[야소 800 역산]`,
          `목표 풀코스: ${tgH}시간 ${tgM}분`,
          `필요 야소 800 페이스: ${fmtMS(yassoCalc.yassoSec)}/800m`,
          ``,
          `https://youtil.kr/tools/sports/interval-training`,
        ].join('\n')
      }
    } else {
      text = [
        `[인터벌 훈련 ${weeksLeft}주 스케줄]`,
        `목표: ${schedRaceType === '5k' ? '5km' : schedRaceType === '10k' ? '10km' : schedRaceType === 'half' ? '하프' : '풀코스'} · 주간 ${weeklyKm}km`,
        ``,
        ...schedule.weeks.map(w => `${w.week}주차 · ${w.menu1.name}${w.menu2 ? ' + ' + w.menu2.name : ''} (${w.label})`),
        ``,
        `https://youtil.kr/tools/sports/interval-training`,
      ].join('\n')
    }
    try {
      await navigator.clipboard.writeText(text)
      setResultCopied(true)
      setTimeout(() => setResultCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 예측' },
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' }
        ]}
      >
        참고용 훈련 가이드입니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'pace' ? s.tabActive : ''}`} onClick={() => setTab('pace')}>
          인터벌 페이스
        </button>
        <button className={`${s.tabBtn} ${tab === 'yasso' ? s.tabActive : ''}`} onClick={() => setTab('yasso')}>
          야소 800
        </button>
        <button className={`${s.tabBtn} ${tab === 'schedule' ? s.tabActive : ''}`} onClick={() => setTab('schedule')}>
          훈련 스케줄
        </button>
      </div>

      {/* ──────────── TAB 1 ──────────── */}
      {tab === 'pace' && (
        <>
          {/* 입력 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>기록 입력</span>
              <span className={s.cardLabelHint}>VDOT 자동 계산</span>
            </div>
            <div className={s.modeToggle}>
              <button className={`${s.modeBtn} ${s.modeRecord} ${inputMode === 'record' ? s.modeActive : ''}`} onClick={() => setInputMode('record')}>📊 최근 기록</button>
              <button className={`${s.modeBtn} ${s.modeTarget} ${inputMode === 'target' ? s.modeActive : ''}`} onClick={() => setInputMode('target')}>🎯 목표 기록</button>
            </div>

            {inputMode === 'record' && (
              <>
                <p className={s.modeSubLabel}>현재 본인의 5km·10km·하프 기록을 입력하세요</p>
                <div className={s.recordTabs}>
                  <button className={`${s.recordTabBtn} ${recordType === '5k'   ? s.recordTabActive : ''}`} onClick={() => setRecordType('5k')}>5km</button>
                  <button className={`${s.recordTabBtn} ${recordType === '10k'  ? s.recordTabActive : ''}`} onClick={() => setRecordType('10k')}>10km</button>
                  <button className={`${s.recordTabBtn} ${recordType === 'half' ? s.recordTabActive : ''}`} onClick={() => setRecordType('half')}>하프</button>
                </div>
                {recordType === '5k' && (
                  <div className={s.timeInputRow}>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={r5min} onChange={e => setR5min(e.target.value)} />
                    <span className={s.timeColon}>:</span>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={r5sec} onChange={e => setR5sec(e.target.value)} />
                  </div>
                )}
                {recordType === '10k' && (
                  <div className={s.timeInputRow}>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={r10min} onChange={e => setR10min(e.target.value)} />
                    <span className={s.timeColon}>:</span>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={r10sec} onChange={e => setR10sec(e.target.value)} />
                  </div>
                )}
                {recordType === 'half' && (
                  <div className={s.timeInputRow3}>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={rHh} onChange={e => setRHh(e.target.value)} />
                    <span className={s.timeColon}>:</span>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={rHmin} onChange={e => setRHmin(e.target.value)} />
                    <span className={s.timeColon}>:</span>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={rHsec} onChange={e => setRHsec(e.target.value)} />
                  </div>
                )}
                {vdotInfo.vdot > 0 && (
                  <p className={s.vdotShow}>
                    VDOT ≈ {vdotInfo.vdot.toFixed(1)}
                    {lastSavedAt && (
                      <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11, marginLeft: 8 }}>
                        💾 마지막 저장: {lastSavedAt}
                      </span>
                    )}
                  </p>
                )}
              </>
            )}

            {inputMode === 'target' && (
              <>
                <p className={s.modeSubLabel}>달성하고 싶은 목표 1km 페이스를 입력하세요 (대회 목표 등)</p>
                <span className={s.subLabel}>목표 1km 페이스 (분 : 초)</span>
                <div className={s.timeInputRow}>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={targetMin} onChange={e => setTargetMin(e.target.value)} />
                  <span className={s.timeColon}>:</span>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={targetSec} onChange={e => setTargetSec(e.target.value)} />
                </div>
              </>
            )}
          </div>

          {/* 훈련 목적 */}
          {inputMode === 'record' && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>훈련 목적</span>
                <span className={s.cardLabelHint}>VDOT 강도 자동 적용</span>
              </div>
              <div className={s.goalGrid}>
                {GOALS.map(g => (
                  <button
                    key={g.key}
                    className={`${s.goalBtn} ${g.cls} ${goal === g.key ? s.goalActive : ''}`}
                    onClick={() => setGoal(g.key)}
                    type="button"
                  >
                    {goal === g.key && <span className={s.goalCheck}>✓</span>}
                    <span className={s.goalIcon}>{g.icon}</span>
                    <span className={s.goalLabel}>{g.label}</span>
                    <span className={s.goalIntensity}>{g.intensity} 페이스</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 인터벌 거리 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>인터벌 거리 (복수 선택)</span>
              <span className={s.cardLabelHint}>800m = 야소 800</span>
            </div>
            <div className={s.distGrid}>
              {INTERVAL_DISTANCES.map(d => (
                <button
                  key={d}
                  className={`${s.distBtn} ${d === 800 ? s.dist800 : ''} ${selectedDistances.has(d) ? s.distActive : ''}`}
                  onClick={() => toggleDist(d)}
                  type="button"
                >
                  {d === 1600 ? '1.6km' : d >= 1000 ? `${d / 1000}km` : `${d}m`}
                  {d === 800 && <span className={s.distYassoBadge}>야소</span>}
                </button>
              ))}
            </div>
          </div>

          {/* HERO */}
          <div role="status">
            {intervalPaceSec > 0 && (
              <div className={s.hero}>
                <p className={s.heroLead}>인터벌 페이스</p>
                <div>
                  <span className={s.heroNum}>{fmtMS(intervalPaceSec)}</span>
                  <span className={s.heroUnit}>/km</span>
                </div>
                <p className={s.heroSub}>
                  {inputMode === 'record' && vdotInfo.vdot > 0 && (
                    <>VDOT <span className={s.heroSubAccent}>{vdotInfo.vdot.toFixed(1)}</span> 러너 · </>
                  )}
                  {GOALS.find(g => g.key === goal)?.label} 목적 ·
                  {' '}<span className={s.heroSubAccent}>{GOAL_INTENSITY[goal]} 페이스</span>
                </p>
              </div>
            )}
          </div>

          {/* 거리별 랩타임 */}
          {lapRows.length > 0 && intervalPaceSec > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>거리별 랩타임</span>
                <span className={s.cardLabelHint}>트랙 1바퀴 = 400m</span>
              </div>
              <table className={s.lapTable}>
                <thead>
                  <tr>
                    <th>거리</th>
                    <th>랩타임</th>
                    <th>1바퀴(400m)</th>
                    <th>트랙</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lapRows.map(r => {
                    const label = `${r.distance}m`
                    const time = fmtMS(r.lapSec)
                    // 1바퀴(400m) 페이스
                    const lapTime400 = (r.lapSec * 400) / r.distance
                    const min400 = Math.floor(lapTime400 / 60)
                    const sec400 = lapTime400 - min400 * 60
                    const lap400Str = `${min400}:${sec400.toFixed(1).padStart(4, '0')}`
                    return (
                      <tr key={r.distance} className={STANDARD_DISTANCES.has(r.distance) ? s.standardRow : ''}>
                        <td>{r.distance >= 1000 ? `${r.distance / 1000}km` : `${r.distance}m`}</td>
                        <td>{time}</td>
                        <td style={{ color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{lap400Str}</td>
                        <td>{r.laps}바퀴</td>
                        <td>
                          <button
                            className={`${s.lapCopyBtn} ${copiedKey === label ? s.copied : ''}`}
                            onClick={() => copyLap(label, time)}
                            type="button"
                          >
                            {copiedKey === label ? '✓' : '복사'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className={s.lapHint}>
                💡 <strong>1바퀴(400m) 페이스 일정성</strong>이 인터벌 효과 ★. 첫 바퀴 너무 빠르면 후반 무너짐. GPS 시계로 200m·400m별 페이스 확인 권장.
              </p>
            </div>
          )}

          {/* 추천 인터벌 세션 — 거리·횟수 직접 선택 */}
          {intervalPaceSec > 0 && (
            <div className={s.recoCard}>
              <p className={s.recoTitle}>🎯 추천 인터벌 세션</p>
              <p className={s.recoSubLabel}>인터벌 거리와 반복 횟수를 고르면 워밍업~쿨다운 전체 세션을 정리해 드려요</p>

              <div className={s.customGrid}>
                <div>
                  <span className={s.subLabel}>인터벌 거리</span>
                  <div className={s.customDistGrid}>
                    {[200, 400, 600, 800, 1000, 1200, 1600, 2000].map(d => (
                      <button key={d} type="button"
                        className={`${s.customDistBtn} ${customDist === d ? s.customDistBtnActive : ''}`}
                        onClick={() => setCustomDist(d)}>
                        {d >= 1000 ? `${d / 1000}km` : `${d}m`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={s.subLabel}>반복 횟수: {customReps}회</span>
                  <div className={s.sliderRow}>
                    <input type="range" min={1} max={12} value={customReps}
                      onChange={e => setCustomReps(Number(e.target.value))} />
                    <span className={s.sliderValue}>{customReps}회</span>
                  </div>
                </div>
              </div>

              {(() => {
                const lapSec = (intervalPaceSec * customDist) / 1000
                const distLabel = customDist >= 1000 ? `${customDist / 1000}km` : `${customDist}m`
                const paceKm = fmtMS(intervalPaceSec)
                const recoveryDist = customDist <= 400 ? 200 : customDist <= 1200 ? 400 : 600
                const recoverySec = customDist <= 400 ? 75 : customDist <= 1200 ? 150 : 200
                const recoveryReps = Math.max(0, customReps - 1)
                const intensityLabel = customDist <= 400 ? '🔴 R · 스피드 (반복주)'
                  : customDist <= 1200 ? '🟡 I · V̇O₂max (인터벌)'
                  : '🔵 T · 역치 (템포)'
                const warmupSec = 9 * 60   // 1.5km 가벼운 조깅
                const cooldownSec = 9 * 60
                const totalSec = lapSec * customReps + recoverySec * recoveryReps + warmupSec + cooldownSec
                const fastKm = (customDist * customReps) / 1000
                return (
                  <div className={s.sessionPlan}>
                    <div className={s.sessionRow}>
                      <span className={s.sessionStage}>워밍업</span>
                      <span className={s.sessionDetail}>1.5km 가벼운 조깅 + 동적 스트레칭</span>
                    </div>
                    <div className={`${s.sessionRow} ${s.sessionRowMain}`}>
                      <span className={s.sessionStage}>러닝 (빠르게)</span>
                      <span className={s.sessionDetail}>
                        <strong>{distLabel}</strong>
                        <span className={s.sessionSep}>×</span>
                        <strong>{customReps}회</strong>
                        <span className={s.sessionPace}>{paceKm}/km</span>
                      </span>
                    </div>
                    {recoveryReps > 0 && (
                      <div className={s.sessionRow}>
                        <span className={s.sessionStage}>회복 (조깅)</span>
                        <span className={s.sessionDetail}>
                          <strong>{recoveryDist}m</strong>
                          <span className={s.sessionSep}>×</span>
                          <strong>{recoveryReps}회</strong>
                          <span className={s.sessionPaceMuted}>천천히 ({fmtMS(recoverySec)})</span>
                        </span>
                      </div>
                    )}
                    <div className={s.sessionRow}>
                      <span className={s.sessionStage}>쿨다운</span>
                      <span className={s.sessionDetail}>1.5km 가벼운 조깅 + 정적 스트레칭</span>
                    </div>
                    <div className={s.sessionDivider} />
                    <div className={s.sessionRow}>
                      <span className={s.sessionStage}>총 빠른 거리</span>
                      <span className={s.sessionDetail}><strong>{fastKm.toFixed(1)}km</strong></span>
                    </div>
                    <div className={s.sessionRow}>
                      <span className={s.sessionStage}>예상 소요 시간</span>
                      <span className={s.sessionDetail}><strong>약 {Math.round(totalSec / 60)}분</strong></span>
                    </div>
                    <div className={s.sessionRow}>
                      <span className={s.sessionStage}>강도</span>
                      <span className={s.sessionDetail}>{intensityLabel}</span>
                    </div>
                  </div>
                )
              })()}
              <p className={s.recoHint}>
                💡 초보는 위 횟수의 50~70%부터, 컨디션이 좋으면 1~2회 추가. 회복 조깅을 너무 빠르게 하면 다음 구간이 무너집니다.
              </p>
            </div>
          )}

          {/* 회복 가이드 */}
          {intervalPaceSec > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>회복 시간·거리 가이드</span>
                <span className={s.cardLabelHint}>강도 ↑ → 회복 ↑</span>
              </div>
              <table className={s.recoveryTable}>
                <thead>
                  <tr>
                    <th>강도</th>
                    <th>회복 시간</th>
                    <th>회복 거리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>R 페이스</td><td>운동 시간의 1.5~2배</td><td>운동 거리의 1배</td></tr>
                  <tr><td>I 페이스</td><td>운동 시간과 동일</td><td>운동 거리의 50%</td></tr>
                  <tr><td>T 페이스</td><td>운동 시간의 25~50%</td><td>운동 거리의 25%</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 과훈련 경고 */}
          <div className={s.warnCard}>
            <p className={s.warnTitle}>⚠️ 안전한 인터벌 훈련을 위해</p>
            <ul className={s.warnList}>
              <li>주간 거리의 10~15% 이상을 고강도로 X</li>
              <li>인터벌은 보통 주 1~2회까지 (초보 주 1회)</li>
              <li>전날 장거리주·고강도 후에는 피하기</li>
              <li>통증·이상 증상 시 즉시 중단</li>
              <li>부상 이력 있다면 단계적 진행 권장</li>
            </ul>
          </div>

          {intervalPaceSec > 0 && (
            <button className={`${s.copyBtn} ${resultCopied ? s.copied : ''}`} onClick={copyResult}>
              {resultCopied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 야소 800 ──────────── */}
      {tab === 'yasso' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>야소 800 모드</span>
              <span className={s.cardLabelHint}>기록 → 예측 / 목표 → 페이스 역산</span>
            </div>
            <div className={s.modeToggle}>
              <button className={`${s.modeBtn} ${s.modeRecord} ${yassoMode === 'A' ? s.modeActive : ''}`} onClick={() => setYassoMode('A')}>A. 800m 기록 → 풀코스 예측</button>
              <button className={`${s.modeBtn} ${s.modeTarget} ${yassoMode === 'B' ? s.modeActive : ''}`} onClick={() => setYassoMode('B')}>B. 목표 풀코스 → 야소 페이스</button>
            </div>

            {yassoMode === 'A' && (
              <>
                <span className={s.subLabel}>800m 평균 기록 (분 : 초)</span>
                <div className={s.timeInputRow}>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={yMin} onChange={e => setYMin(e.target.value)} />
                  <span className={s.timeColon}>:</span>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={yYsec} onChange={e => setYYsec(e.target.value)} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className={s.subLabel}>반복 횟수: {yReps}회</span>
                  <div className={s.sliderRow}>
                    <input type="range" min={1} max={12} value={yReps} onChange={e => setYReps(Number(e.target.value))} />
                    <span className={s.sliderValue}>{yReps}회</span>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className={s.subLabel}>회복 시간 (선택)</span>
                  <div className={s.timeInputRow}>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={yRecMin} onChange={e => setYRecMin(e.target.value)} />
                    <span className={s.timeColon}>:</span>
                    <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={yRecSec} onChange={e => setYRecSec(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showSplits} onChange={e => setShowSplits(e.target.checked)} />
                    회별 기록 입력 (후반 저하 분석)
                  </label>
                  {showSplits && (
                    <div style={{ marginTop: 10 }}>
                      <span className={s.subLabel}>각 회 기록 (분:초 또는 초)</span>
                      <div className={s.splitsRow}>
                        {Array.from({ length: yReps }, (_, i) => (
                          <input
                            key={i}
                            className={s.splitInput}
                            type="text"
                            placeholder={`#${i + 1}`}
                            value={splitsRaw[i] ?? ''}
                            onChange={e => {
                              const next = [...splitsRaw]
                              next[i] = e.target.value
                              setSplitsRaw(next)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {yassoMode === 'B' && (
              <>
                <span className={s.subLabel}>목표 풀코스 기록 (시 : 분)</span>
                <div className={s.timeInputRow}>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={tgH} onChange={e => setTgH(e.target.value)} />
                  <span className={s.timeColon}>:</span>
                  <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={tgM} onChange={e => setTgM(e.target.value)} />
                </div>
              </>
            )}
          </div>

          {/* HERO */}
          {yassoCalc.mode === 'A' && yassoCalc.avg800 > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>야소 800 풀코스 예측</p>
              <div>
                <span className={s.heroNum}>{fmtHMS(yassoCalc.predictSec)}</span>
              </div>
              <p className={s.heroSub}>
                평균 800m <span className={s.heroSubAccent}>{fmtMS(yassoCalc.avg800)}</span> × {yReps}회
              </p>
              <span className={`${s.relBadge} ${yassoCalc.reliability === 'high' ? s.relHigh : yassoCalc.reliability === 'mid' ? s.relMid : s.relLow}`}>
                {yassoCalc.reliability === 'high' ? '🌟 높은 신뢰도' : yassoCalc.reliability === 'mid' ? '✅ 일반적 신뢰도' : '🔶 참고 수준 (안정성 부족)'}
              </span>
            </div>
          )}

          {yassoCalc.mode === 'B' && yassoCalc.yassoSec > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>필요 야소 800 페이스</p>
              <div>
                <span className={s.heroNum}>{fmtMS(yassoCalc.yassoSec)}</span>
                <span className={s.heroUnit}>/800m</span>
              </div>
              <p className={s.heroSub}>
                목표 풀코스 <span className={s.heroSubAccent}>{tgH}:{pad(n(tgM, 0))}:00</span> 기준
              </p>
            </div>
          )}

          {/* 후반 저하 분석 */}
          {yassoCalc.mode === 'A' && yassoCalc.hasSplits && yassoCalc.firstHalfAvg > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>후반 저하 분석</span>
                <span className={s.cardLabelHint}>전반 vs 후반 평균</span>
              </div>
              <table className={s.recoveryTable}>
                <thead>
                  <tr>
                    <th>구간</th>
                    <th>평균 800m</th>
                    <th>차이</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>전반</td>
                    <td>{fmtMS(yassoCalc.firstHalfAvg)}</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>후반</td>
                    <td>{fmtMS(yassoCalc.secondHalfAvg)}</td>
                    <td style={{ color: yassoCalc.decline < 5 ? '#059669' : yassoCalc.decline < 10 ? '#A16207' : '#DC2626' }}>
                      {yassoCalc.decline > 0 ? '+' : ''}{yassoCalc.decline.toFixed(1)}초
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                ※ 후반 저하 <strong style={{ color: 'var(--text)' }}>5초 미만 양호</strong>, 10초 이상은 지구력 부족 가능성
              </p>
            </div>
          )}

          {/* 야소 800 안내 카드 */}
          <div className={s.yassoNote}>
            <p className={s.yassoNoteTitle}>⚠️ 야소 800은 풀코스 기록을 보장하는 공식이 아닙니다</p>
            <div className={s.yassoNoteText}>
              실제 풀코스 기록은 다음에 크게 좌우됩니다:
              <ul>
                <li>주간 누적 거리 (60km 이상 권장)</li>
                <li>장거리주 (30km 이상 1~2회)</li>
                <li>마라톤 페이스 지속주</li>
                <li>보급 전략·날씨·코스</li>
                <li>후반 페이스 유지력</li>
              </ul>
              <p style={{ marginTop: 10, color: 'var(--text)', fontWeight: 600 }}>
                야소 800은 <strong style={{ color: '#EA580C' }}>스피드 능력 지표</strong>이며, 지구력 평가는 별도 필요합니다.
              </p>
            </div>
          </div>

          {/* 모드 B 단계적 추천 */}
          {yassoCalc.mode === 'B' && yassoCalc.yassoSec > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>야소 800 단계적 진행 (8주 추천)</span>
              </div>
              <table className={s.yassoTable}>
                <thead>
                  <tr><th>주차</th><th>메뉴</th><th>비고</th></tr>
                </thead>
                <tbody>
                  {[
                    { w: '1주차', m: '800m × 4회',           note: '시작' },
                    { w: '2주차', m: '800m × 5회',           note: '적응' },
                    { w: '3주차', m: '800m × 6회',           note: '발전' },
                    { w: '4주차', m: '800m × 6회 (회복주)',  note: '회복' },
                    { w: '5주차', m: '800m × 7회',           note: '강도 ↑' },
                    { w: '6주차', m: '800m × 8회',           note: '강도 ↑' },
                    { w: '7주차', m: '800m × 9회',           note: '피크' },
                    { w: '8주차', m: '800m × 10회',          note: '최종 평가' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r.w}</td>
                      <td>{r.m}</td>
                      <td>{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                목표 페이스: <strong style={{ color: '#A16207', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{fmtMS(yassoCalc.yassoSec)}/800m</strong>, 회복 400m 조깅 (2:30 이내)
              </p>
            </div>
          )}

          <button className={`${s.copyBtn} ${resultCopied ? s.copied : ''}`} onClick={copyResult}>
            {resultCopied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ──────────── TAB 3: 훈련 스케줄 ──────────── */}
      {tab === 'schedule' && (
        <>
          {/* 한국 인기 대회 빠른 입력 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>📌 한국 인기 대회 빠른 선택</span>
              <span className={s.cardLabelHint}>대회까지 남은 주 자동 계산</span>
            </div>
            <div className={s.raceGrid}>
              {KOREA_RACES.map(race => {
                const w = weeksUntilMonth(race.month)
                return (
                  <button key={race.name} type="button"
                    className={s.raceBtn}
                    onClick={() => {
                      setWeeksLeft(w)
                      // 자동으로 풀 또는 하프 선택
                      if (race.distances.includes('풀')) setSchedRaceType('marathon')
                      else if (race.distances.includes('하프')) setSchedRaceType('half')
                      else setSchedRaceType('10k')
                    }}>
                    <span className={s.raceMonth}>{race.month}월</span>
                    <span className={s.raceName}>{race.name}</span>
                    <span className={s.raceMeta}>{race.distances} · D-{w * 7}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>현재 상태 입력</span>
            </div>
            <span className={s.subLabel}>주간 러닝 거리: {weeklyKm}km</span>
            <div className={s.sliderRow}>
              <input type="range" min={0} max={150} step={5} value={weeklyKm} onChange={e => setWeeklyKm(Number(e.target.value))} />
              <span className={s.sliderValue}>{weeklyKm}km</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>최근 기록</span>
              <div className={s.recordTabs}>
                <button className={`${s.recordTabBtn} ${schedRaceType === '5k'   ? s.recordTabActive : ''}`} onClick={() => { setSchedRaceType('5k'); setSchedRecord({ min: '22', sec: '30' }) }}>5km</button>
                <button className={`${s.recordTabBtn} ${schedRaceType === '10k'  ? s.recordTabActive : ''}`} onClick={() => { setSchedRaceType('10k'); setSchedRecord({ min: '48', sec: '00' }) }}>10km</button>
                <button className={`${s.recordTabBtn} ${schedRaceType === 'half' ? s.recordTabActive : ''}`} onClick={() => { setSchedRaceType('half'); setSchedRecord({ min: '105', sec: '00' }) }}>하프</button>
                <button className={`${s.recordTabBtn} ${schedRaceType === 'marathon' ? s.recordTabActive : ''}`} onClick={() => { setSchedRaceType('marathon'); setSchedRecord({ min: '210', sec: '00' }) }}>풀</button>
              </div>
              <div className={s.timeInputRow}>
                <input className={s.timeInput} type="number" inputMode="numeric" min="0" value={schedRecord.min} onChange={e => setSchedRecord(r => ({ ...r, min: e.target.value }))} />
                <span className={s.timeColon}>:</span>
                <input className={s.timeInput} type="number" inputMode="numeric" min="0" max="59" value={schedRecord.sec} onChange={e => setSchedRecord(r => ({ ...r, sec: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>대회까지 남은 주: {weeksLeft}주</span>
              <div className={s.sliderRow}>
                <input type="range" min={4} max={16} value={weeksLeft} onChange={e => setWeeksLeft(Number(e.target.value))} />
                <span className={s.sliderValue}>{weeksLeft}주</span>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>인터벌 경험</span>
              <div className={s.recordTabs}>
                <button className={`${s.recordTabBtn} ${experience === 'none'    ? s.recordTabActive : ''}`} onClick={() => setExperience('none')}>❌ 없음</button>
                <button className={`${s.recordTabBtn} ${experience === 'some'    ? s.recordTabActive : ''}`} onClick={() => setExperience('some')}>🌱 조금</button>
                <button className={`${s.recordTabBtn} ${experience === 'regular' ? s.recordTabActive : ''}`} onClick={() => setExperience('regular')}>💪 꾸준히</button>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={trackOk} onChange={e => setTrackOk(e.target.checked)} />
                트랙 이용 가능
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={injuryHistory} onChange={e => setInjuryHistory(e.target.checked)} />
                부상 이력 있음 (-10%)
              </label>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>주당 인터벌 횟수</span>
              <div className={s.modeToggle}>
                <button className={`${s.modeBtn} ${s.modeRecord} ${intervalsPerWeek === 1 ? s.modeActive : ''}`} onClick={() => setIntervalsPerWeek(1)}>주 1회 (안전)</button>
                <button className={`${s.modeBtn} ${s.modeTarget} ${intervalsPerWeek === 2 ? s.modeActive : ''}`} onClick={() => setIntervalsPerWeek(2)}>주 2회 (도전)</button>
              </div>
            </div>
          </div>

          {/* 스케줄 표 (확장: 6컬럼) */}
          {schedule.weeks.length > 0 && schedule.finalPace > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>{weeksLeft}주 인터벌 스케줄</span>
                <span className={s.cardLabelHint}>VDOT {schedule.vdot.toFixed(1)} 기준</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.scheduleTable}>
                  <thead>
                    <tr>
                      <th>주차</th>
                      <th>메뉴</th>
                      <th style={{ textAlign: 'right' }}>페이스</th>
                      <th>회복</th>
                      <th style={{ textAlign: 'right' }}>총거리</th>
                      <th style={{ textAlign: 'center' }}>강도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.weeks.map(w => {
                      const lapSec = (schedule.finalPace * w.menu1.dist) / 1000
                      const distLabel = w.menu1.dist >= 1000 ? `${w.menu1.dist / 1000}km` : `${w.menu1.dist}m`
                      const fastKm = (w.menu1.dist * w.menu1.reps) / 1000
                      const totalKm = fastKm + 3 // 워밍업·쿨다운
                      const phaseColor =
                        w.phase === 'adapt'   ? '#059669' :
                        w.phase === 'develop' ? '#A16207' :
                        w.phase === 'recover' ? '#0891B2' :
                        w.phase === 'peak'    ? '#DC2626' :
                        '#EA580C'
                      const phaseEmoji =
                        w.phase === 'adapt'   ? '🟢' :
                        w.phase === 'develop' ? '🟡' :
                        w.phase === 'recover' ? '🔵' :
                        w.phase === 'peak'    ? '🔴' :
                        '🟠'
                      return (
                        <tr key={w.week}>
                          <td style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{w.week}주차</td>
                          <td style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
                            {w.menu1.name}
                            {w.menu2 && <><br /><span style={{ fontSize: 11, color: 'var(--muted)' }}>+ {w.menu2.name}</span></>}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>
                            {fmtMS(lapSec)}<span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>/{distLabel}</span>
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: 12 }}>{w.menu1.recovery}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>
                            {totalKm.toFixed(1)}km
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={s.phaseBadge} style={{ background: phaseColor + '22', color: phaseColor, borderColor: phaseColor + '55' }}>
                              {phaseEmoji} {w.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 모바일 카드 뷰 (xs 화면 전용) */}
          {schedule.weeks.length > 0 && schedule.finalPace > 0 && (
            <div className={s.scheduleCardsMobile}>
              {schedule.weeks.map(w => {
                const lapSec = (schedule.finalPace * w.menu1.dist) / 1000
                const distLabel = w.menu1.dist >= 1000 ? `${w.menu1.dist / 1000}km` : `${w.menu1.dist}m`
                const fastKm = (w.menu1.dist * w.menu1.reps) / 1000
                const totalKm = fastKm + 3
                const phaseColor =
                  w.phase === 'adapt'   ? '#059669' :
                  w.phase === 'develop' ? '#A16207' :
                  w.phase === 'recover' ? '#0891B2' :
                  w.phase === 'peak'    ? '#DC2626' :
                  '#EA580C'
                const phaseEmoji =
                  w.phase === 'adapt'   ? '🟢' :
                  w.phase === 'develop' ? '🟡' :
                  w.phase === 'recover' ? '🔵' :
                  w.phase === 'peak'    ? '🔴' :
                  '🟠'
                return (
                  <div key={w.week} className={s.weekCard} style={{ borderLeftColor: phaseColor }}>
                    <div className={s.weekCardHead}>
                      <span className={s.weekCardNum}>{w.week}주차</span>
                      <span className={s.phaseBadge} style={{ background: phaseColor + '22', color: phaseColor, borderColor: phaseColor + '55' }}>
                        {phaseEmoji} {w.label}
                      </span>
                    </div>
                    <div className={s.weekCardBody}>
                      <div><strong>{w.menu1.name}</strong>{w.menu2 && <span style={{ color: 'var(--muted)', fontSize: 11 }}> · + {w.menu2.name}</span>}</div>
                      <div className={s.weekCardMeta}>
                        <span>페이스: <strong style={{ color: 'var(--accent)' }}>{fmtMS(lapSec)}/{distLabel}</strong></span>
                        <span>회복: {w.menu1.recovery}</span>
                        <span>총: <strong>{totalKm.toFixed(1)}km</strong></span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 워밍업·쿨다운 공통 안내 (별도 카드) */}
          {schedule.weeks.length > 0 && (
            <div className={s.warmupCard}>
              <p className={s.warmupTitle}>💡 모든 주차 공통</p>
              <ul className={s.warmupList}>
                <li><strong>워밍업</strong>: 1.5km 가벼운 조깅 + 동적 스트레칭 5~10분</li>
                <li><strong>쿨다운</strong>: 1.5km 가벼운 조깅 + 정적 스트레칭</li>
                <li>인터벌 전날: 휴식 또는 30분 이내 가벼운 조깅</li>
                <li>주 {intervalsPerWeek}회 인터벌 (선택값 기준)</li>
                <li>컨디션 ↓ 또는 통증 시 즉시 중단·휴식</li>
                {!trackOk && <li style={{ color: '#EA580C' }}>⚠️ 트랙 없음: GPS 시계 거리 기반 또는 시간 기반 인터벌로 대체</li>}
              </ul>
            </div>
          )}

          {/* 마라톤 추가 안내 */}
          {schedRaceType === 'marathon' && (
            <div className={s.marathonExtra}>
              <strong>⚠️ 인터벌만으로는 풀코스 준비가 부족합니다</strong>
              <p style={{ marginTop: 6, color: 'var(--muted)' }}>다음 훈련도 함께 필요합니다:</p>
              <ul>
                <li>주말 장거리주 (점진적 증가, 30km까지)</li>
                <li>마라톤 페이스 지속주 (월 1~2회)</li>
                <li>보급 연습 (대회 페이스에서 젤·물 섭취)</li>
                <li>누적 주간 거리 60km 이상 (목표 3시간 30분 기준)</li>
              </ul>
            </div>
          )}

          <button className={`${s.copyBtn} ${resultCopied ? s.copied : ''}`} onClick={copyResult}>
            {resultCopied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}
    </div>
  )
}
