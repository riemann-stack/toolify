/* 골든 테스트 — 상속세·증여세 (lib/krInheritanceTax.ts + finance/inheritance/inheritanceUtils.ts)
   기대값은 상속세 및 증여세법 산식 손계산값.
   · 세율 §26: 1억↓ 10% / 5억↓ 20%−1천만 / 10억↓ 30%−6천만 / 30억↓ 40%−1.6억 / 초과 50%−4.6억
   · 신고세액공제 §69: 산출세액 3% (원 단위 반올림)

   [손계산]
   상속 20억 · 배우자 + 부모 2 (자녀 없음), 장례비 미입력(최소 500만), 채무 0:
     과세가액 19억9,500만 − 일괄공제 5억 − 배우자공제(20억 × 1.5/3.5 = 857,142,857.14…)
     = 과표 637,857,142.86 → 산출 × 30% − 6천만 = 131,357,142.86 → 신고공제 3,940,714 → 127,416,428.86
     → 화면 표시(원 반올림) 127,416,429
   증여 10억 · 배우자: 10억 − 6억 = 과표 4억 → 20% − 1천만 = 7,000만 → 신고공제 210만 → 67,900,000 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  inheritanceGiftTax, inheritanceGiftBracket, INHERITANCE_GIFT_TAX_BRACKETS, GIFT_DEDUCTION,
  GENERATION_SKIP_SURCHARGE_RATE, FILING_CREDIT_RATE,
  funeralDeductionOf, basicOrLumpSumDeduction, spouseInheritanceDeduction, financialAssetDeduction, cohabitHomeDeduction,
} from '../../lib/krInheritanceTax'
import { calcInheritanceTax, calcGiftTax, getSpouseLegalShare, getDeduction } from '../../app/tools/finance/inheritance/inheritanceUtils'

const EOK = 100_000_000
const near = (a: number, b: number, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)

describe('followup 골든값', () => {
  test('상속 20억 · 배우자 + 부모 2명 → 127,416,429 (표시값)', () => {
    const r = calcInheritanceTax({ totalAsset: 20 * EOK, priorGift: 0, funeral: 0, debt: 0, hasSpouse: true, childCount: 0, parentsAlive: 2 })
    assert.equal(r.funeralDeduction, 5_000_000)
    assert.equal(r.taxableValue, 1_995_000_000)
    assert.equal(r.spouseSole, false)
    assert.equal(r.appliedDeduction, 5 * EOK)
    near(r.spouseDeduction, 20 * EOK * 1.5 / 3.5)
    near(r.taxableBase, 637_857_142.857)
    assert.equal(r.appliedRate, 0.3)
    near(r.calculatedTax, 131_357_142.857)
    assert.equal(r.filingDiscount, 3_940_714)
    assert.equal(Math.round(r.finalTax), 127_416_429)
  })
  test('증여 10억 · 배우자 → 67,900,000', () => {
    const r = calcGiftTax(10 * EOK, '배우자', 0)
    assert.equal(r.taxableBase, 4 * EOK)
    assert.equal(r.appliedRate, 0.2)
    assert.equal(r.calculatedTax, 70_000_000)
    assert.equal(r.filingDiscount, 2_100_000)
    assert.equal(r.finalTax, 67_900_000)
  })
})

describe('누진세율 §26 경계', () => {
  test('구간 경계 산출세액', () => {
    const rows: [number, number][] = [
      [1 * EOK, 10_000_000],
      [5 * EOK, 90_000_000],
      [10 * EOK, 240_000_000],
      [30 * EOK, 1_040_000_000],
      [50 * EOK, 2_040_000_000],
    ]
    for (const [base, tax] of rows) near(inheritanceGiftTax(base), tax)
  })
  test('경계 +1원은 다음 구간 세율만큼 증가 (누진공제 연속성)', () => {
    for (let i = 0; i < INHERITANCE_GIFT_TAX_BRACKETS.length - 1; i++) {
      const b = INHERITANCE_GIFT_TAX_BRACKETS[i].max
      near(inheritanceGiftTax(b + 1) - inheritanceGiftTax(b), INHERITANCE_GIFT_TAX_BRACKETS[i + 1].rate, 1e-5)
    }
  })
  test('구간 조회: 경계 이하는 아래 구간, 0 이하는 0', () => {
    assert.deepEqual(inheritanceGiftBracket(1 * EOK), { rate: 0.1, deduction: 0 })
    assert.deepEqual(inheritanceGiftBracket(1 * EOK + 1), { rate: 0.2, deduction: 10_000_000 })
    assert.deepEqual(inheritanceGiftBracket(30 * EOK + 1), { rate: 0.5, deduction: 460_000_000 })
    assert.deepEqual(inheritanceGiftBracket(0), { rate: 0, deduction: 0 })
    assert.equal(inheritanceGiftTax(0), 0)
    assert.equal(inheritanceGiftTax(-1), 0)
  })
})

describe('증여재산공제 §53 · 할증 · 신고공제', () => {
  test('관계별 공제액', () => {
    assert.deepEqual(GIFT_DEDUCTION, {
      spouse: 600_000_000, adultDescendant: 50_000_000, minorDescendant: 20_000_000,
      ascendant: 50_000_000, otherRelative: 10_000_000, none: 0,
    })
    assert.equal(getDeduction('배우자'), 6 * EOK)
    assert.equal(getDeduction('미성년자녀'), 20_000_000)
    assert.equal(getDeduction('며느리사위'), 10_000_000)
    assert.equal(getDeduction('타인'), 0)
    assert.equal(GENERATION_SKIP_SURCHARGE_RATE, 0.3)
    assert.equal(FILING_CREDIT_RATE, 0.03)
  })
  test('공제 경계: 성인 자녀 5천만 이하 0원, 5천만+1원부터 과세', () => {
    assert.equal(calcGiftTax(50_000_000, '성인자녀', 0).finalTax, 0)
    assert.ok(calcGiftTax(50_000_010, '성인자녀', 0).calculatedTax > 0)
  })
  test('손자녀 1억 → 과표 5천만, 산출 500만 + 세대생략 30% 150만 − 신고공제 19.5만 = 6,305,000', () => {
    const r = calcGiftTax(1 * EOK, '손자녀', 0, true)
    assert.equal(r.surchargeAmount, 1_500_000)
    assert.equal(r.calculatedTax, 6_500_000)
    assert.equal(r.finalTax, 6_305_000)
  })
  test('10년 합산: 사전증여 5천만 + 이번 5천만(성인 자녀) → 과표 5천만분 세액만', () => {
    const r = calcGiftTax(50_000_000, '성인자녀', 50_000_000)
    assert.equal(r.calculatedTax, 5_000_000)
    assert.equal(r.finalTax, 4_850_000)
  })
})

describe('상속공제 헬퍼 경계', () => {
  test('장례비: 최소 500만 ~ 최대 1,500만', () => {
    assert.deepEqual([0, -1, 5_000_000, 12_000_000, 15_000_000, 20_000_000].map(funeralDeductionOf),
      [5_000_000, 5_000_000, 5_000_000, 12_000_000, 15_000_000, 15_000_000])
  })
  test('기초+자녀공제 vs 일괄 5억, 배우자 단독상속은 일괄 불가 (§21②)', () => {
    assert.equal(basicOrLumpSumDeduction(0, true), 2 * EOK)
    assert.equal(basicOrLumpSumDeduction(0, false), 5 * EOK)
    assert.equal(basicOrLumpSumDeduction(6, false), 5 * EOK)      // 2억 + 6 × 5천만 = 5억 (동률)
    assert.equal(basicOrLumpSumDeduction(7, false), 5.5 * EOK)
    assert.equal(basicOrLumpSumDeduction(7, true), 5.5 * EOK)
  })
  test('배우자 상속공제: 최소 5억 · 법정상속분 · 30억 한도', () => {
    assert.equal(spouseInheritanceDeduction(3 * EOK), 5 * EOK)
    assert.equal(spouseInheritanceDeduction(40 * EOK), 30 * EOK)
    assert.equal(spouseInheritanceDeduction(20 * EOK, 0), 5 * EOK)          // 상속포기여도 5억
    assert.equal(spouseInheritanceDeduction(20 * EOK, 10 * EOK), 10 * EOK)  // 실제 상속분
    assert.equal(spouseInheritanceDeduction(8 * EOK, 10 * EOK), 8 * EOK)    // 법정한도로 제한
  })
  test('금융재산공제 §22: 2천만 이하 전액 / 1억 이하 2천만 / 초과 20% (최대 2억)', () => {
    assert.deepEqual(
      [0, -5, 10_000_000, 20_000_000, 20_000_001, 1 * EOK, 1.5 * EOK, 10 * EOK, 20 * EOK].map(financialAssetDeduction),
      [0, 0, 10_000_000, 20_000_000, 20_000_000, 20_000_000, 30_000_000, 2 * EOK, 2 * EOK],
    )
  })
  test('동거주택공제 §23의2: 100%, 최대 6억', () => {
    assert.deepEqual([0, 3 * EOK, 6 * EOK, 7 * EOK].map(cohabitHomeDeduction), [0, 3 * EOK, 6 * EOK, 6 * EOK])
  })
  test('배우자 법정상속분: 자녀 2 → 1.5/3.5, 자녀 없고 부모 1 → 1.5/2.5, 단독 1', () => {
    near(getSpouseLegalShare(2, 0), 1.5 / 3.5, 1e-12)
    near(getSpouseLegalShare(0, 1), 1.5 / 2.5, 1e-12)
    assert.equal(getSpouseLegalShare(0, 0), 1)
  })
  test('배우자 단독상속 20억: 기초공제 2억 + 배우자공제 20억 → 과표 0', () => {
    const r = calcInheritanceTax({ totalAsset: 20 * EOK, priorGift: 0, funeral: 0, debt: 0, hasSpouse: true, childCount: 0, parentsAlive: 0 })
    assert.equal(r.spouseSole, true)
    assert.equal(r.appliedDeduction, 2 * EOK)
    assert.equal(r.spouseDeduction, 20 * EOK)
    assert.equal(r.finalTax, 0)
  })
  test('자녀가 있으면 부모 입력은 무시 (배우자 + 자녀 2 · 부모 2 = 배우자 + 자녀 2)', () => {
    const base = { totalAsset: 30 * EOK, priorGift: 0, funeral: 10_000_000, debt: 2 * EOK, hasSpouse: true, childCount: 2 }
    assert.deepEqual(calcInheritanceTax({ ...base, parentsAlive: 2 }), calcInheritanceTax({ ...base, parentsAlive: 0 }))
  })
})
