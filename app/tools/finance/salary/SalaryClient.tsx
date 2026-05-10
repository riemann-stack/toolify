'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import styles from './salary.module.css'
import {
  NON_TAXABLE_ITEMS, RAISE_OPTIONS, MIN_HOURLY_WAGE_2026,
  calcSalary, reverseCalcSalary, simulateRaise,
  calcHourlyWage, getSalaryPercentile,
  buildSalaryTable, buildNetTargetTable,
  won, formatEok, parseAmount,
} from './salaryUtils'

type Tab = 'main' | 'reverse' | 'raise' | 'hourly' | 'table'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'main',    name: '실수령액',  icon: '💴' },
  { id: 'reverse', name: '역산',      icon: '🔄' },
  { id: 'raise',   name: '인상 시뮬', icon: '📈' },
  { id: 'hourly',  name: '시급',     icon: '⏰' },
  { id: 'table',   name: '연봉표',   icon: '📊' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  main:    styles.tabActive,
  reverse: styles.tabActiveReverse,
  raise:   styles.tabActiveRaise,
  hourly:  styles.tabActiveHourly,
  table:   styles.tabActiveTable,
}

const PRESETS = [
  { label: '5,000만', value: 50_000_000 },
  { label: '1억',     value: 100_000_000 },
  { label: '1.5억',   value: 150_000_000 },
]

export default function SalaryClient() {
  const [tab, setTab] = useState<Tab>('main')

  /* 공통 입력 */
  const [annualMan, setAnnualMan] = useState('5000')
  const [dependents, setDependents] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)

  /* 비과세 */
  const [nonTaxableSelected, setNonTaxableSelected] = useState<Record<string, boolean>>({
    meal: false, transport: false, childcare: false, research: false,
  })
  const [extraNonTaxable, setExtraNonTaxable] = useState('0')

  const annualGross = useMemo(() => {
    const n = parseAmount(annualMan)
    return n * 10_000  // 만원 → 원
  }, [annualMan])

  const nonTaxableMonthly = useMemo(() => {
    let sum = 0
    for (const item of NON_TAXABLE_ITEMS) {
      if (nonTaxableSelected[item.id]) sum += item.monthlyMax
    }
    sum += parseAmount(extraNonTaxable)
    return sum
  }, [nonTaxableSelected, extraNonTaxable])

  const valid = annualGross >= 1_000_000 && annualGross <= 5_000_000_000

  const result = useMemo(() => {
    if (!valid) return null
    return calcSalary({
      grossYearly: annualGross, dependents, childrenCount,
      nonTaxableMonthly, isInsured: true,
    })
  }, [valid, annualGross, dependents, childrenCount, nonTaxableMonthly])

  const percentile = useMemo(() => getSalaryPercentile(annualGross), [annualGross])

  /* 탭 2 — 역산 */
  const [targetNetMan, setTargetNetMan] = useState('300')
  const targetNetMonthly = parseAmount(targetNetMan) * 10_000
  const reverseResult = useMemo(() => {
    if (targetNetMonthly < 500_000) return null
    return reverseCalcSalary({
      targetNetMonthly, dependents, childrenCount, nonTaxableMonthly,
    })
  }, [targetNetMonthly, dependents, childrenCount, nonTaxableMonthly])

  const targetTable = useMemo(
    () => buildNetTargetTable(dependents, childrenCount, nonTaxableMonthly),
    [dependents, childrenCount, nonTaxableMonthly],
  )

  /* 탭 3 — 인상 시뮬 */
  const raiseResults = useMemo(() => {
    if (!valid) return []
    return RAISE_OPTIONS.map(p => simulateRaise(annualGross, p, dependents, childrenCount, nonTaxableMonthly))
  }, [valid, annualGross, dependents, childrenCount, nonTaxableMonthly])

  /* 탭 4 — 시급 */
  const [weeklyHours, setWeeklyHours] = useState(40)
  const [weeklyOvertime, setWeeklyOvertime] = useState(5)
  const [dailyCommute, setDailyCommute] = useState(60)
  const [vacationDays, setVacationDays] = useState(15)

  const hourly = useMemo(() => {
    if (!result) return null
    return calcHourlyWage({
      yearly: annualGross, netYearly: result.netYearly,
      weeklyHours, weeklyOvertime, dailyCommuteMin: dailyCommute, vacationDays,
    })
  }, [result, annualGross, weeklyHours, weeklyOvertime, dailyCommute, vacationDays])

  /* 탭 5 — 연봉표 */
  const salaryTable = useMemo(
    () => buildSalaryTable(dependents, childrenCount, nonTaxableMonthly),
    [dependents, childrenCount, nonTaxableMonthly],
  )

  /* 복사 */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  /* 도넛 차트 */
  const donut = useMemo(() => {
    if (!result) return null
    const total = result.grossMonthly
    if (total <= 0) return null
    const segments = [
      { name: '실수령',   value: result.netMonthly,                                  color: 'var(--accent)' },
      { name: '4대보험', value: result.totalInsurance,                              color: '#3EC8FF' },
      { name: '세금',    value: result.totalTax,                                    color: '#FF8C3E' },
    ]
    if (result.nonTaxableMonthly > 0) {
      segments.push({ name: '비과세', value: result.nonTaxableMonthly, color: '#3EFF9B' })
    }
    // 도넛: 비과세는 별도(과세에서 제외된 부분 표시) — 우리는 grossMonthly 기준
    const sumForDonut = segments.reduce((s, x) => s + x.value, 0)
    let acc = 0
    const r = 56, cx = 80, cy = 80
    const arcs = segments.map(s => {
      const start = (acc / sumForDonut) * 2 * Math.PI - Math.PI / 2
      acc += s.value
      const end = (acc / sumForDonut) * 2 * Math.PI - Math.PI / 2
      const large = end - start > Math.PI ? 1 : 0
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
      return {
        ...s,
        d: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`,
      }
    })
    return { arcs, sumForDonut }
  }, [result])

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
      >
        2026년 4대보험 요율
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 — 연봉 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>세전 연봉 (만원)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="5000" value={annualMan} onChange={e => setAnnualMan(e.target.value)} />
          <span className={styles.unit}>만원</span>
        </div>
        <div className={styles.optionRow5} style={{ marginTop: 8 }}>
          {PRESETS.map(p => (
            <button key={p.value}
              className={`${styles.optionBtn} ${parseAmount(annualMan) * 10_000 === p.value ? styles.optionActive : ''}`}
              onClick={() => setAnnualMan(String(p.value / 10_000))}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 부양가족 + 자녀 */}
      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>부양가족 (본인 포함)</label>
          <div className={styles.optionRow6}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button key={n}
                className={`${styles.optionBtn} ${dependents === n ? styles.optionActive : ''}`}
                onClick={() => setDependents(n)}>{n === 6 ? '6+' : `${n}명`}</button>
            ))}
          </div>
          <p className={styles.cardLabelHint} style={{ marginTop: 4, fontSize: 11 }}>
            ⓘ 6명 이상은 동일하게 처리됩니다 (간이세액표 한도)
          </p>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>8세 이상 20세 이하 자녀 <span className={styles.cardLabelHint}>(만 나이)</span></label>
          <div className={styles.optionRow6}>
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button key={n}
                className={`${styles.optionBtn} ${childrenCount === n ? styles.optionActive : ''}`}
                onClick={() => setChildrenCount(n)}>{n === 5 ? '5+' : `${n}명`}</button>
            ))}
          </div>
          <p className={styles.cardLabelHint} style={{ marginTop: 4, fontSize: 11 }}>
            ⓘ 5명 이상 동일 처리 · 자녀 1명당 월 12,500원 추가 공제
          </p>
        </div>
      </div>

      {/* 비과세 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          비과세 항목 (선택)
          <span className={styles.cardLabelHint}>월 합계: <b style={{ color: 'var(--accent)' }}>{won(nonTaxableMonthly)}</b></span>
        </label>
        <div className={styles.checkRow}>
          {NON_TAXABLE_ITEMS.map(it => (
            <label key={it.id}
              className={`${styles.checkItem} ${nonTaxableSelected[it.id] ? styles.checkItemActive : ''}`}>
              <input type="checkbox"
                checked={!!nonTaxableSelected[it.id]}
                onChange={e => setNonTaxableSelected({ ...nonTaxableSelected, [it.id]: e.target.checked })} />
              <div>
                <strong>{it.name}{it.recommended && ' ★'}</strong>
                <small>{it.desc}</small>
              </div>
              <span className={styles.checkAmount}>월 {won(it.monthlyMax)}</span>
            </label>
          ))}
        </div>
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11.5, color: 'var(--muted)' }}>
            기타 비과세 직접 입력
          </summary>
          <div className={styles.inputRow} style={{ marginTop: 8 }}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="0" value={extraNonTaxable} onChange={e => setExtraNonTaxable(e.target.value)} />
            <span className={styles.unit}>원/월</span>
          </div>
        </details>
      </div>

      {!valid && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>세전 연봉을 입력하세요</div>
          유효 범위: 100만원 ~ 50억원
        </div>
      )}

      {/* ─────────── 탭 1: 실수령액 ─────────── */}
      {tab === 'main' && result && (
        <>
          <div className={styles.hero}
            style={{ borderColor: 'rgba(200,255,62,0.30)', background: 'rgba(200,255,62,0.06)' }}>
            <div className={styles.heroLabel}>월 실수령액</div>
            <div className={styles.heroNum} style={{ color: 'var(--accent)' }}>
              {won(result.netMonthly)}
            </div>
            <div className={styles.heroSub}>
              연 실수령 {formatEok(result.netYearly)} · 실수령률 <strong style={{ color: 'var(--accent)' }}>{result.takeHomeRate.toFixed(1)}%</strong>
            </div>
            <div className={styles.heroDesc}>
              세전 월급 {won(result.grossMonthly)} · 총 공제 {won(result.totalDeduction)} ({result.effectiveRate.toFixed(1)}%)
            </div>
          </div>

          {/* 도넛 + 분포 */}
          {donut && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>구성 비율</label>
              <div className={styles.donutWrap}>
                <svg viewBox="0 0 160 160" className={styles.donutSvg}>
                  {donut.arcs.map((a, i) => (
                    <path key={i} d={a.d} fill={a.color} stroke="var(--bg2)" strokeWidth="1" />
                  ))}
                  <circle cx="80" cy="80" r="32" fill="var(--bg2)" />
                  <text x="80" y="78" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="Noto Sans KR">월급</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text)" fontFamily="Inter, system-ui, sans-serif">{Math.round(result.grossMonthly / 10_000)}만</text>
                </svg>
                <div className={styles.donutLegend}>
                  {donut.arcs.map((a, i) => {
                    const total = donut.arcs.reduce((s, x) => s + x.value, 0)
                    const pct = total > 0 ? ((a.value / total) * 100).toFixed(1) : '0.0'
                    return (
                      <div key={i} className={styles.donutLegendItem}>
                        <i style={{ background: a.color }} />
                        <span>{a.name}</span>
                        <b style={{ color: a.color }}>{won(a.value)} <em style={{ fontSize: '11px', opacity: 0.85, fontStyle: 'normal' }}>({pct}%)</em></b>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 공제 내역 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>공제 내역 상세</label>
            <div className={styles.deductionTable}>
              <div className={`${styles.deductionRow} ${styles.headerRow}`}>
                <span>항목</span><span>월</span><span>연</span>
              </div>
              <div className={styles.deductionRow}>
                <span>세전 월급</span>
                <span>{won(result.grossMonthly)}</span>
                <span>{won(result.grossMonthly * 12)}</span>
              </div>
              {result.nonTaxableMonthly > 0 && (
                <div className={styles.deductionRow} style={{ background: 'rgba(62,255,155,0.06)', borderColor: 'rgba(62,255,155,0.30)' }}>
                  <span>비과세</span>
                  <span style={{ color: '#3EFF9B' }}>−{won(result.nonTaxableMonthly)}</span>
                  <span style={{ color: '#3EFF9B' }}>−{won(result.nonTaxableMonthly * 12)}</span>
                </div>
              )}
              <div className={styles.deductionRow}>
                <span>과세 급여</span>
                <span>{won(result.taxableMonthly)}</span>
                <span>{won(result.taxableMonthly * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowSection}`}>
                <span>국민연금</span>
                <span>{won(result.pension)}</span>
                <span>{won(result.pension * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowSection}`}>
                <span>건강보험</span>
                <span>{won(result.health)}</span>
                <span>{won(result.health * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowSection}`}>
                <span>장기요양</span>
                <span>{won(result.longTermCare)}</span>
                <span>{won(result.longTermCare * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowSection}`}>
                <span>고용보험</span>
                <span>{won(result.employment)}</span>
                <span>{won(result.employment * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowTax}`}>
                <span>소득세</span>
                <span>{won(result.incomeTax)}</span>
                <span>{won(result.incomeTax * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowTax}`}>
                <span>지방소득세</span>
                <span>{won(result.localTax)}</span>
                <span>{won(result.localTax * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowTotal}`}>
                <span>총 공제</span>
                <span>{won(result.totalDeduction)}</span>
                <span>{won(result.totalDeduction * 12)}</span>
              </div>
              <div className={`${styles.deductionRow} ${styles.deductionRowTotal}`}>
                <span>실수령</span>
                <span>{won(result.netMonthly)}</span>
                <span>{won(result.netYearly)}</span>
              </div>
            </div>
          </div>

          {/* 연봉 분포 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>한국 직장인 연봉 분포 위치 (참고)</label>
            <div style={{ position: 'relative', paddingBottom: 36, marginTop: 8 }}>
              <div className={styles.percentileBar}>
                <div className={styles.percentileSeg} style={{ background: '#FF8C3E' }}>하위 10%</div>
                <div className={styles.percentileSeg} style={{ background: '#FFD700' }}>25%</div>
                <div className={styles.percentileSeg} style={{ background: '#3EC8FF' }}>50%</div>
                <div className={styles.percentileSeg} style={{ background: '#3EFF9B' }}>75%</div>
                <div className={styles.percentileSeg} style={{ background: 'var(--accent)' }}>상위 10%</div>
              </div>
              <div className={styles.percentileMarker} style={{ left: `${Math.min(98, percentile.percentile)}%`, top: '50%' }} />
              <div className={styles.percentileLabel} style={{ left: `${Math.min(98, percentile.percentile)}%`, top: 'auto', bottom: 0 }}>
                {percentile.description}
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              ⓘ 통계청·국세청 임금근로자 평균 연봉 약 4,332만원, 중위소득 약 3,594만원 (2025년 기준).
              본 위치는 추정값이며 업종·지역·연령에 따라 다릅니다.
            </p>
          </div>

          <div className={styles.resultActions}>
            <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(`연봉 ${formatEok(annualGross)} → 월 실수령 ${won(result.netMonthly)} (실수령률 ${result.takeHomeRate.toFixed(1)}%)`)}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
        </>
      )}

      {/* ─────────── 탭 2: 역산 ─────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.disclaimer}>
            <strong>월 실수령 → 세전 연봉 역산</strong> — &lsquo;월 300만원 받으려면 연봉 얼마?&rsquo; — 원하는 월 실수령액을 입력하면 필요한 세전 연봉을 자동 계산합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>원하는 월 실수령액 (만원)</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                placeholder="300" value={targetNetMan} onChange={e => setTargetNetMan(e.target.value)} />
              <span className={styles.unit}>만원/월</span>
            </div>
            <div className={styles.optionRow5} style={{ marginTop: 8 }}>
              {[200, 250, 300, 400, 500].map(v => (
                <button key={v}
                  className={`${styles.optionBtn} ${parseAmount(targetNetMan) === v ? styles.optionActive : ''}`}
                  onClick={() => setTargetNetMan(String(v))}>
                  {v}만
                </button>
              ))}
            </div>
          </div>

          {reverseResult && (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(255,215,0,0.30)', background: 'rgba(255,215,0,0.06)' }}>
                <div className={styles.heroLabel}>필요 세전 연봉</div>
                <div className={styles.heroNum} style={{ color: '#FFD700' }}>
                  {formatEok(reverseResult.grossYearly)}
                </div>
                <div className={styles.heroSub}>
                  월 세전 {won(reverseResult.grossMonthly)} · 월 실수령 {won(reverseResult.netMonthly)}
                </div>
                <div className={styles.heroDesc}>
                  실수령률 {reverseResult.takeHomeRate.toFixed(1)}% · 월 공제 약 {won(reverseResult.totalDeduction)}
                </div>
              </div>

              <div className={styles.infoBox}>
                💡 <strong>협상 안정 범위</strong> — {formatEok(reverseResult.rangeLow)} ~ {formatEok(reverseResult.rangeHigh)}.
                이직·연봉 협상 시 본 범위로 시작하면 안정적으로 목표 월 실수령에 도달할 수 있습니다.
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>월 실수령 목표별 표</label>
                <div className={styles.targetTable}>
                  <div className={`${styles.targetRow} ${styles.headerRow}`}>
                    <span>월 실수령</span>
                    <span style={{ textAlign: 'right' }}>필요 세전 연봉</span>
                    <span style={{ textAlign: 'right' }}>실수령률</span>
                  </div>
                  {targetTable.map(r => {
                    const isMatch = Math.abs(r.targetNetMonthly - targetNetMonthly) < 100_000
                    return (
                      <div key={r.targetNetMonthly}
                        className={styles.targetRow}
                        style={isMatch ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)' } : {}}>
                        <span>{won(r.targetNetMonthly)}</span>
                        <span>{formatEok(r.grossYearly)}</span>
                        <span>{r.takeHomeRate.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`월 실수령 ${won(targetNetMonthly)} → 필요 세전 연봉 ${formatEok(reverseResult.grossYearly)}`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => {
                  setAnnualMan(String(reverseResult.grossYearly / 10_000))
                  setTab('main')
                }}>💴 실수령 탭으로 적용</button>
                <button className={styles.copyBtn} onClick={() => setTab('table')}>📊 연봉표</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ─────────── 탭 3: 인상 시뮬 ─────────── */}
      {tab === 'raise' && result && (
        <>
          <div className={styles.disclaimer}>
            <strong>인상 시뮬레이션</strong> — 세전 인상률보다 실수령 인상률이 약 1~3%p 낮습니다(누진 세율). 8가지 인상률을 한눈에 비교하세요.
          </div>

          <div className={styles.hero}
            style={{ borderColor: 'rgba(62,200,255,0.30)', background: 'rgba(62,200,255,0.06)' }}>
            <div className={styles.heroLabel}>현재 연봉 — 월 실수령 기준</div>
            <div className={styles.heroNum} style={{ color: '#3EC8FF' }}>
              {won(result.netMonthly)}
            </div>
            <div className={styles.heroSub}>
              연봉 {formatEok(annualGross)} · 연 실수령 {formatEok(result.netYearly)}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>인상률별 비교</label>
            <div className={styles.raiseTable}>
              <div className={`${styles.raiseRow} ${styles.headerRow}`}>
                <span>인상률</span>
                <span style={{ textAlign: 'right' }}>인상 후 연봉</span>
                <span style={{ textAlign: 'right' }}>월 실수령</span>
                <span style={{ textAlign: 'right' }}>월 +/-</span>
              </div>
              {raiseResults.map(r => (
                <div key={r.percent}
                  className={`${styles.raiseRow} ${
                    r.percent >= 30 ? styles.raiseRowVeryHigh : r.percent >= 15 ? styles.raiseRowHigh : ''
                  }`}>
                  <span className={styles.raisePct}>+{r.percent}%</span>
                  <span className={styles.raiseCell}>{formatEok(r.newYearly)}</span>
                  <span className={styles.raiseCellMain}>{won(r.newNetMonthly)}</span>
                  <span className={styles.raiseCell} style={{ color: 'var(--accent)' }}>
                    +{won(r.monthlyIncreaseNet)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>해석</label>
            <div className={styles.deductionTable}>
              {raiseResults.slice(0, 5).map(r => (
                <div key={r.percent} className={styles.deductionRow}>
                  <span>+{r.percent}% 인상 시</span>
                  <span style={{ color: 'var(--accent)' }}>월 +{won(r.monthlyIncreaseNet)}</span>
                  <span style={{ color: '#FF8C3E' }}>실수령 +{r.netRaisePercent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.infoBox}>
            💡 <strong>이직 시 협상 가이드</strong> — 동일 직급 이직: +10~15% / 직급 상승 이직: +20~30% / 한국 평균 이직 인상률: 12~18%.
            세전 인상률보다 실수령 인상률이 1~3%p 낮으니 협상 시 세후 기준도 함께 검토하세요.
          </div>

          <div className={styles.warnBox}>
            ⓘ 본 도구는 연봉 인상이 실수령에 미치는 영향만 보여줍니다. 실제 협상 시 직급·역할 변화, 회사 복지·휴가, 출퇴근·근무 환경, 장기 커리어 가치를 함께 고려하세요.
          </div>
        </>
      )}

      {/* ─────────── 탭 4: 시급 ─────────── */}
      {tab === 'hourly' && result && hourly && (
        <>
          <div className={styles.disclaimer}>
            <strong>시급·체감 시급</strong> — 세전 시급은 연봉 ÷ (12 × 209시간). 야근·출퇴근을 포함하면 체감 시급이 크게 낮아집니다.
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>주 근무 시간 — {weeklyHours}시간</label>
              <div className={styles.sliderRow}>
                <input className={styles.slider} type="range" min="20" max="60" step="1"
                  value={weeklyHours} onChange={e => setWeeklyHours(parseInt(e.target.value, 10))} />
                <span className={styles.sliderVal}>{weeklyHours}h</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>주 야근 — {weeklyOvertime}시간</label>
              <div className={styles.sliderRow}>
                <input className={styles.slider} type="range" min="0" max="30" step="1"
                  value={weeklyOvertime} onChange={e => setWeeklyOvertime(parseInt(e.target.value, 10))} />
                <span className={styles.sliderVal}>{weeklyOvertime}h</span>
              </div>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>일일 출퇴근 — {dailyCommute}분</label>
              <div className={styles.sliderRow}>
                <input className={styles.slider} type="range" min="0" max="180" step="5"
                  value={dailyCommute} onChange={e => setDailyCommute(parseInt(e.target.value, 10))} />
                <span className={styles.sliderVal}>{dailyCommute}분</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>연차 사용 — {vacationDays}일</label>
              <div className={styles.sliderRow}>
                <input className={styles.slider} type="range" min="0" max="30" step="1"
                  value={vacationDays} onChange={e => setVacationDays(parseInt(e.target.value, 10))} />
                <span className={styles.sliderVal}>{vacationDays}일</span>
              </div>
            </div>
          </div>

          <div className={styles.hero}
            style={{ borderColor: 'rgba(255,140,62,0.30)', background: 'rgba(255,140,62,0.06)' }}>
            <div className={styles.heroLabel}>체감 시급 (출퇴근 포함)</div>
            <div className={styles.heroNum} style={{ color: '#FF8C3E' }}>
              {won(hourly.perceivedHourlyNet)}
            </div>
            <div className={styles.heroSub}>
              세전 시급 {won(hourly.baseHourlyGross)} · 세후 {won(hourly.baseHourlyNet)} · 야근 포함 {won(hourly.realHourlyNet)}
            </div>
            <div className={styles.heroDesc}>
              연간 총 노동 시간(출퇴근 포함): 약 {hourly.yearlyTotalHours.toLocaleString()}시간
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>4가지 시급 비교</label>
            <div className={styles.hourlyTable}>
              {[
                { name: '세전 시급',          desc: '연봉 ÷ (12 × 209시간)', val: hourly.baseHourlyGross,    color: 'var(--muted)',  ratio: 1 },
                { name: '세후 시급',          desc: '실수령 ÷ 209시간',       val: hourly.baseHourlyNet,      color: 'var(--accent)', ratio: hourly.baseHourlyNet / hourly.baseHourlyGross },
                { name: '야근 포함',          desc: '실수령 ÷ (근무 + 야근)', val: hourly.realHourlyNet,      color: '#FFD700',       ratio: hourly.realHourlyNet / hourly.baseHourlyGross },
                { name: '체감 (출퇴근 포함)', desc: '실수령 ÷ 총 시간',       val: hourly.perceivedHourlyNet, color: '#FF8C3E',       ratio: hourly.perceivedHourlyNet / hourly.baseHourlyGross },
              ].map((row, i) => (
                <div key={i} className={styles.hourlyRow}>
                  <div>
                    <div className={styles.hourlyName}>{row.name}<small>{row.desc}</small></div>
                    <div className={styles.hourlyBar}>
                      <div className={styles.hourlyBarFill} style={{ width: `${Math.min(100, row.ratio * 100)}%`, background: row.color }} />
                    </div>
                  </div>
                  <span className={styles.hourlyVal} style={{ color: row.color }}>{won(row.val)}</span>
                </div>
              ))}
            </div>
          </div>

          {hourly.perceivedHourlyNet < MIN_HOURLY_WAGE_2026 && (
            <div className={styles.warnBox}>
              ⚠️ <strong>체감 시급이 2026년 최저시급({won(MIN_HOURLY_WAGE_2026)})보다 낮습니다.</strong>
              {' '}출퇴근·야근 부담이 큰 직장 환경입니다. 직장 환경 점검을 권장합니다.
            </div>
          )}

          <div className={styles.infoBox}>
            💡 <strong>참고</strong> — 2026년 최저시급 {won(MIN_HOURLY_WAGE_2026)} · OECD 평균 연 1,750시간 / 한국 평균 약 1,950시간. 같은 연봉이라도 출퇴근 30분 vs 90분 차이로 체감 시급이 약 17% 차이날 수 있습니다.
          </div>
        </>
      )}

      {/* ─────────── 탭 5: 연봉표 ─────────── */}
      {tab === 'table' && (
        <>
          <div className={styles.disclaimer}>
            <strong>2026년 연봉별 실수령액표</strong> — 부양가족 {dependents}명 · 자녀 {childrenCount}명 · 비과세 {won(nonTaxableMonthly)}/월 적용. 상단 입력값에 따라 자동 갱신됩니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>연봉 1,800만 ~ 2억 실수령액표</label>
            <div className={styles.salaryTable}>
              <div className={`${styles.salaryRow} ${styles.headerRow}`}>
                <span>연봉</span>
                <span style={{ textAlign: 'right' }}>월 세전</span>
                <span style={{ textAlign: 'right' }}>월 실수령</span>
                <span style={{ textAlign: 'right' }}>연 실수령</span>
                <span style={{ textAlign: 'right' }}>실수령률</span>
              </div>
              {salaryTable.map(row => {
                const highlight = annualGross > 0 && Math.abs(row.yearly - annualGross) <= row.yearly * 0.05
                return (
                  <div key={row.yearly}
                    className={`${styles.salaryRow} ${highlight ? styles.salaryRowHighlight : ''}`}>
                    <span>{formatEok(row.yearly)}</span>
                    <span>{won(row.monthlyGross)}</span>
                    <span>{won(row.monthlyNet)}</span>
                    <span>{formatEok(row.yearlyNet)}</span>
                    <span>{row.takeHomeRate.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ⓘ 표의 값은 부양가족·자녀·비과세 입력에 따라 자동 갱신됩니다. 부양가족 1명·자녀 0명·비과세 0원 기본값으로 보려면 상단 입력을 초기화하세요.
            </p>
          </div>

          <div className={styles.infoBox}>
            💡 <strong>참고 — 한국 직장인 연봉 (2024년)</strong> — 평균 약 4,200만 / 중위 약 3,500만 / 신입 평균 약 2,800만 / 대기업 평균 약 7,200만 / 중소기업 평균 약 3,800만. 출처: 통계청·국세청.
          </div>
        </>
      )}

      {/* 면책 강화 */}
      <div className={styles.warnBox}>
        ⓘ <strong>본 도구는 추정 계산기입니다.</strong> 회사별 비과세 항목·복지 / 상여금·성과급(별도 과세) / 두루누리 사회보험 지원 / 연말정산 결과에 따라 실제 급여명세서와 차이가 날 수 있습니다.
        정확한 급여·연말정산은 회사 인사팀 또는 세무사 상담을 권장합니다.
      </div>
    </div>
  )
}
