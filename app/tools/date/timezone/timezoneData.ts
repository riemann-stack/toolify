// 시간대 변환기 — 데이터 + Intl 기반 헬퍼
// Intl.DateTimeFormat은 IANA tzdata 기반이라 DST/특수 오프셋(인도 +5:30, 네팔 +5:45 등) 자동 처리

export interface City {
  id: string
  flag: string
  city: string         // 한글 도시명
  cityEn: string       // 영문
  country: string      // 한글 국가
  timeZone: string     // IANA tz id
  abbr: string         // 약어 (KST, EST 등)
  offsetLabel: string  // "+9:00" 같은 표시용 (DST 시 변동 가능)
}

export const CITIES: City[] = [
  { id: 'seoul',     flag: '🇰🇷', city: '서울',     cityEn: 'Seoul',        country: '한국',     timeZone: 'Asia/Seoul',         abbr: 'KST',  offsetLabel: '+9:00' },
  { id: 'tokyo',     flag: '🇯🇵', city: '도쿄',     cityEn: 'Tokyo',        country: '일본',     timeZone: 'Asia/Tokyo',         abbr: 'JST',  offsetLabel: '+9:00' },
  { id: 'beijing',   flag: '🇨🇳', city: '베이징',   cityEn: 'Beijing',      country: '중국',     timeZone: 'Asia/Shanghai',      abbr: 'CST',  offsetLabel: '+8:00' },
  { id: 'hk',        flag: '🇭🇰', city: '홍콩',     cityEn: 'Hong Kong',    country: '홍콩',     timeZone: 'Asia/Hong_Kong',     abbr: 'HKT',  offsetLabel: '+8:00' },
  { id: 'singapore', flag: '🇸🇬', city: '싱가포르', cityEn: 'Singapore',    country: '싱가포르', timeZone: 'Asia/Singapore',     abbr: 'SGT',  offsetLabel: '+8:00' },
  { id: 'bangkok',   flag: '🇹🇭', city: '방콕',     cityEn: 'Bangkok',      country: '태국',     timeZone: 'Asia/Bangkok',       abbr: 'ICT',  offsetLabel: '+7:00' },
  { id: 'delhi',     flag: '🇮🇳', city: '뉴델리',   cityEn: 'New Delhi',    country: '인도',     timeZone: 'Asia/Kolkata',       abbr: 'IST',  offsetLabel: '+5:30' },
  { id: 'kathmandu', flag: '🇳🇵', city: '카트만두', cityEn: 'Kathmandu',    country: '네팔',     timeZone: 'Asia/Kathmandu',     abbr: 'NPT',  offsetLabel: '+5:45' },
  { id: 'tehran',    flag: '🇮🇷', city: '테헤란',   cityEn: 'Tehran',       country: '이란',     timeZone: 'Asia/Tehran',        abbr: 'IRST', offsetLabel: '+3:30' },
  { id: 'dubai',     flag: '🇦🇪', city: '두바이',   cityEn: 'Dubai',        country: 'UAE',      timeZone: 'Asia/Dubai',         abbr: 'GST',  offsetLabel: '+4:00' },
  { id: 'moscow',    flag: '🇷🇺', city: '모스크바', cityEn: 'Moscow',       country: '러시아',   timeZone: 'Europe/Moscow',      abbr: 'MSK',  offsetLabel: '+3:00' },
  { id: 'berlin',    flag: '🇩🇪', city: '베를린',   cityEn: 'Berlin',       country: '독일',     timeZone: 'Europe/Berlin',      abbr: 'CET',  offsetLabel: '+1:00' },
  { id: 'paris',     flag: '🇫🇷', city: '파리',     cityEn: 'Paris',        country: '프랑스',   timeZone: 'Europe/Paris',       abbr: 'CET',  offsetLabel: '+1:00' },
  { id: 'london',    flag: '🇬🇧', city: '런던',     cityEn: 'London',       country: '영국',     timeZone: 'Europe/London',      abbr: 'GMT',  offsetLabel: '+0:00' },
  { id: 'utc',       flag: '🌍', city: 'UTC',      cityEn: 'UTC',          country: '협정세계시', timeZone: 'UTC',                abbr: 'UTC',  offsetLabel: '+0:00' },
  { id: 'sao',       flag: '🇧🇷', city: '상파울루', cityEn: 'São Paulo',    country: '브라질',   timeZone: 'America/Sao_Paulo',  abbr: 'BRT',  offsetLabel: '-3:00' },
  { id: 'nyc',       flag: '🇺🇸', city: '뉴욕',     cityEn: 'New York',     country: '미국',     timeZone: 'America/New_York',   abbr: 'EST',  offsetLabel: '-5:00' },
  { id: 'toronto',   flag: '🇨🇦', city: '토론토',   cityEn: 'Toronto',      country: '캐나다',   timeZone: 'America/Toronto',    abbr: 'EST',  offsetLabel: '-5:00' },
  { id: 'chicago',   flag: '🇺🇸', city: '시카고',   cityEn: 'Chicago',      country: '미국',     timeZone: 'America/Chicago',    abbr: 'CST',  offsetLabel: '-6:00' },
  { id: 'denver',    flag: '🇺🇸', city: '덴버',     cityEn: 'Denver',       country: '미국',     timeZone: 'America/Denver',     abbr: 'MST',  offsetLabel: '-7:00' },
  { id: 'la',        flag: '🇺🇸', city: 'LA',       cityEn: 'Los Angeles',  country: '미국',     timeZone: 'America/Los_Angeles', abbr: 'PST', offsetLabel: '-8:00' },
  { id: 'vancouver', flag: '🇨🇦', city: '밴쿠버',   cityEn: 'Vancouver',    country: '캐나다',   timeZone: 'America/Vancouver',  abbr: 'PST',  offsetLabel: '-8:00' },
  { id: 'honolulu',  flag: '🇺🇸', city: '호놀룰루', cityEn: 'Honolulu',     country: '미국',     timeZone: 'Pacific/Honolulu',   abbr: 'HST',  offsetLabel: '-10:00' },
  { id: 'sydney',    flag: '🇦🇺', city: '시드니',   cityEn: 'Sydney',       country: '호주',     timeZone: 'Australia/Sydney',   abbr: 'AEST', offsetLabel: '+10:00' },
  { id: 'auckland',  flag: '🇳🇿', city: '오클랜드', cityEn: 'Auckland',     country: '뉴질랜드', timeZone: 'Pacific/Auckland',   abbr: 'NZST', offsetLabel: '+12:00' },
]

export const DEFAULT_SELECTED = ['seoul', 'nyc', 'london', 'la', 'sydney']

// 특정 Date를 특정 timeZone의 부분으로 분해
export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number  // 0(일)~6(토)
}

export function partsInZone(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, weekday: 'short',
  })
  const parts = fmt.formatToParts(date)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '0'
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  // hour '24' → '00' 처리 (일부 환경에서 24시 발생)
  let h = parseInt(get('hour'), 10)
  if (h === 24) h = 0
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour: h,
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
    weekday: weekdayMap[get('weekday')] ?? 0,
  }
}

// 특정 시점의 UTC 오프셋(분 단위, +9:00 = +540)
export function offsetMinutes(date: Date, timeZone: string): number {
  const local = partsInZone(date, timeZone)
  const asUTC = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second)
  return Math.round((asUTC - date.getTime()) / 60000)
}

export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-'
  const m = Math.abs(minutes)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return mm === 0 ? `${sign}${h}` : `${sign}${h}:${String(mm).padStart(2, '0')}`
}

// 해당 시점에 DST가 활성화되어 있는가? (1월과 7월 오프셋 비교)
export function isDSTActive(date: Date, timeZone: string): boolean {
  const year = partsInZone(date, timeZone).year
  const jan = new Date(Date.UTC(year, 0, 15, 12, 0, 0))
  const jul = new Date(Date.UTC(year, 6, 15, 12, 0, 0))
  const janOff = offsetMinutes(jan, timeZone)
  const julOff = offsetMinutes(jul, timeZone)
  if (janOff === julOff) return false  // DST 없음
  const stdOff = Math.min(janOff, julOff)  // 표준시는 더 작은 값
  const nowOff = offsetMinutes(date, timeZone)
  return nowOff !== stdOff
}

// timeZone이 DST를 사용하는가?
export function observesDST(timeZone: string): boolean {
  const year = new Date().getUTCFullYear()
  const jan = new Date(Date.UTC(year, 0, 15, 12, 0, 0))
  const jul = new Date(Date.UTC(year, 6, 15, 12, 0, 0))
  return offsetMinutes(jan, timeZone) !== offsetMinutes(jul, timeZone)
}

// 입력 폼(특정 timeZone 기준 Y/M/D H:M)을 UTC Date로 변환
export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  // 일단 UTC로 가정하고 만든 뒤, 그 시점의 timeZone 오프셋을 빼서 보정 (한 번 더 반복해 정확도 향상)
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0)
  let guess = new Date(naive)
  for (let i = 0; i < 2; i++) {
    const off = offsetMinutes(guess, timeZone)
    guess = new Date(naive - off * 60000)
  }
  return guess
}

// 시간대 차이 라벨 (예: "+3시간", "-13시간 30분")
export function diffLabel(fromOffsetMin: number, toOffsetMin: number): string {
  const d = toOffsetMin - fromOffsetMin
  if (d === 0) return '동일 시각'
  const sign = d > 0 ? '+' : '-'
  const m = Math.abs(d)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return mm === 0 ? `${sign}${h}시간` : `${sign}${h}시간 ${mm}분`
}

// 날짜 오프셋 (-1d, 0, +1d 등) 표시
export function dateOffsetLabel(baseY: number, baseM: number, baseD: number, tgtY: number, tgtM: number, tgtD: number): string {
  const a = Date.UTC(baseY, baseM - 1, baseD)
  const b = Date.UTC(tgtY, tgtM - 1, tgtD)
  const diff = Math.round((b - a) / 86400000)
  if (diff === 0) return ''
  if (diff > 0) return `+${diff}일`
  return `${diff}일`
}

// 시간대 카테고리 (해당 도시 현지 hour 기준)
export type TimeBucket = 'sleep' | 'morning' | 'work' | 'evening' | 'late'

export function classifyHour(hour: number): TimeBucket {
  if (hour < 6) return 'sleep'
  if (hour < 9) return 'morning'
  if (hour < 18) return 'work'
  if (hour < 22) return 'evening'
  return 'late'
}

export const BUCKET_LABEL: Record<TimeBucket, string> = {
  sleep:   '🌙 자는 시간',
  morning: '🌅 이른 아침',
  work:    '☀️ 근무 시간',
  evening: '🌆 저녁 시간',
  late:    '🌌 늦은 밤',
}

// 회의 슬롯 평가: 시각이 (UTC 시점) 모든 도시에서 근무시간(9~18)에 들면 'green', 일부 외(8~9, 18~20)면 'yellow', 그 외는 'red'
export type SlotQuality = 'green' | 'yellow' | 'red'

export function evaluateSlot(utcDate: Date, timeZones: string[], workStart = 9, workEnd = 18): { quality: SlotQuality; bestHour: number } {
  let worst: SlotQuality = 'green'
  for (const tz of timeZones) {
    const p = partsInZone(utcDate, tz)
    const h = p.hour + p.minute / 60
    if (h >= workStart && h < workEnd) {
      // green 유지
    } else if (h >= workStart - 1 && h < workEnd + 2) {
      if (worst === 'green') worst = 'yellow'
    } else {
      worst = 'red'
    }
  }
  return { quality: worst, bestHour: 0 }
}

// 25시간 슬롯(15분 단위)을 만들어 회의 가능 시간대 분석
export interface MeetingSlot {
  utcDate: Date
  quality: SlotQuality
  greenCount: number  // 근무시간(9~18) 안에 들어가는 도시 수
  okCount: number     // 근무 ± 2시간 안에 들어가는 도시 수
}

export function findMeetingSlots(baseDay: Date, timeZones: string[], workStart = 9, workEnd = 18): MeetingSlot[] {
  // baseDay는 기준 도시 기준 그 날짜의 시작 시각(UTC)으로 가정.
  // 24시간 × 15분 = 96슬롯
  const slots: MeetingSlot[] = []
  const startMs = baseDay.getTime()
  for (let i = 0; i < 96; i++) {
    const d = new Date(startMs + i * 15 * 60000)
    let green = 0, ok = 0
    for (const tz of timeZones) {
      const p = partsInZone(d, tz)
      const h = p.hour + p.minute / 60
      if (h >= workStart && h < workEnd) { green++; ok++ }
      else if (h >= workStart - 1 && h < workEnd + 2) { ok++ }
    }
    let quality: SlotQuality
    if (green === timeZones.length) quality = 'green'
    else if (ok === timeZones.length) quality = 'yellow'
    else quality = 'red'
    slots.push({ utcDate: d, quality, greenCount: green, okCount: ok })
  }
  return slots
}
