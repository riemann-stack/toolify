'use client'
/* app/tools/ToolsBrowser.tsx — 전체 도구 목록의 검색 + 분야 › 하위 분류 목록
   · 검색 = lib/search.ts(searchTools) — 0건이면 일부 단어만 맞는 추천('혹시 이 도구?'), Nav·홈 검색과 같은 동작
   · ?q= 진입(홈 검색 폼 · SearchAction · 공유 링크)을 마운트 후 1회 반영
   · 하위 분류·배지는 서버(page.tsx)가 계산해 props로 — categoryGuides·siteDates JSON을 클라이언트 번들에 싣지 않는다
   · 목록 링크는 전부 SSR HTML에 포함(검색어가 없을 때의 기본 뷰) */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { allTools, type Tool } from '@/lib/tools'
import { searchTools, type SearchHit } from '@/lib/search'
import AdSlot from '@/components/AdSlot'
import CatIcon from '@/components/CatIcon'
import UiIcon from '@/components/UiIcon'
import styles from './tools.module.css'

export interface BrowserSection {
  catId: string
  name: string
  tagline?: string
  groups: { name: string; hrefs: string[] }[]
}

type Badge = 'hot' | 'new'
const BADGE_LABEL: Record<Badge, string> = { hot: '인기', new: 'NEW' }
const toolByHref = new Map(allTools.map((t) => [t.href, t]))

function ToolRow({ tool, badge, catId, catName }: { tool: Tool; badge?: Badge; catId?: string; catName?: string }) {
  return (
    <li>
      <Link href={tool.href} className={styles.toolCard} data-cat={catId}>
        <span className="ui-chipIc ui-sm" aria-hidden="true">{catId && <CatIcon id={catId} size={16} />}</span>
        <span className={styles.toolInfo}>
          <span className={styles.toolName}>
            {tool.name}
            {badge && <span className={`ui-badge ui-badge-${badge}`}>{BADGE_LABEL[badge]}</span>}
          </span>
          <span className={styles.toolDesc}>{tool.desc}</span>
        </span>
        {catName ? <span className={styles.toolCat}>{catName}</span> : <UiIcon name="chev-r" size={18} />}
      </Link>
    </li>
  )
}

export default function ToolsBrowser({ sections, badges }: { sections: BrowserSection[]; badges: Record<string, Badge> }) {
  const [q, setQ] = useState('')
  // ?q= 검색어로 진입 시 자동 채움 — SSR 불일치 방지를 위해 마운트 후 1회(의도된 패턴)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('q')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (param) setQ(param.slice(0, 100))
  }, [])
  const query = q.trim()
  const { results, partial } = useMemo((): { results: SearchHit[]; partial: boolean } => {
    if (!query) return { results: [], partial: false }
    const exact = searchTools(query, 60)
    if (exact.length > 0) return { results: exact, partial: false }
    return { results: searchTools(query, 8, { partial: true }), partial: true }
  }, [query])

  const midIdx = Math.floor(sections.length / 2) - 1

  return (
    <>
      <div className={styles.searchBar}>
        <div className={styles.tlWrap}>
          <div className={styles.searchInner} role="search">
            <UiIcon name="search" size={20} />
            <label className="srOnly" htmlFor="tools-q">도구 검색</label>
            <input
              id="tools-q"
              className={styles.searchInput}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="이름이나 하고 싶은 계산으로 찾기 — 예: 퇴직금, 평수"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-controls="tools-results"
            />
            {q && (
              <button type="button" className={styles.searchClear} onClick={() => setQ('')} aria-label="검색어 지우기">
                <UiIcon name="x" size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tlWrap}>
        <p className="srOnly" aria-live="polite">{query ? (results.length > 0 ? `검색 결과 ${results.length}개` : '검색 결과 없음') : ''}</p>
        <div id="tools-results">
          {query && (
            <div className={styles.results}>
              {results.length === 0 ? (
                <p className={styles.noResults}>
                  <strong>&lsquo;{query}&rsquo;</strong>에 맞는 도구를 찾지 못했어요.<br />
                  다른 낱말로 검색하거나 아래 분야 목록에서 찾아보세요.
                </p>
              ) : (
                <>
                  {partial
                    ? <p className={styles.searchNote}>정확히 맞는 도구가 없어 일부 낱말이 맞는 도구를 보여 드려요.</p>
                    : <p className={styles.searchCount}>검색 결과 {results.length}개</p>}
                  <ul className={styles.toolGrid}>
                    {results.map(({ tool, category }) => (
                      <ToolRow key={tool.href} tool={tool} badge={badges[tool.href]} catId={category?.id} catName={category?.name.split('·')[0]} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* 기본 목록 — 검색 중에는 숨김(hidden)만 하고 SSR 링크는 유지 */}
        <div hidden={!!query}>
          <nav className={styles.catNav} aria-label="분야로 이동">
            {sections.map((s) => (
              <a key={s.catId} href={`#cat-${s.catId}`} className={styles.catChip} data-cat={s.catId}>
                <i aria-hidden="true" />{s.name}
              </a>
            ))}
          </nav>

          {sections.map((s, idx) => (
            <section key={s.catId} id={`cat-${s.catId}`} className={styles.catSection} data-cat={s.catId} aria-labelledby={`cat-${s.catId}-h`}>
              <div className={styles.catHeader}>
                <div className={styles.catHeaderLeft}>
                  <span className="ui-chipIc" aria-hidden="true"><CatIcon id={s.catId} size={20} /></span>
                  <div>
                    <h2 className={styles.catHeaderName} id={`cat-${s.catId}-h`}>{s.name}</h2>
                    {s.tagline && <p className={styles.catHeaderTag}>{s.tagline}</p>}
                  </div>
                </div>
                <Link href={`/tools/${s.catId}`} className={styles.catHeaderMore}>분야 안내<UiIcon name="chev-r" size={16} /></Link>
              </div>

              {s.groups.map((g) => {
                const tools = g.hrefs.map((h) => toolByHref.get(h)).filter((t): t is Tool => !!t)
                if (tools.length === 0) return null
                return (
                  <div key={g.name} className={styles.group}>
                    <h3 className={styles.groupH}>{g.name} <small>{tools.length}</small></h3>
                    <ul className={styles.toolGrid}>
                      {tools.map((t) => <ToolRow key={t.href} tool={t} badge={badges[t.href]} catId={s.catId} />)}
                    </ul>
                  </div>
                )
              })}

              {/* 래퍼 없이 — /tools는 심사 전 AD_FREE_EXACT라 AdSlot이 null이면 빈 여백도 남지 않는다(간격은 AdSlot 몫) */}
              {idx === midIdx && <AdSlot position="between-tools" minHeight={250} />}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
