/* 골든 테스트 — 자동차 취득세·자동차세 (lib/krVehicleTax.ts + finance/car-tax calcCarTax + finance/car-cost 자동차세)
   기대값은 지방세법·지방세특례제한법 산식 손계산값 (과세연도 2026).
   · 자동차세 §127①: 비영업용 승용 cc당 80원(1,000cc↓)·140원(1,600cc↓)·200원(초과), 영업용 18·18·19·19·24원
     전기·수소(그 밖의 승용) 비영업용 10만원 정액. 지방교육세 §151: 자동차세액 × 30% → 전기차 13만원
   · 차령 경감 §127③: 차령 3부터 (차령 − 2) × 5%, 최대 50%. 차령 = 과세연도 − 등록연도 + 1
   · 취득세 §12①2호: 비영업용 승용 7% · 경형·영업용 4%. 전기 140만·경차 75만 한도 감면,
     다자녀 3명↑ 140만 한도 면제 / 2명 50%(70만 한도). 중복 감면은 큰 하나만 (지특법 §180)

   [손계산 — 3,000만원 · 1,998cc · 서울 · 신차]
     취득세 210만 / 공채 3,000만 × 12%(서울 2,000cc 미만) × 할인 12% = 432,000 / 등록 15,000 → 2,547,000
     자동차세 1,998 × 200 = 399,600 + 교육세 119,880 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  carTaxPerCc, annualTaxByCC, annualTaxAgeDiscount, carAgeFromYears, dieselEnvFeeApplies, bondRateFor,
  ACQUISITION_TAX_RATES, EV_TAX_CAP, LIGHT_TAX_CAP, MULTI_CHILD_TAX_CAP, TWO_CHILD_TAX_RATE, TWO_CHILD_TAX_CAP,
  EV_ANNUAL_TAX, EDU_TAX_RATE, ANNUAL_PREPAY_DISCOUNT, VEHICLE_TAX_YEAR, DIESEL_ENV_FEE_LAST_REG_YEAR,
} from '../../lib/krVehicleTax'
import { calcCarTax, TAX_BASE_YEAR, type CarTaxInputs } from '../../app/tools/finance/car-tax/carTaxData'
import { autoTaxYearlyForCC, AUTO_TAX_BRACKETS, EV_AUTO_TAX } from '../../app/tools/finance/car-cost/carCostUtils'

const car = (o: Partial<CarTaxInputs> = {}) => calcCarTax({
  carPrice: 30_000_000, carType: 'normal', fuelType: 'gasoline', cc: 1998, yearsSinceReg: 0, regionId: 'seoul',
  monthlyKm: 0, efficiencyKmL: 12, prepay: false, exemption: 'none', yearsToHold: 1, ...o,
})

describe('자동차세 cc당 세액 §127① 경계', () => {
  test('비영업용 승용: 1,000 / 1,001 / 1,600 / 1,601cc', () => {
    assert.deepEqual([1000, 1001, 1600, 1601].map(cc => carTaxPerCc(cc, false)), [80, 140, 140, 200])
  })
  test('영업용 승용: 1,600 / 1,601 / 2,500 / 2,501cc', () => {
    assert.deepEqual([1000, 1600, 1601, 2000, 2500, 2501].map(cc => carTaxPerCc(cc, true)), [18, 18, 19, 19, 19, 24])
  })
  test('NaN은 최고 구간으로', () => {
    assert.equal(carTaxPerCc(NaN, false), 200)
    assert.equal(carTaxPerCc(NaN, true), 24)
  })
  test('본세 = 배기량 × cc당 세액', () => {
    assert.equal(annualTaxByCC(1998, false), 399_600)
    assert.equal(annualTaxByCC(1598, false), 223_720)
    assert.equal(annualTaxByCC(998, false), 79_840)
    assert.equal(annualTaxByCC(1998, true), 37_962)
    assert.equal(annualTaxByCC(3000, true), 72_000)
  })
})

describe('차령 경감·연납·교육세·전기차', () => {
  test('차령 경감: 1·2 → 0, 3 → 5%, 7 → 25%, 12 → 50%, 13 → 50%(상한)', () => {
    assert.deepEqual([1, 2, 3, 7, 12, 13].map(annualTaxAgeDiscount), [0, 0, 0.05, 0.25, 0.5, 0.5])
  })
  test('경과 년수 → 차령 (등록한 해 = 1)', () => {
    assert.deepEqual([0, 2, 2.9, -1].map(carAgeFromYears), [1, 3, 3, 1])
  })
  test('상수: 과세연도 2026 · 연납 공제 4.58% · 교육세 30% · 전기차 10만 (+교육세 = 13만)', () => {
    assert.equal(VEHICLE_TAX_YEAR, 2026)
    assert.equal(TAX_BASE_YEAR, VEHICLE_TAX_YEAR)
    assert.equal(ANNUAL_PREPAY_DISCOUNT, 0.0458)
    assert.equal(EDU_TAX_RATE, 0.3)
    assert.equal(EV_ANNUAL_TAX, 100_000)
    assert.equal(EV_AUTO_TAX, 130_000)
  })
})

describe('취득세율·감면 한도', () => {
  test('세율', () => {
    assert.deepEqual(ACQUISITION_TAX_RATES, { normal: 0.07, light: 0.04, business: 0.04, ev: 0.07, hybrid: 0.07 })
    assert.deepEqual([EV_TAX_CAP, LIGHT_TAX_CAP, MULTI_CHILD_TAX_CAP, TWO_CHILD_TAX_RATE, TWO_CHILD_TAX_CAP],
      [1_400_000, 750_000, 1_400_000, 0.5, 700_000])
  })
})

describe('공채·환경개선부담금', () => {
  test('서울 비영업용 승용: 1,000cc 미만 0 · 1,600cc 미만 9% · 2,000cc 미만 12% · 이상 20%', () => {
    assert.deepEqual([998, 1000, 1599, 1600, 1999, 2000].map(cc => bondRateFor('seoul', cc, 'normal')), [0, 0.09, 0.09, 0.12, 0.12, 0.2])
  })
  test('경차 면제 · 그 밖의 지역·전기·영업용은 지역 대표값', () => {
    assert.equal(bondRateFor('seoul', 998, 'light'), 0)
    assert.equal(bondRateFor('busan', 2000, 'normal'), 0.04)
    assert.equal(bondRateFor('gyeonggi', 2000, 'normal'), 0.06)
    assert.equal(bondRateFor('seoul', 0, 'ev'), 0.12)
    assert.equal(bondRateFor('seoul', 3000, 'business'), 0.12)
  })
  test('경유차 환경개선부담금: 등록연도 2011 이하만', () => {
    assert.equal(DIESEL_ENV_FEE_LAST_REG_YEAR, 2011)
    assert.equal(dieselEnvFeeApplies('diesel', 2011), true)
    assert.equal(dieselEnvFeeApplies('diesel', 2012), false)
    assert.equal(dieselEnvFeeApplies('gasoline', 2000), false)
  })
})

describe('car-tax calcCarTax — 손계산 대조', () => {
  test('3,000만 · 1,998cc · 서울 · 신차', () => {
    const r = car()
    assert.deepEqual(
      [r.acquisitionTax, r.bondCost, r.registrationFee, r.initialTotal, r.annualCarTax, r.annualEduTax, r.annualTotal],
      [2_100_000, 432_000, 15_000, 2_547_000, 399_600, 119_880, 519_480],
    )
  })
  test('전기차: 취득세 210만 − 140만 = 70만, 연 13만', () => {
    const r = car({ carType: 'ev', fuelType: 'electric', cc: 0 })
    assert.equal(r.acquisitionTax, 700_000)
    assert.equal(r.annualCarTax + r.annualEduTax, 130_000)
  })
  test('경차: 4% − 75만 한도 (3,000만 → 45만, 1,500만 → 0)', () => {
    assert.equal(car({ carType: 'light', cc: 998 }).acquisitionTax, 450_000)
    assert.equal(car({ carType: 'light', cc: 998, carPrice: 15_000_000 }).acquisitionTax, 0)
    assert.equal(car({ carType: 'light', cc: 998 }).bondCost, 0)
  })
  test('다자녀: 2자녀 50%(70만 한도) → 140만 / 3자녀 140만 한도 → 70만', () => {
    const two = car({ exemption: 'two_child' })
    assert.equal(two.acquisitionTax, 1_400_000)
    assert.equal(two.exemptionSaved, 700_000)
    const multi = car({ exemption: 'multi_child' })
    assert.equal(multi.acquisitionTax, 700_000)
    assert.equal(multi.exemptionSaved, 1_400_000)
  })
  test('차령 경감: 경과 2년(차령 3) 5% → 379,620 · 경과 11년(차령 12) 50% → 199,800', () => {
    assert.equal(car({ yearsSinceReg: 2 }).annualCarTax, 379_620)
    assert.equal(car({ yearsSinceReg: 11 }).annualCarTax, 199_800)
    assert.equal(car({ yearsSinceReg: 20 }).annualCarTax, 199_800)
  })
  test('연납: 399,600 × (1 − 4.58%) = 381,298', () => {
    assert.equal(car({ prepay: true }).annualCarTax, 381_298)
  })
  test('경유차: 경과 15년(2011 등록) 부담금 부과 · 14년(2012) 비부과', () => {
    assert.ok(car({ fuelType: 'diesel', yearsSinceReg: 15 }).annualEnvFee > 0)
    assert.equal(car({ fuelType: 'diesel', yearsSinceReg: 14 }).annualEnvFee, 0)
  })
  test('영업용 1,998cc: 취득세 4% 120만 · 자동차세 37,962', () => {
    const r = car({ carType: 'business' })
    assert.equal(r.acquisitionTax, 1_200_000)
    assert.equal(r.annualCarTax, 37_962)
  })
  test('영업용 승용은 지방교육세 비과세 (지방세법 §150 — 비영업용 승용 자동차세만)', {
    todo: '현재 calcCarTax가 영업용에도 교육세 30%(11,389원)를 붙임 — 법령 확인 후 수정 필요 (T-golden 보고)',
  }, () => {
    assert.equal(car({ carType: 'business' }).annualEduTax, 0)
  })
  test('장애인·국가유공자: 취득세·자동차세 면제', () => {
    const r = car({ exemption: 'disabled' })
    assert.equal(r.acquisitionTax, 0)
    assert.equal(r.annualCarTax, 0)
    assert.equal(r.annualEduTax, 0)
  })
})

describe('car-cost 자동차세 칩 — car-tax와 같은 lib 산식', () => {
  test('구간 상한 배기량 칩 세액 (교육세 포함)', () => {
    assert.deepEqual(AUTO_TAX_BRACKETS.map(b => b.yearly), [104_000, 291_200, 520_000, 650_000, 780_000, 910_000])
  })
  test('1,600/1,601cc 경계 · 음수 → 0', () => {
    assert.equal(autoTaxYearlyForCC(1600), 291_200)
    assert.equal(autoTaxYearlyForCC(1601), 416_260)
    assert.equal(autoTaxYearlyForCC(-10), 0)
  })
  test('car-tax 신차 자동차세 + 교육세 = car-cost 칩 (비영업용)', () => {
    for (const cc of [998, 1000, 1001, 1598, 1600, 1601, 1998, 2497, 3000, 3470]) {
      const r = car({ cc, carType: cc < 1000 ? 'light' : 'normal' })
      assert.equal(r.annualCarTax + r.annualEduTax, autoTaxYearlyForCC(cc), `${cc}cc`)
    }
  })
})
