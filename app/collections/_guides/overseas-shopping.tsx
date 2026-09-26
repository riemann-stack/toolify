/* 상황별 가이드 — 블프·해외직구. 관부가세 예시는 관부가세 계산기와 같은 customsUtils.calcCustoms(한도·세율은 lib/krCustoms)로,
   배터리 Wh는 mAh × 전압 ÷ 1000으로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcCustoms, DEFAULT_USD_KRW, getCountry, type CountryId } from '@/app/tools/life/customs/customsUtils'
import { CUSTOMS_ITEM_DUTY_RATE_PCT, DUTY_FREE_LIMIT_USD, IMPORT_VAT_RATE, US_LIST_CLEARANCE_LIMIT_USD } from '@/lib/krCustoms'
import { AIR_BATTERY_WH } from '@/lib/collections'
import { GuideSources, num, pct, won, ymdKo, type CollectionGuide } from './shared'

interface Case { label: string; country: CountryId; item: keyof typeof CUSTOMS_ITEM_DUTY_RATE_PCT; price: number; ship: number; money: string }
const CASES: Case[] = [
  { label: '미국 운동화', country: 'us', item: 'shoe_sport', price: 180, ship: 15, money: '$180 + 배송 $15' },
  { label: '미국 운동화', country: 'us', item: 'shoe_sport', price: 210, ship: 15, money: '$210 + 배송 $15' },
  { label: '미국 영양제', country: 'us', item: 'supplement', price: 180, ship: 0, money: '$180' },
  { label: '미국 노트북', country: 'us', item: 'laptop', price: 1200, ship: 0, money: '$1,200' },
]
/** 보조배터리 셀 공칭 전압(V) — 리튬이온 3.6~3.7V, 표기가 없으면 3.7V로 본다 */
const CELL_V = 3.7
const BANKS_MAH = [10_000, 20_000, 27_000]

function Body() {
  const rows = CASES.map((c) => {
    const country = getCountry(c.country)
    const r = calcCustoms({
      countryId: c.country, itemId: c.item, productPrice: c.price, shippingFee: c.ship,
      exchangeRate: country.defaultRate, rateBase: country.defaultRateBase ?? 1, toUsdRate: country.toUsdRate,
      usdKrw: DEFAULT_USD_KRW, usage: 'personal',
    })
    return { ...c, r }
  })
  const [under, over] = rows
  const wh = BANKS_MAH.map((mah) => ({ mah, wh: (mah * CELL_V) / 1000 }))

  return (
    <>
      <h2>왜 진짜 가격 → 규격 순서인가</h2>
      <p>
        직구가 이득인지 결정하는 숫자는 표시 가격이 아니라 세금·배송비까지 더한 도착 가격입니다. 이것부터 계산해야 국내 판매가와 비교할 수 있고, 비교에서 이겨야 사이즈·전압 같은 규격을 따질 이유가
        생깁니다. 그래서 <Link href="/tools/life/customs">관부가세 계산기</Link>로 도착 가격을 내고, <Link href="/tools/life/unit-price">단위 가격</Link>으로 국내가와 비교한 다음,
        {' '}<Link href="/tools/unit/size">사이즈</Link>·<Link href="/tools/unit/converter">단위</Link>·<Link href="/tools/unit/battery">배터리</Link> 순으로 확인합니다.
      </p>
      <p>
        기준 숫자는 둘입니다. 개인이 쓰려고 사는 물건은 물품가격(배송비 제외)이 USD {DUTY_FREE_LIMIT_USD} 이하면 관세·부가세가 면제되고, 미국에서 오는 목록통관 물품은 USD {US_LIST_CLEARANCE_LIMIT_USD}까지 면제됩니다.
        한도를 넘으면 넘은 부분이 아니라 <strong>배송비를 포함한 전체 금액</strong>에 관세와 부가세({pct(IMPORT_VAT_RATE, 0)})가 붙습니다.
      </p>

      <h2>한도 경계에서 달라지는 세금</h2>
      <DataFigure n={1} title="직구 예시별 세금과 도착 가격" unit={`환율 1달러 ${num(DEFAULT_USD_KRW)}원 가정`} source={<>계산: 관부가세 계산기와 같은 식(관세법 시행규칙 §45, 수입통관 사무처리에 관한 고시) — 실제 과세환율은 주마다 고시</>}>
        <table>
          <thead>
            <tr><th scope="col">예시</th><th scope="col">가격</th><th scope="col" className="r">세금</th><th scope="col" className="r">도착 가격</th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={`${c.label}-${c.price}`}>
                <td>{c.label}</td>
                <td>{c.money}</td>
                <td className="r">{c.r.isDutyFree ? '면세' : won(c.r.totalTax)}</td>
                <td className="r">{won(c.r.finalKrw)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        운동화 두 줄을 비교하면 물품가격은 ${over.price - under.price} 차이지만 세금이 {won(over.r.totalTax)} 붙어 도착 가격 차이는 {won(over.r.finalKrw - under.r.finalKrw)}으로 벌어집니다.
        영양제는 목록통관 대상이 아니어서 미국에서 와도 한도가 USD {DUTY_FREE_LIMIT_USD}이고, 노트북은 {CUSTOMS_ITEM_DUTY_RATE_PCT.laptop === 0 ? '정보기술협정으로 관세가 0%라 부가세만 붙습니다' : `관세 ${CUSTOMS_ITEM_DUTY_RATE_PCT.laptop}%와 부가세가 함께 붙습니다`}.
        블랙프라이데이 할인으로 가격이 한도 근처까지 내려왔다면 장바구니를 나누기 전에 이 경계부터 확인하세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>같은 날 산 물건을 나눠 받으면 괜찮다고 여기기.</strong> 같은 판매자에게 같은 날 산 물건은 따로 배송돼도 합산해 한도를 봅니다. 입항일이 같다는 이유만으로 합산하던 기준은 2022년 11월에 없어졌지만, 구매일·판매자 기준 합산은 남아 있습니다.</li>
        <li><strong>한도를 배송비 포함 금액으로 착각하기.</strong> 면세 판정은 배송비를 뺀 물품가격으로 하지만, 과세가 되면 배송비까지 세금 계산에 들어갑니다.</li>
        <li><strong>배터리 용량을 mAh로만 보기.</strong> 기내 반입 기준은 Wh입니다. {wh.map((w) => `${num(w.mah)}mAh는 약 ${num(w.wh, 1)}Wh`).join(', ')}({CELL_V}V 기준)라 {AIR_BATTERY_WH.noApproval}Wh 이하는 승인 없이 휴대, {AIR_BATTERY_WH.withApproval}Wh까지는 항공사 승인이 필요하고, 그보다 크면 실을 수 없습니다. 보조배터리는 위탁 수하물로 부칠 수 없고,
          {' '}{ymdKo(AIR_BATTERY_WH.perPersonSince)}부터는 용량과 관계없이 1인당 {AIR_BATTERY_WH.perPersonMax}개까지만 기내에 가져갈 수 있으며 기내에서 충전·사용할 수 없습니다. 여러 개를 사 올 계획이라면 개수부터 세어 보세요.</li>
        <li><strong>해외 사이즈 표기를 그대로 믿기.</strong> 같은 &lsquo;US 9&rsquo;라도 남녀·브랜드마다 발 길이가 다릅니다. 사이즈 변환 뒤에도 판매처의 cm 표를 한 번 더 확인하세요.</li>
      </ul>

      <Callout tone="note" title="관세청에 직접 확인할 때">
        판매 목적으로 오해받을 만큼 같은 물건을 여러 개 사거나, 식품·의약품·주류처럼 통관 요건이 따로 있는 품목이라면 관세청 고객지원센터나 UNI-PASS에서 품목 분류와 요건을 먼저 확인하세요.
        계산기는 대표 세율을 쓰기 때문에 품목 분류가 달라지면 세금도 달라집니다.
      </Callout>

      <GuideSources
        items={[
          { label: '관세청 — 해외직구 물품, 입항일 같아도 합산과세 면제(2022.11)', href: 'https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?mi=2891&nttSn=10069842' },
          { label: '관세청 UNI-PASS — 세율·과세환율 조회', href: 'https://unipass.customs.go.kr' },
          { label: '국가법령정보센터 — 관세법 시행규칙', href: 'https://www.law.go.kr/법령/관세법시행규칙' },
          { label: '국토교통부 — 항공위험물 기내 반입 안내', href: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156753374' },
          { label: '대한민국 정책브리핑 — 보조배터리 여객기 반입 1인당 2개(2026.4.20 시행)', href: 'https://www.korea.kr/news/policyNewsView.do?newsId=148962298' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '해외직구, 결제 전에 확인할 숫자', Body }
export default guide
