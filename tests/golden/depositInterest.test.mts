/* 골든 테스트 — 예·적금 이자 (app/tools/finance/deposit-interest) + 금융소득 원천징수 lib (lib/krFinancialIncomeTax.ts)
   근거: 소득세법 §129①1호(이자 14%) · 지방세법 §103의13(소득세의 10%) · 국고금 관리법 §47①(10원 미만 절사)
        소득세법 §86(소액부징수 — 이자소득 제외) · 농어촌특별세법 §5①(감면세액의 10%) · 조세특례제한법 §88의2·§89의3
   모든 기대값은 아래 주석의 손계산(법정 공식)으로 구했다. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  INTEREST_WITHHOLDING_RATE, DIVIDEND_WITHHOLDING_RATE, LOCAL_INCOME_TAX_RATIO,
  GENERAL_FIN_TAX_RATE, GENERAL_FIN_TAX_PCT, GENERAL_DIVIDEND_TAX_RATE, WITHHOLDING_PCT, LOCAL_TAX_PCT,
  COMPREHENSIVE_TAX_THRESHOLD, COOP_DEPOSIT, COOP_REDUCED_RATES, TAX_FREE_SAVINGS,
  withholdInterestTax, withholdCoopDepositTax, coopDepositTotalRate, taxFloor10, floor10, coopDepositRate, coopExemptLastJoinYear,
  ratePct, finTaxTypePct,
} from '../../lib/krFinancialIncomeTax'
import {
  calcDeposit, accruedInterest, depositEquivalentOfSavings, savingsRateForSameInterest, normalizeInput,
  commaInput, decimalInput, parseMoney, manwon, type DepositInput,
} from '../../app/tools/finance/deposit-interest/depositInterestUtils'

const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)

describe('lib 상수 — 법정 세율', () => {
  test('이자·배당 원천징수 14%, 지방소득세 = 소득세의 10%', () => {
    assert.equal(INTEREST_WITHHOLDING_RATE, 0.14)
    assert.equal(DIVIDEND_WITHHOLDING_RATE, 0.14)
    assert.equal(LOCAL_INCOME_TAX_RATIO, 0.1)
  })
  test('합계세율 0.14 × 1.1 = 0.154 가 부동소수 꼬리 없이 정확히 0.154 (배당 도구 결과 불변 조건)', () => {
    assert.equal(GENERAL_FIN_TAX_RATE, 0.154)
    assert.equal(GENERAL_DIVIDEND_TAX_RATE, 0.154)
    assert.equal(GENERAL_FIN_TAX_PCT, 15.4)
    assert.equal(WITHHOLDING_PCT, 14)
    assert.equal(LOCAL_TAX_PCT, 1.4)
  })
  test('금융소득종합과세 기준 2,000만원 (소득세법 §14③6호)', () => assert.equal(COMPREHENSIVE_TAX_THRESHOLD, 20_000_000))
  test('조합 예탁금: 한도 3,000만원, 비과세 시 농특세 14% × 10% = 1.4%', () => {
    assert.equal(COOP_DEPOSIT.limitPerPerson, 30_000_000)
    assert.equal(COOP_DEPOSIT.exemptRuralTaxRate, 0.014)
    assert.equal(ratePct(COOP_DEPOSIT.exemptRuralTaxRate), 1.4)
    assert.equal(COOP_DEPOSIT.incomeTest.totalSalary, 70_000_000)
    assert.equal(COOP_DEPOSIT.incomeTest.comprehensiveIncome, 60_000_000)
    assert.equal(COOP_DEPOSIT.reducedHasLocalTax, false)
  })
  test('비과세종합저축: 한도 5,000만원, 가입 기한 2028-12-31', () => {
    assert.equal(TAX_FREE_SAVINGS.limitPerPerson, 50_000_000)
    assert.deepEqual(TAX_FREE_SAVINGS.joinUntil, { y: 2028, m: 12, d: 31 })
  })
  test('표기용 세율', () => {
    assert.equal(finTaxTypePct('general'), 15.4)
    assert.equal(finTaxTypePct('coopExempt'), 1.4)
    assert.equal(finTaxTypePct('taxFree'), 0)
    assert.equal(finTaxTypePct('custom', 5.9), 5.9)
  })
})

describe('조합 예탁금 가입 연도별 세율 (조특법 §89의3, 2025.12.23 개정 — 가입일 기준)', () => {
  // §89의3① '가입 당시 19세 이상', 1명당 3천만원 · §88의5②1호가목·시행령 §82의5② 농협·수협·산림조합 조합원
  test('가입 요건·소득 기준 라벨이 lib 숫자에서 생성', () => {
    assert.equal(COOP_DEPOSIT.minAge, 19)
    assert.equal(COOP_DEPOSIT.memberUnions, '농협·수협·산림조합')
    const std = COOP_DEPOSIT.groups.find(g => g.id === 'standard')!
    assert.equal(std.label, '농협·수협·산림조합 조합원 또는 직전 과세기간 총급여 7,000만원(종합소득금액 6,000만원) 이하')
    assert.deepEqual(COOP_REDUCED_RATES, [0.05, 0.09])
  })
  // standard(농어민·총급여 7천 이하): ~2028 비과세 / 2029 5% / 2030~ 9%
  test('standard 그룹 경계', () => {
    assert.equal(coopDepositRate('standard', 2025), 0)
    assert.equal(coopDepositRate('standard', 2028), 0)      // 비과세 마지막 해
    assert.equal(coopDepositRate('standard', 2029), 0.05)   // +1년
    assert.equal(coopDepositRate('standard', 2030), 0.09)
    assert.equal(coopDepositRate('standard', 2040), 0.09)
    assert.equal(coopExemptLastJoinYear('standard'), 2028)
  })
  // highIncome(총급여 7천 초과, 농어민 제외): ~2025 비과세 / 2026 5% / 2027~ 9%
  test('highIncome 그룹 경계', () => {
    assert.equal(coopDepositRate('highIncome', 2025), 0)
    assert.equal(coopDepositRate('highIncome', 2026), 0.05)
    assert.equal(coopDepositRate('highIncome', 2027), 0.09)
    assert.equal(coopExemptLastJoinYear('highIncome'), 2025)
  })
})

describe('조합 예탁금 합계세율 — 소득세 + 농어촌특별세 (농특세법 §2①2호·§5①2호·④)', () => {
  // 농특세 = (이자 × 14% − 납부 소득세) × 10% → 합계 = r + (0.14 − r) × 0.1
  test('비과세 0 → 0 + 0.14 × 0.1 = 0.014 (= exemptRuralTaxRate)', () => {
    assert.equal(coopDepositTotalRate(0), 0.014)
    assert.equal(coopDepositTotalRate(0), COOP_DEPOSIT.exemptRuralTaxRate)
  })
  test('5% → 0.05 + 0.09 × 0.1 = 0.059 · 9% → 0.09 + 0.05 × 0.1 = 0.095', () => {
    assert.equal(coopDepositTotalRate(0.05), 0.059)
    assert.equal(coopDepositTotalRate(0.09), 0.095)
    assert.equal(ratePct(coopDepositTotalRate(0.05)), 5.9)
    assert.equal(ratePct(coopDepositTotalRate(0.09)), 9.5)
  })
  test('농어민 등 농특세 면제(시행령 §4⑦3호) → 소득세만: 0 / 0.05 / 0.09', () => {
    assert.equal(coopDepositTotalRate(0, true), 0)
    assert.equal(coopDepositTotalRate(0.05, true), 0.05)
    assert.equal(coopDepositTotalRate(0.09, true), 0.09)
  })
  test('상한: 14% 이상이면 농특세 0 (감면 없음) · 음수는 0으로', () => {
    assert.equal(coopDepositTotalRate(0.14), 0.14)
    assert.equal(coopDepositTotalRate(0.2), 0.14)
    assert.equal(coopDepositTotalRate(-1), 0.014)
  })
  test('이자 162,500원 · 5% 가입분: 소득세 8,125→8,120 · 농특세 162,500 × 0.9% = 1,462.5→1,460 · 합계 9,580', () => {
    const t = withholdCoopDepositTax(162_500, 0.05)
    assert.deepEqual(t.lines.map(l => [l.key, l.amount]), [['income', 8_120], ['rural', 1_460]])
    assert.equal(t.total, 9_580)
    // '세율 직접 입력 5.9%'와 같은 값: 162,500 × 5.9% = 9,587.5 → 9,580
    assert.equal(withholdInterestTax(162_500, 'custom', 5.9).total, 9_580)
  })
  test('이자 162,500원 · 9% 가입분: 14,625→14,620 + 812.5→810 = 15,430 (직접 입력 9.5%와 같음)', () => {
    assert.equal(withholdCoopDepositTax(162_500, 0.09).total, 15_430)
    assert.equal(withholdInterestTax(162_500, 'custom', 9.5).total, 15_430)
  })
  test('농특세 면제 대상: 5% 가입분 → 소득세 8,120만, 비과세 → 0원·줄 없음', () => {
    assert.deepEqual(withholdCoopDepositTax(162_500, 0.05, true).lines.map(l => l.amount), [8_120])
    assert.equal(withholdCoopDepositTax(162_500, 0, true).lines.length, 0)
  })
  test('비과세 경로는 기존 coopExempt와 동일: 162,500 → 2,270', () => {
    assert.deepEqual(withholdCoopDepositTax(162_500, 0), withholdInterestTax(162_500, 'coopExempt'))
  })
})

describe('원천징수 — 10원 미만 절사 (국고금 관리법 §47①)', () => {
  test('floor10 경계: 0·9·10·19·음수', () => {
    assert.equal(floor10(0), 0)
    assert.equal(floor10(9), 0)
    assert.equal(floor10(10), 10)
    assert.equal(floor10(19.99), 10)
    assert.equal(floor10(-5), 0)
  })
  test('taxFloor10 — 부동소수 곱셈 오차 없이 (350 × 14% = 49.00000000000001 → 40)', () => {
    assert.equal(taxFloor10(350, 0.14), 40)
    // 1,000 × 14% = 140 정확히 10원 배수 → 그대로 140
    assert.equal(taxFloor10(1_000, 0.14), 140)
  })
  test('일반과세: 이자 162,500원 → 소득세 22,750 · 지방세 2,275→2,270 (합계 25,020, 15.4% 일괄 25,025보다 5원 적음)', () => {
    const t = withholdInterestTax(162_500, 'general')
    assert.deepEqual(t.lines.map(l => l.amount), [22_750, 2_270])
    assert.equal(t.total, 25_020)
  })
  test('일반과세: 이자 350,000원 → 49,000 + 4,900 = 53,900', () => {
    assert.equal(withholdInterestTax(350_000, 'general').total, 53_900)
  })
  test('소득세 경계 ±1원: 71원 → 소득세 9.94→0 / 72원 → 10.08→10 (지방세 1.0→0)', () => {
    // 71 × 0.14 = 9.94 → 0원 ; 72 × 0.14 = 10.08 → 10원, 지방세 10 × 0.1 = 1 → 0원
    assert.deepEqual(withholdInterestTax(71, 'general').lines.map(l => l.amount), [0, 0])
    assert.deepEqual(withholdInterestTax(72, 'general').lines.map(l => l.amount), [10, 0])
  })
  test('지방소득세 경계: 소득세 100원(이자 715원) → 지방세 10원 / 소득세 90원(이자 714원 → 99.96→90) → 지방세 0원', () => {
    // 715 × 0.14 = 100.1 → 100 → 지방 10 ; 714 × 0.14 = 99.96 → 90 → 지방 9 → 0
    assert.deepEqual(withholdInterestTax(715, 'general').lines.map(l => l.amount), [100, 10])
    assert.deepEqual(withholdInterestTax(714, 'general').lines.map(l => l.amount), [90, 0])
  })
  test('소액부징수 미적용(소득세법 §86 — 이자소득 제외): 이자 5,000원 → 700 + 70', () => {
    assert.deepEqual(withholdInterestTax(5_000, 'general').lines.map(l => l.amount), [700, 70])
  })
  test('0원·음수 이자 → 세금 0', () => {
    assert.equal(withholdInterestTax(0, 'general').total, 0)
    assert.equal(withholdInterestTax(-100, 'general').total, 0)
  })
  test('조합 예탁금 비과세: 농특세 = 이자 × 1.4% 절사 (162,500 → 2,275 → 2,270)', () => {
    const t = withholdInterestTax(162_500, 'coopExempt')
    assert.deepEqual(t.lines.map(l => [l.key, l.amount]), [['rural', 2_270]])
  })
  test('비과세종합저축 → 0원, 줄 없음', () => {
    const t = withholdInterestTax(1_000_000, 'taxFree')
    assert.equal(t.total, 0)
    assert.equal(t.lines.length, 0)
  })
  test('직접 입력 5.9% → 1,000,000 × 5.9% = 59,000 · 상한 100% 클램프', () => {
    assert.equal(withholdInterestTax(1_000_000, 'custom', 5.9).total, 59_000)
    assert.equal(withholdInterestTax(1_000, 'custom', 150).total, 1_000)
    assert.equal(withholdInterestTax(1_000, 'custom', -3).total, 0)
  })
  test('두 번 절사해도 15.4% 일괄 대비 차이는 20원 미만', () => {
    for (let i = 0; i <= 200_000; i += 137) {
      const diff = i * 0.154 - withholdInterestTax(i, 'general').total
      assert.ok(diff >= -1e-9 && diff < 20, `이자 ${i}: 차이 ${diff}`)
    }
  })
})

const DEP: DepositInput = { product: 'deposit', amount: 10_000_000, months: 12, ratePct: 3.5, method: 'simple', taxType: 'general' }
const SAV: DepositInput = { product: 'savings', amount: 500_000, months: 12, ratePct: 5, method: 'simple', taxType: 'general' }

describe('정기예금', () => {
  test('단리 1,000만원·3.5%·12개월: 10,000,000 × 0.035 × 12/12 = 350,000 → 세후 296,100 → 만기 10,296,100', () => {
    const r = calcDeposit(DEP)
    assert.equal(r.principal, 10_000_000)
    assert.equal(r.grossInterest, 350_000)
    assert.equal(r.taxTotal, 53_900)
    assert.equal(r.netInterest, 296_100)
    assert.equal(r.maturity, 10_296_100)
  })
  test('단리 6개월: 10,000,000 × 0.035 × 6/12 = 175,000', () => {
    assert.equal(calcDeposit({ ...DEP, months: 6 }).grossInterest, 175_000)
  })
  test('월복리 1,000만원·3.5%·12개월: 10,000,000 × ((1+0.035/12)^12 − 1) = 355,669.4… → 355,669', () => {
    // (1.0029166…)^12 = 1.035566946… → 이자 355,669.46 → 원 미만 절사
    const r = calcDeposit({ ...DEP, method: 'monthly' })
    assert.equal(r.grossInterest, 355_669)
    // 소득세 355,669 × 0.14 = 49,793.66 → 49,790 · 지방세 4,979 → 4,970
    assert.deepEqual(r.taxLines.map(l => l.amount), [49_790, 4_970])
    assert.equal(r.netInterest, 355_669 - 54_760)
  })
  test('월복리 1개월 = 단리 1개월 (P·r/12): 10,000,000 × 0.035/12 = 29,166.67 → 29,166', () => {
    assert.equal(calcDeposit({ ...DEP, months: 1 }).grossInterest, 29_166)
    assert.equal(calcDeposit({ ...DEP, months: 1, method: 'monthly' }).grossInterest, 29_166)
  })
  test('금리 0% → 이자 0, 만기 = 원금', () => {
    const r = calcDeposit({ ...DEP, ratePct: 0 })
    assert.equal(r.grossInterest, 0)
    assert.equal(r.maturity, 10_000_000)
  })
  test('원금 0 → 전부 0', () => {
    const r = calcDeposit({ ...DEP, amount: 0 })
    assert.equal(r.grossInterest, 0)
    assert.equal(r.maturity, 0)
  })
  test('3억·4%·36개월 단리 = 36,000,000 → 종합과세 기준(2,000만) 초과', () => {
    const r = calcDeposit({ ...DEP, amount: 300_000_000, ratePct: 4, months: 36 })
    assert.equal(r.grossInterest, 36_000_000)
    assert.ok(r.grossInterest > COMPREHENSIVE_TAX_THRESHOLD)
  })
})

describe('정기적금', () => {
  test('단리 월 50만·5%·12개월: 500,000 × 0.05/12 × 78 = 162,500 → 세후 137,480 → 만기 6,137,480', () => {
    const r = calcDeposit(SAV)
    assert.equal(r.principal, 6_000_000)
    assert.equal(r.grossInterest, 162_500)
    assert.equal(r.taxTotal, 25_020)
    assert.equal(r.netInterest, 137_480)
    assert.equal(r.maturity, 6_137_480)
  })
  test('단리 24개월: 500,000 × 0.05/12 × (24×25/2 = 300) = 625,000', () => {
    assert.equal(calcDeposit({ ...SAV, months: 24 }).grossInterest, 625_000)
  })
  test('월복리 월 50만·5%·12개월: 500,000 × (1+i) × ((1+i)^12 − 1)/i − 6,000,000, i = 0.05/12 → 165,008', () => {
    // (1+i)^12 = 1.0511618979 → FV 계수 12.3355 × 1.0041667 → 6,165,008.3… − 6,000,000 = 165,008
    assert.equal(calcDeposit({ ...SAV, method: 'monthly' }).grossInterest, 165_008)
  })
  test('1개월 적금 = 1개월 예금 (M·r/12): 500,000 × 0.05/12 = 2,083.33 → 2,083', () => {
    assert.equal(calcDeposit({ ...SAV, months: 1 }).grossInterest, 2_083)
    assert.equal(calcDeposit({ ...SAV, months: 1, method: 'monthly' }).grossInterest, 2_083)
  })
  test('조합 예탁금 비과세: 162,500 − 농특세 2,270 = 160,230', () => {
    const r = calcDeposit({ ...SAV, taxType: 'coopExempt' })
    assert.equal(r.netInterest, 160_230)
  })
  test('비과세종합저축: 세후 = 세전 162,500', () => {
    assert.equal(calcDeposit({ ...SAV, taxType: 'taxFree' }).netInterest, 162_500)
  })
  test('월별 표 — 마지막 행 누적 이자 = 만기 세전 이자, 누적 납입 = M × k', () => {
    const r = calcDeposit(SAV)
    assert.equal(r.rows.length, 12)
    assert.equal(r.rows[0].paid, 500_000)
    assert.equal(r.rows[0].interest, 2_083)           // 1개월치
    assert.equal(r.rows[11].interest, r.grossInterest)
    assert.equal(r.rows[11].paid, 6_000_000)
  })
})

describe('적금 ↔ 예금 환산', () => {
  test('단리 예금 → 적금 환산 = r × 2n/(n+1): 3.5% · 12개월 → 3.5 × 24/13 = 6.4615…%', () => {
    near(calcDeposit(DEP).savingsEquivPct, 3.5 * 24 / 13, 1e-9)
    near(calcDeposit(DEP).depositEquivPct, 3.5, 1e-9)
  })
  test('월복리 예금 → 적금 환산은 실제 복리 이자 기준: 1,000만·5%·60개월 월복리', () => {
    // 이자 I = 10,000,000 × ((1 + 0.05/12)^60 − 1) = 2,833,586.8… → 표시 2,833,586
    // 같은 총액을 60개월에 나눈 단리 적금 이자 = P·r·(n+1)/24 → r = I × 24 / (P × 61) = 11.1485…%
    const r = calcDeposit({ ...DEP, amount: 10_000_000, ratePct: 5, months: 60, method: 'monthly' })
    assert.equal(r.grossInterest, 2_833_586)
    const I = 10_000_000 * (Math.pow(1 + 0.05 / 12, 60) - 1)
    near(r.savingsEquivPct, (I * 24) / (10_000_000 * 61) * 100, 1e-9)
    // 역검산: 월 P/60 을 그 금리로 단리 적금 → 이자 = (P/60) × (rate/12) × 60×61/2 가 복리 이자와 같다
    const M = 10_000_000 / 60
    near(M * (r.savingsEquivPct / 100 / 12) * (60 * 61 / 2), I, 1e-6)
    // 단리 공식(5 × 120/61 = 9.836%)으로는 2,500,000원만 나와 332,586원 모자랐던 회귀 방지
    assert.ok(r.savingsEquivPct > 11.14 && r.savingsEquivPct < 11.15)
    // 같은 이자를 내는 단리 예금 금리 = I / P × 12/60 = 5.667…%
    near(r.depositEquivPct, I / 10_000_000 * (12 / 60) * 100, 1e-9)
  })
  test('월복리 적금 → 예금 환산: 월 50만·5%·12개월 → 165,008.3… / 6,000,000 × 100 = 2.750…%', () => {
    const r = calcDeposit({ ...SAV, method: 'monthly' })
    const I = accruedInterest('savings', 'monthly', 500_000, 5, 12)
    near(r.depositEquivPct, I / 6_000_000 * 100, 1e-9)
    // 단리 적금이면 적금 환산 = 자기 금리 5%
    near(calcDeposit(SAV).savingsEquivPct, 5, 1e-9)
  })
  test('적금 5%·12개월 → 예금 5 × 13/24 = 2.7083…% (약 2.7%)', () => {
    near(depositEquivalentOfSavings(5, 12), 5 * 13 / 24)
    near(calcDeposit(SAV).depositEquivPct, 5 * 13 / 24, 1e-6)
  })
  test('1개월이면 환산 금리 = 적금 금리 (n+1)/2n = 1', () => near(depositEquivalentOfSavings(4, 1), 4))
  test('역환산: 예금 3.5%·12개월과 같은 이자 → 적금 3.5 × 24/13 = 6.4615…%', () => {
    near(savingsRateForSameInterest(3.5, 12), 3.5 * 24 / 13)
    // 역환산 금리로 계산한 적금 이자 = 같은 총액 예금 이자 (총액 600만 × 3.5% = 210,000)
    const eqRate = savingsRateForSameInterest(3.5, 12)
    near(accruedInterest('savings', 'simple', 500_000, Math.round(eqRate * 100) / 100, 12), 500_000 * (6.46 / 100 / 12) * 78, 1e-6)
  })
})

describe('만원 표기 manwon — 먼저 만원 단위로 반올림한 뒤 억/만 분리', () => {
  test('억 경계 바로 아래: 99,995,000 → 10,000만 → 1억원 (종전 \'10,000만원\')', () => {
    assert.equal(manwon(99_995_000), '1억원')
    assert.equal(manwon(99_994_999), '9,999만원')     // 9,999.4999만 → 9,999만
    assert.equal(manwon(199_995_000), '2억원')        // 종전 '1억 10,000만원'
    assert.equal(manwon(199_999_999), '2억원')
  })
  test('일반 값: 1만원 경계·억+만', () => {
    assert.equal(manwon(9_999), '9,999원')
    assert.equal(manwon(10_000), '1만원')
    assert.equal(manwon(30_000_000), '3,000만원')
    assert.equal(manwon(123_456_789), '1억 2,346만원')  // 12,345.6789만 → 12,346만
    assert.equal(manwon(100_000_000), '1억원')
  })
})

describe('입력 정규화·파싱', () => {
  test('기간 0 → 1, 121 → 120, 소수 → 반올림', () => {
    assert.equal(normalizeInput({ ...DEP, months: 0 }).months, 1)
    assert.equal(normalizeInput({ ...DEP, months: 121 }).months, 120)
    assert.equal(normalizeInput({ ...DEP, months: 11.6 }).months, 12)
  })
  test('금리 상한 20%, 음수 0, 0.01%p 반올림', () => {
    assert.equal(normalizeInput({ ...DEP, ratePct: 25 }).ratePct, 20)
    assert.equal(normalizeInput({ ...DEP, ratePct: -1 }).ratePct, 0)
    assert.equal(normalizeInput({ ...DEP, ratePct: 3.456 }).ratePct, 3.46)
  })
  test('원금 상한 — 예금 100억, 적금 월 1억', () => {
    assert.equal(normalizeInput({ ...DEP, amount: 2e10 }).amount, 10_000_000_000)
    assert.equal(normalizeInput({ ...SAV, amount: 2e8 }).amount, 100_000_000)
  })
  test('상한 입력에서도 정수 연산 오버플로 없이 계산 (100억·20%·120개월 단리 = 200억)', () => {
    assert.equal(calcDeposit({ ...DEP, amount: 10_000_000_000, ratePct: 20, months: 120 }).grossInterest, 20_000_000_000)
  })
  test('콤마 입력·파싱', () => {
    assert.equal(commaInput('1000000'), '1,000,000')
    assert.equal(commaInput('00123abc'), '123')
    assert.equal(commaInput(''), '')
    assert.equal(parseMoney('1,234,567'), 1_234_567)
    assert.equal(parseMoney(''), 0)
    assert.equal(decimalInput('3.4.56'), '3.45')
    assert.equal(decimalInput('a5.1'), '5.1')
  })
})
