'use client'

import { useState, useMemo } from 'react'
import styles from '../health.module.css'

interface BmiResult {
  bmi: number
  category: string
  color: string
  desc: string
  idealMin: number
  idealMax: number
}

function calcBmi(height: number, weight: number): BmiResult {
  const h = height / 100
  const bmi = weight / (h * h)

  let category: string, color: string, desc: string
  if (bmi < 18.5) {
    category = '저체중'; color = '#3EC8FF'
    desc = '체중이 다소 부족합니다. 균형 잡힌 식단으로 적절한 체중을 유지하세요.'
  } else if (bmi < 23) {
    category = '정상'; color = '#3EFF9B'
    desc = '건강한 체중 범위입니다. 현재 생활습관을 유지하세요.'
  } else if (bmi < 25) {
    category = '과체중'; color = '#C8FF3E'
    desc = '정상 범위를 약간 초과했습니다. 규칙적인 운동을 권장합니다.'
  } else if (bmi < 30) {
    category = '비만 1단계'; color = '#FF8C3E'
    desc = '비만 범위입니다. 식이 조절과 운동으로 체중 감량을 권장합니다.'
  } else {
    category = '비만 2단계'; color = '#FF3E3E'
    desc = '고도비만 범위입니다. 전문의와 상담을 권장합니다.'
  }

  const idealMin = Math.round(18.5 * h * h * 10) / 10
  const idealMax = Math.round(22.9 * h * h * 10) / 10

  return { bmi: Math.round(bmi * 10) / 10, category, color, desc, idealMin, idealMax }
}

const BMI_RANGES = [
  { label: '저체중',    max: 18.5, color: '#3EC8FF' },
  { label: '정상',      max: 23,   color: '#3EFF9B' },
  { label: '과체중',    max: 25,   color: '#C8FF3E' },
  { label: '비만1',     max: 30,   color: '#FF8C3E' },
  { label: '비만2',     max: 40,   color: '#FF3E3E' },
]

export default function BmiClient() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const result = useMemo<BmiResult | null>(() => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w || h < 100 || h > 250 || w < 20 || w > 300) return null
    return calcBmi(h, w)
  }, [height, weight])

  // BMI 게이지 위치 (0~40 범위 기준 %)
  const gaugePos = result ? Math.min(Math.max((result.bmi / 40) * 100, 0), 100) : null

  return (
    <div className={styles.wrap}>

      {/* 입력 */}
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
              min={100} max={250}
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
              min={20} max={300}
            />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <>
          <div className={styles.resultHero} style={{ borderColor: `${result.color}40` }}>
            <div className={styles.resultHeroLabel}>BMI 지수</div>
            <div className={styles.resultHeroNum} style={{ color: result.color }}>
              {result.bmi}
            </div>
            <div className={styles.resultCategory} style={{ color: result.color }}>
              {result.category}
            </div>
            <div className={styles.resultDesc}>{result.desc}</div>
          </div>

          {/* 게이지 */}
          <div className={styles.gaugeWrap}>
            <div className={styles.gaugeBar}>
              {BMI_RANGES.map((r, i) => (
                <div
                  key={i}
                  className={styles.gaugeSegment}
                  style={{ flex: i === 4 ? 2 : 1, background: r.color, opacity: 0.7 }}
                />
              ))}
              {gaugePos !== null && (
                <div className={styles.gaugeThumb} style={{ left: `${gaugePos}%` }} />
              )}
            </div>
            <div className={styles.gaugeLabels}>
              {BMI_RANGES.map(r => (
                <div key={r.label} className={styles.gaugeLabel}>{r.label}</div>
              ))}
            </div>
          </div>

          {/* 정상 체중 범위 */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoNum}>{result.idealMin}</div>
              <div className={styles.infoLabel}>정상 체중 최소</div>
              <div className={styles.infoSub}>kg (BMI 18.5)</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoNum}>{result.idealMax}</div>
              <div className={styles.infoLabel}>정상 체중 최대</div>
              <div className={styles.infoSub}>kg (BMI 22.9)</div>
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className={styles.empty}>키와 체중을 입력하면 BMI가 계산됩니다</div>
      )}
    </div>
  )
}