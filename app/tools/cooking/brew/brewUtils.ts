/* 커피 브루잉 계산기 — 데이터·계산 유틸 */

export type BrewMethod = 'drip' | 'french' | 'aero' | 'cold' | 'moka' | 'espresso'
export type RoastLevel = 'light' | 'medium' | 'dark'
export type InputMode = 'coffee' | 'water' | 'cups'

export interface BrewMethodMeta {
  id: BrewMethod
  emoji: string
  label: string
  shortName: string
  ratioMin: number   // 1:N 의 N
  ratioMax: number
  ratioDefault: number
  tempMin: number    // ℃
  tempMax: number
  timeMin: number    // 초
  timeMax: number
  grind: string      // 분쇄도 비유
  grindEmoji: string
  tdsMin: number     // mg/L (TDS%로 100배)
  tdsMax: number
  tip: string
}

export const BREW_METHODS: BrewMethodMeta[] = [
  {
    id: 'drip',
    emoji: '☕',
    label: '핸드드립 (V60·하리오·칼리타)',
    shortName: '핸드드립',
    ratioMin: 15, ratioMax: 17, ratioDefault: 16,
    tempMin: 90, tempMax: 93,
    timeMin: 150, timeMax: 210,
    grind: '중간 (설탕 입자)',
    grindEmoji: '🧂',
    tdsMin: 1.15, tdsMax: 1.35,
    tip: '드리퍼·종이필터로 깔끔한 추출. 블루밍 30초 → 1차 → 2차 단계 푸어가 표준.',
  },
  {
    id: 'french',
    emoji: '🪶',
    label: '프렌치프레스',
    shortName: '프렌치프레스',
    ratioMin: 15, ratioMax: 17, ratioDefault: 16,
    tempMin: 92, tempMax: 95,
    timeMin: 240, timeMax: 240,
    grind: '굵게 (코셔솔트)',
    grindEmoji: '🧂',
    tdsMin: 1.20, tdsMax: 1.45,
    tip: '4분 침지 후 천천히 플런저 누름. 침전물 적게 따르려면 마지막 1cm 남기기.',
  },
  {
    id: 'aero',
    emoji: '💉',
    label: '에어로프레스',
    shortName: '에어로프레스',
    ratioMin: 13, ratioMax: 15, ratioDefault: 14,
    tempMin: 80, tempMax: 85,
    timeMin: 90, timeMax: 120,
    grind: '중세 (소금 + 설탕 사이)',
    grindEmoji: '🧂',
    tdsMin: 1.30, tdsMax: 1.55,
    tip: '저온·짧은 시간 추출로 산미·단맛 강조. 인버티드 방식도 인기.',
  },
  {
    id: 'cold',
    emoji: '🧊',
    label: '콜드브루',
    shortName: '콜드브루',
    ratioMin: 8, ratioMax: 10, ratioDefault: 9,
    tempMin: 4, tempMax: 22,
    timeMin: 43200, timeMax: 86400,
    grind: '굵게 (코셔솔트)',
    grindEmoji: '🧂',
    tdsMin: 2.0, tdsMax: 3.5,
    tip: '12~24시간 침지 후 필터. 보통 농축액으로 만들고 마실 때 1:1 희석.',
  },
  {
    id: 'moka',
    emoji: '☕',
    label: '모카포트 (비알레티)',
    shortName: '모카포트',
    ratioMin: 7, ratioMax: 10, ratioDefault: 8,
    tempMin: 95, tempMax: 100,
    timeMin: 240, timeMax: 360,
    grind: '매우 가늘게 (밀가루 + 설탕)',
    grindEmoji: '🌾',
    tdsMin: 5.0, tdsMax: 7.0,
    tip: '약불 + 뚜껑 열고 추출 시작 시 즉시 끄기. 탬핑·다지기 X.',
  },
  {
    id: 'espresso',
    emoji: '💪',
    label: '에스프레소',
    shortName: '에스프레소',
    ratioMin: 1.5, ratioMax: 2.5, ratioDefault: 2,
    tempMin: 92, tempMax: 94,
    timeMin: 25, timeMax: 30,
    grind: '매우 가늘게 (밀가루)',
    grindEmoji: '🌾',
    tdsMin: 8.0, tdsMax: 12.0,
    tip: '9bar 압력 + 25~30초 추출이 표준. 비율은 인풋(원두):아웃풋(샷) 기준.',
  },
]

export const getMethod = (id: BrewMethod) => BREW_METHODS.find((m) => m.id === id)!

/* 비율 프리셋 */
export const RATIO_PRESETS = [12, 13, 15, 16, 17, 18, 20] as const

/* 한국 잔 사이즈 프리셋 (ml) */
export interface CupSize {
  id: string
  emoji: string
  label: string
  ml: number
}
export const CUP_SIZES: CupSize[] = [
  { id: 'paper',   emoji: '🥤', label: '종이컵',          ml: 180 },
  { id: 'mug',     emoji: '☕', label: '한국 머그 (표준)',  ml: 250 },
  { id: 'regular', emoji: '🥃', label: '카페 레귤러',      ml: 350 },
  { id: 'tumbler', emoji: '🧋', label: '라지 텀블러',      ml: 500 },
]

/* 로스팅 메타 */
export interface RoastMeta {
  id: RoastLevel
  label: string
  desc: string
  ratioAdjust: string
  color: string
}

export const ROASTS: RoastMeta[] = [
  { id: 'light',  label: '라이트 (시나몬·시티)',     desc: '신맛·꽃향·과일향 강조',         ratioAdjust: '1:14~15 진하게 추출',       color: '#C9A77D' },
  { id: 'medium', label: '미디엄 (시티·풀시티)',     desc: '균형 잡힌 단맛·바디',           ratioAdjust: '1:15~17 (SCA 골든 표준)',    color: '#7B4F2C' },
  { id: 'dark',   label: '다크 (프렌치·이탈리안)',   desc: '쓴맛·캐러멜·초콜릿',            ratioAdjust: '1:16~18 약하게 (쓴맛 완화)', color: '#3A1E10' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** 원두 g → 물 ml */
export const coffeeToWater = (coffeeG: number, ratio: number) => coffeeG * ratio

/** 물 ml → 원두 g */
export const waterToCoffee = (waterMl: number, ratio: number) => ratio > 0 ? waterMl / ratio : 0

/** 잔수 + 1잔 ml → 총 물 ml */
export const cupsToWater = (cups: number, mlPerCup: number) => cups * mlPerCup

/** 시간 포맷: 초 → "M:SS" */
export const fmtTime = (s: number): string => {
  if (s < 60) return `${s}초`
  if (s < 3600) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return sec > 0 ? `${m}분 ${sec}초` : `${m}분`
  }
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

/* ─────────────────────────────────────────────
   푸어 스케줄 (핸드드립용)
   ───────────────────────────────────────────── */

export interface PourStep {
  id: string
  label: string
  emoji: string
  startSec: number
  endSec: number
  waterMl: number
  cumulativeMl: number
  desc: string
  color: string
}

/**
 * 핸드드립 푸어 스케줄
 * 블루밍: 0~30s, 원두 × 2g
 * 1차 푸어: 30~90s, 누적 60%까지
 * 2차 푸어: 90~150s, 누적 100%까지
 * 추출 종료: 150~210s
 */
export function buildPourSchedule(coffeeG: number, totalWaterMl: number): PourStep[] {
  const bloomMl = Math.round(coffeeG * 2)
  const target1st = Math.round(totalWaterMl * 0.6)
  const second1st = Math.max(0, target1st - bloomMl)
  const target2nd = totalWaterMl
  const pour2nd = Math.max(0, target2nd - target1st)

  return [
    {
      id: 'bloom',
      label: '블루밍 (Bloom)',
      emoji: '🌱',
      startSec: 0, endSec: 30,
      waterMl: bloomMl, cumulativeMl: bloomMl,
      desc: `원두 무게 × 2 = ${bloomMl}ml의 물로 적셔 30초 휴지. CO₂ 가스가 빠지며 부풀어요.`,
      color: '#3EFFD0',
    },
    {
      id: 'first',
      label: '1차 푸어',
      emoji: '💧',
      startSec: 30, endSec: 90,
      waterMl: second1st, cumulativeMl: target1st,
      desc: `누적 ${target1st}ml까지 (전체의 60%). 가운데서 원형으로 천천히.`,
      color: '#3EC8FF',
    },
    {
      id: 'second',
      label: '2차 푸어',
      emoji: '💧',
      startSec: 90, endSec: 150,
      waterMl: pour2nd, cumulativeMl: target2nd,
      desc: `누적 ${target2nd}ml까지 (전체의 100%). 안쪽 원만 따라.`,
      color: '#FF8C3E',
    },
    {
      id: 'drain',
      label: '추출 마무리 (Drain)',
      emoji: '⏳',
      startSec: 150, endSec: 210,
      waterMl: 0, cumulativeMl: target2nd,
      desc: '드리퍼의 물이 모두 빠질 때까지 대기. 총 추출 시간 2:30~3:30 권장.',
      color: '#9B59B6',
    },
  ]
}

/* ─────────────────────────────────────────────
   강도 진단 (Brew Ratio Spectrum)
   ───────────────────────────────────────────── */

export interface IntensityZone {
  id: string
  ratioMin: number
  ratioMax: number
  label: string
  emoji: string
  desc: string
  color: string
}

export const INTENSITY_ZONES: IntensityZone[] = [
  { id: 'espresso', ratioMin: 0,  ratioMax: 12, label: '에스프레소 영역',     emoji: '💪', desc: '매우 진함 · 에스프레소·모카포트 영역', color: '#FF3E8C' },
  { id: 'strong',   ratioMin: 12, ratioMax: 15, label: '스트롱',              emoji: '🔥', desc: '진한 추출 · 다크 로스팅·콜드브루 농축', color: '#FFB83E' },
  { id: 'golden',   ratioMin: 15, ratioMax: 17, label: 'SCA 골든 컵 ⭐',       emoji: '🏆', desc: 'SCA 표준 · 균형 잡힌 추출 영역',      color: '#3EFFD0' },
  { id: 'sig',      ratioMin: 17, ratioMax: 20, label: '시그니처·연함',        emoji: '🌿', desc: '연한 추출 · 산미·향 강조',            color: '#3EC8FF' },
  { id: 'weak',     ratioMin: 20, ratioMax: 99, label: '너무 묽음',            emoji: '💧', desc: '추출 부족 · 묽고 향 약함',            color: '#9B9B9B' },
]

export function getIntensity(ratio: number): IntensityZone {
  return INTENSITY_ZONES.find((z) => ratio >= z.ratioMin && ratio < z.ratioMax) ?? INTENSITY_ZONES[INTENSITY_ZONES.length - 1]
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
