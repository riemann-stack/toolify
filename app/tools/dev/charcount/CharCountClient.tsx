'use client'

import { useState, useMemo } from 'react'
import styles from '../dev.module.css'

const LIMITS = [
  { label: '트위터',      limit: 140 },
  { label: '인스타그램',  limit: 2200 },
  { label: '카카오톡',    limit: 1000 },
  { label: '유튜브 제목', limit: 100 },
]

export default function CharCountClient() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const withSpace    = text.length
    const withoutSpace = text.replace(/\s/g, '').length
    const words        = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    const lines        = text === '' ? 0 : text.split('\n').length
    const bytes        = new TextEncoder().encode(text).length
    return { withSpace, withoutSpace, words, lines, bytes }
  }, [text])

  const handleClear = () => setText('')

  return (
    <div className={styles.wrap}>

      {/* 입력 영역 */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <label className={styles.cardLabel}>텍스트 입력</label>
          {text && (
            <button className={styles.clearBtn} onClick={handleClear}>지우기</button>
          )}
        </div>
        <textarea
          className={styles.textarea}
          placeholder="여기에 텍스트를 입력하세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
        />
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.withSpace.toLocaleString()}</div>
          <div className={styles.statLabel}>글자수 (공백 포함)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.withoutSpace.toLocaleString()}</div>
          <div className={styles.statLabel}>글자수 (공백 제외)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.words.toLocaleString()}</div>
          <div className={styles.statLabel}>단어수</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.lines.toLocaleString()}</div>
          <div className={styles.statLabel}>줄수</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{stats.bytes.toLocaleString()}</div>
          <div className={styles.statLabel}>바이트 (UTF-8)</div>
        </div>
      </div>

      {/* SNS 글자수 제한 비교 */}
      {text.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>SNS 글자수 제한 비교</label>
          <div className={styles.limitList}>
            {LIMITS.map(({ label, limit }) => {
              const pct     = Math.min(stats.withSpace / limit * 100, 100)
              const over    = stats.withSpace > limit
              return (
                <div key={label} className={styles.limitRow}>
                  <div className={styles.limitMeta}>
                    <span className={styles.limitName}>{label}</span>
                    <span className={`${styles.limitCount} ${over ? styles.limitOver : ''}`}>
                      {stats.withSpace.toLocaleString()} / {limit.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${over ? styles.progressOver : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}