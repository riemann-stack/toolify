/* 골든 테스트 — 주택담보대출 규제 (lib/krLoanRules.ts + finance/auction 래퍼), 금액 단위 만원
   근거: 10·15 주택시장 안정화 대책(2025.10.16 시행) — 규제지역 LTV 무주택 40%·유주택 0%(생애최초 70%),
         수도권·규제지역 주담대 상한 시가 15억↓ 6억 / 25억↓ 4억 / 초과 2억, 스트레스 금리 하한 3%p.
         비규제지역 LTV 70% (다주택·주택임대·매매사업자 60%). 은행권 DSR 40%.
   [손계산 — calcLoan] 낙찰가 5억(50,000만) · LTV 70% · 연 4% · 30년 · 연소득 6,000만 · 기존 상환 0
     LTV 한도 35,000만 / DSR: 월 200만(6,000 × 0.4 ÷ 12) 상환 가능 → 4%·360개월 역산 ≈ 41,892.3만 → LTV가 한도 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import * as rules from '../../lib/krLoanRules'
import * as auction from '../../app/tools/finance/auction/auctionUtils'

describe('규제 수치', () => {
  test('LTV·스트레스·DSR 상수', () => {
    assert.deepEqual(
      [rules.LTV_NON_REGULATED, rules.LTV_NON_REGULATED_MULTI, rules.LTV_REGULATED_NO_HOME, rules.LTV_REGULATED_HAS_HOME, rules.LTV_REGULATED_FIRST_TIME],
      [70, 60, 40, 0, 70],
    )
    assert.deepEqual([rules.STRESS_RATE_REGULATED, rules.STRESS_RATE_DEFAULT], [3.0, 1.5])
    assert.equal(rules.DSR_LIMIT_RATIO, 0.4)
  })
  test('auction 재수출 = lib 값', () => {
    for (const k of ['LTV_NON_REGULATED', 'LTV_NON_REGULATED_MULTI', 'LTV_REGULATED_NO_HOME', 'LTV_REGULATED_HAS_HOME', 'STRESS_RATE_REGULATED', 'STRESS_RATE_DEFAULT'] as const) {
      assert.equal(auction[k], rules[k], k)
    }
  })
})

describe('recommendLtv', () => {
  test('비규제: 무주택·1주택 70 / 2주택↑·사업자 60', () => {
    const f = (homesOwned: number, business = false) => rules.recommendLtv({ regulated: false, homesOwned, business })
    assert.deepEqual([f(0), f(1), f(2), f(3), f(0, true)], [70, 70, 60, 60, 60])
  })
  test('규제: 무주택 40 / 유주택·사업자 0', () => {
    const f = (homesOwned: number, business = false) => rules.recommendLtv({ regulated: true, homesOwned, business })
    assert.deepEqual([f(0), f(1), f(2), f(0, true)], [40, 0, 0, 0])
  })
  test('auction 지역·명의 래퍼', () => {
    assert.deepEqual((['live1', 'own1', 'multi2', 'multi3', 'corp'] as const).map(o => auction.recommendLtv('normal', o)), [70, 70, 60, 60, 60])
    for (const region of ['adjusted', 'speculative'] as const) {
      assert.deepEqual((['live1', 'own1', 'multi2', 'multi3', 'corp'] as const).map(o => auction.recommendLtv(region, o)), [40, 0, 0, 0, 0], region)
    }
  })
})

describe('스트레스 금리·주담대 상한', () => {
  test('recommendStressRate', () => {
    assert.equal(rules.recommendStressRate(true), 3)
    assert.equal(rules.recommendStressRate(false), 1.5)
    assert.equal(auction.recommendStressRate('normal'), 1.5)
    assert.equal(auction.recommendStressRate('adjusted'), 3)
  })
  test('금액 상한 경계: 15억 6억 / 15억+ 4억 / 25억 4억 / 25억+ 2억', () => {
    assert.deepEqual([0, 150_000, 150_000.01, 250_000, 250_000.01, 1e9].map(rules.mortgagePriceCapMan), [60_000, 60_000, 40_000, 40_000, 20_000, 20_000])
    assert.equal(rules.mortgagePriceCapMan(NaN), 20_000)
  })
  test('비규제지역은 상한 없음', () => {
    assert.equal(rules.mortgageCapMan(300_000, false), Infinity)
    assert.equal(rules.mortgageCapMan(300_000, true), 20_000)
    assert.equal(auction.mortgageCapMan(300_000, 'normal'), Infinity)
    assert.equal(auction.mortgageCapMan(160_000, 'speculative'), 40_000)
  })
})

describe('auction calcLoan — DSR 40%', () => {
  test('LTV가 한도인 경우', () => {
    const r = auction.calcLoan(50_000, 55_000, 70, 4, 30, 6_000, 0)
    assert.equal(r.ltvLimit, 35_000)
    assert.ok(Math.abs(r.dsrLimit - 41_892.3) < 0.1, String(r.dsrLimit))
    assert.equal(r.loanAmount, 35_000)
    assert.equal(r.capacityType, 'ltv')
    assert.equal(r.ownEquity, 20_000)
  })
  test('DSR 월 상환 가능액 = 연소득 × 40% ÷ 12 − 기존 상환 (금리 0이면 × 개월 수)', () => {
    const r = auction.calcLoan(100_000, 100_000, 70, 0, 10, 6_000, 50)
    assert.equal(r.dsrLimit, (6_000 * 0.4 / 12 - 50) * 120)   // 150 × 120 = 18,000
    assert.equal(r.capacityType, 'dsr')
  })
  test('규제지역 상한이 가장 작으면 cap', () => {
    const r = auction.calcLoan(200_000, 200_000, 40, 4, 30, 50_000, 0, auction.mortgageCapMan(200_000, 'adjusted'))
    assert.equal(r.loanAmount, 40_000)
    assert.equal(r.capacityType, 'cap')
  })
  test('스트레스 금리는 DSR 역산만 낮춘다 (월 상환은 원래 금리)', () => {
    const base = auction.calcLoan(100_000, 100_000, 70, 4, 30, 6_000, 0)
    const stress = auction.calcLoan(100_000, 100_000, 70, 4, 30, 6_000, 0, Infinity, 3)
    assert.ok(stress.dsrLimit < base.dsrLimit)
    assert.ok(Math.abs(stress.monthlyPayment - auction.monthlyPayment(stress.loanAmount, 4, 30)) < 1e-9)
  })
})
