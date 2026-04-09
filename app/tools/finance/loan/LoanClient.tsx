'use client'

import { useState, useMemo } from 'react'
import { calcEqualPayment, calcEqualPrincipal } from '@/lib/loanCalc'
import styles from './loan.module.css'

function formatWon(n: number) { return n.toLocaleString('ko-KR') + '원' }

const PERIOD_PRESETS = [12, 24, 36, 60, 120, 240, 360]

export default function LoanClient() {
  const [principal,  setPrincipal]  = useState('')
  const [rate,       setRate]       = useState('')
  const [months,     setMonths]     = useState('')
  const [showAll,    setShowAll]    = useState(false)

  const principalWon = useMemo(() => {
    const n = parseFloat(principal.replace(/,/g, ''))
    return isNaN(n) ? 0 : n * 10_000
  }, [principal])

  const rateNum  = parseFloat(rate)   || 0
  const monthNum = parseInt(months)   || 0

  const ep  = useMemo(() => {
    if (!principalWon || !rateNum || !monthNum) return null
    return calcEqualPayment(principalWon, rateNum, monthNum)
  }, [principalWon, rateNum, monthNum])

  const epr = useMemo(() => {
    if (!principalWon || !rateNum || !monthNum) return null
    return calcEqualPrincipal(principalWon, rateNum, monthNum)
  }, [principalWon, rateNum, monthNum])

  const displaySchedule = showAll ? ep?.schedule : ep?.schedule.slice(0, 12)

  return (
    <div className={styles.wrap}>

      {/* 입력 */}
      {/* 수정 */}
      <div className={styles.threeCol}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>대출 원금 (만원)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30000" value={principal}
              onChange={e => setPrincipal(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>연 금리 (%)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="3.5" value={rate}
              onChange={e => setRate(e.target.value)} step={0.1} />
            <span className={styles.unit}>%</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>대출 기간</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="360" value={months}
              onChange={e => setMonths(e.target.value)} />
            <span className={styles.unit}>개월</span>
          </div>
        </div>
      </div>

      {/* 기간 프리셋은 별도 카드로 분리 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>기간 빠른 선택</label>
        <div className={styles.presets}>
          {PERIOD_PRESETS.map(m => (
            <button
              key={m}
              className={`${styles.presetBtn} ${months === String(m) ? styles.presetActive : ''}`}
              onClick={() => setMonths(String(m))}
            >
              {m >= 12 ? `${m/12}년` : `${m}개월`}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 비교 */}
      {ep && epr && (
        <>
          <div className={styles.compareGrid}>
            {/* 원리금균등 */}
            <div className={styles.compareCard}>
              <div className={styles.compareTitle}>원리금균등</div>
              <div className={styles.compareDesc}>매달 동일 납입</div>
              <div className={styles.compareMain}>{formatWon(ep.monthlyPayment!)}</div>
              <div className={styles.compareLabel}>월 납입액 (고정)</div>
              <div className={styles.compareDivider} />
              <div className={styles.compareRow}>
                <span>총 상환액</span>
                <span>{formatWon(ep.totalPayment)}</span>
              </div>
              <div className={`${styles.compareRow} ${styles.compareInterest}`}>
                <span>총 이자</span>
                <span>{formatWon(ep.totalInterest)}</span>
              </div>
            </div>

            {/* 원금균등 */}
            <div className={`${styles.compareCard} ${styles.compareCardAccent}`}>
              <div className={styles.compareTitle}>원금균등</div>
              <div className={styles.compareDesc}>이자 절약</div>
              <div className={styles.compareMain}>{formatWon(epr.firstPayment!)}</div>
              <div className={styles.compareLabel}>첫달 납입액</div>
              <div className={styles.compareDivider} />
              <div className={styles.compareRow}>
                <span>총 상환액</span>
                <span>{formatWon(epr.totalPayment)}</span>
              </div>
              <div className={`${styles.compareRow} ${styles.compareInterest}`}>
                <span>총 이자</span>
                <span>{formatWon(epr.totalInterest)}</span>
              </div>
              <div className={styles.savingBadge}>
                이자 {formatWon(ep.totalInterest - epr.totalInterest)} 절약
              </div>
            </div>
          </div>

          {/* 월별 상환 스케줄 (원리금균등 기준) */}
          <div className={styles.card}>
            <div className={styles.scheduleHeader}>
              <label className={styles.cardLabel}>월별 상환 내역 (원리금균등)</label>
            </div>
            <div className={styles.scheduleTable}>
              <div className={styles.scheduleHead}>
                <span>회차</span>
                <span>원금</span>
                <span>이자</span>
                <span>납입액</span>
                <span>잔액</span>
              </div>
              {displaySchedule?.map(row => (
                <div key={row.month} className={styles.scheduleRow}>
                  <span>{row.month}회</span>
                  <span>{row.principal.toLocaleString()}</span>
                  <span>{row.interest.toLocaleString()}</span>
                  <span>{row.total.toLocaleString()}</span>
                  <span>{row.remaining.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {ep.schedule.length > 12 && (
              <button className={styles.showAllBtn} onClick={() => setShowAll(v => !v)}>
                {showAll ? '접기 ↑' : `전체 ${ep.schedule.length}회 보기 ↓`}
              </button>
            )}
          </div>
        </>
      )}

      {!ep && (
        <div className={styles.empty}>대출 원금, 금리, 기간을 입력하면 계산됩니다</div>
      )}
    </div>
  )
}