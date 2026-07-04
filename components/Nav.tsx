/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Nav.module.css'
import { categories, allTools, type Tool } from '@/lib/tools'
import CatIcon from './CatIcon'
import ToolCatIcon from './ToolCatIcon'
import UiIcon from './UiIcon'
import { OPEN_SEARCH_EVENT } from './BottomNav'
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
      // behavior 미지정 시 html의 scroll-behavior:smooth를 따라 복원이 애니메이션됨 — 즉시 복원 강제
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [isLocked])
}

// Mac 판별 — userAgentData 우선, navigator.platform 폴백 (mounted 후 호출, HomeClient와 동일 분기)
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac/i.test(nav.userAgentData?.platform ?? nav.platform ?? '')
}

const POPULAR_TOOLS: Array<Pick<Tool, 'href' | 'name'>> = [
  { name: '연봉 실수령액', href: '/tools/finance/salary' },
  { name: '나이 계산기',   href: '/tools/date/age' },
  { name: 'BMI 계산기',    href: '/tools/health/bmi' },
  { name: '로또 생성기',   href: '/tools/life/lotto' },
  { name: '더치페이',      href: '/tools/life/dutch' },
  { name: '군대 전역일',   href: '/tools/date/military' },
]

/* ─── 공유 버튼 ─── */
function ShareButton() {
  const [state, setState] = useState<'idle' | 'copied'>('idle')

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href

    // document.title에는 이미 브랜드가 들어 있음 — 도구 페이지는 템플릿('%s | Youtil')으로 끝에,
    // 홈·소개 페이지는 제목 자체에 'Youtil…'이 앞에 포함됨. 그대로 다시 ' | Youtil'을 붙이면 중복된다.
    // ① 끝의 ' | Youtil' 접미사 제거 → ② 맨 앞에 브랜드가 없을 때만 한 번 붙여 브랜드가 정확히 1회만 나오게.
    const SITE = 'Youtil'
    const SUFFIX = ` | ${SITE}`
    let base = document.title
    if (base.endsWith(SUFFIX)) base = base.slice(0, -SUFFIX.length)
    const headline = base.startsWith(SITE) ? base : `${SITE} | ${base}`

    // 카카오톡 등 링크 미리보기 카드는 url 필드(+ 페이지 OG 태그)로 만들어지므로 url을 반드시 함께 넘긴다.
    // text에는 브랜드가 1회만 든 headline을 담아 'Youtil' 중복을 없앤다(이전 버그: text 뒤에 또 '| Youtil').
    // 주의: url 필드를 넘기면 OS가 붙여넣기 시 'text 공백 url'로 이어 붙이므로, url 앞 구분자는 공백이 된다.
    //       (구분자에 '|'를 강제하려면 url을 text에 직접 넣어야 하는데, 그러면 카드가 사라지거나 url이 중복됨)
    type NavWithShare = Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> }
    const nav = navigator as NavWithShare
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: headline, text: headline, url })
        return
      } catch {
        // 사용자 취소 시 무시 → 클립보드 폴백 안 함
        return
      }
    }
    // 데스크탑 등 Web Share 미지원 → 클립보드에는 구분자를 직접 제어할 수 있으므로 'Youtil | 제목 | URL' 형태로 복사
    const clipText = `${headline} | ${url}`
    try {
      await navigator.clipboard.writeText(clipText)
      setState('copied')
      setTimeout(() => setState('idle'), 1500)
    } catch {
      // 마지막 폴백: 사용자에게 전체 문구 표시
      window.prompt('이 페이지 링크를 복사하세요:', clipText)
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
  const [mobileQuery, setMobileQuery] = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [activecat,   setActivecat]   = useState<string | null>(null)
  const [highlightIdx, setHighlightIdx] = useState(0)
  const [userNav,     setUserNav]     = useState<UserNav>({ recents: [], favorites: [] })
  const [mounted,     setMounted]     = useState(false)
  // SSR/첫 페인트 기본값 → mounted 후 실제 플랫폼으로 분기 (hydration 안전)
  const [isMac,       setIsMac]       = useState(true)
  const pathname  = usePathname()
  const router    = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement | null>(null)
  // ESC로 오버레이를 닫을 때 포커스를 트리거로 복귀시키기 위한 참조 (APG dialog/menu 패턴)
  const searchBtnRef = useRef<HTMLButtonElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const catBtnRef = useRef<HTMLButtonElement>(null)

  useBodyScrollLock(mobileOpen)

  // 드로어 열림 = 모달 — 가려진 본문·푸터·하단 탭바를 포커스/AT 트리에서 제외
  useEffect(() => {
    if (!mobileOpen) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('main, footer, nav[aria-label="하단 메뉴"]'))
    els.forEach(el => el.setAttribute('inert', ''))
    return () => els.forEach(el => el.removeAttribute('inert'))
  }, [mobileOpen])

  // localStorage 초기 로드
  useEffect(() => {
    setUserNav(loadUserNav())
    setIsMac(isMacPlatform())
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
      setMobileQuery('')
    }, 0)
    return () => clearTimeout(id)
  }, [pathname])

  // 드로어 열리면 검색창 자동 포커스
  useEffect(() => {
    if (mobileOpen) setTimeout(() => mobileSearchRef.current?.focus(), 50)
    else setMobileQuery('')
  }, [mobileOpen])

  // 모바일 하단 탭바 '검색' → 드로어 열기 (검색창 자동 포커스는 mobileOpen 효과가 처리)
  useEffect(() => {
    const onOpenSearch = () => setMobileOpen(true)
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
  }, [])

  // Cmd+K / Ctrl+K + 전역 ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
        setMobileOpen(false)
      }
      if (e.key === 'Escape') {
        // 닫을 때 포커스를 연 트리거로 복귀 — 미복귀 시 포커스가 body로 유실됨
        if (searchOpen) { setSearchOpen(false); setQuery(''); searchBtnRef.current?.focus() }
        if (mobileOpen) { setMobileOpen(false); burgerRef.current?.focus() }
        if (activecat) { setActivecat(null); catBtnRef.current?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, mobileOpen, activecat])

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
    if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); searchBtnRef.current?.focus() }
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
      <nav className={styles.nav} aria-label="주 메뉴">
        {/* 로고 — 잉크 마크 + 워드마크 (벤토 리디자인 정합) */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
              <path d="M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
              <path d="M8 14l0 .01" /><path d="M12 14l0 .01" /><path d="M16 14l0 .01" />
              <path d="M8 17l0 .01" /><path d="M12 17l0 .01" /><path d="M16 17l0 .01" />
            </svg>
          </span>
          Youtil
        </Link>

        {/* 데스크탑 — 카테고리 단일 메가메뉴 + 상황별 가이드 (11개 직접 노출 폐지) */}
        <ul className={styles.links}>
          <li className={styles.catItem}
            onMouseEnter={() => handleCatEnter('all')}
            onMouseLeave={handleCatLeave}>
            <button
              ref={catBtnRef}
              type="button"
              className={`${styles.catLink} ${activecat === 'all' ? styles.catLinkActive : ''}`}
              aria-haspopup="true"
              aria-expanded={activecat === 'all'}
              onClick={() => setActivecat((c) => (c === 'all' ? null : 'all'))}
            >
              카테고리
              <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* 메가 메뉴 — 11개 카테고리 그리드 */}
            {activecat === 'all' && (
              <div
                ref={megaRef}
                className={styles.megaMenu}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleCatLeave}
              >
                <div className={styles.megaHead}>
                  <span className={styles.megaCatLabel}>전체 카테고리</span>
                  <Link href="/tools" className={styles.megaAllLink} onClick={() => setActivecat(null)}>
                    전체 도구 →
                  </Link>
                </div>
                <div className={styles.megaCatGrid}>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/tools/${cat.id}`}
                      className={styles.megaCatItem}
                      style={{ ['--cat' as string]: cat.color }}
                      onClick={() => setActivecat(null)}
                    >
                      <span className={styles.megaCatItemIcon} style={{ color: cat.color }}>
                        <CatIcon id={cat.id} size={18} />
                      </span>
                      <span className={styles.megaCatItemBody}>
                        <span className={styles.megaCatItemName}>{cat.name}</span>
                        <span className={styles.megaCatItemCount}>{cat.tools.length}개 도구</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>

          <li className={styles.catItem}>
            <Link
              href="/collections"
              className={`${styles.catLink} ${pathname.startsWith('/collections') ? styles.catLinkActive : ''}`}
              aria-current={pathname.startsWith('/collections') ? 'page' : undefined}
            >
              상황별 가이드
            </Link>
          </li>
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
            ref={searchBtnRef}
            className={`${styles.searchBtn} ${searchOpen ? styles.searchBtnActive : ''}`}
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={isMac ? '검색 (⌘K)' : '검색 (Ctrl K)'}
            aria-expanded={searchOpen}
            aria-controls="nav-search-panel"
            title={isMac ? '검색 (⌘K)' : '검색 (Ctrl K)'}>
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

          <button ref={burgerRef} className={styles.burger} onClick={() => setMobileOpen((o) => !o)} aria-label="메뉴" aria-expanded={mobileOpen}>
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineTop : ''}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineMid : ''}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.burgerLineBot : ''}`} />
          </button>
        </div>
      </nav>

      {/* 검색창 슬라이드다운 */}
      {searchOpen && (
        <div className={styles.searchBar} id="nav-search-panel">
          <div className={styles.searchBarInner}>
            <svg className={styles.searchBarIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              className={styles.searchBarInput}
              type="text"
              placeholder="필요한 도구를 검색하세요."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              // 콤보박스 — 화살표 하이라이트를 AT에 통지 (aria-activedescendant)
              role="combobox"
              aria-expanded={!!query.trim()}
              aria-controls="nav-search-results"
              aria-autocomplete="list"
              aria-activedescendant={
                query.trim() && searchResults.length > 0
                  ? `nav-search-opt-${Math.min(highlightIdx, searchResults.length - 1)}`
                  : undefined
              }
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

          {/* 검색 결과 — 행 = div(option), 링크·즐겨찾기 버튼은 형제 (a 안 button 중첩 금지) */}
          {query.trim() && (
            <div className={styles.searchResults} role="listbox" id="nav-search-results" aria-label="검색 결과">
              {searchResults.length > 0 ? (
                searchResults.map((tool, idx) => (
                  <div
                    key={tool.href}
                    id={`nav-search-opt-${idx}`}
                    role="option"
                    aria-selected={idx === highlightIdx}
                    className={`${styles.searchResultItem} ${idx === highlightIdx ? styles.searchResultItemActive : ''}`}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    <Link href={tool.href}
                      className={styles.searchResultLink}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setTimeout(() => { setSearchOpen(false); setQuery('') }, 0) }}>
                      <ToolCatIcon href={tool.href} size={18} />
                      <span className={styles.searchResultBody}>
                        <span className={styles.searchResultName}>{tool.name}</span>
                        <span className={styles.searchResultCat}>{categoryNameByHref(tool.href)}</span>
                      </span>
                    </Link>
                    <button
                      className={`${styles.megaItemFav} ${isFav(tool.href) ? styles.megaItemFavActive : ''}`}
                      onClick={(e) => handleToggleFav(e, tool.href)}
                      aria-label={isFav(tool.href) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                    >{isFav(tool.href) ? '★' : '☆'}</button>
                  </div>
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
                  <span className={styles.searchQuickLabel}><UiIcon name="star" size={12} /> 즐겨찾기</span>
                  <div className={styles.searchQuickList}>
                    {favoriteTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setTimeout(() => { setSearchOpen(false); setQuery('') }, 0) }}>
                        <ToolCatIcon href={t.href} size={14} />
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {recentTools.length > 0 && (
                <>
                  <span className={styles.searchQuickLabel}><UiIcon name="clock" size={12} /> 최근 사용</span>
                  <div className={styles.searchQuickList}>
                    {recentTools.map((t) => (
                      <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setTimeout(() => { setSearchOpen(false); setQuery('') }, 0) }}>
                        <ToolCatIcon href={t.href} size={14} />
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <span className={styles.searchQuickLabel}><UiIcon name="flame" size={12} /> 인기 도구</span>
              <div className={styles.searchQuickList}>
                {POPULAR_TOOLS.map((t) => (
                  <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setTimeout(() => { setSearchOpen(false); setQuery('') }, 0) }}>
                    <ToolCatIcon href={t.href} size={14} />
                    <span>{t.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 모바일 드로어 ── 검색·카테고리 탭·아코디언 3단 구조 */}
      {mobileOpen && (
        <>
          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="메뉴">
            {/* 1) 상단 고정 검색 */}
            <div className={styles.drawerSearchSticky}>
              <div className={styles.drawerSearchInner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  className={styles.drawerSearchInput}
                  placeholder="필요한 도구를 검색하세요."
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                />
                {mobileQuery && (
                  <button
                    type="button"
                    className={styles.drawerSearchClear}
                    onClick={() => { setMobileQuery(''); mobileSearchRef.current?.focus() }}
                    aria-label="지우기"
                  >×</button>
                )}
              </div>
            </div>

            <div className={styles.drawerInner}>
              {mobileQuery.trim() ? (
                /* ── 검색 모드 ── */
                (() => {
                  const hits = searchTools(mobileQuery, 20)
                  if (hits.length > 0) {
                    return (
                      <div className={styles.drawerSearchResults}>
                        {hits.map(({ tool, category }) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className={styles.drawerSearchItem}
                            onClick={() => { setTimeout(() => setMobileOpen(false), 0) }}
                          >
                            <span className={styles.drawerSearchIcon}><ToolCatIcon href={tool.href} size={18} /></span>
                            <span className={styles.drawerSearchBody}>
                              <span className={styles.drawerSearchName}>{tool.name}</span>
                              {category && (
                                <span className={styles.drawerSearchCat} style={{ color: `color-mix(in srgb, ${category.color} 70%, var(--paper-ink))` }}>
                                  {category.name}
                                </span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )
                  }
                  // 검색 결과 없을 때 — 추천 5개 (badge: hot 우선 + new)
                  const suggestions = [
                    ...allTools.filter((t) => t.badge === 'hot'),
                    ...allTools.filter((t) => t.badge === 'new'),
                  ].slice(0, 5)
                  return (
                    <div className={styles.drawerSearchEmpty}>
                      <p className={styles.drawerEmptyTitle}>
                        <strong>&quot;{mobileQuery}&quot;</strong>을(를) 찾지 못했어요.
                      </p>
                      <p className={styles.drawerEmptySub}>
                        다른 키워드로 검색하거나 아래 도구도 사용해보세요.
                      </p>
                      <div className={styles.drawerSearchResults}>
                        {suggestions.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className={styles.drawerSearchItem}
                            onClick={() => { setTimeout(() => setMobileOpen(false), 0) }}
                          >
                            <span className={styles.drawerSearchIcon}><ToolCatIcon href={tool.href} size={18} /></span>
                            <span className={styles.drawerSearchBody}>
                              <span className={styles.drawerSearchName}>{tool.name}</span>
                              <span className={styles.drawerSearchDesc}>{tool.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })()
              ) : (
                <>
                  {/* 상황별 가이드 — 드로어 상단 바로가기 */}
                  <Link href="/collections" className={styles.drawerNavLink}
                    onClick={() => setMobileOpen(false)}>
                    <span className={styles.drawerNavLinkIcon}><UiIcon name="compass" size={18} /></span>
                    <span className={styles.drawerNavLinkText}>상황별 가이드</span>
                    <span className={styles.drawerNavLinkArrow}>→</span>
                  </Link>

                  {/* 즐겨찾기·최근 사용 (있을 때만, 축약 노출) */}
                  {favoriteTools.length > 0 && (
                    <details className={styles.drawerAccItem} open>
                      <summary className={styles.drawerAccSummary}>
                        <span className={styles.drawerAccIcon}><UiIcon name="star" size={16} /></span>
                        <span className={styles.drawerAccTitle}>즐겨찾기</span>
                        <span className={styles.drawerAccCount}>{favoriteTools.length}</span>
                      </summary>
                      <div className={styles.drawerTools}>
                        {favoriteTools.map((t) => (
                          <Link key={t.href} href={t.href} className={styles.drawerToolItem}
                            onClick={() => setMobileOpen(false)}>
                            <ToolCatIcon href={t.href} size={14} />
                            <span>{t.name}</span>
                          </Link>
                        ))}
                      </div>
                    </details>
                  )}

                  {recentTools.length > 0 && (
                    <details className={styles.drawerAccItem}>
                      <summary className={styles.drawerAccSummary}>
                        <span className={styles.drawerAccIcon}><UiIcon name="clock" size={16} /></span>
                        <span className={styles.drawerAccTitle}>최근 사용</span>
                        <span className={styles.drawerAccCount}>{recentTools.length}</span>
                      </summary>
                      <div className={styles.drawerTools}>
                        {recentTools.map((t) => (
                          <Link key={t.href} href={t.href} className={styles.drawerToolItem}
                            onClick={() => setMobileOpen(false)}>
                            <ToolCatIcon href={t.href} size={14} />
                            <span>{t.name}</span>
                          </Link>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* 3) 아코디언 — 전체 카테고리 */}
                  {categories.map((cat) => (
                    <details
                      key={cat.id}
                      id={`drawer-cat-${cat.id}`}
                      className={styles.drawerAccItem}
                    >
                      <summary className={styles.drawerAccSummary}>
                        <span className={styles.drawerAccIcon} style={{ color: cat.color }}>
                          <CatIcon id={cat.id} size={16} />
                        </span>
                        <span className={styles.drawerAccTitle} style={{ color: `color-mix(in srgb, ${cat.color} 70%, var(--paper-ink))` }}>{cat.name}</span>
                        <span className={styles.drawerAccCount}>{cat.tools.length}</span>
                      </summary>
                      <div className={styles.drawerTools}>
                        <Link
                          href={`/tools/${cat.id}`}
                          className={styles.drawerCatAllLink}
                          onClick={() => setMobileOpen(false)}
                        >
                          전체 보기 →
                        </Link>
                        {cat.tools.map((tool) => (
                          <Link key={tool.href} href={tool.href} className={styles.drawerToolItem}
                            onClick={() => setMobileOpen(false)}>
                            <ToolCatIcon href={tool.href} size={14} />
                            <span>{tool.name}</span>
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
