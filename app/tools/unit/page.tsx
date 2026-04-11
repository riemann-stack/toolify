import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '단위·변환 도구 모음 | Youtil',
  description: '평수 변환, 길이 변환, 무게 변환, 해외 직구 사이즈 변환기 등 단위 변환 무료 도구 모음.',
}

const tools = [
  { href: '/tools/unit/area',   icon: '🏠', name: '평수 ↔ ㎡ 변환기',       desc: '아파트 면적 단위 변환' },
  { href: '/tools/unit/length', icon: '📏', name: '길이 변환기',             desc: 'cm·m·inch·ft·mile 변환' },
  { href: '/tools/unit/weight', icon: '⚖️', name: '무게 변환기',             desc: 'kg·g·lb·oz·근·돈 변환' },
  { href: '/tools/unit/size',   icon: '🛍️', name: '해외 직구 사이즈 변환기', desc: 'US·EU 신발·옷 → 한국 사이즈' },
]

export default function UnitPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 단위·변환
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        단위 변환이 필요할 때 바로 사용하세요.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px 24px', textDecoration: 'none',
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}