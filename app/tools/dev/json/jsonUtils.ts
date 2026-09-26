// JSON 도구 순수 로직 — TypeScript 인터페이스 생성·이스케이프 해제

// ─────────────────────────────────────────────
// JSON → TypeScript Interface
// ─────────────────────────────────────────────
const TS_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const TS_RESERVED = new Set([
  // 원시·특수 타입
  'string', 'number', 'boolean', 'object', 'unknown', 'any', 'never', 'null', 'undefined', 'void', 'symbol', 'bigint',
  // 전역 lib 타입 — 같은 이름의 interface를 만들면 전역 선언과 병합·충돌(비모듈 파일)하거나 가려 버림(모듈 파일)
  'array', 'readonlyarray', 'promise', 'map', 'set', 'weakmap', 'weakset', 'record', 'partial', 'required', 'readonly',
  'pick', 'omit', 'exclude', 'extract', 'nonnullable', 'awaited', 'returntype', 'parameters',
  'date', 'error', 'regexp', 'function', 'json', 'math', 'iterator', 'iterable', 'generator',
  // DOM lib 전역 인터페이스 중 JSON 키로 흔한 이름
  'event', 'location', 'request', 'response', 'headers', 'url', 'file', 'blob', 'text', 'comment', 'node', 'element',
  'document', 'window', 'history', 'navigator', 'storage', 'notification', 'selection', 'range', 'screen', 'console',
])
/** Type 접미사를 붙여도 DOM 전역 타입과 겹치는 이름 → Data 접미사 (Response → ResponseData) */
const TS_TYPE_SUFFIX_TAKEN = new Set(['ResponseType', 'DocumentType'])

/** 키 이름 → 유효한 PascalCase 인터페이스 이름 ('user-info' → 'UserInfo', '1st' → 'T1st') */
export function toInterfaceName(hint: string): string {
  const pascal = hint
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  if (!pascal) return ''
  const name = /^[0-9]/.test(pascal) ? `T${pascal}` : pascal
  if (!TS_RESERVED.has(name.toLowerCase())) return name
  return TS_TYPE_SUFFIX_TAKEN.has(`${name}Type`) ? `${name}Data` : `${name}Type`
}

/** JSON 값 → TypeScript 인터페이스 선언 목록 (의존 순서: 하위 타입 먼저, Root 마지막) */
export function jsonToInterfaces(value: unknown, rootName: string): string[] {
  let counter = 0
  const interfaces: string[] = []
  const seen = new Map<string, string>() // 구조 시그니처(키+값 타입) → 인터페이스 이름
  const usedNames = new Set<string>()

  function uniqueName(hint: string): string {
    const base = toInterfaceName(hint) || `Type${++counter}`
    let name = base
    let n = 2
    while (usedNames.has(name)) name = `${base}${n++}`
    usedNames.add(name)
    return name
  }

  function process(v: unknown, hint: string): string {
    if (v === null) return 'null'
    if (Array.isArray(v)) {
      if (v.length === 0) return 'unknown[]'
      // 배열의 첫 요소 타입
      const inner = process(v[0], `${hint}Item`)
      return `${inner.includes(' ') ? `(${inner})` : inner}[]`
    }
    if (typeof v === 'object') {
      const obj = v as Record<string, unknown>
      const keys = Object.keys(obj).sort()
      // 자식 타입을 먼저 계산해 시그니처에 포함 — 키 이름만 같고 타입이 다른 객체를 재사용하지 않도록
      const fields = keys.map((k) => ({ k, isNull: obj[k] === null, type: process(obj[k], k) }))
      const signature = fields.map((f) => `${JSON.stringify(f.k)}:${f.type}`).join('|')
      const existing = seen.get(signature)
      if (existing && signature !== '') return existing
      const interfaceName = uniqueName(hint)
      seen.set(signature, interfaceName)
      const lines = [`interface ${interfaceName} {`]
      for (const f of fields) {
        const safeKey = TS_IDENT.test(f.k) ? f.k : JSON.stringify(f.k)
        // 샘플 값이 null이면 실제 타입을 알 수 없음 — null로 두고 표시만 한다
        lines.push(f.isNull ? `  ${safeKey}: null // 샘플 값이 null — 실제 타입 | null 로 바꾸세요` : `  ${safeKey}: ${f.type}`)
      }
      lines.push('}')
      interfaces.push(lines.join('\n'))
      return interfaceName
    }
    return typeof v
  }

  process(value, rootName)
  return interfaces // 하위 타입이 먼저, root가 마지막
}

// ─────────────────────────────────────────────
// 이스케이프 해제 — 항상 문자열을 돌려준다
// ─────────────────────────────────────────────
export function unescapeJson(data: unknown, indent: number): string {
  if (typeof data === 'string') {
    try {
      const inner: unknown = JSON.parse(data)
      return typeof inner === 'string' ? inner : JSON.stringify(inner, null, indent)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, indent)
}
