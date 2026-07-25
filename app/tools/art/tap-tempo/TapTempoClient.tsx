'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './tap-tempo.module.css'

/* ──────────────────────── 공통 ──────────────────────── */
const MAX_TAPS = 8
const AUTO_RESET_MS = 3000

type TempoInfo = { name: string; ko: string }
function getTempoInfo(bpm: number): TempoInfo {
  // 통용 차트 기준 정렬 — 실제 용어 구간은 자료마다 다르고 겹치므로 분류용 비겹침 경계 사용
  if (bpm < 45)  return { name: 'Grave',       ko: '매우 느리고 장중하게' }
  if (bpm < 60)  return { name: 'Largo',       ko: '크고 폭넓게' }
  if (bpm < 66)  return { name: 'Larghetto',   ko: '다소 느리고 폭넓게' }
  if (bpm < 76)  return { name: 'Adagio',      ko: '느리고 서정적으로' }
  if (bpm < 108) return { name: 'Andante',     ko: '걷는 속도로' }
  if (bpm < 120) return { name: 'Moderato',    ko: '보통 빠르기로' }
  if (bpm < 156) return { name: 'Allegro',     ko: '빠르고 활기차게' }
  if (bpm < 176) return { name: 'Vivace',      ko: '생동감 있고 빠르게' }
  if (bpm < 200) return { name: 'Presto',      ko: '매우 빠르게' }
  return             { name: 'Prestissimo', ko: '최대한 빠르게' }
}

function computeBpmFromTaps(taps: number[]): { bpm: number | null; intervals: number[] } {
  if (taps.length < 2) return { bpm: null, intervals: [] }
  const intervals: number[] = []
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return { bpm: Math.round(60000 / avg), intervals }
}

function getAccuracy(intervals: number[]): number {
  if (intervals.length < 2) return 0
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((a, b) => a + (b - avg) ** 2, 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  return Math.max(0, Math.min(100, 100 - (stdDev / 100) * 100))
}

/* ──────────────────────── 탭 1: 탭 템포 측정기 ──────────────────────── */
function TapTempoTab({ active }: { active: boolean }) {
  const [taps, setTaps] = useState<number[]>([])
  const [tapCount, setTapCount] = useState(0)
  const [locked, setLocked] = useState<number | null>(null)
  const [rippleKey, setRippleKey] = useState(0)
  const lastTapRef = useRef<number>(0)

  const { bpm, intervals } = useMemo(() => computeBpmFromTaps(taps), [taps])
  const tempoInfo = bpm ? getTempoInfo(bpm) : null
  const accuracy = getAccuracy(intervals)

  const doTap = useCallback(() => {
    const now = Date.now()
    // 3초 이상 쉬었다면 다음 탭부터 새 측정 시작 (측정 결과는 그때까지 화면에 유지)
    const isNewSession = lastTapRef.current > 0 && now - lastTapRef.current > AUTO_RESET_MS
    lastTapRef.current = now
    setRippleKey(k => k + 1)
    setTapCount(c => (isNewSession ? 1 : c + 1))
    setTaps(prev => {
      if (isNewSession) return [now]
      const next = [...prev, now]
      return next.length > MAX_TAPS + 1 ? next.slice(-MAX_TAPS - 1) : next
    })
    setLocked(null)
  }, [])

  // 스페이스/엔터 키보드 지원 (이 탭이 보일 때만)
  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        doTap()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doTap, active])

  const handleReset = () => { setTaps([]); setTapCount(0); setLocked(null); lastTapRef.current = 0 }
  const handleLock = () => { if (bpm) setLocked(bpm) }

  const displayBpm = locked ?? bpm
  const accuracyStatus = useMemo(() => {
    if (taps.length < 3) return { level: 'early', msg: '탭을 더 해주세요' }
    if (taps.length < 6) return { level: 'mid',   msg: '측정 중...' }
    return { level: 'ready', msg: `정확도 ${Math.round(accuracy)}%` }
  }, [taps.length, accuracy])

  const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 1

  return (
    <div className={styles.tabContent}>
      {/* 메인 탭 버튼 */}
      <div className={styles.tapCard}>
        <button
          type="button"
          className={styles.tapButton}
          onPointerDown={doTap}
          style={{ touchAction: 'manipulation' }}
          aria-label="탭하여 BPM 측정"
        >
          <span key={rippleKey} className={styles.ripple} aria-hidden />
          <div className={styles.tapBpmWrap}>
            <div className={styles.tapBpm}>
              {displayBpm != null ? displayBpm : '--'}
            </div>
            <div className={styles.tapBpmLabel}>BPM</div>
          </div>
          <div className={styles.tapCount}>
            {tapCount > 0 ? `${tapCount}번 탭` : '여기를 탭하세요'}
          </div>
        </button>

        <p className={styles.kbdHint}>
          💡 <kbd>Space</kbd> / <kbd>Enter</kbd> 키로도 탭할 수 있습니다
        </p>
      </div>

      {/* 템포 이름 배지 */}
      {tempoInfo && (
        <div className={styles.tempoBadge}>
          <div className={styles.tempoName}>{tempoInfo.name}</div>
          <div className={styles.tempoKo}>{tempoInfo.ko}</div>
        </div>
      )}

      {/* 정확도 + 상태 */}
      <div className={styles.accCard} role="status">
        <div className={styles.accLabel}>{accuracyStatus.msg}</div>
        {accuracyStatus.level === 'ready' && (
          <div className={styles.accBar}>
            <div className={styles.accBarFill} style={{ width: `${accuracy}%` }} />
          </div>
        )}
      </div>

      {/* 탭 간격 바 차트 */}
      {intervals.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>최근 탭 간격</div>
          <div className={styles.chart}>
            {intervals.map((iv, i) => {
              const heightPct = Math.max(10, (iv / maxInterval) * 100)
              const isLast = i === intervals.length - 1
              return (
                <div key={i} className={styles.chartCol}>
                  <div
                    className={`${styles.chartBar} ${isLast ? styles.chartBarActive : ''}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className={styles.chartLabel}>{iv}ms</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 컨트롤 */}
      <div className={styles.controlRow}>
        <button type="button" className={styles.ctrlBtn} onClick={handleReset}>↺ 리셋</button>
        <button
          type="button"
          className={`${styles.ctrlBtn} ${locked ? styles.ctrlBtnActive : ''}`}
          onClick={handleLock}
          disabled={bpm == null}
        >
          {locked ? `${locked} 고정됨` : 'BPM 고정'}
        </button>
        <a
          className={`${styles.ctrlBtn} ${styles.ctrlBtnLink}`}
          href={displayBpm != null ? `/tools/art/bpm?bpm=${displayBpm}` : '#'}
          aria-disabled={displayBpm == null}
          onClick={e => { if (displayBpm == null) e.preventDefault() }}
        >
          이 BPM으로 딜레이 계산 →
        </a>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 2: 메트로놈 ──────────────────────── */
type TimeSig = '2/4' | '3/4' | '4/4' | '6/8'
const TIME_SIG_BEATS: Record<TimeSig, number> = { '2/4': 2, '3/4': 3, '4/4': 4, '6/8': 6 }
const BPM_PRESETS = [
  { bpm: 60,  name: '느린 발라드' },
  { bpm: 80,  name: '팝 발라드' },
  { bpm: 100, name: '댄스팝' },
  { bpm: 120, name: '일반 팝/락' },
  { bpm: 128, name: 'EDM' },
  { bpm: 140, name: '빠른 댄스' },
  { bpm: 160, name: '힙합' },
]

function MetronomeTab({ active }: { active: boolean }) {
  const [bpm, setBpm] = useState(120)
  const [bpmText, setBpmText] = useState('120')
  const [timeSig, setTimeSig] = useState<TimeSig>('4/4')
  const [playing, setPlaying] = useState(false)
  const [currentBeatDisplay, setCurrentBeatDisplay] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef<number>(0)
  const currentBeatRef = useRef<number>(0)
  const schedulerIdRef = useRef<number | null>(null)
  const bpmRef = useRef(bpm)
  const beatsRef = useRef(TIME_SIG_BEATS[timeSig])

  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsRef.current = TIME_SIG_BEATS[timeSig] }, [timeSig])

  const scheduleNote = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = isAccent ? 1200 : 600
    osc.type = 'square'
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(isAccent ? 0.35 : 0.22, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    osc.start(time)
    osc.stop(time + 0.06)
  }, [])

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const LOOKAHEAD = 0.1
    while (nextNoteTimeRef.current < ctx.currentTime + LOOKAHEAD) {
      const beat = currentBeatRef.current
      const isAccent = beat === 0
      scheduleNote(nextNoteTimeRef.current, isAccent)
      // 시각 동기화: 해당 노트 시간에 박자 표시 업데이트
      const delayMs = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
      const displayBeat = beat
      setTimeout(() => setCurrentBeatDisplay(displayBeat + 1), delayMs)
      nextNoteTimeRef.current += 60 / bpmRef.current
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsRef.current
    }
  }, [scheduleNote])

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctor = typeof window !== 'undefined' ? (w.AudioContext || w.webkitAudioContext) : undefined
      if (!Ctor) return
      audioCtxRef.current = new Ctor()
    }
    const ctx = audioCtxRef.current!
    if (ctx.state === 'suspended') ctx.resume()
    currentBeatRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    setPlaying(true)
  }, [])

  const stop = useCallback(() => {
    setPlaying(false)
    if (schedulerIdRef.current) {
      clearInterval(schedulerIdRef.current)
      schedulerIdRef.current = null
    }
    setCurrentBeatDisplay(0)
  }, [])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(scheduler, 25)
    schedulerIdRef.current = id
    return () => { clearInterval(id); schedulerIdRef.current = null }
  }, [playing, scheduler])

  useEffect(() => () => {
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
  }, [])

  // 다른 탭으로 이동하면 소리 정지 (BPM 등 설정은 유지)
  useEffect(() => {
    if (!active && playing) stop()
  }, [active, playing, stop])

  // 입력창은 원시 문자열 보관 — 백스페이스로 지우고 다시 입력 가능
  const setBpmAll = (n: number) => {
    const c = Math.max(40, Math.min(300, n))
    setBpm(c)
    setBpmText(String(c))
  }
  const handleBpmInput = (v: string) => {
    setBpmText(v)
    const n = parseInt(v)
    if (!isNaN(n)) setBpm(Math.max(40, Math.min(300, n)))
  }

  const beats = TIME_SIG_BEATS[timeSig]
  const isAccentBeat = currentBeatDisplay === 1

  return (
    <div className={styles.tabContent}>
      {/* BPM 입력 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>BPM</div>
        <div className={styles.bpmInputRow}>
          <input
            className={styles.bpmInput}
            type="number"
            inputMode="numeric"
            aria-label="메트로놈 BPM"
            value={bpmText}
            onChange={e => handleBpmInput(e.target.value)}
            onBlur={() => setBpmText(String(bpm))}
            min={40} max={300}
          />
          <span className={styles.bpmUnit}>BPM</span>
        </div>
        <input
          className={styles.bpmSlider}
          type="range" min={40} max={300} step={1}
          aria-label="메트로놈 BPM 슬라이더"
          value={bpm}
          onChange={e => setBpmAll(parseInt(e.target.value))}
        />
        <div className={styles.bpmAdjustRow}>
          <button type="button" className={styles.adjBtn} onClick={() => setBpmAll(bpm - 10)}>-10</button>
          <button type="button" className={styles.adjBtn} onClick={() => setBpmAll(bpm - 1)}>-1</button>
          <button type="button" className={styles.adjBtn} onClick={() => setBpmAll(bpm + 1)}>+1</button>
          <button type="button" className={styles.adjBtn} onClick={() => setBpmAll(bpm + 10)}>+10</button>
        </div>
      </div>

      {/* 박자 선택 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>박자</div>
        <div className={styles.sigRow}>
          {(['2/4','3/4','4/4','6/8'] as TimeSig[]).map(ts => (
            <button
              key={ts}
              type="button"
              aria-pressed={timeSig === ts}
              className={`${styles.sigBtn} ${timeSig === ts ? styles.sigBtnActive : ''}`}
              onClick={() => setTimeSig(ts)}
            >{ts}</button>
          ))}
        </div>
      </div>

      {/* 펄스 원 */}
      <div className={styles.pulseCard}>
        <div
          className={`${styles.pulse} ${playing ? styles.pulseActive : ''} ${isAccentBeat ? styles.pulseAccent : ''}`}
          style={{
            animationDuration: `${60000 / bpm}ms`,
          }}
        >
          <div className={styles.pulseBeat}>
            {playing ? `${currentBeatDisplay || '-'} / ${beats}` : '▶'}
          </div>
        </div>
        <button
          type="button"
          className={`${styles.playBtn} ${playing ? styles.playBtnStop : ''}`}
          onClick={playing ? stop : start}
        >
          {playing ? '⏸ 정지' : '▶ 시작'}
        </button>
      </div>

      {/* 프리셋 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>장르별 프리셋</div>
        <div className={styles.presetRow}>
          {BPM_PRESETS.map(p => (
            <button
              key={p.bpm}
              type="button"
              aria-pressed={bpm === p.bpm}
              className={`${styles.presetBtn} ${bpm === p.bpm ? styles.presetBtnActive : ''}`}
              onClick={() => setBpmAll(p.bpm)}
            >
              <span className={styles.presetBpm}>{p.bpm}</span>
              <span className={styles.presetName}>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 3: 박자감 테스트 ──────────────────────── */
type TestPhase = 'idle' | 'preview' | 'tap' | 'result'

function RhythmTestTab({ active }: { active: boolean }) {
  const [targetBpm, setTargetBpm] = useState(120)
  const [targetText, setTargetText] = useState('120')
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [previewBeat, setPreviewBeat] = useState(0)
  const [taps, setTaps] = useState<number[]>([])
  const [shareCopied, setShareCopied] = useState<'ok' | 'fail' | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const previewTimerRef = useRef<number[]>([])

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctor = typeof window !== 'undefined' ? (w.AudioContext || w.webkitAudioContext) : undefined
      if (!Ctor) return null
      audioCtxRef.current = new Ctor()
    }
    return audioCtxRef.current
  }

  const beep = (isAccent: boolean) => {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = isAccent ? 1200 : 600
    osc.type = 'square'
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(isAccent ? 0.35 : 0.22, t + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    osc.start(t)
    osc.stop(t + 0.06)
  }

  const clearPreviewTimers = () => {
    previewTimerRef.current.forEach(id => clearTimeout(id))
    previewTimerRef.current = []
  }

  const startTest = () => {
    clearPreviewTimers()
    setTaps([])
    setPhase('preview')
    setPreviewBeat(0)
    const intervalMs = 60000 / targetBpm
    const PREVIEW_COUNT = 4
    for (let i = 0; i < PREVIEW_COUNT; i++) {
      const id = window.setTimeout(() => {
        beep(i === 0)
        setPreviewBeat(i + 1)
        if (i === PREVIEW_COUNT - 1) {
          const endId = window.setTimeout(() => {
            setPhase('tap')
            setPreviewBeat(0)
          }, intervalMs)
          previewTimerRef.current.push(endId)
        }
      }, i * intervalMs)
      previewTimerRef.current.push(id)
    }
  }

  const handleTap = () => {
    if (phase !== 'tap') return
    const now = Date.now()
    setTaps(prev => (prev.length >= 8 ? prev : [...prev, now]))
  }

  // 8탭 완료 시 결과 단계로 (updater 안의 setState 부작용 제거)
  useEffect(() => {
    if (phase === 'tap' && taps.length >= 8) setPhase('result')
  }, [phase, taps])

  // 다른 탭으로 이동하면 진행 중이던 미리듣기·탭 단계 중단 (결과는 유지)
  useEffect(() => {
    if (!active && (phase === 'preview' || phase === 'tap')) {
      clearPreviewTimers()
      setPhase('idle')
      setPreviewBeat(0)
      setTaps([])
    }
  }, [active, phase])

  useEffect(() => {
    if (!active || phase !== 'tap') return
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, active])

  useEffect(() => () => clearPreviewTimers(), [])

  const result = useMemo(() => {
    if (phase !== 'result' || taps.length < 2) return null
    const { bpm: actual } = computeBpmFromTaps(taps)
    if (actual == null) return null
    const errPct = Math.abs(actual - targetBpm) / targetBpm * 100
    let stars = 0, title = '', color = 'var(--muted)'
    if (errPct <= 1)       { stars = 3; title = '완벽! 프로 수준입니다';          color = 'var(--success)' }
    else if (errPct <= 3)  { stars = 2; title = '훌륭해요! 리듬감이 뛰어납니다'; color = 'var(--accent-ink)' }
    else if (errPct <= 5)  { stars = 1; title = '좋아요! 조금 더 연습하면 완벽'; color = 'var(--accent-ink)' }
    else if (errPct <= 10) { stars = 0; title = '연습이 필요해요 💪';             color = 'var(--warning)' }
    else                   { stars = 0; title = '메트로놈으로 연습해보세요 🎵';  color = 'var(--danger)' }
    return { actual, errPct, stars, title, color }
  }, [phase, taps, targetBpm])

  const handleShare = async () => {
    if (!result) return
    const text = `나는 BPM ${targetBpm} 목표에서 ${result.actual}을 탭했습니다! (오차 ${result.errPct.toFixed(1)}%) — youtil.kr 박자감 테스트`
    try {
      await navigator.clipboard.writeText(text)
      setShareCopied('ok')
    } catch {
      setShareCopied('fail')
    }
    setTimeout(() => setShareCopied(null), 1500)
  }

  const reset = () => {
    clearPreviewTimers()
    setTaps([])
    setPhase('idle')
    setPreviewBeat(0)
  }

  return (
    <div className={styles.tabContent}>
      {/* 목표 BPM 설정 */}
      {phase === 'idle' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>① 목표 BPM 선택</div>
            <div className={styles.bpmInputRow}>
              <input
                className={styles.bpmInput}
                type="number" inputMode="numeric"
                aria-label="목표 BPM"
                value={targetText}
                onChange={e => {
                  setTargetText(e.target.value)
                  const n = parseInt(e.target.value)
                  if (!isNaN(n)) setTargetBpm(Math.max(60, Math.min(180, n)))
                }}
                onBlur={() => setTargetText(String(targetBpm))}
                min={60} max={180}
              />
              <span className={styles.bpmUnit}>BPM</span>
            </div>
            <input
              className={styles.bpmSlider}
              type="range" min={60} max={180} step={1}
              aria-label="목표 BPM 슬라이더"
              value={targetBpm}
              onChange={e => { setTargetBpm(parseInt(e.target.value)); setTargetText(e.target.value) }}
            />
            <div className={styles.randomRow}>
              <button
                type="button"
                className={styles.ctrlBtn}
                onClick={() => { const n = Math.floor(Math.random() * 121) + 60; setTargetBpm(n); setTargetText(String(n)) }}
              >랜덤 BPM</button>
            </div>
          </div>

          <div className={styles.testInfoCard}>
            <p className={styles.testInfoText}>
              1. 목표 BPM이 메트로놈으로 <strong>4박</strong> 들립니다<br />
              2. 소리가 멈춘 뒤 같은 속도로 <strong>8번 탭</strong>하세요<br />
              3. 탭 BPM과 목표 BPM의 오차로 점수가 계산됩니다
            </p>
            <button type="button" className={styles.startBtn} onClick={startTest}>
              테스트 시작 — {targetBpm} BPM
            </button>
          </div>
        </>
      )}

      {/* Preview phase */}
      {phase === 'preview' && (
        <div className={styles.testStageCard}>
          <div className={styles.testStageLabel}>목표 BPM 미리 듣기</div>
          <div className={styles.testTarget}>{targetBpm}</div>
          <div className={styles.testTargetSub}>BPM</div>
          <div className={styles.previewDots}>
            {[1,2,3,4].map(n => (
              <div
                key={n}
                className={`${styles.previewDot} ${previewBeat >= n ? styles.previewDotActive : ''} ${previewBeat === 1 && n === 1 ? styles.previewDotAccent : ''}`}
              />
            ))}
          </div>
          <p className={styles.testHint}>4박을 들려드린 뒤 탭 단계로 전환됩니다</p>
        </div>
      )}

      {/* Tap phase */}
      {phase === 'tap' && (
        <div className={styles.testStageCard}>
          <div className={styles.testStageLabel}>같은 속도로 탭하세요 — {taps.length}/8</div>
          <button
            type="button"
            className={styles.testTapBtn}
            onPointerDown={handleTap}
            style={{ touchAction: 'manipulation' }}
          >
            TAP
          </button>
          <div className={styles.tapDotsRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className={`${styles.tapDot} ${i < taps.length ? styles.tapDotDone : ''}`}
              />
            ))}
          </div>
          <p className={styles.kbdHint}>
            <kbd>Space</kbd> / <kbd>Enter</kbd> / 화면 터치
          </p>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && result && (
        <div className={styles.resultCard} role="status">
          <div className={styles.resultStars}>
            {'⭐'.repeat(Math.max(1, result.stars))}
            {result.stars === 0 && '💪'}
          </div>
          <div className={styles.resultTitle} style={{ color: result.color }}>
            {result.title}
          </div>
          <div className={styles.resultRow}>
            <div className={styles.resultBlock}>
              <div className={styles.resultSub}>목표</div>
              <div className={styles.resultNum}>{targetBpm}</div>
            </div>
            <div className={styles.resultArrow}>vs</div>
            <div className={styles.resultBlock}>
              <div className={styles.resultSub}>실제 탭</div>
              <div className={styles.resultNum}>{result.actual}</div>
            </div>
          </div>
          <div className={styles.resultErrRow}>
            <div className={styles.resultErrLabel}>오차율</div>
            <div className={styles.resultErrBar}>
              <div
                className={styles.resultErrBarFill}
                style={{ width: `${Math.min(100, result.errPct * 5)}%`, background: result.color }}
              />
            </div>
            <div className={styles.resultErrValue}>{result.errPct.toFixed(1)}%</div>
          </div>
          <div className={styles.resultActions}>
            <button type="button" className={styles.ctrlBtn} onClick={reset}>↺ 다시 하기</button>
            <button type="button" className={`${styles.ctrlBtn} ${shareCopied === 'ok' ? styles.ctrlBtnActive : ''}`} onClick={handleShare}>
              {shareCopied === 'ok' ? '✓ 복사됨' : shareCopied === 'fail' ? '✗ 복사 실패' : '결과 복사'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── 메인 ──────────────────────── */
export default function TapTempoClient() {
  const [tab, setTab] = useState<'tap' | 'metronome' | 'test'>('tap')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button type="button" aria-pressed={tab === 'tap'} className={`${styles.tab} ${tab === 'tap'       ? styles.tabActive : ''}`} onClick={() => setTab('tap')}>
          탭 템포
        </button>
        <button type="button" aria-pressed={tab === 'metronome'} className={`${styles.tab} ${tab === 'metronome' ? styles.tabActive : ''}`} onClick={() => setTab('metronome')}>
          메트로놈
        </button>
        <button type="button" aria-pressed={tab === 'test'} className={`${styles.tab} ${tab === 'test'      ? styles.tabActive : ''}`} onClick={() => setTab('test')}>
          박자감 테스트
        </button>
      </div>

      {/* 탭 전환 시 상태 보존 — 언마운트 대신 hidden (메트로놈·테스트 소리는 이탈 시 정지) */}
      <div hidden={tab !== 'tap'}><TapTempoTab active={tab === 'tap'} /></div>
      <div hidden={tab !== 'metronome'}><MetronomeTab active={tab === 'metronome'} /></div>
      <div hidden={tab !== 'test'}><RhythmTestTab active={tab === 'test'} /></div>
    </div>
  )
}
