import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개발자·텍스트 도구 모음 | Youtil',
  description: '글자수 세기, Base64 변환기, JSON 포맷터, Lorem Ipsum 더미 텍스트 생성기 등 개발자·텍스트 무료 도구 모음.',
}

const tools = [
  { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
  { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환' },
  { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
  { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미 텍스트 생성' },
]

export default function DevPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🖥️ 개발자·텍스트
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        개발과 텍스트 작업에 유용한 도구 모음입니다.
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