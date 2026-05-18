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
  serverTimeMs: number       // 서버 Date 헤더 (epoch ms, 초 정밀도)
  dateHeader: string         // 원본 헤더 값
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
  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return json({ ok: false, error: 'http(s) 프로토콜만 지원합니다.', reason: 'invalid_url' }, 400)
  }
  // 내부망·로컬·메타데이터 엔드포인트 차단 (SSRF 방지)
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '::1']
  if (blockedHosts.includes(target.hostname) || target.hostname.endsWith('.local')) {
    return json({ ok: false, error: '내부망 호스트는 접근할 수 없습니다.', reason: 'blocked_host' }, 400)
  }
  // 사설망 IP 차단 (10.x, 172.16-31.x, 192.168.x)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(target.hostname)) {
    return json({ ok: false, error: '사설망 IP는 접근할 수 없습니다.', reason: 'blocked_host' }, 400)
  }

  const t0 = Date.now()
  try {
    // HEAD 요청 — 본문 받지 않으므로 빠르고 부하 적음
    let res: Response
    try {
      res = await fetch(target.href, {
        method: 'HEAD',
        redirect: 'follow',
        cache: 'no-store',
        headers: {
          // 한국 사이트는 브라우저 UA를 선호 (봇 차단 회피)
          'User-Agent': 'Mozilla/5.0 (compatible; YoutilServerTimeChecker/1.0; +https://youtil.kr/tools/date/server-time)',
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (headErr) {
      // HEAD가 막힌 사이트는 GET으로 폴백 (range로 1바이트만)
      try {
        res = await fetch(target.href, {
          method: 'GET',
          redirect: 'follow',
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YoutilServerTimeChecker/1.0; +https://youtil.kr/tools/date/server-time)',
            'Accept': '*/*',
            'Range': 'bytes=0-0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
      } catch {
        if (headErr instanceof Error && headErr.name === 'TimeoutError') {
          return json({ ok: false, error: `${TIMEOUT_MS}ms 안에 응답이 없습니다.`, reason: 'timeout' })
        }
        return json({
          ok: false,
          error: headErr instanceof Error ? headErr.message : '네트워크 오류',
          reason: 'network',
        })
      }
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
    const serverTimeMs = Date.parse(dateHeader)
    if (!Number.isFinite(serverTimeMs)) {
      return json({ ok: false, error: 'Date 헤더 파싱 실패.', reason: 'unparseable_date' })
    }

    return json({
      ok: true,
      serverTimeMs,
      dateHeader,
      requestStartMs: t0,
      responseEndMs: t1,
      rttMs: t1 - t0,
      httpStatus: res.status,
      finalUrl: res.url || target.href,
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
