// ─────────────────────────────────────────────────────────────
// 헤더 내비게이션 — 최근 사용·즐겨찾기 (localStorage)
// ─────────────────────────────────────────────────────────────

export interface RecentEntry {
  href: string
  ts: number  // unix ms
}

export interface UserNav {
  recents: RecentEntry[]
  favorites: string[]  // hrefs
}

const KEY = 'youtil:nav:v1'
/** storage 이벤트 구독용(다른 탭에서 바뀐 경우) — 키 이름 자체는 개명 금지 */
export const USER_NAV_STORAGE_KEY = KEY
const MAX_RECENTS = 10
const RECENT_TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7일

const EMPTY: UserNav = { recents: [], favorites: [] }

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** 도구 경로 문자열만 통과 — 외부 URL·스크립트 스킴이 링크 href로 흘러가지 않게 */
const isToolHref = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= 120 && isToolPath(v)

/* JSON.parse 결과 검증 (CLAUDE.md: 무검증 `as T` 금지).
   손상·구버전·타 탭이 쓴 값이 섞여 있어도 항목 단위로 버리고 나머지는 살린다. 키(youtil:nav:v1)는 유지. */
function parseUserNav(raw: unknown, now: number): UserNav {
  if (!isObj(raw)) return EMPTY
  const seen = new Set<string>()
  const recents: RecentEntry[] = []
  if (Array.isArray(raw.recents)) {
    for (const r of raw.recents) {
      if (!isObj(r) || !isToolHref(r.href) || typeof r.ts !== 'number' || !Number.isFinite(r.ts)) continue
      if (now - r.ts >= RECENT_TTL_MS || seen.has(r.href)) continue
      seen.add(r.href)
      recents.push({ href: r.href, ts: r.ts })
      if (recents.length >= MAX_RECENTS) break
    }
  }
  const favorites: string[] = []
  if (Array.isArray(raw.favorites)) {
    for (const f of raw.favorites) {
      if (isToolHref(f) && !favorites.includes(f)) favorites.push(f)
    }
  }
  return { recents, favorites }
}

export function loadUserNav(): UserNav {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    return parseUserNav(JSON.parse(raw), Date.now())
  } catch {
    return EMPTY
  }
}

/** 같은 탭 안의 다른 컴포넌트(헤더 Nav ↔ 도구 페이지 별표 버튼)에 변경을 알리는 이벤트.
 *  storage 이벤트는 다른 탭에서만 오므로 별도로 쏜다. */
export const USER_NAV_EVENT = 'youtil:nav-change'

export function saveUserNav(nav: UserNav): void {
  if (typeof window === 'undefined') return
  try {
    const next = JSON.stringify(nav)
    // 내용이 같으면 쓰지도 알리지도 않는다 — 이벤트를 받은 쪽이 다시 저장해도 핑퐁이 생기지 않는다
    if (localStorage.getItem(KEY) === next) return
    localStorage.setItem(KEY, next)
    window.dispatchEvent(new Event(USER_NAV_EVENT))
  } catch {
    // quota — 무시
  }
}

export function recordVisit(nav: UserNav, href: string): UserNav {
  const recents = [
    { href, ts: Date.now() },
    ...nav.recents.filter((r) => r.href !== href),
  ].slice(0, MAX_RECENTS)
  return { ...nav, recents }
}

export function toggleFavorite(nav: UserNav, href: string): UserNav {
  const favorites = nav.favorites.includes(href)
    ? nav.favorites.filter((h) => h !== href)
    : [...nav.favorites, href]
  return { ...nav, favorites }
}

// /tools/{category}/{tool} 패턴만 도구로 판정 (카테고리 인덱스·정적 페이지 제외)
export function isToolPath(pathname: string): boolean {
  return /^\/tools\/[a-z-]+\/[a-z0-9-]+\/?$/.test(pathname)
}
