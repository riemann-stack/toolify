'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './pomodoro.module.css'
import {
  Phase, PHASES, POMODORO_PRESETS, SOUND_THEMES, AMBIENT_SOUNDS,
  PomodoroSession, loadSessions, saveSessions, newId, todayStr,
  getDailyStats, getInsights, DOW_KO, DAILY_GOAL_OPTIONS,
  requestNotifPermission, sendNotif, playSound, fmtMinHour,
} from './pomodoroUtils'

type Tab = 'timer' | 'stats' | 'settings' | 'guide'

const TABS: { id: Tab; label: string }[] = [
  { id: 'timer',    label: '타이머' },
  { id: 'stats',    label: '통계' },
  { id: 'settings', label: '설정·기법' },
  { id: 'guide',    label: '가이드' },
]

const ORIG_TITLE = '뽀모도로 타이머 — 집중력 향상 25분 공부 타이머'

export default function PomodoroClient() {
  const [tab, setTab] = useState<Tab>('timer')

  // 시간 설정
  const [focusMin,  setFocusMin]  = useState(25)
  const [shortMin,  setShortMin]  = useState(5)
  const [longMin,   setLongMin]   = useState(15)
  const [longEvery, setLongEvery] = useState(4)
  const [activePreset, setActivePreset] = useState('classic')

  // 타이머 상태
  const [phase,     setPhase]    = useState<Phase>('focus')
  const [seconds,   setSeconds]  = useState(25 * 60)
  const [running,   setRunning]  = useState(false)
  const [cycle,     setCycle]    = useState(1)
  const [completed, setCompleted]= useState(0)
  const [task, setTask] = useState('')

  // 옵션
  const [soundId, setSoundId] = useState('bell')
  const [notifOn, setNotifOn] = useState(false)
  const [autoNext, setAutoNext] = useState(false)
  const [tickTitle, setTickTitle] = useState(true)
  const [dailyGoal, setDailyGoal] = useState<number>(8)

  // 데이터
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [hydrated, setHydrated] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const startSecondsRef = useRef<number>(0)
  const totalRef = useRef(25 * 60)

  // ── 초기 로드 ──
  useEffect(() => {
    setSessions(loadSessions())
    try {
      const opts = JSON.parse(localStorage.getItem('pomodoro:opts:v1') ?? '{}')
      if (opts.focusMin) setFocusMin(opts.focusMin)
      if (opts.shortMin) setShortMin(opts.shortMin)
      if (opts.longMin)  setLongMin(opts.longMin)
      if (opts.longEvery) setLongEvery(opts.longEvery)
      if (opts.soundId)   setSoundId(opts.soundId)
      if (typeof opts.autoNext === 'boolean')  setAutoNext(opts.autoNext)
      if (typeof opts.tickTitle === 'boolean') setTickTitle(opts.tickTitle)
      if (typeof opts.notifOn === 'boolean')   setNotifOn(opts.notifOn)
      if (opts.dailyGoal) setDailyGoal(opts.dailyGoal)
      if (opts.activePreset) setActivePreset(opts.activePreset)
      // 저장된 집중 시간 → 초기 타이머 동기화는 위의 '단계 시간 동기화' effect가 처리
    } catch {}
    setHydrated(true)
  }, [])

  // ── 옵션 저장 ──
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('pomodoro:opts:v1', JSON.stringify({
        focusMin, shortMin, longMin, longEvery, soundId,
        autoNext, tickTitle, notifOn, dailyGoal, activePreset,
      }))
    } catch {}
  }, [hydrated, focusMin, shortMin, longMin, longEvery, soundId, autoNext, tickTitle, notifOn, dailyGoal, activePreset])

  const getTotal = useCallback((p: Phase) => {
    if (p === 'focus') return focusMin * 60
    if (p === 'short') return shortMin * 60
    return longMin * 60
  }, [focusMin, shortMin, longMin])

  // ── 현재 단계의 설정 시간이 바뀌면(정지 상태) 타이머를 새 시간으로 동기화 ──
  // 스테퍼·프리셋·저장 옵션 복원을 한 곳에서 처리 (한 박자 늦게 적용되는 stale-closure 방지)
  // running은 의도적으로 deps에서 제외 — 일시정지 시 남은 시간을 보존하기 위함
  useEffect(() => {
    if (running) return
    const t = getTotal(phase)
    totalRef.current = t
    setSeconds(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, focusMin, shortMin, longMin])

  // ── 페이즈 완료 처리 ──
  const handleComplete = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    // 새 단계는 타임스탬프 기준 시각을 다시 잡아야 함 (autoNext가 옛 기준으로 즉시 완료되는 것 방지)
    startedAtRef.current = null

    const theme = SOUND_THEMES.find(t => t.id === soundId) ?? SOUND_THEMES[0]
    playSound(theme)

    const completedPhase = phase
    const completedDuration = Math.round(getTotal(completedPhase) / 60)

    // 세션 기록
    const session: PomodoroSession = {
      id: newId(),
      date: todayStr(),
      ts: Date.now(),
      task: task.trim() || (completedPhase === 'focus' ? '(작업 미입력)' : '휴식'),
      phase: completedPhase,
      durationMin: completedDuration,
      preset: activePreset,
    }
    const updated = [...sessions, session]
    setSessions(updated)
    saveSessions(updated)

    // 알림
    if (notifOn) {
      const nextPhase = completedPhase === 'focus'
        ? ((completed + 1) % longEvery === 0 ? 'long' : 'short')
        : 'focus'
      sendNotif(
        completedPhase === 'focus' ? '🍅 집중 완료!' : '✅ 휴식 완료!',
        completedPhase === 'focus'
          ? `잘하셨어요. ${PHASES[nextPhase].label}을 시작하세요.`
          : '다시 집중할 시간입니다.'
      )
    }

    // 다음 단계로 이동
    if (completedPhase === 'focus') {
      const newCompleted = completed + 1
      setCompleted(newCompleted)
      const nextPhase: Phase = newCompleted % longEvery === 0 ? 'long' : 'short'
      setPhase(nextPhase)
      const total = getTotal(nextPhase)
      totalRef.current = total
      setSeconds(total)
      if (autoNext) setRunning(true)
    } else {
      setCycle(cycle + 1)
      setPhase('focus')
      const total = getTotal('focus')
      totalRef.current = total
      setSeconds(total)
      if (autoNext) setRunning(true)
    }
  }, [phase, soundId, task, activePreset, sessions, notifOn, completed, longEvery, autoNext, cycle, getTotal])

  // ── 타이머 실행 (timestamp 기반으로 정확도 ↑) ──
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      startedAtRef.current = null
      return
    }
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now()
      startSecondsRef.current = seconds
    }
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000)
      const remain = startSecondsRef.current - elapsed
      if (remain <= 0) {
        setSeconds(0)
        handleComplete()
      } else {
        setSeconds(remain)
      }
    }, 250)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, handleComplete, seconds])

  // ── 탭 타이틀 동적 변경 ──
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!tickTitle) {
      document.title = ORIG_TITLE
      return
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const t = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    const emoji = phase === 'focus' ? '🍅' : (phase === 'short' ? '☕' : '🌙')
    document.title = running ? `${emoji} ${t} — ${PHASES[phase].label}` : ORIG_TITLE
    return () => { document.title = ORIG_TITLE }
  }, [seconds, phase, running, tickTitle])

  // ── 키보드 단축키 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      // 포커스가 입력·버튼 등 인터랙티브 요소에 있으면 단축키 비활성 (Space가 버튼 클릭과 중복 발동되는 것 방지)
      if (target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' || target.tagName === 'SELECT' ||
        target.tagName === 'A' || target.isContentEditable
      )) return
      if (e.key === ' ') { e.preventDefault(); setRunning(r => !r) }
      else if (e.key === 'r' || e.key === 'R') { handleReset() }
      else if (e.key === 's' || e.key === 'S') { handleNext() }
      else if (e.key === '1') { switchPhase('focus') }
      else if (e.key === '2') { switchPhase('short') }
      else if (e.key === '3') { switchPhase('long') }
      else if (e.key === 'f' || e.key === 'F') {
        document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, longEvery, completed])

  // ── 액션 ──
  const switchPhase = (p: Phase) => {
    setRunning(false)
    setPhase(p)
    const total = getTotal(p)
    totalRef.current = total
    setSeconds(total)
  }

  const handleStart = async () => {
    if (notifOn) await requestNotifPermission()
    setRunning(true)
  }
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
      // 건너뛰기는 '완료'가 아님 → completed(긴 휴식 카운트·통계 기준) 미증가, 짧은 휴식으로만 이동
      switchPhase('short')
    } else {
      setCycle(cycle + 1)
      switchPhase('focus')
    }
  }

  const applyPreset = (id: string) => {
    const p = POMODORO_PRESETS.find(x => x.id === id)
    if (!p) return
    setActivePreset(id)
    setFocusMin(p.focus)
    setShortMin(p.short)
    setLongMin(p.long)
    setLongEvery(p.every)
    setRunning(false)
    setPhase('focus')
    // 프리셋은 새 사이클로 시작 — 이전 프리셋의 사이클/완료 수 이어받지 않음
    setCycle(1)
    setCompleted(0)
    const total = p.focus * 60
    totalRef.current = total
    setSeconds(total)
  }

  const total = getTotal(phase)
  const progress = total > 0 ? seconds / total : 0
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const R = 100
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * progress
  const phaseColor = PHASES[phase].color

  // ── 통계 데이터 ──
  const insights = getInsights(sessions)
  const last7 = getDailyStats(sessions, 7)
  const maxBar = Math.max(1, ...last7.map(d => d.focusCount))
  const todayHistory = sessions
    .filter(s => s.date === todayStr())
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 30)

  return (
    <div className={styles.wrap}>

      {/* ── 탭 네비 ── */}
      <div className={styles.tabs} role="tablist" aria-label="뽀모도로 도구 모드">
        {TABS.map(t => (
          <button key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 타이머 탭                                                    */}
      {/* ============================================================ */}
      {tab === 'timer' && (
        <>
          {/* 작업 입력 */}
          <input
            type="text"
            className={styles.taskInput}
            placeholder="지금 집중할 작업을 입력하세요 (예: 영어 단어 100개 외우기)"
            value={task}
            onChange={e => setTask(e.target.value)}
            maxLength={60}
            aria-label="집중할 작업 이름"
          />

          {/* 페이즈 선택 */}
          <div className={styles.phaseRow} role="group" aria-label="타이머 단계 선택">
            {(Object.keys(PHASES) as Phase[]).map(p => (
              <button key={p}
                type="button"
                aria-pressed={phase === p}
                className={`${styles.phaseBtn} ${phase === p ? styles.phaseBtnActive : ''}`}
                style={phase === p ? { borderColor: PHASES[p].color, color: PHASES[p].color } : {}}
                onClick={() => switchPhase(p)}>
                {PHASES[p].label}
              </button>
            ))}
          </div>

          {/* 원형 타이머 */}
          <div className={styles.timerWrap}>
            <svg width="100%" height="100%" viewBox="0 0 240 240" aria-hidden="true">
              <circle cx="120" cy="120" r={R} fill="none" stroke="var(--bg3)" strokeWidth="10" />
              <circle cx="120" cy="120" r={R} fill="none"
                stroke={phaseColor} strokeWidth="10"
                strokeDasharray={`${dash} ${CIRC}`}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className={styles.timerCenter}>
              <div className={styles.timerPhase} style={{ color: phaseColor }}>{PHASES[phase].label}</div>
              <div className={styles.timerTime}>{timeStr}</div>
              <div className={styles.timerCycle}>#{cycle} 사이클</div>
              {task.trim() && phase === 'focus' && (
                <div className={styles.timerTask}>{task}</div>
              )}
            </div>
          </div>

          {/* 컨트롤 */}
          <div className={styles.controls}>
            <button type="button" className={styles.ctrlBtn} onClick={handleReset} title="리셋 (R)" aria-label="현재 단계 리셋 (단축키 R)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
            <button type="button" className={styles.mainBtn}
              style={{ background: phaseColor }}
              onClick={running ? handlePause : handleStart}
              aria-label={running ? '일시정지 (단축키 Space)' : (seconds < total ? '재개 (단축키 Space)' : '시작 (단축키 Space)')}>
              {running ? '일시정지' : (seconds < total ? '재개' : '시작')}
            </button>
            <button type="button" className={styles.ctrlBtn} onClick={handleNext} title="건너뛰기 (S)" aria-label="다음 단계로 건너뛰기 (단축키 S)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="5,4 15,12 5,20"/><line x1="19" y1="5" x2="19" y2="19"/>
              </svg>
            </button>
          </div>

          {/* 진행 현황 */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNum} style={{ color: PHASES.focus.color }}>{insights.todayCount}</div>
              <div className={styles.statLabel}>오늘 완료</div>
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

          {/* 일일 목표 */}
          <div className={styles.card}>
            <div className={styles.goalRow}>
              <span className={styles.goalLabel}>오늘 목표</span>
              <div className={styles.goalDots} aria-hidden="true">
                {Array.from({ length: dailyGoal }).map((_, i) => (
                  <div key={i} className={`${styles.goalDot} ${i < insights.todayCount ? styles.goalDotDone : ''}`} />
                ))}
              </div>
              <span className={styles.goalLabel}>{insights.todayCount} / {dailyGoal}</span>
            </div>
            <div className={styles.kbdRow}>
              <span className={styles.kbd}><strong>Space</strong> 시작/정지</span>
              <span className={styles.kbd}><strong>R</strong> 리셋</span>
              <span className={styles.kbd}><strong>S</strong> 건너뛰기</span>
              <span className={styles.kbd}><strong>1·2·3</strong> 단계전환</span>
              <span className={styles.kbd}><strong>F</strong> 전체화면</span>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 통계 탭                                                      */}
      {/* ============================================================ */}
      {tab === 'stats' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className={styles.bigStat}>
              <div className={styles.bigStatLabel}>오늘 집중</div>
              <div className={styles.bigStatValue}>{insights.todayCount}회</div>
              <div className={styles.bigStatHint}>{fmtMinHour(insights.todayMin)}</div>
            </div>
            <div className={styles.bigStat}>
              <div className={styles.bigStatLabel}>이번 주 (7일)</div>
              <div className={styles.bigStatValue}>{insights.weekCount}회</div>
              <div className={styles.bigStatHint}>{fmtMinHour(insights.weekMin)}</div>
            </div>
            <div className={styles.bigStat}>
              <div className={styles.bigStatLabel}>최근 30일</div>
              <div className={styles.bigStatValue}>{insights.monthCount}회</div>
              <div className={styles.bigStatHint}>{fmtMinHour(insights.monthMin)}</div>
            </div>
            <div className={styles.bigStat}>
              <div className={styles.bigStatLabel}>연속 일수</div>
              <div className={styles.bigStatValue}>{insights.streak}일 🔥</div>
              <div className={styles.bigStatHint}>매일 1회 이상 집중 시 카운트</div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>최근 7일 집중 횟수</label>
            <div className={styles.barChart}>
              {last7.map((d, i) => {
                const dt = new Date(d.date.replace(/-/g, '/'))
                const h = (d.focusCount / maxBar) * 90 + 4
                return (
                  <div key={i} className={styles.barCol}>
                    <div className={styles.bar} style={{ height: `${h}px`, background: d.focusCount > 0 ? '#0EA5E9' : 'var(--bg3)' }} />
                    <div className={styles.barLabel}>{DOW_KO[dt.getDay()]}</div>
                    <div className={styles.barLabel}>{d.focusCount}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 인사이트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {insights.bestHour !== null && (
              <div className={styles.insightCard}>
                <span className={styles.insightIcon}>🌅</span>
                <div>
                  <div className={styles.insightTitle}>가장 집중 잘 되는 시간대</div>
                  <div className={styles.insightDesc}>
                    <strong style={{ color: 'var(--text)' }}>{insights.bestHour}시 ~ {insights.bestHour + 1}시</strong> 사이에 가장 많이 집중했습니다. 이 시간대에 가장 어려운 작업을 배치해보세요.
                  </div>
                </div>
              </div>
            )}
            {insights.bestDayOfWeek !== null && (
              <div className={styles.insightCard}>
                <span className={styles.insightIcon}>📅</span>
                <div>
                  <div className={styles.insightTitle}>가장 생산적인 요일</div>
                  <div className={styles.insightDesc}>
                    <strong style={{ color: 'var(--text)' }}>{DOW_KO[insights.bestDayOfWeek]}요일</strong>에 가장 많이 집중했습니다.
                  </div>
                </div>
              </div>
            )}
            <div className={styles.insightCard}>
              <span className={styles.insightIcon}>📊</span>
              <div>
                <div className={styles.insightTitle}>전체 누적</div>
                <div className={styles.insightDesc}>
                  지금까지 <strong style={{ color: 'var(--text)' }}>{insights.totalCount}회</strong> 집중 ({fmtMinHour(insights.totalMin)}). 90일 이전 기록은 자동 정리됩니다.
                </div>
              </div>
            </div>
          </div>

          {/* 오늘 기록 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>오늘 완료한 세션</label>
            {todayHistory.length === 0 ? (
              <div className={styles.emptyState}>아직 기록이 없습니다. 첫 세션을 시작해 보세요 🍅</div>
            ) : (
              <div className={styles.historyList}>
                {todayHistory.map(s => {
                  const d = new Date(s.ts)
                  const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                  return (
                    <div key={s.id} className={styles.historyRow}>
                      <span className={styles.historyTime}>{t}</span>
                      <span className={styles.historyTask}>
                        {s.phase === 'focus' ? '🍅' : (s.phase === 'short' ? '☕' : '🌙')} {s.task}
                      </span>
                      <span className={styles.historyDur}>{s.durationMin}분</span>
                    </div>
                  )
                })}
              </div>
            )}
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('전체 기록을 삭제하시겠습니까?')) {
                    setSessions([]); saveSessions([])
                  }
                }}
                style={{ marginTop: 10, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                전체 기록 삭제
              </button>
            )}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 설정·기법 탭                                                 */}
      {/* ============================================================ */}
      {tab === 'settings' && (
        <>
          {/* 시간 직접 설정 (간단 변경 편의를 위해 프리셋보다 먼저 노출) */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>시간 직접 설정 (분)</label>
            <div className={styles.settingsGrid}>
              {[
                { label: '집중', value: focusMin, set: setFocusMin, min: 1, max: 120 },
                { label: '짧은 휴식', value: shortMin, set: setShortMin, min: 1, max: 30 },
                { label: '긴 휴식', value: longMin, set: setLongMin, min: 1, max: 60 },
                { label: '긴 휴식 주기', value: longEvery, set: setLongEvery, min: 2, max: 10 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} className={styles.settingItem} role="group" aria-label={label}>
                  <div className={styles.settingLabel}>{label}</div>
                  <div className={styles.settingRow}>
                    <button type="button" className={styles.settingBtn} aria-label={`${label} 줄이기`}
                      onClick={() => { if (value > min) { set(value - 1); setActivePreset('custom') } }}>−</button>
                    <span className={styles.settingValue} aria-live="polite">{value}</span>
                    <button type="button" className={styles.settingBtn} aria-label={`${label} 늘리기`}
                      onClick={() => { if (value < max) { set(value + 1); setActivePreset('custom') } }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 프리셋 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>상황별 프리셋 7가지</label>
            <div className={styles.presetGrid}>
              {POMODORO_PRESETS.map(p => (
                <button key={p.id}
                  type="button"
                  aria-pressed={activePreset === p.id}
                  aria-label={`${p.name}: 집중 ${p.focus}분, 휴식 ${p.short}분, 긴 휴식 ${p.long}분`}
                  className={`${styles.presetCard} ${activePreset === p.id ? styles.presetCardActive : ''}`}
                  onClick={() => applyPreset(p.id)}>
                  {p.badge && <span className={styles.presetBadge}>{p.badge}</span>}
                  <div className={styles.presetTitle}>{p.emoji} {p.name}</div>
                  <div className={styles.presetTime}>집중 {p.focus}분 · 휴식 {p.short}분 · 긴 휴식 {p.long}분 ({p.every}회마다)</div>
                  <div className={styles.presetDesc}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 알림음 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>알림음 테마</label>
            <div className={styles.soundList} role="group" aria-label="알림음 테마 선택">
              {SOUND_THEMES.map(t => (
                <div key={t.id}
                  className={`${styles.soundRow} ${soundId === t.id ? styles.soundRowActive : ''}`}>
                  <button type="button"
                    className={styles.soundSelect}
                    aria-pressed={soundId === t.id}
                    aria-label={`알림음 ${t.name.replace(/[^가-힣a-zA-Z0-9 ]/g, '').trim()} 선택`}
                    onClick={() => setSoundId(t.id)}>
                    <span className={styles.soundName}>{t.name}</span>
                    <span className={styles.soundDesc}>{t.desc}</span>
                  </button>
                  <button type="button" className={styles.soundTest}
                    aria-label={`${t.name.replace(/[^가-힣a-zA-Z0-9 ]/g, '').trim()} 미리듣기`}
                    onClick={() => playSound(t)}>
                    들어보기
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 옵션 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>편의 옵션</label>
            <div className={styles.optionRow}>
              <div>
                <div className={styles.optionLabel}>브라우저 알림</div>
                <div className={styles.optionDesc}>다른 탭에서 작업 중에도 완료를 알려줍니다.</div>
              </div>
              <button type="button" role="switch" aria-checked={notifOn} aria-label="브라우저 알림"
                className={`${styles.toggle} ${notifOn ? styles.toggleOn : ''}`}
                onClick={async () => {
                  if (!notifOn) {
                    const p = await requestNotifPermission()
                    setNotifOn(p === 'granted')
                  } else setNotifOn(false)
                }}>
                <span className={styles.toggleDot} />
              </button>
            </div>
            <div className={styles.optionRow}>
              <div>
                <div className={styles.optionLabel}>자동 다음 단계</div>
                <div className={styles.optionDesc}>집중·휴식 완료 후 자동으로 다음 단계 시작.</div>
              </div>
              <button type="button" role="switch" aria-checked={autoNext} aria-label="자동 다음 단계"
                className={`${styles.toggle} ${autoNext ? styles.toggleOn : ''}`}
                onClick={() => setAutoNext(!autoNext)}>
                <span className={styles.toggleDot} />
              </button>
            </div>
            <div className={styles.optionRow}>
              <div>
                <div className={styles.optionLabel}>탭 제목에 시간 표시</div>
                <div className={styles.optionDesc}>브라우저 탭 제목에 남은 시간이 실시간 표시됩니다.</div>
              </div>
              <button type="button" role="switch" aria-checked={tickTitle} aria-label="탭 제목에 시간 표시"
                className={`${styles.toggle} ${tickTitle ? styles.toggleOn : ''}`}
                onClick={() => setTickTitle(!tickTitle)}>
                <span className={styles.toggleDot} />
              </button>
            </div>
          </div>

          {/* 일일 목표 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>오늘 집중 목표</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="오늘 집중 목표 횟수">
              {DAILY_GOAL_OPTIONS.map(n => (
                <button key={n}
                  type="button"
                  aria-pressed={dailyGoal === n}
                  onClick={() => setDailyGoal(n)}
                  style={{
                    background: dailyGoal === n ? 'var(--accent)' : 'var(--bg3)',
                    color: dailyGoal === n ? '#0D0D0D' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif',
                  }}>
                  {n}회
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 가이드 탭                                                    */}
      {/* ============================================================ */}
      {tab === 'guide' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>뽀모도로 4단계 사이클</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { step: '1', title: '계획', desc: '한 뽀모도로(25분) 안에 끝낼 수 있는 작업을 고릅니다. 너무 크면 쪼개세요.' },
                { step: '2', title: '집중', desc: '타이머 종료 전까지 한 작업에만 몰입합니다. 알림 차단·휴대폰 멀리.' },
                { step: '3', title: '휴식', desc: '5분 휴식: 일어서기·물·창밖 보기. SNS·뉴스는 피하세요.' },
                { step: '4', title: '긴 휴식', desc: '4사이클(2시간) 후 15~30분 긴 휴식. 산책·낮잠 등 뇌를 식혀주세요.' },
              ].map(s => (
                <div key={s.step} className={styles.guideCard}>
                  <span className={styles.guideEmoji} style={{ color: '#0EA5E9', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{s.step}</span>
                  <div>
                    <div className={styles.guideTitle}>{s.title}</div>
                    <div className={styles.guideDesc}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>집중에 도움 되는 백색소음·앰비언트</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {AMBIENT_SOUNDS.map(s => (
                <div key={s.id} className={styles.guideCard}>
                  <span className={styles.guideEmoji}>{s.emoji}</span>
                  <div>
                    <div className={styles.guideTitle}>{s.name}</div>
                    <div className={styles.guideDesc}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
              ※ 음원 직접 재생은 제공하지 않습니다. YouTube, Spotify, 노이즐리(noisli.com) 등에서 검색해 활용하세요.
            </p>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>집중력 향상 팁 7가지</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { e: '📵', t: '알림 끄기', d: '스마트폰을 무음·뒤집어 놓거나 다른 방에 두세요. 한 연구(G. Mark 등)에선 한 번 흐트러지면 원래 작업으로 돌아오는 데 평균 약 23분이 걸린다고 보고합니다.' },
                { e: '🧘', t: '한 번에 하나만', d: '동시에 여러 일을 하면 작업 전환 비용 때문에 생산성과 정확도가 떨어진다는 연구가 많습니다. 한 뽀모도로 = 한 작업.' },
                { e: '💧', t: '수분 보충', d: '가벼운 탈수도 집중력·기분에 부정적 영향을 줄 수 있습니다. 휴식마다 한 모금씩.' },
                { e: '🪟', t: '시야 환기', d: '20-20-20 규칙: 20분마다 20피트(6m) 떨어진 곳을 20초간 보세요. 안구 피로 ↓' },
                { e: '🍫', t: '간단한 보상', d: '4사이클 완료 시 좋아하는 음악·간식 등으로 도파민을 보상해 습관화.' },
                { e: '📝', t: '딴 생각 메모', d: '집중 중 떠오른 다른 일은 즉시 종이에 적고 다음 휴식에 처리.' },
                { e: '😴', t: '수면이 우선', d: '6시간 이하 수면은 뽀모도로 효과를 반감시킵니다. 7시간 이상 권장.' },
              ].map((it, i) => (
                <div key={i} className={styles.guideCard}>
                  <span className={styles.guideEmoji}>{it.e}</span>
                  <div>
                    <div className={styles.guideTitle}>{it.t}</div>
                    <div className={styles.guideDesc}>{it.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 면책 */}
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, lineHeight: 1.7 }}>
        ⚠️ 본 도구는 집중 보조용 타이머이며, 학습·업무 효과는 개인의 컨디션·환경·작업 성격에 따라 달라집니다. 충분한 수면·휴식·운동이 어떤 시간 관리 기법보다 우선합니다. 무리한 연속 사용은 권장하지 않습니다.
      </p>
    </div>
  )
}
