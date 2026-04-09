import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '생활·재미 도구 모음 | Toolify',
  description: '로또 번호 생성기, 랜덤 추첨기, 사다리타기 등 생활에서 바로 쓰는 재미있는 무료 도구 모음.',
}

const tools = [
  { href: '/tools/life/lotto',  icon: '🎰', name: '로또 번호 생성기', desc: '이번 주 행운의 번호를 자동 추첨' },
  { href: '/tools/life/random', icon: '🎲', name: '랜덤 추첨기',      desc: '숫자 또는 항목을 무작위로 추첨' },
  { href: '/tools/life/ladder', icon: '🪜', name: '사다리타기',       desc: '공정한 무작위 사다리 게임' },
]

export default function LifePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎲 생활·재미
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        일상에서 바로 쓰는 재미있는 도구들이에요.
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