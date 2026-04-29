/* ──────────────────────────────────────────────────────
   recipe/recipeUtils.ts
   인분 비율 스케일링, 단위 환산, localStorage,
   장보기 리스트 합산
   ────────────────────────────────────────────────────── */

import {
  findIngredient, findUnit, isSeasoning, INGREDIENT_DENSITY, SHOP_GROUP_LABELS,
  type UnitKey, type IngredientShoppingGroup,
} from './ingredientDensity'

export type RecipeIngredient = {
  id: string
  name: string
  amount: number
  unit: UnitKey
  note?: string
}

export type SavedRecipe = {
  id: string
  title: string
  emoji?: string
  category: string  // RecipeCategoryId 또는 'custom'
  basePeople: number
  ingredients: RecipeIngredient[]
  notes?: string
  createdAt: string
  updatedAt: string
}

/* ─── 합리적 자릿수 반올림 ─── */
export function roundSensible(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value === 0) return 0
  const abs = Math.abs(value)
  if (abs < 1)   return Math.round(value * 100) / 100
  if (abs < 10)  return Math.round(value * 10) / 10
  if (abs < 100) return Math.round(value * 10) / 10
  return Math.round(value)
}

/** 0.5 단위 반올림 */
export function roundHalf(value: number): number {
  return Math.round(value * 2) / 2
}

/* ─── 인분 스케일링 ─── */
export type ScaleOptions = {
  /** 0.5 단위 반올림 */
  roundHalfMode: boolean
  /** 양념 자동 보정 (인분 늘릴 때만) */
  reduceSeasoning: boolean
  /** 양념 보정 비율 — 0.7~1.0 */
  seasoningRatio: number
}

export type ScaledIngredient = RecipeIngredient & {
  baseAmount: number
  baseUnit: UnitKey
  isSeasoning: boolean
  seasoningCorrected: boolean
  ratio: number
}

export function scaleRecipe(
  ingredients: RecipeIngredient[],
  basePeople: number,
  targetPeople: number,
  opts: ScaleOptions,
): ScaledIngredient[] {
  if (basePeople <= 0) return []
  const baseRatio = targetPeople / basePeople
  const scaleUp = targetPeople > basePeople

  return ingredients.map(ing => {
    const seasoning = isSeasoning(ing.name)
    let ratio = baseRatio
    let corrected = false
    if (opts.reduceSeasoning && seasoning && scaleUp) {
      ratio = baseRatio * opts.seasoningRatio
      corrected = true
    }
    let amt = ing.amount * ratio
    if (opts.roundHalfMode) amt = roundHalf(amt)
    else amt = roundSensible(amt)
    return {
      ...ing,
      baseAmount: ing.amount,
      baseUnit: ing.unit,
      amount: amt,
      isSeasoning: seasoning,
      seasoningCorrected: corrected,
      ratio,
    }
  })
}

/* ─── 단위 환산 ─── */
export type ConvertResult = {
  value: number
  isApprox: boolean        // 부피 ↔ 무게 (밀도 기반) 또는 어림 단위
  reason?: string
}

export function convertUnit(
  ingredientName: string,
  amount: number,
  fromKey: UnitKey,
  toKey: UnitKey,
): ConvertResult | null {
  if (fromKey === toKey) return { value: amount, isApprox: false }

  const from = findUnit(fromKey)
  const to = findUnit(toKey)
  if (!from || !to) return null

  // 개수 단위는 변환 불가
  if (from.count || to.count) {
    return { value: 0, isApprox: true, reason: '개수 단위는 변환 불가' }
  }

  // 부피 ↔ 부피
  if (from.ml !== undefined && to.ml !== undefined) {
    return { value: roundSensible((amount * from.ml) / to.ml), isApprox: false }
  }
  // 무게 ↔ 무게
  if (from.g !== undefined && to.g !== undefined) {
    return { value: roundSensible((amount * from.g) / to.g), isApprox: false }
  }

  // 부피 ↔ 무게 (밀도 필요)
  const info = findIngredient(ingredientName)
  if (from.ml !== undefined && to.g !== undefined) {
    if (!info) return { value: 0, isApprox: true, reason: '재료 밀도 정보 없음 — 물(1.0) 가정' }
    const ml = amount * from.ml
    const g = ml * info.gPerMl
    return { value: roundSensible(g / to.g), isApprox: true }
  }
  if (from.g !== undefined && to.ml !== undefined) {
    if (!info) return { value: 0, isApprox: true, reason: '재료 밀도 정보 없음' }
    const g = amount * from.g
    const ml = g / info.gPerMl
    return { value: roundSensible(ml / to.ml), isApprox: true }
  }

  // 어림 단위 → 무게
  if (from.approxG !== undefined && to.g !== undefined) {
    return { value: roundSensible((amount * from.approxG) / to.g), isApprox: true }
  }
  if (from.approxG !== undefined && to.ml !== undefined) {
    if (!info) return { value: 0, isApprox: true, reason: '재료 밀도 정보 없음' }
    const g = amount * from.approxG
    const ml = g / info.gPerMl
    return { value: roundSensible(ml / to.ml), isApprox: true }
  }
  if (from.g !== undefined && to.approxG !== undefined) {
    return { value: roundSensible((amount * from.g) / to.approxG), isApprox: true }
  }
  if (from.ml !== undefined && to.approxG !== undefined) {
    if (!info) return { value: 0, isApprox: true, reason: '재료 밀도 정보 없음' }
    const g = amount * from.ml * info.gPerMl
    return { value: roundSensible(g / to.approxG), isApprox: true }
  }

  return null
}

/** 한 재료의 모든 단위 변환을 한 번에 — 빠른 환산표용 */
export function convertAll(ingredientName: string, amount: number, fromKey: UnitKey): {
  unit: UnitKey
  name: string
  value: number
  isApprox: boolean
}[] {
  const targets: UnitKey[] = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup']
  return targets
    .filter(k => k !== fromKey)
    .map(k => {
      const r = convertUnit(ingredientName, amount, fromKey, k)
      const u = findUnit(k)
      return r && u ? { unit: k, name: u.name, value: r.value, isApprox: r.isApprox } : null
    })
    .filter((x): x is { unit: UnitKey; name: string; value: number; isApprox: boolean } =>
      x !== null && x.value > 0)
}

/* ─── 텍스트 출력 ─── */
export function fmtIngredient(ing: { name: string; amount: number; unit: UnitKey; note?: string }): string {
  const u = findUnit(ing.unit)
  const unitName = u?.name ?? ing.unit
  const amt = ing.amount % 1 === 0 ? String(ing.amount) : String(ing.amount)
  const note = ing.note ? ` (${ing.note})` : ''
  return `${ing.name}: ${amt}${unitName}${note}`
}

export function fmtRecipeText(
  title: string,
  basePeople: number,
  targetPeople: number,
  scaled: ScaledIngredient[],
  opts: { reduceSeasoning: boolean; seasoningRatio: number },
): string {
  const head = `${title} · ${basePeople}인분 → ${targetPeople}인분 (× ${roundSensible(targetPeople / basePeople)})`
  const lines = scaled.map(s => {
    const u = findUnit(s.unit)
    const tag = s.seasoningCorrected ? ' (양념 보정)' : ''
    return `${s.name}: ${s.amount}${u?.name ?? s.unit}${tag}`
  })
  const footer = opts.reduceSeasoning
    ? `\n* 양념 자동 보정 ${Math.round(opts.seasoningRatio * 100)}% 적용 — 첫 사용 시 80%부터 간 보면서 조절 권장`
    : ''
  return `${head}\n──────────────\n${lines.join('\n')}${footer}\n— youtil.kr 레시피 비율 계산기`
}

/* ─── localStorage ─── */
const STORAGE_KEY = 'youtil-recipes-v1'

export function loadRecipes(): SavedRecipe[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveRecipes(recipes: SavedRecipe[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)) } catch { /* quota */ }
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function exportRecipes(recipes: SavedRecipe[]): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), recipes }, null, 2)
}

export function importRecipes(json: string): SavedRecipe[] | null {
  try {
    const obj = JSON.parse(json)
    const list = Array.isArray(obj) ? obj : (Array.isArray(obj.recipes) ? obj.recipes : null)
    if (!list) return null
    return list.filter((r: unknown): r is SavedRecipe => {
      const x = r as SavedRecipe
      return !!x && typeof x.id === 'string' && typeof x.title === 'string' && Array.isArray(x.ingredients)
    })
  } catch { return null }
}

/* ─── 장보기 리스트 합산 ─── */
export type ShoppingItem = {
  name: string
  unit: UnitKey
  amount: number
  sources: { recipeName: string; people: number; amount: number }[]
  group: IngredientShoppingGroup
}

export type ShoppingListEntry = {
  recipe: SavedRecipe
  people: number
}

export function combineShoppingList(entries: ShoppingListEntry[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>()

  for (const e of entries) {
    const scaled = scaleRecipe(e.recipe.ingredients, e.recipe.basePeople, e.people, {
      roundHalfMode: false, reduceSeasoning: false, seasoningRatio: 1,
    })
    for (const ing of scaled) {
      const key = `${ing.name.trim()}::${ing.unit}`
      const info = findIngredient(ing.name)
      const group = info?.shopGroup ?? 'other'
      const existing = map.get(key)
      if (existing) {
        existing.amount = roundSensible(existing.amount + ing.amount)
        existing.sources.push({ recipeName: e.recipe.title, people: e.people, amount: ing.amount })
      } else {
        map.set(key, {
          name: ing.name.trim(),
          unit: ing.unit,
          amount: ing.amount,
          sources: [{ recipeName: e.recipe.title, people: e.people, amount: ing.amount }],
          group,
        })
      }
    }
  }

  return Array.from(map.values())
}

/** 장보기 리스트를 그룹별로 묶어 반환 */
export function groupShopping(items: ShoppingItem[]): { group: IngredientShoppingGroup; label: string; emoji: string; items: ShoppingItem[] }[] {
  const order: IngredientShoppingGroup[] = ['vegetable', 'meat', 'dairy', 'grain-noodle', 'sauce-spice', 'canned', 'fruit-snack', 'other']
  return order
    .map(g => ({
      group: g,
      label: SHOP_GROUP_LABELS[g].label,
      emoji: SHOP_GROUP_LABELS[g].emoji,
      items: items.filter(it => it.group === g).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(group => group.items.length > 0)
}

/** 장보기 리스트 텍스트 변환 (카카오톡 공유용) */
export function fmtShoppingText(items: ShoppingItem[], entries: ShoppingListEntry[]): string {
  const head = `🛒 장보기 (${entries.length}개 레시피, ${entries.reduce((s, e) => s + e.people, 0)}인분)`
  const sub = entries.map(e => `· ${e.recipe.emoji ?? '🍴'} ${e.recipe.title} ${e.people}인분`).join('\n')
  const groups = groupShopping(items)
  const body = groups.map(g => {
    const lines = g.items.map(it => {
      const u = findUnit(it.unit)
      const sources = it.sources.length > 1 ? `  (${it.sources.map(s => s.recipeName).join(' + ')})` : ''
      return `  · ${it.name} ${it.amount}${u?.name ?? it.unit}${sources}`
    }).join('\n')
    return `${g.emoji} ${g.label}\n${lines}`
  }).join('\n\n')
  return `${head}\n${sub}\n\n${body}\n\n— youtil.kr 레시피 비율 계산기`
}

/* ─── 공개 재시연 ─── */
export { INGREDIENT_DENSITY, SHOP_GROUP_LABELS }
