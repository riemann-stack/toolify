/* ───────────────────────────────────────────────────────────
   자동차 세금 종합 계산기 데이터·로직 (2026년 기준)
   ─────────────────────────────────────────────────────────── */

export type CarType = 'normal' | 'light' | 'business' | 'ev' | 'hybrid'
export type FuelType = 'gasoline' | 'diesel' | 'lpg' | 'electric' | 'hybrid'
export type RegionId = 'seoul' | 'busan' | 'daegu' | 'incheon' | 'gwangju' | 'daejeon' | 'ulsan' | 'sejong' | 'gyeonggi' | 'other'

export interface RegionInfo {
  id: RegionId
  name: string
  /** 차량가 대비 공채 매입 비율 (지방·도시철도채권) */
  bondRate: number
}

/** 지역별 공채 매입 비율 (2025~2026 기준 — 도시철도채권/지역개발채권) */
export const REGIONS: RegionInfo[] = [
  { id: 'seoul',    name: '서울',           bondRate: 0.12 },
  { id: 'busan',    name: '부산',           bondRate: 0.04 },
  { id: 'daegu',    name: '대구',           bondRate: 0.04 },
  { id: 'incheon',  name: '인천',           bondRate: 0.04 },
  { id: 'gwangju',  name: '광주',           bondRate: 0.04 },
  { id: 'daejeon',  name: '대전',           bondRate: 0.04 },
  { id: 'ulsan',    name: '울산',           bondRate: 0.04 },
  { id: 'sejong',   name: '세종',           bondRate: 0.04 },
  { id: 'gyeonggi', name: '경기·기타 광역', bondRate: 0.06 },
  { id: 'other',    name: '도 (군·시)',     bondRate: 0.04 },
]

/* ─── 취득세 ─── */
export const ACQUISITION_TAX_RATES: Record<CarType, number> = {
  normal:   0.07,   // 일반 승용 7%
  light:    0.04,   // 경차 4%
  business: 0.04,   // 영업용 4%
  ev:       0.07,   // 전기·수소 7% 적용 후 140만원 한도 면제
  hybrid:   0.07,   // 하이브리드 (감면 종료, 일반과 동일)
}

/** 친환경차 취득세 감면 한도 (2025~2026) */
export const EV_TAX_CAP = 1_400_000    // 전기·수소 140만원 한도 면제
export const HYBRID_TAX_CAP = 0        // 하이브리드 감면 2024 종료

/** 공채 즉시 매도 시 할인율 (대략 10~15%) — 실비용 비율 */
export const BOND_DISCOUNT_RATE = 0.12

/** 번호판 발급비 + 등록 수수료 */
export const REGISTRATION_FEE = 15_000

/* ─── 자동차세 (비영업용, cc당 단가, 원) ─── */
export function annualTaxByCC(cc: number, isBusiness: boolean): number {
  if (isBusiness) {
    // 영업용
    if (cc <= 1000) return cc * 18
    if (cc <= 1600) return cc * 18
    if (cc <= 2000) return cc * 19
    if (cc <= 2500) return cc * 19
    return cc * 24
  }
  // 비영업용
  if (cc <= 1000) return cc * 80
  if (cc <= 1600) return cc * 140
  return cc * 200
}

/** 전기차 자동차세 (정액, 2026 기준) */
export const EV_ANNUAL_TAX = 130_000

/** 연식별 감면율 (등록 후 N년차 → 감면 %) */
export function annualTaxAgeDiscount(yearsSinceReg: number): number {
  // 3년차부터 5%씩 감면, 최대 50% (12년차 이상)
  if (yearsSinceReg < 3) return 0
  const discount = (yearsSinceReg - 2) * 0.05
  return Math.min(0.5, discount)
}

/** 자동차세 연납 할인 (1월 납부 시 약 9.15% 할인) */
export const ANNUAL_PREPAY_DISCOUNT = 0.0915

/** 지방교육세 = 자동차세 × 30% */
export const EDU_TAX_RATE = 0.30

/* ─── 환경개선부담금 (경유차) ─── */
/** 경유차 연 부과액 (단순 평균치 — 차종·연식별 다름) */
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
  /** L당 세금 (원) — 교통세 + 교육세 + 주행세 + 부가세 */
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
  exemption: 'none' | 'multi_child' | 'disabled' | 'merit'
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
  let acquisitionTax = inp.carPrice * ACQUISITION_TAX_RATES[inp.carType]

  // 친환경 감면
  if (inp.carType === 'ev') {
    acquisitionTax = Math.max(0, acquisitionTax - EV_TAX_CAP)
  } else if (inp.carType === 'hybrid') {
    acquisitionTax = Math.max(0, acquisitionTax - HYBRID_TAX_CAP)
  }

  // 감면 (다자녀·장애인·국가유공자)
  let exemptionSaved = 0
  if (inp.exemption === 'multi_child' && inp.carType !== 'business') {
    // 다자녀 가구 7~10인승: 취득세 면제 (140만원 한도)
    const cap = 1_400_000
    const ded = Math.min(acquisitionTax, cap)
    exemptionSaved += ded
    acquisitionTax -= ded
  } else if (inp.exemption === 'disabled' || inp.exemption === 'merit') {
    // 장애인·국가유공자: 본인 명의 1대 면세
    exemptionSaved += acquisitionTax
    acquisitionTax = 0
  }

  // 공채 실비
  const region = REGIONS.find(r => r.id === inp.regionId) ?? REGIONS[0]
  const bondTotal = inp.carPrice * region.bondRate
  const bondCost = Math.round(bondTotal * BOND_DISCOUNT_RATE)

  const initialTotal = Math.round(acquisitionTax + bondCost + REGISTRATION_FEE)

  // ─── 연간 ───
  const isBusiness = inp.carType === 'business'
  const isEV = inp.carType === 'ev'

  // 자동차세 본세 (현재 시점 — yearsSinceReg 기준)
  let annualBase = isEV ? EV_ANNUAL_TAX : annualTaxByCC(inp.cc, isBusiness)
  const discount = annualTaxAgeDiscount(inp.yearsSinceReg)
  annualBase = annualBase * (1 - discount)
  let annualCarTax = annualBase
  if (inp.prepay) annualCarTax = annualCarTax * (1 - ANNUAL_PREPAY_DISCOUNT)
  const annualEduTax = annualCarTax * EDU_TAX_RATE

  // 환경부담금 (경유차만)
  const annualEnvFee = inp.fuelType === 'diesel' ? dieselEnvironmentFee(inp.cc) : 0

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
  for (let y = 1; y <= inp.yearsToHold; y++) {
    const yearsFromNow = inp.yearsSinceReg + y - 1
    let yearBase = isEV ? EV_ANNUAL_TAX : annualTaxByCC(inp.cc, isBusiness)
    const yDiscount = annualTaxAgeDiscount(yearsFromNow)
    yearBase = yearBase * (1 - yDiscount)
    let yCarTax = yearBase
    if (inp.prepay) yCarTax = yCarTax * (1 - ANNUAL_PREPAY_DISCOUNT)
    const yEduTax = yCarTax * EDU_TAX_RATE
    const yEnvFee = inp.fuelType === 'diesel' ? dieselEnvironmentFee(inp.cc) : 0
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
  multi_child: { name: '다자녀 (18세 미만 3명+)', desc: '7~10인승 차량 등록 시 취득세 면제 (140만원 한도)' },
  disabled:    { name: '장애인 (1~3급)', desc: '본인 명의 1대 — 취득세·자동차세 면제' },
  merit:       { name: '국가유공자',     desc: '본인 명의 1대 — 취득세·자동차세 면제' },
} as const

/* ─── 자동차세 cc별 단가표 (가이드용) ─── */
export const TAX_TABLE_NON_BUSINESS = [
  { range: '~ 1000cc',    perCC: 80,  example: '경차 998cc → 약 80,000원/년' },
  { range: '~ 1600cc',    perCC: 140, example: '아반떼 1.6 → 약 224,000원/년' },
  { range: '1600cc 초과', perCC: 200, example: '쏘나타 2.0 → 약 400,000원/년' },
]

/* ─── 양도 안내 ─── */
export const TRANSFER_NOTE = {
  title: '💰 양도 시점',
  points: [
    '개인이 사업 외 목적으로 사용한 자동차는 양도소득세 비과세 (소득세법 시행령 제162조)',
    '양도 시 보유 일수 비례로 자동차세 자동 환급/환수',
    '영업용·사업자 차량은 사업소득으로 별도 신고',
    '폐차 시 폐차보상금 가능 (조기폐차 지원금 별도)',
    '명의 이전 시 등록세 매수인 부담',
  ],
}

/* ─── 절세 팁 ─── */
export const SAVING_TIPS = [
  { title: '🗓️ 자동차세 연납 (1월)', detail: '1월 일괄 납부 시 약 9.15% 할인. 6/9월 납부 대비 큰 절감' },
  { title: '⚡ 친환경차 선택',         detail: '전기차 취득세 140만원 면제 + 자동차세 13만원 정액. 5년 보유 시 약 200~400만원 절감' },
  { title: '👨‍👩‍👧‍👦 다자녀 가구',      detail: '18세 미만 자녀 3명+ + 7~10인승 등록 시 취득세 면제 (140만원 한도)' },
  { title: '🏥 장애인·국가유공자',     detail: '본인 명의 1대 한정 — 취득세·자동차세 모두 면제' },
  { title: '🛢️ 경유차 회피',           detail: '환경개선부담금 연 8~22만원. 노후 경유차는 조기폐차 지원금 활용' },
  { title: '⏳ 12년 이상 보유',        detail: '자동차세 최대 50% 감면. 장기 보유 가성비 ↑' },
  { title: '🏎️ 배기량 선택',           detail: '1600cc 이하는 cc당 140원, 초과는 200원. 단가 차이로 연 10만원+ 차이' },
]
