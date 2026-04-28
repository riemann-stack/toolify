import Link from 'next/link'
import BakerPercentClient from './BakerPercentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/baker-percent',
  title: '베이커 퍼센트 계산기 — 제빵 배합비·수분율·르방 자동 계산',
  description: '밀가루를 100% 기준으로 물·소금·이스트·설탕·버터의 베이커 퍼센트와 수분율을 자동 계산합니다. 식빵·바게트·치아바타·사워도우·피자 등 8가지 빵 프리셋 제공.',
  keywords: ['베이커퍼센트', '제빵배합비', '제빵계산기', '수분율계산', '하이드레이션', '사워도우배합', '바게트레시피', '르방계산', '제빵퍼센트'],
})

export default function BakerPercentPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥖 베이커 퍼센트 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        밀가루를 100% 기준으로 <strong style={{ color: 'var(--text)' }}>물·소금·이스트·설탕·버터의 베이커 퍼센트</strong>와 수분율을 자동 계산합니다.
        식빵·바게트·치아바타·사워도우·피자 등 <strong style={{ color: 'var(--text)' }}>8가지 빵 프리셋</strong>, 르방 분리 계산, 즐겨찾기 저장 지원.
      </p>

      <BakerPercentClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 베이커 퍼센트란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            베이커 퍼센트(Baker&apos;s Percentage)란?
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
            <div><span style={{ color: 'var(--muted)' }}>베이커 %</span> = (재료 무게 ÷ 밀가루 무게) × 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 밀가루를 항상 100%로 두고 다른 재료의 비율을 표시</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>장점:</strong>
            <ul style={{ paddingLeft: 20, margin: '6px 0 0' }}>
              <li>레시피 스케일 변경이 쉬움 (반죽량 조절만으로 재료 자동 비례)</li>
              <li>다른 레시피와 직관적 비교 가능 (수분율·소금 비율 등)</li>
              <li>전문 베이커들의 표준 표기법</li>
            </ul>
          </div>
        </div>

        {/* ── 2. 빵 종류별 표준 배합 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            빵 종류별 표준 배합비 (참고용)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['빵 종류', '수분율', '소금', '이스트', '특징'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i <= 3 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '식빵',     h: '60~65%', s: '2%',   y: '1%',    f: '부드러움, 단맛' },
                  { n: '바게트',   h: '65~70%', s: '2%',   y: '0.5%',  f: '4가지 재료' },
                  { n: '치아바타', h: '75~80%', s: '2%',   y: '0.5%',  f: '고수분, 큰 기공' },
                  { n: '사워도우', h: '70~80%', s: '2%',   y: '0% (르방)', f: '천연발효' },
                  { n: '피자 도우', h: '55~65%', s: '2.5%', y: '0.3%',  f: '짭짤, 얇음' },
                  { n: '베이글',   h: '50~55%', s: '2%',   y: '1%',    f: '쫄깃, 저수분' },
                  { n: '크루아상', h: '50~55%', s: '2%',   y: '1%',    f: '버터 라미네이션' },
                  { n: '브리오슈', h: '60%',    s: '2%',   y: '1%',    f: '버터·계란 풍부' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.h}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.y}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 일반적인 참고값이며, 레시피마다 차이가 있을 수 있습니다.
          </p>
        </div>

        {/* ── 3. 수분율 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            수분율(Hydration) 가이드
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            marginBottom: 12,
          }}>
            <span style={{ color: 'var(--muted)' }}>수분율</span> = (액체 총량 ÷ 밀가루 총량) × 100
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { r: '50~60%', t: '저수분',     c: '#3EFF9B', d: '베이글·비스킷·페이스트리. 다루기 쉬움.' },
              { r: '60~70%', t: '표준',       c: 'var(--accent)', d: '식빵·단과자빵·일반 발효빵.' },
              { r: '70~80%', t: '고수분',     c: '#FF8C3E', d: '치아바타·캄파뉴·일부 사워도우. 큰 기공.' },
              { r: '80%+',   t: '매우 고수분', c: '#FF6B6B', d: '포카치아·하이드라 사워도우. 다루기 어려움.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>{g.r}</p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.05)',
            border: '1px solid rgba(62,200,255,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            💡 고수분일수록 <strong style={{ color: '#3EC8FF' }}>큰 기공·촉촉한 식감</strong>이지만,
            반죽이 끈적해 다루기 어려워지고 발효 시간이 길어질 수 있습니다.
          </div>
        </div>

        {/* ── 4. 소금·이스트 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            소금·이스트 비율 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FFD93E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FFD93E', fontWeight: 700, marginBottom: 8 }}>🧂 소금 (밀가루 대비)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>1.8~2.2%</strong>: 일반적인 제빵 범위</li>
                <li>1% 이하: 맛 밋밋, 발효 조절 어려움</li>
                <li>3% 이상: 짠맛 강함, 이스트 활동 억제</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #9B59B6', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#C485E0', fontWeight: 700, marginBottom: 8 }}>🧫 이스트 (인스턴트 드라이 기준)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>0.3~0.5%: 장시간 저온발효 (12시간+)</li>
                <li><strong>0.5~1%</strong>: 일반 표준</li>
                <li>1~2%: 빠른 발효 (1~2시간)</li>
                <li>2%+: 매우 빠른 발효 (단과자빵)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 이스트 변환표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이스트 종류 변환표 (인스턴트 드라이 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '환산 비율', '5g 기준'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '인스턴트 드라이', r: '× 1',     v: '5g' },
                  { t: '액티브 드라이',   r: '× 1.25',  v: '6.25g' },
                  { t: '생이스트',         r: '× 3',     v: '15g' },
                  { t: '천연발효종 (르방)', r: '별도 계산', v: '약 100~150g' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#C485E0', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 액티브 드라이는 따뜻한 물에 활성화 필요 · 생이스트는 냉장 보관, 유효기간 짧음
          </p>
        </div>

        {/* ── 6. 르방·프리퍼먼트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            르방·프리퍼먼트 활용
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { n: '르방 (Levain)',   d: '천연발효종 · 수분율 100% 일반' },
              { n: '폴리쉬 (Poolish)',d: '100% 수분율 · 12~16시간 발효' },
              { n: '비가 (Biga)',     d: '50~60% 수분율 · 단단한 형태' },
              { n: '풀리시 (Sponge)', d: '50~60% 수분율 · 짧은 발효' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, marginBottom: 6 }}>{c.n}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ✅ <strong style={{ color: 'var(--accent)' }}>계산 시 주의:</strong> 프리퍼먼트 안의 밀가루·물을 본반죽에 합산해야 정확한 전체 수분율이 나옵니다.
            본 계산기 <strong>르방·프리퍼먼트 탭</strong>에서 자동 분리 계산.
          </div>
        </div>

        {/* ── 7. 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            베이커 퍼센트 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📐 레시피 스케일 조정', d: '식빵 1개(500g) → 식빵 3개(1500g): 베이커 퍼센트는 그대로, 무게만 비례 증가' },
              { t: '🔍 다른 레시피 비교',   d: '"이 식빵은 수분율 65%, 저 식빵은 70%" — 베이커 퍼센트로 변환하면 직관적' },
              { t: '🧪 배합 실험',          d: '수분율 5% 단위 조정, 소금·이스트 미세 조정으로 자신만의 레시피 찾기' },
              { t: '⭐ 즐겨찾기 저장',      d: '본 계산기에서 최대 20개 레시피 저장 가능 (브라우저 localStorage)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
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
                q: '베이커 퍼센트의 합이 왜 100%를 넘나요?',
                a: '베이커 퍼센트는 <strong>밀가루를 100% 기준</strong>으로 다른 재료의 비율을 표시하는 방식입니다. 밀가루 외의 재료가 더해지면 합계가 자연스럽게 100%를 넘게 됩니다. 예를 들어 식빵 일반 배합은 약 180~190%, 브리오슈는 240%까지 갑니다. 합이 클수록 부재료(설탕·버터·계란)가 풍부한 빵이라는 뜻입니다.',
              },
              {
                q: '수분율 70%와 65%의 차이는 큰가요?',
                a: '수분율 5% 차이는 <strong>식감에 큰 영향</strong>을 줍니다. 65%는 표준 식빵으로 다루기 쉽고 균일한 결을 가집니다. 70%는 약간 촉촉하고 기공이 큰 편이며 반죽이 약간 더 부드럽습니다. 75% 이상은 본격 고수분 빵(치아바타·사워도우)으로 다루기 어려워지지만 훨씬 큰 기공과 촉촉한 식감을 얻을 수 있습니다. 처음 도전한다면 <strong>65% 정도부터 시작</strong>하는 것이 권장됩니다.',
              },
              {
                q: '사워도우는 왜 일반 빵보다 수분율이 높나요?',
                a: '사워도우는 <strong>르방(천연발효종)을 사용하는데, 르방 자체가 수분율 100% 정도</strong>로 많은 수분을 포함하고 있습니다. 또한 사워도우 특유의 큰 기공과 촉촉한 크럼(속살)을 만들기 위해서는 70~80%의 고수분이 필요합니다. 르방을 별도로 계산하지 않고 본반죽 수분율만 보면 실제 전체 수분율보다 낮게 보일 수 있어, 본 계산기에서는 르방 안의 밀가루·물을 분리해 정확한 전체 수분율을 계산합니다.',
              },
              {
                q: '소금을 빼고 빵을 만들면 안 되나요?',
                a: '<strong>가능하지만 권장되지 않습니다.</strong> 소금은 단순히 맛을 위한 것이 아니라 ① 글루텐 강화(빵 구조 형성), ② 이스트 활동 조절(과발효 방지), ③ 풍미 향상의 역할을 합니다. 소금 없이 빵을 만들면 발효가 너무 빠르게 진행되고 풍미가 떨어집니다. 저염 빵을 원한다면 1% 정도까지 줄이는 것이 좋고, 완전히 빼는 것은 비권장입니다.',
              },
              {
                q: '베이커 퍼센트로 표시된 레시피를 어떻게 읽나요?',
                a: '모든 % 값을 <strong>밀가루 100% 기준</strong>으로 해석하면 됩니다. 예시: "밀가루 100%, 물 70%, 소금 2%, 이스트 1%" → 밀가루 500g 사용 시: 물 350g(500의 70%), 소금 10g, 이스트 5g. 반대로 직접 만들 빵의 양을 정하고 역산할 수도 있습니다. 목표 반죽량 900g, 총 배합률 180% → 밀가루 = 900 ÷ 1.8 = 500g. 본 계산기의 4개 탭에서 양방향 변환을 모두 지원합니다.',
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
              { href: '/tools/cooking/sourdough',     icon: '🍞', name: '사워도우 스타터 계산기', desc: '르방 안정화·피크 시간·급이 스케줄' },
              { href: '/tools/cooking/recipe',        icon: '📐', name: '레시피 비율 계산기',     desc: '인분 수에 맞게 재료 비율 자동' },
              { href: '/tools/cooking/serving',       icon: '🍽️', name: '1인분 분량 계산기',       desc: '파스타·고기·쌀 분량 가이드' },
              { href: '/tools/cooking/food-storage',  icon: '🧊', name: '식재료 보관 기간 계산기', desc: '냉장·냉동 보관 기간 추적' },
              { href: '/tools/cooking/substitute',    icon: '🔄', name: '식재료 대체 비율 계산기', desc: '버터·설탕·계란 대체 비율' },
              { href: '/tools/unit/weight',           icon: '⚖️', name: '무게 변환기',             desc: 'kg·g·lb·oz·근·돈 변환' },
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
