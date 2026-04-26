'use client'

import { useMemo, useState } from 'react'
import styles from './real-estate.module.css'

/* ─────────────────────────────────────────────────────────
 * 한국어 단위 포맷터: 12345670 → "1,234만 5,670원" / "1억 2,345만원" 형태
 * ───────────────────────────────────────────────────────── */
function fmtKRW(n: number): string {
  const v = Math.round(n)
  if (!Number.isFinite(v)) return '0원'
  const sign = v < 0 ? '-' : ''
  const abs = Math.abs(v)
  if (abs === 0) return '0원'

  const eok = Math.floor(abs / 100_000_000)
  const man = Math.floor((abs % 100_000_000) / 10_000)
  const won = abs % 10_000

  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (won > 0 && eok === 0 && man === 0) parts.push(`${won.toLocaleString('ko-KR')}`)
  if (parts.length === 0) return '0원'
  return `${sign}${parts.join(' ')}원`
}

/* 천단위 콤마 — 입력 표시용 */
function fmtComma(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR')
}

/* "12,345,000" 같은 콤마 문자열 → 숫자 */
function parseNum(s: string): number {
  const cleaned = s.replace(/[^0-9.-]/g, '')
  const v = Number(cleaned)
  return Number.isFinite(v) ? v : 0
}

/* ─────────────────────────────────────────────────────────
 * 한국 취득세 자동 계산
 * ───────────────────────────────────────────────────────── */
type HomeType = '1home' | '2home' | '3home+' | 'non'
function calcAcquisitionTax(price: number, type: HomeType): number {
  if (price <= 0) return 0
  if (type === '1home') {
    if (price <= 600_000_000) return price * 0.01
    if (price <= 900_000_000) return price * 0.02
    return price * 0.03
  }
  if (type === '2home')  return price * 0.08
  if (type === '3home+') return price * 0.12
  return price * 0.04
}

/* 한국 중개수수료 (매매 기준 누진 — 2024) */
function calcBrokerFee(price: number): number {
  if (price <= 0) return 0
  if (price < 50_000_000)    return Math.min(price * 0.006, 250_000)
  if (price < 200_000_000)   return Math.min(price * 0.005, 800_000)
  if (price < 600_000_000)   return price * 0.004
  if (price < 900_000_000)   return price * 0.005
  if (price < 1_200_000_000) return price * 0.006
  if (price < 1_500_000_000) return price * 0.007
  return price * 0.009
}

/* ─────────────────────────────────────────────────────────
 * 메인 컴포넌트
 * ───────────────────────────────────────────────────────── */
export default function RealEstateClient() {
  /* ── 모드 ── */
  const [mode, setMode] = useState<'simple' | 'detail'>('simple')

  /* ── 매물 정보 (필수) ── */
  const [priceStr,   setPriceStr]   = useState('500000000')   // 5억
  const [salePriceStr, setSalePriceStr] = useState('700000000') // 7억
  const [holdMonths, setHoldMonths] = useState(12)

  /* ── 대출 ── */
  const [loanMode, setLoanMode] = useState<'amount' | 'ltv'>('ltv')
  const [loanStr, setLoanStr]   = useState('350000000')       // 3.5억
  const [ltv,     setLtv]       = useState(70)
  const [loanRate, setLoanRate] = useState(4.5)
  const [loanGrace, setLoanGrace] = useState(0)

  /* ── 취득세 ── */
  const [acqMode, setAcqMode] = useState<'auto' | 'manual'>('auto')
  const [homeType, setHomeType] = useState<HomeType>('1home')
  const [acqStr, setAcqStr] = useState('0')

  /* ── 중개수수료 ── */
  const [brokerMode, setBrokerMode] = useState<'auto' | 'manual'>('auto')
  const [brokerBuyStr,  setBrokerBuyStr]  = useState('0')
  const [brokerSellStr, setBrokerSellStr] = useState('0')

  /* ── 상세 모드: 추가 비용 ── */
  const [legalFeeStr,   setLegalFeeStr]   = useState('600000')
  const [interiorStr,   setInteriorStr]   = useState('0')
  const [relocateStr,   setRelocateStr]   = useState('0')
  const [earlyMode,     setEarlyMode]     = useState<'auto' | 'manual'>('manual')
  const [earlyStr,      setEarlyStr]      = useState('0')

  /* ── 상세 모드: 임대 ── */
  type RentType = 'monthly' | 'jeonse' | 'half' | 'self'
  const [rentType, setRentType] = useState<RentType>('self')
  const [depositStr,  setDepositStr]  = useState('0')
  const [monthlyRentStr, setMonthlyRentStr] = useState('0')
  const [rentMonthsCustom, setRentMonthsCustom] = useState<number | null>(null)
  const [vacancyMonths, setVacancyMonths] = useState(0)
  const [maintenancePayer, setMaintenancePayer] = useState<'tenant' | 'landlord'>('tenant')
  const [maintenanceStr, setMaintenanceStr] = useState('0')

  /* ── 상세 모드: 기타 비용 (자유 3행) ── */
  const [other1Name, setOther1Name] = useState('')
  const [other1Str,  setOther1Str]  = useState('0')
  const [other2Name, setOther2Name] = useState('')
  const [other2Str,  setOther2Str]  = useState('0')
  const [other3Name, setOther3Name] = useState('')
  const [other3Str,  setOther3Str]  = useState('0')

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 파생값 ─── */
  const price     = parseNum(priceStr)
  const salePrice = parseNum(salePriceStr)
  const loan      = loanMode === 'amount' ? parseNum(loanStr) : (price * ltv) / 100
  const acqTaxAuto = calcAcquisitionTax(price, homeType)
  const acqTax    = acqMode === 'auto' ? acqTaxAuto : parseNum(acqStr)
  const brokerBuyAuto  = calcBrokerFee(price)
  const brokerSellAuto = calcBrokerFee(salePrice)
  const brokerBuy  = brokerMode === 'auto' ? brokerBuyAuto  : parseNum(brokerBuyStr)
  const brokerSell = brokerMode === 'auto' ? brokerSellAuto : parseNum(brokerSellStr)

  const legalFee  = mode === 'detail' ? parseNum(legalFeeStr) : 600_000
  const interior  = mode === 'detail' ? parseNum(interiorStr) : 0
  const relocate  = mode === 'detail' ? parseNum(relocateStr) : 0

  /* 대출 이자: 거치 기간 동안 이자만 납부, 이후도 단순화하여 전체 보유 기간 이자 계산 */
  const totalInterest = (loan * (loanRate / 100) * holdMonths) / 12

  /* 중도상환 수수료 */
  const earlyFeeAuto = loan * 0.012
  const earlyFee = mode === 'detail'
    ? (earlyMode === 'auto' ? earlyFeeAuto : parseNum(earlyStr))
    : 0

  /* 임대 수익 */
  const deposit       = mode === 'detail' ? parseNum(depositStr) : 0
  const monthlyRent   = mode === 'detail' ? parseNum(monthlyRentStr) : 0
  const rentMonths    = mode === 'detail'
    ? (rentMonthsCustom !== null ? rentMonthsCustom : holdMonths)
    : 0
  const landlordMaint = mode === 'detail' && maintenancePayer === 'landlord'
    ? parseNum(maintenanceStr)
    : 0
  const rentalIncome  = mode === 'detail' && rentType !== 'self'
    ? (monthlyRent * Math.max(0, rentMonths - vacancyMonths)) - (landlordMaint * rentMonths)
    : 0

  /* 기타 비용 합계 */
  const otherCosts = mode === 'detail'
    ? parseNum(other1Str) + parseNum(other2Str) + parseNum(other3Str)
    : 0

  /* 초기 자기자본 */
  const upfrontCost = acqTax + brokerBuy + legalFee + interior + relocate
  const initialInvestment = Math.max(1, price - loan + upfrontCost - deposit)

  /* 총 비용 */
  const totalCost = upfrontCost + totalInterest + brokerSell + earlyFee + otherCosts

  /* 세전 순수익 */
  const profitBeforeTax = (salePrice - price) + rentalIncome - totalCost

  /* 자기자본 수익률 (ROE) */
  const roe = (profitBeforeTax / initialInvestment) * 100

  /* 연환산 ROE */
  const annualizedROE = holdMonths > 0 ? (roe / holdMonths) * 12 : 0

  /* 월 환산 수익 */
  const monthlyProfit = holdMonths > 0 ? profitBeforeTax / holdMonths : 0

  /* 손익분기 매도가 */
  const breakEvenPrice = price + totalCost - rentalIncome

  /* ─── 매도 시나리오 ─── */
  const scenarios = useMemo(() => {
    const buildScenario = (sp: number) => {
      const bSell = brokerMode === 'auto' ? calcBrokerFee(sp) : brokerSell
      const cost  = upfrontCost + totalInterest + bSell + earlyFee + otherCosts
      const profit = (sp - price) + rentalIncome - cost
      const roe_ = (profit / initialInvestment) * 100
      return { price: sp, profit, roe: roe_ }
    }
    return {
      conservative: buildScenario(salePrice * 0.9),
      base:         buildScenario(salePrice),
      optimistic:   buildScenario(salePrice * 1.1),
    }
  }, [salePrice, price, brokerMode, brokerSell, upfrontCost, totalInterest, earlyFee, otherCosts, rentalIncome, initialInvestment])

  /* ─── 전액 현금 매수 시 비교 ─── */
  const allCashCompare = useMemo(() => {
    const cashUpfront = acqTax + brokerBuyAuto + legalFee + interior + relocate
    const cashCost = cashUpfront + brokerSellAuto + otherCosts
    // 임대수익도 동일하게 적용 (전액현금이라 보증금 없음)
    const cashProfit = (salePrice - price) + (rentType !== 'self' ? monthlyRent * Math.max(0, rentMonths - vacancyMonths) - landlordMaint * rentMonths : 0) - cashCost
    const cashEquity = price + cashUpfront
    const cashROE = (cashProfit / cashEquity) * 100
    return {
      equity: cashEquity,
      profit: cashProfit,
      roe:    cashROE,
    }
  }, [price, salePrice, acqTax, brokerBuyAuto, brokerSellAuto, legalFee, interior, relocate, otherCosts, rentType, monthlyRent, rentMonths, vacancyMonths, landlordMaint])

  const leverageMultiplier = allCashCompare.roe !== 0
    ? Math.abs(roe / allCashCompare.roe)
    : 0

  const isLoss = profitBeforeTax < 0
  const belowBreakEven = salePrice < breakEvenPrice

  /* ─── 결과 복사 ─── */
  function handleCopy() {
    const txt = [
      '── 부동산 투자 수익률 시뮬레이션 ──',
      `매입가: ${fmtKRW(price)} / 매도가: ${fmtKRW(salePrice)} (${holdMonths}개월 보유)`,
      `대출: ${fmtKRW(loan)} (${loanRate}%)`,
      `세전 수익: ${profitBeforeTax >= 0 ? '+' : ''}${fmtKRW(profitBeforeTax)}`,
      `자기자본 수익률: ${roe.toFixed(1)}%`,
      `연환산: ${annualizedROE.toFixed(1)}%`,
      'youtil.kr/tools/finance/real-estate',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* ─── 한국어 단위 표기 헬퍼 (입력 즉시 표시) ─── */
  function inlineKRW(v: number, accent = false) {
    if (v <= 0) return null
    return (
      <p className={accent ? styles.koreanLabel : styles.koreanLabelMuted}>
        약 {fmtKRW(v)}
      </p>
    )
  }

  return (
    <div className={styles.wrap}>

      {/* 면책 ─ 최상단 */}
      <div className={styles.disclaimer}>
        <strong>⚖️ 본 계산기는 단순 시뮬레이션이며 투자 권유가 아닙니다.</strong> 양도소득세·종합부동산세·재산세·임대소득세는 별도 계산이 필요하며, 실제 거래에서는 시장 상황·세제 변경에 따라 결과가 크게 달라질 수 있습니다.
      </div>

      {/* ── 모드 토글 ── */}
      <div className={styles.modeToggle} role="tablist">
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'simple' ? styles.modeActive : ''}`}
          onClick={() => setMode('simple')}
        >
          간단 모드
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'detail' ? styles.modeActive : ''}`}
          onClick={() => setMode('detail')}
        >
          상세 모드
        </button>
      </div>

      {/* ── 매물 정보 카드 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>매물 정보</span>
        </div>

        <span className={styles.subLabel}>매입가</span>
        <div className={styles.inputRow}>
          <input
            className={styles.numInput}
            type="text"
            inputMode="numeric"
            value={fmtComma(price)}
            onChange={e => setPriceStr(parseNum(e.target.value).toString())}
          />
          <span className={styles.unit}>원</span>
        </div>
        {inlineKRW(price, true)}

        <div style={{ height: 14 }} />

        <span className={styles.subLabel}>매도 예상가</span>
        <div className={styles.inputRow}>
          <input
            className={styles.numInput}
            type="text"
            inputMode="numeric"
            value={fmtComma(salePrice)}
            onChange={e => setSalePriceStr(parseNum(e.target.value).toString())}
          />
          <span className={styles.unit}>원</span>
        </div>
        {inlineKRW(salePrice, true)}

        <div style={{ height: 14 }} />

        <span className={styles.subLabel}>보유 기간 (개월)</span>
        <div className={styles.inputRow}>
          <input
            className={styles.numInput}
            type="number"
            min={1}
            max={600}
            value={holdMonths}
            onChange={e => setHoldMonths(Math.max(1, Number(e.target.value) || 1))}
            style={{ maxWidth: 140 }}
          />
          <span className={styles.unit}>개월</span>
        </div>
        <div className={styles.sliderRow}>
          <input
            className={styles.slider}
            type="range"
            min={1}
            max={120}
            value={Math.min(120, holdMonths)}
            onChange={e => setHoldMonths(Number(e.target.value))}
          />
        </div>
        <div className={styles.pills}>
          {[12, 24, 36, 60].map(m => (
            <button
              key={m}
              type="button"
              className={`${styles.pill} ${holdMonths === m ? styles.pillActive : ''}`}
              onClick={() => setHoldMonths(m)}
            >
              {m}개월
            </button>
          ))}
        </div>
      </div>

      {/* ── 대출 카드 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>대출</span>
          <span className={styles.cardLabelHint}>LTV·금리·거치 기간</span>
        </div>

        <div className={styles.miniToggle}>
          <button type="button" className={`${styles.miniBtn} ${loanMode === 'ltv' ? styles.miniActive : ''}`} onClick={() => setLoanMode('ltv')}>LTV(%)</button>
          <button type="button" className={`${styles.miniBtn} ${loanMode === 'amount' ? styles.miniActive : ''}`} onClick={() => setLoanMode('amount')}>직접 금액</button>
        </div>

        {loanMode === 'ltv' ? (
          <>
            <div className={styles.inputRow}>
              <input
                className={styles.numInput}
                type="number"
                min={0}
                max={100}
                value={ltv}
                onChange={e => setLtv(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                style={{ maxWidth: 140 }}
              />
              <span className={styles.unit}>%</span>
            </div>
            <div className={styles.autoResult} style={{ marginTop: 10 }}>
              <span>대출금</span>
              <strong>{fmtKRW(loan)}</strong>
            </div>
            <div className={styles.ltvGrid}>
              {[
                { v: 0,  label: '0% (현금)', cls: styles.ltvCash },
                { v: 40, label: '40%',        cls: styles.ltvNormal },
                { v: 50, label: '50%',        cls: styles.ltvNormal },
                { v: 60, label: '60%',        cls: styles.ltvNormal },
                { v: 70, label: '70%',        cls: styles.ltvHigh },
                { v: 80, label: '80%',        cls: styles.ltvHigh },
              ].map(p => (
                <button
                  key={p.v}
                  type="button"
                  className={`${styles.ltvBtn} ${p.cls} ${ltv === p.v ? styles.ltvActive : ''}`}
                  onClick={() => setLtv(p.v)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.inputRow}>
            <input
              className={styles.numInput}
              type="text"
              inputMode="numeric"
              value={fmtComma(parseNum(loanStr))}
              onChange={e => setLoanStr(parseNum(e.target.value).toString())}
            />
            <span className={styles.unit}>원</span>
          </div>
        )}
        {loanMode === 'amount' && inlineKRW(parseNum(loanStr), true)}

        <div style={{ height: 14 }} />

        <span className={styles.subLabel}>대출 금리 (%/년)</span>
        <div className={styles.inputRow}>
          <input
            className={styles.smallInput}
            type="number"
            step="0.1"
            min={0}
            value={loanRate}
            onChange={e => setLoanRate(Math.max(0, Number(e.target.value) || 0))}
          />
          <span className={styles.unit}>%</span>
        </div>

        <div style={{ height: 12 }} />
        <span className={styles.subLabel}>거치 기간 (개월) — 이자만 납부</span>
        <div className={styles.inputRow}>
          <input
            className={styles.smallInput}
            type="number"
            min={0}
            value={loanGrace}
            onChange={e => setLoanGrace(Math.max(0, Number(e.target.value) || 0))}
          />
          <span className={styles.unit}>개월</span>
        </div>

        <div className={styles.autoResult} style={{ marginTop: 12 }}>
          <span>{holdMonths}개월 누적 이자 (단순 추정)</span>
          <strong>{fmtKRW(totalInterest)}</strong>
        </div>
      </div>

      {/* ── 취득세 카드 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>취득세</span>
          <span className={styles.cardLabelHint}>2024년 기준</span>
        </div>

        <div className={styles.miniToggle}>
          <button type="button" className={`${styles.miniBtn} ${acqMode === 'auto' ? styles.miniActive : ''}`} onClick={() => setAcqMode('auto')}>자동 계산</button>
          <button type="button" className={`${styles.miniBtn} ${acqMode === 'manual' ? styles.miniActive : ''}`} onClick={() => setAcqMode('manual')}>직접 입력</button>
        </div>

        {acqMode === 'auto' ? (
          <>
            <span className={styles.subLabel}>주택 종류</span>
            <div className={styles.toggleGrid4}>
              {[
                { id: '1home',  label: '1주택' },
                { id: '2home',  label: '다주택(2주택)' },
                { id: '3home+', label: '다주택(3+)' },
                { id: 'non',    label: '비주거' },
              ].map(o => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.toggleBtn} ${homeType === o.id ? styles.toggleActive : ''}`}
                  onClick={() => setHomeType(o.id as HomeType)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className={styles.autoResult} style={{ marginTop: 12 }}>
              <span>자동 산정 취득세</span>
              <strong>{fmtKRW(acqTaxAuto)}</strong>
            </div>
          </>
        ) : (
          <div className={styles.inputRow}>
            <input
              className={styles.numInput}
              type="text"
              inputMode="numeric"
              value={fmtComma(parseNum(acqStr))}
              onChange={e => setAcqStr(parseNum(e.target.value).toString())}
            />
            <span className={styles.unit}>원</span>
          </div>
        )}
      </div>

      {/* ── 중개수수료 카드 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>중개수수료</span>
          <span className={styles.cardLabelHint}>매수·매도 별도</span>
        </div>

        <div className={styles.miniToggle}>
          <button type="button" className={`${styles.miniBtn} ${brokerMode === 'auto' ? styles.miniActive : ''}`} onClick={() => setBrokerMode('auto')}>자동 계산</button>
          <button type="button" className={`${styles.miniBtn} ${brokerMode === 'manual' ? styles.miniActive : ''}`} onClick={() => setBrokerMode('manual')}>직접 입력</button>
        </div>

        {brokerMode === 'auto' ? (
          <>
            <div className={styles.autoResult} style={{ marginBottom: 8 }}>
              <span>매수 중개수수료 (자동)</span>
              <strong>{fmtKRW(brokerBuyAuto)}</strong>
            </div>
            <div className={styles.autoResult}>
              <span>매도 중개수수료 (자동)</span>
              <strong>{fmtKRW(brokerSellAuto)}</strong>
            </div>
          </>
        ) : (
          <>
            <span className={styles.subLabel}>매수 중개수수료</span>
            <div className={styles.inputRow}>
              <input
                className={styles.smallInput}
                type="text"
                inputMode="numeric"
                value={fmtComma(parseNum(brokerBuyStr))}
                onChange={e => setBrokerBuyStr(parseNum(e.target.value).toString())}
              />
              <span className={styles.unit}>원</span>
            </div>
            <div style={{ height: 10 }} />
            <span className={styles.subLabel}>매도 중개수수료</span>
            <div className={styles.inputRow}>
              <input
                className={styles.smallInput}
                type="text"
                inputMode="numeric"
                value={fmtComma(parseNum(brokerSellStr))}
                onChange={e => setBrokerSellStr(parseNum(e.target.value).toString())}
              />
              <span className={styles.unit}>원</span>
            </div>
          </>
        )}
      </div>

      {/* ─── 상세 모드 카드들 ─── */}
      {mode === 'detail' && (
        <>
          {/* 추가 비용 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>추가 비용</span>
              <span className={styles.cardLabelHint}>법무·인테리어·중도상환</span>
            </div>

            <span className={styles.subLabel}>법무비 (등기비)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(legalFeeStr))} onChange={e => setLegalFeeStr(parseNum(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 10 }} />
            <span className={styles.subLabel}>인테리어 비용</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(interiorStr))} onChange={e => setInteriorStr(parseNum(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 10 }} />
            <span className={styles.subLabel}>명도비</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(relocateStr))} onChange={e => setRelocateStr(parseNum(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>중도상환 수수료</span>
            <div className={styles.miniToggle}>
              <button type="button" className={`${styles.miniBtn} ${earlyMode === 'manual' ? styles.miniActive : ''}`} onClick={() => setEarlyMode('manual')}>직접 입력</button>
              <button type="button" className={`${styles.miniBtn} ${earlyMode === 'auto' ? styles.miniActive : ''}`} onClick={() => setEarlyMode('auto')}>자동 (잔여×1.2%)</button>
            </div>
            {earlyMode === 'manual' ? (
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(earlyStr))} onChange={e => setEarlyStr(parseNum(e.target.value).toString())} />
                <span className={styles.unit}>원</span>
              </div>
            ) : (
              <div className={styles.autoResult}>
                <span>자동 산정 (3년 내 상환 가정)</span>
                <strong>{fmtKRW(earlyFeeAuto)}</strong>
              </div>
            )}
          </div>

          {/* 임대 수익 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>임대 수익</span>
              <span className={styles.cardLabelHint}>월세·전세·자가</span>
            </div>

            <span className={styles.subLabel}>임대 형태</span>
            <div className={styles.toggleGrid4}>
              {[
                { id: 'monthly', label: '월세' },
                { id: 'jeonse',  label: '전세' },
                { id: 'half',    label: '반전세' },
                { id: 'self',    label: '자가' },
              ].map(o => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.toggleBtn} ${rentType === o.id ? styles.toggleActive : ''}`}
                  onClick={() => setRentType(o.id as RentType)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {rentType !== 'self' && (
              <>
                <div style={{ height: 14 }} />
                <span className={styles.subLabel}>임대보증금</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(depositStr))} onChange={e => setDepositStr(parseNum(e.target.value).toString())} />
                  <span className={styles.unit}>원</span>
                </div>
                {inlineKRW(parseNum(depositStr))}

                <div style={{ height: 10 }} />
                <span className={styles.subLabel}>월세</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(monthlyRentStr))} onChange={e => setMonthlyRentStr(parseNum(e.target.value).toString())} />
                  <span className={styles.unit}>원/월</span>
                </div>

                <div style={{ height: 10 }} />
                <span className={styles.subLabel}>임대 기간 (개월) — 비워두면 보유 기간과 동일</span>
                <div className={styles.inputRow}>
                  <input
                    className={styles.smallInput}
                    type="number"
                    min={0}
                    placeholder={String(holdMonths)}
                    value={rentMonthsCustom ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setRentMonthsCustom(v === '' ? null : Math.max(0, Number(v) || 0))
                    }}
                  />
                  <span className={styles.unit}>개월</span>
                </div>

                <div style={{ height: 10 }} />
                <span className={styles.subLabel}>공실 기간 (개월)</span>
                <div className={styles.inputRow}>
                  <input
                    className={styles.smallInput}
                    type="number"
                    min={0}
                    value={vacancyMonths}
                    onChange={e => setVacancyMonths(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <span className={styles.unit}>개월</span>
                </div>

                <div style={{ height: 12 }} />
                <span className={styles.subLabel}>관리비 부담 주체</span>
                <div className={styles.toggleGrid4} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button type="button" className={`${styles.toggleBtn} ${maintenancePayer === 'tenant' ? styles.toggleActive : ''}`} onClick={() => setMaintenancePayer('tenant')}>임차인</button>
                  <button type="button" className={`${styles.toggleBtn} ${maintenancePayer === 'landlord' ? styles.toggleActive : ''}`} onClick={() => setMaintenancePayer('landlord')}>임대인</button>
                </div>
                {maintenancePayer === 'landlord' && (
                  <>
                    <div style={{ height: 10 }} />
                    <span className={styles.subLabel}>월 관리비 (임대인 부담)</span>
                    <div className={styles.inputRow}>
                      <input className={styles.smallInput} type="text" inputMode="numeric" value={fmtComma(parseNum(maintenanceStr))} onChange={e => setMaintenanceStr(parseNum(e.target.value).toString())} />
                      <span className={styles.unit}>원/월</span>
                    </div>
                  </>
                )}

                <div className={styles.autoResult} style={{ marginTop: 12 }}>
                  <span>임대 수익 합계</span>
                  <strong>{fmtKRW(rentalIncome)}</strong>
                </div>
              </>
            )}
          </div>

          {/* 기타 비용 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>기타 비용 (자유 입력)</span>
              <span className={styles.cardLabelHint}>최대 3개</span>
            </div>
            {[
              [other1Name, setOther1Name, other1Str, setOther1Str] as const,
              [other2Name, setOther2Name, other2Str, setOther2Str] as const,
              [other3Name, setOther3Name, other3Str, setOther3Str] as const,
            ].map(([n, sn, v, sv], i) => (
              <div key={i} className={styles.otherRow}>
                <input
                  className={styles.otherName}
                  type="text"
                  placeholder={`항목명 ${i + 1}`}
                  value={n}
                  onChange={e => sn(e.target.value)}
                />
                <input
                  className={styles.smallInput}
                  type="text"
                  inputMode="numeric"
                  placeholder="금액"
                  value={v === '0' ? '' : fmtComma(parseNum(v))}
                  onChange={e => sv(parseNum(e.target.value).toString())}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─────────────────────────── 결과 ─────────────────────────── */}

      {/* 손실 경고 (손익분기 미달 시) */}
      {belowBreakEven && (
        <div className={styles.lossWarn}>
          <span className={styles.lossIcon}>🚨</span>
          <span>
            <strong>현재 입력 매도가는 손익분기({fmtKRW(breakEvenPrice)})를 밑돕니다.</strong> 모든 거래 비용을 회수하지 못해 손실이 발생합니다. 매도가·보유 기간·대출 조건을 다시 살펴보세요.
          </span>
        </div>
      )}

      {/* 히어로 — 세전 수익 */}
      <div className={styles.hero}>
        <p className={styles.heroLead}>예상 세전 수익</p>
        <p className={`${styles.heroNum} ${isLoss ? styles.heroNumLoss : ''}`}>
          {profitBeforeTax >= 0 ? '+' : ''}{fmtKRW(profitBeforeTax)}
        </p>
        <p className={styles.heroSub}>
          매입 {fmtKRW(price)} → 매도 {fmtKRW(salePrice)} · {holdMonths}개월 보유
        </p>
      </div>

      {/* 핵심 KPI 3개 */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>자기자본 수익률 (ROE)</div>
          <div className={`${styles.kpiValue} ${isLoss ? styles.kpiValueNeg : styles.kpiValueAccent}`}>
            {roe.toFixed(1)}%
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>연환산 수익률</div>
          <div className={`${styles.kpiValue} ${isLoss ? styles.kpiValueNeg : styles.kpiValueAccent}`}>
            {annualizedROE.toFixed(1)}%
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>총 자기자본</div>
          <div className={styles.kpiValue}>{fmtKRW(initialInvestment)}</div>
        </div>
      </div>

      {/* 비용 breakdown */}
      <div className={styles.card}>
        <div className={styles.cardLabel}><span>비용 Breakdown</span></div>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr><td>매입가</td><td>{fmtKRW(price)}</td></tr>
            <tr><td>취득세</td><td>{fmtKRW(acqTax)}</td></tr>
            <tr><td>법무비 (등기비)</td><td>{fmtKRW(legalFee)}</td></tr>
            <tr><td>매수 중개수수료</td><td>{fmtKRW(brokerBuy)}</td></tr>
            {mode === 'detail' && interior > 0 && <tr><td>인테리어</td><td>{fmtKRW(interior)}</td></tr>}
            {mode === 'detail' && relocate > 0 && <tr><td>명도비</td><td>{fmtKRW(relocate)}</td></tr>}
            <tr className={styles.rowHilight}><td>대출 이자 (총)</td><td>{fmtKRW(totalInterest)}</td></tr>
            <tr><td>매도 중개수수료</td><td>{fmtKRW(brokerSell)}</td></tr>
            {mode === 'detail' && earlyFee > 0 && <tr><td>중도상환 수수료</td><td>{fmtKRW(earlyFee)}</td></tr>}
            {mode === 'detail' && other1Str !== '0' && <tr><td>{other1Name || '기타 1'}</td><td>{fmtKRW(parseNum(other1Str))}</td></tr>}
            {mode === 'detail' && other2Str !== '0' && <tr><td>{other2Name || '기타 2'}</td><td>{fmtKRW(parseNum(other2Str))}</td></tr>}
            {mode === 'detail' && other3Str !== '0' && <tr><td>{other3Name || '기타 3'}</td><td>{fmtKRW(parseNum(other3Str))}</td></tr>}
            <tr className={styles.rowTotal}><td>총 비용</td><td>{fmtKRW(totalCost)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* 수익 breakdown */}
      <div className={styles.card}>
        <div className={styles.cardLabel}><span>수익 Breakdown</span></div>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr><td>매도가</td><td>{fmtKRW(salePrice)}</td></tr>
            <tr><td>매매 차익</td><td className={salePrice >= price ? styles.posValue : styles.negValue}>{salePrice - price >= 0 ? '+' : ''}{fmtKRW(salePrice - price)}</td></tr>
            {mode === 'detail' && rentType !== 'self' && (
              <tr><td>임대 수익</td><td className={styles.posValue}>+{fmtKRW(rentalIncome)}</td></tr>
            )}
            <tr><td>총 비용</td><td className={styles.negValue}>-{fmtKRW(totalCost)}</td></tr>
            <tr className={`${styles.rowTotal} ${isLoss ? styles.totalNeg : ''}`}>
              <td>세전 순수익</td>
              <td>{profitBeforeTax >= 0 ? '+' : ''}{fmtKRW(profitBeforeTax)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 매도 시나리오 비교 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>매도 시나리오 비교</span>
          <span className={styles.cardLabelHint}>±10% 자동 시뮬레이션</span>
        </div>
        <div className={styles.scenarioGrid}>
          <div className={`${styles.scenarioCard} ${styles.scenarioConservative}`}>
            <span className={`${styles.scenarioArrow} ${styles.arrowDown}`}>▼</span>
            <p className={styles.scenarioLabel}>보수적 (-10%)</p>
            <p className={styles.scenarioPrice}>{fmtKRW(scenarios.conservative.price)}</p>
            <p className={`${styles.scenarioProfit} ${scenarios.conservative.profit >= 0 ? styles.posValue : styles.negValue}`}>
              {scenarios.conservative.profit >= 0 ? '+' : ''}{fmtKRW(scenarios.conservative.profit)}
            </p>
            <p className={styles.scenarioROE}>ROE <strong>{scenarios.conservative.roe.toFixed(1)}%</strong></p>
          </div>
          <div className={`${styles.scenarioCard} ${styles.scenarioBase}`}>
            <span className={`${styles.scenarioArrow} ${styles.arrowFlat}`}>●</span>
            <p className={styles.scenarioLabel}>기준</p>
            <p className={styles.scenarioPrice}>{fmtKRW(scenarios.base.price)}</p>
            <p className={`${styles.scenarioProfit} ${scenarios.base.profit >= 0 ? styles.posValue : styles.negValue}`}>
              {scenarios.base.profit >= 0 ? '+' : ''}{fmtKRW(scenarios.base.profit)}
            </p>
            <p className={styles.scenarioROE}>ROE <strong>{scenarios.base.roe.toFixed(1)}%</strong></p>
          </div>
          <div className={`${styles.scenarioCard} ${styles.scenarioOptimistic}`}>
            <span className={`${styles.scenarioArrow} ${styles.arrowUp}`}>▲</span>
            <p className={styles.scenarioLabel}>낙관적 (+10%)</p>
            <p className={styles.scenarioPrice}>{fmtKRW(scenarios.optimistic.price)}</p>
            <p className={`${styles.scenarioProfit} ${scenarios.optimistic.profit >= 0 ? styles.posValue : styles.negValue}`}>
              {scenarios.optimistic.profit >= 0 ? '+' : ''}{fmtKRW(scenarios.optimistic.profit)}
            </p>
            <p className={styles.scenarioROE}>ROE <strong>{scenarios.optimistic.roe.toFixed(1)}%</strong></p>
          </div>
        </div>
      </div>

      {/* 손익분기 안내 */}
      <div className={styles.breakEvenCard}>
        <p className={styles.breakEvenLead}>⚠️ 손익분기 매도가</p>
        <p className={styles.breakEvenValue}>{fmtKRW(breakEvenPrice)}</p>
        <p className={styles.breakEvenSub}>
          매입가 대비 최소 <strong>{((breakEvenPrice / price - 1) * 100).toFixed(1)}%</strong> 이상 상승해야 모든 거래 비용을 회수할 수 있습니다.
          {mode === 'detail' && rentType !== 'self' && rentalIncome > 0 && ' (임대 수익 반영)'}
        </p>
      </div>

      {/* 레버리지 효과 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>대출 레버리지 효과</span>
          <span className={styles.cardLabelHint}>대출 사용 vs 전액 현금</span>
        </div>
        <table className={styles.leverageTable}>
          <thead>
            <tr><th></th><th>대출 사용</th><th>전액 현금</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>자기자본</td>
              <td>{fmtKRW(initialInvestment)}</td>
              <td>{fmtKRW(allCashCompare.equity)}</td>
            </tr>
            <tr>
              <td>세전 수익</td>
              <td>{profitBeforeTax >= 0 ? '+' : ''}{fmtKRW(profitBeforeTax)}</td>
              <td>{allCashCompare.profit >= 0 ? '+' : ''}{fmtKRW(allCashCompare.profit)}</td>
            </tr>
            <tr className={styles.roeRow}>
              <td>자기자본 수익률 (ROE)</td>
              <td>
                {roe.toFixed(1)}%
                {leverageMultiplier > 1.05 && allCashCompare.roe > 0 && (
                  <span className={styles.leverageMultiplier}>×{leverageMultiplier.toFixed(1)}</span>
                )}
              </td>
              <td>{allCashCompare.roe.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>

        {loan > 0 && allCashCompare.roe > 0 && (
          <div className={styles.leverageNote}>
            💡 <strong>레버리지 효과</strong>: 대출을 활용하면 자기자본 대비 수익률이 약 <strong>{leverageMultiplier.toFixed(1)}배</strong> {roe > allCashCompare.roe ? '증가' : '감소'}합니다. 단, 부동산 가격 하락 시 손실도 동일한 비율로 확대되며, 금리 인상은 이자 부담을 키웁니다.
          </div>
        )}
      </div>

      {/* 월 환산 수익 */}
      <div className={styles.monthlyLine}>
        <span>{holdMonths}개월 기준 월 환산 세전 수익</span>
        <strong className={isLoss ? styles.lossText : ''}>
          약 {monthlyProfit >= 0 ? '' : ''}{fmtKRW(monthlyProfit)}/월
        </strong>
      </div>

      {/* 복사 버튼 */}
      <button
        type="button"
        className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
        onClick={handleCopy}
      >
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>

      {/* 면책 — 하단 재차 강조 */}
      <div className={styles.disclaimer}>
        <strong>📌 다시 한 번 안내</strong> — 본 결과는 양도소득세·종합부동산세·재산세·임대소득세를 포함하지 않습니다. 실제 세후 수익은 보유 기간·1주택 여부·장기보유특별공제·지역에 따라 크게 달라지므로 반드시 세무사·공인중개사와 상담하세요.
      </div>
    </div>
  )
}
