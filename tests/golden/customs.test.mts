/* 골든 테스트 — 해외직구 관부가세 (lib/krCustoms.ts + life/customs calcCustoms)
   근거: 관세법 시행규칙 제45조(소액면세 $150), 특송물품 수입통관 고시(미국발 목록통관 $200, 목록통관 배제 물품 $150),
         부가가치세법(10%), 개별소비세법(가방·시계 200만원·보석 500만원 초과분 20%, 교육세 30%), 주세법(과실주 30%, 교육세 10%),
         수입통관 사무처리에 관한 고시 별표(주류 1병·1L·$150 이하 자가사용은 관세만 면제).
   면세 한도는 '물품가격(운임 제외) 이하'에서 면세 — 경계값 포함.
   [손계산 — 환율 1,400원/$]
     미국 니트 $200.01 → 과세가격 280,014 × 13% = 36,401.82 / 부가세 (280,014 + 36,401.82) × 10% = 31,641.582
     가방 $2,000 → 280만, 관세 8% 224,000, 개소세 (302.4만 − 200만) × 20% = 204,800, 교육세 61,440,
                  부가세 (280만 + 224,000 + 204,800 + 61,440) × 10% = 329,024
     와인 1병 $100 (자가사용 인정기준 1병·1L·$150 이하 → 관세만 면제) → 14만, 관세 0, 주세 14만 × 30% = 42,000,
                  교육세 4,200, 부가세 (140,000 + 42,000 + 4,200) × 10% = 18,620
     와인 $200 ($150 초과 → 관세까지 과세) → 28만, 관세 15% 42,000, 주세 322,000 × 30% = 96,600, 교육세 9,660,
                  부가세 (280,000 + 42,000 + 96,600 + 9,660) × 10% = 42,826
     와인 €60 + 배송 €20 (€1 = 1,600원, $1 = 1,400원 → 물품가격 $68.57) → 과세가격 128,000, 관세 0,
                  주세 38,400, 교육세 3,840, 부가세 17,024, 합계 59,264
     보석 $3,000 → 420만, 관세 8% 336,000 → 453.6만 ≤ 500만이라 개소세 0
     보석 $4,000 → 560만, 관세 448,000 → (604.8만 − 500만) × 20% = 209,600, 교육세 62,880, 부가세 632,048, 합계 1,352,528
     가방 $1,500 → 210만, 관세 168,000 → (226.8만 − 200만) × 20% = 53,600, 교육세 16,080, 부가세 233,768, 합계 471,448 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  DUTY_FREE_LIMIT_USD, US_LIST_CLEARANCE_LIMIT_USD, NON_LISTED_DUTY_FREE_LIMIT_USD, dutyFreeLimitUsd,
  CUSTOMS_ITEM_DUTY_RATE_PCT, IMPORT_VAT_RATE, LUXURY_EXCISE, JEWELRY_EXCISE, EXCISE_EDU_TAX_RATIO, WINE_LIQUOR_TAX_PCT, LIQUOR_EDU_TAX_RATIO,
  LIQUOR_DUTY_EXEMPT,
} from '../../lib/krCustoms'
import { calcCustoms, ITEMS, COUNTRIES, type CustomsInputs } from '../../app/tools/life/customs/customsUtils'

const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)
const usd = (productPrice: number, itemId: string, o: Partial<CustomsInputs> = {}) => calcCustoms({
  countryId: 'us', itemId, productPrice, shippingFee: 0, exchangeRate: 1400, rateBase: 1, toUsdRate: 1, usdKrw: 1400,
  usage: 'personal', ...o,
})

describe('소액면세 한도', () => {
  test('상수: 일반 $150 · 미국 목록통관 $200 · 목록통관 배제 $150', () => {
    assert.deepEqual([DUTY_FREE_LIMIT_USD, US_LIST_CLEARANCE_LIMIT_USD, NON_LISTED_DUTY_FREE_LIMIT_USD], [150, 200, 150])
  })
  test('dutyFreeLimitUsd: 목록통관 배제 물품은 $150으로 제한', () => {
    assert.equal(dutyFreeLimitUsd(200, true), 200)
    assert.equal(dutyFreeLimitUsd(200, false), 150)
    assert.equal(dutyFreeLimitUsd(150, true), 150)
    assert.equal(dutyFreeLimitUsd(150, false), 150)
  })
  test('국가별 한도: 미국만 $200', () => {
    for (const c of COUNTRIES) assert.equal(c.dutyFreeUsd, c.id === 'us' ? 200 : 150, c.id)
  })
})

describe('calcCustoms 한도 경계', () => {
  test('미국 목록통관 의류 $200 면세 / $200.01 과세', () => {
    const at = usd(200, 'cloth_knit')
    assert.equal(at.isDutyFree, true)
    assert.equal(at.totalTax, 0)
    const over = usd(200.01, 'cloth_knit')
    assert.equal(over.isDutyFree, false)
    near(over.duty, 36_401.82)
    near(over.vat, 31_641.582)
  })
  test('미국 영양제(목록통관 배제) $150 면세 / $150.01 과세', () => {
    assert.equal(usd(150, 'supplement').isDutyFree, true)
    assert.equal(usd(150, 'supplement').dutyFreeLimit, 150)
    assert.equal(usd(150.01, 'supplement').isDutyFree, false)
  })
  test('중국 $150 상당(위안 환산) 면세 — 부동소수 오차로 경계가 뒤집히지 않음', () => {
    const r = calcCustoms({ countryId: 'cn', itemId: 'cloth_knit', productPrice: 150 * 1400 / 192, shippingFee: 0,
      exchangeRate: 192, rateBase: 1, toUsdRate: 0.137, usdKrw: 1400, usage: 'personal' })
    assert.equal(r.productUsd, 150)
    assert.equal(r.isDutyFree, true)
  })
  test('면세 판정은 배송비 제외 물품가격 기준', () => {
    assert.equal(usd(200, 'cloth_knit', { shippingFee: 50 }).isDutyFree, true)
  })
  test('사업자 직구는 한도와 무관하게 과세', () => {
    assert.equal(usd(10, 'cloth_knit', { usage: 'business' }).isDutyFree, false)
  })
})

describe('내국세 적층', () => {
  test('상수: 부가세 10% · 개소세 200만 초과분 20% · 교육세 30% · 와인 주세 30% · 주세 교육세 10%', () => {
    assert.equal(IMPORT_VAT_RATE, 0.1)
    assert.deepEqual({ ...LUXURY_EXCISE }, { threshold: 2_000_000, rate: 20 })
    assert.deepEqual({ ...JEWELRY_EXCISE }, { threshold: 5_000_000, rate: 20 })
    assert.deepEqual({ ...LIQUOR_DUTY_EXEMPT }, { bottles: 1, maxLiters: 1, maxUsd: 150 })
    assert.equal(EXCISE_EDU_TAX_RATIO, 0.3)
    assert.equal(WINE_LIQUOR_TAX_PCT, 30)
    assert.equal(LIQUOR_EDU_TAX_RATIO, 0.1)
  })
  test('가방 $2,000: 관세 → 개소세(200만 초과분) → 교육세 → 부가세', () => {
    const r = usd(2000, 'bag')
    near(r.duty, 224_000)
    near(r.excise, 204_800)
    near(r.eduTax, 61_440)
    near(r.vat, 329_024)
    near(r.totalTax, 819_264)
  })
  test('개소세 기준가격 경계: 과세가격 + 관세 = 200만 이하면 개소세 0', () => {
    // 과세가격 x × 1.08 = 200만 → x = 1,851,851.85… 원 → $1,322.75 (1,400원)
    assert.equal(usd(1322.75, 'bag').excise, 0)
    assert.ok(usd(1322.76, 'bag').excise > 0)
  })
  test('와인 1병 $100: 소액면세 배제지만 $150 이하라 관세만 면제 — 주세·교육세·부가세 과세', () => {
    const r = usd(100, 'wine')
    assert.equal(r.isDutyFree, false)
    assert.equal(r.liquorDutyExempt, true)
    assert.equal(r.duty, 0)
    near(r.liquorTax, 42_000)
    near(r.eduTax, 4_200)
    near(r.vat, 18_620)
  })
  test('와인 관세 면제 경계: $150 관세 0 / $150.01 관세 과세', () => {
    assert.equal(usd(150, 'wine').duty, 0)
    assert.equal(usd(150, 'wine').liquorDutyExempt, true)
    assert.equal(usd(150.01, 'wine').liquorDutyExempt, false)
    assert.ok(usd(150.01, 'wine').duty > 0)
  })
  test('와인 $200: $150 초과 → 관세·주세·교육세·부가세 모두 과세', () => {
    const r = usd(200, 'wine')
    near(r.duty, 42_000)
    near(r.liquorTax, 96_600)
    near(r.eduTax, 9_660)
    near(r.vat, 42_826)
  })
  test('와인 €60 + 배송 €20 (€1 = 1,600원): 관세 0, 세금 합계 59,264원', () => {
    const r = calcCustoms({ countryId: 'eu', itemId: 'wine', productPrice: 60, shippingFee: 20,
      exchangeRate: 1600, rateBase: 1, toUsdRate: 1.14, usdKrw: 1400, usage: 'personal' })
    assert.equal(r.productUsd, 68.57)
    assert.equal(r.duty, 0)
    near(r.liquorTax, 38_400)
    near(r.eduTax, 3_840)
    near(r.vat, 17_024)
    near(r.totalTax, 59_264)
  })
  test('사업자 와인은 관세 면제 없음', () => {
    near(usd(100, 'wine', { usage: 'business' }).duty, 21_000)
  })
  test('보석 개소세 기준가격 500만원: $3,000 → 0 / $4,000 → 209,600', () => {
    assert.equal(usd(3000, 'jewelry').excise, 0)
    const r = usd(4000, 'jewelry')
    near(r.excise, 209_600)
    near(r.eduTax, 62_880)
    near(r.totalTax, 1_352_528)
  })
  test('가방 $1,500: 200만원 초과분 개소세 53,600, 합계 471,448', () => {
    const r = usd(1500, 'bag')
    near(r.excise, 53_600)
    near(r.totalTax, 471_448)
  })
  test('도서: 관세 0 · 부가세 면제 / 노트북: 관세 0(ITA) · 부가세 10%', () => {
    assert.equal(usd(300, 'book').totalTax, 0)
    const lap = usd(1000, 'laptop')
    assert.equal(lap.duty, 0)
    near(lap.vat, 140_000)
  })
})

describe('품목 관세율 표 (lib 단일 소스)', () => {
  test('ITEMS의 관세율 = lib 표, 키 집합 동일', () => {
    for (const it of ITEMS) assert.equal(it.dutyRate, (CUSTOMS_ITEM_DUTY_RATE_PCT as Record<string, number>)[it.id], it.id)
    assert.deepEqual(ITEMS.map(i => i.id).sort(), Object.keys(CUSTOMS_ITEM_DUTY_RATE_PCT).sort())
  })
  test('대표 세율: 신발 13% · 가방 8% · 화장품 6.5% · ITA 0% · 치즈 36% · 와인 15%', () => {
    const R = CUSTOMS_ITEM_DUTY_RATE_PCT
    assert.deepEqual(
      [R.shoe_sport, R.shoe_leather, R.bag, R.cosmetic, R.laptop, R.phone, R.monitor, R.keyboard, R.camera, R.console, R.book, R.cheese, R.wine],
      [13, 13, 8, 6.5, 0, 0, 0, 0, 0, 0, 0, 36, 15],
    )
  })
})
