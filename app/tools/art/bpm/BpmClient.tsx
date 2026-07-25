'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import styles from './bpm.module.css'

const PRESETS = [60, 80, 100, 120, 140, 160]

const NOTES = [
  { label: '2분음표', factor: 2 },
  { label: '4분음표', factor: 1 },
  { label: '8분음표', factor: 0.5 },
  { label: '16분음표', factor: 0.25 },
]

/* 원값(ms, 미반올림) — 점음표·셋잇단은 반드시 이 원값에 배율을 곱한 뒤 반올림해야
   소수 BPM에서 이중 반올림 오차(예: 128.5 BPM 점4분 701→700)가 없다 */
function rawDelay(bpm: number, factor: number) {
  return (60000 / bpm) * factor
}
function calcDelay(bpm: number, factor: number) {
  return Math.round(rawDelay(bpm, factor))
}

export default function BpmClient({ initialBpm = '120' }: { initialBpm?: string } = {}) {
  const [bpm, setBpm] = useState(initialBpm)
  const [copied, setCopied] = useState<string | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  const bpmNum = useMemo(() => {
    const n = parseFloat(bpm)
    return n > 0 && n <= 300 ? n : null
  }, [bpm])

  const handleCopy = useCallback((val: string, key: string) => {
    const show = (state: string) => {
      setCopied(state)
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopied(null), 1500)
    }
    navigator.clipboard.writeText(val)
      .then(() => show(key))
      .catch(() => show(`fail:${key}`))  // 권한 거부 등 실패를 성공으로 표시하지 않음
  }, [])

  const quarterMs = bpmNum ? calcDelay(bpmNum, 1) : null

  return (
    <div className={styles.wrap}>
      {/* BPM 입력 */}
      <div className={styles.inputCard}>
        <label className={styles.inputLabel} htmlFor="bpm-bpm">BPM (템포)</label>
        <div className={styles.inputRow}>
          <input id="bpm-bpm"
            className={styles.bpmInput}
            type="number"
            inputMode="decimal"
            step="any"
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
              type="button"
              aria-pressed={bpmNum === p}
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
          <div className={styles.hero} role="status">
            <div className={styles.heroLabel}>4분음표 딜레이 타임</div>
            <div className={styles.heroNum}>{quarterMs}</div>
            <div className={styles.heroUnit}>ms</div>
            <button
              type="button"
              className={`${styles.heroCopy} ${copied === 'hero' ? styles.heroCopied : ''}`}
              onClick={() => handleCopy(String(quarterMs), 'hero')}
            >
              {copied === 'hero' ? '✓ 복사됨' : copied === 'fail:hero' ? '✗ 복사 실패' : '복사'}
            </button>
          </div>

          {/* 딜레이 테이블 */}
          <div className={`${styles.tableWrap} tableScroll`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.th}>음표</th>
                  <th scope="col" className={styles.th}>기본</th>
                  <th scope="col" className={styles.th}>점음표 ×1.5</th>
                  <th scope="col" className={styles.th}>셋잇단음표 ×⅔</th>
                </tr>
              </thead>
              <tbody>
                {NOTES.map(note => {
                  const raw  = rawDelay(bpmNum, note.factor)
                  const base = Math.round(raw)
                  const dot  = Math.round(raw * 1.5)
                  const trip = Math.round(raw * (2 / 3))
                  return (
                    <tr key={note.label} className={styles.tr}>
                      <td className={styles.tdLabel}>{note.label}</td>
                      {[
                        { val: base, kind: '기본',       key: `${note.label}-base` },
                        { val: dot,  kind: '점음표',     key: `${note.label}-dot`  },
                        { val: trip, kind: '셋잇단음표', key: `${note.label}-trip` },
                      ].map(({ val, kind, key }) => (
                        <td key={key} className={styles.td}>
                          <span className={styles.ms}>{val}</span>
                          <span className={styles.msUnit}>ms</span>
                          <button
                            type="button"
                            aria-label={`${note.label} ${kind} ${val}ms 복사`}
                            className={`${styles.copyBtn} ${copied === key ? styles.copyBtnDone : ''}`}
                            onClick={() => handleCopy(String(val), key)}
                          >
                            {copied === key ? '✓' : copied === `fail:${key}` ? '✗' : '⎘'}
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
        <div className={styles.empty}>1~300 사이 BPM을 입력하면 딜레이 타임이 계산됩니다</div>
      )}
    </div>
  )
}
