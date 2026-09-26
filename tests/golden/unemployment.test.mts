/* 골든 테스트 — 실업급여(구직급여) 1일액 (lib/krUnemployment.ts)
   근거: 고용보험법 §45①②(기초일액 = 평균임금, 통상임금보다 적으면 통상임금)·④(최저기초일액 = 이직일 당시 최저임금 × 1일 소정근로시간)
         ·⑤(기초일액 상한 = 시행령 §68), §46①(× 60%)·②(최저구직급여일액 = 최저기초일액 × 80%, 60% 산정액보다 우선).
         기초일액 상한 110,000원(2019.10~2025 이직) → 113,500원(2026.1.1 이후 이직, 2027 미고시라 유지).
         최저시급 2025 10,030 · 2026 10,320 · 2027 10,700원(2026.8.5 고시). 1일 통상임금 = 월 통상임금 × 8 ÷ 209.
   기대값은 모두 손계산(주석)이며, 코드 상수를 재사용해 기대값을 만들지 않는다.
   실행: npm test (또는 npx tsx --test tests/golden/unemployment.test.mts) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  UI_DAILY_FLOOR_2026, UI_DAILY_CAP_2026, UI_WAGE_DAILY_CAP_2026, uiDailyFloor, normWorkHours,
  uiDailyCapFor, uiWageCapFor, uiSeparationYear, UI_CAP_CONFIRMED_THROUGH,
  calcUnemployment, calcUnemploymentFromWages, avgDailyFromMonthly, avgDailyFromThreeMonths,
  ordinaryDailyFromMonthly, uiBaseDailyWage, uiMinWageYearFor,
} from '../../lib/krUnemployment'

/* 계산기 간편 모드 '전부 고정급' 경로: 평균임금일액 = 월급 × 3 ÷ days, 1일 통상임금 = 월급 × 8 ÷ 209 */
const fixedMonthly = (m: number, year: number, hours = 8, days = 90) =>
  calcUnemploymentFromWages({
    avgDaily: avgDailyFromMonthly(m, days), ordinaryDaily: ordinaryDailyFromMonthly(m),
    age: 35, disabled: false, totalMonths: 24, workHours: hours, year,
  })

describe('하한액 — 이직 연도 최저시급 × 1일 소정근로시간 × 80%', () => {
  test('2026 8시간 = 10,320 × 8 × 0.8 = 66,048원 (기존 상수·기본 인자와 동일)', () => {
    assert.equal(UI_DAILY_FLOOR_2026, 66_048)
    assert.equal(uiDailyFloor(8), 66_048)
    assert.equal(uiDailyFloor(), 66_048)
    assert.equal(uiDailyFloor(8, 2026), 66_048)
  })
  test('2026 4시간 = 33,024원 · 1시간 = 8,256원', () => {
    assert.equal(uiDailyFloor(4), 33_024) // 10,320 × 4 × 0.8
    assert.equal(uiDailyFloor(1), 8_256)  // 10,320 × 1 × 0.8
  })
  test('2027 이직자 8시간 = 10,700 × 8 × 0.8 = 68,480원 · 4시간 = 34,240원', () => {
    assert.equal(uiDailyFloor(8, 2027), 68_480)
    assert.equal(uiDailyFloor(4, 2027), 34_240)
  })
  test('2025 이직자 8시간 = 10,030 × 8 × 0.8 = 64,192원 (2025 고시 하한과 같음)', () => {
    assert.equal(uiDailyFloor(8, 2025), 64_192)
  })
  test('범위 밖·NaN 정규화 (8 초과 → 8, 1 미만 → 1, NaN → 8 · NaN 연도 → 2026)', () => {
    assert.equal(normWorkHours(10), 8)
    assert.equal(normWorkHours(0), 1)
    assert.equal(normWorkHours(Number.NaN), 8)
    assert.equal(uiDailyFloor(8, Number.NaN), 66_048)
  })
})

describe('상한 — 기초일액 상한(시행령 §68) 구간표, 1일 상한 = × 60%', () => {
  test('2025 이직: 110,000 → 66,000원 · 2026 이직: 113,500 → 68,100원', () => {
    assert.equal(uiWageCapFor(2025), 110_000)
    assert.equal(uiDailyCapFor(2025), 66_000)
    assert.equal(uiWageCapFor(2026), 113_500)
    assert.equal(uiDailyCapFor(2026), 68_100)
    assert.equal(UI_WAGE_DAILY_CAP_2026, 113_500)
    assert.equal(UI_DAILY_CAP_2026, 68_100)
  })
  test('2027 상한은 미고시(2026-09 기준) → 2026 값 68,100원 유지, 확인 연도는 2026', () => {
    assert.equal(uiDailyCapFor(2027), 68_100)
    assert.equal(UI_CAP_CONFIRMED_THROUGH, 2026)
  })
})

describe('calcUnemployment — 상한 먼저, 하한 나중(하한 우선)', () => {
  test('단시간(4시간) 월 110만원 · 35세 · 1~3년 → 하한 33,024 × 150일 = 4,953,600', () => {
    // 평균임금일액 3,300,000 ÷ 92 = 35,869.6 → × 0.6 = 21,522 < 33,024
    const r = calcUnemployment(avgDailyFromMonthly(1_100_000, 92), 35, false, 24, 4)
    assert.equal(r.capped, 'lower')
    assert.equal(r.dailyFloor, 33_024)
    assert.equal(r.dailyBenefit, 33_024)
    assert.equal(r.totalBenefit, 4_953_600)
  })
  test('시간·연도 인자 생략 = 8시간·2026 (기존 호출 호환) — 평균임금 100,000 × 0.6 = 60,000 → 하한 66,048', () => {
    const r = calcUnemployment(avgDailyFromMonthly(3_000_000, 90), 35, false, 24)
    assert.equal(r.workHours, 8)
    assert.equal(r.year, 2026)
    assert.equal(r.dailyBenefit, 66_048)
    assert.equal(r.totalBenefit, 9_907_200) // 66,048 × 150
  })
  test('상한 68,100원은 근로시간과 무관 (4시간·기초일액 200,000 → 상한) · 50세+ 10년+ 270일', () => {
    const r = calcUnemployment(200_000, 55, false, 130, 4)
    assert.equal(r.capped, 'upper')
    assert.equal(r.dailyBenefit, 68_100)
    assert.equal(r.benefitDays, 270)
  })
  test('하한 경계 — 60%가 하한과 같으면 lower, 초과면 none (4시간 하한 33,024)', () => {
    assert.equal(calcUnemployment(55_040, 30, false, 6, 4).capped, 'lower') // 55,040 × 0.6 = 33,024
    assert.equal(calcUnemployment(56_707, 30, false, 6, 4).capped, 'none')  // 56,707 × 0.6 = 34,024.2 → 34,024
  })
  test('상한 경계 — 기초일액 113,500 정확히: 60% = 68,100 → upper, 기초일액 상한 초과는 아님', () => {
    const r = calcUnemployment(113_500, 35, false, 24)
    assert.equal(r.capped, 'upper')
    assert.equal(r.wageCapped, false)
    assert.equal(r.dailyBenefit, 68_100)
    const r2 = calcUnemployment(113_499, 35, false, 24) // 68,099.4 → 68,099 → 그대로
    assert.equal(r2.capped, 'none')
    assert.equal(r2.dailyBenefit, 68_099)
  })
  test('2027 이직 고소득(기초일액 200,000): 상한 68,100 적용 뒤 하한 68,480이 우선 → 68,480 · lower', () => {
    const r = calcUnemployment(200_000, 35, false, 24, 8, 2027)
    assert.equal(r.wageCapped, true)
    assert.equal(r.rawDaily, 68_100)    // 113,500 × 0.6
    assert.equal(r.dailyCap, 68_100)
    assert.equal(r.dailyFloor, 68_480)
    assert.equal(r.floorOverCap, true)
    assert.equal(r.capped, 'lower')
    assert.equal(r.dailyBenefit, 68_480)
    assert.equal(r.totalBenefit, 10_272_000) // 68,480 × 150
  })
  test('2027 이직 단시간 4시간: 하한 34,240 < 상한 → 역전 없음, 고소득이면 상한 68,100', () => {
    const r = calcUnemployment(200_000, 35, false, 24, 4, 2027)
    assert.equal(r.floorOverCap, false)
    assert.equal(r.capped, 'upper')
    assert.equal(r.dailyBenefit, 68_100)
  })
  test('NaN·음수 기초일액 → 0 취급 → 하한', () => {
    assert.equal(calcUnemployment(Number.NaN, 35, false, 24).dailyBenefit, 66_048)
    assert.equal(calcUnemployment(-5, 35, false, 24).avgDailyWageRaw, 0)
  })
})

describe('기초일액 — 고용보험법 §45② 통상임금 비교', () => {
  test('월 300만 고정급: 평균임금일액 100,000 < 1일 통상임금 114,833 → 통상임금 → 기초일액 상한 113,500 → 1일 상한 68,100', () => {
    const avg = avgDailyFromMonthly(3_000_000, 90)
    const ord = ordinaryDailyFromMonthly(3_000_000) // 3,000,000 × 8 ÷ 209 = 114,832.5
    assert.equal(Math.round(ord), 114_833)
    const b = uiBaseDailyWage(avg, ord)
    assert.equal(b.ordinaryApplied, true)
    const r = calcUnemployment(b.base, 35, false, 24)
    assert.equal(r.wageCapped, true)
    assert.equal(r.dailyBenefit, 68_100)
    assert.equal(r.totalBenefit, 10_215_000) // 68,100 × 150
  })
  test('고정급 월급제는 92일 분모여도 통상임금이 항상 크다 (8/209 > 3/92)', () => {
    for (const m of [1_000_000, 2_156_880, 3_000_000, 9_000_000]) {
      assert.equal(uiBaseDailyWage(avgDailyFromMonthly(m, 92), ordinaryDailyFromMonthly(m)).ordinaryApplied, true)
    }
  })
  test('60% 그대로 구간 경계 — 월 287만 하한, 288만 그대로, 297만 상한 (2026)', () => {
    // 287만 × 8 ÷ 209 = 109,856.5 × 0.6 = 65,914 < 66,048 · 288만 → 110,239.2 × 0.6 = 66,144 · 297만 → 113,684 → 상한
    assert.equal(fixedMonthly(2_870_000, 2026).capped, 'lower')
    assert.equal(fixedMonthly(2_880_000, 2026).capped, 'none')
    assert.equal(fixedMonthly(2_880_000, 2026).dailyBenefit, 66_144)
    assert.equal(fixedMonthly(2_970_000, 2026).capped, 'upper')
    // 페이지 표시 구간(하한 올림·상한 내림) 288만~296만의 끝값이 실제로 구간 안인지:
    // 296만 × 8 ÷ 209 = 113,301.4 × 0.6 = 67,980.9 → 67,981 < 68,100 → 그대로
    assert.equal(fixedMonthly(2_960_000, 2026).capped, 'none')
    assert.equal(fixedMonthly(2_960_000, 2026).dailyBenefit, 67_981)
  })
  test('평균임금일액만 쓸 때(통상임금 0) 60% 그대로 구간 — 월 331만~340만 (90일)', () => {
    const avgOnly = (m: number) => calcUnemploymentFromWages({ avgDaily: avgDailyFromMonthly(m), age: 35, disabled: false, totalMonths: 24, year: 2026 })
    // 330만 × 3 ÷ 90 = 110,000 × 0.6 = 66,000 < 66,048 → 하한
    assert.equal(avgOnly(3_300_000).capped, 'lower')
    // 331만 → 110,333.3 × 0.6 = 66,200 → 그대로
    assert.equal(avgOnly(3_310_000).capped, 'none')
    assert.equal(avgOnly(3_310_000).dailyBenefit, 66_200)
    // 340만 → 113,333.3 × 0.6 = 68,000 → 그대로
    assert.equal(avgOnly(3_400_000).capped, 'none')
    assert.equal(avgOnly(3_400_000).dailyBenefit, 68_000)
    // 341만 → 113,666.7 > 기초일액 상한 113,500 → 68,100 → 상한
    assert.equal(avgOnly(3_410_000).capped, 'upper')
  })
  test('통상임금 모르면(0) 평균임금일액 그대로 · NaN·음수 방어', () => {
    assert.deepEqual(uiBaseDailyWage(100_000, 0), { base: 100_000, ordinaryApplied: false })
    assert.deepEqual(uiBaseDailyWage(Number.NaN, 0), { base: 0, ordinaryApplied: false })
    assert.equal(ordinaryDailyFromMonthly(-1), 0)
  })
  test('변동급으로 평균임금 > 통상임금: 3개월 320·340·360만(92일) · 고정급 250만 → 평균임금 적용', () => {
    // 평균 10,200,000 ÷ 92 = 110,869.6 · 통상 2,500,000 × 8 ÷ 209 = 95,693.8 → 평균임금
    // 2026: × 0.6 = 66,521.7 → 66,522 (하한 66,048 < 66,522 < 상한 68,100) → 그대로
    const p = {
      avgDaily: avgDailyFromThreeMonths(3_200_000, 3_400_000, 3_600_000, 92),
      ordinaryDaily: ordinaryDailyFromMonthly(2_500_000),
      age: 35, disabled: false, totalMonths: 24,
    }
    const r26 = calcUnemploymentFromWages({ ...p, year: 2026 })
    assert.equal(r26.ordinaryApplied, false)
    assert.equal(r26.capped, 'none')
    assert.equal(r26.dailyBenefit, 66_522)
    assert.equal(r26.totalBenefit, 9_978_300) // 66,522 × 150
    // 2027: 66,522 < 하한 68,480 → 하한
    const r27 = calcUnemploymentFromWages({ ...p, year: 2027 })
    assert.equal(r27.capped, 'lower')
    assert.equal(r27.dailyBenefit, 68_480)
  })
})

describe('월급별 (고정급·8시간·35세·1~3년 150일) — 2026 vs 2027 이직', () => {
  // 1일 통상임금 = 월급 × 8 ÷ 209 가 기초일액(평균임금보다 큼)
  const cases: [number, number, 'lower' | 'upper' | 'none', number, 'lower' | 'upper' | 'none'][] = [
    // 월급,      2026 1일액, 2026 적용, 2027 1일액, 2027 적용
    [2_000_000, 66_048, 'lower', 68_480, 'lower'], // 76,555 × 0.6 = 45,933 → 하한
    [2_500_000, 66_048, 'lower', 68_480, 'lower'], // 95,694 × 0.6 = 57,416 → 하한
    [3_000_000, 68_100, 'upper', 68_480, 'lower'], // 114,833 → 상한 113,500 → 68,100 / 2027 하한 우선
    [4_000_000, 68_100, 'upper', 68_480, 'lower'], // 153,110 → 상한
    [7_000_000, 68_100, 'upper', 68_480, 'lower'], // 267,943 → 상한
  ]
  for (const [m, d26, c26, d27, c27] of cases) {
    test(`월 ${m / 10_000}만: 2026 ${d26} (${c26}) · 2027 ${d27} (${c27})`, () => {
      const r26 = fixedMonthly(m, 2026)
      assert.equal(r26.ordinaryApplied, true)
      assert.equal(r26.dailyBenefit, d26)
      assert.equal(r26.capped, c26)
      const r27 = fixedMonthly(m, 2027)
      assert.equal(r27.dailyBenefit, d27)
      assert.equal(r27.capped, c27)
    })
  }
  test('단시간 4시간 월 110만(92일): 통상 42,105 × 0.6 = 25,263 → 2026 하한 33,024 · 2027 하한 34,240', () => {
    assert.equal(fixedMonthly(1_100_000, 2026, 4, 92).dailyBenefit, 33_024)
    assert.equal(fixedMonthly(1_100_000, 2027, 4, 92).dailyBenefit, 34_240)
  })
  test('단시간 4시간 월 250만: 통상 95,694 × 0.6 = 57,416 → 하한·상한 사이 그대로 (2026·2027 동일)', () => {
    assert.equal(fixedMonthly(2_500_000, 2026, 4).dailyBenefit, 57_416)
    assert.equal(fixedMonthly(2_500_000, 2026, 4).capped, 'none')
    assert.equal(fixedMonthly(2_500_000, 2027, 4).dailyBenefit, 57_416)
  })
})

describe('이직일 → 연도 (문자열 분해, UTC 해석 없음)', () => {
  test('2026-12-31 이직 = 2026 → 월 300만 68,100 · 2027-01-01 이직 = 2027 → 68,480', () => {
    assert.equal(uiSeparationYear('2026-12-31'), 2026)
    assert.equal(uiSeparationYear('2027-01-01'), 2027)
    assert.equal(fixedMonthly(3_000_000, uiSeparationYear('2026-12-31')).dailyBenefit, 68_100)
    assert.equal(fixedMonthly(3_000_000, uiSeparationYear('2027-01-01')).dailyBenefit, 68_480)
    // 월 200만: 2026-12-31 하한 66,048 → 2027-01-01 하한 68,480
    assert.equal(fixedMonthly(2_000_000, uiSeparationYear('2026-12-31')).dailyBenefit, 66_048)
    assert.equal(fixedMonthly(2_000_000, uiSeparationYear('2027-01-01')).dailyBenefit, 68_480)
  })
  test('상한 고시 여부 — 2026 이직까지 확인(113,500), 2027은 미고시라 2026 값 유지 → capConfirmed=false (모든 근로시간)', () => {
    assert.equal(UI_CAP_CONFIRMED_THROUGH, 2026)
    assert.equal(calcUnemployment(200_000, 35, false, 24, 8, 2026).capConfirmed, true)
    assert.equal(calcUnemployment(200_000, 35, false, 24, 8, 2025).capConfirmed, true)
    // 2027 7시간: 하한 10,700 × 7 × 0.8 = 59,920 < 상한 68,100 → 역전 없이 상한 — 그래도 상한은 미고시
    const r7 = calcUnemployment(200_000, 35, false, 24, 7, 2027)
    assert.equal(r7.floorOverCap, false)
    assert.equal(r7.capped, 'upper')
    assert.equal(r7.capConfirmed, false)
    assert.equal(calcUnemployment(200_000, 35, false, 24, 4, 2027).capConfirmed, false)
  })
  test('하한에 쓰인 최저시급의 해 — 표(2025~2027) 밖은 가장 가까운 해 (화면 라벨용)', () => {
    assert.equal(uiMinWageYearFor(2024), 2025) // 2024 이직도 2025 최저시급 10,030원으로 계산 → 라벨도 2025
    assert.equal(uiMinWageYearFor(2026), 2026)
    assert.equal(uiMinWageYearFor(2028), 2027) // 2028 최저임금 미고시 → 2027 10,700원
    assert.equal(uiMinWageYearFor(Number.NaN), 2026)
    assert.equal(uiDailyFloor(8, 2024), uiDailyFloor(8, uiMinWageYearFor(2024))) // 64,192 — 라벨과 금액이 같은 해
  })
  test('형식 오류는 NaN (호출측 기본 연도로 대체)', () => {
    assert.ok(Number.isNaN(uiSeparationYear('')))
    assert.ok(Number.isNaN(uiSeparationYear('2026/12/31')))
  })
  test('2025 이직 월 300만: 통상 114,833 → 상한 110,000 → 66,000 (upper) · 월 200만 → 하한 64,192', () => {
    assert.equal(fixedMonthly(3_000_000, 2025).dailyBenefit, 66_000)
    assert.equal(fixedMonthly(3_000_000, 2025).capped, 'upper')
    assert.equal(fixedMonthly(2_000_000, 2025).dailyBenefit, 64_192)
  })
})
