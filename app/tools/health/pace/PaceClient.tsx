'use client'

import { useState, useMemo } from 'react'
import styles from '../health.module.css'

const DISTANCES = [
  { label: '5km',         km: 5 },
  { label: '10km',        km: 10 },
  { label: '하프 (21.1km)', km: 21.0975 },
  { label: '풀 (42.195km)', km: 42.195 },
  { label: '직접 입력',   km: 0 },
]

function toHMS(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = Math.floor(totalSecs % 60)
  if (h > 0) return `${h}시간 ${m}분 ${String(s).padStart(2, '0')}초`
  return `${m}분 ${String(s).padStart(2, '0')}초`
}

function toMS(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}

export default function PaceClient() {
  const [distIdx,     setDistIdx]     = useState(1)
  const [customKm,    setCustomKm]    = useState('')
  const [targetH,     setTargetH]     = useState('')
  const [targetM,     setTargetM]     = useState('')
  const [targetS,     setTargetS]     = useState('')

  const km = distIdx === 4 ? parseFloat(customKm) : DISTANCES[distIdx].km

  const result = useMemo(() => {
    const h  = parseInt(targetH)  || 0
    const m  = parseInt(targetM)  || 0
    const s  = parseInt(targetS)  || 0
    const totalSecs = h * 3600 + m * 60 + s
    if (totalSecs <= 0 || !km || km <= 0) return null

    const paceSecPerKm = totalSecs / km
    const speedKmh     = km / (totalSecs / 3600)

    // 주요 거리별 예상 기록
    const splits = DISTANCES.slice(0, 4).map(d => ({
      label: d.label,
      time: toHMS(paceSecPerKm * d.km),
    }))

    return {
      paceStr:   toMS(paceSecPerKm),
      speedKmh:  Math.round(speedKmh * 10) / 10,
      totalSecs,
      splits,
    }
  }, [km, targetH, targetM, targetS])

  return (
    <div className={styles.wrap}>

      {/* 거리 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>거리</label>
        <div className={styles.distGrid}>
          {DISTANCES.map((d, i) => (
            <button
              key={i}
              className={`${styles.distBtn} ${distIdx === i ? styles.distActive : ''}`}
              onClick={() => setDistIdx(i)}
            >
              {d.label}
            </button>
          ))}
        </div>
        {distIdx === 4 && (
          <div className={styles.inputRow} style={{ marginTop: '12px' }}>
            <input
              className={styles.numInput}
              type="number"
              inputMode="decimal"
              placeholder="거리 입력"
              value={customKm}
              onChange={e => setCustomKm(e.target.value)}
            />
            <span className={styles.unit}>km</span>
          </div>
        )}
      </div>

      {/* 목표 시간 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 완주 시간</label>
        <div className={styles.timeRow}>
          <div className={styles.timeInput}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="0" value={targetH} onChange={e => setTargetH(e.target.value)} min={0} max={9} />
            <span className={styles.timeUnit}>시간</span>
          </div>
          <div className={styles.timeInput}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={targetM} onChange={e => setTargetM(e.target.value)} min={0} max={59} />
            <span className={styles.timeUnit}>분</span>
          </div>
          <div className={styles.timeInput}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="0" value={targetS} onChange={e => setTargetS(e.target.value)} min={0} max={59} />
            <span className={styles.timeUnit}>초</span>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <>
          <div className={styles.paceHeroRow}>
            <div className={styles.resultHero} style={{ flex: 1 }}>
              <div className={styles.resultHeroLabel}>킬로 페이스</div>
              <div className={styles.resultHeroNum}>{result.paceStr}</div>
              <div className={styles.resultHeroUnit}>/ km</div>
            </div>
            <div className={styles.resultHero} style={{ flex: 1 }}>
              <div className={styles.resultHeroLabel}>평균 시속</div>
              <div className={styles.resultHeroNum}>{result.speedKmh}</div>
              <div className={styles.resultHeroUnit}>km/h</div>
            </div>
          </div>

          {/* 거리별 예상 기록 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>같은 페이스 기준 예상 기록</label>
            <div className={styles.splitList}>
              {result.splits.map(s => (
                <div key={s.label} className={styles.splitRow}>
                  <span className={styles.splitLabel}>{s.label}</span>
                  <span className={styles.splitTime}>{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className={styles.empty}>거리와 목표 시간을 입력하면 페이스가 계산됩니다</div>
      )}
    </div>
  )
}