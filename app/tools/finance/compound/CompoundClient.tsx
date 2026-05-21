'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo } from 'react'
import styles from './compound.module.css'
import {
  RETURN_SCENARIOS,
  CONTRIBUTION_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  INFLATION_PRESETS,
  calcCompound,
  reverseCalcContribution,
  calcRealValue,
  formatEok,
  parseAmount,
} from './compoundUtils'

const PRINCIPAL_PRESETS = [
  { label: '1,000만', value: 1000 },
  { label: '3,000만', value: 3000 },
  { label: '5,000만', value: 5000 },
  { label: '1억',     value: 10000 },
]
const YEAR_PRESETS = [5, 10, 15, 20, 30]
const RATE_PRESETS = [3, 5, 7, 10, 13]
const GOAL_PRESETS = [
  { label: '5천만', value: 5000 },
  { label: '1억',   value: 10000 },
  { label: '3억',   value: 30000 },
  { label: '5억',   value: 50000 },
  { label: '10억',  value: 100000 },
]
/* 적립주기 — 사용자 요청에 따라 4종 (매일/매주/매월/매년) */
const SIMPLE_CONTRIB_FREQS = [
  { id: 'daily',   name: '매일',   periodsPerYear: 365 },
  { id: 'weekly',  name: '매주',   periodsPerYear: 52 },
  { id: 'monthly', name: '매월',   periodsPerYear: 12 },
  { id: 'yearly',  name: '매년',   periodsPerYear: 1 },
]

type RateType = 'yearly' | 'monthly'

/* 단위 입력 (만원 단위) → 원 변환 */
function manToWon(manStr: string) {
  const n = parseAmount(manStr)
  return n * 10_000
}

export default function CompoundClient() {
  /* ─── 6개 입력 ─── */
  const [principal,    setPrincipal]    = useState('1000')   // 만원
  const [years,        setYears]        = useState('20')     // 년

  // 적립액 + 주기
  const [contribution, setContribution] = useState('30')     // 만원
  const [contributionFreqId, setContributionFreqId] = useState('monthly')

  // 수익률 (월/년 선택) + 복리주기
  const [rateInput, setRateInput] = useState('7')            // %
  const [rateType,  setRateType]  = useState<RateType>('yearly')
  const [compoundFreqId, setCompoundFreqId] = useState('monthly')

  // 목표 금액
  const [goal, setGoal] = useState('10000')   // 만원

  // 물가 상승률
  const [inflationRate, setInflationRate] = useState('2.5')  // %

  /* ─── 파싱 ─── */
  const principalNum    = manToWon(principal)
  const contributionNum = manToWon(contribution)
  const yearsNum        = parseInt(years) || 0
  const goalNum         = manToWon(goal)
  const inflationNum    = parseFloat(inflationRate) || 0

  // 월 수익률 → 연 수익률 환산
  const annualRateNum = useMemo(() => {
    const v = parseFloat(rateInput) || 0
    if (rateType === 'monthly') {
      return (Math.pow(1 + v / 100, 12) - 1) * 100
    }
    return v
  }, [rateInput, rateType])

  /* ─── 메인 계산 ─── */
  const result = useMemo(() => {
    if (yearsNum <= 0 || annualRateNum <= 0) return null
    return calcCompound({
      principal: principalNum,
      contribution: contributionNum,
      contributionFreqId,
      compoundFreqId,
      annualRate: annualRateNum,
      years: yearsNum,
    })
  }, [principalNum, contributionNum, annualRateNum, yearsNum, contributionFreqId, compoundFreqId])

  /* ─── 목표 역산 ─── */
  const reverse = useMemo(() => {
    if (goalNum <= 0 || yearsNum <= 0 || annualRateNum <= 0) return null
    return reverseCalcContribution({
      goal: goalNum,
      principal: principalNum,
      years: yearsNum,
      annualRate: annualRateNum,
      contributionFreqId,
      compoundFreqId,
    })
  }, [goalNum, principalNum, yearsNum, annualRateNum, contributionFreqId, compoundFreqId])

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
      })
      return { scenario: s, result: r }
    })
  }, [principalNum, contributionNum, yearsNum, contributionFreqId, compoundFreqId])

  const baselineFinal = scenarios.find(s => s.scenario.id === 'moderate')?.result.finalValue ?? 0

  /* ─── 연도별 표 ─── */
  const [showAllSchedule, setShowAllSchedule] = useState(false)
  const visibleSchedule = useMemo(() => {
    if (!result) return []
    if (showAllSchedule || result.breakdown.length <= 10) return result.breakdown
    const head = result.breakdown.slice(0, 5)
    const tail = result.breakdown.slice(-3)
    return [...head, ...tail]
  }, [result, showAllSchedule])

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
        투자 자문 도구가 아닙니다.
      </Disclaimer>

      {/* ─── 입력: 6개 카드, 3열 그리드 ─── */}
      <div className={styles.threeCol}>

        {/* 1. 초기 원금 */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>초기 원금<span className={styles.cardLabelHint}>거치 시작 금액</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={principal} onChange={e => setPrincipal(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
          <div className={styles.chips}>
            {PRINCIPAL_PRESETS.map(p => (
              <button key={p.value}
                className={`${styles.chip} ${principal === String(p.value) ? styles.chipActive : ''}`}
                onClick={() => setPrincipal(String(p.value))}
              >{p.label}</button>
            ))}
          </div>
        </div>

        {/* 2. 투자 기간 */}
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

        {/* 3. 적립액 + 주기 */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>정기 적립액<span className={styles.cardLabelHint}>주기당</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={contribution} onChange={e => setContribution(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
          <div className={styles.chips}>
            {SIMPLE_CONTRIB_FREQS.map(f => (
              <button key={f.id}
                className={`${styles.chip} ${contributionFreqId === f.id ? styles.chipActive : ''}`}
                onClick={() => setContributionFreqId(f.id)}
              >{f.name}</button>
            ))}
          </div>
        </div>

        {/* 4. 수익률 (월/년 선택) + 복리 주기 */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            수익률
            <span className={styles.cardLabelHint}>
              연 환산 {annualRateNum.toFixed(2)}%
            </span>
          </div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
              value={rateInput} onChange={e => setRateInput(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          {/* 월/년 토글 */}
          <div className={styles.optionRow} style={{ marginTop: 8 }}>
            <button
              className={`${styles.optionBtn} ${rateType === 'yearly' ? styles.optionActive : ''}`}
              onClick={() => setRateType('yearly')}
            >연 수익률</button>
            <button
              className={`${styles.optionBtn} ${rateType === 'monthly' ? styles.optionActive : ''}`}
              onClick={() => setRateType('monthly')}
            >월 수익률</button>
          </div>
          {/* 연 수익률 모드일 때만 빠른 프리셋 노출 */}
          {rateType === 'yearly' && (
            <div className={styles.chips}>
              {RATE_PRESETS.map(r => (
                <button key={r}
                  className={`${styles.chip} ${rateInput === String(r) ? styles.chipActive : ''}`}
                  onClick={() => setRateInput(String(r))}
                >{r}%</button>
              ))}
            </div>
          )}
          {/* 복리 주기 */}
          <div className={styles.optionRow4} style={{ marginTop: 10 }}>
            {COMPOUND_FREQUENCIES.map(f => (
              <button key={f.id}
                className={`${styles.optionBtn} ${compoundFreqId === f.id ? styles.optionActive : ''}`}
                onClick={() => setCompoundFreqId(f.id)}
              >{f.name}</button>
            ))}
          </div>
        </div>

        {/* 5. 목표 금액 */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>목표 금액<span className={styles.cardLabelHint}>{yearsNum}년 후 달성</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              value={goal} onChange={e => setGoal(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
          <div className={styles.chips}>
            {GOAL_PRESETS.map(g => (
              <button key={g.value}
                className={`${styles.chip} ${goal === String(g.value) ? styles.chipActive : ''}`}
                onClick={() => setGoal(String(g.value))}
              >{g.label}</button>
            ))}
          </div>
        </div>

        {/* 6. 물가 상승률 */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>물가 상승률<span className={styles.cardLabelHint}>인플레이션</span></div>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal" step={0.1}
              value={inflationRate} onChange={e => setInflationRate(e.target.value)} />
            <span className={styles.unit}>%/년</span>
          </div>
          <div className={styles.chips}>
            {INFLATION_PRESETS.map(p => (
              <button key={p.rate}
                className={`${styles.chip} ${parseFloat(inflationRate) === p.rate ? styles.chipActive : ''}`}
                onClick={() => setInflationRate(String(p.rate))}
              >{p.rate}%</button>
            ))}
          </div>
        </div>

      </div>

      {/* ─────────────── 결과 ─────────────── */}

      {!result ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>입력값을 확인해주세요</p>
          <p>원금 또는 적립액, 수익률(&gt;0), 투자 기간(&gt;0)을 입력하면 계산됩니다.</p>
        </div>
      ) : (
        <>
          {/* 1. 메인 결과 — 최종 자산 */}
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

          {/* 2. 목표 역산 */}
          {reverse && (
            <div className={`${styles.hero} ${styles.heroGold}`}>
              <div className={styles.heroLabel}>{yearsNum}년 후 {formatEok(goalNum)} 달성</div>
              <div className={`${styles.heroNum} ${styles.heroNumGold}`}>
                {reverse.requiredMonthly === 0 ? '0원' : `매월 ${formatEok(reverse.requiredMonthly)}`}
              </div>
              <div className={styles.heroSub}>
                연 수익률 {annualRateNum.toFixed(2)}% · 초기 원금 {formatEok(principalNum)} 가정
              </div>
              <div className={styles.feasibilityBadge}
                style={{ background: `${reverse.feasibilityColor}1A`, color: reverse.feasibilityColor, border: `1px solid ${reverse.feasibilityColor}55` }}>
                {reverse.feasibilityLabel}
              </div>
              <div className={styles.feasibilityNote}>{reverse.feasibilityNote}</div>
            </div>
          )}

          {/* 3. 인플레이션 실질 가치 */}
          {realValue && (
            <>
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
                  명목 {annualRateNum.toFixed(2)}% − 인플레이션 {inflationNum}% ≈ 실질 {realValue.realReturnRate.toFixed(2)}%
                </div>
                <div className={styles.heroDesc}>
                  구매력 손실: {realValue.purchasingPowerLossPercent}% · 실질 가치 = 명목 ÷ (1+인플레이션)^{yearsNum}
                </div>
              </div>
            </>
          )}

          {/* 4. 시나리오 비교 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>수익률 시나리오 비교 — {yearsNum}년 후 자산</div>
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
                      {scenario.name}{scenario.warning && <span style={{ fontSize: 10.5, color: '#EA580C', marginLeft: 6 }}>⚠ {scenario.warning}</span>}
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

          {/* 5. 연도별 누적 금액 표 */}
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

    </div>
  )
}
