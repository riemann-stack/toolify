// ─────────────────────────────────────────────────────────────
// 방귀 위험도 계산기 — 3축 점수·원인 분류·대체·증상 데이터
// ─────────────────────────────────────────────────────────────

export type CauseType = 'fermentation' | 'lactose' | 'air' | 'slow' | 'smell'

export type FoodInfo = {
  id: string
  name: string
  emoji: string
  category: string
  gas: number       // 가스량 1~10
  smell: number     // 냄새 1~10
  bloat: number     // 복부팽만 1~10
  causeTypes: CauseType[]
  fodmap?: string
  desc?: string
}

// 기존 ID 호환 + 3축 점수 + 원인 유형
export const FOOD_DATA: FoodInfo[] = [
  // 콩·곡류 (발효형·복부팽만)
  { id: 'beans',      name: '콩류',      emoji: '🫘', category: 'beans',
    gas: 8, smell: 3, bloat: 7, causeTypes: ['fermentation'], fodmap: 'high',
    desc: '라피노스·스타키오스 (올리고당)' },
  { id: 'lentils',    name: '렌틸콩',    emoji: '🫛', category: 'beans',
    gas: 7, smell: 3, bloat: 6, causeTypes: ['fermentation'], fodmap: 'high' },
  { id: 'chickpeas',  name: '병아리콩',  emoji: '🟡', category: 'beans',
    gas: 7, smell: 3, bloat: 6, causeTypes: ['fermentation'], fodmap: 'high' },

  // 유제품 (유당형)
  { id: 'milk',       name: '우유',      emoji: '🥛', category: 'dairy',
    gas: 6, smell: 4, bloat: 7, causeTypes: ['lactose'], fodmap: 'high (락토스)',
    desc: '유당불내증 시 가스 ↑↑' },
  { id: 'cheese',     name: '치즈',      emoji: '🧀', category: 'dairy',
    gas: 4, smell: 5, bloat: 5, causeTypes: ['lactose'], fodmap: 'medium' },
  { id: 'yogurt',     name: '요거트',    emoji: '🥛', category: 'dairy',
    gas: 3, smell: 3, bloat: 4, causeTypes: ['lactose'], fodmap: 'low (발효유)' },
  { id: 'iceCream',   name: '아이스크림', emoji: '🍦', category: 'dairy',
    gas: 6, smell: 4, bloat: 6, causeTypes: ['lactose', 'fermentation'], fodmap: 'high' },

  // 채소류
  { id: 'cabbage',    name: '양배추',     emoji: '🥬', category: 'veggie',
    gas: 7, smell: 8, bloat: 6, causeTypes: ['fermentation', 'smell'], fodmap: 'high',
    desc: '황 성분 → 냄새 강' },
  { id: 'broccoli',   name: '브로콜리',   emoji: '🥦', category: 'veggie',
    gas: 7, smell: 8, bloat: 6, causeTypes: ['fermentation', 'smell'], fodmap: 'high' },
  { id: 'onion',      name: '양파',       emoji: '🧅', category: 'veggie',
    gas: 9, smell: 5, bloat: 7, causeTypes: ['fermentation'], fodmap: 'high (프럭탄)' },
  { id: 'garlic',     name: '마늘',       emoji: '🧄', category: 'veggie',
    gas: 9, smell: 6, bloat: 7, causeTypes: ['fermentation'], fodmap: 'high (프럭탄)' },
  { id: 'sweetPotato',name: '고구마',     emoji: '🍠', category: 'veggie',
    gas: 6, smell: 3, bloat: 7, causeTypes: ['fermentation'], fodmap: 'medium' },
  { id: 'potato',     name: '감자',       emoji: '🥔', category: 'veggie',
    gas: 4, smell: 2, bloat: 5, causeTypes: ['fermentation'], fodmap: 'low' },
  { id: 'asparagus',  name: '아스파라거스', emoji: '🌿', category: 'veggie',
    gas: 5, smell: 6, bloat: 4, causeTypes: ['fermentation', 'smell'], fodmap: 'high' },

  // 밀가루·곡류·가공
  { id: 'flour',      name: '밀가루 음식', emoji: '🍞', category: 'flour',
    gas: 6, smell: 3, bloat: 7, causeTypes: ['fermentation', 'slow'], fodmap: 'high (프럭탄)' },
  { id: 'barley',     name: '보리·잡곡',   emoji: '🌾', category: 'flour',
    gas: 6, smell: 3, bloat: 6, causeTypes: ['fermentation'], fodmap: 'high (프럭탄)',
    desc: '보리·호밀·통밀 잡곡 — 프럭탄 함유' },
  { id: 'friedFood',  name: '튀긴 음식',   emoji: '🍟', category: 'flour',
    gas: 4, smell: 4, bloat: 8, causeTypes: ['slow'], fodmap: '-' },
  { id: 'processed',  name: '가공식품',    emoji: '🥫', category: 'flour',
    gas: 5, smell: 4, bloat: 6, causeTypes: ['slow', 'air'], fodmap: '-' },

  // 음료
  { id: 'soda',       name: '탄산음료',    emoji: '🥤', category: 'drink',
    gas: 9, smell: 2, bloat: 8, causeTypes: ['air'], fodmap: '-',
    desc: '직접 가스 + 인공감미료' },
  { id: 'beer',       name: '맥주',       emoji: '🍺', category: 'drink',
    gas: 8, smell: 3, bloat: 7, causeTypes: ['air', 'fermentation'], fodmap: 'medium' },
  { id: 'soju',       name: '소주',       emoji: '🍶', category: 'drink',
    gas: 4, smell: 3, bloat: 5, causeTypes: ['slow'], fodmap: 'low' },
  { id: 'energyDrink',name: '에너지드링크', emoji: '⚡', category: 'drink',
    gas: 6, smell: 3, bloat: 5, causeTypes: ['air'], fodmap: '-' },

  // 단백질
  { id: 'egg',        name: '계란',       emoji: '🥚', category: 'protein',
    gas: 3, smell: 9, bloat: 3, causeTypes: ['smell'], fodmap: 'low',
    desc: '황 (메티오닌·시스테인) → 냄새 매우 강' },
  { id: 'redMeat',    name: '고기 (적색육)', emoji: '🥩', category: 'protein',
    gas: 4, smell: 7, bloat: 6, causeTypes: ['smell', 'slow'], fodmap: '-' },
  { id: 'wpc',        name: 'WPC 단백질 보충제', emoji: '💪', category: 'protein',
    gas: 7, smell: 5, bloat: 6, causeTypes: ['lactose', 'fermentation'], fodmap: 'high',
    desc: 'WPC = 유당 포함 + 인공감미료' },
  { id: 'wpi',        name: 'WPI 단백질 보충제', emoji: '💪', category: 'protein',
    gas: 4, smell: 4, bloat: 4, causeTypes: ['fermentation'], fodmap: 'medium',
    desc: 'WPI = 유당 거의 X' },
  { id: 'plantProtein', name: '식물성 단백질', emoji: '🌱', category: 'protein',
    gas: 5, smell: 3, bloat: 5, causeTypes: ['fermentation'], fodmap: 'medium',
    desc: '유당 X, 콩·완두 발효 가능' },

  // 기타
  { id: 'spicy',      name: '매운 음식',   emoji: '🌶️', category: 'etc',
    gas: 4, smell: 5, bloat: 5, causeTypes: ['slow'], fodmap: '-' },
  { id: 'sweetener',  name: '인공감미료', emoji: '🍬', category: 'etc',
    gas: 9, smell: 4, bloat: 8, causeTypes: ['fermentation'], fodmap: 'high (폴리올)',
    desc: '소르비톨·자일리톨' },
  { id: 'fruit',      name: '사과·배·수박', emoji: '🍎', category: 'etc',
    gas: 5, smell: 2, bloat: 5, causeTypes: ['fermentation'], fodmap: 'high (과당)',
    desc: '과당 ↑ — 흡수 한계 초과 시 발효' },
  { id: 'stoneFruit', name: '체리·자두·복숭아', emoji: '🍑', category: 'etc',
    gas: 5, smell: 2, bloat: 6, causeTypes: ['fermentation'], fodmap: 'high (폴리올)',
    desc: '소르비톨 함유 — 핵과류 공통' },
]

export const CATEGORIES: { id: string; label: string; ids: string[] }[] = [
  { id: 'beans',   label: '🫘 콩·곡류',     ids: ['beans', 'lentils', 'chickpeas'] },
  { id: 'dairy',   label: '🥛 유제품',      ids: ['milk', 'cheese', 'yogurt', 'iceCream'] },
  { id: 'veggie',  label: '🥦 채소류',      ids: ['cabbage', 'broccoli', 'onion', 'garlic', 'sweetPotato', 'potato', 'asparagus'] },
  { id: 'flour',   label: '🌾 밀가루·곡류',  ids: ['flour', 'barley', 'friedFood', 'processed'] },
  { id: 'drink',   label: '🥤 음료',        ids: ['soda', 'beer', 'soju', 'energyDrink'] },
  { id: 'protein', label: '🍖 단백질',      ids: ['egg', 'redMeat', 'wpc', 'wpi', 'plantProtein'] },
  { id: 'etc',     label: '🍬 기타',        ids: ['spicy', 'sweetener', 'fruit', 'stoneFruit'] },
]

export const CAUSE_TYPES: Record<CauseType, { name: string; icon: string; desc: string; color: string }> = {
  fermentation: { name: '발효형',     icon: '🫧', color: '#0EA5E9',
    desc: '콩·양파·마늘·밀·과일·인공감미료 (FODMAP 발효)' },
  lactose:      { name: '유당형',     icon: '🥛', color: '#0891B2',
    desc: '우유·치즈·아이스크림·WPC (락타아제 부족)' },
  air:          { name: '탄산·공기형', icon: '🥤', color: '#FFD93E',
    desc: '탄산음료·맥주·빠른 식사 (삼킨 가스)' },
  slow:         { name: '소화지연형',  icon: '🍔', color: '#EA580C',
    desc: '과식·튀김·고지방·가공식품 (느린 소화)' },
  smell:        { name: '냄새강화형',  icon: '🦨', color: '#E11D48',
    desc: '계란·고기·양배추·브로콜리 (황 성분)' },
}

// ── 조건 ──
export type CondKey = 'overate' | 'eatFast' | 'drankSoda' | 'lactoseIntol' | 'sensitiveGut' | 'stressed'

export const CONDITIONS: { key: CondKey; label: string }[] = [
  { key: 'overate',      label: '평소보다 많이 먹었다 (과식)' },
  { key: 'eatFast',      label: '식사 속도가 빨랐다' },
  { key: 'drankSoda',    label: '탄산음료와 함께 먹었다' },
  { key: 'lactoseIntol', label: '유제품 먹으면 속이 불편한 편 (유당불내증 의심)' },
  { key: 'sensitiveGut', label: '평소 장이 예민한 편 (IBS 등)' },
  { key: 'stressed',     label: '스트레스를 많이 받은 날이다' },
]

const DAIRY_IDS = ['milk', 'cheese', 'iceCream', 'wpc']

// ── 점수 계산 ──
export type ScoreResult = {
  gas: number          // 0~100
  smell: number
  bloat: number
  total: number
  primaryTypes: { type: CauseType; weight: number }[]
  topFoods: FoodInfo[]
  comboWarnings: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  riskLabel: string
  riskColor: string
}

export function calcFartScore(
  selectedIds: string[],
  conds: Set<CondKey>,
): ScoreResult | null {
  if (selectedIds.length === 0 && conds.size === 0) return null

  let gas = 0, smell = 0, bloat = 0
  const causeTypeWeights: Record<string, number> = {}
  const foods: FoodInfo[] = []

  for (const id of selectedIds) {
    const f = FOOD_DATA.find(x => x.id === id)
    if (!f) continue
    foods.push(f)
    gas += f.gas
    smell += f.smell
    bloat += f.bloat
    for (const type of f.causeTypes) {
      causeTypeWeights[type] = (causeTypeWeights[type] ?? 0) + (f.gas + f.smell + f.bloat) / 3
    }
  }

  // 조건 보정
  if (conds.has('overate'))   { gas += 10; bloat += 15 }
  if (conds.has('eatFast'))   { gas += 8;  bloat += 10 }
  if (conds.has('drankSoda')) { gas += 12; bloat += 10 }
  if (conds.has('lactoseIntol')) {
    if (selectedIds.some(id => DAIRY_IDS.includes(id))) { gas += 15; bloat += 15 }
  }
  if (conds.has('sensitiveGut')) { gas += 10; bloat += 10; smell += 5 }
  if (conds.has('stressed'))     { gas += 5;  bloat += 8 }

  const gasScore   = Math.min(100, Math.round(gas))
  const smellScore = Math.min(100, Math.round(smell))
  const bloatScore = Math.min(100, Math.round(bloat))
  const total      = Math.round((gasScore + smellScore + bloatScore) / 3)

  // 원인 유형 TOP 2
  const primaryTypes = Object.entries(causeTypeWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type, weight]) => ({ type: type as CauseType, weight }))

  // 음식 TOP 3 (총점 기준)
  const topFoods = [...foods]
    .sort((a, b) => (b.gas + b.smell + b.bloat) - (a.gas + a.smell + a.bloat))
    .slice(0, 3)

  // 조합 경고
  const ids = new Set(selectedIds)
  const comboWarnings: string[] = []
  if (ids.has('milk') && ids.has('wpc') && ids.has('sweetener'))
    comboWarnings.push('🥛 유당 + 폴리올 중복 — 유제품 + WPC + 인공감미료 = 복부팽만 ↑↑')
  if (ids.has('beans') && ids.has('onion') && (ids.has('soda') || ids.has('beer')))
    comboWarnings.push('🫧 발효 3중 — 콩 + 양파 + 탄산 = 가스 ↑↑↑')
  if (ids.has('egg') && (ids.has('cabbage') || ids.has('broccoli')) && ids.has('redMeat'))
    comboWarnings.push('🦨 황 성분 3중 — 계란 + 양배추/브로콜리 + 고기 = 냄새 ↑↑')
  if (ids.has('flour') && ids.has('friedFood') && conds.has('overate'))
    comboWarnings.push('🍔 소화 지연 + 팽만 — 밀가루 + 튀김 + 과식 = 식후 불편 ↑')
  if (ids.has('wpc') && conds.has('lactoseIntol'))
    comboWarnings.push('💪 WPC + 유당불내증 — WPI 또는 식물성 단백질 권장')

  // 위험도
  let riskLevel: ScoreResult['riskLevel']
  let riskLabel: string
  let riskColor: string
  if (total < 30)      { riskLevel = 'low';     riskLabel = '🟢 평온';   riskColor = '#059669' }
  else if (total < 60) { riskLevel = 'medium';  riskLabel = '🟡 보통';   riskColor = '#FFD93E' }
  else if (total < 85) { riskLevel = 'high';    riskLabel = '🟠 높음';   riskColor = '#EA580C' }
  else                 { riskLevel = 'extreme'; riskLabel = '🔴 폭탄급'; riskColor = '#DC2626' }

  return {
    gas: gasScore, smell: smellScore, bloat: bloatScore, total,
    primaryTypes, topFoods, comboWarnings,
    riskLevel, riskLabel, riskColor,
  }
}

// ─────────────────────────────────────────────────────────────
// 저FODMAP 대체 가이드
// ─────────────────────────────────────────────────────────────
export type Alternative = {
  highId: string
  highEmoji: string
  highName: string
  options: { name: string; reason: string }[]
}

export const FODMAP_ALTERNATIVES: Alternative[] = [
  { highId: 'milk', highEmoji: '🥛', highName: '우유',
    options: [
      { name: '🥛 락토프리 우유', reason: '유당 분해됨' },
      { name: '🌱 두유 (일부)',   reason: '유당 X, 콩 알레르기 주의' },
      { name: '🌰 아몬드 음료',   reason: '저FODMAP·낮은 칼로리' },
      { name: '🌾 귀리 음료',     reason: '저FODMAP·약간 단맛' },
    ] },
  { highId: 'onion', highEmoji: '🧅', highName: '양파·마늘',
    options: [
      { name: '🥬 파 초록 부분만',   reason: '프럭탄 ↓' },
      { name: '🫒 마늘향 오일',     reason: '향 + FODMAP X' },
      { name: '🌿 차이브·쪽파',    reason: '향 비슷, 저FODMAP' },
      { name: '🌶️ 양파가루 (소량)', reason: '풍미 추가' },
    ] },
  { highId: 'flour', highEmoji: '🍞', highName: '밀가루·보리·잡곡',
    options: [
      { name: '🍚 쌀밥',                 reason: '저FODMAP' },
      { name: '🥔 감자·고구마',           reason: '저FODMAP, 만족감' },
      { name: '🍞 글루텐프리 빵',         reason: '밀·보리 X, 라벨 확인' },
      { name: '🍝 쌀국수·메밀국수',      reason: '저FODMAP' },
    ] },
  { highId: 'fruit', highEmoji: '🍎', highName: '사과·배·수박',
    options: [
      { name: '🍌 바나나 (덜 익은)',     reason: '저FODMAP' },
      { name: '🍓 딸기·블루베리',        reason: '저FODMAP·항산화' },
      { name: '🍊 오렌지·귤',            reason: '저FODMAP' },
      { name: '🥝 키위·멜론·포도',       reason: '저FODMAP 과일' },
    ] },
  { highId: 'stoneFruit', highEmoji: '🍑', highName: '체리·자두·복숭아',
    options: [
      { name: '🍌 바나나 (덜 익은)',     reason: '저FODMAP, 비슷한 식감' },
      { name: '🥝 키위',                reason: '저FODMAP, 비타민 C ↑' },
      { name: '🍇 포도',                 reason: '저FODMAP, 단맛' },
      { name: '🍊 오렌지',               reason: '저FODMAP, 신선' },
    ] },
  { highId: 'beans', highEmoji: '🫘', highName: '콩류',
    options: [
      { name: '🍱 두부 (소량 75g)',      reason: '저FODMAP 가공' },
      { name: '🫛 완두콩 (1/4컵)',       reason: '소량 저FODMAP' },
      { name: '🥚 계란',                reason: '단백질 대체' },
      { name: '🐟 생선·닭가슴살',        reason: '동물성 단백질' },
    ] },
  { highId: 'soda', highEmoji: '🥤', highName: '탄산음료',
    options: [
      { name: '💧 물',                   reason: '가스 X' },
      { name: '🍵 따뜻한 차 (생강·페퍼민트)', reason: '소화 도움' },
      { name: '🍋 레몬수',               reason: '신선·소화 도움' },
      { name: '🥥 코코넛수',             reason: '전해질 보충' },
    ] },
  { highId: 'wpc', highEmoji: '💪', highName: 'WPC 단백질 보충제',
    options: [
      { name: '💪 WPI (분리유청)',       reason: '유당 거의 X' },
      { name: '🌱 식물성 단백질',         reason: '유당·감미료 X 옵션' },
      { name: '🥚 천연 단백질 (계란·닭가슴살)', reason: '가스 ↓↓' },
      { name: '🥛 그리스 요거트',        reason: '발효유, 유당 ↓' },
    ] },
  { highId: 'broccoli', highEmoji: '🥦', highName: '양배추·브로콜리',
    options: [
      { name: '🥬 시금치·상추',          reason: '저FODMAP' },
      { name: '🫑 피망·파프리카',        reason: '저FODMAP' },
      { name: '🥒 오이·당근·호박',       reason: '저FODMAP·신선' },
      { name: '🍅 토마토',              reason: '저FODMAP·비타민' },
    ] },
]

// ─────────────────────────────────────────────────────────────
// 증상별 대처 가이드
// ─────────────────────────────────────────────────────────────
export type SymptomKey =
  | 'bloating' | 'manyFarts' | 'badSmell' | 'burping'
  | 'postMealDiscomfort' | 'diarrhea' | 'constipation' | 'abdominalPain'

export type SymptomResponse = {
  key: SymptomKey
  emoji: string
  name: string
  immediate: string[]
  nextMeal: string[]
  seeDoctor: string
  severity: 'normal' | 'urgent'
}

export const SYMPTOM_RESPONSES: SymptomResponse[] = [
  { key: 'bloating', emoji: '🎈', name: '배가 빵빵함',
    immediate: [
      '식후 10~15분 가볍게 걷기',
      '무릎 당기기 스트레칭',
      '따뜻한 물 또는 페퍼민트차',
      '복부 시계 방향 마사지',
    ],
    nextMeal: [
      '탄산·빨대 피하기',
      '양파·마늘·콩류 줄이기',
      '천천히 씹기 (한 입 30회)',
    ],
    seeDoctor: '지속 시 IBS 또는 소장세균과증식(SIBO) 가능성 → 소화기내과',
    severity: 'normal',
  },
  { key: 'manyFarts', emoji: '💨', name: '가스가 계속 나옴',
    immediate: ['걷기·자전거 (위치 바꾸기)', '따뜻한 차', '심호흡 (이완)'],
    nextMeal: ['FODMAP 음식 줄이기', '인공감미료 라벨 확인', '식사 속도 늦추기'],
    seeDoctor: '하루 30회+ 지속 시 영양사·소화기내과',
    severity: 'normal',
  },
  { key: 'badSmell', emoji: '🦨', name: '냄새가 심함',
    immediate: ['물 충분히 (수분 ↑ → 농도 ↓)', '걷기·신선한 공기', '환기'],
    nextMeal: ['계란·고기·양배추·브로콜리 양 줄이기', '단백질 보충제 종류 확인', '단순 채식 식단 (1일)'],
    seeDoctor: '심한 악취 + 혈변·체중감소 → 즉시 병원',
    severity: 'normal',
  },
  { key: 'burping', emoji: '😮‍💨', name: '트림이 많음',
    immediate: ['천천히 식사 (공기 삼킴 ↓)', '탄산 즉시 중단', '식후 바로 눕지 X'],
    nextMeal: ['빨대·껌 X', '뜨거운 음료 천천히', '이완·여유 식사'],
    seeDoctor: '역류성 식도염·헬리코박터 가능성 → 소화기내과',
    severity: 'normal',
  },
  { key: 'postMealDiscomfort', emoji: '😣', name: '식후 바로 불편함',
    immediate: ['잠깐 누운 자세 (왼쪽으로)', '복부 따뜻하게', '깊은 호흡'],
    nextMeal: ['식사량 ↓ (3~4번 나눠 먹기)', '튀김·고지방 줄이기', '식후 카페인 X'],
    seeDoctor: '담석·췌장 문제 가능성 → 검사 필요',
    severity: 'normal',
  },
  { key: 'diarrhea', emoji: '💧', name: '설사 동반',
    immediate: ['수분·전해질 보충', 'BRAT 식단 (죽·바나나·토스트·쌀밥)', '카페인·알코올 X'],
    nextMeal: ['유제품 1일 끊기', '인공감미료 (껌·다이어트 음료) X', '과일 (사과·배·수박) 양 줄이기'],
    seeDoctor: '⚠️ 3일 이상 지속·혈변·고열 → 즉시 병원',
    severity: 'urgent',
  },
  { key: 'constipation', emoji: '🪨', name: '변비 동반',
    immediate: ['따뜻한 물 + 식이섬유', '걷기 30분', '복부 마사지'],
    nextMeal: ['식이섬유 (귀리·키위·자두)', '수분 2L+', '규칙적 식사·배변 시간'],
    seeDoctor: '1주+ 지속 → 소화기내과',
    severity: 'normal',
  },
  { key: 'abdominalPain', emoji: '😰', name: '복통 동반',
    immediate: ['안정·따뜻한 찜질', '진통제 신중 (자가 처방 X)', '음식 일단 중단'],
    nextMeal: ['맑은 죽·미음만 (1식)', '점차 일반식'],
    seeDoctor: '⚠️ 심한 통증 + 발열·구토 반복·혈변·의식 변화·임산부 → 즉시 119 (충수염·장폐색 등 응급 가능성)',
    severity: 'urgent',
  },
]

// 위험 신호 (즉시 의료)
export const RED_FLAGS = [
  '혈변·검은 변',
  '갑작스러운 체중 감소',
  '심한 복통 (한밤중에 깨움)',
  '발열 동반',
  '구토 반복',
  '1주+ 지속되는 변비·설사',
  '임산부 (어떤 증상이든 신중)',
]
