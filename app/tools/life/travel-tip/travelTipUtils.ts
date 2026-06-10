/* 해외여행 팁 계산기 — 데이터·계산 유틸 */

export type Satisfaction = 'normal' | 'good' | 'great'
export type TipCategory = 'mandatory' | 'optional' | 'rare' | 'no'
export type ServiceId =
  | 'restaurant' | 'taxi' | 'hotel' | 'tour' | 'delivery'
  | 'spa' | 'airport' | 'golf' | 'salon'

/* ─────────────────────────────────────────────
   서비스 메타
   ───────────────────────────────────────────── */

export interface ServiceMeta {
  id: ServiceId
  emoji: string
  label: string
  shortLabel: string
  desc: string
  /** 정액 vs 비율 */
  flat?: boolean
}

export const SERVICES: ServiceMeta[] = [
  { id: 'restaurant', emoji: '🍽️', label: '식당',           shortLabel: '식당',     desc: '레스토랑·카페' },
  { id: 'taxi',       emoji: '🚕', label: '택시·우버',       shortLabel: '택시',     desc: '택시·우버·리프트' },
  { id: 'hotel',      emoji: '🛏️', label: '호텔 (벨보이·룸)', shortLabel: '호텔',     desc: '벨보이·룸메이드·도어맨', flat: true },
  { id: 'tour',       emoji: '🗺️', label: '투어·가이드',      shortLabel: '투어',     desc: '현지 가이드·드라이버', flat: true },
  { id: 'delivery',   emoji: '🍔', label: '배달',            shortLabel: '배달',     desc: 'DoorDash·UberEats' },
  { id: 'spa',        emoji: '💆', label: '마사지·스파',     shortLabel: '마사지',   desc: '마사지·뷰티 트리트먼트' },
  { id: 'airport',    emoji: '✈️', label: '공항 (포터·셔틀)', shortLabel: '공항',     desc: '포터·셔틀·짐꾼', flat: true },
  { id: 'golf',       emoji: '⛳', label: '골프 캐디',        shortLabel: '골프',     desc: '캐디·캐디 마스터', flat: true },
  { id: 'salon',      emoji: '💇', label: '미용·이발',        shortLabel: '미용',     desc: '미용실·이발소·네일' },
]

export const getService = (id: ServiceId) => SERVICES.find((s) => s.id === id)!

/* ─────────────────────────────────────────────
   국가 데이터 (19종)
   ───────────────────────────────────────────── */

export interface CountryRates {
  /** 비율(%): min/mid/max — 각 만족도별 */
  pct?: { min: number; mid: number; max: number }
  /** 정액(현지통화) */
  flat?: { min: number; mid: number; max: number; unit: string }
  /** 별도 메모 */
  note?: string
}

export interface CountryMeta {
  id: string
  flag: string
  name: string
  shortName: string
  category: TipCategory       // 필수/선택/거의 없음/X
  serviceCharge: boolean      // 봉사료 자동 포함 흔함
  currency: string            // USD, JPY, EUR, ...
  currencyUnit: string        // $, ¥, €, ฿, ...
  defaultRate: number         // 1 통화 = N 원 (참고치)
  defaultRateBase?: number    // 기준 (보통 1, 일본은 100엔 단위)
  manner: string              // 매너 1줄
  groupAuto?: { size: number; pct: number }   // 단체 자동 팁 (미국 6명+ 18%)
  /** 서비스별 권장치 */
  rates: Partial<Record<ServiceId, CountryRates>>
}

export const COUNTRIES: CountryMeta[] = [
  {
    id: 'us', flag: '🇺🇸', name: '미국 (United States)', shortName: '미국',
    category: 'mandatory', serviceCharge: false,
    currency: 'USD', currencyUnit: '$', defaultRate: 1400,
    manner: '식당 팁은 사실상 의무, 우버는 관례상 거의 기대(앱에서 선택). 봉사료 별도, 세전 기준이 일반적.',
    groupAuto: { size: 6, pct: 18 },
    rates: {
      restaurant: { pct: { min: 15, mid: 18, max: 20 }, note: '세전 기준이 일반적' },
      taxi:       { pct: { min: 15, mid: 18, max: 20 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: '$/짐 또는 $/박' } },
      tour:       { flat: { min: 5, mid: 10, max: 20, unit: '$/일/인' } },
      delivery:   { pct: { min: 15, mid: 18, max: 20 } },
      spa:        { pct: { min: 15, mid: 18, max: 20 } },
      airport:    { flat: { min: 1, mid: 2, max: 5, unit: '$/짐' } },
      salon:      { pct: { min: 15, mid: 18, max: 20 } },
    },
  },
  {
    id: 'ca', flag: '🇨🇦', name: '캐나다 (Canada)', shortName: '캐나다',
    category: 'mandatory', serviceCharge: false,
    currency: 'CAD', currencyUnit: 'C$', defaultRate: 1020,
    manner: '미국과 거의 동일. 식당·우버 15-20% 일반.',
    groupAuto: { size: 6, pct: 18 },
    rates: {
      restaurant: { pct: { min: 15, mid: 18, max: 20 } },
      taxi:       { pct: { min: 15, mid: 18, max: 20 } },
      hotel:      { flat: { min: 2, mid: 5, max: 10, unit: 'C$' } },
      tour:       { flat: { min: 5, mid: 10, max: 20, unit: 'C$/일/인' } },
      delivery:   { pct: { min: 15, mid: 18, max: 20 } },
      spa:        { pct: { min: 15, mid: 18, max: 20 } },
      airport:    { flat: { min: 1, mid: 2, max: 5, unit: 'C$/짐' } },
      salon:      { pct: { min: 15, mid: 18, max: 20 } },
    },
  },
  {
    id: 'uk', flag: '🇬🇧', name: '영국 (United Kingdom)', shortName: '영국',
    category: 'optional', serviceCharge: true,
    currency: 'GBP', currencyUnit: '£', defaultRate: 1750,
    manner: 'Service Charge가 자동 포함된 경우 추가 X. 영수증 확인.',
    rates: {
      restaurant: { pct: { min: 10, mid: 12.5, max: 15 }, note: 'Service Charge 자동 포함 흔함' },
      taxi:       { pct: { min: 10, mid: 10, max: 15 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: '£' } },
      tour:       { flat: { min: 5, mid: 10, max: 15, unit: '£/일/인' } },
      spa:        { pct: { min: 10, mid: 10, max: 15 } },
      salon:      { pct: { min: 10, mid: 10, max: 15 } },
    },
  },
  {
    id: 'fr', flag: '🇫🇷', name: '프랑스 (France)', shortName: '프랑스',
    category: 'optional', serviceCharge: true,
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    manner: '"Service Compris" 표기는 봉사료 포함. 추가 5-10% 잔돈 정도가 매너.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 }, note: 'Service Compris 표기 시 추가 X' },
      taxi:       { pct: { min: 5, mid: 8, max: 10 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: '€' } },
      tour:       { flat: { min: 5, mid: 10, max: 15, unit: '€/일/인' } },
      spa:        { pct: { min: 5, mid: 8, max: 10 } },
      salon:      { pct: { min: 5, mid: 8, max: 10 } },
    },
  },
  {
    id: 'de', flag: '🇩🇪', name: '독일 (Germany)', shortName: '독일',
    category: 'optional', serviceCharge: false,
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    manner: '잔돈 반올림이 일반적. 카드 결제 시 팁을 미리 말해야 함.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 } },
      taxi:       { pct: { min: 5, mid: 5, max: 10 } },
      hotel:      { flat: { min: 1, mid: 2, max: 3, unit: '€' } },
      tour:       { flat: { min: 5, mid: 10, max: 15, unit: '€/일/인' } },
    },
  },
  {
    id: 'it', flag: '🇮🇹', name: '이탈리아 (Italy)', shortName: '이탈리아',
    category: 'optional', serviceCharge: true,
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    manner: 'Coperto(자릿값 €1~3) 별도. 추가 5-10%가 매너.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 }, note: 'Coperto 자릿값 별도' },
      taxi:       { pct: { min: 5, mid: 5, max: 10 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: '€' } },
      tour:       { flat: { min: 5, mid: 10, max: 15, unit: '€/일/인' } },
    },
  },
  {
    id: 'es', flag: '🇪🇸', name: '스페인 (Spain)', shortName: '스페인',
    category: 'optional', serviceCharge: false,
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500,
    manner: '식당 5-10%가 매너. 바·타파스는 잔돈 정도.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 } },
      taxi:       { pct: { min: 5, mid: 5, max: 10 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: '€' } },
    },
  },
  {
    id: 'jp', flag: '🇯🇵', name: '일본 (Japan)', shortName: '일본',
    category: 'no', serviceCharge: true,
    currency: 'JPY', currencyUnit: '¥', defaultRate: 9.5, defaultRateBase: 1,
    manner: '🚫 팁 문화 X. 료칸·고급 호텔의 奉仕料(10%)로 충분. 팁을 주면 무례하게 받아들일 수 있음.',
    rates: {
      restaurant: { pct: { min: 0, mid: 0, max: 0 }, note: '팁 X — 料金에 모두 포함' },
      taxi:       { pct: { min: 0, mid: 0, max: 0 } },
      hotel:      { flat: { min: 0, mid: 0, max: 0, unit: '¥' }, note: '료칸 心付け 예외' },
    },
  },
  {
    id: 'cn', flag: '🇨🇳', name: '중국 (China)', shortName: '중국',
    category: 'no', serviceCharge: false,
    currency: 'CNY', currencyUnit: '¥', defaultRate: 192,
    manner: '🚫 팁 문화 거의 없음. 호텔 일부 가이드만 예외.',
    rates: {
      restaurant: { pct: { min: 0, mid: 0, max: 0 } },
      taxi:       { pct: { min: 0, mid: 0, max: 0 } },
    },
  },
  {
    id: 'tw', flag: '🇹🇼', name: '대만 (Taiwan)', shortName: '대만',
    category: 'rare', serviceCharge: true,
    currency: 'TWD', currencyUnit: 'NT$', defaultRate: 44,
    manner: '거의 X. 일부 고급 식당만 10% 봉사료 자동 부과.',
    rates: {
      restaurant: { pct: { min: 0, mid: 0, max: 10 }, note: '고급만 10% 자동' },
      taxi:       { pct: { min: 0, mid: 0, max: 0 } },
    },
  },
  {
    id: 'hk', flag: '🇭🇰', name: '홍콩 (Hong Kong)', shortName: '홍콩',
    category: 'optional', serviceCharge: true,
    currency: 'HKD', currencyUnit: 'HK$', defaultRate: 178,
    manner: '식당 10% Service Charge 자동. 추가 잔돈 정도가 매너.',
    rates: {
      restaurant: { pct: { min: 0, mid: 5, max: 10 }, note: '10% Service Charge 자동' },
      taxi:       { pct: { min: 0, mid: 5, max: 5 } },
      hotel:      { flat: { min: 10, mid: 20, max: 50, unit: 'HK$' } },
    },
  },
  {
    id: 'sg', flag: '🇸🇬', name: '싱가포르 (Singapore)', shortName: '싱가포르',
    category: 'optional', serviceCharge: true,
    currency: 'SGD', currencyUnit: 'S$', defaultRate: 1030,
    manner: '대부분 식당 10% Service Charge 자동. 추가 팁 X 일반적.',
    rates: {
      restaurant: { pct: { min: 0, mid: 0, max: 5 }, note: '10% Service Charge 자동' },
      taxi:       { pct: { min: 0, mid: 0, max: 0 } },
      hotel:      { flat: { min: 2, mid: 5, max: 10, unit: 'S$' } },
    },
  },
  {
    id: 'th', flag: '🇹🇭', name: '태국 (Thailand)', shortName: '태국',
    category: 'optional', serviceCharge: false,
    currency: 'THB', currencyUnit: '฿', defaultRate: 41,
    manner: '식당 잔돈~10%. ⭐ 마사지 팁 50~100바트가 한국 관광객 표준.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 } },
      taxi:       { pct: { min: 0, mid: 5, max: 10 }, note: '미터 기준 잔돈 반올림' },
      hotel:      { flat: { min: 20, mid: 50, max: 100, unit: '฿' } },
      tour:       { flat: { min: 100, mid: 200, max: 500, unit: '฿/일/인' } },
      spa:        { flat: { min: 50, mid: 100, max: 200, unit: '฿' }, note: '⭐ 마사지 표준' },
      golf:       { flat: { min: 500, mid: 800, max: 1500, unit: '฿' } },
    },
  },
  {
    id: 'vn', flag: '🇻🇳', name: '베트남 (Vietnam)', shortName: '베트남',
    category: 'optional', serviceCharge: false,
    currency: 'VND', currencyUnit: '₫', defaultRate: 0.06,
    manner: '식당 5-10%. 가이드·기사 $5~10/일이 일반적.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 } },
      taxi:       { pct: { min: 0, mid: 5, max: 5 } },
      hotel:      { flat: { min: 20000, mid: 50000, max: 100000, unit: '₫' } },
      tour:       { flat: { min: 100000, mid: 200000, max: 500000, unit: '₫/일/인' }, note: '$5~10/일' },
      spa:        { flat: { min: 20000, mid: 50000, max: 100000, unit: '₫' } },
    },
  },
  {
    id: 'ph', flag: '🇵🇭', name: '필리핀 (Philippines)', shortName: '필리핀',
    category: 'optional', serviceCharge: true,
    currency: 'PHP', currencyUnit: '₱', defaultRate: 25,
    manner: '식당 10% (Service Charge 포함되면 X). ⭐ 골프 캐디 팁 200~500페소.',
    rates: {
      restaurant: { pct: { min: 5, mid: 10, max: 15 }, note: 'SC 포함 시 추가 X' },
      taxi:       { pct: { min: 0, mid: 5, max: 10 } },
      hotel:      { flat: { min: 50, mid: 100, max: 200, unit: '₱' } },
      tour:       { flat: { min: 200, mid: 500, max: 1000, unit: '₱/일/인' } },
      spa:        { flat: { min: 50, mid: 100, max: 200, unit: '₱' } },
      golf:       { flat: { min: 200, mid: 350, max: 500, unit: '₱' }, note: '⭐ 한국 골프투어 인기' },
    },
  },
  {
    id: 'id', flag: '🇮🇩', name: '인도네시아·발리 (Indonesia)', shortName: '발리',
    category: 'optional', serviceCharge: true,
    currency: 'IDR', currencyUnit: 'Rp', defaultRate: 0.087,
    manner: '식당 5-10%. 마사지 Rp 10K~50K가 한국 관광객 표준.',
    rates: {
      restaurant: { pct: { min: 5, mid: 8, max: 10 }, note: 'SC 포함 시 추가 X' },
      taxi:       { pct: { min: 0, mid: 5, max: 10 } },
      hotel:      { flat: { min: 10000, mid: 30000, max: 50000, unit: 'Rp' } },
      tour:       { flat: { min: 50000, mid: 100000, max: 200000, unit: 'Rp/일/인' } },
      spa:        { flat: { min: 10000, mid: 30000, max: 50000, unit: 'Rp' } },
    },
  },
  {
    id: 'mx', flag: '🇲🇽', name: '멕시코 (Mexico)', shortName: '멕시코',
    category: 'optional', serviceCharge: false,
    currency: 'MXN', currencyUnit: '$', defaultRate: 70,
    manner: '식당 10-15%가 매너. 관광지는 더 기대.',
    rates: {
      restaurant: { pct: { min: 10, mid: 12, max: 15 } },
      taxi:       { pct: { min: 0, mid: 5, max: 10 } },
      hotel:      { flat: { min: 20, mid: 50, max: 100, unit: 'MXN' } },
    },
  },
  {
    id: 'ae', flag: '🇦🇪', name: 'UAE·두바이 (UAE)', shortName: '두바이',
    category: 'optional', serviceCharge: true,
    currency: 'AED', currencyUnit: 'د.إ', defaultRate: 380,
    manner: '식당 10-15% (10% Service Charge 별도 多). 호텔 AED 5~10 매너.',
    rates: {
      restaurant: { pct: { min: 10, mid: 12, max: 15 }, note: '10% SC 별도 多' },
      taxi:       { pct: { min: 0, mid: 5, max: 10 } },
      hotel:      { flat: { min: 5, mid: 10, max: 20, unit: 'AED' } },
    },
  },
  {
    id: 'au', flag: '🇦🇺', name: '호주 (Australia)', shortName: '호주',
    category: 'optional', serviceCharge: false,
    currency: 'AUD', currencyUnit: 'A$', defaultRate: 920,
    manner: '식당 10% (선택). 좋은 서비스 시만 매너.',
    rates: {
      restaurant: { pct: { min: 0, mid: 8, max: 10 } },
      taxi:       { pct: { min: 0, mid: 5, max: 10 } },
      hotel:      { flat: { min: 1, mid: 2, max: 5, unit: 'A$' } },
    },
  },
]

export const getCountry = (id: string) => COUNTRIES.find((c) => c.id === id)!

/* ─────────────────────────────────────────────
   카테고리 메타
   ───────────────────────────────────────────── */

export const CATEGORY_META: Record<TipCategory, { label: string; emoji: string; color: string; desc: string }> = {
  mandatory: { label: '필수',     emoji: '🔴', color: '#DB2777', desc: '팁 사실상 의무 — 안 주면 큰 결례' },
  optional:  { label: '선택',     emoji: '🟡', color: '#D97706', desc: '주는 것이 매너지만 강제 X' },
  rare:      { label: '거의 없음', emoji: '🟢', color: '#0D9488', desc: '일부만 — 굳이 안 줘도 OK' },
  no:        { label: '주면 X',   emoji: '⚫', color: '#9B9B9B', desc: '🚫 팁 문화 없음, 무례할 수 있음' },
}

/* ─────────────────────────────────────────────
   만족도
   ───────────────────────────────────────────── */

export const SATISFACTIONS: { id: Satisfaction; label: string; emoji: string }[] = [
  { id: 'normal', label: '보통',     emoji: '😐' },
  { id: 'good',   label: '좋음',     emoji: '😊' },
  { id: 'great',  label: '매우 좋음', emoji: '🤩' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

export interface TipResult {
  pct?: number              // 적용 % (비율 모드)
  flatAmount?: number       // 정액 (정액 모드)
  tipAmount: number         // 팁 (현지 통화)
  total: number             // 음식+팁 (현지 통화)
  perPerson: number         // 1인당 (현지 통화)
  tipKrw: number            // 팁 원화
  totalKrw: number          // 총액 원화
  perPersonKrw: number      // 1인 원화
  isFlat: boolean
  flatPerPerson: boolean    // 정액이 인원수에 비례하는지("/인" 단위만)
  groupAutoApplied: boolean // 단체 자동 팁 "안내" 대상 (강제 적용 아님)
}

export function calcTip(
  country: CountryMeta,
  service: ServiceId,
  amount: number,
  satisfaction: Satisfaction,
  people: number,
  currencyToKrw: number,
  rateBase = 1,
): TipResult {
  const rates = country.rates[service]
  const safePeople = Math.max(1, people)
  if (!rates) {
    return {
      tipAmount: 0, total: amount, perPerson: amount / safePeople,
      tipKrw: 0, totalKrw: (amount * currencyToKrw) / rateBase, perPersonKrw: ((amount / safePeople) * currencyToKrw) / rateBase,
      isFlat: false, flatPerPerson: false, groupAutoApplied: false,
    }
  }

  const isFlat = !!rates.flat
  let tipAmount = 0
  let pct: number | undefined
  let flatAmount: number | undefined
  let flatPerPerson = false

  // 단체 자동 팁(미국·캐나다 6명+)은 만족도 선택을 덮어쓰지 않고 "안내"로만 처리.
  // 실제로는 업장 정책(자동 서비스 차지)이라 항상 부과되는 게 아니므로 강제하지 않는다.
  const groupAutoEligible = !!(country.groupAuto && service === 'restaurant' && safePeople >= country.groupAuto.size)

  if (rates.pct) {
    const map = { normal: 'min', good: 'mid', great: 'max' } as const
    pct = rates.pct[map[satisfaction]]
    tipAmount = amount * (pct / 100)
  }
  if (rates.flat) {
    const map = { normal: 'min', good: 'mid', great: 'max' } as const
    flatAmount = rates.flat[map[satisfaction]]
    // "/인" 단위(투어·가이드)만 인원수 비례. 호텔(짐·박)·공항(짐)·골프(라운드)는 단위가 짐/박/라운드라 ×1.
    flatPerPerson = rates.flat.unit.includes('인')
    tipAmount = flatPerPerson ? flatAmount * safePeople : flatAmount
  }

  const total = amount + tipAmount
  const perPerson = total / safePeople
  const krwFactor = currencyToKrw / rateBase
  return {
    pct, flatAmount, tipAmount, total, perPerson,
    tipKrw: tipAmount * krwFactor,
    totalKrw: total * krwFactor,
    perPersonKrw: perPerson * krwFactor,
    isFlat,
    flatPerPerson,
    groupAutoApplied: groupAutoEligible,
  }
}

/* 만족도별 비교 (3개 동시) */
export function calcAllSatisfactions(country: CountryMeta, service: ServiceId, amount: number, people: number) {
  return SATISFACTIONS.map((sat) => ({
    sat,
    result: calcTip(country, service, amount, sat.id, Math.max(1, people), country.defaultRate, country.defaultRateBase ?? 1),
  }))
}

/* ─────────────────────────────────────────────
   시나리오 프리셋
   ───────────────────────────────────────────── */

export interface ScenarioItem {
  service: ServiceId
  countryId: string
  amount: number     // 현지 통화
  perDay?: number    // 일별 횟수
  people?: number    // 기본 인원
}

export interface Scenario {
  id: string
  emoji: string
  title: string
  desc: string
  days: number
  defaultPeople: number
  items: ScenarioItem[]
  /** 크루즈 등 자동 청구되는 1인·1일 gratuity (USD). 있으면 합계에 별도 반영 */
  autoTipUsdPpPerDay?: number
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'us_honey',
    emoji: '🥂',
    title: '미국 신혼여행 (7일)',
    desc: '뉴욕·라스베가스 일정. 식당·우버·호텔 중심.',
    days: 7,
    defaultPeople: 2,
    items: [
      { service: 'restaurant', countryId: 'us', amount: 100, perDay: 2 },  // 점심·저녁
      { service: 'taxi',       countryId: 'us', amount: 30,  perDay: 2 },
      { service: 'hotel',      countryId: 'us', amount: 0,   perDay: 1 },  // 룸 팁 정액
      { service: 'tour',       countryId: 'us', amount: 0,   perDay: 0.3 },
    ],
  },
  {
    id: 'sea_golf',
    emoji: '⛳',
    title: '동남아 골프투어 (필리핀, 4일)',
    desc: '클락·세부 골프 + 마사지·식당.',
    days: 4,
    defaultPeople: 4,
    items: [
      { service: 'golf',       countryId: 'ph', amount: 0,    perDay: 1 },
      { service: 'restaurant', countryId: 'ph', amount: 1500, perDay: 2 },
      { service: 'spa',        countryId: 'ph', amount: 0,    perDay: 1 },
      { service: 'taxi',       countryId: 'ph', amount: 300,  perDay: 2 },
    ],
  },
  {
    id: 'cruise',
    emoji: '🚢',
    title: '크루즈 (7박)',
    desc: '카리브해·지중해 크루즈. 1인 $15~20/일 자동 gratuity가 핵심 (객실·다이닝·바 직원 포함).',
    days: 7,
    defaultPeople: 2,
    autoTipUsdPpPerDay: 17.5,   // $15~20/일/인 중간값 — 객실 스튜어드·다이닝·바 자동 청구
    items: [],
  },
  {
    id: 'us_biz',
    emoji: '💼',
    title: '미국 출장 (7일)',
    desc: '실리콘밸리·뉴욕 출장. 호텔·식당·우버.',
    days: 7,
    defaultPeople: 1,
    items: [
      { service: 'restaurant', countryId: 'us', amount: 60,  perDay: 2 },
      { service: 'taxi',       countryId: 'us', amount: 25,  perDay: 4 },
      { service: 'hotel',      countryId: 'us', amount: 0,   perDay: 1 },
    ],
  },
  {
    id: 'bali',
    emoji: '🏝️',
    title: '발리 풀빌라 (5일)',
    desc: '우붓·꾸따 풀빌라 + 마사지·로컬 식당.',
    days: 5,
    defaultPeople: 2,
    items: [
      { service: 'restaurant', countryId: 'id', amount: 300000, perDay: 2 },
      { service: 'spa',        countryId: 'id', amount: 0,      perDay: 1 },
      { service: 'taxi',       countryId: 'id', amount: 100000, perDay: 2 },
      { service: 'hotel',      countryId: 'id', amount: 0,      perDay: 1 },
    ],
  },
  {
    id: 'jp_family',
    emoji: '👨‍👩‍👧‍👦',
    title: '일본 가족여행 (5일)',
    desc: '🚫 팁 X — 답례·심부름값(心付け)으로 대체.',
    days: 5,
    defaultPeople: 4,
    items: [
      { service: 'restaurant', countryId: 'jp', amount: 0, perDay: 0 },
      { service: 'hotel',      countryId: 'jp', amount: 0, perDay: 0 },
    ],
  },
]

/* 시나리오 합계 (참고) */
export function calcScenarioTotal(scenario: Scenario, satisfaction: Satisfaction = 'good'): { tipKrw: number; tipNative: { currency: string; amount: number }[] } {
  let tipKrwTotal = 0
  const byCurrency: Record<string, { currency: string; amount: number }> = {}

  scenario.items.forEach((it) => {
    const country = getCountry(it.countryId)
    const people = scenario.defaultPeople
    const r = country.rates[it.service]
    if (!r) return
    /* 정액 */
    if (r.flat) {
      const map = { normal: 'min', good: 'mid', great: 'max' } as const
      const perPerson = r.flat.unit.includes('인')   // "/인" 단위만 인원 비례
      const amt = perPerson ? r.flat[map[satisfaction]] * people : r.flat[map[satisfaction]]
      const days = Math.max(1, scenario.days * (it.perDay ?? 1))
      const total = amt * days
      tipKrwTotal += (total * country.defaultRate) / (country.defaultRateBase ?? 1)
      const k = country.currencyUnit
      if (!byCurrency[k]) byCurrency[k] = { currency: k, amount: 0 }
      byCurrency[k].amount += total
    } else if (r.pct && it.amount > 0) {
      const map = { normal: 'min', good: 'mid', great: 'max' } as const
      const pct = r.pct[map[satisfaction]]
      const tip = it.amount * (pct / 100)
      const days = Math.max(1, scenario.days * (it.perDay ?? 1))
      const total = tip * days
      tipKrwTotal += (total * country.defaultRate) / (country.defaultRateBase ?? 1)
      const k = country.currencyUnit
      if (!byCurrency[k]) byCurrency[k] = { currency: k, amount: 0 }
      byCurrency[k].amount += total
    }
  })

  /* 크루즈 등 1인·1일 자동 gratuity (USD) — 항목과 별도로 합산 */
  if (scenario.autoTipUsdPpPerDay) {
    const usRate = getCountry('us').defaultRate
    const usd = scenario.autoTipUsdPpPerDay * scenario.defaultPeople * scenario.days
    tipKrwTotal += usd * usRate
    if (!byCurrency['$']) byCurrency['$'] = { currency: '$', amount: 0 }
    byCurrency['$'].amount += usd
  }

  return { tipKrw: tipKrwTotal, tipNative: Object.values(byCurrency) }
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtCurrency(amount: number, unit: string, digits = 2): string {
  return `${unit}${fmt(amount, digits)}`
}

export function fmtKrw(amount: number): string {
  if (amount >= 10000) return `${fmt(amount / 10000, 1)} 만원`
  return `${fmt(amount, 0)} 원`
}
