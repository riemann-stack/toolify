// ─────────────────────────────────────────────────────────────
// /api/og-preview?url=https://example.com
//   - 외부 페이지 HTML을 받아와 og:* / twitter:* / title / canonical 메타태그 추출
//   - CORS 우회용. SSRF 보호 + 5분 캐시.
// ─────────────────────────────────────────────────────────────

export const runtime = 'edge'
export const revalidate = 300

interface MetaResponse {
  ok: boolean
  url?: string
  fetchedUrl?: string
  status?: number
  tags?: Record<string, string>
  error?: string
}

const PRIVATE_HOST = /^(localhost|127\.|0\.0\.0\.0|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i

function json(data: MetaResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function GET(req: Request): Promise<Response> {
  const param = new URL(req.url).searchParams.get('url')?.trim()
  if (!param) return json({ ok: false, error: 'url 파라미터가 필요합니다.' }, 400)

  let target: URL
  try {
    target = new URL(param)
  } catch {
    return json({ ok: false, error: '유효한 URL 형식이 아닙니다 (http:// 또는 https:// 시작).' }, 400)
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return json({ ok: false, error: 'http(s) 프로토콜만 지원합니다.' }, 400)
  }
  if (PRIVATE_HOST.test(target.hostname)) {
    return json({ ok: false, error: '내부망·로컬 주소는 차단됩니다.' }, 400)
  }

  try {
    const res = await fetch(target.toString(), {
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YoutilOGPreview/1.0; +https://youtil.kr)',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    })
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      return json({ ok: false, error: `HTML 페이지가 아닙니다 (Content-Type: ${ct || '없음'}).`, status: res.status })
    }
    // 본문 상한 200KB
    const reader = res.body?.getReader()
    if (!reader) return json({ ok: false, error: '응답 본문을 읽을 수 없습니다.' })
    const decoder = new TextDecoder('utf-8')
    let html = ''
    const MAX = 200_000
    while (html.length < MAX) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
    }
    try { await reader.cancel() } catch {}

    const tags = extractMetaTags(html)
    return json({ ok: true, url: target.toString(), fetchedUrl: res.url, status: res.status, tags })
  } catch (e) {
    const msg = (e as Error)?.name === 'TimeoutError'
      ? '응답 시간 초과 (8초). 대상 서버가 느리거나 차단했을 수 있습니다.'
      : '페이지를 불러올 수 없습니다 — 네트워크 오류 또는 봇 차단.'
    return json({ ok: false, error: msg })
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

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
    .replace(/&nbsp;/g, ' ')
}
