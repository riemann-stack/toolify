// ─────────────────────────────────────────────────────────────
// 골프 핸디캡 계산기 — localStorage 라운드/골프장 + 발전 추이
// ─────────────────────────────────────────────────────────────

export type TeeColor = 'black' | 'white' | 'yellow' | 'red' | 'custom'
export type Weather  = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | ''

export const TEE_LABEL: Record<TeeColor, string> = {
  black:  '⚫ 블랙',
  white:  '⚪ 화이트',
  yellow: '🟡 옐로',
  red:    '🔴 레드',
  custom: '🎨 커스텀',
}

export const WEATHER_LABEL: Record<Weather, string> = {
  '':       '—',
  sunny:    '☀️ 맑음',
  cloudy:   '☁️ 흐림',
  rainy:    '🌧️ 비',
  windy:    '💨 바람',
  cold:     '❄️ 추움',
}

export type RoundRecord = {
  id: string
  date: string         // YYYY-MM-DD
  ts: number           // ms
  course?: string
  tee?: TeeColor
  cr: number
  slope: number
  par: number
  grossScore: number
  is9Holes: boolean
  weather?: Weather
  notes?: string
}

export type SavedCourse = {
  id: string
  name: string
  region?: string      // 경기·강원·충청 등
  tees: Array<{
    name: TeeColor
    cr: number
    slope: number
    par: number
  }>
  notes?: string
  lastUsed: string
}

const ROUNDS_KEY  = 'youtil-golf-rounds-v1'
const COURSES_KEY = 'youtil-golf-handicap-courses-v1'
const MAX_ROUNDS  = 50  // WHS 20 + 여유

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── 라운드 ──
export function loadRounds(): RoundRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ROUNDS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as RoundRecord[]
    if (!Array.isArray(arr)) return []
    return arr.sort((a, b) => b.ts - a.ts).slice(0, MAX_ROUNDS)
  } catch { return [] }
}

export function saveRounds(arr: RoundRecord[]) {
  if (typeof window === 'undefined') return
  try {
    const trimmed = arr.sort((a, b) => b.ts - a.ts).slice(0, MAX_ROUNDS)
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(trimmed))
  } catch {}
}

// ── 골프장 ──
export function loadCourses(): SavedCourse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COURSES_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as SavedCourse[]
    if (!Array.isArray(arr)) return []
    return arr.sort((a, b) => b.lastUsed.localeCompare(a.lastUsed))
  } catch { return [] }
}

export function saveCourses(arr: SavedCourse[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(COURSES_KEY, JSON.stringify(arr)) } catch {}
}

// ── 디퍼런셜·핸디캡 계산 ──
export function calcDifferential(grossScore: number, cr: number, slope: number, is9Holes = false): number {
  if (!grossScore || !cr || !slope) return 0
  const gross = is9Holes ? grossScore * 2 : grossScore
  const adjCr = is9Holes ? cr * 2 : cr
  return (gross - adjCr) * 113 / slope
}

export function getUsedCount(n: number): number {
  if (n < 3) return 0
  if (n <= 5) return 1
  if (n <= 8) return 2
  if (n <= 11) return 3
  if (n <= 14) return 4
  if (n <= 16) return 5
  if (n === 17) return 6
  if (n === 18) return 7
  return 8
}

export function calcHandicapIndex(rounds: RoundRecord[]): number | null {
  // 최근 20개만 사용
  const recent = rounds.slice(0, 20)
  const diffs = recent
    .map(r => calcDifferential(r.grossScore, r.cr, r.slope, r.is9Holes))
    .filter(d => d > 0 || d === 0)
  const used = getUsedCount(diffs.length)
  if (used === 0) return null
  const sorted = [...diffs].sort((a, b) => a - b).slice(0, used)
  const avg = sorted.reduce((s, d) => s + d, 0) / sorted.length
  return Math.round(avg * 0.96 * 10) / 10
}

// ── 발전 추이 (라운드별 디퍼런셜 + 이동 핸디캡) ──
export type ProgressPoint = {
  date: string
  ts: number
  differential: number
  handicapAtTime: number | null  // 그 시점까지의 라운드로 계산한 핸디캡
}

export function getProgressPoints(rounds: RoundRecord[]): ProgressPoint[] {
  // 시간순 (오래된 → 최신)
  const sorted = [...rounds].sort((a, b) => a.ts - b.ts)
  return sorted.map((r, i) => {
    const upToHere = sorted.slice(0, i + 1)
    return {
      date: r.date,
      ts: r.ts,
      differential: calcDifferential(r.grossScore, r.cr, r.slope, r.is9Holes),
      handicapAtTime: calcHandicapIndex([...upToHere].reverse()),  // 최신순으로 calc에 전달
    }
  })
}

// ── 통계 ──
export type ProgressStats = {
  startIndex: number | null
  currentIndex: number | null
  change: number | null
  bestDifferential: number | null
  bestRoundDate: string | null
  monthlyAvg: number  // 평균 라운드/월
  totalRounds: number
}

export function analyzeProgress(rounds: RoundRecord[]): ProgressStats {
  if (rounds.length === 0) {
    return {
      startIndex: null, currentIndex: null, change: null,
      bestDifferential: null, bestRoundDate: null,
      monthlyAvg: 0, totalRounds: 0,
    }
  }
  const points = getProgressPoints(rounds)
  const validPoints = points.filter(p => p.handicapAtTime !== null)
  const startIndex = validPoints[0]?.handicapAtTime ?? null
  const currentIndex = validPoints[validPoints.length - 1]?.handicapAtTime ?? null

  let bestDiff = Infinity
  let bestDate: string | null = null
  for (const p of points) {
    if (p.differential < bestDiff) { bestDiff = p.differential; bestDate = p.date }
  }

  // 월간 평균
  const sorted = [...rounds].sort((a, b) => a.ts - b.ts)
  const firstTs = sorted[0].ts
  const lastTs = sorted[sorted.length - 1].ts
  const monthsSpan = Math.max(1, (lastTs - firstTs) / (30 * 86400_000))

  return {
    startIndex,
    currentIndex,
    change: (startIndex !== null && currentIndex !== null) ? Math.round((currentIndex - startIndex) * 10) / 10 : null,
    bestDifferential: isFinite(bestDiff) ? Math.round(bestDiff * 10) / 10 : null,
    bestRoundDate: bestDate,
    monthlyAvg: Math.round((rounds.length / monthsSpan) * 10) / 10,
    totalRounds: rounds.length,
  }
}

// ── CSV 내보내기 ──
export function roundsToCsv(rounds: RoundRecord[]): string {
  const headers = ['date', 'course', 'tee', 'cr', 'slope', 'par', 'grossScore', 'is9Holes', 'differential', 'weather', 'notes']
  const lines = [headers.join(',')]
  const sorted = [...rounds].sort((a, b) => b.ts - a.ts)
  for (const r of sorted) {
    const diff = calcDifferential(r.grossScore, r.cr, r.slope, r.is9Holes)
    const row = [
      r.date,
      `"${(r.course ?? '').replace(/"/g, '""')}"`,
      r.tee ?? '',
      r.cr,
      r.slope,
      r.par,
      r.grossScore,
      r.is9Holes ? '9' : '18',
      diff.toFixed(1),
      r.weather ?? '',
      `"${(r.notes ?? '').replace(/"/g, '""')}"`,
    ]
    lines.push(row.join(','))
  }
  return lines.join('\n')
}

export function downloadCsv(rounds: RoundRecord[]) {
  if (typeof window === 'undefined') return
  const csv = roundsToCsv(rounds)
  // BOM for Excel UTF-8
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `golf-rounds-${todayStr()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
