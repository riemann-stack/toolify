import Link from 'next/link'
import type { ReactNode } from 'react'
import HourlyPayClient from './HourlyPayClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import DataFigure from '@/components/DataFigure'
import Callout from '@/components/Callout'
import RelatedTools from '@/components/RelatedTools'
import { INSURANCE_RATES, MONTHLY_WORK_HOURS, minHourlyWageFor, pensionTotalRateFor } from '@/lib/krInsuranceRates'
import { WAGE_CLAIM_YEARS } from '@/lib/krLabor'
import { LOCAL_INCOME_TAX_RATIO, SMALL_TAX_EXEMPT_LIMIT } from '@/lib/krFinancialIncomeTax'
import { todayStr } from '@/lib/date'
import {
  HOURLY_PAY_REVIEWED, WEEKLY_HOLIDAY_MIN_HOURS, PREMIUM_MIN_WORKERS, WEEK_LEGAL_HOURS, DAY_LEGAL_HOURS,
  PREMIUM_RATES, HOLIDAY_SPLIT_HOURS, NIGHT_WINDOW, OVERTIME_WEEKLY_LIMIT, BREAK_RULES, WEEKS_PER_MONTH,
  INSURANCE_MIN_MONTHLY_HOURS, UNEMP_MIN_WEEKLY_HOURS, MONTHLY60_MIN_WEEKLY_HOURS, BUSINESS_WITHHOLDING_RATE,
  PROBATION_MIN_WAGE, BREAK_WAIVER_4H, EI_INCOME_BASIS, UNEMP_LONG_TERM_MONTHS, PENSION_SHORT_HOUR_EXCEPTIONS,
  BIZ_SMALL_TAX_EXEMPT_REMOVED_SINCE, pensionExceptionLabel, payMultiplier, insuranceRatesFor, tidy,
} from '@/lib/krHourlyPay'
import {
  calcHourlyPay, evenWeek, holidayTable, minWageTable, won, hrs, pct,
  DEFAULT_INPUT, PAY_YEARS, type HourlyPayInput, type HourlyPayResult,
} from './hourlyPayUtils'

const [Y0, Y1] = PAY_YEARS

export const metadata = buildMetadata({
  path: '/tools/finance/hourly-pay',
  title: `알바 급여·주휴수당 계산기 ${Y0}·${Y1} — 시급 월급 환산·야간·휴일수당`,
  description:
    `시급과 근무시간만 넣으면 주휴수당(주 ${WEEKLY_HOLIDAY_MIN_HOURS}시간 이상·개근), 주급, 월 예상 급여(주급 × 365÷7÷12), ${PREMIUM_MIN_WORKERS}인 이상 연장·야간·휴일 가산수당, ${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))}·4대보험 공제 후 실수령까지. ${Y0}년 ${minHourlyWageFor(Y0).toLocaleString('ko-KR')}원·${Y1}년 ${minHourlyWageFor(Y1).toLocaleString('ko-KR')}원 최저시급 기준.`,
  keywords: [
    '주휴수당 계산기', '알바 급여 계산기', '알바 월급 계산', '시급 계산기', `${Y1} 최저시급`, `${Y0} 최저시급`,
    '주휴수당 조건', `주휴수당 ${WEEKLY_HOLIDAY_MIN_HOURS}시간`, '야간수당 계산', '휴일수당 계산', `${PREMIUM_MIN_WORKERS}인 미만 가산수당`,
    `알바 ${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))}`, '알바 4대보험', '월 환산 209시간', '휴게시간 4시간 30분',
  ],
})

/* ── 빌드 시점 예시·표 — 전부 계산 엔진(hourlyPayUtils)·lib에서 생성 (손으로 적은 금액 없음) ── */
const W0 = minHourlyWageFor(Y0)
const W1 = minHourlyWageFor(Y1)
const W_UP = W1 - W0
const W_UP_PCT = Math.round((W_UP / W0) * 1000) / 10
const DEF = DEFAULT_INPUT
const B60: HourlyPayInput = { ...DEF, breakMinutes: 60 }
const EX = calcHourlyPay(DEF)                                              // 주 5일 × 4시간
const EX40 = calcHourlyPay({ ...B60, hoursPerDay: 8 })                     // 주 5일 × 8시간
const H_BELOW = WEEKLY_HOLIDAY_MIN_HOURS - 1                                   // 주휴 경계 바로 아래 (14시간)
const EX14 = evenWeek(Y0, H_BELOW)
const EX15 = evenWeek(Y0, WEEKLY_HOLIDAY_MIN_HOURS)
const EX6x8 = calcHourlyPay({ ...B60, days: 6, hoursPerDay: 8 })
const EX6x8s = calcHourlyPay({ ...B60, days: 6, hoursPerDay: 8, fivePlus: false })
const EX4x10 = calcHourlyPay({ ...B60, days: 4, hoursPerDay: 10 })
const PREM: HourlyPayInput = { ...B60, hoursPerDay: 8, overtimeHours: 2, nightHours: 3, holidayDays: 1, holidayHoursPerDay: 10 }
const EXP = calcHourlyPay(PREM)
const EXPs = calcHourlyPay({ ...PREM, fivePlus: false })
const EXPT = calcHourlyPay({ ...DEF, overtimeHours: 2 })
const EXPTs = calcHourlyPay({ ...DEF, overtimeHours: 2, fivePlus: false })
const EX20B = calcHourlyPay({ ...DEF, deduction: 'biz33' })
const EX20I = calcHourlyPay({ ...DEF, deduction: 'insurance' })
const EX40B = calcHourlyPay({ ...B60, hoursPerDay: 8, deduction: 'biz33' })
const EX40I = calcHourlyPay({ ...B60, hoursPerDay: 8, deduction: 'insurance' })
const EX13 = calcHourlyPay({ ...DEF, mode: 'byDay', byDay: [6.5, 6.5, 0, 0, 0, 0, 0], deduction: 'insurance', longTerm: false })
const EX1_20 = evenWeek(Y1, 20)
const EX1_40 = evenWeek(Y1, 40)
const EX_LOW = calcHourlyPay({ ...DEF, hourly: Math.floor(W0 * PROBATION_MIN_WAGE.rate) })

const amt = (r: HourlyPayResult, key: HourlyPayResult['lines'][number]['key']) => r.lines.find(l => l.key === key)?.amount ?? 0
const ded = (r: HourlyPayResult, key: HourlyPayResult['deductions'][number]['key']) => r.deductions.find(d => d.key === key)?.amount ?? 0

const T1_HOURS = [10, H_BELOW, WEEKLY_HOLIDAY_MIN_HOURS, 20, 25, 30, 35, WEEK_LEGAL_HOURS]
const T1 = holidayTable(T1_HOURS)
const T2 = minWageTable()
const WPM = (Math.round(WEEKS_PER_MONTH * 1000) / 1000).toLocaleString('ko-KR')
const FULL_PAID_HOURS = tidy((WEEK_LEGAL_HOURS + DAY_LEGAL_HOURS) * WEEKS_PER_MONTH) // 208.57
const HOLIDAY_RATIO = DAY_LEGAL_HOURS / WEEK_LEGAL_HOURS                             // 0.2
const R0 = INSURANCE_RATES[insuranceRatesFor(Y0).year]
const RY1 = insuranceRatesFor(Y1)
const LTC_PCT = Math.round((R0.ltc.rateOfSalary / R0.health.total) * 1e4) / 100
const BREAK_8 = BREAK_RULES.find(b => b.minWorkHours === DAY_LEGAL_HOURS) ?? BREAK_RULES[0]
const BREAK_4 = BREAK_RULES[BREAK_RULES.length - 1]
const BIZ_PCT = pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))          // 3.3%
const BIZ_TAX_PCT = pct(BUSINESS_WITHHOLDING_RATE)                                      // 3%
const BIZ_LOCAL_PCT = pct(BUSINESS_WITHHOLDING_RATE * LOCAL_INCOME_TAX_RATIO)           // 0.3%
const LOCAL_RATIO_PCT = pct(LOCAL_INCOME_TAX_RATIO)                                     // 10%
const FOUR_WEEK_SHORT_PCT = Math.round((1 - 4 / WEEKS_PER_MONTH) * 100)                 // '× 4주'의 과소 비율(약 8%)
const FOUR_WEEK_SHORT_DAYS = hrs((WEEKS_PER_MONTH - 4) * 7)                             // 한 달에 빠지는 일수(약 2.4일)
const PROB_PCT = Math.round(PROBATION_MIN_WAGE.rate * 100)
const x = (m: number) => `${m}배`
/** 'YYYY-MM-DD' → 'YYYY.M.D' */
const dotDate = (d: string): string => d.split('-').map((v, i) => (i === 0 ? v : String(Number(v)))).join('.')
/** 'YYYY-MM-DD' → 'YYYY년 M월 D일' */
const korDate = (d: string): string => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일` }
const PEN_Y0 = pensionTotalRateFor(Y0) / 2                                          // 근로자 요율 % (4.75)
const PEN_Y1 = pensionTotalRateFor(Y1) / 2                                          // (5)
const EI_LAST_HOURS_YEAR = EI_INCOME_BASIS.sinceYear - 1                            // 시간 기준 마지막 해
const EI_SINCE_KOR = korDate(EI_INCOME_BASIS.since)
const BREAK_WAIVER_DOT = dotDate(BREAK_WAIVER_4H.since)
const SMALL_TAX = SMALL_TAX_EXEMPT_LIMIT.toLocaleString('ko-KR')
/** 국민연금 60시간 미만 예외 — 가이드 문장용 (lib 목록에서 생성) */
const PEN_EXC_TEXT = PENSION_SHORT_HOUR_EXCEPTIONS.map(pensionExceptionLabel).join(', ')

/* 표 3 — 근로 종류별 지급 배율 (lib 가산율에서 생성) */
const T3 = [
  { kind: '소정근로(계약한 시간)', five: 1, law: '—' },
  { kind: '연장·초과근로', five: payMultiplier('overtime', true), law: '§56① · 기간제법 §6③' },
  { kind: `야간근로(${NIGHT_WINDOW.start}~${NIGHT_WINDOW.end}시)`, five: 1 + PREMIUM_RATES.night, law: '§56③' },
  { kind: `휴일근로 ${HOLIDAY_SPLIT_HOURS}시간 이내`, five: payMultiplier('holiday', true), law: '§56②1호' },
  { kind: `휴일근로 ${HOLIDAY_SPLIT_HOURS}시간 초과`, five: payMultiplier('holidayOver', true), law: '§56②2호' },
  { kind: '연장 + 야간', five: payMultiplier('overtime', true) + PREMIUM_RATES.night, law: '§56①③' },
  { kind: `휴일 ${HOLIDAY_SPLIT_HOURS}시간 초과 + 야간`, five: payMultiplier('holidayOver', true) + PREMIUM_RATES.night, law: '§56②③' },
]

/* 표 4 — 공제 방식 비교 (주 20시간 · 주 40시간) */
const T4 = [
  { label: `주 ${hrs(EX.scheduled)}시간 · ${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))}`, r: EX20B },
  { label: `주 ${hrs(EX.scheduled)}시간 · 4대보험`, r: EX20I },
  { label: `주 ${hrs(EX40.scheduled)}시간 · ${pct(BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))}`, r: EX40B },
  { label: `주 ${hrs(EX40.scheduled)}시간 · 4대보험`, r: EX40I },
]

const LAW = {
  lsa2: 'https://www.law.go.kr/법령/근로기준법/제2조',
  lsa11: 'https://www.law.go.kr/법령/근로기준법/제11조',
  lsa18: 'https://www.law.go.kr/법령/근로기준법/제18조',
  lsa50: 'https://www.law.go.kr/법령/근로기준법/제50조',
  lsa53: 'https://www.law.go.kr/법령/근로기준법/제53조',
  lsa54: 'https://www.law.go.kr/법령/근로기준법/제54조',
  lsa55: 'https://www.law.go.kr/법령/근로기준법/제55조',
  lsa56: 'https://www.law.go.kr/법령/근로기준법/제56조',
  dec7: 'https://www.law.go.kr/법령/근로기준법시행령/제7조',
  dec9: 'https://www.law.go.kr/법령/근로기준법시행령/제9조',
  dec30: 'https://www.law.go.kr/법령/근로기준법시행령/제30조',
  pt6: 'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률/제6조',
  mw5: 'https://www.law.go.kr/법령/최저임금법/제5조',
  mw6: 'https://www.law.go.kr/법령/최저임금법/제6조',
  mw10: 'https://www.law.go.kr/법령/최저임금법/제10조',
  it129: 'https://www.law.go.kr/법령/소득세법/제129조',
  np2: 'https://www.law.go.kr/법령/국민연금법시행령/제2조',
  nhi9: 'https://www.law.go.kr/법령/국민건강보험법시행령/제9조',
  ei3: 'https://www.law.go.kr/법령/고용보험법시행령/제3조',
  ei10: 'https://www.law.go.kr/법령/고용보험법/제10조',
  npAct: 'https://www.law.go.kr/법령/국민연금법',
  mw3: 'https://www.law.go.kr/법령/최저임금법/제3조',
  mw7: 'https://www.law.go.kr/법령/최저임금법/제7조',
  it86: 'https://www.law.go.kr/법령/소득세법/제86조',
  itd149: 'https://www.law.go.kr/법령/소득세법시행령/제149조의3',
  moel2021: 'https://www.moel.go.kr/policy/policydata/view.do?bbs_seq=20210802167',
  mwc: 'https://www.minimumwage.go.kr',
}

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
)

const FAQ_LD = [
  {
    q: `주 ${WEEKLY_HOLIDAY_MIN_HOURS}시간이 안 되면 주휴수당을 전혀 못 받나요?`,
    a: `네. 4주 평균 1주 소정근로시간이 ${WEEKLY_HOLIDAY_MIN_HOURS}시간 미만인 근로자에게는 주휴(근로기준법 §55)가 적용되지 않습니다(§18③). ${Y0}년 최저시급으로 주 ${H_BELOW}시간(예: 2일 × ${H_BELOW / 2}시간)을 일하면 주휴수당이 0원이라 월 급여는 <strong>${won(EX14.monthlyGross)}원</strong>이고, 1시간 늘려 주 ${WEEKLY_HOLIDAY_MIN_HOURS}시간이 되면 주휴 ${hrs(EX15.weeklyHolidayHours)}시간이 붙어 <strong>${won(EX15.monthlyGross)}원</strong>이 됩니다. 기준은 그 주에 실제로 일한 시간이 아니라 근로계약으로 정한 소정근로시간(4주 평균)입니다.`,
  },
  {
    q: '하루 결근하면 그 주 주휴수당은 어떻게 되나요?',
    a: `주휴는 &lsquo;1주 동안의 소정근로일을 개근한 사람&rsquo;에게 주는 유급휴일이라(근로기준법 시행령 §30①) 결근한 주에는 생기지 않습니다. 주 ${hrs(EX.scheduled)}시간 근무라면 그 주 ${won(amt(EX, 'weeklyHoliday'))}원이 빠집니다. 다음 주에 개근하면 다시 생기므로 한 번의 결근이 다른 주에 영향을 주지는 않습니다. 지각·조퇴는 출근한 날이라 결근으로 보지 않는 것이 고용노동부 입장이지만, 늦은 시간만큼 임금이 깎이는 것은 별개입니다.`,
  },
  {
    q: '그만두는 마지막 주에도 주휴수당을 받나요?',
    a: '받을 수 있습니다. 고용노동부는 2021년 8월 4일 행정해석을 바꿔(임금근로시간과-1736), 1주 동안 근로관계가 유지되고 그 주 소정근로일을 개근했다면 그다음 날(8일째) 근무 예정이 없어도 주휴수당이 생긴다고 봅니다. 다만 주 중간에 근로계약이 끝나 1주(7일)를 채우지 못하면 그 주 주휴는 발생하지 않는다는 것이 같은 해석의 입장입니다. 마지막 근무일과 퇴사일(근로관계 종료일)을 계약서·사직서에 분명히 적어 두세요.',
  },
  {
    q: `상시 ${PREMIUM_MIN_WORKERS}명 미만 편의점·카페인데 야간수당을 받을 수 있나요?`,
    a: `법으로 강제되지는 않습니다. 상시 4명 이하 사업장에는 연장·야간·휴일 가산(근로기준법 §56)이 적용되지 않기 때문입니다(§11②, 시행령 §7 [별표 1]). 같은 근무(주 ${hrs(EXP.scheduled)}시간 + 연장 ${hrs(EXP.overtime)}시간 + 야간 ${hrs(EXP.night)}시간 + 휴일 ${hrs(EXP.holidayWorkHours)}시간)라도 ${PREMIUM_MIN_WORKERS}명 이상이면 월 ${won(EXP.monthlyGross)}원, 미만이면 ${won(EXPs.monthlyGross)}원입니다. 그래도 일한 시간만큼의 기본 시급, 최저임금, 주휴수당, 휴게시간은 사업장 규모와 관계없이 똑같이 적용되고, 근로계약서나 취업규칙에 가산을 약속했다면 그대로 받아야 합니다.`,
  },
  {
    q: '주휴수당을 포함하면 시급이 사실상 얼마인가요?',
    a: `주 ${WEEKLY_HOLIDAY_MIN_HOURS}~${WEEK_LEGAL_HOURS}시간을 개근하면 주휴시간이 소정근로시간의 ${HOLIDAY_RATIO * 100}%(${DAY_LEGAL_HOURS}÷${WEEK_LEGAL_HOURS})라서 근무시간과 관계없이 시급의 ${1 + HOLIDAY_RATIO}배가 됩니다. ${Y0}년 최저시급 ${won(W0)}원은 주휴 포함 <strong>${won(T2.find(t => t.year === Y0)?.withHoliday ?? 0)}원</strong>, ${Y1}년 ${won(W1)}원은 <strong>${won(T2.find(t => t.year === Y1)?.withHoliday ?? 0)}원</strong>입니다. 주 ${WEEK_LEGAL_HOURS}시간을 넘는 부분에는 주휴가 더 붙지 않고, ${WEEKLY_HOLIDAY_MIN_HOURS}시간 미만이면 주휴가 없어 시급 그대로입니다.`,
  },
  {
    q: `알바인데 ${BIZ_PCT}를 떼면 4대보험은 안 내도 되나요?`,
    a: `${BIZ_PCT}(사업소득세 ${BIZ_TAX_PCT} + 지방소득세 ${BIZ_LOCAL_PCT})는 일한 사람을 근로자가 아닌 &lsquo;사업자(프리랜서)&rsquo;로 보고 떼는 세금입니다. 그런데 정해진 시간·장소에서 지시를 받으며 시급을 받는다면 근로기준법상 근로자(§2①1호)이고, 근로자인지는 계약서 이름이 아니라 실제 일하는 방식으로 판단합니다. 근로자라면 근로소득으로 신고하고 요건에 맞으면 4대보험에 가입해야 합니다. ${Y0}년 최저시급 주 ${hrs(EX.scheduled)}시간 기준 월 급여 ${won(EX.monthlyGross)}원에서 ${BIZ_PCT}는 ${won(EX20B.deductionTotal)}원, 4대보험 근로자분은 ${won(EX20I.deductionTotal)}원입니다. 4대보험은 공제가 더 크지만 실업급여·국민연금 가입기간·건강보험 직장가입 자격이 함께 생깁니다.`,
  },
  {
    q: `한 달 ${INSURANCE_MIN_MONTHLY_HOURS}시간이 안 되면 4대보험이 전부 빠지나요?`,
    a: `아닙니다. 1개월 소정근로시간이 ${INSURANCE_MIN_MONTHLY_HOURS}시간 미만인 단시간근로자는 건강보험 직장가입 대상에서 빠지고(국민건강보험법 시행령 §9 1호) 국민연금도 원칙적으로 빠지지만(국민연금법 시행령 §2 4호), 국민연금은 ${PEN_EXC_TEXT}이면 가입 대상입니다(같은 호 단서). 고용보험은 ${EI_LAST_HOURS_YEAR}년 12월 31일까지 월 ${INSURANCE_MIN_MONTHLY_HOURS}시간 미만 또는 주 ${UNEMP_MIN_WEEKLY_HOURS}시간 미만이면 빠지되 ${UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하거나 일용근로자면 적용되고(고용보험법 시행령 §3①·②), ${EI_SINCE_KOR}부터는 근로시간이 아니라 보수가 시행령으로 정하는 소득기준 미만인지로 판단합니다(고용보험법 §10①2호). 산재보험은 근로시간과 관계없이 적용되고 보험료는 사업주만 냅니다. 주 소정근로시간 × 365÷7÷12로 환산하면 주 약 ${hrs(MONTHLY60_MIN_WEEKLY_HOURS)}시간부터 월 ${INSURANCE_MIN_MONTHLY_HOURS}시간이 되고, 경계에 걸리면 근로계약서의 월 소정근로시간으로 판단하므로 공단에 확인하세요.`,
  },
  {
    q: `${Y1}년 알바 월급은 얼마로 오르나요?`,
    a: `${Y1}년 최저시급은 ${won(W1)}원으로 ${Y0}년보다 ${won(W_UP)}원(${W_UP_PCT}%) 오릅니다(${Y1}년 1월 1일 시행). 주 ${WEEK_LEGAL_HOURS}시간 월급제로는 ${won(W1)} × ${MONTHLY_WORK_HOURS}시간 = <strong>${won(T2.find(t => t.year === Y1)?.monthly209 ?? 0)}원</strong>이고, 이 계산기의 주 단위 환산으로는 주 ${hrs(EX1_40.scheduled)}시간 ${won(EX1_40.monthlyGross)}원, 주 ${hrs(EX1_20.scheduled)}시간 ${won(EX1_20.monthlyGross)}원(${Y0}년 ${won(EX.monthlyGross)}원)입니다. 위 계산기에서 적용 연도를 ${Y1}년으로 바꾸면 내 근무시간으로 바로 확인할 수 있습니다.`,
  },
]

export default function HourlyPayPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/hourly-pay">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />알바 급여·주휴수당 계산기
      </h1>
      <p className="tp-lead">
        시급과 근무시간으로 <strong>주휴수당·주급·월 예상 급여</strong>를 계산합니다. {PREMIUM_MIN_WORKERS}인 이상 사업장의 연장·야간·휴일 가산수당, 휴게시간 점검, {BIZ_PCT}·4대보험 공제 후 실수령과 최저임금 위반 여부까지 함께 보여 줍니다.
      </p>

      <UpdatedMeta
        date={HOURLY_PAY_REVIEWED}
        basis={`${Y0}년 최저시급 ${won(W0)}원·${Y1}년 ${won(W1)}원(2026년 8월 고시) · 근로기준법 §18③·§54·§55·§56, 시행령 §30①·[별표 2] · 4대보험 ${insuranceRatesFor(Y0).year}년 근로자 요율(국민연금은 연도별 법정 요율) · 월 환산 = 주급 × 365 ÷ 7 ÷ 12`}
        sources={[
          { label: '근로기준법 §55', href: LAW.lsa55 },
          { label: '근로기준법 §56', href: LAW.lsa56 },
          { label: '최저임금위원회', href: LAW.mwc },
        ]}
      />

      {/* buildDate: SSG와 hydration이 같은 기준일을 쓰도록 빌드 시점 날짜를 전달 — 방문 날짜로 기본 연도를 다시 정한다 */}
      <HourlyPayClient buildDate={todayStr()} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 주휴수당 ── */}
        <section>
          <h2 className="g-h2">주휴수당 계산법 — 조건 두 가지와 &lsquo;하루치&rsquo; 공식</h2>
          <p className="g-p">
            근로기준법 <A href={LAW.lsa55}>§55①</A>은 사용자가 근로자에게 &lsquo;1주에 평균 1회 이상의 유급휴일&rsquo;을 주도록 합니다. 이 유급휴일이 주휴일이고, 쉬는 날인데도 받는 하루치 임금이 주휴수당입니다.
            알바라도 조건만 맞으면 받을 수 있고, 조건은 두 가지뿐입니다. 첫째, <strong>4주 평균 1주 소정근로시간이 {WEEKLY_HOLIDAY_MIN_HOURS}시간 이상</strong>이어야 합니다(<A href={LAW.lsa18}>§18③</A>). 둘째, 그 주에 정해진 근무일을 <strong>모두 출근(개근)</strong>해야 합니다(<A href={LAW.dec30}>시행령 §30①</A>).
            여기서 소정근로시간은 실제로 일한 시간이 아니라 근로계약서로 정한 근무시간입니다. 사장님이 급하게 불러 더 일한 시간은 연장근로이지 소정근로가 아닙니다.
          </p>
          <p className="g-p">
            금액은 &lsquo;하루치 소정근로시간 × 시급&rsquo;입니다. 단시간근로자의 하루치는 4주 소정근로시간을 같은 기간 통상근로자(주 5일)의 소정근로일수로 나눠 정하므로(<A href={LAW.dec9}>시행령 §9① [별표 2]</A>), 결국 <strong>주휴시간 = 주 소정근로시간 ÷ {WEEK_LEGAL_HOURS} × {DAY_LEGAL_HOURS}</strong>이 됩니다. 주 {WEEK_LEGAL_HOURS}시간을 넘게 계약해도 주휴는 {DAY_LEGAL_HOURS}시간까지입니다.
            {' '}{Y0}년 최저시급 {won(W0)}원으로 주 {EX.input.days}일 하루 {hrs(EX.input.hoursPerDay)}시간(주 {hrs(EX.scheduled)}시간)을 일하면 주휴시간은 {hrs(EX.scheduled)} ÷ {WEEK_LEGAL_HOURS} × {DAY_LEGAL_HOURS} = {hrs(EX.weeklyHolidayHours)}시간, 주휴수당은 <strong>{won(amt(EX, 'weeklyHoliday'))}원</strong>입니다.
            기본급 {won(amt(EX, 'base'))}원과 합친 주급은 {won(EX.weekly)}원이고, 월로 환산하면 {won(EX.monthlyGross)}원입니다. 같은 시급으로 주 {hrs(EX40.scheduled)}시간을 일하면 주휴 {hrs(EX40.weeklyHolidayHours)}시간 {won(amt(EX40, 'weeklyHoliday'))}원이 붙습니다.
          </p>
          <DataFigure
            n={1}
            title={`주 소정근로시간별 주휴수당·월 급여 — ${Y0}·${Y1}년 최저시급`}
            unit="단위: 원"
            source={<>자료: 근로기준법 §18③·§55①, 시행령 [별표 2], 최저시급 {won(W0)}원·{won(W1)}원 — Youtil 계산(개근·주 5일·가산 없음, 월 = 주급 × 365÷7÷12 원 미만 버림)</>}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">주 소정근로</th>
                  <th scope="col" className="r">주휴시간</th>
                  <th scope="col" className="r">월 소정시간</th>
                  <th scope="col" className="r">{Y0} 주휴수당(주)</th>
                  <th scope="col" className="r">{Y0} 월 급여</th>
                  <th scope="col" className="r">{Y1} 월 급여</th>
                </tr>
              </thead>
              <tbody>
                {T1.map(row => (
                  <tr key={row.weeklyHours}>
                    <th scope="row">{row.weeklyHours}시간</th>
                    <td className="r">{row.holidayHours > 0 ? `${hrs(row.holidayHours)}시간` : '없음'}</td>
                    <td className="r">{hrs(row.monthlyScheduledHours)}시간</td>
                    <td className="r">{won(row.byYear[0].weeklyHolidayPay)}</td>
                    <td className="r">{won(row.byYear[0].monthlyGross)}</td>
                    <td className="r">{won(row.byYear[1].monthlyGross)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            표에서 주 {H_BELOW}시간과 {WEEKLY_HOLIDAY_MIN_HOURS}시간 사이가 가장 크게 벌어집니다. 1시간 차이인데 {Y0}년 기준 월 급여가 {won(EX14.monthlyGross)}원에서 {won(EX15.monthlyGross)}원으로 {won(EX15.monthlyGross - EX14.monthlyGross)}원 늘어나는데, 늘어난 근무 1시간분보다 주휴 {hrs(EX15.weeklyHolidayHours)}시간분이 더 크기 때문입니다.
            &lsquo;주 {WEEKLY_HOLIDAY_MIN_HOURS}시간 미만 쪼개기 계약&rsquo;이 문제되는 이유가 여기에 있습니다. 반대로 개근 조건은 주 단위라서 한 주를 결근해도 다음 주 주휴에는 영향이 없습니다.
          </p>
          <Callout tone="tip" title="그만두는 주에도 주휴수당이 생길 수 있습니다">
            고용노동부는 <A href={LAW.moel2021}>2021년 8월 4일 행정해석 변경(임금근로시간과-1736)</A>으로, 1주 동안 근로관계가 유지되고 그 주 소정근로일을 개근했다면 8일째 근무 예정이 없어도 주휴수당이 생긴다고 봅니다. 주 중간에 계약이 끝나 1주를 채우지 못한 경우는 해당하지 않습니다.
          </Callout>
        </section>

        {/* ── 2. 월 환산 ── */}
        <section>
          <h2 className="g-h2">월급 환산 — 주급 × 365 ÷ 7 ÷ 12와 {MONTHLY_WORK_HOURS}시간</h2>
          <p className="g-p">
            시급제 알바의 한 달 급여는 달마다 주 수가 달라 조금씩 다르지만, 평균을 내려면 1년 365일을 7일로 나눠 주 수(약 52.14주)를 구하고 다시 12개월로 나눕니다. 그러면 <strong>한 달 = 약 {WPM}주</strong>이고, 이 계산기의 월 예상 급여는 <strong>주급 × 365 ÷ 7 ÷ 12</strong>(원 미만 버림)입니다.
            &lsquo;주급 × 4주&rsquo;로 계산하면 한 달에 약 {FOUR_WEEK_SHORT_DAYS}일치가 빠져 월 급여를 약 {FOUR_WEEK_SHORT_PCT}% 적게 잡게 됩니다.
          </p>
          <p className="g-p">
            최저임금을 월급으로 말할 때 쓰는 {MONTHLY_WORK_HOURS}시간도 같은 방식입니다. 주 {WEEK_LEGAL_HOURS}시간 근로자는 소정근로 {WEEK_LEGAL_HOURS}시간에 주휴 {DAY_LEGAL_HOURS}시간이 더해져 주 {WEEK_LEGAL_HOURS + DAY_LEGAL_HOURS}시간분을 받고, ({WEEK_LEGAL_HOURS} + {DAY_LEGAL_HOURS}) × 365 ÷ 7 ÷ 12 = {hrs(FULL_PAID_HOURS)}시간을 올림해 {MONTHLY_WORK_HOURS}시간으로 씁니다.
            그래서 {Y0}년 최저시급 월급제는 {won(W0)} × {MONTHLY_WORK_HOURS} = {won(EX40.fullTime209)}원인데, 주 단위 환산으로는 {won(EX40.monthlyGross)}원으로 {won(EX40.fullTime209 - EX40.monthlyGross)}원 적습니다. 월급제 근로자와 비교할 때는 계산기 결과의 &lsquo;월급제라면&rsquo; 줄을 함께 보세요.
          </p>
          <DataFigure
            n={2}
            title="연도별 최저시급 — 주휴 포함 시급·주 40시간 주급·월 환산액"
            unit="단위: 원"
            source={<>자료: 고용노동부 최저임금 고시(<A href={LAW.mw10}>최저임금법 §10</A>) — 주휴 포함 시급 = 시급 × ({WEEK_LEGAL_HOURS}+{DAY_LEGAL_HOURS})÷{WEEK_LEGAL_HOURS}, 월 환산 = 시급 × {MONTHLY_WORK_HOURS}시간</>}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">연도</th>
                  <th scope="col" className="r">최저시급</th>
                  <th scope="col" className="r">주휴 포함 시급</th>
                  <th scope="col" className="r">주 {WEEK_LEGAL_HOURS}시간 주급</th>
                  <th scope="col" className="r">월 {MONTHLY_WORK_HOURS}시간</th>
                </tr>
              </thead>
              <tbody>
                {T2.map(row => (
                  <tr key={row.year}>
                    <th scope="row">{row.year}년</th>
                    <td className="r">{won(row.hourly)}</td>
                    <td className="r">{won(row.withHoliday)}</td>
                    <td className="r">{won(row.weekly40)}</td>
                    <td className="r em">{won(row.monthly209)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </section>

        {/* ── 3. 가산수당 ── */}
        <section>
          <h2 className="g-h2">연장·야간·휴일 가산수당 — {PREMIUM_MIN_WORKERS}인 이상 사업장, 겹치면 더한다</h2>
          <p className="g-p">
            근로기준법 <A href={LAW.lsa56}>§56</A>은 연장근로에 통상임금의 {pct(PREMIUM_RATES.overtime)} 이상(①), 휴일근로는 {HOLIDAY_SPLIT_HOURS}시간 이내 {pct(PREMIUM_RATES.holiday)}·{HOLIDAY_SPLIT_HOURS}시간 초과 {pct(PREMIUM_RATES.holidayOver)}(②), 오후 {NIGHT_WINDOW.start - 12}시부터 다음 날 오전 {NIGHT_WINDOW.end}시 사이의 야간근로에 {pct(PREMIUM_RATES.night)} 이상(③)을 더 주도록 합니다.
            단 이 조항은 <strong>상시 {PREMIUM_MIN_WORKERS}명 이상 사업장</strong>에만 적용됩니다. 4명 이하 사업장에 적용되는 조항을 정한 <A href={LAW.dec7}>시행령 §7 [별표 1]</A>에 §56이 없기 때문입니다(<A href={LAW.lsa11}>§11②</A>). 이런 곳에서도 일한 시간만큼의 기본 시급은 당연히 받습니다.
          </p>
          <p className="g-p">
            가산은 겹치면 더합니다. 연장근로가 밤 {NIGHT_WINDOW.start - 12}시 이후로 이어지면 기본 1배에 연장 가산 {pct(PREMIUM_RATES.overtime)}와 야간 가산 {pct(PREMIUM_RATES.night)}가 붙어 {x(payMultiplier('overtime', true) + PREMIUM_RATES.night)}입니다. 휴일근로와 연장근로는 겹쳐 더하지 않고 휴일근로 가산만 적용합니다(§56②).
            단시간 알바는 법정 {WEEK_LEGAL_HOURS}시간 전이라도 <strong>계약한 소정근로시간을 넘겨 일한 시간</strong>에 {pct(PREMIUM_RATES.overtime)}를 더 받습니다(<A href={LAW.pt6}>기간제법 §6③</A>, {PREMIUM_MIN_WORKERS}명 이상 사업장). 주 {hrs(EXPT.scheduled)}시간 계약자가 {hrs(EXPT.input.overtimeHours)}시간 더 일하면 {PREMIUM_MIN_WORKERS}명 이상 사업장은 {won(amt(EXPT, 'overtime'))}원, 미만은 {won(amt(EXPTs, 'overtime'))}원입니다.
          </p>
          <DataFigure
            n={3}
            title={`근로 종류별 지급 배율과 ${Y0}년 최저시급 1시간 금액`}
            unit="단위: 배 · 원"
            source={<>자료: 근로기준법 §56①②③, 기간제법 §6③, 시행령 §7 [별표 1] — 야간은 소정근로 중이라 기본 1배에 가산 {PREMIUM_RATES.night}만 더한 값</>}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">근로 종류</th>
                  <th scope="col" className="r">{PREMIUM_MIN_WORKERS}명 이상</th>
                  <th scope="col" className="r">1시간 ({won(W0)}원)</th>
                  <th scope="col" className="r">{PREMIUM_MIN_WORKERS}명 미만</th>
                  <th scope="col">근거</th>
                </tr>
              </thead>
              <tbody>
                {T3.map(row => (
                  <tr key={row.kind}>
                    <th scope="row" className="wrap">{row.kind}</th>
                    <td className="r em">{x(row.five)}</td>
                    <td className="r">{won(W0 * row.five)}</td>
                    <td className="r">{x(1)}</td>
                    <td className="wrap">{row.law}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            예를 들어 {Y0}년 최저시급으로 주 5일 하루 {DAY_LEGAL_HOURS}시간을 일하면서 연장 {hrs(EXP.overtime)}시간과 주휴일 근무 {hrs(EXP.holidayWorkHours)}시간을 더 했고, 이 모든 근무 가운데 {hrs(EXP.night)}시간이 밤 {NIGHT_WINDOW.start - 12}시 이후였다면 {PREMIUM_MIN_WORKERS}명 이상 사업장의 주급은
            기본급 {won(amt(EXP, 'base'))}원 + 주휴 {won(amt(EXP, 'weeklyHoliday'))}원 + 연장 {won(amt(EXP, 'overtime'))}원 + 야간 가산 {won(amt(EXP, 'night'))}원 + 휴일 {won(amt(EXP, 'holiday'))}원 = <strong>{won(EXP.weekly)}원</strong>(월 {won(EXP.monthlyGross)}원)입니다.
            휴일 {hrs(EXP.holidayWorkHours)}시간은 {HOLIDAY_SPLIT_HOURS}시간까지 {x(payMultiplier('holiday', true))}, 나머지 {hrs(EXP.holidayOver)}시간은 {x(payMultiplier('holidayOver', true))}입니다. 같은 근무가 {PREMIUM_MIN_WORKERS}명 미만 사업장이면 가산이 빠져 주급 {won(EXPs.weekly)}원(월 {won(EXPs.monthlyGross)}원)입니다.
          </p>
          <p className="g-p">
            {PREMIUM_MIN_WORKERS}명 이상 사업장은 하루 {DAY_LEGAL_HOURS}시간·주 {WEEK_LEGAL_HOURS}시간(<A href={LAW.lsa50}>§50</A>)을 넘는 시간을 소정근로로 정할 수 없어서, 계산기는 넘는 부분을 자동으로 연장근로로 옮깁니다. 주 4일 하루 10시간이면 소정근로 {hrs(EX4x10.scheduled)}시간 + 연장 {hrs(EX4x10.autoOvertime)}시간이 되어 주휴도 {hrs(EX4x10.weeklyHolidayHours)}시간으로 계산됩니다.
            주 6일 하루 {DAY_LEGAL_HOURS}시간은 {PREMIUM_MIN_WORKERS}명 이상이면 {WEEK_LEGAL_HOURS}시간 + 연장 {hrs(EX6x8.autoOvertime)}시간으로 월 {won(EX6x8.monthlyGross)}원, 미만이면 전부 기본 시급으로 월 {won(EX6x8s.monthlyGross)}원입니다. 연장근로는 {PREMIUM_MIN_WORKERS}명 이상 사업장에서 1주 {OVERTIME_WEEKLY_LIMIT}시간까지라(<A href={LAW.lsa53}>§53①</A>, 단시간근로자는 기간제법 §6①) 넘으면 계산기가 경고합니다.
            상시 {PREMIUM_MIN_WORKERS}명 이상 사업장은 관공서 공휴일도 유급휴일(<A href={LAW.lsa55}>§55②</A>)이라 공휴일에 일하면 휴일근로 가산이 붙습니다.
          </p>
        </section>

        {/* ── 4. 휴게시간 ── */}
        <section>
          <h2 className="g-h2">휴게시간 — {BREAK_4.minWorkHours}시간에 {BREAK_4.minBreakMinutes}분, {BREAK_8.minWorkHours}시간에 {BREAK_8.minBreakMinutes / 60}시간 (무급)</h2>
          <p className="g-p">
            근로기준법 <A href={LAW.lsa54}>§54①</A>은 &lsquo;근로시간이 {BREAK_4.minWorkHours}시간인 경우에는 {BREAK_4.minBreakMinutes}분 이상, {BREAK_8.minWorkHours}시간인 경우에는 {BREAK_8.minBreakMinutes / 60}시간 이상의 휴게시간을 근로시간 도중에&rsquo; 주도록 합니다. 실무에서는 근로시간 {BREAK_4.minWorkHours}시간 이상 {BREAK_8.minWorkHours}시간 미만이면 {BREAK_4.minBreakMinutes}분, {BREAK_8.minWorkHours}시간 이상이면 {BREAK_8.minBreakMinutes}분 이상으로 보고, 이 계산기의 점검도 같은 기준입니다.
            {' '}이 조항에는 {korDate(BREAK_WAIVER_4H.act.promulgated)} 개정으로 단서가 붙어 <strong>{BREAK_WAIVER_DOT}부터</strong>는 &lsquo;근로시간이 {BREAK_WAIVER_4H.workHours}시간인 경우로서 근로자가 휴게시간을 이용하지 아니할 것을 명시적으로 요청한 때&rsquo;에는 휴게 없이 일할 수 있습니다(법률 제{BREAK_WAIVER_4H.act.no}호 부칙 §1 단서, 공포 후 6개월 뒤 시행).
            근로자의 명시적 요청이 요건이라 사용자가 일방적으로 휴게를 없앨 수는 없고, 조문이 &lsquo;근로시간이 {BREAK_WAIVER_4H.workHours}시간인 경우&rsquo;라고만 적고 있어 계산기는 하루 근로시간이 정확히 {BREAK_WAIVER_4H.workHours}시간인 날에만 이 단서를 안내합니다.
            휴게는 출근 전이나 퇴근 직전이 아니라 &lsquo;근로시간 도중&rsquo;이어야 하고, 근로자가 자유롭게 쓸 수 있어야 합니다(§54②). 이 조항은 {PREMIUM_MIN_WORKERS}명 미만 사업장에도 적용됩니다.
          </p>
          <p className="g-p">
            휴게시간은 임금을 받지 않는 시간입니다. 9시에 출근해 18시에 퇴근하고 점심 1시간을 쉬면 유급 근로시간은 8시간입니다. 계산기에서 &lsquo;출근~퇴근 시간(휴게 포함)&rsquo;을 체크하고 하루 9시간·휴게 60분을 넣으면 휴게를 빼고 계산합니다.
            반대로 손님이 없어 매장을 지키며 기다리는 시간처럼 사용자의 지휘·감독 아래 있는 대기시간은 휴게가 아니라 근로시간입니다(<A href={LAW.lsa50}>§50③</A>). 명목상 휴게라도 자리를 비울 수 없고 호출에 바로 응해야 한다면 근로시간으로 다툴 여지가 있으니 실제 근무 기록을 남겨 두세요.
          </p>
        </section>

        {/* ── 5. 공제 ── */}
        <section>
          <h2 className="g-h2">공제 — {BIZ_PCT}와 4대보험, 월 {INSURANCE_MIN_MONTHLY_HOURS}시간 기준</h2>
          <p className="g-p">
            <strong>{BIZ_PCT}</strong>는 사업소득 원천징수세율 {BIZ_TAX_PCT}(<A href={LAW.it129}>소득세법 §129①3호</A>)에 그 {LOCAL_RATIO_PCT}인 지방소득세를 더한 것입니다. 계산기는 소득세와 지방소득세를 각각 10원 미만 버림으로 계산합니다. {Y0}년 최저시급 주 {hrs(EX.scheduled)}시간이면 월 {won(EX.monthlyGross)}원에서 사업소득세 {won(ded(EX20B, 'incomeTax'))}원, 지방소득세 {won(ded(EX20B, 'localTax'))}원을 떼고 {won(EX20B.monthlyNet)}원을 받습니다.
            {' '}원천징수세액이 {SMALL_TAX}원 미만이면 떼지 않는 소액부징수(<A href={LAW.it86}>소득세법 §86 1호</A>)는 {korDate(BIZ_SMALL_TAX_EXEMPT_REMOVED_SINCE)} 지급분부터 인적용역을 계속·반복적으로 제공하고 받는 사업소득에는 적용되지 않아(<A href={LAW.itd149}>시행령 §149의3</A>), 알바비가 적어도 {BIZ_PCT}는 그대로 뗍니다. 계산기도 금액과 관계없이 {BIZ_PCT}를 적용합니다.
            {' '}{BIZ_PCT}로 처리된 소득은 다음 해 5월 종합소득세 신고로 정산하며, 소득·경비에 따라 일부를 돌려받거나 더 낼 수 있습니다.
          </p>
          <p className="g-p">
            <strong>4대보험</strong> 근로자 부담분은 {insuranceRatesFor(Y0).year}년 기준 국민연금 {R0.pension.employee}%(기준소득월액 상·하한 적용), 건강보험 {R0.health.employee}%, 장기요양보험(건강보험료의 {LTC_PCT}%), 고용보험 {R0.unemp.employee}%이고, 각 보험료는 10원 미만을 버립니다. 같은 월 {won(EX.monthlyGross)}원이면 국민연금 {won(ded(EX20I, 'pension'))}원, 건강보험 {won(ded(EX20I, 'health'))}원, 장기요양 {won(ded(EX20I, 'ltc'))}원, 고용보험 {won(ded(EX20I, 'unemp'))}원으로 합계 {won(EX20I.deductionTotal)}원입니다.
            {' '}국민연금 요율은 <A href={LAW.npAct}>국민연금법</A> 부칙(법률 제20903호) §4①에 따라 해마다 오르므로 근로자 부담이 {Y0}년 {PEN_Y0}%에서 {Y1}년 {PEN_Y1}%가 되고, 계산기에서 {Y1}년을 고르면 이 요율로 계산합니다{RY1.fallback && <>(건강·장기요양·고용보험의 {Y1}년 요율은 기준일 현재 요율표에 없어 {RY1.year}년 요율을 씁니다)</>}.
            근로소득세는 부양가족 수에 따라 간이세액표 금액이 달라 이 계산기에서는 빼지 않았습니다. 주 {WEEK_LEGAL_HOURS}시간 전후로 일한다면 <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>로 소득세까지 확인하세요.
          </p>
          <p className="g-p">
            1개월 소정근로시간이 <strong>{INSURANCE_MIN_MONTHLY_HOURS}시간 미만</strong>인 단시간근로자는 국민연금(<A href={LAW.np2}>국민연금법 시행령 §2 4호</A>)·건강보험(<A href={LAW.nhi9}>국민건강보험법 시행령 §9 1호</A>) 직장가입 대상이 아닙니다. 주 소정근로시간 × 365÷7÷12로 환산하면 주 약 {hrs(MONTHLY60_MIN_WEEKLY_HOURS)}시간부터 월 {INSURANCE_MIN_MONTHLY_HOURS}시간입니다.
            건강보험에는 예외 단서가 없지만, 국민연금은 {INSURANCE_MIN_MONTHLY_HOURS}시간 미만이어도 다음 중 하나에 해당하면 사업장가입자가 됩니다(시행령 §2 4호 단서).
          </p>
          <ul className="g-list">
            {PENSION_SHORT_HOUR_EXCEPTIONS.map(e => (
              <li key={e.item}>{e.item}목 — {pensionExceptionLabel(e)}</li>
            ))}
          </ul>
          <p className="g-p">
            라목의 &lsquo;보건복지부장관이 고시하는 금액&rsquo;은 이 페이지 기준일({HOURLY_PAY_REVIEWED})에 고시 원문을 확인하지 못해 숫자로 적지 않았습니다. 국민연금공단(국번 없이 1355)에 확인하세요. 계산기는 근속기간·다른 사업장·소득 고시 금액을 입력받지 않으므로 위 예외에 해당하면 국민연금 공제가 계산보다 더 생깁니다.
          </p>
          <p className="g-p">
            <strong>고용보험</strong>은 {EI_LAST_HOURS_YEAR}년 12월 31일까지는 월 {INSURANCE_MIN_MONTHLY_HOURS}시간 미만 또는 주 {UNEMP_MIN_WEEKLY_HOURS}시간 미만이면 빠지지만, {UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하거나 일용근로자이면 적용됩니다(<A href={LAW.ei3}>고용보험법 시행령 §3①·②</A>). 주 {EX13.workDays}일 {hrs(EX13.dayHours[0])}시간(주 {hrs(EX13.scheduled)}시간, 월 {hrs(EX13.monthlyScheduledHours)}시간)을 {UNEMP_LONG_TERM_MONTHS}개월 미만 일하면 {EX13.input.year}년 기준 근로자 부담 4대보험은 0원입니다.
            {' '}{EI_SINCE_KOR}부터는 <A href={LAW.ei10}>고용보험법 §10①2호</A>가 바뀌어(법률 제{EI_INCOME_BASIS.act.no}호, {korDate(EI_INCOME_BASIS.act.promulgated)} 공포) 적용 제외 기준이 근로시간이 아니라 &lsquo;보수가 대통령령으로 정하는 소득기준 미만&rsquo;이 됩니다. 일용근로자, {UNEMP_LONG_TERM_MONTHS}개월 이상 계속 일하는 근로자, 둘 이상 사업의 보수를 합쳐 소득기준 이상이 되어 합산을 신청한 근로자는 적용되고(§10②), {EI_SINCE_KOR} 전에 가입한 사람은 새 기준에 못 미쳐도 처음 이직하기 전까지 자격이 유지됩니다(부칙 §2).
            기준일 현재 소득기준 금액을 정한 시행령 개정은 나오지 않았습니다. 그래서 계산기는 {Y1}년을 고르면 {UNEMP_LONG_TERM_MONTHS}개월 미만 근무도 고용보험이 적용되는 것으로 가정해 계산하고, 결과에 그 사실을 표시합니다.
          </p>
          <DataFigure
            n={4}
            title={`공제 방식별 월 실수령 — ${Y0}년 최저시급 · 개근 · 가산 없음`}
            unit="단위: 원"
            source={<>자료: 소득세법 §129①3호·지방세법 §103의13({BIZ_PCT}), {insuranceRatesFor(Y0).year}년 4대보험 근로자 요율 — Youtil 계산(근로소득세 제외, 각 10원 미만 버림)</>}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">조건</th>
                  <th scope="col" className="r">월 급여(세전)</th>
                  <th scope="col" className="r">공제</th>
                  <th scope="col" className="r">실수령</th>
                </tr>
              </thead>
              <tbody>
                {T4.map(row => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td className="r">{won(row.r.monthlyGross)}</td>
                    <td className="r">−{won(row.r.deductionTotal)}</td>
                    <td className="r em">{won(row.r.monthlyNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <Callout tone="warn" title={`알바 ${BIZ_PCT}는 근로자 여부부터 확인하세요`}>
            정해진 시간에 출근해 지시를 받으며 시급을 받는다면 근로기준법상 근로자(<A href={LAW.lsa2}>§2①1호</A>)이고, 근로자인지는 계약서 이름이 아니라 실제 일하는 방식으로 판단합니다. 근로자를 사업소득({BIZ_PCT})으로 처리하면 고용보험이 빠져 실업급여 수급 요건을 채우기 어려워질 수 있습니다. 급여명세서의 공제 항목을 확인해 두세요.
          </Callout>
        </section>

        {/* ── 6. 최저임금 ── */}
        <section>
          <h2 className="g-h2">최저임금 위반 체크와 예외 — 수습·{Y1}년 인상·체불 신고</h2>
          <p className="g-p">
            최저임금은 근로자를 쓰는 모든 사업장에 적용되고(동거 친족만 쓰는 사업·가사 사용인 제외), 사용자는 최저임금 이상을 줘야 합니다(<A href={LAW.mw6}>최저임금법 §6①</A>). {PREMIUM_MIN_WORKERS}명 미만 사업장도 예외가 아닙니다.
            최저임금은 매년 고용노동부 장관이 결정·고시하고 다음 해 1월 1일부터 효력이 생깁니다(<A href={LAW.mw10}>§10</A>). {Y1}년 최저시급은 2026년 8월 고시된 {won(W1)}원으로 {Y0}년 {won(W0)}원보다 {won(W_UP)}원({W_UP_PCT}%) 오르고, 월 {MONTHLY_WORK_HOURS}시간 환산액은 {won(T2.find(t => t.year === Y1)?.monthly209 ?? 0)}원입니다.
          </p>
          <p className="g-p">
            일반 알바에게 적용될 수 있는 예외는 사실상 <strong>수습 감액</strong>입니다. {PROBATION_MIN_WAGE.minContractYears}년 이상 기간을 정해 근로계약을 맺고 수습 중인 근로자는 수습 시작일부터 {PROBATION_MIN_WAGE.maxMonths}개월까지 최저임금의 {PROB_PCT}%를 줄 수 있지만, 단순노무업무로 고용노동부 장관이 고시한 직종은 감액할 수 없습니다(<A href={LAW.mw5}>§5②</A>).
            이 밖에 정신장애나 신체장애로 근로능력이 현저히 낮은 사람 등으로 사용자가 고용노동부장관의 인가를 받은 경우는 최저임금 적용이 제외되고(<A href={LAW.mw7}>§7</A>), 「선원법」의 적용을 받는 선원에게는 최저임금법이 적용되지 않습니다(<A href={LAW.mw3}>§3②</A>).
          </p>
          <p className="g-p">
            어떤 직종이 단순노무인지는 고용노동부 고시로 정해지고, {PROBATION_MIN_WAGE.minContractYears}년 미만의 기간을 정해 계약했다면 직종과 관계없이 감액 대상이 아닙니다. 기간을 정하지 않은 계약이 &lsquo;{PROBATION_MIN_WAGE.minContractYears}년 이상의 기간을 정하여&rsquo;에 해당하는지는 조문에 따로 적혀 있지 않아 이 페이지에서는 단정하지 않으니, 수습 감액을 통보받았다면 고용노동부(국번 없이 1350)에 확인하세요. {Y0}년 {PROB_PCT}% 금액은 {won(EX_LOW.input.hourly)}원이며, 이 시급으로 주 {hrs(EX_LOW.scheduled)}시간을 일하면 최저시급보다 월 {won(EX_LOW.minWageShortfallMonthly)}원 적습니다.
          </p>
          <p className="g-p">
            계산기는 입력한 시급이 선택 연도 최저시급보다 낮으면 &lsquo;미달&rsquo;로 표시하고, 같은 근무를 최저시급으로 계산했을 때와의 월 차액을 보여 줍니다. 최저임금 미달 지급은 3년 이하 징역 또는 2천만원 이하 벌금 대상이고(최저임금법 §28①), 주휴수당·가산수당을 주지 않은 것도 근로기준법 위반입니다.
            받지 못한 임금은 {WAGE_CLAIM_YEARS}년 안에 청구해야 소멸시효가 지나지 않으니, 근로계약서·출퇴근 기록·급여 입금 내역을 모아 고용노동부(국번 없이 1350)에 상담하거나 진정을 넣으세요.
          </p>
          <Callout tone="note" title="이 계산기가 다루지 않는 것">
            탄력적·선택적 근로시간제, 포괄임금 약정, 식대 등 비과세 수당, 일용근로자 원천징수(일 단위 계산), 근로소득세 간이세액은 반영하지 않습니다. 주휴·4대보험 판단의 &lsquo;소정근로시간&rsquo;은 매주 같은 패턴을 가정한 값이라, 주마다 근무시간이 바뀌면 4주 평균으로 다시 따져야 합니다.
          </Callout>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        <section>
          <Disclaimer
            variant="finance"
            open
            sources={[
              { label: '근로기준법 §55 (휴일)', href: LAW.lsa55 },
              { label: '근로기준법 §56 (연장·야간·휴일 근로)', href: LAW.lsa56 },
              { label: '근로기준법 시행령 §30 (주휴일)', href: LAW.dec30 },
              { label: '기간제법 §6 (단시간근로자 초과근로)', href: LAW.pt6 },
              { label: '최저임금법 §10 (최저임금 고시)', href: LAW.mw10 },
              { label: '고용보험법 §10 (적용 제외 · 2027 소득기준)', href: LAW.ei10 },
              { label: '고용보험법 시행령 §3 (적용 제외)', href: LAW.ei3 },
              { label: '국민연금법 시행령 §2 (근로자 제외)', href: LAW.np2 },
              { label: '국민연금법 (부칙 §4 연도별 요율)', href: LAW.npAct },
              { label: '최저임금법 §5 (수습 감액)', href: LAW.mw5 },
              { label: '고용노동부 — 주휴수당 행정해석 변경(2021)', href: LAW.moel2021 },
            ]}
          >
            본 계산기는 {HOURLY_PAY_REVIEWED} 기준 법령과 최저시급·4대보험 요율로 계산한 <strong>추정치</strong>입니다. 매주 같은 근무 패턴과 개근을 가정하며, 실제 급여는 근로계약서·취업규칙, 실제 근무 기록, 비과세 수당, 근로소득세 원천징수에 따라 달라집니다.
            {' '}{Y1}년 국민연금은 법정 요율 {PEN_Y1}%로 계산하고{RY1.fallback && <>, 건강·장기요양·고용보험은 요율표에 {Y1}년 값이 없어 {RY1.year}년 요율로 계산합니다</>}. {Y1}년 고용보험 적용 여부는 시행령 소득기준이 정해지지 않아 적용으로 가정하며, 국민연금의 월 {INSURANCE_MIN_MONTHLY_HOURS}시간 미만 예외(시행령 §2 4호 단서)는 계산에 넣지 않습니다. 법적 판단이 필요하면 고용노동부 또는 공인노무사와 상담하세요.
          </Disclaimer>
        </section>

        <RelatedTools items={[
          { href: '/tools/finance/4-insurance', desc: '4대보험 근로자·사업주 부담을 항목별로' },
          { href: '/tools/finance/salary', desc: '월급제·연봉 기준 세후 실수령과 소득세' },
          { href: '/tools/finance/annual-leave', desc: '주 15시간 이상이면 연차도 — 발생 일수와 수당' },
          { href: '/tools/finance/severance', desc: '1년 이상·주 15시간 이상 근무했다면 퇴직금' },
          { href: '/tools/finance/unemployment-benefit', desc: '고용보험 가입 알바의 실업급여 예상액' },
          { href: '/tools/finance/freelance-tax', desc: '3.3% 떼인 소득의 5월 종합소득세 정산' },
        ]} />
      </div>
    </ToolPage>
  )
}
