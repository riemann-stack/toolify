'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './alcohol.module.css'

/* ── 상수 ── */
const PRESETS = [
  { label: '소주',       volume: 360, abv: 16   },
  { label: '맥주',       volume: 500, abv: 4.5  },
  { label: '막걸리',     volume: 750, abv: 6    },
  { label: '소맥 소주잔', volume: 50,  abv: 16   },
  { label: '소맥 맥주',  volume: 400, abv: 4.5  },
  { label: '와인',       volume: 150, abv: 13   },
  { label: '양주',       volume: 45,  abv: 40   },
]

const STANDARD_DRINK_G = 8  // 한국 기준 1표준잔 = 알코올 8g
const ALCOHOL_DENSITY   = 0.8 // g/ml

interface DrinkItem {
  id: number
  name: string
  volume: string
  abv: string
}

let nextId = 3

const mkItem = (): DrinkItem => ({ id: nextId++, name: '', volume: '', abv: '' })

/* ── 탭 1: 혼합 도수 계산기 ── */
function MixTab() {
  const [items, setItems] = useState<DrinkItem[]>([
    { id: 1, name: '술 A', volume: '', abv: '' },
    { id: 2, name: '술 B', volume: '', abv: '' },
  ])
  const [presetTarget, setPresetTarget] = useState<number>(1)

  const update = useCallback((id: number, field: keyof Omit<DrinkItem, 'id'>, val: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it))
  }, [])

  const applyPreset = useCallback((p: typeof PRESETS[0]) => {
    setItems(prev => prev.map(it =>
      it.id === presetTarget ? { ...it, volume: String(p.volume), abv: String(p.abv) } : it
    ))
  }, [presetTarget])

  const result = useMemo(() => {
    const valid = items.filter(it => {
      const v = parseFloat(it.volume); const a = parseFloat(it.abv)
      return v > 0 && a >= 0 && a <= 100
    })
    if (valid.length < 2) return null
    const totalVol  = valid.reduce((s, it) => s + parseFloat(it.volume), 0)
    const totalAlcMl = valid.reduce((s, it) => s + parseFloat(it.volume) * (parseFloat(it.abv) / 100), 0)
    const mixedAbv  = (totalAlcMl / totalVol) * 100
    const alcG      = totalAlcMl * ALCOHOL_DENSITY
    const standard  = alcG / STANDARD_DRINK_G
    return { totalVol: +totalVol.toFixed(1), mixedAbv: +mixedAbv.toFixed(2), alcG: +alcG.toFixed(1), standard: +standard.toFixed(2) }
  }, [items])

  return (
    <div className={styles.tabContent}>
      {/* 프리셋 */}
      <div className={styles.presetCard}>
        <div className={styles.presetTop}>
          <span className={styles.presetLabel}>프리셋 적용 대상</span>
          <div className={styles.presetTargetBtns}>
            {items.map(it => (
              <button key={it.id}
                className={`${styles.targetBtn} ${presetTarget === it.id ? styles.targetBtnActive : ''}`}
                onClick={() => setPresetTarget(it.id)}>
                {it.name || `술 ${items.indexOf(it) + 1}`}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 재료 행 */}
      <div className={styles.itemList}>
        {items.map((it, idx) => (
          <div key={it.id} className={styles.card}>
            <div className={styles.itemHeader}>
              <input
                className={styles.nameInput}
                type="text"
                placeholder={`술 ${idx + 1}`}
                value={it.name}
                onChange={e => update(it.id, 'name', e.target.value)}
              />
              {items.length > 2 && (
                <button className={styles.removeBtn}
                  onClick={() => setItems(prev => prev.filter(x => x.id !== it.id))}>×</button>
              )}
            </div>
            <div className={styles.itemInputs}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>용량</label>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal"
                    placeholder="50" value={it.volume}
                    onChange={e => update(it.id, 'volume', e.target.value)} />
                  <span className={styles.unit}>ml</span>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>도수</label>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal"
                    placeholder="16" value={it.abv}
                    onChange={e => update(it.id, 'abv', e.target.value)} />
                  <span className={styles.unit}>%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 버튼 */}
      {items.length < 5 && (
        <button className={styles.addBtn}
          onClick={() => { const n = mkItem(); setItems(prev => [...prev, n]); setPresetTarget(n.id) }}>
          + 술 추가 ({items.length}/5)
        </button>
      )}

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>혼합 도수</div>
              <div className={styles.heroNum}>{result.mixedAbv}<span className={styles.heroUnit}>%</span></div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>총 용량</div>
              <div className={styles.heroNum}>{result.totalVol}<span className={styles.heroUnit}>ml</span></div>
            </div>
          </div>
          <div className={styles.alcInfoGrid}>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.alcG}g</div>
              <div className={styles.alcInfoLabel}>순수 알코올</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.standard}잔</div>
              <div className={styles.alcInfoLabel}>표준 음주량</div>
            </div>
          </div>
          <p className={styles.stdNote}>* 한국 기준 1표준잔 = 알코올 8g</p>
        </div>
      ) : (
        <div className={styles.empty}>두 가지 이상의 술 정보를 입력하면 혼합 도수가 계산됩니다</div>
      )}
    </div>
  )
}

/* ── 탭 2: 목표 도수 계산기 ── */
function DilutionTab() {
  const [volume,    setVolume]    = useState('')
  const [abv,       setAbv]       = useState('')
  const [targetAbv, setTargetAbv] = useState('')
  const [presetApplied, setPresetApplied] = useState(false)

  const applyPreset = useCallback((p: typeof PRESETS[0]) => {
    setVolume(String(p.volume)); setAbv(String(p.abv)); setPresetApplied(true)
    setTimeout(() => setPresetApplied(false), 1000)
  }, [])

  const result = useMemo(() => {
    const v  = parseFloat(volume)
    const a  = parseFloat(abv)
    const ta = parseFloat(targetAbv)
    if (!v || !a || !ta || v <= 0 || a <= 0 || ta <= 0 || ta >= a) return null
    const addWater    = (v * a / ta) - v
    const finalVol    = v + addWater
    const finalAbvChk = (v * (a / 100) / finalVol) * 100
    const alcG        = v * (a / 100) * ALCOHOL_DENSITY
    const standard    = alcG / STANDARD_DRINK_G
    return {
      addWater:  +addWater.toFixed(1),
      finalVol:  +finalVol.toFixed(1),
      finalAbv:  +finalAbvChk.toFixed(2),
      alcG:      +alcG.toFixed(1),
      standard:  +standard.toFixed(2),
    }
  }, [volume, abv, targetAbv])

  const invalidTarget = useMemo(() => {
    const a = parseFloat(abv); const ta = parseFloat(targetAbv)
    return !!(a && ta && ta >= a)
  }, [abv, targetAbv])

  return (
    <div className={styles.tabContent}>
      {/* 프리셋 */}
      <div className={styles.presetCard}>
        <span className={styles.presetLabel}>현재 술 프리셋</span>
        <div className={styles.presets} style={{ marginTop: '8px' }}>
          {PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
        {presetApplied && <p className={styles.presetApplied}>✓ 적용됨</p>}
      </div>

      {/* 현재 술 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>현재 술</div>
        <div className={styles.itemInputs}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>용량</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="150" value={volume} onChange={e => setVolume(e.target.value)} />
              <span className={styles.unit}>ml</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>도수</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="13" value={abv} onChange={e => setAbv(e.target.value)} />
              <span className={styles.unit}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 도수 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>목표 도수</div>
        <div className={styles.inputRow}>
          <input className={`${styles.numInput} ${invalidTarget ? styles.numInputError : ''}`}
            type="number" inputMode="decimal"
            placeholder="8" value={targetAbv} onChange={e => setTargetAbv(e.target.value)} />
          <span className={styles.unit}>%</span>
        </div>
        {invalidTarget && (
          <p className={styles.errorMsg}>목표 도수는 현재 도수({abv}%)보다 낮아야 합니다</p>
        )}
      </div>

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>추가할 물</div>
              <div className={styles.heroNum}>{result.addWater}<span className={styles.heroUnit}>ml</span></div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>최종 용량</div>
              <div className={styles.heroNum}>{result.finalVol}<span className={styles.heroUnit}>ml</span></div>
            </div>
          </div>
          <div className={styles.alcInfoGrid}>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.alcG}g</div>
              <div className={styles.alcInfoLabel}>순수 알코올</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.standard}잔</div>
              <div className={styles.alcInfoLabel}>표준 음주량</div>
            </div>
          </div>
          <p className={styles.stdNote}>
            물 {result.addWater}ml 추가 시 목표 도수 {result.finalAbv}% 달성 · 1표준잔 = 알코올 8g
          </p>
        </div>
      ) : (
        <div className={styles.empty}>현재 술 정보와 목표 도수를 입력하면 희석량이 계산됩니다</div>
      )}
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AlcoholClient() {
  const [tab, setTab] = useState<'mix' | 'dilute'>('mix')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'mix'    ? styles.tabActive : ''}`} onClick={() => setTab('mix')}>
          🍹 혼합 도수 계산기
        </button>
        <button className={`${styles.tab} ${tab === 'dilute' ? styles.tabActive : ''}`} onClick={() => setTab('dilute')}>
          💧 목표 도수 계산기
        </button>
      </div>

      {tab === 'mix'    && <MixTab />}
      {tab === 'dilute' && <DilutionTab />}
    </div>
  )
}
