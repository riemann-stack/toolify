import Link from 'next/link'
import SalaryClient from './SalaryClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import { buildSalaryTable, buildNetTargetTable, calcSalary, calcHourlyWage, reverseCalcSalary, formatEok, SALARY_PENSION_BASE } from './salaryUtils'
import { INSURANCE_RATES, MIN_HOURLY_WAGE, pensionBasePeriodLabel } from '@/lib/krInsuranceRates'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import { BRACKETS_2026, LOCAL_INCOME_TAX_RATIO } from '@/lib/krIncomeTax'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import { todayStr } from '@/lib/date'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/salary',
  title: '연봉 실수령액 계산기 2026 — 월급·세후·4대보험·역산·연봉표',
  description:
    '세금·4대보험 떼고 통장에 진짜 꽂히는 월급. 2026년 최신 기준 4대보험·근로소득세 자동 + 월 실수령 역산·체감 시급(야근·출퇴근 포함)·1,800만~2억 연봉표.',
  keywords: [
    '연봉실수령액', '연봉계산기2026', '세후연봉', '실수령액계산',
    '4대보험계산기', '월급실수령액', '연봉실수령액표',
    '연봉 역산', '연봉 협상', '시급 계산', '연봉 인상률',
    '비과세 식대', '근로소득 간이세액표',
  ],
})

const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

/* 법정 수치 표기 — lib 단일 소스에서 보간 (빌드 시점 기준, 서버 컴포넌트라 hydration 무관) */
const R25 = INSURANCE_RATES[2025]
const R26 = INSURANCE_RATES[2026]
const ltcRatioPct = (r: typeof R26) => (Math.round(r.ltc.rateOfSalary / r.health.total * 1e4) / 100).toFixed(2)
const PB = SALARY_PENSION_BASE
const PB_LABEL = pensionBasePeriodLabel(PB)
const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만원`

/* 부양가족 1인·비과세 0원 기준 2026년 연봉 실수령액표 (1,800만~2억, 빌드 시 생성) */
const SALARY_TABLE = buildSalaryTable(1, 0, 0)

/* §7 연봉별 실수령률·월실수령 — 엔진 생성(1인·비과세 0) */
const RATE_ROWS = [20_000_000, 30_000_000, 40_000_000, 50_000_000, 70_000_000, 100_000_000, 150_000_000, 200_000_000]
  .map(y => calcSalary({ grossYearly: y, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0, isInsured: true }))

/* §5 월 실수령 목표 → 필요 세전 연봉 — 엔진 생성(1인·비과세 0) */
const NET_TARGETS = buildNetTargetTable(1, 0, 0)
const NET_TARGET_NOTES = ['', '중위 부근', '', '', '', '', '상위 10% 이내']

/* FAQ·가이드 수치 — 전부 도구 엔진(calcSalary 등)으로 빌드 시 계산 (정적 수치 드리프트 방지) */
const sal = (y: number, dep = 1, kids = 0, nt = 0) =>
  calcSalary({ grossYearly: y, dependents: dep, childrenCount: kids, nonTaxableMonthly: nt, isInsured: true })
const manR = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만원`
const man1 = (n: number) => `${(Math.round(n / 1_000) / 10).toLocaleString('ko-KR')}만 원`
/* 부양가족 1인 → 3인 (연봉 5,000만) */
const DEP1 = sal(50_000_000, 1), DEP3 = sal(50_000_000, 3)
/* 비과세 효과 — 연봉별 식대 20만 / 식대+자가운전+육아 60만 */
const NT_ROWS = [30_000_000, 40_000_000, 60_000_000].map(y => {
  const base = sal(y), m20 = sal(y, 1, 0, 200_000), m60 = sal(y, 1, 0, 600_000)
  return { y, d20: m20.netMonthly - base.netMonthly, d60: m60.netMonthly - base.netMonthly }
})
const NT40 = NT_ROWS[1]
/* 역산 — 월 300만원 */
const REV300 = reverseCalcSalary({ targetNetMonthly: 3_000_000, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0 })
/* 연봉 5,000만 인상 시뮬 */
const RAISE_BASE = sal(50_000_000)
const RAISES = [5, 10, 20].map(p => {
  const r = sal(50_000_000 * (1 + p / 100))
  return { p, up: r.netMonthly - RAISE_BASE.netMonthly, netPct: (r.netMonthly / RAISE_BASE.netMonthly - 1) * 100 }
})
/* 체감 시급 — 계산기 기본값(주 40시간·야근 5시간·왕복 60분·연차 15일), 연봉 4,000만 */
const H40 = sal(40_000_000)
const hourly = (overtime: number, commute: number) =>
  calcHourlyWage({ yearly: 40_000_000, netYearly: H40.netYearly, weeklyHours: 40, weeklyOvertime: overtime, dailyCommuteMin: commute, vacationDays: 15 })
const HW = hourly(5, 60)
const HW0 = hourly(0, 0), HW90 = hourly(0, 90)
const COMMUTE90_DROP = (1 - HW90.perceivedHourlyNet / HW0.perceivedHourlyNet) * 100
const HW_OT0 = hourly(5, 0), HW_OT90 = hourly(5, 90)
const COMMUTE_GAP = (1 - HW_OT90.perceivedHourlyNet / HW_OT0.perceivedHourlyNet) * 100
const wonR = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/* 과세표준 구간 경계 표기 */
const bracketLabel = (i: number) => {
  const lo = i === 0 ? 0 : BRACKETS_2026[i - 1].upTo
  const hi = BRACKETS_2026[i].upTo
  const f = (n: number) => n >= 100_000_000 ? `${(n / 100_000_000).toLocaleString('ko-KR')}억` : `${(n / 10_000).toLocaleString('ko-KR')}만`
  return hi === Infinity ? `${f(lo)} 초과` : i === 0 ? `${f(hi)} 이하` : `${f(lo)} 초과 ~ ${f(hi)} 이하`
}

const FAQ_LD = [
              {
                q: '부양가족 수가 늘어나면 실수령액이 얼마나 달라지나요?',
                a: `근로소득세는 부양가족 수에 따라 기본공제(1인당 연 150만 원)가 적용됩니다. 연봉 5,000만 원 기준 부양가족 1인(본인)보다 3인이면 월 소득세+지방소득세가 ${wonR(DEP1.totalTax)} → ${wonR(DEP3.totalTax)}으로 <strong>약 ${man1(DEP1.totalTax - DEP3.totalTax)}</strong> 줄어듭니다. 8세~20세 자녀가 있으면 자녀세액공제가 추가로 적용되니 계산기의 자녀 수 칸에 함께 넣으세요.`,
              },
              {
                q: '식대 20만 원 비과세를 적용하면 실수령액이 얼마나 늘어나나요?',
                a: `같은 연봉에서 일부가 비과세 식대로 지급되면 그만큼 4대보험료와 소득세가 줄어 실수령이 늘어납니다. 연봉 4,000만 원 기준 식대 월 20만 원 비과세면 월 약 ${wonR(NT40.d20)}, 연 약 ${manR(NT40.d20 * 12)}이 늘고(연봉 3,000만 원이면 월 ${wonR(NT_ROWS[0].d20)}으로 더 적음 — 한계세율이 낮기 때문), 식대·자가운전보조금·육아수당을 합쳐 월 60만 원이 비과세면 <strong>연 약 ${manR(NT40.d60 * 12)}</strong>이 늘어납니다. 비과세는 회사가 해당 명목으로 지급하고 요건을 충족해야 적용됩니다.`,
              },
              {
                q: '연봉 협상 시 세전과 세후 중 어느 기준으로 이야기해야 하나요?',
                a: '대부분의 연봉 계약은 세전(gross) 기준으로 이루어집니다. 실제 생활비 계획은 세후(net) 실수령액을 기준으로 해야 합니다. 본 도구의 <strong>[역산] 탭</strong>으로 원하는 월 실수령액에 필요한 세전 연봉을 미리 확인해 협상 시작 금액을 결정하세요.',
              },
              {
                q: '프리랜서·개인사업자는 이 계산기를 사용할 수 없나요?',
                a: '이 계산기는 4대보험에 가입된 근로소득자(직장인) 기준입니다. 프리랜서는 3.3% 원천징수가 적용되며 종합소득세 신고를 통해 정산합니다. 개인사업자는 종합소득세·부가세 별도 계산이 필요합니다.',
              },
              {
                q: '본 계산기와 실제 월급명세서가 다른 이유는?',
                a: '본 계산기는 2026년 4대보험 요율을 적용하고, 소득세는 근로소득 간이세액표를 칸 단위로 찾지 않고 연 결정세액을 12로 나눠 근사한 추정입니다. 실제 차이가 발생하는 원인 — 간이세액표 칸 값과 근사치의 차이 / 회사별 비과세 항목(식대·교통비·복지) / 상여금·성과급(지급 시점 따라 변동) / 두루누리 사회보험 지원(소규모 사업장) / 부양가족 변동(출생·결혼) / 추가 공제(의료비·기부금 등). 정확한 금액은 회사 인사팀 또는 급여명세서를 확인하세요. 특히 소득세는 간이세액표 칸 값과 몇천 원~몇만 원 차이가 날 수 있습니다.',
              },
              {
                q: '월 실수령액 역산은 어떻게 활용하나요?',
                a: `<strong>[역산] 탭</strong>에서 원하는 월 실수령액(예: 300만원)을 입력하면 필요한 세전 연봉(부양가족 1인·비과세 없음 기준 약 ${REV300 ? formatEok(REV300.grossYearly) : '—'})이 계산됩니다. 연봉을 10만 원 단위로 올려 잡아 목표 실수령에 못 미치지 않게 했고, 협상 여지로 그 연봉의 약 1~6% 위 범위(${REV300 ? `${formatEok(REV300.rangeLow)}~${formatEok(REV300.rangeHigh)}` : '—'})도 함께 보여 줍니다. 생활비 → 필요 연봉 → 협상 시작 금액 순서로 쓰면 됩니다.`,
              },
              {
                q: '연봉 인상 시 실수령은 얼마나 늘어나나요?',
                a: `인상률 그대로 실수령이 늘지 않습니다(누진 세율 때문). 연봉 5,000만 원에서 ${RAISES.map(r => `${r.p}% 인상 시 월 약 +${man1(r.up)}(실수령 +${r.netPct.toFixed(1)}%)`).join(' / ')}. 늘어난 금액의 일부가 더 높은 세율 구간에서 과세되기 때문이며, 과세표준 8,800만 원(24% → 35% 구간)을 넘는 고연봉일수록 차이가 커집니다. 인상 후 연봉을 <strong>[실수령액] 탭</strong>에 직접 입력하면 늘어나는 월 실수령을 바로 확인할 수 있습니다.`,
              },
              {
                q: '13월 월급(연말정산)은 어떻게 계산되나요?',
                a: '본 도구는 매월 원천징수 기준이며, 연말정산은 별도입니다. <strong>환급 가능 항목</strong> — 의료비 / 카드 사용액 / 월세·전세 / 보험료·기부금 / 연금저축·IRP. <strong>추가 납부 가능</strong> — 미신고 부양가족 / 부양가족 소득 변동 / 비과세 미적용. 환급·추가 납부 규모는 공제 항목에 따라 개인별 차이가 크므로, 국세청 홈택스 &lsquo;연말정산 미리보기&rsquo;로 확인하는 것이 가장 정확합니다.',
              },
              {
                q: '체감 시급은 어떻게 계산하나요?',
                a: `<strong>체감 시급 = 연 실수령 ÷ 연간 총 노동 시간(출퇴근 포함)</strong>. 연봉 4,000만원·왕복 출퇴근 60분·주 5시간 야근·연차 15일(계산기 기본값)이면 — 세전 시급 ${wonR(HW.baseHourlyGross)} / 세후 시급 ${wonR(HW.baseHourlyNet)} / 야근 포함 ${wonR(HW.realHourlyNet)} / 체감 시급 ${wonR(HW.perceivedHourlyNet)}. 같은 조건에서 출퇴근이 0분이면 ${wonR(HW_OT0.perceivedHourlyNet)}, 90분이면 ${wonR(HW_OT90.perceivedHourlyNet)}으로 약 ${COMMUTE_GAP.toFixed(0)}% 차이 납니다. 본 도구의 <strong>[실수령액] 탭</strong>에서 &lsquo;체감 시급 보기&rsquo; 옵션을 켜면 본인 조건으로 비교 가능합니다.`,
              },
            ]

export default function SalaryPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/salary">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />연봉 실수령액 계산기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>2026년 최신 세법 기준</strong>, 4대보험·근로소득세를 자동 반영한 실수령액 추정 계산기.
      </p>

      <UpdatedMeta date="2026년 9월" basis={`2026년 4대보험 요율·국민연금 기준소득월액 상·하한(${PB_LABEL})·소득세는 간이세액표 근사(연 결정세액÷12), 연봉 분포는 국세청 2024년 귀속 연말정산 국세통계(2025-12 공표) 기준`} sources={[{"label":"홈택스","href":"https://hometax.go.kr"},{"label":"4대 사회보험 정보연계센터","href":"https://www.4insure.or.kr"},{"label":"근로소득 백분위 자료(공공데이터포털)","href":"https://www.data.go.kr/data/15082063/fileData.do"},{"label":"국가법령정보센터 — 소득세법","href":"https://www.law.go.kr/법령/소득세법"},{"label":"국세청 국세통계포털","href":"https://tasis.nts.go.kr"}]} />

      {/* buildDate: SSG와 hydration이 같은 기준일(국민연금 상·하한 구간)을 쓰도록 빌드 시점 날짜 전달 */}
      <SalaryClient buildDate={todayStr()} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 연봉 실수령액 표 (SEO 핵심) ── */}
        <section>
          <h2 className="g-h2">
            연봉 실수령액 표
          </h2>
          <p className="g-p">
            부양가족 1인(본인만)·비과세 없는 순수 급여 기준 <strong style={{ color: 'var(--text)' }}>2026년</strong> 연봉별 실수령액(1,800만~2억). 국민연금·건강보험·장기요양·고용보험·근로소득세를 모두 반영했습니다.
          </p>
          <div style={{ marginBottom: 20 }}>
            <Callout tone="tip">
              표에 없는 연봉, 부양가족·자녀·비과세 조건은 상단 계산기에서 직접 확인하세요.
            </Callout>
          </div>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>연봉</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>월 세전</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>월 실수령</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>연 실수령</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>실수령률</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map((row, i) => (
                  <tr key={row.yearly} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatEok(row.yearly)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{won(row.monthlyGross)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{won(row.monthlyNet)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatEok(row.yearlyNet)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.takeHomeRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 부양가족 1인 기준·비과세 미적용·2026년 4대보험 요율 반영, 소득세는 간이세액표 근사(연 결정세액÷12). 부양가족·자녀·비과세 항목을 반영한 정확한 값은 상단 계산기에서 확인하세요.
          </p>
        </section>

        {/* ── 2. 4대보험 요율 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">
            근로자 4대보험 요율 및 변경사항 총정리
          </h2>
          <p className="g-p">
            2026년에는 국민연금 보험료율이 1998년 이후 28년 만에 인상되고 건강보험·장기요양보험 요율도 조정되었습니다.
          </p>
          <div className="tableScroll" style={{ marginBottom: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>근로자</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>사업주</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--warning)', fontWeight: 500, whiteSpace: 'nowrap' }}>변경</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['국민연금',     `${R26.pension.employee}%`, `${R26.pension.employer}%`, `▲ ${R25.pension.employee}% → ${R26.pension.employee}%`],
                  ['건강보험',     `${R26.health.employee}%`,  `${R26.health.employer}%`,  `▲ ${R25.health.employee}% → ${R26.health.employee}%`],
                  ['장기요양보험', `건보료 × ${ltcRatioPct(R26)}%`, '동일', `▲ ${ltcRatioPct(R25)}% → ${ltcRatioPct(R26)}%`],
                  ['고용보험',     `${R26.unemp.employee}%`,   `${R26.unemp.employer}%+α`, R25.unemp.employee === R26.unemp.employee ? '동결' : `${R25.unemp.employee}% → ${R26.unemp.employee}%`],
                  ['산재보험',     '없음',              '업종별',     '근로자 부담 없음'],
                ].map(([label, worker, employer, change], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{worker}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{employer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--warning)', fontSize: '12px', whiteSpace: 'nowrap' }}>{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.8 }}>
            ※ <strong style={{ color: 'var(--text)' }}>국민연금</strong>은 기준소득월액 상한 <strong style={{ color: 'var(--text)' }}>{man(PB.max)}</strong>까지만 부과(초과분 적용 X)하고, 하한 {man(PB.min)} 미만이면 하한으로 부과합니다({PB_LABEL} 적용 · 매년 7월 조정). <strong style={{ color: 'var(--text)' }}>장기요양보험</strong>은 건강보험료에 연동(건보료 × {ltcRatioPct(R26)}%)됩니다.
          </p>
          <Callout tone="note" title="2026년 국민연금 인상 배경">
            2025년 국민연금법 개정으로 2026년부터 보험료율이 기존 {R25.pension.total}%(근로자 {R25.pension.employee}%)에서{' '}
            {R26.pension.total}%(근로자 {R26.pension.employee}%)로 올랐습니다. 1998년 이후 28년 만의 인상이며,
            기금 소진 시점을 늦추기 위해 2033년까지 매년 0.5%p씩 올려 13%에 도달합니다.
          </Callout>
        </section>

        {/* ── 3. 비과세 항목 (기존 유지·확장) ── */}
        <section>
          <h2 className="g-h2">주요 비과세 급여 항목</h2>
          <p className="g-p">
            비과세 수당은 4대보험료와 근로소득세 산정 기준에서 제외됩니다. 같은 연봉이라도 일부를 비과세 명목으로 받으면 공제가 줄어 실수령이 늘어나고, 계산기의 「비과세」 칸이 바로 이 효과를 반영합니다. 단, 회사가 해당 명목으로 따로 지급하고 요건을 갖춰야 하며, 근로자가 임의로 비과세로 처리할 수는 없습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '비과세 한도', '주요 요건'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { title: '식대',           limit: '월 20만원 이내',  desc: '회사가 식사를 따로 제공하지 않고 식대로 지급할 때' },
                  { title: '자가운전보조금', limit: '월 20만원 이내',  desc: '본인 차량을 업무에 쓰고 실제 여비 대신 받는 경우' },
                  { title: '출산·보육수당', limit: '자녀 1명당 월 20만원 이내', desc: '과세기간 개시일 기준 6세 이하 자녀의 보육 관련 수당 — 한도는 자녀별로 적용' },
                  { title: '연구보조비',     limit: '월 20만원 이내',  desc: '연구기관·기업부설연구소 연구원 등 한정' },
                  { title: '생산직 야간수당', limit: '연 240만원 이내', desc: '월정액급여 260만원 이하 · 직전 연도 총급여 3,700만원 이하 (2026년 개정)' },
                  { title: '취재수당',       limit: '월 20만원 이내',  desc: '기자 등 취재 업무 직원' },
                ].map((item, i) => (
                  <tr key={item.title} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.title}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.limit}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            비과세로 늘어나는 실수령은 연봉(한계세율)에 따라 다릅니다. 부양가족 1인·세전 연봉은 그대로 두고 일부만 비과세로 바꿨을 때를 계산기 엔진으로 구했습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['세전 연봉', '식대 20만 비과세 (월)', '월 60만 비과세 (월)', '월 60만 비과세 (연)'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NT_ROWS.map((r, i) => (
                  <tr key={r.y} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{formatEok(r.y)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>+{wonR(r.d20)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>+{wonR(r.d60)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>+{manR(r.d60 * 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. 소득세 누진 구간 ── */}
        <section>
          <h2 className="g-h2">
            소득세 (근로소득 간이세액표) — 누진 구간
          </h2>
          <p className="g-p">
            회사는 매월 근로소득 간이세액표로 원천징수하고 연말정산으로 정산합니다. 이 계산기는 표를 칸 단위로 찾지 않고 연 결정세액을 12로 나눠 근사합니다.
            순서는 ① 총급여에서 근로소득공제를 빼 근로소득금액을 구하고 ② 본인·부양가족 기본공제(1인당 150만원)와 국민연금·건강·고용보험료 공제를 빼 과세표준을 만든 뒤 ③ 아래 세율표로 산출세액을 계산하고 ④ 근로소득세액공제·자녀세액공제를 빼는 방식입니다. 지방소득세는 소득세의 {Math.round(LOCAL_INCOME_TAX_RATIO * 100)}%가 별도로 붙습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>과세표준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700 }}>세율</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right',  color: 'var(--muted)', fontWeight: 500 }}>누진공제</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right',  color: 'var(--muted)', fontWeight: 500 }}>지방세 포함</th>
                </tr>
              </thead>
              <tbody>
                {BRACKETS_2026.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{bracketLabel(i)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{Math.round(b.rate * 100)}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{b.deduction ? `${(b.deduction / 10_000).toLocaleString('ko-KR')}만원` : '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{(b.rate * (1 + LOCAL_INCOME_TAX_RATIO) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 산출세액 = 과세표준 × 세율 − 누진공제 (소득세법 §55). 예: 과세표준 3,000만원 → 3,000만 × 15% − 126만 = 324만원. 본 도구의 소득세는 간이세액표 근사(연 결정세액÷12) 추정 — 실제 연말정산은 의료비·기부금·신용카드 등 추가 공제로 달라집니다.
          </p>
        </section>

        {/* ── 5. 월 실수령 역산 ── */}
        <section>
          <h2 className="g-h2">
            월 실수령 역산 — 연봉 협상 활용
          </h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>&lsquo;월 300만원 받으려면 연봉 얼마?&rsquo;</strong> — 1인 가구·식대 미적용 기준 추정 —
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>월 실수령 목표</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>필요 세전 연봉</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {NET_TARGETS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{formatEok(r.targetNetMonthly)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>약 {formatEok(r.grossYearly)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{NET_TARGET_NOTES[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구의 <strong style={{ color: 'var(--text)' }}>[역산] 탭</strong>에서 본인 부양가족·비과세 조건으로 정확한 역산이 가능합니다. 이직·연봉 협상 시 본인이 원하는 월 실수령을 기준으로 시작 금액을 결정하세요.
          </p>
        </section>

        {/* ── 6. 시급·체감 시급 ── */}
        <section>
          <h2 className="g-h2">
            시급·체감 시급
          </h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>세전 시급</strong> = 연봉 ÷ (12개월 × 209시간) — 한국 표준은 주 40시간 + 주휴 포함 209시간/월. 연봉 4,000만원 기준 {wonR(HW.baseHourlyGross)}.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: '세전 시급', desc: '공식 시급 — 연봉 ÷ (12 × 209h)', color: 'var(--muted)' },
              { name: '세후 시급', desc: `실수령 ÷ 209h — 연봉 4,000만원이면 세전의 ${H40.takeHomeRate.toFixed(0)}% (${wonR(HW.baseHourlyNet)})`, color: 'var(--accent-ink)' },
              { name: '야근 포함', desc: `실수령 ÷ (근무 + 야근) — 주 5시간 야근이면 ${wonR(HW.realHourlyNet)}`, color: 'var(--yellow-700)' },
              { name: '체감 (출퇴근 포함)', desc: `실수령 ÷ 총 노동 시간 — 야근 없이 왕복 90분만 더해도 약 ${COMMUTE90_DROP.toFixed(0)}% ↓`, color: 'var(--warning)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${m.color} 25%, transparent)`, borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 3 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>참고</strong> — 2026년 최저시급 {MIN_HOURLY_WAGE[2026].toLocaleString('ko-KR')}원 / 연간 노동시간은 최근 OECD 통계 기준 한국 1,800시간대, OECD 평균 약 1,750시간(연도별 변동). 왕복 출퇴근 2시간 이상 직장은 체감 시급이 최저시급 수준에 근접할 수 있습니다.
          </p>
        </section>

        {/* ── 7. 연봉별 실수령률 ── */}
        <section>
          <h2 className="g-h2">
            연봉별 실수령률 — 누진 구조
          </h2>
          <p className="g-p">
            세전 대비 실수령률은 누진 세율로 고연봉일수록 낮아집니다 (1인 가구·식대 미적용 추정).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>세전 연봉</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>실수령률</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 실수령 (참고)</th>
                </tr>
              </thead>
              <tbody>
                {RATE_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{formatEok(r.grossYearly)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>약 {r.takeHomeRate.toFixed(0)}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>약 {formatEok(r.netMonthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 8. 한국 직장인 연봉 분포 ── */}
        <section>
          <h2 className="g-h2">
            한국 직장인 연봉 분포 — 국세청 2024년 귀속 기준
          </h2>
          <p className="g-p">
            국세청이 2025년 12월 공표한 <strong style={{ color: 'var(--text)' }}>2024년 귀속 연말정산 국세통계</strong> 기준, 연말정산 신고 근로자 2,108만명의 1인당 평균 총급여는 <strong style={{ color: 'var(--text)' }}>4,475만원</strong>입니다.
            반면 중위값은 약 3,400만원으로 평균보다 1,000만원 이상 낮습니다 — 상위 1%(21.1만명) 평균이 3억4,630만원, 최상위 0.1% 구간 평균이 9억9,937만원에 이를 만큼 상위 소득이 평균을 끌어올리는 구조라, 연봉이 &lsquo;평균 이하&rsquo;여도 전체 근로자의 절반보다 높을 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
            {[
              { name: '평균 총급여',        value: '4,475만원',          sub: '전년 대비 +143만원' },
              { name: '중위 총급여',        value: '약 3,400만원',       sub: '경계 3,360만~3,420만원' },
              { name: '상위 10% 진입선',    value: '약 8,800만~9,100만', sub: '상위 10% 구간 평균 9,117만원' },
              { name: '상위 5% 진입선',     value: '약 1.11억~1.2억',    sub: '상위 5% 구간 평균 1억1,984만원' },
              { name: '상위 1% 평균',       value: '3억4,630만원',       sub: '21.1만명' },
              { name: '억대 연봉(1억 초과)', value: '154만명 · 7.3%',    sub: '전년 대비 +15만명' },
              { name: '대졸 정규직 초임 평균', value: '3,675만원',        sub: '300인 이상 5,001만원 (2023년)' },
              { name: '대기업 vs 중소 (월)', value: '613만 vs 307만원',  sub: '격차 약 2배 (2024.12월 기준)' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.name}</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{p.value}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.sub}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            출처 — 평균·중위·상위 진입선·억대 연봉: <strong style={{ color: 'var(--text)' }}>국세청 2024년 귀속 연말정산 국세통계(2025-12 공표)</strong> 및 공공데이터포털 &lsquo;근로소득 백분위(천분위)&rsquo; 원자료. 진입선은 인접 백분위 구간 평균 사이의 경계 범위입니다.
            대졸 초임: 한국경영자총협회 &lsquo;우리나라 대졸 초임 분석&rsquo;(고용노동부 임금 통계 원자료, 2023년 기준·초과급여 제외) — 규모별 격차가 커서 5인 미만은 연 2,731만원(300인 이상의 54.6%)입니다.
            대기업·중소기업: 통계청(국가데이터처) 임금근로일자리 소득(2024년 12월 기준) 월평균 소득 — 단순 연 환산 시 약 7,356만원 vs 3,684만원. 본 도구의 <strong style={{ color: 'var(--text)' }}>[실수령액] 탭</strong>에서 본인 연봉의 분포 위치를 자동으로 표시합니다.
          </p>
        </section>

        {/* ── 9. FAQ (accordion) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 ── */}
        <section>
          <Disclaimer variant="finance" open>
            본 계산기는 <strong>2026년 4대보험 요율과 간이세액표 근사(연 결정세액÷12)에 따른 추정</strong>입니다. 법적 효력 X.
            실제 급여는 회사별 비과세 항목·복지, 상여금·성과급, 부양가족 정확한 정보, 연말정산 결과, 두루누리 사회보험 지원 등에 따라 차이날 수 있습니다.
            정확한 급여명세서·연말정산은 회사 인사팀 또는 세무사 상담을 권장합니다.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',    desc: '월 실수령으로 감당 가능한 대출' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',        desc: '월급 일부 투자 시 미래 자산' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기', desc: '급여 투자 후 평단가 관리' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',      desc: '사업소득 세금 계산' },
              { href: '/tools/life/dutch',       icon: '🍻', name: '더치페이 계산기',    desc: '회식·모임 정산' },
              { href: '/tools/finance/car-cost', icon: '🚗', name: '자동차 유지비 계산기', desc: '월 차량 운영비' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
