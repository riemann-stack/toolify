'use client'

import { useState, useMemo } from 'react'
import styles from './vat.module.css'

type Mode   = 'add' | 'remove' | 'calc'
type Trunc  = 'none' | '10' | '100' | '1000'

export default function VatClient() {
  const [mode,   setMode]   = useState<Mode>('add')
  const [amount, setAmount] = useState('')
  const [rate,   setRate]   = useState('10')
  const [trunc,  setTrunc]  = useState<Trunc>('none')

  const RATE_PRESETS = ['10', '0']

  const truncate = (n: number, t: Trunc) => {
    if (t === 'none') return n
    const unit = parseInt(t)
    return Math.floor(n / unit) * unit
  }

  const result = useMemo(() => {
    const a = parseFloat(amount.replace(/,/g, ''))
    const r = parseFloat(rate) / 100
    if (!a || a <= 0 || isNaN(r)) return null

    let supplyPrice: number, vat: number, total: number

    if (mode === 'add') {
      // 공급가액 입력 → 부가세 + 합계
      supplyPrice = a
      vat         = truncate(Math.round(a * r), trunc)
      total       = supplyPrice + vat
    } else if (mode === 'remove') {
      // 합계(공급대가) 역산 → 공급가액 + 부가세
      // 공급가액 = 공급대가 / (1 + r)
      supplyPrice = truncate(Math.round(a / (1 + r)), trunc)
      vat         = a - supplyPrice
      total       = a
    } else {
      // 부가세만 계산
      supplyPrice = a
      vat         = truncate(Math.round(a * r), trunc)
      total       = supplyPrice + vat
    }

    return { supplyPrice, vat, total }
  }, [mode, amount, rate, trunc])

  const fmt = (n: number) => Math.round(n).toLocaleString()

  return (
    <div className={styles.wrap}>

      {/* 계산 모드 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>계산 방식</label>
        <div className={styles.modeGrid}>
          {[
            { v: 'add',    label: '부가세 추가',   desc: '공급가액 → 합계' },
            { v: 'remove', label: '부가세 역산',   desc: '합계 → 공급가액' },
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

      <div className={styles.grid2}>
        {/* 금액 입력 */}
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            {mode === 'remove' ? '공급대가 (합계금액, 원)' : '공급가액 (원)'}
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="100000" value={amount}
              onChange={e => setAmount(e.target.value)} />
            <span className={styles.unit}>원</span>
          </div>
        </div>

        {/* 세율 */}
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

      {/* 절사 옵션 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>부가세 절사 옵션</label>
        <div className={styles.truncRow}>
          {[
            { v: 'none', label: '절사 없음' },
            { v: '10',   label: '10원 단위 절사' },
            { v: '100',  label: '100원 단위 절사' },
            { v: '1000', label: '1,000원 단위 절사' },
          ].map(opt => (
            <button key={opt.v}
              className={`${styles.truncBtn} ${trunc === opt.v ? styles.truncActive : ''}`}
              onClick={() => setTrunc(opt.v as Trunc)}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className={styles.truncHint}>
          세금계산서 발행 시 부가세는 원 단위 이하를 절사(버림)하는 것이 일반적입니다.
        </p>
      </div>

      {/* 결과 */}
      {result ? (
        <>
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
                <div className={styles.resultLabel}>합계 금액 (공급대가)</div>
                <div className={`${styles.resultValue} ${styles.totalValue}`}>
                  {fmt(result.total)}원
                </div>
              </div>
            </div>
          </div>

          {/* 역산 공식 안내 (remove 모드일 때만) */}
          {mode === 'remove' && (
            <div className={styles.formulaBox}>
              <p className={styles.formulaTitle}>📐 역산 공식</p>
              <p className={styles.formulaLine}>
                공급가액 = {fmt(result.total)}원 ÷ 1.{rate.replace('.', '')} = <strong>{fmt(result.supplyPrice)}원</strong>
              </p>
              <p className={styles.formulaLine}>
                부가세 = {fmt(result.total)}원 − {fmt(result.supplyPrice)}원 = <strong>{fmt(result.vat)}원</strong>
              </p>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>금액을 입력하면 부가세가 계산됩니다</div>
      )}
    </div>
  )
}