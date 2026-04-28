/* ──────────────────────────────────────────────────────
   age/ageUtils.ts — 만 나이/세는 나이/연 나이 계산,
   D-day, 인생 통계, 마일스톤, 띠/별자리/세대 매핑
   ────────────────────────────────────────────────────── */

import {
  ZODIAC_ANIMALS, WESTERN_ZODIAC, BIRTH_GIFTS, GENERATIONS, KOREAN_AGE_NAMES,
  type ZodiacAnimal, type WesternZodiac, type BirthGift, type Generation, type KoreanAgeName,
} from './zodiacData'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function midnight(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** 만 나이 — 생일 전 1살 적게 */
export function calcAge(birth: Date, ref: Date = new Date()): number {
  let age = ref.getFullYear() - birth.getFullYear()
  const m = ref.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

/** 세는 나이 (한국 전통) — 태어나자마자 1세, 1월 1일 +1세 */
export function calcKoreanAge(birth: Date, ref: Date = new Date()): number {
  return ref.getFullYear() - birth.getFullYear() + 1
}

/** 연 나이 — 단순 연도 차이 */
export function calcYearAge(birth: Date, ref: Date = new Date()): number {
  return ref.getFullYear() - birth.getFullYear()
}

/** 태어난 지 며칠 (정수일) */
export function calcDaysAlive(birth: Date, ref: Date = new Date()): number {
  return Math.floor((midnight(ref).getTime() - midnight(birth).getTime()) / MS_PER_DAY)
}

/** 다음 생일 정보 */
export function nextBirthday(birth: Date, ref: Date = new Date()) {
  const refMid = midnight(ref)
  const thisYear = new Date(refMid.getFullYear(), birth.getMonth(), birth.getDate())
  const isBirthdayToday = thisYear.getTime() === refMid.getTime()
  const nextDate = thisYear.getTime() > refMid.getTime()
    ? thisYear
    : new Date(refMid.getFullYear() + 1, birth.getMonth(), birth.getDate())
  const daysUntil = Math.round((nextDate.getTime() - refMid.getTime()) / MS_PER_DAY)
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][nextDate.getDay()]
  const isWeekend = nextDate.getDay() === 0 || nextDate.getDay() === 6
  return {
    date: nextDate,
    daysUntil,
    dayOfWeek,
    isWeekend,
    age: calcAge(birth, nextDate),
    isBirthdayToday,
  }
}

/** 정수 일수만큼 생일에서 더한 날짜 */
export function dateAfterDays(birth: Date, days: number): Date {
  const d = midnight(birth)
  d.setDate(d.getDate() + days)
  return d
}

/** 만 나이 N세가 되는 날 */
export function dateAtAge(birth: Date, targetAge: number): Date {
  return new Date(birth.getFullYear() + targetAge, birth.getMonth(), birth.getDate())
}

/** D-day — 미래 기준일까지 정수 일수 (음수면 지남) */
export function ddayUntil(target: Date, ref: Date = new Date()): number {
  return Math.round((midnight(target).getTime() - midnight(ref).getTime()) / MS_PER_DAY)
}

/** 인생 통계 (재미 환산 — 평균값 기반 추정치) */
export function calcLifeStats(birth: Date, ref: Date = new Date()) {
  const daysAlive = calcDaysAlive(birth, ref)
  const hoursAlive = daysAlive * 24
  const minutesAlive = daysAlive * 24 * 60
  const secondsAlive = daysAlive * 24 * 60 * 60

  const sleepHours = Math.round(hoursAlive * 0.33)             // 33% 잠
  const mealsCount = daysAlive * 3                             // 3끼/일
  const heartbeats = Math.round(minutesAlive * 70)             // 70 BPM
  const breaths    = Math.round(minutesAlive * 16)             // 16/min
  const blinksAwake = Math.round(minutesAlive * 0.67 * 17)     // 17/min × 깨어있는 67% 시간
  const stepsAvg   = Math.round(daysAlive * 7000)              // 7,000보/일

  // 코스믹 캘린더: 우주 1년 = 138억 년 → 1초 = 약 437.5년
  // 사용자 인생 (years) → cosmic seconds
  const yearsAlive = daysAlive / 365.25
  const cosmicSeconds = yearsAlive / 437.5
  // 우주 12월 31일 자정 직전, 즉 마지막 cosmicSeconds 동안

  return {
    daysAlive, hoursAlive, minutesAlive, secondsAlive,
    weeksAlive:  Math.floor(daysAlive / 7),
    monthsAlive: Math.floor(daysAlive / 30.4375),
    yearsAlive,
    sleepHours, mealsCount, heartbeats, breaths,
    blinks: blinksAwake,
    stepsAvg,
    cosmicSeconds,
  }
}

/** 띠 (양력 연도 기준 단순화) */
export function getZodiacAnimal(birthYear: number): ZodiacAnimal {
  // 1900 = 쥐(0)띠? 실제 1900년은 쥐띠. 인덱싱: (year - 1900 + 0) % 12 — but 1924 was 쥐. 표준: (year - 4) % 12
  const idx = ((birthYear - 4) % 12 + 12) % 12
  return ZODIAC_ANIMALS[idx]
}

/** 별자리 — 양력 기준. 염소자리는 12/22~1/19로 연 경계를 넘으므로 별도 처리 */
export function getWesternZodiac(birth: Date): WesternZodiac {
  const m = birth.getMonth() + 1
  const d = birth.getDate()
  for (const z of WESTERN_ZODIAC) {
    const sameYear = z.startMonth <= z.endMonth
    if (sameYear) {
      if ((m === z.startMonth && d >= z.startDay) || (m === z.endMonth && d <= z.endDay) || (m > z.startMonth && m < z.endMonth)) {
        return z
      }
    } else {
      // 염소자리: startMonth=12, endMonth=1
      if ((m === z.startMonth && d >= z.startDay) || (m === z.endMonth && d <= z.endDay)) {
        return z
      }
    }
  }
  return WESTERN_ZODIAC[0]
}

/** 탄생석·탄생화 */
export function getBirthGift(birth: Date): BirthGift {
  return BIRTH_GIFTS[birth.getMonth() + 1]
}

/** 한국 세대 */
export function getGeneration(birthYear: number): Generation | null {
  return GENERATIONS.find(g => birthYear >= g.range[0] && birthYear <= g.range[1]) ?? null
}

/** 해당 만 나이의 한국 전통 호칭 */
export function getKoreanAgeName(age: number): KoreanAgeName | null {
  return KOREAN_AGE_NAMES.find(n => n.age === age) ?? null
}

/** 큰 숫자 한국식 단축 표기 — 만/억 단위 */
export function formatBigKor(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(n >= 1_000_000_000 ? 0 : 1) + '억'
  if (n >= 10_000)      return (n / 10_000).toFixed(n >= 100_000 ? 0 : 1) + '만'
  return n.toLocaleString()
}

/** YYYY-MM-DD 형식 */
export function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY년 M월 D일 (요일) 한국어 형식 */
export function fmtDateKo(d: Date, withDow = true): string {
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const base = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  return withDow ? `${base} (${dow})` : base
}
