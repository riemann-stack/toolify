// ─────────────────────────────────────────────────────────────
// API 응답 공통 — 보안·색인 헤더, 교차 사이트 호출 차단 (Node·Edge 공용)
// ─────────────────────────────────────────────────────────────

/** 모든 API 응답에 붙이는 헤더. robots.ts의 Disallow: /api/ 와 별개로 응답 자체에도 색인 제외 표시. */
export const API_BASE_HEADERS: Readonly<Record<string, string>> = {
  'X-Robots-Tag': 'noindex',
  'X-Content-Type-Options': 'nosniff',
}

export const NO_STORE = 'no-store, no-cache, must-revalidate, max-age=0'

/** JSON 응답 — CORS 헤더는 붙이지 않는다(호출처는 전부 같은 출처 youtil.kr 클라이언트). */
export function apiJson(data: unknown, status: number, cacheControl: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      ...API_BASE_HEADERS,
    },
  })
}

/** 사이트 공식 호스트 — 프리뷰(*.vercel.app)·로컬은 '요청 자신의 호스트'와 비교해 허용 */
const SITE_HOSTS: ReadonlySet<string> = new Set(['youtil.kr', 'www.youtil.kr'])

function hostOf(value: string): string | null {
  try {
    return new URL(value).host
  } catch {
    return null // 'null' Origin(샌드박스 iframe·file://) 포함
  }
}

/**
 * 다른 사이트의 브라우저 요청인지 — 핫링크·타 사이트 JS가 우리 함수·대역폭을 쓰는 것을 막는다.
 * 판정 순서:
 *   1) Sec-Fetch-Site(최신 브라우저가 항상 보냄): 'cross-site'만 차단. same-origin/same-site/none(주소창 직접) 허용.
 *   2) 없으면 Origin, 3) 그것도 없으면 Referer의 호스트가 우리 호스트인지.
 *   4) 셋 다 없으면 허용 — 구형 브라우저·리퍼러 차단 환경의 정상 사용자를 막지 않기 위함.
 *      (헤더는 서버 간 호출에서 얼마든지 위조 가능 — 이 검사는 '브라우저 경유 남용' 방지용이며,
 *       대량 호출은 Vercel Firewall 레이트리밋으로 막는다.)
 * 참고: 같은 출처 GET fetch는 Origin 헤더를 보내지 않는다(Fetch 표준) → Origin만으로 판정하면 안 됨.
 */
export function isCrossSiteRequest(req: Request): boolean {
  const h = req.headers
  const sfs = h.get('sec-fetch-site')
  if (sfs) return sfs.toLowerCase() === 'cross-site'

  const self = hostOf(req.url)
  const trusted = (value: string | null): boolean | null => {
    if (!value) return null
    const host = hostOf(value)
    return host !== null && (host === self || SITE_HOSTS.has(host))
  }
  const byOrigin = trusted(h.get('origin'))
  if (byOrigin !== null) return !byOrigin
  const byReferer = trusted(h.get('referer'))
  if (byReferer !== null) return !byReferer
  return false
}

/** 교차 사이트 요청 거절 응답 (캐시 금지 — CDN에 403이 남지 않게) */
export function crossSiteForbidden(): Response {
  return apiJson({ ok: false, error: '허용되지 않은 요청입니다 (외부 사이트에서의 호출 차단).' }, 403, 'no-store')
}
