// ─────────────────────────────────────────────────────────────
// 비율 진단·식감 예측·텍스처 보정 로직
// ─────────────────────────────────────────────────────────────
import type { IngredientKey, BakingItem } from './bakingData'

export type Severity = 'info' | 'caution' | 'warning'

export interface Warning {
  ingredient: string
  message: string
  severity: Severity
}

export interface Prediction {
  trait: string
  level: number      // 0~1 (0.5 = 표준)
  desc: string
}

export interface Diagnosis {
  warnings: Warning[]
  predictions: Prediction[]
  recommendations: string[]
}

// 헬퍼: 범위 체크
function checkRange(
  ratios: Partial<Record<IngredientKey, number>>,
  key: IngredientKey,
  range: [number, number],
  label: string,
  highMsg: string,
  lowMsg: string,
  severity: Severity = 'caution',
): Warning[] {
  const v = ratios[key]
  if (v == null) return []
  if (v > range[1]) return [{ ingredient: label, message: highMsg, severity }]
  if (v < range[0]) return [{ ingredient: label, message: lowMsg, severity }]
  return []
}

// ─────────────────────────────────────────────────────────────
// 마들렌
// ─────────────────────────────────────────────────────────────
function diagnoseMadeleine(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  warnings.push(...checkRange(r, 'sugar', [80, 110], '설탕',
    '설탕 비율이 ↑. 단맛이 강할 수 있음.',
    '설탕 비율이 ↓. 푸석할 수 있음 + 보존성 ↓.'))
  warnings.push(...checkRange(r, 'butter', [85, 120], '버터',
    '버터 ↑. 풍미 ↑·식감 묵직.',
    '버터 ↓. 식감 가벼움·풍미 ↓.', 'info'))

  if ((r.bakingPowder ?? 0) > 4) warnings.push({
    ingredient: '베이킹파우더',
    message: '⚠️ 베이킹파우더 과다. 쓴맛·금속 맛 가능. 3% 권장.',
    severity: 'warning',
  })

  predictions.push({
    trait: '단맛',
    level: Math.min(1, (r.sugar ?? 100) / 130),
    desc: (r.sugar ?? 100) > 105 ? '강함' : (r.sugar ?? 100) < 95 ? '약함' : '적당',
  })
  predictions.push({
    trait: '촉촉함',
    level: Math.min(1, ((r.butter ?? 0) + (r.honey ?? 0) * 2) / 140),
    desc: (r.butter ?? 0) + (r.honey ?? 0) * 2 > 120 ? '매우 촉촉' : '보통',
  })
  predictions.push({
    trait: '풍미',
    level: Math.min(1, ((r.butter ?? 0) + (r.honey ?? 0) * 1.5) / 130),
    desc: (r.butter ?? 0) > 105 ? '진한 풍미' : '균형',
  })

  if ((r.honey ?? 0) < 5) recommendations.push('💡 꿀 5~10% 추가 시 촉촉함·풍미 ↑')
  if ((r.bakingPowder ?? 0) < 2) recommendations.push('💡 베이킹파우더 2~3% 권장 (배꼽 형성)')
  recommendations.push('💡 반죽 후 냉장 30분 휴지 → 마들렌 배꼽 형성에 유리')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 파운드케이크
// ─────────────────────────────────────────────────────────────
function diagnosePoundcake(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  warnings.push(...checkRange(r, 'sugar', [70, 110], '설탕',
    '설탕 ↑. 단맛 강·갈변 빠름.',
    '설탕 ↓. 식감 푸석 가능.'))
  warnings.push(...checkRange(r, 'butter', [85, 115], '버터',
    '버터 ↑. 묵직하고 진한 풍미.',
    '버터 ↓. 가벼움·식감 ↓.', 'info'))
  warnings.push(...checkRange(r, 'flour', [85, 110], '밀가루',
    '밀가루 ↑. 푸석할 수 있음.',
    '밀가루 ↓. 무너지기 쉬움.'))

  predictions.push({
    trait: '단맛',
    level: Math.min(1, (r.sugar ?? 100) / 130),
    desc: (r.sugar ?? 100) > 100 ? '강함' : (r.sugar ?? 100) < 85 ? '덜 단' : '적당',
  })
  predictions.push({
    trait: '촉촉함',
    level: Math.min(1, ((r.sourCream ?? 0) + (r.milk ?? 0) + 50) / 100),
    desc: (r.sourCream ?? 0) + (r.milk ?? 0) > 15 ? '매우 촉촉' : '보통',
  })
  predictions.push({
    trait: '묵직함',
    level: Math.min(1, (r.butter ?? 100) / 120),
    desc: (r.butter ?? 100) > 105 ? '묵직한 식감' : '균형',
  })

  if ((r.sourCream ?? 0) === 0 && (r.milk ?? 0) === 0)
    recommendations.push('💡 사워크림 +20% 또는 우유 +10% → 촉촉함 ↑')
  if ((r.bakingPowder ?? 0) > 3)
    recommendations.push('💡 베이킹파우더는 2% 권장 (1:1:1:1 클래식 기준)')
  recommendations.push('💡 버터·계란 모두 실온 (18~22°C) → 분리 방지')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 쿠키
// ─────────────────────────────────────────────────────────────
function diagnoseCookie(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  const flour = r.flour ?? 100
  const butter = r.butter ?? 0
  const brown = r.brownSugar ?? 0
  const white = r.whiteSugar ?? 0
  const totalSugar = brown + white

  const butterFlourRatio = butter / flour
  if (butterFlourRatio > 0.7) {
    warnings.push({
      ingredient: '버터',
      message: '버터 비율 ↑ (70%+). 굽는 중 퍼짐이 큼.',
      severity: 'caution',
    })
    predictions.push({ trait: '퍼짐', level: 0.9, desc: '큼 (냉장 휴지 권장)' })
  } else if (butterFlourRatio < 0.5) {
    predictions.push({ trait: '퍼짐', level: 0.3, desc: '작음 (두꺼운 식감)' })
  } else {
    predictions.push({ trait: '퍼짐', level: 0.6, desc: '보통' })
  }

  if (totalSugar > 0) {
    const brownRatio = brown / totalSugar
    if (brownRatio > 0.7) {
      predictions.push({ trait: '식감', level: 0.8, desc: '쫀득 (황설탕 ↑)' })
    } else if (brownRatio < 0.3) {
      predictions.push({ trait: '식감', level: 0.3, desc: '바삭 (백설탕 ↑)' })
    } else {
      predictions.push({ trait: '식감', level: 0.6, desc: '균형 (쫀득+바삭)' })
    }
  }

  predictions.push({
    trait: '단맛',
    level: Math.min(1, totalSugar / 100),
    desc: totalSugar > 80 ? '강함' : totalSugar < 50 ? '덜 단' : '적당',
  })

  if (butterFlourRatio > 0.7) recommendations.push('💡 냉장 휴지 30분~1시간 권장 (퍼짐 ↓)')
  if (totalSugar > 80) recommendations.push('💡 단맛 강함 → 소금 0.7% 추가 시 균형')
  if ((r.bakingSoda ?? 0) > 1.2) recommendations.push('💡 베이킹소다 ↓ → 베이킹파우더로 일부 대체')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 머핀
// ─────────────────────────────────────────────────────────────
function diagnoseMuffin(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  const liquid = (r.milk ?? 0) + (r.oil ?? 0) + (r.egg ?? 0) * 0.5
  warnings.push(...checkRange(r, 'sugar', [50, 100], '설탕',
    '설탕 ↑. 단맛 강·갈변 빠름.',
    '설탕 ↓. 푸석할 수 있음.'))
  if ((r.bakingPowder ?? 0) > 5) warnings.push({
    ingredient: '베이킹파우더',
    message: '⚠️ 베이킹파우더 과다. 쓴맛 가능.',
    severity: 'warning',
  })

  predictions.push({
    trait: '촉촉함',
    level: Math.min(1, liquid / 220),
    desc: liquid > 180 ? '매우 촉촉' : liquid < 140 ? '건조 가능' : '보통',
  })
  predictions.push({
    trait: '단맛',
    level: Math.min(1, (r.sugar ?? 70) / 100),
    desc: (r.sugar ?? 70) > 80 ? '강함' : (r.sugar ?? 70) < 60 ? '덜 단' : '적당',
  })
  predictions.push({
    trait: '부풀기',
    level: Math.min(1, (r.bakingPowder ?? 4) / 5),
    desc: (r.bakingPowder ?? 4) >= 3.5 ? '잘 부풂' : '보통',
  })

  if (liquid < 150) recommendations.push('💡 우유 +10~20% → 촉촉함 ↑')
  recommendations.push('💡 가루+액체 따로 섞고 합칠 때 10초만 (글루텐 X)')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 마카롱
// ─────────────────────────────────────────────────────────────
function diagnoseMacaron(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  const ap = r.almondPowder ?? 130
  const ps = r.powderedSugar ?? 130
  if (Math.abs(ap - ps) > 15) warnings.push({
    ingredient: '아몬드 가루·슈가파우더',
    message: '두 가루 비율 차이 큼. 보통 1:1로 사용.',
    severity: 'caution',
  })
  if (ap < 110) warnings.push({
    ingredient: '아몬드 가루',
    message: '아몬드 가루 ↓. 표면 갈라짐 위험.',
    severity: 'warning',
  })

  predictions.push({
    trait: '머랭 안정성',
    level: Math.min(1, (r.sugar ?? 100) / 110),
    desc: (r.sugar ?? 100) >= 100 ? '안정' : '불안정 위험',
  })
  predictions.push({
    trait: '표면 매끈',
    level: ap >= 120 && ap <= 135 ? 0.9 : 0.5,
    desc: ap >= 120 && ap <= 135 ? '매끈' : '균열 가능',
  })

  recommendations.push('💡 흰자는 실온 1일 이상 숙성 → 머랭 안정성 ↑')
  recommendations.push('💡 마카로나주 (반죽 섞기) 30~40회 → 리본 형태')
  recommendations.push('💡 팬닝 후 실온 30~60분 건조 → 표면 막')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 스콘
// ─────────────────────────────────────────────────────────────
function diagnoseScone(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  warnings.push(...checkRange(r, 'butter', [25, 50], '버터',
    '버터 ↑. 너무 부드럽고 무거움.',
    '버터 ↓. 결이 안 살아남.'))

  predictions.push({
    trait: '결',
    level: Math.min(1, (r.butter ?? 35) / 50),
    desc: (r.butter ?? 35) >= 30 ? '결대로 부서짐' : '약함',
  })
  predictions.push({
    trait: '단맛',
    level: Math.min(1, (r.sugar ?? 15) / 30),
    desc: (r.sugar ?? 15) > 20 ? '단 편' : (r.sugar ?? 15) < 12 ? '덜 단' : '적당',
  })

  recommendations.push('💡 버터는 차가운 상태 (5°C 이하)로 콩알 크기로 섞기')
  recommendations.push('💡 반죽은 최소 → 글루텐 막으면 부서짐 ↓')
  recommendations.push('💡 굽기 전 윗면에 우유·계란물 → 광택')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 휘낭시에
// ─────────────────────────────────────────────────────────────
function diagnoseFinancier(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  if ((r.brownButter ?? 0) < 70) warnings.push({
    ingredient: '브라운 버터',
    message: '브라운 버터 ↓. 휘낭시에 풍미 핵심이 약해짐.',
    severity: 'warning',
  })

  predictions.push({
    trait: '풍미',
    level: Math.min(1, ((r.brownButter ?? 90) + (r.honey ?? 10)) / 110),
    desc: (r.brownButter ?? 90) >= 90 ? '진한 견과 풍미' : '약함',
  })
  predictions.push({
    trait: '촉촉함',
    level: Math.min(1, (r.brownButter ?? 90) / 100),
    desc: '균형',
  })

  recommendations.push('💡 버터는 갈색까지 가열 (뵈르 누아제트) → 견과 풍미')
  recommendations.push('💡 반죽 1일 냉장 숙성 → 풍미 ↑↑')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 카스테라
// ─────────────────────────────────────────────────────────────
function diagnoseCastella(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  if ((r.honey ?? 0) < 10) warnings.push({
    ingredient: '꿀',
    message: '꿀 ↓. 카스테라 특유의 촉촉·진한 풍미 ↓.',
    severity: 'caution',
  })

  predictions.push({
    trait: '촉촉함',
    level: Math.min(1, ((r.honey ?? 15) + (r.mizame ?? 5) + (r.milk ?? 10)) / 40),
    desc: '촉촉',
  })
  predictions.push({
    trait: '결의 곱기',
    level: Math.min(1, (r.flour ?? 45) / 55),
    desc: '곱고 부드러움',
  })

  recommendations.push('💡 강력분 사용 → 글루텐으로 결 형성')
  recommendations.push('💡 계란 거품은 따뜻하게 (40°C) → 안정성 ↑')
  recommendations.push('💡 굽고 식힌 뒤 1일 숙성 → 풍미 ↑·결 안정')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 브라우니
// ─────────────────────────────────────────────────────────────
function diagnoseBrownie(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  const flour = r.flour ?? 40
  if (flour < 35) predictions.push({ trait: '식감', level: 0.9, desc: '진한 fudgy' })
  else if (flour > 45) predictions.push({ trait: '식감', level: 0.4, desc: '케이크형 (fluffy)' })
  else predictions.push({ trait: '식감', level: 0.65, desc: '균형 fudgy' })

  predictions.push({
    trait: '단맛',
    level: Math.min(1, (r.sugar ?? 100) / 130),
    desc: (r.sugar ?? 100) > 110 ? '매우 강함' : '진함',
  })
  predictions.push({
    trait: '초콜릿 진함',
    level: Math.min(1, ((r.chocolate ?? 100) + (r.cocoa ?? 10) * 2) / 130),
    desc: '진함',
  })

  recommendations.push('💡 다크 초콜릿(70%+) 사용 → 진한 풍미')
  recommendations.push('💡 굽고 충분히 식힌 뒤 자르기 → 깔끔한 단면')
  if (flour > 45) recommendations.push('💡 fudgy 원하면 밀가루 30~40%까지 ↓')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 커스터드
// ─────────────────────────────────────────────────────────────
function diagnoseCustard(r: Partial<Record<IngredientKey, number>>): Diagnosis {
  const warnings: Warning[] = []
  const predictions: Prediction[] = []
  const recommendations: string[] = []

  warnings.push(...checkRange(r, 'cornStarch', [4, 8], '옥수수 전분',
    '전분 ↑. 너무 단단할 수 있음.',
    '전분 ↓. 흐를 수 있음.'))
  warnings.push(...checkRange(r, 'eggYolk', [10, 22], '노른자',
    '노른자 ↑. 진한 풍미·단단함.',
    '노른자 ↓. 풍미 약함·묽음.', 'info'))

  predictions.push({
    trait: '농도',
    level: Math.min(1, ((r.cornStarch ?? 6) + (r.eggYolk ?? 15) * 0.3) / 12),
    desc: (r.cornStarch ?? 6) >= 6 ? '되직함' : '묽음',
  })
  predictions.push({
    trait: '풍미',
    level: Math.min(1, ((r.eggYolk ?? 15) + (r.butter ?? 5)) / 25),
    desc: '진함',
  })

  recommendations.push('💡 우유 데울 때 끓이지 말고 김 올라올 정도까지')
  recommendations.push('💡 노른자에 설탕·전분 먼저 섞고, 따뜻한 우유 천천히 부어 템퍼링')
  recommendations.push('💡 만든 직후 표면에 랩 밀착 → 막 형성 방지')

  return { warnings, predictions, recommendations }
}

// ─────────────────────────────────────────────────────────────
// 디스패처
// ─────────────────────────────────────────────────────────────
export function diagnose(itemId: string, ratios: Partial<Record<IngredientKey, number>>): Diagnosis {
  switch (itemId) {
    case 'madeleine': return diagnoseMadeleine(ratios)
    case 'poundcake': return diagnosePoundcake(ratios)
    case 'cookie':    return diagnoseCookie(ratios)
    case 'muffin':    return diagnoseMuffin(ratios)
    case 'macaron':   return diagnoseMacaron(ratios)
    case 'scone':     return diagnoseScone(ratios)
    case 'financier': return diagnoseFinancier(ratios)
    case 'castella':  return diagnoseCastella(ratios)
    case 'brownie':   return diagnoseBrownie(ratios)
    case 'custard':   return diagnoseCustard(ratios)
    default: return { warnings: [], predictions: [], recommendations: [] }
  }
}

// ─────────────────────────────────────────────────────────────
// 식감 보정 — 슬라이더 조정값
// ─────────────────────────────────────────────────────────────
export interface TextureAdjust {
  id: string
  label: string
  apply: (r: Partial<Record<IngredientKey, number>>) => Partial<Record<IngredientKey, number>>
}

export const TEXTURE_ADJUSTS: Record<string, TextureAdjust[]> = {
  madeleine: [
    { id: 'moist', label: '더 촉촉하게 (꿀 +5, 버터 +5)',
      apply: (r) => ({ ...r, honey: (r.honey ?? 10) + 5, butter: (r.butter ?? 100) + 5 }) },
    { id: 'rich', label: '더 진하게 (버터 +10, 꿀 +5)',
      apply: (r) => ({ ...r, butter: (r.butter ?? 100) + 10, honey: (r.honey ?? 10) + 5 }) },
    { id: 'lessSweet', label: '덜 달게 (설탕 -10)',
      apply: (r) => ({ ...r, sugar: Math.max(0, (r.sugar ?? 100) - 10) }) },
    { id: 'buttery', label: '더 버터리하게 (버터 +10)',
      apply: (r) => ({ ...r, butter: (r.butter ?? 100) + 10 }) },
  ],
  cookie: [
    { id: 'crisp', label: '더 바삭하게 (백설탕 ↑·황설탕 ↓)',
      apply: (r) => ({ ...r, whiteSugar: (r.whiteSugar ?? 25) + 10, brownSugar: Math.max(0, (r.brownSugar ?? 50) - 10) }) },
    { id: 'chewy', label: '더 쫀득하게 (황설탕 ↑·백설탕 ↓)',
      apply: (r) => ({ ...r, brownSugar: (r.brownSugar ?? 50) + 10, whiteSugar: Math.max(0, (r.whiteSugar ?? 25) - 10) }) },
    { id: 'lessSpread', label: '퍼짐 줄이기 (밀가루 +10·버터 -5)',
      apply: (r) => ({ ...r, flour: (r.flour ?? 100) + 10, butter: Math.max(0, (r.butter ?? 65) - 5) }) },
    { id: 'thicker', label: '더 두껍게 (베이킹소다 -0.3)',
      apply: (r) => ({ ...r, bakingSoda: Math.max(0, (r.bakingSoda ?? 1) - 0.3) }) },
  ],
  poundcake: [
    { id: 'classic', label: '클래식 (1:1:1:1)',
      apply: (r) => ({ ...r, butter: 100, sugar: 100, egg: 100, flour: 100, sourCream: 0, milk: 0 }) },
    { id: 'lessSweet', label: '덜 단 (설탕 80%)',
      apply: (r) => ({ ...r, sugar: 80 }) },
    { id: 'moist', label: '촉촉한 (사워크림 +20%)',
      apply: (r) => ({ ...r, sourCream: 20 }) },
    { id: 'heavy', label: '묵직한 (버터 110%)',
      apply: (r) => ({ ...r, butter: 110 }) },
  ],
  muffin: [
    { id: 'moist', label: '더 촉촉하게 (우유 +20)',
      apply: (r) => ({ ...r, milk: (r.milk ?? 80) + 20 }) },
    { id: 'lessSweet', label: '덜 달게 (설탕 -15)',
      apply: (r) => ({ ...r, sugar: Math.max(0, (r.sugar ?? 70) - 15) }) },
    { id: 'fluffy', label: '더 부풀게 (베이킹파우더 +1)',
      apply: (r) => ({ ...r, bakingPowder: (r.bakingPowder ?? 4) + 1 }) },
  ],
  macaron: [
    { id: 'stable', label: '머랭 안정 (설탕 110%)',
      apply: (r) => ({ ...r, sugar: 110 }) },
    { id: 'frenchClassic', label: '프렌치 클래식 (1:1:1)',
      apply: (r) => ({ ...r, almondPowder: 130, powderedSugar: 130, sugar: 100 }) },
  ],
  scone: [
    { id: 'rich', label: '더 진하게 (버터 +10)',
      apply: (r) => ({ ...r, butter: (r.butter ?? 35) + 10 }) },
    { id: 'sweeter', label: '더 달게 (설탕 +5)',
      apply: (r) => ({ ...r, sugar: (r.sugar ?? 15) + 5 }) },
  ],
  financier: [
    { id: 'rich', label: '풍미 ↑ (브라운 버터 +10)',
      apply: (r) => ({ ...r, brownButter: (r.brownButter ?? 90) + 10 }) },
  ],
  castella: [
    { id: 'moist', label: '더 촉촉하게 (꿀 +5)',
      apply: (r) => ({ ...r, honey: (r.honey ?? 15) + 5 }) },
  ],
  brownie: [
    { id: 'fudgy', label: '진한 fudgy (밀가루 -10)',
      apply: (r) => ({ ...r, flour: Math.max(20, (r.flour ?? 40) - 10) }) },
    { id: 'cakey', label: '케이크형 (밀가루 +10)',
      apply: (r) => ({ ...r, flour: (r.flour ?? 40) + 10 }) },
    { id: 'lessSweet', label: '덜 달게 (설탕 -20)',
      apply: (r) => ({ ...r, sugar: Math.max(0, (r.sugar ?? 100) - 20) }) },
  ],
  custard: [
    { id: 'thicker', label: '더 되직 (전분 +2)',
      apply: (r) => ({ ...r, cornStarch: (r.cornStarch ?? 6) + 2 }) },
    { id: 'thinner', label: '더 묽게 (전분 -2)',
      apply: (r) => ({ ...r, cornStarch: Math.max(0, (r.cornStarch ?? 6) - 2) }) },
    { id: 'richer', label: '더 진하게 (노른자 +5)',
      apply: (r) => ({ ...r, eggYolk: (r.eggYolk ?? 15) + 5 }) },
  ],
}

// ─────────────────────────────────────────────────────────────
// 분량 환산 헬퍼
// ─────────────────────────────────────────────────────────────
export function scaleRatios(
  ratios: Partial<Record<IngredientKey, number>>,
  baseKey: IngredientKey,
  baseAmountG: number,
): Partial<Record<IngredientKey, number>> {
  const baseRatio = ratios[baseKey] ?? 100
  const factor = baseAmountG / baseRatio
  const out: Partial<Record<IngredientKey, number>> = {}
  for (const [k, v] of Object.entries(ratios)) {
    if (v != null) out[k as IngredientKey] = v * factor
  }
  return out
}

export function totalWeight(weights: Partial<Record<IngredientKey, number>>): number {
  let sum = 0
  for (const v of Object.values(weights)) {
    if (v != null) sum += v
  }
  return sum
}

// 마크다운 카드 생성
export function buildRecipeMarkdown(
  item: BakingItem,
  ratios: Partial<Record<IngredientKey, number>>,
  weights: Partial<Record<IngredientKey, number>>,
  base: { key: IngredientKey; amount: number },
  ingredientLabel: Record<IngredientKey, string>,
): string {
  const lines: string[] = []
  lines.push(`# ${item.icon} ${item.name}`)
  lines.push('')
  lines.push(`📊 비율 (${ingredientLabel[base.key]} ${base.amount}g 기준)`)
  lines.push('')
  lines.push('| 재료 | 비율 | 무게 |')
  lines.push('|---|---|---|')
  for (const k of Object.keys(ratios)) {
    const key = k as IngredientKey
    const r = ratios[key]
    const w = weights[key]
    if (r == null) continue
    lines.push(`| ${ingredientLabel[key]} | ${r}% | ${w?.toFixed(1)}g |`)
  }
  if (item.bakingTemp) {
    lines.push('')
    lines.push(`🔥 굽기: ${item.bakingTemp.celsius}°C / ${item.bakingTemp.minutes}분`)
    if (item.bakingTemp.drying) lines.push(`💨 건조: ${item.bakingTemp.drying}`)
  }
  lines.push('')
  lines.push(`📌 ${item.notes}`)
  lines.push('')
  lines.push('— youtil.kr / 제과 레시피 계산기')
  return lines.join('\n')
}
