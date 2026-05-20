/* ──────────────────────────────────────────────────────
   cooking/thawing/thawingUtils.ts
   냉동·해동 — 위험도 평가·식품별 팁·전자레인지 W·인기 프리셋
   ※ 식품 안전 일반 가이드. 의심스러운 식품은 폐기 권장.
   식약처 식품안전정보 1399 / foodsafetykorea.go.kr
   ────────────────────────────────────────────────────── */

export type FoodKey = 'beef_pork' | 'chicken' | 'fish' | 'vegetable' | 'bread' | 'cooked'
export type Method = 'fridge' | 'water' | 'room' | 'micro'

/* ─── 식품별 조리 팁 (5~6개) ─── */
export interface FoodTipDetail {
  key: FoodKey
  emoji: string
  name: string
  tips: string[]
  cookingHours: number   // 해동 후 조리 권장 시간
  isHighRisk: boolean    // 살모넬라·캠필로박터 등 고위험
}

export const FOOD_TIPS: FoodTipDetail[] = [
  { key: 'beef_pork', emoji: '🥩', name: '소·돼지고기', isHighRisk: false, cookingHours: 24, tips: [
    '🧻 해동 후 키친타올로 표면 수분 제거 (육즙 빠짐 방지)',
    '🌡️ 굽기 전 10~20분 실온 적응 (스테이크 균등 익힘) — 단 1시간 이상 X',
    '📏 두꺼운 부위 (5cm+) 중심부 해동 확인 (찔러서 차가운 느낌 X)',
    '⏰ 해동 후 24시간 내 조리 권장',
    '🔪 도마는 채소·과일과 분리 (교차오염)',
  ] },
  { key: 'chicken', emoji: '🍗', name: '닭·가금류', isHighRisk: true, cookingHours: 12, tips: [
    '⚠️ 살모넬라·캠필로박터 위험 (가장 주의)',
    '🔪 도마·칼 별도 사용·즉시 세척 (교차오염 핵심)',
    '💧 찬물 해동 시 반드시 밀봉 (지퍼백 이중)',
    '🌡️ 중심부 75°C 이상 충분히 가열 (분홍빛 X)',
    '⏰ 해동 후 12시간 내 조리 권장',
    '🧼 손 세척 (해동 전·후, 30초 이상 비누)',
  ] },
  { key: 'fish', emoji: '🐟', name: '생선·해산물', isHighRisk: true, cookingHours: 24, tips: [
    '🧊 냉장 해동 권장 (식감·맛 유지)',
    '🧻 수분 제거 후 조리 (튀김·구이 시 기름 튐 방지)',
    '🍋 비린내 줄이기: 우유·청주·식초·레몬 5분',
    '⚡ 전자레인지 해동 X (식감 손상 큼)',
    '⏰ 해동 후 24시간 내 조리',
    '⚠️ 회·생선회는 해동 후 즉시 (부패 빠름)',
  ] },
  { key: 'vegetable', emoji: '🥦', name: '채소·과일', isHighRisk: false, cookingHours: 48, tips: [
    '🥦 대부분 냉동 상태로 바로 조리 가능',
    '🚫 실온 해동 X (수분 빠지면 식감 손상)',
    '💨 냉동 채소는 끓는 물·기름에 바로 (해동 X)',
    '🍅 토마토·과일은 스무디·요리용 (식감 변함)',
    '⏰ 해동 후 1~2일 내 조리',
  ] },
  { key: 'bread', emoji: '🍞', name: '빵·반죽', isHighRisk: false, cookingHours: 6, tips: [
    '🍞 식빵·바게트: 실온 30분~1시간 또는 토스터 직접',
    '🥐 크루아상·페이스트리: 200°C 오븐 5분',
    '🥟 만두 반죽: 냉장 해동 후 발효 상태 확인',
    '🥖 발효 반죽: 냉장 해동 후 실온 발효 시간 추가',
    '⏰ 해동 후 즉시 조리·섭취',
  ] },
  { key: 'cooked', emoji: '🍱', name: '조리된 음식', isHighRisk: true, cookingHours: 24, tips: [
    '🌡️ 재가열 시 중심부 74°C 이상 (식약처 권장)',
    '🍲 국·찌개: 약불 천천히 끓임 (충분히 펄펄)',
    '🍚 밥: 전자레인지 1~2분 + 물 1큰술 (촉촉)',
    '🥗 반찬: 찜기·전자레인지 (덮개)',
    '⏰ 재가열 후 즉시 섭취 (재냉동 X)',
    '⚠️ 2시간 이상 실온 방치 후 폐기',
  ] },
]

/* ─── 위험도 평가 ─── */
export type RiskLevel = 'safe' | 'caution' | 'warning' | 'danger'

export interface RiskInput {
  foodKey: FoodKey
  thicknessCm: number
  weightG: number
  method: Method
  expectedHours: number
}

export interface RiskFactor {
  icon: string   // 🟢🟡🟠🔴
  label: string
  status: string
}

export interface RiskResult {
  level: RiskLevel
  levelLabel: string
  levelColor: string
  factors: RiskFactor[]
  recommendation: string
  score: number
}

const HIGH_RISK_FOODS: FoodKey[] = ['chicken', 'fish', 'cooked']

export function evaluateRisk(input: RiskInput): RiskResult {
  let score = 0
  const factors: RiskFactor[] = []
  const food = FOOD_TIPS.find(f => f.key === input.foodKey)

  // 1. 해동 방법
  if (input.method === 'fridge') {
    factors.push({ icon: '🟢', label: '해동 방법', status: '냉장 (가장 안전)' })
  } else if (input.method === 'water') {
    factors.push({ icon: '🟡', label: '해동 방법', status: '찬물 (밀봉 필수)' })
    score += 1
  } else if (input.method === 'micro') {
    factors.push({ icon: '🟡', label: '해동 방법', status: '전자레인지 (즉시 조리)' })
    score += 1
  } else {
    factors.push({ icon: '🔴', label: '해동 방법', status: '실온 (비권장)' })
    score += 3
  }

  // 2. 식품 종류
  if (food && food.isHighRisk) {
    factors.push({ icon: '🟡', label: '식품 종류', status: `${food.name} (고위험)` })
    score += 1
  } else if (food) {
    factors.push({ icon: '🟢', label: '식품 종류', status: `${food.name} (일반)` })
  }

  // 3. 두께
  if (input.thicknessCm > 7) {
    factors.push({ icon: '🟠', label: '두께', status: `${input.thicknessCm}cm (덩어리, 균등 해동 어려움)` })
    score += 2
  } else if (input.thicknessCm > 5) {
    factors.push({ icon: '🟡', label: '두께', status: `${input.thicknessCm}cm (표면·중심 차이)` })
    score += 1
  } else {
    factors.push({ icon: '🟢', label: '두께', status: `${input.thicknessCm}cm (적정)` })
  }

  // 4. 위험 온도대 노출
  if (input.method === 'room' && input.expectedHours > 2) {
    factors.push({ icon: '🔴', label: '위험 온도대 (4~60°C)', status: `${input.expectedHours.toFixed(1)}시간 (2시간 초과)` })
    score += 3
  } else if (input.method === 'water' && input.expectedHours > 2) {
    factors.push({ icon: '🟡', label: '위험 온도대', status: `찬물 ${input.expectedHours.toFixed(1)}시간` })
    score += 1
  } else {
    factors.push({ icon: '🟢', label: '위험 온도대', status: '안전 범위' })
  }

  // 5. 위험 조합 (닭/생선 + 실온, 다진 고기 등)
  if (food && food.isHighRisk && input.method === 'room') {
    factors.push({ icon: '🔴', label: '치명적 조합', status: `${food.name} + 실온 = 식중독 위험 매우 큼` })
    score += 3
  }

  let level: RiskLevel
  let levelLabel: string
  let levelColor: string
  let recommendation: string
  if (score === 0) {
    level = 'safe'; levelLabel = '🟢 안전'; levelColor = '#3EFF9B'
    recommendation = '안전한 해동 조건입니다. 식품 안전 가이드를 따라 진행하세요.'
  } else if (score <= 2) {
    level = 'caution'; levelLabel = '🟡 주의'; levelColor = '#FFD700'
    recommendation = '약간의 주의가 필요합니다. 권장 사항을 따라 진행하세요.'
  } else if (score <= 4) {
    level = 'warning'; levelLabel = '🟠 위험'; levelColor = '#FF8C3E'
    recommendation = '위험 요소가 있습니다. 다른 해동 방법 (냉장 또는 찬물) 검토를 권장합니다.'
  } else {
    level = 'danger'; levelLabel = '🔴 매우 위험'; levelColor = '#FF6B6B'
    recommendation = '매우 위험. 냉장 또는 찬물 해동으로 변경 강력 권장. 의심스러우면 폐기 권장.'
  }

  return { level, levelLabel, levelColor, factors, recommendation, score }
}

/* ─── 전자레인지 출력별 보정 ─── */
export interface MicrowavePower {
  id: string
  power: number
  name: string
  factor: number
}

export const MICROWAVE_POWERS: MicrowavePower[] = [
  { id: '700',  power: 700,  name: '700W (소형·구식)',  factor: 900 / 700 },
  { id: '900',  power: 900,  name: '900W (한국 표준) ⭐', factor: 1.0 },
  { id: '1100', power: 1100, name: '1,100W (대형)',      factor: 900 / 1100 },
  { id: '1500', power: 1500, name: '1,500W (인버터)',    factor: 900 / 1500 },
]

/* ─── 한국 인기 냉동 식품 프리셋 ─── */
export interface FrozenPreset {
  id: string
  emoji: string
  name: string
  foodKey: FoodKey
  weightG: number
  thicknessCm: number
}

export const KOREA_FROZEN_PRESETS: FrozenPreset[] = [
  { id: 'samgyeop',     emoji: '🥓', name: '삼겹살',     foodKey: 'beef_pork', weightG:  600, thicknessCm: 2 },
  { id: 'chickenwhole', emoji: '🍗', name: '닭볶음탕',   foodKey: 'chicken',   weightG: 1000, thicknessCm: 4 },
  { id: 'galbi-2kg',    emoji: '🍖', name: '갈비',       foodKey: 'beef_pork', weightG: 2000, thicknessCm: 5 },
  { id: 'galchi',       emoji: '🐟', name: '갈치',       foodKey: 'fish',      weightG:  500, thicknessCm: 3 },
  { id: 'shrimp',       emoji: '🦐', name: '새우',       foodKey: 'fish',      weightG:  500, thicknessCm: 1 },
  { id: 'squid',        emoji: '🦑', name: '오징어',     foodKey: 'fish',      weightG:  400, thicknessCm: 1 },
  { id: 'bread',        emoji: '🍞', name: '식빵',       foodKey: 'bread',     weightG:  400, thicknessCm: 1 },
  { id: 'rice',         emoji: '🍚', name: '얼린 밥',    foodKey: 'cooked',    weightG:  200, thicknessCm: 3 },
  { id: 'galbi-5kg',    emoji: '🎁', name: '명절 갈비',  foodKey: 'beef_pork', weightG: 5000, thicknessCm: 5 },
]

/* ─── 위험 식품 빠른 경고 ─── */
export interface QuickWarning {
  id: string
  matches: (input: { foodKey: FoodKey; method: Method; thicknessCm: number; expectedHours: number }) => boolean
  message: string
}

export const QUICK_WARNINGS: QuickWarning[] = [
  {
    id: 'high-risk-room',
    matches: x => HIGH_RISK_FOODS.includes(x.foodKey) && x.method === 'room',
    message: '🔴 닭·생선·해산물 + 실온 해동 = 식중독 위험 매우 큼. 냉장 또는 찬물 해동 강력 권장.',
  },
  {
    id: 'thick-room',
    matches: x => x.thicknessCm >= 5 && x.method === 'room',
    message: '🔴 5cm+ 두께 + 실온 = 표면 익음·중심 냉동. 냉장 또는 찬물 해동으로 변경 권장.',
  },
  {
    id: 'cooked-long',
    matches: x => x.foodKey === 'cooked' && x.expectedHours >= 4,
    message: '🔴 조리된 음식 + 4시간+ 노출 = 폐기 권장. 위험 온도대 2시간 규칙 위반.',
  },
  {
    id: 'fish-microwave',
    matches: x => x.foodKey === 'fish' && x.method === 'micro',
    message: '🟠 생선 + 전자레인지 = 식감 손상 큼. 냉장 해동 권장 (식감·맛 유지).',
  },
]

/* ─── 포맷 헬퍼 ─── */
export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}분`
  if (h < 10) {
    const hi = Math.floor(h)
    const mm = Math.round((h - hi) * 60)
    return mm === 0 ? `${hi}시간` : `${hi}시간 ${mm}분`
  }
  return `${Math.round(h * 10) / 10}시간`
}

export function formatMinutes(m: number): string {
  if (m < 60) return `${Math.round(m)}분`
  const h = Math.floor(m / 60)
  const rest = Math.round(m - h * 60)
  return rest === 0 ? `${h}시간` : `${h}시간 ${rest}분`
}

/* ─── 시각 포맷 (ETA) ─── */
export function eta(minutes: number, baseTime?: Date): string {
  const now = baseTime ?? new Date()
  const target = new Date(now.getTime() + minutes * 60 * 1000)
  const sameDay = target.getDate() === now.getDate() && target.getMonth() === now.getMonth()
  const hh = String(target.getHours()).padStart(2, '0')
  const mm = String(target.getMinutes()).padStart(2, '0')
  if (sameDay) return `오늘 ${hh}:${mm}`
  const diffDays = Math.floor((target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / (24 * 60 * 60 * 1000))
  if (diffDays === 1) return `내일 ${hh}:${mm}`
  if (diffDays === -1) return `어제 ${hh}:${mm}`
  if (diffDays < 0) return `${Math.abs(diffDays)}일 전 ${hh}:${mm}`
  return `${target.getMonth() + 1}월 ${target.getDate()}일 ${hh}:${mm}`
}

/* ─── 역산: 조리 시각 → 해동 시작 ─── */
export function reverseStartTime(cookAtHour: number, cookAtMin: number, totalThawingMinutes: number, today = new Date()): {
  startTime: Date
  display: string
  hoursAgo: number
} {
  const cookAt = new Date(today)
  cookAt.setHours(cookAtHour, cookAtMin, 0, 0)
  // 오늘이 지났으면 내일로
  if (cookAt.getTime() < today.getTime()) cookAt.setDate(cookAt.getDate() + 1)

  const startTime = new Date(cookAt.getTime() - totalThawingMinutes * 60 * 1000)
  const hoursAgo = (today.getTime() - startTime.getTime()) / 3600000

  const hh = String(startTime.getHours()).padStart(2, '0')
  const mm = String(startTime.getMinutes()).padStart(2, '0')
  let display: string
  const diffDays = Math.floor((startTime.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / (24 * 60 * 60 * 1000))
  if (diffDays === 0) display = `오늘 ${hh}:${mm}`
  else if (diffDays === 1) display = `내일 ${hh}:${mm}`
  else if (diffDays === -1) display = `어제 ${hh}:${mm}`
  else if (diffDays < 0) display = `${Math.abs(diffDays)}일 전 ${hh}:${mm}`
  else display = `${startTime.getMonth() + 1}월 ${startTime.getDate()}일 ${hh}:${mm}`

  return { startTime, display, hoursAgo }
}
