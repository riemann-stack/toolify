'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './bpm.module.css'

const PRESETS = [60, 80, 100, 120, 140, 160]

const NOTES = [
  { label: '2분음표', factor: 2 },
  { label: '4분음표', factor: 1 },
  { label: '8분음표', factor: 0.5 },
  { label: '16분음표', factor: 0.25 },
]

function calcDelay(bpm: number, factor: number) {
  return Math.round((60000 / bpm) * factor)
}

export default function BpmClient({ initialBpm = '120' }: { initialBpm?: string } = {}) {
  const [bpm, setBpm] = useState(initialBpm)
  const [copied, setCopied] = useState<string | null>(null)

  const bpmNum = useMemo(() => {
    const n = parseFloat(bpm)
    return n > 0 && n <= 300 ? n : null
  }, [bpm])

  const handleCopy = useCallback((val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const quarterMs = bpmNum ? calcDelay(bpmNum, 1) : null

  return (
    <div className={styles.wrap}>
      {/* BPM 입력 */}
      <div className={styles.inputCard}>
        <label className={styles.inputLabel}>BPM (템포)</label>
        <div className={styles.inputRow}>
          <input
            className={styles.bpmInput}
            type="number"
            inputMode="decimal"
            placeholder="120"
            value={bpm}
            onChange={e => setBpm(e.target.value)}
            min={1}
            max={300}
          />
          <span className={styles.inputUnit}>BPM</span>
        </div>
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <button
              key={p}
              className={bpmNum === p ? `${styles.presetBtn} ${styles.presetBtnActive}` : styles.presetBtn}
              onClick={() => setBpm(String(p))}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {bpmNum && quarterMs !== null ? (
        <>
          {/* 히어로: 4분음표 */}
          <div className={styles.hero}>
            <div className={styles.heroLabel}>4분음표 딜레이 타임</div>
            <div className={styles.heroNum}>{quarterMs}</div>
            <div className={styles.heroUnit}>ms</div>
            <button
              className={`${styles.heroCopy} ${copied === 'hero' ? styles.heroCopied : ''}`}
              onClick={() => handleCopy(String(quarterMs), 'hero')}
            >
              {copied === 'hero' ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>

          {/* 딜레이 테이블 */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>음표</th>
                  <th className={styles.th}>기본</th>
                  <th className={styles.th}>점음표 ×1.5</th>
                  <th className={styles.th}>셋잇단음표 ×⅔</th>
                </tr>
              </thead>
              <tbody>
                {NOTES.map(note => {
                  const base = calcDelay(bpmNum, note.factor)
                  const dot  = Math.round(base * 1.5)
                  const trip = Math.round(base * (2 / 3))
                  return (
                    <tr key={note.label} className={styles.tr}>
                      <td className={styles.tdLabel}>{note.label}</td>
                      {[
                        { val: base, key: `${note.label}-base` },
                        { val: dot,  key: `${note.label}-dot`  },
                        { val: trip, key: `${note.label}-trip` },
                      ].map(({ val, key }) => (
                        <td key={key} className={styles.td}>
                          <span className={styles.ms}>{val}</span>
                          <span className={styles.msUnit}>ms</span>
                          <button
                            className={`${styles.copyBtn} ${copied === key ? styles.copyBtnDone : ''}`}
                            onClick={() => handleCopy(String(val), key)}
                          >
                            {copied === key ? '✓' : '⎘'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className={styles.empty}>BPM을 입력하면 딜레이 타임이 계산됩니다</div>
      )}
    </div>
  )
}
