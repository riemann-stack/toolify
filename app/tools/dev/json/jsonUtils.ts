// JSON 도구 순수 로직 — 통계·TypeScript 인터페이스 생성·CSV·이스케이프 해제
// (page.tsx 가이드의 예시 표도 같은 함수로 빌드 시 계산한다)

// ─────────────────────────────────────────────
// JSON 통계
// ─────────────────────────────────────────────
export type JsonStats = { keys: number; arrays: number; objects: number; strings: number; numbers: number; depth: number }

/** 키 개수(중첩 포함)·객체/배열 수·최대 깊이.
 *  깊이: 최상위 값 0, 객체·배열 안으로 들어갈 때마다 +1 — YAML ↔ JSON 탭 maxDepth('중첩 깊이')와 같은 기준 ({"a":1} → 1) */
export function analyzeJson(value: unknown, depth = 0, acc: JsonStats = { keys: 0, arrays: 0, objects: 0, strings: 0, numbers: 0, depth: 0 }): JsonStats {
  acc.depth = Math.max(acc.depth, depth)
  if (Array.isArray(value)) {
    acc.arrays++
    for (const v of value) analyzeJson(v, depth + 1, acc)
  } else if (value !== null && typeof value === 'object') {
    acc.objects++
    const obj = value as Record<string, unknown>
    for (const k of Object.keys(obj)) {
      acc.keys++
      analyzeJson(obj[k], depth + 1, acc)
    }
  } else if (typeof value === 'string') {
    acc.strings++
  } else if (typeof value === 'number') {
    acc.numbers++
  }
  return acc
}

// ─────────────────────────────────────────────
// 객체 배열 → CSV (RFC 4180 방식 따옴표)
// ─────────────────────────────────────────────
/** 헤더 = 모든 요소 키의 합집합(처음 나온 순서). 중첩 객체·배열 값은 JSON 문자열, null은 빈 칸.
 *  쉼표·큰따옴표·줄바꿈(CR/LF)이 든 칸은 큰따옴표로 감싸고 안의 " 는 "" 로. 헤더 칸에도 같은 규칙.
 *  null·원시값 요소는 빈 행(요소 수 = 데이터 행 수). 첫 요소가 객체가 아니면 안내 문구를 돌려준다. */
export function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return '⚠️ CSV 변환은 객체 배열이 필요합니다 (예: [{"a":1,"b":2}])'
  if (data[0] === null || typeof data[0] !== 'object') return '⚠️ 배열의 요소가 객체가 아닙니다'
  const rows = data.map((o) => (o !== null && typeof o === 'object' ? (o as Record<string, unknown>) : {}))
  const headers = Array.from(new Set(rows.flatMap((o) => Object.keys(o))))
  const cell = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const str = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  return [headers.map(cell).join(','), ...rows.map((o) => headers.map((h) => cell(o[h])).join(','))].join('\n')
}

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
