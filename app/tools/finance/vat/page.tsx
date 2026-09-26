import Link from 'next/link'
import VatClient from './VatClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  calcVAT, compareGeneralVsSimplified, buildScenarioTable, compareExclusiveInclusive,
  SIMPLIFIED_VAT_RATES, SIMPLIFIED_THRESHOLD, SIMPLIFIED_INVOICE_THRESHOLD, SIMPLIFIED_EXEMPT_THRESHOLD, FREELANCER_TAX,
  type RoundUnit,
} from './vatUtils'

/* ── 가이드 수치 — 계산기와 같은 함수로 빌드 시 계산 ── */
const krw = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/** 만 원 단위 (소수 1자리, 예: 103.4만) */
const man = (n: number) => `${(Math.round(n / 1_000) / 10).toLocaleString('ko-KR')}만`
/** 억·만 표기 (예: 1억 400만) */
const eok = (n: number) => n >= 100_000_000
  ? `${Math.floor(n / 100_000_000)}억${n % 100_000_000 ? ` ${((n % 100_000_000) / 10_000).toLocaleString('ko-KR')}만` : ''}`
  : `${(n / 10_000).toLocaleString('ko-KR')}만`

/* 절사 단위별 역산 — 합계 100만 원 */
const ROUND_UNITS: { u: RoundUnit; label: string }[] = [
  { u: 'none', label: '절사 없음 (원 단위 반올림)' },
  { u: '10', label: '10원 단위 절사' },
  { u: '100', label: '100원 단위 절사' },
  { u: '1000', label: '1,000원 단위 절사' },
]
const ROUND_TOTAL = 1_000_000
const ROUND_ROWS = ROUND_UNITS.map(r => ({ ...r, res: calcVAT({ amount: ROUND_TOTAL, mode: 'remove', rate: 0.1, rounding: r.u }) }))
const SMALL = calcVAT({ amount: 10_000, mode: 'remove', rate: 0.1, rounding: 'none' })

/* 실입금 100만 원 역산 — 실입금 탭 시나리오 표와 같은 함수 */
const SCENARIOS = buildScenarioTable(1_000_000)
const EXC_INC = compareExclusiveInclusive(1_000_000)

/* 간이과세 기준 (공급대가, 미만) */
const RENTAL_THRESHOLD = SIMPLIFIED_VAT_RATES.find(r => r.threshold)?.threshold ?? SIMPLIFIED_EXEMPT_THRESHOLD

/* 일반 vs 간이 — 연 공급대가 1억, 매입(공급대가) 비율별 납부세액 */
const GS_REV = 100_000_000
const GS_RATIOS = [0.2, 0.5, 0.7, 0.8, 0.9]
const gs = (industryId: string, r: number) => {
  const gross = GS_REV * r
  const supply = Math.round(gross / 1.1)
  return compareGeneralVsSimplified({ annualRevenue: GS_REV, industryId, purchaseAmount: supply, vatPurchase: gross - supply })
}
const GS_ROWS = GS_RATIOS.map(r => ({ r, retail: gs('retail', r), service: gs('construct', r) }))
const GS_RETAIL = SIMPLIFIED_VAT_RATES.find(r => r.id === 'retail')!
const GS_SERVICE = SIMPLIFIED_VAT_RATES.find(r => r.id === 'construct')!
const toneLabel = (t: string) => (t === 'simplified' ? '간이 유리' : t === 'general' ? '일반 유리' : '비슷')

export const metadata = buildMetadata({
  path: '/tools/finance/vat',
  title: '부가세 계산기 2026 — 역산·견적서·실입금·세금계산서·일반 간이 비교',
  description: '공급가·세액·합계 자유 역산으로 견적서·세금계산서 그대로. 프리랜서·사업자용 부가세 + 일반 vs 간이과세·실입금 역산까지.',
  keywords: [
    '부가세계산기', 'vat계산기', '부가가치세계산기', '공급가액역산',
    '간이과세계산기', '부가세역산', '프리랜서부가세', '실입금역산',
    '세금계산서계산', '부가세별도', '부가세포함', '크몽수수료부가세',
    '일반과세간이과세비교', '한국부가세', '견적서계산기', '공급대가역산',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const box: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }

const FAQ_LD = [
  {
    q: '3.3% 프리랜서는 부가세 신고 의무가 있나요?',
    a: `사무실 같은 물적 시설 없이, 직원을 고용하지 않고 혼자 용역을 제공하는 인적용역(작가·강사·디자이너 등)은 부가가치세 면세라 부가세를 신고·납부하지 않습니다(부가가치세법 시행령 §42). 사업자 등록을 안 해서가 아니라 <strong>면세 용역</strong>이기 때문입니다. 이 경우 보수에서 ${(FREELANCER_TAX.total * 100).toFixed(1)}%(소득세 ${FREELANCER_TAX.income * 100}% + 지방소득세 ${(FREELANCER_TAX.local * 100).toFixed(1)}%)가 원천징수되고, 다음 해 5월 종합소득세 신고로 정산합니다. 반대로 사무실을 두거나 직원을 쓰거나 물건을 팔면 과세사업자로 등록해 부가세를 신고해야 하고, 등록하지 않으면 미등록 가산세가 붙습니다.`,
  },
  {
    q: '부가세 신고는 언제 해야 하나요?',
    a: '개인 일반과세자는 연 2회 확정신고합니다 — 1월 25일까지 전년 7~12월분, 7월 25일까지 1~6월분. 그 사이 4월·10월에는 직전 6개월 납부세액의 절반이 예정고지됩니다. 법인은 예정신고까지 연 4회입니다. 간이과세자는 1월 25일까지 전년 1년분을 한 번 신고하고, 7월에 직전 연도 납부세액의 절반이 예정부과됩니다. 기한이 토·일요일이나 공휴일이면 다음 영업일까지입니다. 신규 사업자는 사업 개시일이 속하는 과세기간부터 신고 의무가 생깁니다.',
  },
  {
    q: '부가세를 10원·1,000원 단위로 절사해도 되나요?',
    a: `부가세는 공급가액의 10%가 원칙이라(부가가치세법 §30) 세금계산서에는 보통 원 단위 미만만 버립니다. 계산기의 10원·100원·1,000원 절사는 견적 합계를 딱 떨어지게 맞출 때 쓰는 참고 기능인데, 합계 ${krw(ROUND_TOTAL)}을 1,000원 단위로 절사해 역산하면 부가세가 ${krw(ROUND_ROWS[3].res.vat)}, 공급가액이 ${krw(ROUND_ROWS[3].res.supplyAmount)}이 되어 세율이 10%에서 벗어납니다. 끝자리를 맞추고 싶다면 부가세를 깎기보다 단가(공급가액)를 조정해 합의하는 편이 안전합니다. 참고로 국고금 관리법에 따라 세금을 실제로 납부·환급할 때는 10원 미만 끝수를 계산하지 않습니다.`,
  },
  {
    q: '공급가액과 공급대가의 차이는?',
    a: '공급가액은 부가세를 제외한 순수 재화·용역 금액이고, 공급대가(합계금액)는 공급가액에 부가세를 더한 금액입니다. 세금계산서에는 공급가액과 세액이 따로 적히고, 영수증·카드전표에 찍힌 금액은 대부분 공급대가입니다. 간이과세 기준(연 1억 400만 원)과 납부 면제 기준(4,800만 원)은 공급대가로 따지므로, 매출을 셀 때 부가세를 포함한 금액으로 보세요.',
  },
  {
    q: '간이과세자는 세금계산서를 발급할 수 없나요?',
    a: `2021년 7월부터 직전 연도 공급대가가 ${eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원 이상인 간이과세자는 세금계산서 발급 의무가 있습니다. 반면 ${eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원 미만인 간이과세자와 신규 간이과세자는 세금계산서를 발급할 수 없고 영수증(신용카드 매출전표·현금영수증 포함)만 발급합니다. 거래처가 매입세액 공제용 세금계산서를 꼭 받아야 한다면 일반과세 전환을 검토해야 합니다.`,
  },
  {
    q: '"100만원 부가세 포함"과 "100만원 부가세 별도" 어느 게 더 받는 건가요?',
    a: `부가세 별도가 더 받는 계약입니다. 부가세 별도는 ${krw(EXC_INC.exclusive.totalCharge)}을 청구하고 그중 공급가액 ${krw(EXC_INC.exclusive.received)}이 본인 몫입니다. 부가세 포함은 ${krw(EXC_INC.inclusive.totalCharge)}을 청구하고, 그 안에 부가세 ${krw(EXC_INC.inclusive.vat)}이 들어 있어 본인 몫은 ${krw(EXC_INC.inclusive.received)}입니다. 같은 &lsquo;100만 원 계약&rsquo;이라도 ${krw(EXC_INC.diff)} 차이가 나므로, 견적서와 계약서에 &lsquo;부가세 별도&rsquo;를 분명히 적으세요.`,
  },
  {
    q: '실입금 100만원 받으려면 청구를 얼마 해야 하나요?',
    a: `계산기의 「실입금 역산」 탭이 사업자 유형·플랫폼 수수료별로 계산합니다(부가세는 신고·납부로 빠져나가는 돈이라 실수입에서 제외). 부가세 별도 사업자 직거래는 ${man(SCENARIOS[3].totalCharge)} 원, 3.3% 프리랜서 직거래는 약 ${man(SCENARIOS[0].totalCharge)} 원, 수수료 20% 플랫폼을 쓰는 프리랜서는 약 ${man(SCENARIOS[2].totalCharge)} 원을 청구해야 합니다. 받은 부가세는 본인 돈이 아니므로 별도 계좌에 떼어 두었다가 신고 때 납부하세요.`,
  },
  {
    q: '일반과세자 vs 간이과세자 어느 게 유리한가요?',
    a: `납부세액만 보면 매입이 매출의 대부분을 차지하는 경우를 빼고는 간이과세가 대체로 적게 냅니다. 계산기 기준으로 연 공급대가 1억 원 정보통신·서비스업(부가가치율 30%)은 매입 비율이 70%를 넘어서야 일반과세가 유리해집니다. 다만 간이과세자는 매입세액이 매출세액보다 많아도 환급을 받을 수 없어, 개업 초기 인테리어·장비 투자가 큰 사업은 일반과세로 시작해 환급을 받는 편이 나을 수 있습니다. 연 공급대가 ${eok(SIMPLIFIED_THRESHOLD)} 원 이상(부동산임대업·과세유흥장소는 ${eok(RENTAL_THRESHOLD)} 원 이상)이면 간이과세를 적용받을 수 없습니다.`,
  },
  {
    q: '면세 품목이 섞인 견적서는 어떻게 계산하나요?',
    a: '품목마다 과세·면세를 나눠 부가세를 계산합니다. 도서·기초 농산물·일부 교육 용역처럼 면세인 품목에는 부가세를 붙이지 않고, 과세 품목의 공급가액에만 10%를 곱합니다. 계산기 「견적서」 탭에서 품목별로 과세 여부를 체크하면 과세 공급가액·면세 공급가액·부가세가 따로 합산됩니다. 과세와 면세를 함께 파는 겸영사업자는 세금계산서(과세분)와 계산서(면세분)를 나눠 발급합니다.',
  },
  {
    q: '역산한 공급가액이 1원씩 안 맞는 이유는?',
    a: `합계 ÷ 1.1이 딱 나누어떨어지지 않기 때문입니다. 계산기는 공급가액을 원 단위로 반올림하고 나머지를 부가세로 둡니다. 예를 들어 합계 10,000원은 공급가액 ${krw(SMALL.supplyAmount)} + 부가세 ${krw(SMALL.vat)}으로 나뉘어, 부가세가 공급가액의 정확히 10%(909.1원)와 1원 미만 차이가 납니다. 이 정도 끝수 차이는 정상이며, 합계 금액이 영수증과 일치하는지를 먼저 확인하세요.`,
  },
]

export default function VatPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/vat">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />부가세 계산기
      </h1>
      <p className="tp-lead">
        공급가·세액·합계 자유 역산. 견적서·세금계산서 그대로 쓰는 <strong style={{ color: 'var(--text)' }}>사업자·프리랜서 도구</strong>.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 부가가치세법 기준 (간이과세 기준 1억 400만 원, 2024.7.1 시행)" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스","href":"https://hometax.go.kr"},{"label":"국가법령정보센터 부가가치세법","href":"https://www.law.go.kr/법령/부가가치세법"},{"label":"국가법령정보센터 부가가치세법 시행령","href":"https://www.law.go.kr/법령/부가가치세법시행령"}]} />

      <VatClient />

      <GuideDivider />

      {/* ── 1. 역산 공식 ── */}
      <h2 className="g-h2">역산 공식 — 합계에서 공급가액 구하기</h2>
      <p className="g-p">
        영수증이나 청구서에 찍힌 <strong>합계 금액(공급대가)</strong>에서 공급가액과 부가세를 나눠야 할 때 역산 공식을 씁니다.
        부가세율이 10%이므로 합계는 공급가액의 1.1배이고, 합계를 1.1로 나누면 공급가액이 나옵니다. 계산기의 「부가세 역산」 모드가 이 계산을 합니다.
      </p>
      <div style={{ ...box, marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '8px' }}>역산 공식 (부가세율 10% 기준)</p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text)', lineHeight: 2 }}>
          <p>공급가액 = 공급대가(합계) ÷ 1.1</p>
          <p>부가세 &nbsp;&nbsp;= 공급대가(합계) − 공급가액</p>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '8px' }}>
          예: 영수증 합계 110,000원 → 공급가액 110,000 ÷ 1.1 = <strong style={{ color: 'var(--text)' }}>100,000원</strong>, 부가세 = 110,000 − 100,000 = <strong style={{ color: 'var(--text)' }}>10,000원</strong>
        </p>
      </div>
      <p className="g-p">
        나누어떨어지지 않는 금액은 끝수 처리 방식에 따라 결과가 조금씩 달라집니다. 계산기는 &lsquo;절사 없음&rsquo;에서 공급가액을 원 단위로 반올림하고, 절사 옵션을 고르면 부가세를 그 단위로 버린 뒤 나머지를 공급가액으로 둡니다. 아래는 합계 {krw(ROUND_TOTAL)}을 역산한 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>절사 옵션</th>
              <th scope="col" style={thR}>공급가액</th>
              <th scope="col" style={thR}>부가세</th>
              <th scope="col" style={thR}>부가세 ÷ 공급가액</th>
            </tr>
          </thead>
          <tbody>
            {ROUND_ROWS.map((r, i) => (
              <tr key={r.u} style={rowStyle(i)}>
                <td style={td}>{r.label}</td>
                <td style={tdR}>{krw(r.res.supplyAmount)}</td>
                <td style={tdR}>{krw(r.res.vat)}</td>
                <td style={tdR}>{(r.res.vat / r.res.supplyAmount * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 절사 단위가 클수록 부가세가 10%에서 멀어집니다. 세금계산서는 원 미만 끝수만 버리는 것이 일반적이며, 큰 단위 절사는 거래처와 합의한 견적 참고용으로만 쓰세요.
      </p>

      {/* ── 2. 과세 유형 비교표 ── */}
      <h2 className="g-h2">부가세 과세 유형 비교</h2>
      <p className="g-p">
        같은 매출이라도 사업자 유형에 따라 부가세 계산 방식과 신고 횟수가 다릅니다. 2024년 7월부터 간이과세 기준이 직전 연도 공급대가 <strong>{eok(SIMPLIFIED_THRESHOLD)} 원</strong> 미만으로 올랐고, 부동산임대업·과세유흥장소는 {eok(RENTAL_THRESHOLD)} 원 미만으로 따로 정해져 있습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['구분', '일반과세자', '간이과세자', '면세사업자'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['적용 대상', `간이 기준 이상 (그 미만도 선택 가능)`, `직전 연도 공급대가 ${eok(SIMPLIFIED_THRESHOLD)} 원 미만 (배제 업종 제외)`, '면세 재화·용역만 공급'],
              ['세액 계산', '매출세액(10%) − 매입세액', '공급대가 × 업종별 부가가치율 × 10% − 공제', '부가세 없음'],
              ['세금계산서', '발급 의무', `직전 연도 ${eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원 이상 발급 의무 · 미만·신규는 발급 불가`, '계산서 발급'],
              ['신고 횟수', '개인 연 2회 (1월·7월) · 법인 연 4회', '연 1회 (1월)', '연 1회 사업장현황신고 (2월)'],
              ['매입세액', '전액 공제, 초과분 환급', '매입 공급대가 × 0.5% 공제, 환급 없음', '공제 불가'],
              ['대상 예시', '대부분 사업자', '소규모 자영업·식당', '병원·학원·도서 판매 등'],
            ].map(([label, a, b, c], i) => (
              <tr key={i} style={rowStyle(i)}>
                <th scope="row" style={{ ...tdMuted, fontWeight: 500, textAlign: 'left' }}>{label}</th>
                <td style={td}>{a}</td>
                <td style={td}>{b}</td>
                <td style={td}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="g-h3">간이과세자 업종별 부가가치율</h3>
      <p className="g-p">
        간이과세자는 매출에 10%를 그대로 매기지 않고, 업종별 부가가치율을 곱한 낮은 세율로 냅니다. 부가가치율은 부가가치세법 시행령 §111에 업종별로 정해져 있으며 2021년 7월부터 아래 값이 적용됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>업종</th>
              <th scope="col" style={thR}>부가가치율</th>
              <th scope="col" style={thR}>실효 세율</th>
              <th scope="col" style={thR}>간이 기준 (공급대가)</th>
            </tr>
          </thead>
          <tbody>
            {SIMPLIFIED_VAT_RATES.map((r, i) => (
              <tr key={r.id} style={rowStyle(i)}>
                <td style={td}>{r.name}</td>
                <td style={tdR}>{Math.round(r.rate * 100)}%</td>
                <td style={tdR}>{(r.effective * 100).toFixed(1)}%</td>
                <td style={tdR}>{eok(r.threshold ?? SIMPLIFIED_THRESHOLD)} 원 미만</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 실효 세율 = 부가세율 10% × 부가가치율. 매입세액은 2021년 7월부터 세금계산서 등으로 받은 매입 공급대가의 0.5%만 공제됩니다(업종별 부가가치율을 곱하던 방식 폐지). 해당 연도 공급대가가 {eok(SIMPLIFIED_EXEMPT_THRESHOLD)} 원 미만이면 납부 의무가 면제되지만 신고는 해야 합니다.
      </p>
      <p className="g-note">
        ※ 광업·제조업(과자점·떡방앗간·양복점 등 일부 제외)·도매업·부동산매매업·전문직 사업자(변호사·세무사·회계사 등) 같은 간이과세 배제 업종은 기준 금액 미만이어도 간이과세를 적용받을 수 없습니다(부가가치세법 시행령 §109②). 표의 제조업 부가가치율은 간이과세가 허용되는 일부 제조업에, 전문서비스 부가가치율은 배제 대상이 아닌 서비스업에 쓰입니다.
      </p>

      {/* ── 3. 계산 예시 ── */}
      <h2 className="g-h2">계산 예시 시나리오</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {[
          {
            tag: '부가세 추가',
            title: '과세사업자로 등록한 디자이너 — 용역비 200만 원 청구',
            content: '공급가액 2,000,000원 + 부가세 200,000원 = 세금계산서 합계 2,200,000원. 받은 부가세 200,000원은 해당 과세기간의 확정신고(개인은 1월·7월) 때 매입세액을 빼고 납부합니다.',
          },
          {
            tag: '부가세 역산',
            title: '자영업자 — 매입 세금계산서 합계에서 공급가액 파악',
            content: '매입 합계가 330,000원이면 공급가액 = 330,000 ÷ 1.1 = 300,000원, 부가세 = 30,000원. 일반과세자라면 이 30,000원을 매입세액으로 공제받고, 간이과세자라면 매입 공급대가 330,000원의 0.5%인 1,650원을 공제받습니다.',
          },
          {
            tag: '견적서',
            title: '과세 품목과 면세 품목이 섞인 견적',
            content: '디자인 용역 100만 원 + 인쇄 20만 원(과세) + 도서 2만 원(면세)이면 과세 공급가액 120만 원에만 부가세 12만 원이 붙어 합계 134만 원입니다. 계산기 「견적서」 탭의 기본 예시가 이 조합입니다.',
          },
        ].map((ex) => (
          <div key={ex.tag} style={box}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 'var(--radius-pill)', padding: '2px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>{ex.tag}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ex.title}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{ex.content}</p>
          </div>
        ))}
      </div>

      {/* ── 4. 실입금 역산 ── */}
      <h2 className="g-h2">실입금 역산 — 프리랜서·사업자 가이드</h2>
      <p className="g-p">
        &lsquo;손에 100만 원을 쥐려면 얼마를 청구해야 하나&rsquo;는 원천징수·플랫폼 수수료·부가세가 어떻게 빠지는지에 달려 있습니다. 계산기는 필요한 공급가액을 X라 두고 <strong>실수입 = X × (1 − (1 + 부가세율) × 수수료율 − 원천징수율)</strong>을 풀어 역산합니다. 부가세는 받았다가 그대로 신고·납부하는 돈이라 실수입 계산에서는 빠집니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>실입금 100만 원 받으려면</th>
              <th scope="col" style={thR}>청구액</th>
              <th scope="col" style={th}>빠지는 돈</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((row, i) => (
              <tr key={row.type} style={rowStyle(i)}>
                <td style={{ ...td, fontWeight: 600 }}>{row.type}</td>
                <td style={{ ...tdR, fontWeight: 700 }}>{krw(row.totalCharge)}</td>
                <td style={tdMuted}>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 플랫폼 수수료 20%·2.5%는 예시 가정입니다. 실제 수수료는 플랫폼·거래 금액 구간·카테고리에 따라 다르니 약관의 수수료표를 확인해 「실입금 역산」 탭에 직접 입력하세요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, margin: '16px 0' }}>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>3.3% 원천징수 (프리랜서)</p>
          <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
            <li>면세 인적용역 제공자에게 적용</li>
            <li>지급하는 쪽이 떼고 입금</li>
            <li>소득세 3% + 지방소득세 0.3%</li>
            <li>5월 종합소득세 신고 때 정산 (환급 또는 추가 납부)</li>
          </ul>
        </div>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>10% 부가세 (과세사업자)</p>
          <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
            <li>과세사업자가 거래처에게서 받아 대신 납부</li>
            <li><strong>본인 돈이 아닙니다</strong> — 신고·납부 의무</li>
            <li>매입세액을 뺀 차액만 납부</li>
            <li>개인 연 2회, 법인 연 4회 신고</li>
          </ul>
        </div>
      </div>
      <Callout tone="warn" title="원천세와 부가세는 전혀 다른 세금입니다">
        3.3%는 내 소득세를 미리 내는 것이라 5월에 정산하면 돌려받을 수도 있지만, 부가세는 거래처가 낸 세금을 잠시 맡아 두는 것입니다. 과세사업자라면 받은 부가세를 별도 계좌에 떼어 두어야 신고 때 자금이 모자라지 않습니다.
      </Callout>

      {/* ── 5. 부가세 별도 vs 포함 ── */}
      <h2 className="g-h2">부가세 별도 vs 포함 — 계약 시 주의</h2>
      <p className="g-p">
        같은 &lsquo;100만 원 계약&rsquo;이라도 부가세 별도와 부가세 포함은 본인 몫이 {krw(EXC_INC.diff)} 차이 납니다. 견적서·계약서에 금액만 적고 부가세 조건을 빠뜨리면 나중에 &lsquo;포함인 줄 알았다&rsquo;는 분쟁이 생기기 쉬우니, 금액 옆에 조건을 꼭 적으세요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: '16px' }}>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>부가세 별도 (권장)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 6 }}>
            &ldquo;100만원 부가세 별도&rdquo; → {krw(EXC_INC.exclusive.totalCharge)} 청구
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
            공급가액 <strong>{krw(EXC_INC.exclusive.supply)}</strong> + 부가세 {krw(EXC_INC.exclusive.vat)}<br />
            <strong>본인 몫: {krw(EXC_INC.exclusive.received)}</strong>
          </p>
        </div>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>부가세 포함</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 6 }}>
            &ldquo;100만원 부가세 포함&rdquo; → {krw(EXC_INC.inclusive.totalCharge)} 청구
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
            공급가액 <strong>{krw(EXC_INC.inclusive.supply)}</strong> + 부가세 {krw(EXC_INC.inclusive.vat)}<br />
            <strong style={{ color: 'var(--danger)' }}>본인 몫: {krw(EXC_INC.inclusive.received)} (−{krw(EXC_INC.diff)})</strong>
          </p>
        </div>
      </div>

      {/* ── 6. 일반 vs 간이 ── */}
      <h2 className="g-h2">일반과세 vs 간이과세 — 어떻게 결정?</h2>
      <p className="g-p">
        일반과세자는 매출세액에서 매입세액을 빼고, 간이과세자는 매출(공급대가)에 업종 실효세율을 곱한 뒤 매입의 0.5%만 뺍니다. 그래서 <strong>매입 비중이 클수록 일반과세가 유리</strong>해집니다. 아래는 연 공급대가 1억 원 사업자가 매입 비율(매입 공급대가 ÷ 매출)에 따라 한 해에 낼 부가세를 계산기로 구한 값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>매입 비율</th>
              <th scope="col" style={thR}>{GS_RETAIL.name} 일반</th>
              <th scope="col" style={thR}>간이 ({Math.round(GS_RETAIL.rate * 100)}%)</th>
              <th scope="col" style={thR}>{GS_SERVICE.name} 일반</th>
              <th scope="col" style={thR}>간이 ({Math.round(GS_SERVICE.rate * 100)}%)</th>
            </tr>
          </thead>
          <tbody>
            {GS_ROWS.map((row, i) => (
              <tr key={row.r} style={rowStyle(i)}>
                <td style={td}>{Math.round(row.r * 100)}%</td>
                <td style={tdR}>{man(row.retail.general.vatPayable)}</td>
                <td style={tdR}>{man(row.retail.simplified.vatPayable)} <span style={{ color: 'var(--muted)' }}>· {toneLabel(row.retail.tone)}</span></td>
                <td style={tdR}>{man(row.service.general.vatPayable)}</td>
                <td style={tdR}>{man(row.service.simplified.vatPayable)} <span style={{ color: 'var(--muted)' }}>· {toneLabel(row.service.tone)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 단위: 만 원/년. 차이가 10만 원 이내면 &lsquo;비슷&rsquo;으로 표시합니다(계산기 「일반 vs 간이」 탭과 같은 기준).
      </p>
      <p className="g-p">
        세금 액수 외에도 따질 것이 있습니다. 거래처가 대부분 사업자라 세금계산서를 요구하면 간이과세(특히 {eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원 미만)는 영업에 불리하고, 개업 초기에 인테리어·장비를 크게 사면 일반과세자만 매입세액을 환급받을 수 있습니다. 반대로 소비자 상대 업종에 매입이 적다면 간이과세의 낮은 실효세율과 연 1회 신고가 확실한 이점입니다. 간이과세자도 원하면 &lsquo;간이과세 포기 신고&rsquo;로 일반과세를 적용받을 수 있는데, 포기 후 다시 간이과세를 적용받는 데에는 제한이 있으니 신고 전에 국세청 안내로 재적용 요건을 확인하세요.
      </p>

      {/* ── 7. 세금계산서 ── */}
      <h2 className="g-h2">세금계산서 발급 가이드</h2>
      <p className="g-p">
        세금계산서는 사업자 간 거래의 법적 증빙이자, 받는 쪽이 매입세액을 공제받는 근거입니다. 사업자 유형에 따라 발급 의무와 방법이 다릅니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>사업자 유형</th>
              <th scope="col" style={th}>발급 의무</th>
              <th scope="col" style={th}>발급 방법</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['일반과세자', '발급 의무 (사업자 거래)', '홈택스 전자세금계산서'],
              [`간이과세자 (${eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원↑)`, '발급 의무', '홈택스 전자세금계산서'],
              [`간이과세자 (${eok(SIMPLIFIED_INVOICE_THRESHOLD)} 원↓·신규)`, '발급 불가 (영수증만)', '신용카드 전표·현금영수증'],
              ['면세사업자', '계산서 발급 (부가세 없음)', '홈택스 전자계산서'],
              ['면세 인적용역 프리랜서', '발급하지 않음 (3.3% 원천징수)', '용역계약서·원천징수영수증으로 증빙'],
            ].map((row, i) => (
              <tr key={i} style={rowStyle(i)}>
                <td style={{ ...td, fontWeight: 600 }}>{row[0]}</td>
                <td style={tdMuted}>{row[1]}</td>
                <td style={tdMuted}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 계산기의 「세금계산서」 탭은 입력 참고용 양식만 만들며, 법적 효력은 홈택스 등에서 발급한 전자세금계산서에만 있습니다.
      </p>

      {/* ── 8. 신고·납부 시기 ── */}
      <h2 className="g-h2">부가세 신고·납부 시기</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: '16px' }}>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>개인 일반과세자 (연 2회)</p>
          <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>1월 1~25일</strong>: 전년 7~12월분 확정신고</li>
            <li><strong style={{ color: 'var(--text)' }}>7월 1~25일</strong>: 1~6월분 확정신고</li>
            <li>납부 기한 = 신고 기한 (25일까지)</li>
            <li>예정고지 (4월·10월): 직전 과세기간(6개월) 납부세액의 1/2 고지</li>
          </ul>
        </div>
        <div style={box}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>간이과세자 (연 1회)</p>
          <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>1월 1~25일</strong>: 전년 1~12월분 신고</li>
            <li>납부 기한 = 1월 25일</li>
            <li>7월 예정부과: 직전 연도 납부세액의 절반을 고지</li>
            <li>공급대가 {eok(SIMPLIFIED_EXEMPT_THRESHOLD)} 원 미만은 납부 면제 (신고는 필요)</li>
          </ul>
        </div>
      </div>
      <p className="g-note">
        ※ 신규 사업자는 사업 개시일이 속하는 과세기간부터 신고 의무가 생깁니다. 기한 안에 신고하지 않으면 무신고 가산세와 납부지연 가산세가 붙으니, 매출이 없어도 무실적 신고는 해 두세요. 홈택스 또는 손택스 앱에서 전자 신고할 수 있습니다.
      </p>

      <Faq items={FAQ_LD} />

      <Disclaimer variant="finance" open>
        본 부가세 계산기는 <strong>일반 정보 제공 목적의 참고용 도구</strong>이며, 세무 자문·신고 도구가 아닙니다.
        <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
          <li>정확한 부가세 신고는 홈택스 또는 세무사 권장</li>
          <li>업종별 세부 규정 (의제매입세액·면세 등) 다양</li>
          <li>정책 변경 가능 — 본 도구는 2026년 9월 부가가치세법 기준</li>
          <li>본 도구의 결과는 일반 케이스 가정이며 실제와 차이 가능</li>
        </ul>
        <p style={{ margin: '8px 0 4px' }}>세무 도움 필요 시:</p>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>국세상담센터: <strong>126</strong></li>
          <li>홈택스: <strong>hometax.go.kr</strong></li>
          <li>관할 세무서 민원봉사실 또는 세무사</li>
        </ul>
      </Disclaimer>

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[
          { href: '/tools/finance/freelance-tax', icon: '🧾', name: '프리랜서 종합소득세', desc: '3.3% 원천징수 5월 정산' },
          { href: '/tools/finance/salary',   icon: '💰', name: '연봉 실수령액 계산기', desc: '사업소득과 근로소득 세후 비교' },
          { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '사업 운영자금 대출 이자 계산' },
          { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '절세한 금액으로 장기 투자 시뮬레이션' },
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
    </ToolPage>
  )
}
