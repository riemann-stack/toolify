/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Nav.module.css'
import { categories, allTools, type Tool } from '@/lib/tools'
import { searchTools } from '@/lib/search'
import {
  loadUserNav, saveUserNav, recordVisit, toggleFavorite, isToolPath,
  type UserNav,
} from '@/lib/userNav'

// body scroll lock — iOS Safari 포함 정확 작동
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    const original = {
      overflow:     document.body.style.overflow,
      position:     document.body.style.position,
      top:          document.body.style.top,
      width:        document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow     = original.overflow
      document.body.style.position     = original.position
      document.body.style.top          = original.top
      document.body.style.width        = original.width
      document.body.style.paddingRight = original.paddingRight
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

const POPULAR_TOOLS: Array<Pick<Tool, 'href' | 'name' | 'icon'>> = [
  { name: '연봉 실수령액', href: '/tools/finance/salary',  icon: '💴' },
  { name: '나이 계산기',   href: '/tools/date/age',         icon: '🎂' },
  { name: 'BMI 계산기',    href: '/tools/health/bmi',       icon: '⚖️' },
  { name: '로또 생성기',   href: '/tools/life/lotto',       icon: '🎰' },
  { name: '더치페이',      href: '/tools/life/dutch',       icon: '🍻' },
  { name: '군대 전역일',   href: '/tools/date/military',    icon: '🎖️' },
]

/* ─── 공유 버튼 ─── */
function ShareButton() {
  const [state, setState] = useState<'idle' | 'copied'>('idle')

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const title = document.title
    const text = `${title} | Youtil`
    // Web Share API (모바일 친화) → 폴백: 클립보드 복사
    type NavWithShare = Navigator & { share?: (data: { title: string; text: string; url: string }) => Promise<void> }
    const nav = navigator as NavWithShare
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url })
        return
      } catch {
        // 사용자 취소 시 무시 → 클립보드 폴백 안 함
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 1500)
    } catch {
      // 마지막 폴백: 사용자에게 URL 표시
      window.prompt('이 페이지 링크를 복사하세요:', url)
    }
  }, [])

  return (
    <button
      className={`${styles.shareBtn} ${state === 'copied' ? styles.shareBtnCopied : ''}`}
      onClick={handleShare}
      aria-label="이 페이지 공유"
      title={state === 'copied' ? '링크 복사됨' : '이 페이지 공유'}
    >
      {state === 'copied' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  )
}

export default function Nav() {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [activecat,   setActivecat]   = useState<string | null>(null)
  const [highlightIdx, setHighlightIdx] = useState(0)
  const [userNav,     setUserNav]     = useState<UserNav>({ recents: [], favorites: [] })
  const [mounted,     setMounted]     = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement | null>(null)

  useBodyScrollLock(mobileOpen)

  // localStorage 초기 로드
  useEffect(() => {
    setUserNav(loadUserNav())
    setMounted(true)
  }, [])

  // userNav 변경 시 저장
  useEffect(() => {
    if (!mounted) return
    saveUserNav(userNav)
  }, [userNav, mounted])

  // 도구 페이지 진입 시 자동 기록
  useEffect(() => {
    if (!mounted || !pathname || !isToolPath(pathname)) return
    setUserNav((prev) => recordVisit(prev, pathname))
  }, [pathname, mounted])

  // 검색창 열리면 포커스
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
      setHighlightIdx(0)
    }
  }, [searchOpen])

  // 메가 메뉴 viewport 클램프 — 좌우 오버플로우 동적 보정
  useEffect(() => {
    if (!activecat) return
    const id = requestAnimationFrame(() => {
      const el = megaRef.current
      if (!el) return
      // 일단 기본(중앙) 정렬로 측정
      el.style.transform = 'translateX(-50%)'
      const rect = el.getBoundingClientRect()
      const pad = 12
      let dx = 0
      if (rect.left < pad) dx = pad - rect.left
      else if (rect.right > window.innerWidth - pad) dx = window.innerWidth - pad - rect.right
      if (dx !== 0) el.style.transform = `translateX(calc(-50% + ${dx}px))`
    })
    return () => cancelAnimationFrame(id)
  }, [activecat])

  // 페이지 이동 시 닫기
  useEffect(() => {
    const id = setTimeout(() => {
      setMobileOpen(false)
      setSearchOpen(false)
      setQuery('')
    }, 0)
    return () => clearTimeout(id)
  }, [pathname])

  // Cmd+K / Ctrl+K + 전역 ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
        setMobileOpen(false)
      }
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); setQuery('') }
        if (mobileOpen) setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, mobileOpen])

  const searchResults: Tool[] = (() => {
    if (!query.trim()) return []
    return searchTools(query, 8).map(h => h.tool)
  })()

  useEffect(() => {
    setHighlightIdx(0)
  }, [query])

  const handleCatEnter = (href: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setActivecat(href)
  }
  const handleCatLeave = () => {
    leaveTimer.current = setTimeout(() => setActivecat(null), 150)
  }
  const handleDropdownEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setSearchOpen(false); setQuery('') }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(searchResults.length - 1, i + 1))
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(0, i - 1))
    }
    else if (e.key === 'Enter' && searchResults.length > 0) {
      const target = searchResults[Math.min(highlightIdx, searchResults.length - 1)]
      router.push(target.href)
      setSearchOpen(false); setQuery('')
    }
  }

  const categoryNameByHref = (href: string): string => {
    const c = categories.find((cat) => href.startsWith(`/tools/${cat.id}`))
    return c?.name ?? ''
  }

  const toolByHref = (href: string): Tool | undefined => allTools.find((t) => t.href === href)

  const handleToggleFav = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault()
    e.stopPropagation()
    setUserNav((prev) => toggleFavorite(prev, href))
  }, [])

  const isFav = (href: string): boolean => userNav.favorites.includes(href)

  // 즐겨찾기 / 최근 사용 도구 리스트 (mounted 이후에만)
  const favoriteTools: Tool[] = mounted
    ? userNav.favorites.map(toolByHref).filter((t): t is Tool => !!t)
    : []
  const recentTools: Tool[] = mounted
    ? userNav.recents.map((r) => toolByHref(r.href)).filter((t): t is Tool => !!t).slice(0, 6)
    : []

  return (
    <>
      <nav className={styles.nav}>
        {/* 로고 */}
        <Link href="/" className={styles.logo}>
          You<span>til</span>
        </Link>

        {/* 데스크탑 카테고리 */}
        <ul className={styles.links}>
          {categories.map((cat) => (
            <li key={cat.id} className={styles.catItem}
              onMouseEnter={() => handleCatEnter(`/tools/${cat.id}`)}
              onMouseLeave={handleCatLeave}>
              <Link
                href={`/tools/${cat.id}`}
                className={`${styles.catLink} ${pathname.startsWith(`/tools/${cat.id}`) ? styles.catLinkActive : ''}`}>
                {cat.name}
                <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>

              {/* 메가 메뉴 — 3컬럼 그리드 */}
              {activecat === `/tools/${cat.id}` && (
                <div
                  ref={megaRef}
                  className={styles.megaMenu}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleCatLeave}
                >
                  <div className={styles.megaHead}>
                    <span className={styles.megaCatLabel}>
                      <span className={styles.megaCatIcon}>{cat.icon}</span> {cat.name}
                    </span>
                    <Link href={`/tools/${cat.id}`} className={styles.megaAllLink}
                      onClick={() => setActivecat(null)}>
                      전체 보기 →
                    </Link>
                  </div>
                  <div className={styles.megaGrid}>
                    {cat.tools.map((tool) => (
                      <Link key={tool.href} href={tool.href} className={styles.megaItem}
                        onClick={() => setActivecat(null)}>
                        <span className={styles.megaItemIcon}>{tool.icon}</span>
                        <span className={styles.megaItemBody}>
                          <span className={styles.megaItemName}>
                            {tool.name}
                            {tool.badge === 'new' && <span className={styles.badgeNew}>NEW</span>}
                            {tool.badge === 'hot' && <span className={styles.badgeHot}>HOT</span>}
                          </span>
                          <span className={styles.megaItemDesc}>{tool.desc}</span>
                        </span>
                        <button
                          className={`${styles.megaItemFav} ${isFav(tool.href) ? styles.megaItemFavActive : ''}`}
                          onClick={(e) => handleToggleFav(e, tool.href)}
                          aria-label={isFav(tool.href) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                          title={isFav(tool.href) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                        >
                          {isFav(tool.href) ? '★' : '☆'}
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* 오른쪽 버튼 영역 */}
        <div className={styles.actions}>
          <Link
            href="/tools"
            className={`${styles.allToolsBtn} ${pathname === '/tools' ? styles.allToolsBtnActive : ''}`}
            aria-label="전체 도구 보기"
            title="전체 도구 보기"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>전체 도구</span>
          </Link>

          <ShareButton />

          <button
            className={`${styles.searchBtn} ${searchOpen ? styles.searchBtnActive : ''}`}
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="검색 (Ctrl+K)"
            title="검색 (Ctrl+K)">
            {searchOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
          </button>

          <button className={styles.burger} onClick={() => setMobileOpen((o) => !o)} aria-label="메뉴">
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineTop : ''}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineMid : ''}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineBot : ''}`} />
          </button>
        </div>
      </nav>

      {/* 검색창 슬라이드다운 */}
      {searchOpen && (
        <div className={styles.searchBar}>
          <div className={styles.searchBarInner}>
            <svg className={styles.searchBarIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              className={styles.searchBarInput}
              type="text"
              placeholder="필요한 도구를 검색하세요. 연봉, BMI, 복리, 제빵, 단위 변환..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKey}
            />
            <kbd className={styles.searchKbd}>↑↓ Enter · ESC</kbd>
            {query && (
              <button className={styles.searchClear} onClick={() => setQuery('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* 검색 결과 */}
          {query.trim() && (
            <div className={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((tool, idx) => (
                  <Link key={tool.href} href={tool.href}
                    className={`${styles.searchResultItem} ${idx === highlightIdx ? styles.searchResultItemActive : ''}`}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => { setSearchOpen(false); setQuery('') }}>
                    <span className={styles.searchResultIcon}>{tool.icon}</span>
                    <span className={styles.searchResultBody}>
                      <span className={styles.searchResultName}>{tool.name}</span>
                      <span className={styles.searchResultCat}>{categoryNameByHref(tool.href)}</span>
                    </span>
                    <button
                      className={`${styles.megaItemFav} ${isFav(tool.href) ? styles.megaItemFavActive : ''}`}
                      onClick={(e) => handleToggleFav(e, tool.href)}
                      aria-label={isFav(tool.href) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                    >{isFav(tool.href) ? '★' : '☆'}</button>
                  </Link>
                ))
              ) : (
                <div className={styles.searchEmpty}>
                  <span>검색 결과가 없습니다</span>
                </div>
              )}
            </div>
          )}

          {/* 빠른 접근 — 검색어 없을 때 */}
          {!query.trim() && (
            <div className={styles.searchQuick}>
              {favoriteTools.length > 0 && (
                <>
                  <span className={styles.searchQuickLabel}>⭐ 즐겨찾기</span>
                  <div className={styles.searchQuickList}>
                    {favoriteTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                        onClick={() => { setSearchOpen(false); setQuery('') }}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {recentTools.length > 0 && (
                <>
                  <span className={styles.searchQuickLabel}>🕐 최근 사용</span>
                  <div className={styles.searchQuickList}>
                    {recentTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                        onClick={() => { setSearchOpen(false); setQuery('') }}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <span className={styles.searchQuickLabel}>🔥 인기 도구</span>
              <div className={styles.searchQuickList}>
                {POPULAR_TOOLS.map((t) => (
                  <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                    onClick={() => { setSearchOpen(false); setQuery('') }}>
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <>
          <div className={styles.drawer}>
            <div className={styles.drawerInner}>
              {favoriteTools.length > 0 && (
                <div className={styles.drawerSection}>
                  <p className={styles.drawerLabel}>⭐ 즐겨찾기</p>
                  <div className={styles.drawerTools}>
                    {favoriteTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.drawerToolItem}
                        onClick={() => setMobileOpen(false)}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {recentTools.length > 0 && (
                <div className={styles.drawerSection}>
                  <p className={styles.drawerLabel}>🕐 최근 사용</p>
                  <div className={styles.drawerTools}>
                    {recentTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.drawerToolItem}
                        onClick={() => setMobileOpen(false)}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <p className={styles.drawerLabel}>카테고리</p>
              {categories.map((cat) => (
                <div key={cat.id} className={styles.drawerSection}>
                  <Link href={`/tools/${cat.id}`} className={styles.drawerCatLink}
                    onClick={() => setMobileOpen(false)}>
                    {cat.name}
                  </Link>
                  <div className={styles.drawerTools}>
                    {cat.tools.map((tool) => (
                      <Link key={tool.href} href={tool.href} className={styles.drawerToolItem}
                        onClick={() => setMobileOpen(false)}>
                        <span>{tool.icon}</span>
                        <span>{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
        </>
      )}
    </>
  )
}
