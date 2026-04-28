import Link from 'next/link'
import PaintClient from './PaintClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/paint',
  title: '페인트 소요량 계산기 — 벽·천장 페인트 양·구매 조합',
  description: '방 크기와 칠할 부위로 필요한 페인트 양을 계산합니다. 수성·유성·에나멜·친환경 페인트별 도장 면적, 한국 브랜드 프리셋, 4L+2L 구매 조합 추천.',
  keywords: ['페인트계산기', '페인트소요량', '페인트양계산', '셀프페인트', '수성페인트', '벽페인트', '천장페인트', '페인트견적'],
})

export default function PaintPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎨 페인트 소요량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        방 크기·천장 높이·칠할 부위(벽/천장/문/창틀)를 입력하면 한국 표준 페인트 기준 <strong style={{ color: 'var(--text)' }}>필요 페인트 양과 시판 용량 구매 조합</strong>을 계산합니다.
        간편 모드 · 방·벽별 상세 모드 · 셀프 vs 전문 비용 견적까지 한 번에.
      </p>

      <PaintClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페인트 소요량 핵심 공식
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
            <div><span style={{ color: 'var(--muted)' }}>도장 면적</span> = 벽·천장·문·창틀 면적 합 (창문·문 차감)</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 페인트 (L)</span> = (도장 면적 × 칠할 횟수) ÷ 1L당 도장 면적</div>
            <div><span style={{ color: 'var(--muted)' }}>여유분 포함</span> = 위 값 × (1 + 로스율 / 100)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 도장 면적 28㎡, 2회 도장, 수성 페인트 (1L=10㎡)<br />
            • 면적 × 회수 = 28 × 2 = <strong style={{ color: 'var(--text)' }}>56㎡</strong><br />
            • 56 ÷ 10 = <strong style={{ color: 'var(--text)' }}>5.6L</strong><br />
            • 10% 여유: <strong style={{ color: 'var(--accent)' }}>6.16L</strong> → 추천 <strong style={{ color: 'var(--accent)' }}>4L 1통 + 2L 1통 + 1L 1통 = 7L</strong>
          </div>
        </div>

        {/* ── 2. 페인트 종류별 1L당 도장 면적 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 페인트 종류별 1L당 도장 면적
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '1L당 면적 (1회)', '추천 용도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'center' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '수성 페인트',         a: '9~10㎡',  u: '실내 벽·천장',           c: 'var(--accent)' },
                  { t: '유성 페인트',         a: '11~13㎡', u: '나무·금속',              c: '#FF8C3E' },
                  { t: '에나멜',              a: '13~15㎡', u: '문·창틀·가구',          c: '#FFD700' },
                  { t: '외부용',              a: '7~9㎡',   u: '외벽·옥상',              c: '#3EC8FF' },
                  { t: '프라이머',            a: '8~10㎡',  u: '밑칠 (도장 전 처리)',   c: '#E89757' },
                  { t: '친환경 (저VOC)',      a: '9~10㎡',  u: '아이방·민감자',          c: '#3EFF9B' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 평수별 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수별 페인트 양 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            천장 2.4m, 창문·문 1개씩, <strong style={{ color: 'var(--text)' }}>벽만 2회 도장</strong>, 10% 로스율, 수성 페인트 기준
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '도장 면적', '필요 페인트', '추천 구매'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '5평',   a: '25㎡',  l: '5.5L',  rec: '4L + 2L = 6L' },
                  { p: '7평',   a: '32㎡',  l: '7.0L',  rec: '4L + 4L = 8L 또는 4L + 2L + 1L = 7L' },
                  { p: '10평',  a: '42㎡',  l: '9.2L',  rec: '4L + 4L + 1L = 9L (부족) → 18L 1통' },
                  { p: '15평',  a: '58㎡',  l: '12.8L', rec: '4L × 4 = 16L 또는 18L 1통' },
                  { p: '20평',  a: '75㎡',  l: '16.5L', rec: '18L 1통' },
                  { p: '24평',  a: '88㎡',  l: '19.4L', rec: '18L + 2L = 20L' },
                  { p: '30평',  a: '110㎡', l: '24.2L', rec: '18L + 4L + 2L = 24L (소폭 부족) 또는 18L + 4L + 4L' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontSize: '12px' }}>{r.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 시판 용량 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🥫 한국 페인트 시판 용량 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {[
              { s: '1L',  c: '#FFD700', t: '작은 면적·터치업·견본' },
              { s: '2L',  c: '#3EC8FF', t: '1방 부분 도장' },
              { s: '4L',  c: '#3EFF9B', t: '1방 전체 도장 (인기)' },
              { s: '18L', c: 'var(--accent)', t: '집 전체 도장 (대용량, 약 10~15% 저렴)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.s}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.t}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>경제적 조합 팁</strong> — 18L 1통이 4L 4통(16L) 보다 약 10~15% 저렴합니다. 16L 이상 필요 시 18L 단독 구매가 유리합니다.
          </p>
        </div>

        {/* ── 5. 면 종류별 흡수율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧱 면 종류별 흡수율 (도장 면적 보정)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🧱', t: '벽지 위 도장',     d: '1L당 면적 약 10% 감소',   color: '#FF8C3E' },
              { i: '🏗️', t: '시멘트 벽',        d: '첫 회 흡수율 매우 높음, 프라이머 필수', color: '#FF6B6B' },
              { i: '🪵', t: '나무 표면',        d: '흡수율 높음, 1.5배 가량 더 필요', color: '#E89757' },
              { i: '🔩', t: '금속·플라스틱',    d: '흡수율 거의 없음, 1L당 면적 1.2배', color: '#3EC8FF' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 시공 단계 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📋 페인트 시공 6단계 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '1', t: '표면 정리',     d: '먼지·기름 제거, 균열·구멍 메우기, 사포로 표면 거칠게 (페인트 부착력↑)' },
              { n: '2', t: '마스킹·커버',   d: '마스킹 테이프로 경계 처리, 바닥·가구는 비닐로 커버' },
              { n: '3', t: '프라이머 (선택)', d: '새 시멘트 벽, 색상 변경 시 필수. 나무 표면 사전 처리' },
              { n: '4', t: '1회 도장',      d: '롤러로 큰 면적, 붓으로 모서리·디테일' },
              { n: '5', t: '건조 (4~6시간)', d: '환기 필수, 완전 건조 전 2회 도장 ❌' },
              { n: '6', t: '2회 도장',      d: '균일한 색상·내구성 확보, 1회보다 훨씬 깨끗한 마감' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--accent)', minWidth: 24 }}>{s.n}</span>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 셀프 vs 전문 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🛠️ 셀프 페인트 vs 전문 시공
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>🔧 셀프 페인트</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>24평 기준 약 17~25만원 (재료비)</li>
                <li>시간: 2~3일 (천천히)</li>
                <li>만족도 매우 높음</li>
                <li>페인트는 도배보다 셀프 진입 쉬움</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>🏗️ 전문 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>24평 기준 약 80~120만원</li>
                <li>시간: 1~2일 (빠르게)</li>
                <li>깔끔한 마감</li>
                <li>평당 15,000~25,000원</li>
              </ul>
            </div>
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
                q: '24평 아파트 벽 페인트 시공에 페인트 몇 통이 필요한가요?',
                a: '24평 아파트 벽 전체를 2회 도장 시 약 <strong>18~22L</strong>가 필요합니다. 한국 표준 4L 통으로 약 5통 또는 18L 통 1개로 충분합니다. 천장까지 함께 도장한다면 25~30L로 늘어납니다. 벽지 제거 후 시공할지 벽지 위 도장할지에 따라 약간의 차이가 있습니다.',
              },
              {
                q: '페인트는 몇 회 도장해야 하나요?',
                a: '일반적으로 <strong>2회 도장이 한국 표준</strong>입니다. 1회 도장은 색이 균일하지 않거나 비치는 부분이 생길 수 있고, 3회는 진한 색 위에 옅은 색을 칠하거나 완전히 다른 색으로 변경할 때 필요합니다. 특히 흰색이나 매우 옅은 색은 3회 도장이 권장됩니다.',
              },
              {
                q: '페인트 1L로 몇 ㎡를 칠할 수 있나요?',
                a: '한국 표준 수성 페인트는 <strong>1L당 약 9~10㎡(1회 도장 기준)</strong>를 칠할 수 있습니다. 유성 페인트는 11~13㎡, 에나멜은 13~15㎡로 더 넓은 면적을 칠할 수 있습니다. 다만 표면 상태(매끄러움·흡수율)에 따라 실제 도장 면적은 ±15% 정도 차이 날 수 있어 여유분(10%)을 포함해 구매하는 것이 안전합니다.',
              },
              {
                q: '셀프 페인트 vs 도배, 어느 게 더 쉬운가요?',
                a: '<strong>페인트가 일반적으로 더 쉽습니다.</strong> 페인트는 롤러로 균일하게 칠하면 되고, 실수해도 다시 덧칠할 수 있어 초보자에게 친화적입니다. 다만 마스킹·바닥 보호 등 사전 작업이 중요합니다. 도배는 무늬 맞춤·기포 제거 등 기술이 필요해 더 까다롭습니다.',
              },
              {
                q: '페인트 시공 시 환기는 얼마나 해야 하나요?',
                a: '<strong>수성 페인트</strong>는 시공 중과 시공 후 24시간 환기가 권장됩니다. <strong>유성 페인트</strong>는 시너 냄새가 강해 시공 중 강제 환기 + 시공 후 48~72시간 환기가 필요합니다. 친환경 저VOC 페인트도 안전을 위해 12시간 이상 환기를 권장합니다. 특히 임산부·영유아·민감자는 친환경 페인트를 사용하고 충분히 환기 후 입실하세요.',
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
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 소요량 계산기',   desc: '벽지 롤 수·면적·셀프 시공 비용' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 ↔ ㎡ 변환기',    desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/length',        icon: '📏', name: '길이 변환기',          desc: 'cm·m·inch·ft 변환' },
              { href: '/tools/life/unit-price',    icon: '🏷️', name: '단가 비교 계산기',     desc: '페인트 가성비 단가 비교' },
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
            🚧 곧 출시 예정: 바닥재 소요량 계산기, 타일 소요량 계산기
          </p>
        </div>

      </div>
    </div>
  )
}
