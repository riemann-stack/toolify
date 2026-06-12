/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo, useEffect } from 'react'
import s from './baking-recipe.module.css'
import {
  BAKING_ITEMS, PRESET_RECIPES, MOLD_PRESETS, CAKE_ROUND_MOLDS,
  INGREDIENT_LABEL,
  type IngredientKey, type BakingItem,
} from './bakingData'
import {
  diagnose, scaleRatios, totalWeight, buildRecipeMarkdown,
  TEXTURE_ADJUSTS,
} from './bakingUtils'

type TabKey = 'recipe' | 'diagnose' | 'mold' | 'preset'

interface SavedRecipe {
  id: string
  name: string
  itemId: string
  ratios: Partial<Record<IngredientKey, number>>
  baseKey: IngredientKey
  baseAmount: number
  createdAt: string
}

const STORAGE_KEY = 'youtil:baking-recipe:saved-v1'

function fmt(n: number, d = 1): string {
  if (!isFinite(n)) return '—'
  const r = Math.round(n * Math.pow(10, d)) / Math.pow(10, d)
  return r.toString()
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function getDefaultRatios(item: BakingItem): Partial<Record<IngredientKey, number>> {
  const out: Partial<Record<IngredientKey, number>> = {}
  for (const [k, v] of Object.entries(item.typicalRatios)) {
    if (v) out[k as IngredientKey] = v.default
  }
  return out
}

export default function BakingRecipeClient() {
  const [tab, setTab] = useState<TabKey>('recipe')
  const [itemId, setItemId] = useState<string>('madeleine')
  const item = BAKING_ITEMS.find((i) => i.id === itemId) ?? BAKING_ITEMS[0]

  const [baseKey, setBaseKey] = useState<IngredientKey>(item.defaultBase)
  const [baseAmount, setBaseAmount] = useState<string>('100')
  const [ratios, setRatios] = useState<Partial<Record<IngredientKey, number>>>(() => getDefaultRatios(item))

  // 품목 바뀌면 레시피·기준 무게 리셋 (기준 재료가 달라져 이전 무게 유지가 어색함)
  const handleItemChange = (newId: string) => {
    setItemId(newId)
    const newItem = BAKING_ITEMS.find((i) => i.id === newId) ?? BAKING_ITEMS[0]
    setBaseKey(newItem.defaultBase)
    setRatios(getDefaultRatios(newItem))
    setBaseAmount('100')
  }

  const baseAmountNum = parseFloat(baseAmount)
  const validBase = isFinite(baseAmountNum) && baseAmountNum > 0

  const weights = useMemo(() => {
    if (!validBase) return {} as Partial<Record<IngredientKey, number>>
    return scaleRatios(ratios, baseKey, baseAmountNum)
  }, [ratios, baseKey, baseAmountNum, validBase])

  const totalG = useMemo(() => totalWeight(weights), [weights])

  // localStorage
  const [saved, setSaved] = useState<SavedRecipe[]>([])
  const [mounted, setMounted] = useState(false)
  const [saveName, setSaveName] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSaved(JSON.parse(raw))
    } catch { /* ignore */ }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch { /* ignore */ }
  }, [saved, mounted])

  const saveCurrent = () => {
    if (!saveName.trim()) return
    const rec: SavedRecipe = {
      id: uid(),
      name: saveName.trim(),
      itemId: item.id,
      ratios: { ...ratios },
      baseKey,
      baseAmount: baseAmountNum || 100,
      createdAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
    }
    setSaved((p) => [...p, rec])
    setSaveName('')
  }

  const loadSaved = (rec: SavedRecipe) => {
    handleItemChange(rec.itemId)
    setBaseKey(rec.baseKey)
    setBaseAmount(String(rec.baseAmount))
    setRatios({ ...rec.ratios })
    setTab('recipe')
  }

  const ingredientKeys = Object.keys(item.typicalRatios) as IngredientKey[]
  const allKeys = Array.from(new Set([...ingredientKeys, ...(Object.keys(ratios) as IngredientKey[])]))

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/microwave', label: '전자레인지 환산' },
          { href: '/tools/cooking/egg-timer', label: '계란 삶는 시간' }
        ]}
      >
        본 도구는 일반 가이드입니다 레시피 비율은 출발점·정확한 결과는 본인 테스트 필요 오븐별 온도·시간 편차 큼 (가정용 ±20°C·±3분) 재료 (특히 버터·밀가루) 브랜드별 차이 있음
      </Disclaimer>

      <div className={s.diffNotice}>
        <strong>💡 어떤 도구가 맞나요?</strong>
        <div className={s.diffRow}>
          <span>🍞 빵 (식빵·바게트·치아바타·발효 반죽) → <a href="/tools/cooking/baker-percent" className={s.diffLink}>베이커 퍼센트 계산기</a></span>
        </div>
        <div className={s.diffRow}>
          <span>🧁 제과 (마들렌·파운드·쿠키·머핀·디저트) → 본 도구</span>
        </div>
      </div>

      <div className={s.tabs} role="tablist" aria-label="제과 레시피 계산기 메뉴">
        <button role="tab" aria-selected={tab === 'recipe'} className={`${s.tab} ${tab === 'recipe' ? s.tabActive : ''}`} onClick={() => setTab('recipe')}>레시피</button>
        <button role="tab" aria-selected={tab === 'diagnose'} className={`${s.tab} ${tab === 'diagnose' ? s.tabActive : ''}`} onClick={() => setTab('diagnose')}>비율 진단</button>
        <button role="tab" aria-selected={tab === 'mold'} className={`${s.tab} ${tab === 'mold' ? s.tabActive : ''}`} onClick={() => setTab('mold')}>분량 변환</button>
        <button role="tab" aria-selected={tab === 'preset'} className={`${s.tab} ${tab === 'preset' ? s.tabActive : ''}`} onClick={() => setTab('preset')}>인기 레시피</button>
      </div>

      {tab === 'recipe' && (
        <RecipeTab
          item={item}
          itemId={itemId}
          handleItemChange={handleItemChange}
          baseKey={baseKey}
          setBaseKey={setBaseKey}
          baseAmount={baseAmount}
          setBaseAmount={setBaseAmount}
          ratios={ratios}
          setRatios={setRatios}
          weights={weights}
          totalG={totalG}
          allKeys={allKeys}
          saved={saved}
          setSaved={setSaved}
          saveName={saveName}
          setSaveName={setSaveName}
          saveCurrent={saveCurrent}
          loadSaved={loadSaved}
          mounted={mounted}
        />
      )}

      {tab === 'diagnose' && (
        <DiagnoseTab
          item={item}
          ratios={ratios}
          setRatios={setRatios}
        />
      )}

      {tab === 'mold' && (
        <MoldTab
          item={item}
          ratios={ratios}
          baseKey={baseKey}
          totalG={totalG}
          weights={weights}
        />
      )}

      {tab === 'preset' && (
        <PresetTab
          itemId={itemId}
          handleItemChange={handleItemChange}
          setRatios={setRatios}
          setTab={setTab}
        />
      )}

    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 1 — 레시피 입력
   ════════════════════════════════════════════════════════════ */
interface RecipeTabProps {
  item: BakingItem
  itemId: string
  handleItemChange: (id: string) => void
  baseKey: IngredientKey
  setBaseKey: (k: IngredientKey) => void
  baseAmount: string
  setBaseAmount: (v: string) => void
  ratios: Partial<Record<IngredientKey, number>>
  setRatios: (r: Partial<Record<IngredientKey, number>>) => void
  weights: Partial<Record<IngredientKey, number>>
  totalG: number
  allKeys: IngredientKey[]
  saved: SavedRecipe[]
  setSaved: React.Dispatch<React.SetStateAction<SavedRecipe[]>>
  saveName: string
  setSaveName: (v: string) => void
  saveCurrent: () => void
  loadSaved: (rec: SavedRecipe) => void
  mounted: boolean
}

function RecipeTab(props: RecipeTabProps) {
  const {
    item, itemId, handleItemChange, baseKey, setBaseKey,
    baseAmount, setBaseAmount, ratios, setRatios, weights, totalG,
    allKeys, saved, setSaved, saveName, setSaveName, saveCurrent, loadSaved, mounted,
  } = props

  const [copied, setCopied] = useState(false)

  const updateRatio = (key: IngredientKey, val: string) => {
    const v = parseFloat(val)
    setRatios({ ...ratios, [key]: isFinite(v) ? v : 0 })
  }

  const copyMarkdown = async () => {
    const md = buildRecipeMarkdown(item, ratios, weights, { key: baseKey, amount: parseFloat(baseAmount) || 100 }, INGREDIENT_LABEL)
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>품목 선택</span>
        <div className={s.itemGrid}>
          {BAKING_ITEMS.map((it) => (
            <button
              key={it.id}
              aria-pressed={itemId === it.id}
              className={`${s.itemBtn} ${itemId === it.id ? s.itemBtnActive : ''}`}
              onClick={() => handleItemChange(it.id)}
            >
              <span className={s.itemEmoji}>{it.icon}</span>
              <span className={s.itemName}>{it.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>{item.icon} {item.name} — 기준 재료</span>
        <p className={s.itemNote}>{item.notes}</p>
        <div className={s.field}>
          <label className={s.fieldLabel}>기준 재료 (이 재료 무게로 전체 환산)</label>
          <div className={s.pillRow}>
            {item.baseOptions.map((k) => (
              <button
                key={k}
                aria-pressed={baseKey === k}
                className={`${s.pill} ${baseKey === k ? s.pillActive : ''}`}
                onClick={() => setBaseKey(k)}
              >{INGREDIENT_LABEL[k]}</button>
            ))}
          </div>
        </div>
        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.fieldLabel}>{INGREDIENT_LABEL[baseKey]} 무게 (g)</label>
          <input
            type="number"
            inputMode="decimal"
            className={s.input}
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            min={0}
          />
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>레시피 (비율 % ↔ 무게 g)</span>
        <table className={s.recipeTable}>
          <thead>
            <tr>
              <th scope="col">재료</th>
              <th scope="col">비율 %</th>
              <th scope="col">무게 g</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map((k) => {
              const isBase = k === baseKey
              const r = ratios[k]
              const w = weights[k]
              return (
                <tr key={k}>
                  <td className={`${s.rowName} ${isBase ? s.rowBase : ''}`}>
                    {INGREDIENT_LABEL[k]}{isBase && <span className={s.baseTag}>⭐ 기준</span>}
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="decimal"
                      className={s.miniInput}
                      value={r ?? ''}
                      onChange={(e) => updateRatio(k, e.target.value)}
                      min={0}
                    />
                  </td>
                  <td className={s.weightCell}>{w != null ? fmt(w, 1) : '—'} g</td>
                </tr>
              )
            })}
            <tr className={s.totalRow}>
              <td className={s.rowName}>합계</td>
              <td>—</td>
              <td className={s.weightCell}>{fmt(totalG, 1)} g</td>
            </tr>
          </tbody>
        </table>
        <button className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`} onClick={copyMarkdown}>
          {copied ? '✅ 복사됨' : '📋 마크다운 복사 (메모장·노션)'}
        </button>
      </div>

      {item.bakingTemp && (
        <div className={s.card}>
          <span className={s.cardLabel}>🔥 굽기 가이드</span>
          <div className={s.bakeGrid}>
            <div className={s.bakeBox}>
              <span className={s.bakeLabel}>온도</span>
              <span className={s.bakeValue}>{item.bakingTemp.celsius}°C</span>
            </div>
            <div className={s.bakeBox}>
              <span className={s.bakeLabel}>시간</span>
              <span className={s.bakeValue}>{item.bakingTemp.minutes}분</span>
            </div>
            {item.bakingTemp.drying && (
              <div className={s.bakeBox}>
                <span className={s.bakeLabel}>건조</span>
                <span className={s.bakeValue} style={{ fontSize: 14 }}>{item.bakingTemp.drying}</span>
              </div>
            )}
          </div>
          <div className={s.bakeWarn}>
            ⚠️ 가정용 오븐별 편차 ±20°C·±3분. 첫 시도는 권장 시간 -1분 후 확인. 표면 갈색 + 가운데 살짝 통통하면 완성.
          </div>
        </div>
      )}

      {TEXTURE_ADJUSTS[item.id] && (
        <div className={s.card}>
          <span className={s.cardLabel}>식감 보정 (한 번 클릭으로 비율 조정)</span>
          <div className={s.adjustGrid}>
            {TEXTURE_ADJUSTS[item.id].map((a) => (
              <button
                key={a.id}
                className={s.adjustBtn}
                onClick={() => setRatios(a.apply(ratios))}
              >{a.label}</button>
            ))}
            <button className={s.adjustBtnReset} onClick={() => setRatios(getDefaultRatios(item))}>
              ↺ 기본값으로
            </button>
          </div>
        </div>
      )}

      <div className={s.card}>
        <span className={s.cardLabel}>💾 내 레시피 저장 (브라우저 로컬)</span>
        <div className={s.saveRow}>
          <input
            type="text"
            className={s.input}
            placeholder="예: 엄마 마들렌, 첫째 생일 머핀…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            maxLength={40}
          />
          <button className={s.saveBtn} disabled={!saveName.trim()} onClick={saveCurrent}>저장</button>
        </div>

        {mounted && saved.length > 0 && (
          <div className={s.savedList}>
            {saved.slice().reverse().map((r) => {
              const it = BAKING_ITEMS.find((b) => b.id === r.itemId)
              return (
                <div key={r.id} className={s.savedItem}>
                  <span className={s.savedIcon}>{it?.icon ?? '📋'}</span>
                  <div className={s.savedInfo}>
                    <span className={s.savedName}>{r.name}</span>
                    <span className={s.savedMeta}>{it?.name ?? r.itemId} · {r.createdAt}</span>
                  </div>
                  <button className={s.loadBtn} onClick={() => loadSaved(r)}>불러오기</button>
                  <button
                    className={s.removeBtn}
                    onClick={() => setSaved((p) => p.filter((x) => x.id !== r.id))}
                    aria-label="삭제"
                  >✕</button>
                </div>
              )
            })}
          </div>
        )}
        {mounted && saved.length === 0 && (
          <p className={s.savedEmpty}>저장된 레시피가 없습니다. 자주 쓰는 레시피를 저장해두면 다음에 한 번에 불러올 수 있어요.</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 2 — 비율 진단
   ════════════════════════════════════════════════════════════ */
interface DiagnoseTabProps {
  item: BakingItem
  ratios: Partial<Record<IngredientKey, number>>
  setRatios: (r: Partial<Record<IngredientKey, number>>) => void
}

function DiagnoseTab({ item, ratios, setRatios }: DiagnoseTabProps) {
  const result = useMemo(() => diagnose(item.id, ratios), [item.id, ratios])

  const sevColor: Record<string, string> = {
    info: 'var(--accent)',
    caution: '#D97706',
    warning: '#DC2626',
  }
  const sevIcon: Record<string, string> = {
    info: 'ℹ️',
    caution: '⚠️',
    warning: '🚨',
  }

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>🔍 {item.icon} {item.name} 비율 진단</span>
        <p className={s.diagIntro}>
          현재 입력된 비율을 분석해 식감·풍미를 예측하고, 권장 범위를 벗어난 재료에 대한 조정안을 제시합니다.
        </p>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>경고 / 참고</span>
        {result.warnings.length === 0 ? (
          <p className={s.diagOk}>✅ 모든 재료가 권장 범위 안입니다.</p>
        ) : (
          <ul className={s.warningList}>
            {result.warnings.map((w, i) => (
              <li key={i} className={s.warningItem} style={{ borderLeftColor: sevColor[w.severity] }}>
                <span className={s.warningIcon}>{sevIcon[w.severity]}</span>
                <div>
                  <strong>{w.ingredient}</strong>
                  <p>{w.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result.predictions.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>📊 예측 식감·풍미</span>
          <div className={s.predList}>
            {result.predictions.map((p, i) => (
              <div key={i} className={s.predItem}>
                <div className={s.predHead}>
                  <span className={s.predTrait}>{p.trait}</span>
                  <span className={s.predDesc}>{p.desc}</span>
                </div>
                <div className={s.predBar}>
                  <div className={s.predBarFill} style={{ width: `${Math.min(100, Math.max(0, p.level * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>💡 추천</span>
          <ul className={s.recList}>
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {TEXTURE_ADJUSTS[item.id] && (
        <div className={s.card}>
          <span className={s.cardLabel}>식감 보정 적용</span>
          <div className={s.adjustGrid}>
            {TEXTURE_ADJUSTS[item.id].map((a) => (
              <button
                key={a.id}
                className={s.adjustBtn}
                onClick={() => setRatios(a.apply(ratios))}
              >{a.label}</button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 3 — 분량 변환 (틀 용량 기준)
   ════════════════════════════════════════════════════════════ */
interface MoldTabProps {
  item: BakingItem
  ratios: Partial<Record<IngredientKey, number>>
  baseKey: IngredientKey
  totalG: number
  weights: Partial<Record<IngredientKey, number>>
}

function MoldTab({ item, ratios, baseKey, totalG, weights }: MoldTabProps) {
  const molds = MOLD_PRESETS[item.id] ?? CAKE_ROUND_MOLDS
  const isPiece = molds[0]?.perPiece != null

  const [moldIdx, setMoldIdx] = useState(0)
  const [count, setCount] = useState('12')

  // 케이크 원형도 같이
  const useCake = !MOLD_PRESETS[item.id]
  const moldList = useCake ? CAKE_ROUND_MOLDS : molds
  const mold = moldList[Math.min(moldIdx, moldList.length - 1)]
  const countNum = parseInt(count) || 1

  const targetG = mold.perPiece != null
    ? mold.perPiece * countNum
    : (mold.volume ?? 0)

  const factor = totalG > 0 ? targetG / totalG : 0
  const scaledWeights: Partial<Record<IngredientKey, number>> = {}
  for (const [k, v] of Object.entries(weights)) {
    if (v != null) scaledWeights[k as IngredientKey] = v * factor
  }
  const scaledTotal = totalG * factor

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>현재 레시피</span>
        <p className={s.moldIntro}>
          현재 입력된 레시피 총 반죽: <strong>{fmt(totalG, 1)}g</strong> ({INGREDIENT_LABEL[baseKey]} {ratios[baseKey] ?? 100}% 기준)
        </p>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>틀 종류</span>
        <div className={s.moldGrid}>
          {moldList.map((m, i) => (
            <button
              key={i}
              aria-pressed={moldIdx === i}
              className={`${s.moldBtn} ${moldIdx === i ? s.moldBtnActive : ''}`}
              onClick={() => setMoldIdx(i)}
            >
              <span>{m.name}</span>
              <span className={s.moldSpec}>
                {m.perPiece != null ? `1개당 ${m.perPiece}g` : `용량 ${m.volume}g`}
              </span>
            </button>
          ))}
        </div>
        {useCake && (
          <p className={s.moldHint}>※ {item.name}은 전용 틀 데이터가 없어 케이크 원형 기준으로 표시합니다.</p>
        )}
      </div>

      {isPiece && !useCake && (
        <div className={s.card}>
          <span className={s.cardLabel}>목표 개수{item.id === 'macaron' ? ' (껍질 기준)' : ''}</span>
          <input
            type="number"
            inputMode="numeric"
            className={s.input}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={1}
            max={500}
          />
          {item.id === 'macaron' && (
            <p className={s.moldHint}>※ 1개당 g은 <strong>껍질 1장</strong> 기준 — 완성품 1개 = 껍질 2장. 50개(껍질) ≈ 25쌍.</p>
          )}
        </div>
      )}

      <div className={s.card}>
        <span className={s.cardLabel}>📦 환산 결과</span>
        <p className={s.moldResult}>
          <strong>{mold.name}</strong>
          {mold.perPiece != null && ` × ${countNum}개`}
          {' = '}
          <strong style={{ color: 'var(--accent)' }}>{fmt(targetG, 1)}g</strong> 반죽 필요
        </p>
        <p className={s.moldDiff}>
          현재 레시피 → {fmt(targetG, 1)}g로 환산 (×{fmt(factor, 2)})
        </p>

        <table className={s.recipeTable} style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th scope="col">재료</th>
              <th scope="col">현재 g</th>
              <th scope="col">환산 g</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(weights).map((k) => {
              const key = k as IngredientKey
              const w = weights[key]
              const sw = scaledWeights[key]
              if (w == null) return null
              return (
                <tr key={k}>
                  <td className={s.rowName}>{INGREDIENT_LABEL[key]}</td>
                  <td className={s.weightCell}>{fmt(w, 1)} g</td>
                  <td className={`${s.weightCell} ${s.weightAccent}`}>{fmt(sw ?? 0, 1)} g</td>
                </tr>
              )
            })}
            <tr className={s.totalRow}>
              <td className={s.rowName}>합계</td>
              <td className={s.weightCell}>{fmt(totalG, 1)} g</td>
              <td className={`${s.weightCell} ${s.weightAccent}`}>{fmt(scaledTotal, 1)} g</td>
            </tr>
          </tbody>
        </table>

        <div className={s.moldNote}>
          <strong>📝 참고</strong>
          <ul>
            <li>틀이 작을수록 굽는 시간 ↓ · 클수록 ↑</li>
            <li>마카롱·머랭 같이 민감한 품목은 신중히 환산</li>
            <li>본 도구는 부피·무게 기준 단순 환산 — 굽는 시간은 별도 조정 필요</li>
          </ul>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 4 — 인기 레시피 프리셋
   ════════════════════════════════════════════════════════════ */
interface PresetTabProps {
  itemId: string
  handleItemChange: (id: string) => void
  setRatios: (r: Partial<Record<IngredientKey, number>>) => void
  setTab: (t: TabKey) => void
}

function PresetTab({ itemId, handleItemChange, setRatios, setTab }: PresetTabProps) {
  const [filter, setFilter] = useState<string>(itemId)

  const filtered = filter === 'all'
    ? PRESET_RECIPES
    : PRESET_RECIPES.filter((r) => r.item === filter)

  const apply = (recipe: typeof PRESET_RECIPES[0]) => {
    handleItemChange(recipe.item)
    setRatios({ ...recipe.ratios })
    setTab('recipe')
  }

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>품목 필터</span>
        <div className={s.pillRow}>
          <button
            aria-pressed={filter === 'all'}
            className={`${s.pill} ${filter === 'all' ? s.pillActive : ''}`}
            onClick={() => setFilter('all')}
          >전체</button>
          {BAKING_ITEMS.map((it) => (
            <button
              key={it.id}
              aria-pressed={filter === it.id}
              className={`${s.pill} ${filter === it.id ? s.pillActive : ''}`}
              onClick={() => setFilter(it.id)}
            >{it.icon} {it.name}</button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>📚 검증된 레시피 프리셋 ({filtered.length}개)</span>
        <div className={s.presetGrid}>
          {filtered.map((r, i) => {
            const it = BAKING_ITEMS.find((b) => b.id === r.item)
            const top = Object.entries(r.ratios).slice(0, 4)
              .map(([k, v]) => `${INGREDIENT_LABEL[k as IngredientKey]} ${v}%`)
              .join(' · ')
            return (
              <button key={i} className={s.presetCard} onClick={() => apply(r)}>
                <div className={s.presetHead}>
                  <span className={s.presetIcon}>{it?.icon ?? '📋'}</span>
                  <span className={s.presetName}>{r.name}</span>
                </div>
                <p className={s.presetRatios}>{top}…</p>
                <span className={s.presetApply}>→ 적용</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
