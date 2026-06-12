/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './http-status.module.css'
import {
  CATEGORIES, CATEGORY_META, POPULAR_CODES, DEBUG_SCENARIOS, CONFUSION_PAIRS,
  type StatusCode, type CategoryFilter, type DebugCategory, type CategoryKey,
  searchCodes, findCode, getStats, getCodesByCategory,
} from './httpStatusUtils'

type Tab = 'search' | 'categories' | 'debug' | 'guide'

const STORAGE_KEY = 'youtil_http_status_v1'
const FAV_KEY = 'youtil_http_status_favs'

const DEBUG_FILTERS: { id: DebugCategory; label: string; emoji: string }[] = [
  { id: 'all',        label: '전체',          emoji: '✨' },
  { id: 'auth',       label: '인증',          emoji: '🔐' },
  { id: 'cors',       label: 'CORS',         emoji: '🌐' },
  { id: 'timeout',    label: '타임아웃',       emoji: '⏱️' },
  { id: 'rate',       label: 'Rate Limit',   emoji: '🚦' },
  { id: 'server',     label: '서버 오류',      emoji: '🚨' },
  { id: 'redirect',   label: '리다이렉트',     emoji: '↪️' },
  { id: 'validation', label: 'Validation',   emoji: '📋' },
]

export default function HttpStatusClient() {
  const [tab, setTab] = useState<Tab>('search')

  /* ═══ 검색 상태 ═══ */
  const [query, setQuery] = useState<string>('')
  const [debouncedQuery, setDebouncedQuery] = useState<string>('')
  const [filter, setFilter] = useState<CategoryFilter>('all')

  /* 단일 선택 (상세 보기) */
  const [selectedCode, setSelectedCode] = useState<number | null>(null)

  /* 즐겨찾기 (별도 키) */
  const [favorites, setFavorites] = useState<number[]>([])

  /* ═══ 디버깅 필터 ═══ */
  const [debugFilter, setDebugFilter] = useState<DebugCategory>('all')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        if (typeof j.query === 'string') setQuery(j.query)
        if (j.filter) setFilter(j.filter)
      }
      const favRaw = localStorage.getItem(FAV_KEY)
      if (favRaw) {
        const f = JSON.parse(favRaw)
        if (Array.isArray(f)) setFavorites(f.filter((n) => typeof n === 'number'))
      }
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ query, filter }))
    } catch {}
  }, [query, filter])
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites))
    } catch {}
  }, [favorites])

  /* 디바운스 (정적 데이터라 100ms로 충분) */
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 100)
    return () => clearTimeout(handle)
  }, [query])

  /* 검색 결과 */
  const results = useMemo(
    () => searchCodes(debouncedQuery, filter, favorites),
    [debouncedQuery, filter, favorites],
  )

  /* 정확 단일 매칭 시 자동 선택 */
  useEffect(() => {
    if (debouncedQuery.trim() && /^\d{3}$/.test(debouncedQuery.trim())) {
      const exact = findCode(parseInt(debouncedQuery.trim(), 10))
      if (exact) setSelectedCode(exact.code)
    }
  }, [debouncedQuery])

  const selected = useMemo(
    () => selectedCode != null ? findCode(selectedCode) : null,
    [selectedCode],
  )

  /* 즐겨찾기 토글 */
  const toggleFav = (code: number) => {
    setFavorites((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
  }

  /* 빠른 칩 클릭 */
  const onQuickClick = (code: number) => {
    setSelectedCode(code)
    setQuery(String(code))
  }

  /* 상세에서 카테고리 색상 */
  const catColor = (cat: CategoryKey) => CATEGORY_META[cat].color

  /* 디버깅 시나리오 필터 */
  const filteredScenarios = useMemo(
    () => debugFilter === 'all' ? DEBUG_SCENARIOS : DEBUG_SCENARIOS.filter((s) => s.category === debugFilter),
    [debugFilter],
  )

  /* 통계 (가이드 탭) */
  const stats = useMemo(() => getStats(), [])

  /* 시나리오에서 코드 칩 클릭 → 상세 */
  const goToDetail = (code: number) => {
    setSelectedCode(code)
    setTab('search')
    setFilter('all')
    setQuery(String(code))
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'search' ? s.tabActive : ''}`}     onClick={() => setTab('search')}>🔍 검색</button>
        <button className={`${s.tab} ${tab === 'categories' ? s.tabActive : ''}`} onClick={() => setTab('categories')}>📊 카테고리</button>
        <button className={`${s.tab} ${tab === 'debug' ? s.tabActive : ''}`}      onClick={() => setTab('debug')}>🐛 디버깅</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}      onClick={() => setTab('guide')}>📖 가이드</button>
      </div>

      {/* ═════════════ 탭 1: 검색 ═════════════ */}
      {tab === 'search' && (
        <>
          <div className={s.card}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="코드 번호 또는 키워드 (404, not found, 인증, timeout...)"
              className={s.searchInput}
            />
            <div className={s.quickRow}>
              {POPULAR_CODES.map((code) => {
                const c = findCode(code)
                if (!c) return null
                return (
                  <button
                    key={code}
                    className={s.quickChip}
                    style={{ borderColor: catColor(c.category) + '40', color: catColor(c.category) }}
                    onClick={() => onQuickClick(code)}
                  >
                    {code}
                  </button>
                )
              })}
            </div>
            <div className={s.filterRow}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`${s.filterChip} ${filter === cat.id ? s.filterChipActive : ''}`}
                  onClick={() => { setFilter(cat.id); setSelectedCode(null) }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 영역 */}
          {selected ? (
            <DetailCard
              code={selected}
              isFav={favorites.includes(selected.code)}
              onToggleFav={() => toggleFav(selected.code)}
              onClose={() => setSelectedCode(null)}
              color={catColor(selected.category)}
              categoryLabel={CATEGORY_META[selected.category].label}
            />
          ) : results.length === 0 ? (
            <div className={s.emptyState}>
              <p>검색 결과가 없습니다.</p>
              <p className={s.muted}>인기 코드를 시도해 보세요:</p>
              <div className={s.quickRow} style={{ justifyContent: 'center' }}>
                {[200, 404, 500, 401].map((c) => (
                  <button key={c} className={s.quickChip} onClick={() => onQuickClick(c)}>{c}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className={s.resultsGrid}>
              {results.slice(0, 60).map((c) => (
                <CodeCard
                  key={c.code}
                  code={c}
                  color={catColor(c.category)}
                  isFav={favorites.includes(c.code)}
                  onClick={() => setSelectedCode(c.code)}
                  onToggleFav={(e) => { e.stopPropagation(); toggleFav(c.code) }}
                />
              ))}
              {results.length > 60 && (
                <p className={s.hint} style={{ gridColumn: '1 / -1' }}>... 첫 60개만 표시 (전체 {results.length}개)</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ═════════════ 탭 2: 카테고리별 ═════════════ */}
      {tab === 'categories' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📊 통계</span>
            <p className={s.statText}>
              총 <strong className={s.statBig}>{stats.total}</strong>개 코드 · 표준 {stats.standard}개 · 비표준 {stats.nonstandard}개
            </p>
            <div className={s.jumpRow}>
              {(['1xx', '2xx', '3xx', '4xx', '5xx', 'nonstandard'] as CategoryKey[]).map((cat) => (
                <a key={cat} href={`#cat-${cat}`} className={s.jumpChip}
                   style={{ borderColor: CATEGORY_META[cat].color + '40', color: CATEGORY_META[cat].color }}>
                  {CATEGORY_META[cat].emoji} {cat}
                </a>
              ))}
            </div>
          </div>

          {(['1xx', '2xx', '3xx', '4xx', '5xx', 'nonstandard'] as CategoryKey[]).map((cat) => {
            const codes = getCodesByCategory(cat)
            const meta = CATEGORY_META[cat]
            return (
              <div key={cat} id={`cat-${cat}`} className={s.catSection} style={{ borderLeftColor: meta.color }}>
                <div className={s.catHeader}>
                  <h3 className={s.catTitle} style={{ color: meta.color }}>
                    {meta.emoji} {cat} {meta.label}
                  </h3>
                  <span className={s.catRange}>{meta.range} · {codes.length}개</span>
                </div>
                <p className={s.catDesc}>{meta.desc}</p>
                <div className={s.codeMiniGrid}>
                  {codes.map((c) => (
                    <button
                      key={c.code}
                      className={s.miniCard}
                      onClick={() => { setSelectedCode(c.code); setTab('search') }}
                    >
                      <span className={s.miniNum} style={{ color: meta.color }}>{c.code}</span>
                      <span className={s.miniName}>{c.name}</span>
                      <span className={s.miniNameKr}>{c.nameKr}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* ═════════════ 탭 3: 디버깅 ═════════════ */}
      {tab === 'debug' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🏷️ 시나리오 카테고리</span>
            <div className={s.filterRow}>
              {DEBUG_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`${s.filterChip} ${debugFilter === f.id ? s.filterChipActive : ''}`}
                  onClick={() => setDebugFilter(f.id)}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredScenarios.map((sc) => (
            <div key={sc.id} className={s.scenarioCard}>
              <p className={s.scenarioTitle}>{sc.emoji} {sc.title}</p>
              <div className={s.scenarioSection}>
                <p className={s.scenarioSubtitle}>📍 가능한 원인</p>
                <ul className={s.scenarioList}>
                  {sc.causes.map((cause, i) => <li key={i}>{cause}</li>)}
                </ul>
              </div>
              <div className={s.scenarioSection}>
                <p className={s.scenarioSubtitle}>🔧 단계별 해결</p>
                <ol className={s.scenarioListNum}>
                  {sc.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <div className={s.scenarioCodes}>
                <span className={s.scenarioCodesLabel}>관련 코드:</span>
                {sc.relatedCodes.map((rc) => {
                  const c = findCode(rc)
                  if (!c) return null
                  return (
                    <button
                      key={rc}
                      className={s.relatedChip}
                      style={{ borderColor: catColor(c.category) + '40', color: catColor(c.category) }}
                      onClick={() => goToDetail(rc)}
                    >
                      {rc} {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ═════════════ 탭 4: 가이드 ═════════════ */}
      {tab === 'guide' && (
        <>
          {/* 5 카테고리 의미 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 5+1 카테고리 의미</span>
            <table className={s.guideTable}>
              <thead>
                <tr><th scope="col">카테고리</th><th scope="col">범위</th><th scope="col">의미</th><th scope="col">대표 코드</th></tr>
              </thead>
              <tbody>
                {(['1xx', '2xx', '3xx', '4xx', '5xx', 'nonstandard'] as CategoryKey[]).map((cat) => {
                  const meta = CATEGORY_META[cat]
                  const samples = getCodesByCategory(cat).slice(0, 4).map((c) => c.code).join(', ')
                  return (
                    <tr key={cat}>
                      <td><span style={{ color: meta.color, fontWeight: 700 }}>{meta.emoji} {cat}</span></td>
                      <td>{meta.range}</td>
                      <td>{meta.label} ({meta.desc})</td>
                      <td className={s.mono}>{samples}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 흔한 혼동 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🆚 흔한 혼동 비교 5쌍</span>
            <div className={s.confusionGrid}>
              {CONFUSION_PAIRS.map((pair, i) => {
                const a = findCode(pair.a)
                const b = findCode(pair.b)
                return (
                  <div key={i} className={s.confusionCard}>
                    <div className={s.confusionHead}>
                      <button className={s.confusionCode} onClick={() => goToDetail(pair.a)} style={{ color: a ? catColor(a.category) : 'inherit' }}>
                        {pair.a}
                      </button>
                      <span className={s.confusionVs}>vs</span>
                      <button className={s.confusionCode} onClick={() => goToDetail(pair.b)} style={{ color: b ? catColor(b.category) : 'inherit' }}>
                        {pair.b}
                      </button>
                    </div>
                    <div className={s.confusionBody}>
                      <p><strong>{pair.a}</strong>: {pair.aDesc}</p>
                      <p><strong>{pair.b}</strong>: {pair.bDesc}</p>
                      <p className={s.confusionUsage}>💡 {pair.usage}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 표준 vs 비표준 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📜 표준 vs 비표준 출처</span>
            <ul className={s.warnList}>
              <li><strong>표준 (RFC)</strong>: 7231 (HTTP/1.1)·6585 (추가)·8297 (103)·7235 (인증)·7232 (조건부)·7538 (308)·7540 (HTTP/2)·4918 (WebDAV)·9110 (HTTP 의미론, 최신)</li>
              <li><strong>Cloudflare 5xx (520~530)</strong>: Cloudflare 자체 정의 — Origin 서버 통신 문제</li>
              <li><strong>nginx (444·494·499)</strong>: nginx 내부 코드 — 클라이언트 종료·헤더 크기·차단</li>
              <li><strong>Microsoft IIS</strong>: 440 (Login Time-out), 449 (Retry With), 451 (Redirect)</li>
            </ul>
          </div>

          {/* 프레임워크별 응답 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🛠️ 프레임워크별 기본 응답 코드</span>
            <table className={s.guideTable}>
              <thead>
                <tr><th scope="col">프레임워크</th><th scope="col">패턴</th><th scope="col">기본 응답</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>🍃 Spring Boot</strong></td><td><code className={s.codeMono}>@PostMapping</code></td><td>200 OK (또는 ResponseEntity로 201)</td></tr>
                <tr><td><strong>🍃 Spring Boot</strong></td><td><code className={s.codeMono}>@DeleteMapping</code></td><td>200 OK (수동 204 권장)</td></tr>
                <tr><td><strong>🍃 Spring Boot</strong></td><td>@Valid 실패</td><td>400 Bad Request (자동)</td></tr>
                <tr><td><strong>🟢 Express</strong></td><td><code className={s.codeMono}>res.json()</code></td><td>200 OK</td></tr>
                <tr><td><strong>🟢 Express</strong></td><td>error middleware</td><td>500 (next(err) 시 기본)</td></tr>
                <tr><td><strong>🐍 FastAPI</strong></td><td>Pydantic validation 실패</td><td>422 Unprocessable Entity</td></tr>
                <tr><td><strong>🐍 FastAPI</strong></td><td><code className={s.codeMono}>HTTPException</code></td><td>지정 status_code</td></tr>
                <tr><td><strong>🐍 Django REST</strong></td><td>serializer.is_valid() 실패</td><td>400 Bad Request</td></tr>
                <tr><td><strong>🐍 Django REST</strong></td><td>permission 실패</td><td>403 Forbidden</td></tr>
              </tbody>
            </table>
          </div>

          {/* 외부 링크 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔗 참고 링크</span>
            <ul className={s.linkList}>
              <li><a href="https://datatracker.ietf.org/doc/html/rfc7231" target="_blank" rel="noopener noreferrer">RFC 7231 — HTTP/1.1 의미론</a></li>
              <li><a href="https://datatracker.ietf.org/doc/html/rfc9110" target="_blank" rel="noopener noreferrer">RFC 9110 — HTTP 의미론 (최신, 2022)</a></li>
              <li><a href="https://developer.mozilla.org/ko/docs/Web/HTTP/Status" target="_blank" rel="noopener noreferrer">MDN HTTP Status Codes</a></li>
              <li><a href="https://developers.cloudflare.com/support/troubleshooting/http-status-codes/" target="_blank" rel="noopener noreferrer">Cloudflare HTTP Status Codes</a></li>
              <li><a href="https://httpstatuses.com" target="_blank" rel="noopener noreferrer">httpstatuses.com (영문 참고)</a></li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════
   서브 컴포넌트
   ═════════════════════════════════════════════ */

function CodeCard({ code, color, isFav, onClick, onToggleFav }: {
  code: StatusCode; color: string; isFav: boolean; onClick: () => void; onToggleFav: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className={s.codeCard}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      role="button"
      tabIndex={0}
      style={{ borderColor: color + '40' }}
    >
      <div className={s.codeCardHead}>
        <span className={s.codeBig} style={{ color }}>{code.code}</span>
        <button type="button" className={s.favBtn} onClick={onToggleFav} aria-label="즐겨찾기">
          {isFav ? '⭐' : '☆'}
        </button>
      </div>
      <p className={s.codeName}>{code.emoji} {code.name}</p>
      <p className={s.codeNameKr}>{code.nameKr}</p>
      <p className={s.codeShort}>{code.shortDesc}</p>
    </div>
  )
}

function DetailCard({ code, isFav, onToggleFav, onClose, color, categoryLabel }: {
  code: StatusCode; isFav: boolean; onToggleFav: () => void; onClose: () => void; color: string; categoryLabel: string
}) {
  return (
    <div className={s.detailCard} style={{ borderColor: color + '60' }}>
      <div className={s.detailHeader}>
        <button className={s.smBtn} onClick={onClose}>← 목록으로</button>
        <button className={s.favBtnLarge} onClick={onToggleFav}>
          {isFav ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기'}
        </button>
      </div>

      <div className={s.detailHero}>
        <p className={s.detailCode} style={{ color }}>{code.code}</p>
        <div className={s.detailMeta}>
          <p className={s.detailEmoji}>{code.emoji}</p>
          <p className={s.detailName}>{code.name}</p>
          <p className={s.detailNameKr}>{code.nameKr}</p>
          <div className={s.badgeRow}>
            <span className={s.badge} style={{ background: color + '20', color, borderColor: color }}>
              {categoryLabel}
            </span>
            {code.isStandard ? (
              <span className={s.badgeStandard}>RFC 표준</span>
            ) : (
              <span className={s.badgeNonstandard}>{code.source} 비표준</span>
            )}
          </div>
        </div>
      </div>

      <p className={s.detailShort}>{code.shortDesc}</p>
      <p className={s.detailLong}>{code.longDesc}</p>

      <div className={s.detailSection}>
        <h4 className={s.detailSectionTitle}>📍 언제 발생하나</h4>
        <ul className={s.detailList}>
          {code.whenItHappens.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      <div className={s.detailSection}>
        <h4 className={s.detailSectionTitle}>🔧 해결 힌트</h4>
        <ul className={s.detailList}>
          {code.howToFix.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </div>

      {code.koreanCase && (
        <div className={s.koreanBox}>
          <p className={s.koreanLabel}>🇰🇷 한국 사이트 사례</p>
          <p className={s.koreanText}>{code.koreanCase}</p>
        </div>
      )}

      {code.example && (
        <div className={s.detailSection}>
          <h4 className={s.detailSectionTitle}>📤 응답 예시</h4>
          <pre className={s.codeBlock}>{code.example.body}</pre>
        </div>
      )}

      {code.rfc && (
        <p className={s.detailRfc}>📎 {code.rfc}</p>
      )}
    </div>
  )
}
