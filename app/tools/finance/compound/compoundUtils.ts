/* ──────────────────────────────────────────────────────
   finance/compound/compoundUtils.ts
   복리 계산 — 거치식·적립식·증액·역산·세금·인플레이션·시나리오
   ※ 본 도구는 수학적 시뮬레이션이며 투자 자문·수익 보장 도구가 아닙니다.
   ────────────────────────────────────────────────────── */

/* ─── 한국 절세 계좌 (2026년 기준) ─── */
export interface TaxAccount {
  id: string
  name: string
  taxRate: number              // 이자/배당소득세
  nonTaxableLimit?: number     // ISA 비과세 한도 (원)
  deductionRate?: number       // 세액공제율 (연금저축·IRP)
  annualLimit: number          // 연 납입 한도 (원, Infinity = 무제한)
  totalLimit?: number          // 전체 납입 한도
  desc: string
  pros: string
  cons: string
}

export const TAX_ACCOUNTS: TaxAccount[] = [
  { id: 'general',        name: '일반 계좌',
    taxRate: 0.154, annualLimit: Infinity,
    desc: '이자·배당소득세 15.4% (소득세 14% + 지방소득세 1.4%)',
    pros: '제한 없음', cons: '세금 부담 가장 큼' },
  { id: 'isa-saving',     name: 'ISA (서민형)',
    taxRate: 0.099, nonTaxableLimit: 4_000_000,
    annualLimit: 20_000_000, totalLimit: 100_000_000,
    desc: '서민형 400만원 비과세 + 9.9% 분리과세',
    pros: '비과세 + 분리과세 절세', cons: '연 2,000만 한도 · 5년 의무 · 소득 조건' },
  { id: 'isa-general',    name: 'ISA (일반형)',
    taxRate: 0.099, nonTaxableLimit: 2_000_000,
    annualLimit: 20_000_000, totalLimit: 100_000_000,
    desc: '일반형 200만원 비과세 + 9.9% 분리과세',
    pros: '비과세 + 분리과세', cons: '연 2,000만 한도 · 3~5년 의무' },
  { id: 'pension-saving', name: '연금저축',
    taxRate: 0.055, deductionRate: 0.165, annualLimit: 6_000_000,
    desc: '연 600만원 한도, 16.5% 세액공제 (총급여 5,500만 이하)',
    pros: '연 99만원 환급 + 연금 수령 시 5.5%', cons: '55세 이후 수령 · 중도 해지 페널티' },
  { id: 'irp',            name: 'IRP',
    taxRate: 0.055, deductionRate: 0.165, annualLimit: 9_000_000,
    desc: '개인형 퇴직연금 · 연금저축 합산 연 900만 한도',
    pros: '추가 300만원 세액공제', cons: '55세 이후 수령 · 중도 해지 페널티' },
  { id: 'tax-free',       name: '비과세 (이론)',
    taxRate: 0, annualLimit: Infinity,
    desc: '세금 없음 가정 (이론적 최대치)',
    pros: '세금 0', cons: '실제 적용 어려움' },
]

/* ─── 인플레이션 프리셋 ─── */
export const INFLATION_PRESETS = [
  { rate: 1.5, label: '낮음 (1.5%)' },
  { rate: 2.0, label: '한국은행 목표 (2.0%)' },
  { rate: 2.5, label: '평균 (2.5%, 한국 10년)' },
  { rate: 3.0, label: '높음 (3.0%)' },
  { rate: 4.0, label: '매우 높음 (4.0%)' },
]

/* ─── 시나리오 프리셋 ─── */
export interface ReturnScenario {
  id: string
  name: string
  rate: number
  desc: string
  color: string
  warning?: string
}

export const RETURN_SCENARIOS: ReturnScenario[] = [
  { id: 'conservative', name: '보수적', rate: 4,  desc: '예금·채권 중심',          color: '#3EC8FF' },
  { id: 'moderate',     name: '기준',   rate: 7,  desc: 'S&P500 100년 평균',       color: 'var(--accent)' },
  { id: 'optimistic',   name: '낙관적', rate: 10, desc: '주식형 펀드 장기 평균',    color: '#FFD700' },
  { id: 'aggressive',   name: '공격적', rate: 13, desc: '성장주 (고위험·고수익)',  color: '#FF8C3E', warning: '큰 변동성' },
]

/* ─── 주기 ─── */
export interface Frequency { id: string; name: string; periodsPerYear: number }

export const CONTRIBUTION_FREQUENCIES: Frequency[] = [
  { id: 'monthly',   name: '매월',   periodsPerYear: 12 },
  { id: 'biweekly',  name: '격주',   periodsPerYear: 26 },
  { id: 'weekly',    name: '매주',   periodsPerYear: 52 },
  { id: 'quarterly', name: '분기',   periodsPerYear: 4 },
  { id: 'yearly',    name: '연 1회', periodsPerYear: 1 },
]

export const COMPOUND_FREQUENCIES: Frequency[] = [
  { id: 'daily',     name: '일복리',   periodsPerYear: 365 },
  { id: 'monthly',   name: '월복리',   periodsPerYear: 12 },
  { id: 'quarterly', name: '분기복리', periodsPerYear: 4 },
  { id: 'yearly',    name: '연복리',   periodsPerYear: 1 },
]

/* ─── 메인 계산 ─── */
export interface CompoundInput {
  principal: number              // 초기 원금
  contribution: number           // 정기 납입액 (원)
  contributionFreqId: string
  compoundFreqId: string
  annualRate: number
  years: number
  annualIncreaseRate?: number    // 매년 증액률 (%)
  feeRate?: number               // 수수료율 (%)
}

export interface YearBreakdown {
  year: number
  principalCumulative: number
  interestCumulative: number
  total: number
  yearlyContribution: number
  yearlyInterest: number
}

export interface CompoundResult {
  finalValue: number
  totalContribution: number
  totalInterest: number
  effectiveAnnualReturn: number  // %
  breakdown: YearBreakdown[]
}

export function calcCompound(input: CompoundInput): CompoundResult {
  const cf = COMPOUND_FREQUENCIES.find(f => f.id === input.compoundFreqId) ?? COMPOUND_FREQUENCIES[1]
  const ctf = CONTRIBUTION_FREQUENCIES.find(f => f.id === input.contributionFreqId) ?? CONTRIBUTION_FREQUENCIES[0]

  const periodRate = input.annualRate / 100 / cf.periodsPerYear
  const periodFee = (input.feeRate ?? 0) / 100 / cf.periodsPerYear
  const netRate = periodRate - periodFee

  let balance = input.principal
  let totalContribution = input.principal
  let totalInterest = 0
  const breakdown: YearBreakdown[] = []

  for (let year = 1; year <= input.years; year++) {
    let yearlyContribution = 0
    let yearlyInterest = 0

    // 그 해 적립액 (증액 반영)
    const adjustedContribution = input.contribution
      * Math.pow(1 + (input.annualIncreaseRate ?? 0) / 100, year - 1)

    // 한 해 안의 복리 주기 시뮬
    for (let p = 0; p < cf.periodsPerYear; p++) {
      // 이 복리 주기에 일어나는 납입 횟수 (분수도 가능)
      const contribPerPeriod = ctf.periodsPerYear / cf.periodsPerYear
      const contribAmount = adjustedContribution * contribPerPeriod
      balance += contribAmount
      totalContribution += contribAmount
      yearlyContribution += contribAmount

      const interest = balance * netRate
      balance += interest
      totalInterest += interest
      yearlyInterest += interest
    }

    breakdown.push({
      year,
      principalCumulative: Math.round(totalContribution),
      interestCumulative: Math.round(totalInterest),
      total: Math.round(balance),
      yearlyContribution: Math.round(yearlyContribution),
      yearlyInterest: Math.round(yearlyInterest),
    })
  }

  const effectiveAnnualReturn = totalContribution > 0 && input.years > 0
    ? (Math.pow(balance / totalContribution, 1 / input.years) - 1) * 100
    : 0

  return {
    finalValue: Math.round(balance),
    totalContribution: Math.round(totalContribution),
    totalInterest: Math.round(totalInterest),
    effectiveAnnualReturn: Math.round(effectiveAnnualReturn * 100) / 100,
    breakdown,
  }
}

/* ─── 목표 역산 ─── */
export interface ReverseInput {
  goal: number
  principal: number
  years: number
  annualRate: number
  contributionFreqId: string
  compoundFreqId: string
  annualIncreaseRate?: number
}

export interface ReverseResult {
  requiredMonthly: number
  requiredYearly: number
  feasibility: 'easy' | 'reasonable' | 'tight' | 'unrealistic'
  feasibilityLabel: string
  feasibilityColor: string
  feasibilityNote: string
}

export function reverseCalcContribution(input: ReverseInput): ReverseResult | null {
  if (input.goal <= 0 || input.years <= 0) return null

  // 이미 목표 달성?
  const noContrib = calcCompound({
    principal: input.principal, contribution: 0,
    contributionFreqId: input.contributionFreqId, compoundFreqId: input.compoundFreqId,
    annualRate: input.annualRate, years: input.years,
    annualIncreaseRate: input.annualIncreaseRate,
  })
  if (noContrib.finalValue >= input.goal) {
    return {
      requiredMonthly: 0, requiredYearly: 0,
      feasibility: 'easy', feasibilityLabel: '🟢 추가 적립 불필요',
      feasibilityColor: '#3EFF9B',
      feasibilityNote: '현재 자산만으로 목표 도달 가능 (추가 적립 0)',
    }
  }

  let low = 0
  let high = 100_000_000  // 월 1억까지 탐색
  let safety = 0
  while (high - low > 1000 && safety++ < 50) {
    const mid = (low + high) / 2
    const r = calcCompound({
      principal: input.principal, contribution: mid,
      contributionFreqId: input.contributionFreqId, compoundFreqId: input.compoundFreqId,
      annualRate: input.annualRate, years: input.years,
      annualIncreaseRate: input.annualIncreaseRate,
    })
    if (r.finalValue < input.goal) low = mid
    else high = mid
  }
  const requiredMonthly = Math.ceil(high / 10_000) * 10_000

  let feasibility: ReverseResult['feasibility']
  let feasibilityLabel: string
  let feasibilityColor: string
  let feasibilityNote: string
  if (requiredMonthly < 200_000) {
    feasibility = 'easy'; feasibilityLabel = '🟢 매우 합리적'
    feasibilityColor = '#3EFF9B'
    feasibilityNote = '월 소득의 5% 미만 수준 — 충분히 도달 가능'
  } else if (requiredMonthly < 600_000) {
    feasibility = 'reasonable'; feasibilityLabel = '🔵 합리적'
    feasibilityColor = '#3EC8FF'
    feasibilityNote = '월 소득의 10~15% 수준 — 일반 직장인 가능'
  } else if (requiredMonthly < 1_500_000) {
    feasibility = 'tight'; feasibilityLabel = '🟡 도전적'
    feasibilityColor = '#FFD700'
    feasibilityNote = '월 소득의 25% 이상 — 검토 필요'
  } else {
    feasibility = 'unrealistic'; feasibilityLabel = '🔴 비현실적'
    feasibilityColor = '#FF6B6B'
    feasibilityNote = '월 소득 50%+ — 기간 늘리거나 목표 조정 권장'
  }

  return {
    requiredMonthly,
    requiredYearly: requiredMonthly * 12,
    feasibility, feasibilityLabel, feasibilityColor, feasibilityNote,
  }
}

/* ─── 세금 ─── */
export interface AfterTaxResult {
  taxableGain: number
  taxAmount: number
  afterTaxFinal: number
  effectiveTaxRate: number
  taxCreditAmount?: number  // 연금저축·IRP 세액공제 (전체 기간)
}

export function calcAfterTax(
  pretaxFinal: number,
  totalContribution: number,
  accountId: string,
  years: number,
  totalIncome?: number,
): AfterTaxResult {
  const account = TAX_ACCOUNTS.find(a => a.id === accountId) ?? TAX_ACCOUNTS[0]
  const totalGain = Math.max(0, pretaxFinal - totalContribution)
  let taxableGain = totalGain
  let taxAmount = 0
  let taxCreditAmount = 0

  if (account.id === 'isa-general' || account.id === 'isa-saving') {
    const nonTaxable = account.nonTaxableLimit ?? 0
    taxableGain = Math.max(0, totalGain - nonTaxable)
    taxAmount = taxableGain * account.taxRate
  } else if (account.id === 'pension-saving' || account.id === 'irp') {
    // 연금 수령 시 5.5% 분리과세 (단순화)
    taxAmount = totalGain * 0.055
    // 세액공제 (총급여 5,500만 이하 16.5%, 초과 13.2%)
    if (account.deductionRate) {
      const yearlyContrib = totalContribution / years
      const cappedContrib = Math.min(yearlyContrib, account.annualLimit)
      const rate = totalIncome !== undefined && totalIncome > 55_000_000 ? 0.132 : 0.165
      taxCreditAmount = cappedContrib * rate * years
    }
  } else {
    taxAmount = totalGain * account.taxRate
  }

  return {
    taxableGain: Math.round(taxableGain),
    taxAmount: Math.round(taxAmount),
    afterTaxFinal: Math.round(pretaxFinal - taxAmount),
    effectiveTaxRate: totalGain > 0 ? Math.round((taxAmount / totalGain * 100) * 10) / 10 : 0,
    taxCreditAmount: taxCreditAmount > 0 ? Math.round(taxCreditAmount) : undefined,
  }
}

/* ─── 인플레이션 실질 가치 ─── */
export interface RealValueResult {
  realValue: number
  purchasingPowerLossPercent: number
  realReturnRate: number  // 명목 - 인플레이션
}

export function calcRealValue(
  nominalValue: number, principalAmount: number, inflationRate: number, years: number, nominalRate: number,
): RealValueResult {
  const inflationFactor = Math.pow(1 + inflationRate / 100, years)
  const realValue = nominalValue / inflationFactor
  const purchasingPowerLossPercent = (1 - 1 / inflationFactor) * 100
  // 실질 수익률 (Fisher 공식)
  const realReturnRate = ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100
  return {
    realValue: Math.round(realValue),
    purchasingPowerLossPercent: Math.round(purchasingPowerLossPercent * 10) / 10,
    realReturnRate: Math.round(realReturnRate * 100) / 100,
    // principalAmount는 향후 활용 (현재는 lint 회피용)
    ...(principalAmount !== undefined ? {} : {}),
  }
}

/* ─── 포맷 ─── */
export function won(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

export function formatEok(n: number): string {
  if (Math.abs(n) >= 100_000_000) {
    const eok = Math.floor(Math.abs(n) / 100_000_000)
    const man = Math.floor((Math.abs(n) % 100_000_000) / 10_000)
    const sign = n < 0 ? '-' : ''
    return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만원` : `${sign}${eok}억원`
  }
  if (Math.abs(n) >= 10_000) {
    return `${Math.round(n / 10_000).toLocaleString('ko-KR')}만원`
  }
  return won(n)
}

export function parseAmount(s: string): number {
  if (!s) return 0
  const cleaned = s.replace(/[^\d]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : 0
}
