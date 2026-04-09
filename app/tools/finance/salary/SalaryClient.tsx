'use client'

import { useState, useMemo } from 'react'
import { calcSalary } from '@/lib/salaryCalc'
import styles from './salary.module.css'

const PRESET_SALARIES = [30, 35, 40, 45, 50, 60, 70, 80, 100]

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

function formatEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000)
    const man = Math.floor((n % 100_000_000) / 10_000)
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  return Math.floor(n / 10_000).toLocaleString() + '만원'
}

export default function SalaryClient() {
  const [annualInput, setAnnualInput] = useState('')
  const [dependents, setDependents] = useState(1)

  const annual = useMemo(() => {
    const n = parseFloat(annualInput.replace(/,/g, ''))
    return isNaN(n) ? 0 : n * 10_000
  }, [annualInput])

  const result = useMemo(() => {
    if (annual <= 0) return null
    return calcSalary(annual, dependents)
  }, [annual, dependents])

  const handlePreset = (manwon: number) => {
    setAnnualInput(manwon.toLocaleString())
  }

  return (
    <div className={styles.wrap}>

      {/* 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>연봉 입력 (만원)</label>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            placeholder="예: 4000"
            value={annualInput}
            onChange={e => setAnnualInput(e.target.value)}
          />
          <span className={styles.inputUnit}>만원</span>
        </div>

        {/* 프리셋 버튼 */}
        <div className={styles.presets}>
          {PRESET_SALARIES.map(v => (
            <button
              key={v}
              className={`${styles.presetBtn} ${annualInput === v.toLocaleString() ? styles.presetActive : ''}`}
              onClick={() => handlePreset(v * 100)}
            >
              {v * 100 >= 10000 ? `${v * 100 / 10000}억` : `${v * 100}만`}
            </button>
          ))}
        </div>
      </div>

      {/* 부양가족 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>부양가족 수 (본인 포함)</label>
        <div className={styles.dependentRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`${styles.depBtn} ${dependents === n ? styles.depActive : ''}`}
              onClick={() => setDependents(n)}
            >
              {n}명
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <>
          {/* 핵심 결과 */}
          <div className={styles.resultHero}>
            <div className={styles.resultHeroLabel}>월 실수령액</div>
            <div className={styles.resultHeroNum}>
              {formatWon(result.monthlyNet)}
            </div>
            <div className={styles.resultHeroSub}>
              연 {formatEok(result.annualNet)} · 공제율 {result.effectiveRate.toFixed(1)}%
            </div>
          </div>

          {/* 월급 흐름 */}
          <div className={styles.flowRow}>
            <div className={styles.flowBox}>
              <span className={styles.flowLabel}>월 총급여</span>
              <span className={styles.flowNum}>{formatWon(result.monthlyGross)}</span>
            </div>
            <span className={styles.flowMinus}>−</span>
            <div className={styles.flowBox}>
              <span className={styles.flowLabel}>총 공제액</span>
              <span className={`${styles.flowNum} ${styles.red}`}>{formatWon(result.totalDeduction)}</span>
            </div>
            <span className={styles.flowEq}>=</span>
            <div className={`${styles.flowBox} ${styles.flowBoxAccent}`}>
              <span className={styles.flowLabel}>실수령액</span>
              <span className={`${styles.flowNum} ${styles.accent}`}>{formatWon(result.monthlyNet)}</span>
            </div>
          </div>

          {/* 상세 공제 내역 */}
          <div className={styles.detail}>
            <div className={styles.detailTitle}>공제 내역 상세</div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>4대보험</div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>국민연금</span>
                <span className={styles.detailVal}>{formatWon(result.nationalPension)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>건강보험</span>
                <span className={styles.detailVal}>{formatWon(result.healthInsurance)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>장기요양보험</span>
                <span className={styles.detailVal}>{formatWon(result.longTermCare)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>고용보험</span>
                <span className={styles.detailVal}>{formatWon(result.employmentIns)}</span>
              </div>
              <div className={`${styles.detailRow} ${styles.detailSubtotal}`}>
                <span className={styles.detailName}>4대보험 소계</span>
                <span className={styles.detailVal}>{formatWon(result.totalInsurance)}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>세금</div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>근로소득세</span>
                <span className={styles.detailVal}>{formatWon(result.incomeTax)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailName}>지방소득세</span>
                <span className={styles.detailVal}>{formatWon(result.localIncomeTax)}</span>
              </div>
              <div className={`${styles.detailRow} ${styles.detailSubtotal}`}>
                <span className={styles.detailName}>세금 소계</span>
                <span className={styles.detailVal}>{formatWon(result.totalTax)}</span>
              </div>
            </div>

            <div className={`${styles.detailRow} ${styles.detailTotal}`}>
              <span className={styles.detailName}>총 공제액</span>
              <span className={styles.detailVal}>{formatWon(result.totalDeduction)}</span>
            </div>
          </div>
        </>
      )}

      {/* 입력 안내 */}
      {!result && (
        <div className={styles.empty}>
          위에 연봉을 입력하면 실수령액이 바로 계산됩니다
        </div>
      )}

    </div>
  )
}