/* URL 인코더/디코더 — 데이터·계산 유틸 */

export type EncodingMode = 'auto' | 'encode' | 'decode'
export type EncodeFunc = 'component' | 'uri'
export type SortMode = 'order' | 'alpha'

export const MAX_INPUT_BYTES = 100 * 1024  /* 100KB */
export const MAX_DECODE_ITERATIONS = 5

/* ─────────────────────────────────────────────
   추적 파라미터 사전 (50+, 출처별 7 그룹)
   keys 는 정확 매치 또는 와일드카드(* 접미사)
   ───────────────────────────────────────────── */
export interface TrackingGroup {
  id: string
  emoji: string
  label: string
  desc: string
  keys: string[]   /* 'utm_*' 같은 와일드카드 지원 */
}

export const TRACKING_GROUPS: TrackingGroup[] = [
  {
    id: 'google', emoji: '🌐', label: 'Google Analytics·Ads',
    desc: 'Google 검색·광고·Analytics 추적',
    keys: [
      'utm_*',     /* utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id */
      'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid', '_gl',
      'gad', 'gad_source', 'gad_campaignid',
    ],
  },
  {
    id: 'facebook', emoji: '📘', label: 'Facebook·Meta',
    desc: 'Facebook·Instagram·Meta 광고 추적',
    keys: ['fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref', '_fbp', '_fbc'],
  },
  {
    id: 'naver', emoji: '🇰🇷', label: '네이버',
    desc: '네이버 검색·쇼핑·검색광고 추적',
    keys: ['n_media', 'n_query', 'n_rank', 'n_ad_group', 'n_ad', 'n_keyword',
           'n_campaign_type', 'n_keyword_id', 'n_ad_group_id', 'n_match',
           'n_ad_id', 'n_keyword_uniq', 'NaPm'],
  },
  {
    id: 'kakao', emoji: '💬', label: '카카오·다음',
    desc: '카카오톡·카카오 모먼트·다음 추적',
    keys: ['kakao_share_id', 'kakao_chat_id', '_branch_match_id',
           'kakao_ref', 'kakao_referer', 'taid', 'pid'],
  },
  {
    id: 'coupang', emoji: '🛍️', label: '쿠팡',
    desc: '쿠팡 파트너스·검색·광고 추적',
    keys: ['_xts_', 'src', 'spec', 'addtag', 'ctag', 'lptag', 'srcid',
           'wPcid', 'wRef', 'itime', 'pageType', 'pageValue'],
  },
  {
    id: 'microsoft', emoji: '🟦', label: 'Microsoft·Bing',
    desc: 'Bing 광고·MailChimp·Microsoft 추적',
    keys: ['msclkid', 'mc_eid', 'mc_cid', 'mkt_tok'],
  },
  {
    id: 'other', emoji: '📊', label: '기타 마케팅',
    desc: 'Twitter·LinkedIn·Yandex·기타 추적 도구',
    keys: ['igshid', 'twclid', 'li_fat_id', 'yclid', 'piwik_*',
           'oly_anon_id', 'oly_enc_id', 'rb_clickid', 'ttclid',
           'ScCid', 'ICID', 'WT.mc_id', 'epik', '_kx',
           '_hsenc', '_hsmi', 'hsa_*'],
  },
]

/* 추적 키 와일드카드 매칭 (utm_* → utm_으로 시작) */
export function matchesTrackingPattern(key: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1)
    return key.startsWith(prefix)
  }
  return key === pattern
}

/* 키가 어떤 그룹에 속하는지 찾기 */
export function findTrackingGroup(key: string): TrackingGroup | null {
  for (const g of TRACKING_GROUPS) {
    if (g.keys.some((p) => matchesTrackingPattern(key, p))) return g
  }
  return null
}

/* ═════════════════════════════════════════════
   자동 모드 감지
   ═════════════════════════════════════════════ */
export function detectMode(text: string): 'encode' | 'decode' {
  /* %XX 패턴이 1개 이상 → 디코드, 아니면 인코드 */
  return /%[0-9a-fA-F]{2}/.test(text) ? 'decode' : 'encode'
}

/* ═════════════════════════════════════════════
   인코드
   ═════════════════════════════════════════════ */
export interface EncodeResult {
  result: string
  encodedCount: number
  ms: number
  error?: string
}

export function encodeUrl(text: string, func: EncodeFunc): EncodeResult {
  const t0 = performance.now()
  if (!text) return { result: '', encodedCount: 0, ms: 0 }
  try {
    const result = func === 'component' ? encodeURIComponent(text) : encodeURI(text)
    /* %XX 개수 */
    const encodedCount = (result.match(/%[0-9a-fA-F]{2}/g) || []).length
    return { result, encodedCount, ms: performance.now() - t0 }
  } catch (e) {
    return { result: '', encodedCount: 0, ms: performance.now() - t0, error: e instanceof Error ? e.message : '인코딩 오류' }
  }
}

/* ═════════════════════════════════════════════
   디코드
   ═════════════════════════════════════════════ */
export interface DecodeResult {
  result: string
  iterations: number
  ms: number
  error?: string
}

export function decodeUrl(text: string, repeat: boolean): DecodeResult {
  const t0 = performance.now()
  if (!text) return { result: '', iterations: 0, ms: 0 }
  try {
    let current = text
    let iterations = 0
    if (!repeat) {
      current = decodeURIComponent(text)
      iterations = 1
    } else {
      /* 반복 디코드 — 더 이상 변경 없을 때까지, 최대 5회 */
      for (let i = 0; i < MAX_DECODE_ITERATIONS; i++) {
        const next = decodeURIComponent(current)
        iterations++
        if (next === current) break
        current = next
        /* 더 이상 % 가 없으면 중단 */
        if (!/%[0-9a-fA-F]{2}/.test(current)) break
      }
    }
    return { result: current, iterations, ms: performance.now() - t0 }
  } catch (e) {
    return { result: text, iterations: 0, ms: performance.now() - t0, error: e instanceof Error ? e.message : '디코딩 오류 — 잘못된 % 인코딩' }
  }
}

/* ═════════════════════════════════════════════
   한글 bytes 분석
   ═════════════════════════════════════════════ */
export interface KoreanByte {
  char: string
  codepoint: string  /* 'U+D55C' */
  bytes: number[]    /* [0xED, 0x95, 0x9C] */
  hexEncoded: string /* '%ED%95%9C' */
}

export function analyzeKorean(text: string): KoreanByte[] {
  const result: KoreanByte[] = []
  const encoder = new TextEncoder()
  /* surrogate pair 처리를 위해 Array.from 사용 (코드 포인트 단위) */
  for (const ch of Array.from(text)) {
    /* 한글·이모지·한자 등 ASCII 외 문자만 */
    const cp = ch.codePointAt(0)!
    if (cp < 0x80) continue  /* ASCII 제외 */
    const bytes = Array.from(encoder.encode(ch))
    const hexEncoded = bytes.map((b) => '%' + b.toString(16).toUpperCase().padStart(2, '0')).join('')
    result.push({
      char: ch,
      codepoint: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
      bytes,
      hexEncoded,
    })
  }
  return result
}

/* ═════════════════════════════════════════════
   URL 분해
   ═════════════════════════════════════════════ */
export interface ParsedUrl {
  scheme: string
  user?: string
  password?: string
  host: string
  port?: string
  path: string
  query: string                  /* 디코드된 query (= 부호 뒤 값 디코드) */
  rawQuery: string               /* ?abc=... 원본 (? 제외) */
  fragment?: string
  params: Array<{ key: string; value: string; rawValue: string }>
}

export interface ParseError {
  error: string
}

export function parseUrl(input: string): ParsedUrl | ParseError {
  if (!input.trim()) return { error: '빈 입력' }
  try {
    const u = new URL(input)
    const params: Array<{ key: string; value: string; rawValue: string }> = []
    /* URLSearchParams 는 자동 디코드 — 원본은 따로 추출 */
    const rawSearch = u.search.replace(/^\?/, '')
    const rawPairs = rawSearch ? rawSearch.split('&') : []
    const sp = new URLSearchParams(u.search)
    let rawIdx = 0
    for (const [key, value] of sp.entries()) {
      const rawPair = rawPairs[rawIdx] ?? ''
      const eqIdx = rawPair.indexOf('=')
      const rawValue = eqIdx >= 0 ? rawPair.slice(eqIdx + 1) : ''
      params.push({ key, value, rawValue })
      rawIdx++
    }
    return {
      scheme: u.protocol.replace(/:$/, ''),
      user: u.username || undefined,
      password: u.password || undefined,
      host: u.hostname,
      port: u.port || undefined,
      path: u.pathname,
      query: decodeQueryFriendly(rawSearch),
      rawQuery: rawSearch,
      fragment: u.hash ? u.hash.slice(1) : undefined,
      params,
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid URL' }
  }
}

/* 쿼리스트링을 표시용으로 디코드 (오류 시 원본) */
function decodeQueryFriendly(query: string): string {
  if (!query) return ''
  try {
    const sp = new URLSearchParams(query)
    return [...sp.entries()].map(([k, v]) => v ? `${k}=${v}` : `${k}=`).join('&')
  } catch {
    return query
  }
}

/* ═════════════════════════════════════════════
   URL 재구성
   ═════════════════════════════════════════════ */
export interface QueryParam {
  key: string
  value: string
}

export function buildUrl(parts: ParsedUrl, params: QueryParam[]): string {
  let auth = ''
  if (parts.user) {
    auth = parts.user
    if (parts.password) auth += ':' + parts.password
    auth += '@'
  }
  const port = parts.port ? ':' + parts.port : ''
  /* 빈 키는 제외, 빈 값은 허용 */
  const validParams = params.filter((p) => p.key.trim() !== '')
  const query = validParams.length > 0
    ? '?' + validParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
    : ''
  const fragment = parts.fragment ? '#' + parts.fragment : ''
  return `${parts.scheme}://${auth}${parts.host}${port}${parts.path}${query}${fragment}`
}

/* ═════════════════════════════════════════════
   추적 파라미터 감지
   ═════════════════════════════════════════════ */
export interface TrackingMatch {
  groupId: string
  groupLabel: string
  groupEmoji: string
  key: string
  value: string
}

export function detectTrackingParams(url: string): TrackingMatch[] {
  const parsed = parseUrl(url)
  if ('error' in parsed) return []
  const matches: TrackingMatch[] = []
  for (const p of parsed.params) {
    const group = findTrackingGroup(p.key)
    if (group) {
      matches.push({
        groupId: group.id,
        groupLabel: group.label,
        groupEmoji: group.emoji,
        key: p.key,
        value: p.value,
      })
    }
  }
  return matches
}

/* 그룹별로 묶기 */
export interface TrackingByGroup {
  group: TrackingGroup
  items: Array<{ key: string; value: string }>
}

export function groupTrackingMatches(url: string): TrackingByGroup[] {
  const parsed = parseUrl(url)
  if ('error' in parsed) return []
  const grouped = new Map<string, TrackingByGroup>()
  for (const p of parsed.params) {
    const group = findTrackingGroup(p.key)
    if (!group) continue
    if (!grouped.has(group.id)) {
      grouped.set(group.id, { group, items: [] })
    }
    grouped.get(group.id)!.items.push({ key: p.key, value: p.value })
  }
  /* TRACKING_GROUPS 순서대로 정렬 */
  return TRACKING_GROUPS
    .map((g) => grouped.get(g.id))
    .filter((x): x is TrackingByGroup => x !== undefined)
}

/* ═════════════════════════════════════════════
   추적 파라미터 정리
   ═════════════════════════════════════════════ */
export interface CleanResult {
  cleanUrl: string
  removedCount: number
  removedParams: Array<{ key: string; value: string }>
  error?: string
}

export function cleanTrackingParams(url: string, removeKeys: Set<string>): CleanResult {
  const parsed = parseUrl(url)
  if ('error' in parsed) {
    return { cleanUrl: url, removedCount: 0, removedParams: [], error: parsed.error }
  }
  const removed: Array<{ key: string; value: string }> = []
  const kept: QueryParam[] = []
  for (const p of parsed.params) {
    if (removeKeys.has(p.key)) {
      removed.push({ key: p.key, value: p.value })
    } else {
      kept.push({ key: p.key, value: p.value })
    }
  }
  return {
    cleanUrl: buildUrl(parsed, kept),
    removedCount: removed.length,
    removedParams: removed,
  }
}

/* ═════════════════════════════════════════════
   유틸·포맷
   ═════════════════════════════════════════════ */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function fmtMs(ms: number): string {
  if (ms < 1) return ms.toFixed(2) + 'ms'
  if (ms < 100) return ms.toFixed(1) + 'ms'
  return ms.toFixed(0) + 'ms'
}

export function fmtInt(n: number): string {
  return n.toLocaleString('ko-KR')
}
