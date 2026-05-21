'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo, useCallback } from 'react'
import styles from './dividend.module.css'
import {
  TAX_ACCOUNTS,
  PROGRESSIVE_BRACKETS,
  COMPREHENSIVE_TAX_THRESHOLD,
  FREQUENCY_INFO,
  afterTaxRate,
  requiredPrincipal,
  reverseCalcMonthlyContribution,
  evaluateComprehensiveTax,
  calcPortfolio,
  compareTaxAccounts,
  calcCurrencyImpact,
  formatKRW,
  formatEok,
  parseAmount,
  fmtNumInput,
  type Frequency,
  type PortfolioAsset,
} from './dividendUtils'

type TabId = 'goal' | 'reverse' | 'comprehensive' | 'portfolio' | 'savings'

const MONTHLY_PRESETS = [500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000]
const RATE_PRESETS = [3, 4, 4.5, 5, 6, 7]
const TAX_PRESETS = [
  { label: '국내주식', v: 15.4 },
  { label: '해외ETF', v: 15.0 },
  { label: '종합과세 (24.2%)', v: 24.2 },
  { label: '종합과세 (49.5%)', v: 49.5, warn: true },
]
const SAFETY_PRESETS = [
  { label: '100% 딱 맞게', v: 100 },
  { label: '110% 여유', v: 110 },
  { label: '120% 여유', v: 120 },
  { label: '130% 여유', v: 130 },
]
const COMPARE_RATES = [3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0]
const REVERSE_YEARS_PRESETS = [5, 10, 15, 20, 30]

export default function DividendClient() {
  const [tab, setTab] = useState<TabId>('goal')

  /* ── 공통: 탭1 → 다른 탭 자동 연동용 ── */
  const [monthly, setMonthly] = useState('1,000,000')
  const [rate, setRate]       = useState('4.5')
  const [tax, setTax]         = useState('15.4')
  const [safety, setSafety]   = useState(100)
  const [current, setCurrent] = useState('')
  const [growth, setGrowth]   = useState('0')

  const monthlyV = parseAmount(monthly)
  const rateV = parseAmount(rate)
  const taxV = parseAmount(tax)
  const currentV = parseAmount(current)

  const required = useMemo(
    () => requiredPrincipal(monthlyV, rateV, taxV, safety),
    [monthlyV, rateV, taxV, safety],
  )
  const atr = afterTaxRate(rateV, taxV)
  const annualTarget = monthlyV * 12
  const effectiveRate = safety > 0 ? atr * 100 / safety : 0

  const additionalNeeded = isFinite(required) ? Math.max(0, required - currentV) : Infinity
  const achievement = isFinite(required) && required > 0
    ? Math.min(100, (currentV / required) * 100) : 0

  const valid = monthlyV > 0 && rateV > 0 && taxV >= 0 && taxV < 100

  /* ── 탭 2: 월 적립 역산 ── */
  const [revYears, setRevYears] = useState('10')
  const [capGain, setCapGain] = useState('3')
  const [reinvest, setReinvest] = useState(true)

  const reverseResult = useMemo(() => {
    if (tab !== 'reverse' || !valid) return null
    return reverseCalcMonthlyContribution({
      targetMonthly: monthlyV,
      targetYears: parseAmount(revYears),
      currentCapital: currentV,
      dividendYield: rateV,
      capitalGainRate: parseAmount(capGain),
      reinvestDividends: reinvest,
      taxRate: taxV / 100,
      safety: safety / 100,
    })
  }, [tab, valid, monthlyV, revYears, currentV, rateV, capGain, reinvest, taxV, safety])

  /* 다양한 기간·수익률 조합 표 (NEW) */
  const reverseScenarioTable = useMemo(() => {
    if (tab !== 'reverse' || !valid) return null
    const years = [5, 10, 15, 20, 30]
    const rates = [4, 4.5, 5, 6, 7]
    const matrix: { yr: number; row: { rate: number; m: number | null }[] }[] = []
    for (const yr of years) {
      const row = rates.map(r => {
        const res = reverseCalcMonthlyContribution({
          targetMonthly: monthlyV,
          targetYears: yr,
          currentCapital: currentV,
          dividendYield: r,
          capitalGainRate: parseAmount(capGain),
          reinvestDividends: reinvest,
          taxRate: taxV / 100,
          safety: safety / 100,
        })
        return { rate: r, m: res ? res.requiredMonthly : null }
      })
      matrix.push({ yr, row })
    }
    return { years, rates, matrix }
  }, [tab, valid, monthlyV, currentV, capGain, reinvest, taxV, safety])

  /* ── 탭 3: 종합과세 ── */
  const [annualDividend, setAnnualDividend] = useState('')   // 자동 또는 수동
  const [annualInterest, setAnnualInterest] = useState('200')   // 만원
  const [otherFinancial, setOtherFinancial] = useState('100')   // 만원

  const autoAnnualDividend = monthlyV * 12  // 탭1 기준
  const annualDividendVal = parseAmount(annualDividend) > 0 ? parseAmount(annualDividend) : autoAnnualDividend

  const compTaxResult = useMemo(() => {
    return evaluateComprehensiveTax(
      annualDividendVal,
      parseAmount(annualInterest) * 10_000,
      parseAmount(otherFinancial) * 10_000,
    )
  }, [annualDividendVal, annualInterest, otherFinancial])

  /* 종합과세 진입 시뮬 표 (배당수익률 기준 원금) */
  const compTaxSimRows = useMemo(() => {
    const rates = [3, 4, 4.5, 5, 6, 7]
    return rates.map(r => {
      const principal = COMPREHENSIVE_TAX_THRESHOLD / (r / 100)
      return { rate: r, principal: Math.round(principal) }
    })
  }, [])

  /* ── 탭 4: 포트폴리오 ── */
  const [assets, setAssets] = useState<PortfolioAsset[]>([
    { id: '1', name: '국내 배당주',         amount: 50_000_000, yieldPct: 4.0, frequency: 'quarterly', taxRate: 15.4 },
    { id: '2', name: '미국 ETF (SCHD)',     amount: 50_000_000, yieldPct: 3.5, frequency: 'quarterly', taxRate: 15.0 },
    { id: '3', name: '월배당 ETF (JEPI)',   amount: 30_000_000, yieldPct: 7.0, frequency: 'monthly',   taxRate: 15.0 },
    { id: '4', name: '한국 리츠',           amount: 20_000_000, yieldPct: 6.0, frequency: 'quarterly', taxRate: 15.4 },
  ])

  const updateAsset = (id: string, patch: Partial<PortfolioAsset>) => {
    setAssets(assets.map(a => a.id === id ? { ...a, ...patch } : a))
  }
  const removeAsset = (id: string) => setAssets(assets.filter(a => a.id !== id))
  const addAsset = () => {
    const id = String(Date.now())
    setAssets([...assets, { id, name: '', amount: 10_000_000, yieldPct: 4, frequency: 'quarterly', taxRate: 15.4 }])
  }

  const portfolioResult = useMemo(() => calcPortfolio(assets), [assets])

  /* 포트폴리오 종합과세 평가 */
  const portfolioCompTax = useMemo(() => {
    return evaluateComprehensiveTax(portfolioResult.annualPretax, 0, 0)
  }, [portfolioResult])

  /* 환율 영향 — 미국 자산만 */
  const usAssets = assets.filter(a => Math.abs(a.taxRate - 15.0) < 0.1)
  const usAnnualUSD = usAssets.reduce((s, a) => s + (a.amount * a.yieldPct / 100), 0) / 1300  // 가정 환율 1,300

  /* ── 탭 5: 절세 계좌 ── */
  const [savingsYears, setSavingsYears] = useState('30')
  const [savingsAnnualContribution, setSavingsAnnualContribution] = useState('360')   // 만원
  const [totalIncomeMan, setTotalIncomeMan] = useState('5000')   // 만원

  const savingsCompare = useMemo(() => {
    if (!valid) return null
    return compareTaxAccounts({
      annualDividend: annualDividendVal,
      years: parseAmount(savingsYears),
      annualContribution: parseAmount(savingsAnnualContribution) * 10_000,
      totalIncome: parseAmount(totalIncomeMan) * 10_000,
    })
  }, [valid, annualDividendVal, savingsYears, savingsAnnualContribution, totalIncomeMan])

  const bestSavings = useMemo(() => {
    if (!savingsCompare) return null
    return savingsCompare.reduce((best, cur) => cur.netBenefit > best.netBenefit ? cur : best)
  }, [savingsCompare])

  /* ── 차트: 월별 현금흐름 ── */
  const renderFlowChart = useCallback(() => {
    if (portfolioResult.monthlyFlow.every(v => v === 0)) return null
    const W = 600, H = 180, P = 30
    const max = Math.max(...portfolioResult.monthlyFlow) || 1
    const barW = (W - P * 2) / 12 - 4

    return (
      <svg className={styles.flowChartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={P} x2={W - P} y1={H - P - (H - P * 1.5) * t} y2={H - P - (H - P * 1.5) * t}
            stroke="var(--border)" strokeDasharray="3 3" />
        ))}
        {portfolioResult.monthlyFlow.map((v, i) => {
          const h = (H - P * 1.5) * (v / max)
          const x = P + i * ((W - P * 2) / 12) + 2
          const y = H - P - h
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} fill="var(--accent)" rx="2" />
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fill="var(--muted)"
                fontSize="10" fontFamily="Noto Sans KR, sans-serif">{i + 1}</text>
              {v > max * 0.2 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="var(--accent)"
                  fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontWeight="800">
                  {Math.round(v / 10_000)}만
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }, [portfolioResult.monthlyFlow])

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
      >
        투자 자문·종목 권유 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {[
          { id: 'goal',          label: '목표 원금',     cls: styles.tabActive },
          { id: 'reverse',       label: '월 적립 역산',  cls: styles.tabActiveReverse },
          { id: 'comprehensive', label: '종합과세 경계', cls: styles.tabActiveTax },
          { id: 'portfolio',     label: '포트폴리오',    cls: styles.tabActivePort },
          { id: 'savings',       label: '절세 계좌',     cls: styles.tabActiveSavings },
        ].map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* ─── 공통 입력 (모든 탭에서 표시) ─── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 월배당금</label>
        <div className={styles.inputRow}>
          <input
            className={`${styles.numInput} ${styles.numInputBig}`}
            type="text" inputMode="numeric"
            placeholder="1,000,000"
            value={monthly}
            onChange={e => setMonthly(fmtNumInput(e.target.value))}
          />
          <span className={styles.unit}>원</span>
        </div>
        {monthlyV > 0 && (
          <div className={styles.liveHint}>{formatEok(monthlyV)} / 월</div>
        )}
        <div className={styles.presets}>
          {MONTHLY_PRESETS.map(v => (
            <button key={v} type="button"
              className={`${styles.presetBtn} ${monthlyV === v ? styles.presetActive : ''}`}
              onClick={() => setMonthly(v.toLocaleString('ko-KR'))}
            >{v >= 10_000_000 ? `${v/10_000_000}천만` : `${v/10_000}만`}</button>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>예상 연 배당수익률</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="4.5" step={0.1} min={0.1} max={30}
              value={rate} onChange={e => setRate(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {RATE_PRESETS.map(r => (
              <button key={r} type="button"
                className={`${styles.presetBtn} ${rateV === r ? styles.presetActive : ''}`}
                onClick={() => setRate(String(r))}
              >{r}%</button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <label className={styles.cardLabel}>배당소득세율</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="15.4" step={0.1} min={0} max={99}
              value={tax} onChange={e => setTax(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {TAX_PRESETS.map(p => (
              <button key={p.label} type="button"
                className={`${styles.presetBtn} ${p.warn ? styles.presetWarn : ''} ${taxV === p.v ? styles.presetActive : ''}`}
                onClick={() => setTax(String(p.v))}
              >{p.label}{p.warn ? ' ⚠️' : ''}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 안전계수 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 안전계수 (배당 삭감·공백기 대비)</label>
        <div className={styles.optionRow4}>
          {SAFETY_PRESETS.map(p => (
            <button key={p.v} type="button"
              className={`${styles.optionBtn} ${safety === p.v ? styles.optionActive : ''}`}
              onClick={() => setSafety(p.v)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* ──────────── TAB 1: 목표 원금 ──────────── */}
      {tab === 'goal' && (
        <>
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>현재 투자금 (선택)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="text" inputMode="numeric"
                  placeholder="50,000,000"
                  value={current}
                  onChange={e => setCurrent(fmtNumInput(e.target.value))} />
                <span className={styles.unit}>원</span>
              </div>
              {currentV > 0 && <div className={styles.liveHint}>{formatEok(currentV)}</div>}
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>배당 성장률 (% / 년) — 선택</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="decimal"
                  placeholder="0" step={0.5} min={0} max={50}
                  value={growth} onChange={e => setGrowth(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>
              <p className={styles.cardDesc}>매년 배당이 이만큼 성장한다고 가정 (DGI 전략)</p>
            </div>
          </div>

          {valid && isFinite(required) && (
            <>
              <div className={`${styles.hero} ${styles.heroAccent}`}>
                <div className={styles.heroLead}>
                  월 <strong style={{ color: 'var(--text)' }}>{formatKRW(monthlyV)}</strong>의 배당금을 받으려면
                </div>
                <div className={`${styles.heroNum} ${styles.heroNumAccent}`}>{formatKRW(required)}원</div>
                <div className={styles.heroSub}>{formatEok(required)} 필요</div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>세전 배당수익률</div>
                  <div className={styles.metricValue}>{rateV.toFixed(2)}%</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>세후 배당수익률</div>
                  <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>{(atr * 100).toFixed(2)}%</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>연간 필요 배당금</div>
                  <div className={styles.metricValue}>{formatKRW(annualTarget)}원</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>실효 수익률 (안전계수)</div>
                  <div className={styles.metricValue}>{effectiveRate.toFixed(2)}%</div>
                </div>
              </div>

              {currentV > 0 && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>현재 {formatEok(currentV)} 투자 중이라면</label>
                  {additionalNeeded > 0 ? (
                    <>
                      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                        추가 필요 {formatKRW(additionalNeeded)}원
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                        {formatEok(additionalNeeded)} 더 모아야 합니다
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: 800, color: '#059669' }}>
                      🎉 이미 목표 달성!
                    </div>
                  )}
                  <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${achievement}%` }} />
                    </div>
                    <div className={styles.progressPct} style={{ color: 'var(--accent)' }}>{achievement.toFixed(1)}%</div>
                  </div>
                </div>
              )}

              {/* 비교 표 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>배당수익률별 필요 원금 비교</label>
                <div className={styles.table}>
                  <div className={styles.tableHead}>
                    <span>연 배당수익률</span><span>세후 수익률</span><span>필요 원금</span>
                  </div>
                  {COMPARE_RATES.map(r => {
                    const req = requiredPrincipal(monthlyV, r, taxV, safety)
                    const at = afterTaxRate(r, taxV) * 100
                    const isActive = Math.abs(r - rateV) < 0.01
                    const isWarn = r >= 8
                    return (
                      <div key={r}
                        className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''} ${isWarn ? styles.tableRowWarn : ''}`}>
                        <span className={styles.tableCell}>{r.toFixed(1)}%{isWarn ? ' ⚠️' : ''}</span>
                        <span className={styles.tableCell}>{at.toFixed(2)}%</span>
                        <span className={styles.tableCellRight}>{formatEok(req)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={styles.interpret}>
                <p><strong>💡 해석:</strong> 월배당 목표는 배당수익률보다 <strong>세후 수익률</strong> 기준이 더 현실적입니다.</p>
                <p>이 계산은 현재 배당수익률이 유지된다고 가정합니다.</p>
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 월 적립 역산 ──────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>목표 달성 기간</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={revYears} onChange={e => setRevYears(e.target.value)} />
                <span className={styles.unit}>년</span>
              </div>
              <div className={styles.chips}>
                {REVERSE_YEARS_PRESETS.map(y => (
                  <button key={y} type="button"
                    className={`${styles.chip} ${revYears === String(y) ? styles.chipActive : ''}`}
                    onClick={() => setRevYears(String(y))}
                  >{y}년</button>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>현재 투자금 (시드)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="text" inputMode="numeric"
                  placeholder="0"
                  value={current}
                  onChange={e => setCurrent(fmtNumInput(e.target.value))} />
                <span className={styles.unit}>원</span>
              </div>
              {currentV > 0 && <div className={styles.liveHint}>{formatEok(currentV)}</div>}
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>예상 시세 차익 (CAGR)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="decimal" step={0.5}
                  value={capGain} onChange={e => setCapGain(e.target.value)} />
                <span className={styles.unit}>%/년</span>
              </div>
              <p className={styles.cardDesc}>장기 평균 약 3~7% (보수적 기준 권장)</p>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>배당 재투자</label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={reinvest} onChange={e => setReinvest(e.target.checked)} />
                세후 배당을 매월 재투자한다 (복리 효과 ↑)
              </label>
              <p className={styles.cardDesc}>인출 X · 배당 자동 재투자 가정</p>
            </div>
          </div>

          {reverseResult && (
            <>
              <div className={`${styles.hero} ${styles.heroGold}`}>
                <div className={styles.heroLead}>
                  월배당 <strong style={{ color: 'var(--text)' }}>{formatKRW(monthlyV)}</strong> · {revYears}년 목표
                </div>
                <div className={`${styles.heroNum} ${styles.heroNumGold}`}>
                  월 {formatEok(reverseResult.requiredMonthly)} 적립
                </div>
                <div className={styles.heroSub}>
                  필요 자산 {formatEok(reverseResult.requiredCapital)} · 현재 시드 {formatEok(currentV)}
                </div>
                <div className={styles.feasibilityBadge}
                  style={{ background: `${reverseResult.feasibilityColor}1A`, color: reverseResult.feasibilityColor, border: `1px solid ${reverseResult.feasibilityColor}55` }}>
                  {reverseResult.feasibilityLabel}
                </div>
                <div className={styles.feasibilityNote}>{reverseResult.feasibilityNote}</div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>월 적립 필요</div>
                  <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>{formatEok(reverseResult.requiredMonthly)}</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>연 적립 필요</div>
                  <div className={styles.metricValue}>{formatEok(reverseResult.requiredYearly)}</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>누적 납입 (시드 + 적립)</div>
                  <div className={styles.metricValue}>{formatEok(reverseResult.totalContribution)}</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>예상 수익 (재투자·차익)</div>
                  <div className={`${styles.metricValue} ${styles.metricValueGreen}`}>{formatEok(reverseResult.totalGrowth)}</div>
                </div>
              </div>

              {/* 시나리오 표 */}
              {reverseScenarioTable && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>기간·수익률별 월 적립 비교 (현재 시드 {formatEok(currentV)} 가정)</label>
                  <div className={styles.compareTableWrap}>
                    <table className={styles.compareTable} style={{ minWidth: 480 }}>
                      <thead>
                        <tr>
                          <th>기간 \ 수익률</th>
                          {reverseScenarioTable.rates.map(r => <th key={r}>{r}%</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {reverseScenarioTable.matrix.map(({ yr, row }) => (
                          <tr key={yr} className={String(yr) === revYears ? styles.bestRow : ''}>
                            <td>{yr}년{String(yr) === revYears && ' ⭐'}</td>
                            {row.map((c, i) => (
                              <td key={i} style={{ color: c.m === null ? 'var(--muted)' : (c.m < 800_000 ? '#059669' : c.m < 2_000_000 ? '#CA8A04' : '#DC2626') }}>
                                {c.m === null ? '—' : `${Math.round(c.m / 10_000)}만`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
                    ※ 기간을 2배로 늘리면 월 적립액이 약 1/3로 감소. 일찍 시작 + 꾸준한 적립 + 재투자 = 복리 효과 극대화.
                  </p>
                </div>
              )}

              <div className={styles.warnBox}>
                <strong>⚠️ 본 시뮬레이션은 가정 수익률 기준</strong>이며, 실제 시장은 변동성이 큽니다.
                보수적 가정 (배당수익률 4~5%, 시세 차익 3~5%) 권장.
              </div>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 3: 종합과세 경계 ──────────── */}
      {tab === 'comprehensive' && (
        <>
          <div className={styles.threeCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>예상 연 배당금</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="text" inputMode="numeric"
                  placeholder={formatKRW(autoAnnualDividend)}
                  value={annualDividend}
                  onChange={e => setAnnualDividend(fmtNumInput(e.target.value))} />
                <span className={styles.unit}>원</span>
              </div>
              <p className={styles.cardDesc}>비워두면 목표 월배당 × 12 자동 사용</p>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>예상 연 이자소득</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={annualInterest} onChange={e => setAnnualInterest(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>기타 금융소득</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={otherFinancial} onChange={e => setOtherFinancial(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
          </div>

          <div className={`${styles.hero} ${
            compTaxResult.level === 'over' ? styles.heroRed :
            compTaxResult.level === 'near' ? styles.heroOrange :
            compTaxResult.level === 'caution' ? styles.heroGold : styles.heroAccent
          }`}>
            <div className={styles.heroLabel}>
              {compTaxResult.level === 'over' ? '⚠️ 종합과세 진입' :
               compTaxResult.level === 'near' ? '⚠️ 종합과세 임박' :
               compTaxResult.level === 'caution' ? '🟡 한도까지 여유' : '🟢 안전 구간'}
            </div>
            <div className={`${styles.heroNum} ${
              compTaxResult.level === 'over' ? styles.heroNumRed :
              compTaxResult.level === 'near' ? styles.heroNumOrange :
              compTaxResult.level === 'caution' ? styles.heroNumGold : styles.heroNumAccent
            }`}>
              {compTaxResult.level === 'over'
                ? `초과 ${formatEok(-compTaxResult.remainder)}`
                : `여유 ${formatEok(compTaxResult.remainder)}`}
            </div>
            <div className={styles.heroSub}>
              금융소득 합계 {formatEok(compTaxResult.totalFinancialIncome)} / 한도 {formatEok(COMPREHENSIVE_TAX_THRESHOLD)} ({compTaxResult.pctOfThreshold}%)
            </div>
          </div>

          <div className={styles.compTaxBar}>
            <div className={`${styles.compTaxFill} ${
              compTaxResult.level === 'over' ? styles.progressFillDanger :
              compTaxResult.level === 'near' ? styles.progressFillWarn :
              styles.progressFill
            }`} style={{ width: `${Math.min(100, compTaxResult.pctOfThreshold)}%` }} />
            <div className={styles.compTaxLine} style={{ left: '100%' }} />
          </div>
          <div className={styles.compTaxLabels}>
            <span>0원</span>
            <span>{formatEok(COMPREHENSIVE_TAX_THRESHOLD / 2)} (50%)</span>
            <span style={{ color: '#DC2626' }}>한도 {formatEok(COMPREHENSIVE_TAX_THRESHOLD)}</span>
          </div>

          {/* 시뮬레이션 표 — 원금별 종합과세 진입 여부 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>배당수익률별 종합과세 진입 원금</label>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>배당수익률</span><span>종합과세 진입 원금</span><span>안전 한도</span>
              </div>
              {compTaxSimRows.map(row => (
                <div key={row.rate} className={`${styles.tableRow} ${Math.abs(row.rate - rateV) < 0.01 ? styles.tableRowActive : ''}`}>
                  <span className={styles.tableCell}>{row.rate}%</span>
                  <span className={styles.tableCell}>{formatEok(row.principal)}</span>
                  <span className={styles.tableCellRight}>~ {formatEok(row.principal * 0.8)}</span>
                </div>
              ))}
            </div>
            <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
              ※ 「안전 한도」는 종합과세 한도의 80% 도달 지점 (여유 200만 추가 자산 가능).
            </p>
          </div>

          {/* 누진세율 표 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>종합과세 누진세율 (지방세 포함)</label>
            <div className={styles.compareTableWrap}>
              <table className={styles.compareTable} style={{ minWidth: 420 }}>
                <thead>
                  <tr>
                    <th>금융소득 구간</th>
                    <th>세율</th>
                  </tr>
                </thead>
                <tbody>
                  {PROGRESSIVE_BRACKETS.slice(0, 8).map((b, i) => {
                    const isActive = compTaxResult.bracket && b.min === compTaxResult.bracket.min
                    return (
                      <tr key={i} className={isActive ? styles.bestRow : ''}>
                        <td>{b.label.split('(')[0].trim()}{isActive && ' ⭐'}</td>
                        <td style={{ color: b.rate > 0.3 ? '#DC2626' : b.rate > 0.2 ? '#EA580C' : 'var(--text)' }}>
                          {(b.rate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.infoBox}>
            <strong>💡 종합과세 회피 전략:</strong><br />
            <strong style={{ color: '#0891B2' }}>① ISA 계좌</strong> — 200~400만 비과세 + 9.9% 분리과세, <strong>종합과세 비포함</strong> · 연 2,000만 한도 / 총 1억<br />
            <strong style={{ color: '#0891B2' }}>② 연금저축·IRP</strong> — 5.5% 분리과세 (55세 이후) + 16.5% 세액공제<br />
            <strong style={{ color: '#0891B2' }}>③ 자산 분산</strong> — 부부 명의 분산, 자녀 명의(증여세 별도), 시점 분산<br />
            본 도구의 「절세 계좌」 탭에서 정량 비교 가능합니다.
          </div>
        </>
      )}

      {/* ──────────── TAB 4: 포트폴리오 ──────────── */}
      {tab === 'portfolio' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>자산 목록 ({assets.length}개)</label>
            {assets.map(a => (
              <div key={a.id} className={styles.assetRow}>
                <input className={styles.textInput} type="text" placeholder="자산명"
                  value={a.name} onChange={e => updateAsset(a.id, { name: e.target.value })} />
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="투자금" value={a.amount || ''}
                  onChange={e => updateAsset(a.id, { amount: parseAmount(e.target.value) })} />
                <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
                  placeholder="%" value={a.yieldPct || ''}
                  onChange={e => updateAsset(a.id, { yieldPct: parseAmount(e.target.value) })} />
                <select className={styles.assetSelect} value={a.frequency}
                  onChange={e => updateAsset(a.id, { frequency: e.target.value as Frequency })}>
                  {FREQUENCY_INFO.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select className={styles.assetSelect} value={a.taxRate}
                  onChange={e => updateAsset(a.id, { taxRate: parseFloat(e.target.value) })}>
                  <option value={15.4}>국내 15.4%</option>
                  <option value={15.0}>해외 15.0%</option>
                </select>
                <button className={styles.deleteBtn}
                  onClick={() => removeAsset(a.id)}
                  disabled={assets.length === 1}
                  title="삭제">×</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addAsset}>+ 자산 추가</button>

            {/* 고배당 함정 경고 */}
            {assets.some(a => a.yieldPct >= 10) && (
              <div className={styles.warnBox} style={{ marginTop: 12 }}>
                <strong>⚠️ 배당수익률 10%+ 자산이 있습니다 — 함정 배당 점검:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12 }}>
                  <li>주가 하락에 따른 분모 효과 (분자가 아님)</li>
                  <li>배당성향 100% 이상 — 지속 불가</li>
                  <li>커버드콜 ETF — 변동성 ↓ 시 분배금 ↓</li>
                  <li>리츠 — 금리 인상 시 이중 타격</li>
                </ul>
              </div>
            )}
            {assets.some(a => a.yieldPct >= 7 && a.yieldPct < 10) && (
              <div className={styles.warnBox} style={{ marginTop: 12, background: 'rgba(234,88,12,0.06)', borderColor: 'rgba(234,88,12,0.30)' }}>
                <strong style={{ color: '#EA580C' }}>⚠️ 7%+ 자산 (JEPI/QYLD 등 커버드콜 가능성)</strong> — 변동성 손실 위험 있음. 단순 배당주 대비 자본 손실 위험 있음.
              </div>
            )}
          </div>

          {/* 종합 결과 */}
          <div className={`${styles.hero} ${styles.heroCyan}`}>
            <div className={styles.heroLead}>
              총 자산 {formatEok(portfolioResult.totalAmount)} · 가중평균 {portfolioResult.weightedYieldPretax.toFixed(2)}% (세전)
            </div>
            <div className={`${styles.heroNum} ${styles.heroNumCyan}`}>
              월 평균 {formatEok(portfolioResult.monthlyAvg)}
            </div>
            <div className={styles.heroSub}>
              세후 가중평균 {portfolioResult.weightedYieldAftertax.toFixed(2)}% · 연 {formatEok(portfolioResult.annualAftertax)}
            </div>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>총 투자금</div>
              <div className={styles.metricValue}>{formatEok(portfolioResult.totalAmount)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>연 배당 (세전)</div>
              <div className={styles.metricValue}>{formatEok(portfolioResult.annualPretax)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>연 배당 (세후)</div>
              <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>{formatEok(portfolioResult.annualAftertax)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>종합과세 한도까지</div>
              <div className={`${styles.metricValue} ${portfolioCompTax.level === 'over' ? styles.metricValueRed : portfolioCompTax.level === 'near' ? styles.metricValueRed : styles.metricValueGreen}`}>
                {portfolioCompTax.remainder >= 0 ? `+${formatEok(portfolioCompTax.remainder)}` : formatEok(portfolioCompTax.remainder)}
              </div>
            </div>
          </div>

          {/* 월별 현금흐름 차트 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>월별 현금흐름 (세후, 1~12월)</label>
            <div className={styles.flowChartWrap}>{renderFlowChart()}</div>
            <p className={styles.cardLabelHint} style={{ marginTop: 8 }}>
              분기 배당주(3·6·9·12월)는 큰 막대, 월배당 ETF는 매월 작은 막대로 안정적 현금흐름.
            </p>
          </div>

          {/* 자산별 상세 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>자산별 연 배당 (세후)</label>
            <div className={styles.compareTableWrap}>
              <table className={styles.compareTable} style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>자산</th>
                    <th>투자금</th>
                    <th>수익률</th>
                    <th>주기</th>
                    <th>연 배당 (세후)</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioResult.perAsset.map(a => (
                    <tr key={a.id}>
                      <td>{a.name || '(이름 없음)'}</td>
                      <td>{formatEok(a.amount)}</td>
                      <td style={{ color: a.yieldPct >= 10 ? '#DC2626' : a.yieldPct >= 7 ? '#EA580C' : 'var(--text)' }}>
                        {a.yieldPct}%{a.yieldPct >= 7 && ' ⚠️'}
                      </td>
                      <td>{FREQUENCY_INFO.find(f => f.id === a.frequency)?.name}</td>
                      <td style={{ color: 'var(--accent)' }}>{formatEok(a.annualAfterTax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 종합과세 자동 경고 */}
          {portfolioResult.annualPretax >= 18_000_000 && (
            <div className={styles.warnBox}>
              <strong>⚠️ 연 배당 {formatEok(portfolioResult.annualPretax)} — 종합과세 한도(2,000만) 임박:</strong>
              ISA·연금저축·IRP 절세 계좌 활용 권장. 「절세 계좌」 탭에서 비교.
            </div>
          )}

          {/* 환율 변동 영향 */}
          {usAssets.length > 0 && usAnnualUSD > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>💱 환율 변동 영향 — 미국 ETF (가정 1,300원/$)</label>
              <div className={styles.fxTable}>
                <div className={`${styles.fxRow} ${styles.headerRow}`}>
                  <span>변동</span><span>환율</span><span>원화 배당 (세전)</span>
                </div>
                {calcCurrencyImpact(usAnnualUSD, 1300, [-15, -10, -5, 0, 5, 10, 15]).map(row => (
                  <div key={row.deltaPct} className={`${styles.fxRow} ${row.deltaPct === 0 ? styles.fxRowBase : ''}`}>
                    <span className={`${styles.fxDelta} ${row.deltaPct > 0 ? styles.fxDeltaPos : row.deltaPct < 0 ? styles.fxDeltaNeg : styles.fxDeltaZero}`}>
                      {row.deltaPct > 0 ? `+${row.deltaPct}%` : `${row.deltaPct}%`}
                    </span>
                    <span>{Math.round(row.rate).toLocaleString()}원</span>
                    <span>{formatEok(row.krw)}</span>
                  </div>
                ))}
              </div>
              <p className={styles.cardLabelHint} style={{ marginTop: 10 }}>
                ※ USD/KRW ±15% 변동 시 원화 배당 ±15%. 환율 헤지 ETF 또는 분산 투자 권장.
              </p>
            </div>
          )}
        </>
      )}

      {/* ──────────── TAB 5: 절세 계좌 ──────────── */}
      {tab === 'savings' && (
        <>
          <div className={styles.threeCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>비교 기간</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={savingsYears} onChange={e => setSavingsYears(e.target.value)} />
                <span className={styles.unit}>년</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>연 적립액</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={savingsAnnualContribution} onChange={e => setSavingsAnnualContribution(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>본인 총급여 (세액공제용)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  value={totalIncomeMan} onChange={e => setTotalIncomeMan(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
              <p className={styles.cardDesc}>5,500만 이하 16.5%, 초과 13.2% 공제율</p>
            </div>
          </div>

          {savingsCompare && bestSavings && (
            <>
              <div className={`${styles.hero} ${styles.heroPurple}`}>
                <div className={styles.heroLead}>
                  연 배당 {formatEok(annualDividendVal)} · {savingsYears}년 절세 비교
                </div>
                <div className={`${styles.heroNum} ${styles.heroNumPurple}`}>
                  {bestSavings.account.name}
                </div>
                <div className={styles.heroSub}>
                  일반 대비 약 {formatEok(bestSavings.netBenefit)} 더 많이 받음 (누적)
                </div>
              </div>

              <div className={styles.compareTableWrap}>
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th>계좌</th>
                      <th>연 세금</th>
                      <th>{savingsYears}년 누적 세금</th>
                      <th>{savingsYears}년 세액공제</th>
                      <th>일반 대비 이득</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsCompare.map(r => {
                      const isBest = r.account.id === bestSavings.account.id
                      return (
                        <tr key={r.account.id} className={isBest ? styles.bestRow : ''}>
                          <td>{r.account.name}{isBest && ' ★'}</td>
                          <td>{formatEok(r.annualTax)}</td>
                          <td style={{ color: '#DC2626' }}>{formatEok(r.totalTax)}</td>
                          <td style={{ color: r.taxCreditTotal > 0 ? '#059669' : 'var(--muted)' }}>
                            {r.taxCreditTotal > 0 ? `+${formatEok(r.taxCreditTotal)}` : '—'}
                          </td>
                          <td style={{ color: r.netBenefit > 0 ? '#059669' : r.netBenefit < 0 ? '#DC2626' : 'var(--muted)' }}>
                            {r.netBenefit > 0 ? `+${formatEok(r.netBenefit)}` : r.netBenefit < 0 ? formatEok(r.netBenefit) : '기준'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 계좌별 상세 카드 */}
              <div className={styles.twoCol}>
                {TAX_ACCOUNTS.slice(0, 4).map(acc => {
                  const row = savingsCompare.find(r => r.account.id === acc.id)
                  if (!row) return null
                  const isBest = acc.id === bestSavings.account.id
                  return (
                    <div key={acc.id} className={`${styles.savingsCard} ${isBest ? styles.savingsCardWinner : ''}`}>
                      {isBest && <div className={styles.winnerBadge}>★ 최적</div>}
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: 'Noto Sans KR, sans-serif' }}>{acc.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.6 }}>{acc.desc}</p>
                      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 22, color: row.netBenefit > 0 ? '#059669' : 'var(--muted)' }}>
                        {row.netBenefit > 0 ? `+${formatEok(row.netBenefit)}` : '기준'}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{savingsYears}년 누적 이득</p>
                      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>
                        ✅ {acc.pros}<br />
                        ⚠️ {acc.cons}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.warnBox}>
                <strong>⚠️</strong> 본 비교는 단순화된 가정입니다. ISA·연금저축은 의무 보유 기간 / 중도 해지 페널티가 있습니다.
                본인 자금 흐름·세무 상황에 따라 실제 효과가 다를 수 있으며, 가입 전 금융사·세무사 상담 권장.
                문의: 한국 금융감독원 e-금융민원 <strong>1332</strong>.
              </div>
            </>
          )}
        </>
      )}

      {!valid && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>입력값을 확인해주세요</p>
          <p>목표 월배당금과 배당수익률을 입력하면 계산됩니다.</p>
        </div>
      )}
    </div>
  )
}
