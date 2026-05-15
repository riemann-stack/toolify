// ─────────────────────────────────────────────────────────────
// 제과 레시피 계산기 — 품목 데이터·프리셋·틀 용량
// ─────────────────────────────────────────────────────────────

export type IngredientKey =
  | 'flour' | 'sugar' | 'butter' | 'egg' | 'eggWhite' | 'eggYolk'
  | 'milk' | 'oil' | 'honey' | 'vanilla' | 'salt'
  | 'bakingPowder' | 'bakingSoda'
  | 'almondPowder' | 'powderedSugar'
  | 'brownSugar' | 'whiteSugar' | 'chocChips'
  | 'sourCream' | 'lemonZest' | 'foodColoring'
  | 'brownButter' | 'mizame' | 'cocoa' | 'chocolate'
  | 'cornStarch' | 'water' | 'blueberry'

export const INGREDIENT_LABEL: Record<IngredientKey, string> = {
  flour: '밀가루',
  sugar: '설탕',
  butter: '버터',
  egg: '계란 (전란)',
  eggWhite: '흰자',
  eggYolk: '노른자',
  milk: '우유',
  oil: '식용유',
  honey: '꿀',
  vanilla: '바닐라',
  salt: '소금',
  bakingPowder: '베이킹파우더',
  bakingSoda: '베이킹소다',
  almondPowder: '아몬드 가루',
  powderedSugar: '슈가파우더',
  brownSugar: '황설탕',
  whiteSugar: '백설탕',
  chocChips: '초코칩',
  sourCream: '사워크림',
  lemonZest: '레몬 제스트',
  foodColoring: '식용 색소',
  brownButter: '브라운 버터',
  mizame: '미즈아메',
  cocoa: '코코아 가루',
  chocolate: '초콜릿',
  cornStarch: '옥수수 전분',
  water: '물',
  blueberry: '블루베리',
}

export interface RatioSpec {
  range?: [number, number]
  default: number
}

export interface BakingItem {
  id: string
  name: string
  icon: string
  defaultBase: IngredientKey
  baseOptions: IngredientKey[]
  typicalRatios: Partial<Record<IngredientKey, RatioSpec>>
  bakingTemp?: { celsius: number; minutes: string; drying?: string }
  variants?: string[]
  notes: string
}

export const BAKING_ITEMS: BakingItem[] = [
  {
    id: 'madeleine', name: '마들렌', icon: '🐚',
    defaultBase: 'egg',
    baseOptions: ['egg', 'flour', 'butter'],
    typicalRatios: {
      egg:           { default: 100 },
      sugar:         { range: [90, 110], default: 100 },
      flour:         { range: [90, 110], default: 100 },
      butter:        { range: [90, 110], default: 100 },
      bakingPowder:  { range: [2, 4],    default: 3 },
      honey:         { range: [5, 15],   default: 10 },
      vanilla:       { range: [0.5, 1],  default: 0.5 },
    },
    bakingTemp: { celsius: 200, minutes: '8~10' },
    notes: '계란 100% 기준이 가장 직관적. 동량 (1:1:1:1) 클래식 구조.',
  },
  {
    id: 'poundcake', name: '파운드케이크', icon: '🍰',
    defaultBase: 'butter',
    baseOptions: ['butter', 'egg', 'flour', 'sugar'],
    typicalRatios: {
      butter:        { default: 100 },
      sugar:         { range: [80, 110], default: 100 },
      egg:           { range: [90, 110], default: 100 },
      flour:         { range: [90, 110], default: 100 },
      bakingPowder:  { range: [1, 3],    default: 2 },
      milk:          { range: [0, 15],   default: 0 },
      sourCream:     { range: [0, 20],   default: 0 },
    },
    bakingTemp: { celsius: 170, minutes: '50~60' },
    variants: ['클래식 (1:1:1:1)', '덜 단 (설탕 80%)', '촉촉한 (사워크림 +20%)', '묵직한 (버터 110%)'],
    notes: '버터·설탕·계란·밀가루 = 1:1:1:1 황금비율.',
  },
  {
    id: 'cookie', name: '쿠키', icon: '🍪',
    defaultBase: 'flour',
    baseOptions: ['flour', 'butter'],
    typicalRatios: {
      flour:         { default: 100 },
      butter:        { range: [50, 80], default: 65 },
      brownSugar:    { range: [30, 60], default: 50 },
      whiteSugar:    { range: [10, 40], default: 25 },
      egg:           { range: [20, 40], default: 30 },
      bakingSoda:    { range: [0.5, 1.5], default: 1 },
      salt:          { range: [0.5, 1], default: 0.7 },
      vanilla:       { range: [1, 2], default: 1 },
      chocChips:     { range: [40, 80], default: 60 },
    },
    bakingTemp: { celsius: 175, minutes: '12~15' },
    notes: '버터/밀가루 비율이 식감 핵심. 고비율 → 퍼짐 ↑ → 냉장 휴지 권장.',
  },
  {
    id: 'muffin', name: '머핀', icon: '🧁',
    defaultBase: 'flour',
    baseOptions: ['flour'],
    typicalRatios: {
      flour:         { default: 100 },
      sugar:         { range: [60, 90],  default: 70 },
      egg:           { range: [40, 60],  default: 50 },
      milk:          { range: [60, 100], default: 80 },
      oil:           { range: [40, 70],  default: 50 },
      bakingPowder:  { range: [3, 5],    default: 4 },
      salt:          { range: [0.5, 1],  default: 0.7 },
    },
    bakingTemp: { celsius: 180, minutes: '20~25' },
    notes: '액체·유지 비율이 촉촉함 결정.',
  },
  {
    id: 'macaron', name: '마카롱', icon: '🥮',
    defaultBase: 'eggWhite',
    baseOptions: ['eggWhite', 'almondPowder'],
    typicalRatios: {
      eggWhite:      { default: 100 },
      almondPowder:  { range: [120, 140], default: 130 },
      powderedSugar: { range: [120, 140], default: 130 },
      sugar:         { range: [80, 110],  default: 100 },
      foodColoring:  { range: [0, 1],     default: 0 },
    },
    bakingTemp: { celsius: 145, minutes: '12~14', drying: '실온 30~60분' },
    notes: '흰자·아몬드가루 비율이 핵심. 머랭 안정성·건조·굽기 모두 민감.',
  },
  {
    id: 'scone', name: '스콘', icon: '🥐',
    defaultBase: 'flour',
    baseOptions: ['flour'],
    typicalRatios: {
      flour:         { default: 100 },
      butter:        { range: [25, 50],  default: 35 },
      sugar:         { range: [10, 25],  default: 15 },
      milk:          { range: [40, 60],  default: 50 },
      egg:           { range: [10, 25],  default: 15 },
      bakingPowder:  { range: [3, 5],    default: 4 },
      salt:          { range: [0.5, 1],  default: 0.7 },
    },
    bakingTemp: { celsius: 200, minutes: '15~18' },
    notes: '차가운 버터·과한 반죽 X = 결대로 부서지는 식감.',
  },
  {
    id: 'financier', name: '휘낭시에', icon: '🟫',
    defaultBase: 'eggWhite',
    baseOptions: ['eggWhite', 'almondPowder'],
    typicalRatios: {
      eggWhite:      { default: 100 },
      almondPowder:  { range: [70, 90],  default: 80 },
      powderedSugar: { range: [80, 110], default: 100 },
      flour:         { range: [25, 40],  default: 30 },
      brownButter:   { range: [80, 100], default: 90 },
      honey:         { range: [5, 15],   default: 10 },
    },
    bakingTemp: { celsius: 200, minutes: '12~15' },
    notes: '브라운 버터(뵈르 누아제트)가 풍미 핵심.',
  },
  {
    id: 'castella', name: '카스테라', icon: '🟨',
    defaultBase: 'egg',
    baseOptions: ['egg', 'flour'],
    typicalRatios: {
      egg:           { default: 100 },
      sugar:         { range: [60, 80],  default: 70 },
      flour:         { range: [40, 55],  default: 45 },
      honey:         { range: [10, 20],  default: 15 },
      milk:          { range: [5, 15],   default: 10 },
      mizame:        { range: [3, 8],    default: 5 },
    },
    bakingTemp: { celsius: 160, minutes: '50~60' },
    notes: '계란 거품 안정성 핵심. 강력분 사용 (글루텐).',
  },
  {
    id: 'brownie', name: '브라우니', icon: '🍫',
    defaultBase: 'chocolate',
    baseOptions: ['chocolate', 'butter', 'flour'],
    typicalRatios: {
      chocolate:     { default: 100 },
      butter:        { range: [80, 110],  default: 100 },
      sugar:         { range: [80, 120],  default: 100 },
      egg:           { range: [40, 60],   default: 50 },
      flour:         { range: [30, 50],   default: 40 },
      cocoa:         { range: [5, 15],    default: 10 },
      salt:          { range: [0.5, 1.5], default: 1 },
    },
    bakingTemp: { celsius: 175, minutes: '20~25' },
    notes: '초콜릿 100% 기준. 밀가루 적게 = 진한 fudgy.',
  },
  {
    id: 'custard', name: '커스터드 크림', icon: '🍮',
    defaultBase: 'milk',
    baseOptions: ['milk', 'eggYolk'],
    typicalRatios: {
      milk:          { default: 100 },
      eggYolk:       { range: [10, 20],   default: 15 },
      sugar:         { range: [15, 25],   default: 20 },
      cornStarch:    { range: [4, 8],     default: 6 },
      vanilla:       { range: [0.5, 1.5], default: 1 },
      butter:        { range: [3, 8],     default: 5 },
    },
    notes: '우유 100% 기준. 노른자·전분 비율이 농도 결정.',
  },
]

// ─────────────────────────────────────────────────────────────
// 인기 레시피 프리셋
// ─────────────────────────────────────────────────────────────
export interface PresetRecipe {
  item: string
  name: string
  ratios: Partial<Record<IngredientKey, number>>
}

export const PRESET_RECIPES: PresetRecipe[] = [
  // 마들렌
  { item: 'madeleine', name: '클래식 마들렌',
    ratios: { egg: 100, sugar: 100, flour: 100, butter: 100, bakingPowder: 3, honey: 10 } },
  { item: 'madeleine', name: '브라운버터 마들렌',
    ratios: { egg: 100, sugar: 90, flour: 95, butter: 110, bakingPowder: 3, honey: 12, vanilla: 1 } },
  { item: 'madeleine', name: '레몬 마들렌',
    ratios: { egg: 100, sugar: 100, flour: 100, butter: 95, bakingPowder: 3, honey: 8, lemonZest: 5 } },
  // 파운드
  { item: 'poundcake', name: '르 코르동 블루 클래식 (1:1:1:1)',
    ratios: { butter: 100, sugar: 100, egg: 100, flour: 100, bakingPowder: 2 } },
  { item: 'poundcake', name: '촉촉한 파운드 (사워크림)',
    ratios: { butter: 100, sugar: 100, egg: 100, flour: 100, sourCream: 20, bakingPowder: 2 } },
  { item: 'poundcake', name: '레몬 파운드',
    ratios: { butter: 100, sugar: 100, egg: 100, flour: 100, milk: 10, bakingPowder: 2, lemonZest: 5 } },
  // 쿠키
  { item: 'cookie', name: '미국식 청크 쿠키',
    ratios: { flour: 100, butter: 65, brownSugar: 50, whiteSugar: 25, egg: 30, bakingSoda: 1, salt: 0.7, vanilla: 1, chocChips: 60 } },
  { item: 'cookie', name: '한국 카페 스타일 (쫀득)',
    ratios: { flour: 100, butter: 60, brownSugar: 60, whiteSugar: 15, egg: 35, bakingSoda: 0.8, salt: 0.7, chocChips: 70 } },
  { item: 'cookie', name: '바삭 쇼트브레드',
    ratios: { flour: 100, butter: 70, whiteSugar: 35, salt: 0.5, vanilla: 0.5 } },
  // 마카롱
  { item: 'macaron', name: '프렌치 머랭 마카롱',
    ratios: { eggWhite: 100, almondPowder: 130, powderedSugar: 130, sugar: 100 } },
  { item: 'macaron', name: '이탈리안 머랭 마카롱',
    ratios: { eggWhite: 100, almondPowder: 130, powderedSugar: 130, sugar: 110, water: 30 } },
  // 머핀
  { item: 'muffin', name: '클래식 블루베리 머핀',
    ratios: { flour: 100, sugar: 70, egg: 50, milk: 80, oil: 50, bakingPowder: 4, blueberry: 60 } },
  // 스콘
  { item: 'scone', name: '플레인 스콘',
    ratios: { flour: 100, butter: 35, sugar: 15, milk: 50, egg: 15, bakingPowder: 4, salt: 0.7 } },
  // 휘낭시에
  { item: 'financier', name: '클래식 휘낭시에',
    ratios: { eggWhite: 100, almondPowder: 80, powderedSugar: 100, flour: 30, brownButter: 90, honey: 10 } },
  // 카스테라
  { item: 'castella', name: '나가사키 카스테라',
    ratios: { egg: 100, sugar: 70, flour: 45, honey: 15, milk: 10, mizame: 5 } },
  // 브라우니
  { item: 'brownie', name: '진한 fudgy 브라우니',
    ratios: { chocolate: 100, butter: 100, sugar: 100, egg: 50, flour: 35, cocoa: 10, salt: 1 } },
  // 커스터드
  { item: 'custard', name: '바닐라 커스터드',
    ratios: { milk: 100, eggYolk: 15, sugar: 20, cornStarch: 6, vanilla: 1, butter: 5 } },
]

// ─────────────────────────────────────────────────────────────
// 틀 용량 프리셋 (g 단위)
// ─────────────────────────────────────────────────────────────
export interface MoldPreset {
  name: string
  perPiece?: number  // 1개당 g (개수형)
  volume?: number    // 1틀 g (용량형)
}

export const MOLD_PRESETS: Record<string, MoldPreset[]> = {
  madeleine: [
    { name: '미니 마들렌틀', perPiece: 18 },
    { name: '표준 마들렌틀', perPiece: 28 },
    { name: '대형 마들렌틀', perPiece: 40 },
  ],
  poundcake: [
    { name: '미니 파운드 (8×4×4)', volume: 200 },
    { name: '소형 파운드 (15×6×6)', volume: 450 },
    { name: '표준 파운드 (20×8×7)', volume: 800 },
    { name: '대형 파운드 (25×10×8)', volume: 1500 },
  ],
  muffin: [
    { name: '미니 머핀', perPiece: 30 },
    { name: '표준 머핀', perPiece: 65 },
    { name: '대형 머핀', perPiece: 100 },
  ],
  cookie: [
    { name: '미니 쿠키 (지름 4cm)', perPiece: 15 },
    { name: '표준 쿠키 (지름 6cm)', perPiece: 30 },
    { name: '큰 쿠키 (지름 8cm)', perPiece: 50 },
  ],
  macaron: [
    { name: '미니 마카롱 (지름 3cm)', perPiece: 8 },
    { name: '표준 마카롱 (지름 4cm)', perPiece: 12 },
    { name: '큰 마카롱 (지름 5cm)', perPiece: 18 },
  ],
  scone: [
    { name: '미니 스콘', perPiece: 35 },
    { name: '표준 스콘', perPiece: 60 },
    { name: '대형 스콘', perPiece: 90 },
  ],
  financier: [
    { name: '미니 휘낭시에틀', perPiece: 18 },
    { name: '표준 휘낭시에틀', perPiece: 30 },
  ],
  castella: [
    { name: '미니 카스테라 (15×8)', volume: 600 },
    { name: '표준 카스테라 (24×8×7)', volume: 1200 },
  ],
  brownie: [
    { name: '소형 브라우니팬 (15×15)', volume: 600 },
    { name: '표준 브라우니팬 (20×20)', volume: 1000 },
    { name: '대형 브라우니팬 (25×25)', volume: 1600 },
  ],
  custard: [
    { name: '소량 (1컵 분량)', volume: 250 },
    { name: '중량 (4인분)', volume: 600 },
    { name: '대량 (8인분)', volume: 1200 },
  ],
}

// 케이크 원형 (참고용)
export const CAKE_ROUND_MOLDS: MoldPreset[] = [
  { name: '원형 1호 (15cm)', volume: 700 },
  { name: '원형 2호 (18cm)', volume: 1100 },
  { name: '원형 3호 (21cm)', volume: 1500 },
]
