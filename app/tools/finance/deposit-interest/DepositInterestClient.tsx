'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import ResultHero, { BreakdownTable, type BreakdownRow } from '@/components/ResultHero'
import Callout from '@/components/Callout'
import UiIcon from '@/components/UiIcon'
import {
  COMPREHENSIVE_TAX_THRESHOLD, COOP_DEPOSIT, COOP_REDUCED_RATES, TAX_FREE_SAVINGS, GENERAL_FIN_TAX_PCT,
  WITHHOLDING_PCT, LOCAL_TAX_PCT, LOCAL_INCOME_TAX_RATIO, RURAL_SPECIAL_TAX_RATIO,
  coopDepositTotalRate, coopExemptLastJoinYear, finTaxTypePct, isFinTaxType, ratePct, type FinTaxType,
} from '@/lib/krFinancialIncomeTax'
import {
  calcDeposit, commaInput, decimalInput, parseMoney, won, pct2, manwon,
  productLabel, methodLabel, isProduct, isMethod,
  MAX_DEPOSIT, MAX_MONTHLY, MAX_MONTHS, MAX_RATE_PCT,
  type Product, type Method,
} from './depositInterestUtils'
import s from './depositInterest.module.css'

const STORAGE_KEY = 'youtil:deposit-interest:inputs-v1'
const MONTH_PRESETS = [6, 12, 24, 36]
const COOP_LIMIT = COOP_DEPOSIT.limitPerPerson
const TFS_LIMIT = TAX_FREE_SAVINGS.limitPerPerson
const MAX_CUSTOM_TAX_PCT = 100
/** 조합 예탁금 저율과세 소득세율(%) — lib 일정표에서 (5·9) */
const COOP_REDUCED_PCTS = COOP_REDUCED_RATES.map(ratePct)
/** 같은 가입분의 원천징수 합계세율(%) — 소득세 + 농어촌특별세(감면세액의 10%) (5.9·9.5) */
const COOP_REDUCED_TOTAL_PCTS = COOP_REDUCED_RATES.map(r => ratePct(coopDepositTotalRate(r)))
const HIGH_FIRST_TAXED = coopExemptLastJoinYear('highIncome') + 1
const STD_LAST = coopExemptLastJoinYear('standard')
/** 소득 기준 초과 가입자의 가입 연도별 합계세율 — '2026년 가입분 5.9%, 2027년 이후 가입분 9.5%' */
const HIGH_REDUCED_TEXT = (COOP_DEPOSIT.groups.find(g => g.id === 'highIncome')?.phases ?? [])
  .filter(ph => ph.rate > 0)
  .map(ph => `${ph.joinYearFrom}년${ph.joinYearTo === ph.joinYearFrom ? '' : ' 이후'} 가입분 ${ratePct(coopDepositTotalRate(ph.rate))}%`)
  .join(', ')

const TAX_OPTIONS: { id: FinTaxType; name: string }[] = [
  { id: 'general', name: `일반과세 ${GENERAL_FIN_TAX_PCT}%` },
  { id: 'taxFree', name: '비과세종합저축 0%' },
  { id: 'coopExempt', name: `상호금융 예탁금 ${ratePct(COOP_DEPOSIT.exemptRuralTaxRate)}%` },
  { id: 'custom', name: '세율 직접 입력' },
]

const TAX_HELP: Record<FinTaxType, string> = {
  general: `은행·저축은행 예적금 기본값 — 이자소득세 ${WITHHOLDING_PCT}% + 지방소득세 ${LOCAL_TAX_PCT}%, 각각 10원 미만 절사`,
  taxFree: `65세 이상 기초연금 수급자·장애인·국가유공 상이자·기초생활수급자 등, 1인당 원금 ${manwon(TFS_LIMIT)}까지 (${TAX_FREE_SAVINGS.article})`,
  coopExempt: `농협·수협·신협·산림조합·새마을금고 조합원·준조합원·회원, 1인당 ${manwon(COOP_LIMIT)}까지 — 이자소득세·지방소득세 대신 농어촌특별세만 (${COOP_DEPOSIT.article})`,
  custom: `조합 예탁금 저율과세(소득세 ${COOP_REDUCED_PCTS.join('%·')}%, 농어촌특별세 포함 합계 ${COOP_REDUCED_TOTAL_PCTS.join('%·')}%) 가입분처럼 세율이 다른 경우 — 합계세율 하나로 10원 미만 절사`,
}

/** 조합 예탁금 비과세(1.4%)가 맞는지 — 가입 연도·소득 조건 (조특법 §89의3②·§88의5②1호, 농특세법 시행령 §4⑦3호) */
const COOP_CAVEAT = `${HIGH_FIRST_TAXED}년 이후 새로 가입했다면 ${COOP_DEPOSIT.memberUnions} 조합원이거나 직전 연도 총급여 ${manwon(COOP_DEPOSIT.incomeTest.totalSalary)}(종합소득금액 ${manwon(COOP_DEPOSIT.incomeTest.comprehensiveIncome)}) 이하일 때만 비과세입니다(${STD_LAST}년 가입분까지). 그 밖의 가입자는 ${HIGH_REDUCED_TEXT} — '세율 직접 입력'으로 계산하세요. 비과세 가입분이라도 농어민·임업인 등은 농어촌특별세까지 면제되어 0%입니다.`

/** '세율 직접 입력' 빠른 선택 — 조합 예탁금 저율과세 가입분 합계세율 */
const CUSTOM_PRESETS = COOP_REDUCED_RATES.map((r, i) => ({ pct: COOP_REDUCED_TOTAL_PCTS[i], label: `조합 예탁금 ${ratePct(r)}% 가입분 → ${COOP_REDUCED_TOTAL_PCTS[i]}%` }))

interface Saved { product: Product; amount: string; months: string; rate: string; method: Method; taxType: FinTaxType; customTax: string }

const isStr = (v: unknown): v is string => typeof v === 'string'
const digitsOnly = (v: string, max: number) => v.replace(/[^\d]/g, '').slice(0, max)
/* 입력 문자열 정리 + 상한 클램프 — 타이핑·공유 링크·저장값 복원이 같은 규칙을 쓰게 */
const clampMonths = (v: string): string => {
  const d = digitsOnly(v, 3)
  return d && parseInt(d, 10) > MAX_MONTHS ? String(MAX_MONTHS) : d
}
const clampDecimal = (v: string, max: number): string => {
  const d = decimalInput(v)
  return parseFloat(d) > max ? String(max) : d
}
/** 금액 문자열 → 콤마 + 상품별 상한(예금 원금 / 적금 월 납입) 클램프 */
const clampAmount = (p: Product, v: string): string => {
  const cap = p === 'deposit' ? MAX_DEPOSIT : MAX_MONTHLY
  const c = commaInput(v)
  return parseMoney(c) > cap ? cap.toLocaleString('ko-KR') : c
}

export default function DepositInterestClient() {
  const [product, setProduct] = useState<Product>('deposit')
  const [amount, setAmount] = useState('10,000,000')
  const [months, setMonths] = useState('12')
  const [rate, setRate] = useState('3.5')
  const [method, setMethod] = useState<Method>('simple')
  const [taxType, setTaxType] = useState<FinTaxType>('general')
  const [customTax, setCustomTax] = useState(String(COOP_REDUCED_TOTAL_PCTS[0] ?? GENERAL_FIN_TAX_PCT))
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState<'result' | 'link' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabRefs = useRef<Record<Product, HTMLButtonElement | null>>({ deposit: null, savings: null })

  /* 복원 — 공유 링크(?a=…)가 있으면 그것을, 없으면 이 기기에 저장된 마지막 입력 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const apply = (v: Partial<Record<keyof Saved, unknown>>) => {
      const p: Product = isProduct(v.product) ? v.product : 'deposit'
      if (isProduct(v.product)) setProduct(v.product)
      if (isStr(v.amount) && v.amount) setAmount(clampAmount(p, v.amount))
      if (isStr(v.months) && v.months) setMonths(clampMonths(v.months))
      if (isStr(v.rate) && v.rate) setRate(clampDecimal(v.rate, MAX_RATE_PCT))
      if (isMethod(v.method)) setMethod(v.method)
      if (isFinTaxType(v.taxType)) setTaxType(v.taxType)
      if (isStr(v.customTax) && v.customTax) setCustomTax(clampDecimal(v.customTax, MAX_CUSTOM_TAX_PCT))
    }
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('a')) {
        apply({ product: q.get('p'), amount: q.get('a') ?? '', months: q.get('n') ?? '', rate: q.get('r') ?? '', method: q.get('m'), taxType: q.get('t'), customTax: q.get('c') ?? '' })
      } else {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const j: unknown = JSON.parse(raw)
          if (j && typeof j === 'object' && !Array.isArray(j)) apply(j as Record<string, unknown>)
        }
      }
    } catch { /* 저장소 접근 불가·손상 — 기본값 유지 */ }
    // 마운트 1회 외부 저장소(URL·localStorage) 복원 완료 표시 — 이후에만 저장 effect가 돈다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    try {
      const v: Saved = { product, amount, months, rate, method, taxType, customTax }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    } catch { /* 저장 실패 무시 */ }
  }, [hydrated, product, amount, months, rate, method, taxType, customTax])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const amountV = parseMoney(amount)
  const monthsV = Math.min(MAX_MONTHS, Math.max(1, parseInt(months, 10) || 0))
  const rateV = parseFloat(rate) || 0
  const customV = parseFloat(customTax) || 0
  const monthsBad = months !== '' && (parseInt(months, 10) < 1 || parseInt(months, 10) > MAX_MONTHS)

  const r = useMemo(() => calcDeposit({
    product, amount: amountV, months: monthsV, ratePct: rateV, method, taxType, customTaxPct: customV,
  }), [product, amountV, monthsV, rateV, method, taxType, customV])

  const ready = amountV > 0 && months !== '' && !monthsBad
  /* 빈 상태 안내 — 비어 있는 칸을 정확히 가리킨다 */
  const emptyMsg = amountV > 0
    ? `기간(1~${MAX_MONTHS}개월)을 입력하면 만기에 받는 돈이 여기에 표시됩니다`
    : '금액을 입력하면 만기에 받는 돈이 여기에 표시됩니다'
  const n = r.input.months
  const rp = r.input.ratePct
  const taxPctLabel = pct2(finTaxTypePct(taxType, r.input.customTaxPct))

  /* ── 입력 핸들러 ── */
  const onAmount = (v: string) => setAmount(clampAmount(product, v))
  const onMonths = (v: string) => setMonths(clampMonths(v))
  const onRate = (v: string) => setRate(clampDecimal(v, MAX_RATE_PCT))
  const onCustom = (v: string) => setCustomTax(clampDecimal(v, MAX_CUSTOM_TAX_PCT))
  const switchProduct = (p: Product) => {
    if (p === product) return
    setProduct(p)
    // 예금 1,000만원 ↔ 적금 월 50만원 — 단위가 다른 값이 그대로 넘어가 '월 1,000만원 적금'이 되지 않게 기본값으로
    setAmount(p === 'deposit' ? '10,000,000' : '500,000')
    setRate(p === 'deposit' ? '3.5' : '5')
  }
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next: Product = e.key === 'Home' ? 'deposit' : e.key === 'End' ? 'savings' : product === 'deposit' ? 'savings' : 'deposit'
    switchProduct(next)
    tabRefs.current[next]?.focus()
  }

  const flash = (kind: 'result' | 'link') => {
    setCopied(kind)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1500)
  }
  const writeClip = async (text: string, kind: 'result' | 'link') => {
    try { await navigator.clipboard.writeText(text); flash(kind) } catch { /* 권한 거부 — 조용히 무시 */ }
  }
  const copyResult = () => {
    const head = product === 'deposit'
      ? `${productLabel(product)} ${won(r.input.amount)}원 × ${n}개월`
      : `${productLabel(product)} 월 ${won(r.input.amount)}원 × ${n}개월`
    const text = [
      `[예·적금 이자] ${head} · 연 ${pct2(rp)}% ${methodLabel(method)} · ${TAX_OPTIONS.find(t => t.id === taxType)?.name ?? ''}`,
      `세전 이자 ${won(r.grossInterest)}원 / 세금 ${won(r.taxTotal)}원 / 세후 이자 ${won(r.netInterest)}원`,
      `만기 수령액 ${won(r.maturity)}원`,
      window.location.origin + window.location.pathname,
    ].join('\n')
    void writeClip(text, 'result')
  }
  const copyLink = () => {
    const q = new URLSearchParams({ p: product, a: String(r.input.amount), n: String(n), r: String(rp), m: method, t: taxType })
    if (taxType === 'custom') q.set('c', String(r.input.customTaxPct))
    void writeClip(`${window.location.origin}${window.location.pathname}?${q.toString()}`, 'link')
  }

  /* ── 결과 표 ── */
  const rows: BreakdownRow[] = [
    { label: product === 'deposit' ? '예치 원금' : '총 납입 원금', note: product === 'savings' ? `월 ${won(r.input.amount)}원 × ${n}회` : undefined, cols: [won(r.principal)], color: 'data-3' },
    { label: '세전 이자', note: `연 ${pct2(rp)}% ${methodLabel(method)} · ${n}개월`, cols: [`+${won(r.grossInterest)}`], color: 'data-1' },
    ...r.taxLines.map((l): BreakdownRow => ({
      label: l.label,
      note: l.key === 'local' ? `이자소득세의 ${ratePct(LOCAL_INCOME_TAX_RATIO)}% (이자 대비 ${pct2(l.ratePct)}%)` : l.key === 'rural' ? `감면세액(이자 × ${WITHHOLDING_PCT}%)의 ${ratePct(RURAL_SPECIAL_TAX_RATIO)}%` : `이자 × ${pct2(l.ratePct)}% · 10원 미만 절사`,
      cols: [`−${won(l.amount)}`],
      color: 'data-4',
    })),
    { label: '세후 이자', cols: [`+${won(r.netInterest)}`], kind: 'sum' },
    { label: '만기 수령액', cols: [won(r.maturity)], kind: 'net' },
  ]

  const overComprehensive = taxType === 'general' && r.grossInterest > COMPREHENSIVE_TAX_THRESHOLD
  const overCoop = taxType === 'coopExempt' && r.principal > COOP_LIMIT
  const overTfs = taxType === 'taxFree' && r.principal > TFS_LIMIT

  const formula = product === 'deposit'
    ? method === 'simple'
      ? <>{won(r.input.amount)} × {pct2(rp)}% × {n}/12 = 세전 <b>{won(r.grossInterest)}</b> − 세금 <b>{won(r.taxTotal)}</b> = 세후 이자 <b>{won(r.netInterest)}원</b></>
      : <>{won(r.input.amount)} × ((1 + {pct2(rp)}%/12)<sup>{n}</sup> − 1) = 세전 <b>{won(r.grossInterest)}</b> − 세금 <b>{won(r.taxTotal)}</b> = 세후 이자 <b>{won(r.netInterest)}원</b></>
    : method === 'simple'
      ? <>{won(r.input.amount)} × {pct2(rp)}%/12 × ({n}×{n + 1}/2) = 세전 <b>{won(r.grossInterest)}</b> − 세금 <b>{won(r.taxTotal)}</b> = 세후 이자 <b>{won(r.netInterest)}원</b></>
      : <>월 {won(r.input.amount)}씩 {n}회, 매달 복리로 불린 합계 − 납입 원금 = 세전 <b>{won(r.grossInterest)}</b> − 세금 <b>{won(r.taxTotal)}</b> = 세후 이자 <b>{won(r.netInterest)}원</b></>

  return (
    <>
      <div className="ui-card">
        <div className="ui-seg" role="tablist" aria-label="상품 종류">
          {(['deposit', 'savings'] as Product[]).map(p => (
            <button
              key={p} type="button" role="tab" id={`di-tab-${p}`}
              aria-selected={product === p} aria-controls="di-panel" tabIndex={product === p ? 0 : -1}
              ref={el => { tabRefs.current[p] = el }}
              onClick={() => switchProduct(p)} onKeyDown={onTabKey}
            >{p === 'deposit' ? '정기예금' : '정기적금'}</button>
          ))}
        </div>

        <div role="tabpanel" id="di-panel" aria-labelledby={`di-tab-${product}`}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="di-amount">
              {product === 'deposit' ? '예치 원금' : '월 납입액'}
              <span className="ui-hint">{product === 'deposit' ? '한 번에 넣는 돈' : '매달 같은 금액'}</span>
            </label>
            <div className="ui-input">
              <input id="di-amount" type="text" inputMode="numeric" autoComplete="off"
                value={amount} onChange={e => onAmount(e.target.value)} placeholder="0" />
              <span className="ui-unit">원</span>
            </div>
            <p className="ui-helper">{amountV > 0 ? <>{product === 'savings' && '월 '}<strong>{manwon(amountV)}</strong>{product === 'savings' && <> · 총 납입 <strong>{manwon(amountV * monthsV)}</strong></>}</> : '금액을 입력하세요'}</p>
          </div>

          <div className="ui-row2">
            <div className="ui-field">
              <label className="ui-label" htmlFor="di-months">기간 <span className="ui-hint">1~{MAX_MONTHS}개월</span></label>
              <div className="ui-input ui-sm">
                <input id="di-months" type="text" inputMode="numeric" autoComplete="off"
                  value={months} onChange={e => onMonths(e.target.value)} aria-invalid={monthsBad || undefined}
                  aria-describedby={monthsBad ? 'di-months-err' : undefined} />
                <span className="ui-unit">개월</span>
              </div>
              {monthsBad && <p className="ui-helper ui-err" id="di-months-err">기간은 1~{MAX_MONTHS}개월 사이로 입력하세요.</p>}
              <div className="ui-chips" role="group" aria-label="기간 빠른 선택">
                {MONTH_PRESETS.map(m => (
                  <button key={m} type="button" className="ui-chip" aria-pressed={monthsV === m && months !== ''} onClick={() => setMonths(String(m))}>{m}개월</button>
                ))}
              </div>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="di-rate">연이율 <span className="ui-hint">세전 · 우대 포함</span></label>
              <div className="ui-input ui-sm">
                <input id="di-rate" type="text" inputMode="decimal" autoComplete="off"
                  value={rate} onChange={e => onRate(e.target.value)} placeholder="0" />
                <span className="ui-unit">%</span>
              </div>
              <p className="ui-helper">0.01%p 단위 · 최대 {MAX_RATE_PCT}%</p>
            </div>
          </div>

          <fieldset className="ui-field ui-fieldset">
            <legend className="ui-label">이자 방식</legend>
            <div className="ui-chips" role="group" aria-label="이자 방식">
              {(['simple', 'monthly'] as Method[]).map(m => (
                <button key={m} type="button" className="ui-chip" aria-pressed={method === m} onClick={() => setMethod(m)}>{methodLabel(m)}</button>
              ))}
            </div>
            <p className="ui-helper">대부분의 시중은행 정기예금·적금은 <strong>단리</strong>입니다. 상품설명서에 &lsquo;월복리&rsquo;라고 적힌 경우만 바꾸세요.</p>
          </fieldset>

          <fieldset className="ui-field ui-fieldset">
            <legend className="ui-label">과세 유형</legend>
            <div className="ui-chips" role="group" aria-label="과세 유형">
              {TAX_OPTIONS.map(t => (
                <button key={t.id} type="button" className="ui-chip" aria-pressed={taxType === t.id} onClick={() => setTaxType(t.id)}>{t.name}</button>
              ))}
            </div>
            <p className="ui-helper">{TAX_HELP[taxType]}</p>
            {taxType === 'coopExempt' && <p className={s.taxNote}>{COOP_CAVEAT}</p>}
            {taxType === 'custom' && (
              <div className="ui-field">
                <label className="ui-label" htmlFor="di-custom-tax">합계 세율 <span className="ui-hint">농어촌특별세 포함 · 예: {[...COOP_REDUCED_TOTAL_PCTS, GENERAL_FIN_TAX_PCT].join(', ')}</span></label>
                <div className="ui-input ui-sm">
                  <input id="di-custom-tax" type="text" inputMode="decimal" autoComplete="off"
                    value={customTax} onChange={e => onCustom(e.target.value)} />
                  <span className="ui-unit">%</span>
                </div>
                <div className="ui-chips" role="group" aria-label="합계 세율 빠른 선택">
                  {CUSTOM_PRESETS.map(c => (
                    <button key={c.pct} type="button" className="ui-chip" aria-pressed={parseFloat(customTax) === c.pct} onClick={() => setCustomTax(String(c.pct))}>{c.label}</button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        </div>
      </div>

      <ResultHero
        label="세후 만기 수령액"
        value={ready ? won(r.maturity) : undefined}
        unit="원"
        pill={ready ? `세후 이자 +${won(r.netInterest)}원` : undefined}
        empty={emptyMsg}
        sub={<>세전 이자 <b>{won(r.grossInterest)}원</b> · 세금 <b>{won(r.taxTotal)}원</b>({taxPctLabel}%) · 원금 <b>{won(r.principal)}원</b></>}
        formula={formula}
        actions={
          <div className="ui-btnRow">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={copyLink}>
              <UiIcon name="share" size={18} />{copied === 'link' ? '링크 복사됨' : '링크 공유'}
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={copyResult}>
              <UiIcon name="copy" size={18} />{copied === 'result' ? '복사했어요' : '결과 복사'}
            </button>
          </div>
        }
      >
        <BreakdownTable caption="수령액 내역" unit="원" head={['항목', '금액']} rows={rows} />

        <div className={s.equiv}>
          <p className={s.equivTitle}><UiIcon name="scale" size={18} />적금 ↔ 예금 금리 환산</p>
          {product === 'savings' ? (
            <p className={s.equivBody}>
              이 적금(연 <b>{pct2(rp)}%</b> {methodLabel(method)}, {n}개월)의 세전 이자는 같은 총액 {manwon(r.principal)}을 첫 달에 한꺼번에 맡기는 <b>연 {pct2(r.depositEquivPct)}% 단리 예금</b>과 같습니다.
              돈이 평균 {pct2((n + 1) / 2)}개월만 예치되기 때문입니다.
            </p>
          ) : (
            <p className={s.equivBody}>
              이 예금(연 <b>{pct2(rp)}%</b> {methodLabel(method)}, {n}개월)과 같은 세전 이자를 적금으로 받으려면, 같은 총액을 {n}개월에 나눠 넣는 <b>연 {pct2(r.savingsEquivPct)}% 단리 적금</b>이어야 합니다.
            </p>
          )}
          <p className={s.equivNote}>세후 연 환산 수익률(원금 대비): <b>{pct2(r.netAnnualPct)}%</b></p>
        </div>
      </ResultHero>

      {ready && (overComprehensive || overCoop || overTfs) && (
        <Callout tone="warn" title={overComprehensive ? '금융소득종합과세 기준을 넘습니다' : '비과세 한도를 넘습니다'}>
          {overComprehensive && <p>이 상품의 세전 이자만 {won(r.grossInterest)}원으로 연 {manwon(COMPREHENSIVE_TAX_THRESHOLD)}을 넘습니다. 이자를 받는 해의 다른 이자·배당과 합쳐 기준을 넘으면 초과분이 다른 소득과 합산되어 다음 해 5월 종합소득세 신고 대상이 됩니다. 은행 원천징수({GENERAL_FIN_TAX_PCT}%)만으로 끝나지 않을 수 있습니다.</p>}
          {overCoop && <p>조합 예탁금 비과세는 1인당 예탁금 합계 {manwon(COOP_LIMIT)}까지입니다. 한도를 넘는 금액은 비과세 예탁금으로 가입할 수 없어 일반과세({GENERAL_FIN_TAX_PCT}%)가 됩니다 — 초과분은 일반과세로 따로 계산해 보세요.</p>}
          {overTfs && <p>비과세종합저축은 1인당 저축원금 {manwon(TFS_LIMIT)}까지입니다. 초과분은 비과세가 적용되지 않습니다.</p>}
        </Callout>
      )}

      {ready && (
        <details className={s.months}>
          <summary>
            <span>월별 누적 이자 표</span>
            <span className={s.monthsMeta}>{n}개월 · 세전 기준<UiIcon name="chev-d" size={18} /></span>
          </summary>
          <div className="tableScroll">
            <table className={s.monthsTable}>
              <thead>
                <tr>
                  <th scope="col">개월</th>
                  <th scope="col">누적 납입</th>
                  <th scope="col">누적 세전 이자</th>
                  <th scope="col">평가액</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map(row => (
                  <tr key={row.month}>
                    <th scope="row">{row.month}</th>
                    <td>{won(row.paid)}</td>
                    <td>{won(row.interest)}</td>
                    <td>{won(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.monthsNote}>
            만기까지 유지했을 때 달마다 쌓이는 약정 이자입니다. 중간에 해지하면 약정 금리가 아니라 은행이 정한 <strong>중도해지 이율</strong>이 적용되므로 이 표의 금액보다 적습니다.
          </p>
        </details>
      )}
    </>
  )
}
