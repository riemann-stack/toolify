// ──────────────────────────────────────────────────────
// lib/ads.ts — 광고(Google AdSense) 단일 설정 소스
// 수동 AdSlot·자동 광고 로더가 모두 이 파일을 참조합니다.
// ──────────────────────────────────────────────────────

import { allTools } from './tools'

declare global {
  interface Window {
    /** AdSense 큐. 스크립트 로드 전엔 배열, 로드 후엔 push를 가진 객체로 교체된다.
     *  pauseAdRequests: 1이면 신규 광고 요청 보류, 0이면 재개. Google이 문서화한 사용법은
     *  '스크립트 로드 전에 1 → 이후 0으로 재개'뿐 — 로드 후에 1로 바꾸는 AutoAds의 사용은 best-effort. */
    adsbygoogle?: unknown[] & { pauseAdRequests?: 0 | 1; loaded?: boolean }
  }
}

/** AdSense 게시자 ID. */
export const ADSENSE_CLIENT_ID = 'ca-pub-9104888603507576'

/** 자동 광고 스크립트 URL (AutoAds 로더 + 로드 여부 판별이 같은 값을 써야 함). */
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`

/**
 * 광고 전역 활성화 스위치.
 * true 이면 자동 광고 스크립트(adsbygoogle.js)가 (제외 경로를 제외한) 전 페이지에 로드됩니다.
 * AdSense 심사·서빙에 필요합니다.
 */
export const ADS_ENABLED = true

/**
 * 광고 제외 경로 — AdSense 정책상 민감/제한 카테고리. (심사 여부와 무관한 영구 제외)
 * 주류·도박 인접·민감 건강 정보 도구는 광고를 게재하지 않습니다.
 * (정책 위반 리스크 회피 + 사용자 신뢰. 페이지 자체는 색인 유지.)
 */
export const AD_EXCLUDED_PATHS: readonly string[] = [
  '/tools/health/blood-alcohol', // 혈중알코올(음주운전)
  '/tools/life/alcohol',         // 알코올 도수
  '/tools/life/lotto',           // 로또(도박 인접)
  '/tools/health/cycle',         // 생리주기(민감 건강 정보)
  '/tools/health/pregnancy',     // 임신 주수(민감 건강 정보 — cycle과 동일 계열)
  '/tools/health/hba1c',         // 당화혈색소(당뇨 진단 구간 — 건강 상태 추정 가능)
] as const

/**
 * 심사 모드 스위치 — AdSense 심사(재신청) 기간 동안 true.
 *
 * true면 AD_REVIEW_EXCLUDED_PATHS(인터랙션 전용·게임·타이머·측정·노벨티 화면)에서도
 * 광고 스크립트·슬롯을 만들지 않는다. 정책의 "게시자 콘텐츠가 없는 화면
 * (사용자가 화면을 읽지 않는 것이 주목적 — 타이머·게임·측정·도구 조작)"으로 오판될 수 있는
 * 표본을 심사 크롤러가 보는 광고 게재 화면에서 뺀다. 페이지 자체는 색인 유지.
 *
 * ▶ 승인 후 되돌리는 법: 이 값을 false로 바꾸는 한 줄 커밋이면 된다.
 *   - 커밋 제목에 `[skip-lastmod]`를 넣어 sitemap lastmod가 리셋되지 않게 할 것
 *     (scripts/gen-lastmod.mts 참고 — 광고 설정은 페이지 콘텐츠 변경이 아님).
 *   - 영구 제외(AD_EXCLUDED_PATHS)와 정책/내비 페이지(AD_FREE_EXACT)는 그대로 유지된다.
 *   - 일부만 풀고 싶다면 목록에서 해당 줄을 지운다(승인 후 단계적 확대 권장).
 */
export const AD_REVIEW_MODE = true

/** 심사 모드 한정 제외 경로 — AD_REVIEW_MODE=false 가 되면 광고 허용으로 돌아간다. */
export const AD_REVIEW_EXCLUDED_PATHS: readonly string[] = [
  // 타이머·시계·측정 (화면을 '읽지' 않고 조작·대기하는 것이 주목적)
  '/tools/life/pomodoro',
  '/tools/cooking/egg-timer',
  '/tools/date/server-time',     // 티켓팅용 초시계
  '/tools/art/tap-tempo',
  '/tools/dev/network-test',
  '/tools/art/vocal-range',      // 마이크 측정
  '/tools/dev/og-preview',       // URL 입력 → 외부 페이지 메타 조회(행동 목적 화면)
  // 게임·추첨·노벨티
  '/tools/life/ladder',
  '/tools/life/random',
  '/tools/edu/cognitive-test',
  '/tools/life/drake',
  '/tools/life/monty-hall',
  '/tools/edu/cosmic-calendar',
] as const

/** 끝 슬래시 정규화 (루트는 유지). */
function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

function matchesAny(list: readonly string[], p: string): boolean {
  return list.some((x) => p === x || p.startsWith(x + '/'))
}

/** 해당 경로가 광고 제외 대상인지 판별 (영구 제외 + 심사 모드 제외). 정확 일치 또는 하위 경로 매칭. */
export function isAdExcluded(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const p = normalizePath(pathname)
  if (matchesAny(AD_EXCLUDED_PATHS, p)) return true
  return AD_REVIEW_MODE && matchesAny(AD_REVIEW_EXCLUDED_PATHS, p)
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
  const p = normalizePath(pathname)
  if (AD_FREE_EXACT.has(p)) return true
  // 컬렉션(큐레이션 목록) — 인덱스·개별 슬러그 모두
  if (p === '/collections' || p.startsWith('/collections/')) return true
  // 카테고리 랜딩 (/tools/<카테고리>) — 한 세그먼트. 도구 페이지는 두 세그먼트라 미해당.
  if (/^\/tools\/[^/]+$/.test(p)) return true
  return false
}

/**
 * 광고 게재가 허용된 실제 도구 경로 화이트리스트.
 * 경로 '패턴'으로만 판정하면 존재하지 않는 경로(/tools/aaa/bbb, /nonexistent)도 통과해
 * **404 페이지(app/not-found.tsx)에 광고가 실린다** — Google 게시자 정책의
 * 'Valuable Inventory: 콘텐츠 없는 화면(오류 페이지)에 광고 게재 금지' 위반.
 * 그래서 허용 목록을 레지스트리에서 파생해 '실재하는 도구 페이지'일 때만 true로 뒤집는다.
 * (도구가 병합·삭제되면 레지스트리에서 빠지는 순간 자동으로 광고 대상에서도 빠진다.)
 */
const AD_ALLOWED_PATHS: ReadonlySet<string> = new Set(allTools.map((t) => t.href))

/**
 * 해당 경로에 광고(자동/수동)를 로드해도 되는지 — 실재 도구 경로만 허용(404·민감·심사모드·정책/내비 차단).
 *
 * 오류 화면(app/error.tsx): 경로는 정상 도구 경로 그대로라 이 함수만으로는 못 막는다.
 * → components/AutoAds.tsx 의 <AdFreeScreen />을 오류 화면에 렌더하면(렌더한 화면에서만 효과)
 *   AutoAds·AdSlot이 광고 생성을 멈춘다(확정적). 이미 로드된 스크립트에는 pauseAdRequests=1로
 *   신규 요청 보류를 '시도'할 뿐이다 — Google 문서 밖 사용법이라 best-effort.
 *   배포 후 DevTools 네트워크 패널에서 보류가 실제로 먹는지 확인할 것(AutoAds.tsx 헤더 주석의 절차).
 */
export function adsAllowed(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const p = normalizePath(pathname)
  if (!AD_ALLOWED_PATHS.has(p)) return false // 존재하지 않는 경로 = 404 → 광고 금지
  return !isAdExcluded(p) && !isAdRestrictedPage(p)
}
