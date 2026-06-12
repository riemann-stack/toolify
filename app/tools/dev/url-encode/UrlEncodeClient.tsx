'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './url-encode.module.css'
import {
  TRACKING_GROUPS,
  type EncodingMode, type EncodeFunc, type SortMode, type QueryParam,
  detectMode, encodeUrl, decodeUrl, analyzeKorean,
  parseUrl, buildUrl, groupTrackingMatches, cleanTrackingParams, findTrackingGroup,
  byteLength, formatBytes, fmtMs, fmtInt,
  MAX_INPUT_BYTES,
} from './urlEncodeUtils'

type Tab = 'encode' | 'parse' | 'clean' | 'guide'

const STORAGE_KEY = 'youtil_url_encode_v1'

const DEFAULT_INPUT_ENCODE = '안녕하세요 한국 & world!'
const DEFAULT_INPUT_PARSE = 'https://search.naver.com/search.naver?query=%ED%95%9C%EA%B5%AD&n_media=ad&utm_source=banner'
const DEFAULT_INPUT_CLEAN = 'https://www.coupang.com/vp/products/12345?_xts_=foo&src=search&utm_source=naver&fbclid=ABC123&n_media=cpc&n_keyword=shopping'

export default function UrlEncodeClient() {
  const [tab, setTab] = useState<Tab>('encode')

  /* ═══ 탭 1: 인코드/디코드 ═══ */
  const [encInput, setEncInput] = useState<string>(DEFAULT_INPUT_ENCODE)
  const [encMode, setEncMode] = useState<EncodingMode>('auto')
  const [encFunc, setEncFunc] = useState<EncodeFunc>('component')
  const [decRepeat, setDecRepeat] = useState<boolean>(true)

  /* ═══ 탭 2: URL 분해 + 쿼리 편집 ═══ */
  const [parseInput, setParseInput] = useState<string>(DEFAULT_INPUT_PARSE)
  const [editParams, setEditParams] = useState<QueryParam[]>([])
  const [showRawValues, setShowRawValues] = useState<boolean>(false)
  const [sortMode, setSortMode] = useState<SortMode>('order')
  const [parseInitialized, setParseInitialized] = useState<boolean>(false)

  /* ═══ 탭 3: 추적 정리 ═══ */
  const [cleanInput, setCleanInput] = useState<string>(DEFAULT_INPUT_CLEAN)
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())

  /* ═══ 복사·토스트 ═══ */
  const [copiedKey, setCopiedKey] = useState<string>('')
  const [toast, setToast] = useState<string>('')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.encInput === 'string') setEncInput(j.encInput)
      if (j.encMode) setEncMode(j.encMode)
      if (j.encFunc) setEncFunc(j.encFunc)
      if (typeof j.decRepeat === 'boolean') setDecRepeat(j.decRepeat)
      if (typeof j.parseInput === 'string') setParseInput(j.parseInput)
      if (typeof j.showRawValues === 'boolean') setShowRawValues(j.showRawValues)
      if (j.sortMode) setSortMode(j.sortMode)
      if (typeof j.cleanInput === 'string') setCleanInput(j.cleanInput)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        encInput, encMode, encFunc, decRepeat,
        parseInput, showRawValues, sortMode,
        cleanInput,
      }))
    } catch {}
  }, [encInput, encMode, encFunc, decRepeat, parseInput, showRawValues, sortMode, cleanInput])

  /* ═══ 입력 길이 제한 ═══ */
  const guardInput = (val: string, setter: (v: string) => void) => {
    if (byteLength(val) > MAX_INPUT_BYTES) {
      setToast('⚠️ 100KB 초과 — 추가 입력 차단')
      setTimeout(() => setToast(''), 3000)
      let cut = val
      while (byteLength(cut) > MAX_INPUT_BYTES) cut = cut.slice(0, Math.floor(cut.length * 0.95))
      setter(cut)
    } else {
      setter(val)
    }
  }

  /* ═══ 탭 1 — 자동 모드 결정 + 결과 ═══ */
  const actualMode = useMemo<'encode' | 'decode'>(() => {
    if (encMode === 'encode') return 'encode'
    if (encMode === 'decode') return 'decode'
    return detectMode(encInput)
  }, [encMode, encInput])

  const encResult = useMemo(() => {
    if (!encInput) return null
    return actualMode === 'encode'
      ? encodeUrl(encInput, encFunc)
      : decodeUrl(encInput, decRepeat)
  }, [encInput, actualMode, encFunc, decRepeat])

  const koreanAnalysis = useMemo(() => analyzeKorean(encInput), [encInput])

  /* ═══ 탭 2 — URL 분해 + 표 편집 ═══ */
  const parsed = useMemo(() => parseUrl(parseInput), [parseInput])

  /* parseInput 변경 시 editParams 초기화 (사용자 편집 보존을 위해 url 기준으로) */
  useEffect(() => {
    if (parsed && !('error' in parsed)) {
      const newParams = parsed.params.map((p) => ({ key: p.key, value: p.value }))
      /* 한 번만 초기화하거나 url이 본질적으로 바뀐 경우만 */
      if (!parseInitialized) {
        setEditParams(newParams)
        setParseInitialized(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseInput])

  /* "URL 다시 분석" 액션 — 사용자 명시적 요청 */
  const reparseUrl = () => {
    if (parsed && !('error' in parsed)) {
      setEditParams(parsed.params.map((p) => ({ key: p.key, value: p.value })))
    }
  }

  const sortedEditParams = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...editParams].sort((a, b) => a.key.localeCompare(b.key))
    }
    return editParams
  }, [editParams, sortMode])

  const rebuiltUrl = useMemo(() => {
    if (!parsed || 'error' in parsed) return ''
    return buildUrl(parsed, editParams)
  }, [parsed, editParams])

  const updateParam = (idx: number, patch: Partial<QueryParam>) => {
    setEditParams((prev) => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))
  }
  const removeParam = (idx: number) => {
    setEditParams((prev) => prev.filter((_, i) => i !== idx))
  }
  const addParam = () => {
    setEditParams((prev) => [...prev, { key: '', value: '' }])
  }

  /* ═══ 탭 3 — 추적 그룹 ═══ */
  const cleanGroups = useMemo(() => groupTrackingMatches(cleanInput), [cleanInput])
  const cleanResult = useMemo(() => cleanTrackingParams(cleanInput, removedKeys), [cleanInput, removedKeys])

  /* cleanInput 변경 시 자동으로 모든 추적 키 선택 */
  useEffect(() => {
    const allKeys = new Set<string>()
    for (const g of cleanGroups) {
      for (const item of g.items) allKeys.add(item.key)
    }
    setRemovedKeys(allKeys)
  }, [cleanInput, cleanGroups])

  const toggleKey = (key: string) => {
    setRemovedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const toggleGroup = (groupId: string) => {
    const groupKeys = cleanGroups.find((g) => g.group.id === groupId)?.items.map((i) => i.key) ?? []
    setRemovedKeys((prev) => {
      const allInGroup = groupKeys.every((k) => prev.has(k))
      const next = new Set(prev)
      if (allInGroup) groupKeys.forEach((k) => next.delete(k))
      else groupKeys.forEach((k) => next.add(k))
      return next
    })
  }

  const removeAll = () => {
    const allKeys = new Set<string>()
    cleanGroups.forEach((g) => g.items.forEach((i) => allKeys.add(i.key)))
    setRemovedKeys(allKeys)
  }
  const restoreAll = () => setRemovedKeys(new Set())

  /* ═══ 복사·다운로드 ═══ */
  const copy = async (key: string, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1500)
    } catch {}
  }

  const download = (text: string, ext: string) => {
    if (!text) return
    const d = new Date()
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `url-${stamp}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'encode' ? s.tabActive : ''}`} onClick={() => setTab('encode')}>🔤 인코드/디코드</button>
        <button className={`${s.tab} ${tab === 'parse' ? s.tabActive : ''}`}  onClick={() => setTab('parse')}>🔗 URL 분해·편집</button>
        <button className={`${s.tab} ${tab === 'clean' ? s.tabActive : ''}`}  onClick={() => setTab('clean')}>🧹 추적 정리</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}  onClick={() => setTab('guide')}>📖 가이드</button>
      </div>

      {toast && <div className={s.toast}>{toast}</div>}

      {/* ═════════════ 탭 1: 인코드/디코드 ═════════════ */}
      {tab === 'encode' && (
        <>
          {/* 옵션 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⚙️ 옵션</span>
            <div className={s.optBlock}>
              <span className={s.optTitle}>모드</span>
              <div className={s.optBtnRow}>
                <button className={`${s.optBtn} ${encMode === 'auto' ? s.optBtnActive : ''}`} onClick={() => setEncMode('auto')}>🤖 자동 감지</button>
                <button className={`${s.optBtn} ${encMode === 'encode' ? s.optBtnActive : ''}`} onClick={() => setEncMode('encode')}>🔒 인코드</button>
                <button className={`${s.optBtn} ${encMode === 'decode' ? s.optBtnActive : ''}`} onClick={() => setEncMode('decode')}>🔓 디코드</button>
              </div>
            </div>

            {actualMode === 'encode' && (
              <div className={s.optBlock}>
                <span className={s.optTitle}>인코드 함수</span>
                <div className={s.optBtnRow}>
                  <button className={`${s.optBtn} ${encFunc === 'component' ? s.optBtnActive : ''}`} onClick={() => setEncFunc('component')}>
                    encodeURIComponent (권장)
                  </button>
                  <button className={`${s.optBtn} ${encFunc === 'uri' ? s.optBtnActive : ''}`} onClick={() => setEncFunc('uri')}>
                    encodeURI (예약 문자 보존)
                  </button>
                </div>
              </div>
            )}

            {actualMode === 'decode' && (
              <label className={s.checkLabel}>
                <input type="checkbox" checked={decRepeat} onChange={(e) => setDecRepeat(e.target.checked)} />
                <span>반복 디코드 (중첩 인코딩 풀기, 최대 5회)</span>
              </label>
            )}
          </div>

          {/* 입력·출력 */}
          <div className={s.splitGrid}>
            <div className={s.paneCard}>
              <div className={s.paneHeader}>
                <span className={s.paneLabel}>📝 입력</span>
                <div className={s.paneActions}>
                  <span className={s.paneStat}>{formatBytes(byteLength(encInput))}</span>
                  <button className={s.smBtn} onClick={() => setEncInput('')} disabled={!encInput}>🗑️</button>
                </div>
              </div>
              <textarea
                value={encInput}
                onChange={(e) => guardInput(e.target.value, setEncInput)}
                placeholder="인코드 또는 디코드할 텍스트 입력..."
                className={s.textarea}
                spellCheck={false}
              />
              <p className={s.detectInfo}>
                자동 감지: <strong>{actualMode === 'encode' ? '🔒 인코드' : '🔓 디코드'}</strong>
              </p>
            </div>

            <div className={s.paneCard}>
              <div className={s.paneHeader}>
                <span className={s.paneLabel}>📤 결과</span>
                <div className={s.paneActions}>
                  {encResult && <span className={s.paneStat}>{fmtMs(encResult.ms)}</span>}
                  <button className={s.smBtn} onClick={() => copy('enc-result', encResult?.result || '')} disabled={!encResult?.result}>
                    {copiedKey === 'enc-result' ? '✓' : '📋'}
                  </button>
                  <button className={s.smBtn} onClick={() => download(encResult?.result || '', 'txt')} disabled={!encResult?.result}>💾</button>
                </div>
              </div>
              <textarea
                value={encResult?.result ?? ''}
                readOnly
                className={s.textarea}
                placeholder="결과가 여기에 표시됩니다..."
                spellCheck={false}
              />
              {encResult && !encResult.error && (
                <p className={s.statText}>
                  결과 {fmtInt((encResult.result || '').length)}자 ·{' '}
                  {actualMode === 'encode' && 'encodedCount' in encResult && `${fmtInt(encResult.encodedCount)}개 인코드됨`}
                  {actualMode === 'decode' && 'iterations' in encResult && `${encResult.iterations}회 디코드`}
                </p>
              )}
            </div>
          </div>

          {/* 오류 */}
          {encResult?.error && (
            <div className={s.errorBox}>
              ❌ <strong>오류</strong>: {encResult.error}
            </div>
          )}

          {/* 한글 분석 */}
          {koreanAnalysis.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>
                🇰🇷 한글·이모지 UTF-8 bytes 분석 ({koreanAnalysis.length}개 글자 · {koreanAnalysis.reduce((a, b) => a + b.bytes.length, 0)} bytes)
              </span>
              <table className={s.koreanTable}>
                <thead>
                  <tr><th scope="col">글자</th><th scope="col">코드포인트</th><th scope="col">UTF-8 bytes</th><th scope="col">URL 인코딩</th></tr>
                </thead>
                <tbody>
                  {koreanAnalysis.slice(0, 50).map((k, i) => (
                    <tr key={i}>
                      <td className={s.koreanChar}>{k.char}</td>
                      <td className={s.mono}>{k.codepoint}</td>
                      <td className={s.mono}>{k.bytes.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}</td>
                      <td className={s.monoAccent}>{k.hexEncoded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {koreanAnalysis.length > 50 && (
                <p className={s.hint}>... 첫 50개만 표시 (전체 {koreanAnalysis.length}개)</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ═════════════ 탭 2: URL 분해 + 쿼리 편집 ═════════════ */}
      {tab === 'parse' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🔗 URL 입력</span>
            <textarea
              value={parseInput}
              onChange={(e) => { guardInput(e.target.value, setParseInput); setParseInitialized(false) }}
              placeholder="https://example.com/path?key=value#fragment"
              className={s.textarea}
              rows={3}
              spellCheck={false}
            />
          </div>

          {parsed && 'error' in parsed && (
            <div className={s.errorBox}>
              ❌ <strong>잘못된 URL</strong>: {parsed.error}
              <p className={s.hint} style={{ marginTop: 6 }}>
                💡 https:// 같은 scheme이 포함된 완전한 URL을 입력하세요.
              </p>
            </div>
          )}

          {parsed && !('error' in parsed) && (
            <>
              {/* 분해 카드 */}
              <div className={s.card}>
                <span className={s.cardLabel}>🧩 URL 구성 요소</span>
                <div className={s.partsGrid}>
                  <PartCard label="scheme" value={parsed.scheme} onCopy={() => copy('p-scheme', parsed.scheme)} copied={copiedKey === 'p-scheme'} />
                  {parsed.user && <PartCard label="user" value={parsed.user} onCopy={() => copy('p-user', parsed.user!)} copied={copiedKey === 'p-user'} />}
                  {parsed.password && <PartCard label="password" value={'•'.repeat(parsed.password.length)} onCopy={() => copy('p-pw', parsed.password!)} copied={copiedKey === 'p-pw'} />}
                  <PartCard label="host" value={parsed.host} onCopy={() => copy('p-host', parsed.host)} copied={copiedKey === 'p-host'} />
                  {parsed.port && <PartCard label="port" value={parsed.port} onCopy={() => copy('p-port', parsed.port!)} copied={copiedKey === 'p-port'} />}
                  <PartCard label="path" value={parsed.path} onCopy={() => copy('p-path', parsed.path)} copied={copiedKey === 'p-path'} />
                  {parsed.rawQuery && <PartCard label="query" value={parsed.query} onCopy={() => copy('p-query', parsed.query)} copied={copiedKey === 'p-query'} />}
                  {parsed.fragment && <PartCard label="fragment" value={parsed.fragment} onCopy={() => copy('p-frag', parsed.fragment!)} copied={copiedKey === 'p-frag'} />}
                </div>
              </div>

              {/* 쿼리 편집 표 */}
              <div className={s.card}>
                <div className={s.cardHeaderFlex}>
                  <span className={s.cardLabel} style={{ marginBottom: 0 }}>📋 쿼리 파라미터 편집 ({editParams.length}개)</span>
                  <div className={s.actionRow}>
                    <button className={s.smBtn} onClick={reparseUrl}>↻ URL 다시 분석</button>
                    <button className={s.smBtn} onClick={addParam}>➕ 추가</button>
                  </div>
                </div>

                <div className={s.optBlock} style={{ marginTop: 12 }}>
                  <div className={s.optBtnRow}>
                    <button className={`${s.optBtn} ${sortMode === 'order' ? s.optBtnActive : ''}`} onClick={() => setSortMode('order')}>입력 순서</button>
                    <button className={`${s.optBtn} ${sortMode === 'alpha' ? s.optBtnActive : ''}`} onClick={() => setSortMode('alpha')}>키 알파벳</button>
                  </div>
                </div>

                <label className={s.checkLabel}>
                  <input type="checkbox" checked={showRawValues} onChange={(e) => setShowRawValues(e.target.checked)} />
                  <span>인코드된 원본(raw) 값 함께 표시</span>
                </label>

                {sortedEditParams.length === 0 ? (
                  <p className={s.emptyText}>파라미터가 없습니다. ➕ 추가 버튼을 눌러 추가하세요.</p>
                ) : (
                  <div className={s.paramList}>
                    {sortedEditParams.map((p) => {
                      const idx = editParams.indexOf(p)
                      const isTracking = !!findTrackingGroup(p.key)
                      return (
                        <div key={idx} className={`${s.paramRow} ${isTracking ? s.paramRowTracking : ''}`}>
                          <input
                            type="text"
                            value={p.key}
                            onChange={(e) => updateParam(idx, { key: e.target.value })}
                            placeholder="key"
                            className={s.paramInput}
                          />
                          <span className={s.paramEq}>=</span>
                          <input
                            type="text"
                            value={p.value}
                            onChange={(e) => updateParam(idx, { value: e.target.value })}
                            placeholder="value"
                            className={s.paramInput}
                          />
                          {isTracking && <span className={s.trackingBadge}>📊 추적</span>}
                          <button className={s.smBtn} onClick={() => removeParam(idx)} title="삭제">🗑️</button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {showRawValues && editParams.length > 0 && (
                  <details className={s.rawDetails}>
                    <summary>인코드된 원본(raw) 값 보기</summary>
                    <div className={s.rawList}>
                      {editParams.map((p, i) => (
                        <div key={i} className={s.rawItem}>
                          <span className={s.rawKey}>{p.key}</span>
                          <code className={s.rawValue}>{encodeURIComponent(p.value)}</code>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              {/* 재구성 결과 */}
              <div className={s.card}>
                <div className={s.cardHeaderFlex}>
                  <span className={s.cardLabel} style={{ marginBottom: 0 }}>🔧 재구성된 URL</span>
                  <div className={s.actionRow}>
                    <button className={s.smBtn} onClick={() => copy('rebuilt', rebuiltUrl)} disabled={!rebuiltUrl}>
                      {copiedKey === 'rebuilt' ? '✓' : '📋'} 복사
                    </button>
                  </div>
                </div>
                <textarea
                  value={rebuiltUrl}
                  readOnly
                  className={s.textarea}
                  rows={3}
                  spellCheck={false}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ═════════════ 탭 3: 추적 정리 ═════════════ */}
      {tab === 'clean' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🔗 URL 입력</span>
            <textarea
              value={cleanInput}
              onChange={(e) => guardInput(e.target.value, setCleanInput)}
              placeholder="추적 파라미터가 포함된 URL을 붙여넣기..."
              className={s.textarea}
              rows={3}
              spellCheck={false}
            />
          </div>

          {cleanResult.error && (
            <div className={s.errorBox}>
              ❌ <strong>잘못된 URL</strong>: {cleanResult.error}
            </div>
          )}

          {cleanGroups.length === 0 && !cleanResult.error && cleanInput.trim() && (
            <div className={s.emptyState}>
              <p>✨ 추적 파라미터가 발견되지 않았습니다 — URL이 이미 깔끔합니다!</p>
            </div>
          )}

          {cleanGroups.length > 0 && (
            <>
              {/* 빠른 액션 */}
              <div className={s.actionRow} style={{ justifyContent: 'flex-end', marginBottom: 0 }}>
                <button className={s.actionBtn} onClick={removeAll}>🗑️ 모든 추적 제거</button>
                <button className={s.actionBtn} onClick={restoreAll}>↩️ 원본 복원</button>
              </div>

              {/* 그룹별 카드 */}
              {cleanGroups.map((g) => {
                const allChecked = g.items.every((i) => removedKeys.has(i.key))
                const someChecked = g.items.some((i) => removedKeys.has(i.key)) && !allChecked
                return (
                  <div key={g.group.id} className={s.trackingCard}>
                    <div className={s.trackingHeader}>
                      <label className={s.checkLabelInline}>
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={(el) => { if (el) el.indeterminate = someChecked }}
                          onChange={() => toggleGroup(g.group.id)}
                        />
                        <span className={s.trackingTitle}>{g.group.emoji} <strong>{g.group.label}</strong> ({g.items.length})</span>
                      </label>
                    </div>
                    <p className={s.trackingDesc}>{g.group.desc}</p>
                    <div className={s.trackingItems}>
                      {g.items.map((item, i) => (
                        <label key={i} className={`${s.trackingItem} ${removedKeys.has(item.key) ? s.trackingItemChecked : ''}`}>
                          <input
                            type="checkbox"
                            checked={removedKeys.has(item.key)}
                            onChange={() => toggleKey(item.key)}
                          />
                          <code className={s.trackingKey}>{item.key}</code>
                          <span className={s.trackingEq}>=</span>
                          <code className={s.trackingValue}>{item.value || '(empty)'}</code>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* 결과 */}
              <div className={s.card}>
                <div className={s.cardHeaderFlex}>
                  <span className={s.cardLabel} style={{ marginBottom: 0 }}>
                    ✨ 정리된 URL
                    {cleanResult.removedCount > 0 && (
                      <span className={s.removedBadge}>{cleanResult.removedCount}개 제거됨</span>
                    )}
                  </span>
                  <div className={s.actionRow}>
                    <button className={s.smBtn} onClick={() => copy('clean-result', cleanResult.cleanUrl)} disabled={!cleanResult.cleanUrl}>
                      {copiedKey === 'clean-result' ? '✓' : '📋'} 복사
                    </button>
                    <button className={s.smBtn} onClick={() => download(cleanResult.cleanUrl, 'txt')} disabled={!cleanResult.cleanUrl}>💾</button>
                  </div>
                </div>
                <textarea
                  value={cleanResult.cleanUrl}
                  readOnly
                  className={s.textarea}
                  rows={4}
                  spellCheck={false}
                />
                {cleanResult.removedParams.length > 0 && (
                  <details className={s.rawDetails}>
                    <summary>제거된 파라미터 {cleanResult.removedParams.length}개 보기</summary>
                    <div className={s.rawList}>
                      {cleanResult.removedParams.map((p, i) => (
                        <div key={i} className={s.rawItem}>
                          <span className={s.rawKey}>{p.key}</span>
                          <code className={s.rawValue}>{p.value}</code>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </>
          )}

          {/* 추적 파라미터 사전 */}
          <div className={s.card}>
            <details>
              <summary className={s.summaryLabel}>📚 추적 파라미터 사전 (50+ 펼치기)</summary>
              <div className={s.dictionaryGrid}>
                {TRACKING_GROUPS.map((g) => (
                  <div key={g.id} className={s.dictItem}>
                    <p className={s.dictTitle}>{g.emoji} <strong>{g.label}</strong></p>
                    <p className={s.dictDesc}>{g.desc}</p>
                    <p className={s.dictKeys}>
                      {g.keys.map((k) => <code key={k} className={s.dictKey}>{k}</code>)}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </>
      )}

      {/* ═════════════ 탭 4: 가이드 ═════════════ */}
      {tab === 'guide' && (
        <>
          {/* encodeURIComponent vs encodeURI */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔧 encodeURIComponent vs encodeURI 비교</span>
            <div className={s.tableWrap}>
              <table className={s.compareTable}>
                <thead>
                  <tr><th scope="col">함수</th><th scope="col">인코드 안 함</th><th scope="col">인코드 함</th><th scope="col">사용처</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code className={s.codeMono}>encodeURIComponent</code></td>
                    <td><code className={s.codeMonoSm}>A-Z a-z 0-9 - _ . ! ~ * &apos; ( )</code></td>
                    <td>모든 특수문자 (<code className={s.codeMonoSm}>: / ? # @ &amp; = +</code>)</td>
                    <td><strong>쿼리 값·경로 세그먼트</strong> (권장)</td>
                  </tr>
                  <tr>
                    <td><code className={s.codeMono}>encodeURI</code></td>
                    <td>+ 예약 문자 (<code className={s.codeMonoSm}>: / ? # [ ] @ ! $ &amp; &apos; ( ) * + , ; =</code>)</td>
                    <td>그 외 (공백·한글 등)</td>
                    <td>전체 URL 인코딩</td>
                  </tr>
                  <tr>
                    <td><code className={s.codeMono}>escape</code></td>
                    <td>영숫자 + <code className={s.codeMonoSm}>@*+-./_</code></td>
                    <td>그 외</td>
                    <td>❌ <strong>사용 금지</strong> (Unicode 부정확)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RFC 3986 안전 문자 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔠 RFC 3986 안전 문자 분류</span>
            <ul className={s.warnList}>
              <li><strong>Unreserved</strong> (인코드 불필요): <code className={s.codeMono}>A-Z a-z 0-9 - _ . ~</code></li>
              <li><strong>Reserved · gen-delims</strong> (URL 구조 구분자): <code className={s.codeMono}>: / ? # [ ] @</code></li>
              <li><strong>Reserved · sub-delims</strong> (서브 구분자): <code className={s.codeMono}>! $ &amp; &apos; ( ) * + , ; =</code></li>
              <li><strong>Percent</strong> <code className={s.codeMono}>%</code> — 인코딩 시작 문자</li>
            </ul>
          </div>

          {/* 한글·이모지 UTF-8 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🇰🇷 한글·이모지 UTF-8 인코딩 원리</span>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85, margin: '0 0 12px' }}>
              ASCII 외 문자(한글·한자·이모지)는 <strong>UTF-8 멀티바이트</strong>로 변환된 후 각 바이트가 <code className={s.codeMono}>%XX</code>로 인코딩됩니다.
            </p>
            <div className={s.tableWrap}>
              <table className={s.compareTable}>
                <thead>
                  <tr><th scope="col">글자</th><th scope="col">코드포인트</th><th scope="col">UTF-8</th><th scope="col">URL 인코딩</th></tr>
                </thead>
                <tbody>
                  <tr><td className={s.koreanChar}>한</td><td className={s.codeMono}>U+D55C</td><td className={s.codeMono}>3 bytes</td><td className={s.monoAccent}>%ED%95%9C</td></tr>
                  <tr><td className={s.koreanChar}>국</td><td className={s.codeMono}>U+AD6D</td><td className={s.codeMono}>3 bytes</td><td className={s.monoAccent}>%EA%B5%AD</td></tr>
                  <tr><td className={s.koreanChar}>안</td><td className={s.codeMono}>U+C548</td><td className={s.codeMono}>3 bytes</td><td className={s.monoAccent}>%EC%95%88</td></tr>
                  <tr><td className={s.koreanChar}>녕</td><td className={s.codeMono}>U+B155</td><td className={s.codeMono}>3 bytes</td><td className={s.monoAccent}>%EB%85%95</td></tr>
                  <tr><td className={s.koreanChar}>😀</td><td className={s.codeMono}>U+1F600</td><td className={s.codeMono}>4 bytes</td><td className={s.monoAccent}>%F0%9F%98%80</td></tr>
                  <tr><td className={s.koreanChar}>韓</td><td className={s.codeMono}>U+97D3</td><td className={s.codeMono}>3 bytes</td><td className={s.monoAccent}>%E9%9F%93</td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.hint}>
              💡 한국어 1글자 = 보통 3 bytes (BMP), 이모지 1글자 = 보통 4 bytes (Supplementary Plane). 따라서 <strong>&quot;한국&quot;이라는 2글자도 URL에서는 12자(%XX %XX %XX %XX %XX %XX) 차지</strong>합니다.
            </p>
          </div>

          {/* 흔한 실수 */}
          <div className={s.warnBoxSolid}>
            <p className={s.warnTitle}>🚨 흔한 실수 5가지</p>
            <ol className={s.numList}>
              <li><strong>이중 인코딩</strong> — 이미 인코딩된 값을 또 인코딩 → <code className={s.codeMono}>%2520</code> (원래는 공백 = <code className={s.codeMono}>%20</code>)</li>
              <li><strong>encodeURIComponent vs encodeURI 잘못 사용</strong> — 쿼리 값엔 무조건 <code className={s.codeMono}>encodeURIComponent</code>, 전체 URL엔 <code className={s.codeMono}>encodeURI</code></li>
              <li><strong>옛날 escape() 사용</strong> — Unicode 부정확, deprecated. 쓰지 마세요</li>
              <li><strong>% 단독 입력</strong> — <code className={s.codeMono}>%</code> 다음에 16진수 2자리 필수 (<code className={s.codeMono}>%XX</code>)</li>
              <li><strong>+ 기호 혼동</strong> — application/x-www-form-urlencoded 폼 인코딩에서만 <code className={s.codeMono}>+</code>가 공백, RFC 3986 표준은 <code className={s.codeMono}>%20</code></li>
            </ol>
          </div>

          {/* 추적 파라미터 사전 (가이드 탭에도 펼침) */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 추적 파라미터 사전 (50+)</span>
            <div className={s.dictionaryGrid}>
              {TRACKING_GROUPS.map((g) => (
                <div key={g.id} className={s.dictItem}>
                  <p className={s.dictTitle}>{g.emoji} <strong>{g.label}</strong></p>
                  <p className={s.dictDesc}>{g.desc}</p>
                  <p className={s.dictKeys}>
                    {g.keys.map((k) => <code key={k} className={s.dictKey}>{k}</code>)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════
   서브 컴포넌트
   ═════════════════════════════════════════════ */
function PartCard({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className={s.partCard}>
      <div className={s.partHeader}>
        <span className={s.partLabel}>{label}</span>
        <button className={s.smBtn} onClick={onCopy}>{copied ? '✓' : '📋'}</button>
      </div>
      <code className={s.partValue}>{value || '(empty)'}</code>
    </div>
  )
}
