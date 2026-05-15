/* 관부가세 계산기 — 데이터·계산 유틸 */

export type CountryId = 'us' | 'cn' | 'eu' | 'jp' | 'uk' | 'other'
export type UsageType = 'personal' | 'business'

/* ─────────────────────────────────────────────
   국가 데이터
   ───────────────────────────────────────────── */

export interface CountryMeta {
  id: CountryId
  flag: string
  name: string
  shortName: string
  /** 면세 한도 (USD 환산 기준) */
  dutyFreeUsd: number
  currency: string
  currencyUnit: string
  /** 1 통화 = N 원 (참고치) */
  defaultRate: number
  defaultRateBase?: number
  /** USD로 환산 시 환율 (해당 통화 1당 USD) */
  toUsdRate: number
  popular: string
  shipDays: string
  recommend: string
}

export const COUNTRIES: CountryMeta[] = [
  {
    id: 'us', flag: '🇺🇸', name: '미국 (United States)', shortName: '미국',
    dutyFreeUsd: 200,
    currency: 'USD', currencyUnit: '$', defaultRate: 1400, toUsdRate: 1,
    popular: 'Amazon · iHerb · eBay · Shein',
    shipDays: '7~14일',
    recommend: '노트북·핸드폰·영양제·운동화·가전 (200달러 면세 활용)',
  },
  {
    id: 'cn', flag: '🇨🇳', name: '중국·홍콩 (China·HK)', shortName: '중국·홍콩',
    dutyFreeUsd: 150,
    currency: 'CNY', currencyUnit: '¥', defaultRate: 192, toUsdRate: 0.137,
    popular: 'AliExpress · TaoBao · Temu · 京东',
    shipDays: '5~14일 (국내배송 포함)',
    recommend: '생활용품·소품·의류 (150달러 이내 분할 권장)',
  },
  {
    id: 'eu', flag: '🇪🇺', name: '유럽 (Europe)', shortName: '유럽',
    dutyFreeUsd: 150,
    currency: 'EUR', currencyUnit: '€', defaultRate: 1500, toUsdRate: 1.07,
    popular: 'Matchesfashion · Farfetch · Mytheresa · 24S',
    shipDays: '5~10일 (DHL 빠름)',
    recommend: '명품·가방·신발 (대부분 과세 — 한도 무관)',
  },
  {
    id: 'jp', flag: '🇯🇵', name: '일본 (Japan)', shortName: '일본',
    dutyFreeUsd: 150,
    currency: 'JPY', currencyUnit: '¥', defaultRate: 9.5, defaultRateBase: 1, toUsdRate: 0.0067,
    popular: 'Rakuten · Amazon JP · ZOZOTOWN · 무인양품',
    shipDays: '5~10일',
    recommend: '의류·뷰티·문구·만화책 (한도 도달 빠름 → 분할)',
  },
  {
    id: 'uk', flag: '🇬🇧', name: '영국 (United Kingdom)', shortName: '영국',
    dutyFreeUsd: 150,
    currency: 'GBP', currencyUnit: '£', defaultRate: 1750, toUsdRate: 1.27,
    popular: 'Selfridges · Matches · Lookfantastic · ASOS',
    shipDays: '5~10일',
    recommend: '뷰티·향수·디자이너 의류',
  },
  {
    id: 'other', flag: '🌏', name: '기타 국가', shortName: '기타',
    dutyFreeUsd: 150,
    currency: 'USD', currencyUnit: '$', defaultRate: 1400, toUsdRate: 1,
    popular: '직구 사이트별 다름',
    shipDays: '7~21일',
    recommend: '국가별 인기 품목 다름',
  },
]

export const getCountry = (id: CountryId) => COUNTRIES.find((c) => c.id === id)!

/* ─────────────────────────────────────────────
   품목 데이터
   ───────────────────────────────────────────── */

export interface ItemMeta {
  id: string
  emoji: string
  label: string
  shortLabel: string
  dutyRate: number          // 관세율 (%)
  isListed: boolean         // 목록통관 21개 품목 여부
  excise?: { threshold: number; rate: number }   // 개별소비세 (가방·시계 등)
  hsCode: string
  note?: string
}

export const ITEMS: ItemMeta[] = [
  /* 의류·신발·가방 */
  { id: 'cloth_knit', emoji: '👕', label: '의류 (편직물·니트)',     shortLabel: '의류 (니트)', dutyRate: 13, isListed: true, hsCode: '6109~6111' },
  { id: 'cloth_woven',emoji: '👔', label: '의류 (직물·셔츠·바지)',  shortLabel: '의류',        dutyRate: 13, isListed: true, hsCode: '6203·6204' },
  { id: 'shoe_sport', emoji: '👟', label: '운동화 (합성)',           shortLabel: '운동화',     dutyRate: 13, isListed: true, hsCode: '6402' },
  { id: 'shoe_leather',emoji: '👞', label: '가죽 신발',              shortLabel: '가죽화',     dutyRate: 8,  isListed: true, hsCode: '6403' },
  { id: 'bag',        emoji: '👜', label: '가방·핸드백 (가죽)',     shortLabel: '가방',        dutyRate: 8,  isListed: true,
    excise: { threshold: 2000000, rate: 20 }, hsCode: '4202', note: '200만원 초과분 개별소비세 20%' },
  { id: 'wallet',     emoji: '👛', label: '지갑·소품',               shortLabel: '지갑',        dutyRate: 8,  isListed: true, hsCode: '4202' },
  { id: 'jewelry',    emoji: '💍', label: '주얼리·보석',             shortLabel: '주얼리',     dutyRate: 8,  isListed: true,
    excise: { threshold: 2000000, rate: 20 }, hsCode: '7113·7117', note: '200만원 초과분 개소세' },
  { id: 'watch',      emoji: '⌚', label: '시계',                    shortLabel: '시계',        dutyRate: 8,  isListed: true,
    excise: { threshold: 2000000, rate: 20 }, hsCode: '9101·9102', note: '200만원 초과분 개소세' },
  { id: 'sunglasses', emoji: '👓', label: '선글라스',                shortLabel: '선글라스',   dutyRate: 8,  isListed: true, hsCode: '9004' },
  { id: 'backpack',   emoji: '🎒', label: '백팩',                    shortLabel: '백팩',        dutyRate: 8,  isListed: true, hsCode: '4202' },

  /* 뷰티 */
  { id: 'cosmetic',   emoji: '💄', label: '화장품',                  shortLabel: '화장품',     dutyRate: 6.5, isListed: true, hsCode: '3304' },
  { id: 'haircare',   emoji: '🧴', label: '헤어·바디 케어',          shortLabel: '헤어바디',   dutyRate: 6.5, isListed: true, hsCode: '3305·3307' },
  { id: 'perfume',    emoji: '🌸', label: '향수',                    shortLabel: '향수',        dutyRate: 8,  isListed: true, hsCode: '3303' },

  /* 영양제·건강 */
  { id: 'supplement', emoji: '💊', label: '영양제 (오메가3·비타민)', shortLabel: '영양제',     dutyRate: 8,  isListed: true, hsCode: '2106·3004', note: '150ml/300g 이하 목록통관' },

  /* 전자 */
  { id: 'laptop',     emoji: '💻', label: '노트북·태블릿',           shortLabel: '노트북',      dutyRate: 0,  isListed: false, hsCode: '8471', note: '⭐ 무관세 (부가세만 10%)' },
  { id: 'phone',      emoji: '📱', label: '스마트폰',                shortLabel: '스마트폰',   dutyRate: 0,  isListed: false, hsCode: '8517', note: '⭐ 무관세 (부가세만 10%)' },
  { id: 'monitor',    emoji: '🖥️', label: '모니터',                  shortLabel: '모니터',     dutyRate: 8,  isListed: true, hsCode: '8528' },
  { id: 'earphone',   emoji: '🎧', label: '이어폰·헤드폰',           shortLabel: '이어폰',     dutyRate: 8,  isListed: true, hsCode: '8518' },
  { id: 'keyboard',   emoji: '⌨️', label: '키보드·마우스',           shortLabel: '키보드',     dutyRate: 8,  isListed: true, hsCode: '8471' },
  { id: 'camera',     emoji: '📷', label: '카메라',                  shortLabel: '카메라',     dutyRate: 8,  isListed: true, hsCode: '9006' },
  { id: 'console',    emoji: '🎮', label: '게임기·콘솔',             shortLabel: '게임기',     dutyRate: 8,  isListed: true, hsCode: '9504' },

  /* 기타 */
  { id: 'toy',        emoji: '🧸', label: '완구',                    shortLabel: '완구',        dutyRate: 8,  isListed: true, hsCode: '9503' },
  { id: 'book',       emoji: '📚', label: '도서',                    shortLabel: '도서',        dutyRate: 0,  isListed: true, hsCode: '4901', note: '⭐ 무관세 + 부가세 면제' },
  { id: 'sports',     emoji: '🏋️', label: '운동기구·용품',           shortLabel: '운동용품',   dutyRate: 8,  isListed: true, hsCode: '9506' },
  { id: 'baby',       emoji: '👶', label: '유아 의류·용품',          shortLabel: '유아용품',   dutyRate: 13, isListed: true, hsCode: '6111' },
  { id: 'art',        emoji: '🎨', label: '미술용품',                shortLabel: '미술',        dutyRate: 8,  isListed: true, hsCode: '9608' },

  /* 식품·주류 */
  { id: 'snack',      emoji: '🍫', label: '초콜릿·과자',             shortLabel: '과자',        dutyRate: 8,  isListed: true, hsCode: '1806', note: '식품 가공 8~30% 다양' },
  { id: 'cheese',     emoji: '🧀', label: '치즈',                    shortLabel: '치즈',        dutyRate: 36, isListed: false, hsCode: '0406', note: '치즈 36% 고세율' },
  { id: 'wine',       emoji: '🍷', label: '와인',                    shortLabel: '와인',        dutyRate: 15, isListed: false, hsCode: '2204', note: '15% + 주세 30%' },
]

export const getItem = (id: string) => ITEMS.find((i) => i.id === id) ?? ITEMS[0]

/* ─────────────────────────────────────────────
   계산
   ───────────────────────────────────────────── */

export interface CustomsInputs {
  countryId: CountryId
  itemId: string
  productPrice: number    // 현지 통화
  shippingFee: number     // 현지 통화
  exchangeRate: number    // 1 통화 = N 원 (만약 defaultRateBase=100이면 100엔 = N원)
  rateBase: number
  toUsdRate: number
  usage: UsageType
}

export interface CustomsResult {
  /* 입력 환산 */
  totalLocal: number          // 상품+배송 (현지 통화)
  totalKrw: number            // 원화 환산 = 과세가격 (CIF)
  totalUsd: number            // USD 환산 (면세 한도 비교)
  /* 면세 판단 */
  dutyFreeLimit: number       // USD
  isDutyFree: boolean         // 면세 여부
  isListedClearance: boolean  // 목록통관 가능
  reason: string              // 판단 이유
  /* 세금 (원) */
  duty: number                // 관세
  vat: number                 // 부가세 10%
  excise: number              // 개별소비세
  totalTax: number            // 합계
  /* 결과 */
  finalKrw: number            // 최종 구매가 (원)
  domesticEstimate: number    // 한국 백화점 추정가
  saving: number              // 절감액 (한국 - 직구)
}

export function calcCustoms(inp: CustomsInputs): CustomsResult {
  const country = getCountry(inp.countryId)
  const item = getItem(inp.itemId)
  const totalLocal = inp.productPrice + inp.shippingFee
  const totalKrw = (totalLocal * inp.exchangeRate) / Math.max(1, inp.rateBase)
  const totalUsd = totalLocal * inp.toUsdRate

  const dutyFreeLimit = country.dutyFreeUsd

  /* 면세 판단 */
  let isDutyFree = false
  let isListedClearance = false
  let reason = ''

  if (inp.usage === 'business') {
    reason = '🚫 사업자 직구는 면세 X — 일반통관'
  } else if (!item.isListed) {
    reason = `⚠️ ${item.label}은(는) 목록통관 21개 품목 외 — 일반통관 (관세·부가세 부과)`
  } else if (totalUsd <= dutyFreeLimit) {
    isDutyFree = true
    isListedClearance = true
    reason = `✅ ${country.shortName} 면세 한도 $${dutyFreeLimit} 이하 + 자가사용 + 목록통관 품목 → 면세 (관세·부가세 X)`
  } else {
    reason = `❌ 면세 한도 $${dutyFreeLimit} 초과 ($${totalUsd.toFixed(2)}) → 일반통관`
  }

  /* 세금 계산 */
  let duty = 0
  let vat = 0
  let excise = 0
  if (!isDutyFree) {
    duty = totalKrw * (item.dutyRate / 100)
    /* 도서는 부가세 면제 */
    if (item.id !== 'book') {
      vat = (totalKrw + duty) * 0.10
    }
    /* 개별소비세 (200만원 초과분) */
    if (item.excise && totalKrw > item.excise.threshold) {
      excise = (totalKrw - item.excise.threshold) * (item.excise.rate / 100)
    }
  }
  const totalTax = duty + vat + excise
  const finalKrw = totalKrw + totalTax

  /* 한국 백화점 추정가 (일반적으로 직구 + 30~80% 마진) */
  const marginRate = item.id === 'bag' || item.id === 'watch' ? 1.7
                   : item.id === 'cosmetic' || item.id === 'perfume' ? 1.5
                   : item.id === 'cloth_knit' || item.id === 'cloth_woven' ? 1.4
                   : item.id === 'laptop' || item.id === 'phone' ? 1.1
                   : 1.3
  const domesticEstimate = totalKrw * marginRate
  const saving = Math.max(0, domesticEstimate - finalKrw)

  return {
    totalLocal, totalKrw, totalUsd,
    dutyFreeLimit, isDutyFree, isListedClearance, reason,
    duty, vat, excise, totalTax, finalKrw,
    domesticEstimate, saving,
  }
}

/* ─────────────────────────────────────────────
   목록통관 21개 품목 정보
   ───────────────────────────────────────────── */

export const LISTED_CATEGORIES = [
  '👕 의류', '👟 신발', '👜 가방·핸드백', '👛 지갑·소품',
  '💍 액세서리·주얼리', '⌚ 시계', '👓 선글라스',
  '🧸 완구', '✏️ 문구', '🏋️ 운동용품',
  '💄 화장품', '🌸 향수', '🧴 헤어·바디',
  '💊 영양제 (150ml/300g 이하)',
  '🍫 가공식품', '📚 도서', '💿 CD·DVD',
  '🎵 악기', '🔧 공구', '⚡ 전기제품',
  '🧹 생활용품',
]

/* ─────────────────────────────────────────────
   시나리오 프리셋
   ───────────────────────────────────────────── */

export interface CustomsScenario {
  id: string
  emoji: string
  title: string
  desc: string
  countryId: CountryId
  itemId: string
  productPrice: number
  shippingFee: number
  notes: string[]
}

export const SCENARIOS: CustomsScenario[] = [
  {
    id: 'amazon',
    emoji: '🛒',
    title: '아마존 (미국·전자)',
    desc: '노트북·헤드폰·영양제 — 200달러 면세 활용',
    countryId: 'us',
    itemId: 'laptop',
    productPrice: 999,
    shippingFee: 25,
    notes: ['💡 노트북·핸드폰은 무관세 (부가세 10%만)', '⭐ 200달러 미만 + 자가사용 면세', '📦 미국 직배 vs 배대지 비교'],
  },
  {
    id: 'aliexpress',
    emoji: '🛍️',
    title: '알리·테무 (중국 생활용품)',
    desc: '소품·의류·잡화 — 거의 면세',
    countryId: 'cn',
    itemId: 'cloth_knit',
    productPrice: 50,
    shippingFee: 5,
    notes: ['💡 대부분 150달러 이하 → 면세', '⚠️ 합산 과세 주의 (2일 내)', '📦 알리 표준 5~14일'],
  },
  {
    id: 'matchesfashion',
    emoji: '👜',
    title: 'Matchesfashion (유럽 명품)',
    desc: '명품 가방·신발 — 거의 과세',
    countryId: 'eu',
    itemId: 'bag',
    productPrice: 1500,
    shippingFee: 30,
    notes: ['⚠️ 명품은 거의 과세 (한도 초과)', '💎 200만원 초과분 개소세 20%', '🇰🇷 한국 백화점 대비 30~50% 절감'],
  },
  {
    id: 'rakuten',
    emoji: '👗',
    title: '일본 라쿠텐 (의류·뷰티)',
    desc: '의류·화장품 — 한도 도달 빠름',
    countryId: 'jp',
    itemId: 'cloth_knit',
    productPrice: 12000,
    shippingFee: 2000,
    notes: ['⚠️ 환율 ↑ 시 빠르게 한도 도달', '💡 의류 13% 관세 + 부가세', '📦 EMS 5~7일'],
  },
  {
    id: 'shein',
    emoji: '👚',
    title: '셰인·로미라이 (미국 의류)',
    desc: '저가 의류 대량 — 분할 권장',
    countryId: 'us',
    itemId: 'cloth_knit',
    productPrice: 180,
    shippingFee: 0,
    notes: ['💡 200달러 이하 → 면세', '⚠️ 같은 날 추가 구매 시 합산 위험', '📦 무료배송 多'],
  },
  {
    id: 'phone_laptop',
    emoji: '📱',
    title: '핸드폰·노트북 (무관세)',
    desc: '아이폰·맥북 — 부가세만 10%',
    countryId: 'us',
    itemId: 'phone',
    productPrice: 999,
    shippingFee: 30,
    notes: ['⭐ 노트북·핸드폰은 관세 0%', '💡 부가세 10%만 부담', '🇰🇷 한국 출시가 대비 20~30% 절감 가능'],
  },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtKrw(amount: number): string {
  if (Math.abs(amount) >= 100000000) return `${fmt(amount / 100000000, 1)} 억`
  if (Math.abs(amount) >= 10000) return `${fmt(amount / 10000, 1)} 만원`
  return `${fmt(amount, 0)} 원`
}

export function fmtCurrency(amount: number, unit: string, digits = 2): string {
  return `${unit}${fmt(amount, digits)}`
}
