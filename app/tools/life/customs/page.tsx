import Link from 'next/link'
import CustomsClient from './CustomsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import {
  calcCustoms, getCountry, getItem, fmt,
  COUNTRIES, ITEMS, DEFAULT_USD_KRW,
  type CountryId,
} from './customsUtils'
import {
  dutyFreeLimitUsd,
  LUXURY_EXCISE, JEWELRY_EXCISE, EXCISE_EDU_TAX_RATIO,
  WINE_LIQUOR_TAX_PCT, LIQUOR_EDU_TAX_RATIO, IMPORT_VAT_RATE, LIQUOR_DUTY_EXEMPT,
} from '@/lib/krCustoms'

export const metadata = buildMetadata({
  path: '/tools/life/customs',
  title: '관부가세 계산기 — 미국 $200 · 29개 품목 · 목록통관 자동',
  description: '미국·중국·유럽·일본 직구 간이 예상세액 — 면세 한도(물품가격 기준) 자동 판정 + 29개 품목 관세율 + 부가세·개소세·교육세·주세 계산. HS코드·원산지·FTA 미반영 참고용.',
  keywords: ['해외직구 관세', '관부가세 계산기', '미국 200달러 면세', '목록통관', '일반통관', '아마존 직구', '알리익스프레스 관세', '명품 직구', '노트북 무관세', '합산 과세'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowBg = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

/* ── 빌드 시 calcCustoms로 계산하는 예시 (도구와 같은 식·같은 기본 환율) ─────────────
   환율: 출발국 기본 환율(COUNTRIES.defaultRate, 2026년 9월 시세 근사), 비USD 면세 판정은 USD 1,400원(DEFAULT_USD_KRW)으로 교차 환산 */
const won = (n: number) => `${fmt(Math.round(n))}원`
function example(countryId: CountryId, itemId: string, price: number, ship: number, rate?: number) {
  const c = getCountry(countryId)
  const item = getItem(itemId)
  const exchangeRate = rate ?? c.defaultRate
  const r = calcCustoms({
    countryId, itemId, productPrice: price, shippingFee: ship,
    exchangeRate, rateBase: c.defaultRateBase ?? 1, toUsdRate: c.toUsdRate,
    usdKrw: c.currency === 'USD' ? exchangeRate : DEFAULT_USD_KRW, usage: 'personal',
  })
  const money = (v: number) => `${c.currencyUnit}${fmt(v)}`
  const title = `${c.shortName} ${item.shortLabel} ${money(price)}${ship > 0 ? ` + 배송 ${money(ship)}` : ''}`
  return { c, item, r, title, exchangeRate }
}
const SHOE_199 = example('us', 'shoe_sport', 199, 0)
const SHOE_201 = example('us', 'shoe_sport', 201, 0)
const SHOE_250 = example('us', 'shoe_sport', 250, 0)
const LAPTOP = example('us', 'laptop', 999, 25)
const KNIT_CN = example('cn', 'cloth_knit', 1200, 40)
const SUPPLEMENT = example('us', 'supplement', 180, 10)
const BAG_EU = example('eu', 'bag', 1500, 30)
const WINE_EU = example('eu', 'wine', 60, 20)
const WINE_EU_OVER = example('eu', 'wine', 150, 20)
const EXAMPLES = [SHOE_199, SHOE_201, LAPTOP, KNIT_CN, SUPPLEMENT, BAG_EU, WINE_EU, WINE_EU_OVER]

/* 환율 경계: 같은 유로 금액이 환율에 따라 면세↔과세로 바뀌는 사례 */
const EU_BASE_RATE = getCountry('eu').defaultRate
const EU_HIGH_RATE = EU_BASE_RATE + 50
const COS_EU_LOW = example('eu', 'cosmetic', 130, 15)
const COS_EU_HIGH = example('eu', 'cosmetic', 130, 15, EU_HIGH_RATE)

/* 국가별 한도 표 — COUNTRIES + lib/krCustoms dutyFreeLimitUsd */
const COUNTRY_ROWS = COUNTRIES.map(c => ({
  id: c.id,
  name: c.shortName,
  listed: dutyFreeLimitUsd(c.dutyFreeUsd, true),
  declared: dutyFreeLimitUsd(c.dutyFreeUsd, false),
  rate: `1${c.currency === 'USD' ? '$' : ` ${c.currency}`} ≈ ${fmt(c.defaultRate, c.defaultRate < 100 ? 1 : 0)}원`,
  popular: c.popular,
}))

/* 관세율별 품목 표 — ITEMS(= lib/krCustoms CUSTOMS_ITEM_DUTY_RATE_PCT)에서 묶음 */
const RATE_GROUPS = [...new Set(ITEMS.map(i => i.dutyRate))].sort((a, b) => a - b).map(rate => {
  const items = ITEMS.filter(i => i.dutyRate === rate)
  const extra: string[] = []
  for (const i of items) {
    if (i.excise) extra.push(`${i.shortLabel}: 1개당 ${fmt(i.excise.threshold / 10000)}만원 초과분 개소세 ${i.excise.rate}%`)
    if (i.liquor) extra.push(`${i.shortLabel}: 주세 ${i.liquor.rate}% + 교육세(주세의 ${LIQUOR_EDU_TAX_RATIO * 100}%), 1병·$${LIQUOR_DUTY_EXEMPT.maxUsd} 이하면 관세만 면제`)
    if (!i.isListed && !i.liquor) extra.push(`${i.shortLabel}: 목록통관 배제(수입신고)`)
    if (i.id === 'book') extra.push('도서: 부가세 면제')
  }
  return { rate, labels: items.map(i => i.shortLabel), extra }
})

const FAQ_LD = [
  {
    q: '미국 직구가 200달러를 넘으면 세금이 얼마나 붙나요?',
    a: `한도를 넘으면 <strong>초과분이 아니라 전체 금액</strong>에 세금이 붙습니다. 미국 운동화 $250(배송비 0, 환율 ${fmt(SHOE_250.exchangeRate)}원)이라면 과세가격 ${won(SHOE_250.r.totalKrw)} → 관세 13% ${won(SHOE_250.r.duty)} → 부가세 10%(과세가격+관세 기준) ${won(SHOE_250.r.vat)}으로, 세금 합계는 <strong>${won(SHOE_250.r.totalTax)}</strong>입니다. 같은 금액이라도 노트북·휴대폰처럼 관세 0% 품목이면 부가세만 내므로 세금이 훨씬 적습니다. 실제 세액은 관세청 과세환율과 HS 분류에 따라 달라집니다.`,
  },
  {
    q: '알리·테무 주문은 왜 대부분 세금이 안 붙나요?',
    a: `중국발 직구의 면세 한도는 물품가격 $150입니다. 저가 생활용품은 한 건이 이 한도에 한참 못 미쳐 대부분 면세로 통관됩니다. 다만 <strong>같은 판매자에게서 같은 날 산 물건</strong>은 따로 배송돼도 합산되고, 합계가 $150을 넘으면 전액 과세됩니다. 의류 ¥1,200(약 $${KNIT_CN.r.productUsd.toFixed(0)})처럼 한 건만으로도 한도를 넘으면 관세 13%와 부가세가 붙어 세금이 ${won(KNIT_CN.r.totalTax)} 정도 됩니다(도구 기본 환율 기준).`,
  },
  {
    q: '명품 가방을 직구하면 세금이 어떻게 계산되나요?',
    a: `가방은 관세 8%에, (과세가격+관세)가 <strong>1개당 ${fmt(LUXURY_EXCISE.threshold / 10000)}만원</strong>을 넘는 부분에 개별소비세 ${LUXURY_EXCISE.rate}%, 그 개소세의 ${EXCISE_EDU_TAX_RATIO * 100}%만큼 교육세가 붙고, 마지막으로 이 모두를 더한 금액에 부가세 10%가 붙습니다. 유럽 가방 €1,500 + 배송 €30(€1 = ${fmt(BAG_EU.exchangeRate)}원)이면 관세 ${won(BAG_EU.r.duty)}, 개소세 ${won(BAG_EU.r.excise)}, 교육세 ${won(BAG_EU.r.eduTax)}, 부가세 ${won(BAG_EU.r.vat)}으로 세금 합계 약 <strong>${won(BAG_EU.r.totalTax)}</strong>입니다. 국내 매장가와 비교할 때는 세금 외에 국내 A/S·교환 가능 여부도 함께 따져 보세요.`,
  },
  {
    q: '노트북·휴대폰은 정말 관세가 없나요?',
    a: `네. 컴퓨터(HS 8471)·휴대폰(8517)·컴퓨터용 모니터·디지털카메라 본체 등은 WTO 정보기술협정(ITA) 품목이라 기본 관세가 0%입니다. 하지만 면세 한도를 넘으면 <strong>부가세 10%는 그대로</strong> 붙습니다. 미국 노트북 $999 + 배송 $25라면 과세가격 ${won(LAPTOP.r.totalKrw)}에 부가세 ${won(LAPTOP.r.vat)}입니다. TV 수신 기능이 있는 모니터, 카메라 교환렌즈 단품처럼 분류가 달라지면 8%가 붙을 수 있습니다.`,
  },
  {
    q: '합산 과세는 어떤 경우에 적용되나요?',
    a: '<strong>같은 판매자에게서 같은 날 산 물품</strong>을 나눠 들여오거나 <strong>한 운송장(B/L·AWB)</strong>으로 온 물품을 나눠 신고하면 물품가격을 합산해 면세 한도를 봅니다. 구매일이 다른 물품을 따로 배송받으면 같은 날 도착해도 원칙적으로 각각 판단합니다.',
  },
  {
    q: '사업자 명의로 사거나 구매대행을 이용하면 면세가 되나요?',
    a: '소액면세는 <strong>자가사용 물품</strong>에만 적용됩니다(관세법 시행규칙 제45조). 판매·영업용으로 들여오는 물품은 금액과 관계없이 과세 대상이고, 이 도구에서 &lsquo;사업자&rsquo;를 고르면 한도 판정 없이 세금을 계산합니다. 구매대행은 업체가 주문만 대신하고 수입자가 본인이면 자가사용으로 볼 수 있지만, 되팔 목적이면 자가사용이 아니므로 적발 시 관세와 가산세가 부과될 수 있습니다.',
  },
  {
    q: '자가사용으로 인정되는 수량 기준이 있나요?',
    a: '있습니다. 「수입통관 사무처리에 관한 고시」 별표의 자가사용 인정기준이 품목별 수량을 정하고 있으며, 예를 들어 <strong>건강기능식품은 6병, 의약품은 6병(초과 시 용법상 3개월 복용량), 주류는 1병(1L 이하·$150 이하, 이때도 관세만 면제)</strong> 수준입니다. 기준을 넘으면 자가사용 면세가 안 되거나 식약처 등의 수입 요건을 갖춰야 할 수 있습니다. 같은 제품을 여러 개 사는 경우라면 주문 전에 관세청 고객지원센터(125)나 고시 원문으로 해당 품목 기준을 확인하세요.',
  },
  {
    q: '과세됐다가 반품하면 낸 세금을 돌려받을 수 있나요?',
    a: '받을 수 있습니다. 관세법 제106조의2는 개인의 자가사용 물품을 <strong>수입한 상태 그대로</strong> 수출하는 경우, 수입신고 수리일부터 6개월 안에 보세구역에 반입했다가 수출하면 낸 관세를 돌려주도록 정하고 있습니다(계약 내용과 다른 물품은 제106조가 따로 규정). 환급은 환급신청서·수입신고필증·수출신고필증을 갖춰 세관에 신청하며, 관세청 지침상 수출가격 200만원 이하로 수출신고 없이 판매자에게 돌려보낸 경우에도 송품장·반품 확인·환불 영수 자료로 인정받을 수 있습니다. 사용한 흔적이 있으면 대상이 아니므로 반품을 보내기 <strong>전에</strong> 특송업체나 세관에 필요한 서류를 먼저 확인하세요.',
  },
  {
    q: '통관 수수료·배송대행 수수료도 계산에 들어가나요?',
    a: '들어가지 않습니다. 이 도구의 결과는 관세·개소세·주세·교육세·부가세까지의 <strong>세금</strong>이며, 과세 물품을 특송업체가 수입신고할 때 받는 통관 대행 수수료, 배송대행지(배대지) 수수료, 카드사 해외결제 수수료는 업체별로 달라 포함하지 않았습니다. 결제 예정액을 잡을 때는 이용하는 업체의 수수료표를 따로 더하세요.',
  },
]

export default function CustomsPage() {
  return (
    <ToolPage width={880} slug="/tools/life/customs">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />관부가세 계산기
      </h1>
      <p className="tp-lead">
        미국·중국·유럽·일본 직구 면세 한도(물품가격 기준) + 29개 품목 관세율·부가세·개소세·주세. <strong style={{ color: 'var(--text)' }}>간이 예상세액</strong> (HS·원산지·FTA 미반영).
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="관세법 시행규칙 제45조 소액면세 한도($150)·특송물품 수입통관 사무처리에 관한 고시(미국발 목록통관 $200)·관세율표 기본세율·개별소비세법·주세법·부가가치세법 기준 간이 예상세액"
        sources={[
          { label: '국가법령정보센터 — 관세법 시행규칙', href: 'https://www.law.go.kr/법령/관세법시행규칙' },
          { label: '국가법령정보센터 — 수입통관 사무처리에 관한 고시', href: 'https://www.law.go.kr/행정규칙/수입통관사무처리에관한고시' },
          { label: '국가법령정보센터 — 특송물품 수입통관 사무처리에 관한 고시', href: 'https://www.law.go.kr/행정규칙/특송물품수입통관사무처리에관한고시' },
          { label: '국가법령정보센터 — 개별소비세법', href: 'https://www.law.go.kr/법령/개별소비세법' },
          { label: '관세청 — 해외직구 안내', href: 'https://www.customs.go.kr' },
          { label: '관세청 UNI-PASS — 세율·주간환율 조회', href: 'https://unipass.customs.go.kr' },
        ]}
      />

      <CustomsClient />

      <GuideDivider />

      <Callout tone="note" title="간이 예상세액입니다">
        이 도구는 품목을 대표 HS코드 하나로 보고 기본세율을 적용합니다. 원산지·FTA 협정세율·세부 분류·관세청 과세환율은 반영하지 않으므로, 실제 세액과 통관 가능 여부는 UNI-PASS 예상세액 조회나 관세청 고객지원센터(125)로 확인하세요.
      </Callout>

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>출발 국가 선택</strong> — 미국은 목록통관 물품 $200, 그 밖의 국가는 $150 한도로 판정합니다.</li>
        <li><strong>품목 선택</strong> — 29개 분류 중 가장 가까운 것을 고릅니다. 품목에 따라 관세율과 목록통관 여부가 바뀝니다.</li>
        <li><strong>상품 가격·배송비·환율 입력</strong> — 가격과 배송비는 현지 통화로 넣습니다. 달러가 아닌 통화는 면세 판정용 USD 환율도 함께 씁니다.</li>
        <li><strong>자가사용 / 사업자 선택</strong> — 사업자를 고르면 면세 한도를 적용하지 않습니다.</li>
        <li><strong>결과 확인</strong> — 면세·과세 판정 이유, 세목별 세액, 예상 결제액이 나옵니다.</li>
      </ol>
      <p className="g-p">
        &lsquo;품목별 관세&rsquo; 탭에서는 29개 품목의 세율을 한 표로 비교할 수 있고, &lsquo;시나리오&rsquo; 탭은 아마존 노트북·알리 의류·유럽 가방 같은 대표 사례를 한 번에 채워 줍니다.
      </p>

      {/* 2. 계산식 */}
      <h2 className="g-h2">세금이 붙는 순서 — 도구가 쓰는 계산식</h2>
      <p className="g-p">
        면세 판정과 세금 계산은 기준 금액이 다릅니다. <strong>면세 한도는 배송비를 뺀 물품가격(달러)</strong>으로 보고, 과세가 결정되면 <strong>세금은 물품가격에 운임까지 더한 과세가격</strong>에 매깁니다. 그래서 물품가격 $195에 배송비 $30인 운동화는 한도($200) 안이라 면세지만, $201짜리는 배송비가 0원이어도 전액이 과세됩니다.
      </p>
      <ol className="g-list">
        <li><strong>과세가격</strong> = (상품가격 + 국제 배송비) × 환율</li>
        <li><strong>관세</strong> = 과세가격 × 품목 관세율</li>
        <li><strong>개별소비세</strong>(가방·시계·보석 등) = (과세가격 + 관세 − 기준가격) × {LUXURY_EXCISE.rate}% — 기준가격은 가방·시계 1개당 {fmt(LUXURY_EXCISE.threshold / 10000)}만원, 보석·귀금속 1개당 {fmt(JEWELRY_EXCISE.threshold / 10000)}만원. 교육세는 개소세의 {EXCISE_EDU_TAX_RATIO * 100}%</li>
        <li><strong>주세</strong>(와인) = (과세가격 + 관세) × {WINE_LIQUOR_TAX_PCT}%, 교육세는 주세의 {LIQUOR_EDU_TAX_RATIO * 100}%</li>
        <li><strong>부가세</strong> = (과세가격 + 관세 + 개소세·주세 + 교육세) × {IMPORT_VAT_RATE * 100}% — 도서는 면제</li>
      </ol>
      <p className="g-p">
        아래 표는 같은 식으로 이 페이지를 만들 때 계산한 값입니다(도구 기본 환율 기준). 운동화 $199와 $201은 2달러 차이지만 한쪽은 세금이 0원, 다른 쪽은 세금 합계가 {won(SHOE_201.r.totalTax)}입니다. 한도 근처에서 쿠폰이나 옵션 하나로 물품가격이 바뀐다면 결제 전에 꼭 다시 계산해 보세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
          <caption className="srOnly">사례별 면세 판정과 세목별 세액 (도구 계산식·기본 환율 기준)</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>사례</th>
              <th scope="col" style={thR}>물품가격 / 한도</th>
              <th scope="col" style={thR}>과세가격</th>
              <th scope="col" style={thR}>관세</th>
              <th scope="col" style={thR}>개소세·주세·교육세</th>
              <th scope="col" style={thR}>부가세</th>
              <th scope="col" style={thR}>세금 합계</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLES.map((e, i) => (
              <tr key={e.title} style={rowBg(i)}>
                <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{e.title}</th>
                <td style={tdR}>${e.r.productUsd.toFixed(2)} / ${e.r.dutyFreeLimit}<br /><span style={{ color: e.r.isDutyFree ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{e.r.isDutyFree ? '면세' : e.r.liquorDutyExempt ? '관세만 면제' : e.item.dutyFreeExcluded ? '과세(면세 배제)' : '과세'}</span></td>
                <td style={tdR}>{won(e.r.totalKrw)}</td>
                <td style={tdR}>{won(e.r.duty)}</td>
                <td style={tdR}>{won(e.r.excise + e.r.liquorTax + e.r.eduTax)}</td>
                <td style={tdR}>{won(e.r.vat)}</td>
                <td style={{ ...tdR, fontWeight: 700 }}>{won(e.r.totalTax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        환율: 미국 $1 = {fmt(getCountry('us').defaultRate)}원, 중국 1위안 = {fmt(getCountry('cn').defaultRate)}원, 유럽 €1 = {fmt(EU_BASE_RATE)}원(2026년 9월 시세 근사). 달러 외 통화는 원화 환산액을 $1 = {fmt(DEFAULT_USD_KRW)}원으로 나눠 한도와 비교합니다. 영양제는 목록통관 배제 품목이라 미국발이어도 한도가 $150입니다. 와인 등 주류는 소액면세 대상이 아니어서 주세·교육세·부가세는 늘 붙고, 1병(1L 이하)·물품가격 $150 이하일 때만 관세가 면제됩니다(도구는 1병으로 보고 계산). 그래서 €60 와인은 관세 0원, 물품가격이 $150을 넘는 €150 와인은 관세까지 붙습니다.
      </p>
      <p className="g-p">
        개별소비세 기준가격은 <strong>물건 1개당</strong> 적용됩니다. 도구는 입력한 금액을 물건 1개로 보고 계산하므로, 150만원짜리 가방 두 개를 한 번에 샀다면 합계가 200만원을 넘어도 개별소비세는 붙지 않는 것이 원칙입니다. 이런 경우 가방 하나씩 따로 계산해 더하는 편이 실제에 가깝습니다.
      </p>

      {/* 3. 목록통관 vs 일반통관 */}
      <h2 className="g-h2">목록통관 vs 일반(수입)신고 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid var(--teal-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--teal-600)', fontWeight: 700, margin: '0 0 6px' }}>목록통관 (간이 절차)</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              특송업체가 제출한 <strong style={{ color: 'var(--text)' }}>통관목록</strong>만으로 수입신고를 갈음합니다.<br />
              조건: 자가사용 · 물품가격 한도 이하($200/$150) · 목록통관 배제 품목이 아닐 것
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid var(--pink-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--pink-600)', fontWeight: 700, margin: '0 0 6px' }}>일반(수입)신고</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              수입신고서를 내고 통관합니다.<br />
              사유: 한도 초과 · 사업자 수입 · 목록통관 배제 품목(의약품·건강기능식품·검역 대상 식품·주류·담배 등)
            </p>
          </div>
        </div>
      </div>
      <p className="g-p">
        목록통관은 허용 품목을 하나하나 지정하는 방식이 아니라 <strong>배제 대상만 정해 두는 방식</strong>입니다. 의류·신발·전자제품·화장품 같은 일반 소비재는 대부분 목록통관이 가능하고, 의약품·건강기능식품·의료기기·검역 대상 식품과 동식물·주류·담배 등이 배제되어 수입신고를 거칩니다.
      </p>
      <Callout tone="note" title="소액면세는 통관 절차와 별개입니다">
        배제 품목(건강기능식품·식품 등)도 자가사용이고 물품가격이 $150 이하면 관세·부가세가 면제될 수 있습니다. 다만 <strong>미국 $200 한도는 목록통관 물품에만</strong> 적용되므로, 수입신고 대상인 영양제·식품은 미국발이어도 $150을 넘으면 과세됩니다. 주류는 소액면세 대상이 아니라서 1병(1L 이하)·$150 이하여도 <strong>관세만 면제</strong>되고 주세·교육세·부가세는 과세됩니다. 건강기능식품 6병처럼 품목별 자가사용 인정 수량 기준도 따로 있습니다.
      </Callout>

      {/* 4. 국가별 한도 */}
      <h2 className="g-h2">출발국별 면세 한도 — 미국 $200 vs 기타 $150</h2>
      <p className="g-p">
        소액면세의 기본 한도는 관세법 시행규칙 제45조의 <strong>물품가격 $150</strong>이고, 미국에서 특송으로 들어오는 목록통관 물품만 관세청 특송 고시에 따라 <strong>$200</strong>까지 인정됩니다. 판정 기준은 &lsquo;발송 국가&rsquo;이므로 미국 쇼핑몰에서 샀어도 다른 나라 창고에서 발송되면 $150이 적용될 수 있습니다. 표의 환율은 도구 기본값(시세 근사)이며 실제 판정에 쓰이는 과세환율과는 다릅니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
          <caption className="srOnly">출발국별 소액면세 한도와 도구 기본 환율</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={th}>출발국</th>
              <th scope="col" style={thR}>목록통관 물품</th>
              <th scope="col" style={thR}>수입신고 물품<br />(영양제·식품)</th>
              <th scope="col" style={thR}>도구 기본 환율</th>
              <th scope="col" style={th}>주요 쇼핑몰</th>
            </tr>
          </thead>
          <tbody>
            {COUNTRY_ROWS.map((c, i) => (
              <tr key={c.id} style={rowBg(i)}>
                <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{c.name}</th>
                <td style={{ ...tdR, fontWeight: 700 }}>${c.listed}</td>
                <td style={tdR}>${c.declared}</td>
                <td style={tdR}>{c.rate}</td>
                <td style={tdMuted}>{c.popular}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. 환율 */}
      <h2 className="g-h2">환율과 한도 경계 — 결과가 뒤집히는 경우</h2>
      <p className="g-p">
        세관은 결제 당일 카드 환율이 아니라 <strong>과세환율</strong>을 씁니다. 관세법 제18조에 따라 수입신고일이 속한 주의 전주(월~금) 기준환율·재정환율을 평균해 관세청이 주 단위로 정하며, UNI-PASS의 &lsquo;주간환율&rsquo;에서 확인할 수 있습니다. 달러가 아닌 통화로 산 물건은 이 환율로 원화 환산한 뒤 다시 달러로 바꿔 한도와 비교하므로, 환율이 조금만 움직여도 판정이 달라질 수 있습니다.
      </p>
      <p className="g-p">
        예를 들어 유럽 화장품 €130 + 배송 €15는 €1 = {fmt(EU_BASE_RATE)}원일 때 물품가격이 ${COS_EU_LOW.r.productUsd.toFixed(2)}로 면세지만, €1 = {fmt(EU_HIGH_RATE)}원이 되면 ${COS_EU_HIGH.r.productUsd.toFixed(2)}로 한도를 넘어 세금 {won(COS_EU_HIGH.r.totalTax)}이 붙습니다. 도구가 물품가격이 한도의 ±5% 안에 들면 경고를 띄우는 이유입니다. 달러가 아닌 통화라면 한도의 90% 정도에서 멈추는 것이 안전하고, 배송비를 알 수 없는 탁송품은 실제 운임 대신 관세청이 정한 과세운임표가 쓰일 수 있다는 점도 알아 두세요.
      </p>

      {/* 6. 품목별 관세율 */}
      <h2 className="g-h2">품목별 관세율 — 도구가 쓰는 기본세율</h2>
      <p className="g-p">
        관세율은 관세율표(관세법 별표)의 기본세율을 품목 대표 HS코드 기준으로 옮긴 값입니다. 의류·신발은 13%, 가방·시계·완구·운동용품은 8%, 화장품은 6.5%가 많고, 정보기술협정(ITA) 대상인 컴퓨터·휴대폰·모니터·디지털카메라와 도서는 0%입니다. 게임 콘솔은 기본세율이 8%지만 WTO 협정세율 0%가 우선 적용됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
          <caption className="srOnly">관세율별 도구 품목과 추가 내국세</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={thR}>관세율</th>
              <th scope="col" style={th}>품목 (도구 분류)</th>
              <th scope="col" style={th}>추가로 확인할 점</th>
            </tr>
          </thead>
          <tbody>
            {RATE_GROUPS.map((g, i) => (
              <tr key={g.rate} style={rowBg(i)}>
                <th scope="row" style={{ ...tdR, fontWeight: 700 }}>{g.rate}%</th>
                <td style={td}>{g.labels.join(' · ')}</td>
                <td style={tdMuted}>{g.extra.length > 0 ? g.extra.join(' / ') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="warn" title="같은 물건도 분류가 바뀌면 세율이 달라집니다">
        TV 수신 기능이 있는 모니터는 TV로 분류돼 8%, 카메라 교환렌즈 단품은 8%, 완구로 분류되는 게임기는 8%입니다. 유럽·미국산이라도 원산지 증명이 없으면 FTA 협정세율이 적용되지 않습니다. 고가품이라면 결제 전에 UNI-PASS 세율 조회나 관세사 상담으로 HS코드를 확인하세요.
      </Callout>

      {/* 7. 합산 과세 */}
      <h2 className="g-h2">합산 과세 기준 (현행)</h2>
      <p className="g-p">
        면세 한도를 여러 건으로 나눠 피하는 것을 막기 위해 「수입통관 사무처리에 관한 고시」는 두 경우에 물품가격을 합산합니다. 첫째, <strong>같은 해외 판매자에게서 같은 날 구매</strong>한 물품을 나눠 들여오는 경우. 둘째, <strong>하나의 운송장(B/L·AWB)</strong>으로 들어온 물품을 나눠 신고하는 경우입니다. 예전에는 구매일이 달라도 같은 날 입항하면 합산했지만, 이 기준은 2022년 11월 17일 고시 개정으로 삭제됐습니다.
      </p>
      <div style={card}>
        <ul className="g-list" style={{ margin: 0 }}>
          <li>같은 날 같은 쇼핑몰에서 $120 + $80 결제, 따로 배송 → 합산 $200 → <strong>중국발은 과세</strong>, 미국발 목록통관 물품은 한도 이내</li>
          <li>월요일에 A몰, 수요일에 B몰에서 각각 $140 → 같은 날 도착해도 <strong>각각 면세 판단</strong></li>
          <li>한 박스(운송장 1개)로 받은 물건을 둘로 나눠 신고 → <strong>합산</strong></li>
        </ul>
      </div>
      <p className="g-p">
        합산되면 합계 금액 전체가 과세되므로 이 도구에는 합산한 물품가격을 한 번에 넣어 계산하면 됩니다. 가족 명의를 빌려 수취인을 나누거나 주문을 인위적으로 쪼개는 것은 권장하지 않으며, 명의 도용은 처벌 대상입니다.
      </p>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/unit/size" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외 직구 사이즈</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            US·EU·UK → 한국 의류·신발
          </p>
        </Link>
        <Link href="/tools/life/travel-budget" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 예산</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18 도시 × 3 스타일
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 + 6 항아리
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
