/* 골든 테스트 — 부동산 중개보수(복비) 상한 (lib/krBrokerageFee.ts)
   기대값은 법령 산식으로 손계산한 값이다 (코드 출력 복사 아님).
   · 공인중개사법 시행규칙 §20① [별표 1] (2021.10.19 시행) — 주택
       매매·교환: 5천만 미만 0.6%(한도 25만) / 5천만~2억 미만 0.5%(80만) / 2~9억 0.4% / 9~12억 0.5% / 12~15억 0.6% / 15억 이상 0.7%
       임대차 등: 5천만 미만 0.5%(20만) / 5천만~1억 미만 0.4%(30만) / 1~6억 0.3% / 6~12억 0.4% / 12~15억 0.5% / 15억 이상 0.6%
   · §20④1호 [별표 2] 주거용 오피스텔: 매매·교환 0.5%, 임대차 0.4% (한도액 없음)
   · §20④2호 그 밖: 0.9% 이내
   · §20⑤1호 월세: 보증금 + 월세×100, 그 합이 5천만원 미만이면 보증금 + 월세×70
   · 끝수: 원 미만 버림(상한이므로). 부가세 10% 원 미만 버림
   · '미만/이상' 경계: 경계 금액 자체는 위 구간(이상)에 속한다 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcBrokerageFee, leaseTransactionAmount, houseSaleMaxFee, houseScheduleFor, findHouseBracket, mulPpm,
  CURRENT_HOUSE_FEE_SCHEDULE, HOUSE_FEE_SCHEDULES, OFFICETEL_FEE, SIMPLIFIED_TAXPAYER, BROKERAGE_VAT_PCT,
  type BrokerageFeeInput,
} from '../../lib/krBrokerageFee'
import { capStart, scheduleRows, parseRate, rateInput, commaInput, parseWon, mergeState, queryToState, stateToQuery, DEFAULT_STATE, computeFee } from '../../app/tools/finance/brokerage-fee/brokerageFeeUtils'

const EOK = 100_000_000
const MAN = 10_000
const fee = (o: BrokerageFeeInput) => calcBrokerageFee(o)
const sale = (amount: number, o: Partial<BrokerageFeeInput> = {}) => fee({ deal: 'sale', property: 'house', amount, ...o })
const jeonse = (amount: number, o: Partial<BrokerageFeeInput> = {}) => fee({ deal: 'jeonse', property: 'house', amount, ...o })
const monthly = (deposit: number, rent: number, o: Partial<BrokerageFeeInput> = {}) =>
  fee({ deal: 'monthly', property: 'house', amount: deposit, monthlyRent: rent, ...o })

describe('주택 매매·교환 — 구간 경계 ±1원과 한도액', () => {
  const rows: [number, number, string][] = [
    //  거래금액          최대 보수       손계산
    [0,                  0,            '0원 → 0'],
    [30_000_000,         180_000,      '3천만 × 0.6% = 180,000 (한도 25만 미달)'],
    [41_666_666,         249_999,      '× 0.6% = 249,999.996 → 원 미만 버림'],
    [41_666_667,         250_000,      '× 0.6% = 250,000.002 → 250,000 = 한도액과 같음'],
    [49_999_999,         250_000,      '× 0.6% = 299,999.994 → 한도 25만'],
    [50_000_000,         250_000,      '5천만(이상) → 0.5% = 250,000 (한도 80만 미달) — 5천만 경계에서 연속'],
    [100_000_000,        500_000,      '1억 × 0.5%'],
    [160_000_000,        800_000,      '1.6억 × 0.5% = 800,000 = 한도액'],
    [180_000_000,        800_000,      '1.8억 × 0.5% = 900,000 → 한도 80만'],
    [199_999_999,        800_000,      '× 0.5% = 999,999.995 → 한도 80만'],
    [200_000_000,        800_000,      '2억(이상) → 0.4% = 800,000 — 2억 경계에서도 연속'],
    [500_000_000,        2_000_000,    '5억 × 0.4%'],
    [899_999_999,        3_599_999,    '× 0.4% = 3,599,999.996 → 버림'],
    [900_000_000,        4_500_000,    '9억(이상) → 0.5% — 1원 차이로 900,001원 증가'],
    [1_000_000_000,      5_000_000,    '10억 × 0.5%'],
    [1_199_999_999,      5_999_999,    '× 0.5% = 5,999,999.995 → 버림'],
    [1_200_000_000,      7_200_000,    '12억 × 0.6%'],
    [1_300_000_000,      7_800_000,    '13억 × 0.6%'],
    [1_499_999_999,      8_999_999,    '× 0.6% = 8,999,999.994 → 버림'],
    [1_500_000_000,      10_500_000,   '15억 × 0.7%'],
    [2_000_000_000,      14_000_000,   '20억 × 0.7%'],
    [12_345_678,         74_074,       '× 0.6% = 74,074.068 → 버림'],
  ]
  for (const [amount, expected, why] of rows) {
    test(`${amount.toLocaleString('ko-KR')}원 → ${expected.toLocaleString('ko-KR')}원 (${why})`, () => {
      assert.equal(sale(amount).maxFee, expected)
      assert.equal(houseSaleMaxFee(amount), expected)
    })
  }
  test('한도 적용 여부 플래그 — 1.8억은 한도 적용, 1.6억은 한도와 같을 뿐 적용 아님', () => {
    assert.equal(sale(180_000_000).capApplied, true)
    assert.equal(sale(180_000_000).rawMaxFee, 900_000)
    assert.equal(sale(160_000_000).capApplied, false)
    assert.equal(sale(500_000_000).cap, null)
  })
  test('구간 인덱스 — 경계 금액은 위 구간', () => {
    assert.equal(findHouseBracket(49_999_999, 'sale').index, 0)
    assert.equal(findHouseBracket(50_000_000, 'sale').index, 1)
    assert.equal(findHouseBracket(900_000_000, 'sale').index, 3)
    assert.equal(findHouseBracket(1_500_000_000, 'sale').index, 5)
  })
  test('5억 부가세·양측: 2,000,000 + 10% 200,000 = 2,200,000, 양측 4,000,000(부가세 전)', () => {
    const r = sale(500_000_000)
    assert.equal(r.vat, 200_000)
    assert.equal(r.feeWithVat, 2_200_000)
    assert.equal(r.bothSides, 4_000_000)
  })
  test('부가세 원 미만 버림: 74,074 × 10% = 7,407.4 → 7,407', () => {
    assert.equal(sale(12_345_678).vat, 7_407)
  })
})

describe('주택 전세(임대차) — 구간 경계와 한도액', () => {
  const rows: [number, number, string][] = [
    [30_000_000,     150_000,   '3천만 × 0.5% (한도 20만 미달)'],
    [40_000_000,     200_000,   '4천만 × 0.5% = 200,000 = 한도액'],
    [49_999_999,     200_000,   '× 0.5% = 249,999.995 → 한도 20만'],
    [50_000_000,     200_000,   '5천만(이상) → 0.4% = 200,000 (한도 30만 미달)'],
    [80_000_000,     300_000,   '8천만 × 0.4% = 320,000 → 한도 30만'],
    [99_999_999,     300_000,   '× 0.4% = 399,999.996 → 한도 30만'],
    [100_000_000,    300_000,   '1억(이상) → 0.3% = 300,000'],
    [300_000_000,    900_000,   '3억 × 0.3%'],
    [599_999_999,    1_799_999, '× 0.3% = 1,799,999.997 → 버림'],
    [600_000_000,    2_400_000, '6억(이상) → 0.4%'],
    [1_199_999_999,  4_799_999, '× 0.4% = 4,799,999.996 → 버림'],
    [1_200_000_000,  6_000_000, '12억 × 0.5%'],
    [1_500_000_000,  9_000_000, '15억 × 0.6%'],
  ]
  for (const [amount, expected, why] of rows) {
    test(`전세 ${amount.toLocaleString('ko-KR')}원 → ${expected.toLocaleString('ko-KR')}원 (${why})`, () => {
      assert.equal(jeonse(amount).maxFee, expected)
    })
  }
})

describe('월세 거래금액 환산 — ×100, 5천만원 미만이면 ×70', () => {
  test('보증금 500만 + 월 35만: 500만+3,500만=4,000만 < 5천만 → 500만+2,450만=2,950만 × 0.5% = 147,500', () => {
    const r = monthly(5_000_000, 350_000)
    assert.equal(r.lease?.amount100, 40_000_000)
    assert.equal(r.lease?.multiplier, 70)
    assert.equal(r.transactionAmount, 29_500_000)
    assert.equal(r.maxFee, 147_500)
    assert.equal(r.vat, 14_750)
  })
  test('경계: 보증금 1,000만 + 월 40만 → 정확히 5,000만(미만 아님) → ×100 유지 → 0.4% = 200,000', () => {
    const r = monthly(10_000_000, 400_000)
    assert.equal(r.lease?.multiplier, 100)
    assert.equal(r.transactionAmount, 50_000_000)
    assert.equal(r.maxFee, 200_000)
  })
  test('경계 −1원: 보증금 1,000만 + 월 399,999 → 49,999,900 < 5천만 → ×70 = 37,999,930 × 0.5% = 189,999.65 → 189,999', () => {
    const r = monthly(10_000_000, 399_999)
    assert.equal(r.lease?.multiplier, 70)
    assert.equal(r.transactionAmount, 37_999_930)
    assert.equal(r.maxFee, 189_999)
    assert.equal(r.vat, 18_999)
  })
  test('보증금 1,000만 + 월 39만: 4,900만 → ×70 = 3,730만 × 0.5% = 186,500', () => {
    assert.equal(monthly(10_000_000, 390_000).maxFee, 186_500)
  })
  test('보증금 1,000만 + 월 60만: 7,000만 × 0.4% = 280,000 (한도 30만 미달)', () => {
    assert.equal(monthly(10_000_000, 600_000).maxFee, 280_000)
  })
  test('보증금 1억 + 월 100만: 2억 × 0.3% = 600,000', () => {
    assert.equal(monthly(100_000_000, 1_000_000).maxFee, 600_000)
  })
  test('월세 0원이면 보증금이 곧 거래금액(배수 없음) — 보증금 3억 → 900,000', () => {
    const r = monthly(300_000_000, 0)
    assert.equal(r.lease?.multiplier, null)
    assert.equal(r.transactionAmount, 300_000_000)
    assert.equal(r.maxFee, 900_000)
  })
  test('보증금·월세 모두 0 → 0', () => {
    assert.equal(monthly(0, 0).maxFee, 0)
  })
  test('보증금 0 + 월 50만: 0 + 5,000만(미만 아님) → ×100 = 5,000만 → 200,000', () => {
    assert.deepEqual(leaseTransactionAmount(0, 500_000), { deposit: 0, monthlyRent: 500_000, amount100: 50_000_000, multiplier: 100, amount: 50_000_000 })
  })
})

describe('주거용 오피스텔(별표 2)·그 밖의 중개대상물(0.9%)', () => {
  test('오피스텔 매매 2억 × 0.5% = 1,000,000 (한도액 없음 — 같은 금액 주택은 800,000)', () => {
    assert.equal(fee({ deal: 'sale', property: 'officetel', amount: 200_000_000 }).maxFee, 1_000_000)
    assert.equal(sale(200_000_000).maxFee, 800_000)
  })
  test('오피스텔 매매 3천만 × 0.5% = 150,000 (주택이면 0.6% 180,000)', () => {
    assert.equal(fee({ deal: 'sale', property: 'officetel', amount: 30_000_000 }).maxFee, 150_000)
  })
  test('오피스텔 월세 1,000만/70만 → 8,000만 × 0.4% = 320,000 (주택은 한도 30만)', () => {
    assert.equal(fee({ deal: 'monthly', property: 'officetel', amount: 10_000_000, monthlyRent: 700_000 }).maxFee, 320_000)
    assert.equal(monthly(10_000_000, 700_000).maxFee, 300_000)
  })
  test('오피스텔 월세도 ×70 규칙 적용: 500만/35만 → 2,950만 × 0.4% = 118,000', () => {
    assert.equal(fee({ deal: 'monthly', property: 'officetel', amount: 5_000_000, monthlyRent: 350_000 }).maxFee, 118_000)
  })
  test('상가 매매 5억 × 0.9% = 4,500,000 · 토지 전세(임대) 1억 × 0.9% = 900,000', () => {
    assert.equal(fee({ deal: 'sale', property: 'other', amount: 500_000_000 }).maxFee, 4_500_000)
    assert.equal(fee({ deal: 'jeonse', property: 'other', amount: 100_000_000 }).maxFee, 900_000)
  })
  test('상가 월세 보증금 3천만 + 월 200만 → 2억3천만 × 0.9% = 2,070,000', () => {
    assert.equal(fee({ deal: 'monthly', property: 'other', amount: 30_000_000, monthlyRent: 2_000_000 }).maxFee, 2_070_000)
  })
  test('1.8억 매매 — 주택은 0.5% 900,000이 한도 800,000에 걸리고, 주거용 오피스텔은 한도 없이 0.5% = 900,000 (본문 예시)', () => {
    const h = sale(180_000_000)
    assert.equal(h.rawMaxFee, 900_000)
    assert.equal(h.maxFee, 800_000)
    assert.equal(h.capApplied, true)
    const o = fee({ deal: 'sale', property: 'officetel', amount: 180_000_000 })
    assert.equal(o.maxFee, 900_000)
    assert.equal(o.capApplied, false)
  })
  test('2억 매매 주택은 2억~9억 구간 0.4% = 800,000 — 한도 적용 아님(한도 없는 구간)', () => {
    const h = sale(200_000_000)
    assert.equal(h.maxFee, 800_000)
    assert.equal(h.cap, null)
    assert.equal(h.capApplied, false)
  })
  test('오피스텔 요율·개정 메타: 별표 2 매매 0.5%(5,000ppm)·임대 0.4%(4,000ppm), 요율 2015-01-06 · 협의 문구 2026-08-28(국토교통부령 제1611호)', () => {
    assert.equal(OFFICETEL_FEE.saleRatePpm, 5_000)
    assert.equal(OFFICETEL_FEE.leaseRatePpm, 4_000)
    assert.equal(OFFICETEL_FEE.effectiveFrom, '2015-01-06')
    assert.equal(OFFICETEL_FEE.negotiationWordingFrom, '2026-08-28')
    assert.equal(OFFICETEL_FEE.negotiationWordingAct, '국토교통부령 제1611호')
  })
})

describe('real-estate 매매 중개보수 — 중개 대상별 (주택 / 주거용 오피스텔 / 상가·토지 등)', () => {
  // real-estate calcBrokerFee(price, property) = calcBrokerageFee({ deal:'sale', property, amount }).maxFee
  const byProp = (amount: number, property: BrokerageFeeInput['property']) => fee({ deal: 'sale', property, amount }).maxFee
  test('3억: 주택 0.4% 1,200,000 · 주거용 오피스텔 0.5% 1,500,000 · 상가·토지 0.9% 2,700,000', () => {
    assert.equal(byProp(300_000_000, 'house'), 1_200_000)
    assert.equal(byProp(300_000_000, 'officetel'), 1_500_000)
    assert.equal(byProp(300_000_000, 'other'), 2_700_000)
  })
  test('2억: 주거용 오피스텔 1,000,000 (0.9%로 잘못 분류하면 1,800,000 — 80% 과다)', () => {
    assert.equal(byProp(200_000_000, 'officetel'), 1_000_000)
    assert.equal(byProp(200_000_000, 'other'), 1_800_000)
  })
  test('5억 → 7억 매도: 주거용 오피스텔 매수 2,500,000 · 매도 3,500,000 (한도액 없음)', () => {
    assert.equal(byProp(500_000_000, 'officetel'), 2_500_000)
    assert.equal(byProp(700_000_000, 'officetel'), 3_500_000)
  })
})

describe('부가세 — 헌재 2025. 4. 10. 2023헌마995 사안의 숫자', () => {
  // 1억 3,700만원 주택 매매: 5천만~2억 미만 구간 0.5% → 685,000 (한도 80만 미달)
  //  + 10% 부가세 68,500 = 753,500 (청구인이 받은 금액)
  //  검사가 본 법정 수수료: 685,000 + 4%(부가가치율 40% × 10%) 27,400 = 712,400
  test('1억 3,700만 매매: 보수 685,000 · 부가세 68,500 · 합계 753,500', () => {
    const r = sale(137_000_000)
    assert.equal(r.maxRatePpm, 5_000)
    assert.equal(r.maxFee, 685_000)
    assert.equal(r.capApplied, false)
    assert.equal(r.vat, 68_500)
    assert.equal(r.feeWithVat, 753_500)
  })
  test('간이과세자 실부담률 = 부가가치율 40% × 10% = 4% → 685,000 × 4% = 27,400 → 712,400', () => {
    const burdenPct = (SIMPLIFIED_TAXPAYER.valueAddedRatePct * BROKERAGE_VAT_PCT) / 100
    assert.equal(burdenPct, 4)
    const r = sale(137_000_000)
    assert.equal(r.maxFee + Math.floor((r.maxFee * burdenPct) / 100), 712_400)
  })
  test('세금계산서 발급 의무 기준(§36①2호가)과 납부면제 기준(§69①)은 둘 다 연 공급대가 4,800만원', () => {
    assert.equal(SIMPLIFIED_TAXPAYER.invoiceRequiredFrom, 48_000_000)
    assert.equal(SIMPLIFIED_TAXPAYER.exemptBelow, 48_000_000)
  })
})

describe('협의 요율', () => {
  test('10억 매매 상한 0.5%, 협의 0.4% → 4,000,000', () => {
    const r = sale(1_000_000_000, { negotiatedRatePct: 0.4 })
    assert.equal(r.fee, 4_000_000)
    assert.equal(r.maxFee, 5_000_000)
    assert.equal(r.negotiated, true)
    assert.equal(r.rateClamped, false)
  })
  test('협의 0.35% → 3,500,000 (소수 둘째 자리 요율)', () => {
    assert.equal(sale(1_000_000_000, { negotiatedRatePct: 0.35 }).fee, 3_500_000)
  })
  test('상한 초과 0.6% 입력 → 상한 0.5%로 잘림, 5,000,000', () => {
    const r = sale(1_000_000_000, { negotiatedRatePct: 0.6 })
    assert.equal(r.rateClamped, true)
    assert.equal(r.appliedRatePpm, 5_000)
    assert.equal(r.fee, 5_000_000)
  })
  test('협의 요율에도 한도액 적용: 1.8억 × 0.45% = 810,000 → 한도 800,000', () => {
    const r = sale(180_000_000, { negotiatedRatePct: 0.45 })
    assert.equal(r.fee, 800_000)
    assert.equal(r.feeCapped, true)
  })
  test('협의 0% → 0원, NaN·음수는 무시(상한)', () => {
    assert.equal(sale(500_000_000, { negotiatedRatePct: 0 }).fee, 0)
    assert.equal(sale(500_000_000, { negotiatedRatePct: Number.NaN }).fee, 2_000_000)
    assert.equal(sale(500_000_000, { negotiatedRatePct: -1 }).fee, 2_000_000)
  })
  test('상가 5억 협의 0.5% → 2,500,000', () => {
    assert.equal(fee({ deal: 'sale', property: 'other', amount: 500_000_000, negotiatedRatePct: 0.5 }).fee, 2_500_000)
  })
})

describe('기간 키 — 2021.10.19 개정 전후', () => {
  test('개정 전(2021-10-18) 10억 매매 = 9억 이상 0.9% → 9,000,000 / 개정 후 0.5% → 5,000,000', () => {
    assert.equal(sale(1_000_000_000, { date: '2021-10-18' }).maxFee, 9_000_000)
    assert.equal(sale(1_000_000_000, { date: '2021-10-19' }).maxFee, 5_000_000)
  })
  test('개정 전 7억 매매 = 6~9억 0.5% → 3,500,000 / 개정 후 0.4% → 2,800,000', () => {
    assert.equal(sale(700_000_000, { date: '2021-10-18' }).maxFee, 3_500_000)
    assert.equal(sale(700_000_000).maxFee, 2_800_000)
  })
  test('개정 전 전세 4억 = 3~6억 0.4% → 1,600,000 / 개정 후 0.3% → 1,200,000', () => {
    assert.equal(jeonse(400_000_000, { date: '2021-10-18' }).maxFee, 1_600_000)
    assert.equal(jeonse(400_000_000).maxFee, 1_200_000)
  })
  test('형식 오류·생략은 현행 요율표', () => {
    assert.equal(houseScheduleFor('bad'), CURRENT_HOUSE_FEE_SCHEDULE)
    assert.equal(houseScheduleFor(), CURRENT_HOUSE_FEE_SCHEDULE)
    assert.equal(houseScheduleFor('2026-09-26').from, '2021-10-19')
    assert.equal(HOUSE_FEE_SCHEDULES[0].to, '2021-10-18')
  })
})

describe('정수 연산·입력 방어', () => {
  test('mulPpm: 1조 × 0.7% = 7,000,000,000 (정밀도 손실 없음)', () => {
    assert.equal(mulPpm(1_000_000_000_000, 7_000), 7_000_000_000)
  })
  test('음수·NaN 금액은 0', () => {
    assert.equal(sale(-5).maxFee, 0)
    assert.equal(sale(Number.NaN).maxFee, 0)
  })
  test('한도 시작 금액: 25만/0.6% → 41,666,667 · 80만/0.5% → 1.6억 · 20만/0.5% → 4천만 · 30만/0.4% → 7,500만', () => {
    const s = CURRENT_HOUSE_FEE_SCHEDULE
    assert.equal(capStart(s.sale[0]), 41_666_667)
    assert.equal(capStart(s.sale[1]), 160_000_000)
    assert.equal(capStart(s.lease[0]), 40_000_000)
    assert.equal(capStart(s.lease[1]), 75_000_000)
    assert.equal(capStart(s.sale[2]), null)
    assert.equal(scheduleRows('sale')[0].label, '5천만원 미만')
    assert.equal(scheduleRows('sale')[2].label, '2억원 이상 9억원 미만')
    assert.equal(scheduleRows('lease')[5].label, '15억원 이상')
  })
  test('요율 입력: 콤마·문자 제거, 소수 4자리, 빈칸은 상한', () => {
    assert.equal(rateInput('0.3a5'), '0.35')
    assert.equal(rateInput('.4'), '0.4')
    assert.equal(rateInput('0.12345'), '0.1234')
    assert.equal(parseRate(''), undefined)
    assert.equal(parseRate('0.35'), 0.35)
    assert.equal(parseRate('99'), 10)
  })
  test('금액 입력: 실시간 콤마·클램프', () => {
    assert.equal(commaInput('500000000'), '500,000,000')
    assert.equal(commaInput('00012a3'), '123')
    assert.equal(parseWon('1,234,567.9'), 1_234_567)
  })
  test('저장값 검증 — 잘못된 enum·타입은 기본값', () => {
    const m = mergeState({ deal: 'rent', property: 'castle', price: 'abc', vat: 'yes', rate: '0.3' })
    assert.equal(m.deal, DEFAULT_STATE.deal)
    assert.equal(m.property, DEFAULT_STATE.property)
    assert.equal(m.price, DEFAULT_STATE.price)
    assert.equal(m.vat, DEFAULT_STATE.vat)
    assert.equal(m.rate, '0.3')
    assert.equal(mergeState([1, 2]), DEFAULT_STATE)
  })
  test('공유 링크 왕복 — 월세 1,000만/60만, 부가세 제외 → 280,000', () => {
    const st = { ...DEFAULT_STATE, deal: 'monthly' as const, deposit: '10,000,000', rent: '600,000', vat: false }
    const back = queryToState('?' + stateToQuery(st))
    assert.ok(back)
    assert.equal(back.deal, 'monthly')
    assert.equal(back.vat, false)
    const v = computeFee(back)
    assert.equal(v.shown, 280_000)
    assert.equal(v.shownBoth, 560_000)
  })
})

/* ─── finance/real-estate 의 옛 calcBrokerFee 와의 동등성 ───
   옛 함수(RealEstateClient.tsx, 2021.10 요율 하드코딩)를 그대로 옮겨 lib 결과와 비교한다.
   차이는 원 미만뿐: 옛 함수는 부동소수 그대로(화면에서 반올림), lib는 원 미만 버림. */
function oldCalcBrokerFee(price: number): number {
  if (price <= 0) return 0
  if (price < 50_000_000) return Math.min(price * 0.006, 250_000)
  if (price < 200_000_000) return Math.min(price * 0.005, 800_000)
  if (price < 900_000_000) return price * 0.004
  if (price < 1_200_000_000) return price * 0.005
  if (price < 1_500_000_000) return price * 0.006
  return price * 0.007
}

describe('real-estate 옛 calcBrokerFee ↔ lib (주택 매매)', () => {
  const bounds = [50_000_000, 200_000_000, 900_000_000, 1_200_000_000, 1_500_000_000]
  const samples = new Set<number>([1, 9_999, 41_666_667])
  for (const b of bounds) for (const d of [-1, 0, 1]) samples.add(b + d)
  for (let m = 1_000; m <= 3_000_000; m = Math.ceil(m * 1.37)) samples.add(m * MAN) // 1천만 ~ 300억, 만원 단위
  for (const p of [123_456_789, 987_654_321, 1_234_567_891, 45_678_901]) samples.add(p)
  test(`${samples.size}개 표본: lib = floor(옛 값), 만원 단위 금액은 완전 일치`, () => {
    for (const p of samples) {
      const oldV = oldCalcBrokerFee(p)
      const libV = houseSaleMaxFee(p)
      assert.equal(libV, Math.floor(oldV + 1e-6), `price ${p}: old ${oldV} lib ${libV}`)
      if (p % MAN === 0) assert.equal(libV, Math.round(oldV), `만원 단위 ${p}`)
    }
  })
  test('예: 5억 → 2,000,000 · 10억 → 5,000,000 · 20억 → 14,000,000 (옛 함수와 동일)', () => {
    for (const p of [5 * EOK, 10 * EOK, 20 * EOK]) assert.equal(houseSaleMaxFee(p), Math.round(oldCalcBrokerFee(p)))
  })
})
