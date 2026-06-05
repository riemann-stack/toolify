/* ──────────────────────────────────────────────────────
   finance/car-cost/carCostUtils.ts
   자동차 유지비 — 포맷·감가·구매방식·차종·연료·카쉐어링
   ※ 본 도구는 일반 정보 제공이며 정확한 견적은 캐피탈·보험·정비 전문가 상담 권장.
   ────────────────────────────────────────────────────── */

/* ─── 포맷 (★ "0억" 표기 버그 픽스) ─── */
export function formatKoreanCurrency(amount: number): string {
  if (!isFinite(amount) || isNaN(amount) || amount === 0) return '0원'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs < 100_000_000) {
    const manwon = Math.round(abs / 10_000)
    return `${sign}${manwon.toLocaleString('ko-KR')}만원`
  }
  const eok = Math.floor(abs / 100_000_000)
  const remainder = abs - eok * 100_000_000
  if (remainder < 5_000) return `${sign}${eok}억원`
  const manwon = Math.round(remainder / 10_000)
  if (manwon === 0) return `${sign}${eok}억원`
  return `${sign}${eok}억 ${manwon.toLocaleString('ko-KR')}만원`
}

export function formatKRW(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) return '0원'
  return Math.round(amount).toLocaleString('ko-KR') + '원'
}

export function formatNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR')
}

export function parseAmount(input: string): number {
  if (!input) return 0
  const cleaned = input.replace(/[^0-9.]/g, '')
  if (!cleaned) return 0
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

/* ─── 감가율 (한국 시장 평균) ─── */
export interface CarCategory {
  id: string
  name: string
  depreciationRate: number   // 연간 감가율
  exampleCars: string[]
  basePrice: number          // 평균 가격 (참고)
}

export const CAR_CATEGORIES: CarCategory[] = [
  { id: 'compact-kr',  name: '국산 경·소형',     depreciationRate: 0.10, exampleCars: ['모닝', '레이', '캐스퍼', '아반떼'], basePrice: 23_000_000 },
  { id: 'midsize-kr',  name: '국산 중형',        depreciationRate: 0.10, exampleCars: ['쏘나타', 'K5', '그랜저'], basePrice: 32_000_000 },
  { id: 'large-kr',    name: '국산 대형·SUV',    depreciationRate: 0.12, exampleCars: ['투싼', '쏘렌토', '팰리세이드'], basePrice: 45_000_000 },
  { id: 'imported',    name: '수입차',           depreciationRate: 0.13, exampleCars: ['BMW 3시리즈', '벤츠 C클래스'], basePrice: 60_000_000 },
  { id: 'electric',    name: '전기차',           depreciationRate: 0.18, exampleCars: ['아이오닉5', 'EV6', '테슬라 모델3'], basePrice: 48_000_000 },
  { id: 'hybrid',      name: '하이브리드',       depreciationRate: 0.11, exampleCars: ['쏘나타 HEV', 'K5 HEV'], basePrice: 35_000_000 },
]

/* ─── 한국 자동차 보험료 평균 (2026년) ─── */
export interface InsuranceAvg {
  ageRange: string
  yearly: number
  note: string
}

export const KOREA_INSURANCE_AVG: InsuranceAvg[] = [
  { ageRange: '20대 신규',         yearly: 1_500_000, note: '경력 X · 가장 비쌈' },
  { ageRange: '30대 안정',         yearly:   900_000, note: '경력 5년+' },
  { ageRange: '40~50대 무사고',    yearly:   700_000, note: '최저 구간' },
  { ageRange: '60대+',             yearly:   800_000, note: '연령 할증 시작' },
]

/* ─── 한국 자동차세 자동 (배기량별) ─── */
export interface AutoTaxBracket {
  ccMax: number
  yearly: number
  desc: string
}

// 비영업용 승용차 자동차세 = cc × (80/140/200원) + 지방교육세 30%. 아래는 교육세 포함 실납부 기준.
export const AUTO_TAX_BRACKETS: AutoTaxBracket[] = [
  { ccMax: 1000,     yearly:  104_000, desc: '경차 (1,000cc 이하)' },
  { ccMax: 1500,     yearly:  260_000, desc: '소형 (1,500cc 이하)' },
  { ccMax: 2000,     yearly:  520_000, desc: '준중형·중형 (2,000cc 이하)' },
  { ccMax: 2500,     yearly:  650_000, desc: '중형~대형 (2,500cc 이하)' },
  { ccMax: 3000,     yearly:  780_000, desc: '대형 (3,000cc 이하)' },
  { ccMax: Infinity, yearly: 1_040_000, desc: '대형 SUV (3,000cc 초과)' },
]

export const EV_AUTO_TAX = 130_000   // 전기차 정액 (10만 + 교육세 3만)

export function autoTaxByCC(cc: number): number {
  return AUTO_TAX_BRACKETS.find(b => cc <= b.ccMax)?.yearly ?? 800_000
}

/* ─── 연료 데이터 (2026년 5월 기준) ─── */
export interface FuelData {
  id: string
  name: string
  pricePerUnit: number     // 원/L 또는 원/kWh
  unit: 'L' | 'kWh'
  avgEfficiency: number    // km/L 또는 km/kWh
}

export const FUEL_DATA_2026: FuelData[] = [
  { id: 'gasoline',     name: '가솔린',          pricePerUnit: 1650, unit: 'L',   avgEfficiency: 12 },
  { id: 'diesel',       name: '경유',            pricePerUnit: 1500, unit: 'L',   avgEfficiency: 14 },
  { id: 'lpg',          name: 'LPG',             pricePerUnit: 1000, unit: 'L',   avgEfficiency: 9 },
  { id: 'hybrid',       name: '하이브리드',      pricePerUnit: 1650, unit: 'L',   avgEfficiency: 18 },
  { id: 'electric',     name: '전기 (가정 충전)', pricePerUnit:  200, unit: 'kWh', avgEfficiency: 5 },
  { id: 'electricFast', name: '전기 (급속)',     pricePerUnit:  350, unit: 'kWh', avgEfficiency: 5 },
]

/* ─── 카쉐어링 평균 (2026년 쏘카 기준) ─── */
export const CARSHARING_RATES = {
  hourlyRate: 8_000,       // 원/시간 (소형)
  perKmRate: 200,          // 원/km
  avgHoursPer100km: 3,     // 100km당 평균 사용 시간 (참고)
}

/* ─── 메인 유지비 계산 (★ 할부 버그 수정) ─── */
export interface MaintenanceInput {
  fuelType: 'gas' | 'ev' | 'hybrid'
  monthlyKm: number
  // 가솔린·하이브리드
  efficiency?: number
  fuelPrice?: number
  // 전기차
  evEfficiency?: number
  chargePrice?: number
  // 고정비
  insuranceYearly: number
  carTaxYearly: number
  parkingMonthly: number
  // 할부 (★ 새 구조: 월 + 남은 개월)
  loanMonthly: number
  loanRemainingMonths: number
  // 변동비
  variableCostMonthly: number   // 엔진오일·타이어·정비비 평균
  washMonthly: number
  // 감가
  depreciationOn: boolean
  depreciationMonthly: number
}

export interface MaintenanceResult {
  fuelMonthly: number
  fixedMonthly: number       // 보험·세금·주차
  variableMonthly: number    // 변동·세차
  loanMonthly: number        // 현재 시점 할부
  monthlyExclDepr: number
  monthlyInclDepr: number
  // 기간별 총비용 (할부 잔여 월수만 가산)
  threeYearExcl: number
  threeYearIncl: number
  fiveYearExcl: number
  fiveYearIncl: number
  tenYearExcl: number
  tenYearIncl: number
  perKm: number
  breakdown: { key: string; label: string; icon: string; value: number; color: string }[]
}

export function calcMaintenance(input: MaintenanceInput): MaintenanceResult {
  // 연료비
  const fuelMonthly = input.fuelType === 'ev'
    ? (input.monthlyKm / Math.max(0.1, input.evEfficiency ?? 5)) * (input.chargePrice ?? 200)
    : (input.monthlyKm / Math.max(0.1, input.efficiency ?? 12)) * (input.fuelPrice ?? 1650)

  const insuranceMonthly = input.insuranceYearly / 12
  const carTaxMonthly = input.carTaxYearly / 12
  const fixedMonthly = insuranceMonthly + carTaxMonthly + input.parkingMonthly
  const variableMonthly = input.variableCostMonthly + input.washMonthly

  const monthlyExclDepr = fuelMonthly + fixedMonthly + variableMonthly + input.loanMonthly
  const monthlyInclDepr = monthlyExclDepr + (input.depreciationOn ? input.depreciationMonthly : 0)

  // 기간별 총비용 (할부는 잔여 월수만 가산)
  const calcPeriod = (months: number) => {
    const baseMonthly = fuelMonthly + fixedMonthly + variableMonthly
    const loanCost = Math.min(months, input.loanRemainingMonths) * input.loanMonthly
    const deprCost = input.depreciationOn ? input.depreciationMonthly * months : 0
    return {
      excl: baseMonthly * months + loanCost,
      incl: baseMonthly * months + loanCost + deprCost,
    }
  }

  const m3  = calcPeriod(36)
  const m5  = calcPeriod(60)
  const m10 = calcPeriod(120)

  const perKm = input.monthlyKm > 0 ? monthlyInclDepr / input.monthlyKm : 0

  const breakdown = [
    { key: 'fuel', label: input.fuelType === 'ev' ? '충전비' : '유류비', icon: input.fuelType === 'ev' ? '🔌' : '🛢️', value: fuelMonthly, color: '#EA580C' },
    { key: 'ins',  label: '보험료',     icon: '🛡️', value: insuranceMonthly, color: '#0891B2' },
    { key: 'tax',  label: '자동차세',   icon: '🏛️', value: carTaxMonthly,    color: '#CA8A04' },
    { key: 'park', label: '주차비',     icon: '🅿️', value: input.parkingMonthly, color: '#9B59B6' },
    { key: 'loan', label: '할부금',     icon: '💳', value: input.loanMonthly, color: '#0EA5E9' },
    { key: 'var',  label: '소모품·정비', icon: '🔧', value: variableMonthly,  color: '#059669' },
  ]
  if (input.depreciationOn) {
    breakdown.push({ key: 'depr', label: '감가상각', icon: '📉', value: input.depreciationMonthly, color: '#DC2626' })
  }

  return {
    fuelMonthly, fixedMonthly, variableMonthly, loanMonthly: input.loanMonthly,
    monthlyExclDepr, monthlyInclDepr,
    threeYearExcl: m3.excl, threeYearIncl: m3.incl,
    fiveYearExcl:  m5.excl, fiveYearIncl:  m5.incl,
    tenYearExcl:  m10.excl, tenYearIncl:  m10.incl,
    perKm, breakdown,
  }
}

/* ─── 구매 방식 비교 ─── */
export interface PurchaseInput {
  carPrice: number
  carCategory: string
  yearsOfHold: number
  variableCostMonthly: number
  insuranceYearly: number
  carTaxYearly: number
  parkingMonthly: number
  fuelMonthly: number
  // 할부
  loanRate: number
  loanMonths: number
  loanDownPayment: number
  // 리스·렌트 (월 비용)
  monthlyLeaseRate?: number
  monthlyRentRate?: number
}

export interface ModeResult {
  mode: '현금' | '할부' | '리스' | '장기렌트'
  totalCost: number          // 보유 기간 총비용
  monthly: number            // 월 평균
  ownership: string
  detail: string
  pros: string
  cons: string
}

export function comparePurchaseModes(input: PurchaseInput): {
  results: ModeResult[]
  best: ModeResult
} {
  const cat = CAR_CATEGORIES.find(c => c.id === input.carCategory) ?? CAR_CATEGORIES[1]
  const depRate = cat.depreciationRate
  const years = Math.max(1, input.yearsOfHold)
  const months = years * 12

  const baseMonthly = input.variableCostMonthly + input.insuranceYearly / 12 + input.carTaxYearly / 12 + input.parkingMonthly + input.fuelMonthly
  const baseTotalNoLoan = baseMonthly * months

  // 1. 현금 구매
  const finalValue = input.carPrice * Math.pow(1 - depRate, years)
  const cashDepCost = input.carPrice - finalValue
  const cashTotal = cashDepCost + baseTotalNoLoan
  const cash: ModeResult = {
    mode: '현금', totalCost: cashTotal, monthly: cashTotal / months,
    ownership: '✅ 즉시 소유',
    detail: `차량 ${formatKoreanCurrency(input.carPrice)} 일시 지불 · ${years}년 후 매각가 약 ${formatKoreanCurrency(finalValue)}`,
    pros: '이자 X · 가장 저렴',
    cons: '초기 자금 큼 · 다른 투자 기회 손실',
  }

  // 2. 할부 구매
  const loanPrincipal = Math.max(0, input.carPrice - input.loanDownPayment)
  const monthlyRate = input.loanRate / 100 / 12
  let monthlyLoanPayment = 0
  let totalLoanInterest = 0
  if (loanPrincipal > 0 && input.loanMonths > 0 && monthlyRate > 0) {
    monthlyLoanPayment = loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, input.loanMonths))
      / (Math.pow(1 + monthlyRate, input.loanMonths) - 1)
    totalLoanInterest = monthlyLoanPayment * input.loanMonths - loanPrincipal
  } else if (loanPrincipal > 0 && input.loanMonths > 0) {
    monthlyLoanPayment = loanPrincipal / input.loanMonths
  }
  // 보유 기간이 할부 기간보다 짧으면 매각 시 남은 대출 잔액을 정산해야 함 (무시하면 할부가 비현실적으로 저렴해짐)
  let remainingLoanBalance = 0
  if (months < input.loanMonths && loanPrincipal > 0) {
    remainingLoanBalance = monthlyRate > 0
      ? loanPrincipal * (Math.pow(1 + monthlyRate, input.loanMonths) - Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, input.loanMonths) - 1)
      : loanPrincipal * (input.loanMonths - months) / input.loanMonths
  }
  const loanCostInPeriod = Math.min(months, input.loanMonths) * monthlyLoanPayment + remainingLoanBalance + input.loanDownPayment
  const loanTotal = loanCostInPeriod - finalValue + baseTotalNoLoan
  const loan: ModeResult = {
    mode: '할부', totalCost: loanTotal, monthly: loanTotal / months,
    ownership: '✅ 할부 종료 후 소유',
    detail: `선수금 ${formatKoreanCurrency(input.loanDownPayment)} + 월 ${formatKoreanCurrency(monthlyLoanPayment)} × ${input.loanMonths}개월 (이자 ${formatKoreanCurrency(totalLoanInterest)})`,
    pros: '초기 자금 ↓ · 신용 점수 향상',
    cons: `이자 약 ${formatKoreanCurrency(totalLoanInterest)} 추가 부담`,
  }

  // 3. 리스 (월 + 보험·정비·주차 별도)
  const leaseMonthly = (input.monthlyLeaseRate ?? input.carPrice * 0.025) + input.variableCostMonthly + input.insuranceYearly / 12 + input.parkingMonthly + input.fuelMonthly
  const leaseTotal = leaseMonthly * months
  const lease: ModeResult = {
    mode: '리스', totalCost: leaseTotal, monthly: leaseMonthly,
    ownership: '❌ 비소유 (잔존가치 인수 옵션)',
    detail: `월 리스료 ${formatKoreanCurrency(input.monthlyLeaseRate ?? input.carPrice * 0.025)} (보험·정비 별도)`,
    pros: '사업자 비용 처리 · 신차 자주 교체',
    cons: '총비용 큼 · 잔존가치·중도 해지 페널티',
  }

  // 4. 장기렌트 (월 납입 + 주차, 보험·정비 포함)
  const rentMonthly = (input.monthlyRentRate ?? input.carPrice * 0.028) + input.parkingMonthly + input.fuelMonthly
  const rentTotal = rentMonthly * months
  const rent: ModeResult = {
    mode: '장기렌트', totalCost: rentTotal, monthly: rentMonthly,
    ownership: '❌ 비소유',
    detail: `월 렌트료 ${formatKoreanCurrency(input.monthlyRentRate ?? input.carPrice * 0.028)} (보험·정비 포함, 연료 별도)`,
    pros: '관리 편함 · 보험·정비 포함',
    cons: '가장 비쌈 · 차량 손상 시 추가 비용',
  }

  const results = [cash, loan, lease, rent]
  const best = results.reduce((min, cur) => cur.totalCost < min.totalCost ? cur : min)
  return { results, best }
}

/* ─── 차종 비교 ─── */
export interface CarCompareInput {
  name: string
  carPrice: number
  fuelTypeId: string         // 'gasoline' | 'diesel' | ...
  efficiency: number          // km/L 또는 km/kWh
  insuranceYearly: number
  carTaxYearly: number
  variableCostMonthly: number
  parkingMonthly: number
  depreciationRate: number   // 연간 (%)
}

export interface CarCompareResult {
  name: string
  yearlyFuel: number
  yearlyInsurance: number
  yearlyTax: number
  yearlyVariable: number
  yearlyDep: number
  yearlyTotal: number
  fiveYearTotal: number
  perKm: number
}

export function compareCarSpecs(
  cars: CarCompareInput[],
  monthlyKm: number,
): CarCompareResult[] {
  return cars.map(car => {
    const fuel = FUEL_DATA_2026.find(f => f.id === car.fuelTypeId) ?? FUEL_DATA_2026[0]
    const annualKm = monthlyKm * 12
    const yearlyFuel = (annualKm / Math.max(0.1, car.efficiency)) * fuel.pricePerUnit
    const yearlyVariable = (car.variableCostMonthly + car.parkingMonthly) * 12
    const yearlyDep = car.carPrice * (car.depreciationRate / 100)
    const yearlyTotal = yearlyFuel + car.insuranceYearly + car.carTaxYearly + yearlyVariable + yearlyDep
    return {
      name: car.name,
      yearlyFuel: Math.round(yearlyFuel),
      yearlyInsurance: Math.round(car.insuranceYearly),
      yearlyTax: Math.round(car.carTaxYearly),
      yearlyVariable: Math.round(yearlyVariable),
      yearlyDep: Math.round(yearlyDep),
      yearlyTotal: Math.round(yearlyTotal),
      fiveYearTotal: Math.round(yearlyTotal * 5),
      perKm: annualKm > 0 ? Math.round(yearlyTotal / annualKm) : 0,
    }
  })
}

/* ─── 연료 타입 비교 ─── */
export interface FuelCompareInput {
  carPrice: number
  monthlyKm: number
  yearsOfHold: number
  customDepRate?: number
}

export interface FuelCompareRow {
  fuel: FuelData
  carPrice: number
  yearlyFuelCost: number
  totalFuelCost: number       // 보유 기간
  yearlyDep: number
  totalDep: number
  totalCost: number           // 연료 + 감가
}

export function compareFuelTypes(
  cars: { fuelId: string; carPrice: number; depRate: number }[],
  monthlyKm: number,
  yearsOfHold: number,
): FuelCompareRow[] {
  return cars.map(c => {
    const fuel = FUEL_DATA_2026.find(f => f.id === c.fuelId) ?? FUEL_DATA_2026[0]
    const yearlyFuelCost = (monthlyKm * 12 / Math.max(0.1, fuel.avgEfficiency)) * fuel.pricePerUnit
    const totalFuelCost = yearlyFuelCost * yearsOfHold
    const finalValue = c.carPrice * Math.pow(1 - c.depRate / 100, yearsOfHold)
    const totalDep = c.carPrice - finalValue
    const yearlyDep = totalDep / yearsOfHold
    return {
      fuel,
      carPrice: c.carPrice,
      yearlyFuelCost: Math.round(yearlyFuelCost),
      totalFuelCost: Math.round(totalFuelCost),
      yearlyDep: Math.round(yearlyDep),
      totalDep: Math.round(totalDep),
      totalCost: Math.round(totalFuelCost + totalDep),
    }
  })
}

/* ─── 카쉐어링 vs 보유 ─── */
export interface CarShareCompareRow {
  monthlyKm: number
  ownCost: number             // 보유 시 월 비용 (감가 포함)
  shareCost: number           // 쏘카 추정 월 비용
  winner: '보유' | '쏘카' | '비슷'
  diff: number                // 절약액 (보유 - 쏘카)
}

export function compareOwnVsShare(
  nonFuelMonthly: number,        // 고정비+변동비+할부 (주행거리와 무관, 고정)
  fuelPerKm: number,             // 1km당 연료비 (주행거리에 비례)
  monthlyKmRange: number[] = [200, 500, 800, 1000, 1200, 1500, 2000],
): CarShareCompareRow[] {
  return monthlyKmRange.map(km => {
    // 보유 비용도 행마다 주행거리에 맞춰 연료비를 재계산 (고정비는 고정)
    const ownCost = nonFuelMonthly + fuelPerKm * km
    const hours = km / (100 / CARSHARING_RATES.avgHoursPer100km)  // 100km당 3시간 → 1km당 0.03시간
    const shareCost = hours * CARSHARING_RATES.hourlyRate + km * CARSHARING_RATES.perKmRate
    const diff = ownCost - shareCost
    let winner: '보유' | '쏘카' | '비슷'
    if (Math.abs(diff) < 30_000) winner = '비슷'
    else if (diff > 0) winner = '쏘카'
    else winner = '보유'
    return {
      monthlyKm: km,
      ownCost: Math.round(ownCost),
      shareCost: Math.round(shareCost),
      winner,
      diff: Math.round(diff),
    }
  })
}

/* ─── 소모품 ─── */
export interface Consumable {
  key: string
  name: string
  icon: string
  cost: number
  cycleKm: number | null
  cycleMon: number | null
  enabled: boolean
}

export const DEFAULT_CONSUMABLES: Omit<Consumable, 'enabled'>[] = [
  { key: 'oil',     name: '엔진오일',      icon: '🛢️', cost:  80_000, cycleKm: 10_000, cycleMon: 12 },
  { key: 'air',     name: '에어컨 필터',   icon: '🌬️', cost:  20_000, cycleKm:   null, cycleMon:  6 },
  { key: 'wiper',   name: '와이퍼',        icon: '🧹', cost:  30_000, cycleKm:   null, cycleMon: 12 },
  { key: 'tire',    name: '타이어 (4개)',  icon: '⚫', cost: 600_000, cycleKm: 40_000, cycleMon: null },
  { key: 'battery', name: '배터리',        icon: '🔋', cost: 150_000, cycleKm:   null, cycleMon: 36 },
  { key: 'brake',   name: '브레이크 패드', icon: '⚙️', cost: 150_000, cycleKm: 40_000, cycleMon: null },
  { key: 'inspect', name: '정기검사',      icon: '📋', cost:  50_000, cycleKm:   null, cycleMon: 24 },
  { key: 'wash',    name: '세차비',        icon: '🚿', cost:  20_000, cycleKm:   null, cycleMon:  1 },
]

export function calcMonthlyConsumable(c: Consumable, monthlyKm: number): number {
  if (!c.enabled) return 0
  // 교체까지 걸리는 개월 수 (정의된 주기만). km·개월 둘 다면 먼저 도달하는(짧은) 쪽이 교체 시점.
  const monthsByKm = c.cycleKm && monthlyKm > 0 ? c.cycleKm / monthlyKm : Infinity
  const monthsByMon = c.cycleMon ? c.cycleMon : Infinity
  const interval = Math.min(monthsByKm, monthsByMon)
  return isFinite(interval) && interval > 0 ? c.cost / interval : 0
}
