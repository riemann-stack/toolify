// ─────────────────────────────────────────────────────────────
// SSRF 방어 — 순수 함수 (Node·Edge 런타임 공용, 외부 의존성 없음)
//   - checkTargetUrl: 사용자가 준 URL(및 리다이렉트 각 홉)의 스킴·계정·포트·호스트 검증
//   - isBlockedIp: IP 문자열(리터럴 호스트 또는 DNS 해석 결과)이 내부·특수 대역인지
// 사용처: app/api/og-preview(+ DNS 해석 결과 검증), app/api/proxy-time(Edge — 호스트 수준까지만)
// 폴더명이 _lib 이라 라우팅 대상이 아님(Next private folder).
// ─────────────────────────────────────────────────────────────

export type TargetCheckKind = 'protocol' | 'credentials' | 'port' | 'host'

export interface TargetCheckFail {
  kind: TargetCheckKind
  message: string
}

/**
 * 허용 포트(허용 목록) — URL.port는 스킴 기본 포트면 ''. 목록 밖 포트는 공개 호스트 대상 포트 스캔
 * (SSH 22·SMTP 25·Redis 6379·DB 3306/5432·개발 서버 3000 등 내부 서비스 탐지) 악용 방지로 전부 차단.
 *   - 80·443: 기본, 8080·8443: 대체 HTTP(S) 관례
 *   - 8000·8081·8888·9443: 국내 티켓팅·수강신청(대학 학사)·예약 사이트가 실제로 쓰는 웹 포트
 *     (server-time의 서버 시각 조회 대상) — 추가 시 테스트(tests/api-ssrf.test.mts) 허용·차단 표를 함께 갱신
 */
const ALLOWED_PORTS: ReadonlySet<string> = new Set(['', '80', '443', '8000', '8080', '8081', '8443', '8888', '9443'])

/** 오류 안내용 '80·443·8000·…' — 허용 목록에서 파생(목록과 문구가 어긋나지 않게) */
const ALLOWED_PORTS_LABEL = Array.from(ALLOWED_PORTS).filter(Boolean).join('·')

/** 사설·내부 전용 도메인 접미사 (공개 DNS에서 의미 없는 이름 → 내부 리졸버로 새는 것 방지) */
const BLOCKED_SUFFIXES: readonly string[] = [
  '.localhost', '.local', '.localdomain', '.internal', '.intranet', '.lan', '.home', '.corp',
  '.arpa', // home.arpa, in-addr.arpa, ip6.arpa 포함
  '.onion', '.test', '.invalid', '.example',
]

/* ── IPv4 ── */

/** 점 4개 10진 표기 IPv4 → uint32. (WHATWG URL은 0x7f.1·2130706433 등 변형을 이 형태로 정규화한다) */
export function parseIPv4(s: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s)
  if (!m) return null
  let n = 0
  for (let i = 1; i <= 4; i++) {
    const oct = Number(m[i])
    if (oct > 255) return null
    n = n * 256 + oct
  }
  return n
}

function v4(a: number, b: number, c: number, d: number): number {
  return ((a * 256 + b) * 256 + c) * 256 + d
}

/** [네트워크 주소, 프리픽스 길이] — 공개 인터넷에서 도달하면 안 되는 대역 (RFC 6890 등) */
const V4_BLOCKED: ReadonlyArray<readonly [number, number]> = [
  [v4(0, 0, 0, 0), 8],        // "this network"
  [v4(10, 0, 0, 0), 8],       // 사설
  [v4(100, 64, 0, 0), 10],    // CGNAT 공유 대역
  [v4(127, 0, 0, 0), 8],      // 루프백
  [v4(169, 254, 0, 0), 16],   // 링크로컬 (클라우드 메타데이터 169.254.169.254)
  [v4(172, 16, 0, 0), 12],    // 사설
  [v4(192, 0, 0, 0), 24],     // IETF 프로토콜 할당
  [v4(192, 0, 2, 0), 24],     // TEST-NET-1
  [v4(192, 88, 99, 0), 24],   // 6to4 릴레이 애니캐스트(폐지)
  [v4(192, 168, 0, 0), 16],   // 사설
  [v4(198, 18, 0, 0), 15],    // 벤치마크
  [v4(198, 51, 100, 0), 24],  // TEST-NET-2
  [v4(203, 0, 113, 0), 24],   // TEST-NET-3
  [v4(224, 0, 0, 0), 4],      // 멀티캐스트
  [v4(240, 0, 0, 0), 4],      // 예약 + 브로드캐스트 255.255.255.255
]

function inV4Cidr(ip: number, base: number, bits: number): boolean {
  const size = 2 ** (32 - bits)
  return Math.floor(ip / size) === Math.floor(base / size)
}

export function isBlockedIPv4(ip: number): boolean {
  return V4_BLOCKED.some(([base, bits]) => inV4Cidr(ip, base, bits))
}

/* ── IPv6 ── */

/** IPv6 문자열 → 16비트 그룹 8개. '::' 압축, 끝자리 점표기 IPv4(::ffff:1.2.3.4) 지원. 존 ID(%)·형식 오류는 null. */
export function parseIPv6(input: string): number[] | null {
  let s = input.toLowerCase()
  if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1)
  if (s.includes('%') || !s.includes(':')) return null

  // 끝자리 IPv4 → 16진 그룹 2개로 치환
  const lastColon = s.lastIndexOf(':')
  const tail = s.slice(lastColon + 1)
  if (tail.includes('.')) {
    const n = parseIPv4(tail)
    if (n === null) return null
    s = `${s.slice(0, lastColon + 1)}${Math.floor(n / 65536).toString(16)}:${(n % 65536).toString(16)}`
  }

  const halves = s.split('::')
  if (halves.length > 2) return null
  const head = halves[0] ? halves[0].split(':') : []
  const rest = halves.length === 2 ? (halves[1] ? halves[1].split(':') : []) : null
  const all = rest ? [...head, ...rest] : head
  if (!all.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null
  const hex = (g: string) => parseInt(g, 16)

  if (rest === null) return head.length === 8 ? head.map(hex) : null
  const missing = 8 - head.length - rest.length
  if (missing < 1) return null
  return [...head.map(hex), ...new Array<number>(missing).fill(0), ...rest.map(hex)]
}

function embeddedV4(hi: number, lo: number): number {
  return hi * 65536 + lo
}

/**
 * IPv6 차단 판정 — 허용 목록 방식: 전역 유니캐스트(2000::/3)만 통과, 그 안의 특수 대역은 다시 차단.
 * 루프백(::1)·미지정(::)·ULA(fc00::/7)·링크로컬(fe80::/10)·사이트로컬(fec0::/10)·멀티캐스트(ff00::/8)는
 * 2000::/3 밖이라 자동 차단. IPv4 매핑/NAT64/6to4는 내장 IPv4로 재판정.
 */
export function isBlockedIPv6(g: readonly number[]): boolean {
  if (g.length !== 8) return true
  const zero = (from: number, to: number) => g.slice(from, to).every((x) => x === 0)

  // ::ffff:a.b.c.d (IPv4-mapped) — 소켓은 결국 해당 IPv4로 연결됨
  if (zero(0, 5) && g[5] === 0xffff) return isBlockedIPv4(embeddedV4(g[6], g[7]))
  // 64:ff9b::/96 (NAT64 well-known) — 변환기가 내장 IPv4로 연결
  if (g[0] === 0x64 && g[1] === 0xff9b && zero(2, 6)) return isBlockedIPv4(embeddedV4(g[6], g[7]))

  if ((g[0] & 0xe000) !== 0x2000) return true                // 2000::/3 밖 전부 (::1, ::, fc00::/7, fe80::/10, ff00::/8, 64:ff9b:1::/48 …)
  if (g[0] === 0x2001 && g[1] <= 0x01ff) return true          // 2001::/23 IETF 특수(Teredo 2001::/32, 벤치마크 등)
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true         // 2001:db8::/32 문서용
  if (g[0] === 0x3fff && g[1] <= 0x0fff) return true          // 3fff::/20 문서용(RFC 9637)
  if (g[0] === 0x2002) return isBlockedIPv4(embeddedV4(g[1], g[2])) // 6to4 — 내장 IPv4 재판정
  return false
}

/** IP 문자열(IPv4 점표기 또는 IPv6, 대괄호 허용)이 차단 대역인지. 해석 불가 형식은 안전하게 차단(true). */
export function isBlockedIp(ip: string): boolean {
  const n4 = parseIPv4(ip)
  if (n4 !== null) return isBlockedIPv4(n4)
  const n6 = parseIPv6(ip)
  if (n6 !== null) return isBlockedIPv6(n6)
  return true
}

/* ── 호스트·URL ── */

/** URL.hostname 정규화: IPv6 대괄호 제거·소문자·끝 점 제거 */
export function normalizeHost(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.+$/, '')
}

/** 도메인 이름(비 IP)이 내부 전용 이름인지 — localhost·사설 접미사·단일 라벨(인트라넷 검색 도메인) */
export function isBlockedHostname(host: string): boolean {
  if (!host) return true
  if (host === 'localhost') return true
  if (!host.includes('.')) return true
  return BLOCKED_SUFFIXES.some((suf) => host.endsWith(suf))
}

/**
 * 외부 요청 대상 URL 검증 — 최초 URL과 리다이렉트 각 홉마다 호출.
 * 통과(null)해도 도메인이 사설 IP로 해석될 수 있으므로, 가능한 런타임(Node)에서는
 * DNS 해석 결과를 isBlockedIp로 한 번 더 검사해야 한다(og-preview/fetchHtml.ts의 safeLookup).
 */
export function checkTargetUrl(u: URL): TargetCheckFail | null {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { kind: 'protocol', message: 'http(s) 프로토콜만 지원합니다.' }
  }
  if (u.username || u.password) {
    return { kind: 'credentials', message: '계정 정보(user:pass@)가 포함된 URL은 지원하지 않습니다.' }
  }
  if (!ALLOWED_PORTS.has(u.port)) {
    return { kind: 'port', message: `웹 포트(${ALLOWED_PORTS_LABEL})만 지원합니다.` }
  }
  const host = normalizeHost(u.hostname)
  const isIpLiteral = parseIPv4(host) !== null || host.includes(':')
  const blocked = isIpLiteral ? isBlockedIp(host) : isBlockedHostname(host)
  if (blocked) return { kind: 'host', message: '내부망·로컬 주소는 차단됩니다.' }
  return null
}
