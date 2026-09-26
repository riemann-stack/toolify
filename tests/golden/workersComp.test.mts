/* 골든 테스트 — 산재보험 사업종류별 요율 (lib/krInsuranceRates.ts WORKERS_COMP_INDUSTRIES) × 4대보험 사업주 부담
   근거: 고용노동부 고시 「2026년도 사업종류별 산재보험료율」— 요율은 천분율(‰), 화면 %는 ÷10.
   사업주 산재 부담률 = 업종 요율 + 출퇴근재해 0.6‰ + 임금채권부담금 0.6‰ (FourInsuranceClient와 같은 합성)
   [손계산] 월 300만 − 비과세 20만 = 보수 280만, 금융·보험업 5‰ → (5 + 0.6 + 0.6)‰ = 0.62% → 17,360원
            건설업 35‰ → 3.62% → 101,360원 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calc4Insurance } from '../../app/tools/finance/4-insurance/fourInsuranceUtils'
import {
  WORKERS_COMP_INDUSTRIES, WORKERS_COMP_COMMUTE_PERMILLE, WAGE_CLAIM_LEVY_PERMILLE,
  INSURANCE_RATES, MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, WORK_HOURS_WEEK, pensionBaseAt,
} from '../../lib/krInsuranceRates'

const JUL26 = pensionBaseAt('2026-07')
const permilleOf = (key: string) => {
  const ind = WORKERS_COMP_INDUSTRIES[2026].find(i => i.key === key)
  assert.ok(ind, `업종 ${key} 없음`)
  return ind.permille
}
/** Client와 같은 합성: 업종 % + (출퇴근 + 임금채권) ‰ ÷ 10 */
const employerWorkersRatePct = (permille: number) => permille / 10 + (WORKERS_COMP_COMMUTE_PERMILLE + WAGE_CLAIM_LEVY_PERMILLE) / 10
const workersAt = (taxable: number, key: string) =>
  calc4Insurance({
    monthlySalary: taxable + 200_000, taxFreeAmount: 200_000,
    workersCompRate: employerWorkersRatePct(permilleOf(key)),
    companySize: 'under150', year: 2026, pensionPeriod: JUL26,
  })

describe('산재보험 업종 요율 — 2026 고시 대표 업종', () => {
  test('요율(‰) 표', () => {
    assert.deepEqual(
      Object.fromEntries(WORKERS_COMP_INDUSTRIES[2026].map(i => [i.key, i.permille])),
      { finance: 5, service: 6, electronics: 6, retail: 8, food: 16, transport: 18, construction: 35 },
    )
    assert.deepEqual(WORKERS_COMP_INDUSTRIES[2025], WORKERS_COMP_INDUSTRIES[2026])
    assert.equal(WORKERS_COMP_COMMUTE_PERMILLE, 0.6)
    assert.equal(WAGE_CLAIM_LEVY_PERMILLE, 0.6)
    assert.equal(INSURANCE_RATES[2026].workersCompAvg, 1.47)
  })
  test('금융·보험업 5‰, 보수 280만 → 사업주 산재 17,360원 (followup 골든)', () => {
    const r = workersAt(2_800_000, 'finance')
    assert.equal(Math.round(r.workersEmpr), 17_360)
    assert.equal(r.workersEmp, 0)   // 산재는 전액 사업주 부담
  })
  test('건설업 35‰, 보수 280만 → 101,360원', () => {
    assert.equal(Math.round(workersAt(2_800_000, 'construction').workersEmpr), 101_360)
  })
  test('보수 0 → 0, 비과세는 산재 보수에서 제외', () => {
    assert.equal(workersAt(0, 'finance').workersEmpr, 0)
    const withTaxFree = calc4Insurance({
      monthlySalary: 3_000_000, taxFreeAmount: 1_000_000, workersCompRate: 0.62,
      companySize: 'under150', year: 2026, pensionPeriod: JUL26,
    })
    assert.equal(Math.round(withTaxFree.workersEmpr), 12_400)   // 200만 × 0.62%
  })
})

describe('법정 근로시간·최저시급 (lib/krInsuranceRates)', () => {
  test('주 40시간 · 월 209시간 · 2026 최저시급 10,320원 → 월 2,156,880원', () => {
    assert.equal(WORK_HOURS_WEEK, 40)
    assert.equal(MONTHLY_WORK_HOURS, 209)
    // 209 = (40 + 주휴 8) × 365 / 7 / 12 ≈ 208.57 올림
    assert.equal(Math.ceil((WORK_HOURS_WEEK + 8) * 365 / 7 / 12), MONTHLY_WORK_HOURS)
    assert.equal(MIN_HOURLY_WAGE[2026] * MONTHLY_WORK_HOURS, 2_156_880)
  })
})
