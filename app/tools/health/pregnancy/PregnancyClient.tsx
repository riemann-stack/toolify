'use client'

import { useState, useMemo } from 'react'
import styles from './pregnancy.module.css'

type InputMode = 'lmp' | 'conception' | 'duedate'

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function diffDays(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function fmtWeek(totalDays: number) {
  const weeks = Math.floor(totalDays / 7)
  const days  = totalDays % 7
  return { weeks, days }
}

const TRIMESTERS = [
  { label: '1삼분기', range: '1~13주', desc: '임신 초기. 기본 장기 형성, 입덧 시작', color: '#3EC8FF' },
  { label: '2삼분기', range: '14~27주', desc: '안정기. 태동 시작, 성별 확인 가능',    color: '#3EFF9B' },
  { label: '3삼분기', range: '28~40주', desc: '후기. 태아 급성장, 출산 준비',         color: '#FF8C3E' },
]

export default function PregnancyClient() {
  const [mode,  setMode]  = useState<InputMode>('lmp')
  const [date1, setDate1] = useState('')  // 마지막 생리일 또는 수정일 또는 출산예정일

  const result = useMemo(() => {
    if (!date1) return null
    const input = new Date(date1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let lmp: Date
    let dueDate: Date

    if (mode === 'lmp') {
      lmp     = input
      dueDate = addDays(lmp, 280) // 40주
    } else if (mode === 'conception') {
      lmp     = addDays(input, -14) // 수정일 = 생리일 + 14일
      dueDate = addDays(lmp, 280)
    } else {
      dueDate = input
      lmp     = addDays(dueDate, -280)
    }

    const elapsed   = diffDays(lmp, today)
    const remaining = diffDays(today, dueDate)

    if (elapsed < 0) return null // 아직 임신 전

    const { weeks, days } = fmtWeek(elapsed)

    // 삼분기 판정
    let trimester = 1
    if (weeks >= 28) trimester = 3
    else if (weeks >= 14) trimester = 2

    // 진행률
    const progress = Math.min(100, Math.round((elapsed / 280) * 100))

    // 주요 검사 일정
    const schedules = [
      { week: 8,  label: '첫 산전 검사', done: weeks >= 8 },
      { week: 11, label: '기형아 1차 검사 (NT)', done: weeks >= 11 },
      { week: 16, label: '기형아 2차 검사 (쿼드)', done: weeks >= 16 },
      { week: 20, label: '정밀 초음파', done: weeks >= 20 },
      { week: 24, label: '임신성 당뇨 검사', done: weeks >= 24 },
      { week: 32, label: '태아 성장 초음파', done: weeks >= 32 },
      { week: 36, label: 'GBS 검사', done: weeks >= 36 },
    ]

    return {
      weeks, days, elapsed, remaining,
      lmpDate: fmtDate(lmp),
      dueDate: fmtDate(dueDate),
      trimester,
      progress,
      schedules,
      isDone: remaining <= 0,
    }
  }, [date1, mode])

  const modeLabels: Record<InputMode, string> = {
    lmp:       '마지막 생리 시작일',
    conception:'수정일 (배란일)',
    duedate:   '출산 예정일',
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.card}>
        <label className={styles.cardLabel}>입력 방식</label>
        <div className={styles.modeRow}>
          {(Object.keys(modeLabels) as InputMode[]).map(m => (
            <button key={m}
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode(m); setDate1('') }}>
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>{modeLabels[mode]}</label>
        <input className={styles.dateInput} type="date" value={date1}
          onChange={e => setDate1(e.target.value)} />
      </div>

      {result ? (
        <>
          {/* 현재 임신 주수 */}
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>현재 임신 주수</div>
            <div className={styles.heroNum}>
              {result.weeks}주 {result.days}일
            </div>
            <div className={styles.heroSub}>
              {result.isDone
                ? '출산 예정일이 지났습니다 🎉'
                : `출산 예정일까지 D-${result.remaining}`}
            </div>
          </div>

          {/* 진행률 바 */}
          <div className={styles.card}>
            <div className={styles.progressHeader}>
              <span className={styles.cardLabel}>임신 진행률</span>
              <span className={styles.progressPct}>{result.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${result.progress}%` }} />
            </div>
            <div className={styles.trimesterRow}>
              {TRIMESTERS.map((t, i) => (
                <div key={i} className={`${styles.trimesterItem} ${result.trimester === i + 1 ? styles.trimesterActive : ''}`}
                  style={result.trimester === i + 1 ? { borderColor: t.color, color: t.color } : {}}>
                  <span className={styles.trimesterLabel}>{t.label}</span>
                  <span className={styles.trimesterRange}>{t.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 주요 날짜 */}
          <div className={styles.grid2}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>마지막 생리일</div>
              <div className={styles.statValue}>{result.lmpDate}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>출산 예정일</div>
              <div className={`${styles.statValue} ${styles.accentValue}`}>{result.dueDate}</div>
            </div>
          </div>

          {/* 검사 일정 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>주요 산전 검사 일정</label>
            <div className={styles.scheduleList}>
              {result.schedules.map((s, i) => (
                <div key={i} className={`${styles.scheduleItem} ${s.done ? styles.scheduleDone : ''}`}>
                  <span className={styles.scheduleCheck}>{s.done ? '✓' : '○'}</span>
                  <span className={styles.scheduleWeek}>{s.week}주</span>
                  <span className={styles.scheduleLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>날짜를 입력하면 임신 주수가 계산됩니다</div>
      )}
    </div>
  )
}