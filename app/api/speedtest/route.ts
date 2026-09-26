// ─────────────────────────────────────────────────────────────
// /api/speedtest?bytes=N — 다운로드 속도 측정용 N바이트 응답 (network-test 도구 전용)
//   - 상한 5,000,000바이트 = 클라이언트 최대 옵션(5MB). 요청마다 전송량이 곧 비용이라 필요 이상 허용하지 않음.
//   - 교차 사이트 브라우저 호출 403 + CORS 헤더 없음 → 다른 사이트의 핫링크·JS 삽입으로 대역폭을 태우지 못하게.
//     (서버 간 대량 호출은 Vercel Firewall 레이트리밋으로 방어 — 예: /api/speedtest IP당 분당 10회)
//   - 무작위(압축 회피) 바이트, 캐시 금지.
// ─────────────────────────────────────────────────────────────

import { API_BASE_HEADERS, crossSiteForbidden, isCrossSiteRequest, NO_STORE } from '../_lib/http'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_BYTES = 5_000_000
const MIN_BYTES = 1024
const DEFAULT_BYTES = 1_000_000

/** 압축 회피용 의사 무작위 바이트 풀 — 인스턴스당 1회 생성 후 잘라 쓴다(요청마다 수 MB 생성하는 CPU 절감).
 *  속도 측정엔 '압축이 안 되는 바이트'면 충분하고 요청 간 내용이 같아도 무방(no-store·identity). */
let pool: Uint8Array | null = null

function randomPool(): Uint8Array {
  if (pool) return pool
  const buf = new Uint8Array(MAX_BYTES)
  // xorshift32 — 압축 비율을 낮춰서 실제 전송량 측정에 가깝게
  let seed = (0xdeadbeef ^ (Date.now() & 0xffffffff)) >>> 0 || 1
  for (let i = 0; i < MAX_BYTES; i++) {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    buf[i] = seed & 0xff
  }
  pool = buf
  return buf
}

export async function GET(req: Request): Promise<Response> {
  if (isCrossSiteRequest(req)) return crossSiteForbidden()

  const requested = Number(new URL(req.url).searchParams.get('bytes'))
  const n = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : DEFAULT_BYTES
  const N = Math.min(Math.max(MIN_BYTES, n), MAX_BYTES)

  // slice = 복사본 → 정확히 N바이트 ArrayBuffer (공유 풀 원본은 건드리지 않음)
  const body = randomPool().slice(0, N)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(N),
      'Cache-Control': NO_STORE,
      // 가능한 한 압축 회피
      'Content-Encoding': 'identity',
      ...API_BASE_HEADERS,
    },
  })
}
