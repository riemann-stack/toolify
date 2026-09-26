/* 골든 테스트 — 추계신고 경비율 (lib/krExpenseRates.ts + finance/freelance-tax)
   근거: 국세청 「2024년 귀속 경비율 고시」(단순경비율 초과율 = 100 − (100 − 일반율) × 1.4, 수입 4,000만 초과분),
         소득세법 시행령 §143④(단순경비율 적용: 인적용역 직전연도 수입 3,600만 '미달'),
         §208⑤(간편장부대상자: 7,500만 '미만' → 복식부기 의무 = 7,500만 '이상').
   [손계산] 64.1% 업종 수입 5,000만 → 4,000만 × 64.1% + 1,000만 × 49.7% = 2,564만 + 497만 = 3,061만 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  EXPENSE_RATES, EXPENSE_RATE_YEAR, EXPENSE_RATES_BY_YEAR, EXPENSE_THRESHOLDS_BY_YEAR,
  SIMPLE_EXCESS_THRESHOLD, HUMAN_SERVICE_SIMPLE_LIMIT, HUMAN_SERVICE_BOOK_THRESHOLD, simpleExcessRate,
} from '../../lib/krExpenseRates'
import { calculate, simpleExpense, INDUSTRIES, type CalcInputs } from '../../app/tools/finance/freelance-tax/freelanceTaxUtils'

const inputs = (revenue: number, o: Partial<CalcInputs> = {}): CalcInputs => ({
  revenue, industryId: 'other', expenseMode: 'simple', bookExpenses: 0, isNewBusiness: false,
  customRates: false, customSimpleRate: 0, customBaseRate: 0,
  spouseExempt: false, dependents: 0, pensionPaid: 0, yellowUmbrella: 0, pensionSavings: 0, donations: 0,
  useStandard: false, prevYearWithholding: 0, withholdingMode: 'auto', ...o,
})

describe('경비율 표·기준금액 (2024 귀속)', () => {
  test('귀속연도 키와 기준금액', () => {
    assert.equal(EXPENSE_RATE_YEAR, 2024)
    assert.equal(EXPENSE_RATES, EXPENSE_RATES_BY_YEAR[2024])
    assert.deepEqual(EXPENSE_THRESHOLDS_BY_YEAR[2024], {
      simpleExcess: 40_000_000, simpleExcessMultiplier: 1.4,
      personalServiceSimpleLimit: 36_000_000, personalServiceBookThreshold: 75_000_000,
    })
    assert.deepEqual([SIMPLE_EXCESS_THRESHOLD, HUMAN_SERVICE_SIMPLE_LIMIT, HUMAN_SERVICE_BOOK_THRESHOLD], [40_000_000, 36_000_000, 75_000_000])
  })
  test('업종코드별 단순·기준경비율', () => {
    assert.deepEqual(
      Object.fromEntries(Object.values(EXPENSE_RATES).map(r => [r.code, [r.simpleRate, r.baseRate]])),
      {
        '940100': [58.7, 11.2], '940903': [61.7, 14.9], '940306': [64.1, 12.1], '940906': [77.6, 26.5],
        '940909': [64.1, 17.0], '940913': [73.7, 25.3], '940918': [79.4, 15.3], '940926': [64.1, 20.9],
      },
    )
    for (const [code, r] of Object.entries(EXPENSE_RATES)) assert.equal(r.code, code)
  })
  test('도구 업종 프리셋은 코드로 lib 율을 조회', () => {
    for (const ind of INDUSTRIES) {
      const r = EXPENSE_RATES[ind.code]
      assert.ok(r, ind.id)
      assert.deepEqual([ind.simpleRate, ind.baseRate, ind.simpleLimit, ind.bookThreshold], [r.simpleRate, r.baseRate, 36_000_000, 75_000_000], ind.id)
    }
  })
})

describe('단순경비율 초과율', () => {
  test('100 − (100 − 일반율) × 1.4, 0.1%p 반올림, 하한 0', () => {
    assert.deepEqual([58.7, 64.1, 61.7, 77.6, 79.4, 100, 28.5, 0].map(r => simpleExcessRate(r)), [42.2, 49.7, 46.4, 68.6, 71.2, 100, 0, 0])
  })
  test('4,000만 경계: 이하는 일반율, 초과분만 초과율', () => {
    assert.equal(simpleExpense(40_000_000, 64.1), 25_640_000)
    assert.equal(simpleExpense(40_000_001, 64.1), 25_640_000)     // 1원 × 49.7% → 절사
    assert.equal(simpleExpense(40_000_010, 64.1), 25_640_004)
    assert.equal(simpleExpense(50_000_000, 64.1), 30_610_000)
    assert.equal(simpleExpense(-1, 64.1), 0)
  })
})

describe('freelance-tax 적용 한도 판정', () => {
  test('계속사업자: 3,600만 한참 아래 → 단순경비율, 위 → 기준경비율', () => {
    assert.equal(calculate(inputs(35_000_000)).canUseSimple, true)
    assert.equal(calculate(inputs(36_000_001)).canUseSimple, false)
    assert.equal(calculate(inputs(35_000_000)).expenseAmount, 22_435_000)   // 3,500만 × 64.1%
  })
  test('신규사업자: 한도 = 복식부기 기준 7,500만', () => {
    assert.equal(calculate(inputs(50_000_000, { isNewBusiness: true })).canUseSimple, true)
    assert.equal(calculate(inputs(50_000_000, { isNewBusiness: true })).expenseAmount, 30_610_000)
    assert.equal(calculate(inputs(75_000_001, { isNewBusiness: true })).canUseSimple, false)
    assert.equal(calculate(inputs(75_000_001)).isComplexBookRequired, true)
  })
  test('수입 정확히 3,600만이면 단순경비율 불가 (§143④ "미달")', () => {
    assert.equal(calculate(inputs(35_999_999)).canUseSimple, true)
    assert.equal(calculate(inputs(36_000_000)).canUseSimple, false)
    assert.equal(calculate(inputs(36_000_000)).expenseAmount, 6_120_000)   // 3,600만 × 기준 17%
  })
  test('수입 정확히 7,500만이면 복식부기 의무 (§208⑤ "미만"의 반대 = 이상)', () => {
    assert.equal(calculate(inputs(74_999_999)).isComplexBookRequired, false)
    assert.equal(calculate(inputs(75_000_000)).isComplexBookRequired, true)
  })
  test('신규사업자는 첫해 간편장부대상자 — 7,500만 이상이면 단순경비율만 불가 (§208⑤1호·§143④1호)', () => {
    const r = calculate(inputs(75_000_000, { isNewBusiness: true }))
    assert.equal(r.canUseSimple, false)
    assert.equal(r.isComplexBookRequired, false)
    assert.equal(r.expenseAmount, 12_750_000)   // 7,500만 × 기준 17% (전액)
  })
})

describe('freelance-tax 기준경비율 추계', () => {
  test('복식부기의무자는 기준경비율의 1/2 (§143③1호)', () => {
    assert.equal(calculate(inputs(100_000_000)).expenseAmount, 8_500_000)                          // 1억 × 17% ÷ 2
    assert.equal(calculate(inputs(90_000_000, { industryId: 'developer' })).expenseAmount, 9_405_000) // 9천만 × 20.9% ÷ 2 (10.45%)
  })
  test('간편장부대상자는 기준경비율 전액', () => {
    assert.equal(calculate(inputs(50_000_000)).expenseAmount, 8_500_000)   // 5천만 × 17%
  })
})
