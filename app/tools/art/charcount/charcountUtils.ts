/* 글자수 세기 — 순수 계산 유틸 (node로 검산 가능하도록 클라이언트에서 분리) */

/* ─────────────────────────────────────────────
   그래핌 분할
   결합 문자·ZWJ 이모지 시퀀스를 하나로 다루려면 코드포인트가 아니라 그래핌이 단위다.
   ───────────────────────────────────────────── */
const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('ko', { granularity: 'grapheme' })
    : null

export function graphemes(text: string): string[] {
  if (!text) return []
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment)
  return [...text]  // 폴백 — 코드포인트 단위
}

/** 역순 뒤집기.
    ⚠️ [...text].reverse()는 코드포인트 단위라 결합 문자가 깨진다 —
       'AéB'(e + U+0301)가 'B́eA'가 되고, 가족 이모지는 내부 순서까지 뒤집힌다. */
export function reverseText(text: string): string {
  return graphemes(text).reverse().join('')
}

/* ─────────────────────────────────────────────
   인코딩 바이트
   ───────────────────────────────────────────── */
export function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length
}

/** UTF-16 바이트. text.length는 서로게이트 쌍을 2로 세므로 BMP 밖에서도 이 식이 맞다. */
export function utf16Bytes(text: string): number {
  return text.length * 2
}

/* KS X 1001(EUC-KR) 기호·가나·자모·로마자 등 비한글·비한자 문자의 코드포인트 구간.
   Python `chr(cp).encode('euc_kr')`로 U+0080~U+FFFF를 전수 조사해 생성했다(988자 + 호환 한자 268자).
   ⚠️ 예전 판정은 U+2000–22FF 전체를 허용하고 그 밖의 기호 블록을 통째로 뺐다 —
      ★(2605)·▶(25B6)·♥(2665)··(00B7)·①(2460)처럼 문자 광고에 흔한 기호를 '표현 불가'로 빼
      바이트를 과소 계산했고(예문 83B, 실제 93B), 반대로 ₩(20A9) 같은 비수록 문자는 2바이트로 셌다.
   [시작, 끝] 쌍 — 단일 코드포인트는 시작=끝. */
const EUC_KR_SYMBOL_RANGES: readonly (readonly [number, number])[] = [
  [0x00A1, 0x00A1], [0x00A4, 0x00A4], [0x00A7, 0x00A8], [0x00AA, 0x00AA], [0x00AD, 0x00AE],
  [0x00B0, 0x00B4], [0x00B6, 0x00BA], [0x00BC, 0x00BF], [0x00C6, 0x00C6], [0x00D0, 0x00D0],
  [0x00D7, 0x00D8], [0x00DE, 0x00DF], [0x00E6, 0x00E6], [0x00F0, 0x00F0], [0x00F7, 0x00F8],
  [0x00FE, 0x00FE], [0x0111, 0x0111], [0x0126, 0x0127], [0x0131, 0x0133], [0x0138, 0x0138],
  [0x013F, 0x0142], [0x0149, 0x014B], [0x0152, 0x0153], [0x0166, 0x0167], [0x02C7, 0x02C7],
  [0x02D0, 0x02D0], [0x02D8, 0x02DB], [0x02DD, 0x02DD], [0x0391, 0x03A1], [0x03A3, 0x03A9],
  [0x03B1, 0x03C1], [0x03C3, 0x03C9], [0x0401, 0x0401], [0x0410, 0x044F], [0x0451, 0x0451],
  [0x2015, 0x2015], [0x2018, 0x2019], [0x201C, 0x201D], [0x2020, 0x2021], [0x2025, 0x2026],
  [0x2030, 0x2030], [0x2032, 0x2033], [0x203B, 0x203B], [0x2074, 0x2074], [0x207F, 0x207F],
  [0x2081, 0x2084], [0x20AC, 0x20AC], [0x2103, 0x2103], [0x2109, 0x2109], [0x2113, 0x2113],
  [0x2116, 0x2116], [0x2121, 0x2122], [0x2126, 0x2126], [0x212B, 0x212B], [0x2153, 0x2154],
  [0x215B, 0x215E], [0x2160, 0x2169], [0x2170, 0x2179], [0x2190, 0x2199], [0x21D2, 0x21D2],
  [0x21D4, 0x21D4], [0x2200, 0x2200], [0x2202, 0x2203], [0x2207, 0x2208], [0x220B, 0x220B],
  [0x220F, 0x220F], [0x2211, 0x2211], [0x221A, 0x221A], [0x221D, 0x221E], [0x2220, 0x2220],
  [0x2225, 0x2225], [0x2227, 0x222C], [0x222E, 0x222E], [0x2234, 0x2235], [0x223C, 0x223D],
  [0x2252, 0x2252], [0x2260, 0x2261], [0x2264, 0x2265], [0x226A, 0x226B], [0x2282, 0x2283],
  [0x2286, 0x2287], [0x2299, 0x2299], [0x22A5, 0x22A5], [0x2312, 0x2312], [0x2460, 0x246E],
  [0x2474, 0x2482], [0x249C, 0x24B5], [0x24D0, 0x24E9], [0x2500, 0x2503], [0x250C, 0x254B],
  [0x2592, 0x2592], [0x25A0, 0x25A1], [0x25A3, 0x25A9], [0x25B2, 0x25B3], [0x25B6, 0x25B7],
  [0x25BC, 0x25BD], [0x25C0, 0x25C1], [0x25C6, 0x25C8], [0x25CB, 0x25CB], [0x25CE, 0x25D1],
  [0x2605, 0x2606], [0x260E, 0x260F], [0x261C, 0x261C], [0x261E, 0x261E], [0x2640, 0x2640],
  [0x2642, 0x2642], [0x2660, 0x2661], [0x2663, 0x2665], [0x2667, 0x266A], [0x266C, 0x266D],
  [0x3000, 0x3003], [0x3008, 0x3011], [0x3013, 0x3015], [0x3041, 0x3093], [0x30A1, 0x30F6],
  [0x3131, 0x318E], [0x3200, 0x321C], [0x3260, 0x327B], [0x327F, 0x327F], [0x3380, 0x3384],
  [0x3388, 0x33CA], [0x33CF, 0x33D0], [0x33D3, 0x33D3], [0x33D6, 0x33D6], [0x33D8, 0x33D8],
  [0x33DB, 0x33DD], [0xF900, 0xFA0B], [0xFF01, 0xFF5E], [0xFFE0, 0xFFE3], [0xFFE5, 0xFFE6],
]

/** 코드포인트 하나가 EUC-KR 2바이트 문자로 실리는지.
    한글 음절은 11,172자 전체를 인정한다 — KS X 1001 완성형 2,350자 밖의 음절(똠·햏 등)도
    국내 문자 발송은 CP949 확장으로 2바이트 처리하는 것이 일반적이다.
    한자는 U+4E00–9FFF 전체를 근사로 인정한다(KS X 1001 수록은 4,888자). */
function isEucKrCodePoint(cp: number): boolean {
  if (cp >= 0xAC00 && cp <= 0xD7A3) return true    // 한글 음절
  if (cp >= 0x4E00 && cp <= 0x9FFF) return true    // 한자(근사)
  let lo = 0
  let hi = EUC_KR_SYMBOL_RANGES.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [a, b] = EUC_KR_SYMBOL_RANGES[mid]
    if (cp < a) hi = mid - 1
    else if (cp > b) lo = mid + 1
    else return true
  }
  return false
}

/** EUC-KR(완성형 KS X 1001)에 실을 수 있는 문자(그래핌)인지 판정.
    결합 시퀀스는 구성 코드포인트가 모두 실려야 한다 — 예전엔 첫 코드포인트만 봐서
    '1️⃣'(1 + FE0F + 20E3)도 표현 가능으로 셌다.
    이모지·일부 특수문자는 EUC-KR에 아예 없어서 SMS 발송 시 치환되거나 거부된다. */
export function isEucKrRepresentable(ch: string): boolean {
  if (!ch) return false
  for (const c of ch) {
    const cp = c.codePointAt(0) ?? 0
    if (cp < 0x80) continue                          // ASCII
    if (!isEucKrCodePoint(cp)) return false
  }
  return true
}

export interface EucKrResult {
  bytes: number
  /** EUC-KR로 표현할 수 없는 문자 (이모지 등) */
  unsupported: string[]
}

/** EUC-KR 바이트 추정 + 표현 불가 문자 수집.
    ⚠️ 예전에는 비ASCII를 전부 2바이트로 더해, EUC-KR에 없는 😀도 2바이트로 셌다.
       본문이 "이모지는 EUC-KR 미지원"이라 적어둔 것과 화면 안에서 모순이었다. */
export function eucKrBytes(text: string): EucKrResult {
  let bytes = 0
  const unsupported: string[] = []
  for (const ch of graphemes(text)) {
    if (!isEucKrRepresentable(ch)) { unsupported.push(ch); continue }
    for (const c of ch) bytes += (c.codePointAt(0) ?? 0) < 0x80 ? 1 : 2
  }
  return { bytes, unsupported }
}

/* ─────────────────────────────────────────────
   X(트위터) 가중치 — 공식 twitter-text config v3
   출처: https://github.com/twitter/twitter-text/blob/master/config/v3.json
     maxWeightedTweetLength 280 / scale 100 / defaultWeight 200 /
     emojiParsingEnabled true / transformedURLLength 23
   ───────────────────────────────────────────── */
export const TWITTER_CONFIG = {
  maxWeightedTweetLength: 280,
  scale: 100,
  defaultWeight: 200,
  transformedURLLength: 23,
  /** weight 100(=1자) 구간. ⚠️ 예전 구현은 [0,4351] 하나만 반영해
      엠대시·컬리 인용부호·프라임·얇은 공백류를 전부 2로 셌다. */
  ranges: [
    { start: 0, end: 4351, weight: 100 },
    { start: 8192, end: 8205, weight: 100 },
    { start: 8208, end: 8223, weight: 100 },
    { start: 8242, end: 8247, weight: 100 },
  ],
} as const

function codePointWeight(cp: number): number {
  for (const r of TWITTER_CONFIG.ranges) {
    if (cp >= r.start && cp <= r.end) return r.weight
  }
  return TWITTER_CONFIG.defaultWeight
}

/** 그래핌이 이모지인지 — 결합 시퀀스 전체를 하나로 본다.
    ⚠️ 국기(🇰🇷)는 지역 표시자 2개로 이루어지는데 Extended_Pictographic이 아니라
       그 검사만으로는 걸리지 않는다 — 별도로 잡지 않으면 2자가 아니라 4자가 된다. */
export function isEmojiGrapheme(g: string): boolean {
  if (!g) return false
  try {
    if (/\p{Regional_Indicator}/u.test(g)) return true
    return /\p{Extended_Pictographic}/u.test(g)
  } catch {
    const cp = g.codePointAt(0) ?? 0
    return cp >= 0x1F000 || (cp >= 0x1F1E6 && cp <= 0x1F1FF)
  }
}

/* URL 감지.
   X는 스킴이 없는 'x.com' 같은 표기도 링크로 보아 23자로 센다.
   전체 TLD 목록을 싣는 대신 흔한 TLD만 인식한다 — 그 밖의 TLD는 감지되지 않을 수 있다. */
const COMMON_TLD = 'com|net|org|kr|io|co|me|dev|app|ai|gg|tv|info|biz|edu|gov|jp|cn|uk|de|fr'
const URL_RE = new RegExp(
  `https?:\\/\\/[^\\s<>"']+` +
  `|www\\.[^\\s<>"']+` +
  `|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${COMMON_TLD})\\b(?:\\/[^\\s<>"']*)?`,
  'gi',
)

export interface TwitterCount {
  weighted: number
  /** URL 개수 (각 23자로 치환) */
  urlCount: number
  emojiCount: number
  remaining: number
  over: boolean
}

/**
 * X 가중 글자수.
 * 공식 parseTweet 순서를 따른다 — NFC 정규화 → URL 고정 23자 치환 →
 * 이모지 엔티티 1개당 기본 가중치(2자) → 나머지는 코드포인트별 구간 가중치.
 * ⚠️ 예전 구현은 셋 다 없어서 👨‍👩‍👧‍👦를 14자, 'x.com'을 5자로 셌다(공식은 각각 2자·23자).
 */
export function twitterCount(raw: string): TwitterCount {
  const text = raw.normalize('NFC')
  let weighted = 0
  let urlCount = 0
  let emojiCount = 0

  /* URL 구간을 먼저 떼어낸다 */
  const spans: { start: number; end: number }[] = []
  URL_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = URL_RE.exec(text)) !== null) {
    spans.push({ start: m.index, end: m.index + m[0].length })
  }

  /* 전체 텍스트를 그래핌으로 한 번만 분할해 시작 위치 → 그래핌 표를 만든다.
     ⚠️ 예전에는 위치마다 graphemes(text.slice(i))로 남은 문자열 전체를 다시 분할해 O(n²)였다 —
        4,000자에서 키 입력마다 2초 넘게 멈췄다. 가중치 규칙은 그대로다. */
  const graphemeAt = new Map<number, string>()
  {
    let pos = 0
    for (const g of graphemes(text)) { graphemeAt.set(pos, g); pos += g.length }
  }

  let spanIdx = 0
  let i = 0
  while (i < text.length) {
    while (spanIdx < spans.length && spans[spanIdx].start < i) spanIdx++
    const span = spans[spanIdx]
    if (span && span.start === i) {
      weighted += TWITTER_CONFIG.transformedURLLength * TWITTER_CONFIG.scale
      urlCount++
      i = span.end
      spanIdx++
      continue
    }
    /* 이 위치에서 시작하는 그래핌 하나 */
    const g = graphemeAt.get(i)
    if (g && isEmojiGrapheme(g)) {
      weighted += TWITTER_CONFIG.defaultWeight
      emojiCount++
      i += g.length
      continue
    }
    const cp = text.codePointAt(i) ?? 0
    weighted += codePointWeight(cp)
    i += cp > 0xFFFF ? 2 : 1
  }

  const total = weighted / TWITTER_CONFIG.scale
  return {
    weighted: total,
    urlCount,
    emojiCount,
    remaining: TWITTER_CONFIG.maxWeightedTweetLength - total,
    over: total > TWITTER_CONFIG.maxWeightedTweetLength,
  }
}

/* ─────────────────────────────────────────────
   문장·시간
   ───────────────────────────────────────────── */

/** 문장 수.
    ⚠️ 예전 정규식 /[.!?。？！]+(\s|$)/g 은 마침표 뒤에 공백이나 문서 끝을 요구해서,
       한국어에서 흔한 '안녕.반가워.' 를 1문장으로 셌다. */
export function countSentences(text: string): number {
  const t = text.trim()
  if (!t) return 0
  /* 내용이 있는 조각만 센다. 문장부호만 있는 입력('...')은 0문장이 맞다 —
     `|| 1` 폴백은 그 경우까지 1로 만들었다. 종결부호가 없는 평문은
     split 결과가 원문 한 조각이라 폴백 없이도 1이 나온다. */
  /* ⚠️ 모든 마침표에서 나누면 '1.5만 원'·'버전 2.5.1'·'Mr. Kim'이 여러 문장이 됐다.
     숫자 사이 마침표(소수점·버전)와 흔한 영문 약어 뒤 마침표는 문장 끝으로 보지 않는다.
     단 etc.·St.(Street)·Jr.·Sr.는 문장 끝에도 자주 오므로, 뒤에 소문자·숫자가 이어질 때만 약어로 본다
     (대소문자를 가려야 하므로 이 줄은 /i 없이 쓴다). */
  const dropDots = (m: string) => m.replace(/\./g, '')
  return t
    .replace(/(\d)\.(?=\d)/g, '$1')
    .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|vs|e\.g|i\.e)\./gi, dropDots)
    .replace(/\b(?:[Ee]tc|St|Jr|Sr)\.(?=\s*[a-z0-9])/g, dropDots)
    .split(/[.!?。？！…]+/)
    .map((p) => p.trim())
    .filter((p) => p !== '').length
}

/** 분 → "N분 M초". 초가 60으로 반올림되면 분으로 올린다(예전엔 "1분 60초"가 나왔다). */
export function fmtMin(m: number): string {
  if (!Number.isFinite(m) || m <= 0) return '0초'
  if (m < 1 / 60) return '< 1초'
  const totalSec = Math.round(m * 60)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min === 0) return `${sec}초`
  if (sec === 0) return `${min}분`
  return `${min}분 ${sec}초`
}

/* ─────────────────────────────────────────────
   플랫폼 한도 — 출처 등급을 값과 함께 둔다
   ───────────────────────────────────────────── */
/** official = 플랫폼 공식 문서에 명시 · community = 공식 미문서화(널리 쓰이는 관행값) · preset = 규격이 아니라 편의 프리셋 */
export type SourceTier = 'official' | 'community' | 'preset'

export const SOURCE_TIER_LABEL: Record<SourceTier, string> = {
  official: '공식 문서 확인',
  community: '공식 미문서화 — 통용값',
  preset: '규격 아님 — 편의 프리셋',
}

export type CountMethod = 'len' | 'twitterWeighted' | 'eucKrBytes' | 'utf8Bytes' | 'threadsChars'

export const METHOD_LABEL: Record<CountMethod, string> = {
  len: 'UTF-16 길이',
  twitterWeighted: 'X 가중치',
  eucKrBytes: 'EUC-KR 바이트',
  utf8Bytes: 'UTF-8 바이트',
  threadsChars: '글자 수(이모지만 UTF-8 바이트)',
}

export interface PlatformLimit {
  name: string
  limit: number
  method: CountMethod
  tier: SourceTier
  note?: string
}

/* 플랫폼 한도.
   ⚠️ 예전에는 40여 항목이 전부 같은 UI로 나열돼, 공식 문서에 명시된 값과 공식 미문서화 통용값,
      규격이 아닌 편의 프리셋(자기소개서 등)이 구분되지 않았다. 본문 각주는 "공식 미문서화
      서비스는 제외했다"고 선언했지만 실제로는 섞여 있어 문서↔데이터가 어긋났다.
   ⚠️ method도 대부분 UTF-16 길이를 재사용했다 — Threads는 공식 문서상 이모지를
      UTF-8 바이트로 세므로 별도 처리한다(threadsChars). 한때 전체 문자를 UTF-8 바이트로 세서
      한글 1자가 3으로 잡혔다 — 한글 167자부터 500 초과로 표시됐다.
   확인 시점: 2026년 8월. 글자수 제한은 예고 없이 바뀐다. */
export const PLATFORM_GROUPS: { group: string; items: PlatformLimit[] }[] = [
  {
    group: '글로벌 SNS',
    items: [
      { name: 'X (트위터)', limit: 280, method: 'twitterWeighted', tier: 'official', note: '한글·이모지 2 · URL은 길이 무관 23 · Premium 구독 시 25,000자' },
      { name: '인스타그램 캡션', limit: 2200, method: 'len', tier: 'official', note: '해시태그 30개·@태그 20개 제한이 함께 적용됩니다' },
      { name: '인스타그램 프로필 소개', limit: 150, method: 'len', tier: 'official' },
      { name: '인스타그램 댓글', limit: 2200, method: 'len', tier: 'community' },
      { name: '페이스북 게시물', limit: 63206, method: 'len', tier: 'community' },
      { name: '페이스북 프로필 소개', limit: 101, method: 'len', tier: 'community' },
      { name: '링크드인 게시물', limit: 3000, method: 'len', tier: 'official' },
      { name: '링크드인 헤드라인', limit: 220, method: 'len', tier: 'community' },
      { name: 'Threads 게시물', limit: 500, method: 'threadsChars', tier: 'official', note: '공식 문서상 이모지는 UTF-8 바이트로 계산' },
      { name: 'Threads 텍스트 첨부', limit: 10000, method: 'threadsChars', tier: 'official', note: '2025-09 정식 출시' },
    ],
  },
  {
    group: '동영상 플랫폼',
    items: [
      { name: '유튜브 제목', limit: 100, method: 'len', tier: 'official', note: '공식 가이드는 글자수 대신 "중요한 단어를 앞쪽에"를 권합니다' },
      { name: '유튜브 설명', limit: 5000, method: 'len', tier: 'official' },
      { name: '유튜브 댓글', limit: 10000, method: 'len', tier: 'community' },
      { name: 'TikTok 캡션', limit: 4000, method: 'len', tier: 'official' },
    ],
  },
  {
    group: '한국 메신저·SMS',
    items: [
      { name: 'SMS (단문)', limit: 90, method: 'eucKrBytes', tier: 'official', note: '한글 45자 / 영문 90자 — 이모지는 EUC-KR에 없어 발송 시 문제가 됩니다' },
      { name: 'LMS (장문)', limit: 2000, method: 'eucKrBytes', tier: 'official', note: '한글 약 1,000자' },
      { name: '카카오톡 메시지', limit: 10000, method: 'len', tier: 'community' },
      { name: '카카오톡 프로필 상태', limit: 60, method: 'len', tier: 'community' },
    ],
  },
  {
    group: '한국 블로그·커뮤니티',
    items: [
      { name: '네이버 블로그 제목', limit: 100, method: 'len', tier: 'community' },
      { name: '네이버 카페 제목', limit: 60, method: 'len', tier: 'community' },
      { name: '티스토리 제목', limit: 200, method: 'len', tier: 'community' },
      { name: '브런치 제목', limit: 30, method: 'len', tier: 'community' },
      { name: '브런치 부제', limit: 60, method: 'len', tier: 'community' },
    ],
  },
  {
    group: '자기소개서 (편의 프리셋)',
    items: [
      { name: '자기소개서 단문', limit: 500, method: 'len', tier: 'preset' },
      { name: '자기소개서 일반', limit: 1000, method: 'len', tier: 'preset' },
      { name: '자기소개서 대기업', limit: 2000, method: 'len', tier: 'preset' },
      { name: '자기소개서 장문', limit: 4000, method: 'len', tier: 'preset' },
    ],
  },
  {
    group: '앱스토어·쇼핑',
    items: [
      { name: 'Apple App Store 앱 이름', limit: 30, method: 'len', tier: 'official' },
      { name: 'Apple App Store 부제', limit: 30, method: 'len', tier: 'official' },
      { name: 'Apple App Store 설명', limit: 4000, method: 'len', tier: 'official' },
      { name: 'Google Play 앱 이름', limit: 30, method: 'len', tier: 'official' },
      { name: 'Google Play 짧은 설명', limit: 80, method: 'len', tier: 'official' },
      { name: 'Google Play 자세한 설명', limit: 4000, method: 'len', tier: 'official' },
      { name: '쿠팡 상품명', limit: 60, method: 'len', tier: 'community' },
    ],
  },
  {
    group: 'SEO·메타 (권장 휴리스틱)',
    items: [
      { name: 'HTML title', limit: 60, method: 'len', tier: 'preset', note: '구글은 고정 글자수 제한이 없고 화면 폭·검색어에 따라 잘라 표시합니다 — 한글은 폭이 넓어 더 짧게' },
      { name: 'meta description', limit: 160, method: 'len', tier: 'preset', note: '구글이 그대로 쓰지 않고 재작성하는 경우가 많습니다' },
      { name: '이메일 제목 (모바일)', limit: 50, method: 'len', tier: 'preset' },
      { name: '이메일 제목 (데스크탑)', limit: 78, method: 'len', tier: 'preset' },
    ],
  },
]

/** Threads 글자수 — 공식 문서: 텍스트 게시물 500자, 이모지는 UTF-8 바이트 수로 계산.
    그래핌 1개를 1자로, 이모지 그래핌만 그 UTF-8 바이트 수(😀 = 4)로 더한다. */
export function threadsCount(text: string): number {
  let n = 0
  for (const g of graphemes(text)) n += isEmojiGrapheme(g) ? utf8Bytes(g) : 1
  return n
}

/** 플랫폼 계산 방식대로 현재 글자수를 센다 */
export function countFor(text: string, method: CountMethod): number {
  switch (method) {
    case 'twitterWeighted': return twitterCount(text).weighted
    case 'eucKrBytes': return eucKrBytes(text).bytes
    case 'utf8Bytes': return utf8Bytes(text)
    case 'threadsChars': return threadsCount(text)
    case 'len': return text.length
  }
}
