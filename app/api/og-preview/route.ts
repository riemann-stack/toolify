// ─────────────────────────────────────────────────────────────
// /api/og-preview?url=https://example.com
//   - 외부 페이지 HTML을 받아와 og:* / twitter:* / title / canonical 메타태그 추출
//   - 같은 출처 클라이언트(OgPreviewClient) 전용. CORS 헤더 없음 + 교차 사이트 브라우저 호출 403.
//   - SSRF 방어: URL·리다이렉트 홉별 검증 + DNS 해석 결과 검증·핀 고정(fetchHtml.ts), 8초 예산, 본문 512KB 상한.
//   - 성공 응답만 5분 CDN 캐시(s-maxage) — 같은 URL 반복 조회 시 함수·대상 서버 호출 절감.
//     실패·400은 no-store (일시 오류가 캐시에 남아 재시도를 막지 않게).
// 응답 계약(클라이언트): { ok, url?, fetchedUrl?, status?, tags?, error? }
// ─────────────────────────────────────────────────────────────

import { apiJson, crossSiteForbidden, isCrossSiteRequest } from '../_lib/http'
import { checkTargetUrl } from '../_lib/ssrf'
import { fetchHtml, FetchHtmlError } from './fetchHtml'

// DNS 해석 검증(node:dns)·연결 핀 고정(node:https lookup 훅)이 필요해 Node 런타임.
// 서울 리전 — 국내 사이트의 해외 IP 차단·지연 회피 (Edge 시절과 같은 근접성).
export const runtime = 'nodejs'
export const preferredRegion = 'icn1'
export const dynamic = 'force-dynamic'

const TIMEOUT_MS = 8000
const MAX_BYTES = 512 * 1024
const MAX_REDIRECTS = 5
const CACHE_OK = 'public, max-age=300, s-maxage=300'

interface MetaResponse {
  ok: boolean
  url?: string
  fetchedUrl?: string
  status?: number
  tags?: Record<string, string>
  error?: string
}

/** 성공한 미리보기만 CDN 캐시 — 실패(타임아웃·일시적 네트워크 오류·400 검증 실패)를 5분간 고정하면
 *  대상 서버가 복구돼도 같은 URL 재시도가 캐시된 실패만 돌려받는다. */
function json(data: MetaResponse, status = 200): Response {
  return apiJson(data, status, data.ok ? CACHE_OK : 'no-store')
}

export async function GET(req: Request): Promise<Response> {
  if (isCrossSiteRequest(req)) return crossSiteForbidden()

  const param = new URL(req.url).searchParams.get('url')?.trim()
  if (!param) return json({ ok: false, error: 'url 파라미터가 필요합니다.' }, 400)
  if (param.length > 2048) return json({ ok: false, error: 'URL이 너무 깁니다 (최대 2,048자).' }, 400)

  let target: URL
  try {
    target = new URL(param)
  } catch {
    return json({ ok: false, error: '유효한 URL 형식이 아닙니다 (http:// 또는 https:// 시작).' }, 400)
  }
  const bad = checkTargetUrl(target)
  if (bad) return json({ ok: false, error: bad.message }, 400)

  try {
    const { finalUrl, status, html } = await fetchHtml(target, {
      timeoutMs: TIMEOUT_MS,
      maxBytes: MAX_BYTES,
      maxRedirects: MAX_REDIRECTS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YoutilOGPreview/1.0; +https://youtil.kr)',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    })
    const tags = extractMetaTags(html)
    return json({ ok: true, url: target.toString(), fetchedUrl: finalUrl, status, tags })
  } catch (e) {
    if (e instanceof FetchHtmlError) {
      switch (e.code) {
        case 'blocked':
          return json({
            ok: false,
            error: e.redirected ? `리다이렉트 목적지 차단: ${e.message}` : e.message,
          }, 400)
        case 'timeout':
          return json({ ok: false, error: '응답 시간 초과 (8초). 대상 서버가 느리거나 차단했을 수 있습니다.' })
        case 'not_html':
          return json({ ok: false, error: e.message, status: e.status })
        case 'dns':
        case 'too_many_redirects':
        case 'bad_redirect':
          return json({ ok: false, error: e.message })
        default:
          break
      }
    }
    return json({ ok: false, error: '페이지를 불러올 수 없습니다 — 네트워크 오류 또는 봇 차단.' })
  }
}

function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {}

  // <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) tags['title'] = decodeEntities(titleMatch[1].replace(/\s+/g, ' ').trim())

  // <meta property|name="..." content="...">
  const metaRegex = /<meta\b[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = metaRegex.exec(html)) !== null) {
    const tag = m[0]
    const propAttr =
      tag.match(/\bproperty\s*=\s*["']([^"']+)["']/i)?.[1] ??
      tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1]
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]
    if (propAttr && content !== undefined) {
      const key = propAttr.toLowerCase()
      // 첫 번째 값 우선 (중복 방지)
      if (!(key in tags)) tags[key] = decodeEntities(content)
    }
  }

  // <link rel="canonical">
  const linkRegex = /<link\b[^>]*>/gi
  while ((m = linkRegex.exec(html)) !== null) {
    const tag = m[0]
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    if (rel === 'canonical' && href) tags['canonical'] = href
    if (rel === 'icon' && href && !tags['favicon']) tags['favicon'] = href
  }

  return tags
}

/** 코드 포인트 → 문자. 범위 밖·서로게이트 단독값은 원문 유지 (fromCharCode는 이모지 등 BMP 밖을 깨뜨림) */
function fromCodePointSafe(cp: number, raw: string): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return raw
  return String.fromCodePoint(cp)
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (raw, c: string) => fromCodePointSafe(parseInt(c, 10), raw))
    .replace(/&#x([0-9a-f]+);/gi, (raw, c: string) => fromCodePointSafe(parseInt(c, 16), raw))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // 마지막 — '&amp;lt;'가 '<'로 이중 해석되지 않게
}
