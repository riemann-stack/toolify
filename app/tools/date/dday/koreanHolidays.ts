/* 한국 법정 공휴일 (2026~2030) — 신정·삼일절·어린이날·현충일·광복절·개천절·한글날·성탄절 (양력 고정)
   설날·추석·부처님오신날 (음력 → 양력 환산), 대체 공휴일 포함.
   임시 공휴일은 제외 (정부 발표 시 별도 추가 필요). */

export type Holiday = { date: string; name: string }

export const KOREAN_HOLIDAYS: Record<number, Holiday[]> = {
  2026: [
    { date: '2026-01-01', name: '신정' },
    { date: '2026-02-16', name: '설날 연휴' },
    { date: '2026-02-17', name: '설날' },
    { date: '2026-02-18', name: '설날 연휴' },
    { date: '2026-03-01', name: '삼일절' },
    { date: '2026-03-02', name: '삼일절 대체공휴일' },
    { date: '2026-05-05', name: '어린이날' },
    { date: '2026-05-24', name: '부처님오신날' },
    { date: '2026-05-25', name: '부처님오신날 대체공휴일' },
    { date: '2026-06-06', name: '현충일' },
    { date: '2026-08-15', name: '광복절' },
    { date: '2026-09-24', name: '추석 연휴' },
    { date: '2026-09-25', name: '추석' },
    { date: '2026-09-26', name: '추석 연휴' },
    { date: '2026-10-03', name: '개천절' },
    { date: '2026-10-09', name: '한글날' },
    { date: '2026-12-25', name: '성탄절' },
  ],
  2027: [
    { date: '2027-01-01', name: '신정' },
    { date: '2027-02-06', name: '설날 연휴' },
    { date: '2027-02-07', name: '설날' },
    { date: '2027-02-08', name: '설날 연휴' },
    { date: '2027-02-09', name: '설날 대체공휴일' },
    { date: '2027-03-01', name: '삼일절' },
    { date: '2027-05-05', name: '어린이날' },
    { date: '2027-05-13', name: '부처님오신날' },
    { date: '2027-06-06', name: '현충일' },
    { date: '2027-08-15', name: '광복절' },
    { date: '2027-08-16', name: '광복절 대체공휴일' },
    { date: '2027-09-14', name: '추석 연휴' },
    { date: '2027-09-15', name: '추석' },
    { date: '2027-09-16', name: '추석 연휴' },
    { date: '2027-10-03', name: '개천절' },
    { date: '2027-10-04', name: '개천절 대체공휴일' },
    { date: '2027-10-09', name: '한글날' },
    { date: '2027-12-25', name: '성탄절' },
  ],
  2028: [
    { date: '2028-01-01', name: '신정' },
    { date: '2028-01-26', name: '설날 연휴' },
    { date: '2028-01-27', name: '설날' },
    { date: '2028-01-28', name: '설날 연휴' },
    { date: '2028-03-01', name: '삼일절' },
    { date: '2028-05-02', name: '부처님오신날' },
    { date: '2028-05-05', name: '어린이날' },
    { date: '2028-06-06', name: '현충일' },
    { date: '2028-08-15', name: '광복절' },
    { date: '2028-10-02', name: '추석 연휴' },
    { date: '2028-10-03', name: '추석·개천절' },
    { date: '2028-10-04', name: '추석 연휴' },
    { date: '2028-10-05', name: '추석 대체공휴일' },
    { date: '2028-10-09', name: '한글날' },
    { date: '2028-12-25', name: '성탄절' },
  ],
  2029: [
    { date: '2029-01-01', name: '신정' },
    { date: '2029-02-12', name: '설날 연휴' },
    { date: '2029-02-13', name: '설날' },
    { date: '2029-02-14', name: '설날 연휴' },
    { date: '2029-03-01', name: '삼일절' },
    { date: '2029-05-05', name: '어린이날·부처님오신날' },
    { date: '2029-05-07', name: '어린이날 대체공휴일' },
    { date: '2029-06-06', name: '현충일' },
    { date: '2029-08-15', name: '광복절' },
    { date: '2029-09-21', name: '추석 연휴' },
    { date: '2029-09-22', name: '추석' },
    { date: '2029-09-23', name: '추석 연휴' },
    { date: '2029-09-24', name: '추석 대체공휴일' },
    { date: '2029-10-03', name: '개천절' },
    { date: '2029-10-09', name: '한글날' },
    { date: '2029-12-25', name: '성탄절' },
  ],
  2030: [
    { date: '2030-01-01', name: '신정' },
    { date: '2030-02-02', name: '설날 연휴' },
    { date: '2030-02-03', name: '설날' },
    { date: '2030-02-04', name: '설날 연휴' },
    { date: '2030-03-01', name: '삼일절' },
    { date: '2030-05-05', name: '어린이날' },
    { date: '2030-05-09', name: '부처님오신날' },
    { date: '2030-06-06', name: '현충일' },
    { date: '2030-08-15', name: '광복절' },
    { date: '2030-09-11', name: '추석 연휴' },
    { date: '2030-09-12', name: '추석' },
    { date: '2030-09-13', name: '추석 연휴' },
    { date: '2030-10-03', name: '개천절' },
    { date: '2030-10-09', name: '한글날' },
    { date: '2030-12-25', name: '성탄절' },
  ],
}

export function isHoliday(date: Date): Holiday | null {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const key = `${y}-${m}-${d}`
  return KOREAN_HOLIDAYS[y]?.find(h => h.date === key) ?? null
}

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
  { id: 'exam',        name: '시험·자격증',  emoji: '📚', color: '#3EC8FF' },
  { id: 'travel',      name: '여행',         emoji: '✈️', color: '#FFD700' },
  { id: 'anniversary', name: '기념일',       emoji: '🎉', color: '#FF6B6B' },
  { id: 'work',        name: '업무·프로젝트', emoji: '💼', color: '#9B59B6' },
  { id: 'sport',       name: '운동·대회',    emoji: '🏃', color: '#3EFF9B' },
  { id: 'military',    name: '군 복무',      emoji: '🎖️', color: '#FF8C3E' },
  { id: 'birthday',    name: '생일',         emoji: '🎂', color: '#FF85B3' },
  { id: 'wedding',     name: '결혼',         emoji: '💒', color: '#FFD0E1' },
  { id: 'health',      name: '건강·금연',    emoji: '🌿', color: '#3EFFD0' },
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
