'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './recipe.module.css'

const UNITS = ['g', 'kg', 'ml', 'L', '컵', '큰술', '작은술', '개', '꼬집', '줌', '약간']
const BASE_PRESETS   = [1, 2, 3, 4, 6, 8, 10]
const TARGET_PRESETS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20]

interface Ingredient {
  id: number
  name: string
  amount: string
  unit: string
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 1, name: '', amount: '', unit: 'g' },
  { id: 2, name: '', amount: '', unit: 'ml' },
  { id: 3, name: '', amount: '', unit: '큰술' },
]

let nextId = 4

function scale(amount: number, base: number, target: number, roundHalf: boolean): string {
  const val = (amount / base) * target
  if (roundHalf) {
    const r = Math.round(val * 2) / 2
    return r % 1 === 0 ? String(r) : String(r)
  }
  return parseFloat(val.toFixed(2)).toString()
}

export default function RecipeClient() {
  const [baseServings,   setBaseServings]   = useState('2')
  const [targetServings, setTargetServings] = useState('4')
  const [ingredients,    setIngredients]    = useState<Ingredient[]>(DEFAULT_INGREDIENTS)
  const [roundHalf,      setRoundHalf]      = useState(false)
  const [copied,         setCopied]         = useState(false)

  const baseNum = useMemo(() => {
    const n = parseInt(baseServings); return n >= 1 && n <= 20 ? n : null
  }, [baseServings])

  const targetNum = useMemo(() => {
    const n = parseInt(targetServings); return n >= 1 && n <= 50 ? n : null
  }, [targetServings])

  const results = useMemo(() => {
    if (!baseNum || !targetNum) return []
    return ingredients.flatMap(ing => {
      const amt = parseFloat(ing.amount)
      if (!ing.name.trim() || !ing.amount || isNaN(amt) || amt <= 0) return []
      return [{ id: ing.id, name: ing.name, unit: ing.unit, scaled: scale(amt, baseNum, targetNum, roundHalf) }]
    })
  }, [ingredients, baseNum, targetNum, roundHalf])

  const addIngredient = useCallback(() => {
    if (ingredients.length >= 20) return
    setIngredients(prev => [...prev, { id: nextId++, name: '', amount: '', unit: 'g' }])
  }, [ingredients.length])

  const removeIngredient = useCallback((id: number) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateIngredient = useCallback((id: number, field: keyof Omit<Ingredient, 'id'>, value: string) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }, [])

  const copyAll = useCallback(() => {
    if (!results.length || !baseNum || !targetNum) return
    const lines = [
      `목표 인분: ${targetNum}인분 (기준: ${baseNum}인분)`,
      '──────────────',
      ...results.map(r => `${r.name}: ${r.scaled} ${r.unit}`),
    ]
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [results, baseNum, targetNum])

  const ratio = baseNum && targetNum ? parseFloat((targetNum / baseNum).toFixed(2)) : null

  return (
    <div className={styles.wrap}>

      {/* 인분 설정 */}
      <div className={styles.card}>
        <div className={styles.servingsGrid}>
          <div>
            <label className={styles.cardLabel}>기준 인분</label>
            <div className={styles.inputRow}>
              <input
                className={styles.servingInput}
                type="number" inputMode="numeric"
                placeholder="2" value={baseServings}
                onChange={e => setBaseServings(e.target.value)}
                min={1} max={20}
              />
              <span className={styles.unit}>인분</span>
            </div>
            <div className={styles.presets}>
              {BASE_PRESETS.map(p => (
                <button key={p}
                  className={`${styles.presetBtn} ${baseServings === String(p) ? styles.presetActive : ''}`}
                  onClick={() => setBaseServings(String(p))}>{p}</button>
              ))}
            </div>
          </div>

          <div className={styles.arrow}>→</div>

          <div>
            <label className={styles.cardLabel}>목표 인분</label>
            <div className={styles.inputRow}>
              <input
                className={styles.servingInput}
                type="number" inputMode="numeric"
                placeholder="4" value={targetServings}
                onChange={e => setTargetServings(e.target.value)}
                min={1} max={50}
              />
              <span className={styles.unit}>인분</span>
            </div>
            <div className={styles.presets}>
              {TARGET_PRESETS.map(p => (
                <button key={p}
                  className={`${styles.presetBtn} ${targetServings === String(p) ? styles.presetActive : ''}`}
                  onClick={() => setTargetServings(String(p))}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {ratio !== null && (
          <div className={styles.ratioBadge}>
            배율 <strong>{ratio}×</strong>
          </div>
        )}
      </div>

      {/* 재료 목록 */}
      <div className={styles.card}>
        <div className={styles.ingredientHeader}>
          <label className={styles.cardLabel} style={{ marginBottom: 0 }}>재료 목록</label>
          <span className={styles.countBadge}>{ingredients.length} / 20</span>
        </div>

        <div className={styles.colLabels}>
          <span>재료명</span>
          <span>양</span>
          <span>단위</span>
          <span />
        </div>

        <div className={styles.ingredientList}>
          {ingredients.map((ing, idx) => (
            <div key={ing.id} className={styles.ingredientRow}>
              <input
                className={styles.nameInput}
                type="text"
                placeholder={`재료 ${idx + 1}`}
                value={ing.name}
                onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
              />
              <input
                className={styles.amountInput}
                type="number" inputMode="decimal"
                placeholder="100"
                value={ing.amount}
                onChange={e => updateIngredient(ing.id, 'amount', e.target.value)}
              />
              <select
                className={styles.unitSelect}
                value={ing.unit}
                onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <button
                className={styles.removeBtn}
                onClick={() => removeIngredient(ing.id)}
                disabled={ingredients.length <= 1}
                aria-label="삭제"
              >×</button>
            </div>
          ))}
        </div>

        <button
          className={styles.addBtn}
          onClick={addIngredient}
          disabled={ingredients.length >= 20}
        >
          + 재료 추가
        </button>
      </div>

      {/* 옵션 */}
      <div className={styles.card}>
        <label className={styles.toggleLabel}>
          <input type="checkbox" checked={roundHalf} onChange={e => setRoundHalf(e.target.checked)} />
          소수점 0.5 단위로 반올림 (예: 1.7 → 1.5, 1.9 → 2.0)
        </label>
      </div>

      {/* 결과 */}
      {results.length > 0 ? (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <div className={styles.resultTitle}>
                {baseNum}인분 → <span className={styles.resultAccent}>{targetNum}인분</span>
              </div>
              <div className={styles.resultSub}>{results.length}개 재료 변환 완료</div>
            </div>
            <button
              className={`${styles.copyAllBtn} ${copied ? styles.copyAllDone : ''}`}
              onClick={copyAll}
            >
              {copied ? '✓ 복사됨' : '📋 전체 복사'}
            </button>
          </div>

          <div className={styles.resultList}>
            {results.map(r => (
              <div key={r.id} className={styles.resultRow}>
                <span className={styles.resultName}>{r.name}</span>
                <span className={styles.resultVal}>
                  <span className={styles.resultNum}>{r.scaled}</span>
                  <span className={styles.resultUnit}>{r.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>재료 이름과 양을 입력하면 목표 인분에 맞게 자동 계산됩니다</div>
      )}

    </div>
  )
}
