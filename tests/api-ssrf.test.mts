/* API SSRF·교차사이트 가드·robots 회귀 테스트 (node:test) — 실행: npx tsx --test tests/api-ssrf.test.mts
   - app/api/_lib/ssrf.ts: 순수 검증 함수 — 차단/허용 호스트·IP·포트 표
   - app/api/_lib/http.ts: isCrossSiteRequest
   - app/api/og-preview/fetchHtml.ts: DNS 해석 단계 차단(dns.lookup 목), 리다이렉트 홉 검증·압축 해제·charset·상한
     (http.request를 127.0.0.1 로컬 서버로 돌리는 테스트 전용 목 — 운영 코드에 테스트 훅 없음)
   - 라우트 핸들러 계약(상태·noindex·CORS 없음·캐시 헤더), app/robots.ts 렌더링용 API 허용 규칙

   외부 네트워크 I/O 없음(CI 기본 실행): 로컬 루프백 서버와 DNS 목만 쓴다.
   실제 외부 연결이 필요한 케이스는 NET_TESTS=1 일 때만 실행 — `NET_TESTS=1 npm test` */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import dns from 'node:dns'
import http from 'node:http'
import zlib from 'node:zlib'
import type { AddressInfo } from 'node:net'
import { checkTargetUrl, isBlockedIp, parseIPv6, parseIPv4 } from '../app/api/_lib/ssrf'
import { isCrossSiteRequest } from '../app/api/_lib/http'
import { fetchHtml, FetchHtmlError, detectCharset } from '../app/api/og-preview/fetchHtml'
import { GET as ogPreviewGET } from '../app/api/og-preview/route'
import { GET as speedtestGET } from '../app/api/speedtest/route'
import { GET as producePriceGET } from '../app/api/produce-price/route'
import { GET as proxyTimeGET } from '../app/api/proxy-time/route'
import { GET as timeGET, HEAD as timeHEAD } from '../app/api/time/route'
import * as robotsModule from '../app/robots'

const NET_TESTS = !!process.env.NET_TESTS

const check = (u: string) => checkTargetUrl(new URL(u))
const isCode = (c: string) => (e: unknown) => e instanceof FetchHtmlError && e.code === c

describe('checkTargetUrl — 차단', () => {
  const blocked = [
    'http://localhost/', 'http://LOCALHOST./', 'http://foo.localhost/', 'http://printer.local/',
    'http://metadata.google.internal/', 'http://router.home.arpa/', 'http://intranet/', 'http://nas.lan/',
    'http://127.0.0.1/', 'http://127.1/', 'http://2130706433/', 'http://0x7f000001/', 'http://0177.0.0.1/',
    'http://0.0.0.0/', 'http://0/', 'http://10.0.0.5/', 'http://172.16.0.1/', 'http://172.31.255.255/',
    'http://192.168.1.1/', 'http://169.254.169.254/latest/meta-data/', 'http://100.64.0.1/',
    'http://198.18.0.1/', 'http://224.0.0.1/', 'http://255.255.255.255/', 'http://192.0.2.1/',
    'http://[::1]/', 'http://[::]/', 'http://[0:0:0:0:0:0:0:1]/', 'http://[::ffff:127.0.0.1]/',
    'http://[::ffff:7f00:1]/', 'http://[::ffff:a9fe:a9fe]/', 'http://[::ffff:10.0.0.1]/',
    'http://[fc00::1]/', 'http://[fd12:3456::1]/', 'http://[fe80::1]/', 'http://[febf::1]/',
    'http://[fec0::1]/', 'http://[ff02::1]/', 'http://[64:ff9b::7f00:1]/', 'http://[64:ff9b::a9fe:a9fe]/',
    'http://[2002:7f00:1::]/', 'http://[2001:db8::1]/', 'http://[2001::1]/', 'http://[::7f00:1]/',
    'ftp://example.com/', 'file:///etc/passwd', 'gopher://example.com/', 'javascript:alert(1)',
    'http://user:pass@example.com/', 'http://user@example.com/',
    // 포트 허용 목록 밖 — 내부 서비스·개발 서버·인접 포트
    'http://example.com:22/', 'http://example.com:25/', 'http://example.com:6379/', 'https://example.com:3000/',
    'http://example.com:3306/', 'http://example.com:5432/', 'http://example.com:9200/', 'http://example.com:11211/',
    'http://example.com:8001/', 'http://example.com:8082/', 'http://example.com:8887/', 'http://example.com:8889/',
    'https://example.com:9442/', 'https://example.com:9444/', 'http://example.com:9000/', 'http://example.com:65535/',
    // 허용 포트여도 내부 호스트는 차단
    'http://127.0.0.1:8888/', 'http://[::1]:9443/', 'http://localhost:8000/', 'http://10.0.0.1:8081/',
  ]
  for (const u of blocked) {
    test(u, () => assert.notEqual(check(u), null, `${u} 는 차단돼야 함`))
  }
})

describe('checkTargetUrl — 허용', () => {
  const allowed = [
    'https://youtil.kr/', 'https://www.naver.com/', 'http://example.com/path?q=1', 'https://example.com:443/',
    'http://example.com:80/', 'https://example.com:8443/', 'http://example.com:8080/', 'https://blog.naver.com/x',
    // 국내 티켓팅·수강신청 서버가 쓰는 웹 포트
    'http://example.com:8000/', 'http://example.com:8081/', 'http://example.com:8888/', 'https://example.com:9443/',
    'https://sugang.example.ac.kr:8443/', 'https://ticket.example.co.kr:9443/login',
    'http://8.8.8.8/', 'http://1.1.1.1/', 'http://172.15.255.255/', 'http://172.32.0.1/', 'http://100.63.255.255/',
    'http://100.128.0.1/', 'http://169.253.1.1/', 'http://11.0.0.1/', 'http://[2606:4700:4700::1111]/',
    'http://[2001:4860:4860::8888]/', 'http://[::ffff:8.8.8.8]/', 'http://[64:ff9b::808:808]/', 'http://[2002:808:808::1]/',
    'https://xn--9n2bp8q.com/', 'https://한글도메인.kr/', 'http://8.8.8.8:8888/',
  ]
  for (const u of allowed) {
    test(u, () => assert.equal(check(u), null, `${u} 는 허용돼야 함: ${JSON.stringify(check(u))}`))
  }
  test('kind 분류', () => {
    assert.equal(check('ftp://a.com/')?.kind, 'protocol')
    assert.equal(check('http://u:p@a.com/')?.kind, 'credentials')
    assert.equal(check('http://a.com:25/')?.kind, 'port')
    assert.equal(check('http://10.1.1.1/')?.kind, 'host')
  })
  test('포트 오류 문구에 허용 목록 전체가 나온다', () => {
    const msg = check('http://a.com:25/')?.message ?? ''
    for (const p of ['80', '443', '8000', '8080', '8081', '8443', '8888', '9443']) {
      assert.ok(msg.split(/[^0-9]+/).includes(p), `문구에 ${p} 없음: ${msg}`)
    }
  })
})

describe('isBlockedIp (DNS 해석 결과)', () => {
  const cases: Array<[string, boolean]> = [
    ['127.0.0.1', true], ['10.1.2.3', true], ['169.254.169.254', true], ['0.0.0.0', true], ['100.64.1.1', true],
    ['::1', true], ['::', true], ['::ffff:127.0.0.1', true], ['::ffff:169.254.169.254', true], ['fe80::1', true],
    ['FE80::abcd', true], ['fc00::', true], ['fdff:ffff::1', true], ['ff00::', true], ['2001:db8::', true],
    ['fe80::1%eth0', true], ['garbage', true], ['', true], ['1.2.3', true], ['256.1.1.1', true], ['1:2:3:4:5:6:7:8:9', true],
    ['8.8.8.8', false], ['142.250.196.110', false], ['223.130.195.200', false], ['2404:6800:4004:81f::200e', false],
    ['::ffff:8.8.8.8', false], ['2606:4700::6810:84e5', false],
  ]
  for (const [ip, want] of cases) test(`${ip || '(빈 문자열)'} → ${want}`, () => assert.equal(isBlockedIp(ip), want))

  test('parseIPv6 형식', () => {
    assert.deepEqual(parseIPv6('::1'), [0, 0, 0, 0, 0, 0, 0, 1])
    assert.deepEqual(parseIPv6('1::'), [1, 0, 0, 0, 0, 0, 0, 0])
    assert.deepEqual(parseIPv6('::ffff:1.2.3.4'), [0, 0, 0, 0, 0, 0xffff, 0x0102, 0x0304])
    assert.equal(parseIPv6('1::2::3'), null)
    assert.equal(parseIPv6('12345::'), null)
    assert.equal(parseIPv4('1.2.3.4'), 0x01020304)
    assert.equal(parseIPv4('1.2.3.256'), null)
  })
})

describe('isCrossSiteRequest', () => {
  const req = (h: Record<string, string>, url = 'https://youtil.kr/api/speedtest?bytes=1') => new Request(url, { headers: h })
  test('Sec-Fetch-Site same-origin 허용', () => assert.equal(isCrossSiteRequest(req({ 'sec-fetch-site': 'same-origin' })), false))
  test('Sec-Fetch-Site none(주소창) 허용', () => assert.equal(isCrossSiteRequest(req({ 'sec-fetch-site': 'none' })), false))
  test('Sec-Fetch-Site cross-site 차단', () => assert.equal(isCrossSiteRequest(req({ 'sec-fetch-site': 'cross-site', referer: 'https://youtil.kr/' })), true))
  test('Origin 타 사이트 차단', () => assert.equal(isCrossSiteRequest(req({ origin: 'https://evil.example' })), true))
  test('Origin null 차단', () => assert.equal(isCrossSiteRequest(req({ origin: 'null' })), true))
  test('Origin www 허용', () => assert.equal(isCrossSiteRequest(req({ origin: 'https://www.youtil.kr' })), false))
  test('Referer 타 사이트 차단', () => assert.equal(isCrossSiteRequest(req({ referer: 'https://evil.example/page' })), true))
  test('Referer 자기 호스트(프리뷰) 허용', () =>
    assert.equal(isCrossSiteRequest(req({ referer: 'https://toolify-abc.vercel.app/tools/dev/network-test' }, 'https://toolify-abc.vercel.app/api/speedtest')), false))
  test('헤더 없음 허용(구형·서버간)', () => assert.equal(isCrossSiteRequest(req({})), false))
})

test('detectCharset', () => {
  const enc = (s: string) => new TextEncoder().encode(s)
  assert.equal(detectCharset('text/html; charset=EUC-KR', enc('')), 'EUC-KR')
  assert.equal(detectCharset('text/html', enc('<html><head><meta charset="euc-kr">')), 'euc-kr')
  assert.equal(detectCharset('text/html', enc('<meta http-equiv="Content-Type" content="text/html; charset=ks_c_5601-1987">')), 'ks_c_5601-1987')
  assert.equal(detectCharset('text/html', enc('<title>x</title>')), 'utf-8')
})

/* ── fetchHtml: DNS 단계 차단 (dns.lookup 목 — 소켓 연결 전에 거부되므로 네트워크 I/O 없음) ── */
describe('fetchHtml — DNS 해석 결과 차단', () => {
  type LookupCb = (e: Error | null, a: Array<{ address: string; family: number }>) => void
  const dnsMutable = dns as unknown as { lookup: unknown }
  const realLookup = dnsMutable.lookup
  after(() => { dnsMutable.lookup = realLookup })

  function mockDns(map: Record<string, Array<{ address: string; family: number }>>) {
    dnsMutable.lookup = (host: string, _opts: unknown, cb: LookupCb) => {
      const r = map[host]
      if (!r) {
        const e = Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND' })
        process.nextTick(cb, e, [])
        return
      }
      process.nextTick(cb, null, r)
    }
  }
  const o = { timeoutMs: 3000, maxBytes: 1000, maxRedirects: 3 }

  test('공개 도메인이 127.0.0.1로 해석 → blocked (DNS rebinding)', async () => {
    mockDns({ 'rebind.example.com': [{ address: '127.0.0.1', family: 4 }] })
    await assert.rejects(fetchHtml(new URL('http://rebind.example.com/'), o), isCode('blocked'))
  })
  test('여러 주소 중 하나라도 사설이면 blocked', async () => {
    mockDns({ 'mixed.example.com': [{ address: '8.8.8.8', family: 4 }, { address: '10.0.0.1', family: 4 }] })
    await assert.rejects(fetchHtml(new URL('http://mixed.example.com/'), o), isCode('blocked'))
  })
  test('IPv6 매핑 주소로 해석 → blocked', async () => {
    mockDns({ 'v6.example.com': [{ address: '::ffff:169.254.169.254', family: 6 }] })
    await assert.rejects(fetchHtml(new URL('https://v6.example.com/'), o), isCode('blocked'))
  })
  test('허용 포트(8888)여도 사설 IP로 해석되면 blocked', async () => {
    mockDns({ 'port.example.com': [{ address: '192.168.0.10', family: 4 }] })
    await assert.rejects(fetchHtml(new URL('http://port.example.com:8888/'), o), isCode('blocked'))
  })
  test('해석 실패 → dns', async () => {
    mockDns({})
    await assert.rejects(fetchHtml(new URL('http://nx.example.com/'), o), isCode('dns'))
  })
  // 실제 외부 IP로 소켓 연결을 시도하므로 기본(CI) 실행에서는 건너뛴다 — NET_TESTS=1 로 실행
  test('공인 IP로 해석 → blocked 아님(연결 단계까지 진행) [NET_TESTS]', { skip: !NET_TESTS && 'NET_TESTS 미설정 — 외부 연결 필요' }, async () => {
    mockDns({ 'pub.example.com': [{ address: '93.184.215.14', family: 4 }] })
    // 네트워크 사정에 따라 연결 실패·타임아웃·프록시 응답(not_html) 등 — 'blocked'·'dns'만 아니면 됨
    const r = await fetchHtml(new URL('http://pub.example.com/'), { ...o, timeoutMs: 1500 })
      .then(() => 'ok', (e: unknown) => (e instanceof FetchHtmlError ? e.code : 'unknown'))
    assert.ok(r !== 'blocked' && r !== 'dns', `got ${r}`)
  })
})

/* ── fetchHtml·og-preview 라우트: 리다이렉트·압축·charset·상한·캐시 헤더
      (외부 호스트 요청을 127.0.0.1 로컬 서버로 돌리는 http.request 목 — 외부 네트워크 없음) ── */
describe('fetchHtml — 파이프라인', () => {
  const server = http.createServer((req, res) => {
    const u = req.url ?? '/'
    if (u === '/r1') { res.writeHead(302, { location: 'http://hop2.example.com/r2' }); return res.end() }
    if (u === '/r2') { res.writeHead(301, { location: '/final' }); return res.end() }
    if (u === '/final') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end('<title>끝 &#128512;</title>') }
    if (u === '/to-internal') { res.writeHead(302, { location: 'http://169.254.169.254/latest/meta-data/' }); return res.end() }
    if (u === '/to-localhost') { res.writeHead(307, { location: 'http://localhost:8080/' }); return res.end() }
    if (u === '/to-badport') { res.writeHead(302, { location: 'http://hop2.example.com:6379/' }); return res.end() }
    if (u === '/loop') { res.writeHead(302, { location: '/loop' }); return res.end() }
    if (u === '/gzip') {
      res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip' })
      return res.end(zlib.gzipSync('<meta property="og:title" content="압축">'))
    }
    if (u === '/br') {
      res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'br' })
      return res.end(zlib.brotliCompressSync('<title>br</title>'))
    }
    if (u === '/euckr') {
      // "한글" EUC-KR = C7 D1 B1 DB
      res.writeHead(200, { 'content-type': 'text/html' })
      return res.end(Buffer.concat([Buffer.from('<meta charset="euc-kr"><title>'), Buffer.from([0xc7, 0xd1, 0xb1, 0xdb]), Buffer.from('</title>')]))
    }
    if (u === '/big') {
      res.writeHead(200, { 'content-type': 'text/html' })
      return res.end('<title>big</title>' + 'x'.repeat(2_000_000))
    }
    if (u === '/bomb') {
      res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip' })
      return res.end(zlib.gzipSync(Buffer.alloc(50_000_000, 0x61)))
    }
    if (u === '/json') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{}') }
    if (u === '/slow') { res.writeHead(200, { 'content-type': 'text/html' }); res.write('<ti'); return /* 끝내지 않음 */ }
    res.writeHead(404, { 'content-type': 'text/html' }); res.end('<title>404</title>')
  })
  // 테스트 전용: 모든 http 요청을 로컬 서버로 보냄 (lookup 훅 제거 — IP 검증은 위 describe에서 별도 검증)
  const httpMutable = http as unknown as { request: unknown }
  const realRequest = http.request
  before(async () => {
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
    const port = (server.address() as AddressInfo).port
    httpMutable.request = (url: URL, opts: http.RequestOptions, cb: (r: http.IncomingMessage) => void) => {
      const local = new URL(url.pathname + url.search, `http://127.0.0.1:${port}`)
      const { lookup: _drop, ...rest } = opts
      void _drop
      return realRequest(local, rest, cb)
    }
  })
  after(() => {
    httpMutable.request = realRequest
    server.closeAllConnections()
    server.close()
  })

  const opts = { timeoutMs: 3000, maxBytes: 100_000, maxRedirects: 5 }
  const run = (path: string, o = opts) => fetchHtml(new URL(`http://site.example.com${path}`), o)
  const same = { 'sec-fetch-site': 'same-origin' }
  const og = (target: string) =>
    ogPreviewGET(new Request('https://youtil.kr/api/og-preview?url=' + encodeURIComponent(target), { headers: same }))

  test('302→301 수동 추적 + finalUrl + 이모지 엔티티 원문 유지(파싱은 route)', async () => {
    const r = await run('/r1')
    assert.equal(r.status, 200)
    assert.equal(r.finalUrl, 'http://hop2.example.com/final')
    assert.match(r.html, /<title>끝 &#128512;<\/title>/)
  })
  test('리다이렉트 → 169.254.169.254 차단(홉 검증)', async () => {
    await assert.rejects(run('/to-internal'), (e: unknown) => isCode('blocked')(e) && (e as FetchHtmlError).redirected)
  })
  test('리다이렉트 → localhost 차단', async () => { await assert.rejects(run('/to-localhost'), isCode('blocked')) })
  test('리다이렉트 → 허용 목록 밖 포트(6379) 차단', async () => { await assert.rejects(run('/to-badport'), isCode('blocked')) })
  test('리다이렉트 루프 → too_many_redirects', async () => { await assert.rejects(run('/loop'), isCode('too_many_redirects')) })
  test('gzip 해제', async () => { assert.match((await run('/gzip')).html, /og:title" content="압축"/) })
  test('brotli 해제', async () => { assert.match((await run('/br')).html, /<title>br<\/title>/) })
  test('EUC-KR 디코딩', async () => { assert.match((await run('/euckr')).html, /<title>한글<\/title>/) })
  test('본문 상한(평문) — 정확히 maxBytes', async () => {
    const r = await run('/big', { ...opts, maxBytes: 50_000 })
    assert.equal(Buffer.byteLength(r.html), 50_000)
    assert.match(r.html, /^<title>big<\/title>/)
  })
  test('압축 폭탄 — 해제 후 상한에서 끊김', async () => {
    const r = await run('/bomb', { ...opts, maxBytes: 100_000 })
    assert.equal(r.html.length, 100_000)
  })
  test('HTML 아님 → not_html', async () => { await assert.rejects(run('/json'), isCode('not_html')) })
  test('404 HTML은 status와 함께 성공', async () => { const r = await run('/nope'); assert.equal(r.status, 404) })
  test('느린 본문 — 시간 예산 초과 시 받은 만큼 반환', async () => {
    const r = await run('/slow', { ...opts, timeoutMs: 500 })
    assert.equal(r.html, '<ti')
  })

  test('route 통합: 리다이렉트 추적 + 엔티티(이모지) 디코딩 + 응답 계약', async () => {
    const res = await og('http://site.example.com/r1')
    const j = await res.json() as { ok: boolean; url: string; fetchedUrl: string; status: number; tags: Record<string, string> }
    assert.equal(j.ok, true)
    assert.equal(j.url, 'http://site.example.com/r1')
    assert.equal(j.fetchedUrl, 'http://hop2.example.com/final')
    assert.equal(j.status, 200)
    assert.equal(j.tags.title, '끝 😀')
    const b = await og('http://site.example.com/to-internal')
    assert.equal(b.status, 400)
    assert.match(((await b.json()) as { error: string }).error, /리다이렉트 목적지 차단/)
  })

  test('route 캐시: 성공만 CDN 캐시, 실패·400은 no-store', async () => {
    const ok = await og('http://site.example.com/final')
    assert.equal(ok.status, 200)
    assert.equal(((await ok.json()) as { ok: boolean }).ok, true)
    assert.match(ok.headers.get('cache-control') ?? '', /s-maxage=300/)

    // 200 + ok:false (대상 서버 쪽 실패 — 일시 오류일 수 있음)
    const notHtml = await og('http://site.example.com/json')
    assert.equal(notHtml.status, 200)
    assert.equal(((await notHtml.json()) as { ok: boolean }).ok, false)
    assert.equal(notHtml.headers.get('cache-control'), 'no-store')

    const loop = await og('http://site.example.com/loop')
    assert.equal(((await loop.json()) as { ok: boolean }).ok, false)
    assert.equal(loop.headers.get('cache-control'), 'no-store')

    // 400 — 리다이렉트 홉 차단 / 최초 URL 차단 / 파라미터 없음
    for (const r of [
      await og('http://site.example.com/to-internal'),
      await og('http://[::ffff:127.0.0.1]/'),
      await og('http://example.com:22/'),
      await ogPreviewGET(new Request('https://youtil.kr/api/og-preview', { headers: same })),
    ]) {
      assert.equal(r.status, 400)
      assert.equal(r.headers.get('cache-control'), 'no-store')
    }
  })
})

/* ── 라우트 핸들러 계약 (모두 외부 호출 전에 끝나는 경로만) ── */
describe('route handlers', () => {
  const same = { 'sec-fetch-site': 'same-origin' }
  const cross = { 'sec-fetch-site': 'cross-site' }

  test('og-preview: 내부 주소 400 + noindex, 교차사이트 403, CORS 없음', async () => {
    const r1 = await ogPreviewGET(new Request('https://youtil.kr/api/og-preview?url=' + encodeURIComponent('http://[::ffff:127.0.0.1]/'), { headers: same }))
    assert.equal(r1.status, 400)
    assert.equal(r1.headers.get('x-robots-tag'), 'noindex')
    assert.equal(r1.headers.get('access-control-allow-origin'), null)
    const j1 = await r1.json() as { ok: boolean; error: string }
    assert.equal(j1.ok, false); assert.match(j1.error, /차단/)
    const r2 = await ogPreviewGET(new Request('https://youtil.kr/api/og-preview?url=https://example.com', { headers: cross }))
    assert.equal(r2.status, 403); assert.equal(r2.headers.get('cache-control'), 'no-store')
    const r3 = await ogPreviewGET(new Request('https://youtil.kr/api/og-preview', { headers: same }))
    assert.equal(r3.status, 400)
  })

  test('speedtest: 5MB 상한·최소 1KB·NaN 기본값·교차사이트 403', async () => {
    const sz = async (q: string) => (await (await speedtestGET(new Request(`https://youtil.kr/api/speedtest?${q}`, { headers: same }))).arrayBuffer()).byteLength
    assert.equal(await sz('bytes=5000000'), 5_000_000)
    assert.equal(await sz('bytes=999999999'), 5_000_000)
    assert.equal(await sz('bytes=1000000'), 1_000_000)
    assert.equal(await sz('bytes=10'), 1024)
    assert.equal(await sz('bytes=-5'), 1_000_000)
    assert.equal(await sz('bytes=abc'), 1_000_000)
    assert.equal(await sz('bytes=1500.7'), 1500)
    const r = await speedtestGET(new Request('https://youtil.kr/api/speedtest?bytes=1000000', { headers: same }))
    assert.equal(r.headers.get('x-robots-tag'), 'noindex')
    assert.equal(r.headers.get('access-control-allow-origin'), null)
    assert.match(r.headers.get('cache-control') ?? '', /no-store/)
    const x = await speedtestGET(new Request('https://youtil.kr/api/speedtest?bytes=5000000', { headers: { referer: 'https://evil.example/' } }))
    assert.equal(x.status, 403)
  })

  test('produce-price: debug는 토큰 없으면 404, 폴백 계약 유지, 프로토타입 키 무시 (키 없음 → KAMIS 미호출)', async () => {
    const saved = { ...process.env }
    try {
      // 키를 지워 KAMIS(외부) 호출 경로를 타지 않게 한다 — 폴백만 검증
      delete process.env.KAMIS_API_KEY; delete process.env.KAMIS_API_ID; delete process.env.KAMIS_DEBUG_TOKEN
      const d = await producePriceGET(new Request('https://youtil.kr/api/produce-price?debug=1', { headers: same }))
      assert.equal(d.status, 404)
      process.env.KAMIS_DEBUG_TOKEN = 'x'.repeat(20)
      assert.equal((await producePriceGET(new Request('https://youtil.kr/api/produce-price?debug=1', { headers: { 'x-debug-token': 'wrong' } }))).status, 404)
      const ok = await producePriceGET(new Request('https://youtil.kr/api/produce-price?debug=1', { headers: { 'x-debug-token': 'x'.repeat(20) } }))
      assert.equal(ok.status, 200)
      const t0 = Date.now()
      const r = await producePriceGET(new Request('https://youtil.kr/api/produce-price?items=baechu,mu,__proto__,constructor,sagua,baechu', { headers: same }))
      assert.ok(Date.now() - t0 < 1000, '키 없으면 재시도 없이 즉시 폴백')
      const j = await r.json() as { ok: boolean; results: Array<{ id: string; source: string; price: number; unit: string; date: string }> }
      assert.equal(j.ok, true)
      assert.deepEqual(j.results.map((x) => x.id), ['baechu', 'mu', 'sagua'])
      assert.ok(j.results.every((x) => x.source === 'fallback' && x.price > 0 && x.unit && /^\d{4}-\d{2}$/.test(x.date)))
      assert.equal(r.headers.get('x-robots-tag'), 'noindex')
      assert.equal(r.headers.get('access-control-allow-origin'), null)
      assert.equal((await producePriceGET(new Request('https://youtil.kr/api/produce-price?items=mu', { headers: cross }))).status, 403)
    } finally {
      process.env = saved
    }
  })

  test('proxy-time: 내부 주소·금지 포트 400(blocked_host), 교차사이트 403, noindex', async () => {
    const pt = (target: string) =>
      proxyTimeGET(new Request('https://youtil.kr/api/proxy-time?url=' + encodeURIComponent(target), { headers: same }))
    const r = await pt('http://[fd00::1]/')
    assert.equal(r.status, 400)
    const j = await r.json() as { ok: boolean; reason: string }
    assert.equal(j.reason, 'blocked_host')
    assert.equal(r.headers.get('x-robots-tag'), 'noindex')
    const port = await pt('https://example.com:3000/')
    assert.equal(port.status, 400)
    assert.equal(((await port.json()) as { reason: string }).reason, 'blocked_host')
    const p = await pt('ftp://a.com/')
    assert.equal(((await p.json()) as { reason: string }).reason, 'invalid_url')
    assert.equal((await proxyTimeGET(new Request('https://youtil.kr/api/proxy-time?url=https://a.com', { headers: cross }))).status, 403)
  })

  test('time: noindex 헤더', async () => {
    assert.equal((await timeGET()).headers.get('x-robots-tag'), 'noindex')
    assert.equal((await timeHEAD()).headers.get('x-robots-tag'), 'noindex')
  })
})

/* ── robots.txt: 렌더링에 쓰는 API만 크롤 허용 ── */
describe('robots', () => {
  // tsx의 CJS/ESM 상호 운용에 따라 default가 한 겹 더 감싸질 수 있어 둘 다 수용
  const mod = robotsModule as unknown as { default: (() => unknown) | { default: () => unknown } }
  const robots = (typeof mod.default === 'function' ? mod.default : mod.default.default) as typeof robotsModule.default
  const r = robots()
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
  const star = rules.find((x) => [x.userAgent ?? []].flat().includes('*'))
  const list = (v: string | string[] | undefined) => (v === undefined ? [] : [v].flat())
  const allow = list(star?.allow)
  const disallow = list(star?.disallow)

  /** Google 방식: 가장 긴(구체적) 규칙이 이기고, 길이가 같으면 Allow가 이긴다. 경로+쿼리 접두 매칭. */
  function googleAllows(pathAndQuery: string): boolean {
    const best = (rs: string[]) => Math.max(-1, ...rs.filter((x) => pathAndQuery.startsWith(x)).map((x) => x.length))
    return best(allow) >= best(disallow)
  }

  test('User-agent * 규칙 존재', () => assert.ok(star))
  const cases: Array<[string, boolean]> = [
    ['/', true],
    ['/tools/date/server-time', true],
    ['/api/time?t=1727300000000', true],                  // server-time·network-test 시각 동기화
    ['/api/produce-price?items=baechu,mu', true],         // kimjang·holiday-table 시세
    ['/api/og-preview?url=https%3A%2F%2Fexample.com', false],
    ['/api/proxy-time?url=https%3A%2F%2Fexample.com', false],
    ['/api/speedtest?bytes=1000000', false],
    ['/api/', false],
  ]
  for (const [p, want] of cases) test(`${p} → ${want ? '허용' : '차단'}`, () => assert.equal(googleAllows(p), want))
  test('sitemap 선언', () => assert.equal(r.sitemap, 'https://youtil.kr/sitemap.xml'))
})
