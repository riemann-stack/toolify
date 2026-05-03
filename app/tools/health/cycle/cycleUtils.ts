// ─────────────────────────────────────────────────────────────
// 생리주기·배란일 계산기 — 표준 28일 모델 + 사용자 주기 보정
// 모든 데이터는 localStorage only · 서버 X
// ─────────────────────────────────────────────────────────────

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export const PHASE_META: Record<Phase, { label: string; emoji: string; color: string; bgColor: string }> = {
  menstrual:  { label: '생리기', emoji: '🩸', color: '#FF8C8C', bgColor: 'rgba(255, 140, 140, 0.18)' },
  follicular: { label: '난포기', emoji: '🌱', color: '#FFD93E', bgColor: 'rgba(255, 217, 62, 0.18)' },
  ovulation:  { label: '배란기', emoji: '🥚', color: '#3EFF9B', bgColor: 'rgba(62, 255, 155, 0.20)' },
  luteal:     { label: '황체기', emoji: '🌙', color: '#B885DA', bgColor: 'rgba(184, 133, 218, 0.18)' },
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
  dayInCycle: number         // 1-indexed
  phase: Phase
  daysToNextPeriod: number   // 양수: 미래, 음수: 과거 (다음 주기 진입 후)
  cycleLength: number        // = avgCycle (편의)
}

export function calcCycle(input: CycleInput): CycleResult {
  const today = startOfDay(input.today ?? new Date())
  const lastPeriod = startOfDay(input.lastPeriod)
  const avgCycle = input.avgCycle
  const periodLen = input.periodLength

  let dayInCycle = dateDiff(today, lastPeriod) + 1  // 1-indexed
  // dayInCycle가 음수거나 avgCycle 초과 시 다음 주기로 정규화
  while (dayInCycle > avgCycle) dayInCycle -= avgCycle
  while (dayInCycle < 1) dayInCycle += avgCycle

  const ovulationDay = avgCycle - 14  // 1-indexed, e.g., 28일 주기 → 14일
  const ovulationDate = dateAdd(lastPeriod, ovulationDay - 1)
  const fertilityStart = dateAdd(ovulationDate, -5)
  const fertilityEnd = dateAdd(ovulationDate, 1)
  const nextPeriodDate = dateAdd(lastPeriod, avgCycle)
  const pmsStart = dateAdd(nextPeriodDate, -7)
  const pmsEnd = dateAdd(nextPeriodDate, -1)

  let phase: Phase
  if (dayInCycle <= periodLen) phase = 'menstrual'
  else if (dayInCycle < ovulationDay - 1) phase = 'follicular'
  else if (dayInCycle <= ovulationDay + 1) phase = 'ovulation'
  else phase = 'luteal'

  const daysToNextPeriod = dateDiff(nextPeriodDate, today)

  return {
    ovulationDate, fertilityStart, fertilityEnd,
    nextPeriodDate, pmsStart, pmsEnd,
    dayInCycle, phase, daysToNextPeriod,
    cycleLength: avgCycle,
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
  const ovulationDay = avgCycle - 14

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

  let phase: Phase
  if (cycleDay <= periodLen) phase = 'menstrual'
  else if (cycleDay < ovulationDay - 1) phase = 'follicular'
  else if (cycleDay <= ovulationDay + 1) phase = 'ovulation'
  else phase = 'luteal'

  const isPeriodStart = cycleDay === 1
  const isOvulation = cycleDay === ovulationDay
  const isInFertility = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1
  const isInPMS = cycleDay >= avgCycle - 6 && cycleDay <= avgCycle - 1

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

/** Phase별 각도 (0deg = 12시·day 1) */
export function phaseAngles(input: CycleInput): Record<Phase, { start: number; end: number }> {
  const avgCycle = input.avgCycle
  const periodLen = input.periodLength
  const ovulationDay = avgCycle - 14
  const deg = (day: number) => (day - 1) / avgCycle * 360
  return {
    menstrual:  { start: 0,                          end: deg(periodLen + 1) },
    follicular: { start: deg(periodLen + 1),         end: deg(ovulationDay - 1) },
    ovulation:  { start: deg(ovulationDay - 1),      end: deg(ovulationDay + 2) },
    luteal:     { start: deg(ovulationDay + 2),      end: 360 },
  }
}

// ── 데이터 검증 ─────────────────────
export function validateInput(lastPeriodIso: string, periodLength: number, avgCycle: number): string | null {
  if (!lastPeriodIso) return '마지막 생리 시작일을 입력하세요.'
  const date = fromIso(lastPeriodIso)
  if (isNaN(date.getTime())) return '날짜 형식이 올바르지 않습니다.'
  const today = new Date()
  const diff = dateDiff(today, date)
  if (diff < -7) return '미래 날짜는 입력 X.'
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

export function loadCycleData(): UserCycleSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserCycleSettings) : null
  } catch { return null }
}
export function saveCycleData(data: UserCycleSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data, updatedAt: new Date().toISOString().slice(0, 10),
    }))
  } catch { /* quota */ }
}
export function clearCycleData(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// ── 자가체크 누적 분석 ───────────────
export interface CycleAnalysis {
  count: number
  cycles: number[]       // 인접 period start 사이 일수
  avg: number
  variance: number       // 변동폭 (max - min)
  isRegular: boolean     // 변동 ≤±3일
}

export function analyzeRecords(records: CycleRecord[]): CycleAnalysis | null {
  const periodStarts = records
    .filter((r) => r.isPeriodStart)
    .map((r) => fromIso(r.date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (periodStarts.length < 2) return null

  const cycles: number[] = []
  for (let i = 1; i < periodStarts.length; i++) {
    cycles.push(dateDiff(periodStarts[i], periodStarts[i - 1]))
  }
  const avg = cycles.reduce((s, n) => s + n, 0) / cycles.length
  const variance = Math.max(...cycles) - Math.min(...cycles)
  return {
    count: periodStarts.length,
    cycles, avg,
    variance,
    isRegular: variance <= 6,  // ±3일 ≈ 6일 변동폭
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
    if (cells[0] && /^\d{4}-\d{2}-\d{2}/.test(cells[0])) {
      out.push({
        id: Math.random().toString(36).slice(2, 10),
        date: cells[0],
        isPeriodStart: cells[1] === '1',
        mood: (cells[2] as CycleRecord['mood']) || undefined,
        notes: cells[3] || undefined,
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
    warning: '⚠️ 심한 통증·과다 출혈 지속 시 산부인과 상담 (1577-1366)',
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
