import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '건강·피트니스 계산기 모음 | Toolify',
  description: 'BMI 계산기, 기초대사량 계산기, 러닝 페이스 계산기 등 건강·피트니스 무료 도구 모음.',
}

const tools = [
  { href: '/tools/health/bmi',  icon: '⚖️', name: 'BMI 계산기',        desc: '체질량지수로 비만도 확인' },
  { href: '/tools/health/bmr',  icon: '🔥', name: '기초대사량 계산기',  desc: 'Harris-Benedict 공식 기준 하루 칼로리' },
  { href: '/tools/health/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '목표 기록으로 킬로미터당 페이스 계산' },
]

export default function HealthPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃 건강·피트니스
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        건강 관리에 필요한 계산을 바로 해보세요.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px 24px',
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}