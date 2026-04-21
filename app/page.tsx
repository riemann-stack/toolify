'use client'

import { useState } from 'react'
import Link from 'next/link'
import { categories, allTools, totalTools } from '@/lib/tools'
import styles from './page.module.css'

// 인기 툴 — badge 있는 것 우선, 나머지는 카테고리별 첫 번째
const popularTools = [
  ...allTools.filter(t => t.badge === 'hot'),
  ...allTools.filter(t => t.badge === 'new').slice(0, 3),
  ...allTools.filter(t => !t.badge).slice(0, 4),
].slice(0, 9)

export default function HomePage() {
  const [query, setQuery] = useState('')

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
            <div className={styles.heroTag}>
              <span className={styles.dot} />
              무료 · 로그인 없음 · 즉시 사용
            </div>
            <h1 className={styles.h1}>
              모든 계산,<br /><em className={styles.accent}>한 곳에서.</em>
            </h1>
            <p className={styles.heroSub}>
              연봉 계산부터 로또 번호까지 — 일상에서 자주 쓰는 도구들을<br />
              빠르고 간편하게 사용하세요.
            </p>

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
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{totalTools}<span className={styles.accent}>+</span></span>
                  <span className={styles.statLabel}>무료 도구</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{categories.length}</span>
                  <span className={styles.statLabel}>카테고리</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>0</span>
                  <span className={styles.statLabel}>로그인 필요</span>
                </div>
              </div>
              <Link href="/tools" className={styles.ctaBtn}>
                전체 도구 보기 →
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