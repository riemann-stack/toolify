'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Nav.module.css'

const categories = [
  {
    label: '금융·재테크', href: '/tools/finance',
    tools: [
      { name: '연봉 실수령액 계산기', href: '/tools/finance/salary',   icon: '💴' },
      { name: '대출이자 계산기',      href: '/tools/finance/loan',     icon: '💳' },
      { name: '복리 계산기',          href: '/tools/finance/compound', icon: '📈' },
      { name: '주식 물타기 계산기',   href: '/tools/finance/stock',    icon: '📉' },
    ],
  },
  {
    label: '건강·피트니스', href: '/tools/health',
    tools: [
      { name: 'BMI 계산기',               href: '/tools/health/bmi',        icon: '⚖️' },
      { name: '기초대사량 계산기',         href: '/tools/health/bmr',        icon: '🔥' },
      { name: '러닝 페이스 계산기',       href: '/tools/health/pace',       icon: '🏃' },
      { name: '목표 체중 감량 기간 계산기', href: '/tools/health/weightloss', icon: '🎯' },
    ],
  },
  {
    label: '생활·재미', href: '/tools/life',
    tools: [
      { name: '로또 번호 생성기',     href: '/tools/life/lotto',  icon: '🎰' },
      { name: '랜덤 추첨기',          href: '/tools/life/random', icon: '🎲' },
      { name: '사다리타기',           href: '/tools/life/ladder', icon: '🪜' },
      { name: '더치페이(N빵) 계산기', href: '/tools/life/dutch',  icon: '🍻' },
    ],
  },
  {
    label: '단위·변환', href: '/tools/unit',
    tools: [
      { name: '평수 ↔ ㎡ 변환기',       href: '/tools/unit/area',   icon: '🏠' },
      { name: '길이 변환기',             href: '/tools/unit/length', icon: '📏' },
      { name: '무게 변환기',             href: '/tools/unit/weight', icon: '⚖️' },
      { name: '해외 직구 사이즈 변환기', href: '/tools/unit/size',   icon: '🛍️' },
    ],
  },
  {
    label: '날짜·시간', href: '/tools/date',
    tools: [
      { name: '만 나이 계산기',          href: '/tools/date/age',      icon: '🎂' },
      { name: 'D-day 계산기',            href: '/tools/date/dday',     icon: '📅' },
      { name: '날짜 차이 계산기',        href: '/tools/date/diff',     icon: '📆' },
      { name: '군 전역일·복무율 계산기', href: '/tools/date/military', icon: '🎖️' },
    ],
  },
  {
    label: '개발자', href: '/tools/dev',
    tools: [
      { name: '글자수 세기',          href: '/tools/dev/charcount', icon: '🔡' },
      { name: 'Base64 인코더/디코더', href: '/tools/dev/base64',    icon: '🔐' },
      { name: 'JSON 포맷터',          href: '/tools/dev/json',      icon: '📋' },
      { name: '더미 텍스트 생성기',   href: '/tools/dev/lorem',     icon: '📝' },
    ],
  },
]

const allTools = categories.flatMap(c => c.tools)

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
            <li key={cat.href} className={styles.catItem}
              onMouseEnter={() => handleCatEnter(cat.href)}
              onMouseLeave={handleCatLeave}>
              <Link
                href={cat.href}
                className={`${styles.catLink} ${pathname.startsWith(cat.href) ? styles.catLinkActive : ''}`}>
                {cat.label}
                <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>

              {/* 호버 드롭다운 */}
              {activecat === cat.href && (
                <div className={styles.catDropdown}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleCatLeave}>
                  <div className={styles.catDropdownHeader}>
                    <Link href={cat.href} className={styles.catDropdownTitle}
                      onClick={() => setActivecat(null)}>
                      {cat.label} 전체 보기 →
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
                <div key={cat.href} className={styles.drawerSection}>
                  <Link href={cat.href} className={styles.drawerCatLink}
                    onClick={() => setMobileOpen(false)}>
                    {cat.label}
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