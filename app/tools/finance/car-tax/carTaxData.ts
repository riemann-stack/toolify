/* ───────────────────────────────────────────────────────────
   자동차 세금 종합 계산기 데이터·로직 (2026년 기준)
   ─────────────────────────────────────────────────────────── */

import {
  VEHICLE_TAX_YEAR,
  REGIONS, ACQUISITION_TAX_RATES,
  EV_TAX_CAP, HYBRID_TAX_CAP, LIGHT_TAX_CAP, MULTI_CHILD_TAX_CAP, TWO_CHILD_TAX_RATE, TWO_CHILD_TAX_CAP,
  CAR_TAX_PER_CC_NON_BUSINESS, annualTaxByCC, EV_ANNUAL_TAX, annualTaxAgeDiscount, carAgeFromYears,
  ANNUAL_PREPAY_DISCOUNT, EDU_TAX_RATE, DIESEL_ENV_FEE_LAST_REG_YEAR, dieselEnvFeeApplies, bondRateFor,
  type CarType, type FuelType, type RegionId, type RegionInfo,
} from '@/lib/krVehicleTax'

/* 법정 수치(취득세율·감면 한도·cc당 세액·차령 경감·연납 공제·지방교육세·공채 비율·환경개선부담금 대상 연식)는
   lib/krVehicleTax.ts 단일 소스 — 근거·기준일은 lib 주석 참고. 기존 import 경로 유지를 위해 재수출한다. */
export {
  REGIONS, ACQUISITION_TAX_RATES,
  EV_TAX_CAP, HYBRID_TAX_CAP, LIGHT_TAX_CAP, MULTI_CHILD_TAX_CAP, TWO_CHILD_TAX_RATE, TWO_CHILD_TAX_CAP,
  annualTaxByCC, EV_ANNUAL_TAX, annualTaxAgeDiscount, carAgeFromYears,
  ANNUAL_PREPAY_DISCOUNT, EDU_TAX_RATE, DIESEL_ENV_FEE_LAST_REG_YEAR, dieselEnvFeeApplies, bondRateFor,
}
export type { CarType, FuelType, RegionId, RegionInfo }

/** 계산 기준 과세연도 — 등록연도(= 기준연도 − 경과 년수)와 차령 산출용. lib VEHICLE_TAX_YEAR (매년 1월 갱신) */
export const TAX_BASE_YEAR = VEHICLE_TAX_YEAR

/** 공채 즉시 매도 시 할인율 (대략 10~15%) — 실비용 비율 */
export const BOND_DISCOUNT_RATE = 0.12

/** 번호판 발급비 + 등록 수수료 */
export const REGISTRATION_FEE = 15_000

/* ─── 환경개선부담금 (경유차) ─── */
/* 부과 대상 판정(DIESEL_ENV_FEE_LAST_REG_YEAR·dieselEnvFeeApplies)은 lib/krVehicleTax.ts */
/** 경유차 연 부과액 (단순 추정치 — 실제는 배기량·차령·지역계수로 산정) */
export function dieselEnvironmentFee(cc: number): number {
  // 경유 승용차 평균: 연 약 8만~25만 원
  // 단순화: 배기량별
  if (cc <= 1500) return 80_000
  if (cc <= 2000) return 120_000
  if (cc <= 2500) return 160_000
  return 220_000
}

/* ─── 유류세 (L당, 2025~2026 평균) ─── */
export interface FuelTaxInfo {
  /** L당 세금 (원) — 교통·에너지·환경세(탄력세율) + 교육세 15% + 주행세 26%. 부가가치세 별도·한시 인하 전 기준 */
  taxPerLiter: number
  /** L당 평균 소매가 (참고용) */
  pricePerLiter: number
  /** 세금 비중 */
  taxRatio: number
}

export const FUEL_TAX: Record<FuelType, FuelTaxInfo> = {
  gasoline: { taxPerLiter: 745, pricePerLiter: 1650, taxRatio: 0.45 },
  diesel:   { taxPerLiter: 528, pricePerLiter: 1500, taxRatio: 0.35 },
  lpg:      { taxPerLiter: 230, pricePerLiter: 1100, taxRatio: 0.21 },
  electric: { taxPerLiter: 0,   pricePerLiter: 0,    taxRatio: 0 },
  hybrid:   { taxPerLiter: 745, pricePerLiter: 1650, taxRatio: 0.45 },  // 휘발유 기준
}

/* ─── 종합 계산 ─── */
export interface CarTaxInputs {
  carPrice: number          // 차량가 (원)
  carType: CarType
  fuelType: FuelType
  cc: number                // 배기량 (전기차는 0)
  yearsSinceReg: number     // 등록 후 N년 (0 = 신차)
  regionId: RegionId
  monthlyKm: number         // 월 주행거리
  efficiencyKmL: number     // 연비 km/L (전기차는 km/kWh)
  prepay: boolean           // 연납 할인 적용
  exemption: Exemption
  yearsToHold: number       // 보유 시뮬레이션 기간
}

export interface CarTaxResult {
  /** 취득 시 */
  acquisitionTax: number
  bondCost: number
  registrationFee: number
  initialTotal: number

  /** 연간 (현재 시점 기준) */
  annualCarTax: number      // 자동차세 본세
  annualEduTax: number      // 지방교육세
  annualEnvFee: number      // 환경부담금 (경유차)
  annualFuelTax: number     // 유류세 (추정)
  annualTotal: number

  /** N년 누적 */
  yearlyBreakdown: { year: number; carTax: number; eduTax: number; envFee: number; fuelTax: number; total: number; cumulative: number }[]
  totalForPeriod: number

  /** 면제 효과 */
  exemptionSaved: number
}

export function calcCarTax(inp: CarTaxInputs): CarTaxResult {
  // ─── 취득세 ───
  const grossAcqTax = inp.carPrice * ACQUISITION_TAX_RATES[inp.carType]

  // 차종 감면 (전기·수소 140만 한도, 경차 75만 한도, 하이브리드 종료)
  const typeDed =
    inp.carType === 'ev' ? Math.min(grossAcqTax, EV_TAX_CAP)
    : inp.carType === 'light' ? Math.min(grossAcqTax, LIGHT_TAX_CAP)
    : inp.carType === 'hybrid' ? Math.min(grossAcqTax, HYBRID_TAX_CAP)
    : 0

  // 자격 감면 (다자녀·장애인·상이 국가유공자)
  let qualDed = 0
  if (inp.exemption === 'multi_child' && inp.carType !== 'business') {
    // 3자녀 이상: 면제 — 6인승 이하 승용 140만 한도(7인승↑ 등은 한도 다름) — 본 도구는 140만 한도로 보수 가정
    qualDed = Math.min(grossAcqTax, MULTI_CHILD_TAX_CAP)
  } else if (inp.exemption === 'two_child' && inp.carType !== 'business') {
    // 2자녀: 50% 경감 — 6인승 이하 승용 70만 한도
    qualDed = Math.min(grossAcqTax * TWO_CHILD_TAX_RATE, TWO_CHILD_TAX_CAP)
  } else if (inp.exemption === 'disabled' || inp.exemption === 'merit') {
    // 장애인·상이 국가유공자: 본인 명의 1대 면세
    qualDed = grossAcqTax
  }

  // 중복 감면 배제 (지방세특례제한법 §180): 둘 이상 해당하면 감면액이 큰 하나만 적용
  const appliedDed = Math.max(typeDed, qualDed)
  const acquisitionTax = grossAcqTax - appliedDed
  // 자격 감면으로 '추가로' 줄어든 취득세 (차종 감면만으로도 받는 부분 제외)
  let exemptionSaved = Math.max(0, appliedDed - typeDed)

  // 공채 실비
  const bondTotal = inp.carPrice * bondRateFor(inp.regionId, inp.cc, inp.carType)
  const bondCost = Math.round(bondTotal * BOND_DISCOUNT_RATE)

  const initialTotal = Math.round(acquisitionTax + bondCost + REGISTRATION_FEE)

  // ─── 연간 ───
  const isBusiness = inp.carType === 'business'
  const isEV = inp.carType === 'ev'
  // 장애인·상이 국가유공자: 본인 명의 1대 — 취득세뿐 아니라 자동차세(+지방교육세)도 면제
  const fullExempt = inp.exemption === 'disabled' || inp.exemption === 'merit'

  // 자동차세 본세 (현재 시점 — 올해 차령 = 경과 년수 + 1)
  let annualBase = isEV ? EV_ANNUAL_TAX : annualTaxByCC(inp.cc, isBusiness)
  // 전기차는 배기량이 없어 이미 최저 정액 → 차령(연식) 경감 없음
  const discount = isEV ? 0 : annualTaxAgeDiscount(carAgeFromYears(inp.yearsSinceReg))
  annualBase = annualBase * (1 - discount)
  let annualCarTax = annualBase
  if (inp.prepay) annualCarTax = annualCarTax * (1 - ANNUAL_PREPAY_DISCOUNT)
  if (fullExempt) annualCarTax = 0
  const annualEduTax = annualCarTax * EDU_TAX_RATE

  // 환경부담금 (유로4 이하 경유차만 — 등록연도로 추정)
  const regYear = TAX_BASE_YEAR - Math.max(0, Math.floor(inp.yearsSinceReg))
  const envFeeApplies = dieselEnvFeeApplies(inp.fuelType, regYear)
  const annualEnvFee = envFeeApplies ? dieselEnvironmentFee(inp.cc) : 0

  // 유류세 (추정)
  const annualKm = inp.monthlyKm * 12
  let annualFuelTax = 0
  if (inp.fuelType !== 'electric' && inp.efficiencyKmL > 0) {
    const annualLiters = annualKm / inp.efficiencyKmL
    annualFuelTax = annualLiters * FUEL_TAX[inp.fuelType].taxPerLiter
  }

  const annualTotal = Math.round(annualCarTax + annualEduTax + annualEnvFee + annualFuelTax)

  // ─── 누적 ───
  const yearlyBreakdown: CarTaxResult['yearlyBreakdown'] = []
  let cumulative = initialTotal
  let exemptedAnnualSum = 0   // 면제로 절감된 자동차세+교육세 누계 (장애인·유공자)
  for (let y = 1; y <= inp.yearsToHold; y++) {
    const carAge = carAgeFromYears(inp.yearsSinceReg) + y - 1 // 1년차 = 올해 차령
    let yearBase = isEV ? EV_ANNUAL_TAX : annualTaxByCC(inp.cc, isBusiness)
    const yDiscount = isEV ? 0 : annualTaxAgeDiscount(carAge)
    yearBase = yearBase * (1 - yDiscount)
    let yCarTax = yearBase
    if (inp.prepay) yCarTax = yCarTax * (1 - ANNUAL_PREPAY_DISCOUNT)
    if (fullExempt) { exemptedAnnualSum += yCarTax * (1 + EDU_TAX_RATE); yCarTax = 0 }
    const yEduTax = yCarTax * EDU_TAX_RATE
    const yEnvFee = envFeeApplies ? dieselEnvironmentFee(inp.cc) : 0
    const yFuelTax = annualFuelTax  // 매년 같다고 가정 (주행거리 동일)
    const yTotal = Math.round(yCarTax + yEduTax + yEnvFee + yFuelTax)
    cumulative += yTotal
    yearlyBreakdown.push({
      year: y,
      carTax: Math.round(yCarTax),
      eduTax: Math.round(yEduTax),
      envFee: Math.round(yEnvFee),
      fuelTax: Math.round(yFuelTax),
      total: yTotal,
      cumulative,
    })
  }
  // 면제된 자동차세(+교육세) 누계를 절감액에 합산 (취득세 면제분과 함께)
  exemptionSaved += exemptedAnnualSum

  return {
    acquisitionTax: Math.round(acquisitionTax),
    bondCost,
    registrationFee: REGISTRATION_FEE,
    initialTotal,
    annualCarTax: Math.round(annualCarTax),
    annualEduTax: Math.round(annualEduTax),
    annualEnvFee: Math.round(annualEnvFee),
    annualFuelTax: Math.round(annualFuelTax),
    annualTotal,
    yearlyBreakdown,
    totalForPeriod: cumulative,
    exemptionSaved: Math.round(exemptionSaved),
  }
}

/* ─── 라벨 ─── */
export const CAR_TYPE_LABEL: Record<CarType, string> = {
  normal:   '🚗 일반 승용',
  light:    '🚙 경차 (1000cc↓)',
  business: '🚕 영업용',
  ev:       '⚡ 전기·수소',
  hybrid:   '🔋 하이브리드',
}

export const FUEL_LABEL: Record<FuelType, string> = {
  gasoline: '⛽ 휘발유',
  diesel:   '🛢️ 경유',
  lpg:      '🟢 LPG',
  electric: '🔌 전기',
  hybrid:   '🔋 하이브리드',
}

export const EXEMPTION_LABEL = {
  none:        { name: '해당 없음',     desc: '일반 가구' },
  two_child:   { name: '다자녀 (18세 미만 2명)', desc: '1대 취득세 50% 경감 — 6인승↓ 70만 한도 (2027년까지)' },
  multi_child: { name: '다자녀 (18세 미만 3명+)', desc: '1대 취득세 면제 — 6인승↓ 140만 한도 (2027년까지)' },
  disabled:    { name: '장애인 (장애 정도 심함 등)', desc: '본인 명의 1대 — 취득세·자동차세 면제 (승용 2000cc↓ 가정)' },
  merit:       { name: '상이 국가유공자', desc: '상이등급 판정 등 요건 충족 본인 명의 1대 — 취득세·자동차세 면제' },
} as const

export type Exemption = keyof typeof EXEMPTION_LABEL
export const EXEMPTION_KEYS = Object.keys(EXEMPTION_LABEL) as Exemption[]
export const CAR_TYPES: CarType[] = ['normal', 'light', 'business', 'ev', 'hybrid']
export const FUEL_TYPES: FuelType[] = ['gasoline', 'diesel', 'lpg', 'electric', 'hybrid']

/* ─── 자동차세 cc별 단가표 (가이드용) ─── */
export const TAX_TABLE_NON_BUSINESS = [
  { range: '~ 1000cc',    perCC: CAR_TAX_PER_CC_NON_BUSINESS[0].perCc, example: '경차 998cc → 약 80,000원/년' },
  { range: '~ 1600cc',    perCC: CAR_TAX_PER_CC_NON_BUSINESS[1].perCc, example: '아반떼 1.6 → 약 224,000원/년' },
  { range: '1600cc 초과', perCC: CAR_TAX_PER_CC_NON_BUSINESS[2].perCc, example: '쏘나타 2.0 → 약 400,000원/년' },
]

/* ─── 양도 안내 ─── */
export const TRANSFER_NOTE = {
  title: '💰 양도 시점',
  points: [
    '자동차는 양도소득세 과세대상(소득세법 §94: 부동산·주식 등)에 들어가지 않아 개인이 파는 중고차 차익은 양도세가 없음',
    '양도 시 보유 일수 비례로 자동차세 자동 환급/환수',
    '영업용·사업자 차량은 사업소득으로 별도 신고',
    '폐차 시 폐차보상금 가능 (조기폐차 지원금 별도)',
    '명의 이전 시 취득세·공채는 매수인이 부담',
  ],
}

/* ─── 절세 팁 ─── */
export const SAVING_TIPS = [
  { title: '🗓️ 자동차세 연납 (1월)', detail: '1월 일괄 납부 시 약 4.6% 할인 (2026년 공제율 5%). 3/6/9월 납부 대비 큰 절감' },
  { title: '⚡ 친환경차 선택',         detail: '전기차 취득세 140만원 면제 + 자동차세 13만원 정액. 5년 보유 시 약 200~400만원 절감' },
  { title: '👨‍👩‍👧‍👦 다자녀 가구',      detail: '18세 미만 자녀 3명 이상은 1대 취득세 면제(6인승↓ 140만 한도), 2명은 50% 경감(70만 한도) — 2027년까지' },
  { title: '🚙 경차 선택',             detail: '취득세 75만원까지 면제(2027년까지)·공채 매입 면제, 경차 유류세 환급 연 30만원 한도' },
  { title: '🏥 장애인·상이 국가유공자', detail: '요건을 갖춘 본인 명의 1대 한정 — 취득세·자동차세 모두 면제' },
  { title: '🛢️ 노후 경유차',           detail: '유로4 이하(대략 2011년 이전 제작) 경유차는 환경개선부담금 부과. 조기폐차 지원금 활용' },
  { title: '⏳ 12년 이상 보유',        detail: '자동차세 최대 50% 감면. 장기 보유 가성비 ↑' },
  { title: '🏎️ 배기량 선택',           detail: '1600cc 이하는 cc당 140원, 초과는 200원. 단가 차이로 연 10만원+ 차이' },
]
