/* 골든 테스트 — 종합소득세 누진세율 (lib/krIncomeTax.ts, 소득세법 §55)
   구간 경계 산출세액(손계산): 1,400만 84만 / 5,000만 624만 / 8,800만 1,536만 / 1.5억 3,706만 /
   3억 9,406만 / 5억 1억7,406만 / 10억 3억8,406만 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { progressiveTax, marginalRate, BRACKETS_2026 } from '../../lib/krIncomeTax'

const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)

describe('progressiveTax 구간 경계', () => {
  const rows: [number, number][] = [
    [14_000_000, 840_000],
    [50_000_000, 6_240_000],
    [88_000_000, 15_360_000],
    [150_000_000, 37_060_000],
    [300_000_000, 94_060_000],
    [500_000_000, 174_060_000],
    [1_000_000_000, 384_060_000],
    [2_000_000_000, 834_060_000],
  ]
  for (const [base, tax] of rows) {
    test(`${base.toLocaleString()} → ${tax.toLocaleString()}`, () => near(progressiveTax(base), tax))
  }
  test('경계 +1원은 다음 구간 한계세율만큼 증가 (누진공제 연속성)', () => {
    for (let i = 0; i < BRACKETS_2026.length - 1; i++) {
      const b = BRACKETS_2026[i].upTo
      near(progressiveTax(b + 1) - progressiveTax(b), BRACKETS_2026[i + 1].rate, 1e-6)
    }
  })
  test('0·음수 → 0', () => {
    assert.equal(progressiveTax(0), 0)
    assert.equal(progressiveTax(-5_000_000), 0)
  })
})

describe('marginalRate', () => {
  test('경계 포함(이하) 규칙', () => {
    assert.equal(marginalRate(14_000_000), 0.06)
    assert.equal(marginalRate(14_000_001), 0.15)
    assert.equal(marginalRate(88_000_000), 0.24)
    assert.equal(marginalRate(88_000_001), 0.35)
    assert.equal(marginalRate(5_000_000_000), 0.45)
  })
  test('지방소득세 포함 (×1.1, 소수 4자리)', () => {
    assert.equal(marginalRate(30_000_000, { localTax: true }), 0.165)
    assert.equal(marginalRate(100_000_000, { localTax: true }), 0.385)
    assert.equal(marginalRate(2_000_000_000, { localTax: true }), 0.495)
  })
})
