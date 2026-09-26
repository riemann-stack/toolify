import Link from 'next/link'
import SeveranceClient from './SeveranceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { LEAVE_PRECEDENTS } from '@/lib/krLabor'
import {
  parseDate, daysBetween, taxServiceYears, calcThreeMonthPeriod, calcThreeMonthTotal,
  calcAverageWageDaily, calcOrdinaryWageDaily, calcSeverance, calcSeveranceTax, deductionByYears, fmt,
} from './severanceUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/severance',
  title: '퇴직금 실수령액 계산기 — 평균/통상 자동 + 퇴직소득세(2023 개정) + 시뮬',
  description: '입사·퇴사일과 3개월 급여로 퇴직금·퇴직소득세·실수령 자동. 2023 개정 반영 + DB/DC/IRP 4모드와 퇴사일 시뮬레이션.',
  keywords: ['퇴직금 계산기', '퇴직금 실수령액', '평균임금 통상임금', '퇴직소득세', '근속연수공제', '환산급여공제', '퇴사일 시뮬', 'DB DC IRP', '퇴직연금', '근로기준법'],
})

/* ── 본문 예시·표 — 전부 계산기와 같은 severanceUtils로 빌드 시점 계산 (손으로 적은 숫자 없음) ── */
const man0 = (v: number) => `${fmt(v, 0)}만원`
const won = (vMan: number) => `${Math.round(vMan * 10_000).toLocaleString('ko-KR')}원`

/** 계산 예시: 2023-10-01 입사 → 2026-09-30 퇴사(만 3년), 기본급 250 + 고정수당 20(만원), 미사용 연차수당 100만원, 주 40시간·1일 8시간 */
const EX_START = parseDate('2023-10-01')
const EX_END = parseDate('2026-09-30')
const EX_PERIOD = calcThreeMonthPeriod(EX_END)
const EX_DAYS = daysBetween(EX_START, EX_END)
const EX_YEARS = taxServiceYears(EX_START, EX_END)
const EX_ORD_MONTH = 270
const EX_ORD_DAILY = calcOrdinaryWageDaily(EX_ORD_MONTH, 8)
const EX = [300, 600].map((bonus) => {
  const tot = calcThreeMonthTotal({ monthlyBase: [250, 250, 250], monthlyAllowance: [20, 20, 20], yearlyBonusMan: bonus, unusedLeaveMan: 100 })
  const avg = calcAverageWageDaily(tot.total, EX_PERIOD.days)
  const applied = Math.max(avg, EX_ORD_DAILY)
  const sev = calcSeverance(applied, EX_DAYS)
  return { bonus, tot, avg, applied, useOrd: EX_ORD_DAILY > avg, sev, tax: calcSeveranceTax(sev, EX_YEARS) }
})

/** 통상임금 판례 (lib/krLabor 단일 소스) — 고정성 폐기, 재직조건부 정기상여금도 통상임금 */
const OW = LEAVE_PRECEDENTS.ordinaryWage
const OW_REF = `${OW.court} ${OW.date} 선고 ${OW.caseNo} ${OW.bench}`
/** 같은 연 600만원이 '정기상여금'이면 월 통상임금에 연액÷12가 더해진다 — 1일 통상임금이 다시 평균임금을 앞서는지 */
const EX_HI = EX[1]
const EX_REG_ORD_MONTH = EX_ORD_MONTH + EX_HI.bonus / 12
const EX_REG_ORD_DAILY = calcOrdinaryWageDaily(EX_REG_ORD_MONTH, 8)
const EX_REG_SEV = calcSeverance(Math.max(EX_HI.avg, EX_REG_ORD_DAILY), EX_DAYS)

/** 산정기간 예시 — 월말 퇴사 두 경우 (2026년) */
const P_SEP = calcThreeMonthPeriod(parseDate('2026-09-30'))
const P_APR = calcThreeMonthPeriod(parseDate('2026-04-30'))
const periodLabel = (p: { start: Date; end: Date }) => `${p.start.getMonth() + 1}월 ${p.start.getDate()}일~${p.end.getMonth() + 1}월 ${p.end.getDate()}일`

/** 월급제(1일 8시간) 근로자에게 평균임금이 통상임금을 넘으려면 3개월 동안 '월 통상임금의 몇 %'가 매달 더 붙어야 하는가
 *  30일 × 1일 통상임금 = 월 통상임금 × 240/209, 1일 평균임금 = 3개월 임금 ÷ 산정일수(89~92일) */
const breakEvenPct = (days: number) => ((8 * days) / 209 - 3) / 3 * 100
const BE_MIN = breakEvenPct(89).toFixed(1)
const BE_MAX = breakEvenPct(92).toFixed(1)

/** 퇴직금 × 근속연수별 퇴직소득세 (계산기와 같은 calcSeveranceTax) */
const TAX_CASES: [number, number][] = [[400, 1], [1500, 3], [5000, 5], [5000, 10], [10000, 10], [20000, 20], [30000, 30]]
const TAX_ROWS = TAX_CASES.map(([sev, y]) => ({ sev, y, t: calcSeveranceTax(sev, y) }))
const T5 = calcSeveranceTax(5000, 5)
const T10 = calcSeveranceTax(5000, 10)

const DED_ROWS = [
  { range: '5년 이하', rule: '100만원 × 근속연수', ex: 5 },
  { range: '5년 초과 10년 이하', rule: '500만원 + 200만원 × (근속연수 − 5)', ex: 10 },
  { range: '10년 초과 20년 이하', rule: '1,500만원 + 250만원 × (근속연수 − 10)', ex: 20 },
  { range: '20년 초과', rule: '4,000만원 + 300만원 × (근속연수 − 20)', ex: 30 },
]
const ENV_ROWS = [
  ['800만원 이하', '환산급여 전액'],
  ['800만원 초과 7,000만원 이하', '800만원 + 800만원 초과분의 60%'],
  ['7,000만원 초과 1억원 이하', '4,520만원 + 7,000만원 초과분의 55%'],
  ['1억원 초과 3억원 이하', '6,170만원 + 1억원 초과분의 45%'],
  ['3억원 초과', '1억 5,170만원 + 3억원 초과분의 35%'],
]

const TH: React.CSSProperties = { padding: '10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const THR: React.CSSProperties = { ...TH, textAlign: 'right' }
const TD: React.CSSProperties = { padding: '10px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }
const TDR: React.CSSProperties = { ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const box: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', margin: '0 0 16px' }

const FAQ_LD = [
  { q: '퇴직금은 누구나 받을 수 있나요?', a: '두 가지 조건을 모두 충족해야 법정 퇴직금이 발생합니다(근로자퇴직급여 보장법 제4조). ① <strong>계속근로기간 1년 이상</strong>(수습·시용 기간 포함) ② <strong>4주 평균 1주 소정근로시간 15시간 이상</strong>. 둘 중 하나라도 못 채우면 법정 퇴직금 의무는 없고, 회사 규정으로 자율 지급할 수는 있습니다. 정규직·계약직·파트타임 구분 없이 위 조건만 충족하면 똑같이 적용됩니다.' },
  { q: '평균임금과 통상임금 차이는?', a: `<strong>평균임금</strong>은 퇴직 전 3개월 동안 받은 임금 총액을 그 기간의 달력 일수(89~92일)로 나눈 값으로, 상여금·연차수당·연장근로수당 같은 변동분이 들어갑니다. <strong>통상임금</strong>은 소정근로의 대가로 정기적·일률적으로 지급하기로 정한 임금으로, 기본급·고정수당에 <strong>정기상여금(연액 ÷ 12)</strong>까지 들어갑니다. ${OW_REF} 판결로 ‘고정성’ 요건이 빠져, 지급일에 재직 중이어야 받는 조건(재직조건)이나 일정 일수 이상 근무 조건이 붙은 정기상여금도 통상임금입니다. 실적에 따라 금액이 달라지는 성과급, 실제 일한 만큼 받는 연장·야간근로수당은 빠집니다. 근로기준법 제2조 제2항에 따라 평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 봅니다. 월급제에서 변동급이 적으면 오히려 <strong>통상임금이 더 큰 경우가 많아</strong>, 이 계산기는 두 값을 모두 구해 큰 쪽을 적용합니다.` },
  { q: '상여금·연차수당이 평균임금에 포함되나요?', a: '네. 퇴직 전 1년간 받은 <strong>상여금 총액의 3/12</strong>, 전년도 미사용분으로 받은 <strong>연차수당의 3/12</strong>을 3개월 임금 총액에 더합니다. 예: 연 상여금 600만원 → 150만원 가산, 연차수당 100만원 → 25만원 가산. 정기상여금이라면 평균임금(3/12 가산)과 통상임금(연액 ÷ 12를 월 통상임금에 더함) 양쪽에 모두 들어갑니다. 다만 퇴직하면서 비로소 발생하는 퇴직 연도분 미사용 연차수당은 평균임금에 넣지 않는다는 것이 고용노동부 해석이고, 지급 조건이 불확정적인 일시적·은혜적 금품은 제외될 수 있습니다.' },
  { q: '1일 통상임금 계산은 왜 209시간으로 나누나요?', a: '주 40시간 근무자의 월 통상임금 산정 기준시간이 <strong>209시간</strong>이기 때문입니다. 유급 주휴 8시간을 더한 주 48시간 × (365 ÷ 7 ÷ 12 ≈ 4.345주) ≈ 208.6시간을 올림한 값입니다. 1일 통상임금 = 월 통상임금 ÷ 209 × 1일 소정근로시간(8시간이면 ×8)입니다. 시급·연봉 환산은 <a href="/tools/finance/salary">연봉 실수령액 계산기</a>에서 확인할 수 있습니다.' },
  { q: '퇴직소득세가 일반 소득세보다 적은 이유?', a: `여러 해에 걸쳐 쌓인 소득을 한 번에 받으므로 누진세 부담을 나누는 특별 계산법을 씁니다. 근속연수공제를 먼저 빼고, 남은 금액을 <strong>12배 ÷ 근속연수</strong>로 환산해 환산급여공제 후 기본세율을 매긴 다음, 산출세액에 다시 <strong>근속연수 ÷ 12</strong>를 곱합니다. 예: 5년 근속·퇴직금 5,000만원이면 지방소득세 포함 약 <strong>${man0(T5.totalTax)}</strong>(실효 ${T5.taxRatePct.toFixed(1)}%), 같은 5,000만원을 10년 근속으로 받으면 약 ${man0(T10.totalTax)}(실효 ${T10.taxRatePct.toFixed(1)}%)입니다.` },
  { q: '1년 미만 근무하면 퇴직금이 0인가요?', a: '네, 법정 퇴직금은 0원입니다. 1년은 달력으로 셉니다 — 입사일의 1년 뒤 같은 날짜의 <strong>전날까지</strong> 근무해야 채워지고(민법 제160조), 그 사이에 2월 29일이 끼면 366일째에 충족합니다. 며칠 차이로 요건이 갈리면 근로계약서·출퇴근 기록으로 마지막 근무일을 확인하고, 다툼이 있으면 노무사 상담을 받으세요. 계산기의 시뮬레이터 탭에서 1년 도달일까지 며칠 남았는지 볼 수 있습니다.' },
  { q: 'DB와 DC 퇴직연금 차이는?', a: '<strong>DB형(확정급여형)</strong>은 퇴직 시 받을 금액이 법정 퇴직금 산식(평균임금 × 30일 × 근속연수) 이상으로 정해져 있고, 적립금 운용 책임은 회사에 있습니다. 퇴직 직전 임금이 오를수록 유리합니다. <strong>DC형(확정기여형)</strong>은 회사가 매년 연간 임금총액의 1/12 이상을 근로자 계좌에 넣고 근로자가 운용하므로, 받는 돈은 납입액과 운용 성과로 정해집니다. 내 제도가 무엇인지는 회사 퇴직연금 규약이나 인사팀에서 확인하세요.' },
  { q: 'IRP 의무이전 기준은?', a: '2022년 4월 14일부터 퇴직급여는 원칙적으로 <strong>IRP(개인형 퇴직연금) 계좌로 이전</strong>해 지급합니다(근로자퇴직급여 보장법 제9조). 55세 이후 퇴직, 퇴직급여 300만원 이하, 사망, 외국인 근로자 출국 등은 예외로 현금 수령이 가능합니다. IRP로 받으면 퇴직소득세가 이연되고, 나중에 일시금으로 찾으면 그때 퇴직소득세를 냅니다. 연금으로 나눠 받으면 이연 퇴직소득세의 <strong>70%</strong>(연금 수령 11년차부터는 60%)만 원천징수됩니다.' },
  { q: '퇴사일을 며칠 늦추면 얼마나 차이?', a: '가장 큰 분기점은 <strong>1년</strong>입니다. 1년을 채우는 순간 0원에서 약 한 달치 평균임금 이상으로 뛰는 것이 유일한 절벽이고, 그 뒤로는 재직일수에 정비례해 하루하루 조금씩 늘어납니다(2·3·5년에 별도 점프 없음). 다만 세법상 근속연수는 1년 미만 끝수를 1년으로 올리므로 퇴직소득세는 근속연수가 바뀌는 날을 기준으로 달라지고, 호봉 승급 직후처럼 3개월 임금이 바뀌는 시점에도 금액이 움직입니다. 시뮬레이터 탭에서 일자별 변화를 비교하세요.' },
  { q: '퇴직금을 제때 못 받으면 어떻게 하나요?', a: '퇴직금은 퇴직일로부터 <strong>14일 이내</strong>에 지급해야 하고, 특별한 사정이 있으면 당사자 합의로만 기일을 늦출 수 있습니다(근로자퇴직급여 보장법 제9조). 14일이 지나면 다음 날부터 <strong>연 20% 지연이자</strong>가 붙습니다(근로기준법 제37조·시행령 제17조, 일시금에 한함). 상담은 고용노동부 고객상담센터 <strong>1350</strong>(평일 9~18시), 체불 진정은 고용노동부 누리집 민원 메뉴나 관할 지방고용노동관서, 무료 법률 상담은 대한법률구조공단 <strong>132</strong>에서 받을 수 있습니다.' },
]

export default function SeverancePage() {
  return (
    <ToolPage width={880} slug="/tools/finance/severance">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />퇴직금 실수령액 계산기
      </h1>
      <p className="tp-lead">
        입사·퇴사일과 3개월 급여로 <strong style={{ color: 'var(--text)' }}>퇴직금·퇴직소득세·실수령</strong> 자동. DB/DC/IRP 4모드.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="근로기준법·근로자퇴직급여 보장법·소득세법(2023.1.1 이후 퇴직분 근속연수공제) · 통상임금은 대법원 2024.12.19. 2020다247190 전원합의체 판결 기준"
        sources={[
          { label: '고용노동부', href: 'https://www.moel.go.kr' },
          { label: '국가법령정보센터 근로자퇴직급여 보장법', href: 'https://www.law.go.kr/법령/근로자퇴직급여보장법' },
          { label: '국가법령정보센터 소득세법 제48조(퇴직소득공제)', href: 'https://www.law.go.kr/법령/소득세법/제48조' },
          { label: '국가법령정보센터 근로기준법 제2조', href: 'https://www.law.go.kr/법령/근로기준법/제2조' },
          { label: '국가법령정보센터 대법원 2020다247190 전원합의체 판결(통상임금)', href: 'https://www.law.go.kr/판례/(2020다247190)' },
        ]}
      />

      <SeveranceClient />

      <GuideDivider />

      <h2 className="g-h2">입력 순서와 탭 구성</h2>
      <ol className="g-list">
        <li><strong>입사일·퇴사일</strong> — 퇴사일은 마지막으로 근무한 날입니다. 재직일수와 퇴직 전 3개월 산정기간이 자동으로 잡힙니다.</li>
        <li><strong>월별 임금</strong> — 산정기간 3개월 각각의 기본급과 고정수당을 넣습니다. 달마다 금액이 달랐다면 그대로 입력하세요.</li>
        <li><strong>상여금·연차수당</strong> — 최근 1년 상여금 총액과 미사용 연차수당을 넣으면 각각 3/12만 평균임금에 더해집니다.</li>
        <li><strong>월 통상임금</strong> — 기본급·고정수당에 정기상여금 연액의 1/12을 더한 금액입니다. 재직조건이 붙은 정기상여금도 넣고, 성과급·연장근로수당은 뺍니다({OW_REF}). 평균임금과 비교하는 데 쓰입니다.</li>
        <li><strong>결과·탭</strong> — 세전 퇴직금, 퇴직소득세, 실수령액을 보여 주고, 평균·통상 비교, 퇴사일 시뮬, 퇴사월 총 입금 탭으로 나눠 볼 수 있습니다.</li>
      </ol>
      <Callout tone="tip" title="퇴사일 시뮬 탭">
        슬라이더로 퇴사일을 앞뒤로 옮기며 퇴직금 변화를 그래프로 봅니다. 금액이 뚝 끊기는 지점은 <strong>1년</strong>(미만이면 0원) 하나뿐이고, 그 뒤로는 재직일수에 비례해 꾸준히 늘어납니다. 2·3·5년 표시는 참고 시점일 뿐 별도 가산은 없습니다.
      </Callout>

      <h2 className="g-h2">퇴직금 계산 공식</h2>
      <div style={box}>
        <p style={{ fontSize: 16, color: 'var(--accent-ink)', margin: 0, fontWeight: 700, lineHeight: 1.8 }}>
          법정 퇴직금 = 1일 평균임금 × 30일 × (재직일수 ÷ 365)
        </p>
      </div>
      <ul className="g-list">
        <li><strong>1일 평균임금</strong> = 퇴직 전 3개월 임금 총액 ÷ 그 3개월의 달력 일수(89~92일)</li>
        <li><strong>3개월 임금 총액</strong> = 기본급 + 고정수당 + 연장·야간 등 그 기간에 받은 수당 + (연 상여금 × 3/12) + (연차수당 × 3/12)</li>
        <li><strong>적용 임금</strong> = max(1일 평균임금, 1일 통상임금) — 근로기준법 제2조 제2항</li>
        <li><strong>발생 요건</strong> = 계속근로 1년 이상 + 4주 평균 주 15시간 이상 (근로자퇴직급여 보장법 제4조)</li>
      </ul>
      <p className="g-p">
        3개월은 퇴직일(마지막 근무일의 다음 날)부터 거꾸로 셉니다. 9월 30일이 마지막 근무일이면 {periodLabel(P_SEP)}({P_SEP.days}일), 4월 30일이면 {periodLabel(P_APR)}({P_APR.days}일)입니다. 3개월 월급이 같아도 분모가 {P_APR.days}일이면 {P_SEP.days}일일 때보다 1일 평균임금이 약 {((P_SEP.days / P_APR.days - 1) * 100).toFixed(1)}% 높습니다. 이 계산기는 퇴사일을 넣으면 산정기간과 일수를 자동으로 잡고, 월이 걸치는 구간은 날짜 단위로 나눠 입력칸을 만듭니다.
      </p>
      <p className="g-p">
        근로기준법 시행령 제2조는 수습 기간(3개월 이내), 회사 사정에 의한 휴업, 출산전후휴가, 업무상 부상·질병 요양, 육아휴직 등의 기간을 평균임금 산정기간과 임금 총액에서 빼도록 정하고 있습니다. 퇴직 직전 3개월에 이런 기간이 끼어 있으면 이 계산기의 단순 3개월 평균보다 실제 평균임금이 높게 잡힐 수 있으니, 회사 정산서나 고용노동부 퇴직금 계산 결과와 대조해 보세요.
      </p>

      <h2 className="g-h2">계산 예시 — 월 통상임금 270만원, 만 3년 근속</h2>
      <p className="g-p">
        2023년 10월 1일 입사, 2026년 9월 30일 퇴사(재직 {fmt(EX_DAYS)}일, 세법상 근속 {EX_YEARS}년)이고 기본급 250만원·고정수당 20만원, 미사용 연차수당 100만원, 주 40시간·1일 8시간 근무라고 두고 <strong>성과상여금</strong>(실적에 따라 금액이 달라지는 비정기 상여금이라 통상임금에는 들어가지 않는 것)만 바꿔 계산기와 같은 함수로 구한 값입니다. 산정기간은 {EX_PERIOD.start.getMonth() + 1}월 {EX_PERIOD.start.getDate()}일~9월 30일, {EX_PERIOD.days}일입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr>
              <th scope="col" style={TH}>항목</th>
              {EX.map((e) => <th scope="col" key={e.bonus} style={THR}>성과상여금 연 {man0(e.bonus)}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>3개월 임금 총액</th>{EX.map((e) => <td key={e.bonus} style={TDR}>{man0(e.tot.total)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>· 성과상여금 3/12 가산분</th>{EX.map((e) => <td key={e.bonus} style={TDR}>{man0(e.tot.bonusPortion)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>1일 평균임금 (÷{EX_PERIOD.days}일)</th>{EX.map((e) => <td key={e.bonus} style={{ ...TDR, color: e.useOrd ? 'var(--muted)' : 'var(--accent-ink)', fontWeight: e.useOrd ? 400 : 700 }}>{won(e.avg)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>1일 통상임금 (270만 ÷ 209 × 8)</th>{EX.map((e) => <td key={e.bonus} style={{ ...TDR, color: e.useOrd ? 'var(--accent-ink)' : 'var(--muted)', fontWeight: e.useOrd ? 700 : 400 }}>{won(EX_ORD_DAILY)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>적용</th>{EX.map((e) => <td key={e.bonus} style={TDR}>{e.useOrd ? '통상임금' : '평균임금'}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>세전 퇴직금</th>{EX.map((e) => <td key={e.bonus} style={{ ...TDR, fontWeight: 700 }}>{won(e.sev)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>퇴직소득세 + 지방소득세</th>{EX.map((e) => <td key={e.bonus} style={TDR}>{won(e.tax.totalTax)}</td>)}</tr>
            <tr><th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>실수령액</th>{EX.map((e) => <td key={e.bonus} style={{ ...TDR, color: 'var(--accent-ink)', fontWeight: 700 }}>{won(e.tax.netSeverance)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">원 단위는 반올림. 굵게 표시한 쪽이 퇴직금 계산에 쓰인 1일 임금입니다. 세금은 원 미만 절사 전 값이라 원천징수영수증과 몇 원 차이가 날 수 있습니다.</p>
      <p className="g-p">
        성과상여금이 연 300만원이면 평균임금이 통상임금보다 낮아 <strong>통상임금으로 계산</strong>되고, 연 600만원으로 늘면 평균임금이 앞서 평균임금으로 계산됩니다. 세금은 두 경우 모두 퇴직금의 1% 남짓이라, 3년 근속자에게 퇴직소득세는 실수령에 큰 영향을 주지 않습니다.
      </p>
      <Callout tone="warn" title="같은 600만원이 정기상여금이면 결론이 바뀝니다">
        매년 정해진 시기에 정해진 금액(또는 기본급의 일정 비율)을 주는 <strong>정기상여금</strong>이라면 재직조건이 붙어 있어도 통상임금입니다({OW_REF}). 이때 월 통상임금은 270만원 + 600만원 ÷ 12 = <strong>{man0(EX_REG_ORD_MONTH)}</strong>, 1일 통상임금은 {won(EX_REG_ORD_DAILY)}으로 1일 평균임금 {won(EX_HI.avg)}보다 커서 다시 <strong>통상임금이 적용</strong>되고, 세전 퇴직금은 {won(EX_REG_SEV)}입니다. 계산기의 &lsquo;월 통상임금&rsquo; 칸에 정기상여금 연액의 1/12을 더해 넣어야 이 결과가 나옵니다.
      </Callout>

      <h2 className="g-h2">평균임금 vs 통상임금 — 둘 중 큰 것 적용</h2>
      <p className="g-p">
        근로기준법 제2조 제2항은 &lsquo;평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 한다&rsquo;고 정합니다. 두 값은 나누는 분모가 다릅니다. 평균임금은 토·일요일까지 포함한 <strong>달력 일수</strong>로 나누고, 1일 통상임금은 주휴를 반영한 <strong>월 209시간</strong> 기준 시간급에 하루 소정근로시간을 곱합니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, margin: '0 0 16px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>평균임금</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            3개월 임금 총액 ÷ 3개월 달력 일수<br />
            포함: 기본급·모든 수당·상여금×3/12·연차수당×3/12<br />
            특징: 변동급이 많을수록 커짐
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--amber-600)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>통상임금</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            월 통상임금 ÷ 209시간 × 1일 소정근로시간<br />
            포함: 소정근로 대가로 정기·일률 지급하기로 정한 임금(기본급·고정수당 + 정기상여금 연액÷12, 재직조건이 붙어도 포함)<br />
            제외: 성과급·연장·야간근로수당·연차수당<br />
            특징: 변동급은 빠지지만 분모가 작아 하루치가 큼
          </p>
        </div>
      </div>
      <p className="g-p">
        그래서 월급제 근로자는 30일치로 환산하면 통상임금이 월 통상임금의 240/209배(약 1.15배)인 반면, 평균임금은 고정급만 있을 때 월급의 약 0.98~1.01배에 그칩니다. 3개월 동안 통상임금에 들어가지 않는 가산분(성과급·연장근로수당·연차수당 등)이 <strong>매달 월 통상임금의 약 {BE_MIN}~{BE_MAX}%</strong>(산정기간 89~92일 기준) 이상 붙어야 비로소 평균임금이 통상임금을 넘습니다. 정기상여금은 평균임금과 통상임금을 같은 비율로 함께 올리므로 이 격차를 메우지 못합니다. &lsquo;평균임금이 원래 더 크다&rsquo;고 생각해 통상임금 입력을 비워 두면 퇴직금을 적게 계산할 수 있으니 두 칸을 모두 채우세요.
      </p>

      <h2 className="g-h2">퇴직소득세 — 환산급여·근속연수공제 (2023 개정)</h2>
      <p className="g-p">
        퇴직소득세는 한 번에 받는 목돈에 누진세율이 몰리지 않도록 &lsquo;12배로 늘렸다가 다시 나누는&rsquo; 연분연승 방식을 씁니다(소득세법 제48조·제55조). 계산기의 세금 계산 순서는 다음과 같습니다.
      </p>
      <div style={box}>
        <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 2 }}>
          ① 환산급여 = (퇴직금 − 근속연수공제) × 12 ÷ 근속연수<br />
          ② 과세표준 = 환산급여 − 환산급여공제<br />
          ③ 환산산출세액 = 과세표준 × 기본세율(6~45%)<br />
          ④ <strong style={{ color: 'var(--accent-ink)' }}>퇴직소득세 = 환산산출세액 × 근속연수 ÷ 12</strong><br />
          ⑤ 지방소득세 = 퇴직소득세 × 10%
        </p>
      </div>
      <p className="g-p">
        근속연수는 입사일부터 퇴사일까지의 만 연수이고, 1년 미만 끝수는 <strong>1년으로 올립니다</strong>(소득세법 시행령 제105조). 만 3년 2개월이면 4년입니다. 2023년 1월 1일 이후 퇴직분부터 근속연수공제가 아래처럼 커졌습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr><th scope="col" style={TH}>근속연수</th><th scope="col" style={TH}>근속연수공제</th><th scope="col" style={THR}>구간 끝 공제액</th></tr>
          </thead>
          <tbody>
            {DED_ROWS.map((r) => (
              <tr key={r.range}>
                <td style={{ ...TD, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.range}</td>
                <td style={TD}>{r.rule}</td>
                <td style={TDR}>{r.ex}년 → {man0(deductionByYears(r.ex))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tableScroll" style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
          <thead>
            <tr><th scope="col" style={TH}>환산급여</th><th scope="col" style={TH}>환산급여공제</th></tr>
          </thead>
          <tbody>
            {ENV_ROWS.map(([k, v]) => (
              <tr key={k}><td style={{ ...TD, fontWeight: 600 }}>{k}</td><td style={TD}>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        아래는 퇴직금과 근속연수를 바꿔 가며 계산기와 같은 함수로 구한 세액입니다. 같은 5,000만원이라도 5년 근속이면 {man0(T5.totalTax)}, 10년 근속이면 {man0(T10.totalTax)}로 세 배 넘게 차이 납니다. 근속연수공제가 커지고, 12배 환산한 금액을 나누는 분모도 커지기 때문입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead>
            <tr>
              {['퇴직금', '근속', '근속연수공제', '환산급여', '과세표준', '세금 합계', '실효세율'].map((h, i) => (
                <th scope="col" key={h} style={i < 2 ? TH : THR}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TAX_ROWS.map(({ sev, y, t }) => (
              <tr key={`${sev}-${y}`}>
                <td style={{ ...TD, fontWeight: 600, whiteSpace: 'nowrap' }}>{man0(sev)}</td>
                <td style={TD}>{y}년</td>
                <td style={TDR}>{man0(t.yearsDeduction)}</td>
                <td style={TDR}>{man0(t.envWage)}</td>
                <td style={TDR}>{man0(t.taxBase)}</td>
                <td style={{ ...TDR, color: 'var(--accent-ink)', fontWeight: 700 }}>{won(t.totalTax)}</td>
                <td style={TDR}>{t.taxRatePct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">세금 합계 = 퇴직소득세 + 지방소득세(10%). 기본세율은 2023년 이후 종합소득세 기본세율(6~45%)과 같습니다. 중간정산·임원 한도·IRP 과세이연은 반영하지 않습니다.</p>

      <h2 className="g-h2">DB · DC · IRP — 받는 방식에 따라 달라지는 것</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, margin: '0 0 16px' }}>
        {[
          { t: '일반 퇴직금', d: '퇴직연금에 가입하지 않은 회사가 법정 산식대로 직접 지급. 퇴직 후 14일 이내 지급 의무.', c: 'var(--teal-600)' },
          { t: 'DB형 퇴직연금', d: '확정급여형. 받을 금액이 법정 퇴직금 산식 이상으로 정해져 있고 운용 책임은 회사.', c: 'var(--cyan-600)' },
          { t: 'DC형 퇴직연금', d: '확정기여형. 회사가 매년 연 임금총액의 1/12 이상을 넣고 근로자가 운용. 결과는 운용 성과에 따라 변동.', c: 'var(--amber-600)' },
          { t: 'IRP', d: '55세 미만·300만원 초과 퇴직급여는 IRP로 이전. 퇴직소득세가 이연되고 연금 수령 시 30~40% 감면.', c: 'var(--orange-600)' },
        ].map((g) => (
          <div key={g.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
          </div>
        ))}
      </div>
      <p className="g-p">
        DB형과 일반 퇴직금은 계산기 결과를 그대로 쓰면 됩니다. IRP로 이전받는 경우 계산기가 보여 주는 세금은 &lsquo;지금 일시금으로 찾으면 낼 세금&rsquo;이고, IRP에 두는 동안은 원천징수되지 않고 이연됩니다. 나중에 연금으로 나눠 받으면 이연된 퇴직소득세의 70%(연금 수령 11년차부터 60%)만 떼므로, 당장 목돈이 필요하지 않다면 IRP에서 연금으로 받는 쪽이 세금이 적습니다.
      </p>
      <Callout tone="warn" title="DC형은 이 계산기 결과와 다를 수 있습니다">
        DC형은 회사가 넣어 준 부담금과 그 운용 수익의 합계가 받을 돈입니다. 법정 퇴직금 산식으로 구한 금액은 &lsquo;회사가 최소한 이만큼은 넣었어야 한다&rsquo;는 비교 기준으로만 쓰고, 실제 금액은 퇴직연금 사업자(은행·증권사·보험사) 계좌 잔액으로 확인하세요.
      </Callout>

      <h2 className="g-h2">계산기가 반영하지 못하는 경우 — 전문가에게 확인할 때</h2>
      <ul className="g-list">
        <li><strong>평균임금 산정 제외 기간</strong>이 퇴직 전 3개월에 있는 경우(육아휴직·산재 요양·회사 사정 휴업 등) — 제외 후 다시 계산해야 합니다.</li>
        <li><strong>퇴직금 중간정산</strong>을 받은 적이 있으면 계속근로기간이 정산 다음 날부터 새로 시작합니다. 입사일 대신 정산 기준일 다음 날을 넣으세요.</li>
        <li><strong>연장·야간근로수당이 들쭉날쭉</strong>한 경우 3개월 실제 지급액을 월별 칸에 나눠 넣어야 평균임금이 맞습니다.</li>
        <li><strong>임원</strong>은 회사 정관의 퇴직금 규정과 소득세법상 임원 퇴직소득 한도가 따로 적용됩니다.</li>
        <li><strong>근로자성·근속기간 자체에 다툼</strong>이 있는 경우(프리랜서 계약, 계약 갱신 사이 공백 등)는 노무사나 고용노동부 상담으로 먼저 판단받으세요.</li>
      </ul>

      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: '고용노동부 퇴직금 계산기', href: 'https://www.moel.go.kr' },
          { label: '국세청 퇴직소득세 안내', href: 'https://www.nts.go.kr' },
        ]}
      >
        본 계산기는 평균임금·통상임금과 퇴직소득세 공식을 단순화한 간이 추정 도구입니다. 상여금·연차수당 산입 범위, 평균임금 산정 제외 기간, 회사 규정(DB·DC 운용 성과 등)에 따라 실제 금액은 달라질 수 있으며, 확정 금액은 고용노동부 퇴직금 계산기와 회사 정산 기준으로 확인하세요.
      </Disclaimer>

      {/* finance 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/finance/salary" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>연봉 실수령액 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            4대보험·세금·시급
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 + 6 항아리 + 절세
          </p>
        </Link>
        <Link href="/tools/finance/4-insurance" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>4대보험 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            국민연금·건강·고용·산재
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
