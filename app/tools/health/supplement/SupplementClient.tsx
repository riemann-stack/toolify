'use client'

import { useState, useMemo } from 'react'
import s from './supplement.module.css'

/* ════════════════════════════════════════════════════════════
   데이터 정의
   ════════════════════════════════════════════════════════════ */
type Unit = 'mg' | 'μg' | 'IU'
type Timing = 'morningBefore' | 'morningAfter' | 'lunch' | 'dinnerBefore' | 'dinnerAfter' | 'bedtime'

interface IngredientDef {
  name: string
  category: '비타민' | '미네랄' | '기타'
  canonUnit: Unit
  rda?: number
  ul?: number
  warning?: string
  iuPerMcg?: number  // 1 μg = iuPerMcg × IU (지용성 비타민)
}

const INGREDIENTS: IngredientDef[] = [
  // 비타민
  { name: '비타민A(레티놀)',     category: '비타민', canonUnit: 'μg', rda: 700,  ul: 3000, iuPerMcg: 3.33, warning: '장기 과잉 섭취 시 간 독성, 임산부 기형아 위험' },
  { name: '비타민B1(티아민)',    category: '비타민', canonUnit: 'mg', rda: 1.2 },
  { name: '비타민B2(리보플라빈)',category: '비타민', canonUnit: 'mg', rda: 1.4 },
  { name: '비타민B3(나이아신)',  category: '비타민', canonUnit: 'mg', rda: 16,   ul: 35,   warning: '홍조, 간 독성 (니코틴산 형태 고용량)' },
  { name: '비타민B5(판토텐산)',  category: '비타민', canonUnit: 'mg', rda: 5 },
  { name: '비타민B6(피리독신)',  category: '비타민', canonUnit: 'mg', rda: 1.5,  ul: 100,  warning: '고용량 장기 복용 시 신경 손상' },
  { name: '비타민B7(비오틴)',    category: '비타민', canonUnit: 'μg', rda: 30 },
  { name: '비타민B9(엽산)',      category: '비타민', canonUnit: 'μg', rda: 400,  ul: 1000, warning: '비타민B12 결핍 마스킹 위험' },
  { name: '비타민B12(코발라민)', category: '비타민', canonUnit: 'μg', rda: 2.4 },
  { name: '비타민C',             category: '비타민', canonUnit: 'mg', rda: 100,  ul: 2000, warning: '소화 장애, 신장 결석 위험' },
  { name: '비타민D',             category: '비타민', canonUnit: 'IU', rda: 600,  ul: 4000, iuPerMcg: 40,   warning: '고칼슘혈증, 신장 결석 위험' },
  { name: '비타민E',             category: '비타민', canonUnit: 'mg', rda: 15,   ul: 1000, iuPerMcg: 1.49, warning: '출혈 위험 증가 (항응고제 복용 시 특히 주의)' },
  { name: '비타민K',             category: '비타민', canonUnit: 'μg', rda: 75 },
  // 미네랄
  { name: '칼슘',     category: '미네랄', canonUnit: 'mg', rda: 800,  ul: 2500, warning: '심혈관 위험, 신장 결석' },
  { name: '마그네슘', category: '미네랄', canonUnit: 'mg', rda: 310,  ul: 350,  warning: '보충제 기준, 설사 유발 (산화마그네슘 특히)' },
  { name: '아연',     category: '미네랄', canonUnit: 'mg', rda: 8,    ul: 40,   warning: '구리 흡수 방해, 면역 저하' },
  { name: '철분',     category: '미네랄', canonUnit: 'mg', rda: 8,    ul: 45,   warning: '소화 장애, 장기 과잉 시 장기 손상' },
  { name: '구리',     category: '미네랄', canonUnit: 'mg', rda: 0.8,  ul: 10 },
  { name: '셀레늄',   category: '미네랄', canonUnit: 'μg', rda: 55,   ul: 400,  warning: '탈모, 손발톱 변형 (셀레늄 독성)' },
  { name: '망간',     category: '미네랄', canonUnit: 'mg', rda: 3.5,  ul: 11 },
  { name: '크롬',     category: '미네랄', canonUnit: 'μg', rda: 30 },
  { name: '몰리브덴', category: '미네랄', canonUnit: 'μg', rda: 45,   ul: 500 },
  { name: '요오드',   category: '미네랄', canonUnit: 'μg', rda: 150,  ul: 1100, warning: '갑상선 기능 이상' },
  { name: '칼륨',     category: '미네랄', canonUnit: 'mg', rda: 3500 },
  { name: '나트륨',   category: '미네랄', canonUnit: 'mg', rda: 1500 },
  { name: '인',       category: '미네랄', canonUnit: 'mg', rda: 700,  ul: 3500 },
  { name: '불소',     category: '미네랄', canonUnit: 'mg', rda: 3.5,  ul: 10 },
  // 기타
  { name: '오메가3(EPA)',   category: '기타', canonUnit: 'mg' },
  { name: '오메가3(DHA)',   category: '기타', canonUnit: 'mg' },
  { name: '코엔자임Q10',    category: '기타', canonUnit: 'mg' },
  { name: '루테인',         category: '기타', canonUnit: 'mg' },
  { name: '지아잔틴',       category: '기타', canonUnit: 'mg' },
  { name: '밀크씨슬(실리마린)', category: '기타', canonUnit: 'mg' },
  { name: '아르기닌',       category: '기타', canonUnit: 'mg' },
  { name: '글루타민',       category: '기타', canonUnit: 'mg' },
  { name: '콜라겐',         category: '기타', canonUnit: 'mg' },
  { name: '히알루론산',     category: '기타', canonUnit: 'mg' },
  { name: '레시틴',         category: '기타', canonUnit: 'mg' },
  { name: '프로바이오틱스', category: '기타', canonUnit: 'mg' },
  { name: '프리바이오틱스', category: '기타', canonUnit: 'mg' },
  { name: '베타글루칸',     category: '기타', canonUnit: 'mg' },
  { name: '홍경천',         category: '기타', canonUnit: 'mg' },
  { name: '강황(커큐민)',   category: '기타', canonUnit: 'mg' },
  { name: '글루코사민',     category: '기타', canonUnit: 'mg' },
  { name: '콘드로이친',     category: '기타', canonUnit: 'mg' },
  { name: 'MSM',            category: '기타', canonUnit: 'mg' },
  { name: '알파리포산',     category: '기타', canonUnit: 'mg' },
  { name: 'NAC(N-아세틸시스테인)', category: '기타', canonUnit: 'mg' },
  { name: '레스베라트롤',   category: '기타', canonUnit: 'mg' },
  { name: 'EGCG',           category: '기타', canonUnit: 'mg' },
]

const INGREDIENT_MAP = new Map(INGREDIENTS.map((i) => [i.name, i]))

const TIMING_LABELS: Record<Timing, string> = {
  morningBefore: '아침 식전',
  morningAfter:  '아침 식후',
  lunch:         '점심',
  dinnerBefore:  '저녁 식전',
  dinnerAfter:   '저녁 식후',
  bedtime:       '취침 전',
}
const TIMINGS: Timing[] = ['morningBefore', 'morningAfter', 'lunch', 'dinnerBefore', 'dinnerAfter', 'bedtime']

const TIMING_REASONS: Record<Timing, string> = {
  morningBefore: '공복: 철분(+비타민C), 프로바이오틱스',
  morningAfter:  '식후(지용성): 비타민A/D/E/K, 오메가3, CoQ10 — 식이지방과 흡수율 최대 50% ↑',
  lunch:         '낮 시간대: 비타민B군(에너지 대사), 비타민C(항산화)',
  dinnerBefore:  '식전: 프로바이오틱스 (위산 낮을 때)',
  dinnerAfter:   '식후: 지용성·오메가3 남은 분량',
  bedtime:       '취침 전: 마그네슘(이완), 칼슘(야간 골 흡수), 프로바이오틱스',
}

const SYNERGY: { a: string; b: string; effect: string }[] = [
  { a: '비타민D', b: '칼슘',     effect: '비타민D가 칼슘 흡수를 돕습니다.' },
  { a: '비타민C', b: '철분',     effect: '비타민C가 철분 흡수를 최대 3배 향상시킵니다.' },
  { a: '비타민D', b: '마그네슘', effect: '마그네슘이 비타민D 활성화에 필요합니다.' },
  { a: '비타민B12', b: '엽산',   effect: '상호 활성화로 빈혈 예방 시너지를 냅니다.' },
  { a: '비타민E', b: '비타민C',  effect: '비타민C가 산화된 비타민E를 재생합니다 (항산화 시너지).' },
  { a: '오메가3(EPA)', b: '비타민E', effect: '비타민E가 오메가3의 산화를 방지합니다.' },
  { a: '오메가3(DHA)', b: '비타민E', effect: '비타민E가 오메가3의 산화를 방지합니다.' },
  { a: '루테인', b: '지아잔틴',   effect: '황반 건강에 함께 작용하는 대표 카로티노이드 쌍입니다.' },
  { a: '코엔자임Q10', b: '비타민E', effect: '미토콘드리아 항산화 시너지.' },
]

const CAUTION: { a: string; b: string; issue: string; tip: string }[] = [
  { a: '철분', b: '칼슘',         issue: '칼슘이 철분 흡수를 방해합니다.',                         tip: '2시간 이상 간격을 두고 복용하세요.' },
  { a: '철분', b: '아연',         issue: '고용량에서 서로의 흡수를 방해합니다.',                   tip: '식사와 함께 분리 복용을 고려하세요.' },
  { a: '아연', b: '구리',         issue: '아연 과잉 섭취 시 구리 흡수가 방해됩니다.',              tip: '아연:구리 비율 8~15:1 유지를 권장합니다.' },
  { a: '비타민E', b: '비타민K',   issue: '고용량 비타민E는 비타민K 기능을 방해할 수 있습니다.',    tip: '항응고제 복용 중이라면 의사 상담 필수.' },
  { a: '비타민A(레티놀)', b: '비타민D', issue: '과잉 섭취 시 비타민A가 비타민D 기능을 억제할 수 있습니다.', tip: '복합제 복용 시 각 성분 합산량을 꼭 확인하세요.' },
  { a: '마그네슘', b: '칼슘',     issue: '과잉 칼슘은 마그네슘 흡수를 방해합니다.',                tip: '칼슘:마그네슘 비율 2:1을 권장합니다.' },
  { a: '셀레늄', b: '비타민C',    issue: '고용량 비타민C가 셀레늄 흡수를 방해할 수 있습니다.',     tip: '시간 간격을 두거나 별도 복용을 고려하세요.' },
]

/* ════════════════════════════════════════════════════════════
   단위 변환
   ════════════════════════════════════════════════════════════ */
function convertToCanon(value: number, fromUnit: Unit, ing: IngredientDef): number | null {
  const canon = ing.canonUnit
  if (fromUnit === canon) return value

  // mg ↔ μg (질량 환산)
  if (fromUnit === 'mg' && canon === 'μg') return value * 1000
  if (fromUnit === 'μg' && canon === 'mg') return value / 1000

  // IU 환산 (μg 다리 경유)
  if (!ing.iuPerMcg) return null
  let mcg: number
  if (fromUnit === 'IU')       mcg = value / ing.iuPerMcg
  else if (fromUnit === 'μg')  mcg = value
  else if (fromUnit === 'mg')  mcg = value * 1000
  else return null

  if (canon === 'μg') return mcg
  if (canon === 'mg') return mcg / 1000
  if (canon === 'IU') return mcg * ing.iuPerMcg
  return null
}

/* ════════════════════════════════════════════════════════════
   상태 타입
   ════════════════════════════════════════════════════════════ */
interface IngredientEntry {
  id: string
  name: string
  amount: string
  unit: Unit
}
interface Supplement {
  id: string
  name: string
  timing: Timing | null
  collapsed: boolean
  ingredients: IngredientEntry[]
}

const genId = () => Math.random().toString(36).slice(2, 10)

const emptyIngredient = (): IngredientEntry => ({
  id: genId(),
  name: '',
  amount: '',
  unit: 'mg',
})
const emptySupplement = (): Supplement => ({
  id: genId(),
  name: '',
  timing: null,
  collapsed: false,
  ingredients: [emptyIngredient()],
})

/* ════════════════════════════════════════════════════════════
   프리셋
   ════════════════════════════════════════════════════════════ */
const PRESETS: { label: string; make: () => Supplement[] }[] = [
  {
    label: '종합비타민 세트',
    make: () => [{
      id: genId(), name: '종합비타민', timing: 'morningAfter', collapsed: false,
      ingredients: [
        { id: genId(), name: '비타민A(레티놀)', amount: '700',  unit: 'μg' },
        { id: genId(), name: '비타민D',          amount: '1000', unit: 'IU' },
        { id: genId(), name: '비타민E',          amount: '15',   unit: 'mg' },
        { id: genId(), name: '비타민C',          amount: '500',  unit: 'mg' },
        { id: genId(), name: '비타민B6(피리독신)', amount: '2', unit: 'mg' },
        { id: genId(), name: '비타민B12(코발라민)', amount: '6', unit: 'μg' },
        { id: genId(), name: '아연',              amount: '8',  unit: 'mg' },
      ],
    }],
  },
  {
    label: '비타민D 단독',
    make: () => [{
      id: genId(), name: '비타민D', timing: 'morningAfter', collapsed: false,
      ingredients: [{ id: genId(), name: '비타민D', amount: '1000', unit: 'IU' }],
    }],
  },
  {
    label: '오메가3 단독',
    make: () => [{
      id: genId(), name: '오메가3', timing: 'dinnerAfter', collapsed: false,
      ingredients: [
        { id: genId(), name: '오메가3(EPA)', amount: '300', unit: 'mg' },
        { id: genId(), name: '오메가3(DHA)', amount: '200', unit: 'mg' },
      ],
    }],
  },
  {
    label: '철분제 단독',
    make: () => [{
      id: genId(), name: '철분제', timing: 'morningBefore', collapsed: false,
      ingredients: [
        { id: genId(), name: '철분',    amount: '14',  unit: 'mg' },
        { id: genId(), name: '비타민C', amount: '100', unit: 'mg' },
      ],
    }],
  },
]

/* ════════════════════════════════════════════════════════════
   메인 컴포넌트
   ════════════════════════════════════════════════════════════ */
type TabKey = 'register' | 'analysis' | 'guide'

export default function SupplementClient() {
  const [tab, setTab] = useState<TabKey>('register')
  const [sups, setSups] = useState<Supplement[]>([emptySupplement()])

  const addSup = () => {
    if (sups.length >= 10) return
    setSups((p) => [...p, emptySupplement()])
  }
  const removeSup = (id: string) => setSups((p) => p.filter((s) => s.id !== id))
  const updateSup = (id: string, patch: Partial<Supplement>) =>
    setSups((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const addIng = (supId: string) =>
    setSups((p) => p.map((s) => (s.id === supId ? { ...s, ingredients: [...s.ingredients, emptyIngredient()] } : s)))
  const removeIng = (supId: string, ingId: string) =>
    setSups((p) => p.map((s) => (s.id === supId ? { ...s, ingredients: s.ingredients.filter((i) => i.id !== ingId) } : s)))
  const updateIng = (supId: string, ingId: string, patch: Partial<IngredientEntry>) =>
    setSups((p) => p.map((s) => (s.id === supId ? {
      ...s,
      ingredients: s.ingredients.map((i) => (i.id === ingId ? { ...i, ...patch } : i)),
    } : s)))
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const newOnes = preset.make()
    setSups((p) => {
      const firstIsEmpty = p.length === 1 && !p[0].name && p[0].ingredients.every((i) => !i.name && !i.amount)
      const base = firstIsEmpty ? [] : p
      return [...base, ...newOnes].slice(0, 10)
    })
  }
  const reset = () => setSups([emptySupplement()])

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        ⚕️ <strong>본 계산기는 참고용 정보 도구입니다.</strong> 정확한 영양제 복용 계획은 반드시 의사·약사와 상담하세요.
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'register' ? s.tabActive : ''}`} onClick={() => setTab('register')}>
          영양제 등록<span className={s.countBadge}>{sups.length}</span>
        </button>
        <button className={`${s.tab} ${tab === 'analysis' ? s.tabActive : ''}`} onClick={() => setTab('analysis')}>성분 분석</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`} onClick={() => setTab('guide')}>복용 가이드</button>
      </div>

      {tab === 'register' && (
        <RegisterTab
          sups={sups}
          addSup={addSup}
          removeSup={removeSup}
          updateSup={updateSup}
          addIng={addIng}
          removeIng={removeIng}
          updateIng={updateIng}
          applyPreset={applyPreset}
          reset={reset}
        />
      )}
      {tab === 'analysis' && <AnalysisTab sups={sups} />}
      {tab === 'guide' && <GuideTab sups={sups} />}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 1 — 등록
   ════════════════════════════════════════════════════════════ */
interface RegisterTabProps {
  sups: Supplement[]
  addSup: () => void
  removeSup: (id: string) => void
  updateSup: (id: string, patch: Partial<Supplement>) => void
  addIng: (supId: string) => void
  removeIng: (supId: string, ingId: string) => void
  updateIng: (supId: string, ingId: string, patch: Partial<IngredientEntry>) => void
  applyPreset: (preset: (typeof PRESETS)[number]) => void
  reset: () => void
}

function RegisterTab({ sups, addSup, removeSup, updateSup, addIng, removeIng, updateIng, applyPreset, reset }: RegisterTabProps) {
  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>빠른 입력 프리셋</span>
        <div className={s.presetRow}>
          {PRESETS.map((p) => (
            <button key={p.label} className={s.presetBtn} onClick={() => applyPreset(p)}>{p.label}</button>
          ))}
          <button className={s.resetBtn} onClick={reset} style={{ marginLeft: 'auto' }}>초기화</button>
        </div>
      </div>

      {sups.map((sup, idx) => (
        <div key={sup.id} className={`${s.supCard} ${s[`sup${idx % 5}`]}`}>
          <div className={s.supHead}>
            <input
              className={s.supNameInput}
              placeholder={`제품명 (예: 종근당 비타민D)`}
              value={sup.name}
              onChange={(e) => updateSup(sup.id, { name: e.target.value })}
            />
            <button className={s.supToggle} onClick={() => updateSup(sup.id, { collapsed: !sup.collapsed })}>
              {sup.collapsed ? '▼' : '▲'}
            </button>
            {sups.length > 1 && (
              <button className={s.supRemove} onClick={() => removeSup(sup.id)} aria-label="삭제">✕</button>
            )}
          </div>

          {!sup.collapsed && (
            <>
              {sup.ingredients.map((ing) => (
                <div key={ing.id} className={s.ingRow}>
                  <select
                    className={s.ingSelect}
                    value={ing.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const def = INGREDIENT_MAP.get(name)
                      const patch: Partial<IngredientEntry> = { name }
                      if (def) patch.unit = def.canonUnit
                      updateIng(sup.id, ing.id, patch)
                    }}
                  >
                    <option value="">성분 선택</option>
                    <optgroup label="비타민">
                      {INGREDIENTS.filter((i) => i.category === '비타민').map((i) => (
                        <option key={i.name} value={i.name}>{i.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="미네랄">
                      {INGREDIENTS.filter((i) => i.category === '미네랄').map((i) => (
                        <option key={i.name} value={i.name}>{i.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="기타">
                      {INGREDIENTS.filter((i) => i.category === '기타').map((i) => (
                        <option key={i.name} value={i.name}>{i.name}</option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    className={s.ingInput}
                    type="number"
                    inputMode="decimal"
                    placeholder="함량"
                    min={0}
                    value={ing.amount}
                    onChange={(e) => updateIng(sup.id, ing.id, { amount: e.target.value })}
                  />
                  <select
                    className={s.ingUnitSelect}
                    value={ing.unit}
                    onChange={(e) => updateIng(sup.id, ing.id, { unit: e.target.value as Unit })}
                  >
                    <option value="mg">mg</option>
                    <option value="μg">μg</option>
                    <option value="IU">IU</option>
                  </select>
                  <button
                    className={s.ingRemove}
                    onClick={() => removeIng(sup.id, ing.id)}
                    aria-label="성분 삭제"
                    disabled={sup.ingredients.length <= 1}
                  >✕</button>
                </div>
              ))}
              <button className={s.addIngBtn} onClick={() => addIng(sup.id)}>+ 성분 추가</button>

              <div className={s.timeRow}>
                {TIMINGS.map((t) => (
                  <button
                    key={t}
                    className={`${s.timeBtn} ${sup.timing === t ? s.timeBtnActive : ''}`}
                    onClick={() => updateSup(sup.id, { timing: sup.timing === t ? null : t })}
                  >
                    {TIMING_LABELS[t]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      <button className={s.addSupBtn} onClick={addSup} disabled={sups.length >= 10}>
        + 영양제 추가 {sups.length >= 10 && '(최대 10개)'}
      </button>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   분석 집계
   ════════════════════════════════════════════════════════════ */
interface Aggregate {
  ing: IngredientDef
  byProduct: { productName: string; value: number; display: string }[]  // canon 값
  total: number
  status: 'ok' | 'over' | 'exceed' | 'low' | 'none'
}

function aggregate(sups: Supplement[]): Aggregate[] {
  const map = new Map<string, Aggregate>()

  for (const sup of sups) {
    const productName = sup.name.trim() || `제품 ${sups.indexOf(sup) + 1}`
    for (const ing of sup.ingredients) {
      if (!ing.name) continue
      const def = INGREDIENT_MAP.get(ing.name)
      if (!def) continue
      const amount = parseFloat(ing.amount)
      if (!isFinite(amount) || amount <= 0) continue

      const canonVal = convertToCanon(amount, ing.unit, def)
      if (canonVal === null) continue

      const existing = map.get(def.name)
      const display = `${amount}${ing.unit}`
      if (existing) {
        existing.byProduct.push({ productName, value: canonVal, display })
        existing.total += canonVal
      } else {
        map.set(def.name, {
          ing: def,
          byProduct: [{ productName, value: canonVal, display }],
          total: canonVal,
          status: 'ok',
        })
      }
    }
  }

  for (const agg of map.values()) {
    const { rda, ul } = agg.ing
    if (ul !== undefined && agg.total > ul) agg.status = 'exceed'
    else if (rda !== undefined && agg.total > rda) agg.status = 'over'
    else if (rda !== undefined && agg.total < rda * 0.5) agg.status = 'low'
    else if (rda !== undefined) agg.status = 'ok'
    else agg.status = 'none'
  }

  return Array.from(map.values())
}

function fmtNum(n: number): string {
  if (n >= 100) return n.toFixed(0)
  if (n >= 10)  return n.toFixed(1)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

/* ════════════════════════════════════════════════════════════
   TAB 2 — 분석
   ════════════════════════════════════════════════════════════ */
function AnalysisTab({ sups }: { sups: Supplement[] }) {
  const aggregates = useMemo(() => aggregate(sups), [sups])
  const hasAny = aggregates.length > 0

  const productNames = useMemo(
    () => sups.map((s, i) => s.name.trim() || `제품 ${i + 1}`),
    [sups]
  )

  // 중복 (2개 이상 제품에 포함)
  const duplicates = aggregates.filter((a) => a.byProduct.length >= 2)

  // 주의 성분 (exceed / over)
  const warnings = aggregates.filter((a) => a.status === 'exceed' || a.status === 'over')

  if (!hasAny) {
    return (
      <div className={s.card}>
        <div className={s.empty}>
          먼저 <strong>영양제 등록</strong> 탭에서 제품과 성분을 입력해주세요.<br />
          성분명·함량이 입력되면 자동으로 합산·분석됩니다.
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 합산표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>성분별 합산 · 상태</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.resultTable}>
            <thead>
              <tr>
                <th>성분</th>
                {productNames.map((n, i) => (
                  <th key={i} style={{ fontSize: 11 }}>{n}</th>
                ))}
                <th>합계</th>
                <th>권장량</th>
                <th>상한</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {aggregates.map((a) => {
                const { ing, total, status } = a
                const rowClass = status === 'exceed' ? s.rowExceed : status === 'over' ? s.rowOver : ''

                // 진행 바
                const barMax = ing.ul ?? (ing.rda !== undefined ? ing.rda * 2 : total * 1.2)
                const barGreenEnd = ing.rda !== undefined ? Math.min(ing.rda, barMax) : barMax
                const barOrangeEnd = ing.ul !== undefined ? ing.ul : barMax
                const markerPct = Math.min(100, (total / barMax) * 100)
                const greenPct = (barGreenEnd / barMax) * 100
                const orangePct = ((barOrangeEnd - barGreenEnd) / barMax) * 100

                const byMap = new Map(a.byProduct.map((bp) => [bp.productName, bp.display]))

                return (
                  <tr key={ing.name} className={rowClass}>
                    <td>
                      <div className={s.ingName}>{ing.name}</div>
                      {ing.rda !== undefined && (
                        <div className={s.progressBar}>
                          <div className={s.progressGreen}  style={{ width: `${greenPct}%`, left: 0 }} />
                          <div className={s.progressOrange} style={{ width: `${orangePct}%`, left: `${greenPct}%` }} />
                          <div className={s.progressMarker} style={{ left: `${markerPct}%` }} />
                        </div>
                      )}
                    </td>
                    {productNames.map((n, i) => {
                      const v = byMap.get(n)
                      return (
                        <td key={i} className={s.ingValMuted}>
                          {v ?? <span className={s.ingValDash}>—</span>}
                        </td>
                      )
                    })}
                    <td className={s.ingVal}>{fmtNum(total)}{ing.canonUnit}</td>
                    <td className={s.ingValMuted}>{ing.rda !== undefined ? `${fmtNum(ing.rda)}${ing.canonUnit}` : '—'}</td>
                    <td className={s.ingValMuted}>{ing.ul !== undefined ? `${fmtNum(ing.ul)}${ing.canonUnit}` : '—'}</td>
                    <td>
                      {status === 'exceed' && <span className={`${s.badge} ${s.badgeExceed}`}>🚨 상한 초과</span>}
                      {status === 'over' &&   <span className={`${s.badge} ${s.badgeOver}`}>🔶 권장량 초과</span>}
                      {status === 'ok' &&     <span className={`${s.badge} ${s.badgeOk}`}>✅ 적정</span>}
                      {status === 'low' &&    <span className={`${s.badge} ${s.badgeLow}`}>⬇️ 부족</span>}
                      {status === 'none' &&   <span className={`${s.badge} ${s.badgeNone}`}>기준 없음</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 중복 */}
      {duplicates.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>중복 감지된 성분 ({duplicates.length}개)</span>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
            아래 성분이 2개 이상 제품에 포함됩니다:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {duplicates.map((a) => (
              <div key={a.ing.name} className={s.dupCard}>
                <strong>{a.ing.name}</strong>:{' '}
                {a.byProduct.map((bp, i) => (
                  <span key={i}>
                    {i > 0 && ' + '}
                    {bp.productName}({bp.display})
                  </span>
                ))}
                {' = '}
                <strong>{fmtNum(a.total)}{a.ing.canonUnit}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주의 성분 */}
      {warnings.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>주의 성분</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {warnings.map((a) => (
              <div
                key={a.ing.name}
                className={s.hintCard}
                style={{
                  background: a.status === 'exceed' ? 'rgba(255,70,70,0.06)' : 'rgba(255,140,62,0.06)',
                  border: a.status === 'exceed' ? '1px solid rgba(255,70,70,0.3)' : '1px solid rgba(255,140,62,0.3)',
                }}
              >
                <div className={s.hintHead}>
                  {a.status === 'exceed' ? '🚨' : '🔶'} {a.ing.name} — {fmtNum(a.total)}{a.ing.canonUnit}
                  {a.ing.ul !== undefined && (
                    <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 6 }}>
                      (상한 {fmtNum(a.ing.ul)}{a.ing.canonUnit})
                    </span>
                  )}
                </div>
                {a.ing.warning && <div className={s.hintBody}>{a.ing.warning}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={s.disclaimer}>
        ⚕️ 위 수치는 <strong>한국영양학회·보건복지부 한국인 영양소 섭취 기준</strong>을 참고한 성인 일반 기준입니다. 임산부·수유부·기저 질환자는 전문가와 상담하세요.
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 3 — 복용 가이드
   ════════════════════════════════════════════════════════════ */
function GuideTab({ sups }: { sups: Supplement[] }) {
  const hasAny = sups.some((sp) => sp.name || sp.ingredients.some((i) => i.name))
  if (!hasAny) {
    return (
      <div className={s.card}>
        <div className={s.empty}>
          먼저 <strong>영양제 등록</strong> 탭에서 제품과 복용 시간대를 입력해주세요.
        </div>
      </div>
    )
  }

  // 등록된 성분 이름 집합
  const ingredientSet = new Set<string>()
  for (const sup of sups) {
    for (const ing of sup.ingredients) {
      if (ing.name && ing.amount && parseFloat(ing.amount) > 0) ingredientSet.add(ing.name)
    }
  }

  // 시너지/주의 매칭
  const activeSynergy = SYNERGY.filter((syn) => ingredientSet.has(syn.a) && ingredientSet.has(syn.b))
  const activeCaution = CAUTION.filter((c) => ingredientSet.has(c.a) && ingredientSet.has(c.b))

  // 시간대별 그룹핑
  const byTime = TIMINGS.map((t) => ({
    timing: t,
    label: TIMING_LABELS[t],
    reason: TIMING_REASONS[t],
    sups: sups.filter((sp) => sp.timing === t && sp.name),
  }))
  const unassigned = sups.filter((sp) => sp.timing === null && sp.name)

  return (
    <>
      {/* 복용 타이밍 */}
      <div className={s.card}>
        <span className={s.cardLabel}>복용 타이밍 정리</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {byTime.map((t) => (
            <div key={t.timing} className={s.timeSection}>
              <div className={s.timeSectionHead}>{t.label}</div>
              <div className={s.timeSupList}>
                {t.sups.length > 0 ? (
                  t.sups.map((sp) => (
                    <div key={sp.id} className={s.timeSupItem}>• {sp.name}</div>
                  ))
                ) : (
                  <div className={s.timeEmpty}>— 등록된 영양제 없음</div>
                )}
              </div>
              <div className={s.timeReason}>💡 {t.reason}</div>
            </div>
          ))}
        </div>
        {unassigned.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
            ⚠️ 시간 미지정 제품: {unassigned.map((s) => s.name).join(', ')}
          </div>
        )}
      </div>

      {/* 시너지 */}
      <div className={s.card}>
        <span className={s.cardLabel}>시너지 조합 {activeSynergy.length > 0 && `(${activeSynergy.length}개)`}</span>
        {activeSynergy.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeSynergy.map((syn, i) => (
              <div key={i} className={`${s.hintCard} ${s.synergyCard}`}>
                <div className={s.hintHead}>❤️ {syn.a} + {syn.b}</div>
                <div className={s.hintBody}>{syn.effect}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            등록된 성분 조합에서 특별한 시너지는 감지되지 않았습니다.
          </p>
        )}
      </div>

      {/* 주의 조합 */}
      <div className={s.card}>
        <span className={s.cardLabel}>주의 조합 {activeCaution.length > 0 && `(${activeCaution.length}개)`}</span>
        {activeCaution.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeCaution.map((c, i) => (
              <div key={i} className={`${s.hintCard} ${s.cautionCard}`}>
                <div className={s.hintHead}>⚡ {c.a} + {c.b}</div>
                <div className={s.hintBody}>
                  <strong style={{ color: '#FFB86B' }}>{c.issue}</strong><br />
                  💡 {c.tip}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            등록된 성분 조합에서 상충/방해 조합은 감지되지 않았습니다.
          </p>
        )}
      </div>

      <div className={s.disclaimer}>
        ⚕️ 위 조합 정보는 일반적인 참고 자료입니다. <strong>처방약 복용 중</strong>이거나 <strong>임산부·수유부·기저 질환자</strong>는 반드시 의사·약사와 상담 후 복용하세요.
      </div>
    </>
  )
}
