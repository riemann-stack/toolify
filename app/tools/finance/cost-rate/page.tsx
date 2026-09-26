import Link from 'next/link'
import CostRateClient from './CostRateClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/cost-rate',
  title: '음식점 원가율 계산기 — 배달 수수료·포장재·실질 원가율',
  description:
    '재료비·배달앱 차등수수료(2.0~7.8%)·포장재까지 반영한 실질 원가율과 개당 마진, 손익분기 판매량 계산. 음식점·카페 메뉴 가격 결정과 배달 전용가 전략에 바로 쓰는 원가 분석.',
  keywords: ['원가율계산기', '메뉴원가계산', '배달수수료계산', '식당원가율', '배민수수료', '쿠팡이츠수수료', '요기요수수료', '판매가계산', '음식점마진계산'],
})

/* ── 가이드 수치 — CostRateClient '원가율 계산' 탭과 같은 식으로 빌드 시 계산 ──
   수수료(배달앱 + 결제)만 판매가에 비례하고, 재료·포장재·소모품·배달비 부담·광고비는 주문 1건당 고정 금액이다. */
interface Order { price: number; ingredient: number; packaging: number; accessory: number; appRate: number; payRate: number; delivery: number; ad: number }
function costOf(o: Order) {
  const commission = o.price * (o.appRate + o.payRate) / 100
  const total = o.ingredient + o.packaging + o.accessory + commission + o.delivery + o.ad
  return { commission, total, net: o.price - total, basic: (o.ingredient / o.price) * 100, real: (total / o.price) * 100 }
}
/** 도구 기본값 (배달 채널 · 배달의민족 중위 6.8% · 결제 3.0%) */
const DEF: Order = { price: 15_000, ingredient: 5_100, packaging: 700, accessory: 300, appRate: 6.8, payRate: 3.0, delivery: 1_000, ad: 100 }
const BASE = costOf(DEF)
const FEE_RATE = (DEF.appRate + DEF.payRate) / 100
const PER_ORDER = DEF.ingredient + DEF.packaging + DEF.accessory + DEF.delivery + DEF.ad   // 주문당 고정 변동비
const STORE = costOf({ ...DEF, packaging: 0, accessory: 0, appRate: 0, payRate: 0, delivery: 0, ad: 0 })
const PICKUP = costOf({ ...DEF, appRate: 0, payRate: 0, delivery: 0, ad: 0 })
const DELIVERY_ROWS = [
  { label: '자체 주문 페이지 (앱 수수료 0%)', app: 0 },
  { label: '배민·쿠팡이츠 하위 구간 2.0%', app: 2.0 },
  { label: '배민·쿠팡이츠 중위 구간 6.8% (기본값)', app: 6.8 },
  { label: '배민·쿠팡이츠 상위 구간 7.8%', app: 7.8 },
  { label: '요기요 기본 9.7%', app: 9.7 },
].map(r => ({ ...r, ...costOf({ ...DEF, appRate: r.app }) }))
const TOP_ROW = DELIVERY_ROWS[3], LOW_ROW = DELIVERY_ROWS[1]

/* 판매가 역산 탭 기본값: 재료 원가율 35% → 정확(100원 반올림)·심리(1,000원 올림 − 100)·라운드(1,000원 올림) */
const REV_TARGET = 35
const REV_EXACT = DEF.ingredient / (REV_TARGET / 100)
const REV_ROUND1K = Math.ceil(REV_EXACT / 1000) * 1000
const REV_PRICES = [
  { label: '정확', price: Math.round(REV_EXACT / 100) * 100 },
  { label: '심리가격', price: REV_ROUND1K - 100 },
  { label: '라운드', price: REV_ROUND1K },
].map(p => ({ ...p, ing: (DEF.ingredient / p.price) * 100, real: ((PER_ORDER + p.price * FEE_RATE) / p.price) * 100 }))
/** 실질 원가율 50%(역산 슬라이더 최댓값) — 필요 판매가 = 주문당 고정비 ÷ (목표 − 수수료율) */
const REV_REAL50 = PER_ORDER / (0.5 - FEE_RATE)
/** 배달에서도 매장과 같은 1개당 남는 금액을 얻는 판매가 = (목표 남는 금액 + 주문당 고정비) ÷ (1 − 수수료율) */
const MATCH_STORE_PRICE = (STORE.net + PER_ORDER) / (1 - FEE_RATE)

/* 가격 1,000원 인상 시 — 판매량이 얼마나 줄어도 총 남는 금액이 유지되는가 */
const UP = costOf({ ...DEF, price: DEF.price + 1_000 })
const UP_DROP = (1 - BASE.net / UP.net) * 100

/* 월 수익 탭 기본값 (메뉴 3개 · 영업일 26일 · 고정비 550만) — 손익분기는 판매량 가중 평균 마진으로 */
const MENUS = [{ name: '치킨', margin: 7_000, daily: 30 }, { name: '피자', margin: 6_000, daily: 15 }, { name: '음료', margin: 1_500, daily: 40 }]
const FIXED = 2_000_000 + 3_000_000 + 500_000
const DAYS = 26
const DAILY_ORDERS = MENUS.reduce((s, m) => s + m.daily, 0)
const W_AVG = MENUS.reduce((s, m) => s + m.margin * m.daily, 0) / DAILY_ORDERS
const S_AVG = MENUS.reduce((s, m) => s + m.margin, 0) / MENUS.length
const BE_W = Math.ceil(FIXED / W_AVG)
const BE_S = Math.ceil(FIXED / S_AVG)
const GROSS = MENUS.reduce((s, m) => s + m.margin * m.daily, 0) * DAYS

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
const pct1 = (n: number) => `${n.toFixed(1)}%`
const EXAMPLE_PRICE = 15_000

const FAQ_LD = [
              {
                q: '적정 원가율은 몇 %인가요?',
                a: `법으로 정해진 기준은 없고, 외식업계에서는 재료 원가율(재료비 ÷ 판매가) <strong>28~35%</strong>를 흔히 목표로 삼습니다. 카페·디저트처럼 재료비 비중이 낮은 업종은 더 낮게, 일식·파인다이닝처럼 식재료 단가가 높은 업종은 더 높게 잡는 편입니다. 이 계산기의 등급 표시도 이 관행을 따라 재료 원가율 28% 이하 「매우 우수」, 35% 이하 「양호」, 40% 이하 「보통」, 50% 이하 「주의」로 나눕니다. 중요한 건 숫자 자체보다 <strong>임대료·인건비를 내고도 남는지</strong>이므로, 「월 수익 계산」 탭에서 손익분기를 함께 확인하세요.`,
              },
              {
                q: '배달 수수료 때문에 마진이 거의 안 남는데 어떻게 해야 하나요?',
                a: `먼저 얼마를 올려야 하는지 계산해 보세요. 기본값(판매가 ${won(DEF.price)}, 재료비 ${won(DEF.ingredient)})으로 매장에서 팔면 1개당 ${won(STORE.net)}이 남지만 배달(중위 구간 수수료 ${DEF.appRate}% + 결제 ${DEF.payRate}%)로 팔면 ${won(BASE.net)}만 남습니다. 배달에서도 매장과 같은 금액을 남기려면 판매가가 (${won(STORE.net)} + 주문당 비용 ${won(PER_ORDER)}) ÷ (1 − ${pct1(FEE_RATE * 100)}) = <strong>약 ${won(Math.ceil(MATCH_STORE_PRICE / 100) * 100)}</strong>이어야 합니다. 가격 인상만으로 다 메우기 어렵다면 최소주문금액·배달팁 조정, 배달용 메뉴 축소(고마진 메뉴 위주), 포장 주문 유도를 함께 검토하는 것이 현실적입니다.`,
              },
              {
                q: '포장재 비용은 얼마로 잡아야 하나요?',
                a: `평균값보다 <strong>내 메뉴 1건에 실제로 나가는 품목의 단가 합</strong>으로 잡는 것이 정확합니다. 용기·뚜껑·국물용 이중 포장·비닐봉투·실링지·스티커는 「포장재」 칸에, 수저·젓가락·냅킨·물티슈·소스컵은 「부재료·소모품」 칸에 넣습니다(기본값은 각각 ${won(DEF.packaging)}·${won(DEF.accessory)}). 거래처 견적의 박스 단가를 개수로 나눠 개당 단가를 구하고, 국물 메뉴처럼 품목이 많은 메뉴는 따로 계산하세요. 매장 채널을 선택하면 포장재·소모품은 자동으로 0원이 됩니다.`,
              },
              {
                q: '가격을 올리면 손님이 줄어들까봐 걱정됩니다.',
                a: `판매량이 얼마나 줄어도 괜찮은지 먼저 계산할 수 있습니다. <strong>허용 판매량 감소율 = 1 − 기존 1개당 남는 금액 ÷ 인상 후 1개당 남는 금액</strong>. 기본값 배달 메뉴를 ${won(DEF.price)} → ${won(DEF.price + 1_000)}으로 올리면 수수료가 비례해 늘어 남는 금액은 ${won(BASE.net)} → ${won(UP.net)}(+${won(UP.net - BASE.net)})이 되고, 판매량이 <strong>약 ${UP_DROP.toFixed(1)}%</strong>까지 줄어도 총 남는 금액은 그대로입니다. 실제로 손님이 얼마나 줄지는 상권·경쟁 매장에 따라 달라 미리 알 수 없으니, 한 번에 크게 올리기보다 메뉴별로 나눠 올리며 주문 수 변화를 확인하는 편이 안전합니다.`,
              },
              {
                q: '배달과 매장 가격을 다르게 해도 되나요?',
                a: '매장가와 배달가를 다르게 정하는 것 자체를 금지하는 법 규정은 없고, 여러 프랜차이즈가 배달 전용 가격을 운영하고 있습니다. 다만 소비자가 가격 차이를 모르고 주문하면 신뢰가 떨어질 수 있으니 배달앱 메뉴 설명이나 가게 공지에 「배달 가격은 매장과 다를 수 있음」을 밝혀 두는 것이 좋습니다. 배달앱별 입점 약관·프로모션 참여 조건에 가격 관련 조항이 있을 수 있으므로 적용 전에 사장님 페이지의 약관을 확인하세요.',
              },
              {
                q: '원가율은 부가세 포함 가격과 제외 가격 중 어느 쪽으로 계산하나요?',
                a: '정확한 수익 분석은 <strong>공급가액(부가세 제외 금액) 기준</strong>이 원칙입니다. 일반과세자의 메뉴 판매가에는 부가세 10%가 포함되어 있고, 이 부가세는 매출세액으로 신고·납부해야 하는 돈이라 실제 수입이 아닙니다(매입세액 공제 후 차액 납부). 예: 판매가 11,000원이면 공급가액은 11,000 ÷ 1.1 = <strong>10,000원</strong>이고, 재료비 3,500원의 원가율은 판매가 기준 31.8%가 아닌 공급가액 기준 <strong>35%</strong>로 보는 것이 보수적입니다. 배달앱 중개수수료·결제수수료도 <strong>부가세 별도</strong>로 청구되므로 고지된 수수료율에 10%를 더한 금액이 실제 부담입니다. 본 계산기는 입력한 판매가 그대로 계산하므로, 부가세 제외 분석을 원하면 판매가 ÷ 1.1 값을 입력하세요.',
              },
              {
                q: '인건비는 고정비인가요, 변동비인가요?',
                a: '관리회계 원칙상 <strong>판매량에 비례해 늘어나는 비용은 변동비, 판매량과 무관하게 일정한 비용은 고정비</strong>로 분류합니다. 정규직·고정 스케줄 직원의 월급은 고정비, 주문이 늘 때만 추가 투입하는 시간제 인건비나 건당 지급하는 배달대행비는 변동비 성격입니다. 본 계산기는 메뉴 1개당 원가율에는 인건비를 넣지 않고, 「월 수익 계산」 탭에서 인건비를 <strong>월 고정비</strong>로 묶어 손익분기를 계산합니다. 외식업에서는 재료비와 인건비를 합친 <strong>프라임 코스트(prime cost)</strong>를 함께 관리하는 것이 일반적입니다.',
              },
              {
                q: '배달앱 차등수수료는 어떻게 적용되나요?',
                a: '2024년 11월 배달플랫폼-입점업체 상생협의체 합의에 따라 배달의민족·쿠팡이츠는 2025년부터 3년간 가게 매출(거래액) 구간별로 <strong>중개수수료 2.0~7.8%</strong>를 차등 적용합니다. 거래액 <strong>상위 35%는 7.8%</strong>, 중위 35~80%는 6.8%, <strong>하위 20%는 2.0%</strong>이며, 배달비는 구간별 1,900~3,400원입니다(수수료는 부가세 별도). 요기요는 기본 9.7%에서 주문 수에 따라 <strong>최저 4.7%</strong>까지 내려가는 자체 차등 체계를 운영합니다. 우리 가게가 어느 구간인지는 각 앱 사장님 페이지에서 확인한 뒤, 본 계산기의 수수료율 입력란에 직접 반영하면 됩니다. (2026년 6월 확인 기준)',
              },
            ]

export default function CostRatePage() {
  return (
    <ToolPage width={760} slug="/tools/finance/cost-rate">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />음식점 원가율 계산기
      </h1>
      <p className="tp-lead">
        재료비·배달 수수료·포장재까지 반영한 <strong style={{ color: 'var(--text)' }}>실질 원가율과 마진</strong>. 메뉴 가격 결정에 바로.
      </p>

      <UpdatedMeta date="2026년 6월" basis="2025년 시행 배달앱 차등수수료(상생요금제 2.0~7.8%, 3년 한시) 기준" sources={[{"label":"대한민국 정책브리핑(상생협의체)","href":"https://www.korea.kr/briefing/pressReleaseView.do?newsId=156660502"},{"label":"요기요 사장님포털","href":"https://ceo.yogiyo.co.kr"},{"label":"국세청(부가가치세)","href":"https://www.nts.go.kr"},{"label":"여신금융협회(가맹점수수료율)","href":"https://www.crefia.or.kr"}]} />

      <CostRateClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 className="g-h2">
            메뉴 원가율 핵심 공식
          </h2>
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
            <div><span style={{ color: 'var(--muted)' }}>기본 원가율</span> = 재료비 ÷ 판매가 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>실질 원가율</span> = (재료비 + 포장재 + 부재료/소모품 + 배달앱·결제 수수료 + 배달비 부담 + 광고비) ÷ 판매가 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>1개당 마진</span> = 판매가 − 실질 변동비</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>※ 임대료·인건비 같은 고정비는 별도로 손익분기 계산에 반영</div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            두 원가율은 쓰임이 다릅니다. <strong>기본 원가율</strong>은 레시피와 식자재 단가가 적정한지 보는 지표라 업종별 권장 범위와 비교할 때 씁니다. <strong>실질 원가율</strong>은 판매 채널까지 반영한 값이라 같은 메뉴라도 매장·포장·배달에서 크게 달라지고, 가격을 정하거나 배달 입점 여부를 판단할 때 씁니다. 계산기에서 판매 채널을 「매장」으로 두면 포장재·소모품·수수료·배달비·광고비가 모두 0원이 되어 두 값이 같아지고, 「포장」은 포장재·소모품만, 「배달」은 모든 항목을 넣습니다.
          </p>
        </div>

        {/* ── 2. 기본값 계산 예시 ── */}
        <div>
          <h2 className="g-h2">기본값으로 따라 해 보는 계산 예시</h2>
          <p className="g-p">
            계산기를 처음 열면 들어 있는 값 — 판매가 {won(DEF.price)}, 재료비 {won(DEF.ingredient)}, 배달의민족 중위 구간 수수료 {DEF.appRate}%와 결제 수수료 {DEF.payRate}% — 을 그대로 풀어 보면 아래와 같습니다. 재료비만 보면 원가율 {pct1(BASE.basic)}로 「양호」 범위지만, 배달에 드는 비용을 모두 더하면 판매가의 {pct1(BASE.real)}가 빠져나가고 1개를 팔 때 남는 돈은 {won(BASE.net)}입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '금액', '판매가 대비'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '재료비', v: DEF.ingredient },
                  { k: '포장재', v: DEF.packaging },
                  { k: '부재료·소모품', v: DEF.accessory },
                  { k: `배달앱 + 결제 수수료 (${DEF.appRate}% + ${DEF.payRate}%)`, v: BASE.commission },
                  { k: '배달비 가게 부담', v: DEF.delivery },
                  { k: '광고비 (주문당 환산)', v: DEF.ad },
                  { k: '비용 합계 → 실질 원가율', v: BASE.total, strong: true },
                  { k: '1개 판매 시 남는 금액', v: BASE.net, strong: true },
                ].map((r, i) => (
                  <tr key={r.k} style={{ borderBottom: '1px solid var(--border)', background: r.strong ? 'var(--accent-soft)' : (i % 2 === 0 ? 'transparent' : 'var(--bg3)') }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: r.strong ? 700 : 500 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: r.strong ? 700 : 500, whiteSpace: 'nowrap' }}>{won(r.v)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.strong ? 'var(--accent-ink)' : 'var(--muted)', fontWeight: r.strong ? 700 : 500, whiteSpace: 'nowrap' }}>{pct1((r.v / DEF.price) * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            여기서 수수료 {won(BASE.commission)}은 판매가에 비례해 움직이고, 나머지 {won(PER_ORDER)}은 가격을 바꿔도 주문 1건마다 그대로 나갑니다. 그래서 가격을 올리면 원가율이 내려가지만 인상액의 {pct1(FEE_RATE * 100)}는 다시 수수료로 빠집니다. 광고비는 월 광고비를 월 주문 수로 나눈 값이어서, 주문이 적은 달에는 같은 광고비라도 1건당 부담이 커진다는 점도 기억해 두세요.
          </p>
        </div>

        {/* ── 3. 채널·수수료 구간별 실질 원가율 ── */}
        <div>
          <h2 className="g-h2">채널·수수료 구간별 실질 원가율 비교</h2>
          <p className="g-p">
            같은 메뉴(판매가 {won(DEF.price)}, 재료비 {won(DEF.ingredient)})를 어디서 파느냐에 따라 남는 돈이 얼마나 달라지는지 계산기 식으로 구한 값입니다. 배달 행은 결제 수수료 {DEF.payRate}%·배달비 부담 {won(DEF.delivery)}·광고비 {won(DEF.ad)}을 같게 두고 앱 중개수수료만 바꿨습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['채널', '실질 원가율', '1개당 남는 금액'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '매장 (재료비만)', real: STORE.real, net: STORE.net },
                  { label: '포장 (포장재·소모품 추가)', real: PICKUP.real, net: PICKUP.net },
                  ...DELIVERY_ROWS.map(r => ({ label: `배달 — ${r.label}`, real: r.real, net: r.net })),
                ].map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{pct1(r.real)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{won(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            차등수수료 구간이 하위(2.0%)에서 상위(7.8%)로 바뀌면 이 메뉴 1개당 {won(LOW_ROW.net - TOP_ROW.net)}이 줄어듭니다. 매출이 늘어 상위 구간에 들어가면 건당 마진이 오히려 줄 수 있으니, 구간이 바뀐 달에는 수수료율 입력값도 함께 바꿔 다시 계산하세요. 실제로는 구간마다 배달비도 다르게 매겨지므로(구간별 1,900~3,400원) 가게 부담 배달비 칸도 사장님 페이지의 금액으로 맞추는 것이 정확합니다. 또 계산기의 「포장」 채널은 매장에서 직접 받은 포장 주문 기준이라 수수료가 없습니다. 배달앱으로 들어온 포장 주문에 앱 수수료가 붙는다면 「배달」 채널을 고르고 배달비 부담을 0원으로 두고 계산하세요.
          </p>
          <Callout tone="note" title="매장 카드 수수료는 빠져 있습니다">
            매장·포장 채널에는 카드 결제 수수료가 들어가지 않습니다. 연매출 30억원 이하 가맹점은 연매출 구간별 우대수수료율이 적용되니 여신금융협회에서 내 가맹점 수수료율을 확인한 뒤, 포장 채널은 판매가 × 수수료율 금액을 「부재료·소모품」 칸에, 매장 채널은 이 칸이 없으므로 「재료비」 칸에 더해 계산하세요(이 경우 기본 원가율도 그만큼 올라갑니다). 「모두 비교」의 매장 행에는 이 금액을 넣을 칸이 없어 매장 마진이 카드 수수료만큼 높게 보이므로, 매장 수치는 「매장」 채널을 따로 골라 확인하는 편이 정확합니다.
          </Callout>
        </div>

        {/* ── 4. 업종별 권장 원가율 ── */}
        <div>
          <h2 className="g-h2">
            업종별 권장 원가율 가이드
          </h2>
          <p className="g-p">
            아래 범위는 법정 기준이 아니라 외식업계에서 흔히 쓰는 재료 원가율 목표치입니다. 판매가 {won(EXAMPLE_PRICE)} 메뉴라면 재료비를 얼마 안에서 맞춰야 하는지 함께 계산했습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['업종', '재료 원가율 목표', `판매가 ${won(EXAMPLE_PRICE)}일 때 재료비`].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '한식·중식',       lo: 28, hi: 35 },
                  { c: '양식·이탈리안',   lo: 30, hi: 35 },
                  { c: '일식·초밥',       lo: 35, hi: 40 },
                  { c: '카페·디저트',     lo: 25, hi: 30 },
                  { c: '분식·간편식',     lo: 30, hi: 33 },
                  { c: '치킨·피자',       lo: 30, hi: 35 },
                  { c: '파인다이닝',      lo: 35, hi: 40 },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.lo}~{r.hi}%</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 600, whiteSpace: 'nowrap' }}>{won(EXAMPLE_PRICE * r.lo / 100)} ~ {won(EXAMPLE_PRICE * r.hi / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            재료비를 넣을 때 흔한 실수는 <strong>손질 전 구매가를 그대로 쓰는 것</strong>입니다. 껍질·뼈·자투리를 버리고 실제로 접시에 올라가는 양이 구매량의 일부라면, 단위당 가격은 구매가 ÷ 사용 가능한 양으로 다시 계산해야 합니다. 예를 들어 1kg에 3,000원인 양파를 손질해 900g만 쓴다면 g당 3원이 아니라 약 3.3원입니다. 「재료별 상세」 입력에서 단위당가 칸에 이 값을 넣으면 레시피 원가가 현실에 가까워집니다.
          </p>
        </div>

        {/* ── 5. 배달앱 수수료 비교 ── */}
        <div>
          <h2 className="g-h2">
            배달앱 수수료 비교
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { app: '배달의민족', color: 'var(--emerald-600)', items: [
                ['중개수수료', '2.0~7.8% 차등'],
                ['매출 상위 35%', '7.8%'],
                ['중위 35~80%', '6.8%'],
                ['하위 20%', '2.0%'],
                ['결제 수수료', '약 3%'],
              ]},
              { app: '쿠팡이츠', color: 'var(--red-600)', items: [
                ['중개수수료', '2.0~7.8% (동일)'],
                ['포장 주문', '2026.4~ 유료화'],
                ['결제 수수료', '약 3%'],
              ]},
              { app: '요기요', color: 'var(--yellow-700)', items: [
                ['중개수수료', '기본 9.7%'],
                ['주문 많을수록', '최저 4.7%'],
                ['포장 주문', '7.7%'],
                ['결제 수수료', '약 3%'],
              ]},
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.color}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.color, fontWeight: 700, marginBottom: 8 }}>{g.app}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {g.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ※ 2025년 도입된 <strong style={{ color: 'var(--text)' }}>차등수수료제(3년 한시)</strong>로 배민·쿠팡이츠 중개수수료가 매출 구간별 2.0~7.8%로 적용됩니다. 위 기본값 예시에서 수수료·배달비·광고비만 합쳐도 판매가의 {pct1(((BASE.commission + DEF.delivery + DEF.ad) / DEF.price) * 100)}, 포장재·소모품까지 더하면 {pct1(((BASE.total - DEF.ingredient) / DEF.price) * 100)}가 재료비 밖에서 빠집니다. 수수료에는 부가세가 별도로 붙고, 정책은 수시로 바뀌니 각 앱 공식 페이지를 확인하세요.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '6px', lineHeight: 1.7 }}>
            ※ 수수료 체계는 2024년 11월 배달플랫폼-입점업체 상생협의체 합의(
            <a href="https://www.korea.kr/briefing/pressReleaseView.do?newsId=156660502" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>정책브리핑 보도자료 ↗</a>
            )와 <a href="https://ceo.yogiyo.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>요기요 사장님포털 ↗</a> 기준 — <strong style={{ color: 'var(--text)' }}>2026년 6월 확인</strong>.
          </p>
        </div>

        {/* ── 6. 배달 추가 비용 — 비례 vs 고정 ── */}
        <div>
          <h2 className="g-h2">
            배달 시 추가 비용 체크리스트
          </h2>
          <p className="g-p">
            배달 비용은 판매가에 비례하는 것과 주문 1건마다 정해진 금액으로 나가는 것으로 나뉩니다. 이 구분이 판매가 역산 결과를 좌우하므로 각 항목을 어느 칸에 넣는지 정리했습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['비용 항목', '성격', '계산기 입력 칸'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['배달앱 중개수수료', '판매가 × %', '배달앱 수수료율 (앱·매출 구간별 약 2~9.7%)'],
                  ['결제 수수료', '판매가 × %', '결제 수수료율 (기본 3.0%)'],
                  ['배달비 가게 부담', '주문당 고정', '배달비 가게 부담 (고객 배달팁을 뺀 금액)'],
                  ['포장재', '주문당 고정', '포장재 비용'],
                  ['수저·냅킨·소스컵', '주문당 고정', '부재료·소모품'],
                  ['광고비', '월 정액·입찰', '월 광고비 ÷ 월 주문 수 = 광고비(주문당 환산)'],
                  ['부가세', '매출의 10/110', '입력 칸 없음 — 판매가 ÷ 1.1을 넣어 공급가액 기준으로 분석'],
                ].map(([k, t, where], i) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>{t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 판매가 역산과 가격 끝자리 ── */}
        <div>
          <h2 className="g-h2">
            판매가 역산과 가격 끝자리 — 100원 vs 1,000원 단위
          </h2>
          <p className="g-p">
            「판매가 역산」 탭은 목표 원가율에서 거꾸로 판매가를 구합니다. <strong>재료 원가율 기준</strong>이면 필요 판매가 = 재료비 ÷ 목표 원가율이라 단순합니다. <strong>실질 원가율 기준</strong>은 수수료가 가격에 비례하므로 필요 판매가 = 주문당 고정 비용 ÷ (목표 원가율 − 수수료율)로 계산합니다. 기본값에서 실질 원가율 50%(슬라이더 최댓값)를 맞추려면 {won(PER_ORDER)} ÷ (50% − {pct1(FEE_RATE * 100)}) = 약 {won(REV_REAL50)}이 필요합니다. 목표 원가율이 수수료율({pct1(FEE_RATE * 100)}) 이하라면 어떤 가격으로도 도달할 수 없다는 경고가 뜨는 이유도 이 식 때문입니다.
          </p>
          <p className="g-p">
            재료 원가율 {REV_TARGET}%를 목표로 하면 정확한 값은 {won(REV_EXACT)}이고, 계산기는 이를 세 가지 가격으로 다듬어 보여 줍니다. 배달 채널 기준 실질 원가율도 함께 표시됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['추천 방식', '판매가', '재료 원가율', '실질 원가율(배달)'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REV_PRICES.map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{won(r.price)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }}>{pct1(r.ing)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }}>{pct1(r.real)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: 16 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 8 }}>심리 가격 (예: 11,900원)</p>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>12,000원과 100원 차이지만 <strong>&ldquo;1만원대&rdquo;</strong>로 읽히기 쉬움</li>
                <li>메뉴판 전체에 쓰면 할인 느낌이 옅어지고 가격이 복잡해 보임</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>라운드 가격 (예: 12,000원)</p>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>깔끔하고 고급스러운 인상</li>
                <li>현금 거스름돈·세트 가격 계산이 쉬움</li>
                <li>파인다이닝·고가 메뉴에 자주 쓰임</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 8. 손익분기 판매량 계산법 ── */}
        <div>
          <h2 className="g-h2">
            손익분기 판매량 계산법
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.9,
          }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: 'var(--muted)' }}>손익분기 판매량</span> = 월 고정비 ÷ 판매량 가중 평균 마진
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.85 }}>
              「월 수익 계산」 탭 기본값:<br />
              • 월 고정비 = 임대료 200만원 + 인건비 300만원 + 공과금 50만원 = <strong style={{ color: 'var(--text)' }}>{won(FIXED)}</strong><br />
              • 메뉴 = {MENUS.map(m => `${m.name} 마진 ${m.margin.toLocaleString('ko-KR')}원 × 일 ${m.daily}개`).join(', ')}<br />
              • 가중 평균 마진 = 하루 마진 합 ÷ 하루 판매량 {DAILY_ORDERS}개 = <strong style={{ color: 'var(--text)' }}>{won(W_AVG)}</strong><br />
              • 손익분기 = {won(FIXED)} ÷ {won(W_AVG)} = <strong style={{ color: 'var(--accent-ink)' }}>월 {BE_W.toLocaleString('ko-KR')}개</strong> → 영업일 {DAYS}일이면 <strong style={{ color: 'var(--accent-ink)' }}>일 {Math.ceil(BE_W / DAYS)}개</strong> (올림)<br />
              • 현재 일 {DAILY_ORDERS}개 판매 → 월 마진 {won(GROSS)} − 고정비 = 영업이익 <strong style={{ color: 'var(--text)' }}>{won(GROSS - FIXED)}</strong>
            </p>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            메뉴 마진을 단순 평균({won(S_AVG)})으로 나누면 손익분기가 월 {BE_S.toLocaleString('ko-KR')}개로 나와 실제보다 {(BE_W - BE_S).toLocaleString('ko-KR')}개 적게 잡힙니다. 마진이 작은 음료가 가장 많이 팔리기 때문입니다. 계산기는 판매량으로 가중한 평균을 쓰므로, 일 판매량을 실제 POS 데이터에 가깝게 넣을수록 결과가 정확해집니다. 고정비의 인건비 칸에 사장 본인 몫을 넣지 않았다면, 이 영업이익은 세금을 내기 전이면서 사장 인건비까지 들어 있는 금액이라는 점도 구분해서 보세요.
          </p>
        </div>

        {/* ── 9. 원가율 낮추는 방법 ── */}
        <div>
          <h2 className="g-h2">
            원가율 낮추는 5가지 방법
          </h2>
          <ul className="g-list">
            <li><strong>식자재 단가 협상</strong> — 품목별 월 사용량을 정리해 두면 거래처 비교·계약 단가 협상의 근거가 됩니다.</li>
            <li><strong>메뉴 재료 표준화</strong> — 여러 메뉴가 같은 재료를 공유하도록 설계하면 재고 품목이 줄고 폐기도 줄어듭니다.</li>
            <li><strong>폐기율 관리</strong> — 선입선출(FIFO)과 요일별 적정 재고를 지키고, 버린 양을 기록해 재료비에 반영하세요.</li>
            <li><strong>1차 가공 재료 검토</strong> — 손질된 식재료는 단가가 높아도 손질 손실과 준비 시간을 줄여 줘 수율로 비교해야 합니다.</li>
            <li><strong>메뉴별 가격 조정</strong> — 실질 원가율이 높은 메뉴부터 아래 FAQ의 허용 판매량 감소율 계산으로 인상 폭을 정해 단계적으로 조정합니다.</li>
          </ul>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 10. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/vat',         icon: '🧾', name: '부가세 계산기',           desc: '사업자 부가세 공급가액·세액 분리' },
              { href: '/tools/life/unit-price',     icon: '🏷️', name: '단가 비교 계산기',         desc: '식자재 가성비 단가 비교' },
              { href: '/tools/finance/car-cost',    icon: '🚗', name: '자동차 유지비 계산기',    desc: '배달 차량 비용 계산' },
              { href: '/tools/life/dutch',          icon: '🍻', name: '더치페이 계산기',          desc: '회식·미팅 정산' },
              { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기',    desc: '직원 인건비 계산' },
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
