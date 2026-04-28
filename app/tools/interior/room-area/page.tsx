import Link from 'next/link'
import RoomAreaClient from './RoomAreaClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/room-area',
  title: '공간 면적 계산기 — 벽·바닥·천장·평수·부피 한 번에',
  description: '방 크기로 벽 면적, 바닥 면적, 천장 면적, 평수, 공간 부피를 한 번에 계산합니다. 도배·페인트·에어컨·조명 시공 면적의 기본 도구.',
  keywords: ['공간면적계산기', '방면적계산', '벽면적계산기', '평수계산기', '바닥면적', '천장면적', '방크기계산', '인테리어면적'],
})

export default function RoomAreaPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 공간 면적 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        방 크기·천장 높이·창문·문을 입력하면 <strong style={{ color: 'var(--text)' }}>벽·바닥·천장·평수·부피·총 표면적</strong> 6가지를 한 번에 계산합니다.
        도배·페인트·에어컨·조명 시공의 모든 기초 면적을 한 화면에서.
      </p>

      <RoomAreaClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 6가지 면적 한눈에 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            공간 면적 6가지 한눈에 정리
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            같은 방의 면적을 6가지로 계산할 수 있습니다. 각 면적이 어떤 시공·계산에 사용되는지 정리한 표입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['면적 종류', '계산식', '활용'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '벽 면적 (전체)',   c: '둘레 × 천장 높이',         u: '단열·방음 계획',          color: '#3EC8FF' },
                  { t: '벽 면적 (실제)',   c: '전체 - 창문·문',           u: '도배·페인트',              color: 'var(--accent)' },
                  { t: '바닥 면적',        c: '가로 × 세로',               u: '장판·타일·바닥재',        color: '#C8FF3E' },
                  { t: '천장 면적',        c: '가로 × 세로 (바닥 동일)',  u: '천장 도배·조명 위치',     color: '#9B59B6' },
                  { t: '공간 부피',        c: '가로 × 세로 × 높이',        u: '에어컨 평형·환기',        color: '#FFD700' },
                  { t: '총 표면적',        c: '벽 + 바닥 + 천장',          u: '전체 시공 견적',           color: '#FF8C3E' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.color, fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: 12 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 평수 ↔ ㎡ 환산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수 ↔ ㎡ 환산
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: 13.5,
            color: 'var(--text)',
            lineHeight: 1.85,
            marginBottom: 14,
          }}>
            <p>1평 = <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>3.3058㎡</strong> (공식 환산값, 일본식 척관법 6자×6자 기준)</p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>1평 ≈ 3.3㎡ (간이 환산)</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '면적 (㎡)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['5평',  '16.5㎡'],
                  ['7평',  '23.1㎡'],
                  ['10평', '33.1㎡'],
                  ['15평', '49.6㎡'],
                  ['20평', '66.1㎡'],
                  ['24평', '79.3㎡'],
                  ['30평', '99.2㎡'],
                  ['40평', '132.2㎡'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 한국 아파트 천장 높이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 아파트 천장 높이 표준
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🏢', t: '일반 아파트',         h: '2.3~2.4m', color: '#3EC8FF' },
              { i: '🏬', t: '신축 아파트',         h: '2.4~2.5m', color: 'var(--accent)' },
              { i: '🏛️', t: '고급 아파트·단독',    h: '2.5~3.0m', color: '#3EFF9B' },
              { i: '🏤', t: '상가·사무실',         h: '2.7~3.0m', color: '#FFD700' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 14, color: s.color, fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{s.h}</p>
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
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            💡 <strong style={{ color: '#E89757' }}>천장 높이 0.1m 차이가 면적에 미치는 영향</strong> — 둘레 16m × 0.1m = <strong style={{ color: 'var(--accent)' }}>1.6㎡</strong> 추가 (벽 면적 기준)
          </div>
        </div>

        {/* ── 4. 시공별 활용 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🛠️ 시공별 활용 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { i: '🧱', t: '도배 시공',     d: '"실제 벽 면적"으로 벽지 롤 수 계산. 문·창문은 도배 X 차감.', color: '#C8FF3E' },
              { i: '🎨', t: '페인트 시공',   d: '"실제 벽 면적" + 천장 도장 시 천장 추가. 칠할 횟수 × 1L당 도장 면적.', color: '#FF8C3E' },
              { i: '🪵', t: '바닥재 시공',   d: '"바닥 면적"으로 마루·강마루·장판. 로스율 5~10% 추가.', color: '#3EFF9B' },
              { i: '🟦', t: '타일 시공',     d: '바닥 또는 벽의 면적 ÷ 타일 1개 면적. 줄눈·로스율 반영.', color: '#3EC8FF' },
              { i: '❄️', t: '에어컨 평형',  d: '"바닥 면적" 또는 "공간 부피". 1평당 약 100~150W 냉방 능력 권장.', color: '#9B59B6' },
              { i: '💡', t: '조명 밝기',     d: '"바닥 면적"으로 권장 루멘. 거실 300~400 lux × 면적.', color: '#FFD700' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 창문·문 차감 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🪟 창문·문 표준 크기 (차감 참고)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '한국 표준 크기', '면적'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 2 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '일반 방문',         s: '0.9m × 2.1m',  a: '1.89㎡' },
                  { t: '큰 거실문',         s: '1.0m × 2.1m',  a: '2.10㎡' },
                  { t: '베란다 문 (전면)',  s: '1.5m × 2.1m',  a: '3.15㎡' },
                  { t: '일반 창문',         s: '1.5m × 1.5m',  a: '2.25㎡' },
                  { t: '큰 거실 창문',      s: '2.4m × 1.5m',  a: '3.60㎡' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            <strong style={{ color: 'var(--accent)' }}>💡 계산 시 주의</strong><br />
            • <strong>도배·페인트</strong>는 창문·문 모두 차감<br />
            • <strong>단열·방음</strong>은 차감하지 않거나 별도 계산<br />
            • <strong>천장 도배</strong>는 창문·문과 무관 (천장 면적 그대로)
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '벽 면적을 왜 두 가지로 계산하나요?',
                a: '용도가 다르기 때문입니다. <strong>"전체 벽 면적"</strong>은 둘레 × 천장 높이로 단열·방음 계획 시 사용합니다. <strong>"실제 벽 면적"</strong>은 창문·문을 뺀 값으로 도배·페인트 시공 시 사용합니다. 같은 방이라도 어떤 시공을 하느냐에 따라 다른 면적을 사용합니다.',
              },
              {
                q: '평수와 ㎡ 환산이 정확한가요?',
                a: '<strong>1평은 정확히 3.3058㎡</strong>입니다 (일본식 척관법 기준 6자×6자). 간이 계산 시 1평 = 3.3㎡로 사용해도 큰 차이는 없지만, 대형 면적(30평 이상)에서는 정확한 값(3.3058)을 사용하는 것이 권장됩니다. 한국 부동산은 "공급면적"과 "전용면적"을 구분하므로 평수만으로는 실제 사용 면적을 정확히 알기 어렵습니다.',
              },
              {
                q: '천장 면적은 바닥 면적과 같나요?',
                a: '직사각형 방이라면 <strong>천장과 바닥 면적이 동일</strong>합니다 (가로 × 세로). 다만 다음 경우 차이가 납니다:<br/>• 천장에 등박스나 우물천장이 있는 경우 (천장 면적 ↑)<br/>• 복도·계단이 천장에 포함되는 경우<br/>• 천장 일부가 경사진 경우 (다락방 등)',
              },
              {
                q: '공간 부피는 언제 사용하나요?',
                a: '주로 <strong>에어컨 평형 계산과 환기 설계</strong>에 사용됩니다. 에어컨 냉방 능력은 부피(㎥)에 비례하며, 환기 시스템은 시간당 환기 횟수(공기 부피의 몇 배)로 계산합니다. 또한 단열재 두께·실내 음향 설계에도 부피가 활용됩니다.',
              },
              {
                q: '한국 아파트 평수와 실제 사용 평수가 다른 이유는?',
                a: '한국 아파트의 <strong>"공급면적"은 전용면적 + 공용면적</strong>(엘리베이터·복도 등)을 포함합니다. 예를 들어 24평 아파트는 보통 전용면적 약 18~20평 정도입니다. 본 계산기에서 입력하는 가로·세로는 실제 거주 공간(전용면적)이 기준이 됩니다. 정확한 면적은 등기부등본 또는 건축물대장에서 확인할 수 있습니다.',
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

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 소요량 계산기',   desc: '벽지 롤 수·면적·셀프 시공 비용' },
              { href: '/tools/interior/paint',     icon: '🎨', name: '페인트 소요량 계산기', desc: '벽·천장 페인트 양·구매 조합' },
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
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14, textAlign: 'center', fontStyle: 'italic' }}>
            🚧 곧 출시 예정: 바닥재 소요량·타일 소요량·에어컨 평형·조명 밝기 계산기
          </p>
        </div>

      </div>
    </div>
  )
}
