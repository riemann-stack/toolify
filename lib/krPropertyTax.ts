/* 주택 보유세(재산세 + 종합부동산세) 계산 — 2026 기준 단일소스.
   출처: 위택스·행안부 지방세법(재산세), 국세청·종합부동산세법(종부세).
   ※ 2026 종부세 개편(기본공제 상향·통일)이 논의 중 — 본 lib은 현행 법정 체계(1주택 12억/일반 9억) 기준이며
     확정 고지액은 위택스/홈택스 확인(면책). 세부담상한·과세표준상한·공동명의는 미반영.
   다주택은 주택별 공시가격(publicPrices)을 받아 재산세는 물건별 과세 후 합산, 종부세는 합산 과세한다.
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
export const PROP_STD_TOP_RATE = 0.004 // 재산세 표준세율(과표 3억 초과 구간) — 종부세 중복분 공제 산식의 '재산세 표준세율'
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
  propOverlap: number    // 재산세 중복분 공제 (종부세법 시행령 §4의3 비율식)
  creditRate: number     // 1주택 세액공제율(고령+장기, 상한 80%)
  decidedTax: number     // 결정세액
  ruralTax: number       // 농어촌특별세
  total: number          // 종부세 합계
}

/** 종부세.
 *  propStandardBaseTax = 주택분 재산세를 표준세율로 계산한 재산세 상당액(주택별 합계) — 중복분 공제 분모
 *  propFmvRatio        = 재산세 공정시장가액비율(1세대1주택 특례 43~45%, 그 외 60%) — 중복분 공제 분자
 *  propLeviedBaseTax   = 주택분 재산세로 부과된 세액(본세, 주택별 합계). 생략 시 표준세율 상당액과 같다고 본다. */
export function calcCompTax(
  publicPrice: number,
  houses: HouseCount,
  oneHouse: boolean,
  holdYears: number,
  age: number,
  propStandardBaseTax: number,
  propFmvRatio: number = 0.6,
  propLeviedBaseTax: number = propStandardBaseTax,
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

  // 재산세 중복분 공제 (종부세법 시행령 §4의3①):
  //   공제액 = 부과된 재산세 × (종부세 과표 × 재산세 공정시장가액비율 × 재산세 표준세율) ÷ 표준세율로 계산한 재산세 상당액
  //   종부세 과표에는 이미 종부세 공정시장가액비율(60%)이 곱해져 있다.
  const overlapNumer = taxBase * Math.max(0, propFmvRatio) * PROP_STD_TOP_RATE
  const overlapRatio = propStandardBaseTax > 0 ? Math.min(1, overlapNumer / propStandardBaseTax) : 0
  const propOverlap = Math.min(computedTax, Math.round(Math.max(0, propLeviedBaseTax) * overlapRatio))

  // 1세대1주택 세액공제(고령자+장기보유, 상한 80%)
  const creditRate = oneHouse ? Math.min(0.8, compElderRate(age) + compLongHoldRate(holdYears)) : 0
  const decidedTax = Math.max(0, Math.round((computedTax - propOverlap) * (1 - creditRate)))
  const ruralTax = Math.round(decidedTax * COMP_RURAL_RATE)
  return { taxable: true, deduction, taxBase, computedTax, propOverlap, creditRate, decidedTax, ruralTax, total: decidedTax + ruralTax }
}

/* ── 총 보유세 ── */

export interface HoldingTaxInput {
  /** 공시가격 (다주택이면 합계). publicPrices가 있으면 그 합계로 대체된다 */
  publicPrice: number
  /** 다주택 주택별 공시가격 — 재산세는 물건별 과세라 주택마다 계산해 합산 (0 이하 항목은 무시) */
  publicPrices?: number[]
  houses: HouseCount
  oneHouse: boolean
  urbanArea: boolean
  holdYears: number
  age: number
}

export interface HoldingTaxResult {
  property: PropertyTaxResult   // 다주택이면 주택별 재산세의 합계
  /** 주택별 재산세 (publicPrices 입력 시) */
  perHouse: PropertyTaxResult[]
  comp: CompTaxResult
  total: number          // 총 보유세 = 재산세 + 종부세
  effectiveRate: number  // 공시가격 대비 실효세율
  monthly: number        // 월 환산(참고)
}

export function calcHoldingTax(input: HoldingTaxInput): HoldingTaxResult {
  // 1세대1주택 혜택(재산세 특례·종부세 12억 공제·세액공제)은 보유주택 1채일 때만 유효.
  // 모순 입력(oneHouse=true & houses>=2) 방어를 위해 단일 진입점에서 정규화.
  const oneHouse = input.oneHouse && input.houses === 1
  const list = (input.publicPrices ?? []).filter(v => Number.isFinite(v) && v > 0)
  const prices = list.length > 0 ? list : [Math.max(0, input.publicPrice)]
  const publicPrice = prices.reduce((a, b) => a + b, 0)

  // 재산세: 물건별 과세 → 주택마다 계산해 합산
  const perHouse = prices.map(p => calcPropertyTax(p, oneHouse, input.urbanArea))
  const property: PropertyTaxResult = perHouse.length === 1 ? perHouse[0] : {
    fmvRatio: perHouse[0].fmvRatio,
    taxBase: perHouse.reduce((a, r) => a + r.taxBase, 0),
    specialRate: false,
    baseTax: perHouse.reduce((a, r) => a + r.baseTax, 0),
    urbanTax: perHouse.reduce((a, r) => a + r.urbanTax, 0),
    eduTax: perHouse.reduce((a, r) => a + r.eduTax, 0),
    total: perHouse.reduce((a, r) => a + r.total, 0),
  }
  // 중복분 공제 분모: 주택별로 표준세율을 적용한 재산세 상당액의 합 (특례세율과 무관)
  const stdBase = perHouse.reduce((a, r) => a + marginalTax(r.taxBase, PROP_STD_BANDS), 0)
  // 분자용 재산세 공정시장가액비율: 주택별 비율의 공시가격 가중평균
  // ※ 1세대1주택 특례비율(43~45%)을 분자에 쓰는 해석 — 종부세법 시행령 §4의3이 참조하는
  //   '지방세법 시행령 §109 공정시장가액비율'이 특례비율인지 일반 60%인지 원문 재확인 필요.
  //   60%라면 1주택 20억 종부세 2,275,200 → 1,929,600원(-15.2%). (2026-09 개편 시 미확인 항목)
  const fmvWeighted = publicPrice > 0
    ? perHouse.reduce((a, r, i) => a + r.fmvRatio * prices[i], 0) / publicPrice
    : property.fmvRatio
  const comp = calcCompTax(publicPrice, input.houses, oneHouse, input.holdYears, input.age, stdBase, fmvWeighted, property.baseTax)
  const total = property.total + comp.total
  const effectiveRate = publicPrice > 0 ? total / publicPrice : 0
  return { property, perHouse: list.length > 0 ? perHouse : [], comp, total, effectiveRate, monthly: Math.round(total / 12) }
}
