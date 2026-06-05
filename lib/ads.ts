// ──────────────────────────────────────────────────────
// lib/ads.ts — 광고(Google AdSense) 단일 설정 소스
// 수동 AdSlot·자동 광고 로더가 모두 이 파일을 참조합니다.
// ──────────────────────────────────────────────────────

/** AdSense 게시자 ID. */
export const ADSENSE_CLIENT_ID = 'ca-pub-9104888603507576'

/**
 * 광고 전역 활성화 스위치.
 * true 이면 자동 광고 스크립트(adsbygoogle.js)가 (제외 경로를 제외한) 전 페이지에 로드됩니다.
 * AdSense 심사·서빙에 필요합니다.
 */
export const ADS_ENABLED = true

/**
 * 광고 제외 경로 — AdSense 정책상 민감/제한 카테고리.
 * 주류·도박 인접·민감 건강 정보 도구는 광고를 게재하지 않습니다.
 * (정책 위반 리스크 회피 + 사용자 신뢰. 페이지 자체는 색인 유지.)
 */
export const AD_EXCLUDED_PATHS: readonly string[] = [
  '/tools/health/blood-alcohol', // 혈중알코올(음주운전)
  '/tools/life/alcohol',         // 알코올 도수
  '/tools/life/lotto',           // 로또(도박 인접)
  '/tools/health/cycle',         // 생리주기(민감 건강 정보)
] as const

/** 해당 경로가 광고 제외 대상인지 판별. 정확 일치 또는 하위 경로 매칭. */
export function isAdExcluded(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return AD_EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

/**
 * 광고를 게재하지 않는 정책·내비게이션 페이지 (정확 일치).
 * - 정책/법적 페이지(개인정보·약관·소개·문의·면책): 광고에 부적합 → 영구 제외.
 * - 홈·전체도구 인덱스: 콘텐츠보다 내비게이션 성격 → 심사 안전상 제외.
 * Google Publisher Policies: 저가치·정책성 화면에는 광고(스크립트·슬롯)를 두지 않는다.
 * (승인 후 홈 등에 광고를 켜고 싶다면 해당 항목을 이 목록에서 빼면 됨.)
 */
const AD_FREE_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/tools',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
])

/** 정책/내비/랜딩 페이지 여부 — 실제 도구 페이지(/tools/<카테고리>/<도구>)는 제외 대상 아님. */
export function isAdRestrictedPage(pathname: string | null | undefined): boolean {
  if (!pathname) return true
  // 끝 슬래시 정규화 (루트는 유지)
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (AD_FREE_EXACT.has(p)) return true
  // 컬렉션(큐레이션 목록) — 인덱스·개별 슬러그 모두
  if (p === '/collections' || p.startsWith('/collections/')) return true
  // 카테고리 랜딩 (/tools/<카테고리>) — 한 세그먼트. 도구 페이지는 두 세그먼트라 미해당.
  if (/^\/tools\/[^/]+$/.test(p)) return true
  return false
}

/** 해당 경로에 광고(자동/수동)를 로드해도 되는지 — 민감 카테고리·정책/내비 페이지 모두 차단. */
export function adsAllowed(pathname: string | null | undefined): boolean {
  return !isAdExcluded(pathname) && !isAdRestrictedPage(pathname)
}
