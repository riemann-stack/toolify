/* 골든 테스트 — 퇴직금 평균임금 산정기간 (app/tools/finance/severance/severanceUtils.ts calcThreeMonthPeriod)
   근거: 근로기준법 §2①6(산정 사유 발생일 이전 3개월) · 민법 §157·§160(역산 — 해당일이 없으면 그 달 말일)
   입력은 퇴사일(마지막 근무일), 산정 사유 발생일(퇴직일)은 그다음 날.
   월말 퇴사는 직전 3개 역월 전체 — 예전 구현은 4/30 퇴사를 1/31부터 잡아 분모가 하루 컸다.
   실행: npx tsx --test tests/golden/severancePeriod.test.mts */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calcThreeMonthPeriod, parseDate, isoDate } from '../../app/tools/finance/severance/severanceUtils'

const period = (exit: string) => {
  const r = calcThreeMonthPeriod(parseDate(exit))
  return [isoDate(r.start), isoDate(r.end), r.days]
}

describe('평균임금 산정기간 — 월말 퇴사', () => {
  test('4/30 퇴사 → 2/1~4/30 (89일, 평년)', () => assert.deepEqual(period('2026-04-30'), ['2026-02-01', '2026-04-30', 89]))
  test('6/30 퇴사 → 4/1~6/30 (91일)', () => assert.deepEqual(period('2026-06-30'), ['2026-04-01', '2026-06-30', 91]))
  test('11/30 퇴사 → 9/1~11/30 (91일)', () => assert.deepEqual(period('2026-11-30'), ['2026-09-01', '2026-11-30', 91]))
  test('2/28 퇴사(평년) → 전년 12/1~2/28 (90일)', () => assert.deepEqual(period('2026-02-28'), ['2025-12-01', '2026-02-28', 90]))
  test('2/29 퇴사(윤년) → 전년 12/1~2/29 (91일)', () => assert.deepEqual(period('2024-02-29'), ['2023-12-01', '2024-02-29', 91]))
  test('12/31 퇴사 → 10/1~12/31 (92일)', () => assert.deepEqual(period('2026-12-31'), ['2026-10-01', '2026-12-31', 92]))
  test('1/31 퇴사 → 전년 11/1~1/31 (92일)', () => assert.deepEqual(period('2026-01-31'), ['2025-11-01', '2026-01-31', 92]))
})

describe('평균임금 산정기간 — 월 중간 퇴사', () => {
  test('5/15 퇴사 → 2/16~5/15 (89일)', () => assert.deepEqual(period('2026-05-15'), ['2026-02-16', '2026-05-15', 89]))
  test('3/1 퇴사 → 전년 12/2~3/1 (90일)', () => assert.deepEqual(period('2026-03-01'), ['2025-12-02', '2026-03-01', 90]))
  test('5/30 퇴사 → 2/31이 없어 2월 말일 다음 날 3/1부터 (91일)', () => assert.deepEqual(period('2026-05-30'), ['2026-03-01', '2026-05-30', 91]))
})
