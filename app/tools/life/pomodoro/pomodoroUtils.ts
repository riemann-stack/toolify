// ─────────────────────────────────────────────────────────────
// 뽀모도로 타이머 — 데이터·헬퍼
// ─────────────────────────────────────────────────────────────

export type Phase = 'focus' | 'short' | 'long'

export const PHASES: Record<Phase, { label: string; color: string; defaultMin: number }> = {
  focus: { label: '집중',     color: '#C8FF3E', defaultMin: 25 },
  short: { label: '짧은 휴식', color: '#3EC8FF', defaultMin: 5  },
  long:  { label: '긴 휴식',  color: '#FF8C3E', defaultMin: 15 },
}

// ─────────────────────────────────────────────────────────────
// 7가지 프리셋
// ─────────────────────────────────────────────────────────────
export type Preset = {
  id: string
  name: string
  emoji: string
  focus: number
  short: number
  long: number
  every: number
  desc: string
  badge?: string
}

export const POMODORO_PRESETS: Preset[] = [
  {
    id: 'classic',
    name: '클래식 (25/5)',
    emoji: '🍅',
    focus: 25, short: 5, long: 15, every: 4,
    desc: '뽀모도로 기법 원조. 처음 입문자에게 가장 추천.',
    badge: '추천',
  },
  {
    id: 'student',
    name: '학생용 (30/10)',
    emoji: '📚',
    focus: 30, short: 10, long: 30, every: 4,
    desc: '한 단원 학습 + 충분한 정리 시간. 중·고등학생에게 적합.',
  },
  {
    id: 'pro',
    name: '프로 (50/10)',
    emoji: '💼',
    focus: 50, short: 10, long: 30, every: 3,
    desc: '딥워크형. 프로그래밍·디자인·논문 등 깊은 몰입 필요한 작업.',
  },
  {
    id: 'ultra',
    name: '울트라 딥워크 (90/20)',
    emoji: '🧠',
    focus: 90, short: 20, long: 30, every: 2,
    desc: '90분 집중 + 20분 휴식. 인지 리듬(ultradian rhythm) 기반.',
  },
  {
    id: 'desktime',
    name: 'DeskTime (52/17)',
    emoji: '📊',
    focus: 52, short: 17, long: 30, every: 3,
    desc: 'DeskTime 분석에서 가장 생산성이 높은 직장인의 평균 패턴.',
  },
  {
    id: 'suneung',
    name: '수능형 (80/20)',
    emoji: '🎓',
    focus: 80, short: 20, long: 30, every: 2,
    desc: '수능 1교시 시간(80분)에 맞춘 모의 학습용.',
  },
  {
    id: 'reverse',
    name: '리버스 (5/25)',
    emoji: '🔄',
    focus: 5, short: 25, long: 30, every: 4,
    desc: '집중 시작이 어려운 날. 5분만 일하고 25분 쉬는 부담 없는 모드.',
  },
]

// ─────────────────────────────────────────────────────────────
// 알림음 테마
// ─────────────────────────────────────────────────────────────
export type SoundTheme = {
  id: string
  name: string
  desc: string
  freq: number
  type: OscillatorType
  duration: number
  pulses?: number
}

export const SOUND_THEMES: SoundTheme[] = [
  { id: 'bell',     name: '🔔 종소리',  desc: '맑고 부드러운 종소리', freq: 880, type: 'sine',     duration: 0.8, pulses: 1 },
  { id: 'beep',     name: '📢 알람',    desc: '뚜렷한 디지털 비프',   freq: 1000, type: 'square',  duration: 0.3, pulses: 3 },
  { id: 'soft',     name: '🌊 부드러움', desc: '낮은 진동의 따뜻한 톤', freq: 440, type: 'sine',    duration: 1.2, pulses: 1 },
  { id: 'crisp',    name: '✨ 청량음',  desc: '높고 짧은 주의환기',    freq: 1320, type: 'triangle', duration: 0.4, pulses: 2 },
  { id: 'silent',   name: '🔇 무음',    desc: '소리 끄기 (브라우저 알림만)', freq: 0, type: 'sine', duration: 0, pulses: 0 },
]

export function playSound(theme: SoundTheme) {
  if (theme.id === 'silent' || theme.duration === 0) return
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
    const Ctx = w.AudioContext || w.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const pulses = Math.max(1, theme.pulses ?? 1)
    for (let i = 0; i < pulses; i++) {
      const start = ctx.currentTime + i * (theme.duration + 0.12)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = theme.type
      osc.frequency.value = theme.freq
      gain.gain.setValueAtTime(0.32, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + theme.duration)
      osc.start(start); osc.stop(start + theme.duration + 0.05)
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// 백색소음·앰비언트 (가이드용 추천 목록)
// ─────────────────────────────────────────────────────────────
export const AMBIENT_SOUNDS = [
  { id: 'rain',    emoji: '🌧️', name: '빗소리',         desc: '집중·수면에 가장 효과적인 핑크 노이즈 계열' },
  { id: 'cafe',    emoji: '☕', name: '카페 소음',       desc: '약 70dB 백색소음. 창의적 작업에 도움' },
  { id: 'forest',  emoji: '🌲', name: '숲·새소리',       desc: '자연음은 코르티솔(스트레스 호르몬) 감소' },
  { id: 'wave',    emoji: '🌊', name: '파도소리',       desc: '리듬감 있는 저주파, 명상·휴식에 적합' },
  { id: 'fire',    emoji: '🔥', name: '장작 타는 소리', desc: '겨울철 따뜻한 분위기. ASMR 효과' },
  { id: 'fan',     emoji: '💨', name: '선풍기·환풍기',   desc: '순수 백색소음. 외부 소음 차단에 강함' },
  { id: 'lofi',    emoji: '🎧', name: 'Lo-Fi 비트',     desc: '가사 없는 부드러운 비트. 학습·코딩에 인기' },
  { id: 'silence', emoji: '🤫', name: '완전한 정적',     desc: '고도 집중 시 가장 효과적. 다만 산만함 ↑ 가능' },
]

// ─────────────────────────────────────────────────────────────
// 세션 기록 (localStorage)
// ─────────────────────────────────────────────────────────────
export type PomodoroSession = {
  id: string
  date: string         // YYYY-MM-DD
  ts: number           // 완료 시각 (ms)
  task: string         // 작업명
  phase: Phase         // 완료한 단계
  durationMin: number  // 실제 완료 시간(분)
  preset?: string      // 프리셋 id
}

const STORAGE_KEY = 'pomodoro:sessions:v1'
const KEEP_DAYS = 90

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadSessions(): PomodoroSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as PomodoroSession[]
    if (!Array.isArray(arr)) return []
    const cutoff = Date.now() - KEEP_DAYS * 86400_000
    return arr.filter(s => s.ts >= cutoff)
  } catch { return [] }
}

export function saveSessions(arr: PomodoroSession[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch {}
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─────────────────────────────────────────────────────────────
// 통계 헬퍼
// ─────────────────────────────────────────────────────────────
export type DailyStat = {
  date: string
  focusCount: number
  focusMin: number
}

export function getDailyStats(sessions: PomodoroSession[], days: number): DailyStat[] {
  const out: DailyStat[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const ds = todayStr(d)
    const todays = sessions.filter(s => s.date === ds && s.phase === 'focus')
    out.push({
      date: ds,
      focusCount: todays.length,
      focusMin: todays.reduce((a, s) => a + s.durationMin, 0),
    })
  }
  return out
}

export type Insights = {
  todayCount: number
  todayMin: number
  weekCount: number
  weekMin: number
  monthCount: number
  monthMin: number
  bestHour: number | null      // 가장 집중 잘된 시간대 (0~23)
  bestDayOfWeek: number | null // 가장 집중 잘된 요일 (0=일~6=토)
  totalCount: number
  totalMin: number
  streak: number               // 연속 일수
}

export function getInsights(sessions: PomodoroSession[]): Insights {
  const focusOnly = sessions.filter(s => s.phase === 'focus')
  const today = todayStr()
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)

  const inWeek = focusOnly.filter(s => s.ts >= weekStart.getTime())
  const inMonth = focusOnly.filter(s => s.ts >= monthStart.getTime())
  const inToday = focusOnly.filter(s => s.date === today)

  // 시간대별 카운트
  const hourCount: Record<number, number> = {}
  const dowCount: Record<number, number> = {}
  for (const s of focusOnly) {
    const d = new Date(s.ts)
    const h = d.getHours(); const dow = d.getDay()
    hourCount[h] = (hourCount[h] ?? 0) + 1
    dowCount[dow] = (dowCount[dow] ?? 0) + 1
  }
  const bestHour = Object.keys(hourCount).length > 0
    ? Number(Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0])
    : null
  const bestDayOfWeek = Object.keys(dowCount).length > 0
    ? Number(Object.entries(dowCount).sort((a, b) => b[1] - a[1])[0][0])
    : null

  // 연속 일수 (오늘 또는 어제부터 거꾸로)
  const dateSet = new Set(focusOnly.map(s => s.date))
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const ds = todayStr(d)
    if (dateSet.has(ds)) streak++
    else if (i === 0) continue  // 오늘 아직 안 했어도 어제부터 카운트
    else break
  }

  return {
    todayCount: inToday.length,
    todayMin: inToday.reduce((a, s) => a + s.durationMin, 0),
    weekCount: inWeek.length,
    weekMin: inWeek.reduce((a, s) => a + s.durationMin, 0),
    monthCount: inMonth.length,
    monthMin: inMonth.reduce((a, s) => a + s.durationMin, 0),
    bestHour,
    bestDayOfWeek,
    totalCount: focusOnly.length,
    totalMin: focusOnly.reduce((a, s) => a + s.durationMin, 0),
    streak,
  }
}

export const DOW_KO = ['일', '월', '화', '수', '목', '금', '토']

// ─────────────────────────────────────────────────────────────
// 일일 목표
// ─────────────────────────────────────────────────────────────
export const DAILY_GOAL_OPTIONS = [4, 8, 12, 16] as const

// ─────────────────────────────────────────────────────────────
// 브라우저 알림
// ─────────────────────────────────────────────────────────────
export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

export function sendNotif(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try { new Notification(title, { body, icon: '/favicon.ico', tag: 'pomodoro' }) } catch {}
}

export function fmtMinHour(min: number): string {
  if (min < 60) return `${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}
