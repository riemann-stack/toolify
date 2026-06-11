/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './curl.module.css'
import {
  EXAMPLES, CATEGORIES, METHOD_COLORS, LANG_META,
  type LangId, type CategoryId, type GenOpts, type ParsedCurl,
  parseCurl, generateCode, prettyJson, byteLength, formatBytes, fmtInt,
  maskValue,
  MAX_INPUT_BYTES,
} from './curlUtils'

type Tab = 'convert' | 'analyze' | 'examples' | 'guide'

const STORAGE_KEY = 'youtil_curl_v1'

const DEFAULT_INPUT = `curl -X POST 'https://api.example.com/users' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{"name": "홍길동", "email": "test@example.com"}'`

export default function CurlClient() {
  const [tab, setTab] = useState<Tab>('convert')

  /* ═══ 공유 상태 ═══ */
  const [input, setInput] = useState<string>(DEFAULT_INPUT)
  const [opts, setOpts] = useState<GenOpts>({
    async: true,
    tryCatch: false,
    maskSensitive: false,
  })

  /* ═══ 예시 카테고리 ═══ */
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
      if (j.opts) setOpts({
        async: j.opts.async ?? true,
        tryCatch: !!j.opts.tryCatch,
        maskSensitive: !!j.opts.maskSensitive,
      })
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, opts }))
    } catch {}
  }, [input, opts])

  /* 입력 길이 제한 */
  const onInputChange = (val: string) => {
    if (byteLength(val) > MAX_INPUT_BYTES) {
      setToast('⚠️ 50KB 초과 — 추가 입력 차단')
      setTimeout(() => setToast(''), 3000)
      let cut = val
      while (byteLength(cut) > MAX_INPUT_BYTES) cut = cut.slice(0, Math.floor(cut.length * 0.95))
      setInput(cut)
    } else {
      setInput(val)
    }
  }

  /* 파싱 */
  const parseResult = useMemo(() => parseCurl(input), [input])
  const parsed: ParsedCurl | null = parseResult && !('error' in parseResult) ? parseResult : null
  const parseErr = parseResult && 'error' in parseResult ? parseResult : null

  /* 5 언어 코드 */
  const codes = useMemo(() => {
    if (!parsed) return null
    const result: Record<LangId, string> = { fetch: '', axios: '', python: '', node: '', go: '' }
    for (const lang of LANG_META) {
      try {
        result[lang.id] = generateCode(lang.id, parsed, opts)
      } catch (e) {
        result[lang.id] = `// 코드 생성 오류: ${e instanceof Error ? e.message : 'unknown'}`
      }
    }
    return result
  }, [parsed, opts])

  /* 복사 */
  const copy = async (key: string, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1500)
    } catch {}
  }

  /* 예시 적용 */
  const applyExample = (cmd: string) => {
    setInput(cmd)
    setTab('convert')
  }

  const filteredExamples = useMemo(
    () => filter === 'all' ? EXAMPLES : EXAMPLES.filter((e) => e.category === filter),
    [filter],
  )

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'convert' ? s.tabActive : ''}`}  onClick={() => setTab('convert')}>🔄 변환</button>
        <button className={`${s.tab} ${tab === 'analyze' ? s.tabActive : ''}`}  onClick={() => setTab('analyze')}>📦 요청 구조</button>
        <button className={`${s.tab} ${tab === 'examples' ? s.tabActive : ''}`} onClick={() => setTab('examples')}>📚 예시</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}    onClick={() => setTab('guide')}>📖 가이드</button>
      </div>

      {toast && <div className={s.toast}>{toast}</div>}

      {/* ═════════════ 공통: cURL input + 옵션 ═════════════ */}
      {(tab === 'convert' || tab === 'analyze') && (
        <>
          <div className={s.card}>
            <div className={s.cardHeaderFlex}>
              <span className={s.cardLabel} style={{ marginBottom: 0 }}>
                🌀 cURL 명령 입력 ({formatBytes(byteLength(input))})
              </span>
              <button className={s.smBtn} onClick={() => setInput('')} disabled={!input}>🗑️ 비우기</button>
            </div>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="curl -X POST 'https://api.example.com' -H 'Authorization: Bearer TOKEN' -d '{...}'"
              className={s.inputArea}
              spellCheck={false}
            />
            {parseErr && (
              <div className={s.errorBox}>
                ❌ <strong>파싱 오류</strong>: {parseErr.error}
                {parseErr.suggestions && (
                  <ul className={s.errorSuggestions}>
                    {parseErr.suggestions.map((sg, i) => <li key={i}>💡 {sg}</li>)}
                  </ul>
                )}
              </div>
            )}
            {parsed && parsed.unsupportedFlags.length > 0 && (
              <div className={s.warnBox}>
                <strong>⚠️ 미지원 옵션</strong>: {parsed.unsupportedFlags.join(', ')} —
                생성 코드에 반영되지 않습니다. 가이드 탭 참고.
              </div>
            )}
            {parsed && parsed.warnings.length > 0 && (
              <div className={s.warnBox}>
                {parsed.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
              </div>
            )}
            {parsed && (
              <div className={s.summaryRow}>
                <span className={s.methodBadge} style={{ background: METHOD_COLORS[parsed.method] + '20', color: METHOD_COLORS[parsed.method], borderColor: METHOD_COLORS[parsed.method] }}>
                  {parsed.method}
                </span>
                <code className={s.summaryUrl}>{parsed.url.length > 60 ? parsed.url.slice(0, 60) + '...' : parsed.url}</code>
                <span className={s.summaryStat}>헤더 {parsed.headers.length}</span>
                {parsed.bodyType && <span className={s.summaryStat}>body: {parsed.bodyType}</span>}
                {parsed.auth && <span className={s.summaryStat}>🔐 Basic Auth</span>}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═════════════ 탭 1: 변환 ═════════════ */}
      {tab === 'convert' && (
        <>
          {/* 출력 옵션 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⚙️ 출력 옵션</span>
            <div className={s.optBlock}>
              <span className={s.optTitle}>비동기 스타일 (JS)</span>
              <div className={s.optBtnRow}>
                <button className={`${s.optBtn} ${opts.async ? s.optBtnActive : ''}`} onClick={() => setOpts((o) => ({ ...o, async: true }))}>async / await</button>
                <button className={`${s.optBtn} ${!opts.async ? s.optBtnActive : ''}`} onClick={() => setOpts((o) => ({ ...o, async: false }))}>Promise then</button>
              </div>
            </div>
            <label className={s.checkLabel}>
              <input type="checkbox" checked={opts.tryCatch} onChange={(e) => setOpts((o) => ({ ...o, tryCatch: e.target.checked }))} />
              <span>try/catch (오류 처리) 포함</span>
            </label>
            <label className={s.checkLabel}>
              <input type="checkbox" checked={opts.maskSensitive} onChange={(e) => setOpts((o) => ({ ...o, maskSensitive: e.target.checked }))} />
              <span>민감 헤더 마스킹 (Authorization·Cookie·X-API-Key → ***)</span>
            </label>
          </div>

          {/* 5 언어 코드 카드 */}
          {codes && parsed && (
            <>
              {LANG_META.map((lang) => (
                <div key={lang.id} className={s.codeCard}>
                  <div className={s.codeHeader}>
                    <span className={s.codeLang}>{lang.emoji} <strong>{lang.name}</strong></span>
                    <button className={s.smBtn} onClick={() => copy(lang.id, codes[lang.id])}>
                      {copiedKey === lang.id ? '✓ 복사됨' : '📋 복사'}
                    </button>
                  </div>
                  <pre className={s.codeBlock}>{codes[lang.id]}</pre>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ═════════════ 탭 2: 요청 구조 분석 ═════════════ */}
      {tab === 'analyze' && parsed && (
        <>
          {/* METHOD 큰 배지 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🌐 HTTP 요청 구조</span>
            <div className={s.methodBig} style={{ background: METHOD_COLORS[parsed.method] + '20', color: METHOD_COLORS[parsed.method], borderColor: METHOD_COLORS[parsed.method] }}>
              {parsed.method}
            </div>
          </div>

          {/* URL */}
          <div className={s.card}>
            <div className={s.cardHeaderFlex}>
              <span className={s.cardLabel} style={{ marginBottom: 0 }}>🔗 URL</span>
              <button className={s.smBtn} onClick={() => copy('url', parsed.url)}>{copiedKey === 'url' ? '✓' : '📋'}</button>
            </div>
            <code className={s.urlBlock}>{parsed.url}</code>
            <div className={s.urlParts}>
              <span className={s.urlPartLabel}>Base:</span> <code className={s.urlPartCode}>{parsed.urlBase}</code>
            </div>
          </div>

          {/* Query Parameters */}
          {parsed.queryParams.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>🔎 Query Parameters ({parsed.queryParams.length})</span>
              <table className={s.kvTable}>
                <thead>
                  <tr><th>key</th><th>value</th></tr>
                </thead>
                <tbody>
                  {parsed.queryParams.map((q, i) => (
                    <tr key={i}>
                      <td className={s.kvKey}>{q.key}</td>
                      <td className={s.kvValue}>{q.value || <span className={s.muted}>(empty)</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Headers */}
          {parsed.headers.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>📋 Headers ({parsed.headers.length})</span>
              <table className={s.kvTable}>
                <thead>
                  <tr><th>key</th><th>value</th></tr>
                </thead>
                <tbody>
                  {parsed.headers.map((h, i) => (
                    <tr key={i} className={h.sensitive ? s.rowSensitive : ''}>
                      <td className={s.kvKey}>
                        {h.key}
                        {h.sensitive && <span className={s.sensitiveBadge}>⚠️ 민감</span>}
                      </td>
                      <td className={s.kvValue}>
                        <code>{opts.maskSensitive && h.sensitive ? maskValue(h.value) : h.value}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <label className={s.checkLabel}>
                <input type="checkbox" checked={opts.maskSensitive} onChange={(e) => setOpts((o) => ({ ...o, maskSensitive: e.target.checked }))} />
                <span>민감 값 마스킹 (Authorization·Cookie 등)</span>
              </label>
            </div>
          )}

          {/* Auth */}
          {parsed.auth && (
            <div className={s.card}>
              <span className={s.cardLabel}>🔐 Basic Auth</span>
              <div className={s.authGrid}>
                <div><span className={s.optLabel}>user</span> <code>{opts.maskSensitive ? maskValue(parsed.auth.user) : parsed.auth.user}</code></div>
                <div><span className={s.optLabel}>password</span> <code>{opts.maskSensitive ? '***' : parsed.auth.password}</code></div>
              </div>
            </div>
          )}

          {/* Cookies */}
          {parsed.cookies.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>🍪 Cookies ({parsed.cookies.length})</span>
              <table className={s.kvTable}>
                <thead><tr><th>name</th><th>value</th></tr></thead>
                <tbody>
                  {parsed.cookies.map((c, i) => (
                    <tr key={i}>
                      <td className={s.kvKey}>{c.key}</td>
                      <td className={s.kvValue}><code>{opts.maskSensitive ? maskValue(c.value) : c.value}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Body */}
          {parsed.bodyType && (
            <div className={s.card}>
              <div className={s.cardHeaderFlex}>
                <span className={s.cardLabel} style={{ marginBottom: 0 }}>
                  📤 Body — {parsed.bodyType.toUpperCase()}
                </span>
                <button className={s.smBtn} onClick={() => copy('body', parsed.rawBody)}>{copiedKey === 'body' ? '✓' : '📋'}</button>
              </div>
              {parsed.bodyType === 'json' && parsed.bodyParsed !== undefined && (
                <pre className={s.codeBlock}>{prettyJson(JSON.stringify(parsed.bodyParsed))}</pre>
              )}
              {parsed.bodyType === 'urlencode' && parsed.bodyForm && (
                <table className={s.kvTable}>
                  <thead><tr><th>name</th><th>value</th></tr></thead>
                  <tbody>
                    {parsed.bodyForm.map((f, i) => (
                      <tr key={i}><td className={s.kvKey}>{f.key}</td><td className={s.kvValue}><code>{f.value}</code></td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              {parsed.bodyType === 'multipart' && parsed.bodyMultipart && (
                <table className={s.kvTable}>
                  <thead><tr><th>name</th><th>type</th><th>value/path</th></tr></thead>
                  <tbody>
                    {parsed.bodyMultipart.map((m, i) => (
                      <tr key={i}>
                        <td className={s.kvKey}>{m.name}</td>
                        <td>{m.isFile ? '📎 file' : 'text'}</td>
                        <td className={s.kvValue}><code>{m.isFile ? m.filePath : m.value}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {parsed.bodyType === 'raw' && (
                <pre className={s.codeBlock}>{parsed.rawBody}</pre>
              )}
            </div>
          )}

          {/* 옵션 표시 */}
          {(parsed.flags.insecure || parsed.flags.followRedirects || parsed.flags.compressed || parsed.flags.get || parsed.flags.verbose) && (
            <div className={s.card}>
              <span className={s.cardLabel}>⚙️ 추가 옵션</span>
              <div className={s.flagList}>
                {parsed.flags.insecure && <span className={s.flagPill}>🔓 -k --insecure (SSL 검증 비활성)</span>}
                {parsed.flags.followRedirects && <span className={s.flagPill}>↪️ -L --location (리다이렉트 따라가기)</span>}
                {parsed.flags.compressed && <span className={s.flagPill}>📦 --compressed (gzip 응답)</span>}
                {parsed.flags.get && <span className={s.flagPill}>🔍 -G --get (data → query)</span>}
                {parsed.flags.verbose && <span className={s.flagPill}>📢 -v --verbose (자세한 로그)</span>}
              </div>
            </div>
          )}

          {/* 통계 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 통계</span>
            <div className={s.statGrid}>
              <div><span className={s.statLabel}>METHOD</span><strong>{parsed.method}</strong></div>
              <div><span className={s.statLabel}>헤더</span><strong>{fmtInt(parsed.headers.length)}</strong></div>
              <div><span className={s.statLabel}>쿼리</span><strong>{fmtInt(parsed.queryParams.length)}</strong></div>
              <div><span className={s.statLabel}>쿠키</span><strong>{fmtInt(parsed.cookies.length)}</strong></div>
              <div><span className={s.statLabel}>Body</span><strong>{parsed.bodyType ?? '없음'}</strong></div>
              <div><span className={s.statLabel}>Body 크기</span><strong>{formatBytes(byteLength(parsed.rawBody))}</strong></div>
            </div>
          </div>
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
                <p className={s.exampleName}>{ex.emoji} {ex.name}</p>
                <p className={s.exampleDesc}>{ex.desc}</p>
                <pre className={s.examplePreview}>{ex.command.length > 200 ? ex.command.slice(0, 200) + '...' : ex.command}</pre>
                <button className={s.applyBtn} onClick={() => applyExample(ex.command)}>
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
          {/* cURL 옵션 치트시트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📖 cURL 옵션 치트시트 (15+)</span>
            <div className={s.tableWrap}>
              <table className={s.guideTable}>
                <thead>
                  <tr><th>옵션</th><th>긴 형식</th><th>의미</th><th>예시</th></tr>
                </thead>
                <tbody>
                  {[
                    ['-X', '--request', 'HTTP 메서드', '-X POST'],
                    ['-H', '--header', '헤더', '-H "Authorization: Bearer XXX"'],
                    ['-d', '--data', '본문 (POST 자동)', "-d '{\"name\":\"foo\"}'"],
                    ['', '--data-raw', '본문 (@ 처리 X)', "--data-raw '@hello'"],
                    ['', '--data-urlencode', 'URL 인코드 본문', '--data-urlencode "q=한국"'],
                    ['-F', '--form', 'multipart 폼', '-F "file=@photo.jpg"'],
                    ['-u', '--user', 'Basic Auth', '-u "user:pass"'],
                    ['-b', '--cookie', '쿠키', '-b "name=value"'],
                    ['-A', '--user-agent', 'User-Agent', '-A "Mozilla/5.0"'],
                    ['-e', '--referer', 'Referer', '-e "https://google.com"'],
                    ['-G', '--get', 'data → query (GET)', '-G -d "q=foo"'],
                    ['-k', '--insecure', 'SSL 검증 X', '-k'],
                    ['-L', '--location', '리다이렉트 따라가기', '-L'],
                    ['', '--compressed', 'gzip 응답 받기', '--compressed'],
                    ['-v', '--verbose', '자세한 로그', '-v'],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td><code className={s.codeMono}>{row[0]}</code></td>
                      <td><code className={s.codeMono}>{row[1]}</code></td>
                      <td>{row[2]}</td>
                      <td><code className={s.codeMonoSm}>{row[3]}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5 언어 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🆚 5 언어 차이 비교</span>
            <div className={s.tableWrap}>
              <table className={s.guideTable}>
                <thead>
                  <tr><th>항목</th><th>fetch</th><th>axios</th><th>Python requests</th><th>Node http</th><th>Go</th></tr>
                </thead>
                <tbody>
                  {[
                    ['비동기', 'Promise/await', 'Promise/await', 'sync (default)', 'callback/Promise', 'sync (goroutine)'],
                    ['JSON 자동', '수동 .json()', '자동 (data)', '자동 (json=)', '수동', '수동'],
                    ['헤더', 'Headers/object', 'object', 'dict', 'object', 'http.Header'],
                    ['Basic Auth', '헤더 직접', 'auth: 옵션', 'auth=()', '헤더', 'SetBasicAuth'],
                    ['Form data', 'FormData/URLSearchParams', 'FormData', 'data=', 'querystring', 'url.Values'],
                    ['의존성', '내장 (Node 18+)', 'npm i axios', 'pip install requests', '내장', '내장'],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td><strong>{row[0]}</strong></td>
                      {row.slice(1).map((c, j) => <td key={j} style={{ fontSize: 12 }}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 미지원 옵션 */}
          <div className={s.warnBoxSolid}>
            <p className={s.warnTitle}>⚠️ 미지원 옵션 (생성 코드에 반영 X)</p>
            <ul className={s.warnList}>
              <li><code className={s.codeMono}>@filename</code> 파일 업로드 — multipart <code className={s.codeMono}>-F file=@photo.jpg</code>는 지원하지만 <code className={s.codeMono}>-d @body.txt</code>는 X</li>
              <li><code className={s.codeMono}>--cert</code> / <code className={s.codeMono}>--key</code> — TLS 클라이언트 인증서</li>
              <li><code className={s.codeMono}>--proxy</code> — 프록시 설정</li>
              <li><code className={s.codeMono}>-o</code> / <code className={s.codeMono}>-O</code> — 파일 출력</li>
              <li><code className={s.codeMono}>-T</code> — 업로드</li>
              <li><code className={s.codeMono}>-r</code> / <code className={s.codeMono}>--range</code> — 범위 다운로드</li>
              <li><code className={s.codeMono}>--resolve</code> — DNS 오버라이드</li>
            </ul>
            <p className={s.warnNote}>
              위 옵션이 cURL에 있으면 파싱 시 <strong>오렌지 박스로 명시</strong>되며, 생성된 코드에는 반영되지 않습니다. 수동 처리 필요.
            </p>
          </div>

          {/* 보안 주의 */}
          <div className={s.dangerBoxSolid}>
            <p className={s.dangerTitle}>🚨 보안 주의</p>
            <ul className={s.warnList}>
              <li><strong>Authorization · Cookie · X-API-Key 등 민감 헤더는 외부 전송·공유 금지</strong></li>
              <li>본 도구는 모두 브라우저에서 처리 — <strong>외부 전송 0</strong>, Network 탭으로 확인 가능</li>
              <li>공용 PC 사용 후 <strong>localStorage 정리</strong> 권장 (DevTools → Application → Local Storage)</li>
              <li>코드 복사 후 토큰을 <strong>환경 변수</strong>(.env, GitHub Secrets, AWS Secrets Manager)로 옮기세요</li>
              <li>본 도구의 <strong>마스킹 옵션</strong>을 활성화하면 코드에서 토큰이 *** 으로 출력됩니다 (실제 값은 직접 추가)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
