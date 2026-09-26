import Link from 'next/link'
import AuctionClient from './AuctionClient'
import {
  acquisitionTaxBreakdown, calcAcquisitionTax, calcLegalFee, calcStampTax, calcHousingBond, calcLoan,
  recommendLtv, recommendStressRate, mortgageCapMan, MANUAL_ITEMS, type OwnerType, type Region,
} from './auctionUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/auction',
  title: '경매 비용 계산기 — 낙찰가 + 취득세 자동 + 명도·체납·LTV/DSR',
  description: '낙찰가 + 취득세·명도·체납·수리·법무·대출까지 진짜 들어가는 비용. 1주택·다주택·법인 시나리오와 LTV/DSR 자동 반영.',
  keywords: ['경매 총비용', '낙찰가 부대비용', '경매 취득세', '명도비', '체납 관리비', 'LTV DSR', '경매 대출', '다주택 취득세', '법인 명의', '경매 계산기'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const TH: React.CSSProperties = { padding: '9px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, fontSize: 12, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '9px 10px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

/* ── 본문 표·예시 — 계산기와 같은 유틸(auctionUtils → lib/krAcquisitionTax·krLoanRules)로 빌드 시점 계산 ──
   전용 85㎡ 이하 아파트 기준(도구와 동일 가정). 금액 단위: 만원 */
/** 만원 → '1,435만원' · '2억 1,000만원' · '3억원' */
const man = (v: number) => {
  const m = Math.round(v)
  if (m < 10_000) return `${m.toLocaleString('ko-KR')}만원`
  const eok = Math.floor(m / 10_000)
  const rest = m % 10_000
  return rest === 0 ? `${eok}억원` : `${eok}억 ${rest.toLocaleString('ko-KR')}만원`
}
const pct = (v: number, d = 1) => `${v.toLocaleString('ko-KR', { maximumFractionDigits: d })}%`

/** 경매 특화·기타 수동 항목 기본값 합계 (명도 200 + 체납 관리비 100 + 공과금 30 + 수리 500 + 중개 0 + 기타 50) */
const MANUAL_DEFAULT = MANUAL_ITEMS.reduce((s, c) => s + c.defaultMan, 0)
const MANUAL_DEFAULT_OF = (id: string) => MANUAL_ITEMS.find((c) => c.id === id)?.defaultMan ?? 0

/** 낙찰가·명의·지역 → 부대비용 내역 (계산기 '총비용 계산' 탭의 자동 항목 + 수동 항목 기본값) */
function extraCost(priceMan: number, owner: OwnerType, region: Region) {
  const tax = calcAcquisitionTax(priceMan, 'apt', owner, region)
  const other = calcLegalFee(priceMan) + calcStampTax(priceMan) + calcHousingBond(priceMan, 'apt')
  const total = tax + other + MANUAL_DEFAULT
  return { tax, other, manual: MANUAL_DEFAULT, total, ratio: (total / priceMan) * 100 }
}

/* 취득세 표: 낙찰가 × (명의·지역) */
const ACQ_PRICES = [30_000, 50_000, 70_000, 90_000, 120_000]
const ACQ_COLS: { label: string; owner: OwnerType; region: Region }[] = [
  { label: '무주택 → 1주택', owner: 'live1', region: 'normal' },
  { label: '2주택째 (비조정)', owner: 'own1', region: 'normal' },
  { label: '2주택째 (조정)', owner: 'own1', region: 'adjusted' },
  { label: '3주택째 (비조정)', owner: 'multi2', region: 'normal' },
  { label: '3주택째 조정 · 4주택+ · 법인', owner: 'multi2', region: 'adjusted' },
]
const ACQ_ROWS = ACQ_PRICES.map((p) => ({
  p,
  cells: ACQ_COLS.map((c) => acquisitionTaxBreakdown(p, 'apt', c.owner, c.region)),
}))

/* 5억 아파트 명의별 총비용 (조정대상지역) */
const P5 = 50_000
const OWNER_CMP: { label: string; owner: OwnerType }[] = [
  { label: '무주택 → 1주택', owner: 'live1' },
  { label: '1주택 보유 → 2주택째', owner: 'own1' },
  { label: '2주택 보유 → 3주택째', owner: 'multi2' },
  { label: '법인 명의', owner: 'corp' },
]
const CMP_ROWS = OWNER_CMP.map((o) => ({ ...o, ...extraCost(P5, o.owner, 'adjusted') }))
const C5_LIVE = CMP_ROWS[0]
const C5_CORP = CMP_ROWS[3]

/* 계산기 첫 화면과 같은 예시: 3억 아파트 · 무주택 → 1주택 · 비규제 */
const P3 = 30_000
const EX3 = extraCost(P3, 'live1', 'normal')
const EX3_LEGAL = calcLegalFee(P3)
const EX3_STAMP = calcStampTax(P3)
const EX3_BOND = calcHousingBond(P3, 'apt')
const EX3_TOTAL = P3 + EX3.total

/* 대출 예시 — 계산기 '대출·자기자본' 탭 기본값(연 4.5% · 30년 · 연소득 5,000만원 · 기존 대출 0) */
const LOAN_RATE = 4.5
const LOAN_YEARS = 30
const LOAN_INCOME = 5_000
const loanFor = (priceMan: number, region: Region, owner: OwnerType) => {
  const total = priceMan + extraCost(priceMan, owner, region).total
  return {
    ltv: recommendLtv(region, owner),
    stress: recommendStressRate(region),
    total,
    ...calcLoan(priceMan, total, recommendLtv(region, owner), LOAN_RATE, LOAN_YEARS, LOAN_INCOME, 0, mortgageCapMan(priceMan, region), recommendStressRate(region)),
  }
}
const LOAN3 = loanFor(P3, 'normal', 'live1')
const LOAN5 = loanFor(P5, 'normal', 'live1')
const LOAN5R = loanFor(P5, 'adjusted', 'live1')

const FAQ_LD = [
  {
    q: '경매 부대비용은 낙찰가의 몇 %쯤 되나요?',
    a: `정해진 비율은 없고 명의와 물건 상태에 따라 크게 달라집니다. 이 계산기의 기본값(명도비 ${MANUAL_DEFAULT_OF('eviction')}만·체납 관리비 ${MANUAL_DEFAULT_OF('mngfee')}만·공과금 ${MANUAL_DEFAULT_OF('utility')}만·수리비 ${MANUAL_DEFAULT_OF('repair')}만·기타 ${MANUAL_DEFAULT_OF('extra')}만원)으로 조정대상지역 5억 아파트를 계산하면, 무주택자가 1주택이 되는 경우 부대비용은 약 <strong>${man(C5_LIVE.total)}(낙찰가의 ${pct(C5_LIVE.ratio)})</strong>, 법인 명의면 약 <strong>${man(C5_CORP.total)}(${pct(C5_CORP.ratio)})</strong>입니다. 차이의 대부분은 취득세이고, 나머지는 명도·수리처럼 물건마다 다른 항목입니다. 어림 비율보다 매각물건명세서와 현장 조사로 확인한 금액을 넣어 계산하세요.`,
  },
  {
    q: '취득세는 어떻게 계산되나요?',
    a: '주택인지, 이번 낙찰로 몇 번째 주택이 되는지(법인 여부), 조정대상지역인지에 따라 다릅니다(지방세법 제11조·제13조의2). 아래는 취득세 + 지방교육세 합계, 전용 85㎡ 이하 기준입니다.<br />• 1주택: 6억 이하 <strong>1.1%</strong>, 6~9억 구간 1.1~3.3%(가액에 따라 0.01%p 단위), 9억 초과 <strong>3.3%</strong><br />• 조정대상지역: 2주택째 <strong>8.4%</strong>, 3주택째 이상 <strong>12.4%</strong><br />• 비조정지역: 2주택째는 1주택과 같은 기본세율, 3주택째 <strong>8.4%</strong>, 4주택째 이상 <strong>12.4%</strong><br />• 법인: <strong>12.4%</strong>(주택 수·지역 무관)<br />• 오피스텔·상가·토지(비주택): <strong>4.6%</strong>(농어촌특별세 포함)<br />85㎡ 초과 주택은 농어촌특별세가 더해집니다. 시가표준액(공시가격) 1억 이하 주택(비수도권은 2025.1.2. 이후 취득분 2억 이하)은 정비구역 안이 아니면 중과에서 빠지며, 계산기에서 체크하면 반영됩니다. 감면·일시적 2주택 해당 여부는 위택스나 세무사에게 확인하세요.',
  },
  {
    q: '명도비는 얼마나 들까요?',
    a: '정해진 요율이 없고 점유자와의 협상 결과에 따라 달라집니다. 매각대금을 다 낸 뒤 <strong>6개월 이내</strong>에는 법원에 인도명령을 신청할 수 있어(민사집행법 제136조), 협상이 안 되면 인도명령 → 강제집행 순서로 진행합니다. 강제집행 비용(집행관 수수료·노무비·짐 보관비)은 매수인이 먼저 내야 하고 짐이 많을수록 늘어나, 실무에서는 이사비 일부를 지원하고 합의로 내보내는 경우가 많습니다. 배당을 받는 임차인은 배당금을 받을 때 매수인의 명도확인서가 필요해 비교적 협상이 쉽습니다. 계산기 기본값 200만원은 출발점일 뿐이니 점유자 유형을 확인해 조정하세요.',
  },
  {
    q: '체납 관리비는 누가 부담하나요?',
    a: '낙찰자는 전 소유자의 체납 관리비 중 <strong>공용부분 관리비(원금)만 승계</strong>합니다(대법원 2001다8677 전원합의체). 전유부분 관리비와 연체료는 승계 대상이 아니고, 3년 단기소멸시효가 지난 부분도 부담하지 않습니다.<br />• 입찰 전: 관리사무소에서 공용·전유를 구분한 미납 내역을 확인<br />• 장기간 비어 있던 집은 체납액이 커지는 경향<br />• 관리사무소가 전액을 요구하면 승계 범위를 근거로 협의<br />확인한 공용부분 금액을 계산기 체납 관리비 칸에 넣으세요.',
  },
  {
    q: '입찰보증금은 얼마이고, 잔금을 못 내면 어떻게 되나요?',
    a: '매수신청보증금은 원칙적으로 <strong>최저매각가격의 10%</strong>입니다(민사집행규칙 제63조). 한 번 낙찰됐다가 잔금 미납으로 다시 나온 재매각 사건은 법원이 보증금 비율을 높여 정하는 경우가 많으니 매각공고를 확인하세요. 대금지급기한(매각허가결정 확정일부터 1개월 안)까지 잔금을 내지 못하면 재매각이 진행되고, 전 매수인은 <strong>보증금을 돌려받지 못합니다</strong>(민사집행법 제137조·제138조). 경락잔금대출 한도를 입찰 전에 확인해야 하는 이유입니다.',
  },
  {
    q: '경매도 중개수수료가 드나요?',
    a: '법원 경매는 매수인이 직접 입찰하므로 매매 중개수수료가 없습니다(계산기 기본값 0원). 입찰을 대신 맡기려면 법원에 <strong>매수신청대리인으로 등록한 공인중개사</strong>나 변호사·법무사에게 맡길 수 있고, 공인중개사의 대리 보수는 대법원규칙(공인중개사의 매수신청대리인 등록 등에 관한 규칙)이 정한 범위 안에서 받게 돼 있습니다. 계약 전에 보수 기준을 서면으로 받아 두고, 등록 여부가 불분명한 컨설팅 업체의 고액 수수료는 피하세요.',
  },
  {
    q: '셀프 등기로 법무비를 아낄 수 있나요?',
    a: '가능합니다. 경매는 매수인이 대금을 내면 <strong>법원이 등기소에 소유권이전등기와 말소등기를 촉탁</strong>하는 방식이라(민사집행법 제144조), 매수인은 경매계에 등기촉탁 신청서와 취득세 영수증, 국민주택채권 매입 내역, 말소할 등기 목록, 등록면허세·등기신청수수료 납부 자료를 내면 됩니다. 법무사 보수(계산기 기준 낙찰가 × 0.2%, 30~200만원)를 아낄 수 있지만 서류가 빠지면 보정으로 등기가 늦어집니다. 경락잔금대출을 받으면 대출 은행이 지정한 법무사가 근저당 설정과 함께 처리하는 경우가 많아 셀프 등기가 어려울 수 있습니다.',
  },
  {
    q: '경매 LTV는 얼마까지 가능한가요?',
    a: '경락잔금대출에도 일반 주택담보대출 규제가 그대로 적용됩니다(2025.10.16 시행 10·15 대책 기준).<br />• 비규제지역: <strong>70%</strong>(다주택자·주택임대·매매사업자 60%, 수도권은 6·27 대책 이후 다주택자 추가 구입 주담대 금지)<br />• 규제지역(서울 전역·경기 12곳 등) 무주택자: <strong>40%</strong>(생애최초 70%)<br />• 규제지역 유주택자의 추가 주택 구입: 원칙적으로 <strong>0%</strong>(처분조건부 1주택은 40%)<br />• 수도권·규제지역 주담대 금액 상한: 담보가 15억 이하 6억, 15~25억 4억, 25억 초과 2억<br />여기에 <strong>DSR 40%</strong>(연소득 대비 연 원리금, 스트레스 금리 가산) 한도가 함께 적용돼 가장 작은 값이 한도가 됩니다. 규제는 자주 바뀌니 입찰 전 은행·금융위원회 최신 기준을 확인하세요.',
  },
  {
    q: '1주택과 다주택은 취득세 차이가 얼마나 나나요?',
    a: `5억 아파트(전용 85㎡ 이하) 기준으로 무주택자가 1주택이 되면 취득세·지방교육세 합계 <strong>${man(calcAcquisitionTax(P5, 'apt', 'live1', 'normal'))}(1.1%)</strong>, 조정대상지역 3주택째·비조정 4주택째 이상·법인이면 <strong>${man(calcAcquisitionTax(P5, 'apt', 'corp', 'adjusted'))}(12.4%)</strong>입니다. 차액은 약 ${man(calcAcquisitionTax(P5, 'apt', 'corp', 'adjusted') - calcAcquisitionTax(P5, 'apt', 'live1', 'normal'))}으로 11배가 넘습니다. 다주택자라면 이 차이만으로 입찰가를 크게 낮춰야 하니, 계산기의 시나리오 비교 탭에서 본인 낙찰가로 확인하세요.`,
  },
  {
    q: '법인 명의로 사면 유리한가요?',
    a: '주택이라면 2020년 7·10 대책 이후 대부분 불리합니다.<br />• 취득세 <strong>12.4%</strong>(주택 수·지역 무관, 1주택 특례 없음)<br />• 종합부동산세: 기본공제 없이 2주택 이하 <strong>2.7%</strong>·3주택 이상 <strong>5.0%</strong> 단일세율(개인은 누진 0.5~2.7%, 3주택 이상 중과 최대 5.0%)<br />• 주택을 팔 때 법인세에 더해 토지 등 양도소득에 대한 법인세 <strong>20%</strong> 추가 과세<br />• 법인 이익을 개인이 쓰려면 급여·배당으로 다시 과세<br />상가·토지 등 비주택은 셈법이 다르므로 임대업·개발업처럼 목적이 분명할 때 세무사와 함께 검토하세요.',
  },
  {
    q: '유치권·법정지상권이 있는 물건은 비용이 얼마나 드나요?',
    a: '금액을 미리 정할 수 없는 위험입니다.<br />• 유치권: 공사대금 등을 받지 못했다는 점유자가 인도를 거부. 신고만 돼 있고 성립하지 않는 경우도 많지만, 다투려면 소송이 필요할 수 있음<br />• 법정지상권: 토지와 건물 소유자가 달라지며 생기는 권리. 토지만 낙찰받으면 건물 철거·지료 문제로 장기 분쟁 가능<br />소송으로 가면 수년이 걸리고 그동안 대출이자와 기회비용이 쌓입니다. 매각물건명세서·현황조사서·등기부로 권리를 분석하고, 자신이 없으면 이런 표시가 있는 물건은 피하거나 입찰 전에 변호사 자문을 받으세요.',
  },
]

export default function AuctionPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/auction">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />경매 비용 계산기
      </h1>
      <p className="tp-lead">
        낙찰가 + 취득세·명도·체납·수리·대출까지 <strong style={{ color: 'var(--text)' }}>진짜 들어가는 비용</strong>을 시나리오별로.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 지방세법 기준 (취득세율 제11조·중과 제13조의2) · 대출 규제는 2025.10.16 시행 10·15 대책 기준 · 경매 절차는 민사집행법·민사집행규칙 기준" sources={[{"label":"위택스","href":"https://www.wetax.go.kr"},{"label":"행정안전부","href":"https://www.mois.go.kr"},{"label":"금융위원회 (대출 규제)","href":"https://www.fsc.go.kr"},{"label":"대법원 법원경매정보","href":"https://www.courtauction.go.kr"},{"label":"국가법령정보센터 민사집행법","href":"https://www.law.go.kr/법령/민사집행법"},{"label":"국가법령정보센터 주택임대차보호법","href":"https://www.law.go.kr/법령/주택임대차보호법"}]} />

      <AuctionClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>낙찰가·물건 종류·명의·지역 입력</strong> — 명의는 &lsquo;이번 낙찰로 몇 번째 주택이 되는지&rsquo; 기준</li>
          <li><strong>자동 추정 항목 확인</strong> — 취득세·법무비·인지세·국민주택채권 손실</li>
          <li><strong>경매 특화 비용 입력</strong> — 명도비·체납 관리비·수리비 (가장 변동이 큰 항목)</li>
          <li><strong>대출·자기자본 탭</strong>에서 LTV·DSR·금액 상한 중 가장 작은 값으로 필요한 현금 확인</li>
        </ol>
      </div>
      <Callout tone="tip">
        <strong>시나리오 비교 탭</strong>에서 같은 낙찰가에 명의(1주택·2주택째·3주택째·4주택째 이상·법인)별 총비용을 한 번에 비교할 수 있습니다. 명의 하나로 수천만원이 갈립니다.
      </Callout>

      {/* 2. 계산 구조 */}
      <h2 className="g-h2">총투자금은 이렇게 계산됩니다</h2>
      <p className="g-p">
        계산기의 총투자금은 <strong>낙찰가 + 자동 추정 4항목 + 직접 입력 6항목</strong>입니다. 자동 항목 중 취득세는 지방세법 세율표로 정확히 계산하고, 나머지는 어림 공식입니다. 법무비는 낙찰가의 0.2%를 30만~200만원 사이로 맞추고, 인지세는 인지세법의 부동산 소유권 이전 증서 정액(1억~10억 15만원 등)을, 국민주택채권은 사서 바로 팔 때 생기는 할인 손실만 비용으로 봐 낙찰가의 0.5%(비주택 1.2%)로 잡습니다. 실제 채권 매입액은 낙찰가가 아니라 시가표준액과 지역에 따라 정해지므로 이 두 항목은 등기를 맡길 법무사 견적으로 바꿔 넣는 편이 정확합니다.
      </p>
      <p className="g-p">
        계산기 첫 화면과 같은 조건(3억 아파트, 무주택자가 1주택 취득, 비규제지역)으로 풀어 보면 취득세 {man(calcAcquisitionTax(P3, 'apt', 'live1', 'normal'))}, 법무비 {man(EX3_LEGAL)}, 인지세 {man(EX3_STAMP)}, 채권 손실 {man(EX3_BOND)}에 직접 입력 항목 기본값 {man(MANUAL_DEFAULT)}을 더해 부대비용 {man(EX3.total)}, 총투자금 {man(EX3_TOTAL)}이 나옵니다. 낙찰가 대비 {pct(EX3.ratio)}입니다. 같은 3억이라도 조정대상지역에서 2주택째가 되면 취득세만 {man(calcAcquisitionTax(P3, 'apt', 'own1', 'adjusted'))}으로 뛰어, 부대비용이 {man(extraCost(P3, 'own1', 'adjusted').total)}이 됩니다.
      </p>
      <Callout tone="note" title="인지세는 확인이 필요한 항목">
        인지세법은 부동산 소유권 이전에 관한 <strong>증서(계약서 등)</strong>에 세금을 매깁니다. 매매계약서를 쓰지 않는 법원 경매에서 과세 대상 증서가 있는지는 등기를 맡길 법무사에게 확인하고, 해당하지 않으면 계산기에서 인지세 자동 계산을 끄세요. 계산기는 빠뜨리는 것보다 낫도록 보수적으로 포함해 둡니다.
      </Callout>

      {/* 3. 부대비용 10대 항목 */}
      <h2 className="g-h2">경매 부대비용 10대 항목</h2>
      <p className="g-p">
        아래는 계산기가 다루는 항목과 자동 계산 방식 또는 기본값입니다. 세금·법무 항목은 낙찰가로 정해지고, 경매 특화 항목은 물건 상태를 확인하기 전에는 알 수 없어 기본값을 출발점으로 두었습니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>항목</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>계산기 기준</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>구분</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['취득세 (지방교육세 포함)',       '낙찰가 × 1.1~12.4% (비주택 4.6%)',   '필수 / 자동'],
                ['인지세',                         '구간별 정액 (1억~10억 15만원)',       '과세 여부 확인 / 자동'],
                ['국민주택채권 즉시 매도 손실',    '낙찰가 × 0.5% (비주택 1.2%)',        '필수 / 자동 (어림)'],
                ['법무비 (등기 위임)',             '낙찰가 × 0.2%, 30~200만원',          '선택 (셀프 시 0)'],
                ['명도비 (이사비·강제집행)',       `기본 ${MANUAL_DEFAULT_OF('eviction')}만원`, '경매 특화 / 입력'],
                ['체납 관리비 (공용부분)',         `기본 ${MANUAL_DEFAULT_OF('mngfee')}만원`,   '경매 특화 / 입력'],
                ['체납 공과금',                    `기본 ${MANUAL_DEFAULT_OF('utility')}만원`,  '경매 특화 / 입력'],
                ['수리비 (도배·바닥·주방·욕실)',   `기본 ${MANUAL_DEFAULT_OF('repair')}만원`,   '선택 / 입력'],
                ['중개수수료',                     '경매는 보통 0',                       '대리 입찰 시 보수 별도'],
                ['기타 (감정·자문·세무)',          `기본 ${MANUAL_DEFAULT_OF('extra')}만원`,    '선택 / 입력'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      color: j === 1 ? 'var(--accent-ink)' : (j === 2 ? 'var(--muted)' : 'var(--text)'),
                      fontWeight: j === 0 ? 700 : 500,
                      fontSize: 13,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 취득세 표 */}
      <h2 className="g-h2">취득세 — 낙찰가·명의·지역별 세액표</h2>
      <p className="g-p">
        취득세는 <strong>이번 낙찰로 몇 번째 주택이 되는지</strong>와 <strong>조정대상지역인지</strong>가 가장 큰 변수입니다. 1주택 세율은 6억 이하 1%, 9억 초과 3%이고 그 사이는 가액에 비례해 올라가며, 지방교육세가 취득세율의 10%만큼 붙습니다. 중과(8%·12%)에는 지방교육세 0.4%가 더해집니다. 아래 표는 계산기와 같은 함수로 뽑은 취득세 + 지방교육세 합계입니다(전용 85㎡ 이하 아파트).
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...TH, textAlign: 'left' }}>낙찰가</th>
              {ACQ_COLS.map((c) => <th scope="col" key={c.label} style={TH}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {ACQ_ROWS.map((r) => (
              <tr key={r.p}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{(r.p / 10_000).toLocaleString('ko-KR')}억</th>
                {r.cells.map((b, i) => (
                  <td key={i} style={TD}>
                    {man(b.total / 10_000)} <span style={{ color: 'var(--muted)' }}>({pct(b.totalRate, 2)})</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">지방세법 제11조·제13조의2, 지방교육세 제151조 기준. 85㎡ 초과 주택은 농어촌특별세(표준 0.2%, 8% 중과 0.6%, 12% 중과 1.0%)가 더해집니다.</p>
      <ul className="g-list" style={{ marginTop: 12 }}>
        <li><strong>저가주택 중과 제외</strong>: 시가표준액(공시가격) 1억원 이하 주택은 정비구역 안이 아니면 다주택·법인이어도 중과하지 않습니다(지방세법 시행령 제28조의2). 비수도권은 2025.1.2. 이후 취득분부터 2억원 이하로 넓어졌습니다. 계산기에서 체크하면 표준세율로 계산합니다.</li>
        <li><strong>일시적 2주택</strong>: 조정대상지역 2주택째라도 종전 주택을 기한 안에 처분하면 1주택 세율이 적용됩니다. 이 경우 명의를 &lsquo;무주택 → 1주택&rsquo;으로 두고 계산하세요.</li>
        <li><strong>감면</strong>: 생애최초 등 취득세 감면은 계산에 넣지 않았습니다. 요건이 맞으면 위택스에서 따로 신청합니다.</li>
        <li><strong>신고 기한</strong>: 경매는 매각대금을 완납한 날이 취득일이고, 그날부터 60일 이내에 신고·납부해야 가산세가 붙지 않습니다(지방세법 제20조). 실무에서는 소유권이전등기 촉탁 전에 먼저 냅니다.</li>
      </ul>

      {/* 5. 명의별 총비용 */}
      <h2 className="g-h2">명의에 따라 총비용이 얼마나 달라지나 — 5억 아파트</h2>
      <p className="g-p">
        조정대상지역의 5억 아파트를 같은 조건(경매 특화 항목은 계산기 기본값)으로 낙찰받았을 때 명의별 부대비용입니다. 취득세를 뺀 나머지는 명의와 무관하게 같으므로, 명의 간 차이는 거의 전부 취득세에서 나옵니다. 다주택자가 1주택자와 같은 가격에 입찰하면 그만큼 수익을 먼저 내주고 시작하는 셈입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...TH, textAlign: 'left' }}>명의</th>
              <th scope="col" style={TH}>취득세 합계</th>
              <th scope="col" style={TH}>법무·인지·채권</th>
              <th scope="col" style={TH}>경매 특화·기타</th>
              <th scope="col" style={TH}>부대비용 계</th>
              <th scope="col" style={TH}>낙찰가 대비</th>
            </tr>
          </thead>
          <tbody>
            {CMP_ROWS.map((r) => (
              <tr key={r.owner}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{r.label}</th>
                <td style={TD}>{man(r.tax)}</td>
                <td style={TD}>{man(r.other)}</td>
                <td style={TD}>{man(r.manual)}</td>
                <td style={{ ...TD, fontWeight: 700 }}>{man(r.total)}</td>
                <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{pct(r.ratio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">비조정지역이면 2주택째는 1주택과 같은 세율, 3주택째는 8.4%입니다. 수리비·명도비를 실제 견적으로 바꾸면 비율이 크게 움직입니다.</p>

      {/* 6. 낙찰부터 인도까지 */}
      <h2 className="g-h2">낙찰부터 잔금·인도까지 — 돈이 나가는 시점</h2>
      <p className="g-p">
        경매는 매매보다 일정이 법으로 촘촘하게 정해져 있고, 기한을 놓치면 곧바로 손실로 이어집니다. 특히 잔금은 매각허가결정이 확정된 뒤 한 달 안에 내야 하므로, 대출 심사를 낙찰 뒤에 시작하면 시간이 빠듯합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...TH, textAlign: 'left' }}>단계</th>
              <th scope="col" style={{ ...TH, textAlign: 'left' }}>기한·금액</th>
              <th scope="col" style={{ ...TH, textAlign: 'left' }}>근거</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['입찰', '매수신청보증금 = 최저매각가격의 10% (재매각은 높게 정하기도 함)', '민사집행규칙 제63조'],
              ['매각결정기일', '매각기일부터 1주 이내 — 매각허가 여부 결정', '민사집행법 제109조'],
              ['허가결정 확정', '즉시항고가 없으면 결정 고지 후 1주가 지나 확정', '민사집행법 제15조·제129조'],
              ['대금 납부', '대금지급기한: 허가결정 확정일부터 1개월 안 — 미납 시 보증금 몰수·재매각', '민사집행규칙 제78조 · 민사집행법 제137조·제138조'],
              ['소유권 취득', '매각대금을 다 낸 때 (등기 전이라도)', '민사집행법 제135조'],
              ['취득세 신고·납부', '취득일(대금 완납일)부터 60일 이내', '지방세법 제20조'],
              ['등기', '법원이 소유권이전·말소등기를 촉탁', '민사집행법 제144조'],
              ['인도명령 신청', '대금 납부 후 6개월 이내', '민사집행법 제136조'],
            ].map((row, i) => (
              <tr key={i}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{row[0]}</th>
                <td style={{ ...TD, textAlign: 'left', whiteSpace: 'normal', lineHeight: 1.6 }}>{row[1]}</td>
                <td style={{ ...TD, textAlign: 'left', color: 'var(--muted)', whiteSpace: 'normal', lineHeight: 1.6 }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="warn" title="대출이 안 나오면 보증금을 잃습니다">
        잔금을 기한 안에 못 내면 재매각이 진행되고 앞선 매수인은 매수신청보증금을 돌려받지 못합니다. 경락잔금대출 한도는 소득·보유 주택 수·지역에 따라 0원이 될 수도 있으니, 입찰 전에 은행에서 한도를 확인하고 아래 대출 탭으로 자기자본 부족액을 먼저 계산하세요.
      </Callout>

      {/* 7. 명도·체납·수리 */}
      <h2 className="g-h2">명도·체납·수리 — 경매에만 있는 비용</h2>
      <p className="g-p">
        일반 매매에는 없는 <strong>경매만의 추가 비용</strong>이며, 물건마다 편차가 매우 큽니다. 입찰 전에 할 수 있는 조사는 현장 방문, 관리사무소 확인, 법원이 공개하는 매각물건명세서·현황조사서·감정평가서 열람 세 가지입니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
        {[
          { t: '명도비 (이사비)', d: '점유자를 내보내는 비용. 협상이 안 되면 대금 납부 후 6개월 안에 인도명령을 받아 강제집행하며, 집행 비용은 매수인이 먼저 냅니다.', c: 'var(--orange-600)' },
          { t: '체납 관리비', d: '전 소유자 미납 관리비 중 공용부분 원금만 승계(전유부분·연체료 제외). 입찰 전 관리사무소에서 공용·전유 구분 내역을 확인하세요.', c: 'var(--pink-600)' },
          { t: '체납 공과금', d: '전기·수도·가스 미납분. 승계 여부와 처리 방법은 공급 사업자·지자체 규정에 따라 달라, 입찰 전에 각 사업자에게 미납액과 명의 변경 절차를 문의해 두는 것이 안전합니다.', c: 'var(--amber-600)' },
          { t: '수리비', d: '오래 비어 있었거나 점유자가 협조하지 않은 집은 내부를 보지 못한 채 입찰하게 됩니다. 도배·바닥·욕실 교체를 모두 가정한 보수적 견적을 넣으세요.', c: 'var(--cyan-600)' },
        ].map((g) => (
          <div key={g.t} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
          </div>
        ))}
      </div>

      {/* 8. 인수 권리 */}
      <h2 className="g-h2">계산기에 없는 가장 큰 비용 — 매수인이 떠안는 권리</h2>
      <p className="g-p">
        경매로 팔리면 대부분의 저당권·가압류는 지워지지만, 모든 권리가 사라지는 것은 아닙니다. 가장 흔하고 금액이 큰 것이 <strong>대항력 있는 임차인의 보증금</strong>입니다. 주택임대차보호법 제3조의5는 경매로 임차주택이 팔리면 임차권이 소멸한다고 하면서도, 보증금을 다 돌려받지 못한 대항력 있는 임차권은 예외로 둡니다. 즉 가장 앞선 저당권·가압류 등보다 먼저 대항력(주택 인도 + 전입신고)을 갖춘 임차인이 배당으로 보증금을 다 받지 못하면, 나머지를 <strong>낙찰자가 물어줘야</strong> 합니다.
      </p>
      <p className="g-p">
        이 금액은 낙찰가와 별개로 나가는 돈이라 계산기의 어느 칸에도 자동으로 잡히지 않습니다. 매각물건명세서의 &lsquo;매수인에게 대항할 수 있는 임차인&rsquo; 표시와 배당요구 여부를 확인하고, 인수할 보증금이 있다면 &lsquo;기타&rsquo; 칸에 넣어 총투자금에 포함하세요. 선순위 가처분·지상권처럼 말소되지 않는 권리가 있거나 권리관계가 복잡하면 입찰 전에 변호사·법무사의 권리분석을 받는 것이 비용을 줄이는 길입니다.
      </p>

      {/* 9. LTV·DSR */}
      <h2 className="g-h2">대출 LTV·DSR — 자기자본이 얼마나 필요한가</h2>
      <p className="g-p">
        경락잔금대출도 일반 주택담보대출과 같은 규제를 받아 <strong>LTV 한도·DSR 한도·주담대 금액 상한</strong> 중 가장 작은 값이 대출 가능액이 됩니다. LTV는 낙찰가(담보가치)에 곱하고, 부대비용은 대출 대상이 아니므로 전부 자기자본으로 준비해야 합니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 12 }}>
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, margin: '0 0 6px' }}>LTV (담보인정비율)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
            비규제지역 70%(다주택·법인 60%) / 규제지역 무주택자 40% / 규제지역 유주택자 추가 구입 0% (10·15 대책). 수도권·규제지역은 금액 상한(6억·4억·2억)도 함께 적용.
          </p>
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, margin: '0 0 6px' }}>DSR (총부채원리금상환비율)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
            연소득 대비 연 원리금 40% 한도. 기존 대출과 신규 대출을 합산하고, 심사 금리에 스트레스 금리(규제지역 3.0%p, 그 외 계산기 기본 1.5%p)를 더합니다.
          </p>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        계산기 대출 탭 기본값(연 {LOAN_RATE}% · {LOAN_YEARS}년 원리금균등 · 연소득 {man(LOAN_INCOME)} · 기존 대출 없음)으로 비교해 보면 차이가 분명합니다. 비규제지역 3억 아파트는 LTV {LOAN3.ltv}% 한도 {man(LOAN3.ltvLimit)}이 DSR 한도 {man(LOAN3.dsrLimit)}보다 작아 대출 {man(LOAN3.loanAmount)}, 필요한 자기자본은 {man(LOAN3.ownEquity)}입니다. 같은 소득으로 5억 아파트를 사면 LTV 한도는 {man(LOAN5.ltvLimit)}으로 늘지만 DSR 한도 {man(LOAN5.dsrLimit)}에 막혀 자기자본이 {man(LOAN5.ownEquity)}으로 커집니다. 규제지역이면 LTV가 {LOAN5R.ltv}%로 내려가 대출 {man(LOAN5R.loanAmount)}, 자기자본 {man(LOAN5R.ownEquity)}이 필요합니다.
      </p>
      <p className="g-note">스트레스 금리는 한도 계산에만 쓰이고, 월 상환액은 실제 금리로 계산됩니다. 은행은 신용도·기존 대출 산정 방식에 따라 이 값과 다르게 볼 수 있습니다.</p>

      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        sources={[
          { label: '위택스 취득세 안내', href: 'https://www.wetax.go.kr/' },
          { label: '행정안전부 지방세', href: 'https://www.mois.go.kr/' },
        ]}
      >
        본 계산기의 취득세율·부대비용은 참고용 추정치입니다. 취득세는 주택 수 판정·지역·감면 여부에 따라 달라질 수 있어 실제 세액은 위택스 또는 세무사 확인이 필요하며, 명도비·체납 관리비·수리비 등은 물건별 편차가 큽니다. 대출 한도(LTV·DSR)는 금융위·은행의 최신 규제 기준을 따르므로 입찰 전 반드시 재확인하세요.
      </Disclaimer>

      {/* finance 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/finance/loan" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💳</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>대출이자 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            원리금균등·중도상환·갈아타기
          </p>
        </Link>
        <Link href="/tools/finance/real-estate" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🏘️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>부동산 투자 수익률</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            매매·임대·레버리지 수익률
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💰</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 진단·자기자본 마련
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
