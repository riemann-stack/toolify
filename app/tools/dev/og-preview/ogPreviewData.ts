/* ──────────────────────────────────────────────────────
   og-preview/ogPreviewData.ts
   메타태그 정규화·검증·코드 생성 헬퍼
   ────────────────────────────────────────────────────── */

/** 화면에 표시할 정규화된 메타 데이터 */
export interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonical: string
  /** og:title 원값 (폴백 없이) — 검증용 */
  ogTitle: string
  /** og:image 계열 원값 (twitter:image 폴백 없이) — 카카오·Facebook·LinkedIn 미리보기·검증용 */
  ogImage: string
}

const EMPTY: MetaData = {
  title: '',
  description: '',
  image: '',
  url: '',
  siteName: '',
  type: '',
  twitterCard: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  canonical: '',
  ogTitle: '',
  ogImage: '',
}

/** raw tags(예: { 'og:title': '…', 'description': '…' })를 화면 데이터로 정규화 */
export function normalizeTags(raw: Record<string, string>): MetaData {
  const get = (k: string) => raw[k.toLowerCase()] ?? ''
  const ogImage = get('og:image') || get('og:image:url') || get('og:image:secure_url')
  return {
    title:              get('og:title')       || get('twitter:title') || get('title'),
    description:        get('og:description') || get('twitter:description') || get('description'),
    image:              ogImage               || get('twitter:image') || get('twitter:image:src'),
    url:                get('og:url')         || get('canonical'),
    siteName:           get('og:site_name')   || get('application-name') || '',
    type:               get('og:type')        || '',
    twitterCard:        get('twitter:card')   || '',
    twitterTitle:       get('twitter:title')  || get('og:title'),
    twitterDescription: get('twitter:description') || get('og:description'),
    twitterImage:       get('twitter:image')  || get('twitter:image:src') || ogImage,
    canonical:          get('canonical')      || get('og:url'),
    ogTitle:            get('og:title'),
    ogImage,
  }
}

/* 태그 속성을 앞에서부터 차례로 읽음. 값은 "…" · '…' · 따옴표 없는 값 —
   여는 따옴표와 같은 종류에서만 닫으므로 content="'국민 MC' …"나 content="Don't …"에서 끊기지 않음 */
function parseAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  const body = tag.replace(/^<[a-z]+/i, '').replace(/\/?>$/, '')
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const name = m[1].toLowerCase()
    if (!(name in out)) out[name] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return out
}

/** 사용자가 직접 입력한 HTML(또는 <head> 일부)에서 메타태그 추출 — 클라이언트 사이드 */
export function parseHtmlInput(html: string): Record<string, string> {
  const tags: Record<string, string> = {}

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) tags['title'] = decode(titleMatch[1].replace(/\s+/g, ' ').trim())

  /* 태그 끝 '>'는 따옴표 밖의 것만 — content="a > b"에서 잘리지 않게 */
  const metaRegex = /<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
  let m: RegExpExecArray | null
  while ((m = metaRegex.exec(html)) !== null) {
    const a = parseAttrs(m[0])
    const propAttr = a['property'] || a['name']
    const content = a['content']
    if (propAttr && content !== undefined) {
      const key = propAttr.toLowerCase()
      if (!(key in tags)) tags[key] = decode(content)
    }
  }

  const linkRegex = /<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
  while ((m = linkRegex.exec(html)) !== null) {
    const a = parseAttrs(m[0])
    const rel = a['rel']?.toLowerCase()
    const href = a['href']
    if (rel === 'canonical' && href) tags['canonical'] = decode(href)
  }
  return tags
}

/** 코드 포인트 → 문자. 범위 밖·서로게이트 단독값은 원문 유지 (app/api/og-preview/route.ts와 동일 규칙) */
function fromCodePointSafe(cp: number, raw: string): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return raw
  return String.fromCodePoint(cp)
}

/* 서버(URL 모드) decodeEntities와 같은 순서 — 16진 엔티티 지원, &amp;는 마지막(이중 디코딩 방지) */
function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (raw, c: string) => fromCodePointSafe(parseInt(c, 10), raw))
    .replace(/&#x([0-9a-f]+);/gi, (raw, c: string) => fromCodePointSafe(parseInt(c, 16), raw))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

// ─── 검증 ─────────────────────────────────────────────────
export type Severity = 'error' | 'warn' | 'info' | 'ok'
export interface ValidationIssue {
  field: string
  severity: Severity
  message: string
}

export function validate(m: MetaData): ValidationIssue[] {
  const out: ValidationIssue[] = []

  if (!m.title) {
    out.push({ field: 'og:title', severity: 'error', message: '필수 — 카드 헤드라인이 비어있어 미리보기 카드가 표시되지 않을 수 있습니다.' })
  } else if (!m.ogTitle) {
    out.push({ field: 'og:title', severity: 'warn', message: `og:title이 없어 <title>·twitter:title 값(${m.title.length}자)으로 대신 표시했습니다. 플랫폼마다 대체 규칙이 달라 og:title을 따로 넣는 것이 안전합니다.` })
  } else if (m.title.length > 60) {
    out.push({ field: 'og:title', severity: 'warn', message: `${m.title.length}자 — 60자 초과 시 카카오톡·X 등에서 잘릴 수 있어요(권장 ≤60).` })
  } else if (m.title.length < 10) {
    out.push({ field: 'og:title', severity: 'warn', message: `${m.title.length}자 — 너무 짧습니다. 15~50자 권장.` })
  } else {
    out.push({ field: 'og:title', severity: 'ok', message: `${m.title.length}자 — 적정 길이.` })
  }

  if (!m.description) {
    out.push({ field: 'og:description', severity: 'warn', message: '권장 — 설명이 없으면 카드 본문이 비어 클릭률이 떨어집니다.' })
  } else if (m.description.length > 160) {
    out.push({ field: 'og:description', severity: 'warn', message: `${m.description.length}자 — 160자 초과 시 잘림. 80~155자 권장.` })
  } else if (m.description.length < 30) {
    out.push({ field: 'og:description', severity: 'warn', message: `${m.description.length}자 — 너무 짧습니다.` })
  } else {
    out.push({ field: 'og:description', severity: 'ok', message: `${m.description.length}자 — 적정 길이.` })
  }

  if (!m.image) {
    out.push({ field: 'og:image', severity: 'error', message: '필수 — 이미지가 없으면 카카오톡·Slack 등 다수 플랫폼에서 미리보기가 표시되지 않습니다.' })
  } else if (!m.ogImage) {
    out.push({ field: 'og:image', severity: 'warn', message: 'og:image 없음 — twitter:image만 있습니다. 카카오톡·Facebook·LinkedIn은 og:image를 읽으므로 이미지 없는 카드가 됩니다. og:image를 추가하세요.' })
  } else {
    out.push({ field: 'og:image', severity: 'ok', message: '이미지 URL 감지. 1200×630(약 1.91:1) 권장 · 5MB 이하 · jpg/png/webp.' })
  }

  if (!m.url) {
    out.push({ field: 'og:url', severity: 'info', message: '권장 — canonical URL을 명시하면 동일 페이지 중복 인덱싱 방지에 도움.' })
  }
  if (!m.siteName) {
    out.push({ field: 'og:site_name', severity: 'info', message: '권장 — 사이트 이름은 카드 하단 도메인 영역에 표시되어 브랜딩에 도움.' })
  }
  if (!m.twitterCard) {
    out.push({ field: 'twitter:card', severity: 'info', message: '권장 — "summary_large_image" 사용 시 X에서 큰 이미지로 표시.' })
  }

  return out
}

// ─── 카드 미리보기용 도메인 추출 ───────────────────────────
export function domainOf(input: string): string {
  if (!input) return ''
  try {
    return new URL(input).hostname.replace(/^www\./, '')
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

/** 상대 경로 og:image → 절대 URL 보정 */
export function absoluteUrl(maybeRelative: string, base?: string): string {
  if (!maybeRelative) return ''
  if (/^https?:\/\//i.test(maybeRelative) || /^data:/i.test(maybeRelative)) return maybeRelative
  if (!base) return maybeRelative
  try {
    return new URL(maybeRelative, base).toString()
  } catch {
    return maybeRelative
  }
}

// ─── 코드 생성 ───────────────────────────────────────────
export function generateHeadTags(m: MetaData): string {
  const lines: string[] = []
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (m.title) lines.push(`<title>${esc(m.title)}</title>`)
  if (m.description) lines.push(`<meta name="description" content="${esc(m.description)}" />`)
  if (m.canonical) lines.push(`<link rel="canonical" href="${esc(m.canonical)}" />`)
  lines.push('')
  lines.push('<!-- Open Graph (Kakao·Facebook·LinkedIn·Slack 공통) -->')
  if (m.title) lines.push(`<meta property="og:title" content="${esc(m.title)}" />`)
  if (m.description) lines.push(`<meta property="og:description" content="${esc(m.description)}" />`)
  if (m.image) lines.push(`<meta property="og:image" content="${esc(m.image)}" />`)
  if (m.url) lines.push(`<meta property="og:url" content="${esc(m.url)}" />`)
  if (m.siteName) lines.push(`<meta property="og:site_name" content="${esc(m.siteName)}" />`)
  lines.push(`<meta property="og:type" content="${esc(m.type || 'website')}" />`)
  lines.push(`<meta property="og:locale" content="ko_KR" />`)
  lines.push('')
  lines.push('<!-- Twitter (X) -->')
  lines.push(`<meta name="twitter:card" content="${esc(m.twitterCard || 'summary_large_image')}" />`)
  if (m.twitterTitle || m.title) lines.push(`<meta name="twitter:title" content="${esc(m.twitterTitle || m.title)}" />`)
  if (m.twitterDescription || m.description) lines.push(`<meta name="twitter:description" content="${esc(m.twitterDescription || m.description)}" />`)
  if (m.twitterImage || m.image) lines.push(`<meta name="twitter:image" content="${esc(m.twitterImage || m.image)}" />`)

  return lines.join('\n')
}

// ─── 샘플 ─────────────────────────────────────────────────
export const SAMPLE_HTML = `<title>제목 — 사이트 이름</title>
<meta name="description" content="검색 결과나 카드에 표시될 한 줄 설명입니다." />

<meta property="og:title" content="제목 — 사이트 이름" />
<meta property="og:description" content="공유 시 카드에 표시될 한 줄 설명입니다. 80~155자 권장." />
<meta property="og:image" content="https://example.com/og.png" />
<meta property="og:url" content="https://example.com/article/1" />
<meta property="og:site_name" content="사이트 이름" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="ko_KR" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="제목 — 사이트 이름" />
<meta name="twitter:description" content="공유 시 카드에 표시될 한 줄 설명입니다." />
<meta name="twitter:image" content="https://example.com/og.png" />`
