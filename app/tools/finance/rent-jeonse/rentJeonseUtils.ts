/* ──────────────────────────────────────────────────────
   rent-jeonse/rentJeonseUtils.ts
   2026년 월세 vs 전세 vs 반전세 비교
   ────────────────────────────────────────────────────── */

import { earnedIncomeDeduction, progressiveTax } from '@/lib/krIncomeTax'
import { INSURANCE_RATES } from '@/lib/krInsuranceRates'

export type Option = 'jeonse' | 'monthly' | 'semi'

/* ─── 입력 ─── */
export interface CalcInputs {
  marketPrice: number          // 매물 시세 (원)

  // 전세
  jeonseDeposit: number        // 전세 보증금
  jeonseLoanRatio: number      // 전세대출 비율 (0~80)
  jeonseLoanRate: number       // 전세대출 금리 (%)
  hugInsurance: boolean        // HUG 보증보험 가입
  hugRateBp: number            // 보증료율 (bp · 10000분의 1) · 12.8 / 15.4
  jeonseLoanDeductionEligible: boolean // 주택임차차입금 소득공제 자격 (무주택 세대주·국민주택규모·금융기관 차입)

  // 월세
  monthlyDeposit: number       // 월세 보증금
  monthlyRent: number          // 월 임대료
  monthlyTaxCreditEligible: boolean // 월세 세액공제 자격 (무주택·총급여 7천 이하)
  monthlyDepositLoanRate: number    // 월세 보증금 대출 금리 (신용대출 5~7%)

  // 반전세 (전월세 전환율로 자동 계산)
  conversionRate: number       // 4~6%
  semiJeonseRatio: number      // 전세 보증금 중 월세로 전환할 비율 (0~100%)

  // 공통
  maintenance: number          // 관리비 (월)
  totalSalary: number          // 본인 총급여 (세액공제 계산용)
  ownCapital: number           // 자기자본 (전세대출 외 부분)
  months: number               // 보유 기간 (개월) 1~120
  expectedReturn: number       // 기회비용 기대수익률 (% 연)
  annualRentIncrease: number   // 임대료 인상률 (갱신 시) %
}

/* ─── 결과 ─── */
export interface OptionResult {
  option: Option
  label: string

  // 월별 평균
  monthlyInterest: number      // 대출이자
  monthlyOpportunity: number   // 보증금 기회비용
  monthlyRentPaid: number      // 월세
  monthlyMaintenance: number   // 관리비
  monthlyInsurance: number     // HUG 보증보험료 월 환산
  monthlyTaxSaving: number     // 세액공제 월 환산
  monthlyNetCost: number       // 순 월비용 (위 합산)

  // 누적
  cumulativeCost: number       // 보유 기간 누적 비용
  monthlySeries: number[]      // 1~months 각 달의 누적 비용

  // 기타
  effectiveDeposit: number     // 본인이 묶이는 보증금 (자기자본)
  fundingGap: number           // 자금 공백 (자기부담 − 자기자본, 0 이상)
  riskFactors: string[]        // 위험 요인 텍스트 리스트
  taxCreditAnnual: number      // 연 절세액
}

/* ─── 헬퍼 ─── */
export const fmtKRW = (n: number): string => {
  if (Math.abs(n) < 1) return '0원'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}억`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}만원`
  return `${sign}${Math.round(abs).toLocaleString()}원`
}
export const fmtKRWFull = (n: number): string => {
  const sign = n < 0 ? '-' : ''
  return `${sign}${Math.round(Math.abs(n)).toLocaleString()}원`
}

/* ─── 월세 세액공제 계산 (2024 상향: 한도 연 1,000만, 자격 총급여 8천만 이하) ─── */
export function monthlyTaxCredit(annualRent: number, totalSalary: number, eligible: boolean): number {
  if (!eligible) return 0
  // 자격: 총급여 8,000만원 이하 (초과 시 공제 불가)
  if (totalSalary > 80_000_000) return 0
  // 한도: 연 월세액 1,000만 (월 약 83.3만)
  const eligibleRent = Math.min(10_000_000, annualRent)
  // 총급여 5,500만 이하 17%, 5,500만~8,000만 15%
  const rate = totalSalary <= 55_000_000 ? 0.17 : 0.15
  return Math.floor(eligibleRent * rate)
}

/* ─── 과세표준 근사 (총급여 → 공제 전 과세표준) ───
   총급여를 그대로 과세표준으로 보면 한계세율이 한 단계 높게 잡혀(예: 총급여 9천만 → 35%, 실제 과표 약 6천만 → 24%)
   전세대출 소득공제 절세액이 과대해진다. 근로소득공제·본인 기본공제 150만·4대보험 본인부담(2026 요율)을 빼서 근사.
   (국민연금은 기준소득월액 상한을 무시한 단순 근사 — 고소득자는 과표가 약간 낮게 잡힘) */
export function approxTaxBase(salary: number): number {
  const s = Math.max(0, salary)
  const r = INSURANCE_RATES[2026]
  const insuranceRate = (r.pension.employee + r.health.employee + r.ltc.employee + r.unemp.employee) / 100
  return Math.max(0, s - earnedIncomeDeduction(s) - 1_500_000 - s * insuranceRate)
}

/* ─── 전세대출 이자 소득공제 절세액 (주택임차차입금 원리금상환액 공제, 소득세법 §52④) ───
   공제액 = 상환액 × 40% (한도 400만) — 절세액 = 공제 전후 산출세액 차이 × 1.1(지방소득세). 자격이 없으면 0 */
export function jeonseLoanDeduction(annualPaid: number, salary: number, eligible = true): number {
  if (!eligible || annualPaid <= 0) return 0
  const deductible = Math.min(4_000_000, annualPaid * 0.4)
  const base = approxTaxBase(salary)
  const saved = progressiveTax(base) - progressiveTax(Math.max(0, base - deductible))
  return Math.floor(saved * 1.1)
}

/* ─── 전세 옵션 계산 ─── */
export function calculateJeonse(inputs: CalcInputs): OptionResult {
  const loanAmount = inputs.jeonseDeposit * (inputs.jeonseLoanRatio / 100)
  const ownAmount  = inputs.jeonseDeposit - loanAmount

  const annualInterest = loanAmount * (inputs.jeonseLoanRate / 100)
  const monthlyInterest = annualInterest / 12

  const annualOpportunity = ownAmount * (inputs.expectedReturn / 100)
  const monthlyOpportunity = annualOpportunity / 12

  const monthlyMaintenance = inputs.maintenance

  // HUG 보증보험료
  const annualInsurance = inputs.hugInsurance ? inputs.jeonseDeposit * (inputs.hugRateBp / 10000) : 0
  const monthlyInsurance = annualInsurance / 12

  // 전세대출 이자 소득공제 (과세표준 근사 기준, 자격 체크 반영)
  const taxCreditAnnual = jeonseLoanDeduction(annualInterest, inputs.totalSalary, inputs.jeonseLoanDeductionEligible)
  const monthlyTaxSaving = taxCreditAnnual / 12

  const monthlyNetCost = monthlyInterest + monthlyOpportunity + monthlyMaintenance + monthlyInsurance - monthlyTaxSaving

  // 누적 시리즈 — 임대료 인상 없음 (보증금 고정)
  const monthlySeries: number[] = []
  let cum = 0
  for (let m = 1; m <= inputs.months; m++) {
    cum += monthlyNetCost
    monthlySeries.push(cum)
  }

  // 자금 공백: 전세 자기부담(보증금 − 대출)이 보유 자기자본을 초과하면 실제 입주 불가
  const fundingGap = Math.max(0, ownAmount - inputs.ownCapital)

  const riskFactors: string[] = []
  if (fundingGap > 0) riskFactors.push(`자기자본 부족: 자기부담 ${fmtKRW(ownAmount)} > 자기자본 ${fmtKRW(inputs.ownCapital)} (부족 ${fmtKRW(fundingGap)})`)
  if (loanAmount > 0) riskFactors.push('전세대출 금리 인상 위험')
  riskFactors.push('보증금 미반환 위험 (전세사기·깡통전세)')
  if (!inputs.hugInsurance) riskFactors.push('HUG 보증보험 미가입 → 사고 시 보증금 손실 가능')
  if (inputs.jeonseDeposit / inputs.marketPrice > 0.8) riskFactors.push(`전세가율 ${(inputs.jeonseDeposit/inputs.marketPrice*100).toFixed(0)}% (>80% 깡통전세 경계)`)

  return {
    option: 'jeonse',
    label: '전세',
    monthlyInterest,
    monthlyOpportunity,
    monthlyRentPaid: 0,
    monthlyMaintenance,
    monthlyInsurance,
    monthlyTaxSaving,
    monthlyNetCost,
    cumulativeCost: cum,
    monthlySeries,
    effectiveDeposit: ownAmount,
    fundingGap,
    riskFactors,
    taxCreditAnnual,
  }
}

/* ─── 월세 옵션 계산 ─── */
export function calculateMonthly(inputs: CalcInputs): OptionResult {
  // 보증금에 대한 자기자본 기회비용 (월세 보증금이 자기자본 이내면 묶임)
  const ownInDeposit = Math.min(inputs.monthlyDeposit, inputs.ownCapital)
  const loanInDeposit = inputs.monthlyDeposit - ownInDeposit

  const annualLoanInterest = loanInDeposit * (inputs.monthlyDepositLoanRate / 100)
  const monthlyInterest = annualLoanInterest / 12

  const annualOpportunity = ownInDeposit * (inputs.expectedReturn / 100)
  const monthlyOpportunity = annualOpportunity / 12

  const monthlyMaintenance = inputs.maintenance

  // 월세 세액공제 (연)
  const annualRent = inputs.monthlyRent * 12
  const taxCreditAnnual = monthlyTaxCredit(annualRent, inputs.totalSalary, inputs.monthlyTaxCreditEligible)
  const monthlyTaxSaving = taxCreditAnnual / 12

  // 임대료 인상률 (2년·4년 갱신 시) → 누적
  const monthlySeries: number[] = []
  let cum = 0
  let currentRent = inputs.monthlyRent
  for (let m = 1; m <= inputs.months; m++) {
    // 24, 48, 72... 개월마다 갱신
    if (m > 1 && (m - 1) % 24 === 0) {
      currentRent = currentRent * (1 + inputs.annualRentIncrease / 100)
    }
    const monthCost = monthlyInterest + monthlyOpportunity + currentRent + monthlyMaintenance - monthlyTaxSaving
    cum += monthCost
    monthlySeries.push(cum)
  }

  const monthlyRentPaid = inputs.monthlyRent
  const monthlyNetCost = monthlyInterest + monthlyOpportunity + monthlyRentPaid + monthlyMaintenance - monthlyTaxSaving

  const riskFactors: string[] = [
    '갱신 시(2년) 임대료 인상 (갱신청구권 5% 상한, 신규 계약은 시세)',
    '누적 비용 증가 → 자산 형성 어려움',
  ]
  if (loanInDeposit > 0) riskFactors.push('보증금 신용대출 시 5~7% 고금리')

  return {
    option: 'monthly',
    label: '월세',
    monthlyInterest,
    monthlyOpportunity,
    monthlyRentPaid,
    monthlyMaintenance,
    monthlyInsurance: 0,
    monthlyTaxSaving,
    monthlyNetCost,
    cumulativeCost: cum,
    monthlySeries,
    effectiveDeposit: ownInDeposit,
    fundingGap: 0,
    riskFactors,
    taxCreditAnnual,
  }
}

/* ─── 반전세 옵션 (전세 일부를 월세로 전환) ─── */
export function calculateSemi(inputs: CalcInputs): OptionResult {
  // 전세 보증금의 X%를 월세로 전환
  const convertedDeposit = inputs.jeonseDeposit * (inputs.semiJeonseRatio / 100)
  const remainingDeposit = inputs.jeonseDeposit - convertedDeposit
  const monthlyConvertedRent = (convertedDeposit * (inputs.conversionRate / 100)) / 12

  // 잔여 보증금에 대한 자기자본·대출 비율
  const ownInDeposit = Math.min(remainingDeposit, inputs.ownCapital)
  const loanInDeposit = remainingDeposit - ownInDeposit

  const annualLoanInterest = loanInDeposit * (inputs.jeonseLoanRate / 100)
  const monthlyInterest = annualLoanInterest / 12

  const annualOpportunity = ownInDeposit * (inputs.expectedReturn / 100)
  const monthlyOpportunity = annualOpportunity / 12

  const monthlyMaintenance = inputs.maintenance

  // HUG 보증료
  const annualInsurance = inputs.hugInsurance ? remainingDeposit * (inputs.hugRateBp / 10000) : 0
  const monthlyInsurance = annualInsurance / 12

  // 월세 세액공제 적용 가능 (월세 부분에 한해)
  const annualRent = monthlyConvertedRent * 12
  const taxCreditAnnual = monthlyTaxCredit(annualRent, inputs.totalSalary, inputs.monthlyTaxCreditEligible)
  // 전세 부분 이자 소득공제도 가능 (자격 체크 반영)
  const jeonseDed = jeonseLoanDeduction(annualLoanInterest, inputs.totalSalary, inputs.jeonseLoanDeductionEligible)
  const totalTaxAnnual = taxCreditAnnual + jeonseDed
  const monthlyTaxSaving = totalTaxAnnual / 12

  // 누적 (월세 부분만 인상)
  const monthlySeries: number[] = []
  let cum = 0
  let currentRent = monthlyConvertedRent
  for (let m = 1; m <= inputs.months; m++) {
    if (m > 1 && (m - 1) % 24 === 0) {
      currentRent = currentRent * (1 + inputs.annualRentIncrease / 100)
    }
    const monthCost = monthlyInterest + monthlyOpportunity + currentRent + monthlyMaintenance + monthlyInsurance - monthlyTaxSaving
    cum += monthCost
    monthlySeries.push(cum)
  }

  const monthlyRentPaid = monthlyConvertedRent
  const monthlyNetCost = monthlyInterest + monthlyOpportunity + monthlyRentPaid + monthlyMaintenance + monthlyInsurance - monthlyTaxSaving

  const riskFactors: string[] = [
    '월세 부분 인상 위험',
    '보증금 일부도 사고 위험 잔존',
    `전월세 전환율 ${inputs.conversionRate}% — 본인 대출금리(${inputs.jeonseLoanRate}%)와 비교 필수`,
  ]

  return {
    option: 'semi',
    label: '반전세',
    monthlyInterest,
    monthlyOpportunity,
    monthlyRentPaid,
    monthlyMaintenance,
    monthlyInsurance,
    monthlyTaxSaving,
    monthlyNetCost,
    cumulativeCost: cum,
    monthlySeries,
    effectiveDeposit: ownInDeposit,
    fundingGap: 0,
    riskFactors,
    taxCreditAnnual: totalTaxAnnual,
  }
}

/* ─── 전체 비교 ─── */
export function compareAll(inputs: CalcInputs): { results: OptionResult[]; best: Option; breakeven: Record<string, number | null> } {
  const j = calculateJeonse(inputs)
  const m = calculateMonthly(inputs)
  const s = calculateSemi(inputs)

  const results = [j, m, s]
  const best = results.reduce((a, b) => a.cumulativeCost < b.cumulativeCost ? a : b).option

  // 손익분기점: 두 시리즈가 교차하는 시점
  const breakeven: Record<string, number | null> = {
    'jeonse_vs_monthly': findBreakeven(j.monthlySeries, m.monthlySeries),
    'jeonse_vs_semi':    findBreakeven(j.monthlySeries, s.monthlySeries),
    'monthly_vs_semi':   findBreakeven(m.monthlySeries, s.monthlySeries),
  }

  return { results, best, breakeven }
}

function findBreakeven(a: number[], b: number[]): number | null {
  if (a.length === 0 || b.length === 0) return null
  const initialSign = Math.sign(a[0] - b[0])
  for (let i = 1; i < Math.min(a.length, b.length); i++) {
    const cur = Math.sign(a[i] - b[i])
    if (cur !== 0 && cur !== initialSign) return i + 1  // months
  }
  return null
}

/* ─── 자기자본 ROI 시뮬 (Tab 2) ─── */
export interface RoiScenario {
  label: string
  rate: number  // % 연
  series: number[]  // 1~months 평가액 추이
  finalValue: number
}

export function simulateOpportunity(amount: number, months: number): RoiScenario[] {
  const scenarios = [
    { label: '예금 (3%)',   rate: 3 },
    { label: '채권 (4%)',   rate: 4 },
    { label: '주식 (7%)',   rate: 7 },
    { label: '적극투자 (10%)', rate: 10 },
  ]
  return scenarios.map((sc) => {
    const series: number[] = []
    let v = amount
    const monthlyRate = sc.rate / 100 / 12
    for (let m = 1; m <= months; m++) {
      v = v * (1 + monthlyRate)
      series.push(v)
    }
    return { label: sc.label, rate: sc.rate, series, finalValue: v }
  })
}

/* ─── 전세사기 위험 점수 ─── */
export interface RiskFactor {
  id: string
  label: string
  safeLabel: string   // 체크박스 문구 — 체크 = 안전(확인 완료) 상태
  weight: number
  applied: boolean
}

export interface RiskAssessment {
  totalScore: number
  maxScore: number    // 가중치 합 (현재 120) — 표시는 totalScore / maxScore
  percent: number     // totalScore / maxScore × 100 (반올림)
  level: 'low' | 'medium' | 'high' | 'danger'
  factors: RiskFactor[]
  recommendations: string[]
}

export function assessRisk(opts: {
  jeonsePriceRatio: number     // 전세가율 (0~100)
  hugInsured: boolean
  registered: boolean          // 확정일자/전입신고
  registryChecked: boolean     // 등기부등본 확인
  landlordVerified: boolean    // 임대인 신원 확인
  realPriceChecked: boolean    // 실거래가 확인
  multipleHouseholds: boolean  // 다가구·다세대 (선순위 위험)
}): RiskAssessment {
  const factors: RiskFactor[] = [
    { id: 'high_ratio', label: '전세가율 80% 초과 (깡통전세 경계)',  safeLabel: '전세가율 80% 이하 (시세·보증금으로 자동 판정)', weight: 30, applied: opts.jeonsePriceRatio > 80 },
    { id: 'hug',        label: 'HUG 전세보증보험 미가입',                safeLabel: 'HUG 전세보증보험 가입',                    weight: 20, applied: !opts.hugInsured },
    { id: 'register',   label: '확정일자·전입신고 미완료',               safeLabel: '확정일자·전입신고 완료',                   weight: 20, applied: !opts.registered },
    { id: 'registry',   label: '등기부등본 미확인 (근저당·신탁 위험)',    safeLabel: '등기부등본 확인 (근저당·신탁·압류)',         weight: 15, applied: !opts.registryChecked },
    { id: 'landlord',   label: '임대인 신원·소유권 미확인',              safeLabel: '임대인 신원·소유권 확인',                  weight: 15, applied: !opts.landlordVerified },
    { id: 'realprice',  label: '실거래가·시세 미확인',                  safeLabel: '실거래가·시세 확인',                       weight: 10, applied: !opts.realPriceChecked },
    { id: 'multi',      label: '다가구·다세대 (선순위 보증금 잔존)',      safeLabel: '다가구·다세대가 아님 (선순위 보증금 걱정 없음)', weight: 10, applied: opts.multipleHouseholds },
  ]
  const totalScore = factors.filter((f) => f.applied).reduce((s, f) => s + f.weight, 0)
  const maxScore = factors.reduce((s, f) => s + f.weight, 0)
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  let level: RiskAssessment['level'] = 'low'
  if (totalScore >= 60) level = 'danger'
  else if (totalScore >= 40) level = 'high'
  else if (totalScore >= 20) level = 'medium'

  const recommendations: string[] = []
  if (opts.jeonsePriceRatio > 80) recommendations.push('전세가율 80% 초과 — 보증금 회수 위험. 시세 재확인 또는 다른 매물 검토')
  if (!opts.hugInsured) recommendations.push('HUG 전세보증보험 가입 (보증 한도·약관 범위 내 보증금 반환 보장)')
  if (!opts.registered) recommendations.push('계약 당일 확정일자 + 전입신고 (우선변제권 확보)')
  if (!opts.registryChecked) recommendations.push('등기부등본 확인 — 근저당·신탁·압류 여부')
  if (!opts.landlordVerified) recommendations.push('임대인 신분증 vs 등기부 명의 일치 확인')
  if (!opts.realPriceChecked) recommendations.push('국토부 실거래가 공개시스템에서 시세 확인')
  if (opts.multipleHouseholds) recommendations.push('다가구·다세대는 선순위 보증금 합계 확인 필수')

  return { totalScore, maxScore, percent, level, factors, recommendations }
}
