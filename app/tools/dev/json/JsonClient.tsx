'use client'

import { useState } from 'react'
import styles from '../dev.module.css'

type IndentSize = 2 | 4

function formatJson(raw: string, indent: IndentSize): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw)
    return { output: JSON.stringify(parsed, null, indent), error: null }
  } catch (e) {
    return { output: '', error: (e as Error).message }
  }
}

function minifyJson(raw: string): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw)
    return { output: JSON.stringify(parsed), error: null }
  } catch (e) {
    return { output: '', error: (e as Error).message }
  }
}

export default function JsonClient() {
  const [input, setInput]       = useState('')
  const [indent, setIndent]     = useState<IndentSize>(2)
  const [result, setResult]     = useState<{ output: string; error: string | null } | null>(null)
  const [copied, setCopied]     = useState(false)

  const handleFormat  = () => setResult(formatJson(input, indent))
  const handleMinify  = () => setResult(minifyJson(input))

  const handleCopy = () => {
    if (!result?.output) return
    navigator.clipboard.writeText(result.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleClear = () => {
    setInput('')
    setResult(null)
  }

  // 입력 변경 시 결과 초기화
  const handleInputChange = (val: string) => {
    setInput(val)
    setResult(null)
  }

  return (
    <div className={styles.wrap}>

      {/* 설정 행 */}
      <div className={styles.optionRow} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.cardLabel} style={{ margin: 0 }}>들여쓰기</span>
          {([2, 4] as IndentSize[]).map(n => (
            <button
              key={n}
              className={`${styles.modeBtn} ${indent === n ? styles.modeBtnActive : ''}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
              onClick={() => setIndent(n)}
            >
              {n}칸
            </button>
          ))}
        </div>
      </div>

      {/* 입력 */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <label className={styles.cardLabel}>JSON 입력</label>
          {input && <button className={styles.clearBtn} onClick={handleClear}>지우기</button>}
        </div>
        <textarea
          className={styles.textarea}
          placeholder={'{\n  "key": "value"\n}'}
          value={input}
          onChange={e => handleInputChange(e.target.value)}
          rows={10}
          spellCheck={false}
        />
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actionRow}>
        <button
          className={styles.actionBtn}
          onClick={handleFormat}
          disabled={!input.trim()}
        >
          ✦ 정렬 (Beautify)
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          onClick={handleMinify}
          disabled={!input.trim()}
        >
          ⊟ 압축 (Minify)
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <label className={styles.cardLabel}>
              {result.error ? '⚠️ 오류' : '결과'}
            </label>
            {result.output && (
              <button className={styles.copyBtn} onClick={handleCopy}>
                {copied ? '✓ 복사됨' : '복사'}
              </button>
            )}
          </div>
          {result.error ? (
            <div className={styles.errorBox}>
              <strong>JSON 파싱 오류</strong>
              <p>{result.error}</p>
            </div>
          ) : (
            <pre className={styles.preBox}>{result.output}</pre>
          )}
        </div>
      )}

    </div>
  )
}