import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { COLLECTIONS, collectionToolCount } from '@/lib/collections'
import CollectionIcon from '@/components/CollectionIcon'

export const metadata = buildMetadata({
  path: '/collections',
  title: '상황별 가이드 — 라이프이벤트별 도구 모음',
  description:
    '해외여행, 내 집 마련, 명절 준비, 다이어트까지 — 상황과 라이프이벤트에 필요한 계산 도구를 단계별로 묶은 큐레이션 가이드 모음입니다.',
  keywords: ['상황별 계산기', '도구 모음', '라이프이벤트', ...COLLECTIONS.map((c) => c.short)],
})

export default function CollectionsIndexPage() {
  return (
    <div style={{ background: 'var(--paper)' }}>
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: 12, color: 'var(--paper-ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        상황별 가이드
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, color: 'var(--paper-ink)' }}>
        상황별 도구 가이드
      </h1>
      <p style={{ fontSize: 15, color: 'var(--paper-ink-soft)', lineHeight: 1.8, marginBottom: 40 }}>
        도구를 하나씩 찾는 대신, 상황에 필요한 계산을 순서대로 모았습니다.
        해외여행 준비부터 내 집 마련, 명절 행사, 건강 관리까지 —
        각 가이드는 실제 진행 순서에 맞춘 단계별 도구 묶음입니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--paper-line)',
              borderRadius: 'var(--radius-card)',
              padding: '18px 20px',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', color: c.color, flexShrink: 0 }} aria-hidden>
                <CollectionIcon slug={c.slug} size={20} />
              </span>
              {/* 원색 소형 텍스트는 AA 미달 — 잉크 믹스 다크닝 */}
              <span style={{ fontSize: 15, fontWeight: 700, color: `color-mix(in srgb, ${c.color} 70%, var(--paper-ink))` }}>{c.title}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--paper-ink-soft)', lineHeight: 1.7, marginBottom: 8 }}>{c.lead}</p>
            <p style={{ fontSize: 12, color: 'var(--paper-ink-faint)' }}>
              도구 {collectionToolCount(c)}개 · {c.steps.length}단계 →
            </p>
          </Link>
        ))}
      </div>
    </div>
    </div>
  )
}
