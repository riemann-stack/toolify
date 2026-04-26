import Link from 'next/link'
import { categories } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

const CATEGORY_ID = 'finance'
const cat = categories.find(c => c.id === CATEGORY_ID)!

export const metadata = buildMetadata({
  path: '/tools/finance',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map(t => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function CategoryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        {cat.icon} {cat.name}
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        총 {cat.tools.length}개 도구 · 로그인 없이 즉시 사용
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cat.tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
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

      {/* 카테고리 푸터 광고 슬롯 */}
      <div style={{ marginTop: '40px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
  )
}