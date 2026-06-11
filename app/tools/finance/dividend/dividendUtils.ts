/* ──────────────────────────────────────────────────────
   finance/dividend/dividendUtils.ts
   월배당 — 목표 원금·월 적립 역산·종합과세·포트폴리오·절세 계좌
   ※ 본 도구는 수학적 시뮬레이션이며 투자 자문·종목 권유 도구가 아닙니다.
   과거 배당이 미래 배당을 보장하지 않습니다.
   ────────────────────────────────────────────────────── */

/* ─── 한국 배당 세제 (2026년 기준) ─── */
export interface TaxAccount {
  id: string
  name: string
  taxRate: number              // 분리과세율
  nonTaxableLimit?: number     // ISA 비과세 한도
  deductionRate?: number       // 세액공제율 (연금저축·IRP)
  annualLimit: number          // 연 납입 한도
  totalLimit?: number          // 전체 납입 한도
  comprehensive: boolean       // 종합과세 합산 대상?
  desc: string
  pros: string
  cons: string
}

export const TAX_ACCOUNTS: TaxAccount[] = [
  { id: 'general',        name: '일반 계좌',
    taxRate: 0.154, annualLimit: Infinity, comprehensive: true,
    desc: '배당소득세 15.4% (소득세 14% + 지방소득세 1.4%)',
    pros: '제한 없음 · 자유 인출', cons: '연 2,000만↑ 종합과세 (최대 49.5%)' },
  { id: 'isa-saving',     name: 'ISA (서민형)',
    taxRate: 0.099, nonTaxableLimit: 4_000_000,
    annualLimit: 20_000_000, totalLimit: 100_000_000, comprehensive: false,
    desc: '서민형 400만 비과세 + 9.9% 분리과세 · 종합과세 비포함',
    pros: '종합과세 회피 · 절세', cons: '연 2,000만 한도 · 5년 의무 · 소득 조건' },
  { id: 'isa-general',    name: 'ISA (일반형)',
    taxRate: 0.099, nonTaxableLimit: 2_000_000,
    annualLimit: 20_000_000, totalLimit: 100_000_000, comprehensive: false,
    desc: '일반형 200만 비과세 + 9.9% 분리과세 · 종합과세 비포함',
    pros: '종합과세 회피', cons: '연 2,000만 한도 · 3~5년 의무' },
  { id: 'pension-saving', name: '연금저축',
    taxRate: 0.055, deductionRate: 0.165, annualLimit: 6_000_000, comprehensive: false,
    desc: '연 600만 한도, 16.5% 세액공제, 5.5% 분리과세 (55세 이후)',
    pros: '연 99만 환급 + 5.5% 분리과세', cons: '55세 이후 수령 · 중도해지 페널티' },
  { id: 'irp',            name: 'IRP',
    taxRate: 0.055, deductionRate: 0.165, annualLimit: 9_000_000, comprehensive: false,
    desc: '개인형 퇴직연금 · 연금저축 합산 연 900만 한도',
    pros: '추가 300만 세액공제', cons: '55세 이후 수령 · 중도해지 페널티' },
]

/* ─── 종합과세 한도 ─── */
export const COMPREHENSIVE_TAX_THRESHOLD = 20_000_000   // 연 2,000만

/* ─── 종합과세 누진세율 (지방세 포함) ─── */
export interface ProgressiveBracket {
  min: number
  max: number
  rate: number
  label: string
}

export const PROGRESSIVE_BRACKETS: ProgressiveBracket[] = [
  { min: 0,            max: 14_000_000,    rate: 0.066, label: '~ 1,400만 (6.6%)' },
  { min: 14_000_000,   max: 50_000_000,    rate: 0.165, label: '1,400만 ~ 5,000만 (16.5%)' },
  { min: 50_000_000,   max: 88_000_000,    rate: 0.264, label: '5,000만 ~ 8,800만 (26.4%)' },
  { min: 88_000_000,   max: 150_000_000,   rate: 0.385, label: '8,800만 ~ 1.5억 (38.5%)' },
  { min: 150_000_000,  max: 300_000_000,   rate: 0.418, label: '1.5억 ~ 3억 (41.8%)' },
  { min: 300_000_000,  max: 500_000_000,   rate: 0.440, label: '3억 ~ 5억 (44%)' },
  { min: 500_000_000,  max: 1_000_000_000, rate: 0.462, label: '5억 ~ 10억 (46.2%)' },
  { min: 1_000_000_000, max: Infinity,     rate: 0.495, label: '10억 초과 (49.5%)' },
]

/* ─── 배당 주기 ─── */
export type Frequency = 'monthly' | 'quarterly' | 'semi' | 'annual'
export const FREQUENCY_INFO: { id: Frequency; name: string; periodsPerYear: number; payMonths: number[] }[] = [
  { id: 'monthly',   name: '월배당',   periodsPerYear: 12, payMonths: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { id: 'quarterly', name: '분기배당', periodsPerYear: 4,  payMonths: [3,6,9,12] },
  { id: 'semi',      name: '반기배당', periodsPerYear: 2,  payMonths: [6,12] },
  { id: 'annual',    name: '연배당',   periodsPerYear: 1,  payMonths: [3] },
]

/* ─── 메인: 필요 원금 계산 ─── */
export function afterTaxRate(divRate: number, taxRate: number): number {
  return (divRate / 100) * (1 - taxRate / 100)
}

export function requiredPrincipal(
  monthlyTarget: number,
  divRate: number,
  taxRate: number,
  safety: number,
): number {
  const annual = monthlyTarget * 12
  const atr = afterTaxRate(divRate, taxRate)
  if (atr <= 0) return Infinity
  return (annual * (safety / 100)) / atr
}

/* ─── 월 적립 역산 (이진 탐색) ─── */
export interface ReverseInput {
  targetMonthly: number          // 목표 월배당
  targetYears: number             // 기간
  currentCapital: number          // 현재 자산
  dividendYield: number           // % (배당수익률)
  capitalGainRate: number         // % (시세 차익 CAGR)
  reinvestDividends: boolean
  taxRate: number                 // 0.154
  safety: number                  // 1.0~1.3
}

export interface ReverseResult {
  requiredCapital: number
  requiredMonthly: number
  requiredYearly: number
  totalContribution: number       // 누적 납입 (현재 자산 + 적립)
  totalGrowth: number             // 시세 차익 + 재투자 효과
  feasibility: 'easy' | 'reasonable' | 'tight' | 'unrealistic'
  feasibilityLabel: string
  feasibilityColor: string
  feasibilityNote: string
}

export function reverseCalcMonthlyContribution(input: ReverseInput): ReverseResult | null {
  if (input.targetMonthly <= 0 || input.targetYears <= 0) return null

  // 1. 목표 자산
  const annual = input.targetMonthly * 12 * input.safety
  const atr = afterTaxRate(input.dividendYield, input.taxRate * 100)
  if (atr <= 0) return null
  const requiredCapital = annual / atr

  // 2. 이진 탐색
  const monthlyGrowthRate = (input.capitalGainRate / 100 + (input.reinvestDividends ? atr : 0)) / 12

  const simulate = (monthly: number) => {
    let balance = input.currentCapital
    for (let m = 0; m < input.targetYears * 12; m++) {
      balance = balance * (1 + monthlyGrowthRate) + monthly
    }
    return balance
  }

  // 이미 도달?
  if (simulate(0) >= requiredCapital) {
    return {
      requiredCapital: Math.round(requiredCapital),
      requiredMonthly: 0,
      requiredYearly: 0,
      totalContribution: input.currentCapital,
      totalGrowth: simulate(0) - input.currentCapital,
      feasibility: 'easy',
      feasibilityLabel: '🟢 추가 적립 불필요',
      feasibilityColor: '#059669',
      feasibilityNote: '현재 자산만으로 목표 도달 가능',
    }
  }

  let low = 0
  let high = 100_000_000
  let safety = 0
  while (high - low > 1000 && safety++ < 60) {
    const mid = (low + high) / 2
    if (simulate(mid) < requiredCapital) low = mid
    else high = mid
  }
  const requiredMonthly = Math.ceil(high / 10_000) * 10_000
  const requiredYearly = requiredMonthly * 12
  const totalContribution = input.currentCapital + requiredMonthly * input.targetYears * 12
  const finalBalance = simulate(requiredMonthly)
  const totalGrowth = Math.max(0, finalBalance - totalContribution)

  let feasibility: ReverseResult['feasibility']
  let feasibilityLabel: string
  let feasibilityColor: string
  let feasibilityNote: string

  if (requiredMonthly < 300_000) {
    feasibility = 'easy'; feasibilityLabel = '🟢 매우 합리적'; feasibilityColor = '#059669'
    feasibilityNote = '월 30만 미만 — 일반 직장인 충분히 가능'
  } else if (requiredMonthly < 800_000) {
    feasibility = 'reasonable'; feasibilityLabel = '🔵 합리적'; feasibilityColor = '#0891B2'
    feasibilityNote = '월 30~80만 — 안정적 직장인에게 적합'
  } else if (requiredMonthly < 2_000_000) {
    feasibility = 'tight'; feasibilityLabel = '🟡 도전적'; feasibilityColor = '#A16207'
    feasibilityNote = '월 80~200만 — 부담 큼 · 기간 늘리기 검토'
  } else {
    feasibility = 'unrealistic'; feasibilityLabel = '🔴 비현실적'; feasibilityColor = '#DC2626'
    feasibilityNote = '월 200만+ — 일반 직장인 매우 부담 · 기간 ↑ 또는 목표 ↓ 권장'
  }

  return {
    requiredCapital: Math.round(requiredCapital),
    requiredMonthly,
    requiredYearly,
    totalContribution: Math.round(totalContribution),
    totalGrowth: Math.round(totalGrowth),
    feasibility, feasibilityLabel, feasibilityColor, feasibilityNote,
  }
}

/* ─── 종합과세 평가 ─── */
export interface ComprehensiveResult {
  totalFinancialIncome: number
  threshold: number
  remainder: number              // 한도까지 여유 (음수면 초과)
  pctOfThreshold: number
  level: 'safe' | 'caution' | 'near' | 'over'
  levelLabel: string
  levelColor: string
  appliedRate: number             // 종합과세 적용 시 평균세율
  bracket?: ProgressiveBracket
  taxIfComprehensive: number
}

export function evaluateComprehensiveTax(
  annualDividend: number,
  annualInterest: number,
  otherFinancial: number,
): ComprehensiveResult {
  const total = annualDividend + annualInterest + otherFinancial
  const threshold = COMPREHENSIVE_TAX_THRESHOLD
  const remainder = threshold - total
  const pct = total / threshold * 100

  let level: ComprehensiveResult['level'], levelLabel: string, levelColor: string
  if (pct < 50) {
    level = 'safe'; levelLabel = '🟢 안전'; levelColor = '#059669'
  } else if (pct < 80) {
    level = 'caution'; levelLabel = '🟡 주의'; levelColor = '#A16207'
  } else if (pct < 100) {
    level = 'near'; levelLabel = '🟠 한도 임박'; levelColor = '#EA580C'
  } else {
    level = 'over'; levelLabel = '🔴 종합과세 진입'; levelColor = '#DC2626'
  }

  const bracket = PROGRESSIVE_BRACKETS.find(b => total >= b.min && total < b.max)
  const appliedRate = bracket ? bracket.rate : 0.154
  const taxIfComprehensive = total > threshold ? total * appliedRate : total * 0.154

  return {
    totalFinancialIncome: Math.round(total),
    threshold,
    remainder: Math.round(remainder),
    pctOfThreshold: Math.round(pct * 10) / 10,
    level, levelLabel, levelColor,
    appliedRate, bracket,
    taxIfComprehensive: Math.round(taxIfComprehensive),
  }
}

/* ─── 포트폴리오 자산 ─── */
export interface PortfolioAsset {
  id: string
  name: string
  amount: number          // 투자금 (원)
  yieldPct: number        // 배당수익률 (%)
  frequency: Frequency
  taxRate: number         // % (일반 15.4 / 해외 15.0)
}

export interface PortfolioResult {
  totalAmount: number
  weightedYieldPretax: number
  weightedYieldAftertax: number
  annualPretax: number
  annualAftertax: number
  monthlyAvg: number
  monthlyFlow: number[]   // 1~12월
  perAsset: Array<PortfolioAsset & { annual: number; annualAfterTax: number; monthlyByMonth: number[] }>
}

export function calcPortfolio(assets: PortfolioAsset[]): PortfolioResult {
  const totalAmount = assets.reduce((s, a) => s + a.amount, 0)
  const monthlyFlow = new Array(12).fill(0)
  const perAsset: PortfolioResult['perAsset'] = []

  let annualPretax = 0
  let annualAftertax = 0

  for (const a of assets) {
    const ann = a.amount * (a.yieldPct / 100)
    const annAft = ann * (1 - a.taxRate / 100)
    const freq = FREQUENCY_INFO.find(f => f.id === a.frequency) ?? FREQUENCY_INFO[1]
    const perPay = annAft / freq.periodsPerYear
    const perMonth = new Array(12).fill(0)
    freq.payMonths.forEach(m => { perMonth[m - 1] += perPay; monthlyFlow[m - 1] += perPay })

    annualPretax += ann
    annualAftertax += annAft
    perAsset.push({
      ...a,
      annual: Math.round(ann),
      annualAfterTax: Math.round(annAft),
      monthlyByMonth: perMonth.map(v => Math.round(v)),
    })
  }

  const weightedYieldPretax = totalAmount > 0 ? (annualPretax / totalAmount) * 100 : 0
  const weightedYieldAftertax = totalAmount > 0 ? (annualAftertax / totalAmount) * 100 : 0

  return {
    totalAmount,
    weightedYieldPretax: Math.round(weightedYieldPretax * 100) / 100,
    weightedYieldAftertax: Math.round(weightedYieldAftertax * 100) / 100,
    annualPretax: Math.round(annualPretax),
    annualAftertax: Math.round(annualAftertax),
    monthlyAvg: Math.round(annualAftertax / 12),
    monthlyFlow: monthlyFlow.map(v => Math.round(v)),
    perAsset,
  }
}

/* ─── 절세 계좌 비교 ─── */
export interface TaxAccountCompareInput {
  annualDividend: number
  years: number
  annualContribution: number  // 매년 적립액
  totalIncome?: number        // 총급여 (세액공제율 결정)
  dividendYield?: number      // % — 계좌 납입 한도를 배당으로 환산 (ISA 총 1억 등)
}

export interface TaxAccountCompareRow {
  account: TaxAccount
  annualTax: number             // 1년 세금
  totalTax: number              // 누적 세금 (years 연도)
  taxCreditAnnual: number       // 1년 세액공제 환급 (연금/IRP)
  taxCreditTotal: number        // 누적 세액공제
  netBenefit: number            // 일반 대비 순이익
  overLimitDividend: number     // 계좌 한도 초과로 일반과세된 배당 (0이면 한도 내)
}

export function compareTaxAccounts(input: TaxAccountCompareInput): TaxAccountCompareRow[] {
  const generalTaxAnnual = input.annualDividend * 0.154
  const generalTaxTotal = generalTaxAnnual * input.years
  const yieldFrac = (input.dividendYield ?? 0) / 100

  return TAX_ACCOUNTS.map(acc => {
    let annualTax = 0
    let overLimitDividend = 0
    if (acc.id === 'isa-saving' || acc.id === 'isa-general') {
      // ISA 총 납입 한도(1억)로 담을 수 있는 최대 배당 — 초과분은 일반 15.4% 과세
      const maxShelter = acc.totalLimit && yieldFrac > 0 ? acc.totalLimit * yieldFrac : input.annualDividend
      const sheltered = Math.min(input.annualDividend, maxShelter)
      overLimitDividend = input.annualDividend - sheltered
      const taxableDiv = Math.max(0, sheltered - (acc.nonTaxableLimit ?? 0))
      annualTax = taxableDiv * acc.taxRate + overLimitDividend * 0.154
    } else if (acc.id === 'pension-saving' || acc.id === 'irp') {
      // 단순화: 5.5% 분리과세 (수령 시점). 한도는 적립액 기준이라 별도 안내로 표기.
      annualTax = input.annualDividend * acc.taxRate
    } else {
      annualTax = input.annualDividend * acc.taxRate
    }
    const totalTax = annualTax * input.years

    let taxCreditAnnual = 0
    if (acc.deductionRate) {
      const cappedContrib = Math.min(input.annualContribution, acc.annualLimit)
      const rate = input.totalIncome !== undefined && input.totalIncome > 55_000_000 ? 0.132 : 0.165
      taxCreditAnnual = cappedContrib * rate
    }
    const taxCreditTotal = taxCreditAnnual * input.years

    const netBenefit = (generalTaxTotal - totalTax) + taxCreditTotal
    return {
      account: acc,
      annualTax: Math.round(annualTax),
      totalTax: Math.round(totalTax),
      taxCreditAnnual: Math.round(taxCreditAnnual),
      taxCreditTotal: Math.round(taxCreditTotal),
      netBenefit: Math.round(netBenefit),
      overLimitDividend: Math.round(overLimitDividend),
    }
  })
}

/* ─── 환율 영향 ─── */
export function calcCurrencyImpact(
  usdAmount: number,
  baseRate: number,
  scenarios: number[] = [-15, -10, -5, 0, 5, 10, 15],
) {
  return scenarios.map(deltaPct => {
    const rate = baseRate * (1 + deltaPct / 100)
    return { deltaPct, rate, krw: Math.round(usdAmount * rate) }
  })
}

/* ─── 포맷 ─── */
export function won(n: number): string {
  if (!isFinite(n) || n <= 0) return '0원'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

export function formatEok(n: number): string {
  if (!isFinite(n) || n <= 0) return '0원'
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

export function fmtNumInput(s: string): string {
  const clean = s.replace(/[^0-9]/g, '')
  if (!clean) return ''
  return parseInt(clean, 10).toLocaleString('ko-KR')
}
