/* 주택 보유세(재산세 + 종합부동산세) 계산 — 2026 기준 단일소스.
   출처: 위택스·행안부 지방세법(재산세), 국세청·종합부동산세법(종부세).
   ※ 2026 종부세 개편(기본공제 상향·통일)이 논의 중 — 본 lib은 현행 법정 체계(1주택 12억/일반 9억) 기준이며
     확정 고지액은 위택스/홈택스 확인(면책). 세부담상한·공동명의·합산 정밀·재산세 중복공제는 약식/미반영.
   단위: 원. 누진은 마진 브래킷(base + 초과×rate) 방식. */

export type HouseCount = 1 | 2 | 3 // 3 = 3주택 이상

interface RateBand {
  upTo: number   // 과세표준 상한(이하)
  rate: number   // 한계세율
  base: number   // 하한까지 누적 세액
}

function marginalTax(taxBase: number, bands: RateBand[]): number {
  if (taxBase <= 0) return 0
  let lower = 0
  for (const b of bands) {
    if (taxBase <= b.upTo) return Math.round(b.base + (taxBase - lower) * b.rate)
    lower = b.upTo
  }
  const last = bands[bands.length - 1]
  return Math.round(last.base + (taxBase - lower) * last.rate)
}

/* ── 재산세(주택분) ── */

/** 1세대1주택 재산세 공정시장가액비율 특례(2026 한시): 3억↓ 43% / 3~6억 44% / 6억↑ 45%. 그 외 60% */
export function propertyFmvRatio(publicPrice: number, oneHouse: boolean): number {
  if (!oneHouse) return 0.6
  if (publicPrice <= 300_000_000) return 0.43
  if (publicPrice <= 600_000_000) return 0.44
  return 0.45
}

// 재산세 표준세율 (과표 6천만/1.5억/3억 경계)
const PROP_STD_BANDS: RateBand[] = [
  { upTo: 60_000_000, rate: 0.001, base: 0 },
  { upTo: 150_000_000, rate: 0.0015, base: 60_000 },
  { upTo: 300_000_000, rate: 0.0025, base: 195_000 },
  { upTo: Infinity, rate: 0.004, base: 570_000 },
]
// 재산세 1세대1주택 특례세율 (공시 9억 이하 1주택만)
const PROP_SPECIAL_BANDS: RateBand[] = [
  { upTo: 60_000_000, rate: 0.0005, base: 0 },
  { upTo: 150_000_000, rate: 0.001, base: 30_000 },
  { upTo: 300_000_000, rate: 0.002, base: 120_000 },
  { upTo: Infinity, rate: 0.0035, base: 420_000 },
]

export const PROP_SPECIAL_RATE_CAP = 900_000_000 // 재산세 특례세율은 1주택 공시 9억 이하만
export const URBAN_AREA_RATE = 0.0014 // 도시지역분 = 과표 × 0.14%
export const LOCAL_EDU_RATE = 0.2 // 지방교육세 = 재산세 본세 × 20%

export interface PropertyTaxResult {
  fmvRatio: number
  taxBase: number       // 재산세 과세표준 = 공시 × FMV
  specialRate: boolean  // 1주택 특례세율 적용 여부
  baseTax: number       // 재산세 본세
  urbanTax: number      // 도시지역분
  eduTax: number        // 지방교육세
  total: number         // 재산세 합계
}

export function calcPropertyTax(
  publicPrice: number,
  oneHouse: boolean,
  urbanArea: boolean,
): PropertyTaxResult {
  const P = Math.max(0, publicPrice)
  const fmvRatio = propertyFmvRatio(P, oneHouse)
  const taxBase = Math.round(P * fmvRatio)
  const specialRate = oneHouse && P <= PROP_SPECIAL_RATE_CAP
  const baseTax = marginalTax(taxBase, specialRate ? PROP_SPECIAL_BANDS : PROP_STD_BANDS)
  const urbanTax = urbanArea ? Math.round(taxBase * URBAN_AREA_RATE) : 0
  const eduTax = Math.round(baseTax * LOCAL_EDU_RATE)
  return { fmvRatio, taxBase, specialRate, baseTax, urbanTax, eduTax, total: baseTax + urbanTax + eduTax }
}

/* ── 종합부동산세(주택분) ── */

export const COMP_DEDUCT_ONEHOUSE = 1_200_000_000 // 1세대1주택 기본공제 12억
export const COMP_DEDUCT_GENERAL = 900_000_000 // 일반 기본공제 9억
export const COMP_FMV_RATIO = 0.6 // 종부세 공정시장가액비율 60%
export const COMP_RURAL_RATE = 0.2 // 농어촌특별세 = 결정세액 × 20%

// 종부세 일반세율(2주택 이하)
const COMP_GENERAL_BANDS: RateBand[] = [
  { upTo: 300_000_000, rate: 0.005, base: 0 },
  { upTo: 600_000_000, rate: 0.007, base: 1_500_000 },
  { upTo: 1_200_000_000, rate: 0.01, base: 3_600_000 },
  { upTo: 2_500_000_000, rate: 0.013, base: 9_600_000 },
  { upTo: 5_000_000_000, rate: 0.015, base: 26_500_000 },
  { upTo: 9_400_000_000, rate: 0.02, base: 64_000_000 },
  { upTo: Infinity, rate: 0.027, base: 152_000_000 },
]
// 종부세 중과세율(3주택 이상) — 12억까지 일반과 동일, 초과분 중과
const COMP_HEAVY_BANDS: RateBand[] = [
  { upTo: 300_000_000, rate: 0.005, base: 0 },
  { upTo: 600_000_000, rate: 0.007, base: 1_500_000 },
  { upTo: 1_200_000_000, rate: 0.01, base: 3_600_000 },
  { upTo: 2_500_000_000, rate: 0.02, base: 9_600_000 },
  { upTo: 5_000_000_000, rate: 0.03, base: 35_600_000 },
  { upTo: 9_400_000_000, rate: 0.04, base: 110_600_000 },
  { upTo: Infinity, rate: 0.05, base: 286_600_000 },
]

/** 종부세 고령자 세액공제율 (만나이) */
export function compElderRate(age: number): number {
  if (age >= 70) return 0.4
  if (age >= 65) return 0.3
  if (age >= 60) return 0.2
  return 0
}

/** 종부세 장기보유 세액공제율 (보유년) */
export function compLongHoldRate(holdYears: number): number {
  if (holdYears >= 15) return 0.5
  if (holdYears >= 10) return 0.4
  if (holdYears >= 5) return 0.2
  return 0
}

export interface CompTaxResult {
  taxable: boolean       // 과세대상 여부
  deduction: number      // 기본공제 (12억/9억)
  taxBase: number        // 종부세 과세표준
  computedTax: number    // 산출세액
  propOverlap: number    // 재산세 중복분 공제(약식)
  creditRate: number     // 1주택 세액공제율(고령+장기, 상한 80%)
  decidedTax: number     // 결정세액
  ruralTax: number       // 농어촌특별세
  total: number          // 종부세 합계
}

/** 종부세. propStandardBaseTax = 재산세 표준세율 본세(중복공제 약식 산정용) */
export function calcCompTax(
  publicPrice: number,
  houses: HouseCount,
  oneHouse: boolean,
  holdYears: number,
  age: number,
  propStandardBaseTax: number,
): CompTaxResult {
  const P = Math.max(0, publicPrice)
  const deduction = oneHouse ? COMP_DEDUCT_ONEHOUSE : COMP_DEDUCT_GENERAL
  const taxBase = Math.max(0, Math.round((P - deduction) * COMP_FMV_RATIO))
  const taxable = P > deduction && taxBase > 0
  if (!taxable) {
    return { taxable: false, deduction, taxBase: 0, computedTax: 0, propOverlap: 0, creditRate: 0, decidedTax: 0, ruralTax: 0, total: 0 }
  }
  const bands = houses >= 3 ? COMP_HEAVY_BANDS : COMP_GENERAL_BANDS
  const computedTax = marginalTax(taxBase, bands)

  // 재산세 중복분 공제(약식): 표준 재산세 본세 중 종부세 과세 대상 가액 비율만큼 차감
  const overlapFraction = P > 0 ? Math.max(0, (P - deduction)) / P : 0
  const propOverlap = Math.min(computedTax, Math.round(propStandardBaseTax * overlapFraction))

  // 1세대1주택 세액공제(고령자+장기보유, 상한 80%)
  const creditRate = oneHouse ? Math.min(0.8, compElderRate(age) + compLongHoldRate(holdYears)) : 0
  const decidedTax = Math.max(0, Math.round((computedTax - propOverlap) * (1 - creditRate)))
  const ruralTax = Math.round(decidedTax * COMP_RURAL_RATE)
  return { taxable: true, deduction, taxBase, computedTax, propOverlap, creditRate, decidedTax, ruralTax, total: decidedTax + ruralTax }
}

/* ── 총 보유세 ── */

export interface HoldingTaxInput {
  publicPrice: number
  houses: HouseCount
  oneHouse: boolean
  urbanArea: boolean
  holdYears: number
  age: number
}

export interface HoldingTaxResult {
  property: PropertyTaxResult
  comp: CompTaxResult
  total: number          // 총 보유세 = 재산세 + 종부세
  effectiveRate: number  // 공시가격 대비 실효세율
  monthly: number        // 월 환산(참고)
}

export function calcHoldingTax(input: HoldingTaxInput): HoldingTaxResult {
  // 1세대1주택 혜택(재산세 특례·종부세 12억 공제·세액공제)은 보유주택 1채일 때만 유효.
  // 모순 입력(oneHouse=true & houses>=2) 방어를 위해 단일 진입점에서 정규화.
  const oneHouse = input.oneHouse && input.houses === 1
  const property = calcPropertyTax(input.publicPrice, oneHouse, input.urbanArea)
  // 중복공제 약식 산정에는 재산세 '표준세율' 본세를 사용(특례세율과 무관하게 표준 기준)
  const stdBase = marginalTax(property.taxBase, PROP_STD_BANDS)
  const comp = calcCompTax(input.publicPrice, input.houses, oneHouse, input.holdYears, input.age, stdBase)
  const total = property.total + comp.total
  const effectiveRate = input.publicPrice > 0 ? total / input.publicPrice : 0
  return { property, comp, total, effectiveRate, monthly: Math.round(total / 12) }
}
