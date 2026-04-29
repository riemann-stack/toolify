/* ──────────────────────────────────────────────────────
   recipe/recipePresets.ts
   인기 레시피 프리셋 — 한식·양식·일식·중식·디저트
   ────────────────────────────────────────────────────── */

import type { UnitKey } from './ingredientDensity'

export type PresetIngredient = {
  name: string
  amount: number
  unit: UnitKey
  note?: string
}

export type RecipeCategoryId =
  | 'korean' | 'western' | 'japanese' | 'chinese' | 'dessert' | 'soup' | 'side' | 'salad'

export type RecipePreset = {
  id: string
  name: string
  emoji: string
  category: RecipeCategoryId
  basePeople: number
  ingredients: PresetIngredient[]
  notes?: string
}

export const RECIPE_CATEGORIES: { id: RecipeCategoryId; name: string; emoji: string }[] = [
  { id: 'korean',   name: '한식',     emoji: '🇰🇷' },
  { id: 'western',  name: '양식',     emoji: '🍝' },
  { id: 'japanese', name: '일식',     emoji: '🍱' },
  { id: 'chinese',  name: '중식',     emoji: '🥢' },
  { id: 'dessert',  name: '디저트',   emoji: '🍰' },
  { id: 'soup',     name: '국·찌개',  emoji: '🍲' },
  { id: 'side',     name: '반찬',     emoji: '🥬' },
  { id: 'salad',    name: '샐러드',   emoji: '🥗' },
]

export const RECIPE_PRESETS: RecipePreset[] = [
  /* ─── 한식 ─── */
  {
    id: 'kimchi-jjigae', name: '김치찌개', emoji: '🥘', category: 'korean', basePeople: 2,
    ingredients: [
      { name: '신김치',       amount: 200, unit: 'g' },
      { name: '돼지고기',     amount: 150, unit: 'g',   note: '목살·앞다리살' },
      { name: '두부',         amount: 100, unit: 'g' },
      { name: '대파',         amount: 1,   unit: 'piece' },
      { name: '다진마늘',     amount: 1,   unit: 'tbsp' },
      { name: '고춧가루',     amount: 1,   unit: 'tbsp' },
      { name: '간장',         amount: 1,   unit: 'tbsp', note: '국간장' },
      { name: '물',           amount: 400, unit: 'ml' },
    ],
    notes: '신김치는 1년 이상 묵은 것이 가장 맛있습니다. 김치찌개용 묵은지 추천.',
  },
  {
    id: 'doenjang-jjigae', name: '된장찌개', emoji: '🍲', category: 'soup', basePeople: 2,
    ingredients: [
      { name: '된장',         amount: 2,   unit: 'tbsp' },
      { name: '두부',         amount: 150, unit: 'g' },
      { name: '애호박',       amount: 0.5, unit: 'piece' },
      { name: '감자',         amount: 1,   unit: 'piece' },
      { name: '양파',         amount: 0.5, unit: 'piece' },
      { name: '대파',         amount: 0.5, unit: 'piece' },
      { name: '다진마늘',     amount: 1,   unit: 'tsp' },
      { name: '멸치육수',     amount: 400, unit: 'ml' },
    ],
    notes: '멸치육수 대신 다시팩 우려낸 물 사용 가능. 끓을 때 된장을 풀어 넣으면 안 짭니다.',
  },
  {
    id: 'bulgogi', name: '소불고기', emoji: '🥩', category: 'korean', basePeople: 2,
    ingredients: [
      { name: '소고기',       amount: 300, unit: 'g',    note: '등심·안심·우삼겹' },
      { name: '양파',         amount: 0.5, unit: 'piece' },
      { name: '간장',         amount: 3,   unit: 'tbsp' },
      { name: '설탕',         amount: 1,   unit: 'tbsp' },
      { name: '다진마늘',     amount: 1,   unit: 'tbsp' },
      { name: '참기름',       amount: 1,   unit: 'tbsp' },
      { name: '깨',           amount: 1,   unit: 'tsp' },
      { name: '후추',         amount: 1,   unit: 'pinch' },
    ],
    notes: '양념에 30분 이상 재워두면 더 깊은 맛. 배즙 1큰술 추가하면 부드러워짐.',
  },
  {
    id: 'tteokbokki', name: '떡볶이', emoji: '🌶️', category: 'korean', basePeople: 2,
    ingredients: [
      { name: '떡볶이떡',     amount: 400, unit: 'g' },
      { name: '어묵',         amount: 100, unit: 'g' },
      { name: '대파',         amount: 1,   unit: 'piece' },
      { name: '고추장',       amount: 2,   unit: 'tbsp' },
      { name: '고춧가루',     amount: 1,   unit: 'tbsp' },
      { name: '설탕',         amount: 2,   unit: 'tbsp' },
      { name: '간장',         amount: 1,   unit: 'tbsp' },
      { name: '다진마늘',     amount: 1,   unit: 'tsp' },
      { name: '물',           amount: 400, unit: 'ml' },
    ],
    notes: '떡이 굳었다면 따뜻한 물에 5분 불려 사용. 끓이면서 졸이면 양념이 떡에 잘 배어듭니다.',
  },
  {
    id: 'bibimbap', name: '비빔밥', emoji: '🍚', category: 'korean', basePeople: 1,
    ingredients: [
      { name: '밥',           amount: 1,   unit: 'piece', note: '공기 단위' },
      { name: '시금치 나물',  amount: 50,  unit: 'g' },
      { name: '콩나물 무침',  amount: 50,  unit: 'g' },
      { name: '계란',         amount: 1,   unit: 'piece' },
      { name: '소고기',       amount: 80,  unit: 'g' },
      { name: '고추장',       amount: 1,   unit: 'tbsp' },
      { name: '참기름',       amount: 1,   unit: 'tsp' },
      { name: '깨',           amount: 0.5, unit: 'tsp' },
    ],
  },

  /* ─── 양식 ─── */
  {
    id: 'cream-pasta', name: '크림 파스타', emoji: '🍝', category: 'western', basePeople: 1,
    ingredients: [
      { name: '파스타면',     amount: 100, unit: 'g' },
      { name: '생크림',       amount: 150, unit: 'ml' },
      { name: '버터',         amount: 1,   unit: 'tbsp' },
      { name: '치즈가루',     amount: 2,   unit: 'tbsp' },
      { name: '다진마늘',     amount: 1,   unit: 'tsp' },
      { name: '소금',         amount: 0.25, unit: 'tsp' },
      { name: '후추',         amount: 0.5, unit: 'pinch' },
    ],
    notes: '면 삶을 때 면수 한 컵 따로 보관. 소스 농도 조절에 사용.',
  },
  {
    id: 'tomato-pasta', name: '토마토 파스타', emoji: '🍅', category: 'western', basePeople: 1,
    ingredients: [
      { name: '파스타면',     amount: 100, unit: 'g' },
      { name: '토마토',       amount: 2,   unit: 'piece' },
      { name: '양파',         amount: 0.25, unit: 'piece' },
      { name: '다진마늘',     amount: 1,   unit: 'tbsp' },
      { name: '올리브유',     amount: 2,   unit: 'tbsp' },
      { name: '소금',         amount: 0.5, unit: 'tsp' },
      { name: '후추',         amount: 1,   unit: 'pinch' },
      { name: '치즈가루',     amount: 1,   unit: 'tbsp' },
    ],
  },
  {
    id: 'carbonara', name: '까르보나라', emoji: '🍳', category: 'western', basePeople: 1,
    ingredients: [
      { name: '파스타면',     amount: 100, unit: 'g' },
      { name: '베이컨',       amount: 50,  unit: 'g' },
      { name: '계란',         amount: 1,   unit: 'piece', note: '노른자 + 전란 1' },
      { name: '치즈가루',     amount: 3,   unit: 'tbsp' },
      { name: '다진마늘',     amount: 1,   unit: 'tsp' },
      { name: '후추',         amount: 0.5, unit: 'tsp' },
      { name: '소금',         amount: 0.25, unit: 'tsp' },
    ],
    notes: '불 끄고 면수+계란 섞기. 잔열로만 익혀야 부드러움.',
  },
  {
    id: 'omelet', name: '오믈렛', emoji: '🍳', category: 'western', basePeople: 1,
    ingredients: [
      { name: '계란',         amount: 3,   unit: 'piece' },
      { name: '우유',         amount: 1,   unit: 'tbsp' },
      { name: '버터',         amount: 1,   unit: 'tbsp' },
      { name: '소금',         amount: 0.25, unit: 'tsp' },
      { name: '후추',         amount: 1,   unit: 'pinch' },
      { name: '치즈가루',     amount: 1,   unit: 'tbsp' },
    ],
  },

  /* ─── 일식 ─── */
  {
    id: 'oyakodon', name: '오야코동', emoji: '🍱', category: 'japanese', basePeople: 1,
    ingredients: [
      { name: '닭고기',       amount: 150, unit: 'g',    note: '닭다리살' },
      { name: '계란',         amount: 2,   unit: 'piece' },
      { name: '양파',         amount: 0.5, unit: 'piece' },
      { name: '간장',         amount: 2,   unit: 'tbsp' },
      { name: '설탕',         amount: 1,   unit: 'tbsp' },
      { name: '맛술',         amount: 2,   unit: 'tbsp' },
      { name: '물',           amount: 100, unit: 'ml' },
      { name: '밥',           amount: 1,   unit: 'piece' },
    ],
  },
  {
    id: 'curry', name: '일본식 카레', emoji: '🍛', category: 'japanese', basePeople: 4,
    ingredients: [
      { name: '소고기',       amount: 300, unit: 'g',    note: '카레용 또는 양지' },
      { name: '양파',         amount: 2,   unit: 'piece' },
      { name: '감자',         amount: 2,   unit: 'piece' },
      { name: '카레가루',     amount: 4,   unit: 'tbsp' },
      { name: '다진마늘',     amount: 1,   unit: 'tbsp' },
      { name: '버터',         amount: 1,   unit: 'tbsp' },
      { name: '물',           amount: 800, unit: 'ml' },
    ],
    notes: '양파 갈색 날 때까지 충분히 볶기 — 단맛·풍미의 핵심.',
  },

  /* ─── 디저트·베이킹 ─── */
  {
    id: 'pancake', name: '팬케이크', emoji: '🥞', category: 'dessert', basePeople: 2,
    ingredients: [
      { name: '밀가루',       amount: 150, unit: 'g',    note: '박력분' },
      { name: '설탕',         amount: 30,  unit: 'g' },
      { name: '베이킹파우더', amount: 1,   unit: 'tsp' },
      { name: '계란',         amount: 1,   unit: 'piece' },
      { name: '우유',         amount: 200, unit: 'ml' },
      { name: '버터',         amount: 20,  unit: 'g' },
      { name: '소금',         amount: 1,   unit: 'pinch' },
    ],
    notes: '반죽은 살짝 덩어리진 채로 — 너무 매끈하게 풀면 글루텐 형성으로 질겨짐.',
  },
  {
    id: 'cookies', name: '초코칩 쿠키', emoji: '🍪', category: 'dessert', basePeople: 12,
    ingredients: [
      { name: '밀가루',       amount: 200, unit: 'g',    note: '박력분' },
      { name: '버터',         amount: 100, unit: 'g',    note: '실온' },
      { name: '설탕',         amount: 80,  unit: 'g',    note: '백+황' },
      { name: '계란',         amount: 1,   unit: 'piece' },
      { name: '베이킹소다',   amount: 0.5, unit: 'tsp' },
      { name: '소금',         amount: 0.25, unit: 'tsp' },
      { name: '초콜릿칩',     amount: 100, unit: 'g' },
    ],
    notes: '반죽 30분 냉장 후 굽기 — 쿠키가 덜 퍼지고 쫀쫀해짐.',
  },
  {
    id: 'whipped-cream', name: '휘핑크림', emoji: '🍰', category: 'dessert', basePeople: 4,
    ingredients: [
      { name: '생크림',       amount: 200, unit: 'ml' },
      { name: '설탕',         amount: 20,  unit: 'g' },
    ],
    notes: '생크림·볼·거품기 모두 차갑게 — 잘 휘핑됨.',
  },
]
