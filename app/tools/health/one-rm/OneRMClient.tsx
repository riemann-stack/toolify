'use client'

import { useState, useMemo, useEffect } from 'react'
import s from './one-rm.module.css'

/* ════════════════════════════════════════════════════════════
   데이터
   ════════════════════════════════════════════════════════════ */
type Unit = 'kg' | 'lb'
type TabKey = 'calc' | 'training' | 'plate'
type FormulaKey = 'auto' | 'epley' | 'brzycki' | 'lombardi' | 'oconner'

interface Exercise {
  key: string
  emoji: string
  name: string
  levels?: { 초보: number; 중급: number; 상급: number; 엘리트: number }
}

const EXERCISES: Exercise[] = [
  { key: 'bench',    emoji: '🏋️', name: '벤치프레스',    levels: { 초보: 0.5,  중급: 1.0,  상급: 1.25, 엘리트: 1.5 } },
  { key: 'squat',    emoji: '🦵', name: '스쿼트',        levels: { 초보: 0.75, 중급: 1.25, 상급: 1.5,  엘리트: 2.0 } },
  { key: 'deadlift', emoji: '💀', name: '데드리프트',    levels: { 초보: 1.0,  중급: 1.5,  상급: 2.0,  엘리트: 2.5 } },
  { key: 'ohp',      emoji: '🏋️', name: '오버헤드프레스', levels: { 초보: 0.35, 중급: 0.65, 상급: 0.85, 엘리트: 1.1 } },
  { key: 'row',      emoji: '🔙', name: '바벨로우',      levels: { 초보: 0.5,  중급: 0.9,  상급: 1.15, 엘리트: 1.4 } },
  { key: 'other',    emoji: '➕', name: '기타' },
]

const FORMULAS = {
  epley:    (w: number, r: number) => w * (1 + r / 30),
  brzycki:  (w: number, r: number) => r < 37 ? w * (36 / (37 - r)) : w,
  lombardi: (w: number, r: number) => w * Math.pow(r, 0.1),
  oconner:  (w: number, r: number) => w * (1 + r / 40),
} as const

const FORMULA_META: { key: Exclude<FormulaKey, 'auto'>; name: string; note: string }[] = [
  { key: 'epley',    name: 'Epley',    note: '가장 널리 사용, 고반복에서 정확' },
  { key: 'brzycki',  name: 'Brzycki',  note: '저반복(1~10회)에서 정확' },
  { key: 'lombardi', name: 'Lombardi', note: '고반복 보수적 추정' },
  { key: 'oconner',  name: "O'Conner", note: '가장 보수적, 안전 마진' },
]

const INTENSITIES: { pct: number; reps: string; purpose: string; type: 'strong' | 'hyper' | 'end' }[] = [
  { pct: 95, reps: '1~2회',  purpose: '최대 근력',     type: 'strong' },
  { pct: 90, reps: '2~3회',  purpose: '고중량 훈련',   type: 'strong' },
  { pct: 85, reps: '3~5회',  purpose: '근력 강화',     type: 'strong' },
  { pct: 80, reps: '6~8회',  purpose: '근비대',        type: 'hyper' },
  { pct: 75, reps: '8~10회', purpose: '볼륨 훈련',     type: 'hyper' },
  { pct: 70, reps: '10~12회',purpose: '보조 훈련',     type: 'end'    },
  { pct: 65, reps: '12~15회',purpose: '지구력',        type: 'end'    },
  { pct: 60, reps: '15회+',  purpose: '워밍업',        type: 'end'    },
]

const PLATE_COLORS: Record<number, string> = {
  25:   '#FF4646',
  20:   '#3EC8FF',
  15:   '#FFD700',
  10:   '#FF8C3E',
  5:    '#3EFF9B',
  2.5:  '#C8FF3E',
  1.25: '#9B59B6',
  0.5:  '#FFFFFF',
}
const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]

/* ════════════════════════════════════════════════════════════
   유틸
   ════════════════════════════════════════════════════════════ */
const KG_PER_LB = 0.4536
const kgToLb = (kg: number) => kg / KG_PER_LB
const lbToKg = (lb: number) => lb * KG_PER_LB

function fmt(n: number, d = 1): string {
  if (!isFinite(n)) return '—'
  const r = Math.round(n * Math.pow(10, d)) / Math.pow(10, d)
  return r.toString()
}
function roundTo(val: number, unit: number): number {
  return Math.round(val / unit) * unit
}

function copyText(text: string): Promise<void> {
  return navigator.clipboard?.writeText(text) ?? Promise.reject()
}

/* ════════════════════════════════════════════════════════════
   메인
   ════════════════════════════════════════════════════════════ */
interface HistoryRecord {
  id: string
  date: string  // YYYY-MM-DD
  exerciseKey: string
  exerciseName: string
  oneRM: number  // kg
}

const LS_KEY = 'youtil:one-rm:history'

export default function OneRMClient() {
  const [tab, setTab] = useState<TabKey>('calc')

  // 계산 입력
  const [exerciseKey, setExerciseKey] = useState('bench')
  const [weight, setWeight] = useState('80')
  const [unit, setUnit] = useState<Unit>('kg')
  const [includesBar, setIncludesBar] = useState(true)
  const [reps, setReps] = useState(5)
  const [formulaKey, setFormulaKey] = useState<FormulaKey>('auto')
  const [roundUnit, setRoundUnit] = useState(2.5)
  const [bodyWeight, setBodyWeight] = useState('')  // kg

  // 훈련 탭 직접 입력 overide
  const [trainingOverride, setTrainingOverride] = useState('')

  // 원판 탭
  const [targetWeight, setTargetWeight] = useState('100')
  const [barWeight, setBarWeight] = useState(20)
  const [barCustom, setBarCustom] = useState('')
  const [enabledPlates, setEnabledPlates] = useState<Set<number>>(new Set(DEFAULT_PLATES))

  // 기록
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(history))
    } catch { /* ignore */ }
  }, [history, mounted])

  /* 1RM 계산 */
  const exercise = EXERCISES.find((e) => e.key === exerciseKey) ?? EXERCISES[0]
  const weightKg = useMemo(() => {
    const w = parseFloat(weight)
    if (!isFinite(w) || w <= 0) return 0
    return unit === 'kg' ? w : lbToKg(w)
  }, [weight, unit])
  const validCalc = weightKg > 0 && reps >= 1

  const oneRMs = useMemo(() => {
    if (!validCalc) return null
    const vals = {
      epley:    FORMULAS.epley(weightKg, reps),
      brzycki:  FORMULAS.brzycki(weightKg, reps),
      lombardi: FORMULAS.lombardi(weightKg, reps),
      oconner:  FORMULAS.oconner(weightKg, reps),
    }
    const avg = (vals.epley + vals.brzycki + vals.lombardi + vals.oconner) / 4
    return { ...vals, auto: avg }
  }, [weightKg, reps, validCalc])

  const oneRM = oneRMs ? oneRMs[formulaKey] : 0
  const oneRMRounded = roundTo(oneRM, roundUnit)
  const oneRMDisplay = unit === 'kg' ? oneRMRounded : kgToLb(oneRMRounded)

  const rangeMin = oneRMs ? Math.min(oneRMs.epley, oneRMs.brzycki, oneRMs.lombardi, oneRMs.oconner) : 0
  const rangeMax = oneRMs ? Math.max(oneRMs.epley, oneRMs.brzycki, oneRMs.lombardi, oneRMs.oconner) : 0
  const rangeMinDisplay = unit === 'kg' ? roundTo(rangeMin, roundUnit) : roundTo(kgToLb(rangeMin), roundUnit === 2.5 ? 5 : roundUnit)
  const rangeMaxDisplay = unit === 'kg' ? roundTo(rangeMax, roundUnit) : roundTo(kgToLb(rangeMax), roundUnit === 2.5 ? 5 : roundUnit)

  const bwKg = parseFloat(bodyWeight)
  const validBw = isFinite(bwKg) && bwKg > 0
  const bwRatio = validBw && oneRM > 0 ? oneRM / bwKg : 0

  // 수준 판정
  let level: string | null = null
  if (validBw && exercise.levels && oneRM > 0) {
    const { 초보, 중급, 상급, 엘리트 } = exercise.levels
    if (bwRatio >= 엘리트) level = '엘리트'
    else if (bwRatio >= 상급) level = '상급'
    else if (bwRatio >= 중급) level = '중급'
    else if (bwRatio >= 초보) level = '초보'
    else level = '입문'
  }

  /* 훈련 탭 1RM */
  const oneRMForTraining = useMemo(() => {
    const over = parseFloat(trainingOverride)
    if (isFinite(over) && over > 0) {
      return unit === 'kg' ? over : lbToKg(over)
    }
    return oneRMRounded > 0 ? oneRMRounded : 0
  }, [trainingOverride, unit, oneRMRounded])

  const addRecord = () => {
    if (!oneRMRounded || oneRMRounded <= 0) return
    const today = new Date().toISOString().slice(0, 10)
    const rec: HistoryRecord = {
      id: Math.random().toString(36).slice(2, 10),
      date: today,
      exerciseKey: exercise.key,
      exerciseName: exercise.name,
      oneRM: oneRMRounded,
    }
    setHistory((p) => [...p, rec])
  }

  return (
    <div className={s.wrap}>
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'calc' ? s.tabActive : ''}`} onClick={() => setTab('calc')}>1RM 계산</button>
        <button className={`${s.tab} ${tab === 'training' ? s.tabActive : ''}`} onClick={() => setTab('training')}>훈련 중량</button>
        <button className={`${s.tab} ${tab === 'plate' ? s.tabActive : ''}`} onClick={() => setTab('plate')}>원판 계산</button>
      </div>

      {tab === 'calc' && (
        <CalcTab
          exercise={exercise}
          exerciseKey={exerciseKey}
          setExerciseKey={setExerciseKey}
          weight={weight}
          setWeight={setWeight}
          unit={unit}
          setUnit={setUnit}
          includesBar={includesBar}
          setIncludesBar={setIncludesBar}
          reps={reps}
          setReps={setReps}
          formulaKey={formulaKey}
          setFormulaKey={setFormulaKey}
          roundUnit={roundUnit}
          setRoundUnit={setRoundUnit}
          bodyWeight={bodyWeight}
          setBodyWeight={setBodyWeight}
          oneRMs={oneRMs}
          oneRM={oneRM}
          oneRMDisplay={oneRMDisplay}
          rangeMinDisplay={rangeMinDisplay}
          rangeMaxDisplay={rangeMaxDisplay}
          bwRatio={bwRatio}
          level={level}
          validBw={validBw}
          history={history}
          setHistory={setHistory}
          addRecord={addRecord}
          mounted={mounted}
        />
      )}

      {tab === 'training' && (
        <TrainingTab
          oneRMKg={oneRMForTraining}
          unit={unit}
          setUnit={setUnit}
          roundUnit={roundUnit}
          trainingOverride={trainingOverride}
          setTrainingOverride={setTrainingOverride}
          exercise={exercise}
        />
      )}

      {tab === 'plate' && (
        <PlateTab
          targetWeight={targetWeight}
          setTargetWeight={setTargetWeight}
          unit={unit}
          setUnit={setUnit}
          barWeight={barWeight}
          setBarWeight={setBarWeight}
          barCustom={barCustom}
          setBarCustom={setBarCustom}
          enabledPlates={enabledPlates}
          setEnabledPlates={setEnabledPlates}
        />
      )}

      <div className={s.safetyCard}>
        <strong>⚠️ 안전 안내</strong> — 1RM은 추정값입니다. 실제 최대 중량 도전 시 반드시 안전 보조자(스포터) 또는 세이프티 랙이 있는 환경에서 진행하세요.
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 1 — 1RM 계산
   ════════════════════════════════════════════════════════════ */
interface CalcTabProps {
  exercise: Exercise
  exerciseKey: string
  setExerciseKey: (k: string) => void
  weight: string
  setWeight: (v: string) => void
  unit: Unit
  setUnit: (u: Unit) => void
  includesBar: boolean
  setIncludesBar: (v: boolean) => void
  reps: number
  setReps: (v: number) => void
  formulaKey: FormulaKey
  setFormulaKey: (k: FormulaKey) => void
  roundUnit: number
  setRoundUnit: (v: number) => void
  bodyWeight: string
  setBodyWeight: (v: string) => void
  oneRMs: { auto: number; epley: number; brzycki: number; lombardi: number; oconner: number } | null
  oneRM: number
  oneRMDisplay: number
  rangeMinDisplay: number
  rangeMaxDisplay: number
  bwRatio: number
  level: string | null
  validBw: boolean
  history: HistoryRecord[]
  setHistory: React.Dispatch<React.SetStateAction<HistoryRecord[]>>
  addRecord: () => void
  mounted: boolean
}

function CalcTab(props: CalcTabProps) {
  const {
    exercise, exerciseKey, setExerciseKey,
    weight, setWeight, unit, setUnit,
    includesBar, setIncludesBar, reps, setReps,
    formulaKey, setFormulaKey, roundUnit, setRoundUnit,
    bodyWeight, setBodyWeight,
    oneRMs, oneRMDisplay, rangeMinDisplay, rangeMaxDisplay,
    bwRatio, level, validBw,
    history, setHistory, addRecord, mounted,
  } = props

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>운동 종목</span>
        <div className={s.exerciseGrid}>
          {EXERCISES.map((e) => (
            <button
              key={e.key}
              className={`${s.exerciseBtn} ${exerciseKey === e.key ? s.exerciseBtnActive : ''}`}
              onClick={() => setExerciseKey(e.key)}
            >
              <span className={s.exerciseEmoji}>{e.emoji}</span>
              <span>{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>중량 · 반복</span>

        <div className={s.field}>
          <div className={s.rowInline} style={{ justifyContent: 'space-between' }}>
            <label className={s.fieldLabel}>중량</label>
            <div className={s.unitToggle}>
              <button className={`${s.unitBtn} ${unit === 'kg' ? s.unitBtnActive : ''}`} onClick={() => setUnit('kg')}>kg</button>
              <button className={`${s.unitBtn} ${unit === 'lb' ? s.unitBtnActive : ''}`} onClick={() => setUnit('lb')}>lb</button>
            </div>
          </div>
          <input type="number" inputMode="decimal" className={s.input} value={weight} min={0} onChange={(e) => setWeight(e.target.value)} />
          <label className={s.checkRow} style={{ marginTop: 4 }}>
            <input type="checkbox" checked={includesBar} onChange={(e) => setIncludesBar(e.target.checked)} />
            바벨 무게 포함
          </label>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>반복 횟수</label>
          <div className={s.sliderRow}>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value))}
              className={`${s.slider} ${reps > 10 ? s.sliderWarn : ''}`}
            />
            <input
              type="number"
              min={1}
              max={15}
              value={reps}
              onChange={(e) => setReps(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
              className={s.sliderValInput}
            />
          </div>
          {reps > 10 && (
            <div className={s.warnMsg}>⚠️ 10회 이상은 오차가 커질 수 있습니다.</div>
          )}
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>계산 공식</label>
          <div className={s.pillRow}>
            {(['auto', 'epley', 'brzycki', 'lombardi', 'oconner'] as FormulaKey[]).map((k) => {
              const label = k === 'auto' ? '자동 평균' : FORMULA_META.find((f) => f.key === k)?.name ?? k
              return (
                <button
                  key={k}
                  className={`${s.pill} ${formulaKey === k ? s.pillActive : ''}`}
                  onClick={() => setFormulaKey(k)}
                >{label}</button>
              )
            })}
          </div>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>반올림 단위</label>
          <div className={s.pillRow}>
            {[0.5, 1, 2.5, 5].map((v) => (
              <button
                key={v}
                className={`${s.pill} ${roundUnit === v ? s.pillActive : ''}`}
                onClick={() => setRoundUnit(v)}
              >{v}{unit}</button>
            ))}
          </div>
        </div>

        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.fieldLabel}>체중 (선택, kg) — 수준 판정용</label>
          <input type="number" inputMode="decimal" className={s.input} placeholder="75" value={bodyWeight} min={0} onChange={(e) => setBodyWeight(e.target.value)} />
        </div>
      </div>

      {oneRMs && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>예상 1RM</p>
            <p className={s.heroValue}>약 {fmt(oneRMDisplay, roundUnit < 1 ? 1 : 0)}{unit}</p>
            <p className={s.heroRange}>
              범위: {fmt(rangeMinDisplay, 0)}~{fmt(rangeMaxDisplay, 0)}{unit} (공식별)
              {' · '}
              <span style={{ color: 'var(--text)' }}>
                {formulaKey === 'auto' ? '자동 평균' : FORMULA_META.find((f) => f.key === formulaKey)?.name} 기준
              </span>
            </p>
            {validBw && (
              <p className={s.heroBodyweight}>
                체중 {bodyWeight}kg 기준 <strong>{bwRatio.toFixed(2)}배</strong>
                {level && <> · 수준 <strong>{level}</strong></>}
              </p>
            )}
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>공식별 비교</span>
            <table className={s.resultTable}>
              <thead>
                <tr>
                  <th>공식</th>
                  <th>1RM 추정값</th>
                  <th>특징</th>
                </tr>
              </thead>
              <tbody>
                {FORMULA_META.map((f) => {
                  const val = oneRMs[f.key]
                  const display = unit === 'kg' ? roundTo(val, roundUnit) : roundTo(kgToLb(val), roundUnit === 2.5 ? 5 : roundUnit)
                  return (
                    <tr key={f.key}>
                      <td className={s.formulaName}>{f.name}</td>
                      <td className={s.formulaVal}>{fmt(display, 0)}{unit}</td>
                      <td className={s.formulaNote}>{f.note}</td>
                    </tr>
                  )
                })}
                <tr className={s.rowAccent}>
                  <td className={s.formulaName}>평균</td>
                  <td className={s.formulaVal}>{fmt(unit === 'kg' ? roundTo(oneRMs.auto, roundUnit) : roundTo(kgToLb(oneRMs.auto), roundUnit === 2.5 ? 5 : roundUnit), 0)}{unit}</td>
                  <td className={s.formulaNote}>4개 공식 평균</td>
                </tr>
              </tbody>
            </table>
          </div>

          {validBw && exercise.levels && level && (
            <div className={s.card}>
              <span className={s.cardLabel}>체중 대비 수준</span>
              <div className={s.levelCard}>
                <div className={s.levelHead}>
                  <span className={s.levelLabel}>{exercise.name}</span>
                  <span>
                    <span className={s.levelValue}>{level}</span>
                    <span className={s.levelRatio} style={{ marginLeft: 8 }}>(체중의 {bwRatio.toFixed(2)}배)</span>
                  </span>
                </div>
                <div className={s.levelBar}>
                  {(() => {
                    const { 초보, 중급, 상급, 엘리트 } = exercise.levels!
                    const pct = Math.min(100, Math.max(0, ((bwRatio - 초보) / (엘리트 - 초보)) * 100))
                    return <div className={s.levelMarker} style={{ left: `${pct}%` }} />
                  })()}
                </div>
                <div className={s.levelLabels}>
                  <span>초보 ×{exercise.levels.초보}</span>
                  <span>중급 ×{exercise.levels.중급}</span>
                  <span>상급 ×{exercise.levels.상급}</span>
                  <span>엘리트 ×{exercise.levels.엘리트}</span>
                </div>
              </div>
            </div>
          )}

          <div className={s.card}>
            <span className={s.cardLabel}>진행 추적 (로컬 저장)</span>
            <button className={s.addRecordBtn} onClick={addRecord}>
              + 오늘 기록 추가 ({exercise.name} · {fmt(oneRMDisplay, 0)}{unit})
            </button>
            {mounted && history.length > 0 && (
              <>
                <div style={{ height: 10 }} />
                <HistoryChart history={history.filter((h) => h.exerciseKey === exercise.key)} />
                <div style={{ height: 10 }} />
                <div className={s.historyList}>
                  {history.slice().reverse().map((rec, idx, arr) => {
                    const prev = arr.slice(idx + 1).find((h) => h.exerciseKey === rec.exerciseKey)
                    const diff = prev ? rec.oneRM - prev.oneRM : 0
                    const diffClass = diff > 0 ? s.historyDiffUp : diff < 0 ? s.historyDiffDown : s.historyDiffSame
                    const diffText = prev ? (diff > 0 ? `+${fmt(diff, 1)}` : diff < 0 ? fmt(diff, 1) : '±0') : '—'
                    return (
                      <div key={rec.id} className={s.historyItem}>
                        <span className={s.historyDate}>{rec.date}</span>
                        <span className={s.historyEx}>{rec.exerciseName}</span>
                        <span className={s.historyVal}>{fmt(rec.oneRM, 0)}kg</span>
                        <span className={`${s.historyDiff} ${diffClass}`}>{diffText}</span>
                        <button
                          className={s.historyRemove}
                          onClick={() => setHistory((p) => p.filter((h) => h.id !== rec.id))}
                          aria-label="삭제"
                        >✕</button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

function HistoryChart({ history }: { history: HistoryRecord[] }) {
  if (history.length < 2) {
    return (
      <div className={s.historyChart} style={{ fontSize: 12, color: 'var(--muted)', padding: '24px 12px', textAlign: 'center' }}>
        기록이 2개 이상 쌓이면 그래프가 표시됩니다.
      </div>
    )
  }
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const W = 600, H = 140, padL = 40, padR = 20, padT = 16, padB = 28
  const minV = Math.min(...sorted.map((r) => r.oneRM))
  const maxV = Math.max(...sorted.map((r) => r.oneRM))
  const yMin = minV * 0.95
  const yMax = maxV * 1.05
  const xOf = (i: number) => padL + (i / (sorted.length - 1)) * (W - padL - padR)
  const yOf = (v: number) => padT + (H - padT - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)

  const pts = sorted.map((r, i) => `${xOf(i)},${yOf(r.oneRM)}`).join(' ')

  return (
    <div className={s.historyChart}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.historyChartSvg} preserveAspectRatio="xMidYMid meet">
        <line x1={padL} y1={yOf(maxV)} x2={W - padR} y2={yOf(maxV)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1={padL} y1={yOf(minV)} x2={W - padR} y2={yOf(minV)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <polyline points={pts} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((r, i) => (
          <circle key={r.id} cx={xOf(i)} cy={yOf(r.oneRM)} r={3} fill="var(--accent)" />
        ))}
        <text x={padL - 4} y={yOf(maxV) + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Syne">{fmt(maxV, 0)}</text>
        <text x={padL - 4} y={yOf(minV) + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Syne">{fmt(minV, 0)}</text>
        <text x={padL} y={H - 10} fill="var(--muted)" fontSize="10" textAnchor="start" fontFamily="Syne">{sorted[0].date.slice(5)}</text>
        <text x={W - padR} y={H - 10} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Syne">{sorted[sorted.length - 1].date.slice(5)}</text>
      </svg>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 2 — 훈련 중량
   ════════════════════════════════════════════════════════════ */
interface TrainingTabProps {
  oneRMKg: number
  unit: Unit
  setUnit: (u: Unit) => void
  roundUnit: number
  trainingOverride: string
  setTrainingOverride: (v: string) => void
  exercise: Exercise
}

function TrainingTab({ oneRMKg, unit, setUnit, roundUnit, trainingOverride, setTrainingOverride, exercise }: TrainingTabProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = async (text: string, key: string) => {
    try {
      await copyText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1000)
    } catch { /* ignore */ }
  }

  const hasOneRM = oneRMKg > 0

  const intensityRows = useMemo(() => {
    if (!hasOneRM) return []
    return INTENSITIES.map((row) => {
      const wKg = roundTo((oneRMKg * row.pct) / 100, roundUnit)
      const display = unit === 'kg' ? wKg : roundTo(kgToLb(wKg), roundUnit === 2.5 ? 5 : roundUnit)
      return { ...row, display }
    })
  }, [oneRMKg, unit, roundUnit, hasOneRM])

  const repsRows = useMemo(() => {
    if (!hasOneRM) return []
    const reps = [1, 2, 3, 5, 8, 10, 12, 15]
    return reps.map((r) => {
      // Epley 역산
      const wKg = oneRMKg / (1 + r / 30)
      const rounded = roundTo(wKg, roundUnit)
      const display = unit === 'kg' ? rounded : roundTo(kgToLb(rounded), roundUnit === 2.5 ? 5 : roundUnit)
      const pct = Math.round((wKg / oneRMKg) * 100)
      return { reps: r, display, pct }
    })
  }, [oneRMKg, unit, roundUnit, hasOneRM])

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>1RM 입력</span>
        <div className={s.rowInline} style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <label className={s.fieldLabel}>직접 입력 (비우면 계산 탭 값 사용)</label>
          <div className={s.unitToggle}>
            <button className={`${s.unitBtn} ${unit === 'kg' ? s.unitBtnActive : ''}`} onClick={() => setUnit('kg')}>kg</button>
            <button className={`${s.unitBtn} ${unit === 'lb' ? s.unitBtnActive : ''}`} onClick={() => setUnit('lb')}>lb</button>
          </div>
        </div>
        <input
          type="number"
          inputMode="decimal"
          className={s.input}
          placeholder={hasOneRM ? `${fmt(unit === 'kg' ? oneRMKg : kgToLb(oneRMKg), 0)}${unit} (계산 탭 값)` : '예: 100'}
          value={trainingOverride}
          onChange={(e) => setTrainingOverride(e.target.value)}
        />
      </div>

      {hasOneRM ? (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>강도별 훈련 중량</span>
            <div>
              {intensityRows.map((row) => {
                const typeClass = row.type === 'strong' ? s.intensityStrong : row.type === 'hyper' ? s.intensityHypertrophy : s.intensityEndurance
                const k = `int-${row.pct}`
                const decl = `${exercise.name} ${row.pct}% · ${fmt(row.display, 0)}${unit} · ${row.reps}`
                return (
                  <div key={row.pct} className={`${s.intensityRow} ${typeClass}`}>
                    <div className={s.intensityPct}>{row.pct}%</div>
                    <div className={s.intensityWt}>{fmt(row.display, 0)}{unit}</div>
                    <div className={s.intensityReps}>{row.reps}</div>
                    <div className={s.intensityPurpose}>{row.purpose}</div>
                    <button
                      className={`${s.intensityCopy} ${copiedKey === k ? s.intensityCopyDone : ''}`}
                      onClick={() => copy(decl, k)}
                      aria-label="복사"
                    >{copiedKey === k ? '✅' : '📋'}</button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>반복수별 예상 중량</span>
            <table className={s.resultTable}>
              <thead>
                <tr>
                  <th>목표 반복수</th>
                  <th>예상 중량</th>
                  <th>강도</th>
                </tr>
              </thead>
              <tbody>
                {repsRows.map((r) => (
                  <tr key={r.reps}>
                    <td className={s.formulaName}>{r.reps}회</td>
                    <td className={s.formulaVal}>{fmt(r.display, 0)}{unit}</td>
                    <td className={s.formulaNote}>{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>{exercise.name} 프로그램 예시</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                const pct80 = roundTo(oneRMKg * 0.8, roundUnit)
                const pct70 = roundTo(oneRMKg * 0.7, roundUnit)
                const pct75 = roundTo(oneRMKg * 0.75, roundUnit)
                const pct60 = roundTo(oneRMKg * 0.6, roundUnit)
                const d = (kg: number) => unit === 'kg' ? fmt(kg, 0) : fmt(kgToLb(kg), 0)
                return (
                  <>
                    <div className={s.programCard}>
                      <div className={s.programHead}>💪 근력 중심 (저반복·고중량)</div>
                      <div className={s.programItem}><strong>5×5</strong> @ 80% — {d(pct80)}{unit} × 5회 × 5세트</div>
                    </div>
                    <div className={s.programCard}>
                      <div className={s.programHead}>🔥 근비대 (중반복)</div>
                      <div className={s.programItem}><strong>4×8~12</strong> @ 70~75% — {d(pct70)}~{d(pct75)}{unit} × 8~12회 × 4세트</div>
                    </div>
                    <div className={s.programCard}>
                      <div className={s.programHead}>🚴 볼륨/지구력</div>
                      <div className={s.programItem}><strong>3×15</strong> @ 60% — {d(pct60)}{unit} × 15회 × 3세트</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </>
      ) : (
        <div className={s.card}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'center', padding: '20px 0' }}>
            먼저 <strong style={{ color: 'var(--text)' }}>1RM 계산</strong> 탭에서 중량·반복을 입력하거나<br />
            위 입력란에 1RM 값을 직접 입력해주세요.
          </p>
        </div>
      )}
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   탭 3 — 원판 계산
   ════════════════════════════════════════════════════════════ */
interface PlateTabProps {
  targetWeight: string
  setTargetWeight: (v: string) => void
  unit: Unit
  setUnit: (u: Unit) => void
  barWeight: number
  setBarWeight: (v: number) => void
  barCustom: string
  setBarCustom: (v: string) => void
  enabledPlates: Set<number>
  setEnabledPlates: (s: Set<number>) => void
}

function calcPlates(targetKg: number, barKg: number, available: number[]): {
  perSide: number[]
  totalPerSide: number
  achieved: number
  exact: boolean
  alt?: { lower: number; upper: number }
} {
  const perSideTarget = (targetKg - barKg) / 2
  if (perSideTarget < 0) {
    return { perSide: [], totalPerSide: 0, achieved: barKg, exact: targetKg === barKg, alt: undefined }
  }

  // Greedy with available plates (sorted descending)
  const plates = [...available].sort((a, b) => b - a)
  const result: number[] = []
  let remaining = perSideTarget
  for (const p of plates) {
    while (remaining >= p - 0.0001) {
      result.push(p)
      remaining -= p
    }
  }
  const achievedPerSide = perSideTarget - remaining
  const achieved = barKg + achievedPerSide * 2
  const exact = Math.abs(targetKg - achieved) < 0.01

  let alt: { lower: number; upper: number } | undefined
  if (!exact) {
    // 가능한 가장 가까운 상·하 중량 (같은 그리디로 상한 시도)
    const lower = achieved
    // upper: add smallest plate step ×2
    const smallest = plates[plates.length - 1] ?? 0
    const upper = achieved + smallest * 2
    alt = { lower, upper }
  }

  return { perSide: result, totalPerSide: achievedPerSide, achieved, exact, alt }
}

function PlateTab({
  targetWeight, setTargetWeight, unit, setUnit,
  barWeight, setBarWeight, barCustom, setBarCustom,
  enabledPlates, setEnabledPlates,
}: PlateTabProps) {
  const targetKg = useMemo(() => {
    const v = parseFloat(targetWeight)
    if (!isFinite(v) || v <= 0) return 0
    return unit === 'kg' ? v : lbToKg(v)
  }, [targetWeight, unit])

  const actualBarKg = useMemo(() => {
    if (barWeight > 0) return barWeight
    const v = parseFloat(barCustom)
    if (!isFinite(v) || v <= 0) return 0
    return unit === 'kg' ? v : lbToKg(v)
  }, [barWeight, barCustom, unit])

  const available = Array.from(enabledPlates).sort((a, b) => b - a)

  const result = useMemo(() => {
    if (targetKg <= 0 || actualBarKg <= 0) return null
    return calcPlates(targetKg, actualBarKg, available)
  }, [targetKg, actualBarKg, available])

  const togglePlate = (p: number) => {
    const next = new Set(enabledPlates)
    if (next.has(p)) next.delete(p)
    else next.add(p)
    setEnabledPlates(next)
  }

  // 원판 집계
  const plateCounts = useMemo(() => {
    if (!result) return []
    const map = new Map<number, number>()
    for (const p of result.perSide) map.set(p, (map.get(p) ?? 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0])
  }, [result])

  const displayWeight = (kg: number) => unit === 'kg' ? fmt(kg, 1) : fmt(kgToLb(kg), 1)

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>입력</span>

        <div className={s.field}>
          <div className={s.rowInline} style={{ justifyContent: 'space-between' }}>
            <label className={s.fieldLabel}>목표 중량</label>
            <div className={s.unitToggle}>
              <button className={`${s.unitBtn} ${unit === 'kg' ? s.unitBtnActive : ''}`} onClick={() => setUnit('kg')}>kg</button>
              <button className={`${s.unitBtn} ${unit === 'lb' ? s.unitBtnActive : ''}`} onClick={() => setUnit('lb')}>lb</button>
            </div>
          </div>
          <input type="number" inputMode="decimal" className={s.input} value={targetWeight} min={0} onChange={(e) => setTargetWeight(e.target.value)} />
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>바벨 종류</label>
          <div className={s.pillRow}>
            {[
              { v: 20, label: '올림픽 (20kg)' },
              { v: 15, label: '여성용 (15kg)' },
              { v: 10, label: '이지바 (10kg)' },
              { v: 0,  label: '직접 입력' },
            ].map((b) => (
              <button
                key={b.v}
                className={`${s.pill} ${barWeight === b.v ? s.pillActive : ''}`}
                onClick={() => setBarWeight(b.v)}
              >{b.label}</button>
            ))}
          </div>
          {barWeight === 0 && (
            <input
              type="number"
              inputMode="decimal"
              className={s.input}
              style={{ marginTop: 8 }}
              placeholder={`바벨 무게 (${unit})`}
              value={barCustom}
              onChange={(e) => setBarCustom(e.target.value)}
            />
          )}
        </div>

        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.fieldLabel}>사용 가능 원판 (kg)</label>
          <div className={s.plateGrid}>
            {DEFAULT_PLATES.map((p) => (
              <div
                key={p}
                className={`${s.plateCheck} ${enabledPlates.has(p) ? s.plateCheckActive : ''}`}
                onClick={() => togglePlate(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlate(p) }}
              >{p}kg</div>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className={s.card}>
          <span className={s.cardLabel}>원판 조합</span>

          <div className={s.plateResult}>
            <p className={s.plateResultLabel}>목표 {displayWeight(targetKg)}{unit} · 바 {displayWeight(actualBarKg)}{unit}</p>
            <p className={s.plateResultValue}>양쪽 각 {displayWeight(result.totalPerSide)}{unit}</p>
            <p className={s.plateResultSub}>실제 합계: {displayWeight(result.achieved)}{unit}</p>
          </div>

          {result.perSide.length > 0 ? (
            <>
              <div className={s.plateListCard}>
                <strong>한쪽 원판 조합:</strong>
                {' '}
                {plateCounts.map(([p, c], i) => (
                  <span key={p}>
                    {i > 0 && ' + '}
                    {p}kg × {c}
                  </span>
                ))}
                {' = '}
                <strong>{displayWeight(result.totalPerSide)}{unit}</strong>
                <br />
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  → 전체 {displayWeight(actualBarKg)} + ({displayWeight(result.totalPerSide)} × 2) = <strong>{displayWeight(result.achieved)}{unit}</strong>
                  {result.exact ? ' ✅' : ' (근사)'}
                </span>
              </div>

              <div style={{ height: 12 }} />
              <PlateViz barKg={actualBarKg} perSide={result.perSide} />
            </>
          ) : (
            <div className={s.plateError}>
              <strong>바 무게 이하의 목표는 원판이 필요 없습니다.</strong>
            </div>
          )}

          {!result.exact && result.alt && (
            <div className={s.plateError} style={{ marginTop: 10 }}>
              선택한 원판으로 정확히 {displayWeight(targetKg)}{unit}을 만들 수 없습니다.<br />
              가능한 가장 가까운 중량: <strong>{displayWeight(result.alt.lower)}{unit}</strong>
              {result.alt.upper > result.alt.lower && <> 또는 <strong>{displayWeight(result.alt.upper)}{unit}</strong></>}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function PlateViz({ barKg, perSide }: { barKg: number; perSide: number[] }) {
  // perSide: 큰 → 작은 순으로 정렬된 원판 목록 (한쪽)
  const plates = [...perSide].sort((a, b) => b - a)

  const W = 520, H = 140
  const centerY = H / 2
  const barHeight = 12
  const barLen = W - 40
  const barLeft = 20

  // 원판 크기 설정
  const plateHeight = (p: number) => {
    // 25kg 가장 높음(100), 0.5kg 가장 낮음(40)
    const max = 100, min = 40
    const pMax = 25, pMin = 0.5
    return min + ((p - pMin) / (pMax - pMin)) * (max - min)
  }
  const plateWidth = 12

  // 슬리브 길이 확보 위해 한쪽에 최대 10개 원판
  const maxPerSide = Math.min(plates.length, 10)
  const sliceLen = maxPerSide * plateWidth + 6

  return (
    <div className={s.plateViz}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520, height: H }}>
        {/* 바벨 봉 */}
        <rect x={barLeft} y={centerY - barHeight / 2} width={barLen} height={barHeight} fill="#888" rx="2" />
        {/* 중앙 그립 영역 (약간 어둡게) */}
        <rect x={W / 2 - 50} y={centerY - barHeight / 2 - 2} width="100" height={barHeight + 4} fill="#666" rx="2" />

        {/* 바벨 칼라 (양쪽) */}
        {[true, false].map((isLeft) => {
          const collarX = isLeft ? barLeft + (barLen / 2 - 60) : barLeft + (barLen / 2 + 56)
          return (
            <rect
              key={isLeft ? 'L' : 'R'}
              x={collarX}
              y={centerY - barHeight / 2 - 4}
              width="4"
              height={barHeight + 8}
              fill="#444"
            />
          )
        })}

        {/* 양쪽 원판 */}
        {[true, false].map((isLeft) => {
          let cursor = isLeft
            ? (W / 2 - 64 - plateWidth)  // 왼쪽: 안쪽 → 바깥쪽
            : (W / 2 + 64)               // 오른쪽: 안쪽 → 바깥쪽
          const dir = isLeft ? -1 : 1
          return plates.slice(0, maxPerSide).map((p, i) => {
            const h = plateHeight(p)
            const x = cursor
            cursor += dir * plateWidth
            const color = PLATE_COLORS[p] ?? '#888'
            return (
              <rect
                key={`${isLeft ? 'L' : 'R'}-${i}`}
                x={x}
                y={centerY - h / 2}
                width={plateWidth - 2}
                height={h}
                fill={color}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="0.5"
                rx="1"
              />
            )
          })
        })}

        {/* 라벨 */}
        <text x={W / 2} y={H - 10} fill="var(--muted)" fontSize="11" textAnchor="middle" fontFamily="Syne">
          바 {fmt(barKg, 0)}kg
        </text>
      </svg>
    </div>
  )
}
