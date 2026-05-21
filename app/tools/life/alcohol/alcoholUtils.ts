// ─────────────────────────────────────────────────────────────
// 알코올 도수 계산기 — 데이터·헬퍼
// ─────────────────────────────────────────────────────────────

export const ALCOHOL_DENSITY = 0.7893  // 에탄올 밀도 g/ml (정밀)
export const STANDARD_DRINK_G = 8      // 한국 1표준잔 = 알코올 8g
export const KCAL_PER_G_ALCOHOL = 7    // 알코올 1g = 7 kcal

// ─────────────────────────────────────────────────────────────
// 한국 잔·병 프리셋 (10 잔 + 6 병/캔)
// ─────────────────────────────────────────────────────────────
export type GlassPreset = {
  id: string
  name: string
  ml: number
  abv: number | null
  icon: string
  group: 'glass' | 'bottle'
  desc: string
}

export const KOREAN_GLASS_PRESETS: GlassPreset[] = [
  // ── 잔 ──
  { id: 'soju-glass',     name: '소주잔',         ml: 50,  abv: 16,   icon: '🍶', group: 'glass', desc: '한국 소주잔 표준 50ml' },
  { id: 'beer-glass-300', name: '맥주잔 (작은)',  ml: 300, abv: 4.5,  icon: '🍺', group: 'glass', desc: '생맥주 300cc' },
  { id: 'beer-glass-500', name: '맥주잔 (큰)',    ml: 500, abv: 4.5,  icon: '🍺', group: 'glass', desc: '생맥주 500cc' },
  { id: 'whisky-shot',    name: '양주 샷',        ml: 30,  abv: 40,   icon: '🥃', group: 'glass', desc: '샷글래스 30ml' },
  { id: 'whisky-1oz',     name: '양주 1온스',     ml: 45,  abv: 40,   icon: '🥃', group: 'glass', desc: '1온스 45ml' },
  { id: 'highball-glass', name: '하이볼잔',       ml: 300, abv: null, icon: '🍹', group: 'glass', desc: '하이볼·진토닉 300ml' },
  { id: 'wine-glass',     name: '와인잔',         ml: 150, abv: 13,   icon: '🍷', group: 'glass', desc: '와인 표준 150ml' },
  { id: 'makgeolli-bowl', name: '막걸리 사발',    ml: 200, abv: 6,    icon: '🥣', group: 'glass', desc: '막걸리 사발 200ml' },
  { id: 'paper-cup',      name: '종이컵',         ml: 180, abv: null, icon: '🥤', group: 'glass', desc: '한국 종이컵 표준 180ml' },
  { id: 'sake-cup',       name: '사케 잔',        ml: 60,  abv: 15,   icon: '🍶', group: 'glass', desc: '오쵸코 60ml' },

  // ── 병/캔 ──
  { id: 'soju-bottle',      name: '소주 1병',     ml: 360, abv: 16,   icon: '🍶', group: 'bottle', desc: '하이트진로·롯데 표준' },
  { id: 'beer-can',         name: '맥주 1캔',     ml: 500, abv: 4.5,  icon: '🥫', group: 'bottle', desc: '카스·하이트·테라' },
  { id: 'beer-bottle',      name: '맥주 1병',     ml: 500, abv: 4.5,  icon: '🍺', group: 'bottle', desc: '병맥주 500ml' },
  { id: 'makgeolli-bottle', name: '막걸리 1병',   ml: 750, abv: 6,    icon: '🍶', group: 'bottle', desc: '750ml 표준' },
  { id: 'wine-bottle',      name: '와인 1병',     ml: 750, abv: 13,   icon: '🍷', group: 'bottle', desc: '750ml 표준' },
  { id: 'whisky-bottle',    name: '위스키 1병',   ml: 700, abv: 40,   icon: '🥃', group: 'bottle', desc: '700ml 표준' },
]

// ─────────────────────────────────────────────────────────────
// 희석 재료 (11종)
// ─────────────────────────────────────────────────────────────
export type DilutionOption = {
  id: string
  name: string
  abv: number
  desc: string
}

export const DILUTION_OPTIONS: DilutionOption[] = [
  { id: 'water',        name: '💧 물',          abv: 0,   desc: '가장 일반적' },
  { id: 'sparkling',    name: '🫧 탄산수',      abv: 0,   desc: '하이볼 베이스' },
  { id: 'tonic',        name: '🍋 토닉워터',    abv: 0,   desc: '진토닉용 (당분 ↑)' },
  { id: 'ginger-ale',   name: '🍯 진저에일',    abv: 0,   desc: '하이볼 응용' },
  { id: 'cola',         name: '🥤 콜라',        abv: 0,   desc: '잭콕 등 (당분 ↑)' },
  { id: 'sprite',       name: '🥤 사이다',      abv: 0,   desc: '단맛 칵테일' },
  { id: 'green-tea',    name: '🍵 녹차',        abv: 0,   desc: '녹차 하이볼' },
  { id: 'oolong',       name: '🫖 우롱차',      abv: 0,   desc: '우롱하이' },
  { id: 'orange-juice', name: '🍊 오렌지주스',  abv: 0,   desc: '스크류드라이버 (당분 ↑)' },
  { id: 'milk',         name: '🥛 우유',        abv: 0,   desc: '칼루아밀크' },
  { id: 'beer',         name: '🍺 맥주 (4.5%)', abv: 4.5, desc: '소맥용 (도수 있음)' },
]

// ─────────────────────────────────────────────────────────────
// 인기 한국 칵테일 프리셋
// ─────────────────────────────────────────────────────────────
export type CocktailPreset = {
  id: string
  name: string
  emoji: string
  base: { ml: number; abv: number; label: string }
  mixer: { ml: number; abv: number; label: string }
  desc: string
}

export const KOREAN_COCKTAIL_PRESETS: CocktailPreset[] = [
  { id: 'highball', name: '하이볼 (위스키)', emoji: '🥃',
    base:  { ml: 30, abv: 40, label: '위스키' },
    mixer: { ml: 270, abv: 0, label: '탄산수' },
    desc: '위스키 + 탄산수 (1:9) — 표준 하이볼 약 4%' },
  { id: 'gin-tonic', name: '진토닉', emoji: '🍸',
    base:  { ml: 45, abv: 40, label: '진' },
    mixer: { ml: 200, abv: 0, label: '토닉워터' },
    desc: '진 + 토닉 (1:4.4) — 약 7.3%' },
  { id: 'jack-coke', name: '잭콕', emoji: '🥃',
    base:  { ml: 30, abv: 40, label: '잭다니엘' },
    mixer: { ml: 200, abv: 0, label: '콜라' },
    desc: '잭다니엘 + 콜라 — 약 5.2%' },
  { id: 'screw-driver', name: '스크류드라이버', emoji: '🍊',
    base:  { ml: 30, abv: 40, label: '보드카' },
    mixer: { ml: 200, abv: 0, label: '오렌지주스' },
    desc: '보드카 + 오렌지주스 — 약 5.2%' },
  { id: 'somaek-gold', name: '소맥 황금비율 (1:8)', emoji: '🍻',
    base:  { ml: 50,  abv: 16,  label: '소주' },
    mixer: { ml: 400, abv: 4.5, label: '맥주' },
    desc: '소주 50ml + 맥주 400ml — 약 5.78%' },
  { id: 'somaek-strong', name: '소맥 진하게 (1:5)', emoji: '🍻',
    base:  { ml: 60,  abv: 16,  label: '소주' },
    mixer: { ml: 300, abv: 4.5, label: '맥주' },
    desc: '소주 60ml + 맥주 300ml — 약 6.4%' },
]

// ─────────────────────────────────────────────────────────────
// 한국 소주 도수 (제품별)
// ─────────────────────────────────────────────────────────────
export const SOJU_BRANDS = [
  { brand: '진로 이즈백',     abv: 16   },
  { brand: '처음처럼',         abv: 16.5 },
  { brand: '좋은데이',         abv: 16.5 },
  { brand: '화이트',           abv: 16.5 },
  { brand: '처음처럼 빨간뚜껑', abv: 16.9 },
  { brand: '진로 (오리지널)',   abv: 17.5 },
  { brand: '한라산',           abv: 25   },
]

export const BEER_BRANDS = [
  { brand: '카스 (4.5%)', abv: 4.5 },
  { brand: '하이트 (4.5%)', abv: 4.5 },
  { brand: '테라 (4.6%)', abv: 4.6 },
  { brand: '클라우드 (5%)', abv: 5.0 },
  { brand: '필라이트 (4.5%)', abv: 4.5 },
  { brand: '스텔라 (5.2%)', abv: 5.2 },
  { brand: '호가든 (4.9%)', abv: 4.9 },
  { brand: '기네스 (4.2%)', abv: 4.2 },
]

// ─────────────────────────────────────────────────────────────
// 계산 헬퍼
// ─────────────────────────────────────────────────────────────
export function calcAlcohol(volumeMl: number, abv: number) {
  const alcoholMl = volumeMl * (abv / 100)
  const alcoholG = alcoholMl * ALCOHOL_DENSITY
  return {
    alcoholMl: Math.round(alcoholMl * 10) / 10,
    alcoholG:  Math.round(alcoholG * 10) / 10,
    standard:  Math.round((alcoholG / STANDARD_DRINK_G) * 100) / 100,
    kcal:      Math.round(alcoholG * KCAL_PER_G_ALCOHOL),
  }
}

export function gToMl(alcoholG: number): number {
  return alcoholG / ALCOHOL_DENSITY
}

// 목표 도수 희석량 계산
export function calcDilutionAmount(args: {
  originalMl: number
  originalAbv: number
  targetAbv: number
  dilutionAbv: number
}): { dilutionMl: number; totalMl: number; finalAbv: number } | null {
  const { originalMl, originalAbv, targetAbv, dilutionAbv } = args
  if (originalMl <= 0 || originalAbv <= 0) return null
  if (targetAbv >= originalAbv) return null   // 희석으로 도수 ↑ 불가
  if (targetAbv <= dilutionAbv) return null   // 희석재료 도수 ≥ 목표 → 불가

  const dilutionMl = (originalMl * (originalAbv - targetAbv)) / (targetAbv - dilutionAbv)
  const totalMl = originalMl + dilutionMl
  return {
    dilutionMl: Math.round(dilutionMl),
    totalMl:    Math.round(totalMl),
    finalAbv:   targetAbv,
  }
}

// ─────────────────────────────────────────────────────────────
// 같은 알코올량 환산 표
// ─────────────────────────────────────────────────────────────
export type EquivItem = {
  name: string
  emoji: string
  abv: number
  unitMl: number
  unitLabel: string
}

export const EQUIV_TARGETS: EquivItem[] = [
  { name: '소주',     emoji: '🍶', abv: 16,   unitMl: 50,  unitLabel: '소주잔' },
  { name: '맥주',     emoji: '🍺', abv: 4.5,  unitMl: 500, unitLabel: '캔(500ml)' },
  { name: '와인',     emoji: '🍷', abv: 13,   unitMl: 150, unitLabel: '와인잔' },
  { name: '위스키',   emoji: '🥃', abv: 40,   unitMl: 30,  unitLabel: '샷(30ml)' },
  { name: '막걸리',   emoji: '🥣', abv: 6,    unitMl: 200, unitLabel: '사발' },
  { name: '사케',     emoji: '🍶', abv: 15,   unitMl: 60,  unitLabel: '오쵸코' },
  { name: '하이볼',   emoji: '🍹', abv: 7,    unitMl: 300, unitLabel: '하이볼잔' },
]

export function equivConvert(alcoholG: number, target: EquivItem) {
  const ml = (alcoholG / ALCOHOL_DENSITY) * (100 / target.abv)
  const units = ml / target.unitMl
  return {
    ml: Math.round(ml),
    units: Math.round(units * 100) / 100,
  }
}

// ─────────────────────────────────────────────────────────────
// 저위험 음주 가이드
// ─────────────────────────────────────────────────────────────
// 한국 보건복지부 저위험 음주 (1일 기준)
export const KOREAN_DAILY_LOW_RISK_G = { male: 32, female: 16 }
// 한국 보건복지부 권고 (주간 표준잔)
export const KOREAN_WEEKLY_LOW_RISK_STD = { male: 14, female: 7 }

export function riskLevel(alcoholG: number, sex: 'male' | 'female'): {
  level: 'safe' | 'caution' | 'high' | 'very-high'
  pct: number
  label: string
  color: string
} {
  const limit = sex === 'male' ? KOREAN_DAILY_LOW_RISK_G.male : KOREAN_DAILY_LOW_RISK_G.female
  const pct = Math.round((alcoholG / limit) * 100)
  if (pct <= 50)  return { level: 'safe',      pct, label: '🟢 적정',         color: '#059669' }
  if (pct <= 100) return { level: 'caution',   pct, label: '🟡 권장 한도 근접', color: '#FFD93E' }
  if (pct <= 200) return { level: 'high',      pct, label: '🟠 큰 폭 초과',    color: '#EA580C' }
  return                  { level: 'very-high', pct, label: '🔴 위험 음주',    color: '#DC2626' }
}

// ─────────────────────────────────────────────────────────────
// 포맷터
// ─────────────────────────────────────────────────────────────
export function fmtMl(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)}L (${Math.round(ml)}ml)`
  return `${Math.round(ml)}ml`
}
