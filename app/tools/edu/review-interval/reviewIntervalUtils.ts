/* 복습 간격 계산기 — 일정·SM-2·망각곡선 모델·시험일 역산의 순수 계산
   (page.tsx 가이드 표·예시와 ReviewIntervalClient.tsx가 함께 쓰는 단일 소스) */

export type Difficulty = 'easy' | 'normal' | 'hard'
export type Intensity = 'fast' | 'normal' | 'relaxed'

/** 난이도별 기본 복습 간격(학습일 0 기준 D+n) */
export const SIMPLE_INTERVALS: Record<Difficulty, number[]> = {
  easy:   [1, 4, 10, 21, 45],
  normal: [1, 3, 7, 14, 30],
  hard:   [1, 2, 5, 10, 21],
}
/** 강도 배율 — 기본 간격에 곱한 뒤 반올림(최소 1일) */
export const INTENSITY_MULT: Record<Intensity, number> = { fast: 0.7, normal: 1.0, relaxed: 1.5 }
/** 시험 전 최종 복습 — 시험일 며칠 전에 넣는가 */
export const FINAL_REVIEW_OFFSET: Record<Difficulty, number> = { easy: 2, normal: 2, hard: 1 }

export function addDays(date: Date, days: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() + days)
  return r
}
export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/** 난이도 × 강도로 정해지는 복습일(D+n) 목록 */
export function scheduleOffsets(d: Difficulty, i: Intensity): number[] {
  return SIMPLE_INTERVALS[d].map(v => Math.max(1, Math.round(v * INTENSITY_MULT[i])))
}

export type ScheduleRow = { round: number; interval: number; date: Date; recommended: string; isFinal?: boolean }
/** 간단 복습 일정 — 시험일 당일·이후 회차는 빼고, 마지막 일반 복습보다 뒤라면 최종 복습(시험 FINAL_REVIEW_OFFSET일 전)을 더한다 */
export function buildSimpleSchedule(start: Date, d: Difficulty, i: Intensity, exam: Date | null): ScheduleRow[] {
  const rows: ScheduleRow[] = scheduleOffsets(d, i)
    .map((interval, k) => ({
      round: k + 1, interval, date: addDays(start, interval),
      recommended: k < 2 ? '10~15분' : k < 4 ? '15~20분' : '20~30분',
    }))
    .filter(r => !exam || r.date < exam)
  const finalReview = exam ? addDays(exam, -FINAL_REVIEW_OFFSET[d]) : null
  if (finalReview && finalReview > start) {
    const last = rows[rows.length - 1]
    if (!last || finalReview > last.date) {
      rows.push({ round: rows.length + 1, interval: diffDays(start, finalReview), date: finalReview, recommended: '30분~ (최종 복습)', isFinal: true })
    }
  }
  return rows
}

/* ── SM-2 ── */
export type SM2Input = { quality: number; repetitions: number; ef: number; interval: number }
export type SM2Output = { nextInterval: number; nextEF: number; nextRepetitions: number }
/** 이 도구는 소수 간격을 반올림(Math.round)한다. 원문(Wozniak 1987)은 올림 — 가이드의 비교용으로 round를 바꿔 넣을 수 있다 */
export function sm2(input: SM2Input, round: (x: number) => number = Math.round): SM2Output {
  const { quality } = input
  const ef = Math.max(1.3, input.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  if (quality < 3) return { nextInterval: 1, nextEF: ef, nextRepetitions: 0 }
  const reps = input.repetitions + 1
  const interval = reps === 1 ? 1 : reps === 2 ? 6 : round(input.interval * ef)
  return { nextInterval: interval, nextEF: ef, nextRepetitions: reps }
}

/* ── 망각곡선 그래프용 단순 지수 모델: R = e^(−t/S)·100, 복습마다 100% 회복 + 안정도 S ×1.6 ── */
export const CURVE_BASE_STABILITY = 2.5
export const CURVE_GROWTH = 1.6
export const retention = (days: number, stability = CURVE_BASE_STABILITY) => Math.exp(-days / stability) * 100

/* ── 시험일 역산 ── */
/** 하루 처리량 중 신규 학습에 쓰는 비율 */
export const EXAM_NEW_SHARE = 0.5
/** 복습 총시간 = 신규 학습 시간 × 이 배율 */
export const EXAM_REVIEW_RATIO = 1.5
/** 신규 학습은 시험 며칠 전까지 끝나야 하는가 */
export const EXAM_FINISH_BUFFER = 2
/** 일별 계획 — 복습 대상은 지금까지 익힌 항목의 40%, 최대 150개. 복습 1개 = 신규 1개 시간의 0.7배 */
export const DAILY_REVIEW_SHARE = 0.4
export const DAILY_REVIEW_MAX = 150
export const REVIEW_COST_RATIO = 0.7

export function examLoad(total: number, dailyHours: number, minPerItem: number) {
  const itemsPerDay = Math.max(1, Math.floor((dailyHours * 60) / minPerItem))
  const newItemsPerDay = Math.max(1, Math.floor(itemsPerDay * EXAM_NEW_SHARE))
  const learnDays = Math.ceil(total / newItemsPerDay)
  const totalLearnHours = (total * minPerItem) / 60
  const totalReviewHours = totalLearnHours * EXAM_REVIEW_RATIO
  return { itemsPerDay, newItemsPerDay, learnDays, totalLearnHours, totalReviewHours, totalRequiredHours: totalLearnHours + totalReviewHours }
}
type ExamLoad = ReturnType<typeof examLoad>
/** 신규 학습이 시험 EXAM_FINISH_BUFFER일 전까지 끝나지 않거나, 필요 시간이 가능 시간을 넘으면 부족 */
export function examShortage(load: ExamLoad, daysLeft: number, dailyHours: number): boolean {
  return load.learnDays > daysLeft - EXAM_FINISH_BUFFER || load.totalRequiredHours > daysLeft * dailyHours
}
/** examShortage가 false가 되는 최소 남은 일수 */
export function examMinDays(load: ExamLoad, dailyHours: number): number {
  return Math.max(Math.ceil(load.totalRequiredHours / dailyHours), load.learnDays + EXAM_FINISH_BUFFER)
}
