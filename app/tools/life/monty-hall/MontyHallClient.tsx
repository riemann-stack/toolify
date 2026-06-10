'use client'

import { useRef, useState } from 'react'
import styles from './monty-hall.module.css'

// ── 타입 ─────────────────────────────────
type Tab = 'play' | 'sim' | 'why'
type Phase = 'choose' | 'decide' | 'reveal'
type Speed = 'slow' | 'normal' | 'fast'

// ── 단일 시뮬레이션 ──────────────────────
function pickHostDoor(carDoor: number, playerChoice: number): number {
  const avail = [0, 1, 2].filter(d => d !== carDoor && d !== playerChoice)
  return avail[Math.floor(Math.random() * avail.length)]
}

function simulatePair(): { switchWin: boolean; stayWin: boolean } {
  const car = Math.floor(Math.random() * 3)
  const pick = Math.floor(Math.random() * 3)
  const opened = pickHostDoor(car, pick)
  const switched = [0, 1, 2].find(d => d !== pick && d !== opened)!
  return { switchWin: switched === car, stayWin: pick === car }
}

// ── N문 표준 몬티홀 시뮬 (진행자 N-2개 염소 공개) ──
function simulateNDoors(N: number): { switchWin: boolean; stayWin: boolean } {
  const car = Math.floor(Math.random() * N)
  const pick = Math.floor(Math.random() * N)
  // 진행자가 N-2개 염소 공개. 마지막 1개 = switch 대상
  // pick === car이면 switchedDoor는 무작위 다른 문 (염소)
  // pick !== car이면 switchedDoor === car
  let switched: number
  if (pick === car) {
    // 자동차 골랐음 — switch 대상은 무작위 염소 (뭐가 됐든 패배)
    const others = []
    for (let d = 0; d < N; d++) if (d !== pick) others.push(d)
    switched = others[Math.floor(Math.random() * others.length)]
  } else {
    switched = car
  }
  return { switchWin: switched === car, stayWin: pick === car }
}

// ── 변형 규칙 (3문) ──
type VariantId = 'standard' | 'random-host' | 'evil-monty'

type VariantInfo = {
  id: VariantId
  emoji: string
  name: string
  desc: string
  switchTheory: number  // 0~1
  stayTheory: number
}

const VARIANTS: VariantInfo[] = [
  { id: 'standard', emoji: '🟢', name: '표준 몬티홀',
    desc: '진행자가 자동차 위치를 알고 의도적으로 염소 문을 공개. 본 문제.',
    switchTheory: 2/3, stayTheory: 1/3 },
  { id: 'random-host', emoji: '🟡', name: '무작위 공개 (= 몬티 폴)',
    desc: '진행자가 위치를 모르고 아무 문이나 엶 — 또는 우연히 염소가 열림(‘몬티 폴’). 자동차가 나오면 무효. 두 이야기 모두 수학적으로 같은 50:50.',
    switchTheory: 1/2, stayTheory: 1/2 },
  { id: 'evil-monty', emoji: '🔴', name: '악마 몬티',
    desc: '진행자가 참가자가 자동차를 골랐을 때만 염소 공개. 함정 → 바꾸면 100% 패배.',
    switchTheory: 0, stayTheory: 1 },
]

// 변형 규칙 시뮬 (3문 고정)
function simulateVariant(variant: VariantId): { switchWin: boolean; stayWin: boolean; valid: boolean } {
  const car = Math.floor(Math.random() * 3)
  const pick = Math.floor(Math.random() * 3)

  if (variant === 'standard') {
    const opened = pickHostDoor(car, pick)
    const switched = [0, 1, 2].find(d => d !== pick && d !== opened)!
    return { switchWin: switched === car, stayWin: pick === car, valid: true }
  }

  if (variant === 'random-host') {
    // 진행자가 위치를 모르고 안 고른 2개 중 1개 무작위 (자동차일 수도) — 자동차가 나오면 무효.
    // '무작위 진행자'와 '몬티 폴'은 같은 조건부 확률 실험이므로 하나로 통합.
    const available = [0, 1, 2].filter(d => d !== pick)
    const opened = available[Math.floor(Math.random() * available.length)]
    if (opened === car) return { switchWin: false, stayWin: false, valid: false }
    const switched = [0, 1, 2].find(d => d !== pick && d !== opened)!
    return { switchWin: switched === car, stayWin: pick === car, valid: true }
  }

  // evil-monty
  if (variant === 'evil-monty') {
    // 참가자가 자동차 안 골랐으면 진행자가 게임 종료 (선택권 없음)
    if (pick !== car) return { switchWin: false, stayWin: false, valid: false }
    // 자동차 골랐을 때만 염소 공개 (함정)
    const opened = pickHostDoor(car, pick)
    const switched = [0, 1, 2].find(d => d !== pick && d !== opened)!
    return { switchWin: switched === car, stayWin: pick === car, valid: true }
  }

  return { switchWin: false, stayWin: false, valid: false }
}

// 로그 스페이스 체크포인트
function getCheckpoints(n: number): number[] {
  const base = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 100, 150, 200, 300, 500, 700,
                1000, 1500, 2000, 3000, 5000, 7000, 10000]
  const pts = base.filter(x => x <= n)
  if (!pts.includes(n)) pts.push(n)
  return pts
}

// ──────────────────────────────────────
export default function MontyHallClient() {
  const [tab, setTab] = useState<Tab>('play')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist" aria-label="몬티 홀 모드">
        <button type="button" role="tab" id="mh-tab-play" aria-controls="mh-panel-play" aria-selected={tab === 'play'} className={`${styles.tab} ${tab === 'play' ? styles.tabActive : ''}`} onClick={() => setTab('play')}>🎮 직접 해보기</button>
        <button type="button" role="tab" id="mh-tab-sim" aria-controls="mh-panel-sim" aria-selected={tab === 'sim'} className={`${styles.tab} ${tab === 'sim' ? styles.tabActive : ''}`} onClick={() => setTab('sim')}>⚡ 자동 시뮬레이션</button>
        <button type="button" role="tab" id="mh-tab-why" aria-controls="mh-panel-why" aria-selected={tab === 'why'} className={`${styles.tab} ${tab === 'why' ? styles.tabActive : ''}`} onClick={() => setTab('why')}>💡 왜 바꿔야 할까?</button>
      </div>

      {/* 탭을 모두 마운트한 채 숨김 토글 — 전환해도 플레이 전적·시뮬 설정/결과 유지 */}
      <div role="tabpanel" id="mh-panel-play" aria-labelledby="mh-tab-play" hidden={tab !== 'play'}><PlayTab /></div>
      <div role="tabpanel" id="mh-panel-sim" aria-labelledby="mh-tab-sim" hidden={tab !== 'sim'}><SimTab /></div>
      <div role="tabpanel" id="mh-panel-why" aria-labelledby="mh-tab-why" hidden={tab !== 'why'}><WhyTab /></div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 1: 직접 해보기
// ═══════════════════════════════════════
function PlayTab() {
  const [phase, setPhase] = useState<Phase>('choose')
  const [carDoor, setCarDoor] = useState<number>(() => Math.floor(Math.random() * 3))
  const [playerChoice, setPlayerChoice] = useState<number | null>(null)
  const [openedDoor, setOpenedDoor] = useState<number | null>(null)
  const [finalChoice, setFinalChoice] = useState<number | null>(null)
  const [usedStrategy, setUsedStrategy] = useState<'switch' | 'stay' | null>(null)

  const [stats, setStats] = useState({ switchWin: 0, switchLose: 0, stayWin: 0, stayLose: 0 })

  function choose(door: number) {
    if (phase !== 'choose') return
    setPlayerChoice(door)
    const opened = pickHostDoor(carDoor, door)
    setOpenedDoor(opened)
    setPhase('decide')
  }

  function decide(strat: 'switch' | 'stay') {
    if (phase !== 'decide' || playerChoice === null || openedDoor === null) return
    const finalD = strat === 'switch'
      ? [0, 1, 2].find(d => d !== playerChoice && d !== openedDoor)!
      : playerChoice
    setFinalChoice(finalD)
    setUsedStrategy(strat)
    const won = finalD === carDoor
    setStats(s => ({
      ...s,
      switchWin:  s.switchWin  + (strat === 'switch' && won ? 1 : 0),
      switchLose: s.switchLose + (strat === 'switch' && !won ? 1 : 0),
      stayWin:    s.stayWin    + (strat === 'stay' && won ? 1 : 0),
      stayLose:   s.stayLose   + (strat === 'stay' && !won ? 1 : 0),
    }))
    setPhase('reveal')
  }

  function resetRound() {
    setCarDoor(Math.floor(Math.random() * 3))
    setPlayerChoice(null)
    setOpenedDoor(null)
    setFinalChoice(null)
    setUsedStrategy(null)
    setPhase('choose')
  }

  function resetAll() {
    resetRound()
    setStats({ switchWin: 0, switchLose: 0, stayWin: 0, stayLose: 0 })
  }

  const totalPlays = stats.switchWin + stats.switchLose + stats.stayWin + stats.stayLose
  const switchTotal = stats.switchWin + stats.switchLose
  const stayTotal = stats.stayWin + stats.stayLose
  const switchRate = switchTotal > 0 ? (stats.switchWin / switchTotal) * 100 : 0
  const stayRate = stayTotal > 0 ? (stats.stayWin / stayTotal) * 100 : 0

  const won = finalChoice === carDoor

  return (
    <div className={styles.panel}>
      {/* 안내 */}
      <div className={styles.guideCard}>
        <p className={styles.guideStep}>
          {phase === 'choose'  && '① 자동차는 문 중 하나 뒤에 있습니다. 문을 고르세요.'}
          {phase === 'decide'  && `② 사회자가 문 ${openedDoor! + 1}을 열었습니다. 염소가 있네요! 선택을 바꾸시겠습니까?`}
          {phase === 'reveal'  && (won ? '🎉 자동차 당첨!' : '😅 염소네요...')}
        </p>
      </div>

      {/* 문 */}
      <div className={styles.doorsRow}>
        {[0, 1, 2].map(d => {
          const isPicked = playerChoice === d
          const isOpened = openedDoor === d
          const isFinal = finalChoice === d
          const isRevealed = phase === 'reveal'
          const hasCar = d === carDoor

          let stateClass = ''
          if (phase === 'choose' && isPicked) stateClass = styles.doorSelected
          else if (phase === 'decide') {
            if (isPicked) stateClass = styles.doorSelected
            if (isOpened) stateClass = styles.doorOpened
          } else if (phase === 'reveal') {
            if (isOpened) stateClass = styles.doorOpened
            else if (isFinal && hasCar) stateClass = styles.doorWin
            else if (isFinal && !hasCar) stateClass = styles.doorLose
            else if (hasCar) stateClass = styles.doorCar
          }

          const stateLabel = isOpened ? ', 사회자가 연 염소 문'
            : isRevealed ? (hasCar ? ', 자동차' : ', 염소')
            : isPicked ? ', 내 선택' : ''
          return (
            <button
              key={d}
              type="button"
              onClick={() => phase === 'choose' ? choose(d) : undefined}
              disabled={phase !== 'choose'}
              className={`${styles.door} ${stateClass}`}
              aria-label={`문 ${d + 1}${stateLabel}`}
            >
              <span className={styles.doorNum}>{d + 1}</span>
              <span className={styles.doorIcon}>
                {isOpened ? '🐐'
                  : isRevealed ? (hasCar ? '🚗' : '🐐')
                  : '🚪'}
              </span>
            </button>
          )
        })}
      </div>

      {/* 결정 버튼 */}
      {phase === 'decide' && (
        <div className={styles.decideRow}>
          <button type="button" className={styles.decideSwitch} onClick={() => decide('switch')}>
            🔄 바꾸기
          </button>
          <button type="button" className={styles.decideStay} onClick={() => decide('stay')}>
            🎯 유지하기
          </button>
        </div>
      )}

      {/* 결과 */}
      {phase === 'reveal' && (
        <div className={`${styles.resultCard} ${won ? styles.resultWin : styles.resultLose}`}>
          <p className={styles.resultTitle}>
            {won ? '🎉 자동차 당첨!' : '😅 염소네요...'}
          </p>
          <p className={styles.resultSub}>
            선택 전략: <strong>{usedStrategy === 'switch' ? '바꾸기' : '유지'} 전략</strong>
          </p>
          <button type="button" className={styles.againBtn} onClick={resetRound}>
            다시 하기 →
          </button>
        </div>
      )}

      {/* 통계 */}
      {totalPlays > 0 && (
        <div className={styles.statsCard}>
          <div className={styles.statsHead}>
            <p className={styles.statsTitle}>내 전적</p>
            <span className={styles.statsTotal}>{totalPlays}회 플레이</span>
            <button type="button" className={styles.statsReset} onClick={resetAll}>기록 초기화</button>
          </div>
          <div className={styles.statsGrid}>
            <StatsRow
              label="🔄 바꾸기 전략"
              win={stats.switchWin}
              lose={stats.switchLose}
              rate={switchRate}
              color="var(--accent)"
              theory={66.7}
            />
            <StatsRow
              label="🎯 유지 전략"
              win={stats.stayWin}
              lose={stats.stayLose}
              rate={stayRate}
              color="#0891B2"
              theory={33.3}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatsRow({ label, win, lose, rate, color, theory }: {
  label: string; win: number; lose: number; rate: number; color: string; theory: number
}) {
  const total = win + lose
  return (
    <div className={styles.statsRow}>
      <div className={styles.statsRowHead}>
        <span className={styles.statsLabel}>{label}</span>
        <span className={styles.statsDetail}>
          {win}승 {lose}패 ({total}회)
        </span>
      </div>
      <div className={styles.statsBarBg}>
        <div className={styles.statsBarFill} style={{ width: `${rate}%`, background: color }} />
        <div className={styles.statsTheoryMark} style={{ left: `${theory}%` }} title={`이론값 ${theory}%`} />
      </div>
      <div className={styles.statsRate}>
        <span className={styles.statsRateVal} style={{ color }}>{rate.toFixed(1)}%</span>
        <span className={styles.statsRateTheory}>이론 {theory}%</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 2: 자동 시뮬레이션
// ═══════════════════════════════════════
function SimTab() {
  const [n, setN] = useState(1000)
  const [doorCount, setDoorCount] = useState(3)
  const [variant, setVariant] = useState<VariantId>('standard')
  const [speed, setSpeed] = useState<Speed>('fast')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    switchWin: number; stayWin: number; n: number; doors: number; variant: VariantId
    attempted: number; validTrials: number; stopped: boolean
    curveSwitch: { x: number; y: number }[]; curveStay: { x: number; y: number }[]
    switchTheory: number; stayTheory: number
  } | null>(null)
  const cancelRef = useRef(false)
  const [copied, setCopied] = useState(false)

  // 설정을 바꾸면 이전 결과를 지운다 (상단 이론값과 하단 결과가 어긋나는 것 방지)
  function clearResult() { setResult(null); setProgress(0) }
  function changeVariant(v: VariantId) { setVariant(v); clearResult() }
  function changeDoorCount(d: number) { setDoorCount(d); clearResult() }
  function changeN(v: number) { setN(v); clearResult() }

  // 변형 규칙 선택 시 N=3으로 잠금
  const isVariantMode = variant !== 'standard'
  const effectiveDoors = isVariantMode ? 3 : doorCount

  // 이론값 계산
  const switchTheory = isVariantMode
    ? VARIANTS.find(v => v.id === variant)!.switchTheory * 100
    : ((effectiveDoors - 1) / effectiveDoors) * 100
  const stayTheory = isVariantMode
    ? VARIANTS.find(v => v.id === variant)!.stayTheory * 100
    : (1 / effectiveDoors) * 100

  async function runSim() {
    setRunning(true)
    setProgress(0)
    setResult(null)
    cancelRef.current = false

    const checkpoints = new Set(getCheckpoints(n))
    const curveSwitch: { x: number; y: number }[] = []
    const curveStay: { x: number; y: number }[] = []

    let switchWin = 0
    let stayWin = 0
    let validTrials = 0
    let attempted = 0

    const delay = speed === 'slow' ? 30 : speed === 'normal' ? 5 : 0
    const batchSize = speed === 'slow' ? 1 : speed === 'normal' ? 20 : 500

    for (let i = 0; i < n; i += batchSize) {
      if (cancelRef.current) break
      const end = Math.min(n, i + batchSize)
      for (let j = i; j < end; j++) {
        let valid = true
        let switchHit = false
        let stayHit = false
        if (isVariantMode) {
          const r = simulateVariant(variant)
          valid = r.valid
          switchHit = r.switchWin
          stayHit = r.stayWin
        } else if (effectiveDoors === 3) {
          const r = simulatePair()
          switchHit = r.switchWin
          stayHit = r.stayWin
        } else {
          const r = simulateNDoors(effectiveDoors)
          switchHit = r.switchWin
          stayHit = r.stayWin
        }
        if (valid) {
          validTrials++
          if (switchHit) switchWin++
          if (stayHit) stayWin++
        }
        if (checkpoints.has(j + 1) && validTrials > 0) {
          curveSwitch.push({ x: j + 1, y: (switchWin / validTrials) * 100 })
          curveStay.push({ x: j + 1, y: (stayWin / validTrials) * 100 })
        }
      }
      attempted = end
      setProgress(end)
      if (delay > 0) await new Promise(r => setTimeout(r, delay))
    }

    setResult({
      switchWin, stayWin, n, attempted, validTrials,
      stopped: cancelRef.current && attempted < n,
      doors: effectiveDoors, variant,
      curveSwitch, curveStay,
      switchTheory, stayTheory,
    })
    setRunning(false)
  }

  function stop() {
    cancelRef.current = true
  }

  const validN = result?.validTrials || 0
  const switchRate = validN > 0 ? (result!.switchWin / validN) * 100 : 0
  const stayRate = validN > 0 ? (result!.stayWin / validN) * 100 : 0

  async function share() {
    if (!result) return
    const variantName = VARIANTS.find(v => v.id === result.variant)?.name ?? '표준'
    const countNote = result.stopped ? ` (${result.n.toLocaleString()}회 중 중단)` : ''
    const text = `몬티홀 시뮬레이터 유효 ${validN.toLocaleString()}회 결과${countNote} (문 ${result.doors}개 · ${variantName}):\n바꾸기 ${switchRate.toFixed(1)}% (이론 ${result.switchTheory.toFixed(1)}%)\n유지 ${stayRate.toFixed(1)}% (이론 ${result.stayTheory.toFixed(1)}%)\n직접 확인 → youtil.kr/tools/life/monty-hall`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div className={styles.panel}>
      {/* 변형 규칙 (3가지) */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>변형 규칙 <span className={styles.fieldSub}>(진행자의 의도에 따라 결과 달라짐)</span></p>
        <div className={styles.variantGrid}>
          {VARIANTS.map(v => (
            <button key={v.id}
              type="button" aria-pressed={variant === v.id}
              className={`${styles.variantCard} ${variant === v.id ? styles.variantCardActive : ''}`}
              onClick={() => changeVariant(v.id)} disabled={running}>
              <div className={styles.variantHead}>
                <span>{v.emoji} {v.name}</span>
                <span className={styles.variantTheory}>
                  바꾸기 {(v.switchTheory * 100).toFixed(0)}%
                </span>
              </div>
              <p className={styles.variantDesc}>{v.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 문 갯수 (표준 모드에서만 N 변경 가능) */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>
          문 갯수 (N) <span className={styles.fieldSub}>{isVariantMode ? '— 변형 규칙은 N=3 고정' : `— 이론 바꾸기 ${switchTheory.toFixed(1)}%`}</span>
        </p>
        <div className={styles.nRow}>
          {[3, 5, 10, 100, 1000].map(v => (
            <button key={v}
              type="button" aria-pressed={doorCount === v}
              className={`${styles.nBtn} ${doorCount === v ? styles.nBtnActive : ''}`}
              onClick={() => changeDoorCount(v)}
              disabled={running || isVariantMode}>
              {v}개
            </button>
          ))}
        </div>
      </div>

      {/* 시뮬레이션 횟수 */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>시뮬레이션 횟수</p>
        <div className={styles.nRow}>
          {[10, 100, 1000, 10000].map(v => (
            <button key={v}
              type="button" aria-pressed={n === v}
              className={`${styles.nBtn} ${n === v ? styles.nBtnActive : ''} ${styles[`nBtn_${v}`]}`}
              onClick={() => changeN(v)}
              disabled={running}>
              {v.toLocaleString()}회
            </button>
          ))}
        </div>
      </div>

      {/* 속도 */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>실행 속도</p>
        <div className={styles.segRow}>
          <button type="button" aria-pressed={speed === 'slow'} className={`${styles.segBtn} ${speed === 'slow' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('slow')} disabled={running}>🐢 천천히</button>
          <button type="button" aria-pressed={speed === 'normal'} className={`${styles.segBtn} ${speed === 'normal' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('normal')} disabled={running}>🚶 보통</button>
          <button type="button" aria-pressed={speed === 'fast'} className={`${styles.segBtn} ${speed === 'fast' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('fast')} disabled={running}>⚡ 빠르게</button>
        </div>
      </div>

      {/* 실행 버튼 */}
      <button type="button" className={styles.runBtn}
        onClick={running ? stop : runSim}
        disabled={false}>
        {running ? `⏹ 중단 (${progress.toLocaleString()}/${n.toLocaleString()})` : `▶ 시뮬레이션 시작`}
      </button>

      {/* 진행 바 */}
      {running && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(progress / n) * 100}%` }} />
        </div>
      )}

      {/* 결과 */}
      {result && (
        <>
          <div className={styles.simResultRow} role="status" aria-live="polite">
            <ResultCard
              label="🔄 바꾸기 전략"
              wins={result.switchWin}
              losses={validN - result.switchWin}
              rate={switchRate}
              theory={result.switchTheory}
              color="var(--accent)"
            />
            <ResultCard
              label="🎯 유지 전략"
              wins={result.stayWin}
              losses={validN - result.stayWin}
              rate={stayRate}
              theory={result.stayTheory}
              color="#0891B2"
            />
          </div>

          {result.stopped && (
            <p className={styles.interpret} style={{ background: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.3)' }}>
              ⏹ {result.n.toLocaleString()}회 목표 중 <strong>{result.attempted.toLocaleString()}회 진행 후 중단</strong>했습니다. 아래 결과는 실제 진행한 시행 기준입니다.
            </p>
          )}

          {result.attempted > result.validTrials && (
            <p className={styles.interpret} style={{ background: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.3)' }}>
              ⚠️ 변형 규칙으로 인해 진행한 {result.attempted.toLocaleString()}회 중 <strong>{(result.attempted - result.validTrials).toLocaleString()}회는 무효</strong> 처리됨 (예: 진행자가 자동차를 우연히 공개). 유효 시행 {validN.toLocaleString()}회 기준 결과.
            </p>
          )}

          {/* 수렴 그래프 */}
          <div className={styles.graphWrap}>
            <p className={styles.graphTitle}>
              시행 횟수에 따른 승률 수렴 (문 {result.doors}개)
            </p>
            <ConvergenceGraph
              curveSwitch={result.curveSwitch}
              curveStay={result.curveStay}
              n={result.attempted}
              switchTheory={result.switchTheory}
              stayTheory={result.stayTheory}
            />
            <div className={styles.graphLegend}>
              <span><span className={styles.legDot} style={{ background: 'var(--accent)' }} /> 바꾸기 실제</span>
              <span><span className={styles.legDot} style={{ background: '#0891B2' }} /> 유지 실제</span>
              <span><span className={styles.legDash} style={{ background: 'rgba(220,38,38,0.8)' }} /> 이론 {result.switchTheory.toFixed(1)}%</span>
              <span><span className={styles.legDash} style={{ background: 'rgba(8,145,178,0.8)' }} /> 이론 {result.stayTheory.toFixed(1)}%</span>
            </div>
          </div>

          {/* 비교 표 */}
          <div className={styles.compareTable}>
            <table>
              <thead>
                <tr><th></th><th>이론값</th><th>실제({validN.toLocaleString()}회)</th><th>오차</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.compLabel}>바꾸기</td>
                  <td>{result.switchTheory.toFixed(2)}%</td>
                  <td className={styles.compAccent}>{switchRate.toFixed(2)}%</td>
                  <td>{(switchRate - result.switchTheory >= 0 ? '+' : '')}{(switchRate - result.switchTheory).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className={styles.compLabel}>유지하기</td>
                  <td>{result.stayTheory.toFixed(2)}%</td>
                  <td className={styles.compBlue}>{stayRate.toFixed(2)}%</td>
                  <td>{(stayRate - result.stayTheory >= 0 ? '+' : '')}{(stayRate - result.stayTheory).toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 해석 — 실제 유효 시행 수(validN) 기준 */}
          <div className={styles.interpret}>
            {validN >= 1000
              ? `✅ 대수의 법칙이 확인됐습니다! 유효 시행 ${validN.toLocaleString()}회 기준으로 이론값(${result.switchTheory.toFixed(1)}% / ${result.stayTheory.toFixed(1)}%)에 가깝게 수렴했습니다.`
              : validN >= 100
                ? `📊 유효 시행 ${validN.toLocaleString()}회입니다. 1,000회 이상으로 늘리면 이론값에 훨씬 가깝게 수렴합니다.`
                : `⚠️ 유효 시행 ${validN.toLocaleString()}회로 적어 편차가 클 수 있습니다. 1,000회 이상 실행해 보세요.`}
          </div>

          {/* 공유 */}
          <button type="button" className={styles.shareBtn} onClick={share}>
            {copied ? '✓ 복사 완료!' : '📋 결과 텍스트 복사'}
          </button>
        </>
      )}
    </div>
  )
}

function ResultCard({ label, wins, losses, rate, theory, color }: {
  label: string; wins: number; losses: number; rate: number; theory: number; color: string
}) {
  return (
    <div className={styles.resCard} style={{ borderColor: `${color}55` }}>
      <p className={styles.resLabel}>{label}</p>
      <p className={styles.resRate} style={{ color }}>{rate.toFixed(1)}%</p>
      <p className={styles.resDetail}>{wins.toLocaleString()}승 / {losses.toLocaleString()}패</p>
      <p className={styles.resTheory}>이론 {theory.toFixed(1)}%</p>
    </div>
  )
}

// ── 수렴 그래프 ────────────────────
function ConvergenceGraph({
  curveSwitch, curveStay, n, switchTheory = 66.7, stayTheory = 33.3,
}: {
  curveSwitch: { x: number; y: number }[]
  curveStay: { x: number; y: number }[]
  n: number
  switchTheory?: number
  stayTheory?: number
}) {
  const W = 600, H = 280
  const padL = 40, padR = 16, padT = 16, padB = 34
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const logMin = 0               // log10(1)=0
  const logMax = Math.log10(Math.max(10, n))
  const toX = (x: number) => padL + ((Math.log10(Math.max(1, x)) - logMin) / (logMax - logMin)) * plotW
  const toY = (y: number) => padT + plotH - (y / 100) * plotH

  const pathFrom = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')

  const xTicks = [1, 10, 100, 1000, 10000].filter(t => t <= n)
  if (!xTicks.includes(n)) xTicks.push(n)
  const yTicks = Array.from(new Set([0, Math.round(stayTheory), 50, Math.round(switchTheory), 100])).sort((a, b) => a - b)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graph} preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={`승률 수렴 그래프 — 시행이 늘수록 바꾸기는 이론 ${switchTheory.toFixed(0)}%, 유지는 ${stayTheory.toFixed(0)}%에 수렴`}>
      {/* Y 그리드 + 레이블 */}
      {yTicks.map(y => {
        const isTheory = Math.abs(y - switchTheory) < 1 || Math.abs(y - stayTheory) < 1
        return (
          <g key={`y${y}`}>
            <line x1={padL} x2={W - padR} y1={toY(y)} y2={toY(y)}
              stroke={isTheory ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'} />
            <text x={padL - 6} y={toY(y) + 4} textAnchor="end" className={styles.graphAxis}>{y}%</text>
          </g>
        )
      })}
      {/* X 그리드 + 레이블 */}
      {xTicks.map(x => (
        <g key={`x${x}`}>
          <line x1={toX(x)} x2={toX(x)} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.04)" />
          <text x={toX(x)} y={H - 12} textAnchor="middle" className={styles.graphAxis}>
            {x >= 1000 ? `${x / 1000}k` : x}
          </text>
        </g>
      ))}

      {/* 이론값 선 */}
      <line x1={padL} x2={W - padR} y1={toY(switchTheory)} y2={toY(switchTheory)}
        stroke="rgba(220,38,38,0.6)" strokeDasharray="4 4" strokeWidth={1.5} />
      <line x1={padL} x2={W - padR} y1={toY(stayTheory)} y2={toY(stayTheory)}
        stroke="rgba(8,145,178,0.6)" strokeDasharray="4 4" strokeWidth={1.5} />

      {/* 실제 곡선 */}
      <path d={pathFrom(curveSwitch)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={pathFrom(curveStay)}   fill="none" stroke="#0891B2"     strokeWidth={2.5} strokeLinejoin="round" />

      {/* 마지막 포인트 */}
      {curveSwitch.length > 0 && (
        <circle cx={toX(curveSwitch[curveSwitch.length - 1].x)}
          cy={toY(curveSwitch[curveSwitch.length - 1].y)}
          r={4} fill="var(--accent)" />
      )}
      {curveStay.length > 0 && (
        <circle cx={toX(curveStay[curveStay.length - 1].x)}
          cy={toY(curveStay[curveStay.length - 1].y)}
          r={4} fill="#0891B2" />
      )}

      <text x={W - padR - 4} y={toY(switchTheory) - 4} textAnchor="end" className={styles.graphTag} style={{ fill: 'rgba(220,38,38,0.8)' }}>{switchTheory.toFixed(0)}%</text>
      <text x={W - padR - 4} y={toY(stayTheory) - 4} textAnchor="end" className={styles.graphTag} style={{ fill: 'rgba(8,145,178,0.8)' }}>{stayTheory.toFixed(0)}%</text>
    </svg>
  )
}

// ═══════════════════════════════════════
// TAB 3: 설명
// ═══════════════════════════════════════
function WhyTab() {
  return (
    <div className={styles.panel}>
      {/* 카드 1 — 초기 확률 */}
      <div className={styles.whyCard}>
        <p className={styles.whyNum}>1</p>
        <h3 className={styles.whyTitle}>처음 선택이 틀릴 확률이 더 높다</h3>
        <p className={styles.whyBody}>
          처음에 자동차를 고를 확률은 <strong className={styles.hi}>1/3</strong>, 염소를 고를 확률은 <strong className={styles.hi2}>2/3</strong>입니다.
          즉, 처음 선택이 <strong>틀렸을 가능성이 더 높습니다</strong>.
        </p>
        <div className={styles.pieRow}>
          <Pie value={1/3} label="1/3" sub="자동차" color="var(--accent)" />
          <Pie value={2/3} label="2/3" sub="염소" color="#EA580C" />
        </div>
      </div>

      {/* 카드 2 — 분기 */}
      <div className={styles.whyCard}>
        <p className={styles.whyNum}>2</p>
        <h3 className={styles.whyTitle}>사회자는 절대 자동차 문을 열지 않는다</h3>
        <p className={styles.whyBody}>
          사회자는 <strong>무작위가 아니라 반드시 염소 문</strong>을 엽니다. 이 행동이 확률에 새로운 정보를 더해줍니다.
        </p>
        <div className={styles.branchGrid}>
          {[
            { init: '자동차', p: '1/3', switch: '🐐', stay: '🚗', initColor: 'var(--accent)' },
            { init: '염소 A',  p: '1/3', switch: '🚗', stay: '🐐', initColor: '#EA580C' },
            { init: '염소 B',  p: '1/3', switch: '🚗', stay: '🐐', initColor: '#EA580C' },
          ].map((b, i) => (
            <div key={i} className={styles.branchCard}>
              <div className={styles.branchHead} style={{ borderColor: b.initColor, color: b.initColor }}>
                처음 = {b.init}
                <span className={styles.branchProb}>({b.p})</span>
              </div>
              <div className={styles.branchRow}>
                <span className={styles.branchLabel}>바꾸면</span>
                <span className={styles.branchResult}>{b.switch}</span>
              </div>
              <div className={styles.branchRow}>
                <span className={styles.branchLabel}>유지하면</span>
                <span className={styles.branchResult}>{b.stay}</span>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.whyConclusion}>
          → 바꾸면 <strong className={styles.hi}>3가지 중 2가지</strong>에서 자동차 = <strong className={styles.hi}>2/3 확률!</strong>
        </p>
      </div>

      {/* 카드 3 — 베이즈 */}
      <div className={styles.whyCard}>
        <p className={styles.whyNum}>3</p>
        <h3 className={styles.whyTitle}>베이즈 정리로 증명</h3>
        <p className={styles.whyBody}>
          플레이어가 A문을 선택하고, 사회자가 C문을 열었다고 할 때 자동차가 B에 있을 확률:
        </p>
        <div className={styles.bayesBox}>
          <p><span className={styles.bayesLhs}>P(차=B | 열림=C)</span></p>
          <p className={styles.bayesOp}>=</p>
          <p>
            <span className={styles.bayesFrac}>
              <span className={styles.bayesNum}>
                P(열림=C | 차=B) <span className={styles.bayesDot}>×</span> P(차=B)
              </span>
              <span className={styles.bayesDen}>P(열림=C)</span>
            </span>
          </p>
          <p className={styles.bayesOp}>=</p>
          <p>
            <span className={styles.bayesFrac}>
              <span className={styles.bayesNum}>1 × (1/3)</span>
              <span className={styles.bayesDen}>1/2</span>
            </span>
            <span className={styles.bayesEq}> = <strong className={styles.hi}>2/3</strong></span>
          </p>
        </div>
      </div>

      {/* 카드 4 — 극단 예시 */}
      <div className={styles.whyCard}>
        <p className={styles.whyNum}>4</p>
        <h3 className={styles.whyTitle}>문이 100개라면? (직관으로 이해하기)</h3>
        <p className={styles.whyBody}>
          당신이 1번 문을 선택했는데, 사회자가 98개 문을 열어 <strong>모두 염소</strong>를 공개했습니다. 남은 문은 1번과 42번. 42번으로 <strong>바꾸시겠습니까?</strong>
        </p>
        <HundredDoors />
        <p className={styles.whyConclusion}>
          → 100개일 때 바꾸면 <strong className={styles.hi}>99/100 = 99% 확률!</strong>
        </p>
      </div>

      {/* 카드 5 — N개 일반화 */}
      <div className={styles.whyCard}>
        <p className={styles.whyNum}>5</p>
        <h3 className={styles.whyTitle}>N개 문 일반화</h3>
        <p className={styles.whyBody}>
          표준 몬티홀처럼 <strong>사회자가 N−2개 문을 열어 1개만 남겨준다면</strong>, 처음 고른 문(1/N)을 뺀 나머지 확률이 그 한 문에 모입니다 — <strong>바꾸기 승률 (N−1)/N</strong>.
        </p>
        <div className={styles.genTable}>
          <table>
            <thead>
              <tr><th>문 수</th><th>유지 승률</th><th>바꾸기 승률</th></tr>
            </thead>
            <tbody>
              {[
                { n: 3,   stay: 33.33, switch: 66.67 },
                { n: 4,   stay: 25.00, switch: 75.00 },
                { n: 5,   stay: 20.00, switch: 80.00 },
                { n: 10,  stay: 10.00, switch: 90.00 },
                { n: 100, stay: 1.00,  switch: 99.00 },
              ].map(r => (
                <tr key={r.n}>
                  <td>{r.n}개</td>
                  <td>{r.stay.toFixed(2)}%</td>
                  <td className={styles.genAccent}>{r.switch.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.genNote}>
            표준 몬티홀 = 사회자가 <strong>N−2개를 열어 1개만 남기는</strong> 경우 바꾸기 (N−1)/N — [자동 시뮬레이션] 탭과 같은 기준입니다.<br />
            (참고: 사회자가 단 1개만 열고 남은 N−2개 중 무작위로 바꾸면 (N−1)/(N(N−2))로 오히려 낮아집니다 — 4개 37.5%.)
          </p>
        </div>
      </div>
    </div>
  )
}

// ── 파이 차트 ─────────────────
function Pie({ value, label, sub, color }: { value: number; label: string; sub: string; color: string }) {
  const R = 42, C = 2 * Math.PI * R
  return (
    <div className={styles.pieWrap}>
      <svg viewBox="0 0 100 100" className={styles.pie}>
        <circle cx={50} cy={50} r={R} fill="none" stroke="var(--bg3)" strokeWidth={14} />
        <circle cx={50} cy={50} r={R} fill="none" stroke={color} strokeWidth={14}
          strokeDasharray={`${C * value} ${C}`} transform="rotate(-90 50 50)" strokeLinecap="butt" />
      </svg>
      <p className={styles.pieLabel} style={{ color }}>{label}</p>
      <p className={styles.pieSub}>{sub}</p>
    </div>
  )
}

// ── 100개 문 시각화 ──────────
function HundredDoors() {
  return (
    <div className={styles.hundredGrid}>
      {Array.from({ length: 100 }, (_, i) => {
        const isPicked = i === 0
        const isSwitch = i === 41
        const isGoat = !isPicked && !isSwitch
        return (
          <span key={i}
            className={`${styles.hundredCell} ${isPicked ? styles.hundredPick : ''} ${isSwitch ? styles.hundredSwitch : ''} ${isGoat ? styles.hundredGoat : ''}`}
            title={isPicked ? '당신의 선택' : isSwitch ? '남은 문 (바꾸시겠습니까?)' : '사회자가 연 문'}
          >
            {isPicked ? '❓' : isSwitch ? '❓' : '🐐'}
          </span>
        )
      })}
    </div>
  )
}
