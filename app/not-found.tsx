import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/404',
  title: '페이지를 찾을 수 없습니다 (404)',
  description: '요청하신 페이지를 찾을 수 없습니다. Youtil의 다른 무료 도구를 둘러보세요.',
  noIndex: true,
})

// 인기 카테고리 진입점 — 사용자가 길을 잃었을 때 빠르게 복귀할 수 있도록
const QUICK_LINKS: Array<{ href: string; label: string; icon: string }> = [
  { href: '/tools/finance/salary', label: '연봉 실수령액', icon: '💴' },
  { href: '/tools/health/bmi',     label: 'BMI 계산기',   icon: '⚖️' },
  { href: '/tools/life/lotto',     label: '로또 번호',     icon: '🎰' },
  { href: '/tools/date/age',       label: '만 나이',      icon: '🎂' },
]

export default function NotFound() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center' }}>

      {/* 큰 404 — 시각적 임팩트 */}
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: 'clamp(80px, 18vw, 160px)',
        fontWeight: 800,
        letterSpacing: '-4px',
        lineHeight: 1,
        color: 'var(--accent)',
        marginBottom: '8px',
      }}>
        404
      </p>

      <h1 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: 'clamp(20px, 4vw, 28px)',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        marginBottom: '14px',
      }}>
        페이지를 찾을 수 없습니다
      </h1>

      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '36px' }}>
        주소가 잘못 입력되었거나, 도구가 이동·삭제되었을 수 있습니다.<br />
        아래 메뉴에서 원하시는 도구를 다시 찾아보세요.
      </p>

      {/* 핵심 CTA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '48px' }}>
        <Link
          href="/"
          style={{
            background: 'var(--accent)',
            color: '#0D0D0D',
            borderRadius: '10px',
            padding: '12px 22px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          🏠 홈으로
        </Link>
        <Link
          href="/tools"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 22px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          📋 전체 도구 ({totalTools}개)
        </Link>
      </div>

      {/* 인기 도구 빠른 진입 */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
        인기 도구 바로가기
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '48px' }}>
        {QUICK_LINKS.map(q => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
              textDecoration: 'none',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '18px' }}>{q.icon}</span>
            <span>{q.label}</span>
          </Link>
        ))}
      </div>

      {/* 카테고리 전체 */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
        카테고리별 둘러보기
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
        {categories.map(c => (
          <Link
            key={c.id}
            href={`/tools/${c.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '99px',
              padding: '8px 14px',
              textDecoration: 'none',
              fontSize: '12px',
              color: c.color,
              fontWeight: 500,
            }}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>

      {/* 안내 */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
        링크가 깨져 있다면 <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'none' }}>문의</Link>로 알려주세요.
      </p>
    </div>
  )
}
