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

/** EUC-KR(완성형 KS X 1001)에 실을 수 있는 문자인지 대략 판정.
    이모지·일부 특수문자는 EUC-KR에 아예 없어서 SMS 발송 시 치환되거나 거부된다. */
export function isEucKrRepresentable(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0
  if (cp < 0x80) return true                       // ASCII
  if (cp >= 0xAC00 && cp <= 0xD7A3) return true    // 한글 음절
  if (cp >= 0x3130 && cp <= 0x318F) return true    // 호환 자모
  if (cp >= 0x4E00 && cp <= 0x9FFF) return true    // 한자(일부)
  if (cp >= 0x3000 && cp <= 0x303F) return true    // CJK 기호·구두점
  if (cp >= 0xFF00 && cp <= 0xFFEF) return true    // 전각
  if (cp >= 0x2000 && cp <= 0x22FF) return true    // 일반 구두점·통화·수학기호(일부)
  if (cp >= 0x0391 && cp <= 0x03C9) return true    // 그리스
  if (cp >= 0x0401 && cp <= 0x0451) return true    // 키릴
  return false
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
    const first = ch.codePointAt(0) ?? 0
    if (first < 0x80 && ch.length === 1) { bytes += 1; continue }
    if (isEucKrRepresentable(ch)) { bytes += 2; continue }
    unsupported.push(ch)
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

  let i = 0
  while (i < text.length) {
    const span = spans.find((s) => s.start === i)
    if (span) {
      weighted += TWITTER_CONFIG.transformedURLLength * TWITTER_CONFIG.scale
      urlCount++
      i = span.end
      continue
    }
    /* 이 위치에서 시작하는 그래핌 하나 */
    const rest = text.slice(i)
    const g = graphemes(rest)[0] ?? rest[0]
    if (isEmojiGrapheme(g)) {
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
  return t
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

export type CountMethod = 'len' | 'twitterWeighted' | 'eucKrBytes' | 'utf8Bytes'

export const METHOD_LABEL: Record<CountMethod, string> = {
  len: 'UTF-16 길이',
  twitterWeighted: 'X 가중치',
  eucKrBytes: 'EUC-KR 바이트',
  utf8Bytes: 'UTF-8 바이트',
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
      UTF-8 바이트로 세므로 별도 처리한다.
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
      { name: 'Threads 게시물', limit: 500, method: 'utf8Bytes', tier: 'official', note: '공식 문서상 이모지는 UTF-8 바이트로 계산' },
      { name: 'Threads 텍스트 첨부', limit: 10000, method: 'utf8Bytes', tier: 'official', note: '2025-09 정식 출시' },
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

/** 플랫폼 계산 방식대로 현재 글자수를 센다 */
export function countFor(text: string, method: CountMethod): number {
  switch (method) {
    case 'twitterWeighted': return twitterCount(text).weighted
    case 'eucKrBytes': return eucKrBytes(text).bytes
    case 'utf8Bytes': return utf8Bytes(text)
    case 'len': return text.length
  }
}
