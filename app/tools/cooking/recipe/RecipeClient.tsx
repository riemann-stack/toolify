/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import s from './recipe.module.css'
import {
  UNITS, findIngredient, isSeasoning,
  type UnitKey,
} from './ingredientDensity'
import {
  RECIPE_PRESETS, RECIPE_CATEGORIES,
  type RecipePreset, type RecipeCategoryId,
} from './recipePresets'
import {
  scaleRecipe, convertUnit, convertAll, fmtRecipeText,
  loadRecipes, saveRecipes, newId, exportRecipes, importRecipes,
  combineShoppingList, groupShopping, fmtShoppingText, roundSensible,
  type SavedRecipe, type RecipeIngredient, type ShoppingListEntry,
} from './recipeUtils'

type Tab = 'scale' | 'convert' | 'saved' | 'shopping'

const BASE_PRESETS = [1, 2, 3, 4, 6, 8, 10]
const TARGET_PRESETS = [1, 2, 3, 4, 6, 8, 10, 15, 20]
const UNIT_OPTIONS: UnitKey[] = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'cupUS', 'pinch', 'handful', 'bit', 'piece', 'half', 'slice', 'bunch']

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function RecipeClient() {
  const [tab, setTab] = useState<Tab>('scale')

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        💡 <strong>레시피 비율은 참고용입니다.</strong> 같은 1컵 밀가루도 체질·다짐 정도에 따라 90~130g까지 차이날 수 있으니 정확한 베이킹은 저울 사용을 권장합니다. 양념 자동 보정은 일반적 권장값이며, 실제 간 조절은 입맛에 맞게 직접 맛보면서 조정하세요.
      </div>

      <div className={s.tabs}>
        {([
          ['scale',   '인분 비율 계산'],
          ['convert', '단위 환산'],
          ['saved',   '내 레시피'],
          ['shopping','장보기 리스트'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'convert'  ? s.tabActiveConvert :
            key === 'saved'    ? s.tabActiveSaved :
            key === 'shopping' ? s.tabActiveShop : s.tabActive
          return (
            <button key={key} className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'scale'    && <ScaleTab />}
      {tab === 'convert'  && <ConvertTab />}
      {tab === 'saved'    && <SavedTab />}
      {tab === 'shopping' && <ShoppingTab />}
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 인분 비율 ═════════════════════════════════════════ */
function ScaleTab() {
  const [recipeTitle, setRecipeTitle] = useState('내 레시피')
  const [basePeople, setBasePeople] = useState('2')
  const [targetPeople, setTargetPeople] = useState('4')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { id: newId(), name: '', amount: 0, unit: 'g' },
    { id: newId(), name: '', amount: 0, unit: 'ml' },
    { id: newId(), name: '', amount: 0, unit: 'tbsp' },
  ])
  const [roundHalfMode, setRoundHalfMode] = useState(false)
  const [reduceSeasoning, setReduceSeasoning] = useState(true)
  const [seasoningRatio, setSeasoningRatio] = useState(85)
  const [activeCategory, setActiveCategory] = useState<RecipeCategoryId | 'all'>('all')
  const [copied, setCopied] = useState(false)
  const [savedConfirm, setSavedConfirm] = useState(false)

  const baseN = parseFloat(basePeople)
  const targetN = parseFloat(targetPeople)
  const validBase = Number.isFinite(baseN) && baseN > 0
  const validTarget = Number.isFinite(targetN) && targetN > 0
  const ratio = validBase && validTarget ? targetN / baseN : null

  const filteredPresets = useMemo(() => (
    activeCategory === 'all'
      ? RECIPE_PRESETS
      : RECIPE_PRESETS.filter(p => p.category === activeCategory)
  ), [activeCategory])

  const applyPreset = (p: RecipePreset) => {
    setRecipeTitle(p.name)
    setBasePeople(String(p.basePeople))
    setIngredients(p.ingredients.map(ing => ({
      id: newId(),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      note: ing.note,
    })))
  }

  const validIngredients = ingredients.filter(i => i.name.trim() && i.amount > 0)
  const scaled = useMemo(() => {
    if (!validBase || !validTarget) return []
    return scaleRecipe(validIngredients, baseN, targetN, {
      roundHalfMode,
      reduceSeasoning,
      seasoningRatio: seasoningRatio / 100,
    })
  }, [validIngredients, baseN, targetN, roundHalfMode, reduceSeasoning, seasoningRatio, validBase, validTarget])

  const updateIng = (id: string, patch: Partial<RecipeIngredient>) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }
  const removeIng = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }
  const addIng = () => {
    if (ingredients.length >= 30) return
    setIngredients(prev => [...prev, { id: newId(), name: '', amount: 0, unit: 'g' }])
  }

  const handleCopy = () => {
    if (scaled.length === 0) return
    const text = fmtRecipeText(recipeTitle || '레시피', baseN, targetN, scaled, {
      reduceSeasoning, seasoningRatio: seasoningRatio / 100,
    })
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const handleSaveToMyRecipes = () => {
    if (validIngredients.length === 0 || !validBase) return
    const all = loadRecipes()
    const now = new Date().toISOString()
    all.push({
      id: newId(),
      title: recipeTitle || '저장된 레시피',
      category: 'custom',
      basePeople: baseN,
      ingredients: validIngredients.map(({ id, name, amount, unit, note }) => ({ id, name, amount, unit, note })),
      createdAt: now,
      updatedAt: now,
    })
    saveRecipes(all)
    setSavedConfirm(true)
    setTimeout(() => setSavedConfirm(false), 2000)
  }

  const seasoningCount = scaled.filter(s => s.seasoningCorrected).length

  return (
    <>
      {/* 인분 입력 */}
      <div className={s.card}>
        <div className={s.servingsGrid}>
          <div>
            <span className={s.subLabel}>기준 인분</span>
            <div className={s.inputRow}>
              <input className={s.servingInput} type="number" inputMode="numeric" min={0.5} max={50}
                value={basePeople} onChange={e => setBasePeople(e.target.value)} />
              <span className={s.unitSuffix}>인분</span>
            </div>
            <div className={s.presets}>
              {BASE_PRESETS.map(p => (
                <button key={p}
                  className={`${s.presetBtn} ${basePeople === String(p) ? s.presetActive : ''}`}
                  onClick={() => setBasePeople(String(p))}>{p}</button>
              ))}
            </div>
          </div>
          <div className={s.arrow}>→</div>
          <div>
            <span className={s.subLabel}>목표 인분</span>
            <div className={s.inputRow}>
              <input className={s.servingInput} type="number" inputMode="numeric" min={0.5} max={50}
                value={targetPeople} onChange={e => setTargetPeople(e.target.value)} />
              <span className={s.unitSuffix}>인분</span>
            </div>
            <div className={s.presets}>
              {TARGET_PRESETS.map(p => (
                <button key={p}
                  className={`${s.presetBtn} ${targetPeople === String(p) ? s.presetActive : ''}`}
                  onClick={() => setTargetPeople(String(p))}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        {ratio !== null && (
          <div className={s.ratioBadge}>배율 <strong>× {roundSensible(ratio)}</strong></div>
        )}
      </div>

      {/* 빠른 시작 — 프리셋 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          빠른 시작 — 인기 레시피
          <span className={s.cardLabelHint}>{filteredPresets.length}개</span>
        </label>
        <div className={s.catRow}>
          <button className={`${s.catChip} ${activeCategory === 'all' ? s.catActive : ''}`}
            onClick={() => setActiveCategory('all')}>전체</button>
          {RECIPE_CATEGORIES.map(c => (
            <button key={c.id}
              className={`${s.catChip} ${activeCategory === c.id ? s.catActive : ''}`}
              onClick={() => setActiveCategory(c.id)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
        <div className={s.presetGrid}>
          {filteredPresets.map(p => (
            <button key={p.id} className={s.presetCard} onClick={() => applyPreset(p)}>
              <div className={s.presetCardEmoji}>{p.emoji}</div>
              <div className={s.presetCardName}>{p.name}</div>
              <div className={s.presetCardMeta}>{p.basePeople}인분 · {p.ingredients.length}재료</div>
            </button>
          ))}
        </div>
      </div>

      {/* 레시피 제목 */}
      <div className={s.card}>
        <label className={s.cardLabel}>레시피 제목</label>
        <input className={s.textInput} type="text"
          value={recipeTitle} onChange={e => setRecipeTitle(e.target.value)}
          placeholder="예: 우리집 김치찌개" maxLength={30} />
      </div>

      {/* 재료 입력 */}
      <div className={s.card}>
        <div className={s.ingredientHeader}>
          <label className={s.cardLabel} style={{ marginBottom: 0 }}>재료 목록</label>
          <span className={s.countBadge}>{ingredients.length} / 30</span>
        </div>
        <div className={s.colLabels}>
          <span>재료명</span>
          <span>양</span>
          <span>단위</span>
          <span />
        </div>
        <div className={s.ingredientList}>
          {ingredients.map((ing, idx) => {
            const seasoning = isSeasoning(ing.name)
            return (
              <div key={ing.id} className={`${s.ingredientRow} ${seasoning ? s.ingSeasoning : ''}`}>
                <input className={s.nameInput} type="text" placeholder={`재료 ${idx + 1}`}
                  value={ing.name} onChange={e => updateIng(ing.id, { name: e.target.value })}
                  list="recipe-ingredient-suggestions" />
                <input className={s.amountInput} type="number" inputMode="decimal" placeholder="100" step={0.1}
                  value={ing.amount || ''} onChange={e => updateIng(ing.id, { amount: parseFloat(e.target.value) || 0 })} />
                <select className={s.unitSelect} value={ing.unit}
                  onChange={e => updateIng(ing.id, { unit: e.target.value as UnitKey })}>
                  {UNIT_OPTIONS.map(u => {
                    const ud = UNITS.find(x => x.key === u)
                    return <option key={u} value={u}>{ud?.name}</option>
                  })}
                </select>
                <button className={s.removeBtn} onClick={() => removeIng(ing.id)}
                  disabled={ingredients.length <= 1} aria-label="삭제">×</button>
              </div>
            )
          })}
        </div>
        <button className={s.addBtn} onClick={addIng} disabled={ingredients.length >= 30}>
          + 재료 추가
        </button>

        {/* 양념 자동 인식 안내 */}
        {ingredients.some(i => isSeasoning(i.name)) && (
          <p style={{ fontSize: 11.5, color: '#FF8C3E', marginTop: 8, lineHeight: 1.6, fontFamily: 'Noto Sans KR, sans-serif' }}>
            🌶️ 양념·향신료가 자동 감지되었습니다. &quot;양념 자동 보정&quot;이 활성화된 경우 인분 늘릴 때 보정값이 적용됩니다.
          </p>
        )}
      </div>

      <datalist id="recipe-ingredient-suggestions">
        {[...new Set([...RECIPE_PRESETS.flatMap(p => p.ingredients.map(i => i.name))])].map(n => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {/* 옵션 */}
      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={roundHalfMode} onChange={e => setRoundHalfMode(e.target.checked)} />
          0.5 단위 반올림 (예: 1.7 → 1.5, 1.9 → 2.0)
        </label>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={reduceSeasoning} onChange={e => setReduceSeasoning(e.target.checked)} />
          양념 자동 보정 (인분 늘릴 때만 — 짠맛 방지)
        </label>
        {reduceSeasoning && (
          <div className={s.sliderRow}>
            <input type="range" className={s.slider} min={70} max={100} step={5}
              value={seasoningRatio} onChange={e => setSeasoningRatio(parseInt(e.target.value))} />
            <span className={s.sliderValue}>{seasoningRatio}%</span>
          </div>
        )}
      </div>

      {/* 결과 */}
      {scaled.length > 0 ? (
        <>
          <div className={s.resultCard}>
            <div className={s.resultHeader}>
              <div>
                <div className={s.resultTitle}>
                  {baseN}인분 → <span className={s.resultAccent}>{targetN}인분</span>
                </div>
                <div className={s.resultSub}>{scaled.length}개 재료 · 배율 {roundSensible(ratio ?? 1)}×</div>
              </div>
            </div>
            <div className={s.resultList}>
              {scaled.map(r => {
                const u = UNITS.find(x => x.key === r.unit)
                const baseU = UNITS.find(x => x.key === r.baseUnit)
                // 부피·무게 자동 변환 안내
                let convertHint: string | null = null
                if (u?.ml !== undefined) {
                  const toG = convertUnit(r.name, r.amount, r.unit, 'g')
                  if (toG && toG.value > 0 && toG.isApprox) convertHint = `≈ ${toG.value}g`
                } else if (u?.g !== undefined) {
                  const toMl = convertUnit(r.name, r.amount, r.unit, 'ml')
                  if (toMl && toMl.value > 0 && toMl.isApprox) convertHint = `≈ ${toMl.value}ml`
                }
                return (
                  <div key={r.id} className={`${s.resultRow} ${r.seasoningCorrected ? s.resultRowSeasoned : ''}`}>
                    <span className={s.resultName}>
                      {r.name}
                      {r.note && <small>({r.note})</small>}
                      {r.seasoningCorrected && <span className={s.seasonBadge}>🌶️ 보정</span>}
                    </span>
                    <span className={s.resultBaseTag}>{r.baseAmount}{baseU?.name ?? r.baseUnit}</span>
                    <span className={s.resultVal}>
                      {r.amount}{u?.name ?? r.unit}
                      {convertHint && <small>{convertHint}</small>}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className={s.resultActions}>
              <button className={`${s.resultBtn} ${copied ? s.resultBtnDone : ''}`} onClick={handleCopy}>
                {copied ? '✓ 복사됨' : '📋 텍스트 복사'}
              </button>
              <button className={`${s.resultBtn} ${savedConfirm ? s.resultBtnDone : ''}`} onClick={handleSaveToMyRecipes}>
                {savedConfirm ? '✓ 저장됨' : '💾 내 레시피로 저장'}
              </button>
              <button className={s.resultBtn}
                onClick={() => alert('💡 좌측 [내 레시피]에 저장 후 [장보기 리스트] 탭에서 인분과 함께 추가하세요.')}>
                🛒 장보기로 보내기
              </button>
            </div>
          </div>

          {seasoningCount > 0 && reduceSeasoning && (
            <div className={s.seasoningInterp}>
              🌶️ <strong>양념 자동 보정 {seasoningRatio}% 적용</strong> — {seasoningCount}개 양념(소금·간장·고추장 등)을 단순 배율 대신 줄여 계산했습니다. 첫 사용 시 80%부터 시작해 간을 보면서 조절하는 것을 권장합니다.
            </div>
          )}
        </>
      ) : (
        <div className={s.empty}>
          <div className={s.emptyTitle}>📝 재료를 입력해 주세요</div>
          <p>위 [빠른 시작] 프리셋으로 즉시 시작하거나 재료명·양·단위를 직접 입력하세요.</p>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2 — 단위 환산 ═════════════════════════════════════════ */
function ConvertTab() {
  const [name, setName] = useState('밀가루')
  const [amount, setAmount] = useState('1')
  const [unit, setUnit] = useState<UnitKey>('cup')
  const [copied, setCopied] = useState<string | null>(null)

  const amt = parseFloat(amount) || 0
  const results = amt > 0 ? convertAll(name, amt, unit) : []
  const info = findIngredient(name)

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const QUICK_REF = [
    { name: '밀가루',   per1cup: '110g',  per1tbsp: '8.3g' },
    { name: '설탕',     per1cup: '170g',  per1tbsp: '12.8g' },
    { name: '쌀',       per1cup: '170g',  per1tbsp: '12.8g' },
    { name: '버터',     per1cup: '182g',  per1tbsp: '14g' },
    { name: '꿀',       per1cup: '284g',  per1tbsp: '21g' },
    { name: '소금',     per1cup: '240g',  per1tbsp: '18g' },
    { name: '간장',     per1cup: '232g',  per1tbsp: '17g' },
    { name: '고추장',   per1cup: '240g',  per1tbsp: '18g' },
    { name: '다진마늘', per1cup: '200g',  per1tbsp: '15g' },
    { name: '치즈가루', per1cup: '80g',   per1tbsp: '6g' },
  ]

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          단위 환산
          <span className={s.cardLabelHint}>재료명을 입력하면 밀도 기반 변환</span>
        </label>
        <div className={s.convertGrid}>
          <input className={s.textInput} type="text" placeholder="재료명 (예: 밀가루)"
            value={name} onChange={e => setName(e.target.value)}
            list="recipe-ingredient-suggestions" />
          <input className={s.textInput} type="number" step={0.1} min={0} placeholder="양"
            value={amount} onChange={e => setAmount(e.target.value)} />
          <select className={s.selectInput} value={unit}
            onChange={e => setUnit(e.target.value as UnitKey)}>
            {UNIT_OPTIONS.map(u => {
              const ud = UNITS.find(x => x.key === u)
              return <option key={u} value={u}>{ud?.name}</option>
            })}
          </select>
        </div>

        {info ? (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
            ✓ <strong style={{ color: 'var(--text)' }}>{info.name}</strong> 인식됨 — 밀도 {info.gPerMl} g/ml{info.isSeasoning && ' · 🌶️ 양념'}
          </p>
        ) : (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
            ⚠️ 재료 밀도 정보 없음 — 부피 ↔ 무게 변환은 물(1.0 g/ml)로 가정됩니다.
          </p>
        )}
      </div>

      {amt > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>
            변환 결과
            <span className={s.cardLabelHint}>{name} {amt}{UNITS.find(u => u.key === unit)?.name}</span>
          </label>
          <div className={s.convertResultGrid}>
            {results.map(r => {
              const key = r.unit
              const text = `${r.value}${r.name}`
              return (
                <button key={key} className={s.convertBox}
                  onClick={() => copy(key, text)}
                  title={r.isApprox ? '밀도 기반 추정' : '정확 환산'}>
                  <div className={s.convertBoxValue}>{r.value}</div>
                  <div className={s.convertBoxUnit}>{r.name}</div>
                  <div className={s.convertApprox}>{r.isApprox ? '≈ 추정' : '= 정확'} · {copied === key ? '복사됨!' : '클릭 복사'}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 빠른 환산표 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          빠른 환산표 — 인기 재료
          <span className={s.cardLabelHint}>한국 1컵 = 200ml 기준</span>
        </label>
        <table className={s.quickRefTable}>
          <thead>
            <tr><th>재료</th><th>1컵</th><th>1큰술</th></tr>
          </thead>
          <tbody>
            {QUICK_REF.map(r => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.per1cup}</td>
                <td>{r.per1tbsp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 단위 정보 */}
      <div className={s.card}>
        <label className={s.cardLabel}>단위 정보</label>
        <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0, fontFamily: 'Noto Sans KR, sans-serif' }}>
          <li>· <strong style={{ color: 'var(--text)' }}>한국 1컵</strong> = 200ml (계량컵 표준)</li>
          <li>· <strong style={{ color: 'var(--text)' }}>미국 1컵</strong> = 240ml</li>
          <li>· <strong style={{ color: 'var(--text)' }}>1큰술 (Tbsp)</strong> = 15ml</li>
          <li>· <strong style={{ color: 'var(--text)' }}>1작은술 (tsp)</strong> = 5ml = 1/3큰술</li>
          <li>· <strong style={{ color: 'var(--text)' }}>1꼬집</strong> ≈ 0.5g (엄지·검지로 잡은 양)</li>
          <li>· <strong style={{ color: 'var(--text)' }}>1줌</strong> ≈ 10g (손바닥 한 움큼)</li>
        </ul>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 내 레시피 ═════════════════════════════════════════ */
function SavedTab() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [loaded, setLoaded] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  const [category, setCategory] = useState<string>('korean')
  const [basePeople, setBasePeople] = useState('2')
  const [notes, setNotes] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { id: newId(), name: '', amount: 0, unit: 'g' },
  ])
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setRecipes(loadRecipes())
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (loaded) saveRecipes(recipes)
  }, [recipes, loaded])

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    )
  }, [recipes, searchQ])

  const startNew = () => {
    setEditingId(null)
    setTitle(''); setEmoji(''); setCategory('korean')
    setBasePeople('2'); setNotes('')
    setIngredients([{ id: newId(), name: '', amount: 0, unit: 'g' }])
    setShowForm(true)
  }
  const startEdit = (r: SavedRecipe) => {
    setEditingId(r.id)
    setTitle(r.title)
    setEmoji(r.emoji ?? '')
    setCategory(r.category)
    setBasePeople(String(r.basePeople))
    setNotes(r.notes ?? '')
    setIngredients(r.ingredients.length > 0 ? r.ingredients : [{ id: newId(), name: '', amount: 0, unit: 'g' }])
    setShowForm(true)
  }
  const handleSave = () => {
    if (!title.trim()) { alert('레시피 제목을 입력해 주세요'); return }
    const validIngs = ingredients.filter(i => i.name.trim() && i.amount > 0)
    if (validIngs.length === 0) { alert('재료를 1개 이상 입력해 주세요'); return }
    const baseN = parseFloat(basePeople)
    if (!Number.isFinite(baseN) || baseN <= 0) { alert('기준 인분을 확인해 주세요'); return }
    const now = new Date().toISOString()
    if (editingId) {
      setRecipes(prev => prev.map(r => r.id === editingId
        ? { ...r, title: title.trim(), emoji: emoji.trim() || undefined, category, basePeople: baseN, ingredients: validIngs, notes: notes.trim() || undefined, updatedAt: now }
        : r))
    } else {
      setRecipes(prev => [...prev, {
        id: newId(),
        title: title.trim(),
        emoji: emoji.trim() || undefined,
        category,
        basePeople: baseN,
        ingredients: validIngs,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }])
    }
    setShowForm(false)
    setEditingId(null)
  }
  const handleDelete = (id: string) => {
    if (!confirm('이 레시피를 삭제하시겠습니까?')) return
    setRecipes(prev => prev.filter(r => r.id !== id))
  }
  const handleDuplicate = (r: SavedRecipe) => {
    const now = new Date().toISOString()
    setRecipes(prev => [...prev, {
      ...r, id: newId(), title: r.title + ' (복제)', createdAt: now, updatedAt: now,
    }])
  }

  const handleExport = () => {
    const json = exportRecipes(recipes)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-recipes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = importRecipes(text)
      if (!parsed) { alert('잘못된 백업 파일입니다'); return }
      const merge = confirm(`${parsed.length}개의 레시피를 가져옵니다. 기존 데이터에 추가할까요? (취소 시 교체)`)
      if (!merge) {
        setRecipes(parsed)
        return
      }
      setRecipes(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        return [...prev, ...parsed.filter(p => !existingIds.has(p.id))]
      })
    }
    reader.readAsText(file)
  }

  /* 폼 — 재료 편집 */
  const addIng = () => {
    if (ingredients.length >= 30) return
    setIngredients(prev => [...prev, { id: newId(), name: '', amount: 0, unit: 'g' }])
  }
  const removeIng = (id: string) => setIngredients(prev => prev.filter(i => i.id !== id))
  const updateIng = (id: string, patch: Partial<RecipeIngredient>) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          내 레시피
          <span className={s.cardLabelHint}>{recipes.length}개 저장됨</span>
        </label>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
          자주 만드는 레시피를 브라우저에 저장하고 인분 변경·복제·메모 관리. <strong style={{ color: 'var(--text)' }}>localStorage</strong>에 저장되므로 캐시 삭제 시 사라질 수 있습니다 — 중요 레시피는 백업 권장.
        </p>
        {!showForm && (
          <button className={s.bigBtn} onClick={startNew}>+ 새 레시피 추가</button>
        )}
      </div>

      {showForm && (
        <div className={s.savedForm}>
          <div className={s.savedFormTitle}>{editingId ? '레시피 편집' : '새 레시피 추가'}</div>

          <div className={s.fieldRow}>
            <div>
              <span className={s.subLabel}>제목 *</span>
              <input className={s.textInput} type="text" placeholder="예: 엄마 김치찌개"
                value={title} onChange={e => setTitle(e.target.value)} maxLength={40} />
            </div>
            <div>
              <span className={s.subLabel}>카테고리</span>
              <select className={s.selectInput} value={category} onChange={e => setCategory(e.target.value)}>
                {RECIPE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                <option value="custom">📌 기타</option>
              </select>
            </div>
            <div>
              <span className={s.subLabel}>이모지</span>
              <input className={s.textInput} type="text" placeholder="🥘" maxLength={2}
                value={emoji} onChange={e => setEmoji(e.target.value)} />
            </div>
          </div>

          <div>
            <span className={s.subLabel}>기준 인분</span>
            <input className={s.textInput} type="number" min={0.5} max={50} step={0.5}
              value={basePeople} onChange={e => setBasePeople(e.target.value)} />
          </div>

          <div>
            <span className={s.subLabel}>재료 ({ingredients.length}/30)</span>
            <div className={s.colLabels}>
              <span>재료명</span><span>양</span><span>단위</span><span />
            </div>
            <div className={s.ingredientList}>
              {ingredients.map((ing, idx) => {
                const seasoning = isSeasoning(ing.name)
                return (
                  <div key={ing.id} className={`${s.ingredientRow} ${seasoning ? s.ingSeasoning : ''}`}>
                    <input className={s.nameInput} type="text" placeholder={`재료 ${idx + 1}`}
                      value={ing.name} onChange={e => updateIng(ing.id, { name: e.target.value })}
                      list="recipe-ingredient-suggestions" />
                    <input className={s.amountInput} type="number" inputMode="decimal" step={0.1} min={0}
                      value={ing.amount || ''} onChange={e => updateIng(ing.id, { amount: parseFloat(e.target.value) || 0 })} />
                    <select className={s.unitSelect} value={ing.unit}
                      onChange={e => updateIng(ing.id, { unit: e.target.value as UnitKey })}>
                      {UNIT_OPTIONS.map(u => {
                        const ud = UNITS.find(x => x.key === u)
                        return <option key={u} value={u}>{ud?.name}</option>
                      })}
                    </select>
                    <button className={s.removeBtn} onClick={() => removeIng(ing.id)}
                      disabled={ingredients.length <= 1} aria-label="삭제">×</button>
                  </div>
                )
              })}
            </div>
            <button className={s.addBtn} onClick={addIng} disabled={ingredients.length >= 30}>+ 재료 추가</button>
          </div>

          <div>
            <span className={s.subLabel}>메모 (선택)</span>
            <textarea className={s.textarea} rows={2} maxLength={300}
              placeholder="예: 신김치 1년 묵은 게 가장 맛있음"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className={s.miniRow}>
            <button className={s.bigBtn} style={{ width: 'auto', flex: 1 }} onClick={handleSave}>
              {editingId ? '수정 완료' : '저장'}
            </button>
            <button className={s.miniBtn} onClick={() => { setShowForm(false); setEditingId(null) }}>취소</button>
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className={s.card}>
          <input className={s.searchInput} type="text" placeholder="🔍 레시피 검색"
            value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
      )}

      {recipes.length === 0 && loaded && !showForm && (
        <div className={s.empty}>
          <div className={s.emptyTitle}>📭 저장된 레시피가 없어요</div>
          <p>[+ 새 레시피 추가]로 첫 레시피를 등록하거나, [인분 비율 계산] 탭에서 만든 레시피를 저장할 수 있습니다.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className={s.savedGrid}>
          {filtered.map(r => {
            const cat = RECIPE_CATEGORIES.find(c => c.id === r.category)
            return (
              <div key={r.id} className={s.savedCard}>
                <div className={s.savedCardTitle}>{r.emoji ?? cat?.emoji ?? '🍴'} {r.title}</div>
                <div className={s.savedCardMeta}>
                  {cat ? `${cat.name} · ` : ''}{r.basePeople}인분 · {r.ingredients.length}재료 · {new Date(r.updatedAt).toLocaleDateString('ko-KR')}
                </div>
                {r.notes && <div className={s.savedCardNote}>{r.notes}</div>}
                <div className={s.miniRow}>
                  <button className={`${s.miniBtn} ${s.miniPrimary}`} onClick={() => startEdit(r)}>편집</button>
                  <button className={s.miniBtn} onClick={() => handleDuplicate(r)}>복제</button>
                  <button className={`${s.miniBtn} ${s.miniDanger}`} onClick={() => handleDelete(r.id)}>삭제</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {recipes.length > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>데이터 백업</label>
          <div className={s.backupRow}>
            <button className={s.backupBtn} onClick={handleExport}>📥 백업 다운로드</button>
            <button className={s.backupBtn} onClick={() => fileRef.current?.click()}>📤 가져오기</button>
            <button className={`${s.backupBtn} ${s.backupDanger}`}
              onClick={() => { if (confirm('모든 레시피를 삭제하시겠습니까?')) setRecipes([]) }}>
              🗑️ 전체 삭제
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
          </div>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 장보기 리스트 ═════════════════════════════════════════ */
function ShoppingTab() {
  const [allRecipes, setAllRecipes] = useState<SavedRecipe[]>([])
  const [loaded, setLoaded] = useState(false)
  const [entries, setEntries] = useState<ShoppingListEntry[]>([])
  const [pickRecipeId, setPickRecipeId] = useState<string>('')
  const [pickPeople, setPickPeople] = useState('2')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setAllRecipes(loadRecipes())
    setLoaded(true)
  }, [])

  const presetSavedAsRecipe: SavedRecipe[] = useMemo(() =>
    RECIPE_PRESETS.map(p => ({
      id: 'preset-' + p.id,
      title: p.name,
      emoji: p.emoji,
      category: p.category,
      basePeople: p.basePeople,
      ingredients: p.ingredients.map(i => ({ id: 'pi-' + i.name, name: i.name, amount: i.amount, unit: i.unit, note: i.note })),
      notes: p.notes,
      createdAt: '',
      updatedAt: '',
    })), [])

  const recipeChoices = useMemo(() => {
    const my = allRecipes.map(r => ({ value: r.id, label: `${r.emoji ?? '🍴'} ${r.title} (내 레시피, ${r.basePeople}인분)` }))
    const presets = presetSavedAsRecipe.map(r => ({ value: r.id, label: `${r.emoji} ${r.title} (프리셋, ${r.basePeople}인분)` }))
    return [...my, ...presets]
  }, [allRecipes, presetSavedAsRecipe])

  const handleAdd = () => {
    if (!pickRecipeId) { alert('레시피를 선택해 주세요'); return }
    const ppl = parseFloat(pickPeople)
    if (!Number.isFinite(ppl) || ppl <= 0) { alert('인분 수를 확인해 주세요'); return }
    const recipe = [...allRecipes, ...presetSavedAsRecipe].find(r => r.id === pickRecipeId)
    if (!recipe) return
    setEntries(prev => [...prev, { recipe, people: ppl }])
    setPickRecipeId('')
  }
  const handleRemove = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx))
  }
  const handleClear = () => {
    if (entries.length === 0) return
    if (!confirm('장보기 리스트를 모두 비우시겠습니까?')) return
    setEntries([])
    setChecked(new Set())
  }

  const items = useMemo(() => combineShoppingList(entries), [entries])
  const groups = useMemo(() => groupShopping(items), [items])

  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const handleCopy = () => {
    if (entries.length === 0) return
    const text = fmtShoppingText(items, entries)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          장보기 리스트
          <span className={s.cardLabelHint}>여러 레시피 재료 합산</span>
        </label>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
          이번 주 만들 레시피를 추가하면 마트 코너별(채소·육류·유제품 등)로 정리된 합산 장보기 리스트가 생성됩니다.
          {allRecipes.length === 0 && ' [내 레시피] 탭에 저장된 레시피와 8가지 프리셋 모두 사용 가능합니다.'}
        </p>

        <div className={s.shopAddRow}>
          <select className={s.selectInput} value={pickRecipeId}
            onChange={e => setPickRecipeId(e.target.value)}>
            <option value="">+ 레시피 선택</option>
            {recipeChoices.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input className={s.textInput} type="number" min={0.5} max={50} step={0.5}
              value={pickPeople} onChange={e => setPickPeople(e.target.value)} />
            <span style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>인분</span>
          </div>
        </div>
        <button className={s.bigBtn} onClick={handleAdd} disabled={!loaded}>+ 추가</button>
      </div>

      {entries.length > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>
            추가된 레시피
            <span className={s.cardLabelHint}>{entries.length}개 · 총 {entries.reduce((s, e) => s + e.people, 0)}인분</span>
          </label>
          <div className={s.shopEntries}>
            {entries.map((e, i) => (
              <div key={i} className={s.shopEntry}>
                <span><strong>{e.recipe.emoji ?? '🍴'} {e.recipe.title}</strong></span>
                <span className={s.shopEntryPeople}>{e.people}인분</span>
                <button className={s.removeBtn} onClick={() => handleRemove(i)} aria-label="제거">×</button>
              </div>
            ))}
          </div>
          <div className={s.shopActions}>
            <button className={`${s.resultBtn} ${copied ? s.resultBtnDone : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 텍스트 복사 (카톡 공유용)'}
            </button>
            <button className={`${s.resultBtn} ${s.miniDanger}`} onClick={handleClear}>🗑️ 리스트 비우기</button>
          </div>
        </div>
      )}

      {entries.length === 0 && loaded && (
        <div className={s.empty}>
          <div className={s.emptyTitle}>🛒 레시피를 추가해 주세요</div>
          <p>위 드롭다운에서 레시피를 선택해 인분과 함께 추가하세요. 여러 레시피의 동일 재료가 자동 합산됩니다.</p>
        </div>
      )}

      {groups.length > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>
            합산 장보기 ({items.length}개 재료)
            <span className={s.cardLabelHint}>마트 코너별 정리 · 클릭해 체크</span>
          </label>
          {groups.map(g => (
            <div key={g.group} className={s.shopGroup}>
              <div className={s.shopGroupTitle}>{g.emoji} {g.label} ({g.items.length})</div>
              <div className={s.shopList}>
                {g.items.map((it, idx) => {
                  const key = `${it.name}::${it.unit}`
                  const isChecked = checked.has(key)
                  const u = UNITS.find(x => x.key === it.unit)
                  const sources = it.sources.length > 1
                    ? it.sources.map(s => s.recipeName).join(' + ')
                    : null
                  return (
                    <div key={`${g.group}-${idx}`}
                      className={`${s.shopItem} ${isChecked ? s.shopItemChecked : ''}`}
                      onClick={() => toggleCheck(key)}>
                      <input type="checkbox" className={s.shopItemCheck} checked={isChecked} onChange={() => toggleCheck(key)} />
                      <span className={s.shopItemName}>
                        {it.name}
                        {sources && <small>{sources}</small>}
                      </span>
                      <span className={s.shopItemAmt}>{it.amount}{u?.name ?? it.unit}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
            ⚠️ 같은 재료라도 단위가 다르면(g vs ml) 합산되지 않습니다. 같은 단위로 입력하면 자동 합산됩니다.
          </p>
        </div>
      )}
    </>
  )
}
