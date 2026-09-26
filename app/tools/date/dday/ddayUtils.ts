/* ──────────────────────────────────────────────────────
   dday/ddayUtils.ts — D-day 계산, 진행률, 평일·영업일,
   페이스, 반복 D-day, localStorage 관리
   ────────────────────────────────────────────────────── */

import { isHoliday, RECURRENCE_OPTIONS, type RecurrenceId } from './koreanHolidays'

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** 'YYYY-MM-DD'를 기기 로컬 자정으로 분해 파싱.
   new Date('YYYY-MM-DD')는 UTC 자정으로 해석돼 UTC 음수 시간대(미주 등)에서 하루 앞당겨진다.
   ISO 타임스탬프(createdAt 등 'T' 포함) 문자열은 그대로 Date로 해석한 뒤 로컬 자정으로 맞춘다.
   TODO: lib/date.ts로 이관 (공용 parseYmd) */
export function parseYmd(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s)
  d.setHours(0, 0, 0, 0)
  return d
}

/** 유효한 'YYYY-MM-DD' 문자열인지 (롤오버 날짜 2-31 등 거부) */
export function isYmd(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return false
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3])
}

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
  const target = parseYmd(targetStr)
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
  const start = parseYmd(startStr)
  const target = parseYmd(targetStr)
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
  const start = parseYmd(startStr)
  const end   = parseYmd(endStr)
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
  const start = parseYmd(startStr)
  const end   = parseYmd(endStr)
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
  const start = parseYmd(startStr)
  const end   = parseYmd(endStr)
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
  const start = parseYmd(startStr)
  const end   = parseYmd(endStr)
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

/** (연·월·일) 조합 — 해당 월에 없는 일이면 그 달 말일로 클램프 (평년 2/29 → 2/28, 짧은 달 31일 → 말일).
   month는 0-based이며 범위를 벗어나면 Date 생성자가 연도를 자동 이월한다. */
function makeClamped(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const d = new Date(year, month, Math.min(day, lastDay))
  d.setHours(0, 0, 0, 0)
  return d
}

/** start에 n개월을 더하되 월말을 초과하면 해당 월의 마지막 날로 클램프 (예: 1/31 +1월 → 2/28) */
function addMonthsClamped(date: Date, n: number): Date {
  return makeClamped(date.getFullYear(), date.getMonth() + n, date.getDate())
}

/** 두 날짜 사이의 (년·월·일) 분해 — 앵커 방식으로 월경계 음수일 버그 방지.
   (구 로직은 1/31→3/1을 '1월 -2일'로 잘못 계산) */
export function calcYMDDiff(startStr: string, endStr: string) {
  const start = parseYmd(startStr)
  const end   = parseYmd(endStr)
  if (end < start) return { years: 0, months: 0, days: 0 }
  // 총 개월 수를 구한 뒤, start+months가 end를 넘으면 1개월 줄여 앵커를 end 이하로 맞춘다.
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  let anchor = addMonthsClamped(start, months)
  if (anchor > end) { months--; anchor = addMonthsClamped(start, months) }
  const days = Math.round((end.getTime() - anchor.getTime()) / MS_PER_DAY)
  return { years: Math.floor(months / 12), months: months % 12, days }
}

/** N일 후 (모드별) */
export type AddDaysMode = 'calendar' | 'weekday' | 'business'
/** N 상한 (±100년) — 큰 값이면 평일·영업일 루프가 UI를 멈추고 달력일은 Invalid Date가 된다 */
export const ADD_DAYS_MAX = 36_500
export function addDays(startStr: string, n: number, mode: AddDaysMode): Date {
  const cur = parseYmd(startStr)
  n = Math.max(-ADD_DAYS_MAX, Math.min(ADD_DAYS_MAX, Math.trunc(n) || 0))
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
  const target = parseYmd(item.targetDate)
  const refMid = new Date(ref); refMid.setHours(0,0,0,0)
  if (item.recurrence === 'none' || target >= refMid) return target

  // 각 분기 모두 '오늘'을 유효한 발생일로 인정한다 (오늘이 기념일/해당 요일이면 D-day).
  if (item.recurrence === 'yearly') {
    // 2/29 매년 반복은 평년에 2/28로 클램프 (makeClamped) — 3/1로 밀리지 않는다.
    const thisYear = makeClamped(refMid.getFullYear(), target.getMonth(), target.getDate())
    return thisYear < refMid
      ? makeClamped(refMid.getFullYear() + 1, target.getMonth(), target.getDate())
      : thisYear
  }
  if (item.recurrence === 'monthly') {
    // 31일 매월 반복은 짧은 달에서 말일로 클램프 (2월 → 2/28) — 다음 달 초로 밀리지 않는다.
    const thisMonth = makeClamped(refMid.getFullYear(), refMid.getMonth(), target.getDate())
    return thisMonth < refMid
      ? makeClamped(refMid.getFullYear(), refMid.getMonth() + 1, target.getDate())
      : thisMonth
  }
  if (item.recurrence === 'weekly') {
    const next = new Date(refMid)
    const delta = (target.getDay() - refMid.getDay() + 7) % 7   // 오늘이 해당 요일이면 0 = 오늘
    next.setDate(next.getDate() + delta)
    return next
  }
  return target
}

/** 카드 표시·정렬 공용 — 반복 D-day는 다음 발생일, 아니면 원래 목표일 (YYYY-MM-DD) */
export function effectiveTargetStr(item: DdayItem, ref: Date = new Date()): string {
  return item.recurrence !== 'none' ? fmtDate(nextRecurrence(item, ref)) : item.targetDate
}

/** 페이스 계산 (학습·저축 등) */
export type PaceCalc = {
  remainingDays: number
  remainingAmount: number
  dailyTarget: number
  weeklyTarget: number
  /** 시작일이 없거나 경과일이 0이면 null — 페이스 비교 불가 (0으로 두면 '달성 어려움' 오판) */
  currentPace: number | null
  elapsedDays: number
  expectedFinish: number | null
  isOnTrack: boolean | null
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
  // 음수 완료량은 의미가 없으므로 0으로 클램프 (진행률·예상 완료량이 음수로 표시되는 것 방지)
  const completed = Math.max(0, completedAmount)
  const target = parseYmd(targetStr)
  const remaining = dayDiff(target, ref)
  const remainingAmount = Math.max(0, totalAmount - completed)
  const elapsed = startStr ? Math.max(0, dayDiff(ref, parseYmd(startStr))) : 0
  const hasPace = elapsed > 0
  const currentPace = hasPace ? completed / elapsed : 0
  const dailyTarget = remaining > 0 ? remainingAmount / remaining : 0
  const expectedFinish = completed + currentPace * Math.max(0, remaining)
  const isOnTrack = expectedFinish >= totalAmount
  const deficit = hasPace ? Math.max(0, totalAmount - expectedFinish) : 0
  const additionalDailyNeeded = remaining > 0 ? deficit / remaining : 0
  return {
    remainingDays: remaining,
    remainingAmount,
    dailyTarget: Math.ceil(dailyTarget * 100) / 100,
    weeklyTarget: Math.ceil(dailyTarget * 7 * 10) / 10,
    currentPace: hasPace ? Math.round(currentPace * 100) / 100 : null,
    elapsedDays: elapsed,
    expectedFinish: hasPace ? Math.round(expectedFinish * 10) / 10 : null,
    isOnTrack: hasPace ? isOnTrack : null,
    deficit: Math.round(deficit * 10) / 10,
    additionalDailyNeeded: Math.ceil(additionalDailyNeeded * 100) / 100,
    percent: totalAmount > 0 ? Math.min(100, (completed / totalAmount) * 100) : 0,
  }
}

/* ──────────────────────────────────────────────────────
   localStorage
   ────────────────────────────────────────────────────── */
const STORAGE_KEY = 'youtil-ddays-v1'

const RECURRENCE_IDS: readonly string[] = RECURRENCE_OPTIONS.map(r => r.id)

/** 예전 버전·가져오기로 들어온 느슨한 날짜('2026-9-5', '2026/10/10', '2026.10.10', 'YYYY-MM-DDT…')를 YYYY-MM-DD로 정규화 — 로드 직후 저장 시 항목 유실 방지 */
function normalizeYmd(v: unknown): unknown {
  if (typeof v !== 'string') return v
  const m = /^\s*(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})\.?(?:[T\s].*)?$/.exec(v)
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : v
}

/** 저장·백업 JSON 한 건 검증 — 필수 필드가 깨졌으면 null, 선택 필드는 안전한 기본값으로 */
function sanitizeItem(it: unknown): DdayItem | null {
  if (!it || typeof it !== 'object') return null
  const x = it as Record<string, unknown>
  const targetDate = normalizeYmd(x.targetDate)
  const startDate = normalizeYmd(x.startDate)
  if (typeof x.id !== 'string' || typeof x.title !== 'string' || !isYmd(targetDate)) return null
  const g = x.goal as Record<string, unknown> | undefined
  const goal = g && typeof g === 'object'
    && typeof g.totalAmount === 'number' && Number.isFinite(g.totalAmount) && g.totalAmount > 0
    && typeof g.completedAmount === 'number' && Number.isFinite(g.completedAmount)
    ? { totalAmount: g.totalAmount, completedAmount: Math.max(0, g.completedAmount), unit: typeof g.unit === 'string' ? g.unit : '' }
    : undefined
  return {
    id: x.id,
    title: x.title,
    emoji: typeof x.emoji === 'string' ? x.emoji : '',
    category: typeof x.category === 'string' ? x.category : 'other',
    targetDate,
    startDate: isYmd(startDate) ? startDate : undefined,
    recurrence: typeof x.recurrence === 'string' && RECURRENCE_IDS.includes(x.recurrence) ? x.recurrence as RecurrenceId : 'none',
    isPinned: x.isPinned === true,
    isCompleted: x.isCompleted === true,
    goal,
    notes: typeof x.notes === 'string' ? x.notes : undefined,
    createdAt: typeof x.createdAt === 'string' && !isNaN(new Date(x.createdAt).getTime()) ? x.createdAt : new Date().toISOString(),
  }
}

export function loadDdays(): DdayItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map(sanitizeItem).filter((x): x is DdayItem => x !== null)
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
    const obj: unknown = JSON.parse(json)
    const items = obj && typeof obj === 'object' ? (obj as { items?: unknown }).items : undefined
    const list: unknown[] | null = Array.isArray(obj) ? obj : (Array.isArray(items) ? items : null)
    if (!list) return null
    return list.map(sanitizeItem).filter((x): x is DdayItem => x !== null)
  } catch { return null }
}

/** 새 ID 생성 */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* 포맷 헬퍼 */
export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? parseYmd(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fmtDateKo(d: Date | string, withDow = true): string {
  const date = typeof d === 'string' ? parseYmd(d) : d
  const dow = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  const base = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  return withDow ? `${base} (${dow})` : base
}
