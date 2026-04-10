'use client'

import { useState, useMemo } from 'react'
import styles from './compound.module.css'

function formatWon(n: number) {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000)
    const man = Math.floor((n % 100_000_000) / 10_000)
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  return Math.floor(n / 10_000).toLocaleString() + '만원'
}

function calcCompound(
  principal: number,
  rate: number,
  years: number,
  monthly: number
) {
  const r = rate / 100 / 12
  const rows: { year: number; total: number; principal: number; interest: number }[] = []

  let total = principal
  for (let y = 1; y <= years; y++) {
    const months = y * 12
    // 거치 원금 복리
    const principalGrowth = principal * Math.pow(1 + r, months)
    // 적립식 복리
    const monthlyGrowth = monthly > 0
      ? monthly * ((Math.pow(1 + r, months) - 1) / r)
      : 0
    total = principalGrowth + monthlyGrowth
    const totalPrincipal = principal + monthly * months
    rows.push({
      year: y,
      total: Math.round(total),
      principal: Math.round(totalPrincipal),
      interest: Math.round(total - totalPrincipal),
    })
  }

  return rows
}

const RATE_PRESETS = [3, 5, 7, 10, 15]
const YEAR_PRESETS = [5, 10, 20, 30]

export default function CompoundClient() {
  const [principal, setPrincipal] = useState('')
  const [rate,      setRate]      = useState('')
  const [years,     setYears]     = useState('10')
  const [monthly,   setMonthly]   = useState('')

  const principalWon = parseFloat(principal.replace(/,/g, '')) * 10_000 || 0
  const monthlyWon   = parseFloat(monthly.replace(/,/g, ''))  * 10_000 || 0
  const rateNum      = parseFloat(rate) || 0
  const yearsNum     = parseInt(years)  || 0

  const rows = useMemo(() => {
    if (!principalWon || !rateNum || !yearsNum) return []
    return calcCompound(principalWon, rateNum, yearsNum, monthlyWon)
  }, [principalWon, rateNum, yearsNum, monthlyWon])

  const final = rows[rows.length - 1]

  return (
    <div className={styles.wrap}>

      {/* 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>초기 원금 (만원)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="1000" value={principal} onChange={e => setPrincipal(e.target.value)} />
          <span className={styles.unit}>만원</span>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>연 수익률 (%)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="7" value={rate} onChange={e => setRate(e.target.value)} step={0.1} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {RATE_PRESETS.map(r => (
              <button key={r}
                className={`${styles.presetBtn} ${rate === String(r) ? styles.presetActive : ''}`}
                onClick={() => setRate(String(r))}
              >{r}%</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>투자 기간</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="10" value={years} onChange={e => setYears(e.target.value)} />
            <span className={styles.unit}>년</span>
          </div>
          <div className={styles.presets}>
            {YEAR_PRESETS.map(y => (
              <button key={y}
                className={`${styles.presetBtn} ${years === String(y) ? styles.presetActive : ''}`}
                onClick={() => setYears(String(y))}
              >{y}년</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>월 적립액 (만원) — 선택</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="0 (없으면 비워두세요)" value={monthly}
            onChange={e => setMonthly(e.target.value)} />
          <span className={styles.unit}>만원</span>
        </div>
      </div>

      {/* 결과 */}
      {final && (
        <>
          <div className={styles.resultHero}>
            <div className={styles.resultLabel}>{yearsNum}년 후 최종 금액</div>
            <div className={styles.resultNum}>{formatWon(final.total)}</div>
            <div className={styles.resultSub}>
              원금 {formatWon(final.principal)} + 수익 {formatWon(final.interest)}
            </div>
            <div className={styles.resultRate}>
              수익률 {((final.interest / final.principal) * 100).toFixed(1)}%
            </div>
          </div>

          {/* 연도별 표 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>연도별 누적 금액</label>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>연도</span>
                <span>원금</span>
                <span>수익</span>
                <span>총 금액</span>
              </div>
              {rows.map(row => (
                <div key={row.year} className={styles.tableRow}>
                  <span className={styles.tableYear}>{row.year}년</span>
                  <span>{formatWon(row.principal)}</span>
                  <span style={{ color: '#3EFF9B' }}>{formatWon(row.interest)}</span>
                  <span style={{ fontWeight: 700 }}>{formatWon(row.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!final && (
        <div className={styles.empty}>원금과 수익률을 입력하면 복리 수익이 계산됩니다</div>
      )}
    </div>
  )
}