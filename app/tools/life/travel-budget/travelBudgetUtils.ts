/* 해외여행 예산 계산기 — 데이터·계산 유틸 */

export type Style = 'backpack' | 'middle' | 'luxury'
export type Season = 'low' | 'high'
export type Airline = 'lcc' | 'full'

/* ─────────────────────────────────────────────
   도시 데이터 (1박 1인 평균, 만원)
   각 스타일별 [숙박, 식비, 교통+투어]
   ───────────────────────────────────────────── */

export interface CityData {
  id: string
  flag: string
  name: string
  shortName: string
  region: 'jp' | 'sea' | 'us' | 'eu' | 'au' | 'mid'
  currency: string
  currencyUnit: string
  defaultRate: number
  defaultRateBase?: number
  styles: Record<Style, { hotel: number; food: number; transport: number }>
}

export const CITIES: CityData[] = [
  { id: 'tokyo', flag: '🇯🇵', name: '도쿄·오사카', shortName: '도쿄·오사카', region: 'jp',
    currency: 'JPY', currencyUnit: '¥', defaultRate: 9.5, defaultRateBase: 1,
    styles: {
      backpack: { hotel: 8, food: 5, transport: 12 },
      middle:   { hotel: 12, food: 8, transport: 18 },
      luxury:   { hotel: 25, food: 15, transport: 35 },
    },
  },
  { id: 'fukuoka', flag: '🇯🇵', name: '후쿠오카·삿포로', shortName: '후쿠오카·삿포로', region: 'jp',
    currency: 'JPY', currencyUnit: '¥', defaultRate: 9.5, defaultRateBase: 1,
    styles: {
      backpack: { hotel: 7, food: 4, transport: 10 },
      middle:   { hotel: 10, food: 7, transport: 15 },
      luxury:   { hotel: 20, food: 12, transport: 30 },
    },
  },
  { id: 'bangkok', flag: '🇹🇭', name: '방콕·푸켓', shortName: '방콕·푸켓', region: 'sea',
    currency: 'THB', currencyUnit: '฿', defaultRate: 41,
    styles: {
      backpack: { hotel: 4, food: 3, transport: 6 },
      middle:   { hotel: 7, food: 5, transport: 12 },
      luxury:   { hotel: 15, food: 10, transport: 25 },
    },
  },
  { id: 'danang', flag: '🇻🇳', name: '다낭·하노이', shortName: '다낭·하노이', region: 'sea',
    currency: 'VND', currencyUnit: '₫', defaultRate: 0.06,
    styles: {
      backpack: { hotel: 4, food: 3, transport: 5 },
      middle:   { hotel: 7, food: 5, transport: 10 },
      luxury:   { hotel: 13, food: 8, transport: 22 },
    },
  },
  { id: 'cebu', flag: '🇵🇭', name: '세부·보라카이', shortName: '세부·보라카이', region: 'sea',
    currency: 'PHP', currencyUnit: '₱', defaultRate: 25,
    styles: {
      backpack: { hotel: 5, food: 4, transport: 7 },
      middle:   { hotel: 9, food: 6, transport: 14 },
      luxury:   { hotel: 18, food: 12, transport: 28 },
    },
  },
  { id: 'bali', flag: '🇮🇩', name: '발리', shortName: '발리', region: 'sea',
    currency: 'IDR', currencyUnit: 'Rp', defaultRate: 0.087,
    styles: {
      backpack: { hotel: 4, food: 3, transport: 6 },
      middle:   { hotel: 8, food: 5, transport: 12 },
      luxury:   { hotel: 18, food: 12, transport: 28 },
    },
  },
  { id: 'singapore', flag: '🇸🇬', name: '싱가포르', shortName: '싱가포르', region: 'sea',
    currency: 'SGD', currencyUnit: 'S$', defaultRate: 1030,
    styles: {
      backpack: { hotel: 10, food: 6, transport: 15 },
      middle:   { hotel: 18, food: 12, transport: 25 },
      luxury:   { hotel: 35, food: 25, transport: 50 },
    },
  },
  { id: 'hongkong', flag: '🇭🇰', name: '홍콩', shortName: '홍콩', region: 'sea',
    currency: 'HKD', currencyUnit: 'HK$', defaultRate: 178,
    styles: {
      backpack: { hotel: 12, food: 8, transport: 18 },
      middle:   { hotel: 20, food: 15, transport: 30 },
      luxury:   { hotel: 40, food: 30, transport: 60 },
    },
  },
  { id: 'taiwan', flag: '🇹🇼', name: '대만', shortName: '대만', region: 'sea',
    currency: 'TWD', currencyUnit: 'NT$', defaultRate: 44,
    styles: {
      backpack: { hotel: 6, food: 4, transport: 8 },
      middle:   { hotel: 10, food: 7, transport: 14 },
      luxury:   { hotel: 18, food: 12, transport: 28 },
    },
  },
  { id: 'us', flag: '🇺🇸', name: 'LA·뉴욕·하와이', shortName: 'LA·NY·하와이', region: 'us',
    currency: 'USD', currencyUnit: '$', defaultRate: 1400,
    styles: {
      backpack: { hotel: 18, food: 12, transport: 25 },
      middle:   { hotel: 30, food: 20, transport: 45 },
      luxury:   { hotel: 60, food: 40, transport: 90 },
    },
  },
  { id: 'canada', flag: '🇨🇦', name: '캐나다', shortName: '캐나다', region: 'us',
    currency: 'CAD', currencyUnit: 'C$', defaultRate: 1020,
    styles: {
      backpack: { hotel: 15, food: 10, transport: 22 },
      middle:   { hotel: 25, food: 18, transport: 38 },
      luxury:   { hotel: 50, food: 35, transport: 75 },
    },
  },
  { id: 'paris', flag: '🇫🇷', name: '파리', shortName: '파리', region: 'eu',
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    styles: {
      backpack: { hotel: 15, food: 10, transport: 22 },
      middle:   { hotel: 25, food: 18, transport: 38 },
      luxury:   { hotel: 50, food: 35, transport: 75 },
    },
  },
  { id: 'italy', flag: '🇮🇹', name: '이탈리아', shortName: '이탈리아', region: 'eu',
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    styles: {
      backpack: { hotel: 12, food: 9, transport: 20 },
      middle:   { hotel: 22, food: 16, transport: 35 },
      luxury:   { hotel: 45, food: 32, transport: 68 },
    },
  },
  { id: 'spain', flag: '🇪🇸', name: '스페인', shortName: '스페인', region: 'eu',
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    styles: {
      backpack: { hotel: 10, food: 8, transport: 18 },
      middle:   { hotel: 18, food: 14, transport: 30 },
      luxury:   { hotel: 38, food: 28, transport: 58 },
    },
  },
  { id: 'uk', flag: '🇬🇧', name: '영국 (런던)', shortName: '영국', region: 'eu',
    currency: 'GBP', currencyUnit: '£', defaultRate: 1750,
    styles: {
      backpack: { hotel: 18, food: 12, transport: 28 },
      middle:   { hotel: 32, food: 22, transport: 48 },
      luxury:   { hotel: 65, food: 45, transport: 90 },
    },
  },
  { id: 'germany', flag: '🇩🇪', name: '독일', shortName: '독일', region: 'eu',
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    styles: {
      backpack: { hotel: 12, food: 9, transport: 18 },
      middle:   { hotel: 22, food: 16, transport: 32 },
      luxury:   { hotel: 45, food: 30, transport: 65 },
    },
  },
  { id: 'australia', flag: '🇦🇺', name: '호주', shortName: '호주', region: 'au',
    currency: 'AUD', currencyUnit: 'A$', defaultRate: 920,
    styles: {
      backpack: { hotel: 15, food: 12, transport: 22 },
      middle:   { hotel: 28, food: 20, transport: 40 },
      luxury:   { hotel: 55, food: 38, transport: 75 },
    },
  },
  { id: 'dubai', flag: '🇦🇪', name: '두바이', shortName: '두바이', region: 'mid',
    currency: 'AED', currencyUnit: 'د.إ', defaultRate: 380,
    styles: {
      backpack: { hotel: 18, food: 12, transport: 30 },
      middle:   { hotel: 35, food: 25, transport: 50 },
      luxury:   { hotel: 70, food: 50, transport: 100 },
    },
  },
]

export const getCity = (id: string) => CITIES.find((c) => c.id === id)!

/* ─────────────────────────────────────────────
   항공권 평균 (왕복, 1인, 만원)
   ───────────────────────────────────────────── */

export const FLIGHT_PRICES: Record<string, Record<Airline, Record<Season, number>>> = {
  jp:  { lcc: { low: 25,  high: 50  }, full: { low: 40,  high: 80  } },
  sea: { lcc: { low: 35,  high: 70  }, full: { low: 60,  high: 120 } },
  us:  { lcc: { low: 100, high: 180 }, full: { low: 130, high: 250 } },
  eu:  { lcc: { low: 90,  high: 160 }, full: { low: 120, high: 220 } },
  au:  { lcc: { low: 80,  high: 150 }, full: { low: 110, high: 200 } },
  mid: { lcc: { low: 70,  high: 120 }, full: { low: 100, high: 170 } },
}

/* 스타일·시즌·항공사 메타 */
export const STYLES: { id: Style; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'backpack', emoji: '🎒', label: '배낭여행',  desc: '호스텔·로컬 식당·대중교통',         color: '#0D9488' },
  { id: 'middle',   emoji: '🧳', label: '중간',      desc: '3~4성 호텔·일반 식당·기본 투어',    color: '#D97706' },
  { id: 'luxury',   emoji: '🥂', label: '럭셔리',    desc: '5성 호텔·고급 식당·프라이빗 투어',  color: '#DB2777' },
]

export const SEASONS: { id: Season; emoji: string; label: string }[] = [
  { id: 'low',  emoji: '🍂', label: '비수기 (4·5·9·10·11월)' },
  { id: 'high', emoji: '☀️', label: '성수기 (7·8·12·1월·연휴)' },
]

export const AIRLINES: { id: Airline; label: string; desc: string }[] = [
  { id: 'lcc',  label: 'LCC',     desc: '진에어·제주·티웨이·피치·에어아시아' },
  { id: 'full', label: '풀서비스', desc: '대한항공·아시아나·JAL·ANA·UA' },
]

export const REGION_LABELS: Record<string, string> = {
  jp: '일본', sea: '동남아', us: '미국·하와이', eu: '유럽', au: '호주·뉴질랜드', mid: '중동',
}

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

export interface BudgetInputs {
  cityId: string
  style: Style
  days: number
  people: number
  season: Season
  airline: Airline
  /** 9 항목 (만원) */
  flight: number          // 왕복 1인
  hotel: number           // 1박 1인
  food: number            // 1일 1인
  transport: number       // 1일 1인 (교통+투어)
  shopping: number        // 총액
  ticket: number          // 입장권·투어 총액
  comm: number            // 통신·로밍 총액
  insurance: number       // 1인
  etc: number             // 총액
  reservePct: number
}

/** 항목별 총액 (만원) */
export interface ItemBreakdown {
  id: string
  emoji: string
  label: string
  perPerson: number    // 1인 합계
  total: number        // 인원 합계
  isPerson: boolean    // 1인 단위 입력 여부
  color: string
}

export function calcBudget(inp: BudgetInputs): { items: ItemBreakdown[]; subTotal: number; reserve: number; total: number; perPerson: number; perDay: number } {
  const days = Math.max(1, inp.days)
  const people = Math.max(1, inp.people)
  // 숙박 박수 = 여행일수 − 1 (예: 5일 = 4박). 식비·교통은 매일 발생하므로 일수 그대로.
  const nights = Math.max(1, days - 1)

  const items: ItemBreakdown[] = [
    { id: 'flight',    emoji: '✈️', label: '항공권',     perPerson: inp.flight,                total: inp.flight * people,                  isPerson: true,  color: '#0891B2' },
    { id: 'hotel',     emoji: '🏨', label: `숙박 (${nights}박)`, perPerson: inp.hotel * nights,    total: inp.hotel * nights * people,           isPerson: true,  color: '#EA580C' },
    { id: 'food',      emoji: '🍽️', label: '식비',       perPerson: inp.food * days,            total: inp.food * days * people,              isPerson: true,  color: '#D97706' },
    { id: 'transport', emoji: '🚕', label: '교통·투어',  perPerson: inp.transport * days,       total: inp.transport * days * people,         isPerson: true,  color: '#0D9488' },
    { id: 'shopping',  emoji: '🛍️', label: '쇼핑',       perPerson: inp.shopping / people,      total: inp.shopping,                          isPerson: false, color: '#DB2777' },
    { id: 'ticket',    emoji: '🎟️', label: '입장권·액티비티', perPerson: inp.ticket / people,    total: inp.ticket,                            isPerson: false, color: '#9B59B6' },
    { id: 'comm',      emoji: '📱', label: '통신·로밍',   perPerson: inp.comm / people,          total: inp.comm,                              isPerson: false, color: '#059669' },
    { id: 'insurance', emoji: '🛡️', label: '여행자보험',  perPerson: inp.insurance,              total: inp.insurance * people,                isPerson: true,  color: '#9333EA' },
    { id: 'etc',       emoji: '💵', label: '기타',       perPerson: inp.etc / people,           total: inp.etc,                               isPerson: false, color: '#9B9B9B' },
  ]

  const subTotal = items.reduce((s, it) => s + it.total, 0)
  const reserve = subTotal * (inp.reservePct / 100)
  const total = subTotal + reserve
  const perPerson = total / people
  const perDay = total / days

  return { items, subTotal, reserve, total, perPerson, perDay }
}

/** 도시·스타일 평균과 비교 */
export interface DiagnosisItem {
  id: string
  emoji: string
  label: string
  user: number          // 본인 1인 단위
  avg: number           // 평균 1인 단위
  diffPct: number       // 평균 대비 (%)
  status: 'low' | 'normal' | 'high' | 'over'
}

export function diagnose(inp: BudgetInputs): DiagnosisItem[] {
  const city = getCity(inp.cityId)
  const sty = city.styles[inp.style]
  const days = Math.max(1, inp.days)

  const items: { id: string; emoji: string; label: string; user: number; avg: number }[] = [
    { id: 'hotel',     emoji: '🏨', label: '숙박 (1박/인)',      user: inp.hotel,         avg: sty.hotel },
    { id: 'food',      emoji: '🍽️', label: '식비 (1일/인)',      user: inp.food,          avg: sty.food },
    { id: 'transport', emoji: '🚕', label: '교통+투어 (1일/인)', user: inp.transport,     avg: sty.transport },
    { id: 'flight',    emoji: '✈️', label: '항공권 (왕복/인)',   user: inp.flight,        avg: getFlight(city.region, inp.airline, inp.season) },
  ]

  return items.map((it) => {
    const diff = it.avg > 0 ? ((it.user - it.avg) / it.avg) * 100 : 0
    let status: DiagnosisItem['status']
    if (diff <= -30) status = 'low'
    else if (diff <= 30) status = 'normal'
    else if (diff <= 60) status = 'high'
    else status = 'over'
    return { ...it, diffPct: diff, status }
  })
  void days
}

/** 항공권 평균 가져오기 */
export function getFlight(region: string, airline: Airline, season: Season): number {
  return FLIGHT_PRICES[region]?.[airline]?.[season] ?? 50
}

/** 도시·스타일·일수에 맞는 자동 추천값 (1인/1일·1박 단위) */
export function autoFill(inp: { cityId: string; style: Style; days: number; people: number; season: Season; airline: Airline }) {
  const city = getCity(inp.cityId)
  const sty = city.styles[inp.style]
  const flight = getFlight(city.region, inp.airline, inp.season)
  // 성수기엔 항공권뿐 아니라 숙박도 오른다 (대략 +30%). 식비·교통은 변동 작아 유지.
  const seasonHotel = inp.season === 'high' ? 1.3 : 1
  return {
    flight,
    hotel: Math.round(sty.hotel * seasonHotel * 10) / 10,
    food: sty.food,
    transport: sty.transport,
    shopping: inp.style === 'backpack' ? 20 : inp.style === 'middle' ? 50 : 150,
    ticket: (inp.style === 'backpack' ? 2 : inp.style === 'middle' ? 4 : 8) * inp.days * inp.people,
    comm: 3 * inp.people,
    insurance: 3,
    etc: 5,
  }
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtMan(man: number): string {
  if (Math.abs(man) >= 10000) {
    const eok = man / 10000
    return `${fmt(eok, eok < 10 ? 2 : 1)}억`
  }
  if (Math.abs(man) >= 1) return `${fmt(man, 0)}만원`
  return `${fmt(man * 10000, 0)}원`
}

export function fmtCurrency(amount: number, unit: string, digits = 0): string {
  return `${unit}${fmt(amount, digits)}`
}
