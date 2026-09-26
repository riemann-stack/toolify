// ─────────────────────────────────────────────────────────────
// 골프 핸디캡 계산기 — localStorage 라운드/골프장 + 발전 추이
// ─────────────────────────────────────────────────────────────

import { todayStr } from '@/lib/date'

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
export const MAX_ROUNDS = 50  // WHS 20 + 여유

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** 'YYYY-MM-DD' → 로컬 정오 ms (UTC 해석 방지를 위해 분해 파싱). 형식이 틀리면 NaN */
export function dateToTs(date: string): number {
  if (!DATE_RE.test(date)) return NaN
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 12).getTime()
}

const isPosNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
const optStr = (v: unknown) => v === undefined || typeof v === 'string'
const hasKey = (obj: object, k: unknown): boolean => typeof k === 'string' && Object.prototype.hasOwnProperty.call(obj, k)

/** localStorage·CSV에서 읽은 값 검증 — 핵심 수치가 깨진 항목만 버리고, ts는 date로 복구 */
export function toValidRound(r: unknown): RoundRecord | null {
  if (typeof r !== 'object' || r === null) return null
  const o = r as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.date !== 'string') return null
  if (!isPosNum(o.cr) || !isPosNum(o.slope) || !isPosNum(o.par) || !isPosNum(o.grossScore)) return null
  if (typeof o.is9Holes !== 'boolean') return null
  if (!optStr(o.course) || !optStr(o.notes)) return null
  const tee = hasKey(TEE_LABEL, o.tee) ? (o.tee as TeeColor) : undefined
  const weather = hasKey(WEATHER_LABEL, o.weather) ? (o.weather as Weather) : undefined
  // 날짜를 비운 채 저장된 옛 기록은 ts가 NaN(→ JSON null)이므로 date에서 다시 계산, 그래도 없으면 0
  const ts = typeof o.ts === 'number' && Number.isFinite(o.ts) ? o.ts : (Number.isFinite(dateToTs(o.date)) ? dateToTs(o.date) : 0)
  return {
    id: o.id, date: o.date, ts,
    course: o.course as string | undefined, tee,
    cr: o.cr, slope: o.slope, par: o.par, grossScore: o.grossScore,
    is9Holes: o.is9Holes, weather: weather || undefined, notes: o.notes as string | undefined,
  }
}

// ── 라운드 ──
export function loadRounds(): RoundRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ROUNDS_KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map(toValidRound)
      .filter((r): r is RoundRecord => r !== null)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, MAX_ROUNDS)
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
function toValidCourse(c: unknown): SavedCourse | null {
  if (typeof c !== 'object' || c === null) return null
  const o = c as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.name !== 'string' || !Array.isArray(o.tees)) return null
  const tees = o.tees.filter((t): t is SavedCourse['tees'][number] => {
    if (typeof t !== 'object' || t === null) return false
    const tt = t as Record<string, unknown>
    return hasKey(TEE_LABEL, tt.name) && isPosNum(tt.cr) && isPosNum(tt.slope) && isPosNum(tt.par)
  })
  if (tees.length === 0) return null
  return {
    id: o.id, name: o.name, tees,
    region: typeof o.region === 'string' ? o.region : undefined,
    notes: typeof o.notes === 'string' ? o.notes : undefined,
    lastUsed: typeof o.lastUsed === 'string' ? o.lastUsed : '',
  }
}

export function loadCourses(): SavedCourse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COURSES_KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map(toValidCourse)
      .filter((c): c is SavedCourse => c !== null)
      .sort((a, b) => b.lastUsed.localeCompare(a.lastUsed))
  } catch { return [] }
}

export function saveCourses(arr: SavedCourse[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(COURSES_KEY, JSON.stringify(arr)) } catch {}
}

// ── 디퍼런셜·핸디캡 계산 ──
/** 9홀 CR로 볼 수 있는 상한 — 9홀 CR은 보통 30~40대, 18홀 CR은 60~70대라 이보다 크면 18홀 값으로 본다 */
export const NINE_HOLE_CR_MAX = 50

/** 9홀 라운드에 18홀 CR을 넣었는지 */
export function looksLike18HoleCr(cr: number, is9Holes: boolean): boolean {
  return is9Holes && cr > NINE_HOLE_CR_MAX
}

/** 스코어 디퍼런셜. 잘못된 입력이면 NaN (호출부에서 Number.isFinite로 거른다).
    9홀은 스코어와 9홀 CR을 두 배로 늘리는 단순 근사(WHS 2024의 '기대 디퍼런셜 합산' 방식 아님).
    9홀인데 CR이 18홀 값(>50)이면 두 배 하지 않고 그대로 쓴다. */
export function calcDifferential(grossScore: number, cr: number, slope: number, is9Holes = false): number {
  if (!(grossScore > 0) || !(cr > 0) || !(slope > 0)) return NaN
  const gross = is9Holes ? grossScore * 2 : grossScore
  const adjCr = is9Holes && !looksLike18HoleCr(cr, is9Holes) ? cr * 2 : cr
  return (gross - adjCr) * 113 / slope
}

// WHS 표준: 제출 라운드 수별 사용 디퍼런셜 개수
export function getUsedCount(n: number): number {
  if (n < 3) return 0
  if (n <= 5) return 1
  if (n <= 8) return 2
  if (n <= 11) return 3
  if (n <= 14) return 4
  if (n <= 16) return 5
  if (n <= 18) return 6
  if (n === 19) return 7
  return 8
}

// WHS 표준: 라운드 부족 시 평균에 더하는 조정값
export function lowRoundAdjustment(n: number): number {
  if (n === 3) return -2.0
  if (n === 4) return -1.0
  if (n === 6) return -1.0
  return 0
}

export const MAX_HANDICAP_INDEX = 54.0

// WHS 핸디캡 지수 = 최저 N개 평균 + 조정 (0.96 미적용 — 2020 WHS에서 폐지), 최대 54.0
export function handicapIndexFromDiffs(diffs: number[]): number | null {
  const n = diffs.length
  const used = getUsedCount(n)
  if (used === 0) return null
  const sorted = [...diffs].sort((a, b) => a - b).slice(0, used)
  const avg = sorted.reduce((s, d) => s + d, 0) / sorted.length
  const hi = avg + lowRoundAdjustment(n)
  return Math.min(MAX_HANDICAP_INDEX, Math.round(hi * 10) / 10)
}

export function calcHandicapIndex(rounds: RoundRecord[]): number | null {
  // 최근 20개만 사용
  const recent = rounds.slice(0, 20)
  const diffs = recent
    .map(r => calcDifferential(r.grossScore, r.cr, r.slope, r.is9Holes))
    // 음수 디퍼런셜(CR보다 잘 친 라운드)도 유효 — 플러스 핸디캡
    .filter(d => Number.isFinite(d))
  return handicapIndexFromDiffs(diffs)
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
    if (Number.isFinite(p.differential) && p.differential < bestDiff) { bestDiff = p.differential; bestDate = p.date }
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
      Number.isFinite(diff) ? diff.toFixed(1) : '',
      r.weather ?? '',
      `"${(r.notes ?? '').replace(/"/g, '""')}"`,
    ]
    lines.push(row.join(','))
  }
  return lines.join('\n')
}

// ── CSV 가져오기 (roundsToCsv 형식 — 다른 기기에서 내보낸 파일 복원) ──
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false
      } else field += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

/** 엑셀 재저장 대비 날짜 정규화 → 'YYYY-MM-DD'. 형식이 틀리면 ''
 *  2026-09-26 · 2026/9/26 · 2026.9.26 · 2026. 9. 26.(한국어 표시 형식) · 9/26/2026(미국식 M/D/YYYY) */
function normalizeDate(v: string): string {
  const t = v.trim()
  let y: number, mo: number, d: number
  const ymd = t.match(/^(\d{4})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{1,2})\.?$/)
  const mdy = ymd ? null : t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ymd) [y, mo, d] = [Number(ymd[1]), Number(ymd[2]), Number(ymd[3])]
  else if (mdy) [y, mo, d] = [Number(mdy[3]), Number(mdy[1]), Number(mdy[2])]
  else return ''
  const dt = new Date(y, mo - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return ''
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** CSV 텍스트 → 검증된 라운드 목록. 헤더가 맞지 않으면 null, 날짜·수치가 깨진 행은 건너뛴다. */
export function parseRoundsCsv(text: string): { rounds: RoundRecord[]; skipped: number } | null {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''))
  if (rows.length === 0) return null
  const header = rows[0].map(h => h.trim())
  const col = (name: string) => header.indexOf(name)
  const iDate = col('date'), iCr = col('cr'), iSlope = col('slope'), iPar = col('par'), iGross = col('grossScore')
  if (iDate < 0 || iCr < 0 || iSlope < 0 || iPar < 0 || iGross < 0) return null
  const iCourse = col('course'), iTee = col('tee'), i9 = col('is9Holes'), iWeather = col('weather'), iNotes = col('notes')
  const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? '').trim() : '')
  const rounds: RoundRecord[] = []
  let skipped = 0
  for (const row of rows.slice(1)) {
    if (row.every(c => c.trim() === '')) continue
    const date = normalizeDate(cell(row, iDate))
    const v = date ? toValidRound({
      id: newId(),
      date,
      ts: dateToTs(date),
      course: cell(row, iCourse) || undefined,
      tee: cell(row, iTee) || undefined,
      cr: parseFloat(cell(row, iCr)),
      slope: parseFloat(cell(row, iSlope)),
      par: parseFloat(cell(row, iPar)),
      grossScore: parseFloat(cell(row, iGross)),
      is9Holes: cell(row, i9) === '9',
      weather: cell(row, iWeather) || undefined,
      notes: cell(row, iNotes).slice(0, 60) || undefined,
    }) : null
    if (v) rounds.push(v)
    else skipped++
  }
  return { rounds, skipped }
}

/** 기존 기록에 가져온 기록을 합친다 — 같은 날짜·골프장·스코어·CR·슬로프·홀 수면 중복으로 보고 건너뜀 */
export function mergeRounds(existing: RoundRecord[], incoming: RoundRecord[]): { merged: RoundRecord[]; added: number } {
  const key = (r: RoundRecord) => [r.date, r.course ?? '', r.grossScore, r.cr, r.slope, r.is9Holes ? 9 : 18].join('|')
  const seen = new Set(existing.map(key))
  const fresh: RoundRecord[] = []
  for (const r of incoming) {
    const k = key(r)
    if (seen.has(k)) continue
    seen.add(k)
    fresh.push(r)
  }
  return { merged: [...existing, ...fresh], added: fresh.length }
}

/** 가져오기 병합 후 최근 MAX_ROUNDS개만 남긴다.
 *  kept = 새로 들어온 라운드 중 실제로 보관된 개수, dropped = 한도를 넘어 빠진 라운드 수(기존·신규 합계) */
export function importRounds(existing: RoundRecord[], incoming: RoundRecord[]): {
  next: RoundRecord[]; added: number; kept: number; dropped: number
} {
  const { merged, added } = mergeRounds(existing, incoming)
  const next = [...merged].sort((a, b) => b.ts - a.ts).slice(0, MAX_ROUNDS)
  const existingIds = new Set(existing.map(r => r.id))
  const kept = next.filter(r => !existingIds.has(r.id)).length
  return { next, added, kept, dropped: merged.length - next.length }
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
