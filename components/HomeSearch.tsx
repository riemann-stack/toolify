'use client'
/* components/HomeSearch.tsx — 홈 히어로 검색 + [추천 | 최근 | 즐겨찾기] 바로가기 (스펙 §10.20, UX-10)
   · 검색은 lib/search.ts(searchTools) 그대로 — Nav 검색과 같은 결과. 0건이면 일부 단어만 맞는 추천('혹시 이 도구?')
   · JS 없이도 동작: <form action="/tools">의 ?q= 를 ToolsBrowser가 읽는다(SearchAction과 같은 경로)
   · 콤보박스: ↑↓로 결과 이동, Enter = 선택(없으면 첫 결과, 결과 0이면 /tools?q= 제출), Esc = 닫기
   · 탭 SSR 기본값 = 첫 탭(서버가 넘긴 편집 추천 칩, 라벨 '추천' — GA 원본 순위는 홈 순위 섹션에만)
     → 칩 행 높이 40 고정이라 하이드레이션 뒤 탭을 바꿔도 CLS 0.
   · 스크린리더: 결과 수·0건은 aria-live 문단으로 알리고, 빈 탭 패널은 tabIndex=0으로 포커스 가능하게(ARIA APG tabs)
     자동 전환·랜덤 셔플 없음(첫 방문자에게 무작위 도구가 첫인상이 되지 않게)
   · 최근·즐겨찾기 = lib/userNav(youtil:nav:v1) — 키·형식 불변, 파싱 검증은 lib/userNav 내부
   · 전역 '/'·⌘K 단축키는 Nav가 담당 — 여기서 중복 등록하지 않는다 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import styles from '@/app/page.module.css'
import UiIcon from './UiIcon'
import CatIcon from './CatIcon'
import { loadUserNav, USER_NAV_EVENT, USER_NAV_STORAGE_KEY } from '@/lib/userNav'
import { searchTools, type SearchHit } from '@/lib/search'
import { categories } from '@/lib/tools'

export type HomeChip = { href: string; label: string; cat: string }

const chipByHref = new Map<string, HomeChip>()
for (const c of categories) for (const t of c.tools) chipByHref.set(t.href, { href: t.href, label: t.name.replace(/\s*계산기$/, ''), cat: c.id })

type Tab = 'pop' | 'recent' | 'fav'
const TAB_BASE: { id: Tab; label: string; icon?: string }[] = [
  { id: 'pop', label: '인기' },
  { id: 'recent', label: '최근', icon: 'history' },
  { id: 'fav', label: '즐겨찾기', icon: 'star' },
]
const CHIP_MAX = 8

/** popular = 서버가 계산한 첫 탭 칩. popLabel은 칩의 출처와 맞춘다(편집 추천 → '추천', GA 실측 순위 → '인기') */
export default function HomeSearch({ popular, popLabel = '추천' }: { popular: HomeChip[]; popLabel?: string }) {
  const TABS = TAB_BASE.map((t) => (t.id === 'pop' ? { ...t, label: popLabel } : t))
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [tab, setTab] = useState<Tab>('pop')
  const [recent, setRecent] = useState<HomeChip[]>([])
  const [fav, setFav] = useState<HomeChip[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // localStorage는 마운트 후에만 읽는다(SSR 불일치 방지). 이후 즐겨찾기·최근이 바뀌면(헤더 서랍의 ★, 다른 탭) 다시 읽는다
  useEffect(() => {
    const toChips = (hrefs: string[]) => hrefs.map((h) => chipByHref.get(h)).filter((x): x is HomeChip => !!x).slice(0, CHIP_MAX)
    const sync = () => {
      const nav = loadUserNav()
      setRecent(toChips(nav.recents.map((r) => r.href)))
      setFav(toChips(nav.favorites))
    }
    sync()
    const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === USER_NAV_STORAGE_KEY) sync() }
    window.addEventListener(USER_NAV_EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(USER_NAV_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const query = q.trim()
  const { hits, partial } = useMemo((): { hits: SearchHit[]; partial: boolean } => {
    if (!query) return { hits: [], partial: false }
    const exact = searchTools(query, 8)
    if (exact.length > 0) return { hits: exact, partial: false }
    return { hits: searchTools(query, 5, { partial: true }), partial: true }
  }, [query])
  const expanded = open && query.length > 0

  const go = (href: string) => {
    setOpen(false)
    setQ('')
    router.push(href)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return // 한글 조합 중 Enter/화살표는 IME 몫
    if (e.key === 'ArrowDown' && hits.length > 0) {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % hits.length)
    } else if (e.key === 'ArrowUp' && hits.length > 0) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? hits.length - 1 : i - 1))
    } else if (e.key === 'Enter' && hits.length > 0 && !partial) {
      e.preventDefault()
      go(hits[active >= 0 ? active : 0].tool.href)
    } else if (e.key === 'Enter' && active >= 0 && hits[active]) {
      e.preventDefault()
      go(hits[active].tool.href)
    } else if (e.key === 'Escape') {
      if (expanded) { e.preventDefault(); setOpen(false); setActive(-1) }
    }
    // 그 밖의 Enter(결과 0 또는 '혹시' 추천만 있고 선택 없음) → 폼 기본 제출 → /tools?q=
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = -1
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next < 0) return
    e.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  const list = tab === 'pop' ? popular : tab === 'recent' ? recent : fav
  const counts: Record<Tab, number> = { pop: 0, recent: recent.length, fav: fav.length }

  return (
    <>
      <form className={styles.hmSearch} role="search" action="/tools" method="get" onSubmit={() => setOpen(false)}>
        <UiIcon name="search" size={24} />
        <label className="srOnly" htmlFor="home-q">계산기 검색</label>
        <input
          id="home-q"
          name="q"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="어떤 계산이 필요하세요? 예: 연봉 실수령액"
          value={q}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls="home-q-list"
          aria-activedescendant={expanded && active >= 0 && hits[active] ? `home-q-opt-${active}` : undefined}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <button type="submit">검색</button>
        <div className={styles.hmDrop} hidden={!expanded}>
          {expanded && partial && hits.length > 0 && <p className={styles.hmDropNote}>정확히 맞는 도구가 없어요. 혹시 이 도구인가요?</p>}
          <ul id="home-q-list" role="listbox" aria-label="검색 결과">
            {expanded && hits.map((h, i) => {
              const cat = h.category
              return (
                <li key={h.tool.href} role="none">
                  <Link
                    id={`home-q-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    href={h.tool.href}
                    prefetch={false}
                    className={styles.hmDropItem}
                    data-cat={cat?.id}
                    // 결과를 누를 때 입력창 blur로 목록이 먼저 닫혀 첫 클릭이 사라지는 문제 방지(Nav 검색과 같은 처리)
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setOpen(false); setQ('') }}
                  >
                    <span className="ui-chipIc ui-sm" aria-hidden="true">{cat && <CatIcon id={cat.id} size={16} />}</span>
                    <span className={styles.hmDropBody}>
                      <b>{h.tool.name}</b>
                      <span>{h.tool.desc}</span>
                    </span>
                    {cat && <span className={styles.hmDropCat}>{cat.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
          {expanded && hits.length === 0 && (
            <p className={styles.hmDropEmpty}>&lsquo;{query}&rsquo;에 맞는 도구가 없어요. Enter를 누르면 전체 목록에서 찾아봅니다.</p>
          )}
        </div>
        <p className="srOnly" aria-live="polite">
          {expanded ? (hits.length === 0 ? '검색 결과 없음' : partial ? `정확히 맞는 도구 없음 · 비슷한 도구 ${hits.length}개` : `검색 결과 ${hits.length}개`) : ''}
        </p>
      </form>

      <div className={styles.hmTabs} role="tablist" aria-label="바로가기">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`home-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="home-tabpanel"
            tabIndex={tab === t.id ? 0 : -1}
            className={styles.hmTab}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.icon && <UiIcon name={t.icon} size={16} />}
            {t.label}
            {counts[t.id] > 0 && <small>{counts[t.id]}</small>}
          </button>
        ))}
      </div>
      <div className={styles.hmQuick} role="tabpanel" id="home-tabpanel" aria-labelledby={`home-tab-${tab}`} tabIndex={list.length === 0 ? 0 : undefined}>
        {list.length === 0 ? (
          <span className={styles.hmEmpty}>
            {tab === 'recent' ? '아직 사용한 계산기가 없어요' : tab === 'fav' ? '도구 페이지에서 별표를 눌러 추가하세요' : '바로가기 목록이 비어 있어요'}
          </span>
        ) : (
          list.map((c) => (
            <Link key={c.href} href={c.href} data-cat={c.cat}><i aria-hidden="true" />{c.label}</Link>
          ))
        )}
      </div>
    </>
  )
}
