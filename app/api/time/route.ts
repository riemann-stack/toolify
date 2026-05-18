// ─────────────────────────────────────────────────────────────
// /api/time — 서버 정확 시간 반환 (NTP 알고리즘 기반 클럭 오프셋 측정용)
// 캐시 완전 금지. Edge runtime 사용.
// ─────────────────────────────────────────────────────────────

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<Response> {
  const now = Date.now()
  return new Response(
    JSON.stringify({
      serverTimeMs: now,
      iso: new Date(now).toISOString(),
      timezone: 'UTC',
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Date': new Date(now).toUTCString(),
      },
    }
  )
}

export async function HEAD(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Date': new Date().toUTCString(),
    },
  })
}
