'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './pomodoro.module.css'

type Phase = 'focus' | 'short' | 'long'

const PHASES: Record<Phase, { label: string; color: string; defaultMin: number }> = {
  focus: { label: '집중',     color: '#C8FF3E', defaultMin: 25 },
  short: { label: '짧은 휴식', color: '#3EC8FF', defaultMin: 5  },
  long:  { label: '긴 휴식',  color: '#FF8C3E', defaultMin: 15 },
}

export default function PomodoroClient() {
  const [focusMin,  setFocusMin]  = useState(25)
  const [shortMin,  setShortMin]  = useState(5)
  const [longMin,   setLongMin]   = useState(15)
  const [longEvery, setLongEvery] = useState(4)

  const [phase,     setPhase]    = useState<Phase>('focus')
  const [seconds,   setSeconds]  = useState(25 * 60)
  const [running,   setRunning]  = useState(false)
  const [cycle,     setCycle]    = useState(1)   // 현재 집중 사이클 번호
  const [completed, setCompleted]= useState(0)   // 완료한 집중 횟수

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalRef    = useRef(25 * 60)

  const getTotal = useCallback((p: Phase) => {
    if (p === 'focus') return focusMin * 60
    if (p === 'short') return shortMin * 60
    return longMin * 60
  }, [focusMin, shortMin, longMin])

  // 타이머 실행
  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          // 알림음 (Web Audio API)
          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain); gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.setValueAtTime(0.3, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
            osc.start(); osc.stop(ctx.currentTime + 0.8)
          } catch {}
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running])

  const switchPhase = (p: Phase) => {
    setRunning(false)
    setPhase(p)
    const total = getTotal(p)
    totalRef.current = total
    setSeconds(total)
  }

  const handleStart = () => setRunning(true)
  const handlePause = () => setRunning(false)

  const handleReset = () => {
    setRunning(false)
    const total = getTotal(phase)
    totalRef.current = total
    setSeconds(total)
  }

  const handleNext = () => {
    setRunning(false)
    if (phase === 'focus') {
      const newCompleted = completed + 1
      setCompleted(newCompleted)
      if (newCompleted % longEvery === 0) {
        switchPhase('long')
      } else {
        switchPhase('short')
      }
    } else {
      const newCycle = cycle + (phase === 'long' ? 1 : 1)
      setCycle(newCycle)
      switchPhase('focus')
    }
  }

  const total    = getTotal(phase)
  const progress = seconds / total
  const mins     = Math.floor(seconds / 60)
  const secs     = seconds % 60
  const timeStr  = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // SVG 원형 프로그레스
  const R    = 80
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * progress

  const phaseColor = PHASES[phase].color

  return (
    <div className={styles.wrap}>

      {/* 페이즈 선택 */}
      <div className={styles.phaseRow}>
        {(Object.keys(PHASES) as Phase[]).map(p => (
          <button key={p}
            className={`${styles.phaseBtn} ${phase === p ? styles.phaseBtnActive : ''}`}
            style={phase === p ? { borderColor: PHASES[p].color, color: PHASES[p].color } : {}}
            onClick={() => switchPhase(p)}>
            {PHASES[p].label}
          </button>
        ))}
      </div>

      {/* 원형 타이머 */}
      <div className={styles.timerWrap}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--bg3)" strokeWidth="8" />
          <circle cx="100" cy="100" r={R} fill="none"
            stroke={phaseColor} strokeWidth="8"
            strokeDasharray={`${dash} ${CIRC}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div className={styles.timerCenter}>
          <div className={styles.timerPhase} style={{ color: phaseColor }}>{PHASES[phase].label}</div>
          <div className={styles.timerTime}>{timeStr}</div>
          <div className={styles.timerCycle}>#{cycle} 사이클</div>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={handleReset} title="리셋">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button className={styles.mainBtn}
          style={{ background: phaseColor }}
          onClick={running ? handlePause : handleStart}>
          {running ? '일시정지' : (seconds < total ? '재개' : '시작')}
        </button>
        <button className={styles.ctrlBtn} onClick={handleNext} title="다음">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,4 15,12 5,20"/><line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      {/* 진행 현황 */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statNum} style={{ color: PHASES.focus.color }}>{completed}</div>
          <div className={styles.statLabel}>완료한 집중</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNum}>{cycle}</div>
          <div className={styles.statLabel}>현재 사이클</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNum}>{longEvery - (completed % longEvery)}</div>
          <div className={styles.statLabel}>긴 휴식까지</div>
        </div>
      </div>

      {/* 커스텀 시간 설정 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>시간 설정 (분)</label>
        <div className={styles.settingsGrid}>
          {[
            { label: '집중', value: focusMin, set: setFocusMin, min: 1, max: 60 },
            { label: '짧은 휴식', value: shortMin, set: setShortMin, min: 1, max: 30 },
            { label: '긴 휴식', value: longMin, set: setLongMin, min: 1, max: 60 },
            { label: '긴 휴식 주기', value: longEvery, set: setLongEvery, min: 2, max: 10 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label} className={styles.settingItem}>
              <div className={styles.settingLabel}>{label}</div>
              <div className={styles.settingRow}>
                <button className={styles.settingBtn}
                  onClick={() => { if (value > min) { set(value - 1); if (!running) switchPhase(phase) } }}>−</button>
                <span className={styles.settingValue}>{value}</span>
                <button className={styles.settingBtn}
                  onClick={() => { if (value < max) { set(value + 1); if (!running) switchPhase(phase) } }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}