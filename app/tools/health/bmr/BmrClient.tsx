'use client'

import Disclaimer from '@/components/Disclaimer'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import styles from './bmr.module.css'
import {
  Gender, FormulaId,
  FORMULAS, ACTIVITY_FACTORS, JOB_ACTIVITY_LEVELS, EXERCISE_INTENSITIES,
  GOAL_PRESETS, FOOD_REFERENCES,
  calcBMR, calcAllFormulas, calcDetailedTDEE, calcAllGoals,
  calcWeeklyPlan, calcMacros, checkSafety,
  estimateActivityFactor, QuizAnswer,
  compareWithWatch, SmartwatchInput,
  loadBmrHistory, saveBmrHistory, newBmrId, BmrRecord,
} from './bmrUtils'

type Tab = 'bmr' | 'activity' | 'split' | 'budget' | 'watch'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'bmr',      name: 'BMR·TDEE',   icon: '🔥' },
  { id: 'activity', name: '활동 정밀화', icon: '🎯' },
  { id: 'split',    name: '운동/휴식일', icon: '🍽️' },
  { id: 'budget',   name: '칼로리 예산', icon: '💰' },
  { id: 'watch',    name: '스마트워치',  icon: '⌚' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  bmr:      styles.tabActive,
  activity: styles.tabActiveActivity,
  split:    styles.tabActiveSplit,
  budget:   styles.tabActiveBudget,
  watch:    styles.tabActiveWatch,
}

const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')

export default function BmrClient() {
  const [tab, setTab] = useState<Tab>('bmr')

  /* ── 공통 입력 ── */
  const [gender, setGender] = useState<Gender>('male')
  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('65')
  const [age, setAge]       = useState('30')
  const [bodyFat, setBodyFat] = useState('')
  const [leanMass, setLeanMass] = useState('')

  const [formula, setFormula] = useState<FormulaId>('mifflin')
  const [actIdx, setActIdx]   = useState(2)

  const heightN = parseFloat(height)
  const weightN = parseFloat(weight)
  const ageN    = parseInt(age, 10)
  const bodyFatN = parseFloat(bodyFat) || undefined
  const leanMassN = parseFloat(leanMass) || undefined

  const inputValid = (
    Number.isFinite(heightN) && heightN >= 100 && heightN <= 250
    && Number.isFinite(weightN) && weightN >= 20 && weightN <= 300
    && Number.isFinite(ageN) && ageN >= 10 && ageN <= 100
  )

  const formulaInput = useMemo(() => ({
    gender, height: heightN, weight: weightN, age: ageN,
    bodyFat: bodyFatN, leanMass: leanMassN,
  }), [gender, heightN, weightN, ageN, bodyFatN, leanMassN])

  const bmr = useMemo(() => {
    if (!inputValid) return null
    return calcBMR(formulaInput, formula)
  }, [inputValid, formulaInput, formula])

  const allFormulas = useMemo(() => {
    if (!inputValid) return []
    return calcAllFormulas(formulaInput)
  }, [inputValid, formulaInput])

  const tdeeSimple = useMemo(() => {
    if (bmr === null) return null
    return Math.round(bmr * ACTIVITY_FACTORS[actIdx].factor)
  }, [bmr, actIdx])

  const allGoals = useMemo(() => {
    if (tdeeSimple === null) return []
    return calcAllGoals(tdeeSimple)
  }, [tdeeSimple])

  /* ─── 안전 검증 ─── */
  const dietGoal = allGoals.find(g => g.id === 'lose-fast')
  const safety = useMemo(() => {
    if (bmr === null || !dietGoal) return null
    return checkSafety(dietGoal.daily, gender, bmr, ageN)
  }, [bmr, dietGoal, gender, ageN])

  /* ─── 탭 2: 활동 정밀화 ─── */
  const [jobLevel, setJobLevel] = useState('sedentary')
  const [weeklyExercises, setWeeklyExercises] = useState(3)
  const [exerciseDuration, setExerciseDuration] = useState(60)
  const [exerciseIntensity, setExerciseIntensity] = useState('high')
  const [dailySteps, setDailySteps] = useState(5800)

  const detailed = useMemo(() => {
    if (bmr === null) return null
    return calcDetailedTDEE(bmr, {
      jobLevel, weeklyExercises, exerciseDuration, exerciseIntensity, dailySteps,
    })
  }, [bmr, jobLevel, weeklyExercises, exerciseDuration, exerciseIntensity, dailySteps])

  /* ─── 활동계수 퀴즈 ─── */
  const [quizOpen, setQuizOpen] = useState(false)
  const [quiz, setQuiz] = useState<QuizAnswer>({
    steps: 2, commute: 1, exerciseFreq: 3, exerciseDuration: 60, sittingHours: 3, weekend: 2,
  })
  const quizResult = useMemo(() => estimateActivityFactor(quiz), [quiz])

  /* ─── 탭 3: 운동일/휴식일 ─── */
  const weeklyPlan = useMemo(() => {
    if (!detailed) return null
    return calcWeeklyPlan(detailed, weeklyExercises)
  }, [detailed, weeklyExercises])

  const [splitGoalId, setSplitGoalId] = useState('lose-normal')
  const splitGoal = GOAL_PRESETS.find(g => g.id === splitGoalId)
  const splitAdjusted = useMemo(() => {
    if (!detailed || !splitGoal) return null
    const adjust = 1 + splitGoal.adjust
    return {
      restDay: Math.round(detailed.restDayTDEE * adjust),
      exerciseDay: Math.round(detailed.exerciseDayTDEE * adjust),
      avg: Math.round(detailed.avgTDEE * adjust),
    }
  }, [detailed, splitGoal])

  /* ─── 탭 4: 칼로리 예산 ─── */
  const [budgetGoalId, setBudgetGoalId] = useState('maintain')
  const budgetGoal = allGoals.find(g => g.id === budgetGoalId)

  const [macroRatio, setMacroRatio] = useState({ c: 50, p: 25, f: 25 })
  const macros = useMemo(() => {
    if (!budgetGoal) return null
    return calcMacros(budgetGoal.daily, macroRatio)
  }, [budgetGoal, macroRatio])

  /* ─── 탭 5: 스마트워치 ─── */
  const [watchInput, setWatchInput] = useState<SmartwatchInput>({
    device: 'apple', resting: 0, active: 0, period: 'week',
  })
  const watchCompare = useMemo(() => {
    if (bmr === null || tdeeSimple === null) return null
    if (!watchInput.resting && !watchInput.active) return null
    return compareWithWatch(bmr, tdeeSimple, watchInput)
  }, [bmr, tdeeSimple, watchInput])

  /* ─── 복사 / 저장 ─── */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  const [history, setHistory] = useState<BmrRecord[]>([])
  useEffect(() => { setHistory(loadBmrHistory()) }, [])

  const saveCurrent = () => {
    if (bmr === null || tdeeSimple === null) return
    const item: BmrRecord = {
      id: newBmrId(),
      date: new Date().toISOString(),
      height: heightN, weight: weightN, age: ageN,
      bmr, tdee: tdeeSimple, formula,
      ...(bodyFatN !== undefined ? { bodyFat: bodyFatN } : {}),
    }
    const next = [item, ...history].slice(0, 60)
    setHistory(next); saveBmrHistory(next)
  }
  const removeHistory = (id: string) => {
    const next = history.filter(h => h.id !== id)
    setHistory(next); saveBmrHistory(next)
  }
  const clearHistory = () => { setHistory([]); saveBmrHistory([]) }

  /* ─── 게이지 시각화 좌푯값 ─── */
  const tdeeBarSplit = bmr !== null && tdeeSimple !== null
    ? { bmrPct: (bmr / tdeeSimple) * 100, actPct: ((tdeeSimple - bmr) / tdeeSimple) * 100 }
    : null

  /* ─── 청소년 경고 ─── */
  const teenWarn = ageN < 18

  /* ──────────────── 렌더 ──────────────── */
  return (
    <div className={styles.wrap}>

      {/* 면책 */}
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량' },
          { href: '/tools/health/weightloss', label: '체중감량 계산기' }
        ]}
      >
        의학적 진단·치료 도구가 아닙니다.
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

      {/* 공통 입력 — 성별·키·체중·나이 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>성별</label>
        <div className={styles.toggleRow}>
          <button className={`${styles.toggleBtn} ${gender === 'male' ? styles.toggleActive : ''}`}
            onClick={() => setGender('male')}>♂ 남성</button>
          <button className={`${styles.toggleBtn} ${gender === 'female' ? styles.toggleActive : ''}`}
            onClick={() => setGender('female')}>♀ 여성</button>
        </div>
      </div>

      <div className={styles.fieldRow3}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>키</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="170" value={height} onChange={e => setHeight(e.target.value)} />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>체중</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="65" value={weight} onChange={e => setWeight(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>나이</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
            <span className={styles.unit}>세</span>
          </div>
        </div>
      </div>

      {teenWarn && (
        <div className={styles.criticalBox}>
          🔴 <strong>18세 미만</strong> 청소년에게 본 도구는 부적합합니다 — 성장기 영양 필요량이 성인 공식과 다릅니다.
          소아청소년과 전문의 상담을 권장합니다.
        </div>
      )}

      {/* 고급 입력 */}
      <details className={styles.advanced}>
        <summary>고급 입력 (Katch-McArdle / Cunningham 공식용)</summary>
        <div className={styles.fieldRow}>
          <div>
            <span className={styles.subLabel}>체지방률 (%)</span>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="18" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
              <span className={styles.unit}>%</span>
            </div>
          </div>
          <div>
            <span className={styles.subLabel}>제지방량 (LBM, kg)</span>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="55" value={leanMass} onChange={e => setLeanMass(e.target.value)} />
              <span className={styles.unit}>kg</span>
            </div>
          </div>
        </div>
      </details>

      {/* ────── 탭 1: BMR·TDEE ────── */}
      {tab === 'bmr' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>공식 선택</label>
            <div className={styles.optionRow4}>
              {FORMULAS.map(f => {
                const r = allFormulas.find(x => x.id === f.id)
                const disabled = r ? !r.available : false
                return (
                  <button key={f.id}
                    className={`${styles.optionBtn} ${formula === f.id ? styles.optionActive : ''}`}
                    onClick={() => setFormula(f.id)}
                    disabled={disabled}
                    style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                    title={f.desc}>
                    {f.name}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              {FORMULAS.find(f => f.id === formula)?.desc} · 정확도: {FORMULAS.find(f => f.id === formula)?.accuracy}
            </p>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>활동 수준 (단순 5단계)</label>
            <div className={styles.activityList}>
              {ACTIVITY_FACTORS.map((a, i) => (
                <button key={a.id}
                  className={`${styles.activityBtn} ${actIdx === i ? styles.activityActive : ''}`}
                  onClick={() => setActIdx(i)}>
                  <span className={styles.activityName}>
                    {a.name}<small>×{a.factor}</small>
                  </span>
                  <span className={styles.activityDesc}>{a.desc}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              💡 더 정확한 분석은 <strong style={{ color: 'var(--text)' }}>[활동 정밀화] 탭</strong>에서 직업·운동·걸음 수를 분리해 계산할 수 있습니다.
            </p>
          </div>

          {bmr !== null && tdeeSimple !== null ? (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(200,255,62,0.30)', background: 'rgba(200,255,62,0.06)' }}>
                <div className={styles.heroLabel}>BMR · 기초대사량</div>
                <div className={styles.heroNum} style={{ color: 'var(--accent)' }}>
                  {fmt(bmr)}<span className={styles.heroNumUnit}>kcal</span>
                </div>
                <div className={styles.heroSubLabel}>TDEE · 하루 총 소비</div>
                <div className={styles.heroSub2}>
                  {fmt(tdeeSimple)}<span style={{ fontSize: '0.4em', marginLeft: 6 }}>kcal</span>
                </div>
                <div className={styles.heroDesc}>
                  {FORMULAS.find(f => f.id === formula)?.name} · {ACTIVITY_FACTORS[actIdx].name} (×{ACTIVITY_FACTORS[actIdx].factor})
                </div>
                <div className={styles.heroDisclaimer}>
                  💡 BMR은 자동차 공회전, TDEE는 실제 주행 — 식단 설계는 TDEE 기준
                </div>
              </div>

              {/* BMR vs TDEE 가로 막대 */}
              {tdeeBarSplit && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>BMR vs 활동 분배</label>
                  <div className={styles.tdeeBar}>
                    <div className={styles.tdeeBarBmr} style={{ width: `${tdeeBarSplit.bmrPct}%` }}>
                      BMR {fmt(bmr)}
                    </div>
                    <div className={styles.tdeeBarActivity} style={{ width: `${tdeeBarSplit.actPct}%` }}>
                      활동 +{fmt(tdeeSimple - bmr)}
                    </div>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
                    BMR이 전체의 <strong style={{ color: 'var(--text)' }}>{Math.round(tdeeBarSplit.bmrPct)}%</strong> · 활동이 <strong style={{ color: 'var(--text)' }}>{Math.round(tdeeBarSplit.actPct)}%</strong>
                  </p>
                </div>
              )}

              {/* 4공식 비교 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>4공식 비교</label>
                <div className={styles.formulaCompare}>
                  {allFormulas.map(r => {
                    const baseline = allFormulas.find(x => x.id === 'mifflin')?.bmr ?? 0
                    const diff = r.bmr !== null && baseline > 0 ? r.bmr - baseline : 0
                    return (
                      <div key={r.id}
                        className={`${styles.formulaRow} ${formula === r.id ? styles.formulaRowActive : ''} ${!r.available ? styles.formulaUnavailable : ''}`}>
                        <span className={styles.formulaName}>
                          {r.name}
                          {!r.available && <small>· {r.reason}</small>}
                          {r.id === 'mifflin' && <small>· 기준</small>}
                        </span>
                        <span className={styles.formulaBmr}>
                          {r.bmr !== null ? `${fmt(r.bmr)} kcal` : '—'}
                        </span>
                        <span className={styles.formulaDiff}>
                          {r.id === 'mifflin' || !r.available ? '' : (diff > 0 ? `+${diff}` : `${diff}`)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                  💡 일반인은 <strong style={{ color: 'var(--text)' }}>Mifflin-St Jeor</strong>이 권장(현대 표준), 체지방률 정확하면 <strong style={{ color: 'var(--text)' }}>Katch-McArdle</strong>이 더 정확. 실제 ±10% 오차 가능합니다.
                </p>
              </div>

              {/* 목표별 칼로리 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>목표별 칼로리 (TDEE 기준)</label>
                <div className={styles.goalTable}>
                  {allGoals.map(g => {
                    const isMaintain = g.id === 'maintain'
                    return (
                      <div key={g.id}
                        className={`${styles.goalRow} ${isMaintain ? styles.goalRowMaintain : ''} ${g.warning ? styles.goalWarning : ''}`}>
                        <span className={styles.goalName}>
                          {g.warning && '⚠️ '}{g.name}
                          <small>{GOAL_PRESETS.find(p => p.id === g.id)?.desc.split('/')[0].trim()}</small>
                        </span>
                        <span className={styles.goalKcal}>{fmt(g.daily)}</span>
                        <span className={styles.goalChange}>
                          {g.weeklyChangeKg === 0 ? '유지' :
                           g.weeklyChangeKg > 0 ? `+${g.weeklyChangeKg.toFixed(2)}kg/주` :
                           `${g.weeklyChangeKg.toFixed(2)}kg/주`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 안전 경고 */}
              {safety && safety.warnings.length > 0 && (
                <div className={styles.criticalBox}>
                  <strong>⚠️ 안전 경고</strong>
                  <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                    {safety.warnings.map((w, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{w}</li>
                    ))}
                  </ul>
                  <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                    💛 체중 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong style={{ color: '#FF6B6B' }}>1577-0199</strong> · 자살예방 <strong style={{ color: '#FF6B6B' }}>1393</strong> (24시간)
                  </p>
                </div>
              )}

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`BMR ${fmt(bmr)} / TDEE ${fmt(tdeeSimple)} kcal (${FORMULAS.find(f => f.id === formula)?.name}, ${ACTIVITY_FACTORS[actIdx].name})`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => setTab('activity')}>🎯 활동 정밀화</button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 기록 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>키·체중·나이를 입력하세요</div>
              유효 범위: 키 100~250cm · 체중 20~300kg · 나이 10~100세
            </div>
          )}
        </>
      )}

      {/* ────── 탭 2: 활동 정밀화 ────── */}
      {tab === 'activity' && (
        <>
          <div className={styles.disclaimer}>
            <strong>활동 정밀화</strong> — 직업·일일 걸음·운동(횟수·시간·강도)을 분리해 더 정확한 TDEE를 계산합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>직업 활동량</label>
            <div className={styles.optionRow4}>
              {JOB_ACTIVITY_LEVELS.map(j => (
                <button key={j.id}
                  className={`${styles.optionBtn} ${jobLevel === j.id ? styles.optionActive : ''}`}
                  onClick={() => setJobLevel(j.id)} title={j.desc}>
                  {j.name}
                  <br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>{j.desc}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>일일 걸음 — {fmt(dailySteps)}보 <span className={styles.cardLabelHint}>한국 성인 평균 약 5,800보</span></label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="20000" step="100"
                value={dailySteps} onChange={e => setDailySteps(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{fmt(dailySteps)}</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>주간 운동 횟수 — {weeklyExercises}회</label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="7" step="1"
                value={weeklyExercises} onChange={e => setWeeklyExercises(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{weeklyExercises}</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>1회 운동 시간 — {exerciseDuration}분</label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="180" step="5"
                value={exerciseDuration} onChange={e => setExerciseDuration(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{exerciseDuration}분</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>운동 강도</label>
            <div className={styles.optionRow4}>
              {EXERCISE_INTENSITIES.map(e => (
                <button key={e.id}
                  className={`${styles.optionBtn} ${exerciseIntensity === e.id ? styles.optionActive : ''}`}
                  onClick={() => setExerciseIntensity(e.id)}>
                  {e.name}
                  <br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>{e.kcalPerHour}kcal/h</small>
                </button>
              ))}
            </div>
          </div>

          {detailed && (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(255,215,0,0.30)', background: 'rgba(255,215,0,0.06)' }}>
                <div className={styles.heroLabel}>주간 평균 TDEE</div>
                <div className={styles.heroNum} style={{ color: '#FFD700' }}>
                  {fmt(detailed.avgTDEE)}<span className={styles.heroNumUnit}>kcal</span>
                </div>
                <div className={styles.heroDesc}>
                  휴식일 {fmt(detailed.restDayTDEE)}kcal · 운동일 {fmt(detailed.exerciseDayTDEE)}kcal
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>상세 분석</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}><span>BMR (기본 대사)</span><span>{fmt(detailed.bmr)} kcal</span></div>
                  <div className={styles.detailRow}>
                    <span>직업 활동 (×{JOB_ACTIVITY_LEVELS.find(j => j.id === jobLevel)?.factor})</span>
                    <span>+{fmt(detailed.baseDailyTDEE - detailed.bmr)} kcal</span>
                  </div>
                  <div className={styles.detailRow}><span>일일 걸음 보너스</span><span>+{fmt(detailed.dailyStepsBonus)} kcal</span></div>
                  <div className={styles.detailRow}>
                    <span>운동 ({weeklyExercises}회 × {exerciseDuration}분)</span>
                    <span>주 {fmt(detailed.weeklyExerciseKcal)} kcal</span>
                  </div>
                  <div className={styles.detailRow}><span>운동 일일 평균</span><span>+{fmt(detailed.dailyExerciseAvg)} kcal</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}>
                    <span>주간 평균 TDEE</span><span>{fmt(detailed.avgTDEE)} kcal</span>
                  </div>
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`TDEE 평균 ${fmt(detailed.avgTDEE)} / 휴식 ${fmt(detailed.restDayTDEE)} / 운동 ${fmt(detailed.exerciseDayTDEE)} kcal`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => setTab('split')}>🍽️ 운동/휴식일 분리</button>
                <button className={styles.copyBtn} onClick={() => setQuizOpen(!quizOpen)}>
                  ❓ 활동계수 퀴즈
                </button>
              </div>
            </>
          )}

          {quizOpen && (
            <div className={styles.quizCard}>
              <div className={styles.quizTitle}>🎯 활동계수 6문항 퀴즈</div>

              <div className={styles.quizQuestion}>1. 하루 평균 걸음 수는?</div>
              <div className={styles.quizAnswers}>
                {[
                  { v: 1, label: '5,000보 미만' },
                  { v: 2, label: '5,000~8,000' },
                  { v: 3, label: '8,000~12,000' },
                  { v: 4, label: '12,000보 이상' },
                ].map(o => (
                  <button key={o.v}
                    className={`${styles.optionBtn} ${quiz.steps === o.v ? styles.optionActive : ''}`}
                    onClick={() => setQuiz({ ...quiz, steps: o.v })}>{o.label}</button>
                ))}
              </div>

              <div className={styles.quizQuestion}>2. 출퇴근/이동 방식은?</div>
              <div className={styles.quizAnswers}>
                {[
                  { v: 1, label: '🚗 자동차/대중교통' },
                  { v: 2, label: '🚶 도보' },
                  { v: 3, label: '🚴 자전거' },
                ].map(o => (
                  <button key={o.v}
                    className={`${styles.optionBtn} ${quiz.commute === o.v ? styles.optionActive : ''}`}
                    onClick={() => setQuiz({ ...quiz, commute: o.v })}>{o.label}</button>
                ))}
              </div>

              <div className={styles.quizQuestion}>3. 주 운동 횟수: {quiz.exerciseFreq}회</div>
              <input className={styles.slider} type="range" min="0" max="7" step="1"
                value={quiz.exerciseFreq}
                onChange={e => setQuiz({ ...quiz, exerciseFreq: parseInt(e.target.value, 10) })} />

              <div className={styles.quizQuestion} style={{ marginTop: 10 }}>4. 1회 운동 시간: {quiz.exerciseDuration}분</div>
              <input className={styles.slider} type="range" min="0" max="120" step="5"
                value={quiz.exerciseDuration}
                onChange={e => setQuiz({ ...quiz, exerciseDuration: parseInt(e.target.value, 10) })} />

              <div className={styles.quizQuestion} style={{ marginTop: 10 }}>5. 직업상 앉아 있는 시간?</div>
              <div className={styles.quizAnswers}>
                {[
                  { v: 1, label: '4시간 미만' },
                  { v: 2, label: '4~8시간' },
                  { v: 3, label: '8~12시간' },
                  { v: 4, label: '12시간 이상' },
                ].map(o => (
                  <button key={o.v}
                    className={`${styles.optionBtn} ${quiz.sittingHours === o.v ? styles.optionActive : ''}`}
                    onClick={() => setQuiz({ ...quiz, sittingHours: o.v })}>{o.label}</button>
                ))}
              </div>

              <div className={styles.quizQuestion}>6. 주말 활동량?</div>
              <div className={styles.quizAnswers}>
                {[
                  { v: 1, label: '😴 휴식 위주' },
                  { v: 2, label: '🚶 외출/쇼핑' },
                  { v: 3, label: '🏃 운동/등산' },
                ].map(o => (
                  <button key={o.v}
                    className={`${styles.optionBtn} ${quiz.weekend === o.v ? styles.optionActive : ''}`}
                    onClick={() => setQuiz({ ...quiz, weekend: o.v })}>{o.label}</button>
                ))}
              </div>

              <div className={styles.detailRow} style={{ marginTop: 12, background: 'rgba(255,215,0,0.10)', borderColor: '#FFD700' }}>
                <span>추정 활동계수</span>
                <span style={{ color: '#FFD700' }}>×{quizResult.factor} ({quizResult.description})</span>
              </div>
              {bmr !== null && (
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                  → BMR {fmt(bmr)} × {quizResult.factor} = <strong style={{ color: 'var(--accent)' }}>{fmt(bmr * quizResult.factor)}kcal</strong> (퀴즈 기반 TDEE)
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ────── 탭 3: 운동일/휴식일 ────── */}
      {tab === 'split' && (
        <>
          <div className={styles.disclaimer}>
            <strong>운동일/휴식일 분리</strong> — 단순 평균 TDEE는 운동일 영양 부족·휴식일 잉여를 만듭니다. 요일별로 다르게 먹으면 회복·근성장·만족감 모두 향상됩니다.
          </div>

          {!detailed ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>먼저 [활동 정밀화] 탭에서 운동량을 설정하세요</div>
              주간 운동 횟수·시간·강도가 필요합니다
            </div>
          ) : (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>목표 적용</label>
                <div className={styles.optionRow4}>
                  {GOAL_PRESETS.filter(g =>
                    ['lose-slow', 'lose-normal', 'maintain', 'bulk-slow'].includes(g.id),
                  ).map(g => (
                    <button key={g.id}
                      className={`${styles.optionBtn} ${splitGoalId === g.id ? styles.optionActive : ''}`}
                      onClick={() => setSplitGoalId(g.id)}>{g.name}</button>
                  ))}
                </div>
              </div>

              {weeklyPlan && splitAdjusted && (
                <>
                  <div className={styles.hero}
                    style={{ borderColor: 'rgba(255,140,62,0.30)', background: 'rgba(255,140,62,0.06)' }}>
                    <div className={styles.heroLabel}>주간 칼로리 플랜</div>
                    <div className={styles.heroNum} style={{ color: '#FF8C3E' }}>
                      {fmt(splitAdjusted.avg)}<span className={styles.heroNumUnit}>kcal/일</span>
                    </div>
                    <div className={styles.heroDesc}>
                      휴식일 <strong style={{ color: '#3EC8FF' }}>{fmt(splitAdjusted.restDay)}</strong> · 운동일 <strong style={{ color: '#FF8C3E' }}>{fmt(splitAdjusted.exerciseDay)}</strong> kcal
                      <br />주간 합계 약 {fmt(splitAdjusted.restDay * weeklyPlan.restDays + splitAdjusted.exerciseDay * weeklyPlan.exerciseDays)} kcal
                    </div>
                  </div>

                  <div className={styles.card}>
                    <label className={styles.cardLabel}>요일별 추천 (운동 {weeklyPlan.exerciseDays}일 / 휴식 {weeklyPlan.restDays}일)</label>
                    <div className={styles.weekTable}>
                      {(() => {
                        const days = ['월', '화', '수', '목', '금', '토', '일']
                        const exerciseDayIndices = new Set<number>()
                        // 균등 분배: 7일에 weeklyExercises 운동일 배치
                        const stride = weeklyPlan.exerciseDays > 0 ? 7 / weeklyPlan.exerciseDays : 0
                        for (let i = 0; i < weeklyPlan.exerciseDays; i++) {
                          exerciseDayIndices.add(Math.round(i * stride))
                        }
                        return days.map((d, i) => {
                          const isExercise = exerciseDayIndices.has(i)
                          return (
                            <div key={i}
                              className={`${styles.dayRow} ${isExercise ? styles.dayRowExer : styles.dayRowRest}`}>
                              <span className={styles.dayName}>{d}</span>
                              <span className={styles.dayActivity}>
                                {isExercise ? `🏃 운동 (${exerciseDuration}분 × ${EXERCISE_INTENSITIES.find(e => e.id === exerciseIntensity)?.name})` : '😌 휴식'}
                              </span>
                              <span className={styles.dayTdee}>
                                TDEE {fmt(isExercise ? detailed.exerciseDayTDEE : detailed.restDayTDEE)}
                              </span>
                              <span className={styles.dayTarget}>
                                {fmt(isExercise ? splitAdjusted.exerciseDay : splitAdjusted.restDay)} kcal
                              </span>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  <div className={styles.warnBox}>
                    💡 <strong>핵심</strong> — 운동일에 더 먹고, 휴식일에 적게 먹기. 운동 회복·근손실 방지·식단 만족감 모두 향상됩니다. 단순 주간 평균만 쓰면 운동일 영양 부족·휴식일 잉여 발생.
                  </div>

                  <div className={styles.resultActions}>
                    <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                      onClick={() => copy(`주간 플랜 (${splitGoal?.name}) — 휴식 ${fmt(splitAdjusted.restDay)} / 운동 ${fmt(splitAdjusted.exerciseDay)} / 평균 ${fmt(splitAdjusted.avg)} kcal`)}>
                      {copied ? '✓ 복사됨' : '📋 복사'}
                    </button>
                    <button className={styles.copyBtn} onClick={() => setTab('budget')}>💰 칼로리 예산</button>
                    <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ────── 탭 4: 칼로리 예산 ────── */}
      {tab === 'budget' && (
        <>
          <div className={styles.disclaimer}>
            <strong>칼로리 = 돈</strong> — BMR은 고정 지출(월세), 활동은 변동 지출, 운동은 추가 지출, 감량 목표는 저축. 직관적으로 식단을 설계할 수 있습니다.
          </div>

          {!bmr || !tdeeSimple || !budgetGoal ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>BMR·TDEE 계산이 먼저 필요합니다</div>
              상단 입력값을 확인해주세요
            </div>
          ) : (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>목표 선택</label>
                <div className={styles.optionRow4}>
                  {allGoals.filter(g =>
                    ['lose-normal', 'lose-slow', 'maintain', 'bulk-slow'].includes(g.id),
                  ).map(g => (
                    <button key={g.id}
                      className={`${styles.optionBtn} ${budgetGoalId === g.id ? styles.optionActive : ''}`}
                      onClick={() => setBudgetGoalId(g.id)}>{g.name}</button>
                  ))}
                </div>
              </div>

              <div className={styles.hero}
                style={{ borderColor: 'rgba(62,200,255,0.30)', background: 'rgba(62,200,255,0.06)' }}>
                <div className={styles.heroLabel}>오늘의 칼로리 예산</div>
                <div className={styles.heroNum} style={{ color: '#3EC8FF' }}>
                  {fmt(budgetGoal.daily)}<span className={styles.heroNumUnit}>kcal</span>
                </div>
                <div className={styles.heroDesc}>{budgetGoal.name} 목표 적용</div>
              </div>

              {/* 칼로리 분포 막대 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>칼로리 구성</label>
                {(() => {
                  const activity = tdeeSimple - bmr
                  const adjustment = budgetGoal.daily - tdeeSimple
                  const total = bmr + activity + Math.max(0, adjustment) + Math.abs(Math.min(0, adjustment))
                  const bmrPct = (bmr / total) * 100
                  const actPct = (activity / total) * 100
                  const adjPct = (Math.abs(adjustment) / total) * 100
                  const isDeficit = adjustment < 0
                  return (
                    <>
                      <div className={styles.budgetBar}>
                        <div className={styles.budgetSeg} style={{ width: `${bmrPct}%`, background: '#3EC8FF' }}>
                          <span>BMR</span><b>{fmt(bmr)}</b>
                        </div>
                        <div className={styles.budgetSeg} style={{ width: `${actPct}%`, background: '#FFD700' }}>
                          <span>활동</span><b>+{fmt(activity)}</b>
                        </div>
                        {adjustment !== 0 && (
                          <div className={styles.budgetSeg} style={{
                            width: `${adjPct}%`,
                            background: isDeficit ? '#FF6B6B' : '#3EFF9B',
                          }}>
                            <span>{isDeficit ? '감량' : '증량'}</span>
                            <b>{isDeficit ? '−' : '+'}{fmt(Math.abs(adjustment))}</b>
                          </div>
                        )}
                      </div>
                      <div className={styles.budgetLegend}>
                        <div className={styles.budgetLegendItem}>
                          <span className={styles.budgetSwatch} style={{ background: '#3EC8FF' }} />
                          기본 생명유지 (BMR) <b>{fmt(bmr)}</b>
                        </div>
                        <div className={styles.budgetLegendItem}>
                          <span className={styles.budgetSwatch} style={{ background: '#FFD700' }} />
                          일상 활동·운동 <b>+{fmt(activity)}</b>
                        </div>
                        {adjustment !== 0 && (
                          <div className={styles.budgetLegendItem}>
                            <span className={styles.budgetSwatch} style={{
                              background: isDeficit ? '#FF6B6B' : '#3EFF9B',
                            }} />
                            {isDeficit ? '감량 차감' : '증량 추가'} <b>{isDeficit ? '−' : '+'}{fmt(Math.abs(adjustment))}</b>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* 매크로 분배 */}
              {macros && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>
                    매크로 분배 — 탄 {macroRatio.c}% / 단 {macroRatio.p}% / 지 {macroRatio.f}%
                  </label>
                  <div className={styles.optionRow}>
                    <button className={`${styles.optionBtn} ${macroRatio.c === 50 ? styles.optionActive : ''}`}
                      onClick={() => setMacroRatio({ c: 50, p: 25, f: 25 })}>균형 (50/25/25)</button>
                    <button className={`${styles.optionBtn} ${macroRatio.c === 40 ? styles.optionActive : ''}`}
                      onClick={() => setMacroRatio({ c: 40, p: 30, f: 30 })}>고단백 (40/30/30)</button>
                  </div>
                  <div className={styles.optionRow} style={{ marginTop: 5 }}>
                    <button className={`${styles.optionBtn} ${macroRatio.c === 60 ? styles.optionActive : ''}`}
                      onClick={() => setMacroRatio({ c: 60, p: 20, f: 20 })}>지구력 (60/20/20)</button>
                    <button className={`${styles.optionBtn} ${macroRatio.c === 25 ? styles.optionActive : ''}`}
                      onClick={() => setMacroRatio({ c: 25, p: 30, f: 45 })}>저탄고지 (25/30/45)</button>
                  </div>
                  <div className={styles.macroTable} style={{ marginTop: 10 }}>
                    <div className={`${styles.macroRow} ${styles.headerRow}`}>
                      <span>매크로</span><span>비율</span><span>그램</span><span>칼로리</span>
                    </div>
                    <div className={styles.macroRow}>
                      <span>🍚 탄수화물</span><span>{macros.carb.percent}%</span><span>{macros.carb.grams}g</span><span>{fmt(macros.carb.kcal)}</span>
                    </div>
                    <div className={styles.macroRow}>
                      <span>🥩 단백질</span><span>{macros.protein.percent}%</span><span>{macros.protein.grams}g</span><span>{fmt(macros.protein.kcal)}</span>
                    </div>
                    <div className={styles.macroRow}>
                      <span>🥑 지방</span><span>{macros.fat.percent}%</span><span>{macros.fat.grams}g</span><span>{fmt(macros.fat.kcal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 음식 환산 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>음식 환산 (참고용)</label>
                <div className={styles.foodGrid}>
                  {FOOD_REFERENCES.map((f, i) => (
                    <div key={i} className={styles.foodItem}>
                      <span>{f.name}</span>
                      <span>{f.kcal}kcal</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                  💡 오늘 예산 <strong style={{ color: '#3EC8FF' }}>{fmt(budgetGoal.daily)}kcal</strong> ≈ 밥 {Math.floor(budgetGoal.daily / 300)}공기 + 단백질·지방·야채 균형
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ────── 탭 5: 스마트워치 ────── */}
      {tab === 'watch' && (
        <>
          <div className={styles.disclaimer}>
            <strong>Apple Watch · Garmin · Fitbit</strong> 등 스마트워치 측정값과 공식 기반 추정치를 비교합니다.
            7일 이상 평균값 사용 권장 (일일 측정은 ±10~20% 오차 가능).
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>기기 종류</label>
            <div className={styles.optionRow4}>
              {[
                { v: 'apple', label: '🍎 Apple Watch' },
                { v: 'garmin', label: '🏃 Garmin' },
                { v: 'fitbit', label: '⌚ Fitbit' },
                { v: 'other', label: '기타' },
              ].map(o => (
                <button key={o.v}
                  className={`${styles.optionBtn} ${watchInput.device === o.v ? styles.optionActive : ''}`}
                  onClick={() => setWatchInput({ ...watchInput, device: o.v as SmartwatchInput['device'] })}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>측정 기간</label>
            <div className={styles.optionRow}>
              {[
                { v: 'day', label: '어제 1일' },
                { v: 'week', label: '최근 7일 평균' },
                { v: 'month', label: '최근 30일 평균' },
              ].map(o => (
                <button key={o.v}
                  className={`${styles.optionBtn} ${watchInput.period === o.v ? styles.optionActive : ''}`}
                  onClick={() => setWatchInput({ ...watchInput, period: o.v as SmartwatchInput['period'] })}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>휴식 에너지 (Resting)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="1720"
                  value={watchInput.resting || ''}
                  onChange={e => setWatchInput({ ...watchInput, resting: parseInt(e.target.value, 10) || 0 })} />
                <span className={styles.unit}>kcal</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>활동 에너지 (Active)</label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="numeric"
                  placeholder="1150"
                  value={watchInput.active || ''}
                  onChange={e => setWatchInput({ ...watchInput, active: parseInt(e.target.value, 10) || 0 })} />
                <span className={styles.unit}>kcal</span>
              </div>
            </div>
          </div>

          {watchCompare && (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(155,89,182,0.30)', background: 'rgba(155,89,182,0.06)' }}>
                <div className={styles.heroLabel}>권장 기준 TDEE (공식 + 워치 평균)</div>
                <div className={styles.heroNum} style={{ color: '#C485E0' }}>
                  {fmt(watchCompare.recommendedTdee)}<span className={styles.heroNumUnit}>kcal</span>
                </div>
                <div className={styles.heroDesc}>
                  공식 {fmt(watchCompare.formulaTdee)} · 워치 {fmt(watchCompare.watchTotal)} ·
                  차이 {watchCompare.diffTotal > 0 ? '+' : ''}{fmt(watchCompare.diffTotal)}
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>비교</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}>
                    <span>BMR / 휴식 (공식 vs 워치)</span>
                    <span>{fmt(watchCompare.formulaBmr)} / {fmt(watchCompare.watchResting)} ({watchCompare.diffBmr >= 0 ? '+' : ''}{fmt(watchCompare.diffBmr)})</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>활동 (공식 vs 워치)</span>
                    <span>{fmt(watchCompare.formulaTdee - watchCompare.formulaBmr)} / {fmt(watchCompare.watchActive)} ({watchCompare.diffActive >= 0 ? '+' : ''}{fmt(watchCompare.diffActive)})</span>
                  </div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}>
                    <span>TDEE (공식 vs 워치)</span>
                    <span>{fmt(watchCompare.formulaTdee)} / {fmt(watchCompare.watchTotal)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.warnBox}>
                ⚠️ <strong>둘 다 추정치</strong> — 공식 ±10%, 스마트워치 ±10~20% 오차 가능. 가장 정확한 검증은 2~4주 동일 칼로리 식사 후 체중 변화 측정. <strong>체중 안정 = 그 칼로리가 본인 TDEE.</strong>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`공식 TDEE ${fmt(watchCompare.formulaTdee)} / 워치 ${fmt(watchCompare.watchTotal)} → 권장 ${fmt(watchCompare.recommendedTdee)}kcal`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => setTab('budget')}>💰 칼로리 예산 적용</button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          )}
        </>
      )}

      {/* 히스토리 */}
      {history.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            저장된 기록 ({history.length}/60)
            <button className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={clearHistory}>전체 삭제</button>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} className={styles.historyRow}>
                <span className={styles.historyName}>
                  BMR {h.bmr} / TDEE {h.tdee}
                  <small>· {h.weight}kg · {new Date(h.date).toLocaleDateString('ko-KR')} · {FORMULAS.find(f => f.id === h.formula)?.name}</small>
                </span>
                <span className={styles.historyVal}>{fmt(h.tdee)} kcal</span>
                <button className={styles.miniBtn} onClick={() => removeHistory(h.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 면책 강화 */}
      <div className={styles.warnBox}>
        💛 <strong>BMR/TDEE는 추정치입니다.</strong> 의학적 진단·치료 도구가 아니며, 실제 소비량은 호르몬·근육·수면·약물·만성질환에 따라 다릅니다.
        체중 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방 <strong>1393</strong> (24시간).
      </div>
    </div>
  )
}
