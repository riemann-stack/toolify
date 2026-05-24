'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo, useCallback } from 'react'
import styles from './stock.module.css'
import {
  KOREA_BROKER_FEES,
  KR_TRANSACTION_TAX_RATE,
  RECOVERY_DELTAS,
  recommendDCA,
  getConcentrationLevel,
  calcAverageDown,
  reverseCalcShares,
  simulateDCA,
  compareCutVsAvgDown,
  calcRecoveryScenarios,
  buildSliderCurve,
  formatEok,
  formatKRW,
  formatPct,
  parseAmount,
} from './stockUtils'

type TabId = 'main' | 'reverse' | 'dca' | 'recovery' | 'compare'

const PRICE_PRESETS = [10_000, 30_000, 50_000, 100_000]
const TARGET_AVG_DELTAS = [-2, -4, -6, -8, -10, -15, -20]   // 현재 평단 대비 %
const ALT_RETURN_PRESETS = [4, 7, 10]
const RECOVERY_PRESETS = [-20, -10, 0, 10, 20]

export default function StockClient() {
  const [tab, setTab] = useState<TabId>('main')

  /* ── 공통 기본 입력 ── */
  const [currentAvg,    setCurrentAvg]    = useState('50000')
  const [currentShares, setCurrentShares] = useState('100')
  const [currentPrice,  setCurrentPrice]  = useState('40000')
  const [brokerId,      setBrokerId]      = useState('kiwoom')
  const [customFee,     setCustomFee]     = useState('0.015')

  /* ── 미국 주식 ── */
  const [isUsStock,         setIsUsStock]         = useState(false)
  const [buyExchangeRate,   setBuyExchangeRate]   = useState('1300')
  const [curExchangeRate,   setCurExchangeRate]   = useState('1380')

  /* ── 종목 비중 ── */
  const [totalAssets, setTotalAssets] = useState('')   // 만원 (선택)

  /* ── 탭1: 메인 ── */
  const [inputMode, setInputMode] = useState<'shares' | 'amount' | 'slider'>('slider')
  const [addShares, setAddShares] = useState('25')
  const [addAmount, setAddAmount] = useState('200')   // 만원
  const [addPrice,  setAddPrice]  = useState('')      // 빈값이면 currentPrice 사용
  const [sliderAmount, setSliderAmount] = useState(200)  // 만원

  /* ── 탭2: 역산 ── */
  const [targetAvg, setTargetAvg] = useState('45000')

  /* ── 탭3: 분할 ── */
  type Tranche = { price: string; amount: string }
  const [tranches, setTranches] = useState<Tranche[]>([
    { price: '40000', amount: '100' },
    { price: '36000', amount: '100' },
    { price: '32000', amount: '100' },
  ])

  /* ── 탭4: 회복 (탭1 결과 사용) ── */
  const [targetRecoveryPrice, setTargetRecoveryPrice] = useState('')

  /* ── 탭5: 손절 vs 물타기 ── */
  const [additionalCash,     setAdditionalCash]     = useState('500')   // 만원
  const [alternativeReturn,  setAlternativeReturn]  = useState('7')
  const [recoveryAssumption, setRecoveryAssumption] = useState('48000') // 회복 가정 가격

  /* ── 파싱 ── */
  const cAvg     = parseAmount(currentAvg)
  const cShares  = parseAmount(currentShares)
  const cPrice   = parseAmount(currentPrice)
  const broker   = KOREA_BROKER_FEES.find(b => b.id === brokerId) ?? KOREA_BROKER_FEES[0]
  const feeRate  = brokerId === 'custom' ? parseAmount(customFee) : broker.rate
  const buyER    = parseAmount(buyExchangeRate) || 1300
  const curER    = parseAmount(curExchangeRate) || 1380
  const totalAssetsWon = parseAmount(totalAssets) * 10_000

  const validBase = cAvg > 0 && cShares > 0 && cPrice > 0

  /* ── 메인: 추가 매수 입력 모드별 수량 결정 ── */
  const slidMaxWon = useMemo(() => {
    // 슬라이더 최대값: 현재 보유 투자액의 2배 또는 최소 1000만 (원 단위)
    const baseInvestment = cAvg * cShares
    return Math.max(baseInvestment * 2, 10_000_000)
  }, [cAvg, cShares])

  const sliderAmountWon = sliderAmount * 10_000  // 만원 → 원
  const addPriceNum = parseAmount(addPrice) || cPrice

  const finalAddShares = useMemo(() => {
    if (inputMode === 'shares') return parseAmount(addShares)
    if (inputMode === 'amount') {
      const won = parseAmount(addAmount) * 10_000
      return Math.floor(won / addPriceNum)
    }
    // slider
    return Math.floor(sliderAmountWon / cPrice)
  }, [inputMode, addShares, addAmount, addPriceNum, sliderAmountWon, cPrice])

  const finalAddPrice = inputMode === 'shares' || inputMode === 'amount' ? addPriceNum : cPrice

  /* ── 탭1 메인 결과 ── */
  const mainResult = useMemo(() => {
    if (!validBase) return null
    return calcAverageDown({
      currentAvg: cAvg, currentShares: cShares, currentPrice: cPrice,
      addPrice: finalAddPrice, addShares: finalAddShares,
      feeRate,
      isUsStock,
      buyExchangeRate: isUsStock ? buyER : undefined,
      curExchangeRate: isUsStock ? curER : undefined,
    })
  }, [validBase, cAvg, cShares, cPrice, finalAddPrice, finalAddShares, feeRate, isUsStock, buyER, curER])

  /* ── 종목 비중 ── */
  const concentration = useMemo(() => {
    if (!mainResult || totalAssetsWon <= 0) return null
    const pct = (mainResult.totalInvestment / totalAssetsWon) * 100
    return { pct, level: getConcentrationLevel(pct) }
  }, [mainResult, totalAssetsWon])

  /* ── 손실률 ── */
  const baseLossPct = useMemo(() => {
    if (!validBase) return 0
    return ((cPrice - cAvg) / cAvg) * 100
  }, [validBase, cAvg, cPrice])

  const dcaReco = recommendDCA(baseLossPct)

  /* ── 탭2: 역산 ── */
  const reverseResult = useMemo(() => {
    if (!validBase) return null
    return reverseCalcShares({
      currentAvg: cAvg, currentShares: cShares, currentPrice: cPrice,
      targetAvg: parseAmount(targetAvg),
    })
  }, [validBase, cAvg, cShares, cPrice, targetAvg])

  /* 역산 시나리오 표 (다양한 목표 평단) */
  const reverseScenarios = useMemo(() => {
    if (!validBase) return []
    return TARGET_AVG_DELTAS.map(deltaPct => {
      const target = cAvg * (1 + deltaPct / 100)
      const r = reverseCalcShares({
        currentAvg: cAvg, currentShares: cShares, currentPrice: cPrice, targetAvg: target,
      })
      return { deltaPct, target, ...r }
    })
  }, [validBase, cAvg, cShares, cPrice])

  /* ── 탭3: 분할 매수 ── */
  const dcaResult = useMemo(() => {
    if (!validBase) return []
    const ts = tranches
      .map(t => ({ price: parseAmount(t.price), amount: parseAmount(t.amount) * 10_000 }))
      .filter(t => t.price > 0 && t.amount > 0)
    if (ts.length === 0) return []
    return simulateDCA({ avg: cAvg, shares: cShares }, ts, feeRate)
  }, [validBase, cAvg, cShares, tranches, feeRate])

  const dcaFinal = dcaResult[dcaResult.length - 1]

  /* DCA 후 회복 시나리오 (탭3) */
  const dcaRecovery = useMemo(() => {
    if (!dcaFinal) return []
    return calcRecoveryScenarios(
      dcaFinal.cumulativeAvg, dcaFinal.cumulativeShares, cPrice, dcaFinal.cumulativeInvestment,
    )
  }, [dcaFinal, cPrice])

  /* ── 탭4: 회복 시나리오 (메인 결과 사용) ── */
  const recoveryRows = useMemo(() => {
    if (!mainResult) return []
    return calcRecoveryScenarios(
      mainResult.newAvg, mainResult.newShares, cPrice, mainResult.totalInvestment,
    )
  }, [mainResult, cPrice])

  const targetRecoveryRow = useMemo(() => {
    if (!mainResult) return null
    const t = parseAmount(targetRecoveryPrice)
    if (t <= 0) return null
    const value = t * mainResult.newShares
    const pl = value - mainResult.totalInvestment
    const roi = mainResult.totalInvestment > 0 ? (pl / mainResult.totalInvestment) * 100 : 0
    return { price: t, value, pl, roi }
  }, [mainResult, targetRecoveryPrice])

  /* ── 탭5: 손절 vs 물타기 ── */
  const compareResult = useMemo(() => {
    if (!validBase) return null
    return compareCutVsAvgDown({
      currentAvg: cAvg, currentShares: cShares, currentPrice: cPrice,
      additionalCash: parseAmount(additionalCash) * 10_000,
      alternativeReturn: parseAmount(alternativeReturn),
      recoveryAssumption: parseAmount(recoveryAssumption),
      feeRate,
    })
  }, [validBase, cAvg, cShares, cPrice, additionalCash, alternativeReturn, recoveryAssumption, feeRate])

  /* ── 슬라이더 곡선 (탭1) ── */
  const sliderCurve = useMemo(() => {
    if (!validBase) return []
    return buildSliderCurve(
      { currentAvg: cAvg, currentShares: cShares, currentPrice: cPrice, feeRate },
      slidMaxWon, 50,
    )
  }, [validBase, cAvg, cShares, cPrice, feeRate, slidMaxWon])

  /* ── 차트: 추가 매수 금액별 평단가 변화 ── */
  const renderSliderChart = useCallback(() => {
    if (sliderCurve.length === 0) return null
    const W = 600, H = 220, P = 36
    const minAvg = Math.min(...sliderCurve.map(p => p.newAvg))
    const maxAvg = Math.max(...sliderCurve.map(p => p.newAvg))
    const yRange = maxAvg - minAvg || 1
    const xs = (i: number) => P + (W - P * 2) * (i / (sliderCurve.length - 1))
    const ys = (v: number) => H - P - (H - P * 1.6) * ((v - minAvg) / yRange)

    const path = sliderCurve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(p.newAvg)}`).join(' ')

    // 현재 슬라이더 위치
    const curIdx = Math.round((sliderAmountWon / slidMaxWon) * (sliderCurve.length - 1))
    const curPoint = sliderCurve[Math.min(curIdx, sliderCurve.length - 1)]

    return (
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={P} x2={W - P} y1={ys(minAvg + yRange * t)} y2={ys(minAvg + yRange * t)}
            stroke="var(--border)" strokeDasharray="3 3" />
        ))}
        {/* 현재가 가로선 */}
        {cPrice >= minAvg && cPrice <= maxAvg && (
          <line x1={P} x2={W - P} y1={ys(cPrice)} y2={ys(cPrice)}
            stroke="#EA580C" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {/* 핀 */}
        {curPoint && (
          <>
            <circle cx={xs(curIdx)} cy={ys(curPoint.newAvg)} r="6" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
            <text x={xs(curIdx)} y={ys(curPoint.newAvg) - 12} textAnchor="middle" fill="var(--accent)"
              fontSize="11" fontFamily="Inter, system-ui, sans-serif" fontWeight="800">
              {formatKRW(curPoint.newAvg)}원
            </text>
          </>
        )}
        {/* x축 레이블 */}
        <text x={P} y={H - 8} fill="var(--muted)" fontSize="10" fontFamily="Noto Sans KR, sans-serif">0</text>
        <text x={W / 2} y={H - 8} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="Noto Sans KR, sans-serif">
          {formatEok(slidMaxWon / 2)}
        </text>
        <text x={W - P} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="Noto Sans KR, sans-serif">
          {formatEok(slidMaxWon)}
        </text>
      </svg>
    )
  }, [sliderCurve, sliderAmountWon, slidMaxWon, cPrice])

  /* ── 차트: 분할 매수 차수별 평단 변화 ── */
  const renderDCAChart = useCallback(() => {
    if (dcaResult.length < 2) return null
    const W = 600, H = 220, P = 36
    const allVals = [...dcaResult.map(d => d.cumulativeAvg), ...dcaResult.map(d => d.price)]
    const minY = Math.min(...allVals) * 0.95
    const maxY = Math.max(...allVals) * 1.05
    const xs = (i: number) => P + (W - P * 2) * (i / (dcaResult.length - 1 || 1))
    const ys = (v: number) => H - P - (H - P * 1.6) * ((v - minY) / (maxY - minY))

    const avgPath = dcaResult.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(d.cumulativeAvg)}`).join(' ')

    return (
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={P} x2={W - P} y1={ys(minY + (maxY - minY) * t)} y2={ys(minY + (maxY - minY) * t)}
            stroke="var(--border)" strokeDasharray="3 3" />
        ))}
        {cPrice >= minY && cPrice <= maxY && (
          <line x1={P} x2={W - P} y1={ys(cPrice)} y2={ys(cPrice)}
            stroke="#EA580C" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        <path d={avgPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {dcaResult.map((d, i) => (
          <g key={i}>
            <circle cx={xs(i)} cy={ys(d.price)} r="4" fill="#0891B2" />
            <circle cx={xs(i)} cy={ys(d.cumulativeAvg)} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5" />
            <text x={xs(i)} y={H - 8} textAnchor="middle" fill="var(--muted)" fontSize="10"
              fontFamily="Noto Sans KR, sans-serif">{i === 0 ? '초기' : `${i}차`}</text>
          </g>
        ))}
      </svg>
    )
  }, [dcaResult, cPrice])

  /* ── 차트: 회복 시나리오 곡선 ── */
  const renderRecoveryChart = useCallback(() => {
    if (recoveryRows.length === 0) return null
    const W = 600, H = 220, P = 36
    const minY = Math.min(...recoveryRows.map(r => r.roi)) - 5
    const maxY = Math.max(...recoveryRows.map(r => r.roi)) + 5
    const xs = (i: number) => P + (W - P * 2) * (i / (recoveryRows.length - 1))
    const ys = (v: number) => H - P - (H - P * 1.6) * ((v - minY) / (maxY - minY))

    const path = recoveryRows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(r.roi)}`).join(' ')

    return (
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={P} x2={W - P} y1={ys(minY + (maxY - minY) * t)} y2={ys(minY + (maxY - minY) * t)}
            stroke="var(--border)" strokeDasharray="3 3" />
        ))}
        {/* 0% 라인 */}
        {0 >= minY && 0 <= maxY && (
          <line x1={P} x2={W - P} y1={ys(0)} y2={ys(0)}
            stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        <path d={path} fill="none" stroke="#EA580C" strokeWidth="2.5" />
        {recoveryRows.map((r, i) => (
          <g key={i}>
            <circle cx={xs(i)} cy={ys(r.roi)} r="4"
              fill={r.roi >= 0 ? '#059669' : '#DC2626'} />
            {(r.delta === 0 || r.delta === RECOVERY_DELTAS[RECOVERY_DELTAS.length - 1]) && (
              <text x={xs(i)} y={H - 8} textAnchor="middle" fill="var(--muted)"
                fontSize="10" fontFamily="Noto Sans KR, sans-serif">
                {r.delta > 0 ? `+${r.delta}%` : `${r.delta}%`}
              </text>
            )}
          </g>
        ))}
      </svg>
    )
  }, [recoveryRows])

  const sellAllFee = `매수 ${feeRate}% + 매도 ${feeRate}% + 거래세 ${KR_TRANSACTION_TAX_RATE * 100}%`

  /* ──────────── RENDER ──────────── */
  return (
    <div className={styles.wrap}>

      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '한국거래소 KRX', href: 'https://www.krx.co.kr' },
          { label: '금융감독원 전자공시 DART', href: 'https://dart.fss.or.kr' },
        ]}
      >
        투자 자문 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {[
          { id: 'main',     label: '물타기 계산', cls: styles.tabActive },
          { id: 'reverse',  label: '목표 역산',   cls: styles.tabActiveReverse },
          { id: 'dca',      label: '분할 매수',   cls: styles.tabActiveDCA },
          { id: 'recovery', label: '회복 시나리오', cls: styles.tabActiveRecovery },
          { id: 'compare',  label: '손절 vs 물타기', cls: styles.tabActiveCompare },
        ].map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* 공통 기본 입력 */}
      <div className={styles.threeCol}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>기존 평단가</div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={currentAvg} onChange={e => setCurrentAvg(e.target.value)} />
            <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>보유 수량</div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={currentShares} onChange={e => setCurrentShares(e.target.value)} />
            <span className={styles.unit}>주</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>현재 주가</div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} />
            <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
          </div>
          <div className={styles.chips}>
            {PRICE_PRESETS.map(p => (
              <button key={p}
                className={`${styles.chip} ${currentPrice === String(p) ? styles.chipActive : ''}`}
                onClick={() => setCurrentPrice(String(p))}
              >{(p / 1000).toLocaleString()}천</button>
            ))}
          </div>
        </div>
      </div>

      {/* 손실률 표시 + 분할 추천 */}
      {validBase && (
        <div className={`${styles.infoBox}`}>
          <strong>현재 손실률 {formatPct(baseLossPct)}</strong> · {dcaReco.desc}
        </div>
      )}

      {/* 증권사 + 미국주식 토글 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>증권사 / 시장</div>
        <div className={styles.optionRow5}>
          {KOREA_BROKER_FEES.slice(0, 8).map(b => (
            <button key={b.id}
              className={`${styles.optionBtn} ${brokerId === b.id ? styles.optionActive : ''}`}
              onClick={() => setBrokerId(b.id)}
            >{b.name}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>{b.rate}%</span></button>
          ))}
          <button
            className={`${styles.optionBtn} ${brokerId === 'custom' ? styles.optionActive : ''}`}
            onClick={() => setBrokerId('custom')}
          >직접 입력</button>
        </div>
        {brokerId === 'custom' && (
          <div className={styles.inputRow} style={{ marginTop: 10 }}>
            <input className={styles.numInput} type="number" inputMode="decimal" step={0.001}
              value={customFee} onChange={e => setCustomFee(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
        )}
        <div className={styles.toggleRow} style={{ marginTop: 12 }}>
          <button
            className={`${styles.toggleBtn} ${!isUsStock ? styles.toggleActive : ''}`}
            onClick={() => setIsUsStock(false)}
          >🇰🇷 한국 주식 (거래세 0.18%)</button>
          <button
            className={`${styles.toggleBtn} ${isUsStock ? styles.toggleActive : ''}`}
            onClick={() => setIsUsStock(true)}
          >🇺🇸 미국 주식 (환율 + 양도세)</button>
        </div>
        {isUsStock && (
          <div className={styles.twoCol} style={{ marginTop: 10 }}>
            <div>
              <div className={styles.cardLabel}>매수 시 환율</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={buyExchangeRate} onChange={e => setBuyExchangeRate(e.target.value)} />
                <span className={styles.unit}>원/$</span>
              </div>
            </div>
            <div>
              <div className={styles.cardLabel}>현재 환율</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={curExchangeRate} onChange={e => setCurExchangeRate(e.target.value)} />
                <span className={styles.unit}>원/$</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ──────────── TAB 1: 메인 ──────────── */}
      {tab === 'main' && (
        <>
          {/* 입력 모드 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>추가 매수 입력 방식</div>
            <div className={styles.optionRow3}>
              <button className={`${styles.optionBtn} ${inputMode === 'slider' ? styles.optionActive : ''}`}
                onClick={() => setInputMode('slider')}>🎚️ 슬라이더</button>
              <button className={`${styles.optionBtn} ${inputMode === 'shares' ? styles.optionActive : ''}`}
                onClick={() => setInputMode('shares')}>📊 수량 기준</button>
              <button className={`${styles.optionBtn} ${inputMode === 'amount' ? styles.optionActive : ''}`}
                onClick={() => setInputMode('amount')}>💴 금액 기준</button>
            </div>

            {inputMode === 'slider' && validBase && (
              <div style={{ marginTop: 14 }}>
                <div className={styles.sliderRow}>
                  <input type="range" className={styles.slider}
                    min={0} max={Math.round(slidMaxWon / 10_000)} step={10}
                    value={sliderAmount} onChange={e => setSliderAmount(parseInt(e.target.value))} />
                  <span className={styles.sliderVal}>{formatEok(sliderAmount * 10_000)}</span>
                </div>
                <div className={styles.cardLabelHint} style={{ marginTop: 6 }}>
                  추가 매수 금액 = {formatEok(sliderAmountWon)} · 매수 가능 {finalAddShares.toLocaleString()}주
                </div>
              </div>
            )}

            {inputMode === 'shares' && (
              <div className={styles.twoCol} style={{ marginTop: 14 }}>
                <div>
                  <div className={styles.cardLabel}>추가 매수가</div>
                  <div className={styles.inputRow}>
                    <input className={styles.numInput} type="number" inputMode="numeric"
                      placeholder={String(cPrice)}
                      value={addPrice} onChange={e => setAddPrice(e.target.value)} />
                    <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
                  </div>
                </div>
                <div>
                  <div className={styles.cardLabel}>추가 매수 수량</div>
                  <div className={styles.inputRow}>
                    <input className={styles.numInput} type="number" inputMode="numeric"
                      value={addShares} onChange={e => setAddShares(e.target.value)} />
                    <span className={styles.unit}>주</span>
                  </div>
                </div>
              </div>
            )}

            {inputMode === 'amount' && (
              <div className={styles.twoCol} style={{ marginTop: 14 }}>
                <div>
                  <div className={styles.cardLabel}>추가 매수가</div>
                  <div className={styles.inputRow}>
                    <input className={styles.numInput} type="number" inputMode="numeric"
                      placeholder={String(cPrice)}
                      value={addPrice} onChange={e => setAddPrice(e.target.value)} />
                    <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
                  </div>
                </div>
                <div>
                  <div className={styles.cardLabel}>매수 금액 (만원)</div>
                  <div className={styles.inputRow}>
                    <input className={styles.numInput} type="number" inputMode="numeric"
                      value={addAmount} onChange={e => setAddAmount(e.target.value)} />
                    <span className={styles.unit}>만원</span>
                  </div>
                </div>
                {validBase && finalAddShares > 0 && (
                  <div className={styles.cardLabelHint} style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    매수 가능: {finalAddShares.toLocaleString()}주 · 잔액 {formatKRW(parseAmount(addAmount) * 10_000 - finalAddShares * addPriceNum)}원
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 결과 */}
          {mainResult && finalAddShares > 0 ? (
            <>
              {/* 히어로 */}
              <div className={`${styles.hero} ${styles.heroAccent}`}>
                <div className={styles.heroLabel}>물타기 후 새 평단가</div>
                <div className={`${styles.heroNum} ${styles.heroNumAccent}`}>
                  {formatKRW(mainResult.newAvg)}{isUsStock ? '$' : '원'}
                </div>
                <div className={styles.heroSub}>
                  보유 {mainResult.newShares.toLocaleString()}주 · 총 투자 {formatEok(mainResult.totalInvestment)}
                </div>
                <div className={styles.rateBadge}>
                  본전까지 {formatPct(mainResult.breakEvenRise)} 상승 필요
                </div>
              </div>

              {/* 4-카드 실시간 통계 */}
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>새 평단가</div>
                  <div className={`${styles.statValue} ${styles.statValueAccent}`}>{formatKRW(mainResult.newAvg)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>본전 상승률</div>
                  <div className={`${styles.statValue} ${mainResult.breakEvenRise <= 10 ? styles.statValueGreen : styles.statValueRed}`}>
                    {formatPct(mainResult.breakEvenRise)}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>총 투자금</div>
                  <div className={styles.statValue}>{formatEok(mainResult.totalInvestment)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>현재 손실률</div>
                  <div className={`${styles.statValue} ${mainResult.unrealizedROI >= 0 ? styles.statValueGreen : styles.statValueRed}`}>
                    {formatPct(mainResult.unrealizedROI)}
                  </div>
                </div>
              </div>

              {/* Before vs After 표 */}
              <div className={styles.card}>
                <div className={styles.cardLabel}>Before vs After</div>
                <div className={styles.compareTable}>
                  <div className={styles.compareTableHead}>
                    <span>항목</span><span>물타기 전</span><span>물타기 후</span>
                  </div>
                  {[
                    ['평균단가', `${formatKRW(cAvg)}${isUsStock ? '$' : '원'}`, `${formatKRW(mainResult.newAvg)}${isUsStock ? '$' : '원'}`, false],
                    ['보유 수량', `${cShares.toLocaleString()}주`, `${mainResult.newShares.toLocaleString()}주`, false],
                    ['총 투자금', formatEok(cAvg * cShares * (1 + feeRate / 100)), formatEok(mainResult.totalInvestment), false],
                    ['평가액',   formatEok(cPrice * cShares),   formatEok(mainResult.currentValue), false],
                    ['미실현 손익', formatEok(cPrice * cShares - cAvg * cShares * (1 + feeRate / 100)), formatEok(mainResult.unrealizedPL), true],
                    ['손익률', formatPct(mainResult.beforeROI), formatPct(mainResult.unrealizedROI), false],
                    ['본전 가격', `${formatKRW(cAvg / (1 - (feeRate/100 + KR_TRANSACTION_TAX_RATE)))}${isUsStock ? '$' : '원'}`, `${formatKRW(mainResult.breakEvenPrice)}${isUsStock ? '$' : '원'}`, false],
                    ['본전 필요 상승', formatPct(((cAvg / (1 - (feeRate/100 + KR_TRANSACTION_TAX_RATE))) / cPrice - 1) * 100), formatPct(mainResult.breakEvenRise), true],
                  ].map(([label, before, after, key], i) => (
                    <div key={i} className={`${styles.compareTableRow} ${key ? styles.compareRowKey : ''}`}>
                      <span>{label}</span>
                      <span>{before}</span>
                      <span>{after}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 슬라이더 곡선 차트 (모드와 무관 — 항상 표시) */}
              {validBase && sliderCurve.length > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardLabel}>추가 매수 금액별 새 평단가</div>
                  <div className={styles.chartWrap}>{renderSliderChart()}</div>
                  <div className={styles.chartLegend}>
                    <span><i style={{ background: 'var(--accent)' }} />새 평단가</span>
                    <span><i style={{ background: '#EA580C' }} />현재 주가</span>
                  </div>
                </div>
              )}

              {/* 미국 주식 환율 영향 */}
              {isUsStock && mainResult.krwTotalInvestment !== undefined && (
                <div className={styles.card}>
                  <div className={styles.cardLabel}>원화 환산 (환율 반영)</div>
                  <div className={styles.statGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>매수 환율</div>
                      <div className={styles.statValue}>{buyER.toLocaleString()}원</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>현재 환율</div>
                      <div className={styles.statValue}>{curER.toLocaleString()}원</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>원화 평가액</div>
                      <div className={`${styles.statValue} ${styles.statValueAccent}`}>{formatEok(mainResult.krwCurrentValue ?? 0)}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>원화 손익</div>
                      <div className={`${styles.statValue} ${(mainResult.krwUnrealizedPL ?? 0) >= 0 ? styles.statValueGreen : styles.statValueRed}`}>
                        {formatEok(mainResult.krwUnrealizedPL ?? 0)}
                      </div>
                    </div>
                  </div>
                  <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
                    ※ 매도 시 양도세 22% (연 250만 공제 후) 추가. 양도세는 미반영.
                  </p>
                </div>
              )}

              {/* 종목 비중 */}
              <div className={styles.card}>
                <div className={styles.cardLabel}>📊 종목 비중 점검 (선택)</div>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="numeric"
                    placeholder="총 자산 (만원)" value={totalAssets}
                    onChange={e => setTotalAssets(e.target.value)} />
                  <span className={styles.unit}>만원</span>
                </div>
                {concentration && (
                  <>
                    <div className={styles.concBadge}
                      style={{ background: `${concentration.level.color}1A`, color: concentration.level.color, border: `1px solid ${concentration.level.color}55` }}>
                      {concentration.level.label} · 이 종목 {concentration.pct.toFixed(1)}%
                    </div>
                    <div className={styles.concNote}>{concentration.level.note}</div>
                  </>
                )}
              </div>

              {/* 빠른 이동 */}
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn} onClick={() => setTab('reverse')}>🎯 목표 평단 역산</button>
                <button className={styles.actionBtn} onClick={() => setTab('dca')}>📊 분할 매수</button>
                <button className={styles.actionBtn} onClick={() => setTab('recovery')}>📈 회복 시나리오</button>
                <button className={styles.actionBtn} onClick={() => setTab('compare')}>⚖️ 손절 vs 물타기</button>
              </div>
            </>
          ) : !validBase ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>입력값을 확인해주세요</p>
              <p>평단가·보유 수량·현재 주가가 모두 0보다 커야 합니다.</p>
            </div>
          ) : (
            <div className={styles.empty}>
              <p>추가 매수 수량/금액을 입력하면 결과가 표시됩니다.</p>
            </div>
          )}

          {/* 위험 경고 */}
          {validBase && baseLossPct <= -50 && (
            <div className={styles.riskCard}>
              <strong>⚠️ -50% 이상 큰 손실 + 물타기 = 위험</strong>
              <ul>
                <li>회사 펀더멘털 재점검 (실적·재무·산업)</li>
                <li>한 종목 비중 확인 (자산의 X%)</li>
                <li>회복 가능성 평가 — 「손절 vs 물타기」 탭 참고</li>
                <li>가족·전문가 상담 권장</li>
                <li>큰 손실로 인한 정신적 어려움 시: 한국 정신건강 위기상담 <strong>1577-0199</strong></li>
              </ul>
            </div>
          )}
          {concentration && concentration.pct >= 30 && (
            <div className={styles.riskCard}>
              <strong>⚠️ 한 종목에 자산 30% 이상 집중</strong>
              <ul>
                <li>물타기로 비중이 더 커지면 분산 효과 ↓ · 리스크 ↑</li>
                <li>분산 투자 권장 (한 종목 10~20% 이내)</li>
                <li>손절 검토 또는 포트폴리오 재구성 고려</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 목표 평단 역산 ──────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>목표 평단가</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                value={targetAvg} onChange={e => setTargetAvg(e.target.value)} />
              <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
            </div>
            <div className={styles.chips}>
              {[-2, -4, -6, -8, -10, -15, -20].map(d => {
                const v = Math.round(cAvg * (1 + d / 100))
                return (
                  <button key={d}
                    className={`${styles.chip} ${parseAmount(targetAvg) === v ? styles.chipActive : ''}`}
                    onClick={() => setTargetAvg(String(v))}
                  >{d}%</button>
                )
              })}
            </div>
          </div>

          {reverseResult && reverseResult.reasonable && reverseResult.requiredShares !== null && (
            <div className={`${styles.hero} ${styles.heroGold}`}>
              <div className={styles.heroLabel}>평단 {formatKRW(parseAmount(targetAvg))}원 만들려면</div>
              <div className={`${styles.heroNum} ${styles.heroNumGold}`}>
                {reverseResult.requiredShares.toLocaleString()}주 추가
              </div>
              <div className={styles.heroSub}>
                필요 자금 약 {formatEok(reverseResult.requiredAmount ?? 0)}
              </div>
              <div className={styles.rateBadge} style={{ background: 'rgba(202,138,4,0.10)', color: '#CA8A04', borderColor: 'rgba(202,138,4,0.40)' }}>
                추가 후 본전까지 {formatPct(reverseResult.breakEvenRiseAfter ?? 0)} 상승 필요
              </div>
            </div>
          )}

          {reverseResult && !reverseResult.reasonable && (
            <div className={styles.warnBox}><strong>⚠️</strong> {reverseResult.warning}</div>
          )}

          {reverseResult && reverseResult.reasonable && reverseResult.requiredShares !== null && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>상세</div>
              <div className={styles.compareTable}>
                <div className={styles.compareTableHead}>
                  <span>항목</span><span></span><span>값</span>
                </div>
                {[
                  ['현재 평단가', '', `${formatKRW(cAvg)}${isUsStock ? '$' : '원'}`],
                  ['보유 수량', '', `${cShares.toLocaleString()}주`],
                  ['현재 주가', '', `${formatKRW(cPrice)}${isUsStock ? '$' : '원'}`],
                  ['목표 평단가', '', `${formatKRW(parseAmount(targetAvg))}${isUsStock ? '$' : '원'}`],
                  ['필요 추가 수량', '', `${reverseResult.requiredShares.toLocaleString()}주`],
                  ['필요 추가 금액', '', formatEok(reverseResult.requiredAmount ?? 0)],
                  ['추가 후 총 수량', '', `${(reverseResult.totalSharesAfter ?? 0).toLocaleString()}주`],
                  ['추가 후 총 투자금', '', formatEok(reverseResult.totalInvestmentAfter ?? 0)],
                ].map((row, i) => (
                  <div key={i} className={styles.compareTableRow}>
                    <span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 시나리오 표 */}
          {validBase && reverseScenarios.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>다양한 목표 평단 비교</div>
              <div className={styles.compareTable}>
                <div className={styles.compareTableHead}>
                  <span>목표 평단</span><span>필요 수량</span><span>필요 금액</span>
                </div>
                {reverseScenarios.map((s, i) => {
                  const isCurrent = Math.abs(s.target - parseAmount(targetAvg)) < 100
                  return (
                    <div key={i} className={`${styles.compareTableRow} ${isCurrent ? styles.compareRowKey : ''}`}>
                      <span>{formatKRW(s.target)}원 ({s.deltaPct}%){isCurrent && ' ⭐'}</span>
                      <span>{s.reasonable && s.requiredShares !== null ? `${s.requiredShares.toLocaleString()}주` : '—'}</span>
                      <span>{s.reasonable && s.requiredAmount !== null ? formatEok(s.requiredAmount) : '—'}</span>
                    </div>
                  )
                })}
              </div>
              <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
                ※ 목표 평단이 현재가에 가까울수록 필요 수량은 기하급수적으로 증가합니다.
              </p>
            </div>
          )}

          <div className={styles.warnBox}>
            <strong>⚠️</strong> 평단을 현재가에 가깝게 낮추려면 매수량이 기하급수적으로 증가합니다.
            무리한 평단 낮추기는 한 종목 비중을 위험하게 키울 수 있으며, 주가가 더 떨어지면 손실이 커집니다.
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 분할 매수 ──────────── */}
      {tab === 'dca' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>분할 매수 차수 ({tranches.length}차)</div>
            {tranches.map((t, i) => (
              <div key={i} className={styles.trancheRow}>
                <span className={styles.trancheLabel}>{i + 1}차</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="numeric"
                    placeholder="매수가" value={t.price}
                    onChange={e => {
                      const next = [...tranches]; next[i] = { ...next[i], price: e.target.value }; setTranches(next)
                    }} />
                  <span className={styles.unit}>원</span>
                </div>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="numeric"
                    placeholder="금액 (만원)" value={t.amount}
                    onChange={e => {
                      const next = [...tranches]; next[i] = { ...next[i], amount: e.target.value }; setTranches(next)
                    }} />
                  <span className={styles.unit}>만원</span>
                </div>
              </div>
            ))}
            <div className={styles.trancheControls}>
              <button onClick={() => setTranches([...tranches, { price: String(cPrice), amount: '100' }])}
                disabled={tranches.length >= 5}>+ 차수 추가</button>
              <button onClick={() => setTranches(tranches.slice(0, -1))}
                disabled={tranches.length <= 1}>− 차수 제거</button>
              <button onClick={() => {
                // 자동 입력: 현재가 기준 -10/-20/-30, 동일 100만씩 (3차 권장)
                const n = dcaReco.tranches
                const next: Tranche[] = []
                for (let k = 1; k <= Math.max(2, Math.min(n, 5)); k++) {
                  const p = Math.round(cPrice * (1 - 0.1 * k))
                  next.push({ price: String(Math.max(p, 1000)), amount: '100' })
                }
                setTranches(next)
              }}>🤖 자동 입력 ({dcaReco.tranches}차)</button>
            </div>
          </div>

          {dcaResult.length > 1 && dcaFinal && (
            <>
              <div className={`${styles.hero} ${styles.heroCyan}`}>
                <div className={styles.heroLabel}>{dcaResult.length - 1}차 분할 매수 후</div>
                <div className={`${styles.heroNum} ${styles.heroNumCyan}`}>
                  {formatKRW(dcaFinal.cumulativeAvg)}원
                </div>
                <div className={styles.heroSub}>
                  총 {dcaFinal.cumulativeShares.toLocaleString()}주 · 투자 {formatEok(dcaFinal.cumulativeInvestment)}
                </div>
                <div className={styles.rateBadge} style={{ background: 'rgba(8,145,178,0.10)', color: '#0891B2', borderColor: 'rgba(8,145,178,0.40)' }}>
                  평단 {formatKRW(cAvg)} → {formatKRW(dcaFinal.cumulativeAvg)} ({formatPct((dcaFinal.cumulativeAvg / cAvg - 1) * 100)})
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>차수별 평단가 변화</div>
                <div className={styles.chartWrap}>{renderDCAChart()}</div>
                <div className={styles.chartLegend}>
                  <span><i style={{ background: 'var(--accent)' }} />누적 평단가</span>
                  <span><i style={{ background: '#0891B2' }} />차수별 매수가</span>
                  <span><i style={{ background: '#EA580C' }} />현재 주가</span>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>차수별 상세</div>
                <div className={styles.scheduleHead}>
                  <span>차수</span><span>매수가</span><span>금액</span><span>수량</span>
                  <span>누적 수량</span><span>평단</span><span>수익률</span>
                </div>
                <div className={styles.scheduleBody}>
                  {dcaResult.map(d => (
                    <div key={d.tranche} className={styles.scheduleRow}>
                      <span>{d.tranche === 0 ? '초기' : `${d.tranche}차`}</span>
                      <span>{formatKRW(d.price)}</span>
                      <span>{formatEok(d.amount)}</span>
                      <span>{d.shares.toLocaleString()}</span>
                      <span>{d.cumulativeShares.toLocaleString()}</span>
                      <span style={{ color: 'var(--accent)' }}>{formatKRW(d.cumulativeAvg)}</span>
                      <span style={{ color: d.unrealizedROI >= 0 ? '#059669' : '#DC2626' }}>{formatPct(d.unrealizedROI)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>분할 매수 후 — 현재가별 수익률</div>
                <div className={styles.recoveryTable}>
                  <div className={`${styles.recoveryRow} ${styles.headerRow}`}>
                    <span>등락</span><span>주가</span><span>수익률</span><span>평가액</span><span>손익</span>
                  </div>
                  {dcaRecovery.map(r => (
                    <div key={r.delta} className={`${styles.recoveryRow} ${r.delta === 0 ? styles.recoveryRowCurrent : ''}`}>
                      <span className={`${styles.recoveryDelta} ${r.delta > 0 ? styles.deltaPos : (r.delta < 0 ? styles.deltaNeg : styles.deltaZero)}`}>
                        {r.delta > 0 ? `+${r.delta}%` : `${r.delta}%`}
                      </span>
                      <span>{formatKRW(r.price)}</span>
                      <span style={{ color: r.roi >= 0 ? '#059669' : '#DC2626' }}>{formatPct(r.roi)}</span>
                      <span>{formatEok(r.value)}</span>
                      <span style={{ color: r.pl >= 0 ? '#059669' : '#DC2626' }}>{formatEok(r.pl)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.warnBox}>
                <strong>⚠️ 분할 매수가 만능이 아닙니다.</strong> 주가가 계속 떨어지면 손실 누적이 더 커집니다.
                펀더멘털 확인 + 손절선 설정 후 진행하세요. 분할 매수의 본질은 「추가 하락에 대비」이지
                「수익 보장」이 아닙니다.
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 4: 회복 시나리오 ──────────── */}
      {tab === 'recovery' && mainResult && (
        <>
          <div className={`${styles.hero} ${styles.heroOrange}`}>
            <div className={styles.heroLabel}>본전까지 필요 상승</div>
            <div className={`${styles.heroNum} ${styles.heroNumOrange}`}>
              {formatPct(mainResult.breakEvenRise)}
            </div>
            <div className={styles.heroSub}>
              새 평단 {formatKRW(mainResult.newAvg)}원 · 본전 가격 {formatKRW(mainResult.breakEvenPrice)}원
            </div>
            <div className={styles.heroDesc}>
              {sellAllFee} 모두 회수해야 진짜 본전
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>주가별 수익률 곡선</div>
            <div className={styles.chartWrap}>{renderRecoveryChart()}</div>
            <div className={styles.chartLegend}>
              <span><i style={{ background: '#EA580C' }} />수익률</span>
              <span><i style={{ background: 'var(--accent)' }} />0% (본전 라인)</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>회복 시나리오 표</div>
            <div className={styles.recoveryTable}>
              <div className={`${styles.recoveryRow} ${styles.headerRow}`}>
                <span>등락</span><span>주가</span><span>수익률</span><span>평가액</span><span>손익</span>
              </div>
              {recoveryRows.map(r => {
                const isBE = Math.abs(r.roi) < 1
                return (
                  <div key={r.delta}
                    className={`${styles.recoveryRow} ${r.delta === 0 ? styles.recoveryRowCurrent : ''} ${isBE ? styles.recoveryRowBE : ''}`}>
                    <span className={`${styles.recoveryDelta} ${r.delta > 0 ? styles.deltaPos : (r.delta < 0 ? styles.deltaNeg : styles.deltaZero)}`}>
                      {r.delta > 0 ? `+${r.delta}%` : `${r.delta}%`}
                    </span>
                    <span>{formatKRW(r.price)}</span>
                    <span style={{ color: r.roi >= 0 ? '#059669' : '#DC2626' }}>{formatPct(r.roi)}</span>
                    <span>{formatEok(r.value)}</span>
                    <span style={{ color: r.pl >= 0 ? '#059669' : '#DC2626' }}>{formatEok(r.pl)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>직접 목표 주가 입력</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                placeholder="목표 주가" value={targetRecoveryPrice}
                onChange={e => setTargetRecoveryPrice(e.target.value)} />
              <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
            </div>
            {targetRecoveryRow && (
              <div className={styles.statGrid} style={{ marginTop: 12 }}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>평가액</div>
                  <div className={`${styles.statValue} ${styles.statValueAccent}`}>{formatEok(targetRecoveryRow.value)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>손익</div>
                  <div className={`${styles.statValue} ${targetRecoveryRow.pl >= 0 ? styles.statValueGreen : styles.statValueRed}`}>
                    {formatEok(targetRecoveryRow.pl)}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>수익률</div>
                  <div className={`${styles.statValue} ${targetRecoveryRow.roi >= 0 ? styles.statValueGreen : styles.statValueRed}`}>
                    {formatPct(targetRecoveryRow.roi)}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>현재가 대비</div>
                  <div className={styles.statValue}>{formatPct((targetRecoveryRow.price / cPrice - 1) * 100)}</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.warnBox}>
            <strong>⚠️ 시나리오는 가정이며 실제 주가 회복 보장 X.</strong>
            한국 주식 특성상 3년 이상 본전 회복 못 한 종목 다수.
            손실이 -30% 이상이면 손절 검토 권장 (탭 5).
          </div>
        </>
      )}

      {tab === 'recovery' && !mainResult && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>먼저 「물타기 계산」 탭에서 추가 매수를 입력해주세요.</p>
          <p>회복 시나리오는 물타기 후 새 평단·총 보유를 기준으로 계산됩니다.</p>
        </div>
      )}

      {/* ──────────── TAB 5: 손절 vs 물타기 ──────────── */}
      {tab === 'compare' && (
        <>
          <div className={styles.threeCol}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>추가 가능 현금</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={additionalCash} onChange={e => setAdditionalCash(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>대안 투자 예상 수익률 (1년)</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="decimal" step={0.5}
                  value={alternativeReturn} onChange={e => setAlternativeReturn(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>
              <div className={styles.chips}>
                {ALT_RETURN_PRESETS.map(r => (
                  <button key={r}
                    className={`${styles.chip} ${alternativeReturn === String(r) ? styles.chipActive : ''}`}
                    onClick={() => setAlternativeReturn(String(r))}
                  >{r}%</button>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>본 종목 회복 가정 가격</div>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={recoveryAssumption} onChange={e => setRecoveryAssumption(e.target.value)} />
                <span className={styles.unit}>{isUsStock ? '$' : '원'}</span>
              </div>
              <div className={styles.chips}>
                {RECOVERY_PRESETS.map(d => {
                  const v = Math.round(cPrice * (1 + d / 100))
                  return (
                    <button key={d}
                      className={`${styles.chip} ${parseAmount(recoveryAssumption) === v ? styles.chipActive : ''}`}
                      onClick={() => setRecoveryAssumption(String(v))}
                    >{d > 0 ? `+${d}%` : `${d}%`}</button>
                  )
                })}
              </div>
            </div>
          </div>

          {compareResult && (
            <>
              <div className={styles.compareGrid}>
                <div className={`${styles.compareCard} ${compareResult.avgDownIsBetter ? styles.compareCardWinner : styles.compareCardLoser}`}>
                  {compareResult.avgDownIsBetter && <div className={styles.winnerBadge}>★ 유리</div>}
                  <p className={styles.compareCardTitle}>A. 물타기 (추가 매수)</p>
                  <p className={styles.compareCardDesc}>본 종목 회복 가정 시</p>
                  <p className={styles.compareCardMain} style={{ color: compareResult.avgDown.profit >= 0 ? '#059669' : '#DC2626' }}>
                    {compareResult.avgDown.profit >= 0 ? '+' : ''}{formatEok(compareResult.avgDown.profit)}
                  </p>
                  <p className={styles.compareCardLabel}>{formatPct(compareResult.avgDown.profitPct)} · 회복 가정 매도 시</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>새 평단가</span><span>{formatKRW(compareResult.avgDown.newAvg)}원</span></div>
                  <div className={styles.compareCardRow}><span>총 보유</span><span>{compareResult.avgDown.newShares.toLocaleString()}주</span></div>
                  <div className={styles.compareCardRow}><span>총 투자금</span><span>{formatEok(compareResult.avgDown.totalInvested)}</span></div>
                  <div className={styles.compareCardRow}><span>매도 평가액</span><span>{formatEok(compareResult.avgDown.finalValue)}</span></div>
                </div>

                <div className={`${styles.compareCard} ${!compareResult.avgDownIsBetter ? styles.compareCardWinner : styles.compareCardLoser}`}>
                  {!compareResult.avgDownIsBetter && <div className={styles.winnerBadge}>★ 유리</div>}
                  <p className={styles.compareCardTitle}>B. 손절 + 대안 투자</p>
                  <p className={styles.compareCardDesc}>대안 {alternativeReturn}% 수익 가정</p>
                  <p className={styles.compareCardMain} style={{ color: compareResult.cutLoss.netProfit >= 0 ? '#059669' : '#DC2626' }}>
                    {compareResult.cutLoss.netProfit >= 0 ? '+' : ''}{formatEok(compareResult.cutLoss.netProfit)}
                  </p>
                  <p className={styles.compareCardLabel}>{formatPct(compareResult.cutLoss.netProfitPct)} · 1년 후</p>
                  <div className={styles.compareCardDivider} />
                  <div className={styles.compareCardRow}><span>실현 손익</span><span style={{ color: '#DC2626' }}>{formatEok(compareResult.cutLoss.realizedLoss)}</span></div>
                  <div className={styles.compareCardRow}><span>총 투자금</span><span>{formatEok(compareResult.cutLoss.totalInvested)}</span></div>
                  <div className={styles.compareCardRow}><span>1년 후 평가액</span><span>{formatEok(compareResult.cutLoss.finalValue)}</span></div>
                </div>
              </div>

              <div className={styles.infoBox}>
                <strong>💡 차이:</strong> 두 시나리오 차이는 약 {formatEok(compareResult.differenceAbs)}.
                본 종목이 회복할 가능성이 높다면 <strong>물타기</strong>가 유리하고, 회복 못할 가능성이 높다면 <strong>손절 + 대안</strong>이 유리합니다.
                회복 가능성을 솔직히 평가하세요.
              </div>
            </>
          )}

          <div className={styles.decisionBox}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: 'Noto Sans KR, sans-serif' }}>📋 손절 vs 물타기 결정 가이드</h3>
            <div className={styles.decisionList}>
              <div>
                <h4 style={{ color: '#DC2626' }}>❌ 손절 검토 신호</h4>
                <ul>
                  <li>손실률 -30% 이상</li>
                  <li>3개월 이상 회복 없음</li>
                  <li>회사 펀더멘털 악화 (실적·재무)</li>
                  <li>산업·섹터 구조적 위기</li>
                  <li>한 종목 자산의 30% 이상</li>
                  <li>회계 부정·경영진 문제</li>
                  <li>사업 모델 붕괴</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#059669' }}>✅ 물타기 검토 신호</h4>
                <ul>
                  <li>일시적 시장 조정 (전체 하락)</li>
                  <li>회사 펀더멘털 안정·성장</li>
                  <li>일시적 단기 악재 (분기 일회성)</li>
                  <li>한 종목 자산의 10% 이하</li>
                  <li>충분한 현금 비중 보유</li>
                  <li>장기 보유 의지 있음</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.warnBox}>
            <strong>⚠️ 본 비교는 가정 시나리오입니다.</strong>
            주가 회복·대안 수익률은 보장되지 않으며, 실제 결정은 본인 분석·책임입니다.
            투자 도움 필요 시: 한국 금융감독원 e-금융민원 <strong>1332</strong> · 거래 증권사 상담 권장.
          </div>
        </>
      )}

    </div>
  )
}
