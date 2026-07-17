// ─────────────────────────────────────────────────────────────
// /api/proxy-time?url=<target>
// 임의 외부 사이트의 HTTP `Date` 응답 헤더를 프록시로 측정
// — 클라이언트는 CORS 차단으로 직접 못 가져오므로 Edge에서 대신 HEAD 요청
// ─────────────────────────────────────────────────────────────

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const TIMEOUT_MS = 5000

interface SuccessResult {
  ok: true
  serverTimeMs: number       // 서버 Date 헤더 (epoch ms, 초 정밀도) — 캐시 응답이면 Age초만큼 보정됨
  dateHeader: string         // 원본 헤더 값
  ageSec: number             // Age 헤더 (캐시 경과 초, 없으면 0)
  requestStartMs: number     // Edge 측 요청 시작
  responseEndMs: number      // Edge 측 응답 완료
  rttMs: number              // Edge → 사이트 왕복 시간
  httpStatus: number
  finalUrl: string           // 리다이렉트 후 최종 URL
}

interface ErrorResult {
  ok: false
  error: string
  reason?: 'invalid_url' | 'blocked_host' | 'timeout' | 'network' | 'no_date_header' | 'unparseable_date' | 'http_error'
}

type Result = SuccessResult | ErrorResult

function json(data: Result, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/* 대상 URL 검증 — 리다이렉트 홉마다 재호출 (SSRF 방지)
   ※ DNS rebinding(도메인이 사설 IP로 해석)은 Edge 런타임에서 IP 피닝이 불가해 막을 수 없음 —
   응답에서 Date 헤더·상태코드만 노출하므로 잔여 위험은 제한적. */
function validateTarget(target: URL): ErrorResult | null {
  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return { ok: false, error: 'http(s) 프로토콜만 지원합니다.', reason: 'invalid_url' }
  }
  // IPv6 리터럴은 URL.hostname이 대괄호를 포함([::1])하므로 벗겨서 비교
  const host = target.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  const blockedHosts = ['localhost', '0.0.0.0', '::', '::1']
  if (blockedHosts.includes(host) || host.endsWith('.local') || host.endsWith('.internal')) {
    return { ok: false, error: '내부망 호스트는 접근할 수 없습니다.', reason: 'blocked_host' }
  }
  // 사설·루프백·링크로컬 대역 (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, 0/8)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|127\.|169\.254\.|0\.)/.test(host)) {
    return { ok: false, error: '사설망 IP는 접근할 수 없습니다.', reason: 'blocked_host' }
  }
  // IPv4를 단일 10진수/16진수로 우회 표기(예: 2130706433, 0x7f000001)하는 형태 차단
  if (/^(\d+|0x[0-9a-f]+)$/.test(host)) {
    return { ok: false, error: '숫자형 호스트 표기는 지원하지 않습니다.', reason: 'blocked_host' }
  }
  // IPv6 루프백·링크로컬·ULA·v4-매핑 차단
  if (host.includes(':') && /^(fe80:|fc|fd|::ffff:)/.test(host)) {
    return { ok: false, error: '내부망 호스트는 접근할 수 없습니다.', reason: 'blocked_host' }
  }
  return null
}

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; YoutilServerTimeChecker/1.0; +https://youtil.kr/tools/date/server-time)',
  'Accept': '*/*',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
} as const

/* HEAD 시도 → 막히면 GET(1바이트)으로 폴백. redirect는 상위 루프가 수동 처리 */
async function fetchOnce(href: string, timeoutMs: number): Promise<Response> {
  try {
    return await fetch(href, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store',
      headers: COMMON_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (headErr) {
    try {
      return await fetch(href, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
        headers: { ...COMMON_HEADERS, 'Range': 'bytes=0-0' },
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch {
      throw headErr
    }
  }
}

const MAX_REDIRECTS = 5
const TOTAL_BUDGET_MS = 8000

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url).searchParams.get('url')?.trim()

  if (!url) return json({ ok: false, error: 'URL 파라미터가 필요합니다.', reason: 'invalid_url' }, 400)

  // URL 검증
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return json({ ok: false, error: '유효한 URL이 아닙니다.', reason: 'invalid_url' }, 400)
  }
  const firstErr = validateTarget(target)
  if (firstErr) return json(firstErr, 400)

  const t0 = Date.now()
  const deadline = t0 + TOTAL_BUDGET_MS
  try {
    // 리다이렉트를 수동 추적 — 매 홉의 목적지를 블록리스트로 재검증
    // (redirect:'follow'면 공개 사이트가 내부망으로 302할 때 검증을 우회함)
    let current = target
    let res: Response
    let hop = 0
    for (;;) {
      const hopErr = validateTarget(current)
      if (hopErr) return json({ ...hopErr, error: `리다이렉트 목적지 차단: ${hopErr.error}` }, 400)
      const remain = deadline - Date.now()
      if (remain <= 0) {
        return json({ ok: false, error: `${TOTAL_BUDGET_MS}ms 안에 응답이 없습니다.`, reason: 'timeout' })
      }
      try {
        res = await fetchOnce(current.href, Math.min(TIMEOUT_MS, remain))
      } catch (e) {
        if (e instanceof Error && e.name === 'TimeoutError') {
          return json({ ok: false, error: `${TIMEOUT_MS}ms 안에 응답이 없습니다.`, reason: 'timeout' })
        }
        return json({ ok: false, error: e instanceof Error ? e.message : '네트워크 오류', reason: 'network' })
      }
      const loc = res.headers.get('location')
      if (res.status >= 300 && res.status < 400 && loc) {
        if (++hop > MAX_REDIRECTS) {
          return json({ ok: false, error: `리다이렉트가 ${MAX_REDIRECTS}회를 초과했습니다.`, reason: 'network' })
        }
        try {
          current = new URL(loc, current)
        } catch {
          return json({ ok: false, error: '리다이렉트 URL 파싱 실패.', reason: 'network' })
        }
        continue
      }
      break
    }
    const t1 = Date.now()

    const dateHeader = res.headers.get('date')
    if (!dateHeader) {
      return json({
        ok: false,
        error: '응답에 Date 헤더가 없습니다. 이 사이트는 추적할 수 없습니다.',
        reason: 'no_date_header',
      })
    }
    const parsedDate = Date.parse(dateHeader)
    if (!Number.isFinite(parsedDate)) {
      return json({ ok: false, error: 'Date 헤더 파싱 실패.', reason: 'unparseable_date' })
    }
    // CDN 캐시 히트 시 Date는 원본 생성 시각 — RFC 9111의 current age(Age 헤더)만큼 보정해야 현재에 근사
    const ageSec = Math.max(0, parseInt(res.headers.get('age') ?? '0', 10) || 0)
    const serverTimeMs = parsedDate + ageSec * 1000

    return json({
      ok: true,
      serverTimeMs,
      dateHeader,
      ageSec,
      requestStartMs: t0,
      responseEndMs: t1,
      rttMs: t1 - t0,
      httpStatus: res.status,
      finalUrl: current.href,
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      return json({ ok: false, error: `${TIMEOUT_MS}ms 안에 응답이 없습니다.`, reason: 'timeout' })
    }
    return json({
      ok: false,
      error: e instanceof Error ? e.message : '네트워크 오류',
      reason: 'network',
    })
  }
}
