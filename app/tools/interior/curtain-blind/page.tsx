import Link from 'next/link'
import CurtainBlindClient from './CurtainBlindClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/curtain-blind',
  title: '커튼·블라인드 사이즈 계산기 — 창문 측정·주문 사이즈',
  description: '창문 가로·세로로 커튼·블라인드·롤스크린·로만쉐이드·버티칼 추천 사이즈를 계산합니다. 주름 2배, 봉 길이, 인사이드·아웃사이드 마운트, 측정법 가이드.',
  keywords: ['커튼사이즈계산', '블라인드사이즈', '커튼길이추천', '커튼주름2배', '블라인드재는법', '롤스크린사이즈', '커튼봉길이', '커튼주문사이즈'],
})

export default function CurtainBlindPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪟 커튼·블라인드 사이즈 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        창문 가로·세로를 입력하면 <strong style={{ color: 'var(--text)' }}>커튼·블라인드·롤스크린·로만쉐이드·버티칼</strong> 5종 추천 사이즈를 계산합니다.
        주름 2배·봉 길이·인사이드/아웃사이드 마운트 자동 반영, 측정법 가이드 포함.
      </p>

      <CurtainBlindClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            커튼·블라인드 사이즈 핵심 공식
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
            <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>커튼</div>
            <div><span style={{ color: 'var(--muted)' }}>봉 길이</span> = 창문 폭 + 30cm (좌우 15cm씩)</div>
            <div><span style={{ color: 'var(--muted)' }}>커튼 폭</span> = 봉 길이 × 주름 배수 (1.5~3배)</div>
            <div><span style={{ color: 'var(--muted)' }}>1패널당 폭</span> = 커튼 폭 ÷ 패널 수</div>
            <div><span style={{ color: 'var(--muted)' }}>커튼 길이</span> = 봉 위치 ~ 끝 + 헴 10cm</div>
            <div style={{ marginTop: 14, color: '#3EC8FF', fontWeight: 700 }}>블라인드 (인사이드)</div>
            <div><span style={{ color: 'var(--muted)' }}>폭</span> = 창문 안쪽 폭 − 1cm</div>
            <div><span style={{ color: 'var(--muted)' }}>길이</span> = 창문 안쪽 높이 − 0.5cm</div>
            <div style={{ marginTop: 14, color: '#FF8C3E', fontWeight: 700 }}>블라인드 (아웃사이드)</div>
            <div><span style={{ color: 'var(--muted)' }}>폭</span> = 창문 폭 + 10cm</div>
            <div><span style={{ color: 'var(--muted)' }}>길이</span> = 창문 높이 + 10cm</div>
          </div>
        </div>

        {/* ── 2. 한국 표준 창문 크기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 가정 표준 창문 크기
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['창문 종류', '가로 (cm)', '세로 (cm)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '일반 방 창',          w: '120~180', h: '120~150' },
                  { t: '거실 창 (소형)',      w: '200~250', h: '150' },
                  { t: '거실 창 (대형)',      w: '300~400', h: '200' },
                  { t: '전면 거실 창',        w: '400~500', h: '230' },
                  { t: '베란다 창',           w: '150',     h: '200~230' },
                  { t: '욕실 창',             w: '60~90',   h: '60~90' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 주름 배수 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎀 주름 배수 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { p: '×1.5', c: '#3EC8FF', t: '가벼운 주름',     d: '미니멀, 시어 커튼' },
              { p: '×2.0', c: 'var(--accent)', t: '한국 표준',  d: '풍성, 일반 거실·침실' },
              { p: '×2.5', c: '#FF8C3E', t: '매우 풍성',       d: '호텔 스타일' },
              { p: '×3.0', c: '#FF6B6B', t: '가장 풍성',       d: '고급 인테리어·암막' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.p}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 커튼 길이 옵션 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📏 커튼 길이 옵션 비교
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { i: '🪟', t: '창문형 (창문 + 10cm)',         d: '창문만 가리는 짧은 커튼. 작은 창문·주방·욕실에 적합.', c: '#3EC8FF' },
              { i: '🦵', t: '무릎형 (바닥 ~ 무릎)',          d: '한국에서는 비추천. 가구가 많은 공간에서 사용.', c: '#FF8C3E' },
              { i: '✨', t: '바닥형 (바닥 5cm 위) — 한국 표준', d: '깔끔한 인상, 청소 편함. 거실·침실 모두 적합.', c: 'var(--accent)' },
              { i: '👑', t: '바닥 닿기 / 풀링 (+15cm)',     d: '호텔·고급 인테리어. 우아하지만 청소 어려움.', c: '#9B59B6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{s.i}</span>
                <div>
                  <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 설치 방식별 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🔧 설치 방식별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '🟪 천장 매립 (커튼박스)',  c: '#9B59B6', d: '신축 아파트에 자주 있음. 가장 깔끔, 천장이 높아 보임. 길이는 천장 ~ 바닥까지.' },
              { t: '🟨 천장 부착',              c: '#FFD700', d: '봉·레일을 천장에 직접. 콘크리트는 앵커, 석고보드는 보강 필수. 시각적으로 천장 높이 강조.' },
              { t: '⬜ 벽면 부착 (가장 일반적)', c: 'var(--accent)', d: '창문 위 벽에 봉·브래킷 설치. 창문 상단 +10~15cm 위 부착. 시공이 가장 쉬움.' },
              { t: '🔷 창문틀 안 (인사이드)',   c: '#3EC8FF', d: '깔끔하고 미니멀. 창문틀 깊이 6cm 이상 필요. 빛이 좌우 가장자리로 새는 단점.' },
              { t: '🔶 창문틀 밖 (아웃사이드)', c: '#FF8C3E', d: '빛 차단 효과 우수. 작은 창을 크게 보이게 함. 시각적 임팩트 큼.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 6 }}>{s.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 측정 시 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 측정 시 주의사항
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>창문 <strong>3지점(좌·중·우) 측정</strong> 후 가장 작은 값 사용</li>
              <li>줄자는 <strong>수평·수직 정확히</strong> (기울어지면 1~2cm 오차)</li>
              <li>창문 가까이의 <strong>가구·라디에이터 위치 확인</strong></li>
              <li>오래된 집에서 창문 모서리가 <strong>직각이 아닌 경우</strong> 추가 여유 필요</li>
              <li>인사이드 마운트는 <strong>창문틀 깊이 6cm 이상</strong> 확인 필수</li>
            </ul>
          </div>
        </div>

        {/* ── 7. 커튼 vs 블라인드 vs 롤스크린 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🤔 어떤 걸 골라야 할까?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🪟', t: '커튼',       c: 'var(--accent)', d: '거실·침실, 포근한 느낌, 풍성한 인테리어, 단열·방음 우수' },
              { i: '🎚️', t: '블라인드',  c: '#3EC8FF',       d: '사무실·미니멀, 큰 창문(버티칼), 빛 양 세밀 조절' },
              { i: '📜', t: '롤스크린',   c: '#FFD700',       d: '욕실·주방·작은 창, 단순한 인테리어, 가성비' },
              { i: '🧵', t: '로만쉐이드', c: '#9B59B6',       d: '커튼 분위기 + 블라인드 기능, 침실·소형 창문' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 14, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
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
                q: '커튼 주름은 몇 배가 좋은가요?',
                a: '한국 표준은 <strong>2배 주름</strong>입니다. 봉 길이가 200cm라면 커튼 전체 폭은 400cm가 됩니다. 1.5배는 가벼운 자연 주름, 2.5~3배는 호텔 스타일의 매우 풍성한 주름입니다. 일반 가정 거실·침실은 2배가 가장 안정적이고, 시어 커튼은 1.5~2배, 암막 커튼은 2~2.5배를 권장합니다.',
              },
              {
                q: '블라인드는 창문 안쪽과 바깥쪽 중 어디에 다는 게 좋나요?',
                a: '인테리어 스타일과 빛 차단 정도에 따라 다릅니다. <strong>인사이드 마운트(창문 안쪽)</strong>는 깔끔하지만 좌우 가장자리로 빛이 샙니다. <strong>아웃사이드 마운트(창문 바깥쪽)</strong>는 빛 차단이 우수하고 작은 창을 크게 보이게 합니다. 창문틀 깊이가 6cm 미만이면 인사이드 설치가 어려우니 아웃사이드를 선택하세요.',
              },
              {
                q: '커튼봉은 창문보다 얼마나 길어야 하나요?',
                a: '일반적으로 <strong>창문 폭 + 좌우 15cm씩 = 총 30cm 더 길게</strong> 합니다. 이렇게 하면 커튼을 활짝 열었을 때 창문이 완전히 보이고 빛이 충분히 들어옵니다. 더 시각적 효과를 원한다면 좌우 20cm씩(총 40cm) 더 길게 할 수도 있습니다.',
              },
              {
                q: '커튼 길이는 어디까지가 일반적인가요?',
                a: '한국에서 가장 인기 있는 길이는 <strong>"바닥에서 5cm 위"</strong>입니다. 깔끔한 인상을 주고 청소가 편리합니다. 호텔이나 고급 인테리어를 원한다면 "바닥에 닿거나 +15cm 풀링"을 선택할 수 있지만 청소가 어렵고 먼지가 쌓이기 쉽습니다. 창문이 작거나 라디에이터·가구가 있는 경우 "창문 + 10cm" 짧은 길이도 좋습니다.',
              },
              {
                q: '큰 거실 창문은 커튼 패널을 몇 장 해야 하나요?',
                a: '• 가로 200cm 이하: <strong>양쪽 한 쌍 (좌·우 각 1장)</strong><br/>• 가로 200~350cm: 양쪽 한 쌍 (각 패널 폭 200~350cm)<br/>• 가로 350cm 이상: <strong>3분할 (양쪽 + 중앙) 또는 4분할</strong><br/>패널이 너무 넓으면 무게 때문에 봉이 휘거나 작동이 어려워지므로 1패널당 폭 200cm 이하를 권장합니다.',
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
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 소요량 계산기',   desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',     icon: '🎨', name: '페인트 소요량 계산기', desc: '벽·천장 페인트 양·구매 조합' },
              { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기',     desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 ↔ ㎡ 변환기',    desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/length',        icon: '📏', name: '길이 변환기',          desc: 'cm·m·inch·ft 변환' },
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
