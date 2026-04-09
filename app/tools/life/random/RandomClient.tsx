'use client'

import { useState, useCallback } from 'react'
import styles from './random.module.css'

type Mode = 'number' | 'item'

export default function RandomClient() {
  const [mode,      setMode]      = useState<Mode>('number')

  // 숫자 모드
  const [minNum,    setMinNum]    = useState('1')
  const [maxNum,    setMaxNum]    = useState('100')
  const [pickCount, setPickCount] = useState('1')
  const [noRepeat,  setNoRepeat]  = useState(true)

  // 항목 모드
  const [itemText,  setItemText]  = useState('')
  const [itemCount, setItemCount] = useState('1')

  // 결과
  const [results,   setResults]   = useState<string[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [history,   setHistory]   = useState<string[][]>([])

  const shake = useCallback((fn: () => string[]) => {
    setIsShaking(true)
    setResults([])
    setTimeout(() => {
      const r = fn()
      setResults(r)
      setHistory(h => [r, ...h.slice(0, 4)])
      setIsShaking(false)
    }, 400)
  }, [])

  const handleNumberDraw = () => {
    shake(() => {
      const min = parseInt(minNum) || 1
      const max = parseInt(maxNum) || 100
      const cnt = Math.min(parseInt(pickCount) || 1, noRepeat ? max - min + 1 : 999)

      if (noRepeat) {
        const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)
        const picked: number[] = []
        for (let i = 0; i < cnt; i++) {
          const idx = Math.floor(Math.random() * pool.length)
          picked.push(pool.splice(idx, 1)[0])
        }
        return picked.sort((a, b) => a - b).map(String)
      } else {
        return Array.from({ length: cnt }, () =>
          String(Math.floor(Math.random() * (max - min + 1)) + min)
        )
      }
    })
  }

  const handleItemDraw = () => {
    shake(() => {
      const items = itemText.split('\n').map(s => s.trim()).filter(Boolean)
      if (items.length === 0) return ['항목을 입력해주세요']
      const cnt = Math.min(parseInt(itemCount) || 1, items.length)
      const pool = [...items]
      const picked: string[] = []
      for (let i = 0; i < cnt; i++) {
        const idx = Math.floor(Math.random() * pool.length)
        picked.push(pool.splice(idx, 1)[0])
      }
      return picked
    })
  }

  const itemList = itemText.split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <div className={styles.wrap}>

      {/* 모드 선택 */}
      <div className={styles.modeRow}>
        <button
          className={`${styles.modeBtn} ${mode === 'number' ? styles.modeBtnActive : ''}`}
          onClick={() => { setMode('number'); setResults([]) }}
        >
          🔢 숫자 추첨
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'item' ? styles.modeBtnActive : ''}`}
          onClick={() => { setMode('item'); setResults([]) }}
        >
          📝 항목 추첨
        </button>
      </div>

      {/* 숫자 모드 */}
      {mode === 'number' && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>숫자 범위</label>
          <div className={styles.rangeRow}>
            <input className={styles.rangeInput} type="number" inputMode="numeric"
              value={minNum} onChange={e => setMinNum(e.target.value)} />
            <span className={styles.rangeSep}>~</span>
            <input className={styles.rangeInput} type="number" inputMode="numeric"
              value={maxNum} onChange={e => setMaxNum(e.target.value)} />
          </div>
          <div className={styles.optRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.optLabel}>추첨 개수</span>
              <div className={styles.countBtns}>
                {[1, 2, 3, 5, 10].map(n => (
                  <button
                    key={n}
                    className={`${styles.countBtn} ${pickCount === String(n) ? styles.countActive : ''}`}
                    onClick={() => setPickCount(String(n))}
                  >{n}개</button>
                ))}
              </div>
            </div>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} />
              중복 제외
            </label>
          </div>
        </div>
      )}

      {/* 항목 모드 */}
      {mode === 'item' && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>항목 입력 (줄바꿈으로 구분)</label>
          <textarea
            className={styles.textarea}
            placeholder={'김철수\n이영희\n박민준\n정수연'}
            value={itemText}
            onChange={e => setItemText(e.target.value)}
            rows={5}
          />
          {itemList.length > 0 && (
            <div className={styles.itemMeta}>
              총 {itemList.length}개 항목 ·
              <span> 추첨 개수: </span>
              <div className={styles.countBtns} style={{ display: 'inline-flex', marginLeft: '6px' }}>
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    className={`${styles.countBtn} ${itemCount === String(n) ? styles.countActive : ''}`}
                    onClick={() => setItemCount(String(n))}
                  >{n}명</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 추첨 버튼 */}
      <button
        className={`${styles.drawBtn} ${isShaking ? styles.drawBtnShaking : ''}`}
        onClick={mode === 'number' ? handleNumberDraw : handleItemDraw}
        disabled={isShaking}
      >
        {isShaking ? '🎲 추첨 중...' : '🎲 추첨하기'}
      </button>

      {/* 결과 */}
      {results.length > 0 && !isShaking && (
        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>추첨 결과</div>
          <div className={styles.resultItems}>
            {results.map((r, i) => (
              <div key={i} className={styles.resultItem}>
                {results.length > 1 && <span className={styles.resultRank}>{i + 1}위</span>}
                <span className={styles.resultVal}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이전 결과 */}
      {history.length > 1 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>이전 결과</label>
          <div className={styles.historyList}>
            {history.slice(1).map((h, i) => (
              <div key={i} className={styles.historyRow}>
                <span className={styles.historyNum}>{i + 2}회 전</span>
                <span className={styles.historyVal}>{h.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}