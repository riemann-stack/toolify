'use client'

import { useState, useMemo } from 'react'
import styles from './serving.module.css'

// ── Types ──────────────────────────────────────
type Category = 'noodle' | 'meat' | 'grain' | 'vegetable' | 'soup'

interface ServingData {
  key: string
  name: string
  emoji: string
  category: Category
  unit: string
  basePerPerson: { main: number; side: number; snack: number; light: number }
  withCarbReduction: number
  withoutCarbIncrease: number
  rawToCooked: number
  prepNote: string
  cookingNote: string
  variantAdjust: Record<string, number>
}

const CAT_LABEL: Record<Category, string> = {
  noodle: '🍝 면류',
  meat: '🥩 고기류',
  grain: '🍚 밥·곡류',
  vegetable: '🥦 채소·부재료',
  soup: '🍲 국·찌개·전골',
}

const SERVING_DATA: ServingData[] = [
  // 면류
  { key: 'pasta', name: '파스타', emoji: '🍝', category: 'noodle', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 70, light: 75 },
    withCarbReduction: 0, withoutCarbIncrease: 20, rawToCooked: 2.2,
    prepNote: '건면 기준', cookingNote: '삶으면 약 2.2배 증가. 알덴테로 삶으면 소스 흡수로 추가 증가.',
    variantAdjust: { '볶음': 10, '국물': 0, '비빔': 5 } },
  { key: 'somyeon', name: '소면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 90, side: 50, snack: 60, light: 70 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.5,
    prepNote: '건면 기준', cookingNote: '삶으면 약 2.5배 증가. 국수 단독 메인이면 상한(100g) 권장.',
    variantAdjust: { '국물': 0, '비빔': 10 } },
  { key: 'jungmyeon', name: '중면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 100, side: 55, snack: 65, light: 75 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.4,
    prepNote: '건면 기준', cookingNote: '잔치국수·비빔국수용. 삶으면 약 2.4배.',
    variantAdjust: { '국물': 0, '비빔': 10 } },
  { key: 'udon', name: '우동면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 200, side: 120, snack: 150, light: 160 },
    withCarbReduction: 0, withoutCarbIncrease: 30, rawToCooked: 1.0,
    prepNote: '생면/냉동 기준 (건면이면 100g)', cookingNote: '생우동/냉동 기준. 건면이면 약 100g으로 계산.',
    variantAdjust: { '국물': 0, '볶음': 20 } },
  { key: 'ramenSari', name: '라면사리', emoji: '🍜', category: 'noodle', unit: 'g (봉)',
    basePerPerson: { main: 110, side: 0, snack: 110, light: 80 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.3,
    prepNote: '건면 기준 (1봉 보통 100~110g)', cookingNote: '전골·부대찌개용. 국물 양에 따라 1봉으로 2인 가능.',
    variantAdjust: { '국물': -10, '볶음': 10 } },
  { key: 'kalguksu', name: '칼국수면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 110, light: 110 },
    withCarbReduction: 0, withoutCarbIncrease: 20, rawToCooked: 1.6,
    prepNote: '생면 기준 (건면이면 100g)', cookingNote: '생면은 그대로 사용. 건면이면 약 100g으로 계산.',
    variantAdjust: { '국물': 0, '비빔': 10 } },
  { key: 'riceNoodle', name: '쌀국수면', emoji: '🍜', category: 'noodle', unit: 'g',
    basePerPerson: { main: 80, side: 50, snack: 60, light: 65 },
    withCarbReduction: 0, withoutCarbIncrease: 15, rawToCooked: 2.3,
    prepNote: '건면 기준 (불리기 전)', cookingNote: '뜨거운 물에 5~7분 불리면 약 2.3배. 포 보운 1인분 60~80g.',
    variantAdjust: { '국물': 0, '볶음': 10 } },

  // 고기류
  { key: 'beefGrill', name: '소고기 구이', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 200, side: 100, snack: 150, light: 130 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생고기 기준 (익으면 약 20~25% 감소)', cookingNote: '구이는 식으면 더 먹고 싶어지므로 상한 쪽 준비 권장.',
    variantAdjust: { '구이': 0 } },
  { key: 'bulgogi', name: '소불고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 180, side: 80, snack: 120, light: 120 },
    withCarbReduction: 40, withoutCarbIncrease: 0, rawToCooked: 0.8,
    prepNote: '생고기 기준', cookingNote: '채소와 함께 볶으면 1인당 20~30g 줄여도 충분.',
    variantAdjust: { '볶음': 0, '전골': -20 } },
  { key: 'shabuBeef', name: '샤브샤브 소고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 120, light: 100 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.85,
    prepNote: '생고기 기준 (얇게 썬 것)', cookingNote: '채소·두부와 함께 먹으므로 단독 구이보다 적게 준비해도 됨.',
    variantAdjust: { '전골': -10 } },
  { key: 'porkGrill', name: '돼지고기 구이', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 220, side: 120, snack: 180, light: 150 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생고기 기준', cookingNote: '삼겹살 기준. 쌈채소와 함께면 1인당 200g, 고기만이면 250g+.',
    variantAdjust: { '구이': 0 } },
  { key: 'jeyukMeat', name: '제육용 돼지고기', emoji: '🥩', category: 'meat', unit: 'g',
    basePerPerson: { main: 160, side: 80, snack: 120, light: 120 },
    withCarbReduction: 30, withoutCarbIncrease: 0, rawToCooked: 0.78,
    prepNote: '생고기 기준 (불고기감/앞다리살)', cookingNote: '볶음 요리라 양념 줄어들어 단독 보다 양 적게 느껴짐.',
    variantAdjust: { '볶음': 10 } },
  { key: 'chickenBreast', name: '닭가슴살', emoji: '🍗', category: 'meat', unit: 'g',
    basePerPerson: { main: 150, side: 80, snack: 100, light: 120 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.75,
    prepNote: '생닭가슴살 기준', cookingNote: '단백질 식단용은 메인에서 200g까지 늘릴 수 있음.',
    variantAdjust: { '볶음': 10, '찜': -10 } },
  { key: 'chickenThigh', name: '닭다리살', emoji: '🍗', category: 'meat', unit: 'g',
    basePerPerson: { main: 180, side: 90, snack: 130, light: 140 },
    withCarbReduction: 40, withoutCarbIncrease: 0, rawToCooked: 0.78,
    prepNote: '생고기 기준 (뼈 없는 정육 기준)', cookingNote: '뼈째이면 약 1.3배로 구입. 기름이 많아 포만감 높음.',
    variantAdjust: { '볶음': 10, '찜': -10 } },

  // 밥·곡류
  { key: 'rice', name: '쌀 (흰쌀)', emoji: '🍚', category: 'grain', unit: 'g',
    basePerPerson: { main: 90, side: 50, snack: 0, light: 65 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.4,
    prepNote: '생쌀 기준 (밥이 되면 약 2.4배)', cookingNote: '1인분 생쌀 90g → 밥 약 210g. 공기밥 1그릇 기준.',
    variantAdjust: {} },
  { key: 'brownRice', name: '현미', emoji: '🌾', category: 'grain', unit: 'g',
    basePerPerson: { main: 95, side: 55, snack: 0, light: 70 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 2.2,
    prepNote: '생현미 기준', cookingNote: '현미는 흰쌀보다 불리는 시간 길고 밥 부피는 약간 적음(2.2배).',
    variantAdjust: {} },
  { key: 'friedRice', name: '볶음밥용 밥', emoji: '🍚', category: 'grain', unit: 'g',
    basePerPerson: { main: 220, side: 130, snack: 180, light: 170 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 1.0,
    prepNote: '지은 밥 기준 (식은 밥 권장)', cookingNote: '갓 지은 밥보다 식힌 밥이 볶음에 좋음. 공기밥 1그릇 약 200g.',
    variantAdjust: { '볶음': 0 } },
  { key: 'juk', name: '죽용 쌀', emoji: '🥣', category: 'grain', unit: 'g',
    basePerPerson: { main: 45, side: 25, snack: 0, light: 35 },
    withCarbReduction: 0, withoutCarbIncrease: 0, rawToCooked: 5.5,
    prepNote: '생쌀 기준 (죽이 되면 약 5~6배)', cookingNote: '흰죽·전복죽용. 생쌀 45g → 죽 약 250g (1인분).',
    variantAdjust: {} },

  // 채소·부재료
  { key: 'salad', name: '샐러드 채소', emoji: '🥗', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 120, side: 60, snack: 80, light: 150 },
    withCarbReduction: 50, withoutCarbIncrease: 0, rawToCooked: 0.9,
    prepNote: '손질 전 기준 (손질 후 약 85~90%)', cookingNote: '양상추·로메인·루꼴라 등 혼합 기준.',
    variantAdjust: {} },
  { key: 'ssamVeg', name: '쌈채소', emoji: '🥬', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 80, side: 40, snack: 60, light: 100 },
    withCarbReduction: 30, withoutCarbIncrease: 10, rawToCooked: 0.95,
    prepNote: '손질 전 기준', cookingNote: '상추·깻잎·청경채 등. 고기 메뉴와 같이면 상한 쪽 준비.',
    variantAdjust: {} },
  { key: 'cabbage', name: '양배추', emoji: '🥬', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 120, side: 60, snack: 80, light: 100 },
    withCarbReduction: 30, withoutCarbIncrease: 20, rawToCooked: 0.7,
    prepNote: '손질 전 기준 (볶거나 삶으면 30~40% 줄어듦)', cookingNote: '샤브샤브·볶음용. 찌면 부피가 크게 감소.',
    variantAdjust: { '전골': 20, '볶음': 0 } },
  { key: 'beansprout', name: '숙주', emoji: '🌱', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 80, light: 90 },
    withCarbReduction: 20, withoutCarbIncrease: 20, rawToCooked: 0.8,
    prepNote: '손질 전 기준 (삶으면 약 20% 감소)', cookingNote: '샤브샤브·잡채·볶음용. 한 봉(200~300g) 기준 2~3인분.',
    variantAdjust: { '전골': 20, '볶음': 0 } },
  { key: 'mushroom', name: '버섯', emoji: '🍄', category: 'vegetable', unit: 'g',
    basePerPerson: { main: 100, side: 50, snack: 80, light: 80 },
    withCarbReduction: 30, withoutCarbIncrease: 20, rawToCooked: 0.75,
    prepNote: '손질 전 기준 (가열 시 부피 25% 감소)', cookingNote: '느타리·새송이·양송이 등 혼합. 샤브·전골에 넉넉히.',
    variantAdjust: { '전골': 20, '볶음': 0 } },
  { key: 'potato', name: '감자', emoji: '🥔', category: 'vegetable', unit: 'g (개)',
    basePerPerson: { main: 180, side: 100, snack: 130, light: 130 },
    withCarbReduction: 0, withoutCarbIncrease: 30, rawToCooked: 0.9,
    prepNote: '껍질 포함 기준 (중간 크기 1개 약 150g)', cookingNote: '찜·국·볶음에 공통. 1인분 1~1.5개.',
    variantAdjust: { '국물': 10, '볶음': 0, '찜': 0 } },

  // 국·찌개·전골
  { key: 'soupMeat', name: '국거리 고기', emoji: '🍲', category: 'soup', unit: 'g',
    basePerPerson: { main: 100, side: 60, snack: 80, light: 80 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.85,
    prepNote: '생고기 기준 (양지·사태·국거리)', cookingNote: '국은 국물이 포만감을 채우므로 단독 고기 요리보다 적음.',
    variantAdjust: { '국물': 0, '전골': 20 } },
  { key: 'hotpotMeat', name: '전골용 고기', emoji: '🍲', category: 'soup', unit: 'g',
    basePerPerson: { main: 130, side: 70, snack: 100, light: 100 },
    withCarbReduction: 20, withoutCarbIncrease: 30, rawToCooked: 0.8,
    prepNote: '생고기 기준', cookingNote: '채소·두부·면사리와 함께. 메인으로 단독이면 +30g.',
    variantAdjust: { '전골': 0, '국물': -10 } },
  { key: 'eomuk', name: '어묵', emoji: '🍢', category: 'soup', unit: 'g',
    basePerPerson: { main: 80, side: 50, snack: 70, light: 60 },
    withCarbReduction: 20, withoutCarbIncrease: 10, rawToCooked: 1.0,
    prepNote: '완제품 기준 (바로 조리 가능)', cookingNote: '국·볶음·꼬치용. 한 팩(500g) 기준 5~6인분.',
    variantAdjust: { '국물': 10, '볶음': 0 } },
  { key: 'dumpling', name: '만두', emoji: '🥟', category: 'soup', unit: '개',
    basePerPerson: { main: 5, side: 3, snack: 4, light: 4 },
    withCarbReduction: 1, withoutCarbIncrease: 2, rawToCooked: 1.0,
    prepNote: '완제품 기준 (1개 약 20~25g)', cookingNote: '만두국·군만두·찐만두. 단독 메인이면 6~8개.',
    variantAdjust: { '국물': 0, '찜': 0 } },
  { key: 'tofu', name: '두부', emoji: '⬜', category: 'soup', unit: 'g (모)',
    basePerPerson: { main: 100, side: 50, snack: 80, light: 80 },
    withCarbReduction: 20, withoutCarbIncrease: 0, rawToCooked: 0.9,
    prepNote: '생두부 기준 (1모 300~350g)', cookingNote: '찌개용 두부 1모는 보통 3~4인분. 단독 반찬이면 1~2인분.',
    variantAdjust: { '국물': -10, '볶음': 10 } },
]

// ── Options ──────────────────────────────────────
type MealType = 'main' | 'side' | 'snack' | 'light'
type Appetite = 'small' | 'normal' | 'large'
type AgeGroup = 'adultOnly' | 'adultChild' | 'childOnly'
type Carb = 'yes' | 'no'

const MEAL_LABEL: Record<MealType, string> = {
  main: '🍽️ 메인 식사',
  side: '🍶 곁들임 / 사이드',
  snack: '🍺 안주',
  light: '🥗 가벼운 식사',
}

const APPETITE_MULT: Record<Appetite, number> = {
  small: 0.8,
  normal: 1.0,
  large: 1.25,
}
const APPETITE_LABEL: Record<Appetite, string> = {
  small: '적게 먹는 편 (×0.8)',
  normal: '보통 (×1.0)',
  large: '많이 먹는 편 (×1.25)',
}

const AGE_LABEL: Record<AgeGroup, string> = {
  adultOnly: '성인만',
  adultChild: '성인 + 아이',
  childOnly: '아이 위주',
}

// variant choices per category
const VARIANT_CHOICES: Partial<Record<Category, string[]>> = {
  noodle: ['국물', '비빔', '볶음'],
  meat: ['구이', '볶음', '찜', '전골'],
  soup: ['국물', '전골'],
  vegetable: ['국물', '볶음', '전골'],
}

// ── Helpers ──────────────────────────────────────
function fmt(v: number): string {
  return Math.round(v).toLocaleString()
}
function roundTo(v: number, step: number): number {
  return Math.round(v / step) * step
}

// ── Calc ──────────────────────────────────────
interface Applied {
  meal: MealType
  appetite: Appetite
  carb: Carb
  variant: string | null
}

function calcItem(item: ServingData, peopleEff: number, a: Applied) {
  let base = item.basePerPerson[a.meal]

  // variant per-item adjust (apply if variant is set and present in item.variantAdjust)
  if (a.variant && item.variantAdjust[a.variant] !== undefined) {
    base += item.variantAdjust[a.variant]
  }

  // carb adjustment (only for non-carb categories)
  const isCarbFood = item.category === 'noodle' || item.category === 'grain'
  if (!isCarbFood) {
    if (a.carb === 'yes') base -= item.withCarbReduction
    else base += item.withoutCarbIncrease
  }

  if (base < 0) base = 0

  const perPerson = base * APPETITE_MULT[a.appetite]
  const total = perPerson * peopleEff

  const step = item.category === 'meat' || item.category === 'noodle' ? 10 : 5
  const mid = roundTo(total, step)
  const min = roundTo(total * 0.9, step)
  const max = roundTo(total * 1.1, step)

  const cookedMid = Math.round(mid * item.rawToCooked)
  const cookedMin = Math.round(min * item.rawToCooked)
  const cookedMax = Math.round(max * item.rawToCooked)

  return { perPerson, mid, min, max, cookedMid, cookedMin, cookedMax }
}

// ── Component ──────────────────────────────────────
export default function ServingClient() {
  const [selected, setSelected] = useState<string[]>(['pasta'])
  const [people, setPeople] = useState(2)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adultOnly')
  const [children, setChildren] = useState(1)
  const [mealType, setMealType] = useState<MealType>('main')
  const [appetite, setAppetite] = useState<Appetite>('normal')
  const [carb, setCarb] = useState<Carb>('yes')
  const [variant, setVariant] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const toggle = (k: string) =>
    setSelected(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])

  const selectedItems = useMemo(
    () => SERVING_DATA.filter(d => selected.includes(d.key)),
    [selected]
  )

  const peopleEff = useMemo(() => {
    const n = Math.max(1, Math.min(20, people))
    if (ageGroup === 'adultOnly') return n
    if (ageGroup === 'childOnly') return n * 0.65
    // adultChild
    const kids = Math.max(0, Math.min(n, children))
    const adults = Math.max(0, n - kids)
    return adults + kids * 0.6
  }, [people, ageGroup, children])

  // any selected category has variants?
  const availableVariants = useMemo(() => {
    const set = new Set<string>()
    selectedItems.forEach(it => {
      const vs = VARIANT_CHOICES[it.category]
      if (vs) vs.forEach(v => set.add(v))
    })
    return Array.from(set)
  }, [selectedItems])

  const applied: Applied = { meal: mealType, appetite, carb, variant }

  const results = useMemo(
    () => selectedItems.map(it => ({ item: it, calc: calcItem(it, peopleEff, applied) })),
    [selectedItems, peopleEff, applied]
  )

  const shoppingList = useMemo(() => {
    if (results.length === 0) return ''
    const header = `─── ${people}인분 장보기 목록 ───`
    const footer = `─────────────────`
    const lines = results.map(({ item, calc }) => {
      const prep = `(${item.prepNote.split(' ')[0]})`
      return `${item.name} ${prep}: ${calc.min}~${calc.max}${item.unit.replace(/\s*\([^)]*\)/, '')}`
    })
    return [header, ...lines, footer].join('\n')
  }, [results, people])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shoppingList)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  // group data by category for rendering
  const byCat = useMemo(() => {
    const cats: Category[] = ['noodle', 'meat', 'grain', 'vegetable', 'soup']
    return cats.map(c => ({
      cat: c,
      items: SERVING_DATA.filter(d => d.category === c),
    }))
  }, [])

  return (
    <div className={styles.wrap}>
      {/* 1. 재료 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>1. 재료 선택 (복수 선택 가능)</label>
        {byCat.map(({ cat, items }) => (
          <div key={cat} className={styles.catGroup}>
            <span className={styles.catLabel}>{CAT_LABEL[cat]}</span>
            <div className={styles.ingGrid}>
              {items.map(it => {
                const active = selected.includes(it.key)
                const num = active ? selected.indexOf(it.key) + 1 : 0
                return (
                  <button key={it.key} type="button"
                    className={`${styles.ingBtn} ${active ? styles.ingActive : ''}`}
                    onClick={() => toggle(it.key)}>
                    <span className={styles.ingEmoji}>{it.emoji}</span>
                    <span className={styles.ingName}>{it.name}</span>
                    {active && selected.length > 1 && (
                      <span className={styles.ingBadge}>{num}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {selected.length > 1 && (
          <p className={styles.cardSub}>
            ✅ {selected.length}종 선택됨 — 선택한 재료 모두의 인분별 분량을 함께 계산하고 하단에 장보기 목록을 합산합니다.
          </p>
        )}
      </div>

      {/* 2. 인원 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>2. 인원</label>
        <div className={styles.peopleRow}>
          <button type="button" className={styles.stepBtn}
            onClick={() => setPeople(p => Math.max(1, p - 1))}
            disabled={people <= 1}>−</button>
          <input type="number" inputMode="numeric"
            className={styles.peopleInput}
            min={1} max={20}
            value={people}
            onChange={e => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v)) setPeople(Math.max(1, Math.min(20, v)))
            }} />
          <span className={styles.peopleUnit}>명</span>
          <button type="button" className={styles.stepBtn}
            onClick={() => setPeople(p => Math.min(20, p + 1))}
            disabled={people >= 20}>+</button>
        </div>
        <div className={styles.quickRow}>
          {[1, 2, 3, 4, 6].map(n => (
            <button key={n} type="button"
              className={`${styles.quickBtn} ${people === n ? styles.quickActive : ''}`}
              onClick={() => setPeople(n)}>
              {n}인
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>연령 구성</div>
          <div className={styles.condRow}>
            {(['adultOnly', 'adultChild', 'childOnly'] as AgeGroup[]).map(g => (
              <button key={g} type="button"
                className={`${styles.condBtn} ${ageGroup === g ? styles.condActive : ''}`}
                onClick={() => setAgeGroup(g)}>
                {AGE_LABEL[g]}
              </button>
            ))}
          </div>
          {ageGroup === 'adultChild' && (
            <div className={styles.subRow}>
              <span className={styles.subLabel}>아이 인원</span>
              <input type="number" inputMode="numeric"
                className={styles.kidInput}
                min={0} max={people}
                value={children}
                onChange={e => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v)) setChildren(Math.max(0, Math.min(people, v)))
                }} />
              <span className={styles.effPeople}>
                실질 {peopleEff.toFixed(1)}인분
              </span>
            </div>
          )}
          {ageGroup !== 'adultOnly' && (
            <p className={styles.cardSub}>
              {ageGroup === 'adultChild'
                ? '아이 1명 = 성인 0.6인분으로 계산합니다'
                : '아이 위주 식사는 전체 분량의 65% 수준으로 계산합니다'}
            </p>
          )}
        </div>
      </div>

      {/* 3. 식사 조건 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>3. 식사 조건</label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>식사 유형</div>
          <div className={styles.condRow}>
            {(['main', 'side', 'snack', 'light'] as MealType[]).map(m => (
              <button key={m} type="button"
                className={`${styles.condBtn} ${mealType === m ? styles.condActive : ''}`}
                onClick={() => setMealType(m)}>
                {MEAL_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>식사량</div>
          <div className={styles.condRow}>
            {(['small', 'normal', 'large'] as Appetite[]).map(a => (
              <button key={a} type="button"
                className={`${styles.condBtn} ${appetite === a ? styles.condActive : ''}`}
                onClick={() => setAppetite(a)}>
                {APPETITE_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: availableVariants.length > 0 ? 14 : 0 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>탄수화물 (밥/빵/면) 포함 여부</div>
          <div className={styles.condRow}>
            <button type="button"
              className={`${styles.condBtn} ${carb === 'yes' ? styles.condActive : ''}`}
              onClick={() => setCarb('yes')}>🍚 포함 (고기·채소 약간 감소)</button>
            <button type="button"
              className={`${styles.condBtn} ${carb === 'no' ? styles.condActive : ''}`}
              onClick={() => setCarb('no')}>🚫 없음 (고기·채소 증가)</button>
          </div>
        </div>

        {availableVariants.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>조리 방식 (선택)</div>
            <div className={styles.condRow}>
              <button type="button"
                className={`${styles.condBtn} ${variant === null ? styles.condActive : ''}`}
                onClick={() => setVariant(null)}>자동</button>
              {availableVariants.map(v => (
                <button key={v} type="button"
                  className={`${styles.condBtn} ${variant === v ? styles.condActive : ''}`}
                  onClick={() => setVariant(v)}>{v}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESULTS */}
      {results.length === 0 ? (
        <div className={styles.empty}>재료를 하나 이상 선택하세요</div>
      ) : (
        results.map(({ item, calc }) => {
          const catTag = CAT_LABEL[item.category].replace(/^[^\s]+\s/, '')
          const variantApplied = variant && item.variantAdjust[variant] !== undefined
          const isCarbFood = item.category === 'noodle' || item.category === 'grain'
          return (
            <div key={item.key} className={styles.result}>
              <div className={styles.resultHead}>
                <span className={styles.resultEmoji}>{item.emoji}</span>
                <div>
                  <div className={styles.resultName}>{item.name} — {people}인분</div>
                  <div className={styles.resultPeople}>
                    실질 {peopleEff.toFixed(1)}인분 · 1인당 약 {fmt(calc.perPerson)}{item.unit.split(' ')[0]}
                  </div>
                </div>
                <span className={styles.resultCat}>{catTag}</span>
              </div>

              <div className={styles.amountHero}>
                <div className={styles.amountLead}>권장 준비량</div>
                <div className={styles.amountRange}>
                  <span className={styles.amountMin}>{fmt(calc.min)}</span>
                  <span className={styles.amountTilde}>~</span>
                  <span className={styles.amountMax}>{fmt(calc.max)}</span>
                  <span className={styles.amountUnit}>{item.unit.split(' ')[0]}</span>
                </div>
                <div className={styles.amountSub}>
                  1인당 기준: 약 <strong>{fmt(calc.min / Math.max(peopleEff, 0.1))}~{fmt(calc.max / Math.max(peopleEff, 0.1))}{item.unit.split(' ')[0]}</strong>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                  <div className={styles.infoLabel}>기준</div>
                  <div className={styles.infoVal}>{item.prepNote}</div>
                </div>
                <div className={styles.infoBox}>
                  <div className={styles.infoLabel}>조리 후 예상량</div>
                  <div className={styles.infoVal}>
                    {item.rawToCooked === 1.0
                      ? '그대로 (완제품)'
                      : <>약 <strong style={{ color: 'var(--accent)' }}>{item.rawToCooked.toFixed(2)}배</strong> ({fmt(calc.cookedMin)}~{fmt(calc.cookedMax)}{item.unit.split(' ')[0]})</>}
                  </div>
                </div>
              </div>

              <div className={styles.tags}>
                <span className={styles.tagAccent}>{MEAL_LABEL[mealType]} 기준</span>
                <span className={styles.tagBase}>{APPETITE_LABEL[appetite]}</span>
                {!isCarbFood && (
                  <span className={styles.tagBase}>
                    {carb === 'yes' ? '탄수화물 포함' : '탄수화물 없음'}
                  </span>
                )}
                {variantApplied && (
                  <span className={styles.tagBase}>
                    조리: {variant} ({item.variantAdjust[variant!] > 0 ? '+' : ''}{item.variantAdjust[variant!]}g)
                  </span>
                )}
              </div>

              <div className={styles.cookTip}>
                💡 <strong>{item.cookingNote}</strong>
              </div>
            </div>
          )
        })
      )}

      {/* SHOPPING LIST (multi-select only) */}
      {results.length >= 2 && (
        <div className={styles.shop}>
          <div className={styles.shopHead}>
            <span className={styles.shopTitle}>🛒 {people}인분 장보기 목록</span>
            <button type="button"
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={copy}>
              {copied ? '✅ 복사됨' : '📋 목록 복사'}
            </button>
          </div>
          <pre className={styles.shopList}>{shoppingList}</pre>
        </div>
      )}

      {/* 조리 전/후 기준 안내 */}
      {results.length > 0 && (
        <div className={styles.infoCard}>
          <div className={styles.infoCardHead}>📏 조리 전 / 후 기준 안내</div>
          <div className={styles.infoCardList}>
            <div>• <strong>면류:</strong> 건면 기준 (삶으면 약 2~2.5배)</div>
            <div>• <strong>고기류:</strong> 생고기 기준 (익으면 약 20~30% 감소)</div>
            <div>• <strong>쌀:</strong> 생쌀 기준 (밥이 되면 약 2.2~2.5배)</div>
            <div>• <strong>채소:</strong> 손질 전 기준 (손질 후 약 80~90% 남음, 가열 시 추가 감소)</div>
            <div>• <strong>완제품(우동·어묵·만두·두부):</strong> 구입 중량 그대로</div>
          </div>
        </div>
      )}

      <div className={styles.disclaimer}>
        <strong>참고:</strong> 본 계산기는 일반적인 한국인 성인 기준 식사량을 참고하여 제공합니다. 개인의 식사량, 체격, 요리 스타일, 반찬 구성에 따라 적정량이 달라질 수 있습니다. 처음 해보는 요리라면 결과 범위의 <strong>상한(최댓값)</strong>으로 준비하는 것을 권장합니다.
      </div>
    </div>
  )
}
