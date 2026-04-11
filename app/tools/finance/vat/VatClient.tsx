'use client'

import { useState, useMemo } from 'react'
import styles from './vat.module.css'

type Mode = 'add' | 'remove' | 'calc'

export default function VatClient() {
  const [mode,   setMode]   = useState<Mode>('add')
  const [amount, setAmount] = useState('')
  const [rate,   setRate]   = useState('10')

  const RATE_PRESETS = ['10', '0']

  const result = useMemo(() => {
    const a = parseFloat(amount.replace(/,/g, ''))
    const r = parseFloat(rate) / 100
    if (!a || a <= 0 || isNaN(r)) return null

    if (mode === 'add') {
      // 공급가액 입력 → 부가세 + 합계 계산
      const vat   = Math.round(a * r)
      const total = a + vat
      return { supplyPrice: a, vat, total }
    } else if (mode === 'remove') {
      // 부가세 포함 금액 입력 → 공급가액 + 부가세 역산
      const supplyPrice = Math.round(a / (1 + r))
      const vat         = a - supplyPrice
      return { supplyPrice, vat, total: a }
    } else {
      // 부가세만 계산 (공급가액 × 세율)
      const vat = Math.round(a * r)
      return { supplyPrice: a, vat, total: a + vat }
    }
  }, [mode, amount, rate])

  const fmt = (n: number) => n.toLocaleString()

  return (
    <div className={styles.wrap}>

      {/* 계산 모드 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>계산 방식</label>
        <div className={styles.modeGrid}>
          {[
            { v: 'add',    label: '부가세 추가',   desc: '공급가액 → 합계' },
            { v: 'remove', label: '부가세 제거',   desc: '합계 → 공급가액' },
            { v: 'calc',   label: '부가세만 계산', desc: '공급가액 × 세율' },
          ].map(m => (
            <button key={m.v}
              className={`${styles.modeBtn} ${mode === m.v ? styles.modeBtnActive : ''}`}
              onClick={() => setMode(m.v as Mode)}>
              <span className={styles.modeBtnLabel}>{m.label}</span>
              <span className={styles.modeBtnDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 금액 입력 */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            {mode === 'remove' ? '부가세 포함 금액 (원)' : '공급가액 (원)'}
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="100000" value={amount}
              onChange={e => setAmount(e.target.value)} />
            <span className={styles.unit}>원</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>부가세율 (%)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="10" value={rate}
              onChange={e => setRate(e.target.value)} step={0.1} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {RATE_PRESETS.map(r => (
              <button key={r}
                className={`${styles.presetBtn} ${rate === r ? styles.presetActive : ''}`}
                onClick={() => setRate(r)}>
                {r === '0' ? '면세 (0%)' : `일반 (${r}%)`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>공급가액</div>
              <div className={styles.resultValue}>{fmt(result.supplyPrice)}원</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>부가세 ({rate}%)</div>
              <div className={`${styles.resultValue} ${styles.vatValue}`}>
                {fmt(result.vat)}원
              </div>
            </div>
            <div className={styles.resultItemFull}>
              <div className={styles.resultLabel}>합계 금액</div>
              <div className={`${styles.resultValue} ${styles.totalValue}`}>
                {fmt(result.total)}원
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>금액을 입력하면 부가세가 계산됩니다</div>
      )}
    </div>
  )
}