'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { categories } from '@/lib/tools'
import { searchTools, categoryOf } from '@/lib/search'
import AdSlot from '@/components/AdSlot'
import styles from './tools.module.css'

export default function ToolsBrowser() {
  const [q, setQ] = useState('')
  // ?q= 검색어로 진입 시 자동 채움 (사이트맵 SearchAction · 공유 링크 대응)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('q')
    if (param) setQ(param)
  }, [])
  const query = q.trim()
  const results = useMemo(() => (query ? searchTools(query, 60) : []), [query])

  return (
    <>
      {/* 상단 고정 검색창 */}
      <div className={styles.searchBar}>
        <div className={styles.searchInner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            inputMode="search"
            placeholder="필요한 도구를 검색하세요."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="도구 검색"
          />
          {q && (
            <button className={styles.searchClear} onClick={() => setQ('')} aria-label="검색어 지우기">✕</button>
          )}
        </div>
      </div>

      {query ? (
        /* ── 검색 결과 ── */
        <div>
          {results.length === 0 ? (
            <p className={styles.noResults}>
              <strong>&lsquo;{query}&rsquo;</strong>에 대한 도구를 찾지 못했어요.<br />
              다른 키워드로 검색해 보세요.
            </p>
          ) : (
            <>
              <p className={styles.searchCount}>{results.length}개 도구</p>
              <div className={styles.toolGrid}>
                {results.map(({ tool }) => {
                  const cat = categoryOf(tool.href)
                  return (
                    <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                      <span className={styles.toolIcon}>{tool.icon}</span>
                      <div className={styles.toolInfo}>
                        <div className={styles.toolName}>{tool.name}</div>
                        <div className={styles.toolDesc}>{tool.desc}</div>
                      </div>
                      {cat && <span className={styles.toolCatTag} style={{ color: cat.color }}>{cat.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── 전체 카테고리 목록 ── */
        <>
          <nav className={styles.catNav} aria-label="카테고리 바로가기">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className={styles.catChip}
                style={{ ['--chip-color' as string]: cat.color }}
              >
                <span className={styles.catChipIcon}>{cat.icon}</span>
                <span className={styles.catChipName}>{cat.name}</span>
                <span className={styles.catChipCount}>{cat.tools.length}</span>
              </a>
            ))}
          </nav>

          <div className={styles.catList}>
            {categories.map((cat, idx) => (
              <section key={cat.id} id={`cat-${cat.id}`} className={styles.catSection}>
                <div className={styles.catHeader}>
                  <div className={styles.catHeaderLeft}>
                    <span className={styles.catHeaderIcon}>{cat.icon}</span>
                    <span className={styles.catHeaderName} style={{ color: cat.color }}>{cat.name}</span>
                    <span className={styles.catHeaderCount}>({cat.tools.length}개)</span>
                  </div>
                  <Link href={`/tools/${cat.id}`} className={styles.catHeaderMore}>카테고리 보기 →</Link>
                </div>

                <div className={styles.toolGrid}>
                  {cat.tools.map((tool) => (
                    <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                      <span className={styles.toolIcon}>{tool.icon}</span>
                      <div className={styles.toolInfo}>
                        <div className={styles.toolName}>{tool.name}</div>
                        <div className={styles.toolDesc}>{tool.desc}</div>
                      </div>
                      {tool.badge === 'hot' && <span className={`${styles.badge} ${styles.badgeHot}`}>HOT</span>}
                      {tool.badge === 'new' && <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>}
                    </Link>
                  ))}
                </div>

                {idx === Math.floor(categories.length / 2) - 1 && (
                  <div style={{ marginTop: '32px' }}>
                    <AdSlot position="between-tools" minHeight={250} />
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </>
  )
}
