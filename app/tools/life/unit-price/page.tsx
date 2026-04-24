import type { Metadata } from 'next'
import Link from 'next/link'
import UnitPriceClient from './UnitPriceClient'

export const metadata: Metadata = {
  title: '단가 비교 계산기 — 마트 용량·덤·1+1 가성비 비교 | Youtil',
  description: '용량이 다른 상품의 10ml당·100g당 단가를 비교합니다. 덤·1+1·2+1 행사, 쿠폰 할인, 배송비 포함 반영. 마트·쿠팡·코스트코 가성비 계산.',
  keywords: ['단가계산기', '가성비계산기', '마트단가비교', '코스트코단가', '100ml당단가', '1+1가성비', '쿠팡단가비교', '용량비교계산기'],
}

export default function UnitPricePage() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏷️ 단가 비교 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        용량·덤·1+1·쿠폰·배송비까지 모두 반영해 정확한 100ml(100g)당 단가를 비교해드려요. 진짜 가성비 승자를 찾아보세요.
      </p>

      <UnitPriceClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 기본 공식 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>단가 계산 기본 공식</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 22px' }}>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
              진짜 단가는 <strong style={{ color: 'var(--text)' }}>"내가 실제로 낸 돈 ÷ 실제로 받은 양"</strong>입니다. 정가나 용량만 보면 속기 쉽습니다.
            </p>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', fontFamily: 'Syne, monospace', fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
              <p><span style={{ color: 'var(--accent)' }}>단가</span> = (가격 − 즉시할인) × (1 − 쿠폰%) + 배송비 <span style={{ color: 'var(--muted)' }}>÷</span> (용량 × 개수 × 덤 배율) × 기준단위</p>
            </div>
            <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                '1+1 이벤트 → 가격은 1개분, 용량은 2개분으로 계산',
                '2+1 이벤트 → 가격은 2개분, 용량은 3개분',
                '+100ml 덤 → 가격 그대로, 용량만 +100ml',
                '쿠폰·즉시할인·배송비는 최종 지불가에 반영',
              ].map((t, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. 실제 비교 예시 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>실제 마트 비교 예시 3가지</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '샴푸 — 같은 브랜드, 다른 용량',
                a: 'A: 500ml × 1병 · 8,900원 → 100ml당 1,780원',
                b: 'B: 750ml 1+1 · 15,900원 → 100ml당 1,060원 (A 대비 40.4% 저렴)',
                tip: '1+1은 실제 받는 양이 2배라 단가가 급락합니다.',
              },
              {
                title: '과일주스 — 덤 vs 대용량',
                a: 'A: 1.5L + 500ml 덤 · 4,200원 → 100ml당 210원',
                b: 'B: 2L 단품 · 4,800원 → 100ml당 240원 (A가 12.5% 저렴)',
                tip: '덤 용량이 붙은 쪽이 결국 100ml당 더 쌉니다.',
              },
              {
                title: '참치캔 — 쿠팡 정기배송 vs 대형마트',
                a: 'A: 150g × 6캔 · 12,900원 · 배송비 0원 → 100g당 1,433원',
                b: 'B: 100g × 4캔 · 6,900원 · 배송비 3,000원 → 100g당 2,475원 (A가 42.1% 저렴)',
                tip: '배송비를 빼먹으면 단가가 크게 틀어집니다.',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{ex.a}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>{ex.b}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>💡 {ex.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 함정 주의 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이런 단가 함정 조심하세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '대용량 = 무조건 싸다?', desc: '코스트코·대용량 상품이 단가가 더 비쌀 때가 있습니다. 꼭 100g·100ml당으로 비교해야 속지 않아요.' },
              { title: '1+1 vs 50% 할인', desc: '1+1은 정확히 50% 할인과 같습니다. 2+1은 33% 할인 수준. 숫자에 속지 마세요.' },
              { title: '덤 용량 광고', desc: '"+500ml 증량!"이 크게 적혀있어도 원래 용량이 소형이면 단가는 그대로일 수 있어요.' },
              { title: '배송비 무시', desc: '쿠팡 무료배송 / 마켓컬리 4,000원 배송비는 단가에 그대로 반영됩니다. 필수 체크 항목.' },
              { title: '유통기한', desc: '단가만 싸도 다 못 쓰고 버리면 실질 단가는 2배. 샴푸·로션은 개봉 후 1년 이내 사용 기준으로 계산.' },
              { title: '낱개 가격 ≠ 묶음 가격', desc: '묶음상품의 낱개 단가 표시를 그대로 믿지 말고 총가격 ÷ 총용량으로 직접 확인하세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>⚠️ {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 상품별 추천 단위 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 비교하는 상품별 추천 단위</h2>
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
                  { cat: '세제·샴푸·화장품', unit: '100ml당',    ex: '샴푸 500ml / 리필 1L / 바디워시 750ml' },
                  { cat: '음료·주스·우유',    unit: '100ml당',    ex: '생수 2L / 우유 900ml / 주스 1.5L' },
                  { cat: '쌀·밀가루·설탕',   unit: '1kg당',      ex: '쌀 10kg / 밀가루 3kg / 설탕 1kg' },
                  { cat: '과자·시리얼',      unit: '100g당',     ex: '과자 250g / 시리얼 500g / 초콜릿 80g' },
                  { cat: '라면·파스타',      unit: '1개당',      ex: '라면 5입 / 파스타 500g 박스' },
                  { cat: '휴지·물티슈',      unit: '1매당',      ex: '화장지 30롤 × 200매 / 물티슈 70매' },
                  { cat: '커피·차',          unit: '100g당',     ex: '원두 200g / 티백 1박스' },
                  { cat: '과일·채소',        unit: '1kg당',      ex: '사과 2kg / 바나나 1송이' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{row.cat}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent)', fontFamily: 'Syne, monospace', fontWeight: 700 }}>{row.unit}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{row.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '1+1이 진짜 50% 할인과 같은가요?', a: '네, 수학적으로 정확히 같습니다. 1개 가격으로 2개를 받는 것이므로 개당 가격은 정확히 절반. 다만 2개를 모두 사용할 수 있어야 실질적 이득이 됩니다. 유통기한이 짧거나 혼자 사는 경우 오히려 손해일 수 있어요.' },
              { q: '100ml당과 1L당 중 어떤 걸로 비교해야 하나요?', a: '상품 용량대에 맞춰 선택하세요. 샴푸·화장품처럼 수백 ml 단위면 100ml당, 생수·주스처럼 리터 단위면 1L당이 직관적입니다. 어느 쪽으로 해도 비율은 똑같으니 본인이 보기 편한 단위를 고르면 됩니다.' },
              { q: '배송비는 각 상품에 어떻게 나눠야 하나요?', a: '장바구니에 여러 상품을 함께 담는 경우 배송비를 상품별로 배분하는 건 애매합니다. 본 계산기는 "이 상품만 따로 주문할 때의 실질 단가"를 기준으로 배송비를 더합니다. 함께 주문한다면 배송비는 0으로 설정하세요.' },
              { q: '코스트코 대용량이 항상 더 싼가요?', a: '아닙니다. 100g·100ml당 단가를 계산해보면 일반 마트 1+1이 더 저렴한 경우가 꽤 많습니다. 특히 소비 속도가 느린 상품(소스·조미료)은 대용량이 유통기한 안에 못 쓰면 실질 손해입니다. 꼭 단가 + 소비 가능성을 함께 보세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',      emoji: '🍻', name: '더치페이 계산기',   desc: '공동구매 정산' },
              { href: '/tools/cooking/unit',    emoji: '🥄', name: '요리 단위 변환기',   desc: 'oz·컵·근 등 환산' },
              { href: '/tools/unit/weight',     emoji: '⚖️', name: '무게 변환기',         desc: 'kg·lb·근·돈 변환' },
              { href: '/tools/finance/vat',     emoji: '🧾', name: '부가세 계산기',       desc: '공급가액 분리 계산' },
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
        </div>
      </div>
    </div>
  )
}
