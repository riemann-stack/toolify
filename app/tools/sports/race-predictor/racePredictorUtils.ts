// ─────────────────────────────────────────────────────────────
// 마라톤 레이스 기록 예측 — 계산·환경 보정·연령/성별·기록 저장
// ─────────────────────────────────────────────────────────────

export type DistKey = '5k' | '10k' | 'half' | 'full' | 'custom'
export type TargetKey = '3k' | '5k' | '10k' | '15k' | 'half' | '30k' | 'full'
export type Gender = 'male' | 'female'
export type AgeBand = '20-30' | '30-40' | '40-50' | '50-60' | '60+'

export const DISTS: { key: DistKey; label: string; km: number }[] = [
  { key: '5k',   label: '5km',   km: 5 },
  { key: '10k',  label: '10km',  km: 10 },
  { key: 'half', label: '하프',  km: 21.0975 },
  { key: 'full', label: '풀',    km: 42.195 },
]

export const TARGETS: { key: TargetKey; label: string; km: number }[] = [
  { key: '3k',   label: '3km',  km: 3 },
  { key: '5k',   label: '5km',  km: 5 },
  { key: '10k',  label: '10km', km: 10 },
  { key: '15k',  label: '15km', km: 15 },
  { key: 'half', label: '하프', km: 21.0975 },
  { key: '30k',  label: '30km', km: 30 },
  { key: 'full', label: '풀',   km: 42.195 },
]

// ── 시간 유틸 ─────────────────────────────
export const pad = (n: number) => String(n).padStart(2, '0')

export function fmtHMS(totalSec: number): string {
  if (!isFinite(totalSec) || totalSec <= 0) return '--:--:--'
  const s = Math.round(totalSec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}
export function fmtMS(totalSec: number): string {
  if (!isFinite(totalSec) || totalSec <= 0) return '--:--'
  const s = Math.round(totalSec)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${pad(m)}:${pad(sec)}`
}
export function fmtPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '--:--'
  const s = Math.round(secPerKm)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${pad(sec)}`
}
export function hmsToSec(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s
}
export function secToHMS(totalSec: number): { h: number; m: number; s: number } {
  if (!isFinite(totalSec) || totalSec <= 0) return { h: 0, m: 0, s: 0 }
  const t = Math.round(totalSec)
  return { h: Math.floor(t / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }
}

// ── VDOT (Jack Daniels) ──────────────────
export function vo2FromV(v: number): number {
  return -4.60 + 0.182258 * v + 0.000104 * v * v
}
export function vFromVo2(vo2: number): number {
  const a = 0.000104, b = 0.182258, c = -(4.60 + vo2)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}
export function pctVO2max(tMin: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin)
}
export function vdotFromRace(distKm: number, timeSec: number): number {
  const tMin = timeSec / 60
  const v = (distKm * 1000) / tMin
  return vo2FromV(v) / pctVO2max(tMin)
}
export function timeFromVdot(distKm: number, vdot: number): number {
  let lo = 1, hi = 60 * 60 * 10
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    const tMin = mid / 60
    const v = (distKm * 1000) / tMin
    const estVdot = vo2FromV(v) / pctVO2max(tMin)
    if (estVdot > vdot) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
export function paceFromVdot(vdot: number, intensity: number): number {
  const vo2 = vdot * intensity
  const v = vFromVo2(vo2)
  return 60000 / v
}

// ── Riegel / Cameron ─────────────────────
export function riegelTime(d1: number, t1: number, d2: number): number {
  return t1 * Math.pow(d2 / d1, 1.06)
}
export function cameronA(dMi: number): number {
  return 13.49681 - 0.048865 * dMi + 2.438936 / Math.pow(dMi, 0.7905)
}
export function cameronTime(d1km: number, t1: number, d2km: number): number {
  const d1mi = d1km / 1.609344
  const d2mi = d2km / 1.609344
  return t1 * (d2km / d1km) * (cameronA(d1mi) / cameronA(d2mi))
}

// 3공식 평균 — 메인 사용
export function predictTime(baseKm: number, baseSec: number, targetKm: number): {
  riegel: number; vdot: number; cameron: number; avg: number
} {
  const v = vdotFromRace(baseKm, baseSec)
  const r = riegelTime(baseKm, baseSec, targetKm)
  const vt = timeFromVdot(targetKm, v)
  const c = cameronTime(baseKm, baseSec, targetKm)
  return { riegel: r, vdot: vt, cameron: c, avg: (r + vt + c) / 3 }
}

// ── 환경 보정 ────────────────────────────
export interface EnvInput {
  baseTime: number  // 평시 예상 (초)
  temp: number      // °C
  humidity: number  // %
  elevation: number // m
}
export interface EnvFactor {
  name: string
  detail: string
  percent: number
  addedSec: number
}
export interface EnvResult {
  correctedTime: number
  totalPercent: number
  factors: EnvFactor[]
  warning: 'none' | 'caution' | 'danger'
}

export function envCorrection(input: EnvInput): EnvResult {
  const factors: EnvFactor[] = []

  // 기온 (15°C 기준)
  let tempPct = 0
  if (input.temp <= 15) tempPct = 0
  else if (input.temp <= 20) tempPct = 1.5
  else if (input.temp <= 25) tempPct = 3.5
  else if (input.temp <= 30) tempPct = 6
  else tempPct = 8 + (input.temp - 30) * 0.7
  factors.push({
    name: '🌡️ 기온',
    detail: `${input.temp}°C`,
    percent: tempPct,
    addedSec: input.baseTime * tempPct / 100,
  })

  // 습도 (60% 기준)
  let humPct = 0
  if (input.humidity <= 60) humPct = 0
  else if (input.humidity <= 80) humPct = 1
  else humPct = 2.5
  factors.push({
    name: '💧 습도',
    detail: `${input.humidity}%`,
    percent: humPct,
    addedSec: input.baseTime * humPct / 100,
  })

  // 고도 (해수면 기준)
  let altPct = 0
  if (input.elevation <= 200) altPct = 0
  else if (input.elevation <= 500) altPct = 1.5
  else if (input.elevation <= 1000) altPct = 3
  else if (input.elevation <= 2000) altPct = 5
  else altPct = 7
  factors.push({
    name: '🏔️ 고도',
    detail: `${input.elevation}m`,
    percent: altPct,
    addedSec: input.baseTime * altPct / 100,
  })

  const totalPercent = tempPct + humPct + altPct
  const correctedTime = input.baseTime * (1 + totalPercent / 100)

  let warning: 'none' | 'caution' | 'danger' = 'none'
  if (input.temp >= 30) warning = 'danger'
  else if (input.temp >= 25) warning = 'caution'

  return { correctedTime, totalPercent, factors, warning }
}

// ── 연령·성별 보정 ────────────────────────
// WMA(World Masters Athletics) 평균 통계 참고
export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  '20-30': '20대',
  '30-40': '30대',
  '40-50': '40대',
  '50-60': '50대',
  '60+':   '60대+',
}
export const AGE_GENDER_FACTORS: Record<Gender, Record<AgeBand, number>> = {
  male: {
    '20-30': 1.00,
    '30-40': 0.97,
    '40-50': 0.92,
    '50-60': 0.84,
    '60+':   0.76,
  },
  female: {
    '20-30': 0.91,
    '30-40': 0.88,
    '40-50': 0.83,
    '50-60': 0.76,
    '60+':   0.68,
  },
}

// 연령·성별 보정: 같은 능력치(20대 남성 기준 시간) → 본인 그룹 기대 시간
// 본인 시간 = 기준 시간 / factor (factor < 1 → 본인 시간이 더 김)
export function adjustTimeByDemographic(timeSec: number, gender: Gender, ageBand: AgeBand): number {
  const factor = AGE_GENDER_FACTORS[gender][ageBand]
  return timeSec / factor
}
// 본인 시간 → 20대 남성 환산 (등가 능력)
export function normalizeToYoungMale(timeSec: number, gender: Gender, ageBand: AgeBand): number {
  const factor = AGE_GENDER_FACTORS[gender][ageBand]
  return timeSec * factor
}

// ── 한국 시즌 안내 ───────────────────────
export const KOREA_SEASONS = [
  { name: '봄 (3~4월)',     temp: '12~18°C',  rating: '⭐ 적정', races: '서울국제·동아·서울하프' },
  { name: '가을 (9~11월)',  temp: '12~18°C',  rating: '⭐⭐ 최적', races: '춘천·JTBC' },
  { name: '여름 (6~8월)',   temp: '25~30°C',  rating: '⚠️ 위험', races: '드물게 야간 대회' },
  { name: '겨울 (12~2월)',  temp: '0~10°C',   rating: '⚠️ 바람·근경직', races: '드문 대회' },
]

// ── 빠른 입력 칩 ─────────────────────────
export const QUICK_TIMES: Record<DistKey, { label: string; h: number; m: number; s: number }[]> = {
  '5k': [
    { label: '20:00', h: 0, m: 20, s: 0 },
    { label: '22:00', h: 0, m: 22, s: 0 },
    { label: '25:00', h: 0, m: 25, s: 0 },
    { label: '28:00', h: 0, m: 28, s: 0 },
    { label: '30:00', h: 0, m: 30, s: 0 },
  ],
  '10k': [
    { label: '40:00', h: 0, m: 40, s: 0 },
    { label: '45:00', h: 0, m: 45, s: 0 },
    { label: '50:00', h: 0, m: 50, s: 0 },
    { label: '55:00', h: 0, m: 55, s: 0 },
    { label: '60:00', h: 1, m: 0,  s: 0 },
  ],
  half: [
    { label: '1:30', h: 1, m: 30, s: 0 },
    { label: '1:45', h: 1, m: 45, s: 0 },
    { label: '2:00', h: 2, m: 0,  s: 0 },
    { label: '2:15', h: 2, m: 15, s: 0 },
    { label: '2:30', h: 2, m: 30, s: 0 },
  ],
  full: [
    { label: '3:00', h: 3, m: 0,  s: 0 },
    { label: '3:30', h: 3, m: 30, s: 0 },
    { label: '4:00', h: 4, m: 0,  s: 0 },
    { label: '4:30', h: 4, m: 30, s: 0 },
    { label: '5:00', h: 5, m: 0,  s: 0 },
  ],
  custom: [],
}

// ── localStorage 기록 ────────────────────
export interface RaceRecord {
  id: string
  date: string  // YYYY-MM-DD
  distance: DistKey
  customKm?: number
  timeSec: number
  vdot: number
  raceName?: string
  conditions?: { temp?: number; humidity?: number; elevation?: number }
  notes?: string
}

export const STORAGE_KEY = 'youtil:race-predictor:records-v1'

export function loadRecords(): RaceRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as RaceRecord[]
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveRecords(records: RaceRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* quota */ }
}

export function recordsToCSV(records: RaceRecord[]): string {
  const head = 'date,distance,customKm,timeSec,timeHMS,vdot,raceName,temp,humidity,elevation,notes'
  const lines = records.map((r) => {
    const c = r.conditions ?? {}
    return [
      r.date,
      r.distance,
      r.customKm ?? '',
      r.timeSec,
      fmtHMS(r.timeSec),
      r.vdot.toFixed(1),
      `"${(r.raceName ?? '').replace(/"/g, '""')}"`,
      c.temp ?? '',
      c.humidity ?? '',
      c.elevation ?? '',
      `"${(r.notes ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  })
  return [head, ...lines].join('\n')
}

// ── VDOT 레벨 분류 ───────────────────────
export function vdotLevel(vdot: number): { tag: string; color: string } {
  if (vdot < 30) return { tag: '입문', color: '#0891B2' }
  if (vdot < 40) return { tag: '중급', color: '#0EA5E9' }
  if (vdot < 50) return { tag: '상급', color: '#A16207' }
  if (vdot < 60) return { tag: '엘리트 준비', color: '#EA580C' }
  return { tag: '엘리트', color: '#DC2626' }
}
