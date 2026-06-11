'use client'

import Link from 'next/link'
import { useState } from 'react'
import { COLLECTIONS, collectionToolCount } from '@/lib/collections'
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
        style={{
          display: 'block', textDecoration: 'none',
          borderRadius: 16, padding: '22px 24px',
          background: `linear-gradient(135deg, ${featured.color}22 0%, var(--bg2) 70%)`,
          border: `1px solid ${featured.color}55`,
        }}
      >
        <span
          style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            color: featured.color, background: `${featured.color}1f`,
            borderRadius: 999, padding: '4px 10px', marginBottom: 12,
          }}
        >
          이런 상황이라면
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 34, flexShrink: 0 }} aria-hidden>{featured.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {featured.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>
              {featured.lead}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: featured.color }}>
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
            <span className={s.otherEmoji} aria-hidden>{c.emoji}</span>
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
