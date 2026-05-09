/* ──────────────────────────────────────────────────────
   rent-jeonse/rentJeonseUtils.ts
   2026년 월세 vs 전세 vs 반전세 비교
   ────────────────────────────────────────────────────── */

export type Option = 'jeonse' | 'monthly' | 'semi'

export interface CityAvg {
  city: string
  region: string
  apt33: { price: number; jeonse: number; monthlyDeposit: number; monthlyRent: number }
}

/** 한국 도시별 33평 아파트 평균 시세 (참고용 · 2026년 추정) */
export const CITY_AVERAGES: CityAvg[] = [
  { city: '서울 강남',     region: '서울', apt33: { price: 2_500_000_000, jeonse: 1_200_000_000, monthlyDeposit: 200_000_000, monthlyRent: 4_500_000 } },
  { city: '서울 서초',     region: '서울', apt33: { price: 2_300_000_000, jeonse: 1_150_000_000, monthlyDeposit: 200_000_000, monthlyRent: 4_200_000 } },
  { city: '서울 송파',     region: '서울', apt33: { price: 2_000_000_000, jeonse: 1_000_000_000, monthlyDeposit: 150_000_000, monthlyRent: 3_500_000 } },
  { city: '서울 마포',     region: '서울', apt33: { price: 1_500_000_000, jeonse:   800_000_000, monthlyDeposit: 100_000_000, monthlyRent: 2_800_000 } },
  { city: '서울 성동',     region: '서울', apt33: { price: 1_400_000_000, jeonse:   750_000_000, monthlyDeposit: 100_000_000, monthlyRent: 2_500_000 } },
  { city: '서울 노원',     region: '서울', apt33: { price:   900_000_000, jeonse:   500_000_000, monthlyDeposit:  50_000_000, monthlyRent: 1_700_000 } },
  { city: '경기 분당',     region: '경기', apt33: { price: 1_500_000_000, jeonse:   800_000_000, monthlyDeposit: 100_000_000, monthlyRent: 2_500_000 } },
  { city: '경기 판교',     region: '경기', apt33: { price: 1_700_000_000, jeonse:   900_000_000, monthlyDeposit: 100_000_000, monthlyRent: 2_800_000 } },
  { city: '경기 수원',     region: '경기', apt33: { price:   800_000_000, jeonse:   450_000_000, monthlyDeposit:  50_000_000, monthlyRent: 1_500_000 } },
  { city: '인천 송도',     region: '인천', apt33: { price:   900_000_000, jeonse:   500_000_000, monthlyDeposit:  50_000_000, monthlyRent: 1_600_000 } },
  { city: '부산 해운대',   region: '부산', apt33: { price:   900_000_000, jeonse:   500_000_000, monthlyDeposit:  50_000_000, monthlyRent: 1_600_000 } },
  { city: '대구 수성',     region: '대구', apt33: { price:   700_000_000, jeonse:   400_000_000, monthlyDeposit:  40_000_000, monthlyRent: 1_300_000 } },
  { city: '대전 둔산',     region: '대전', apt33: { price:   600_000_000, jeonse:   350_000_000, monthlyDeposit:  30_000_000, monthlyRent: 1_200_000 } },
  { city: '광주 봉선',     region: '광주', apt33: { price:   500_000_000, jeonse:   300_000_000, monthlyDeposit:  30_000_000, monthlyRent: 1_000_000 } },
  { city: '울산 남구',     region: '울산', apt33: { price:   600_000_000, jeonse:   350_000_000, monthlyDeposit:  30_000_000, monthlyRent: 1_100_000 } },
  { city: '세종',          region: '세종', apt33: { price:   650_000_000, jeonse:   380_000_000, monthlyDeposit:  30_000_000, monthlyRent: 1_200_000 } },
]

/* ─── 입력 ─── */
export interface CalcInputs {
  marketPrice: number          // 매물 시세 (원)

  // 전세
  jeonseDeposit: number        // 전세 보증금
  jeonseLoanRatio: number      // 전세대출 비율 (0~80)
  jeonseLoanRate: number       // 전세대출 금리 (%)
  hugInsurance: boolean        // HUG 보증보험 가입
  hugRateBp: number            // 보증료율 (bp · 10000분의 1) · 12.8 / 15.4

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

/* ─── 월세 세액공제 계산 ─── */
export function monthlyTaxCredit(annualRent: number, totalSalary: number, eligible: boolean): number {
  if (!eligible) return 0
  // 한도: 연 750만 (월 62.5만 한도)
  const eligibleRent = Math.min(7_500_000, annualRent)
  // 7천 이하 17%, 초과 15%
  const rate = totalSalary <= 70_000_000 ? 0.17 : 0.15
  return Math.floor(eligibleRent * rate)
}

/* ─── 전세대출 이자 소득공제 ─── */
export function jeonseLoanDeduction(annualPaid: number, marginalRate: number): number {
  // 원리금 상환액 × 40% (한도 400만 공제) → 한계세율만큼 절세
  const deductible = Math.min(4_000_000, annualPaid * 0.4)
  return Math.floor(deductible * marginalRate)
}

/* ─── 한계세율 추정 (총급여 → 추정) ─── */
export function estimateMarginalRate(salary: number): number {
  // 매우 단순화 (근로소득 기준)
  if (salary <= 14_000_000) return 0.066  // 6% × 1.1 (지방세)
  if (salary <= 50_000_000) return 0.165  // 15%
  if (salary <= 88_000_000) return 0.264  // 24%
  if (salary <= 150_000_000) return 0.385 // 35%
  if (salary <= 300_000_000) return 0.418 // 38%
  return 0.495                            // 45%
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

  // 전세대출 이자 소득공제
  const marginalRate = estimateMarginalRate(inputs.totalSalary)
  const taxCreditAnnual = jeonseLoanDeduction(annualInterest, marginalRate)
  const monthlyTaxSaving = taxCreditAnnual / 12

  const monthlyNetCost = monthlyInterest + monthlyOpportunity + monthlyMaintenance + monthlyInsurance - monthlyTaxSaving

  // 누적 시리즈 — 임대료 인상 없음 (보증금 고정)
  const monthlySeries: number[] = []
  let cum = 0
  for (let m = 1; m <= inputs.months; m++) {
    cum += monthlyNetCost
    monthlySeries.push(cum)
  }

  const riskFactors: string[] = []
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
    '매년 임대료 인상 (5% 상한)',
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
  // 전세 부분 이자 소득공제도 가능
  const marginalRate = estimateMarginalRate(inputs.totalSalary)
  const jeonseDed = jeonseLoanDeduction(annualLoanInterest, marginalRate)
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
  weight: number
  applied: boolean
}

export interface RiskAssessment {
  totalScore: number
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
    { id: 'high_ratio', label: '전세가율 80% 초과 (깡통전세 경계)',  weight: 30, applied: opts.jeonsePriceRatio > 80 },
    { id: 'hug',        label: 'HUG 전세보증보험 미가입',                weight: 20, applied: !opts.hugInsured },
    { id: 'register',   label: '확정일자·전입신고 미완료',               weight: 20, applied: !opts.registered },
    { id: 'registry',   label: '등기부등본 미확인 (근저당·신탁 위험)',    weight: 15, applied: !opts.registryChecked },
    { id: 'landlord',   label: '임대인 신원·소유권 미확인',              weight: 15, applied: !opts.landlordVerified },
    { id: 'realprice',  label: '실거래가·시세 미확인',                  weight: 10, applied: !opts.realPriceChecked },
    { id: 'multi',      label: '다가구·다세대 (선순위 보증금 잔존)',      weight: 10, applied: opts.multipleHouseholds },
  ]
  const totalScore = factors.filter((f) => f.applied).reduce((s, f) => s + f.weight, 0)

  let level: RiskAssessment['level'] = 'low'
  if (totalScore >= 60) level = 'danger'
  else if (totalScore >= 40) level = 'high'
  else if (totalScore >= 20) level = 'medium'

  const recommendations: string[] = []
  if (opts.jeonsePriceRatio > 80) recommendations.push('전세가율 80% 초과 — 보증금 회수 위험. 시세 재확인 또는 다른 매물 검토')
  if (!opts.hugInsured) recommendations.push('HUG 전세보증보험 가입 (보증금 사고 시 100% 보호)')
  if (!opts.registered) recommendations.push('계약 당일 확정일자 + 전입신고 (우선변제권 확보)')
  if (!opts.registryChecked) recommendations.push('등기부등본 확인 — 근저당·신탁·압류 여부')
  if (!opts.landlordVerified) recommendations.push('임대인 신분증 vs 등기부 명의 일치 확인')
  if (!opts.realPriceChecked) recommendations.push('국토부 실거래가 공개시스템에서 시세 확인')
  if (opts.multipleHouseholds) recommendations.push('다가구·다세대는 선순위 보증금 합계 확인 필수')

  return { totalScore, level, factors, recommendations }
}
