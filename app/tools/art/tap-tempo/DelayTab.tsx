'use client'

/* 탭 템포 계산기 ▸ 「딜레이 계산」 탭 (구 /tools/art/bpm 흡수)
   ─ TapTempoClient가 next/dynamic(ssr:false)으로 지연 로드 — 기본 탭 번들에 포함되지 않는다.
   ─ 초기 BPM: 탭 측정 버튼이 넘긴 값(initialBpm) → 없으면 ?bpm= 쿼리(구 /tools/art/bpm?bpm=X 301 경유) → 120.
     쿼리는 서버 searchParams가 아닌 클라이언트에서만 읽는다(SSG 유지).
   ─ 계산 로직은 delayUtils.ts(원본 그대로) — 이 파일은 UI만. */
import { useState, useMemo, useCallback, useRef } from 'react'
import { readQueryParam } from '@/components/useInitialTab'
import styles from './delay.module.css'
import { PRESETS, NOTES, rawDelay, calcDelay, normalizeBpmParam } from './delayUtils'

export default function DelayTab({ initialBpm = null }: { initialBpm?: string | null } = {}) {
  // 탭 측정값이 1~300 밖이면(아주 빠른 연타 등) 120으로 바꿔치지 않고 그대로 보여 준다 → 아래 '1~300 사이' 안내가 뜬다.
  // ?bpm= 쿼리(옛 주소 경유)는 예전처럼 범위 밖이면 120.
  const [bpm, setBpm] = useState(() =>
    initialBpm !== null
      ? (normalizeBpmParam(initialBpm) ?? initialBpm)
      : (normalizeBpmParam(readQueryParam('bpm')) ?? '120'),
  )
  const [copied, setCopied] = useState<string | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  const bpmNum = useMemo(() => {
    const n = parseFloat(bpm)
    // 안내 문구·input min과 같은 1~300 범위 (0.5 등 1 미만은 수 분짜리 딜레이가 되어 무의미)
    return n >= 1 && n <= 300 ? n : null
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
            <div className={styles.heroNum}>{quarterMs}<span className={styles.heroUnit}>ms</span></div>
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
