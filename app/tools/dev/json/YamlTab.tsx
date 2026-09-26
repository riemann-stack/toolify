/* eslint-disable react-hooks/set-state-in-effect */
'use client'

/* JSON 포맷터 — 'YAML ↔ JSON' 탭 (구 /tools/dev/yaml-json 에서 이동, next/dynamic 로 이 탭을 열 때만 로드)
   변환·검증·예시 하위 탭. 계산 로직은 yamlJsonUtils.ts 그대로 (원본과 바이트 동일). */

import { useEffect, useMemo, useState } from 'react'
import s from './yamlJson.module.css'
import {
  EXAMPLES, CATEGORIES, INDENT_OPTIONS,
  type Direction, type IndentId, type CategoryId, type Example,
  detectFormat, yamlToJson, jsonToYaml, validateData,
  buildTreePreview, byteLength, formatBytes, fmtMs, fmtInt,
  downloadFileName, MAX_INPUT_BYTES,
} from './yamlJsonUtils'

type SubTab = 'convert' | 'validate' | 'examples'

const STORAGE_KEY = 'youtil_yaml_json_v1' // 구 yaml-json 도구의 키 그대로 유지 (개명 시 저장값 유실)
const DIRECTIONS: Direction[] = ['auto', 'y2j', 'j2y']

const DEFAULT_INPUT = `# Kubernetes Pod 예시
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
`

interface YamlTabProps {
  /** JSON 칸에 붙여 넣은 YAML — 'YAML처럼 보입니다' 안내에서 넘어올 때만. 저장된 입력보다 우선하고 방향은 YAML→JSON */
  seedInput?: string
  /** seedInput을 입력칸에 넣은 뒤 호출 — 부모가 seed를 비워 다음 탭 전환 때 다시 덮어쓰지 않게 */
  onSeedApplied?: () => void
}

export default function YamlTab({ seedInput, onSeedApplied }: YamlTabProps = {}) {
  const [tab, setTab] = useState<SubTab>('convert')

  /* ═══ 공유 상태 ═══ */
  const [input, setInput] = useState<string>(DEFAULT_INPUT)
  const [direction, setDirection] = useState<Direction>('auto')
  const [indent, setIndent] = useState<IndentId>('2')
  const [jsonCompact, setJsonCompact] = useState<boolean>(false)
  const [sortKeys, setSortKeys] = useState<boolean>(false)

  /* ═══ 검증 탭 (독립 입력) ═══ */
  const [validateInput, setValidateInput] = useState<string>('')

  /* ═══ 예시 라이브러리 ═══ */
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')

  /* ═══ 복사·토스트 ═══ */
  const [copiedKey, setCopiedKey] = useState<string>('')
  const [toast, setToast] = useState<string>('')

  /* localStorage 복원 → JSON 칸에서 넘어온 입력(seedInput)이 있으면 그걸로 덮어쓴다 (마운트 때 한 번) */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const j = raw ? JSON.parse(raw) : null
        if (j && typeof j === 'object') {
          if (typeof j.input === 'string') setInput(j.input)
          if (DIRECTIONS.includes(j.direction)) setDirection(j.direction)
          if (INDENT_OPTIONS.some((o) => o.id === j.indent)) setIndent(j.indent)
          if (typeof j.jsonCompact === 'boolean') setJsonCompact(j.jsonCompact)
          if (typeof j.sortKeys === 'boolean') setSortKeys(j.sortKeys)
          if (typeof j.validateInput === 'string') setValidateInput(j.validateInput)
        }
      } catch {}
    }
    if (seedInput && seedInput.trim()) {
      setTab('convert')
      setDirection('y2j')   // JSON 파싱이 이미 실패한 입력 — 자동 감지 대신 YAML→JSON으로
      onInputChange(seedInput)
      onSeedApplied?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 때 한 번만 (seed는 부모가 곧바로 비운다)
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        input, direction, indent, jsonCompact, sortKeys, validateInput,
      }))
    } catch {}
  }, [input, direction, indent, jsonCompact, sortKeys, validateInput])

  /* ═══ 입력 길이 제한 ═══ */
  const onInputChange = (val: string) => {
    if (byteLength(val) > MAX_INPUT_BYTES) {
      setToast('⚠️ 500KB 초과 — 추가 입력 차단')
      setTimeout(() => setToast(''), 3000)
      let cut = val
      while (byteLength(cut) > MAX_INPUT_BYTES) cut = cut.slice(0, Math.floor(cut.length * 0.95))
      setInput(cut)
    } else {
      setInput(val)
    }
  }

  /* ═══ 자동 감지 + 실제 방향 결정 ═══ */
  const detectedFormat = useMemo(() => detectFormat(input), [input])
  const actualDirection = useMemo<'y2j' | 'j2y' | null>(() => {
    if (direction === 'y2j') return 'y2j'
    if (direction === 'j2y') return 'j2y'
    /* auto */
    if (detectedFormat === 'json') return 'j2y'
    if (detectedFormat === 'yaml') return 'y2j'
    if (detectedFormat === 'ambiguous') return 'j2y'  /* JSON 우선 시도 → 실패하면 YAML로 재시도 */
    return null
  }, [direction, detectedFormat])

  /* ═══ 변환 실행 (디바운스 200ms) ═══ */
  const opts = useMemo(() => ({ indent, jsonCompact, sortKeys }), [indent, jsonCompact, sortKeys])
  const [convertResult, setConvertResult] = useState<ReturnType<typeof yamlToJson> | null>(null)
  /* 실제로 쓰인 방향 — 자동 모드에서 JSON이 실패해 YAML로 재시도하면 y2j */
  const [resolvedDirection, setResolvedDirection] = useState<'y2j' | 'j2y' | null>(null)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (!input.trim() || !actualDirection) {
        setConvertResult(null)
        setResolvedDirection(null)
        return
      }
      if (actualDirection === 'y2j') {
        setConvertResult(yamlToJson(input, opts))
        setResolvedDirection('y2j')
        return
      }
      const r = jsonToYaml(input, opts)
      if (!r.success && direction === 'auto' && detectedFormat === 'ambiguous') {
        /* 모호한 입력만: JSON으로 실패하면 YAML로 한 번 더 (한글 키 YAML 등).
           JSON으로 감지된 입력은 콤마 누락 같은 오류가 YAML로 조용히 다르게 읽히므로 재시도하지 않는다 */
        const y = yamlToJson(input, opts)
        if (y.success) {
          setConvertResult(y)
          setResolvedDirection('y2j')
          return
        }
      }
      setConvertResult(r)
      setResolvedDirection('j2y')
    }, 200)
    return () => clearTimeout(handle)
  }, [input, opts, actualDirection, direction, detectedFormat])

  /* ═══ 검증 결과 ═══ */
  const validation = useMemo(() => {
    if (!validateInput.trim()) return null
    return validateData(validateInput)
  }, [validateInput])

  /* ═══ 복사·다운로드 ═══ */
  const copy = async (key: string, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1500)
    } catch {}
  }

  const download = () => {
    if (!convertResult?.success || !convertResult.result) return
    const ext = resolvedDirection === 'y2j' ? 'json' : 'yaml'
    const blob = new Blob([convertResult.result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFileName(ext)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /* ═══ 예시 적용 ═══ */
  const applyExample = (ex: Example) => {
    setInput(ex.code)
    /* 방향 자동 — 다음 변환 시 detectFormat 결과로 결정됨 */
    setDirection('auto')
    setTab('convert')
  }

  const filteredExamples = useMemo(
    () => filter === 'all' ? EXAMPLES : EXAMPLES.filter((e) => e.category === filter),
    [filter],
  )

  /* ═══ 통계 ═══ */
  const inputBytes = useMemo(() => byteLength(input), [input])

  return (
    <div className={s.wrap}>
      {/* 하위 탭 */}
      <div className={s.subTabs} role="group" aria-label="YAML ↔ JSON 기능">
        <button type="button" className={`${s.subTab} ${tab === 'convert' ? s.subTabActive : ''}`}  aria-pressed={tab === 'convert'}  onClick={() => setTab('convert')}>변환</button>
        <button type="button" className={`${s.subTab} ${tab === 'validate' ? s.subTabActive : ''}`} aria-pressed={tab === 'validate'} onClick={() => setTab('validate')}>검증</button>
        <button type="button" className={`${s.subTab} ${tab === 'examples' ? s.subTabActive : ''}`} aria-pressed={tab === 'examples'} onClick={() => setTab('examples')}>예시 {EXAMPLES.length}</button>
      </div>

      {/* 토스트 */}
      {toast && <div className={s.toast}>{toast}</div>}

      {/* ═════════════ 하위 탭 1: 변환 ═════════════ */}
      {tab === 'convert' && (
        <>
          {/* 옵션 행 */}
          <div className={s.card}>
            <span className={s.cardLabel}>옵션</span>

            <div className={s.optBlock}>
              <span className={s.optTitle}>방향</span>
              <div className={s.optBtnRow}>
                <button className={`${s.optBtn} ${direction === 'auto' ? s.optBtnActive : ''}`} onClick={() => setDirection('auto')}>
                  자동 감지
                </button>
                <button className={`${s.optBtn} ${direction === 'y2j' ? s.optBtnActive : ''}`} onClick={() => setDirection('y2j')}>
                  YAML → JSON
                </button>
                <button className={`${s.optBtn} ${direction === 'j2y' ? s.optBtnActive : ''}`} onClick={() => setDirection('j2y')}>
                  JSON → YAML
                </button>
              </div>
            </div>

            <div className={s.optBlock}>
              <span className={s.optTitle}>들여쓰기</span>
              <div className={s.optBtnRow}>
                {INDENT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`${s.optBtn} ${indent === o.id ? s.optBtnActive : ''}`}
                    onClick={() => setIndent(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.optBlock}>
              <span className={s.optTitle}>JSON 출력</span>
              <div className={s.optBtnRow}>
                <button className={`${s.optBtn} ${!jsonCompact ? s.optBtnActive : ''}`} onClick={() => setJsonCompact(false)}>
                  Pretty (들여쓰기)
                </button>
                <button className={`${s.optBtn} ${jsonCompact ? s.optBtnActive : ''}`} onClick={() => setJsonCompact(true)}>
                  Compact (한 줄)
                </button>
              </div>
            </div>

            <label className={s.checkLabel}>
              <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
              <span>키 알파벳 순 정렬</span>
            </label>
          </div>

          {/* 좌우 분할 입출력 */}
          <div className={s.splitGrid}>
            {/* 입력 */}
            <div className={s.paneCard}>
              <div className={s.paneHeader}>
                <label className={s.paneLabel} htmlFor="yaml-json-input">입력</label>
                <div className={s.paneActions}>
                  <span className={s.paneStat}>{formatBytes(inputBytes)}</span>
                  <button className={s.smBtn} onClick={() => setInput('')} disabled={!input} aria-label="입력 지우기">🗑️</button>
                </div>
              </div>
              <textarea
                id="yaml-json-input"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="YAML 또는 JSON 붙여넣기..."
                className={s.textarea}
                spellCheck={false}
              />
              <p className={s.detectInfo}>
                자동 감지: <strong>{
                  detectedFormat === 'json' ? '🟩 JSON' :
                  detectedFormat === 'yaml' ? '🟦 YAML' :
                  detectedFormat === 'ambiguous' ? '🟧 모호 (JSON 먼저, 실패 시 YAML)' :
                  '⚪ 빈 입력'
                }</strong>
                {(resolvedDirection ?? actualDirection) && <> · 변환: <strong>{(resolvedDirection ?? actualDirection) === 'y2j' ? 'YAML → JSON' : 'JSON → YAML'}</strong></>}
              </p>
            </div>

            {/* 출력 */}
            <div className={s.paneCard}>
              <div className={s.paneHeader}>
                <label className={s.paneLabel} htmlFor="yaml-json-output">
                  결과 {convertResult?.success && resolvedDirection && <span className={s.formatBadge}>{resolvedDirection === 'y2j' ? 'JSON' : 'YAML'}</span>}
                </label>
                <div className={s.paneActions}>
                  {convertResult?.stats && (
                    <span className={s.paneStat}>{fmtMs(convertResult.stats.ms)}</span>
                  )}
                  <button className={s.smBtn} onClick={() => copy('result', convertResult?.result || '')} disabled={!convertResult?.success} aria-label="결과 복사">
                    {copiedKey === 'result' ? '✓' : '📋'}
                  </button>
                  <button className={s.smBtn} onClick={download} disabled={!convertResult?.success} aria-label="파일로 저장">
                    💾
                  </button>
                </div>
              </div>
              <textarea
                id="yaml-json-output"
                value={convertResult?.result ?? ''}
                readOnly
                className={s.textarea}
                placeholder="변환 결과가 여기에 표시됩니다..."
                spellCheck={false}
              />
              {convertResult?.stats && (
                <p className={s.statText}>
                  {fmtInt(convertResult.stats.lines)}줄 · {fmtInt(convertResult.stats.keys)}개 키 · 중첩 깊이 {convertResult.stats.depth}
                </p>
              )}
            </div>
          </div>

          {/* 오류 표시 */}
          {convertResult && !convertResult.success && (
            <div className={s.errorBox} role="status">
              ❌ <strong>변환 오류</strong>: {convertResult.error}
              {convertResult.errorLine && (
                <span className={s.errorPos}> (줄 {convertResult.errorLine}{convertResult.errorCol ? `, 열 ${convertResult.errorCol}` : ''})</span>
              )}
              {direction === 'auto' && detectedFormat === 'json' && (
                <span className={s.errorPos}> — {'{a: 1}'} 같은 YAML flow 스타일이라면 방향에서 YAML → JSON을 선택하세요.</span>
              )}
            </div>
          )}

          {/* 손실 경고 */}
          {convertResult?.warnings && convertResult.warnings.length > 0 && (
            <div className={s.warnBox}>
              <p className={s.warnTitle}>⚠️ 변환 시 손실 정보</p>
              <ul className={s.warnList}>
                {convertResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
              <p className={s.warnNote}>
                원본 보존이 필요한 경우 변환하지 말고 원본 형식 그대로 사용하세요.
              </p>
            </div>
          )}
        </>
      )}

      {/* ═════════════ 하위 탭 2: 검증 ═════════════ */}
      {tab === 'validate' && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel} htmlFor="yaml-json-validate">YAML 또는 JSON 입력</label>
            <textarea
              id="yaml-json-validate"
              value={validateInput}
              onChange={(e) => setValidateInput(e.target.value)}
              placeholder="검증할 YAML 또는 JSON 붙여넣기..."
              className={s.textarea}
              rows={10}
              spellCheck={false}
            />
          </div>

          {validation && (
            <>
              <div className={s.validateCard}>
                <div className={s.validateHeader}>
                  <span className={`${s.formatBadge} ${
                    validation.detectedAs === 'json' ? s.badgeJson :
                    validation.detectedAs === 'yaml' ? s.badgeYaml :
                    validation.detectedAs === 'invalid' ? s.badgeInvalid : s.badgeEmpty
                  }`}>
                    {validation.detectedAs === 'json' ? '🟩 JSON' :
                     validation.detectedAs === 'yaml' ? '🟦 YAML' :
                     validation.detectedAs === 'invalid' ? '🟥 오류' : '⚪ 빈 입력'}
                  </span>
                  <span className={validation.valid ? s.validOk : s.validFail} role="status">
                    {validation.valid ? '✅ 유효' : '❌ 오류'}
                  </span>
                </div>

                {validation.error && (
                  <div className={s.errorBox} style={{ marginTop: 12 }}>
                    {validation.error}
                    {validation.errorLine && (
                      <span className={s.errorPos}> (줄 {validation.errorLine}{validation.errorCol ? `, 열 ${validation.errorCol}` : ''})</span>
                    )}
                  </div>
                )}

                {validation.note && (
                  <p className={s.statText} style={{ marginTop: 10 }}>ℹ️ {validation.note}</p>
                )}

                {validation.valid && validation.stats && (
                  <div className={s.statGrid}>
                    <div><span className={s.statLabel}>줄수</span><strong>{fmtInt(validation.stats.lines)}</strong></div>
                    <div><span className={s.statLabel}>키 수</span><strong>{fmtInt(validation.stats.keys)}</strong></div>
                    <div><span className={s.statLabel}>중첩 깊이</span><strong>{validation.stats.depth}</strong></div>
                    <div><span className={s.statLabel}>문자수</span><strong>{fmtInt(validateInput.length)}</strong></div>
                    <div><span className={s.statLabel}>바이트</span><strong>{formatBytes(byteLength(validateInput))}</strong></div>
                    <div><span className={s.statLabel}>실행</span><strong>{fmtMs(validation.stats.ms)}</strong></div>
                  </div>
                )}
              </div>

              {/* 트리 미리보기 */}
              {validation.valid && validation.data !== undefined && (
                <div className={s.card}>
                  <span className={s.cardLabel}>데이터 구조 (최상위 5개)</span>
                  <div className={s.treeList}>
                    {buildTreePreview(validation.data, 5).map((node, i) => (
                      <div key={i} className={s.treeNode}>
                        <span className={s.treeKey}>{node.key}</span>
                        <span className={s.treeType}>{node.type}</span>
                        <code className={s.treePreview}>{node.preview}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validation.valid && (
                <button className={s.primaryBtn} onClick={() => { setInput(validateInput); setTab('convert') }}>
                  변환 탭으로 보내기
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* ═════════════ 하위 탭 3: 예시 ═════════════ */}
      {tab === 'examples' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>카테고리</span>
            <div className={s.categoryRow}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`${s.categoryBtn} ${filter === c.id ? s.categoryBtnActive : ''}`}
                  onClick={() => setFilter(c.id as CategoryId | 'all')}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.exampleGrid}>
            {filteredExamples.map((ex) => (
              <div key={ex.id} className={s.exampleCard}>
                <div className={s.exampleHeader}>
                  <p className={s.exampleName}>{ex.emoji} {ex.name}</p>
                  <span className={`${s.formatBadge} ${ex.format === 'json' ? s.badgeJson : s.badgeYaml}`}>
                    {ex.format.toUpperCase()}
                  </span>
                </div>
                <p className={s.exampleDesc}>{ex.desc}</p>
                <button className={s.applyBtn} onClick={() => applyExample(ex)}>
                  변환에 적용 →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
