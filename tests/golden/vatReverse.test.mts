/* 골든 테스트 — 부가세 역산(합계 → 공급가액·부가세) 반올림 (finance/vat calcVAT)
   규칙: 부가세 = 합계 × 10/110 (절사 단위 선택 시 부가세를 그 단위로 절사), 공급가액 = 합계 − 부가세.
         절사 없음('none')은 공급가액 = round(합계 ÷ 1.1).
   [손계산] 12,345원: ÷1.1 = 11,222.72… → 공급 11,223 · 부가세 1,122
            10원 절사: 부가세 1,122.27… → 1,120 · 공급 11,225 / 100원 절사: 1,100 · 11,245
   부동소수 함정: 1,100,000 × 0.1 ÷ 1.1 = 99,999.99999999999 → 절사하면 99,990이 되면 안 됨(100,000) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calcVAT, type RoundUnit } from '../../app/tools/finance/vat/vatUtils'

const remove = (amount: number, rounding: RoundUnit, rate = 0.1) => calcVAT({ amount, mode: 'remove', rate, rounding })
const add = (amount: number, rounding: RoundUnit) => calcVAT({ amount, mode: 'add', rate: 0.1, rounding })
const triple = (r: { supplyAmount: number; vat: number; total: number }) => [r.supplyAmount, r.vat, r.total]

describe('역산(remove) 반올림', () => {
  test('12,345원: none / 10원 / 100원 절사', () => {
    assert.deepEqual(triple(remove(12_345, 'none')), [11_223, 1_122, 12_345])
    assert.deepEqual(triple(remove(12_345, '10')), [11_225, 1_120, 12_345])
    assert.deepEqual(triple(remove(12_345, '100')), [11_245, 1_100, 12_345])
  })
  test('딱 떨어지는 금액은 부동소수 오차 없이 정확', () => {
    assert.deepEqual(triple(remove(110_000, 'none')), [100_000, 10_000, 110_000])
    assert.deepEqual(triple(remove(110_000, '10')), [100_000, 10_000, 110_000])
    assert.deepEqual(triple(remove(1_100_000, '10')), [1_000_000, 100_000, 1_100_000])
    assert.deepEqual(triple(remove(1_100_000, '1000')), [1_000_000, 100_000, 1_100_000])
  })
  test('작은 금액·절사 단위보다 작은 부가세', () => {
    assert.deepEqual(triple(remove(11, 'none')), [10, 1, 11])
    assert.deepEqual(triple(remove(1_000, '1000')), [1_000, 0, 1_000])
  })
  test('면세(세율 0)는 부가세 0 · 금액 0 이하는 0', () => {
    assert.deepEqual(triple(remove(12_345, '10', 0)), [12_345, 0, 12_345])
    assert.deepEqual(triple(remove(0, 'none')), [0, 0, 0])
    assert.deepEqual(triple(remove(-100, '10')), [0, 0, 0])
  })
  test('불변식: 공급가액 + 부가세 = 합계, 절사 시 부가세는 단위의 배수 (10원 단위 합계 20만 건)', () => {
    for (let s = 10; s <= 2_000_000; s += 10) {
      const total = s + s / 10
      const r = remove(total, '10')
      assert.equal(r.supplyAmount + r.vat, total)
      assert.equal(r.vat % 10, 0)
    }
  })
})

describe('가산(add)과 왕복', () => {
  test('12,345원 + 부가세: none 1,235(반올림) / 10원 절사 1,230', () => {
    assert.deepEqual(triple(add(12_345, 'none')), [12_345, 1_235, 13_580])
    assert.deepEqual(triple(add(12_345, '10')), [12_345, 1_230, 13_575])
  })
  test('절사 없음: 가산 후 역산하면 원래 공급가액 (1~20만원 전수)', () => {
    for (let s = 1; s <= 200_000; s++) {
      assert.equal(remove(add(s, 'none').total, 'none').supplyAmount, s)
    }
  })
})
