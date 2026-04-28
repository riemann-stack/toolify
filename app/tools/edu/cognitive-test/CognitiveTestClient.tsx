'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './cognitive-test.module.css'

// ─────────────────────────────────────────────
// 상수·데이터
// ─────────────────────────────────────────────
const ROUNDS = { reaction: 6, stroop: 20, dualSingle: 5, dualDouble: 10 } as const
// reaction은 6회 시행 중 첫 1회 warm-up 제외하여 5회 평균

const STROOP_COLORS = [
  { name: '빨강', code: '#FF4444' },
  { name: '파랑', code: '#3E5BFF' },
  { name: '초록', code: '#3EFF9B' },
  { name: '노랑', code: '#FFD700' },
  { name: '보라', code: '#9B59B6' },
  { name: '주황', code: '#FF8C3E' },
]

type Grade = { key: string; label: string; emoji: string; range: [number, number]; color: string }
const REACTION_GRADES: Grade[] = [
  { key: 'excellent', label: '매우 빠름',   emoji: '🚀', range: [0, 200],     color: '#3EFFD0' },
  { key: 'fast',      label: '빠름',         emoji: '✨', range: [201, 250],   color: '#3EFF9B' },
  { key: 'avg',       label: '평균',         emoji: '⭐', range: [251, 300],   color: 'var(--accent)' },
  { key: 'below',     label: '평균 이하',    emoji: '👍', range: [301, 350],   color: '#FFD700' },
  { key: 'slow',      label: '느림',         emoji: '🐢', range: [351, 9999],  color: '#FF8C3E' },
]
function getReactionGrade(ms: number): Grade {
  return REACTION_GRADES.find(g => ms >= g.range[0] && ms <= g.range[1]) ?? REACTION_GRADES[4]
}

// ─────────────────────────────────────────────
// 공유 결과 (localStorage)
// ─────────────────────────────────────────────
type Records = {
  bestReaction?: number     // ms
  bestStroopInterference?: number  // ms (lower = better)
  bestDualInterference?: number    // % (lower = better)
  totalTests: number
  lastTested?: string  // ISO
  lastReaction?: number
  lastStroop?: number
  lastDual?: number
}
const RECORDS_KEY = 'youtil-cognitive-records-v1'

function loadRecords(): Records {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { totalTests: 0 }
}
function saveRecords(r: Records) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(r)) } catch {}
}

// 통계 계산
function calcStats(times: number[]) {
  if (times.length === 0) return null
  const sorted = [...times].sort((a, b) => a - b)
  const mean = times.reduce((sum, t) => sum + t, 0) / times.length
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length
  return {
    mean: Math.round(mean),
    median: Math.round(sorted[Math.floor(sorted.length / 2)]),
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    stdDev: Math.round(Math.sqrt(variance)),
    count: times.length,
  }
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CognitiveTestClient() {
  const [tab, setTab] = useState<'reaction' | 'stroop' | 'dual' | 'summary'>('reaction')
  const [records, setRecords] = useState<Records>({ totalTests: 0 })
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => { setRecords(loadRecords()) }, [])

  function updateRecords(patch: Partial<Records>) {
    setRecords(prev => {
      const next = { ...prev, ...patch, lastTested: new Date().toISOString() }
      saveRecords(next)
      return next
    })
  }

  // ─────────────────────────────────────────────
  // 반응 속도 테스트
  // ─────────────────────────────────────────────
  type ReactionPhase = 'idle' | 'waiting' | 'go' | 'early' | 'result'
  const [rPhase, setRPhase] = useState<ReactionPhase>('idle')
  const [rTimes, setRTimes] = useState<number[]>([])
  const [rRound, setRRound] = useState<number>(0)
  const [rEarlyCount, setREarlyCount] = useState<number>(0)
  const rStartRef = useRef<number>(0)
  const rTimeoutRef = useRef<number | null>(null)

  const reactionStats = useMemo(() => {
    // warm-up (첫 1회) 제외
    if (rTimes.length === 0) return null
    const measured = rTimes.slice(1)  // first is warm-up
    return measured.length > 0 ? calcStats(measured) : calcStats(rTimes)
  }, [rTimes])

  function startReactionRound() {
    if (rTimeoutRef.current) clearTimeout(rTimeoutRef.current)
    setRPhase('waiting')
    const delay = 1500 + Math.random() * 3500
    rTimeoutRef.current = window.setTimeout(() => {
      rStartRef.current = performance.now()
      setRPhase('go')
    }, delay)
  }
  function reactionStageClick() {
    if (rPhase === 'idle' || rPhase === 'early') {
      startReactionRound()
    } else if (rPhase === 'waiting') {
      // 너무 빨리
      if (rTimeoutRef.current) clearTimeout(rTimeoutRef.current)
      setREarlyCount(c => c + 1)
      setRPhase('early')
    } else if (rPhase === 'go') {
      const time = performance.now() - rStartRef.current
      const newTimes = [...rTimes, time]
      setRTimes(newTimes)
      const newRound = rRound + 1
      setRRound(newRound)
      if (newRound >= ROUNDS.reaction) {
        // 결과
        setRPhase('result')
        const measured = newTimes.slice(1)  // first warm-up excluded
        if (measured.length > 0) {
          const mean = measured.reduce((a, b) => a + b, 0) / measured.length
          updateRecords({
            bestReaction: records.bestReaction === undefined
              ? Math.round(mean)
              : Math.min(records.bestReaction, Math.round(mean)),
            lastReaction: Math.round(mean),
            totalTests: records.totalTests + 1,
          })
        }
      } else {
        setRPhase('idle')
      }
    }
  }
  function resetReaction() {
    if (rTimeoutRef.current) clearTimeout(rTimeoutRef.current)
    setRPhase('idle')
    setRTimes([])
    setRRound(0)
    setREarlyCount(0)
  }
  useEffect(() => {
    return () => { if (rTimeoutRef.current) clearTimeout(rTimeoutRef.current) }
  }, [])

  // ─────────────────────────────────────────────
  // 스트룹 테스트
  // ─────────────────────────────────────────────
  type StroopTrial = { textName: string; textColorName: string; textColorCode: string; congruent: boolean; rt?: number; correct?: boolean }
  const [sPhase, setSPhase] = useState<'idle' | 'running' | 'result'>('idle')
  const [sTrials, setSTrials] = useState<StroopTrial[]>([])
  const [sIdx, setSIdx] = useState<number>(0)
  const [sFlash, setSFlash] = useState<'correct' | 'wrong' | ''>('')
  const sStartRef = useRef<number>(0)

  function generateStroop(): StroopTrial[] {
    const trials: StroopTrial[] = []
    const half = Math.floor(ROUNDS.stroop / 2)
    for (let i = 0; i < half; i++) {
      const c = STROOP_COLORS[Math.floor(Math.random() * 6)]
      trials.push({ textName: c.name, textColorName: c.name, textColorCode: c.code, congruent: true })
    }
    for (let i = 0; i < ROUNDS.stroop - half; i++) {
      const text = STROOP_COLORS[Math.floor(Math.random() * 6)]
      let color = STROOP_COLORS[Math.floor(Math.random() * 6)]
      while (color.name === text.name) color = STROOP_COLORS[Math.floor(Math.random() * 6)]
      trials.push({ textName: text.name, textColorName: color.name, textColorCode: color.code, congruent: false })
    }
    return trials.sort(() => Math.random() - 0.5)
  }
  function startStroop() {
    setSTrials(generateStroop())
    setSIdx(0)
    setSPhase('running')
    sStartRef.current = performance.now()
  }
  function answerStroop(chosen: string) {
    const trial = sTrials[sIdx]
    const rt = performance.now() - sStartRef.current
    const correct = chosen === trial.textColorName
    setSFlash(correct ? 'correct' : 'wrong')
    const newTrials = [...sTrials]
    newTrials[sIdx] = { ...trial, rt, correct }
    setSTrials(newTrials)
    setTimeout(() => {
      setSFlash('')
      const next = sIdx + 1
      if (next >= ROUNDS.stroop) {
        setSPhase('result')
        // 기록 저장
        const cong = newTrials.filter(t => t.congruent && t.correct).map(t => t.rt ?? 0)
        const inc = newTrials.filter(t => !t.congruent && t.correct).map(t => t.rt ?? 0)
        if (cong.length > 0 && inc.length > 0) {
          const congMean = cong.reduce((a, b) => a + b, 0) / cong.length
          const incMean = inc.reduce((a, b) => a + b, 0) / inc.length
          const interference = Math.round(incMean - congMean)
          updateRecords({
            bestStroopInterference: records.bestStroopInterference === undefined
              ? interference
              : Math.min(records.bestStroopInterference, interference),
            lastStroop: interference,
            totalTests: records.totalTests + 1,
          })
        }
      } else {
        setSIdx(next)
        sStartRef.current = performance.now()
      }
    }, 250)
  }
  function resetStroop() {
    setSPhase('idle')
    setSTrials([])
    setSIdx(0)
  }
  const stroopStats = useMemo(() => {
    if (sTrials.length === 0 || sPhase !== 'result') return null
    const cong = sTrials.filter(t => t.congruent && t.correct).map(t => t.rt ?? 0)
    const inc = sTrials.filter(t => !t.congruent && t.correct).map(t => t.rt ?? 0)
    const congCorrect = sTrials.filter(t => t.congruent && t.correct).length
    const congTotal = sTrials.filter(t => t.congruent).length
    const incCorrect = sTrials.filter(t => !t.congruent && t.correct).length
    const incTotal = sTrials.filter(t => !t.congruent).length
    if (cong.length === 0 || inc.length === 0) return null
    const congMean = cong.reduce((a, b) => a + b, 0) / cong.length
    const incMean = inc.reduce((a, b) => a + b, 0) / inc.length
    return {
      congMean: Math.round(congMean),
      incMean: Math.round(incMean),
      interference: Math.round(incMean - congMean),
      congAcc: Math.round((congCorrect / congTotal) * 100),
      incAcc: Math.round((incCorrect / incTotal) * 100),
    }
  }, [sTrials, sPhase])

  // ─────────────────────────────────────────────
  // 이중 과제
  // ─────────────────────────────────────────────
  type DualTrial = { num: number; hasDot: boolean; userAns?: 'odd' | 'even'; userDot?: boolean; rt?: number; numCorrect?: boolean; dotCorrect?: boolean }
  const [dPhase, setDPhase] = useState<'idle' | 'single' | 'doubleStart' | 'double' | 'result'>('idle')
  const [dTrials, setDTrials] = useState<DualTrial[]>([])
  const [dIdx, setDIdx] = useState<number>(0)
  const [dDotPressed, setDDotPressed] = useState<boolean>(false)
  const dStartRef = useRef<number>(0)

  function generateDual(count: number, withDot: boolean): DualTrial[] {
    const trials: DualTrial[] = []
    for (let i = 0; i < count; i++) {
      const num = 1 + Math.floor(Math.random() * 9)  // 1~9
      const hasDot = withDot ? Math.random() < 0.5 : false
      trials.push({ num, hasDot })
    }
    return trials
  }

  function startDualSingle() {
    setDTrials(generateDual(ROUNDS.dualSingle, false))
    setDIdx(0)
    setDPhase('single')
    setDDotPressed(false)
    dStartRef.current = performance.now()
  }
  function startDualDouble() {
    const all = [...dTrials.slice(0, ROUNDS.dualSingle), ...generateDual(ROUNDS.dualDouble, true)]
    setDTrials(all)
    setDIdx(ROUNDS.dualSingle)
    setDPhase('double')
    setDDotPressed(false)
    dStartRef.current = performance.now()
  }

  const answerDual = useCallback((ans: 'odd' | 'even') => {
    setDTrials(prev => {
      if (dIdx >= prev.length) return prev
      const trial = prev[dIdx]
      if (trial.userAns) return prev  // already answered
      const rt = performance.now() - dStartRef.current
      const numCorrect = (trial.num % 2 === 1 && ans === 'odd') || (trial.num % 2 === 0 && ans === 'even')
      const dotCorrect = trial.hasDot ? dDotPressed : !dDotPressed
      const newTrials = [...prev]
      newTrials[dIdx] = { ...trial, userAns: ans, userDot: dDotPressed, rt, numCorrect, dotCorrect }
      return newTrials
    })
    setTimeout(() => {
      setDDotPressed(false)
      const next = dIdx + 1
      const total = dPhase === 'single' ? ROUNDS.dualSingle : ROUNDS.dualSingle + ROUNDS.dualDouble
      if (next >= total) {
        if (dPhase === 'single') {
          setDPhase('doubleStart')
        } else {
          setDPhase('result')
          // 기록 저장
          setTimeout(() => {
            setDTrials(curr => {
              const single = curr.slice(0, ROUNDS.dualSingle).filter(t => t.numCorrect).map(t => t.rt ?? 0)
              const dbl = curr.slice(ROUNDS.dualSingle).filter(t => t.numCorrect).map(t => t.rt ?? 0)
              if (single.length > 0 && dbl.length > 0) {
                const sm = single.reduce((a, b) => a + b, 0) / single.length
                const dm = dbl.reduce((a, b) => a + b, 0) / dbl.length
                const interferencePct = Math.round(((dm - sm) / sm) * 100)
                updateRecords({
                  bestDualInterference: records.bestDualInterference === undefined
                    ? interferencePct
                    : Math.min(records.bestDualInterference, interferencePct),
                  lastDual: interferencePct,
                  totalTests: records.totalTests + 1,
                })
              }
              return curr
            })
          }, 50)
        }
      } else {
        setDIdx(next)
        dStartRef.current = performance.now()
      }
    }, 200)
  }, [dIdx, dPhase, dDotPressed, records, updateRecords])  // eslint-disable-line react-hooks/exhaustive-deps

  // 키보드 핸들러 (이중 과제)
  useEffect(() => {
    if (dPhase !== 'single' && dPhase !== 'double') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        answerDual('odd')
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        answerDual('even')
      } else if (e.key === ' ' && dPhase === 'double') {
        e.preventDefault()
        setDDotPressed(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dPhase, answerDual])

  function resetDual() {
    setDPhase('idle')
    setDTrials([])
    setDIdx(0)
    setDDotPressed(false)
  }

  const dualStats = useMemo(() => {
    if (dPhase !== 'result' || dTrials.length === 0) return null
    const single = dTrials.slice(0, ROUNDS.dualSingle)
    const dbl = dTrials.slice(ROUNDS.dualSingle)
    const singleRT = single.filter(t => t.numCorrect).map(t => t.rt ?? 0)
    const dblRT = dbl.filter(t => t.numCorrect).map(t => t.rt ?? 0)
    const singleAcc = single.filter(t => t.numCorrect).length / single.length
    const dblAcc = dbl.filter(t => t.numCorrect).length / dbl.length
    const dotAcc = dbl.filter(t => t.dotCorrect).length / dbl.length
    if (singleRT.length === 0 || dblRT.length === 0) return null
    const sm = singleRT.reduce((a, b) => a + b, 0) / singleRT.length
    const dm = dblRT.reduce((a, b) => a + b, 0) / dblRT.length
    return {
      singleMean: Math.round(sm),
      dualMean: Math.round(dm),
      interferenceMs: Math.round(dm - sm),
      interferencePct: Math.round(((dm - sm) / sm) * 100),
      singleAcc: Math.round(singleAcc * 100),
      dualAcc: Math.round(dblAcc * 100),
      dotAcc: Math.round(dotAcc * 100),
    }
  }, [dPhase, dTrials])

  // ─────────────────────────────────────────────
  // 종합 점수 (탭 4)
  // ─────────────────────────────────────────────
  const totalScore = useMemo(() => {
    let score = 0
    let count = 0
    if (records.lastReaction !== undefined) {
      // 반응속도 점수: 200ms=100, 350ms=0
      const r = Math.max(0, Math.min(100, ((350 - records.lastReaction) / 150) * 100))
      score += r; count++
    }
    if (records.lastStroop !== undefined) {
      // 스트룹 간섭: 0ms=100, 500ms=0
      const r = Math.max(0, Math.min(100, ((500 - records.lastStroop) / 500) * 100))
      score += r; count++
    }
    if (records.lastDual !== undefined) {
      // 이중 과제 간섭률: 0%=100, 50%=0
      const r = Math.max(0, Math.min(100, ((50 - records.lastDual) / 50) * 100))
      score += r; count++
    }
    if (count === 0) return null
    return Math.round(score / count)
  }, [records])

  function clearRecords() {
    if (!confirm('모든 기록을 삭제하시겠습니까?')) return
    const empty = { totalTests: 0 }
    setRecords(empty)
    saveRecords(empty)
  }

  async function copyShare() {
    const lines = [
      `🧠 인지 능력 테스트 결과`,
      ``,
      records.lastReaction !== undefined ? `🚀 반응속도: ${records.lastReaction}ms` : `🚀 반응속도: 미측정`,
      records.lastStroop   !== undefined ? `🎨 스트룹 간섭: +${records.lastStroop}ms` : `🎨 스트룹 간섭: 미측정`,
      records.lastDual     !== undefined ? `🔄 이중 과제 간섭: +${records.lastDual}%` : `🔄 이중 과제 간섭: 미측정`,
      ``,
      totalScore !== null ? `종합 점수: ${totalScore} / 100` : '',
      `※ 게임형 참고 지표 — 의학 진단 X`,
      ``,
      `https://youtil.kr/tools/edu/cognitive-test`,
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(lines)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 의료 면책 */}
      <div className={s.medicalDisclaimer}>
        <strong>ℹ️ 본 도구는 인지 심리학 게임을 시각화한 참고용 도구입니다.</strong> 의학적 진단·평가가 아니며, 실제 인지 능력은 다음에 따라 다릅니다:
        <ul>
          <li>수면·피로·스트레스·집중도</li>
          <li>기기 성능·입력 지연·모니터 주사율 (60Hz vs 144Hz)</li>
          <li>시간대·주변 환경</li>
        </ul>
        <strong>ADHD·인지 장애·치매 등 진단은 신경과·정신건강의학과 전문의</strong>에게 받으세요. 본 결과로 자가 진단하지 마세요.
      </div>

      {/* 디바이스 안내 */}
      <div className={s.deviceNote}>
        <strong>📱 모바일 안내:</strong> 모바일은 터치 지연으로 데스크탑보다 약 20~50ms 느릴 수 있습니다.
        정확한 측정은 마우스·키보드 사용을 권장합니다.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'reaction' ? s.tabActive : ''}`} onClick={() => setTab('reaction')}>반응 속도</button>
        <button className={`${s.tabBtn} ${tab === 'stroop'   ? s.tabActive : ''}`} onClick={() => setTab('stroop')}>스트룹 효과</button>
        <button className={`${s.tabBtn} ${tab === 'dual'     ? s.tabActive : ''}`} onClick={() => setTab('dual')}>이중 과제</button>
        <button className={`${s.tabBtn} ${tab === 'summary'  ? s.tabActive : ''}`} onClick={() => setTab('summary')}>종합·기록</button>
      </div>

      {/* ─── TAB 1: 반응 속도 ─── */}
      {tab === 'reaction' && (
        <>
          {rPhase === 'idle' && rTimes.length === 0 && (
            <div className={`${s.card} ${s.startCard}`}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🚀</p>
              <p className={s.startTitle}>반응 속도 테스트</p>
              <p className={s.startDesc}>
                <strong style={{ color: '#FF4444' }}>화면이 빨간색</strong>일 때는 기다리고,
                <br /><strong style={{ color: '#3EFF9B' }}>초록색으로 바뀌면 즉시 클릭</strong>하세요.
                <br />6회 측정 (첫 1회 warm-up 제외, 5회 평균)
              </p>
              <button className={s.startBtn} onClick={() => setRPhase('idle')}>아래 영역을 클릭하세요</button>
            </div>
          )}

          {rPhase !== 'result' && (
            <div
              className={`${s.reactionStage} ${
                rPhase === 'idle'    ? s.stageReady   :
                rPhase === 'waiting' ? s.stageWaiting :
                rPhase === 'go'      ? s.stageGo      :
                s.stageEarly
              }`}
              onClick={reactionStageClick}
            >
              {rPhase === 'idle' && (
                <>
                  <p className={s.stageBigText}>
                    {rTimes.length === 0 ? '여기를 클릭하면 시작' : `${rTimes.length}/${ROUNDS.reaction} 완료`}
                  </p>
                  <p className={s.stageSubText}>{rTimes.length === 0 ? '준비되면 클릭' : '다음 라운드 시작 — 클릭'}</p>
                </>
              )}
              {rPhase === 'waiting' && (
                <>
                  <p className={s.stageBigText}>🛑 기다리세요...</p>
                  <p className={s.stageSubText}>초록색으로 바뀌면 즉시 클릭</p>
                </>
              )}
              {rPhase === 'go' && (
                <>
                  <p className={s.stageBigText}>⚡ 지금!</p>
                  <p className={s.stageSubText}>클릭하세요</p>
                </>
              )}
              {rPhase === 'early' && (
                <>
                  <p className={s.stageBigText}>😅 너무 빨라요!</p>
                  <p className={s.stageSubText}>(early count: {rEarlyCount}) — 다시 클릭하세요</p>
                </>
              )}
            </div>
          )}

          {rTimes.length > 0 && rPhase !== 'result' && (
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${(rTimes.length / ROUNDS.reaction) * 100}%` }} />
            </div>
          )}

          {rPhase === 'result' && reactionStats && (() => {
            const grade = getReactionGrade(reactionStats.mean)
            const heroCls = grade.key === 'excellent' ? s.heroSafe : grade.key === 'fast' ? s.heroFast : grade.key === 'avg' ? s.heroAvg : grade.key === 'below' ? s.heroBelow : s.heroSlow
            return (
              <>
                <div className={`${s.hero} ${heroCls}`}>
                  <p className={s.heroLead}>평균 반응속도</p>
                  <div>
                    <span className={s.heroNum}>{reactionStats.mean}</span>
                    <span className={s.heroUnit}>ms</span>
                  </div>
                  <p className={s.heroBadge} style={{ background: `${grade.color}22`, color: grade.color }}>
                    {grade.emoji} {grade.label}
                  </p>
                  <p className={s.heroSub}>5회 평균 (warm-up 1회 제외) · 일반 성인 250~300ms</p>
                </div>

                <div className={s.card}>
                  <div className={s.cardLabel}><span>측정 통계</span></div>
                  <table className={s.statsTable}>
                    <tbody>
                      <tr><td>평균</td><td>{reactionStats.mean}ms</td></tr>
                      <tr><td>최고 (가장 빠름)</td><td style={{ color: '#3EFFD0' }}>{reactionStats.min}ms</td></tr>
                      <tr><td>최저 (가장 느림)</td><td style={{ color: '#FF8C3E' }}>{reactionStats.max}ms</td></tr>
                      <tr><td>중앙값</td><td>{reactionStats.median}ms</td></tr>
                      <tr><td>표준편차</td><td>{reactionStats.stdDev}ms</td></tr>
                      <tr><td>너무 빨리 누른 횟수</td><td>{rEarlyCount}회</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className={s.card}>
                  <div className={s.cardLabel}><span>등급별 참고 범위</span></div>
                  <div className={s.gradeList}>
                    {REACTION_GRADES.map(g => (
                      <div key={g.key} className={`${s.gradeRow} ${grade.key === g.key ? s.gradeRowActive : ''}`} style={{ color: g.color }}>
                        <span className={s.gradeEmoji}>{g.emoji}</span>
                        <span className={s.gradeLabel}>{g.label}</span>
                        <span className={s.gradeRange} style={{ color: g.color }}>{g.range[1] >= 9999 ? '351ms+' : `${g.range[0]}~${g.range[1]}ms`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={s.compareCard}>
                  💡 <strong>참고:</strong> F1 드라이버 약 <strong>200ms</strong> · 프로 게이머 <strong>180~220ms</strong> · 일반 성인 <strong>250ms</strong>.
                  실제 반응속도는 수면·피로·집중도·기기 성능에 따라 달라집니다.
                </div>

                <div className={s.actionRow}>
                  <button className={`${s.actionBtn} ${s.actionBtnPrimary}`} onClick={resetReaction}>🔄 다시 도전</button>
                  <button className={s.actionBtn} onClick={() => setTab('stroop')}>다음: 스트룹 효과 →</button>
                </div>
              </>
            )
          })()}
        </>
      )}

      {/* ─── TAB 2: 스트룹 ─── */}
      {tab === 'stroop' && (
        <>
          {sPhase === 'idle' && (
            <div className={`${s.card} ${s.startCard}`}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🎨</p>
              <p className={s.startTitle}>스트룹 효과 테스트</p>
              <p className={s.startDesc}>
                글자의 <strong style={{ color: '#FF6B6B' }}>의미가 아닌</strong> 글자 <strong style={{ color: '#3EFFD0' }}>색상</strong>을 선택하세요.
                <br />20회 시행 (일치 10회 + 불일치 10회)
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                예: <strong style={{ color: '#3E5BFF' }}>빨강</strong> → <strong style={{ color: '#3EFFD0' }}>파랑</strong> 선택 (글자 색이 파란색)
              </p>
              <button className={s.startBtn} onClick={startStroop}>테스트 시작</button>
            </div>
          )}

          {sPhase === 'running' && sTrials[sIdx] && (
            <>
              <div className={`${s.card} ${sFlash === 'correct' ? s.stroopFlash : sFlash === 'wrong' ? s.stroopFlashWrong : ''}`}>
                <p className={s.stroopInstruct}>글자 <strong>색상</strong>을 선택하세요 (의미 X)</p>
                <p className={s.stroopWord} style={{ color: sTrials[sIdx].textColorCode }}>
                  {sTrials[sIdx].textName}
                </p>
                <div className={s.stroopColorRow}>
                  {STROOP_COLORS.map(c => (
                    <button
                      key={c.name}
                      className={s.stroopColorBtn}
                      style={{ background: c.code }}
                      onClick={() => answerStroop(c.name)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.progressBar}>
                <div className={s.progressFill} style={{ width: `${((sIdx + 1) / ROUNDS.stroop) * 100}%` }} />
              </div>
              <p className={s.progressLabel}>{sIdx + 1} / {ROUNDS.stroop}</p>
            </>
          )}

          {sPhase === 'result' && stroopStats && (
            <>
              <div className={s.hero}>
                <p className={s.heroLead}>스트룹 간섭 시간</p>
                <div>
                  <span className={s.heroNum}>+{stroopStats.interference}</span>
                  <span className={s.heroUnit}>ms</span>
                </div>
                <p className={s.heroSub}>
                  불일치 조건이 일치 조건보다 <strong style={{ color: '#3EFFD0', fontFamily: 'Syne, sans-serif' }}>{stroopStats.interference}ms</strong> 느림
                  <br />일반 성인 범위: 150~400ms
                </p>
              </div>

              <div className={s.card}>
                <div className={s.cardLabel}><span>조건별 결과</span></div>
                <div className={s.barCompare}>
                  <div className={s.barRow}>
                    <span className={s.barLabel}>일치 (글자=색)</span>
                    <div className={s.barTrack}>
                      <div className={`${s.barFill} ${s.barCongruent}`} style={{ width: `${(stroopStats.congMean / Math.max(stroopStats.incMean, 1)) * 100}%` }} />
                    </div>
                    <span className={s.barValue}>{stroopStats.congMean}ms</span>
                  </div>
                  <div className={s.barRow}>
                    <span className={s.barLabel}>불일치</span>
                    <div className={s.barTrack}>
                      <div className={`${s.barFill} ${s.barIncongruent}`} style={{ width: '100%' }} />
                    </div>
                    <span className={s.barValue}>{stroopStats.incMean}ms</span>
                  </div>
                </div>
                <table className={s.statsTable} style={{ marginTop: 12 }}>
                  <tbody>
                    <tr><td>일치 정답률</td><td style={{ color: '#3EFFD0' }}>{stroopStats.congAcc}%</td></tr>
                    <tr><td>불일치 정답률</td><td style={{ color: '#FF8C3E' }}>{stroopStats.incAcc}%</td></tr>
                    <tr><td>간섭 시간</td><td style={{ color: '#FF8C3E' }}>+{stroopStats.interference}ms</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={s.interpretCard}>
                💡 <strong>스트룹 효과</strong>는 1935년 J.R. Stroop이 발견한 인지 간섭 현상입니다.
                글자 의미를 읽는 자동 처리가 색상 판단을 방해해 반응이 느려집니다.
                간섭이 적을수록 선택적 주의력과 실행 기능이 좋다고 알려져 있지만, 이는 임상 검사가 아닌 게임 결과이므로 참고만 하세요.
              </div>

              <div className={s.actionRow}>
                <button className={`${s.actionBtn} ${s.actionBtnPrimary}`} onClick={resetStroop}>🔄 다시 도전</button>
                <button className={s.actionBtn} onClick={() => setTab('dual')}>다음: 이중 과제 →</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── TAB 3: 이중 과제 ─── */}
      {tab === 'dual' && (
        <>
          {dPhase === 'idle' && (
            <div className={`${s.card} ${s.startCard}`}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🔄</p>
              <p className={s.startTitle}>이중 과제 테스트</p>
              <p className={s.startDesc}>
                <strong>1단계 (단일):</strong> 숫자가 표시되면 <strong>홀수/짝수</strong> 선택 (5회)
                <br /><strong>2단계 (이중):</strong> 같은 판단 + <strong style={{ color: '#FF4444' }}>빨간 점</strong>이 보이면 동시에 누름 (10회)
              </p>
              <button className={s.startBtn} onClick={startDualSingle}>테스트 시작</button>
            </div>
          )}

          {dPhase === 'doubleStart' && (
            <div className={`${s.card} ${s.startCard}`}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>2️⃣</p>
              <p className={s.startTitle}>2단계: 이중 과제</p>
              <p className={s.startDesc}>
                이번엔 <strong>홀수/짝수 판단</strong> + 좌측 상단에 <strong style={{ color: '#FF4444' }}>빨간 점</strong>이 나타나면 동시에 [빨간 점] 버튼 누르세요.
                <br />점이 없을 때는 누르지 마세요. 10회 시행.
              </p>
              <button className={s.startBtn} onClick={startDualDouble}>2단계 시작</button>
            </div>
          )}

          {(dPhase === 'single' || dPhase === 'double') && dTrials[dIdx] && (
            <>
              <div className={s.dualBoard}>
                {dPhase === 'double' && dTrials[dIdx].hasDot && <div className={s.redDot} />}
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                  {dPhase === 'single' ? '단일 과제' : '이중 과제 + 빨간 점 감지'}
                </p>
                <p className={s.dualNumber}>{dTrials[dIdx].num}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>홀수 또는 짝수?</p>
                <div className={s.dualButtons}>
                  <button className={`${s.dualBtn} ${s.dualBtnOdd}`}  onClick={() => answerDual('odd')}>홀수</button>
                  <button className={`${s.dualBtn} ${s.dualBtnEven}`} onClick={() => answerDual('even')}>짝수</button>
                </div>
                {dPhase === 'double' && (
                  <button
                    className={s.dualBtnRed}
                    style={{ opacity: dDotPressed ? 0.5 : 1 }}
                    onClick={() => setDDotPressed(true)}
                    disabled={dDotPressed}
                  >
                    {dDotPressed ? '✓ 빨간 점 감지함' : '🔴 빨간 점 보임'}
                  </button>
                )}
                <p className={s.dualKeyboardHint}>
                  키보드: <kbd>↑</kbd> 홀수 · <kbd>↓</kbd> 짝수
                  {dPhase === 'double' && <> · <kbd>Space</kbd> 빨간 점</>}
                </p>
              </div>
              <div className={s.progressBar}>
                <div className={s.progressFill} style={{ width: `${((dIdx + 1) / (ROUNDS.dualSingle + ROUNDS.dualDouble)) * 100}%` }} />
              </div>
              <p className={s.progressLabel}>
                {dPhase === 'single' ? `1단계 ${dIdx + 1}/${ROUNDS.dualSingle}` : `2단계 ${dIdx + 1 - ROUNDS.dualSingle}/${ROUNDS.dualDouble}`}
              </p>
            </>
          )}

          {dPhase === 'result' && dualStats && (
            <>
              <div className={s.hero}>
                <p className={s.heroLead}>멀티태스킹 간섭률</p>
                <div>
                  <span className={s.heroNum}>+{dualStats.interferencePct}</span>
                  <span className={s.heroUnit}>%</span>
                </div>
                <p className={s.heroSub}>
                  이중 과제에서 <strong style={{ color: '#3EFFD0', fontFamily: 'Syne, sans-serif' }}>{dualStats.interferenceMs}ms ({dualStats.interferencePct}%)</strong> 더 느려짐
                  <br />일반 성인 범위: 20~40%
                </p>
              </div>

              <div className={s.card}>
                <div className={s.cardLabel}><span>단일 vs 이중 비교</span></div>
                <div className={s.barCompare}>
                  <div className={s.barRow}>
                    <span className={s.barLabel}>단일 (숫자만)</span>
                    <div className={s.barTrack}>
                      <div className={`${s.barFill} ${s.barSingle}`} style={{ width: `${(dualStats.singleMean / Math.max(dualStats.dualMean, 1)) * 100}%` }} />
                    </div>
                    <span className={s.barValue}>{dualStats.singleMean}ms</span>
                  </div>
                  <div className={s.barRow}>
                    <span className={s.barLabel}>이중 (숫자+점)</span>
                    <div className={s.barTrack}>
                      <div className={`${s.barFill} ${s.barDual}`} style={{ width: '100%' }} />
                    </div>
                    <span className={s.barValue}>{dualStats.dualMean}ms</span>
                  </div>
                </div>
                <table className={s.statsTable} style={{ marginTop: 12 }}>
                  <tbody>
                    <tr><td>단일 정답률</td><td style={{ color: '#3EFFD0' }}>{dualStats.singleAcc}%</td></tr>
                    <tr><td>이중 정답률 (숫자)</td><td style={{ color: '#FF8C3E' }}>{dualStats.dualAcc}%</td></tr>
                    <tr><td>이중 정답률 (빨간 점)</td><td>{dualStats.dotAcc}%</td></tr>
                    <tr><td>간섭 시간</td><td style={{ color: '#FF8C3E' }}>+{dualStats.interferenceMs}ms</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={s.interpretCard}>
                💡 <strong>이중 과제 간섭</strong>은 두 작업을 동시에 수행할 때 인지 자원이 분산되는 정도입니다.
                연구에 따르면 진정한 멀티태스킹은 사실상 불가능하며, 뇌는 빠르게 작업을 전환할 뿐입니다(Task Switching).
                한 번에 한 작업에 집중할 때 효율이 가장 높습니다.
              </div>

              <div className={s.actionRow}>
                <button className={`${s.actionBtn} ${s.actionBtnPrimary}`} onClick={resetDual}>🔄 다시 도전</button>
                <button className={s.actionBtn} onClick={() => setTab('summary')}>결과 종합 →</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── TAB 4: 종합·기록 ─── */}
      {tab === 'summary' && (
        <>
          {/* 종합 점수 */}
          {totalScore !== null ? (
            <div className={s.totalScoreCard}>
              <p className={s.totalScoreLabel}>인지 처리 속도 점수</p>
              <div>
                <span className={s.totalScoreValue}>{totalScore}</span>
                <span className={s.totalScoreUnit}>/ 100</span>
              </div>
              <p className={s.totalScoreSub}>
                3가지 테스트 가중 평균 · <strong style={{ color: '#FF8C3E' }}>게임형 참고 지표 — 의학 진단 X</strong>
              </p>
            </div>
          ) : (
            <div className={s.card}>
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>
                3가지 테스트를 완료하면 종합 점수가 표시됩니다.
              </p>
            </div>
          )}

          {/* 3가지 결과 한눈에 */}
          <div className={s.summaryGrid}>
            <div className={`${s.summaryCard} ${records.lastReaction === undefined ? s.summaryEmpty : ''}`}>
              <p className={s.summaryEmoji}>🚀</p>
              <p className={s.summaryLabel}>반응 속도</p>
              <p className={s.summaryValue}>
                {records.lastReaction !== undefined ? records.lastReaction : '-'}<span className={s.summaryUnit}>ms</span>
              </p>
              <p className={s.summaryStatus}>
                {records.lastReaction !== undefined ? getReactionGrade(records.lastReaction).label : '미측정'}
              </p>
            </div>
            <div className={`${s.summaryCard} ${records.lastStroop === undefined ? s.summaryEmpty : ''}`}>
              <p className={s.summaryEmoji}>🎨</p>
              <p className={s.summaryLabel}>스트룹 간섭</p>
              <p className={s.summaryValue}>
                {records.lastStroop !== undefined ? `+${records.lastStroop}` : '-'}<span className={s.summaryUnit}>ms</span>
              </p>
              <p className={s.summaryStatus}>
                {records.lastStroop !== undefined
                  ? records.lastStroop < 200 ? '낮음 (좋음)' : records.lastStroop < 400 ? '평균' : '높음'
                  : '미측정'}
              </p>
            </div>
            <div className={`${s.summaryCard} ${records.lastDual === undefined ? s.summaryEmpty : ''}`}>
              <p className={s.summaryEmoji}>🔄</p>
              <p className={s.summaryLabel}>이중 과제 간섭</p>
              <p className={s.summaryValue}>
                {records.lastDual !== undefined ? `+${records.lastDual}` : '-'}<span className={s.summaryUnit}>%</span>
              </p>
              <p className={s.summaryStatus}>
                {records.lastDual !== undefined
                  ? records.lastDual < 25 ? '낮음 (좋음)' : records.lastDual < 40 ? '평균' : '높음'
                  : '미측정'}
              </p>
            </div>
          </div>

          {/* 최고 기록 */}
          <div className={s.recordCard}>
            <p className={s.recordTitle}>🏆 내 최고 기록</p>
            {records.bestReaction === undefined && records.bestStroopInterference === undefined && records.bestDualInterference === undefined ? (
              <p className={s.recordEmpty}>아직 기록이 없습니다.</p>
            ) : (
              <>
                {records.bestReaction !== undefined && (
                  <div className={s.recordRow}>
                    <span>🚀 반응 속도 최고</span>
                    <strong>{records.bestReaction}ms</strong>
                  </div>
                )}
                {records.bestStroopInterference !== undefined && (
                  <div className={s.recordRow}>
                    <span>🎨 스트룹 최저 간섭</span>
                    <strong>+{records.bestStroopInterference}ms</strong>
                  </div>
                )}
                {records.bestDualInterference !== undefined && (
                  <div className={s.recordRow}>
                    <span>🔄 이중 과제 최저 간섭</span>
                    <strong>+{records.bestDualInterference}%</strong>
                  </div>
                )}
                <div className={s.recordRow}>
                  <span>📊 총 테스트 횟수</span>
                  <strong>{records.totalTests}회</strong>
                </div>
                {records.lastTested && (
                  <div className={s.recordRow}>
                    <span>🕐 마지막 테스트</span>
                    <strong>{new Date(records.lastTested).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}</strong>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 공유 카드 */}
          {totalScore !== null && (
            <div className={s.shareCard}>
              <p className={s.shareTitle}>🧠 내 인지 능력 결과</p>
              <div className={s.shareList}>
                {records.lastReaction !== undefined && (
                  <div className={s.shareItem}><span>🚀 반응 속도</span><strong>{records.lastReaction}ms</strong></div>
                )}
                {records.lastStroop !== undefined && (
                  <div className={s.shareItem}><span>🎨 스트룹 간섭</span><strong>+{records.lastStroop}ms</strong></div>
                )}
                {records.lastDual !== undefined && (
                  <div className={s.shareItem}><span>🔄 이중 과제 간섭</span><strong>+{records.lastDual}%</strong></div>
                )}
              </div>
              <div className={s.shareScore}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>종합 점수</p>
                <p className={s.shareScoreNum}>{totalScore} <small style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>/ 100</small></p>
              </div>
              <div className={s.shareWatermark}>youtil.kr 🧠</div>
            </div>
          )}

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyShare} type="button">
            {copied ? '✓ 복사됨 — SNS에 붙여넣기' : '결과 공유 텍스트 복사'}
          </button>

          {records.totalTests > 0 && (
            <div className={s.actionRow}>
              <button className={`${s.actionBtn} ${s.actionBtnPrimary}`} onClick={() => setTab('reaction')}>다시 테스트하기</button>
              <button className={s.actionBtn} onClick={clearRecords}>⚠️ 기록 초기화</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
