'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './serving.module.css'
import {
  SERVING_DATA, CAT_LABEL, MEAL_LABEL, APPETITE_LABEL, AGE_LABEL,
  APPETITE_MULT, VARIANT_CHOICES, DIETARY_LABEL,
  AGE_BAND_LABEL, AGE_BAND_FACTOR,
  loadFamily, saveFamily, familyToEffectivePeople, todayKST,
  type Category, type ServingData, type MealType, type Appetite,
  type AgeGroup, type Carb, type DietaryFlag,
  type FamilyMember, type AgeBand,
} from './servingData'

type TabKey = 'serving' | 'shopping' | 'family'

function fmt(v: number): string { return Math.round(v).toLocaleString() }
function roundTo(v: number, step: number): number { return Math.round(v / step) * step }
function uid(): string { return Math.random().toString(36).slice(2, 10) }

// 보조 개수 단위 환산 힌트 — 'g (모)' 처럼 괄호 단위 + gramsPerPiece 있을 때 "약 N모"
function pieceHint(item: ServingData, min: number, max: number): string | null {
  if (!item.gramsPerPiece) return null
  const m = item.unit.match(/\(([^)]+)\)/)
  if (!m) return null
  const u = m[1]
  const f = (v: number) => v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10)
  const lo = f(min / item.gramsPerPiece)
  const hi = f(max / item.gramsPerPiece)
  return lo === hi ? `약 ${lo}${u}` : `약 ${lo}~${hi}${u}`
}

interface Applied {
  meal: MealType
  appetite: Appetite
  carb: Carb
  variant: string | null
}

function calcItem(item: ServingData, peopleEff: number, a: Applied) {
  let base = item.basePerPerson[a.meal]
  if (a.variant && item.variantAdjust[a.variant] !== undefined) base += item.variantAdjust[a.variant]
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
  return {
    perPerson, mid, min, max,
    cookedMin: Math.round(min * item.rawToCooked),
    cookedMax: Math.round(max * item.rawToCooked),
  }
}

// ─────────────────────────────────────────────────────────────
export default function ServingClient() {
  const [tab, setTab] = useState<TabKey>('serving')

  const [selected, setSelected] = useState<string[]>(['pasta'])
  const [people, setPeople] = useState(2)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adultOnly')
  const [children, setChildren] = useState(1)
  const [mealType, setMealType] = useState<MealType>('main')
  const [appetite, setAppetite] = useState<Appetite>('normal')
  const [carb, setCarb] = useState<Carb>('yes')
  const [variant, setVariant] = useState<string | null>(null)

  // 식이 제한 (NEW)
  const [dietary, setDietary] = useState<DietaryFlag[]>([])

  // 카테고리 accordion 상태 (모바일 UX)
  const [openCats, setOpenCats] = useState<Set<Category>>(new Set(['noodle', 'meat']))

  // 검색
  const [search, setSearch] = useState('')

  // 냉장고 보유 (NEW) — key → grams
  const [fridge, setFridge] = useState<Record<string, number>>({})

  // 가족 구성 (NEW)
  const [family, setFamilyState] = useState<FamilyMember[]>([])
  const [useFamily, setUseFamily] = useState(false)
  const [mounted, setMounted] = useState(false)

  // localStorage 로드
  useEffect(() => {
    const s = loadFamily()
    if (s.members.length > 0) {
      setFamilyState(s.members)
      // 자동 적용은 사용자 동의 필요 — 안내만, 토글로 활성
    }
    if (s.defaultMealType) setMealType(s.defaultMealType)
    if (s.carb) setCarb(s.carb)
    if (s.dietary) setDietary(s.dietary)
    setMounted(true)
  }, [])
  // 가족 변경 시 저장
  useEffect(() => {
    if (!mounted) return
    saveFamily({ members: family, defaultMealType: mealType, carb, dietary })
  }, [family, mealType, carb, dietary, mounted])

  const toggleCat = (c: Category) => {
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c); else next.add(c)
      return next
    })
  }

  const toggle = (k: string) =>
    setSelected((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])

  // 식이 제한 필터 (인라인)
  const isFilteredOut = useMemo(() => {
    return (it: ServingData): boolean =>
      !!it.notFor && it.notFor.some((flag) => dietary.includes(flag))
  }, [dietary])

  // 검색·필터링된 가시 재료
  const visibleByCategory = useMemo(() => {
    const cats: Category[] = ['noodle', 'meat', 'grain', 'vegetable', 'soup']
    const q = search.trim().toLowerCase()
    return cats.map((c) => ({
      cat: c,
      items: SERVING_DATA.filter((d) => d.category === c)
        .filter((d) => !isFilteredOut(d))
        .filter((d) => !q || d.name.toLowerCase().includes(q) || d.key.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [search, isFilteredOut])

  const selectedItems = useMemo(
    () => SERVING_DATA.filter((d) => selected.includes(d.key) && !isFilteredOut(d)),
    [selected, isFilteredOut]
  )

  // 인분 환산 — 가족 모드 우선, 아니면 기존 방식
  const peopleEff = useMemo(() => {
    if (useFamily && family.length > 0) {
      return familyToEffectivePeople(family)
    }
    const n = Math.max(1, Math.min(20, people))
    if (ageGroup === 'adultOnly') return n
    if (ageGroup === 'childOnly') return n * 0.65
    const kids = Math.max(0, Math.min(n, children))
    const adults = Math.max(0, n - kids)
    return adults + kids * 0.6
  }, [useFamily, family, people, ageGroup, children])

  const peopleLabel = useFamily && family.length > 0
    ? `가족 ${family.length}명 (실질 ${peopleEff.toFixed(1)}인분)`
    : `${people}인 (실질 ${peopleEff.toFixed(1)}인분)`

  const availableVariants = useMemo(() => {
    const set = new Set<string>()
    selectedItems.forEach((it) => {
      const vs = VARIANT_CHOICES[it.category]
      if (vs) vs.forEach((v) => set.add(v))
    })
    return Array.from(set)
  }, [selectedItems])

  const results = useMemo(() => {
    const applied: Applied = { meal: mealType, appetite, carb, variant }
    return selectedItems.map((it) => ({ item: it, calc: calcItem(it, peopleEff, applied) }))
  }, [selectedItems, peopleEff, mealType, appetite, carb, variant])

  // 냉장고 빼기 적용 — 사야 할 양 계산
  const finalShoppingItems = useMemo(() => results.map(({ item, calc }) => {
    const inStock = fridge[item.key] ?? 0
    const needMin = Math.max(0, calc.min - inStock)
    const needMax = Math.max(0, calc.max - inStock)
    return { item, calc, inStock, needMin, needMax }
  }), [results, fridge])

  // 마크다운 장보기 카드
  const shoppingMarkdown = useMemo(() => {
    if (finalShoppingItems.length === 0) return ''
    const today = todayKST()
    const lines: string[] = []
    lines.push(`# 🛒 ${peopleLabel} 장보기 — ${MEAL_LABEL[mealType]}`)
    lines.push(`📅 ${today}`)
    lines.push('')

    // 카테고리별 그룹
    const cats: Category[] = ['noodle', 'meat', 'grain', 'vegetable', 'soup']
    for (const c of cats) {
      const items = finalShoppingItems.filter((x) => x.item.category === c)
      if (items.length === 0) continue
      lines.push(`## ${CAT_LABEL[c]}`)
      for (const x of items) {
        const u = x.item.unit.split(' ')[0]
        if (x.needMin === 0 && x.needMax === 0) {
          lines.push(`- ✓ ${x.item.emoji} ${x.item.name}: 보유분 충분 (${x.inStock}${u} 보유)`)
        } else {
          const stockNote = x.inStock > 0 ? ` (보유 ${x.inStock}${u} 빼고)` : ''
          const pkgNote = x.item.marketPackage ? ` · 패키지: ${x.item.marketPackage}` : ''
          const ph = pieceHint(x.item, x.needMin, x.needMax)
          const pieceNote = ph ? ` (${ph})` : ''
          lines.push(`- ${x.item.emoji} ${x.item.name}: ${x.needMin}~${x.needMax}${u}${pieceNote}${stockNote}${pkgNote}`)
        }
      }
      lines.push('')
    }

    lines.push(`---`)
    lines.push(`💡 ${dietary.length > 0 ? '식이 제한: ' + dietary.map((d) => DIETARY_LABEL[d]).join(', ') + ' · ' : ''}알레르기 라벨 확인 권장`)
    lines.push(`— youtil.kr/tools/cooking/serving`)
    return lines.join('\n')
  }, [finalShoppingItems, peopleLabel, mealType, dietary])

  const [copied, setCopied] = useState(false)
  const copyShopping = async () => {
    try {
      await navigator.clipboard.writeText(shoppingMarkdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  // 가족 멤버 관리
  const addMember = () => {
    setFamilyState((prev) => [...prev, { id: uid(), age: 'adult', appetite: 'normal' }])
  }
  const updateMember = (id: string, patch: Partial<FamilyMember>) => {
    setFamilyState((prev) => prev.map((m) => m.id === id ? { ...m, ...patch } : m))
  }
  const removeMember = (id: string) => {
    setFamilyState((prev) => prev.filter((m) => m.id !== id))
  }

  // 식이 제한 토글
  const toggleDietary = (f: DietaryFlag) => {
    setDietary((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])
  }

  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/microwave', label: '전자레인지 환산' },
          { href: '/tools/cooking/egg-timer', label: '계란 삶는 시간' }
        ]}
      >
        본 도구는 일반 장보기 가이드입니다. 분량은 한국 성인 평균 기준 — 개인 식사량·체격·요리 스타일에 따라 다름. 첫 요리는 결과 상한값으로 준비 권장. 본 도구는 정확한 영양 진단·알레르기 진단·특정 브랜드 추천을 제공하지 않습니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${styles.tabs} ${styles.tabs3}`} role="tablist">
        <button role="tab" aria-selected={tab === 'serving'} className={`${styles.tab} ${tab === 'serving' ? styles.tabActive : ''}`} onClick={() => setTab('serving')}>재료별 분량</button>
        <button role="tab" aria-selected={tab === 'shopping'} className={`${styles.tab} ${tab === 'shopping' ? styles.tabActive : ''}`} onClick={() => setTab('shopping')}>장보기 목록</button>
        <button role="tab" aria-selected={tab === 'family'} className={`${styles.tab} ${tab === 'family' ? styles.tabActive : ''}`} onClick={() => setTab('family')}>내 가족</button>
      </div>

      {/* ══════════ TAB 1: 재료별 분량 ══════════ */}
      {tab === 'serving' && (
        <>
          {/* 식이 제한 (필터) */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>식이 제한 (선택 · 자동 필터)</label>
            <div className={styles.dietaryRow}>
              {(Object.keys(DIETARY_LABEL) as DietaryFlag[]).map((f) => (
                <button key={f} type="button" role="checkbox" aria-checked={dietary.includes(f)}
                  className={`${styles.dietaryChip} ${dietary.includes(f) ? styles.dietaryChipActive : ''}`}
                  onClick={() => toggleDietary(f)}>
                  {DIETARY_LABEL[f]}
                </button>
              ))}
            </div>
            {dietary.length > 0 && (
              <p className={styles.dietaryHint}>
                해당 식이 제한에 맞지 않는 재료는 자동으로 숨겨집니다. 알레르기 진단·정확한 영양 상담은 의사·영양사 영역.
              </p>
            )}
          </div>

          {/* 재료 선택 — accordion + 검색 */}
          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="serving-f1">재료 선택 (복수 선택)</label>
            <input id="serving-f1" type="text" className={styles.searchInput}
              placeholder="🔍 재료 검색 (예: 삼겹살, 파스타)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {visibleByCategory.map(({ cat, items }) => {
              const isOpen = !!search || openCats.has(cat)  // 검색 시 모두 펼침
              return (
                <div key={cat} className={styles.catGroup}>
                  <button type="button" className={styles.catHeader}
                    onClick={() => toggleCat(cat)} aria-expanded={isOpen}>
                    <span className={styles.catLabel}>{CAT_LABEL[cat]} ({items.length})</span>
                    <span className={styles.catChevron}>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className={styles.ingGrid}>
                      {items.map((it) => {
                        const active = selected.includes(it.key)
                        const num = active ? selected.indexOf(it.key) + 1 : 0
                        return (
                          <button key={it.key} type="button" aria-pressed={active}
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
                  )}
                </div>
              )
            })}
            {selected.length > 1 && (
              <p className={styles.cardSub}>
                ✅ {selectedItems.length}종 선택 — 합산 장보기 목록은 <strong>장보기 목록</strong> 탭에서.
              </p>
            )}
          </div>

          {/* 인원 + 가족 자동 적용 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>인원</label>
            {family.length > 0 && (
              <label className={styles.useFamilyRow}>
                <input type="checkbox" checked={useFamily} onChange={(e) => setUseFamily(e.target.checked)} />
                <span>저장된 가족 구성 적용 ({family.length}명 → 실질 {familyToEffectivePeople(family).toFixed(1)}인분)</span>
              </label>
            )}
            {!useFamily && (
              <>
                <div className={styles.peopleRow}>
                  <button type="button" className={styles.stepBtn}
                    onClick={() => setPeople((p) => Math.max(1, p - 1))} disabled={people <= 1}>−</button>
                  <input type="number" inputMode="numeric"
                    className={styles.peopleInput}
                    min={1} max={20} value={people}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (!isNaN(v)) setPeople(Math.max(1, Math.min(20, v)))
                    }} />
                  <span className={styles.peopleUnit}>명</span>
                  <button type="button" className={styles.stepBtn}
                    onClick={() => setPeople((p) => Math.min(20, p + 1))} disabled={people >= 20}>+</button>
                </div>
                <div className={styles.quickRow}>
                  {[1, 2, 3, 4, 6].map((n) => (
                    <button key={n} type="button" aria-pressed={people === n}
                      className={`${styles.quickBtn} ${people === n ? styles.quickActive : ''}`}
                      onClick={() => setPeople(n)}>{n}인</button>
                  ))}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>연령 구성</div>
                  <div className={styles.condRow}>
                    {(['adultOnly', 'adultChild', 'childOnly'] as AgeGroup[]).map((g) => (
                      <button key={g} type="button" aria-pressed={ageGroup === g}
                        className={`${styles.condBtn} ${ageGroup === g ? styles.condActive : ''}`}
                        onClick={() => setAgeGroup(g)}>{AGE_LABEL[g]}</button>
                    ))}
                  </div>
                  {ageGroup === 'adultChild' && (
                    <div className={styles.subRow}>
                      <span className={styles.subLabel}>아이 인원</span>
                      <input type="number" inputMode="numeric"
                        className={styles.kidInput}
                        min={0} max={people} value={children}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10)
                          if (!isNaN(v)) setChildren(Math.max(0, Math.min(people, v)))
                        }} />
                      <span className={styles.effPeople}>실질 {peopleEff.toFixed(1)}인분</span>
                    </div>
                  )}
                  {ageGroup !== 'adultOnly' && (
                    <p className={styles.cardSub} style={{ marginTop: 8 }}>
                      기본 모드의 아이는 평균 계수(약 0.6)로 계산합니다. 영아·유아·초등·중·고생 등 <strong>연령별 정확 계산</strong>은 위 <strong>내 가족</strong> 탭을 이용하세요.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 식사 조건 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>식사 조건</label>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>식사 유형</div>
              <div className={styles.condRow}>
                {(['main', 'side', 'snack', 'light'] as MealType[]).map((m) => (
                  <button key={m} type="button" aria-pressed={mealType === m}
                    className={`${styles.condBtn} ${mealType === m ? styles.condActive : ''}`}
                    onClick={() => setMealType(m)}>{MEAL_LABEL[m]}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>식사량</div>
              <div className={styles.condRow}>
                {(['small', 'normal', 'large'] as Appetite[]).map((a) => (
                  <button key={a} type="button" aria-pressed={appetite === a}
                    className={`${styles.condBtn} ${appetite === a ? styles.condActive : ''}`}
                    onClick={() => setAppetite(a)}>{APPETITE_LABEL[a]}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: availableVariants.length > 0 ? 14 : 0 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>탄수화물(밥/면) 포함</div>
              <div className={styles.condRow}>
                <button type="button" aria-pressed={carb === 'yes'}
                  className={`${styles.condBtn} ${carb === 'yes' ? styles.condActive : ''}`}
                  onClick={() => setCarb('yes')}>포함</button>
                <button type="button" aria-pressed={carb === 'no'}
                  className={`${styles.condBtn} ${carb === 'no' ? styles.condActive : ''}`}
                  onClick={() => setCarb('no')}>없음</button>
              </div>
            </div>
            {availableVariants.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>조리 방식 (선택)</div>
                <div className={styles.condRow}>
                  <button type="button" aria-pressed={variant === null}
                    className={`${styles.condBtn} ${variant === null ? styles.condActive : ''}`}
                    onClick={() => setVariant(null)}>자동</button>
                  {availableVariants.map((v) => (
                    <button key={v} type="button" aria-pressed={variant === v}
                      className={`${styles.condBtn} ${variant === v ? styles.condActive : ''}`}
                      onClick={() => setVariant(v)}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 결과 */}
          {results.length === 0 ? (
            <div className={styles.empty}>재료를 하나 이상 선택하세요</div>
          ) : (
            results.map(({ item, calc }) => {
              const variantApplied = variant && item.variantAdjust[variant] !== undefined
              const isCarbFood = item.category === 'noodle' || item.category === 'grain'
              return (
                <div key={item.key} className={styles.result}>
                  <div className={styles.resultHead}>
                    <span className={styles.resultEmoji}>{item.emoji}</span>
                    <div>
                      <div className={styles.resultName}>{item.name}</div>
                      <div className={styles.resultPeople}>
                        {peopleLabel} · 1인당 약 {fmt(calc.perPerson)}{item.unit.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div className={styles.amountHero}>
                    <div className={styles.amountLead}>권장 준비량</div>
                    <div className={styles.amountRange}>
                      <span className={styles.amountMin}>{fmt(calc.min)}</span>
                      <span className={styles.amountTilde}>~</span>
                      <span className={styles.amountMax}>{fmt(calc.max)}</span>
                      <span className={styles.amountUnit}>{item.unit.split(' ')[0]}</span>
                    </div>
                    {pieceHint(item, calc.min, calc.max) && (
                      <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>
                        ≈ {pieceHint(item, calc.min, calc.max)}
                      </div>
                    )}
                    {item.marketPackage && (
                      <div className={styles.amountPkg}>📦 {item.marketPackage}</div>
                    )}
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
                      <span className={styles.tagBase}>{carb === 'yes' ? '탄수화물 포함' : '탄수화물 없음'}</span>
                    )}
                    {variantApplied && (
                      <span className={styles.tagBase}>조리: {variant} ({item.variantAdjust[variant!] > 0 ? '+' : ''}{item.variantAdjust[variant!]}g)</span>
                    )}
                  </div>

                  <div className={styles.cookTip}>💡 <strong>{item.cookingNote}</strong></div>
                </div>
              )
            })
          )}
        </>
      )}

      {/* ══════════ TAB 2: 장보기 목록 (NEW) ══════════ */}
      {tab === 'shopping' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>합산 장보기 — {peopleLabel}</label>
            {selectedItems.length === 0 ? (
              <p className={styles.empty}>먼저 <strong>재료별 분량</strong> 탭에서 재료를 선택해주세요.</p>
            ) : (
              <p className={styles.cardSub}>
                선택한 {selectedItems.length}종 재료의 사야 할 양을 합산. 각 재료별 <strong>📦 이미 있는 양</strong> 입력 시 자동으로 빼고 표시.
              </p>
            )}
          </div>

          {finalShoppingItems.length > 0 && (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>냉장고 보유 (선택 — 사야 할 양에서 자동 차감)</label>
                <table className={styles.fridgeTable}>
                  <thead>
                    <tr>
                      <th scope="col">재료</th>
                      <th scope="col">필요량</th>
                      <th scope="col">보유</th>
                      <th scope="col">사야 할 양</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalShoppingItems.map(({ item, calc, needMin, needMax }) => {
                      const u = item.unit.split(' ')[0]
                      const enough = needMin === 0 && needMax === 0
                      return (
                        <tr key={item.key}>
                          <td className={styles.fridgeName}>{item.emoji} {item.name}</td>
                          <td className={styles.fridgeNeed}>{calc.min}~{calc.max}{u}</td>
                          <td>
                            <input type="number" inputMode="numeric" min={0} max={9999}
                              className={styles.fridgeInput}
                              value={fridge[item.key] ?? 0}
                              onChange={(e) => {
                                const v = Math.max(0, +e.target.value || 0)
                                setFridge((prev) => ({ ...prev, [item.key]: v }))
                              }} /> {u}
                          </td>
                          <td className={`${styles.fridgeFinal} ${enough ? styles.fridgeEnough : ''}`}>
                            {enough ? '✓ 충분' : `${needMin}~${needMax}${u}`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.shopCard}>
                <div className={styles.shopHead}>
                  <span className={styles.shopTitle}>장보기 마크다운 카드</span>
                  <button type="button"
                    className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                    onClick={copyShopping}>
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>
                <pre className={styles.shopList}>{shoppingMarkdown}</pre>
              </div>

              <div className={styles.crossLinks}>
                <p className={styles.crossLinksTitle}>다음 단계</p>
                <div className={styles.crossLinksGrid}>
                  <Link href="/tools/life/unit-price" className={styles.crossLink}>💰 단가 비교 (가격 분석)</Link>
                  <Link href="/tools/cooking/substitute" className={styles.crossLink}>🔄 식재료 대체 (부족 시)</Link>
                  <Link href="/tools/cooking/thawing" className={styles.crossLink}>🧊 해동 시간 (안전 해동)</Link>
                  <Link href="/tools/cooking/recipe" className={styles.crossLink}>📐 레시피 비율 (인분 환산)</Link>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 3: 내 가족 (NEW) ══════════ */}
      {tab === 'family' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>가족 구성 (브라우저 로컬 저장)</label>
            <p className={styles.cardSub}>
              가족 구성을 저장하면 매번 입력 X. 연령·식사량별 인분 환산 자동.
            </p>

            {family.length === 0 ? (
              <p className={styles.empty}>아직 등록된 가족이 없습니다.</p>
            ) : (
              <div className={styles.familyList}>
                {family.map((m, i) => (
                  <div key={m.id} className={styles.familyRow}>
                    <span className={styles.familyIdx}>{i + 1}</span>
                    <input type="text" className={styles.familyName}
                      placeholder={i === 0 ? '본인' : `가족 ${i + 1}`}
                      value={m.name ?? ''}
                      maxLength={10}
                      onChange={(e) => updateMember(m.id, { name: e.target.value })} />
                    <select className={styles.familySelect}
                      value={m.age}
                      onChange={(e) => updateMember(m.id, { age: e.target.value as AgeBand })}>
                      {(Object.keys(AGE_BAND_LABEL) as AgeBand[]).map((k) => (
                        <option key={k} value={k}>{AGE_BAND_LABEL[k]}</option>
                      ))}
                    </select>
                    <select className={styles.familySelect}
                      value={m.appetite}
                      onChange={(e) => updateMember(m.id, { appetite: e.target.value as Appetite })}>
                      <option value="small">적게</option>
                      <option value="normal">보통</option>
                      <option value="large">많이</option>
                    </select>
                    <span className={styles.familyFactor}>
                      ×{(AGE_BAND_FACTOR[m.age] * APPETITE_MULT[m.appetite]).toFixed(2)}
                    </span>
                    <button className={styles.familyRemove} onClick={() => removeMember(m.id)} aria-label="삭제">✕</button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className={styles.addMemberBtn} onClick={addMember}>
              + 가족 추가
            </button>

            {family.length > 0 && (
              <div className={styles.familyTotal}>
                실질 인분 합계: <strong>{familyToEffectivePeople(family).toFixed(2)}</strong>
                <span className={styles.familyTotalNote}>
                  (성인=1.0 / 중·고생=0.9 / 초등=0.65 / 유아=0.4 / 영아=0.25, 식사량 곱)
                </span>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}
