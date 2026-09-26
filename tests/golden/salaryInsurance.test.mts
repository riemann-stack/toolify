/* 골든 테스트 — 연봉 실수령(salary) · 4대보험(4-insurance) · 연말정산 연금 추정 · 국민연금 B값 클램프
   모든 케이스는 국민연금 상·하한 구간을 명시해 '오늘 날짜'와 무관하게 결정적이다.

   [2026-09 변경 전후 — 국민연금 상한 637만 → 659만 (2026.7~)]  부양 1·자녀 0·비과세 0
     연봉 3,000만: 연금 118,750 / 실수령 2,211,080 (변화 없음 — 상·하한 사이)
     연봉 5,000만: 연금 197,910 / 실수령 3,506,176 (변화 없음)
     연봉 8,000만: 연금 302,570 → 313,020, 실수령 5,349,596 → 5,341,906 (−7,690: 연금 +10,450, 소득세 −2,510·지방세 −250)
     연봉 1억    : 연금 302,570 → 313,020, 실수령 6,537,333 → 6,529,643 (−7,690)
     연봉 300만(월 25만): 하한 신규 적용 — 연금 11,870 → 19,470 (41만 × 4.75%)
   'before'는 pensionBaseAt('2026-06')(40만~637만)으로 재현한다. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calcSalary, type SalaryInput } from '../../app/tools/finance/salary/salaryUtils'
import { calc4Insurance, pensionBaseForYear } from '../../app/tools/finance/4-insurance/fourInsuranceUtils'
import { pensionBaseAt, PENSION_BASE_CURRENT } from '../../lib/krInsuranceRates'
import { estimateNationalPension } from '../../lib/krYearEndTax'
import {
  calcPension, NP_INCOME_FLOOR, NP_INCOME_CAP, NP_INCOME_BASE, type PensionInput,
} from '../../lib/krNationalPension'

const JUL26 = pensionBaseAt('2026-07') // 41만~659만
const JUN26 = pensionBaseAt('2026-06') // 40만~637만 (변경 전 값)

const sal = (grossYearly: number, pensionBase = JUL26, o: Partial<SalaryInput> = {}) =>
  calcSalary({ grossYearly, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0, isInsured: true, pensionBase, ...o })

describe('salary calcSalary — 골든값', () => {
  const golden: [number, { pension: number; health: number; longTermCare: number; employment: number; incomeTax: number; netMonthly: number }][] = [
    [30_000_000,  { pension: 118_750, health: 89_870,  longTermCare: 11_800, employment: 22_500, incomeTax: 41_820,  netMonthly: 2_211_080 }],
    [50_000_000,  { pension: 197_910, health: 149_790, longTermCare: 19_680, employment: 37_490, incomeTax: 232_390, netMonthly: 3_506_176 }],
    [80_000_000,  { pension: 313_020, health: 239_660, longTermCare: 31_490, employment: 59_990, incomeTax: 618_730, netMonthly: 5_341_906 }],
    [100_000_000, { pension: 313_020, health: 299_580, longTermCare: 39_360, employment: 74_990, incomeTax: 978_860, netMonthly: 6_529_643 }],
  ]
  for (const [gross, want] of golden) {
    test(`연봉 ${gross / 10_000}만원`, () => {
      const r = sal(gross)
      assert.deepEqual(
        { pension: r.pension, health: r.health, longTermCare: r.longTermCare, employment: r.employment, incomeTax: r.incomeTax, netMonthly: r.netMonthly },
        want,
      )
      assert.equal(r.localTax, Math.floor(r.incomeTax * 0.1 / 10) * 10)
    })
  }
  test('국민연금 = 기준소득월액 × 4.75% (10원 미만 절사) — 손계산', () => {
    assert.equal(sal(100_000_000).pension, Math.floor(6_590_000 * 0.0475 / 10) * 10) // 313,020
    assert.equal(sal(100_000_000, JUN26).pension, 302_570)                         // 637만 × 4.75%
  })
  test('변경 전(637만 상한) 재현: 1억 실수령 6,537,333 → 변경 후 6,529,643', () => {
    assert.equal(sal(100_000_000, JUN26).netMonthly, 6_537_333)
    assert.equal(sal(100_000_000, JUN26).netMonthly - sal(100_000_000).netMonthly, 7_690)
  })
  test('상한 경계: 월 659만(연 7,908만) 이상은 연금 동일', () => {
    assert.equal(sal(79_080_000).pension, sal(150_000_000).pension)
    assert.ok(sal(79_000_000).pension < sal(79_080_000).pension)
  })
  test('하한: 월 25만 → 41만 기준 19,470원 · 비가입이면 0', () => {
    assert.equal(sal(3_000_000).pension, 19_470)
    assert.equal(sal(3_000_000, JUL26, { isInsured: false }).pension, 0)
  })
  test('pensionBase 생략 시 오늘 기준 구간', () => {
    const r = calcSalary({ grossYearly: 100_000_000, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0, isInsured: true })
    assert.equal(r.pension, Math.floor(PENSION_BASE_CURRENT.max * 0.0475 / 10) * 10)
  })
})

describe('4-insurance calc4Insurance', () => {
  const base = { workersCompRate: 0, companySize: 'under150' as const }
  test('월 300만·비과세 20만 (2026) — 손계산', () => {
    const r = calc4Insurance({ ...base, monthlySalary: 3_000_000, taxFreeAmount: 200_000, year: 2026, pensionPeriod: JUL26 })
    // 과세 280만: 연금 4.75% 133,000 · 건강 3.595% 100,660 · 장기요양 0.4724% 13,227.2 · 고용 0.9% 25,200
    assert.equal(r.pensionEmp, 133_000)
    assert.ok(Math.abs(r.healthEmp - 100_660) < 1e-6)
    assert.ok(Math.abs(r.ltcEmp - 13_227.2) < 1e-6)
    assert.ok(Math.abs(r.unempEmp - 25_200) < 1e-6)
    assert.ok(Math.abs(r.employeeTotal - 272_087.2) < 1e-6)
    assert.equal(r.isPensionMinApplied || r.isPensionMaxApplied, false)
  })
  test('사업주 부담 (150인 미만 +0.25%, 산재 0.19%)', () => {
    const r = calc4Insurance({ monthlySalary: 3_000_000, taxFreeAmount: 200_000, workersCompRate: 0.19, companySize: 'under150', year: 2026, pensionPeriod: JUL26 })
    // 133,000 + 100,660 + 13,227.2 + (25,200 + 7,000) + 5,320
    assert.ok(Math.abs(r.employerTotal - 284_407.2) < 1e-6)
  })
  test('상한: 2026.7~ 659만 → 313,025 / 2026.6까지 637만 → 302,575 (차 10,450)', () => {
    const a = calc4Insurance({ ...base, monthlySalary: 8_000_000, taxFreeAmount: 0, year: 2026, pensionPeriod: JUL26 })
    const b = calc4Insurance({ ...base, monthlySalary: 8_000_000, taxFreeAmount: 0, year: 2026, pensionPeriod: JUN26 })
    assert.ok(Math.abs(a.pensionEmp - 313_025) < 1e-6)
    assert.ok(Math.abs(b.pensionEmp - 302_575) < 1e-6)
    assert.equal(a.isPensionMaxApplied, true)
    assert.equal(a.pensionBase, 6_590_000)
  })
  test('하한: 월 35만 → 41만 기준 · 보수 0이면 미부과', () => {
    const r = calc4Insurance({ ...base, monthlySalary: 350_000, taxFreeAmount: 0, year: 2026, pensionPeriod: JUL26 })
    assert.equal(r.pensionBase, 410_000)
    assert.equal(r.isPensionMinApplied, true)
    const z = calc4Insurance({ ...base, monthlySalary: 200_000, taxFreeAmount: 200_000, year: 2026, pensionPeriod: JUL26 })
    assert.equal(z.pensionEmp, 0)
    assert.equal(z.isPensionMinApplied, false)
  })
  test('2025 토글: 요율 4.5% + 2025.7~2026.6 구간(637만)', () => {
    const p = pensionBaseForYear(2025, '2026-09-26')
    const r = calc4Insurance({ ...base, monthlySalary: 8_000_000, taxFreeAmount: 0, year: 2025, pensionPeriod: p })
    assert.ok(Math.abs(r.pensionEmp - 286_650) < 1e-6)
  })
})

describe('연말정산 국민연금 추정 (2026 귀속, 월별 상·하한)', () => {
  test('1억: 1~6월 637만 + 7~12월 659만 → 3,693,600', () => {
    assert.equal(estimateNationalPension(100_000_000), 6 * 302_575 + 6 * 313_025)
  })
  test('4천만: 상·하한 사이 → 총급여 × 4.75%', () => {
    assert.equal(estimateNationalPension(40_000_000), 1_900_000)
  })
  test('0원 → 0', () => assert.equal(estimateNationalPension(0), 0))
})

describe('national-pension calcPension — B값 클램프', () => {
  const inp = (avgIncome: number, o: Partial<PensionInput> = {}): PensionInput =>
    ({ totalMonths: 240, avgIncome, mode: 'normal', adjustYears: 0, spouse: false, dependents: 0, incomeBase: JUL26, ...o })
  test('41만 미만 → 41만, 659만 초과 → 659만, 사이값 유지', () => {
    assert.equal(calcPension(inp(300_000)).B, 410_000)
    assert.equal(calcPension(inp(410_000)).B, 410_000)
    assert.equal(calcPension(inp(2_500_000)).B, 2_500_000)
    assert.equal(calcPension(inp(6_590_000)).B, 6_590_000)
    assert.equal(calcPension(inp(7_000_000)).B, 6_590_000)
  })
  test('이전 구간 명시 시 637만 상한', () => {
    assert.equal(calcPension(inp(7_000_000, { incomeBase: JUN26 })).B, 6_370_000)
  })
  test('20년·B 250만 → 월 612,052원 (1.29 × (A 3,193,511 + B) ÷ 12)', () => {
    assert.equal(calcPension(inp(2_500_000)).monthly, Math.round(1.29 * (3_193_511 + 2_500_000) / 12))
    assert.equal(calcPension(inp(2_500_000)).monthly, 612_052)
  })
  test('NP_INCOME_FLOOR/CAP는 스케줄 파생 (단일 소스)', () => {
    // 값 비교(deepEqual): tsx는 ESM 테스트가 직접 import한 모듈과 CJS로 require된 모듈을 별도 인스턴스로 올릴 수 있다
    assert.deepEqual(NP_INCOME_BASE, PENSION_BASE_CURRENT)
    assert.equal(NP_INCOME_FLOOR, PENSION_BASE_CURRENT.min)
    assert.equal(NP_INCOME_CAP, PENSION_BASE_CURRENT.max)
    const r = calcPension({ totalMonths: 240, avgIncome: 99_000_000, mode: 'normal', adjustYears: 0, spouse: false, dependents: 0 })
    assert.equal(r.B, NP_INCOME_CAP)
  })
})
