// ─────────────────────────────────────────────────────────────
// 재료 데이터 + 마트 패키지 + 식이 제한 + 가족 구성·localStorage
// ─────────────────────────────────────────────────────────────

export type Category = 'noodle' | 'meat' | 'grain' | 'vegetable' | 'soup'

export const CAT_LABEL: Record<Category, string> = {
  noodle: '🍝 면류',
  meat: '🥩 고기류',
  grain: '🍚 밥·곡류',
  vegetable: '🥦 채소·부재료',
  soup: '🍲 국·찌개·전골',
}

export type DietaryFlag = 'vegetarian' | 'vegan' | 'glutenFree'

export interface ServingData {
  key: string
  name: string
  emoji: string
  category: Category
  unit: string
  basePerPerson: { main: number; side: number; snack: number; light: number }
  withCarbReduction: number
  withoutCarbIncrease: number
  rawToCooked: number
  prepNote: string
  cookingNote: string
  variantAdjust: Record<string, number>
  /** 한국 마트 표준 패키지 안내 */
  marketPackage?: string
  /** 식이 제한 — 어떤 그룹에 안 맞는지 */
  notFor?: DietaryFlag[]
}

export const SERVING_DATA: ServingData[] = [
  // ── 면류 ─────────────────────────────────
  { key: 'pasta', name: '파스타', emoji: '🍝', category: 'noodle', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 70, light: 75 },
    withCarbReduction: 0, withoutCarbIncrease: 20, rawToCooked: 2.2,
    prepNote: '건면 기준', cookingNote: '삶으면 약 2.2배 증가. 알덴테로 삶으면 소스 흡수로 추가 증가.',
    variantAdjust: { '볶음': 10, '국물': 0, '비빔': 5 },
    marketPackage: '1팩 500g (5인분)', notFor: ['glutenFree'] },
  { key: 'somyeon', name: '소면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 90, side: 50, snack: 60, light: 70 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.5,
    prepNote: '건면 기준', cookingNote: '삶으면 약 2.5배. 단독 메인은 상한(100g) 권장.',
    variantAdjust: { '국물': 0, '비빔': 10 },
    marketPackage: '1봉 500g (5~6인분)', notFor: ['glutenFree'] },
  { key: 'jungmyeon', name: '중면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 100, side: 55, snack: 65, light: 75 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.4,
    prepNote: '건면 기준', cookingNote: '잔치국수·비빔국수용. 삶으면 약 2.4배.',
    variantAdjust: { '국물': 0, '비빔': 10 },
    marketPackage: '1봉 500g (5인분)', notFor: ['glutenFree'] },
  { key: 'udon', name: '우동면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 200, side: 120, snack: 150, light: 160 },
    withCarbReduction: 0, withoutCarbIncrease: 30, rawToCooked: 1.0,
    prepNote: '생면/냉동 기준 (건면이면 100g)', cookingNote: '생우동/냉동 기준. 건면이면 약 100g으로 계산.',
    variantAdjust: { '국물': 0, '볶음': 20 },
    marketPackage: '냉동 4입 800g', notFor: ['glutenFree'] },
  { key: 'ramenSari', name: '라면사리', emoji: '🍜', category: 'noodle', unit: 'g (봉)',
    basePerPerson: { main: 110, side: 0, snack: 110, light: 80 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.3,
    prepNote: '건면 기준 (1봉 100~110g)', cookingNote: '전골·부대찌개용. 국물 양에 따라 1봉으로 2인 가능.',
    variantAdjust: { '국물': -10, '볶음': 10 },
    marketPackage: '5봉 1팩', notFor: ['glutenFree'] },
  { key: 'kalguksu', name: '칼국수면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 110, light: 110 },
    withCarbReduction: 0, withoutCarbIncrease: 20, rawToCooked: 1.6,
    prepNote: '생면 기준 (건면이면 100g)', cookingNote: '생면은 그대로. 건면이면 약 100g으로 계산.',
    variantAdjust: { '국물': 0, '비빔': 10 },
    marketPackage: '생면 1팩 500~600g (3~4인분)', notFor: ['glutenFree'] },
  { key: 'riceNoodle', name: '쌀국수면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 80, side: 50, snack: 60, light: 65 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.3,
    prepNote: '건면 기준 (불리기 전)', cookingNote: '뜨거운 물에 5~7분 불리면 약 2.3배. 포 보운 1인분 60~80g.',
    variantAdjust: { '국물': 0, '볶음': 10 },
    marketPackage: '1팩 200~400g' },

  // ── 고기류 ────────────────────────────────
  { key: 'beefGrill', name: '소고기 구이', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 200, side: 100, snack: 150, light: 130 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생고기 기준', cookingNote: '구이는 식으면 더 먹고 싶어지므로 상한 쪽 준비 권장.',
    variantAdjust: { '구이': 0 },
    marketPackage: '1팩 200·400·600g', notFor: ['vegetarian', 'vegan'] },
  { key: 'bulgogi', name: '소불고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 180, side: 80, snack: 120, light: 120 },
    withCarbReduction: 40, withoutCarbIncrease: 0, rawToCooked: 0.8,
    prepNote: '생고기 기준', cookingNote: '채소와 함께 볶으면 1인당 20~30g 줄여도 충분.',
    variantAdjust: { '볶음': 0, '전골': -20 },
    marketPackage: '양념팩 500g·700g', notFor: ['vegetarian', 'vegan'] },
  { key: 'shabuBeef', name: '샤브샤브 소고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 120, light: 100 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.85,
    prepNote: '생고기 기준 (얇게 썬 것)', cookingNote: '채소·두부와 함께. 단독 구이보다 적게 준비.',
    variantAdjust: { '전골': -10 },
    marketPackage: '1팩 300·500g', notFor: ['vegetarian', 'vegan'] },
  { key: 'porkGrill', name: '돼지고기 구이', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 220, side: 120, snack: 180, light: 150 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생고기 기준', cookingNote: '삼겹살 기준. 쌈채소와 함께면 1인당 200g, 고기만이면 250g+.',
    variantAdjust: { '구이': 0 },
    marketPackage: '1팩 400·600·1000g', notFor: ['vegetarian', 'vegan'] },
  { key: 'jeyukMeat', name: '제육용 돼지고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 160, side: 80, snack: 120, light: 120 },
    withCarbReduction: 30, withoutCarbIncrease: 0, rawToCooked: 0.78,
    prepNote: '생고기 기준 (앞다리살)', cookingNote: '볶음 요리라 양념 줄어들어 단독보다 양 적게 느껴짐.',
    variantAdjust: { '볶음': 10 },
    marketPackage: '앞다리살 500g·1kg', notFor: ['vegetarian', 'vegan'] },
  { key: 'chickenBreast', name: '닭가슴살', emoji: '🍗', category: 'meat', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 100, light: 120 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생닭가슴살 기준', cookingNote: '단백질 식단용은 메인에서 200g까지 가능.',
    variantAdjust: { '볶음': 10, '찜': -10 },
    marketPackage: '냉장 500g·냉동 1kg', notFor: ['vegetarian', 'vegan'] },
  { key: 'chickenThigh', name: '닭다리살', emoji: '🍗', category: 'meat', unit: 'g',
    basePerPerson: { main: 180, side: 90, snack: 130, light: 140 },
    withCarbReduction: 40, withoutCarbIncrease: 0, rawToCooked: 0.78,
    prepNote: '생고기 기준 (정육)', cookingNote: '뼈째이면 약 1.3배로 구입. 기름 많아 포만감 ↑.',
    variantAdjust: { '볶음': 10, '찜': -10 },
    marketPackage: '정육 500g·1kg', notFor: ['vegetarian', 'vegan'] },

  // ── 밥·곡류 ───────────────────────────────
  { key: 'rice', name: '쌀 (흰쌀)', emoji: '🍚', category: 'grain', unit: 'g',
    basePerPerson: { main: 90, side: 50, snack: 0, light: 65 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.4,
    prepNote: '생쌀 기준', cookingNote: '1인분 생쌀 90g → 밥 약 210g. 공기밥 1그릇.',
    variantAdjust: {},
    marketPackage: '4kg·10kg·20kg' },
  { key: 'brownRice', name: '현미', emoji: '🌾', category: 'grain', unit: 'g',
    basePerPerson: { main: 95, side: 55, snack: 0, light: 70 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.2,
    prepNote: '생현미 기준', cookingNote: '흰쌀보다 불리는 시간 길고 밥 부피 약간 적음(2.2배).',
    variantAdjust: {},
    marketPackage: '2kg·4kg' },
  { key: 'friedRice', name: '볶음밥용 밥', emoji: '🍚', category: 'grain', unit: 'g',
    basePerPerson: { main: 220, side: 130, snack: 180, light: 170 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 1.0,
    prepNote: '지은 밥 기준 (식은 밥 권장)', cookingNote: '갓 지은 밥보다 식힌 밥이 볶음에 좋음.',
    variantAdjust: { '볶음': 0 },
    marketPackage: '즉석밥 210g·12개입' },
  { key: 'juk', name: '죽용 쌀', emoji: '🥣', category: 'grain', unit: 'g',
    basePerPerson: { main: 45, side: 25, snack: 0, light: 35 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 5.5,
    prepNote: '생쌀 기준 (죽 약 5~6배)', cookingNote: '흰죽·전복죽용. 생쌀 45g → 죽 약 250g.',
    variantAdjust: {} },

  // ── 채소·부재료 ──────────────────────────
  { key: 'salad', name: '샐러드 채소', emoji: '🥗', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 120, side: 60, snack: 80, light: 150 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.9,
    prepNote: '손질 전 기준', cookingNote: '양상추·로메인·루꼴라 등 혼합.',
    variantAdjust: {},
    marketPackage: '믹스팩 100~150g' },
  { key: 'ssamVeg', name: '쌈채소', emoji: '🥬', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 80, side: 40, snack: 60, light: 100 },
    withCarbReduction: 30, withoutCarbIncrease: 10, rawToCooked: 0.95,
    prepNote: '손질 전 기준', cookingNote: '상추·깻잎·청경채. 고기 메뉴 시 상한 쪽 준비.',
    variantAdjust: {},
    marketPackage: '쌈채소 1팩 200g (2~3인분)' },
  { key: 'cabbage', name: '양배추', emoji: '🥬', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 120, side: 60, snack: 80, light: 100 },
    withCarbReduction: 30, withoutCarbIncrease: 20, rawToCooked: 0.7,
    prepNote: '손질 전 기준', cookingNote: '샤브샤브·볶음용. 찌면 부피 크게 감소.',
    variantAdjust: { '전골': 20, '볶음': 0 },
    marketPackage: '한 통 1.5~2kg' },
  { key: 'beansprout', name: '숙주', emoji: '🌱', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 80, light: 90 },
    withCarbReduction: 20, withoutCarbIncrease: 20, rawToCooked: 0.8,
    prepNote: '손질 전 기준', cookingNote: '샤브샤브·잡채·볶음. 한 봉 200~300g.',
    variantAdjust: { '전골': 20, '볶음': 0 },
    marketPackage: '1봉 200~300g' },
  { key: 'mushroom', name: '버섯', emoji: '🍄', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 100, side: 50, snack: 80, light: 80 },
    withCarbReduction: 30, withoutCarbIncrease: 20, rawToCooked: 0.75,
    prepNote: '손질 전 기준', cookingNote: '느타리·새송이·양송이 혼합. 샤브·전골에 넉넉히.',
    variantAdjust: { '전골': 20, '볶음': 0 },
    marketPackage: '1팩 150~200g' },
  { key: 'potato', name: '감자', emoji: '🥔', category: 'vegetable', unit: 'g (개)',
    basePerPerson: { main: 180, side: 100, snack: 130, light: 130 },
    withCarbReduction: 0, withoutCarbIncrease: 30, rawToCooked: 0.9,
    prepNote: '껍질 포함 (중간 1개 약 150g)', cookingNote: '찜·국·볶음 공통. 1인분 1~1.5개.',
    variantAdjust: { '국물': 10, '볶음': 0, '찜': 0 },
    marketPackage: '한 망 2~3kg' },

  // ── 국·찌개·전골 ─────────────────────────
  { key: 'soupMeat', name: '국거리 고기', emoji: '🍲', category: 'soup', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 80, light: 80 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.85,
    prepNote: '생고기 기준 (양지·사태)', cookingNote: '국은 국물이 포만감을 채우므로 단독 고기보다 적음.',
    variantAdjust: { '국물': 0, '전골': 20 },
    marketPackage: '국거리 300·500g', notFor: ['vegetarian', 'vegan'] },
  { key: 'hotpotMeat', name: '전골용 고기', emoji: '🍲', category: 'soup', unit: 'g',
    basePerPerson: { main: 130, side: 70, snack: 100, light: 100 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.8,
    prepNote: '생고기 기준', cookingNote: '채소·두부·면사리와 함께. 단독 메인이면 +30g.',
    variantAdjust: { '전골': 0, '국물': -10 },
    marketPackage: '1팩 300·500g', notFor: ['vegetarian', 'vegan'] },
  { key: 'eomuk', name: '어묵', emoji: '🍢', category: 'soup', unit: 'g',
    basePerPerson: { main: 80, side: 50, snack: 70, light: 60 },
    withCarbReduction: 20, withoutCarbIncrease: 10, rawToCooked: 1.0,
    prepNote: '완제품 기준', cookingNote: '국·볶음·꼬치용. 한 팩(500g)으로 5~6인분.',
    variantAdjust: { '국물': 10, '볶음': 0 },
    marketPackage: '1팩 500g (5~6인분)', notFor: ['vegetarian', 'vegan'] },
  { key: 'dumpling', name: '만두', emoji: '🥟', category: 'soup', unit: '개',
    basePerPerson: { main: 5, side: 3, snack: 4, light: 4 },
    withCarbReduction: 1, withoutCarbIncrease: 2, rawToCooked: 1.0,
    prepNote: '완제품 (1개 20~25g)', cookingNote: '만두국·군만두·찐만두. 단독 메인이면 6~8개.',
    variantAdjust: { '국물': 0, '찜': 0 },
    marketPackage: '1봉 16~30개', notFor: ['glutenFree'] },
  { key: 'tofu', name: '두부', emoji: '⬜', category: 'soup', unit: 'g (모)',
    basePerPerson: { main: 100, side: 50, snack: 80, light: 80 },
    withCarbReduction: 20, withoutCarbIncrease: 0, rawToCooked: 0.9,
    prepNote: '생두부 (1모 300~350g)', cookingNote: '찌개용 두부 1모 = 3~4인분. 단독 반찬은 1~2인분.',
    variantAdjust: { '국물': -10, '볶음': 10 },
    marketPackage: '1모 300g (찌개용 1~3모)' },
]

// ── 옵션 라벨 ────────────────────────────
export type MealType = 'main' | 'side' | 'snack' | 'light'
export type Appetite = 'small' | 'normal' | 'large'
export type AgeGroup = 'adultOnly' | 'adultChild' | 'childOnly'
export type Carb = 'yes' | 'no'

export const MEAL_LABEL: Record<MealType, string> = {
  main: '🍽️ 메인 식사',
  side: '🍶 곁들임 / 사이드',
  snack: '🍺 안주',
  light: '🥗 가벼운 식사',
}
export const APPETITE_MULT: Record<Appetite, number> = {
  small: 0.8, normal: 1.0, large: 1.25,
}
export const APPETITE_LABEL: Record<Appetite, string> = {
  small: '적게 (×0.8)', normal: '보통 (×1.0)', large: '많이 (×1.25)',
}
export const AGE_LABEL: Record<AgeGroup, string> = {
  adultOnly: '성인만', adultChild: '성인 + 아이', childOnly: '아이 위주',
}
export const VARIANT_CHOICES: Partial<Record<Category, string[]>> = {
  noodle: ['국물', '비빔', '볶음'],
  meat: ['구이', '볶음', '찜', '전골'],
  soup: ['국물', '전골'],
  vegetable: ['국물', '볶음', '전골'],
}

export const DIETARY_LABEL: Record<DietaryFlag, string> = {
  vegetarian: '🥬 채식 (고기·생선 X)',
  vegan: '🌱 비건 (모든 동물성 X)',
  glutenFree: '🌾 글루텐프리 (밀가루 X)',
}

// ── 가족 구성 ────────────────────────────
export type AgeBand = 'adult' | 'teen' | 'school' | 'preschool' | 'toddler'

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  adult:     '성인 (만 14세+)',
  teen:      '중·고생 (만 14~17세)',
  school:    '초등생 (만 7~13세)',
  preschool: '유아 (만 4~6세)',
  toddler:   '영아 (만 3세 이하)',
}
// 성인 인분 환산 계수
export const AGE_BAND_FACTOR: Record<AgeBand, number> = {
  adult:     1.00,
  teen:      0.90,
  school:    0.65,
  preschool: 0.40,
  toddler:   0.25,
}

export interface FamilyMember {
  id: string
  name?: string
  age: AgeBand
  appetite: Appetite
}

export interface UserFamilySettings {
  members: FamilyMember[]
  defaultMealType?: MealType
  carb?: Carb
  dietary?: DietaryFlag[]
  updatedAt?: string
}

export const STORAGE_KEY = 'youtil:serving:family-v1'

export function loadFamily(): UserFamilySettings {
  if (typeof window === 'undefined') return { members: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserFamilySettings) : { members: [] }
  } catch { return { members: [] } }
}
export function saveFamily(s: UserFamilySettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, updatedAt: new Date().toISOString().slice(0, 10) }))
  } catch { /* quota */ }
}

export function familyToEffectivePeople(members: FamilyMember[]): number {
  return members.reduce((sum, m) => sum + AGE_BAND_FACTOR[m.age] * APPETITE_MULT[m.appetite], 0)
}
