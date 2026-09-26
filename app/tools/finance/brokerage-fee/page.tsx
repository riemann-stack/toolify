import BrokerageFeeClient from './BrokerageFeeClient'
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
  calcBrokerageFee, CURRENT_HOUSE_FEE_SCHEDULE, HOUSE_FEE_SCHEDULES, LEASE_CONVERSION, OFFICETEL_FEE, OTHER_PROPERTY_FEE,
  BROKERAGE_VAT_PCT, SIMPLIFIED_TAXPAYER, BROKERAGE_OVERCHARGE_PENALTY,
  type BrokerageDeal, type BrokerageProperty,
} from '@/lib/krBrokerageFee'
import { scheduleRows, amountRows, monthlyRows, reformRows, pctPpm, manWon, won, num } from './brokerageFeeUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/brokerage-fee',
  title: '중개보수(복비) 계산기 2026 — 매매·전세·월세 상한요율, 부가세, 오피스텔',
  description:
    '주택 매매·전세·월세와 주거용 오피스텔·상가·토지의 법정 상한 중개보수를 계산. 월세 ×100·×70 환산, 한도액, 협의 요율, 부가세 10%, 양측 합계까지 공인중개사법 시행규칙 §20 기준.',
  keywords: [
    '중개보수 계산기', '복비 계산기', '부동산 복비', '중개수수료 계산', '중개보수 요율표', '부동산 중개수수료',
    '월세 복비', '전세 복비', '아파트 복비', '오피스텔 중개보수', '상가 중개수수료', '복비 부가세',
    '중개보수 상한요율', '월세 거래금액 환산',
  ],
})

/* ─── 본문 수치 — 전부 lib/krBrokerageFee 단일 소스로 빌드 시 생성 (손으로 적은 요율·금액 없음) ─── */
const EOK = 100_000_000
const MAN = 10_000
const S = CURRENT_HOUSE_FEE_SCHEDULE
const OLD = HOUSE_FEE_SCHEDULES[HOUSE_FEE_SCHEDULES.length - 2]
const L = LEASE_CONVERSION
const O = OFFICETEL_FEE
const VAT = BROKERAGE_VAT_PCT
const ST = SIMPLIFIED_TAXPAYER
const PEN = BROKERAGE_OVERCHARGE_PENALTY
const ymd = (s: string) => { const [y, m, d] = s.split('-'); return `${y}년 ${Number(m)}월 ${Number(d)}일` }
const f = (deal: BrokerageDeal, amount: number, o: { property?: BrokerageProperty; rent?: number; rate?: number; date?: string } = {}) =>
  calcBrokerageFee({ deal, property: o.property ?? 'house', amount, monthlyRent: o.rent, negotiatedRatePct: o.rate, date: o.date })

/* 구간표 */
const SALE_ROWS = scheduleRows('sale')
const LEASE_ROWS = scheduleRows('lease')

/* 대표 예시 */
const SALE5 = f('sale', 5 * EOK)
const SALE10 = f('sale', 10 * EOK)
const NEG10 = f('sale', 10 * EOK, { rate: 0.4 })
const SALE16 = f('sale', 1.6 * EOK)
const SALE18 = f('sale', 1.8 * EOK)
const SALE_5000 = f('sale', 5_000 * MAN)
const SALE_2E = f('sale', 2 * EOK)
const EDGES = [9 * EOK, 12 * EOK, 15 * EOK].map(b => ({ b, below: f('sale', b - 1), at: f('sale', b) }))
const J3 = f('jeonse', 3 * EOK)
const M_LOW = f('monthly', 500 * MAN, { rent: 35 * MAN })
const M_MID = f('monthly', 1_000 * MAN, { rent: 60 * MAN })
const M_HI = f('monthly', 1 * EOK, { rent: 100 * MAN })
const M_EDGE_A = f('monthly', 1_000 * MAN, { rent: 40 * MAN })
const M_EDGE_B = f('monthly', 1_000 * MAN, { rent: 39 * MAN })
const OFT_SALE18 = f('sale', 1.8 * EOK, { property: 'officetel' })
const OFT_M = f('monthly', 1_000 * MAN, { property: 'officetel', rent: 70 * MAN })
const HOUSE_M = f('monthly', 1_000 * MAN, { rent: 70 * MAN })
const OTHER5 = f('sale', 5 * EOK, { property: 'other' })
const OLD10 = f('sale', 10 * EOK, { date: OLD.to ?? OLD.from })
const OLD7 = f('sale', 7 * EOK, { date: OLD.to ?? OLD.from })
const SALE7 = f('sale', 7 * EOK)
const EDGE_RENT_DIFF = M_EDGE_A.maxFee - M_EDGE_B.maxFee
/* 헌재 2023헌마995 사건의 숫자 — 1억 3,700만원 주택 매매, 보수 + 10% vs 보수 + 간이과세자 실부담률(부가가치율 × 10%) */
const HC_PRICE = 13_700 * MAN
const HC = f('sale', HC_PRICE)
const ST_BURDEN_PCT = (ST.valueAddedRatePct * VAT) / 100
const HC_VAT_ST = Math.floor((HC.maxFee * ST_BURDEN_PCT) / 100)

/* 표 3·4·5 — 금액별 최대 중개보수 */
const SALE_TABLE = amountRows([3_000 * MAN, 1 * EOK, 1.8 * EOK, 3 * EOK, 5 * EOK, 8 * EOK, 9 * EOK, 10 * EOK, 13 * EOK, 15 * EOK, 20 * EOK, 30 * EOK], 'sale')
const JEONSE_TABLE = amountRows([3_000 * MAN, 8_000 * MAN, 1.5 * EOK, 3 * EOK, 5 * EOK, 8 * EOK, 13 * EOK, 20 * EOK], 'jeonse')
const MONTHLY_TABLE = monthlyRows([[500 * MAN, 35 * MAN], [1_000 * MAN, 39 * MAN], [1_000 * MAN, 40 * MAN], [1_000 * MAN, 60 * MAN], [3_000 * MAN, 100 * MAN], [1 * EOK, 150 * MAN]])

/* 표 6 — 같은 금액, 대상만 바꿨을 때 */
const PROP_CASES: { label: string; deal: BrokerageDeal; amount: number; rent?: number }[] = [
  { label: '매매 3천만원', deal: 'sale', amount: 3_000 * MAN },
  { label: `매매 ${manWon(1.8 * EOK)}`, deal: 'sale', amount: 1.8 * EOK },
  { label: '매매 2억원', deal: 'sale', amount: 2 * EOK },
  { label: '매매 10억원', deal: 'sale', amount: 10 * EOK },
  { label: '전세 3억원', deal: 'jeonse', amount: 3 * EOK },
  { label: '월세 1,000만/70만원', deal: 'monthly', amount: 1_000 * MAN, rent: 70 * MAN },
]
const PROP_TABLE = PROP_CASES.map(c => ({
  ...c,
  house: f(c.deal, c.amount, { rent: c.rent }),
  oft: f(c.deal, c.amount, { rent: c.rent, property: 'officetel' }),
  other: f(c.deal, c.amount, { rent: c.rent, property: 'other' }),
}))

/* 표 7 — 2021년 10월 개정 전후 */
const REFORM_SALE = reformRows([6 * EOK, 8 * EOK, 9 * EOK, 10 * EOK, 12 * EOK, 15 * EOK, 20 * EOK], 'sale')
const REFORM_LEASE = reformRows([3 * EOK, 5 * EOK, 6 * EOK, 10 * EOK, 15 * EOK], 'jeonse')

const LAW = (jo: string, law = '공인중개사법') => `https://www.law.go.kr/법령/${law}/${jo}`
const RULE = '공인중개사법시행규칙'

const FAQ_LD = [
  {
    q: `${manWon(5 * EOK)}짜리 아파트를 사면 복비는 얼마인가요?`,
    a: `주택 매매 ${SALE_ROWS[SALE5.bracketIndex].label} 구간의 상한요율 ${pctPpm(SALE5.maxRatePpm)}를 곱한 <strong>${won(SALE5.maxFee)}</strong>이 매수인 한쪽이 낼 수 있는 최대 금액입니다. 일반과세자 중개사무소라면 부가세 ${VAT}% ${won(SALE5.vat)}을 더해 ${won(SALE5.feeWithVat)}이 되고, 매도인도 자기 쪽 중개사무소에 같은 방식으로 따로 냅니다. 이 금액은 상한이라 계약 전에 더 낮은 요율로 협의할 수 있습니다.`,
  },
  {
    q: '월세 복비는 어떻게 계산하나요?',
    a: `월세는 <strong>보증금 + 월세 × ${L.multiplier}</strong>을 거래금액으로 보고, 그 합이 ${manWon(L.lowThreshold)} 미만이면 <strong>보증금 + 월세 × ${L.lowMultiplier}</strong>으로 다시 계산합니다(공인중개사법 시행규칙 §20⑤1호). 보증금 ${manWon(M_LOW.lease?.deposit ?? 0)}·월세 ${manWon(M_LOW.lease?.monthlyRent ?? 0)}이면 × ${L.multiplier} 합계가 ${manWon(M_LOW.lease?.amount100 ?? 0)}이라 × ${L.lowMultiplier}을 적용한 ${manWon(M_LOW.transactionAmount)}이 거래금액이고, 임대차 요율 ${pctPpm(M_LOW.maxRatePpm)}를 곱한 <strong>${won(M_LOW.maxFee)}</strong>이 상한입니다.`,
  },
  {
    q: '복비를 상한요율보다 깎을 수 있나요?',
    a: `네. 요율표의 숫자는 &lsquo;이 이상 받을 수 없다&rsquo;는 상한이고 실제 금액은 중개의뢰인과 개업공인중개사가 협의해 정합니다(시행규칙 §20①). 예를 들어 ${manWon(10 * EOK)} 매매의 상한은 ${won(SALE10.maxFee)}(${pctPpm(SALE10.maxRatePpm)})이지만 0.4%로 합의하면 ${won(NEG10.fee)}입니다. 반대로 상한을 넘겨 약정해도 넘는 부분은 무효이고(대법원 2005다32159 전원합의체 판결), 중개사가 상한을 넘겨 받으면 ${PEN.prisonYears}년 이하 징역 또는 ${manWon(PEN.fineWon)} 이하 벌금 대상입니다(공인중개사법 §33①3호·§49①10호).`,
  },
  {
    q: `중개사무소가 부가세 ${VAT}%를 따로 달라고 하는데 정상인가요?`,
    a: `요율표 금액에는 부가세가 들어 있지 않습니다. 일반과세자인 중개사무소는 중개보수의 ${VAT}%를 부가세로 별도 청구할 수 있습니다. 간이과세자라도 직전 연도 공급대가가 ${manWon(ST.invoiceRequiredFrom)} 이상이면 세금계산서 발급 의무가 있고(부가가치세법 §36①2호가), 헌법재판소 결정문에 따르면 국세청 국세상담센터는 이때도 ${VAT}% 세율로 발급하도록 안내합니다. 헌법재판소는 이런 간이과세자가 중개보수의 ${VAT}%를 부가세로 받은 사건에서 법정 보수를 넘겨 받는다는 고의가 있었다고 보기 어렵다며 기소유예처분을 취소했습니다(헌재 2025. 4. 10. 2023헌마995). 영수증만 발급하는 연 ${manWon(ST.invoiceRequiredFrom)} 미만 간이과세자라면 부가세 명목 금액을 계약 전에 확인하세요. 사무소의 과세유형은 사업자등록증이나 홈택스 사업자 상태 조회로 확인할 수 있습니다.`,
  },
  {
    q: '오피스텔 복비는 주택과 같나요?',
    a: `전용 ${O.maxAreaM2}㎡ 이하이면서 상·하수도가 갖춰진 전용 입식 부엌, 전용 수세식 화장실과 목욕시설을 모두 갖춘 <strong>주거용 오피스텔</strong>은 매매·교환 ${pctPpm(O.saleRatePpm)}, 임대차 ${pctPpm(O.leaseRatePpm)} 이내입니다(시행규칙 §20④1호·별표 2). 주택과 달리 한도액이 없어 월세 1,000만원/70만원이면 주택은 ${won(HOUSE_M.maxFee)}(한도액)인데 주거용 오피스텔은 ${won(OFT_M.maxFee)}입니다. 요건을 하나라도 못 갖추면 상가·토지와 같은 ${pctPpm(OTHER_PROPERTY_FEE.ratePpm)} 이내 협의 대상입니다.`,
  },
  {
    q: '계약이 해제되면 복비를 내야 하나요?',
    a: '공인중개사법 §32① 단서는 개업공인중개사의 고의 또는 과실로 거래계약이 무효·취소·해제된 경우 중개보수를 받을 수 없다고 정합니다. 당사자 한쪽의 사정으로 해제된 경우는 법에 따로 정한 금액이 없어 약정과 개별 사정에 따라 판단이 갈립니다. 계약금만 오간 뒤 해제될 때의 보수를 어떻게 할지 중개를 맡길 때 미리 정해 두는 편이 안전합니다.',
  },
  {
    q: '복비는 언제 내나요? 계약금 낼 때 절반을 달라고 합니다.',
    a: '지급 시기는 개업공인중개사와 중개의뢰인의 약정에 따르고, 약정이 없으면 중개대상물의 거래대금 지급이 완료된 날, 보통 잔금일입니다(공인중개사법 시행령 §27의2). 계약금 때 일부, 잔금 때 나머지를 내기로 약정하는 것도 가능하지만 약정하지 않았다면 잔금일에 한 번에 내면 됩니다.',
  },
  {
    q: '9억원을 살짝 넘기면 복비가 크게 뛰나요?',
    a: `상한 기준으로는 그렇습니다. ${num(EDGES[0].b - 1)}원이면 ${pctPpm(EDGES[0].below.maxRatePpm)}를 적용해 최대 ${won(EDGES[0].below.maxFee)}이지만, ${manWon(EDGES[0].b)}부터는 ${pctPpm(EDGES[0].at.maxRatePpm)}가 돼 ${won(EDGES[0].at.maxFee)}입니다. 12억원(${won(EDGES[1].below.maxFee)} → ${won(EDGES[1].at.maxFee)})과 15억원(${won(EDGES[2].below.maxFee)} → ${won(EDGES[2].at.maxFee)}) 경계도 마찬가지입니다. 어디까지나 상한이므로 경계 바로 위 금액이라면 요율을 먼저 협의하세요.`,
  },
  {
    q: '다른 지역 중개사무소를 이용하면 요율이 달라지나요?',
    a: '중개대상물과 중개사무소의 소재지가 다르면 중개사무소가 있는 시·도의 조례 기준을 따릅니다(시행규칙 §20③). 2021년 개정 이후 서울·경기·인천 등 시·도 조례 요율표는 시행규칙 별표 1과 같은 숫자를 쓰고 있어 실제로 달라지는 경우는 드물지만, 계약 전에 사무소에 게시된 요율표를 한 번 확인하세요.',
  },
]

export default function BrokerageFeePage() {
  return (
    <ToolPage width={760} slug="/tools/finance/brokerage-fee" article="v2">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />중개보수(복비) 계산기
      </h1>
      <p className="tp-lead">
        매매·전세·월세와 주택·주거용 오피스텔·토지·상가를 고르고 금액을 넣으면 <strong>법정 상한요율·한도액</strong>, 최대 중개보수와 부가세 포함액,
        양측 합계를 계산합니다. 월세는 &lsquo;보증금 + 월세 × {L.multiplier}(합이 {manWon(L.lowThreshold)} 미만이면 × {L.lowMultiplier})&rsquo; 환산까지 자동으로 합니다.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis={`공인중개사법 §32, 시행규칙 §20·별표 1(주택, ${ymd(S.from)} 시행)·§20④1호·별표 2(주거용 오피스텔, 요율 ${ymd(O.effectiveFrom)} 시행·협의 문구 ${ymd(O.negotiationWordingFrom)} 시행), 서울특별시 주택 중개보수 등에 관한 조례 기준`}
        sources={[
          { label: '공인중개사법 시행규칙 제20조(중개보수 및 실비의 한도 등)', href: LAW('제20조', RULE) },
          { label: '서울특별시 부동산 중개보수 안내', href: 'https://land.seoul.go.kr/land/broker/brokerageCommission.do' },
          { label: '국토교통부 부동산거래 전자계약시스템 중개보수 요율표', href: 'https://irts.molit.go.kr/com/cmn/popup/fee/rtecsFeeRtoPopup.do' },
        ]}
      />

      <BrokerageFeeClient />

      <GuideDivider />

      <h2 className="g-h2">중개보수는 정해진 요금이 아니라 법이 정한 &lsquo;상한&rsquo;입니다</h2>
      <p className="g-p">
        흔히 복비라고 부르는 중개보수의 근거는 공인중개사법 §32입니다. 주택의 중개보수는 국토교통부령인 <strong>공인중개사법 시행규칙 §20①과 [별표 1]</strong>이 상한요율과 한도액을 정하고,
        각 시·도가 조례로 그 범위 안의 요율을 정합니다. {ymd(S.from)} 시행 개정 때 시·도가 요율을 0.1%p씩 올리거나 내릴 수 있게 하자는 안이 입법예고됐다가 최종안에서 빠졌고,
        서울·경기·인천 등 시·도 조례의 요율표는 별표 1과 같은 숫자를 씁니다. 중개대상물과 중개사무소가 다른 시·도에 있으면 <strong>중개사무소가 있는 시·도</strong>의 조례가 기준입니다(시행규칙 §20③).
      </p>
      <p className="g-p">
        기억할 점은 세 가지입니다. 첫째, 표에 적힌 요율은 &lsquo;이 이상 받을 수 없다&rsquo;는 상한이고 실제 금액은 그 안에서 중개의뢰인과 개업공인중개사가 협의해 정합니다.
        둘째, 중개보수는 매도인과 매수인(임대인과 임차인)이 <strong>각각</strong> 냅니다. 계산기 결과는 한쪽 몫이며, 한 사무소가 양쪽을 모두 중개했다면 그 사무소가 받는 돈은 양측 합계입니다.
        셋째, 사례·증여 등 어떤 명목으로도 상한을 넘는 금품은 받을 수 없습니다(법 §33①3호). 어기면 {PEN.prisonYears}년 이하 징역 또는 {manWon(PEN.fineWon)} 이하 벌금 대상이고(법 §49①10호),
        대법원은 한도를 넘는 중개보수 약정은 그 넘는 범위에서 무효라고 판단했습니다(대법원 2007. 12. 20. 선고 2005다32159 전원합의체 판결).
      </p>
      <DataFigure n={1} title={`주택 매매·교환 상한요율 (${ymd(S.from)} 시행)`} unit="부가세 별도" source={<>자료: 공인중개사법 시행규칙 §20① [별표 1] — Youtil 계산 엔진(lib/krBrokerageFee)에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">거래금액</th><th scope="col" className="r">상한요율</th><th scope="col" className="r">한도액</th><th scope="col" className="r">한도액이 걸리는 금액</th></tr>
          </thead>
          <tbody>
            {SALE_ROWS.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className="r em">{row.rate}</td>
                <td className="r">{row.cap}</td>
                <td className="r">{row.capFrom !== null ? `${won(row.capFrom)}부터` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <DataFigure n={2} title={`주택 임대차(전세·월세) 상한요율 (${ymd(S.from)} 시행)`} unit="부가세 별도" source={<>자료: 공인중개사법 시행규칙 §20① [별표 1] — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">거래금액</th><th scope="col" className="r">상한요율</th><th scope="col" className="r">한도액</th><th scope="col" className="r">한도액이 걸리는 금액</th></tr>
          </thead>
          <tbody>
            {LEASE_ROWS.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className="r em">{row.rate}</td>
                <td className="r">{row.cap}</td>
                <td className="r">{row.capFrom !== null ? `${won(row.capFrom)}부터` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        한도액은 낮은 금액 구간에만 있습니다. 매매 {SALE_ROWS[1].label} 구간은 {manWon(SALE_ROWS[1].capFrom ?? 0)}부터 한도액 {SALE_ROWS[1].cap}에 걸려 더 오르지 않으므로,
        {' '}{manWon(1.8 * EOK)} 주택의 최대 중개보수는 {SALE_ROWS[1].rate}로 계산한 {won(SALE18.rawMaxFee)}이 아니라 <strong>{won(SALE18.maxFee)}</strong>입니다.
        한도액과 다음 구간 요율은 맞물리게 짜여 있어서, {manWon(5_000 * MAN)}({won(SALE_5000.maxFee)})과 {manWon(2 * EOK)}({won(SALE_2E.maxFee)}) 경계에서는 금액이 끊기지 않고 이어집니다.
      </p>

      <h2 className="g-h2">주택 매매 — 구간을 찾고, 곱하고, 한도액과 비교합니다</h2>
      <p className="g-p">
        계산 순서는 ① 거래금액이 속한 구간 찾기 → ② 거래금액 × 상한요율 → ③ 한도액이 있으면 둘 중 작은 금액 → ④ 필요하면 부가세 {VAT}%를 더하는 것입니다.
        구간은 &lsquo;이상 ~ 미만&rsquo;이라 경계 금액은 위 구간에 속합니다. 법령에 원 미만 끝수 규정이 없어 이 계산기는 상한을 넘지 않도록 원 미만을 버립니다.
      </p>
      <p className="g-p">
        <strong>계산 예시 1</strong> — {manWon(5 * EOK)} 아파트 매매: {SALE_ROWS[SALE5.bracketIndex].label} 구간이라 {manWon(5 * EOK)} × {pctPpm(SALE5.maxRatePpm)} = <strong>{won(SALE5.maxFee)}</strong>입니다.
        일반과세자 사무소라면 부가세 {won(SALE5.vat)}을 더해 {won(SALE5.feeWithVat)}을 내고, 매도인도 같은 조건이라면 양측 합계는 {won(SALE5.feeWithVat * 2)}입니다.
      </p>
      <p className="g-p">
        <strong>계산 예시 2</strong> — {manWon(10 * EOK)} 매매: {SALE_ROWS[SALE10.bracketIndex].label} 구간의 {pctPpm(SALE10.maxRatePpm)}가 적용돼 상한은 {won(SALE10.maxFee)}입니다.
        중개사무소와 0.4%로 합의했다면 {won(NEG10.fee)}이 되어 상한보다 {won(SALE10.maxFee - NEG10.fee)} 적습니다. 계산기의 &lsquo;협의 요율&rsquo; 칸에 합의한 요율을 넣으면 같은 결과가 나옵니다.
      </p>
      <p className="g-p">
        <strong>경계에서는 계단이 생깁니다.</strong> {num(EDGES[0].b - 1)}원이면 {pctPpm(EDGES[0].below.maxRatePpm)}로 최대 {won(EDGES[0].below.maxFee)}이지만 {manWon(EDGES[0].b)}이 되는 순간 {pctPpm(EDGES[0].at.maxRatePpm)}가 적용돼
        {' '}{won(EDGES[0].at.maxFee)}으로 {won(EDGES[0].at.maxFee - EDGES[0].below.maxFee)} 늘어납니다. {manWon(EDGES[1].b)}({won(EDGES[1].below.maxFee)} → {won(EDGES[1].at.maxFee)})과
        {' '}{manWon(EDGES[2].b)}({won(EDGES[2].below.maxFee)} → {won(EDGES[2].at.maxFee)}) 경계도 같습니다. 낮은 금액대의 {manWon(1.6 * EOK)}({won(SALE16.maxFee)})~{manWon(2 * EOK)} 사이는 반대로 한도액 때문에 금액이 평평합니다.
      </p>
      <DataFigure n={3} title="매매가별 최대 중개보수 (주택, 한쪽 기준)" unit="단위: 원" source={<>자료: 공인중개사법 시행규칙 §20① [별표 1], 부가가치세법 §30 — Youtil 계산 엔진에서 생성, 원 미만 버림</>}>
        <table>
          <thead>
            <tr><th scope="col">매매가</th><th scope="col" className="r">상한요율</th><th scope="col" className="r">중개보수</th><th scope="col" className="r">부가세 포함</th><th scope="col" className="r">양측 합계(부가세 포함)</th></tr>
          </thead>
          <tbody>
            {SALE_TABLE.map(({ amount, r }) => (
              <tr key={amount}>
                <th scope="row">{manWon(amount)}</th>
                <td className="r">{pctPpm(r.maxRatePpm)}</td>
                <td className="r em">{num(r.maxFee)}{r.capApplied && <small>한도액 적용</small>}</td>
                <td className="r">{num(r.feeWithVat)}</td>
                <td className="r">{num(r.feeWithVat * 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip" title="요율은 계약서 쓰기 전에 정하세요">
        계약할 때 받는 중개대상물 확인·설명서에는 중개보수·실비의 금액과 산출내역, 지급시기를 적는 칸이 있습니다.
        상한요율 그대로 적힐지, 합의한 요율이 적힐지는 서명 전에 결정됩니다. 경계 바로 위 금액이거나 한 사무소가 양쪽을 모두 중개하는 거래라면 특히 먼저 협의해 두는 편이 좋습니다.
      </Callout>

      <h2 className="g-h2">전세·월세 — 월세는 &lsquo;보증금 + 월세 × {L.multiplier}&rsquo;이 거래금액입니다</h2>
      <p className="g-p">
        임대차는 별표 1의 임대차 요율을 씁니다. 전세는 보증금이 곧 거래금액이라 {manWon(3 * EOK)} 전세는 {LEASE_ROWS[J3.bracketIndex].label} 구간 {pctPpm(J3.maxRatePpm)}를 곱한 <strong>{won(J3.maxFee)}</strong>이 상한입니다.
        보증금 외에 월세(차임)가 있으면 시행규칙 §20⑤1호에 따라 <strong>보증금 + 월세 × {L.multiplier}</strong>을 거래금액으로 보고, 이 합계가 {manWon(L.lowThreshold)} 미만이면 <strong>보증금 + 월세 × {L.lowMultiplier}</strong>으로 다시 계산합니다.
      </p>
      <ul className="g-list">
        <li>보증금 {manWon(500 * MAN)}·월세 {manWon(35 * MAN)} — × {L.multiplier} 합계 {manWon(M_LOW.lease?.amount100 ?? 0)}이 {manWon(L.lowThreshold)} 미만 → × {L.lowMultiplier}으로 {manWon(M_LOW.transactionAmount)} → {pctPpm(M_LOW.maxRatePpm)} = <strong>{won(M_LOW.maxFee)}</strong></li>
        <li>보증금 {manWon(1_000 * MAN)}·월세 {manWon(60 * MAN)} — {manWon(M_MID.transactionAmount)} → {pctPpm(M_MID.maxRatePpm)} = <strong>{won(M_MID.maxFee)}</strong> (한도액 {manWon(M_MID.cap ?? 0)} 이내)</li>
        <li>보증금 {manWon(1 * EOK)}·월세 {manWon(100 * MAN)} — {manWon(M_HI.transactionAmount)} → {pctPpm(M_HI.maxRatePpm)} = <strong>{won(M_HI.maxFee)}</strong></li>
      </ul>
      <p className="g-p">
        × {L.lowMultiplier} 규칙 때문에 월세가 조금 오르면 중개보수가 오히려 크게 뛰는 구간도 있습니다. 보증금 {manWon(1_000 * MAN)}에 월세 {manWon(39 * MAN)}이면 × {L.multiplier} 합계가 {manWon(M_EDGE_B.lease?.amount100 ?? 0)}이라
        × {L.lowMultiplier}을 적용해 {manWon(M_EDGE_B.transactionAmount)} → {won(M_EDGE_B.maxFee)}이지만, 월세가 {manWon(40 * MAN)}이면 합계가 정확히 {manWon(M_EDGE_A.lease?.amount100 ?? 0)}(미만이 아님)이라
        {' '}{manWon(M_EDGE_A.transactionAmount)} × {pctPpm(M_EDGE_A.maxRatePpm)} = {won(M_EDGE_A.maxFee)}이 됩니다. 월세 1만원 차이로 상한이 {won(EDGE_RENT_DIFF)} 달라지는 셈입니다.
      </p>
      <DataFigure n={4} title="전세 보증금별 최대 중개보수 (주택, 한쪽 기준)" unit="단위: 원" source={<>자료: 공인중개사법 시행규칙 §20① [별표 1] — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">보증금</th><th scope="col" className="r">상한요율</th><th scope="col" className="r">중개보수</th><th scope="col" className="r">부가세 포함</th></tr>
          </thead>
          <tbody>
            {JEONSE_TABLE.map(({ amount, r }) => (
              <tr key={amount}>
                <th scope="row">{manWon(amount)}</th>
                <td className="r">{pctPpm(r.maxRatePpm)}</td>
                <td className="r em">{num(r.maxFee)}{r.capApplied && <small>한도액 적용</small>}</td>
                <td className="r">{num(r.feeWithVat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <DataFigure n={5} title="월세 거래금액 환산과 최대 중개보수 (주택, 한쪽 기준)" unit="단위: 원" source={<>자료: 공인중개사법 시행규칙 §20⑤1호·[별표 1] — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">보증금 / 월세</th><th scope="col" className="r">× {L.multiplier} 합계</th><th scope="col" className="r">거래금액</th><th scope="col" className="r">상한요율</th><th scope="col" className="r">중개보수</th></tr>
          </thead>
          <tbody>
            {MONTHLY_TABLE.map(({ deposit, rent, r }) => (
              <tr key={`${deposit}-${rent}`}>
                <th scope="row">{manWon(deposit)} / {manWon(rent)}</th>
                <td className="r">{num(r.lease?.amount100 ?? 0)}</td>
                <td className="r">{num(r.transactionAmount)}<small>× {r.lease?.multiplier ?? L.multiplier}</small></td>
                <td className="r">{pctPpm(r.maxRatePpm)}</td>
                <td className="r em">{num(r.maxFee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2 className="g-h2">주거용 오피스텔·상가·토지는 다른 표를 씁니다</h2>
      <p className="g-p">
        오피스텔은 요건을 갖췄는지에 따라 요율이 갈립니다. 시행규칙 §20④1호는 <strong>전용면적 {O.maxAreaM2}㎡ 이하</strong>이면서 <strong>상·하수도 시설이 갖추어진 전용 입식 부엌, 전용 수세식 화장실 및 목욕시설</strong>을
        모두 갖춘 오피스텔에 [별표 2]의 요율 — 매매·교환 {pctPpm(O.saleRatePpm)}, 임대차 {pctPpm(O.leaseRatePpm)} — 을 적용합니다. {ymd(O.effectiveFrom)}부터 쓰인 요율이고,
        {' '}{ymd(O.negotiationWordingFrom)} 시행된 시행규칙 개정({O.negotiationWordingAct})은 §20④1호 본문만 고쳐 주거용 오피스텔도 &lsquo;별표 2의 상한요율 이내에서 서로 협의하여&rsquo; 정한다는 문구를 명시했습니다(별표 2의 요율 자체는 그대로).
      </p>
      <p className="g-p">
        요건을 하나라도 갖추지 못한 오피스텔과 상가·사무실·토지·공장 등은 &lsquo;그 밖의 중개대상물&rsquo;로, 매매든 임대차든 <strong>거래금액의 {pctPpm(OTHER_PROPERTY_FEE.ratePpm)} 이내에서 협의</strong>합니다(§20④2호).
        {' '}{manWon(5 * EOK)} 상가 매매라면 최대 {won(OTHER5.maxFee)}입니다. 주택과 상가가 한 건물에 섞여 있으면 <strong>주택 면적이 2분의 1 이상</strong>일 때 주택 요율을, 미만일 때 주택 외 요율을 씁니다(§20⑥).
      </p>
      <p className="g-p">
        주의할 점은 오피스텔·주택 외에는 <strong>한도액이 없다</strong>는 것입니다. 그래서 낮은 금액에서는 주거용 오피스텔의 상한이 주택보다 높아지기도 합니다.
        {' '}{manWon(1.8 * EOK)} 매매는 주택이 {pctPpm(SALE18.maxRatePpm)}로 계산한 {won(SALE18.rawMaxFee)}이 한도액에 걸려 {won(SALE18.maxFee)}인데, 주거용 오피스텔은 한도액 없이 {pctPpm(OFT_SALE18.maxRatePpm)}를 그대로 곱한 {won(OFT_SALE18.maxFee)}입니다.
        월세 {manWon(HOUSE_M.lease?.deposit ?? 0)}/{manWon(HOUSE_M.lease?.monthlyRent ?? 0)}도 주택은 한도액 {won(HOUSE_M.maxFee)}, 주거용 오피스텔은 {won(OFT_M.maxFee)}입니다.
      </p>
      <DataFigure n={6} title="같은 금액, 중개대상물만 바꿨을 때 최대 중개보수 (한쪽 기준)" unit="단위: 원" source={<>자료: 공인중개사법 시행규칙 §20①·④·⑤, [별표 1]·[별표 2] — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">거래</th><th scope="col" className="r">주택</th><th scope="col" className="r">주거용 오피스텔</th><th scope="col" className="r">토지·상가 등(상한)</th></tr>
          </thead>
          <tbody>
            {PROP_TABLE.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className="r">{num(row.house.maxFee)}<small>{pctPpm(row.house.maxRatePpm)}{row.house.capApplied ? ' · 한도' : ''}</small></td>
                <td className="r">{num(row.oft.maxFee)}<small>{pctPpm(row.oft.maxRatePpm)}</small></td>
                <td className="r">{num(row.other.maxFee)}<small>{pctPpm(row.other.maxRatePpm)}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2 className="g-h2">부가세 {VAT}%는 별도 — 간이과세자 사무소는 세금계산서 발급 여부가 갈림길입니다</h2>
      <p className="g-p">
        요율표로 계산한 금액에는 부가가치세가 들어 있지 않습니다. 중개용역은 부가세 과세 대상이라 <strong>일반과세자</strong> 중개사무소는 중개보수의 {VAT}%(부가가치세법 §30)를 별도로 받을 수 있고,
        이때 부가세를 뺀 금액이 법정 상한 이내면 초과 수수가 아닙니다. {manWon(5 * EOK)} 매매라면 {won(SALE5.maxFee)} + {won(SALE5.vat)} = {won(SALE5.feeWithVat)}입니다.
      </p>
      <p className="g-p">
        <strong>간이과세자</strong> 사무소는 세금계산서를 발급하는지에 따라 나뉩니다. 먼저 법제처는 간이과세자인 개업공인중개사가 부가세를 따로 받더라도 부가세를 제외한 금액이 법정 중개보수를 넘지 않으면
        §33①3호 위반이 아니라고 해석했습니다. 간이과세자라도 직전 연도 공급대가가 {manWon(ST.invoiceRequiredFrom)} 이상이면 영수증 대신 세금계산서를 발급해야 하는데(부가가치세법 §36①2호가),
        헌법재판소는 이런 간이과세자가 중개보수의 {VAT}%를 부가세로 받은 사건에서 법정 보수를 넘겨 받는다는 고의가 있었다고 보기 어렵다며 검사의 기소유예처분을 재판관 전원 일치로 취소했습니다(헌재 2025. 4. 10. 선고 2023헌마995 결정).
        결정문은 간이과세자에게 적용할 세율을 부가가치세법이 따로 정하지 않았고, 국세청 국세상담센터가 세금계산서를 발급하는 간이과세자에게도 {VAT}% 세율을 안내하고 있다는 점을 근거로 들었습니다.
      </p>
      <p className="g-p">
        <strong>결정 사안의 숫자</strong> — {manWon(HC_PRICE)} 주택 매매로, {SALE_ROWS[HC.bracketIndex].label} 구간 {pctPpm(HC.maxRatePpm)}를 곱한 법정 보수 {won(HC.maxFee)}에 {VAT}% 부가세 {won(HC.vat)}을 더해 {won(HC.feeWithVat)}을 받은 사건입니다.
        검사는 법정 수수료를 법정 보수 + {ST_BURDEN_PCT}% 부가가치세({won(HC_VAT_ST)}) = {won(HC.maxFee + HC_VAT_ST)}으로 보고 {won(HC.feeWithVat)}을 받은 것을 초과 수수로 판단했지만(차액 {won(HC.feeWithVat - HC.maxFee - HC_VAT_ST)}), 헌법재판소는 위와 같이 고의를 인정하지 않았습니다.
        이 계산기에 {manWon(HC_PRICE)} 매매·부가세 포함을 넣으면 같은 {won(HC.feeWithVat)}이 나옵니다.
      </p>
      <p className="g-p">
        검사가 쓴 {ST_BURDEN_PCT}%는 간이과세자가 실제로 내는 부가세 수준입니다. 간이과세자의 납부세액은 공급대가 × 업종별 부가가치율(부동산 관련 서비스업 {ST.valueAddedRatePct}%, 부가가치세법 시행령 §111②) × {VAT}%이고,
        연 공급대가가 {manWon(ST.exemptBelow)} 미만이면 납부 의무가 면제됩니다(부가가치세법 §69①). 영수증만 발급하는 연 {manWon(ST.invoiceRequiredFrom)} 미만 간이과세자는 위 결정의 사안과 다르므로, 부가세 명목으로 얼마를 받는지 계약 전에 확인하세요.
        사무소의 과세유형은 사업자등록증이나 홈택스 사업자등록 상태 조회로 확인할 수 있습니다.
      </p>
      <Callout tone="note" title="이 계산기의 부가세 체크">
        &lsquo;부가세 {VAT}% 포함&rsquo;은 세금계산서를 발급하는 사무소(일반과세자, 직전 연도 공급대가 {manWon(ST.invoiceRequiredFrom)} 이상 간이과세자) 기준입니다.
        영수증만 발급하는 간이과세자 사무소라면 부가세 명목 금액을 사무소에 확인하고, 부가세를 받지 않는다면 체크를 끄세요.
      </Callout>

      <h2 className="g-h2">2021년 10월 개정 — 고가 주택 상한이 크게 내려갔습니다</h2>
      <p className="g-p">
        현행 요율표는 {ymd(S.from)} 시행된 시행규칙 개정의 결과이고, 이날 이후 체결되는 계약부터 적용됐습니다. 개정의 골자는 6억원 이상 매매와 3억원 이상 임대차의 상한을 낮추고 고가 구간을 잘게 나눈 것입니다.
        개정 전 서울 조례 기준으로 매매 {OLD.sale[OLD.sale.length - 1].min / EOK}억원 이상은 {pctPpm(OLD.sale[OLD.sale.length - 1].ratePpm)}, 임대차 {OLD.lease[OLD.lease.length - 1].min / EOK}억원 이상은 {pctPpm(OLD.lease[OLD.lease.length - 1].ratePpm)} 이내 협의였습니다.
        예를 들어 {manWon(10 * EOK)} 매매 상한은 {won(OLD10.maxFee)}에서 {won(SALE10.maxFee)}로, {manWon(7 * EOK)} 매매는 {won(OLD7.maxFee)}에서 {won(SALE7.maxFee)}로 내려갔습니다.
        {' '}{manWon(5_000 * MAN)} 미만·{manWon(2 * EOK)} 미만 등 낮은 구간의 요율과 한도액은 바뀌지 않았습니다.
      </p>
      <DataFigure n={7} title={`개정 전(~${ymd(OLD.to ?? OLD.from)}) · 후 최대 중개보수 비교 (주택, 한쪽 기준)`} unit="단위: 원" source={<>자료: 개정 전 — 서울특별시 주택 중개보수 등에 관한 조례({ymd(OLD.from)} 시행), 개정 후 — 공인중개사법 시행규칙 [별표 1]({ymd(S.from)} 시행) — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">거래</th><th scope="col" className="r">개정 전</th><th scope="col" className="r">개정 후</th><th scope="col" className="r">차이</th></tr>
          </thead>
          <tbody>
            {REFORM_SALE.map(row => (
              <tr key={`s${row.amount}`}>
                <th scope="row">매매 {manWon(row.amount)}</th>
                <td className="r">{num(row.before.maxFee)}<small>{pctPpm(row.before.maxRatePpm)}</small></td>
                <td className="r em">{num(row.after.maxFee)}<small>{pctPpm(row.after.maxRatePpm)}</small></td>
                <td className="r">{row.after.maxFee - row.before.maxFee === 0 ? '0' : `−${num(row.before.maxFee - row.after.maxFee)}`}</td>
              </tr>
            ))}
            {REFORM_LEASE.map(row => (
              <tr key={`l${row.amount}`}>
                <th scope="row">전세 {manWon(row.amount)}</th>
                <td className="r">{num(row.before.maxFee)}<small>{pctPpm(row.before.maxRatePpm)}</small></td>
                <td className="r em">{num(row.after.maxFee)}<small>{pctPpm(row.after.maxRatePpm)}</small></td>
                <td className="r">{row.after.maxFee - row.before.maxFee === 0 ? '0' : `−${num(row.before.maxFee - row.after.maxFee)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        개정 전 요율표는 시·도마다 시행일이 달랐고 {pctPpm(OLD.sale[OLD.sale.length - 1].ratePpm)}·{pctPpm(OLD.lease[OLD.lease.length - 1].ratePpm)}는 &lsquo;이내에서 협의&rsquo;하는 최고치였으므로, 위 표의 개정 전 금액은 당시 받을 수 있었던 최대치를 뜻합니다.
      </p>

      <h2 className="g-h2">언제 내고, 어떤 경우에 달라지나 — 지급시기·해제·분양권·교환</h2>
      <ul className="g-list">
        <li><strong>지급시기</strong> — 개업공인중개사와 중개의뢰인의 약정에 따르고, 약정이 없으면 중개대상물의 거래대금 지급이 완료된 날입니다(시행령 §27의2). 매매라면 보통 잔금일입니다.</li>
        <li><strong>계약이 깨진 경우</strong> — 개업공인중개사의 고의 또는 과실로 거래계약이 무효·취소·해제되면 중개보수를 받을 수 없습니다(법 §32① 단서). 당사자 사정으로 해제된 경우의 보수는 법에 정해진 금액이 없어 약정과 사정에 따라 달라집니다.</li>
        <li><strong>중개를 맡기지 않은 상대방</strong> — 대법원은 개업공인중개사가 자신에게 중개를 의뢰하지 않은 거래 당사자에게서는 원칙적으로 중개보수를 받을 수 없다고 판단했습니다(대법원 2024. 1. 4. 선고 2023다252162 판결). 여러 사무소가 함께 중개하는 공동중개라면 각자 자기 의뢰인에게서만 받는 것이 원칙입니다.</li>
        <li><strong>실비</strong> — 권리관계 확인이나 계약금 등의 반환채무이행 보장에 드는 실비는 중개보수와 별도로, 시·도 조례가 정한 범위에서 영수증 등을 붙여 청구할 수 있습니다(시행규칙 §20②).</li>
        <li><strong>교환</strong> — 교환대상 중 거래금액이 큰 쪽의 가액이 거래금액입니다(§20⑤2호). 계산기에서는 &lsquo;매매·교환&rsquo;을 고르고 큰 쪽 금액을 넣으면 됩니다.</li>
        <li><strong>매매와 임대차를 한 번에</strong> — 같은 물건을 같은 당사자끼리 같은 기회에 매매와 임대차로 거래하면(예: 매수하면서 매도인에게 다시 임대) 매매 거래금액만 적용합니다(§20⑤3호).</li>
        <li><strong>분양권</strong> — 거래금액은 분양가 총액이 아니라 거래 당시까지 낸 금액(계약금·중도금)에 프리미엄을 더한 금액으로 보는 것이 대법원 판례(2004도62)와 지자체 안내의 기준입니다.</li>
      </ul>
      <h3 className="g-h3">이 계산기가 판단하지 않는 것</h3>
      <ul className="g-list">
        <li>주거용 오피스텔 요건 충족 여부, 겸용 건물의 주택 면적 비율 — 입력한 &lsquo;중개대상물&rsquo; 선택을 그대로 씁니다.</li>
        <li>분양권의 기납입금, 교환 물건 가액 산정 — 계산된 거래금액을 직접 넣어야 합니다.</li>
        <li>실비와 시·도별 조례 차이 — 서울 조례와 같은 현행 별표 1 요율을 전제로 합니다.</li>
      </ul>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '공인중개사법 제32조(중개보수 등)', href: LAW('제32조') },
          { label: '공인중개사법 제33조(금지행위)', href: LAW('제33조') },
          { label: '공인중개사법 시행령 제27조의2(중개보수의 지급시기)', href: LAW('제27조의2', '공인중개사법시행령') },
          { label: '공인중개사법 시행규칙 [별표 1] 주택 중개보수 상한요율', href: 'https://www.law.go.kr/lsBylInfoPLinkR.do?bylCls=BE&lsNm=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC%EB%B2%95+%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&bylNo=0001&bylBrNo=00' },
          { label: '서울특별시 주택 중개보수 등에 관한 조례', href: 'https://www.law.go.kr/자치법규/서울특별시주택중개보수등에관한조례' },
          { label: '법제처 법령해석 — 간이과세자 공인중개사의 부가가치세 수령', href: 'https://www.moleg.go.kr/lawinfo/nwLwAnInfo.mo?mid=a10106020000&cs_seq=356669' },
          { label: '헌법재판소 2025. 4. 10. 2023헌마995 결정(간이과세자 중개보수 부가세)', href: 'https://www.law.go.kr/헌재결정례/(2023헌마995)' },
          { label: '부가가치세법 제36조(영수증 등)', href: LAW('제36조', '부가가치세법') },
          { label: '국세청 부가가치세 세율(간이과세자 업종별 부가가치율)', href: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2275&cntntsId=7696' },
          { label: '대법원 2005다32159 전원합의체 판결', href: 'https://www.law.go.kr/판례/(2005다32159)' },
        ]}
      >
        이 계산은 {ymd(S.from)} 시행 공인중개사법 시행규칙 [별표 1]·[별표 2]와 입력한 조건을 기준으로 한 <strong>법정 상한</strong>입니다. 실제 중개보수는 상한 안에서 협의로 정해지며,
        중개대상물 유형(주거용 오피스텔 요건 등)과 거래금액 산정, 부가세 부담은 중개사무소가 있는 시·도의 조례와 사무소의 과세유형에 따라 달라질 수 있습니다.
      </Disclaimer>

      <RelatedTools
        items={[
          { href: '/tools/finance/acquisition-tax', desc: '같은 매매가로 취득세·지방교육세 계산' },
          { href: '/tools/finance/real-estate', desc: '중개보수·취득세 포함 투자 수익률' },
          { href: '/tools/finance/rent-jeonse', desc: '전세·월세 중 무엇이 싼지 비교' },
          { href: '/tools/finance/dsr', desc: '주택담보대출 한도' },
          { href: '/tools/finance/capital-gains-tax', desc: '팔 때 내는 양도소득세' },
          { href: '/tools/finance/vat', desc: '부가세 포함·별도 금액 역산' },
        ]}
      />
    </ToolPage>
  )
}
