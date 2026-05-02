'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './unit-price.module.css'
import {
  UNITS, UNIT_KIND, UNIT_FACTOR, BASE_UNIT_BY_KIND, BASES,
  QUICK_AMOUNT_BY_UNIT, QUICK_PRICES, CONSUMPTION_OPTIONS,
  num, fmt, fmt1, formatPriceInput, sanitizeDecimal,
  recommendBase,
  type Unit, type Base,
} from './unitPriceUtils'

type Product = {
  id: string
  name: string
  price: string
  amount: string
  unit: Unit
  count: string
  // 고급 옵션
  instantDiscount: string
  couponPercent: string
  shippingFee: string
  consumption: number  // 100|75|50|25
  // UI
  advancedOpen: boolean
}

const emptyProduct = (id: string): Product => ({
  id, name: '', price: '', amount: '', unit: 'ml', count: '1',
  instantDiscount: '', couponPercent: '', shippingFee: '',
  consumption: 100, advancedOpen: false,
})

const LABELS = ['A', 'B', 'C']
const CARD_CLS = [s.cardA, s.cardB, s.cardC]
const TAG_CLS = [s.tagA, s.tagB, s.tagC]

const toBase = (value: number, unit: Unit): number => value * UNIT_FACTOR[unit]

function calcTotalAmount(p: Product): number {
  return toBase(num(p.amount), p.unit) * Math.max(1, num(p.count))
}

function calcFinalPrice(p: Product): number {
  let v = num(p.price)
  v -= num(p.instantDiscount)
  const cp = num(p.couponPercent)
  if (cp > 0) v *= 1 - cp / 100
  v += num(p.shippingFee)
  return Math.max(0, v)
}

export default function UnitPriceClient() {
  const [products, setProducts] = useState<Product[]>([emptyProduct('A'), emptyProduct('B')])
  const [baseId, setBaseId] = useState<Base['id']>('per100ml')
  const [autoBase, setAutoBase] = useState(true)
  const [sameMoney, setSameMoney] = useState(false)
  const [sameMoneyAmount, setSameMoneyAmount] = useState('10000')
  const [copied, setCopied] = useState(false)

  const setField = <K extends keyof Product>(idx: number, key: K, value: Product[K]) => {
    setProducts(prev => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)))
  }

  const addProduct = () => {
    if (products.length >= 3) return
    setProducts([...products, emptyProduct(LABELS[products.length])])
  }
  const removeProduct = (idx: number) => {
    if (products.length <= 2) return
    const next = products.filter((_, i) => i !== idx).map((p, i) => ({ ...p, id: LABELS[i] }))
    setProducts(next)
  }
  const resetAll = () => {
    setProducts([emptyProduct('A'), emptyProduct('B')])
    setBaseId('per100ml'); setAutoBase(true)
    setSameMoney(false); setCopied(false)
  }

  const base = BASES.find(b => b.id === baseId)!

  const valid = useMemo(() => {
    return products.map(p => {
      const price = num(p.price); const amount = num(p.amount)
      if (price <= 0 || amount <= 0) return null
      if (UNIT_KIND[p.unit] !== base.kind) return { ...p, _mismatched: true as const }
      const total = calcTotalAmount(p)
      const final = calcFinalPrice(p)
      const unitPrice = (final / total) * base.factor
      const effectiveTotal = total * (p.consumption / 100)
      const effectiveUnitPrice = effectiveTotal > 0 ? (final / effectiveTotal) * base.factor : 0
      return { product: p, totalAmount: total, finalPrice: final, unitPrice, effectiveUnitPrice, mismatched: false }
    })
  }, [products, base])

  type Calc = {
    product: Product; totalAmount: number; finalPrice: number;
    unitPrice: number; effectiveUnitPrice: number; mismatched: false
  }
  const validCalcs: Calc[] = valid.filter(
    (v): v is Calc => !!v && 'unitPrice' in v && v.mismatched === false
  )

  const winner = validCalcs.length > 0
    ? validCalcs.reduce((a, b) => (a.unitPrice < b.unitPrice ? a : b))
    : null
  const ranked = [...validCalcs].sort((a, b) => a.unitPrice - b.unitPrice)
  const rankMap = new Map(ranked.map((c, i) => [c.product.id, i + 1]))

  // 다른 단위 계열 감지
  const hasMultipleKinds = useMemo(() => {
    const kinds = new Set(
      products
        .filter(p => num(p.amount) > 0)
        .map(p => UNIT_KIND[p.unit])
    )
    return kinds.size > 1
  }, [products])

  // 자동 단위 추천
  useEffect(() => {
    if (!autoBase || validCalcs.length === 0) return
    const first = validCalcs[0]
    const reco = recommendBase(UNIT_KIND[first.product.unit], first.totalAmount)
    if (reco !== baseId) setBaseId(reco)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBase, validCalcs.length, validCalcs[0]?.product.unit, validCalcs[0]?.totalAmount])

  const diff = useMemo(() => {
    if (!winner || ranked.length < 2) return null
    const second = ranked[1]
    const diffPrice = second.unitPrice - winner.unitPrice
    const diffPercent = second.unitPrice > 0 ? (diffPrice / second.unitPrice) * 100 : 0
    const sameAmount = num(sameMoneyAmount)
    const canBuyWinner = winner.unitPrice > 0 ? (sameAmount / winner.unitPrice) * base.factor : 0
    const canBuySecond = second.unitPrice > 0 ? (sameAmount / second.unitPrice) * base.factor : 0
    return { second, diffPrice, diffPercent, canBuyWinner, canBuySecond }
  }, [winner, ranked, sameMoneyAmount, base.factor])

  const handleCopy = async () => {
    if (!winner || !diff) return
    const lines = ['── 단가 비교 결과 ──']
    for (const c of validCalcs) {
      const name = c.product.name || `${c.product.id} 상품`
      const baseUnit = BASE_UNIT_BY_KIND[UNIT_KIND[c.product.unit]]
      lines.push(`${c.product.id} ${name}: ${fmt1(c.unitPrice)}원/${base.label.replace('당', '')} (${fmt(c.totalAmount)}${baseUnit}, ${fmt(c.finalPrice)}원)`)
    }
    const wn = winner.product.name || `${winner.product.id} 상품`
    lines.push(`→ ${wn}이(가) ${base.label} ${fmt1(diff.diffPrice)}원 / ${fmt1(diff.diffPercent)}% 저렴`)
    lines.push('youtil.kr/tools/life/unit-price')
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <div className={s.wrap}>
      {/* ── 결과 (상단 sticky) ── */}
      {winner && validCalcs.length >= 2 ? (
        <div className={`${s.heroResult} ${s.heroSticky}`}>
          <div className={s.heroLeft}>
            <p className={s.heroLead}>🏆 가장 저렴 ({base.label})</p>
            <h2 className={s.heroName}>{winner.product.name || `${winner.product.id} 상품`}</h2>
          </div>
          <div className={s.heroRight}>
            <div className={s.heroPrice}>{fmt1(winner.unitPrice)}<span className={s.heroPriceUnit}>원</span></div>
            {diff && diff.diffPercent > 0 && (
              <div className={s.heroDiff}>2위 대비 -{fmt1(diff.diffPercent)}%</div>
            )}
          </div>
        </div>
      ) : (
        <div className={s.empty}>↓ 상품 2개 이상의 가격·용량을 입력하면 즉시 비교됩니다.</div>
      )}

      {/* ── 상품 입력 ── */}
      {products.map((p, idx) => (
        <ProductCard
          key={idx}
          product={p}
          idx={idx}
          canRemove={products.length > 2}
          onChange={(key, value) => setField(idx, key, value)}
          onRemove={() => removeProduct(idx)}
        />
      ))}

      {products.length < 3 && (
        <button type="button" className={s.addBtn} onClick={addProduct}>
          + 상품 추가 ({products.length}/3)
        </button>
      )}

      {/* ── 다른 계열 경고 ── */}
      {hasMultipleKinds && (
        <div className={s.warnBox}>
          ⚠️ 액체(ml·L)와 무게(g·kg)는 직접 비교가 어렵습니다(밀도 다름). 같은 단위 계열로 통일해주세요.
        </div>
      )}

      {/* ── 비교 기준 단위 ── */}
      <div className={s.card}>
        <div className={s.basePillsHead}>
          <span className={s.cardLabel}>비교 기준 단위</span>
          <label className={s.autoBaseToggle}>
            <input type="checkbox" checked={autoBase} onChange={e => setAutoBase(e.target.checked)} />
            <span>자동 추천</span>
          </label>
        </div>
        <div className={s.basePills}>
          {BASES.map(b => {
            const hasMatchingUnit = products.some(p => num(p.amount) > 0 && UNIT_KIND[p.unit] === b.kind)
            const disabled = !hasMatchingUnit
            return (
              <button key={b.id} type="button" disabled={disabled}
                className={`${s.basePill} ${baseId === b.id ? s.basePillActive : ''}`}
                onClick={() => { setAutoBase(false); setBaseId(b.id) }}>
                {b.label}
              </button>
            )
          })}
        </div>
        <div className={s.sameMoneyRow}>
          <input id="sameMoney" type="checkbox" className={s.sameMoneyCheck}
            checked={sameMoney} onChange={e => setSameMoney(e.target.checked)} />
          <label htmlFor="sameMoney" className={s.sameMoneyLabel}>
            💵 같은 금액으로 살 수 있는 양 보기
          </label>
          {sameMoney && (
            <>
              <input className={s.sameMoneyInput} inputMode="numeric"
                value={sameMoneyAmount ? formatPriceInput(sameMoneyAmount) : ''}
                onChange={e => setSameMoneyAmount(e.target.value.replace(/[^0-9]/g, ''))} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>원</span>
            </>
          )}
        </div>
      </div>

      {/* ── 비교 표 ── */}
      {validCalcs.length >= 2 && (
        <div className={s.card}>
          <div className={s.cardTitle}>📊 단가 비교 ({base.label})</div>
          <div className={s.tableWrap}>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th>상품</th>
                  <th className={s.numCol}>실결제</th>
                  <th className={s.numCol}>총 용량</th>
                  <th className={s.numCol}>단가</th>
                </tr>
              </thead>
              <tbody>
                {validCalcs.map((c, i) => {
                  const rank = rankMap.get(c.product.id)!
                  const baseUnit = BASE_UNIT_BY_KIND[UNIT_KIND[c.product.unit]]
                  const origIdx = products.findIndex(p => p.id === c.product.id)
                  const hasConsumption = c.product.consumption < 100
                  return (
                    <tr key={i} className={rank === 1 ? s.winnerRow : ''}>
                      <td>
                        <div className={s.productLabel}>
                          <span className={`${s.productTag} ${TAG_CLS[origIdx] || ''}`}>{c.product.id}</span>
                          <span>{c.product.name || '-'}</span>
                          {rank === 1 && <span className={s.trophy}>🏆</span>}
                        </div>
                        {(num(c.product.count) > 1 || hasConsumption) && (
                          <div className={s.badgeRow}>
                            {num(c.product.count) > 1 && <span className={`${s.badge} ${s.badgeCount}`}>×{c.product.count}</span>}
                            {hasConsumption && <span className={`${s.badge} ${s.badgeConsumption}`}>{c.product.consumption}% 사용</span>}
                          </div>
                        )}
                      </td>
                      <td className={s.num}>{fmt(Math.round(c.finalPrice))}원</td>
                      <td className={s.num}>{fmt1(c.totalAmount)}{baseUnit}</td>
                      <td className={`${s.num} ${s.unitPriceCell}`}>{fmt1(c.unitPrice)}원</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 실질 단가 (소비 가능량 < 100% 시) */}
          {validCalcs.some(c => c.product.consumption < 100) && (
            <div className={s.effectiveBox}>
              <p className={s.effectiveTitle}>💡 실질 단가 (사용 가능량 반영)</p>
              {validCalcs.map(c => {
                if (c.product.consumption >= 100) return null
                return (
                  <p key={c.product.id} className={s.effectiveItem}>
                    <strong>{c.product.id} {c.product.name || '상품'}</strong> ({c.product.consumption}% 사용 시) →
                    실질 <strong style={{ color: '#FF8C3E' }}>{fmt1(c.effectiveUnitPrice)}원/{base.label.replace('당', '')}</strong>
                    <span style={{ color: 'var(--muted)' }}> (표시 단가의 {fmt1(100 / c.product.consumption)}배)</span>
                  </p>
                )
              })}
              <p className={s.effectiveHint}>
                ⚠️ 대용량이라도 다 쓰지 못하면 실질 단가는 ↑. 유통기한·보관 공간도 함께 고려.
              </p>
            </div>
          )}

          {diff && (
            <div className={s.diffCard}>
              <div className={s.diffHead}>🔍 차이</div>
              <div className={s.diffGrid}>
                <div className={s.diffBox}>
                  <div className={s.diffLabel}>단가 차이 ({base.label})</div>
                  <div className={`${s.diffValue} ${
                    diff.diffPercent >= 10 ? s.diffStrong : diff.diffPercent >= 5 ? s.diffMedium : s.diffWeak
                  }`}>
                    {fmt1(diff.diffPrice)}원 ({fmt1(diff.diffPercent)}%)
                  </div>
                </div>
                {sameMoney && winner && (
                  <>
                    <div className={s.diffBox}>
                      <div className={s.diffLabel}>{winner.product.id} {fmt(num(sameMoneyAmount))}원으로</div>
                      <div className={s.diffValue}>
                        {fmt(Math.round(diff.canBuyWinner))}{BASE_UNIT_BY_KIND[UNIT_KIND[winner.product.unit]]}
                      </div>
                    </div>
                    <div className={s.diffBox}>
                      <div className={s.diffLabel}>{diff.second.product.id} {fmt(num(sameMoneyAmount))}원으로</div>
                      <div className={s.diffValue}>
                        {fmt(Math.round(diff.canBuySecond))}{BASE_UNIT_BY_KIND[UNIT_KIND[diff.second.product.unit]]}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className={s.actionRow}>
            <button type="button" className={`${s.shareBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✅ 복사됨!' : '📋 비교 결과 복사'}
            </button>
            <button type="button" className={s.resetBtn} onClick={resetAll}>초기화</button>
          </div>
        </div>
      )}

      {valid.some(v => v && 'mismatched' in v && v.mismatched) && (
        <div className={s.errorBox}>
          ⚠️ 선택한 비교 기준({base.label})과 단위가 맞지 않는 상품이 있습니다. 같은 단위 계열(부피·무게·개수)끼리만 비교 가능.
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── 상품 카드 ──────────────────────── */
function ProductCard({
  product: p, idx, canRemove, onChange, onRemove,
}: {
  product: Product
  idx: number
  canRemove: boolean
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
  onRemove: () => void
}) {
  const decCount = () => onChange('count', String(Math.max(1, num(p.count) - 1)))
  const incCount = () => onChange('count', String(Math.min(99, num(p.count) + 1)))
  const quickAmounts = QUICK_AMOUNT_BY_UNIT[p.unit] || []

  return (
    <div className={`${s.productCard} ${CARD_CLS[idx]}`}>
      <span className={s.productBadge}>{LABELS[idx]}</span>
      {canRemove && (
        <button type="button" className={s.removeBtn} onClick={onRemove} aria-label="상품 삭제">×</button>
      )}

      <div className={s.fieldRow}>
        {/* 상품명 */}
        <div className={s.field}>
          <label className={s.fieldLabel}>상품명 (선택)</label>
          <input className={s.input}
            placeholder="예: 비타500 대용량"
            value={p.name}
            onChange={e => onChange('name', e.target.value)} />
        </div>

        {/* 가격 */}
        <div className={s.field}>
          <label className={s.fieldLabel}>가격 (원) *</label>
          <input className={`${s.input} ${s.inputBig} ${s.inputRight}`}
            type="text" inputMode="numeric"
            placeholder="0"
            value={p.price ? formatPriceInput(p.price) : ''}
            onChange={e => onChange('price', e.target.value.replace(/[^0-9]/g, ''))} />
          <div className={s.chipRow}>
            {QUICK_PRICES.map(amt => (
              <button key={amt} type="button" className={s.chip}
                onClick={() => onChange('price', String(amt))}>
                {fmt(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* 용량 + 단위 */}
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel}>용량 *</label>
            <input className={`${s.input} ${s.inputBig} ${s.inputRight}`}
              type="text" inputMode="decimal"
              placeholder="0"
              value={p.amount}
              onChange={e => onChange('amount', sanitizeDecimal(e.target.value))} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>단위 *</label>
            <div className={s.selectWrap}>
              <select className={`${s.select} ${s.inputBig}`} value={p.unit}
                onChange={e => onChange('unit', e.target.value as Unit)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
        </div>
        {quickAmounts.length > 0 && (
          <div className={s.chipRow}>
            {quickAmounts.map(amt => (
              <button key={amt} type="button" className={s.chip}
                onClick={() => onChange('amount', String(amt))}>
                {amt}{p.unit}
              </button>
            ))}
          </div>
        )}

        {/* 개수 (큰 +/-) */}
        <div className={s.field}>
          <label className={s.fieldLabel}>개수 *</label>
          <div className={s.countRow}>
            <button type="button" className={s.countBtn} onClick={decCount} aria-label="개수 감소">−</button>
            <input className={`${s.input} ${s.inputBig} ${s.countInput}`}
              type="text" inputMode="numeric"
              value={p.count}
              onChange={e => onChange('count', e.target.value.replace(/[^0-9]/g, ''))} />
            <button type="button" className={s.countBtn} onClick={incCount} aria-label="개수 증가">+</button>
          </div>
          <p className={s.countHint}>
            💡 1+1 → 개수 <strong>2</strong>개 · 2+1 → 개수 <strong>3</strong>개 · 3+1 → 개수 <strong>4</strong>개로 입력
          </p>
        </div>

        {/* 고급 옵션 (아코디언) */}
        <details className={s.advancedDetails} open={p.advancedOpen}
          onToggle={e => onChange('advancedOpen', (e.target as HTMLDetailsElement).open)}>
          <summary className={s.advancedSummary}>
            ⚙️ 고급 옵션 — 행사·쿠폰·배송비·소비 가능량
          </summary>
          <div className={s.advancedBody}>
            <div className={s.row3}>
              <div className={s.field}>
                <label className={s.fieldLabel}>즉시할인 (원)</label>
                <input className={`${s.input} ${s.inputRight}`}
                  type="text" inputMode="numeric" placeholder="0"
                  value={p.instantDiscount ? formatPriceInput(p.instantDiscount) : ''}
                  onChange={e => onChange('instantDiscount', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>쿠폰 (%)</label>
                <input className={`${s.input} ${s.inputRight}`}
                  type="text" inputMode="decimal" placeholder="0"
                  value={p.couponPercent}
                  onChange={e => onChange('couponPercent', sanitizeDecimal(e.target.value))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>배송비 (원)</label>
                <input className={`${s.input} ${s.inputRight}`}
                  type="text" inputMode="numeric" placeholder="0"
                  value={p.shippingFee ? formatPriceInput(p.shippingFee) : ''}
                  onChange={e => onChange('shippingFee', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>

            <div className={s.field} style={{ marginTop: 14 }}>
              <label className={s.fieldLabel}>실제 소비 가능량 (대용량 함정 방지)</label>
              <div className={s.consumptionPills}>
                {CONSUMPTION_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    className={`${s.consumptionPill} ${p.consumption === opt.value ? s.consumptionPillActive : ''}`}
                    onClick={() => onChange('consumption', opt.value)}
                    title={opt.desc}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className={s.countHint}>
                💡 매일 사용(생수·우유) <strong>100%</strong> · 자주(샴푸·세제) <strong>75%</strong> · 가끔(소스·조미료) <strong>50%</strong> · 이벤트용 <strong>25%</strong>
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
