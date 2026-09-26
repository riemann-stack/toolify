/* ──────────────────────────────────────────────────────
   finance/4-insurance/fourInsuranceUtils.ts
   4대보험 핵심 계산 (근로자·사업주 부담) — 요율·상하한 단일 소스 lib/krInsuranceRates.ts
   ────────────────────────────────────────────────────── */

import {
  INSURANCE_RATES, pensionBaseAt, pensionBaseUntil, toYearMonth,
  type PensionBasePeriod, type RateSet,
} from '@/lib/krInsuranceRates'

export type InsuranceYear = 2025 | 2026
export type CompanySize = 'under150' | 'under1000' | 'over1000'

/** 선택 연도에 적용할 국민연금 기준소득월액 상·하한 구간.
 *  상·하한은 매년 7월 개정 → '그 해 중 기준일(asOf)까지 가장 최근에 시행된 구간'을 쓴다.
 *  - 올해: asOf(오늘) 시점 구간 (예: 2026-09 → 2026.7~2027.6 구간)
 *  - 지난해: 그 해 12월 시점 구간 (예: 2025 → 2025.7~2026.6 구간)
 *  asOf는 'YYYY-MM-DD' 또는 'YYYY-MM'. */
export function pensionBaseForYear(year: number, asOf: string): PensionBasePeriod {
  const asOfYm = toYearMonth(asOf)
  const yearEnd = toYearMonth({ year, month: 12 })
  return pensionBaseAt(asOfYm < yearEnd ? asOfYm : yearEnd)
}

/** 선택 연도 화면용 적용기간 표기. 요율(INSURANCE_RATES)은 연도 단위로 바뀌므로
 *  상·하한 구간(7월~익년 6월)을 그 해 안으로 잘라 보여준다.
 *  예: 2025 + 2025.7~2026.6 구간 → '2025년 7~12월' (2026년 1월부터는 요율 9.5%) */
export function yearViewLabel(year: number, p: PensionBasePeriod): string {
  const [fy, fm] = p.from.split('-').map(Number)
  const [ty, tm] = pensionBaseUntil(p).split('-').map(Number)
  const startM = fy < year ? 1 : fm
  const endM = ty > year ? 12 : tm
  return startM === endM ? `${year}년 ${startM}월` : `${year}년 ${startM}~${endM}월`
}

export type CalcInput = {
  monthlySalary: number
  taxFreeAmount: number
  workersCompRate: number
  companySize: CompanySize
  year: InsuranceYear
  /** 국민연금 기준소득월액 상·하한 구간 (pensionBaseForYear 결과) */
  pensionPeriod: PensionBasePeriod
}

export interface CalcResult {
  pensionEmp: number; pensionEmpr: number
  healthEmp: number;  healthEmpr: number
  ltcEmp: number;     ltcEmpr: number
  unempEmp: number;   unempEmpr: number
  workersEmp: number; workersEmpr: number
  employeeTotal: number
  employerTotal: number
  grandTotal: number
  netSalary: number
  companyTotalCost: number
  pensionBase: number
  isPensionMinApplied: boolean
  isPensionMaxApplied: boolean
  rates: RateSet
  pensionPeriod: PensionBasePeriod
}

/** 월 보수 → 4대보험 근로자·사업주 부담 (원 미만 미절사 — 표시 단계에서 반올림) */
export function calc4Insurance(input: CalcInput): CalcResult {
  const r = INSURANCE_RATES[input.year]
  const pb = input.pensionPeriod
  const taxableSalary = Math.max(0, input.monthlySalary - input.taxFreeAmount)
  // 기준소득월액 = 보수월액을 상·하한으로 클램프 (국민연금법 시행령 §5). 보수 0이면 부과 없음.
  const pensionBase = taxableSalary > 0 ? Math.min(Math.max(taxableSalary, pb.min), pb.max) : 0

  const pensionEmp  = pensionBase * (r.pension.employee / 100)
  const pensionEmpr = pensionBase * (r.pension.employer / 100)
  const healthEmp   = taxableSalary * (r.health.employee / 100)
  const healthEmpr  = taxableSalary * (r.health.employer / 100)
  const ltcEmp      = taxableSalary * (r.ltc.employee / 100)
  const ltcEmpr     = taxableSalary * (r.ltc.employer / 100)
  const unempEmp    = taxableSalary * (r.unemp.employee / 100)
  const unempEmpr   = taxableSalary * (r.unemp.employer / 100)
  const unempExtra  = taxableSalary * (r.unemp.extra[input.companySize] / 100)
  const workersEmpr = taxableSalary * (input.workersCompRate / 100)

  const employeeTotal = pensionEmp + healthEmp + ltcEmp + unempEmp
  const employerTotal = pensionEmpr + healthEmpr + ltcEmpr + unempEmpr + unempExtra + workersEmpr

  return {
    pensionEmp, pensionEmpr,
    healthEmp,  healthEmpr,
    ltcEmp,     ltcEmpr,
    unempEmp,   unempEmpr: unempEmpr + unempExtra,
    workersEmp: 0, workersEmpr,
    employeeTotal,
    employerTotal,
    grandTotal: employeeTotal + employerTotal,
    netSalary: input.monthlySalary - employeeTotal,
    companyTotalCost: input.monthlySalary + employerTotal,
    pensionBase,
    isPensionMinApplied: taxableSalary > 0 && taxableSalary < pb.min,
    isPensionMaxApplied: taxableSalary > pb.max,
    rates: r,
    pensionPeriod: pb,
  }
}
