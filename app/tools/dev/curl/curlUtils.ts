/* cURL 변환기 — 파서 + 5 언어 코드 생성기 */

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
export type BodyType = 'json' | 'form' | 'urlencode' | 'multipart' | 'raw' | null
export type LangId = 'fetch' | 'axios' | 'python' | 'node' | 'go'
export type CategoryId = 'korean' | 'global' | 'auth' | 'upload' | 'graphql'

export const MAX_INPUT_BYTES = 50 * 1024  /* 50KB */

/* ─────────────────────────────────────────────
   메서드 색상
   ───────────────────────────────────────────── */
export const METHOD_COLORS: Record<Method, string> = {
  GET:     'var(--teal-600)',
  POST:    'var(--cyan-600)',
  PUT:     'var(--amber-600)',
  DELETE:  'var(--pink-600)',
  PATCH:   'var(--amethyst)',
  HEAD:    '#888888',
  OPTIONS: '#888888',
}

/* ─────────────────────────────────────────────
   민감 헤더 패턴
   ───────────────────────────────────────────── */
const SENSITIVE_PATTERNS = [
  /^authorization$/i,
  /^cookie$/i,
  /^set-cookie$/i,
  /^x-api-key$/i,
  /^x-auth-token$/i,
  /^api-key$/i,
  /^x-access-token$/i,
  /^proxy-authorization$/i,
]

export function isSensitiveHeader(name: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(name))
}

export function maskValue(value: string, hint = 4): string {
  if (!value) return ''
  if (value.length <= hint + 3) return '***'
  return value.slice(0, hint) + '...***'
}

/* ─────────────────────────────────────────────
   카테고리 + 예시
   ───────────────────────────────────────────── */
export const CATEGORIES: { id: CategoryId | 'all'; emoji: string; label: string }[] = [
  { id: 'all',     emoji: '✨', label: '전체' },
  { id: 'korean',  emoji: '🇰🇷', label: '한국 API' },
  { id: 'global',  emoji: '🌐', label: '글로벌 API' },
  { id: 'auth',    emoji: '🔐', label: '인증' },
  { id: 'upload',  emoji: '📤', label: '업로드' },
  { id: 'graphql', emoji: '🔌', label: 'GraphQL' },
]

export interface Example {
  id: string
  emoji: string
  category: CategoryId
  name: string
  desc: string
  command: string
}

export const EXAMPLES: Example[] = [
  /* ─── 한국 API (5) ─── */
  {
    id: 'kakao-msg', emoji: '💬', category: 'korean', name: '카카오 메시지 보내기',
    desc: 'POST + Bearer 토큰 (talk_message/default_send_me)',
    command: `curl -v -X POST "https://kapi.kakao.com/v2/api/talk/memo/default/send" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  --data-urlencode 'template_object={"object_type":"text","text":"안녕하세요!","link":{"web_url":"https://example.com"}}'`,
  },
  {
    id: 'kakao-oauth', emoji: '💬', category: 'korean', name: '카카오 OAuth 토큰 발급',
    desc: 'authorization_code → access_token (form-urlencoded)',
    command: `curl -X POST "https://kauth.kakao.com/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "redirect_uri=https://example.com/oauth/callback" \\
  -d "code=AUTH_CODE_HERE"`,
  },
  {
    id: 'naver-search', emoji: '🇰🇷', category: 'korean', name: '네이버 검색 API',
    desc: 'GET + X-Naver-Client-Id/Secret 헤더 (블로그 검색)',
    command: `curl -X GET "https://openapi.naver.com/v1/search/blog.json?query=%EB%89%B4%EC%8A%A4&display=10&start=1&sort=sim" \\
  -H "X-Naver-Client-Id: YOUR_CLIENT_ID" \\
  -H "X-Naver-Client-Secret: YOUR_CLIENT_SECRET"`,
  },
  {
    id: 'toss-confirm', emoji: '💳', category: 'korean', name: '토스페이먼츠 결제 승인',
    desc: 'POST + Basic Auth + JSON body',
    command: `curl -X POST "https://api.tosspayments.com/v1/payments/confirm" \\
  -H "Authorization: Basic dGVzdF9za19QOWRlMm9QTjk6" \\
  -H "Content-Type: application/json" \\
  -d '{"paymentKey":"PAYMENT_KEY_HERE","orderId":"order-12345","amount":15000}'`,
  },
  {
    id: 'coupang-search', emoji: '🛍️', category: 'korean', name: '쿠팡 파트너스 검색',
    desc: 'HMAC-SHA256 서명 헤더 (제휴 상품 검색)',
    command: `curl -X GET "https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=%EB%85%B8%ED%8A%B8%EB%B6%81&limit=20" \\
  -H "Authorization: CEA algorithm=HmacSHA256, access-key=YOUR_KEY, signed-date=240505T120000Z, signature=HMAC_SIGNATURE" \\
  -H "Content-Type: application/json"`,
  },

  /* ─── 글로벌 API (4) ─── */
  {
    id: 'github-user', emoji: '🐙', category: 'global', name: 'GitHub API — 사용자 정보',
    desc: 'GET + Bearer 토큰 (Personal Access Token)',
    command: `curl -X GET "https://api.github.com/user" \\
  -H "Authorization: Bearer ghp_YOUR_TOKEN_HERE" \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28"`,
  },
  {
    id: 'openai-chat', emoji: '🤖', category: 'global', name: 'OpenAI Chat Completions',
    desc: 'POST + Bearer + JSON (GPT-4 호출)',
    command: `curl -X POST "https://api.openai.com/v1/chat/completions" \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "안녕하세요!"}
    ],
    "temperature": 0.7
  }'`,
  },
  {
    id: 'slack-webhook', emoji: '💬', category: 'global', name: 'Slack 웹훅 메시지',
    desc: 'POST + JSON (Incoming Webhook)',
    command: `curl -X POST "https://hooks.slack.com/services/T00000/B00000/XXXXXXXX" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "🚀 배포 완료!",
    "channel": "#dev",
    "username": "deploy-bot"
  }'`,
  },
  {
    id: 'aws-s3-put', emoji: '☁️', category: 'global', name: 'AWS S3 PUT 객체',
    desc: 'PUT + AWS Signature V4 헤더',
    command: `curl -X PUT "https://my-bucket.s3.ap-northeast-2.amazonaws.com/path/to/file.txt" \\
  -H "Authorization: AWS4-HMAC-SHA256 Credential=AKIAYOUR/20240505/ap-northeast-2/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=YOUR_SIG" \\
  -H "x-amz-content-sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" \\
  -H "x-amz-date: 20240505T120000Z" \\
  --data-binary "Hello, S3!"`,
  },

  /* ─── 인증·업로드·GraphQL (3) ─── */
  {
    id: 'multipart-upload', emoji: '📤', category: 'upload', name: 'multipart 파일 업로드',
    desc: 'POST + -F (multipart/form-data)',
    command: `curl -X POST "https://api.example.com/upload" \\
  -H "Authorization: Bearer TOKEN" \\
  -F "file=@/path/to/photo.jpg" \\
  -F "title=내 사진" \\
  -F "description=업로드 테스트"`,
  },
  {
    id: 'graphql-query', emoji: '🔌', category: 'graphql', name: 'GraphQL 쿼리 (POST JSON)',
    desc: 'POST + query 필드 (변수 포함)',
    command: `curl -X POST "https://api.github.com/graphql" \\
  -H "Authorization: Bearer ghp_YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query($login: String!) { user(login: $login) { name bio repositories(first: 5) { nodes { name stargazerCount } } } }",
    "variables": { "login": "octocat" }
  }'`,
  },
  {
    id: 'basic-auth', emoji: '🔐', category: 'auth', name: 'Basic Auth (-u 옵션)',
    desc: '-u user:password 자동 Base64 인코딩',
    command: `curl -X GET "https://api.example.com/protected" \\
  -u "myuser:mypassword" \\
  -H "Accept: application/json"`,
  },
]

/* ═════════════════════════════════════════════
   토큰화 (셸 파서 단순화)
   - 단일 따옴표 ' ': 안의 모든 문자 그대로
   - 이중 따옴표 " ": \" \\ \n \t \r 이스케이프
   - 백슬래시 + 개행: 줄 이어짐 → 공백 1개
   - 일반 공백: 토큰 구분
   ═════════════════════════════════════════════ */
export function tokenize(input: string): string[] {
  /* 1. \\ + 개행 → 공백 (줄 이어짐) */
  const text = input.replace(/\\\r?\n/g, ' ')

  const tokens: string[] = []
  let cur = ''
  let i = 0
  let inToken = false

  while (i < text.length) {
    const c = text[i]

    /* 공백·탭·개행 → 토큰 종료 */
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      if (inToken) {
        tokens.push(cur)
        cur = ''
        inToken = false
      }
      i++
      continue
    }

    inToken = true

    /* ANSI-C 따옴표 $'…' — Chrome "Copy as cURL (bash)"가 ' · ! · 개행이 든 값에 사용 */
    if (c === '$' && text[i + 1] === "'") {
      i += 2
      while (i < text.length && text[i] !== "'") {
        /* 연속된 \xHH는 바이트열(UTF-8)로 모아서 해석 — bash와 같게 */
        const hexBytes = /^(?:\\x[0-9a-fA-F]{2})+/.exec(text.slice(i, i + 400))
        if (hexBytes) {
          const bytes = hexBytes[0].split('\\x').filter(Boolean).map((h) => parseInt(h, 16))
          cur += new TextDecoder().decode(new Uint8Array(bytes))
          i += hexBytes[0].length
          continue
        }
        if (text[i] === '\\' && i + 1 < text.length) {
          const [str, len] = readAnsiCEscape(text, i + 1)
          cur += str
          i += 1 + len
        } else {
          cur += text[i]
          i++
        }
      }
      i++  /* 닫는 ' 스킵 */
      continue
    }

    /* 단일 따옴표 — 그대로 (이스케이프 X) */
    if (c === "'") {
      i++
      while (i < text.length && text[i] !== "'") {
        cur += text[i]
        i++
      }
      i++  /* 닫는 ' 스킵 */
      continue
    }

    /* 이중 따옴표 — 이스케이프 처리 */
    if (c === '"') {
      i++
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < text.length) {
          const next = text[i + 1]
          if (next === '\\') cur += '\\'
          else if (next === '"') cur += '"'
          else if (next === 'n') cur += '\n'
          else if (next === 't') cur += '\t'
          else if (next === 'r') cur += '\r'
          else if (next === '$') cur += '$'
          else if (next === '`') cur += '`'
          else cur += '\\' + next  /* 알 수 없는 이스케이프 → 그대로 */
          i += 2
        } else {
          cur += text[i]
          i++
        }
      }
      i++  /* 닫는 " 스킵 */
      continue
    }

    /* 일반 문자에서 백슬래시 — 다음 문자 그대로 */
    if (c === '\\' && i + 1 < text.length) {
      cur += text[i + 1]
      i += 2
      continue
    }

    /* 일반 문자 */
    cur += c
    i++
  }

  if (inToken) tokens.push(cur)
  return tokens
}

/* $'…' 안의 백슬래시 이스케이프 1개 해석 — [해석된 문자열, 소비한 글자 수(백슬래시 뒤부터)] */
function readAnsiCEscape(text: string, p: number): [string, number] {
  const ch = text[p]
  const SIMPLE: Record<string, string> = {
    n: '\n', r: '\r', t: '\t', a: '\x07', b: '\b', e: '\x1b', E: '\x1b',
    f: '\f', v: '\v', '\\': '\\', "'": "'", '"': '"', '?': '?',
  }
  if (ch in SIMPLE) return [SIMPLE[ch], 1]
  const hexRun = (start: number, max: number) => {
    let j = start
    while (j < text.length && j - start < max && /[0-9a-fA-F]/.test(text[j])) j++
    return text.slice(start, j)
  }
  const fromCode = (code: number) => {
    try { return String.fromCodePoint(code) } catch { return '' }
  }
  if (ch === 'x' || ch === 'u' || ch === 'U') {
    const hex = hexRun(p + 1, ch === 'x' ? 2 : ch === 'u' ? 4 : 8)
    if (!hex) return ['\\' + ch, 1]
    return [fromCode(parseInt(hex, 16)), 1 + hex.length]
  }
  if (/[0-7]/.test(ch)) {
    let j = p
    while (j < text.length && j - p < 3 && /[0-7]/.test(text[j])) j++
    return [fromCode(parseInt(text.slice(p, j), 8)), j - p]
  }
  if (ch === 'c' && p + 1 < text.length) {
    return [String.fromCharCode(text.charCodeAt(p + 1) & 0x1f), 2]
  }
  return ['\\' + ch, 1]  /* 알 수 없는 이스케이프 → 그대로 */
}

/* ═════════════════════════════════════════════
   파서
   ═════════════════════════════════════════════ */
export interface ParsedHeader { key: string; value: string; sensitive?: boolean }
export interface QueryParam { key: string; value: string }

export interface ParsedCurl {
  method: Method
  url: string
  urlBase: string                       /* scheme://host[:port]/path (no query) */
  queryParams: QueryParam[]
  headers: ParsedHeader[]
  rawBody: string                        /* 원본 -d / --data 모음 */
  bodyType: BodyType
  bodyParsed?: unknown                   /* JSON 파싱된 객체 (성공 시) */
  bodyForm?: QueryParam[]                /* form-urlencoded 파싱 */
  bodyMultipart?: { name: string; value: string; isFile: boolean; filePath?: string }[]
  cookies: { key: string; value: string }[]
  auth: { user: string; password: string } | null
  flags: {
    insecure: boolean
    followRedirects: boolean
    compressed: boolean
    get: boolean
    verbose: boolean
  }
  unsupportedFlags: string[]             /* @filename, --cert, --proxy 등 */
  warnings: string[]
}

export interface ParseError {
  error: string
  suggestions?: string[]
}

const UNSUPPORTED_FLAGS = new Set([
  '--cert', '-E', '--key', '--cacert', '--cert-type',
  '--proxy', '-x', '--proxy-user', '--socks5', '--socks4',
  '-T', '--upload-file',
  '-o', '--output', '-O', '--remote-name', '-J', '--remote-header-name',
  '-r', '--range', '-C', '--continue-at',
  '--resolve', '--connect-to',
  '--no-buffer', '--limit-rate',
])

/* 짧은 옵션 결합(-sSL)·붙여 쓴 값(-XPUT, -H'…') 분해용 */
const SHORT_NO_ARG = new Set('sSLkviIGnfOqRNgjl0123456JZBapM#'.split(''))
const SHORT_WITH_ARG = new Set('XHdubAeFoTrCExmwDcKyYzUQPt'.split(''))

function expandShortCluster(t: string): string[] | null {
  if (t.startsWith('--') || t.length <= 2) return null
  const out: string[] = []
  const chars = t.slice(1)
  for (let k = 0; k < chars.length; k++) {
    const ch = chars[k]
    if (SHORT_WITH_ARG.has(ch)) {
      out.push('-' + ch)
      const rest = chars.slice(k + 1)
      if (rest) out.push(rest)
      return out
    }
    if (!SHORT_NO_ARG.has(ch)) return null  /* 모르는 글자 → 분해하지 않음 */
    out.push('-' + ch)
  }
  return out
}

export function parseCurl(input: string): ParsedCurl | ParseError {
  if (!input.trim()) {
    return { error: '빈 입력' }
  }

  /* curl 키워드 제거 (있으면) */
  let work = input.trim()
  if (work.toLowerCase().startsWith('curl')) {
    work = work.slice(4).trimStart()
  }

  const tokens = tokenize(work)
  if (tokens.length === 0) {
    return { error: 'curl 명령에 옵션·URL이 없습니다', suggestions: ['예: curl https://api.example.com'] }
  }

  let method: Method | undefined
  let url = ''
  const headers: ParsedHeader[] = []
  const dataItems: { value: string; mode: 'data' | 'data-raw' | 'data-binary' | 'data-urlencode' }[] = []
  const formItems: { name: string; value: string }[] = []
  const cookies: { key: string; value: string }[] = []
  let auth: { user: string; password: string } | null = null
  let userAgent: string | undefined
  let referer: string | undefined
  const flags = { insecure: false, followRedirects: false, compressed: false, get: false, verbose: false }
  const unsupportedFlags: string[] = []
  const warnings: string[] = []
  let headMode = false
  let jsonMode = false
  /* -d @파일처럼 본문을 파일에서 읽는 옵션 — 본문은 코드에 못 옮기지만 curl은 POST로 보낸다 */
  let bodyFromFile = false
  /* 도구가 추정해 붙인 Content-Type (-G로 본문이 쿼리로 옮겨가면 다시 뺀다) */
  let autoContentType = false

  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    /* 옵션이 아닌 토큰 → URL 후보 */
    if (!t.startsWith('-')) {
      if (!url) url = t
      i++
      continue
    }

    /* -sSL → -s -S -L, -XPUT → -X PUT (값 토큰은 next()로 소비되므로 여기 오지 않음) */
    const expanded = expandShortCluster(t)
    if (expanded) {
      tokens.splice(i, 1, ...expanded)
      continue
    }

    /* 미지원 옵션 */
    if (UNSUPPORTED_FLAGS.has(t)) {
      unsupportedFlags.push(t)
      /* 일부는 다음 토큰을 값으로 가짐 → 스킵 */
      if (['--cert', '-E', '--key', '--cacert', '--cert-type', '--proxy', '-x', '--proxy-user',
            '--socks5', '--socks4',  /* host[:port] 값을 받음 — 건너뛰지 않으면 URL로 오인 */
            '-T', '--upload-file', '-o', '--output', '-r', '--range',
            '-C', '--continue-at', '--resolve', '--connect-to', '--limit-rate'].includes(t)) {
        i += 2
      } else {
        i++
      }
      continue
    }

    /* --opt=value 형식 분리 */
    let optName = t
    let inlineVal: string | null = null
    if (t.startsWith('--') && t.includes('=')) {
      const eqIdx = t.indexOf('=')
      optName = t.slice(0, eqIdx)
      inlineVal = t.slice(eqIdx + 1)
    }

    const next = (): string => {
      if (inlineVal !== null) {
        const v = inlineVal
        inlineVal = null
        return v
      }
      i++
      return tokens[i] ?? ''
    }

    switch (optName) {
      case '-X': case '--request': {
        const v = next().toUpperCase()
        if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(v)) {
          method = v as Method
        }
        i++
        break
      }
      case '-H': case '--header': {
        const v = next()
        const colonIdx = v.indexOf(':')
        if (colonIdx > 0) {
          const key = v.slice(0, colonIdx).trim()
          const val = v.slice(colonIdx + 1).trim()
          headers.push({ key, value: val, sensitive: isSensitiveHeader(key) })
        }
        i++
        break
      }
      case '-d': case '--data': case '--data-ascii': {
        const v = next()
        if (v.startsWith('@')) {
          warnings.push(`-d @${v.slice(1)} (파일 업로드) — 미지원, 직접 처리 필요`)
          bodyFromFile = true
        } else {
          dataItems.push({ value: v, mode: 'data' })
        }
        i++
        break
      }
      case '--data-raw': {
        dataItems.push({ value: next(), mode: 'data-raw' })
        i++
        break
      }
      case '--data-binary': {
        const v = next()
        if (v.startsWith('@')) {
          warnings.push(`--data-binary @${v.slice(1)} (파일 업로드) — 미지원`)
          bodyFromFile = true
        } else {
          dataItems.push({ value: v, mode: 'data-binary' })
        }
        i++
        break
      }
      case '--data-urlencode': {
        dataItems.push({ value: next(), mode: 'data-urlencode' })
        i++
        break
      }
      case '--json': {
        /* curl 7.82+: --data-binary + Content-Type/Accept: application/json */
        const v = next()
        if (v.startsWith('@')) {
          warnings.push(`--json @${v.slice(1)} (파일 업로드) — 미지원`)
          bodyFromFile = true
        } else {
          dataItems.push({ value: v, mode: 'data-binary' })
        }
        jsonMode = true
        i++
        break
      }
      case '--url': {
        const v = next()
        if (!url) url = v
        i++
        break
      }
      case '-I': case '--head':      headMode = true; i++; break
      case '-u': case '--user': {
        const v = next()
        const colonIdx = v.indexOf(':')
        if (colonIdx >= 0) {
          auth = { user: v.slice(0, colonIdx), password: v.slice(colonIdx + 1) }
        } else {
          auth = { user: v, password: '' }
        }
        i++
        break
      }
      case '-b': case '--cookie': {
        const v = next()
        /* "name=value; name2=value2" 형식 */
        for (const pair of v.split(';')) {
          const [k, ...rest] = pair.trim().split('=')
          if (k) cookies.push({ key: k.trim(), value: rest.join('=').trim() })
        }
        i++
        break
      }
      case '-A': case '--user-agent': {
        userAgent = next()
        i++
        break
      }
      case '-e': case '--referer': {
        referer = next()
        i++
        break
      }
      case '-F': case '--form': {
        const v = next()
        const eqIdx = v.indexOf('=')
        if (eqIdx > 0) {
          formItems.push({ name: v.slice(0, eqIdx), value: v.slice(eqIdx + 1) })
        }
        i++
        break
      }
      case '-G': case '--get':       flags.get = true; i++; break
      case '-k': case '--insecure':  flags.insecure = true; i++; break
      case '-L': case '--location':  flags.followRedirects = true; i++; break
      case '--compressed':           flags.compressed = true; i++; break
      case '-v': case '--verbose':   flags.verbose = true; i++; break
      case '-i': case '--include':   i++; break  /* 헤더 포함 응답 — 정보용, 무시 */
      case '-s': case '--silent':    i++; break  /* 무시 */
      case '-S': case '--show-error': i++; break /* 무시 */
      case '-n': case '--netrc':     i++; break  /* 무시 */
      case '--no-progress-meter':    i++; break
      case '-#': case '--progress-bar': i++; break  /* 진행 막대 표시 — 무시 */
      case '--http1.1': case '--http2': case '--http3': i++; break  /* HTTP 버전 — 무시 */
      default: {
        /* 알 수 없는 옵션 → 경고하고 스킵 (값 있으면 함께) */
        if (optName.startsWith('--')) {
          /* 값을 받는지 모르니 일단 다음 토큰이 옵션이 아니면 스킵 */
          if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
            warnings.push(`알 수 없는 옵션 ${optName} (값 함께 무시)`)
            i += 2
          } else {
            warnings.push(`알 수 없는 옵션 ${optName}`)
            i++
          }
        } else if (optName.length === 2 && SHORT_WITH_ARG.has(optName[1])) {
          /* -m 10, -w '%{http_code}' 등 값을 받는 짧은 옵션 → 값까지 건너뜀 (URL로 오인 방지) */
          warnings.push(`알 수 없는 짧은 옵션 ${optName} (값 함께 무시)`)
          i += 2
        } else {
          warnings.push(`알 수 없는 짧은 옵션 ${optName}`)
          i++
        }
        break
      }
    }
  }

  if (jsonMode) {
    const has = (k: string) => headers.some((h) => h.key.toLowerCase() === k)
    if (!has('content-type')) headers.push({ key: 'Content-Type', value: 'application/json' })
    if (!has('accept')) headers.push({ key: 'Accept', value: 'application/json' })
  }

  if (!url) {
    return {
      error: 'URL이 발견되지 않았습니다',
      suggestions: ['cURL 명령에 URL이 포함되어야 합니다 (예: curl https://api.example.com)'],
    }
  }

  /* User-Agent / Referer / Cookie / Auth는 헤더로 변환 (코드 생성 편의) */
  if (userAgent) headers.push({ key: 'User-Agent', value: userAgent })
  if (referer) headers.push({ key: 'Referer', value: referer })
  if (cookies.length > 0) {
    const cookieStr = cookies.map((c) => `${c.key}=${c.value}`).join('; ')
    headers.push({ key: 'Cookie', value: cookieStr, sensitive: true })
  }
  if (auth) {
    /* Basic Auth는 별도 표시 — 헤더에는 추가하지 않음 (각 언어가 자체 처리) */
  }

  /* Body 처리 */
  let rawBody = ''
  let bodyType: BodyType = null
  let bodyParsed: unknown = undefined
  let bodyForm: QueryParam[] | undefined
  let bodyMultipart: ParsedCurl['bodyMultipart'] | undefined

  if (dataItems.length > 0) {
    /* data 항목 합치기 — 일반 -d는 & 로 구분, --data-binary는 그대로 */
    /* 단순화: 모든 -d와 --data-raw는 & 로 join, --data-urlencode는 인코드 후 join */
    const parts: string[] = []
    for (const item of dataItems) {
      if (item.mode === 'data-urlencode') {
        const eq = item.value.indexOf('=')
        if (eq > 0) {
          const k = item.value.slice(0, eq)
          const v = encodeURIComponent(item.value.slice(eq + 1))
          parts.push(`${k}=${v}`)
        } else {
          parts.push(encodeURIComponent(item.value))
        }
      } else if (item.mode === 'data-binary') {
        parts.push(item.value)
      } else {
        parts.push(item.value)
      }
    }
    rawBody = parts.join('&')

    /* body type 자동 감지 */
    const ct = detectContentTypeFromHeaders(headers)
    if (ct?.includes('application/json')) {
      bodyType = 'json'
      try {
        /* 단일 -d 인 경우 그대로, 여러 개라면 & 합쳤으니 첫 항목만 시도 */
        const singleBody = dataItems.length === 1 ? dataItems[0].value : rawBody
        bodyParsed = JSON.parse(singleBody)
        rawBody = singleBody
      } catch {
        /* JSON 파싱 실패 → raw로 처리 (본문이 코드에서 빠지지 않도록) */
        bodyType = 'raw'
        warnings.push('Content-Type은 JSON이지만 본문이 올바른 JSON이 아닙니다 — 본문을 원문 그대로 보내는 코드로 생성했습니다')
      }
    } else if (ct?.includes('application/x-www-form-urlencoded') || ct === null) {
      /* Content-Type이 명시 없을 때도 form-urlencoded로 추정 (curl 기본) */
      const looksLikeForm = /^[^\s={}[\]]+=[^&]*(&[^\s={}[\]]+=[^&]*)*$/.test(rawBody)
      if (looksLikeForm) {
        bodyType = 'urlencode'
        let badPercent = false
        const safeDecode = (v: string) => {
          try { return decodeURIComponent(v) } catch { badPercent = true; return v }
        }
        bodyForm = rawBody.split('&').map((kv) => {
          const eq = kv.indexOf('=')
          return eq >= 0
            ? { key: kv.slice(0, eq), value: safeDecode(kv.slice(eq + 1).replace(/\+/g, ' ')) }
            : { key: kv, value: '' }
        })
        if (badPercent) warnings.push('본문에 잘못된 % 인코딩이 있어 해당 값은 원문 그대로 두었습니다 (예: 50% → 50%25로 써야 정확)')
        /* Content-Type 없으면 추가 */
        if (!ct) {
          headers.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded' })
          autoContentType = true
        }
      } else {
        /* JSON 시도 */
        try {
          const trimmed = rawBody.trim()
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            bodyParsed = JSON.parse(trimmed)
            bodyType = 'json'
            if (!ct) {
              headers.push({ key: 'Content-Type', value: 'application/json' })
              autoContentType = true
            }
          } else {
            bodyType = 'raw'
          }
        } catch {
          bodyType = 'raw'
        }
      }
    } else {
      bodyType = 'raw'
    }
  }

  if (formItems.length > 0) {
    bodyType = 'multipart'
    bodyMultipart = formItems.map((f) => {
      const isFile = f.value.startsWith('@')
      return {
        name: f.name,
        value: isFile ? f.value.slice(1) : f.value,
        isFile,
        filePath: isFile ? f.value.slice(1) : undefined,
      }
    })
    if (bodyMultipart.some((m) => m.isFile)) {
      warnings.push('-F file=@... 파일 업로드 — 생성된 코드는 파일 경로 placeholder, 실제 파일 처리는 직접 추가 필요')
    }
    /* multipart는 fetch/axios가 자동으로 boundary 처리 → Content-Type 직접 설정 X */
  }

  /* 메서드 자동 결정 */
  if (!method) {
    if (headMode) method = 'HEAD'
    else if (flags.get) method = 'GET'
    else if (rawBody || formItems.length > 0 || bodyFromFile) method = 'POST'
    else method = 'GET'
  }

  /* -G 옵션: data를 query로 이동 */
  let finalUrl = url
  if (flags.get && rawBody) {
    finalUrl = url + (url.includes('?') ? '&' : '?') + rawBody
    rawBody = ''
    bodyType = null
    bodyParsed = undefined
    bodyForm = undefined
    /* 본문이 없어졌으니 도구가 추정해 붙인 Content-Type도 뺀다 (curl -G도 보내지 않음) */
    if (autoContentType) {
      const idx = headers.findIndex((h) => h.key.toLowerCase() === 'content-type')
      if (idx >= 0) headers.splice(idx, 1)
    }
  }

  /* URL 분해 */
  let urlBase = finalUrl
  let queryParams: QueryParam[] = []
  try {
    /* relative URL 가능성 → http://placeholder 임시 prepend */
    const tempUrl = finalUrl.startsWith('http') ? finalUrl : `http://placeholder/${finalUrl.replace(/^\//, '')}`
    const u = new URL(tempUrl)
    urlBase = `${u.protocol}//${u.host}${u.pathname}`
    if (!finalUrl.startsWith('http')) urlBase = u.pathname  /* relative 보존 */
    const sp = u.searchParams
    queryParams = [...sp.entries()].map(([k, v]) => ({ key: k, value: v }))
  } catch {
    /* 분해 실패 → 그대로 두기 */
  }

  return {
    method,
    url: finalUrl,
    urlBase,
    queryParams,
    headers,
    rawBody,
    bodyType,
    bodyParsed,
    bodyForm,
    bodyMultipart,
    cookies,
    auth,
    flags,
    unsupportedFlags,
    warnings,
  }
}

function detectContentTypeFromHeaders(headers: ParsedHeader[]): string | null {
  for (const h of headers) {
    if (h.key.toLowerCase() === 'content-type') return h.value.toLowerCase()
  }
  return null
}

/* ═════════════════════════════════════════════
   코드 생성 옵션
   ═════════════════════════════════════════════ */
export interface GenOpts {
  async: boolean
  tryCatch: boolean
  maskSensitive: boolean
}

function effectiveValue(h: ParsedHeader, opts: GenOpts): string {
  if (opts.maskSensitive && h.sensitive) return maskValue(h.value)
  return h.value
}

/* Basic 인증 user:pass → Base64. btoa()는 Latin-1 밖 문자(한글 등)에서 예외 → UTF-8 바이트로 먼저 변환 (curl도 입력 바이트 그대로 인코딩) */
function basicAuthB64(userPass: string): string {
  let bin = ''
  for (const b of new TextEncoder().encode(userPass)) bin += String.fromCharCode(b)
  return btoa(bin)
}

function escapePyString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

function escapeGoString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

/* multipart는 각 런타임이 boundary를 붙인 Content-Type을 만들어야 함 → 사용자가 준 헤더는 제외 */
function skipHeader(p: ParsedCurl, h: ParsedHeader): boolean {
  return p.bodyType === 'multipart' && h.key.toLowerCase() === 'content-type'
}

/* JSON 값 → Python 리터럴 (문자열 안의 true/null 등은 건드리지 않음) */
function toPyLiteral(v: unknown, level = 0): string {
  const pad = '  '.repeat(level + 1)
  const end = '  '.repeat(level)
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return Number.isFinite(v) ? JSON.stringify(v) : 'None'
  if (typeof v === 'string') return JSON.stringify(v)  /* JSON 이스케이프는 Python 문자열 이스케이프와 호환 */
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    return `[\n${v.map((x) => pad + toPyLiteral(x, level + 1)).join(',\n')}\n${end}]`
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return `{\n${entries.map(([k, x]) => `${pad}${JSON.stringify(k)}: ${toPyLiteral(x, level + 1)}`).join(',\n')}\n${end}}`
  }
  return 'None'
}

/* ═════════════════════════════════════════════
   1) fetch (modern JS)
   ═════════════════════════════════════════════ */
export function generateFetch(p: ParsedCurl, opts: GenOpts): string {
  const lines: string[] = []
  const headers: Record<string, string> = {}

  for (const h of p.headers) {
    if (skipHeader(p, h)) continue
    headers[h.key] = effectiveValue(h, opts)
  }
  if (p.auth) {
    const userPass = `${p.auth.user}:${p.auth.password}`
    const masked = opts.maskSensitive ? '***' : basicAuthB64(userPass)
    headers['Authorization'] = `Basic ${masked}`
  }

  const headersJson = Object.entries(headers)
    .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n')

  const init: string[] = [`  method: ${JSON.stringify(p.method)}`]
  if (Object.keys(headers).length > 0) {
    init.push(`  headers: {\n${headersJson}\n  }`)
  }
  if (p.bodyType === 'json' && p.bodyParsed !== undefined) {
    init.push(`  body: JSON.stringify(${JSON.stringify(p.bodyParsed, null, 2).replace(/\n/g, '\n    ')})`)
  } else if (p.bodyType === 'urlencode' && p.bodyForm) {
    const formStr = p.bodyForm.map((f) => `[${JSON.stringify(f.key)}, ${JSON.stringify(f.value)}]`).join(', ')
    init.push(`  body: new URLSearchParams([${formStr}]).toString()`)
  } else if (p.bodyType === 'multipart' && p.bodyMultipart) {
    init.push(`  body: formData /* see formData below */`)
  } else if (p.bodyType === 'raw' && p.rawBody) {
    init.push(`  body: ${JSON.stringify(p.rawBody)}`)
  }

  const initBlock = init.join(',\n')
  const url = JSON.stringify(p.url)
  /* HEAD 응답에는 본문이 없어 .json()이 실패 → 상태·헤더 출력 */
  const isHead = p.method === 'HEAD'
  const readRes = isHead ? '{ status: response.status, headers: Object.fromEntries(response.headers) }' : 'await response.json()'

  if (p.bodyType === 'multipart' && p.bodyMultipart) {
    lines.push(`const formData = new FormData()`)
    for (const m of p.bodyMultipart) {
      if (m.isFile) {
        lines.push(`formData.append(${JSON.stringify(m.name)}, fileInput.files[0]) /* TODO: ${m.filePath} */`)
      } else {
        lines.push(`formData.append(${JSON.stringify(m.name)}, ${JSON.stringify(m.value)})`)
      }
    }
    lines.push('')
  }

  if (opts.async) {
    if (opts.tryCatch) {
      lines.push(`try {`)
      lines.push(`  const response = await fetch(${url}, {\n${initBlock}\n  })`)
      lines.push(`  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)`)
      lines.push(`  const data = ${readRes}`)
      lines.push(`  console.log(data)`)
      lines.push(`} catch (err) {`)
      lines.push(`  console.error('Fetch failed:', err)`)
      lines.push(`}`)
    } else {
      lines.push(`const response = await fetch(${url}, {\n${initBlock}\n  })`)
      lines.push(`const data = ${readRes}`)
      lines.push(`console.log(data)`)
    }
  } else {
    lines.push(`fetch(${url}, {\n${initBlock}\n  })`)
    lines.push(isHead
      ? `  .then(response => ({ status: response.status, headers: Object.fromEntries(response.headers) }))`
      : `  .then(response => response.json())`)
    if (opts.tryCatch) {
      lines.push(`  .then(data => console.log(data))`)
      lines.push(`  .catch(err => console.error('Fetch failed:', err))`)
    } else {
      lines.push(`  .then(data => console.log(data))`)
    }
  }

  return lines.join('\n')
}

/* ═════════════════════════════════════════════
   2) axios
   ═════════════════════════════════════════════ */
export function generateAxios(p: ParsedCurl, opts: GenOpts): string {
  const lines: string[] = []
  lines.push(`import axios from 'axios'`)
  lines.push('')

  const headers: Record<string, string> = {}
  for (const h of p.headers) {
    /* axios가 multipart에서 Content-Type 자동 처리 → 제거 */
    if (skipHeader(p, h)) continue
    headers[h.key] = effectiveValue(h, opts)
  }

  const config: string[] = [
    `  method: ${JSON.stringify(p.method.toLowerCase())}`,
    `  url: ${JSON.stringify(p.url)}`,
  ]
  if (Object.keys(headers).length > 0) {
    const headersJson = Object.entries(headers)
      .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(',\n')
    config.push(`  headers: {\n${headersJson}\n  }`)
  }
  if (p.auth) {
    const u = opts.maskSensitive ? '***' : p.auth.user
    const pw = opts.maskSensitive ? '***' : p.auth.password
    config.push(`  auth: { username: ${JSON.stringify(u)}, password: ${JSON.stringify(pw)} }`)
  }
  if (p.bodyType === 'json' && p.bodyParsed !== undefined) {
    config.push(`  data: ${JSON.stringify(p.bodyParsed, null, 2).replace(/\n/g, '\n  ')}`)
  } else if (p.bodyType === 'urlencode' && p.bodyForm) {
    const formObj = p.bodyForm.map((f) => `    ${JSON.stringify(f.key)}: ${JSON.stringify(f.value)}`).join(',\n')
    config.push(`  data: new URLSearchParams({\n${formObj}\n  }).toString()`)
  } else if (p.bodyType === 'multipart' && p.bodyMultipart) {
    config.push(`  data: formData`)
  } else if (p.bodyType === 'raw' && p.rawBody) {
    config.push(`  data: ${JSON.stringify(p.rawBody)}`)
  }

  if (p.bodyType === 'multipart' && p.bodyMultipart) {
    lines.push(`const formData = new FormData()`)
    for (const m of p.bodyMultipart) {
      if (m.isFile) {
        lines.push(`formData.append(${JSON.stringify(m.name)}, fileInput.files[0]) /* TODO: ${m.filePath} */`)
      } else {
        lines.push(`formData.append(${JSON.stringify(m.name)}, ${JSON.stringify(m.value)})`)
      }
    }
    lines.push('')
  }

  const body = `axios({\n${config.join(',\n')}\n})`

  if (opts.async) {
    if (opts.tryCatch) {
      lines.push(`try {`)
      lines.push(`  const response = await ${body}`)
      lines.push(`  console.log(response.data)`)
      lines.push(`} catch (err) {`)
      lines.push(`  console.error('Axios error:', err.response?.data || err.message)`)
      lines.push(`}`)
    } else {
      lines.push(`const response = await ${body}`)
      lines.push(`console.log(response.data)`)
    }
  } else {
    lines.push(`${body}`)
    if (opts.tryCatch) {
      lines.push(`  .then(response => console.log(response.data))`)
      lines.push(`  .catch(err => console.error('Axios error:', err.response?.data || err.message))`)
    } else {
      lines.push(`  .then(response => console.log(response.data))`)
    }
  }

  return lines.join('\n')
}

/* ═════════════════════════════════════════════
   3) Python requests
   ═════════════════════════════════════════════ */
export function generatePython(p: ParsedCurl, opts: GenOpts): string {
  const lines: string[] = ['import requests']
  lines.push('')

  const url = `'${escapePyString(p.url)}'`
  const args: string[] = [url]

  /* headers */
  const headers: Record<string, string> = {}
  for (const h of p.headers) {
    if (skipHeader(p, h)) continue
    headers[h.key] = effectiveValue(h, opts)
  }
  if (Object.keys(headers).length > 0) {
    const headersJson = Object.entries(headers)
      .map(([k, v]) => `        '${escapePyString(k)}': '${escapePyString(v)}'`)
      .join(',\n')
    args.push(`headers={\n${headersJson}\n    }`)
  }

  /* auth */
  if (p.auth) {
    const u = opts.maskSensitive ? '***' : p.auth.user
    const pw = opts.maskSensitive ? '***' : p.auth.password
    args.push(`auth=('${escapePyString(u)}', '${escapePyString(pw)}')`)
  }

  /* body */
  if (p.bodyType === 'json' && p.bodyParsed !== undefined) {
    const pyDict = toPyLiteral(p.bodyParsed).replace(/\n/g, '\n    ')
    args.push(`json=${pyDict}`)
  } else if (p.bodyType === 'urlencode' && p.bodyForm) {
    const formStr = p.bodyForm.map((f) => `        '${escapePyString(f.key)}': '${escapePyString(f.value)}'`).join(',\n')
    args.push(`data={\n${formStr}\n    }`)
  } else if (p.bodyType === 'multipart' && p.bodyMultipart) {
    const filesEntries: string[] = []
    const dataEntries: string[] = []
    for (const m of p.bodyMultipart) {
      if (m.isFile) {
        filesEntries.push(`        '${escapePyString(m.name)}': open('${escapePyString(m.filePath ?? '')}', 'rb')`)
      } else {
        dataEntries.push(`        '${escapePyString(m.name)}': '${escapePyString(m.value)}'`)
      }
    }
    if (filesEntries.length > 0) args.push(`files={\n${filesEntries.join(',\n')}\n    }`)
    if (dataEntries.length > 0) args.push(`data={\n${dataEntries.join(',\n')}\n    }`)
  } else if (p.bodyType === 'raw' && p.rawBody) {
    args.push(`data='${escapePyString(p.rawBody)}'`)
  }

  const requestCall = `requests.${p.method.toLowerCase()}(\n    ${args.join(',\n    ')}\n)`

  if (opts.tryCatch) {
    lines.push(`try:`)
    lines.push(`    response = ${requestCall.replace(/^/gm, '    ').slice(4)}`)
    lines.push(`    response.raise_for_status()`)
    lines.push(`    data = ${p.method === 'HEAD' ? 'dict(response.headers)' : 'response.json()'}`)
    lines.push(`    print(data)`)
    lines.push(`except requests.RequestException as err:`)
    lines.push(`    print(f'Request failed: {err}')`)
  } else {
    lines.push(`response = ${requestCall}`)
    lines.push(`data = ${p.method === 'HEAD' ? 'dict(response.headers)' : 'response.json()'}`)
    lines.push(`print(data)`)
  }

  return lines.join('\n')
}

/* ═════════════════════════════════════════════
   4) Node.js http/https (built-in)
   ═════════════════════════════════════════════ */
export function generateNodeHttp(p: ParsedCurl, opts: GenOpts): string {
  const lines: string[] = []
  let proto = 'https'
  try {
    const u = new URL(p.url.startsWith('http') ? p.url : 'http://placeholder' + p.url)
    proto = u.protocol === 'http:' ? 'http' : 'https'
  } catch {}

  const isMultipart = p.bodyType === 'multipart' && !!p.bodyMultipart
  lines.push(`const ${proto} = require('${proto}')`)
  if (isMultipart) {
    lines.push(`const FormData = require('form-data') /* npm i form-data */`)
    if (p.bodyMultipart!.some((m) => m.isFile)) lines.push(`const fs = require('fs')`)
  }
  lines.push('')

  const headers: Record<string, string> = {}
  for (const h of p.headers) {
    if (skipHeader(p, h)) continue
    headers[h.key] = effectiveValue(h, opts)
  }
  if (p.auth) {
    const userPass = `${p.auth.user}:${p.auth.password}`
    const auth64 = opts.maskSensitive ? '***' : basicAuthB64(userPass)
    headers['Authorization'] = `Basic ${auth64}`
  }

  let bodyVar = ''
  if (p.bodyType === 'json' && p.bodyParsed !== undefined) {
    bodyVar = `const body = JSON.stringify(${JSON.stringify(p.bodyParsed, null, 2)})`
  } else if (p.bodyType === 'urlencode' && p.bodyForm) {
    const formObj = p.bodyForm.map((f) => `  ${JSON.stringify(f.key)}: ${JSON.stringify(f.value)}`).join(',\n')
    bodyVar = `const body = new URLSearchParams({\n${formObj}\n}).toString()`
  } else if (p.bodyType === 'raw' && p.rawBody) {
    bodyVar = `const body = ${JSON.stringify(p.rawBody)}`
  } else if (isMultipart) {
    const appends = p.bodyMultipart!.map((m) => m.isFile
      ? `form.append(${JSON.stringify(m.name)}, fs.createReadStream(${JSON.stringify(m.filePath ?? '')}))`
      : `form.append(${JSON.stringify(m.name)}, ${JSON.stringify(m.value)})`)
    bodyVar = [`const form = new FormData()`, ...appends].join('\n')
  }

  if (bodyVar) {
    lines.push(bodyVar)
    lines.push('')
  }

  const headerLines: string[] = []
  if (isMultipart) headerLines.push(`    ...form.getHeaders()`)  /* boundary 포함 Content-Type */
  for (const [k, v] of Object.entries(headers)) headerLines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
  if (bodyVar && !isMultipart) headerLines.push(`    'Content-Length': Buffer.byteLength(body)`)

  lines.push(`const url = new URL(${JSON.stringify(p.url)})`)
  lines.push(`const options = {`)
  lines.push(`  hostname: url.hostname,`)
  lines.push(`  port: url.port || ${proto === 'https' ? 443 : 80},`)
  lines.push(`  path: url.pathname + url.search,`)
  lines.push(`  method: ${JSON.stringify(p.method)},`)
  lines.push(`  headers: {\n${headerLines.join(',\n')}\n  }`)
  lines.push(`}`)
  lines.push('')
  lines.push(`const req = ${proto}.request(options, (res) => {`)
  if (p.method === 'HEAD') {
    /* HEAD 응답에는 본문이 없음 → 상태·헤더 출력 */
    lines.push(`  console.log(res.statusCode, res.headers)`)
    lines.push(`  res.resume()`)
  } else {
    lines.push(`  let chunks = []`)
    lines.push(`  res.on('data', (chunk) => chunks.push(chunk))`)
    lines.push(`  res.on('end', () => {`)
    lines.push(`    const data = Buffer.concat(chunks).toString()`)
    lines.push(`    console.log(JSON.parse(data))`)
    lines.push(`  })`)
  }
  lines.push(`})`)
  if (opts.tryCatch) {
    lines.push(``)
    lines.push(`req.on('error', (err) => console.error('Request failed:', err))`)
  }
  if (isMultipart) {
    lines.push(`form.pipe(req) /* 전송 후 자동으로 req.end() */`)
  } else {
    if (bodyVar) lines.push(`req.write(body)`)
    lines.push(`req.end()`)
  }

  return lines.join('\n')
}

/* ═════════════════════════════════════════════
   5) Go (net/http)
   ═════════════════════════════════════════════ */
export function generateGo(p: ParsedCurl, opts: GenOpts): string {
  const lines: string[] = []
  lines.push(`package main`)
  lines.push('')

  const imports = ['fmt', 'io', 'net/http']
  const isMultipart = p.bodyType === 'multipart' && !!p.bodyMultipart
  let bodyVar = ''
  if (p.bodyType === 'json' && p.bodyParsed !== undefined) {
    imports.push('bytes')
    const json = JSON.stringify(p.bodyParsed, null, 2)
    /* 백틱이 들어 있으면 raw string을 쓸 수 없음 → 일반 문자열 */
    bodyVar = json.includes('`')
      ? `body := bytes.NewReader([]byte("${escapeGoString(json)}"))`
      : `body := bytes.NewReader([]byte(\`${json}\`))`
  } else if (p.bodyType === 'urlencode' && p.bodyForm) {
    imports.push('strings', 'net/url')
    const formAssigns = p.bodyForm.map((f) => `form.Set("${escapeGoString(f.key)}", "${escapeGoString(f.value)}")`).join('\n')
    /* 변수명 form — 아래 응답 본문 변수 data와 겹치지 않게 */
    bodyVar = `form := url.Values{}\n${formAssigns}\nbody := strings.NewReader(form.Encode())`
  } else if (p.bodyType === 'raw' && p.rawBody) {
    imports.push('strings')
    bodyVar = `body := strings.NewReader("${escapeGoString(p.rawBody)}")`
  } else if (isMultipart) {
    imports.push('bytes', 'mime/multipart')
    const parts: string[] = [`body := &bytes.Buffer{}`, `mw := multipart.NewWriter(body)`]
    let fileIdx = 0
    for (const m of p.bodyMultipart!) {
      if (m.isFile) {
        if (fileIdx === 0) imports.push('os')
        fileIdx++
        const fv = `f${fileIdx}`
        const path = m.filePath ?? ''
        const base = path.split(/[\\/]/).pop() || path
        parts.push(
          `${fv}, err := os.Open("${escapeGoString(path)}")`,
          `if err != nil {`, `  fmt.Println("Error:", err)`, `  return`, `}`,
          `defer ${fv}.Close()`,
          `${fv}w, err := mw.CreateFormFile("${escapeGoString(m.name)}", "${escapeGoString(base)}")`,
          `if err != nil {`, `  fmt.Println("Error:", err)`, `  return`, `}`,
          `io.Copy(${fv}w, ${fv})`,
        )
      } else {
        parts.push(`mw.WriteField("${escapeGoString(m.name)}", "${escapeGoString(m.value)}")`)
      }
    }
    parts.push(`mw.Close()`)
    bodyVar = parts.join('\n')
  }

  if (imports.length === 1) {
    lines.push(`import "${imports[0]}"`)
  } else {
    lines.push(`import (`)
    for (const im of [...new Set(imports)]) lines.push(`  "${im}"`)
    lines.push(`)`)
  }
  lines.push('')

  lines.push(`func main() {`)

  if (bodyVar) {
    lines.push(`  ${bodyVar.replace(/\n/g, '\n  ')}`)
    lines.push(``)
  }

  const bodyArg = bodyVar ? 'body' : 'nil'
  lines.push(`  req, err := http.NewRequest("${p.method}", "${escapeGoString(p.url)}", ${bodyArg})`)
  lines.push(`  if err != nil {`)
  lines.push(`    fmt.Println("Error:", err)`)
  lines.push(`    return`)
  lines.push(`  }`)

  if (isMultipart) lines.push(`  req.Header.Set("Content-Type", mw.FormDataContentType())`)
  for (const h of p.headers) {
    if (skipHeader(p, h)) continue
    const v = effectiveValue(h, opts)
    lines.push(`  req.Header.Set("${escapeGoString(h.key)}", "${escapeGoString(v)}")`)
  }
  if (p.auth) {
    const u = opts.maskSensitive ? '***' : p.auth.user
    const pw = opts.maskSensitive ? '***' : p.auth.password
    lines.push(`  req.SetBasicAuth("${escapeGoString(u)}", "${escapeGoString(pw)}")`)
  }

  lines.push(``)
  lines.push(`  resp, err := http.DefaultClient.Do(req)`)
  lines.push(`  if err != nil {`)
  lines.push(`    fmt.Println("Request failed:", err)`)
  lines.push(`    return`)
  lines.push(`  }`)
  lines.push(`  defer resp.Body.Close()`)
  lines.push(``)
  lines.push(`  data, _ := io.ReadAll(resp.Body)`)
  lines.push(`  fmt.Println(string(data))`)
  lines.push(`}`)

  return lines.join('\n')
}

/* ═════════════════════════════════════════════
   디스패치
   ═════════════════════════════════════════════ */
export function generateCode(lang: LangId, p: ParsedCurl, opts: GenOpts): string {
  switch (lang) {
    case 'fetch':  return generateFetch(p, opts)
    case 'axios':  return generateAxios(p, opts)
    case 'python': return generatePython(p, opts)
    case 'node':   return generateNodeHttp(p, opts)
    case 'go':     return generateGo(p, opts)
  }
}

/* ═════════════════════════════════════════════
   포맷 헬퍼
   ═════════════════════════════════════════════ */
export function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function fmtInt(n: number): string {
  return n.toLocaleString('ko-KR')
}

/* 언어 메타 */
export const LANG_META: { id: LangId; emoji: string; name: string }[] = [
  { id: 'fetch',  emoji: '🟨', name: 'JavaScript (fetch)' },
  { id: 'axios',  emoji: '🟦', name: 'JavaScript (axios)' },
  { id: 'python', emoji: '🐍', name: 'Python (requests)' },
  { id: 'node',   emoji: '🟩', name: 'Node.js (http/https)' },
  { id: 'go',     emoji: '🐹', name: 'Go (net/http)' },
]
