/* 골든 테스트 — 실업급여(구직급여) 1일액 상·하한 (lib/krUnemployment.ts)
   근거: 고용보험법 §45④(최저기초일액 = 최저임금 × 이직 전 1일 소정근로시간)·§46②(하한 = 최저기초일액 × 80%),
         2026 상한 68,100원·임금일액 상한 113,500원, 최저시급 10,320원.
   실행: npm test (또는 npx tsx --test tests/golden/unemployment.test.mts) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  UI_DAILY_FLOOR_2026, UI_DAILY_CAP_2026, uiDailyFloor, normWorkHours,
  calcUnemployment, avgDailyFromMonthly,
} from '../../lib/krUnemployment'

describe('하한액 — 1일 소정근로시간 비례', () => {
  test('8시간 = 66,048원 (기존 상수와 동일)', () => {
    assert.equal(UI_DAILY_FLOOR_2026, 66_048)
    assert.equal(uiDailyFloor(8), 66_048)
    assert.equal(uiDailyFloor(), 66_048)
  })
  test('4시간 = 33,024원 · 1시간 = 8,256원', () => {
    assert.equal(uiDailyFloor(4), 33_024)
    assert.equal(uiDailyFloor(1), 8_256)
  })
  test('범위 밖·NaN 정규화 (8 초과 → 8, 1 미만 → 1, NaN → 8)', () => {
    assert.equal(normWorkHours(10), 8)
    assert.equal(normWorkHours(0), 1)
    assert.equal(normWorkHours(Number.NaN), 8)
  })
})

describe('calcUnemployment', () => {
  test('단시간(4시간) 월 110만원 · 35세 · 1~3년 → 하한 33,024 × 150일', () => {
    const r = calcUnemployment(avgDailyFromMonthly(1_100_000, 92), 35, false, 24, 4)
    assert.equal(r.capped, 'lower')
    assert.equal(r.dailyFloor, 33_024)
    assert.equal(r.dailyBenefit, 33_024)
    assert.equal(r.totalBenefit, 4_953_600)
  })
  test('시간 인자 생략 = 8시간 (기존 호출 호환)', () => {
    const r = calcUnemployment(avgDailyFromMonthly(3_000_000, 90), 35, false, 24)
    assert.equal(r.workHours, 8)
    assert.equal(r.dailyBenefit, 66_048)
    assert.equal(r.totalBenefit, 66_048 * 150)
  })
  test('상한 68,100원은 근로시간과 무관', () => {
    const r = calcUnemployment(200_000, 55, false, 130, 4)
    assert.equal(r.capped, 'upper')
    assert.equal(r.dailyBenefit, UI_DAILY_CAP_2026)
    assert.equal(r.benefitDays, 270)
  })
  test('하한 경계 — 60%가 하한과 같으면 lower, 초과면 none', () => {
    const f4 = uiDailyFloor(4)
    assert.equal(calcUnemployment(f4 / 0.6, 30, false, 6, 4).capped, 'lower')
    assert.equal(calcUnemployment((f4 + 1000) / 0.6, 30, false, 6, 4).capped, 'none')
  })
})
