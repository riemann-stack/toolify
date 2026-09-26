import Link from 'next/link'
import TravelTipClient from './TravelTipClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { COUNTRIES, getCountry, calcTip, fmt, type CountryRates, type TipCategory } from './travelTipUtils'

export const metadata = buildMetadata({
  path: '/tools/life/travel-tip',
  title: '해외여행 팁 계산기 — 19개국 × 9 서비스 + 만족도 + 원화 환산',
  description: '19개국 × 9 서비스(식당·택시·호텔·골프·마사지) 적정 팁 + 만족도 보정 + 봉사료 자동 안내 + 인원 분할·원화 환산.',
  keywords: ['해외여행 팁', '미국 팁', '일본 팁 문화', '유럽 식당 팁', '호텔 벨보이', '골프 캐디 팁', '마사지 팁', '크루즈 팁', '봉사료 Service Charge', '여행 매너'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }
const td: React.CSSProperties = { padding: '9px 12px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }

/* ── 국가별 기준표 — 계산기 데이터(COUNTRIES)를 빌드 시 그대로 표로 ── */
function rateText(r?: CountryRates): string {
  if (!r) return '—'
  if (r.pct) return r.pct.max === 0 ? '안 줌' : `${r.pct.min} · ${r.pct.mid} · ${r.pct.max}%`
  if (r.flat) return r.flat.max === 0 ? '안 줌' : `${fmt(r.flat.min)} · ${fmt(r.flat.mid)} · ${fmt(r.flat.max)} ${r.flat.unit}`
  return '—'
}
/* 분류 라벨·색은 본문 h2 표기(필수·선택·안 줌)에 맞추고 텍스트 AA 안전 시맨틱 토큰만 사용 */
const CAT_CELL: Record<TipCategory, { label: string; color: string }> = {
  mandatory: { label: '필수', color: 'var(--danger)' },
  optional:  { label: '선택', color: 'var(--warning)' },
  rare:      { label: '거의 없음', color: 'var(--success)' },
  no:        { label: '안 줌', color: 'var(--muted)' },
}
const COUNTRY_ROWS = COUNTRIES.map((c) => ({
  id: c.id,
  name: c.shortName,
  cat: CAT_CELL[c.category].label,
  catColor: CAT_CELL[c.category].color,
  sc: c.serviceCharge,
  restaurant: rateText(c.rates.restaurant),
  taxi: rateText(c.rates.taxi),
  hotel: rateText(c.rates.hotel),
}))

/* ── 계산 예시 — 화면 계산기와 같은 calcTip 결과 ── */
const US = getCountry('us')
const EX_PCT = calcTip(US, 'restaurant', 120, 'good', 4, US.defaultRate)
const EX_TOUR = calcTip(US, 'tour', 0, 'good', 3, US.defaultRate)
const PH = getCountry('ph')
const EX_GOLF = calcTip(PH, 'golf', 0, 'good', 1, PH.defaultRate)
const usd = (n: number) => `$${fmt(n, 2)}`
const krw = (n: number) => `${fmt(Math.round(n / 10) * 10)}원`

const FAQ_LD = [
  { q: '미국 식당 팁은 얼마가 적당한가요?',
    a: '<strong>15~20%가 표준</strong>이며, 만족도에 따라 조정합니다.<br/>• 보통: 15%<br/>• 좋음: 18%<br/>• 매우 좋음: 20% 또는 그 이상<br/>• 고급 레스토랑은 20~25%, 카운터·테이크아웃은 10% 또는 잔돈<br/>기준 금액은 판매세를 더하기 전의 <strong>세전 금액(subtotal)</strong>이 일반적입니다. 6명 이상 단체는 업장 정책으로 18% 안팎의 자동 팁(Auto Gratuity)이 붙는 경우가 많으니 영수증을 먼저 확인하세요.' },
  { q: '일본에서 팁을 주면 안 되나요?',
    a: '<strong>주지 않는 것이 기본</strong>입니다. 일본정부관광국(JNTO)도 일본에는 팁 관례가 없고, 식당·호텔·택시에서는 청구된 금액만 내면 된다고 안내합니다. 현금을 그대로 건네면 정중하게 거절당하거나 직원이 당황할 수 있습니다.<br/>예외적으로 해외 손님에 익숙한 <strong>전속 가이드·통역</strong>에게 감사 표시를 할 때는 봉투에 넣어 조심스럽게 건넵니다. 전통 료칸에서 담당 직원에게 心付け(고코로즈케, ¥1,000~3,000)를 작은 봉투(ぽち袋)에 넣어 건네는 관습도 있지만 필수는 아닙니다. 고급 호텔·료칸은 요금에 サービス料(봉사료)가 이미 포함된 경우가 많습니다.' },
  { q: '봉사료(Service Charge)가 이미 포함된 경우?',
    a: '이미 봉사료가 청구됐다면 <strong>추가 팁은 선택</strong>입니다. 영수증에서 확인할 표기:<br/>• <strong>Service Charge · Gratuity</strong>: 봉사료(보통 10~12.5%)<br/>• <strong>Auto Gratuity</strong>: 자동 팁(미국 단체)<br/>• <strong>Service compris</strong>(프랑스): 메뉴 가격에 봉사료 포함<br/>• <strong>サービス料</strong>(일본) · <strong>服务费</strong>(중화권): 봉사료<br/>이미 포함되어 있다면 잔돈 반올림이나 €1~2 정도면 충분합니다. 같은 서비스에 두 번 내지 않도록 주의하세요.' },
  { q: '카드로 결제하면 팁은 어떻게?',
    a: '국가·매장별로 다릅니다.<br/>• <strong>미국·캐나다</strong>: 영수증의 “Tip” 칸에 금액을 적고 서명하거나, 단말기 화면에서 비율을 고릅니다.<br/>• <strong>독일 등 유럽</strong>: 단말기에 금액을 넣기 전에 팁을 포함한 총액을 말합니다(예: €27.50이면 “30유로로 해 주세요”).<br/>• <strong>일본</strong>: 팁 자체가 없습니다.<br/>• <strong>동남아·발리</strong>: 카드도 되지만 현금을 담당자에게 직접 주는 편이 확실합니다.<br/><strong>벨보이·룸메이드·기사·캐디</strong>는 대부분 현금으로만 받을 수 있으니, 출국 전 $1·$5, €1·€2 같은 소액권·동전을 넉넉히 준비하세요.' },
  { q: '단체 식사에 자동 팁이 붙는 이유?',
    a: '미국·캐나다 식당은 <strong>6명 이상 단체</strong>에 18% 안팎의 자동 팁(Auto Gratuity)을 붙이는 곳이 많습니다. 법이 아니라 업장 정책이라 메뉴판·영수증 하단에 “Gratuity 18% included”처럼 표시됩니다. 단체는 주문·결제가 복잡하고 일행이 각자 팁을 계산하다 누락되는 일이 잦기 때문입니다.<br/>이미 붙었다면 <strong>팁을 또 더하지 마세요</strong> — 이중 팁이 됩니다. 서비스가 특히 좋았다면 2~5% 정도만 추가하면 충분합니다. 이 계산기는 식당 인원을 6명 이상 입력하면 영수증을 확인하라는 안내를 띄우고, 계산은 선택한 만족도 비율 그대로 합니다.' },
  { q: '호텔 벨보이·룸메이드 팁 얼마?',
    a: '<strong>현금 정액</strong>이 원칙입니다(미국 기준).<br/>• <strong>벨보이</strong>: 짐 1개당 $1~2(고급 호텔은 $2~3)<br/>• <strong>도어맨</strong>: 택시를 잡아 주면 $1~2<br/>• <strong>룸메이드</strong>: 매일 아침 $2~5를 베개 위나 메모와 함께 — 담당자가 날마다 바뀔 수 있어 체크아웃 때 한 번에 주는 것보다 매일 두는 편이 낫습니다.<br/>• <strong>컨시어지</strong>: 식당 예약·티켓 등 특별한 도움을 받았을 때 $5~20<br/>• <strong>룸서비스</strong>: 영수증에 서비스 요금이 이미 포함된 경우가 많으니 확인 후 추가<br/>유럽은 대략 €1~2 수준, 동남아는 호텔 등급에 따라 다릅니다.' },
  { q: '우버·택시는 팁 필수인가?',
    a: '• <strong>미국·캐나다</strong>: 15~20%가 관례입니다. 우버·리프트 앱에서는 팁이 선택 사항이지만 대부분 기대하며, 하차 후 앱에서 입력할 수 있습니다.<br/>• <strong>유럽</strong>: 잔돈 반올림(€10.50 → €11) 또는 5~10%<br/>• <strong>일본</strong>: 주지 않습니다.<br/>• <strong>싱가포르·홍콩</strong>: 주지 않거나 잔돈 정도<br/>• <strong>태국·베트남</strong>: 미터 요금이면 잔돈 반올림, 미리 흥정한 요금이면 별도 팁 없음<br/>무거운 짐을 실어 주는 등 특별한 도움을 받았다면 $1~5 정도 얹습니다.' },
  { q: '동남아 마사지 팁은 얼마?',
    a: '로컬 마사지숍은 <strong>정액</strong>으로 주는 것이 일반적입니다.<br/>• <strong>태국</strong>: 1시간 기준 50~100바트, 아주 만족스러우면 200바트 정도<br/>• <strong>발리</strong>: Rp 10,000~50,000<br/>• <strong>필리핀</strong>: 50~100페소<br/>• <strong>베트남</strong>: VND 20,000~50,000<br/>고급 호텔 스파는 요금에 봉사료가 포함되어 있거나 비율(10~15%)로 주는 경우가 많습니다. 팁은 카운터가 아니라 <strong>담당 마사지사에게 직접</strong> 건네고, 여러 명이 받았다면 담당자마다 따로 줍니다.' },
  { q: '골프 캐디 팁 (동남아)?',
    a: '동남아 골프장은 대부분 <strong>1인 1캐디</strong>라 캐디 팁은 사람마다 따로 준비합니다.<br/>• <strong>필리핀(클락·세부)</strong>: 캐디 200~500페소<br/>• <strong>태국</strong>: 캐디 500~800바트(아주 만족 시 1,500바트 안팎)<br/>• <strong>베트남(다낭·하노이)</strong>: 캐디 VND 200,000~500,000<br/>• <strong>인도네시아</strong>: 캐디 Rp 100,000~200,000<br/>현지 통화 현금이 필수입니다. 골프장마다 캐디피와 별도로 권장 팁을 게시해 두는 곳이 있으니 프런트에서 먼저 확인하세요.' },
  { q: '팁을 안 주면 어떻게 되나요?',
    a: '국가별로 결과가 매우 다릅니다.<br/>• <strong>미국</strong>: 서비스에 대한 불만 표시로 받아들여집니다. 직원이 이유를 묻는 일도 드물지 않습니다.<br/>• <strong>유럽</strong>: 봉사료가 가격에 포함된 나라가 많아 안 줘도 큰 문제는 없습니다.<br/>• <strong>일본·중국</strong>: 안 주는 것이 정상입니다.<br/>• <strong>동남아</strong>: 기대는 하지만 강제는 아닙니다.<br/>미국은 연방 공정근로기준법(FLSA)상 고용주가 팁을 받는 직원에게 시간당 최소 $2.13만 현금으로 지급하고 나머지를 팁으로 채우는 “팁 크레딧”이 허용되기 때문에 팁이 급여의 큰 몫을 차지합니다(팁을 합쳐도 연방 최저임금 $7.25에 못 미치면 고용주가 차액을 보전해야 합니다). 그래서 미국·캐나다 여행은 <strong>예산에 팁을 미리 포함</strong>해 두는 것이 마음 편합니다.' },
]

export default function TravelTipPage() {
  return (
    <ToolPage width={880} slug="/tools/life/travel-tip">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />해외여행 팁 계산기
      </h1>
      <p className="tp-lead">
        19개국 식당·택시·호텔·골프·마사지 <strong style={{ color: 'var(--text)' }}>적정 팁</strong>. 만족도 보정과 인원 분할.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="국가·서비스별 팁 비율·정액은 현지 관례를 모은 참고치(법정 기준 아님) · 비율 팁 = 금액 × 만족도별 비율(보통·좋음·매우 좋음) · 정액 팁은 ‘/인’ 단위만 인원수 곱 · 원화 환산 환율은 입력값(실시간 아님) · 미국 팁 크레딧 = FLSA §3(m) · 프랑스 ‘service compris’ = 1987년 3월 27일 가격 표시 부령 · 영국 팁 배분 = Employment (Allocation of Tips) Act 2023"
        sources={[
          { label: 'U.S. Department of Labor — Fact Sheet #15: Tipped Employees Under the FLSA', href: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa' },
          { label: 'JNTO(일본정부관광국) 공식 여행 안내 — 일본 팁·봉사료 관행', href: 'https://www.japan.travel/en/' },
          { label: 'Légifrance — Arrêté du 27 mars 1987 relatif à l’affichage des prix dans les établissements servant des repas (service compris)', href: 'https://www.legifrance.gouv.fr' },
          { label: 'legislation.gov.uk — Employment (Allocation of Tips) Act 2023', href: 'https://www.legislation.gov.uk/ukpga/2023/13' },
        ]}
      />

      <TravelTipClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>국가 선택</strong> — 19개국 카드 (검색 가능)</li>
          <li><strong>서비스 선택</strong> — 식당·택시·호텔·골프·마사지 등 9종</li>
          <li><strong>금액·인원·만족도</strong> 입력 → 권장 팁 + 총액 + 1인당 + 원화 환산</li>
          <li><strong>국가별 매너 탭</strong>에서 19개국 팁 문화 한눈에 확인</li>
          <li><strong>시나리오 탭</strong>에서 신혼여행·골프투어·크루즈 시뮬</li>
        </ol>
      </div>
      <Callout tone="note" title="봉사료·단체 자동 팁 안내">
        봉사료(Service Charge)가 자동으로 붙는 경우가 많은 국가는 별도 안내 카드가 표시됩니다. 미국처럼 단체(6명 이상)에 자동 팁(보통 18%)을 붙이는 업장이 많은 국가는,
        식당 인원을 6명 이상으로 입력하면 영수증을 확인하라는 안내 카드가 뜹니다. 계산 금액은 선택한 만족도 기준 그대로예요.
      </Callout>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산 방식 — 비율 팁과 정액 팁</h2>
      <p className="g-p">
        서비스마다 팁을 주는 방식이 둘로 나뉩니다. 식당·택시·배달·미용처럼 <strong>요금에 비례</strong>하는 서비스는
        <strong> 팁 = 금액 × 비율</strong>로 계산하고, 만족도 ‘보통·좋음·매우 좋음’이 각각 그 나라 권장 범위의 하단·중간·상단 비율에 대응합니다.
        벨보이·룸메이드·가이드·캐디처럼 <strong>건당 정액</strong>으로 주는 서비스는 금액 입력과 관계없이 정해진 액수를 씁니다.
        총액은 금액 + 팁, 1인당 금액은 총액 ÷ 인원이고, 원화는 입력한 환율(비워 두면 참고 환율)을 곱해 환산합니다.
      </p>
      <div className="tableScroll" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th scope="col" style={th}>예시</th>
              <th scope="col" style={th}>적용</th>
              <th scope="col" style={th}>팁</th>
              <th scope="col" style={th}>총액 / 1인당</th>
              <th scope="col" style={th}>팁 원화(약)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>미국 식당 $120(세전), 4명, 좋음</th>
              <td style={td}>{EX_PCT.pct}%</td>
              <td style={{ ...td, fontWeight: 700, color: 'var(--accent-ink)' }}>{usd(EX_PCT.tipAmount)}</td>
              <td style={td}>{usd(EX_PCT.total)} / {usd(EX_PCT.perPerson)}</td>
              <td style={td}>{krw(EX_PCT.tipKrw)}</td>
            </tr>
            <tr>
              <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>미국 투어 가이드, 3명, 좋음</th>
              <td style={td}>${EX_TOUR.flatAmount}/일/인 × 3</td>
              <td style={{ ...td, fontWeight: 700, color: 'var(--accent-ink)' }}>{usd(EX_TOUR.tipAmount)}</td>
              <td style={td}>{usd(EX_TOUR.total)} / {usd(EX_TOUR.perPerson)}</td>
              <td style={td}>{krw(EX_TOUR.tipKrw)}</td>
            </tr>
            <tr>
              <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>필리핀 골프 캐디 1명, 좋음</th>
              <td style={td}>₱{EX_GOLF.flatAmount}/라운드</td>
              <td style={{ ...td, fontWeight: 700, color: 'var(--accent-ink)' }}>₱{fmt(EX_GOLF.tipAmount)}</td>
              <td style={td}>—</td>
              <td style={td}>{krw(EX_GOLF.tipKrw)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        원화는 계산기의 참고 환율(1달러 {fmt(US.defaultRate)}원, 1페소 {fmt(PH.defaultRate)}원)로 환산한 값입니다. 실제 결제 시점의 환율·카드 수수료에 따라 달라집니다.
      </p>
      <p className="g-p" style={{ marginTop: 16 }}>
        결과를 볼 때 두 가지를 확인하세요. 첫째, 미국 식당 팁의 기준은 보통 <strong>판매세를 더하기 전 금액</strong>입니다.
        영수증 맨 아래 합계(세후)를 넣으면 세금만큼 팁도 커지므로, Subtotal 줄의 금액을 입력하는 것이 정확합니다.
        둘째, 호텔(짐·박)·공항(짐)·골프(라운드)·마사지(1회)처럼 <strong>담당자 1명 기준 정액</strong>인 서비스는 인원을 늘려도 팁이 그대로입니다.
        일행 네 명이 각자 캐디나 마사지사를 두었다면 결과 팁에 담당자 수를 곱해야 합니다. 인원수가 자동으로 곱해지는 정액은 투어·가이드처럼 ‘/인’ 단위일 때뿐입니다.
      </p>

      {/* 3. 국가별 팁 문화 */}
      <h2 className="g-h2">국가별 팁 문화 (필수·선택·안 줌)</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '필수', d: '미국·캐나다 — 안 주면 서비스 불만 표시로 받아들여짐. 식당 15~20% 표준.', c: 'var(--pink-600)' },
            { t: '선택', d: '유럽·동남아·두바이·호주 — 주면 좋은 매너지만 강제는 아님. 대략 5~15%.', c: 'var(--amber-600)' },
            { t: '거의 없음', d: '대만 — 일부 고급 식당만 10% 봉사료를 자동으로 붙임.', c: 'var(--teal-600)' },
            { t: '안 줌', d: '일본·중국 — 팁 관례가 없고, 건네면 거절하거나 당황할 수 있음.', c: 'var(--gray-600)' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 19개국 기준표 (계산기 데이터) */}
      <h2 className="g-h2">19개국 식당·택시·호텔 팁 기준표</h2>
      <p className="g-p">
        계산기가 실제로 쓰는 국가별 값입니다. 비율은 ‘보통 · 좋음 · 매우 좋음’ 순서이고, 호텔은 짐·객실당 정액입니다.
        봉사료 ‘흔함’ 국가는 영수증에 Service Charge 줄이 따로 붙거나(영국·싱가포르·홍콩·두바이 등) 메뉴·객실 요금에 이미 포함되어(프랑스 service compris, 일본 고급 호텔·료칸) 있는 경우가 많습니다.
        어느 쪽이든 봉사료가 이미 반영됐다면 표의 비율은 추가로 줄 필요가 없고 잔돈 정도면 충분하니, 영수증에 별도 줄이 없어도 봉사료가 빠졌다고 단정하지 마세요.
      </p>
      <div className="tableScroll" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th scope="col" style={th}>국가</th>
              <th scope="col" style={th}>분류</th>
              <th scope="col" style={th}>봉사료 자동</th>
              <th scope="col" style={th}>식당</th>
              <th scope="col" style={th}>택시</th>
              <th scope="col" style={th}>호텔(짐·객실)</th>
            </tr>
          </thead>
          <tbody>
            {COUNTRY_ROWS.map((r) => (
              <tr key={r.id}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{r.name}</th>
                <td style={{ ...td, color: r.catColor, fontWeight: 600 }}>{r.cat}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.sc ? '흔함' : '—'}</td>
                <td style={td}>{r.restaurant}</td>
                <td style={td}>{r.taxi}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.hotel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. 서비스별 권장 */}
      <h2 className="g-h2">서비스별 권장 팁</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>서비스</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>미국·캐나다</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>유럽·동남아</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['식당',          '15-20% (세전)', '5-10%'],
                ['택시·우버',      '15-20%',        '잔돈 반올림'],
                ['호텔 벨보이',    '$1~2/짐',       '€1~2/짐'],
                ['호텔 룸메이드',  '$2~5/박',       '선택'],
                ['투어·가이드',    '$10/일/인',     '€5~10/일/인'],
                ['마사지',         '15-20%',        '태국 50~100바트'],
                ['골프 캐디',       '—',             '필리핀 200~500페소'],
                ['미용·이발',       '15-20%',        '5-10%'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: 'var(--font-sans)',
                      color: j === 0 ? 'var(--text)' : 'var(--accent-ink)',
                      fontWeight: j === 0 ? 700 : 600,
                      fontSize: 13,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. 봉사료 자동 포함 */}
      <h2 className="g-h2">봉사료(Service Charge) 자동 포함 안내</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          많은 국가의 식당·호텔이 <strong>봉사료(Service Charge·Gratuity)를 자동 청구</strong>합니다.
          이 경우 추가 팁은 선택입니다.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>영국</strong>: 식당 12.5% 봉사료(discretionary service charge) 흔함</li>
          <li><strong style={{ color: 'var(--text)' }}>프랑스</strong>: &quot;Service compris&quot; — 메뉴 가격에 봉사료 포함</li>
          <li><strong style={{ color: 'var(--text)' }}>이탈리아</strong>: Coperto(자릿값) €1~3 별도</li>
          <li><strong style={{ color: 'var(--text)' }}>홍콩 / 싱가포르</strong>: 식당 10% 자동</li>
          <li><strong style={{ color: 'var(--text)' }}>두바이</strong>: 10% Service Charge + 5% VAT</li>
          <li><strong style={{ color: 'var(--text)' }}>미국</strong>: 단체 6명 이상 자동 팁 18% 안팎(업장 정책)</li>
          <li><strong style={{ color: 'var(--text)' }}>크루즈</strong>: 1인 1일 $15~20 안팎 자동 청구(선사·객실 등급별 상이)</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 영수증의 <strong>&quot;Service Charge&quot;·&quot;Gratuity&quot;·&quot;Auto Tip&quot;</strong> 항목 확인 후 추가 여부 결정.
        </p>
      </div>
      <p className="g-p">
        나라마다 봉사료의 법적 성격도 다릅니다. <strong>프랑스</strong>는 1987년 가격 표시 부령에 따라 식당의 게시 가격이 세금과 봉사료를 포함한
        ‘service compris’ 가격이어야 해서, 계산서 외에 따로 얹는 돈은 순수한 감사 표시(pourboire)입니다. 이 계산기의 프랑스 식당 비율(5~10%)은 상단 기준이고,
        현지에서는 잔돈을 두고 오거나 몇 유로를 보태는 정도가 흔합니다. <strong>영국</strong>은 2024년 10월 1일 시행된 Employment (Allocation of Tips) Act 2023으로
        업주가 손님이 낸 팁·봉사료를 떼지 않고 전액(세금 제외) 직원에게 공정하게 배분하도록 법이 바뀌었습니다. 영국 식당의 12.5% 봉사료는 ‘선택(discretionary)’으로 표시되는 경우가 많아,
        서비스가 불만족스러웠다면 빼 달라고 요청할 수 있습니다.
      </p>

      {/* 7. 한국인 자주 가는 여행지 */}
      <h2 className="g-h2">한국인 자주 가는 여행지 팁 가이드</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '미국 신혼·출장', d: '식당 15-20% 필수. 우버 15-20%. 호텔 룸 $2~5/박.', c: 'var(--cyan-600)' },
            { t: '일본 가족여행', d: '팁 없음. 료칸 心付け(¥1~3K)는 선택, 줄 때는 봉투에.', c: 'var(--amber-600)' },
            { t: '태국 휴양', d: '식당 5-10%. 마사지 50~100바트가 표준.', c: 'var(--teal-600)' },
            { t: '필리핀 골프', d: '캐디 200~500페소(1인 1캐디). 식당 10%. 마사지 100페소.', c: 'var(--orange-600)' },
            { t: '발리 풀빌라', d: '식당 5-10%. 마사지 Rp 30K. 기사 Rp 50K/일.', c: 'var(--pink-600)' },
            { t: '유럽 자유여행', d: '식당 5-10% (Service compris 확인). 호텔 €1~2.', c: 'var(--amethyst)' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
        <Link href="/tools/unit/size" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🛍️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외 직구 사이즈</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            US·EU·UK → 한국 사이즈
          </p>
        </Link>
        <Link href="/tools/life/dutch" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍻</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>더치페이 N빵</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 일행 더치페이 정산
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
