/* ───────────────────────────────────────────────────────────
   김장 데이터: 재료 비율 + 최근(2024~2025) 김장철 평균 가격 (KAMIS 기준)
   ─────────────────────────────────────────────────────────── */

export type IngredientCategory = '주재료' | '양념' | '젓갈·액젓' | '기타'

export interface Ingredient {
  id: string
  name: string
  cat: IngredientCategory
  unit: string             // 사용자 표시 단위 (g, 개, 포기, 단, ml)
  perCabbageAmt: number    // 배추 1포기당 사용량 (unit 단위)
  pricePerUnit: number     // 1 unit당 가격 (원)
  /** KAMIS 품목 코드 (실시간 가격 연동 시 사용) */
  kamisItemCode?: string
  /** KAMIS 품종 코드 */
  kamisKindCode?: string
  /** 가격 출처/메모 */
  source?: string
}

/** 배추김치 1포기(절임 전 ≈3kg, 절임 후 ≈2.5kg) 기준 표준 비율
 *  - 출처: 한식진흥원 표준 김장 레시피 + 한국식품과학회 평균값
 *  - 가격: 2025년 11월 KAMIS 소매가 평균 (서울·인천·부산 기준) */
export const INGREDIENTS: Ingredient[] = [
  // ── 주재료 ──
  { id: 'baechu',    cat: '주재료', name: '배추',           unit: '포기', perCabbageAmt: 1.0, pricePerUnit: 5500,
    kamisItemCode: '211', kamisKindCode: '01', source: '2025.11 KAMIS 소매 (참고용) (포기 ≈3kg)' },
  { id: 'mu',        cat: '주재료', name: '무',             unit: '개',   perCabbageAmt: 0.4, pricePerUnit: 2200,
    kamisItemCode: '231', kamisKindCode: '01', source: '2025.11 KAMIS 소매 (참고용) (개당 ≈1kg)' },
  { id: 'jjokpa',    cat: '주재료', name: '쪽파',           unit: '단',   perCabbageAmt: 0.15, pricePerUnit: 4000,
    kamisItemCode: '245', kamisKindCode: '00', source: '단(1kg) 기준' },
  { id: 'gat',       cat: '주재료', name: '갓',             unit: '단',   perCabbageAmt: 0.10, pricePerUnit: 5000 },

  // ── 양념 ──
  { id: 'gochugaru', cat: '양념',   name: '고춧가루',       unit: 'g',    perCabbageAmt: 100,  pricePerUnit: 55,
    kamisItemCode: '244', kamisKindCode: '00', source: '2025.11 평균 약 33,000원 (참고용)' },
  { id: 'maneul',    cat: '양념',   name: '마늘 (다진)',    unit: 'g',    perCabbageAmt: 60,   pricePerUnit: 25,
    kamisItemCode: '258', kamisKindCode: '00', source: '깐마늘 kg 기준 25,000원' },
  { id: 'saenggang', cat: '양념',   name: '생강 (다진)',    unit: 'g',    perCabbageAmt: 15,   pricePerUnit: 22,
    kamisItemCode: '241', kamisKindCode: '00' },
  { id: 'sugar',     cat: '양념',   name: '설탕',           unit: 'g',    perCabbageAmt: 10,   pricePerUnit: 3 },
  { id: 'chapssal',  cat: '양념',   name: '찹쌀가루 (풀용)', unit: 'g',    perCabbageAmt: 30,   pricePerUnit: 8 },

  // ── 젓갈·액젓 ──
  { id: 'myeoljeot', cat: '젓갈·액젓', name: '멸치액젓',     unit: 'ml',   perCabbageAmt: 60,   pricePerUnit: 7,
    source: '1.8L 12,000원 기준' },
  { id: 'saeu',      cat: '젓갈·액젓', name: '새우젓',       unit: 'g',    perCabbageAmt: 50,   pricePerUnit: 18,
    source: 'kg 18,000원 (육젓)' },
  { id: 'kkanari',   cat: '젓갈·액젓', name: '까나리액젓 (선택)', unit: 'ml', perCabbageAmt: 0,   pricePerUnit: 6 },

  // ── 기타 ──
  { id: 'sogeum',    cat: '기타',   name: '굵은소금 (절임용)', unit: 'g',  perCabbageAmt: 300,  pricePerUnit: 1.5,
    source: '5kg 7,000원' },
  { id: 'water',     cat: '기타',   name: '물 (절임용)',    unit: 'L',    perCabbageAmt: 3,    pricePerUnit: 0 },
]

/* ─── 소비 프로파일 ─── */
export const CONSUMPTION_PROFILES = [
  { id: 'heavy',   label: '잘 먹음 (매끼 김치 必)',  adultDailyG: 120, kidDailyG: 60, desc: '김치찌개·볶음밥 등 활용 多' },
  { id: 'normal',  label: '보통 (1일 1~2회)',        adultDailyG: 80,  kidDailyG: 40, desc: '한국인 평균' },
  { id: 'light',   label: '적게 먹음 (가끔)',        adultDailyG: 40,  kidDailyG: 20, desc: '서양식·다이어트' },
] as const

/* ─── 부가 김치 종류 (배추김치 외) ─── */
export interface KimchiVariant {
  id: string
  name: string
  /** 이 김치 1kg을 만드는 데 필요한 배추김치 등가 비율 (저장공간/소비량 환산) */
  cabbageEquiv: number
  /** 이 김치 추가 시 배추 김치 양을 얼마나 줄일지 (0~1) */
  reduceRatio: number
  /** 이 김치 1kg당 추가 재료 (배추김치 양념과 별도) — 없으면 빈 객체 */
  extraIngredients: Record<string, number>   // ingredient id → amount
  desc: string
}

export const KIMCHI_VARIANTS: KimchiVariant[] = [
  { id: 'kkakdugi', name: '깍두기',     cabbageEquiv: 1.0, reduceRatio: 0.15,
    extraIngredients: { mu: 1.5 },  // 무 1.5개 추가 per kg
    desc: '무 베이스 — 김치찌개·곰탕에 잘 어울림' },
  { id: 'chonggak', name: '총각김치',   cabbageEquiv: 1.0, reduceRatio: 0.10,
    extraIngredients: { mu: 1.2 },
    desc: '알타리무 사용. 식감 살림' },
  { id: 'dongchimi', name: '동치미',    cabbageEquiv: 1.0, reduceRatio: 0.10,
    extraIngredients: { mu: 1.0 },
    desc: '시원한 국물김치. 냉면·만두에 곁들임' },
  { id: 'pakimchi', name: '파김치',     cabbageEquiv: 1.0, reduceRatio: 0.05,
    extraIngredients: { jjokpa: 1.5 },
    desc: '쪽파 베이스. 매콤·짭짤' },
  { id: 'gatkimchi', name: '갓김치',    cabbageEquiv: 1.0, reduceRatio: 0.05,
    extraIngredients: { gat: 1.5 },
    desc: '여수 돌산 갓이 유명. 톡 쏘는 맛' },
]

/* ─── 김장 일정 (D-day) ─── */
export const KIMJANG_SCHEDULE = [
  { day: -2, label: '🛒 장보기',   desc: '배추·무·고춧가루·젓갈 구매. 신선도 위해 1~2일 전 권장' },
  { day: -1, label: '🧂 배추 절이기', desc: '굵은소금·물 풀어서 4~8시간 절임. 중간에 뒤집기' },
  { day: -1, label: '🍶 양념 만들기', desc: '찹쌀풀 끓이기·고춧가루·마늘·생강·젓갈 섞어 1~3시간 숙성' },
  { day: 0,  label: '👐 버무리기',   desc: '절인 배추 헹구고 물기 빼기 → 양념 골고루' },
  { day: 0,  label: '🍱 통에 담기',   desc: '눌러서 공기 빼고 비닐로 덮어 위 누름' },
  { day: 1,  label: '🌡️ 실온 발효',  desc: '겨울 1~2일, 가을 12~24시간 (기온별 조절)' },
  { day: 3,  label: '❄️ 김치냉장고', desc: '익기 시작 시점에 옮김. 0~3℃ 보관' },
  { day: 14, label: '✨ 알맞게 익음', desc: '맛이 잘 들어 본격 섭취 적기' },
] as const

/* ─── 헬퍼: 배추 포기 → 양념 양 ─── */
export interface CalculatedIngredient {
  ing: Ingredient
  amount: number
  totalPriceWon: number
  displayUnit: string
  displayAmount: string
}

export function calcIngredients(cabbages: number, variants: string[]): CalculatedIngredient[] {
  // 배추 포기당 양념 비율을 그대로 곱
  const items = INGREDIENTS.map(ing => {
    let amount = ing.perCabbageAmt * cabbages
    // 부가 김치 추가분
    for (const vid of variants) {
      const v = KIMCHI_VARIANTS.find(x => x.id === vid)
      if (!v) continue
      const extra = v.extraIngredients[ing.id]
      if (extra) {
        // extra는 부가 김치 1kg당 — 부가 김치 양 ≈ 배추 reduceRatio * cabbages * 2.5kg
        const variantKg = v.reduceRatio * cabbages * 2.5
        amount += extra * variantKg
      }
    }
    return { ing, amount }
  }).filter(x => x.amount > 0)

  return items.map(({ ing, amount }) => {
    // 표시 단위 다듬기
    let displayAmount: string
    let displayUnit = ing.unit
    if (ing.unit === 'g' && amount >= 1000) {
      displayAmount = (amount / 1000).toFixed(1)
      displayUnit = 'kg'
    } else if (ing.unit === 'ml' && amount >= 1000) {
      displayAmount = (amount / 1000).toFixed(1)
      displayUnit = 'L'
    } else if (ing.unit === 'g') {
      displayAmount = Math.round(amount).toLocaleString()
    } else if (ing.unit === '포기' || ing.unit === '개' || ing.unit === '단') {
      displayAmount = Math.ceil(amount).toString()
    } else {
      displayAmount = amount.toFixed(1)
    }
    const totalPriceWon = Math.round(amount * ing.pricePerUnit)
    return { ing, amount, totalPriceWon, displayUnit, displayAmount }
  })
}

/* ─── 인원·기간 → 필요 배추 포기 수 ─── */
export function calcCabbages(opt: {
  adults: number
  kids: number
  profileId: string
  months: number
}): number {
  const profile = CONSUMPTION_PROFILES.find(p => p.id === opt.profileId) ?? CONSUMPTION_PROFILES[1]
  const dailyG = opt.adults * profile.adultDailyG + opt.kids * profile.kidDailyG
  const totalG = dailyG * opt.months * 30
  // 1포기 ≈ 2,500g 김치
  return Math.max(1, Math.ceil(totalG / 2500))
}
