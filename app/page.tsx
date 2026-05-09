'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { categories, allTools, totalTools } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import styles from './page.module.css'

// 인기 툴 — badge 있는 것 우선, 나머지는 카테고리별 첫 번째
const popularTools = [
  ...allTools.filter(t => t.badge === 'hot'),
  ...allTools.filter(t => t.badge === 'new').slice(0, 3),
  ...allTools.filter(t => !t.badge).slice(0, 4),
].slice(0, 9)

const RANDOM_PICK_COUNT = 5

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [randomPicks, setRandomPicks] = useState<typeof allTools>([])

  // hydration 안전 — useEffect 내에서 랜덤 셔플
  useEffect(() => {
    pickRandom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickRandom() {
    const shuffled = [...allTools].sort(() => Math.random() - 0.5)
    setRandomPicks(shuffled.slice(0, RANDOM_PICK_COUNT))
  }

  const searchResults = query.trim()
    ? allTools.filter(t =>
        t.name.includes(query) || t.desc.includes(query)
      )
    : []

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>

          {/* 텍스트 영역 */}
          <div className={styles.heroLeft}>
            <h1 className={styles.h1}>
              모든 계산,<br /><em className={styles.accent}>한 곳에서.</em>
            </h1>
            <p className={styles.heroSub}>
              일상에서 자주 쓰는 도구들을 빠르고 간편하게 사용하세요.
            </p>

            {/* 우연히 발견한 도구 */}
            <div className={styles.randomSection}>
              <div className={styles.randomHead}>
                <span className={styles.randomTitle}>🎰 우연히 발견한 도구</span>
                <button
                  type="button"
                  className={styles.randomReroll}
                  onClick={pickRandom}
                  aria-label="다시 뽑기"
                >
                  🔄 다시 뽑기
                </button>
              </div>
              <div className={styles.randomChips}>
                {(randomPicks.length > 0 ? randomPicks : popularTools.slice(0, RANDOM_PICK_COUNT)).map(tool => (
                  <Link key={tool.href} href={tool.href} className={styles.randomChip}>
                    <span className={styles.randomChipIcon}>{tool.icon}</span>
                    <span className={styles.randomChipName}>{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 검색창 */}
            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="도구 검색... (예: 연봉 계산기, BMI, 부가세)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoComplete="off"
              />
              <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>

              {/* 검색 결과 드롭다운 */}
              {query.trim() && (
                <div className={styles.searchDropdown}>
                  {searchResults.length > 0 ? (
                    searchResults.map(tool => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className={styles.searchItem}
                        onClick={() => setQuery('')}
                      >
                        <span className={styles.searchItemIcon}>{tool.icon}</span>
                        <div>
                          <div className={styles.searchItemName}>{tool.name}</div>
                          <div className={styles.searchItemDesc}>{tool.desc}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.searchEmpty}>검색 결과가 없습니다</div>
                  )}
                </div>
              )}
            </div>

            {/* 통계 + 전체 도구 보기 버튼 */}
            <div className={styles.statsRow}>
              <div className={styles.statsLine}>
                <strong className={styles.statsLineNum}>{totalTools}<span className={styles.accent}>+</span></strong>
                <span className={styles.statsLineSep}>·</span>
                <span className={styles.statsLineLabel}>{categories.length} 카테고리</span>
              </div>
              <Link href="/tools" className={styles.ctaBtn}>
                전체 도구 →
              </Link>
            </div>
          </div>

          {/* Y 심볼 — 우측 비주얼 */}
          <div className={styles.heroRight} aria-hidden="true">
            <span className={styles.ySymbol}>Y</span>
          </div>

        </div>
      </section>

      {/* CONTENT */}
      <div className={styles.content}>

        {/* CATEGORIES */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>카테고리</span>
          <Link href="/tools" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={styles.catGrid}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              className={`${styles.catCard} ${styles[`cat_${cat.id}`]}`}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catName} style={{ color: cat.color }}>{cat.name}</span>
              <span className={styles.catCount}>{cat.tools.length}개 도구</span>
            </Link>
          ))}
        </div>

        {/* AD SLOT */}
        <AdSlot position="in-article" minHeight={200} />

        {/* POPULAR TOOLS */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>인기 도구</span>
          <Link href="/tools" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={styles.toolsGrid}>
          {popularTools.map(tool => (
            <Link key={tool.href} href={tool.href} className={styles.toolCard}>
              <div className={styles.toolIconWrap}>{tool.icon}</div>
              <div className={styles.toolInfo}>
                <div className={styles.toolName}>{tool.name}</div>
                <div className={styles.toolDesc}>{tool.desc}</div>
              </div>
              {tool.badge === 'hot' && <span className={`${styles.badge} ${styles.badgeHot}`}>HOT</span>}
              {tool.badge === 'new' && <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>}
            </Link>
          ))}
        </div>

      </div>
    </>
  )
}