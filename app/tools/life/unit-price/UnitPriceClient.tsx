'use client'

import { useMemo, useState } from 'react'
import s from './unit-price.module.css'

type Unit = 'ml' | 'L' | 'g' | 'kg' | '개' | '매' | '장'
type UnitKind = 'vol' | 'mass' | 'count'
type Deal = 'none' | 'plus' | '1+1' | '2+1' | '3+1'
type Base = { id: 'per10ml' | 'per100ml' | 'per100g' | 'per1ea'; label: string; factor: number; kind: UnitKind }

const UNITS: Unit[] = ['ml', 'L', 'g', 'kg', '개', '매', '장']
const UNIT_KIND: Record<Unit, UnitKind> = {
  ml: 'vol', L: 'vol', g: 'mass', kg: 'mass', 개: 'count', 매: 'count', 장: 'count',
}
const UNIT_FACTOR: Record<Unit, number> = { ml: 1, L: 1000, g: 1, kg: 1000, 개: 1, 매: 1, 장: 1 }
const BASE_UNIT_BY_KIND: Record<UnitKind, string> = { vol: 'ml', mass: 'g', count: '개' }

const BASES: Base[] = [
  { id: 'per10ml',  label: '10ml당',  factor: 10,  kind: 'vol' },
  { id: 'per100ml', label: '100ml당', factor: 100, kind: 'vol' },
  { id: 'per100g',  label: '100g당',  factor: 100, kind: 'mass' },
  { id: 'per1ea',   label: '1개당',   factor: 1,   kind: 'count' },
]

type Product = {
  id: string
  name: string
  price: string
  amount: string
  unit: Unit
  count: string
  deal: Deal
  dealAmount: string
  dealUnit: Unit
  instantDiscount: string
  couponPercent: string
  shippingFee: string
}

const emptyProduct = (id: string): Product => ({
  id,
  name: '',
  price: '',
  amount: '',
  unit: 'ml',
  count: '1',
  deal: 'none',
  dealAmount: '',
  dealUnit: 'ml',
  instantDiscount: '',
  couponPercent: '',
  shippingFee: '',
})

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
const fmt = (n: number) => n.toLocaleString('ko-KR')
const fmt1 = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 1 })
const fmt2 = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 2 })

function toBase(value: number, unit: Unit): number {
  return value * UNIT_FACTOR[unit]
}

/** 행사 반영 총 용량 (base unit 기준) */
function calcTotalAmount(p: Product): number {
  const amount = num(p.amount)
  const count = Math.max(1, num(p.count))
  const base = toBase(amount, p.unit) * count
  switch (p.deal) {
    case 'plus':  return base + toBase(num(p.dealAmount), p.dealUnit)
    case '1+1':   return base * 2
    case '2+1':   return base * (3 / 2)
    case '3+1':   return base * (4 / 3)
    default:      return base
  }
}

/** 실제 지불 가격 (배송비 포함) */
function calcFinalPrice(p: Product): number {
  const price = num(p.price)
  const count = Math.max(1, num(p.count))
  // 묶음 가격: 1+1은 1개 가격, 2+1은 2개 가격, 3+1은 3개 가격; 그 외엔 count
  const multiplier = p.deal === '1+1' ? 1 : p.deal === '2+1' ? 2 : p.deal === '3+1' ? 3 : count
  let base = price * multiplier
  base -= num(p.instantDiscount)
  const cp = num(p.couponPercent)
  if (cp > 0) base *= 1 - cp / 100
  base += num(p.shippingFee)
  return Math.max(0, base)
}

function hasAnyDeal(p: Product) {
  return p.deal !== 'none' || num(p.instantDiscount) > 0 || num(p.couponPercent) > 0 || num(p.shippingFee) > 0 || num(p.count) > 1
}

const LABELS = ['A', 'B', 'C']
const CARD_CLS = [s.cardA, s.cardB, s.cardC]
const TAG_CLS = [s.tagA, s.tagB, s.tagC]

export default function UnitPriceClient() {
  const [products, setProducts] = useState<Product[]>([emptyProduct('A'), emptyProduct('B')])
  const [baseId, setBaseId] = useState<Base['id']>('per100ml')
  const [sameMoney, setSameMoney] = useState(false)
  const [sameMoneyAmount, setSameMoneyAmount] = useState('10000')
  const [copied, setCopied] = useState(false)

  const setField = <K extends keyof Product>(idx: number, key: K, value: Product[K]) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)))
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
    setBaseId('per100ml')
    setSameMoney(false)
    setCopied(false)
  }

  const base = BASES.find((b) => b.id === baseId)!

  const valid = useMemo(() => {
    return products.map((p) => {
      const price = num(p.price)
      const amount = num(p.amount)
      if (price <= 0 || amount <= 0) return null
      // 단위 종류가 base 와 맞는지
      if (UNIT_KIND[p.unit] !== base.kind) return { ...p, _mismatched: true as const }
      const total = calcTotalAmount(p)
      const final = calcFinalPrice(p)
      const unitPrice = (final / total) * base.factor
      return {
        product: p,
        totalAmount: total,
        finalPrice: final,
        unitPrice,
        mismatched: false,
      }
    })
  }, [products, base])

  type Calc = { product: Product; totalAmount: number; finalPrice: number; unitPrice: number; mismatched: false }
  const validCalcs: Calc[] = valid.filter((v): v is Calc => !!v && 'unitPrice' in v && v.mismatched === false)

  const winner = validCalcs.length > 0
    ? validCalcs.reduce((a, b) => (a.unitPrice < b.unitPrice ? a : b))
    : null

  const cheapestPrice = validCalcs.length > 0
    ? validCalcs.reduce((a, b) => (a.finalPrice < b.finalPrice ? a : b))
    : null

  const ranked = [...validCalcs].sort((a, b) => a.unitPrice - b.unitPrice)
  const rankMap = new Map(ranked.map((c, i) => [c.product.id, i + 1]))

  /** 차이 분석 */
  const diff = useMemo(() => {
    if (!winner || ranked.length < 2) return null
    const second = ranked[1]
    const diffPrice = second.unitPrice - winner.unitPrice
    const diffPercent = second.unitPrice > 0 ? (diffPrice / second.unitPrice) * 100 : 0
    const diffAmount = winner.totalAmount - second.totalAmount
    const sameAmount = num(sameMoneyAmount)
    const canBuyWinner = winner.unitPrice > 0 ? (sameAmount / winner.unitPrice) * base.factor : 0
    const canBuySecond = second.unitPrice > 0 ? (sameAmount / second.unitPrice) * base.factor : 0
    return { second, diffPrice, diffPercent, diffAmount, canBuyWinner, canBuySecond }
  }, [winner, ranked, sameMoneyAmount, base.factor])

  /** 해석 문구 */
  const comment = useMemo(() => {
    if (!winner || !cheapestPrice) return ''
    const winnerName = winner.product.name || `${winner.product.id} 상품`
    const cheapestName = cheapestPrice.product.name || `${cheapestPrice.product.id} 상품`
    const isDeal = winner.product.deal === '1+1' || winner.product.deal === '2+1' || winner.product.deal === '3+1'

    if (cheapestPrice.product.id === winner.product.id) {
      return `${winnerName}이(가) 가격도 저렴하고 단가도 낮습니다. 바로 선택하세요.`
    }

    if (isDeal && winner.product.deal === '1+1') {
      return `1+1 행사 반영 시 ${winnerName}의 실질 단가는 절반 수준입니다.\n행사 기간에 구매하는 것이 매우 유리합니다.`
    }

    return `가격은 ${cheapestName}이(가) 저렴하지만, 단가는 ${winnerName}이(가) 낮습니다.\n자주 쓰는 제품이라면 ${winnerName}이(가) 장기적으로 유리하고, 소량만 필요하다면 ${cheapestName}이(가) 합리적입니다.`
  }, [winner, cheapestPrice])

  /** 적용 내역 요약 */
  const buildApplied = (p: Product, total: number, final: number): string[] => {
    const items: string[] = []
    const baseUnit = BASE_UNIT_BY_KIND[UNIT_KIND[p.unit]]
    if (num(p.count) > 1) items.push(`${p.count}개 묶음 (총 ${fmt(total)}${baseUnit})`)
    if (p.deal === '1+1') items.push(`1+1 적용 → 총 용량 2배 계산됨`)
    if (p.deal === '2+1') items.push(`2+1 적용 → 2개 가격에 3개 구매로 계산됨`)
    if (p.deal === '3+1') items.push(`3+1 적용 → 3개 가격에 4개 구매로 계산됨`)
    if (p.deal === 'plus') items.push(`덤 ${p.dealAmount}${p.dealUnit} 포함 계산됨`)
    if (num(p.instantDiscount) > 0) items.push(`즉시할인 ${fmt(num(p.instantDiscount))}원 반영됨`)
    if (num(p.couponPercent) > 0) items.push(`쿠폰 ${p.couponPercent}% 할인 반영됨`)
    if (num(p.shippingFee) > 0) items.push(`배송비 ${fmt(num(p.shippingFee))}원 포함됨`)
    return items
  }

  const handleCopy = async () => {
    if (!winner || !diff) return
    const lines = ['── 단가 비교 결과 ──']
    for (const c of validCalcs) {
      const name = c.product.name || `${c.product.id} 상품`
      const baseUnit = BASE_UNIT_BY_KIND[UNIT_KIND[c.product.unit]]
      const applied = buildApplied(c.product, c.totalAmount, c.finalPrice)
      const extras = applied.length > 0 ? ` / ${applied.join(', ')}` : ''
      lines.push(`${c.product.id} ${name}: ${fmt1(c.unitPrice)}원/${base.label.replace('당', '')} (${fmt(c.totalAmount)}${baseUnit}, ${fmt(c.finalPrice)}원${extras})`)
    }
    const winnerName = winner.product.name || `${winner.product.id} 상품`
    lines.push(`→ ${winnerName}이(가) ${base.label} ${fmt1(diff.diffPrice)}원 저렴 (${fmt1(diff.diffPercent)}% 차이)`)
    lines.push('youtil.kr/tools/life/unit-price')

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <div className={s.wrap}>
      {/* 상품 입력 */}
      {products.map((p, idx) => (
        <div key={idx} className={`${s.productCard} ${CARD_CLS[idx]}`}>
          <span className={s.productBadge}>{LABELS[idx]}</span>
          {products.length > 2 && (
            <button type="button" className={s.removeBtn} onClick={() => removeProduct(idx)} aria-label="상품 삭제">×</button>
          )}

          <div className={s.fieldRow} style={{ marginTop: 16 }}>
            <div className={s.field}>
              <label className={s.fieldLabel}>상품명 (선택)</label>
              <input
                className={s.input}
                placeholder="예: 비타500 대용량"
                value={p.name}
                onChange={(e) => setField(idx, 'name', e.target.value)}
              />
            </div>

            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>가격 (원)</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="numeric"
                  placeholder="0"
                  value={p.price ? fmt(num(p.price)) : ''}
                  onChange={(e) => setField(idx, 'price', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>묶음 수량</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="numeric"
                  placeholder="1"
                  value={p.count}
                  onChange={(e) => setField(idx, 'count', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>

            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>용량 / 수량</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="decimal"
                  placeholder="0"
                  value={p.amount}
                  onChange={(e) => setField(idx, 'amount', e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>단위</label>
                <div className={s.selectWrap}>
                  <select className={s.select} value={p.unit} onChange={(e) => setField(idx, 'unit', e.target.value as Unit)}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <span className={s.selectArrow}>▼</span>
                </div>
              </div>
            </div>

            <div className={s.dealRow}>
              <div className={s.field}>
                <label className={s.fieldLabel}>덤 / 행사</label>
                <div className={s.selectWrap}>
                  <select className={s.select} value={p.deal} onChange={(e) => setField(idx, 'deal', e.target.value as Deal)}>
                    <option value="none">없음</option>
                    <option value="plus">+용량 직접 입력</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                  </select>
                  <span className={s.selectArrow}>▼</span>
                </div>
              </div>
              {p.deal === 'plus' && (
                <>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>덤 용량</label>
                    <input
                      className={`${s.input} ${s.inputRight}`}
                      inputMode="decimal"
                      placeholder="0"
                      value={p.dealAmount}
                      onChange={(e) => setField(idx, 'dealAmount', e.target.value.replace(/[^0-9.]/g, ''))}
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>덤 단위</label>
                    <div className={s.selectWrap}>
                      <select className={s.select} value={p.dealUnit} onChange={(e) => setField(idx, 'dealUnit', e.target.value as Unit)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <span className={s.selectArrow}>▼</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={s.row3}>
              <div className={s.field}>
                <label className={s.fieldLabel}>즉시할인 (원)</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="numeric"
                  placeholder="0"
                  value={p.instantDiscount ? fmt(num(p.instantDiscount)) : ''}
                  onChange={(e) => setField(idx, 'instantDiscount', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>쿠폰 할인 (%)</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="decimal"
                  placeholder="0"
                  value={p.couponPercent}
                  onChange={(e) => setField(idx, 'couponPercent', e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>배송비 (원)</label>
                <input
                  className={`${s.input} ${s.inputRight}`}
                  inputMode="numeric"
                  placeholder="0"
                  value={p.shippingFee ? fmt(num(p.shippingFee)) : ''}
                  onChange={(e) => setField(idx, 'shippingFee', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {products.length < 3 && (
        <button type="button" className={s.addBtn} onClick={addProduct}>
          + 상품 추가 ({products.length}/3)
        </button>
      )}

      {/* 비교 기준 단위 */}
      <div className={s.card}>
        <span className={s.cardLabel}>비교 기준 단위</span>
        <div className={s.basePills}>
          {BASES.map((b) => {
            const hasMatchingUnit = products.some((p) => num(p.amount) > 0 && UNIT_KIND[p.unit] === b.kind)
            const disabled = !hasMatchingUnit
            return (
              <button
                key={b.id}
                type="button"
                disabled={disabled}
                className={`${s.basePill} ${baseId === b.id ? s.basePillActive : ''}`}
                onClick={() => setBaseId(b.id)}
              >
                {b.label}
              </button>
            )
          })}
        </div>
        <div className={s.sameMoneyRow}>
          <input
            id="sameMoney"
            type="checkbox"
            className={s.sameMoneyCheck}
            checked={sameMoney}
            onChange={(e) => setSameMoney(e.target.checked)}
          />
          <label htmlFor="sameMoney" className={s.sameMoneyLabel}>
            같은 금액으로 살 수 있는 총량도 함께 보기
          </label>
          {sameMoney && (
            <>
              <input
                className={s.sameMoneyInput}
                inputMode="numeric"
                value={sameMoneyAmount ? fmt(num(sameMoneyAmount)) : ''}
                onChange={(e) => setSameMoneyAmount(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>원</span>
            </>
          )}
        </div>
      </div>

      {/* 결과 */}
      {validCalcs.length < 2 ? (
        <div className={s.empty}>비교할 상품 2개 이상의 가격·용량을 입력하고 단위 종류를 맞춰주세요.</div>
      ) : (
        <>
          {winner && (
            <div className={s.hero}>
              <p className={s.heroLead}>가장 저렴한 선택</p>
              <h2 className={s.heroName}>
                {winner.product.name || `${winner.product.id} 상품`}
              </h2>
              <p className={s.heroMeta}>
                {base.label} <strong style={{ color: 'var(--accent)' }}>{fmt1(winner.unitPrice)}원</strong>
                {diff && diff.diffPrice > 0 && (
                  <> · 2위 대비 {fmt1(diff.diffPrice)}원 / {fmt1(diff.diffPercent)}% 저렴</>
                )}
              </p>
            </div>
          )}

          <div className={s.card}>
            <div className={s.cardTitle}>📊 단가 비교 표 ({base.label})</div>
            <div className={s.tableWrap}>
              <table className={s.compareTable}>
                <thead>
                  <tr>
                    <th>상품</th>
                    <th className={s.numCol}>실제 가격</th>
                    <th className={s.numCol}>총 용량/수량</th>
                    <th className={s.numCol}>단가</th>
                    <th className={s.numCol}>순위</th>
                  </tr>
                </thead>
                <tbody>
                  {validCalcs.map((c, i) => {
                    const rank = rankMap.get(c.product.id)!
                    const baseUnit = BASE_UNIT_BY_KIND[UNIT_KIND[c.product.unit]]
                    const applied = buildApplied(c.product, c.totalAmount, c.finalPrice)
                    const origIdx = products.findIndex((p) => p.id === c.product.id)
                    return (
                      <tr key={i} className={rank === 1 ? s.winnerRow : ''}>
                        <td>
                          <div className={s.productLabel}>
                            <span className={`${s.productTag} ${TAG_CLS[origIdx] || ''}`}>{c.product.id}</span>
                            <span>{c.product.name || '-'}</span>
                          </div>
                          {applied.length > 0 && (
                            <div className={s.badgeRow}>
                              {c.product.deal === '1+1' && <span className={`${s.badge} ${s.badgeOnePlusOne}`}>1+1</span>}
                              {c.product.deal === '2+1' && <span className={`${s.badge} ${s.badgeTwoPlusOne}`}>2+1</span>}
                              {c.product.deal === '3+1' && <span className={`${s.badge} ${s.badgeThreePlusOne}`}>3+1</span>}
                              {c.product.deal === 'plus' && num(c.product.dealAmount) > 0 && (
                                <span className={`${s.badge} ${s.badgePlus}`}>+{c.product.dealAmount}{c.product.dealUnit}</span>
                              )}
                              {num(c.product.couponPercent) > 0 && (
                                <span className={`${s.badge} ${s.badgeCoupon}`}>쿠폰 {c.product.couponPercent}%</span>
                              )}
                              {num(c.product.instantDiscount) > 0 && (
                                <span className={`${s.badge} ${s.badgeDiscount}`}>-{fmt(num(c.product.instantDiscount))}원</span>
                              )}
                              {num(c.product.shippingFee) > 0 && (
                                <span className={`${s.badge} ${s.badgeShipping}`}>배송 +{fmt(num(c.product.shippingFee))}원</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className={s.num}>{fmt(Math.round(c.finalPrice))}원</td>
                        <td className={s.num}>{fmt2(c.totalAmount)}{baseUnit}</td>
                        <td className={`${s.num} ${s.unitPriceCell}`}>{fmt1(c.unitPrice)}원</td>
                        <td className={s.num}>
                          {rank}위{rank === 1 && <span className={s.trophy}>🏆</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {diff && (
            <div className={s.diffCard}>
              <div className={s.cardTitle}>🔍 차이 분석</div>
              <div className={s.diffGrid}>
                <div className={s.diffBox}>
                  <div className={s.diffLabel}>단가 차이 ({base.label})</div>
                  <div className={`${s.diffValue} ${
                    diff.diffPercent >= 10 ? s.diffStrong : diff.diffPercent >= 5 ? s.diffMedium : s.diffWeak
                  }`}>
                    {fmt1(diff.diffPrice)}원 ({fmt1(diff.diffPercent)}%)
                  </div>
                </div>
                <div className={s.diffBox}>
                  <div className={s.diffLabel}>총 용량 차이</div>
                  <div className={s.diffValue}>
                    {fmt(Math.abs(diff.diffAmount))}{BASE_UNIT_BY_KIND[UNIT_KIND[winner!.product.unit]]}
                  </div>
                </div>
                {sameMoney && (
                  <>
                    <div className={s.diffBox}>
                      <div className={s.diffLabel}>{winner!.product.id} {fmt(num(sameMoneyAmount))}원으로</div>
                      <div className={s.diffValue}>
                        {fmt(Math.round(diff.canBuyWinner))}{BASE_UNIT_BY_KIND[UNIT_KIND[winner!.product.unit]]}
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

          {/* 적용 내역 */}
          {validCalcs.some((c) => hasAnyDeal(c.product)) && (
            <div className={s.appliedCard}>
              <div className={s.appliedHead}>행사·할인 반영 내역</div>
              {validCalcs.map((c) => {
                const applied = buildApplied(c.product, c.totalAmount, c.finalPrice)
                if (applied.length === 0) return null
                return (
                  <div key={c.product.id} style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                      {c.product.id} {c.product.name || ''}
                    </p>
                    <ul className={s.appliedList}>
                      {applied.map((a, i) => <li key={i} className={s.appliedItem}>{a}</li>)}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

          {comment && (
            <div className={s.commentCard}>{comment}</div>
          )}

          <div className={s.actionRow}>
            <button
              type="button"
              className={`${s.shareBtn} ${copied ? s.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✅ 복사됨!' : '비교 결과 복사하기'}
            </button>
            <button type="button" className={s.resetBtn} onClick={resetAll}>초기화</button>
          </div>
        </>
      )}

      {valid.some((v) => v && 'mismatched' in v && v.mismatched) && (
        <div className={s.errorBox}>
          선택한 비교 기준({base.label})과 단위가 맞지 않는 상품이 있습니다. 같은 종류의 단위(부피/무게/개수)끼리만 비교할 수 있습니다.
        </div>
      )}
    </div>
  )
}
