/**
 * 대출이자 계산기 — 원리금균등/원금균등 상환 계산
 */

export interface LoanPayment {
  month: number
  principal: number   // 원금 상환액
  interest: number    // 이자 상환액
  total: number       // 월 납입액
  remaining: number   // 남은 원금
}

export interface LoanResult {
  type: 'equal_payment' | 'equal_principal'
  monthlyPayment?: number        // 원리금균등: 고정 월 납입액
  firstPayment?: number          // 원금균등: 첫달 납입액
  lastPayment?: number           // 원금균등: 마지막달 납입액
  totalPayment: number           // 총 상환액
  totalInterest: number          // 총 이자
  schedule: LoanPayment[]        // 상환 스케줄 (전체)
}

/** 원리금균등상환 (매월 동일한 금액 납입) */
export function calcEqualPayment(principal: number, annualRate: number, months: number): LoanResult {
  const r = annualRate / 100 / 12

  let monthlyPayment: number
  if (r === 0) {
    monthlyPayment = principal / months
  } else {
    monthlyPayment = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
  }

  const schedule: LoanPayment[] = []
  let remaining = principal
  let totalInterest = 0

  for (let i = 1; i <= months; i++) {
    const interest  = Math.round(remaining * r)
    const princ     = Math.round(monthlyPayment) - interest
    remaining       = Math.max(0, remaining - princ)
    totalInterest  += interest
    schedule.push({ month: i, principal: princ, interest, total: Math.round(monthlyPayment), remaining })
  }

  return {
    type: 'equal_payment',
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(monthlyPayment) * months,
    totalInterest,
    schedule,
  }
}

/** 원금균등상환 (매월 동일한 원금 + 줄어드는 이자) */
export function calcEqualPrincipal(principal: number, annualRate: number, months: number): LoanResult {
  const r        = annualRate / 100 / 12
  const monthlyPrincipal = Math.round(principal / months)

  const schedule: LoanPayment[] = []
  let remaining = principal
  let totalInterest = 0

  for (let i = 1; i <= months; i++) {
    const interest = Math.round(remaining * r)
    const princ    = i === months ? remaining : monthlyPrincipal
    remaining      = Math.max(0, remaining - princ)
    const total    = princ + interest
    totalInterest += interest
    schedule.push({ month: i, principal: princ, interest, total, remaining })
  }

  return {
    type: 'equal_principal',
    firstPayment: schedule[0].total,
    lastPayment:  schedule[schedule.length - 1].total,
    totalPayment: schedule.reduce((s, r) => s + r.total, 0),
    totalInterest,
    schedule,
  }
}