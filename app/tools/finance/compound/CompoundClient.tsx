'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './compound.module.css'
import {
  TAX_ACCOUNTS,
  RETURN_SCENARIOS,
  CONTRIBUTION_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  INFLATION_PRESETS,
  calcCompound,
  reverseCalcContribution,
  calcAfterTax,
  calcRealValue,
  formatEok,
  parseAmount,
} from './compoundUtils'

type TabId = 'main' | 'reverse' | 'tax' | 'inflation' | 'scenario'

const RATE_PRESETS = [3, 5, 7, 10, 13]
const YEAR_PRESETS = [5, 10, 15, 20, 30]
const GOAL_PRESETS = [
  { label: '5천만', value: 50_000_000 },
  { label: '1억',   value: 100_000_000 },
  { label: '3억',   value: 300_000_000 },
  { label: '5억',   value: 500_000_000 },
  { label: '10억',  value: 1_000_000_000 },
]

/* 단위 입력 (만원 단위) → 원 변환 */
function manToWon(manStr: string) {
  const n = parseAmount(manStr)
  return n * 10_000
}

export default function CompoundClient() {
  const [tab, setTab] = useState<TabId>('main')

  /* ─── 공통 입력 ─── */
  const [principal,    setPrincipal]    = useState('1000')   // 만원
  const [contribution, setContribution] = useState('30')     // 만원
  const [annualRate,   setAnnualRate]   = useState('7')      // %
  const [years,        setYears]        = useState('20')     // 년
  const [contributionFreqId, setContributionFreqId] = useState('monthly')
  const [compoundFreqId,     setCompoundFreqId]     = useState('monthly')
  const [annualIncreaseRate, setAnnualIncreaseRate] = useState('0')  // %
  const [feeRate,            setFeeRate]            = useState('0')  // %
  const [showAdvanced,       setShowAdvanced]       = useState(false)

  const [goal,        setGoal]        = useState('10000')  // 만원 (1억)
  const [accountId,   setAccountId]   = useState('isa-general')
  const [totalIncome, setTotalIncome] = useState('5000')   // 만원
  const [inflationRate, setInflationRate] = useState('2.5')  // %
  const [showAllSchedule, setShowAllSchedule] = useState(false)

  const principalNum    = manToWon(principal)
  const contributionNum = manToWon(contribution)
  const annualRateNum   = parseFloat(annualRate)   || 0
  const yearsNum        = parseInt(years)          || 0
  const goalNum         = manToWon(goal)
  const incomeNum       = manToWon(totalIncome)
  const inflationNum    = parseFloat(inflationRate) || 0
  const annualIncrNum   = parseFloat(annualIncreaseRate) || 0
  const feeNum          = parseFloat(feeRate) || 0

  /* ─── 메인 계산 (전 탭에서 공유) ─── */
  const result = useMemo(() => {
    if (yearsNum <= 0 || annualRateNum <= 0) return null
    return calcCompound({
      principal: principalNum,
      contribution: contributionNum,
      contributionFreqId,
      compoundFreqId,
      annualRate: annualRateNum,
      years: yearsNum,
      annualIncreaseRate: annualIncrNum,
      feeRate: feeNum,
    })
  }, [principalNum, contributionNum, annualRateNum, yearsNum, contributionFreqId, compoundFreqId, annualIncrNum, feeNum])

  /* ─── 역산 ─── */
  const reverse = useMemo(() => {
    if (tab !== 'reverse' || goalNum <= 0 || yearsNum <= 0 || annualRateNum <= 0) return null
    return reverseCalcContribution({
      goal: goalNum,
      principal: principalNum,
      years: yearsNum,
      annualRate: annualRateNum,
      contributionFreqId,
      compoundFreqId,
    })
  }, [tab, goalNum, principalNum, yearsNum, annualRateNum, contributionFreqId, compoundFreqId])

  /* ─── 세금 비교 (모든 계좌) ─── */
  const taxComparisons = useMemo(() => {
    if (!result) return []
    return TAX_ACCOUNTS.map(acc => ({
      account: acc,
      ...calcAfterTax(result.finalValue, result.totalContribution, acc.id, yearsNum, incomeNum > 0 ? incomeNum : undefined),
    }))
  }, [result, yearsNum, incomeNum])

  const bestTaxId = useMemo(() => {
    if (!taxComparisons.length) return null
    let best = taxComparisons[0]
    for (const tc of taxComparisons) {
      const totalA = tc.afterTaxFinal + (tc.taxCreditAmount ?? 0)
      const totalB = best.afterTaxFinal + (best.taxCreditAmount ?? 0)
      if (totalA > totalB) best = tc
    }
    return best.account.id
  }, [taxComparisons])

  /* ─── 인플레이션 ─── */
  const realValue = useMemo(() => {
    if (!result) return null
    return calcRealValue(result.finalValue, result.totalContribution, inflationNum, yearsNum, annualRateNum)
  }, [result, inflationNum, yearsNum, annualRateNum])

  /* ─── 시나리오 ─── */
  const scenarios = useMemo(() => {
    if (yearsNum <= 0) return []
    return RETURN_SCENARIOS.map(s => {
      const r = calcCompound({
        principal: principalNum,
        contribution: contributionNum,
        contributionFreqId,
        compoundFreqId,
        annualRate: s.rate,
        years: yearsNum,
        annualIncreaseRate: annualIncrNum,
        feeRate: feeNum,
      })
      return { scenario: s, result: r }
    })
  }, [principalNum, contributionNum, yearsNum, contributionFreqId, compoundFreqId, annualIncrNum, feeNum])

  const baselineFinal = scenarios.find(s => s.scenario.id === 'moderate')?.result.finalValue ?? 0

  const visibleSchedule = useMemo(() => {
    if (!result) return []
    if (showAllSchedule || result.breakdown.length <= 10) return result.breakdown
    // 1~5년, 마지막 3년만
    const head = result.breakdown.slice(0, 5)
    const tail = result.breakdown.slice(-3)
    return [...head, ...tail]
  }, [result, showAllSchedule])

  /* ─── 도넛 차트 ─── */
  const renderDonut = useCallback((principalAmt: number, interestAmt: number) => {
    const total = principalAmt + interestAmt
    if (total <= 0) return null
    const principalPct = principalAmt / total
    const r = 70
    const c = 2 * Math.PI * r
    const principalLen = c * principalPct
    return (
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--bg3)" strokeWidth="26" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#666" strokeWidth="26"
          strokeDasharray={`${principalLen} ${c}`} transform="rotate(-90 90 90)" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--accent)" strokeWidth="26"
          strokeDasharray={`${c - principalLen} ${c}`} strokeDashoffset={-principalLen}
          transform="rotate(-90 90 90)" />
        <text x="90" y="86" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="Noto Sans KR, sans-serif">
          수익 비중
        </text>
        <text x="90" y="106" textAnchor="middle" fill="var(--accent)" fontSize="22" fontFamily="Syne, sans-serif" fontWeight="800">
          {((1 - principalPct) * 100).toFixed(1)}%
        </text>
      </svg>
    )
  }, [])

  /* ─── 누적 자산 라인 차트 ─── */
  const renderLineChart = useCallback((breakdown: { year: number; principalCumulative: number; total: number }[]) => {
    if (!breakdown.length) return null
    const W = 600, H = 200, P = 30
    const maxY = Math.max(...breakdown.map(b => b.total))
    const xs = (i: number) => P + (W - P * 2) * (i / (breakdown.length - 1 || 1))
    const ys = (v: number) => H - P - (H - P * 1.6) * (v / maxY)

    const totalPath = breakdown.map((b, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(b.total)}`).join(' ')
    const principalPath = breakdown.map((b, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(b.principalCumulative)}`).join(' ')
    const totalArea = `${totalPath} L ${xs(breakdown.length - 1)} ${H - P} L ${xs(0)} ${H - P} Z`

    return (
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="cArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(200,255,62,0.30)" />
            <stop offset="100%" stopColor="rgba(200,255,62,0)" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={P} x2={W - P} y1={ys(maxY * (1 - t))} y2={ys(maxY * (1 - t))}
            stroke="var(--border)" strokeDasharray="3 3" />
        ))}
        <path d={totalArea} fill="url(#cArea)" />
        <path d={totalPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <path d={principalPath} fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* x-axis */}
        {breakdown.length >= 5 && [0, Math.floor(breakdown.length / 2), breakdown.length - 1].map(i => (
          <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" fill="var(--muted)" fontSize="10"
            fontFamily="Noto Sans KR, sans-serif">{breakdown[i].year}년</text>
        ))}
      </svg>
    )
  }, [])

  /* ──────────── RENDER ──────────── */

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 투자 자문 도구가 아닙니다.</strong> 본 계산기는 입력값에 기반한 수학적 시뮬레이션이며,
        실제 투자 수익률은 시장 변동·세금·수수료에 따라 달라집니다.
        <strong> 과거 수익률은 미래 수익을 보장하지 않습니다.</strong>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {[
          { id: 'main',      label: '기본 계산',  cls: styles.tabActive },
          { id: 'reverse',   label: '목표 역산',  cls: styles.tabActiveReverse },
          { id: 'tax',       label: '세금·절세',  cls: styles.tabActiveTax },
          { id: 'inflation', label: '인플레이션', cls: styles.tabActiveInflation },
          { id: 'scenario',  label: '시나리오',   cls: styles.tabActiveScenario },
        ].map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* ─── 공통 입력 카드 ─── */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>초기 원금<span className={styles.cardLabelHint}>거치 시작 금액</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={principal} onChange={e => setPrincipal(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>정기 적립액<span className={styles.cardLabelHint}>{CONTRIBUTION_FREQUENCIES.find(f=>f.id===contributionFreqId)?.name}당</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={contribution} onChange={e => setContribution(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>연 수익률</div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
              value={annualRate} onChange={e => setAnnualRate(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.chips}>
            {RATE_PRESETS.map(r => (
              <button key={r}
                className={`${styles.chip} ${annualRate === String(r) ? styles.chipActive : ''}`}
                onClick={() => setAnnualRate(String(r))}
              >{r}%</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>투자 기간</div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={years} onChange={e => setYears(e.target.value)} />
            <span className={styles.unit}>년</span>
          </div>
          <div className={styles.chips}>
            {YEAR_PRESETS.map(y => (
              <button key={y}
                className={`${styles.chip} ${years === String(y) ? styles.chipActive : ''}`}
                onClick={() => setYears(String(y))}
              >{y}년</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 고급 설정 (접기/펼치기) ─── */}
      <div className={styles.card}>
        <button className={styles.toggleBtn} style={{ width: '100%' }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >{showAdvanced ? '▲ 고급 설정 닫기' : '▼ 고급 설정 (적립 주기·복리 주기·증액·수수료)'}</button>

        {showAdvanced && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className={styles.cardLabel}>적립 주기</div>
              <div className={styles.optionRow5}>
                {CONTRIBUTION_FREQUENCIES.map(f => (
                  <button key={f.id}
                    className={`${styles.optionBtn} ${contributionFreqId === f.id ? styles.optionActive : ''}`}
                    onClick={() => setContributionFreqId(f.id)}
                  >{f.name}</button>
                ))}
              </div>
            </div>
            <div>
              <div className={styles.cardLabel}>복리 주기</div>
              <div className={styles.optionRow4}>
                {COMPOUND_FREQUENCIES.map(f => (
                  <button key={f.id}
                    className={`${styles.optionBtn} ${compoundFreqId === f.id ? styles.optionActive : ''}`}
                    onClick={() => setCompoundFreqId(f.id)}
                  >{f.name}</button>
                ))}
              </div>
            </div>
            <div className={styles.twoCol}>
              <div>
                <div className={styles.cardLabel}>매년 적립액 증액률</div>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal" step={0.5}
                    value={annualIncreaseRate} onChange={e => setAnnualIncreaseRate(e.target.value)} />
                  <span className={styles.unit}>%/년</span>
                </div>
              </div>
              <div>
                <div className={styles.cardLabel}>연 수수료율 (펀드/ETF)</div>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal" step={0.05}
                    value={feeRate} onChange={e => setFeeRate(e.target.value)} />
                  <span className={styles.unit}>%/년</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ──────────── TAB 1: 기본 계산 ──────────── */}
      {tab === 'main' && result && (
        <>
          <div className={`${styles.hero} ${styles.heroAccent}`}>
            <div className={styles.heroLabel}>{yearsNum}년 후 최종 금액</div>
            <div className={`${styles.heroNum} ${styles.heroNumAccent}`}>{formatEok(result.finalValue)}</div>
            <div className={styles.heroSub}>
              원금 {formatEok(result.totalContribution)} + 수익 {formatEok(result.totalInterest)}
            </div>
            <div className={styles.rateBadge}>
              실효 연 수익률 {result.effectiveAnnualReturn.toFixed(2)}%
            </div>
          </div>

          {/* 도넛 + 곡선 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>원금 vs 수익 — 누적 자산 곡선</div>
            <div className={styles.chartGrid}>
              <div className={styles.donutWrap}>
                {renderDonut(result.totalContribution, result.totalInterest)}
              </div>
              <div className={styles.lineChartWrap}>
                {renderLineChart(result.breakdown)}
              </div>
            </div>
            <div className={styles.chartLegend}>
              <span><i style={{ background: '#666' }} />원금 (납입 누계)</span>
              <span><i style={{ background: 'var(--accent)' }} />총 자산 (원금 + 수익)</span>
            </div>
          </div>

          {/* 연도별 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>연도별 누적 금액</div>
            <div className={styles.scheduleHead}>
              <span>연도</span><span>원금</span><span>수익</span><span>총액</span>
            </div>
            <div className={styles.scheduleBody}>
              {visibleSchedule.map(row => {
                const isMilestone = row.year % 10 === 0 || row.year === yearsNum
                return (
                  <div key={row.year}
                    className={`${styles.scheduleRow} ${isMilestone ? styles.scheduleRowMilestone : ''}`}>
                    <span>{row.year}년</span>
                    <span>{formatEok(row.principalCumulative)}</span>
                    <span>{formatEok(row.interestCumulative)}</span>
                    <span>{formatEok(row.total)}</span>
                  </div>
                )
              })}
            </div>
            {result.breakdown.length > 10 && (
              <button className={styles.showAllBtn} onClick={() => setShowAllSchedule(!showAllSchedule)}>
                {showAllSchedule ? '간단히 보기' : `전체 ${result.breakdown.length}년 보기`}
              </button>
            )}
          </div>
        </>
      )}

      {/* ──────────── TAB 2: 목표 역산 ──────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>목표 금액 — {yearsNum}년 후</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                value={goal} onChange={e => setGoal(e.target.value)} />
              <span className={styles.unit}>만원</span>
            </div>
            <div className={styles.chips}>
              {GOAL_PRESETS.map(g => (
                <button key={g.value}
                  className={`${styles.chip} ${goalNum === g.value ? styles.chipActive : ''}`}
                  onClick={() => setGoal(String(g.value / 10_000))}
                >{g.label}</button>
              ))}
            </div>
          </div>

          {reverse && (
            <div className={`${styles.hero} ${styles.heroGold}`}>
              <div className={styles.heroLabel}>{yearsNum}년 후 {formatEok(goalNum)} 달성</div>
              <div className={`${styles.heroNum} ${styles.heroNumGold}`}>
                {reverse.requiredMonthly === 0 ? '0원' : `매월 ${formatEok(reverse.requiredMonthly)}`}
              </div>
              <div className={styles.heroSub}>
                연 수익률 {annualRateNum}% · 초기 원금 {formatEok(principalNum)} 가정
              </div>
              <div className={styles.feasibilityBadge}
                style={{ background: `${reverse.feasibilityColor}1A`, color: reverse.feasibilityColor, border: `1px solid ${reverse.feasibilityColor}55` }}>
                {reverse.feasibilityLabel}
              </div>
              <div className={styles.feasibilityNote}>{reverse.feasibilityNote}</div>
            </div>
          )}

          <div className={styles.infoBox}>
            <strong>💡 역산 원리:</strong> 목표 금액·기간·수익률을 고정하고, 매월 적립액을 이진 탐색으로 찾습니다.
            연 수익률·기간을 늘리면 필요 월 적립액은 빠르게 줄어듭니다 (복리 효과).
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 세금·절세 ──────────── */}
      {tab === 'tax' && result && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>총급여 (연금저축·IRP 세액공제율 결정)</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                value={totalIncome} onChange={e => setTotalIncome(e.target.value)} />
              <span className={styles.unit}>만원/년</span>
            </div>
            <p className={styles.taxNote}>
              총급여 5,500만원 이하는 16.5%, 초과는 13.2% 세액공제율 적용 (2026 기준)
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>한국 6대 절세 계좌 비교 — 세후 실수익</div>
            <div className={styles.taxTableWrap}>
              <table className={styles.taxTable}>
                <thead>
                  <tr>
                    <th>계좌</th>
                    <th>세후 자산</th>
                    <th>세금</th>
                    <th>세액공제</th>
                    <th>총 실수익</th>
                  </tr>
                </thead>
                <tbody>
                  {taxComparisons.map(tc => {
                    const totalNet = tc.afterTaxFinal + (tc.taxCreditAmount ?? 0)
                    const isBest = bestTaxId === tc.account.id
                    const isSelected = accountId === tc.account.id
                    return (
                      <tr key={tc.account.id}
                        className={isBest ? styles.taxRowBest : (isSelected ? styles.taxRowSelected : '')}
                        onClick={() => setAccountId(tc.account.id)}
                        style={{ cursor: 'pointer' }}>
                        <td>{tc.account.name}{isBest && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent)' }}>★ 최적</span>}</td>
                        <td>{formatEok(tc.afterTaxFinal)}</td>
                        <td style={{ color: '#FF6B6B' }}>-{formatEok(tc.taxAmount)}</td>
                        <td>{tc.taxCreditAmount ? <span className={styles.deductionBadge}>+{formatEok(tc.taxCreditAmount)}</span> : '—'}</td>
                        <td style={{ color: 'var(--accent)' }}>{formatEok(totalNet)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.taxNote}>
              ※ 클릭하여 계좌 선택 · 세후 자산 = 만기 자산 - 세금 / 세액공제는 매년 환급 누계 (재투자 미반영)
            </p>
          </div>

          {/* 선택된 계좌 상세 */}
          <div className={`${styles.hero} ${styles.heroOrange}`}>
            <div className={styles.heroLabel}>{TAX_ACCOUNTS.find(a=>a.id===accountId)?.name} — 세후 실수익</div>
            <div className={`${styles.heroNum} ${styles.heroNumOrange}`}>
              {formatEok((taxComparisons.find(t=>t.account.id===accountId)?.afterTaxFinal ?? 0) + (taxComparisons.find(t=>t.account.id===accountId)?.taxCreditAmount ?? 0))}
            </div>
            <div className={styles.heroSub}>
              {TAX_ACCOUNTS.find(a=>a.id===accountId)?.desc}
            </div>
            <div className={styles.heroDesc}>
              ✅ {TAX_ACCOUNTS.find(a=>a.id===accountId)?.pros} · ⚠️ {TAX_ACCOUNTS.find(a=>a.id===accountId)?.cons}
            </div>
          </div>

          <div className={styles.warnBox}>
            <strong>⚠️ 면책:</strong> 세금 계산은 2026년 1월 기준 단순화 시뮬레이션입니다.
            ISA 의무 보유 기간·연금저축 중도 해지 페널티·종합소득세 합산 등 실제 적용은
            세무 전문가 또는 금융사 상담 후 결정하세요.
          </div>
        </>
      )}

      {/* ──────────── TAB 4: 인플레이션 ──────────── */}
      {tab === 'inflation' && result && realValue && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>예상 물가상승률 (인플레이션)</div>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
                value={inflationRate} onChange={e => setInflationRate(e.target.value)} />
              <span className={styles.unit}>%/년</span>
            </div>
            <div className={styles.optionRow5} style={{ marginTop: 10 }}>
              {INFLATION_PRESETS.map(p => (
                <button key={p.rate}
                  className={`${styles.optionBtn} ${parseFloat(inflationRate) === p.rate ? styles.optionActive : ''}`}
                  onClick={() => setInflationRate(String(p.rate))}
                >{p.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.compareGrid}>
            <div className={styles.compareCard}>
              <p className={styles.compareTitle}>명목 가치 (Nominal)</p>
              <p className={styles.compareDesc}>계산기에 표시되는 금액</p>
              <p className={`${styles.compareMain} ${styles.compareMainAccent}`}>{formatEok(result.finalValue)}</p>
              <p className={styles.compareLabel}>{yearsNum}년 후 통장 잔고</p>
            </div>
            <div className={`${styles.compareCard} ${styles.compareCardCyan}`}>
              <p className={styles.compareTitle}>실질 가치 (Real)</p>
              <p className={styles.compareDesc}>오늘의 구매력 기준</p>
              <p className={`${styles.compareMain} ${styles.compareMainCyan}`}>{formatEok(realValue.realValue)}</p>
              <p className={styles.compareLabel}>물가상승률 {inflationNum}% 적용</p>
            </div>
          </div>

          <div className={`${styles.hero} ${styles.heroCyan}`}>
            <div className={styles.heroLabel}>실질 연 수익률 (Fisher 공식)</div>
            <div className={`${styles.heroNum} ${styles.heroNumCyan}`}>{realValue.realReturnRate.toFixed(2)}%</div>
            <div className={styles.heroSub}>
              명목 {annualRateNum}% − 인플레이션 {inflationNum}% ≈ 실질 {realValue.realReturnRate.toFixed(2)}%
            </div>
            <div className={styles.heroDesc}>
              구매력 손실: {realValue.purchasingPowerLossPercent}% · 실질 가치 = 명목 ÷ (1+인플레이션)^{yearsNum}
            </div>
          </div>

          <div className={styles.infoBox}>
            <strong>💡 왜 실질 수익률이 중요한가?</strong> 30년 후 「3억」을 모았다 해도, 물가가 2배가 되면
            오늘의 1.5억 구매력에 불과합니다. 장기 투자에서는 항상 명목보다 <strong>실질 수익률(명목 - 인플레이션)</strong>로
            판단해야 실수가 없습니다. 한국은행 목표 인플레이션은 2.0%, 최근 10년 평균은 약 2.5%입니다.
          </div>
        </>
      )}

      {/* ──────────── TAB 5: 시나리오 비교 ──────────── */}
      {tab === 'scenario' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>4가지 수익률 시나리오 — {yearsNum}년 후 자산</div>
            <div className={styles.scenarioTable}>
              <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                <span className={styles.scenarioName}>시나리오</span>
                <span className={styles.scenarioRate}>수익률</span>
                <span className={styles.scenarioValue}>최종 자산</span>
                <span className={styles.scenarioDelta}>기준 대비</span>
              </div>
              {scenarios.map(({ scenario, result: r }) => {
                const isBaseline = scenario.id === 'moderate'
                const delta = r.finalValue - baselineFinal
                const deltaCls = delta > 0 ? styles.deltaPositive : (delta < 0 ? styles.deltaNegative : styles.deltaZero)
                return (
                  <div key={scenario.id}
                    className={`${styles.scenarioRow} ${isBaseline ? styles.scenarioRowBaseline : ''}`}>
                    <span className={styles.scenarioName} style={{ color: scenario.color }}>
                      {scenario.name}{scenario.warning && <span style={{ fontSize: 10.5, color: '#FF8C3E', marginLeft: 6 }}>⚠ {scenario.warning}</span>}
                    </span>
                    <span className={styles.scenarioRate} style={{ color: scenario.color }}>{scenario.rate}%</span>
                    <span className={styles.scenarioValue}>{formatEok(r.finalValue)}</span>
                    <span className={`${styles.scenarioDelta} ${deltaCls}`}>
                      {delta === 0 ? '— 기준' : (delta > 0 ? `+${formatEok(delta)}` : `${formatEok(delta)}`)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.threeCol}>
            {scenarios.slice(0, 3).map(({ scenario, result: r }) => (
              <div key={scenario.id} className={styles.compareCard}
                style={{ borderColor: `${scenario.color}55`, background: `${scenario.color}0A` }}>
                <p className={styles.compareTitle} style={{ color: scenario.color }}>{scenario.name} ({scenario.rate}%)</p>
                <p className={styles.compareDesc}>{scenario.desc}</p>
                <p className={styles.compareMain} style={{ color: scenario.color }}>
                  {formatEok(r.finalValue)}
                </p>
                <p className={styles.compareLabel}>수익 {formatEok(r.totalInterest)}</p>
              </div>
            ))}
          </div>

          <div className={styles.warnBox}>
            <strong>⚠️ 시나리오는 가정일 뿐입니다.</strong> 보수적(4%)·기준(7%)·낙관적(10%)·공격적(13%)은
            S&P500·국내주식·채권 장기 평균을 참고한 단순 가정이며, 특정 상품의 수익을 예측하지 않습니다.
            <strong> 공격적 13% 시나리오는 큰 변동성을 동반</strong>하며, 단기적으로 -50% 손실도 가능합니다.
          </div>
        </>
      )}

      {/* 빈 상태 */}
      {!result && tab !== 'reverse' && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>입력값을 확인해주세요</p>
          <p>원금 또는 적립액, 연 수익률(&gt;0), 투자 기간(&gt;0)을 입력하면 계산됩니다.</p>
        </div>
      )}

    </div>
  )
}
