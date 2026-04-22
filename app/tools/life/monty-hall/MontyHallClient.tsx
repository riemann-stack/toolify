'use client'

import { useMemo, useRef, useState } from 'react'
import styles from './monty-hall.module.css'

// ── 타입 ─────────────────────────────────
type Tab = 'play' | 'sim' | 'why'
type Phase = 'choose' | 'decide' | 'reveal'
type Strategy = 'switch' | 'stay' | 'random'
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
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'play' ? styles.tabActive : ''}`} onClick={() => setTab('play')}>🎮 직접 해보기</button>
        <button className={`${styles.tab} ${tab === 'sim' ? styles.tabActive : ''}`} onClick={() => setTab('sim')}>⚡ 자동 시뮬레이션</button>
        <button className={`${styles.tab} ${tab === 'why' ? styles.tabActive : ''}`} onClick={() => setTab('why')}>💡 왜 바꿔야 할까?</button>
      </div>

      {tab === 'play' && <PlayTab />}
      {tab === 'sim' && <SimTab />}
      {tab === 'why' && <WhyTab />}
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

          return (
            <button
              key={d}
              onClick={() => phase === 'choose' ? choose(d) : undefined}
              disabled={phase !== 'choose'}
              className={`${styles.door} ${stateClass}`}
              aria-label={`문 ${d + 1}`}
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
          <button className={styles.decideSwitch} onClick={() => decide('switch')}>
            🔄 바꾸기
          </button>
          <button className={styles.decideStay} onClick={() => decide('stay')}>
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
          <button className={styles.againBtn} onClick={resetRound}>
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
            <button className={styles.statsReset} onClick={resetAll}>기록 초기화</button>
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
              color="#3EC8FF"
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
  const [strategy, setStrategy] = useState<Strategy>('switch')
  const [speed, setSpeed] = useState<Speed>('fast')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    switchWin: number; stayWin: number; n: number
    curveSwitch: { x: number; y: number }[]; curveStay: { x: number; y: number }[]
  } | null>(null)
  const cancelRef = useRef(false)
  const [copied, setCopied] = useState(false)

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

    const delay = speed === 'slow' ? 30 : speed === 'normal' ? 5 : 0
    const batchSize = speed === 'slow' ? 1 : speed === 'normal' ? 20 : 500

    for (let i = 0; i < n; i += batchSize) {
      if (cancelRef.current) break
      const end = Math.min(n, i + batchSize)
      for (let j = i; j < end; j++) {
        const r = simulatePair()
        if (r.switchWin) switchWin++
        if (r.stayWin) stayWin++
        if (checkpoints.has(j + 1)) {
          curveSwitch.push({ x: j + 1, y: (switchWin / (j + 1)) * 100 })
          curveStay.push({ x: j + 1, y: (stayWin / (j + 1)) * 100 })
        }
      }
      setProgress(end)
      if (delay > 0) await new Promise(r => setTimeout(r, delay))
    }

    setResult({ switchWin, stayWin, n, curveSwitch, curveStay })
    setRunning(false)
  }

  function stop() {
    cancelRef.current = true
  }

  const switchRate = result ? (result.switchWin / result.n) * 100 : 0
  const stayRate = result ? (result.stayWin / result.n) * 100 : 0

  async function share() {
    if (!result) return
    const text = `몬티홀 시뮬레이터 ${result.n}회 결과:\n바꾸기 전략 승률 ${switchRate.toFixed(1)}% (이론 66.7%)\n유지 전략 승률 ${stayRate.toFixed(1)}% (이론 33.3%)\n직접 확인 → youtil.kr/tools/life/monty-hall`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div className={styles.panel}>
      {/* 시뮬레이션 횟수 */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>시뮬레이션 횟수</p>
        <div className={styles.nRow}>
          {[10, 100, 1000, 10000].map(v => (
            <button key={v}
              className={`${styles.nBtn} ${n === v ? styles.nBtnActive : ''} ${styles[`nBtn_${v}`]}`}
              onClick={() => setN(v)}
              disabled={running}>
              {v.toLocaleString()}회
            </button>
          ))}
        </div>
      </div>

      {/* 전략 */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>전략 <span className={styles.fieldSub}>(양쪽 모두 병렬 계산)</span></p>
        <div className={styles.segRow}>
          <button className={`${styles.segBtn} ${strategy === 'switch' ? styles.segBtnActive : ''}`}
            onClick={() => setStrategy('switch')} disabled={running}>🔄 항상 바꾸기</button>
          <button className={`${styles.segBtn} ${strategy === 'stay' ? styles.segBtnActive : ''}`}
            onClick={() => setStrategy('stay')} disabled={running}>🎯 항상 유지</button>
          <button className={`${styles.segBtn} ${strategy === 'random' ? styles.segBtnActive : ''}`}
            onClick={() => setStrategy('random')} disabled={running}>🎲 랜덤</button>
        </div>
      </div>

      {/* 속도 */}
      <div className={styles.field}>
        <p className={styles.fieldLabel}>실행 속도</p>
        <div className={styles.segRow}>
          <button className={`${styles.segBtn} ${speed === 'slow' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('slow')} disabled={running}>🐢 천천히</button>
          <button className={`${styles.segBtn} ${speed === 'normal' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('normal')} disabled={running}>🚶 보통</button>
          <button className={`${styles.segBtn} ${speed === 'fast' ? styles.segBtnActive : ''}`}
            onClick={() => setSpeed('fast')} disabled={running}>⚡ 빠르게</button>
        </div>
      </div>

      {/* 실행 버튼 */}
      <button className={styles.runBtn}
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
          <div className={styles.simResultRow}>
            <ResultCard
              label="🔄 바꾸기 전략"
              wins={result.switchWin}
              losses={result.n - result.switchWin}
              rate={switchRate}
              theory={66.67}
              color="var(--accent)"
            />
            <ResultCard
              label="🎯 유지 전략"
              wins={result.stayWin}
              losses={result.n - result.stayWin}
              rate={stayRate}
              theory={33.33}
              color="#3EC8FF"
            />
          </div>

          {/* 수렴 그래프 */}
          <div className={styles.graphWrap}>
            <p className={styles.graphTitle}>시행 횟수에 따른 승률 수렴</p>
            <ConvergenceGraph
              curveSwitch={result.curveSwitch}
              curveStay={result.curveStay}
              n={result.n}
            />
            <div className={styles.graphLegend}>
              <span><span className={styles.legDot} style={{ background: 'var(--accent)' }} /> 바꾸기 실제</span>
              <span><span className={styles.legDot} style={{ background: '#3EC8FF' }} /> 유지 실제</span>
              <span><span className={styles.legDash} style={{ background: 'rgba(255,107,107,0.8)' }} /> 이론 66.7%</span>
              <span><span className={styles.legDash} style={{ background: 'rgba(62,200,255,0.8)' }} /> 이론 33.3%</span>
            </div>
          </div>

          {/* 비교 표 */}
          <div className={styles.compareTable}>
            <table>
              <thead>
                <tr><th></th><th>이론값</th><th>실제({result.n.toLocaleString()}회)</th><th>오차</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.compLabel}>바꾸기</td>
                  <td>66.67%</td>
                  <td className={styles.compAccent}>{switchRate.toFixed(2)}%</td>
                  <td>{(switchRate - 66.67 >= 0 ? '+' : '')}{(switchRate - 66.67).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className={styles.compLabel}>유지하기</td>
                  <td>33.33%</td>
                  <td className={styles.compBlue}>{stayRate.toFixed(2)}%</td>
                  <td>{(stayRate - 33.33 >= 0 ? '+' : '')}{(stayRate - 33.33).toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 해석 */}
          <div className={styles.interpret}>
            {result.n >= 1000
              ? '✅ 대수의 법칙이 확인됐습니다! 시행 횟수가 많을수록 이론값(66.7% / 33.3%)에 가까워집니다.'
              : result.n >= 100
                ? '📊 시행 횟수를 1,000회 이상으로 늘리면 이론값에 훨씬 가깝게 수렴합니다.'
                : '⚠️ 시행 횟수가 적어 편차가 클 수 있습니다. 1,000회 이상 실행해 보세요.'}
          </div>

          {/* 공유 */}
          <button className={styles.shareBtn} onClick={share}>
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
      <p className={styles.resTheory}>이론 {theory}%</p>
    </div>
  )
}

// ── 수렴 그래프 ────────────────────
function ConvergenceGraph({
  curveSwitch, curveStay, n,
}: {
  curveSwitch: { x: number; y: number }[]
  curveStay: { x: number; y: number }[]
  n: number
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
  const yTicks = [0, 33.3, 50, 66.7, 100]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graph} preserveAspectRatio="xMidYMid meet">
      {/* Y 그리드 + 레이블 */}
      {yTicks.map(y => (
        <g key={`y${y}`}>
          <line x1={padL} x2={W - padR} y1={toY(y)} y2={toY(y)}
            stroke={y === 33.3 || y === 66.7 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'} />
          <text x={padL - 6} y={toY(y) + 4} textAnchor="end" className={styles.graphAxis}>{y.toFixed(y === 33.3 || y === 66.7 ? 1 : 0)}%</text>
        </g>
      ))}
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
      <line x1={padL} x2={W - padR} y1={toY(66.7)} y2={toY(66.7)}
        stroke="rgba(255,107,107,0.6)" strokeDasharray="4 4" strokeWidth={1.5} />
      <line x1={padL} x2={W - padR} y1={toY(33.3)} y2={toY(33.3)}
        stroke="rgba(62,200,255,0.6)" strokeDasharray="4 4" strokeWidth={1.5} />

      {/* 실제 곡선 */}
      <path d={pathFrom(curveSwitch)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={pathFrom(curveStay)}   fill="none" stroke="#3EC8FF"     strokeWidth={2.5} strokeLinejoin="round" />

      {/* 마지막 포인트 */}
      {curveSwitch.length > 0 && (
        <circle cx={toX(curveSwitch[curveSwitch.length - 1].x)}
          cy={toY(curveSwitch[curveSwitch.length - 1].y)}
          r={4} fill="var(--accent)" />
      )}
      {curveStay.length > 0 && (
        <circle cx={toX(curveStay[curveStay.length - 1].x)}
          cy={toY(curveStay[curveStay.length - 1].y)}
          r={4} fill="#3EC8FF" />
      )}

      <text x={W - padR - 4} y={toY(66.7) - 4} textAnchor="end" className={styles.graphTag} style={{ fill: 'rgba(255,107,107,0.8)' }}>2/3</text>
      <text x={W - padR - 4} y={toY(33.3) - 4} textAnchor="end" className={styles.graphTag} style={{ fill: 'rgba(62,200,255,0.8)' }}>1/3</text>
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
          <Pie value={2/3} label="2/3" sub="염소" color="#FF8C3E" />
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
            { init: '염소 A',  p: '1/3', switch: '🚗', stay: '🐐', initColor: '#FF8C3E' },
            { init: '염소 B',  p: '1/3', switch: '🚗', stay: '🐐', initColor: '#FF8C3E' },
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
          사회자가 1개 문만 공개하고 바꾸게 해준다면, <strong>N개 문에서 바꾸기 승률</strong>은
          남은 N−2개의 닫힌 문에 1−1/N 확률이 나눠집니다.
        </p>
        <div className={styles.genTable}>
          <table>
            <thead>
              <tr><th>문 수</th><th>유지 승률</th><th>바꾸기 승률*</th></tr>
            </thead>
            <tbody>
              {[
                { n: 3,   stay: 33.33, switch: 66.67 },
                { n: 4,   stay: 25.00, switch: 37.50 },
                { n: 5,   stay: 20.00, switch: 26.67 },
                { n: 10,  stay: 10.00, switch: 11.25 },
                { n: 100, stay: 1.00,  switch: 1.01 },
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
            * 사회자가 1개 문만 여는 경우. (N−1)/(N(N−2)) 기준.<br />
            사회자가 N−2개 문을 모두 연다면 바꾸기 승률은 (N−1)/N로 치솟습니다 — 100개 → 99%.
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
