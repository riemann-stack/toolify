/* 철근 중량 계산기 — KS D 3504 데이터·계산 유틸 */

export type RebarSize =
  | 'D10' | 'D13' | 'D16' | 'D19' | 'D22' | 'D25'
  | 'D29' | 'D32' | 'D35' | 'D38' | 'D41' | 'D51'

export type Strength = 'SD300' | 'SD400' | 'SD500' | 'SD600'

export const REBAR_SIZES: RebarSize[] = [
  'D10', 'D13', 'D16', 'D19', 'D22', 'D25',
  'D29', 'D32', 'D35', 'D38', 'D41', 'D51',
]

export interface RebarData {
  size: RebarSize
  diameter: number   // 공칭 직경 (mm)
  area: number       // 공칭 단면적 (mm²)
  weightPerM: number // 1m 단위 중량 (kg/m) — KS D 3504
}

export const REBAR_DATA: Record<RebarSize, RebarData> = {
  D10: { size: 'D10', diameter: 9.53,  area: 71.33,  weightPerM: 0.560 },
  D13: { size: 'D13', diameter: 12.7,  area: 126.7,  weightPerM: 0.995 },
  D16: { size: 'D16', diameter: 15.9,  area: 198.6,  weightPerM: 1.560 },
  D19: { size: 'D19', diameter: 19.1,  area: 286.5,  weightPerM: 2.250 },
  D22: { size: 'D22', diameter: 22.2,  area: 387.1,  weightPerM: 3.040 },
  D25: { size: 'D25', diameter: 25.4,  area: 506.7,  weightPerM: 3.980 },
  D29: { size: 'D29', diameter: 28.6,  area: 642.4,  weightPerM: 5.040 },
  D32: { size: 'D32', diameter: 31.8,  area: 794.2,  weightPerM: 6.230 },
  D35: { size: 'D35', diameter: 34.9,  area: 956.6,  weightPerM: 7.510 },
  D38: { size: 'D38', diameter: 38.1,  area: 1140,   weightPerM: 8.950 },
  D41: { size: 'D41', diameter: 41.3,  area: 1340,   weightPerM: 10.50 },
  D51: { size: 'D51', diameter: 50.8,  area: 2027,   weightPerM: 15.90 },
}

/* 표준 길이 (m) */
export const STANDARD_LENGTHS = [6, 8, 10, 12, 13.7] as const
export type StandardLength = (typeof STANDARD_LENGTHS)[number]

/* 강도 등급 메타 */
export interface StrengthMeta {
  id: Strength
  yieldMpa: number
  use: string
  priceFactor: number  // SD400 = 1.0 기준
  color: string
}

export const STRENGTH_META: Record<Strength, StrengthMeta> = {
  SD300: { id: 'SD300', yieldMpa: 300, use: '저층·소형 구조 (구형)',           priceFactor: 0.95, color: '#9B9B9B' },
  SD400: { id: 'SD400', yieldMpa: 400, use: '한국 일반 표준 (공동주택·상가)',  priceFactor: 1.00, color: '#3EFFD0' },
  SD500: { id: 'SD500', yieldMpa: 500, use: '대형·고층·교량',                   priceFactor: 1.10, color: '#FFB83E' },
  SD600: { id: 'SD600', yieldMpa: 600, use: '초고층·내진·플랜트',               priceFactor: 1.20, color: '#FF3E8C' },
}

/* 트럭 종류 */
export interface TruckMeta {
  id: string
  emoji: string
  label: string
  capacityKg: number
  maxLengthM: number  // 적재 가능 최대 철근 길이
  costRange: string   // 수도권 일반
  note: string
}

export const TRUCKS: TruckMeta[] = [
  { id: 't1',   emoji: '🚐', label: '1톤 (포터·봉고)',  capacityKg: 1000,  maxLengthM: 6,    costRange: '8~15만원',  note: '6m 철근까지, 소량 셀프 운반' },
  { id: 't15',  emoji: '🚚', label: '1.5톤',             capacityKg: 1500,  maxLengthM: 6,    costRange: '12~20만원', note: '6m 철근, 중간 규모' },
  { id: 't25',  emoji: '🚛', label: '2.5톤',             capacityKg: 2500,  maxLengthM: 8,    costRange: '15~25만원', note: '8m까지 가능' },
  { id: 't5',   emoji: '🛻', label: '5톤 카고',           capacityKg: 5000,  maxLengthM: 12,   costRange: '25~40만원', note: '12m 철근 표준 운반차' },
  { id: 't11',  emoji: '🚜', label: '11톤',               capacityKg: 11000, maxLengthM: 13.7, costRange: '40~70만원', note: '대형 현장·13.7m 가능' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** 총 중량 (kg) = 본수 × 길이(m) × 단위중량(kg/m) */
export function totalWeight(size: RebarSize, lengthM: number, count: number): number {
  return REBAR_DATA[size].weightPerM * lengthM * count
}

/** 절단 로스 반영 발주 권장 중량 */
export function withLoss(weightKg: number, lossPct: number): number {
  return weightKg * (1 + lossPct / 100)
}

/** 결속선 추가 (100kg당 6kg) */
export function tyingWire(weightKg: number, factor = 0.06): number {
  return weightKg * factor
}

/** 가격 (만원 단위) */
export function calcPrice(weightKg: number, pricePerTonMan: number, strength: Strength = 'SD400'): number {
  const tons = weightKg / 1000
  return tons * pricePerTonMan * STRENGTH_META[strength].priceFactor
}

/** 1본당 무게 (kg) */
export function perPiece(size: RebarSize, lengthM: number): number {
  return REBAR_DATA[size].weightPerM * lengthM
}

/** 목표 중량 → 본수 */
export function weightToCount(targetKg: number, size: RebarSize, lengthM: number): number {
  const perBar = perPiece(size, lengthM)
  return perBar > 0 ? Math.ceil(targetKg / perBar) : 0
}

/** 예산(만원) → 가능 중량(kg) */
export function budgetToWeight(budgetMan: number, pricePerTonMan: number, strength: Strength = 'SD400'): number {
  const factor = STRENGTH_META[strength].priceFactor
  return (budgetMan / (pricePerTonMan * factor)) * 1000
}

/** 트럭 회차 계산 */
export function truckTrips(totalKg: number, truckId: string): number {
  const t = TRUCKS.find((tr) => tr.id === truckId)
  if (!t) return 0
  return Math.ceil(totalKg / t.capacityKg)
}

/* ─────────────────────────────────────────────
   배근 가이드 (셀프 시공 시나리오)
   ───────────────────────────────────────────── */

export interface RebarPlan {
  id: string
  emoji: string
  label: string
  desc: string
  spec: string
  size: RebarSize
  spacing: number   // mm
  cover: number     // mm 피복두께
  perM2: number     // 1m²당 필요 길이 (m)
  caution: string
}

export const REBAR_PLANS: RebarPlan[] = [
  {
    id: 'wall',
    emoji: '🏗️',
    label: '옹벽 (높이 1m, 단면 200mm)',
    desc: '담장·소형 옹벽. 높이 1m 미만 권장.',
    spec: 'D10 @200, 격자 양면',
    size: 'D10',
    spacing: 200,
    cover: 50,
    perM2: 10,   // 1m² 당 약 10m (가로 5 + 세로 5)
    caution: '높이 1.5m 이상은 구조 설계 필수 (건축법)',
  },
  {
    id: 'foundation',
    emoji: '🧱',
    label: '슬래브 기초 (200mm 두께)',
    desc: '주택·창고·카포트 기초. 더블 레이어.',
    spec: 'D13 @200, 상하 더블 격자',
    size: 'D13',
    spacing: 200,
    cover: 70,
    perM2: 20,   // 더블레이어 = 약 20m
    caution: '주택은 구조기술사 도면 필수, 단순 슬래브에 한정',
  },
  {
    id: 'stair',
    emoji: '🪜',
    label: '콘크리트 계단',
    desc: '셀프 시공 가능한 짧은 계단 (최대 5단).',
    spec: 'D10 @150, 사선 배근',
    size: 'D10',
    spacing: 150,
    cover: 30,
    perM2: 13,   // 단당 가로 + 사선
    caution: '5단 초과·외부 연결은 전문가 시공',
  },
  {
    id: 'carport',
    emoji: '🚗',
    label: '카포트 기초 (1.5×1.5m)',
    desc: '독립 기초. 1.5m × 1.5m × 깊이 0.5m.',
    spec: 'D10 @300, 격자 1단',
    size: 'D10',
    spacing: 300,
    cover: 50,
    perM2: 7,    // 1단 격자
    caution: '바람·지진에 대한 앵커 볼트 별도 시공',
  },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtKg = (kg: number) => {
  if (kg >= 1000) return `${fmt(kg / 1000, 2)} 톤`
  return `${fmt(kg, 1)} kg`
}
