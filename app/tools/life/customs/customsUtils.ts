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
  /** USD로 환산 시 환율 (해당 통화 1당 USD) — 참고 표시용.
   *  면세 판정은 calcCustoms에서 '원화 환산액 ÷ USD 환율'로 구함(입력 환율 반영). */
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
    recommend: '노트북·핸드폰·운동화·가전 ($200 면세는 목록통관 물품만, 영양제·식품은 $150)',
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
    /* 기본 환율은 USD 1,400원 기준으로 EUR/USD 약 1.14(2026년 9월 시세 근사)에 맞춘 참고치 */
    currency: 'EUR', currencyUnit: '€', defaultRate: 1600, toUsdRate: 1.14,
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
    /* GBP/USD 약 1.33(2026년 9월 시세 근사) × USD 1,400원 */
    currency: 'GBP', currencyUnit: '£', defaultRate: 1860, toUsdRate: 1.33,
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

export const isCountryId = (v: unknown): v is CountryId =>
  typeof v === 'string' && COUNTRIES.some((c) => c.id === v)
export const getCountry = (id: CountryId) => COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0]

/** 면세 판정용 USD 환율 기본값 (미국 기본 환율과 동일) */
export const DEFAULT_USD_KRW = 1400

/* ─────────────────────────────────────────────
   품목 데이터
   ───────────────────────────────────────────── */

export interface ItemMeta {
  id: string
  emoji: string
  label: string
  shortLabel: string
  dutyRate: number          // 관세율 (%)
  isListed: boolean         // 목록통관(간이절차) 가능 품목 여부 — 면세 자격과 별개
  dutyFreeExcluded?: boolean // 소액면세 배제 품목 (주류·담배 등) — 한도와 무관하게 과세
  excise?: { threshold: number; rate: number }   // 개별소비세 (가방·시계 등)
  liquor?: { rate: number }  // 주류: 주세율 (%) — 와인 등
  hsCode: string
  note?: string
}

/* 관세율: 관세율표 기본세율(관세법 별표) 기준 간이값 — 관세법령정보포털(unipass) 세율표로 확인, 2026-09 검토.
   ITA(정보기술협정) 품목(8471 컴퓨터·입출력장치, 8517 휴대폰, 8528.52 컴퓨터 모니터, 8525.89 디지털카메라)은 0%.
   비디오게임 콘솔(9504.50)은 기본세율 8%이나 WTO 협정세율 0%가 우선 적용돼 0%로 둠.
   신발류(64류)는 소재와 관계없이 13%. FTA 협정세율·원산지는 반영하지 않음.
   TODO(lib): 법정 수치이므로 lib/ 단일 소스로 이전 필요 */
export const ITEMS: ItemMeta[] = [
  /* 의류·신발·가방 */
  { id: 'cloth_knit', emoji: '👕', label: '의류 (편직물·니트)',     shortLabel: '의류 (니트)', dutyRate: 13, isListed: true, hsCode: '6109~6111' },
  { id: 'cloth_woven',emoji: '👔', label: '의류 (직물·셔츠·바지)',  shortLabel: '의류',        dutyRate: 13, isListed: true, hsCode: '6203·6204' },
  { id: 'shoe_sport', emoji: '👟', label: '운동화 (합성)',           shortLabel: '운동화',     dutyRate: 13, isListed: true, hsCode: '6402' },
  { id: 'shoe_leather',emoji: '👞', label: '가죽 신발',              shortLabel: '가죽화',     dutyRate: 13, isListed: true, hsCode: '6403', note: '신발류(64류)는 소재와 관계없이 기본세율 13%' },
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
  { id: 'supplement', emoji: '💊', label: '영양제 (오메가3·비타민)', shortLabel: '영양제',     dutyRate: 8,  isListed: false, hsCode: '2106·3004', note: '건강기능식품은 목록통관 배제 → 수입신고 대상이라 면세 한도가 $150(미국발도 동일)이고, 자가사용은 6병까지 인정됩니다' },

  /* 전자 */
  { id: 'laptop',     emoji: '💻', label: '노트북·태블릿',           shortLabel: '노트북',      dutyRate: 0,  isListed: true, hsCode: '8471', note: '⭐ 무관세 (한도 초과 시 부가세 10%)' },
  { id: 'phone',      emoji: '📱', label: '스마트폰',                shortLabel: '스마트폰',   dutyRate: 0,  isListed: true, hsCode: '8517', note: '⭐ 무관세 (한도 초과 시 부가세 10%)' },
  { id: 'monitor',    emoji: '🖥️', label: '컴퓨터 모니터',           shortLabel: '모니터',     dutyRate: 0,  isListed: true, hsCode: '8528.52', note: '⭐ 컴퓨터용 모니터는 정보기술협정(ITA) 품목이라 무관세. TV 수신 기능이 있으면 TV로 분류돼 8%' },
  { id: 'earphone',   emoji: '🎧', label: '이어폰·헤드폰',           shortLabel: '이어폰',     dutyRate: 8,  isListed: true, hsCode: '8518' },
  { id: 'keyboard',   emoji: '⌨️', label: '키보드·마우스',           shortLabel: '키보드',     dutyRate: 0,  isListed: true, hsCode: '8471.60', note: '⭐ 컴퓨터 입출력장치(ITA 품목)라 무관세 (한도 초과 시 부가세 10%)' },
  { id: 'camera',     emoji: '📷', label: '디지털카메라',            shortLabel: '카메라',     dutyRate: 0,  isListed: true, hsCode: '8525.89', note: '⭐ 디지털카메라 본체는 ITA 품목이라 무관세. 교환렌즈 단품(9002)은 8%' },
  { id: 'console',    emoji: '🎮', label: '게임기·콘솔',             shortLabel: '게임기',     dutyRate: 0,  isListed: true, hsCode: '9504.50', note: '⭐ 비디오게임 콘솔은 기본세율 8%지만 WTO 협정세율 0%가 적용돼 무관세 (한도 초과 시 부가세 10%). 완구(9503)로 분류되는 제품은 8%' },

  /* 기타 */
  { id: 'toy',        emoji: '🧸', label: '완구',                    shortLabel: '완구',        dutyRate: 8,  isListed: true, hsCode: '9503' },
  { id: 'book',       emoji: '📚', label: '도서',                    shortLabel: '도서',        dutyRate: 0,  isListed: true, hsCode: '4901', note: '⭐ 무관세 + 부가세 면제' },
  { id: 'sports',     emoji: '🏋️', label: '운동기구·용품',           shortLabel: '운동용품',   dutyRate: 8,  isListed: true, hsCode: '9506' },
  { id: 'baby',       emoji: '👶', label: '유아 의류·용품',          shortLabel: '유아용품',   dutyRate: 13, isListed: true, hsCode: '6111' },
  { id: 'art',        emoji: '🎨', label: '미술용품',                shortLabel: '미술',        dutyRate: 8,  isListed: true, hsCode: '9608' },

  /* 식품·주류 */
  { id: 'snack',      emoji: '🍫', label: '초콜릿·과자',             shortLabel: '과자',        dutyRate: 8,  isListed: false, hsCode: '1806', note: '식품류는 목록통관 배제 → 수입신고 대상이라 면세 한도 $150(미국발도 동일). 가공식품 관세율은 품목에 따라 8~30%로 다양' },
  { id: 'cheese',     emoji: '🧀', label: '치즈',                    shortLabel: '치즈',        dutyRate: 36, isListed: false, hsCode: '0406', note: '치즈 36% 고세율' },
  { id: 'wine',       emoji: '🍷', label: '와인',                    shortLabel: '와인',        dutyRate: 15, isListed: false, dutyFreeExcluded: true, liquor: { rate: 30 }, hsCode: '2204', note: '소액면세 배제(주류) · 관세 15% + 주세 30% + 교육세 — 주류는 통관·검역·자가소비 한도 별도, 관세청 확인 필수' },
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
  /** 면세 판정용 USD 환율 (1$ = N원). 주면 원화 환산액 ÷ usdKrw로 USD를 구함 */
  usdKrw?: number
  usage: UsageType
}

export interface CustomsResult {
  /* 입력 환산 */
  totalLocal: number          // 상품+배송 (현지 통화)
  totalKrw: number            // 원화 환산 = 과세가격 (CIF)
  totalUsd: number            // 상품+배송 USD 환산 (참고)
  productUsd: number          // 물품가격 USD (배송 제외) — 면세 한도 판정 기준
  /* 면세 판단 */
  dutyFreeLimit: number       // USD (목록통관 배제 품목은 미국발도 150)
  nearLimit: boolean          // 한도 ±5% 이내 — 고시 환율에 따라 판정이 바뀔 수 있음
  isDutyFree: boolean         // 면세 여부
  isListedClearance: boolean  // 목록통관(간이절차) 가능
  reason: string              // 판단 이유
  /* 세금 (원) */
  duty: number                // 관세
  vat: number                 // 부가세 10%
  excise: number              // 개별소비세
  liquorTax: number           // 주세 (주류)
  eduTax: number              // 교육세 (개소세 30% 또는 주세 10%)
  totalTax: number            // 합계
  /* 결과 */
  finalKrw: number            // 최종 구매가 (원)
  domesticEstimate: number    // 한국 백화점 추정가
  saving: number              // 절감액 (한국 - 직구)
}

export function calcCustoms(inp: CustomsInputs): CustomsResult {
  const country = getCountry(inp.countryId)
  const item = getItem(inp.itemId)
  /* 음수·비정상 입력 방어 */
  const productLocal = Math.max(0, inp.productPrice)
  const shipLocal = Math.max(0, inp.shippingFee)
  const exchange = Math.max(0, inp.exchangeRate)
  const base = Math.max(1, inp.rateBase)

  const totalLocal = productLocal + shipLocal
  const totalKrw = (totalLocal * exchange) / base          // 과세가격(CIF): 상품+배송
  /* USD 환산: 원화 환산액 ÷ USD 환율 (관세청도 과세환율로 교차 환산).
     usdKrw가 없으면 고정 교차환율(toUsdRate)로 폴백 */
  const usdKrw = inp.usdKrw && inp.usdKrw > 0 ? inp.usdKrw : 0
  /* 달러 표시 가격은 환율과 무관하게 그대로 한도와 비교. 그 외 통화는 센트 단위로 반올림해
     부동소수 오차(예: 200.00000000000003)로 한도 경계에서 과세로 뒤집히는 일을 막음 */
  const toUsd = (local: number) => {
    if (country.currency === 'USD') return local
    const v = usdKrw > 0 ? (local * exchange) / base / usdKrw : local * inp.toUsdRate
    return Math.round(v * 100) / 100
  }
  const totalUsd = toUsd(totalLocal)                       // 참고용
  /* 면세 한도는 '물품가격'(운임·보험 제외) 기준 — 관세청 소액면세 규정 */
  const productUsd = toUsd(productLocal)

  /* 소액면세 한도: 관세법 시행규칙 제45조 물품가격 $150, 미국발 특송 목록통관 물품은 $200
     (특송물품 수입통관 사무처리에 관한 고시). 목록통관 배제(건강기능식품·식품 등 수입신고) 물품은 미국발도 $150.
     TODO(lib): 법정 한도이므로 lib/ 단일 소스로 이전 필요 */
  const dutyFreeLimit = item.isListed ? country.dutyFreeUsd : Math.min(country.dutyFreeUsd, 150)
  /* 한도 ±5% 구간: 관세청 고시 과세환율에 따라 판정이 바뀔 수 있음 */
  const nearLimit = productUsd >= dutyFreeLimit * 0.95 && productUsd <= dutyFreeLimit * 1.05

  /* 면세 판단 — 소액면세는 목록통관/일반신고 무관하게 자가사용+한도 이하면 적용 (주류 등 배제 품목 제외) */
  let isDutyFree = false
  let isListedClearance = false
  let reason = ''

  if (inp.usage === 'business') {
    reason = '🚫 사업자 직구는 면세 X — 일반통관 (관세·부가세 부과)'
  } else if (item.dutyFreeExcluded) {
    reason = `⚠️ ${item.label}은(는) 소액면세 배제 품목(주류·담배 등) — 한도와 무관하게 과세`
  } else if (productUsd <= dutyFreeLimit) {
    isDutyFree = true
    isListedClearance = item.isListed
    reason = item.isListed
      ? `✅ 물품가격 $${productUsd.toFixed(2)} ≤ ${country.shortName} 면세 한도 $${dutyFreeLimit} + 자가사용 + 목록통관 품목 → 면세 (배송비 제외 기준)`
      : `✅ 물품가격 $${productUsd.toFixed(2)} ≤ 한도 $${dutyFreeLimit} + 자가사용 → 소액면세 (목록통관 배제 품목이라 수입신고 절차)`
  } else {
    reason = item.isListed || country.dutyFreeUsd <= 150
      ? `❌ 물품가격 $${productUsd.toFixed(2)}가 면세 한도 $${dutyFreeLimit} 초과 → 과세 (배송비 제외 물품가격 기준)`
      : `❌ 물품가격 $${productUsd.toFixed(2)}가 면세 한도 $${dutyFreeLimit} 초과 → 과세 (목록통관 배제 품목은 미국발도 $150 한도)`
  }

  /* 세금 계산 (수입 과세 적층: 관세 → 개소세/주세 → 교육세 → 부가세) */
  let duty = 0
  let vat = 0
  let excise = 0
  let liquorTax = 0
  let eduTax = 0
  if (!isDutyFree) {
    duty = totalKrw * (item.dutyRate / 100)
    if (item.liquor) {
      /* 주류: 주세 = (과세가격 + 관세) × 주세율, 교육세 = 주세의 10% (주세율 70% 미만) */
      liquorTax = (totalKrw + duty) * (item.liquor.rate / 100)
      eduTax = liquorTax * 0.10
    } else if (item.excise) {
      /* 개별소비세: 기준가격(200만원) 초과분 — 과세표준 = 과세가격 + 관세 */
      const exciseBase = totalKrw + duty
      if (exciseBase > item.excise.threshold) {
        excise = (exciseBase - item.excise.threshold) * (item.excise.rate / 100)
      }
      /* 교육세 = 개별소비세의 30% */
      eduTax = excise * 0.30
    }
    /* 부가세 10% — 과세표준 = 과세가격 + 관세 + 개소세/주세 + 교육세 (도서는 면제) */
    if (item.id !== 'book') {
      vat = (totalKrw + duty + excise + liquorTax + eduTax) * 0.10
    }
  }
  const totalTax = duty + vat + excise + liquorTax + eduTax
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
    totalLocal, totalKrw, totalUsd, productUsd,
    dutyFreeLimit, nearLimit, isDutyFree, isListedClearance, reason,
    duty, vat, excise, liquorTax, eduTax, totalTax, finalKrw,
    domesticEstimate, saving,
  }
}

/* ─────────────────────────────────────────────
   목록통관 가능 품목 예시 (건강기능식품·식품류는 배제대상이라 제외)
   ───────────────────────────────────────────── */

export const LISTED_CATEGORIES = [
  '👕 의류', '👟 신발', '👜 가방·핸드백', '👛 지갑·소품',
  '💍 액세서리·주얼리', '⌚ 시계', '👓 선글라스',
  '🧸 완구', '✏️ 문구', '🏋️ 운동용품',
  '💄 화장품', '🌸 향수', '🧴 헤어·바디',
  '📚 도서', '💿 CD·DVD',
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
    desc: '노트북·헤드폰 — 200달러 면세 활용',
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
