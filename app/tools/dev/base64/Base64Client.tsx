'use client'

import { useState } from 'react'
import styles from '../dev.module.css'

type Mode = 'encode' | 'decode'

function encodeBase64(text: string, urlSafe: boolean): string {
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)))
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : encoded
  } catch {
    return '⚠️ 인코딩 실패: 유효하지 않은 입력입니다.'
  }
}

function decodeBase64(text: string, urlSafe: boolean): string {
  try {
    let b64 = text.trim()
    if (urlSafe) b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
    // 패딩 복원
    while (b64.length % 4 !== 0) b64 += '='
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    return '⚠️ 디코딩 실패: 유효한 Base64 문자열이 아닙니다.'
  }
}

export default function Base64Client() {
  const [mode, setMode]       = useState<Mode>('encode')
  const [input, setInput]     = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [copied, setCopied]   = useState(false)

  const output = input.trim() === ''
    ? ''
    : mode === 'encode'
      ? encodeBase64(input, urlSafe)
      : decodeBase64(input, urlSafe)

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSwap = () => {
    setInput(output)
    setMode(m => m === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className={styles.wrap}>

      {/* 모드 선택 */}
      <div className={styles.modeRow}>
        <button
          className={`${styles.modeBtn} ${mode === 'encode' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('encode')}
        >
          인코딩 (텍스트 → Base64)
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'decode' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('decode')}
        >
          디코딩 (Base64 → 텍스트)
        </button>
      </div>

      {/* URL-safe 옵션 */}
      <div className={styles.optionRow}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={e => setUrlSafe(e.target.checked)}
            className={styles.checkbox}
          />
          URL-safe 모드 (<code>+/=</code> → <code>-_</code>)
        </label>
      </div>

      {/* 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          {mode === 'encode' ? '원문 텍스트' : 'Base64 문자열'}
        </label>
        <textarea
          className={styles.textarea}
          placeholder={mode === 'encode' ? '인코딩할 텍스트를 입력하세요...' : 'Base64 문자열을 입력하세요...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={5}
        />
      </div>

      {/* 스왑 버튼 */}
      <button className={styles.swapCenterBtn} onClick={handleSwap} disabled={!output || output.startsWith('⚠️')}>
        ⇅ 결과를 입력으로
      </button>

      {/* 출력 */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <label className={styles.cardLabel}>
            {mode === 'encode' ? 'Base64 결과' : '디코딩 결과'}
          </label>
          {output && (
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          )}
        </div>
        <div className={`${styles.outputBox} ${output.startsWith('⚠️') ? styles.outputError : ''}`}>
          {output || <span className={styles.outputPlaceholder}>결과가 여기에 표시됩니다</span>}
        </div>
      </div>

    </div>
  )
}