/* app/guides/numbers-2026-2027/page.tsx (server) — 계산 해설 G2 '2026→2027 달라지는 생활 숫자'
   여정: 숫자가 바뀌는 달력 → 최저임금(시급·월 환산) → 4대보험 요율(2025→2026, 2027 확정 현황) → 국민연금 기준소득월액(7월)
        → 2027년 1월 최저임금 명세서 추정 → 퇴사 뒤의 숫자(구직급여 상·하한) → 체크리스트.
   ─ 법정 수치는 lib 단일 소스(krInsuranceRates·krUnemployment·krNationalPension)와 계산기 유틸(salaryUtils·fourInsuranceUtils)에서
     빌드 시 보간·계산한다. 표 1·2·4·5와 모든 예시 금액이 여기서 나온다.
   ─ 발표·의결 단계의 2027년 수치는 lib에 넣지 않는다(과제 원칙). 공식 발표로 확인된 것만 본문에 출처·기준일(ASOF)과 함께 적는다:
       · 국민연금 2027 요율 — 국민연금법 법정 단계 인상 → lib pensionTotalRateFor(2027)·PENSION_RATE_LAW(연 0.5%p, 2033년 13%)
       · 건강보험 2027 요율 — 2026.9.8 건정심 동결 의결 → 값은 lib 2026 값 그대로
       · 고용보험료율 인상·구직급여 상한 연동·주 6일 지급 — 2026.9.1 정부 개편안(법령 개정 전) → UI_PLAN 상수로 문장에만 쓰고 계산에 쓰지 않음
       · 장기요양 2027 요율 · 산재 2027 요율 · 국민연금 2027.7~ 상·하한 — 발표 전
   ─ 도구 페이지 가이드(4-insurance 요율표·unemployment-benefit 산식·소정급여일수표·national-pension A/B값 설명)와 G1(명세서 순서)은
     다시 싣지 않고 링크한다. 이 글은 '연도 사이에 무엇이 어떻게 이어지는가'만 다룬다. */
import Link from 'next/link'
import GuideLayout, { guideMetadata, Ref, GuideSteps, GuideChecklist } from '../_components/GuideLayout'
import DataFigure from '@/components/DataFigure'
import Callout from '@/components/Callout'
import Faq from '@/components/Faq'
import { calcSalary, monthlyWithholding } from '@/app/tools/finance/salary/salaryUtils'
import { calc4Insurance } from '@/app/tools/finance/4-insurance/fourInsuranceUtils'
import {
  INSURANCE_RATES, MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, WORK_HOURS_WEEK, minHourlyWageFor,
  PENSION_RATE_LAW, pensionTotalRateFor,
  PENSION_BASE_SCHEDULE, pensionBaseAt, pensionBasePeriodLabel, previousPensionBase,
} from '@/lib/krInsuranceRates'
/* 근로기준법 §18③ — 1주 소정근로시간(4주 평균) 15시간 미만이면 주휴(§55)·연차(§60) 미적용. 연차 계산기와 같은 상수 */
import { LEAVE_MIN_WEEKLY_HOURS as SHORT_WEEK_HOURS } from '@/lib/krLabor'
import {
  UI_BENEFIT_RATE, UI_DAILY_CAP_2026, UI_DAILY_FLOOR_2026, UI_DAILY_FLOOR_RATE, UI_DAILY_WORK_HOURS, uiDailyFloor,
} from '@/lib/krUnemployment'
import { calcPension, NP_A_VALUE_2026 } from '@/lib/krNationalPension'
import { getGuide, guideHref } from '@/lib/guides'
import { allTools } from '@/lib/tools'

const SLUG = 'numbers-2026-2027'
export const metadata = guideMetadata(SLUG)

/* ── 포맷 ───────────────────────────────────────────────── */
const num = (n: number) => Math.round(n).toLocaleString('ko-KR')
const won = (n: number) => `${num(n)}원`
const manwon = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만 원`
const r4 = (n: number) => Math.round(n * 1e4) / 1e4          // 요율 부동소수 정리(4.75 − 4.5 등)
const pct1 = (n: number) => `${(Math.round(n * 10) / 10).toFixed(1)}%`
const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${num(Math.abs(n))}`
const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만`   // 표 안 짧은 표기(41만)
const floor10 = (n: number) => Math.floor(n / 10) * 10         // 계산기와 같은 10원 미만 절사
/** 'YYYY-MM-DD' → '2026년 9월 26일' (Date 파싱 없이 분해 — CLAUDE.md 날짜 규칙) */
const krDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}

/* ── 기준일 — 2027 '발표 전·정부안' 문구를 확인한 날 = 레지스트리 updated (문구를 다시 확인하면 updated를 올린다) ── */
const GUIDE = getGuide(SLUG)
if (!GUIDE) throw new Error(`[guides] lib/guides GUIDES에 없는 slug: ${SLUG}`)
const ASOF = krDate(GUIDE.updated)

/* ── 최저임금 (lib) ─────────────────────────────────────── */
const YEARS = (Object.keys(MIN_HOURLY_WAGE).map(Number) as (keyof typeof MIN_HOURLY_WAGE)[]).sort((a, b) => a - b)
const W26 = minHourlyWageFor(2026)
const W27 = minHourlyWageFor(2027)
const M = (y: number) => minHourlyWageFor(y) * MONTHLY_WORK_HOURS   // 월 환산액(주휴 포함 209시간)
const M25 = M(2025)
const M26 = M(2026)
const M27 = M(2027)
const W_UP = W27 - W26
const W_UP_PCT = (W_UP / W26) * 100
const WEEKLY_HOLIDAY_H = MONTHLY_WORK_HOURS - Math.round((WORK_HOURS_WEEK * 365) / 7 / 12) // 209 − 174 = 월 주휴시간(약 35)

/* 구직급여 1일 하한 — 고용보험법 §46② 산식(이직 연도 최저시급 × 1일 소정근로시간 × 80%), lib uiDailyFloor(8시간, 이직 연도) */
const uiFloorFor = (y: number) => uiDailyFloor(UI_DAILY_WORK_HOURS, y)
const FLOOR27 = uiFloorFor(2027)
const FLOOR_OVER_CAP = FLOOR27 > UI_DAILY_CAP_2026

/* ── 4대보험 요율 (lib) ─────────────────────────────────── */
const R25 = INSURANCE_RATES[2025]
const R26 = INSURANCE_RATES[2026]
const empTotal = (r: typeof R26) => r4(r.pension.employee + r.health.employee + r.ltc.employee + r.unemp.employee)
/* 국민연금 법정 단계 인상(출처 5·6) — lib PENSION_RATE_LAW(연 0.5%p, 2033년 13%)·pensionTotalRateFor. 근로자·사용자 절반씩 */
const PENSION_STEP_TOTAL = PENSION_RATE_LAW.stepTotal
const PENSION_STEP_EMP = r4(PENSION_STEP_TOTAL / 2)
const P27_TOTAL = pensionTotalRateFor(2027)
const P27_EMP = r4(P27_TOTAL / 2)
const PENSION_END = `${PENSION_RATE_LAW.finalYear}년 ${PENSION_RATE_LAW.finalTotal}%`   // '2033년 13%'

/* 표 2 — 같은 월급(2026 최저임금 월 환산)에 2025·2026 요율을 각각 적용: 4대보험 계산기와 같은 calc4Insurance.
   계산기 화면처럼 항목마다 원 단위로 반올림한 뒤 차이를 구하고, 합계는 반올림된 항목 차이의 합(행과 합계가 맞도록) */
const PB26H2 = pensionBaseAt({ year: 2026, month: 7 })
const ins = (year: 2025 | 2026) =>
  calc4Insurance({ monthlySalary: M26, taxFreeAmount: 0, workersCompRate: 0, companySize: 'under150', year, pensionPeriod: PB26H2 })
const I25 = ins(2025)
const I26 = ins(2026)
type InsKey = keyof Pick<typeof I26, 'pensionEmp' | 'healthEmp' | 'ltcEmp' | 'unempEmp' | 'pensionEmpr' | 'healthEmpr' | 'ltcEmpr' | 'unempEmpr' | 'workersEmpr'>
const dRound = (k: InsKey) => Math.round(I26[k]) - Math.round(I25[k])
const INS_ROWS = [
  { name: '국민연금', a: R25.pension.employee, b: R26.pension.employee, d: dRound('pensionEmp'), ref: 5 },
  { name: '건강보험', a: R25.health.employee, b: R26.health.employee, d: dRound('healthEmp'), ref: 7 },
  { name: '장기요양', a: R25.ltc.employee, b: R26.ltc.employee, d: dRound('ltcEmp'), ref: 9 },
  { name: '고용보험', a: R25.unemp.employee, b: R26.unemp.employee, d: dRound('unempEmp'), ref: 11 },
]
const INS_EMP_DIFF = INS_ROWS.reduce((s, r) => s + r.d, 0)
const INS_EMPR_DIFF = (['pensionEmpr', 'healthEmpr', 'ltcEmpr', 'unempEmpr', 'workersEmpr'] as const).reduce((s, k) => s + dRound(k), 0)

/* 2026. 9. 1. 정부 고용보험 개편안(고용노동부 보도자료 news_seq=19866, 출처 12) — 법령 개정 전인 정부안이라 계산에는 쓰지 않고 문장에만 쓴다.
   실업급여 보험료율 +0.2%p(근로자·사업주 각 0.1%p), 구직급여 상한 = 하한의 103%, 주 6일 기준 지급 */
const UI_PLAN = { rateUpTotal: 0.2, capPctOfFloor: 103, payDaysPerWeek: 6 } as const
const UI_RATE_NOW = r4(R26.unemp.employee + R26.unemp.employer)          // 현행 실업급여 보험료율(근로자+사업주)
const UI_RATE_PLAN = r4(UI_RATE_NOW + UI_PLAN.rateUpTotal)
const UI_RATE_UP_EACH = r4(UI_PLAN.rateUpTotal / 2)

/* ── 국민연금 기준소득월액 (lib 스케줄) ─────────────────── */
const PB27H1 = pensionBaseAt({ year: 2027, month: 1 })
const PB27H2_KNOWN = PENSION_BASE_SCHEDULE.find(p => p.from === '2027-07')   // 고시되어 lib에 추가되면 표·문구가 자동으로 바뀐다
const PB27H1_PREV = previousPensionBase(PB27H1)
/* 스케줄 전체 적용 범위 — 예: '2024년 7월~2027년 6월' */
const PB_SPAN = `${pensionBasePeriodLabel(PENSION_BASE_SCHEDULE[0]).split('~')[0]}~${pensionBasePeriodLabel(PENSION_BASE_SCHEDULE[PENSION_BASE_SCHEDULE.length - 1]).split('~')[1]}`
type Half = { label: string; rate: number | null; rateNote?: string; base: typeof PB27H1 | null }
const HALVES: Half[] = [
  { label: '2025년 1~6월', rate: R25.pension.employee, base: pensionBaseAt({ year: 2025, month: 1 }) },
  { label: '2025년 7~12월', rate: R25.pension.employee, base: pensionBaseAt({ year: 2025, month: 7 }) },
  { label: '2026년 1~6월', rate: R26.pension.employee, base: pensionBaseAt({ year: 2026, month: 1 }) },
  { label: '2026년 7~12월', rate: R26.pension.employee, base: PB26H2 },
  { label: '2027년 1~6월', rate: P27_EMP, rateNote: '법정 인상', base: PB27H1 },
  { label: '2027년 7~12월', rate: P27_EMP, rateNote: '법정 인상', base: PB27H2_KNOWN ?? null },
]
const maxPremium = (h: Half) => (h.rate != null && h.base ? floor10((h.base.max * h.rate) / 100) : null)
/* 표 4 자료 줄 — 절사 없이 곱한 값(상한 × 근로자 요율)이 표 값과 다르면 2026년 7~12월을 예로 보인다 */
const MAX26H2_EXACT = Math.round((PB26H2.max * R26.pension.employee) / 100)
const MAX26H2_DIFFERS = MAX26H2_EXACT !== floor10((PB26H2.max * R26.pension.employee) / 100)

/* 두 개의 시계 — 요율은 1월, 기준소득월액은 7월(전년도 소득). 2025년부터 최저임금 전일제로 계속 일한 경우 */
const CLOCK_26H2 = floor10((M25 * R26.pension.employee) / 100)   // 2026.7~12: 2025년 소득 × 2026 요율
const CLOCK_27H1 = floor10((M25 * P27_EMP) / 100)                // 2027.1~6: 2025년 소득 × 2027 요율
const CLOCK_27H2 = floor10((M26 * P27_EMP) / 100)                // 2027.7~12: 2026년 소득 × 2027 요율
const CLOCK_NOW = floor10((M27 * P27_EMP) / 100)                 // 계산기 방식: 그 달 월급 × 요율

/* 노령연금 추정 — 국민연금 계산기와 같은 calcPension(공단 간단계산 근사, 2026 A값), 20년 가입 */
const YEARS_IN = 20
const penLow = calcPension({ totalMonths: YEARS_IN * 12, avgIncome: M27, mode: 'normal', adjustYears: 0, spouse: false, dependents: 0, incomeBase: PB27H1 })
const penHigh = calcPension({ totalMonths: YEARS_IN * 12, avgIncome: PB27H1.max, mode: 'normal', adjustYears: 0, spouse: false, dependents: 0, incomeBase: PB27H1 })
const PAY_RATIO = PB27H1.max / M27
const PEN_RATIO = penHigh.monthly / penLow.monthly

/* ── 2027년 1월 최저임금 명세서 추정 — 연봉 계산기와 같은 calcSalary(2026 요율·세법) + 국민연금만 법정 인상 반영 ──
   소득세는 늘어난 국민연금(연금보험료공제)으로 연봉 계산기와 같은 monthlyWithholding을 다시 돌린다 */
const base = { dependents: 1, childrenCount: 0, isInsured: true, nonTaxableMonthly: 0 } as const
const S26 = calcSalary({ ...base, grossYearly: M26 * 12, pensionBase: PB26H2 })
const S27 = calcSalary({ ...base, grossYearly: M27 * 12, pensionBase: PB27H1 })
const S27_PENSION = floor10((Math.min(PB27H1.max, Math.max(PB27H1.min, S27.taxableMonthly)) * P27_EMP) / 100)
const S27_OTHER_INS = S27.health + S27.longTermCare + S27.employment
const S27_INS = S27_PENSION + S27_OTHER_INS
const S27_TAX = monthlyWithholding(S27.taxableMonthly, base.dependents, base.childrenCount, S27_PENSION, S27_OTHER_INS).totalTax
const S27_NET = S27.grossMonthly - S27_INS - S27_TAX
const NET_GAIN = S27_NET - S26.netMonthly
const GROSS_GAIN = S27.grossMonthly - S26.grossMonthly
const HEALTH_UP = S27.health - S26.health

/* 구직급여 하한 월 환산(× 30, 실업급여 계산기와 같은 참고 환산) vs 최저임금 월 실수령(연봉 계산기) */
const FLOOR26_MONTH = UI_DAILY_FLOOR_2026 * 30
const FLOOR_BEATS_NET = FLOOR26_MONTH > S26.netMonthly

/* hourly-pay(시급 계산기)는 레지스트리에 들어오면 본문 링크가 켜진다 — RelatedTools도 레지스트리에 없는 경로는 뺀다 */
const HOURLY_HREF = '/tools/finance/hourly-pay'
const HAS_HOURLY = allTools.some(t => t.href === HOURLY_HREF)

/* ── 참고 자료 (배열 순서 = 본문 <Ref n>) ───────────────── */
const LAW = 'https://www.law.go.kr/법령'
const MOEL_NEWS = 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq='
const MOHW_PRESS = 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027'   // 보건복지부 보도자료 게시판
const SOURCES = [
  { label: '최저임금법 제6조(최저임금의 효력)·제8조(최저임금의 결정)·제10조(최저임금의 고시와 효력발생)', href: `${LAW}/최저임금법/제10조`, org: '국가법령정보센터' }, // 1
  { label: `고용노동부 보도자료 「2027년도 적용 최저임금 시간급 ${MIN_HOURLY_WAGE[2027]}원」(2026. 8. 5.)`, href: `${MOEL_NEWS}19744`, org: '고용노동부' },          // 2
  { label: `고용노동부 보도자료 「2026년 적용 최저임금 시간급 ${MIN_HOURLY_WAGE[2026]}원」(2025. 8. 5.)`, href: `${MOEL_NEWS}18144`, org: '고용노동부' },            // 3
  { label: '근로기준법 제18조(단시간근로자의 근로조건)·제50조(근로시간)·제55조(휴일)', href: `${LAW}/근로기준법/제55조`, org: '국가법령정보센터' },                    // 4
  { label: '국민연금법 제88조(연금보험료의 부과·징수 등)와 2025년 개정 부칙(연금보험료율 단계 인상)', href: `${LAW}/국민연금법/제88조`, org: '국가법령정보센터' },         // 5
  { label: '대한민국 정책브리핑 「국가가 연금 지급 보장 법제화…내년부터 달라지는 국민연금」(2025. 12.)', href: 'https://www.korea.kr/news/policyNewsView.do?newsId=148957270', org: '문화체육관광부 국민소통실' }, // 6
  { label: '국민건강보험법 제73조(보험료율 등)', href: `${LAW}/국민건강보험법/제73조`, org: '국가법령정보센터' },                                                          // 7
  { label: '보건복지부 보도자료 — 2026년 제15차 건강보험정책심의위원회, 2027년도 건강보험료율 결정(2026. 9. 8.)', href: MOHW_PRESS, org: '보건복지부' },              // 8
  { label: '노인장기요양보험법 제9조(장기요양보험료의 산정)', href: `${LAW}/노인장기요양보험법/제9조`, org: '국가법령정보센터' },                                           // 9
  { label: '보건복지부 보도자료 — 제7기 장기요양위원회 구성·2026년 제3차 회의, 2027년 수가와 보험료율 논의 착수(2026. 8. 14.)', href: MOHW_PRESS, org: '보건복지부' }, // 10
  { label: '고용보험 및 산업재해보상보험의 보험료징수 등에 관한 법률 제14조(보험료율의 결정)', href: `${LAW}/고용보험및산업재해보상보험의보험료징수등에관한법률/제14조`, org: '국가법령정보센터' }, // 11
  { label: '고용노동부 보도자료 「고용보험 제도개선 TF 논의결과」 — 고용보험위원회 보고(2026. 9. 1.)', href: `${MOEL_NEWS}19866`, org: '고용노동부' },                  // 12
  { label: '국민연금법 시행령 제5조(기준소득월액 상한액과 하한액)·제7조(기준소득월액의 결정)', href: `${LAW}/국민연금법시행령/제5조`, org: '국가법령정보센터' },              // 13
  { label: '국민연금공단 — 알기 쉬운 국민연금: 연금보험료', href: 'https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0038M0.do', org: '국민연금공단' },                           // 14
  { label: '국민연금공단 공지 「2026년 기준소득월액 상·하한액 조정 안내」', href: 'https://www.nps.or.kr/pnsgdnc/newgdnc/getOHAE0001M1.do?pstId=ZZ202600000000000147', org: '국민연금공단' }, // 15
  { label: '고용보험법 제45조(급여의 기초가 되는 임금일액)·제46조(구직급여일액)', href: `${LAW}/고용보험법/제46조`, org: '국가법령정보센터' },                              // 16
  { label: '고용보험 — 실업급여(구직급여) 안내', href: 'https://www.ei.go.kr', org: '고용노동부 고용보험' },                                                                  // 17
]

/* ── FAQ (답변 = 신뢰된 정적 HTML, 수치는 위 상수에서 보간) ── */
const FAQ = [
  {
    q: '2027년 최저임금으로 한 달 일하면 월급은 얼마인가요?',
    a: `2027년 최저시급 ${won(W27)}에 주 ${WORK_HOURS_WEEK}시간 근무와 주휴시간을 더한 월 ${MONTHLY_WORK_HOURS}시간을 곱하면 월 <strong>${won(M27)}</strong>입니다. 본인 1명·비과세 없음 조건으로 연봉 계산기와 같은 방식을 쓰면 실수령은 2026년 요율 기준 약 ${won(S27.netMonthly)}, 법으로 정해진 국민연금 인상분까지 반영하면 약 ${won(S27_NET)}입니다.`,
  },
  {
    q: '건강보험료율이 동결되면 내 건강보험료도 그대로인가요?',
    a: `아닙니다. 건강보험료는 보수월액에 요율을 곱하므로, 요율이 ${R26.health.total}%로 그대로여도 월급이 오르면 보험료도 오릅니다. 최저임금 월급 기준으로 근로자 몫은 월 ${won(S26.health)}에서 ${won(S27.health)}으로 ${won(HEALTH_UP)} 늘어납니다. 건강보험료에 비례하는 장기요양보험료율은 ${ASOF} 현재 2027년 요율이 발표되지 않았습니다.`,
  },
  {
    q: '국민연금 보험료율은 2027년에도 오르나요?',
    a: `네. 2025년 개정된 국민연금법에 따라 보험료율은 2026년부터 해마다 ${PENSION_STEP_TOTAL}%p씩 올라 ${PENSION_END}에서 멈춥니다. 2027년 1월부터는 ${P27_TOTAL}%가 되고, 회사에 다니는 사람은 그 절반인 ${P27_EMP}%를 냅니다. 같은 기준소득월액이라면 근로자 몫이 기준소득월액의 ${PENSION_STEP_EMP}%만큼 늘어납니다.`,
  },
  {
    q: `국민연금 상한 ${manwon(PB27H1.max)}은 언제까지 적용되나요?`,
    a: `현재 기준소득월액 상한 ${manwon(PB27H1.max)}·하한 ${manwon(PB27H1.min)}은 ${pensionBasePeriodLabel(PB27H1)}에 적용됩니다. 상·하한은 매년 7월 1일에 바뀌므로 ${PB27H2_KNOWN ? `2027년 7월부터는 상한 ${manwon(PB27H2_KNOWN.max)}·하한 ${manwon(PB27H2_KNOWN.min)}이 적용됩니다.` : `2027년 7월부터 적용할 새 상·하한은 ${ASOF} 현재 고시 전입니다.`}`,
  },
  {
    q: '최저임금이 오르면 실업급여도 오르나요?',
    a: `하한은 자동으로 오릅니다. 구직급여 1일 하한은 최저시급 × 이직 전 1일 소정근로시간 × ${Math.round(UI_DAILY_FLOOR_RATE * 100)}%이므로, 하루 ${UI_DAILY_WORK_HOURS}시간 근무자는 2026년 ${won(UI_DAILY_FLOOR_2026)}에서 현행 산식에 2027년 최저시급을 넣은 ${won(FLOOR27)}이 됩니다. 반면 상한은 시행령으로 따로 정하며, 2027년 상한은 ${ASOF} 현재 확정되지 않았습니다.`,
  },
  {
    q: '고용보험료도 2027년에 오르나요?',
    a: `정부는 2026년 9월 1일 고용보험위원회에 실업급여 보험료율을 ${pct1(UI_RATE_NOW)}에서 ${pct1(UI_RATE_PLAN)}로 ${UI_PLAN.rateUpTotal}%p 올려 근로자와 사업주가 ${UI_RATE_UP_EACH}%p씩 더 내는 개편안을 보고했습니다. 다만 보험료율은 시행령으로 정하는 것이어서 ${ASOF} 현재 개정 전이며, 그때까지는 현행 근로자 요율 ${R26.unemp.employee}%가 적용됩니다. Youtil 계산기도 현행 요율로 계산합니다.`,
  },
]

export default function Numbers20262027Guide() {
  return (
    <GuideLayout
      slug={SLUG}
      lead={<>해가 바뀌면 월급 명세서의 숫자 여러 개가 한꺼번에 움직입니다. 그런데 모두 1월 1일에 바뀌는 것은 아니고, 이미 확정된 것과 아직 발표되지 않은 것도 섞여 있습니다. 이 글은 2026년에서 2027년으로 넘어가며 바뀌는 최저임금·4대보험 요율·국민연금 기준소득월액·실업급여 상·하한을 <strong>언제·무엇이·얼마나</strong>로 나눠 정리하고, 최저임금 월급 한 장으로 그 변화가 실수령에 어떻게 닿는지 계산기와 같은 코드로 보여 줍니다.</>}
      basis={<>사실 확인 {ASOF} · 최저임금 {YEARS[0]}~{YEARS[YEARS.length - 1]}년 고시 · 4대보험 2025·2026년 요율 · 국민연금 기준소득월액 상·하한 {PB_SPAN} 적용분 · 구직급여 상·하한 2026년</>}
      glance={[
        <>2027년 최저시급은 <strong>{won(W27)}</strong>(+{won(W_UP)}, {pct1(W_UP_PCT)})입니다. 주 {WORK_HOURS_WEEK}시간 전일제 월 환산액은 <strong>{won(M27)}</strong>이고, 국민연금 인상까지 반영한 실수령 추정은 약 {won(S27_NET)}입니다.</>,
        <>4대보험 요율 가운데 2027년 1월 적용이 확정된 것은 두 가지입니다. 국민연금 요율이 <strong>{P27_TOTAL}%</strong>(근로자 {P27_EMP}%)로 법에 따라 오르고, 건강보험료율은 {R26.health.total}%로 <strong>동결</strong>됐습니다.</>,
        <>장기요양보험료율과 산재보험료율의 2027년 값, 고용보험료율 인상안, 구직급여 상한은 {ASOF} 현재 확정 전입니다.</>,
        <>국민연금 기준소득월액 상한 {manwon(PB27H1.max)}은 <strong>2027년 6월까지</strong> 쓰이고, 상·하한은 해마다 7월에 바뀝니다. 요율은 1월, 기준은 7월에 바뀌는 셈입니다.</>,
        <>최저임금이 오르면 구직급여 하한도 따라 오릅니다. 현행 산식으로 2027년 1일 하한은 {won(FLOOR27)}{FLOOR_OVER_CAP ? <>으로 2026년 상한 {won(UI_DAILY_CAP_2026)}보다 <strong>높아집니다</strong></> : <>입니다</>}.</>,
      ]}
      sources={SOURCES}
      related={[
        { href: '/tools/finance/salary', desc: '2027년 월급을 넣어 실수령 확인하기' },
        { href: HOURLY_HREF, desc: '시급·근무시간으로 주휴수당과 월급 계산하기' },
        { href: '/tools/finance/4-insurance', desc: '2025·2026년 요율로 근로자와 회사 부담 비교하기' },
        { href: '/tools/finance/national-pension', desc: '기준소득월액과 가입기간으로 노령연금 추정하기' },
        { href: '/tools/finance/unemployment-benefit', desc: '구직급여 1일액과 소정급여일수 계산하기' },
      ]}
      disclaimer={<>이 글의 금액은 본인 1명·비과세 없음·주 {WORK_HOURS_WEEK}시간 전일제를 가정한 추정입니다. 2027년 수치 가운데 법령이나 위원회 의결로 확정된 것만 계산에 넣었고, 정부 개편안처럼 법령 개정이 남은 내용은 {ASOF} 기준 발표 상태로만 적었습니다. 실제 명세서는 회사의 신고 방식과 근로 조건에 따라 다릅니다.</>}
    >
      <h2 id="calendar" data-toc="생활 숫자가 바뀌는 달력">생활 숫자가 바뀌는 달력 — 1월과 7월, 그리고 8월</h2>
      <p>
        월급에 붙는 법정 숫자는 바뀌는 날이 제각각입니다. 요율과 최저임금은 새해 첫날, 국민연금의 상·하한은 여름에 바뀌고, 다음 해 숫자는 그해 하반기에 하나씩 정해집니다.
        이 순서를 알고 있으면 명세서가 왜 1월과 7월에 두 번 달라지는지, 연말 기사 속 숫자 가운데 무엇이 확정이고 무엇이 계획인지 구분하기 쉽습니다.
      </p>
      <GuideSteps>
        <li><b>1월 1일 — 최저임금·4대보험 요율</b><span>전년도 8월에 고시된 최저임금이 효력을 갖고<Ref n={1} />, 국민연금·건강보험·장기요양·고용보험의 새 요율이 1월분 보험료부터 적용됩니다. 구직급여 하한도 최저임금을 따라 함께 오릅니다.</span></li>
        <li><b>4월 — 건강보험 정산</b><span>전년도 보수가 확정되면 건강보험료 차액을 4월분 보험료에서 정산합니다. 명세서에서 어떻게 보이는지는 <Link href={guideHref('first-paycheck')}>첫 월급 명세서 읽는 법</Link>에 정리했습니다.</span></li>
        <li><b>7월 1일 — 국민연금 기준소득월액</b><span>기준소득월액 상·하한이 새로 적용되고, 각자의 기준소득월액도 전년도 소득으로 다시 정해져 다음 해 6월까지 쓰입니다<Ref n={13} />.</span></li>
        <li><b>8월 5일까지 — 다음 해 최저임금</b><span>고용노동부 장관이 최저임금위원회 의결을 거쳐 다음 해 최저임금을 결정·고시합니다<Ref n={1} />. 2027년 최저임금은 2026년 8월 5일에 고시됐습니다<Ref n={2} />.</span></li>
        <li><b>하반기 — 다음 해 보험료율</b><span>건강보험료율은 건강보험정책심의위원회<Ref n={7} />, 장기요양보험료율은 장기요양위원회<Ref n={9} />의 심의를 거쳐 대통령령으로 정합니다. 2027년 건강보험료율은 2026년 9월 8일에 결정됐고<Ref n={8} />, 장기요양보험료율은 {ASOF} 현재 발표 전으로 10월 이후 결정될 예정입니다<Ref n={10} />.</span></li>
      </GuideSteps>

      <h2 id="min-wage" data-toc="최저임금 — 시급에서 월급으로">최저임금 — 시급 {won(W_UP)} 인상이 월급으로 바뀌는 방법</h2>
      <p>
        최저임금은 시간급으로 고시되지만, 월급을 받는 사람에게 중요한 것은 월 환산액입니다. 고용노동부는 주 {WORK_HOURS_WEEK}시간 근무에 유급 주휴시간을 더한 월 {MONTHLY_WORK_HOURS}시간을 기준으로
        월 환산액을 함께 발표합니다<Ref n={2} /><Ref n={4} />. {MONTHLY_WORK_HOURS}시간 가운데 약 {WEEKLY_HOLIDAY_H}시간이 주휴시간이라, 같은 시급이라도 주휴수당을 받는지에 따라 월급이 크게 달라집니다.
      </p>
      <DataFigure
        n={1}
        title="연도별 최저시급과 월 환산액, 연동되는 구직급여 하한"
        unit="단위: 원"
        source={<>자료: 고용노동부 최저임금 고시<Ref n={2} /><Ref n={3} /> — 월 환산액 = 시급 × {MONTHLY_WORK_HOURS}시간. 구직급여 하한 = 시급 × {UI_DAILY_WORK_HOURS}시간 × {Math.round(UI_DAILY_FLOOR_RATE * 100)}%(고용보험법 제46조<Ref n={16} />, 1일 {UI_DAILY_WORK_HOURS}시간 근무 기준)</>}
      >
        <table>
          <thead><tr><th scope="col">적용 연도</th><th scope="col" className="r">시급</th><th scope="col" className="r">월 환산액</th><th scope="col" className="r">구직급여 1일 하한</th></tr></thead>
          <tbody>
            {YEARS.map((y, i) => {
              const prev = i > 0 ? MIN_HOURLY_WAGE[YEARS[i - 1]] : null
              const w = MIN_HOURLY_WAGE[y]
              return (
                <tr key={y}>
                  <th scope="row">{y}년</th>
                  <td className="r">{num(w)}{prev != null && <small>+{num(w - prev)} ({pct1(((w - prev) / prev) * 100)})</small>}</td>
                  <td className="r em">{num(w * MONTHLY_WORK_HOURS)}</td>
                  <td className="r">{num(uiFloorFor(y))}{y === 2027 && <small>현행 산식 적용</small>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataFigure>
      <p>
        2027년 월 환산액은 2026년보다 {won(M27 - M26)} 많고, 1년으로 치면 {won((M27 - M26) * 12)} 차이입니다. 다만 월 환산액은 주 {WORK_HOURS_WEEK}시간 전일제를 기준으로 한 금액입니다.
        근무시간이 짧으면 소정근로시간과 주휴시간이 함께 줄어 월급도 비례해 줄어들고, 1주 소정근로시간이 평균 {SHORT_WEEK_HOURS}시간 미만이면 주휴가 적용되지 않습니다<Ref n={4} />.
        {HAS_HOURLY && <> 내 근무시간 기준의 월급은 <Link href={HOURLY_HREF}>시급 계산기</Link>로 따로 계산할 수 있습니다.</>}
      </p>

      <h2 id="insurance" data-toc="4대보험 요율 — 오른 것과 확정된 것">4대보험 요율 — 2026년에 오른 것, 2027년에 확정된 것</h2>
      <p>
        국민연금 요율은 법률로 정해지고<Ref n={5} />, 건강보험·고용보험 요율은 법이 정한 상한 안에서<Ref n={7} /><Ref n={11} />, 장기요양보험료율은 장기요양위원회 심의를 거쳐<Ref n={9} /> 각각 시행령으로 정해집니다. 2026년에는 국민연금·건강보험·장기요양 요율이 올랐고
        고용보험은 그대로였습니다. 같은 월급에서 요율만 바뀌면 공제가 얼마나 달라지는지 보기 위해, 2026년 최저임금 월 환산액 {won(M26)}에 두 해의 요율을 각각 적용했습니다.
      </p>
      <DataFigure
        n={2}
        title="4대보험 근로자 요율 2025 → 2026과 같은 월급에서의 차이"
        unit="요율 %, 금액 원(월)"
        source={<>자료: 각 보험 근거 법령·고시 요율 — Youtil 4대보험 계산기와 같은 계산 함수로 빌드 시 계산. 월급 {num(M26)}원·비과세 없음, 금액은 계산기 화면처럼 항목마다 원 단위로 반올림해 비교하고 합계는 항목 증감의 합</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col" className="r">2025년</th><th scope="col" className="r">2026년</th><th scope="col" className="r">월 부담 증감</th></tr></thead>
          <tbody>
            {INS_ROWS.map(r => (
              <tr key={r.name}>
                <th scope="row">{r.name}<Ref n={r.ref} /></th>
                <td className="r">{r.a}%</td>
                <td className="r">{r.b}%{r.b !== r.a && <small>{r.b > r.a ? '+' : '−'}{r4(Math.abs(r.b - r.a))}%p</small>}</td>
                <td className="r em">{signed(r.d)}</td>
              </tr>
            ))}
            <tr><th scope="row">근로자 합계</th><td className="r">{empTotal(R25)}%</td><td className="r">{empTotal(R26)}%</td><td className="r em">{signed(INS_EMP_DIFF)}</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        요율 변화만으로 이 월급의 근로자 공제는 월 {won(INS_EMP_DIFF)} 늘었고, 회사가 내는 몫도 월 {won(INS_EMPR_DIFF)} 늘었습니다. 가장 큰 부분은 국민연금으로, 사업장가입자 기준 {PENSION_RATE_LAW.flatSinceYear}년부터 {R25.pension.total}%에 머물던 요율이 2026년에 처음 올랐습니다<Ref n={6} />.
        장기요양보험료는 건강보험료에 비례해 매겨지므로 두 보험 요율이 함께 오르면 공제도 겹쳐서 늘어납니다. 회사 부담분까지 항목별로 나눠 보려면 <Link href="/tools/finance/4-insurance">4대보험 계산기</Link>에서 연도를 바꿔 계산하면 됩니다.
      </p>
      <h3 id="status-2027">2027년 요율, 지금까지 정해진 것</h3>
      <p>
        2027년 요율은 한꺼번에 발표되지 않습니다. {ASOF} 기준으로 공식 발표를 확인한 결과는 아래와 같습니다. 확정된 두 가지 가운데 국민연금은 법률로, 건강보험은 위원회 의결로 정해졌습니다.
      </p>
      <DataFigure
        n={3}
        title={`2027년 법정 수치 확정 현황 (${ASOF} 기준)`}
        source={<>자료: 국민연금법 부칙<Ref n={5} />, 보건복지부 발표<Ref n={8} /><Ref n={10} />, 고용노동부 발표<Ref n={2} /><Ref n={12} /> — 확정 전 항목은 발표되는 대로 이 표를 고칩니다</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col">2027년</th><th scope="col">상태</th></tr></thead>
          <tbody>
            <tr><th scope="row">최저임금</th><td className="wrap">시급 {won(W27)}</td><td className="wrap">확정<small>2026년 8월 5일 고시</small></td></tr>
            <tr><th scope="row">국민연금</th><td className="wrap">{P27_TOTAL}%<small>근로자 {P27_EMP}%</small></td><td className="wrap">확정(법률)<small>2026년부터 매년 {PENSION_STEP_TOTAL}%p 인상, {PENSION_END}까지</small></td></tr>
            <tr><th scope="row">건강보험</th><td className="wrap">{R26.health.total}%<small>근로자 {R26.health.employee}%</small></td><td className="wrap">확정(동결)<small>2026년 9월 8일 건강보험정책심의위원회</small></td></tr>
            <tr><th scope="row">장기요양</th><td className="wrap">발표 전</td><td className="wrap">10월 이후 결정 예정<small>장기요양위원회</small></td></tr>
            <tr><th scope="row">고용보험</th><td className="wrap">현행 근로자 {R26.unemp.employee}%</td><td className="wrap">인상안 발표, 법령 개정 전<small>2026년 9월 1일 정부 개편안</small></td></tr>
            <tr><th scope="row">산재보험</th><td className="wrap">발표 전</td><td className="wrap">사업주 전액 부담<small>명세서 공제 항목 아님</small></td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        국민연금은 2025년 개정된 국민연금법에 따라 2026년부터 해마다 {PENSION_STEP_TOTAL}%p씩 올라 {PENSION_END}에서 멈추도록 연도별 요율이 법에 정해져 있습니다<Ref n={5} /><Ref n={6} />. 그래서 2027년 {P27_TOTAL}%는 따로 발표를 기다릴 필요가 없는 확정 수치입니다.
        고용보험은 정부가 실업급여 보험료율을 {pct1(UI_RATE_NOW)}에서 {pct1(UI_RATE_PLAN)}로 {UI_PLAN.rateUpTotal}%p 올려 근로자와 사업주가 {UI_RATE_UP_EACH}%p씩 더 내는 개편안을 고용보험위원회에 보고했지만<Ref n={12} />, 보험료율은 시행령으로 정하므로<Ref n={11} /> 개정이 끝나기 전까지는 현행 요율이 유지됩니다.
      </p>

      <h2 id="pension" data-toc="국민연금 — 1월의 요율, 7월의 기준">국민연금 — 요율은 1월에, 기준소득월액은 7월에</h2>
      <p>
        국민연금 공제는 두 숫자의 곱입니다. 하나는 1월에 바뀌는 <strong>요율</strong>, 다른 하나는 7월에 바뀌는 <strong>기준소득월액</strong>입니다. 기준소득월액에는 하한과 상한이 있어, 월급이 상한을 넘으면
        상한까지만 보험료를 매깁니다<Ref n={13} /><Ref n={14} />. 두 숫자가 다른 달에 바뀌기 때문에 국민연금 공제는 1년에 두 번 달라질 수 있습니다.
      </p>
      <DataFigure
        n={4}
        title="반기별 국민연금 요율과 기준소득월액 상·하한"
        unit="단위: 원"
        source={<>자료: 국민연금법 시행령 제5조<Ref n={13} />·국민연금공단 안내<Ref n={14} /><Ref n={15} /> — 최대 보험료 = 상한 × 근로자 요율(근로자 몫), 10원 미만 절사(연봉 계산기와 같은 방식){MAX26H2_DIFFERS && <>. 절사 없이 곱한 값을 적는 안내 자료와는 몇 원 다를 수 있습니다(예: 2026년 7~12월 {won(MAX26H2_EXACT)})</>}. 2027년 요율은 국민연금법 부칙<Ref n={5} /></>}
      >
        <table>
          <thead><tr><th scope="col">기간</th><th scope="col" className="r">근로자 요율</th><th scope="col" className="r">하한~상한</th><th scope="col" className="r">최대 보험료</th></tr></thead>
          <tbody>
            {HALVES.map(h => {
              const mp = maxPremium(h)
              return (
                <tr key={h.label}>
                  <th scope="row">{h.label}</th>
                  <td className="r">{h.rate}%{h.rateNote && <small>{h.rateNote}</small>}</td>
                  <td className="r">{h.base ? `${man(h.base.min)}~${man(h.base.max)}` : '발표 전'}</td>
                  <td className="r em">{mp != null ? num(mp) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataFigure>
      <p>
        {PB27H1_PREV && <>2026년 7월에 상한이 {manwon(PB27H1_PREV.max)}에서 {manwon(PB27H1.max)}으로, 하한이 {manwon(PB27H1_PREV.min)}에서 {manwon(PB27H1.min)}으로 올랐습니다<Ref n={15} />. </>}
        상·하한은 전체 가입자의 평균소득 변동률을 반영해 매년 조정되며<Ref n={13} />, 2027년 1~6월에는 지금의 상·하한이 그대로 쓰이고 요율만 {P27_EMP}%로 오릅니다.
        {PB27H2_KNOWN ? ` 2027년 7월부터는 새 상·하한 ${manwon(PB27H2_KNOWN.min)}~${manwon(PB27H2_KNOWN.max)}이 적용됩니다.` : ` 2027년 7월부터 쓸 상·하한은 ${ASOF} 현재 고시 전입니다.`}
      </p>
      <h3 id="two-clocks">월급이 올라도 국민연금은 늦게 따라온다</h3>
      <p>
        기준소득월액은 매년 7월 전년도 소득으로 다시 정해집니다<Ref n={13} />. 그래서 1월에 최저임금이 올라도 국민연금은 곧바로 새 월급을 기준으로 하지 않습니다.
        2025년부터 같은 회사에서 최저임금 전일제로 일했고 회사가 소득 변경을 따로 신고하지 않았다고 가정하면, 근로자 몫은 이렇게 움직입니다.
      </p>
      <ul>
        <li>2026년 7~12월: 2025년 월급 {won(M25)} × {R26.pension.employee}% = <strong>{won(CLOCK_26H2)}</strong></li>
        <li>2027년 1~6월: 같은 기준소득월액 × {P27_EMP}% = <strong>{won(CLOCK_27H1)}</strong> (요율만 바뀜)</li>
        <li>2027년 7~12월: 2026년 월급 {won(M26)} × {P27_EMP}% = <strong>{won(CLOCK_27H2)}</strong> (기준이 바뀜)</li>
      </ul>
      <p>
        연봉 계산기처럼 그 달 월급 {won(M27)}을 바로 기준으로 삼으면 {won(CLOCK_NOW)}이 나오므로, 실제 명세서의 국민연금은 계산기보다 적게 찍힐 수 있습니다. 그 차이는 누락이 아니라 기준 시점의 차이입니다.
      </p>
      <p>
        기준소득월액은 내는 돈이면서 나중에 받을 연금의 기준이기도 합니다. 국민연금 계산기와 같은 산식(2026년 A값 {won(NP_A_VALUE_2026)} 기준)으로 {YEARS_IN}년 가입을 가정하면, 기준소득월액이 2027년 최저임금 월 환산액일 때
        예상 노령연금은 월 약 {won(penLow.monthly)}, 상한일 때 월 약 {won(penHigh.monthly)}입니다. 보험료는 약 {PAY_RATIO.toFixed(1)}배 차이지만 연금 차이는 약 {PEN_RATIO.toFixed(1)}배에 그칩니다.
        전체 가입자의 평균소득(A값)이 산식에 함께 들어가기 때문입니다. 산식의 구조와 가입기간에 따른 변화는 <Link href="/tools/finance/national-pension">국민연금 예상 수령액 계산기</Link>에서 이어서 볼 수 있습니다.
      </p>

      <h2 id="paycheck-2027" data-toc="2027년 1월 명세서 미리 보기">2027년 1월 최저임금 명세서 미리 보기</h2>
      <p>
        앞의 변화를 한 장의 명세서로 모았습니다. 2026년과 2027년 최저임금 전일제 월급을 <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>와 같은 함수로 계산하고, 2027년에는 확정된 국민연금 인상만 더했습니다.
        건강보험은 요율이 동결됐으니 계산기 값이 그대로 2027년 값이고, 장기요양·고용보험은 새 요율이 확정되지 않아 현행 요율을 적용했습니다.
      </p>
      <DataFigure
        n={5}
        title="최저임금 전일제 월 명세서 — 2026년과 2027년 1월 추정"
        unit="단위: 원(월)"
        source={<>자료: Youtil 연봉 실수령액 계산기와 같은 계산 코드로 빌드 시 계산 — 본인 1명·비과세 없음, 소득세는 간이세액표 근사(2026년 세법)이며 2027년 열은 늘어난 국민연금 공제를 넣어 다시 계산. 국민연금은 계산기처럼 그 달 월급을 기준소득월액으로 본 값</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col" className="r">2026년</th><th scope="col" className="r">2027년 1월</th></tr></thead>
          <tbody>
            <tr><th scope="row">월 급여</th><td className="r">{num(S26.grossMonthly)}</td><td className="r">{num(S27.grossMonthly)}<small>최저임금 고시</small></td></tr>
            <tr><th scope="row">국민연금</th><td className="r">{num(S26.pension)}</td><td className="r">{num(S27_PENSION)}<small>요율 {P27_EMP}% 확정</small></td></tr>
            <tr><th scope="row">건강보험</th><td className="r">{num(S26.health)}</td><td className="r">{num(S27.health)}<small>요율 동결 확정</small></td></tr>
            <tr><th scope="row">장기요양</th><td className="r">{num(S26.longTermCare)}</td><td className="r">{num(S27.longTermCare)}<small>2026년 요율 가정</small></td></tr>
            <tr><th scope="row">고용보험</th><td className="r">{num(S26.employment)}</td><td className="r">{num(S27.employment)}<small>현행 요율 가정</small></td></tr>
            <tr><th scope="row" className="wrap">소득세·지방소득세</th><td className="r">{num(S26.totalTax)}</td><td className="r">{num(S27_TAX)}<small>2026년 세법 근사</small></td></tr>
            <tr><th scope="row">실수령</th><td className="r em">{num(S26.netMonthly)}</td><td className="r em">{num(S27_NET)}<small>추정</small></td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        월급은 {won(GROSS_GAIN)} 오르지만 실수령은 약 {won(NET_GAIN)} 늘어납니다. 차이는 늘어난 월급에 붙는 4대보험과 소득세, 그리고 국민연금 요율 인상분입니다. 건강보험은 요율이 그대로여도 월급이 오른 만큼 월 {won(HEALTH_UP)} 늘어납니다.
        앞에서 본 것처럼 실제 1~6월 국민연금은 이전 소득을 기준으로 할 가능성이 커서, 명세서의 국민연금 줄은 이 표보다 작을 수 있습니다.
      </p>
      <Callout tone="note" title="확정된 숫자만 계산에 넣었습니다">
        Youtil 계산기는 {ASOF} 현재 시행 중인 2026년 요율로 계산합니다. 이 글의 2027년 열은 법률이나 위원회 의결로 확정된 값만 더했고, 발표 전이거나 정부안 단계인 숫자는 넣지 않았습니다.
      </Callout>

      <h2 id="unemployment" data-toc="퇴사 뒤의 숫자 — 구직급여 상·하한">퇴사 뒤의 숫자 — 최저임금이 구직급여 하한을 끌어올린다</h2>
      <p>
        구직급여 1일액은 기초일액(이직 전 3개월 평균임금일액, 1일 통상임금이 더 크면 통상임금 — 고용보험법 제45조)의 {Math.round(UI_BENEFIT_RATE * 100)}%이지만, 하한과 상한 사이로 정해집니다. 하한은 최저시급 × 이직 전 1일 소정근로시간 × {Math.round(UI_DAILY_FLOOR_RATE * 100)}%로 최저임금에 연동되고,
        상한은 시행령으로 따로 정합니다<Ref n={16} />. 그래서 최저임금이 오르면 하한은 자동으로 오르지만 상한은 제도를 고쳐야 움직입니다.
      </p>
      <p>
        2026년 하한은 {won(UI_DAILY_FLOOR_2026)}, 상한은 {won(UI_DAILY_CAP_2026)}입니다. 표 1처럼 2027년 최저시급을 현행 산식에 넣으면 하한은 {won(FLOOR27)}이
        {FLOOR_OVER_CAP ? ` 되어 2026년 상한보다 ${won(FLOOR27 - UI_DAILY_CAP_2026)} 높아집니다. 상한을 조정하지 않으면 하한이 상한을 넘는 역전이 생기는 구조입니다.` : ` 되어 2026년 상한과의 차이가 ${won(UI_DAILY_CAP_2026 - FLOOR27)}으로 좁아집니다.`}
        {FLOOR_BEATS_NET && <> 또 2026년 하한을 30일로 환산한 {won(FLOOR26_MONTH)}은 같은 해 최저임금 전일제 월 실수령 약 {won(S26.netMonthly)}(표 5)보다 많습니다.</>}
      </p>
      <p>
        정부는 2026년 9월 1일 이런 구조를 고치는 고용보험 개편안을 고용보험위원회에 보고했습니다<Ref n={12} />. 발표된 내용은 상한을 하한의 {UI_PLAN.capPctOfFloor}%로 연동하고, 구직급여를 무급휴일을 뺀 주 {UI_PLAN.payDaysPerWeek}일 기준으로 지급하되
        소정급여일수와 총액은 유지하는 것입니다. {ASOF} 현재 법령 개정 전이므로 2027년 상한액과 지급 방식은 확정되지 않았습니다. 이직을 앞두고 있다면 신청 시점의 기준을 고용보험 누리집<Ref n={17} />에서 확인하고,
        예상 금액은 <Link href="/tools/finance/unemployment-benefit">실업급여 계산기</Link>에 이직일(마지막 근무일)을 넣어 계산해 보세요. 이직일이 2027년이면 하한은 2027년 최저시급 기준({won(FLOOR27)}, 8시간), 상한은 아직 고시 전이라 현행 값으로 계산합니다.
      </p>

      <h2 id="checklist" data-toc="해가 바뀔 때 체크리스트">해가 바뀔 때 확인할 것 — 체크리스트</h2>
      <p>숫자가 바뀌는 달에 맞춰 명세서와 계약서를 한 번씩 확인해 보세요. 이상한 점이 있으면 급여 담당자에게 적용 기준부터 묻는 것이 가장 빠릅니다.</p>
      <GuideChecklist>
        <li><strong>1월 급여</strong>: 시급이 {won(W27)} 이상인지, 주 {WORK_HOURS_WEEK}시간 전일제라면 최저임금에 들어가는 월 임금(기본급과 매달 정기적으로 받는 상여금·수당 등)이 월 {won(M27)} 이상인지 확인합니다<Ref n={1} />. 연장·야간·휴일근로 가산수당은 여기에 넣지 않습니다.</li>
        <li><strong>1월 국민연금</strong>: 기준소득월액 × {P27_EMP}%로 바뀌었는지 봅니다. 기준소득월액 자체는 7월까지 그대로일 수 있습니다.</li>
        <li><strong>1월 건강보험</strong>: 요율은 {R26.health.employee}%(근로자) 그대로입니다. 장기요양보험료는 10월 이후 결정될 2027년 요율을 따릅니다.</li>
        <li><strong>연봉 계약</strong>: 연봉을 12로 나눈 월급(최저임금에 들어가는 임금만)을 월 {MONTHLY_WORK_HOURS}시간으로 나눈 시급이 새 최저시급보다 낮아지지 않는지 계약 갱신 때 확인합니다.</li>
        <li><strong>7월 급여</strong>: 국민연금 기준소득월액이 전년도 소득으로 다시 정해져 공제액이 바뀝니다. 월급이 상한 근처라면 새 상한도 확인합니다.</li>
        <li><strong>퇴사 예정</strong>: 구직급여 상한과 지급 방식 개편이 확정됐는지, 이직 시점에 적용되는 기준을 확인합니다.</li>
      </GuideChecklist>

      <Faq items={FAQ} />
    </GuideLayout>
  )
}
