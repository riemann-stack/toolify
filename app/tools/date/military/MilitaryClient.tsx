'use client'

import { useState, useMemo } from 'react'
import styles from './military.module.css'

const TYPES = [
  { id: 'army',     label: '육군 (18개월)',      days: 548 },
  { id: 'navy',     label: '해군 (20개월)',      days: 610 },
  { id: 'airforce', label: '공군 (21개월)',      days: 640 },
  { id: 'marine',   label: '해병대 (18개월)',    days: 548 },
  { id: 'social',   label: '사회복무요원 (21개월)', days: 640 },
  { id: 'police',   label: '의무경찰 (18개월)',  days: 548 },
]

export default function MilitaryClient() {
  const [enlistDate, setEnlistDate] = useState('')
  const [type, setType] = useState('army')

  const result = useMemo(() => {
    if (!enlistDate) return null
    const selected = TYPES.find(t => t.id === type)!
    const enlist = new Date(enlistDate)
    const discharge = new Date(enlist)
    discharge.setDate(discharge.getDate() + selected.days)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalMs    = discharge.getTime() - enlist.getTime()
    const elapsedMs  = today.getTime() - enlist.getTime()
    const remainMs   = discharge.getTime() - today.getTime()

    const totalDays    = selected.days
    const elapsedDays  = Math.max(0, Math.floor(elapsedMs / 86400000))
    const remainDays   = Math.max(0, Math.ceil(remainMs / 86400000))
    const progress     = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))

    const isServing    = today >= enlist && today < discharge
    const isDischarged = today >= discharge

    const fmtDate = (d: Date) =>
      `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`

    return {
      discharge: fmtDate(discharge),
      enlist: fmtDate(enlist),
      totalDays, elapsedDays, remainDays,
      progress: Math.round(progress * 10) / 10,
      isServing, isDischarged,
      label: selected.label,
    }
  }, [enlistDate, type])

  return (
    <div className={styles.wrap}>

      <div className={styles.card}>
        <label className={styles.cardLabel}>입대일</label>
        <input className={styles.dateInput} type="date" value={enlistDate}
          onChange={e => setEnlistDate(e.target.value)} />
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>복무 형태</label>
        <div className={styles.typeGrid}>
          {TYPES.map(t => (
            <button key={t.id}
              className={`${styles.typeBtn} ${type === t.id ? styles.typeBtnActive : ''}`}
              onClick={() => setType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>전역일</div>
            <div className={styles.heroNum}>{result.discharge}</div>
            {result.isServing && (
              <div className={styles.heroSub}>D-{result.remainDays.toLocaleString()} · 앞으로 {result.remainDays}일</div>
            )}
            {result.isDischarged && (
              <div className={styles.heroDone}>전역 완료 🎉</div>
            )}
          </div>

          {result.isServing && (
            <div className={styles.card}>
              <div className={styles.progressHeader}>
                <span className={styles.cardLabel}>복무율</span>
                <span className={styles.progressPct}>{result.progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${result.progress}%` }} />
              </div>
              <div className={styles.progressInfo}>
                <span>{result.elapsedDays}일 복무</span>
                <span>잔여 {result.remainDays}일</span>
              </div>
            </div>
          )}

          <div className={styles.statsGrid}>
            {[
              ['총 복무일',    result.totalDays.toLocaleString() + '일'],
              ['복무 경과',    result.elapsedDays.toLocaleString() + '일'],
              ['잔여 일수',    result.remainDays.toLocaleString() + '일'],
              ['복무율',       result.progress + '%'],
            ].map(([label, value]) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statValue}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!result && (
        <div className={styles.empty}>입대일과 복무 형태를 선택하면 전역일이 계산됩니다</div>
      )}
    </div>
  )
}