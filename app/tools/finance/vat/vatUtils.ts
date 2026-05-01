/* ──────────────────────────────────────────────────────
   finance/vat/vatUtils.ts
   부가세 — 빠른계산·견적서·실입금 역산·세금계산서·일반 vs 간이
   ※ 본 도구는 일반 정보 제공이며 세무 자문·신고 도구가 아닙니다.
   정확한 신고는 홈택스 또는 세무사 권장.
   ────────────────────────────────────────────────────── */

/* ─── 간이과세 부가가치율 (2026년 한국) ─── */
export interface SimplifiedRate {
  id: string
  name: string
  rate: number       // 부가가치율
  effective: number  // 실효세율 (= rate × 0.10)
  desc?: string
}

export const SIMPLIFIED_VAT_RATES: SimplifiedRate[] = [
  { id: 'retail',    name: '소매업·재생용재료',      rate: 0.15, effective: 0.015 },
  { id: 'manuf',     name: '제조업·농업·숙박업',     rate: 0.20, effective: 0.020 },
  { id: 'food',      name: '음식점업',               rate: 0.25, effective: 0.025 },
  { id: 'construct', name: '건설업·부동산임대업',    rate: 0.30, effective: 0.030 },
  { id: 'service',   name: '서비스업·금융보험업',    rate: 0.40, effective: 0.040 },
]

export const SIMPLIFIED_THRESHOLD = 104_000_000           // 간이과세 한도 (1억 400만)
export const SIMPLIFIED_INVOICE_THRESHOLD = 48_000_000    // 간이 세금계산서 발급 의무 (4,800만)

/* ─── 프리랜서 원천세 ─── */
export const FREELANCER_TAX = {
  income: 0.03,      // 소득세
  local: 0.003,      // 지방소득세
  total: 0.033,      // 합계
}

/* ─── 한국 결제 플랫폼 수수료 ─── */
export interface PlatformFee {
  id: string
  name: string
  rate: number
  desc?: string
}

export const PAYMENT_FEES: PlatformFee[] = [
  { id: 'direct',      name: '직거래 (수수료 없음)', rate: 0 },
  { id: 'card-pg',     name: '카드 PG',              rate: 0.029, desc: '약 2.5~3.3%' },
  { id: 'naver-pay',   name: '네이버페이',           rate: 0.025, desc: '약 2.4~2.7%' },
  { id: 'kakao-pay',   name: '카카오페이',           rate: 0.025 },
  { id: 'baemin',      name: '배달의민족',           rate: 0.067, desc: '6.8% + 결제 수수료' },
  { id: 'yogiyo',      name: '요기요',               rate: 0.125 },
  { id: 'coupang',     name: '쿠팡 (수수료)',        rate: 0.108, desc: '품목별 8~13%' },
  { id: 'kmong',       name: '크몽',                 rate: 0.20,  desc: '15~22%' },
  { id: 'taling',      name: '탈잉',                 rate: 0.30,  desc: '15~30%' },
  { id: 'custom',      name: '직접 입력',            rate: 0 },
]

/* ─── 메인 부가세 계산 ─── */
export type VatMode = 'add' | 'remove' | 'calc'
export type RoundUnit = 'none' | '10' | '100' | '1000'

export interface VATInput {
  amount: number
  mode: VatMode
  rate: number       // 0.10 등
  rounding: RoundUnit
}

export interface VATResult {
  supplyAmount: number
  vat: number
  total: number
}

function roundDown(v: number, u: RoundUnit): number {
  if (u === 'none') return Math.round(v)
  const unit = parseInt(u, 10)
  return Math.floor(v / unit) * unit
}

export function calcVAT(input: VATInput): VATResult {
  const { amount, mode, rate, rounding } = input
  if (amount <= 0) return { supplyAmount: 0, vat: 0, total: 0 }

  if (mode === 'remove') {
    const supply = roundDown(amount / (1 + rate), rounding)
    const vat = amount - supply
    return { supplyAmount: supply, vat, total: amount }
  }
  // add / calc 동일
  const supply = Math.round(amount)
  const vat = roundDown(amount * rate, rounding)
  return { supplyAmount: supply, vat, total: supply + vat }
}

/* ─── 견적서 ─── */
export interface QuoteItem {
  name: string
  quantity: number
  unitPrice: number
  isTaxable: boolean
  discount: number
}

export interface QuoteLine extends QuoteItem {
  lineSupply: number
  lineVat: number
  lineTotal: number
}

export interface QuoteResult {
  totalSupply: number
  taxableSupply: number
  taxFreeSupply: number
  totalVat: number
  grandTotal: number
  items: QuoteLine[]
}

export function calcQuote(items: QuoteItem[], rate = 0.10): QuoteResult {
  const detailed: QuoteLine[] = items.map(item => {
    const beforeDiscount = item.quantity * item.unitPrice
    const lineSupply = Math.max(0, beforeDiscount - (item.discount || 0))
    const lineVat = item.isTaxable ? lineSupply * rate : 0
    return {
      ...item,
      lineSupply: Math.round(lineSupply),
      lineVat: Math.round(lineVat),
      lineTotal: Math.round(lineSupply + lineVat),
    }
  })
  const totalSupply = detailed.reduce((s, i) => s + i.lineSupply, 0)
  const taxableSupply = detailed.filter(i => i.isTaxable).reduce((s, i) => s + i.lineSupply, 0)
  const totalVat = detailed.reduce((s, i) => s + i.lineVat, 0)
  return {
    totalSupply,
    taxableSupply,
    taxFreeSupply: totalSupply - taxableSupply,
    totalVat,
    grandTotal: totalSupply + totalVat,
    items: detailed,
  }
}

/* 부가세 별도 vs 포함 비교 (계약 시) */
export interface ExclusiveInclusiveCompare {
  amount: number
  exclusive: { totalCharge: number; supply: number; vat: number; received: number }
  inclusive: { totalCharge: number; supply: number; vat: number; received: number }
  diff: number   // 별도 - 포함 = 추가 수입
}

export function compareExclusiveInclusive(amount: number, rate = 0.10): ExclusiveInclusiveCompare {
  const excSupply = amount
  const excVat = Math.round(amount * rate)
  const incSupply = Math.round(amount / (1 + rate))
  const incVat = amount - incSupply
  return {
    amount,
    exclusive: { totalCharge: amount + excVat, supply: excSupply, vat: excVat, received: excSupply },
    inclusive: { totalCharge: amount, supply: incSupply, vat: incVat, received: incSupply },
    diff: excSupply - incSupply,
  }
}

/* ─── 실입금 역산 ★★★★★ ─── */
export interface NetCalcInput {
  targetNet: number               // 받고 싶은 실입금
  isVatExclusive: boolean         // 부가세 별도(true) / 포함(false)
  isFreelancer: boolean           // 프리랜서 3.3% 원천세
  platformFeeRate: number         // %
}

export interface NetCalcResult {
  supplyAmount: number
  vat: number
  totalCharge: number
  withholding: number
  platformFee: number
  finalReceived: number
  factor: number
  steps: { label: string; value: number; sign?: '+' | '-' | '=' }[]
}

export function reverseCalcGrossAmount(input: NetCalcInput): NetCalcResult | null {
  const vatRate = input.isVatExclusive ? 0.10 : 0
  const withholdingRate = input.isFreelancer ? FREELANCER_TAX.total : 0
  const platformRate = input.platformFeeRate / 100

  // 실입금 = 청구액 - 플랫폼 수수료 - 원천세
  // 청구액 = 공급가액 × (1 + vatRate)        (별도)
  //        = 공급가액                         (포함, vatRate=0)
  // 플랫폼 수수료 = 청구액 × platformRate
  // 원천세 = 공급가액 × withholdingRate
  // → 공급가액 X = targetNet / [(1+vatRate)(1-platformRate) - withholdingRate]
  const factor = (1 + vatRate) * (1 - platformRate) - withholdingRate
  if (factor <= 0) return null

  const supplyAmount = Math.round(input.targetNet / factor)
  const vat = Math.round(supplyAmount * vatRate)
  const totalCharge = supplyAmount + vat
  const platformFee = Math.round(totalCharge * platformRate)
  const withholding = Math.round(supplyAmount * withholdingRate)
  const finalReceived = totalCharge - platformFee - withholding

  const steps: NetCalcResult['steps'] = [
    { label: '필요 공급가액', value: supplyAmount, sign: '=' },
  ]
  if (vat > 0) steps.push({ label: `부가세 (10%)`, value: vat, sign: '+' })
  steps.push({ label: '총 청구액', value: totalCharge, sign: '=' })
  if (platformFee > 0) steps.push({ label: `플랫폼 수수료 (${input.platformFeeRate}%)`, value: -platformFee, sign: '-' })
  if (withholding > 0) steps.push({ label: '원천세 (3.3%)', value: -withholding, sign: '-' })
  steps.push({ label: '최종 입금', value: finalReceived, sign: '=' })

  return { supplyAmount, vat, totalCharge, withholding, platformFee, finalReceived, factor, steps }
}

/* ─── 일반 vs 간이 비교 ─── */
export interface CompareGSInput {
  annualRevenue: number
  industryId: string
  purchaseAmount: number
  vatPurchase: number
}

export interface CompareGSResult {
  general: {
    vatOutput: number
    vatInput: number
    vatPayable: number
  }
  simplified: {
    available: boolean
    effectiveRate: number
    vatPayable: number
    industry: SimplifiedRate
  }
  difference: number    // 양수 = 간이 유리
  recommendation: string
  tone: 'simplified' | 'general' | 'neutral' | 'unavailable'
}

export function compareGeneralVsSimplified(input: CompareGSInput): CompareGSResult {
  const industry = SIMPLIFIED_VAT_RATES.find(i => i.id === input.industryId) ?? SIMPLIFIED_VAT_RATES[0]

  // 일반과세
  const vatOutput = input.annualRevenue * 0.10
  const generalPayable = Math.max(0, vatOutput - input.vatPurchase)

  // 간이과세
  // 매출세액 = 매출 × 부가가치율 × 10%  (= 매출 × effective)
  // 매입세액 공제 = 매입 부가세 × 부가가치율 (간이는 부분 공제)
  const simplifiedOutput = input.annualRevenue * industry.effective
  const simplifiedInputCredit = input.vatPurchase * industry.rate
  const simplifiedPayable = Math.max(0, simplifiedOutput - simplifiedInputCredit)

  const available = input.annualRevenue <= SIMPLIFIED_THRESHOLD
  const difference = available ? generalPayable - simplifiedPayable : 0

  let recommendation = ''
  let tone: CompareGSResult['tone']
  if (!available) {
    tone = 'unavailable'
    recommendation = '연 매출 1억 400만 초과 — 간이과세 자격 없음. 일반과세만 가능합니다.'
  } else if (difference > 100_000) {
    tone = 'simplified'
    recommendation = `간이과세가 약 ${Math.round(difference / 10_000).toLocaleString()}만원 유리합니다.`
  } else if (difference < -100_000) {
    tone = 'general'
    recommendation = `일반과세가 약 ${Math.round(Math.abs(difference) / 10_000).toLocaleString()}만원 유리합니다 (매입이 많은 업종).`
  } else {
    tone = 'neutral'
    recommendation = '두 과세 유형 차이가 적습니다. 세금계산서 발급 의무·신고 횟수 등 다른 요소를 고려하세요.'
  }

  return {
    general: {
      vatOutput: Math.round(vatOutput),
      vatInput: Math.round(input.vatPurchase),
      vatPayable: Math.round(generalPayable),
    },
    simplified: {
      available,
      effectiveRate: industry.effective,
      vatPayable: Math.round(simplifiedPayable),
      industry,
    },
    difference: Math.round(difference),
    recommendation,
    tone,
  }
}

/* ─── 프리랜서 vs 사업자 (실입금 탭 시나리오 표용) ─── */
export interface FreelancerVsBusinessRow {
  type: string
  totalCharge: number
  description: string
}

export function buildScenarioTable(targetNet: number): FreelancerVsBusinessRow[] {
  const cases: { type: string; isVatExclusive: boolean; isFreelancer: boolean; platformFeeRate: number; description: string }[] = [
    { type: '프리랜서 (직거래, 3.3%)',           isVatExclusive: false, isFreelancer: true,  platformFeeRate: 0,    description: '원천세만 차감' },
    { type: '프리랜서 + 네이버페이 2.5%',         isVatExclusive: false, isFreelancer: true,  platformFeeRate: 2.5,  description: '원천세 + 결제 수수료' },
    { type: '프리랜서 + 크몽 20%',                isVatExclusive: false, isFreelancer: true,  platformFeeRate: 20,   description: '큰 수수료 + 원천세' },
    { type: '사업자 (직거래, 부가세 별도)',       isVatExclusive: true,  isFreelancer: false, platformFeeRate: 0,    description: '가장 명료한 형태' },
    { type: '사업자 + 네이버페이 (부가세 별도)',  isVatExclusive: true,  isFreelancer: false, platformFeeRate: 2.5,  description: '결제 수수료만 추가' },
    { type: '사업자 + 크몽 (부가세 별도)',        isVatExclusive: true,  isFreelancer: false, platformFeeRate: 20,   description: '큰 수수료 + 부가세' },
  ]
  return cases.map(c => {
    const r = reverseCalcGrossAmount({
      targetNet, isVatExclusive: c.isVatExclusive,
      isFreelancer: c.isFreelancer, platformFeeRate: c.platformFeeRate,
    })
    return {
      type: c.type,
      totalCharge: r ? r.totalCharge : 0,
      description: c.description,
    }
  })
}

/* ─── 포맷 ─── */
export function won(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

export function formatEok(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000)
    const man = Math.floor((abs % 100_000_000) / 10_000)
    return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만원` : `${sign}${eok}억원`
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`
  }
  return won(n)
}

export function formatKRW(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

export function parseAmount(s: string): number {
  if (!s) return 0
  const cleaned = s.replace(/[^\d.\-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
