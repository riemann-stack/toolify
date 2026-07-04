'use client'

import Link from 'next/link'
import { useState } from 'react'
import { COLLECTIONS, collectionToolCount } from '@/lib/collections'
import CollectionIcon from './CollectionIcon'
import s from './CollectionBanner.module.css'

interface CollectionBannerProps {
  /** 서버에서 계산한 오늘의 시즌 추천 slug — 첫 페인트부터 정확 표시되도록.
   *  생략 시 첫 컬렉션을 fallback으로 사용. */
  initialSlug?: string
}

export default function CollectionBanner({ initialSlug }: CollectionBannerProps = {}) {
  // 서버에서 받은 initialSlug를 useState 초기값으로 사용 → 마운트 후 swap 없음(CLS 제거).
  // initialSlug가 없거나 unknown slug면 첫 컬렉션을 안전한 fallback으로 쓴다.
  const [featuredSlug] = useState(() => {
    if (initialSlug && COLLECTIONS.some((c) => c.slug === initialSlug)) return initialSlug
    return COLLECTIONS[0].slug
  })

  const featured = COLLECTIONS.find((c) => c.slug === featuredSlug) ?? COLLECTIONS[0]
  const others = COLLECTIONS.filter((c) => c.slug !== featured.slug)

  return (
    <section className={s.banner}>
      {/* 대표(시즌 추천) 카드 */}
      <Link
        href={`/collections/${featured.slug}`}
        className={s.featured}
        style={{
          display: 'block', textDecoration: 'none',
          borderRadius: 'var(--radius-lg)', padding: '22px 24px',
          // 벤토 문법 — 그라디언트 대신 플랫 틴트 + 페이퍼 카드
          background: `color-mix(in srgb, ${featured.color} 9%, var(--paper-card))`,
          border: `1px solid color-mix(in srgb, ${featured.color} 30%, transparent)`,
        }}
      >
        <span
          style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            // 원색 소형 텍스트는 AA 미달 — 잉크 믹스 다크닝 (QA 표준)
            color: `color-mix(in srgb, ${featured.color} 70%, var(--paper-ink))`,
            background: `color-mix(in srgb, ${featured.color} 12%, transparent)`,
            borderRadius: 999, padding: '4px 10px', marginBottom: 12,
          }}
        >
          이런 상황이라면
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `color-mix(in srgb, ${featured.color} 14%, var(--paper-card))`,
              color: featured.color,
            }}
          >
            <CollectionIcon slug={featured.slug} size={24} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: 'var(--paper-ink)', letterSpacing: '-0.02em' }}>
              {featured.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--paper-ink-soft)', marginTop: 4, lineHeight: 1.6 }}>
              {featured.lead}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: `color-mix(in srgb, ${featured.color} 70%, var(--paper-ink))` }}>
          도구 {collectionToolCount(featured)}개 모아보기 →
        </div>
      </Link>

      {/* 나머지 컬렉션 — 데스크탑 그리드 / 모바일 가로 스크롤 선반 */}
      <div className={s.others}>
        {others.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className={s.otherCard}
            style={{ borderLeft: `3px solid ${c.color}` }}
          >
            <span className={s.otherIcon} style={{ color: c.color }} aria-hidden>
              <CollectionIcon slug={c.slug} size={18} />
            </span>
            <div className={s.otherBody}>
              <div className={s.otherTitle}>{c.short}</div>
              <div className={s.otherCount}>도구 {collectionToolCount(c)}개</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
