'use client'

import { useState, useMemo } from 'react'
import styles from '../date.module.css'

function calcAge(birthStr: string): {
  age: number
  nextBirthday: number   // 다음 생일까지 남은 일수
  totalDays: number
  isBirthdayToday: boolean
} | null {
  if (!birthStr) return null
  const birth = new Date(birthStr)
  if (isNaN(birth.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff   = today.getDate()  - birth.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--

  const isBirthdayToday = monthDiff === 0 && dayDiff === 0

  // 다음 생일
  const nextBirthYear = isBirthdayToday ? today.getFullYear() + 1 : (
    monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
      ? today.getFullYear()
      : today.getFullYear() + 1
  )
  const nextBirthday = new Date(nextBirthYear, birth.getMonth(), birth.getDate())
  const daysToNext = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000)

  const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86400000)

  return { age, nextBirthday: daysToNext, totalDays, isBirthdayToday }
}

// 태어난 연도 선택 옵션
const currentYear = new Date().getFullYear()
const years  = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days   = Array.from({ length: 31 }, (_, i) => i + 1)

export default function AgeClient() {
  const [year,  setYear]  = useState('')
  const [month, setMonth] = useState('')
  const [day,   setDay]   = useState('')

  const birthStr = year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : ''

  const result = useMemo(() => calcAge(birthStr), [birthStr])

  return (
    <div className={styles.wrap}>

      {/* 날짜 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>생년월일</label>
        <div className={styles.dateRow}>
          <select className={styles.dateSelect} value={year} onChange={e => setYear(e.target.value)}>
            <option value="">년도</option>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select className={styles.dateSelect} value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">월</option>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select className={styles.dateSelect} value={day} onChange={e => setDay(e.target.value)}>
            <option value="">일</option>
            {days.map(d => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <>
          {result.isBirthdayToday && (
            <div className={styles.birthdayBanner}>
              🎉 오늘은 생일입니다! 축하드립니다!
            </div>
          )}

          <div className={styles.resultHero}>
            <div className={styles.resultHeroLabel}>현재 만 나이</div>
            <div className={styles.resultHeroNum}>
              {result.age}<span className={styles.resultHeroUnit}>세</span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoNum}>{result.nextBirthday.toLocaleString()}</div>
              <div className={styles.infoLabel}>다음 생일까지</div>
              <div className={styles.infoSub}>일 남음</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoNum}>{result.totalDays.toLocaleString()}</div>
              <div className={styles.infoLabel}>태어난 지</div>
              <div className={styles.infoSub}>일째</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoNum}>{(result.age + 1)}</div>
              <div className={styles.infoLabel}>세는 나이</div>
              <div className={styles.infoSub}>기준 (한국)</div>
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className={styles.empty}>생년월일을 선택하면 만 나이가 바로 계산됩니다</div>
      )}
    </div>
  )
}