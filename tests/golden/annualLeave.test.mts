/* 골든 테스트 — 연차 유급휴가 (lib/krLabor.ts)
   근거: 근로기준법 §60①(1년 80% 이상 → 15일) · §60②(1년 미만 1개월 개근 → 1일, 최대 11일) · §60④(3년 이상 매 2년 +1일, 25일 한도)
         · §60⑦(1년 미만분은 최초 1년 근로가 끝날 때 소멸) · §11(5명 미만 미적용)
         · 대법원 2021.10.14 선고 2021다227100(1년 계약직 최대 11일) · 고용노동부 행정해석 변경(2021.12.16, '다음 날' 근로관계 요건)
         · 근로기준과-5802(2009.12.31, 회계연도 기준이 입사일 기준보다 적으면 퇴직 시 차이 정산)
         · 민법 §157 단서·§160(기간 계산 — 해당일이 없으면 그 달 말일 만료)
   1일 통상임금 기본값: 2026 최저시급 10,320원 × 8시간 = 82,560원
   실행: npx tsx --test tests/golden/annualLeave.test.mts */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  annualLeaveDays, leaveCapYears, prorataLeave, dayAfterMonths, completedMonthsAt, completedYearsAt,
  parseYmd, fmtYmd, diffDays, calcAnnualLeave, leaveByYearsTable, dailyWageFromHourly, dailyWageFromMonthly,
  firstFiscalStartAfter, ANNUAL_LEAVE, type AnnualLeaveInput,
} from '../../lib/krLabor'
import { minHourlyWageFor, MONTHLY_WORK_HOURS } from '../../lib/krInsuranceRates'
import { extendGain, minWageEntry, ptLeaveHours, ptEquivDailyHours, grantLabel } from '../../app/tools/finance/annual-leave/annualLeaveUtils'

const D = (s: string) => {
  const d = parseYmd(s)
  if (!d) throw new Error(`bad date ${s}`)
  return d
}
const DAILY_2026 = 82_560 // 10,320 × 8

const base = (over: Partial<AnnualLeaveInput>): AnnualLeaveInput => ({
  hireDate: '2025-09-01', refDate: '2026-08-31', retire: false, basis: 'hire', fiscalStartMonth: 1, prorataRounding: 'r2',
  fivePlus: true, absentMonths: 0, attendance80: true, lowAttendanceMonths: 0, usedDays: 0, dailyWage: DAILY_2026, ...over,
})
function ok(input: AnnualLeaveInput) {
  const r = calcAnnualLeave(input)
  if (!r.ok) throw new Error(`calc failed: ${r.reason}`)
  return r
}

describe('§60①④ 근속연수별 일수 — 15 + ⌊(n−1)/2⌋, 한도 25', () => {
  test('1년 미만 0 · 1년 15 · 2년 15 · 3년 16(첫 가산) · 4년 16 · 5년 17', () => {
    assert.equal(annualLeaveDays(0), 0)
    assert.equal(annualLeaveDays(0.99), 0)
    assert.equal(annualLeaveDays(1), 15)
    assert.equal(annualLeaveDays(2), 15)   // 초과 연수 1년 → 매 2년 미달, 가산 0
    assert.equal(annualLeaveDays(3), 16)   // 초과 2년 → +1
    assert.equal(annualLeaveDays(4), 16)
    assert.equal(annualLeaveDays(5), 17)   // 초과 4년 → +2
  })
  test('20년 24 · 21년 25(한도 도달) · 22·30년 25 유지', () => {
    assert.equal(annualLeaveDays(20), 24)  // 15 + ⌊19/2⌋ = 15 + 9
    assert.equal(annualLeaveDays(21), 25)  // 15 + 10
    assert.equal(annualLeaveDays(22), 25)  // 15 + 10
    assert.equal(annualLeaveDays(23), 25)  // 15 + 11 = 26 → 한도 25
    assert.equal(annualLeaveDays(30), 25)
    assert.equal(leaveCapYears(), 21)      // 1 + 2 × (25 − 15)
  })
  test('발생표 — 누적은 1년 미만 11일 포함 (1년 26 · 2년 41 · 3년 57)', () => {
    const t = leaveByYearsTable(3)
    assert.deepEqual(t.map(r => r.cumulative), [11 + 15, 11 + 15 + 15, 11 + 15 + 15 + 16])
    assert.deepEqual(t.map(r => r.add), [0, 0, 1])
  })
})

describe('기간 계산 — 민법 §160 (해당일 없으면 그 달 말일 만료 → 다음 날 발생)', () => {
  test('1/31 입사 + 1개월 → 2/28 만료 → 3/1 발생 · + 2개월 → 3/31', () => {
    assert.equal(fmtYmd(dayAfterMonths(D('2025-01-31'), 1)), '2025-03-01')
    assert.equal(fmtYmd(dayAfterMonths(D('2025-01-31'), 2)), '2025-03-31')
    assert.equal(fmtYmd(dayAfterMonths(D('2024-01-31'), 1)), '2024-03-01') // 윤년 2/29까지 만료 → 3/1
  })
  test('2/29 입사 + 12개월 → 2025-02-28 만료 → 3/1 · + 48개월 → 2028-02-29', () => {
    assert.equal(fmtYmd(dayAfterMonths(D('2024-02-29'), 12)), '2025-03-01')
    assert.equal(fmtYmd(dayAfterMonths(D('2024-02-29'), 48)), '2028-02-29')
  })
  test('완성 개월·연수 — 발생일 당일 포함, 전날 미포함 (±1일 경계)', () => {
    assert.equal(completedMonthsAt(D('2025-09-01'), D('2025-09-30')), 0)
    assert.equal(completedMonthsAt(D('2025-09-01'), D('2025-10-01')), 1)
    assert.equal(completedYearsAt(D('2025-09-01'), D('2026-08-31')), 0) // 365일째
    assert.equal(completedYearsAt(D('2025-09-01'), D('2026-09-01')), 1) // 366일째
  })
  test('parseYmd — 실존하지 않는 날짜 거부, UTC 해석 없음', () => {
    assert.equal(parseYmd('2026-02-30'), null)
    assert.equal(parseYmd('2026-2-3'), null)
    assert.equal(D('2026-03-01').getDate(), 1)
    assert.equal(diffDays(D('2025-07-01'), D('2026-01-01')), 184)
  })
})

describe('1년 계약직과 1년 + 1일 — 대법원 2021다227100 · 행정해석 2021.12.16', () => {
  test('2025-09-01 입사, 2026-08-31 마지막 근무(365일) → 월 단위 11일만, 수당 11 × 82,560 = 908,160원', () => {
    const r = ok(base({ retire: true }))
    assert.equal(r.currentTotal, 11)
    assert.equal(r.grants.filter(g => g.kind === 'annual').length, 0)
    assert.equal(r.current[0].arise, '2025-10-01')          // 첫 1개월(9/1~9/30) 다음 날
    assert.equal(r.current[10].arise, '2026-08-01')         // 11번째 달(7/1~7/31) 다음 날
    assert.equal(r.current[0].expire, '2026-08-31')         // 최초 1년 근로가 끝나는 날(§60⑦)
    assert.equal(r.pay, 908_160)
  })
  test('하루 더(2026-09-01, 366일째) 근로관계 → 15일 발생, 직전 11일은 사용기한 경과(합계 최대 26일)', () => {
    const r = ok(base({ refDate: '2026-09-01', retire: true }))
    assert.equal(r.currentTotal, 15)
    assert.equal(r.pay, 15 * DAILY_2026)                    // 1,238,400
    assert.equal(r.lastExpired.reduce((a, g) => a + g.days, 0), 11)
    assert.equal(r.totalArisen, 26)
  })
  test('월 단위 경계 — 1개월 되는 날(9/30) 0일, 다음 날(10/1) 1일', () => {
    assert.equal(ok(base({ refDate: '2025-09-30' })).currentTotal, 0)
    assert.equal(ok(base({ refDate: '2025-10-01' })).currentTotal, 1)
  })
  test('결근한 달 2개 → 11 − 2 = 9일', () => {
    assert.equal(ok(base({ absentMonths: 2 })).currentTotal, 9)
  })
  test('결근 달 수는 지난 달 수를 넘지 못함 (3개월째에 5 입력 → 3개월 모두 제외 = 0일)', () => {
    assert.equal(ok(base({ refDate: '2025-12-01', absentMonths: 5 })).currentTotal, 0)
  })
})

describe('장기 근속·한도·출근율', () => {
  test('2015-03-02 입사, 2026-09-26 기준 → 계속근로 11년 → 15 + ⌊10/2⌋ = 20일', () => {
    const r = ok(base({ hireDate: '2015-03-02', refDate: '2026-09-26' }))
    assert.equal(r.completedYears, 11)
    assert.equal(r.currentTotal, 20)
    assert.equal(r.current[0].arise, '2026-03-02')
    assert.equal(r.current[0].expire, '2027-03-01')
  })
  test('2000-01-03 입사, 2026-09-26 기준 26년 → 한도 25일', () => {
    assert.equal(ok(base({ hireDate: '2000-01-03', refDate: '2026-09-26' })).currentTotal, 25)
  })
  test('출근율 80% 미만 — 근속 3년 16일 대신 개근한 7개월 × 1일 = 7일 (§60②)', () => {
    const r = ok(base({ hireDate: '2023-03-01', refDate: '2026-03-01', attendance80: false, lowAttendanceMonths: 7 }))
    assert.equal(r.currentTotal, 7)
    assert.equal(r.lowApplied, true)
    assert.equal(r.current[0].kind, 'lowAttendance')
    assert.equal(grantLabel(r.current[0]), '3년 근속 연차 (출근율 80% 미만)') // 'n년차' 대신 완성 연수
  })
  test('사용 일수 — 반차 포함 3.5일 사용 → 잔여 16 − 3.5 = 12.5 · 발생보다 많이 넣으면 발생일수로 제한', () => {
    const r = ok(base({ hireDate: '2023-03-01', refDate: '2026-06-01', usedDays: 3.5 }))
    assert.equal(r.remaining, 12.5)
    assert.equal(r.pay, Math.floor(12.5 * DAILY_2026))  // 1,032,000
    const over = ok(base({ hireDate: '2023-03-01', refDate: '2026-06-01', usedDays: 40 }))
    assert.equal(over.used, 16)
    assert.equal(over.remaining, 0)
  })
  test('상시 5명 미만 → 법정 연차 0일 (§11·시행령 별표1)', () => {
    const r = ok(base({ fivePlus: false }))
    assert.equal(r.applicable, false)
    assert.equal(r.currentTotal, 0)
    assert.equal(r.pay, 0)
  })
  test('입력 오류 — 없는 날짜·기준일이 입사일보다 앞', () => {
    assert.deepEqual(calcAnnualLeave(base({ hireDate: '2026-02-30' })), { ok: false, reason: 'hire' })
    assert.deepEqual(calcAnnualLeave(base({ refDate: '2025-08-31' })), { ok: false, reason: 'order' })
  })
})

describe('회계연도 기준 — 비례 연차와 퇴직 시 정산(근로기준과-5802)', () => {
  test('비례 연차 = 15 × 재직일수 ÷ 365 (소수 둘째 자리 / 올림)', () => {
    assert.equal(prorataLeave(184), 7.56)            // 15 × 184 / 365 = 7.5616…
    assert.equal(prorataLeave(184, 'ceil'), 8)
    assert.equal(prorataLeave(274), 11.26)           // 15 × 274 / 365 = 11.2602…
    assert.equal(prorataLeave(1), 0.04)              // 0.0410…
    assert.equal(prorataLeave(365), 15)
    assert.equal(prorataLeave(366), 15)              // 15일 한도
    assert.equal(prorataLeave(0), 0)
  })
  test('2025-07-01 입사·1월 시작 → 2026-01-01에 7.56일 + 월 단위 연차 병행', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2026-03-15', basis: 'fiscal' }))
    const pr = r.current.find(g => g.kind === 'prorata')
    assert.ok(pr)
    assert.equal(pr.days, 7.56)
    assert.equal(pr.seq, 184)
    assert.equal(pr.expire, '2026-12-31')
    assert.equal(r.current.filter(g => g.kind === 'monthly').length, 8) // 8/1 … 3/1
    assert.equal(r.currentTotal, 15.56)
  })
  test('2026-12-31 퇴사·5일 사용 → 회계 18.56 vs 입사일 26 → 차이 7.44일 + 미사용 2.56일 = 10일 × 82,560 = 825,600원', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2026-12-31', basis: 'fiscal', retire: true, usedDays: 5 }))
    assert.ok(r.compare)
    assert.equal(r.compare.fiscalTotal, 18.56)       // 11 + 7.56
    assert.equal(r.compare.hireTotal, 26)            // 11 + 15(2026-07-01)
    assert.equal(r.compare.extraDays, 7.44)
    assert.equal(r.remaining, 2.56)
    assert.equal(r.payDays, 10)
    assert.equal(r.pay, 825_600)
  })
  test('2027-01-01까지 근로관계 → 회계 33.56 > 입사일 26 — 유리한 회계연도 기준 유지(추가 정산 0)', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2027-01-01', basis: 'fiscal', retire: true }))
    assert.ok(r.compare)
    assert.equal(r.compare.fiscalTotal, 33.56)       // 11 + 7.56 + 15
    assert.equal(r.compare.extraDays, 0)
    assert.equal(r.compare.fiscalAdvantage, 7.56)
    assert.equal(r.currentTotal, 15)
  })
  test('가산 — 회계연도 부여일 현재 계속근로연수로 (2025-07-01 입사 → 2029-01-01에 3년 → 16일)', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2029-01-01', basis: 'fiscal' }))
    assert.equal(r.currentTotal, 16)
    const r2 = ok(base({ hireDate: '2025-07-01', refDate: '2028-12-31', basis: 'fiscal' }))
    assert.equal(r2.currentTotal, 15)                // 2028-01-01 부여분(2년)
  })
  test('입사일이 곧 회계연도 시작일이면 비례 없이 1년 후 15일 (입사일 기준과 같음)', () => {
    assert.equal(fmtYmd(firstFiscalStartAfter(D('2025-01-01'), 1)), '2026-01-01')
    const r = ok(base({ hireDate: '2025-01-01', refDate: '2026-01-01', basis: 'fiscal' }))
    assert.equal(r.grants.some(g => g.kind === 'prorata'), false)
    assert.equal(r.currentTotal, 15)
    assert.ok(r.compare)
    assert.equal(r.compare.extraDays, 0)
  })
  test('4월 시작 회계연도 — 2025-07-01 입사 → 2026-04-01까지 274일 → 11.26일', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2026-04-01', basis: 'fiscal', fiscalStartMonth: 4 }))
    assert.equal(r.current.find(g => g.kind === 'prorata')?.days, 11.26)
  })
  test('첫해 출근율 80% 미만 → 비례 연차 0 (월 단위는 유지), 비교 생략', () => {
    const r = ok(base({ hireDate: '2025-07-01', refDate: '2026-03-15', basis: 'fiscal', attendance80: false }))
    assert.equal(r.current.find(g => g.kind === 'prorata')?.days, 0)
    assert.equal(r.currentTotal, 8)
    assert.equal(r.compare, null)
  })
})

describe('1일 통상임금', () => {
  test('2026 최저시급 × 8시간 = 82,560원 · 월 환산액 ÷ 209 × 8 도 같다', () => {
    assert.equal(minHourlyWageFor(2026), 10_320)
    assert.equal(dailyWageFromHourly(minHourlyWageFor(2026)), DAILY_2026)
    assert.equal(dailyWageFromMonthly(10_320 * MONTHLY_WORK_HOURS, MONTHLY_WORK_HOURS), DAILY_2026) // 2,156,880 ÷ 209 × 8
    assert.equal(dailyWageFromHourly(10_320, 4), 41_280)  // 단시간 4시간
    assert.equal(dailyWageFromMonthly(3_000_000, 209), 114_832) // 3,000,000 × 8 / 209 = 114,832.5… → 버림
    assert.equal(dailyWageFromHourly(0), 0)
  })
  test('월 통상임금 방식은 1일 시간과 무관하게 ÷ 209 × 8 — 단시간(주 20시간) 월급도 시급 × 4시간과 같다', () => {
    // 주 20시간(1일 4시간·주 5일) 최저임금 월급 = 10,320 × 209 × 20/40 = 10,320 × 104.5 = 1,078,440원
    // 1일분 = 1,078,440 × 8 ÷ 209 = 41,280 = 10,320 × 4 (예전 코드: ÷ 209 × 4 = 20,640 — 절반으로 과소)
    assert.equal(dailyWageFromMonthly(1_078_440, MONTHLY_WORK_HOURS), 41_280)
    assert.equal(dailyWageFromMonthly(1_078_440, MONTHLY_WORK_HOURS), dailyWageFromHourly(10_320, 4))
  })
  test('단시간 [별표 2] — 주 3일 × 8시간(주 24시간): 15 × 24/40 × 8 = 72시간 = 환산 4.8시간 × 15일', () => {
    assert.equal(ptLeaveHours(15, 24), 72)
    assert.equal(ptLeaveHours(15, 20), 60)                         // 가이드 예: 주 20시간 → 60시간
    assert.equal(ptEquivDailyHours(24), 4.8)                       // 24 × 8 ÷ 40
    assert.equal(dailyWageFromHourly(10_320, 4.8), 49_536)         // 10,320 × 4.8
    assert.equal(15 * dailyWageFromHourly(10_320, 4.8), 743_040)   // = 72 × 10,320
    assert.equal(15 * dailyWageFromHourly(10_320, 8), 1_238_400)   // 실제 1일 8시간을 넣으면 1.67배 과대
  })
  test('기본 최저시급 연도 — 표(2025~2027)에 없는 해는 가까운 해 값 + exact=false', () => {
    assert.deepEqual(minWageEntry(2026), { year: 2026, wage: 10_320, exact: true })
    assert.deepEqual(minWageEntry(2027), { year: 2027, wage: 10_700, exact: true })  // 2027-03-01에 끝나는 연차의 정산 연도
    assert.deepEqual(minWageEntry(2024), { year: 2025, wage: 10_030, exact: false }) // 2024 실제(9,860)와 다름 → 표시
    assert.deepEqual(minWageEntry(2028), { year: 2027, wage: 10_700, exact: false })
    assert.equal(dailyWageFromHourly(10_700) * 12, 1_027_200)                        // 가이드 예시 4: 85,600 × 12
  })
  test('규칙 상수 — 15 / 80% / 25 / 11', () => {
    assert.equal(ANNUAL_LEAVE.base, 15)
    assert.equal(ANNUAL_LEAVE.attendanceMinPct, 80)
    assert.equal(ANNUAL_LEAVE.cap, 25)
    assert.equal(ANNUAL_LEAVE.firstYearMonthlyMax, 11)
  })
})

describe('퇴사 정산 — 마지막 근무일 뒤 30일 안에 새 연차가 생기면 늘어나는 수당 일수 (extendGain)', () => {
  test('1년 계약직(2026-08-31) → 2026-09-01에 15일, 정산 차이 없음 → +15일', () => {
    const g = extendGain(base({ retire: true }))
    assert.ok(g)
    assert.equal(g.date, '2026-09-01')
    assert.equal(g.newDays, 15)
    assert.equal(g.gainDays, 15)                        // 기존 11일 미사용분은 사용기한 경과 후에도 수당으로 남음
    assert.equal(Math.floor(g.gainDays * DAILY_2026), 1_238_400)
  })
  test('1년 미만 퇴사(2025-12-31) → 다음 날 월 단위 연차 1일도 알림(예전엔 월 단위를 건너뜀)', () => {
    const g = extendGain(base({ refDate: '2025-12-31', retire: true }))
    assert.ok(g)
    assert.equal(g.date, '2026-01-01')                  // 2025-12-01~12-31 개근 → 다음 날
    assert.equal(g.grants[0].kind, 'monthly')
    assert.equal(g.gainDays, 1)
  })
  test('회계연도 2026-12-31 퇴사(5일 사용) → 2027-01-01에 15일 생기지만 정산 차이 7.44일이 사라져 순증가 7.56일', () => {
    const g = extendGain(base({ hireDate: '2025-07-01', refDate: '2026-12-31', basis: 'fiscal', retire: true, usedDays: 5 }))
    assert.ok(g)
    assert.equal(g.date, '2027-01-01')
    assert.equal(g.newDays, 15)
    assert.equal(g.extraNow, 7.44)                      // 입사일 기준 26 − 회계연도 18.56
    assert.equal(g.extraThen, 0)                        // 회계 33.56 > 입사일 26
    assert.equal(g.gainDays, 7.56)                      // 15 + 0 − 7.44 (예전 안내는 15일분 1,238,400원으로 과대)
    assert.equal(Math.floor(g.gainDays * DAILY_2026 + 1e-6), 624_153) // 82,560 × 7.56 = 624,153.6
  })
  test('회계연도 첫해 연말 퇴사(2025-12-31) → 1/1에 월 단위 1일 + 비례 7.56일 동시 발생 = 8.56일', () => {
    const g = extendGain(base({ hireDate: '2025-07-01', refDate: '2025-12-31', basis: 'fiscal', retire: true }))
    assert.ok(g)
    assert.equal(g.grants.length, 2)
    assert.equal(g.newDays, 8.56)
    assert.equal(g.gainDays, 8.56)
  })
  test('30일 경계 — 다음 연차 2026-03-01: 1/30 퇴사는 +30일째라 알림, 1/29는 +31일째라 없음', () => {
    const g = extendGain(base({ hireDate: '2023-03-01', refDate: '2026-01-30', retire: true }))
    assert.ok(g)
    assert.equal(g.date, '2026-03-01')
    assert.equal(g.gainDays, 16)                        // 근속 3년 → 15 + ⌊2/2⌋
    assert.equal(extendGain(base({ hireDate: '2023-03-01', refDate: '2026-01-29', retire: true })), null)
  })
  test('재직 중 탭·5명 미만은 알림 없음', () => {
    assert.equal(extendGain(base({ retire: false })), null)
    assert.equal(extendGain(base({ retire: true, fivePlus: false })), null)
  })
})
