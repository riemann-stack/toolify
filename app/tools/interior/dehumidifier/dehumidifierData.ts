/* ──────────────────────────────────────────────────────
   interior/dehumidifier/dehumidifierData.ts
   제습기 용량(L/day) 계산 — 실면적 × 주거유형 계수 × 습도환경 보정
   + 시판 제품 등급 매칭 + 월 소비전력·전기요금 추정
   ──────────────────────────────────────────────────────
   근거·기준
   - 주거유형 계수: 업계 통용 가이드 아파트 0.76 L/평·일 / 주택 1.02 L/평·일
     (1평 = 3.3058㎡ → 아파트 0.23 / 주택 0.31 L/㎡·일). 지하·습도환경 보정은
     '실사용 관행값'으로 곱셈 적용 — 측정 상수가 아님(가이드 참고치).
   - 제품 정격(L/day)은 국내 KS C 9317 기준 27℃·60%RH 24시간 연속 운전 시험값
     (해외 제품은 30℃·80%RH 등 조건이 다를 수 있음). 실사용 제거량은 방 온습도에 따라 달라짐.
   - 소비전력은 시판 제품 등급별 대표 스펙(제조사 카탈로그 평균) — 모델마다 다름.
   ────────────────────────────────────────────────────── */

import {
  KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH,
  ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH,
} from '@/lib/krElectricityRates'

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

/** 시판 제품 등급 — 정격 제습량(L/day, KS C 9317 27℃·60%RH 기준)·대표 소비전력(W) */
export interface ProductTier {
  ratedL: number
  watt: number
  label: string
  space: string
}
/* space: 평상시 기준 이 계산기가 해당 등급을 추천하는 대략의 면적 상한
   (정격 ÷ 평당 계수 — 아파트 0.76L·주택 1.02L·지하 1.49L/평·일) */
export const PRODUCT_TIERS: ProductTier[] = [
  { ratedL: 10, watt: 150, label: '10L급', space: '원룸·작은방 (아파트 약 13평까지)' },
  { ratedL: 16, watt: 195, label: '16L급', space: '아파트 약 21평·주택 약 15평까지' },
  { ratedL: 20, watt: 265, label: '20L급', space: '아파트 약 26평·주택 약 19평까지' },
  { ratedL: 30, watt: 440, label: '30L급', space: '아파트 약 39평·주택 약 29평·지하 약 20평까지' },
]

/* 한전 주택용(저압) 누진 구간별 전력량요금 (원/kWh)·입력칸 기본 단가 — lib/krElectricityRates.ts 단일 소스
   (출처·기준일·별도 부과 항목은 lib 주석 참고) */
export const KEPCO_RESIDENTIAL_TIER_KRW = KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH
/** 전기요금 단가 입력칸 기본값 (원/kWh) */
export const DEFAULT_WON_PER_KWH = ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH

/** 하루 가동시간 상한 (시간) */
export const MAX_HOURS_PER_DAY = 24

export interface DehumResult {
  areaSqm: number
  dailyLiters: number     // 하루 제거해야 할 수분량 추정 (실사용)
  tier: ProductTier       // 매칭된 권장 제품 등급
  units: number           // 필요 대수 — 최대 등급을 넘으면 2대 이상
  exceedsMax: boolean     // 필요량이 가정용 최대 등급(정격) 초과
  monthlyKwh: number      // 월 소비전력량 (units대 합계)
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
  // 최대 등급(30L)으로도 모자라면 그 등급 여러 대로 나눠 운용 — 1대로 조용히 폴백하지 않는다
  const maxTier = PRODUCT_TIERS[PRODUCT_TIERS.length - 1]
  const exceedsMax = dailyLiters > maxTier.ratedL
  const tier = PRODUCT_TIERS.find((t) => t.ratedL >= dailyLiters) ?? maxTier
  const units = exceedsMax ? Math.ceil(dailyLiters / maxTier.ratedL) : 1

  const h = Math.min(MAX_HOURS_PER_DAY, Math.max(0, hoursPerDay))
  const monthlyKwh = (tier.watt / 1000) * h * 30 * units
  const monthlyCost = monthlyKwh * Math.max(0, wonPerKwh)

  return { areaSqm: area, dailyLiters, tier, units, exceedsMax, monthlyKwh, monthlyCost }
}

export const pyeongToSqm = (p: number) => p * SQM_PER_PYEONG
export const sqmToPyeong = (s: number) => s / SQM_PER_PYEONG
