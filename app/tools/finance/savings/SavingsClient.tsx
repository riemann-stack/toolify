/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './savings.module.css'
import {
  HOUSEHOLD_AVG_EXPENSE, AGE_GROUPS, FIXED_ITEMS, VAR_ITEMS,
  JARS, TAX_PRODUCTS, GOAL_PRESETS,
  type Household, type AgeGroup,
  getAgeGroup, getGrade,
  calcSavings, calcSavingsRate,
  monthlyForGoal, simulateGrowth,
  fmt, fmtMan,
} from './savingsUtils'

type Tab = 'diagnose' | 'jars' | 'goal' | 'tax'

const STORAGE_KEY = 'youtil_savings_v1'

export default function SavingsClient() {
  const [tab, setTab] = useState<Tab>('diagnose')

  /* 공통 입력 */
  const [income, setIncome] = useState('300')
  const [extraIncome, setExtraIncome] = useState('0')
  const [household, setHousehold] = useState<Household>('1')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('30s_single')

  /* 지출 입력 (만원) */
  const [expenses, setExpenses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    ;[...FIXED_ITEMS, ...VAR_ITEMS].forEach((e) => {
      init[e.id] = String(e.defaultMan)
    })
    return init
  })

  /* 변동비 절감 시뮬 */
  const [eatoutCut, setEatoutCut] = useState('30')

  /* 6 항아리 (본인 입력) */
  const [jarUser, setJarUser] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    JARS.forEach((j) => init[j.id] = String(j.pct))
    return init
  })

  /* 목표 역산 */
  const [goalAmount, setGoalAmount] = useState('10000')
  const [goalYears, setGoalYears] = useState('7')
  const [goalRate, setGoalRate] = useState('5')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.income) setIncome(j.income)
      if (j.extraIncome) setExtraIncome(j.extraIncome)
      if (j.household) setHousehold(j.household)
      if (j.ageGroup) setAgeGroup(j.ageGroup)
      if (j.expenses) setExpenses(j.expenses)
      if (j.jarUser) setJarUser(j.jarUser)
      if (j.goalAmount) setGoalAmount(j.goalAmount)
      if (j.goalYears) setGoalYears(j.goalYears)
      if (j.goalRate) setGoalRate(j.goalRate)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        income, extraIncome, household, ageGroup, expenses, jarUser, goalAmount, goalYears, goalRate,
      }))
    } catch {}
  }, [income, extraIncome, household, ageGroup, expenses, jarUser, goalAmount, goalYears, goalRate])

  /* 전체 초기화 — 입력값·localStorage 삭제 */
  const resetAll = () => {
    setIncome('300'); setExtraIncome('0'); setHousehold('1'); setAgeGroup('30s_single')
    const expInit: Record<string, string> = {}
    ;[...FIXED_ITEMS, ...VAR_ITEMS].forEach((e) => { expInit[e.id] = String(e.defaultMan) })
    setExpenses(expInit)
    const jarInit: Record<string, string> = {}
    JARS.forEach((jr) => { jarInit[jr.id] = String(jr.pct) })
    setJarUser(jarInit)
    setGoalAmount('10000'); setGoalYears('7'); setGoalRate('5'); setEatoutCut('30')
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  /* 계산 — 음수 입력은 0으로 보정 (저축률 왜곡·등급 조작 방지) */
  const totalIncome = Math.max(0, parseFloat(income) || 0) + Math.max(0, parseFloat(extraIncome) || 0)
  const totalFixed = FIXED_ITEMS.reduce((sum, e) => sum + Math.max(0, parseFloat(expenses[e.id]) || 0), 0)
  const totalVar = VAR_ITEMS.reduce((sum, e) => sum + Math.max(0, parseFloat(expenses[e.id]) || 0), 0)
  const totalExpense = totalFixed + totalVar
  const savings = calcSavings(totalIncome, totalExpense)   // 적자면 음수
  const isDeficit = savings < 0
  const savingsRate = calcSavingsRate(totalIncome, savings)
  const grade = getGrade(savingsRate)

  /* 평균·권장 비교 */
  const avgExp = HOUSEHOLD_AVG_EXPENSE[household].expense
  const expVsAvg = totalExpense - avgExp
  const ageMeta = getAgeGroup(ageGroup)
  const recoMid = (ageMeta.rateMin + ageMeta.rateMax) / 2

  /* 변동비 절감 시뮬 (외식 절감) */
  const eatoutCutPct = parseFloat(eatoutCut) || 0
  const eatoutCurr = parseFloat(expenses['eatout']) || 0
  const eatoutSaving = eatoutCurr * (eatoutCutPct / 100)

  /* 6 항아리 합계 */
  const jarTotal = JARS.reduce((sum, j) => sum + (parseFloat(jarUser[j.id]) || 0), 0)

  /* 목표 역산 — 음수·0 입력 방어 */
  const goalMan = Math.max(0, parseFloat(goalAmount) || 0)
  // 상한 60년 — 극단 입력의 Infinity 표시 방지
  const yearsN = Math.min(60, Math.max(1, parseFloat(goalYears) || 1))
  const rateN = Math.max(0, parseFloat(goalRate) || 0)
  const monthlyNeeded = useMemo(() => monthlyForGoal(goalMan, yearsN, rateN), [goalMan, yearsN, rateN])
  const growth = useMemo(() => simulateGrowth(monthlyNeeded, yearsN, rateN), [monthlyNeeded, yearsN, rateN])

  const updateExpense = (id: string, v: string) => setExpenses((prev) => ({ ...prev, [id]: v }))
  const updateJar = (id: string, v: string) => setJarUser((prev) => ({ ...prev, [id]: v }))

  return (
    <div className={s.wrap}>
      {/* 안내 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '금융감독원 금융상품한눈에', href: 'https://finlife.fss.or.kr' },
          { label: '통계청 KOSIS', href: 'https://kosis.kr' },
        ]}
      >
        사용 안내 이 도구는 <strong>자가진단·시뮬레이션 용도</strong>이며 투자·저축 권유가 아닙니다. 표시 권장 저축률은 일반 가이드이며, 본인 상황에 맞춰 조정하세요. 한국 가구 평균은 통계청 가계동향조사 일반 참고치이며, 매년 변동됩니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="저축 계산기 모드">
        {([
          { id: 'diagnose', label: '저축 진단' },
          { id: 'jars',     label: '6 항아리' },
          { id: 'goal',     label: '목표 역산' },
          { id: 'tax',      label: '절세 정책' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 저축 진단 ════════ */}
      {tab === 'diagnose' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>가구·연령</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>가구 구성</label>
                <select
                  className={s.select}
                  value={household}
                  onChange={(e) => setHousehold(e.target.value as Household)}
                >
                  {(Object.keys(HOUSEHOLD_AVG_EXPENSE) as Household[]).map((h) => (
                    <option key={h} value={h}>{HOUSEHOLD_AVG_EXPENSE[h].label}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>연령대·상황</label>
                <select
                  className={s.select}
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                >
                  {AGE_GROUPS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className={s.helpText}>
              💡 권장 저축률: <strong className={s.cellAccent}>{ageMeta.rateMin}~{ageMeta.rateMax}%</strong> — {ageMeta.desc}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>월 수입 (만원)</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>월 실수령액</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  min={0} max={5000} step={10}
                />
                <p className={s.helpText} style={{ whiteSpace: 'nowrap' }}>
                  ▶ <Link href="/tools/finance/salary" style={{ color: 'var(--accent)' }}>연봉 실수령액 계산기</Link>
                </p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>부수입 (임대·배당·부업)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={extraIncome}
                  onChange={(e) => setExtraIncome(e.target.value)}
                  min={0} max={5000} step={5}
                />
              </div>
            </div>
          </div>

          {/* 고정비 */}
          <div className={s.card}>
            <span className={s.cardLabel}>고정비 (필수 — 조절 어려움)</span>
            <div className={s.expenseGrid}>
              {FIXED_ITEMS.map((e) => (
                <div key={e.id} className={s.expenseItem}>
                  <label className={s.expenseLabel}>
                    {e.emoji} <strong>{e.label}</strong>
                    <span className={s.expenseDesc}>{e.desc}</span>
                  </label>
                  <input
                    type="number" inputMode="decimal"
                    className={s.input}
                    value={expenses[e.id]}
                    onChange={(ev) => updateExpense(e.id, ev.target.value)}
                    min={0} max={1000} step={1}
                  />
                </div>
              ))}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              고정비 합계: <strong className={s.cellAccent}>{fmt(totalFixed)} 만원</strong>
            </p>
          </div>

          {/* 변동비 */}
          <div className={s.card}>
            <span className={s.cardLabel}>변동비 (조절 가능)</span>
            <div className={s.expenseGrid}>
              {VAR_ITEMS.map((e) => (
                <div key={e.id} className={s.expenseItem}>
                  <label className={s.expenseLabel}>
                    {e.emoji} <strong>{e.label}</strong>
                    <span className={s.expenseDesc}>{e.desc}</span>
                  </label>
                  <input
                    type="number" inputMode="decimal"
                    className={s.input}
                    value={expenses[e.id]}
                    onChange={(ev) => updateExpense(e.id, ev.target.value)}
                    min={0} max={500} step={1}
                  />
                </div>
              ))}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              변동비 합계: <strong className={s.cellAccent}>{fmt(totalVar)} 만원</strong>
            </p>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{isDeficit ? '월 수지 진단 (적자)' : '저축 가능액 진단'}</p>
            <p className={s.heroValue} style={{ color: isDeficit ? '#DC2626' : grade.color }}>
              {isDeficit ? '⚠️' : grade.emoji} <strong>{isDeficit ? `적자 ${fmtMan(Math.abs(savings))}` : fmtMan(savings)}</strong>
            </p>
            <p className={s.heroSub}>
              저축률 <strong style={{ color: isDeficit ? '#DC2626' : grade.color }}>{savingsRate.toFixed(1)}%</strong>
              {' · '}등급 <strong style={{ color: grade.color }}>{grade.grade} ({grade.label})</strong>
            </p>
            {isDeficit && (
              <p className={s.heroSub} style={{ color: '#DC2626', fontWeight: 700, marginTop: 6 }}>
                지출이 수입을 {fmtMan(Math.abs(savings))} 초과합니다 — 고정비·변동비를 우선 점검하세요.
              </p>
            )}

            {/* SVG 게이지 */}
            <svg viewBox="0 0 420 60" width="100%" style={{ marginTop: 14, maxWidth: 480 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DB2777" />
                  <stop offset="20%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#0891B2" />
                  <stop offset="80%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
              <rect x={0} y={20} width={420} height={20} rx={5} fill="var(--bg3)" />
              <rect x={0} y={20} width={Math.max(0, Math.min((savingsRate / 50) * 420, 420))} height={20} rx={5} fill="url(#rateGrad)" />
              {/* 권장 라인 */}
              <line x1={(recoMid / 50) * 420} y1={12} x2={(recoMid / 50) * 420} y2={48} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3,2" />
              <text x={(recoMid / 50) * 420} y={9} fill="var(--accent)" fontSize="9" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>권장 {recoMid}%</text>
              {[0, 10, 20, 30, 40, 50].map((v) => (
                <text key={v} x={(v / 50) * 420} y={56} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>{v}%</text>
              ))}
            </svg>
          </div>

          {/* 진단 카드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>진단 상세</span>
            <table className={s.detailTable}>
              <tbody>
                <tr><td>총 수입</td><td className={s.cellMono}>{fmtMan(totalIncome)}</td></tr>
                <tr><td>고정비</td><td className={s.cellMono}>{fmtMan(totalFixed)}</td></tr>
                <tr><td>변동비</td><td className={s.cellMono}>{fmtMan(totalVar)}</td></tr>
                <tr><td>총 지출</td><td className={s.cellMono}>{fmtMan(totalExpense)}</td></tr>
                <tr><td>{isDeficit ? '월 적자' : '저축액'}</td><td className={s.cellMono} style={{ color: isDeficit ? '#DC2626' : 'var(--accent)', fontWeight: 700 }}>{fmtMan(savings)}</td></tr>
                <tr><td>저축률</td><td className={`${s.cellMono}`} style={{ color: isDeficit ? '#DC2626' : grade.color }}>{savingsRate.toFixed(1)}%</td></tr>
                <tr className={s.cellSubtitle}><td colSpan={2}>비교</td></tr>
                <tr><td>평균 지출 ({HOUSEHOLD_AVG_EXPENSE[household].label})</td><td className={s.cellMono}>{avgExp} 만원</td></tr>
                <tr><td>본인 vs 평균</td><td className={s.cellMono} style={{ color: expVsAvg > 0 ? '#DB2777' : 'var(--accent)' }}>{expVsAvg > 0 ? '+' : ''}{fmt(expVsAvg)} 만원</td></tr>
                <tr><td>권장 저축률 ({ageMeta.label.split(' ')[0]})</td><td className={s.cellMono}>{ageMeta.rateMin}~{ageMeta.rateMax}%</td></tr>
                <tr><td>본인 vs 권장</td><td className={s.cellMono} style={{ color: savingsRate >= recoMid ? 'var(--accent)' : '#D97706' }}>{(savingsRate - recoMid > 0 ? '+' : '')}{(savingsRate - recoMid).toFixed(1)}%p</td></tr>
              </tbody>
            </table>
            <div className={s.tipBox}>
              💬 <strong>{grade.grade}등급 · {grade.label}</strong> — {grade.desc}
            </div>
          </div>

          {/* 변동비 절감 시뮬 */}
          <div className={s.card}>
            <span className={s.cardLabel}>변동비 절감 시뮬레이션</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>외식·카페 지출 절감 (%)</label>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={eatoutCut}
                onChange={(e) => setEatoutCut(e.target.value)}
                className={s.slider}
                aria-label="외식·카페 지출 절감 비율"
                aria-valuetext={`${eatoutCutPct}% 절감`}
              />
              <div className={s.helpText}>
                현재 외식 <strong>{fmt(eatoutCurr)} 만원</strong>에서 <strong className={s.cellAccent}>{eatoutCutPct}% 절감</strong>{' '}
                = 월 <strong className={s.cellAccent}>+{fmt(eatoutSaving)} 만원</strong> 추가 저축
                {' · '}연 <strong className={s.cellAccent}>+{fmt(eatoutSaving * 12)} 만원</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 6 항아리 ════════ */}
      {tab === 'jars' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🏺 T. Harv Eker의 6 항아리(JARS) 모델</p>
            <p className={s.heroValue}>
              월 수입 <strong>{fmtMan(totalIncome)}</strong> 분배
            </p>
            <p className={s.heroSub}>권장 비율: 생활 55 · 교육 10 · 놀이 10 · 저축 10 · 투자 10 · 기부 5</p>
          </div>

          {/* SVG 도넛 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>권장 vs 본인 비교</span>
            <div className={s.donutRow}>
              {/* 권장 도넛 */}
              <div className={s.donutBlock}>
                <p className={s.donutTitle}>권장 (Eker)</p>
                <DonutChart data={JARS.map((j) => ({ id: j.id, value: j.pct, color: j.color, label: j.shortLabel }))} />
              </div>
              {/* 본인 도넛 */}
              <div className={s.donutBlock}>
                <p className={s.donutTitle}>본인 입력 (합계 {jarTotal.toFixed(0)}%)</p>
                <DonutChart data={JARS.map((j) => ({ id: j.id, value: parseFloat(jarUser[j.id]) || 0, color: j.color, label: j.shortLabel }))} />
              </div>
            </div>
            {jarTotal !== 100 && (
              <p className={s.helpText} style={{ color: '#D97706' }}>
                ⚠️ 본인 입력 합계가 {jarTotal.toFixed(0)}% — 100%가 되도록 조정해 주세요.
              </p>
            )}
          </div>

          {/* 항아리별 입력 */}
          <div className={s.card}>
            <span className={s.cardLabel}>본인 분배 입력 (%)</span>
            <div className={s.jarGrid}>
              {JARS.map((j) => {
                const userPct = parseFloat(jarUser[j.id]) || 0
                const userMan = (totalIncome * userPct) / 100
                const recoMan = (totalIncome * j.pct) / 100
                const diff = userPct - j.pct
                return (
                  <div key={j.id} className={s.jarCard} style={{ borderLeftColor: j.color }}>
                    <p className={s.jarHead}>
                      <span className={s.jarEmoji}>{j.emoji}</span>
                      <strong>{j.label}</strong>
                    </p>
                    <p className={s.jarDesc}>{j.desc}</p>
                    <div className={s.jarRow}>
                      <span className={s.jarRecoLabel}>권장 {j.pct}%</span>
                      <span className={s.jarRecoMan}>= {fmt(recoMan)}만원</span>
                    </div>
                    <div className={s.jarInput}>
                      <input
                        type="number" inputMode="decimal"
                        className={s.input}
                        value={jarUser[j.id]}
                        onChange={(e) => updateJar(j.id, e.target.value)}
                        min={0} max={100} step={1}
                      />
                      <span className={s.jarUserMan}>= {fmt(userMan)}만원</span>
                    </div>
                    <p className={s.jarDiff} style={{ color: Math.abs(diff) < 3 ? 'var(--accent)' : diff > 0 ? '#EA580C' : '#D97706' }}>
                      {diff > 0 ? `▲ +${diff.toFixed(0)}%p (과다)` : diff < 0 ? `▼ ${diff.toFixed(0)}%p (부족)` : '✓ 권장 일치'}
                    </p>
                    <p className={s.jarExamples}>예: {j.examples}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🏺 6 항아리 모델 사용 팁</strong>
            <p>
              • <strong>입문자</strong>: 권장 비율로 시작 → 3개월 운영 후 조정<br />
              • <strong>한국 상황 보정</strong>: 월세·통신비 비싼 한국은 NEC 60~65%, 기부 0~3%로 현실적 조정<br />
              • <strong>저축 + 장기투자 = 20%</strong>: 이 비율을 유지하는 게 부의 핵심<br />
              • 항아리는 <strong>별도 계좌·통장</strong>으로 관리하면 가장 효과적
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 목표 역산 ════════ */}
      {tab === 'goal' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>인기 목표 프리셋</span>
            <div className={s.pillRow}>
              {GOAL_PRESETS.map((g) => (
                <button
                  key={g.id}
                  className={s.pill}
                  onClick={() => {
                    setGoalAmount(String(g.amountMan))
                    setGoalYears(String(g.yearsDefault))
                  }}
                  type="button"
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>목표 입력</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>목표 금액 (만원)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  min={100} max={1000000} step={100}
                />
                <p className={s.helpText}>= {fmtMan(goalMan)}</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>목표 기간 (년)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={goalYears}
                  onChange={(e) => setGoalYears(e.target.value)}
                  min={1} max={50} step={1}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[3, 5, 7, 10, 20].map((y) => (
                    <button key={y} className={s.pill} aria-pressed={goalYears === String(y)} onClick={() => setGoalYears(String(y))} type="button">
                      {y}년
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>예상 연 수익률 (%)</label>
              <input
                type="number" inputMode="decimal"
                className={s.input}
                value={goalRate}
                onChange={(e) => setGoalRate(e.target.value)}
                min={0} max={20} step={0.5}
              />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {[
                  { v: 3, l: '예금 3%' },
                  { v: 4, l: '채권 4%' },
                  { v: 6, l: '적립식 6%' },
                  { v: 8, l: '주식 8%' },
                ].map((r) => (
                  <button key={r.v} className={s.pill} aria-pressed={goalRate === String(r.v)} onClick={() => setGoalRate(String(r.v))} type="button">
                    {r.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{fmtMan(goalMan)} · {yearsN}년 · 연 {rateN}%</p>
            <p className={s.heroValue}>
              월 <strong>{fmt(monthlyNeeded, 1)} 만원</strong>
            </p>
            <p className={s.heroSub}>
              총 적립 {fmtMan(monthlyNeeded * yearsN * 12)} + 이자 {fmtMan(goalMan - monthlyNeeded * yearsN * 12)}
              {' · '}현재 저축액 대비 <strong style={{ color: monthlyNeeded <= savings ? 'var(--accent)' : '#DB2777' }}>
                {monthlyNeeded <= savings ? '✅ 달성 가능' : `❌ ${fmt(monthlyNeeded - savings, 1)} 만원 부족`}
              </strong>
            </p>
          </div>

          <p className={s.helpText} style={{ marginTop: 2 }}>
            ※ 세전·복리 가정 — 이자소득세(15.4%)·물가상승률은 미반영. 실제 수령액은 이보다 낮을 수 있습니다.
          </p>

          {/* 연도별 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>연도별 누적 (적립 + 이자)</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th>연차</th>
                    <th>누적 적립</th>
                    <th>누적 잔액 (이자 포함)</th>
                    <th>이자 발생</th>
                  </tr>
                </thead>
                <tbody>
                  {growth.map((g, i) => {
                    const totalDeposit = monthlyNeeded * g.month
                    const interest = g.balance - totalDeposit
                    return (
                      <tr key={i}>
                        <td className={s.cellMono}>{g.month / 12}년</td>
                        <td className={s.cellMono}>{fmtMan(totalDeposit)}</td>
                        <td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(g.balance)}</td>
                        <td className={s.cellMono}>{fmtMan(interest)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Link href="/tools/finance/compound" className={s.crossLink}>
            📈 복리 계산기 → 일시금·증액·시나리오 비교까지 자세히
          </Link>
        </>
      )}

      {/* ════════ 탭 4: 절세 정책 ════════ */}
      {tab === 'tax' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>한국 절세 상품 5종 — {ageMeta.label.split(' ')[0]} 적합도</span>
            <div className={s.taxGrid}>
              {TAX_PRODUCTS.map((p) => {
                const isYouth = p.id === 'youth_jump'
                const youthConditional = isYouth && (ageGroup === '30s_single' || ageGroup === '30s_married')
                const youthIneligible = isYouth && (ageGroup === '40s' || ageGroup === '50s')
                return (
                  <div key={p.id} className={s.taxCard} style={{ borderTopColor: p.color }}>
                    <p className={s.taxHead}>
                      <span className={s.taxEmoji}>{p.emoji}</span>
                      <strong>{p.label}</strong>
                    </p>
                    <p className={s.taxQualify}><strong>자격</strong>: {p.qualify}</p>
                    <div className={s.taxSpecs}>
                      <span>월 {p.monthlyMaxMan}만원</span>
                      <span>연 {p.yearlyMaxMan}만원</span>
                      <span>{p.durationYears}년</span>
                    </div>
                    <p className={s.taxBenefit}>💰 {p.taxBenefitDesc}</p>
                    <div className={s.taxProsCons}>
                      <div>
                        <p className={s.taxProsLabel}>✅ 장점</p>
                        <ul>
                          {p.pros.map((pr, i) => <li key={i}>{pr}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className={s.taxConsLabel}>⚠️ 단점</p>
                        <ul>
                          {p.cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                    <p className={s.taxRecommend}>
                      <strong>추천 대상</strong>: {p.recommendFor}
                    </p>
                    {youthConditional && (
                      <p className={s.taxWarn}>⚠️ 청년도약계좌는 만 19~34세 — 30대는 만 34세 이하만 신규 가입 가능 (35세부터 제외)</p>
                    )}
                    {youthIneligible && (
                      <p className={s.taxWarn}>⚠️ 청년도약계좌는 만 19~34세만 가입 가능 — 본인 연령대 부적합</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>절세 상품 비교 매트릭스</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th>상품</th>
                    <th>연 한도</th>
                    <th>기간</th>
                    <th>최대 절세 효과</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>🌱 청년도약</td><td className={s.cellMono}>840만원</td><td className={s.cellMono}>5년</td><td className={`${s.cellMono} ${s.cellAccent}`}>월 최대 3.3만원 기여금 + 비과세</td></tr>
                  <tr><td>💼 ISA</td><td className={s.cellMono}>2,000만원</td><td className={s.cellMono}>3년+</td><td className={`${s.cellMono} ${s.cellAccent}`}>200만원 비과세</td></tr>
                  <tr><td>🏦 연금저축</td><td className={s.cellMono}>600만원</td><td className={s.cellMono}>~만 55세</td><td className={`${s.cellMono} ${s.cellAccent}`}>연 99만원 환급</td></tr>
                  <tr><td>📊 IRP</td><td className={s.cellMono}>900만원 (저축 합산)</td><td className={s.cellMono}>~만 55세</td><td className={`${s.cellMono} ${s.cellAccent}`}>연 148만원 환급</td></tr>
                  <tr><td>🏠 주택청약</td><td className={s.cellMono}>300만원</td><td className={s.cellMono}>장기</td><td className={`${s.cellMono} ${s.cellAccent}`}>120만원 소득공제</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💡 절세 상품 우선순위 추천</strong>
            <p>
              • <strong>20~30대 청년</strong>: 청년도약계좌 → 주택청약 → ISA → 연금저축 순<br />
              • <strong>30~40대 직장인</strong>: 연금저축 600 → IRP 300 추가 (총 900) → ISA → 주택청약<br />
              • <strong>50대 은퇴 준비</strong>: 연금저축·IRP 한도 채우기 → ISA<br />
              • <strong>주의</strong>: 청년도약·연금저축은 중도해지 시 정부지원금·세제혜택 환수
            </p>
          </div>
        </>
      )}

      {/* 저장 안내 + 전체 초기화 */}
      <div className={s.card}>
        <p className={s.helpText} style={{ margin: 0 }}>
          🔒 입력값(수입·지출·가구·연령·목표·6항아리)은 <strong>이 브라우저(localStorage)에만 저장</strong>되며 서버로 전송되지 않습니다. 다른 기기·브라우저와 동기화되지 않고, 브라우저 데이터 삭제 시 사라집니다.
        </p>
        <button
          type="button"
          onClick={resetAll}
          style={{
            marginTop: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer',
          }}
        >
          🗑️ 전체 입력 초기화
        </button>
      </div>

      {/* 크로스링크 */}
      <Link href="/tools/finance/dividend" className={s.crossLink}>
        💰 월배당 목표 자산 계산기 → 은퇴 자산·배당 ETF 시뮬은 여기로
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SVG 도넛 차트 컴포넌트
   ───────────────────────────────────────────── */
interface DonutDatum { id: string; value: number; color: string; label: string }

function DonutChart({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total <= 0) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>입력값 없음</p>

  const cx = 100, cy = 100, rOuter = 80, rInner = 50

  function describeArc(startAngle: number, endAngle: number) {
    const x1 = cx + rOuter * Math.cos(startAngle)
    const y1 = cy + rOuter * Math.sin(startAngle)
    const x2 = cx + rOuter * Math.cos(endAngle)
    const y2 = cy + rOuter * Math.sin(endAngle)
    const x3 = cx + rInner * Math.cos(endAngle)
    const y3 = cy + rInner * Math.sin(endAngle)
    const x4 = cx + rInner * Math.cos(startAngle)
    const y4 = cy + rInner * Math.sin(startAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`
  }

  /* 누적값 사전 계산 */
  const slices = data.reduce<{ datum: DonutDatum; cumStart: number }[]>(
    (acc, d) => {
      const last = acc.length > 0 ? acc[acc.length - 1] : null
      const cumStart = last ? last.cumStart + last.datum.value : 0
      acc.push({ datum: d, cumStart })
      return acc
    },
    [],
  )

  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 200 }}>
      {slices.map(({ datum: d, cumStart }) => {
        const startAngle = (cumStart / total) * Math.PI * 2 - Math.PI / 2
        const endAngle = ((cumStart + d.value) / total) * Math.PI * 2 - Math.PI / 2
        const path = describeArc(startAngle, endAngle)
        const midAngle = (startAngle + endAngle) / 2
        const labelR = (rOuter + rInner) / 2
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)
        return (
          <g key={d.id}>
            <path d={path} fill={d.color} opacity={0.85} />
            {d.value >= 6 && (
              <text x={lx} y={ly} fill="#0D0D0D" fontSize="11" textAnchor="middle" dominantBaseline="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="800">
                {Math.round(d.value)}%
              </text>
            )}
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={rInner - 2} fill="var(--bg2)" />
      <text x={cx} y={cy - 4} fill="var(--text)" fontSize="11" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>합계</text>
      <text x={cx} y={cy + 12} fill="var(--accent)" fontSize="14" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="800">{total.toFixed(0)}%</text>
    </svg>
  )
}
