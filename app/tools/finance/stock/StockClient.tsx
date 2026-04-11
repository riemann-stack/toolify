'use client'

import { useState, useMemo } from 'react'
import styles from './stock.module.css'

export default function StockClient() {
  const [avgPrice, setAvgPrice] = useState('')
  const [holding,  setHolding]  = useState('')
  const [curPrice, setCurPrice] = useState('')
  const [addQty,   setAddQty]   = useState('')   // ← 수량으로 변경

  const result = useMemo(() => {
    const avg = parseFloat(avgPrice.replace(/,/g, ''))
    const qty = parseFloat(holding.replace(/,/g, ''))
    const cur = parseFloat(curPrice.replace(/,/g, ''))
    const add = parseFloat(addQty.replace(/,/g, ''))
    if (!avg || !qty || !cur || !add || avg <= 0 || qty <= 0 || cur <= 0 || add <= 0) return null

    const totalCost  = avg * qty + cur * add
    const totalQty   = qty + add
    const newAvg     = totalCost / totalQty
    const beforeRate = ((cur - avg) / avg) * 100
    const afterRate  = ((cur - newAvg) / newAvg) * 100
    const addCost    = cur * add   // 추가 매수 비용

    return { addCost, newAvg, totalQty, totalCost, beforeRate, afterRate }
  }, [avgPrice, holding, curPrice, addQty])

  const fmt  = (n: number) => Math.round(n).toLocaleString()
  const fmtR = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

  return (
    <div className={styles.wrap}>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 평단가 (원)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="50000" value={avgPrice}
              onChange={e => setAvgPrice(e.target.value)} />
            <span className={styles.unit}>원</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>보유 수량 (주)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="100" value={holding}
              onChange={e => setHolding(e.target.value)} />
            <span className={styles.unit}>주</span>
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 주가 (원)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="40000" value={curPrice}
              onChange={e => setCurPrice(e.target.value)} />
            <span className={styles.unit}>원</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>추가 매수 수량 (주)</label>   {/* ← 변경 */}
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="25" value={addQty}
              onChange={e => setAddQty(e.target.value)} />
            <span className={styles.unit}>주</span>
          </div>
        </div>
      </div>

      {result ? (
        <>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>물타기 후 새 평단가</div>
            <div className={styles.heroNum}>{fmt(result.newAvg)}원</div>
            <div className={styles.heroSub}>
              추가 매수 {parseFloat(addQty).toLocaleString()}주 · 총 {result.totalQty.toLocaleString()}주 보유
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.rateCard}>
              <div className={styles.rateLabel}>물타기 전 수익률</div>
              <div className={styles.rateNum}
                style={{ color: result.beforeRate >= 0 ? '#3EFF9B' : '#FF6B6B' }}>
                {fmtR(result.beforeRate)}
              </div>
            </div>
            <div className={styles.rateCard}>
              <div className={styles.rateLabel}>물타기 후 수익률</div>
              <div className={styles.rateNum}
                style={{ color: result.afterRate >= 0 ? '#3EFF9B' : '#FF6B6B' }}>
                {fmtR(result.afterRate)}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.summaryGrid}>
              {[
                ['추가 매수 비용',  fmt(result.addCost) + '원'],
                ['총 투자 금액',    fmt(result.totalCost) + '원'],
                ['손익분기점',      fmt(result.newAvg) + '원'],
                ['총 보유 주수',    result.totalQty.toLocaleString() + '주'],
              ].map(([label, value]) => (
                <div key={label} className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>{label}</div>
                  <div className={styles.summaryValue}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>평단가, 보유 수량, 현재가, 추가 매수 수량을 입력하면 결과가 계산됩니다</div>
      )}
    </div>
  )
}