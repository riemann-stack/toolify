import Link from 'next/link'
import LoanClient from './LoanClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import {
  calcAffordableLoan,
  calcEqualPayment,
  calcEqualPrincipal,
  calcInterestOnly,
  formatEok,
  KOREA_LOAN_RATES,
  prepaymentFeeAt,
  simulatePrepayment,
  simulateRateChanges,
  simulateRefinance,
} from './loanUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만 원`

/* ── 가이드 수치 — 전부 계산 엔진(loanUtils)으로 빌드 시 생성 (정적 수치 드리프트 방지) ── */
const P = 300_000_000, RATE = 4, N = 360

/* §1 상환 방식별 비교 (3억·연 4%·30년) */
const EP = calcEqualPayment({ principal: P, annualRate: RATE, months: N })
const EPR = calcEqualPrincipal({ principal: P, annualRate: RATE, months: N })
const GRACE = calcEqualPayment({ principal: P, annualRate: RATE, months: N, graceMonths: 36 })
const BULLET = calcInterestOnly({ principal: P, annualRate: RATE, months: N })
const METHOD_ROWS = [
  { name: '원리금균등', first: EP.firstPayment, last: EP.lastPayment, interest: EP.totalInterest, note: '매달 같은 금액' },
  { name: '원금균등', first: EPR.firstPayment, last: EPR.lastPayment, interest: EPR.totalInterest, note: '원금 고정, 이자 감소' },
  { name: '원리금균등 + 거치 3년', first: GRACE.firstPayment, last: GRACE.lastPayment, interest: GRACE.totalInterest, note: '3년 이자만 → 27년 분할' },
  { name: '만기일시', first: BULLET.firstPayment, last: BULLET.lastPayment, interest: BULLET.totalInterest, note: '이자만 내다 만기에 원금' },
]
const EP_Y1 = EP.schedule.slice(0, 12)
const EP_Y1_INTEREST = EP_Y1.reduce((a, r) => a + r.interest, 0)
const EP_Y1_PRINCIPAL = EP_Y1.reduce((a, r) => a + r.principal, 0)

/* §3 금리별 3억/30년 비교표 */
const RATES = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]
const RATE_RESULTS = RATES.map(rate => calcEqualPayment({ principal: P, annualRate: rate, months: N }))
const RATE_TABLE_ROWS = RATE_RESULTS.map((r, i) => ({
  rate: `${RATES[i].toFixed(1)}%`,
  monthly: won(r.monthlyPayment),
  total: won(r.totalPayment),
  interest: won(r.totalInterest),
}))
/* 1%p 차이(2칸 간격)의 월 납입·총이자 증가폭 범위 */
const STEP = RATE_RESULTS.slice(2).map((r, i) => ({
  m: r.monthlyPayment - RATE_RESULTS[i].monthlyPayment,
  t: r.totalInterest - RATE_RESULTS[i].totalInterest,
}))
const stepMin = (k: 'm' | 't') => Math.min(...STEP.map(x => x[k]))
const stepMax = (k: 'm' | 't') => Math.max(...STEP.map(x => x[k]))

/* §4 중도상환 (3억·4%·30년, 24개월차 1,000만 원) */
const PREPAY_BASE = { principal: P, annualRate: RATE, months: N, prepaymentMonth: 24, prepaymentAmount: 10_000_000, prepaymentFeeRate: 0 }
const PREPAY_PERIOD = simulatePrepayment({ ...PREPAY_BASE, prepaymentMode: 'reduce-period' })
const PREPAY_PAYMENT = simulatePrepayment({ ...PREPAY_BASE, prepaymentMode: 'reduce-payment' })
const FEE_ROWS = [6, 12, 24, 30, 36].map(m => ({ m, fee: prepaymentFeeAt(10_000_000, 0.6, m, N) }))

/* §5 갈아타기 예시 (잔액 2.5억, 5% → 4%, 남은 25년, 부대비용 350만 원) */
const REFI = simulateRefinance({
  remainingPrincipal: 250_000_000, currentRate: 5, remainingMonths: 300, currentPrepaymentFee: 2_000_000,
  newRate: 4, newMonths: 300, newOriginationFee: 1_000_000, newOtherFees: 500_000,
})

/* §6 금리 변동 시나리오 (3억·4%·30년) */
const RATE_CHANGE = simulateRateChanges({ principal: P, annualRate: RATE, months: N }).filter(r => r.delta > 0)

/* FAQ 역산 예시 */
const AFF_45 = calcAffordableLoan({ monthlyPayment: 1_000_000, annualRate: 4.5, months: 360 })
const AFF_35 = calcAffordableLoan({ monthlyPayment: 1_000_000, annualRate: 3.5, months: 360 })
const AFF_55 = calcAffordableLoan({ monthlyPayment: 1_000_000, annualRate: 5.5, months: 360 })
const AFF_45_10Y = calcAffordableLoan({ monthlyPayment: 1_000_000, annualRate: 4.5, months: 120 })

const cell: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }
const thNum: React.CSSProperties = { ...th, textAlign: 'right' }
const box: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }

export const metadata = buildMetadata({
  path: '/tools/finance/loan',
  title: '대출이자 계산기 2026 — 원리금균등·원금균등·중도상환·갈아타기·금리변동',
  description:
    '원리금균등·원금균등부터 갈아타기·중도상환·금리 변동까지. 매달 얼마 나갈지 정확히 + 총 이자·DSR·LTV·실효금리 비교. 2026년 한국 시중 금리 기준.',
  keywords: [
    '대출이자계산기', '원리금균등', '원금균등', '주택담보대출계산기',
    '대출상환계산기', '대출이자계산', 'DSR계산기',
    '주담대 계산', '중도상환 계산', '대출 갈아타기',
    '금리 인상 시뮬', '월 상환액 계산', '대출 역산',
    '2026 대출 금리', '주택담보대출 계산', '신용대출 계산',
  ],
})

const FAQ_LD = [
              {
                q: '원금균등과 원리금균등 중 어느 것이 유리한가요?',
                a: `총 이자만 보면 <strong>원금균등이 적습니다</strong>. 원금이 매달 같은 금액씩 줄어 이자가 붙는 잔액이 더 빨리 작아지기 때문입니다. 3억 원·연 4%·30년이면 총 이자가 원리금균등 ${man(EP.totalInterest)}, 원금균등 ${man(EPR.totalInterest)}로 약 ${man(EP.totalInterest - EPR.totalInterest)} 차이입니다. 대신 원금균등의 첫 달 납입액(${won(EPR.firstPayment)})이 원리금균등(${won(EP.monthlyPayment)})보다 약 ${man(EPR.firstPayment - EP.monthlyPayment)} 많아, 초기 소득 여유가 있을 때 고르는 방식입니다.`,
              },
              {
                q: '거치기간(거치식 대출)이란 무엇인가요?',
                a: `거치기간은 <strong>원금 상환 없이 이자만 내는 기간</strong>입니다. 3억 원을 연 4%로 3년 거치·27년 분할 상환하면 처음 3년은 월 ${won(GRACE.firstPayment)}(이자)만 내고, 이후 27년은 월 ${won(GRACE.lastPayment)} 안팎을 냅니다. 원금이 3년 늦게 줄기 시작하므로 총 이자는 거치 없는 30년 원리금균등보다 약 ${man(GRACE.totalInterest - EP.totalInterest)} 많습니다.`,
              },
              {
                q: 'DSR(총부채원리금상환비율)이란 무엇인가요?',
                a: 'DSR은 <strong>연간 모든 대출의 원리금 상환액이 연소득에서 차지하는 비율</strong>입니다. 은행권은 차주 단위 DSR 40%를 적용해, 연소득 5,000만 원이면 연간 원리금 상환액이 2,000만 원(월 약 167만 원)을 넘는 대출이 제한됩니다. 변동·혼합금리 대출은 한도를 계산할 때 가산금리(스트레스 금리)를 더해 실제보다 높은 금리로 상환액을 잡습니다.',
              },
              {
                q: 'LTV(담보인정비율)란 무엇인가요?',
                a: 'LTV는 <strong>담보 주택 가격 대비 대출 가능 금액의 비율</strong>입니다. LTV 70%면 5억 원 주택에 최대 3억 5천만 원입니다. 2025년 10·15 대책 이후 서울 전역·경기 12곳 등 규제지역은 LTV 40%(생애최초 구입은 70%)이고, 수도권·규제지역은 주택 가격에 따라 주담대 최대 금액(15억 원 이하 6억·25억 원 이하 4억·초과 2억)도 따로 묶여 있습니다. 실제 한도는 LTV·DSR·금액 상한 중 가장 작은 값입니다.',
              },
              {
                q: '중도상환수수료는 언제까지, 얼마나 내나요?',
                a: '금융소비자보호법상 중도상환수수료는 <strong>대출 계약일부터 3년 이내에 갚는 경우에만</strong> 받을 수 있고, 보통 &lsquo;상환 원금 × 수수료율 × (3년 − 경과 기간) ÷ 3년&rsquo;으로 남은 기간에 비례해 줄어듭니다. 2025년 1월 13일 이후 신규 약정은 실비용 범위에서만 부과하도록 바뀌어 은행권 수수료율이 주담대 0.6% 안팎, 신용대출 0.1% 안팎으로 낮아졌고, 그 전 약정은 1.2~1.5% 수준이 많습니다. 본 도구의 <strong>[중도상환] 탭</strong>에 약정 수수료율을 넣으면 경과 기간을 반영한 수수료와 순절감액을 계산합니다.',
              },
              {
                q: '대출이자 계산기의 결과가 실제와 다를 수 있나요?',
                a: '네. 은행은 이자를 <strong>일할 계산</strong>(잔액 × 연 금리 × 실제 일수 ÷ 365)하는 경우가 많아 31일인 달과 28일인 달의 이자가 다르지만, 이 계산기는 매달 연 금리 ÷ 12로 계산합니다. 원 단위 절사 방식, 첫 납입일까지의 일수, 변동금리 갱신도 차이를 만듭니다. 차이는 보통 월 몇백~몇천 원 수준이지만, 정확한 상환 스케줄은 대출 실행 후 은행이 주는 상환 계획표로 확인하세요.',
              },
              {
                q: '중도상환 시 기간 단축 vs 월 상환액 감소 어느 게 유리한가요?',
                a: `<strong>기간 단축이 총 이자를 더 줄입니다.</strong> 월 납입액을 그대로 두면 늘어난 원금 상환분이 계속 잔액을 줄이기 때문입니다. 3억 원·연 4%·30년 대출에서 24개월차에 1,000만 원을 갚으면 — 기간 단축은 총 이자 약 ${man(PREPAY_PERIOD.interestSaved)} 절감(${PREPAY_PERIOD.monthsShortened}개월 단축), 월 상환액 감소는 월 ${won(PREPAY_PAYMENT.newMonthlyPayment)}로 내려가고 총 이자 약 ${man(PREPAY_PAYMENT.interestSaved)} 절감입니다. 소득이 안정적이면 기간 단축, 매달 현금 흐름이 빠듯하면 월 상환액 감소가 맞습니다.`,
              },
              {
                q: '갈아타기 손익분기는 어떻게 계산하나요?',
                a: `<strong>손익분기(개월) = 부대비용 ÷ 월 절감액</strong>입니다. 잔액 2.5억 원을 연 5% → 4%(남은 25년 그대로)로 갈아타면 월 약 ${won(-REFI.monthlyPaymentDiff)} 줄고, 부대비용이 350만 원이면 ${REFI.breakEvenMonths}개월 뒤부터 이득입니다. 변동금리로 갈아탄다면 이후 금리 변동, 새 대출의 중도상환수수료 기간(다시 3년)도 함께 고려하세요. 본 도구의 <strong>[갈아타기] 탭</strong>에서 자동 계산됩니다.`,
              },
              {
                q: '변동금리 대출에서 금리 인상에 어떻게 대비하나요?',
                a: `본 도구의 <strong>[금리 변동] 탭</strong>으로 +0.5%p·+1%p·+2%p 시 월 부담을 먼저 확인하세요. 3억 원·연 4%·30년이면 +1%p에 월 약 ${won(RATE_CHANGE.find(r => r.delta === 1)?.monthlyDiff ?? 0)}, +2%p에 월 약 ${won(RATE_CHANGE.find(r => r.delta === 2)?.monthlyDiff ?? 0)}이 늘어납니다. 대비책은 비상금 확보, 고정·혼합금리 일부 전환, 여유 자금 중도상환(3년 경과 후면 수수료 없음)입니다.`,
              },
              {
                q: '월 100만원씩 갚을 수 있으면 얼마까지 빌릴 수 있나요?',
                a: `본 도구의 <strong>[역산] 탭</strong>을 쓰세요. 월 100만 원·연 4.5%·30년 원리금균등이면 약 ${formatEok(AFF_45.principal)}입니다. 같은 월 100만 원이라도 금리가 3.5%면 ${formatEok(AFF_35.principal)}, 5.5%면 ${formatEok(AFF_55.principal)}로 1%p마다 10% 넘게 달라지고, 기간을 10년으로 줄이면 ${formatEok(AFF_45_10Y.principal)}로 절반 이하가 됩니다. 실제 한도는 여기에 DSR·LTV·주담대 금액 상한이 함께 적용됩니다.`,
              },
              {
                q: '신용대출 vs 주택담보대출 어느 게 유리한가요?',
                a: '같은 금액이면 <strong>담보가 있는 주담대가 금리가 낮고 기간이 길어</strong> 월 부담이 훨씬 적습니다. 대신 근저당 설정·감정 등 부대비용과 LTV·DSR 심사가 따르고, 신용대출은 2025년 6월 28일부터 한도가 연소득 이내로 묶였습니다. 1~3년 안에 갚을 단기 자금은 부대비용이 없는 신용대출이, 장기·고액은 주담대가 대체로 유리합니다. 두 상품 금리는 은행연합회 소비자포털의 은행별 비교공시로 확인하세요.',
              },
            ]

export default function LoanPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/loan">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />대출이자 계산기
      </h1>
      <p className="tp-lead">
        원리금균등·원금균등부터 갈아타기·중도상환·금리 변동까지 — <strong style={{ color: 'var(--text)' }}>매달 얼마 나갈지</strong> 정확하게.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2025.10.15 대출 규제(LTV·주담대 한도)·2025.1.13 중도상환수수료 개편 반영, 금리 프리셋은 참고값" sources={[{"label":"은행연합회 공시","href":"https://portal.kfb.or.kr"},{"label":"금융위원회 (중도상환수수료 개편)","href":"https://www.fsc.go.kr"},{"label":"국가법령정보센터 금융소비자보호법","href":"https://www.law.go.kr/법령/금융소비자보호에관한법률"},{"label":"한국은행 경제통계시스템(ECOS)","href":"https://ecos.bok.or.kr"}]} />

      <LoanClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 원리금균등 vs 원금균등 ── */}
        <section>
          <h2 className="g-h2">
            대출 상환 방식 비교: 원리금균등 vs 원금균등
          </h2>
          <p className="g-p">
            <strong>원리금균등상환</strong>은 매달 같은 금액을 내는 방식이고, <strong>원금균등상환</strong>은 매달 같은 원금에 줄어드는 이자를 더해 내는 방식입니다.
            원리금균등은 초반 납입액의 대부분이 이자라 원금이 천천히 줄어듭니다 — 3억 원·연 4%·30년이면 첫해 12개월 동안 낸 {man(EP_Y1_INTEREST + EP_Y1_PRINCIPAL)} 가운데 이자가 {man(EP_Y1_INTEREST)}, 원금은 {man(EP_Y1_PRINCIPAL)}뿐입니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={box}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '8px' }}>원리금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'nowrap', overflowX: 'auto' }}>
                월 납입액 = 대출원금×[r(1+r)ⁿ]÷[(1+r)ⁿ-1]
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                r = 월 이자율(연 금리 ÷ 12), n = 총 납입 횟수(개월 수)
              </p>
            </div>
            <div style={box}>
              <p style={{ fontSize: '12px', color: 'var(--cyan-600)', fontWeight: 700, marginBottom: '8px' }}>원금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'nowrap', overflowX: 'auto' }}>
                월 납입액 = (대출원금÷n)+(잔여원금×r)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                총 이자 = 원금 × r × (n + 1) ÷ 2 — 매달 원금은 같고, 이자는 잔여 원금에 비례해 감소
              </p>
            </div>
          </div>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <caption style={{ captionSide: 'top', textAlign: 'left', padding: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>3억 원 · 연 4% · 30년 — 상환 방식별 결과</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>방식</th>
                  <th scope="col" style={thNum}>첫 달</th>
                  <th scope="col" style={thNum}>마지막 달</th>
                  <th scope="col" style={thNum}>총 이자</th>
                  <th scope="col" style={th}>특징</th>
                </tr>
              </thead>
              <tbody>
                {METHOD_ROWS.map(r => (
                  <tr key={r.name}>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.name}</td>
                    <td style={numCell}>{won(r.first)}</td>
                    <td style={numCell}>{won(r.last)}</td>
                    <td style={{ ...numCell, fontWeight: 700 }}>{man(r.interest)}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">※ 만기일시의 마지막 달은 원금 3억 원 + 마지막 달 이자를 한 번에 갚는 금액입니다. 전세자금대출처럼 기간이 짧은 대출에 주로 쓰입니다.</p>
        </section>

        {/* ── 2. 금리 프리셋 ── */}
        <section>
          <h2 className="g-h2">
            대출 종류별 기본 금리와 실제 금리 확인법
          </h2>
          <p className="g-p">
            계산기에서 대출 종류를 고르면 해당 참고 금리가 기본값으로 들어갑니다(고정금리 주담대는 직접 입력). 계산을 시작하기 위한 <strong>대략적 참고값</strong>일 뿐이며 공식 평균 금리가 아닙니다.
            실제 금리는 기준금리(COFIX·금융채 등) + 가산금리 − 우대금리로 정해져 신용점수·소득·거래 실적에 따라 사람마다 다르므로, 은행에서 받은 금리로 바꿔 넣으세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>대출 종류</th>
                  <th scope="col" style={thNum}>참고값</th>
                  <th scope="col" style={thNum}>참고 범위</th>
                </tr>
              </thead>
              <tbody>
                {KOREA_LOAN_RATES.map(r => (
                  <tr key={r.id}>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ ...numCell, color: 'var(--accent-ink)', fontWeight: 800 }}>{r.avg.toFixed(1)}%</td>
                    <td style={{ ...numCell, color: 'var(--muted)' }}>{r.min.toFixed(1)}~{r.max.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="실제 금리는 어디서 보나">
            은행별 가계대출 금리(신용점수 구간별)는 <strong>은행연합회 소비자포털의 대출금리 비교공시</strong>에서, 전체 은행의 월별 신규 대출 평균 금리는 <strong>한국은행 경제통계시스템(ECOS)의 예금은행 가중평균금리</strong>에서 확인할 수 있습니다. 정책 대출(디딤돌·보금자리론 등)은 한국주택금융공사·주택도시기금 공지 금리를 따릅니다.
          </Callout>
        </section>

        {/* ── 3. 금리별 비교표 ── */}
        <section>
          <h2 className="g-h2">
            금리별 3억 대출 월 납입액 및 총 이자 비교표 (30년)
          </h2>
          <p className="g-p">
            대출 원금 3억 원, 30년(360개월) 원리금균등상환 기준으로 금리별 월 납입액과 총 이자를 비교합니다.
            금리가 1%p 오를 때마다 월 납입액은 약 {man(stepMin('m'))}~{man(stepMax('m'))}, 총 이자는 약 {man(stepMin('t'))}~{man(stepMax('t'))} 늘어납니다 — 금리가 높을수록 같은 1%p의 부담이 더 커집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>연 금리</th>
                  <th scope="col" style={thNum}>원리금균등 월납입</th>
                  <th scope="col" style={thNum}>총 납입액</th>
                  <th scope="col" style={thNum}>총 이자</th>
                </tr>
              </thead>
              <tbody>
                {RATE_TABLE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, color: 'var(--accent-ink)', fontWeight: 700 }}>{row.rate}</td>
                    <td style={{ ...numCell, fontWeight: 500 }}>{row.monthly}</td>
                    <td style={{ ...numCell, color: 'var(--muted)' }}>{row.total}</td>
                    <td style={{ ...numCell, color: 'var(--danger)' }}>{row.interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 원리금균등상환, 30년 만기, 중도상환 없음 기준. 월 금리 = 연 금리 ÷ 12로 계산해, 일할 계산하는 은행 실제 수치와 소폭 차이가 있을 수 있습니다.
          </p>
        </section>

        {/* ── 4. 중도상환 가이드 ── */}
        <section>
          <h2 className="g-h2">
            중도상환 — 언제 얼마 갚아야 유리한가?
          </h2>
          <p className="g-p">
            중도상환하면 갚은 원금만큼 이후 이자가 사라지지만, 계약 후 3년 안에는 중도상환수수료가 붙습니다. 그래서 판단 기준은 <strong>순절감 = 줄어든 이자 − 수수료</strong>입니다.
            금융소비자보호법은 대출일부터 3년이 지난 뒤의 상환에는 수수료를 받지 못하게 하고 있고, 은행은 보통 남은 기간에 비례해 수수료를 줄여 받습니다. 계산기도 같은 방식(상환액 × 수수료율 × (36 − 경과 개월) ÷ 36)을 씁니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <caption style={{ captionSide: 'top', textAlign: 'left', padding: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>1,000만 원 중도상환 · 약정 수수료율 0.6% — 경과 기간별 수수료</caption>
              <thead>
                <tr><th scope="col" style={th}>상환 시점</th><th scope="col" style={thNum}>남은 비율</th><th scope="col" style={thNum}>수수료</th></tr>
              </thead>
              <tbody>
                {FEE_ROWS.map(r => (
                  <tr key={r.m}>
                    <td style={cell}>대출 후 {r.m}개월</td>
                    <td style={numCell}>{Math.round(((36 - r.m) / 36) * 100)}%</td>
                    <td style={{ ...numCell, fontWeight: 700 }}>{won(r.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 16 }}>
            <div style={box}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)', marginBottom: '6px' }}>중도상환이 유리한 경우</p>
              <ul className="g-list" style={{ margin: 0, fontSize: 14 }}>
                <li>대출 후 3년이 지나 수수료가 없을 때</li>
                <li>대출 금리가 예금·투자 기대수익률보다 높을 때</li>
                <li>비상금을 따로 확보해 둔 상태일 때</li>
              </ul>
            </div>
            <div style={box}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)', marginBottom: '6px' }}>신중해야 할 경우</p>
              <ul className="g-list" style={{ margin: 0, fontSize: 14 }}>
                <li>3년 이내 + 수수료율이 높은 예전 약정(1.2~1.5%)</li>
                <li>더 높은 금리의 다른 빚이 있을 때 (그쪽 먼저)</li>
                <li>갚고 나면 비상금이 바닥날 때</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            예시: 3억 원·연 4%·30년 대출에서 24개월차에 1,000만 원을 갚으면, 월 납입액을 유지하는 <strong>기간 단축</strong>은 총 이자가 약 {man(PREPAY_PERIOD.interestSaved)} 줄고 만기가 {PREPAY_PERIOD.monthsShortened}개월 당겨집니다. 기간을 유지하는 <strong>월 상환액 감소</strong>는 월 {won(PREPAY_PAYMENT.newMonthlyPayment)}로 내려가고 총 이자는 약 {man(PREPAY_PAYMENT.interestSaved)} 줄어듭니다.
          </p>
        </section>

        {/* ── 5. 갈아타기 손익분기 ── */}
        <section>
          <h2 className="g-h2">
            대출 갈아타기 — 손익분기 계산
          </h2>
          <p className="g-p">
            <strong>손익분기 = 부대비용 ÷ 월 절감액</strong>. 새 대출을 이 기간 이상 유지해야 갈아타기가 이득입니다. 부대비용에는 기존 대출 중도상환수수료, 새 대출의 인지세·근저당 설정 관련 비용 등이 들어갑니다.
          </p>
          <div style={box}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              예시 — 잔액 2.5억, 5% → 4% 갈아타기 (남은 25년 유지)
            </p>
            <ul className="g-list" style={{ margin: 0, fontSize: 14 }}>
              <li>월 납입액: {won(REFI.currentMonthly)} → {won(REFI.newMonthly)} (월 {won(-REFI.monthlyPaymentDiff)} 절감)</li>
              <li>부대비용: {man(REFI.totalCostFees)} (중도상환수수료 200만 + 취급수수료 100만 + 인지·등록 50만 가정)</li>
              <li><strong>손익분기: {REFI.breakEvenMonths}개월</strong> — 남은 기간을 다 채우면 총 이자 차이에서 부대비용을 뺀 순이득 약 {man(REFI.totalSaving)}</li>
              <li>1~2년 안에 집을 팔거나 다시 갈아탈 계획이면 손익분기 전에 끝날 수 있어 신중히 결정</li>
            </ul>
          </div>
        </section>

        {/* ── 6. 금리 인상 대비 ── */}
        <section>
          <h2 className="g-h2">
            금리 인상기 대비 — 변동금리 사용자
          </h2>
          <p className="g-p">
            변동금리 주담대는 보통 6개월 또는 1년마다 기준금리(COFIX 등)에 맞춰 금리가 다시 정해집니다. 본 도구의 <strong>[금리 변동] 탭</strong>으로 인상 폭별 부담을 미리 확인하세요. 3억 원·연 4%·30년 원리금균등 기준:
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr><th scope="col" style={th}>금리 변동</th><th scope="col" style={thNum}>월 납입액</th><th scope="col" style={thNum}>월 증가</th><th scope="col" style={thNum}>총 이자 증가</th></tr>
              </thead>
              <tbody>
                {RATE_CHANGE.map(r => (
                  <tr key={r.delta}>
                    <td style={cell}>+{r.delta}%p ({r.newRate}%)</td>
                    <td style={numCell}>{won(r.monthlyPayment)}</td>
                    <td style={{ ...numCell, fontWeight: 700 }}>+{won(r.monthlyDiff)}</td>
                    <td style={numCell}>+{man(r.totalInterestDiff)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="tip" title="대비 방법">
            비상금을 몇 달치 납입액만큼 따로 두고, 금리가 오를 때 고정·혼합금리로 일부 전환할 수 있는지 은행에 확인해 두세요. 대출 후 3년이 지나 수수료가 없어지면 여유 자금으로 원금을 줄이는 것이 금리 상승에 가장 확실한 대비입니다.
          </Callout>
        </section>

        {/* ── 7. DSR·LTV 가이드 ── */}
        <section>
          <h2 className="g-h2">
            DSR·LTV — 한국 대출 규제 (참고용)
          </h2>
          <p className="g-p">
            이 계산기는 상환액을 계산할 뿐 대출 한도를 정하지 않습니다. 실제로 빌릴 수 있는 금액은 아래 규제 가운데 <strong>가장 작은 값</strong>으로 정해지므로, 역산 탭에서 나온 금액이 한도를 넘지 않는지 따로 확인해야 합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={box}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>DSR (총부채원리금상환비율)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 6 }}>
                연간 모든 대출 원리금 ÷ 연소득 × 100
              </p>
              <ul className="g-list" style={{ margin: 0, fontSize: 14 }}>
                <li>은행권 한도: <strong>40%</strong></li>
                <li>2금융권 한도: <strong>50%</strong></li>
                <li>스트레스 DSR: 변동·혼합금리에 가산금리를 얹어 한도 산정 — 단계별 가산율은 <Link href="/tools/finance/dsr">DSR 계산기</Link> 참고</li>
              </ul>
            </div>
            <div style={box}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>LTV (담보인정비율)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 6 }}>
                담보 주택 가격 대비 대출 가능 비율
              </p>
              <ul className="g-list" style={{ margin: 0, fontSize: 14 }}>
                <li>비규제 지역: <strong>70%</strong></li>
                <li>규제 지역(2025.10.15 이후 서울 전역·경기 12곳 등): <strong>40%</strong></li>
                <li>생애최초 구입: 수도권·규제지역 <strong>70%</strong></li>
                <li>수도권·규제지역 주담대 금액 상한: 주택가 15억 이하 6억 · 25억 이하 4억 · 초과 2억</li>
              </ul>
            </div>
          </div>
          <Callout tone="warn" title="규제는 수시로 바뀝니다">
            위 수치는 2025년 6·27 및 10·15 대책 기준이며, 이후 발표로 달라질 수 있습니다. 대출 신청 전 거래 은행과 금융위원회 보도자료에서 현행 기준을 확인하세요.
          </Callout>
        </section>

        {/* ── 8. FAQ ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 9. 면책 ── */}
        <section>
          <Disclaimer variant="finance" open>
            본 대출이자 계산기는 <strong>표준 공식 기반 추정 도구</strong>입니다. 금융 자문·승인 도구가 아닙니다.
            <br />
            <strong>본 도구의 한계</strong> — 실제 대출 가능 여부는 신용·소득·LTV·DSR에 따라 다름 / 은행의 일할 이자 계산·원 단위 절사로 소폭 차이 가능 / 중도상환수수료·취급수수료는 은행·상품별 차이 / DSR·LTV 규제는 정책 변경 시 변동 / 변동금리는 기준금리·가산금리 변화 따라 갱신.
            <br />
            정확한 상품·조건은 — 본인 거래 은행 상담 / 한국주택금융공사(HF·주담대) / 금융감독원 <strong>1332</strong> / 채무 상담 신용회복위원회 <strong>1397</strong>.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/dsr',      name: 'DSR 계산기',           desc: '스트레스 DSR 반영 대출 한도 진단' },
              { href: '/tools/finance/salary',   name: '연봉 실수령액 계산기', desc: '월 납입액 감당 가능한지 소득 확인' },
              { href: '/tools/finance/compound', name: '복리 계산기',           desc: '이자 절약분 재투자 시 미래 자산' },
              { href: '/tools/finance/vat',      name: '부가세 계산기',         desc: '사업자 대출 시 세금 계산' },
              { href: '/tools/unit/area',        name: '평수 변환기',     desc: '담보 물건 면적 단위 변환' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'block',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
