/* 골든 테스트 — 국민연금 기준소득월액 상·하한 기간 스케줄 (lib/krInsuranceRates.ts)
   근거: 국민연금법 시행령 §5, 보건복지부 고시 — 매년 7월 1일 ~ 다음 해 6월 30일 적용.
   실행: npm test (또는 npx tsx --test tests/golden/pensionBase.test.mts) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  PENSION_BASE_SCHEDULE, PENSION_BASE_CURRENT,
  pensionBaseAt, previousPensionBase, pensionBaseUntil, pensionBasePeriodLabel,
  clampPensionBase, toYearMonth,
} from '../../lib/krInsuranceRates'
import { todayStr } from '../../lib/date'
import { pensionBaseForYear } from '../../app/tools/finance/4-insurance/fourInsuranceUtils'

const P2024 = { min: 390_000, max: 6_170_000 }
const P2025 = { min: 400_000, max: 6_370_000 }
const P2026 = { min: 410_000, max: 6_590_000 }
const pick = (p: { min: number; max: number }) => ({ min: p.min, max: p.max })

describe('스케줄 위생', () => {
  test('from 오름차순 · 모두 7월 시작 · min<max · 매년 증가', () => {
    for (let i = 0; i < PENSION_BASE_SCHEDULE.length; i++) {
      const p = PENSION_BASE_SCHEDULE[i]
      assert.match(p.from, /^\d{4}-07$/)
      assert.ok(p.min < p.max)
      if (i > 0) {
        const prev = PENSION_BASE_SCHEDULE[i - 1]
        assert.ok(prev.from < p.from)
        assert.ok(prev.min <= p.min && prev.max <= p.max)
      }
    }
  })
  test('고시값 3개 구간', () => {
    assert.deepEqual(PENSION_BASE_SCHEDULE.map(p => [p.from, p.min, p.max]), [
      ['2024-07', 390_000, 6_170_000],
      ['2025-07', 400_000, 6_370_000],
      ['2026-07', 410_000, 6_590_000],
    ])
  })
})

describe('pensionBaseAt — 6월→7월 경계', () => {
  const cases: [string, { min: number; max: number }][] = [
    ['2024-07', P2024], ['2025-06', P2024], ['2025-06-30', P2024],
    ['2025-07', P2025], ['2025-07-01', P2025], ['2026-01', P2025], ['2026-06-30', P2025],
    ['2026-07-01', P2026], ['2026-09-26', P2026], ['2027-06', P2026],
  ]
  for (const [when, want] of cases) {
    test(when, () => assert.deepEqual(pick(pensionBaseAt(when)), want))
  }
  test('스케줄 이전은 가장 오래된 구간', () => assert.deepEqual(pick(pensionBaseAt('2020-01')), P2024))
  test('Date(기기 로컬) — 2026-06-30 23:59 vs 2026-07-01 00:00', () => {
    assert.deepEqual(pick(pensionBaseAt(new Date(2026, 5, 30, 23, 59))), P2025)
    assert.deepEqual(pick(pensionBaseAt(new Date(2026, 6, 1, 0, 0))), P2026)
  })
  test('{year, month}', () => {
    assert.deepEqual(pick(pensionBaseAt({ year: 2026, month: 6 })), P2025)
    assert.deepEqual(pick(pensionBaseAt({ year: 2026, month: 7 })), P2026)
  })
  test('참조 안정 (같은 구간이면 같은 객체)', () => {
    assert.equal(pensionBaseAt('2026-07'), pensionBaseAt('2027-01-15'))
  })
  test('잘못된 입력은 RangeError', () => {
    assert.throws(() => pensionBaseAt('abc'), RangeError)
    assert.throws(() => pensionBaseAt({ year: 2026, month: 13 }), RangeError)
    assert.throws(() => toYearMonth({ year: 2026, month: 0 }), RangeError)
  })
  test('PENSION_BASE_CURRENT = 오늘(todayStr) 구간', () => {
    assert.equal(PENSION_BASE_CURRENT, pensionBaseAt(todayStr()))
  })
})

describe('clampPensionBase — 39만/40만/41만 · 617만/637만/659만', () => {
  const p24 = pensionBaseAt('2024-07'), p25 = pensionBaseAt('2025-07'), p26 = pensionBaseAt('2026-07')
  test('하한', () => {
    assert.equal(clampPensionBase(389_999, p24), 390_000)
    assert.equal(clampPensionBase(390_000, p24), 390_000)
    assert.equal(clampPensionBase(390_000, p25), 400_000)
    assert.equal(clampPensionBase(400_000, p25), 400_000)
    assert.equal(clampPensionBase(400_000, p26), 410_000)
    assert.equal(clampPensionBase(410_000, p26), 410_000)
    assert.equal(clampPensionBase(410_001, p26), 410_001)
  })
  test('상한', () => {
    assert.equal(clampPensionBase(6_170_000, p24), 6_170_000)
    assert.equal(clampPensionBase(6_370_000, p24), 6_170_000)
    assert.equal(clampPensionBase(6_370_000, p25), 6_370_000)
    assert.equal(clampPensionBase(6_590_000, p25), 6_370_000)
    assert.equal(clampPensionBase(6_590_000, p26), 6_590_000)
    assert.equal(clampPensionBase(6_590_001, p26), 6_590_000)
  })
  test('소득 0·음수·NaN → 0 (미부과)', () => {
    assert.equal(clampPensionBase(0, p26), 0)
    assert.equal(clampPensionBase(-1, p26), 0)
    assert.equal(clampPensionBase(Number.NaN, p26), 0)
  })
})

describe('표기 헬퍼', () => {
  test('적용기간 라벨', () => {
    assert.equal(pensionBasePeriodLabel(pensionBaseAt('2026-07')), '2026년 7월~2027년 6월')
    assert.equal(pensionBasePeriodLabel(pensionBaseAt('2025-07')), '2025년 7월~2026년 6월')
  })
  test('종료월 = 다음 구간 시작 전월', () => {
    for (let i = 0; i + 1 < PENSION_BASE_SCHEDULE.length; i++) {
      const next = PENSION_BASE_SCHEDULE[i + 1]
      const [y, m] = next.from.split('-').map(Number)
      const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
      assert.equal(pensionBaseUntil(PENSION_BASE_SCHEDULE[i]), prevMonth)
    }
  })
  test('직전 구간', () => {
    assert.deepEqual(pick(previousPensionBase(pensionBaseAt('2026-07'))!), P2025)
    assert.equal(previousPensionBase(PENSION_BASE_SCHEDULE[0]), null)
  })
})

describe('4-insurance 연도 토글 → 구간 (pensionBaseForYear)', () => {
  test('올해: 기준일 구간', () => {
    assert.deepEqual(pick(pensionBaseForYear(2026, '2026-06-30')), P2025)
    assert.deepEqual(pick(pensionBaseForYear(2026, '2026-07-01')), P2026)
    assert.deepEqual(pick(pensionBaseForYear(2026, '2026-09-26')), P2026)
  })
  test('지난해: 그 해 12월 구간', () => {
    assert.deepEqual(pick(pensionBaseForYear(2025, '2026-09-26')), P2025)
    assert.deepEqual(pick(pensionBaseForYear(2025, '2025-03-01')), P2024)
  })
})
