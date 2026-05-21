/* ──────────────────────────────────────────────────────
   finance/dsr/dsrUtils.ts
   DSR · LTV · 스트레스 DSR 통합 계산
   ── 모든 금액 단위: 만원 ──
   ⚠️ 규제 수치(DSR 한도·LTV 한도·스트레스 금리)는 정책에 따라 바뀝니다.
      기본값은 참고용이며 사용자가 직접 수정할 수 있게 설계.
   ────────────────────────────────────────────────────── */

export type RepayMethod = 'equal' | 'principal' // 원리금균등 / 원금균등
export type RateType = 'variable' | 'mixed' | 'periodic' | 'fixed' // 변동형/혼합형/주기형/고정형

/** 원리금균등 — 원금 1만원당 월 상환액(만원) */
export function monthlyFactor(annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12
  const nm = Math.round(years * 12)
  if (nm <= 0) return 0
  if (r === 0) return 1 / nm
  const p = Math.pow(1 + r, nm)
  return (r * p) / (p - 1)
}

/** 대출 원금(만원) → 연간 원리금 상환액(만원) */
export function annualRepayment(principal: number, annualRatePct: number, years: number, method: RepayMethod): number {
  if (principal <= 0 || years <= 0) return 0
  if (method === 'equal') {
    return monthlyFactor(annualRatePct, years) * principal * 12
  }
  // 원금균등: 1년차(최대) 기준 — 연 원금 + 1년차 이자
  const annualPrincipal = principal / years
  const firstYearInterest = principal * (annualRatePct / 100)
  return annualPrincipal + firstYearInterest
}

/** 연간 상환여력(만원) → 가능한 대출 원금(만원) 역산 */
export function principalFromAnnual(annualCapacity: number, annualRatePct: number, years: number, method: RepayMethod): number {
  if (annualCapacity <= 0 || years <= 0) return 0
  if (method === 'equal') {
    const perUnit = monthlyFactor(annualRatePct, years) * 12 // 원금 1만원당 연 상환액
    return perUnit > 0 ? annualCapacity / perUnit : 0
  }
  // 원금균등 1년차: 연상환 per 1만원 = 1/years + rate
  const perUnit = 1 / years + annualRatePct / 100
  return perUnit > 0 ? annualCapacity / perUnit : 0
}

// ─── 스트레스 DSR 파라미터 (참고 기본값, 수정 가능) ───
export interface StressPhase { id: 1 | 2 | 3; label: string; ratio: number }
export const STRESS_PHASES: StressPhase[] = [
  { id: 1, label: '1단계 (25%)', ratio: 0.25 },
  { id: 2, label: '2단계 (50%)', ratio: 0.50 },
  { id: 3, label: '3단계 (100%)', ratio: 1.00 },
]

/** 금리 유형별 스트레스 적용률 (변동형 기준, 참고 추정) */
export const RATE_TYPE_FACTOR: Record<RateType, number> = {
  variable: 1.0,  // 변동형 — 전액 적용
  mixed: 0.6,     // 혼합형(고정기간) — 잔여 고정기간에 따라 차등(대표값)
  periodic: 0.3,  // 주기형 — 일부 적용
  fixed: 0,       // 순수 고정형 — 미적용
}

export const RATE_TYPE_LABEL: Record<RateType, string> = {
  variable: '변동형',
  mixed: '혼합형 (고정기간)',
  periodic: '주기형',
  fixed: '고정형',
}

/** 적용 스트레스 가산금리(%p) = 기준 스트레스금리 × 단계율 × 유형율 */
export function appliedStressRate(baseStressPct: number, phaseRatio: number, rateType: RateType): number {
  return baseStressPct * phaseRatio * RATE_TYPE_FACTOR[rateType]
}

// ─── 결과 ───
export interface DsrResult {
  newAnnual: number          // 신규 대출 연 원리금 (만원)
  dsr: number                // 기본 DSR (%)
  stressNewAnnual: number    // 스트레스 적용 신규 연 원리금
  stressDsr: number          // 스트레스 DSR (%)
  ltv: number                // 현재 희망대출 LTV (%)
  // 한도
  ltvMaxLoan: number         // LTV 기준 최대 대출 (만원)
  dsrCapacityAnnual: number  // DSR 한도 내 신규 대출에 쓸 수 있는 연 상환여력
  stressMaxLoan: number      // 스트레스 DSR 기준 최대 대출 (만원)
  finalMaxLoan: number       // 최종 한도 = min(LTV, 스트레스DSR)
  binding: 'LTV' | 'DSR' | '-' // 제약 요인
}

export interface DsrInput {
  annualIncome: number       // 연소득 (만원)
  existingAnnual: number     // 기존 대출 연 원리금 상환액 (만원)
  homePrice: number          // 주택 가격 (만원)
  loanAmount: number         // 희망 대출 금액 (만원)
  ratePct: number            // 대출 금리 (연 %)
  years: number              // 만기 (년)
  method: RepayMethod
  rateType: RateType
  dsrLimitPct: number        // DSR 한도 (% · 기본 40)
  ltvLimitPct: number        // LTV 한도 (% · 기본 70)
  baseStressPct: number      // 기준 스트레스 금리 (%p)
  phaseRatio: number         // 스트레스 단계율
}

export function calcDsr(inp: DsrInput): DsrResult {
  const stressAdd = appliedStressRate(inp.baseStressPct, inp.phaseRatio, inp.rateType)
  const stressedRate = inp.ratePct + stressAdd

  const newAnnual = annualRepayment(inp.loanAmount, inp.ratePct, inp.years, inp.method)
  const stressNewAnnual = annualRepayment(inp.loanAmount, stressedRate, inp.years, inp.method)

  const dsr = inp.annualIncome > 0 ? ((inp.existingAnnual + newAnnual) / inp.annualIncome) * 100 : 0
  const stressDsr = inp.annualIncome > 0 ? ((inp.existingAnnual + stressNewAnnual) / inp.annualIncome) * 100 : 0

  const ltv = inp.homePrice > 0 ? (inp.loanAmount / inp.homePrice) * 100 : 0
  const ltvMaxLoan = inp.homePrice * (inp.ltvLimitPct / 100)

  // 스트레스 DSR 한도 내 신규 대출 가능 연 상환여력
  const dsrCapacityAnnual = Math.max(0, inp.annualIncome * (inp.dsrLimitPct / 100) - inp.existingAnnual)
  // 스트레스 금리로 역산 (보수적 한도)
  const stressMaxLoan = principalFromAnnual(dsrCapacityAnnual, stressedRate, inp.years, inp.method)

  const finalMaxLoan = Math.max(0, Math.min(ltvMaxLoan, stressMaxLoan))
  const binding: 'LTV' | 'DSR' | '-' =
    finalMaxLoan <= 0 ? '-' : ltvMaxLoan < stressMaxLoan ? 'LTV' : 'DSR'

  return {
    newAnnual, dsr, stressNewAnnual, stressDsr, ltv,
    ltvMaxLoan, dsrCapacityAnnual, stressMaxLoan, finalMaxLoan, binding,
  }
}

// ─── 포맷 ───
/** 만원 단위 숫자 → "X억 Y만원" (큰 금액 가독성) */
export function fmtManwon(v: number): string {
  const man = Math.round(v)
  if (man >= 10000) {
    const eok = Math.floor(man / 10000)
    const rest = man % 10000
    return rest === 0 ? `${eok.toLocaleString('ko-KR')}억원` : `${eok.toLocaleString('ko-KR')}억 ${rest.toLocaleString('ko-KR')}만원`
  }
  return `${man.toLocaleString('ko-KR')}만원`
}

export function fmtPct(v: number): string {
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('ko-KR', { maximumFractionDigits: 1 })
}
