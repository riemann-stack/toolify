'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './freelance-tax.module.css'
import {
  type CalcInputs, type CalcResult, type Scenario,
  INDUSTRIES, PROGRESSIVE_BRACKETS, COMPLEX_BOOK_THRESHOLD,
  calculate, buildScenarios, simulateDeduction, recommendSavings,
  yellowUmbrellaLimit, fmtKRW, fmtKRWPrecise,
} from './freelanceTaxUtils'

type TabKey = 'quick' | 'compare' | 'optimize' | 'guide'

const STORAGE_KEY = 'youtil:freelance-tax:v1'

const DEFAULT_INPUTS: CalcInputs = {
  revenue: 60_000_000,
  industryId: 'developer',
  expenseMode: 'simple',
  bookExpenses: 0,
  spouseExempt: false,
  dependents: 0,
  pensionPaid: 0,
  healthPaid: 0,
  yellowUmbrella: 0,
  pensionSavings: 0,
  donations: 0,
  useStandard: true,
  prevYearWithholding: 0,
  withholdingMode: 'auto',
}

const TABS = [
  { k: 'quick',    l: '🧮 빠른 계산' },
  { k: 'compare',  l: '📊 시나리오 비교' },
  { k: 'optimize', l: '💡 절세 시뮬' },
  { k: 'guide',    l: '📅 신고 가이드' },
] as const

export default function FreelanceTaxClient() {
  const [tab, setTab] = useState<TabKey>('quick')
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [mounted, setMounted] = useState(false)

  /* localStorage 복원·저장 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setInputs((prev) => ({ ...prev, ...parsed }))
      }
    } catch { /* 무시 */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* 무시 */ }
  }, [inputs, mounted])

  const result = useMemo(() => calculate(inputs), [inputs])
  const scenarios = useMemo(() => buildScenarios(inputs), [inputs])

  const update = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) =>
    setInputs((prev) => ({ ...prev, [k]: v }))

  return (
    <div className={styles.wrap}>
      {/* ── 탭 ── */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.k}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
            onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 빠른 계산 ══════════ */}
      {tab === 'quick' && <QuickCalcTab inputs={inputs} result={result} update={update} />}

      {/* ══════════ TAB 2: 시나리오 비교 ══════════ */}
      {tab === 'compare' && <CompareTab base={result} scenarios={scenarios} />}

      {/* ══════════ TAB 3: 절세 시뮬 ══════════ */}
      {tab === 'optimize' && <OptimizeTab inputs={inputs} result={result} />}

      {/* ══════════ TAB 4: 신고 가이드 ══════════ */}
      {tab === 'guide' && <GuideTab />}

      {/* 통합 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/4-insurance', label: '4대보험 계산기' },
          { href: '/tools/finance/salary',      label: '연봉 실수령액' },
          { href: '/tools/finance/severance',   label: '퇴직금 계산기' },
        ]}
      >
        2026년 종합소득세율·국세청 단순경비율 기준 — 매년 세법 개정 시 차이 가능. 실제 신고는 <a href="https://www.hometax.go.kr" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>홈택스</a> 모의계산 또는 세무사 확인. 부동산 양도·금융소득 등 복합 종합과세 케이스는 미반영. 부가가치세는 별도 세금(분기·반기 신고)이며 본 계산기 범위 외.
      </Disclaimer>
    </div>
  )
}

/* ═════════════════════ TAB 1: 빠른 계산 ═════════════════════ */
function QuickCalcTab({ inputs, result, update }: {
  inputs: CalcInputs
  result: CalcResult
  update: <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => void
}) {
  const groupedIndustries = useMemo(() => {
    const map = new Map<string, typeof INDUSTRIES>()
    for (const i of INDUSTRIES) {
      const arr = map.get(i.category) ?? []
      arr.push(i)
      map.set(i.category, arr)
    }
    return Array.from(map.entries())
  }, [])

  const industry = INDUSTRIES.find((i) => i.id === inputs.industryId) ?? INDUSTRIES[INDUSTRIES.length - 1]
  const refundColor = result.refund >= 0 ? styles.refundPos : styles.refundNeg

  return (
    <div className={styles.panel}>
      {/* 업종 + 매출 */}
      <section>
        <label className={styles.label}>업종 선택 <span className={styles.labelSub}>({INDUSTRIES.length}개 직군)</span></label>
        <select
          className={styles.select}
          value={inputs.industryId}
          onChange={(e) => update('industryId', e.target.value)}
        >
          {groupedIndustries.map(([cat, list]) => (
            <optgroup key={cat} label={cat}>
              {list.map((i) => (
                <option key={i.id} value={i.id}>{i.name} — 단순경비율 {i.simpleRate}%</option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className={styles.note}>
          {industry.desc} · 업종코드 <strong>{industry.code}</strong> · 단순경비율 한도 매출 <strong>{fmtKRW(industry.simpleLimit)}</strong>
        </p>
      </section>

      <section>
        <label className={styles.label}>연 총 매출 <span className={styles.labelSub}>(원천징수 전)</span></label>
        <div className={styles.amountRow}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.amountInput}
            value={inputs.revenue.toLocaleString()}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
              update('revenue', Math.min(10_000_000_000, n))
            }}
          />
          <span className={styles.amountUnit}>원</span>
        </div>
        <div className={styles.quickChips}>
          {[20_000_000, 30_000_000, 50_000_000, 70_000_000, 100_000_000, 150_000_000].map((v) => (
            <button key={v} className={styles.quickChip} onClick={() => update('revenue', v)}>
              {fmtKRW(v)}
            </button>
          ))}
        </div>
      </section>

      {/* 경비 */}
      <section>
        <label className={styles.label}>필요경비 적용 방식</label>
        <div className={styles.pillRow}>
          <button
            className={`${styles.pill} ${inputs.expenseMode === 'simple' ? styles.pillActive : ''}`}
            onClick={() => update('expenseMode', 'simple')}>
            단순경비율 ({industry.simpleRate}%)
          </button>
          <button
            className={`${styles.pill} ${inputs.expenseMode === 'book' ? styles.pillActive : ''}`}
            onClick={() => update('expenseMode', 'book')}>
            장부 (실경비)
          </button>
        </div>
        {inputs.expenseMode === 'book' && (
          <div className={styles.amountRow} style={{ marginTop: 10 }}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.amountInput}
              value={inputs.bookExpenses.toLocaleString()}
              onChange={(e) => {
                const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                update('bookExpenses', n)
              }}
              placeholder="실경비 금액"
            />
            <span className={styles.amountUnit}>원</span>
          </div>
        )}
        {!result.canUseSimple && inputs.expenseMode === 'simple' && (
          <p className={styles.warn}>
            ⚠️ 단순경비율 한도(매출 {fmtKRW(industry.simpleLimit)}) 초과 — 기준경비율({industry.baseRate}%) 적용 또는 장부 작성 필요
          </p>
        )}
        {result.isComplexBookRequired && (
          <p className={styles.warn}>
            📒 매출 {fmtKRW(COMPLEX_BOOK_THRESHOLD[industry.category])} 초과 — <strong>복식부기 의무 대상</strong>. 미작성 시 무기장 가산세 20%.
          </p>
        )}
      </section>

      {/* 종합소득공제 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>👨‍👩‍👧 종합소득공제</p>

        <div className={styles.checkRow}>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={inputs.spouseExempt} onChange={(e) => update('spouseExempt', e.target.checked)} />
            <span>배우자 공제 (연소득 100만원 이하)</span>
          </label>
        </div>

        <div className={styles.numberRow}>
          <label>부양가족 (배우자 외)</label>
          <input
            type="number" min={0} max={10}
            className={styles.smallNumber}
            value={inputs.dependents}
            onChange={(e) => update('dependents', Math.max(0, Math.min(10, +e.target.value || 0)))}
          />
          <span>명</span>
        </div>

        <div className={styles.numberRow}>
          <label>국민연금 납부액</label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.pensionPaid.toLocaleString()}
            onChange={(e) => update('pensionPaid', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <div className={styles.numberRow}>
          <label>건강보험료</label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.healthPaid.toLocaleString()}
            onChange={(e) => update('healthPaid', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <div className={styles.numberRow}>
          <label>노란우산공제 <span className={styles.smallNote}>(한도 {fmtKRW(yellowUmbrellaLimit(result.businessIncome))})</span></label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.yellowUmbrella.toLocaleString()}
            onChange={(e) => update('yellowUmbrella', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <p className={styles.gapTitle} style={{ marginTop: 14 }}>💸 세액공제</p>

        <div className={styles.numberRow}>
          <label>연금저축 납입액 <span className={styles.smallNote}>(한도 600만)</span></label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.pensionSavings.toLocaleString()}
            onChange={(e) => update('pensionSavings', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <div className={styles.numberRow}>
          <label>기부금</label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.donations.toLocaleString()}
            onChange={(e) => update('donations', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <label className={styles.checkLabel} style={{ marginTop: 8 }}>
          <input type="checkbox" checked={inputs.useStandard} onChange={(e) => update('useStandard', e.target.checked)} />
          <span>표준세액공제 7만원 적용</span>
        </label>
      </section>

      {/* 원천징수 옵션 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🧾 원천징수 (이미 떼인 세금)</p>
        <div className={styles.pillRow}>
          <button
            className={`${styles.pill} ${inputs.withholdingMode === 'auto' ? styles.pillActive : ''}`}
            onClick={() => update('withholdingMode', 'auto')}>
            자동 (매출 × 3.3%)
          </button>
          <button
            className={`${styles.pill} ${inputs.withholdingMode === 'manual' ? styles.pillActive : ''}`}
            onClick={() => update('withholdingMode', 'manual')}>
            직접 입력
          </button>
        </div>
        {inputs.withholdingMode === 'manual' && (
          <div className={styles.numberRow} style={{ marginTop: 10 }}>
            <label>원천징수액</label>
            <input
              type="text"
              inputMode="numeric"
              className={styles.midInput}
              value={inputs.prevYearWithholding.toLocaleString()}
              onChange={(e) => update('prevYearWithholding', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
            />
            <span>원</span>
          </div>
        )}
      </section>

      {/* 결과 */}
      <section>
        <label className={styles.label}>계산 결과</label>
        <div className={styles.resultMain}>
          <p className={styles.resultLabel}>예상 환급/납부</p>
          <p className={`${styles.resultBig} ${refundColor}`}>
            {result.refund >= 0 ? '+' : ''}{fmtKRWPrecise(result.refund)}
          </p>
          <p className={styles.resultSub}>
            {result.refund >= 0
              ? `5월 신고 시 6~7월에 ${fmtKRW(result.refund)} 환급 예상`
              : `5월 신고 시 ${fmtKRW(-result.refund)} 추가 납부 필요`}
          </p>
          <div className={styles.resultMetrics}>
            <div>
              <span>실효세율</span>
              <strong>{result.effectiveRate.toFixed(2)}%</strong>
            </div>
            <div>
              <span>한계세율</span>
              <strong>{result.marginalRate.toFixed(1)}%</strong>
            </div>
            <div>
              <span>적용 구간</span>
              <strong>{result.appliedBracket.label}</strong>
            </div>
          </div>
        </div>

        <div className={styles.flowList}>
          {[
            ['연 총 매출',           fmtKRWPrecise(result.revenue),                           ''],
            [`필요경비 (${result.expenseRate.toFixed(1)}%)`, `- ${fmtKRWPrecise(result.expenseAmount)}`, 'minus'],
            ['= 사업소득금액',       fmtKRWPrecise(result.businessIncome),                    'sum'],
            ['종합소득공제',         `- ${fmtKRWPrecise(result.totalDeduction)}`,             'minus'],
            ['= 과세표준',           fmtKRWPrecise(result.taxableBase),                       'sum'],
            ['산출세액',             fmtKRWPrecise(result.computedTax),                       ''],
            ['세액공제',             `- ${fmtKRWPrecise(result.taxCredit)}`,                  'minus'],
            ['= 결정세액 (소득세)',   fmtKRWPrecise(result.finalTax),                          'sum'],
            ['+ 지방소득세 (10%)',    fmtKRWPrecise(result.localTax),                          ''],
            ['총 부담세액',          fmtKRWPrecise(result.totalTax),                          'total'],
            ['원천징수 (이미 낸 세금)', `- ${fmtKRWPrecise(inputs.withholdingMode === 'manual' ? inputs.prevYearWithholding : Math.floor(inputs.revenue * 0.033))}`, 'minus'],
          ].map(([label, value, kind], i) => (
            <div key={i} className={`${styles.flowRow} ${kind === 'sum' ? styles.flowRowSum : ''} ${kind === 'total' ? styles.flowRowTotal : ''}`}>
              <span className={styles.flowLabel}>{label}</span>
              <span className={`${styles.flowValue} ${kind === 'minus' ? styles.flowValueMinus : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ═════════════════════ TAB 2: 시나리오 비교 ═════════════════════ */
function CompareTab({ base, scenarios }: { base: CalcResult; scenarios: Scenario[] }) {
  const baseRefund = scenarios[0].result.refund
  return (
    <div className={styles.panel}>
      <p className={styles.intro}>
        현재 입력값을 기준으로 5가지 절세 시나리오의 환급액을 비교합니다. 각 카드의 차액(<strong>+절세</strong>)이 클수록 효과가 큽니다.
      </p>

      <div className={styles.scenarioGrid}>
        {scenarios.map((s, idx) => {
          const diff = s.result.refund - baseRefund
          const isBest = scenarios.slice(1).every((other) => other.result.refund <= s.result.refund) && idx > 0
          return (
            <div key={s.key} className={`${styles.scenarioCard} ${isBest ? styles.scenarioCardBest : ''} ${idx === 0 ? styles.scenarioCardCurrent : ''}`}>
              {isBest && <span className={styles.bestBadge}>BEST</span>}
              {idx === 0 && <span className={styles.currentBadge}>현재</span>}
              <p className={styles.scenarioLabel}>{s.label}</p>
              <p className={styles.scenarioDesc}>{s.desc}</p>
              <p className={styles.scenarioRefund}>
                환급: <strong className={s.result.refund >= 0 ? styles.refundPos : styles.refundNeg}>
                  {s.result.refund >= 0 ? '+' : ''}{fmtKRW(s.result.refund)}
                </strong>
              </p>
              {idx > 0 && (
                <p className={`${styles.scenarioDiff} ${diff >= 0 ? styles.diffPos : styles.diffNeg}`}>
                  {diff >= 0 ? '▲ +' : '▼ '}{fmtKRW(diff)} 절세
                </p>
              )}
              <div className={styles.scenarioMini}>
                <span>과세표준 {fmtKRW(s.result.taxableBase)}</span>
                <span>실효 {s.result.effectiveRate.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.compareSummary}>
        <p>
          💡 <strong>해석 가이드:</strong> 노란우산은 <em>소득공제</em> (한계세율만큼 절세), 연금저축은 <em>세액공제</em> (16.5% 또는 13.2% 정액).
          {base.appliedBracket.rate >= 0.24
            ? ' 한계세율이 24% 이상이면 노란우산이 연금저축보다 효율적인 경우가 많습니다.'
            : ' 한계세율이 15% 이하면 연금저축의 정률 세액공제가 유리할 수 있습니다.'}
        </p>
      </div>
    </div>
  )
}

/* ═════════════════════ TAB 3: 절세 시뮬 ═════════════════════ */
function OptimizeTab({ inputs, result }: { inputs: CalcInputs; result: CalcResult }) {
  const [yellowSim, setYellowSim] = useState(inputs.yellowUmbrella)
  const [pensionSim, setPensionSim] = useState(inputs.pensionSavings)
  const [depSim, setDepSim] = useState(inputs.dependents)

  useEffect(() => {
    setYellowSim(inputs.yellowUmbrella)
    setPensionSim(inputs.pensionSavings)
    setDepSim(inputs.dependents)
  }, [inputs.yellowUmbrella, inputs.pensionSavings, inputs.dependents])

  const yellowResult = useMemo(() => simulateDeduction(inputs, { yellowUmbrella: yellowSim }), [inputs, yellowSim])
  const pensionResult = useMemo(() => simulateDeduction(inputs, { pensionSavings: pensionSim }), [inputs, pensionSim])
  const depResult = useMemo(() => simulateDeduction(inputs, { dependents: depSim }), [inputs, depSim])

  const tips = useMemo(() => recommendSavings(result, inputs), [result, inputs])

  return (
    <div className={styles.panel}>
      {/* 누진세율 막대그래프 */}
      <section>
        <label className={styles.label}>종합소득세 누진세율 8단계 <span className={styles.labelSub}>(현재 위치 강조)</span></label>
        <div className={styles.bracketChart}>
          {PROGRESSIVE_BRACKETS.map((b) => {
            const isCurrent = b.min < result.taxableBase && result.taxableBase <= b.max
            return (
              <div key={b.label} className={`${styles.bracketBar} ${isCurrent ? styles.bracketBarActive : ''}`}>
                <span className={styles.bracketLabel}>{b.label}</span>
                <div className={styles.bracketTrack}>
                  <div className={styles.bracketFill} style={{ width: `${(b.rate / 0.45) * 100}%` }}>
                    <span className={styles.bracketRate}>{(b.rate * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {isCurrent && <span className={styles.bracketArrow}>← 현재</span>}
              </div>
            )
          })}
        </div>
        <p className={styles.note}>
          현재 한계세율 <strong>{result.marginalRate.toFixed(1)}%</strong> (지방세 포함) — 다음 100만원 추가 매출 시 세금 약 <strong>{fmtKRW(Math.floor(result.marginalRate * 10_000))}</strong> 추가 부담.
        </p>
      </section>

      {/* 슬라이더 시뮬 */}
      <section>
        <label className={styles.label}>공제별 절세 효과 시뮬레이션</label>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>☂️ 노란우산공제</span>
            <strong>{fmtKRW(yellowSim)}</strong>
          </div>
          <input
            type="range" min={0} max={5_000_000} step={100_000}
            value={yellowSim}
            onChange={(e) => setYellowSim(+e.target.value)}
            className={styles.slider}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(yellowResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>한도 {fmtKRW(yellowUmbrellaLimit(result.businessIncome))}</span>
          </p>
        </div>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>💰 연금저축</span>
            <strong>{fmtKRW(pensionSim)}</strong>
          </div>
          <input
            type="range" min={0} max={6_000_000} step={100_000}
            value={pensionSim}
            onChange={(e) => setPensionSim(+e.target.value)}
            className={styles.slider}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(pensionResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>{result.businessIncome <= 45_000_000 ? '16.5%' : '13.2%'} 세액공제 · 한도 600만</span>
          </p>
        </div>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>👨‍👩‍👦 부양가족</span>
            <strong>{depSim}명</strong>
          </div>
          <input
            type="range" min={0} max={5} step={1}
            value={depSim}
            onChange={(e) => setDepSim(+e.target.value)}
            className={styles.slider}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(depResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>1명당 150만 소득공제</span>
          </p>
        </div>
      </section>

      {/* 추천 절세 조합 */}
      {tips.length > 0 && (
        <section className={styles.optionCard}>
          <p className={styles.gapTitle}>🎯 추천 절세 전략</p>
          <div className={styles.tipList}>
            {tips.map((t, i) => (
              <div key={i} className={styles.tipCard}>
                <span className={styles.tipEmoji}>{t.emoji}</span>
                <div className={styles.tipBody}>
                  <p className={styles.tipTitle}>{t.title}</p>
                  <p className={styles.tipDesc}>{t.desc}</p>
                </div>
                {t.estimatedSaving > 0 && (
                  <span className={styles.tipSaving}>+{fmtKRW(t.estimatedSaving)}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ═════════════════════ TAB 4: 신고 가이드 ═════════════════════ */
function GuideTab() {
  // D-day 계산 — useEffect로 hydration 안전
  const [today, setToday] = useState<{ now: Date; deadline: Date; daysLeft: number } | null>(null)
  useEffect(() => {
    const now = new Date()
    let year = now.getFullYear()
    if (now.getMonth() > 4) year += 1  // 5월 지났으면 다음 해
    const deadline = new Date(year, 4, 31, 23, 59, 59)  // 5월 31일
    const ms = deadline.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    setToday({ now, deadline, daysLeft })
  }, [])

  const checklist = [
    '📄 지급명세서 (사업소득) — 거래처에서 1월 말까지 발급',
    '🧾 매출 증빙 (세금계산서·현금영수증·계약서)',
    '💳 경비 영수증 (사업용 신용카드 사용내역)',
    '📒 장부 (간편/복식) — 매출 기준에 따라',
    '☂️ 노란우산공제 납입증명서',
    '💰 연금저축·IRP 납입증명서',
    '🏥 국민건강보험·국민연금 납부확인서',
    '👨‍👩‍👦 부양가족 가족관계증명서·소득증빙 (필요 시)',
    '🎁 기부금 영수증 (종교·법정 단체)',
  ]

  const steps = [
    { step: 1, title: '홈택스 접속', desc: 'hometax.go.kr 로그인 (공동인증서·간편인증·금융인증)', url: 'https://www.hometax.go.kr' },
    { step: 2, title: '종합소득세 신고 메뉴', desc: '신고/납부 > 종합소득세 > 일반신고 또는 모두채움' },
    { step: 3, title: '소득자료 불러오기', desc: '국세청이 거래처에서 받은 지급명세서 자동 표시' },
    { step: 4, title: '경비 입력', desc: '단순경비율은 자동 / 장부는 수기 입력' },
    { step: 5, title: '소득공제·세액공제', desc: '인적공제·노란우산·연금저축 자료 입력 (대부분 자동)' },
    { step: 6, title: '신고서 검증·제출', desc: '오류 점검 후 전자 제출' },
    { step: 7, title: '환급/납부', desc: '환급: 6~7월 입력한 계좌 입금 / 납부: 납부서 출력 후 5월 31일까지' },
  ]

  return (
    <div className={styles.panel}>
      {/* D-day */}
      <section className={styles.ddayCard}>
        <p className={styles.ddayLabel}>다음 종합소득세 신고 마감</p>
        <p className={styles.ddayBig}>
          {today ? `D-${today.daysLeft}` : '계산 중…'}
        </p>
        <p className={styles.ddaySub}>
          {today ? `${today.deadline.getFullYear()}년 5월 31일 (수)` : '신고기간 5월 1일 ~ 5월 31일'}
        </p>
      </section>

      {/* 체크리스트 */}
      <section>
        <label className={styles.label}>📋 신고 전 준비 서류</label>
        <ul className={styles.checklist}>
          {checklist.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      {/* 신고 절차 */}
      <section>
        <label className={styles.label}>🪜 홈택스 신고 단계</label>
        <div className={styles.stepList}>
          {steps.map((s) => (
            <div key={s.step} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.step}</span>
              <div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" className={styles.stepLink}>{s.url} ↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          ⚠️ 본 가이드는 정보 안내용 — 자동 신고·홈택스 연동 X. 실제 신고는 본인이 홈택스에서 직접 진행하거나 세무사에게 위임하세요.
        </p>
      </section>

      {/* 관련 도구 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🔗 관련 도구</p>
        <ul className={styles.relatedList}>
          <li><Link href="/tools/finance/4-insurance">4대보험 계산기</Link> — 국민연금·건강보험 부담액</li>
          <li><Link href="/tools/finance/salary">연봉 실수령액 계산기</Link> — 직장인 + 부업 합산 시 본업 실수령</li>
          <li><Link href="/tools/finance/severance">퇴직금 실수령액 계산기</Link> — 퇴직 후 프리랜서 전환 시</li>
          <li><Link href="/tools/finance/vat">부가세 계산기</Link> — 별개 세금 (분기·반기 신고)</li>
        </ul>
      </section>
    </div>
  )
}
