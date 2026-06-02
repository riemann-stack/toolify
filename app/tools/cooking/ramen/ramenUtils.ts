/* ──────────────────────────────────────────────────────
   cooking/ramen/ramenUtils.ts
   라면 물양 — 한국 인기 18종 라면별·국물 농도·토핑·시간
   ※ 권장 물양·시간은 제조사 봉지 표기를 기준으로 한 일반 가이드입니다.
     정확한 값은 브랜드·생산 시기(리뉴얼)·냄비·화력·고도·습도·취향에 따라 달라집니다.
   ※ 영양정보(kcal·나트륨·단백질·지방·탄수)는 제조사 표기(봉지/용기 1개) 기준이며
     제품 리뉴얼 시 변동될 수 있습니다. 정확한 값은 제품 포장 또는
     식품안전나라(식약처)에서 확인하세요.
   ────────────────────────────────────────────────────── */

/* ─── 라면 데이터 (한국 인기 18종) ─── */
export interface RamenType {
  id: string
  name: string
  brand: string
  baseWater: number       // 1개 기준 ml (제조사 봉지 표기)
  type: 'broth' | 'jjajang' | 'stir' | 'cold' | 'cup'
  category: string        // 매운국물·구수한국물·짜장 등
  cookTime: number        // 초 (분 × 60, 제조사 표기)
  waterDrainMl?: number   // 짜장·볶음·비빔 시 따라낸 후 남기는 물 (ml)
  emoji: string
  desc?: string
  // 영양 (봉지/용기 1개, 제조사 표기 기준)
  servingG: number        // 중량 g
  kcal: number
  sodium: number          // mg
  protein: number         // g
  fat: number             // g
  carb: number            // g
}

export const RAMEN_TYPES: RamenType[] = [
  // 매운 국물
  { id: 'shin',          name: '신라면',          brand: '농심',   baseWater: 550,
    type: 'broth',  category: '매운국물', cookTime: 4*60+30, emoji: '🌶️',
    desc: '한국 대표 매운 국물라면',
    servingG: 120, kcal: 500, sodium: 1790, protein: 10, fat: 16, carb: 79 },
  { id: 'jin',           name: '진라면 (매운맛)', brand: '오뚜기', baseWater: 550,
    type: 'broth',  category: '매운국물', cookTime: 4*60+30, emoji: '🌶️',
    servingG: 120, kcal: 500, sodium: 1860, protein: 10, fat: 14, carb: 80 },
  { id: 'yeol',          name: '열라면',          brand: '농심',   baseWater: 550,
    type: 'broth',  category: '매운국물', cookTime: 4*60+30, emoji: '🥵',
    desc: '신라면보다 매운 매운맛 강조 라면',
    servingG: 120, kcal: 510, sodium: 1790, protein: 10, fat: 16, carb: 80 },
  { id: 'jjamppong',     name: '오징어짬뽕',      brand: '농심',   baseWater: 550,
    type: 'broth',  category: '해물매운', cookTime: 5*60,    emoji: '🦑',
    servingG: 124, kcal: 500, sodium: 1860, protein: 11, fat: 16, carb: 78 },
  { id: 'jinjjambbong',  name: '진짬뽕',          brand: '오뚜기', baseWater: 600,
    type: 'broth',  category: '해물매운', cookTime: 4*60+30, emoji: '🦐',
    desc: '굵은 면·불맛 해물짬뽕',
    servingG: 130, kcal: 555, sodium: 1730, protein: 12, fat: 19, carb: 84 },
  { id: 'shin-black',    name: '신라면 블랙',     brand: '농심',   baseWater: 550,
    type: 'broth',  category: '진한국물', cookTime: 4*60+30, emoji: '⚫',
    servingG: 134, kcal: 540, sodium: 1750, protein: 13, fat: 16, carb: 80 },
  { id: 'neoguri',       name: '너구리',          brand: '농심',   baseWater: 550,
    type: 'broth',  category: '해물국물', cookTime: 5*60,    emoji: '🦑',
    servingG: 120, kcal: 505, sodium: 1690, protein: 9, fat: 16, carb: 80 },

  // 구수한 국물
  { id: 'ansung',        name: '안성탕면',        brand: '농심',   baseWater: 550,
    type: 'broth',  category: '구수한국물', cookTime: 4*60+30, emoji: '🍲',
    servingG: 125, kcal: 525, sodium: 1850, protein: 11, fat: 16, carb: 82 },
  { id: 'mupama',        name: '무파마탕면',      brand: '농심',   baseWater: 550,
    type: 'broth',  category: '얼큰국물', cookTime: 4*60+30, emoji: '🧅',
    desc: '무·파·마늘 베이스 얼큰한 국물',
    servingG: 122, kcal: 505, sodium: 1720, protein: 10, fat: 15, carb: 83 },
  { id: 'samyang',       name: '삼양라면',        brand: '삼양',   baseWater: 550,
    type: 'broth',  category: '구수한국물', cookTime: 4*60+30, emoji: '🍜',
    servingG: 120, kcal: 505, sodium: 1640, protein: 10, fat: 15, carb: 80 },
  { id: 'sari',          name: '사리곰탕',        brand: '농심',   baseWater: 550,
    type: 'broth',  category: '맑은국물', cookTime: 4*60+30, emoji: '🥣',
    servingG: 110, kcal: 500, sodium: 1430, protein: 9, fat: 16, carb: 78 },

  // 짜장·볶음 (물 빼기)
  { id: 'jjapaghetti',   name: '짜파게티',        brand: '농심',   baseWater: 600,
    type: 'jjajang', category: '짜장', cookTime: 5*60, waterDrainMl: 120, emoji: '⚫',
    desc: '끓인 후 물 8큰술(약 120ml) 남기고 따라낸 뒤 분말스프 + 올리브유',
    servingG: 140, kcal: 600, sodium: 1110, protein: 9, fat: 20, carb: 90 },
  { id: 'chapagetti-black', name: '짜파게티 블랙', brand: '농심', baseWater: 600,
    type: 'jjajang', category: '짜장', cookTime: 5*60, waterDrainMl: 120, emoji: '⚫',
    servingG: 143, kcal: 620, sodium: 1200, protein: 11, fat: 22, carb: 90 },

  // 볶음
  { id: 'buldak',        name: '불닭볶음면',      brand: '삼양',   baseWater: 600,
    type: 'stir',   category: '볶음매운', cookTime: 5*60, waterDrainMl: 120, emoji: '🔥',
    desc: '물 8큰술(120ml) 남기고 따라낸 뒤 액상소스 + 후레이크 + 김',
    servingG: 140, kcal: 530, sodium: 1280, protein: 12, fat: 16, carb: 85 },

  // 비빔 (찬물 헹굼)
  { id: 'bibim',         name: '팔도 비빔면',     brand: '팔도',   baseWater: 600,
    type: 'cold',   category: '비빔', cookTime: 3*60, waterDrainMl: 0, emoji: '❄️',
    desc: '면만 익힌 뒤 찬물에 헹궈 비빔장',
    servingG: 130, kcal: 530, sodium: 1430, protein: 9, fat: 13, carb: 92 },

  // 컵라면
  { id: 'cup-large',     name: '큰컵 (왕뚜껑·신컵)', brand: '범용', baseWater: 460,
    type: 'cup',    category: '컵라면', cookTime: 4*60, emoji: '🥤',
    desc: '뚜껑 안쪽 선까지 끓는 물',
    servingG: 110, kcal: 475, sodium: 1500, protein: 9, fat: 15, carb: 75 },
  { id: 'cup-small',     name: '작은컵 (육개장·새우탕)', brand: '범용', baseWater: 320,
    type: 'cup',    category: '컵라면', cookTime: 3*60, emoji: '🍢',
    servingG: 65, kcal: 300, sodium: 1000, protein: 5, fat: 12, carb: 45 },
  { id: 'cup-noodle',    name: '컵누들 (저칼로리)', brand: '농심', baseWater: 350,
    type: 'cup',    category: '컵라면', cookTime: 3*60, emoji: '🥢',
    servingG: 38, kcal: 165, sodium: 900, protein: 4, fat: 1, carb: 36 },
]

/* ─── 다개수 보정 (단순 ×N X) ─── */
export interface MultiAdjust {
  count: number
  multiplier: number
  desc: string
}

export const MULTI_RAMEN_ADJUSTMENT: MultiAdjust[] = [
  { count: 1, multiplier: 1.00, desc: '1개 기준' },
  { count: 2, multiplier: 1.70, desc: '2개: 단순 ×2 X (1.7배 권장)' },
  { count: 3, multiplier: 2.45, desc: '3개: 단순 ×3 X (2.45배 권장)' },
  { count: 4, multiplier: 3.20, desc: '4개: 단순 ×4 X (3.2배 권장)' },
  { count: 5, multiplier: 3.90, desc: '5개: 큰 냄비·전기레인지 권장' },
]

export function getMultiAdjust(count: number): MultiAdjust {
  return MULTI_RAMEN_ADJUSTMENT.find(m => m.count === count)
    ?? { count, multiplier: count * 0.78 + 0.22, desc: `${count}개` }
}

/* ─── 국물 농도 ─── */
export interface BrothStrength {
  id: string
  name: string
  delta: number     // 1개당 ±ml
  desc: string
  color: string
}

export const BROTH_STRENGTH: BrothStrength[] = [
  { id: 'very-strong', name: '매우 진하게', delta: -100, desc: '소금기 매우 강함', color: '#DC2626' },
  { id: 'strong',      name: '짜게',        delta:  -50, desc: '국물 진함',         color: '#EA580C' },
  { id: 'normal',      name: '기본',        delta:    0, desc: '봉지 권장량',       color: 'var(--accent)' },
  { id: 'mild',        name: '싱겁게',      delta:  +50, desc: '나트륨 ↓',          color: '#0891B2' },
  { id: 'extra-broth', name: '국물 넉넉',   delta: +100, desc: '밥 말아 먹기 좋음', color: '#9333EA' },
]

/* ─── 면 익힘 ─── */
export interface NoodleTexture {
  id: string
  name: string
  timeDelta: number  // 초
  desc: string
}

export const NOODLE_TEXTURE: NoodleTexture[] = [
  { id: 'very-firm', name: '매우 꼬들', timeDelta: -90, desc: '치아로 약간 저항' },
  { id: 'firm',      name: '꼬들',      timeDelta: -30, desc: '한국인 다수 선호' },
  { id: 'normal',    name: '기본',      timeDelta:   0, desc: '봉지 권장' },
  { id: 'soft',      name: '부드럽게',  timeDelta: +30, desc: '아이·노인 추천' },
  { id: 'very-soft', name: '매우 푹',   timeDelta: +90, desc: '죽처럼' },
]

/* ─── 토핑 ───
   waterDelta(ml) 기준: 끓이는 동안 재료가 흡수·증발시키는 물을 보충/차감.
     · 전분류(떡·면사리·만두)는 끓이며 물을 흡수 → 보충(+)
     · 두부·순두부는 자체 수분을 방출 → 차감(−)
     · 계란·치즈·김치·대파 등은 물 흡수가 거의 없음 → 0
   timeOffsetSec 기준: '면 투입 시점(0초)'을 기준으로 한 상대 투입 시각.
     · 음수(−) = 면보다 먼저 넣어 더 끓임(냉동 만두·떡·콩나물 등 익는 데 오래)
     · 0 = 면과 동시
   beforeEndSec 기준: '완성(불 끔) N초 전'에 넣는 토핑은 조리 시간에 맞춰 위치를 환산합니다.
     · 계란('마지막 1분 전')=60, 치즈·노른자·대파·김치('불 끈 직후/그릇')=0
     · beforeEndSec가 있으면 timeOffsetSec 대신 (조리시간 − beforeEndSec)로 타임라인에 배치.
   영양(kcal·protein·sodium·fat·carb)은 식품 일반 평균(USDA·식약처 참고)이며 제품·분량에 따라 차이가 큼. */
export interface Topping {
  id: string
  name: string
  emoji: string
  waterDelta: number  // ml
  kcal: number
  protein?: number    // g
  sodium?: number     // mg
  fat?: number        // g
  carb?: number       // g
  timeAt: string      // 투입 타이밍
  timeOffsetSec: number  // 0 = 면과 동시, -60 = 1분 전 (면 투입 기준)
  /** '완성(불 끔) N초 전' 투입 토핑 — 조리 시간에 따라 위치 환산 (계란·치즈·대파 등) */
  beforeEndSec?: number
  note?: string
}

export const TOPPINGS: Topping[] = [
  { id: 'egg',         name: '계란',          emoji: '🥚', waterDelta:   0, kcal:  70, protein: 6,  sodium:  65, fat: 5,   carb: 0,  timeAt: '마지막 1분 전',     timeOffsetSec: 0, beforeEndSec: 60 },
  { id: 'egg-yolk',    name: '계란 노른자만', emoji: '🍳', waterDelta:   0, kcal:  55, protein: 3,  sodium:   8, fat: 4.5, carb: 0,  timeAt: '불 끈 직후 휘저음', timeOffsetSec: 0, beforeEndSec: 0 },
  { id: 'cheese',      name: '치즈 1장',      emoji: '🧀', waterDelta:   0, kcal:  70, protein: 5,  sodium: 215, fat: 5.5, carb: 1,  timeAt: '불 끈 직후',        timeOffsetSec: 0, beforeEndSec: 0,
    note: '짠맛 강해짐 — 국물 농도 싱겁게 권장' },
  { id: 'rice-cake',   name: '떡 100g',       emoji: '🍡', waterDelta:  80, kcal: 240, protein: 4,  sodium:   5, fat: 0.5, carb: 50, timeAt: '면 1분 전 추가',    timeOffsetSec: -60 },
  { id: 'dumpling',    name: '만두 2개',      emoji: '🥟', waterDelta:  80, kcal: 200, protein: 8,  sodium: 300, fat: 8,   carb: 22, timeAt: '면 2분 전 추가',    timeOffsetSec: -120 },
  { id: 'beansprouts', name: '콩나물 한 줌',  emoji: '🌱', waterDelta:  50, kcal:  15, protein: 2,  sodium:   5, fat: 0,   carb: 3,  timeAt: '면 1분 전',         timeOffsetSec: -60 },
  { id: 'green-onion', name: '대파',          emoji: '🌿', waterDelta:   0, kcal:   5, protein: 0,  sodium:   2, fat: 0,   carb: 1,  timeAt: '마지막 또는 그릇',  timeOffsetSec: 0, beforeEndSec: 0 },
  { id: 'onion',       name: '양파 1/4',      emoji: '🧅', waterDelta:  30, kcal:  15, protein: 0,  sodium:   2, fat: 0,   carb: 4,  timeAt: '면 2분 전',         timeOffsetSec: -120 },
  { id: 'tofu',        name: '순두부 1/2팩',  emoji: '⬜', waterDelta: -50, kcal:  60, protein: 6,  sodium:  10, fat: 3.5, carb: 2,  timeAt: '면 1분 전',         timeOffsetSec: -60,
    note: '두부 자체 수분 → 물 약간 줄임' },
  { id: 'mushroom',    name: '버섯',          emoji: '🍄', waterDelta:  30, kcal:  20, protein: 2,  sodium:   3, fat: 0,   carb: 3,  timeAt: '면과 동시',         timeOffsetSec: 0 },
  { id: 'ham',         name: '햄·소시지',     emoji: '🌭', waterDelta:  30, kcal: 150, protein: 8,  sodium: 450, fat: 12,  carb: 2,  timeAt: '면과 동시',         timeOffsetSec: 0 },
  { id: 'spam',        name: '스팸 100g',     emoji: '🥫', waterDelta:  30, kcal: 290, protein: 15, sodium: 1000,fat: 26,  carb: 2,  timeAt: '면과 동시',         timeOffsetSec: 0 },
  { id: 'fishcake',    name: '어묵',          emoji: '🐟', waterDelta:  30, kcal:  80, protein: 7,  sodium: 400, fat: 4,   carb: 8,  timeAt: '면 1분 전',         timeOffsetSec: -60 },
  { id: 'noodle-extra',name: '추가 면사리',   emoji: '🍜', waterDelta: 200, kcal: 350, protein: 8,  sodium:  30, fat: 15,  carb: 60, timeAt: '본 면과 동시',      timeOffsetSec: 0,
    note: '거의 1봉 추가 = 물 +200~300ml' },
  { id: 'kimchi',      name: '김치',          emoji: '🌶️', waterDelta:   0, kcal:  20, protein: 0,  sodium: 600, fat: 0,   carb: 4,  timeAt: '그릇 위',           timeOffsetSec: 0, beforeEndSec: 0,
    note: '국물 짜짐 — 싱겁게 권장' },
  { id: 'tuna',        name: '참치캔',        emoji: '🐠', waterDelta:   0, kcal: 200, protein: 18, sodium: 300, fat: 8,   carb: 0,  timeAt: '면과 동시',         timeOffsetSec: 0,
    note: '기름 함께 — 국물 진해짐' },
]

/* ─── 냄비 권장 ─── */
export interface PotSize {
  count: number
  diameter: number   // cm
  liters: number
  desc: string
}

export const POT_SIZE_RECOMMENDATIONS: PotSize[] = [
  { count: 1, diameter: 18, liters: 1.5, desc: '18cm 라면냄비 (한국 표준)' },
  { count: 2, diameter: 20, liters: 2.0, desc: '20cm 양수냄비' },
  { count: 3, diameter: 22, liters: 2.5, desc: '22cm + 깊은 형태' },
  { count: 4, diameter: 24, liters: 3.0, desc: '24cm 대형 또는 냄비 2개 분리' },
  { count: 5, diameter: 26, liters: 3.5, desc: '26cm 대형 + 전기레인지 권장' },
]

export function getPotRec(count: number): PotSize {
  return POT_SIZE_RECOMMENDATIONS.find(p => p.count === count)
    ?? { count, diameter: 26 + (count - 5) * 2, liters: 3.5 + (count - 5) * 0.5, desc: '대형 냄비 또는 분리 권장' }
}

/* ─── 영양 (라면 1봉 평균) ─── */
/** 라면 1봉 평균(참고용 폴백) — 실제 계산은 제품별 영양값(RamenType)을 사용합니다. */
export const RAMEN_NUTRITION_DEFAULT = {
  kcal: 505,
  sodium: 1700,   // mg
  protein: 10,
  fat: 16,
  carb: 81,
}

export const WHO_DAILY_SODIUM = 2000   // mg
export const RECOMMENDED_DAILY_KCAL = 2000

/* ─── 메인 계산 ─── */
export interface RamenInput {
  ramenId: string
  count: number
  brothStrengthId: string
  textureId: string
  toppings: string[]
}

export interface RamenResult {
  recommendedWater: number
  rangeMin: number
  rangeMax: number
  cookTimeSeconds: number
  potDiameter: number
  potLiters: number
  potDesc: string
  ramenInfo: RamenType
  multiplier: number
  totalKcal: number
  totalSodium: number
  totalProtein: number
  totalFat: number
  totalCarb: number
  /** 선택한 라면 N개 합계(토핑 제외) — '라면만' 영양 표시용 */
  baseKcal: number
  baseSodium: number
  baseProtein: number
  baseFat: number
  baseCarb: number
  toppingTimeline: { topping: string; emoji: string; addAt: string; offsetSec: number; note?: string }[]
  warnings: string[]
  isStirOrCold: boolean
  drainAdvice?: string  // 짜장·볶음·비빔 안내
}

export function calcRamen(input: RamenInput): RamenResult | null {
  const ramen = RAMEN_TYPES.find(r => r.id === input.ramenId)
  if (!ramen) return null

  // 1. 기본 물양 + 다개수 보정 (타입별)
  //   · 국물 라면: 농축 보정(2개 = 1.7배 등) — 단순 ×N이면 국물이 싱거워짐
  //   · 물 빼기(짜장·볶음·비빔): 면을 삶을 물이라 거의 선형, 공유 증발만 약간 할인
  //   · 컵라면: 물선까지 → 컵 개수만큼 선형
  const adjust = getMultiAdjust(input.count)
  const waterMultiplier =
    ramen.type === 'broth' ? adjust.multiplier :
    ramen.type === 'cup'   ? input.count :
    1 + (input.count - 1) * 0.92
  const waterAfterCount = ramen.baseWater * waterMultiplier

  // 2. 국물 농도 보정 — 국물 라면만. 짜장·볶음·비빔은 따라내고, 컵라면은 물선까지 붓는 방식이라 무의미
  const broth = BROTH_STRENGTH.find(b => b.id === input.brothStrengthId) ?? BROTH_STRENGTH[2]
  const brothApplies = ramen.type === 'broth'
  const waterAfterBroth = waterAfterCount + (brothApplies ? broth.delta * input.count : 0)

  // 3. 토핑 보정
  const toppingDetails = input.toppings
    .map(id => TOPPINGS.find(t => t.id === id))
    .filter((t): t is Topping => t !== undefined)
  const toppingWaterDelta = toppingDetails.reduce((s, t) => s + t.waterDelta, 0)

  const finalWater = Math.max(100, waterAfterBroth + toppingWaterDelta)
  const recommendedWater = Math.round(finalWater / 10) * 10
  const rangeMin = Math.round((finalWater * 0.95) / 10) * 10
  const rangeMax = Math.round((finalWater * 1.05) / 10) * 10

  // 4. 조리 시간
  const texture = NOODLE_TEXTURE.find(t => t.id === input.textureId) ?? NOODLE_TEXTURE[2]
  const cookTimeSeconds = Math.max(60, ramen.cookTime + texture.timeDelta)

  // 5. 냄비
  const pot = getPotRec(input.count)

  // 6. 영양 — 제품별 표기값(RamenType) × 개수 + 토핑
  const baseKcal = ramen.kcal * input.count
  const baseSodium = ramen.sodium * input.count
  const baseProtein = ramen.protein * input.count
  const baseFat = ramen.fat * input.count
  const baseCarb = ramen.carb * input.count
  const totalKcal = baseKcal + toppingDetails.reduce((s, t) => s + t.kcal, 0)
  const totalSodium = baseSodium + toppingDetails.reduce((s, t) => s + (t.sodium ?? 0), 0)
  const totalProtein = baseProtein + toppingDetails.reduce((s, t) => s + (t.protein ?? 0), 0)
  const totalFat = baseFat + toppingDetails.reduce((s, t) => s + (t.fat ?? 0), 0)
  const totalCarb = baseCarb + toppingDetails.reduce((s, t) => s + (t.carb ?? 0), 0)

  // 7. 토핑 타임라인 — beforeEndSec(완성 N초 전) 토핑은 조리 시간에 맞춰 위치 환산
  const resolveOffset = (t: Topping) =>
    t.beforeEndSec !== undefined ? Math.max(0, cookTimeSeconds - t.beforeEndSec) : t.timeOffsetSec
  const toppingTimeline = toppingDetails
    .map(t => ({ topping: t.name, emoji: t.emoji, addAt: t.timeAt, offsetSec: resolveOffset(t), note: t.note }))
    .sort((a, b) => a.offsetSec - b.offsetSec)

  // 8. 경고
  const warnings: string[] = []
  if (input.count >= 4 && (ramen.type === 'broth' || ramen.type === 'jjajang')) {
    warnings.push(`${input.count}개는 22cm+ 큰 냄비 필요. 물 넘침 주의.`)
  }
  if (totalSodium > 4500) {
    warnings.push(`나트륨 ${(totalSodium / 1000).toFixed(1)}g — WHO 일일 권장(${WHO_DAILY_SODIUM/1000}g)의 ${Math.round(totalSodium / WHO_DAILY_SODIUM * 100)}%.`)
  }
  if (totalKcal > 1500) {
    warnings.push(`칼로리 ${totalKcal.toLocaleString()}kcal — 한 끼 권장량(700kcal)의 ${Math.round(totalKcal / 700 * 100)}%.`)
  }
  if (toppingDetails.some(t => t.id === 'cheese' || t.id === 'kimchi') && broth.id === 'strong') {
    warnings.push('치즈/김치 추가 + 짜게 농도 — 나트륨 매우 많음. 「싱겁게」 또는 「기본」 권장.')
  }

  // 9. 짜장·볶음·비빔 안내
  let drainAdvice: string | undefined
  const keepMl = (ramen.waterDrainMl ?? 120) * input.count   // 개수만큼 남기는 물도 늘어남
  const keepSpoons = Math.round(keepMl / 15)
  if (ramen.type === 'jjajang') {
    drainAdvice = `끓인 후 물 약 ${keepMl}ml(${keepSpoons}큰술)만 남기고 따라낸 뒤 분말스프 + 올리브유 비비기.`
  } else if (ramen.type === 'stir') {
    drainAdvice = `끓인 후 물 약 ${keepMl}ml(${keepSpoons}큰술)만 남기고 따라낸 뒤 액상소스 + 후레이크 + 김 비비기.`
  } else if (ramen.type === 'cold') {
    drainAdvice = '면만 익힌 뒤 물 전부 따라내고 찬물에 헹궈서 비빔장과 비비기.'
  }

  return {
    recommendedWater, rangeMin, rangeMax,
    cookTimeSeconds,
    potDiameter: pot.diameter, potLiters: pot.liters, potDesc: pot.desc,
    ramenInfo: ramen,
    multiplier: waterMultiplier,
    totalKcal, totalSodium, totalProtein, totalFat, totalCarb,
    baseKcal, baseSodium, baseProtein, baseFat, baseCarb,
    toppingTimeline,
    warnings,
    isStirOrCold: ramen.type !== 'broth' && ramen.type !== 'cup',
    drainAdvice,
  }
}

/* ─── 포맷 ─── */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0) return `${m}분`
  return `${m}분 ${s}초`
}

export function formatWater(ml: number): string {
  return `${ml.toLocaleString('ko-KR')} ml`
}
