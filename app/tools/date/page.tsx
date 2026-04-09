import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '날짜·시간 계산기 모음 | Toolify',
  description: '만 나이 계산기, D-day 계산기, 날짜 차이 계산기 등 날짜 관련 무료 도구 모음.',
}

const tools = [
  { href: '/tools/date/age',  icon: '🎂', name: '만 나이 계산기',   desc: '법 개정 기준 만 나이 즉시 계산' },
  { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기',     desc: '특정 날짜까지 남은 일수 카운트다운' },
  { href: '/tools/date/diff', icon: '📆', name: '날짜 차이 계산기', desc: '두 날짜 사이의 일수·개월·년 계산' },
]

export default function DatePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📅 날짜·시간
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        날짜 계산이 필요할 때 바로 사용하세요.
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