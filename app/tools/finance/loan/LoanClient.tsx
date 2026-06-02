'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import styles from './loan.module.css'
import {
  RepaymentMethod, PrepaymentMode,
  LOAN_PRESETS, KOREA_LOAN_RATES,
  calcEqualPayment, calcEqualPrincipal, calcInterestOnly,
  simulatePrepayment, simulateRefinance,
  simulateRateChanges, calcAffordableLoan, calcDSR,
  won, formatEok, parseAmount,
} from './loanUtils'

type Tab = 'main' | 'prepay' | 'refi' | 'rate' | 'reverse' | 'compare'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'main',    name: '기본 계산',   icon: '💳' },
  { id: 'prepay',  name: '중도상환',    icon: '💰' },
  { id: 'refi',    name: '갈아타기',    icon: '🔄' },
  { id: 'rate',    name: '금리 변동',    icon: '📊' },
  { id: 'reverse', name: '역산',        icon: '🎯' },
  { id: 'compare', name: '비교표',      icon: '📋' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  main:    styles.tabActive,
  prepay:  styles.tabActivePrepay,
  refi:    styles.tabActiveRefi,
  rate:    styles.tabActiveRate,
  reverse: styles.tabActiveReverse,
  compare: styles.tabActiveCompare,
}

const PERIOD_PRESETS = [12, 24, 36, 60, 120, 240]   // 30년 제거
const GRACE_PRESETS = [0, 12, 24, 36, 60]

export default function LoanClient() {
  const [tab, setTab] = useState<Tab>('main')

  /* 공통 입력 */
  const [principal, setPrincipal] = useState('30000')  // 만원
  const [rate, setRate] = useState('4.3')
  const [months, setMonths] = useState('360')
  const [graceMonths, setGraceMonths] = useState(0)
  const [method, setMethod] = useState<RepaymentMethod>('equal-payment')

  const principalWon = parseAmount(principal) * 10_000
  const rateNum = parseFloat(rate) || 0
  const monthsNum = parseInt(months, 10) || 0
  // 프리셋 제거됨 — 주담대 기본 금리 참조만 유지
  const presetId = 'mortgage'

  // 금리 0%(무이자 할부 등)도 허용 — 엔진은 r===0 분기를 지원. 단 금리 칸은 비어있지 않아야 함
  const inputValid = principalWon > 0 && rate.trim() !== '' && rateNum >= 0 && monthsNum > 0

  /* 메인 계산 (3가지 동시) */
  const ep = useMemo(() => inputValid ? calcEqualPayment({
    principal: principalWon, annualRate: rateNum, months: monthsNum,
    graceMonths, method: 'equal-payment',
  }) : null, [inputValid, principalWon, rateNum, monthsNum, graceMonths])

  const epr = useMemo(() => inputValid ? calcEqualPrincipal({
    principal: principalWon, annualRate: rateNum, months: monthsNum, graceMonths,
  }) : null, [inputValid, principalWon, rateNum, monthsNum, graceMonths])

  const intOnly = useMemo(() => inputValid ? calcInterestOnly({
    principal: principalWon, annualRate: rateNum, months: monthsNum,
  }) : null, [inputValid, principalWon, rateNum, monthsNum])

  const activeResult = method === 'equal-principal' ? epr : method === 'interest-only' ? intOnly : ep

  /* 표시 — 첫 12개월 + 마일스톤 */
  const [showAll, setShowAll] = useState(false)
  const displaySchedule = useMemo(() => {
    if (!activeResult) return []
    const sch = activeResult.schedule
    if (showAll) return sch
    const milestones = [12, 24, 36, 60, 120, 180, 240, 300, 360]
    const indices = new Set<number>()
    for (let i = 0; i < Math.min(12, sch.length); i++) indices.add(i)
    for (const m of milestones) if (m <= sch.length) indices.add(m - 1)
    if (sch.length > 0) indices.add(sch.length - 1)
    return Array.from(indices).sort((a, b) => a - b).map(i => sch[i]).filter(Boolean)
  }, [activeResult, showAll])

  /* ─── 탭 2: 중도상환 ─── */
  const [prepaymentAmount, setPrepaymentAmount] = useState('1000')
  const [prepaymentMonth, setPrepaymentMonth] = useState(24)
  const [prepaymentMode, setPrepaymentMode] = useState<PrepaymentMode>('reduce-period')
  const [prepaymentFeeRate, setPrepaymentFeeRate] = useState(1.2)

  const prepayResult = useMemo(() => {
    if (!inputValid) return null
    const amount = parseAmount(prepaymentAmount) * 10_000
    if (amount <= 0) return null
    return simulatePrepayment({
      principal: principalWon, annualRate: rateNum, months: monthsNum, graceMonths,
      method: 'equal-payment',
      prepaymentMonth, prepaymentAmount: amount, prepaymentMode, prepaymentFeeRate,
    })
  }, [inputValid, principalWon, rateNum, monthsNum, graceMonths,
      prepaymentAmount, prepaymentMonth, prepaymentMode, prepaymentFeeRate])

  /* ─── 탭 3: 갈아타기 ─── */
  const [refiCurrentRate, setRefiCurrentRate] = useState('5.0')
  const [refiRemaining, setRefiRemaining] = useState('25000')   // 만원
  const [refiRemainMonths, setRefiRemainMonths] = useState('300')
  const [refiNewRate, setRefiNewRate] = useState('4.0')
  const [refiNewMonths, setRefiNewMonths] = useState('300')
  const [refiPrepayFee, setRefiPrepayFee] = useState('200')      // 만원
  const [refiOriginFee, setRefiOriginFee] = useState('100')      // 만원
  const [refiOtherFees, setRefiOtherFees] = useState('50')        // 만원

  const refiResult = useMemo(() => {
    const remaining = parseAmount(refiRemaining) * 10_000
    if (remaining <= 0) return null
    return simulateRefinance({
      remainingPrincipal: remaining,
      currentRate: parseFloat(refiCurrentRate) || 0,
      remainingMonths: parseInt(refiRemainMonths, 10) || 0,
      currentPrepaymentFee: parseAmount(refiPrepayFee) * 10_000,
      newRate: parseFloat(refiNewRate) || 0,
      newMonths: parseInt(refiNewMonths, 10) || 0,
      newOriginationFee: parseAmount(refiOriginFee) * 10_000,
      newOtherFees: parseAmount(refiOtherFees) * 10_000,
    })
  }, [refiRemaining, refiCurrentRate, refiRemainMonths, refiPrepayFee,
      refiNewRate, refiNewMonths, refiOriginFee, refiOtherFees])

  /* ─── 탭 4: 금리 변동 ─── */
  const rateScenarios = useMemo(() => inputValid ? simulateRateChanges({
    principal: principalWon, annualRate: rateNum, months: monthsNum, graceMonths,
  }) : [], [inputValid, principalWon, rateNum, monthsNum, graceMonths])

  /* ─── 탭 5: 역산 ─── */
  const [revMonthly, setRevMonthly] = useState('100')   // 만원
  const [revRate, setRevRate] = useState('4.5')
  const [revMonths, setRevMonths] = useState('360')
  const [revIncome, setRevIncome] = useState('5000')      // 만원
  const [revOtherDebt, setRevOtherDebt] = useState('0')  // 만원

  const reverseResult = useMemo(() => {
    const monthly = parseAmount(revMonthly) * 10_000
    if (monthly <= 0) return null
    return calcAffordableLoan({
      monthlyPayment: monthly,
      annualRate: parseFloat(revRate) || 0,
      months: parseInt(revMonths, 10) || 0,
    })
  }, [revMonthly, revRate, revMonths])

  const dsrResult = useMemo(() => {
    const monthly = parseAmount(revMonthly) * 10_000
    const income = parseAmount(revIncome) * 10_000
    const other = parseAmount(revOtherDebt) * 10_000 * 12  // 월 → 연
    if (monthly <= 0 || income <= 0) return null
    return calcDSR({
      annualIncome: income,
      yearlyPayment: monthly * 12,
      otherYearlyDebt: other,
    })
  }, [revMonthly, revIncome, revOtherDebt])

  /* 다른 금리·기간 비교 (역산용) */
  const reverseRateTable = useMemo(() => {
    const monthly = parseAmount(revMonthly) * 10_000
    const m = parseInt(revMonths, 10) || 0
    if (monthly <= 0 || m <= 0) return []
    return [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map(r => ({
      rate: r,
      result: calcAffordableLoan({ monthlyPayment: monthly, annualRate: r, months: m }),
    }))
  }, [revMonthly, revMonths])

  const reverseTermTable = useMemo(() => {
    const monthly = parseAmount(revMonthly) * 10_000
    const r = parseFloat(revRate) || 0
    if (monthly <= 0 || r <= 0) return []
    return [120, 180, 240, 300, 360].map(m => ({
      months: m,
      result: calcAffordableLoan({ monthlyPayment: monthly, annualRate: r, months: m }),
    }))
  }, [revMonthly, revRate])

  /* ─── 탭 6: 비교표 ─── */
  const compareTermTable = useMemo(() => {
    if (!inputValid) return []
    return [120, 180, 240, 300, 360].map(m => {
      const r = calcEqualPayment({ principal: principalWon, annualRate: rateNum, months: m, graceMonths })
      return { months: m, monthlyPayment: r.monthlyPayment, totalInterest: r.totalInterest, totalPayment: r.totalPayment }
    })
  }, [inputValid, principalWon, rateNum, graceMonths])

  const compareRateTable = useMemo(() => {
    if (!inputValid || monthsNum <= 0) return []
    return [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map(r => {
      const result = calcEqualPayment({ principal: principalWon, annualRate: r, months: monthsNum, graceMonths })
      return { rate: r, monthlyPayment: result.monthlyPayment, totalInterest: result.totalInterest }
    })
  }, [inputValid, principalWon, monthsNum, graceMonths])

  /* 복사 */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* */ }
  }

  /* DSR 알림 — DSR 40% 초과 시 강한 경고 */
  const dsrWarning = dsrResult && dsrResult.dsr > 40

  /* ─────────────────── 렌더 ─────────────────── */
  return (
    <div className={styles.wrap}>

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '금융감독원 파인', href: 'https://fine.fss.or.kr' },
          { label: '금융위원회', href: 'https://www.fsc.go.kr' },
        ]}
      >
        참고용 추정 도구
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="대출 계산 모드">
        {TABS.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 — 2열 그리드 (모바일 1열) */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>대출 원금 (만원)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30000" value={principal} onChange={e => setPrincipal(e.target.value)} />
            <span className={styles.unit}>만원</span>
          </div>
          {parseAmount(principal) > 0 && (
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
              ≈ {formatEok(parseAmount(principal) * 10_000)}
            </p>
          )}
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            연 금리 (%)
            <span className={styles.cardLabelHint}>한국 평균 표시</span>
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="4.3" value={rate} step="0.05"
              onChange={e => setRate(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          {(() => {
            const preset = LOAN_PRESETS.find(p => p.id === presetId)
            const ref = preset?.rateRefId ? KOREA_LOAN_RATES.find(k => k.id === preset.rateRefId) : null
            return ref ? (
              <p style={{ fontSize: 11.5, color: '#0891B2', marginTop: 6 }}>
                💡 {ref.name} 평균 <strong>{ref.avg}%</strong> ({ref.min}~{ref.max}%)
              </p>
            ) : null
          })()}
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>대출 기간 (개월)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="240" value={months} onChange={e => setMonths(e.target.value)} />
            <span className={styles.unit}>개월</span>
          </div>
          <div className={styles.chips}>
            {PERIOD_PRESETS.map(m => (
              <button key={m} type="button" aria-pressed={months === String(m)}
                className={`${styles.chip} ${months === String(m) ? styles.chipActive : ''}`}
                onClick={() => setMonths(String(m))}>
                {m >= 12 ? `${m / 12}년` : `${m}개월`}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>거치기간 (개월)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="0" value={graceMonths || ''}
              onChange={e => setGraceMonths(parseInt(e.target.value) || 0)} />
            <span className={styles.unit}>개월</span>
          </div>
          <div className={styles.chips}>
            {GRACE_PRESETS.map(m => (
              <button key={m} type="button" aria-pressed={graceMonths === m}
                className={`${styles.chip} ${graceMonths === m ? styles.chipActive : ''}`}
                onClick={() => setGraceMonths(m)}>
                {m === 0 ? '없음' : `${m / 12}년`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!inputValid && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>대출 원금·금리·기간을 입력하세요</div>
        </div>
      )}

      {/* ─── 탭 1: 기본 계산 ─── */}
      {tab === 'main' && ep && epr && intOnly && (
        <>
          {/* 3가지 상환 방식 — 컴팩트 카드 */}
          <div className={styles.compareGrid3}>
            <div className={styles.compareCardCompact}>
              <div className={styles.compareTitle}>원리금균등</div>
              <div className={styles.compareMain}>{won(ep.monthlyPayment)}</div>
              <div className={styles.compareLabel}>월 (고정)</div>
              <div className={styles.compareMini}>총 이자 <strong>{formatEok(ep.totalInterest)}</strong></div>
            </div>
            <div className={`${styles.compareCardCompact} ${styles.compareCardAccent}`}>
              <div className={styles.compareTitle}>원금균등</div>
              <div className={styles.compareMain}>{won(epr.firstPayment)}</div>
              <div className={styles.compareLabel}>첫달 (점차↓)</div>
              <div className={styles.compareMini}>총 이자 <strong>{formatEok(epr.totalInterest)}</strong></div>
              <div className={styles.savingBadgeCompact}>이자 {formatEok(ep.totalInterest - epr.totalInterest)} ↓</div>
            </div>
            <div className={styles.compareCardCompact}>
              <div className={styles.compareTitle}>만기일시</div>
              <div className={styles.compareMain}>{won(intOnly.monthlyPayment)}</div>
              <div className={styles.compareLabel}>월 이자만</div>
              <div className={styles.compareMini}>총 이자 <strong>{formatEok(intOnly.totalInterest)}</strong></div>
            </div>
          </div>

          {/* 월별 상환 내역 */}
          {activeResult && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>월별 상환 내역</label>
              {/* 상환 방식 선택 칩 */}
              <div className={styles.chips} style={{ marginBottom: 10 }} role="group" aria-label="상환 방식 선택">
                <button type="button" aria-pressed={method === 'equal-payment'}
                  className={`${styles.chip} ${method === 'equal-payment' ? styles.chipActive : ''}`}
                  onClick={() => setMethod('equal-payment')}>원리금균등</button>
                <button type="button" aria-pressed={method === 'equal-principal'}
                  className={`${styles.chip} ${method === 'equal-principal' ? styles.chipActive : ''}`}
                  onClick={() => setMethod('equal-principal')}>원금균등</button>
                <button type="button" aria-pressed={method === 'interest-only'}
                  className={`${styles.chip} ${method === 'interest-only' ? styles.chipActive : ''}`}
                  onClick={() => setMethod('interest-only')}>만기일시</button>
              </div>
              <div className={styles.scheduleHead}>
                <span>회차</span><span>원금</span><span>이자</span><span>납입액</span><span>잔액</span>
              </div>
              <div className={styles.scheduleBody}>
                {displaySchedule.map(row => {
                  const isMilestone = !showAll && [12, 24, 36, 60, 120, 180, 240, 300, 360].includes(row.month)
                  return (
                    <div key={row.month}
                      className={`${styles.scheduleRow} ${isMilestone ? styles.scheduleRowMilestone : ''}`}>
                      <span className={styles.scheduleMonth}>{row.month}회</span>
                      <span data-label="원금">{row.principal.toLocaleString()}</span>
                      <span data-label="이자">{row.interest.toLocaleString()}</span>
                      <span data-label="납입액">{row.payment.toLocaleString()}</span>
                      <span data-label="잔액">{row.balance.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
              {activeResult.schedule.length > 12 && (
                <button className={styles.showAllBtn} onClick={() => setShowAll(v => !v)}>
                  {showAll ? `↑ 마일스톤만 보기` : `↓ 전체 ${activeResult.schedule.length}회 보기`}
                </button>
              )}
            </div>
          )}

          <div className={styles.resultActions}>
            <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(`대출 ${formatEok(principalWon)} / ${rateNum}% / ${monthsNum}개월 / 원리금균등 → 월 ${won(ep.monthlyPayment)} · 총 이자 ${formatEok(ep.totalInterest)}`)}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
        </>
      )}

      {/* ─── 탭 2: 중도상환 ─── */}
      {tab === 'prepay' && ep && (
        <>
          <div className={styles.disclaimer}>
            💰 <strong>중도상환 시뮬</strong> — 잔여 원금을 일부 갚으면 총 이자를 줄일 수 있습니다. 중도상환수수료(주담대 3년 이내 1.0~1.5%)와 비교해 순절감액을 계산하세요. <strong>※ 원리금균등 상환 기준</strong>입니다.
          </div>

          <div className={styles.threeCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>중도상환 금액 (만원)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="1000" value={prepaymentAmount} onChange={e => setPrepaymentAmount(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>중도상환 시점 — {prepaymentMonth}개월차 ({(prepaymentMonth / 12).toFixed(1)}년)</label>
              <input className={styles.slider} type="range" min="1" max={monthsNum - 1} step="1"
                aria-label={`중도상환 시점 (개월차)`}
                aria-valuetext={`${prepaymentMonth}개월차`}
                value={prepaymentMonth} onChange={e => setPrepaymentMonth(parseInt(e.target.value, 10))} />
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>수수료율 — {prepaymentFeeRate}%</label>
              <div className={styles.optionRow4} role="group" aria-label="중도상환 수수료율">
                {[0, 0.8, 1.2, 1.5].map(r => (
                  <button key={r} type="button" aria-pressed={prepaymentFeeRate === r}
                    className={`${styles.optionBtn} ${prepaymentFeeRate === r ? styles.optionActive : ''}`}
                    onClick={() => setPrepaymentFeeRate(r)}>
                    {r === 0 ? '면제' : `${r}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>상환 모드</label>
            <div className={styles.toggleRow} role="group" aria-label="중도상환 상환 모드">
              <button type="button" aria-pressed={prepaymentMode === 'reduce-period'}
                className={`${styles.toggleBtn} ${prepaymentMode === 'reduce-period' ? styles.toggleActive : ''}`}
                onClick={() => setPrepaymentMode('reduce-period')}>
                기간 단축 (월 동일·기간 ↓)
              </button>
              <button type="button" aria-pressed={prepaymentMode === 'reduce-payment'}
                className={`${styles.toggleBtn} ${prepaymentMode === 'reduce-payment' ? styles.toggleActive : ''}`}
                onClick={() => setPrepaymentMode('reduce-payment')}>
                월 상환액 감소 (기간 동일)
              </button>
            </div>
          </div>

          {prepayResult && (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(202,138,4,0.40)', background: 'rgba(202,138,4,0.06)' }}>
                <div className={styles.heroLabel}>순절감액</div>
                <div className={styles.heroNum}
                  style={{ color: prepayResult.netSaving > 0 ? '#CA8A04' : '#DC2626' }}>
                  {prepayResult.netSaving > 0 ? '−' : '+'}{formatEok(Math.abs(prepayResult.netSaving))}
                </div>
                <div className={styles.heroSub}>
                  중도상환 {formatEok(parseAmount(prepaymentAmount) * 10_000)} · {prepaymentMonth}개월차 시점 ·
                  {' '}{prepaymentMode === 'reduce-period' ? `${prepayResult.monthsShortened}개월 단축` : `월 상환액 ${won(prepayResult.newMonthlyPayment)}`}
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>비교</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}><span>기존 총 이자</span><span>{formatEok(prepayResult.originalTotalInterest)}</span></div>
                  <div className={styles.detailRow}><span>중도상환 후 총 이자</span><span>{formatEok(prepayResult.newTotalInterest)}</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>줄어드는 이자</span><span>−{formatEok(prepayResult.interestSaved)}</span></div>
                  <div className={styles.detailRow}><span>중도상환수수료</span><span>+{won(prepayResult.prepaymentFee)}</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>순절감액</span><span style={{ color: prepayResult.netSaving > 0 ? '#CA8A04' : '#DC2626' }}>{prepayResult.netSaving > 0 ? '−' : '+'}{formatEok(Math.abs(prepayResult.netSaving))}</span></div>
                  {prepaymentMode === 'reduce-period' && prepayResult.monthsShortened > 0 && (
                    <div className={styles.detailRow}><span>단축되는 기간</span><span>{prepayResult.monthsShortened}개월 ({(prepayResult.monthsShortened / 12).toFixed(1)}년)</span></div>
                  )}
                  {prepaymentMode === 'reduce-payment' && (
                    <div className={styles.detailRow}><span>새 월 상환액</span><span>{won(prepayResult.newMonthlyPayment)}</span></div>
                  )}
                </div>
              </div>

              <div className={styles.warnBox}>
                ⚠️ <strong>중도상환수수료는 은행·상품마다 다릅니다.</strong> 일반적으로 — 주담대 3년 이내 1.0~1.5%, 이후 0% / 신용대출 0.5~1.0% / 정책 대출 면제 또는 매우 낮음. 정확한 수수료는 본인 대출 약정서를 확인하세요.
              </div>
            </>
          )}
        </>
      )}

      {/* ─── 탭 3: 갈아타기 ─── */}
      {tab === 'refi' && (
        <>
          <div className={styles.disclaimer}>
            🔄 <strong>대출 갈아타기 (Refinancing)</strong> — 새 대출로 기존 대출 상환. 손익분기 = 부대비용 ÷ 월 절감액. 이 기간 이상 유지해야 갈아타기가 이득입니다. <strong>※ 기존·새 대출 모두 원리금균등 상환 기준</strong>입니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>기존 대출</label>
            <div className={styles.threeCol}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>잔액 (만원)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" value={refiRemaining} onChange={e => setRefiRemaining(e.target.value)} />
                  <span className={styles.unit}>만</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>현재 금리 (%)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" step="0.05" value={refiCurrentRate} onChange={e => setRefiCurrentRate(e.target.value)} />
                  <span className={styles.unit}>%</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>남은 기간 (개월)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" value={refiRemainMonths} onChange={e => setRefiRemainMonths(e.target.value)} />
                  <span className={styles.unit}>개월</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>새 대출</label>
            <div className={styles.twoCol}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>새 금리 (%)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" step="0.05" value={refiNewRate} onChange={e => setRefiNewRate(e.target.value)} />
                  <span className={styles.unit}>%</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>새 기간 (개월)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" value={refiNewMonths} onChange={e => setRefiNewMonths(e.target.value)} />
                  <span className={styles.unit}>개월</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>부대비용 (만원)</label>
            <div className={styles.threeCol}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>중도상환수수료</span>
                <input className={styles.numInput} type="number" value={refiPrepayFee} onChange={e => setRefiPrepayFee(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>취급수수료</span>
                <input className={styles.numInput} type="number" value={refiOriginFee} onChange={e => setRefiOriginFee(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>인지·등록세</span>
                <input className={styles.numInput} type="number" value={refiOtherFees} onChange={e => setRefiOtherFees(e.target.value)} />
              </div>
            </div>
          </div>

          {refiResult && (
            <>
              <div className={styles.hero}
                style={{
                  borderColor: refiResult.isWorthwhile ? 'rgba(16,185,129,0.40)' : 'rgba(220,38,38,0.40)',
                  background: refiResult.isWorthwhile ? 'rgba(16,185,129,0.06)' : 'rgba(220,38,38,0.06)',
                }}>
                <div className={styles.heroLabel}>{refiResult.isWorthwhile ? '✨ 갈아타기 절감' : '⚠️ 갈아타기 손해'}</div>
                <div className={styles.heroNum}
                  style={{ color: refiResult.isWorthwhile ? '#059669' : '#DC2626' }}>
                  {refiResult.totalSaving > 0 ? '−' : '+'}{formatEok(Math.abs(refiResult.totalSaving))}
                </div>
                <div className={styles.heroSub}>
                  월 상환액 차이 {refiResult.monthlyPaymentDiff > 0 ? '+' : ''}{won(refiResult.monthlyPaymentDiff)}
                  {refiResult.breakEvenMonths !== null && ` · 손익분기 ${refiResult.breakEvenMonths}개월`}
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>비교</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}><span>기존 월 상환액</span><span>{won(refiResult.currentMonthly)}</span></div>
                  <div className={styles.detailRow}><span>새 월 상환액</span><span>{won(refiResult.newMonthly)}</span></div>
                  <div className={styles.detailRow}><span>기존 총 이자</span><span>{formatEok(refiResult.currentTotalInterest)}</span></div>
                  <div className={styles.detailRow}><span>새 총 이자</span><span>{formatEok(refiResult.newTotalInterest)}</span></div>
                  <div className={styles.detailRow}><span>부대비용 합계</span><span>{formatEok(refiResult.totalCostFees)}</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}>
                    <span>총 절감액</span>
                    <span style={{ color: refiResult.isWorthwhile ? '#059669' : '#DC2626' }}>
                      {refiResult.totalSaving > 0 ? '−' : '+'}{formatEok(Math.abs(refiResult.totalSaving))}
                    </span>
                  </div>
                </div>
              </div>

              {refiResult.breakEvenMonths !== null && (
                <div className={styles.infoBox}>
                  💡 <strong>손익분기 {refiResult.breakEvenMonths}개월</strong> — 부대비용 {formatEok(refiResult.totalCostFees)}을 회수하려면 {refiResult.breakEvenMonths}개월 이상 유지해야 합니다. 그 이전에 다시 갈아타거나 상환 완료 시 손해입니다.
                </div>
              )}

              <div className={styles.warnBox}>
                ⚠️ 갈아타기 가능 여부는 본인 신용·소득·기존 대출 조건에 따라 다릅니다. 실제 갈아타기 전 새 은행 상담 필수.
              </div>
            </>
          )}
        </>
      )}

      {/* ─── 탭 4: 금리 변동 ─── */}
      {tab === 'rate' && ep && (
        <>
          <div className={styles.disclaimer}>
            📊 <strong>금리 변동 시뮬</strong> — 변동금리 대출자가 금리 인상·인하 시 월 상환액과 총 이자가 어떻게 달라지는지 확인합니다 (현재 금리 {rateNum}% 기준).
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>금리 변화 시나리오 (현재 {rateNum}% 기준)</label>
            <div className={styles.scenarioTable}>
              <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                <span>변화</span>
                <span style={{ textAlign: 'right' }}>새 금리</span>
                <span style={{ textAlign: 'right' }}>월 상환</span>
                <span style={{ textAlign: 'right' }}>총 이자 차이</span>
              </div>
              {rateScenarios.map(s => {
                const isBaseline = s.delta === 0
                const cls = s.delta > 0 ? styles.deltaPositive : s.delta < 0 ? styles.deltaNegative : styles.deltaZero
                return (
                  <div key={s.delta}
                    className={`${styles.scenarioRow} ${isBaseline ? styles.scenarioRowBaseline : ''}`}>
                    <span className={`${styles.scenarioDelta} ${cls}`}>
                      {s.delta > 0 ? '+' : ''}{s.delta}%p
                    </span>
                    <span>{s.newRate.toFixed(2)}%</span>
                    <span>{won(s.monthlyPayment)}<br /><small style={{ color: 'var(--muted)', fontWeight: 400 }}>{s.monthlyDiff > 0 ? '+' : ''}{won(s.monthlyDiff)}/월</small></span>
                    <span style={{ color: s.totalInterestDiff > 0 ? '#DC2626' : s.totalInterestDiff < 0 ? '#059669' : 'var(--muted)' }}>
                      {s.totalInterestDiff > 0 ? '+' : ''}{formatEok(s.totalInterestDiff)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.warnBox}>
            ⚠️ 한국 변동금리는 보통 6개월·1년 주기로 갱신됩니다. 실제 금리 인상은 한국은행 기준금리 + 가산금리 변화에 따라 다르며, 변동금리 대출자는 비상금 6~12개월치 확보를 권장합니다.
          </div>
        </>
      )}

      {/* ─── 탭 5: 역산 ─── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.disclaimer}>
            🎯 <strong>감당 가능 대출금 역산</strong> — 월 상환 가능액·금리·기간으로 빌릴 수 있는 원금을 자동 계산. DSR도 함께 점검할 수 있습니다.
          </div>

          <div className={styles.threeCol}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>월 상환 가능액 (만원)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" value={revMonthly} onChange={e => setRevMonthly(e.target.value)} />
                <span className={styles.unit}>만원</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>금리 (%)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" step="0.05" value={revRate} onChange={e => setRevRate(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>기간 (개월)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" value={revMonths} onChange={e => setRevMonths(e.target.value)} />
                <span className={styles.unit}>개월</span>
              </div>
            </div>
          </div>

          {reverseResult && (
            <div className={styles.hero}
              style={{ borderColor: 'rgba(155,89,182,0.40)', background: 'rgba(155,89,182,0.06)' }}>
              <div className={styles.heroLabel}>감당 가능 대출 원금</div>
              <div className={styles.heroNum} style={{ color: '#9333EA' }}>
                {formatEok(reverseResult.principal)}
              </div>
              <div className={styles.heroSub}>
                월 {won(parseAmount(revMonthly) * 10_000)} · {parseFloat(revRate)}% · {parseInt(revMonths, 10)}개월 ({(parseInt(revMonths, 10) / 12).toFixed(0)}년)
              </div>
              <div className={styles.heroDesc}>
                총 이자 {formatEok(reverseResult.totalInterest)} · 총 상환액 {formatEok(reverseResult.totalPayment)}
              </div>
            </div>
          )}

          <div className={styles.card}>
            <label className={styles.cardLabel}>DSR 참고 — 연소득과 기타 대출 입력</label>
            <div className={styles.twoCol}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>연소득 (만원)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" value={revIncome} onChange={e => setRevIncome(e.target.value)} />
                  <span className={styles.unit}>만</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>기타 대출 월 상환 (만원)</span>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" value={revOtherDebt} onChange={e => setRevOtherDebt(e.target.value)} />
                  <span className={styles.unit}>만</span>
                </div>
              </div>
            </div>
          </div>

          {dsrResult && (
            <div className={styles.dsrCard} style={{ borderColor: dsrResult.riskColor }}>
              <div className={styles.dsrValue} style={{ color: dsrResult.riskColor }}>
                DSR {dsrResult.dsr}%
              </div>
              <div className={styles.dsrBadge}
                style={{ background: `${dsrResult.riskColor}22`, color: dsrResult.riskColor, border: `1px solid ${dsrResult.riskColor}66` }}>
                {dsrResult.riskLabel}
              </div>
              <div className={styles.dsrDesc}>{dsrResult.description}</div>
            </div>
          )}

          {dsrWarning && (
            <div className={styles.warnBox}>
              🔴 <strong>DSR 40% 초과</strong> — 은행권 DSR 한도를 초과합니다. 실제 대출 한도가 크게 제한될 수 있으며, 다중 채무 위험도 있습니다.
              <br />채무 부담이 큰 경우 — <strong>한국 신용회복위원회 1397</strong> · <strong>한국 금융감독원 1332</strong> 상담 권장.
            </div>
          )}

          {reverseRateTable.length > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>금리별 가능 원금 (월 {revMonthly}만원 · {revMonths}개월)</label>
              <div className={styles.scenarioTable}>
                <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                  <span>금리</span>
                  <span style={{ textAlign: 'right' }}>가능 원금</span>
                  <span style={{ textAlign: 'right' }}>총 이자</span>
                  <span style={{ textAlign: 'right' }}>총 상환</span>
                </div>
                {reverseRateTable.map(r => (
                  <div key={r.rate} className={styles.scenarioRow}>
                    <span style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.rate}%</span>
                    <span>{formatEok(r.result.principal)}</span>
                    <span>{formatEok(r.result.totalInterest)}</span>
                    <span>{formatEok(r.result.totalPayment)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.warnBox}>
            ⚠️ <strong>실제 대출 한도는 신용·소득·LTV·DSR에 따라 결정</strong>됩니다. 본 도구는 단순 계산이며 다음 요소가 추가로 영향 — 신용점수 / LTV(담보 인정 비율) / DSR(은행권 40% 한도) / 소득 인정 방식 / 기존 대출 보유 여부.
          </div>
        </>
      )}

      {/* ─── 탭 6: 비교표 ─── */}
      {tab === 'compare' && inputValid && (
        <>
          <div className={styles.disclaimer}>
            📋 <strong>대출 조건별 비교</strong> — 입력한 원금({formatEok(principalWon)})·금리({rateNum}%)·기간({monthsNum}개월) 기준 다양한 시나리오를 표로 확인합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>기간별 비교 ({rateNum}% 기준)</label>
            <div className={styles.scenarioTable}>
              <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                <span>기간</span>
                <span style={{ textAlign: 'right' }}>월 상환액</span>
                <span style={{ textAlign: 'right' }}>총 이자</span>
                <span style={{ textAlign: 'right' }}>총 상환</span>
              </div>
              {compareTermTable.map(r => (
                <div key={r.months}
                  className={`${styles.scenarioRow} ${r.months === monthsNum ? styles.scenarioRowBaseline : ''}`}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.months / 12}년</span>
                  <span>{won(r.monthlyPayment)}</span>
                  <span>{formatEok(r.totalInterest)}</span>
                  <span>{formatEok(r.totalPayment)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>금리별 비교 ({monthsNum}개월 기준)</label>
            <div className={styles.scenarioTable}>
              <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                <span>금리</span>
                <span style={{ textAlign: 'right' }}>월 상환액</span>
                <span style={{ textAlign: 'right' }}>총 이자</span>
                <span></span>
              </div>
              {compareRateTable.map(r => (
                <div key={r.rate}
                  className={`${styles.scenarioRow} ${Math.abs(r.rate - rateNum) < 0.01 ? styles.scenarioRowBaseline : ''}`}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.rate}%</span>
                  <span>{won(r.monthlyPayment)}</span>
                  <span>{formatEok(r.totalInterest)}</span>
                  <span></span>
                </div>
              ))}
            </div>
          </div>

          {ep && epr && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>상환 방식 비교</label>
              <div className={styles.scenarioTable}>
                <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
                  <span>방식</span>
                  <span style={{ textAlign: 'right' }}>월 상환</span>
                  <span style={{ textAlign: 'right' }}>총 이자</span>
                  <span style={{ textAlign: 'right' }}>총 상환</span>
                </div>
                <div className={styles.scenarioRow}>
                  <span style={{ fontWeight: 700, fontFamily: 'Noto Sans KR' }}>원리금균등</span>
                  <span>{won(ep.monthlyPayment)}</span>
                  <span>{formatEok(ep.totalInterest)}</span>
                  <span>{formatEok(ep.totalPayment)}</span>
                </div>
                <div className={styles.scenarioRow}>
                  <span style={{ fontWeight: 700, fontFamily: 'Noto Sans KR' }}>원금균등</span>
                  <span>{won(epr.firstPayment)}~{won(epr.lastPayment)}</span>
                  <span>{formatEok(epr.totalInterest)}</span>
                  <span>{formatEok(epr.totalPayment)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 탭 5 — 역산에서 사용 (reverseTermTable 표시) */}
      {tab === 'reverse' && reverseTermTable.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>기간별 가능 원금 (월 {revMonthly}만원 · {revRate}%)</label>
          <div className={styles.scenarioTable}>
            <div className={`${styles.scenarioRow} ${styles.headerRow}`}>
              <span>기간</span>
              <span style={{ textAlign: 'right' }}>가능 원금</span>
              <span style={{ textAlign: 'right' }}>총 이자</span>
              <span style={{ textAlign: 'right' }}>총 상환</span>
            </div>
            {reverseTermTable.map(r => (
              <div key={r.months} className={styles.scenarioRow}>
                <span style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.months / 12}년</span>
                <span>{formatEok(r.result.principal)}</span>
                <span>{formatEok(r.result.totalInterest)}</span>
                <span>{formatEok(r.result.totalPayment)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 면책 강화 */}
      <div className={styles.warnBox}>
        ⓘ <strong>본 도구는 표준 공식 기반 추정 도구입니다.</strong> 실제 대출 가능 여부·금리·수수료·DSR/LTV 규제는 신용·소득·은행·상품·정책에 따라 다릅니다.
        정확한 상품 조건은 거래 은행 상담 / 한국주택금융공사(주담대) / 금융감독원 e-금융민원센터 <strong>1332</strong> / 채무 상담 한국 신용회복위원회 <strong>1397</strong>.
      </div>
    </div>
  )
}
