'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { categories, allTools, totalTools } from '@/lib/tools'
import { loadUserNav } from '@/lib/userNav'
import { searchTools } from '@/lib/search'
import AdSlot from '@/components/AdSlot'
import LiveWidget from '@/components/LiveWidget'
import CollectionBanner from '@/components/CollectionBanner'
import HomeJsonLd from '@/components/HomeJsonLd'
import styles from './page.module.css'

// 인기 툴 — badge 있는 것 우선, 나머지는 카테고리별 첫 번째
const popularTools = [
  ...allTools.filter(t => t.badge === 'hot'),
  ...allTools.filter(t => t.badge === 'new').slice(0, 3),
  ...allTools.filter(t => !t.badge).slice(0, 4),
].slice(0, 9)

const RANDOM_PICK_COUNT = 5

type DiscoverTab = 'recent' | 'favorite' | 'random'

interface HomeClientProps {
  /** 서버에서 계산한 오늘의 시즌 추천 컬렉션 slug — 첫 페인트부터 올바른 배너 표시 */
  initialFeaturedSlug: string
}

export default function HomeClient({ initialFeaturedSlug }: HomeClientProps) {
  const [query, setQuery] = useState('')
  const [randomPicks, setRandomPicks] = useState<typeof allTools>([])
  const [recentHrefs, setRecentHrefs] = useState<string[]>([])
  const [favoriteHrefs, setFavoriteHrefs] = useState<string[]>([])
  const [tab, setTab] = useState<DiscoverTab>('random')
  const [mounted, setMounted] = useState(false)

  function pickRandom() {
    const shuffled = [...allTools].sort(() => Math.random() - 0.5)
    setRandomPicks(shuffled.slice(0, RANDOM_PICK_COUNT))
  }

  // hydration 안전 — useEffect 내에서 랜덤 셔플 + localStorage 로드 (마운트 후 1회, 의도됨)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pickRandom()
    const nav = loadUserNav()
    setRecentHrefs(nav.recents.map(r => r.href))
    setFavoriteHrefs(nav.favorites)
    // 재방문자(최근 사용 있음) → 최근 사용 탭, 처음 온 사람 → 랜덤 추천
    setTab(nav.recents.length > 0 ? 'recent' : 'random')
    setMounted(true)
  }, [])

  const toolByHref = useMemo(() => {
    const map = new Map(allTools.map(t => [t.href, t]))
    return (href: string) => map.get(href)
  }, [])

  const recentTools = recentHrefs
    .map(toolByHref)
    .filter((t): t is (typeof allTools)[number] => !!t)
    .slice(0, RANDOM_PICK_COUNT)

  const favoriteTools = favoriteHrefs
    .map(toolByHref)
    .filter((t): t is (typeof allTools)[number] => !!t)
    .slice(0, RANDOM_PICK_COUNT)

  const activeChips =
    tab === 'recent' ? recentTools
    : tab === 'favorite' ? favoriteTools
    : (randomPicks.length > 0 ? randomPicks : popularTools.slice(0, RANDOM_PICK_COUNT))

  const searchHits = useMemo(
    () => (query.trim() ? searchTools(query, 8) : []),
    [query],
  )

  const searchInputRef = useRef<HTMLInputElement>(null)
  // `/` 또는 Cmd/Ctrl+K 로 검색창 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      } else if (e.key === '/' && !isTyping) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <HomeJsonLd />
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

            {/* 검색창 — 주요 동작이므로 발견 섹션보다 위에 배치 */}
            <div className={styles.searchWrap}>
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                type="text"
                placeholder="필요한 도구를 검색하세요."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoComplete="off"
              />
              <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <kbd className={styles.searchKbd} aria-hidden="true">⌘K</kbd>

              {/* 검색 결과 드롭다운 */}
              {query.trim() && (
                <div className={styles.searchDropdown}>
                  {searchHits.length > 0 ? (
                    searchHits.map(({ tool, category }) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className={styles.searchItem}
                        prefetch={false}
                        // 근본 원인: 결과 클릭 시 포커스된 입력창이 blur되며(모바일은 키보드 닫힘)
                        // 첫 클릭/탭이 그 동작에 흡수돼 무시됨. onMouseDown preventDefault로
                        // 포커스 이탈을 막아 첫 클릭이 바로 Link로 전달되게 한다(Nav 검색과 동일).
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setTimeout(() => setQuery(''), 0) }}
                      >
                        <span className={styles.searchItemIcon}>{tool.icon}</span>
                        <div className={styles.searchItemBody}>
                          <div className={styles.searchItemNameRow}>
                            <span className={styles.searchItemName}>{tool.name}</span>
                            {category && (
                              <span
                                className={styles.searchItemCat}
                                style={{ color: category.color, borderColor: category.color + '55' }}
                              >
                                {category.icon} {category.name}
                              </span>
                            )}
                          </div>
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

            {/* 발견한 도구 — 섹션 카드 + 세그먼트 컨트롤 */}
            <section className={styles.randomSection}>
              <div className={styles.discoverHeader}>
                <div className={styles.discoverTabs} role="tablist" aria-label="도구 발견 탭">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'recent'}
                    className={`${styles.discoverTab} ${tab === 'recent' ? styles.discoverTabActive : ''}`}
                    onClick={() => setTab('recent')}
                  >
                    🕒 최근
                    {mounted && recentTools.length > 0 && (
                      <span className={styles.discoverTabCount}>{recentTools.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'favorite'}
                    className={`${styles.discoverTab} ${tab === 'favorite' ? styles.discoverTabActive : ''}`}
                    onClick={() => setTab('favorite')}
                  >
                    ⭐ 즐겨찾기
                    {mounted && favoriteTools.length > 0 && (
                      <span className={styles.discoverTabCount}>{favoriteTools.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'random'}
                    className={`${styles.discoverTab} ${tab === 'random' ? styles.discoverTabActive : ''}`}
                    onClick={() => setTab('random')}
                  >
                    🎰 랜덤
                  </button>
                </div>
                {tab === 'random' && (
                  <button
                    type="button"
                    className={styles.randomReroll}
                    onClick={pickRandom}
                    aria-label="다시 뽑기"
                  >
                    🔄 다시 뽑기
                  </button>
                )}
              </div>

              {activeChips.length > 0 ? (
                <div className={styles.randomChips}>
                  {activeChips.map(tool => (
                    <Link key={tool.href} href={tool.href} className={styles.randomChip}>
                      <span className={styles.randomChipIcon}>{tool.icon}</span>
                      <span className={styles.randomChipName}>{tool.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.discoverEmpty}>
                  {tab === 'recent'
                    ? '아직 사용한 도구가 없어요. 마음에 드는 도구를 한 번 써보면 여기에 모여요.'
                    : '⭐를 눌러 즐겨찾기에 담아두면 다음에 한 번에 찾을 수 있어요.'}
                </div>
              )}
            </section>

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

        {/* 상황별 가이드 (큐레이션) — 서버에서 계산한 오늘의 시즌 추천을 prop으로 전달 → 첫 페인트부터 정합 */}
        <CollectionBanner initialSlug={initialFeaturedSlug} />

        {/* CATEGORIES */}
        <div className={styles.sectionHeader} style={{ marginTop: 56 }}>
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

        {/* 실시간 날짜·시각 위젯 — 페이지 하단 보조 정보 */}
        <LiveWidget />

      </div>
    </>
  )
}
