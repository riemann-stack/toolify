/* 골든 테스트 — 전기요금 (lib/krElectricityRates.ts) · 연료 단가 (lib/krFuelPrices.ts)
   2026-09 기준값을 고정한다. 한전 요금 개편·오피넷 월 갱신 때는 lib와 이 파일의 '기준값' 테스트를 함께 고친다
   (불변식 테스트 — 단계 순서·재수출 동일성 — 는 갱신과 무관하게 유지돼야 한다).
   · 한전 주택용(저압) 전력량요금 2023-05-16 조정분: 120.0 / 214.6 / 307.3원/kWh, 구간 200/400 (7~8월 300/450)kWh
   · 오피넷 2026년 9월 넷째 주 전국 평균: 휘발유 1,858 · 경유 1,843원/L
   · 전기차 공공 충전요금 (2026-08-01 시행): 완속 295.0 · 급속 348.4 · 초급속 393.1원/kWh */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH as TIER, KEPCO_RESIDENTIAL_LOW_TIER_LIMITS_KWH as LIMITS, KEPCO_RESIDENTIAL_LOW_TIERS,
  KEPCO_RATES_ASOF, KEPCO_RATES_EFFECTIVE, KEPCO_RATES_SOURCE_URL,
  ELEC_SIMPLE_KRW_PER_KWH, ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH, ELEC_HOUSEHOLD_AVG_KRW_PER_KWH,
} from '../../lib/krElectricityRates'
import * as fuel from '../../lib/krFuelPrices'
import * as fuelEconomy from '../../app/tools/unit/fuel-economy/fuelEconomyUtils'
import * as lighting from '../../app/tools/interior/lighting/lightingUtils'
import * as ac from '../../app/tools/interior/ac-capacity/acCapacityUtils'
import * as dehum from '../../app/tools/interior/dehumidifier/dehumidifierData'
import * as laundry from '../../app/tools/life/laundry-dry/laundryUtils'

describe('한전 주택용(저압) — 기준값', () => {
  test('누진 단가·구간', () => {
    assert.deepEqual({ ...TIER }, { tier1: 120.0, tier2: 214.6, tier3: 307.3 })
    assert.deepEqual(LIMITS, { normal: [200, 400], summer: [300, 450] })
    assert.equal(KEPCO_RATES_EFFECTIVE, '2023-05-16')
    assert.equal(KEPCO_RATES_ASOF, '2026년 9월')
    assert.match(KEPCO_RATES_SOURCE_URL, /^https:\/\/home\.kepco\.co\.kr\//)
  })
  test('도구 기본 추정 단가 130 / 160 / 200', () => {
    assert.deepEqual([ELEC_SIMPLE_KRW_PER_KWH, ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH, ELEC_HOUSEHOLD_AVG_KRW_PER_KWH], [130, 160, 200])
  })
})

describe('한전 주택용 — 불변식', () => {
  test('단가는 단계마다 증가, 하계 구간은 평소보다 넓다', () => {
    assert.ok(TIER.tier1 < TIER.tier2 && TIER.tier2 < TIER.tier3)
    assert.ok(LIMITS.normal[0] < LIMITS.normal[1] && LIMITS.summer[0] < LIMITS.summer[1])
    assert.ok(LIMITS.summer[0] > LIMITS.normal[0] && LIMITS.summer[1] > LIMITS.normal[1])
  })
  test('가이드 표(KEPCO_RESIDENTIAL_LOW_TIERS)는 단가 상수와 구간 상한을 그대로 쓴다', () => {
    assert.deepEqual(KEPCO_RESIDENTIAL_LOW_TIERS.map(t => t.krwPerKwh), [TIER.tier1, TIER.tier2, TIER.tier3])
    const [n1, n2] = LIMITS.normal
    const [s1, s2] = LIMITS.summer
    assert.deepEqual(KEPCO_RESIDENTIAL_LOW_TIERS.map(t => t.range), [`${n1}kWh 이하`, `${n1 + 1}~${n2}kWh`, `${n2}kWh 초과`])
    assert.deepEqual(KEPCO_RESIDENTIAL_LOW_TIERS.map(t => t.summerRange), [`${s1}kWh 이하`, `${s1 + 1}~${s2}kWh`, `${s2}kWh 초과`])
  })
  test('추정 단가는 1단계 전력량요금 이상', () => {
    for (const v of [ELEC_SIMPLE_KRW_PER_KWH, ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH, ELEC_HOUSEHOLD_AVG_KRW_PER_KWH]) assert.ok(v >= TIER.tier1)
  })
  test('도구 재수출 = lib 값 (lighting · ac-capacity · dehumidifier · laundry-dry)', () => {
    assert.deepEqual([...lighting.KEPCO_RESIDENTIAL_TIER_KRW], [TIER.tier1, TIER.tier2, TIER.tier3])
    assert.equal(lighting.DEFAULT_KRW_PER_KWH, ELEC_SIMPLE_KRW_PER_KWH)
    assert.equal(ac.KEPCO_TIER1_KRW_PER_KWH, TIER.tier1)
    assert.equal(ac.SIMPLE_KRW_PER_KWH, ELEC_SIMPLE_KRW_PER_KWH)
    assert.deepEqual({ ...dehum.KEPCO_RESIDENTIAL_TIER_KRW }, { ...TIER })
    assert.equal(dehum.DEFAULT_WON_PER_KWH, ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH)
    assert.equal(laundry.KRW_PER_KWH, ELEC_HOUSEHOLD_AVG_KRW_PER_KWH)
    assert.equal(laundry.KEPCO_RATES_ASOF, KEPCO_RATES_ASOF)
    assert.deepEqual(laundry.KEPCO_RESIDENTIAL_LOW_TIERS, KEPCO_RESIDENTIAL_LOW_TIERS)
  })
  test('제습기 월 전기요금 = 월 kWh × 단가 (기본 160원)', () => {
    const r = dehum.calcDehumidifier(33, 0.3, 1, 8, dehum.DEFAULT_WON_PER_KWH)
    assert.ok(r.monthlyKwh > 0)
    assert.ok(Math.abs(r.monthlyCost - r.monthlyKwh * 160) < 1e-9)
    assert.equal(dehum.calcDehumidifier(33, 0.3, 1, 8, -5).monthlyCost, 0)   // 음수 단가 → 0
  })
})

describe('연료 단가 (lib/krFuelPrices)', () => {
  test('기준값 — 2026년 9월 넷째 주', () => {
    assert.equal(fuel.GASOLINE_PRICE, 1858)
    assert.equal(fuel.DIESEL_PRICE, 1843)
    assert.deepEqual([fuel.EV_SLOW_RATE, fuel.EV_FAST_RATE, fuel.EV_ULTRA_RATE], [295.0, 348.4, 393.1])
    assert.equal(fuel.FUEL_PRICE_MONTH, '2026년 9월')
    assert.equal(fuel.FUEL_PRICE_AS_OF, '2026년 9월 넷째 주')
  })
  test('불변식: 원/L 정수·상식 범위, 충전요금 완속 < 급속 < 초급속, 기준일 문구는 월 문구로 시작', () => {
    for (const p of [fuel.GASOLINE_PRICE, fuel.DIESEL_PRICE]) {
      assert.ok(Number.isInteger(p) && p > 1000 && p < 3000, String(p))
    }
    assert.ok(fuel.EV_SLOW_RATE < fuel.EV_FAST_RATE && fuel.EV_FAST_RATE < fuel.EV_ULTRA_RATE)
    assert.ok(fuel.FUEL_PRICE_AS_OF.startsWith(fuel.FUEL_PRICE_MONTH))
  })
  test('fuel-economy 재수출 = lib 값', () => {
    for (const k of ['FUEL_PRICE_MONTH', 'FUEL_PRICE_AS_OF', 'GASOLINE_PRICE', 'DIESEL_PRICE', 'EV_SLOW_RATE', 'EV_FAST_RATE', 'EV_ULTRA_RATE'] as const) {
      assert.equal(fuelEconomy[k], fuel[k], k)
    }
  })
})
