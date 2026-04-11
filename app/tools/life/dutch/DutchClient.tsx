'use client'

import { useState, useMemo } from 'react'
import styles from './dutch.module.css'

export default function DutchClient() {
  const [total,    setTotal]    = useState('')
  const [people,   setPeople]   = useState('4')
  const [alcohol,  setAlcohol]  = useState('')
  const [round,    setRound]    = useState<'none' | '100' | '1000'>('100')
  const [alcoholSplit, setAlcoholSplit] = useState(false)

  const PEOPLE_PRESETS = [2, 3, 4, 5, 6, 8, 10]

  const result = useMemo(() => {
    const tot  = parseFloat(total.replace(/,/g, ''))
    const ppl  = parseInt(people)
    const alc  = parseFloat(alcohol.replace(/,/g, '')) || 0
    if (!tot || !ppl || tot <= 0 || ppl <= 1) return null

    const foodTotal = alcoholSplit && alc > 0 ? tot - alc : tot
    const alcoholPerPerson = alcoholSplit && alc > 0 ? alc / ppl : 0
    let perPerson = foodTotal / ppl + alcoholPerPerson

    if (round === '100')  perPerson = Math.ceil(perPerson / 100) * 100
    if (round === '1000') perPerson = Math.ceil(perPerson / 1000) * 1000

    const actualTotal = perPerson * ppl
    const diff = actualTotal - tot

    return { perPerson, actualTotal, diff, foodTotal, alcoholPerPerson }
  }, [total, people, alcohol, round, alcoholSplit])

  const fmt = (n: number) => Math.round(n).toLocaleString()

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <label className={styles.cardLabel}>총 금액 (원)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="150000" value={total} onChange={e => setTotal(e.target.value)} />
          <span className={styles.unit}>원</span>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>인원 수</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="4" value={people} onChange={e => setPeople(e.target.value)} min={2} max={100} />
          <span className={styles.unit}>명</span>
        </div>
        <div className={styles.presets}>
          {PEOPLE_PRESETS.map(p => (
            <button key={p}
              className={`${styles.presetBtn} ${people === String(p) ? styles.presetActive : ''}`}
              onClick={() => setPeople(String(p))}>{p}명</button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>술값 (원) — 선택</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="0 (없으면 비워두세요)" value={alcohol}
            onChange={e => setAlcohol(e.target.value)} />
          <span className={styles.unit}>원</span>
        </div>
        {alcohol && parseFloat(alcohol) > 0 && (
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={alcoholSplit}
              onChange={e => setAlcoholSplit(e.target.checked)} />
            술값 n빵으로 별도 계산
          </label>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>1원 단위 절삭 옵션</label>
        <div className={styles.roundBtns}>
          {[
            { v: 'none',  label: '정확히' },
            { v: '100',   label: '100원 단위 올림' },
            { v: '1000',  label: '1,000원 단위 올림' },
          ].map(opt => (
            <button key={opt.v}
              className={`${styles.roundBtn} ${round === opt.v ? styles.roundActive : ''}`}
              onClick={() => setRound(opt.v as 'none' | '100' | '1000')}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>1인당 금액</div>
            <div className={styles.heroNum}>{fmt(result.perPerson)}원</div>
            {result.diff > 0 && (
              <div className={styles.heroSub}>
                총 {fmt(result.actualTotal)}원 걷힘 (잔돈 {fmt(result.diff)}원 생김)
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.summaryGrid}>
              {[
                ['총 금액',    fmt(parseFloat(total.replace(/,/g, ''))) + '원'],
                ['인원',       people + '명'],
                ...(result.alcoholPerPerson > 0 ? [['술값 1인', fmt(result.alcoholPerPerson) + '원']] : []),
                ['최종 1인',   fmt(result.perPerson) + '원'],
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
        <div className={styles.empty}>총 금액과 인원 수를 입력하면 1인당 금액이 계산됩니다</div>
      )}
    </div>
  )
}