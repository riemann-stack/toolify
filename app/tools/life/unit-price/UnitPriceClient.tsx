'use client'

import { useState } from 'react'
import s from './unit-price.module.css'
import {
  UNITS, UNIT_KIND, UNIT_FACTOR, BASE_UNIT_BY_KIND, BASES,
  CONSUMPTION_OPTIONS,
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
  // 고급 옵션 — 소비 가능량만 유지
  consumption: number   // 100|75|50 + 직접입력
  consumptionCustom: string  // 직접입력 시 사용
  // UI
  advancedOpen: boolean
}

const emptyProduct = (id: string): Product => ({
  id, name: '', price: '', amount: '', unit: 'ml', count: '1',
  consumption: 100, consumptionCustom: '', advancedOpen: false,
})

const LABELS = ['A', 'B', 'C']
const CARD_CLS = [s.cardA, s.cardB, s.cardC]
const TAG_CLS = [s.tagA, s.tagB, s.tagC]

const toBase = (value: number, unit: Unit): number => value * UNIT_FACTOR[unit]

function calcTotalAmount(p: Product): number {
  // 개수는 valid 단계에서 1 이상으로 검증됨 — Math.max로 0/빈값을 몰래 1로 만들지 않음
  return toBase(num(p.amount), p.unit) * num(p.count)
}

function calcFinalPrice(p: Product): number {
  // 가격 = 그대로 (할인·쿠폰·배송비 제거)
  return Math.max(0, num(p.price))
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

  // 비교 기준은 렌더 중 파생 (effect+setState 지양). baseId는 수동 선택값.
  // 자동 추천이 켜져 있거나, 수동 기준이 입력된 어떤 상품 단위와도 안 맞으면 → 상품에서 추천 기준 파생.
  // 이렇게 해야 g/kg/개로 시작해 기본값(ml)과 안 맞아도 멈추지 않는다.
  const effectiveBaseId: Base['id'] = (() => {
    const usable = products.filter(p => num(p.price) > 0 && num(p.amount) > 0 && num(p.count) >= 1)
    if (usable.length === 0) return baseId
    const kindsPresent = new Set(usable.map(p => UNIT_KIND[p.unit]))
    const manual = BASES.find(b => b.id === baseId)!
    if (!autoBase && kindsPresent.has(manual.kind)) return baseId
    const first = usable[0]
    const totalBase = toBase(num(first.amount), first.unit) * num(first.count)
    return recommendBase(UNIT_KIND[first.unit], totalBase)
  })()
  const base = BASES.find(b => b.id === effectiveBaseId)!

  // (React Compiler가 자동 메모이즈 — 수동 useMemo 불필요)
  const valid = products.map(p => {
    const price = num(p.price); const amount = num(p.amount); const count = num(p.count)
    if (price <= 0 || amount <= 0 || count < 1) return null
    if (UNIT_KIND[p.unit] !== base.kind) return { ...p, _mismatched: true as const }
    const total = calcTotalAmount(p)
    const final = calcFinalPrice(p)
    const unitPrice = (final / total) * base.factor
    const effectiveTotal = total * (p.consumption / 100)
    const effectiveUnitPrice = effectiveTotal > 0 ? (final / effectiveTotal) * base.factor : 0
    return { product: p, totalAmount: total, finalPrice: final, unitPrice, effectiveUnitPrice, mismatched: false }
  })

  type Calc = {
    product: Product; totalAmount: number; finalPrice: number;
    unitPrice: number; effectiveUnitPrice: number; mismatched: false
  }
  const validCalcs: Calc[] = valid.filter(
    (v): v is Calc => !!v && 'unitPrice' in v && v.mismatched === false
  )

  // 랭킹 기준 = 실질 단가(소비 가능량 반영). 모두 100%면 표시 단가와 동일.
  // winner를 ranked[0]로 통일해 동률 시 히어로/트로피가 어긋나지 않게 함.
  const ranked = [...validCalcs].sort((a, b) => a.effectiveUnitPrice - b.effectiveUnitPrice)
  const winner = ranked.length > 0 ? ranked[0] : null
  const rankMap = new Map(ranked.map((c, i) => [c.product.id, i + 1]))
  const anyPartial = validCalcs.some(c => c.product.consumption < 100)

  // 다른 단위 계열 감지
  const hasMultipleKinds = new Set(
    products.filter(p => num(p.amount) > 0).map(p => UNIT_KIND[p.unit])
  ).size > 1

  const diff = (() => {
    if (!winner || ranked.length < 2) return null
    const second = ranked[1]
    // 가격 차이는 랭킹 기준(실질 단가)으로
    const diffPrice = second.effectiveUnitPrice - winner.effectiveUnitPrice
    const diffPercent = second.effectiveUnitPrice > 0 ? (diffPrice / second.effectiveUnitPrice) * 100 : 0
    // '같은 금액으로 살 수 있는 양'은 실제 구매 기준(표시 단가)
    const sameAmount = num(sameMoneyAmount)
    const canBuyWinner = winner.unitPrice > 0 ? (sameAmount / winner.unitPrice) * base.factor : 0
    const canBuySecond = second.unitPrice > 0 ? (sameAmount / second.unitPrice) * base.factor : 0
    return { second, diffPrice, diffPercent, canBuyWinner, canBuySecond }
  })()

  // 표시 단위 헬퍼 — 개수 계열(개·매·장)은 상품의 실제 단위를 유지, 부피·무게는 기준 단위(ml·g)
  const dispUnit = (p: Product) => UNIT_KIND[p.unit] === 'count' ? p.unit : BASE_UNIT_BY_KIND[UNIT_KIND[p.unit]]
  // 비교 기준 라벨 — 유효 상품이 모두 같은 개수 단위면 "1매당" 등으로 표시
  const allSameCountUnit = validCalcs.length > 0
    && validCalcs.every(c => UNIT_KIND[c.product.unit] === 'count')
    && new Set(validCalcs.map(c => c.product.unit)).size === 1
  const baseLabelDisplay = allSameCountUnit ? `1${validCalcs[0].product.unit}당` : base.label
  const baseUnitLabel = baseLabelDisplay.replace('당', '')

  const handleCopy = async () => {
    if (!winner || !diff) return
    const lines = ['── 단가 비교 결과 ──']
    for (const c of validCalcs) {
      const name = c.product.name || `${c.product.id} 상품`
      const u = dispUnit(c.product)
      const consNote = c.product.consumption < 100 ? ` ·${c.product.consumption}% 사용` : ''
      lines.push(`${c.product.id} ${name}: ${fmt1(c.effectiveUnitPrice)}원/${baseUnitLabel} (${fmt(c.totalAmount)}${u}, ${fmt(c.finalPrice)}원${consNote})`)
    }
    const wn = winner.product.name || `${winner.product.id} 상품`
    lines.push(`→ ${wn}이(가) ${baseLabelDisplay} ${fmt1(diff.diffPrice)}원 / ${fmt1(diff.diffPercent)}% 저렴${anyPartial ? ' (사용량 반영 실질 기준)' : ''}`)
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
        <div className={`${s.heroResult} ${s.heroSticky}`} role="status" aria-live="polite">
          <div className={s.heroLeft}>
            <p className={s.heroLead}><span aria-hidden="true">🏆 </span>{anyPartial ? '실질 가성비 1위' : '가장 저렴'} ({baseLabelDisplay})</p>
            <h2 className={s.heroName}>{winner.product.name || `${winner.product.id} 상품`}</h2>
          </div>
          <div className={s.heroRight}>
            <div className={s.heroPrice}>{fmt1(winner.effectiveUnitPrice)}<span className={s.heroPriceUnit}>원</span></div>
            {diff && diff.diffPercent > 0 && (
              <div className={s.heroDiff}>2위 대비 -{fmt1(diff.diffPercent)}%</div>
            )}
          </div>
        </div>
      ) : (
        <div className={s.empty}>↓ 상품 2개 이상의 가격·용량을 입력하면 즉시 비교됩니다.</div>
      )}

      {/* ── 상품 입력 (모바일도 2열) ── */}
      <div className={s.productsGrid}>
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
      </div>

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
                aria-pressed={base.id === b.id}
                className={`${s.basePill} ${base.id === b.id ? s.basePillActive : ''}`}
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
                aria-label="비교 금액 (원)"
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
          <div className={s.cardTitle}>📊 단가 비교 ({baseLabelDisplay}{anyPartial ? ' · 실질' : ''})</div>
          <div className={s.tableWrap}>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th scope="col">상품</th>
                  <th scope="col" className={s.numCol}>실결제</th>
                  <th scope="col" className={s.numCol}>총 용량</th>
                  <th scope="col" className={s.numCol}>단가</th>
                </tr>
              </thead>
              <tbody>
                {validCalcs.map((c, i) => {
                  const rank = rankMap.get(c.product.id)!
                  const baseUnit = dispUnit(c.product)
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
                      <td className={`${s.num} ${s.unitPriceCell}`}>
                        {fmt1(c.effectiveUnitPrice)}원
                        {hasConsumption && <span className={s.stickerHint}>표시 {fmt1(c.unitPrice)}</span>}
                      </td>
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
                    실질 <strong style={{ color: '#EA580C' }}>{fmt1(c.effectiveUnitPrice)}원/{baseUnitLabel}</strong>
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
                  <div className={s.diffLabel}>{anyPartial ? '실질 단가 차이' : '단가 차이'} ({baseLabelDisplay})</div>
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
                        {fmt(Math.round(diff.canBuyWinner))}{dispUnit(winner.product)}
                      </div>
                    </div>
                    <div className={s.diffBox}>
                      <div className={s.diffLabel}>{diff.second.product.id} {fmt(num(sameMoneyAmount))}원으로</div>
                      <div className={s.diffValue}>
                        {fmt(Math.round(diff.canBuySecond))}{dispUnit(diff.second.product)}
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

  return (
    <div className={`${s.productCard} ${CARD_CLS[idx]}`}>
      {canRemove && (
        <button type="button" className={s.removeBtn} onClick={onRemove} aria-label="상품 삭제">×</button>
      )}

      <div className={s.fieldRow}>
        {/* 상품명 — 라벨이 input 앞쪽에 inline 으로 붙어 겹침 방지 */}
        <div className={s.nameRow}>
          <span className={`${s.nameBadge} ${CARD_CLS[idx]}`} aria-hidden="true">{LABELS[idx]}</span>
          <input className={`${s.input} ${s.nameInput}`}
            placeholder="상품명 (선택)"
            aria-label={`${LABELS[idx]} 상품명`}
            value={p.name}
            onChange={e => onChange('name', e.target.value)} />
        </div>

        {/* 가격 */}
        <div className={s.field}>
          <label className={s.fieldLabel}>가격 (원) *</label>
          <input className={`${s.input} ${s.inputBig} ${s.inputRight}`}
            type="text" inputMode="numeric"
            placeholder="0"
            aria-label={`${LABELS[idx]} 가격 (원)`}
            value={p.price ? formatPriceInput(p.price) : ''}
            onChange={e => onChange('price', e.target.value.replace(/[^0-9]/g, ''))} />
        </div>

        {/* 용량 + 단위 */}
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel}>용량 *</label>
            <input className={`${s.input} ${s.inputBig} ${s.inputRight}`}
              type="text" inputMode="decimal"
              placeholder="0"
              aria-label={`${LABELS[idx]} 용량`}
              value={p.amount}
              onChange={e => onChange('amount', sanitizeDecimal(e.target.value))} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>단위 *</label>
            <div className={s.selectWrap}>
              <select className={`${s.select} ${s.inputBig}`} value={p.unit}
                aria-label={`${LABELS[idx]} 단위`}
                onChange={e => onChange('unit', e.target.value as Unit)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <span className={s.selectArrow} aria-hidden="true">▼</span>
            </div>
          </div>
        </div>

        {/* 개수 (큰 +/-) */}
        <div className={s.field}>
          <label className={s.fieldLabel}>개수 * <span className={s.fieldHint}>1+1 → 2 · 2+1 → 3</span></label>
          <div className={s.countRow}>
            <button type="button" className={s.countBtn} onClick={decCount} aria-label="개수 감소">−</button>
            <input className={`${s.input} ${s.inputBig} ${s.countInput}`}
              type="text" inputMode="numeric"
              aria-label={`${LABELS[idx]} 개수`}
              value={p.count}
              onChange={e => onChange('count', e.target.value.replace(/[^0-9]/g, ''))} />
            <button type="button" className={s.countBtn} onClick={incCount} aria-label="개수 증가">+</button>
          </div>
        </div>

        {/* 고급 옵션 — 소비 가능량만 (아코디언) */}
        <details className={s.advancedDetails} open={p.advancedOpen}
          onToggle={e => onChange('advancedOpen', (e.target as HTMLDetailsElement).open)}>
          <summary className={s.advancedSummary}>
            ⚙️ 실제 소비 가능량
          </summary>
          <div className={s.advancedBody}>
            <div className={s.consumptionPills}>
              {CONSUMPTION_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  aria-pressed={p.consumption === opt.value && !p.consumptionCustom}
                  aria-label={`소비 가능량 ${opt.label}`}
                  className={`${s.consumptionPill} ${p.consumption === opt.value && !p.consumptionCustom ? s.consumptionPillActive : ''}`}
                  onClick={() => { onChange('consumption', opt.value); onChange('consumptionCustom', '') }}>
                  {opt.label}
                </button>
              ))}
              <div className={`${s.consumptionCustomWrap} ${p.consumptionCustom ? s.consumptionPillActive : ''}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={s.consumptionCustomInput}
                  placeholder="직접입력"
                  aria-label="소비 가능량 직접입력 (%)"
                  value={p.consumptionCustom}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3)
                    onChange('consumptionCustom', v)
                    const n = parseInt(v, 10)
                    if (Number.isFinite(n) && n > 0 && n <= 100) {
                      onChange('consumption', n)
                    }
                  }}
                />
                <span className={s.consumptionCustomUnit}>%</span>
              </div>
            </div>
            <p className={s.countHint}>
              💡 매일 사용(생수·우유) 100% · 자주(샴푸·세제) 75% · 가끔(소스·조미료) 50%
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
