/* ──────────────────────────────────────────────────────
   interior/dehumidifier/dehumidifierData.ts
   제습기 용량(L/day) 계산 — 실면적 × 주거유형 계수 × 습도환경 보정
   + 시판 제품 등급 매칭 + 월 소비전력·전기요금 추정
   ──────────────────────────────────────────────────────
   근거·기준
   - 주거유형 계수: 업계 통용 가이드 아파트 0.76 L/평·일 / 주택 1.02 L/평·일
     (1평 = 3.3058㎡ → 아파트 0.23 / 주택 0.31 L/㎡·일). 지하·습도환경 보정은
     '실사용 관행값'으로 곱셈 적용 — 측정 상수가 아님(가이드 참고치).
   - 제품 정격(L/day)은 보통 30℃·80%RH 고온다습 조건 시험값이라 일상 제거량보다 큼.
   - 소비전력은 시판 제품 등급별 대표 스펙(제조사 카탈로그 평균) — 모델마다 다름.
   ────────────────────────────────────────────────────── */

export const SQM_PER_PYEONG = 3.305785

/** 주거 유형 — 기본 제습 계수 (L/㎡·일) */
export interface HomeType {
  id: string
  name: string
  coeff: number   // L/㎡·일
  note: string
}
export const HOME_TYPES: HomeType[] = [
  { id: 'apt',      name: '아파트·신축', coeff: 0.23, note: '단열·기밀 양호 (평당 약 0.76L)' },
  { id: 'house',    name: '주택·빌라·구축', coeff: 0.31, note: '외기 접촉·틈새 많음 (평당 약 1.02L)' },
  { id: 'basement', name: '지하·반지하', coeff: 0.45, note: '지중 습기 유입 — 관행 보정값' },
]

/** 습도 환경 — 곱셈 보정 (관행값) */
export interface EnvFactor {
  id: string
  name: string
  mult: number
  note: string
}
export const ENV_FACTORS: EnvFactor[] = [
  { id: 'normal',  name: '평상시',        mult: 1.0,  note: '일반적인 실내 습도' },
  { id: 'rainy',   name: '장마·우기',     mult: 1.25, note: '외기 습도 80%↑ 지속' },
  { id: 'closed',  name: '드레스룸·붙박이장', mult: 1.15, note: '환기 적은 밀폐 공간' },
  { id: 'laundry', name: '실내 빨래건조 병행', mult: 1.4, note: '젖은 세탁물 수분 추가' },
]

/** 시판 제품 등급 — 정격 제습량(L/day, 30℃80%RH 기준)·대표 소비전력(W) */
export interface ProductTier {
  ratedL: number
  watt: number
  label: string
  space: string
}
export const PRODUCT_TIERS: ProductTier[] = [
  { ratedL: 10, watt: 150, label: '10L급', space: '원룸·작은방' },
  { ratedL: 16, watt: 195, label: '16L급', space: '10평대 방·거실' },
  { ratedL: 20, watt: 265, label: '20L급', space: '20평대 아파트' },
  { ratedL: 30, watt: 440, label: '30L급', space: '넓은 거실·주택·지하' },
]

export interface DehumResult {
  areaSqm: number
  dailyLiters: number     // 하루 제거해야 할 수분량 추정 (실사용)
  tier: ProductTier       // 매칭된 권장 제품 등급
  monthlyKwh: number      // 월 소비전력량
  monthlyCost: number     // 월 추가 전기요금 추정
}

/**
 * 제습 용량·전력 계산
 * @param areaSqm  실면적(㎡)
 * @param coeff    주거유형 계수(L/㎡·일)
 * @param mult     습도환경 보정
 * @param hoursPerDay  하루 가동시간
 * @param wonPerKwh    전기요금 단가(원/kWh)
 */
export function calcDehumidifier(
  areaSqm: number,
  coeff: number,
  mult: number,
  hoursPerDay: number,
  wonPerKwh: number,
): DehumResult {
  const area = Math.max(0, areaSqm)
  const dailyLiters = area * coeff * mult

  // 권장 제품 = 일 제거량 이상을 정격으로 내는 가장 작은 등급 (정격은 고온다습 조건이라 여유분 포함)
  const tier =
    PRODUCT_TIERS.find((t) => t.ratedL >= dailyLiters) ??
    PRODUCT_TIERS[PRODUCT_TIERS.length - 1]

  const h = Math.max(0, hoursPerDay)
  const monthlyKwh = (tier.watt / 1000) * h * 30
  const monthlyCost = monthlyKwh * Math.max(0, wonPerKwh)

  return { areaSqm: area, dailyLiters, tier, monthlyKwh, monthlyCost }
}

export const pyeongToSqm = (p: number) => p * SQM_PER_PYEONG
export const sqmToPyeong = (s: number) => s / SQM_PER_PYEONG
