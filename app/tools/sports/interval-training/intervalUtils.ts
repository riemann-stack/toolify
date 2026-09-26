// ─────────────────────────────────────────────────────────────
// 인터벌 훈련 — VDOT 강도 페이스·대회 일정 계산
// VDOT·페이스 공식(Daniels/Gilbert)과 강도 계수는 lib/running.ts 단일 소스를 그대로 쓴다.
// ─────────────────────────────────────────────────────────────
import { vdotFromRace, paceFromVdot, timeFromVdot, DANIELS_PCT, E_FAST_PCT, type DanielsZone } from '@/lib/running'

export type Intensity = DanielsZone

// Daniels %VO2max 강도 계수 — buildup(INTENSITY_LABEL)·vo2max(trainingPaces)·race-predictor와 같은 lib 값.
// E는 59~74% 범위라 느린 끝(DANIELS_PCT.E)과 빠른 끝(E_FAST_PCT)을 따로 둔다.
export const INTENSITY_PCT: Readonly<Record<Intensity, number>> = DANIELS_PCT
export { E_FAST_PCT }

// 계산을 보여 줄 VDOT 범위 — 20 미만(5K 약 43분 초과)·85 초과(세계기록 수준 초과)는
// 입력 오류이거나 공식 적용 범위 밖이라 결과 대신 경고를 띄운다.
export const VDOT_MIN = 20
export const VDOT_MAX = 85
export const isVdotInRange = (v: number) => v >= VDOT_MIN && v <= VDOT_MAX

export function calcVDOT(timeSec: number, distanceM: number): number {
  if (!(timeSec > 0) || !(distanceM > 0)) return 0
  return vdotFromRace(distanceM / 1000, timeSec)
}

// 강도별 1km 페이스(초). 표 보간 대신 공식으로 연속 계산한다.
export function getPace(vdot: number, intensity: Intensity): number {
  if (!(vdot > 0)) return 0
  return paceFromVdot(vdot, INTENSITY_PCT[intensity])
}

export { timeFromVdot }

// ── 한국 인기 대회 ─────────────────────────
// 개최일은 해마다 바뀌므로 최근 개최 요일 규칙으로 추정한다(카드에 '추정'으로 표시).
// 2026 실제 개최일: 대구 2/22, 서울(동아) 3/15, 서울하프 4/26, 춘천 10/25, JTBC 11/1
export type RaceRule = { month: number; nth: number | 'last'; weekday: number }
export const KOREA_RACES: { name: string; rule: RaceRule; distances: string }[] = [
  { name: '대구마라톤',               rule: { month: 2,  nth: 4,      weekday: 0 }, distances: '풀·10.9km' },
  { name: '서울마라톤(동아마라톤)',   rule: { month: 3,  nth: 3,      weekday: 0 }, distances: '풀·10km' },
  { name: '서울하프마라톤',           rule: { month: 4,  nth: 'last', weekday: 0 }, distances: '하프·10km' },
  { name: '춘천마라톤',               rule: { month: 10, nth: 'last', weekday: 0 }, distances: '풀·10km' },
  { name: 'JTBC서울마라톤',           rule: { month: 11, nth: 1,      weekday: 0 }, distances: '풀·10km' },
]

export function raceDate(year: number, rule: RaceRule): Date {
  if (rule.nth === 'last') {
    const last = new Date(year, rule.month, 0)  // 해당 월 말일
    const back = (last.getDay() - rule.weekday + 7) % 7
    return new Date(year, rule.month - 1, last.getDate() - back)
  }
  const first = new Date(year, rule.month - 1, 1)
  const offset = (rule.weekday - first.getDay() + 7) % 7
  return new Date(year, rule.month - 1, 1 + offset + (rule.nth - 1) * 7)
}

// 실제 D-day(days)와 스케줄 생성용 클램프 주수(weeks 4~16)를 분리 반환
// — 둘을 합치면 16주 밖 대회가 전부 D-112로 보이는 버그 발생
// 올해 대회일이 이미 지났을 때만 내년으로 넘긴다(대회 당일은 D-0).
export function raceTiming(rule: RaceRule, now: Date = new Date()): { date: Date; days: number; weeks: number } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let date = raceDate(today.getFullYear(), rule)
  if (date.getTime() < today.getTime()) date = raceDate(today.getFullYear() + 1, rule)
  const days = Math.round((date.getTime() - today.getTime()) / 86400000)
  const weeks = Math.max(4, Math.min(16, Math.round(days / 7)))
  return { date, days, weeks }
}

export type SchedRaceType = '5k' | '10k' | 'half' | 'marathon'
export const SCHED_DIST_M: Record<SchedRaceType, number> = {
  '5k': 5000, '10k': 10000, half: 21097.5, marathon: 42195,
}
export const SCHED_DEFAULT_RECORD: Record<SchedRaceType, { min: string; sec: string }> = {
  '5k': { min: '22', sec: '30' },
  '10k': { min: '48', sec: '00' },
  half: { min: '105', sec: '00' },
  marathon: { min: '210', sec: '00' },
}

// 종목을 바꿀 때 기존 기록을 같은 VDOT의 새 종목 환산 기록(분:초)으로 바꾼다.
// VDOT가 범위 밖이면 새 종목 기본 기록을 쓴다.
export function convertRecord(vdot: number, to: SchedRaceType): { min: string; sec: string } {
  if (!isVdotInRange(vdot)) return SCHED_DEFAULT_RECORD[to]
  const t = Math.round(timeFromVdot(SCHED_DIST_M[to] / 1000, vdot))
  return { min: String(Math.floor(t / 60)), sec: String(t % 60).padStart(2, '0') }
}
