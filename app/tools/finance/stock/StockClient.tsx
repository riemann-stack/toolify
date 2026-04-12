'use client'

import { useState, useMemo } from 'react'
import styles from './stock.module.css'

export default function StockClient() {
  const [avgPrice,  setAvgPrice]  = useState('')
  const [holding,   setHolding]   = useState('')
  const [curPrice,  setCurPrice]  = useState('')
  const [addQty,    setAddQty]    = useState('')
  // 수수료
  const [feeOn,     setFeeOn]     = useState(false)
  const [feeRate,   setFeeRate]   = useState('0.015')

  const result = useMemo(() => {
    const avg  = parseFloat(avgPrice.replace(/,/g, ''))
    const qty  = parseFloat(holding.replace(/,/g, ''))
    const cur  = parseFloat(curPrice.replace(/,/g, ''))
    const add  = parseFloat(addQty.replace(/,/g, ''))
    const fee  = feeOn ? (parseFloat(feeRate) || 0) / 100 : 0

    if (!avg || !qty || !cur || !add || avg <= 0 || qty <= 0 || cur <= 0 || add <= 0) return null

    // 수수료 포함 실제 매수 단가
    const curPriceWithFee = cur * (1 + fee)

    const totalCost  = avg * qty + curPriceWithFee * add
    const totalQty   = qty + add
    const newAvg     = totalCost / totalQty

    // 수익률 (현재가 기준, 매도 수수료도 고려)
    const sellPrice  = cur * (1 - fee)
    const beforeRate = ((sellPrice - avg) / avg) * 100
    const afterRate  = ((sellPrice - newAvg) / newAvg) * 100

    // 탈출(본전)을 위해 필요한 상승률
    // 매도 시 수수료를 내야 하므로: cur × (1 + x) × (1 - fee) = newAvg → x 계산
    const escapeRateBefore = feeOn
      ? ((avg / (1 - fee)) / cur - 1) * 100
      : ((avg - cur) / cur) * 100
    const escapeRateAfter  = feeOn
      ? ((newAvg / (1 - fee)) / cur - 1) * 100
      : ((newAvg - cur) / cur) * 100

    const addCost = curPriceWithFee * add

    return {
      newAvg, totalQty, totalCost, addCost,
      beforeRate, afterRate,
      escapeRateBefore, escapeRateAfter,
      feeApplied: feeOn && fee > 0,
    }
  }, [avgPrice, holding, curPrice, addQty, feeOn, feeRate])

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
          <label className={styles.cardLabel}>추가 매수 수량 (주)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="25" value={addQty}
              onChange={e => setAddQty(e.target.value)} />
            <span className={styles.unit}>주</span>
          </div>
        </div>
      </div>

      {/* 수수료 옵션 */}
      <div className={styles.card}>
        <div className={styles.feeRow}>
          <label className={styles.feeToggle}>
            <input type="checkbox" checked={feeOn}
              onChange={e => setFeeOn(e.target.checked)} />
            <span className={styles.feeLabel}>증권사 수수료 포함</span>
          </label>
          {feeOn && (
            <div className={styles.feeInputWrap}>
              <input className={styles.feeInput} type="number" inputMode="decimal"
                value={feeRate} step={0.001}
                onChange={e => setFeeRate(e.target.value)} />
              <span className={styles.feeUnit}>%</span>
            </div>
          )}
        </div>
        {feeOn && (
          <p className={styles.feeHint}>
            매수·매도 각각 적용됩니다. 기본값 0.015%는 국내 주요 증권사 온라인 기준입니다.
          </p>
        )}
      </div>

      {result ? (
        <>
          {/* 새 평단가 */}
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>물타기 후 새 평단가</div>
            <div className={styles.heroNum}>{fmt(result.newAvg)}원</div>
            <div className={styles.heroSub}>
              추가 매수 {parseFloat(addQty || '0').toLocaleString()}주 · 총 {result.totalQty.toLocaleString()}주 보유
              {result.feeApplied && <span className={styles.feeBadge}>수수료 포함</span>}
            </div>
          </div>

          {/* 수익률 비교 */}
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

          {/* 탈출 필요 상승률 */}
          <div className={styles.escapeCard}>
            <div className={styles.escapeTitle}>📈 본전을 위해 필요한 상승률</div>
            <div className={styles.escapeRow}>
              <div className={styles.escapeItem}>
                <div className={styles.escapeLabel}>물타기 전</div>
                <div className={styles.escapeRate} style={{ color: '#FF6B6B' }}>
                  {result.escapeRateBefore > 0
                    ? `+${result.escapeRateBefore.toFixed(1)}% 상승 필요`
                    : '이미 수익 구간'}
                </div>
              </div>
              <div className={styles.escapeArrow}>→</div>
              <div className={styles.escapeItem}>
                <div className={styles.escapeLabel}>물타기 후</div>
                <div className={styles.escapeRate} style={{ color: '#C8FF3E' }}>
                  {result.escapeRateAfter > 0
                    ? `+${result.escapeRateAfter.toFixed(1)}% 상승 필요`
                    : '이미 수익 구간'}
                </div>
              </div>
            </div>
            {result.escapeRateBefore > result.escapeRateAfter && result.escapeRateAfter > 0 && (
              <div className={styles.escapeDiff}>
                물타기로 본전 목표 상승률 {(result.escapeRateBefore - result.escapeRateAfter).toFixed(1)}%p 감소
              </div>
            )}
          </div>

          {/* 요약 */}
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