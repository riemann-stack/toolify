/* lib/todayInfo.ts — '오늘 · 다음 공휴일' 계산 (홈 LiveWidget 서버 초기값 + 클라이언트 재계산 공용).
   'use client' 파일의 export는 서버에서 호출할 수 없으므로 순수 함수는 여기 둔다. 공휴일은 lib/krHolidays 단일 소스. */
import { holidaysInYear, isHolidayDataCovered } from './krHolidays'

export interface TodayInfo {
  today: string                               // 'YYYY-MM-DD'
  next: { date: string; name: string } | null // 오늘 포함 가장 가까운 공휴일 (데이터 범위 밖이면 null)
}

/** 한국 시각으로 시프트한 Date — 반드시 getUTC*()로 읽는다(서버는 UTC로 동작) */
export function kstShifted(now: Date = new Date()): Date {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
}

/** 서버(UTC)에서 한국 날짜 'YYYY-MM-DD' — +9h 시프트 후 UTC 필드. toISOString().slice 금지 원칙과 같은 이유 */
export function kstTodayStr(now: Date = new Date()): string {
  const k = kstShifted(now)
  return `${k.getUTCFullYear()}-${String(k.getUTCMonth() + 1).padStart(2, '0')}-${String(k.getUTCDate()).padStart(2, '0')}`
}

export function todayInfo(today: string): TodayInfo {
  const y = Number(today.slice(0, 4))
  for (const year of [y, y + 1]) {
    if (!isHolidayDataCovered(year)) continue
    const hit = holidaysInYear(year).find((h) => h.date >= today)
    if (hit) return { today, next: { date: hit.date, name: hit.name } }
  }
  return { today, next: null }
}
