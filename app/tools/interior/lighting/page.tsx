import Link from 'next/link'
import LightingClient from './LightingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/lighting',
  title: '조명 밝기 계산기 — 방 면적 루멘·조명 개수·W↔lm 환산',
  description: '거실·침실·서재 등 공간별 권장 루멘과 필요한 조명 개수를 계산합니다. 백열전구·형광등·LED 와트↔루멘 환산, 색온도 가이드, 한국 LED 제품 프리셋.',
  keywords: ['조명밝기계산기', '방조명루멘', '거실조명개수', 'W루멘환산', '조명개수계산', 'LED루멘', '색온도가이드', '루멘계산'],
})

export default function LightingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💡 조명 밝기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        방 면적과 공간 용도를 입력하면 한국 KS 기준 <strong style={{ color: 'var(--text)' }}>권장 루멘과 필요한 조명 개수</strong>를 계산합니다.
        12개 공간별 권장 lux·색온도, W↔루멘 환산, LED 제품 추천, 연간 전기료 절감액까지 한 화면에서.
      </p>

      <LightingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            조명 밝기 핵심 공식
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
            <div><span style={{ color: 'var(--muted)' }}>필요 총 루멘</span> = 면적(㎡) × 권장 lux × 보정 계수</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 조명 개수</span> = 필요 총 루멘 ÷ 1개당 루멘</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 1 lux = 1 lumen / ㎡ (단위 면적당 빛의 양)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 거실 16.5㎡, 권장 300 lux<br />
            • 필요 루멘 = 16.5 × 300 = <strong style={{ color: 'var(--accent)' }}>4,950 lm</strong><br />
            • LED 15W (1,500 lm) 사용 시 → <strong style={{ color: 'var(--accent)' }}>4개</strong> 필요
          </div>
        </div>

        {/* ── 2. 공간별 권장 lux ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 공간별 권장 lux (KS A 3011)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공간', '권장 lux', '주요 용도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '거실',          l: '200~400 lux',   u: '가족 활동 중심' },
                  { s: '침실',          l: '100~200 lux',   u: '편안함·수면' },
                  { s: '서재·공부방',   l: '400~600 lux',   u: '집중력' },
                  { s: '아이 공부방',   l: '500~700 lux',   u: '시력 보호' },
                  { s: '주방',          l: '400~600 lux',   u: '음식 색감' },
                  { s: '다이닝',        l: '150~300 lux',   u: '음식 맛' },
                  { s: '욕실',          l: '200~400 lux',   u: '거울 양옆 추가' },
                  { s: '복도·현관',     l: '75~150 lux',    u: '안전' },
                  { s: '홈오피스',      l: '400~750 lux',   u: '눈 피로 적게' },
                  { s: '작업실·DIY',    l: '500~1000 lux',  u: '정밀 작업' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. W vs lm vs lux ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚡ 와트(W) vs 루멘(lm) vs lux — 차이 이해
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: 14 }}>
            {[
              { i: '⚡', t: '와트 (W)',     d: '전력 소비량 (전기 사용)', c: '#FF6B6B' },
              { i: '💡', t: '루멘 (lm)',    d: '빛의 양 (밝기)',           c: 'var(--accent)' },
              { i: '📐', t: 'lux',         d: '단위 면적당 빛의 양 (lm/㎡)', c: '#3EC8FF' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(232,151,87,0.06)',
            border: '1px solid rgba(232,151,87,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            💡 <strong style={{ color: '#E89757' }}>과거 백열전구 시대</strong>에는 W가 밝기 표시 역할을 했지만, <strong style={{ color: 'var(--accent)' }}>LED 시대에는 W ≠ 밝기</strong>입니다. 같은 W라도 LED는 백열전구의 약 8배 밝아요. 반드시 <strong style={{ color: 'var(--text)' }}>루멘(lm)</strong>으로 비교하세요.
          </div>
        </div>

        {/* ── 4. W ↔ lm 환산표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            W ↔ 루멘 환산 빠른 참조표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['루멘', '백열전구', '할로겐', '형광등', 'LED'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { lm: 250,  inc: '25W',  hal: '14W',  fluo: '4W',   led: '2.5W' },
                  { lm: 450,  inc: '40W',  hal: '25W',  fluo: '7W',   led: '4.5W' },
                  { lm: 800,  inc: '60W',  hal: '45W',  fluo: '13W',  led: '8W' },
                  { lm: 1100, inc: '75W',  hal: '60W',  fluo: '17W',  led: '11W' },
                  { lm: 1600, inc: '100W', hal: '90W',  fluo: '25W',  led: '16W' },
                  { lm: 2600, inc: '150W', hal: '145W', fluo: '40W',  led: '26W' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r.lm.toLocaleString()} lm</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.inc}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.hal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFD700', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.fluo}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.led}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>LED는 백열전구의 약 1/8 전력</strong>으로 같은 밝기 → 연간 전기료 약 80% 절감, 수명 25~40배 길음.
          </p>
        </div>

        {/* ── 5. 색온도 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎨 색온도 가이드 (Kelvin)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { k: '2700~3000K', n: '전구색 (웜화이트)',     color: '#FFB870', vibe: '따뜻한 황색', use: '침실·다이닝·카페·휴식' },
              { k: '3500~4000K', n: '주백색 (내추럴화이트)', color: '#FFE0B0', vibe: '자연스러운 백색', use: '거실·복도·욕실·일상' },
              { k: '5000~6500K', n: '주광색 (쿨화이트)',     color: '#B0D8FF', vibe: '푸른빛 백색', use: '서재·주방·작업실·집중' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.k}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{s.n}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{s.vibe}</p>
                <p style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>{s.use}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 한국 LED 표준 와트 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🇰🇷 한국 LED 시장 표준 와트 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { s: '소형',     w: '6~9W',     lm: '600~900 lm',     u: '작은방·복도', c: '#3EC8FF' },
              { s: '중형',     w: '12~15W',   lm: '1,200~1,500 lm', u: '침실·서재',   c: 'var(--accent)' },
              { s: '대형',     w: '30~50W',   lm: '3,000~5,000 lm', u: '거실·큰방',   c: '#FF8C3E' },
              { s: '초대형',   w: '50~75W',   lm: '5,000~7,500 lm', u: '대형 거실',   c: '#FF6B6B' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.s}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{s.w}</p>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{s.lm}</p>
                <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>{s.u}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 조명 종류별 활용 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            💡 조명 종류별 활용 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { i: '🔆', t: '메인 조명 (천장등·실링팬)', d: '공간 전체 균일 밝기. 권장 루멘의 70~80% 차지. 방 중앙·격자 배치.', c: 'var(--accent)' },
              { i: '✨', t: '보조 조명 (펜던트·다운라이트·테이블 램프)', d: '특정 공간·작업 강조. 식탁 위 펜던트, 책상 위 스탠드. 색온도 차별화 가능.', c: '#3EC8FF' },
              { i: '🌙', t: '무드 조명 (간접·LED 스트립·플로어 램프)', d: '분위기 연출. 색온도 2700~3000K 권장. 가구 뒤·벽면 코브에 설치.', c: '#9B59B6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: s.c, fontWeight: 700, marginBottom: 6 }}>{s.i} {s.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            💡 <strong style={{ color: 'var(--accent)' }}>조명 3종 권장 비율</strong> — 메인 70% + 보조 20% + 무드 10%
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
                q: '거실에는 몇 와트 LED 조명이 필요한가요?',
                a: '거실 면적과 천장 높이에 따라 다릅니다. 일반적으로 <strong>5평(16.5㎡) 거실은 LED 30~50W (3,000~5,000 lm)</strong>가 적정합니다. 10평 거실은 LED 50~75W가 권장되며, 메인 조명 1개 + 보조 조명 2~3개 조합이 좋습니다. 한국 KS 기준 거실 권장 밝기는 200~400 lux이며, 너무 밝으면 눈이 피로하고 너무 어두우면 활동에 지장이 있습니다.',
              },
              {
                q: '백열전구 60W는 LED 몇 W와 같은 밝기인가요?',
                a: '백열전구 60W는 약 <strong>720 루멘</strong>이며, LED로는 약 <strong>7~8W</strong>에 해당합니다. LED는 같은 밝기를 내는 데 백열전구의 약 1/8 전력만 사용해 매우 효율적입니다. 예를 들어 60W 백열전구를 7W LED로 교체하면 연간 전기료를 약 <strong>80% 절감</strong>할 수 있고 수명도 25~40배 깁니다.',
              },
              {
                q: '침실은 왜 다른 공간보다 어둡게 권장되나요?',
                a: '침실은 휴식과 수면을 위한 공간이라 <strong>100~200 lux의 낮은 밝기</strong>가 권장됩니다. 너무 밝으면 멜라토닌 분비가 억제되어 수면에 방해됩니다. 특히 자기 전 1~2시간 전부터는 색온도가 낮은 <strong>전구색(2700K)</strong> 조명을 사용하면 자연스러운 수면 유도에 도움이 됩니다.',
              },
              {
                q: '색온도 3000K, 4000K, 6500K 중 어떤 걸 선택해야 하나요?',
                a: '공간 용도에 따라 선택합니다.<br/>• <strong>2700~3000K(전구색)</strong>: 침실·다이닝·휴식 공간 — 따뜻하고 편안<br/>• <strong>3500~4000K(주백색)</strong>: 거실·복도·욕실 — 자연스러운 일상<br/>• <strong>5000~6500K(주광색)</strong>: 서재·주방·작업실 — 집중력·정밀 작업<br/>한 공간에 색온도 조절 가능한 LED를 사용하면 시간대별로 변경할 수 있어 유용합니다.',
              },
              {
                q: '간접 조명은 메인 조명보다 더 밝게 해야 하나요?',
                a: '네. <strong>간접 조명은 빛이 벽이나 천장에 반사되어 사용</strong>되므로 직접 조명에 비해 약 50% 더 많은 루멘이 필요합니다. 예를 들어 거실 4,950 lm이 필요한 경우 간접 조명만으로는 약 <strong>7,400 lm</strong>이 필요합니다. 가장 좋은 방법은 메인(직접) + 보조(간접) 혼합 조명을 구성해 균일한 밝기와 분위기를 동시에 얻는 것입니다.',
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
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/unit/area',              icon: '🏠', name: '평수 ↔ ㎡ 변환기',          desc: '아파트 면적 단위 변환' },
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
