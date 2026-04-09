'use client'

import { useState, useCallback } from 'react'
import styles from './converter.module.css'

export interface Unit {
  label: string
  symbol: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

interface Props {
  units: Unit[]
  defaultFrom?: number
  defaultTo?: number
}

export default function ConverterUI({ units, defaultFrom = 0, defaultTo = 1 }: Props) {
  const [fromIdx, setFromIdx] = useState(defaultFrom)
  const [toIdx,   setToIdx]   = useState(defaultTo)
  const [inputVal, setInputVal] = useState('')

  const convert = useCallback((raw: string, fIdx: number, tIdx: number): string => {
    const num = parseFloat(raw)
    if (isNaN(num) || raw === '') return ''
    const base   = units[fIdx].toBase(num)
    const result = units[tIdx].fromBase(base)
    if (Number.isInteger(result)) return result.toLocaleString()
    const fixed = parseFloat(result.toPrecision(8))
    return fixed.toLocaleString('ko-KR', { maximumFractionDigits: 8 })
  }, [units])

  const handleSwap = () => {
    setFromIdx(toIdx)
    setToIdx(fromIdx)
  }

  const result = convert(inputVal, fromIdx, toIdx)

  return (
    <div className={styles.wrap}>

      {/* FROM */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>변환할 값</label>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            placeholder="숫자 입력"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          <select
            className={styles.select}
            value={fromIdx}
            onChange={e => setFromIdx(Number(e.target.value))}
          >
            {units.map((u, i) => (
              <option key={i} value={i}>{u.symbol} — {u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SWAP */}
      <button className={styles.swapBtn} onClick={handleSwap} title="단위 교체">
        ⇅
      </button>

      {/* TO */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>변환 결과</label>
        <div className={styles.row}>
          <div className={styles.result}>
            {result !== '' ? result : <span className={styles.placeholder}>—</span>}
          </div>
          <select
            className={styles.select}
            value={toIdx}
            onChange={e => setToIdx(Number(e.target.value))}
          >
            {units.map((u, i) => (
              <option key={i} value={i}>{u.symbol} — {u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 결과 한 줄 요약 */}
      {result !== '' && inputVal !== '' && (
        <div className={styles.summary}>
          <span className={styles.summaryNum}>{parseFloat(inputVal).toLocaleString()}</span>
          <span className={styles.summaryUnit}>{units[fromIdx].symbol}</span>
          <span className={styles.summaryEq}>=</span>
          <span className={styles.summaryNum}>{result}</span>
          <span className={styles.summaryUnit}>{units[toIdx].symbol}</span>
        </div>
      )}

      {/* 전체 단위 빠른 참조표 */}
      {inputVal !== '' && (
        <div className={styles.table}>
          <div className={styles.tableTitle}>전체 단위 변환표</div>
          {units.map((u, i) => {
            if (i === fromIdx) return null
            const val = convert(inputVal, fromIdx, i)
            return (
              <div key={i} className={styles.tableRow}>
                <span className={styles.tableUnit}>{u.symbol}</span>
                <span className={styles.tableVal}>{val}</span>
                <span className={styles.tableLabel}>{u.label}</span>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}