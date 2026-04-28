'use client'

import { useMemo, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// JSON 통계
// ─────────────────────────────────────────────
type JsonStats = { keys: number; arrays: number; objects: number; strings: number; numbers: number; depth: number }
function analyzeJson(value: unknown, depth = 1, acc: JsonStats = { keys: 0, arrays: 0, objects: 0, strings: 0, numbers: 0, depth: 1 }): JsonStats {
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
// JSON 키 정렬 (재귀)
// ─────────────────────────────────────────────
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const k of Object.keys(obj).sort()) {
      sorted[k] = sortKeys(obj[k])
    }
    return sorted
  }
  return value
}

// ─────────────────────────────────────────────
// JSON → TypeScript Interface
// ─────────────────────────────────────────────
function jsonToTsType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    const inner = jsonToTsType(value[0])
    return `${inner}[]`
  }
  if (typeof value === 'object') {
    return 'object' // placeholder, expanded by caller
  }
  return typeof value
}

let interfaceCounter = 0
function jsonToInterfaces(value: unknown, name: string): string[] {
  interfaceCounter = 0
  const interfaces: string[] = []
  const seen = new Map<string, string>() // signature → name

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
      const signature = keys.join('|')
      if (seen.has(signature) && signature !== '') {
        return seen.get(signature)!
      }
      const interfaceName = capitalizeFirst(hint) || `Type${++interfaceCounter}`
      seen.set(signature, interfaceName)
      const lines = [`interface ${interfaceName} {`]
      for (const k of keys) {
        const val = obj[k]
        const valType = process(val, k)
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`
        const optional = val === null ? '?: ' : ': '
        lines.push(`  ${safeKey}${optional}${valType}`)
      }
      lines.push('}')
      interfaces.push(lines.join('\n'))
      return interfaceName
    }
    return typeof v
  }

  process(value, name)
  return interfaces.reverse() // root last
}
function capitalizeFirst(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─────────────────────────────────────────────
// JSON → YAML (간단)
// ─────────────────────────────────────────────
function jsonToYaml(value: unknown, depth = 0): string {
  const indent = '  '.repeat(depth)
  if (value === null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    if (/^[\w\s.,/-]*$/.test(value) && value !== '' && !/^(true|false|null|\d)/.test(value)) {
      return value
    }
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return '\n' + value.map(v => `${indent}- ${jsonToYaml(v, depth + 1).replace(/^\n/, '')}`).join('\n')
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    const lines = keys.map(k => {
      const v = obj[k]
      const sub = jsonToYaml(v, depth + 1)
      const isComplex = (typeof v === 'object' && v !== null)
      if (isComplex && sub.startsWith('\n')) return `${indent}${k}:${sub}`
      if (isComplex) return `${indent}${k}:\n${sub}`
      return `${indent}${k}: ${sub}`
    })
    return depth === 0 ? lines.join('\n') : '\n' + lines.join('\n')
  }
  return ''
}

// ─────────────────────────────────────────────
// JSON 에러 위치 추출
// ─────────────────────────────────────────────
function findErrorLine(input: string, error: string): { line: number; col: number; lineText: string } | null {
  // 패턴 1: "at position N"
  const posMatch = error.match(/position (\d+)/)
  if (posMatch) {
    const pos = parseInt(posMatch[1])
    let line = 1
    let col = 1
    for (let i = 0; i < pos && i < input.length; i++) {
      if (input[i] === '\n') { line++; col = 1 }
      else col++
    }
    const lines = input.split('\n')
    return { line, col, lineText: lines[line - 1] ?? '' }
  }
  // 패턴 2: "at line N column N"
  const lineMatch = error.match(/line (\d+) column (\d+)/i)
  if (lineMatch) {
    const line = parseInt(lineMatch[1])
    const col = parseInt(lineMatch[2])
    const lines = input.split('\n')
    return { line, col, lineText: lines[line - 1] ?? '' }
  }
  return null
}

// ─────────────────────────────────────────────
// JSON 트리 노드
// ─────────────────────────────────────────────
type TreeProps = { node: unknown; nodeKey?: string; isLast?: boolean }
function TreeNode({ node, nodeKey, isLast = true }: TreeProps) {
  const [open, setOpen] = useState(true)
  const isObj = node !== null && typeof node === 'object' && !Array.isArray(node)
  const isArr = Array.isArray(node)
  const isCollapsible = isObj || isArr

  if (isCollapsible) {
    const obj = node as Record<string, unknown> | unknown[]
    const keys = Array.isArray(obj) ? obj.map((_, i) => i) : Object.keys(obj)
    const open1 = isArr ? '[' : '{'
    const close1 = isArr ? ']' : '}'
    return (
      <div>
        <span>
          <span className={s.treeToggle} onClick={() => setOpen(!open)}>{open ? '▾' : '▸'}</span>
          {nodeKey !== undefined && <span className={s.treeKey}>&quot;{nodeKey}&quot;</span>}
          {nodeKey !== undefined && <span className={s.treeBracket}>: </span>}
          <span className={s.treeBracket}>{open1}</span>
          {!open && <span className={s.treeMeta}>{keys.length} {isArr ? 'items' : 'keys'}</span>}
          {!open && <span className={s.treeBracket}>{close1}{isLast ? '' : ','}</span>}
        </span>
        {open && (
          <div className={s.treeIndent}>
            {keys.map((k, i) => {
              const childKey = isArr ? undefined : String(k)
              const childVal = isArr ? (obj as unknown[])[k as number] : (obj as Record<string, unknown>)[k as string]
              return <TreeNode key={i} node={childVal} nodeKey={childKey} isLast={i === keys.length - 1} />
            })}
          </div>
        )}
        {open && <div><span className={s.treeBracket}>{close1}{isLast ? '' : ','}</span></div>}
      </div>
    )
  }

  // primitive
  let valStr = ''
  let valCls = ''
  if (node === null) { valStr = 'null'; valCls = s.treeNull }
  else if (typeof node === 'string') { valStr = `"${node}"`; valCls = s.treeStr }
  else if (typeof node === 'number') { valStr = String(node); valCls = s.treeNum }
  else if (typeof node === 'boolean') { valStr = String(node); valCls = s.treeBool }

  return (
    <div>
      <span style={{ paddingLeft: 14 }}>
        {nodeKey !== undefined && <span className={s.treeKey}>&quot;{nodeKey}&quot;</span>}
        {nodeKey !== undefined && <span className={s.treeBracket}>: </span>}
        <span className={valCls}>{valStr}</span>
        {!isLast && <span className={s.treeBracket}>,</span>}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
const SAMPLE_JSON = `{
  "name": "Alice",
  "age": 30,
  "isAdmin": false,
  "tags": ["dev", "designer"],
  "address": {
    "city": "Seoul",
    "zip": "06000"
  }
}`

export default function JsonClient() {
  const [tab, setTab] = useState<'format' | 'tree' | 'transform'>('format')
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<2 | 4>(2)
  const [transformMode, setTransformMode] = useState<'sortKeys' | 'escape' | 'unescape' | 'yaml' | 'ts' | 'csvFlat'>('ts')
  const [copied, setCopied] = useState<string>('')

  // 파싱
  const parsed = useMemo(() => {
    if (!input.trim()) return { ok: false as const, data: null, error: '', raw: '' }
    try {
      const data = JSON.parse(input)
      return { ok: true as const, data, error: '', raw: input }
    } catch (e) {
      return { ok: false as const, data: null, error: (e as Error).message, raw: input }
    }
  }, [input])

  const errPos = useMemo(() => {
    if (parsed.ok || !parsed.error) return null
    return findErrorLine(input, parsed.error)
  }, [parsed, input])

  // 통계
  const stats = useMemo(() => {
    if (!parsed.ok) return null
    return analyzeJson(parsed.data)
  }, [parsed])

  // 사이즈 비교
  const sizes = useMemo(() => {
    if (!parsed.ok) return null
    const minified = JSON.stringify(parsed.data)
    const formatted = JSON.stringify(parsed.data, null, indent)
    const origBytes = new TextEncoder().encode(input).length
    return {
      origBytes,
      minBytes: new TextEncoder().encode(minified).length,
      fmtBytes: new TextEncoder().encode(formatted).length,
      saving: ((origBytes - new TextEncoder().encode(minified).length) / origBytes) * 100,
    }
  }, [parsed, input, indent])

  // 변환 출력
  const transformOutput = useMemo(() => {
    if (!parsed.ok) return ''
    try {
      switch (transformMode) {
        case 'sortKeys': return JSON.stringify(sortKeys(parsed.data), null, indent)
        case 'escape':   return JSON.stringify(JSON.stringify(parsed.data))
        case 'unescape': {
          if (typeof parsed.data === 'string') {
            try { return JSON.parse(parsed.data) } catch { return parsed.data }
          }
          return JSON.stringify(parsed.data, null, indent)
        }
        case 'yaml':     return jsonToYaml(parsed.data)
        case 'ts':       return jsonToInterfaces(parsed.data, 'Root').join('\n\n')
        case 'csvFlat': {
          if (!Array.isArray(parsed.data) || parsed.data.length === 0) return '⚠️ CSV 변환은 객체 배열이 필요합니다 (예: [{"a":1,"b":2}])'
          const arr = parsed.data as Record<string, unknown>[]
          if (typeof arr[0] !== 'object') return '⚠️ 배열의 요소가 객체가 아닙니다'
          const headers = Array.from(new Set(arr.flatMap(o => Object.keys(o))))
          const escapeCsv = (v: unknown) => {
            if (v === null || v === undefined) return ''
            const str = typeof v === 'object' ? JSON.stringify(v) : String(v)
            if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
            return str
          }
          const rows = arr.map(o => headers.map(h => escapeCsv(o[h])).join(','))
          return [headers.join(','), ...rows].join('\n')
        }
      }
    } catch (e) {
      return '⚠️ 변환 오류: ' + (e as Error).message
    }
    return ''
  }, [parsed, transformMode, indent])

  // 액션
  function handleFormat() {
    if (!parsed.ok) return
    setInput(JSON.stringify(parsed.data, null, indent))
  }
  function handleMinify() {
    if (!parsed.ok) return
    setInput(JSON.stringify(parsed.data))
  }
  function handleSample() {
    setInput(SAMPLE_JSON)
  }
  function handleClear() {
    setInput('')
  }
  function copyValue(v: string, key: string) {
    if (!v) return
    navigator.clipboard.writeText(v)
    setCopied(key)
    setTimeout(() => setCopied(''), 1200)
  }

  function fmtBytes(b: number): string {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabsThree}`}>
        <button className={`${s.tabBtn} ${tab === 'format'     ? s.tabActive : ''}`} onClick={() => setTab('format')}>정렬·압축·검증</button>
        <button className={`${s.tabBtn} ${tab === 'tree'       ? s.tabActive : ''}`} onClick={() => setTab('tree')}>트리 뷰어</button>
        <button className={`${s.tabBtn} ${tab === 'transform'  ? s.tabActive : ''}`} onClick={() => setTab('transform')}>변환 (TS·YAML·CSV)</button>
      </div>

      {/* 공통 입력 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel}>JSON 입력</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {!input && <button className={s.clearBtn} onClick={handleSample}>샘플</button>}
            {input && <button className={s.clearBtn} onClick={handleClear}>지우기</button>}
          </div>
        </div>
        <textarea
          className={s.textarea}
          placeholder={'{\n  "key": "value"\n}'}
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={tab === 'tree' ? 6 : 10}
          spellCheck={false}
        />
        {/* 검증 상태 */}
        {input.trim() && parsed.ok && (
          <p style={{ fontSize: 12, color: '#3EFF9B', marginTop: 8, fontWeight: 600 }}>✓ 유효한 JSON</p>
        )}
        {input.trim() && !parsed.ok && (
          <>
            <div className={s.errorBox} style={{ marginTop: 8 }}>
              <strong>⚠️ JSON 파싱 오류</strong>
              <p>{parsed.error}</p>
            </div>
            {errPos && (
              <div className={s.errorPosition}>
                <div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 4 }}>
                  Line {errPos.line}, Column {errPos.col}
                </div>
                <div>{errPos.lineText}</div>
                <div className={s.errMarker}>{' '.repeat(Math.max(0, errPos.col - 1))}^</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 통계 (모든 탭 공통) */}
      {parsed.ok && stats && sizes && (
        <div className={s.jsonStatGrid}>
          <div className={s.miniStat}><p className={s.miniStatLabel}>키 개수</p>     <p className={s.miniStatValue}>{stats.keys.toLocaleString()}</p></div>
          <div className={s.miniStat}><p className={s.miniStatLabel}>객체 / 배열</p> <p className={s.miniStatValue}>{stats.objects} / {stats.arrays}</p></div>
          <div className={s.miniStat}><p className={s.miniStatLabel}>최대 깊이</p>   <p className={s.miniStatValue}>{stats.depth}</p></div>
          <div className={s.miniStat}><p className={s.miniStatLabel}>크기</p>       <p className={s.miniStatValue}>{fmtBytes(sizes.origBytes)}</p></div>
        </div>
      )}

      {/* ─── TAB 1: 정렬·압축·검증 ─── */}
      {tab === 'format' && (
        <>
          <div className={s.optionRow} style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={s.cardLabel} style={{ margin: 0 }}>들여쓰기</span>
              {([2, 4] as (2 | 4)[]).map(n => (
                <button
                  key={n}
                  className={`${s.subActionBtn} ${indent === n ? s.subActionBtnActive : ''}`}
                  onClick={() => setIndent(n)}
                >
                  {n}칸
                </button>
              ))}
            </div>
          </div>

          <div className={s.actionRow}>
            <button className={s.actionBtn} onClick={handleFormat} disabled={!parsed.ok}>
              ✦ 정렬 (Beautify)
            </button>
            <button className={`${s.actionBtn} ${s.actionBtnSecondary}`} onClick={handleMinify} disabled={!parsed.ok}>
              ⊟ 압축 (Minify)
            </button>
          </div>

          {/* 사이즈 비교 */}
          {sizes && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>📏 사이즈 비교</label>
              </div>
              <div className={s.sizeRow}><span>원본 입력</span><strong>{fmtBytes(sizes.origBytes)}</strong></div>
              <div className={s.sizeRow}><span>정렬 (Beautify, 들여쓰기 {indent})</span><strong>{fmtBytes(sizes.fmtBytes)}</strong></div>
              <div className={s.sizeRow}><span>압축 (Minify)</span><strong style={{ color: '#3EFF9B' }}>{fmtBytes(sizes.minBytes)}</strong></div>
              {sizes.saving > 0 && (
                <div className={s.sizeRow}><span>압축 절약률</span><strong style={{ color: '#3EFF9B' }}>{sizes.saving.toFixed(1)}%</strong></div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: 트리 뷰어 ─── */}
      {tab === 'tree' && (
        <>
          {parsed.ok ? (
            <div className={s.treeView}>
              <TreeNode node={parsed.data} />
            </div>
          ) : (
            <div className={s.outputBox} style={{ color: 'var(--muted)' }}>
              유효한 JSON을 입력하면 트리 형태로 표시됩니다
            </div>
          )}
        </>
      )}

      {/* ─── TAB 3: 변환 ─── */}
      {tab === 'transform' && (
        <>
          <div className={s.subActionRow}>
            {[
              { k: 'ts',       label: 'TypeScript 인터페이스' },
              { k: 'yaml',     label: 'YAML' },
              { k: 'csvFlat',  label: 'CSV (배열만)' },
              { k: 'sortKeys', label: '키 알파벳 정렬' },
              { k: 'escape',   label: '문자열 이스케이프' },
              { k: 'unescape', label: '이스케이프 해제' },
            ].map(o => (
              <button
                key={o.k}
                className={`${s.subActionBtn} ${transformMode === o.k ? s.subActionBtnActive : ''}`}
                onClick={() => setTransformMode(o.k as typeof transformMode)}
                disabled={!parsed.ok}
              >
                {o.label}
              </button>
            ))}
          </div>

          {parsed.ok && transformOutput && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>
                  {transformMode === 'ts' ? 'TypeScript 인터페이스' :
                   transformMode === 'yaml' ? 'YAML' :
                   transformMode === 'csvFlat' ? 'CSV' :
                   transformMode === 'sortKeys' ? '키 정렬된 JSON' :
                   transformMode === 'escape' ? '이스케이프된 문자열' :
                   '이스케이프 해제 결과'}
                </label>
                <button className={s.copyBtn} onClick={() => copyValue(transformOutput, 'transform')}>
                  {copied === 'transform' ? '✓ 복사됨' : '복사'}
                </button>
              </div>
              <pre className={s.preBox}>{transformOutput}</pre>
            </div>
          )}

          {transformMode === 'ts' && parsed.ok && (
            <div className={s.seoCard}>
              <p className={s.seoCardTitle}>💡 TypeScript 인터페이스 활용</p>
              <p className={s.seoCardText}>
                API 응답 JSON을 그대로 붙여넣으면 자동으로 TypeScript 타입을 생성합니다.
                중첩 객체는 별도 인터페이스로 분리되며, 동일 구조는 재사용됩니다.
              </p>
            </div>
          )}
          {transformMode === 'yaml' && parsed.ok && (
            <div className={s.seoCard}>
              <p className={s.seoCardTitle}>💡 YAML 활용</p>
              <p className={s.seoCardText}>
                Kubernetes·GitHub Actions·Docker Compose·Ansible 등에서 사용됩니다.
                JSON 대비 가독성이 좋고 주석 작성이 가능합니다.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
