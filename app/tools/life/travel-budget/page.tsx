import Link from 'next/link'
import TravelBudgetClient from './TravelBudgetClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  CITIES, FLIGHT_PRICES, REGION_LABELS, SEASON_HOTEL_MUL, STYLES, SEASONS, AIRLINES,
  autoFill, calcBudget, getCity, DEFAULT_SELECTION, type Style,
} from './travelBudgetUtils'

export const metadata = buildMetadata({
  path: '/tools/life/travel-budget',
  title: '해외여행 예산 계산기 — 18개 도시 × 3 스타일 + 9 항목 자동',
  description: '18개 도시(일본·유럽·동남아·미국) × 3스타일(배낭·중간·럭셔리) 평균 + 9 항목 자동 추천과 도시 평균 비교를 도넛 차트로.',
  keywords: ['해외여행 예산', '일본 여행 비용', '유럽 자유여행', '동남아 1주일', '여행 견적', '항공권 평균', '숙박비', '여행 스타일', '배낭여행', '럭셔리 여행'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }

/* ── 표·예시는 계산기와 같은 데이터(travelBudgetUtils)에서 빌드 시 생성 — 손으로 옮겨 적지 않는다 ── */
const STYLE_IDS: Style[] = ['backpack', 'middle', 'luxury']
const dayCost = (c: (typeof CITIES)[number], s: Style) => c.styles[s].hotel + c.styles[s].food + c.styles[s].transport
const STYLE_RANGE = Object.fromEntries(STYLE_IDS.map(s => {
  const v = CITIES.map(c => dayCost(c, s))
  return [s, { min: Math.min(...v), max: Math.max(...v) }]
})) as Record<Style, { min: number; max: number }>
const FLIGHT_REGIONS = Object.keys(FLIGHT_PRICES)
const HIGH_HOTEL_PCT = Math.round((SEASON_HOTEL_MUL.high - 1) * 100)

/* 계산 예시 — 계산기 첫 화면 기본 선택(도쿄·오사카 · 중간 · 비수기 · LCC · 2명 · 5일(4박)) · 예비비 10%.
   Client 초기 9개 항목도 같은 DEFAULT_SELECTION의 자동 채우기 값이라 첫 화면 결과와 일치 */
const EX = DEFAULT_SELECTION
const EX_FILL = autoFill(EX)
const EX_NIGHTS = Math.max(0, EX.days - 1)
const EX_LABEL = [
  getCity(EX.cityId).name,
  `${STYLES.find(x => x.id === EX.style)?.label ?? ''} 스타일`,
  (SEASONS.find(x => x.id === EX.season)?.label ?? '').split(' ')[0],
  AIRLINES.find(x => x.id === EX.airline)?.label ?? '',
].join(', ')
const EX_RES = calcBudget({ ...EX, ...EX_FILL, reservePct: 10 })
const EX_ITEM = Object.fromEntries(EX_RES.items.map(i => [i.id, i.total])) as Record<string, number>
const man = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString('ko-KR')}만원`

const FAQ_LD = [
  {
    q: '일본 5박 6일 여행 비용 평균은?',
    a: '도쿄·오사카 6일(5박), 1인·비수기·LCC 기준으로 이 계산기의 자동 채우기 값입니다(쇼핑·입장권·통신·보험 포함, 예비비 제외).<br />• <strong>배낭</strong>: 항공 25만 + 숙박·식비·교통 142만 + 쇼핑 등 43만 = 약 <strong>210만원</strong><br />• <strong>중간</strong>: 항공 25만 + 216만 + 85만 = 약 <strong>326만원</strong><br />• <strong>럭셔리</strong>: 항공 25만 + 425만 + 209만 = 약 <strong>659만원</strong><br />풀서비스 항공이면 15만원가량 늘고, 성수기엔 항공권과 숙박비가 올라 중간 스타일이 약 370만원이 됩니다. 후쿠오카·삿포로는 약 10% 저렴합니다. 쇼핑 비중이 커서 본인 계획에 맞게 항목을 고쳐 계산하세요.',
  },
  {
    q: '동남아 1주일 예산은 얼마면 충분?',
    a: '8일(7박), 1인·중간 스타일·비수기·LCC 기준 자동 채우기 값입니다(쇼핑·입장권·통신·보험 포함, 예비비 제외).<br />• <strong>방콕·푸켓</strong>: 약 <strong>313만원</strong><br />• <strong>다낭·하노이</strong>: 약 <strong>297만원</strong><br />• <strong>세부·보라카이</strong>: 약 <strong>351만원</strong><br />• <strong>발리</strong>: 약 <strong>320만원</strong><br />배낭 스타일은 중간의 60% 안팎, 럭셔리는 2배 수준입니다. 성수기에 풀서비스 항공을 타면 같은 일정이 30% 안팎 비싸집니다.',
  },
  {
    q: '유럽 자유여행 보통 얼마?',
    a: '1인·중간 스타일·비수기·풀서비스 항공(왕복 120만원) 기준 자동 채우기 값입니다(쇼핑·입장권·통신·보험 포함, 예비비 제외).<br />• <strong>파리 7일(6박)</strong>: 약 <strong>751만원</strong><br />• <strong>이탈리아 10일(9박)</strong>: 약 <strong>929만원</strong><br />• <strong>스페인 7일(6박)</strong>: 약 <strong>625만원</strong><br />• <strong>영국 7일(6박)</strong>: 약 <strong>891만원</strong><br />유럽은 숙박·교통비가 커서 현지 체류비 비중이 높습니다. LCC·경유편을 쓰면 항공권에서 30만원가량 줄고, 성수기엔 20% 안팎 더 듭니다. 다국가 일정은 유레일·LCC를 활용해 보세요.',
  },
  {
    q: '항공권은 언제 사야 가장 싼가?',
    a: '정해진 최저가 시점은 없지만 일반적인 경향은 이렇습니다.<br />• <strong>일본·동남아</strong>: 출발 2~3개월 전<br />• <strong>미국·유럽</strong>: 출발 3~5개월 전<br />• <strong>오세아니아</strong>: 출발 4~6개월 전<br />• <strong>비수기</strong>: 4·5·9·10·11월 (한국 명절·연휴 제외)<br />• <strong>요일</strong>: 화·수요일 출발이 비교적 저렴한 경향 (특정 요일·시간이 항상 최저는 아님)<br />여름 휴가철·설·추석 연휴는 수요가 몰려 가격이 빠르게 오르므로 일정이 정해지면 일찍 확인하는 편이 안전합니다. 가격 비교 사이트의 가격 알림 기능을 걸어 두면 변동을 추적하기 쉽습니다.',
  },
  {
    q: '숙박·식비를 줄이는 방법?',
    a: '<strong>숙박</strong>: 이 계산기의 숙박비는 1인 기준(2인 1실 가정)이라 혼자 방을 쓰면 1인 숙박비가 거의 두 배가 됩니다. 호스텔 도미토리, 1주 이상 장기 투숙 할인, 역에서 조금 떨어진 숙소가 대표적인 절약 방법인데, 외곽 숙소는 늘어나는 교통비·이동 시간까지 합쳐 비교해야 합니다.<br /><strong>식비</strong>: 로컬 식당·시장·푸드코트, 마트·편의점을 섞으면 하루 식비가 크게 줄고, 같은 식당도 점심 세트가 저녁보다 저렴한 경우가 많습니다. 줄인 금액은 계산기의 식비(1일/인) 칸에 반영해 다시 계산해 보세요.',
  },
  {
    q: '여행자보험 꼭 들어야 하나?',
    a: '<strong>가입을 권장합니다.</strong> 외교부 해외안전여행도 출국 전 여행자보험 가입을 안내하고 있습니다. 해외에서는 국민건강보험이 적용되지 않아 미국 등 의료비가 비싼 나라에서는 응급실 한 번에 수백만 원이 나올 수 있고, 항공 지연·휴대품 도난·배상책임도 상품에 따라 보장됩니다. 보험료는 여행 기간·나이·보장 한도에 따라 달라지니 손해보험협회·생명보험협회가 운영하는 <strong>보험다모아</strong>에서 보험사별로 비교해 보세요. 신용카드 부가 여행자보험은 대개 항공권·여행상품을 그 카드로 결제해야 적용되고 보장 한도가 작으므로 약관을 먼저 확인해야 합니다. 이 계산기의 자동값은 1인 3만원입니다.',
  },
  {
    q: '통신·로밍 얼마 잡아야?',
    a: '방식별로 비용 구조가 다릅니다.<br />• <strong>eSIM·현지 유심</strong>: 데이터량·기간 단위 상품이라 보통 가장 저렴하고, 1인 여행에 유리합니다(eSIM은 기기 지원 여부 확인).<br />• <strong>포켓 와이파이(Wi-Fi 도시락)</strong>: 하루 단위 대여료라 일행이 한 대를 나눠 쓰면 1인 부담이 줄어듭니다. 다만 일행과 떨어지면 연결이 끊깁니다.<br />• <strong>통신사 로밍</strong>: 번호 그대로 전화·문자를 받을 수 있어 편하지만 대개 가장 비쌉니다.<br />이 계산기의 자동값은 1인 3만원이며, 본인 상품 가격으로 바꿔 넣으면 됩니다.',
  },
  {
    q: '환전 vs 카드 vs 트래블카드 어느 게 유리?',
    a: '용도별로 섞어 쓰는 것이 일반적입니다.<br />• <strong>현금 환전</strong>: 은행 기본 환전 수수료는 달러·엔·유로 같은 주요 통화가 약 2% 안팎이고, 인터넷·앱 환전 우대를 받으면 크게 줄어듭니다. 그 밖의 통화는 수수료가 더 높아 은행연합회 소비자포털에서 비교해 보는 것이 좋습니다.<br />• <strong>해외 신용·체크카드</strong>: 비자·마스터 등 국제브랜드 수수료(약 1~1.1%)에 카드사 해외서비스 수수료(대개 0.2~0.3%대)가 붙습니다. 결제 단말기가 원화 결제(DCC)를 권하면 3~8% 추가 수수료가 붙으니 <strong>현지 통화로 결제</strong>하고, 카드사 앱에서 해외원화결제 차단을 켜 두세요.<br />• <strong>트래블카드(외화 충전식 체크카드)</strong>: 주요 통화 환전 수수료를 면제·우대하는 상품이 많지만 통화·한도·ATM 인출 수수료 조건이 상품마다 다릅니다.<br />소액·팁용 현금 약간 + 트래블카드 + 비상용 신용카드 1장 조합이 무난합니다.',
  },
  {
    q: '예비비 10~20% 왜 추가하나요?',
    a: '예상치 못한 지출이 거의 항상 생기기 때문입니다. 항공 지연으로 인한 추가 숙박, 분실·도난 후 재구매, 병원·약값, 출국 전과 현지의 환율 차이, 즉흥 투어·기념품 등이 대표적입니다. 예비비가 없으면 카드 한도 부족이나 귀국 후 결제 부담으로 이어지기 쉽습니다. 이 계산기는 5·10·15·20% 중 선택할 수 있고, 일반 여행 10%, 처음 가는 나라 15%, 장기·모험 여행 20%를 기준으로 삼으면 됩니다.',
  },
  {
    q: '여럿이 가면 1인당 비용이 얼마나 줄어드나?',
    a: '항목마다 다릅니다. <strong>항공권·식비·보험</strong>은 인원수만큼 그대로 늘어 1인당 비용이 거의 같습니다. 반면 <strong>숙박</strong>은 방 단위 요금이라 혼자 쓰던 방을 둘이 나누면 1인 부담이 절반 가까이 줄고, <strong>택시·렌터카·포켓 와이파이</strong>처럼 한 대를 같이 쓰는 비용도 인원수로 나뉩니다. 이 계산기에서 쇼핑·입장권·통신·기타는 &lsquo;일행 전체 총액&rsquo;으로 입력하는 칸이라 인원을 바꿀 때 함께 조정해야 합니다(자동 채우기를 누르면 입장권·통신은 인원에 맞춰 다시 계산됩니다). 대신 일정·식성 조율이 필요하다는 점은 감안하세요.',
  },
]

export default function TravelBudgetPage() {
  return (
    <ToolPage width={880} slug="/tools/life/travel-budget">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />해외여행 예산 계산기
      </h1>
      <p className="tp-lead">
        18개 도시 × 배낭·중간·럭셔리 3스타일 평균 + <strong style={{ color: 'var(--text)' }}>9개 항목 자동 추천</strong>을 도넛 차트로.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="도시별 1박 평균·항공권은 주요 OTA·항공 메타서치 관찰 평균 (대표 도시 재점검) — 시기·환율 따라 ±30% 이상 변동하는 참고치 · 아래 출처는 환율 확인·환전 수수료·여행자보험·입국 요건 근거이며, 가격과 기본 환율은 참고치"
        sources={[
          { label: '한국은행 경제통계시스템(ECOS) — 환율 확인용', href: 'https://ecos.bok.or.kr/' },
          { label: '은행연합회 소비자포털 — 환전 수수료 비교', href: 'https://portal.kfb.or.kr/compare/commission_spread.php' },
          { label: '보험다모아 — 여행자보험 비교(손해·생명보험협회)', href: 'https://e-insmarket.or.kr/' },
          { label: '외교부 해외안전여행', href: 'https://www.0404.go.kr/' },
        ]}
      />

      <TravelBudgetClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>도시·스타일·시즌·항공사 선택</strong> — 18 도시 × 3 스타일</li>
          <li><strong>일수·인원 입력</strong> — 자동 채우기 버튼으로 9 항목 자동 추천</li>
          <li><strong>9 항목 조정</strong> — 본인 예산에 맞게 미세 조정</li>
          <li><strong>예비비 10~20%</strong> 추가 (예상치 못한 지출 대비)</li>
          <li><strong>결과 확인</strong> — 총비용 + 1인당 + 하루 평균 + 도넛 + 평균 비교</li>
        </ol>
      </div>
      <Callout tone="tip">
        <strong>3 스타일 비교 탭</strong>에서 같은 일정을 배낭/중간/럭셔리 동시 견적 가능.
        <strong> 항목 진단 탭</strong>은 숙박·식비·교통·항공 4개 항목이 평균보다 몇 % 높거나 낮은지 색으로 보여 줍니다.
      </Callout>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산 방식 — 박(泊)과 일(日)을 따로 셉니다</h2>
      <p className="g-p">
        이 계산기는 항목마다 곱하는 단위가 다릅니다. 여행 일수가 N일이면 숙박은 <strong>N−1박</strong>, 식비와 교통·투어는 <strong>N일</strong>로 계산합니다(당일치기는 0박).
        항공권·여행자보험은 1인 금액에 인원을 곱하고, 쇼핑·입장권·통신·기타는 <strong>일행 전체 총액</strong>으로 입력한 값을 그대로 더합니다.
        그다음 소계에 예비비 비율을 곱해 더한 값이 총예산이고, 이를 인원으로 나누면 1인당, 일수로 나누면 하루 평균이 됩니다.
      </p>
      <div style={{ ...card, fontSize: 13, lineHeight: 1.9, color: 'var(--text)' }}>
        소계 = 항공권×인원 + 1박 숙박비×(일수−1)×인원 + (식비+교통)×일수×인원 + 보험×인원 + 쇼핑·입장권·통신·기타(총액)<br />
        총예산 = 소계 × (1 + 예비비%) · 1인당 = 총예산 ÷ 인원 · 하루 평균 = 총예산 ÷ 일수
      </div>
      <p className="g-p">
        <strong>계산 예시</strong> — {EX_LABEL}, {EX.people}명이 {EX.days}일({EX_NIGHTS}박) 다녀오는 경우의 자동 채우기 값입니다. 계산기 첫 화면에 기본으로 들어 있는 값과 같아, 아무것도 바꾸지 않으면 같은 결과가 나옵니다.
        항공권 {man(EX_ITEM.flight)}, 숙박 {man(EX_ITEM.hotel)}(1박 {man(EX_FILL.hotel)} × {EX_NIGHTS}박 × {EX.people}명), 식비 {man(EX_ITEM.food)}, 교통·투어 {man(EX_ITEM.transport)},
        쇼핑 {man(EX_ITEM.shopping)}, 입장권 {man(EX_ITEM.ticket)}, 통신 {man(EX_ITEM.comm)}, 보험 {man(EX_ITEM.insurance)}, 기타 {man(EX_ITEM.etc)}으로 소계 {man(EX_RES.subTotal)}입니다.
        예비비 10%({man(EX_RES.reserve)})를 더하면 총 {man(EX_RES.total)}, 1인당 약 {man(EX_RES.perPerson)}, 하루 평균 약 {man(EX_RES.perDay)}이 나옵니다.
      </p>
      <p className="g-p">
        성수기를 고르면 항공권은 아래 표의 성수기 값으로 바뀌고, 1박 숙박비는 비수기 평균에 <strong>+{HIGH_HOTEL_PCT}%</strong>를 적용합니다. 식비·교통은 시즌 영향이 작다고 보고 그대로 둡니다.
        항목 진단 탭은 숙박(1박)·식비(1일)·교통+투어(1일)·항공권 4개 항목의 1인 입력값을 도시·스타일·시즌 평균과 비교해 차이를 %로 보여 주고, 평균 대비 −30% 이하, ±30% 이내, +30~60%, +60% 초과를 서로 다른 색으로 구분합니다. 쇼핑·입장권·통신·보험·기타는 개인차가 커서 진단에서 뺍니다.
        현지 통화 환산은 입력한 환율(비워 두면 기본값)로 총액을 나눈 값이라, 실제 환전·카드 결제 환율과는 차이가 납니다.
      </p>

      {/* 3. 도시별 1박 평균 */}
      <h2 className="g-h2">도시별 하루 현지 체류비 (18개 도시, 1인)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <caption className="srOnly">도시·여행 스타일별 1인 하루 현지 체류비(숙박 1박+식비+교통·투어, 만원)</caption>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ ...th, textAlign: 'left' }}>도시</th>
                <th scope="col" style={th}>배낭</th>
                <th scope="col" style={th}>중간</th>
                <th scope="col" style={th}>럭셔리</th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{c.flag} {c.name}</th>
                  {STYLE_IDS.map((s) => (
                    <td key={s} style={{ ...td, color: 'var(--accent-ink)' }}>{dayCost(c, s)}만원</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }}>
          ※ <strong style={{ color: 'var(--text)' }}>1인 기준 숙박 1박 + 식비 1일 + 교통·투어 1일 합계</strong>(비수기), 항공권 별도. 계산기의 자동 채우기와 같은 값입니다.
          2026년 7월 재점검한 대략적 평균치(2인 1실·중급 식당 가정, 세금·팁 제외)이며 시기·환율·취향에 따라 ±30% 이상 차이.
          묶음 표기 도시(도쿄·오사카, LA·뉴욕·하와이 등)는 도시 간 편차가 큽니다.
        </div>
      </div>

      {/* 4. 시즌별 항공권 */}
      <h2 className="g-h2">시즌별 항공권 평균 (LCC vs 풀서비스)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <caption className="srOnly">지역별 왕복 항공권 1인 평균(만원) — 항공사 유형·시즌별</caption>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ ...th, textAlign: 'left' }}>지역</th>
                <th scope="col" style={th}>LCC 비수기</th>
                <th scope="col" style={th}>LCC 성수기</th>
                <th scope="col" style={th}>풀서비스 비수기</th>
                <th scope="col" style={th}>풀서비스 성수기</th>
              </tr>
            </thead>
            <tbody>
              {FLIGHT_REGIONS.map((r) => {
                const f = FLIGHT_PRICES[r]
                return (
                  <tr key={r} style={{ borderBottom: '1px solid var(--border)' }}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{REGION_LABELS[r] ?? r}</th>
                    <td style={td}>{f.lcc.low}만</td>
                    <td style={td}>{f.lcc.high}만</td>
                    <td style={td}>{f.full.low}만</td>
                    <td style={td}>{f.full.high}만</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }}>
          ※ <strong style={{ color: 'var(--text)' }}>왕복 1인 기준</strong>, 인천 출발. 비수기 4·5·9·10·11월 / 성수기 7·8·12·1월·연휴.
          2026년 7월 재점검한 대략적 관찰 평균이며 유류할증료·환율·예약 시점에 따라 변동 폭이 큽니다.
        </div>
      </div>

      {/* 5. 여행 스타일 */}
      <h2 className="g-h2">여행 스타일 (배낭·중간·럭셔리) 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { id: 'backpack' as Style, t: '배낭여행', d: '호스텔 도미토리·로컬 식당·대중교통·박물관 무료. 자유로움·대화·문화 체험.', c: 'var(--teal-600)' },
            { id: 'middle' as Style, t: '중간 (Mid-range)', d: '3~4성 호텔·일반 식당·기본 투어·시티패스. 가성비 최고.', c: 'var(--amber-600)' },
            { id: 'luxury' as Style, t: '럭셔리', d: '5성 호텔·미슐랭·프라이빗 투어·비즈니스 항공. 휴식·기념일.', c: 'var(--pink-600)' },
          ].map((g) => (
            <div key={g.id} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 6px', lineHeight: 1.7 }}>{g.d}</p>
              <p style={{ fontSize: 12, color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, margin: 0 }}>
                하루 약 {STYLE_RANGE[g.id].min}~{STYLE_RANGE[g.id].max}만원
              </p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          위 1인 하루 범위(항공 제외, 숙박+식비+교통·투어)는 18개 도시 중 가장 싼 곳과 비싼 곳의 값으로, <strong style={{ color: 'var(--text)' }}>도시별 차이가 큽니다</strong> — 동남아는 낮고 일본·유럽·미국·중동은 높습니다(위 도시 표 참고).
          한국 일반 여행객은 <strong style={{ color: 'var(--text)' }}>중간 스타일</strong>이 가장 만족도 높고, 신혼·기념일은 럭셔리, 학생·장기 여행은 배낭이 일반적.
        </p>
      </div>

      {/* 6. 예비비 */}
      <h2 className="g-h2">예비비 — 왜 10~20% 추가해야 하나</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          여행 중 예상치 못한 지출이 항상 발생합니다. <strong>예비비를 따로 잡지 않으면</strong> 카드 한도 부족·환전 추가·귀국 후 결제 지연 등 스트레스로 이어져요.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>일반 여행 (재방문 도시)</strong>: <strong>10%</strong> 권장</li>
          <li><strong style={{ color: 'var(--text)' }}>새 국가·자유여행</strong>: <strong>15%</strong> (예약 변경·교통비 추가)</li>
          <li><strong style={{ color: 'var(--text)' }}>장기 여행·모험·하이시즌</strong>: <strong>20%+</strong> (현지 예약·환율 변동)</li>
          <li><strong style={{ color: 'var(--text)' }}>주요 예상치 못한 지출</strong>: 분실 도난·급한 의료·항공 지연·숙소 변경·현지 투어 추가·기념품·환전 손실</li>
        </ul>
      </div>

      {/* 7. 흔한 실수 */}
      <h2 className="g-h2">예산을 짤 때 자주 빠뜨리는 것</h2>
      <ul className="g-list">
        <li><strong>혼자 쓰는 방</strong> — 도시 표의 숙박비는 2인 1실을 1인으로 나눈 값이라, 1인 여행이면 숙박 칸을 거의 두 배로 올려야 현실에 맞습니다.</li>
        <li><strong>쇼핑을 1인 금액으로 착각</strong> — 쇼핑·입장권·통신·기타 칸은 일행 전체 총액입니다. 4명이 각자 50만원씩 쓸 계획이면 200만원을 넣어야 합니다.</li>
        <li><strong>공항 오가는 비용</strong> — 국내 공항 교통·주차비, 수하물 추가 요금(LCC는 위탁 수하물이 별도인 운임이 많음)은 &lsquo;기타&rsquo;에 따로 넣어야 합니다.</li>
        <li><strong>결제 수수료와 환율</strong> — 카드 해외 결제에는 국제브랜드·카드사 수수료가 붙고, 원화 결제(DCC)를 선택하면 추가 수수료가 더해집니다. 현지 통화로 결제하는 습관만으로 새는 돈을 줄일 수 있습니다.</li>
        <li><strong>입국 서류·세금</strong> — 전자여행허가(출국 전 온라인 결제)나 숙박세·관광세(현지 납부)처럼 따로 내는 비용은 나라마다 달라 계산기에 들어 있지 않습니다. 출발 전 외교부 해외안전여행에서 입국 요건을 확인하고 &lsquo;기타&rsquo;에 반영하세요.</li>
      </ul>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/life/travel-tip" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 팁 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            19국 × 9 서비스 + 만족도
          </p>
        </Link>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
        <Link href="/tools/life/dutch" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍻</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>더치페이 N빵</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 일행 정산
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
