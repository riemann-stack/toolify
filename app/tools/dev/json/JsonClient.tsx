'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import s from '../dev.module.css'
import { analyzeJson, jsonToCsv, jsonToInterfaces, unescapeJson } from './jsonUtils'
import { useInitialTab } from '@/components/useInitialTab'

type YamlDump = typeof import('js-yaml').dump

// YAML ↔ JSON 탭 (구 /tools/dev/yaml-json) — 탭을 열 때만 청크 로드 (기본 탭 번들 유지)
const YamlTab = dynamic(() => import('./YamlTab'), {
  loading: () => <p style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>불러오는 중…</p>,
})

type Tab = 'format' | 'tree' | 'transform' | 'yaml'
const TABS: Tab[] = ['yaml', 'format', 'tree', 'transform']

/** JSON 파싱에 실패한 입력이 YAML처럼 보이는지 — '{'·'['로 시작하지 않고 'key:'·'- 항목'·'---' 줄이 있으면 */
function looksLikeYaml(text: string): boolean {
  return !/^\s*[[{]/.test(text) && /^(---|\s*[A-Za-z_][\w.-]*:(\s|$)|\s*-\s)/m.test(text)
}

/** 본문 속 링크 모양 버튼 — 전역 터치 44px(button)로 줄 높이가 벌어지지 않게 minHeight 0 */
const inlineLinkBtn: CSSProperties = {
  background: 'none', border: 'none', padding: 0, minHeight: 0, font: 'inherit',
  color: 'var(--accent-ink)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer',
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
          <span className={s.treeToggle} onClick={() => setOpen(!open)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open) } }}
            role="button" aria-expanded={open} aria-label={open ? '접기' : '펼치기'} tabIndex={0}>{open ? '▾' : '▸'}</span>
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
  else if (typeof node === 'string') { valStr = JSON.stringify(node); valCls = s.treeStr }
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
  const [tab, setTab] = useState<Tab>('format')
  useInitialTab(TABS, setTab) // ?tab=yaml 딥링크 (구 /tools/dev/yaml-json 301 목적지)
  const [input, setInput] = useState('')
  // 'YAML처럼 보입니다' 안내로 YAML ↔ JSON 탭을 열 때 넘길 입력 — YamlTab이 받아 넣으면 비운다
  const [yamlSeed, setYamlSeed] = useState<string | null>(null)
  const [indent, setIndent] = useState<2 | 4>(2)
  const [transformMode, setTransformMode] = useState<'sortKeys' | 'escape' | 'unescape' | 'yaml' | 'ts' | 'csvFlat'>('ts')
  const [copied, setCopied] = useState<string>('')
  // js-yaml은 YAML 변환을 고를 때만 불러온다 (첫 로드 번들 절약)
  const [yamlDump, setYamlDump] = useState<YamlDump | null>(null)
  useEffect(() => {
    if (transformMode !== 'yaml' || yamlDump) return
    let alive = true
    import('js-yaml').then((m) => { if (alive) setYamlDump(() => m.dump) }).catch(() => {})
    return () => { alive = false }
  }, [transformMode, yamlDump])

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
  const transformOutput = useMemo((): string => {
    if (!parsed.ok) return ''
    try {
      switch (transformMode) {
        case 'sortKeys': return JSON.stringify(sortKeys(parsed.data), null, indent)
        case 'escape':   return JSON.stringify(JSON.stringify(parsed.data))
        case 'unescape': return unescapeJson(parsed.data, indent)
        case 'yaml':
          // noCompatMode 기본(false): yes·on 같은 YAML 1.1 불리언 문자열과 날짜형 문자열은 따옴표로 감싸 타입이 바뀌지 않게 함
          return yamlDump ? yamlDump(parsed.data, { indent: 2, lineWidth: -1, noRefs: true }) : ''
        case 'ts':       return jsonToInterfaces(parsed.data, 'Root').join('\n\n')
        case 'csvFlat':  return jsonToCsv(parsed.data)
      }
    } catch (e) {
      return '⚠️ 변환 오류: ' + (e as Error).message
    }
    return ''
  }, [parsed, transformMode, indent, yamlDump])

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
  async function copyValue(v: string, key: string) {
    if (!v) return
    try {
      await navigator.clipboard.writeText(v)
    } catch {
      return // 권한 거부 등 — 복사되지 않았으므로 '복사됨'을 띄우지 않음
    }
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  function fmtBytes(b: number): string {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(2)} MB`
  }

  // 빈 상태 안내 (트리 탭과 동일 패턴 — 정렬·압축 / 변환 탭 공용)
  const emptyState = (
    <div className={s.outputBox} style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <span>JSON을 입력하거나 샘플을 넣어보세요</span>
      <button className={s.clearBtn} onClick={handleSample}>샘플 넣기</button>
    </div>
  )

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabsFour}`}>
        <button className={`${s.tabBtn} ${tab === 'format'     ? s.tabActive : ''}`} onClick={() => setTab('format')}>정렬·압축·검증</button>
        <button className={`${s.tabBtn} ${tab === 'tree'       ? s.tabActive : ''}`} onClick={() => setTab('tree')}>트리 뷰어</button>
        <button className={`${s.tabBtn} ${tab === 'transform'  ? s.tabActive : ''}`} onClick={() => setTab('transform')}>변환 (TS·YAML·CSV)</button>
        <button className={`${s.tabBtn} ${tab === 'yaml'       ? s.tabActive : ''}`} onClick={() => setTab('yaml')}>YAML ↔ JSON</button>
      </div>

      {/* 공통 입력 — YAML ↔ JSON 탭은 자체 입력·검증을 쓰므로 숨김 (role=status 중복 방지) */}
      {tab !== 'yaml' && (
        <>
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel} htmlFor="json-input">JSON 입력</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {!input && <button className={s.clearBtn} onClick={handleSample}>샘플</button>}
                {input && <button className={s.clearBtn} onClick={handleClear}>지우기</button>}
              </div>
            </div>
            <textarea
              id="json-input"
              className={s.textarea}
              placeholder={'{\n  "key": "value"\n}'}
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={tab === 'tree' ? 6 : 10}
              spellCheck={false}
            />
            {/* 검증 상태 */}
            {input.trim() && parsed.ok && (
              <p role="status" style={{ fontSize: 12, color: 'var(--emerald-600)', marginTop: 8, fontWeight: 600 }}>✓ 유효한 JSON</p>
            )}
            {input.trim() && !parsed.ok && (
              <>
                <div className={s.errorBox} style={{ marginTop: 8 }} role="status">
                  <strong>⚠️ JSON 파싱 오류</strong>
                  <p>{parsed.error}</p>
                </div>
                {/* YAML을 JSON 칸에 붙여 넣은 경우 — YAML ↔ JSON 탭으로 안내 ({·[로 시작하지 않고 'key:'·'- '·'---' 줄이 있으면) */}
                {looksLikeYaml(input) && (
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: '8px 0 0' }}>
                    YAML처럼 보입니다 —{' '}
                    <button type="button" onClick={() => { setYamlSeed(input); setTab('yaml') }} style={inlineLinkBtn}>
                      이 입력을 YAML ↔ JSON 탭에서 변환하기 →
                    </button>
                  </p>
                )}
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

          {/* 통계 (JSON 탭 3개 공통) */}
          {parsed.ok && stats && sizes && (
            <div className={s.jsonStatGrid}>
              <div className={s.miniStat}><p className={s.miniStatLabel}>키 개수</p>     <p className={s.miniStatValue}>{stats.keys.toLocaleString()}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>객체 / 배열</p> <p className={s.miniStatValue}>{stats.objects} / {stats.arrays}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>최대 깊이</p>   <p className={s.miniStatValue}>{stats.depth}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>크기</p>       <p className={s.miniStatValue}>{fmtBytes(sizes.origBytes)}</p></div>
            </div>
          )}
        </>
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

          {!parsed.ok && emptyState}

          {/* 사이즈 비교 */}
          {sizes && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>사이즈 비교</label>
              </div>
              <div className={s.sizeRow}><span>원본 입력</span><strong>{fmtBytes(sizes.origBytes)}</strong></div>
              <div className={s.sizeRow}><span>정렬 (Beautify, 들여쓰기 {indent})</span><strong>{fmtBytes(sizes.fmtBytes)}</strong></div>
              <div className={s.sizeRow}><span>압축 (Minify)</span><strong style={{ color: 'var(--emerald-600)' }}>{fmtBytes(sizes.minBytes)}</strong></div>
              {sizes.saving > 0 && (
                <div className={s.sizeRow}><span>압축 절약률</span><strong style={{ color: 'var(--emerald-600)' }}>{sizes.saving.toFixed(1)}%</strong></div>
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

          {!parsed.ok && emptyState}

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
              <p className={s.seoCardTitle}>TypeScript 인터페이스 활용</p>
              <p className={s.seoCardText}>
                API 응답 JSON을 그대로 붙여넣으면 자동으로 TypeScript 타입을 생성합니다.
                중첩 객체는 별도 인터페이스로 분리되고, 키와 값 타입이 모두 같은 구조만 재사용됩니다.
                배열은 첫 번째 요소를 기준으로 타입을 정하니 요소마다 모양이 다르면 직접 보완하세요.
              </p>
            </div>
          )}
          {transformMode === 'yaml' && parsed.ok && (
            <div className={s.seoCard}>
              <p className={s.seoCardTitle}>YAML 활용</p>
              <p className={s.seoCardText}>
                Kubernetes·GitHub Actions·Docker Compose·Ansible 등에서 사용됩니다.
                JSON 대비 가독성이 좋고 주석 작성이 가능합니다.
              </p>
              <p className={s.seoCardText} style={{ marginTop: 6 }}>
                YAML을 JSON으로 되돌리거나 YAML 문법을 검증하려면{' '}
                <button
                  type="button"
                  onClick={() => setTab('yaml')}
                  style={inlineLinkBtn}
                >
                  YAML ↔ JSON 탭 →
                </button>
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 4: YAML ↔ JSON (양방향 변환·검증·예시 12개) ─── */}
      {tab === 'yaml' && <YamlTab seedInput={yamlSeed ?? undefined} onSeedApplied={() => setYamlSeed(null)} />}
    </div>
  )
}
