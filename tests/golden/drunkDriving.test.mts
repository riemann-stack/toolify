/* 골든 테스트 — 음주운전 기준·처벌 (lib/krDrunkDriving.ts, health/blood-alcohol 재수출)
   근거: 도로교통법 제44조④(0.03% 이상), 제93조(0.08% 이상 취소), 제148조의2(벌칙, 2019.6.25 시행 구간),
         제82조②(결격기간), 시행령 별표 8(자전거·PM 범칙금). 기준일 2026-09.
   · 초범 ③: 0.2%↑ 2~5년/1천만~2천만 · 0.08~0.2% 1~2년/500만~1천만 · 0.03~0.08% 1년↓/500만↓
   · 측정 거부 ②: 1~5년 / 500만~2천만
   · 재위반(10년 내) ①: 0.03~0.2% 1~5년/500만~2천만 · 0.2%↑ 2~6년/1천만~3천만 · 측정 거부 1~6년/500만~3천만 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import * as lib from '../../lib/krDrunkDriving'
import * as bac from '../../app/tools/health/blood-alcohol/bacUtils'

describe('BAC 임계값', () => {
  test('0.03 정지 / 0.08 취소 / 0.2 가중', () => {
    assert.deepEqual(lib.BAC_THRESHOLDS, { GENERAL_SUSPEND: 0.03, REVOKE: 0.08, AGGRAVATED: 0.2 })
    assert.equal(lib.DRUNK_DRIVING_LAW_SINCE, '2019-06-25')
  })
  test('blood-alcohol 다음날 아침 판정: 경계값은 이상(≥) 기준', () => {
    const status = (peakBAC: number) => bac.calcTomorrowMorning({
      drinkEndH: 7, drinkEndM: 0, drinkEndDayOffset: 0, morningH: 7, morningM: 0, peakBAC, decayRate: 0.015,
    }).status
    assert.equal(status(0.08), 'revoke')
    assert.equal(status(0.0799), 'suspend')
    assert.equal(status(0.03), 'suspend')
    assert.equal(status(0.0299), 'detected')
    assert.equal(status(0), 'safe')
  })
  test('해소 시각: 0.1% → 0.08%까지 (0.02 ÷ 0.015/h) = 80분, 0.03%까지 280분', () => {
    const r = bac.calcTomorrowMorning({ drinkEndH: 0, drinkEndM: 0, drinkEndDayOffset: 0, morningH: 7, morningM: 0, peakBAC: 0.1, decayRate: 0.015 })
    assert.ok(Math.abs(r.revokeClearMin - 80) < 1e-6)
    assert.ok(Math.abs(r.suspendClearMin - 280) < 1e-6)
  })
})

describe('처벌 표 (제148조의2)', () => {
  test('초범·측정 거부 형량 구간', () => {
    const byId = lib.DRUNK_DRIVING_PENALTY_BY_ID
    assert.deepEqual([byId.suspend.prisonYears, byId.suspend.fineWon], [[0, 1], [0, 5_000_000]])
    assert.deepEqual([byId.revoke.prisonYears, byId.revoke.fineWon], [[1, 2], [5_000_000, 10_000_000]])
    assert.deepEqual([byId.aggravated.prisonYears, byId.aggravated.fineWon], [[2, 5], [10_000_000, 20_000_000]])
    assert.deepEqual([byId.refusal.prisonYears, byId.refusal.fineWon], [[1, 5], [5_000_000, 20_000_000]])
    assert.deepEqual(lib.DRUNK_DRIVING_MAX_PENALTY, { prisonYears: 5, fineWon: 20_000_000 })
  })
  test('화면 문구 (정식·약식)', () => {
    const byId = lib.DRUNK_DRIVING_PENALTY_BY_ID
    assert.equal(byId.suspend.penalty, '벌점 100점(정지 100일), 1년 이하 징역 또는 500만원 이하 벌금')
    assert.equal(byId.revoke.penalty, '1년 이상 2년 이하 징역 또는 500만~1,000만원 벌금')
    assert.equal(byId.aggravated.penalty, '2년 이상 5년 이하 징역 또는 1,000만~2,000만원 벌금')
    assert.equal(lib.fmtPenaltyShort(byId.refusal), '1~5년 / 500만~2,000만원')
    assert.equal(lib.fmtPenaltyShort(byId.suspend, ' 징역 또는 '), '1년 이하 징역 또는 500만원 이하')
  })
  test('재위반 가중 (10년 내)', () => {
    assert.equal(lib.DRUNK_DRIVING_REPEAT_WINDOW_YEARS, 10)
    assert.deepEqual(lib.DRUNK_DRIVING_REPEAT_PENALTIES.map(p => [p.label, p.prisonYears, p.fineWon]), [
      ['0.03~0.2%', [1, 5], [5_000_000, 20_000_000]],
      ['0.2% 이상', [2, 6], [10_000_000, 30_000_000]],
      ['측정 거부', [1, 6], [5_000_000, 30_000_000]],
    ])
  })
  test('면허 결격기간 (제82조②)', () => {
    assert.deepEqual(lib.LICENSE_DISQUALIFICATION_YEARS, { firstRevoke: 1, repeat: 2, accident: 2, repeatAccident: 3, fatal: 5 })
  })
  test('자전거·PM 범칙금 (시행령 별표 8)', () => {
    assert.deepEqual(lib.BICYCLE_PM_FINES, {
      bicycle: { since: '2018-09-28', fine: 30_000, refusal: 100_000 },
      pm: { since: '2021-05-13', fine: 100_000, refusal: 130_000 },
    })
  })
})

describe('표기 헬퍼', () => {
  test('만원 표기', () => {
    assert.equal(lib.fmtManwon(20_000_000), '2,000만')
    assert.equal(lib.fmtManwon(30_000), '3만')
    assert.equal(lib.fmtManwonWon(130_000), '13만원')
    assert.equal(lib.fmtManwonWon(100_000_000), '10,000만원')
  })
  test('법령 날짜 (Date 파싱 없음)', () => {
    assert.equal(lib.fmtLawDate('2018-09-28'), '2018년 9월 28일')
    assert.equal(lib.fmtLawDate('2018-09-28', 'dot'), '2018.9.28')
    assert.equal(lib.fmtLawDate('2021-05-13', 'ym'), '2021년 5월')
  })
})

describe('bacUtils 재수출 = lib 값', () => {
  test('값 동일 (tsx가 CJS/ESM 인스턴스를 따로 만들 수 있어 참조 대신 값 비교)', () => {
    for (const k of [
      'BAC_THRESHOLDS', 'DRUNK_DRIVING_PENALTIES', 'DRUNK_DRIVING_REPEAT_PENALTIES', 'LICENSE_DISQUALIFICATION_YEARS',
      'BICYCLE_PM_FINES', 'DRUNK_DRIVING_MAX_PENALTY', 'DRUNK_DRIVING_LAW_SINCE', 'DRUNK_DRIVING_REPEAT_WINDOW_YEARS',
    ] as const) {
      assert.deepEqual(bac[k], lib[k], k)
    }
    assert.equal(bac.fmtPenaltyLong(lib.DRUNK_DRIVING_PENALTY_BY_ID.revoke), lib.fmtPenaltyLong(lib.DRUNK_DRIVING_PENALTY_BY_ID.revoke))
  })
})
