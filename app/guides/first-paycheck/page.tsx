/* app/guides/first-paycheck/page.tsx (server) — 계산 해설 G1 '첫 월급 명세서 읽는 법'
   여정: 연봉 → 월 급여 → 비과세 → 4대보험 근로자분 → 간이세액표 소득세·지방소득세 → 실수령 → 연말정산.
   ─ 법정 수치(요율·상하한·비과세 한도·지방소득세 비율·원천징수 비율·규정 시행월)는 lib 단일 소스(krInsuranceRates·krIncomeTax)와
     연봉·퇴직금 계산기 코드에서 보간한다. 법령 조문 번호·법률 번호는 출처 표기(문자열)로만 쓴다.
   ─ 기준 시점 = 레지스트리 updated(AS_OF). 국민연금 상·하한은 pensionBaseAt(AS_OF)로 고정 — 빌드일이 바뀌어도 글의 날짜와 숫자가 함께 움직인다.
     계산기 기본값(SALARY_PENSION_BASE)이 다른 구간으로 넘어가면 개발 모드에서 경고 → 글을 갱신하고 updated를 올린다.
   ─ 예시 3개(연봉 3,000만·4,500만·9,000만, 식대 비과세)는 연봉 계산기와 같은 calcSalary로 빌드 시 계산한다.
     소득세는 계산기의 근사(연 결정세액 ÷ 12)라 간이세액표 칸 값과 다를 수 있다 → 표·요약·연말정산·FAQ 모두 '추정'으로 표기.
   ─ 문장 속 대소 비교(세금 > 4대보험, 상한 초과 등)는 값으로 분기해 요율이 바뀌어도 거짓 문장이 되지 않게 한다.
   ─ 도구 페이지(salary·4-insurance·year-end-tax) 가이드와 겹치는 표(연봉표·요율 변경표·공제 한도표)는 싣지 않고 링크한다.
   ─ 법령 대조(2026-09): 국가법령정보센터 원문을 미러한 legalize-kr 저장소의 조문·부칙·개정 이력으로 확인. */
import Link from 'next/link'
import GuideLayout, { guideMetadata, Ref, GuideSteps, GuideChecklist } from '../_components/GuideLayout'
import DataFigure from '@/components/DataFigure'
import Callout from '@/components/Callout'
import Faq from '@/components/Faq'
import { calcSalary, NON_TAXABLE_ITEMS, RATES_2026, SALARY_PENSION_BASE } from '@/app/tools/finance/salary/salaryUtils'
import { calcSeverance, checkEligibility, parseDate, addDays, addMonths } from '@/app/tools/finance/severance/severanceUtils'
import {
  EI_MID_MONTH_HIRE, INSURANCE_RATES, PENSION_BASE_SCHEDULE, WORK_HOURS_WEEK,
  pensionBaseAt, pensionBasePeriodLabel, pensionBaseUntil, type PensionBasePeriod,
} from '@/lib/krInsuranceRates'
import { BRACKETS_2026, LOCAL_INCOME_TAX_RATIO, WITHHOLDING_RATIO_OPTIONS } from '@/lib/krIncomeTax'
import { EMPLOYEE_INSURANCE_TOTAL_2026, getGuide, guideHref } from '@/lib/guides'

const SLUG = 'first-paycheck'
export const metadata = guideMetadata(SLUG)

const GUIDE = getGuide(SLUG)
if (!GUIDE) throw new Error(`[guide] lib/guides에 없는 slug: ${SLUG}`)

/* ── 기준 시점 ─────────────────────────────────────────── */
/** 글의 기준일 = 내용이 마지막으로 바뀐 날(레지스트리 updated) */
const AS_OF = GUIDE.updated
const [AS_Y, AS_M] = AS_OF.split('-').map(Number)
/** calcSalary가 쓰는 요율 연도(RATES_2026) — INSURANCE_RATES 키와 같다 */
const RATE_YEAR = 2026
const ym = (s: string) => s.slice(0, 7)
const ymLabel = (s: string) => { const [y, m] = s.split('-').map(Number); return `${y}년 ${m}월` }

/* ── 기준값 (lib 단일 소스) ─────────────────────────────── */
const R = INSURANCE_RATES[RATE_YEAR]
const PB = pensionBaseAt(AS_OF)
const PB_LABEL = pensionBasePeriodLabel(PB)
const MEAL = NON_TAXABLE_ITEMS.find(i => i.id === 'meal')?.monthlyMax ?? 0
const LTC_RATIO = (RATES_2026.longTermCareRatio * 100).toFixed(2)
const EMP_TOTAL = Math.round(EMPLOYEE_INSURANCE_TOTAL_2026 * 1e4) / 1e4
const TAX_MIN = Math.round(BRACKETS_2026[0].rate * 100)
const TAX_MAX = Math.round(BRACKETS_2026[BRACKETS_2026.length - 1].rate * 100)
const LOCAL_PCT = `${Math.round(LOCAL_INCOME_TAX_RATIO * 100)}%`
const WH_LOW = Math.min(...WITHHOLDING_RATIO_OPTIONS)
const WH_HIGH = Math.max(...WITHHOLDING_RATIO_OPTIONS)
const ratioPct = (r: number) => `${Math.round(r * 100)}%`
const WH_LIST = WITHHOLDING_RATIO_OPTIONS.map(r => Math.round(r * 100)).join('·')
/** 고용보험 월 중간 입사 규칙(보험료징수법 §16의4) — 글 기준 시점에 '다음 달부터' 규칙이 시행 중인가 */
const EI = EI_MID_MONTH_HIRE
const EI_NEXT_LABEL = ymLabel(EI.nextMonthSince)
const EI_HIRE_LABEL = ymLabel(EI.fromHireDateSince)
const EI_NEXT_MONTH_NOW = ym(AS_OF) >= EI.nextMonthSince && ym(AS_OF) < EI.fromHireDateSince

/* 퇴직금 요건 — 퇴직금 계산기 severanceUtils의 판정·계산 함수에서 역으로 구한다(숫자를 다시 적지 않는다) */
const SEV_START = parseDate(`${RATE_YEAR - 2}-01-01`)
const SEV_DAYS = calcSeverance(1, 365)
const SEV_MIN_H = Array.from({ length: WORK_HOURS_WEEK + 1 }, (_, h) => h)
  .find(h => checkEligibility(SEV_START, addDays(addMonths(SEV_START, 24), -1), h).eligible) ?? WORK_HOURS_WEEK
const SEV_MIN_MONTHS = Array.from({ length: 36 }, (_, i) => i + 1)
  .find(m => checkEligibility(SEV_START, addDays(addMonths(SEV_START, m), -1), WORK_HOURS_WEEK).eligible) ?? 12
const SEV_MIN_SPAN = SEV_MIN_MONTHS % 12 === 0 ? `${SEV_MIN_MONTHS / 12}년` : `${SEV_MIN_MONTHS}개월`

const LEAVING = getGuide('leaving-job-money')
const NUMBERS = getGuide('numbers-2026-2027')

/* 기준 시점이 계산기 기본값·규칙 시행 구간과 어긋나면 개발 중에 알린다 — 글 갱신 신호 */
if (process.env.NODE_ENV !== 'production') {
  if (AS_Y !== RATE_YEAR) console.warn(`[guide ${SLUG}] 기준일 ${AS_OF}이 요율 연도 ${RATE_YEAR}와 다름 — 본문 연도·예시를 갱신하세요`)
  if (SALARY_PENSION_BASE.from !== PB.from) console.warn(`[guide ${SLUG}] 연봉 계산기 국민연금 상·하한(${SALARY_PENSION_BASE.from}~)이 글 기준(${PB.from}~)과 다름 — 글을 갱신하세요`)
  if (!EI_NEXT_MONTH_NOW) console.warn(`[guide ${SLUG}] 고용보험 월 중간 입사 규칙이 기준일 ${AS_OF}에 '다음 달부터'가 아님 — 첫 달 표를 갱신하세요`)
}

/* ── 포맷 ───────────────────────────────────────────────── */
const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
const num = (n: number) => Math.round(n).toLocaleString('ko-KR')
const manwon = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만 원`
const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만`
const pct1 = (n: number) => `${n.toFixed(1)}%`

/* ── 예시: 연봉 계산기와 같은 함수·같은 입력 규칙 (본인 1명 · 자녀 없음 · 식대 비과세) ── */
const base = { dependents: 1, childrenCount: 0, isInsured: true, pensionBase: PB } as const
const SCENARIOS = [30_000_000, 45_000_000, 90_000_000].map(y => ({
  y,
  r: calcSalary({ ...base, grossYearly: y, nonTaxableMonthly: MEAL }),
  noMeal: calcSalary({ ...base, grossYearly: y, nonTaxableMonthly: 0 }),
}))
const [S1, S2, S3] = SCENARIOS
const MEAL_GAIN = S2.r.netMonthly - S2.noMeal.netMonthly
const MEAL_INS = S2.noMeal.totalInsurance - S2.r.totalInsurance
const MEAL_TAX = S2.noMeal.totalTax - S2.r.totalTax

/* 요율 연도에 걸치는 국민연금 상·하한 구간(스케줄에서 파생) — 상반기·하반기 */
const Y_FIRST = `${RATE_YEAR}-01`
const Y_LAST = `${RATE_YEAR}-12`
const PB_YEAR: PensionBasePeriod[] = PENSION_BASE_SCHEDULE.filter(p => p.from <= Y_LAST && pensionBaseUntil(p) >= Y_FIRST)
const pensionAt = (monthly: number, p: PensionBasePeriod) =>
  calcSalary({ ...base, grossYearly: monthly * 12, nonTaxableMonthly: 0, pensionBase: p }).pension
/** 요율 연도 안에서 그 구간이 적용되는 달 — '2026년 1~6월' */
const monthsInYear = (p: PensionBasePeriod) => {
  const from = Number((p.from > Y_FIRST ? p.from : Y_FIRST).slice(5, 7))
  const until = pensionBaseUntil(p)
  const to = Number((until < Y_LAST ? until : Y_LAST).slice(5, 7))
  return `${RATE_YEAR}년 ${from}~${to}월`
}
/** 고시 적용 기간 짧은 표기 — '2025.7~2026.6' */
const shortPeriod = (p: PensionBasePeriod) => {
  const [fy, fm] = p.from.split('-').map(Number)
  const [ty, tm] = pensionBaseUntil(p).split('-').map(Number)
  return `${fy}.${fm}~${ty}.${tm}`
}
/** 상·하한이 바뀌는 달(고시 적용 시작월)과 끝나는 달 — 스케줄에서 파생 */
const PB_START_M = Number(PB.from.slice(5, 7))
const PB_END_M = Number(pensionBaseUntil(PB).slice(5, 7))
/** 요율 연도 안의 앞·뒤 구간(상반기·하반기)과 예시 3의 국민연금 */
const PB_A = PB_YEAR[0]
const PB_B = PB_YEAR[PB_YEAR.length - 1]
const S3_PENSION_A = calcSalary({ ...base, grossYearly: S3.y, nonTaxableMonthly: MEAL, pensionBase: PB_A }).pension
const S3_PENSION_B = calcSalary({ ...base, grossYearly: S3.y, nonTaxableMonthly: MEAL, pensionBase: PB_B }).pension
const S3_CAPPED = S3.r.taxableMonthly > PB.max
const S12_IN = [S1, S2].every(x => x.r.taxableMonthly >= PB.min && x.r.taxableMonthly <= PB.max)

/* 소득세 원천징수 비율 선택(시행령 §194①) — 예시 2의 월 소득세 추정치 기준, 10원 미만 절사 */
const floor10 = (n: number) => Math.floor(n / 10) * 10
const TAX_LOW = floor10(S2.r.incomeTax * WH_LOW)
const TAX_HIGH = floor10(S2.r.incomeTax * WH_HIGH)

const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0)

/* ── 참고 자료 — 배열 순서 = 본문 <Ref n> 번호. 본문은 키로 참조(src('meal'))해 번호가 밀리지 않게 한다 ── */
const LAW = 'https://www.law.go.kr/법령'
const EI_LAW = '고용보험및산업재해보상보험의보험료징수등에관한법률'
const actDate = (d: string) => d.replace(/-/g, '')
const actDot = (d: string) => d.split('-').map(Number).join('.')
const SOURCE_LIST = [
  ['meal',     { label: `소득세법 제12조(비과세소득) 제3호 러목 — 식사를 제공받지 않는 근로자의 월 ${manwon(MEAL)} 이하 식사대`, href: `${LAW}/소득세법/제12조`, org: '국가법령정보센터' }],
  ['nps5',     { label: '국민연금법 시행령 제5조(기준소득월액 및 적용기간)', href: `${LAW}/국민연금법시행령/제5조`, org: '국가법령정보센터' }],
  ['npsNotice', { label: '보건복지부 고시 「국민연금 기준소득월액 상한액과 하한액」', href: 'https://www.law.go.kr/행정규칙/국민연금기준소득월액상한액과하한액', org: '국가법령정보센터 행정규칙' }],
  ['nps7',     { label: '국민연금법 시행령 제7조(가입기간 중 기준소득월액의 결정 및 적용 기간)', href: `${LAW}/국민연금법시행령/제7조`, org: '국가법령정보센터' }],
  ['nhis69',   { label: '국민건강보험법 제69조(보험료)', href: `${LAW}/국민건강보험법/제69조`, org: '국가법령정보센터' }],
  ['nhis73',   { label: '국민건강보험법 제73조(보험료율 등)', href: `${LAW}/국민건강보험법/제73조`, org: '국가법령정보센터' }],
  ['ltc9',     { label: '노인장기요양보험법 제9조(장기요양보험료의 산정)', href: `${LAW}/노인장기요양보험법/제9조`, org: '국가법령정보센터' }],
  ['ei13',     { label: '고용보험 및 산업재해보상보험의 보험료징수 등에 관한 법률 제13조(보험료)', href: `${LAW}/${EI_LAW}/제13조`, org: '국가법령정보센터' }],
  ['wh134',    { label: '소득세법 제134조(근로소득에 대한 원천징수시기 및 방법)', href: `${LAW}/소득세법/제134조`, org: '국가법령정보센터' }],
  ['wh189',    { label: '소득세법 시행령 제189조(간이세액표) — 별표 2 근로소득 간이세액표', href: `${LAW}/소득세법시행령/제189조`, org: '국가법령정보센터' }],
  ['wh194',    { label: `소득세법 시행령 제194조(근로소득 간이세액표의 적용) 제1항 — 간이세액표 세액의 ${ratioPct(WH_LOW)}·${ratioPct(WH_HIGH)} 선택`, href: `${LAW}/소득세법시행령/제194조`, org: '국가법령정보센터' }],
  ['local',    { label: `지방세법 제103조의13(특별징수의무) — 원천징수 소득세의 ${LOCAL_PCT}`, href: `${LAW}/지방세법/제103조의13`, org: '국가법령정보센터' }],
  ['nps17',    { label: '국민연금법 제17조(국민연금 가입기간의 계산) 제1항', href: `${LAW}/국민연금법/제17조`, org: '국가법령정보센터' }],
  ['ei164',    { label: '보험료징수법 제16조의4(월 중간 고용관계 변동 등에 따른 월별보험료 산정)', href: `${LAW}/${EI_LAW}/제16조의4`, org: '국가법령정보센터' }],
  ['eiActNext', { label: `법률 제${EI.nextMonthAct.no}호 보험료징수법 일부개정(${actDot(EI.nextMonthAct.promulgated)}) 부칙 제1조·제2조 — ${EI_NEXT_LABEL} 보험료분부터 '다음 달부터' 산정`, href: `${LAW}/${EI_LAW}/(${EI.nextMonthAct.no},${actDate(EI.nextMonthAct.promulgated)})`, org: '국가법령정보센터' }],
  ['eiActHire', { label: `법률 제${EI.fromHireDateAct.no}호 보험료징수법 일부개정(${actDot(EI.fromHireDateAct.promulgated)}) — ${EI_HIRE_LABEL} 시행, '입사한 날부터' 산정`, href: `${LAW}/${EI_LAW}/(${EI.fromHireDateAct.no},${actDate(EI.fromHireDateAct.promulgated)})`, org: '국가법령정보센터' }],
  ['ye137',    { label: '소득세법 제137조(근로소득세액의 연말정산)', href: `${LAW}/소득세법/제137조`, org: '국가법령정보센터' }],
  ['credit',   { label: '소득세법 제59조의4(특별세액공제) — 제1항~제3항 보험료·의료비·교육비, 제4항 기부금', href: `${LAW}/소득세법/제59조의4`, org: '국가법령정보센터' }],
  ['card',     { label: '조세특례제한법 제126조의2(신용카드 등 사용금액에 대한 소득공제) 제1항', href: `${LAW}/조세특례제한법/제126조의2`, org: '국가법령정보센터' }],
  ['nhisD34',  { label: '국민건강보험법 시행령 제34조(직장가입자에 대한 보수월액보험료 부과의 원칙)', href: `${LAW}/국민건강보험법시행령/제34조`, org: '국가법령정보센터' }],
  ['nhisD39',  { label: '국민건강보험법 시행령 제39조(보수월액보험료의 정산 및 분할납부)', href: `${LAW}/국민건강보험법시행령/제39조`, org: '국가법령정보센터' }],
  ['sev4',     { label: '근로자퇴직급여 보장법 제4조(퇴직급여제도의 설정) 제1항', href: `${LAW}/근로자퇴직급여보장법/제4조`, org: '국가법령정보센터' }],
  ['sev8',     { label: '근로자퇴직급여 보장법 제8조(퇴직금제도의 설정 등) 제1항', href: `${LAW}/근로자퇴직급여보장법/제8조`, org: '국가법령정보센터' }],
] as const
type SrcKey = (typeof SOURCE_LIST)[number][0]
const SOURCES = SOURCE_LIST.map(([, s]) => ({ ...s }))
const SRC_KEYS: readonly SrcKey[] = SOURCE_LIST.map(([k]) => k)
function src(k: SrcKey) {
  return <Ref n={SRC_KEYS.indexOf(k) + 1} />
}

/* ── FAQ (답변 = 신뢰된 정적 HTML, 수치는 위 상수에서 보간) ── */
const FAQ = [
  {
    q: '첫 월급에서 국민연금·건강보험이 빠지지 않았어요. 누락된 건가요?',
    a: `매월 1일이 아닌 날 입사했다면 정상일 수 있습니다. 국민연금과 건강보험(장기요양 포함)은 자격을 얻은 날이 속한 달의 <strong>다음 달부터</strong> 보험료를 매깁니다. 고용보험도 ${EI_NEXT_LABEL} 보험료분부터 월 중간 입사자는 다음 달부터 매기고 있습니다. 두 번째 달 명세서부터 네 가지가 모두 보이는지 확인하세요. 국민연금은 본인이 원하면 입사한 달부터 낼 수도 있습니다. 고용보험은 ${EI_HIRE_LABEL}부터 시행되는 개정으로 입사한 날부터 매기도록 다시 바뀝니다.`,
  },
  {
    q: '연봉이 올랐는데 국민연금 공제액은 그대로예요.',
    a: `국민연금은 지금 월급이 아니라 <strong>기준소득월액</strong>에 요율(${R.pension.employee}%)을 곱합니다. 기준소득월액은 입사 때 회사가 신고한 소득으로 정해지고, 이후에는 매년 ${PB_START_M}월 전년도 소득으로 다시 정해져 다음 해 ${PB_END_M}월까지 쓰입니다. 그래서 연봉 인상분은 보통 다음 ${PB_START_M}월에 반영됩니다(회사가 소득 변경을 따로 신고한 경우는 예외). 월급이 상한(${PB_LABEL} ${manwon(PB.max)})을 넘으면 더 오르지 않습니다.`,
  },
  {
    q: '명세서 소득세가 연봉 계산기 결과와 달라요.',
    a: `회사는 근로소득 간이세액표에서 월급여액 구간과 공제대상가족 수에 해당하는 칸의 세액을 뗍니다. Youtil 연봉 계산기는 이 표를 칸 단위로 찾지 않고 연간 세액을 12로 나눠 <strong>근사</strong>합니다. 간이세액표는 보험료 같은 공제를 표를 만들 때 정한 방식으로 반영하고, 계산기는 실제 보험료를 공제하므로 소득세 칸은 작지 않은 차이가 날 수 있습니다. 차이가 크다면 회사에 신고한 공제대상가족 수, 원천징수 비율(${WH_LIST}%), 비과세 항목이 계산기에 넣은 조건과 같은지 확인하고, 정확한 값은 간이세액표 해당 칸으로 확인하세요.`,
  },
  {
    q: `소득세 원천징수를 ${ratioPct(WH_LOW)}로 낮추면 이득인가요?`,
    a: `1년 동안 내는 세금은 달라지지 않습니다. 매달 덜 떼는 대신 연말정산에서 환급이 줄거나 추가로 낼 세금이 생깁니다. 연봉 ${manwon(S2.y)} 예시의 계산기 추정 월 소득세 약 ${won(S2.r.incomeTax)}을 기준으로 하면 ${ratioPct(WH_LOW)}는 약 ${won(TAX_LOW)}이고, 그 차이의 12개월분만큼 연말정산에서 덜 돌려받습니다. 실제 금액은 명세서의 간이세액표 세액에 비율을 곱해 보세요.`,
  },
  {
    q: `식대는 누구나 월 ${manwon(MEAL)}까지 비과세인가요?`,
    a: `식대 비과세는 회사에서 식사나 음식물을 제공받지 않는 근로자가 받는 식사대에 적용되고, 한도는 월 ${manwon(MEAL)}입니다. 한도를 넘는 부분과, 식사를 제공받으면서 따로 받는 식대는 과세 급여에 들어갑니다. 명세서에서 식대가 별도 지급 항목으로 적혀 있는지 확인하세요.`,
  },
  {
    q: '4월 월급에서 건강보험료가 갑자기 많이 빠졌어요.',
    a: `건강보험료는 입사 때 신고한 보수나 전년도 보수로 정한 보수월액에 먼저 매기고, 다음 해에 그해 보수 총액이 확정되면 다시 계산해 차액을 정산합니다. 전년도 보수로 정한 보수월액은 매년 4월부터 적용되므로 정산분도 보통 4월분 보험료에 함께 반영됩니다. 지난해 연봉 인상·성과급으로 실제 보수가 더 많았다면 추가분이 빠지고, 적었다면 돌려받습니다. 소득세 연말정산과는 별개의 절차입니다.`,
  },
]

export default function FirstPaycheckGuide() {
  return (
    <GuideLayout
      slug={SLUG}
      lead={<>명세서 맨 위의 지급액과 통장에 들어온 금액 사이에는 정해진 순서가 있습니다. 비과세를 빼고, 4대보험 요율을 곱하고, 간이세액표로 소득세를 떼고, 그 {LOCAL_PCT}를 지방소득세로 뗍니다. 이 글은 그 순서를 법 조문과 함께 따라가고, 연봉 세 가지를 연봉 계산기와 같은 코드로 풀어 봅니다.</>}
      basis={<>{RATE_YEAR}년 4대보험 요율(1월 1일 시행) · 국민연금 기준소득월액 상·하한 {PB_LABEL} · 비과세 식대 월 {manwon(MEAL)} · 법령은 {AS_Y}년 {AS_M}월 현행</>}
      glance={[
        <>공제는 <strong>비과세 제외 → 4대보험 → 소득세 → 지방소득세</strong> 순서로 정해집니다. 비과세 급여에는 원칙적으로 보험료도 세금도 붙지 않습니다.</>,
        <>{RATE_YEAR}년 근로자 4대보험 요율 합계는 <strong>{EMP_TOTAL}%</strong>(국민연금 {R.pension.employee}% · 건강 {R.health.employee}% · 장기요양 {R.ltc.employee}% · 고용 {R.unemp.employee}%). 국민연금은 상한 {manwon(PB.max)}을 넘는 월급에는 더 붙지 않습니다.</>,
        <>연봉 {manwon(S2.y)}, 식대 비과세 {manwon(MEAL)}이면 월 실수령은 약 <strong>{won(S2.r.netMonthly)}</strong>(실수령률 {pct1(S2.r.takeHomeRate)})으로 <strong>추정</strong>됩니다. 소득세는 간이세액표 칸 값이 아닌 계산기 근사치라 명세서와 다를 수 있습니다.</>,
        <>1일에 입사하지 않았다면 첫 달에는 국민연금·건강보험·고용보험이 빠지지 않을 수 있습니다. 두 번째 달 명세서가 기준입니다(고용보험은 {EI_HIRE_LABEL}부터 입사한 날부터 매기도록 바뀝니다).</>,
        <>매달 뗀 소득세는 <strong>미리 낸 세금</strong>입니다. 다음 해 2월 급여에서 연말정산으로 확정됩니다.</>,
      ]}
      sources={SOURCES}
      related={[
        { href: '/tools/finance/salary', desc: '연봉·비과세·부양가족으로 이 글의 계산을 내 숫자로' },
        { href: '/tools/finance/4-insurance', desc: '근로자분과 회사 부담분을 항목별로' },
        { href: '/tools/finance/year-end-tax', desc: '1년 치 원천징수와 결정세액 비교' },
        { href: '/tools/finance/national-pension', desc: '지금 내는 국민연금이 나중에 받는 연금으로' },
        { href: '/tools/finance/severance', desc: `${SEV_MIN_SPAN} 이상 일하면 생기는 퇴직금 추정` },
      ]}
      disclaimer={<>이 글의 예시는 본인 1명·자녀 없음·식대 비과세 {manwon(MEAL)}을 가정한 추정이며, 소득세는 간이세액표 칸 값이 아니라 연간 세액을 12로 나눈 근사치입니다. 실제 명세서는 회사의 비과세 항목, 신고한 공제대상가족 수, 입사일, 상여 지급 방식에 따라 다릅니다.</>}
    >
      <h2 id="order" data-toc="명세서의 구조와 여섯 단계">명세서의 구조 — 연봉에서 실수령까지 여섯 단계</h2>
      <p>
        급여명세서는 크게 <strong>지급 항목</strong>(기본급·각종 수당·식대)과 <strong>공제 항목</strong>(4대보험·소득세·지방소득세)으로 나뉩니다.
        지급 합계에서 공제 합계를 뺀 금액이 통장에 들어오는 실지급액입니다. 공제액은 아래 순서로 정해지고, 앞 단계의 결과가 다음 단계의 기준이 됩니다.
      </p>
      <GuideSteps>
        <li><b>월 급여</b><span>연봉 계약 금액을 12로 나눈 값이 출발점입니다. 상여를 연봉과 별도로 주거나 특정 달에 몰아 주는 회사라면 매달 받는 금액이 연봉 ÷ 12와 다릅니다.</span></li>
        <li><b>비과세 빼기</b><span>식대처럼 법이 정한 비과세 급여를 빼면 과세 급여가 남습니다. 이후 단계는 모두 과세 급여를 기준으로 합니다.</span></li>
        <li><b>4대보험 근로자분</b><span>과세 급여(국민연금은 상·하한을 적용한 기준소득월액)에 각 보험의 근로자 요율을 곱합니다.</span></li>
        <li><b>소득세</b><span>과세 급여와 공제대상가족 수, 그중 자녀 수로 근로소득 간이세액표의 세액을 찾습니다.</span></li>
        <li><b>지방소득세</b><span>소득세의 {LOCAL_PCT}를 함께 뗍니다.</span></li>
        <li><b>실수령</b><span>월 급여에서 4대보험과 두 세금을 뺀 금액입니다. <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>가 이 여섯 단계를 차례로 계산합니다(소득세는 근사).</span></li>
      </GuideSteps>

      <h2 id="nontax" data-toc="비과세 — 두 번 아끼는 돈">비과세 — 세금과 보험료가 모두 붙지 않는 돈</h2>
      <p>
        소득세법은 근로소득 가운데 일부를 비과세로 정해 두었습니다{src('meal')}. 대표적인 것이 식대로, 회사에서 식사를 따로 제공받지 않는 근로자가 받는
        식사대는 월 {manwon(MEAL)}까지 비과세입니다. 비과세 급여는 소득세 계산에서 빠질 뿐 아니라 4대보험의 보수·소득을 정할 때도 원칙적으로 제외되므로, 같은 금액이라도
        과세 급여로 받을 때보다 실수령이 커집니다.
      </p>
      <p>
        예를 들어 연봉 {manwon(S2.y)}에서 식대 {manwon(MEAL)}이 비과세이면, 전부 과세 급여일 때보다 4대보험이 월 {won(MEAL_INS)}, 소득세와 지방소득세가 월 약 {won(MEAL_TAX)} 줄어
        실수령이 월 약 {won(MEAL_GAIN)} 늘어납니다(계산기 추정). 연봉 계약서의 총액이 같아도 식대가 별도 항목으로 잡혀 있는지에 따라 명세서가 달라지는 이유입니다.
      </p>

      <h2 id="insurance" data-toc="4대보험 — 무엇에 몇 %를 곱하나">4대보험 근로자분 — 무엇에 몇 %를 곱하나</h2>
      <p>
        4대보험 가운데 명세서에서 빠지는 것은 국민연금·건강보험·장기요양보험·고용보험의 <strong>근로자 몫</strong>입니다. 네 보험은 곱하는 기준이 조금씩 다릅니다.
        특히 장기요양보험은 월급이 아니라 건강보험료에 비율을 곱하므로, 명세서에서 건강보험료 바로 아래에 붙어 나옵니다. 산재보험은 회사가 전액 부담해 명세서에 나오지 않습니다.
      </p>
      <DataFigure
        n={1}
        title={`${RATE_YEAR}년 명세서 4대보험 — 기준과 근로자 요율`}
        unit={`요율 ${RATE_YEAR}.1.1 시행 · 국민연금 상·하한 ${shortPeriod(PB)}`}
        source={<>자료: 각 근거 법령과 기관 고시 요율 — Youtil 연봉·4대보험 계산기와 같은 기준값. 합계는 국민연금 상한 적용 전·산재 제외</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col">곱하는 기준</th><th scope="col" className="r">근로자 요율</th></tr></thead>
          <tbody>
            <tr><th scope="row">국민연금{src('nps5')}</th><td className="wrap">기준소득월액<small>과세 급여에 하한 {man(PB.min)}·상한 {man(PB.max)} 적용 · 국민연금법 시행령 제5조</small></td><td className="r em">{R.pension.employee}%</td></tr>
            <tr><th scope="row">건강보험{src('nhis69')}{src('nhis73')}</th><td className="wrap">보수월액<small>과세 급여 · 국민건강보험법 제69조·제73조</small></td><td className="r em">{R.health.employee}%</td></tr>
            <tr><th scope="row">장기요양{src('ltc9')}</th><td className="wrap">건강보험료 × {LTC_RATIO}%<small>오른쪽은 보수 대비 환산 요율 · 노인장기요양보험법 제9조</small></td><td className="r em">{R.ltc.employee}%</td></tr>
            <tr><th scope="row">고용보험{src('ei13')}</th><td className="wrap">보수<small>과세 급여 × 실업급여 보험료율의 절반 · 보험료징수법 제13조</small></td><td className="r em">{R.unemp.employee}%</td></tr>
            <tr><th scope="row">합계</th><td className="wrap">산재보험은 근로자 부담 없음</td><td className="r em">{EMP_TOTAL}%</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <h3 id="pension-cap">국민연금만 {PB_START_M}월에 기준이 바뀝니다</h3>
      <p>
        국민연금은 월급 그대로가 아니라 <strong>기준소득월액</strong>에 요율을 곱합니다. 기준소득월액에는 하한과 상한이 있어 월급이 상한을 넘으면 상한까지만,
        하한보다 적으면 하한으로 계산합니다. 이 상·하한은 보건복지부 장관이 고시하고, 매년 {PB_START_M}월부터 다음 해 {PB_END_M}월까지 적용됩니다{src('nps5')}{src('npsNotice')}. 그래서 같은 {RATE_YEAR}년이라도
        상반기와 하반기 명세서의 국민연금 상한이 다릅니다. 요율은 1월부터 12월까지 같습니다.
      </p>
      <DataFigure
        n={2}
        title={`${RATE_YEAR}년 명세서에 적용되는 국민연금 기준소득월액 상·하한`}
        unit="단위: 원 · 보험료는 근로자분(월)"
        source={<>자료: 보건복지부 고시{src('npsNotice')}(국민연금법 시행령 제5조 제3항·제4항{src('nps5')}) — 월 보험료는 {RATE_YEAR}년 근로자 요율 {R.pension.employee}%를 연봉 계산기와 같은 방식(10원 미만 절사)으로 계산</>}
      >
        <table>
          <thead>
            <tr><th scope="col">구분</th>{PB_YEAR.map(p => <th key={p.from} scope="col" className="r">{monthsInYear(p)}</th>)}</tr>
          </thead>
          <tbody>
            <tr><th scope="row">하한</th>{PB_YEAR.map(p => <td key={p.from} className="r">{num(p.min)}<small>보험료 {num(pensionAt(p.min, p))}</small></td>)}</tr>
            <tr><th scope="row">상한</th>{PB_YEAR.map(p => <td key={p.from} className="r em">{num(p.max)}<small>보험료 {num(pensionAt(p.max, p))}</small></td>)}</tr>
            <tr><th scope="row">고시 기간</th>{PB_YEAR.map(p => <td key={p.from} className="r">{shortPeriod(p)}{p.from === PB.from && <small>이 글의 예시 기준</small>}</td>)}</tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        기준소득월액 자체도 1년에 한 번 정해집니다. 입사 때는 회사가 신고한 소득으로 정하고{src('nps5')}, 이후에는 매년 {PB_START_M}월 전년도 소득을 바탕으로 다시 정해 다음 해 {PB_END_M}월까지 씁니다{src('nps7')}.
        연봉이 올라도 국민연금 공제액이 바로 따라 오르지 않는 이유입니다. 회사 부담분까지 합친 전체 보험료는 <Link href="/tools/finance/4-insurance">4대보험 계산기</Link>로,
        지금 내는 보험료가 나중에 어떤 연금이 되는지는 <Link href="/tools/finance/national-pension">국민연금 예상 수령액 계산기</Link>로 이어서 볼 수 있습니다.
      </p>

      <h2 id="tax" data-toc="소득세·지방소득세 — 간이세액표">소득세·지방소득세 — 간이세액표로 미리 떼는 세금</h2>
      <p>
        회사는 매달 월급을 줄 때 <strong>근로소득 간이세액표</strong>에 따라 소득세를 떼어 대신 냅니다{src('wh134')}. 간이세액표는 소득세법 시행령 별표 2에 실린 표로{src('wh189')},
        비과세를 뺀 월급여액 구간과 공제대상가족 수(본인 포함), 그중 자녀 수에 따라 세액을 정해 둡니다. 공제대상가족 수는 입사할 때 회사에 내는 공제 신고서에
        적은 인원을 따르므로, 부양가족을 신고하지 않았다면 그만큼 소득세가 더 떼입니다.
      </p>
      <p>
        이 금액은 1년 소득을 미리 짐작해 나눠 내는 세금이라, 확정된 세금이 아닙니다. 최종 세금은 과세표준에 {TAX_MIN}~{TAX_MAX}% 누진세율을 적용해 연말정산 때 다시 계산합니다.
        근로자는 간이세액표 세액의 {ratioPct(WH_LOW)}나 {ratioPct(WH_HIGH)}를 떼 달라고 신청할 수도 있습니다{src('wh194')}. 소득세가 정해지면 그 {LOCAL_PCT}가 지방소득세로 함께 빠집니다{src('local')}.
      </p>
      <Callout tone="note" title="이 글과 연봉 계산기의 소득세는 추정치입니다">
        간이세액표는 월급여액과 가족 수만으로 세액을 정해 둔 표라, 보험료 같은 공제도 사람마다의 실제 금액이 아니라 표를 만들 때 정한 방식으로 들어 있습니다.
        Youtil 연봉 계산기는 이 표를 칸 단위로 찾지 않고, 월 과세 급여를 1년치로 늘려 근로소득공제·기본공제·실제 보험료 공제·근로소득세액공제·자녀세액공제를 적용한
        연간 세액을 12로 나눠 근사합니다. 공제 가정이 달라 소득세 칸은 명세서와 눈에 띄게 다를 수 있습니다. 4대보험은 요율을 곱하는 계산이라 기준 금액이 같으면 명세서와 가깝게 나오니,
        비교할 때는 4대보험부터 맞춰 보고 소득세는 간이세액표 해당 칸으로 확인하세요.
      </Callout>

      <h2 id="examples" data-toc="연봉 세 가지로 따라 해 보기">연봉 세 가지로 따라 해 보기</h2>
      <p>
        아래 표는 연봉 {manwon(S1.y)}·{manwon(S2.y)}·{manwon(S3.y)}에 식대 비과세 {manwon(MEAL)}, 본인 1명(자녀 없음)을 넣어 연봉 계산기와 같은 함수로 계산한 결과입니다.
        4대보험은 요율대로 계산한 값이고, 소득세·지방소득세는 위에서 설명한 근사치입니다.
        {S3_CAPPED && S12_IN ? ` 앞의 두 연봉은 국민연금 상·하한 안에 있고, ${manwon(S3.y)}은 과세 급여가 상한을 넘는 경우입니다.` : ''}
      </p>
      <DataFigure
        n={3}
        title="연봉별 월 공제 추정 — 식대 비과세 적용"
        unit="단위: 원(월) · 열 = 연봉"
        source={<>자료: Youtil 연봉 실수령액 계산기와 같은 계산 코드로 빌드 시 계산 — {RATE_YEAR}년 요율·국민연금 상·하한 {PB_LABEL}. 소득세·지방소득세는 연간 세액 ÷ 12 근사로, 간이세액표 칸 값과 다를 수 있음</>}
      >
        <table className="tight">
          <thead>
            <tr><th scope="col">항목</th>{SCENARIOS.map(x => <th key={x.y} scope="col" className="r">{man(x.y)}</th>)}</tr>
          </thead>
          <tbody>
            <tr><th scope="row">① 월 급여</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.grossMonthly)}</td>)}</tr>
            <tr><th scope="row">② 비과세<small>식대</small></th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.nonTaxableMonthly)}</td>)}</tr>
            <tr><th scope="row">과세 급여<small>①−②</small></th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.taxableMonthly)}</td>)}</tr>
            <tr><th scope="row">국민연금</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.pension)}{x.r.taxableMonthly > PB.max && <small>상한 적용</small>}</td>)}</tr>
            <tr><th scope="row">건강보험</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.health)}</td>)}</tr>
            <tr><th scope="row">장기요양</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.longTermCare)}</td>)}</tr>
            <tr><th scope="row">고용보험</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.employment)}</td>)}</tr>
            <tr><th scope="row">③ 보험 계</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.totalInsurance)}</td>)}</tr>
            <tr><th scope="row">소득세<small>추정</small></th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.incomeTax)}</td>)}</tr>
            <tr><th scope="row">지방소득세<small>추정</small></th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.localTax)}</td>)}</tr>
            <tr><th scope="row">④ 세금 계</th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.r.totalTax)}</td>)}</tr>
            <tr><th scope="row">실수령<small>①−③−④</small></th>{SCENARIOS.map(x => <td key={x.y} className="r em">{num(x.r.netMonthly)}</td>)}</tr>
            <tr><th scope="row">실수령률</th>{SCENARIOS.map(x => <td key={x.y} className="r">{pct1(x.r.takeHomeRate)}</td>)}</tr>
            <tr><th scope="row">식대 과세<small>일 때 실수령</small></th>{SCENARIOS.map(x => <td key={x.y} className="r">{num(x.noMeal.netMonthly)}</td>)}</tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        표에서 눈여겨볼 점은 공제의 구성입니다. 연봉 {manwon(S1.y)}에서는 전체 공제 약 {won(S1.r.totalDeduction)} 가운데 4대보험이 {pct1(share(S1.r.totalInsurance, S1.r.totalDeduction))}를 차지하지만,
        연봉 {manwon(S3.y)}에서는 {S3.r.totalTax > S3.r.totalInsurance ? '세금이 4대보험보다 많아집니다' : '세금 비중이 크게 늘어납니다'}. 4대보험은 거의 일정한 비율인 반면
        소득세는 누진세율이라 소득이 오를수록 빠르게 커지기 때문입니다. 소득세 칸의 정확한 금액은 근사치라 달라질 수 있어도, 이 구조는 간이세액표에서도 같습니다.
      </p>
      {S3_CAPPED && PB_A !== PB_B && S3_PENSION_A !== S3_PENSION_B && (
        <p>
          연봉 {manwon(S3.y)}의 국민연금은 과세 급여 {won(S3.r.taxableMonthly)}이 아니라 상한에 요율을 곱한 값입니다. 같은 연봉이라도 {monthsInYear(PB_A)} 명세서에서는 {won(S3_PENSION_A)},
          {' '}{monthsInYear(PB_B).replace(`${RATE_YEAR}년 `, '')}에는 {won(S3_PENSION_B)}으로, 상한이 바뀐 만큼 공제액이 달라집니다.
        </p>
      )}

      <h2 id="first-month" data-toc="첫 달 명세서가 다른 이유">첫 달 명세서가 유독 다른 이유</h2>
      <p>
        첫 월급은 두 번째 월급과 모양이 다른 경우가 많습니다. 월 중간에 입사하면 급여가 근무일만큼 계산되는 데다, 보험료가 붙기 시작하는 달이 입사일에 따라 달라지기 때문입니다.
      </p>
      <DataFigure
        n={4}
        title={`입사일에 따라 달라지는 입사한 달의 공제 (${AS_Y}년 ${AS_M}월 기준)`}
        source={<>자료: 국민연금법 제17조 제1항{src('nps17')}, 국민건강보험법 제69조 제2항{src('nhis69')}, 보험료징수법 제16조의4{src('ei164')}{src('eiActNext')} — 고용보험은 월별보험료를 부과하는 일반 사업장 기준</>}
      >
        <table>
          <thead><tr><th scope="col">항목</th><th scope="col">1일 입사</th><th scope="col">2일~말일 입사</th></tr></thead>
          <tbody>
            <tr><th scope="row">국민연금</th><td className="wrap">입사한 달부터</td><td className="wrap">다음 달부터<small>본인이 원하면 입사한 달부터</small></td></tr>
            <tr><th scope="row">건강보험<small>장기요양 포함</small></th><td className="wrap">입사한 달부터</td><td className="wrap">다음 달부터</td></tr>
            <tr><th scope="row">고용보험</th><td className="wrap">입사한 달부터</td><td className="wrap">다음 달부터<small>{EI_NEXT_LABEL}분부터 · {EI_HIRE_LABEL}부터는 입사한 날부터</small></td></tr>
            <tr><th scope="row">소득세</th><td className="wrap">그 달 급여에 적용</td><td className="wrap">그 달 급여에 적용<small>근무일만큼 받은 급여로 간이세액표 적용</small></td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        그래서 1일이 아닌 날 입사했다면 첫 명세서에는 소득세만 있고 4대보험이 없거나 적을 수 있으며, 두 번째 달에 공제가 갑자기 늘어난 것처럼 보입니다. 누락이 아니라 부과 시작 시점의 차이이므로,
        공제가 제대로 되는지는 두 번째 달 명세서로 확인하는 편이 정확합니다. 국민연금 기준소득월액은 이때 회사가 신고한 소득으로 정해지니, 명세서의 국민연금이 요율 {R.pension.employee}%와 맞지 않으면
        신고된 소득을 확인해 보세요.
      </p>
      <p>
        고용보험의 &lsquo;다음 달부터&rsquo;는 {EI_NEXT_LABEL} 보험료분부터 적용된 규칙입니다{src('eiActNext')}. {EI_HIRE_LABEL}부터 시행되는 개정 법률은 월 중간에 입사해도
        <strong> 입사한 날부터</strong> 받은 보수에 보험료를 매기도록 바꿨으므로{src('eiActHire')}, 그 뒤에 입사하면 첫 달 명세서에 고용보험이 함께 보일 수 있습니다.
        {NUMBERS && <> 해가 바뀌며 달라지는 다른 숫자는 <Link href={guideHref(NUMBERS.slug)}>{NUMBERS.title.split(' — ')[0]}</Link> 글에 정리했습니다.</>}
      </p>

      <h2 id="year-end" data-toc="연말정산 — 1년 치 원천징수의 결산">연말정산 — 매달 뗀 소득세의 결산</h2>
      <p>
        매달 뗀 소득세를 1년 동안 모은 금액이 연말정산의 <strong>기납부세액</strong>입니다. 위 연봉 {manwon(S2.y)} 예시를 1년 내내 받았다면 계산기 추정으로 소득세 약 {won(S2.r.incomeTax * 12)}과
        지방소득세 약 {won(S2.r.localTax * 12)}을 미리 낸 셈입니다(실제로는 명세서 소득세 × 12). 회사는 다음 해 2월분 급여를 줄 때 부양가족·보험료·카드 사용액 같은 공제를 반영해 확정한 <strong>결정세액</strong>과
        기납부세액을 비교하고, 더 냈으면 돌려주고 덜 냈으면 더 뗍니다{src('ye137')}.
      </p>
      <p>
        원천징수 비율을 바꾸는 선택도 여기서 결과가 드러납니다. 같은 예시의 추정치로 보면 {ratioPct(WH_LOW)}를 고르면 월 소득세가 약 {won(TAX_LOW)}, {ratioPct(WH_HIGH)}면 약 {won(TAX_HIGH)}이 됩니다. 매달 손에 쥐는 돈만 달라질 뿐
        1년 세금은 같아서, {ratioPct(WH_LOW)}는 연말정산 환급이 줄고 {ratioPct(WH_HIGH)}는 환급이 늘어나는 구조입니다.
      </p>
      <p>
        입사 첫해에는 두 가지를 더 챙겨야 합니다. 같은 해에 다른 회사에서 받은 급여가 있으면 이전 회사의 근로소득 원천징수영수증을 새 회사에 내 합산해야 하고, 합산하지 못했다면
        5월 종합소득세 신고로 합칩니다. 또 보험료·의료비·교육비 세액공제와 신용카드 등 소득공제는 법에서 &lsquo;근로소득이 있는 거주자&rsquo;가 쓴 금액을 대상으로 하므로 근로를 제공한 기간에 쓴 금액만 인정되고,
        기부금 세액공제는 &lsquo;거주자&rsquo;가 낸 금액이 대상이라 입사 전 기부금도 포함됩니다{src('credit')}{src('card')}.
        결정세액이 어떻게 달라지는지는 <Link href="/tools/finance/year-end-tax">연말정산 계산기</Link>에 공제 항목을 넣어 미리 볼 수 있습니다.
        건강보험료는 이와 별도로, 그해 보수 총액이 확정되면 보수월액을 다시 계산해 정산합니다{src('nhisD34')}{src('nhisD39')}.
      </p>

      <h2 id="checklist" data-toc="첫 월급날 체크리스트">첫 월급날 체크리스트</h2>
      <p>명세서를 받으면 위에서 아래로 다음을 확인해 보세요. 숫자가 맞지 않으면 인사·급여 담당자에게 기준을 물어보는 것이 가장 빠릅니다.</p>
      <GuideChecklist>
        <li><strong>지급 합계</strong>가 연봉 ÷ 12와 같은지, 다르면 상여를 따로 주는 구조인지 확인합니다.</li>
        <li><strong>식대 등 비과세</strong>가 별도 지급 항목으로 있고 한도(식대 월 {manwon(MEAL)}) 안인지 봅니다.</li>
        <li><strong>국민연금</strong>이 기준소득월액 × {R.pension.employee}%인지 봅니다. 월급이 {manwon(PB.max)}을 넘으면 상한으로 계산됩니다.</li>
        <li><strong>건강보험</strong>이 과세 급여 × {R.health.employee}%, <strong>장기요양</strong>이 건강보험료 × {LTC_RATIO}%, <strong>고용보험</strong>이 과세 급여 × {R.unemp.employee}% 근처인지 봅니다.</li>
        <li><strong>소득세</strong>가 신고한 공제대상가족 수와 원천징수 비율로 간이세액표 칸에 맞는지, <strong>지방소득세</strong>가 소득세의 {LOCAL_PCT}인지 확인합니다.</li>
        <li>1일에 입사하지 않았다면 <strong>두 번째 달</strong>에 4대보험 네 항목이 모두 생겼는지 확인합니다.</li>
        <li>
          <strong>퇴직금</strong>은 명세서에서 빠지는 돈이 아니라 회사가 따로 부담하는 돈입니다. 4주 평균 주 {SEV_MIN_H}시간 이상 일하는 근로자가 {SEV_MIN_SPAN} 이상 계속 근무하면 생기고{src('sev4')},
          계속근로 1년마다 {SEV_DAYS}일분 이상의 평균임금이 기준입니다{src('sev8')}. 예상액은 <Link href="/tools/finance/severance">퇴직금 계산기</Link>로 볼 수 있습니다.
          {LEAVING && <> 퇴사할 때의 정산 전체는 <Link href={guideHref(LEAVING.slug)}>{LEAVING.title.split(' — ')[0]}</Link> 글에 정리했습니다.</>}
        </li>
      </GuideChecklist>

      <Faq items={FAQ} />
    </GuideLayout>
  )
}
