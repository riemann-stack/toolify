/* app/guides/leaving-job-money/page.tsx (server) — 계산 해설 G3 '퇴사할 때 받는 돈 한 번에'
   여정: 퇴사 전 문턱(퇴직금·실업급여 요건) → 퇴직금(평균임금·통상임금·퇴직소득세) → 미사용 연차수당 → 실업급여
        → 한 사람의 퇴사 정산(예시) → 퇴사 다음 날의 건강보험·국민연금 → 중도 퇴사 연말정산·다음 해 5월 신고.
   ─ 법정 수치는 lib 단일 소스(krUnemployment·krInsuranceRates·krIncomeTax·krYearEndTax·krLabor)에서 보간한다.
   ─ 예시(월 300만 원·근속 3년 2개월·만 35세·권고사직)는 퇴직금 계산기 severanceUtils와 실업급여 계산기 lib/krUnemployment의
     같은 함수로 빌드 시 계산 → 계산기에 같은 값을 넣으면 같은 결과가 나온다. 날짜는 고정(빌드일과 무관).
   ─ 평균임금 < 통상임금 역전(월급제·변동급 없음)은 값으로 분기해 문장이 거짓이 되지 않게 한다.
     퇴직금(근로기준법 §2②)과 구직급여 기초일액(고용보험법 §45②) 모두 큰 쪽을 쓴다 — 실업급여 계산기 간편 모드의
     '고정급뿐'(기본 체크) 경로와 같다(ordinaryDailyFromMonthly·uiBaseDailyWage).
   ─ 도구 페이지 가이드(퇴직소득세 공제표·신청 절차·연차 일수 규칙표)와 겹치는 표는 싣지 않고 링크한다.
     연차 일수·적용 제외 기준은 lib/krLabor 상수만 쓴다(연차 계산기 코드는 가져오지 않는다). */
import Link from 'next/link'
import GuideLayout, { guideMetadata, Ref, GuideChecklist } from '../_components/GuideLayout'
import DataFigure from '@/components/DataFigure'
import Callout from '@/components/Callout'
import Faq from '@/components/Faq'
import {
  addDays, addMonths, calcAverageWageDaily, calcOrdinaryWageDaily, calcSeverance, calcSeveranceTax,
  calcThreeMonthPeriod, calcThreeMonthTotal, checkEligibility, fmtDate, parseDate, taxServiceYears,
} from '@/app/tools/finance/severance/severanceUtils'
import {
  BENEFIT_DAYS_2019, COVERAGE_BRACKETS, UI_BENEFIT_RATE, UI_DAILY_CAP_2026, UI_DAILY_FLOOR_2026, UI_DAILY_FLOOR_RATE,
  UI_DAILY_WORK_HOURS, UI_WAGE_DAILY_CAP_2026, calcUnemployment, coverageBracket, ordinaryDailyFromMonthly,
  uiBaseDailyWage, uiDailyFloor,
} from '@/lib/krUnemployment'
import { INSURANCE_RATES, MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, WORK_HOURS_WEEK } from '@/lib/krInsuranceRates'
import { BRACKETS_2026 } from '@/lib/krIncomeTax'
import { LOCAL_TAX_RATE } from '@/lib/krYearEndTax'
import { ANNUAL_LEAVE, LEAVE_DATES, LEAVE_MIN_WEEKLY_HOURS, LEAVE_MIN_WORKERS, LEAVE_PRECEDENTS } from '@/lib/krLabor'

const SLUG = 'leaving-job-money'
export const metadata = guideMetadata(SLUG)

/* ── 포맷 ───────────────────────────────────────────────── */
const num = (n: number) => Math.round(n).toLocaleString('ko-KR')
const won = (n: number) => `${num(n)}원`
const manwon = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만 원`
const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`
/** severanceUtils는 만원 단위 → 원 */
const man2won = (man: number) => Math.round(man * 10_000)
/** 'YYYY-MM-DD' → 'YYYY. M. D.' */
const dotYmd = (ymd: string) => `${ymd.split('-').map(Number).join('. ')}.`

/* ── 기준값 (lib 단일 소스) ─────────────────────────────── */
const R = INSURANCE_RATES[2026]
/** 임의계속가입 보험료 = 직장가입자 보험료율의 50%(국민건강보험법 제110조·고시) — 부동소수 정리 */
const HEALTH_HALF = Math.round((R.health.total / 2) * 1e4) / 1e4
const MIN_WAGE = MIN_HOURLY_WAGE[2026]
const TAX_MIN = Math.round(BRACKETS_2026[0].rate * 100)
const TAX_MAX = Math.round(BRACKETS_2026[BRACKETS_2026.length - 1].rate * 100)
/** 퇴직금 계산기의 '1년에 며칠분' — calcSeverance(1일 평균임금 1, 재직 365일) */
const SEV_DAYS_PER_YEAR = calcSeverance(1, 365)
const ALL_DAYS = [...Object.values(BENEFIT_DAYS_2019.under50), ...Object.values(BENEFIT_DAYS_2019['50plus'])]
const DAYS_MIN = Math.min(...ALL_DAYS)
const DAYS_MAX = Math.max(...ALL_DAYS)
const FLOOR_4H = uiDailyFloor(4)
/** 가입 1년 미만 구간은 나이와 무관하게 같은 일수인지 — 문장 분기 */
const LT1 = COVERAGE_BRACKETS[0]
const LT1_SAME = BENEFIT_DAYS_2019.under50[LT1.id] === BENEFIT_DAYS_2019['50plus'][LT1.id]
/** 2027년 1월 이후 이직자의 1일 하한(8시간) — 고용보험법 §46② 산식에 2027년 최저시급(lib) */
const FLOOR_2027 = uiDailyFloor(UI_DAILY_WORK_HOURS, 2027)
/** 연차(근로기준법 §60) — lib/krLabor */
const AL = ANNUAL_LEAVE
const SC = LEAVE_PRECEDENTS.oneYearContract
const MOEL_LEAVE_FROM = dotYmd(LEAVE_DATES.moelNextDayRuleFrom)

/* ── 예시: 퇴직금·실업급여 계산기와 같은 함수 ────────────────
   월 300만 원(기본급만, 상여·수당 없음) · 주 40시간·1일 8시간 · 마지막 근무일 2026-08-31 · 근속 38개월 · 만 35세 · 권고사직
   · 고용보험 가입은 이 회사 기간뿐 · 남은 연차 5일(통상임금 기준 수당) */
const EX_MONTHLY = 3_000_000
const EX_MONTHLY_MAN = EX_MONTHLY / 10_000
const EX_MONTHS = 38
const EX_AGE = 35
const EX_LEAVE_DAYS = 5
const EX_DAILY_HOURS = UI_DAILY_WORK_HOURS
const EX_END = parseDate('2026-08-31')
const startForMonths = (months: number) => addDays(addMonths(EX_END, -months), 1)
const EX_START = startForMonths(EX_MONTHS)
const EX_SERVICE = `${Math.floor(EX_MONTHS / 12)}년 ${EX_MONTHS % 12}개월`

const ELIG = checkEligibility(EX_START, EX_END, WORK_HOURS_WEEK)
/** 퇴직금 계산기가 퇴직금을 인정하는 최소 주 소정근로시간 — 같은 판정 함수로 탐색 */
const SEV_MIN_WEEK_HOURS = Array.from({ length: WORK_HOURS_WEEK + 1 }, (_, h) => h).find(h => checkEligibility(EX_START, EX_END, h).eligible) ?? WORK_HOURS_WEEK
const PERIOD = calcThreeMonthPeriod(EX_END)
const WAGE3 = calcThreeMonthTotal({ monthlyBase: [EX_MONTHLY_MAN, EX_MONTHLY_MAN, EX_MONTHLY_MAN], monthlyAllowance: [0, 0, 0], yearlyBonusMan: 0, unusedLeaveMan: 0 })
const AVG_D = calcAverageWageDaily(WAGE3.total, PERIOD.days)          // 만원
const ORD_D = calcOrdinaryWageDaily(EX_MONTHLY_MAN, EX_DAILY_HOURS)   // 만원
const APPLIED_D = Math.max(AVG_D, ORD_D)
const ORD_WINS = ORD_D > AVG_D
const TAX_YEARS = taxServiceYears(EX_START, EX_END)
const SEV_AVG = ELIG.eligible ? calcSeverance(AVG_D, ELIG.daysWorked) : 0
const SEV = ELIG.eligible ? calcSeverance(APPLIED_D, ELIG.daysWorked) : 0
const SEV_TAX = calcSeveranceTax(SEV, TAX_YEARS)
const LEAVE_PAY = man2won(ORD_D) * EX_LEAVE_DAYS

/* 실업급여 — 계산기와 같은 경로: 기초일액 = 평균임금일액, 1일 통상임금이 더 크면 통상임금(고용보험법 §45②) → calcUnemployment */
const U_AVG_DAILY = man2won(AVG_D)
const U_ORD_DAILY = ordinaryDailyFromMonthly(EX_MONTHLY)
const U_BASE = uiBaseDailyWage(U_AVG_DAILY, U_ORD_DAILY)
const U = calcUnemployment(U_BASE.base, EX_AGE, false, EX_MONTHS)
/** 참고: 월급에 변동급이 섞여 평균임금일액이 기초일액이 되는 경우 */
const U_VAR = calcUnemployment(U_AVG_DAILY, EX_AGE, false, EX_MONTHS)
const capLabel = (c: 'upper' | 'lower' | 'none') => (c === 'upper' ? '상한' : c === 'lower' ? '하한' : `${pct(UI_BENEFIT_RATE)} 그대로`)
const COMPANY_TOTAL = man2won(SEV_TAX.netSeverance) + LEAVE_PAY

/* 표 2 — 같은 퇴사일·같은 월급, 근속만 바꾼 퇴직금 */
const SEV_ROWS = [
  { label: '1년에서 하루 모자람', start: addDays(startForMonths(12), 1) },
  { label: '1년', start: startForMonths(12) },
  { label: `${EX_SERVICE}(예시)`, start: EX_START },
  { label: '5년', start: startForMonths(60) },
  { label: '10년', start: startForMonths(120) },
  { label: '20년', start: startForMonths(240) },
].map(row => {
  const e = checkEligibility(row.start, EX_END, WORK_HOURS_WEEK)
  const sevAvg = e.eligible ? calcSeverance(AVG_D, e.daysWorked) : 0
  const sev = e.eligible ? calcSeverance(APPLIED_D, e.daysWorked) : 0
  const tax = calcSeveranceTax(sev, taxServiceYears(row.start, EX_END))
  return { ...row, eligible: e.eligible, days: e.daysWorked, years: tax.yearsTax, sevAvg, sev, tax }
})
const PAID_ROWS = SEV_ROWS.filter(r => r.eligible)
const MAX_EFF_RATE = Math.max(...PAID_ROWS.map(r => r.tax.taxRatePct))
const NO_SEV_ROW = SEV_ROWS.find(r => !r.eligible)
const ONE_YEAR_ROW = SEV_ROWS[1]

/* ── 참고 자료 (배열 순서 = 본문 <Ref n>) ───────────────── */
const LAW = 'https://www.law.go.kr/법령'
const SOURCES = [
  { label: '근로자퇴직급여 보장법 제3조(적용범위)·제4조(퇴직급여제도의 설정)', href: `${LAW}/근로자퇴직급여보장법/제4조`, org: '국가법령정보센터' },         // 1
  { label: '근로자퇴직급여 보장법 제8조(퇴직금제도의 설정 등)', href: `${LAW}/근로자퇴직급여보장법/제8조`, org: '국가법령정보센터' },                              // 2
  { label: '근로자퇴직급여 보장법 제9조(퇴직금의 지급 등)', href: `${LAW}/근로자퇴직급여보장법/제9조`, org: '국가법령정보센터' },                                   // 3
  { label: '근로기준법 제2조(정의) 제1항 제6호·제2항 — 평균임금, 통상임금이 더 큰 경우', href: `${LAW}/근로기준법/제2조`, org: '국가법령정보센터' },               // 4
  { label: '근로기준법 시행령 제6조(통상임금)', href: `${LAW}/근로기준법시행령/제6조`, org: '국가법령정보센터' },                                               // 5
  { label: '대구지방법원 2024나318050 판결(항소심) — 사건번호로 판결서 인터넷열람', href: 'https://www.scourt.go.kr', org: '대법원' },                           // 6
  { label: '소득세법 제48조(퇴직소득공제) — 근속연수공제·환산급여공제', href: `${LAW}/소득세법/제48조`, org: '국가법령정보센터' },                               // 7
  { label: '소득세법 제55조(세율) 제2항 — 퇴직소득 산출세액', href: `${LAW}/소득세법/제55조`, org: '국가법령정보센터' },                                          // 8
  { label: '소득세법 제146조(퇴직소득에 대한 원천징수시기와 방법 및 원천징수영수증의 발급 등)', href: `${LAW}/소득세법/제146조`, org: '국가법령정보센터' },           // 9
  { label: '근로기준법 제60조(연차 유급휴가)', href: `${LAW}/근로기준법/제60조`, org: '국가법령정보센터' },                                                      // 10
  { label: '근로기준법 제11조(적용 범위)·같은 법 시행령 제7조 [별표 1]', href: `${LAW}/근로기준법/제11조`, org: '국가법령정보센터' },                              // 11
  { label: '근로기준법 제18조(단시간근로자의 근로조건) 제3항', href: `${LAW}/근로기준법/제18조`, org: '국가법령정보센터' },                                        // 12
  { label: '근로기준법 제36조(금품 청산)', href: `${LAW}/근로기준법/제36조`, org: '국가법령정보센터' },                                                           // 13
  { label: `${SC.court} ${SC.date} 선고 ${SC.caseNo} 판결`, href: `https://www.law.go.kr/판례/(${SC.caseNo})`, org: '국가법령정보센터' },                       // 14
  { label: `고용노동부 — 연차 유급휴가 행정해석 변경(${MOEL_LEAVE_FROM} 시행, ${SC.caseNo} 판결 반영)`, href: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=13052', org: '고용노동부' }, // 15
  { label: '고용노동부 — 퇴직금 산정 안내(평균임금이 통상임금보다 적으면 통상임금으로 계산)', href: 'https://www.moel.go.kr', org: '고용노동부' },                    // 16
  { label: '고용보험법 제40조(구직급여의 수급 요건)', href: `${LAW}/고용보험법/제40조`, org: '국가법령정보센터' },                                                // 17
  { label: '고용보험법 제45조(급여의 기초가 되는 임금일액)·제46조(구직급여일액)', href: `${LAW}/고용보험법/제45조`, org: '국가법령정보센터' },                         // 18
  { label: '고용보험법 제48조(수급기간 및 수급일수)·제49조(대기기간)·제50조(소정급여일수 및 피보험기간)·별표 1', href: `${LAW}/고용보험법/제50조`, org: '국가법령정보센터' }, // 19
  { label: '고용보험법 제58조(이직 사유에 따른 수급자격의 제한)', href: `${LAW}/고용보험법/제58조`, org: '국가법령정보센터' },                                    // 20
  { label: '고용24 — 실업급여 신청·모의계산', href: 'https://www.work24.go.kr', org: '고용노동부' },                                                              // 21
  { label: '고용노동부 보도자료 「고용보험 제도개선 TF 논의결과」 — 고용보험위원회 보고(2026. 9. 1.)', href: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19866', org: '고용노동부' }, // 22
  { label: '국민건강보험법 제9조(자격의 변동 시기 등)', href: `${LAW}/국민건강보험법/제9조`, org: '국가법령정보센터' },                                            // 23
  { label: '국민건강보험법 제69조(보험료)·제110조(실업자에 대한 특례)', href: `${LAW}/국민건강보험법/제110조`, org: '국가법령정보센터' },                            // 24
  { label: '국민건강보험공단 — 임의계속가입·퇴직 정산 안내', href: 'https://www.nhis.or.kr', org: '국민건강보험공단' },                                             // 25
  { label: '국민건강보험법 시행령 제41조(소득월액)·제42조(지역가입자의 보험료부과점수)', href: `${LAW}/국민건강보험법시행령/제42조`, org: '국가법령정보센터' },        // 26
  { label: '국민연금법 제12조(가입자 자격의 상실 시기)', href: `${LAW}/국민연금법/제12조`, org: '국가법령정보센터' },                                              // 27
  { label: '국민연금법 제91조(연금보험료 납부의 예외)·제19조의2(실업에 대한 가입기간 추가 산입)', href: `${LAW}/국민연금법/제91조`, org: '국가법령정보센터' },          // 28
  { label: '국민연금공단 — 납부예외·실업크레딧 안내', href: 'https://www.nps.or.kr', org: '국민연금공단' },                                                         // 29
  { label: '소득세법 제137조(근로소득세액의 연말정산)', href: `${LAW}/소득세법/제137조`, org: '국가법령정보센터' },                                                // 30
  { label: '소득세법 제70조(종합소득과세표준 확정신고)', href: `${LAW}/소득세법/제70조`, org: '국가법령정보센터' },                                                // 31
  { label: '소득세법 제73조(과세표준확정신고의 예외)', href: `${LAW}/소득세법/제73조`, org: '국가법령정보센터' },                                                  // 32
  { label: '국세기본법 제45조의2(경정 등의 청구)', href: `${LAW}/국세기본법/제45조의2`, org: '국가법령정보센터' },                                                  // 33
  { label: '소득세법 제12조(비과세소득) 제3호 마목 — 고용보험법에 따른 실업급여', href: `${LAW}/소득세법/제12조`, org: '국가법령정보센터' },                           // 34
  { label: '국세청 — 중도 퇴사자 연말정산·종합소득세 확정신고 안내', href: 'https://www.nts.go.kr', org: '국세청' },                                                // 35
]

/* ── FAQ (답변 = 신뢰된 정적 HTML, 수치는 위 상수에서 보간) ── */
const FAQ = [
  {
    q: '퇴직금을 받으면 실업급여가 줄어드나요?',
    a: `아닙니다. 퇴직금은 근로자퇴직급여 보장법, 구직급여는 고용보험법에 따른 별개의 급여라 각각 요건을 갖추면 둘 다 받습니다. 퇴직금 액수는 구직급여 1일액이나 소정급여일수에 들어가지 않습니다. 다만 두 제도 모두 <strong>퇴사 전 3개월 평균임금</strong>(통상임금이 더 크면 통상임금)을 출발점으로 쓰므로, 그 3개월의 임금이 두 금액을 함께 움직입니다.`,
  },
  {
    q: '딱 1년 일하고 퇴사하면 연차수당은 어떻게 되나요?',
    a: `퇴직금은 마지막 근무일이 입사 1년째 되는 날이면 생기지만, 1년간 ${AL.attendanceMinPct}% 이상 출근해서 생기는 연차 ${AL.base}일(근로기준법 제60조 제1항)은 <strong>1년 근로를 마친 다음 날에도 근로관계가 있어야</strong> 생깁니다. ${SC.court} 판결(${SC.date} 선고 ${SC.caseNo})에 따라 고용노동부가 ${MOEL_LEAVE_FROM}부터 행정해석을 바꾼 내용입니다. 그래서 딱 1년만 일하고 그만두면 1년 미만 기간에 매달 생긴 연차(제2항, 최대 ${AL.firstYearMonthlyMax}일)만 정산 대상이 됩니다. 상시 ${LEAVE_MIN_WORKERS - 1}명 이하 사업장이거나 4주 평균 주 ${LEAVE_MIN_WEEKLY_HOURS}시간 미만으로 일했다면 연차 규정 자체가 적용되지 않습니다. 남은 일수는 <a href="/tools/finance/annual-leave">연차 계산기</a>로 확인하세요.`,
  },
  {
    q: '퇴사하면서 받은 연차수당도 퇴직금 평균임금에 들어가나요?',
    a: `고용노동부 행정해석은 둘을 나눕니다. 퇴직하면서 <strong>비로소 지급 사유가 생긴</strong> 미사용 연차수당은 퇴직 전에 지급된 임금이 아니므로 평균임금에 넣지 않습니다. 반면 퇴직 전년도에 생긴 연차를 쓰지 못해 이미 받은 수당이 있다면 그 금액의 3/12을 평균임금 산정 임금에 넣습니다. 회사 정산표에서 연차수당이 어느 쪽으로 들어갔는지 확인해 보세요.`,
  },
  {
    q: '실업급여도 다음 해 5월 종합소득세 신고에 넣어야 하나요?',
    a: `넣지 않습니다. 고용보험법에 따라 받는 실업급여는 소득세법 제12조 제3호 마목의 비과세소득이라 신고할 소득에 포함되지 않습니다. 근로소득만 있고 퇴사 때 연말정산을 받았다면 5월 신고는 의무가 아니며, 퇴사 달 연말정산에서 빠진 카드·의료비·교육비 같은 공제를 받고 싶을 때 신고하거나 경정청구를 하면 됩니다.`,
  },
  {
    q: '퇴직금을 받으면 지역 건강보험료가 오르나요?',
    a: `지역가입자 보험료에 반영하는 소득은 국민건강보험법 시행령 제42조가 제41조 제1항을 따라 정한 이자·배당·사업·근로·연금·기타소득이라 <strong>퇴직소득은 포함되지 않고</strong>, 비과세인 실업급여도 들어가지 않습니다. 지역보험료는 다른 소득과 재산으로 정해지므로, 첫 고지서를 받은 뒤 임의계속가입 보험료와 비교해 고르면 됩니다.`,
  },
  {
    q: '회사가 준 퇴직금이 계산기 결과보다 적어요.',
    a: `먼저 산정 3개월의 임금 항목(상여 3/12, 전년도 연차수당 3/12)과 재직일수가 같은지 확인하세요. 그래도 다르면 <strong>통상임금 적용 여부</strong>가 원인일 수 있습니다. 퇴직금 계산기는 1일 평균임금과 1일 통상임금(월 통상임금 ÷ ${MONTHLY_WORK_HOURS}시간 × 1일 소정근로시간) 가운데 큰 쪽을 쓰는 고용노동부 방식을 따르지만, 평균임금이 평소 임금을 제대로 반영하면 통상임금을 우선할 수 없다고 본 하급심 판결(대구지방법원 2024나318050, 항소심)도 있습니다. 2026년 2월 보도 기준으로 대법원 판단은 아직 없습니다. 회사가 어떤 근거로 계산했는지 묻고, 이견이 있으면 고용노동부 고객상담센터(1350)에 문의하세요.`,
  },
]

export default function LeavingJobMoneyGuide() {
  return (
    <GuideLayout
      slug={SLUG}
      lead={<>회사를 그만둘 때 받는 돈은 한 번에 들어오지 않습니다. 퇴직금과 남은 연차수당은 퇴사 후 14일 안에 회사가 주고, 실업급여는 직접 신청해야 고용센터가 나눠 주며, 건강보험과 세금은 퇴사 다음 날부터 따로 정리해야 합니다. 이 글은 그 순서를 법 조문과 함께 따라가고, 월급 {manwon(EX_MONTHLY)}·근속 {EX_SERVICE}·만 {EX_AGE}세 한 사람의 퇴사를 퇴직금·실업급여 계산기와 같은 코드로 끝까지 계산해 봅니다.</>}
      basis={<>2026년 이직자 구직급여 1일 상한 {won(UI_DAILY_CAP_2026)}·하한 {won(UI_DAILY_FLOOR_2026)}(1일 8시간) · 2026년 최저시급 {won(MIN_WAGE)} · 소득세 누진세율 {TAX_MIN}~{TAX_MAX}% · 법령은 2026년 9월 현행</>}
      glance={[
        <>퇴사할 때 챙길 돈은 <strong>퇴직금 · 미사용 연차수당 · 실업급여</strong>입니다. 앞의 둘은 퇴사 후 14일 안에 회사가, 실업급여는 본인이 신청해야 고용센터가 줍니다. 연차수당은 상시 {LEAVE_MIN_WORKERS}명 이상 사업장에서 주 {LEAVE_MIN_WEEKLY_HOURS}시간 이상 일했을 때만 생깁니다.</>,
        <>퇴직금은 1년 이상·주 {SEV_MIN_WEEK_HOURS}시간 이상 일했으면 생기고, 1년에 <strong>{SEV_DAYS_PER_YEAR}일분 평균임금</strong>이 기준입니다. 평균임금이 통상임금보다 적으면 통상임금으로 계산합니다.</>,
        <>2026년 구직급여는 기초일액(평균임금, 통상임금이 더 크면 통상임금)의 {pct(UI_BENEFIT_RATE)}를 하루 <strong>{won(UI_DAILY_FLOOR_2026)}~{won(UI_DAILY_CAP_2026)}</strong> 사이로 맞춰 나이·가입기간에 따라 {DAYS_MIN}~{DAYS_MAX}일 동안 줍니다.</>,
        <>예시(월 {manwon(EX_MONTHLY)}·{EX_SERVICE}·만 {EX_AGE}세·권고사직)는 퇴직금 세전 약 <strong>{manwon(man2won(SEV))}</strong>이 IRP 계좌로 들어오고(일시금으로 찾으면 세후 약 {manwon(man2won(SEV_TAX.netSeverance))}), 구직급여는 {U.benefitDays}일 동안 약 <strong>{manwon(U.totalBenefit)}</strong>입니다.</>,
        <>퇴사 다음 날 건강보험은 지역가입자로 바뀝니다. 피부양자·임의계속가입과 비교하고, 퇴사 때 연말정산에서 빠진 공제는 다음 해 5월 신고(의무는 아님)나 경정청구로 챙깁니다.</>,
      ]}
      sources={SOURCES}
      related={[
        { href: '/tools/finance/severance', desc: '입사·퇴사일과 3개월 임금으로 퇴직금·퇴직소득세' },
        { href: '/tools/finance/unemployment-benefit', desc: '나이·가입기간으로 구직급여 1일액과 총액' },
        { href: '/tools/finance/annual-leave', desc: '입사일로 남은 연차 일수와 수당' },
        { href: '/tools/finance/4-insurance', desc: '재직 때 내던 4대보험 근로자분 확인' },
        { href: '/tools/finance/year-end-tax', desc: '중도 퇴사 후 5월 신고 전 결정세액 미리 보기' },
        { href: '/tools/finance/salary', desc: '재취업할 곳의 연봉을 월 실수령액으로' },
      ]}
      disclaimer={<>이 글의 예시는 월 {manwon(EX_MONTHLY)}을 상여·수당 없이 받고, 권고사직으로 퇴사하며, 고용보험 가입 이력이 이 회사뿐이라고 가정한 추정입니다. 퇴직금은 회사의 정산(퇴직연금 제도 포함), 구직급여의 수급자격과 금액은 고용센터 심사, 세금은 국세청 기준으로 최종 확정됩니다.</>}
    >
      <h2 id="before" data-toc="퇴사 전 — 두 개의 문턱">퇴사 전에 확인할 두 개의 문턱</h2>
      <p>
        퇴사할 때 받는 돈은 대부분 요건을 넘어야 생깁니다. <strong>퇴직금</strong>은 사업장 규모와 관계없이 계속근로기간 1년 이상, 4주 평균 주 소정근로시간 {SEV_MIN_WEEK_HOURS}시간 이상인 근로자에게 생깁니다<Ref n={1} />.
        1년은 입사일부터 1년 뒤 같은 날의 전날까지 일해야 채워집니다. 퇴직금 계산기의 판정으로 보면, {fmtDate(EX_END)}에 마지막으로 근무하는 경우 {fmtDate(ONE_YEAR_ROW.start)} 입사자는
        퇴직금이 {ONE_YEAR_ROW.eligible ? '생기고' : '생기지 않고'}{NO_SEV_ROW ? <>, 하루 늦은 {fmtDate(NO_SEV_ROW.start)} 입사자는 0원입니다.</> : '.'}
      </p>
      <p>
        <strong>실업급여(구직급여)</strong>는 이직일 이전 18개월 동안 고용보험 피보험 단위기간이 합산 180일 이상이고, 일할 의사와 능력이 있는데 취업하지 못했으며,
        이직 사유가 수급 제한 사유가 아니어야 합니다<Ref n={17} />. 피보험 단위기간은 보수 지급의 기초가 된 날만 세므로 달력 일수보다 짧습니다. 자기 사정으로 그만두면
        원칙적으로 받지 못하지만 법령이 정한 정당한 사유가 있으면 예외입니다<Ref n={20} />. 심사는 회사가 고용보험에 내는 이직확인서의 이직 사유에서 출발하므로, 퇴사 합의 내용과 같게 적히는지 확인해 두세요.
        두 제도는 별개라 하나를 받는다고 다른 하나가 줄지 않습니다.
      </p>
      <DataFigure
        n={1}
        title="퇴사 전후 일정 — 무엇을 언제"
        source={<>자료: 각 근거 법령<Ref n={1} /><Ref n={3} /><Ref n={13} /><Ref n={19} /><Ref n={23} /><Ref n={24} /><Ref n={27} /><Ref n={28} /><Ref n={30} /><Ref n={31} /><Ref n={32} /><Ref n={33} /> — 당사자 합의로 퇴직금·금품 지급일을 늦출 수 있는 등 예외는 본문 참고</>}
      >
        <table>
          <thead><tr><th scope="col">시점</th><th scope="col">할 일 · 받는 돈</th><th scope="col">근거</th></tr></thead>
          <tbody>
            <tr><th scope="row">퇴사 전</th><td className="wrap">근속 1년·주 {SEV_MIN_WEEK_HOURS}시간 확인, 남은 연차 확인, IRP 계좌 개설</td><td className="wrap">퇴직급여법 제4조·제9조</td></tr>
            <tr><th scope="row" className="wrap">퇴사 후 14일 안</th><td className="wrap">퇴직금(원칙적으로 IRP로 이전), 마지막 급여와 미사용 연차수당</td><td className="wrap">퇴직급여법 제9조, 근로기준법 제36조</td></tr>
            <tr><th scope="row">마지막 급여</th><td className="wrap">건강·고용보험 퇴직 정산, 중도 퇴사 연말정산</td><td className="wrap">소득세법 제137조</td></tr>
            <tr><th scope="row">퇴사 다음 날</th><td className="wrap">건강보험 지역가입자(또는 피부양자), 국민연금 지역가입 또는 납부예외</td><td className="wrap">국민건강보험법 제9조·제69조, 국민연금법 제12조·제91조</td></tr>
            <tr><th scope="row">퇴사 직후</th><td className="wrap">고용24 구직신청 → 수급자격 인정 신청. 실업 신고일부터 7일은 대기기간</td><td className="wrap">고용보험법 제49조</td></tr>
            <tr><th scope="row" className="wrap">이직 다음 날부터 12개월</th><td className="wrap">구직급여 수급기간 — 이 안에 받지 못한 일수는 사라짐</td><td className="wrap">고용보험법 제48조</td></tr>
            <tr><th scope="row" className="wrap">첫 지역보험료 납부기한 + 2개월</th><td className="wrap">건강보험 임의계속가입 신청 마감</td><td className="wrap">국민건강보험법 제110조</td></tr>
            <tr><th scope="row">다음 해 5월</th><td className="wrap">빠진 공제가 있으면 종합소득세 확정신고(의무 아님), 기한이 지나면 경정청구</td><td className="wrap">소득세법 제70조·제73조, 국세기본법 제45조의2</td></tr>
          </tbody>
        </table>
      </DataFigure>

      <h2 id="severance" data-toc="퇴직금 — 평균임금과 통상임금">퇴직금 — 3개월 평균임금, 그리고 통상임금과의 비교</h2>
      <p>
        퇴직금은 계속근로 1년에 대해 {SEV_DAYS_PER_YEAR}일분 이상의 평균임금입니다<Ref n={2} />. 평균임금은 퇴사 전 3개월 동안 받은 임금 총액을 그 기간의 달력 일수로 나눈 금액이고<Ref n={4} />,{' '}
        <Link href="/tools/finance/severance">퇴직금 계산기</Link>는 1일 평균임금 × {SEV_DAYS_PER_YEAR} × 재직일수 ÷ 365로 재직일수에 비례해 계산합니다. 상여금과 전년도 연차수당은 1년 치의 3/12만 이 3개월에 넣습니다.
      </p>
      <p>
        여기에 한 가지 비교가 붙습니다. 근로기준법은 평균임금이 통상임금보다 적으면 <strong>통상임금을 평균임금으로</strong> 보라고 정합니다<Ref n={4} />. 주 {WORK_HOURS_WEEK}시간 월급제라면 1일 통상임금은 월 통상임금을
        {' '}{MONTHLY_WORK_HOURS}시간으로 나눈 시간급에 1일 소정근로시간을 곱해 구합니다<Ref n={5} />. 예시처럼 월 {manwon(EX_MONTHLY)}을 상여·수당 없이 받으면 산정기간 {fmtDate(PERIOD.start)}~{fmtDate(PERIOD.end)}({PERIOD.days}일)의
        1일 평균임금은 {won(man2won(AVG_D))}, 1일 통상임금은 {won(man2won(ORD_D))}입니다.
        {ORD_WINS
          ? <> 평균임금은 주말까지 포함한 달력 일수로 나누고 통상임금은 소정근로시간으로 나누기 때문에, 변동급이 없는 월급제에서는 이렇게 통상임금이 더 크게 나오기 쉽습니다.</>
          : <> 이 경우에는 평균임금이 더 커서 평균임금이 그대로 쓰입니다.</>}
      </p>
      <Callout tone="warn" title="퇴직금의 통상임금 적용은 해석이 갈립니다">
        고용노동부는 두 금액을 그대로 비교해 큰 쪽으로 퇴직금을 계산하라고 안내하고, 퇴직금 계산기도 이 방식을 따릅니다<Ref n={4} /><Ref n={16} />. 반면 평균임금이 평소 생활임금을 제대로 반영한다면
        금액이 크다는 이유만으로 통상임금을 우선할 수 없다고 본 하급심 판결(대구지방법원 2024나318050, 항소심)도 있고<Ref n={6} />, 2026년 2월 보도 기준으로 이 쟁점에 대한 대법원 판단은 아직 없습니다.
        그래서 아래 표는 두 기준을 모두 싣습니다. 구직급여는 고용보험법이 &lsquo;평균임금이 통상임금보다 적으면 통상임금을 기초일액으로 한다&rsquo;고 따로 정하고 있어 이 논쟁과 별개입니다<Ref n={18} />.
      </Callout>
      <p>
        퇴직금에는 근로소득세가 아니라 <strong>퇴직소득세</strong>가 붙습니다. 퇴직금에서 근속연수공제를 뺀 금액을 근속연수로 나눠 12를 곱한 &lsquo;환산급여&rsquo;를 만들고, 여기서 환산급여공제를 뺀 금액에
        {' '}{TAX_MIN}~{TAX_MAX}% 세율을 매긴 뒤, 그 세액을 12로 나눠 근속연수를 곱합니다<Ref n={7} /><Ref n={8} />. 여러 해 치를 1년 치로 펴서 세율을 적용하는 구조라 같은 금액을 한 해 소득으로 받을 때보다 세금이 훨씬 적습니다.
        세법상 근속연수는 1년 미만을 1년으로 올려 세므로 예시의 근속 기간({EX_SERVICE})은 {TAX_YEARS}년으로 계산하고, 지방소득세 {pct(LOCAL_TAX_RATE)}가 더해집니다. 공제 구간표는 퇴직금 계산기 페이지에 있습니다.
      </p>
      <DataFigure
        n={2}
        title={`근속기간별 퇴직금 — 월 ${manwon(EX_MONTHLY)}, ${fmtDate(EX_END)} 퇴사`}
        unit="단위: 원"
        source={<>자료: 퇴직금 계산기와 같은 계산 코드로 빌드 시 계산 — 주 {WORK_HOURS_WEEK}시간·1일 {EX_DAILY_HOURS}시간, 상여·수당 없음, 산정기간 {PERIOD.days}일. 세금·세후는 통상임금 적용 퇴직금을 일시금으로 받을 때 기준(2023년 개정 공제)</>}
      >
        <table>
          <thead>
            <tr><th scope="col">근속</th><th scope="col" className="r">평균임금 기준</th><th scope="col" className="r">통상임금 적용</th><th scope="col" className="r">퇴직소득세·지방세</th><th scope="col" className="r">세후</th></tr>
          </thead>
          <tbody>
            {SEV_ROWS.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {r.eligible ? (
                  <>
                    <td className="r">{num(man2won(r.sevAvg))}<small>재직 {num(r.days)}일</small></td>
                    <td className="r">{num(man2won(r.sev))}</td>
                    <td className="r">{num(man2won(r.tax.totalTax))}<small>실효 {r.tax.taxRatePct.toFixed(2)}%</small></td>
                    <td className="r em">{num(man2won(r.tax.netSeverance))}</td>
                  </>
                ) : (
                  <td className="wrap" colSpan={4}>재직 {num(r.days)}일 — 1년 미달로 법정 퇴직금 없음</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        1년에서 하루 모자라면 0원이고 1년을 채우면 바로 {won(man2won(ONE_YEAR_ROW.sevAvg))}~{won(man2won(ONE_YEAR_ROW.sev))}이 생기는, 이 경계가 퇴직금의 유일한 절벽입니다.
        그 뒤로는 재직일수에 비례해 늘고, 퇴직소득세 실효세율은 표의 모든 경우에 {MAX_EFF_RATE.toFixed(2)}% 이하입니다. 퇴직금은 퇴사 후 14일 안에 주되 특별한 사정이 있으면 당사자 합의로 늦출 수 있고,
        원칙적으로 본인 명의 IRP(개인형퇴직연금) 계좌로 옮기는 방식으로 지급하며 나이·금액 등 시행령이 정한 사유가 있을 때만 예외입니다<Ref n={3} />.
        IRP로 옮길 때는 퇴직소득세를 떼지 않고, 나중에 일시금으로 꺼내는지 연금으로 받는지에 따라 세금을 냅니다<Ref n={9} />. 그래서 표의 세금과 세후 금액은 IRP에서 일시금으로 찾을 때 기준입니다.
      </p>

      <h2 id="annual-leave" data-toc="미사용 연차수당">미사용 연차수당 — 마지막 급여에 붙는 돈</h2>
      <p>
        연차 유급휴가는 근로기준법 제60조가 정한 휴가입니다. 계속근로 1년 미만이면 1개월 개근할 때마다 하루씩 최대 {AL.firstYearMonthlyMax}일이 생기고, 1년간 {AL.attendanceMinPct}% 이상 출근하면 {AL.base}일이 생기며,
        {' '}{AL.addFromYears}년 이상 근속하면 {AL.addEveryYears}년마다 하루씩 늘어 {AL.cap}일이 한도입니다<Ref n={10} />. 다만 <strong>상시 {LEAVE_MIN_WORKERS - 1}명 이하 사업장</strong>과 4주 평균 주 소정근로시간이
        {' '}{LEAVE_MIN_WEEKLY_HOURS}시간 미만인 근로자에게는 연차 규정이 적용되지 않아 미사용 연차수당도 없습니다(근로계약이나 취업규칙으로 따로 정했다면 그 약정을 따릅니다)<Ref n={11} /><Ref n={12} />.
        사업장 규모와 관계없이 적용되는 퇴직금과 다른 점입니다.
      </p>
      <p>
        퇴사로 근로관계가 끝나면 남은 연차를 쓸 수 없으므로 그 일수만큼 수당으로 받고, 이 돈은 마지막 급여와 함께 14일 안에 청산해야 하는 금품입니다<Ref n={13} />.
        수당 단가는 취업규칙 등이 정한 통상임금 또는 평균임금이며, 통상임금 기준이라면 예시의 하루치는 {won(man2won(ORD_D))}입니다. 내 남은 일수는{' '}
        <Link href="/tools/finance/annual-leave">연차 계산기</Link>로 확인할 수 있습니다.
      </p>
      <p>
        두 가지를 조심하세요. 첫째, 1년간 출근해서 생기는 {AL.base}일은 <strong>1년 근로를 마친 다음 날에도 근로관계가 있어야</strong> 생깁니다. {SC.court} 판결({SC.caseNo})에 따라 고용노동부가 {MOEL_LEAVE_FROM}부터
        행정해석을 바꾼 내용으로<Ref n={14} /><Ref n={15} />, 마지막 근무일이 1년째 되는 날이면 충족되는 퇴직금과 하루 차이가 납니다. 둘째, 퇴사하면서 비로소 생긴 연차수당은 퇴직금 평균임금에 들어가지 않습니다.
        연차수당은 임금이라 퇴직소득이 아니라 근로소득으로 마지막 급여와 합쳐 세금을 뗍니다.
      </p>

      <h2 id="unemployment" data-toc="실업급여 — 하루 얼마, 며칠">실업급여 — 하루 얼마를 며칠 동안</h2>
      <p>
        구직급여 1일액은 기초일액의 {pct(UI_BENEFIT_RATE)}입니다<Ref n={18} />. 기초일액은 퇴직금과 같은 정의의 이직 전 3개월 평균임금이고, 통상임금보다 적으면 통상임금을 씁니다. 2026년 이직자는
        기초일액 상한이 {won(UI_WAGE_DAILY_CAP_2026)}이라 1일 상한은 {won(UI_DAILY_CAP_2026)}입니다. 하한은 이직일 당시 최저시급 × 이직 전 1일 소정근로시간 × {pct(UI_DAILY_FLOOR_RATE)}로,
        하루 8시간이면 {won(UI_DAILY_FLOOR_2026)}, 4시간이면 {won(FLOOR_4H)}입니다. 8시간 기준 상·하한 차이가 {won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}뿐이라 대부분 둘 중 하나로 정해집니다.
      </p>
      <p>
        받는 기간(소정급여일수)은 이직 당시 만 나이와 고용보험 가입기간으로 정해집니다.{' '}
        {LT1_SAME
          ? <>가입기간이 {LT1.label}이면 나이와 관계없이 {BENEFIT_DAYS_2019.under50[LT1.id]}일이고, 그보다 길면 50세 이상·장애인이 더 깁니다<Ref n={19} />.</>
          : <>50세 이상과 장애인은 더 깁니다<Ref n={19} />.</>}
        {' '}아래 표는 그 일수에 2026년 하한·상한을 곱한 총액 범위로, 하루 8시간 일한 사람의 2026년 이직 구직급여 총액은 이 범위 안에서 정해집니다. 수급기간은 이직 다음 날부터 12개월이라
        신청이 늦으면 남은 일수가 사라지고, 실업 신고 뒤 첫 7일은 대기기간입니다<Ref n={19} />. 신청 순서와 월급별 1일액은 <Link href="/tools/finance/unemployment-benefit">실업급여 계산기</Link> 페이지에 정리돼 있습니다.
      </p>
      <DataFigure
        n={3}
        title="2026년 이직자의 소정급여일수와 총 구직급여 범위"
        unit="1일 8시간 기준 · 총액 = 일수 × 하한~상한"
        source={<>자료: 고용보험법 별표 1<Ref n={19} />, 2026년 구직급여 상·하한 — Youtil 실업급여 계산기와 같은 기준값. 단시간 근로자는 하한이 더 낮습니다</>}
      >
        <table>
          <thead>
            <tr><th scope="col">가입기간</th><th scope="col" className="r">50세 미만</th><th scope="col" className="r">총액</th><th scope="col" className="r">50세 이상·장애인</th><th scope="col" className="r">총액</th></tr>
          </thead>
          <tbody>
            {COVERAGE_BRACKETS.map(b => {
              const du = BENEFIT_DAYS_2019.under50[b.id]
              const d5 = BENEFIT_DAYS_2019['50plus'][b.id]
              const isEx = EX_AGE < 50 && coverageBracket(EX_MONTHS) === b.id
              return (
                <tr key={b.id}>
                  <th scope="row">{b.label}</th>
                  <td className={`r${isEx ? ' em' : ''}`}>{du}일{isEx && <small>예시(만 {EX_AGE}세)</small>}</td>
                  <td className="r">{manwon(du * UI_DAILY_FLOOR_2026)}~{manwon(du * UI_DAILY_CAP_2026)}</td>
                  <td className="r">{d5}일</td>
                  <td className="r">{manwon(d5 * UI_DAILY_FLOOR_2026)}~{manwon(d5 * UI_DAILY_CAP_2026)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="note" title="2027년에 퇴사한다면, 그리고 발표된 개편안">
        하한은 이직일 당시 최저임금으로 정해지므로, 2027년 1월 이후 이직자는 8시간 기준 하한이 {won(FLOOR_2027)}으로 올라
        {FLOOR_2027 > UI_DAILY_CAP_2026 ? <> 현재 1일 상한 {won(UI_DAILY_CAP_2026)}보다 높아집니다. 2027년 상한은 아직 정해지지 않았습니다.</> : <> 현재 1일 상한 {won(UI_DAILY_CAP_2026)}에 더 가까워집니다.</>}
        {' '}또 정부는 2026년 9월 1일 구직급여를 무급휴일을 뺀 주 6일 기준으로 지급하되 소정급여일수와 총액은 유지하는 개편안을 고용보험위원회에 보고했습니다<Ref n={22} />.
        법령 개정 전 정부안이라 이 글의 계산에는 넣지 않았습니다. 해가 바뀌며 달라지는 숫자는 <Link href="/guides/numbers-2026-2027">2026→2027 달라지는 생활 숫자</Link>에 정리돼 있습니다.
      </Callout>

      <h2 id="example" data-toc={`예시 — 월 ${manwon(EX_MONTHLY)}·${EX_SERVICE}`}>예시 — 월 {manwon(EX_MONTHLY)}, 근속 {EX_SERVICE}, 만 {EX_AGE}세의 퇴사 정산</h2>
      <p>
        {fmtDate(EX_START)}에 입사해 {fmtDate(EX_END)}까지 일하고 권고사직으로 퇴사한 사람을 가정합니다. 주 {WORK_HOURS_WEEK}시간·하루 {EX_DAILY_HOURS}시간 근무, 월 {manwon(EX_MONTHLY)}은 전부 기본급,
        고용보험은 이 회사에서만 가입했고 연차는 {EX_LEAVE_DAYS}일 남았습니다. 퇴직금 계산기와 실업급여 계산기의 계산 함수를 그대로 썼습니다.
      </p>
      <DataFigure
        n={4}
        title={`퇴사 정산 예시 — 월 ${manwon(EX_MONTHLY)}·${EX_SERVICE}·만 ${EX_AGE}세`}
        unit="단위: 원"
        source={<>자료: Youtil 퇴직금·실업급여 계산기와 같은 계산 코드로 빌드 시 계산 — 2026년 구직급여 상·하한, 연차수당은 통상임금 기준·세전</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col" className="r">금액</th><th scope="col">설명</th></tr></thead>
          <tbody>
            <tr><th scope="row">계속근로기간</th><td className="r">{num(ELIG.daysWorked)}일</td><td className="wrap">{ELIG.eligible ? '퇴직금 요건 충족' : '퇴직금 요건 미달'} · 세법상 근속연수 {TAX_YEARS}년</td></tr>
            <tr><th scope="row">1일 평균임금</th><td className="r">{num(man2won(AVG_D))}</td><td className="wrap">3개월 {manwon(man2won(WAGE3.total))} ÷ {PERIOD.days}일</td></tr>
            <tr><th scope="row">1일 통상임금</th><td className="r">{num(man2won(ORD_D))}</td><td className="wrap">{manwon(EX_MONTHLY)} ÷ {MONTHLY_WORK_HOURS}시간 × {EX_DAILY_HOURS}시간</td></tr>
            <tr><th scope="row">퇴직금(세전)</th><td className="r em">{num(man2won(SEV))}</td><td className="wrap">{ORD_WINS ? '통상임금 적용' : '평균임금 적용'} · IRP로 이전(세금 떼지 않음){ORD_WINS && <small>평균임금 기준이면 {num(man2won(SEV_AVG))}</small>}</td></tr>
            <tr><th scope="row" className="wrap">퇴직소득세·지방세</th><td className="r">{num(man2won(SEV_TAX.totalTax))}</td><td className="wrap">IRP에서 일시금으로 찾을 때 · 실효세율 {SEV_TAX.taxRatePct.toFixed(2)}%</td></tr>
            <tr><th scope="row" className="wrap">일시금으로 찾으면</th><td className="r">{num(man2won(SEV_TAX.netSeverance))}</td><td className="wrap">퇴직금 세후</td></tr>
            <tr><th scope="row" className="wrap">연차수당 {EX_LEAVE_DAYS}일</th><td className="r">{num(LEAVE_PAY)}</td><td className="wrap">세전 · 근로소득 · 마지막 급여와 함께</td></tr>
            <tr><th scope="row" className="wrap">구직급여 1일액</th><td className="r">{num(U.dailyBenefit)}</td><td className="wrap">기초일액 = {U_BASE.ordinaryApplied ? '1일 통상임금' : '1일 평균임금'}{U.wageCapped ? ` → 상한 ${num(UI_WAGE_DAILY_CAP_2026)}` : ''} · {U.capped === 'none' ? capLabel(U.capped) : `1일 ${capLabel(U.capped)}`}</td></tr>
            <tr><th scope="row" className="wrap">구직급여 총액</th><td className="r em">{num(U.totalBenefit)}</td><td className="wrap">{U.benefitDays}일 · 비과세</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        회사가 주는 돈은 두 갈래로 들어옵니다. 퇴직금 {won(man2won(SEV))}은 예시의 나이와 금액이 시행령 예외에 해당하지 않아 세금을 떼지 않은 채 IRP 계좌로 들어오고, 연차수당 {won(LEAVE_PAY)}(세전)은 마지막 급여와 함께 들어옵니다.
        IRP를 바로 해지해 일시금으로 찾으면 퇴직소득세 {won(man2won(SEV_TAX.totalTax))}를 떼고 {won(man2won(SEV_TAX.netSeverance))}이 남아, 연차수당까지 합치면 약 {manwon(COMPANY_TOTAL)}입니다.
        고용센터에서는 {U.benefitDays}일에 걸쳐 {won(U.totalBenefit)}을 받습니다.
        {U_BASE.ordinaryApplied && <>
          {' '}1일액이 {capLabel(U.capped)}으로 정해지는 이유는 퇴직금과 같은 비교 때문입니다. 1일 평균임금 {won(U_AVG_DAILY)}이 1일 통상임금 {won(U_ORD_DAILY)}보다 적어 통상임금이 기초일액이 되고<Ref n={18} />,
          {U.wageCapped ? <> 이 값이 기초일액 상한 {won(UI_WAGE_DAILY_CAP_2026)}을 넘어 그 {pct(UI_BENEFIT_RATE)}인 {won(U.dailyBenefit)}이 됩니다.</> : <> 그 {pct(UI_BENEFIT_RATE)}로 {won(U.dailyBenefit)}이 됩니다.</>}
          {' '}실업급여 계산기 간편 모드에 월급을 넣고 &lsquo;고정급뿐&rsquo; 체크를 그대로 두면 같은 값이 나옵니다.
          {U_VAR.dailyBenefit !== U.dailyBenefit && <> 월급에 연장수당 같은 변동급이 섞여 고정급이 이보다 적었다면 평균임금이 기준이 되어 {capLabel(U_VAR.capped)} {won(U_VAR.dailyBenefit)}이 적용될 수 있습니다.</>}
        </>}
        {' '}실제 금액은 회사가 이직확인서에 적은 임금으로 고용센터가 정합니다<Ref n={21} />.
      </p>

      <h2 id="insurance" data-toc="퇴사 후 건강보험·국민연금">퇴사 다음 날 — 건강보험과 국민연금</h2>
      <p>
        마지막 급여에서는 건강보험료와 고용보험료를 그해 실제 받은 보수로 다시 계산해 차액을 빼거나 돌려주는 <strong>퇴직 정산</strong>이 이뤄집니다<Ref n={25} />. 국민연금은 신고된 기준소득월액으로
        이미 정해진 보험료라 이런 정산이 없습니다. 직장가입자 자격은 퇴사 다음 날 바뀌는데<Ref n={23} /><Ref n={27} />, 자격이 바뀐 달의 보험료는 바뀌기 전 자격으로(1일에 바뀌면 새 자격으로) 매기므로
        마지막 근무일이 있는 달까지는 직장 보험료를 내고 지역보험료는 그다음 달분부터 붙습니다<Ref n={24} />.
      </p>
      <p>퇴사 다음 날부터는 셋 중 하나를 고릅니다.</p>
      <ul>
        <li><strong>피부양자</strong> — 직장가입자인 가족이 있고 소득·재산 요건을 채우면 보험료를 내지 않습니다.</li>
        <li><strong>지역가입자</strong> — 따로 신청하지 않으면 이쪽으로 바뀝니다. 소득과 재산을 기준으로 매기므로 재직 때 보험료와 크게 다를 수 있습니다<Ref n={26} />.</li>
        <li>
          <strong>임의계속가입</strong> — 퇴사 전 18개월 동안 직장가입자 자격이 통산 1년 이상이면, 퇴사 다음 날부터 36개월까지 직장가입자처럼 남을 수 있습니다. 보험료는 퇴사 전 12개월 평균 보수월액에
          건강보험료율 {R.health.total}%의 절반({HEALTH_HALF}%)을 적용하므로{HEALTH_HALF === R.health.employee ? ' 재직 때 본인 부담 요율과 같고' : ''}, 장기요양보험료는 별도입니다<Ref n={24} /><Ref n={25} />.
        </li>
      </ul>
      <p>
        임의계속가입은 지역가입자가 된 뒤 처음 고지된 지역보험료의 납부기한에서 2개월이 지나기 전까지 신청하면 됩니다. 그래서 첫 지역보험료 고지서를 받아 본 다음 비교해 골라도 늦지 않습니다.
        국민연금은 퇴사 후 소득이 없으면 <strong>납부예외</strong>를 신청할 수 있지만 그 기간은 가입기간에서 빠집니다. 구직급여를 받는 동안에는 <strong>실업크레딧</strong>을 신청해 보험료 일부를
        국가 지원으로 내고 가입기간을 인정받을 수 있습니다<Ref n={28} /><Ref n={29} />.
      </p>

      <h2 id="tax" data-toc="세금 — 퇴사 달 연말정산과 5월">세금 정리 — 퇴사 달 연말정산과 다음 해 5월</h2>
      <p>
        회사는 퇴사하는 달의 급여를 줄 때 그해 받은 근로소득으로 연말정산을 합니다<Ref n={30} />. 이때는 회사가 가진 자료(본인과 신고한 부양가족의 기본공제, 4대보험료 등) 위주로 정산하므로
        신용카드·의료비·교육비 같은 공제는 대개 빠집니다. 퇴사하며 받은 연차수당도 이 근로소득에 합쳐집니다.
      </p>
      <p>
        같은 해에 재취업하면 이전 회사의 근로소득 원천징수영수증을 새 회사에 내 다음 해 2월 연말정산에서 합칩니다. 그해 재취업하지 못했더라도 근로소득만 있고 퇴사 때 연말정산을 받았다면
        다음 해 5월 종합소득세 확정신고는 <strong>의무가 아닙니다</strong><Ref n={32} />. 빠진 공제를 받고 싶을 때 5월에 확정신고를 하면 되고<Ref n={31} /><Ref n={35} />, 그 기한을 넘겼다면 경정청구로
        돌려받을 수 있습니다<Ref n={33} />. 퇴직소득은 근로소득과 합치지 않고 따로 과세되며, 실업급여는 비과세라 신고할 소득에 넣지 않습니다<Ref n={34} />.
        공제를 넣었을 때 결정세액이 얼마나 달라지는지는 <Link href="/tools/finance/year-end-tax">연말정산 계산기</Link>로 미리 볼 수 있습니다.
      </p>

      <h2 id="checklist" data-toc="퇴사 체크리스트">퇴사 체크리스트</h2>
      <p>퇴사일을 정하기 전부터 다음 해 5월까지, 순서대로 확인해 보세요.</p>
      <GuideChecklist>
        <li>마지막 근무일 기준으로 <strong>계속근로 1년·주 {SEV_MIN_WEEK_HOURS}시간</strong>을 채우는지 <Link href="/tools/finance/severance">퇴직금 계산기</Link>로 확인합니다. 1년 차 연차는 그다음 날까지 재직해야 생깁니다.</li>
        <li>퇴직금 산정 3개월에 <strong>상여·전년도 연차수당의 3/12</strong>이 들어갔는지, 평균임금과 통상임금 중 어느 쪽으로 계산했는지 회사에 묻습니다.</li>
        <li>퇴직금을 받을 <strong>IRP 계좌</strong>를 미리 만들어 회사에 알립니다.</li>
        <li>상시 {LEAVE_MIN_WORKERS}명 이상 사업장이라면 <strong>남은 연차 일수</strong>와 하루 단가를 확인하고, 퇴사 전에 쓸지 수당으로 받을지 정합니다.</li>
        <li>이직확인서의 <strong>이직 사유</strong>가 합의 내용과 같은지, 평균임금·통상임금이 제대로 적혔는지 확인합니다.</li>
        <li>퇴사 직후 <strong>고용24 구직신청</strong>과 수급자격 인정 신청을 합니다. 수급기간은 이직 다음 날부터 12개월입니다.</li>
        <li>첫 지역보험료 고지서를 받으면 <strong>피부양자·지역·임의계속가입</strong>을 비교하고, 국민연금은 납부예외나 실업크레딧을 정합니다.</li>
        <li>근로소득·퇴직소득 <strong>원천징수영수증</strong>을 받아 두고, 재취업하면 새 회사에, 아니면 5월 신고나 경정청구에 씁니다.</li>
      </GuideChecklist>

      <Faq items={FAQ} />
    </GuideLayout>
  )
}
