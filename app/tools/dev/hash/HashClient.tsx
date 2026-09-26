'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import s from './hash.module.css'
import {
  ALGORITHMS, HMAC_ALGORITHMS, WEBHOOK_PRESETS,
  type AlgorithmId, type HmacAlgorithmId,
  type OutputFormat, type TextEncoding, type KeyFormat,
  hashText, hashFile, hmacSign, formatHash,
  parseKey, encodeText, verifyHashInput, hasNonAscii, fmtBytes, countBytes,
  getAlgorithm, getHmacAlgorithm,
} from './hashUtils'

type Tab = 'text' | 'file' | 'hmac' | 'guide'

const STORAGE_KEY = 'youtil_hash_v1' // 기존 키 유지 (개명 시 저장값 유실)

const ALGO_IDS = ALGORITHMS.map((a) => a.id as AlgorithmId)
const emptyHashes = (): Record<AlgorithmId, string> => ({ md5: '', sha1: '', sha256: '', sha384: '', sha512: '' })

/* localStorage 복원값 검증 (enum 화이트리스트) */
const OUTPUT_FORMATS: OutputFormat[] = ['hex_lower', 'hex_upper', 'base64', 'base64url']
const TEXT_ENCODINGS: TextEncoding[] = ['utf8', 'ascii']
const KEY_FORMATS: KeyFormat[] = ['text', 'base64', 'hex']
const HMAC_IDS = HMAC_ALGORITHMS.map((a) => a.id as HmacAlgorithmId)
function pick<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null
}

let fileSeq = 0
const newFileId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `f${Date.now()}-${++fileSeq}`)

export default function HashClient() {
  const [tab, setTab] = useState<Tab>('text')

  /* ═══ 탭 1: 텍스트 해시 (입력은 저장 X — 보안) ═══ */
  const [textInput, setTextInput] = useState<string>('')
  const [textEncoding, setTextEncoding] = useState<TextEncoding>('utf8')
  const [textFormat, setTextFormat] = useState<OutputFormat>('hex_lower')
  const [textHashes, setTextHashes] = useState<Record<AlgorithmId, string>>(emptyHashes)

  /* ═══ 탭 2: 파일 해시 ═══ */
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [verifyHash, setVerifyHash] = useState<string>('')
  const [verifyAlgorithm, setVerifyAlgorithm] = useState<AlgorithmId>('sha256')
  const [dragOver, setDragOver] = useState(false)

  /* ═══ 탭 3: HMAC ═══ */
  const [hmacAlg, setHmacAlg] = useState<HmacAlgorithmId>('sha256')
  const [hmacKey, setHmacKey] = useState<string>('')
  const [hmacKeyFormat, setHmacKeyFormat] = useState<KeyFormat>('text')
  const [hmacMessage, setHmacMessage] = useState<string>('')
  const [hmacFormat, setHmacFormat] = useState<OutputFormat>('hex_lower')
  /* 결과는 계산 당시 입력값(snap)과 함께 저장 — 입력이 바뀌면 옛 서명을 보여주지 않음 */
  const [hmacOut, setHmacOut] = useState<{ snap: string; value: string; error: string } | null>(null)
  const hmacSnap = JSON.stringify([hmacAlg, hmacKey, hmacKeyFormat, hmacMessage, hmacFormat])
  const hmacFresh = hmacOut && hmacOut.snap === hmacSnap ? hmacOut : null
  const hmacResult = hmacFresh?.value ?? ''
  const hmacError = hmacFresh?.error ?? ''

  /* ═══ 복사 상태 ═══ */
  const [copiedKey, setCopiedKey] = useState<string>('')

  /* localStorage — 입력 텍스트 제외 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: unknown = JSON.parse(raw)
      if (!j || typeof j !== 'object') return
      const o = j as Record<string, unknown>
      const te = pick(o.textEncoding, TEXT_ENCODINGS); if (te) setTextEncoding(te)
      const tf = pick(o.textFormat, OUTPUT_FORMATS); if (tf) setTextFormat(tf)
      const va = pick(o.verifyAlgorithm, ALGO_IDS); if (va) setVerifyAlgorithm(va)
      const ha = pick(o.hmacAlg, HMAC_IDS); if (ha) setHmacAlg(ha)
      const hk = pick(o.hmacKeyFormat, KEY_FORMATS); if (hk) setHmacKeyFormat(hk)
      const hf = pick(o.hmacFormat, OUTPUT_FORMATS); if (hf) setHmacFormat(hf)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        textEncoding, textFormat, verifyAlgorithm, hmacAlg, hmacKeyFormat, hmacFormat,
      }))
    } catch {}
  }, [textEncoding, textFormat, verifyAlgorithm, hmacAlg, hmacKeyFormat, hmacFormat])

  /* ═══ 텍스트 해시 자동 재계산 (디바운스 200ms) ═══ */
  useEffect(() => {
    const handle = setTimeout(async () => {
      const results = emptyHashes()
      for (const a of ALGO_IDS) {
        try {
          const buf = await hashText(textInput, a, textEncoding)
          results[a] = formatHash(buf, textFormat)
        } catch {
          results[a] = '계산 오류'
        }
      }
      setTextHashes(results)
    }, 200)
    return () => clearTimeout(handle)
  }, [textInput, textEncoding, textFormat])

  /* ═══ 통계 ═══ */
  const stats = useMemo(() => ({
    chars: textInput.length,
    bytes: countBytes(textInput, textEncoding),
    lines: textInput === '' ? 0 : textInput.split('\n').length,
  }), [textInput, textEncoding])

  /* ═══ 복사 ═══ */
  const copy = async (key: string, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1500)
    } catch {}
  }

  /* ═══ 파일 처리 ═══ */
  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const entries: FileEntry[] = arr.map((f) => ({
      id: newFileId(),
      file: f,
      name: f.name,
      size: f.size,
      type: f.type || '—',
      progress: 0,
      hashes: emptyHashes(),
      sri: '',
      computing: false,
    }))
    setFiles((prev) => [...prev, ...entries])
    /* 비동기 해시 계산 — 목록 위치(인덱스)가 아니라 고유 id로 갱신해, 계산 중 다른 파일을 제거해도 섞이지 않음 */
    entries.forEach((entry) => { computeFileHashes(entry) })
  }

  const computeFileHashes = async (entry: FileEntry) => {
    const update = (patch: Partial<FileEntry>) =>
      setFiles((prev) => prev.map((e) => e.id === entry.id ? { ...e, ...patch } : e))
    update({ computing: true })
    const results = emptyHashes()
    let sri = ''
    let totalDone = 0
    const totalSteps = ALGO_IDS.length
    for (const a of ALGO_IDS) {
      try {
        const buf = await hashFile(entry.file, a, (pct) => {
          /* 알고리즘별 진행률을 합쳐서 표시 */
          update({ progress: ((totalDone * 100 + pct) / (totalSteps * 100)) * 100 })
        })
        results[a] = formatHash(buf, 'hex_lower')
        if (a === 'sha384') sri = `sha384-${formatHash(buf, 'base64')}`
      } catch {
        results[a] = '오류'
      }
      totalDone++
    }
    update({ hashes: results, sri, progress: 100, computing: false })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((e) => e.id !== id))
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  /* ═══ HMAC 계산 ═══ */
  const runHmac = async () => {
    const snap = hmacSnap
    if (!hmacKey) { setHmacOut({ snap, value: '', error: 'Secret Key를 입력하세요' }); return }
    try {
      const keyBuf = parseKey(hmacKey, hmacKeyFormat)
      const msgBuf = encodeText(hmacMessage, 'utf8')
      const sigBuf = await hmacSign(keyBuf, msgBuf, hmacAlg)
      setHmacOut({ snap, value: formatHash(sigBuf, hmacFormat), error: '' })
    } catch (err) {
      setHmacOut({ snap, value: '', error: err instanceof Error ? err.message : '계산 오류' })
    }
  }

  const applyWebhookPreset = (preset: typeof WEBHOOK_PRESETS[number]) => {
    setHmacAlg(preset.algorithm)
    setHmacFormat(preset.format)
    setTab('hmac')
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'text' ? s.tabActive : ''}`}  onClick={() => setTab('text')}>텍스트</button>
        <button className={`${s.tab} ${tab === 'file' ? s.tabActive : ''}`}  onClick={() => setTab('file')}>파일</button>
        <button className={`${s.tab} ${tab === 'hmac' ? s.tabActive : ''}`}  onClick={() => setTab('hmac')}>HMAC</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`} onClick={() => setTab('guide')}>가이드</button>
      </div>

      {/* ═════════════ 탭 1: 텍스트 해시 ═════════════ */}
      {tab === 'text' && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel} htmlFor="hash-text-input">입력 텍스트</label>
            <textarea
              id="hash-text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="해시할 텍스트 입력 (예: hello world)"
              rows={5}
              className={s.textarea}
            />
            <div className={s.statRow}>
              <span>글자수 <strong>{stats.chars.toLocaleString('ko-KR')}</strong></span>
              <span>바이트 <strong>{stats.bytes.toLocaleString('ko-KR')}</strong></span>
              <span>줄 <strong>{stats.lines.toLocaleString('ko-KR')}</strong></span>
              <button className={s.smBtn} onClick={() => setTextInput('')} disabled={!textInput}>초기화</button>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>옵션</span>
            <div className={s.optRow}>
              <div className={s.optGroup}>
                <span className={s.optLabel}>인코딩</span>
                <button className={`${s.optBtn} ${textEncoding === 'utf8' ? s.optBtnActive : ''}`} onClick={() => setTextEncoding('utf8')}>UTF-8</button>
                <button className={`${s.optBtn} ${textEncoding === 'ascii' ? s.optBtnActive : ''}`} onClick={() => setTextEncoding('ascii')}>ASCII</button>
              </div>
              {textEncoding === 'ascii' && hasNonAscii(textInput) && (
                <p className={s.warnText} role="status">⚠️ ASCII 모드에서는 한글·이모지 등 ASCII 밖 문자가 모두 ?(0x3F)로 바뀐 뒤 해시됩니다. 원문 그대로의 해시가 필요하면 UTF-8을 쓰세요.</p>
              )}
              <div className={s.optGroup}>
                <span className={s.optLabel}>출력</span>
                <button className={`${s.optBtn} ${textFormat === 'hex_lower' ? s.optBtnActive : ''}`} onClick={() => setTextFormat('hex_lower')}>hex</button>
                <button className={`${s.optBtn} ${textFormat === 'hex_upper' ? s.optBtnActive : ''}`} onClick={() => setTextFormat('hex_upper')}>HEX</button>
                <button className={`${s.optBtn} ${textFormat === 'base64' ? s.optBtnActive : ''}`} onClick={() => setTextFormat('base64')}>Base64</button>
                <button className={`${s.optBtn} ${textFormat === 'base64url' ? s.optBtnActive : ''}`} onClick={() => setTextFormat('base64url')}>Base64URL</button>
              </div>
            </div>
          </div>

          {/* 알고리즘별 결과 */}
          {ALGORITHMS.map((alg) => (
            <HashResultCard
              key={alg.id}
              algorithm={alg}
              hash={textHashes[alg.id as AlgorithmId]}
              copied={copiedKey === `text-${alg.id}`}
              onCopy={() => copy(`text-${alg.id}`, textHashes[alg.id as AlgorithmId])}
            />
          ))}
        </>
      )}

      {/* ═════════════ 탭 2: 파일 해시 ═════════════ */}
      {tab === 'file' && (
        <>
          <div
            className={`${s.dropZone} ${dragOver ? s.dropZoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
            role="button" aria-label="해시를 계산할 파일 선택" tabIndex={0}
          >
            <p className={s.dropZoneIcon}>📁</p>
            <p className={s.dropZoneText}>
              <strong>파일을 드래그</strong>하거나 클릭해 선택
            </p>
            <p className={s.dropZoneSub}>다중 파일 지원 · 모든 처리는 브라우저에서 실행 (외부 전송 없음)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          {/* 검증 모드 */}
          <div className={s.card}>
            <label className={s.cardLabel} htmlFor="hash-verify-input">무결성 검증 (옵션)</label>
            <div className={s.verifyRow}>
              <select
                aria-label="검증할 알고리즘"
                value={verifyAlgorithm}
                onChange={(e) => setVerifyAlgorithm(e.target.value as AlgorithmId)}
                className={s.select}
              >
                {ALGORITHMS.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <input
                id="hash-verify-input"
                type="text"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                placeholder="공식 사이트에서 제공한 예상 해시값 (hex)"
                className={s.input}
              />
            </div>
            <p className={s.hint}>
              💡 다운로드 사이트가 제공한 해시를 붙여넣으세요. SHA256SUMS의 한 줄(해시 + 파일명)이나 certutil 출력을 통째로 넣어도 해시 부분만 골라 비교합니다.
            </p>
          </div>

          {files.length === 0 && (
            <div className={s.emptyState}>
              <p>파일을 추가하면 {ALGORITHMS.length}개 알고리즘 해시와 SRI 값이 자동 계산됩니다.</p>
            </div>
          )}

          {files.map((entry) => {
            const verified = verifyHash.trim() ? verifyHashInput(entry.hashes[verifyAlgorithm], verifyHash, verifyAlgorithm) : null
            const algName = getAlgorithm(verifyAlgorithm).name
            const isLarge = entry.size > 100 * 1024 * 1024  /* 100MB */
            return (
              <div key={entry.id} className={s.fileCard}>
                <div className={s.fileHeader}>
                  <div className={s.fileMeta}>
                    <p className={s.fileName}>{entry.name}</p>
                    <p className={s.fileSpec}>{fmtBytes(entry.size)} · {entry.type}</p>
                  </div>
                  <button className={s.smBtn} onClick={() => removeFile(entry.id)}>제거</button>
                </div>
                {isLarge && entry.computing && (
                  <p className={s.warnText}>⚠️ 100MB 초과 — 메모리 사용↑, 시간 소요. 잠시 기다려 주세요.</p>
                )}
                {entry.computing && (
                  <div className={s.progressWrap}>
                    <div className={s.progressBar} style={{ width: `${entry.progress.toFixed(1)}%` }} />
                    <p className={s.progressText}>{entry.progress.toFixed(0)}%</p>
                  </div>
                )}
                {!entry.computing && verified && (
                  <div className={`${s.verifyBox} ${verified.status === 'match' ? s.verifyOk : s.verifyFail}`} role="status">
                    {verified.status === 'match'
                      ? `✅ ${algName} 무결성 확인됨 — 파일 변조 없음`
                      : verified.status === 'mismatch'
                        ? `❌ ${algName} 해시 불일치 — 파일 손상 또는 변조 의심`
                        : verified.status === 'wrong-length'
                          ? `⚠️ 입력한 해시는 ${verified.length}자라 ${algName}(${getAlgorithm(verifyAlgorithm).hexLen}자)와 길이가 다릅니다${verified.guess ? ` — 알고리즘을 ${getAlgorithm(verified.guess).name}(으)로 바꿔 비교하세요` : ''}`
                          : '⚠️ 입력값에서 해시(16진수 32~128자)를 찾지 못했습니다'}
                  </div>
                )}
                {/* 4 알고리즘 작은 표 */}
                <table className={s.smallHashTable}>
                  <tbody>
                    {ALGORITHMS.map((alg) => (
                      <tr key={alg.id}>
                        <td>
                          <span className={s.algBadge} style={{ borderColor: alg.badgeColor + '60' }}>
                            <strong style={{ color: alg.badgeColor }}>{alg.name}</strong>
                            <span className={s.algBits}>{alg.bits}</span>
                          </span>
                        </td>
                        <td>
                          <code className={s.hashCode}>{entry.hashes[alg.id as AlgorithmId] || '...'}</code>
                        </td>
                        <td>
                          <button
                            className={s.smBtn}
                            onClick={() => copy(`file-${entry.id}-${alg.id}`, entry.hashes[alg.id as AlgorithmId])}
                            disabled={!entry.hashes[alg.id as AlgorithmId]}
                            aria-label={`${alg.name} 복사`}
                          >
                            {copiedKey === `file-${entry.id}-${alg.id}` ? '✓' : '📋'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <span className={s.algBadge}>
                          <strong>SRI</strong>
                          <span className={s.algBits}>integrity</span>
                        </span>
                      </td>
                      <td>
                        <code className={s.hashCode}>{entry.sri || '...'}</code>
                      </td>
                      <td>
                        <button
                          className={s.smBtn}
                          onClick={() => copy(`file-${entry.id}-sri`, entry.sri)}
                          disabled={!entry.sri}
                          aria-label="SRI integrity 값 복사"
                        >
                          {copiedKey === `file-${entry.id}-sri` ? '✓' : '📋'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
        </>
      )}

      {/* ═════════════ 탭 3: HMAC ═════════════ */}
      {tab === 'hmac' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>HMAC 알고리즘</span>
            <div className={s.algRow}>
              {HMAC_ALGORITHMS.map((alg) => (
                <button
                  key={alg.id}
                  className={`${s.algBtn} ${hmacAlg === alg.id ? s.algBtnActive : ''}`}
                  onClick={() => setHmacAlg(alg.id as HmacAlgorithmId)}
                >
                  {alg.name}
                  <span className={s.algBtnBadge}>{alg.badgeLabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel} htmlFor="hash-hmac-key">Secret Key</label>
            <div className={s.optGroup} style={{ marginBottom: 10 }}>
              <span className={s.optLabel}>형식</span>
              <button className={`${s.optBtn} ${hmacKeyFormat === 'text' ? s.optBtnActive : ''}`} onClick={() => setHmacKeyFormat('text')}>Text</button>
              <button className={`${s.optBtn} ${hmacKeyFormat === 'base64' ? s.optBtnActive : ''}`} onClick={() => setHmacKeyFormat('base64')}>Base64</button>
              <button className={`${s.optBtn} ${hmacKeyFormat === 'hex' ? s.optBtnActive : ''}`} onClick={() => setHmacKeyFormat('hex')}>Hex</button>
            </div>
            <input
              id="hash-hmac-key"
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Secret Key 입력"
              className={s.input}
            />
          </div>

          <div className={s.card}>
            <label className={s.cardLabel} htmlFor="hash-hmac-message">Message</label>
            <textarea
              id="hash-hmac-message"
              value={hmacMessage}
              onChange={(e) => setHmacMessage(e.target.value)}
              placeholder="서명할 메시지 (UTF-8)"
              rows={4}
              className={s.textarea}
            />
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>출력 형식</span>
            <div className={s.optGroup}>
              <button className={`${s.optBtn} ${hmacFormat === 'hex_lower' ? s.optBtnActive : ''}`} onClick={() => setHmacFormat('hex_lower')}>hex</button>
              <button className={`${s.optBtn} ${hmacFormat === 'hex_upper' ? s.optBtnActive : ''}`} onClick={() => setHmacFormat('hex_upper')}>HEX</button>
              <button className={`${s.optBtn} ${hmacFormat === 'base64' ? s.optBtnActive : ''}`} onClick={() => setHmacFormat('base64')}>Base64</button>
              <button className={`${s.optBtn} ${hmacFormat === 'base64url' ? s.optBtnActive : ''}`} onClick={() => setHmacFormat('base64url')}>Base64URL (JWT)</button>
            </div>
            <button className={s.primaryBtn} onClick={runHmac}>서명 생성</button>
            {hmacError && <p className={s.warnText}>⚠️ {hmacError}</p>}
          </div>

          {hmacResult && (
            <div className={s.heroCard} role="status">
              <div className={s.heroPrimary}>
                <p className={s.heroLabel}>{getHmacAlgorithm(hmacAlg).name} 서명 결과</p>
                <code className={s.heroHash}>{hmacResult}</code>
                <p className={s.heroSub}>
                  길이 <strong>{hmacResult.length}자</strong> · 형식 <strong>{hmacFormat}</strong>
                </p>
              </div>
              <button
                className={s.copyBigBtn}
                onClick={() => copy('hmac-result', hmacResult)}
              >
                {copiedKey === 'hmac-result' ? '✓ 복사됨' : '복사'}
              </button>
            </div>
          )}

          {/* 시나리오 카드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>사용 시나리오 — 클릭 시 알고리즘·형식 자동 설정</span>
            <div className={s.presetGrid}>
              {WEBHOOK_PRESETS.map((p) => (
                <button key={p.id} className={s.presetCard} onClick={() => applyWebhookPreset(p)}>
                  <p className={s.presetTitle}>{p.emoji} {p.name}</p>
                  <p className={s.presetSpec}>
                    <span>{getHmacAlgorithm(p.algorithm).name}</span>
                    <span> · </span>
                    <span>{p.format}</span>
                  </p>
                  {p.header && <p className={s.presetHeader}><code>{p.header}</code></p>}
                  <p className={s.presetDesc}>{p.desc}</p>
                  <p className={s.presetExample}>{p.example}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═════════════ 탭 4: 가이드 ═════════════ */}
      {tab === 'guide' && (
        <>
          {/* 알고리즘 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>알고리즘 비교</span>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th scope="col">알고리즘</th>
                  <th scope="col">출력</th>
                  <th scope="col">안전성</th>
                  <th scope="col">속도</th>
                  <th scope="col">용도</th>
                </tr>
              </thead>
              <tbody>
                {ALGORITHMS.map((alg) => (
                  <tr key={alg.id}>
                    <td><strong style={{ color: alg.badgeColor }}>{alg.name}</strong></td>
                    <td className={s.mono}>{alg.bits}bit / {alg.hexLen}자 hex</td>
                    <td><span className={s.miniBadge} style={{ color: alg.badgeColor }}>{alg.badgeLabel}</span></td>
                    <td>{alg.speed}</td>
                    <td>{alg.useCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 보안 경고 */}
          <div className={s.dangerBox}>
            <p className={s.dangerTitle}>🚨 보안 경고 — MD5/SHA-1 사용 금지 사례</p>
            <ul className={s.dangerList}>
              <li><strong>비밀번호 해싱</strong> 절대 금지 — bcrypt·scrypt·Argon2 (서버 측 KDF) 사용</li>
              <li><strong>디지털 서명</strong> 부적합 — SHA-256 이상 + RSA·ECDSA 조합</li>
              <li><strong>SSL/TLS 인증서</strong>는 최소 SHA-256 (CA Browser Forum 표준)</li>
              <li><strong>토큰·세션</strong>은 SHA-256 이상 또는 HMAC-SHA256 권장</li>
            </ul>
            <p className={s.dangerSub}>
              📅 알려진 충돌 공격: <strong>MD5 (2004)</strong>, <strong>SHA-1 SHAttered (2017, Google)</strong>
            </p>
          </div>

          {/* 무결성 vs 비밀번호 vs 서명 */}
          <div className={s.card}>
            <span className={s.cardLabel}>용도별 선택 가이드</span>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th scope="col">용도</th>
                  <th scope="col">권장 알고리즘</th>
                  <th scope="col">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>📥 파일 무결성 (체크섬)</td><td>SHA-256, MD5(legacy)</td><td>본 도구의 [📁 파일] 탭 사용</td></tr>
                <tr><td>🔐 비밀번호 해싱</td><td><strong>bcrypt·scrypt·Argon2</strong></td><td>본 도구는 미지원, 서버 KDF 라이브러리</td></tr>
                <tr><td>✍️ 디지털 서명</td><td>SHA-256 + RSA/ECDSA</td><td>비대칭 암호 별도 필요</td></tr>
                <tr><td>🔗 API 인증 (HMAC)</td><td>HMAC-SHA256</td><td>본 도구의 [🔑 HMAC] 탭</td></tr>
                <tr><td>🌐 SRI (CDN 검증)</td><td>SHA-384 + Base64</td><td>HTML <code>integrity=&quot;sha384-...&quot;</code></td></tr>
                <tr><td>📦 캐시 키·중복 검출</td><td>MD5, SHA-256</td><td>충돌 무관 단순 식별자</td></tr>
                <tr><td>🪙 블록체인 (Bitcoin)</td><td>SHA-256 (이중 해싱)</td><td>Ethereum은 Keccak-256</td></tr>
              </tbody>
            </table>
          </div>

          {/* SRI 사용법 */}
          <div className={s.card}>
            <span className={s.cardLabel}>SRI (Subresource Integrity) 사용법</span>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85, margin: '0 0 10px' }}>
              CDN에서 로드하는 외부 스크립트가 변조되지 않았는지 검증하는 W3C 표준입니다.
              스크립트 파일을 본 도구의 [📁 파일] 탭에 넣으면 <strong>SRI</strong> 행에서 <code>sha384-…</code> 값을 그대로 복사할 수 있습니다.
              텍스트 탭에 코드를 붙여넣으면 줄바꿈(CRLF)이 LF로 바뀌어 실제 파일과 해시가 달라질 수 있으니 파일 탭을 권장합니다.
            </p>
            <pre className={s.codeBlock}>
{`<!-- 예시 -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>`}
            </pre>
          </div>

          {/* CLI 명령 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>CLI 명령 대조</span>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th scope="col">알고리즘</th>
                  <th scope="col">macOS / Linux</th>
                  <th scope="col">Windows (PowerShell)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>MD5</td><td><code>md5sum file</code> (Linux) / <code>md5 file</code> (macOS)</td><td><code>certutil -hashfile FILE MD5</code></td></tr>
                <tr><td>SHA-1</td><td><code>shasum -a 1 file</code></td><td><code>certutil -hashfile FILE SHA1</code></td></tr>
                <tr><td>SHA-256</td><td><code>shasum -a 256 file</code></td><td><code>certutil -hashfile FILE SHA256</code></td></tr>
                <tr><td>SHA-384</td><td><code>shasum -a 384 file</code></td><td><code>certutil -hashfile FILE SHA384</code></td></tr>
                <tr><td>SHA-512</td><td><code>shasum -a 512 file</code></td><td><code>certutil -hashfile FILE SHA512</code></td></tr>
                <tr><td>HMAC-SHA256</td><td><code>openssl dgst -sha256 -hmac KEY file</code></td><td>(PowerShell HMACSHA256 클래스)</td></tr>
              </tbody>
            </table>
            <p className={s.hint}>
              💡 본 도구의 결과는 위 CLI 명령과 정확히 동일합니다. 같은 파일·같은 알고리즘이면 출력 hex 100% 일치.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════
   서브 컴포넌트
   ═════════════════════════════════════════════ */

interface FileEntry {
  id: string
  file: File
  name: string
  size: number
  type: string
  progress: number
  hashes: Record<AlgorithmId, string>
  /** SRI integrity 값 (sha384-<base64>) */
  sri: string
  computing: boolean
}

function HashResultCard({
  algorithm, hash, copied, onCopy,
}: {
  algorithm: typeof ALGORITHMS[number]
  hash: string
  copied: boolean
  onCopy: () => void
}) {
  const safetyClass = algorithm.safety === 'safe' ? s.cardSafe : s.cardIntegrity
  return (
    <div className={`${s.resultCard} ${safetyClass}`}>
      <div className={s.resultHeader}>
        <div className={s.resultTitle}>
          <strong className={s.algName}>{algorithm.name}</strong>
          <span className={s.algBitsBadge}>{algorithm.bits}bit</span>
          <span className={s.algSafetyBadge} style={{ color: algorithm.badgeColor }}>{algorithm.badgeLabel}</span>
        </div>
        <button className={s.smBtn} onClick={onCopy} disabled={!hash}>
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <code className={s.resultHash}>{hash || '입력 대기 중...'}</code>
      <p className={s.resultDesc}>{algorithm.description}</p>
    </div>
  )
}
