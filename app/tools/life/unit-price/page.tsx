import Link from 'next/link'
import UnitPriceClient from './UnitPriceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

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

const FAQ_LD = [
              { q: '1+1이 진짜 50% 할인과 같은가요?',
                a: '네, 수학적으로 정확히 같습니다. 1개 가격으로 2개를 받는 것이므로 개당 가격은 정확히 절반. 다만 2개를 모두 사용할 수 있어야 실질적 이득. 유통기한이 짧거나 혼자 사는 경우 [소비 가능량] 옵션으로 실질 단가 확인 권장.' },
              { q: '100ml당과 1L당 중 어떤 걸로 비교해야 하나요?',
                a: '본 도구는 자동 추천합니다 — 1L 미만이면 100ml당, 1L 이상이면 1L당. [자동 추천] 토글을 끄고 직접 변경도 가능합니다. 어느 쪽으로 해도 비율은 똑같으니 본인이 보기 편한 단위를 고르면 됩니다.' },
              { q: '배송비는 어떻게 반영하나요?',
                a: '배송비 입력란은 따로 없습니다. 단독 주문해 배송비가 붙는다면 <strong>배송비를 더한 실제 결제 금액을 가격란에 직접</strong> 입력하세요 (예: 상품 6,900원 + 배송 3,000원 → 가격에 9,900 입력). 여러 상품을 함께 주문해 배송비가 공유된다면 상품 가격만 입력하면 됩니다.' },
              { q: '코스트코 대용량이 항상 더 싼가요?',
                a: '아닙니다. 100g·100ml당 단가를 계산해보면 일반 마트 1+1이 더 저렴한 경우가 꽤 많습니다. 특히 소비 속도가 느린 상품(소스·조미료)은 대용량이 유통기한 안에 못 쓰면 실질 손해. 본 도구의 [소비 가능량] 옵션 활용 — 1.5L를 50%만 쓰면 실질 단가 2배.' },
              { q: '1+1 행사 상품은 어떻게 입력하나요?',
                a: '<strong>개수에 2</strong>, 가격은 표시된 가격 그대로. 2+1은 개수 3, 3+1은 개수 4. 본 도구는 행사 옵션을 따로 두지 않고 개수 입력만으로 단가를 정확히 계산합니다. 예: 샴푸 8,900원 1+1 → 가격 8,900 / 용량 500ml / 개수 2 = 100ml당 890원.' },
              { q: 'ml 상품과 g 상품을 비교할 수 있나요?',
                a: '직접 비교 어려움. ml = 부피(액체), g = 무게(고체)이며 밀도가 다릅니다. 예: 우유 1L ≈ 1,030g, 꿀 1L ≈ 1,420g. 본 도구는 다른 계열 입력 시 경고 메시지를 표시합니다. 같은 계열(ml↔L 또는 g↔kg)로 통일해 비교하세요.' },
              { q: '모바일에서 마트 현장에서 쓰기 좋게 만들었나요?',
                a: '네, 모바일 마트 현장 최적화: ① 가격·용량·개수만 입력(단순) ② 실시간 결과(입력 즉시) ③ 천 단위 콤마 자동 ④ 숫자 키패드 자동 ⑤ 큰 버튼·입력(엄지 친화, 약 44~48px) ⑥ 결과 화면 상단 고정 ⑦ 결과 복사(가족 공유). 소비 가능량은 [고급 옵션]으로 숨김 — 기본은 단순.' },
              { q: '같은 1L 우유라도 가격이 다른데 어떻게 비교하나요?',
                a: '본 도구에 둘 다 입력 — A: 일반 우유 1L · 2,500원 → 100ml당 250원 / B: 유기농 우유 1L · 4,500원 → 100ml당 450원. B가 80% 비쌈. 가격 차이 + 본인 가치(유기농·브랜드)를 종합 판단. 본 도구는 단가만 보여주며, 가치 판단은 사용자 영역.' },
              { q: '소비 가능량(실질 단가)는 어떻게 활용하나요?',
                a: '각 상품 카드의 [⚙️ 실제 소비 가능량]에서 100/75/50% 버튼을 누르거나 직접입력(예: 25%)하면 됩니다. 가이드: 매일 사용(생수·우유) 100% / 자주(샴푸·세제) 75% / 가끔(소스·조미료) 50% / 시즌·이벤트용 25%. 가구 규모 — 1인 50%·2인 75%·4인 100% 권장. 50%만 쓰면 실질 단가는 표시 단가의 2배가 됩니다.' },
            ]

export default function UnitPricePage() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏷️ 단가 비교 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        마트·편의점·코스트코 가격을 <strong style={{ color: 'var(--text)' }}>1ml·1g·1개당 실질 단가</strong>로 즉시. 1+1·2+1도 정확히.
      </p>

      <UnitPriceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기본 공식 (단순화) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>단가 계산 기본 공식</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 22px' }}>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '17px', lineHeight: 1.8, color: 'var(--text)', marginBottom: '14px' }}>
              가격 ÷ (용량 × 개수) × 기준 단위
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, margin: '0 0 8px' }}>
              예: 8,900원 ÷ (500ml × 5개) × 100 = <strong style={{ color: 'var(--accent)' }}>100ml당 356원</strong>
            </p>
            <details style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <summary style={{ fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                ⚙️ 실질 단가 (소비 가능량 반영)
              </summary>
              <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <p style={{ margin: '0 0 6px' }}>다 쓰지 못하면 실제 단가는 올라갑니다.</p>
                <p style={{ margin: '0 0 6px' }}>실질 단가 = 단가 ÷ (소비 가능량 ÷ 100) — 예: 50%만 쓰면 단가의 <strong style={{ color: 'var(--accent)' }}>2배</strong></p>
                <p style={{ margin: 0 }}>각 상품 카드의 [⚙️ 실제 소비 가능량]에서 설정하세요.</p>
                <p style={{ margin: '8px 0 0', fontSize: '12px' }}>※ 배송비·쿠폰 입력란은 따로 없습니다 — 단독 주문해 배송비가 붙거나 쿠폰을 적용한다면 <strong style={{ color: 'var(--text)' }}>실제 결제 금액을 가격란에 직접</strong> 입력하세요.</p>
              </div>
            </details>
          </div>
        </section>

        {/* ── 2. 1+1·2+1 입력 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🎁 1+1·2+1 행사 — 개수만 입력하면 끝
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 행사 옵션을 따로 두지 않습니다. <strong style={{ color: 'var(--text)' }}>개수에 받는 갯수를 그대로 입력</strong>하면 단가가 정확히 계산됩니다 (가격은 실제 결제 금액).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>행사</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>개수 입력</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>예시 (샴푸 8,900원·500ml)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '1+1', c: '2', e: '가격 8,900 / 용량 500ml / 개수 2 → 100ml당 890원' },
                  { d: '2+1', c: '3', e: '가격 17,800 / 용량 500ml / 개수 3 → 100ml당 1,187원' },
                  { d: '3+1', c: '4', e: '가격 26,700 / 용량 500ml / 개수 4 → 100ml당 1,335원' },
                  { d: '5+1', c: '6', e: '가격 44,500 / 용량 500ml / 개수 6 → 100ml당 1,483원' },
                  { d: '단품', c: '1', e: '가격 8,900 / 용량 500ml / 개수 1 → 100ml당 1,780원' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 16 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 3. 실제 마트 비교 예시 (코스트코 함정 포함) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>실제 마트·편의점·코스트코 비교 예시</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '🛒 샴푸 — 1+1 vs 단품',
                a: 'A: 500ml 1+1 · 8,900원 (개수 2) → 100ml당 890원 ⭐',
                b: 'B: 750ml 단품 · 11,000원 (개수 1) → 100ml당 1,467원',
                tip: '1+1 행사가 단품 대비 약 39% 저렴. 개수에 2 입력만으로 정확 비교.',
              },
              {
                title: '🥤 음료 — 편의점 vs 마트',
                a: 'A: 편의점 비타500 100ml × 1병 · 1,200원 → 100ml당 1,200원',
                b: 'B: 마트 비타500 10병 박스 · 8,900원 (개수 10) → 100ml당 890원 ⭐',
                tip: '같은 제품 마트 박스가 약 26% 저렴. 음료는 박스 단위 ↑',
              },
              {
                title: '🥫 참치캔 — 온라인 vs 마트 (배송비 포함 비교)',
                a: 'A: 150g × 6캔 묶음 · 12,900원 (무료배송) → 100g당 1,433원 ⭐',
                b: 'B: 100g × 4캔 · 9,900원 (배송비 3,000원 포함) → 100g당 2,475원',
                tip: '배송비가 붙으면 가격란에 더해 입력하면 정확히 반영됩니다. 이 경우 A가 약 42% 저렴.',
              },
              {
                title: '⚠️ 코스트코 대용량 함정 (소비 가능량 반영)',
                a: 'A: 일반 마트 샴푸 500ml 1+1 · 12,000원 (개수 2, 100% 사용) → 100ml당 1,200원',
                b: 'B: 코스트코 샴푸 1.5L · 18,000원 (개수 1, <strong style="color:#EA580C">50% 사용</strong>) → 100ml당 1,200원, <strong style="color:#EA580C">실질 2,400원</strong>',
                tip: '단가는 같지만 1.5L를 6개월 안에 다 못 쓰면 실질 단가가 2배. 본 도구의 [소비 가능량] 옵션 활용.',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: ex.a }} />
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: ex.b }} />
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>💡 {ex.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 소비 가능량 반영 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            💡 소비 가능량 반영 — 실질 단가
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            대용량 = 무조건 싸다 X. <strong style={{ color: 'var(--text)' }}>다 쓰지 못하면 실질 단가는 ↑</strong>. 각 상품 카드의 [⚙️ 실제 소비 가능량]에서 100/75/50% 버튼 또는 직접입력(예: 25%).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>소비 가능량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 상품</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>실질 단가 배율</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '100% (다 씀)',     s: '매일 사용 — 생수·우유·티슈·계란', m: '×1.0', c: '#059669' },
                  { p: '75% (자주 씀)',    s: '자주 사용 — 샴푸·세제·화장품',     m: '×1.33', c: '#0EA5E9' },
                  { p: '50% (가끔 씀)',    s: '가끔 사용 — 소스·조미료·향신료',   m: '×2.00', c: '#EA580C' },
                  { p: '25% (별로 안 씀)', s: '시즌·이벤트용 — 거의 안 씀',        m: '×4.00', c: '#DC2626' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            가구 규모 가이드 — <strong style={{ color: 'var(--text)' }}>1인 가구</strong> 50% / <strong style={{ color: 'var(--text)' }}>2인</strong> 75% / <strong style={{ color: 'var(--text)' }}>4인</strong> 100% (대략). 유통기한·보관 공간도 함께 고려.
          </p>
        </section>

        {/* ── 5. 단가 함정 6가지 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이런 단가 함정 조심하세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '대용량 = 무조건 싸다?',     desc: '코스트코·대용량이 단가가 더 비싸거나 비슷할 때 多. 100g·100ml당으로 비교 + 소비 가능량 반영.' },
              { title: '1+1 vs 50% 할인',          desc: '수학적으로 동일. 단, 2개를 다 써야 실제 이득.' },
              { title: '"+500ml 증량!" 광고',      desc: '원래 용량이 작으면 단가는 그대로일 수 있음. 가격·용량 그대로 입력해 확인.' },
              { title: '배송비 무시',               desc: '쿠팡 무료 / 마켓컬리 4,000원 등 배송비는 단가에 그대로 반영. 단독 주문 시 배송비를 가격에 더해 입력하세요.' },
              { title: '유통기한·개봉 후 사용',    desc: '샴푸·로션은 개봉 후 1년 이내 사용 기준. 다 못 쓰면 실질 단가 2배.' },
              { title: '낱개 가격 ≠ 묶음 가격',     desc: '묶음 표시 단가는 그대로 믿지 말고 총가격 ÷ 총용량으로 직접 확인.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>⚠️ {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. 단위 비교 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            단위 비교 가이드 — 자동 추천 기준
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 입력한 단위에 따라 비교 기준을 자동 추천합니다([자동 추천] 토글). 직접 변경도 가능.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>단위 계열</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>자동 추천</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>대표 상품</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '🥤 액체 (ml·L)',     r: '1L 미만 → 100ml당 / 1L 이상 → 1L당', e: '음료·생수·세제·샴푸·화장품' },
                  { k: '⚖️ 무게 (g·kg)',     r: '1kg 미만 → 100g당 / 1kg 이상 → 1kg당', e: '쌀·과자·고기·과일·채소' },
                  { k: '🧾 개수 (개·매·장)', r: '1개당 / 1매당 / 1장당',                e: '라면·티슈·물티슈·과자봉지' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            ⚠️ <strong style={{ color: 'var(--text)' }}>액체(ml) ↔ 무게(g) 직접 비교 X</strong> — 밀도가 다릅니다 (우유 1L ≈ 1,030g, 꿀 1L ≈ 1,420g).
          </p>
        </section>

        {/* ── 7. 모바일 사용 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📱 모바일 마트 현장 사용 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 마트 현장 모바일 사용에 최적화되어 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { e: '⚡', t: '실시간 결과', d: '입력 즉시 단가 비교 — 결과 카드가 화면 상단에 고정' },
              { e: '🔢', t: '숫자 키패드 자동', d: '모바일에서 숫자 입력 시 자동 숫자 키패드 (가격은 천 단위 콤마 자동)' },
              { e: '👆', t: '큰 버튼', d: '주요 버튼은 넉넉한 터치 영역(약 44~48px) · 입력 16px (iOS 줌 방지)' },
              { e: '⚙️', t: '고급 옵션 숨김', d: '소비 가능량은 펼침(고급 옵션)으로 — 기본은 단순' },
              { e: '📋', t: '결과 복사', d: '카카오톡·문자로 가족 공유 가능' },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{it.e}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{it.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{it.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. 추천 단위 표 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 비교하는 상품별 추천 단위</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>상품군</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>추천 단위</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>예시</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: '세제·샴푸·화장품', unit: '100ml당', ex: '샴푸 500ml / 리필 1L / 바디워시 750ml' },
                  { cat: '음료·주스·우유',   unit: '100ml당', ex: '생수 2L / 우유 900ml / 주스 1.5L' },
                  { cat: '쌀·밀가루·설탕',  unit: '1kg당',   ex: '쌀 10kg / 밀가루 3kg / 설탕 1kg' },
                  { cat: '과자·시리얼',     unit: '100g당',  ex: '과자 250g / 시리얼 500g / 초콜릿 80g' },
                  { cat: '라면·파스타',     unit: '1개당',   ex: '라면 5입 / 파스타 500g 박스' },
                  { cat: '휴지·물티슈',     unit: '1매당',   ex: '화장지 30롤 × 200매 / 물티슈 70매' },
                  { cat: '커피·차',         unit: '100g당',  ex: '원두 200g / 티백 1박스' },
                  { cat: '과일·채소',       unit: '1kg당',   ex: '사과 2kg / 바나나 1송이' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{row.cat}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.unit}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{row.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 9. FAQ (accordion) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((item, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {item.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: item.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* ── 10. 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',         emoji: '🍻', name: '더치페이 계산기',   desc: '공동구매 정산' },
              { href: '/tools/cooking/substitute', emoji: '🔁', name: '식재료 대체 비율',   desc: '대체 음식·양 변환' },
              { href: '/tools/unit/converter',     emoji: '⚖️', name: '단위 변환기',         desc: '길이·무게·부피 등 변환' },
              { href: '/tools/finance/vat',        emoji: '🧾', name: '부가세 계산기',       desc: '공급가액 분리 계산' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
    </div>
  )
}
