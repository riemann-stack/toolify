'use client'

import { useMemo, useRef, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// 인코딩 함수
// ─────────────────────────────────────────────
function strToB64(text: string, urlSafe = false): string {
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)))
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded
  } catch {
    return ''
  }
}
function b64ToStr(b64: string, urlSafe = false): string | null {
  try {
    let cleaned = b64.trim().replace(/\s/g, '')
    if (urlSafe) cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    while (cleaned.length % 4 !== 0) cleaned += '='
    return decodeURIComponent(escape(atob(cleaned)))
  } catch {
    return null
  }
}
function strToHex(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}
function hexToStr(hex: string): string | null {
  try {
    const cleaned = hex.replace(/[\s,0x]/gi, '').toLowerCase()
    if (cleaned.length === 0 || cleaned.length % 2 !== 0) return null
    if (!/^[0-9a-f]+$/.test(cleaned)) return null
    const bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16)
    }
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}
function strToBin(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ')
}

// ArrayBuffer → Base64
function bufferToB64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

// ─────────────────────────────────────────────
// JWT 디코딩
// ─────────────────────────────────────────────
type JwtParts = {
  header: object | null
  payload: object | null
  signature: string
  raw: { header: string; payload: string; signature: string }
}
function decodeJwt(token: string): JwtParts | null {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return null
  const [h, p, sig] = parts
  try {
    const header = JSON.parse(b64ToStr(h, true) ?? '')
    const payload = JSON.parse(b64ToStr(p, true) ?? '')
    return { header, payload, signature: sig, raw: { header: h, payload: p, signature: sig } }
  } catch {
    return null
  }
}

// 타임스탬프 포맷
function fmtTimestamp(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  return d.toLocaleString('ko-KR')
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function Base64Client() {
  const [tab, setTab] = useState<'text' | 'file' | 'jwt' | 'multi'>('text')

  // ─ TEXT 탭 ─
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [copied, setCopied] = useState<string>('')

  // ─ FILE 탭 ─
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileB64, setFileB64] = useState('')
  const [dataUri, setDataUri] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─ JWT 탭 ─
  const [jwtToken, setJwtToken] = useState('')

  // ─ MULTI 탭 ─
  const [multiInput, setMultiInput] = useState('')

  // ─────────────────────────────────────────────
  // TEXT 탭 — 출력
  // ─────────────────────────────────────────────
  const textOutput = useMemo(() => {
    if (input.trim() === '') return { value: '', error: '' }
    if (mode === 'encode') {
      const v = strToB64(input, urlSafe)
      return { value: v, error: v ? '' : '인코딩 실패' }
    } else {
      const v = b64ToStr(input, urlSafe)
      return { value: v ?? '', error: v === null ? '디코딩 실패: 유효한 Base64가 아닙니다' : '' }
    }
  }, [input, mode, urlSafe])

  // 사이즈 분석 (텍스트 인코딩 시)
  const sizeAnalysis = useMemo(() => {
    if (!input || mode !== 'encode' || !textOutput.value) return null
    const origBytes = new TextEncoder().encode(input).length
    const encBytes = textOutput.value.length // ASCII만
    const overhead = ((encBytes - origBytes) / origBytes) * 100
    return { origBytes, encBytes, overhead }
  }, [input, mode, textOutput.value])

  // ─────────────────────────────────────────────
  // FILE 탭 — 파일 처리
  // ─────────────────────────────────────────────
  function handleFile(file: File) {
    setFileName(file.name)
    setFileType(file.type || 'application/octet-stream')
    setFileSize(file.size)
    const reader = new FileReader()
    reader.onload = () => {
      const buf = reader.result
      if (buf instanceof ArrayBuffer) {
        const b64 = bufferToB64(buf)
        setFileB64(b64)
        setDataUri(`data:${file.type || 'application/octet-stream'};base64,${b64}`)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }
  function clearFile() {
    setFileName(''); setFileType(''); setFileSize(0); setFileB64(''); setDataUri('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const isImage = fileType.startsWith('image/')

  // ─────────────────────────────────────────────
  // JWT 탭
  // ─────────────────────────────────────────────
  const jwtData = useMemo(() => {
    if (!jwtToken.trim()) return null
    return decodeJwt(jwtToken)
  }, [jwtToken])

  // 만료 시간 분석
  const jwtExpInfo = useMemo(() => {
    if (!jwtData?.payload) return null
    const p = jwtData.payload as Record<string, unknown>
    const exp = typeof p.exp === 'number' ? p.exp : null
    const iat = typeof p.iat === 'number' ? p.iat : null
    const now = Math.floor(Date.now() / 1000)
    return {
      exp, iat,
      isExpired: exp !== null && exp < now,
      remainingSec: exp !== null ? exp - now : null,
    }
  }, [jwtData])

  // ─────────────────────────────────────────────
  // MULTI 탭 — 동시 다중 변환
  // ─────────────────────────────────────────────
  const multiOutputs = useMemo(() => {
    if (!multiInput) return null
    return {
      b64: strToB64(multiInput, false),
      b64Url: strToB64(multiInput, true),
      hex: strToHex(multiInput),
      bin: strToBin(multiInput),
      urlEnc: encodeURIComponent(multiInput),
      htmlEnt: multiInput.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
    }
  }, [multiInput])

  // ─────────────────────────────────────────────
  // 복사 헬퍼
  // ─────────────────────────────────────────────
  function copyValue(value: string, key: string) {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 1200)
  }

  function fmtBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabsFour}`}>
        <button className={`${s.tabBtn} ${tab === 'text'  ? s.tabActive : ''}`} onClick={() => setTab('text')}>텍스트</button>
        <button className={`${s.tabBtn} ${tab === 'file'  ? s.tabActive : ''}`} onClick={() => setTab('file')}>파일·이미지</button>
        <button className={`${s.tabBtn} ${tab === 'jwt'   ? s.tabActive : ''}`} onClick={() => setTab('jwt')}>JWT 디코더</button>
        <button className={`${s.tabBtn} ${tab === 'multi' ? s.tabActive : ''}`} onClick={() => setTab('multi')}>다중 변환</button>
      </div>

      {/* ─── TAB 1: 텍스트 ─── */}
      {tab === 'text' && (
        <>
          <div className={s.modeRow}>
            <button className={`${s.modeBtn} ${mode === 'encode' ? s.modeBtnActive : ''}`} onClick={() => setMode('encode')}>인코딩 (텍스트 → Base64)</button>
            <button className={`${s.modeBtn} ${mode === 'decode' ? s.modeBtnActive : ''}`} onClick={() => setMode('decode')}>디코딩 (Base64 → 텍스트)</button>
          </div>

          <div className={s.optionRow}>
            <label className={s.toggleLabel}>
              <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} className={s.checkbox} />
              URL-safe 모드 (<code>+/=</code> → <code>-_</code>)
            </label>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>{mode === 'encode' ? '원문 텍스트' : 'Base64 문자열'}</label>
            <textarea
              className={s.textarea}
              placeholder={mode === 'encode' ? '인코딩할 텍스트를 입력하세요...' : 'Base64 문자열을 입력하세요...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
            />
          </div>

          <button
            className={s.swapCenterBtn}
            onClick={() => { setInput(textOutput.value); setMode(m => m === 'encode' ? 'decode' : 'encode') }}
            disabled={!textOutput.value || !!textOutput.error}
          >
            ⇅ 결과를 입력으로
          </button>

          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>{mode === 'encode' ? 'Base64 결과' : '디코딩 결과'}</label>
              {textOutput.value && (
                <button className={s.copyBtn} onClick={() => copyValue(textOutput.value, 'text')}>
                  {copied === 'text' ? '✓ 복사됨' : '복사'}
                </button>
              )}
            </div>
            <div className={`${s.outputBox} ${textOutput.error ? s.outputError : ''}`}>
              {textOutput.error
                ? <span style={{ color: '#FF6B6B' }}>⚠️ {textOutput.error}</span>
                : (textOutput.value || <span className={s.outputPlaceholder}>결과가 여기에 표시됩니다</span>)
              }
            </div>
          </div>

          {/* 사이즈 분석 */}
          {sizeAnalysis && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>📏 사이즈 분석</label>
              </div>
              <div className={s.sizeRow}><span>원본 (UTF-8 바이트)</span><strong>{sizeAnalysis.origBytes.toLocaleString()} B</strong></div>
              <div className={s.sizeRow}><span>Base64 결과</span><strong>{sizeAnalysis.encBytes.toLocaleString()} B</strong></div>
              <div className={s.sizeRow}><span>오버헤드</span><strong style={{ color: '#FF8C3E' }}>+{sizeAnalysis.overhead.toFixed(1)}%</strong></div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>
                ※ Base64 인코딩은 약 33% 크기 증가 (3바이트 → 4문자)
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: 파일·이미지 ─── */}
      {tab === 'file' && (
        <>
          {!fileB64 ? (
            <div
              className={s.fileDropzone}
              onDrop={handleFileDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <p style={{ fontSize: 22, marginBottom: 6 }}>📁</p>
              <p style={{ marginBottom: 4 }}>파일을 여기에 드래그하거나 클릭해서 선택</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>이미지·PDF·텍스트 등 모든 파일 지원 (최대 10MB 권장)</p>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <>
              {/* 파일 정보 */}
              <div className={s.card}>
                <div className={s.cardTop}>
                  <label className={s.cardLabel}>📁 파일 정보</label>
                  <button className={s.clearBtn} onClick={clearFile}>다른 파일</button>
                </div>
                <div className={s.sizeRow}><span>파일 이름</span><strong style={{ fontFamily: 'var(--font-mono)' }}>{fileName}</strong></div>
                <div className={s.sizeRow}><span>MIME 타입</span><strong style={{ fontFamily: 'var(--font-mono)' }}>{fileType}</strong></div>
                <div className={s.sizeRow}><span>원본 크기</span><strong>{fmtBytes(fileSize)}</strong></div>
                <div className={s.sizeRow}><span>Base64 크기</span><strong>{fmtBytes(fileB64.length)}</strong></div>
              </div>

              {/* 이미지 미리보기 */}
              {isImage && dataUri && (
                <div className={s.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dataUri} alt={fileName} />
                </div>
              )}

              {/* Base64 출력 */}
              <div className={s.card}>
                <div className={s.cardTop}>
                  <label className={s.cardLabel}>Base64 (순수)</label>
                  <button className={s.copyBtn} onClick={() => copyValue(fileB64, 'fileB64')}>
                    {copied === 'fileB64' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <textarea className={s.textarea} value={fileB64} readOnly rows={6} />
              </div>

              {/* Data URI 출력 */}
              <div className={s.card}>
                <div className={s.cardTop}>
                  <label className={s.cardLabel}>Data URI (HTML/CSS 사용)</label>
                  <button className={s.copyBtn} onClick={() => copyValue(dataUri, 'dataUri')}>
                    {copied === 'dataUri' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <textarea className={s.textarea} value={dataUri} readOnly rows={6} />
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                  💡 사용 예시: <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{`<img src="${dataUri.slice(0, 40)}...">`}</code>
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── TAB 3: JWT ─── */}
      {tab === 'jwt' && (
        <>
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>JWT 토큰 입력</label>
              {jwtToken && <button className={s.clearBtn} onClick={() => setJwtToken('')}>지우기</button>}
            </div>
            <textarea
              className={s.textarea}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              value={jwtToken}
              onChange={e => setJwtToken(e.target.value)}
              rows={4}
              spellCheck={false}
            />
          </div>

          {jwtToken.trim() && !jwtData && (
            <div className={s.errorBox}>
              <strong>⚠️ JWT 디코딩 실패</strong>
              <p>유효한 JWT 형식이 아닙니다 (header.payload.signature 3개 부분 필요)</p>
            </div>
          )}

          {jwtData && (
            <>
              <div className={s.jwtSection}>
                <div className={`${s.jwtPart} ${s.jwtPartHeader}`}>
                  <p className={s.jwtPartLabel}>HEADER (알고리즘)</p>
                  <pre className={s.jwtPartCode}>{JSON.stringify(jwtData.header, null, 2)}</pre>
                </div>
                <div className={`${s.jwtPart} ${s.jwtPartPayload}`}>
                  <p className={s.jwtPartLabel}>PAYLOAD (클레임)</p>
                  <pre className={s.jwtPartCode}>{JSON.stringify(jwtData.payload, null, 2)}</pre>
                </div>
                <div className={`${s.jwtPart} ${s.jwtPartSig}`}>
                  <p className={s.jwtPartLabel}>SIGNATURE</p>
                  <pre className={s.jwtPartCode} style={{ wordBreak: 'break-all' }}>{jwtData.signature}</pre>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                    ⚠️ 서명은 비밀키 없이 검증할 수 없습니다. 본 도구는 디코딩만 수행합니다.
                  </p>
                </div>
              </div>

              {/* 만료 정보 */}
              {jwtExpInfo && (jwtExpInfo.exp || jwtExpInfo.iat) && (
                <div className={s.card}>
                  <div className={s.cardTop}>
                    <label className={s.cardLabel}>⏱️ 시간 클레임 분석</label>
                  </div>
                  {jwtExpInfo.iat && (
                    <div className={s.sizeRow}>
                      <span>iat (발급 시간)</span>
                      <strong>{fmtTimestamp(jwtExpInfo.iat)}</strong>
                    </div>
                  )}
                  {jwtExpInfo.exp && (
                    <>
                      <div className={s.sizeRow}>
                        <span>exp (만료 시간)</span>
                        <strong>{fmtTimestamp(jwtExpInfo.exp)}</strong>
                      </div>
                      <div className={s.sizeRow}>
                        <span>상태</span>
                        <strong style={{ color: jwtExpInfo.isExpired ? '#FF6B6B' : '#3EFF9B' }}>
                          {jwtExpInfo.isExpired
                            ? `❌ 만료됨 (${Math.abs(jwtExpInfo.remainingSec ?? 0)}초 전)`
                            : `✓ 유효 (남은 ${jwtExpInfo.remainingSec}초)`}
                        </strong>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── TAB 4: 다중 변환 ─── */}
      {tab === 'multi' && (
        <>
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>원문 텍스트 (여러 인코딩 동시 변환)</label>
              {multiInput && <button className={s.clearBtn} onClick={() => setMultiInput('')}>지우기</button>}
            </div>
            <textarea
              className={s.textarea}
              placeholder="텍스트를 입력하면 Base64·Base64URL·Hex·Binary·URL·HTML 인코딩을 동시에 보여줍니다..."
              value={multiInput}
              onChange={e => setMultiInput(e.target.value)}
              rows={4}
            />
          </div>

          {multiOutputs && (
            <div className={s.outputGrid}>
              {[
                { k: 'b64',     label: 'BASE64',          value: multiOutputs.b64 },
                { k: 'b64Url',  label: 'BASE64 URL-safe', value: multiOutputs.b64Url },
                { k: 'hex',     label: 'HEX',             value: multiOutputs.hex },
                { k: 'bin',     label: 'BINARY',          value: multiOutputs.bin },
                { k: 'urlEnc',  label: 'URL ENCODED',     value: multiOutputs.urlEnc },
                { k: 'htmlEnt', label: 'HTML ENTITIES',   value: multiOutputs.htmlEnt },
              ].map(o => (
                <div key={o.k}>
                  <div className={s.outputSmallLabel}>
                    <span>{o.label}</span>
                    <button className={s.copyBtn} onClick={() => copyValue(o.value, o.k)}>
                      {copied === o.k ? '✓' : '복사'}
                    </button>
                  </div>
                  <div className={s.outputSmall}>{o.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className={s.seoCard}>
            <p className={s.seoCardTitle}>💡 사용 팁</p>
            <p className={s.seoCardText}>
              <strong>Base64</strong>: 이메일·이미지 임베드 / <strong>URL-safe</strong>: JWT·URL 파라미터 /
              <strong> Hex</strong>: 해시·암호화 / <strong>URL Encoded</strong>: 쿼리 스트링 /
              <strong> HTML Entities</strong>: HTML 본문에 안전 삽입
            </p>
          </div>
        </>
      )}
    </div>
  )
}
