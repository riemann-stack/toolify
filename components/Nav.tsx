/* eslint-disable react-hooks/set-state-in-effect */
'use client'

/* ──────────────────────────────────────────────────────
   components/Nav.tsx — 글로벌 헤더 + 검색 패널 + 모바일 드로어 (스펙 §10.16)
   ─ 헤더: 루트에 data-cat(도구·허브 경로) → 하단 3px 분야 라인 · 메뉴 · 검색 필(⌘K / Ctrl+K) · 모바일 아이콘 2개(검색·메뉴)
   ─ 스펙의 '/' 단일 문자 단축키는 넣지 않는다: WCAG 2.1.4(문자 키 단축키, Level A)는 끄기·재지정·포커스 시에만
     동작 중 하나를 요구 — 수정 키 조합(⌘K·Ctrl+K, 기존 동작)만 둔다.
   ─ 검색 로직은 lib/search.ts(searchTools) 그대로 — 0건이면 partial 추천('혹시 이 도구?')
   ─ 최근·즐겨찾기: localStorage youtil:nav:v1 (lib/userNav) — 키 개명 금지. 다른 탭의 변경은 storage 이벤트로 다시 읽는다.
     드로어에 [메뉴 | 최근·즐겨찾기] 탭. 하단 탭바 '최근' → OPEN_RECENT_EVENT, '검색' → OPEN_SEARCH_EVENT
   ─ 헤더의 '공유' 버튼은 제거(스펙 ⑤). 과도기 공유 버튼은 ToolBreadcrumb 행 오른쪽 끝(도구 페이지)에 있다.
   ────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Nav.module.css'
import { categories, allTools, type Tool } from '@/lib/tools'
import CatIcon from './CatIcon'
import UiIcon from './UiIcon'
import { OPEN_SEARCH_EVENT, OPEN_RECENT_EVENT } from './BottomNav'
import { searchTools, categoryOf } from '@/lib/search'
import {
  loadUserNav, saveUserNav, recordVisit, toggleFavorite, isToolPath, USER_NAV_EVENT,
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

/** 화면에 실제로 보이는 첫 요소 (display:none 이면 offsetParent === null) — 포커스 복귀용 */
function firstVisible(...els: Array<HTMLElement | null>): HTMLElement | null {
  return els.find(el => el !== null && el.offsetParent !== null) ?? null
}

/** 추천 도구 — 운영자가 직접 고른 목록(방문 통계 순위가 아님 → '인기' 라벨 금지, not-found·HomeSearch와 같은 '추천').
 *  놀이형 도구(로또 등)는 넣지 않는다(스펙 §1.3 #12). */
const PICKED_TOOLS: Array<Pick<Tool, 'href' | 'name'>> = [
  { name: '연봉 실수령액', href: '/tools/finance/salary' },
  { name: '대출이자',      href: '/tools/finance/loan' },
  { name: '나이 계산기',   href: '/tools/date/age' },
  { name: 'BMI 계산기',    href: '/tools/health/bmi' },
  { name: '더치페이',      href: '/tools/life/dutch' },
  { name: '군대 전역일',   href: '/tools/date/military' },
]

/** lib/userNav.ts 의 KEY 와 같은 값 — 다른 탭의 변경(storage 이벤트) 감지용. 키 개명 금지. */
const USER_NAV_KEY = 'youtil:nav:v1'

/** 검색 단축키 표시 — 수정 키 조합만(WCAG 2.1.4). 플랫폼 판별은 마운트 후(SSR 불일치 방지) */
function shortcutLabel(): string {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  return /Mac|iPhone|iPad|iPod/.test(ua) ? '⌘K' : 'Ctrl K'
}

/** 신규 지면 공개 스위치 — 페이지가 실제로 생기기 전에는 링크하지 않는다(깨진 링크·빈 지면 = 얇은 사이트 신호).
 *  GUIDES_LIVE: /guides 에 글 3편 이상 발행 후 true (Footer.tsx 의 같은 스위치와 함께). STANDARDS_LIVE: /standards-2026 생성 후 true. */
const GUIDES_LIVE = false
const STANDARDS_LIVE = false

interface MenuItem { href: string; label: string; icon: string; exact?: boolean }
const MENU: MenuItem[] = [
  { href: '/tools', label: '전체 도구', icon: 'grid', exact: true },
  { href: '/collections', label: '상황별 가이드', icon: 'compass' },
  ...(GUIDES_LIVE ? [{ href: '/guides', label: '계산 해설', icon: 'book' }] : []),
  ...(STANDARDS_LIVE ? [{ href: '/standards-2026', label: '2026 기준표', icon: 'file' }] : []),
]

const CAT_IDS = new Set(categories.map(c => c.id))
const toolByHref = new Map(allTools.map(t => [t.href, t] as const))

type DrawerTab = 'menu' | 'recent'

/** 도구 아이콘 칩 — 분야 soft 배경 + 분야색 아이콘 (스펙 §12: CatIcon은 항상 칩 안) */
function ToolChip({ href, size = 16 }: { href: string; size?: number }) {
  const cat = categoryOf(href)
  if (!cat) return null
  return (
    <span className={styles.chip} data-cat={cat.id} aria-hidden="true">
      <CatIcon id={cat.id} size={size} />
    </span>
  )
}

export default function Nav() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [drawerTab,    setDrawerTab]    = useState<DrawerTab>('menu')
  const [mobileQuery,  setMobileQuery]  = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [query,        setQuery]        = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)
  const [userNav,      setUserNav]      = useState<UserNav>({ recents: [], favorites: [] })
  const [mounted,      setMounted]      = useState(false)
  const [kbdLabel,     setKbdLabel]     = useState('')
  const pathname  = usePathname() ?? '/'
  const router    = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  // ESC로 오버레이를 닫을 때 포커스를 트리거로 복귀시키기 위한 참조 (APG dialog 패턴)
  const searchPillRef = useRef<HTMLButtonElement>(null)
  const searchIconRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef    = useRef<HTMLButtonElement>(null)
  const recentTabRef  = useRef<HTMLButtonElement>(null)
  const menuTabRef    = useRef<HTMLButtonElement>(null)
  const drawerReturnRef = useRef<HTMLElement | null>(null)

  // 도구·허브 경로의 분야 id (알려진 분야만 — 모르는 값이면 --c 가 비어 라인이 사라지므로 제외)
  const segs = pathname.split('/').filter(Boolean)
  const cat = segs[0] === 'tools' && segs[1] && CAT_IDS.has(segs[1]) ? segs[1] : undefined

  useBodyScrollLock(mobileOpen)

  // 드로어 열림 = 모달 — 가려진 본문·섹션 바·푸터·하단 탭바를 포커스/AT 트리에서 제외
  useEffect(() => {
    if (!mobileOpen) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('main, footer, nav[aria-label="하단 메뉴"], nav[aria-label="분야"]'))
    els.forEach(el => el.setAttribute('inert', ''))
    return () => els.forEach(el => el.removeAttribute('inert'))
  }, [mobileOpen])

  // localStorage 초기 로드
  useEffect(() => {
    setUserNav(loadUserNav())
    setKbdLabel(shortcutLabel())
    setMounted(true)
  }, [])

  // 다른 탭에서 바뀐 최근·즐겨찾기를 다시 읽는다 — 안 하면 이 탭의 메모리 상태가 다음 저장 때 덮어써 즐겨찾기가 사라진다.
  // 같은 값을 다시 저장하면 storage 이벤트가 나지 않으므로 탭 간 핑퐁은 생기지 않는다. key === null 은 localStorage.clear()
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_NAV_KEY || e.key === null) setUserNav(loadUserNav())
    }
    // 같은 탭의 도구 페이지 별표 버튼이 바꾼 값 — saveUserNav 가 내용이 같으면 이벤트를 안 쏘므로 다시 저장해도 멈춘다
    const onLocal = () => setUserNav(loadUserNav())
    window.addEventListener('storage', onStorage)
    window.addEventListener(USER_NAV_EVENT, onLocal)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(USER_NAV_EVENT, onLocal)
    }
  }, [])

  // userNav 변경 시 저장
  useEffect(() => {
    if (!mounted) return
    saveUserNav(userNav)
  }, [userNav, mounted])

  // 도구 페이지 진입 시 자동 기록
  useEffect(() => {
    if (!mounted || !isToolPath(pathname)) return
    setUserNav((prev) => recordVisit(prev, pathname))
  }, [pathname, mounted])

  // 검색 패널 열리면 포커스
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
      setHighlightIdx(0)
    }
  }, [searchOpen])

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

  // 드로어 닫히면 검색어 초기화
  useEffect(() => {
    if (!mobileOpen) setMobileQuery('')
  }, [mobileOpen])

  /** 드로어 열기 — 'menu'는 검색창, 'recent'는 탭 버튼에 포커스(모바일 키보드가 불필요하게 뜨지 않게) */
  const openDrawer = useCallback((tab: DrawerTab) => {
    drawerReturnRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setDrawerTab(tab)
    setSearchOpen(false)
    setMobileOpen(true)
    window.setTimeout(() => {
      if (tab === 'recent') recentTabRef.current?.focus()
      else mobileSearchRef.current?.focus()
    }, 50)
  }, [])

  const closeDrawer = useCallback((restoreFocus: boolean) => {
    setMobileOpen(false)
    if (!restoreFocus) return
    const back = drawerReturnRef.current
    // 드로어 언마운트·inert 해제 뒤에 복귀. 되돌아갈 요소가 사라졌거나 가려졌으면 헤더 메뉴 버튼으로
    window.setTimeout(() => {
      if (back && back.isConnected && back.offsetParent !== null && !back.closest('[inert]')) back.focus()
      else menuBtnRef.current?.focus()
    }, 50)
  }, [])

  // 모바일 하단 탭바 '검색'·'최근' → 드로어 열기
  useEffect(() => {
    const onOpenSearch = () => openDrawer('menu')
    const onOpenRecent = () => openDrawer('recent')
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
    window.addEventListener(OPEN_RECENT_EVENT, onOpenRecent)
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
      window.removeEventListener(OPEN_RECENT_EVENT, onOpenRecent)
    }
  }, [openDrawer])

  const closeSearch = useCallback((restoreFocus: boolean) => {
    setSearchOpen(false)
    setQuery('')
    if (restoreFocus) firstVisible(searchPillRef.current, searchIconRef.current)?.focus()
  }, [])

  // Cmd+K / Ctrl+K + 전역 ESC ('/' 단일 문자 단축키는 WCAG 2.1.4 때문에 두지 않는다 — 머리 주석)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 크롬 자동완성은 key 없는 keydown을 쏜다 — 문자열일 때만 처리
      const key = typeof e.key === 'string' ? e.key : ''
      if ((e.metaKey || e.ctrlKey) && !e.altKey && key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
        setMobileOpen(false)
        return
      }
      if (key === 'Escape') {
        // 닫을 때 포커스를 연 트리거로 복귀 — 미복귀 시 포커스가 body로 유실됨
        if (searchOpen) closeSearch(true)
        if (mobileOpen) closeDrawer(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, mobileOpen, closeSearch, closeDrawer])

  // ── 데스크톱 검색 패널 결과 (0건이면 일부 단어만 맞는 추천) ──
  const q = query.trim()
  const { searchResults, isPartial } = useMemo(() => {
    if (!q) return { searchResults: [] as Tool[], isPartial: false }
    const exact = searchTools(q, 8)
    if (exact.length > 0) return { searchResults: exact.map(h => h.tool), isPartial: false }
    const partial = searchTools(q, 5, { partial: true })
    return { searchResults: partial.map(h => h.tool), isPartial: partial.length > 0 }
  }, [q])

  // ── 드로어 검색 결과 ──
  const mq = mobileQuery.trim()
  const drawerHits = useMemo(() => {
    if (!mq) return { hits: [] as Tool[], isPartial: false }
    const exact = searchTools(mq, 20)
    if (exact.length > 0) return { hits: exact.map(h => h.tool), isPartial: false }
    const partial = searchTools(mq, 5, { partial: true })
    return { hits: partial.map(h => h.tool), isPartial: partial.length > 0 }
  }, [mq])

  useEffect(() => {
    setHighlightIdx(0)
  }, [query])

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeSearch(true) }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(searchResults.length - 1, i + 1))
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(0, i - 1))
    }
    else if (e.key === 'Enter' && !e.nativeEvent.isComposing && searchResults.length > 0) {
      const target = searchResults[Math.min(highlightIdx, searchResults.length - 1)]
      router.push(target.href)
      closeSearch(false)
    }
  }

  const handleToggleFav = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault()
    e.stopPropagation()
    setUserNav((prev) => toggleFavorite(prev, href))
  }, [])

  const clearRecents = useCallback(() => {
    setUserNav((prev) => ({ ...prev, recents: [] }))
  }, [])

  const isFav = (href: string): boolean => userNav.favorites.includes(href)

  // 즐겨찾기 / 최근 사용 도구 리스트 (mounted 이후에만 — SSR/하이드레이션 일치)
  const favoriteTools: Tool[] = mounted
    ? userNav.favorites.map(h => toolByHref.get(h)).filter((t): t is Tool => !!t)
    : []
  const recentTools: Tool[] = mounted
    ? userNav.recents.map((r) => toolByHref.get(r.href)).filter((t): t is Tool => !!t)
    : []
  const recentCount = favoriteTools.length + recentTools.length

  const onDrawerTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next: DrawerTab = e.key === 'Home' ? 'menu' : e.key === 'End' ? 'recent' : drawerTab === 'menu' ? 'recent' : 'menu'
    setDrawerTab(next)
    ;(next === 'menu' ? menuTabRef : recentTabRef).current?.focus()
  }

  const menuCurrent = (m: MenuItem): 'page' | 'true' | undefined => {
    if (pathname === m.href) return 'page'
    if (!m.exact && pathname.startsWith(`${m.href}/`)) return 'true'
    return undefined
  }

  /** 드로어 도구 행 — 링크 + 즐겨찾기 토글(형제: a 안 button 중첩 금지) */
  const drawerToolRow = (t: Tool) => {
    const fav = isFav(t.href)
    const c = categoryOf(t.href)
    return (
      <li key={t.href} className={styles.drawerRow}>
        <Link href={t.href} className={styles.drawerRowLink} onClick={() => setMobileOpen(false)}>
          <ToolChip href={t.href} />
          <span className={styles.drawerRowBody}>
            <span className={styles.drawerRowName}>{t.name}</span>
            {c && <span className={styles.drawerRowCat} data-cat={c.id}>{c.name}</span>}
          </span>
        </Link>
        <button
          type="button"
          className={styles.favBtn}
          aria-pressed={fav}
          aria-label={`즐겨찾기: ${t.name}`}
          onClick={(e) => handleToggleFav(e, t.href)}
        >
          <UiIcon name="star" size={18} />
        </button>
      </li>
    )
  }

  return (
    <>
      <header className={styles.nav} data-cat={cat}>
        <div className={styles.navIn}>
          <Link className={styles.navLogo} href="/" aria-label="Youtil 홈">
            <svg className={styles.navLogoMark} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
              <rect width="28" height="28" rx="8" fill="currentColor" />
              <rect x="7.5" y="9.5" width="13" height="3" rx="1.5" fill="#fff" />
              <rect x="7.5" y="15.5" width="8.5" height="3" rx="1.5" fill="#fff" />
            </svg>
            Youtil<small>생활 계산 레퍼런스</small>
          </Link>

          <nav className={styles.navMenu} aria-label="주 메뉴">
            {MENU.map(m => (
              <Link key={m.href} href={m.href} aria-current={menuCurrent(m)}>{m.label}</Link>
            ))}
          </nav>

          <button
            ref={searchPillRef}
            type="button"
            className={styles.navSearch}
            onClick={() => (searchOpen ? closeSearch(false) : setSearchOpen(true))}
            aria-label="계산기 검색"
            aria-keyshortcuts="Control+K Meta+K"
            aria-expanded={searchOpen}
            aria-controls="nav-search-panel"
          >
            <UiIcon name="search" size={18} />
            <span>계산기 검색 · 연봉, 평수, 만 나이</span>
            {kbdLabel && <kbd className={styles.navKbd} aria-hidden="true">{kbdLabel}</kbd>}
          </button>

          <div className={styles.navIcons}>
            <button
              ref={searchIconRef}
              type="button"
              className={styles.navIconBtn}
              onClick={() => { if (searchOpen) closeSearch(false); else { setMobileOpen(false); setSearchOpen(true) } }}
              aria-label="검색"
              aria-expanded={searchOpen}
              aria-controls="nav-search-panel"
            >
              <UiIcon name={searchOpen ? 'x' : 'search'} size={24} />
            </button>
            <button
              ref={menuBtnRef}
              type="button"
              className={styles.navIconBtn}
              onClick={() => (mobileOpen ? closeDrawer(false) : openDrawer('menu'))}
              aria-label="메뉴"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
            >
              <UiIcon name={mobileOpen ? 'x' : 'menu'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ── 검색 패널 (슬라이드다운, 전 폭) ── */}
      {searchOpen && (
        <div className={styles.searchBar} id="nav-search-panel" role="search">
          <div className={styles.searchBarIn}>
            <div className={styles.searchField}>
              <span className={styles.searchFieldIcon}><UiIcon name="search" size={18} /></span>
              <input
                ref={searchRef}
                className={styles.searchInput}
                type="text"
                enterKeyHint="go"
                placeholder="필요한 계산기를 검색하세요 (예: 연봉, 평수, 만 나이)"
                aria-label="계산기 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                // 콤보박스 — 화살표 하이라이트를 AT에 통지 (aria-activedescendant)
                role="combobox"
                aria-expanded={searchResults.length > 0}
                aria-controls="nav-search-results"
                aria-autocomplete="list"
                aria-activedescendant={
                  q && searchResults.length > 0
                    ? `nav-search-opt-${Math.min(highlightIdx, searchResults.length - 1)}`
                    : undefined
                }
              />
              <kbd className={styles.searchKbd} aria-hidden="true">↑↓ Enter · ESC</kbd>
              {query && (
                <button type="button" className={styles.searchClear} onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="검색어 지우기">
                  <UiIcon name="x" size={16} />
                </button>
              )}
            </div>

            {/* 검색 결과 — 행 = div(option), 링크·즐겨찾기 버튼은 형제 (a 안 button 중첩 금지) */}
            {q && (
              <div className={styles.searchResults}>
                {isPartial && <p className={styles.searchNote}>정확히 맞는 계산기가 없어, 일부 단어가 맞는 계산기를 보여 드려요.</p>}
                {searchResults.length > 0 ? (
                  <div role="listbox" id="nav-search-results" aria-label="검색 결과">
                    {searchResults.map((tool, idx) => {
                      const c = categoryOf(tool.href)
                      const fav = isFav(tool.href)
                      return (
                        <div
                          key={tool.href}
                          id={`nav-search-opt-${idx}`}
                          role="option"
                          aria-selected={idx === highlightIdx}
                          className={`${styles.searchItem} ${idx === highlightIdx ? styles.searchItemActive : ''}`}
                          onMouseEnter={() => setHighlightIdx(idx)}
                        >
                          <Link
                            href={tool.href}
                            className={styles.searchItemLink}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setTimeout(() => closeSearch(false), 0) }}
                          >
                            <ToolChip href={tool.href} size={18} />
                            <span className={styles.searchItemBody}>
                              <span className={styles.searchItemName}>{tool.name}</span>
                              {c && <span className={styles.searchItemCat} data-cat={c.id}>{c.name}</span>}
                            </span>
                          </Link>
                          <button
                            type="button"
                            className={styles.favBtn}
                            onClick={(e) => handleToggleFav(e, tool.href)}
                            aria-pressed={fav}
                            aria-label={`즐겨찾기: ${tool.name}`}
                          >
                            <UiIcon name="star" size={18} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.searchEmpty}>
                    &lsquo;{q}&rsquo;에 맞는 계산기를 찾지 못했어요. 다른 낱말로 검색하거나 <Link href="/tools" onClick={() => closeSearch(false)}>전체 도구</Link>에서 찾아보세요.
                  </p>
                )}
              </div>
            )}

            {/* 빠른 접근 — 검색어 없을 때 */}
            {!q && (
              <div className={styles.searchQuick}>
                {favoriteTools.length > 0 && (
                  <>
                    <span className={styles.searchQuickLabel}><UiIcon name="star" size={14} /> 즐겨찾기</span>
                    <div className={styles.searchQuickList}>
                      {favoriteTools.map((t) => (
                        <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setTimeout(() => closeSearch(false), 0) }}>
                          <ToolChip href={t.href} size={14} />
                          <span>{t.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {recentTools.length > 0 && (
                  <>
                    <span className={styles.searchQuickLabel}><UiIcon name="history" size={14} /> 최근 사용</span>
                    <div className={styles.searchQuickList}>
                      {recentTools.slice(0, 6).map((t) => (
                        <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setTimeout(() => closeSearch(false), 0) }}>
                          <ToolChip href={t.href} size={14} />
                          <span>{t.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                <span className={styles.searchQuickLabel}><UiIcon name="bulb" size={14} /> 추천 도구</span>
                <div className={styles.searchQuickList}>
                  {PICKED_TOOLS.map((t) => (
                    <Link key={t.href} href={t.href} className={styles.searchQuickItem}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setTimeout(() => closeSearch(false), 0) }}>
                      <ToolChip href={t.href} size={14} />
                      <span>{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 모바일 드로어 ── 상단 고정 검색 + [메뉴 | 최근·즐겨찾기] 탭 */}
      {mobileOpen && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="메뉴">
          <div className={styles.drawerTop}>
            {/* 검색 + 닫기 — aria-modal 이라 스크린리더(VoiceOver iOS 등)는 헤더의 메뉴(X) 버튼에 갈 수 없다 → 대화상자 안에 닫기 */}
            <div className={styles.drawerSearchRow}>
              <div className={styles.searchField}>
                <span className={styles.searchFieldIcon}><UiIcon name="search" size={18} /></span>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  enterKeyHint="search"
                  className={styles.searchInput}
                  placeholder="필요한 계산기를 검색하세요"
                  aria-label="계산기 검색"
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                />
                {mobileQuery && (
                  <button
                    type="button"
                    className={styles.searchClear}
                    onClick={() => { setMobileQuery(''); mobileSearchRef.current?.focus() }}
                    aria-label="검색어 지우기"
                  ><UiIcon name="x" size={16} /></button>
                )}
              </div>
              <button type="button" className={styles.drawerClose} onClick={() => closeDrawer(true)}>
                닫기
              </button>
            </div>

            {!mq && (
              <div className={styles.drawerTabs} role="tablist" aria-label="드로어 보기">
                <button
                  ref={menuTabRef}
                  type="button"
                  role="tab"
                  id="drawer-tab-menu"
                  aria-selected={drawerTab === 'menu'}
                  aria-controls="drawer-panel"
                  tabIndex={drawerTab === 'menu' ? 0 : -1}
                  className={styles.drawerTab}
                  onClick={() => setDrawerTab('menu')}
                  onKeyDown={onDrawerTabKey}
                >
                  <UiIcon name="menu" size={16} />메뉴
                </button>
                <button
                  ref={recentTabRef}
                  type="button"
                  role="tab"
                  id="drawer-tab-recent"
                  aria-selected={drawerTab === 'recent'}
                  aria-controls="drawer-panel"
                  tabIndex={drawerTab === 'recent' ? 0 : -1}
                  className={styles.drawerTab}
                  onClick={() => setDrawerTab('recent')}
                  onKeyDown={onDrawerTabKey}
                >
                  <UiIcon name="history" size={16} />최근·즐겨찾기
                  {recentCount > 0 && <span className={styles.drawerTabCount}>{recentCount}</span>}
                </button>
              </div>
            )}
          </div>

          <div className={styles.drawerInner}>
            {mq ? (
              /* ── 검색 모드 ── */
              drawerHits.hits.length > 0 ? (
                <>
                  {drawerHits.isPartial && <p className={styles.searchNote}>정확히 맞는 계산기가 없어, 일부 단어가 맞는 계산기를 보여 드려요.</p>}
                  <ul className={styles.drawerList} aria-label="검색 결과">
                    {drawerHits.hits.map(drawerToolRow)}
                  </ul>
                </>
              ) : (
                <div className={styles.drawerEmpty}>
                  <p className={styles.drawerEmptyTitle}><strong>&lsquo;{mq}&rsquo;</strong>에 맞는 계산기를 찾지 못했어요.</p>
                  <p className={styles.drawerEmptySub}>다른 낱말로 검색하거나 아래 추천 계산기를 둘러보세요.</p>
                  <ul className={styles.drawerList} aria-label="추천 계산기">
                    {PICKED_TOOLS.map(p => toolByHref.get(p.href)).filter((t): t is Tool => !!t).map(drawerToolRow)}
                  </ul>
                </div>
              )
            ) : (
              <div role="tabpanel" id="drawer-panel" aria-labelledby={drawerTab === 'menu' ? 'drawer-tab-menu' : 'drawer-tab-recent'}>
                {drawerTab === 'menu' ? (
                  <>
                    <ul className={styles.drawerMenu}>
                      {MENU.map(m => (
                        <li key={m.href}>
                          <Link href={m.href} className={styles.drawerMenuLink} aria-current={menuCurrent(m)} onClick={() => setMobileOpen(false)}>
                            <UiIcon name={m.icon} size={20} />
                            <span>{m.label}</span>
                            <UiIcon name="chev-r" size={16} />
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <h2 className={styles.drawerSecH}>분야별 도구</h2>
                    <div className={styles.drawerAcc}>
                      {categories.map((c) => (
                        <details key={c.id} id={`drawer-cat-${c.id}`} className={styles.drawerAccItem} open={c.id === cat ? true : undefined}>
                          <summary className={styles.drawerAccSummary}>
                            <span className={styles.chip} data-cat={c.id} aria-hidden="true"><CatIcon id={c.id} size={16} /></span>
                            <span className={styles.drawerAccTitle}>{c.name}</span>
                            <span className={styles.drawerAccCount}>{c.tools.length}</span>
                            <span className={styles.drawerAccChev} aria-hidden="true"><UiIcon name="chev-d" size={16} /></span>
                          </summary>
                          <div className={styles.drawerTools}>
                            <Link href={`/tools/${c.id}`} className={styles.drawerCatAllLink} onClick={() => setMobileOpen(false)}>
                              {c.name} 전체 보기<UiIcon name="chev-r" size={14} />
                            </Link>
                            {c.tools.map((t) => (
                              <Link key={t.href} href={t.href} className={styles.drawerToolItem}
                                aria-current={pathname === t.href ? 'page' : undefined}
                                onClick={() => setMobileOpen(false)}>
                                <span>{t.name}</span>
                              </Link>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={styles.drawerSecH}>
                      <UiIcon name="star" size={16} />즐겨찾기
                      {favoriteTools.length > 0 && <span className={styles.drawerSecCount}>{favoriteTools.length}</span>}
                    </h2>
                    {favoriteTools.length > 0 ? (
                      <ul className={styles.drawerList}>{favoriteTools.map(drawerToolRow)}</ul>
                    ) : (
                      <p className={styles.drawerHint}>자주 쓰는 계산기는 검색 결과나 아래 최근 목록의 별 버튼으로 고정할 수 있어요.</p>
                    )}

                    <h2 className={styles.drawerSecH}>
                      <UiIcon name="history" size={16} />최근 사용
                      {recentTools.length > 0 && <span className={styles.drawerSecCount}>{recentTools.length}</span>}
                    </h2>
                    {recentTools.length > 0 ? (
                      <>
                        <ul className={styles.drawerList}>{recentTools.map(drawerToolRow)}</ul>
                        <div className={styles.drawerRecentFoot}>
                          <span>최근 7일 기록 · 이 브라우저에만 저장됩니다</span>
                          <button type="button" className={styles.drawerTextBtn} onClick={clearRecents}>최근 기록 지우기</button>
                        </div>
                      </>
                    ) : (
                      <p className={styles.drawerHint}>아직 연 계산기가 없어요. 계산기를 열면 최근 7일 기록이 이 브라우저에만 저장됩니다.</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
