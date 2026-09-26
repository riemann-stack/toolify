// ─────────────────────────────────────────────────────────────
// 생리주기·배란일 계산기 — 표준 28일 모델 + 사용자 주기 보정
// 모든 데이터는 localStorage only · 서버 X
// ─────────────────────────────────────────────────────────────

import { todayStr } from '@/lib/date'

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

/**
 * color·bgColor = 도넛 채움·범례 점·배경 전용 (난포기 노랑·황체기 연보라는 흰 배경 글자 대비 미달).
 * ink = 글자(텍스트·SVG text)용 토큰 — 흰 배경 AA(4.5:1) 이상.
 */
export const PHASE_META: Record<Phase, { label: string; emoji: string; color: string; bgColor: string; ink: string }> = {
  menstrual:  { label: '생리기', emoji: '🩸', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.18)', ink: 'var(--danger)' },
  follicular: { label: '난포기', emoji: '🌱', color: '#FFD93E', bgColor: 'rgba(255, 217, 62, 0.18)', ink: 'var(--warning)' },
  ovulation:  { label: '배란기', emoji: '🥚', color: '#059669', bgColor: 'rgba(16, 185, 129, 0.20)', ink: 'var(--cat-finance-ink)' },
  luteal:     { label: '황체기', emoji: '🌙', color: '#B885DA', bgColor: 'rgba(184, 133, 218, 0.18)', ink: 'var(--cat-unit-ink)' },
}

export type Regularity = 'regular' | 'mild-irregular' | 'irregular'
export const REGULARITY_LABEL: Record<Regularity, string> = {
  'regular':         '규칙적 (변동 ±3일)',
  'mild-irregular':  '조금 불규칙 (±4~7일)',
  'irregular':       '많이 불규칙 (±8일+)',
}

export type PMSLevel = 'none' | 'mild' | 'severe'
export const PMS_LEVEL_LABEL: Record<PMSLevel, string> = {
  'none':    '없음',
  'mild':    '가벼움',
  'severe':  '심한 편',
}

export type Lifestyle = 'exercise' | 'diet' | 'sleep'
export const LIFESTYLE_LABEL: Record<Lifestyle, string> = {
  'exercise': '🏃 러닝/규칙 운동 중',
  'diet':     '🥗 다이어트 중',
  'sleep':    '😴 수면 패턴 추적',
}

// ── 날짜 유틸 (라이브러리 없음) ──────────
export function dateAdd(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
export function dateDiff(a: Date, b: Date): number {
  // a - b in days (시간 제거)
  const aT = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const bT = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((aT - bT) / 86400000)
}
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
export function isoDate(d: Date): string {
  // YYYY-MM-DD (로컬 시간 기준)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function fromIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function fmtKor(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}
export function fmtMonthDay(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// ── 주기 모델 ────────────────────────
/**
 * 배란일(1-indexed 주기 일차) — 황체기 14일 고정 모델: 배란일 = 다음 생리 시작일 − 14일.
 * 다음 생리 시작 = 주기 (avgCycle+1)일차 → 배란 = (avgCycle+1−14) = (avgCycle−13)일차.  예: 28일 주기 → 15일차.
 */
export function ovulationDayOf(avgCycle: number): number {
  return avgCycle - 13
}

/**
 * phase 경계 일차(각 구간의 시작 일차, 1-indexed). 분류 우선순위(생리기 > 배란기 > 난포기/황체기)와 같게 정합해
 * 짧은 주기 + 긴 생리(예: 21일·10일)에서도 구간이 겹치거나 역전되지 않는다. 빈 구간은 start === end.
 */
export function phaseDayBounds(periodLen: number, avgCycle: number) {
  const ov = ovulationDayOf(avgCycle)
  const mEnd = periodLen + 1                 // 난포기 시작(생리기 끝 다음 날)
  const oStart = Math.max(ov - 1, mEnd)      // 배란기 시작
  const oEnd = Math.max(ov + 2, oStart)      // 황체기 시작
  return { ov, mEnd, oStart, oEnd }
}

function classifyDay(day: number, periodLen: number, avgCycle: number): Phase {
  const ov = ovulationDayOf(avgCycle)
  if (day <= periodLen) return 'menstrual'
  if (day < ov - 1) return 'follicular'
  if (day <= ov + 1) return 'ovulation'
  return 'luteal'
}

// ── 메인 계산 ────────────────────────
export interface CycleInput {
  lastPeriod: Date           // 마지막 생리 시작일
  periodLength: number       // 3~7
  avgCycle: number           // 21~45
  today?: Date               // 기본: 오늘
}

export interface CycleResult {
  ovulationDate: Date        // 배란 예상일
  fertilityStart: Date       // 가임기 시작 (배란 -5)
  fertilityEnd: Date         // 가임기 끝 (배란 +1)
  nextPeriodDate: Date       // 다음 생리 예정
  pmsStart: Date             // PMS 예상 시작 (다음 생리 -7)
  pmsEnd: Date               // PMS 예상 끝 (다음 생리 -1)
  ovulationPassed: boolean   // 이번 주기 배란 예상일이 오늘 이전
  fertilityPassed: boolean   // 이번 주기 가임기가 이미 끝남
  nextOvulationDate: Date    // 다음 주기 배란 예상일 (= 이번 + avgCycle)
  nextFertilityStart: Date
  nextFertilityEnd: Date
  dayInCycle: number         // 1-indexed
  phase: Phase
  daysToNextPeriod: number   // 다음 생리까지 남은 일수 (앵커링으로 항상 1~avgCycle)
  cycleLength: number        // = avgCycle (편의)
  cyclesSinceLog: number     // 기록된 마지막 생리일로부터 지난 완전 주기 수 (0=현재 주기, ≥1=오래된 입력 → 자동 보정)
}

export function calcCycle(input: CycleInput): CycleResult {
  const today = startOfDay(input.today ?? new Date())
  const lastPeriod = startOfDay(input.lastPeriod)
  const avgCycle = input.avgCycle
  const periodLen = input.periodLength

  // 마지막 생리일이 오래된 경우(여러 주기 경과) 현재 주기로 자동 보정(anchoring).
  // 배란·가임기·다음 생리·PMS를 전부 raw lastPeriod가 아닌 "가장 최근 추정 생리 시작일(cycleStart)"
  // 기준으로 계산해야 다음 생리 예정일이 과거로 나오는 문제를 막을 수 있다.
  const daysSinceLog = dateDiff(today, lastPeriod)
  const cyclesSinceLog = Math.max(0, Math.floor(daysSinceLog / avgCycle))
  const cycleStart = dateAdd(lastPeriod, cyclesSinceLog * avgCycle)  // today 이전(이하)의 가장 최근 추정 생리 시작일

  let dayInCycle = dateDiff(today, cycleStart) + 1  // 1..avgCycle (cycleStart ≤ today < cycleStart + avgCycle)
  while (dayInCycle < 1) dayInCycle += avgCycle      // 방어: 검증을 우회한 미래 입력 등 예외 상황

  const nextPeriodDate = dateAdd(cycleStart, avgCycle)  // 항상 today 이후 (1~avgCycle일 뒤)
  const ovulationDate = dateAdd(nextPeriodDate, -14)    // 배란 = 다음 생리 − 14일 (= 주기 avgCycle−13일차)
  const fertilityStart = dateAdd(ovulationDate, -5)
  const fertilityEnd = dateAdd(ovulationDate, 1)
  const pmsStart = dateAdd(nextPeriodDate, -7)
  const pmsEnd = dateAdd(nextPeriodDate, -1)

  // 황체기 등 배란이 지난 뒤에는 다음 주기 배란·가임기를 함께 안내
  const ovulationPassed = dateDiff(ovulationDate, today) < 0
  const fertilityPassed = dateDiff(fertilityEnd, today) < 0
  const nextOvulationDate = dateAdd(ovulationDate, avgCycle)
  const nextFertilityStart = dateAdd(fertilityStart, avgCycle)
  const nextFertilityEnd = dateAdd(fertilityEnd, avgCycle)

  const phase = classifyDay(dayInCycle, periodLen, avgCycle)

  const daysToNextPeriod = dateDiff(nextPeriodDate, today)

  return {
    ovulationDate, fertilityStart, fertilityEnd,
    nextPeriodDate, pmsStart, pmsEnd,
    ovulationPassed, fertilityPassed,
    nextOvulationDate, nextFertilityStart, nextFertilityEnd,
    dayInCycle, phase, daysToNextPeriod,
    cycleLength: avgCycle,
    cyclesSinceLog,
  }
}

// ── 날짜 → phase 분류 (캘린더용) ──────
/**
 * 임의 날짜의 phase를 반환. 다음 주기까지 자동 정규화.
 */
export function phaseOfDate(date: Date, input: CycleInput): {
  phase: Phase
  isPeriodStart: boolean
  isOvulation: boolean
  isInFertility: boolean
  isInPMS: boolean
  cycleDay: number
} {
  const start = startOfDay(input.lastPeriod)
  const target = startOfDay(date)
  const avgCycle = input.avgCycle
  const periodLen = input.periodLength
  const ovulationDay = ovulationDayOf(avgCycle)

  let cycleDay = dateDiff(target, start) + 1
  // 미래로 멀어진 경우 다음 주기로 점프 (현재 주기 +1, +2 ...)
  let cyclesAhead = 0
  while (cycleDay > avgCycle) {
    cycleDay -= avgCycle
    cyclesAhead++
  }
  // 과거 (입력일 이전)
  while (cycleDay < 1) {
    cycleDay += avgCycle
    cyclesAhead--
  }

  const phase = classifyDay(cycleDay, periodLen, avgCycle)

  const isPeriodStart = cycleDay === 1
  const isOvulation = cycleDay === ovulationDay
  const isInFertility = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1
  // PMS = 다음 생리 -7 ~ -1일 (cycleDay avgCycle-6 ~ avgCycle). 결과 카드의 pmsStart/pmsEnd와 동일 범위로 정합
  const isInPMS = cycleDay >= avgCycle - 6 && cycleDay <= avgCycle

  void cyclesAhead  // 미래 주기 카운트 (필요 시 활용)

  return { phase, isPeriodStart, isOvulation, isInFertility, isInPMS, cycleDay }
}

// ── 월간 캘린더 셀 생성 ─────────────────
export interface CalendarCell {
  date: Date
  inCurrentMonth: boolean
  phase: Phase
  isPeriodStart: boolean
  isOvulation: boolean
  isInFertility: boolean
  isInPMS: boolean
  isToday: boolean
  cycleDay: number
}

export function buildCalendar(year: number, month: number, input: CycleInput): CalendarCell[] {
  // month: 0~11
  const today = startOfDay(input.today ?? new Date())
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()  // 0=Sun
  // Sunday-start week (한국 통상)
  const gridStart = dateAdd(firstOfMonth, -startWeekday)
  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = dateAdd(gridStart, i)
    const info = phaseOfDate(d, input)
    cells.push({
      date: d,
      inCurrentMonth: d.getMonth() === month,
      phase: info.phase,
      isPeriodStart: info.isPeriodStart,
      isOvulation: info.isOvulation,
      isInFertility: info.isInFertility,
      isInPMS: info.isInPMS,
      isToday: dateDiff(d, today) === 0,
      cycleDay: info.cycleDay,
    })
  }
  return cells
}

// ── SVG 원형 차트 헬퍼 ─────────────────
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  // 0deg = 12시 방향, 시계방향
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  // 0deg = 12시·시계방향. 시계방향(sweep=1)으로 startAngle→endAngle.
  // 360° 풀 sector는 두 반호로 분할
  if (endAngle - startAngle >= 359.99) {
    const top = polarToCartesian(cx, cy, r, 0)
    const bottom = polarToCartesian(cx, cy, r, 180)
    return `M ${top.x} ${top.y} A ${r} ${r} 0 1 1 ${bottom.x} ${bottom.y} A ${r} ${r} 0 1 1 ${top.x} ${top.y} Z`
  }
  const startPos = polarToCartesian(cx, cy, r, startAngle)
  const endPos = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${startPos.x} ${startPos.y} A ${r} ${r} 0 ${largeArc} 1 ${endPos.x} ${endPos.y} Z`
}

/** Phase별 각도 (0deg = 12시·day 1). 빈 구간은 start === end — 렌더 시 건너뛴다. */
export function phaseAngles(input: CycleInput): Record<Phase, { start: number; end: number }> {
  const avgCycle = input.avgCycle
  const { mEnd, oStart, oEnd } = phaseDayBounds(input.periodLength, avgCycle)
  const deg = (day: number) => Math.min(360, (day - 1) / avgCycle * 360)
  return {
    menstrual:  { start: 0,            end: deg(mEnd) },
    follicular: { start: deg(mEnd),    end: deg(oStart) },
    ovulation:  { start: deg(oStart),  end: deg(oEnd) },
    luteal:     { start: deg(oEnd),    end: 360 },
  }
}

// ── 데이터 검증 ─────────────────────
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
/** YYYY-MM-DD 형식 + 실제 존재하는 날짜(2026-13-45처럼 넘치는 값 거부) */
export function isValidIsoDate(s: string): boolean {
  return ISO_DATE_RE.test(s) && isoDate(fromIso(s)) === s
}
export function validateInput(lastPeriodIso: string, periodLength: number, avgCycle: number, today: Date = new Date()): string | null {
  if (!lastPeriodIso) return '마지막 생리 시작일을 입력하세요.'
  if (!isValidIsoDate(lastPeriodIso)) return '날짜 형식이 올바르지 않습니다.'
  const date = fromIso(lastPeriodIso)
  const diff = dateDiff(today, date)
  if (diff < 0) return '미래 날짜는 입력할 수 없어요 (오늘 또는 과거).'
  if (diff > 365) return '1년 이상 지난 날짜는 정확도가 떨어져요.'
  if (periodLength < 2 || periodLength > 10) return '생리 기간은 2~10일 범위.'
  if (avgCycle < 21 || avgCycle > 45) return '평균 주기는 21~45일 범위 (그 외는 산부인과 상담).'
  return null
}

// ── 자가체크 기록 ────────────────────
export interface CycleRecord {
  id: string
  date: string  // YYYY-MM-DD
  isPeriodStart?: boolean
  mood?: 'good' | 'normal' | 'bad'
  notes?: string
}

export interface UserCycleSettings {
  lastPeriodDate: string         // YYYY-MM-DD
  periodLength: number
  avgCycle: number
  regularity?: Regularity
  pmsLevel?: PMSLevel
  trackingPregnancy?: boolean
  lifestyle?: Lifestyle[]
  records: CycleRecord[]
  updatedAt?: string
}

export const STORAGE_KEY = 'youtil:cycle:v1'

const MOODS = ['good', 'normal', 'bad'] as const
const REGULARITIES: Regularity[] = ['regular', 'mild-irregular', 'irregular']
const PMS_LEVELS: PMSLevel[] = ['none', 'mild', 'severe']
const LIFESTYLES: Lifestyle[] = ['exercise', 'diet', 'sleep']

function isMood(v: unknown): v is NonNullable<CycleRecord['mood']> {
  return typeof v === 'string' && (MOODS as readonly string[]).includes(v)
}

/** 손상·구버전 데이터 방어 — 형식이 맞는 기록만 남긴다 */
export function sanitizeRecords(v: unknown): CycleRecord[] {
  if (!Array.isArray(v)) return []
  const out: CycleRecord[] = []
  for (const r of v) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    if (typeof o.id !== 'string' || typeof o.date !== 'string' || !isValidIsoDate(o.date)) continue
    out.push({
      id: o.id,
      date: o.date,
      isPeriodStart: o.isPeriodStart === true ? true : undefined,
      mood: isMood(o.mood) ? o.mood : undefined,
      notes: typeof o.notes === 'string' && o.notes ? o.notes.slice(0, 200) : undefined,
    })
  }
  return out
}

export function loadCycleData(): UserCycleSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o: unknown = JSON.parse(raw)
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null
    const d = o as Record<string, unknown>
    const isInt = (v: unknown, lo: number, hi: number): v is number =>
      typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi
    return {
      lastPeriodDate: typeof d.lastPeriodDate === 'string' && isValidIsoDate(d.lastPeriodDate) ? d.lastPeriodDate : '',
      periodLength: isInt(d.periodLength, 2, 10) ? d.periodLength : 5,
      avgCycle: isInt(d.avgCycle, 21, 45) ? d.avgCycle : 28,
      regularity: REGULARITIES.includes(d.regularity as Regularity) ? (d.regularity as Regularity) : undefined,
      pmsLevel: PMS_LEVELS.includes(d.pmsLevel as PMSLevel) ? (d.pmsLevel as PMSLevel) : undefined,
      trackingPregnancy: typeof d.trackingPregnancy === 'boolean' ? d.trackingPregnancy : undefined,
      lifestyle: Array.isArray(d.lifestyle) ? d.lifestyle.filter((x): x is Lifestyle => LIFESTYLES.includes(x as Lifestyle)) : undefined,
      records: sanitizeRecords(d.records),
    }
  } catch { return null }
}
export function saveCycleData(data: UserCycleSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data, updatedAt: todayStr(),
    }))
  } catch { /* quota */ }
}
export function clearCycleData(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// ── 자가체크 누적 분석 ───────────────
/** 인접 시작일 간격 필터 — 15일 미만은 같은 생리의 중복 체크, 60일 초과는 기록 누락으로 보고 제외 */
export const CYCLE_GAP_MIN = 15
export const CYCLE_GAP_MAX = 60

export type RegularityLevel = 'regular' | 'mild' | 'irregular'

export interface CycleAnalysis {
  count: number          // 분석에 쓴 생리 시작일 수 (중복 제외)
  cycles: number[]       // 인접 period start 사이 일수 (누락 의심 간격 제외) — 비어 있으면 분석할 주기 없음
  avg: number            // cycles가 비면 NaN (호출부는 cycles.length로 분기)
  variance: number       // 변동폭 (max - min)
  level: RegularityLevel // 변동폭 ≤6(±3일) 규칙 / 7~15(±4~7일) 약간 불규칙 / ≥16(±8일+) 불규칙 — 페이지 FAQ 기준과 동일
  isRegular: boolean     // level === 'regular'
  mergedDuplicates: number  // 15일 미만 간격으로 합친 중복 시작 기록 수
  excludedGaps: number      // 60일 초과로 제외한 간격 수 (기록 누락 의심)
}

/**
 * 생리 시작 기록이 2건 미만이면 null.
 * 2건 이상인데 모든 간격이 병합(15일 미만)·제외(60일 초과)되면 cycles: [] 로 반환해
 * 호출부가 병합·제외 건수를 안내할 수 있게 한다(카드가 설명 없이 사라지지 않도록).
 */
export function analyzeRecords(records: CycleRecord[]): CycleAnalysis | null {
  const periodStarts = records
    .filter((r) => r.isPeriodStart)
    .map((r) => fromIso(r.date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (periodStarts.length < 2) return null

  const cycles: number[] = []
  let kept = 1, mergedDuplicates = 0, excludedGaps = 0
  let prev = periodStarts[0]
  for (let i = 1; i < periodStarts.length; i++) {
    const gap = dateDiff(periodStarts[i], prev)
    if (gap < CYCLE_GAP_MIN) { mergedDuplicates++; continue }   // 같은 생리를 연달아 체크 → 앞 날짜 유지
    if (gap > CYCLE_GAP_MAX) excludedGaps++                        // 중간 기록 누락 의심 → 간격만 제외
    else cycles.push(gap)
    prev = periodStarts[i]
    kept++
  }
  if (cycles.length === 0) {
    return {
      count: kept, cycles: [], avg: NaN, variance: 0,
      level: 'regular', isRegular: false,
      mergedDuplicates, excludedGaps,
    }
  }

  const avg = cycles.reduce((s, n) => s + n, 0) / cycles.length
  const variance = Math.max(...cycles) - Math.min(...cycles)
  const level: RegularityLevel = variance <= 6 ? 'regular' : variance <= 15 ? 'mild' : 'irregular'
  return {
    count: kept,
    cycles, avg,
    variance,
    level,
    isRegular: level === 'regular',
    mergedDuplicates, excludedGaps,
  }
}

// ── CSV ──────────────────────────────
export function recordsToCSV(records: CycleRecord[]): string {
  const head = 'date,isPeriodStart,mood,notes'
  const lines = records.map((r) => [
    r.date,
    r.isPeriodStart ? '1' : '',
    r.mood ?? '',
    `"${(r.notes ?? '').replace(/"/g, '""')}"`,
  ].join(','))
  return [head, ...lines].join('\n')
}
export function csvToRecords(csv: string): CycleRecord[] {
  const lines = csv.trim().split(/\r?\n/)
  const out: CycleRecord[] = []
  for (let i = 1; i < lines.length; i++) {  // skip header
    const parts = lines[i].match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(,|$)/g) ?? []
    const cells = parts.map((p) => p.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'))
    if (cells[0] && isValidIsoDate(cells[0])) {
      out.push({
        id: Math.random().toString(36).slice(2, 10),
        date: cells[0],
        isPeriodStart: cells[1] === '1' ? true : undefined,
        mood: isMood(cells[2]) ? cells[2] : undefined,
        notes: cells[3] ? cells[3].slice(0, 200) : undefined,
      })
    }
  }
  return out
}

// ── Phase 가이드 데이터 ──────────────
export interface PhaseGuide {
  phase: Phase
  desc: string
  exercise: string
  nutrition: string
  sleep: string
  notes: string[]
  warning?: string
}

export const PHASE_GUIDES: Record<Phase, PhaseGuide> = {
  menstrual: {
    phase: 'menstrual',
    desc: '몸이 회복에 집중하는 시기 — 무리 X, 휴식 ↑',
    exercise: '가벼운 걷기·요가·스트레칭. 고강도 운동은 피로 누적 ↑',
    nutrition: '철분·단백질 신경쓰기 (붉은 살코기·시금치·콩 일반 안내). 따뜻한 음료',
    sleep: '평소보다 30분~1시간 더 — 회복 우선',
    notes: ['복부 보온', '카페인·찬 음료 줄이기', '본인 컨디션 우선'],
    warning: '⚠️ 심한 통증·과다 출혈 지속 시 산부인과 전문의 상담을 받으세요',
  },
  follicular: {
    phase: 'follicular',
    desc: '컨디션 회복기 — 에너지·집중력 ↑ 경향',
    exercise: '인터벌·근력 운동 적합. 새 루틴 시작에 유리',
    nutrition: '균형 잡힌 식사. 다이어트 시작에 유리한 구간',
    sleep: '평소 패턴 유지',
    notes: ['새 운동 루틴 도전', '인지 능력 좋은 시기', '개인차 큼'],
  },
  ovulation: {
    phase: 'ovulation',
    desc: '배란 추정 구간 (±1~2일 변동 가능)',
    exercise: '컨디션 좋으면 고강도 OK. 무리는 X',
    nutrition: '평소대로. 수분 충분히',
    sleep: '평소 패턴 유지',
    notes: [
      '체온 0.3~0.5°C 살짝 ↑ 가능',
      '일부 아랫배 불편감(중간통)·분비물 변화',
      '임신 준비 중이면 가임기 참고 (3탭)',
    ],
  },
  luteal: {
    phase: 'luteal',
    desc: '후반부 PMS 가능 — 컨디션·기분 변동',
    exercise: '초반 중강도 → 후반 가볍게. 무리 운동 X',
    nutrition: '염분·카페인·당분 조절. 수분 충분히',
    sleep: '평소보다 더 신경쓰기 (수면 질 ↓ 경향)',
    notes: [
      '체중 일시 변동 — 주간 평균으로 보기',
      '식욕 ↑ 가능 — 자책 X',
      '격렬한 다이어트보다 유지 모드',
    ],
    warning: '⚠️ 심한 PMS (일상 영향) 시 산부인과 상담',
  },
}
