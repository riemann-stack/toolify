import Link from 'next/link'
import { categories } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

const CATEGORY_ID = 'interior'
const cat = categories.find(c => c.id === CATEGORY_ID)!

export const metadata = buildMetadata({
  path: '/tools/interior',
  title: '인테리어 계산기 — 도배·페인트·바닥재·타일 소요량',
  description: '셀프 인테리어와 시공 견적을 위한 계산기 모음. 도배 벽지 롤 수, 페인트·바닥재·타일 소요량, 인테리어 비용 견적을 무료로 계산합니다.',
  keywords: ['인테리어계산기', '셀프인테리어', '시공견적', '도배계산기', '페인트소요량', '인테리어비용'],
})

const COMING_SOON: Array<{ icon: string; name: string; desc: string }> = [
  { icon: '🎨', name: '페인트 소요량 계산기',     desc: '벽 면적·코팅 횟수별 페인트 리터' },
  { icon: '🪵', name: '바닥재 소요량 계산기',     desc: '마루·강마루·데코타일 박스 수' },
  { icon: '🟦', name: '타일 소요량 계산기',       desc: '면적·줄눈·로스율 반영 박스 수' },
  { icon: '📏', name: '몰딩 길이 계산기',         desc: '천장·바닥·문틀 몰딩 미터수' },
  { icon: '🪟', name: '커튼·블라인드 사이즈 계산기', desc: '창 크기별 추천 사이즈·여유 폭' },
  { icon: '💡', name: '조명 밝기(루멘) 계산기',   desc: '평수·용도별 적정 루멘' },
  { icon: '❄️', name: '에어컨 평형 계산기',       desc: '방 평수별 추천 BTU·평형' },
]

export default function InteriorCategoryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🛋️ 인테리어 · 셀프시공
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        도배·페인트·바닥재·타일·커튼·조명까지 셀프 인테리어와 시공 견적을 위한 계산기 모음입니다.
        총 <strong style={{ color: cat.color }}>{cat.tools.length}개 도구</strong> · 로그인 없이 즉시 사용
      </p>

      {/* 출시된 도구 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
        {cat.tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${cat.color}`,
            borderRadius: '14px', padding: '20px 24px', textDecoration: 'none',
            position: 'relative',
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.desc}</div>
            </div>
            {t.badge === 'hot' && (
              <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', background: 'rgba(255,62,62,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,62,62,0.3)', borderRadius: '99px', padding: '2px 8px' }}>HOT</span>
            )}
            {t.badge === 'new' && (
              <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', background: 'rgba(200,255,62,0.12)', color: 'var(--accent)', border: '1px solid rgba(200,255,62,0.3)', borderRadius: '99px', padding: '2px 8px' }}>NEW</span>
            )}
          </Link>
        ))}
      </div>

      {/* 출시 예정 안내 */}
      <div style={{
        background: 'rgba(232,151,87,0.05)',
        border: '1px solid rgba(232,151,87,0.25)',
        borderRadius: '14px',
        padding: '20px 22px',
      }}>
        <p style={{
          fontSize: '12px',
          color: cat.color,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          🚧 곧 추가됩니다
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {COMING_SOON.map((c, i) => (
            <div key={i} style={{
              background: 'var(--bg2)',
              border: '1px dashed var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
              opacity: 0.7,
            }}>
              <p style={{ fontSize: '20px', marginBottom: '6px' }}>{c.icon}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '2px' }}>{c.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5, opacity: 0.85 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7, textAlign: 'center' }}>
          원하는 도구가 있다면 <Link href="/contact" style={{ color: cat.color, textDecoration: 'none' }}>문의</Link>로 알려주세요.
        </p>
      </div>

      {/* 카테고리 푸터 광고 슬롯 */}
      <div style={{ marginTop: '40px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
  )
}
