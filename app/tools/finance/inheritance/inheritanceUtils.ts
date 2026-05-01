/* ──────────────────────────────────────────────────────
   finance/inheritance/inheritanceUtils.ts
   상속·증여 — 관계 공제·세율·법정상속분·배우자 공제 시뮬·부동산 단순 추정
   ※ 본 도구는 단순 참고용이며 세무 자문 도구가 아닙니다.
   부동산·부담부증여는 매우 단순 추정만 제공합니다.
   정확한 신고는 세무사 필수 (한국세무사회 070-5008-1234).
   ────────────────────────────────────────────────────── */

/* ─── 관계 ─── */
export type Relation =
  | '배우자' | '성인자녀' | '미성년자녀' | '부모' | '조부모'
  | '손자녀' | '며느리사위' | '기타친족' | '타인'

export const RELATIONS: { key: Relation; label: string; cls: string; deduction: number; note?: string }[] = [
  { key: '배우자',      label: '배우자',          cls: 'relSpouse',   deduction: 6_000_000_000 },
  { key: '성인자녀',    label: '성인 자녀',       cls: 'relAdult',    deduction:    50_000_000 },
  { key: '미성년자녀',  label: '미성년 자녀',     cls: 'relMinor',    deduction:    20_000_000 },
  { key: '부모',        label: '부모',            cls: 'relParent',   deduction:    50_000_000 },
  { key: '조부모',      label: '조부모',          cls: 'relParent',   deduction:    50_000_000, note: '직계존속 합산 5천만 한도' },
  { key: '손자녀',      label: '손자녀',          cls: 'relMinor',    deduction:    50_000_000, note: '세대생략 30% 가산' },
  { key: '며느리사위',  label: '며느리·사위',     cls: 'relRelative', deduction:    10_000_000 },
  { key: '기타친족',    label: '기타 친족',       cls: 'relRelative', deduction:    10_000_000 },
  { key: '타인',        label: '타인',            cls: 'relOther',    deduction:             0 },
]

/* 단순 lookup */
export function getDeduction(rel: Relation): number {
  return RELATIONS.find(r => r.key === rel)?.deduction ?? 0
}

/* ─── 자산 종류 ─── */
export type AssetKind = '현금' | '주식' | '부동산' | '기타'
export const ASSET_KINDS: AssetKind[] = ['현금', '주식', '부동산', '기타']

/* ─── 누진세율 ─── */
export interface Bracket {
  min: number
  max: number
  rate: number
  deduction: number
}

export const TAX_BRACKETS: Bracket[] = [
  { min: 0,             max: 100_000_000,   rate: 0.10, deduction: 0           },
  { min: 100_000_000,   max: 500_000_000,   rate: 0.20, deduction: 10_000_000  },
  { min: 500_000_000,   max: 1_000_000_000, rate: 0.30, deduction: 60_000_000  },
  { min: 1_000_000_000, max: 3_000_000_000, rate: 0.40, deduction: 160_000_000 },
  { min: 3_000_000_000, max: Infinity,      rate: 0.50, deduction: 460_000_000 },
]

export function calcProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0
  let bracket: Bracket = TAX_BRACKETS[0]
  for (const b of TAX_BRACKETS) {
    if (taxBase > b.min) bracket = b
  }
  return Math.max(0, taxBase * bracket.rate - bracket.deduction)
}

export function findBracket(taxBase: number): { rate: number; deduction: number } {
  let rate = 0
  let deduction = 0
  for (const b of TAX_BRACKETS) {
    if (taxBase > b.min) {
      rate = b.rate
      deduction = b.deduction
    }
  }
  return { rate, deduction }
}

/* ─── 증여세 ─── */
export interface GiftResult {
  taxableBase: number
  appliedRate: number
  bracketDeduction: number
  calculatedTax: number
  filingDiscount: number
  finalTax: number
  isSkipGeneration?: boolean   // 세대생략 (손자녀)
  surchargeAmount?: number     // 30% 가산
}

export function calcGiftTax(
  amount: number,
  relation: Relation,
  prevGift: number,
  isSkipGeneration = false,
): GiftResult {
  const total = amount + prevGift
  const deduction = getDeduction(relation)
  const taxableBase = Math.max(0, total - deduction)

  const totalTax = calcProgressiveTax(taxableBase)
  const prevTaxBase = Math.max(0, prevGift - deduction)
  const prevTax = calcProgressiveTax(prevTaxBase)
  let calculatedTax = Math.max(0, totalTax - prevTax)

  // 세대생략 가산세 30% (손자녀 증여)
  let surchargeAmount = 0
  if (isSkipGeneration && calculatedTax > 0) {
    surchargeAmount = Math.round(calculatedTax * 0.30)
    calculatedTax += surchargeAmount
  }

  const { rate, deduction: bracketDeduction } = findBracket(taxableBase)
  const filingDiscount = Math.round(calculatedTax * 0.03)
  const finalTax = Math.max(0, calculatedTax - filingDiscount)

  return {
    taxableBase, appliedRate: rate, bracketDeduction,
    calculatedTax, filingDiscount, finalTax,
    isSkipGeneration, surchargeAmount,
  }
}

/* ─── 상속세 ─── */
export interface InheritResult {
  taxableValue: number
  spouseDeduction: number
  spouseLegalLimit: number      // 배우자 법정한도
  appliedDeduction: number      // 일괄/인적 적용분
  financialDeduction: number    // 금융재산공제 (NEW)
  homeDeduction: number         // 동거주택공제 (NEW)
  taxableBase: number
  appliedRate: number
  bracketDeduction: number
  calculatedTax: number
  filingDiscount: number
  finalTax: number
}

export interface InheritInput {
  totalAsset: number
  priorGift: number
  funeral: number
  debt: number
  hasSpouse: boolean
  childCount: number
  otherHeirCount: number
  spouseActualShare?: number    // 배우자 실제 상속분 (선택)
  financialAsset?: number       // 금융재산 (금융재산공제용)
  cohabitHomeValue?: number     // 동거주택 가액 (선택)
}

/* 배우자 법정상속분 비율 */
export function getSpouseLegalShare(childCount: number, parentsAlive: number): number {
  if (childCount > 0) return 1.5 / (1.5 + childCount)
  if (parentsAlive > 0) return 1.5 / (1.5 + parentsAlive)
  return 1.0   // 단독 상속
}

export function calcInheritanceTax(input: InheritInput): InheritResult {
  const { totalAsset, priorGift, funeral, debt, hasSpouse, childCount } = input

  const taxableValue = Math.max(0, totalAsset + priorGift - debt - funeral)

  // 일괄공제 vs 기초공제 + 인적공제
  const baseDeduction = 200_000_000
  const childDeduction = childCount * 50_000_000
  const personalDeduction = baseDeduction + childDeduction
  const lumpSum = 500_000_000
  const appliedDeduction = Math.max(personalDeduction, lumpSum)

  // 배우자 상속공제: max(5억, min(법정한도, 30억, 실제 상속분))
  let spouseDeduction = 0
  let spouseLegalLimit = 0
  if (hasSpouse) {
    spouseLegalLimit = totalAsset * getSpouseLegalShare(childCount, 0)
    const cap = Math.min(spouseLegalLimit, 3_000_000_000)
    if (input.spouseActualShare !== undefined && input.spouseActualShare > 0) {
      // 실제 상속분 기준 (단, 법정한도와 30억 한도 내, 최소 5억 보장)
      spouseDeduction = Math.max(500_000_000, Math.min(input.spouseActualShare, cap))
    } else {
      // 기본 추정: 법정한도와 5억 중 큰 값 (보수적으로 5억 사용 X — 법정한도 사용)
      spouseDeduction = Math.max(500_000_000, cap)
    }
  }

  // 금융재산공제: 금융재산 × 20%, 최대 2억
  const financialDeduction = input.financialAsset !== undefined && input.financialAsset > 0
    ? Math.min(200_000_000, input.financialAsset * 0.20)
    : 0

  // 동거주택공제: 주택 가액의 100%, 최대 6억 (조건 충족 가정)
  const homeDeduction = input.cohabitHomeValue !== undefined && input.cohabitHomeValue > 0
    ? Math.min(600_000_000, input.cohabitHomeValue)
    : 0

  const totalDeduction = appliedDeduction + spouseDeduction + financialDeduction + homeDeduction
  const taxableBase = Math.max(0, taxableValue - totalDeduction)

  const calculatedTax = calcProgressiveTax(taxableBase)
  const { rate, deduction: bracketDeduction } = findBracket(taxableBase)
  const filingDiscount = Math.round(calculatedTax * 0.03)
  const finalTax = Math.max(0, calculatedTax - filingDiscount)

  return {
    taxableValue, spouseDeduction, spouseLegalLimit,
    appliedDeduction, financialDeduction, homeDeduction,
    taxableBase, appliedRate: rate, bracketDeduction,
    calculatedTax, filingDiscount, finalTax,
  }
}

/* ─── 배우자 상속공제 정량 시뮬 ─── */
export interface SpouseSimRow {
  actualShare: number          // 배우자 실제 상속분
  appliedDeduction: number     // 적용된 배우자 공제
  taxableBase: number
  inheritanceTax: number
  isCurrentChoice?: boolean
}

export function simulateSpouseDeduction(
  totalAsset: number, childCount: number, debt: number, funeral: number, financialAsset: number,
): SpouseSimRow[] {
  const legalLimit = totalAsset * getSpouseLegalShare(childCount, 0)
  const sharePoints = [
    0,
    500_000_000,
    Math.min(legalLimit / 2, 1_000_000_000),
    legalLimit,
    Math.min(legalLimit * 1.5, totalAsset),
    totalAsset,
  ].filter(v => v >= 0 && v <= totalAsset)
  // dedupe & sort
  const uniqueShares = Array.from(new Set(sharePoints.map(v => Math.round(v / 1000) * 1000)))
    .sort((a, b) => a - b)

  return uniqueShares.map(actual => {
    const r = calcInheritanceTax({
      totalAsset, priorGift: 0, debt, funeral,
      hasSpouse: true, childCount, otherHeirCount: 0,
      spouseActualShare: actual,
      financialAsset,
    })
    return {
      actualShare: actual,
      appliedDeduction: r.spouseDeduction,
      taxableBase: r.taxableBase,
      inheritanceTax: r.finalTax,
    }
  })
}

/* ─── 상속인별 분배 (법정상속분) ─── */
export interface InheritanceHeir {
  id: string
  name: string
  relation: '배우자' | '자녀' | '부모' | '형제자매'
  legalShare: number       // 0~1
  legalShareAmount: number
  actualRatio: number      // 0~1 (협의 분할 시)
  actualAmount: number
  taxBurden: number
  afterTax: number
  legalReserveRatio: number   // 유류분 비율 (법정 × 1/2 또는 1/3)
  legalReserveAmount: number
}

export interface DistributionInput {
  totalEstate: number
  totalInheritanceTax: number
  hasSpouse: boolean
  childrenCount: number
  parentsAlive: number       // 0/1/2 (자녀 없을 때만)
  siblingsCount: number      // (배우자·자녀·부모 모두 없을 때)
  customRatios?: { [heirId: string]: number }
}

export function calcInheritanceDistribution(input: DistributionInput): {
  heirs: InheritanceHeir[]
  noHeir: boolean
} {
  const heirs: InheritanceHeir[] = []
  const e = input.totalEstate

  const pushHeir = (
    id: string, name: string,
    relation: InheritanceHeir['relation'],
    legalShare: number,
  ) => {
    const reserveRatio = (relation === '배우자' || relation === '자녀') ? 0.5 : 1/3
    heirs.push({
      id, name, relation,
      legalShare,
      legalShareAmount: Math.round(e * legalShare),
      actualRatio: legalShare,
      actualAmount: 0, taxBurden: 0, afterTax: 0,
      legalReserveRatio: legalShare * reserveRatio,
      legalReserveAmount: Math.round(e * legalShare * reserveRatio),
    })
  }

  if (input.hasSpouse && input.childrenCount > 0) {
    const total = 1.5 + input.childrenCount
    pushHeir('spouse', '배우자', '배우자', 1.5 / total)
    for (let i = 0; i < input.childrenCount; i++) {
      pushHeir(`child-${i+1}`, `자녀 ${i+1}`, '자녀', 1 / total)
    }
  } else if (input.hasSpouse && input.childrenCount === 0 && input.parentsAlive > 0) {
    const total = 1.5 + input.parentsAlive
    pushHeir('spouse', '배우자', '배우자', 1.5 / total)
    for (let i = 0; i < input.parentsAlive; i++) {
      pushHeir(`parent-${i+1}`, `부모 ${i+1}`, '부모', 1 / total)
    }
  } else if (input.hasSpouse && input.childrenCount === 0 && input.parentsAlive === 0) {
    pushHeir('spouse', '배우자', '배우자', 1.0)
  } else if (input.childrenCount > 0) {
    for (let i = 0; i < input.childrenCount; i++) {
      pushHeir(`child-${i+1}`, `자녀 ${i+1}`, '자녀', 1 / input.childrenCount)
    }
  } else if (input.parentsAlive > 0) {
    for (let i = 0; i < input.parentsAlive; i++) {
      pushHeir(`parent-${i+1}`, `부모 ${i+1}`, '부모', 1 / input.parentsAlive)
    }
  } else if (input.siblingsCount > 0) {
    for (let i = 0; i < input.siblingsCount; i++) {
      pushHeir(`sibling-${i+1}`, `형제자매 ${i+1}`, '형제자매', 1 / input.siblingsCount)
    }
  }

  if (heirs.length === 0) {
    return { heirs: [], noHeir: true }
  }

  // 협의 분할 적용 (없으면 법정 비율)
  for (const h of heirs) {
    const customRatio = input.customRatios?.[h.id]
    h.actualRatio = customRatio !== undefined ? customRatio : h.legalShare
    h.actualAmount = Math.round(e * h.actualRatio)
    h.taxBurden = Math.round(input.totalInheritanceTax * h.actualRatio)
    h.afterTax = h.actualAmount - h.taxBurden
  }

  return { heirs, noHeir: false }
}

/* ─── 부동산 단순 추정 ─── */
export interface PropertyEstimate {
  giftValue: number          // 증여 평가액
  acquisitionTaxRate: number // 취득세율
  acquisitionTax: number     // 취득세
  giftTax: number            // 증여세 (단순)
  totalEstimated: number     // 총 추정 부담
  warnings: string[]
}

export function estimatePropertyGift(
  propertyValue: number,
  shareRatio: number,
  isAdjustedZone: boolean,
  isMultiHomeReceiver: boolean,
  recipient: Relation,
  prevGift: number,
): PropertyEstimate {
  const giftValue = propertyValue * (shareRatio / 100)
  // 취득세율 (단순화)
  let acquisitionTaxRate = 0.035    // 일반 3.5%
  if (isAdjustedZone && isMultiHomeReceiver) acquisitionTaxRate = 0.12   // 12%
  else if (isMultiHomeReceiver) acquisitionTaxRate = 0.08               // 8%

  const acquisitionTax = giftValue * acquisitionTaxRate
  const giftRes = calcGiftTax(giftValue, recipient, prevGift)
  const giftTax = giftRes.finalTax

  const warnings: string[] = [
    '본 도구는 증여세·취득세만 단순 추정합니다',
    '실제 평가는 시가·공시가격·감정가 중 시가가 우선됨',
    '자금출처 소명·재산세·양도세 별도 발생',
    '부담부증여 시 양도세까지 얽혀 매우 복잡',
    '부동산 증여 1건 자문료 50~100만 — 잘못 신고 시 가산세 더 큼',
  ]
  if (isAdjustedZone) warnings.push('조정대상지역은 취득세율이 더 높음 (8~12%)')

  return {
    giftValue: Math.round(giftValue),
    acquisitionTaxRate,
    acquisitionTax: Math.round(acquisitionTax),
    giftTax: Math.round(giftTax),
    totalEstimated: Math.round(giftValue * 0 + acquisitionTax + giftTax), // 평가액 자체는 부담 X
    warnings,
  }
}

/* ─── 부담부증여 단순 분리 ─── */
export interface BurdenedGiftEstimate {
  propertyValue: number
  debtAssumed: number
  giftPortion: number          // 증여 부분 (수증자 증여세 대상)
  transferPortion: number      // 양도 부분 (증여자 양도세 대상)
  giftTaxOnly: number          // 증여세 (단순)
  warnings: string[]
}

export function estimateBurdenedGift(
  propertyValue: number,
  debtAssumed: number,
  recipient: Relation,
  prevGift: number,
): BurdenedGiftEstimate {
  const giftPortion = Math.max(0, propertyValue - debtAssumed)
  const transferPortion = debtAssumed
  const giftRes = calcGiftTax(giftPortion, recipient, prevGift)

  const warnings: string[] = [
    '부담부증여는 가장 복잡한 세무 영역 중 하나',
    '본 도구는 증여 부분의 증여세만 단순 추정 — 양도세 미반영',
    '양도세 = 증여자가 채무 인수액에 대해 별도 부담 (보유·거주 요건·1세대 1주택 비과세 등 변수 다수)',
    '채무 인수 능력 검증·자금출처 소명 별도',
    '한 건 자문료 100만+ 영역 — 반드시 세무사·변호사 상담 권장',
  ]

  return {
    propertyValue,
    debtAssumed,
    giftPortion: Math.round(giftPortion),
    transferPortion: Math.round(transferPortion),
    giftTaxOnly: giftRes.finalTax,
    warnings,
  }
}

/* ─── 분할 증여 시나리오 (확장) ─── */
export interface SplitScenario {
  label: string
  description: string
  totalTax: number
  perPerson: number
  rounds: number
}

export function calcSplitScenarios(
  total: number, childCount: number, rounds: 1 | 2 | 3,
): SplitScenario[] {
  const scenarios: SplitScenario[] = []

  // 1) 1명 1회 (기준)
  const t1 = calcGiftTax(total, '성인자녀', 0).finalTax
  scenarios.push({
    label: '자녀 1명 일괄',
    description: '한 자녀에게 한 번에 증여',
    totalTax: t1, perPerson: t1, rounds: 1,
  })

  // 2) N명 1회
  if (childCount >= 2) {
    const each = Math.floor(total / childCount)
    const t = calcGiftTax(each, '성인자녀', 0).finalTax * childCount
    scenarios.push({
      label: `자녀 ${childCount}명 분산 (1회)`,
      description: '같은 시점에 여러 자녀 분산',
      totalTax: t, perPerson: t / childCount, rounds: 1,
    })
  }

  // 3) N명 × R회 (10년 주기)
  if (rounds >= 2) {
    const each = Math.floor(total / (childCount * rounds))
    const taxPerRound = calcGiftTax(each, '성인자녀', 0).finalTax * childCount
    const totalTax = taxPerRound * rounds
    scenarios.push({
      label: `자녀 ${childCount}명 × ${rounds}회 (10년 주기)`,
      description: '10년마다 새로운 공제 한도 활용',
      totalTax, perPerson: childCount > 0 ? totalTax / childCount : 0, rounds,
    })
  }

  // 4) 부부가 자녀에게 (각자 5천 공제)
  if (childCount >= 1) {
    const each = Math.floor(total / (childCount * 2))   // 부 + 모 → 자녀당 2회 입금
    const t = calcGiftTax(each, '성인자녀', 0).finalTax * childCount * 2
    scenarios.push({
      label: `부부 → 자녀 ${childCount}명 (각자 증여)`,
      description: '부와 모가 각자 증여 (별도 공제 적용)',
      totalTax: t, perPerson: t / childCount, rounds: 1,
    })
  }

  return scenarios
}

/* ─── 포맷 ─── */
export function formatKRW(n: number): string {
  if (!isFinite(n)) return '-'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

export function formatShortKRW(n: number): string {
  if (!isFinite(n) || n === 0) return '0원'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000)
    const man = Math.floor((abs % 100_000_000) / 10_000)
    if (man === 0) return `${sign}${eok}억원`
    return `${sign}${eok}억 ${man.toLocaleString('ko-KR')}만원`
  }
  if (abs >= 10_000) {
    const man = Math.floor(abs / 10_000)
    return `${sign}${man.toLocaleString('ko-KR')}만원`
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`
}

export function parseAmount(input: string): number {
  if (!input) return 0
  const cleaned = input.replace(/[^0-9]/g, '')
  if (!cleaned) return 0
  return parseInt(cleaned, 10)
}

export function commaInput(n: number): string {
  if (!n) return ''
  return n.toLocaleString('ko-KR')
}
