/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './baker-percent.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const n = (v: string | number, d = 0): number => {
  const x = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v
  return Number.isFinite(x) ? x : d
}
const fmt = (v: number, dp = 0): string => {
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
const round1 = (v: number) => Math.round(v * 10) / 10

// ─────────────────────────────────────────────
// 타입·카테고리
// ─────────────────────────────────────────────
type Category = 'flour' | 'liquid' | 'salt' | 'yeast' | 'sugar' | 'fat' | 'other'
type Ingredient = {
  id: string
  name: string
  weight: number
  percent: number
  category: Category
  liquidRatio?: number // 우유 0.9, 계란 0.75 등
}

const CATEGORIES: { key: Category; label: string; emoji: string; cls: string; dotCls: string }[] = [
  { key: 'flour',  label: '🌾 밀가루', emoji: '🌾', cls: s.ingFlour,  dotCls: s.dotFlour },
  { key: 'liquid', label: '💧 액체',   emoji: '💧', cls: s.ingLiquid, dotCls: s.dotLiquid },
  { key: 'salt',   label: '🧂 소금',   emoji: '🧂', cls: s.ingSalt,   dotCls: s.dotSalt },
  { key: 'yeast',  label: '🧫 이스트', emoji: '🧫', cls: s.ingYeast,  dotCls: s.dotYeast },
  { key: 'sugar',  label: '🍯 당류',   emoji: '🍯', cls: s.ingSugar,  dotCls: s.dotSugar },
  { key: 'fat',    label: '🧈 지방',   emoji: '🧈', cls: s.ingFat,    dotCls: s.dotFat },
  { key: 'other',  label: '🥚 기타',   emoji: '🥚', cls: s.ingOther,  dotCls: s.dotOther },
]
const catMeta = (k: Category) => CATEGORIES.find(c => c.key === k) ?? CATEGORIES[6]

// 카테고리별 SVG 색상 (CSS dot 색상과 일치)
const CATEGORY_COLORS: Record<Category, string> = {
  flour:  '#0EA5E9',
  liquid: '#0891B2',
  salt:   '#D97706',
  yeast:  '#9B59B6',
  sugar:  '#EA580C',
  fat:    '#E8B947',
  other:  '#94A3B8',
}
const CATEGORY_DESC: Record<Category, string> = {
  flour:  '곡물',
  liquid: '수분',
  salt:   '발효 조절',
  yeast:  '발효',
  sugar:  '단맛·갈변',
  fat:    '부드러움',
  other:  '부재료',
}

// SVG 도넛 슬라이스 path 생성
function describeDonutSlice(cx: number, cy: number, ro: number, ri: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const sweep = endDeg - startDeg

  // 100% 단일 슬라이스 — 동심원 두 개로 도넛 그리기
  if (sweep >= 359.99) {
    return [
      `M ${cx + ro} ${cy}`,
      `A ${ro} ${ro} 0 1 1 ${cx - ro} ${cy}`,
      `A ${ro} ${ro} 0 1 1 ${cx + ro} ${cy}`,
      `M ${cx + ri} ${cy}`,
      `A ${ri} ${ri} 0 1 0 ${cx - ri} ${cy}`,
      `A ${ri} ${ri} 0 1 0 ${cx + ri} ${cy}`,
      'Z',
    ].join(' ')
  }

  const x1o = cx + ro * Math.cos(toRad(startDeg))
  const y1o = cy + ro * Math.sin(toRad(startDeg))
  const x2o = cx + ro * Math.cos(toRad(endDeg))
  const y2o = cy + ro * Math.sin(toRad(endDeg))
  const x2i = cx + ri * Math.cos(toRad(endDeg))
  const y2i = cy + ri * Math.sin(toRad(endDeg))
  const x1i = cx + ri * Math.cos(toRad(startDeg))
  const y1i = cy + ri * Math.sin(toRad(startDeg))
  const largeArc = sweep > 180 ? 1 : 0

  return [
    `M ${x1o} ${y1o}`,
    `A ${ro} ${ro} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x2i} ${y2i}`,
    `A ${ri} ${ri} 0 ${largeArc} 0 ${x1i} ${y1i}`,
    'Z',
  ].join(' ')
}

// 카테고리별 무게 합산 → 도넛 차트 데이터
type CompositionGroup = { category: Category; weight: number; pct: number; color: string; path: string }
function buildComposition(ings: Ingredient[]): { groups: CompositionGroup[]; totalWeight: number } {
  const totalWeight = ings.reduce((sum, i) => sum + i.weight, 0)
  if (totalWeight <= 0) return { groups: [], totalWeight: 0 }

  // CATEGORIES 순서 유지 (시각적 일관성)
  const groups: CompositionGroup[] = []
  let angle = -90 // 12시 방향에서 시작
  for (const cm of CATEGORIES) {
    const w = ings.filter(i => i.category === cm.key).reduce((s, i) => s + i.weight, 0)
    if (w <= 0) continue
    const pct = (w / totalWeight) * 100
    const sweep = (w / totalWeight) * 360
    const path = describeDonutSlice(100, 100, 90, 50, angle, angle + sweep)
    angle += sweep
    groups.push({ category: cm.key, weight: w, pct, color: CATEGORY_COLORS[cm.key], path })
  }
  return { groups, totalWeight }
}

/* ─────── 식감·외관 추정 ─────── */
type AnalysisLike = {
  hydration: number; fatPct: number; sugarPct: number; saltPct: number; yeastPct: number
}
function textureDesc(a: AnalysisLike): { headline: string; detail: string; tags: string[] } {
  const { hydration: h, fatPct: f, sugarPct: sg, saltPct: sa } = a

  // 크럼 — 수분율 기반
  let crumb: string
  if (h < 60)      crumb = '조밀하고 쫄깃한 크럼'
  else if (h < 70) crumb = '부드럽고 균일한 크럼'
  else if (h < 80) crumb = '탄력 있고 기포가 적당한 오픈 크럼'
  else if (h < 90) crumb = '촉촉하고 큰 기포가 풍부한 오픈 크럼'
  else             crumb = '매우 촉촉하고 불규칙한 큰 기포의 크럼'

  // 풍부함 — 지방
  let richness: string
  if (f < 2)       richness = '담백한 린(lean) 빵 결'
  else if (f < 8)  richness = '약간 부드러운 결'
  else if (f < 15) richness = '버터 풍미가 풍부한 부드러운 결'
  else             richness = '매우 풍부한 버터·페이스트리 결'

  // 단맛
  let sweet: string | null = null
  if (sg >= 2 && sg < 8) sweet = '은은한 단맛'
  else if (sg >= 8)      sweet = '또렷한 단맛 (단과자빵 수준)'

  // 크러스트
  const crust = (sg > 5 || f > 5) ? '진한 갈색의 부드러운 크러스트' : '바삭한 크러스트'

  const headline = `${crumb} · ${richness}${sweet ? ' · ' + sweet : ''}, ${crust}`
  const detail =
    `수분율 ${round1(h)}% 가 크럼의 결을 결정하고, 지방 ${round1(f)}% 가 부드러움을 더합니다. ` +
    `${sg >= 5 ? `당분 ${round1(sg)}% 로 발효와 갈변이 활발하며, ` : ''}` +
    `소금 ${round1(sa)}% 가 글루텐을 강화하고 발효 속도를 조절합니다.`

  // 빵 종류 추정 태그
  const tags: string[] = []
  if (h < 58 && f < 5)                        tags.push('베이글·비스킷 류')
  else if (h < 68 && f < 5 && sg < 3)         tags.push('린 식빵·바게트')
  else if (h < 70 && f >= 4 && sg >= 4)       tags.push('단과자빵·식빵')
  else if (h < 75 && f >= 15)                 tags.push('브리오슈·크루아상')
  else if (h >= 75 && h < 82 && f < 5)        tags.push('사워도우·캄파뉴')
  else if (h >= 80 && f < 8)                  tags.push('치아바타·포카치아')
  else if (h >= 90)                            tags.push('극고수분 — 다루기 어려움')

  if (sa >= 1.8 && sa <= 2.2) tags.push('소금 표준')
  if (f >= 8)                  tags.push('지방 풍부')
  if (sg >= 5)                 tags.push('당분 충분')

  return { headline, detail, tags }
}

/* ─────── 도넛 차트 컴포넌트 ─────── */
function CompositionChart({ ingredients }: { ingredients: Ingredient[] }) {
  const { groups, totalWeight } = buildComposition(ingredients)
  if (totalWeight <= 0 || groups.length === 0) return null

  return (
    <div className={s.pieWrap}>
      <svg viewBox="0 0 200 200" className={s.pieSvg} aria-hidden="true">
        <circle cx={100} cy={100} r={90} fill="rgba(255,255,255,0.03)" stroke="var(--border)" strokeWidth={1} />
        {groups.map((g, i) => (
          <path key={i} d={g.path} fill={g.color} stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} />
        ))}
        <text x={100} y={88} textAnchor="middle" className={s.pieCenterLabel}>총 반죽</text>
        <text x={100} y={108} textAnchor="middle" className={s.pieCenterValue}>{fmt(totalWeight)}</text>
        <text x={100} y={124} textAnchor="middle" className={s.pieCenterUnit}>g</text>
      </svg>
      <div className={s.pieLegend}>
        {groups.map((g, i) => (
          <div key={i} className={s.pieLegendRow}>
            <span className={s.pieLegendDot} style={{ background: g.color }} />
            <span className={s.pieLegendName}>
              {catMeta(g.category).label}
              <small>· {CATEGORY_DESC[g.category]}</small>
            </span>
            <span className={s.pieLegendWeight}>{fmt(g.weight)}g</span>
            <span className={s.pieLegendPct}>{round1(g.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────── 식감 카드 컴포넌트 ─────── */
function TextureCard({ analysis }: { analysis: AnalysisLike }) {
  const t = textureDesc(analysis)
  return (
    <div className={s.textureCard}>
      <div className={s.textureLabel}>🧁 예상 식감·외관</div>
      <p className={s.textureBody}>{t.headline}</p>
      <p className={s.textureBody} style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{t.detail}</p>
      {t.tags.length > 0 && (
        <div className={s.textureTags}>
          {t.tags.map(tag => <span key={tag} className={s.textureTag}>{tag}</span>)}
        </div>
      )}
    </div>
  )
}

const liquidRatioOf = (name: string): number => {
  if (name.includes('우유') || name.includes('버터밀크')) return 0.9
  if (name.includes('계란') || name.includes('달걀')) return 0.75
  return 1
}

// 르방·프리퍼먼트(other 카테고리) 감지 → 전체 수분율 계산 시 안의 밀가루·물을 분리.
// 이름의 "○○% 수분"에서 수분율을 읽고, 없으면 100%(르방 표준)로 가정.
const prefermentHydrationOf = (i: { name: string; category: Category }): number | null => {
  if (i.category !== 'other') return null
  if (!/르방|levain|사워|스타터|발효종|프리퍼먼트|폴리쉬|poolish/i.test(i.name)) return null
  const m = i.name.match(/(\d+(?:\.\d+)?)\s*%\s*수분/)
  return m ? parseFloat(m[1]) : 100
}

// ─────────────────────────────────────────────
// 빵 프리셋
// ─────────────────────────────────────────────
type Preset = {
  key: string
  name: string
  icon: string
  note: string
  hasPreferment?: boolean
  ingredients: { name: string; percent: number; category: Category }[]
}

const PRESETS: Preset[] = [
  { key: 'whitePan', name: '식빵',     icon: '🍞', note: '한국 가정용 표준', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 65,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '인스턴트 이스트', percent: 1, category: 'yeast' },
    { name: '설탕',   percent: 6,   category: 'sugar' },
    { name: '버터',   percent: 5,   category: 'fat' },
    { name: '분유',   percent: 4,   category: 'other' },
  ]},
  { key: 'baguette', name: '바게트',   icon: '🥖', note: '클래식 4재료', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 70,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '인스턴트 이스트', percent: 0.5, category: 'yeast' },
  ]},
  { key: 'ciabatta', name: '치아바타', icon: '🥖', note: '고수분 이탈리안', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 80,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '인스턴트 이스트', percent: 0.5, category: 'yeast' },
    { name: '올리브오일', percent: 3, category: 'fat' },
  ]},
  { key: 'sourdough', name: '사워도우', icon: '🥖', note: '천연발효빵', hasPreferment: true, ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 75,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '르방 (100% 수분율)', percent: 20, category: 'other' },
  ]},
  { key: 'pizzaDough', name: '피자 도우', icon: '🍕', note: '나폴리탄 스타일', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 60,  category: 'liquid' },
    { name: '소금',   percent: 2.5, category: 'salt' },
    { name: '인스턴트 이스트', percent: 0.3, category: 'yeast' },
    { name: '올리브오일', percent: 3, category: 'fat' },
  ]},
  { key: 'bagel', name: '베이글',     icon: '🥯', note: '저수분 쫄깃', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '물',     percent: 55,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '인스턴트 이스트', percent: 1, category: 'yeast' },
    { name: '설탕',   percent: 4,   category: 'sugar' },
  ]},
  { key: 'croissant', name: '크루아상', icon: '🥐', note: '버터 라미네이션', ingredients: [
    { name: '강력분', percent: 70, category: 'flour' },
    { name: '박력분', percent: 30, category: 'flour' },
    { name: '물',     percent: 35, category: 'liquid' },
    { name: '우유',   percent: 20, category: 'liquid' },
    { name: '소금',   percent: 2,  category: 'salt' },
    { name: '인스턴트 이스트', percent: 1, category: 'yeast' },
    { name: '설탕',   percent: 12, category: 'sugar' },
    { name: '버터(반죽용)', percent: 5, category: 'fat' },
    { name: '버터(충전용)', percent: 50, category: 'fat' },
  ]},
  { key: 'brioche', name: '브리오슈', icon: '🍞', note: '버터·계란 풍부', ingredients: [
    { name: '강력분', percent: 100, category: 'flour' },
    { name: '계란',   percent: 40,  category: 'liquid' },
    { name: '우유',   percent: 20,  category: 'liquid' },
    { name: '소금',   percent: 2,   category: 'salt' },
    { name: '인스턴트 이스트', percent: 1, category: 'yeast' },
    { name: '설탕',   percent: 15,  category: 'sugar' },
    { name: '버터',   percent: 50,  category: 'fat' },
  ]},
]

const FLOUR_QUICK = [250, 500, 1000, 2000]

// 빵 종류별 1개 완성품 무게(굽기 후) + 굽기 손실률 — 생반죽 → 완성 개수 환산에 사용
const PRODUCT_SIZES = [
  { name: '식빵 (450g)',     w: 450, loss: 12 },
  { name: '바게트 (250g)',   w: 250, loss: 15 },
  { name: '치아바타 (300g)', w: 300, loss: 14 },
  { name: '베이글 (90g)',    w: 90,  loss: 8 },
  { name: '피자 도우 (250g)', w: 250, loss: 10 },
]

// 발효·굽기 후 감소율
const BAKE_LOSS = {
  whitePan:  12,
  baguette:  15,
  ciabatta:  14,
  sourdough: 13,
  pizzaDough: 10,
  bagel:      8,
  croissant: 12,
  brioche:   12,
  default:   12,
}

// 이스트 종류 변환 (인스턴트 드라이 1g 기준)
const YEAST_RATIOS = [
  { key: 'instant',  name: '인스턴트 드라이', ratio: 1 },
  { key: 'active',   name: '액티브 드라이',   ratio: 1.25 },
  { key: 'fresh',    name: '생이스트',         ratio: 3 },
  { key: 'levain',   name: '천연발효종 (참고)', ratio: 25, note: '르방 100~150g 권장' },
]

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

let idCounter = 0
const makeId = () => `ing-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`

function buildFromPreset(preset: Preset, flourWeight: number): Ingredient[] {
  return preset.ingredients.map(i => ({
    id: makeId(),
    name: i.name,
    percent: i.percent,
    weight: (flourWeight * i.percent) / 100,
    category: i.category,
    liquidRatio: i.category === 'liquid' ? liquidRatioOf(i.name) : undefined,
  }))
}

const DEFAULT_INGREDIENTS: Ingredient[] = buildFromPreset(PRESETS[0], 500)

type Favorite = {
  id: string
  name: string
  baseFlour: number
  ingredients: Ingredient[]
  hydration: number
  totalWeight: number
  savedAt: number
}

const FAV_KEY = 'youtil-baker-percent-favs-v1'

/* ─────────────────────────────────────────────
   재료 행 (모듈 레벨 — 매 렌더마다 재정의되지 않도록)
   레이아웃: × / 카테고리 / dot / 이름 / 입력 / 결과
   ───────────────────────────────────────────── */
interface IngredientRowProps {
  items: Ingredient[]
  mode: 'weight' | 'pct'
  onUpdateWeight?: (id: string, w: number) => void
  onUpdatePct?: (id: string, p: number) => void
  onUpdateField: (id: string, patch: Partial<Ingredient>) => void
  onRemove: (id: string) => void
}

function IngredientRowEditable({ items, mode, onUpdateWeight, onUpdatePct, onUpdateField, onRemove }: IngredientRowProps) {
  return (
    <div className={s.ingredientList}>
      {items.map(i => {
        const meta = catMeta(i.category)
        return (
          <div key={i.id} className={`${s.ingredientRow} ${meta.cls}`}>
            {/* 1) 삭제 */}
            <button className={s.removeBtn} onClick={() => onRemove(i.id)} type="button" aria-label="삭제">×</button>
            {/* 2) 카테고리 선택 */}
            <select
              className={s.catSelect}
              value={i.category}
              onChange={e => onUpdateField(i.id, { category: e.target.value as Category })}
              aria-label="카테고리"
              title={meta.label}
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {/* 3) 색상 dot */}
            <span className={`${s.dotIcon} ${meta.dotCls}`} />
            {/* 4) 재료명 */}
            <div className={s.nameCell}>
              <input
                type="text"
                value={i.name}
                placeholder="재료명"
                onChange={e => onUpdateField(i.id, { name: e.target.value })}
              />
            </div>
            {/* 5) 입력 (모드에 따라 무게 또는 %) */}
            {mode === 'weight' ? (
              <div className={s.weightCell}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={i.weight === 0 ? '' : i.weight}
                  onChange={e => onUpdateWeight?.(i.id, n(e.target.value, 0))}
                  placeholder="g"
                />
                <span className={s.unit}>g</span>
              </div>
            ) : (
              <div className={s.weightCell}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={round1(i.percent) === 0 ? '' : round1(i.percent)}
                  onChange={e => onUpdatePct?.(i.id, n(e.target.value, 0))}
                  placeholder="%"
                />
                <span className={s.unit}>%</span>
              </div>
            )}
            {/* 6) 결과 (입력 반대) */}
            <div className={s.pctCell}>
              {mode === 'weight'
                ? `${round1(i.percent)}%`
                : `${fmt(i.weight)}g`}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BakerPercentClient() {
  const [tab, setTab] = useState<'toPercent' | 'toWeight' | 'fromTotal' | 'preferment'>('toWeight')

  // ─ TAB 1 (재료량 → 퍼센트) ─
  const [presetKey1, setPresetKey1] = useState<string>('whitePan')
  const [ing1, setIng1] = useState<Ingredient[]>(() => DEFAULT_INGREDIENTS.map(x => ({ ...x })))

  // ─ TAB 2 (퍼센트 → 재료량) ─
  const [presetKey, setPresetKey] = useState<string>('whitePan')
  const [flourWeight, setFlourWeight] = useState<number>(500)
  const [ing2, setIng2] = useState<Ingredient[]>(() => buildFromPreset(PRESETS[0], 500))

  // ─ TAB 3 (총 반죽량 역산) ─
  const [presetKey3, setPresetKey3] = useState<string>('whitePan')
  const [targetTotal, setTargetTotal] = useState<number>(900)
  const [ing3, setIng3] = useState<Ingredient[]>(() => buildFromPreset(PRESETS[0], 500))

  // ─ TAB 4 (르방·프리퍼먼트) ─
  const [pfType, setPfType] = useState<'levain' | 'poolish' | 'biga' | 'sponge'>('levain')
  const [mainFlour, setMainFlour] = useState<number>(400)
  const [mainWater, setMainWater] = useState<number>(280)
  const [mainSalt, setMainSalt] = useState<number>(9)
  const [pfTotal, setPfTotal] = useState<number>(100)
  const [pfHydration, setPfHydration] = useState<number>(100)

  // ─ 즐겨찾기 ─
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favName, setFavName] = useState<string>('')

  // ─ 복사 ─
  const [copied, setCopied] = useState<boolean>(false)

  // localStorage 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY)
      if (raw) setFavorites(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites.slice(0, 20))) } catch {}
  }, [favorites])

  // 프리셋 변경 시 반영 (tab 2)
  useEffect(() => {
    const p = PRESETS.find(x => x.key === presetKey)
    if (p) setIng2(buildFromPreset(p, flourWeight))
  }, [presetKey])  // eslint-disable-line react-hooks/exhaustive-deps

  // tab 2: 밀가루 양·% 변경 시 무게 재계산은 인라인 핸들러에서 처리

  // 프리셋 변경 (tab 3)
  useEffect(() => {
    const p = PRESETS.find(x => x.key === presetKey3)
    if (p) setIng3(buildFromPreset(p, 500))
  }, [presetKey3])

  // ─────────────────────────────────────────────
  // 공통 분석 함수
  // ─────────────────────────────────────────────
  function analyze(ings: Ingredient[]) {
    const flourTotal = ings.filter(i => i.category === 'flour').reduce((s, i) => s + i.weight, 0)
    let liquidTotal = ings.filter(i => i.category === 'liquid').reduce((s, i) => s + i.weight * (i.liquidRatio ?? 1), 0)
    // 르방·프리퍼먼트 분해 — 안의 밀가루는 전체 수분율의 분모에, 물은 액체에 합산
    let prefermentFlour = 0
    for (const i of ings) {
      const h = prefermentHydrationOf(i)
      if (h !== null && i.weight > 0) {
        const f = i.weight / (1 + h / 100)
        prefermentFlour += f
        liquidTotal += i.weight - f
      }
    }
    const hydrationFlour = flourTotal + prefermentFlour
    const saltTotal = ings.filter(i => i.category === 'salt').reduce((s, i) => s + i.weight, 0)
    const yeastTotal = ings.filter(i => i.category === 'yeast').reduce((s, i) => s + i.weight, 0)
    const sugarTotal = ings.filter(i => i.category === 'sugar').reduce((s, i) => s + i.weight, 0)
    const fatTotal = ings.filter(i => i.category === 'fat').reduce((s, i) => s + i.weight, 0)
    const totalWeight = ings.reduce((s, i) => s + i.weight, 0)
    const totalPercent = ings.reduce((s, i) => s + (i.percent ?? 0), 0)
    return {
      flourTotal,
      liquidTotal,
      // 수분율은 르방 분해를 포함한 '전체 밀가루' 기준 (소금·이스트 등은 본반죽 밀가루 기준 유지)
      hydration: hydrationFlour > 0 ? (liquidTotal / hydrationFlour) * 100 : 0,
      saltPct:  flourTotal > 0 ? (saltTotal / flourTotal) * 100 : 0,
      yeastPct: flourTotal > 0 ? (yeastTotal / flourTotal) * 100 : 0,
      sugarPct: flourTotal > 0 ? (sugarTotal / flourTotal) * 100 : 0,
      fatPct:   flourTotal > 0 ? (fatTotal / flourTotal) * 100 : 0,
      totalWeight,
      totalPercent,
    }
  }

  // 재료 무게 변경 → % 자동 재계산 (tab 1)
  function updateWeight1(id: string, weight: number) {
    setIng1(prev => {
      const next = prev.map(i => i.id === id ? { ...i, weight } : i)
      const flour = next.filter(i => i.category === 'flour').reduce((s, i) => s + i.weight, 0)
      return next.map(i => ({ ...i, percent: flour > 0 ? (i.weight / flour) * 100 : 0 }))
    })
  }

  // 카테고리·이름 변경 (tab 1)
  function updateField1(id: string, patch: Partial<Ingredient>) {
    setIng1(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...patch, liquidRatio: (patch.category ?? i.category) === 'liquid' ? liquidRatioOf(patch.name ?? i.name) : undefined } : i)
      // 카테고리 변경 시 % 재계산
      const flour = next.filter(i => i.category === 'flour').reduce((s, i) => s + i.weight, 0)
      return next.map(i => ({ ...i, percent: flour > 0 ? (i.weight / flour) * 100 : 0 }))
    })
  }

  function addRow1() {
    if (ing1.length >= 15) return
    setIng1(prev => [...prev, { id: makeId(), name: '', weight: 0, percent: 0, category: 'other' }])
  }
  function removeRow1(id: string) {
    setIng1(prev => {
      const next = prev.filter(i => i.id !== id)
      const flour = next.filter(i => i.category === 'flour').reduce((s, i) => s + i.weight, 0)
      return next.map(i => ({ ...i, percent: flour > 0 ? (i.weight / flour) * 100 : 0 }))
    })
  }

  // tab 2: % 변경 시 무게 자동 재계산
  function updatePct2(id: string, percent: number) {
    setIng2(prev => prev.map(i => i.id === id ? { ...i, percent, weight: (flourWeight * percent) / 100 } : i))
  }
  function updateField2(id: string, patch: Partial<Ingredient>) {
    setIng2(prev => prev.map(i => i.id === id ? { ...i, ...patch, liquidRatio: (patch.category ?? i.category) === 'liquid' ? liquidRatioOf(patch.name ?? i.name) : undefined } : i))
  }
  function addRow2() {
    if (ing2.length >= 15) return
    setIng2(prev => [...prev, { id: makeId(), name: '', weight: 0, percent: 0, category: 'other' }])
  }
  function removeRow2(id: string) {
    setIng2(prev => prev.filter(i => i.id !== id))
  }

  // tab 2: 밀가루 양 변경 → 모든 재료 무게 재계산
  function setFlourAndRecalc(newFlour: number) {
    setFlourWeight(newFlour)
    setIng2(prev => prev.map(i => ({ ...i, weight: (newFlour * i.percent) / 100 })))
  }
  function applyScale(factor: number) {
    setFlourAndRecalc(Math.round(flourWeight * factor))
  }

  // tab 3: % 변경
  function updatePct3(id: string, percent: number) {
    setIng3(prev => prev.map(i => i.id === id ? { ...i, percent } : i))
  }
  function addRow3() {
    if (ing3.length >= 15) return
    setIng3(prev => [...prev, { id: makeId(), name: '', weight: 0, percent: 0, category: 'other' }])
  }
  function removeRow3(id: string) { setIng3(prev => prev.filter(i => i.id !== id)) }

  // ─────────────────────────────────────────────
  // 분석 결과 (메모)
  // ─────────────────────────────────────────────
  const analysis1 = useMemo(() => analyze(ing1), [ing1])
  const analysis2 = useMemo(() => analyze(ing2), [ing2])

  // tab 3: 역산
  const tab3Calc = useMemo(() => {
    const totalPct = ing3.reduce((s, i) => s + (i.percent ?? 0), 0)
    const flour = totalPct > 0 ? targetTotal / (totalPct / 100) : 0
    const ings = ing3.map(i => ({ ...i, weight: (flour * i.percent) / 100 }))
    const a = analyze(ings)
    return { totalPct, flour, ings, ...a }
  }, [ing3, targetTotal])

  // tab 4: 르방 분리
  const tab4Calc = useMemo(() => {
    const pfFlour = pfTotal / (1 + pfHydration / 100)
    const pfWater = pfTotal - pfFlour
    const totalFlour = mainFlour + pfFlour
    const totalWater = mainWater + pfWater
    const totalHydration = totalFlour > 0 ? (totalWater / totalFlour) * 100 : 0
    const mainHydration = mainFlour > 0 ? (mainWater / mainFlour) * 100 : 0
    const totalDough = totalFlour + totalWater + mainSalt
    return { pfFlour, pfWater, totalFlour, totalWater, totalHydration, mainHydration, totalDough }
  }, [mainFlour, mainWater, mainSalt, pfTotal, pfHydration])

  // ─────────────────────────────────────────────
  // 저장 / 불러오기
  // ─────────────────────────────────────────────
  function saveFav() {
    const ings = tab === 'toPercent' ? ing1 : tab === 'toWeight' ? ing2 : ing3
    const flour = ings.filter(i => i.category === 'flour').reduce((s, i) => s + i.weight, 0)
    const a = analyze(ings)
    const name = favName.trim() || `레시피 ${favorites.length + 1}`
    const fav: Favorite = {
      id: makeId(),
      name,
      baseFlour: Math.round(flour),
      ingredients: ings,
      hydration: round1(a.hydration),
      totalWeight: Math.round(a.totalWeight),
      savedAt: Date.now(),
    }
    setFavorites(prev => [fav, ...prev].slice(0, 20))
    setFavName('')
  }
  function loadFav(f: Favorite) {
    if (tab === 'toPercent') setIng1(f.ingredients.map(i => ({ ...i, id: makeId() })))
    else if (tab === 'toWeight') {
      setIng2(f.ingredients.map(i => ({ ...i, id: makeId() })))
      setFlourWeight(f.baseFlour)
    } else if (tab === 'fromTotal') {
      setIng3(f.ingredients.map(i => ({ ...i, id: makeId() })))
      setTargetTotal(f.totalWeight)
    }
  }
  function deleteFav(id: string) {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'toPercent') {
      text = [
        `[베이커 퍼센트 분석]`,
        `밀가루 ${fmt(analysis1.flourTotal)}g (100%)`,
        ``,
        ...ing1.filter(i => i.weight > 0).map(i => `${i.name}: ${fmt(i.weight)}g (${round1(i.percent)}%)`),
        ``,
        `총 반죽량: ${fmt(analysis1.totalWeight)}g`,
        `수분율: ${round1(analysis1.hydration)}%`,
        ``,
        `https://youtil.kr/tools/cooking/baker-percent`,
      ].join('\n')
    } else if (tab === 'toWeight') {
      text = [
        `[베이커 퍼센트 — ${PRESETS.find(p => p.key === presetKey)?.name ?? '커스텀'}]`,
        `밀가루 기준: ${flourWeight}g`,
        ``,
        ...ing2.filter(i => i.percent > 0).map(i => `${i.name}: ${fmt(i.weight)}g (${round1(i.percent)}%)`),
        ``,
        `총 반죽량: ${fmt(analysis2.totalWeight)}g · 수분율 ${round1(analysis2.hydration)}%`,
        ``,
        `https://youtil.kr/tools/cooking/baker-percent`,
      ].join('\n')
    } else if (tab === 'fromTotal') {
      text = [
        `[베이커 퍼센트 — 총 반죽량 ${targetTotal}g 역산]`,
        `밀가루: ${fmt(tab3Calc.flour)}g (총 배합률 ${round1(tab3Calc.totalPct)}%)`,
        ``,
        ...tab3Calc.ings.filter(i => i.percent > 0).map(i => `${i.name}: ${fmt(i.weight)}g (${round1(i.percent)}%)`),
        ``,
        `https://youtil.kr/tools/cooking/baker-percent`,
      ].join('\n')
    } else {
      text = [
        `[르방·프리퍼먼트 포함 계산]`,
        `프리퍼먼트: ${pfType} (${pfTotal}g, 수분율 ${pfHydration}%)`,
        ` ├ 밀가루: ${fmt(tab4Calc.pfFlour)}g`,
        ` └ 물: ${fmt(tab4Calc.pfWater)}g`,
        ``,
        `본반죽 — 밀가루 ${mainFlour}g · 물 ${mainWater}g · 소금 ${mainSalt}g`,
        ``,
        `전체 — 밀가루 ${fmt(tab4Calc.totalFlour)}g · 물 ${fmt(tab4Calc.totalWater)}g`,
        `전체 수분율: ${round1(tab4Calc.totalHydration)}%`,
        ``,
        `https://youtil.kr/tools/cooking/baker-percent`,
      ].join('\n')
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 수분율 메시지
  // ─────────────────────────────────────────────
  function hydroDesc(h: number): string {
    if (h < 60)  return '저수분 — 다루기 쉬움 (베이글·비스킷)'
    if (h < 70)  return '표준 — 식빵·단과자빵 일반 범위'
    if (h < 80)  return '고수분 — 캄파뉴·일반 사워도우 범위'
    if (h < 90)  return '매우 고수분 — 치아바타·하이드라 사워도우'
    return '극고수분 — 다루기 매우 어려움 (포카치아 일부)'
  }
  function gaugePct(h: number): number {
    // 0% → 0, 60% → 35, 75% → 65, 85% → 85, 100% → 100
    if (h <= 0) return 0
    if (h <= 60) return (h / 60) * 35
    if (h <= 75) return 35 + ((h - 60) / 15) * 30
    if (h <= 85) return 65 + ((h - 75) / 10) * 20
    if (h <= 100) return 85 + ((h - 85) / 15) * 15
    return 100
  }
  function saltDesc(p: number): string {
    if (p < 1)  return '저염 — 발효 조절 어려움 가능'
    if (p < 1.8) return '약간 저염'
    if (p < 2.2) return '일반적인 제빵 범위 (1.8~2.2%)'
    if (p < 3)  return '약간 짠 편'
    return '짠맛 강함 — 이스트 활동 억제 가능'
  }
  function yeastDesc(p: number): string {
    if (p === 0)  return '천연발효종(르방)만 사용'
    if (p < 0.5)  return '장시간 저온발효 (12시간+)'
    if (p < 1.5)  return '일반 표준 발효'
    if (p < 2.5)  return '빠른 발효 (1~2시간)'
    return '매우 빠른 발효'
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
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
        참고용 추정값입니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={s.tabs} role="tablist">
        <button role="tab" aria-selected={tab === 'toPercent'} className={`${s.tabBtn} ${tab === 'toPercent'  ? s.tabActive : ''}`} onClick={() => setTab('toPercent')}>재료량 → %</button>
        <button role="tab" aria-selected={tab === 'toWeight'} className={`${s.tabBtn} ${tab === 'toWeight'   ? s.tabActive : ''}`} onClick={() => setTab('toWeight')}>% → 재료량</button>
        <button role="tab" aria-selected={tab === 'fromTotal'} className={`${s.tabBtn} ${tab === 'fromTotal'  ? s.tabActive : ''}`} onClick={() => setTab('fromTotal')}>총 반죽량 역산</button>
        <button role="tab" aria-selected={tab === 'preferment'} className={`${s.tabBtn} ${tab === 'preferment' ? s.tabActive : ''}`} onClick={() => setTab('preferment')}>르방·프리퍼먼트</button>
      </div>

      {/* ──────────── TAB 1: 재료량 → 퍼센트 ──────────── */}
      {tab === 'toPercent' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>빵 종류 빠른 시작</span>
              <span className={s.cardLabelHint}>프리셋 선택 시 재료 자동 채움</span>
            </div>
            <div className={s.presetGrid}>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={presetKey1 === p.key}
                  className={`${s.presetCard} ${presetKey1 === p.key ? s.presetActive : ''}`}
                  onClick={() => {
                    setPresetKey1(p.key)
                    setIng1(buildFromPreset(p, 500))
                  }}
                >
                  <span className={s.presetIcon}>{p.icon}</span>
                  <span className={s.presetName}>{p.name}</span>
                  <span className={s.presetNote}>{p.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>재료 입력 (g)</span>
              <span className={s.cardLabelHint}>최대 15개 · 밀가루 = 100% 기준</span>
            </div>
            <IngredientRowEditable
              items={ing1}
              mode="weight"
              onUpdateWeight={updateWeight1}
              onUpdateField={updateField1}
              onRemove={removeRow1}
            />
            {ing1.length < 15 && (
              <button className={s.addRowBtn} onClick={addRow1} type="button">+ 재료 추가</button>
            )}
          </div>

          {/* HERO */}
          {analysis1.flourTotal > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>총 반죽량</p>
              <div>
                <span className={s.heroNum}>{fmt(analysis1.totalWeight)}</span>
                <span className={s.heroUnit}>g</span>
              </div>
              <p className={s.heroSub}>
                밀가루 <span className={s.heroSubAccent}>{fmt(analysis1.flourTotal)}g (100%)</span> ·
                {' '}수분율 <span className={s.heroSubAccent}>{round1(analysis1.hydration)}%</span>
              </p>
            </div>
          )}

          {/* 핵심 지표 */}
          {analysis1.flourTotal > 0 && (
            <>
              <div className={s.metricsGrid}>
                <div className={`${s.metricCard} ${s.metricHydration}`}>
                  <p className={s.metricLabel}>💧 수분율</p>
                  <p className={s.metricValue}>{round1(analysis1.hydration)}%</p>
                  <p className={s.metricHint}>{hydroDesc(analysis1.hydration).split(' — ')[0]}</p>
                </div>
                <div className={`${s.metricCard} ${s.metricSalt}`}>
                  <p className={s.metricLabel}>🧂 소금</p>
                  <p className={s.metricValue}>{round1(analysis1.saltPct)}%</p>
                  <p className={s.metricHint}>{saltDesc(analysis1.saltPct).split(' — ')[0]}</p>
                </div>
                <div className={`${s.metricCard} ${s.metricYeast}`}>
                  <p className={s.metricLabel}>🧫 이스트</p>
                  <p className={s.metricValue}>{round1(analysis1.yeastPct)}%</p>
                  <p className={s.metricHint}>{yeastDesc(analysis1.yeastPct).split(' — ')[0]}</p>
                </div>
                <div className={`${s.metricCard} ${s.metricSugar}`}>
                  <p className={s.metricLabel}>🍯 설탕</p>
                  <p className={s.metricValue}>{round1(analysis1.sugarPct)}%</p>
                  <p className={s.metricHint}>{analysis1.sugarPct < 5 ? '단맛 적음' : analysis1.sugarPct < 10 ? '식빵 수준' : '단과자빵 수준'}</p>
                </div>
              </div>

              {/* 수분율 게이지 */}
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>수분율 게이지</span>
                  <span className={s.cardLabelHint}>저수분 → 고수분</span>
                </div>
                <div className={s.gaugeWrap}>
                  <div className={s.gaugeBar} style={{ position: 'relative' }}>
                    {/* 구간 라벨 — 게이지 안에 배치 */}
                    <span style={{ position: 'absolute', left: '17.5%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.55)', fontFamily: 'Noto Sans KR, sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none' }}>저수분</span>
                    <span style={{ position: 'absolute', left: '50%',   top: '50%', transform: 'translate(-50%, -50%)', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.55)', fontFamily: 'Noto Sans KR, sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none' }}>표준</span>
                    <span style={{ position: 'absolute', left: '75%',   top: '50%', transform: 'translate(-50%, -50%)', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.55)', fontFamily: 'Noto Sans KR, sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none' }}>고수분</span>
                    <span style={{ position: 'absolute', left: '92.5%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.55)', fontFamily: 'Noto Sans KR, sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none' }}>극고</span>
                    <div className={s.gaugeMarker} style={{ left: `${gaugePct(analysis1.hydration)}%` }} />
                  </div>
                  {/* 구간 경계 숫자 — 정확한 위치에 표시 */}
                  <div className={s.gaugeLabels} style={{ position: 'relative', height: 14, marginTop: 4 }}>
                    <span style={{ position: 'absolute', left: '0%',    transform: 'translateX(-50%)' }}>0</span>
                    <span style={{ position: 'absolute', left: '35%',   transform: 'translateX(-50%)' }}>60%</span>
                    <span style={{ position: 'absolute', left: '65%',   transform: 'translateX(-50%)' }}>75%</span>
                    <span style={{ position: 'absolute', left: '85%',   transform: 'translateX(-50%)' }}>85%</span>
                    <span style={{ position: 'absolute', left: '100%',  transform: 'translateX(-50%)' }}>100%</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16, lineHeight: 1.7 }}>
                  현재 <strong style={{ color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{round1(analysis1.hydration)}%</strong> — {hydroDesc(analysis1.hydration)}
                </p>
              </div>

              {/* 재료 배합 도넛 차트 */}
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>🥧 재료 배합 비율</span>
                  <span className={s.cardLabelHint}>전체 반죽 중 차지 비중</span>
                </div>
                <CompositionChart ingredients={ing1} />
              </div>

              {/* 식감 추정 */}
              <TextureCard analysis={analysis1} />
            </>
          )}

          {/* 분석 카드 */}
          {analysis1.flourTotal > 0 && (
            <div className={s.analysisCard}>
              사용자 배합 분석:
              <ul>
                <li>전체 수분율 <strong>{round1(analysis1.hydration)}%</strong> — {hydroDesc(analysis1.hydration)}</li>
                <li>소금 <strong>{round1(analysis1.saltPct)}%</strong> — {saltDesc(analysis1.saltPct)}</li>
                <li>이스트 <strong>{round1(analysis1.yeastPct)}%</strong> — {yeastDesc(analysis1.yeastPct)}</li>
                {analysis1.fatPct > 0 && <li>지방 <strong>{round1(analysis1.fatPct)}%</strong> — {analysis1.fatPct < 5 ? '담백' : analysis1.fatPct < 15 ? '풍미 식빵' : '버터 풍부 (브리오슈·크루아상)'}</li>}
              </ul>
            </div>
          )}

          {analysis1.flourTotal > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 퍼센트 → 재료량 ──────────── */}
      {tab === 'toWeight' && (
        <>
          {/* 프리셋 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>빵 프리셋 (8종)</span>
              <span className={s.cardLabelHint}>선택 시 % 자동 입력</span>
            </div>
            <div className={s.presetGrid}>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  aria-pressed={presetKey === p.key}
                  className={`${s.presetCard} ${presetKey === p.key ? s.presetActive : ''}`}
                  onClick={() => setPresetKey(p.key)}
                  type="button"
                >
                  <span className={s.presetIcon}>{p.icon}</span>
                  <span className={s.presetName}>{p.name}</span>
                  <span className={s.presetNote}>{p.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 밀가루 양 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>목표 밀가루 양</span>
              <span className={s.cardLabelHint}>{flourWeight}g</span>
            </div>
            <div className={s.sliderRow}>
              <input type="range" min={100} max={5000} step={5} value={flourWeight} onChange={e => setFlourAndRecalc(Number(e.target.value))} />
              <input
                type="number"
                inputMode="decimal"
                min={50}
                max={10000}
                step={1}
                value={flourWeight}
                onChange={e => setFlourAndRecalc(Math.max(0, Number(e.target.value) || 0))}
                style={{
                  width: 80, padding: '6px 10px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 14,
                  fontWeight: 700, color: 'var(--text)', textAlign: 'right', outline: 'none',
                }}
              />
              <span className={s.unit}>g</span>
            </div>
            <div className={s.flourQuickRow}>
              {FLOUR_QUICK.map(q => (
                <button key={q} aria-pressed={flourWeight === q} className={`${s.flourQuickBtn} ${flourWeight === q ? s.flourQuickActive : ''}`} onClick={() => setFlourAndRecalc(q)} type="button">
                  {fmt(q)}g
                </button>
              ))}
            </div>
            <div className={s.scaleRow}>
              <button className={`${s.scaleBtn} ${s.scaleHalf}`}  onClick={() => applyScale(0.5)} type="button">× 0.5</button>
              <button className={`${s.scaleBtn} ${s.scaleOne}`}   onClick={() => {}}              type="button">× 1</button>
              <button className={`${s.scaleBtn} ${s.scaleTwo}`}   onClick={() => applyScale(2)}   type="button">× 2</button>
              <button className={`${s.scaleBtn} ${s.scaleThree}`} onClick={() => applyScale(3)}   type="button">× 3</button>
            </div>
          </div>

          {/* 재료 % 편집 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>재료 비율 (%)</span>
              <span className={s.cardLabelHint}>편집 시 무게 자동 재계산</span>
            </div>
            <IngredientRowEditable
              items={ing2}
              mode="pct"
              onUpdatePct={updatePct2}
              onUpdateField={updateField2}
              onRemove={removeRow2}
            />
            {ing2.length < 15 && (
              <button className={s.addRowBtn} onClick={addRow2} type="button">+ 재료 추가</button>
            )}
          </div>

          {/* HERO */}
          {analysis2.flourTotal > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>총 반죽량</p>
              <div>
                <span className={s.heroNum}>{fmt(analysis2.totalWeight)}</span>
                <span className={s.heroUnit}>g</span>
              </div>
              <p className={s.heroSub}>
                밀가루 {fmt(analysis2.flourTotal)}g · 총 배합률 <span className={s.heroSubAccent}>{round1(analysis2.totalPercent)}%</span>
                {' · '}수분율 <span className={s.heroSubAccent}>{round1(analysis2.hydration)}%</span>
              </p>
            </div>
          )}

          {/* 합계 표 */}
          {analysis2.flourTotal > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>재료별 무게</span>
              </div>
              <table className={s.summaryTable}>
                <thead>
                  <tr>
                    <th>재료</th>
                    <th>카테고리</th>
                    <th>무게</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {ing2.filter(i => i.percent > 0 || i.weight > 0).map(i => (
                    <tr key={i.id} className={i.category === 'flour' ? s.flourRow : i.category === 'liquid' ? s.liquidRow : ''}>
                      <td>{i.name || '—'}</td>
                      <td>{catMeta(i.category).emoji} {catMeta(i.category).label.replace(/^[^\s]+\s/, '')}</td>
                      <td>{fmt(i.weight)}g</td>
                      <td>{round1(i.percent)}%</td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}>
                    <td>총 반죽량</td>
                    <td>—</td>
                    <td>{fmt(analysis2.totalWeight)}g</td>
                    <td>{round1(analysis2.totalPercent)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 재료 배합 도넛 차트 */}
          {analysis2.flourTotal > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>🥧 재료 배합 비율</span>
                <span className={s.cardLabelHint}>전체 반죽 중 차지 비중</span>
              </div>
              <CompositionChart ingredients={ing2} />
            </div>
          )}

          {/* 식감 추정 */}
          {analysis2.flourTotal > 0 && <TextureCard analysis={analysis2} />}

          {/* 빵 종류별 예상 완성품 */}
          {analysis2.totalWeight > 0 && (
            <div className={s.outputCard}>
              <p className={s.outputTitle}>
                {fmt(analysis2.totalWeight)}g 반죽으로 만들 수 있는 양
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}> · 굽기 손실 반영 (완성품 기준)</span>
              </p>
              <div className={s.outputGrid}>
                {PRODUCT_SIZES.map(p => (
                  <div key={p.name} className={s.outputItem}>
                    <p>{p.name}</p>
                    <p>약 {((analysis2.totalWeight * (1 - p.loss / 100)) / p.w).toFixed(1)}개</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis2.flourTotal > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '재료 리스트 복사'}
            </button>
          )}

          {/* 즐겨찾기 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>⭐ 즐겨찾기 레시피</span>
              <span className={s.cardLabelHint}>{favorites.length} / 20</span>
            </div>
            <div className={s.favSaveRow}>
              <input className={s.textInput} type="text" value={favName} onChange={e => setFavName(e.target.value)} placeholder="예: 우리집 식빵" maxLength={20} />
              <button className={s.favSaveBtn} onClick={saveFav} type="button">+ 저장</button>
            </div>
            {favorites.length > 0 && (
              <div className={s.favList} style={{ marginTop: 10 }}>
                {favorites.map(f => (
                  <div key={f.id} className={s.favItem}>
                    <span className={s.favItemName}>{f.name}</span>
                    <span className={s.favItemMeta}>밀가루 {fmt(f.baseFlour)}g · 수분율 {f.hydration}%</span>
                    <div className={s.favItemBtns}>
                      <button className={s.favLoadBtn} onClick={() => loadFav(f)} type="button">불러오기</button>
                      <button className={s.favDeleteBtn} onClick={() => deleteFav(f.id)} type="button">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 총 반죽량 역산 ──────────── */}
      {tab === 'fromTotal' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>빵 프리셋</span>
              <span className={s.cardLabelHint}>또는 % 직접 편집</span>
            </div>
            <div className={s.presetGrid}>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  aria-pressed={presetKey3 === p.key}
                  className={`${s.presetCard} ${presetKey3 === p.key ? s.presetActive : ''}`}
                  onClick={() => setPresetKey3(p.key)}
                  type="button"
                >
                  <span className={s.presetIcon}>{p.icon}</span>
                  <span className={s.presetName}>{p.name}</span>
                  <span className={s.presetNote}>{p.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>목표 총 반죽량</span>
              <span className={s.cardLabelHint}>{targetTotal}g</span>
            </div>
            <div className={s.sliderRow}>
              <input type="range" min={100} max={10000} step={5} value={targetTotal} onChange={e => setTargetTotal(Number(e.target.value))} />
              <input
                type="number"
                inputMode="decimal"
                min={50}
                max={20000}
                step={1}
                value={targetTotal}
                onChange={e => setTargetTotal(Math.max(0, Number(e.target.value) || 0))}
                style={{
                  width: 80, padding: '6px 10px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 14,
                  fontWeight: 700, color: 'var(--text)', textAlign: 'right', outline: 'none',
                }}
              />
              <span className={s.unit}>g</span>
            </div>
            <div className={s.flourQuickRow}>
              {[
                { l: '식빵 1개 (500g)',  v: 500 },
                { l: '식빵 2개 (1000g)', v: 1000 },
                { l: '바게트 3개 (750g)', v: 750 },
                { l: '피자 3장 (750g)',  v: 750 },
              ].map(q => (
                <button key={q.l} aria-pressed={targetTotal === q.v} className={`${s.flourQuickBtn} ${targetTotal === q.v ? s.flourQuickActive : ''}`} onClick={() => setTargetTotal(q.v)} type="button">
                  {q.l}
                </button>
              ))}
            </div>
          </div>

          {/* 재료 % 편집 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>재료 비율 (%)</span>
            </div>
            <IngredientRowEditable
              items={ing3}
              mode="pct"
              onUpdatePct={updatePct3}
              onUpdateField={(id, patch) => setIng3(prev => prev.map(i => i.id === id ? { ...i, ...patch, liquidRatio: (patch.category ?? i.category) === 'liquid' ? liquidRatioOf(patch.name ?? i.name) : undefined } : i))}
              onRemove={removeRow3}
            />
            {ing3.length < 15 && (
              <button className={s.addRowBtn} onClick={addRow3} type="button">+ 재료 추가</button>
            )}
          </div>

          {/* HERO */}
          {tab3Calc.totalPct > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>총 반죽량 {fmt(targetTotal)}g 기준</p>
              <div>
                <span className={s.heroNum}>{fmt(tab3Calc.flour)}</span>
                <span className={s.heroUnit}>g 밀가루</span>
              </div>
              <p className={s.heroSub}>
                총 배합률 <span className={s.heroSubAccent}>{round1(tab3Calc.totalPct)}%</span> ·
                {' '}수분율 <span className={s.heroSubAccent}>{round1(tab3Calc.hydration)}%</span>
              </p>
            </div>
          )}

          {/* 합계 표 */}
          {tab3Calc.totalPct > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>재료별 자동 계산</span>
              </div>
              <table className={s.summaryTable}>
                <thead>
                  <tr>
                    <th>재료</th>
                    <th>카테고리</th>
                    <th>무게</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {tab3Calc.ings.filter(i => i.percent > 0).map(i => (
                    <tr key={i.id} className={i.category === 'flour' ? s.flourRow : i.category === 'liquid' ? s.liquidRow : ''}>
                      <td>{i.name || '—'}</td>
                      <td>{catMeta(i.category).emoji}</td>
                      <td>{fmt(i.weight)}g</td>
                      <td>{round1(i.percent)}%</td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}>
                    <td>총 반죽량</td>
                    <td>—</td>
                    <td>{fmt(targetTotal)}g</td>
                    <td>{round1(tab3Calc.totalPct)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 발효·굽기 후 안내 */}
          {tab3Calc.totalPct > 0 && (() => {
            const lossKey = (PRESETS.find(p => p.key === presetKey3)?.key ?? 'default') as keyof typeof BAKE_LOSS
            const loss = BAKE_LOSS[lossKey] ?? BAKE_LOSS.default
            const final = targetTotal * (1 - loss / 100)
            return (
              <div className={s.analysisCard}>
                실제 발효·굽기 후 완성 중량은 약 <strong>{loss}%</strong> 감소해 약 <strong>{fmt(final)}g</strong>이 됩니다.
                <ul>
                  <li>식빵 약 12% 감소 · 바게트 약 15% · 사워도우 약 13%</li>
                  <li>오븐 온도·시간·반죽 두께에 따라 ±3% 차이</li>
                </ul>
              </div>
            )
          })()}

          {tab3Calc.totalPct > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 4: 르방·프리퍼먼트 ──────────── */}
      {tab === 'preferment' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>프리퍼먼트 종류</span>
              <span className={s.cardLabelHint}>수분율 자동 적용</span>
            </div>
            <div className={s.prefermentTypeRow}>
              <button aria-pressed={pfType === 'levain'} className={`${s.prefermentTypeBtn} ${pfType === 'levain'  ? s.prefermentActive : ''}`} onClick={() => { setPfType('levain'); setPfHydration(100) }}>🥖 르방</button>
              <button aria-pressed={pfType === 'poolish'} className={`${s.prefermentTypeBtn} ${pfType === 'poolish' ? s.prefermentActive : ''}`} onClick={() => { setPfType('poolish'); setPfHydration(100) }}>🇫🇷 폴리쉬</button>
              <button aria-pressed={pfType === 'biga'} className={`${s.prefermentTypeBtn} ${pfType === 'biga'    ? s.prefermentActive : ''}`} onClick={() => { setPfType('biga'); setPfHydration(55) }}>🇮🇹 비가</button>
              <button aria-pressed={pfType === 'sponge'} className={`${s.prefermentTypeBtn} ${pfType === 'sponge'  ? s.prefermentActive : ''}`} onClick={() => { setPfType('sponge'); setPfHydration(55) }}>🍞 스폰지</button>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>본반죽 입력</span>
              <span className={s.cardLabelHint}>프리퍼먼트 제외</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <span className={s.subLabel}>밀가루 (g)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" min="0" step="10"
                  value={mainFlour === 0 ? '' : mainFlour}
                  onChange={e => setMainFlour(n(e.target.value, 0))} />
              </div>
              <div>
                <span className={s.subLabel}>물 (g)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" min="0" step="10"
                  value={mainWater === 0 ? '' : mainWater}
                  onChange={e => setMainWater(n(e.target.value, 0))} />
              </div>
              <div>
                <span className={s.subLabel}>소금 (g)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" min="0" step="0.5"
                  value={mainSalt === 0 ? '' : mainSalt}
                  onChange={e => setMainSalt(n(e.target.value, 0))} />
              </div>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>프리퍼먼트 입력</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span className={s.subLabel}>총 사용량 (g)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" min="0" step="10"
                  value={pfTotal === 0 ? '' : pfTotal}
                  onChange={e => setPfTotal(n(e.target.value, 0))} />
              </div>
              <div>
                <span className={s.subLabel}>수분율 (%)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" min="0" max="200" step="5"
                  value={pfHydration === 0 ? '' : pfHydration}
                  onChange={e => setPfHydration(n(e.target.value, 0))} />
              </div>
            </div>
          </div>

          {/* HERO */}
          {tab4Calc.totalFlour > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>전체 수분율</p>
              <div>
                <span className={s.heroNum}>{round1(tab4Calc.totalHydration)}</span>
                <span className={s.heroUnit}>%</span>
              </div>
              <p className={s.heroSub}>
                본반죽 수분율 <span className={s.heroSubAccent}>{round1(tab4Calc.mainHydration)}%</span> +
                {' '}프리퍼먼트 <span className={s.heroSubAccent}>{pfTotal}g ({pfHydration}%)</span>
                {' = '}<span className={s.heroSubAccent}>{round1(tab4Calc.totalHydration)}%</span>
              </p>
            </div>
          )}

          {/* 분리 표 */}
          {tab4Calc.totalFlour > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>본반죽 + 프리퍼먼트 분리</span>
              </div>
              <table className={s.dualTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th style={{ textAlign: 'right' }}>본반죽</th>
                    <th style={{ textAlign: 'right' }}>프리퍼먼트</th>
                    <th style={{ textAlign: 'right' }}>전체</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>밀가루</td>
                    <td className={s.colMain}>{fmt(mainFlour)}g</td>
                    <td className={s.colPreferment}>{fmt(tab4Calc.pfFlour)}g</td>
                    <td className={s.colTotal}>{fmt(tab4Calc.totalFlour)}g</td>
                  </tr>
                  <tr>
                    <td>물</td>
                    <td className={s.colMain}>{fmt(mainWater)}g</td>
                    <td className={s.colPreferment}>{fmt(tab4Calc.pfWater)}g</td>
                    <td className={s.colTotal}>{fmt(tab4Calc.totalWater)}g</td>
                  </tr>
                  <tr>
                    <td>소금</td>
                    <td className={s.colMain}>{fmt(mainSalt)}g</td>
                    <td className={`${s.colPreferment} ${s.zero}`}>—</td>
                    <td className={s.colTotal}>{fmt(mainSalt)}g</td>
                  </tr>
                  <tr className={s.totalRow}>
                    <td>수분율</td>
                    <td className={s.colMain}>{round1(tab4Calc.mainHydration)}%</td>
                    <td className={s.colPreferment}>{pfHydration}%</td>
                    <td className={s.colTotal}>{round1(tab4Calc.totalHydration)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 해석 */}
          {tab4Calc.totalFlour > 0 && (
            <div className={s.analysisCard}>
              본반죽 수분율 <strong>{round1(tab4Calc.mainHydration)}%</strong> + 프리퍼먼트 {pfTotal}g ({pfHydration}% 수분율) 시
              실제 전체 수분율은 <strong>{round1(tab4Calc.totalHydration)}%</strong>입니다.
              {tab4Calc.totalHydration >= 70 && tab4Calc.totalHydration <= 80 && (
                <> 사워도우 표준 수분율(70~80%) 범위에 들어갑니다.</>
              )}
              <ul>
                <li>본반죽만 보면 수분율이 낮아 보일 수 있지만, 르방의 물·밀가루까지 합산해야 정확합니다.</li>
                <li>사워도우 스타터 관리는 <a href="/tools/cooking/sourdough" style={{ color: 'var(--accent)' }}>사워도우 스타터 계산기</a>에서 확인하세요.</li>
              </ul>
            </div>
          )}

          {tab4Calc.totalFlour > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ─ 공통: 이스트 변환기 ─ */}
      <div className={s.yeastCard}>
        <p className={s.yeastTitle}>🧫 이스트 종류 변환 (인스턴트 드라이 5g 기준)</p>
        {YEAST_RATIOS.map(y => (
          <div key={y.key} className={s.yeastConvRow}>
            <span>{y.name}</span>
            <strong>{y.key === 'levain' ? '약 100~150g' : `${(y.ratio * 5).toFixed(2)}g`}</strong>
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
          ※ 액티브 드라이 = 따뜻한 물에 활성화 필요 · 생이스트 = 냉장 보관, 유효기간 짧음
        </p>
      </div>

      {/* ─ 공통: 수분율 가이드 카드 ─ */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>수분율 가이드</span>
          <span className={s.cardLabelHint}>참고용 일반 범위</span>
        </div>
        <table className={s.hydroGuide}>
          <thead>
            <tr><th>수분율</th><th>특성</th><th>빵 종류 예시</th></tr>
          </thead>
          <tbody>
            <tr className={s.hydroLow}><td>50~60%</td><td>단단함, 다루기 쉬움</td><td>베이글, 비스킷</td></tr>
            <tr className={s.hydroMid}><td>60~65%</td><td>표준</td><td>식빵, 단과자빵</td></tr>
            <tr className={s.hydroMid}><td>65~75%</td><td>촉촉</td><td>일반 식빵, 캄파뉴</td></tr>
            <tr className={s.hydroHigh}><td>75~85%</td><td>고수분, 까다로움</td><td>치아바타, 사워도우</td></tr>
            <tr className={s.hydroVHigh}><td>85%+</td><td>매우 고수분</td><td>포카치아, 일부 사워도우</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
