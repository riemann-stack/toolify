/* ──────────────────────────────────────────────────────
   finance/compound/compoundUtils.ts
   복리 계산 — 거치식·적립식·증액·역산·인플레이션·시나리오
   ※ 본 도구는 수학적 시뮬레이션이며 투자 자문·수익 보장 도구가 아닙니다.
   ※ 절세 계좌(ISA·연금저축 등) 비교는 본문 가이드 표로만 제공하며, 세후 수익 계산은 UI에서 지원하지 않습니다.
   ────────────────────────────────────────────────────── */

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
  { id: 'conservative', name: '보수적', rate: 4,  desc: '예금·채권 중심',          color: '#0891B2' },
  { id: 'moderate',     name: '기준',   rate: 7,  desc: 'S&P500 100년 평균',       color: 'var(--accent)' },
  { id: 'optimistic',   name: '낙관적', rate: 10, desc: '주식형 펀드 장기 평균',    color: '#A16207' },
  { id: 'aggressive',   name: '공격적', rate: 13, desc: '성장주 (고위험·고수익)',  color: '#EA580C', warning: '큰 변동성' },
]

/* ─── 주기 ─── */
export interface Frequency { id: string; name: string; periodsPerYear: number }

export const CONTRIBUTION_FREQUENCIES: Frequency[] = [
  { id: 'monthly',   name: '매월',   periodsPerYear: 12 },
  { id: 'daily',     name: '매일',   periodsPerYear: 365 },
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

  // 시뮬레이션 스텝 = 복리주기·납입주기 중 촘촘한 쪽으로 통일.
  // 복리 정의(명목율/주기)는 보존: stepRate = (1+netRate)^(cf/steps) - 1
  // → 1년(steps스텝) 누적 시 정확히 (1+netRate)^cf (기존 연환산과 동일).
  const stepsPerYear = Math.max(cf.periodsPerYear, ctf.periodsPerYear)
  const stepRate = Math.pow(1 + netRate, cf.periodsPerYear / stepsPerYear) - 1

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

    // 한 해 안의 스텝 시뮬 — 납입은 납입주기 '시작' 시점에만 투입 (annuity-due 관행 보존)
    let contribMade = 0
    for (let s = 0; s < stepsPerYear; s++) {
      // k번째(0-base) 납입 시점 = k/ctf년 → 스텝 floor(k·steps/ctf) 시작부
      while (
        contribMade < ctf.periodsPerYear &&
        Math.floor((contribMade * stepsPerYear) / ctf.periodsPerYear) === s
      ) {
        balance += adjustedContribution
        totalContribution += adjustedContribution
        yearlyContribution += adjustedContribution
        contribMade++
      }

      const interest = balance * stepRate
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

  // 실효 연수익률 = 복리 주기를 반영한 연환산 수익률(수수료 차감 후) — 본문 §8 표 정의와 동일.
  // (납입 시점에 따라 왜곡되는 총납입 대비 CAGR이 아니라, 자금이 1년간 실제로 불어나는 비율)
  const effectiveAnnualReturn = (Math.pow(1 + netRate, cf.periodsPerYear) - 1) * 100

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
      feasibilityColor: '#059669',
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
    feasibilityColor = '#059669'
    feasibilityNote = '월 소득의 5% 미만 수준 — 충분히 도달 가능'
  } else if (requiredMonthly < 600_000) {
    feasibility = 'reasonable'; feasibilityLabel = '🔵 합리적'
    feasibilityColor = '#0891B2'
    feasibilityNote = '월 소득의 10~15% 수준 — 일반 직장인 가능'
  } else if (requiredMonthly < 1_500_000) {
    feasibility = 'tight'; feasibilityLabel = '🟡 도전적'
    feasibilityColor = '#A16207'
    feasibilityNote = '월 소득의 25% 이상 — 검토 필요'
  } else {
    feasibility = 'unrealistic'; feasibilityLabel = '🔴 비현실적'
    feasibilityColor = '#DC2626'
    feasibilityNote = '월 소득 50%+ — 기간 늘리거나 목표 조정 권장'
  }

  return {
    requiredMonthly,
    requiredYearly: requiredMonthly * 12,
    feasibility, feasibilityLabel, feasibilityColor, feasibilityNote,
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
