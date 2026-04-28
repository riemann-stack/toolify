import Link from 'next/link'
import MoldingClient from './MoldingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/molding',
  title: '몰딩 길이 계산기 — 천장 몰딩·걸레받이·띠몰딩 개수',
  description: '방 둘레로 천장 몰딩, 걸레받이, 띠몰딩 필요 길이와 개수를 계산합니다. 한국 표준 2.4m·3.6m 몰딩, 모서리 45도 절단 여유, MDF·PVC·우드 재질별 비용.',
  keywords: ['몰딩계산기', '걸레받이길이', '천장몰딩개수', '몰딩소요량', 'MDF몰딩', 'PVC몰딩', '몰딩비용', '몰딩45도절단'],
})

export default function MoldingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📏 몰딩 길이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        평수·가로세로·둘레만 입력하면 <strong style={{ color: 'var(--text)' }}>천장 몰딩·걸레받이·띠몰딩·문 프레임</strong>에 필요한
        길이와 개수, 모서리 45도 절단 여유, MDF·PVC·우드 재질별 자재비·시공비를 한 번에 계산합니다.
      </p>

      <MoldingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 몰딩 종류별 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            몰딩 종류별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '천장 몰딩 (Crown)',   c: 'var(--accent)', d: '천장과 벽 경계 마감. 한국에서 가장 흔한 PVC·MDF.', s: '폭 5~10cm · 1,500~5,000원/m' },
              { t: '걸레받이 (Baseboard)', c: '#FF8C3E',       d: '벽-바닥 경계. 청소 흔적·의자 상처 가림.',           s: '높이 6~10cm · 1,000~3,000원/m' },
              { t: '띠몰딩 (Chair Rail)',  c: '#9B59B6',       d: '벽 중간 장식 (보통 바닥 90cm). 데코 목적.',         s: '폭 3~6cm · 2,000~5,000원/m' },
              { t: '출입문 프레임',         c: '#3EC8FF',       d: '문틀 둘레 마감. 폭 4~7cm 표준.',                    s: '문 1개 ≈ 5.4m · 2,000~6,000원/m' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{g.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 한국 표준 몰딩 길이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 표준 몰딩 길이
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
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = <strong style={{ color: 'var(--accent)' }}>2.4m</strong> (가장 일반적)</div>
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = 3.0m (중간 사이즈)</div>
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = 3.6m (큰 사이즈, 자투리 적음)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 길이가 길수록 자투리 손실이 적지만, 운반·취급 난이도 ↑</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 24평 아파트, 천장 몰딩 + 걸레받이<br />
            • 둘레 ≈ 32m × 2(천장·걸레받이) = 64m<br />
            • +10% 로스율 + 모서리 8개×5cm = 약 71m<br />
            • <strong style={{ color: 'var(--accent)' }}>2.4m 30개</strong> 또는 <strong style={{ color: 'var(--accent)' }}>3.6m 20개</strong>
          </div>
        </div>

        {/* ── 3. 재질별 가격 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            재질별 가격·특징 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재질', '가격(m)', '난이도', '특징'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: 'PVC',    p: '1,500원',         d: '★☆☆',     u: '셀프 OK · 방수 · 변색 적음' },
                  { t: 'MDF',    p: '2,500원',         d: '★★☆',     u: '도장 후 사용 · 한국 인기' },
                  { t: '우드',   p: '5,000~10,000원',  d: '★★★',     u: '천연 우드 · 고급' },
                  { t: '석고',   p: '4,000원',         d: '★★★',     u: '욕실·곡선 디자인 가능' },
                  { t: '스티렌', p: '1,000원',         d: '★☆☆',     u: '저렴·가벼움·임시' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 모서리 절단 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            모서리 45도 절단 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '🔪 마이터 박스', c: 'var(--accent)', d: '저렴(만원대), 손톱+가이드. 셀프 시공 권장.' },
              { t: '⚙️ 마이터 톱', c: '#3EC8FF', d: '전동 톱, 정밀도 우수. 대량 작업·전문 시공.' },
              { t: '📐 외각 vs 내각', c: '#FF8C3E', d: '외각(밖으로 튀어나온 모서리) +0.5cm, 내각(안쪽) -0.5cm 보정.' },
              { t: '🧪 시운전', c: '#9B59B6', d: '본 자재 자르기 전 자투리 자재로 각도·맞물림 시험.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: c.c, fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            ⚠️ 모서리 1개당 <strong style={{ color: '#FF8C3E' }}>5~10cm 여유분</strong> 권장.
            직사각형 방은 모서리 4개 = 20~40cm. 자투리 1개를 보수용으로 남겨두세요.
          </div>
        </div>

        {/* ── 5. 평수별 빠른 참조 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수별 몰딩 길이 빠른 참조 (천장 + 걸레받이, +10% 로스)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '둘레', '총 길이', '2.4m 몰딩', '3.6m 몰딩', 'MDF 자재비'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '5평',  peri: 12.9 },
                  { p: '7평',  peri: 15.2 },
                  { p: '10평', peri: 18.2 },
                  { p: '15평', peri: 22.3 },
                  { p: '20평', peri: 25.7 },
                  { p: '24평', peri: 28.2 },
                  { p: '30평', peri: 31.5 },
                  { p: '35평', peri: 34.0 },
                ].map((r, i) => {
                  // 천장 + 걸레받이 (걸레받이는 문 1개 -0.9m)
                  const ceil = r.peri * 1.10 + 0.20 // +10% + 모서리 4×5cm
                  const base = (r.peri - 0.9) * 1.10 + 0.20
                  const total = ceil + base
                  const c24 = Math.ceil(ceil / 2.4) + Math.ceil(base / 2.4)
                  const c36 = Math.ceil(ceil / 3.6) + Math.ceil(base / 3.6)
                  const cost = c24 * 2.4 * 2500
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.peri.toFixed(1)}m</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{total.toFixed(1)}m</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{c24}개</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{c36}개</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{Math.round(cost).toLocaleString('ko-KR')}원</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 정사각형 가정 둘레, 천장 몰딩 + 걸레받이(문 1개 폭 0.9m 제외) 모두 시공 기준, MDF 2,500원/m 자재비
          </p>
        </div>

        {/* ── 6. 시공 시 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시공 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '🔪 모서리 절단', d: '45도 절단(마이터 톱 또는 마이터 박스 필수). 자투리 1개당 5~10cm 여유.' },
              { t: '🔧 본드 + 못', d: '본드 + 못 병행이 안정적. PVC는 본드만으로 가능, MDF는 못으로 보강.' },
              { t: '🎨 도장 순서', d: 'MDF는 시공 후 도장보다 시공 전 도장이 깔끔. 끝부분만 보수 도장.' },
              { t: '📏 실측 우선', d: '평수 기반은 정사각형 가정값. 실제 둘레는 실측 권장.' },
              { t: '🔁 추가 여유', d: '시공 미숙·셀프 시공은 +5% 추가 권장. 보수용 1~2개 남겨두기.' },
              { t: '🌡️ 자재 적응', d: 'PVC·MDF는 시공 24시간 전부터 시공할 방에 두기 (변형 방지).' },
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

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '24평 아파트 천장 몰딩에 몇 개가 필요한가요?',
                a: '24평 아파트 거실·방을 합친 둘레는 보통 약 28~32m 정도입니다. 천장 몰딩만 시공할 경우 둘레 + 10% 로스 + 모서리 여유 ≈ <strong>약 36m</strong>가 필요하며, <strong>2.4m 몰딩 15개</strong> 또는 <strong>3.6m 몰딩 10개</strong> 정도가 적정합니다. 걸레받이까지 함께 시공하면 약 두 배가 필요합니다.',
              },
              {
                q: '걸레받이는 문 폭을 빼야 하나요?',
                a: '네, <strong>문이 있는 곳은 걸레받이가 끊기므로 문 폭만큼 제외</strong>해야 합니다. 일반 방문 폭은 <strong>약 0.9m</strong>, 현관·중문은 약 1.0m 정도이며, 문이 여러 개 있으면 모두 합산해서 빼주세요. 문틀 자체는 별도 출입문 프레임 몰딩으로 처리됩니다.',
              },
              {
                q: '모서리 절단 시 여유분은 얼마나 잡아야 하나요?',
                a: '모서리 1개당 <strong>약 5~10cm 여유분</strong>을 권장합니다. 직사각형 방은 모서리 4개이므로 총 20~40cm가 추가로 필요합니다. 마이터 박스 사용 시 5cm로 충분하지만, 마이터 톱 없이 자르면 시행착오로 더 많은 자투리가 발생할 수 있어 <strong>+10cm 정도 잡는 것이 안전</strong>합니다.',
              },
              {
                q: '몰딩은 셀프 시공이 가능한가요?',
                a: '<strong>PVC·스티렌은 셀프 시공 충분히 가능</strong>합니다. 마이터 박스(만원대)와 본드, 가위로 작업할 수 있습니다. <strong>MDF·우드는 마이터 톱 등 도구가 필요</strong>하고 못 작업도 들어가서 난이도가 있습니다. 석고 몰딩은 곡선 마감·도장 작업까지 필요해 전문 시공을 권장합니다.',
              },
              {
                q: '몰딩 가격은 보통 얼마인가요?',
                a: '한국 시판 기준으로 <strong>스티렌 1,000원/m, PVC 1,500원/m, MDF 2,500원/m, 석고 4,000원/m, 우드 5,000~10,000원/m</strong> 정도입니다. 24평 천장+걸레받이를 MDF로 시공하면 <strong>자재비 약 18~20만원</strong>, 전문 시공비는 m당 5,000원 추가로 약 <strong>총 50만원 내외</strong>가 일반적입니다.',
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/flooring',      icon: '🪵', name: '바닥재 소요량 계산기',       desc: '마루·장판·데코타일 박스 수' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/unit/length',            icon: '📏', name: '길이 변환기',                desc: 'cm·m·inch·ft 변환' },
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
