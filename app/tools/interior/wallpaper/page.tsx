import Link from 'next/link'
import WallpaperClient from './WallpaperClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/wallpaper',
  title: '도배 소요량 계산기 — 벽지 롤 수·면적·셀프 시공 비용',
  description: '방 크기와 천장 높이로 필요한 벽지 롤 수를 계산합니다. 실크·합지·PVC 벽지 표준, 창문·문 차감, 로스율 반영, 셀프·전문 시공 비용 견적.',
  keywords: ['도배계산기', '벽지소요량계산', '벽지롤수계산', '셀프도배', '실크벽지', '합지벽지', '도배비용계산', '벽지견적'],
})

export default function WallpaperPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧱 도배 소요량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        방 크기·천장 높이·창문·문을 입력하면 한국 표준 벽지(실크·합지·PVC) 기준 <strong style={{ color: 'var(--text)' }}>필요 롤 수와 시공 면적</strong>을 계산합니다.
        간편 모드 · 방·벽별 상세 모드 · 셀프 vs 전문 비용 견적까지 한 번에.
      </p>

      <WallpaperClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            도배 소요량 핵심 공식
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
            <div><span style={{ color: 'var(--muted)' }}>시공 면적</span> = (둘레 × 천장 높이) − 창문 면적 − 문 면적</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 벽지 면적</span> = 시공 면적 × (1 + 로스율 / 100)</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 롤 수</span> = 필요 벽지 면적 ÷ (벽지 폭 × 1롤 길이)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 방 4m × 4m, 천장 2.4m, 창 1.5×1.5, 문 0.9×2.1<br />
            • 둘레 16m × 2.4 = <strong style={{ color: 'var(--text)' }}>38.4㎡</strong><br />
            • 차감 후 시공 면적: 38.4 − 2.25 − 1.89 = <strong style={{ color: 'var(--text)' }}>34.26㎡</strong><br />
            • 10% 로스율: <strong style={{ color: 'var(--accent)' }}>37.69㎡</strong> → 실크벽지(1롤 16.5㎡) 기준 <strong style={{ color: 'var(--accent)' }}>3롤</strong>
          </div>
        </div>

        {/* ── 2. 벽지 종류별 표준 사이즈 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 벽지 종류별 표준 사이즈
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🧵', name: '실크벽지', spec: '폭 106cm × 길이 15.6m', area: '1롤 약 16.5㎡', price: '2~5만원', tip: '주거용 일반', color: 'var(--accent)' },
              { i: '📄', name: '합지벽지', spec: '폭 93cm × 길이 17.5m',  area: '1롤 약 16.3㎡', price: '1~2만원', tip: '저렴, 셀프 입문 추천', color: '#3EFF9B' },
              { i: '🛡️', name: 'PVC벽지', spec: '폭 106cm × 길이 15.6m', area: '방수·내구성',     price: '3~6만원', tip: '욕실·주방 추천',    color: '#3EC8FF' },
            ].map((w, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${w.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{w.i}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: w.color, marginBottom: 6 }}>{w.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{w.spec}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{w.area}</p>
                <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginTop: 6 }}>{w.price}</p>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{w.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 평수별 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수별 벽지 롤 수 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            천장 2.4m, 창문·문 1개씩, 10% 로스율, 실크벽지 기준
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '면적', '시공 면적', '실크 롤'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '5평',  a: '16.5㎡', s: '25㎡',  r: '2롤' },
                  { p: '7평',  a: '23㎡',   s: '32㎡',  r: '3롤' },
                  { p: '10평', a: '33㎡',   s: '42㎡',  r: '3롤' },
                  { p: '15평', a: '49.6㎡', s: '58㎡',  r: '4롤' },
                  { p: '20평', a: '66㎡',   s: '75㎡',  r: '5롤' },
                  { p: '25평', a: '82.6㎡', s: '92㎡',  r: '6롤' },
                  { p: '30평', a: '99㎡',   s: '110㎡', r: '7롤' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 로스율 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 로스율(여유분) 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { p: '5%',  c: '#3EFF9B',       t: '단색·작은 패턴',  d: '숙련 시공자, 솔리드 컬러' },
              { p: '10%', c: 'var(--accent)', t: '한국 표준 권장',  d: '일반 가정용 기본값' },
              { p: '15%', c: '#FF8C3E',       t: '큰 패턴',          d: '무늬 맞춤 필요' },
              { p: '20%', c: '#FF6B6B',       t: '셀프 + 큰 패턴',  d: '안전 마진' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.p}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.06)',
            border: '1px solid rgba(255,140,62,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>무늬벽지 주의</strong> — 패턴 리피트가 클수록 무늬 맞춤 손실이 커지므로 로스율을 한 단계 높여 계산하세요.
          </div>
        </div>

        {/* ── 5. 셀프 vs 전문 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🛠️ 셀프 도배 vs 전문 시공
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>🔧 셀프 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>평당 5,000~10,000원 (재료비만)</li>
                <li>시간 오래 걸림 (한 방 1일)</li>
                <li>만족도·성취감 높음</li>
                <li>실수 복구 가능 (합지 추천)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>🏗️ 전문 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>평당 15,000~25,000원 (벽지 포함)</li>
                <li>빠르고 깔끔 (24평 1~2일)</li>
                <li>패턴 맞춤 정확</li>
                <li>24평 기준 약 36~60만원</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 6. 부자재 체크리스트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📋 도배 부자재 체크리스트
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
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>✅ 필수</p>
            <ul style={{ paddingLeft: 22, margin: 0, marginBottom: 12 }}>
              <li>도배풀 (3kg/롤, 5,000원/kg 평균)</li>
              <li>풀솔·롤러</li>
              <li>벽지칼·자</li>
              <li>헤라 (매끄럽게 펴는 도구)</li>
              <li>마른 걸레 (기포 제거)</li>
            </ul>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#FF8C3E', marginBottom: 8 }}>🪜 천장 높이 따라</p>
            <ul style={{ paddingLeft: 22, margin: 0, marginBottom: 12 }}>
              <li>사다리 2~5만원 (천장 도배 시 필수)</li>
            </ul>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3EC8FF', marginBottom: 8 }}>💡 선택</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>프라이머·바인더 (벽 상태 안 좋을 때)</li>
              <li>마스킹 테이프 (보호용)</li>
            </ul>
          </div>
        </div>

        {/* ── 7. 도배 시기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🗓️ 도배 시기 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🌸', t: '이사철',         d: '2~3월, 8~9월 — 시공사 예약 어려움' },
              { i: '💍', t: '결혼 시즌',      d: '봄·가을 — 전세·신혼집 도배 수요 ↑' },
              { i: '⏱️', t: '시공 시간 (전문)', d: '24평 기준 1~2일' },
              { i: '🛠️', t: '시공 시간 (셀프)', d: '24평 기준 3~5일' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
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
                q: '24평 아파트 도배에 벽지 몇 롤이 필요한가요?',
                a: '24평(약 79㎡) 아파트 전체 도배에 실크벽지 약 <strong>18~24롤</strong>이 필요합니다. 방 3개 + 거실 + 주방 기준 천장 도배 제외, 10% 로스율 적용 시 평균 20롤 정도가 표준입니다. 부분 도배라면 5~8롤로 충분합니다.',
              },
              {
                q: '벽지 1롤로 몇 ㎡를 시공할 수 있나요?',
                a: '한국 표준 실크벽지 1롤은 <strong>폭 106cm × 길이 15.6m로 약 16.5㎡</strong>입니다. 합지벽지는 폭 93cm × 길이 17.5m로 약 16.3㎡입니다. 다만 무늬 맞춤·절단 손실 등으로 실제 시공 가능 면적은 90% 정도(약 14~15㎡)로 보는 것이 안전합니다.',
              },
              {
                q: '로스율 10%는 무엇을 의미하나요?',
                a: '시공 중 발생하는 손실(절단·무늬 맞춤·실수)을 위한 여유분입니다. 시공 면적의 10%만큼 추가로 벽지를 준비한다는 의미로 <strong>30㎡ 시공이라면 33㎡의 벽지를 구매</strong>해야 합니다. 무늬가 클수록 로스율을 높여야 하며, 일반 가정용은 10%가 표준입니다.',
              },
              {
                q: '셀프 도배가 가능한가요?',
                a: '가능합니다. 다음을 추천합니다:<br/>① <strong>합지벽지로 시작</strong> (실수 복구 쉬움)<br/>② <strong>방 1개부터 도전</strong> (전체는 부담)<br/>③ <strong>큰 무늬 벽지 피하기</strong> (패턴 맞춤 어려움)<br/>④ 유튜브 시공 영상 학습 후 도전<br/>한 방(7~10평) 셀프 도배는 1일 정도 소요되며 비용은 5~10만원 수준입니다.',
              },
              {
                q: '도배 비용은 평당 얼마인가요?',
                a: '2024년 기준 한국 평균:<br/>• 셀프 도배: <strong>평당 5,000~10,000원</strong> (재료비만)<br/>• 일반 시공 (합지): <strong>평당 8,000~12,000원</strong><br/>• 일반 시공 (실크): <strong>평당 12,000~18,000원</strong><br/>• 고급 시공 (수입·디자이너): 평당 20,000원 이상<br/>※ 지역·시기·시공사에 따라 차이 있음.',
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
              { href: '/tools/unit/area',       icon: '🏠', name: '평수 ↔ ㎡ 변환기',  desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/length',     icon: '📏', name: '길이 변환기',         desc: 'cm·m·inch·ft 변환' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단가 비교 계산기',    desc: '벽지 가성비 단가 비교' },
              { href: '/tools/finance/cost-rate', icon: '🍽️', name: '메뉴 원가율 계산기', desc: '재료비·수수료 원가율 (자영업)' },
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
            🚧 곧 출시 예정: 페인트 소요량 계산기, 바닥재 소요량 계산기, 타일 소요량 계산기
          </p>
        </div>

      </div>
    </div>
  )
}
