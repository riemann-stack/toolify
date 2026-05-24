// ──────────────────────────────────────────────────────
// lib/ads.ts — 광고(Google AdSense) 단일 설정 소스
// 수동 AdSlot·자동 광고 로더가 모두 이 파일을 참조합니다.
// ──────────────────────────────────────────────────────

/** AdSense 게시자 ID (승인 후 'ca-pub-XXXXXXXXXXXXXXXX' 로 교체). */
export const ADSENSE_CLIENT_ID = '' // 예: 'ca-pub-0000000000000000'

/**
 * 광고 전역 활성화 스위치.
 * AdSense 승인 + ADSENSE_CLIENT_ID 입력 후 true 로 바꾸면
 * 자동 광고 스크립트가 (제외 경로를 제외한) 전 페이지에 로드됩니다.
 */
export const ADS_ENABLED = false

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
