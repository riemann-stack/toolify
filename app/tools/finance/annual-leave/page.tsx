import Link from 'next/link'
import AnnualLeaveClient from './AnnualLeaveClient'
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
import {
  ANNUAL_LEAVE, LEAVE_MIN_WORKERS, LEAVE_MIN_WEEKLY_HOURS, DAILY_WORK_HOURS, WAGE_CLAIM_YEARS, LEAVE_DATES,
  LEAVE_PRECEDENTS, LEAVE_PROMOTION, LEAVE_REVIEWED, leaveByYearsTable, leaveCapYears, leaveSchedule, sumDays,
  annualLeaveDays, dailyWageFromHourly, dailyWageFromMonthly, round2, dayAfterMonths, fmtYmd, addDays,
} from '@/lib/krLabor'
import { MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, WORK_HOURS_WEEK } from '@/lib/krInsuranceRates'
import {
  runExample, prorataByHireMonth, basisTimeline, minWageDailyRows, minWageEntry, ptLeaveHours, ptEquivDailyHours, extendGain,
  exampleInput, mustYmd, won, fmtDays, dotDate, korDate,
} from './annualLeaveUtils'

/* ── 법정 수치 — 전부 lib 단일 소스에서 보간 (빌드 시점, 서버 컴포넌트) ── */
const AL = ANNUAL_LEAVE
const PR = LEAVE_PROMOTION
const SC = LEAVE_PRECEDENTS.oneYearContract
const FS = LEAVE_PRECEDENTS.fiscalSettlement
const OW = LEAVE_PRECEDENTS.ordinaryWage
const RB = LEAVE_PRECEDENTS.regularBonus
const WAGE_YEAR = 2026
const MW = MIN_HOURLY_WAGE[WAGE_YEAR]
const DAILY = dailyWageFromHourly(MW)
const CAP_YEARS = leaveCapYears()
const FIRST_TWO = AL.firstYearMonthlyMax + AL.base
const SMALL_MAX = LEAVE_MIN_WORKERS - 1
/** 빌드 상수 — 예시 계산이 비면 빌드에서 바로 드러나게 */
function need<T>(v: T | null | undefined, what: string): T {
  if (v == null) throw new Error(`annual-leave: ${what} 예시 계산 실패`)
  return v
}

export const metadata = buildMetadata({
  path: '/tools/finance/annual-leave',
  title: '연차 계산기 — 입사일·회계연도 기준 발생·잔여 연차와 연차수당·퇴사 정산',
  description:
    `입사일만 넣으면 1년 미만 월 1일(최대 ${AL.firstYearMonthlyMax}일)부터 ${AL.base}일, 근속 ${AL.addFromYears}년부터 가산, ${AL.cap}일 한도까지 발생·사용·잔여 연차를 계산합니다. 회계연도 첫해 비례 연차, 1년 + 1일 규칙, 퇴사 시 입사일 기준 재정산과 미사용 연차수당까지.`,
  keywords: [
    '연차계산기', '연차 계산', '연차 발생 기준', '연차수당 계산', '미사용 연차수당', '퇴사 연차 정산',
    '회계연도 연차', '입사일 기준 연차', '1년 미만 연차', '1년 계약직 연차', `연차 ${FIRST_TWO}일`, '비례연차', '연차 사용촉진',
  ],
})

/* ── 표 1 — 근속연수별 연차 (1년 미만 11일 포함 누적) ── */
const YEARS_ROWS = leaveByYearsTable(CAP_YEARS + 1)

/* ── 예시 1·2 — 1년 계약직(365일) vs 하루 더(366일) ── */
const EX_1Y = runExample({})
const EX_1Y_IN = { hire: '2025-09-01', last: '2026-08-31', next: '2026-09-01' }
const EX_1Y1D = runExample({ refDate: EX_1Y_IN.next })
const EX_1Y1D_PREV = sumDays(EX_1Y1D.lastExpired)
const EX_1Y1D_ALL = round2(EX_1Y1D.currentTotal + EX_1Y1D_PREV)
const EX_1Y_FIRST = EX_1Y.current[0]
const EX_1Y_LAST = EX_1Y.current[EX_1Y.current.length - 1]
/** 퇴사 정산 탭의 '하루 더 재직하면' 안내 — 예시 1 입력 그대로 */
const EX_1Y_GAIN = need(extendGain(exampleInput({})), '1년 계약직 하루 더')

/* ── 월말 입사 — 민법 §160 (해당일이 없으면 그 달 말일 만료) ── */
const JAN31_HIRE = '2025-01-31'
const JAN31 = leaveSchedule({ hire: mustYmd(JAN31_HIRE), basis: 'hire' }, mustYmd('2025-04-30'))
const JAN31_END = fmtYmd(addDays(mustYmd(JAN31[0].arise), -1))
const LEAP_HIRE = '2024-02-29'
const LEAP_ANNIV = fmtYmd(dayAfterMonths(mustYmd(LEAP_HIRE), 12))

/* ── 예시 3 — 회계연도(1월) 기준, 2025-07-01 입사 ── */
const EX_F_HIRE = '2025-07-01'
const EX_F_USED = 5
const EX_F_LAST = '2026-12-31'
const EX_F_NEXT = '2027-01-01'
const EX_F = runExample({ hireDate: EX_F_HIRE, refDate: EX_F_LAST, basis: 'fiscal', usedDays: EX_F_USED })
const EX_F_PR = need(EX_F.current.find(g => g.kind === 'prorata'), '회계연도 비례 연차')
const EX_F_CMP = need(EX_F.compare, '회계연도 비교')
const EX_F2 = runExample({ hireDate: EX_F_HIRE, refDate: EX_F_NEXT, basis: 'fiscal' })
const EX_F2_ADV = EX_F2.compare?.fiscalAdvantage ?? 0
const EX_F_ANNIV1 = fmtYmd(dayAfterMonths(mustYmd(EX_F_HIRE), 12))
const EX_F_ANNIV3 = fmtYmd(dayAfterMonths(mustYmd(EX_F_HIRE), 12 * AL.addFromYears))
const EX_F_LATER_REF = '2029-01-01'
const EX_F_LATER = runExample({ hireDate: EX_F_HIRE, refDate: EX_F_LATER_REF, basis: 'fiscal', retire: false })
const PRORATA_ROWS = prorataByHireMonth(2025, 1)
const TIMELINE = basisTimeline(EX_F_HIRE, 1, ['2025-12-31', '2026-01-01', '2026-06-30', '2026-07-01', '2026-12-31', '2027-01-01', '2027-07-01', '2027-12-31'])

/* ── 예시 4 — 장기 근속 재직 중 ── */
const EX_LONG_USED = 8
const EX_LONG_HIRE = '2015-03-02'
const EX_LONG_REF = '2026-09-26'
const EX_LONG = runExample({ hireDate: EX_LONG_HIRE, refDate: EX_LONG_REF, retire: false, usedDays: EX_LONG_USED })
const EX_LONG_G = need(EX_LONG.current[0], '장기 근속 연차')
/** 미사용 수당은 사용기한이 끝날 때 그때 통상임금으로 정산 → 사용기한이 끝나는 해의 최저시급으로도 계산 */
const EX_LONG_PAY_YEAR = Number(EX_LONG_G.expire.slice(0, 4))
const EX_LONG_MW = minWageEntry(EX_LONG_PAY_YEAR)
const EX_LONG_DAILY_THEN = dailyWageFromHourly(EX_LONG_MW.wage)
const EX_LONG_PAY_THEN = Math.floor(EX_LONG_DAILY_THEN * EX_LONG.remaining + 1e-6)

/* ── 표 4 — 최저시급 기준 1일 통상임금과 연차수당 ── */
const WAGE_ROWS = minWageDailyRows()
const MONTHLY_EX = 3_000_000
const DAILY_FROM_MONTHLY = dailyWageFromMonthly(MONTHLY_EX, MONTHLY_WORK_HOURS)

/* ── 단시간 근로자 비례(시행령 [별표 2]) 예 — 주 20시간 ── */
const PT_WEEK = 20
const PT_HOURS = ptLeaveHours(AL.base, PT_WEEK)
/** 주 5일이 아닌 예 — 주 3일 × 8시간 = 주 24시간 */
const PT2_DAYS = 3
const PT2_WEEK = PT2_DAYS * DAILY_WORK_HOURS
const PT2_HOURS = ptLeaveHours(AL.base, PT2_WEEK)
const PT2_EQ = ptEquivDailyHours(PT2_WEEK)
const PT2_PAY = Math.floor(PT2_HOURS * MW + 1e-6)
const PT2_DAILY_EQ = dailyWageFromHourly(MW, PT2_EQ)
const PT2_WRONG = dailyWageFromHourly(MW, DAILY_WORK_HOURS) * AL.base

const LAW = {
  lsa60: 'https://www.law.go.kr/법령/근로기준법/제60조',
  lsa61: 'https://www.law.go.kr/법령/근로기준법/제61조',
  lsa11: 'https://www.law.go.kr/법령/근로기준법/제11조',
  lsa18: 'https://www.law.go.kr/법령/근로기준법/제18조',
  lsa49: 'https://www.law.go.kr/법령/근로기준법/제49조',
  dec7: 'https://www.law.go.kr/법령/근로기준법시행령/제7조',
  civil160: 'https://www.law.go.kr/법령/민법/제160조',
  sc: `https://www.law.go.kr/판례/(${SC.caseNo})`,
  ow: `https://www.law.go.kr/판례/(${OW.caseNo})`,
  moel2021: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=13052',
}
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

const FAQ_LD = [
  {
    q: `입사 첫해에 연차가 ${FIRST_TWO}일이라는 말은 맞나요?`,
    a: `절반만 맞습니다. 입사 후 1년 동안은 1개월 개근할 때마다 1일씩 최대 ${AL.firstYearMonthlyMax}일이 생기고(근로기준법 §60②), 1년을 채운 다음 날 ${AL.base}일이 따로 생깁니다(§60①). 그래서 입사 후 2년 동안 받는 합계가 ${FIRST_TWO}일입니다. 다만 1년 미만 연차 ${AL.firstYearMonthlyMax}일은 <strong>입사 1년이 끝나는 날까지만</strong> 쓸 수 있어서(§60⑦), 1년이 지난 시점에 한꺼번에 ${FIRST_TWO}일을 쓸 수 있는 것은 아닙니다. 쓰지 못한 ${AL.firstYearMonthlyMax}일분은 회사가 사용촉진을 하지 않았다면 수당으로 받습니다.`,
  },
  {
    q: '1년 계약직으로 일하고 끝나면 연차수당은 며칠분인가요?',
    a: `${SC.court} ${SC.date} 선고 ${SC.caseNo} 판결에 따라 <strong>최대 ${AL.firstYearMonthlyMax}일분</strong>입니다. ${AL.base}일은 1년을 채운 다음 날 생기는데, 1년 계약이 끝나면 그날 근로관계가 없기 때문입니다. ${dotDate(EX_1Y_IN.hire)} 입사, ${dotDate(EX_1Y_IN.last)} 마지막 근무라면 ${fmtDays(EX_1Y.currentTotal)}일 × ${WAGE_YEAR}년 최저시급 기준 1일 ${won(DAILY)}원 = <strong>${won(EX_1Y.pay)}원</strong>입니다. 계약이 하루 더 이어져 ${dotDate(EX_1Y_IN.next)}까지 재직하면 ${fmtDays(EX_1Y1D.currentTotal)}일이 더 생겨 합계 ${fmtDays(EX_1Y1D_ALL)}일분이 됩니다.`,
  },
  {
    q: `연차 ${AL.cap}일은 몇 년을 일해야 받나요?`,
    a: `계속근로 ${CAP_YEARS}년을 채운 다음 날입니다. ${AL.addFromYears}년 이상 계속 근로하면 최초 1년을 넘는 근속 ${AL.addEveryYears}년마다 1일이 더해져 ${AL.base} + ⌊(근속연수 − 1) ÷ ${AL.addEveryYears}⌋일이 되고, 가산휴가를 합쳐 ${AL.cap}일이 한도입니다(§60④). 근속 ${CAP_YEARS}년을 채우면 ${AL.base} + ${(CAP_YEARS - 1) / AL.addEveryYears} = ${annualLeaveDays(CAP_YEARS)}일이 되고 그 뒤로는 더 늘지 않습니다. 흔히 말하는 ‘n년차’(n번째 해)와는 한 해 차이가 나니, 근속 ${CAP_YEARS - 1}년(${CAP_YEARS}년차)에는 아직 ${annualLeaveDays(CAP_YEARS - 1)}일입니다.`,
  },
  {
    q: '회사가 1월 1일 기준으로 연차를 주는데 퇴사하면 손해인가요?',
    a: `손해가 나지 않게 정산해야 합니다. 고용노동부 행정해석(${FS.ref}, ${FS.date})은 회계연도 기준으로 운영하더라도 퇴직 시점의 총 휴가일수가 입사일 기준으로 계산한 일수보다 적으면 <strong>모자란 일수를 연차수당으로 정산</strong>하도록 합니다. ${dotDate(EX_F_HIRE)} 입사자가 ${dotDate(EX_F_LAST)}에 퇴사하면 회계연도 기준 누적은 ${fmtDays(EX_F_CMP.fiscalTotal)}일, 입사일 기준은 ${fmtDays(EX_F_CMP.hireTotal)}일이라 차이 ${fmtDays(EX_F_CMP.extraDays)}일을 더 받습니다. 반대로 회계연도 기준이 더 많으면 그대로 유리한 쪽을 적용합니다.`,
  },
  {
    q: '연차를 다 못 쓰면 수당을 무조건 받을 수 있나요?',
    a: `원칙적으로는 받습니다. 다만 회사가 근로기준법 §61의 사용촉진 절차를 <strong>서면으로 모두</strong> 밟았다면 예외입니다 — 사용기간이 끝나기 ${PR.regular.noticeMonthsBefore}개월 전을 기준으로 ${PR.regular.noticeWindowDays}일 안에 남은 일수를 알리고 사용 시기를 정하라고 촉구했고, 근로자가 ${PR.regular.replyDays}일 안에 시기를 알리지 않아 끝나기 ${PR.regular.designateMonthsBefore}개월 전까지 회사가 사용일을 지정해 통보했는데도 쓰지 않았다면 수당 지급 의무가 없습니다. 구두 안내나 사내 공지만으로는 이 요건을 채우지 못합니다.`,
  },
  {
    q: `직원이 ${SMALL_MAX}명인 회사도 연차를 줘야 하나요?`,
    a: `근로기준법상 의무는 없습니다. 법은 상시 ${LEAVE_MIN_WORKERS}명 이상 사업장에 적용되고(§11①), 상시 ${SMALL_MAX}명 이하 사업장에 적용할 조항을 정한 시행령 §7 [별표 1]에 연차(§60)가 들어 있지 않기 때문입니다. 다만 근로계약서나 취업규칙에 연차를 주기로 정했다면 그 약정대로 받을 수 있습니다. 상시 근로자 수는 일정 기간 사용한 근로자 연인원을 가동 일수로 나눈 평균으로 따지는 등 계산 방법이 시행령 §7의2에 따로 있으므로, 인원이 들쭉날쭉하다면 고용노동부 고객상담센터(1350)로 확인하세요.`,
  },
  {
    q: '육아휴직이나 출산휴가를 쓴 해에도 연차가 생기나요?',
    a: `생깁니다. 업무상 부상·질병으로 쉰 기간, 출산전후휴가·유산사산휴가 기간, 육아휴직 기간은 출근율을 계산할 때 <strong>출근한 것으로 봅니다</strong>(§60⑥). 육아휴직은 ${korDate(LEAVE_DATES.parentalLeaveAttendanceFrom)} 이후 시작한 휴직부터 이 규정이 적용됩니다. 그래서 1년 내내 육아휴직을 했더라도 복직 후 연차 ${AL.base}일(근속에 따라 가산)이 정상적으로 생깁니다. 육아기·임신기 근로시간 단축으로 줄어든 시간의 취급도 최근 개정되었다는 보도가 있으니, 해당 기간이 있다면 국가법령정보센터에서 현행 §60⑥ 조문과 부칙의 적용 시점을 확인하세요.`,
  },
  {
    q: '연차수당은 언제까지 청구할 수 있나요?',
    a: `연차수당도 임금이라 <strong>${WAGE_CLAIM_YEARS}년</strong> 안에 청구하지 않으면 시효로 소멸합니다(§49). 재직 중에는 연차 사용기간이 끝난 다음 날부터, 퇴직할 때 남은 연차는 퇴직으로 근로관계가 끝난 때부터 따지는 것이 일반적입니다. 회사가 지급하지 않으면 사업장 관할 지방고용노동관서에 임금체불 진정을 낼 수 있습니다.`,
  },
  {
    q: '반차나 시간 단위로 연차를 쓸 수 있나요?',
    a: `${LEAVE_REVIEWED} 현재 근로기준법에는 반차·시간 단위 연차 규정이 없어, 회사 규정·노사 합의가 있을 때만 가능합니다. 개정 근로기준법으로 ${korDate(LEAVE_DATES.hourlyLeaveFrom)}부터 시간 단위로 연차를 나눠 쓰는 제도가 도입되고(§60⑤ 신설), 지금의 §60⑤~⑦은 ⑥~⑧로 번호가 바뀌는 것으로 알려져 있습니다. 쓸 수 있는 단위와 범위는 시행령에 맡겨질 예정이므로 시행 전에 국가법령정보센터에서 조문을 확인하세요. 이 계산기에서는 반차를 0.5일로 넣으면 됩니다.`,
  },
]

export default function AnnualLeavePage() {
  return (
    <ToolPage width={760} slug="/tools/finance/annual-leave">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />연차 계산기
      </h1>
      <p className="tp-lead">
        입사일만 넣으면 지금 쓸 수 있는 <strong>연차 일수와 남은 연차</strong>, 쓰지 못했을 때의 <strong>연차수당</strong>을 계산합니다. 회계연도 기준 회사의 첫해 비례 연차와 퇴사 시 입사일 기준 재정산까지 함께 따집니다.
      </p>

      <UpdatedMeta
        date={LEAVE_REVIEWED}
        basis={`근로기준법 §60①②④⑦·§61·§11(상시 ${LEAVE_MIN_WORKERS}명 이상) · ${SC.court} ${SC.caseNo}(1년 계약직 최대 ${AL.firstYearMonthlyMax}일)·고용노동부 ${dotDate(LEAVE_DATES.moelNextDayRuleFrom)} 행정해석(1년·1개월을 마친 다음 날 발생) · 회계연도 퇴직 정산 ${FS.ref} · 연차수당 기본값 ${WAGE_YEAR}년 최저시급 ${MW.toLocaleString('ko-KR')}원 × ${DAILY_WORK_HOURS}시간`}
        sources={[
          { label: '근로기준법 §60', href: LAW.lsa60 },
          { label: `대법원 ${SC.caseNo}`, href: LAW.sc },
          { label: '고용노동부 행정해석 변경', href: LAW.moel2021 },
        ]}
      />

      <AnnualLeaveClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 일수 규칙 ── */}
        <section>
          <h2 className="g-h2">연차는 며칠 생기나 — 1년 미만 {AL.firstYearMonthlyMax}일, 1년 {AL.base}일, 근속 {AL.addFromYears}년부터 가산</h2>
          <p className="g-p">
            연차 유급휴가는 <a href={LAW.lsa60} {...ext}>근로기준법 §60</a>이 정한 최소 기준입니다. 입사하고 1년이 되기 전에는 <strong>1개월을 개근할 때마다 1일</strong>이 생겨 최대 {AL.firstYearMonthlyMax}일이 되고(§60②),
            1년 동안 소정근로일의 {AL.attendanceMinPct}% 이상 출근했다면 1년을 채운 다음 날 <strong>{AL.base}일</strong>이 생깁니다(§60①). {AL.addFromYears}년 이상 계속 근로하면 최초 1년을 넘는 근속 {AL.addEveryYears}년마다 1일씩 더해지고,
            가산휴가를 합친 총 일수는 <strong>{AL.cap}일</strong>을 넘지 않습니다(§60④).
          </p>
          <p className="g-p">
            식으로 쓰면 계속근로 n년을 채운 다음 날의 연차는 <strong>{AL.base} + ⌊(n − 1) ÷ {AL.addEveryYears}⌋일(최대 {AL.cap}일)</strong>입니다. 근속 1·2년에는 {annualLeaveDays(1)}일, 3·4년에는 {annualLeaveDays(3)}일, 5·6년에는 {annualLeaveDays(5)}일이 되고,
            {' '}{CAP_YEARS}년을 채우면 {annualLeaveDays(CAP_YEARS)}일로 한도에 닿습니다. 1년 미만 연차 {AL.firstYearMonthlyMax}일은 {korDate(LEAVE_DATES.separateFirstYearHiredFrom)} 이후 입사자부터 1년 뒤 {AL.base}일에서 빼지 않고 따로 주므로,
            입사 후 2년 동안 받는 연차는 합계 {FIRST_TWO}일입니다. 12번째 달을 개근해도 1일이 더 생기지 않는 이유는, 그 달을 마친 다음 날에는 이미 &lsquo;1년 이상 근로자&rsquo;가 되어 {AL.base}일 규칙으로 넘어가기 때문입니다.
            여기서 n은 <strong>채운 햇수(근속 n년)</strong>입니다. 일상에서 쓰는 &lsquo;n년차&rsquo;는 n번째 해, 곧 근속 n − 1년이라 한 해 어긋나므로, 입사 {AL.addFromYears}년차(근속 {AL.addFromYears - 1}년)에는 아직 {annualLeaveDays(AL.addFromYears - 1)}일이고 {annualLeaveDays(AL.addFromYears)}일은 근속 {AL.addFromYears}년을 채운 다음 날 생깁니다.
          </p>
          <DataFigure n={1} title="근속연수별 연차 발생일수 (매년 출근율 80% 이상)" unit="단위: 일" source={<>자료: 근로기준법 §60①②④ — Youtil 계산. 누적은 1년 미만 월 단위 연차 {AL.firstYearMonthlyMax}일을 포함한 입사 후 합계입니다.</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">계속근로</th>
                  <th scope="col" className="r">발생 연차</th>
                  <th scope="col" className="r">가산</th>
                  <th scope="col" className="r">입사 후 누적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1년 미만</th>
                  <td className="r">매월 1일<small>최대 {AL.firstYearMonthlyMax}일</small></td>
                  <td className="r">—</td>
                  <td className="r">{AL.firstYearMonthlyMax}</td>
                </tr>
                {YEARS_ROWS.map(row => (
                  <tr key={row.years}>
                    <th scope="row">{row.years}년{row.years === CAP_YEARS && <small>한도 도달</small>}</th>
                    <td className="r em">{row.days}</td>
                    <td className="r">{row.add > 0 ? `+${row.add}` : '—'}</td>
                    <td className="r">{row.cumulative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            여기서 &lsquo;계속근로&rsquo;는 같은 사업장에서 근로관계가 끊기지 않은 기간입니다. 출근율이 {AL.attendanceMinPct}%에 못 미친 해가 있어도 근속연수 자체는 이어지므로, 그다음 해부터는 다시 근속에 맞는 일수가 생깁니다.
            계산기의 &lsquo;앞으로 생길 연차&rsquo;는 이 표를 입사일에 맞춰 날짜로 펼친 것입니다.
          </p>
        </section>

        {/* ── 2. 발생 시점 ── */}
        <section>
          <h2 className="g-h2">연차가 생기는 날 — &lsquo;다음 날&rsquo; 규칙과 1년 계약직 {AL.firstYearMonthlyMax}일</h2>
          <p className="g-p">
            연차는 1년(월 단위 연차는 1개월)의 근로를 <strong>마친 다음 날</strong> 생깁니다. {SC.court}은 {SC.date} 선고 <a href={LAW.sc} {...ext}>{SC.caseNo}</a> 판결에서 1년 기간제 근로계약을 마치고 퇴직한 근로자에게는
            {' '}{AL.base}일이 생기지 않아 연차가 <strong>최대 {AL.firstYearMonthlyMax}일</strong>이라고 판단했습니다. 고용노동부는 이 판결에 맞춰 <a href={LAW.moel2021} {...ext}>{korDate(LEAVE_DATES.moelNextDayRuleFrom)}부터 행정해석을 바꿔</a>,
            정규직도 1년(365일)만 근로하고 퇴직하면 {AL.base}일분 수당을 청구할 수 없고, 366일째에 근로관계가 있어야 {AL.base}일이 생긴다고 봅니다. 월 단위 연차도 같은 원리라 1개월을 마친 다음 날 재직 중이어야 1일이 생깁니다.
          </p>
          <p className="g-p">
            <strong>예시 1.</strong> {korDate(EX_1Y_IN.hire)} 입사, {korDate(EX_1Y_IN.last)}이 마지막 근무일(365일째)인 1년 계약직이라면 월 단위 연차가 {dotDate(EX_1Y_FIRST.arise)}부터 {dotDate(EX_1Y_LAST.arise)}까지 매달 1일씩
            {' '}<strong>{fmtDays(EX_1Y.currentTotal)}일</strong> 생기고 {AL.base}일은 생기지 않습니다. 하나도 쓰지 못했다면 {WAGE_YEAR}년 최저시급 {MW.toLocaleString('ko-KR')}원 × {DAILY_WORK_HOURS}시간 = 1일 {won(DAILY)}원 기준으로
            {' '}{fmtDays(EX_1Y.currentTotal)}일 × {won(DAILY)}원 = <strong>{won(EX_1Y.pay)}원</strong>이 연차수당입니다.
          </p>
          <p className="g-p">
            <strong>예시 2.</strong> 같은 사람이 하루 더 일해 {korDate(EX_1Y_IN.next)}(366일째)까지 재직하면 그날 {fmtDays(EX_1Y1D.currentTotal)}일이 생깁니다. 월 단위 연차 {fmtDays(EX_1Y1D_PREV)}일은 전날 사용기한이 끝났지만
            쓰지 못한 만큼 수당으로 받으므로, 전부 미사용이면 {fmtDays(EX_1Y1D_PREV)} + {fmtDays(EX_1Y1D.currentTotal)} = <strong>{fmtDays(EX_1Y1D_ALL)}일분({won(Math.floor(DAILY * EX_1Y1D_ALL))}원)</strong>입니다.
            계산기의 퇴사 정산 탭은 마지막 근무일 뒤 30일 안에 새 연차(월 단위 연차 포함)가 생기면, 그날까지 재직할 때 늘어나는 연차수당을 따로 알려 줍니다.
            예시 1이라면 {korDate(EX_1Y_GAIN.date)}까지 재직할 때 {fmtDays(EX_1Y_GAIN.gainDays)}일분({won(Math.floor(DAILY * EX_1Y_GAIN.gainDays + 1e-6))}원)이 늘어난다고 표시됩니다.
            회계연도 기준이면 새 연차가 생기는 대신 아래 예시 3의 퇴직 정산 차이가 줄어드므로 그만큼 뺀 순증가분을 보여 줍니다.
          </p>
          <p className="g-p">
            &lsquo;1개월&rsquo;은 달력 기준입니다. 민법 <a href={LAW.civil160} {...ext}>§160</a>에 따라 입사일에 해당하는 날의 전날 기간이 끝나고, 그 달에 해당하는 날이 없으면 그 달 말일에 끝납니다.
            그래서 {korDate(JAN31_HIRE)} 입사자의 첫 1개월은 {korDate(JAN31_END)}에 끝나 첫 월 단위 연차가 <strong>{korDate(JAN31[0].arise)}</strong>에, 두 번째는 {korDate(JAN31[1].arise)}에 생깁니다. 같은 이유로 {korDate(LEAP_HIRE)} 입사자의 1주년 연차는 {korDate(LEAP_ANNIV)}에 생깁니다.
          </p>
          <Callout tone="tip" title="퇴사일을 정할 때 하루 차이를 확인하세요">
            입사일과 같은 날짜(1년 뒤)까지 재직하느냐에 따라 연차 {AL.base}일분이 갈립니다. 계약 만료·정년퇴직처럼 날짜가 정해진 경우 &lsquo;마지막 근무일&rsquo;이 입사 기념일 전날인지 당일인지를 먼저 확인하고,
            계산기 퇴사 정산 탭에 그 날짜를 넣어 보세요. 퇴직금은 1년 이상 근무해야 생기므로 <Link href="/tools/finance/severance">퇴직금 계산기</Link>도 같은 날짜로 함께 확인하는 것이 좋습니다.
          </Callout>
        </section>

        {/* ── 3. 회계연도 기준 ── */}
        <section>
          <h2 className="g-h2">회계연도 기준 — 입사 첫해 비례 연차와 퇴사 시 재정산</h2>
          <p className="g-p">
            연차는 원래 직원마다 입사일을 기준으로 계산하지만, 인원이 많은 회사는 관리 편의를 위해 취업규칙·단체협약으로 모든 직원에게 같은 날(보통 1월 1일) 연차를 주는 <strong>회계연도 기준</strong>을 씁니다.
            이때 입사 첫해는 1년을 다 채우지 않았으므로 다음 회계연도 시작일에 <strong>{AL.base} × 첫해 재직일수 ÷ {AL.prorataYearDays}</strong>만큼 비례 연차를 주고, 1년 미만 월 단위 연차(최대 {AL.firstYearMonthlyMax}일)는 입사일 기준대로 따로 생깁니다.
            그다음 회계연도부터는 {AL.base}일 이상을 주는데, 이 계산기는 회계연도 부여일까지 채운 계속근로연수로 가산휴가({annualLeaveDays(AL.addFromYears)}일…)를 따집니다.
          </p>
          <p className="g-p">
            <strong>소수점은 법에 정한 처리 방법이 없습니다.</strong> 회사가 1일 단위로 올려 주거나, 소수점만큼을 시간(× 1일 소정근로시간)으로 주거나, 수당으로 정산하는 방식이 쓰입니다. 이 계산기는 기본으로 소수 둘째 자리까지 계산하고,
            회사 규정이 올림이라면 &lsquo;1일 올림&rsquo;을 고르면 됩니다. 아래 표는 1월 1일이 회계연도 시작일인 회사에 {PRORATA_ROWS[0].hire.slice(0, 4)}년 각 달 1일에 입사했을 때 첫해 비례 연차입니다.
          </p>
          <DataFigure n={2} title="회계연도(1월 1일 시작) 입사월별 첫해 비례 연차" unit="단위: 일" source={<>자료: {AL.base} × 재직일수 ÷ {AL.prorataYearDays}, {AL.base}일 한도 — Youtil 계산. 1년 미만 월 단위 연차는 별도로 생깁니다.</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">입사일</th>
                  <th scope="col" className="r">첫해 재직일수</th>
                  <th scope="col" className="r">비례 연차</th>
                  <th scope="col" className="r">1일 올림</th>
                </tr>
              </thead>
              <tbody>
                {PRORATA_ROWS.map(row => (
                  <tr key={row.hire}>
                    <th scope="row">{dotDate(row.hire)}<small>{dotDate(row.firstFiscal)} 부여</small></th>
                    <td className="r">{row.serviceDays}일</td>
                    <td className="r em">{fmtDays(row.r2)}</td>
                    <td className="r">{row.ceil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            회계연도 기준은 편리하지만 퇴사 시점에 따라 입사일 기준보다 적게 받는 구간이 생깁니다. 고용노동부 행정해석({FS.ref}, {FS.date})은 이 경우 퇴직 시점의 총 휴가일수가 입사일 기준보다 적으면
            <strong> 모자란 일수를 연차수당으로 정산</strong>해야 하고, 회계연도 기준이 더 유리하면 그대로 회계연도 기준을 적용한다고 봅니다. 결국 퇴사자는 두 방식 중 <strong>많은 쪽</strong>을 받습니다.
          </p>
          <p className="g-p">
            <strong>예시 3.</strong> {korDate(EX_F_HIRE)} 입사, 1월 1일 회계연도 회사에서 {korDate(EX_F_LAST)}까지 근무하고 퇴사하는 경우입니다. {korDate(EX_F_PR.arise)}에 첫해 {EX_F_PR.seq}일분 비례 연차
            {' '}{AL.base} × {EX_F_PR.seq} ÷ {AL.prorataYearDays} = <strong>{fmtDays(EX_F_PR.days)}일</strong>을 받았고, 월 단위 연차 {AL.firstYearMonthlyMax}일을 합친 회계연도 기준 누적은 {fmtDays(EX_F_CMP.fiscalTotal)}일입니다.
            입사일 기준이었다면 월 단위 {AL.firstYearMonthlyMax}일에 {korDate(EX_F_ANNIV1)} {AL.base}일이 더해져 {fmtDays(EX_F_CMP.hireTotal)}일이므로 차이 <strong>{fmtDays(EX_F_CMP.extraDays)}일</strong>을 수당으로 더 받아야 합니다.
            비례 연차 중 {EX_F_USED}일을 썼다면 남은 {fmtDays(EX_F.remaining)}일과 차이 {fmtDays(EX_F_CMP.extraDays)}일을 합친 {fmtDays(EX_F.payDays)}일 × {won(DAILY)}원 = <strong>{won(EX_F.pay)}원</strong>이 퇴사 시 연차수당입니다.
            하루 더 재직해 {korDate(EX_F_NEXT)}을 맞으면 회계연도 기준으로 {AL.base}일이 새로 생겨 누적이 {fmtDays(EX_F2.compare?.fiscalTotal ?? 0)}일로 입사일 기준보다 {fmtDays(EX_F2_ADV)}일 많아지므로 추가 정산은 없습니다.
          </p>
          <DataFigure n={3} title={`${dotDate(EX_F_HIRE)} 입사 — 마지막 근무일별 누적 발생 연차 비교`} unit="단위: 일" source={<>자료: 입사일 기준·1월 1일 회계연도 기준을 같은 규칙(근로기준법 §60, {FS.ref})으로 계산 — Youtil 계산</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">마지막 근무일</th>
                  <th scope="col" className="r">입사일 기준</th>
                  <th scope="col" className="r">회계연도 기준</th>
                  <th scope="col" className="r">추가 정산</th>
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map(row => (
                  <tr key={row.ref}>
                    <th scope="row">{dotDate(row.ref)}</th>
                    <td className="r">{fmtDays(row.hireTotal)}</td>
                    <td className="r">{fmtDays(row.fiscalTotal)}</td>
                    <td className={row.extra > 0 ? 'r em' : 'r'}>{row.extra > 0 ? `+${fmtDays(row.extra)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            표를 보면 입사 기념일(7월 1일)부터 다음 회계연도 시작 전날(12월 31일)까지 퇴사하면 회계연도 기준이 {fmtDays(EX_F_CMP.extraDays)}일 적고, 1월 1일부터 6월 30일 사이에 퇴사하면 오히려 회계연도 기준이 많습니다.
            계산기는 가산휴가도 회계연도 부여일까지 채운 근속연수로 따지므로 이 예에서는 {korDate(EX_F_LATER_REF)}에 처음 {fmtDays(EX_F_LATER.currentTotal)}일이 되는데, 입사일 기준이면 {korDate(EX_F_ANNIV3)}에 {annualLeaveDays(AL.addFromYears)}일이 됩니다.
            회사 규정이 이보다 유리하게 정했다면 그 규정이 우선합니다.
          </p>
        </section>

        {/* ── 4. 연차수당 ── */}
        <section>
          <h2 className="g-h2">연차수당 계산 — 1일 통상임금 × 미사용 일수</h2>
          <p className="g-p">
            쓰지 못한 연차는 사용기간이 끝나면 휴가로서는 사라지지만(§60⑦), 그 대가인 <strong>미사용 연차수당</strong>은 남습니다. 금액은 취업규칙 등에서 정한 통상임금 또는 평균임금으로 계산하며(§60⑤),
            대부분의 회사는 <strong>1일 통상임금 × 미사용 일수</strong>를 씁니다. 1일 통상임금은 시간급 통상임금에 1일 소정근로시간을 곱한 값이고, 월급제라면 월 통상임금(기본급에 소정근로의 대가로 정기적·일률적으로 주는 수당과
            정기상여금의 월 환산액을 더한 금액)을 월 소정근로시간 {MONTHLY_WORK_HOURS}시간(주 {WORK_HOURS_WEEK}시간·주휴 포함)으로 나눈 뒤 {DAILY_WORK_HOURS}시간을 곱합니다. 월 통상임금 {won(MONTHLY_EX)}원이면 {won(MONTHLY_EX)} ÷ {MONTHLY_WORK_HOURS} × {DAILY_WORK_HOURS} = <strong>{won(DAILY_FROM_MONTHLY)}원</strong>(원 미만 버림)입니다.
          </p>
          <p className="g-p">
            통상임금에 무엇이 들어가는지가 금액을 좌우합니다. 두 달·분기·반기마다 나오는 정기상여금도 정기적·일률적으로 지급된다면 통상임금입니다({RB.court} {RB.date} 선고 {RB.caseNo} {RB.bench}).
            또 {OW.court}은 {OW.date} 선고 <a href={LAW.ow} {...ext}>{OW.caseNo}</a> {OW.bench} 판결에서 통상임금의 요건이던 &lsquo;고정성&rsquo;을 빼고, 통상임금을 <strong>소정근로의 대가로 정기적·일률적으로 지급하기로 정한 임금</strong>으로 다시 정의했습니다.
            그래서 &lsquo;지급일에 재직 중인 사람에게만 준다&rsquo;거나 &lsquo;일정 일수 이상 근무해야 준다&rsquo;는 조건이 붙은 정기상여금도 통상임금에 들어갑니다. 이 새 법리는 판결 선고일 이후의 통상임금 산정부터 적용됩니다(해당 사건·병행 사건 제외).
            반대로 연장·야간·휴일근로수당처럼 소정근로를 넘는 일의 대가, 근무 실적에 따라 지급 여부나 금액이 달라지는 성과급은 통상임금이 아닙니다. 정기상여금을 받는다면 연간 금액 ÷ 12를 월 통상임금에 더해 계산기에 넣으세요.
          </p>
          <DataFigure n={4} title="최저시급 기준 1일 통상임금과 연차수당" unit="단위: 원" source={<>자료: 고용노동부 최저임금 고시(시간급) × 1일 {DAILY_WORK_HOURS}시간 — Youtil 계산. 실제 통상임금이 더 높으면 그 금액으로 계산하세요.</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">적용 연도</th>
                  <th scope="col" className="r">1일 통상임금</th>
                  <th scope="col" className="r">{AL.firstYearMonthlyMax}일분</th>
                  <th scope="col" className="r">{AL.base}일분</th>
                </tr>
              </thead>
              <tbody>
                {WAGE_ROWS.map(row => (
                  <tr key={row.year}>
                    <th scope="row">{row.year}년<small>시급 {won(row.hourly)}</small></th>
                    <td className="r em">{won(row.daily)}</td>
                    <td className="r">{won(row.daily * AL.firstYearMonthlyMax)}</td>
                    <td className="r">{won(row.daily * AL.base)}<small>{FIRST_TWO}일 {won(row.daily * FIRST_TWO)}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            <strong>예시 4.</strong> {korDate(EX_LONG_HIRE)} 입사해 {korDate(EX_LONG_REF)} 현재 재직 중인 직원은 계속근로 {EX_LONG.completedYears}년을 채운 {korDate(EX_LONG_G.arise)}에
            {' '}{AL.base} + ⌊({EX_LONG.completedYears} − 1) ÷ {AL.addEveryYears}⌋ = <strong>{fmtDays(EX_LONG.currentTotal)}일</strong>을 받았습니다. 그중 {EX_LONG_USED}일을 썼다면 {fmtDays(EX_LONG.remaining)}일이 남고,
            사용기한인 {korDate(EX_LONG_G.expire)}까지 쓰지 못하면 미사용 연차수당을 받는데, 이 수당은 사용기한이 끝난 뒤에 지급 사유가 생기므로 <strong>그때의 통상임금</strong>으로 계산합니다.
            {EX_LONG_MW.exact
              ? <> 최저임금을 받는 경우라도 {EX_LONG_PAY_YEAR}년 최저시급 {EX_LONG_MW.wage.toLocaleString('ko-KR')}원 × {DAILY_WORK_HOURS}시간 = 1일 {won(EX_LONG_DAILY_THEN)}원이 적용되어 {fmtDays(EX_LONG.remaining)}일 × {won(EX_LONG_DAILY_THEN)}원 = <strong>{won(EX_LONG_PAY_THEN)}원</strong> 이상입니다.
                  지금({WAGE_YEAR}년) 시급으로 어림하면 {fmtDays(EX_LONG.remaining)}일 × {won(DAILY)}원 = {won(EX_LONG.pay)}원이고, 계산기의 재직 중 탭도 시급을 비워 두면 사용기한이 끝나는 해의 최저시급을 씁니다.</>
              : <> 지금({WAGE_YEAR}년) 최저시급으로 어림하면 {fmtDays(EX_LONG.remaining)}일 × {won(DAILY)}원 = {won(EX_LONG.pay)}원이고, 그사이 임금이 오르면 금액도 늘어납니다.</>}
          </p>
          <p className="g-p">
            다만 회사가 <a href={LAW.lsa61} {...ext}>§61의 사용촉진</a>을 적법하게 했다면 수당 지급 의무가 사라집니다. 1년 이상 근로자는 사용기간이 끝나기 {PR.regular.noticeMonthsBefore}개월 전을 기준으로 {PR.regular.noticeWindowDays}일 안에
            남은 일수를 알리고 사용 시기를 정해 달라고 <strong>서면</strong>으로 촉구해야 하고, 근로자가 {PR.regular.replyDays}일 안에 답하지 않으면 끝나기 {PR.regular.designateMonthsBefore}개월 전까지 회사가 사용일을 정해 서면으로 통보해야 합니다.
            1년 미만 근로자의 월 단위 연차는 {korDate(LEAVE_DATES.firstYearExpiryRuleFrom)} 개정으로 촉진 대상이 되었고, 최초 1년이 끝나기 {PR.firstYear.noticeMonthsBefore}개월 전 기준 {PR.firstYear.noticeWindowDays}일 안(촉구 뒤 생긴 휴가는 {PR.firstYear.laterNoticeMonthsBefore}개월 전 기준 {PR.firstYear.laterNoticeWindowDays}일 안)에 촉구하고,
            답이 없으면 {PR.firstYear.designateMonthsBefore}개월 전까지(촉구 뒤 생긴 휴가는 {PR.firstYear.laterDesignateDaysBefore}일 전까지) 사용일을 지정해야 합니다. 절차 중 하나라도 빠지면 수당을 청구할 수 있습니다.
          </p>
          <p className="g-p">
            연차수당은 임금이라 <a href={LAW.lsa49} {...ext}>§49</a>에 따라 {WAGE_CLAIM_YEARS}년이 지나면 시효로 소멸합니다. 연차수당 일부는 퇴직금의 평균임금 계산에 3/12만큼 들어갈 수 있는데, 어떤 연차수당이 들어가는지는 그 수당의 지급 사유가 언제 생겼는지에 따라
            달라지므로 회사 정산 내역으로 확인하세요. 퇴직금 영향은 <Link href="/tools/finance/severance">퇴직금 계산기</Link>에서 연차수당 칸에 넣어 확인하세요.
          </p>
        </section>

        {/* ── 5. 예외 ── */}
        <section>
          <h2 className="g-h2">연차가 달라지는 경우 — {LEAVE_MIN_WORKERS}명 미만·출근율·단시간·출근으로 보는 기간</h2>
          <ul className="g-list">
            <li>
              <strong>상시 {SMALL_MAX}명 이하 사업장</strong> — 근로기준법은 상시 {LEAVE_MIN_WORKERS}명 이상 사업장에 적용되고(<a href={LAW.lsa11} {...ext}>§11①</a>), {SMALL_MAX}명 이하 사업장에 적용할 조항을 정한
              <a href={LAW.dec7} {...ext}> 시행령 §7 [별표 1]</a>에는 연차(§60)가 없습니다. 법정 의무는 없지만 근로계약·취업규칙으로 주기로 했다면 그 약정이 적용됩니다.
            </li>
            <li>
              <strong>출근율 {AL.attendanceMinPct}% 미만인 해</strong> — 1년 이상 근로자라도 그 1년의 출근율이 {AL.attendanceMinPct}%에 못 미치면 {AL.base}일 대신 <strong>개근한 달마다 1일</strong>입니다(§60②). 출근율은 소정근로일수 중 출근한 날의 비율이고, 가산휴가도 붙지 않습니다.
              계산기의 &lsquo;근로 조건&rsquo;에서 체크를 끄고 개근한 달 수를 넣으면 반영됩니다.
            </li>
            <li>
              <strong>출근한 것으로 보는 기간</strong> — 업무상 부상·질병으로 휴업한 기간, 임신 중 여성이 출산전후휴가·유산사산휴가로 휴업한 기간, 육아휴직 기간은 출근율 계산에서 출근으로 봅니다(§60⑥).
              육아휴직은 {korDate(LEAVE_DATES.parentalLeaveAttendanceFrom)} 이후 시작분부터 적용됩니다. 육아기·임신기 근로시간 단축으로 줄어든 시간도 출근으로 보도록 개정되었다는 보도가 있으니, 해당 기간이 있다면 개정 조문과 부칙의 적용 시점을 국가법령정보센터에서 확인하세요.
            </li>
            <li>
              <strong>단시간 근로자</strong> — 4주 평균 1주 소정근로시간이 {LEAVE_MIN_WEEKLY_HOURS}시간 미만이면 연차가 없습니다(<a href={LAW.lsa18} {...ext}>§18③</a>). {LEAVE_MIN_WEEKLY_HOURS}시간 이상이면 시행령 [별표 2]에 따라 시간 단위로 비례해,
              통상 근로자 연차일수 × (단시간 근로자 소정근로시간 ÷ 통상 근로자 소정근로시간) × {DAILY_WORK_HOURS}시간으로 계산하고, 1시간 미만은 1시간으로 봅니다. 주 {PT_WEEK}시간 근무자가 {AL.base}일 대상이면 {AL.base} × {PT_WEEK}/{WORK_HOURS_WEEK} × {DAILY_WORK_HOURS} = <strong>{fmtDays(PT_HOURS)}시간</strong>입니다.
              이 계산기는 일 단위로 계산하므로, 단시간 근로자는 <strong>시급 방식</strong>을 고르고 1일 소정근로시간 칸에 <strong>주 소정근로시간 × {DAILY_WORK_HOURS} ÷ {WORK_HOURS_WEEK}</strong>을 넣으면 발생 일수 × 입력 시간이 [별표 2]의 시간 수와 같아집니다.
              주 {PT2_DAYS}일 × {DAILY_WORK_HOURS}시간(주 {PT2_WEEK}시간)이면 {fmtDays(PT2_EQ)}시간을 넣습니다 — {WAGE_YEAR}년 최저시급 기준 {AL.base}일 × {won(PT2_DAILY_EQ)}원 = {won(PT2_DAILY_EQ * AL.base)}원으로, [별표 2]의 {fmtDays(PT2_HOURS)}시간 × {MW.toLocaleString('ko-KR')}원 = <strong>{won(PT2_PAY)}원</strong>과 같습니다.
              실제 하루 근무시간인 {DAILY_WORK_HOURS}시간을 넣으면 {won(PT2_WRONG)}원으로 부풀려집니다. 월 통상임금 방식은 월급 ÷ {MONTHLY_WORK_HOURS} × {DAILY_WORK_HOURS}을 통상 근로자 1일분으로 쓰므로 주휴수당이 포함된 단시간 근로자 월급이면 거의 같지만, {MONTHLY_WORK_HOURS}시간 반올림만큼 오차가 있어 시급 방식이 더 정확합니다.
            </li>
            <li>
              <strong>{korDate(LEAVE_DATES.separateFirstYearHiredFrom)} 이전 입사자</strong> — 당시 법은 1년 미만 연차 사용분을 1년 뒤 생기는 {AL.base}일에서 뺐습니다. 지금 계산에는 영향이 거의 없지만 오래전 기록을 맞춰 볼 때는 이 차이를 감안하세요.
            </li>
          </ul>
          <Callout tone="note" title={`${korDate(LEAVE_DATES.hourlyLeaveFrom)}부터 달라질 예정인 점`}>
            개정 근로기준법 시행으로 시간 단위 연차가 도입되고(§60⑤ 신설), 지금의 §60⑤~⑦은 ⑥~⑧로 번호가 바뀌는 것으로 알려져 있습니다.
            이 페이지의 조문 번호는 {LEAVE_REVIEWED} 현재 기준입니다. 이 개정은 연차 사용 단위에 관한 것으로 알려져 있으며, 발생 일수·시점 규칙의 변경 여부는 시행 전에 개정 조문으로 확인하세요.
          </Callout>
        </section>

        {/* ── 6. 사용법 ── */}
        <section>
          <h2 className="g-h2">계산기 사용법과 계산 가정</h2>
          <ul className="g-list">
            <li><strong>재직 중 탭</strong> — 기준일(기본 오늘) 현재 사용기한이 남은 연차를 모두 더한 뒤, 입력한 사용 일수를 빼 잔여 연차를 보여 줍니다. 회계연도 기준 입사 첫해처럼 비례 연차와 월 단위 연차의 사용기한이 다르면 둘 다 더합니다.</li>
            <li><strong>퇴사 정산 탭</strong> — 마지막 근무일(재직 마지막 날)을 넣습니다. 그날까지 생긴 연차 중 남은 일수에, 회계연도 기준이면 입사일 기준과의 차이를 더해 수당을 계산합니다. 사용기한이 이미 끝난 직전 연차의 미지급분은 별도 안내로 보여 줍니다.</li>
            <li><strong>1년 미만 결근한 달</strong> — 어느 달인지는 구분하지 않고 지난 달 중 개근하지 못한 달 수만큼 월 단위 연차에서 뺍니다.</li>
            <li><strong>출근율</strong> — 체크를 끄면 가장 최근 연 단위 연차에만 {AL.attendanceMinPct}% 미만 규칙을 적용하고, 그 이전 해는 모두 {AL.attendanceMinPct}% 이상으로 가정합니다.</li>
            <li><strong>금액</strong> — 1일 통상임금은 원 미만을 버리고, 수당도 원 미만을 버립니다. 시급을 비워 두면 퇴사 정산은 마지막 근무일이 속한 해, 재직 중은 지금 연차의 사용기한이 끝나는 해의 최저시급을 씁니다. 계산기 표({WAGE_ROWS[0].year}~{WAGE_ROWS[WAGE_ROWS.length - 1].year}년)에 없는 해는 가장 가까운 해 값을 쓰고 입력 칸 아래에 그렇다고 표시하므로, 그때는 실제 시급을 넣으세요.</li>
            <li><strong>월 통상임금 방식</strong> — 월 통상임금 ÷ {MONTHLY_WORK_HOURS} × {DAILY_WORK_HOURS}을 1일 통상임금으로 씁니다. 1일 소정근로시간 칸은 시급 방식에서만 쓰며, 주 {WORK_HOURS_WEEK}시간이 아닌 단시간 근로자는 위 예외 항목처럼 시급 방식으로 계산하세요. 회사 정산 내역과 다르면 고용노동부 고객상담센터(1350)에 문의할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        <section>
          <Disclaimer
            variant="finance"
            sources={[
              { label: '근로기준법 §60 (연차 유급휴가)', href: LAW.lsa60 },
              { label: '근로기준법 §61 (사용 촉진)', href: LAW.lsa61 },
              { label: '근로기준법 §11 (적용 범위)', href: LAW.lsa11 },
              { label: '근로기준법 시행령 §7 [별표 1]', href: LAW.dec7 },
              { label: `대법원 ${SC.caseNo}`, href: LAW.sc },
              { label: `대법원 ${OW.caseNo} ${OW.bench} (통상임금)`, href: LAW.ow },
              { label: `고용노동부 연차 행정해석 변경(${dotDate(LEAVE_DATES.moelNextDayRuleFrom)})`, href: LAW.moel2021 },
            ]}
          >
            본 계산기는 {LEAVE_REVIEWED} 현재 근로기준법·판례·고용노동부 행정해석을 기준으로 한 <strong>추정치</strong>입니다. 실제 연차는 취업규칙·단체협약(법보다 유리한 규정 우선), 출근율 산정에서 빼거나 출근으로 보는 기간, 회사의 소수점 처리 방식에 따라 달라질 수 있습니다.
            분쟁이 있으면 고용노동부 고객상담센터(1350)나 공인노무사와 상담하세요.
          </Disclaimer>
        </section>

        <RelatedTools items={[
          { href: '/tools/finance/severance', desc: '연차수당이 들어간 평균임금으로 퇴직금 계산' },
          { href: '/tools/finance/salary', desc: '월급 실수령액과 시급 환산' },
          { href: '/tools/finance/unemployment-benefit', desc: '퇴사 후 구직급여 1일액과 받는 기간' },
          { href: '/tools/date/holiday-bridge', desc: '남은 연차를 공휴일 사이에 붙여 최장 연휴' },
          { href: '/tools/finance/4-insurance', desc: '월급에서 빠지는 4대보험 근로자 부담' },
        ]} />
      </div>
    </ToolPage>
  )
}
