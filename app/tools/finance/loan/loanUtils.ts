/* ──────────────────────────────────────────────────────
   finance/loan/loanUtils.ts
   원리금균등·원금균등·중도상환·갈아타기·금리변동·역산·DSR
   ※ 본 도구는 참고용 추정 도구이며 금융 자문·승인 도구가 아닙니다.
   ────────────────────────────────────────────────────── */

export type RepaymentMethod = 'equal-payment' | 'equal-principal' | 'interest-only'

export interface LoanInput {
  principal: number       // 원 (단위: 원)
  annualRate: number      // 연 금리 (%)
  months: number          // 총 기간 (개월)
  graceMonths?: number    // 거치 기간 (개월)
  method?: RepaymentMethod
}

export interface AmortizationRow {
  month: number
  principal: number
  interest: number
  payment: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

export interface LoanResult {
  method: RepaymentMethod
  monthlyPayment: number       // 원리금균등 = 매월 동일
  firstPayment: number          // 원금균등 = 첫달 / 균등 = 매월
  lastPayment: number
  avgMonthlyPayment: number
  totalInterest: number
  totalPayment: number
  schedule: AmortizationRow[]
}

/* ─── 1. 원리금균등 (거치 지원) ─── */
export function calcEqualPayment(input: LoanInput): LoanResult {
  const r = input.annualRate / 100 / 12
  const n = input.months
  // 거치 기간은 최소 1개월의 원금 상환이 남도록 제한 (거치 ≥ 총기간이면 사실상 만기일시)
  const grace = Math.min(Math.max(0, input.graceMonths ?? 0), Math.max(0, n - 1))
  const principal = input.principal
  const repayMonths = Math.max(1, n - grace)

  const monthlyPayment = r === 0
    ? principal / repayMonths
    : principal * (r * Math.pow(1 + r, repayMonths)) / (Math.pow(1 + r, repayMonths) - 1)

  let balance = principal
  let cumI = 0; let cumP = 0
  const schedule: AmortizationRow[] = []

  for (let m = 1; m <= n; m++) {
    const interest = balance * r
    let principalPayment: number
    let payment: number

    if (m <= grace) {
      principalPayment = 0
      payment = interest
    } else {
      payment = monthlyPayment
      principalPayment = payment - interest
      if (m === n || principalPayment > balance) {
        principalPayment = balance
        payment = principalPayment + interest
      }
    }
    balance -= principalPayment
    cumI += interest
    cumP += principalPayment
    schedule.push({
      month: m,
      principal: Math.round(principalPayment),
      interest: Math.round(interest),
      payment: Math.round(payment),
      balance: Math.round(Math.max(0, balance)),
      cumulativeInterest: Math.round(cumI),
      cumulativePrincipal: Math.round(cumP),
    })
  }

  return {
    method: 'equal-payment',
    monthlyPayment: Math.round(monthlyPayment),
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
    avgMonthlyPayment: Math.round((cumI + cumP) / n),
    totalInterest: Math.round(cumI),
    totalPayment: Math.round(cumI + cumP),
    schedule,
  }
}

/* ─── 2. 원금균등 ─── */
export function calcEqualPrincipal(input: LoanInput): LoanResult {
  const r = input.annualRate / 100 / 12
  const n = input.months
  // 거치 기간은 최소 1개월의 원금 상환이 남도록 제한 (거치 ≥ 총기간이면 사실상 만기일시)
  const grace = Math.min(Math.max(0, input.graceMonths ?? 0), Math.max(0, n - 1))
  const principal = input.principal
  const repayMonths = Math.max(1, n - grace)
  const monthlyPrincipal = principal / repayMonths

  let balance = principal
  let cumI = 0; let cumP = 0
  const schedule: AmortizationRow[] = []

  for (let m = 1; m <= n; m++) {
    const interest = balance * r
    let principalPayment: number
    if (m <= grace) {
      principalPayment = 0
    } else {
      principalPayment = m === n ? balance : monthlyPrincipal
    }
    const payment = principalPayment + interest
    balance -= principalPayment
    cumI += interest
    cumP += principalPayment
    schedule.push({
      month: m,
      principal: Math.round(principalPayment),
      interest: Math.round(interest),
      payment: Math.round(payment),
      balance: Math.round(Math.max(0, balance)),
      cumulativeInterest: Math.round(cumI),
      cumulativePrincipal: Math.round(cumP),
    })
  }

  return {
    method: 'equal-principal',
    monthlyPayment: schedule[0]?.payment ?? 0,
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
    avgMonthlyPayment: Math.round((cumI + cumP) / n),
    totalInterest: Math.round(cumI),
    totalPayment: Math.round(cumI + cumP),
    schedule,
  }
}

/* ─── 3. 만기일시 (이자만 — 전세자금형) ─── */
export function calcInterestOnly(input: LoanInput): LoanResult {
  const r = input.annualRate / 100 / 12
  const n = input.months
  const principal = input.principal
  const monthlyInterest = principal * r

  const schedule: AmortizationRow[] = []
  let cumI = 0
  for (let m = 1; m <= n; m++) {
    cumI += monthlyInterest
    const isLast = m === n
    schedule.push({
      month: m,
      principal: isLast ? Math.round(principal) : 0,
      interest: Math.round(monthlyInterest),
      payment: isLast ? Math.round(principal + monthlyInterest) : Math.round(monthlyInterest),
      balance: isLast ? 0 : Math.round(principal),
      cumulativeInterest: Math.round(cumI),
      cumulativePrincipal: isLast ? Math.round(principal) : 0,
    })
  }

  return {
    method: 'interest-only',
    monthlyPayment: Math.round(monthlyInterest),
    firstPayment: Math.round(monthlyInterest),
    lastPayment: Math.round(principal + monthlyInterest),
    avgMonthlyPayment: Math.round((cumI + principal) / n),
    totalInterest: Math.round(cumI),
    totalPayment: Math.round(cumI + principal),
    schedule,
  }
}

export function calcLoan(input: LoanInput): LoanResult {
  const m = input.method ?? 'equal-payment'
  if (m === 'equal-principal') return calcEqualPrincipal(input)
  if (m === 'interest-only')   return calcInterestOnly(input)
  return calcEqualPayment(input)
}

/* ─── 4. 중도상환 시뮬 ─── */
export type PrepaymentMode = 'reduce-period' | 'reduce-payment'

export interface PrepaymentInput extends LoanInput {
  prepaymentMonth: number     // 중도상환 시점 (1-base)
  prepaymentAmount: number    // 중도상환 금액 (원)
  prepaymentMode: PrepaymentMode
  prepaymentFeeRate: number   // 수수료율 (%) — 약정 기준율. 실제 부과는 잔존기간 비례(아래 PREPAY_FEE_WINDOW)
}

/** 중도상환수수료 부과 기간(개월) — 은행 표준: 수수료율 × 상환액 × (3년 − 경과기간) ÷ 3년, 3년 경과 시 면제.
 *  대출기간이 3년보다 짧으면 대출기간을 분모로 쓴다. */
export const PREPAY_FEE_WINDOW = 36

/** 중도상환수수료 (슬라이딩) — 경과 개월 elapsed 시점 상환 */
export function prepaymentFeeAt(amount: number, feeRatePct: number, elapsed: number, totalMonths: number): number {
  const window = Math.max(1, Math.min(PREPAY_FEE_WINDOW, totalMonths))
  const factor = Math.max(0, (window - elapsed) / window)
  return Math.round(Math.max(0, amount) * (Math.max(0, feeRatePct) / 100) * factor)
}

export interface PrepaymentResult {
  originalTotalInterest: number
  newTotalInterest: number
  interestSaved: number
  prepaymentFee: number
  netSaving: number
  monthsShortened: number
  newMonthlyPayment: number
  originalSchedule: AmortizationRow[]
  newSchedule: AmortizationRow[]
}

export function simulatePrepayment(input: PrepaymentInput): PrepaymentResult {
  const original = calcEqualPayment(input)
  const r = input.annualRate / 100 / 12

  const prepayMonth = Math.max(1, Math.min(input.months - 1, input.prepaymentMonth))
  const balanceAtPrepayment = original.schedule[prepayMonth - 1]?.balance ?? 0
  // 거치기간 — calcEqualPayment와 같은 방식으로 클램프. 거치 중 상환해도 남은 거치는 유지(이자만 납부)
  const grace = Math.min(Math.max(0, input.graceMonths ?? 0), Math.max(0, input.months - 1))

  // 수수료 (상환 원금 × 수수료율 × 잔존기간 비례 — 3년 경과 시 0). 잔액보다 많이 넣어도 실제 상환 원금은 잔액까지
  const prepaymentFee = prepaymentFeeAt(Math.min(input.prepaymentAmount, balanceAtPrepayment), input.prepaymentFeeRate, prepayMonth, input.months)

  if (input.prepaymentAmount >= balanceAtPrepayment) {
    // 완납
    const interestPaidUntilPrepayment = original.schedule
      .slice(0, prepayMonth).reduce((s, x) => s + x.interest, 0)
    return {
      originalTotalInterest: original.totalInterest,
      newTotalInterest: Math.round(interestPaidUntilPrepayment),
      interestSaved: Math.round(original.totalInterest - interestPaidUntilPrepayment),
      prepaymentFee,
      netSaving: Math.round(original.totalInterest - interestPaidUntilPrepayment - prepaymentFee),
      monthsShortened: input.months - prepayMonth,
      newMonthlyPayment: original.monthlyPayment,
      originalSchedule: original.schedule,
      newSchedule: original.schedule.slice(0, prepayMonth),
    }
  }

  // 중도상환 후 새 잔액
  const newBalance = balanceAtPrepayment - input.prepaymentAmount
  const newSchedule: AmortizationRow[] = original.schedule.slice(0, prepayMonth).map(s => ({ ...s }))

  // 중도상환 시점 행에 prepaymentAmount 표시 (원금 추가)
  const lastBefore = newSchedule[prepayMonth - 1]
  if (lastBefore) {
    lastBefore.principal += Math.round(input.prepaymentAmount)
    lastBefore.payment += Math.round(input.prepaymentAmount)
    lastBefore.balance = Math.round(newBalance)
    lastBefore.cumulativePrincipal = Math.round(lastBefore.cumulativePrincipal + input.prepaymentAmount)
  }

  let cumI = newSchedule.reduce((s, x) => s + x.interest, 0)
  let cumP = newSchedule.reduce((s, x) => s + x.principal, 0)
  let balance = newBalance

  // 남은 거치기간: 이자만 납부 (원금 상환 시작은 원래 일정대로 grace + 1개월차)
  for (let m = prepayMonth + 1; m <= grace; m++) {
    const interest = balance * r
    cumI += interest
    newSchedule.push({
      month: m,
      principal: 0,
      interest: Math.round(interest),
      payment: Math.round(interest),
      balance: Math.round(balance),
      cumulativeInterest: Math.round(cumI),
      cumulativePrincipal: Math.round(cumP),
    })
  }
  const repayStart = Math.max(prepayMonth, grace) + 1

  if (input.prepaymentMode === 'reduce-period') {
    // 기간 단축: 월 상환액 동일, 잔액 감소까지 반복
    const monthlyPayment = original.monthlyPayment
    let m = repayStart
    const safety = input.months + 12
    while (balance > 0.5 && m <= safety) {
      const interest = balance * r
      let principal = monthlyPayment - interest
      if (principal > balance) principal = balance
      balance -= principal
      cumI += interest
      cumP += principal
      newSchedule.push({
        month: m,
        principal: Math.round(principal),
        interest: Math.round(interest),
        payment: Math.round(principal + interest),
        balance: Math.round(Math.max(0, balance)),
        cumulativeInterest: Math.round(cumI),
        cumulativePrincipal: Math.round(cumP),
      })
      m++
    }
    const newTotalInterest = Math.round(cumI)
    return {
      originalTotalInterest: original.totalInterest,
      newTotalInterest,
      interestSaved: Math.round(original.totalInterest - newTotalInterest),
      prepaymentFee,
      netSaving: Math.round(original.totalInterest - newTotalInterest - prepaymentFee),
      monthsShortened: input.months - newSchedule.length,
      newMonthlyPayment: monthlyPayment,
      originalSchedule: original.schedule,
      newSchedule,
    }
  } else {
    // 월 상환액 감소: 기간 동일, 새 월 상환액 계산 (거치 중 상환이면 거치 종료 후 남은 기간으로 재분할)
    const remainingMonths = Math.max(1, input.months - (repayStart - 1))
    const newMonthly = r === 0
      ? newBalance / remainingMonths
      : newBalance * (r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1)

    for (let m = repayStart; m <= input.months; m++) {
      const interest = balance * r
      let principal = newMonthly - interest
      if (m === input.months || principal > balance) principal = balance
      balance -= principal
      cumI += interest
      cumP += principal
      newSchedule.push({
        month: m,
        principal: Math.round(principal),
        interest: Math.round(interest),
        payment: Math.round(principal + interest),
        balance: Math.round(Math.max(0, balance)),
        cumulativeInterest: Math.round(cumI),
        cumulativePrincipal: Math.round(cumP),
      })
    }
    const newTotalInterest = Math.round(cumI)
    return {
      originalTotalInterest: original.totalInterest,
      newTotalInterest,
      interestSaved: Math.round(original.totalInterest - newTotalInterest),
      prepaymentFee,
      netSaving: Math.round(original.totalInterest - newTotalInterest - prepaymentFee),
      monthsShortened: 0,
      newMonthlyPayment: Math.round(newMonthly),
      originalSchedule: original.schedule,
      newSchedule,
    }
  }
}

/* ─── 5. 갈아타기 (Refinancing) ─── */
export interface RefinanceInput {
  remainingPrincipal: number
  currentRate: number
  remainingMonths: number
  currentPrepaymentFee: number
  newRate: number
  newMonths: number
  newOriginationFee: number
  newOtherFees: number
}

export interface RefinanceResult {
  currentTotalInterest: number
  currentMonthly: number
  newTotalInterest: number
  newMonthly: number
  totalCostFees: number
  monthlyPaymentDiff: number    // 새 - 기존 (음수 = 절감)
  totalSaving: number            // 음수 = 손해
  breakEvenMonths: number | null
  isWorthwhile: boolean
}

export function simulateRefinance(input: RefinanceInput): RefinanceResult {
  const current = calcEqualPayment({
    principal: input.remainingPrincipal,
    annualRate: input.currentRate,
    months: input.remainingMonths,
    method: 'equal-payment',
  })
  const refi = calcEqualPayment({
    principal: input.remainingPrincipal,
    annualRate: input.newRate,
    months: input.newMonths,
    method: 'equal-payment',
  })

  const totalFees = input.currentPrepaymentFee + input.newOriginationFee + input.newOtherFees
  const monthlyDiff = refi.monthlyPayment - current.monthlyPayment
  const monthlySaving = -monthlyDiff
  const totalSaving = current.totalInterest - refi.totalInterest - totalFees
  const breakEvenMonths = monthlySaving > 0 ? Math.ceil(totalFees / monthlySaving) : null

  return {
    currentTotalInterest: current.totalInterest,
    currentMonthly: current.monthlyPayment,
    newTotalInterest: refi.totalInterest,
    newMonthly: refi.monthlyPayment,
    totalCostFees: totalFees,
    monthlyPaymentDiff: Math.round(monthlyDiff),
    totalSaving: Math.round(totalSaving),
    breakEvenMonths,
    isWorthwhile: totalSaving > 0,
  }
}

/* ─── 6. 금리 변동 시나리오 ─── */
export interface RateChangeRow {
  delta: number       // %p
  newRate: number
  monthlyPayment: number
  monthlyDiff: number
  yearlyDiff: number
  totalInterest: number
  totalInterestDiff: number
}

export const RATE_CHANGES = [-1.0, -0.5, -0.25, 0, 0.25, 0.5, 1.0, 2.0]

export function simulateRateChanges(input: LoanInput): RateChangeRow[] {
  const baseline = calcEqualPayment(input)
  return RATE_CHANGES.map(delta => {
    const newRate = Math.max(0, input.annualRate + delta)
    const r = calcEqualPayment({ ...input, annualRate: newRate })
    return {
      delta, newRate,
      monthlyPayment: r.monthlyPayment,
      monthlyDiff: r.monthlyPayment - baseline.monthlyPayment,
      yearlyDiff: (r.monthlyPayment - baseline.monthlyPayment) * 12,
      totalInterest: r.totalInterest,
      totalInterestDiff: r.totalInterest - baseline.totalInterest,
    }
  })
}

/* ─── 7. 감당 가능 대출금 (역산) ─── */
export interface ReverseInput {
  monthlyPayment: number   // 월 상환 가능액
  annualRate: number
  months: number
}

export interface ReverseResult {
  principal: number
  totalInterest: number
  totalPayment: number
}

export function calcAffordableLoan(input: ReverseInput): ReverseResult {
  if (input.monthlyPayment <= 0 || input.months <= 0) {
    return { principal: 0, totalInterest: 0, totalPayment: 0 }
  }
  let low = 0
  let high = input.monthlyPayment * input.months * 2
  let safety = 0
  while (high - low > 10_000 && safety++ < 100) {
    const mid = (low + high) / 2
    const r = calcEqualPayment({
      principal: mid, annualRate: input.annualRate, months: input.months, method: 'equal-payment',
    })
    if (r.monthlyPayment < input.monthlyPayment) low = mid
    else high = mid
  }
  const principal = Math.round(low / 100_000) * 100_000  // 10만원 단위
  const r = calcEqualPayment({
    principal, annualRate: input.annualRate, months: input.months, method: 'equal-payment',
  })
  return {
    principal,
    totalInterest: r.totalInterest,
    totalPayment: principal + r.totalInterest,
  }
}

/* ─── 8. DSR 추정 (참고용) ─── */
export interface DsrInput {
  annualIncome: number       // 연소득 (원)
  yearlyPayment: number      // 본 대출 연간 원리금
  otherYearlyDebt: number    // 기타 대출 연간 원리금
}

export interface DsrResult {
  dsr: number
  riskLevel: 'safe' | 'caution' | 'limit' | 'over'
  riskLabel: string
  riskColor: string
  description: string
}

export function calcDSR(input: DsrInput): DsrResult {
  if (input.annualIncome <= 0) {
    return { dsr: 0, riskLevel: 'safe', riskLabel: '입력 필요', riskColor: 'var(--muted)', description: '연소득을 입력해주세요.' }
  }
  const dsr = ((input.yearlyPayment + input.otherYearlyDebt) / input.annualIncome) * 100
  let riskLevel: DsrResult['riskLevel'] = 'safe'
  let riskLabel = '🟢 안전'
  let riskColor = 'var(--emerald-600)'
  let description = '은행권 DSR 한도(40%) 내 안정 범위입니다.'
  if (dsr > 40) {
    riskLevel = 'over'; riskLabel = '🔴 한도 초과'
    riskColor = 'var(--red-600)'
    description = '은행권 DSR 한도 40%를 초과합니다. 대출 한도 제한 가능성이 매우 높습니다.'
  } else if (dsr > 35) {
    riskLevel = 'limit'; riskLabel = '🟠 한도 근접'
    riskColor = 'var(--orange-600)'
    description = 'DSR 한도(40%)에 근접합니다. 다른 대출 추가 시 한도 초과 가능.'
  } else if (dsr > 25) {
    riskLevel = 'caution'; riskLabel = '🟡 주의'
    riskColor = 'var(--yellow-700)'
    description = '월 상환 부담이 있는 편입니다. 비상금·생활비 여유를 점검하세요.'
  }
  return { dsr: Math.round(dsr * 10) / 10, riskLevel, riskLabel, riskColor, description }
}

/* ─── 한국 시중 금리 (2026년 5월 기준 추정) ─── */
export interface KoreaLoanRate {
  id: string
  name: string
  avg: number
  min: number
  max: number
  source: string
}

export const KOREA_LOAN_RATES: KoreaLoanRate[] = [
  { id: 'mortgage',      name: '주택담보대출 (변동)',  avg: 4.3, min: 3.8, max: 4.9, source: '한국은행 가계대출 통계' },
  { id: 'mortgage-fixed', name: '주택담보대출 (고정)', avg: 4.5, min: 4.0, max: 5.1, source: '한국은행 가계대출 통계' },
  { id: 'jeonse',        name: '전세자금대출',         avg: 4.0, min: 3.5, max: 4.6, source: '한국은행 가계대출 통계' },
  { id: 'credit',        name: '신용대출',             avg: 5.5, min: 4.0, max: 8.5, source: '한국은행 가계대출 통계' },
  { id: 'car',           name: '자동차 할부',          avg: 5.0, min: 3.5, max: 7.0, source: '시중 캐피탈 평균' },
  { id: 'youth-policy',  name: '청년 정책 대출',       avg: 3.5, min: 2.5, max: 4.5, source: '주택도시기금·청년전세' },
]

/* ─── 대출 종류 프리셋 ─── */
export interface LoanPreset {
  id: string
  name: string
  defaultAmount: number  // 만원
  defaultRate: number
  defaultMonths: number
  defaultGrace: number
  desc: string
  rateRefId?: string  // KOREA_LOAN_RATES의 id
}

export const LOAN_PRESETS: LoanPreset[] = [
  { id: 'mortgage', name: '🏠 주택담보대출', defaultAmount: 30000, defaultRate: 4.3, defaultMonths: 360, defaultGrace: 36, desc: '30년 표준, 거치 3년', rateRefId: 'mortgage' },
  { id: 'jeonse',   name: '🔑 전세자금',     defaultAmount: 15000, defaultRate: 4.0, defaultMonths: 24,  defaultGrace: 0,  desc: '계약 기간 동안 이자만',     rateRefId: 'jeonse' },
  { id: 'credit',   name: '💳 신용대출',     defaultAmount: 5000,  defaultRate: 5.5, defaultMonths: 60,  defaultGrace: 0,  desc: '5년 분할',                  rateRefId: 'credit' },
  { id: 'car',      name: '🚗 자동차 할부',  defaultAmount: 3000,  defaultRate: 5.0, defaultMonths: 60,  defaultGrace: 0,  desc: '5년 표준',                  rateRefId: 'car' },
  { id: 'youth',    name: '🎓 청년 정책',    defaultAmount: 10000, defaultRate: 3.5, defaultMonths: 240, defaultGrace: 0,  desc: '주택도시기금 등',            rateRefId: 'youth-policy' },
  { id: 'custom',   name: '✏️ 직접 입력',    defaultAmount: 0,     defaultRate: 0,   defaultMonths: 0,   defaultGrace: 0,  desc: '자유롭게 입력' },
]

/* ─── 포맷 ─── */
export const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

export function formatEok(n: number): string {
  if (Math.abs(n) >= 100_000_000) {
    const eok = Math.floor(Math.abs(n) / 100_000_000)
    const man = Math.floor((Math.abs(n) % 100_000_000) / 10_000)
    const sign = n < 0 ? '-' : ''
    return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만원` : `${sign}${eok}억원`
  }
  if (Math.abs(n) >= 10_000) {
    const man = Math.round(n / 10_000)
    // 99,995,000처럼 반올림하면 1억이 되는 값은 '10,000만원' 대신 '1억원'
    if (Math.abs(man) >= 10_000) return `${n < 0 ? '-' : ''}1억원`
    return `${man.toLocaleString('ko-KR')}만원`
  }
  return won(n)
}

export function parseAmount(s: string): number {
  if (!s) return 0
  const n = parseFloat(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
