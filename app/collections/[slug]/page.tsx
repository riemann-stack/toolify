import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { COLLECTIONS, getCollection, resolveTools, collectionToolCount } from '@/lib/collections'

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCollection(slug)
  if (!c) return buildMetadata({ path: `/collections/${slug}`, title: '상황별 가이드', description: '상황·라이프이벤트별 도구 모음.' })
  return buildMetadata({
    path: `/collections/${c.slug}`,
    title: `${c.title} — 상황별 도구 모음`,
    description: c.lead,
    keywords: [c.short, c.title, '도구 모음', '상황별 계산기', ...c.steps.map((s) => s.title)],
  })
}

const card: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCollection(slug)
  if (!c) notFound()

  const others = COLLECTIONS.filter((x) => x.slug !== c.slug)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        상황별 가이드
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-hidden>{c.emoji}</span>{c.title}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>{c.lead}</p>
      <p style={{ fontSize: 13, color: c.color, fontWeight: 700, marginBottom: 24 }}>
        도구 {collectionToolCount(c)}개 · {c.steps.length}단계
      </p>

      {/* 큐레이터 소개 글 */}
      <p
        style={{
          fontSize: 15, color: 'var(--text)', lineHeight: 1.85, marginBottom: 44,
          paddingLeft: 16, borderLeft: `3px solid ${c.color}`,
        }}
      >
        {c.intro}
      </p>

      {/* 여정 단계별 도구 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {c.steps.map((step, i) => {
          const tools = resolveTools(step.toolHrefs)
          if (tools.length === 0) return null
          return (
            <section key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: `${c.color}22`, color: c.color, fontWeight: 800, fontSize: 13,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >{i + 1}</span>
                <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {step.title}
                </h2>
              </div>
              {step.note && (
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px', paddingLeft: 36 }}>
                  {step.note}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {tools.map((t) => (
                  <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>{t.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{t.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* 전체 도구 CTA */}
      <div style={{ marginTop: 44, padding: '18px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7 }}>
        찾는 도구가 없나요? <Link href="/tools" style={{ color: 'var(--accent)', fontWeight: 600 }}>전체 도구 목록</Link>에서 더 많은 계산기·유틸리티를 확인하세요.
      </div>

      {/* 다른 상황별 가이드 */}
      <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: 700, margin: '44px 0 16px' }}>
        다른 상황별 가이드
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {others.map((o) => (
          <Link key={o.slug} href={`/collections/${o.slug}`} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${o.color}` }}>
            <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>{o.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{o.short}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>도구 {collectionToolCount(o)}개</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
