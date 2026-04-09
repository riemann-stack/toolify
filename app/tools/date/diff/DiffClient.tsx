'use client'

import { useState, useMemo } from 'react'
import styles from '../date.module.css'

function calcDiff(fromStr: string, toStr: string) {
  if (!fromStr || !toStr) return null

  const from = new Date(fromStr)
  const to   = new Date(toStr)
  from.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)

  const msPerDay = 86400000
  const diffMs   = to.getTime() - from.getTime()
  const days     = Math.round(diffMs / msPerDay)
  const absDays  = Math.abs(days)

  const weeks    = Math.floor(absDays / 7)
  const months   = Math.abs(
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  )
  const years    = Math.abs(to.getFullYear() - from.getFullYear())

  // 정확한 년/월/일 분해
  const [start, end] = days >= 0 ? [from, to] : [to, from]
  let yy = end.getFullYear() - start.getFullYear()
  let mm = end.getMonth()    - start.getMonth()
  let dd = end.getDate()     - start.getDate()

  if (dd < 0) {
    mm--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    dd += prevMonth.getDate()
  }
  if (mm < 0) { yy--; mm += 12 }

  return { days, absDays, weeks, months, years, yy, mm, dd, isPast: days < 0, isZero: days === 0 }
}

export default function DiffClient() {
  const todayStr = new Date().toISOString().split('T')[0]
  const [from, setFrom] = useState(todayStr)
  const [to,   setTo]   = useState(todayStr)

  const result = useMemo(() => calcDiff(from, to), [from, to])

  const handleSwap = () => { setFrom(to); setTo(from) }

  return (
    <div className={styles.wrap}>

      {/* 날짜 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>시작 날짜</label>
        <input
          className={styles.dateInputFull}
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
        />
      </div>

      <button className={styles.swapDateBtn} onClick={handleSwap}>⇅ 날짜 교체</button>

      <div className={styles.card}>
        <label className={styles.cardLabel}>종료 날짜</label>
        <input
          className={styles.dateInputFull}
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
        />
      </div>

      {/* 결과 */}
      {result && (
        <>
          {result.isZero ? (
            <div className={styles.resultHero}>
              <div className={styles.resultHeroLabel}>같은 날짜입니다</div>
              <div className={styles.resultHeroNum}>0<span className={styles.resultHeroUnit}>일</span></div>
            </div>
          ) : (
            <>
              <div className={styles.resultHero}>
                <div className={styles.resultHeroLabel}>
                  {result.isPast ? '이전 날짜 기준 경과' : '남은 기간'}
                </div>
                <div className={styles.resultHeroNum}>
                  {result.absDays.toLocaleString()}<span className={styles.resultHeroUnit}>일</span>
                </div>
                <div className={styles.resultHeroSub}>
                  {result.yy > 0 && `${result.yy}년 `}
                  {result.mm > 0 && `${result.mm}개월 `}
                  {result.dd > 0 && `${result.dd}일`}
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoNum}>{result.absDays.toLocaleString()}</div>
                  <div className={styles.infoLabel}>일</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoNum}>{result.weeks.toLocaleString()}</div>
                  <div className={styles.infoLabel}>주</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoNum}>{result.months.toLocaleString()}</div>
                  <div className={styles.infoLabel}>개월</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoNum}>{result.years.toLocaleString()}</div>
                  <div className={styles.infoLabel}>년</div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}