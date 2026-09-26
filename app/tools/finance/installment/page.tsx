import Link from 'next/link'
import CardInstallmentClient from './CardInstallmentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/installment',
  title: '카드 할부 계산기 — 월 납부액·총 이자·일시불 vs 무이자 비교',
  description: '할부 개월수별 진짜 이자와 일시불·무이자 비교. 월 납부액·총 이자·원금 대비 이자율에 선결제(중도 상환) 절약 팁, 여신금융협회 수수료 공시실 확인법까지 안내.',
  keywords: ['카드할부계산기', '할부이자계산', '12개월할부', '무이자할부', '일시불할인', '카드수수료', '할부vs일시불', '신용카드할부'],
})

/* ── 본문 표·예시 — 계산기(CardInstallmentClient feeSum)와 같은 산식으로 빌드 시점 계산 ──
   원금균등 분할 + 할부 잔액 × 연 수수료율 ÷ 12. 1~N회차 수수료 합 = 원금 × r/12 × (N − N(N−1)/(2n)) */
const feeSum = (amount: number, months: number, annualRate: number, payMonths: number = months) => {
  const N = Math.max(0, Math.min(months, Math.floor(payMonths)))
  return amount * (annualRate / 100 / 12) * (N - (N * (N - 1)) / (2 * months))
}
const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`
const pct = (v: number, d = 1) => `${v.toFixed(d)}%`

const AMT = 1_000_000
const FEE_MONTHS = [3, 6, 10, 12, 24, 36]
const FEE_RATES = [10, 15, 19.9]
const FEE_ROWS = FEE_MONTHS.map((n) => ({ n, fees: FEE_RATES.map((r) => feeSum(AMT, n, r)) }))
const F12 = feeSum(AMT, 12, 19.9)
const F24 = feeSum(AMT, 24, 19.9)
const F36 = feeSum(AMT, 36, 19.9)
/** 부분 무이자 예: 12개월 중 1~4회차 고객부담 */
const PARTIAL4 = feeSum(AMT, 12, 19.9, 4)
/** 선결제 예: 12개월 유이자 중 6회차까지 내고 남은 원금 전액 선결제 → 7~12회차 수수료 절약 */
const PREPAY_SAVED = F12 - feeSum(AMT, 12, 19.9, 6)

/** 일시불 할인 vs 무이자 + 파킹통장 — 계산기 비교 탭과 같은 단순 모델(평균 잔액 = 원금/2, 세전)
 *  운용이자 = 원금/2 × 파킹금리/12 × 개월 → 손익분기 할인율(%) = 파킹금리(%) × 개월 ÷ 24 */
const BE_MONTHS = [3, 6, 10, 12, 24]
const BE_RATES = [2, 3, 4]
const beDiscount = (parkingPct: number, months: number) => (parkingPct * months) / 24
const PARK6 = (AMT / 2) * (3 / 100 / 12) * 6

const TH: React.CSSProperties = { padding: '10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

const FAQ_LD = [
              {
                q: '12개월 할부면 월 얼마인가요?',
                a: '100만원을 12개월 할부로 결제할 경우 <strong>무이자: 월 약 83,333원</strong>(총 100만원), <strong>유이자(연 19.9%): 1회차 약 99,917원</strong>에서 매월 줄어 마지막 회차 약 84,715원(총 약 110.8만원, 수수료 약 10.8만원)입니다. 카드 할부는 원금을 매월 똑같이 나눠 갚고 남은 할부 잔액에만 수수료가 붙습니다. 카드사·회원 등급에 따라 수수료율이 다르므로 정확한 금액은 카드사 확인이 필요합니다.',
              },
              {
                q: '무이자 할부가 진짜 이득인가요?',
                a: '<strong>일시불 할인이 없는 경우 무이자 할부는 사실상 이득</strong>입니다. 카드사·가맹점이 수수료를 대신 부담해 사용자는 추가 비용 없이 분할 결제할 수 있고, 그동안 남은 돈을 예금·파킹통장에 두면 이자까지 생깁니다. 다만 일시불 할인이 있으면 할인액과 운용이자를 비교해야 하고, 일부 가맹점은 무이자 할부 시 가격을 일시불보다 높게 책정하기도 하니 결제 전에 확인하세요.',
              },
              {
                q: '일시불 할인 5% vs 무이자 6개월 중 무엇이 나은가요?',
                a: '<strong>일반적으로 일시불 할인 5%가 더 유리</strong>합니다. 100만원 기준 일시불 할인 5% = 5만원 즉시 절감. 무이자 6개월 동안 남은 돈을 파킹통장(연 3%)에 두면 평균 잔액 50만원 × 6개월로 약 7,500원(세전) 이자가 생깁니다. 차이 약 4만 2천원으로 일시불이 우세합니다. 연 3%·6개월이면 할인율이 약 0.75%만 넘어도 일시불이 낫습니다. 단, 현금 여유가 부족하거나 비상금 확보가 필요하면 무이자 할부가 합리적일 수 있습니다.',
              },
              {
                q: '유이자 할부는 정말 손해인가요?',
                a: '네, <strong>일반적으로 손해</strong>입니다. 연 19.9% 수수료는 시중 대출 금리보다 훨씬 높습니다. 100만원을 12개월 유이자 할부 시 약 10.8만원의 수수료가 추가되며, 24개월이면 약 20.7만원, 36개월이면 약 30.7만원이 추가됩니다. 가능한 한 일시불 또는 무이자 할부를 선택하고, 부득이한 경우 짧은 개월(6개월 이내)을 권장합니다.',
              },
              {
                q: '할부 개월이 길수록 좋은가요?',
                a: '월 부담은 줄지만 <strong>총 이자는 급증</strong>합니다. 100만원·연 19.9% 기준: 12개월 수수료 약 10.8만원, 24개월 약 20.7만원(12개월의 약 2배), 36개월 약 30.7만원(12개월의 약 3배). 가능한 짧은 개월(6~12개월)을 선택하고, 24개월 이상 할부는 신중히 결정하세요. 게다가 유이자 할부는 기간이 길수록 적용 수수료율 자체도 높아지는 경우가 많아 이자가 이중으로 늘어납니다.',
              },
              {
                q: '내게 적용되는 정확한 할부 수수료율은 어디서 확인하나요?',
                a: '세 곳에서 확인할 수 있습니다. ① <strong>여신금융협회 홈페이지의 공시실</strong> — 카드사별 할부 수수료율 구간을 공시합니다. ② <strong>카드사 앱·홈페이지</strong> — 로그인하면 본인 회원 등급 기준 실제 수수료율이 표시됩니다. ③ <strong>결제 화면·이용대금 명세서</strong> — 할부 개월을 고르면 적용 수수료율이 안내되고, 명세서에도 회차별 수수료가 찍힙니다. 같은 카드라도 회원 등급·기간에 따라 달라지므로 결제 직전 값이 가장 정확합니다.',
              },
              {
                q: '할부금을 중간에 미리 갚으면(선결제) 이자를 아낄 수 있나요?',
                a: `네. 유이자 할부는 <strong>남은 원금에 대해서만 수수료가 부과</strong>되므로, 일부 또는 전액을 선결제하면 그만큼 남은 회차의 수수료가 줄어듭니다. 예: 100만원·12개월·연 19.9%에서 6회차까지 낸 뒤 남은 원금을 전액 선결제하면 7~12회차 수수료 약 ${won(PREPAY_SAVED)}을 아낍니다(선결제 시점까지의 수수료는 일할 계산). 카드사 앱의 「할부 선결제/일부결제」 메뉴에서 신청하며, 카드론과 달리 <strong>할부 선결제에는 보통 중도상환수수료가 없습니다</strong>. 무이자 할부는 수수료가 0원이라 선결제 실익이 없습니다.`,
              },
              {
                q: '할부로 결제하면 신용점수에 영향을 주나요?',
                a: '할부 자체가 곧바로 신용점수를 떨어뜨리지는 않습니다. 다만 할부 잔액은 <strong>카드론·현금서비스와 함께 「카드 채무」로 집계</strong>되어 부채 비중이 커지면 평가에 불리할 수 있고, 무엇보다 <strong>결제일에 연체가 발생하면 신용점수가 크게 하락</strong>합니다. 본인 상환 능력 범위 안에서 할부 기간을 정하고 연체를 피하는 것이 핵심입니다.',
              },
              {
                q: '할부 수수료율 상한은 얼마인가요?',
                a: '카드사 같은 여신금융기관이 받을 수 있는 이자율은 대부업법(여신금융기관의 이자율 제한)과 시행령에 따라 <strong>법정 최고금리 연 20%</strong>를 넘을 수 없고, 실무적으로 대부분 카드사가 <strong>연 19.9%를 상한</strong>으로 운용합니다. 즉 아무리 긴 할부라도 연 20%를 넘지 않습니다. 반대로 시중 신용대출 금리보다는 높은 편이라, 금액이 크고 기간이 길다면 할부보다 신용대출이 유리할 수 있습니다.',
              },
            ]

export default function CardInstallmentPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/installment">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />카드 할부 계산기
      </h1>
      <p className="tp-lead">
        할부 개월수별 진짜 이자와 <strong style={{ color: 'var(--text)' }}>일시불·무이자 비교</strong>. 카드 선택의 기준을 숫자로.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="원금균등 분할 + 할부 잔액 기준 수수료 산식 · 법정 최고금리 연 20% · 할부거래법(청약철회·항변권)"
        sources={[
          { label: '금융감독원', href: 'https://www.fss.or.kr' },
          { label: '여신금융협회', href: 'https://www.crefia.or.kr' },
          { label: '국가법령정보센터 할부거래에 관한 법률', href: 'https://www.law.go.kr/법령/할부거래에관한법률' },
          { label: '국가법령정보센터 대부업법(여신금융기관 이자율 제한)', href: 'https://www.law.go.kr/법령/대부업등의등록및금융이용자보호에관한법률' },
        ]}
      />

      <CardInstallmentClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 className="g-h2">
            카드 할부 계산 핵심 공식
          </h2>
          <p className="g-p">
            국내 카드사 할부는 원금을 개월수로 똑같이 나눠 갚고(원금균등), 매달 <strong>아직 갚지 않은 할부 잔액</strong>에 월 수수료율을 곱해 수수료를 붙입니다. 그래서 1회차 납부액이 가장 크고 회차가 지날수록 줄어듭니다. 대출의 원리금균등처럼 매달 같은 금액을 내는 방식이 아니라는 점이 흔히 헷갈리는 부분입니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>월이자율</span> = 연이자율 ÷ 12 ÷ 100</div>
            <div><span style={{ color: 'var(--muted)' }}>월 원금</span> = 원금 ÷ 개월수</div>
            <div><span style={{ color: 'var(--muted)' }}>k회차 수수료</span> = 할부 잔액 × 월이자율</div>
            <div><span style={{ color: 'var(--muted)' }}>총 수수료</span> = 원금 × 월이자율 × (개월수 + 1) ÷ 2</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 원금균등 분할 + 잔액 기준 수수료 (국내 카드사 할부 수수료 산식)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>예시:</strong> 100만원 / 12개월 / 연 19.9%<br />
            • 월 이자율 = 19.9 ÷ 12 ÷ 100 = <strong>1.658%</strong><br />
            • 1회차 납부액 ≈ <strong>99,917원</strong> (원금 83,333 + 수수료 16,583) → 마지막 회차 ≈ 84,715원<br />
            • 총 납부액 ≈ <strong>{won(AMT + F12)}</strong><br />
            • 총 수수료 ≈ <strong style={{ color: 'var(--danger)' }}>{won(F12)}</strong> (원금의 {pct(F12 / AMT * 100)})
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            연 19.9%인데 1년 할부 수수료가 원금의 {pct(F12 / AMT * 100)}에 그치는 이유는 잔액이 매달 줄어들기 때문입니다. 12개월 동안 평균 잔액은 원금의 (12+1)/24, 약 54%이므로 실제 부담은 표시 금리의 절반 남짓입니다. 반대로 &lsquo;원금 대비 이자율&rsquo;만 보고 대출 금리와 비교하면 할부가 싸 보이는 착시가 생기니, 비교할 때는 연 수수료율끼리 맞춰 보세요.
          </p>
        </div>

        {/* ── 2. 할부 수수료율 구조 ── */}
        <div>
          <h2 className="g-h2">
            할부 수수료율은 어떻게 정해지나
          </h2>
          <p className="g-p">
            카드 할부 수수료율은 카드사별로 고정된 하나의 값이 아니라 <strong>① 할부 기간(개월)</strong>과 <strong>② 회원 신용·이용 등급</strong>에 따라 차등 적용됩니다. 보통 기간이 길수록 수수료율이 높아지고, 상한은 법정 최고금리(연 20%) 아래에서 정해져 실무상 연 19.9%가 가장 높은 값입니다. 카드사마다 구간이 달라 본인 수수료율은 여신금융협회 공시실, 카드사 앱, 결제 화면에서 확인해야 합니다.
          </p>
          <p className="g-p">
            아래 표는 100만원을 할부했을 때 수수료율과 개월수에 따라 총 수수료가 어떻게 달라지는지 계산기와 같은 산식으로 구한 값입니다. 개월수가 두 배가 되면 총 수수료도 거의 두 배가 되고, 수수료율이 같다면 금액에 정확히 비례합니다(300만원이면 표의 3배).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>개월</th>
                  <th scope="col" style={TH}>1회차 납부액 (19.9%)</th>
                  {FEE_RATES.map((r) => <th scope="col" key={r} style={TH}>총 수수료 연 {r}%</th>)}
                </tr>
              </thead>
              <tbody>
                {FEE_ROWS.map(({ n, fees }) => (
                  <tr key={n}>
                    <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{n}개월</th>
                    <td style={TD}>{won(AMT / n + AMT * 0.199 / 12)}</td>
                    {fees.map((f, i) => (
                      <td key={i} style={{ ...TD, color: i === fees.length - 1 ? 'var(--danger)' : 'var(--text)', fontWeight: i === fees.length - 1 ? 700 : 400 }}>
                        {won(f)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({pct(f / AMT * 100)})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">괄호 안은 원금 대비 비율. 카드사에 따라 이용일수 기준으로 일할 계산하므로, 이용일과 결제일에 따라 특히 1회차 수수료가 표와 다를 수 있습니다.</p>
        </div>

        {/* ── 3. 무이자 vs 유이자 ── */}
        <div>
          <h2 className="g-h2">
            무이자 할부 vs 부분 무이자 vs 유이자 할부
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '무이자 할부', c: 'var(--emerald-600)', items: ['수수료 0원', '카드사·가맹점이 부담', '가전·가구·여행 행사 때 자주 제공', '보통 2~12개월 (행사 따라 더 김)', '사용자에게 가장 유리'] },
              { t: '부분 무이자', c: 'var(--yellow-700)', items: ['일부 회차만 무이자', '예: 10개월 중 1~3회차 고객부담', '앞 회차 수수료만 내고 뒤 회차는 면제', '긴 무이자 광고 상당수가 부분 무이자'] },
              { t: '유이자 할부', c: 'var(--red-600)', items: ['기간·등급별 수수료율 (연 20% 미만)', '시중 대출 금리보다 높은 편', `연 19.9%·24개월이면 원금의 약 ${Math.round(F24 / AMT * 100)}%`, '가능하면 피하기'] },
            ].map((g) => (
              <div key={g.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it) => (<li key={it}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            부분 무이자는 수수료가 큰 <strong>앞 회차</strong>를 고객이 내는 구조라, 면제되는 회차 수에 비해 아끼는 돈이 적습니다. 100만원·12개월·연 19.9%에서 1~4회차만 고객이 부담하면 수수료는 {won(PARTIAL4)}으로, 전 회차 유이자({won(F12)})의 {Math.round(PARTIAL4 / F12 * 100)}%입니다. 12회차 중 3분의 1만 내는데 수수료는 절반 넘게 나가는 셈입니다. 계산기에서 &lsquo;부분 무이자&rsquo;를 고르고 고객부담 회차를 넣으면 정확한 금액이 나옵니다.
          </p>
        </div>

        {/* ── 4. 일시불 vs 무이자 결정 가이드 ── */}
        <div>
          <h2 className="g-h2">
            일시불 할인 vs 무이자 할부 — 손익분기 할인율
          </h2>
          <p className="g-p">
            일시불 할인은 결제하는 순간 확정되는 이익이고, 무이자 할부의 이익은 &lsquo;나중에 낼 돈을 그동안 예금·파킹통장에 두어 얻는 이자&rsquo;입니다. 계산기의 비교 탭은 매달 원금이 똑같이 빠져나가므로 평균 잔액을 원금의 절반으로 보고 운용이자를 구합니다. 이 모델에서 두 이익이 같아지는 일시불 할인율은 <strong>파킹 금리(%) × 무이자 개월 ÷ 24</strong>입니다. 예를 들어 연 3%·6개월이면 운용이자는 100만원당 {won(PARK6)}(세전), 손익분기 할인율은 {pct(beDiscount(3, 6), 2)}입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 400 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>무이자 개월</th>
                  {BE_RATES.map((r) => <th scope="col" key={r} style={TH}>파킹 연 {r}%</th>)}
                </tr>
              </thead>
              <tbody>
                {BE_MONTHS.map((n) => (
                  <tr key={n}>
                    <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{n}개월</th>
                    {BE_RATES.map((r) => <td key={r} style={TD}>{pct(beDiscount(r, n), 2)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">표의 값보다 일시불 할인율이 높으면 일시불이, 낮으면 무이자 할부 + 운용이 유리합니다. 이자소득세 15.4%를 떼면 운용이자가 줄어 손익분기 할인율도 그만큼 낮아집니다.</p>
          <Callout tone="tip" title="할인이 1~2%라도 일시불이 이기는 경우가 많습니다">
            무이자 12개월·파킹 연 3%라도 손익분기 할인율은 {pct(beDiscount(3, 12), 1)}입니다. 일시불 할인이 {pct(beDiscount(3, 12), 1)}를 넘으면 일시불이 낫고, 할인이 없거나 그보다 작을 때만 무이자 할부 + 운용이 유리합니다. 다만 비상금이 부족해 목돈을 한 번에 빼기 어렵다면 현금 흐름을 우선하세요.
          </Callout>
        </div>

        {/* ── 5. 무이자 함정 ── */}
        <div>
          <h2 className="g-h2">
            무이자 할부의 숨은 함정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '"24개월 무이자" 광고', d: '부분 무이자인 경우가 많음 — 앞 몇 회차는 고객이 수수료를 내고 나머지 회차만 면제' },
              { t: '약관 자세히 확인', d: '카드사·가맹점별 무이자 적용 회차·조건이 다름. 결제 직전 안내 문구와 적용 카드를 확인' },
              { t: '가맹점 부담 무이자', d: '일시불보다 가격이 더 높게 책정된 경우 있음. 일시불 할인 가능 여부 먼저 문의' },
              { t: '카드 등급·행사 조건', d: '같은 카드라도 회원 등급·결제 금액·행사 기간에 따라 무이자 개월이 다름' },
            ].map((c) => (
              <div key={c.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            무이자라고 생각했는데 명세서에 수수료가 찍혔다면, 결제 당시 행사 대상 카드·가맹점·금액 조건을 충족했는지부터 확인하세요. 무이자 행사는 대개 &lsquo;특정 기간·특정 업종·일정 금액 이상&rsquo;에만 적용되고, 행사 조건을 벗어나면 일반 유이자 할부로 처리됩니다.
          </p>
        </div>

        {/* ── 6. 선결제·청약철회·항변권 ── */}
        <div>
          <h2 className="g-h2">
            선결제, 청약철회, 할부 항변권 — 할부를 쓴 뒤 알아둘 것
          </h2>
          <p className="g-p">
            <strong>선결제</strong>: 유이자 할부는 남은 원금에만 수수료가 붙으므로 여유 자금이 생기면 선결제가 가장 확실한 절약입니다. 100만원·12개월·연 19.9%에서 6회차까지 낸 뒤 나머지를 선결제하면 약 {won(PREPAY_SAVED)}을 아낍니다. 선결제 시점까지 쌓인 수수료는 일할로 정산됩니다.
          </p>
          <p className="g-p">
            <strong>청약철회</strong>: 신용카드 할부 구매는 할부거래법상 간접할부계약이어서, 계약서를 받은 날(물건을 늦게 받았다면 받은 날)부터 <strong>7일 이내</strong>에 청약을 철회할 수 있습니다(할부거래에 관한 법률 제8조). 다만 소비자 잘못으로 물건이 훼손됐거나, 사용해서 가치가 크게 떨어진 경우 등은 철회가 제한됩니다.
          </p>
          <p className="g-p">
            <strong>할부 항변권</strong>: 물건이 오지 않거나, 계약이 해제·취소됐거나, 판매자가 하자 수리를 해 주지 않으면 카드사에 남은 할부금 지급을 거절할 수 있습니다(같은 법 제16조). 신용카드는 <strong>할부가격 20만원 이상·3개월 이상 할부</strong>일 때 적용되므로, 쇼핑몰 폐업 위험이 있는 선결제형 상품(헬스장·학원 장기 이용권 등)은 일시불보다 3개월 이상 할부가 소비자 보호에 유리할 수 있습니다. 항변권은 카드사에 서면으로 통지해야 효력이 분명해집니다.
          </p>
          <Callout tone="warn" title="긴 유이자 할부는 비용이 원금의 20~30%까지">
            연 19.9% 기준 24개월 할부의 수수료는 원금의 {pct(F24 / AMT * 100)}, 36개월은 {pct(F36 / AMT * 100)}입니다. 월 부담을 낮추려고 개월을 늘리기 전에, 더 낮은 금리의 대출이나 구매 시점 조정이 가능한지 먼저 따져 보세요.
          </Callout>
        </div>

        {/* ── 7. 포인트·캐시백 반영 ── */}
        <div>
          <h2 className="g-h2">
            포인트·캐시백까지 넣어 비교하는 법
          </h2>
          <p className="g-p">
            일시불 결제에만 붙는 포인트·캐시백은 사실상 할인과 같습니다. 계산기의 &lsquo;일시불 할인율&rsquo;과 &lsquo;포인트&rsquo; 칸에 넣으면 일시불 실결제액(원금 × (1 − 할인율) − 포인트)을 기준으로 할부 총액이 얼마나 더 드는지 보여 줍니다. 포인트는 1점이 1원으로 쓰이는 경우에만 금액 그대로 넣고, 특정 가맹점에서만 쓸 수 있거나 전환 비율이 있으면 실제로 쓸 수 있는 원화 가치로 낮춰 잡는 것이 정확합니다.
          </p>
          <p className="g-p">
            반대로 무이자 할부에도 같은 포인트가 적립된다면 두 선택지에서 서로 상쇄되므로 비교에서 빼야 합니다. 전월 실적 조건이 있는 카드는 할부 결제액이 매달 나눠 실적에 잡히는지, 결제 월에 한 번에 잡히는지가 카드사마다 달라 혜택 계산이 틀어질 수 있으니 카드 상품설명서의 실적 인정 기준을 확인하세요.
          </p>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',        desc: '원리금균등·원금균등 비교' },
              { href: '/tools/finance/compound',   icon: '📈', name: '복리 계산기',            desc: '거치식·적립식 복리 수익' },
              { href: '/tools/finance/salary',     icon: '💰', name: '연봉 실수령액 계산기',   desc: '2026년 기준 세후 월 실수령액' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',   desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/finance/cost-rate',  icon: '🍽️', name: '음식점 원가율 계산기',     desc: '재료비·배달 수수료·실질 원가율' },
              { href: '/tools/finance/vat',        icon: '🧾', name: '부가세 계산기',          desc: '공급가액·부가세 역산 계산' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
