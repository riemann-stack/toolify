/* ──────────────────────────────────────────────────────
   recipe/ingredientDensity.ts
   재료별 밀도(g/ml), 양념 여부, 별칭, 카테고리
   부피 ↔ 무게 환산용 표준 데이터
   ────────────────────────────────────────────────────── */

export type IngredientCategory =
  | 'flour' | 'sugar' | 'grain' | 'liquid' | 'fat' | 'paste'
  | 'spice' | 'cheese' | 'nuts' | 'fruit' | 'chocolate'

export type IngredientShoppingGroup =
  | 'vegetable' | 'meat' | 'dairy' | 'grain-noodle' | 'sauce-spice' | 'canned' | 'fruit-snack' | 'other'

export type IngredientInfo = {
  /** 표준 한국어 이름 */
  name: string
  /** g per 1 ml */
  gPerMl: number
  category: IngredientCategory
  isSeasoning?: boolean
  /** 동의어·별칭 (검색 매칭용) */
  aliases?: string[]
  /** 장보기 카테고리 (마트 코너별) */
  shopGroup?: IngredientShoppingGroup
}

/** 표준 밀도 데이터 — 일반 가정 베이킹·요리 기준 */
export const INGREDIENT_DENSITY: IngredientInfo[] = [
  // ── 가루·곡물
  { name: '밀가루',       gPerMl: 0.55, category: 'flour', shopGroup: 'grain-noodle',
    aliases: ['중력분', '강력분', '박력분', '통밀가루', '통밀'] },
  { name: '설탕',         gPerMl: 0.85, category: 'sugar', shopGroup: 'sauce-spice',
    aliases: ['백설탕', '황설탕', '갈색설탕', '슈가파우더', '슈거파우더'] },
  { name: '소금',         gPerMl: 1.20, category: 'spice', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['천일염', '꽃소금', '굵은소금'] },
  { name: '쌀',           gPerMl: 0.85, category: 'grain', shopGroup: 'grain-noodle',
    aliases: ['백미', '현미', '찹쌀'] },
  { name: '코코아파우더', gPerMl: 0.50, category: 'flour', shopGroup: 'sauce-spice',
    aliases: ['코코아 파우더', '카카오파우더'] },
  { name: '베이킹파우더', gPerMl: 0.60, category: 'flour', shopGroup: 'sauce-spice',
    aliases: ['BP'] },
  { name: '베이킹소다',   gPerMl: 0.70, category: 'flour', shopGroup: 'sauce-spice' },
  { name: '이스트',       gPerMl: 0.60, category: 'flour', shopGroup: 'sauce-spice',
    aliases: ['인스턴트 이스트', '드라이 이스트'] },
  { name: '오트밀',       gPerMl: 0.40, category: 'grain', shopGroup: 'grain-noodle',
    aliases: ['귀리'] },

  // ── 액체
  { name: '물',           gPerMl: 1.00, category: 'liquid', shopGroup: 'other' },
  { name: '우유',         gPerMl: 1.03, category: 'liquid', shopGroup: 'dairy',
    aliases: ['저지방우유', '무지방우유'] },
  { name: '생크림',       gPerMl: 0.99, category: 'liquid', shopGroup: 'dairy',
    aliases: ['휘핑크림', '동물성크림'] },
  { name: '식용유',       gPerMl: 0.92, category: 'liquid', shopGroup: 'sauce-spice',
    aliases: ['카놀라유', '포도씨유', '해바라기유'] },
  { name: '올리브유',     gPerMl: 0.91, category: 'liquid', shopGroup: 'sauce-spice',
    aliases: ['올리브오일', 'EVOO'] },
  { name: '참기름',       gPerMl: 0.92, category: 'liquid', shopGroup: 'sauce-spice' },
  { name: '들기름',       gPerMl: 0.93, category: 'liquid', shopGroup: 'sauce-spice' },
  { name: '간장',         gPerMl: 1.16, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['진간장', '국간장', '양조간장', '왜간장'] },
  { name: '식초',         gPerMl: 1.01, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['양조식초', '사과식초', '현미식초', '발사믹'] },
  { name: '맛술',         gPerMl: 1.00, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['미림'] },
  { name: '청주',         gPerMl: 0.97, category: 'liquid', shopGroup: 'sauce-spice' },
  { name: '꿀',           gPerMl: 1.42, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '메이플시럽',   gPerMl: 1.32, category: 'liquid', shopGroup: 'sauce-spice' },
  { name: '물엿',         gPerMl: 1.40, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '올리고당',     gPerMl: 1.40, category: 'liquid', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '멸치육수',     gPerMl: 1.00, category: 'liquid', shopGroup: 'other',
    aliases: ['멸치다시마육수', '국물', '육수', '다시'] },

  // ── 장류·페이스트
  { name: '고추장',       gPerMl: 1.20, category: 'paste', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '된장',         gPerMl: 1.20, category: 'paste', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '쌈장',         gPerMl: 1.20, category: 'paste', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '마요네즈',     gPerMl: 0.94, category: 'paste', shopGroup: 'sauce-spice',
    aliases: ['마요'] },
  { name: '케첩',         gPerMl: 1.10, category: 'paste', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '머스타드',     gPerMl: 1.05, category: 'paste', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['디종', '홀그레인'] },

  // ── 가루 양념
  { name: '고춧가루',     gPerMl: 0.50, category: 'spice', isSeasoning: true, shopGroup: 'sauce-spice' },
  { name: '다진마늘',     gPerMl: 1.00, category: 'spice', isSeasoning: true, shopGroup: 'vegetable',
    aliases: ['마늘'] },
  { name: '다진생강',     gPerMl: 1.00, category: 'spice', isSeasoning: true, shopGroup: 'vegetable',
    aliases: ['생강'] },
  { name: '후추',         gPerMl: 0.50, category: 'spice', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['후춧가루', '통후추', '검은후추'] },
  { name: '계피가루',     gPerMl: 0.50, category: 'spice', shopGroup: 'sauce-spice',
    aliases: ['시나몬'] },
  { name: '카레가루',     gPerMl: 0.50, category: 'spice', shopGroup: 'sauce-spice' },
  { name: '미원',         gPerMl: 0.70, category: 'spice', isSeasoning: true, shopGroup: 'sauce-spice',
    aliases: ['MSG', '다시다', '연두'] },

  // ── 유지방
  { name: '버터',         gPerMl: 0.91, category: 'fat', shopGroup: 'dairy',
    aliases: ['무염버터', '가염버터'] },
  { name: '마가린',       gPerMl: 0.96, category: 'fat', shopGroup: 'dairy' },

  // ── 견과·기타
  { name: '치즈가루',     gPerMl: 0.40, category: 'cheese', shopGroup: 'dairy',
    aliases: ['파마산', '파르메산', '체다가루'] },
  { name: '깨',           gPerMl: 0.60, category: 'spice', shopGroup: 'sauce-spice',
    aliases: ['참깨', '검은깨', '들깨', '통깨'] },
  { name: '땅콩',         gPerMl: 0.60, category: 'nuts', shopGroup: 'fruit-snack' },
  { name: '호두',         gPerMl: 0.50, category: 'nuts', shopGroup: 'fruit-snack' },
  { name: '아몬드',       gPerMl: 0.60, category: 'nuts', shopGroup: 'fruit-snack' },
  { name: '건포도',       gPerMl: 0.60, category: 'fruit', shopGroup: 'fruit-snack' },
  { name: '초콜릿칩',     gPerMl: 0.65, category: 'chocolate', shopGroup: 'fruit-snack',
    aliases: ['초코칩'] },

  // ── 흔한 식재료 (밀도 ≈ 1, 장보기 분류용)
  { name: '계란',         gPerMl: 1.03, category: 'liquid', shopGroup: 'dairy',
    aliases: ['달걀'] },
  { name: '돼지고기',     gPerMl: 1.04, category: 'liquid', shopGroup: 'meat',
    aliases: ['삼겹살', '목살', '앞다리살'] },
  { name: '소고기',       gPerMl: 1.04, category: 'liquid', shopGroup: 'meat',
    aliases: ['등심', '안심', '한우', '우삼겹'] },
  { name: '닭고기',       gPerMl: 1.04, category: 'liquid', shopGroup: 'meat',
    aliases: ['닭가슴살', '닭다리살', '닭안심'] },
  { name: '두부',         gPerMl: 1.05, category: 'liquid', shopGroup: 'other' },
  { name: '양파',         gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable' },
  { name: '대파',         gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable',
    aliases: ['파', '쪽파'] },
  { name: '애호박',       gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable',
    aliases: ['호박'] },
  { name: '감자',         gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable' },
  { name: '신김치',       gPerMl: 1.00, category: 'liquid', shopGroup: 'other',
    aliases: ['묵은김치', '김치'] },
  { name: '파스타면',     gPerMl: 0.50, category: 'grain', shopGroup: 'grain-noodle',
    aliases: ['스파게티', '페투치니', '파스타', '면'] },
  { name: '양상추',       gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable' },
  { name: '토마토',       gPerMl: 1.00, category: 'liquid', shopGroup: 'vegetable' },
  { name: '베이컨',       gPerMl: 1.00, category: 'liquid', shopGroup: 'meat' },
]

/** 별칭 포함해 재료 데이터 매칭 — 부분 일치 허용 */
export function findIngredient(rawName: string): IngredientInfo | null {
  const cleaned = rawName.trim().replace(/\s+/g, '').toLowerCase()
  if (!cleaned) return null

  // 1. 정확한 이름 일치
  for (const it of INGREDIENT_DENSITY) {
    const key = it.name.replace(/\s+/g, '').toLowerCase()
    if (key === cleaned) return it
  }
  // 2. 별칭 정확 일치
  for (const it of INGREDIENT_DENSITY) {
    if (it.aliases?.some(a => a.replace(/\s+/g, '').toLowerCase() === cleaned)) return it
  }
  // 3. 부분 포함 (양방향)
  for (const it of INGREDIENT_DENSITY) {
    const key = it.name.replace(/\s+/g, '').toLowerCase()
    if (cleaned.includes(key) || key.includes(cleaned)) return it
  }
  // 4. 별칭 부분 일치
  for (const it of INGREDIENT_DENSITY) {
    if (it.aliases?.some(a => {
      const ak = a.replace(/\s+/g, '').toLowerCase()
      return cleaned.includes(ak) || ak.includes(cleaned)
    })) return it
  }
  return null
}

/** 양념 여부 */
export function isSeasoning(rawName: string): boolean {
  return findIngredient(rawName)?.isSeasoning ?? false
}

/* ─── 단위 정의 (ml/g 기준 환산) ─── */
export type UnitKey =
  | 'g' | 'kg' | 'oz' | 'lb'
  | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'cupUS'
  | 'pinch' | 'handful' | 'bit'
  | 'piece' | 'half' | 'slice' | 'bunch'

export type UnitInfo = {
  key: UnitKey
  name: string
  /** ml로 변환 (부피 단위) */
  ml?: number
  /** g로 변환 (무게 단위) */
  g?: number
  /** 어림 그램값 (꼬집·줌 등) */
  approxG?: number
  /** 개수 단위 (변환 불가) */
  count?: boolean
}

export const UNITS: UnitInfo[] = [
  // 무게
  { key: 'g',   name: 'g',   g: 1 },
  { key: 'kg',  name: 'kg',  g: 1000 },
  { key: 'oz',  name: 'oz',  g: 28.35 },
  { key: 'lb',  name: 'lb',  g: 453.59 },

  // 부피
  { key: 'ml',     name: 'ml',     ml: 1 },
  { key: 'l',      name: 'L',      ml: 1000 },
  { key: 'tsp',    name: '작은술', ml: 5 },
  { key: 'tbsp',   name: '큰술',   ml: 15 },
  { key: 'cup',    name: '컵',     ml: 200 },
  { key: 'cupUS',  name: '컵(미국)', ml: 240 },

  // 어림 단위
  { key: 'pinch',   name: '꼬집', approxG: 0.5 },
  { key: 'handful', name: '줌',   approxG: 10 },
  { key: 'bit',     name: '약간', approxG: 1 },

  // 개수
  { key: 'piece', name: '개',     count: true },
  { key: 'half',  name: '반 개',  count: true },
  { key: 'slice', name: '쪽',     count: true },
  { key: 'bunch', name: '단',     count: true },
]

export function findUnit(key: string): UnitInfo | null {
  return UNITS.find(u => u.key === key) ?? null
}

/* ─── 장보기 그룹 라벨 ─── */
export const SHOP_GROUP_LABELS: Record<IngredientShoppingGroup, { label: string; emoji: string }> = {
  vegetable:    { label: '채소',          emoji: '🥦' },
  meat:         { label: '육류·해산물',    emoji: '🥩' },
  dairy:        { label: '유제품·계란',    emoji: '🥛' },
  'grain-noodle': { label: '곡물·면류',    emoji: '🌾' },
  'sauce-spice': { label: '양념·소스',     emoji: '🌶️' },
  canned:       { label: '통조림·가공',    emoji: '🥫' },
  'fruit-snack':{ label: '과일·간식',      emoji: '🍎' },
  other:        { label: '기타',          emoji: '🍴' },
}
