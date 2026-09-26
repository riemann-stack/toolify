/* 골든 테스트 — 주택 보유세: 재산세 + 종합부동산세 (lib/krPropertyTax.ts, 2026)
   기대값은 법정 산식 손계산값 (도시지역분 포함, 고령·장기보유 공제 없음이 기본).
   · 재산세 과표 = 공시가격 × 공정시장가액비율(1세대1주택 43/44/45%, 그 외 60%) — 지방세법 시행령 §109
   · 재산세 표준세율 §111①3호: 6천만↓ 0.1% / 1.5억↓ 6만+0.15% / 3억↓ 19.5만+0.25% / 초과 57만+0.4%
     1세대1주택 특례세율 §111의2 (공시 9억 이하): 0.05% / 3만+0.1% / 12만+0.2% / 42만+0.35%
   · 도시지역분 과표 × 0.14%, 지방교육세 본세 × 20%
   · 종부세 과표 = (공시 합계 − 9억, 1세대1주택 12억) × 60%. 세율 종부세법 §9 (2주택↓ 0.5~2.7%, 3주택↑ 12억 초과분 2~5%)
   · 재산세 중복분 공제 (종부세법 시행령 §4의3①)
       = 부과된 재산세 × (종부세 과표 × 재산세 공정시장가액비율 × 0.4%) ÷ 표준세율 재산세 상당액
   · 농어촌특별세 = 종부세 결정세액 × 20%

   [손계산]
   2주택 합산 15억: 재산세 과표 9억 → 57만 + 6억×0.4% = 2,970,000 / 도시 1,260,000 / 교육 594,000
                    종부세 과표 3.6억 → 150만 + 0.6억×0.7% = 1,920,000
                    중복분 = 3.6억 × 60% × 0.4% = 864,000 → 결정 1,056,000 + 농특 211,200 = 1,267,200
   1주택 20억:      재산세 과표 20억×45% = 9억 (공시 9억 초과 → 표준세율) 2,970,000
                    종부세 과표 (20−12)억×60% = 4.8억 → 150만 + 1.8억×0.7% = 2,760,000
                    중복분 = 4.8억 × 45% × 0.4% = 864,000 → 결정 1,896,000 + 농특 379,200 = 2,275,200
                    ※ 분자 비율을 1주택 특례 45%로 보는 해석. 시행령이 가리키는 비율이 일반 60%라면 1,929,600
                      (finance-2 followup R5 — law.go.kr 원문 미확인. 확인 후 이 값을 함께 고칠 것)
   주택별 [7.5억, 7.5억]: 주택마다 과표 4.5억 → 57만 + 1.5억×0.4% = 1,170,000 / 도시 630,000 / 교육 234,000
                    = 2,034,000 × 2 = 4,068,000. 종부세는 합산 15억과 같음(분모 2,340,000 = 부과 재산세 → 864,000) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcHoldingTax, calcPropertyTax, calcCompTax, propertyFmvRatio, compElderRate, compLongHoldRate,
  type HoldingTaxInput,
} from '../../lib/krPropertyTax'

const EOK = 100_000_000
const holding = (o: Partial<HoldingTaxInput>) =>
  calcHoldingTax({ publicPrice: 0, houses: 1, oneHouse: true, urbanArea: true, holdYears: 0, age: 0, ...o })

describe('calcHoldingTax — followup 골든값', () => {
  test('2주택 합산 15억 → 종부세 1,267,200 (중복분 864,000)', () => {
    const r = holding({ publicPrice: 15 * EOK, houses: 2, oneHouse: false })
    assert.deepEqual(
      [r.property.taxBase, r.property.baseTax, r.property.urbanTax, r.property.eduTax, r.property.total],
      [9 * EOK, 2_970_000, 1_260_000, 594_000, 4_824_000],
    )
    assert.equal(r.comp.taxBase, 3.6 * EOK)
    assert.equal(r.comp.computedTax, 1_920_000)
    assert.equal(r.comp.propOverlap, 864_000)
    assert.equal(r.comp.decidedTax, 1_056_000)
    assert.equal(r.comp.ruralTax, 211_200)
    assert.equal(r.comp.total, 1_267_200)
    assert.equal(r.total, 6_091_200)
    assert.deepEqual(r.perHouse, [])      // 단일 입력이면 주택별 내역 없음
  })
  test('1주택 20억 → 종부세 2,275,200 (특례비율 45% 해석)', () => {
    const r = holding({ publicPrice: 20 * EOK })
    assert.equal(r.property.fmvRatio, 0.45)
    assert.equal(r.property.specialRate, false)   // 공시 9억 초과 → 특례세율 없음
    assert.equal(r.property.baseTax, 2_970_000)
    assert.equal(r.comp.deduction, 12 * EOK)
    assert.equal(r.comp.computedTax, 2_760_000)
    assert.equal(r.comp.propOverlap, 864_000)
    assert.equal(r.comp.total, 2_275_200)
  })
  test('주택별 공시가격 [7.5억, 7.5억] → 재산세 합계 4,068,000, 종부세 1,267,200', () => {
    const r = holding({ publicPrices: [7.5 * EOK, 7.5 * EOK], houses: 2, oneHouse: false })
    assert.deepEqual(r.perHouse.map(p => p.total), [2_034_000, 2_034_000])
    assert.equal(r.property.baseTax, 2_340_000)
    assert.equal(r.property.total, 4_068_000)
    assert.equal(r.comp.propOverlap, 864_000)
    assert.equal(r.comp.total, 1_267_200)
    assert.equal(r.total, 5_335_200)
  })
  test('publicPrices의 0·음수·NaN 항목은 무시하고 publicPrice는 합계로 대체', () => {
    const a = holding({ publicPrice: 1, publicPrices: [7.5 * EOK, 0, -1, NaN, 7.5 * EOK], houses: 2, oneHouse: false })
    const b = holding({ publicPrices: [7.5 * EOK, 7.5 * EOK], houses: 2, oneHouse: false })
    assert.deepEqual(a, b)
  })
})

describe('재산세 경계', () => {
  test('1세대1주택 공정시장가액비율 3억/6억 경계 · 다주택 60%', () => {
    assert.equal(propertyFmvRatio(3 * EOK, true), 0.43)
    assert.equal(propertyFmvRatio(3 * EOK + 1, true), 0.44)
    assert.equal(propertyFmvRatio(6 * EOK, true), 0.44)
    assert.equal(propertyFmvRatio(6 * EOK + 1, true), 0.45)
    assert.equal(propertyFmvRatio(3 * EOK, false), 0.6)
  })
  test('특례세율은 공시 9억 이하만: 9억 787,500 / 9억+1원 990,000', () => {
    const at = calcPropertyTax(9 * EOK, true, true)
    assert.equal(at.specialRate, true)
    assert.equal(at.taxBase, 405_000_000)
    assert.equal(at.baseTax, 787_500)     // 42만 + 1.05억 × 0.35%
    const over = calcPropertyTax(9 * EOK + 1, true, true)
    assert.equal(over.specialRate, false)
    assert.equal(over.baseTax, 990_000)   // 57만 + 1.05억 × 0.4%
  })
  test('1주택 3억: 과표 1.29억 → 특례 99,000 · 도시 180,600 · 교육 19,800', () => {
    const r = calcPropertyTax(3 * EOK, true, true)
    assert.deepEqual([r.taxBase, r.baseTax, r.urbanTax, r.eduTax, r.total], [129_000_000, 99_000, 180_600, 19_800, 299_400])
  })
  test('도시지역 아님 → 도시지역분 0 · 0원 → 0', () => {
    assert.equal(calcPropertyTax(15 * EOK, false, false).urbanTax, 0)
    assert.equal(calcPropertyTax(0, true, true).total, 0)
  })
})

describe('종부세 경계', () => {
  test('기본공제 경계: 1주택 12억·2주택 9억은 비과세', () => {
    assert.equal(holding({ publicPrice: 12 * EOK }).comp.taxable, false)
    assert.equal(holding({ publicPrice: 9 * EOK, houses: 2, oneHouse: false }).comp.taxable, false)
    assert.equal(holding({ publicPrice: 12 * EOK + 10 }).comp.taxable, true)
  })
  test('oneHouse=true라도 2주택이면 1주택 혜택(12억 공제·세액공제) 없음', () => {
    const r = holding({ publicPrice: 15 * EOK, houses: 2, oneHouse: true, age: 70, holdYears: 15 })
    assert.equal(r.comp.deduction, 9 * EOK)
    assert.equal(r.comp.creditRate, 0)
    assert.equal(r.comp.total, 1_267_200)
  })
  test('3주택 합산 30억: 중과세율 — 과표 12.6억 → 960만 + 0.6억×2% = 10,800,000, 중복분 3,024,000', () => {
    const r = holding({ publicPrice: 30 * EOK, houses: 3, oneHouse: false })
    assert.equal(r.comp.taxBase, 1_260_000_000)
    assert.equal(r.comp.computedTax, 10_800_000)
    assert.equal(r.comp.propOverlap, 3_024_000)
    assert.equal(r.comp.total, 9_331_200)
  })
  test('일반세율 누적 base 연속성 (12억·25억·50억·94억 경계)', () => {
    // 2주택 이하: 12억 960만 / 25억 2,650만 / 50억 6,400만 / 94억 1억5,200만
    const g = (base: number) => calcCompTax(base / 0.6 + 9 * EOK, 2, false, 0, 0, 1).computedTax
    assert.equal(g(12 * EOK), 9_600_000)
    assert.equal(g(25 * EOK), 26_500_000)
    assert.equal(g(50 * EOK), 64_000_000)
    assert.equal(g(94 * EOK), 152_000_000)
    // 3주택 이상: 25억 3,560만 / 50억 1억1,060만 / 94억 2억8,660만
    const h = (base: number) => calcCompTax(base / 0.6 + 9 * EOK, 3, false, 0, 0, 1).computedTax
    assert.equal(h(12 * EOK), 9_600_000)
    assert.equal(h(25 * EOK), 35_600_000)
    assert.equal(h(50 * EOK), 110_600_000)
    assert.equal(h(94 * EOK), 286_600_000)
  })
  test('고령자·장기보유 세액공제율 경계, 합산 상한 80%', () => {
    assert.deepEqual([59, 60, 64, 65, 69, 70].map(compElderRate), [0, 0.2, 0.2, 0.3, 0.3, 0.4])
    assert.deepEqual([4, 5, 9, 10, 14, 15].map(compLongHoldRate), [0, 0.2, 0.2, 0.4, 0.4, 0.5])
    const r = holding({ publicPrice: 20 * EOK, age: 70, holdYears: 15 })
    assert.equal(r.comp.creditRate, 0.8)
    assert.equal(r.comp.decidedTax, 379_200)   // (2,760,000 − 864,000) × 20%
    assert.equal(r.comp.total, 455_040)
  })
})
