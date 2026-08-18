'use client'

/* ──────────────────────────────────────────────────────
   components/ToolBreadcrumb.tsx
   도구 상세 페이지 상단 가시적 breadcrumb — '홈 › 카테고리 › 도구명'
   ─ /tools/<cat>/<slug> 에서만 렌더 (카테고리 허브·비도구 경로는 null)
   ─ 기존 BreadcrumbList JSON-LD와 별개 (시각 전용)
   ────────────────────────────────────────────────────── */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categories } from '@/lib/tools'

export default function ToolBreadcrumb() {
  const pathname = usePathname()

  const segments = (pathname ?? '').split('/').filter(Boolean)
  // 도구 상세만: ['tools', '<cat>', '<slug>']
  if (segments.length !== 3 || segments[0] !== 'tools') return null

  const category = categories.find(c => c.id === segments[1])
  if (!category) return null

  const href = `/tools/${segments[1]}/${segments[2]}`
  const tool = category.tools.find(t => t.href === href)
  if (!tool) return null

  const sep = <span aria-hidden style={{ color: 'var(--border-hover, var(--border))' }}>›</span>

  return (
    <nav
      aria-label="현재 위치"
      style={{
        maxWidth: '880px',
        margin: '0 auto',
        padding: '18px 24px 0',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--muted)',
      }}
    >
      <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>홈</Link>
      {sep}
      <Link href={`/tools/${category.id}`} style={{ color: category.ink, textDecoration: 'none', fontWeight: 600 }}>
        {category.name}
      </Link>
      {sep}
      <span style={{ color: 'var(--muted)' }}>{tool.name}</span>
    </nav>
  )
}
