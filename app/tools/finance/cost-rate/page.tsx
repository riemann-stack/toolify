import Link from 'next/link'
import CostRateClient from './CostRateClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/cost-rate',
  title: '메뉴 원가율 계산기 — 배달 수수료·포장재·실질 원가율',
  description:
    '재료비, 배달앱 수수료, 포장재, 결제 수수료까지 반영한 실제 메뉴 원가율과 마진을 계산합니다. 배민·쿠팡이츠·요기요 비교, 목표 원가율 판매가 역산, 손익분기 분석.',
  keywords: ['원가율계산기', '메뉴원가계산', '배달수수료계산', '식당원가율', '배민수수료', '쿠팡이츠수수료', '요기요수수료', '판매가계산', '음식점마진계산'],
})

export default function CostRatePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍽️ 메뉴 원가율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        재료비·포장재·배달앱 수수료·결제 수수료를 모두 반영한 <strong style={{ color: 'var(--text)' }}>실질 원가율</strong>과 1개당 남는 금액을 계산합니다.
        배민·쿠팡이츠·요기요 채널 비교, 목표 원가율로 판매가 역산, 가격 인상 시뮬레이션, 월 손익분기까지 한 번에.
      </p>

      <CostRateClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            메뉴 원가율 핵심 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>기본 원가율</span> = 재료비 ÷ 판매가 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>실질 원가율</span> = (재료비 + 포장재 + 배달앱·결제 수수료 + 배달비 부담 + 광고비) ÷ 판매가 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>1개당 마진</span> = 판매가 − 실질 변동비</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 임대료·인건비 같은 고정비는 별도로 손익분기 계산에 반영</div>
          </div>
        </div>

        {/* ── 2. 업종별 권장 원가율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            업종별 권장 원가율 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['업종', '권장 원가율', '평균 마진율'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '한식·중식',       r: '28~35%', m: '65~72%' },
                  { c: '양식·이탈리안',   r: '30~35%', m: '65~70%' },
                  { c: '일식·초밥',       r: '35~40%', m: '60~65%' },
                  { c: '카페·디저트',     r: '25~30%', m: '70~75%' },
                  { c: '분식·간편식',     r: '30~33%', m: '67~70%' },
                  { c: '치킨·피자',       r: '30~35%', m: '65~70%' },
                  { c: '파인다이닝',      r: '35~40%', m: '60~65%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: '#3EFF9B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 배달앱 수수료 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2024년 배달앱 수수료 비교
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { app: '🟢 배달의민족', color: '#3EFF9B', items: [
                ['오픈서비스', '6.8% + 결제 3%'],
                ['배민 1', '6.8% + 결제 3% (배민이 배달)'],
                ['광고', '울트라콜 (월 정액 88,000원)'],
              ]},
              { app: '🔴 쿠팡이츠', color: '#FF6B6B', items: [
                ['스마트배달', '9.8% + 결제 3%'],
                ['일반', '5% + 결제 3% (직접 배달)'],
              ]},
              { app: '🟡 요기요', color: '#FFD700', items: [
                ['요기요 배달', '12.5% + 결제 3%'],
                ['사장님 배달', '4.7% + 결제 3%'],
              ]},
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.color, fontWeight: 700, marginBottom: 8 }}>{g.app}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {g.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ※ 정책은 수시 변경되므로 각 앱 공식 페이지 확인 필수. 결제 수수료는 PG사·카드사에 따라 ±0.5% 차이가 있습니다.
          </p>
        </div>

        {/* ── 4. 배달 추가 비용 체크리스트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            배달 시 추가 비용 체크리스트
          </h2>
          <div style={{
            background: 'rgba(255,140,62,0.05)',
            border: '1px solid rgba(255,140,62,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>☑ <strong>배달앱 중개 수수료</strong> — 5~12.5% (앱·정책별)</li>
              <li>☑ <strong>결제 수수료</strong> — 약 3% (PG·카드사별 ±0.5%)</li>
              <li>☑ <strong>배달비 가게 부담</strong> — 0~3,000원 (정책별)</li>
              <li>☑ <strong>포장재 비용</strong> — 500~1,500원/건</li>
              <li>☑ <strong>광고비</strong> — 월 정액(울트라콜) 또는 입찰</li>
              <li>☑ <strong>부가세</strong> — 10% (매출 신고 시 별도)</li>
            </ul>
          </div>
        </div>

        {/* ── 5. 가격 책정 심리 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 가격 책정 심리 — 100원 단위 vs 1,000원 단위
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>심리 가격 (예: 11,900원)</p>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>12,000원과 100원 차이지만 <strong>"1만원대"</strong>로 인식</li>
                <li>매출 5~10% 차이 가능성</li>
                <li>단, 너무 자주 사용하면 신뢰도 하락</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>라운드 가격 (예: 12,000원)</p>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>고급 이미지 형성</li>
                <li>계산이 깔끔, 거스름돈 관리 쉬움</li>
                <li>파인다이닝·고가 메뉴에 유리</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 6. 손익분기 판매량 계산법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            손익분기 판매량 계산법
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.9,
          }}>
            <p style={{ fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: 'var(--muted)' }}>손익분기 판매량</span> = 월 고정비 ÷ 메뉴당 평균 마진
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.85 }}>
              예시:<br />
              • 월 고정비 = 임대료 200만원 + 인건비 300만원 + 공과금 50만원 = <strong style={{ color: 'var(--text)' }}>550만원</strong><br />
              • 메뉴당 평균 마진 = <strong style={{ color: 'var(--text)' }}>7,000원</strong><br />
              • 손익분기 = 550만원 ÷ 7,000원 = <strong style={{ color: 'var(--accent)' }}>786개/월</strong><br />
              • 영업일 26일 → <strong style={{ color: 'var(--accent)' }}>일 평균 30개 이상 판매 필요</strong>
            </p>
          </div>
        </div>

        {/* ── 7. 원가율 낮추는 5가지 방법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            원가율 낮추는 5가지 방법
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🤝', t: '식자재 단가 협상',   d: '대량 구매·계약 거래처로 5~15% 절감 가능' },
              { i: '📋', t: '메뉴 재료 표준화',   d: '재료 가짓수 줄이기 → 폐기 감소·관리 단순화' },
              { i: '♻️', t: '폐기율 관리',        d: '선입선출(FIFO), 적정 재고로 폐기율 5% 이하' },
              { i: '⚙️', t: '1차 가공 줄이기',   d: '전처리 식재료 활용 → 인건비·시간 동시 절감' },
              { i: '💰', t: '단계적 가격 인상',   d: '탄력성 고려 5~10%씩 분기별 인상' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 22, marginBottom: 6 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '적정 원가율은 몇 %인가요?',
                a: '외식업 평균은 <strong>30~35%</strong>이지만 업종별로 차이가 큽니다. 한식·중식은 28~35%, 카페·디저트는 25~30%가 권장됩니다. 다만 매장 임대료·인건비·로열티 등이 높은 경우 원가율을 더 낮추거나 판매가를 높여야 손익분기를 맞출 수 있습니다.',
              },
              {
                q: '배달 수수료 때문에 마진이 거의 안 남는데 어떻게 해야 하나요?',
                a: '<strong>배달 전용 가격 책정 전략</strong>을 권장합니다. 많은 식당이 배달가를 매장가 대비 10~15% 높게 설정해 수수료를 보전합니다. 또는 배달용 메뉴 수를 줄이고 고마진 메뉴 위주로 구성하는 방법도 효과적입니다. 본 계산기에서 채널별 비교를 통해 최적 가격을 찾아보세요.',
              },
              {
                q: '포장재 비용은 얼마로 잡아야 하나요?',
                a: '메뉴 종류와 포장재 품질에 따라 다르지만 일반적으로:<br/>• 일반 도시락·죽: <strong>500~700원</strong><br/>• 국물·찌개류: <strong>800~1,200원</strong> (이중 포장 필요)<br/>• 분식·디저트: <strong>300~500원</strong><br/>• 친환경·고급 포장: <strong>1,500~2,500원</strong><br/>평균적으로 판매가의 5~7% 정도를 포장재 비용으로 잡는 것이 안전합니다.',
              },
              {
                q: '가격을 올리면 손님이 줄어들까봐 걱정됩니다.',
                a: '일반적인 가격 탄력성 기준으로 <strong>10% 인상 시 5~7% 판매량 감소</strong>를 가정합니다. 즉, 인상 후에도 매출은 약 3% 증가하고 마진은 더 크게 개선됩니다. 다만 직접 경쟁 매장이 가까이 있다면 탄력성이 더 높을 수 있어 시장 상황을 살피며 단계적으로(5~10%씩) 인상하는 것이 안전합니다.',
              },
              {
                q: '배달과 매장 가격을 다르게 해도 되나요?',
                a: '법적으로 가능하며 많은 식당이 이미 적용 중입니다. 다만 배달앱에 표기된 가격과 실제 매장 가격이 다르다는 사실을 고객이 알면 신뢰도 하락 위험이 있어 배달가가 더 높음을 명시(배달 전용 메뉴 등)하는 방식이 권장됩니다. <strong>쿠팡이츠는 매장과 동일 가격을 요구하는 정책</strong>이 있으므로 약관 확인이 필요합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/finance/vat',         icon: '🧾', name: '부가세 계산기',           desc: '사업자 부가세 공급가액·세액 분리' },
              { href: '/tools/life/unit-price',     icon: '🏷️', name: '단가 비교 계산기',         desc: '식자재 가성비 단가 비교' },
              { href: '/tools/finance/car-cost',    icon: '🚗', name: '자동차 유지비 계산기',    desc: '배달 차량 비용 계산' },
              { href: '/tools/life/dutch',          icon: '🍻', name: '더치페이 계산기',          desc: '회식·미팅 정산' },
              { href: '/tools/finance/salary',      icon: '💴', name: '연봉 실수령액 계산기',    desc: '직원 인건비 계산' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
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
    </div>
  )
}
