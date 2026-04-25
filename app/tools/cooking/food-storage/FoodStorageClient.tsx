'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './food-storage.module.css'

/* ────────────────────────────────────────────────
 * 보관 데이터
 * ──────────────────────────────────────────────── */
interface StorageInfo {
  category: string
  emoji: string
  group: GroupKey
  roomTemp?: number
  fridgeRaw?: number
  fridgeCooked?: number
  freezerRaw?: number
  freezerCooked?: number
  warning?: string
  freezeRecommendDay?: number
  defaultCondition?: Condition
  defaultStorage?: StorageMethod
}

type GroupKey = 'meat' | 'seafood' | 'dairy' | 'veggie' | 'grain' | 'processed'
const GROUP_META: Record<GroupKey, { emoji: string; label: string }> = {
  meat:      { emoji: '🥩', label: '육류' },
  seafood:   { emoji: '🐟', label: '해산물' },
  dairy:     { emoji: '🥚', label: '유제품·계란' },
  veggie:    { emoji: '🥦', label: '채소·과일' },
  grain:     { emoji: '🍚', label: '곡류·반찬' },
  processed: { emoji: '🍱', label: '가공식품' },
}

const STORAGE_DATA: Record<string, StorageInfo> = {
  beefRaw:        { category: '소고기(생)',    emoji: '🥩', group: 'meat', fridgeRaw: 3, freezerRaw: 180, freezeRecommendDay: 2, defaultCondition: 'raw',    defaultStorage: 'fridge' },
  beefCooked:     { category: '소고기(조리)',  emoji: '🥩', group: 'meat', fridgeCooked: 4, freezerCooked: 90, freezeRecommendDay: 3, defaultCondition: 'cooked', defaultStorage: 'fridge' },
  porkRaw:        { category: '돼지고기(생)',  emoji: '🥩', group: 'meat', fridgeRaw: 3, freezerRaw: 120, freezeRecommendDay: 2, defaultCondition: 'raw',    defaultStorage: 'fridge' },
  porkCooked:     { category: '돼지고기(조리)',emoji: '🥩', group: 'meat', fridgeCooked: 4, freezerCooked: 90, defaultCondition: 'cooked', defaultStorage: 'fridge' },
  chickenRaw:     { category: '닭고기(생)',    emoji: '🍗', group: 'meat', fridgeRaw: 2, freezerRaw: 90, warning: '살모넬라 위험. 신선 시 즉시 냉동 권장', freezeRecommendDay: 1, defaultCondition: 'raw', defaultStorage: 'fridge' },
  chickenCooked:  { category: '닭고기(조리)',  emoji: '🍗', group: 'meat', fridgeCooked: 3, freezerCooked: 90, defaultCondition: 'cooked', defaultStorage: 'fridge' },
  groundMeat:     { category: '다진고기',      emoji: '🍖', group: 'meat', fridgeRaw: 1, freezerRaw: 90, warning: '표면적이 넓어 부패가 빠릅니다. 즉시 냉동 권장', freezeRecommendDay: 1, defaultCondition: 'raw', defaultStorage: 'fridge' },
  ham:            { category: '햄·소시지(개봉전)', emoji: '🌭', group: 'meat', fridgeRaw: 14, defaultCondition: 'raw', defaultStorage: 'fridge' },
  hamOpened:      { category: '햄·소시지(개봉후)', emoji: '🌭', group: 'meat', fridgeRaw: 5, defaultCondition: 'opened', defaultStorage: 'fridge' },
  bacon:          { category: '베이컨',        emoji: '🥓', group: 'meat', fridgeRaw: 7, freezerRaw: 30, defaultCondition: 'raw', defaultStorage: 'fridge' },

  fishRaw:        { category: '생선(생)',      emoji: '🐟', group: 'seafood', fridgeRaw: 2, freezerRaw: 90, warning: '비린내·부패가 빠릅니다. 손질 후 즉시 사용 또는 냉동', freezeRecommendDay: 1, defaultCondition: 'raw', defaultStorage: 'fridge' },
  shrimpRaw:      { category: '새우(생)',      emoji: '🦐', group: 'seafood', fridgeRaw: 2, freezerRaw: 90, freezeRecommendDay: 1, defaultCondition: 'raw', defaultStorage: 'fridge' },
  sashimi:        { category: '회',            emoji: '🍣', group: 'seafood', fridgeRaw: 1, warning: '당일 소비 강력 권장. 다음날까지가 한계입니다', defaultCondition: 'raw', defaultStorage: 'fridge' },

  egg:            { category: '계란',          emoji: '🥚', group: 'dairy', fridgeRaw: 35, warning: '냉장 보관 필수. 깨진 계란은 즉시 사용', defaultCondition: 'raw', defaultStorage: 'fridge' },
  milkUnopened:   { category: '우유(개봉전)',  emoji: '🥛', group: 'dairy', fridgeRaw: 14, warning: '유통기한 확인 필수', defaultCondition: 'raw', defaultStorage: 'fridge' },
  milkOpened:     { category: '우유(개봉후)',  emoji: '🥛', group: 'dairy', fridgeRaw: 4, defaultCondition: 'opened', defaultStorage: 'fridge' },
  cheese:         { category: '치즈',          emoji: '🧀', group: 'dairy', fridgeRaw: 14, defaultCondition: 'raw', defaultStorage: 'fridge' },
  yogurt:         { category: '요거트',        emoji: '🥛', group: 'dairy', fridgeRaw: 7, defaultCondition: 'opened', defaultStorage: 'fridge' },
  butter:         { category: '버터',          emoji: '🧈', group: 'dairy', fridgeRaw: 30, freezerRaw: 270, defaultCondition: 'raw', defaultStorage: 'fridge' },

  leafyVegetable: { category: '잎채소',        emoji: '🥬', group: 'veggie', fridgeRaw: 5, warning: '키친타올로 감싸서 보관', defaultCondition: 'raw', defaultStorage: 'fridge' },
  rootVegetable:  { category: '뿌리채소',      emoji: '🥕', group: 'veggie', fridgeRaw: 14, roomTemp: 7, defaultCondition: 'raw', defaultStorage: 'fridge' },
  onionGarlic:    { category: '양파·마늘',     emoji: '🧅', group: 'veggie', roomTemp: 30, fridgeRaw: 60, warning: '서늘하고 어두운 곳 보관', defaultCondition: 'raw', defaultStorage: 'roomTemp' },
  tomato:         { category: '토마토',        emoji: '🍅', group: 'veggie', roomTemp: 5, fridgeRaw: 7, warning: '실온 보관이 풍미 유지에 좋습니다', defaultCondition: 'raw', defaultStorage: 'roomTemp' },
  berries:        { category: '베리류',        emoji: '🫐', group: 'veggie', fridgeRaw: 3, freezerRaw: 180, warning: '씻지 않고 보관, 먹기 직전에 세척', defaultCondition: 'raw', defaultStorage: 'fridge' },
  applePear:      { category: '사과·배',       emoji: '🍎', group: 'veggie', fridgeRaw: 30, roomTemp: 7, defaultCondition: 'raw', defaultStorage: 'fridge' },

  riceCooked:     { category: '밥(조리)',      emoji: '🍚', group: 'grain', fridgeCooked: 2, freezerCooked: 30, warning: '냉장 시 굳어 풍미가 떨어집니다. 1회분씩 냉동 권장', freezeRecommendDay: 1, defaultCondition: 'cooked', defaultStorage: 'fridge' },
  noodleCooked:   { category: '면(조리)',      emoji: '🍜', group: 'grain', fridgeCooked: 2, warning: '시간이 지나면 식감이 크게 저하됩니다', defaultCondition: 'cooked', defaultStorage: 'fridge' },
  bread:          { category: '빵',            emoji: '🍞', group: 'grain', roomTemp: 3, freezerRaw: 90, warning: '냉장은 빨리 굳습니다. 장기 보관은 냉동 권장', defaultCondition: 'raw', defaultStorage: 'roomTemp' },
  kimchi:         { category: '김치',          emoji: '🌶️', group: 'grain', fridgeRaw: 180, warning: '익을수록 신맛이 증가. 김치냉장고 권장', defaultCondition: 'raw', defaultStorage: 'kimchi' },
  banchan:        { category: '밑반찬',        emoji: '🥢', group: 'grain', fridgeCooked: 5, warning: '국물이 있는 반찬은 더 빨리 상합니다', defaultCondition: 'cooked', defaultStorage: 'fridge' },
  soup:           { category: '국·찌개',       emoji: '🍲', group: 'grain', fridgeCooked: 3, freezerCooked: 30, warning: '하루 한 번 끓여 먹으면 보관 기간을 연장할 수 있습니다', freezeRecommendDay: 2, defaultCondition: 'cooked', defaultStorage: 'fridge' },

  tofu:           { category: '두부',          emoji: '⬜', group: 'processed', fridgeRaw: 7, warning: '개봉 후 물에 담가 보관, 매일 물 교체 권장', defaultCondition: 'opened', defaultStorage: 'fridge' },
}

const CATEGORY_KEYS = Object.keys(STORAGE_DATA)

/* ────────────────────────────────────────────────
 * 타입
 * ──────────────────────────────────────────────── */
type StorageMethod = 'roomTemp' | 'fridge' | 'freezer' | 'kimchi'
type Condition = 'raw' | 'cooked' | 'opened'
type BaseDateType = 'purchase' | 'cook' | 'open'
type Status = 'safe' | 'warning' | 'urgent' | 'expired' | 'unknown'

interface FoodItem {
  id: string
  category: string
  customName?: string
  baseDateType: BaseDateType
  year: number
  month: number
  day: number
  storage: StorageMethod
  condition: Condition
  memo?: string
}

/* ────────────────────────────────────────────────
 * 상수
 * ──────────────────────────────────────────────── */
const STORAGE_KEY = 'youtil-food-storage-v1'
const MAX_ITEMS = 30

const STORAGE_LABEL: Record<StorageMethod, string> = {
  roomTemp: '실온',
  fridge:   '냉장(0~4°C)',
  freezer:  '냉동(-18°C)',
  kimchi:   '김치냉장고',
}
const STORAGE_BADGE_LABEL: Record<StorageMethod, string> = {
  roomTemp: '🌡️ 실온',
  fridge:   '❄️ 냉장',
  freezer:  '🧊 냉동',
  kimchi:   '🌶️ 김치냉장고',
}

const CONDITION_LABEL: Record<Condition, string> = {
  raw:    '생것',
  cooked: '조리됨',
  opened: '개봉 후',
}

const BASE_DATE_LABEL: Record<BaseDateType, string> = {
  purchase: '구매일',
  cook:     '조리일',
  open:     '개봉일',
}

const STATUS_LABEL: Record<Status, string> = {
  safe:     '✅ 안전',
  warning:  '🔶 주의',
  urgent:   '🚨 위급',
  expired:  '❌ 기한 초과',
  unknown:  '❓ 정보 없음',
}

/* ────────────────────────────────────────────────
 * 계산
 * ──────────────────────────────────────────────── */
function totalDaysFor(item: FoodItem): number {
  const info = STORAGE_DATA[item.category]
  if (!info) return 0
  if (item.storage === 'fridge') {
    if (item.condition === 'cooked') return info.fridgeCooked ?? 0
    return info.fridgeRaw ?? 0
  }
  if (item.storage === 'freezer') {
    if (item.condition === 'cooked') return info.freezerCooked ?? 0
    return info.freezerRaw ?? 0
  }
  if (item.storage === 'roomTemp') return info.roomTemp ?? 0
  if (item.storage === 'kimchi')   return info.fridgeRaw ?? 0
  return 0
}

function diffDays(item: FoodItem, today: Date): number {
  const base = new Date(item.year, item.month - 1, item.day)
  base.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - base.getTime()) / 86400000)
}

interface CalcResult {
  totalDays: number
  passedDays: number
  remainingDays: number
  ratio: number       // 0 ~ 1+, passedDays / totalDays
  status: Status
  freezeRecommend: boolean
}

function calcItem(item: FoodItem, today: Date): CalcResult {
  const totalDays = totalDaysFor(item)
  const passedDays = diffDays(item, today)
  const remainingDays = totalDays - passedDays
  const info = STORAGE_DATA[item.category]
  if (totalDays === 0) {
    return { totalDays, passedDays, remainingDays: 0, ratio: 0, status: 'unknown', freezeRecommend: false }
  }
  const ratio = passedDays / totalDays
  let status: Status
  if (remainingDays < 0)        status = 'expired'
  else if (remainingDays <= 1)  status = 'urgent'
  else if (ratio >= 0.7)        status = 'warning'
  else                          status = 'safe'

  const freezeRecommend = !!(
    item.storage === 'fridge' &&
    item.condition === 'raw' &&
    info?.freezeRecommendDay !== undefined &&
    passedDays >= info.freezeRecommendDay &&
    remainingDays >= 0 &&
    info.freezerRaw !== undefined
  )

  return { totalDays, passedDays, remainingDays, ratio, status, freezeRecommend }
}

const STATUS_RANK: Record<Status, number> = {
  expired: 0,
  urgent:  1,
  warning: 2,
  safe:    3,
  unknown: 4,
}

/* ────────────────────────────────────────────────
 * 유틸
 * ──────────────────────────────────────────────── */
function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
function todayValues() {
  const t = new Date()
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }
}

/* ────────────────────────────────────────────────
 * 컴포넌트
 * ──────────────────────────────────────────────── */
export default function FoodStorageClient() {
  const [tab, setTab] = useState<'register' | 'guide'>('register')
  const [items, setItems] = useState<FoodItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 마운트 후 localStorage 복원
  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as FoodItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
  }, [])

  // 저장
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, mounted])

  // 오늘 (한 번만 계산)
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  // 계산 + 정렬
  const itemsWithCalc = useMemo(() => {
    const list = items.map(item => ({ item, calc: calcItem(item, today) }))
    list.sort((a, b) => {
      const r = STATUS_RANK[a.calc.status] - STATUS_RANK[b.calc.status]
      if (r !== 0) return r
      return a.calc.remainingDays - b.calc.remainingDays
    })
    return list
  }, [items, today])

  const summary = useMemo(() => {
    const counts = { safe: 0, warning: 0, urgent: 0, expired: 0, unknown: 0 }
    for (const { calc } of itemsWithCalc) counts[calc.status]++
    return counts
  }, [itemsWithCalc])

  const urgentTop = useMemo(() =>
    itemsWithCalc
      .filter(({ calc }) => calc.status === 'urgent' || calc.status === 'expired' || calc.status === 'warning')
      .slice(0, 3),
  [itemsWithCalc])

  const handleAdd = (it: FoodItem) => {
    setItems(prev => [...prev, it])
    setShowAddForm(false)
  }
  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }
  const handleSwitchToFreezer = (id: string) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      const info = STORAGE_DATA[i.category]
      if (!info?.freezerRaw && !info?.freezerCooked) return i
      const t = todayValues()
      return { ...i, storage: 'freezer', baseDateType: 'cook', year: t.y, month: t.m, day: t.d }
    }))
  }
  const handleReset = () => {
    if (confirm('등록된 모든 식재료를 삭제하시겠어요?')) {
      setItems([])
    }
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'register' ? s.tabActive : ''}`} onClick={() => setTab('register')}>📋 식재료 등록</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}    onClick={() => setTab('guide')}>📖 보관 가이드</button>
      </div>

      {/* 면책 조항 */}
      <div className={s.disclaimer}>
        <strong>⚠️ 참고</strong> 본 계산기는 식약처 권고 일반 기준에 따른 참고용 정보입니다. 실제 보관 가능 기간은 냉장고 성능·포장 상태·식재료 신선도에 따라 다를 수 있습니다. 의심스러운 냄새·색·질감이 있으면 즉시 폐기하세요.
      </div>

      {/* ── 탭 1: 등록 ── */}
      {tab === 'register' && (
        <>
          {/* 요약 */}
          {itemsWithCalc.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>요약</span>
              <div className={s.summaryGrid}>
                <SummaryCell label="등록"       value={itemsWithCalc.length} cls={s.summaryValueDefault} />
                <SummaryCell label="안전"       value={summary.safe}         cls={s.summaryValueSafe} />
                <SummaryCell label="주의·위급"  value={summary.warning + summary.urgent} cls={s.summaryValueWarning} />
                <SummaryCell label="기한 초과"  value={summary.expired}      cls={s.summaryValueExpired} />
              </div>
            </div>
          )}

          {/* 빨리 먹어야 하는 카드 */}
          {urgentTop.length > 0 && (
            <div className={s.urgentCard}>
              <div className={s.urgentLabel}>⚠️ 오늘 우선 먹어야 할 식재료</div>
              <div className={s.urgentList}>
                {urgentTop.map(({ item, calc }) => {
                  const info = STORAGE_DATA[item.category]
                  return (
                    <div key={item.id} className={s.urgentItem}>
                      <span className={s.urgentItemName}>
                        <span className={s.foodEmoji}>{info?.emoji ?? '🍽️'}</span>
                        {item.customName || info?.category || item.category}
                      </span>
                      <span className={s.urgentItemDday} style={{
                        color: calc.status === 'expired' ? '#FF4646' :
                               calc.status === 'urgent'  ? '#FF6B6B' : '#FF8C3E',
                      }}>
                        {calc.status === 'expired'
                          ? `D+${Math.abs(calc.remainingDays)} 초과`
                          : `D-${calc.remainingDays}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 추가 폼 또는 추가 버튼 */}
          {showAddForm ? (
            <AddForm
              onAdd={handleAdd}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              className={s.addBtn}
              onClick={() => setShowAddForm(true)}
              disabled={items.length >= MAX_ITEMS}
            >
              {items.length >= MAX_ITEMS
                ? `최대 ${MAX_ITEMS}개까지 등록할 수 있습니다`
                : '+ 식재료 추가하기'}
            </button>
          )}

          {/* 식재료 목록 */}
          {itemsWithCalc.length === 0 ? (
            <div className={s.emptyState}>
              <strong>등록된 식재료가 없습니다</strong>
              "식재료 추가하기" 버튼으로 냉장고에 있는 식재료를 등록하면 보관 기한을 자동으로 추적해드립니다.
            </div>
          ) : (
            <div className={s.foodList}>
              {itemsWithCalc.map(({ item, calc }) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  calc={calc}
                  onDelete={() => handleDelete(item.id)}
                  onSwitchToFreezer={() => handleSwitchToFreezer(item.id)}
                />
              ))}
            </div>
          )}

          {items.length > 0 && (
            <button className={s.resetBtn} onClick={handleReset}>전체 초기화</button>
          )}
        </>
      )}

      {/* ── 탭 2: 가이드 ── */}
      {tab === 'guide' && <GuideTab />}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * Summary cell
 * ──────────────────────────────────────────────── */
function SummaryCell({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={s.summaryCell}>
      <div className={s.summaryLabel}>{label}</div>
      <div className={`${s.summaryValue} ${cls}`}>{value}</div>
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 식재료 카드
 * ──────────────────────────────────────────────── */
function FoodCard({
  item, calc, onDelete, onSwitchToFreezer,
}: {
  item: FoodItem
  calc: CalcResult
  onDelete: () => void
  onSwitchToFreezer: () => void
}) {
  const info = STORAGE_DATA[item.category]
  const cardCls =
    calc.status === 'expired' ? s.foodItemExpired :
    calc.status === 'urgent'  ? s.foodItemUrgent :
    calc.status === 'warning' ? s.foodItemWarning :
                                s.foodItemSafe
  const fillCls =
    calc.status === 'expired' ? s.progressFillExpired :
    calc.status === 'urgent'  ? s.progressFillUrgent :
    calc.status === 'warning' ? s.progressFillWarning :
                                ''
  const storageBadgeCls =
    item.storage === 'roomTemp' ? s.storageBadgeRoom :
    item.storage === 'fridge'   ? s.storageBadgeFridge :
    item.storage === 'freezer'  ? s.storageBadgeFreezer :
                                  s.storageBadgeKimchi
  const statusBadgeCls =
    calc.status === 'expired' ? s.statusExpired :
    calc.status === 'urgent'  ? s.statusUrgent :
    calc.status === 'warning' ? s.statusWarning :
    calc.status === 'safe'    ? s.statusSafe : ''

  const dday = calc.status === 'expired'
    ? `D+${Math.abs(calc.remainingDays)}`
    : `D-${Math.max(0, calc.remainingDays)}`

  const fillWidth = Math.min(100, Math.max(0, calc.ratio * 100))

  const freezerExtraDays = info?.freezerRaw ?? info?.freezerCooked

  return (
    <div className={`${s.foodItem} ${cardCls}`}>
      <div className={s.foodHead}>
        <div className={s.foodTitle}>
          <span className={s.foodEmoji}>{info?.emoji ?? '🍽️'}</span>
          <div>
            <div>{item.customName || info?.category || item.category}</div>
            <div className={s.foodMemo}>
              {BASE_DATE_LABEL[item.baseDateType]}: {item.year}.{String(item.month).padStart(2,'0')}.{String(item.day).padStart(2,'0')}
              {' · '}{CONDITION_LABEL[item.condition]}
              {item.memo ? ` · ${item.memo}` : ''}
            </div>
          </div>
        </div>
        <div className={s.foodBadgeRow}>
          <span className={`${s.storageBadge} ${storageBadgeCls}`}>{STORAGE_BADGE_LABEL[item.storage]}</span>
          {calc.status !== 'unknown' && <span className={`${s.statusBadge} ${statusBadgeCls}`}>{STATUS_LABEL[calc.status]}</span>}
          <button className={s.deleteBtn} onClick={onDelete} aria-label="삭제">✕</button>
        </div>
      </div>

      {calc.status !== 'unknown' && (
        <div className={s.progressRow}>
          <div className={s.progressTrack}>
            <div className={`${s.progressFill} ${fillCls}`} style={{ width: `${fillWidth}%` }} />
          </div>
          <div className={s.progressMeta}>
            {dday}
            <span className={s.small}>{calc.passedDays}/{calc.totalDays}일</span>
          </div>
        </div>
      )}

      {info?.warning && (
        <div className={s.foodWarning}>
          <span>💬</span><span>{info.warning}</span>
        </div>
      )}

      {calc.freezeRecommend && freezerExtraDays && (
        <div className={s.freezeCard}>
          <div className={s.freezeText}>
            💡 <strong>{info?.category}</strong>를 냉동 보관으로 전환하면 보관 기간이 약 <strong>{freezerExtraDays}일</strong>까지 늘어납니다.
          </div>
          <button className={s.freezeBtn} onClick={onSwitchToFreezer}>냉동으로 변경</button>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 추가 폼
 * ──────────────────────────────────────────────── */
function AddForm({ onAdd, onCancel }: { onAdd: (it: FoodItem) => void; onCancel: () => void }) {
  const t = todayValues()
  const [category, setCategory] = useState<string>('beefRaw')
  const [customName, setCustomName] = useState<string>('')
  const [baseDateType, setBaseDateType] = useState<BaseDateType>('purchase')
  const [year, setYear] = useState<number>(t.y)
  const [month, setMonth] = useState<number>(t.m)
  const [day, setDay] = useState<number>(t.d)
  const [storage, setStorage] = useState<StorageMethod>('fridge')
  const [condition, setCondition] = useState<Condition>('raw')
  const [memo, setMemo] = useState<string>('')

  // 카테고리 변경 시 기본값 동기화
  useEffect(() => {
    const info = STORAGE_DATA[category]
    if (!info) return
    if (info.defaultStorage)   setStorage(info.defaultStorage)
    if (info.defaultCondition) setCondition(info.defaultCondition)
  }, [category])

  // baseDateType 변경에 맞춘 condition 힌트
  useEffect(() => {
    if (baseDateType === 'cook') setCondition(c => c === 'raw' ? 'cooked' : c)
    if (baseDateType === 'open') setCondition('opened')
  }, [baseDateType])

  const dim = daysInMonth(year, month)
  const days = Array.from({ length: dim }, (_, i) => i + 1)

  const handleSubmit = () => {
    onAdd({
      id: makeId(),
      category,
      customName: customName.trim() || undefined,
      baseDateType,
      year, month, day,
      storage,
      condition,
      memo: memo.trim() || undefined,
    })
  }

  // 카테고리 그룹 렌더
  const groupedKeys = useMemo(() => {
    const groups: Record<GroupKey, string[]> = {
      meat: [], seafood: [], dairy: [], veggie: [], grain: [], processed: [],
    }
    for (const k of CATEGORY_KEYS) {
      groups[STORAGE_DATA[k].group].push(k)
    }
    return groups
  }, [])

  return (
    <div className={s.card}>
      <span className={s.cardLabel}>식재료 추가</span>
      <div className={s.addForm}>

        {/* 카테고리 */}
        <div>
          <span className={s.fieldLabel}>식재료 카테고리</span>
          <div className={s.selectWrap}>
            <select className={s.select} value={category} onChange={e => setCategory(e.target.value)}>
              {(Object.keys(groupedKeys) as GroupKey[]).map(g => (
                <optgroup key={g} label={`${GROUP_META[g].emoji} ${GROUP_META[g].label}`}>
                  {groupedKeys[g].map(k => (
                    <option key={k} value={k}>{STORAGE_DATA[k].emoji} {STORAGE_DATA[k].category}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className={s.selectArrow}>▾</span>
          </div>
        </div>

        {/* 커스텀 이름 */}
        <div>
          <span className={s.fieldLabel}>이름 (선택)</span>
          <input
            className={s.textInput}
            placeholder={`예: ${STORAGE_DATA[category]?.category} — 정육점`}
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            maxLength={40}
          />
        </div>

        {/* 기준일 라디오 */}
        <div>
          <span className={s.fieldLabel}>기준일</span>
          <div className={s.radioRow}>
            {(['purchase','cook','open'] as BaseDateType[]).map(b => (
              <button
                key={b}
                className={`${s.radioBtn} ${baseDateType === b ? s.radioBtnActive : ''}`}
                onClick={() => setBaseDateType(b)}
              >
                {BASE_DATE_LABEL[b]}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 선택 */}
        <div>
          <span className={s.fieldLabel}>날짜</span>
          <div className={s.dateRow}>
            <div className={s.selectWrap}>
              <select className={s.select} value={year} onChange={e => setYear(parseInt(e.target.value))}>
                {[t.y - 1, t.y].map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              <span className={s.selectArrow}>▾</span>
            </div>
            <div className={s.selectWrap}>
              <select className={s.select} value={month} onChange={e => {
                const m = parseInt(e.target.value)
                setMonth(m)
                const dim2 = daysInMonth(year, m)
                if (day > dim2) setDay(dim2)
              }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
              </select>
              <span className={s.selectArrow}>▾</span>
            </div>
            <div className={s.selectWrap}>
              <select className={s.select} value={day} onChange={e => setDay(parseInt(e.target.value))}>
                {days.map(d => <option key={d} value={d}>{d}일</option>)}
              </select>
              <span className={s.selectArrow}>▾</span>
            </div>
          </div>
        </div>

        {/* 보관 방식 */}
        <div>
          <span className={s.fieldLabel}>보관 방식</span>
          <div className={s.storageRow}>
            <button className={`${s.storageBtn} ${s.storageBtnRoom}    ${storage === 'roomTemp' ? s.storageBtnActive : ''}`} onClick={() => setStorage('roomTemp')}>🌡️ 실온</button>
            <button className={`${s.storageBtn} ${s.storageBtnFridge}  ${storage === 'fridge'   ? s.storageBtnActive : ''}`} onClick={() => setStorage('fridge')}>❄️ 냉장</button>
            <button className={`${s.storageBtn} ${s.storageBtnFreezer} ${storage === 'freezer'  ? s.storageBtnActive : ''}`} onClick={() => setStorage('freezer')}>🧊 냉동</button>
            <button className={`${s.storageBtn} ${s.storageBtnKimchi}  ${storage === 'kimchi'   ? s.storageBtnActive : ''}`} onClick={() => setStorage('kimchi')}>🌶️ 김치냉장고</button>
          </div>
        </div>

        {/* 상태 */}
        <div>
          <span className={s.fieldLabel}>상태</span>
          <div className={s.radioRow}>
            {(['raw','cooked','opened'] as Condition[]).map(c => (
              <button
                key={c}
                className={`${s.radioBtn} ${condition === c ? s.radioBtnActive : ''}`}
                onClick={() => setCondition(c)}
              >
                {CONDITION_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div>
          <span className={s.fieldLabel}>메모 (선택)</span>
          <input
            className={s.textInput}
            placeholder="예: 냉장 상단 칸 / 진공팩 / 1회분"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className={s.formActionRow}>
          <button className={s.cancelBtn} onClick={onCancel}>취소</button>
          <button className={s.submitBtn} onClick={handleSubmit}>등록하기</button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 가이드 탭
 * ──────────────────────────────────────────────── */
function GuideTab() {
  const groups = useMemo(() => {
    const g: Record<GroupKey, string[]> = {
      meat: [], seafood: [], dairy: [], veggie: [], grain: [], processed: [],
    }
    for (const k of CATEGORY_KEYS) g[STORAGE_DATA[k].group].push(k)
    return g
  }, [])

  return (
    <>
      {(Object.keys(GROUP_META) as GroupKey[]).map(group => {
        const keys = groups[group]
        if (!keys.length) return null
        return (
          <div key={group} className={s.guideSection}>
            <div className={s.guideHead}>
              <span className={s.guideEmoji}>{GROUP_META[group].emoji}</span>
              <span>{GROUP_META[group].label}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.guideTable}>
                <thead>
                  <tr>
                    <th>식재료</th>
                    <th style={{ textAlign: 'center' }}>실온</th>
                    <th style={{ textAlign: 'center' }}>냉장</th>
                    <th style={{ textAlign: 'center' }}>냉동</th>
                    <th>주의사항</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(k => {
                    const info = STORAGE_DATA[k]
                    const dangerous = !!info.warning && (info.fridgeRaw === 1 || info.fridgeRaw === 2 || info.warning.includes('빠'))
                    const fridge = info.fridgeRaw ?? info.fridgeCooked
                    const freezer = info.freezerRaw ?? info.freezerCooked
                    return (
                      <tr key={k} className={dangerous ? s.guideRowDanger : ''}>
                        <td className={s.guideName}>{info.emoji} {info.category}</td>
                        <td className={`${s.guideDays} ${info.roomTemp ? '' : s.guideDaysNone}`}>
                          {info.roomTemp ? `${info.roomTemp}일` : '×'}
                        </td>
                        <td className={`${s.guideDays} ${fridge ? '' : s.guideDaysNone}`}>
                          {fridge ? `${fridge}일` : '×'}
                        </td>
                        <td className={`${s.guideDays} ${freezer ? '' : s.guideDaysNone}`}>
                          {freezer ? (freezer >= 30 ? `${Math.round(freezer/30)}개월` : `${freezer}일`) : '×'}
                        </td>
                        <td className={s.guideWarning}>{info.warning ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* 보관 팁 */}
      <div className={s.tipCard}>
        <div className={s.tipLabel}>📌 보관 팁</div>
        <ul className={s.tipList}>
          <li>냉장고 온도는 0~4°C, 냉동고는 -18°C 이하로 유지하세요.</li>
          <li>위험 온도대(4~60°C)에서 2시간 이상 노출된 식품은 폐기를 고려하세요.</li>
          <li>한 번 해동한 식재료는 다시 냉동하지 말고, 조리 후에는 다시 냉동 가능합니다.</li>
          <li>1회분씩 소분해 보관하면 해동·재냉동 위험을 줄일 수 있습니다.</li>
          <li>냉장고는 70% 이하로 채워야 냉기 순환이 원활합니다.</li>
        </ul>
      </div>
    </>
  )
}
