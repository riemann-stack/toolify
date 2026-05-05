/* 정규식 테스트기 — 데이터·계산 유틸 */

export type FlagId = 'g' | 'i' | 'm' | 's' | 'u' | 'y'
export type PatternCategory = 'korean' | 'general' | 'web' | 'text'
export type LangId = 'js' | 'python' | 'java' | 'php'
export type Mode = 'replace' | 'split'

/* 안전성 한도 */
export const MAX_INPUT_BYTES = 100 * 1024  /* 100KB */
export const MAX_MATCHES = 10000
export const SLOW_THRESHOLD_MS = 100

/* ─────────────────────────────────────────────
   flags 6종
   ───────────────────────────────────────────── */
export interface FlagDef {
  id: FlagId
  label: string
  desc: string
  longDesc: string
}

export const ALL_FLAGS: FlagDef[] = [
  { id: 'g', label: 'g', desc: '전역',         longDesc: 'Global — 모든 매치 찾기 (한 번이 아닌 모든 위치)' },
  { id: 'i', label: 'i', desc: '대소문자 무시', longDesc: 'Case-insensitive — A=a 동일 취급' },
  { id: 'm', label: 'm', desc: '다중행',       longDesc: 'Multiline — ^과 $가 각 줄 시작·끝에 매치' },
  { id: 's', label: 's', desc: 'dotAll',      longDesc: 'dotAll — . 메타문자가 줄바꿈(\\n)도 매치' },
  { id: 'u', label: 'u', desc: '유니코드',     longDesc: 'Unicode — 한글·이모지·\\p{...} 유니코드 속성 매칭' },
  { id: 'y', label: 'y', desc: '고정 위치',    longDesc: 'Sticky — lastIndex 위치에서만 매치 시도' },
]

/* ─────────────────────────────────────────────
   한국·일반·웹·문자 패턴 32개
   ───────────────────────────────────────────── */
export interface PatternDef {
  id: string
  category: PatternCategory
  name: string
  pattern: string
  flags: string
  desc: string
  example: string
  warning?: string
}

export const PATTERNS: PatternDef[] = [
  /* ─── 한국 데이터 (10) ─── */
  { id: 'ko-mobile', category: 'korean', name: '한국 휴대폰', pattern: '^010-?\\d{3,4}-?\\d{4}$', flags: '', desc: '010-1234-5678 또는 01012345678', example: '010-1234-5678' },
  { id: 'ko-tel',    category: 'korean', name: '한국 일반전화', pattern: '^0\\d{1,2}-?\\d{3,4}-?\\d{4}$', flags: '', desc: '02·031·051 등 지역번호 + 본번호', example: '02-1234-5678' },
  { id: 'ko-rrn',    category: 'korean', name: '주민등록번호 (앞-뒤)', pattern: '^\\d{6}-[1-4]\\d{6}$', flags: '', desc: '내국인 주민번호 형식 검증 (체크섬 X)', example: '901231-1234567', warning: '⚠️ 개인정보 — KISA·OWASP 가이드 + 체크섬 검증 별도' },
  { id: 'ko-frn',    category: 'korean', name: '외국인등록번호', pattern: '^\\d{6}-[5-8]\\d{6}$', flags: '', desc: '외국인 등록번호 형식 검증', example: '901231-5234567', warning: '⚠️ 개인정보 — 보안 절차 필수' },
  { id: 'ko-biz',    category: 'korean', name: '사업자등록번호', pattern: '^\\d{3}-?\\d{2}-?\\d{5}$', flags: '', desc: '123-45-67890 또는 1234567890', example: '123-45-67890' },
  { id: 'ko-corp',   category: 'korean', name: '법인등록번호', pattern: '^\\d{6}-?\\d{7}$', flags: '', desc: '110111-1234567 형식', example: '110111-1234567' },
  { id: 'ko-zip',    category: 'korean', name: '한국 우편번호 (5자리)', pattern: '^\\d{5}$', flags: '', desc: '신주소 우편번호 (2015~)', example: '03187' },
  { id: 'ko-car',    category: 'korean', name: '차량번호 (12가1234)', pattern: '^\\d{2,3}[가-힣]\\d{4}$', flags: '', desc: '신형 차량번호 형식', example: '12가1234' },
  { id: 'ko-card',   category: 'korean', name: '카드번호 (16자리)', pattern: '^\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}$', flags: '', desc: '4자리 4묶음 형식 검증 (Luhn 별도)', example: '4123-4567-8901-2345', warning: '⚠️ 결제 정보 — Luhn 알고리즘 + 토큰화 필수' },
  { id: 'ko-account', category: 'korean', name: '계좌번호 (일반)', pattern: '^\\d{3,6}-?\\d{2,6}-?\\d{2,8}$', flags: '', desc: '국내 은행 일반 형식 (은행별 변형 多)', example: '110-123-456789' },

  /* ─── 일반 (8) ─── */
  { id: 'gen-email', category: 'general', name: '이메일', pattern: '^[\\w.+-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+$', flags: '', desc: 'RFC 5322 단순화 — 99% 케이스 커버', example: 'hello@example.com' },
  { id: 'gen-url',   category: 'general', name: 'URL (http/https)', pattern: '^https?:\\/\\/[^\\s/$.?#].[^\\s]*$', flags: '', desc: '기본적인 HTTP/HTTPS URL', example: 'https://youtil.kr/tools' },
  { id: 'gen-ipv4',  category: 'general', name: 'IPv4 주소', pattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})$', flags: '', desc: '0.0.0.0 ~ 255.255.255.255', example: '192.168.0.1' },
  { id: 'gen-ipv6',  category: 'general', name: 'IPv6 주소 (단순화)', pattern: '^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$', flags: '', desc: '8개 16진수 그룹 (압축 표기 제외)', example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' },
  { id: 'gen-hex',   category: 'general', name: '16진 색상 (#RGB·#RRGGBB)', pattern: '^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$', flags: '', desc: 'CSS HEX 색상 코드', example: '#3EC8FF' },
  { id: 'gen-pwd',   category: 'general', name: '강한 비밀번호 (8+, 영숫특)', pattern: '^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$', flags: '', desc: '영문·숫자·특수문자 각 1개+ & 8자 이상', example: 'Hello123!' },
  { id: 'gen-uuid',  category: 'general', name: 'UUID v4', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', flags: 'i', desc: 'RFC 4122 v4 UUID', example: '550e8400-e29b-41d4-a716-446655440000' },
  { id: 'gen-slug',  category: 'general', name: 'URL 슬러그', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: '', desc: '소문자·숫자·하이픈만 (블로그 URL용)', example: 'hello-world-2026' },

  /* ─── 웹/HTML (6) ─── */
  { id: 'web-html',     category: 'web', name: 'HTML 태그 (열기/닫기)', pattern: '<\\/?[a-z][^>]*>', flags: 'gi', desc: '모든 HTML 태그 매치 (속성 포함)', example: '<div class="x">' },
  { id: 'web-comment',  category: 'web', name: 'HTML 주석', pattern: '<!--[\\s\\S]*?-->', flags: 'g', desc: '여러 줄 HTML 주석 (lazy)', example: '<!-- hello -->' },
  { id: 'web-md-link',  category: 'web', name: '마크다운 링크', pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)', flags: 'g', desc: '[text](url) — 그룹 1=text, 2=url', example: '[Google](https://google.com)' },
  { id: 'web-md-head',  category: 'web', name: '마크다운 헤더', pattern: '^#{1,6}\\s.+$', flags: 'gm', desc: '# Heading ~ ###### Heading (m flag 필수)', example: '# 제목' },
  { id: 'web-json-key', category: 'web', name: 'JSON 키', pattern: '"([^"]+)"\\s*:', flags: 'g', desc: 'JSON 객체 키 추출 — 그룹 1=key', example: '"name": "value"' },
  { id: 'web-css-rgb',  category: 'web', name: 'CSS rgb() 함수', pattern: 'rgb\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*\\)', flags: 'gi', desc: 'rgb(R, G, B) 색상 함수', example: 'rgb(62, 200, 255)' },

  /* ─── 문자/언어 (8) ─── */
  { id: 'txt-ko',      category: 'text', name: '한글만', pattern: '^[가-힣]+$', flags: '', desc: '완성형 한글만 허용', example: '안녕하세요' },
  { id: 'txt-koalnu',  category: 'text', name: '한글+영문+숫자', pattern: '^[가-힣a-zA-Z0-9]+$', flags: '', desc: '한글·영문·숫자만 (공백/특수문자 X)', example: 'hello한글123' },
  { id: 'txt-jamo',    category: 'text', name: '한글 자모 (분리)', pattern: '[ㄱ-ㅎㅏ-ㅣ]', flags: 'g', desc: '초성·중성 자모 분리 검출', example: 'ㅋㅋㅋㅎㅎ' },
  { id: 'txt-hanja',   category: 'text', name: '한자 (CJK)', pattern: '[\\u4e00-\\u9fff]', flags: 'g', desc: 'CJK 통합 한자 영역', example: '韓國語' },
  { id: 'txt-emoji',   category: 'text', name: '이모지 (u flag 필수)', pattern: '\\p{Emoji}', flags: 'gu', desc: '유니코드 Emoji 속성 — u flag 필수', example: '😀🎨🚀' },
  { id: 'txt-word',    category: 'text', name: '영문 단어', pattern: '\\b[a-zA-Z]+\\b', flags: 'g', desc: '단어 경계로 영문 단어 추출', example: 'hello world 2026' },
  { id: 'txt-num',     category: 'text', name: '숫자 (정수·소수·음수)', pattern: '-?\\d+(?:\\.\\d+)?', flags: 'g', desc: '음수·소수 모두 매치', example: '-3.14, 42, 0.5' },
  { id: 'txt-price',   category: 'text', name: '가격 (천단위 콤마)', pattern: '^\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?$', flags: '', desc: '1,234,567.89 형식', example: '1,234,567' },
]

export const CATEGORIES: { id: PatternCategory | 'all'; emoji: string; label: string }[] = [
  { id: 'all',     emoji: '✨', label: '전체' },
  { id: 'korean',  emoji: '🇰🇷', label: '한국 데이터' },
  { id: 'general', emoji: '🌐', label: '일반' },
  { id: 'web',     emoji: '💻', label: '웹/HTML' },
  { id: 'text',    emoji: '🔤', label: '문자' },
]

/* ─────────────────────────────────────────────
   치트시트 데이터
   ───────────────────────────────────────────── */
export interface CheatRow {
  syntax: string
  desc: string
  example?: string
}

export const CHEATSHEET: { title: string; emoji: string; rows: CheatRow[] }[] = [
  {
    title: '메타문자', emoji: '🔣', rows: [
      { syntax: '.',   desc: '줄바꿈 외 모든 문자 한 글자' },
      { syntax: '\\d', desc: '숫자 [0-9]', example: '\\d+ → "123"' },
      { syntax: '\\D', desc: '숫자 아닌 모든 글자' },
      { syntax: '\\w', desc: '단어 문자 [A-Za-z0-9_]' },
      { syntax: '\\W', desc: '단어가 아닌 글자' },
      { syntax: '\\s', desc: '공백 [\\t\\n\\r\\f\\v ]' },
      { syntax: '\\S', desc: '공백이 아닌 글자' },
      { syntax: '\\b', desc: '단어 경계', example: '\\bword\\b' },
      { syntax: '\\B', desc: '단어 경계가 아닌 곳' },
      { syntax: '^',   desc: '문자열·줄 시작 (m flag 시 줄)' },
      { syntax: '$',   desc: '문자열·줄 끝 (m flag 시 줄)' },
    ],
  },
  {
    title: '양화 한정자 (Quantifier)', emoji: '🔢', rows: [
      { syntax: '*',     desc: '0회 이상 (greedy)', example: 'a* → "", "a", "aaa"' },
      { syntax: '+',     desc: '1회 이상' },
      { syntax: '?',     desc: '0 또는 1회' },
      { syntax: '{n}',   desc: '정확히 n회' },
      { syntax: '{n,}',  desc: 'n회 이상' },
      { syntax: '{n,m}', desc: 'n회 이상 m회 이하' },
      { syntax: '*?',    desc: '0회 이상 (lazy)', example: '<.*?> → 가장 짧은 매치' },
      { syntax: '+?',    desc: '1회 이상 (lazy)' },
      { syntax: '??',    desc: '0/1회 (lazy)' },
    ],
  },
  {
    title: '문자 클래스', emoji: '🔠', rows: [
      { syntax: '[abc]',    desc: 'a, b, c 중 하나' },
      { syntax: '[^abc]',   desc: 'a, b, c 제외 모든 글자' },
      { syntax: '[a-z]',    desc: '소문자 a~z 범위' },
      { syntax: '[\\dA-F]', desc: '숫자 또는 대문자 A~F (16진)' },
      { syntax: '[가-힣]',  desc: '완성형 한글 모두' },
    ],
  },
  {
    title: '그룹', emoji: '🪪', rows: [
      { syntax: '(...)',         desc: '캡처 그룹 — $1, $2 등으로 참조' },
      { syntax: '(?:...)',       desc: '비캡처 그룹 — 그룹화만, 참조 X' },
      { syntax: '(?<name>...)',  desc: '이름 캡처 그룹 — $<name>·\\k<name>' },
      { syntax: '\\1, \\2',      desc: '백레퍼런스 — 같은 매치 다시', example: '(\\w)\\1 → "ll"' },
      { syntax: '\\k<name>',     desc: '이름 백레퍼런스' },
    ],
  },
  {
    title: '룩어라운드 (Lookaround)', emoji: '👁️', rows: [
      { syntax: '(?=...)',  desc: 'Lookahead (양수) — 뒤가 ...일 때 매치', example: '\\d+(?=원) → "1000원"의 1000' },
      { syntax: '(?!...)',  desc: 'Lookahead (음수) — 뒤가 ...아닐 때' },
      { syntax: '(?<=...)', desc: 'Lookbehind (양수) — 앞이 ...일 때 매치' },
      { syntax: '(?<!...)', desc: 'Lookbehind (음수) — 앞이 ...아닐 때' },
    ],
  },
]

/* ─────────────────────────────────────────────
   언어별 코드 스니펫 템플릿
   ───────────────────────────────────────────── */
export function formatLangSnippet(
  lang: LangId,
  pattern: string,
  flags: string,
  mode: Mode,
  replacement: string = '',
): string {
  const escapeSlash = pattern.replace(/\//g, '\\/')
  switch (lang) {
    case 'js':
      if (mode === 'split') return `text.split(/${escapeSlash}/${flags})`
      return `text.replace(/${escapeSlash}/${flags}, ${JSON.stringify(replacement)})`
    case 'python': {
      const pyFlags: string[] = []
      if (flags.includes('i')) pyFlags.push('re.IGNORECASE')
      if (flags.includes('m')) pyFlags.push('re.MULTILINE')
      if (flags.includes('s')) pyFlags.push('re.DOTALL')
      const fStr = pyFlags.length > 0 ? `, flags=${pyFlags.join(' | ')}` : ''
      const pyRepl = replacement.replace(/\$(\d)/g, '\\\\$1').replace(/\$&/g, '\\\\g<0>')
      if (mode === 'split') return `re.split(r'${pattern}', text${fStr})`
      return `re.sub(r'${pattern}', '${pyRepl}', text${fStr})`
    }
    case 'java': {
      const jPattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      const jRepl = replacement.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      if (mode === 'split') return `text.split("${jPattern}")`
      return `text.replaceAll("${jPattern}", "${jRepl}")`
    }
    case 'php': {
      /* PHP는 'g' flag가 없음 (자동 전체 매치) */
      const phpFlags = flags.replace(/[gy]/g, '')
      const phpRepl = replacement.replace(/\$/g, '\\$')
      if (mode === 'split') return `preg_split("/${escapeSlash}/${phpFlags}", $text)`
      return `preg_replace("/${escapeSlash}/${phpFlags}", "${phpRepl}", $text)`
    }
  }
}

/* ═════════════════════════════════════════════
   매칭·치환 함수
   ═════════════════════════════════════════════ */

export interface BuildResult {
  regex: RegExp | null
  error: string | null
}

export function buildRegex(pattern: string, flags: string): BuildResult {
  if (!pattern) return { regex: null, error: null }  /* 빈 입력 → 오류 아님 */
  try {
    const r = new RegExp(pattern, flags)
    return { regex: r, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid regular expression'
    return { regex: null, error: msg }
  }
}

export interface MatchResult {
  index: number
  length: number
  fullMatch: string
  groups: string[]                          /* 인덱스 캡처 그룹 [1, 2, ...] */
  namedGroups: Record<string, string>       /* 이름 그룹 */
}

export interface RunMatchesResult {
  matches: MatchResult[]
  executionMs: number
  truncated: boolean
}

export function runMatches(
  regex: RegExp,
  text: string,
  maxMatches: number = MAX_MATCHES,
): RunMatchesResult {
  const t0 = performance.now()
  const matches: MatchResult[] = []
  let truncated = false

  /* g/y flag 없으면 첫 매치만 */
  if (!regex.global && !regex.sticky) {
    const m = regex.exec(text)
    if (m) {
      matches.push(toMatchResult(m))
    }
  } else {
    /* matchAll 사용 */
    try {
      const iter = text.matchAll(regex)
      for (const m of iter) {
        matches.push(toMatchResult(m))
        if (matches.length >= maxMatches) { truncated = true; break }
      }
    } catch {
      /* 무한 매치 (zero-width) 등 방어 */
    }
  }

  const executionMs = performance.now() - t0
  return { matches, executionMs, truncated }
}

function toMatchResult(m: RegExpMatchArray | RegExpExecArray): MatchResult {
  const fullMatch = m[0]
  const idx = m.index ?? 0
  const groups: string[] = []
  for (let i = 1; i < m.length; i++) {
    groups.push(m[i] ?? '')
  }
  const named: Record<string, string> = {}
  if (m.groups) {
    for (const k in m.groups) named[k] = m.groups[k] ?? ''
  }
  return { index: idx, length: fullMatch.length, fullMatch, groups, namedGroups: named }
}

export interface RunReplaceResult {
  result: string
  executionMs: number
}

export function runReplace(regex: RegExp, text: string, replacement: string): RunReplaceResult {
  const t0 = performance.now()
  let result = text
  try {
    result = text.replace(regex, replacement)
  } catch {
    /* 잘못된 replacement 패턴 */
  }
  return { result, executionMs: performance.now() - t0 }
}

export interface RunSplitResult {
  parts: string[]
  executionMs: number
}

export function runSplit(regex: RegExp, text: string): RunSplitResult {
  const t0 = performance.now()
  let parts: string[] = []
  try {
    parts = text.split(regex)
  } catch {}
  return { parts, executionMs: performance.now() - t0 }
}

/* ─────────────────────────────────────────────
   하이라이트 — 텍스트를 매치/비매치 토큰으로 분할
   각 토큰에 인덱스(매치 #) 부여 → React에서 색상 순환
   ───────────────────────────────────────────── */
export interface Token {
  text: string
  matchIndex: number  /* -1 = 비매치 */
}

export function tokenizeForHighlight(text: string, matches: MatchResult[]): Token[] {
  if (matches.length === 0) return [{ text, matchIndex: -1 }]
  const tokens: Token[] = []
  let cursor = 0
  /* 매치를 인덱스 순으로 정렬 보장 */
  const sorted = [...matches].sort((a, b) => a.index - b.index)
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i]
    if (m.index < cursor) continue  /* 겹침 — 무시 */
    if (m.index > cursor) {
      tokens.push({ text: text.slice(cursor, m.index), matchIndex: -1 })
    }
    if (m.length === 0) {
      /* zero-width: 마커만 */
      tokens.push({ text: '', matchIndex: i })
    } else {
      tokens.push({ text: text.slice(m.index, m.index + m.length), matchIndex: i })
      cursor = m.index + m.length
    }
  }
  if (cursor < text.length) {
    tokens.push({ text: text.slice(cursor), matchIndex: -1 })
  }
  return tokens
}

/* 5색 로테이션 */
export const HIGHLIGHT_COLORS = ['#C8FF3E', '#3EFFD0', '#3EC8FF', '#FFB83E', '#FF8C3E']
export const colorForMatch = (idx: number) => HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length]

/* ─────────────────────────────────────────────
   유틸
   ───────────────────────────────────────────── */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function fmtMs(ms: number): string {
  if (ms < 1) return ms.toFixed(2) + 'ms'
  if (ms < 100) return ms.toFixed(1) + 'ms'
  return ms.toFixed(0) + 'ms'
}

export function fmtInt(n: number): string {
  return n.toLocaleString('ko-KR')
}
