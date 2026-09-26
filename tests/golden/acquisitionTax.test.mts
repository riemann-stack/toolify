/* 골든 테스트 — 주택 유상취득 취득세·지방교육세·농어촌특별세 (lib/krAcquisitionTax.ts)
   기대값은 법령 산식으로 손계산한 값이다 (코드 출력 복사 아님).
   · 지방세법 §11①8호: 6억↓ 1% / 6~9억 (가액×2/3억−3)% 소수점 이하 다섯째자리 반올림 / 9억↑ 3%
   · §13의2: 조정 2주택·비조정 3주택 8%, 조정 3주택+·비조정 4주택+·법인 12%, 시가표준액 1억↓ 제외
   · 지방교육세 §151: 표준 = 취득세율×10%, 중과 0.4%
   · 농특세: 85㎡ 초과만 — 표준 0.2%, 8% → 0.6%, 12% → 1.0%
   · 세액 10원 미만 절사 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcHouseAcquisitionTax, calcNonHouseAcquisitionTax, standardHouseRatePpm,
  type HouseAcqInput,
} from '../../lib/krAcquisitionTax'
import { calcAcquisitionTax as auctionTaxMan, acquisitionTaxBreakdown } from '../../app/tools/finance/auction/auctionUtils'

const EOK = 100_000_000
const house = (price: number, o: Partial<HouseAcqInput> = {}) =>
  calcHouseAcquisitionTax({ price, homeCount: 1, adjusted: false, over85: false, ...o })
const triple = (b: { acquisitionTax: number; educationTax: number; ruralTax: number; total: number }) =>
  [b.acquisitionTax, b.educationTax, b.ruralTax, b.total]

describe('1주택 표준세율 (≤85㎡ / >85㎡)', () => {
  const rows: [number, number[], number[]][] = [
    //   가격        [취득세, 교육세, 농특세, 합계] ≤85                  >85
    [6 * EOK,    [6_000_000,  600_000,   0, 6_600_000],     [6_000_000,  600_000,   1_200_000, 7_800_000]],
    [7 * EOK,    [11_690_000, 1_169_000, 0, 12_859_000],    [11_690_000, 1_169_000, 1_400_000, 14_259_000]],
    [7.5 * EOK,  [15_000_000, 1_500_000, 0, 16_500_000],    [15_000_000, 1_500_000, 1_500_000, 18_000_000]],
    [9 * EOK,    [27_000_000, 2_700_000, 0, 29_700_000],    [27_000_000, 2_700_000, 1_800_000, 31_500_000]],
    [12 * EOK,   [36_000_000, 3_600_000, 0, 39_600_000],    [36_000_000, 3_600_000, 2_400_000, 42_000_000]],
  ]
  for (const [price, le85, gt85] of rows) {
    test(`${price / EOK}억`, () => {
      assert.deepEqual(triple(house(price)), le85)
      assert.deepEqual(triple(house(price, { over85: true })), gt85)
      assert.equal(house(price).category, 'standard')
    })
  }
})

describe('6~9억 세율 반올림 (소수점 이하 다섯째자리 → 0.01%p 단위)', () => {
  test('경계: 6억 1%, 6억+1원 1%, 9억 3%, 9억+1원 3%', () => {
    assert.equal(standardHouseRatePpm(600_000_000), 10_000)
    assert.equal(standardHouseRatePpm(600_000_001), 10_000)
    assert.equal(standardHouseRatePpm(900_000_000), 30_000)
    assert.equal(standardHouseRatePpm(900_000_001), 30_000)
  })
  test('7억 1.67% · 8억 2.33% · 8.5억 2.67%', () => {
    assert.equal(house(7 * EOK).acquisitionRate, 1.67)
    assert.equal(house(8 * EOK).acquisitionRate, 2.33)
    assert.equal(house(8.5 * EOK).acquisitionRate, 2.67)
    assert.equal(house(8 * EOK).acquisitionTax, 18_640_000)
    assert.equal(house(8.5 * EOK).acquisitionTax, 22_695_000)
    assert.equal(house(8.5 * EOK).educationTax, 2_269_500)
  })
  test('정확히 절반(6억 75만원 → 1.005%)은 올림 → 1.01%, 10원 미만 절사', () => {
    const b = house(600_750_000)
    assert.equal(b.acquisitionRate, 1.01)
    assert.equal(b.acquisitionTax, 6_067_570)   // 6,067,575 → 10원 미만 절사
    assert.equal(b.educationTax, 606_750)       // 606,757.5 → 절사
  })
})

describe('중과 8%·12% (지방교육세 0.4%, 85㎡ 초과 농특세 0.6%/1.0%)', () => {
  const s8: [number, number, number][] = [ // 가격, 합계 ≤85, 합계 >85
    [6 * EOK, 50_400_000, 54_000_000],
    [7.5 * EOK, 63_000_000, 67_500_000],
    [9 * EOK, 75_600_000, 81_000_000],
    [12 * EOK, 100_800_000, 108_000_000],
  ]
  const s12: [number, number, number][] = [
    [6 * EOK, 74_400_000, 80_400_000],
    [7.5 * EOK, 93_000_000, 100_500_000],
    [9 * EOK, 111_600_000, 120_600_000],
    [12 * EOK, 148_800_000, 160_800_000],
  ]
  for (const [price, le, gt] of s8) {
    test(`조정 2주택 8% — ${price / EOK}억`, () => {
      const a = house(price, { homeCount: 2, adjusted: true })
      assert.equal(a.category, 'surcharge8')
      assert.equal(a.total, le)
      assert.equal(house(price, { homeCount: 2, adjusted: true, over85: true }).total, gt)
      assert.equal(house(price, { homeCount: 2, adjusted: true, over85: true }).ruralRate, 0.6)
    })
  }
  for (const [price, le, gt] of s12) {
    test(`조정 3주택 12% — ${price / EOK}억`, () => {
      const a = house(price, { homeCount: 3, adjusted: true })
      assert.equal(a.category, 'surcharge12')
      assert.equal(a.total, le)
      assert.equal(house(price, { homeCount: 3, adjusted: true, over85: true }).total, gt)
      assert.equal(house(price, { homeCount: 3, adjusted: true, over85: true }).ruralRate, 1)
    })
  }
  test('12억 조정 2주택 >85 실효 9.0%, 12% >85 실효 13.4%', () => {
    assert.equal(house(12 * EOK, { homeCount: 2, adjusted: true, over85: true }).totalRate, 9)
    assert.equal(house(12 * EOK, { homeCount: 3, adjusted: true, over85: true }).totalRate, 13.4)
  })
})

describe('주택 수 × 조정대상지역 매트릭스', () => {
  const cat = (homeCount: number, adjusted: boolean, o: Partial<HouseAcqInput> = {}) =>
    house(7.5 * EOK, { homeCount, adjusted, ...o }).category
  test('비조정: 1·2주택 표준, 3주택 8%, 4주택+ 12%', () => {
    assert.deepEqual([1, 2, 3, 4, 5].map(n => cat(n, false)),
      ['standard', 'standard', 'surcharge8', 'surcharge12', 'surcharge12'])
  })
  test('조정: 1주택 표준, 2주택 8%, 3주택+ 12%', () => {
    assert.deepEqual([1, 2, 3, 4].map(n => cat(n, true)),
      ['standard', 'surcharge8', 'surcharge12', 'surcharge12'])
  })
  test('조정 일시적 2주택 → 표준 (비조정·3주택에는 영향 없음)', () => {
    assert.equal(cat(2, true, { temporaryTwoHomes: true }), 'standard')
    assert.equal(cat(3, true, { temporaryTwoHomes: true }), 'surcharge12')
    assert.equal(house(7.5 * EOK, { homeCount: 2, adjusted: true, temporaryTwoHomes: true }).total, 16_500_000)
  })
  test('법인 12% (주택 수·지역 무관)', () => {
    assert.equal(cat(1, false, { corporate: true }), 'surcharge12')
    assert.equal(house(5 * EOK, { corporate: true }).total, 62_000_000) // 12% + 0.4%
  })
  test('시가표준액 1억 이하 → 중과 제외 (법인·조정 3주택 포함)', () => {
    assert.equal(cat(3, true, { lowValueHouse: true }), 'standard')
    assert.equal(cat(1, false, { corporate: true, lowValueHouse: true }), 'standard')
    assert.equal(house(1.5 * EOK, { homeCount: 4, adjusted: true, lowValueHouse: true }).total, 1_650_000)
  })
})

describe('85㎡ 경계 · 비주택 · 방어', () => {
  test('85㎡ 초과 여부는 농특세만 바꾼다', () => {
    const a = house(7.5 * EOK), b = house(7.5 * EOK, { over85: true })
    assert.equal(a.acquisitionTax, b.acquisitionTax)
    assert.equal(a.educationTax, b.educationTax)
    assert.equal(a.ruralTax, 0)
    assert.equal(b.ruralTax, 1_500_000)
  })
  test('비주택 4% + 0.4% + 0.2% = 4.6%', () => {
    assert.deepEqual(triple(calcNonHouseAcquisitionTax(5 * EOK)), [20_000_000, 2_000_000, 1_000_000, 23_000_000])
    assert.equal(calcNonHouseAcquisitionTax(5 * EOK).totalRate, 4.6)
  })
  test('0·음수·NaN 가격 → 0', () => {
    assert.equal(house(0).total, 0)
    assert.equal(house(-1).total, 0)
    assert.equal(house(Number.NaN).total, 0)
    assert.equal(calcNonHouseAcquisitionTax(Number.NaN).total, 0)
  })
  test('초고가도 정수 연산 정확 (500억 12%)', () => {
    assert.equal(house(500 * EOK, { corporate: true }).acquisitionTax, 6_000_000_000)
  })
})

describe('경매(auction) 래퍼 — 만원 단위, 85㎡ 이하 가정', () => {
  test('7억 실거주 1주택 = 1,285.9만원 (1.67% + 0.167%)', () => {
    assert.equal(auctionTaxMan(70_000, 'apt', 'live1', 'normal'), 1_285.9)
  })
  test('1주택→2주택: 비규제 표준, 조정·투기과열 8.4%', () => {
    assert.equal(auctionTaxMan(60_000, 'apt', 'own1', 'normal'), 660)
    assert.equal(auctionTaxMan(60_000, 'apt', 'own1', 'adjusted'), 5_040)
    assert.equal(auctionTaxMan(60_000, 'apt', 'own1', 'speculative'), 5_040)
  })
  test('2→3주택: 비조정 8.4% · 조정 12.4% / 4주택+·법인 12.4% / 비주택 4.6%', () => {
    assert.equal(auctionTaxMan(50_000, 'villa', 'multi2', 'normal'), 4_200)
    assert.equal(auctionTaxMan(50_000, 'villa', 'multi2', 'adjusted'), 6_200)
    assert.equal(auctionTaxMan(50_000, 'house', 'multi3', 'normal'), 6_200)
    assert.equal(auctionTaxMan(50_000, 'apt', 'corp', 'normal'), 6_200)
    assert.equal(auctionTaxMan(50_000, 'office', 'multi3', 'adjusted'), 2_300)
  })
  test('내역 라벨', () => {
    assert.equal(acquisitionTaxBreakdown(60_000, 'apt', 'own1', 'adjusted').label, '조정대상지역 2주택 중과 8%')
  })
})
