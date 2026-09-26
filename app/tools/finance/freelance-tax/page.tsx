import Link from 'next/link'
import FreelanceTaxClient from './FreelanceTaxClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import {
  EXPENSE_RATES, INDUSTRIES, SIMPLE_EXCESS_THRESHOLD, simpleExcessRate, calculate, buildScenarios, yellowUmbrellaLimit,
  type CalcInputs,
} from './freelanceTaxUtils'
import { BRACKETS_2026, progressiveTax } from '@/lib/krIncomeTax'
import { HUMAN_SERVICE_SIMPLE_LIMIT, HUMAN_SERVICE_BOOK_THRESHOLD } from '@/lib/krExpenseRates'
import { childTaxCredit } from '@/lib/krYearEndTax'
import ToolPage from '@/components/ToolPage'

/* 경비율 표 — 계산기와 같은 단일 표(EXPENSE_RATES)에서 렌더 */
const RATE_ROWS = Object.values(EXPENSE_RATES).map((r) => ({
  ...r,
  jobs: INDUSTRIES.filter((i) => i.code === r.code).map((i) => i.name).join('·'),
}))

/* ── 가이드 수치 — 계산기와 같은 함수로 빌드 시 계산 ── */
const krw = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/** 만 원 단위 (소수 1자리, 예: 51.1만) */
const man = (n: number) => `${(Math.round(n / 1_000) / 10).toLocaleString('ko-KR')}만`
const manInt = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만`
const bracketLabel = (i: number) => {
  const b = BRACKETS_2026[i]
  const lo = i === 0 ? 0 : BRACKETS_2026[i - 1].upTo
  const f = (n: number) => (n >= 100_000_000 ? `${n / 100_000_000}억` : `${(n / 10_000).toLocaleString('ko-KR')}만`)
  if (i === 0) return `${f(b.upTo)} 원 이하`
  if (!Number.isFinite(b.upTo)) return `${f(lo)} 원 초과`
  return `${f(lo)} 초과 ~ ${f(b.upTo)} 이하`
}

/** 계산기 기본 입력값 (FreelanceTaxClient DEFAULT_INPUTS와 동일) */
const DEF: CalcInputs = {
  revenue: 60_000_000, industryId: 'developer', expenseMode: 'simple', bookExpenses: 0, isNewBusiness: false,
  customRates: false, customSimpleRate: 0, customBaseRate: 0, spouseExempt: false, dependents: 0, pensionPaid: 0,
  yellowUmbrella: 0, pensionSavings: 0, donations: 0, useStandard: true, prevYearWithholding: 0, withholdingMode: 'auto',
}
const D = calculate(DEF)
const SCEN = buildScenarios(DEF)
const D_NEW = calculate({ ...DEF, isNewBusiness: true })

/* 매출별 결과 — 기타 인적용역(940909), 계속사업자, 공제는 본인 기본공제 + 표준세액공제만 */
const OTHER = { ...DEF, industryId: 'other' }
/* 한도는 '미만'(소득세법 시행령 §143④) — 정확히 3,600만이면 이미 기준경비율 */
const REV_ROWS = [10_000_000, 20_000_000, 30_000_000, HUMAN_SERVICE_SIMPLE_LIMIT - 1_000_000, HUMAN_SERVICE_SIMPLE_LIMIT, 50_000_000]
  .map(rev => ({ rev, r: calculate({ ...OTHER, revenue: rev }) }))
const UNDER_LIMIT = REV_ROWS[3]
const AT_LIMIT = REV_ROWS[4]
const OTHER_RATE = EXPENSE_RATES['940909']
/* 복식부기의무자(계속사업자 7,500만 이상) 추계 — 기준경비율의 1/2 (§143③1호) */
const BOOK_REQ_REV = 100_000_000
const BOOK_REQ = calculate({ ...OTHER, revenue: BOOK_REQ_REV })

/* 겸업 예시 — 근로소득 과세표준 4,800만 + 부업 사업소득금액 1,000만 */
const JOB_BASE = 48_000_000
const SIDE_INCOME = 10_000_000
const SIDE_EXTRA_TAX = (progressiveTax(JOB_BASE + SIDE_INCOME) - progressiveTax(JOB_BASE)) * 1.1

export const metadata = buildMetadata({
  path: '/tools/finance/freelance-tax',
  title: '프리랜서 종합소득세 계산기 — 단순경비율 자동 + 공제 시뮬 + 시나리오 비교 (2026년)',
  description:
    '국세청 고시 업종별 단순경비율 자동 적용 + 8단계 누진세율과 노란우산·연금저축 절세 시나리오 5종 비교. 2026년 5월 신고 D-day.',
  keywords: [
    '프리랜서 종합소득세', '종소세 계산기', '종합소득세 환급',
    '3.3 원천징수', '프리랜서 세금', '프리랜서 환급',
    '단순경비율', '기준경비율', '경비처리', '필요경비',
    '노란우산공제', '연금저축 세액공제', 'IRP',
    '종합소득세율', '누진세율', '한계세율', '실효세율',
    '5월 종소세 신고', '홈택스 종소세', '모두채움 신고',
    'IT개발자 종소세', '디자이너 종소세', '유튜버 종소세',
    '강사 종소세', '학원강사 종소세', '번역가 종소세',
    '소득공제', '세액공제', '인적공제',
    '복식부기 의무', '간편장부', '장부작성',
    '지방소득세', '가산세', '무신고 가산세',
    '부업 프리랜서', '직장인 부업 종소세', '겸업 신고',
    '2026년 종합소득세', '프리랜서 절세',
  ],
})

const dedTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const relCard: React.CSSProperties = { display: 'block', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none' }

const FAQ_LD = [
  { q: '3.3% 원천징수만 내면 되는 거 아닌가요?', a: '아닙니다. 3.3%(소득세 3% + 지방소득세 0.3%)는 <strong>미리 떼어 둔 세금</strong>일 뿐이고, 진짜 세금은 다음 해 5월 종합소득세 신고로 정산합니다. 경비와 공제를 반영한 실제 세액(6~45% 누진)이 3.3%보다 적으면 <strong style="color:var(--success)">환급</strong>, 많으면 <strong style="color:var(--danger)">추가 납부</strong>입니다. 매출이 작고 단순경비율을 적용받는 경우는 대개 환급이, 매출이 커서 기준경비율로 넘어가거나 한계세율이 24% 이상이면 추가 납부가 흔합니다.' },
  { q: '단순경비율과 장부 작성, 어느 게 유리한가요?', a: `<strong>실제 경비가 단순경비율로 인정되는 경비보다 크면 장부, 적으면 단순경비율</strong>이 유리합니다. 예: IT 개발자(단순경비율 ${EXPENSE_RATES['940926'].simpleRate}%) 매출 3천만 원 → 경비 ${manInt(30_000_000 * EXPENSE_RATES['940926'].simpleRate / 100)} 원이 자동 인정됩니다. 장비·소프트웨어·작업실에 실제로 2,500만 원을 썼다면 장부로 경비를 더 인정받습니다. 다만 장부에는 영수증·세금계산서·카드전표 같은 증빙 보관이 필요합니다. 단순경비율은 <strong>직전 연도 수입이 인적용역 ${manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원 미만</strong>인 계속사업자, 또는 수입이 복식부기 의무 기준(인적용역 ${manInt(HUMAN_SERVICE_BOOK_THRESHOLD)} 원) 미만인 신규사업자에게만 적용됩니다. 단순경비율로 신고하는 사람의 올해 수입이 ${manInt(SIMPLE_EXCESS_THRESHOLD)} 원을 넘으면(신규사업자, 또는 직전 연도 ${manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원 미만이었던 계속사업자) 초과분에는 더 낮은 초과율(IT 개발자 ${EXPENSE_RATES['940926'].simpleRate}% → ${simpleExcessRate(EXPENSE_RATES['940926'].simpleRate)}%)이 붙습니다.` },
  { q: '노란우산공제 vs 연금저축, 뭐가 절세 효과가 큰가요?', a: '<strong>본인 한계세율에 따라 다릅니다.</strong><ul style="margin:8px 0;padding-left:18px"><li><strong>노란우산</strong>은 소득공제라 넣은 돈 × 한계세율만큼 줄어듭니다. 한계세율 24%면 200만 원 납입 시 약 53만 원(지방세 포함).</li><li><strong>연금저축</strong>은 세액공제라 한계세율과 무관하게 종합소득금액 4,500만 원 이하 16.5%, 초과 13.2%(지방세 포함)입니다. 600만 원 납입 시 79만~99만 원.</li></ul>한계세율이 24% 이상이면 같은 돈을 넣었을 때 노란우산의 절세율(26.4%)이 더 크고, 6% 구간이면 연금저축이 유리합니다. 15% 구간은 종합소득금액이 4,500만 원 이하일 때 둘 다 16.5%로 같습니다. 두 상품은 함께 가입할 수 있고 한도도 따로라서, 여유가 있으면 둘 다 채우는 것이 가장 큽니다. 계산기 「시나리오 비교」 탭에서 본인 수치로 확인하세요.' },
  { q: '직장인 + 부업 프리랜서, 합산 신고 어떻게 하나요?', a: `근로소득과 사업소득은 <strong>합산해 종합과세</strong>됩니다. 회사에서 연말정산을 마쳤어도 부업 사업소득이 있으면 5월에 종합소득세를 신고해야 합니다. 부업 소득은 본업 소득 위에 쌓이므로 본업의 한계세율부터 적용됩니다. 예를 들어 근로소득 과세표준이 ${manInt(JOB_BASE)} 원인 사람이 부업으로 사업소득금액(매출 − 경비) ${manInt(SIDE_INCOME)} 원을 더하면, 합산 과세표준 ${manInt(JOB_BASE + SIDE_INCOME)} 원 중 5,000만 원 초과분은 24% 구간이라 세금이 지방세 포함 약 ${manInt(SIDE_EXTRA_TAX)} 원 늘어납니다. 부업 매출에서 떼인 3.3%로는 이만큼을 채우지 못해 <strong style="color:var(--danger)">추가 납부</strong>가 생기기 쉽습니다. 본 계산기는 사업소득 단독 기준이므로, 겸업자는 홈택스 신고 화면의 근로소득 불러오기로 합산해 확인하세요.` },
  { q: '신고 안 하면 어떻게 되나요?', a: '기한 내에 신고하지 않으면 다음 가산세가 붙습니다.<ul style="margin:8px 0;padding-left:18px"><li><strong>무신고 가산세</strong>: 납부세액의 20%(부정 무신고 40%). 복식부기의무자는 수입금액의 0.07%와 비교해 큰 금액</li><li><strong>납부지연 가산세</strong>: 미납세액 × 하루 0.022%(연 약 8%)</li><li><strong>무기장 가산세</strong>: 장부를 쓰지 않은 사업자에게 산출세액의 20% — 신규사업자와 직전 연도 수입 4,800만 원 미만 소규모사업자는 제외</li></ul>또한 환급 대상이었어도 신고하지 않으면 환급을 받지 못합니다(기한 후 신고나 경정청구로 5년 안에 되찾을 수는 있습니다). 5월 신고 의무는 매출 규모와 무관하게 사업소득이 있는 사람 모두에게 있습니다.' },
  { q: '종소세 신고하면 건강보험료가 오른다는데?', a: '<strong>지역가입자</strong>는 종합소득세 신고로 확정된 소득이 그해 11월부터 1년간 건강보험료 산정에 반영됩니다. 매출이 크게 늘어난 해의 다음 해 11월에 보험료가 오르는 이유입니다. 다만 건보료는 매출이 아니라 <strong>소득금액(매출 − 경비)</strong> 기준이라, 장부로 경비를 제대로 인정받으면 보험료 부담도 함께 줄어듭니다. 직장가입자는 월급 외 소득(사업·이자·배당 등 합계)이 연 2,000만 원을 넘을 때만 그 초과분에 소득월액보험료가 추가로 붙습니다.' },
  { q: '장부 작성 의무는 언제부터 생기나요?', a: `직전 연도 수입금액으로 정해집니다.<ul style="margin:8px 0;padding-left:18px"><li><strong>간편장부대상자</strong>: 인적용역·서비스업 직전 연도 수입 ${manInt(HUMAN_SERVICE_BOOK_THRESHOLD)} 원 미만 (신규사업자 포함)</li><li><strong>복식부기의무자</strong>: 인적용역·부동산임대 ${manInt(HUMAN_SERVICE_BOOK_THRESHOLD)} 원 이상 / 제조·음식·숙박 1억 5천만 원 이상 / 도소매 등 3억 원 이상. 변호사·세무사 같은 전문직은 수입과 무관하게 복식부기의무자</li></ul>장부를 안 쓰면 추계(경비율)로 신고하게 되는데, 복식부기의무자는 기준경비율의 2분의 1만 적용한 소득금액과 단순경비율 소득금액의 3.4배 중 작은 금액으로 계산되고(간편장부대상자는 기준경비율 전액과 2.8배 비교) 무기장 가산세가 붙습니다. 간편장부대상자가 복식부기로 장부를 쓰면 기장세액공제(산출세액의 20%, 100만 원 한도)도 받을 수 있습니다.` },
  { q: '수입이 많아지면 세무사를 써야 하나요?', a: '법으로 세무사 선임이 강제되는 경우는 <strong>성실신고확인대상자</strong>입니다. 해당 연도 수입금액이 인적용역·서비스업 5억 원, 제조·음식·숙박업 7억 5천만 원, 도소매업 등 15억 원 이상이면 세무사 등의 확인을 받아 6월 30일까지 신고해야 합니다. 그보다 작더라도 수입이 복식부기 기준을 넘으면 장부 작성과 결산이 필요해져 세무사를 쓰는 경우가 많고, 경비 인정 범위를 두고 판단이 필요한 항목(차량·주거 겸용 작업실·가족 인건비 등)이 있을 때도 상담 실익이 큽니다. 계산기로 대략의 세액과 한계세율을 먼저 확인해 두면 상담 비용 대비 효과를 가늠하기 쉽습니다.' },
]

export default function FreelanceTaxPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/freelance-tax">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />프리랜서 종합소득세 계산기
      </h1>
      <p className="tp-lead">
        업종별 단순경비율·8단계 누진세 자동 + <strong style={{ color: 'var(--text)' }}>노란우산·연금 절세 시나리오</strong> 5종 비교.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 종합소득세율 · 국세청 2024년 귀속 경비율 고시 기준" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스 기준(단순)경비율 조회","href":"https://hometax.go.kr"},{"label":"국가법령정보센터 소득세법","href":"https://www.law.go.kr/법령/소득세법"},{"label":"국가법령정보센터 조세특례제한법","href":"https://www.law.go.kr/법령/조세특례제한법"}]} />

      <FreelanceTaxClient />

      <GuideDivider />

      {/* 1. 계산 흐름 */}
      <h2 className="g-h2">계산기는 이렇게 계산합니다</h2>
      <p className="g-p">
        종합소득세는 &lsquo;매출에서 경비를 빼고, 공제를 빼고, 세율을 곱하고, 세액공제를 뺀 뒤, 이미 떼인 3.3%와 비교하는&rsquo; 다섯 단계로 계산됩니다. 계산기도 같은 순서를 따릅니다.
      </p>
      <ol className="g-list">
        <li><strong>사업소득금액</strong> = 매출 − 필요경비. 장부가 없으면 업종별 단순경비율(또는 기준경비율)로 경비를 추정합니다.</li>
        <li><strong>과세표준</strong> = 사업소득금액 − 종합소득공제(본인·부양가족 1명당 150만 원, 국민연금 납부액, 노란우산공제).</li>
        <li><strong>산출세액</strong> = 과세표준 × 세율 − 누진공제(아래 세율표).</li>
        <li><strong>결정세액</strong> = 산출세액 − 세액공제(연금저축, 표준세액공제 7만 원 등). 여기에 지방소득세 10%가 붙습니다.</li>
        <li><strong>환급·추가납부</strong> = 1년간 원천징수된 3.3% − (결정세액 + 지방소득세).</li>
      </ol>
      <p className="g-p">
        기본값(IT 개발자, 매출 {manInt(DEF.revenue)} 원, 계속사업자)은 매출이 단순경비율 한도({manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원)를 넘어 기준경비율 {D.expenseRate}%로 경비 {krw(D.expenseAmount)}만 인정됩니다. 사업소득금액 {krw(D.businessIncome)}에서 본인 공제 150만 원을 빼면 과세표준 {krw(D.taxableBase)}, 세금은 지방세 포함 {krw(D.totalTax)}이고, 3.3%로 떼인 {krw(DEF.revenue * 0.033)}보다 많아 <strong>추가 납부액이 {krw(-D.refund)}</strong>입니다. 같은 매출이라도 개업 첫해 신규사업자라면 단순경비율이 적용돼 세금이 {krw(D_NEW.totalTax)}까지 줄어듭니다.
      </p>

      {/* 2. 3,600만 원 경계 */}
      <h2 className="g-h2">매출 {manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원 경계에서 세금이 뛰는 이유</h2>
      <p className="g-p">
        인적용역 계속사업자는 직전 연도 수입이 {manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원 미만이면 단순경비율로, 그 이상이면 기준경비율로 경비를 추정합니다. 기준경비율은 매입비·임차료·인건비 같은 주요경비를 증빙으로 따로 인정받는 것을 전제로 한 낮은 비율이라, 증빙할 주요경비가 거의 없는 프리랜서는 경비가 확 줄어듭니다. 아래는 기타 인적용역(940909, 단순 {OTHER_RATE.simpleRate}% · 기준 {OTHER_RATE.baseRate}%)에 본인 공제와 표준세액공제만 적용한 계산기 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>연 매출</th>
              <th scope="col" style={th}>경비 방식</th>
              <th scope="col" style={thR}>인정 경비</th>
              <th scope="col" style={thR}>세금 (지방세 포함)</th>
              <th scope="col" style={thR}>3.3% 원천징수</th>
              <th scope="col" style={thR}>환급(+) / 추가납부(−)</th>
            </tr>
          </thead>
          <tbody>
            {REV_ROWS.map(({ rev, r }, i) => (
              <tr key={rev} style={rowStyle(i)}>
                <td style={td}>{manInt(rev)} 원</td>
                <td style={tdMuted}>{r.canUseSimple ? '단순경비율' : '기준경비율'}</td>
                <td style={tdR}>{krw(r.expenseAmount)}</td>
                <td style={tdR}>{krw(r.totalTax)}</td>
                <td style={tdR}>{krw(rev * 0.033)}</td>
                <td style={{ ...tdR, fontWeight: 700, color: r.refund >= 0 ? 'var(--success)' : 'var(--danger)' }}>{r.refund >= 0 ? '+' : '−'}{krw(Math.abs(r.refund))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        매출이 {manInt(UNDER_LIMIT.rev)} 원에서 {manInt(AT_LIMIT.rev)} 원으로 100만 원 늘었을 뿐인데, 결과는 {man(UNDER_LIMIT.r.refund)} 원 환급에서 {man(-AT_LIMIT.r.refund)} 원 추가 납부로 바뀝니다. 한도는 &lsquo;{manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원 미만&rsquo;이라 정확히 {manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 원이면 이미 기준경비율 대상입니다. 이 구간에 있다면 실제 경비가 기준경비율 추정치(매출의 {OTHER_RATE.baseRate}%, 증빙한 주요경비가 있으면 그만큼 추가)보다 많은지 따져 보고, 많다면 간편장부로 실제 경비를 인정받는 편이 유리합니다. 직전 연도 수입이 4,800만 원 미만이면 추계로 신고해도 무기장 가산세는 붙지 않습니다. 단순경비율 판정은 <strong>직전 연도</strong> 수입 기준이라 올해 처음 기준을 넘었다면 다음 해 신고부터 영향을 받는데, 계산기는 보수적으로 입력한 매출을 직전 연도 수입으로도 간주해 판정합니다. 매출이 {manInt(HUMAN_SERVICE_BOOK_THRESHOLD)} 원 이상인 계속사업자(복식부기의무자)는 추계 신고 때 기준경비율의 절반만 인정되므로, 같은 업종 매출 {manInt(BOOK_REQ_REV)} 원이면 추정 경비가 {krw(BOOK_REQ.expenseAmount)}(매출의 {BOOK_REQ.expenseRate}%)에 그치고 세금은 지방세 포함 {krw(BOOK_REQ.totalTax)}입니다.
      </p>
      <Callout tone="tip" title="장부를 쓰면 얼마나 달라지나">
        계산기 「시나리오 비교」 탭의 기본값에서 실제 경비가 매출의 70%라고 장부로 신고하면 세금이 {krw(SCEN[4].result.totalTax)}이 되어, 추정 신고({krw(SCEN[0].result.totalTax)})보다 {krw(SCEN[0].result.totalTax - SCEN[4].result.totalTax)} 줄어듭니다. 경비율이 높은 업종이 아니어도 장비·소프트웨어·통신비·작업 공간 비용을 증빙으로 모아 두면 차이가 큽니다.
      </Callout>

      {/* 3. 누진세율 표 */}
      <h2 className="g-h2">종합소득세율 (8단계 누진세율)</h2>
      <p className="g-p">
        과세표준 구간별로 6%부터 45%까지 누진 적용됩니다(소득세법 §55). 누진공제는 구간마다 세율을 나눠 곱하는 대신 한 번에 계산하기 위한 값입니다. 절세 상품의 효과를 따지려면 본인 과세표준이 어느 구간에 있는지, 즉 <strong>한계세율</strong>부터 알아야 합니다.
      </p>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['과세표준', '세율', '누진공제', '지방세 포함 한계세율'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRACKETS_2026.map((b, i) => (
              <tr key={i} style={rowStyle(i)}>
                <td style={td}>{bracketLabel(i)}</td>
                <td style={{ ...td, fontWeight: 700 }}>{Math.round(b.rate * 100)}%</td>
                <td style={tdMuted}>{b.deduction ? `${manInt(b.deduction)} 원` : '—'}</td>
                <td style={tdMuted}>{(b.rate * 110).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 산출세액 = 과세표준 × 세율 − 누진공제. 예: 과세표준 4,000만 원 → 4,000만 × 15% − 126만 = {krw(progressiveTax(40_000_000))}. 지방소득세는 결정세액의 10%가 별도로 붙습니다.
      </p>

      {/* 4. 단순경비율 */}
      <h2 className="g-h2">업종별 단순경비율 (인기 직군)</h2>
      <p className="g-p">
        장부를 작성하지 않은 프리랜서는 국세청이 매년 고시하는 업종별 경비율로 필요경비를 추정합니다. 아래 한도는 <strong>계속사업자(직전 연도 수입) 기준</strong>이며, <strong>신규사업자는 복식부기 의무 기준(인적용역 {manInt(HUMAN_SERVICE_BOOK_THRESHOLD)} 원) 미만</strong>까지 단순경비율을 쓸 수 있습니다. 같은 직군이라도 홈택스에 등록된 업종코드에 따라 율이 다르니, 지급명세서나 사업자등록의 업종코드를 먼저 확인하세요.
      </p>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['업종코드·업종', '단순경비율', `${manInt(SIMPLE_EXCESS_THRESHOLD)} 초과분`, '기준경비율', '단순경비율 한도'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_ROWS.map((r, i) => (
              <tr key={r.code} style={rowStyle(i)}>
                <td style={td}>
                  {r.code} {r.name}
                  {r.jobs && <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>{r.jobs}</span>}
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{r.simpleRate.toFixed(1)}%</td>
                <td style={tdMuted}>{simpleExcessRate(r.simpleRate).toFixed(1)}%</td>
                <td style={tdMuted}>{r.baseRate.toFixed(1)}%</td>
                <td style={tdMuted}>{manInt(HUMAN_SERVICE_SIMPLE_LIMIT)} 미만</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 국세청 2024년 귀속 경비율 고시 기준(940100은 2023년 귀속 확인값). 경비율은 매년 3월 새 귀속연도분이 고시되니 신고 전 홈택스 「기준(단순)경비율 조회」로 확인하세요. 초과율 = 100 − (100 − 단순경비율) × 1.4. 목록에 없는 직군은 계산기에서 조회한 경비율을 직접 입력할 수 있습니다.
      </p>

      {/* 5. 공제 항목 */}
      <h2 className="g-h2">주요 소득공제·세액공제 항목</h2>
      <p className="g-p">
        소득공제는 과세표준을 줄여 <strong>한계세율만큼</strong> 세금을 줄이고, 세액공제는 세금 자체에서 <strong>정해진 비율만큼</strong> 뺍니다. 그래서 소득이 높을수록 소득공제의 가치가 커지고, 소득이 낮을수록 세액공제가 상대적으로 유리합니다. 근로자가 받는 건강보험료·주택자금·신용카드 소득공제와 보험료·의료비·교육비 세액공제는 사업소득자에게는 원칙적으로 적용되지 않는다는 점도 알아 두세요(성실사업자 요건을 갖추면 의료비·교육비 세액공제는 예외적으로 가능).
      </p>

      <h3 className="g-h3">소득공제</h3>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['항목', '한도', '효과'].map(h => (<th scope="col" key={h} style={th}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {[
              ['본인 인적공제', '150만', '한계세율만큼 절세'],
              ['배우자·부양가족', '1명당 150만', '연 소득금액 100만 원 이하 가족 — 한계세율 15%면 1명당 약 24.8만 원(지방세 포함)'],
              ['국민연금 (연금보험료공제)', '납부액 전액', '한계세율만큼 절세 — 지역 건강보험료는 소득공제 대상이 아니며 장부 신고 때 필요경비로 처리'],
              ['노란우산공제', `${manInt(yellowUmbrellaLimit(Infinity))}~${manInt(yellowUmbrellaLimit(0))}`, '소기업·소상공인 전용, 사업소득금액이 클수록 한도가 작아짐 (아래 표)'],
            ].map(([item, lim, effect], i) => (
              <tr key={i} style={rowStyle(i)}>
                <td style={{ ...td, fontWeight: 600 }}>{item}</td>
                <td style={tdMuted}>{lim}</td>
                <td style={tdMuted}>{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="g-h3">노란우산공제 소득공제 한도 (2025년 납입분부터)</h3>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['사업소득금액', '연 한도', '한계세율 15%', '24%', '35%'].map(h => (<th scope="col" key={h} style={th}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {[
              ['4,000만 원 이하', yellowUmbrellaLimit(40_000_000)],
              ['4,000만 원 초과 ~ 1억 원 이하', yellowUmbrellaLimit(100_000_000)],
              ['1억 원 초과', yellowUmbrellaLimit(100_000_001)],
            ].map(([label, lim], i) => (
              <tr key={i} style={rowStyle(i)}>
                <td style={td}>{label}</td>
                <td style={{ ...td, fontWeight: 700 }}>{manInt(Number(lim))} 원</td>
                <td style={tdMuted}>{man(Number(lim) * 0.165)} 원</td>
                <td style={tdMuted}>{man(Number(lim) * 0.264)} 원</td>
                <td style={tdMuted}>{man(Number(lim) * 0.385)} 원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="g-note">
        ※ 한도까지 넣었을 때 줄어드는 세금(지방소득세 포함). 한도는 사업소득금액(매출 − 경비) 기준이고, 절세액은 본인 과세표준이 속한 구간의 세율로 정해집니다.
      </p>

      <h3 className="g-h3">세액공제</h3>
      <div className="tableScroll">
        <table style={dedTable}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['항목', '한도', '효과'].map(h => (<th scope="col" key={h} style={th}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {[
              ['연금저축·IRP', '연금저축 600만 · IRP 합산 900만', '종합소득금액 4,500만 원 이하 16.5%, 초과 13.2% (지방세 포함) — 계산기는 연금저축 600만 원까지 반영'],
              ['기부금', '연말정산 사업소득자만', '15% (1천만 원 초과분 30%) — 사업소득만 있는 프리랜서는 세액공제 대신 장부 신고 시 필요경비로 처리'],
              ['표준세액공제', '7만원', '다른 특별세액공제를 받지 않는 사업소득자'],
              ['자녀세액공제 (계산기 미반영)', '8세 이상 자녀', `1명 ${manInt(childTaxCredit(1))} / 2명 ${manInt(childTaxCredit(2))} / 3명 ${manInt(childTaxCredit(3))} (이후 1명당 ${manInt(childTaxCredit(4) - childTaxCredit(3))} 추가)`],
            ].map(([item, lim, effect], i) => (
              <tr key={i} style={rowStyle(i)}>
                <td style={{ ...td, fontWeight: 600 }}>{item}</td>
                <td style={tdMuted}>{lim}</td>
                <td style={tdMuted}>{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. 신고 절차 */}
      <h2 className="g-h2">5월 종합소득세 신고 절차 요약</h2>
      <ol className="g-list">
        <li><strong>연중</strong>: 보수를 준 곳이 원천징수한 사업소득 내역을 매달 국세청에 제출(간이지급명세서)합니다. 경비 영수증·카드전표는 이때부터 모아 두세요.</li>
        <li><strong>3~4월</strong>: 홈택스에서 지급명세서 제출 내역과 수입금액을 확인하고, 빠진 거래처가 있으면 원천징수영수증을 요청합니다. 노란우산·연금저축 납입증명서와 부양가족 자료도 준비합니다.</li>
        <li><strong>5월 1~31일</strong>: 홈택스·손택스로 신고합니다. 단순경비율 대상이면 국세청이 미리 채워 둔 &lsquo;모두채움&rsquo; 신고서를 확인만 하고 제출할 수 있습니다.</li>
        <li><strong>5월 31일</strong>: 추가 납부가 있으면 이날까지 납부합니다(주말·공휴일이면 다음 영업일). 납부세액이 1,000만 원을 넘으면 일부를 2개월 뒤로 나눠 낼 수 있습니다.</li>
        <li><strong>6월 30일</strong>: 성실신고확인대상자의 신고·납부 기한.</li>
        <li><strong>6월 말 전후</strong>: 환급액이 신고 때 적은 계좌로 입금됩니다.</li>
        <li><strong>11월</strong>: 지역가입자라면 신고한 소득이 건강보험료에 반영됩니다.</li>
      </ol>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '국세청 종합소득세 안내(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '국세청 홈택스', href: 'https://hometax.go.kr/' },
          { label: '국가법령정보센터 소득세법', href: 'https://www.law.go.kr/법령/소득세법' },
        ]}
      >
        본 계산기는 단순경비율·기준경비율과 기본 공제를 단순화한 모델로 종합소득세를 추정하는 참고용 도구입니다. 실제 세액은 경비 인정 범위, 공제·감면 적용, 다른 소득과의 합산 여부에 따라 달라질 수 있으며, 실제 신고·납부는 홈택스 모두채움·모의계산 또는 세무사 확인을 거치세요.
      </Disclaimer>

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[
          { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기', desc: '본업 + 부업 합산 시 실수령' },
          { href: '/tools/finance/4-insurance', icon: '🏥', name: '4대보험 계산기',       desc: '국민연금·건강보험 부담액' },
          { href: '/tools/finance/vat',         icon: '🧾', name: '부가세 계산기',         desc: '과세사업자 부가세 (별개 세금)' },
          { href: '/tools/finance/severance',   icon: '💼', name: '퇴직금 실수령액 계산기', desc: '퇴직 후 프리랜서 전환 시' },
          { href: '/tools/finance/savings',     icon: '💰', name: '저축액 계산기',         desc: '환급액으로 절세 상품 시뮬' },
        ].map((t, i) => (
          <Link key={i} href={t.href} style={relCard}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
