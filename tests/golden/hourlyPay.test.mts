/* 골든 테스트 — 알바 급여·주휴수당 (lib/krHourlyPay.ts + app/tools/finance/hourly-pay/hourlyPayUtils.ts)
   근거: 근로기준법 §18③(주 15시간 미만 주휴 미적용) · §50(1일 8시간·1주 40시간) · §53①(연장 1주 12시간)
         · §54①(4시간 30분·8시간 1시간 휴게) · §55①·시행령 §30①(개근 시 주 1회 유급휴일)
         · 시행령 §9① [별표 2](단시간 주휴 = 주 소정근로시간 ÷ 5) · §56①②③(연장·휴일 8h 이내 +50%, 8h 초과 +100%, 야간 +50%)
         · §11②(4명 이하 일부 적용) + 시행령 §7 [별표 1](5명 미만 가산 없음) · 기간제법 §6③(단시간 초과근로 +50%)
         · §54① 단서(법률 제21784호, 2026.12.10 시행 — 4시간 근로일 휴게 생략 요청)
         · 국민연금법 시행령 §2 4호·국민건강보험법 시행령 §9 1호·고용보험법 시행령 §3①·②(월 60시간 미만 제외, 고용은 주 15시간 미만 포함·3개월 이상 적용)
         · 고용보험법 §10①2호·②(법률 제21473호 부칙 §1 — 2027.1.1부터 소득기준, 금액 미정 → 적용 가정)
         · 국민연금법 부칙 <법률 제20903호> §4① 근로자 요율 2026 4.75% · 2027 5.00%
         · 소득세법 §129①3호(사업소득 3%) + 지방소득세 10%, §86 1호·시행령 §149의3(인적용역 소액부징수 제외)
         · 최저시급 2026 10,320 / 2027 10,700 (lib)
   공통 끝수: 주급 항목 원 미만 버림 → 월 = ⌊주급 × 365 ÷ 84⌋ → 세금·보험료 10원 미만 버림
   실행: npx tsx --test tests/golden/hourlyPay.test.mts */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  weeklyHolidayHours, weeklyHolidayReason, requiredBreakMinutes, splitLegalHours, splitHolidayHours,
  payMultiplier, insuranceRatesFor, insuranceCoverage, toMonthly,
  MONTHLY60_MIN_WEEKLY_HOURS, WEEKLY_HOLIDAY_MIN_HOURS, OVERTIME_WEEKLY_LIMIT, BREAK_WAIVER_4H, EI_INCOME_BASIS,
} from '../../lib/krHourlyPay'
import {
  calcHourlyPay, minWageTable, holidayTable, evenWeek, defaultPayYear, DEFAULT_INPUT, type HourlyPayInput, type HourlyPayResult,
} from '../../app/tools/finance/hourly-pay/hourlyPayUtils'

const amt = (r: HourlyPayResult, key: string) => r.lines.find(l => l.key === key)?.amount ?? -1
const ded = (r: HourlyPayResult, key: string) => r.deductions.find(d => d.key === key)?.amount ?? -1
/** 2026 · 시급 10,320 · 주 5일 · 휴게 60분 기본 */
const base = (o: Partial<HourlyPayInput> = {}): HourlyPayResult => calcHourlyPay({ ...DEFAULT_INPUT, breakMinutes: 60, ...o })

describe('주휴시간 — min(주 소정, 40) ÷ 40 × 8, 15시간 미만·결근 0', () => {
  test('경계: 14.99시간 → 0, 15시간 → 3시간 (15/40×8)', () => {
    assert.equal(WEEKLY_HOLIDAY_MIN_HOURS, 15)
    assert.equal(weeklyHolidayHours(14.99), 0)
    assert.equal(weeklyHolidayHours(15), 3)
  })
  test('20시간 → 4 · 32시간 → 6.4 · 40시간 → 8 · 48시간(5명 미만) → 8 상한', () => {
    assert.equal(weeklyHolidayHours(20), 4)     // 20/40×8
    assert.equal(weeklyHolidayHours(32), 6.4)   // 32/40×8
    assert.equal(weeklyHolidayHours(40), 8)
    assert.equal(weeklyHolidayHours(48), 8)     // 40시간 상한
  })
  test('0시간·결근 → 0, 사유 구분', () => {
    assert.equal(weeklyHolidayHours(0), 0)
    assert.equal(weeklyHolidayHours(20, false), 0)
    assert.equal(weeklyHolidayReason(0, true), 'none')
    assert.equal(weeklyHolidayReason(14, true), 'under15')
    assert.equal(weeklyHolidayReason(20, false), 'absent')
    assert.equal(weeklyHolidayReason(20, true), 'ok')
  })
})

describe('휴게 — §54① 4시간 30분 · 8시간 60분', () => {
  test('경계값', () => {
    assert.equal(requiredBreakMinutes(0), 0)
    assert.equal(requiredBreakMinutes(3.99), 0)
    assert.equal(requiredBreakMinutes(4), 30)
    assert.equal(requiredBreakMinutes(7.99), 30)
    assert.equal(requiredBreakMinutes(8), 60)
    assert.equal(requiredBreakMinutes(12), 60)
  })
})

describe('법정 한도 분리 — 5명 이상은 1일 8h·주 40h 초과분을 연장으로', () => {
  test('주 4일 × 10시간: 1일 초과 2h×4 = 8 → 소정 32 + 연장 8', () => {
    assert.deepEqual(splitLegalHours([10, 10, 10, 10, 0, 0, 0], true), { scheduled: 32, overflow: 8 })
  })
  test('주 6일 × 8시간: 1일 초과 없음, 주 48 − 40 = 8 연장', () => {
    assert.deepEqual(splitLegalHours([8, 8, 8, 8, 8, 8, 0], true), { scheduled: 40, overflow: 8 })
  })
  test('주 6일 × 7시간 = 42: 주 초과 2', () => {
    assert.deepEqual(splitLegalHours([7, 7, 7, 7, 7, 7, 0], true), { scheduled: 40, overflow: 2 })
  })
  test('주 5일 × 9시간: 1일 초과 5 → 남은 40, 주 초과 0', () => {
    assert.deepEqual(splitLegalHours([9, 9, 9, 9, 9, 0, 0], true), { scheduled: 40, overflow: 5 })
  })
  test('5명 미만: 전부 소정 (48 / 0)', () => {
    assert.deepEqual(splitLegalHours([8, 8, 8, 8, 8, 8, 0], false), { scheduled: 48, overflow: 0 })
  })
  test('휴일근로 1일 분리: 10h → 8 + 2, 8h → 8 + 0, 8.5h → 8 + 0.5', () => {
    assert.deepEqual(splitHolidayHours(10), { within: 8, over: 2 })
    assert.deepEqual(splitHolidayHours(8), { within: 8, over: 0 })
    assert.deepEqual(splitHolidayHours(8.5), { within: 8, over: 0.5 })
  })
  test('배율: 5명 이상 연장 1.5·휴일 1.5·휴일 초과 2 / 5명 미만 1', () => {
    assert.equal(payMultiplier('overtime', true), 1.5)
    assert.equal(payMultiplier('holiday', true), 1.5)
    assert.equal(payMultiplier('holidayOver', true), 2)
    assert.equal(payMultiplier('night', false), 1)
  })
})

describe('월 환산 — 주급 × 365 ÷ 84', () => {
  test('기본값(주 5일 × 4시간, 10,320원): 주급 247,680 → 월 1,076,228', () => {
    const r = calcHourlyPay(DEFAULT_INPUT)
    assert.equal(r.scheduled, 20)
    assert.equal(r.weeklyHolidayHours, 4)
    assert.equal(amt(r, 'base'), 206_400)          // 20 × 10,320
    assert.equal(amt(r, 'weeklyHoliday'), 41_280)  // 4 × 10,320
    assert.equal(r.weekly, 247_680)
    assert.equal(r.monthlyGross, 1_076_228)        // 247,680 × 365 = 90,403,200 ÷ 84 = 1,076,228.57 → 버림
    assert.equal(r.effectiveHourly, 12_384)        // (206,400 + 41,280) ÷ 20 = 10,320 × 1.2
  })
  test('주 40시간: 주급 495,360 → 월 2,152,457 (월급제 209h 2,156,880보다 4,423 적음)', () => {
    const r = base({ hoursPerDay: 8 })
    assert.equal(r.weekly, 495_360)                // (40 + 8) × 10,320
    assert.equal(r.monthlyGross, 2_152_457)        // 180,806,400 ÷ 84 = 2,152,457.14
    assert.equal(r.fullTime209, 2_156_880)         // 10,320 × 209 (고용노동부 월 환산액)
    assert.equal(Math.round(r.monthlyPaidHours * 100) / 100, 208.57) // 48 × 365 ÷ 84
  })
  test('주 4일 × 10시간(5명 이상): 소정 32 · 주휴 6.4 · 연장 8 → 월 2,260,080 (나누어떨어짐)', () => {
    const r = base({ days: 4, hoursPerDay: 10 })
    assert.equal(r.scheduled, 32)
    assert.equal(r.autoOvertime, 8)
    assert.equal(amt(r, 'weeklyHoliday'), 66_048) // 6.4 × 10,320
    assert.equal(amt(r, 'overtime'), 123_840)     // 8 × 10,320 × 1.5
    assert.equal(r.weekly, 520_128)               // 330,240 + 66,048 + 123,840
    assert.equal(r.monthlyGross, 2_260_080)       // 189,846,720 ÷ 84 = 2,260,080 정확
  })
  test('주 6일 × 8시간, 5명 미만: 소정 48 · 주휴 8(상한) · 가산 없음 → 월 2,511,200', () => {
    const r = base({ days: 6, hoursPerDay: 8, fivePlus: false })
    assert.equal(r.scheduled, 48)
    assert.equal(r.weeklyHolidayHours, 8)
    assert.equal(r.weekly, 577_920)               // 48 × 10,320 + 8 × 10,320
    assert.equal(r.monthlyGross, 2_511_200)       // 210,940,800 ÷ 84
  })
  test('toMonthly: 1주 → 365/84', () => {
    assert.equal(toMonthly(84), 365)
  })
})

describe('가산수당 — §56 (5명 이상) vs 5명 미만', () => {
  const PREM: Partial<HourlyPayInput> = { hoursPerDay: 8, overtimeHours: 2, nightHours: 3, holidayDays: 1, holidayHoursPerDay: 10 }
  test('5명 이상: 연장 30,960 · 야간 가산 15,480 · 휴일 165,120 → 주 706,920 / 월 3,071,735', () => {
    const r = base(PREM)
    assert.equal(amt(r, 'overtime'), 30_960)      // 2 × 10,320 × 1.5
    assert.equal(amt(r, 'night'), 15_480)         // 3 × 10,320 × 0.5 (가산분만)
    assert.equal(amt(r, 'holiday'), 165_120)      // 10,320 × (8 × 1.5 + 2 × 2) = 10,320 × 16
    assert.equal(r.weekly, 706_920)               // 412,800 + 82,560 + 30,960 + 15,480 + 165,120
    assert.equal(r.monthlyGross, 3_071_735)       // 258,025,800 ÷ 84 = 3,071,735.71
    assert.equal(r.premiumWeekly, 10_320 + 15_480 + 61_920) // 연장 가산 + 야간 + 휴일 가산(165,120 − 103,200)
    assert.equal(r.overtimeOverLimit, false)      // 소정 밖 2 + 10 = 12 = 한도 (초과 아님)
  })
  test('5명 미만: 가산 0 → 주 619,200 / 월 2,690,571', () => {
    const r = base({ ...PREM, fivePlus: false })
    assert.equal(amt(r, 'overtime'), 20_640)      // 2 × 10,320
    assert.equal(amt(r, 'night'), 0)
    assert.equal(amt(r, 'holiday'), 103_200)      // 10 × 10,320
    assert.equal(r.weekly, 619_200)
    assert.equal(r.monthlyGross, 2_690_571)       // 226,008,000 ÷ 84 = 2,690,571.43
    assert.equal(r.overtimeOverLimit, false)      // 5명 미만은 §53 미적용
  })
  test('연장 한도 경계: 소정 밖 12h → 정상, 12.5h → 초과', () => {
    assert.equal(OVERTIME_WEEKLY_LIMIT, 12)
    assert.equal(base({ hoursPerDay: 8, overtimeHours: 12 }).overtimeOverLimit, false)
    assert.equal(base({ hoursPerDay: 8, overtimeHours: 12.5 }).overtimeOverLimit, true)
  })
  test('단시간 초과근로(기간제법 §6③): 주 20h + 2h → 5명 이상 30,960 / 미만 20,640', () => {
    assert.equal(amt(calcHourlyPay({ ...DEFAULT_INPUT, overtimeHours: 2 }), 'overtime'), 30_960)
    assert.equal(amt(calcHourlyPay({ ...DEFAULT_INPUT, overtimeHours: 2, fivePlus: false }), 'overtime'), 20_640)
  })
  test('야간 시간은 총 근로시간으로 클램프 · 휴일 일수는 7 − 근무일로 클램프', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, nightHours: 50 })  // 총 20h
    assert.equal(r.night, 20)
    assert.equal(amt(r, 'night'), 103_200)        // 20 × 10,320 × 0.5
    const h = base({ days: 6, hoursPerDay: 8, holidayDays: 3, holidayHoursPerDay: 4 })
    assert.equal(h.holidayWorkHours, 4)           // 7 − 6 = 1일만
    assert.equal(h.holidayDaysUsed, 1)            // 요약 줄에 보여 줄 '실제 계산한 휴일 일수'
  })
})

describe('휴게 입력 — 출근~퇴근 시간에서 휴게 차감', () => {
  test('9시간(휴게 포함) − 60분 = 8시간 × 5일 → 소정 40, 휴게 충족', () => {
    const r = base({ hoursPerDay: 9, includesBreak: true, breakMinutes: 60 })
    assert.equal(r.scheduled, 40)
    assert.equal(r.breakShortDays, 0)
  })
  test('실근로 8시간에 휴게 30분 → 5일 모두 미달(60분 필요)', () => {
    const r = base({ hoursPerDay: 8, breakMinutes: 30 })
    assert.equal(r.breakShortDays, 5)
    assert.equal(r.breakRequiredMax, 60)
    assert.equal(r.breakShortWaivable, 0)         // 8시간 날은 §54① 단서(4시간) 대상 아님
  })
  test('§54① 단서: 정확히 4시간인 날만 휴게 생략 요청 대상 (2026-12-10 시행)', () => {
    assert.equal(BREAK_WAIVER_4H.since, '2026-12-10')  // 2026.6.9 공포 + 6개월 경과한 날
    const r4 = calcHourlyPay({ ...DEFAULT_INPUT, breakMinutes: 0 })   // 4h × 5일, 휴게 0
    assert.equal(r4.breakShortDays, 5)
    assert.equal(r4.breakShortWaivable, 5)
    const r45 = calcHourlyPay({ ...DEFAULT_INPUT, hoursPerDay: 4.5, breakMinutes: 0 })
    assert.equal(r45.breakShortDays, 5)
    assert.equal(r45.breakShortWaivable, 0)       // 4.5시간은 '근로시간이 4시간인 경우'로 보지 않음(보수적)
    const inc = calcHourlyPay({ ...DEFAULT_INPUT, hoursPerDay: 4.5, includesBreak: true, breakMinutes: 30 })
    assert.equal(inc.dayHours[0], 4)              // 4.5 − 0.5 = 4 → 30분 필요, 30분 충족
    assert.equal(inc.breakShortDays, 0)
  })
})

describe('공제 — 3.3% · 4대보험 근로자분', () => {
  test('3.3%: 월 1,076,228 → 소득세 32,280 · 지방세 3,220 → 실수령 1,040,728', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, deduction: 'biz33' })
    assert.equal(ded(r, 'incomeTax'), 32_280)     // 1,076,228 × 3% = 32,286.84 → 10원 미만 버림
    assert.equal(ded(r, 'localTax'), 3_220)       // 32,280 × 10% = 3,228 → 3,220
    assert.equal(r.monthlyNet, 1_040_728)
  })
  test('4대보험 2026 · 주 40h: 연금 102,240 · 건강 77,380 · 장기요양 10,160 · 고용 19,370', () => {
    const r = base({ hoursPerDay: 8, deduction: 'insurance' })
    assert.equal(ded(r, 'pension'), 102_240)      // 2,152,457 × 4.75% = 102,241.7
    assert.equal(ded(r, 'health'), 77_380)        // × 3.595% = 77,380.8
    assert.equal(ded(r, 'ltc'), 10_160)           // 77,380 × 13.14% (0.9448 ÷ 7.19) = 10,167.7
    assert.equal(ded(r, 'unemp'), 19_370)         // × 0.9% = 19,372.1
    assert.equal(r.monthlyNet, 2_152_457 - 209_150)
    assert.equal(r.ratesFallback, false)
  })
  test('2027: 국민연금은 법정 5.00%, 건강·장기요양·고용은 2026 요율로 대체 · 최저시급 10,700 → 월 2,231,714', () => {
    const rf = insuranceRatesFor(2027)
    assert.equal(rf.year, 2026)
    assert.equal(rf.fallback, true)
    assert.equal(insuranceRatesFor(2026).fallback, false)
    const r = base({ year: 2027, hourly: 10_700, hoursPerDay: 8, deduction: 'insurance' })
    assert.equal(r.weekly, 513_600)               // 48 × 10,700
    assert.equal(r.monthlyGross, 2_231_714)       // 187,464,000 ÷ 84 = 2,231,714.28
    assert.equal(r.pensionRate, 5)                // 국민연금법 부칙 §4① 2호 '2027년은 1만분의 500'
    assert.equal(ded(r, 'pension'), 111_580)      // 2,231,714 × 5% = 111,585.7 → 10원 미만 버림
    assert.equal(ded(r, 'health'), 80_230)        // × 3.595% = 80,230.1
    assert.equal(ded(r, 'ltc'), 10_540)           // 80,230 × 13.14% = 10,542.2
    assert.equal(ded(r, 'unemp'), 20_080)         // × 0.9% = 20,085.4 (2027 소득기준: 3개월 이상 기본값이라 확정 적용)
    assert.equal(r.deductionTotal, 222_430)       // 111,580 + 80,230 + 10,540 + 20,080
    assert.equal(r.monthlyNet, 2_009_284)         // 2,231,714 − 222,430
    assert.equal(r.ratesFallback, true)
    assert.equal(r.coverage?.unempPending, false)
  })
  test('2026 국민연금 요율은 4.75% 그대로', () => {
    assert.equal(base({ hoursPerDay: 8, deduction: 'insurance' }).pensionRate, 4.75)  // 부칙 §4① 1호 '1만분의 475'
  })
  test('3.3%: 소액이어도 뗀다 — 인적용역 사업소득은 소액부징수(§86 1호) 제외(시행령 §149의3, 2024.7.1 지급분~)', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, days: 1, hoursPerDay: 0.5, deduction: 'biz33' })
    assert.equal(r.monthlyGross, 22_421)          // 0.5 × 10,320 = 5,160 × 365 ÷ 84 = 22,421.43
    assert.equal(ded(r, 'incomeTax'), 670)        // 22,421 × 3% = 672.6 → 670 (1천원 미만이어도 0으로 만들지 않음)
    assert.equal(ded(r, 'localTax'), 60)          // 670 × 10% = 67 → 60
  })
  test('국민연금 상한: 시급 10만원 × 40h → 기준소득월액 659만 × 4.75% = 313,020', () => {
    const r = base({ hourly: 100_000, hoursPerDay: 8, deduction: 'insurance' })
    assert.equal(r.monthlyGross, 20_857_142)      // 4,800,000 × 365 ÷ 84 = 20,857,142.86
    assert.equal(ded(r, 'pension'), 313_020)      // 6,590,000 × 4.75% = 313,025 → 313,020
  })
})

describe('4대보험 적용 제외 — 월 60시간 · 주 15시간(고용)', () => {
  test('월 60시간 경계: 주 13.8h(59.96h) 제외 · 13.81h(60.01h) 적용', () => {
    assert.equal(MONTHLY60_MIN_WEEKLY_HOURS, 13.81)  // ⌈60 ÷ (365/84) × 100⌉ ÷ 100
    assert.equal(insuranceCoverage(toMonthly(13.8), 13.8, false).pension, false)
    assert.equal(insuranceCoverage(toMonthly(13.81), 13.81, false).pension, true)
    assert.equal(insuranceCoverage(60, 15, false).unemp, true)
  })
  test('주 14h(월 60.83h): 연금·건강 적용, 고용은 주 15h 미만이라 3개월 이상일 때만', () => {
    const c = insuranceCoverage(toMonthly(14), 14, false)
    assert.deepEqual([c.pension, c.health, c.unemp], [true, true, false])
    assert.equal(insuranceCoverage(toMonthly(14), 14, true).unemp, true)
  })
  test('주 2일 × 6.5h(월 56.49h), 3개월 미만: 공제 0원', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, mode: 'byDay', byDay: [6.5, 6.5, 0, 0, 0, 0, 0], deduction: 'insurance', longTerm: false })
    assert.equal(r.coverage?.underMin, true)
    assert.equal(r.deductionTotal, 0)
    assert.equal(r.monthlyGross, 582_957)         // 13 × 10,320 = 134,160 × 365 ÷ 84 = 582,957.14
    const lt = calcHourlyPay({ ...DEFAULT_INPUT, mode: 'byDay', byDay: [6.5, 6.5, 0, 0, 0, 0, 0], deduction: 'insurance', longTerm: true })
    assert.equal(ded(lt, 'unemp'), 5_240)         // 582,957 × 0.9% = 5,246.6 → 5,240
    assert.equal(ded(lt, 'pension'), 0)
  })
})

describe('고용보험 2027 — 소정근로시간 기준 → 소득기준(고용보험법 §10①2호, 2027.1.1 시행)', () => {
  test('상수: 2027년부터, 소득기준 금액 미정(null)', () => {
    assert.equal(EI_INCOME_BASIS.sinceYear, 2027)
    assert.equal(EI_INCOME_BASIS.since, '2027-01-01')
    assert.equal(EI_INCOME_BASIS.incomeThreshold, null)
  })
  test('주 13h · 3개월 미만: 2026은 시간 기준으로 제외, 2027은 적용 가정(pending)', () => {
    const m = toMonthly(13)                        // 56.49h
    const c26 = insuranceCoverage(m, 13, false, 2026)
    assert.deepEqual([c26.unemp, c26.unempBasis, c26.unempPending], [false, 'hours', false])
    const c27 = insuranceCoverage(m, 13, false, 2027)
    assert.deepEqual([c27.unemp, c27.unempBasis, c27.unempPending], [true, 'income', true])
    assert.equal(c27.pension, false)               // 연금·건강은 여전히 월 60시간 기준
    const c27lt = insuranceCoverage(m, 13, true, 2027)
    assert.deepEqual([c27lt.unemp, c27lt.unempPending], [true, false])  // §10②2호 3개월 이상 → 확정 적용
    assert.equal(insuranceCoverage(0, 0, false, 2027).unemp, false)     // 근무 없음
  })
  test('2027 · 주 2일 × 6.5h · 시급 10,700 · 3개월 미만 → 고용보험만 5,430 (가정)', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, year: 2027, hourly: 10_700, mode: 'byDay', byDay: [6.5, 6.5, 0, 0, 0, 0, 0], deduction: 'insurance', longTerm: false })
    assert.equal(r.monthlyGross, 604_422)         // 13 × 10,700 = 139,100 × 365 ÷ 84 = 604,422.6 (주휴 없음)
    assert.equal(ded(r, 'unemp'), 5_430)          // 604,422 × 0.9% = 5,439.8 → 5,430
    assert.equal(ded(r, 'pension'), 0)
    assert.equal(ded(r, 'health'), 0)
    assert.equal(r.coverage?.unempPending, true)
  })
})

describe('기본 연도 — 오늘 날짜(todayStr)로', () => {
  test('표 범위 안은 그 해, 밖은 가까운 끝 해', () => {
    assert.equal(defaultPayYear('2026-09-26'), 2026)
    assert.equal(defaultPayYear('2026-12-31'), 2026)
    assert.equal(defaultPayYear('2027-01-01'), 2027)
    assert.equal(defaultPayYear('2025-12-31'), 2026)
    assert.equal(defaultPayYear('2031-05-01'), 2027)
  })
})

describe('최저임금 체크', () => {
  test('2026 경계: 10,319원 미달 · 10,320원 충족 · 2027에 10,320원은 미달', () => {
    assert.equal(calcHourlyPay({ ...DEFAULT_INPUT, hourly: 10_319 }).belowMinWage, true)
    assert.equal(calcHourlyPay({ ...DEFAULT_INPUT, hourly: 10_320 }).belowMinWage, false)
    assert.equal(calcHourlyPay({ ...DEFAULT_INPUT, year: 2027, hourly: 10_320 }).belowMinWage, true)
  })
  test('시급 10,000원 · 주 20h: 월 1,042,857 → 최저시급 대비 33,371 부족', () => {
    const r = calcHourlyPay({ ...DEFAULT_INPUT, hourly: 10_000 })
    assert.equal(r.monthlyGross, 1_042_857)       // 240,000 × 365 ÷ 84 = 1,042,857.14
    assert.equal(r.minWageShortfallMonthly, 33_371) // 1,076,228 − 1,042,857
    assert.equal(r.probationFloor, 9_288)         // 10,320 × 90%
  })
  test('시급 0 · 근무 0 → 0원, 주휴 사유 none', () => {
    const z = calcHourlyPay({ ...DEFAULT_INPUT, hourly: 0 })
    assert.equal(z.weekly, 0)
    assert.equal(z.belowMinWage, false)
    const n = calcHourlyPay({ ...DEFAULT_INPUT, days: 0 })
    assert.equal(n.scheduled, 0)
    assert.equal(n.holidayReason, 'none')
    assert.equal(n.monthlyGross, 0)
  })
})

describe('가이드 표 (빌드 시 생성)', () => {
  test('연도별 최저시급 표 — 2026 12,384 / 2,156,880 · 2027 12,840 / 2,236,300', () => {
    const t = minWageTable()
    const y26 = t.find(r => r.year === 2026)
    const y27 = t.find(r => r.year === 2027)
    assert.deepEqual(y26, { year: 2026, hourly: 10_320, withHoliday: 12_384, weekly40: 495_360, monthly209: 2_156_880 })
    assert.deepEqual(y27, { year: 2027, hourly: 10_700, withHoliday: 12_840, weekly40: 513_600, monthly209: 2_236_300 })
  })
  test('주 소정근로별 표 — 14h 주휴 없음·15h 주휴 3h (30,960원)', () => {
    const [r14, r15] = holidayTable([14, 15])
    assert.equal(r14.holidayHours, 0)
    assert.equal(r14.byYear[0].monthlyGross, 627_800)   // 14 × 10,320 = 144,480 × 365 ÷ 84 = 627,800
    assert.equal(r15.holidayHours, 3)
    assert.equal(r15.byYear[0].weeklyHolidayPay, 30_960) // 3 × 10,320
    assert.equal(r15.byYear[1].weeklyHolidayPay, 32_100) // 3 × 10,700
    assert.equal(evenWeek(2026, 15).monthlyGross, 807_171) // (15 + 3) × 10,320 = 185,760 × 365 ÷ 84 = 807,171.43
  })
})
