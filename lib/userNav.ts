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
const MAX_RECENTS = 10
const RECENT_TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7일

const EMPTY: UserNav = { recents: [], favorites: [] }

export function loadUserNav(): UserNav {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<UserNav>
    const now = Date.now()
    return {
      recents: (parsed.recents ?? []).filter((r) => now - r.ts < RECENT_TTL_MS).slice(0, MAX_RECENTS),
      favorites: parsed.favorites ?? [],
    }
  } catch {
    return EMPTY
  }
}

export function saveUserNav(nav: UserNav): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(nav))
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
