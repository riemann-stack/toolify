'use client'

import { useState, useMemo } from 'react'
import styles from './weightloss.module.css'

const KCAL_PER_KG = 7700

export default function WeightLossClient() {
  const [current, setCurrent] = useState('')
  const [target,  setTarget]  = useState('')
  const [deficit, setDeficit] = useState('500')

  const DEFICIT_PRESETS = [300, 500, 700, 1000]

  const result = useMemo(() => {
    const cur = parseFloat(current)
    const tgt = parseFloat(target)
    const def = parseInt(deficit)
    if (!cur || !tgt || !def || cur <= tgt || cur < 20 || tgt < 20 || def <= 0) return null

    const lossKg   = cur - tgt
    const totalKcal = lossKg * KCAL_PER_KG
    const days     = Math.ceil(totalKcal / def)
    const weeks    = Math.floor(days / 7)
    const remDays  = days % 7
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)

    const weeklyLoss = (def * 7) / KCAL_PER_KG

    return { lossKg, days, weeks, remDays, targetDate, weeklyLoss }
  }, [current, target, deficit])

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`

  return (
    <div className={styles.wrap}>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 체중 (kg)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="75" value={current} onChange={e => setCurrent(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>목표 체중 (kg)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="65" value={target} onChange={e => setTarget(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>하루 칼로리 적자 (kcal)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="500" value={deficit} onChange={e => setDeficit(e.target.value)} />
          <span className={styles.unit}>kcal</span>
        </div>
        <div className={styles.presets}>
          {DEFICIT_PRESETS.map(d => (
            <button key={d}
              className={`${styles.presetBtn} ${deficit === String(d) ? styles.presetActive : ''}`}
              onClick={() => setDeficit(String(d))}>
              {d}kcal
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
          안전한 범위: 하루 300~700kcal 적자 권장 (1,200kcal 미만 섭취 비권장)
        </p>
      </div>

      {result ? (
        <>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>목표 달성 예상일</div>
            <div className={styles.heroNum}>{fmtDate(result.targetDate)}</div>
            <div className={styles.heroSub}>
              {result.weeks > 0 && `약 ${result.weeks}주 `}{result.remDays > 0 && `${result.remDays}일`} ({result.days}일) 후
            </div>
          </div>

          <div className={styles.grid3}>
            {[
              ['감량 목표',    result.lossKg.toFixed(1) + 'kg'],
              ['주당 감량',    result.weeklyLoss.toFixed(2) + 'kg'],
              ['총 소요일',    result.days.toLocaleString() + '일'],
            ].map(([label, value]) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statValue}>{value}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          {current && target && parseFloat(current) <= parseFloat(target)
            ? '목표 체중은 현재 체중보다 낮아야 합니다'
            : '현재 체중, 목표 체중, 하루 칼로리 적자를 입력하면 계산됩니다'}
        </div>
      )}
    </div>
  )
}