import Link from 'next/link'
import UnitPriceClient from './UnitPriceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { BASES, UNIT_FACTOR, UNIT_KIND, recommendBase, fmt, fmt1, type Base, type Unit } from './unitPriceUtils'

export const metadata = buildMetadata({
  path: '/tools/life/unit-price',
  title: '단가 비교 계산기 — 마트·편의점·코스트코 1+1·2+1 가성비 즉시 비교',
  description: '마트·편의점·코스트코 가격을 1ml·1g·1개당 실질 단가로 즉시. 1+1·2+1까지 정확히 + 소비 가능량 반영한 진짜 가성비.',
  keywords: [
    '단가계산기', '가성비계산기', '마트단가비교', '코스트코단가', '100ml당단가', '1+1가성비', '쿠팡단가비교', '용량비교계산기',
    '단가 비교 계산기', '마트 가성비', '1+1 단가', '2+1 단가', '코스트코 단가', '100ml당 가격', '100g당 가격',
    '실질 단가', '대용량 함정', '가성비 비교',
  ],
})

/* ── 가이드 예시는 계산기(UnitPriceClient)와 같은 식으로 빌드 시 계산 ──
   단가 = 가격 ÷ (용량 × 단위 환산 × 개수) × 비교 기준, 실질 단가 = 단가 ÷ (소비 가능량 ÷ 100)
   비교 기준 자동 추천 = 첫 번째 상품(A)의 총량으로 recommendBase — 계산기와 동일 */
type Item = { name: string; price: number; amount: number; unit: Unit; count: number; pct?: number }
const totalOf = (it: Item) => it.amount * UNIT_FACTOR[it.unit] * it.count
const baseOf = (id: Base['id']) => BASES.find(b => b.id === id)!
const autoBase = (it: Item) => baseOf(recommendBase(UNIT_KIND[it.unit], totalOf(it)))
const shownPrice = (it: Item, base: Base) => (it.price / totalOf(it)) * base.factor
const realPrice = (it: Item, base: Base) => (it.price / (totalOf(it) * ((it.pct ?? 100) / 100))) * base.factor

/* 1+1·2+1 — 샴푸 8,900원·500ml 기준. 할인율 환산 = 1 − 낸 개수 ÷ 받는 개수 */
const PROMO_ROWS = [
  { d: '단품', paid: 1, got: 1 },
  { d: '1+1', paid: 1, got: 2 },
  { d: '2+1', paid: 2, got: 3 },
  { d: '3+1', paid: 3, got: 4 },
  { d: '5+1', paid: 5, got: 6 },
].map(r => {
  const it: Item = { name: r.d, price: 8900 * r.paid, amount: 500, unit: 'ml', count: r.got }
  const auto = autoBase(it)
  return {
    ...r,
    price: it.price,
    per100: fmt1(shownPrice(it, baseOf('per100ml'))),
    auto: `${auto.label} ${fmt1(shownPrice(it, auto))}원`,
    off: r.paid === r.got ? '—' : `${fmt1((1 - r.paid / r.got) * 100)}%`,
  }
})

/* 비교 예시 — 가격은 계산 방법을 보여 주기 위한 가상의 값 */
const EXAMPLES: { title: string; a: Item; b: Item; note: string }[] = [
  {
    title: '샴푸 — 1+1 vs 대용량 단품',
    a: { name: '500ml 1+1', price: 8900, amount: 500, unit: 'ml', count: 2 },
    b: { name: '750ml 단품', price: 11000, amount: 750, unit: 'ml', count: 1 },
    note: '1+1은 개수에 2만 넣으면 됩니다. 용량이 큰 단품이 무조건 싸지는 않습니다.',
  },
  {
    title: '음료 — 편의점 낱병 vs 마트 박스',
    a: { name: '편의점 100ml 1병', price: 1200, amount: 100, unit: 'ml', count: 1 },
    b: { name: '마트 100ml 10병 박스', price: 8900, amount: 100, unit: 'ml', count: 10 },
    note: '같은 제품이라도 판매 채널과 묶음 단위에 따라 단가 차이가 큽니다.',
  },
  {
    title: '참치캔 — 무료배송 묶음 vs 배송비가 붙는 주문',
    a: { name: '150g × 6캔 (무료배송)', price: 12900, amount: 150, unit: 'g', count: 6 },
    b: { name: '100g × 4캔 (상품 6,900 + 배송 3,000)', price: 9900, amount: 100, unit: 'g', count: 4 },
    note: '배송비 입력란은 없으니 실제 결제 금액을 가격란에 넣으면 그대로 반영됩니다.',
  },
  {
    title: '대용량 함정 — 다 쓰지 못할 때',
    a: { name: '마트 500ml 1+1 (다 씀)', price: 12000, amount: 500, unit: 'ml', count: 2 },
    b: { name: '창고형 매장 1.5L (절반만 씀)', price: 18000, amount: 1.5, unit: 'L', count: 1, pct: 50 },
    note: '표시 단가가 같아도 사용기한 안에 절반만 쓰면 실질 단가는 2배가 됩니다.',
  },
]
const EXAMPLE_ROWS = EXAMPLES.map(ex => {
  const base = autoBase(ex.a)
  const line = (tag: string, it: Item) => {
    const s = `${tag}: ${it.name} · ${fmt(it.price)}원 (개수 ${it.count}) → ${base.label} ${fmt1(shownPrice(it, base))}원`
    return it.pct && it.pct < 100 ? `${s}, 사용 ${it.pct}% 반영 실질 ${fmt1(realPrice(it, base))}원` : s
  }
  const ra = realPrice(ex.a, base), rb = realPrice(ex.b, base)
  const [win, lose, wTag]: [number, number, string] = ra <= rb ? [ra, rb, 'A'] : [rb, ra, 'B']
  const verdict = win === lose ? '두 상품의 단가가 같습니다' : `${wTag}가 ${fmt1(((lose - win) / lose) * 100)}% 저렴`
  return { ...ex, base: base.label, la: line('A', ex.a), lb: line('B', ex.b), verdict }
})

/* 라면 표시단위 개정 예시 — 120g 한 봉지 830원 */
const RAMEN: Item = { name: '라면 120g', price: 830, amount: 120, unit: 'g', count: 1 }
const RAMEN_PER100G = fmt1(shownPrice(RAMEN, baseOf('per100g')))

/* 「가격표시제 실시요령」 단위가격 표시단위 예시 (대표 품목만 — 전체 114개 품목은 고시 별표 확인) */
const OFFICIAL_UNITS = [
  { item: '우유', unit: '100㎖', how: '비교 기준 100ml당' },
  { item: '식용유', unit: '100㎖', how: '비교 기준 100ml당' },
  { item: '참기름', unit: '10㎖', how: '비교 기준 10ml당 (수동 선택)' },
  { item: '설탕', unit: '100g', how: '비교 기준 100g당' },
  { item: '라면', unit: '100g (2025년 개정 전: 1개)', how: '비교 기준 100g당' },
  { item: '커피·치즈', unit: '10g', how: '100g당 값 ÷ 10' },
  { item: '분말세제', unit: '100g', how: '비교 기준 100g당' },
  { item: '화장지', unit: '10m', how: '총 길이(m)를 용량에, 단위 「개」 → 1개당 값 × 10' },
]

const FAQ_LD = [
              { q: '1+1이 진짜 50% 할인과 같은가요?',
                a: '네, 수학적으로 정확히 같습니다. 1개 가격으로 2개를 받는 것이므로 개당 가격은 정확히 절반. 다만 2개를 모두 사용할 수 있어야 실질적 이득. 유통기한이 짧거나 혼자 사는 경우 [소비 가능량] 옵션으로 실질 단가 확인 권장.' },
              { q: '100ml당과 1L당 중 어떤 걸로 비교해야 하나요?',
                a: '본 도구는 자동 추천합니다 — <strong>첫 번째 상품(A)의 총량(용량×개수)</strong>이 1L 미만이면 100ml당, 1L 이상이면 1L당(무게는 1kg 기준으로 100g당·1kg당). [자동 추천] 토글을 끄고 10ml당·100ml당·1L당 등으로 직접 바꿀 수도 있습니다. 어느 기준이든 상품 간 비율은 똑같으니 보기 편한 단위를 고르면 됩니다.' },
              { q: '배송비는 어떻게 반영하나요?',
                a: '배송비 입력란은 따로 없습니다. 단독 주문해 배송비가 붙는다면 <strong>배송비를 더한 실제 결제 금액을 가격란에 직접</strong> 입력하세요 (예: 상품 6,900원 + 배송 3,000원 → 가격에 9,900 입력). 여러 상품을 함께 주문해 배송비가 공유된다면 상품 가격만 입력하면 됩니다.' },
              { q: '코스트코 대용량이 항상 더 싼가요?',
                a: '아닙니다. 대용량이라는 이유만으로 싸다고 단정할 수 없고, 행사 중인 소용량 제품의 100g·100ml당 단가가 더 낮은 경우도 있습니다. 특히 소비 속도가 느린 상품(소스·조미료)은 대용량을 유통기한 안에 못 쓰면 실질 손해입니다. 본 도구의 [소비 가능량] 옵션을 활용하세요 — 1.5L를 50%만 쓰면 실질 단가는 2배입니다.' },
              { q: '1+1 행사 상품은 어떻게 입력하나요?',
                a: '<strong>개수에 2</strong>, 가격은 표시된 가격 그대로. 2+1은 개수 3, 3+1은 개수 4. 본 도구는 행사 옵션을 따로 두지 않고 개수 입력만으로 단가를 정확히 계산합니다. 예: 샴푸 8,900원 1+1 → 가격 8,900 / 용량 500ml / 개수 2 → 총량이 1L가 되어 자동 추천 기준에서는 <strong>1L당 8,900원</strong>(100ml당으로 바꾸면 890원)으로 표시됩니다.' },
              { q: 'ml 상품과 g 상품을 비교할 수 있나요?',
                a: '직접 비교 어려움. ml = 부피(액체), g = 무게(고체)이며 밀도가 다릅니다. 예: 우유 1L ≈ 1,030g, 꿀 1L ≈ 1,420g. 본 도구는 다른 계열 입력 시 경고 메시지를 표시합니다. 같은 계열(ml↔L 또는 g↔kg)로 통일해 비교하세요.' },
              { q: '마트 가격표에 단위가격이 이미 적혀 있는데 따로 계산할 필요가 있나요?',
                a: '대형마트 등은 「가격표시제 실시요령」에 따라 가격표에 단위가격(예: 100㎖당 ○원)을 함께 적습니다. 다만 <strong>표시단위가 품목마다 달라</strong>(참기름 10㎖, 우유 100㎖, 커피 10g 등) 다른 매장·온라인몰 가격과 견주려면 단위를 맞춰야 하고, 1+1처럼 계산대에서 적용되는 행사나 배송비·쿠폰을 반영한 실제 결제 금액 기준 단가는 가격표에 나오지 않을 수 있습니다. 가격표 단위가격으로 1차 확인하고, 행사·배송비가 끼면 계산기로 다시 비교하세요.' },
              { q: '같은 1L 우유라도 가격이 다른데 어떻게 비교하나요?',
                a: '본 도구에 둘 다 입력 — A: 일반 우유 1L · 2,500원 → 100ml당 250원 / B: 유기농 우유 1L · 4,500원 → 100ml당 450원. B가 80% 비쌈. 가격 차이 + 본인 가치(유기농·브랜드)를 종합 판단. 본 도구는 단가만 보여주며, 가치 판단은 사용자 영역.' },
              { q: '소비 가능량(실질 단가)는 어떻게 활용하나요?',
                a: '각 상품 카드의 [실제 소비 가능량]에서 100/75/50% 버튼을 누르거나 직접입력(예: 25%)하면 됩니다. 가이드: 매일 사용(생수·우유) 100% / 자주(샴푸·세제) 75% / 가끔(소스·조미료) 50% / 시즌·이벤트용 25%. 가구 규모 — 1인 50%·2인 75%·4인 100% 권장. 50%만 쓰면 실질 단가는 표시 단가의 2배가 됩니다.' },
            ]

export default function UnitPricePage() {
  return (
    <ToolPage width={760} slug="/tools/life/unit-price">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />단가 비교 계산기
      </h1>
      <p className="tp-lead">
        마트·편의점·코스트코 가격을 <strong style={{ color: 'var(--text)' }}>1ml·1g·1개당 실질 단가</strong>로 즉시. 1+1·2+1도 정확히.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="계산식·자동 추천 기준은 도구 코드 기준(가이드 예시는 같은 식으로 빌드 시 계산) · 단위가격 표시단위는 「가격표시제 실시요령」(2025.4.7 개정, 온라인몰 2026.4 시행) 기준"
        sources={[
          { label: '국가법령정보센터 — 가격표시제 실시요령(고시)', href: 'https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulId=33397&efYd=0' },
          { label: '물가안정에 관한 법률 제3조(가격 표시)', href: 'https://www.law.go.kr/법령/물가안정에관한법률/제3조' },
          { label: '한국소비자원 참가격', href: 'https://www.price.go.kr' },
        ]}
      />

      <UnitPriceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기본 공식 ── */}
        <section>
          <h2 className="g-h2">단가 계산 기본 공식</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '20px 22px' }}>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '16px 18px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '18px', lineHeight: 1.8, color: 'var(--text)', marginBottom: '14px' }}>
              가격 ÷ (용량 × 개수) × 기준 단위
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, margin: '0 0 8px' }}>
              예: 8,900원 ÷ (500ml × 5개) × 100 = <strong style={{ color: 'var(--accent-ink)' }}>100ml당 356원</strong>
            </p>
            <details style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-s)', border: '1px solid var(--border)' }}>
              <summary style={{ fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                실질 단가 (소비 가능량 반영)
              </summary>
              <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <p style={{ margin: '0 0 6px' }}>다 쓰지 못하면 실제 단가는 올라갑니다.</p>
                <p style={{ margin: '0 0 6px' }}>실질 단가 = 단가 ÷ (소비 가능량 ÷ 100) — 예: 50%만 쓰면 단가의 <strong style={{ color: 'var(--accent-ink)' }}>2배</strong></p>
                <p style={{ margin: 0 }}>각 상품 카드의 [실제 소비 가능량]에서 설정하세요.</p>
                <p style={{ margin: '8px 0 0', fontSize: '12px' }}>※ 배송비·쿠폰 입력란은 따로 없습니다 — 단독 주문해 배송비가 붙거나 쿠폰을 적용한다면 <strong style={{ color: 'var(--text)' }}>실제 결제 금액을 가격란에 직접</strong> 입력하세요.</p>
              </div>
            </details>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기는 입력한 용량을 먼저 ml 또는 g으로 바꾼 뒤(1L = 1,000ml, 1kg = 1,000g) 개수를 곱해 총량을 구하고, 가격을 총량으로 나눠 비교 기준에 맞춰 곱합니다.
            비교 기준은 <strong>첫 번째 상품(A)의 총량</strong>으로 자동 추천되는데, 총량이 1L(1kg) 미만이면 100ml당(100g당), 이상이면 1L당(1kg당)입니다.
            그래서 500ml 1+1처럼 개수를 곱해 1L가 되는 순간 결과가 「1L당」으로 바뀌는데, 기준이 달라져도 상품 사이의 비율과 순위는 그대로입니다.
            순위는 소비 가능량을 반영한 실질 단가로 매기고, 「2위보다 몇 % 저렴」은 (2위 단가 − 1위 단가) ÷ 2위 단가로 계산합니다.
          </p>
        </section>

        {/* ── 2. 1+1·2+1 입력 가이드 ── */}
        <section>
          <h2 className="g-h2">1+1·2+1 행사 — 개수만 입력하면 끝</h2>
          <p className="g-p">
            본 도구는 행사 옵션을 따로 두지 않습니다. <strong>개수에 받는 개수를 그대로 입력</strong>하면 단가가 정확히 계산됩니다 (가격은 실제 결제 금액).
            아래 표는 500ml·8,900원 샴푸를 기준으로 계산기와 같은 식으로 구한 값입니다. 「할인율 환산」은 1 − (돈 내는 개수 ÷ 받는 개수)로,
            2+1은 33.3%, 3+1은 25% 할인과 같습니다. 행사 묶음이 커질수록 할인율은 오히려 낮아진다는 점을 눈여겨보세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>행사</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>가격 입력</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>개수 입력</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>100ml당</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>자동 추천 기준 표시</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>할인율 환산</th>
                </tr>
              </thead>
              <tbody>
                {PROMO_ROWS.map((r, i) => (
                  <tr key={r.d} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{fmt(r.price)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 16 }}>{r.got}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700 }}>{r.per100}원</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted-strong)' }}>{r.auto}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.off}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 3. 비교 예시 (계산기와 같은 식으로 빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">비교 예시 — 편의점·마트·온라인·창고형 매장</h2>
          <p className="g-p">
            아래 가격은 계산 방법을 보여 주기 위한 가상의 값이며, 결과 문구는 같은 값을 계산기에 넣었을 때 나오는 기준·단가·차이와 같습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {EXAMPLE_ROWS.map((ex) => (
              <div key={ex.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '10px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{ex.la}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{ex.lb}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, fontWeight: 700, marginBottom: '8px' }}>→ {ex.verdict} (비교 기준 {ex.base})</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>{ex.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 소비 가능량 반영 가이드 ── */}
        <section>
          <h2 className="g-h2">소비 가능량 반영 — 실질 단가</h2>
          <p className="g-p">
            대용량이 무조건 싼 것은 아닙니다. <strong>다 쓰지 못하면 실질 단가는 올라갑니다.</strong> 각 상품 카드의 [실제 소비 가능량]에서 100/75/50% 버튼을 누르거나 직접입력(예: 25%)하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>소비 가능량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 상품</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>실질 단가 배율</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '100% (다 씀)',     s: '매일 사용 — 생수·우유·티슈·계란', pct: 100, c: 'var(--emerald-600)' },
                  { p: '75% (자주 씀)',    s: '자주 사용 — 샴푸·세제·화장품',     pct: 75,  c: 'var(--sky-500)' },
                  { p: '50% (가끔 씀)',    s: '가끔 사용 — 소스·조미료·향신료',   pct: 50,  c: 'var(--orange-600)' },
                  { p: '25% (별로 안 씀)', s: '시즌·이벤트용 — 거의 안 씀',        pct: 25,  c: 'var(--red-600)' },
                ].map((r, i) => (
                  <tr key={r.p} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>×{(100 / r.pct).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            가구 규모 가이드 — <strong>1인 가구</strong> 50% / <strong>2인</strong> 75% / <strong>4인</strong> 100% (대략). 비율은 정답이 아니라 출발점이니,
            지난번 같은 제품을 얼마 만에 다 썼는지, 버린 양이 있었는지를 떠올려 조정하세요. 식품은 소비기한, 화장품은 제품에 표시된 사용기한이나
            개봉 후 사용기간(예: 12M) 안에 다 쓸 수 있는 양인지가 기준이고, 보관 공간이 부족해 한동안 못 쓰는 상황도 사실상 비용입니다.
          </p>
        </section>

        {/* ── 5. 단가 함정 ── */}
        <section>
          <h2 className="g-h2">이런 단가 함정 조심하세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '대용량 = 무조건 싸다?',     desc: '대용량의 단가가 행사 중인 소용량보다 비싸거나 비슷할 때가 있습니다. 100g·100ml당으로 비교하고 소비 가능량까지 반영하세요.' },
              { title: '1+1 vs 50% 할인',          desc: '수학적으로 동일. 단, 2개를 다 써야 실제 이득.' },
              { title: '"+500ml 증량!" 광고',      desc: '원래 용량이 작으면 단가는 그대로일 수 있음. 가격·용량 그대로 입력해 확인.' },
              { title: '몰래 줄어든 용량',          desc: '가격은 그대로인데 용량만 줄면 단가가 오릅니다. 지난번 구매 때의 가격·용량을 함께 입력해 보세요.' },
              { title: '배송비 무시',               desc: '무료배송 기준 금액과 배송비는 쇼핑몰·회원 등급마다 다릅니다. 단독 주문 시 배송비를 가격에 더해 입력하세요.' },
              { title: '묶음이 낱개보다 비쌀 때',   desc: '묶음 상품의 단가가 낱개보다 높은 경우도 있습니다. 총가격 ÷ 총용량으로 직접 확인.' },
            ].map((item) => (
              <div key={item.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            용량을 줄이고 가격은 그대로 두는 이른바 슈링크플레이션에 대해서는 공정거래위원회 「사업자의 부당한 소비자거래행위 지정 고시」가 2024년 8월부터 시행되고 있습니다.
            우유·라면·과자·화장지·샴푸 등 지정 품목의 제조사가 용량을 줄이면 변경일부터 3개월 이상 포장·홈페이지·판매 페이지 중 한 곳에 알려야 하고,
            용량 감소가 5% 이하이거나 가격도 함께 내려 단위가격이 그대로면 알리지 않아도 됩니다. 고지를 놓쳤더라도 단가를 직접 계산해 보면 바로 드러납니다.
          </p>
        </section>

        {/* ── 6. 단위 비교 가이드 ── */}
        <section>
          <h2 className="g-h2">단위 비교 가이드 — 자동 추천 기준</h2>
          <p className="g-p">
            본 도구는 첫 번째 상품의 단위와 총량에 따라 비교 기준을 자동 추천합니다([자동 추천] 토글). 직접 변경도 가능합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>단위 계열</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>자동 추천</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>대표 상품</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '액체 (ml·L)',     r: '총량 1L 미만 → 100ml당 / 1L 이상 → 1L당', e: '음료·생수·세제·샴푸·화장품' },
                  { k: '무게 (g·kg)',     r: '총량 1kg 미만 → 100g당 / 1kg 이상 → 1kg당', e: '쌀·과자·고기·과일·채소' },
                  { k: '개수 (개·매·장)', r: '1개당 / 1매당 / 1장당',                e: '티슈·물티슈·마스크·계란' },
                ].map((r, i) => (
                  <tr key={r.k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="warn" title="액체(ml)와 무게(g)는 직접 비교하지 마세요">
              밀도가 다릅니다 (우유 1L ≈ 1,030g, 꿀 1L ≈ 1,420g). 두 계열을 섞어 입력하면 계산기가 경고를 띄우고 비교에서 제외합니다.
            </Callout>
          </div>
        </section>

        {/* ── 7. 가격표의 단위가격 (가격표시제) ── */}
        <section>
          <h2 className="g-h2">마트 가격표의 단위가격 읽는 법 — 가격표시제</h2>
          <p className="g-p">
            「물가안정에 관한 법률」 제3조와 정부 고시 「가격표시제 실시요령」에 따라 대형마트 같은 대규모점포와 기업형 슈퍼마켓(준대규모점포)은
            지정 품목의 판매가격 옆에 <strong>단위가격</strong>을 함께 적어야 합니다. 2025년 4월 개정으로 표시 품목이 84개에서 114개로 늘었고,
            2026년 4월부터는 연간 거래금액 10조원 이상인 대규모 온라인쇼핑몰에도 적용되었습니다(시행 초기 6개월은 시범운영·계도기간).
          </p>
          <p className="g-p">
            표시단위는 품목마다 다릅니다. 라면은 개정 전에는 「1개당」이었지만 봉지마다 중량이 달라 비교가 어렵다는 이유로 「100g당」으로 바뀌었습니다.
            120g 한 봉지가 830원이면 1개당으로는 830원이지만 100g당으로는 {RAMEN_PER100G}원이어서, 중량이 다른 라면끼리 바로 견줄 수 있습니다.
            가격표 단위가격은 매장 안 비교에 편하고, 다른 매장·온라인몰과 비교하거나 1+1·배송비가 끼면 계산기에 같은 기준으로 다시 넣어 보세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>품목 (예시)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>고시 표시단위</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>이 계산기로 맞추는 법</th>
                </tr>
              </thead>
              <tbody>
                {OFFICIAL_UNITS.map((r, i) => (
                  <tr key={r.item} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.unit}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 대표 품목만 옮긴 것입니다. 전체 114개 품목과 표시단위는 국가법령정보센터의 「가격표시제 실시요령」 별표에서 확인하세요.
          </p>
        </section>

        {/* ── 8. 추천 단위 표 ── */}
        <section>
          <h2 className="g-h2">자주 비교하는 상품별 추천 단위</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  <th scope="col" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>상품군</th>
                  <th scope="col" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>추천 단위</th>
                  <th scope="col" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>예시</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: '세제·샴푸·화장품', unit: '100ml당', ex: '샴푸 500ml / 리필 1L / 바디워시 750ml' },
                  { cat: '음료·주스·우유',   unit: '100ml당', ex: '생수 2L / 우유 900ml / 주스 1.5L' },
                  { cat: '쌀·밀가루·설탕',  unit: '1kg당',   ex: '쌀 10kg / 밀가루 3kg / 설탕 1kg' },
                  { cat: '과자·시리얼',     unit: '100g당',  ex: '과자 250g / 시리얼 500g / 초콜릿 80g' },
                  { cat: '라면·파스타',     unit: '100g당',  ex: '라면 5입(봉지 중량 × 5) / 파스타 500g — 라면 고시 표시단위도 100g' },
                  { cat: '두루마리 화장지', unit: '길이 1m당', ex: '롤당 길이 × 롤 수를 용량에, 단위 「개」로 입력 (고시 표시단위 10m)' },
                  { cat: '각티슈·물티슈',   unit: '1매당',   ex: '각티슈 250매 × 3개 / 물티슈 70매 × 10팩' },
                  { cat: '커피·차',         unit: '100g당',  ex: '원두 200g / 티백 1박스' },
                  { cat: '과일·채소',       unit: '1kg당',   ex: '사과 2kg / 바나나 1송이' },
                ].map((row, i, arr) => (
                  <tr key={row.cat} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{row.cat}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.unit}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{row.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 9. FAQ ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 10. 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',         emoji: '🍻', name: '더치페이 계산기',   desc: '공동구매 정산' },
              { href: '/tools/cooking/substitute', emoji: '🔁', name: '식재료 대체 비율',   desc: '대체 음식·양 변환' },
              { href: '/tools/unit/converter',     emoji: '⚖️', name: '단위 변환기',         desc: '길이·무게·부피 등 변환' },
              { href: '/tools/finance/vat',        emoji: '🧾', name: '부가세 계산기',       desc: '공급가액 분리 계산' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ToolPage>
  )
}
