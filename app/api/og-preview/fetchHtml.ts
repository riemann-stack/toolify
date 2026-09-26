// ─────────────────────────────────────────────────────────────
// og-preview 전용 안전 HTML 가져오기 (Node 런타임)
//   - 리다이렉트 수동 추적: 홉마다 checkTargetUrl 재검증 (공개 URL → 302 → 169.254.169.254 우회 차단)
//   - DNS 해석 결과 검증 + 핀 고정: http(s).request의 lookup 훅에서 해석한 주소를 isBlockedIp로 검사하고
//     바로 그 주소로 연결 → '검사 때는 공인 IP, 연결 때는 사설 IP'인 DNS rebinding(TOCTOU)도 차단
//   - 전체 시간 예산(모든 홉 합산)·본문 바이트 상한(압축 해제 후 기준 — 압축 폭탄 방지)
//   - Content-Type/meta의 charset으로 디코딩 (EUC-KR 국내 구형 사이트 제목 깨짐 방지)
// ─────────────────────────────────────────────────────────────

import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import type { LookupFunction } from 'node:net'
import type { Readable } from 'node:stream'
import zlib from 'node:zlib'
import { checkTargetUrl, isBlockedIp } from '../_lib/ssrf'

export type FetchHtmlErrorCode =
  | 'blocked'            // 최초 URL 또는 리다이렉트 목적지·DNS 해석 결과가 내부망
  | 'dns'                // 도메인 해석 실패
  | 'timeout'
  | 'too_many_redirects'
  | 'bad_redirect'
  | 'not_html'
  | 'network'

export class FetchHtmlError extends Error {
  constructor(
    public readonly code: FetchHtmlErrorCode,
    message: string,
    public readonly status?: number,
    public readonly redirected = false,
  ) {
    super(message)
    this.name = 'FetchHtmlError'
  }
}

export interface FetchHtmlOptions {
  /** 모든 홉 합산 시간 예산(ms) */
  timeoutMs: number
  /** 압축 해제 후 본문 바이트 상한 — 넘으면 거기까지만 읽고 끊는다 */
  maxBytes: number
  maxRedirects: number
  headers?: Record<string, string>
}

export interface FetchHtmlResult {
  finalUrl: string
  status: number
  html: string
}

const BLOCKED_CODE = 'EYOUTILBLOCKED'

/** 연결 직전 DNS 해석 + 검증 — 해석된 주소 중 하나라도 차단 대역이면 연결 거부(보수적). */
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { all: true, verbatim: true, family: options.family }, (err, addresses) => {
    if (err) return callback(err, '', 0)
    if (addresses.length === 0) {
      const e: NodeJS.ErrnoException = new Error(`no address for ${hostname}`)
      e.code = 'ENOTFOUND'
      return callback(e, '', 0)
    }
    if (addresses.some((a) => isBlockedIp(a.address))) {
      const e: NodeJS.ErrnoException = new Error('resolved to a blocked address')
      e.code = BLOCKED_CODE
      return callback(e, '', 0)
    }
    if (options.all) return callback(null, addresses)
    return callback(null, addresses[0].address, addresses[0].family)
  })
}

function requestOnce(url: URL, signal: AbortSignal, headers: Record<string, string>): Promise<http.IncomingMessage> {
  const mod = url.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      {
        method: 'GET',
        headers,
        lookup: safeLookup,
        agent: false,          // 커넥션 풀 공유 안 함 — 매 요청 lookup 검증을 거치게
        signal,
        maxHeaderSize: 32 * 1024,
      },
      resolve,
    )
    req.on('error', reject)
    req.end()
  })
}

function decodedStream(res: http.IncomingMessage): Readable {
  const enc = String(res.headers['content-encoding'] ?? '').trim().toLowerCase()
  let dec: zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress | null = null
  // 잘린 스트림(상한에서 끊거나 서버가 조기 종료)에도 받은 만큼은 풀리도록 flush 모드 지정
  if (enc === 'gzip' || enc === 'x-gzip') dec = zlib.createGunzip({ finishFlush: zlib.constants.Z_SYNC_FLUSH })
  else if (enc === 'deflate') dec = zlib.createInflate({ finishFlush: zlib.constants.Z_SYNC_FLUSH })
  else if (enc === 'br') dec = zlib.createBrotliDecompress({ finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH })
  if (!dec) return res
  const d = dec
  res.on('error', (e) => d.destroy(e))
  return res.pipe(d)
}

/** 상한까지만 읽는다. 중간 오류라도 이미 읽은 바이트가 있으면 그것으로 진행(<head> 메타는 앞부분에 있음). */
async function readCapped(stream: Readable, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let total = 0
  try {
    for await (const chunk of stream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array)
      const room = maxBytes - total
      if (buf.length >= room) {
        chunks.push(buf.subarray(0, room))
        total += room
        break // for-await 탈출 시 스트림 destroy
      }
      chunks.push(buf)
      total += buf.length
    }
  } catch (e) {
    if (total === 0) throw e
  } finally {
    stream.destroy()
  }
  return Buffer.concat(chunks, total)
}

/** Content-Type charset → 없으면 문서 앞부분 <meta charset>/<meta http-equiv> → 기본 utf-8 */
export function detectCharset(contentType: string, head: Uint8Array): string {
  const fromHeader = /charset\s*=\s*["']?([\w.:-]+)/i.exec(contentType)?.[1]
  if (fromHeader) return fromHeader
  const sniff = Buffer.from(head.subarray(0, 4096)).toString('latin1')
  const fromMeta = /<meta\b[^>]*?charset\s*=\s*["']?([\w.:-]+)/i.exec(sniff)?.[1]
  return fromMeta ?? 'utf-8'
}

function decodeHtml(bytes: Buffer, contentType: string): string {
  const label = detectCharset(contentType, bytes)
  try {
    return new TextDecoder(label).decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes) // 알 수 없는 라벨
  }
}

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308
}

export async function fetchHtml(input: URL, opts: FetchHtmlOptions): Promise<FetchHtmlResult> {
  const ac = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    ac.abort()
  }, opts.timeoutMs)

  const headers = {
    'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    ...opts.headers,
  }

  let current = input
  let hop = 0
  try {
    for (;;) {
      const bad = checkTargetUrl(current)
      if (bad) throw new FetchHtmlError('blocked', bad.message, undefined, hop > 0)

      let res: http.IncomingMessage
      try {
        res = await requestOnce(current, ac.signal, headers)
      } catch (e) {
        throw mapNetworkError(e, timedOut, hop > 0)
      }
      const status = res.statusCode ?? 0
      const loc = res.headers.location

      if (isRedirect(status) && loc) {
        res.destroy()
        if (++hop > opts.maxRedirects) {
          throw new FetchHtmlError('too_many_redirects', `리다이렉트가 ${opts.maxRedirects}회를 초과했습니다.`)
        }
        try {
          current = new URL(loc, current)
        } catch {
          throw new FetchHtmlError('bad_redirect', '리다이렉트 주소를 해석할 수 없습니다.')
        }
        continue
      }

      const ct = String(res.headers['content-type'] ?? '')
      if (!/text\/html|application\/xhtml/i.test(ct)) {
        res.destroy()
        throw new FetchHtmlError('not_html', `HTML 페이지가 아닙니다 (Content-Type: ${ct.slice(0, 80) || '없음'}).`, status)
      }

      let bytes: Buffer
      try {
        bytes = await readCapped(decodedStream(res), opts.maxBytes)
      } catch (e) {
        throw mapNetworkError(e, timedOut, hop > 0)
      } finally {
        res.destroy() // 상한에서 끊었거나 디코더가 먼저 닫혀도 소켓까지 정리
      }
      return { finalUrl: current.toString(), status, html: decodeHtml(bytes, ct) }
    }
  } finally {
    clearTimeout(timer)
  }
}

function mapNetworkError(e: unknown, timedOut: boolean, redirected: boolean): FetchHtmlError {
  if (e instanceof FetchHtmlError) return e
  if (timedOut) return new FetchHtmlError('timeout', 'timeout')
  const code = (e as NodeJS.ErrnoException | undefined)?.code
  if (code === BLOCKED_CODE) return new FetchHtmlError('blocked', '내부망·로컬 주소는 차단됩니다.', undefined, redirected)
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ENODATA') {
    return new FetchHtmlError('dns', '도메인을 찾을 수 없습니다 — 주소를 확인해 주세요.')
  }
  return new FetchHtmlError('network', 'network')
}
