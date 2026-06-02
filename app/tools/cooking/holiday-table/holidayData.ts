/* ───────────────────────────────────────────────────────────
   명절 상차림 데이터
   - 설날·추석·제사 × 차례상(전통)·간소차림·식사 위주
   - 인당 권장량 + 최근(2024~2025) 시장 평균 단가 (KAMIS·마트 기준)
   - kamisItemCode 있는 품목은 실시간 시세 연동 (/api/produce-price)
   ─────────────────────────────────────────────────────────── */

export type Category = '정육' | '수산' | '채소·과일' | '곡물·떡' | '견과·제수' | '음료·기타'
export type HolidayId = 'seol' | 'chuseok' | 'jesa'
export type FormatId = 'formal' | 'simple' | 'meal'

export interface Item {
  id: string
  name: string
  category: Category
  unit: string           // 표시 단위
  pricePerUnit: number   // 1 unit당 원
  kamisItemCode?: string
  kamisKindCode?: string
  note?: string
}

/* ─── 품목 DB (35종, 명절·상 형식별로 사용) ─── */
export const ITEMS: Record<string, Item> = {
  /* 🥩 정육 */
  galbi_beef:    { id: 'galbi_beef',    name: '한우 갈비찜용 갈비', category: '정육', unit: 'g',  pricePerUnit: 80, note: '명절가 인상 큼' },
  beef_gukgeori: { id: 'beef_gukgeori', name: '소고기 국거리',     category: '정육', unit: 'g',  pricePerUnit: 55 },
  beef_sanjeok:  { id: 'beef_sanjeok',  name: '소고기 산적용',     category: '정육', unit: 'g',  pricePerUnit: 60 },
  pork_minced:   { id: 'pork_minced',   name: '돼지고기 다짐육 (동그랑땡용)', category: '정육', unit: 'g', pricePerUnit: 22 },

  /* 🐟 수산 */
  jogi:        { id: 'jogi',        name: '조기',             category: '수산', unit: '마리', pricePerUnit: 4500 },
  myungtae_po: { id: 'myungtae_po', name: '동태포',           category: '수산', unit: 'g',  pricePerUnit: 32 },

  /* 🥬 채소·과일 (KAMIS 연동) */
  mu:        { id: 'mu',        name: '무',             category: '채소·과일', unit: '개',   pricePerUnit: 2200, kamisItemCode: '231', kamisKindCode: '01' },
  sagua:     { id: 'sagua',     name: '사과 (부사)',    category: '채소·과일', unit: '개',   pricePerUnit: 2500, kamisItemCode: '411', kamisKindCode: '06' },
  bae:       { id: 'bae',       name: '배 (신고)',      category: '채소·과일', unit: '개',   pricePerUnit: 4500, kamisItemCode: '412', kamisKindCode: '02' },
  gam:       { id: 'gam',       name: '단감',           category: '채소·과일', unit: '개',   pricePerUnit: 1500, kamisItemCode: '413', kamisKindCode: '06' },
  sigeumchi: { id: 'sigeumchi', name: '시금치',         category: '채소·과일', unit: '단',   pricePerUnit: 3500, kamisItemCode: '226', kamisKindCode: '00', note: '명절가 인상 큼' },
  doraji:    { id: 'doraji',    name: '도라지 (생)',    category: '채소·과일', unit: 'g',    pricePerUnit: 35 },
  gosari:    { id: 'gosari',    name: '고사리 (말린)',   category: '채소·과일', unit: 'g',    pricePerUnit: 50 },
  toran:     { id: 'toran',     name: '토란',           category: '채소·과일', unit: 'g',    pricePerUnit: 25 },
  hobak:     { id: 'hobak',     name: '애호박',         category: '채소·과일', unit: '개',   pricePerUnit: 2000 },
  daepa:     { id: 'daepa',     name: '대파',           category: '채소·과일', unit: '단',   pricePerUnit: 3500 },
  maneul:    { id: 'maneul',    name: '다진 마늘',      category: '채소·과일', unit: 'g',    pricePerUnit: 25, kamisItemCode: '258', kamisKindCode: '00' },

  /* 🍚 곡물·떡 */
  ssal:        { id: 'ssal',        name: '쌀 (제수용)',         category: '곡물·떡', unit: 'g',  pricePerUnit: 5 },
  tteokguk:    { id: 'tteokguk',    name: '떡국떡',              category: '곡물·떡', unit: 'g',  pricePerUnit: 12 },
  mandu:       { id: 'mandu',       name: '만두 (떡국용)',       category: '곡물·떡', unit: '개', pricePerUnit: 400 },
  songpyeon:   { id: 'songpyeon',   name: '송편 (떡집)',         category: '곡물·떡', unit: 'g',  pricePerUnit: 18 },
  siru_tteok:  { id: 'siru_tteok',  name: '시루떡 (제사용)',     category: '곡물·떡', unit: 'g',  pricePerUnit: 14 },
  buchimgaru:  { id: 'buchimgaru',  name: '부침가루',            category: '곡물·떡', unit: 'g',  pricePerUnit: 6 },
  egg:         { id: 'egg',         name: '계란 (전 부치기용)',  category: '곡물·떡', unit: '개', pricePerUnit: 350 },
  glass_dangmyeon: { id: 'glass_dangmyeon', name: '당면 (잡채용)', category: '곡물·떡', unit: 'g', pricePerUnit: 8 },

  /* 🌰 견과·제수 */
  daechu:      { id: 'daechu',      name: '대추 (말린)',        category: '견과·제수', unit: 'g',   pricePerUnit: 35 },
  bam:         { id: 'bam',         name: '밤 (생밤)',           category: '견과·제수', unit: '개',  pricePerUnit: 350 },
  gotgam:      { id: 'gotgam',      name: '곶감',                category: '견과·제수', unit: '개',  pricePerUnit: 1200 },
  jat:         { id: 'jat',         name: '잣',                  category: '견과·제수', unit: 'g',   pricePerUnit: 90 },
  hangwa:      { id: 'hangwa',      name: '한과 세트',           category: '견과·제수', unit: '세트', pricePerUnit: 25000, note: '인당 0.1세트 = 10인 1세트' },

  /* 🍶 음료·기타 */
  jeongjong: { id: 'jeongjong', name: '청주 (제주)',     category: '음료·기타', unit: 'ml',  pricePerUnit: 8 },
  sikhye:    { id: 'sikhye',    name: '식혜·수정과',     category: '음료·기타', unit: 'ml',  pricePerUnit: 5 },
  yangnyeom: { id: 'yangnyeom', name: '양념 묶음 (간장·참기름·설탕 등)', category: '음료·기타', unit: '인분', pricePerUnit: 1800 },
  oil:       { id: 'oil',       name: '식용유 (전 부치기)', category: '음료·기타', unit: 'ml', pricePerUnit: 8 },
  surimi:    { id: 'surimi',    name: '맛살 (잡채용)',   category: '수산', unit: 'g', pricePerUnit: 30 },
}

/* ─── 명절·상 형식별 구성 ─── */
export interface HolidayFormatConfig {
  formal: { name: string; desc: string; items: { id: string; perPerson: number }[] }
  simple: { name: string; desc: string; items: { id: string; perPerson: number }[] }
  meal:   { name: string; desc: string; items: { id: string; perPerson: number }[] }
}

export interface HolidayConfig {
  id: HolidayId
  name: string
  emoji: string
  description: string
  formats: HolidayFormatConfig
}

/* 🐲 설날 */
const SEOL: HolidayConfig = {
  id: 'seol',
  name: '설날',
  emoji: '🐲',
  description: '음력 1월 1일. 차례상 + 떡국. 어른께 세배 + 세뱃돈 + 가족 모임',
  formats: {
    formal: {
      name: '차례상 (전통)',
      desc: '5열 차례상 정석 — 떡국·갈비찜·전 3종·3색 나물·3색 과일·견과·제주',
      items: [
        // 떡국 (필수)
        { id: 'tteokguk',       perPerson: 250 },
        { id: 'mandu',          perPerson: 5 },
        { id: 'beef_gukgeori',  perPerson: 50 },
        { id: 'egg',            perPerson: 1 },
        { id: 'daepa',          perPerson: 0.15 },
        // 갈비찜
        { id: 'galbi_beef',     perPerson: 250 },
        { id: 'mu',             perPerson: 0.2 },
        // 전 (3종)
        { id: 'myungtae_po',    perPerson: 60 },
        { id: 'pork_minced',    perPerson: 80 },
        { id: 'hobak',          perPerson: 0.4 },
        { id: 'buchimgaru',     perPerson: 80 },
        { id: 'oil',            perPerson: 80 },
        // 어동육서
        { id: 'jogi',           perPerson: 0.5 },
        { id: 'beef_sanjeok',   perPerson: 60 },
        // 3색 나물
        { id: 'sigeumchi',      perPerson: 0.25 },
        { id: 'doraji',         perPerson: 60 },
        { id: 'gosari',         perPerson: 50 },
        // 과일·견과
        { id: 'sagua',          perPerson: 1 },
        { id: 'bae',            perPerson: 0.5 },
        { id: 'gam',            perPerson: 1 },
        { id: 'daechu',         perPerson: 30 },
        { id: 'bam',            perPerson: 5 },
        { id: 'gotgam',         perPerson: 1 },
        // 음료·기타
        { id: 'jeongjong',      perPerson: 50 },
        { id: 'sikhye',         perPerson: 200 },
        { id: 'hangwa',         perPerson: 0.1 },
        { id: 'maneul',         perPerson: 25 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    simple: {
      name: '간소 차림',
      desc: '핵심만 — 떡국 + 갈비찜 + 전 1종 + 과일 + 견과',
      items: [
        { id: 'tteokguk',       perPerson: 250 },
        { id: 'mandu',          perPerson: 5 },
        { id: 'beef_gukgeori',  perPerson: 50 },
        { id: 'egg',            perPerson: 1 },
        { id: 'galbi_beef',     perPerson: 250 },
        { id: 'mu',             perPerson: 0.2 },
        { id: 'pork_minced',    perPerson: 80 },
        { id: 'buchimgaru',     perPerson: 50 },
        { id: 'oil',            perPerson: 50 },
        { id: 'sagua',          perPerson: 0.5 },
        { id: 'bae',            perPerson: 0.3 },
        { id: 'daechu',         perPerson: 15 },
        { id: 'maneul',         perPerson: 20 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    meal: {
      name: '식사 위주',
      desc: '가족 식사 중심 — 떡국 + 갈비찜 + 잡채',
      items: [
        { id: 'tteokguk',       perPerson: 250 },
        { id: 'mandu',          perPerson: 5 },
        { id: 'beef_gukgeori',  perPerson: 70 },
        { id: 'egg',            perPerson: 1.5 },
        { id: 'daepa',          perPerson: 0.15 },
        { id: 'galbi_beef',     perPerson: 250 },
        { id: 'mu',             perPerson: 0.2 },
        { id: 'glass_dangmyeon', perPerson: 60 },
        { id: 'sigeumchi',      perPerson: 0.15 },
        { id: 'pork_minced',    perPerson: 50 },
        { id: 'surimi',         perPerson: 30 },
        { id: 'sagua',          perPerson: 0.5 },
        { id: 'maneul',         perPerson: 25 },
        { id: 'yangnyeom',      perPerson: 1 },
        { id: 'oil',            perPerson: 30 },
      ],
    },
  },
}

/* 🌕 추석 */
const CHUSEOK: HolidayConfig = {
  id: 'chuseok',
  name: '추석',
  emoji: '🌕',
  description: '음력 8월 15일. 차례상 + 송편. 햇과일·햇곡식 차림',
  formats: {
    formal: {
      name: '차례상 (전통)',
      desc: '추석 정석 — 송편·토란국·갈비찜·전·3색 나물·햇과일',
      items: [
        // 송편 (필수)
        { id: 'songpyeon',      perPerson: 200 },
        // 토란국
        { id: 'toran',          perPerson: 80 },
        { id: 'beef_gukgeori',  perPerson: 50 },
        { id: 'mu',             perPerson: 0.1 },
        { id: 'daepa',          perPerson: 0.1 },
        // 갈비찜
        { id: 'galbi_beef',     perPerson: 250 },
        // 전
        { id: 'myungtae_po',    perPerson: 60 },
        { id: 'pork_minced',    perPerson: 80 },
        { id: 'hobak',          perPerson: 0.4 },
        { id: 'buchimgaru',     perPerson: 80 },
        { id: 'oil',            perPerson: 80 },
        { id: 'egg',            perPerson: 1 },
        // 어동육서
        { id: 'jogi',           perPerson: 0.5 },
        { id: 'beef_sanjeok',   perPerson: 60 },
        // 3색 나물
        { id: 'sigeumchi',      perPerson: 0.25 },
        { id: 'doraji',         perPerson: 60 },
        { id: 'gosari',         perPerson: 50 },
        // 과일·견과 (햇과일)
        { id: 'sagua',          perPerson: 1 },
        { id: 'bae',            perPerson: 0.5 },
        { id: 'gam',            perPerson: 1 },
        { id: 'daechu',         perPerson: 30 },
        { id: 'bam',            perPerson: 5 },
        // 음료
        { id: 'jeongjong',      perPerson: 50 },
        { id: 'sikhye',         perPerson: 200 },
        { id: 'hangwa',         perPerson: 0.1 },
        { id: 'maneul',         perPerson: 25 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    simple: {
      name: '간소 차림',
      desc: '핵심만 — 송편 + 토란국 또는 갈비찜 + 전 1종 + 과일',
      items: [
        { id: 'songpyeon',      perPerson: 200 },
        { id: 'toran',          perPerson: 60 },
        { id: 'beef_gukgeori',  perPerson: 50 },
        { id: 'mu',             perPerson: 0.1 },
        { id: 'galbi_beef',     perPerson: 200 },
        { id: 'pork_minced',    perPerson: 80 },
        { id: 'buchimgaru',     perPerson: 50 },
        { id: 'oil',            perPerson: 50 },
        { id: 'sagua',          perPerson: 0.5 },
        { id: 'bae',            perPerson: 0.3 },
        { id: 'daechu',         perPerson: 15 },
        { id: 'maneul',         perPerson: 20 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    meal: {
      name: '식사 위주',
      desc: '가족 식사 — 송편 + 갈비찜 + 잡채',
      items: [
        { id: 'songpyeon',      perPerson: 150 },
        { id: 'galbi_beef',     perPerson: 250 },
        { id: 'mu',             perPerson: 0.2 },
        { id: 'glass_dangmyeon', perPerson: 60 },
        { id: 'sigeumchi',      perPerson: 0.15 },
        { id: 'pork_minced',    perPerson: 50 },
        { id: 'surimi',         perPerson: 30 },
        { id: 'egg',            perPerson: 1.5 },
        { id: 'sagua',          perPerson: 0.5 },
        { id: 'bae',            perPerson: 0.3 },
        { id: 'maneul',         perPerson: 25 },
        { id: 'yangnyeom',      perPerson: 1 },
        { id: 'oil',            perPerson: 30 },
      ],
    },
  },
}

/* 🕯️ 제사 */
const JESA: HolidayConfig = {
  id: 'jesa',
  name: '제사',
  emoji: '🕯️',
  description: '기제사·차례. 5열 차림이 정석이며 어동육서·홍동백서·조율이시 원칙',
  formats: {
    formal: {
      name: '5열 차례상 (정석)',
      desc: '메·갱(탕국)·전·나물·과일·견과 — 영혼 1위(位)당 분량 (탕은 탕국 1종으로 간소화)',
      items: [
        // 1열: 메·갱·면·떡
        { id: 'ssal',           perPerson: 130 },     // 메(밥)
        { id: 'beef_gukgeori',  perPerson: 30 },      // 갱(탕국)
        { id: 'siru_tteok',     perPerson: 200 },     // 떡
        // 2열: 어동육서 (전·적)
        { id: 'jogi',           perPerson: 0.5 },     // 어
        { id: 'beef_sanjeok',   perPerson: 60 },      // 육
        { id: 'myungtae_po',    perPerson: 50 },      // 동태전
        { id: 'pork_minced',    perPerson: 60 },      // 동그랑땡
        { id: 'hobak',          perPerson: 0.3 },     // 호박전
        { id: 'buchimgaru',     perPerson: 80 },
        { id: 'oil',            perPerson: 80 },
        { id: 'egg',            perPerson: 1 },
        // 3열: 탕 (육탕·소탕·어탕)
        { id: 'mu',             perPerson: 0.15 },
        // 4열: 포·나물
        { id: 'sigeumchi',      perPerson: 0.25 },
        { id: 'doraji',         perPerson: 60 },
        { id: 'gosari',         perPerson: 50 },
        // 5열: 과일 (조율이시 + α)
        { id: 'daechu',         perPerson: 30 },
        { id: 'bam',            perPerson: 5 },
        { id: 'bae',            perPerson: 0.5 },
        { id: 'gam',            perPerson: 1 },
        { id: 'sagua',          perPerson: 1 },
        { id: 'gotgam',         perPerson: 1 },
        // 기타
        { id: 'jeongjong',      perPerson: 80 },
        { id: 'sikhye',         perPerson: 200 },
        { id: 'jat',            perPerson: 5 },
        { id: 'hangwa',         perPerson: 0.1 },
        { id: 'maneul',         perPerson: 25 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    simple: {
      name: '간소 제사',
      desc: '메·갱·전 1종·나물 1종·과일·청주 (현대 표준)',
      items: [
        { id: 'ssal',           perPerson: 130 },
        { id: 'beef_gukgeori',  perPerson: 50 },
        { id: 'pork_minced',    perPerson: 80 },
        { id: 'buchimgaru',     perPerson: 50 },
        { id: 'oil',            perPerson: 50 },
        { id: 'egg',            perPerson: 1 },
        { id: 'sigeumchi',      perPerson: 0.2 },
        { id: 'sagua',          perPerson: 1 },
        { id: 'bae',            perPerson: 0.5 },
        { id: 'daechu',         perPerson: 20 },
        { id: 'jeongjong',      perPerson: 50 },
        { id: 'maneul',         perPerson: 20 },
        { id: 'yangnyeom',      perPerson: 1 },
      ],
    },
    meal: {
      name: '음복 식사',
      desc: '제사 후 가족 식사 — 비빔밥·갈비찜 등 실용 위주',
      items: [
        { id: 'ssal',           perPerson: 130 },
        { id: 'galbi_beef',     perPerson: 200 },
        { id: 'mu',             perPerson: 0.2 },
        { id: 'sigeumchi',      perPerson: 0.15 },
        { id: 'doraji',         perPerson: 40 },
        { id: 'gosari',         perPerson: 30 },
        { id: 'egg',            perPerson: 1 },
        { id: 'sagua',          perPerson: 0.5 },
        { id: 'maneul',         perPerson: 20 },
        { id: 'yangnyeom',      perPerson: 1 },
        { id: 'oil',            perPerson: 20 },
      ],
    },
  },
}

export const HOLIDAYS: Record<HolidayId, HolidayConfig> = {
  seol: SEOL,
  chuseok: CHUSEOK,
  jesa: JESA,
}

/* ─── 계산 헬퍼 ─── */
export interface CalcRow {
  item: Item
  amount: number          // 총 사용량
  totalPriceWon: number   // 총액
  displayAmount: string
  displayUnit: string
}

export function calcRows(
  holidayId: HolidayId,
  formatId: FormatId,
  people: number,
  priceOverrides: Record<string, number> = {},
  livePrices: Record<string, number> = {},
): CalcRow[] {
  const cfg = HOLIDAYS[holidayId].formats[formatId]
  return cfg.items
    .map(entry => {
      const item = ITEMS[entry.id]
      if (!item) return null
      const amount = entry.perPerson * people
      const price = priceOverrides[item.id] ?? livePrices[item.id] ?? item.pricePerUnit

      // 표시 단위 정리 + 구매 수량(가격 기준) — 낱개 품목은 표시 수량(올림)으로 가격 산정
      let displayAmount: string
      let displayUnit = item.unit
      let purchaseAmount = amount   // g·ml·kg·L: 실사용량 그대로
      if (item.unit === 'g' && amount >= 1000) {
        displayAmount = (amount / 1000).toFixed(1)
        displayUnit = 'kg'
      } else if (item.unit === 'ml' && amount >= 1000) {
        displayAmount = (amount / 1000).toFixed(1)
        displayUnit = 'L'
      } else if (item.unit === 'g' || item.unit === 'ml') {
        displayAmount = Math.round(amount).toLocaleString()
      } else if (item.unit === '개' || item.unit === '마리') {
        purchaseAmount = Math.ceil(amount)          // 낱개 구매 → 올림
        displayAmount = purchaseAmount.toString()
      } else if (item.unit === '포기' || item.unit === '단' || item.unit === '두름' || item.unit === '세트' || item.unit === '인분') {
        purchaseAmount = Math.ceil(amount * 10) / 10
        displayAmount = purchaseAmount + ''
      } else {
        displayAmount = amount.toFixed(1)
      }
      // 가격은 구매 수량 기준 → 표시 수량과 일치
      const totalPriceWon = Math.round(purchaseAmount * price)
      return { item, amount, totalPriceWon, displayAmount, displayUnit }
    })
    .filter(Boolean) as CalcRow[]
}

/* ─── 차례상 5열 배치 규칙 (가이드용) ─── */
export const CHARYE_LAYOUT = [
  { row: 1, label: '제일 앞 (북)', items: '메(밥)·갱(국)·시접·잔반', principle: '신위(영혼) 가까운 자리' },
  { row: 2, label: '둘째 열',       items: '면(국수)·송편·편·꿀',     principle: '주식·후식' },
  { row: 3, label: '셋째 열',       items: '적(구이)·전·조림',         principle: '어동육서·두동미서' },
  { row: 4, label: '넷째 열',       items: '탕 3종 (육탕·소탕·어탕)',  principle: '5열 차림에서 별도 열' },
  { row: 5, label: '맨 뒤 (남)',    items: '포·식혜·나물·과일·견과',    principle: '조율이시·홍동백서' },
]

/* ─── 명절 절약 팁 ─── */
export const SAVING_TIPS = [
  { tip: '명절 1주일 전 장보기', detail: '명절 가까울수록 가격 ↑. 보관 가능한 곡류·견과·통조림은 미리' },
  { tip: '농협 하나로마트 명절 행사', detail: '대형 마트 대비 10~20% 저렴. 특히 제수용품 코너' },
  { tip: '전통시장 + 농산물 직거래', detail: '도매상 통하면 30% 절감. 청과·정육 강추' },
  { tip: '대형 명절은 일부 동결 가능', detail: '갈비·전 재료는 미리 사서 냉동, 명절 당일 해동' },
  { tip: '한과·약과는 인근 떡집', detail: '백화점 세트 대비 절반 가격, 명절 한정 할인' },
  { tip: '간소화 권장', detail: '5열 정석 X. 차례상 표준안은 9~12종 — 무리 X' },
]
