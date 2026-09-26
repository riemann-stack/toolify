import Link from 'next/link'
import RentJeonseClient from './RentJeonseClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { compareAll, type CalcInputs } from './rentJeonseUtils'
import { RENT_LIMIT, RENT_RATE_LOW, RENT_RATE_HIGH, RENT_GROSS_CAP, PENSION_CREDIT_GROSS_CUT } from '@/lib/krYearEndTax'

/* ── 가이드 수치 — 계산기와 같은 함수로 빌드 시 계산 ── */
const krw = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
const manInt = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만`
const pct = (r: number) => `${Math.round(r * 100)}%`

/** 계산기 기본 입력값 (RentJeonseClient DEFAULT_INPUTS와 동일) */
const DEF: CalcInputs = {
  marketPrice: 1_000_000_000, jeonseDeposit: 600_000_000, jeonseLoanRatio: 50, jeonseLoanRate: 4.0,
  hugInsurance: true, hugRateBp: 12.8, jeonseLoanDeductionEligible: true,
  monthlyDeposit: 50_000_000, monthlyRent: 1_500_000, monthlyTaxCreditEligible: false, monthlyDepositLoanRate: 6.0,
  conversionRate: 4.5, semiJeonseRatio: 30, maintenance: 200_000, totalSalary: 50_000_000, ownCapital: 300_000_000,
  months: 36, expectedReturn: 4.0, annualRentIncrease: 5.0,
}
const BASE = compareAll(DEF)
const [J, M] = BASE.results
const LABEL = { jeonse: '전세', monthly: '월세', semi: '반전세' } as const
/** 월세 조건에 숨은 전환율 = 연 월세 ÷ (전세 보증금 − 월세 보증금) */
const IMPLIED_CONV = (DEF.monthlyRent * 12) / (DEF.jeonseDeposit - DEF.monthlyDeposit)

/* 민감도 — 기대수익률 × 전세대출 금리 (36개월 누적, 나머지 기본값) */
const ER_LIST = [1, 2, 3, 4, 5]
const LR_LIST = [2.5, 3, 3.5, 4, 5]
const SENS = ER_LIST.map(er => ({
  er,
  cells: LR_LIST.map(lr => {
    const r = compareAll({ ...DEF, expectedReturn: er, jeonseLoanRate: lr })
    return { best: r.best, gap: r.results[0].cumulativeCost - r.results[1].cumulativeCost }
  }),
}))

/* 손익분기 예시 — 월세 180만 원, 10년 거주 */
const BE_RENT = 1_800_000
const BE = compareAll({ ...DEF, monthlyRent: BE_RENT, months: 120 }).breakeven.jeonse_vs_monthly

/* 월세 세액공제 최대치 */
const RENT_CREDIT_MAX = RENT_LIMIT * RENT_RATE_LOW

export const metadata = buildMetadata({
  path: '/tools/finance/rent-jeonse',
  title: '월세·전세 비교 계산기 — 대출이자·기회비용·세액공제·손익분기점 시뮬 (2026년)',
  description:
    '전세·월세·반전세 3옵션 동시 비교. 대출이자·기회비용·세액공제 반영한 손익분기 + 전세사기 위험 점수와 HUG 보증보험료.',
  keywords: [
    '월세 전세 비교', '전세 월세 비교', '월세 vs 전세',
    '전월세 전환율', '반전세 계산', '반전세 시뮬',
    '전세대출 금리', '전세자금대출 이자', '버팀목 전세대출',
    '월세 세액공제', '월세 소득공제', '전세대출 소득공제',
    'HUG 전세보증보험', 'HUG 보증료',
    '전세사기', '깡통전세', '전세가율', '보증금 안전',
    '보증금 기회비용', '자기자본 운용',
    '손익분기점', '누적 비용 시뮬',
    '임대료 5% 인상', '계약갱신청구권', '주택임대차보호법',
    '확정일자', '전입신고', '우선변제권',
    '서울 전세 시세', '경기 전세 시세', '아파트 전세',
    '신혼 전세', '청년 전세대출', '2026년 전세',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

const FAQ_LD = [
  {
    q: '월세가 항상 비싼가요?',
    a: `아닙니다. 전세의 진짜 비용은 &lsquo;0원&rsquo;이 아니라 대출이자와, 보증금에 묶인 내 돈을 굴렸다면 얻었을 수익(기회비용)입니다. 계산기 기본값(보증금 6억 전세 vs 보증금 5천만·월세 150만)에서는 월세 조건에 숨은 전환율이 연 ${(IMPLIED_CONV * 100).toFixed(2)}%로 전세대출 금리(4%)보다 낮아, 36개월 누적 비용이 월세 ${manInt(M.cumulativeCost)} 원, 전세 ${manInt(J.cumulativeCost)} 원으로 월세가 쌉니다. 월세 세액공제 자격(무주택, 총급여 ${manInt(RENT_GROSS_CAP)} 원 이하)이 있거나 거주 기간이 짧을수록 월세 쪽이 더 유리해집니다.`,
  },
  {
    q: '전세대출 vs 신용대출, 어느 쪽이 좋나요?',
    a: '대부분 전세대출이 유리합니다. 전세대출은 주택도시보증공사(HUG)·한국주택금융공사(HF)·SGI서울보증 같은 보증기관의 보증서를 담보로 해서 신용대출보다 금리가 낮고 한도도 큽니다. 무주택 세대주인 근로자가 국민주택규모 주택을 빌리며 받은 전세대출이라면 원리금 상환액의 40%(연 400만 원 한도)를 소득공제받을 수도 있습니다. 소득·자산 요건을 충족하면 주택도시기금의 버팀목 전세자금이 시중은행보다 낮은 금리라 먼저 검토할 만합니다. 은행별 전세대출 금리는 은행연합회 소비자포털의 비교공시에서 확인하세요.',
  },
  {
    q: '월세 세액공제 받는 조건은?',
    a: `무주택 세대의 세대주(세대주가 주택 관련 공제를 받지 않으면 세대원도 가능)로서 총급여 ${manInt(RENT_GROSS_CAP)} 원 이하(종합소득금액 7,000만 원 이하)인 근로자가, 국민주택규모(85㎡) 이하 또는 기준시가 4억 원 이하 주택을 본인이나 배우자 명의로 계약하고 그 주소로 전입신고를 했어야 합니다. 연 월세 ${manInt(RENT_LIMIT)} 원 한도로 총급여 ${manInt(PENSION_CREDIT_GROSS_CUT)} 원 이하는 ${pct(RENT_RATE_LOW)}, 그 초과는 ${pct(RENT_RATE_HIGH)}를 세액공제해 최대 ${manInt(RENT_CREDIT_MAX)} 원까지 돌려받습니다. 연말정산 때 빠뜨렸다면 5월 종합소득세 신고나 경정청구로 받을 수 있습니다.`,
  },
  {
    q: '전세사기 안 당하는 5가지 핵심 체크는?',
    a: '① <strong>등기부등본 확인</strong> — 근저당·신탁·압류·가압류 여부(인터넷등기소에서 열람). ② <strong>전세가율 확인</strong> — 국토부 실거래가로 매매 시세를 확인해 보증금이 시세의 80%를 넘지 않는지. ③ <strong>HUG 등 전세보증금반환보증 가입 가능 여부</strong> — 가입이 안 되는 매물이면 위험 신호. ④ <strong>잔금일 당일 등기부 재확인 + 전입신고 + 확정일자</strong>. ⑤ <strong>임대인 신원 확인</strong> — 신분증과 등기부 명의 일치, 대리계약이면 위임장·인감증명서. 계약 전 임대인에게 국세·지방세 납세증명서와 선순위 보증금 정보를 요구할 수 있습니다.',
  },
  {
    q: '반전세는 언제 유리한가요?',
    a: '<strong>전세대출 한도가 부족</strong>한데 보증금이 큰 매물, <strong>전월세 전환율이 내 대출금리보다 낮을 때</strong>(예: 전환율 4% vs 대출 4.5%), <strong>보증금 위험을 줄이고 싶을 때</strong>(보증금이 작아지면 사고 시 손실도 줄어듦) 합리적입니다. 반대로 전환율이 대출금리보다 높으면 보증금을 월세로 돌릴수록 손해입니다. 계산기는 전세 보증금 중 입력한 비율을 전환율로 월세로 바꿔 반전세를 자동 계산하므로, 세 가지 누적 비용을 한 번에 비교할 수 있습니다.',
  },
  {
    q: '전월세 전환율이 뭔가요?',
    a: '보증금 일부를 월세로 바꿀 때 쓰는 연 이율입니다. 예: 보증금 1억을 월세로 바꾸며 5%를 적용하면 월 1억 × 5% ÷ 12 = 약 41.7만 원. 계약 기간 중이나 갱신 때 보증금을 월세로 바꾸는 경우 주택임대차보호법 §7조의2에 따라 <strong>연 10%와 한국은행 기준금리 + 연 2%p 중 낮은 비율</strong>을 넘을 수 없고, 넘는 부분은 무효입니다. 신규 계약에는 이 상한이 적용되지 않습니다. 지역·주택유형별 실제 전환율은 한국부동산원이 매달 공표합니다.',
  },
  {
    q: '보증금 기회비용은 어떻게 계산하나요?',
    a: `보증금에 묶인 내 돈을 다른 곳에 두었을 때 얻었을 수익입니다. 계산기는 자기자본 부분에 입력한 기대수익률을 곱해 월 비용으로 넣습니다. 기본값처럼 전세 보증금 6억 중 3억이 내 돈이고 기대수익률이 연 4%라면 월 ${krw(J.monthlyOpportunity)}을 포기하는 셈입니다. 예금 금리 수준(2~3%)을 넣을지, 주식 기대수익률을 넣을지에 따라 결론이 달라지므로 본인이 실제로 그 돈을 어디에 둘지를 기준으로 정하세요.`,
  },
  {
    q: '갱신청구권으로 5% 이상 인상 가능한가요?',
    a: '<strong>갱신청구권을 행사한 갱신</strong>이라면 보증금·월세 인상은 5% 이내입니다(지자체 조례로 더 낮출 수 있음). 반면 청구권을 쓰지 않고 <strong>합의로 재계약</strong>하면 5% 상한이 적용되지 않아 시세를 반영할 수 있고, 갱신청구권을 한 번 쓴 뒤의 <strong>신규 계약</strong>도 시세대로입니다. 임대인이나 그 직계존비속이 실제 거주하겠다며 거절할 수 있지만, 거절 후 다른 사람에게 세를 주면 임차인이 손해배상을 청구할 수 있습니다. 분쟁은 주택임대차분쟁조정위원회에서 조정받을 수 있습니다.',
  },
  {
    q: 'HUG 전세보증보험은 꼭 들어야 하나요?',
    a: '의무는 아니지만 <strong>강력히 권장</strong>됩니다. HUG 전세보증금반환보증은 계약이 끝났는데 집주인이 보증금을 돌려주지 않으면 HUG가 대신 돌려주고 집주인에게 받아 내는 상품입니다. 보증료는 보증금·주택유형·부채비율에 따라 연 0.1~0.2% 안팎(보증금 1억당 연 10만~20만 원 수준)입니다. 보증금이 수도권 7억 원·그 외 지역 5억 원 이하이고, 선순위 채권과 보증금 합계가 주택가격 산정액의 일정 비율(전세가율 90%) 이내여야 가입할 수 있어, 시세 대비 보증금이 높은 매물은 가입 자체가 안 됩니다. 신청은 계약기간의 절반이 지나기 전에 해야 하니 입주 직후 바로 가입하세요.',
  },
]

export default function RentJeonsePage() {
  return (
    <ToolPage width={880} slug="/tools/finance/rent-jeonse">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />월세·전세 비교 계산기
      </h1>
      <p className="tp-lead">
        전세·월세·반전세 3옵션 동시 비교. <strong style={{ color: 'var(--text)' }}>대출이자·기회비용·세액공제</strong> 반영한 손익분기.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 전월세·금리 참고 · 버팀목 대출은 주택도시기금 기준" sources={[{"label":"국토부 실거래가","href":"https://rt.molit.go.kr"},{"label":"한국부동산원","href":"https://www.reb.or.kr"},{"label":"주택도시기금","href":"https://nhuf.molit.go.kr"},{"label":"국가법령정보센터 주택임대차보호법","href":"https://www.law.go.kr/법령/주택임대차보호법"},{"label":"HUG 주택도시보증공사","href":"https://www.khug.or.kr"}]} />

      <RentJeonseClient />

      <GuideDivider />

      {/* 1. 계산 방식 + 기본값 예시 */}
      <h2 className="g-h2">계산기는 이렇게 비교합니다</h2>
      <p className="g-p">
        전세·월세·반전세를 공정하게 비교하려면 눈에 보이는 월세만이 아니라 <strong>돈이 묶이는 비용</strong>까지 같은 단위(월 비용)로 바꿔야 합니다. 계산기는 세 옵션 모두 아래 항목을 더하고 세금 혜택을 뺀 &lsquo;순 월비용&rsquo;을 만든 뒤, 거주 기간만큼 누적해 비교합니다.
      </p>
      <ul className="g-list">
        <li><strong>대출이자</strong> = 대출받은 보증금 × 대출금리 ÷ 12. 월세 보증금이 자기자본을 넘으면 그 부분은 신용대출 금리로 계산합니다.</li>
        <li><strong>기회비용</strong> = 내 돈으로 낸 보증금 × 기대수익률 ÷ 12.</li>
        <li><strong>월세</strong> — 갱신 주기(24개월)마다 입력한 인상률만큼 오릅니다. 반전세 월세는 &lsquo;전환한 보증금 × 전환율 ÷ 12&rsquo;입니다.</li>
        <li><strong>보증료</strong> — HUG 전세보증보험을 켜면 보증금 × 보증료율을 월로 나눠 더합니다.</li>
        <li><strong>세금 혜택</strong> — 전세대출 이자 소득공제(과세표준 근사로 절세액 계산)와 월세 세액공제를 월로 나눠 뺍니다.</li>
      </ul>
      <p className="g-p">
        아래는 계산기 기본값(시세 10억 원 아파트, 전세 6억 원 중 50% 대출·금리 {DEF.jeonseLoanRate}%, 월세 보증금 5천만·월 {manInt(DEF.monthlyRent)} 원, 반전세는 보증금 {DEF.semiJeonseRatio}%를 전환율 {DEF.conversionRate}%로 전환, 자기자본 3억 원·기대수익률 {DEF.expectedReturn}%, 관리비 월 20만 원)으로 {DEF.months}개월을 비교한 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>월 항목</th>
              {BASE.results.map(o => <th scope="col" key={o.option} style={thR}>{o.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {([
              ['대출이자', 'monthlyInterest'],
              ['기회비용', 'monthlyOpportunity'],
              ['월세', 'monthlyRentPaid'],
              ['보증료', 'monthlyInsurance'],
              ['관리비', 'monthlyMaintenance'],
            ] as const).map(([label, key], i) => (
              <tr key={key} style={rowStyle(i)}>
                <th scope="row" style={{ ...tdMuted, fontWeight: 500, textAlign: 'left' }}>{label}</th>
                {BASE.results.map(o => <td key={o.option} style={tdR}>{krw(o[key])}</td>)}
              </tr>
            ))}
            <tr style={rowStyle(5)}>
              <th scope="row" style={{ ...tdMuted, fontWeight: 500, textAlign: 'left' }}>세금 혜택 (−)</th>
              {BASE.results.map(o => <td key={o.option} style={tdR}>{o.monthlyTaxSaving > 0 ? `−${krw(o.monthlyTaxSaving)}` : '0원'}</td>)}
            </tr>
            <tr style={rowStyle(6)}>
              <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>순 월비용 (첫 달)</th>
              {BASE.results.map(o => <td key={o.option} style={{ ...tdR, fontWeight: 700 }}>{krw(o.monthlyNetCost)}</td>)}
            </tr>
            <tr style={rowStyle(7)}>
              <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{DEF.months}개월 누적</th>
              {BASE.results.map(o => <td key={o.option} style={{ ...tdR, fontWeight: 700, color: o.option === BASE.best ? 'var(--success)' : 'var(--text)' }}>{krw(o.cumulativeCost)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-p">
        이 조건에서는 <strong>{LABEL[BASE.best]}</strong>가 가장 쌉니다. 이유는 월세 조건에 숨은 전환율에 있습니다. 전세 6억과 월세(보증금 5천만·월 {manInt(DEF.monthlyRent)} 원)의 차이는 보증금 5억 5천만 원을 연 {manInt(DEF.monthlyRent * 12)} 원의 월세로 바꾼 것과 같아, 전환율로 따지면 연 {(IMPLIED_CONV * 100).toFixed(2)}%입니다. 전세로 그 5억 5천만 원을 마련하는 비용(대출금리 {DEF.jeonseLoanRate}%, 내 돈의 기대수익률 {DEF.expectedReturn}%)이 이보다 비싸니 월세가 이기는 것입니다. 반전세는 전환율 {DEF.conversionRate}%로 보증금을 월세로 돌리는데, 이 전환율이 대출금리보다 높아 오히려 가장 비싸졌습니다. 전세 첫 달 비용 {krw(J.monthlyNetCost)} 가운데 절반 가까이가 기회비용이라는 점도 눈여겨보세요.
      </p>

      {/* 2. 민감도 */}
      <h2 className="g-h2">결론을 뒤집는 두 변수 — 대출금리와 기대수익률</h2>
      <p className="g-p">
        같은 집이라도 전세대출 금리와 &lsquo;내 돈을 굴려 얻을 수익률&rsquo;을 어떻게 잡느냐에 따라 답이 바뀝니다. 아래 표는 다른 입력은 기본값 그대로 두고 두 값만 바꿔 {DEF.months}개월 누적 비용을 계산한 결과입니다. 칸의 숫자는 &lsquo;전세 누적 − 월세 누적&rsquo;(만 원)으로, 음수면 전세가 그만큼 싸고 양수면 월세가 쌉니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>기대수익률 ＼ 전세대출 금리</th>
              {LR_LIST.map(lr => <th scope="col" key={lr} style={thR}>{lr}%</th>)}
            </tr>
          </thead>
          <tbody>
            {SENS.map((row, i) => (
              <tr key={row.er} style={rowStyle(i)}>
                <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>연 {row.er}%</th>
                {row.cells.map((c, j) => (
                  <td key={j} style={tdR}>
                    {c.gap > 0 ? '+' : ''}{manInt(c.gap)}
                    <span style={{ display: 'block', fontSize: '12px', color: c.best === 'jeonse' ? 'var(--accent-ink)' : 'var(--muted)' }}>{LABEL[c.best]} 최저</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        예금 금리 수준(연 2~3%)의 기대수익률에 전세대출 금리가 3%대 초반이라면 전세가, 대출금리가 4%를 넘거나 여유 자금을 더 높은 수익률로 굴릴 수 있다면 월세가 유리한 경향이 뚜렷합니다. 기대수익률은 확정된 수익이 아니라는 점도 기억하세요 — 주식 기대수익률을 넣으면 월세가 유리해 보이지만, 그만큼의 변동 위험을 떠안는다는 뜻입니다.
      </p>

      {/* 3. 손익분기점 */}
      <h2 className="g-h2">손익분기점 해석 — 언제 역전되나</h2>
      <p className="g-p">
        계산기의 전세 비용은 매달 같지만 월세는 24개월마다 인상률만큼 오릅니다. 그래서 처음에는 월세가 싸더라도 갱신 인상이 쌓이면 누적 비용이 역전될 수 있고, 계산기는 누적 곡선이 처음 교차하는 달을 손익분기점으로 표시합니다. 예를 들어 기본값에서 월세만 {manInt(BE_RENT)} 원으로 올리고 10년 거주로 보면, 처음엔 월세 쪽 누적이 작다가 {BE ? `${BE}개월째` : '기간 안'}에 전세가 더 싸지는 쪽으로 역전됩니다. 단, 계산기는 전세 보증금을 거주 기간 내내 고정으로 둡니다. 갱신청구권을 쓰면 최대 5%, 합의 재계약이나 이사 때는 시세만큼 보증금이 오를 수 있는데 그 증액분의 추가 대출이자·기회비용이 빠져 있으므로, 장기 역전 시점은 실제보다 전세에 유리하게 나옵니다.
      </p>
      <ul className="g-list">
        <li><strong>역전이 거주 예정 기간보다 뒤</strong>에 있으면 처음에 싼 쪽을 고르면 됩니다.</li>
        <li><strong>역전이 기간 안</strong>에 있으면 계산 모델상 오래 살수록 전세가 유리해지므로, 실제로 그만큼 살 계획인지와 그사이 전세 보증금이 얼마나 오를지를 함께 따져 보세요.</li>
        <li><strong>교차가 없다</strong>는 것은 기간 내내 한쪽이 싸다는 뜻입니다. 기본값처럼 월세가 처음부터 끝까지 싼 경우가 여기에 해당합니다.</li>
        <li>단기 거주(1~2년)는 표에 없는 이사비·중개보수·대출 부대비용 비중이 커져 월세 쪽에 유리하게 작용합니다.</li>
      </ul>

      {/* 4. 옵션 비교표 */}
      <h2 className="g-h2">전세 vs 월세 vs 반전세 — 한눈에 비교</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['항목', '전세', '월세', '반전세'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['초기 자금',   '큰 보증금 (대출 + 자기자본)',        '소액 보증금',                '중간 보증금'],
              ['매달 나가는 돈', '대출이자 (+ 보이지 않는 기회비용)', '월세 + 관리비',              '대출이자 + 줄어든 월세'],
              ['세제 혜택',   '전세대출 원리금 40% 소득공제 (연 400만 한도)', `월세 세액공제 ${pct(RENT_RATE_HIGH)}~${pct(RENT_RATE_LOW)} (연 ${manInt(RENT_LIMIT)} 한도)`, '둘 다 부분 적용'],
              ['주요 위험',   '보증금 미반환 (전세사기·깡통전세)',  '갱신 시 월세 인상',          '보증금 + 월세 양쪽 위험'],
              ['금리 변화',   '대출금리 오르면 비용 증가',          '영향 적음',                  '대출 부분만 영향'],
              ['장기 거주 시', '보증금 증액분(갱신 시 5% 이내) 추가 조달 필요', '인상 누적으로 비용 증가', '인상 영향 작음'],
              ['단기 거주 시', '대출·이사 부대비용 부담',          '유연성 높음',                '중간'],
            ].map(([item, j, m, s], i) => (
              <tr key={i} style={rowStyle(i)}>
                <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{item}</th>
                <td style={tdMuted}>{j}</td>
                <td style={tdMuted}>{m}</td>
                <td style={tdMuted}>{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 전세대출 소득공제는 무주택 세대주인 근로자가 국민주택규모 주택을 임차하며 금융기관 등에서 빌린 경우, 월세 세액공제는 무주택 세대의 총급여 {manInt(RENT_GROSS_CAP)} 원 이하 근로자 등에게 적용됩니다.
      </p>

      {/* 5. 전세대출 종류 */}
      <h2 className="g-h2">전세자금대출 종류 비교</h2>
      <p className="g-p">
        전세대출은 크게 주택도시기금의 정책 대출(버팀목)과, 은행이 보증기관의 보증서를 받아 내주는 일반 전세대출로 나뉩니다. 정책 대출은 금리가 낮은 대신 소득·자산·보증금 요건과 한도가 엄격하고, 일반 전세대출은 한도가 크지만 금리가 시장 상황에 따라 움직입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['상품', '대상', '한도', '금리', '특징'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['버팀목 전세자금 (일반)', '무주택 세대주 · 소득·자산 요건', '지역(수도권·그 외)·가구 유형별 차등 (기금e든든 공고 확인)', '소득·보증금·지역별 차등 (기금e든든 공고 확인)', '정부 지원 · 시중 전세대출보다 낮은 금리'],
              ['청년 버팀목',          '만 19~34세 무주택', '일반형과 별도 한도 (공고 확인)', '일반형보다 우대', '나이·세대 구성에 따라 한도 차등'],
              ['신혼부부 버팀목',       '혼인 7년 이내',    '일반형과 별도 한도 (공고 확인)', '소득별 우대',   '신혼 우대 · 한도는 대출 규제에 따라 변동'],
              ['은행 전세대출 (보증서 담보)', '근로·사업소득자 등', '보증기관(HUG·HF·SGI)·보증금별 상이', '은행·시점별 변동', '한도 큼 · 대출 규제 대책에 따라 한도·보증비율 변경 잦음'],
            ].map(([prod, target, limit, rate, feat], i) => (
              <tr key={i} style={rowStyle(i)}>
                <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{prod}</th>
                <td style={tdMuted}>{target}</td>
                <td style={tdMuted}>{limit}</td>
                <td style={{ ...td, fontWeight: 700 }}>{rate}</td>
                <td style={tdMuted}>{feat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 버팀목 한도·금리는 주택도시기금 공고 기준 요약이며 수시로 바뀝니다(가계부채 대책이 나오면 한도가 함께 조정되기도 합니다). 본인 조건의 한도·금리는 기금e든든에서 소득·보증금을 넣어 조회하세요. 은행 전세대출 금리는 은행연합회 소비자포털 비교공시에서, 최신 조건은 기금e든든·한국주택금융공사(HF)·취급은행에서 확인하세요.
      </p>

      {/* 6. 임대차보호법 */}
      <h2 className="g-h2">주택임대차보호법 핵심 조항</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {[
          { title: '계약갱신청구권 (2+2년, §6조의3)', desc: '임차인은 계약 만료 6개월 전부터 2개월 전까지 1회에 한해 2년 갱신을 요구할 수 있습니다. 임대인은 임대인(직계존비속 포함)의 실거주, 2기 이상 차임 연체, 재건축 등 법이 정한 사유가 없으면 거절할 수 없습니다.' },
          { title: '증액 5% 상한 (§7)', desc: '갱신청구권을 행사한 갱신이나 계약 기간 중 증액은 기존 보증금·월세의 5% 이내입니다. 합의 재계약이나 신규 계약에는 적용되지 않습니다.' },
          { title: '전월세 전환율 상한 (§7조의2)', desc: '계약 기간 중이나 갱신 때 보증금을 월세로 바꿀 때는 연 10%와 한국은행 기준금리 + 2%p 중 낮은 비율을 넘을 수 없습니다(신규 계약에는 적용되지 않음).' },
          { title: '대항력·우선변제권 (§3, §3조의2)', desc: '입주(주택 인도)와 전입신고를 마치면 다음 날 0시부터 대항력이 생기고, 여기에 확정일자까지 받으면 경매·공매 때 후순위 권리자보다 먼저 보증금을 돌려받을 수 있습니다. 확정일자는 주민센터나 인터넷등기소에서 받습니다.' },
          { title: '임차권등기명령 (§3조의3)', desc: '계약이 끝났는데 보증금을 돌려받지 못한 채 이사해야 한다면 법원에 임차권등기명령을 신청하세요. 등기가 마쳐진 뒤에 이사해야 대항력과 우선변제권이 유지됩니다.' },
        ].map((law) => (
          <div key={law.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', fontSize: '14px' }}>{law.title}</p>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{law.desc}</p>
          </div>
        ))}
      </div>

      {/* 7. 전세사기 */}
      <h2 className="g-h2">주요 전세사기 유형과 대응</h2>
      <ul className="g-list">
        <li><strong>깡통전세</strong> — 매매 시세 대비 보증금(+선순위 대출)이 너무 높아, 경매로 넘어가면 보증금을 다 돌려받지 못하는 구조</li>
        <li><strong>무자본 갭투자·동시진행</strong> — 매매와 전세 계약을 동시에 진행해 임차인의 보증금으로 매매대금을 치르고, 자력 없는 임대인에게 명의를 넘기는 수법</li>
        <li><strong>이중계약</strong> — 같은 집으로 여러 임차인과 계약하거나, 월세 계약을 전세로 속여 보증금을 가로챔</li>
        <li><strong>대리계약 사기</strong> — 위조한 위임장으로 소유자 모르게 계약 체결</li>
        <li><strong>선순위 권리 은폐</strong> — 등기부의 근저당이나 다가구주택의 선순위 보증금 합계를 알리지 않음</li>
        <li><strong>신탁등기 주택</strong> — 소유권이 신탁회사에 있어 신탁회사 동의 없이 위탁자(원래 집주인)와만 맺은 계약은 보호받기 어려움</li>
        <li><strong>잔금일 권리 변동</strong> — 잔금일 전이나 당일에 근저당을 새로 설정. 전입신고의 대항력은 다음 날 0시에 생겨, 같은 날 접수된 근저당보다 뒤로 밀림</li>
      </ul>
      <Callout tone="warn" title="계산기의 위험 점수는 체크리스트일 뿐입니다">
        「전세사기 위험 점검」 탭의 점수는 확인 항목을 빠뜨리지 않게 돕는 도구이고, 점수가 낮다고 안전을 보장하지 않습니다. 계약 전에는 등기부등본·실거래가·보증보험 가입 가능 여부를 직접 확인하고, 피해가 의심되면 HUG 전세피해지원센터나 관할 지자체 전세피해 상담 창구에 바로 문의하세요.
      </Callout>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: '국토교통부 실거래가 공개시스템', href: 'https://rt.molit.go.kr' },
          { label: 'HUG 주택도시보증공사', href: 'https://www.khug.or.kr' },
          { label: '국가법령정보센터 주택임대차보호법', href: 'https://www.law.go.kr/법령/주택임대차보호법' },
        ]}
      >
        본 계산기의 전환율 비교와 대출 금리·세액공제 수치는 시점·상품·개인 조건에 따라 달라지는 참고용 추정치입니다. 전세사기 위험 점검 항목도 참고용 체크리스트일 뿐이며, 실제 계약 판단은 등기부등본 확인·HUG 전세보증 가입 가능 여부·공인중개사 확인을 거쳐야 합니다.
      </Disclaimer>

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {[
          { href: '/tools/finance/loan',          icon: '💳', name: '대출이자 계산기',         desc: '전세자금대출 원리금균등·금리 시뮬' },
          { href: '/tools/finance/real-estate',   icon: '🏘️', name: '부동산 수익률 계산기',    desc: '매매 vs 임대 ROI 비교' },
          { href: '/tools/finance/savings',       icon: '💰', name: '저축액 계산기',           desc: '월세 절약분으로 자산 만들기' },
          { href: '/tools/finance/compound',      icon: '📈', name: '복리 계산기',             desc: '보증금 운용 시 장기 수익' },
          { href: '/tools/finance/freelance-tax', icon: '🧾', name: '프리랜서 종합소득세',     desc: '사업소득자 세금 정산' },
          { href: '/tools/finance/salary',        icon: '💰', name: '연봉 실수령액 계산기',    desc: '월급·세후로 임대료 부담 판단' },
        ].map((tool, i) => (
          <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
            <span style={{ fontSize: '22px' }}>{tool.icon}</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
