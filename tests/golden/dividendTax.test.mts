/* 골든 테스트 — 월배당 도구의 배당소득 일반과세(15.4%)·종합과세 기준이 lib/krFinancialIncomeTax 단일 소스와 일치하는지
   (하드코딩 0.154 → lib 상수 치환 후에도 결과가 같아야 한다). 기대값은 손계산. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { GENERAL_DIVIDEND_TAX_RATE, COMPREHENSIVE_TAX_THRESHOLD as LIB_THRESHOLD } from '../../lib/krFinancialIncomeTax'
import {
  TAX_ACCOUNTS, COMPREHENSIVE_TAX_THRESHOLD, compareTaxAccounts, requiredPrincipal, evaluateComprehensiveTax,
  GEN_PCT, WH_PCT, LOCAL_PCT, THRESHOLD_MAN, BOTTOM_BRACKET_PCT, TOP_BRACKET_PCT, PROGRESSIVE_BRACKETS,
} from '../../app/tools/finance/dividend/dividendUtils'

const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)

describe('배당 일반과세 — lib 단일 소스', () => {
  test('일반 계좌 세율 = 0.154 (14% + 지방 1.4%), 설명 문구 보간', () => {
    const g = TAX_ACCOUNTS.find(a => a.id === 'general')!
    assert.equal(g.taxRate, 0.154)
    assert.equal(g.taxRate, GENERAL_DIVIDEND_TAX_RATE)
    assert.equal(g.desc, '배당소득세 15.4% (소득세 14% + 지방소득세 1.4%)')
  })
  test('종합과세 기준 2,000만원 = lib', () => {
    assert.equal(COMPREHENSIVE_TAX_THRESHOLD, 20_000_000)
    assert.equal(COMPREHENSIVE_TAX_THRESHOLD, LIB_THRESHOLD)
  })
})

describe('compareTaxAccounts — 연 배당 1,000만원·10년·연 적립 600만·총급여 5,000만·배당률 4%', () => {
  const rows = compareTaxAccounts({ annualDividend: 10_000_000, years: 10, annualContribution: 6_000_000, totalIncome: 50_000_000, dividendYield: 4 })
  const by = (id: string) => rows.find(r => r.account.id === id)!
  test('일반: 10,000,000 × 0.154 = 1,540,000 / 10년 15,400,000', () => {
    assert.equal(by('general').annualTax, 1_540_000)
    assert.equal(by('general').totalTax, 15_400_000)
    assert.equal(by('general').netBenefit, 0)
  })
  test('ISA 서민형: 한도 1억 × 4% = 400만 담김(비과세 400만) · 초과 600만 × 0.154 = 924,000', () => {
    assert.equal(by('isa-saving').overLimitDividend, 6_000_000)
    assert.equal(by('isa-saving').annualTax, 924_000)
    // 순이익 = (15,400,000 − 9,240,000) = 6,160,000
    assert.equal(by('isa-saving').netBenefit, 6_160_000)
  })
  test('ISA 일반형: (400만 − 200만) × 0.099 = 198,000 + 924,000 = 1,122,000', () => {
    assert.equal(by('isa-general').annualTax, 1_122_000)
  })
  test('연금저축: 10,000,000 × 0.055 = 550,000 · 세액공제 600만 × 16.5% = 990,000', () => {
    assert.equal(by('pension-saving').annualTax, 550_000)
    assert.equal(by('pension-saving').taxCreditAnnual, 990_000)
  })
})

describe('requiredPrincipal·종합과세 평가', () => {
  test('월 100만 목표·배당 4.5%·세율 15.4%: 12,000,000 ÷ (0.045 × 0.846) = 315,208,826.1…', () => {
    near(requiredPrincipal(1_000_000, 4.5, 15.4, 100), 12_000_000 / (0.045 * 0.846))
  })
  test('금융소득 1,900만 → 95% → 한도 임박(near) · 2,000만 → 100% → over', () => {
    assert.equal(evaluateComprehensiveTax(15_000_000, 3_000_000, 1_000_000).level, 'near')
    assert.equal(evaluateComprehensiveTax(20_000_000, 0, 0).level, 'over')
    assert.equal(evaluateComprehensiveTax(19_999_999, 0, 0).level, 'near')
  })
})

describe('화면 문구 보간값 — lib에서 파생 (하드코딩 문구와 바이트 동일)', () => {
  test('15.4 = 14 + 1.4, 종합과세 기준 표기 \'2,000만\'', () => {
    assert.equal(GEN_PCT, 15.4)
    assert.equal(WH_PCT, 14)
    assert.equal(LOCAL_PCT, 1.4)
    assert.equal(THRESHOLD_MAN, '2,000만')
  })
  test('누진세율 양 끝(지방세 포함): 6% × 1.1 = 6.6 · 45% × 1.1 = 49.5', () => {
    assert.equal(BOTTOM_BRACKET_PCT, 6.6)
    assert.equal(TOP_BRACKET_PCT, 49.5)
  })
  test('종합과세 예시 프리셋: 과표 5,000만~8,800만 구간 24% × 1.1 = 26.4% (구 24.2%는 22% × 1.1로 2026 세율표에 없음)', () => {
    assert.equal(PROGRESSIVE_BRACKETS[2].min, 50_000_000)
    assert.equal(PROGRESSIVE_BRACKETS[2].max, 88_000_000)
    assert.equal(PROGRESSIVE_BRACKETS[2].rate, 0.264)
  })
  test('일반 계좌 단점 문구: \'연 2,000만↑ 종합과세 (최대 49.5%)\'', () => {
    assert.equal(TAX_ACCOUNTS.find(a => a.id === 'general')!.cons, '연 2,000만↑ 종합과세 (최대 49.5%)')
  })
})
