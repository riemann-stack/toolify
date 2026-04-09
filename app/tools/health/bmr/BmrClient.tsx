'use client'

import { useState, useMemo } from 'react'
import styles from '../health.module.css'

const ACTIVITY_LEVELS = [
  { label: '거의 안 움직임',   desc: '사무직, 운동 없음',     factor: 1.2   },
  { label: '가벼운 활동',      desc: '주 1~3회 운동',         factor: 1.375 },
  { label: '보통 활동',        desc: '주 3~5회 운동',         factor: 1.55  },
  { label: '활동적',           desc: '주 6~7회 강도 운동',    factor: 1.725 },
  { label: '매우 활동적',      desc: '하루 2회 운동·육체노동', factor: 1.9   },
]

function calcBmr(gender: 'male' | 'female', height: number, weight: number, age: number) {
  // Harris-Benedict (Revised) 공식
  const bmr = gender === 'male'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
  return Math.round(bmr)
}

export default function BmrClient() {
  const [gender, setGender]   = useState<'male' | 'female'>('male')
  const [height, setHeight]   = useState('')
  const [weight, setWeight]   = useState('')
  const [age,    setAge]      = useState('')
  const [actIdx, setActIdx]   = useState(1)

  const result = useMemo(() => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const a = parseInt(age)
    if (!h || !w || !a || h < 100 || h > 250 || w < 20 || w > 300 || a < 10 || a > 100) return null
    const bmr  = calcBmr(gender, h, w, a)
    const tdee = Math.round(bmr * ACTIVITY_LEVELS[actIdx].factor)
    const diet = tdee - 500
    const bulk = tdee + 300
    return { bmr, tdee, diet, bulk }
  }, [gender, height, weight, age, actIdx])

  return (
    <div className={styles.wrap}>

      {/* 성별 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>성별</label>
        <div className={styles.genderRow}>
          <button
            className={`${styles.genderBtn} ${gender === 'male' ? styles.genderActive : ''}`}
            onClick={() => setGender('male')}
          >
            👨 남성
          </button>
          <button
            className={`${styles.genderBtn} ${gender === 'female' ? styles.genderActive : ''}`}
            onClick={() => setGender('female')}
          >
            👩 여성
          </button>
        </div>
      </div>

      {/* 신체 정보 */}
      <div className={styles.inputGrid}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>키</label>
          <div className={styles.inputRow}>
            <input
              className={styles.numInput}
              type="number"
              inputMode="decimal"
              placeholder="170"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
            <span className={styles.unit}>cm</span>
          </div>
        </div>

        <div className={styles.card}>
          <label className={styles.cardLabel}>체중</label>
          <div className={styles.inputRow}>
            <input
              className={styles.numInput}
              type="number"
              inputMode="decimal"
              placeholder="65"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
            <span className={styles.unit}>kg</span>
          </div>
        </div>

        <div className={styles.card}>
          <label className={styles.cardLabel}>나이</label>
          <div className={styles.inputRow}>
            <input
              className={styles.numInput}
              type="number"
              inputMode="numeric"
              placeholder="30"
              value={age}
              onChange={e => setAge(e.target.value)}
            />
            <span className={styles.unit}>세</span>
          </div>
        </div>
      </div>


      {/* 활동량 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>활동 수준</label>
        <div className={styles.activityList}>
          {ACTIVITY_LEVELS.map((a, i) => (
            <button
              key={i}
              className={`${styles.activityBtn} ${actIdx === i ? styles.activityActive : ''}`}
              onClick={() => setActIdx(i)}
            >
              <span className={styles.activityLabel}>{a.label}</span>
              <span className={styles.activityDesc}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <>
          <div className={styles.resultHero}>
            <div className={styles.resultHeroLabel}>기초대사량 (BMR)</div>
            <div className={styles.resultHeroNum}>{result.bmr.toLocaleString()}</div>
            <div className={styles.resultHeroUnit}>kcal / 일</div>
          </div>

          <div className={styles.tdeeGrid}>
            <div className={`${styles.tdeeCard} ${styles.tdeeMaintain}`}>
              <div className={styles.tdeeLabel}>유지 칼로리 (TDEE)</div>
              <div className={styles.tdeeNum}>{result.tdee.toLocaleString()}</div>
              <div className={styles.tdeeSub}>kcal</div>
            </div>
            <div className={`${styles.tdeeCard} ${styles.tdeeDiet}`}>
              <div className={styles.tdeeLabel}>다이어트</div>
              <div className={styles.tdeeNum}>{result.diet.toLocaleString()}</div>
              <div className={styles.tdeeSub}>kcal (−500)</div>
            </div>
            <div className={`${styles.tdeeCard} ${styles.tdeeBulk}`}>
              <div className={styles.tdeeLabel}>벌크업</div>
              <div className={styles.tdeeNum}>{result.bulk.toLocaleString()}</div>
              <div className={styles.tdeeSub}>kcal (+300)</div>
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className={styles.empty}>성별, 키, 체중, 나이를 입력하면 기초대사량이 계산됩니다</div>
      )}
    </div>
  )
}