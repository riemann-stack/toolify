/* ──────────────────────────────────────────────────────
   dday/ddayUtils.ts — D-day 계산, 진행률, 평일·영업일,
   페이스, 반복 D-day, localStorage 관리
   ────────────────────────────────────────────────────── */

import { isHoliday, type RecurrenceId } from './koreanHolidays'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export type DdayGoal = {
  totalAmount: number
  completedAmount: number
  unit: string
}

export type DdayItem = {
  id: string
  title: string
  emoji: string
  category: string
  targetDate: string       // YYYY-MM-DD
  startDate?: string
  recurrence: RecurrenceId
  isPinned: boolean
  isCompleted: boolean
  goal?: DdayGoal
  notes?: string
  createdAt: string
}

/** 자정 기준 정수일 차이 (target - ref) */
export function dayDiff(target: Date, ref: Date): number {
  const t = new Date(target); t.setHours(0, 0, 0, 0)
  const r = new Date(ref);    r.setHours(0, 0, 0, 0)
  return Math.round((t.getTime() - r.getTime()) / MS_PER_DAY)
}

/** D-day 계산 + 라벨 */
export type DdayCalc = {
  diff: number          // 양수: 미래 (D-N), 0: 오늘, 음수: 지남 (D+N)
  days: number          // 절대값
  label: string         // 'D-30' | 'D+5' | 'D-day'
  isPast: boolean
  isToday: boolean
  weeks: number
  weekDays: number
  hours: number
  urgency: 'today' | 'urgent' | 'soon' | 'ok' | 'past'   // 색상 등급
}
export function calcDday(targetStr: string, ref: Date = new Date()): DdayCalc {
  const target = new Date(targetStr)
  const diff = dayDiff(target, ref)
  const days = Math.abs(diff)
  const isToday = diff === 0
  const isPast  = diff < 0
  const label = isToday ? 'D-day' : (isPast ? `D+${days}` : `D-${days}`)
  const urgency: DdayCalc['urgency'] =
    isPast ? 'past' :
    isToday ? 'today' :
    diff <= 7 ? 'urgent' :
    diff <= 30 ? 'soon' : 'ok'
  return {
    diff, days, label, isPast, isToday,
    weeks: Math.floor(days / 7),
    weekDays: days % 7,
    hours: days * 24,
    urgency,
  }
}

/** 진행률 (시작일 → 목표일 사이의 경과 비율) */
export type ProgressCalc = {
  totalDays: number
  elapsedDays: number
  remainingDays: number
  percent: number
}
export function calcProgress(startStr: string, targetStr: string, ref: Date = new Date()): ProgressCalc | null {
  const start = new Date(startStr)
  const target = new Date(targetStr)
  if (target <= start) return null
  const total = dayDiff(target, start)
  const elapsed = Math.max(0, dayDiff(ref, start))
  const remaining = Math.max(0, dayDiff(target, ref))
  return {
    totalDays: total,
    elapsedDays: elapsed,
    remainingDays: remaining,
    percent: Math.min(100, Math.max(0, (elapsed / total) * 100)),
  }
}

/** 평일 (월~금) — 시작일·종료일 모두 포함 */
export function calcWeekdays(startStr: string, endStr: string): number {
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end   = new Date(endStr);   end.setHours(0,0,0,0)
  if (end < start) return 0
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

/** 영업일 (평일 + 한국 공휴일 제외) */
export function calcBusinessDays(startStr: string, endStr: string): number {
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end   = new Date(endStr);   end.setHours(0,0,0,0)
  if (end < start) return 0
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    const weekend = day === 0 || day === 6
    if (!weekend && !isHoliday(cur)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

/** 주말 횟수 — 토·일이 모두 들어간 주말 수 (일요일 카운트 기준) */
export function calcWeekendCount(startStr: string, endStr: string): number {
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end   = new Date(endStr);   end.setHours(0,0,0,0)
  if (end < start) return 0
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (cur.getDay() === 0) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

/** 두 날짜 사이의 공휴일 목록 */
export function holidaysBetween(startStr: string, endStr: string) {
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end   = new Date(endStr);   end.setHours(0,0,0,0)
  if (end < start) return []
  const out: { date: string; name: string }[] = []
  const cur = new Date(start)
  while (cur <= end) {
    const h = isHoliday(cur)
    if (h) out.push(h)
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/** 두 날짜 사이의 (년·월·일) 분해 */
export function calcYMDDiff(startStr: string, endStr: string) {
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end   = new Date(endStr);   end.setHours(0,0,0,0)
  if (end < start) return { years: 0, months: 0, days: 0 }
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()
  if (days < 0) {
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months, days }
}

/** N일 후 (모드별) */
export type AddDaysMode = 'calendar' | 'weekday' | 'business'
export function addDays(startStr: string, n: number, mode: AddDaysMode): Date {
  const cur = new Date(startStr); cur.setHours(0,0,0,0)
  if (mode === 'calendar') {
    cur.setDate(cur.getDate() + n)
    return cur
  }
  // 평일·영업일 모드: n일 동안 카운트
  let added = 0
  const direction = n >= 0 ? 1 : -1
  const target = Math.abs(n)
  while (added < target) {
    cur.setDate(cur.getDate() + direction)
    const day = cur.getDay()
    const weekend = day === 0 || day === 6
    if (mode === 'weekday') {
      if (!weekend) added++
    } else {
      if (!weekend && !isHoliday(cur)) added++
    }
  }
  return cur
}

/** 다음 영업일 */
export function nextBusinessDay(ref: Date = new Date()): Date {
  const cur = new Date(ref); cur.setHours(0,0,0,0)
  cur.setDate(cur.getDate() + 1)
  while (true) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6 && !isHoliday(cur)) return cur
    cur.setDate(cur.getDate() + 1)
  }
}

/** 반복 D-day의 다음 발생일 */
export function nextRecurrence(item: DdayItem, ref: Date = new Date()): Date {
  const target = new Date(item.targetDate)
  target.setHours(0,0,0,0)
  const refMid = new Date(ref); refMid.setHours(0,0,0,0)
  if (item.recurrence === 'none' || target >= refMid) return target

  if (item.recurrence === 'yearly') {
    const next = new Date(refMid.getFullYear(), target.getMonth(), target.getDate())
    if (next < refMid) next.setFullYear(next.getFullYear() + 1)
    return next
  }
  if (item.recurrence === 'monthly') {
    const next = new Date(refMid.getFullYear(), refMid.getMonth(), target.getDate())
    if (next < refMid) next.setMonth(next.getMonth() + 1)
    return next
  }
  if (item.recurrence === 'weekly') {
    const next = new Date(refMid)
    const dayDiff = (target.getDay() - refMid.getDay() + 7) % 7
    next.setDate(next.getDate() + (dayDiff || 7))
    return next
  }
  return target
}

/** 페이스 계산 (학습·저축 등) */
export type PaceCalc = {
  remainingDays: number
  remainingAmount: number
  dailyTarget: number
  weeklyTarget: number
  currentPace: number
  elapsedDays: number
  expectedFinish: number
  isOnTrack: boolean
  deficit: number
  additionalDailyNeeded: number
  percent: number
}
export function calcPace(
  targetStr: string,
  startStr: string,
  totalAmount: number,
  completedAmount: number,
  ref: Date = new Date(),
): PaceCalc | null {
  if (totalAmount <= 0) return null
  const target = new Date(targetStr)
  const remaining = dayDiff(target, ref)
  const remainingAmount = Math.max(0, totalAmount - completedAmount)
  const start = startStr ? new Date(startStr) : new Date(ref)
  const elapsed = Math.max(0, dayDiff(ref, start))
  const currentPace = elapsed > 0 ? completedAmount / elapsed : 0
  const dailyTarget = remaining > 0 ? remainingAmount / remaining : 0
  const expectedFinish = completedAmount + currentPace * Math.max(0, remaining)
  const isOnTrack = expectedFinish >= totalAmount
  const deficit = Math.max(0, totalAmount - expectedFinish)
  const additionalDailyNeeded = remaining > 0 ? deficit / remaining : 0
  return {
    remainingDays: remaining,
    remainingAmount,
    dailyTarget: Math.ceil(dailyTarget * 100) / 100,
    weeklyTarget: Math.ceil(dailyTarget * 7 * 10) / 10,
    currentPace: Math.round(currentPace * 100) / 100,
    elapsedDays: elapsed,
    expectedFinish: Math.round(expectedFinish * 10) / 10,
    isOnTrack,
    deficit: Math.round(deficit * 10) / 10,
    additionalDailyNeeded: Math.ceil(additionalDailyNeeded * 100) / 100,
    percent: totalAmount > 0 ? Math.min(100, (completedAmount / totalAmount) * 100) : 0,
  }
}

/* ──────────────────────────────────────────────────────
   localStorage
   ────────────────────────────────────────────────────── */
const STORAGE_KEY = 'youtil-ddays-v1'

export function loadDdays(): DdayItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveDdays(items: DdayItem[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* quota */ }
}

export function exportDdays(items: DdayItem[]): string {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  }, null, 2)
}

export function importDdays(json: string): DdayItem[] | null {
  try {
    const obj = JSON.parse(json)
    const list = Array.isArray(obj) ? obj : (Array.isArray(obj.items) ? obj.items : null)
    if (!list) return null
    // 최소 필드만 확인
    return list.filter((it: unknown) => {
      const x = it as DdayItem
      return x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.targetDate === 'string'
    })
  } catch { return null }
}

/** 새 ID 생성 */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* 포맷 헬퍼 */
export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fmtDateKo(d: Date | string, withDow = true): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const dow = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  const base = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  return withDow ? `${base} (${dow})` : base
}
