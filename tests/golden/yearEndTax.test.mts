/* 골든 테스트 — 연말정산 간이 시뮬레이션 (lib/krYearEndTax.ts, 2026 귀속)
   기대값은 법령 산식으로 손계산해 코드 출력과 대조했다. 모든 케이스는 '오늘 날짜'와 무관(연금 상·하한은 2026 월별 스케줄).

   [손계산 — 부양 0·자녀 0·공제 입력 없음(국민연금·건강·고용 추정)]
   · 근로소득공제 §47: 2,500만 → 750만 + 1,000만×15% = 900만 / 5,000만 → 1,200만 + 500만×5% = 1,225만
   · 국민연금 4.75%(2026) × 총급여 (월 소득이 상·하한 사이) / 건강 3.595% + 장기요양 0.4724% + 고용 0.9% = 4.9674%
   · 표준세액공제 택일 §59의4⑨ — A(보험료 특별소득공제) vs B(표준 13만), 결정세액이 작은 쪽
     2,500만: A 과표 12,070,650 → 산출 724,239 − 근로 398,331 = 325,908
              B 과표 13,312,500 → 산출 798,750 − 근로 439,313 − 130,000 = 229,437 ← 선택(표준)
              지방세 22,944 → 결정 합계 252,381
     5,000만: A 과표 31,391,300 → 산출 3,448,695 − 근로 한도 660,000 = 2,788,695 ← 선택(항목별)
              B 과표 33,875,000 → 3,821,250 − 660,000 − 130,000 = 3,031,250
              지방세 278,870 → 결정 합계 3,067,565
     5,000만·자녀 2·부양 0 입력: 부양가족을 자녀 수(2)로 올려 인적공제 450만, 자녀세액공제 55만
              과표 28,391,300 → 2,998,695 − 660,000 − 550,000 = 1,788,695 + 지방세 178,870 = 1,967,565
   · 신용카드 기본한도(조특법 §126의2, 2026 사용분~): 총급여 7천만 이하 300만 + 자녀 1인당 50만(최대 2명),
     초과 250만 + 25만/인 → 6천만: 300/350/400만 · 8천만: 250/275/300만 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcYearEnd, cardDeduction, effectiveDependents, childTaxCredit,
  estimateNationalPension, estimateOtherInsurance, estimatePrepaidWithholding,
  STANDARD_TAX_CREDIT, type YearEndInput,
} from '../../lib/krYearEndTax'

const input = (gross: number, o: Partial<YearEndInput> = {}): YearEndInput => ({
  gross, dependents: 0, children: 0, elderly: 0, disabled: 0,
  creditCard: 0, checkCash: 0, marketTransit: 0,
  pensionSavings: 0, irp: 0, insurance: 0, medical: 0, education: 0, donation: 0,
  monthlyRent: 0, isHomeless: false,
  nationalPension: null, otherInsurance: null, prepaidTax: null, prepaidIncludesLocal: false,
  ...o,
})

describe('표준세액공제 택일 — followup 골든값', () => {
  test('총급여 2,500만·공제 없음 → 표준세액공제 선택, 결정세액 252,381', () => {
    const r = calcYearEnd(input(25_000_000))
    assert.equal(r.usedStandard, true)
    assert.equal(r.earnedIncome, 16_000_000)
    assert.equal(r.pensionDeduction, 1_187_500)
    assert.equal(r.insurancePaid, 1_241_850)
    assert.equal(r.insuranceDeduction, 0)            // 표준 선택 시 보험료 특별소득공제 미적용
    assert.equal(r.appliedSpecialBlock, STANDARD_TAX_CREDIT)
    assert.equal(r.taxBase, 13_312_500)
    assert.equal(r.computedTax, 798_750)
    assert.equal(r.earnedCredit, 439_313)
    assert.equal(r.decidedIncomeTax, 229_437)
    assert.equal(r.localTax, 22_944)
    assert.equal(r.decidedTotal, 252_381)
    assert.equal(r.marginalRatePct, 6)
  })
  test('총급여 5,000만·공제 없음 → 항목별(보험료 소득공제) 선택, 결정세액 3,067,565', () => {
    const r = calcYearEnd(input(50_000_000))
    assert.equal(r.usedStandard, false)
    assert.equal(r.earnedIncome, 37_750_000)
    assert.equal(r.pensionDeduction, 2_375_000)
    assert.equal(r.insuranceDeduction, 2_483_700)
    assert.equal(r.appliedSpecialBlock, 0)
    assert.equal(r.taxBase, 31_391_300)
    assert.equal(r.computedTax, 3_448_695)
    assert.equal(r.earnedCredit, 660_000)             // §59② 한도: max(66만, 74만 − 1,700만×0.8%)
    assert.equal(r.decidedIncomeTax, 2_788_695)
    assert.equal(r.decidedTotal, 3_067_565)
    assert.equal(r.marginalRatePct, 15)
  })
  test('선택공제를 입력하지 않으면 기납부 추정과 결정세액이 같아 정산 0', () => {
    for (const g of [25_000_000, 50_000_000, 90_000_000]) {
      const r = calcYearEnd(input(g))
      assert.equal(r.prepaidEstimated, true)
      assert.equal(r.settlement, 0, `gross ${g}`)
      assert.equal(estimatePrepaidWithholding(input(g)), r.decidedTotal)
    }
  })
})

describe('effectiveDependents — 부양가족 수 < 자녀 수 보정', () => {
  test('5,000만·자녀 2·부양 0 → 1,967,565 (부양 2 입력과 동일)', () => {
    const r = calcYearEnd(input(50_000_000, { children: 2, dependents: 0 }))
    assert.equal(r.personalDeduction, 4_500_000)
    assert.equal(r.childCredit, 550_000)
    assert.equal(r.taxBase, 28_391_300)
    assert.equal(r.decidedIncomeTax, 1_788_695)
    assert.equal(r.decidedTotal, 1_967_565)
    assert.deepEqual(r, calcYearEnd(input(50_000_000, { children: 2, dependents: 2 })))
  })
  test('경계', () => {
    assert.equal(effectiveDependents({ dependents: 0, children: 2 }), 2)
    assert.equal(effectiveDependents({ dependents: 3, children: 2 }), 3)
    assert.equal(effectiveDependents({ dependents: 0, children: 1, youngChildren: 1 }), 2)
    assert.equal(effectiveDependents({ dependents: -1, children: -2, youngChildren: -1 }), 0)
  })
})

describe('신용카드 등 소득공제 — 자녀 수별 기본한도', () => {
  const card = (gross: number, o: Partial<YearEndInput>) => cardDeduction(input(gross, { creditCard: 100_000_000, ...o }))
  test('총급여 6천만: 자녀 0/1/2/3 → 300만/350만/400만/400만 (최대 2명)', () => {
    assert.deepEqual([0, 1, 2, 3].map(k => card(60_000_000, { children: k })), [3_000_000, 3_500_000, 4_000_000, 4_000_000])
  })
  test('8세 미만 자녀(youngChildren)도 한도 가산 대상, 합산 최대 2명', () => {
    assert.deepEqual([0, 1, 2, 3].map(k => card(60_000_000, { youngChildren: k })), [3_000_000, 3_500_000, 4_000_000, 4_000_000])
    assert.equal(card(60_000_000, { children: 1, youngChildren: 1 }), 4_000_000)
  })
  test('7천만 경계: 이하 저소득 한도 / 초과 250만 + 25만/인', () => {
    assert.equal(card(70_000_000, { children: 2 }), 4_000_000)
    assert.deepEqual([0, 1, 2, 3].map(k => card(70_000_001, { children: k })), [2_500_000, 2_750_000, 3_000_000, 3_000_000])
  })
  test('문턱(총급여 25%)은 신용카드부터 차감 · 체크 30% · 전통시장 40%(추가한도 100만)', () => {
    // 4,000만 → 문턱 1,000만. 신용 1,000만은 문턱에 모두 소진, 체크 200만 × 30% = 60만
    assert.equal(cardDeduction(input(40_000_000, { creditCard: 10_000_000, checkCash: 2_000_000 })), 600_000)
    // 사용액 합계가 문턱 이하 → 0
    assert.equal(cardDeduction(input(40_000_000, { creditCard: 10_000_000 })), 0)
    // 전통시장 500만 × 40% = 200만 → 추가한도 100만
    assert.equal(cardDeduction(input(40_000_000, { creditCard: 10_000_000, marketTransit: 5_000_000 })), 1_000_000)
  })
})

describe('세액공제 구성요소 경계', () => {
  test('자녀세액공제: 1명 25만 · 2명 55만 · 3명↑ 55만 + 40만/인', () => {
    assert.deepEqual([0, 1, 2, 3, 4].map(childTaxCredit), [0, 250_000, 550_000, 950_000, 1_350_000])
    assert.equal(childTaxCredit(-1), 0)
  })
  test('연금계좌: 총급여 5,500만 이하 15% / 초과 12%, 연금저축 600만·합산 900만 한도', () => {
    const pc = (gross: number, ps: number, irp: number) => calcYearEnd(input(gross, { pensionSavings: ps, irp })).pensionAccountCredit
    assert.equal(pc(55_000_000, 6_000_000, 3_000_000), 1_350_000)
    assert.equal(pc(55_000_001, 6_000_000, 3_000_000), 1_080_000)
    assert.equal(pc(50_000_000, 8_000_000, 0), 900_000)           // 연금저축 600만 한도
    assert.equal(pc(50_000_000, 6_000_000, 10_000_000), 1_350_000) // 합산 900만 한도
  })
  test('월세: 무주택 세대주·총급여 8,000만 이하, 5,500만 이하 17% / 초과 15%, 대상 1,000만 한도', () => {
    const rc = (gross: number, rent: number, homeless = true) => calcYearEnd(input(gross, { monthlyRent: rent, isHomeless: homeless })).rentCredit
    assert.equal(rc(50_000_000, 12_000_000), 1_700_000)
    assert.equal(rc(55_000_001, 6_000_000), 900_000)
    assert.equal(rc(80_000_000, 6_000_000), 900_000)
    assert.equal(rc(80_000_001, 6_000_000), 0)
    assert.equal(rc(50_000_000, 6_000_000, false), 0)
  })
  test('특별세액공제: 의료비 총급여 3% 초과분 15% · 기부금 1천만 초과분 30%', () => {
    assert.equal(calcYearEnd(input(50_000_000, { medical: 2_000_000 })).specialCredit, 75_000)
    assert.equal(calcYearEnd(input(50_000_000, { donation: 12_000_000 })).specialCredit, 2_100_000)
    assert.equal(calcYearEnd(input(50_000_000, { insurance: 2_000_000 })).specialCredit, 120_000) // 100만 한도 × 12%
  })
  test('기납부세액 입력: 지방세 미포함이면 ×1.1', () => {
    assert.equal(calcYearEnd(input(50_000_000, { prepaidTax: 1_000_000 })).prepaidTotal, 1_100_000)
    assert.equal(calcYearEnd(input(50_000_000, { prepaidTax: 1_000_000, prepaidIncludesLocal: true })).prepaidTotal, 1_000_000)
  })
})

describe('보험료 추정 — 2026 월별 국민연금 상·하한', () => {
  test('상한: 월 659만(연 7,908만) → 1~6월 637만·7~12월 659만 상한 적용', () => {
    // (6 × 6,370,000 + 6 × 6,590,000) × 4.75%
    assert.equal(estimateNationalPension(79_080_000), 3_693_600)
  })
  test('하한: 월 25만 → 1~6월 40만·7~12월 41만', () => {
    assert.equal(estimateNationalPension(3_000_000), 230_850)
  })
  test('상·하한 사이는 총급여 × 4.75%, 건강·요양·고용 합계 4.9674%', () => {
    assert.equal(estimateNationalPension(40_000_000), 1_900_000)
    assert.equal(estimateOtherInsurance(40_000_000), 1_986_960)
  })
})
