/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './yaml-json.module.css'
import {
  EXAMPLES, CATEGORIES, INDENT_OPTIONS,
  type Direction, type IndentId, type CategoryId, type Example,
  detectFormat, yamlToJson, jsonToYaml, validateData,
  buildTreePreview, byteLength, formatBytes, fmtMs, fmtInt,
  downloadFileName, MAX_INPUT_BYTES,
} from './yamlJsonUtils'

type Tab = 'convert' | 'validate' | 'examples' | 'guide'

const STORAGE_KEY = 'youtil_yaml_json_v1'

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

export default function YamlJsonClient() {
  const [tab, setTab] = useState<Tab>('convert')

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

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.input === 'string') setInput(j.input)
      if (j.direction) setDirection(j.direction)
      if (j.indent) setIndent(j.indent)
      if (typeof j.jsonCompact === 'boolean') setJsonCompact(j.jsonCompact)
      if (typeof j.sortKeys === 'boolean') setSortKeys(j.sortKeys)
      if (typeof j.validateInput === 'string') setValidateInput(j.validateInput)
    } catch {}
  }, [])
  useEffect(() => {
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
    if (detectedFormat === 'ambiguous') return 'j2y'  /* JSON 우선 시도 */
    return null
  }, [direction, detectedFormat])

  /* ═══ 변환 실행 (디바운스 200ms) ═══ */
  const opts = useMemo(() => ({ indent, jsonCompact, sortKeys }), [indent, jsonCompact, sortKeys])
  const [convertResult, setConvertResult] = useState<ReturnType<typeof yamlToJson> | null>(null)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (!input.trim() || !actualDirection) {
        setConvertResult(null)
        return
      }
      const r = actualDirection === 'y2j' ? yamlToJson(input, opts) : jsonToYaml(input, opts)
      setConvertResult(r)
    }, 200)
    return () => clearTimeout(handle)
  }, [input, opts, actualDirection])

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
    const ext = actualDirection === 'y2j' ? 'json' : 'yaml'
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
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'convert' ? s.tabActive : ''}`}  onClick={() => setTab('convert')}>🔄 변환</button>
        <button className={`${s.tab} ${tab === 'validate' ? s.tabActive : ''}`} onClick={() => setTab('validate')}>✅ 검증</button>
        <button className={`${s.tab} ${tab === 'examples' ? s.tabActive : ''}`} onClick={() => setTab('examples')}>📚 예시</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}    onClick={() => setTab('guide')}>📖 가이드</button>
      </div>

      {/* 토스트 */}
      {toast && <div className={s.toast}>{toast}</div>}

      {/* ═════════════ 탭 1: 변환 ═════════════ */}
      {tab === 'convert' && (
        <>
          {/* 옵션 행 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⚙️ 옵션</span>

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
                <span className={s.paneLabel}>📝 입력</span>
                <div className={s.paneActions}>
                  <span className={s.paneStat}>{formatBytes(inputBytes)}</span>
                  <button className={s.smBtn} onClick={() => setInput('')} disabled={!input}>🗑️</button>
                </div>
              </div>
              <textarea
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
                  detectedFormat === 'ambiguous' ? '🟧 모호 (JSON 우선)' :
                  '⚪ 빈 입력'
                }</strong>
                {actualDirection && <> · 변환: <strong>{actualDirection === 'y2j' ? 'YAML → JSON' : 'JSON → YAML'}</strong></>}
              </p>
            </div>

            {/* 출력 */}
            <div className={s.paneCard}>
              <div className={s.paneHeader}>
                <span className={s.paneLabel}>
                  📤 결과 {convertResult?.success && actualDirection && <span className={s.formatBadge}>{actualDirection === 'y2j' ? 'JSON' : 'YAML'}</span>}
                </span>
                <div className={s.paneActions}>
                  {convertResult?.stats && (
                    <span className={s.paneStat}>{fmtMs(convertResult.stats.ms)}</span>
                  )}
                  <button className={s.smBtn} onClick={() => copy('result', convertResult?.result || '')} disabled={!convertResult?.success}>
                    {copiedKey === 'result' ? '✓' : '📋'}
                  </button>
                  <button className={s.smBtn} onClick={download} disabled={!convertResult?.success}>
                    💾
                  </button>
                </div>
              </div>
              <textarea
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
            <div className={s.errorBox}>
              ❌ <strong>변환 오류</strong>: {convertResult.error}
              {convertResult.errorLine && (
                <span className={s.errorPos}> (줄 {convertResult.errorLine}{convertResult.errorCol ? `, 열 ${convertResult.errorCol}` : ''})</span>
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

      {/* ═════════════ 탭 2: 검증 ═════════════ */}
      {tab === 'validate' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📝 YAML 또는 JSON 입력</span>
            <textarea
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
                  <span className={validation.valid ? s.validOk : s.validFail}>
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
                  <span className={s.cardLabel}>🌳 데이터 구조 (최상위 5개)</span>
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
                  🔄 변환 탭으로 보내기
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* ═════════════ 탭 3: 예시 ═════════════ */}
      {tab === 'examples' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📂 카테고리</span>
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
                  탭 1에 적용 →
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═════════════ 탭 4: 가이드 ═════════════ */}
      {tab === 'guide' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📊 YAML vs JSON 차이</span>
            <table className={s.compareTable}>
              <thead>
                <tr><th>항목</th><th>YAML</th><th>JSON</th></tr>
              </thead>
              <tbody>
                {[
                  ['주석', '# 지원', '미지원'],
                  ['들여쓰기', '의미 있음 (필수)', '무의미 (가독성용)'],
                  ['따옴표', '선택적', '문자열 필수 (")'],
                  ['키', '"" 없이 가능', '반드시 ""'],
                  ['마지막 콤마', '없음', '금지'],
                  ['데이터 타입', '자동 추론 (1.1 함정)', '명시적'],
                  ['멀티 도큐먼트', '--- 구분 가능', '1 도큐먼트만'],
                  ['앵커/별칭', '지원 (& *)', '미지원'],
                  ['인간 가독성', '↑↑', '↑'],
                  ['파일 크기', '작음', '약간 큼'],
                  ['스펙 복잡도', '높음', '단순'],
                  ['주 사용처', 'DevOps·CI·설정 파일', 'API·웹 데이터 교환'],
                ].map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row[0]}</strong></td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 흔한 YAML 오류 */}
          <div className={s.warnBoxSolid}>
            <p className={s.warnTitle}>🚨 흔한 YAML 오류 5가지</p>
            <ol className={s.numList}>
              <li><strong>탭 문자 사용</strong> — YAML은 공백만 허용 (탭 → 파싱 오류). 에디터에서 &quot;탭 → 공백 2/4&quot; 자동 변환 설정</li>
              <li><strong>콜론 뒤 공백 누락</strong> — <code className={s.codeMono}>key:value</code> ❌ → <code className={s.codeMono}>key: value</code> ✅</li>
              <li><strong>들여쓰기 불일치</strong> — 같은 레벨에서 2/4 spaces 혼용 금지. 한 파일 내 통일</li>
              <li><strong>특수문자 escape</strong> — <code className={s.codeMono}>{`\\${'$'}{}`}</code>·콜론 포함 시 따옴표로 감싸기 (<code className={s.codeMono}>{`url: "https://api.com"`}</code>)</li>
              <li><strong>중복 키</strong> — 같은 레벨 같은 키 → 마지막 값으로 덮어쓰기 (오류 아님, 디버깅 어려움)</li>
            </ol>
          </div>

          {/* 변환 시 주의사항 */}
          <div className={s.warnBoxSolid}>
            <p className={s.warnTitle}>⚠️ YAML → JSON 변환 시 손실되는 정보</p>
            <ul className={s.warnList}>
              <li><strong>주석 (#)</strong> — JSON은 주석 미지원, 변환 시 삭제됨 (역변환으로 복원 불가)</li>
              <li><strong>앵커 (&) / 별칭 (*)</strong> — 펼쳐져 데이터 중복으로 변환됨 (참조 관계 손실)</li>
              <li><strong>멀티 도큐먼트 (---)</strong> — JSON 배열로 통합 변환 (구분 정보 손실)</li>
              <li><strong>YAML 1.1 자동 타입 추론</strong> — yes/no가 boolean, 8자리 숫자가 8진수로 해석 (본 도구는 JSON_SCHEMA로 엄격 처리)</li>
              <li><strong>!!tag (커스텀 태그)</strong> — 라이브러리별 동작 다름, !!python/object 등은 표준 X</li>
              <li><strong>날짜·정규식 등 특수 타입</strong> — JSON에 없는 타입은 문자열로 변환</li>
            </ul>
          </div>

          {/* 한국 시나리오 */}
          <div className={s.tipBox}>
            <p className={s.tipTitle}>💡 한국 개발자 자주 쓰는 변환 시나리오</p>
            <ul className={s.warnList}>
              <li><strong>Spring application.yml → JSON</strong> — 외부 시스템 연동·설정 백업</li>
              <li><strong>K8s YAML → JSON</strong> — kubectl create/apply 일부 명령에 JSON 사용 가능</li>
              <li><strong>GitHub Actions YAML 검증</strong> — 워크플로 디버깅, 들여쓰기 오류 사전 발견</li>
              <li><strong>OpenAPI YAML → JSON</strong> — 일부 SDK 생성 도구는 JSON만 지원</li>
              <li><strong>Helm values.yaml → JSON</strong> — 외부 시크릿 매니저(Vault·AWS Secrets) 연동</li>
              <li><strong>Docker Compose 검증</strong> — 멀티 서비스 정의 들여쓰기 확인</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
