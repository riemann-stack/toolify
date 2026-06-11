'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './rent-jeonse.module.css'
import {
  type CalcInputs, type OptionResult, type Option,
  compareAll, simulateOpportunity, assessRisk,
  fmtKRW,
} from './rentJeonseUtils'

type TabKey = 'compare' | 'sim' | 'guide'
const STORAGE_KEY = 'youtil:rent-jeonse:v1'

const DEFAULT_INPUTS: CalcInputs = {
  marketPrice: 1_000_000_000,
  jeonseDeposit: 600_000_000,
  jeonseLoanRatio: 50,
  jeonseLoanRate: 4.0,
  hugInsurance: true,
  hugRateBp: 12.8,
  monthlyDeposit: 50_000_000,
  monthlyRent: 1_500_000,
  monthlyTaxCreditEligible: false,
  monthlyDepositLoanRate: 6.0,
  conversionRate: 4.5,
  semiJeonseRatio: 30,
  maintenance: 200_000,
  totalSalary: 50_000_000,
  ownCapital: 300_000_000,
  months: 36,
  expectedReturn: 4.0,
  annualRentIncrease: 5.0,
}

const TABS = [
  { k: 'compare', l: '🏠 빠른 비교' },
  { k: 'sim',     l: '📈 시뮬레이션' },
  { k: 'guide',   l: '📚 가이드·체크리스트' },
] as const

export default function RentJeonseClient() {
  const [tab, setTab] = useState<TabKey>('compare')
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInputs((prev) => ({ ...prev, ...parsed }))
      }
    } catch { /* ignore */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }, [inputs, mounted])

  const update = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) =>
    setInputs((prev) => ({ ...prev, [k]: v }))

  const { results, best, breakeven } = useMemo(() => compareAll(inputs), [inputs])

  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/loan',         label: '대출이자 계산기' },
          { href: '/tools/finance/real-estate',  label: '부동산 투자 수익률' },
          { href: '/tools/finance/savings',      label: '저축액 계산기' },
        ]}
        sources={[
          { label: '국토교통부 실거래가', href: 'https://rt.molit.go.kr' },
          { label: '주택도시보증공사 HUG', href: 'https://www.khug.or.kr' },
        ]}
      >
        실제 계약은 공인중개사·법무사·HUG 사이트에서 확인 필수. 2026년 금리·세법 기준이며 매년 변동 가능. 전세사기 위험 점수는 일반 가이드이므로 정확한 평가는 등기부·실거래가 확인 필요. 임대료 5% 인상은 계약갱신청구권 행사 시만 적용되며 신규 계약은 시세대로.
      </Disclaimer>

      <div className={styles.tabs} role="tablist" aria-label="월세·전세 비교 탭">
        {TABS.map((t) => (
          <button key={t.k}
            type="button"
            role="tab"
            aria-selected={tab === t.k}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
            onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'compare' && <CompareTab inputs={inputs} update={update} results={results} best={best} />}
      {tab === 'sim'     && <SimTab inputs={inputs} results={results} breakeven={breakeven} />}
      {tab === 'guide'   && <GuideTab inputs={inputs} />}

    </div>
  )
}

/* ═════════════════════ TAB 1: 빠른 비교 ═════════════════════ */
function CompareTab({ inputs, update, results, best }: {
  inputs: CalcInputs
  update: <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => void
  results: OptionResult[]
  best: Option
}) {
  return (
    <div className={styles.panel}>
      {/* 매물 시세 */}
      <section>
        <label className={styles.label}>매물 시세</label>
        <AmountInput value={inputs.marketPrice} onChange={(n) => update('marketPrice', n)} />
      </section>

      {/* 전세 옵션 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🏦 전세 옵션</p>
        <div className={styles.numberRow}>
          <label>전세 보증금</label>
          <CompactInput value={inputs.jeonseDeposit} onChange={(n) => update('jeonseDeposit', n)} />
        </div>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>전세대출 비율</span>
            <strong>{inputs.jeonseLoanRatio}% ({fmtKRW(inputs.jeonseDeposit * inputs.jeonseLoanRatio / 100)})</strong>
          </div>
          <input type="range" min={0} max={80} step={5} value={inputs.jeonseLoanRatio}
            onChange={(e) => update('jeonseLoanRatio', +e.target.value)} className={styles.slider}
            aria-label="전세대출 비율"
            aria-valuetext={`${inputs.jeonseLoanRatio}% (${fmtKRW(inputs.jeonseDeposit * inputs.jeonseLoanRatio / 100)})`} />
        </div>
        <div className={styles.numberRow}>
          <label>전세대출 금리</label>
          <PercentInput value={inputs.jeonseLoanRate} onChange={(n) => update('jeonseLoanRate', n)} min={0} max={15} />
        </div>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={inputs.hugInsurance}
            onChange={(e) => update('hugInsurance', e.target.checked)} />
          <span>HUG 전세보증보험 가입 (보증료 약 {(inputs.hugRateBp / 100).toFixed(3)}% 참고치)</span>
        </label>
        <p className={styles.smallNote}>
          ※ 보증료율은 보증금액·주택유형·부채비율에 따라 약 0.097~0.211%로 달라집니다 (HUG 공식 산정 기준 확인 필요).
        </p>
      </section>

      {/* 월세 옵션 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🏘️ 월세 옵션</p>
        <div className={styles.numberRow}>
          <label>월세 보증금</label>
          <CompactInput value={inputs.monthlyDeposit} onChange={(n) => update('monthlyDeposit', n)} />
        </div>
        <div className={styles.numberRow}>
          <label>월 임대료</label>
          <CompactInput value={inputs.monthlyRent} onChange={(n) => update('monthlyRent', n)} placeholder="1,500,000" />
        </div>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={inputs.monthlyTaxCreditEligible}
            onChange={(e) => update('monthlyTaxCreditEligible', e.target.checked)} />
          <span>월세 세액공제 자격 (무주택 + 총급여 8천만 이하)</span>
        </label>
        {inputs.monthlyTaxCreditEligible && (
          <p className={styles.smallNote}>
            {inputs.totalSalary > 80_000_000
              ? '✗ 총급여 8천만 초과 — 공제 대상 아님'
              : `✓ 자동 적용: 연 1,000만 한도 × ${inputs.totalSalary <= 55_000_000 ? '17%' : '15%'}`}
          </p>
        )}
      </section>

      {/* 반전세 (전월세 전환율) */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🔁 반전세 시뮬 (전세 일부 → 월세 전환)</p>
        <div className={styles.numberRow}>
          <label>전월세 전환율</label>
          <PercentInput value={inputs.conversionRate} onChange={(n) => update('conversionRate', n)} min={2} max={10} />
        </div>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>월세로 전환할 비율</span>
            <strong>{inputs.semiJeonseRatio}% ({fmtKRW(inputs.jeonseDeposit * inputs.semiJeonseRatio / 100)})</strong>
          </div>
          <input type="range" min={10} max={70} step={5} value={inputs.semiJeonseRatio}
            onChange={(e) => update('semiJeonseRatio', +e.target.value)} className={styles.slider}
            aria-label="월세로 전환할 비율"
            aria-valuetext={`${inputs.semiJeonseRatio}% (${fmtKRW(inputs.jeonseDeposit * inputs.semiJeonseRatio / 100)})`} />
        </div>
        <p className={styles.note}>
          ※ 법정 한도 = 한국은행 기준금리 + 2% (주택임대차보호법). 기준금리 2.5% 기준 약 4.5% — 본인 대출금리({inputs.jeonseLoanRate}%)보다 전환율이 낮으면 반전세 유리.
        </p>
      </section>

      {/* 공통 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>⚙️ 공통 조건</p>
        <div className={styles.numberRow}>
          <label>관리비 (월)</label>
          <CompactInput value={inputs.maintenance} onChange={(n) => update('maintenance', n)} placeholder="200,000" />
        </div>
        <div className={styles.numberRow}>
          <label>본인 자기자본</label>
          <CompactInput value={inputs.ownCapital} onChange={(n) => update('ownCapital', n)} />
        </div>
        <div className={styles.numberRow}>
          <label>본인 총급여 (세액공제용)</label>
          <CompactInput value={inputs.totalSalary} onChange={(n) => update('totalSalary', n)} />
        </div>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>보유 예정 기간</span>
            <strong>{Math.floor(inputs.months / 12)}년 {inputs.months % 12}개월</strong>
          </div>
          <input type="range" min={6} max={120} step={6} value={inputs.months}
            onChange={(e) => update('months', +e.target.value)} className={styles.slider}
            aria-label="보유 예정 기간"
            aria-valuetext={`${Math.floor(inputs.months / 12)}년 ${inputs.months % 12}개월`} />
        </div>
        <div className={styles.numberRow}>
          <label>기회비용 기대수익률</label>
          <PercentInput value={inputs.expectedReturn} onChange={(n) => update('expectedReturn', n)} min={0} max={20} />
        </div>
      </section>

      {/* 결과 카드 3장 */}
      <section>
        <label className={styles.label}>비교 결과 <span className={styles.labelSub}>({Math.floor(inputs.months/12)}년 {inputs.months%12}개월 기준)</span></label>
        <div className={styles.resultGrid}>
          {results.map((r) => (
            <ResultCard key={r.option} result={r} months={inputs.months} isBest={r.option === best} />
          ))}
        </div>
        <div className={styles.bestSummary}>
          <strong>💡 권장:</strong> 입력 조건 기준 <strong className={styles.bestText}>{results.find((r) => r.option === best)?.label}</strong>가 누적 비용이 가장 낮습니다.
          가장 비싼 옵션 대비 <strong className={styles.bestText}>{fmtKRW(Math.max(...results.map((r) => r.cumulativeCost)) - Math.min(...results.map((r) => r.cumulativeCost)))}</strong> 절약.
        </div>
      </section>
    </div>
  )
}

/* ─── 결과 카드 컴포넌트 ─── */
function ResultCard({ result, months, isBest }: { result: OptionResult; months: number; isBest: boolean }) {
  const yearMonths = `${Math.floor(months/12)}년 ${months%12}개월`
  return (
    <div className={`${styles.resultCard} ${isBest ? styles.resultCardBest : ''}`}>
      {isBest && <span className={styles.bestBadge}>BEST</span>}
      <p className={styles.resultLabel}>{result.label}</p>
      <p className={styles.resultMonthly}>월 <strong>{fmtKRW(result.monthlyNetCost)}</strong></p>
      <p className={styles.resultCum}>{yearMonths} 누적 <strong>{fmtKRW(result.cumulativeCost)}</strong></p>

      <div className={styles.breakdown}>
        {result.monthlyInterest > 0 && <div><span>대출이자</span><span>{fmtKRW(result.monthlyInterest)}</span></div>}
        {result.monthlyOpportunity > 0 && <div><span>보증금 기회비용</span><span>{fmtKRW(result.monthlyOpportunity)}</span></div>}
        {result.monthlyRentPaid > 0 && <div><span>월 임대료</span><span>{fmtKRW(result.monthlyRentPaid)}</span></div>}
        {result.monthlyMaintenance > 0 && <div><span>관리비</span><span>{fmtKRW(result.monthlyMaintenance)}</span></div>}
        {result.monthlyInsurance > 0 && <div><span>HUG 보증료</span><span>{fmtKRW(result.monthlyInsurance)}</span></div>}
        {result.monthlyTaxSaving > 0 && <div className={styles.saving}><span>세액공제</span><span>-{fmtKRW(result.monthlyTaxSaving)}</span></div>}
      </div>

      {result.taxCreditAnnual > 0 && (
        <p className={styles.taxBadge}>연 절세 <strong>{fmtKRW(result.taxCreditAnnual)}</strong></p>
      )}

      <div className={styles.riskBox}>
        <p className={styles.riskTitle}>위험 요인</p>
        {result.riskFactors.slice(0, 3).map((rf, i) => (
          <p key={i} className={styles.riskItem}>• {rf}</p>
        ))}
      </div>
    </div>
  )
}

/* ═════════════════════ TAB 2: 시간 시뮬 ═════════════════════ */
function SimTab({ inputs, results, breakeven }: {
  inputs: CalcInputs
  results: OptionResult[]
  breakeven: Record<string, number | null>
}) {
  // ROI 시나리오 — 자기자본 기준
  const roi = useMemo(() => simulateOpportunity(inputs.ownCapital, inputs.months), [inputs.ownCapital, inputs.months])

  return (
    <div className={styles.panel}>
      {/* 누적 비용 그래프 */}
      <section>
        <label className={styles.label}>누적 비용 시뮬레이션 <span className={styles.labelSub}>({inputs.months}개월)</span></label>
        <CumulativeChart results={results} />

        {/* 손익분기점 */}
        <div className={styles.breakevenBox}>
          {breakeven.jeonse_vs_monthly !== null && (
            <p>🔄 전세 ↔ 월세 손익분기점: <strong>{breakeven.jeonse_vs_monthly}개월 ({Math.floor(breakeven.jeonse_vs_monthly!/12)}년 {breakeven.jeonse_vs_monthly! % 12}개월)</strong></p>
          )}
          {breakeven.jeonse_vs_semi !== null && (
            <p>🔄 전세 ↔ 반전세 손익분기점: <strong>{breakeven.jeonse_vs_semi}개월</strong></p>
          )}
          {breakeven.monthly_vs_semi !== null && (
            <p>🔄 월세 ↔ 반전세 손익분기점: <strong>{breakeven.monthly_vs_semi}개월</strong></p>
          )}
          {Object.values(breakeven).every((v) => v === null) && (
            <p className={styles.note}>이 기간 내 손익분기점이 발생하지 않음 — 한 옵션이 일관되게 우위.</p>
          )}
        </div>
      </section>

      {/* ROI 시뮬 */}
      <section>
        <label className={styles.label}>자기자본 ROI 시뮬 <span className={styles.labelSub}>(보증금에 묶지 않고 운용 시)</span></label>
        <RoiChart scenarios={roi} initial={inputs.ownCapital} months={inputs.months} />
        <div className={styles.roiTable}>
          <div className={styles.roiHead}>
            <span>시나리오</span>
            <span>{Math.floor(inputs.months/12)}년 후 평가액</span>
            <span>증가액</span>
          </div>
          {roi.map((s) => (
            <div key={s.label} className={styles.roiRow}>
              <span>{s.label}</span>
              <span><strong>{fmtKRW(s.finalValue)}</strong></span>
              <span className={styles.roiGain}>+{fmtKRW(s.finalValue - inputs.ownCapital)}</span>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          💡 자기자본 {fmtKRW(inputs.ownCapital)}을 전세 보증금에 묶으면 위 수익을 포기하는 것 — 본 도구는 기대수익률 {inputs.expectedReturn}%로 기회비용을 자동 반영합니다.
        </p>
      </section>
    </div>
  )
}

/* SVG 누적 비용 차트 */
function CumulativeChart({ results }: { results: OptionResult[] }) {
  const W = 600, H = 320, padL = 80, padR = 20, padT = 18, padB = 48
  const allValues = results.flatMap((r) => r.monthlySeries)
  const maxV = Math.max(...allValues, 1)
  const months = results[0]?.monthlySeries.length || 1
  const colors: Record<Option, string> = { jeonse: '#0891B2', monthly: '#DC2626', semi: '#0EA5E9' }

  const xOf = (i: number) => padL + (i / Math.max(1, months - 1)) * (W - padL - padR)
  const yOf = (v: number) => padT + (H - padT - padB) - (v / maxV) * (H - padT - padB)

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
        {/* y-axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padL} y1={padT + (H - padT - padB) * (1 - t)} x2={W - padR} y2={padT + (H - padT - padB) * (1 - t)}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
            <text x={padL - 8} y={padT + (H - padT - padB) * (1 - t) + 5}
              fill="var(--muted)" fontSize="15" textAnchor="end" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="600">
              {fmtKRW(maxV * t)}
            </text>
          </g>
        ))}

        {/* x-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={padL + (W - padL - padR) * t} y={H - 16}
            fill="var(--muted)" fontSize="15" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="600">
            {Math.floor(months * t)}개월
          </text>
        ))}

        {/* lines */}
        {results.map((r) => (
          <polyline key={r.option}
            points={r.monthlySeries.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')}
            stroke={colors[r.option]} strokeWidth="3" fill="none" strokeLinejoin="round" />
        ))}
      </svg>
      <div className={styles.legend}>
        {results.map((r) => (
          <span key={r.option} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: colors[r.option] }} />
            {r.label} <strong>{fmtKRW(r.cumulativeCost)}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ROI SVG 차트 */
function RoiChart({ scenarios, initial, months }: { scenarios: ReturnType<typeof simulateOpportunity>; initial: number; months: number }) {
  const W = 600, H = 260, padL = 90, padR = 20, padT = 18, padB = 40
  const all = scenarios.flatMap((s) => s.series)
  const maxV = Math.max(...all, initial)
  const colors = ['#0891B2', '#0EA5E9', '#EA580C', '#E11D48']

  const xOf = (i: number) => padL + (i / Math.max(1, months - 1)) * (W - padL - padR)
  const yOf = (v: number) => padT + (H - padT - padB) - ((v - initial * 0.95) / (maxV - initial * 0.95)) * (H - padT - padB)

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={padL} y1={padT + (H - padT - padB) * (1 - t)} x2={W - padR} y2={padT + (H - padT - padB) * (1 - t)}
            stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
        ))}
        <text x={padL - 8} y={yOf(initial) + 5} fill="var(--muted)" fontSize="15" textAnchor="end" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="600">
          {fmtKRW(initial)}
        </text>
        <text x={padL - 8} y={yOf(maxV) + 5} fill="var(--muted)" fontSize="15" textAnchor="end" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="600">
          {fmtKRW(maxV)}
        </text>
        {/* x-axis labels */}
        {[0, 0.5, 1].map((t) => (
          <text key={t} x={padL + (W - padL - padR) * t} y={H - 12}
            fill="var(--muted)" fontSize="15" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="600">
            {Math.floor(months * t)}개월
          </text>
        ))}
        {scenarios.map((s, idx) => (
          <polyline key={s.label}
            points={s.series.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')}
            stroke={colors[idx]} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        ))}
      </svg>
      <div className={styles.legend}>
        {scenarios.map((s, idx) => (
          <span key={s.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: colors[idx] }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═════════════════════ TAB 3: 가이드·체크리스트 ═════════════════════ */
function GuideTab({ inputs }: { inputs: CalcInputs }) {
  const [risk, setRisk] = useState({
    hugInsured: inputs.hugInsurance,
    registered: false,
    registryChecked: false,
    landlordVerified: false,
    realPriceChecked: false,
    multipleHouseholds: false,
  })

  const jeonsePriceRatio = (inputs.jeonseDeposit / Math.max(1, inputs.marketPrice)) * 100
  const assessment = useMemo(() => assessRisk({
    jeonsePriceRatio,
    ...risk,
  }), [jeonsePriceRatio, risk])

  const levelColor: Record<typeof assessment.level, string> = {
    low: '#059669', medium: '#D97706', high: '#EA580C', danger: '#DC2626',
  }
  const levelText: Record<typeof assessment.level, string> = {
    low: '낮음 ✓', medium: '주의', high: '높음', danger: '위험',
  }

  return (
    <div className={styles.panel}>
      {/* 전세사기 위험 점수 */}
      <section>
        <label className={styles.label}>🛡️ 전세사기 위험 점수 <span className={styles.labelSub}>(체크박스 선택)</span></label>
        <div className={styles.riskScoreCard} style={{ borderColor: levelColor[assessment.level] + '60' }}>
          <p className={styles.riskScoreLabel}>위험 점수</p>
          <p className={styles.riskScoreBig} style={{ color: levelColor[assessment.level] }}>
            {assessment.totalScore} <span className={styles.riskScoreUnit}>/100</span>
          </p>
          <p className={styles.riskScoreLevel} style={{ color: levelColor[assessment.level] }}>
            {levelText[assessment.level]}
          </p>
          <p className={styles.note}>전세가율 {jeonsePriceRatio.toFixed(0)}% (시세 대비)</p>
        </div>

        <div className={styles.riskFactorsList}>
          {assessment.factors.map((f) => (
            <label key={f.id} className={`${styles.riskFactor} ${f.applied ? styles.riskFactorApplied : ''}`}>
              {f.id === 'high_ratio' ? (
                <input type="checkbox" checked={f.applied} disabled />
              ) : (
                <input
                  type="checkbox"
                  checked={!f.applied}
                  onChange={(e) => {
                    const checked = e.target.checked
                    if (f.id === 'hug')        setRisk((p) => ({ ...p, hugInsured: checked }))
                    if (f.id === 'register')   setRisk((p) => ({ ...p, registered: checked }))
                    if (f.id === 'registry')   setRisk((p) => ({ ...p, registryChecked: checked }))
                    if (f.id === 'landlord')   setRisk((p) => ({ ...p, landlordVerified: checked }))
                    if (f.id === 'realprice')  setRisk((p) => ({ ...p, realPriceChecked: checked }))
                    if (f.id === 'multi')      setRisk((p) => ({ ...p, multipleHouseholds: !checked }))
                  }}
                />
              )}
              <div>
                <span className={styles.riskFactorLabel}>{f.label}</span>
                <span className={styles.riskFactorWeight}>+{f.weight}점</span>
              </div>
            </label>
          ))}
        </div>

        {assessment.recommendations.length > 0 && (
          <div className={styles.optionCard}>
            <p className={styles.gapTitle}>📌 권장 조치</p>
            <ul className={styles.recList}>
              {assessment.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 절세 가이드 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>💸 절세 가이드</p>
        <div className={styles.savingGuide}>
          <div>
            <p className={styles.savingTitle}>월세 세액공제</p>
            <p className={styles.savingDesc}>
              조건: <strong>무주택자 + 총급여 8천만 이하 + 근로소득자</strong>.
              연 1,000만 한도 × 17% (총급여 5,500만 이하) / 15% (5,500만~8,000만). 월세 약 83만 이상 납부 시 한도 도달.
              <strong>같은 월세액에 대해 현금영수증(신용카드 등) 소득공제와는 중복 불가</strong> — 둘 중 유리한 쪽 선택.
            </p>
          </div>
          <div>
            <p className={styles.savingTitle}>전세대출 이자 소득공제</p>
            <p className={styles.savingDesc}>
              원리금 상환액의 <strong>40%, 한도 400만</strong>까지 소득공제. 무주택 세대주 + 국민주택규모(85㎡) 이하.
              한계세율만큼 절세 (세율 24%면 약 105.6만 절세 + 지방세 포함).
            </p>
          </div>
          <div>
            <p className={styles.savingTitle}>현금영수증 (세액공제 자격 없을 때)</p>
            <p className={styles.savingDesc}>
              월세 세액공제 자격이 안 되면 대안. 임대인이 거부해도 홈택스에서 직접 신고 가능, 신용카드 등 소득공제로 반영.
              <strong>세액공제를 받는 월세액에는 중복 적용되지 않습니다.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 계약 전 체크리스트 */}
      <section>
        <label className={styles.label}>📋 계약 전 체크리스트</label>
        <ol className={styles.contractList}>
          <li><strong>등기부등본 발급</strong> (대법원 인터넷등기소 700원) — 근저당·신탁·압류 확인</li>
          <li><strong>국토부 실거래가 확인</strong> (rt.molit.go.kr) — 시세 대비 전세가율 80% 미만 권장</li>
          <li><strong>임대인 신분증 vs 등기부 명의</strong> 일치 확인 — 대리계약 시 위임장·인감증명서</li>
          <li><strong>다가구·다세대 시 선순위 보증금 확인</strong> — 전체 보증금 합계가 시세 70% 이내</li>
          <li><strong>HUG 전세보증보험</strong> 가입 가능 여부 확인 (전세가율 90% 이하, 시세 7억 이하 등)</li>
          <li><strong>계약서 특약</strong> — 보증금 반환 지연 시 이자, 수리비 부담 등</li>
          <li><strong>잔금일 당일</strong> — 등기부 재확인 (계약 후 근저당 추가 가능) → 잔금 송금 → 확정일자 + 전입신고</li>
          <li><strong>입주 후</strong> — HUG 보증보험 가입 (신청기한은 전세계약기간의 1/2 경과 전 등 상품별 상이 — HUG 확인)</li>
        </ol>
      </section>

      {/* 관련 도구 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🔗 관련 도구</p>
        <ul className={styles.relatedList}>
          <li><Link href="/tools/finance/loan">대출이자 계산기</Link> — 전세자금대출 원리금균등·금리 시뮬</li>
          <li><Link href="/tools/finance/real-estate">부동산 수익률 계산기</Link> — 매수 결정 시</li>
          <li><Link href="/tools/finance/savings">저축액 계산기</Link> — 월세 절약분 저축 시뮬</li>
          <li><Link href="/tools/finance/compound">복리 계산기</Link> — 자기자본 운용 시 장기 수익</li>
        </ul>
      </section>
    </div>
  )
}

/* ─── 공통 입력 컴포넌트 ─── */
function AmountInput({ value, onChange, placeholder }: { value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className={styles.amountRow}>
      <input
        type="text"
        inputMode="numeric"
        className={styles.amountInput}
        value={value.toLocaleString()}
        placeholder={placeholder}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
          onChange(Math.min(100_000_000_000, n))
        }}
      />
      <span className={styles.amountUnit}>원</span>
    </div>
  )
}

function CompactInput({ value, onChange, placeholder }: { value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className={styles.compactInputWrap}>
      <input
        type="text"
        inputMode="numeric"
        className={styles.compactInput}
        value={value.toLocaleString()}
        placeholder={placeholder}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
          onChange(Math.min(100_000_000_000, n))
        }}
      />
      <span>원</span>
    </div>
  )
}

function PercentInput({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className={styles.compactInputWrap}>
      <input
        type="number"
        inputMode="decimal"
        step={0.1}
        min={min}
        max={max}
        className={styles.percentInput}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, +e.target.value || 0)))}
      />
      <span>%</span>
    </div>
  )
}
