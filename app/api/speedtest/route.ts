// ─────────────────────────────────────────────────────────────
// /api/speedtest?bytes=N — 다운로드 속도 측정용 N바이트 응답
// 최대 10MB까지, 무작위(압축 회피) 바이트
// ─────────────────────────────────────────────────────────────

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const bytesParam = url.searchParams.get('bytes')
  const requested = Number(bytesParam) || 1_000_000
  const N = Math.min(Math.max(1024, requested), MAX_BYTES)

  // 압축 회피용 의사 무작위 바이트 (시드 기반, 빠른 생성)
  const buf = new Uint8Array(N)
  // 단순한 xorshift32 — 압축 비율을 낮춰서 실제 전송량 측정에 가깝게
  let seed = 0xdeadbeef ^ (Date.now() & 0xffffffff)
  for (let i = 0; i < N; i++) {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    buf[i] = seed & 0xff
  }

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(N),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      // 가능한 한 압축 회피
      'Content-Encoding': 'identity',
    },
  })
}
