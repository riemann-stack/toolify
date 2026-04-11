'use client'

import { useState, useMemo } from 'react'
import styles from './temperature.module.css'

type Unit = 'celsius' | 'fahrenheit' | 'kelvin'

const UNITS: { id: Unit; label: string; symbol: string }[] = [
  { id: 'celsius',    label: '섭씨',   symbol: '°C' },
  { id: 'fahrenheit', label: '화씨',   symbol: '°F' },
  { id: 'kelvin',     label: '켈빈',   symbol: 'K'  },
]

function convert(value: number, from: Unit): Record<Unit, number> {
  let celsius: number
  if (from === 'celsius')    celsius = value
  else if (from === 'fahrenheit') celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15

  return {
    celsius:    Math.round(celsius * 100) / 100,
    fahrenheit: Math.round(((celsius * 9 / 5) + 32) * 100) / 100,
    kelvin:     Math.round((celsius + 273.15) * 100) / 100,
  }
}

const PRESETS = [
  { label: '물 어는점',   celsius: 0,   desc: '0°C = 32°F' },
  { label: '체온',        celsius: 36.5, desc: '36.5°C = 97.7°F' },
  { label: '물 끓는점',   celsius: 100, desc: '100°C = 212°F' },
  { label: '체감 더위',   celsius: 35,  desc: '35°C = 95°F' },
  { label: '냉동실',      celsius: -18, desc: '-18°C = 0°F' },
  { label: '절대 영도',   celsius: -273.15, desc: '-273.15°C = 0K' },
]

export default function TemperatureClient() {
  const [from,  setFrom]  = useState<Unit>('celsius')
  const [value, setValue] = useState('')

  const result = useMemo(() => {
    const v = parseFloat(value)
    if (isNaN(v)) return null
    // 켈빈은 음수 불가
    if (from === 'kelvin' && v < 0) return null
    return convert(v, from)
  }, [value, from])

  const handlePreset = (celsius: number) => {
    setFrom('celsius')
    setValue(String(celsius))
  }

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000) return n.toLocaleString()
    return n % 1 === 0 ? String(n) : n.toFixed(2)
  }

  return (
    <div className={styles.wrap}>

      {/* 입력 단위 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>입력 단위</label>
        <div className={styles.unitRow}>
          {UNITS.map(u => (
            <button key={u.id}
              className={`${styles.unitBtn} ${from === u.id ? styles.unitBtnActive : ''}`}
              onClick={() => setFrom(u.id)}>
              <span className={styles.unitSymbol}>{u.symbol}</span>
              <span className={styles.unitLabel}>{u.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 온도 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          온도 ({UNITS.find(u => u.id === from)?.symbol})
        </label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            placeholder="0" value={value}
            onChange={e => setValue(e.target.value)} step={0.1} />
          <span className={styles.unit}>{UNITS.find(u => u.id === from)?.symbol}</span>
        </div>
      </div>

      {/* 변환 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          {UNITS.filter(u => u.id !== from).map(u => (
            <div key={u.id} className={styles.resultItem}>
              <div className={styles.resultLabel}>{u.label} ({u.symbol})</div>
              <div className={styles.resultValue}>
                {fmt(result[u.id])}<span className={styles.resultUnit}>{u.symbol}</span>
              </div>
            </div>
          ))}
          {/* 입력값도 표시 */}
          <div className={styles.resultItemAll}>
            <div className={styles.allRow}>
              {UNITS.map(u => (
                <div key={u.id} className={styles.allItem}>
                  <span className={styles.allLabel}>{u.symbol}</span>
                  <span className={styles.allValue}>{fmt(result[u.id])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>온도를 입력하면 변환 결과가 표시됩니다</div>
      )}

      {/* 빠른 선택 프리셋 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>자주 쓰는 온도</label>
        <div className={styles.presetGrid}>
          {PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn}
              onClick={() => handlePreset(p.celsius)}>
              <span className={styles.presetLabel}>{p.label}</span>
              <span className={styles.presetDesc}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}