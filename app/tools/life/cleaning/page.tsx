import Link from 'next/link'
import CleaningClient from './CleaningClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'
import { AGENTS, MIX_RISKS } from './cleaningData'

export const metadata = buildMetadata({
  path: '/tools/life/cleaning',
  title: '상황별 청소 세제 계산기 — 구연산·과탄산·베이킹소다·락스 사용량·안전',
  description:
    '화장실·주방·냉장고·창틀·유리·기름때 상황별 추천 세제와 정확한 희석량 자동 계산. 락스+산성=염소가스 등 절대 섞으면 안 되는 조합까지 안전하게.',
  keywords: ['청소세제계산기', '구연산사용법', '과탄산소다사용법', '베이킹소다청소', '락스희석', '천연세제', '청소꿀팁', '세제혼합위험', '곰팡이제거'],
})

const sectionTitle: React.CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }
const cell: React.CSSProperties = { padding: '9px 11px', borderBottom: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--text)', verticalAlign: 'top' }
const headCell: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontWeight: 700, fontSize: '11px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', whiteSpace: 'nowrap' }
const faqDetails: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const FAQ_LD = [
  { q: '베이킹소다·과탄산소다·세스퀴소다는 뭐가 다른가요?', a: '모두 알칼리성이지만 세기와 용도가 다릅니다. <strong>베이킹소다</strong>는 가장 순하고 연마·탈취에, <strong>세스퀴소다</strong>는 중간 세기로 생활 기름때·물걸레 만능 청소에, <strong>과탄산소다</strong>는 산소계 표백제라 표백·찌든때·곰팡이·삶기에 강합니다(따뜻한 물 40~60℃에서 활성화). 강한 기름때엔 더 센 <strong>소다회</strong>를 쓰기도 합니다.' },
  { q: '구연산과 식초는 같은 건가요?', a: '둘 다 산성으로 <strong>물때·석회·비누때 제거, 냄새 중화, 섬유유연제 대체</strong>에 비슷하게 쓰입니다. 구연산은 가루라 보관·농도 조절이 쉽고 냄새가 거의 없으며, 식초는 액체라 바로 쓰기 편하지만 특유의 냄새가 있습니다. <strong>둘 다 락스와 절대 섞으면 안 됩니다(염소가스).</strong>' },
  { q: '락스는 어떻게 안전하게 쓰나요?', a: '① <strong>물로만</strong> 희석하고 다른 세제와 섞지 않습니다. ② 창문·환풍기로 <strong>환기</strong>하고 장갑·마스크를 씁니다. ③ 살균은 보통 물 1L당 락스 10~25ml 정도로 충분합니다. ④ 사용 후 <strong>물로 충분히 헹구고</strong>, 식품이 닿는 면·금속·대리석에는 주의합니다. 색이 있는 천·줄눈은 탈색될 수 있습니다.' },
  { q: '절대 섞으면 안 되는 조합은 무엇인가요?', a: '<strong>락스 + 산성(구연산·식초)</strong> → 염소가스, <strong>락스 + 암모니아 세제</strong> → 클로라민 가스, <strong>락스 + 과탄산소다·과산화수소</strong> → 가스 발생·효과 상쇄. 모두 호흡기에 치명적일 수 있습니다. 그 외 산성+알칼리(구연산+베이킹 등)는 위험은 낮지만 서로 중화돼 세정력이 사라집니다. <strong>원칙은 “한 번에 한 가지 세제만”</strong>입니다.' },
  { q: '천연세제(구연산·과탄산 등)는 항상 더 안전한가요?', a: '“천연”이라고 무조건 순한 건 아닙니다. 과탄산소다·소다회는 알칼리성이 강해 피부·점막을 자극하고, 구연산도 농도가 높으면 자극적이며 대리석·금속을 부식시킵니다. <strong>장갑 착용·환기·테스트(눈에 안 띄는 곳 먼저)</strong>는 종류와 무관하게 권장합니다.' },
  { q: '냉장고나 식기에 락스를 써도 되나요?', a: '식품이 직접 닿는 면에는 <strong>락스보다 베이킹소다·중성세제·뜨거운 물</strong>을 권장합니다. 살균이 꼭 필요하면 묽게 희석한 뒤 <strong>반드시 물로 여러 번 헹궈</strong> 잔류를 없애세요. 냉장고 내부 냄새·세척은 베이킹소다수로 닦고 물걸레로 한 번 더 닦는 것이 안전합니다.' },
]

export default function CleaningPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧽 상황별 청소 세제 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        상황만 고르면 <strong style={{ color: 'var(--text)' }}>맞는 세제·정확한 희석량·사용법</strong>을 자동으로. <strong style={{ color: 'var(--text)' }}>섞으면 위험한 조합</strong>까지 안전하게.
      </p>

      <CleaningClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 혼합 위험 */}
        <div>
          <h2 style={sectionTitle}>🚫 절대 섞으면 안 되는 조합</h2>
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '8px 0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                {MIX_RISKS.map((m, i) => (
                  <tr key={i} style={{ borderBottom: i < MIX_RISKS.length - 1 ? '1px solid rgba(220,38,38,0.15)' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 700, color: m.level === 'danger' ? '#DC2626' : '#EA580C', width: '42%' }}>{m.combo}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.6 }}>{m.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            가장 중요한 원칙은 <strong style={{ color: 'var(--text)' }}>“한 번에 한 가지 세제만”</strong>, 그리고 <strong style={{ color: 'var(--text)' }}>“락스는 물로만 희석·단독·환기”</strong>입니다.
          </p>
        </div>

        {/* 세제 비교 */}
        <div>
          <h2 style={sectionTitle}>🧴 세제 10종 비교</h2>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={headCell}>세제</th>
                  <th style={headCell}>구분</th>
                  <th style={headCell}>잘 맞는 오염</th>
                  <th style={headCell}>핵심 주의</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr key={a.id}>
                    <td style={{ ...cell, fontWeight: 700, color: a.color, whiteSpace: 'nowrap' }}>{a.name}</td>
                    <td style={{ ...cell, whiteSpace: 'nowrap' }}>{a.type}<br /><span style={{ color: 'var(--muted)', fontSize: '11px' }}>pH {a.ph}</span></td>
                    <td style={cell}>{a.uses}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{a.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 핵심 원리 */}
        <div>
          <h2 style={sectionTitle}>🧪 산성 vs 알칼리 — 원리만 알면 쉬워요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
              <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>산성 (구연산·식초)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                <strong>물때·석회·비누때·소변석</strong> 같은 <strong>알칼리성 오염</strong>을 녹입니다. 전기포트 스케일, 섬유유연제 대체에도.
              </p>
            </div>
            <div style={{ ...card, borderTop: '3px solid #059669' }}>
              <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>알칼리 (베이킹·과탄산·소다회)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                <strong>기름때·찌든때·단백질 오염</strong> 같은 <strong>산성 오염</strong>을 분해합니다. 과탄산은 표백·살균까지.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            반대 성질의 오염엔 효과가 약하고, <strong style={{ color: 'var(--text)' }}>산성과 알칼리를 섞으면 서로 중화</strong>돼 둘 다 무력화됩니다. 살균·곰팡이엔 <strong style={{ color: 'var(--text)' }}>락스·과탄산</strong>이 따로 필요합니다.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px', padding: '16px 20px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
          <strong style={{ color: '#DC2626' }}>⚠️ 안전 안내</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            본 도구의 희석량은 일반적인 권장 근사치이며 <strong style={{ color: 'var(--text)' }}>제품 라벨의 사용법·경고가 우선</strong>합니다. 어떤 세제든 <strong style={{ color: 'var(--text)' }}>환기·장갑·눈에 안 띄는 곳 먼저 테스트</strong>를 권장하고, 락스 등은 절대 다른 세제와 섞지 마세요. 어린이·반려동물 손에 닿지 않게 보관하고, 흡입·피부 이상 시 환기 후 의료기관에 문의하세요.
          </p>
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/laundry-dry', icon: '🧺', name: '빨래 건조 시간 계산기', desc: '날씨·소재별 건조 시간' },
              { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기간' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단위가격 계산기', desc: '세제 용량당 가격 비교' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 지수 계산기', desc: '빨래·이불 일광소독' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
