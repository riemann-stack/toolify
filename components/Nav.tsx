'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Nav.module.css'
import { categories, allTools } from '@/lib/tools'


export default function Nav() {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [activecat,   setActivecat]   = useState<string | null>(null)
  const pathname  = usePathname()
  const router    = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 검색창 열리면 포커스 (query 초기화는 닫기 핸들러에서 직접 처리)
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // 페이지 이동 시 닫기 — setTimeout(0)으로 감싸 cascading render 방지
  useEffect(() => {
    const id = setTimeout(() => {
      setMobileOpen(false)
      setSearchOpen(false)
      setQuery('')
    }, 0)
    return () => clearTimeout(id)
  }, [pathname])

  const searchResults = query.trim()
    ? allTools.filter(t => t.name.includes(query) || t.href.includes(query))
    : []

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
    if (e.key === 'Enter' && searchResults.length > 0) {
      router.push(searchResults[0].href)
      setSearchOpen(false); setQuery('')
    }
  }

  return (
    <>
      <nav className={styles.nav}>
        {/* 로고 */}
        <Link href="/" className={styles.logo}>
          You<span>til</span>
        </Link>

        {/* 데스크탑 카테고리 */}
        <ul className={styles.links}>
          {categories.map(cat => (
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

              {/* 호버 드롭다운 */}
              {activecat === `/tools/${cat.id}` && (
                <div className={styles.catDropdown}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleCatLeave}>
                  <div className={styles.catDropdownHeader}>
                    <Link href={`/tools/${cat.id}`} className={styles.catDropdownTitle}
                      onClick={() => setActivecat(null)}>
                      {cat.name} 전체 보기 →
                    </Link>
                  </div>
                  {cat.tools.map(tool => (
                    <Link key={tool.href} href={tool.href} className={styles.catDropdownItem}
                      onClick={() => setActivecat(null)}>
                      <span className={styles.catDropdownIcon}>{tool.icon}</span>
                      <span className={styles.catDropdownName}>{tool.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* 오른쪽 버튼 영역 */}
        <div className={styles.actions}>
          {/* 검색 버튼 */}
          <button
            className={`${styles.searchBtn} ${searchOpen ? styles.searchBtnActive : ''}`}
            onClick={() => setSearchOpen(o => !o)}
            aria-label="검색">
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

          {/* 모바일 햄버거 */}
          <button className={styles.burger} onClick={() => setMobileOpen(o => !o)} aria-label="메뉴">
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
              placeholder="계산기 검색... (예: 연봉, BMI, 로또)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearchKey}
            />
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
                searchResults.map(tool => (
                  <Link key={tool.href} href={tool.href} className={styles.searchResultItem}
                    onClick={() => { setSearchOpen(false); setQuery('') }}>
                    <span className={styles.searchResultIcon}>{tool.icon}</span>
                    <span className={styles.searchResultName}>{tool.name}</span>
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
              <span className={styles.searchQuickLabel}>인기 도구</span>
              <div className={styles.searchQuickList}>
                {[
                  { name: '연봉 실수령액', href: '/tools/finance/salary',  icon: '💴' },
                  { name: '만 나이',       href: '/tools/date/age',         icon: '🎂' },
                  { name: 'BMI 계산기',    href: '/tools/health/bmi',       icon: '⚖️' },
                  { name: '로또 생성기',   href: '/tools/life/lotto',       icon: '🎰' },
                  { name: '더치페이',      href: '/tools/life/dutch',       icon: '🍻' },
                  { name: '군 전역일',     href: '/tools/date/military',    icon: '🎖️' },
                ].map(t => (
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
              <p className={styles.drawerLabel}>카테고리</p>
              {categories.map(cat => (
                <div key={cat.id} className={styles.drawerSection}>
                  <Link href={`/tools/${cat.id}`} className={styles.drawerCatLink}
                    onClick={() => setMobileOpen(false)}>
                    {cat.name}
                  </Link>
                  <div className={styles.drawerTools}>
                    {cat.tools.map(tool => (
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