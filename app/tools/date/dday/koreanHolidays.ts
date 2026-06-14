/* 공휴일 데이터는 lib/krHolidays.ts(단일 소스)로 이관됨.
   dday는 기존 import 경로 유지를 위해 여기서 재노출하고, 아래 D-day 전용 상수만 보유. */

export { KOREAN_HOLIDAYS, isHoliday, isHolidayStr, holidaysInYear } from '@/lib/krHolidays'
export type { Holiday } from '@/lib/krHolidays'

/** 한국 시즌 프리셋 — 자주 쓰는 D-day */
export const SEASONAL_PRESETS = [
  { name: '2026 수능',         date: '2026-11-12', emoji: '📚', category: 'exam' },
  { name: '2027 수능',         date: '2027-11-18', emoji: '📚', category: 'exam' },
  { name: '2026 설날',         date: '2026-02-17', emoji: '🎊', category: 'anniversary' },
  { name: '2026 어린이날',     date: '2026-05-05', emoji: '🧒', category: 'anniversary' },
  { name: '2026 추석',         date: '2026-09-25', emoji: '🌕', category: 'anniversary' },
  { name: '2026 크리스마스',   date: '2026-12-25', emoji: '🎄', category: 'anniversary' },
  { name: '2026 마지막 날',    date: '2026-12-31', emoji: '🌟', category: 'anniversary' },
  { name: '2027 새해',         date: '2027-01-01', emoji: '🎉', category: 'anniversary' },
]

/** D-day 카테고리 11종 */
export type DdayCategory = {
  id: string
  name: string
  emoji: string
  color: string
}
export const DDAY_CATEGORIES: DdayCategory[] = [
  { id: 'exam',        name: '시험·자격증',  emoji: '📚', color: '#0891B2' },
  { id: 'travel',      name: '여행',         emoji: '✈️', color: '#A16207' },
  { id: 'anniversary', name: '기념일',       emoji: '🎉', color: '#DC2626' },
  { id: 'work',        name: '업무·프로젝트', emoji: '💼', color: '#9B59B6' },
  { id: 'sport',       name: '운동·대회',    emoji: '🏃', color: '#059669' },
  { id: 'military',    name: '군 복무',      emoji: '🎖️', color: '#EA580C' },
  { id: 'birthday',    name: '생일',         emoji: '🎂', color: '#FF85B3' },
  { id: 'wedding',     name: '결혼',         emoji: '💒', color: '#FFD0E1' },
  { id: 'health',      name: '건강·금연',    emoji: '🌿', color: '#0D9488' },
  { id: 'finance',     name: '월급·결제일',  emoji: '💰', color: '#FFC53E' },
  { id: 'other',       name: '기타',         emoji: '📌', color: '#94A3B8' },
]

export const RECURRENCE_OPTIONS = [
  { id: 'none',    name: '반복 없음' },
  { id: 'yearly',  name: '매년' },
  { id: 'monthly', name: '매월' },
  { id: 'weekly',  name: '매주' },
] as const

export type RecurrenceId = typeof RECURRENCE_OPTIONS[number]['id']
