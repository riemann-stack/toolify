// ─────────────────────────────────────────────────────────────
// 견과류 데이터 (12종) + 가공 + 인기 믹스 프리셋
// ─────────────────────────────────────────────────────────────

export type AllergyGroup = 'tree' | 'legume' | 'seed'

export const ALLERGY_GROUP_LABEL: Record<AllergyGroup, string> = {
  // '핵과류'는 복숭아·자두 같은 핵과(核果)를 가리키는 말 — 알레르기 분류명은 '나무 견과류(tree nuts)'
  tree: '나무 견과류 (Tree nuts)',
  legume: '콩과 (Legume)',
  seed: '씨앗류 (Seeds)',
}

export interface NutData {
  key: string
  name: string
  /** 시각 구분용 색상 dot */
  color: string
  servingGrams: number
  servingCount: number | null
  caloriePerServing: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  /** 셀레늄 (μg per serving) — 브라질너트 핵심, 다른 견과는 0~10μg */
  selenium: number
  keyNutrient: string
  keyNutrientAmount: string
  maxDaily: number
  warning: string | null
  danger: boolean
  allergyGroup: AllergyGroup
  benefit: string[]
}

export const NUTS_DATA: NutData[] = [
  { key: 'almond',       name: '아몬드',       color: '#D4A373',
    servingGrams: 28, servingCount: 23, caloriePerServing: 164,
    protein: 6, fat: 14, carbs: 6, fiber: 3.5, selenium: 1,
    keyNutrient: '비타민E', keyNutrientAmount: '7.3mg (RDA 48%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['심혈관 건강', '혈당 조절', '뼈 건강'] },
  { key: 'walnut',       name: '호두',         color: '#6B4423',
    servingGrams: 28, servingCount: 14, caloriePerServing: 185,
    protein: 4.3, fat: 18.5, carbs: 3.9, fiber: 1.9, selenium: 1.4,
    keyNutrient: '오메가3(ALA)', keyNutrientAmount: '2.6g',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['뇌 건강', '항염증', '심혈관 건강'] },
  { key: 'cashew',       name: '캐슈넛',       color: '#E8D4A0',
    servingGrams: 28, servingCount: 18, caloriePerServing: 157,
    protein: 5.2, fat: 12.4, carbs: 8.6, fiber: 0.9, selenium: 5.6,
    keyNutrient: '마그네슘', keyNutrientAmount: '83mg (RDA 21%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['뼈 건강', '혈압 조절', '에너지 대사'] },
  { key: 'brazilNut',    name: '브라질너트',   color: '#4A2C20',
    servingGrams: 10, servingCount: 2, caloriePerServing: 66,
    // 셀레늄: USDA SR Legacy 1,917μg/100g (NIH ODS 1온스 544μg) → 10g 약 192μg. 개체 편차 큼
    protein: 1.4, fat: 6.6, carbs: 1.2, fiber: 0.7, selenium: 192,
    keyNutrient: '셀레늄', keyNutrientAmount: '192μg (권장량 320%)',
    maxDaily: 10,
    warning: '하루 1~2알(약 5~10g) 이내. 매일 3알 이상이면 셀레늄 상한(400μg)에 가까워지고, 넘으면 독성(탈모·손발톱 변형·신경 손상) 위험.',
    danger: true, allergyGroup: 'tree',
    benefit: ['셀레늄 보충', '항산화', '갑상선 기능'] },
  { key: 'peanut',       name: '땅콩',         color: '#C8956D',
    servingGrams: 28, servingCount: 28, caloriePerServing: 161,
    protein: 7.3, fat: 14, carbs: 4.6, fiber: 2.4, selenium: 2,
    keyNutrient: '단백질', keyNutrientAmount: '7.3g',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'legume',
    benefit: ['근육 합성', '포만감', '엽산'] },
  { key: 'sunflowerSeed', name: '해바라기씨',  color: '#4A5D23',
    servingGrams: 28, servingCount: null, caloriePerServing: 165,
    protein: 5.5, fat: 14.4, carbs: 6.8, fiber: 2.4, selenium: 22,
    keyNutrient: '비타민E', keyNutrientAmount: '7.4mg (RDA 49%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'seed',
    benefit: ['항산화', '심혈관 건강', '마그네슘'] },
  { key: 'pumpkinSeed',  name: '호박씨',       color: '#2D5016',
    servingGrams: 28, servingCount: null, caloriePerServing: 151,
    protein: 8.5, fat: 13, carbs: 5, fiber: 1.7, selenium: 2.5,
    keyNutrient: '아연', keyNutrientAmount: '2.2mg (RDA 20%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'seed',
    benefit: ['전립선 건강', '수면 개선', '면역 기능'] },
  { key: 'pistachio',    name: '피스타치오',   color: '#93C572',
    servingGrams: 28, servingCount: 49, caloriePerServing: 159,
    protein: 5.7, fat: 12.9, carbs: 7.7, fiber: 3, selenium: 2.7,
    keyNutrient: '비타민B6', keyNutrientAmount: '0.5mg (RDA 25%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['혈당 조절', '장 건강', '항산화'] },
  { key: 'pecan',        name: '피칸',         color: '#8B4513',
    servingGrams: 28, servingCount: 19, caloriePerServing: 196,
    protein: 2.6, fat: 20.4, carbs: 3.9, fiber: 2.7, selenium: 1,
    keyNutrient: '망간', keyNutrientAmount: '1.3mg (RDA 65%)',
    maxDaily: 28, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['심혈관 건강', '항산화', '뇌 건강'] },
  { key: 'macadamia',    name: '마카다미아',   color: '#F5F1E6',
    servingGrams: 28, servingCount: 10, caloriePerServing: 204,
    protein: 2.2, fat: 21.5, carbs: 3.9, fiber: 2.4, selenium: 1,
    keyNutrient: '단일불포화지방', keyNutrientAmount: '16.7g',
    maxDaily: 28, warning: '칼로리가 높아 다이어트 시 소량 섭취 권장',
    danger: false, allergyGroup: 'tree',
    benefit: ['심혈관 건강', '뇌 건강', '항염증'] },
  { key: 'hazelnut',     name: '헤이즐넛',     color: '#654321',
    servingGrams: 28, servingCount: 21, caloriePerServing: 178,
    protein: 4.2, fat: 17.2, carbs: 4.7, fiber: 2.7, selenium: 1.2,
    keyNutrient: '비타민E', keyNutrientAmount: '4.3mg (RDA 28%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['심혈관 건강', '혈당 조절', '뼈 건강'] },
  { key: 'pineNut',      name: '잣',           color: '#6B8E4E',
    servingGrams: 28, servingCount: null, caloriePerServing: 191,
    protein: 3.9, fat: 19.4, carbs: 3.7, fiber: 1, selenium: 0.2,
    keyNutrient: '철분', keyNutrientAmount: '1.6mg (RDA 16%)',
    maxDaily: 28, warning: null, danger: false, allergyGroup: 'tree',
    benefit: ['에너지 대사', '식욕 조절', '항산화'] },
]

// ── 인기 믹스 프리셋 ─────────────────────
export interface MixPreset {
  id: string
  name: string
  desc: string
  /** 견과류 key + 양(g) */
  items: Array<{ key: string; grams: number }>
}

export const POPULAR_MIXES: MixPreset[] = [
  {
    id: 'diet', name: '다이어트 믹스', desc: '저칼로리 · 고섬유 · 포만감',
    items: [
      { key: 'almond',     grams: 12 },
      { key: 'pistachio',  grams: 12 },
    ],
  },
  {
    id: 'muscle', name: '근육 믹스', desc: '고단백 · 운동 후 회복',
    items: [
      { key: 'peanut',      grams: 14 },
      { key: 'pumpkinSeed', grams: 10 },
      { key: 'almond',      grams: 10 },
    ],
  },
  {
    id: 'brain', name: '뇌 건강 믹스', desc: '오메가3 · 비타민E',
    items: [
      { key: 'walnut',     grams: 14 },
      { key: 'almond',     grams: 14 },
    ],
  },
  {
    id: 'cardio', name: '심혈관 믹스', desc: '불포화지방 · 항염증',
    items: [
      { key: 'walnut',     grams: 10 },
      { key: 'almond',     grams: 10 },
      { key: 'pecan',      grams: 8 },
    ],
  },
  {
    id: 'balanced', name: '균형 믹스', desc: '종합 영양 · 일상 추천',
    items: [
      { key: 'almond',      grams: 8 },
      { key: 'walnut',      grams: 8 },
      { key: 'cashew',      grams: 8 },
      { key: 'pumpkinSeed', grams: 6 },
    ],
  },
  {
    id: 'trail', name: '트레일 믹스', desc: '등산·러닝 행동식',
    items: [
      { key: 'almond',      grams: 12 },
      { key: 'cashew',      grams: 10 },
      { key: 'pumpkinSeed', grams: 8 },
    ],
  },
]

// ── 가공 ─────────────────────────────────
export type ProcK = 'raw' | 'salted' | 'roasted' | 'oilCoated' | 'chocolate' | 'honey'

export interface ProcData {
  key: ProcK
  label: string
  calFactor: number
  sodiumAdd: number
  warning: string | null
  heavy: boolean
}

export const PROC_DATA: ProcData[] = [
  { key: 'raw',         label: '생/건조 (무염)', calFactor: 1.0,  sodiumAdd: 0,   warning: null, heavy: false },
  { key: 'salted',      label: '가염',           calFactor: 1.0,  sodiumAdd: 150, warning: '나트륨 과잉 주의 (고혈압 주의)', heavy: false },
  { key: 'roasted',     label: '볶음',           calFactor: 1.05, sodiumAdd: 0,   warning: null, heavy: false },
  { key: 'oilCoated',   label: '오일 코팅',       calFactor: 1.1,  sodiumAdd: 80,  warning: '불필요한 지방 추가', heavy: true },
  { key: 'chocolate',   label: '초콜릿·시즈닝',   calFactor: 1.6,  sodiumAdd: 50,  warning: '설탕·트랜스지방 주의. 건강 효과 크게 감소.', heavy: true },
  { key: 'honey',       label: '꿀 코팅',         calFactor: 1.2,  sodiumAdd: 20,  warning: '당분 추가 (혈당 주의)', heavy: true },
]

// ── 셀레늄 권장량 ────────────────────────
// 출처: 2020 한국인 영양소 섭취기준(보건복지부·한국영양학회) 성인 권장섭취량 60μg, 상한섭취량 400μg
export const SELENIUM_RDA = 60      // μg, 성인 권장섭취량 (KDRI)
export const SELENIUM_UL = 400      // μg, 상한섭취량

/** 위험 판정 기준(g) — 셀레늄 위험 견과는 해당 견과만으로 셀레늄 상한(UL)에 닿는 양, 그 외는 권장 한도의 3배 */
export function dangerThresholdOf(n: Pick<NutData, 'danger' | 'maxDaily' | 'servingGrams' | 'selenium'>): number {
  if (n.danger && n.selenium > 0) return n.servingGrams * (SELENIUM_UL / n.selenium)
  return n.maxDaily * 3
}

// ── localStorage ─────────────────────────
export interface UserNutSettings {
  weight?: number
  goal?: 'diet' | 'maintain' | 'gain'
  dailyKcal?: string
  proc?: ProcK
  allergies?: AllergyGroup[]
}

export const STORAGE_KEY = 'youtil:nuts:settings-v1'

const GOALS = ['diet', 'maintain', 'gain'] as const

/** 저장값 필드별 검증 — 잘못된 proc면 PROC_DATA.find가 undefined가 되어 렌더가 깨지므로 걸러냄 */
export function loadSettings(): UserNutSettings {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const v: unknown = JSON.parse(raw)
    if (!v || typeof v !== 'object') return {}
    const o = v as Record<string, unknown>
    const out: UserNutSettings = {}
    if (typeof o.weight === 'number' && Number.isFinite(o.weight)) out.weight = Math.min(120, Math.max(40, Math.round(o.weight)))
    if (typeof o.goal === 'string' && (GOALS as readonly string[]).includes(o.goal)) out.goal = o.goal as UserNutSettings['goal']
    if (typeof o.dailyKcal === 'string' && /^\d{0,5}$/.test(o.dailyKcal)) out.dailyKcal = o.dailyKcal
    if (typeof o.proc === 'string' && PROC_DATA.some(p => p.key === o.proc)) out.proc = o.proc as ProcK
    if (Array.isArray(o.allergies)) {
      out.allergies = o.allergies.filter((g): g is AllergyGroup => typeof g === 'string' && g in ALLERGY_GROUP_LABEL)
    }
    return out
  } catch { return {} }
}
export function saveSettings(s: UserNutSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* quota */ }
}
