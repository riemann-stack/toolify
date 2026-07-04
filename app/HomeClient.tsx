'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { categories, allTools, totalTools, type Category } from '@/lib/tools'
import { loadUserNav } from '@/lib/userNav'
import { searchTools } from '@/lib/search'
import AdSlot from '@/components/AdSlot'
import LiveWidget from '@/components/LiveWidget'
import CollectionBanner from '@/components/CollectionBanner'
import HomeJsonLd from '@/components/HomeJsonLd'
import CatIcon from '@/components/CatIcon'
import ToolCatIcon from '@/components/ToolCatIcon'
import UiIcon from '@/components/UiIcon'
import styles from './page.module.css'

// 인기 툴 — badge 있는 것 우선, 나머지는 카테고리별 첫 번째
const popularTools = [
  ...allTools.filter(t => t.badge === 'hot'),
  ...allTools.filter(t => t.badge === 'new').slice(0, 3),
  ...allTools.filter(t => !t.badge).slice(0, 4),
].slice(0, 9)

const RANDOM_PICK_COUNT = 5

// 인기 카드 틴트용 — 도구 href → 소속 카테고리 색
const catColorByHref = new Map<string, string>()
for (const c of categories) for (const t of c.tools) catColorByHref.set(t.href, c.color)

/* ── 벤토 배치 순서 — 4열 그리드에서 빈 칸 없이 맞물리도록 수동 배열.
   검색(2×2)·금융(2×1)·가이드(2×1)·전체보기(2×1) 스팬 기준. 목록에 없는
   신규 카테고리는 뒤쪽에 자동 합류. */
const BENTO_FRONT = ['finance', 'health', 'cooking', 'sports', 'interior', 'unit', 'date']
const BENTO_BACK = ['art', 'edu', 'dev', 'life']
const catById = new Map(categories.map(c => [c.id, c]))
const bentoFront = BENTO_FRONT.map(id => catById.get(id)).filter((c): c is Category => !!c)
const bentoBack = [
  ...BENTO_BACK.map(id => catById.get(id)).filter((c): c is Category => !!c),
  ...categories.filter(c => !BENTO_FRONT.includes(c.id) && !BENTO_BACK.includes(c.id)),
]

function CatTile({ cat }: { cat: Category }) {
  const wide = cat.id === 'finance'
  return (
    <Link
      href={`/tools/${cat.id}`}
      className={`${styles.tile} ${styles.catTile}${wide ? ` ${styles.tileWide}` : ''}`}
      style={{ ['--cat' as string]: cat.color }}
    >
      <span className={styles.catTileHead}>
        <CatIcon id={cat.id} size={20} />
        <span className={styles.catTileCount}>{cat.tools.length}개</span>
      </span>
      <span className={styles.catTileBody}>
        <span className={styles.catTileName}>{cat.name}</span>
        {cat.tagline && <span className={styles.catTileDesc}>{cat.tagline}</span>}
      </span>
    </Link>
  )
}

// Mac 판별 — userAgentData 우선, navigator.platform 폴백 (mounted 후 호출)
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac/i.test(nav.userAgentData?.platform ?? nav.platform ?? '')
}

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
  // SSR/첫 페인트는 기존 표기(⌘K) 유지 → mounted 후 실제 플랫폼으로 분기 (hydration 안전)
  const [isMac, setIsMac] = useState(true)

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
    setIsMac(isMacPlatform())
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

  const router = useRouter()
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
      {/* HERO — 헤드라인 + 벤토 그리드 (검색·카테고리·가이드가 한 판에) */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>
            <span className={styles.dot} aria-hidden="true" />
            로그인 없이 바로 쓰는 무료 계산기 · 2026년 기준 최신
          </span>
          <h1 className={styles.h1}>
            모든 계산,<br />한 곳에서.
          </h1>
          <p className={styles.heroSub}>
            연봉·세금·건강·요리·날짜·단위변환까지 — 입력하면 바로 답이 나옵니다.
          </p>

          <div className={styles.bento}>
            {/* 검색 타일 (2×2) — ⌘K 커맨드 진입점 + 발견 탭 */}
            <div className={`${styles.tile} ${styles.searchTile}`}>
              <p className={styles.searchTileTitle}>무엇을 계산할까요?</p>

              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="text"
                  placeholder="연봉, 칼로리, 평수…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  // Enter = 최상위 결과로 이동, ESC = 드롭다운 해제 (Nav 검색과 동작 일치)
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchHits.length > 0) {
                      router.push(searchHits[0].tool.href)
                      setQuery('')
                    } else if (e.key === 'Escape') {
                      setQuery('')
                    }
                  }}
                  autoComplete="off"
                  aria-label="도구 검색"
                />
                <kbd className={styles.searchKbd} aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>

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
                          <ToolCatIcon href={tool.href} size={18} />
                          <div className={styles.searchItemBody}>
                            <div className={styles.searchItemNameRow}>
                              <span className={styles.searchItemName}>{tool.name}</span>
                              {category && (
                                <span
                                  className={styles.searchItemCat}
                                  style={{
                                    // 원색(600)은 소형 텍스트 AA 미달 — 잉크 믹스 다크닝 (보더는 원색 유지)
                                    color: `color-mix(in srgb, ${category.color} 70%, var(--paper-ink))`,
                                    borderColor: `color-mix(in srgb, ${category.color} 33%, transparent)`,
                                  }}
                                >
                                  {category.name}
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

              {/* 발견한 도구 — 세그먼트 컨트롤 (로직 불변) */}
              <section className={styles.randomSection}>
                <div className={styles.discoverHeader}>
                  {/* 세그먼트 필터 — ARIA tabs 패턴(tabpanel·화살표 내비)을 완성하는 대신
                      토글 버튼 그룹(aria-pressed)으로 정직하게 선언 */}
                  <div className={styles.discoverTabs} role="group" aria-label="도구 발견 필터">
                    <button
                      type="button"
                      aria-pressed={tab === 'recent'}
                      className={`${styles.discoverTab} ${tab === 'recent' ? styles.discoverTabActive : ''}`}
                      onClick={() => setTab('recent')}
                    >
                      <UiIcon name="clock" size={13} /> 최근
                      {mounted && recentTools.length > 0 && (
                        <span className={styles.discoverTabCount}>{recentTools.length}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-pressed={tab === 'favorite'}
                      className={`${styles.discoverTab} ${tab === 'favorite' ? styles.discoverTabActive : ''}`}
                      onClick={() => setTab('favorite')}
                    >
                      <UiIcon name="star" size={13} /> 즐겨찾기
                      {mounted && favoriteTools.length > 0 && (
                        <span className={styles.discoverTabCount}>{favoriteTools.length}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-pressed={tab === 'random'}
                      className={`${styles.discoverTab} ${tab === 'random' ? styles.discoverTabActive : ''}`}
                      onClick={() => setTab('random')}
                    >
                      <UiIcon name="dice" size={13} /> 랜덤
                    </button>
                  </div>
                  {tab === 'random' && (
                    <button
                      type="button"
                      className={styles.randomReroll}
                      onClick={pickRandom}
                      aria-label="다시 뽑기"
                    >
                      <UiIcon name="refresh" size={12} /> 다시 뽑기
                    </button>
                  )}
                </div>

                {activeChips.length > 0 ? (
                  <div className={styles.randomChips}>
                    {activeChips.map(tool => (
                      <Link key={tool.href} href={tool.href} className={styles.randomChip}>
                        <ToolCatIcon href={tool.href} size={14} />
                        <span className={styles.randomChipName}>{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={styles.discoverEmpty}>
                    {tab === 'recent'
                      ? '아직 사용한 도구가 없어요. 마음에 드는 도구를 한 번 써보면 여기에 모여요.'
                      : '★를 눌러 즐겨찾기에 담아두면 다음에 한 번에 찾을 수 있어요.'}
                  </div>
                )}
              </section>

              <p className={styles.searchTileFoot}>
                로그인 없음 · 전부 무료 · {categories.length}개 카테고리 {totalTools}개 도구
              </p>
            </div>

            {bentoFront.map(cat => <CatTile key={cat.id} cat={cat} />)}

            {/* 상황별 가이드 타일 — 아래 큐레이션 섹션으로 안내 */}
            <Link href="/collections" className={`${styles.tile} ${styles.guideTile}`}>
              <span className={styles.guideTileTag}>상황별 가이드 · 시즌 추천</span>
              <span className={styles.guideTileTitle}>오늘 상황에 맞는 도구 모음 →</span>
            </Link>

            {bentoBack.map(cat => <CatTile key={cat.id} cat={cat} />)}

            <Link href="/tools" className={`${styles.tile} ${styles.allTile}`}>
              <span>
                <span className={styles.allTileTitle}>{totalTools}개 도구 전체 보기</span>
                <span className={styles.allTileDesc}>금융부터 개발자 도구까지 한 페이지에</span>
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="M13 18l6-6" /><path d="M13 6l6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className={styles.content}>

        {/* POPULAR TOOLS — 카테고리 틴트 랭킹 카드 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>인기 도구</h2>
          <Link href="/tools" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={styles.popGrid}>
          {popularTools.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={styles.popCard}
              style={{ ['--cat' as string]: catColorByHref.get(tool.href) ?? 'var(--accent)' }}
            >
              <span className={styles.popRank}>
                인기 {i + 1}위
                {tool.badge === 'hot' && <span className={`${styles.badge} ${styles.badgeHot}`}>HOT</span>}
                {tool.badge === 'new' && <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>}
              </span>
              <span className={styles.popName}>{tool.name}</span>
              <span className={styles.popDesc}>{tool.desc}</span>
            </Link>
          ))}
        </div>

        {/* AD SLOT — 공간 예약(minHeight)으로 CLS 방지 */}
        <AdSlot position="in-article" minHeight={200} />

        {/* 상황별 가이드 (큐레이션) — 서버 계산 시즌 추천을 prop으로 → 첫 페인트부터 정합 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>상황별 가이드</h2>
          <Link href="/collections" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <CollectionBanner initialSlug={initialFeaturedSlug} />

        {/* 실시간 날짜·시각 위젯 — 페이지 하단 보조 정보 */}
        <LiveWidget />

      </div>
    </>
  )
}
