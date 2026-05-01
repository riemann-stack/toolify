'use client'

import { useState, useMemo } from 'react'
import styles from './vat.module.css'
import {
  SIMPLIFIED_VAT_RATES,
  PAYMENT_FEES,
  calcVAT,
  calcQuote,
  compareExclusiveInclusive,
  reverseCalcGrossAmount,
  buildScenarioTable,
  compareGeneralVsSimplified,
  formatKRW,
  formatEok,
  parseAmount,
  type VatMode,
  type RoundUnit,
  type QuoteItem,
} from './vatUtils'

type TabId = 'main' | 'quote' | 'net' | 'invoice' | 'gs'

const QUICK_AMOUNTS = [
  { label: '11,000원', amount: 11_000, mode: 'remove' as VatMode },
  { label: '110,000원', amount: 110_000, mode: 'remove' as VatMode },
  { label: '330,000원', amount: 330_000, mode: 'remove' as VatMode },
  { label: '1,100,000원', amount: 1_100_000, mode: 'remove' as VatMode },
]

const NET_PRESETS = [50, 100, 200, 300, 500, 1000]   // 만원

export default function VatClient() {
  const [tab, setTab] = useState<TabId>('main')

  /* ── 탭1 (기존 보존) ── */
  const [mode, setMode] = useState<VatMode>('add')
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState('10')
  const [trunc, setTrunc] = useState<RoundUnit>('none')

  /* ── 탭2 견적서 ── */
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { name: '디자인 용역', quantity: 1, unitPrice: 1_000_000, isTaxable: true,  discount: 0 },
    { name: '인쇄 비용',   quantity: 1, unitPrice:   200_000, isTaxable: true,  discount: 0 },
    { name: '배송비 (면세)', quantity: 1, unitPrice:    5_000, isTaxable: false, discount: 0 },
  ])
  const [exclVsInclAmount, setExclVsInclAmount] = useState('1000000')

  /* ── 탭3 실입금 역산 ── */
  const [targetNetMan, setTargetNetMan] = useState('100')   // 만원
  const [bizType, setBizType] = useState<'biz-exc' | 'biz-inc' | 'freelancer'>('biz-exc')
  const [platformId, setPlatformId] = useState('direct')
  const [customPlatformFee, setCustomPlatformFee] = useState('5')

  /* ── 탭4 세금계산서 ── */
  const [invoiceDate,    setInvoiceDate]    = useState(() => new Date().toISOString().slice(0, 10))
  const [invoiceClient,  setInvoiceClient]  = useState('')
  const [invoiceProvider, setInvoiceProvider] = useState('')
  const [invoiceTrunc, setInvoiceTrunc] = useState<RoundUnit>('none')

  /* ── 탭5 일반 vs 간이 ── */
  const [annualRevenueMan, setAnnualRevenueMan] = useState('8000')   // 만원
  const [industryId, setIndustryId] = useState('food')
  const [purchaseAmountMan, setPurchaseAmountMan] = useState('4000') // 만원
  const [vatPurchaseMan, setVatPurchaseMan] = useState('400')        // 만원

  /* ── 탭1 결과 ── */
  const mainResult = useMemo(() => {
    const a = parseAmount(amount)
    const r = parseFloat(rate) / 100
    if (!a || a <= 0 || isNaN(r)) return null
    return calcVAT({ amount: a, mode, rate: r, rounding: trunc })
  }, [amount, mode, rate, trunc])

  /* ── 탭2 결과 ── */
  const quoteResult = useMemo(() => calcQuote(quoteItems, 0.10), [quoteItems])
  const exclVsIncl = useMemo(() => {
    const a = parseAmount(exclVsInclAmount)
    if (a <= 0) return null
    return compareExclusiveInclusive(a, 0.10)
  }, [exclVsInclAmount])

  /* ── 탭3 결과 ── */
  const platformFee = PAYMENT_FEES.find(f => f.id === platformId) ?? PAYMENT_FEES[0]
  const platformRate = platformId === 'custom' ? parseAmount(customPlatformFee) : platformFee.rate * 100

  const netResult = useMemo(() => {
    const targetNet = parseAmount(targetNetMan) * 10_000
    if (targetNet <= 0) return null
    return reverseCalcGrossAmount({
      targetNet,
      isVatExclusive: bizType === 'biz-exc',
      isFreelancer: bizType === 'freelancer',
      platformFeeRate: platformRate,
    })
  }, [targetNetMan, bizType, platformRate])

  const scenarioTable = useMemo(() => {
    const targetNet = parseAmount(targetNetMan) * 10_000
    if (targetNet <= 0) return []
    return buildScenarioTable(targetNet)
  }, [targetNetMan])

  /* ── 탭4 (탭2 견적 사용) ── */
  const invoiceQuote = useMemo(() => {
    // 탭4는 탭2의 quoteItems 재사용 + 절사 옵션 적용
    const r = calcQuote(quoteItems, 0.10)
    // 절사 적용
    if (invoiceTrunc === 'none') return r
    const unit = parseInt(invoiceTrunc, 10)
    const totalVat = Math.floor(r.totalVat / unit) * unit
    return {
      ...r,
      totalVat,
      grandTotal: r.totalSupply + totalVat,
    }
  }, [quoteItems, invoiceTrunc])

  /* ── 탭5 ── */
  const gsResult = useMemo(() => {
    const rev = parseAmount(annualRevenueMan) * 10_000
    const purchase = parseAmount(purchaseAmountMan) * 10_000
    const vatP = parseAmount(vatPurchaseMan) * 10_000
    if (rev <= 0) return null
    return compareGeneralVsSimplified({
      annualRevenue: rev,
      industryId,
      purchaseAmount: purchase,
      vatPurchase: vatP,
    })
  }, [annualRevenueMan, industryId, purchaseAmountMan, vatPurchaseMan])

  /* ── 견적 행 조작 ── */
  const updateQuoteItem = (idx: number, patch: Partial<QuoteItem>) => {
    const next = [...quoteItems]
    next[idx] = { ...next[idx], ...patch }
    setQuoteItems(next)
  }
  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { name: '', quantity: 1, unitPrice: 0, isTaxable: true, discount: 0 }])
  }
  const removeQuoteItem = (idx: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx))
  }

  /* ── 복사 ── */
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  /* ──────────── RENDER ──────────── */
  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>ⓘ 일반 정보 제공 도구입니다.</strong> 본 부가세 계산기는 참고용 시뮬레이션이며, 세무 자문·신고 도구가 아닙니다.
        정확한 부가세 신고는 <strong>홈택스(hometax.go.kr)</strong> 또는 세무사 상담을 권장합니다.
        문의: 국세청 126 / 한국세무사회 무료 상담 070-5008-1234.
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {[
          { id: 'main',    label: '빠른 계산',   cls: styles.tabActive },
          { id: 'quote',   label: '견적서',      cls: styles.tabActiveQuote },
          { id: 'net',     label: '실입금 역산', cls: styles.tabActiveNet },
          { id: 'invoice', label: '세금계산서',  cls: styles.tabActiveInvoice },
          { id: 'gs',      label: '일반 vs 간이', cls: styles.tabActiveCompare },
        ].map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* ──────────── TAB 1: 빠른 계산 (기존 유지) ──────────── */}
      {tab === 'main' && (
        <>
          {/* 모드 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>계산 방식</div>
            <div className={styles.modeGrid}>
              {[
                { v: 'add' as VatMode,    label: '부가세 추가',   desc: '공급가액 → 합계' },
                { v: 'remove' as VatMode, label: '부가세 역산',   desc: '합계 → 공급가액' },
                { v: 'calc' as VatMode,   label: '부가세만 계산', desc: '공급가액 × 세율' },
              ].map(m => (
                <button key={m.v}
                  className={`${styles.modeBtn} ${mode === m.v ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode(m.v)}>
                  <span className={styles.modeBtnLabel}>{m.label}</span>
                  <span className={styles.modeBtnDesc}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>{mode === 'remove' ? '공급대가 (합계)' : '공급가액'}</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="100000" value={amount}
                  onChange={e => setAmount(e.target.value)} />
                <span className={styles.unit}>원</span>
              </div>
              <div className={styles.chips}>
                {QUICK_AMOUNTS.map(q => (
                  <button key={q.amount}
                    className={styles.chip}
                    onClick={() => { setAmount(String(q.amount)); setMode(q.mode) }}
                  >{q.label}</button>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLabel}>부가세율</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
                  placeholder="10" value={rate}
                  onChange={e => setRate(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>
              <div className={styles.chips}>
                {['10', '0'].map(r => (
                  <button key={r}
                    className={`${styles.chip} ${rate === r ? styles.chipActive : ''}`}
                    onClick={() => setRate(r)}>
                    {r === '0' ? '면세 (0%)' : `일반 (${r}%)`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 절사 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>부가세 절사 옵션</div>
            <div className={styles.optionRow4}>
              {[
                { v: 'none' as RoundUnit, label: '절사 없음' },
                { v: '10' as RoundUnit,   label: '10원 단위' },
                { v: '100' as RoundUnit,  label: '100원 단위' },
                { v: '1000' as RoundUnit, label: '1,000원 단위' },
              ].map(opt => (
                <button key={opt.v}
                  className={`${styles.optionBtn} ${trunc === opt.v ? styles.optionActive : ''}`}
                  onClick={() => setTrunc(opt.v)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <p className={styles.cardLabelHint} style={{ marginTop: 8 }}>
              세금계산서 발행 시 부가세는 원 단위 이하를 절사(버림)하는 것이 일반적입니다.
            </p>
          </div>

          {mainResult ? (
            <>
              <div className={`${styles.hero} ${styles.heroAccent}`}>
                <div className={styles.heroLabel}>합계 금액 (공급대가)</div>
                <div className={`${styles.heroNum} ${styles.heroNumAccent}`}>{formatKRW(mainResult.total)}원</div>
                <div className={styles.heroSub}>
                  공급가액 {formatKRW(mainResult.supplyAmount)}원 + 부가세 {formatKRW(mainResult.vat)}원
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>공급가액</div>
                    <div className={styles.resultValue}>{formatKRW(mainResult.supplyAmount)}원</div>
                  </div>
                  <div className={styles.resultItem}>
                    <div className={styles.resultLabel}>부가세 ({rate}%)</div>
                    <div className={`${styles.resultValue} ${styles.vatValue}`}>{formatKRW(mainResult.vat)}원</div>
                  </div>
                  <div className={`${styles.resultItem} ${styles.resultGridFull}`}>
                    <div className={styles.resultLabel}>합계 (공급대가)</div>
                    <div className={`${styles.resultValue} ${styles.totalValue}`}>{formatKRW(mainResult.total)}원</div>
                  </div>
                </div>
              </div>

              {mode === 'remove' && (
                <div className={styles.formulaBox}>
                  <p className={styles.formulaTitle}>📐 역산 공식</p>
                  <p className={styles.formulaLine}>
                    공급가액 = {formatKRW(mainResult.total)} ÷ {(1 + parseFloat(rate)/100).toFixed(2)} = <strong>{formatKRW(mainResult.supplyAmount)}원</strong>
                  </p>
                  <p className={styles.formulaLine}>
                    부가세 = {formatKRW(mainResult.total)} − {formatKRW(mainResult.supplyAmount)} = <strong>{formatKRW(mainResult.vat)}원</strong>
                  </p>
                </div>
              )}

              <button className={`${styles.copyBtn} ${copied === 'main' ? styles.copied : ''}`}
                onClick={() => copy(
                  `공급가액: ${formatKRW(mainResult.supplyAmount)}원\n부가세 (${rate}%): ${formatKRW(mainResult.vat)}원\n합계: ${formatKRW(mainResult.total)}원`,
                  'main',
                )}>
                {copied === 'main' ? '✓ 복사 완료' : '📋 결과 복사'}
              </button>
            </>
          ) : (
            <div className={styles.empty}>금액을 입력하면 부가세가 계산됩니다</div>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 견적서 ──────────── */}
      {tab === 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>품목 목록 ({quoteItems.length})</div>
            {quoteItems.map((item, idx) => (
              <div key={idx} className={styles.quoteItemRow}>
                <input className={styles.textInput} type="text" placeholder="품목명"
                  value={item.name} onChange={e => updateQuoteItem(idx, { name: e.target.value })} />
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="수량" value={item.quantity || ''}
                  onChange={e => updateQuoteItem(idx, { quantity: parseAmount(e.target.value) })} />
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="단가 (원)" value={item.unitPrice || ''}
                  onChange={e => updateQuoteItem(idx, { unitPrice: parseAmount(e.target.value) })} />
                <button
                  className={`${styles.quoteItemTaxBtn} ${item.isTaxable ? styles.quoteItemTaxBtnTaxable : styles.quoteItemTaxBtnExempt}`}
                  onClick={() => updateQuoteItem(idx, { isTaxable: !item.isTaxable })}
                >{item.isTaxable ? '과세' : '면세'}</button>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="할인" value={item.discount || ''}
                  onChange={e => updateQuoteItem(idx, { discount: parseAmount(e.target.value) })} />
                <button className={styles.quoteItemRowDelete}
                  onClick={() => removeQuoteItem(idx)}
                  disabled={quoteItems.length === 1}
                  title="삭제">×</button>
              </div>
            ))}
            <button className={styles.quoteAddBtn} onClick={addQuoteItem}>+ 품목 추가</button>
          </div>

          {/* 견적서 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>견적서 합계</div>
            <div className={styles.quoteTableWrap}>
              <table className={styles.quoteTable}>
                <thead>
                  <tr>
                    <th>품목</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>공급가액</th>
                    <th>부가세</th>
                    <th>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteResult.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.name || '(품목명 없음)'}{!it.isTaxable && <span style={{ marginLeft: 6, fontSize: 10.5, color: '#3EC8FF' }}>면세</span>}</td>
                      <td>{it.quantity}</td>
                      <td>{formatKRW(it.unitPrice)}</td>
                      <td>{formatKRW(it.lineSupply)}</td>
                      <td className={styles.vatCol}>{formatKRW(it.lineVat)}</td>
                      <td className={styles.totalCol}>{formatKRW(it.lineTotal)}</td>
                    </tr>
                  ))}
                  <tr className={styles.quoteTotalRow}>
                    <td colSpan={3}>합계</td>
                    <td>{formatKRW(quoteResult.totalSupply)}</td>
                    <td className={styles.vatCol}>{formatKRW(quoteResult.totalVat)}</td>
                    <td className={styles.totalCol}>{formatKRW(quoteResult.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
              과세 공급가액 {formatKRW(quoteResult.taxableSupply)}원 + 면세 공급가액 {formatKRW(quoteResult.taxFreeSupply)}원 = 총 {formatKRW(quoteResult.totalSupply)}원
            </p>
          </div>

          <button className={`${styles.copyBtn} ${copied === 'quote' ? styles.copied : ''}`}
            onClick={() => {
              const lines = quoteResult.items.map(it =>
                `${it.name}\t${it.quantity}\t${formatKRW(it.unitPrice)}\t${formatKRW(it.lineSupply)}\t${formatKRW(it.lineVat)}\t${formatKRW(it.lineTotal)}`,
              )
              const text = `품목\t수량\t단가\t공급가액\t부가세\t합계\n${lines.join('\n')}\n합계\t\t\t${formatKRW(quoteResult.totalSupply)}\t${formatKRW(quoteResult.totalVat)}\t${formatKRW(quoteResult.grandTotal)}`
              copy(text, 'quote')
            }}>
            {copied === 'quote' ? '✓ 복사 완료' : '📋 견적서 표 복사 (탭 구분)'}
          </button>

          {/* 부가세 별도 vs 포함 비교 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>💡 부가세 별도 vs 포함 — 계약 시 차이</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                placeholder="비교할 금액 (원)" value={exclVsInclAmount}
                onChange={e => setExclVsInclAmount(e.target.value)} />
              <span className={styles.unit}>원</span>
            </div>
            <div className={styles.chips}>
              {[500_000, 1_000_000, 3_000_000, 5_000_000].map(v => (
                <button key={v}
                  className={`${styles.chip} ${parseAmount(exclVsInclAmount) === v ? styles.chipActive : ''}`}
                  onClick={() => setExclVsInclAmount(String(v))}
                >{formatEok(v)}</button>
              ))}
            </div>
          </div>

          {exclVsIncl && (
            <>
              <div className={styles.compareGrid}>
                <div className={`${styles.compareCard} ${styles.compareCardWinner}`}>
                  <div className={styles.winnerBadge}>★ 권장</div>
                  <p className={styles.compareCardTitle}>A. 부가세 별도</p>
                  <p className={styles.compareCardDesc}>&ldquo;{formatEok(exclVsIncl.amount)} 부가세 별도&rdquo;</p>
                  <p className={styles.compareCardMain} style={{ color: 'var(--accent)' }}>
                    {formatKRW(exclVsIncl.exclusive.received)}원
                  </p>
                  <p className={styles.compareCardLabel}>본인 실수입 (공급가액)</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>총 청구액</span><span>{formatKRW(exclVsIncl.exclusive.totalCharge)}원</span></div>
                  <div className={styles.compareCardRow}><span>공급가액</span><span>{formatKRW(exclVsIncl.exclusive.supply)}원</span></div>
                  <div className={styles.compareCardRow}><span>부가세 (10%)</span><span>{formatKRW(exclVsIncl.exclusive.vat)}원</span></div>
                </div>
                <div className={`${styles.compareCard} ${styles.compareCardLoser}`}>
                  <p className={styles.compareCardTitle}>B. 부가세 포함</p>
                  <p className={styles.compareCardDesc}>&ldquo;{formatEok(exclVsIncl.amount)} 부가세 포함&rdquo;</p>
                  <p className={styles.compareCardMain} style={{ color: '#FF6B6B' }}>
                    {formatKRW(exclVsIncl.inclusive.received)}원
                  </p>
                  <p className={styles.compareCardLabel}>본인 실수입 (공급가액)</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>총 청구액</span><span>{formatKRW(exclVsIncl.inclusive.totalCharge)}원</span></div>
                  <div className={styles.compareCardRow}><span>공급가액</span><span>{formatKRW(exclVsIncl.inclusive.supply)}원</span></div>
                  <div className={styles.compareCardRow}><span>부가세 (10%)</span><span>{formatKRW(exclVsIncl.inclusive.vat)}원</span></div>
                </div>
              </div>

              <div className={styles.infoBox}>
                <strong>💡 차이 {formatKRW(exclVsIncl.diff)}원.</strong> 같은 「{formatEok(exclVsIncl.amount)}」 계약이라도
                <strong>「부가세 별도」</strong>가 본인 실수입이 더 큽니다. 프리랜서·사업자는 협상 시 「부가세 별도」 명시를 권장합니다.
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 3: 실입금 역산 ──────────── */}
      {tab === 'net' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>받고 싶은 실입금</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                value={targetNetMan} onChange={e => setTargetNetMan(e.target.value)} />
              <span className={styles.unit}>만원</span>
            </div>
            <div className={styles.chips}>
              {NET_PRESETS.map(v => (
                <button key={v}
                  className={`${styles.chip} ${targetNetMan === String(v) ? styles.chipActive : ''}`}
                  onClick={() => setTargetNetMan(String(v))}
                >{v >= 1000 ? `${v/1000}천만` : `${v}만`}</button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>사업자 유형</div>
            <div className={styles.optionRow3}>
              <button className={`${styles.optionBtn} ${bizType === 'biz-exc' ? styles.optionActive : ''}`}
                onClick={() => setBizType('biz-exc')}>사업자 (부가세 별도)</button>
              <button className={`${styles.optionBtn} ${bizType === 'biz-inc' ? styles.optionActive : ''}`}
                onClick={() => setBizType('biz-inc')}>사업자 (부가세 포함)</button>
              <button className={`${styles.optionBtn} ${bizType === 'freelancer' ? styles.optionActive : ''}`}
                onClick={() => setBizType('freelancer')}>프리랜서 (3.3% 원천세)</button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>플랫폼 수수료</div>
            <div className={styles.optionRow5}>
              {PAYMENT_FEES.slice(0, 9).map(f => (
                <button key={f.id}
                  className={`${styles.optionBtn} ${platformId === f.id ? styles.optionActive : ''}`}
                  onClick={() => setPlatformId(f.id)}
                >{f.name}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>{(f.rate * 100).toFixed(1)}%</span></button>
              ))}
              <button className={`${styles.optionBtn} ${platformId === 'custom' ? styles.optionActive : ''}`}
                onClick={() => setPlatformId('custom')}>직접 입력</button>
            </div>
            {platformId === 'custom' && (
              <div className={styles.inputRow} style={{ marginTop: 10 }}>
                <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
                  value={customPlatformFee} onChange={e => setCustomPlatformFee(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>
            )}
          </div>

          {netResult && (
            <>
              <div className={`${styles.hero} ${styles.heroCyan}`}>
                <div className={styles.heroLabel}>청구해야 할 총 금액</div>
                <div className={`${styles.heroNum} ${styles.heroNumCyan}`}>
                  {formatKRW(netResult.totalCharge)}원
                </div>
                <div className={styles.heroSub}>
                  실입금 {formatEok(parseAmount(targetNetMan) * 10_000)} ·{' '}
                  {bizType === 'biz-exc' ? '부가세 별도' : bizType === 'biz-inc' ? '부가세 포함' : '프리랜서 3.3%'}{' '}
                  · {platformFee.name}{platformId === 'custom' ? ` (${customPlatformFee}%)` : ''}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>계산 단계</div>
                <div className={styles.stepTable}>
                  <div className={styles.stepRow}>
                    <span className={`${styles.stepSign} ${styles.stepSignEq}`}>=</span>
                    <span className={styles.stepLabel}>목표 실입금</span>
                    <span className={styles.stepValue}>{formatKRW(parseAmount(targetNetMan) * 10_000)}원</span>
                  </div>
                  {netResult.steps.map((s, i) => {
                    const isResult = s.label === '최종 입금'
                    return (
                      <div key={i} className={`${styles.stepRow} ${isResult ? styles.stepRowResult : ''}`}>
                        <span className={`${styles.stepSign} ${
                          s.sign === '+' ? styles.stepSignPlus :
                          s.sign === '-' ? styles.stepSignMinus :
                          styles.stepSignEq
                        }`}>{s.sign ?? ''}</span>
                        <span className={styles.stepLabel}>{s.label}</span>
                        <span className={`${styles.stepValue} ${isResult ? styles.stepValueResult : ''}`}>
                          {s.value < 0 ? `-${formatKRW(-s.value)}` : formatKRW(s.value)}원
                        </span>
                      </div>
                    )
                  })}
                </div>
                {bizType === 'biz-exc' && netResult.vat > 0 && (
                  <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
                    ※ 부가세 {formatKRW(netResult.vat)}원은 본인 돈이 아닙니다 — 신고·납부 의무 금액. 별도 계좌 보관 권장.
                  </p>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>실입금 {formatEok(parseAmount(targetNetMan) * 10_000)} 받으려면 — 시나리오</div>
                <div className={styles.scenarioTable}>
                  <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                    <span>유형</span><span>청구액</span><span>비고</span>
                  </div>
                  {scenarioTable.map((row, i) => (
                    <div key={i} className={styles.scenarioRow}>
                      <span>{row.type}</span>
                      <span>{formatKRW(row.totalCharge)}원</span>
                      <span>{row.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoBox}>
                <strong>💡 3.3% 원천세 vs 10% 부가세 — 완전히 다른 세금:</strong><br />
                <strong style={{ color: '#3EC8FF' }}>3.3% 원천세</strong>는 사업자 등록 X 프리랜서에게 발주처가 차감 후 입금 (종합소득세 신고 시 정산).
                <strong style={{ color: '#FF8C3E' }}>10% 부가세</strong>는 사업자 등록자에게 별도 청구되는 본인 돈이 아닌 신고·납부 의무 금액 (분기별·반기별 신고).
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 4: 세금계산서 ──────────── */}
      {tab === 'invoice' && (
        <>
          <div className={styles.threeCol}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>작성일자</div>
              <input className={styles.textInput} type="date"
                value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>공급자 (본인)</div>
              <input className={styles.textInput} type="text" placeholder="상호 / 대표자"
                value={invoiceProvider} onChange={e => setInvoiceProvider(e.target.value)} />
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>공급받는자 (거래처)</div>
              <input className={styles.textInput} type="text" placeholder="거래처명"
                value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>세액 절사 옵션</div>
            <div className={styles.optionRow4}>
              {[
                { v: 'none' as RoundUnit, label: '절사 없음' },
                { v: '10' as RoundUnit,   label: '10원 단위' },
                { v: '100' as RoundUnit,  label: '100원 단위' },
                { v: '1000' as RoundUnit, label: '1,000원 단위' },
              ].map(opt => (
                <button key={opt.v}
                  className={`${styles.optionBtn} ${invoiceTrunc === opt.v ? styles.optionActive : ''}`}
                  onClick={() => setInvoiceTrunc(opt.v)}>{opt.label}</button>
              ))}
            </div>
            <p className={styles.cardLabelHint} style={{ marginTop: 8 }}>
              ※ 품목은 「견적서」 탭의 입력값을 사용합니다. 「견적서」 탭에서 수정해주세요.
            </p>
          </div>

          {/* 세금계산서 카드 */}
          <div className={styles.invoiceCard}>
            <div className={styles.invoiceTitle}>세 금 계 산 서 (참고용)</div>
            <div className={styles.invoiceSubtitle}>※ 법적 효력은 홈택스 e세로 발행본만 인정됩니다</div>
            <div className={styles.invoiceHeader}>
              <div className={styles.invoiceField}>작성일자<strong>{invoiceDate}</strong></div>
              <div className={styles.invoiceField}>공급자<strong>{invoiceProvider || '— 입력 필요 —'}</strong></div>
              <div className={styles.invoiceField}>공급받는자<strong>{invoiceClient || '— 입력 필요 —'}</strong></div>
              <div className={styles.invoiceField}>품목 수<strong>{quoteItems.length}건</strong></div>
            </div>

            <table className={styles.invoiceItemTable}>
              <thead>
                <tr>
                  <th>품목명</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>공급가액</th>
                  <th>세액</th>
                </tr>
              </thead>
              <tbody>
                {invoiceQuote.items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.name || '(품목명 없음)'}{!it.isTaxable && ' (면세)'}</td>
                    <td>{it.quantity}</td>
                    <td>{formatKRW(it.unitPrice)}</td>
                    <td>{formatKRW(it.lineSupply)}</td>
                    <td>{formatKRW(it.lineVat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.invoiceTotalGrid}>
              <div className={styles.invoiceTotalCard}>
                <div className={styles.invoiceTotalLabel}>공급가액</div>
                <div className={styles.invoiceTotalValue}>{formatKRW(invoiceQuote.totalSupply)}원</div>
              </div>
              <div className={styles.invoiceTotalCard}>
                <div className={styles.invoiceTotalLabel}>세액</div>
                <div className={`${styles.invoiceTotalValue} ${styles.invoiceTotalValueOrange}`}>{formatKRW(invoiceQuote.totalVat)}원</div>
              </div>
              <div className={styles.invoiceTotalCard}>
                <div className={styles.invoiceTotalLabel}>합계금액</div>
                <div className={`${styles.invoiceTotalValue} ${styles.invoiceTotalValueAccent}`}>{formatKRW(invoiceQuote.grandTotal)}원</div>
              </div>
            </div>
          </div>

          <button className={`${styles.copyBtn} ${copied === 'invoice' ? styles.copied : ''}`}
            onClick={() => {
              const lines = invoiceQuote.items.map(it =>
                `${it.name}\t${it.quantity}\t${formatKRW(it.unitPrice)}\t${formatKRW(it.lineSupply)}\t${formatKRW(it.lineVat)}`,
              )
              const text = `[세금계산서 입력 참고]\n작성일자: ${invoiceDate}\n공급자: ${invoiceProvider}\n공급받는자: ${invoiceClient}\n\n품목명\t수량\t단가\t공급가액\t세액\n${lines.join('\n')}\n\n공급가액 합계: ${formatKRW(invoiceQuote.totalSupply)}원\n세액 합계: ${formatKRW(invoiceQuote.totalVat)}원\n합계금액: ${formatKRW(invoiceQuote.grandTotal)}원`
              copy(text, 'invoice')
            }}>
            {copied === 'invoice' ? '✓ 복사 완료' : '📋 텍스트 복사 (홈택스 입력 참고)'}
          </button>

          <div className={styles.warnBox}>
            <strong>⚠️</strong> 본 출력은 입력 참고용이며 법적 효력이 없습니다. 실제 세금계산서는
            <strong> 홈택스(hometax.go.kr) 또는 e세로</strong> 등 공식 시스템에서 발행해야 합니다.
          </div>
        </>
      )}

      {/* ──────────── TAB 5: 일반 vs 간이 ──────────── */}
      {tab === 'gs' && (
        <>
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>연 매출</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={annualRevenueMan} onChange={e => setAnnualRevenueMan(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
              <div className={styles.chips}>
                {[3000, 5000, 8000, 10000, 12000].map(v => (
                  <button key={v}
                    className={`${styles.chip} ${annualRevenueMan === String(v) ? styles.chipActive : ''}`}
                    onClick={() => setAnnualRevenueMan(String(v))}
                  >{v >= 10000 ? `${(v/10000).toFixed(v % 10000 === 0 ? 0 : 1)}억` : `${v/1000}천`}</button>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>업종</div>
              <div className={styles.optionRow}>
                {SIMPLIFIED_VAT_RATES.map(ind => (
                  <button key={ind.id}
                    className={`${styles.optionBtn} ${industryId === ind.id ? styles.optionActive : ''}`}
                    onClick={() => setIndustryId(ind.id)}
                  >{ind.name}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>실효 {(ind.effective * 100).toFixed(1)}%</span></button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>연 매입 비용</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={purchaseAmountMan} onChange={e => setPurchaseAmountMan(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>매입 부가세 (세금계산서 받은 분)</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={vatPurchaseMan} onChange={e => setVatPurchaseMan(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
              <p className={styles.cardLabelHint} style={{ marginTop: 6 }}>
                통상 매입의 10% (세금계산서 발급분만 공제). 매입 4,000만 → 매입세액 약 400만.
              </p>
            </div>
          </div>

          {gsResult && (
            <>
              <div className={`${styles.hero} ${styles.heroPurple}`}>
                <div className={styles.heroLabel}>결과</div>
                <div className={`${styles.heroNum} ${styles.heroNumPurple}`} style={{ fontSize: 'clamp(20px, 4vw, 28px)', lineHeight: 1.3 }}>
                  {gsResult.recommendation}
                </div>
                {gsResult.tone === 'simplified' && (
                  <div className={styles.heroSub}>간이과세 납부세액 {formatKRW(gsResult.simplified.vatPayable)}원 vs 일반 {formatKRW(gsResult.general.vatPayable)}원</div>
                )}
                {gsResult.tone === 'general' && (
                  <div className={styles.heroSub}>일반과세 납부세액 {formatKRW(gsResult.general.vatPayable)}원 vs 간이 {formatKRW(gsResult.simplified.vatPayable)}원</div>
                )}
              </div>

              <div className={styles.gsCompareGrid}>
                <div className={`${styles.gsCard} ${gsResult.tone === 'general' || gsResult.tone === 'unavailable' ? styles.gsCardWinner : ''}`}>
                  {(gsResult.tone === 'general' || gsResult.tone === 'unavailable') && <div className={styles.winnerBadge}>★ 추천</div>}
                  <p className={styles.compareCardTitle}>일반과세</p>
                  <p className={styles.compareCardDesc}>매출세액 - 매입세액 (전액 공제)</p>
                  <p className={styles.compareCardMain} style={{ color: 'var(--accent)' }}>
                    {formatKRW(gsResult.general.vatPayable)}원
                  </p>
                  <p className={styles.compareCardLabel}>연간 납부세액</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>매출세액 (10%)</span><span>{formatKRW(gsResult.general.vatOutput)}원</span></div>
                  <div className={styles.compareCardRow}><span>매입세액 공제</span><span>−{formatKRW(gsResult.general.vatInput)}원</span></div>
                  <div className={styles.compareCardRow}><span>세금계산서</span><span>발급 의무</span></div>
                  <div className={styles.compareCardRow}><span>신고 횟수</span><span>연 2회</span></div>
                </div>

                <div className={`${styles.gsCard} ${gsResult.tone === 'simplified' ? styles.gsCardWinner : ''} ${gsResult.tone === 'unavailable' ? styles.gsCardDisabled : ''}`}>
                  {gsResult.tone === 'simplified' && <div className={styles.winnerBadge}>★ 추천</div>}
                  <p className={styles.compareCardTitle}>간이과세</p>
                  <p className={styles.compareCardDesc}>{gsResult.simplified.industry.name} (실효 {(gsResult.simplified.effectiveRate * 100).toFixed(1)}%)</p>
                  <p className={styles.compareCardMain} style={{ color: gsResult.tone === 'unavailable' ? 'var(--muted)' : '#C485E0' }}>
                    {gsResult.simplified.available ? `${formatKRW(gsResult.simplified.vatPayable)}원` : '자격 없음'}
                  </p>
                  <p className={styles.compareCardLabel}>{gsResult.simplified.available ? '연간 납부세액' : '연 매출 1억 400만 초과'}</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>매출세액</span><span>{formatKRW(gsResult.simplified.industry.effective * parseAmount(annualRevenueMan) * 10_000)}원</span></div>
                  <div className={styles.compareCardRow}><span>매입세액 공제</span><span>부분 공제</span></div>
                  <div className={styles.compareCardRow}><span>세금계산서</span><span>4,800만↑ 의무</span></div>
                  <div className={styles.compareCardRow}><span>신고 횟수</span><span>연 1회</span></div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>자동 추천 가이드</div>
                <div className={styles.guideTable}>
                  {[
                    ['연 매출 1억 400만 초과', '일반과세 (자격 X)'],
                    ['매입 많음 (40%+) + B2B', '일반과세 (매입세액 공제 큼)'],
                    ['매입 적음 + B2C', '간이과세 (실효세율 낮음)'],
                    ['거래처 세금계산서 요구', '일반과세'],
                    ['신고 단순화 우선', '간이과세'],
                  ].map((row, i) => (
                    <div key={i} className={styles.guideRow}>
                      <span>{row[0]}</span><span>{row[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.warnBox}>
                <strong>⚠️</strong> 본 비교는 단순화된 가정입니다. 실제 결정은 정확한 업종 분류(한국표준산업분류)·의제매입세액·신용카드 매출전표 발급 세액공제·면세 사업 비중 등을 추가 고려해야 합니다.
                정확한 결정은 <strong>세무사 상담</strong> 권장.
              </div>
            </>
          )}
        </>
      )}

    </div>
  )
}
