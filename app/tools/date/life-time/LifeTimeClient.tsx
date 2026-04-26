'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './life-time.module.css'

/* ─────────────────────────────────────────────────────────
 * 활동·격언 데이터
 * ───────────────────────────────────────────────────────── */
const ACTIVITIES = [
  { id: 'read',   icon: '📖', label: '독서',          proverb: '1만 시간이면 어떤 분야의 전문가가 될 수 있는 시간입니다.' },
  { id: 'sport',  icon: '🏃', label: '운동',          proverb: '주 5회 30분 운동만으로도 평균 수명이 약 4년 늘어난다는 연구가 있습니다 (Lancet, 2017).' },
  { id: 'create', icon: '🎨', label: '창작',          proverb: '매일 30분의 창작은 5년이면 한 권의 책, 한 장의 앨범이 됩니다.' },
  { id: 'family', icon: '👨‍👩‍👧', label: '가족 시간',  proverb: '함께한 시간의 양이 곧 관계의 깊이입니다.' },
  { id: 'side',   icon: '💼', label: '사이드 프로젝트', proverb: '하루 30분의 사이드 프로젝트는 5년 후 부업·이직·창업의 기반이 됩니다.' },
  { id: 'medi',   icon: '🧘', label: '명상',          proverb: '하루 10분 명상은 스트레스 호르몬을 약 25% 줄인다는 보고가 있습니다 (Harvard, 2011).' },
  { id: 'music',  icon: '🎵', label: '악기 연습',     proverb: '1시간씩 5년이면 오케스트라 수준 연주가 가능합니다.' },
  { id: 'lang',   icon: '🌐', label: '외국어 학습',   proverb: '하루 30분, 2년이면 일상 회화·간단한 업무 가능 수준에 도달합니다.' },
] as const
type ActivityId = typeof ACTIVITIES[number]['id']

const MEDITATIONS = [
  { text: '시간은 줄어드는 것이 아니라, 선택으로 채워지는 것입니다.', author: null },
  { text: '당신이 가진 가장 비싼 자원은 시간입니다.', author: '워런 버핏' },
  { text: '메멘토 모리, 카르페 디엠 — 죽음을 기억하고, 오늘을 살아라.', author: '라틴 격언' },
  { text: '삶이 짧은 게 아니라, 우리가 시간을 낭비할 뿐이다.', author: '세네카' },
  { text: '시간을 누군가에게 주는 것은 가장 진심 어린 선물입니다.', author: null },
  { text: '오늘 죽을 수 있는 것처럼 행동하라. 그러나 영원히 살 것처럼 계획하라.', author: '마르쿠스 아우렐리우스' },
  { text: '하루를 시작할 때마다 자신에게 말하라 — 오늘은 다시 오지 않는다.', author: '에픽테토스' },
]

/* 기대수명 프리셋 */
const EXPECTANCY_PRESETS = [
  { id: 'kor_m', label: '🇰🇷 한국 남성 평균', value: 80.9 },
  { id: 'kor_f', label: '🇰🇷 한국 여성 평균', value: 86.7 },
  { id: 'who',   label: '🌐 WHO 글로벌 평균', value: 73.4 },
  { id: 'cent',  label: '✨ 100세 시대',       value: 100  },
]

type Mode = 'growth' | 'balance' | 'memento'
type ModeStage = 'pickMode' | 'mementoConfirm' | 'show'

/* 안전한 정수 파싱 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}

/* 일자 한국어 콤마 포맷 */
function fmt(v: number): string {
  return Math.max(0, Math.round(v)).toLocaleString('ko-KR')
}

/* 날짜 기반 결정론적 인덱스 (오늘의 명상) */
function todayIndex(len: number): number {
  const t = new Date()
  const seed = t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate()
  return seed % len
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function LifeTimeClient() {
  /* 모드 상태 */
  const [mode, setMode] = useState<Mode>('growth')
  const [stage, setStage] = useState<ModeStage>('show')

  /* 입력: 생년월일 */
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const currentYear = today.getFullYear()
  const [birthYear,  setBirthYear]  = useState(1990)
  const [birthMonth, setBirthMonth] = useState(1)
  const [birthDay,   setBirthDay]   = useState(1)

  /* 기대수명 */
  const [expectancyPreset, setExpectancyPreset] = useState<string | null>('kor_m')
  const [expectancyCustom, setExpectancyCustom] = useState(85)

  /* 성별 */
  const [gender, setGender] = useState<'male' | 'female' | null>(null)

  /* 행동 전환 */
  const [actionMin, setActionMin] = useState(30)
  const [activityId, setActivityId] = useState<ActivityId>('read')

  /* 공유 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 파생값 ─── */
  const birthDate = useMemo(() => new Date(birthYear, birthMonth - 1, birthDay), [birthYear, birthMonth, birthDay])

  const expectancy = expectancyPreset
    ? (EXPECTANCY_PRESETS.find(p => p.id === expectancyPreset)?.value ?? 85)
    : n(expectancyCustom, 1)

  const calc = useMemo(() => {
    const endDate = new Date(birthDate); endDate.setFullYear(birthDate.getFullYear() + Math.round(expectancy))
    const totalMs = endDate.getTime() - birthDate.getTime()
    const passedMs = Math.max(0, today.getTime() - birthDate.getTime())
    const remainingMs = Math.max(0, endDate.getTime() - today.getTime())

    const passedDays = Math.floor(passedMs / 86400000)
    const remainingDays = Math.floor(remainingMs / 86400000)
    const totalDays = Math.floor(totalMs / 86400000)
    const progress = totalMs > 0 ? Math.min(100, (passedMs / totalMs) * 100) : 0

    const passedWeeks = Math.floor(passedDays / 7)
    const remainingWeeks = Math.floor(remainingDays / 7)
    const totalWeeks = Math.floor(totalDays / 7)

    const yearsRemaining = remainingMs / (365.25 * 86400000)

    return {
      passed: { days: passedDays, weeks: passedWeeks, hours: passedDays * 24, minutes: passedDays * 24 * 60 },
      remaining: { days: remainingDays, weeks: remainingWeeks, hours: remainingDays * 24 },
      total: { days: totalDays, weeks: totalWeeks },
      progress,
      yearsRemaining,
      events: {
        birthdays:  Math.max(0, Math.floor(yearsRemaining)),
        springs:    Math.max(0, Math.floor(yearsRemaining)),
        newYears:   Math.max(0, Math.floor(yearsRemaining)),
        christmas:  Math.max(0, Math.floor(yearsRemaining)),
        weekends:   Math.max(0, Math.floor(yearsRemaining * 52)),
        fullMoons:  Math.max(0, Math.floor(yearsRemaining * 12.37)),
      },
    }
  }, [birthDate, expectancy, today])

  /* 행동 누적 시간 */
  const action = useMemo(() => {
    const totalMin = actionMin * calc.remaining.days
    const totalHours = totalMin / 60
    const equivYears = totalHours / 8760
    const oneYearHours = (actionMin * 365) / 60
    const fiveYearHours = oneYearHours * 5
    return { totalHours, equivYears, oneYearHours, fiveYearHours }
  }, [actionMin, calc.remaining.days])

  const activity = ACTIVITIES.find(a => a.id === activityId)!

  /* 365일 달력 */
  const yearProgress = useMemo(() => {
    const start = new Date(today.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
    const totalDaysInYear = ((today.getFullYear() % 4 === 0 && today.getFullYear() % 100 !== 0) || today.getFullYear() % 400 === 0) ? 366 : 365
    return { dayOfYear, totalDaysInYear, pct: (dayOfYear / totalDaysInYear) * 100 }
  }, [today])

  /* 메멘토: 주 단위 격자 SVG 좌표 */
  const weekGrid = useMemo(() => {
    const rows = Math.max(1, Math.round(expectancy))
    const cols = 52
    const totalCells = rows * cols
    const passedCells = Math.min(totalCells, calc.passed.weeks)
    const cellSize = 8
    const gap = 2
    const width = cols * (cellSize + gap)
    const height = rows * (cellSize + gap)
    return { rows, cols, totalCells, passedCells, cellSize, gap, width, height }
  }, [expectancy, calc.passed.weeks])

  /* 오늘의 명상 */
  const meditation = MEDITATIONS[todayIndex(MEDITATIONS.length)]

  /* 성별 변경 시 기대수명 자동 추천 */
  useEffect(() => {
    if (gender === 'male')   setExpectancyPreset('kor_m')
    if (gender === 'female') setExpectancyPreset('kor_f')
  }, [gender])

  /* 모드 변경 핸들러 */
  function selectMode(m: Mode) {
    if (m === 'memento' && mode !== 'memento') {
      setStage('mementoConfirm')
    } else {
      setMode(m)
      setStage('show')
    }
  }
  function confirmMemento() {
    setMode('memento')
    setStage('show')
  }
  function backToGrowth() {
    setMode('growth')
    setStage('show')
  }

  /* 공유 텍스트 */
  function shareText(): string {
    if (mode === 'growth') {
      return `지금까지 ${fmt(calc.passed.days)}일을 살아왔고, 매일 ${actionMin}분씩 ${activity.label}을(를) 하면 앞으로 약 ${fmt(action.totalHours)}시간을 쌓을 수 있어요.`
    }
    if (mode === 'balance') {
      return `인생의 ${calc.progress.toFixed(1)}% 지점, 앞으로 가능한 봄은 ${calc.events.springs}번. 오늘을 더 의식적으로.`
    }
    return `기대수명 기준 약 ${fmt(calc.remaining.days)}일, ${fmt(calc.total.weeks)}주의 인생. 메멘토 모리.`
  }

  function handleShare() {
    const text = `${shareText()}\nyoutil.kr/tools/date/life-time`
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1500)
    })
  }

  /* 년/월/일 옵션 */
  const yearOptions  = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear])
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  const dayOptions   = useMemo(() => {
    const dim = new Date(birthYear, birthMonth, 0).getDate()
    return Array.from({ length: dim }, (_, i) => i + 1)
  }, [birthYear, birthMonth])

  return (
    <div className={styles.wrap}>

      {/* 진입 안내 */}
      <div className={styles.intro}>
        <span className={styles.introIcon}>ℹ️</span>
        <span>
          이 도구는 기대수명을 기준으로 시간을 환산해 보여주는 <strong style={{ color: 'var(--text)' }}>참고용 도구</strong>입니다.
          실제 수명이나 건강을 예측하지 않으며, 오늘을 더 의식적으로 살기 위한 가이드입니다.
          시간이 부담스럽게 느껴진다면 언제든 페이지를 닫으셔도 됩니다.
        </span>
      </div>

      {/* 모드 선택 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>톤 선택</span>
          <span className={styles.cardLabelHint}>편안한 분위기로 자유롭게 변경하세요</span>
        </div>
        <div className={styles.modeGrid}>
          <button type="button" className={`${styles.modeCard} ${styles.modeGrowth} ${mode === 'growth' ? styles.modeActive : ''}`} onClick={() => selectMode('growth')}>
            <div className={styles.modeIcon}>🌱</div>
            <div className={styles.modeName}>성장 모드</div>
            <div className={styles.modeDesc}>지금까지의 시간 + 가능한 시간. 성취·가능성 중심.</div>
          </button>
          <button type="button" className={`${styles.modeCard} ${styles.modeBalance} ${mode === 'balance' ? styles.modeActive : ''}`} onClick={() => selectMode('balance')}>
            <div className={styles.modeIcon}>⏳</div>
            <div className={styles.modeName}>균형 모드</div>
            <div className={styles.modeDesc}>살아온 시간과 앞으로의 시간 균형. 진행률·만남 중심.</div>
          </button>
          <button type="button" className={`${styles.modeCard} ${styles.modeMemento} ${mode === 'memento' ? styles.modeActive : ''}`} onClick={() => selectMode('memento')}>
            <div className={styles.modeIcon}>📿</div>
            <div className={styles.modeName}>메멘토 모리</div>
            <div className={styles.modeDesc}>전통적 의미의 시간 인식. 진지한 톤.</div>
          </button>
        </div>
      </div>

      {/* 메멘토 진입 확인 */}
      {stage === 'mementoConfirm' && (
        <div className={styles.mementoConfirm}>
          <p className={styles.mementoConfirmTitle}>📿 메멘토 모리 모드 진입 안내</p>
          <p className={styles.mementoConfirmBody}>
            이 모드는 <strong style={{ color: '#D7B6E8' }}>시간의 유한성을 직시</strong>하기 위한 모드입니다.
            심리적으로 무겁게 느껴질 수 있어, 진입 전 안내를 드립니다.
            의학적·실제적 수명 예측이 아니며, 고대 로마 스토아 철학의 전통을 따라
            현재를 더 의식적으로 살기 위한 가이드일 뿐입니다.
          </p>
          <div className={styles.mementoConfirmRow}>
            <button type="button" className={styles.mementoConfirmBtn} onClick={confirmMemento}>확인 후 시작</button>
            <button type="button" className={styles.mementoBackBtn}    onClick={backToGrowth}>성장 모드로 돌아가기</button>
          </div>
        </div>
      )}

      {/* 입력 카드 */}
      {stage === 'show' && (
        <div className={styles.card}>
          <div className={styles.cardLabel}><span>기본 정보</span></div>

          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>생년월일</p>
          <div className={styles.dobRow}>
            <select className={styles.dobSelect} value={birthYear} onChange={e => setBirthYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select className={styles.dobSelect} value={birthMonth} onChange={e => setBirthMonth(Number(e.target.value))}>
              {monthOptions.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select className={styles.dobSelect} value={birthDay} onChange={e => setBirthDay(Number(e.target.value))}>
              {dayOptions.map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>

          <div style={{ height: 14 }} />
          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>성별 (선택 — 기대수명 자동 추천)</p>
          <div className={styles.genderRow}>
            <button type="button" className={`${styles.genderBtn} ${gender === 'male' ? styles.genderActive : ''}`}   onClick={() => setGender('male')}>남성</button>
            <button type="button" className={`${styles.genderBtn} ${gender === 'female' ? styles.genderActive : ''}`} onClick={() => setGender('female')}>여성</button>
          </div>

          <div style={{ height: 14 }} />
          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>기대수명</p>
          <div className={styles.expectancyGrid}>
            {EXPECTANCY_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`${styles.expectancyBtn} ${expectancyPreset === p.id ? styles.expectancyActive : ''}`}
                onClick={() => setExpectancyPreset(p.id)}
              >
                {p.label}
                <small>{p.value}세</small>
              </button>
            ))}
          </div>
          <div className={styles.customRow}>
            <input
              className={styles.customInput}
              type="number"
              min={1}
              max={150}
              value={expectancyCustom}
              onChange={e => { setExpectancyCustom(n(e.target.value, 1)); setExpectancyPreset(null) }}
            />
            <span className={styles.unit}>세 (직접 입력)</span>
          </div>
        </div>
      )}

      {/* ─── 결과 ─── */}
      {stage === 'show' && mode === 'growth' && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLabel}>지금까지</p>
            <p className={styles.heroNum}>{fmt(calc.passed.days)}<span className={styles.heroUnit}>일을 살아오셨어요</span></p>
            <p className={styles.heroSub}>약 {fmt(calc.passed.hours)}시간 · {fmt(calc.passed.minutes)}분의 시간이 함께했습니다</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>그 시간 동안 가능했던 일들</span></div>
            <div className={styles.possibList}>
              <div className={styles.possibItem}><span>읽을 수 있던 책 (300쪽 1권 = 8시간)</span><strong>{fmt(calc.passed.hours / 8)}권</strong></div>
              <div className={styles.possibItem}><span>경험한 시간</span><strong>{fmt(calc.passed.hours)}시간</strong></div>
              <div className={styles.possibItem}><span>해본 호흡</span><strong>{fmt(calc.passed.minutes * 16)}회</strong></div>
              <div className={styles.possibItem}><span>지나온 보름달</span><strong>{Math.floor(calc.passed.days / 29.53)}번</strong></div>
            </div>
          </div>

          <div className={styles.hero} style={{ borderColor: 'rgba(62,200,255,0.35)' }}>
            <p className={styles.heroLabel}>앞으로 펼쳐질</p>
            <p className={`${styles.heroNum} ${styles.heroNumSmall}`} style={{ color: '#3EC8FF' }}>{fmt(calc.remaining.days)}<span className={styles.heroUnit}>일이 함께할 가능 시간</span></p>
            <p className={styles.heroSub}>“가능 시간”은 채워가는 것입니다. 어떻게 채울지는 오늘의 선택에 달려 있어요.</p>
          </div>
        </>
      )}

      {stage === 'show' && mode === 'balance' && (
        <>
          <div className={styles.hero}>
            <div className={styles.heroDual}>
              <div>
                <p className={styles.heroDualLabel}>살아온 시간</p>
                <p className={`${styles.heroDualNum} ${styles.lived}`}>{fmt(calc.passed.days)}<span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>일</span></p>
              </div>
              <span className={styles.heroDualSep}>｜</span>
              <div>
                <p className={styles.heroDualLabel}>가능 시간</p>
                <p className={`${styles.heroDualNum} ${styles.ahead}`}>{fmt(calc.remaining.days)}<span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>일</span></p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>인생 진행률</span></div>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${calc.progress}%` }} />
                <div className={styles.progressMarker} style={{ left: `${calc.progress}%` }} />
              </div>
              <div className={styles.progressLabel}>
                <span>출생</span>
                <span>{Math.round(expectancy)}세</span>
              </div>
              <p className={styles.progressPct}>{calc.progress.toFixed(1)}% 지점</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>앞으로 만날 수 있는</span>
              <span className={styles.cardLabelHint}>기대수명 기준</span>
            </div>
            <div className={styles.eventGrid}>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>🎂</div><div className={styles.eventName}>생일</div><div className={styles.eventCount}>{calc.events.birthdays}<span className={styles.eventUnit}>번</span></div></div>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>🌸</div><div className={styles.eventName}>봄</div><div className={styles.eventCount}>{calc.events.springs}<span className={styles.eventUnit}>번</span></div></div>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>🎄</div><div className={styles.eventName}>크리스마스</div><div className={styles.eventCount}>{calc.events.christmas}<span className={styles.eventUnit}>번</span></div></div>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>🎆</div><div className={styles.eventName}>새해</div><div className={styles.eventCount}>{calc.events.newYears}<span className={styles.eventUnit}>번</span></div></div>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>🌕</div><div className={styles.eventName}>보름달</div><div className={styles.eventCount}>{calc.events.fullMoons}<span className={styles.eventUnit}>번</span></div></div>
              <div className={styles.eventItem}><div className={styles.eventEmoji}>📅</div><div className={styles.eventName}>주말</div><div className={styles.eventCount}>{fmt(calc.events.weekends)}<span className={styles.eventUnit}>번</span></div></div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>올해 진행률</span>
              <span className={styles.cardLabelHint}>{yearProgress.dayOfYear}일째 · {yearProgress.pct.toFixed(1)}%</span>
            </div>
            <div className={styles.yearCalGrid}>
              {Array.from({ length: yearProgress.totalDaysInYear }).map((_, i) => {
                const isPast = i + 1 < yearProgress.dayOfYear
                const isToday = i + 1 === yearProgress.dayOfYear
                return (
                  <div
                    key={i}
                    className={`${styles.yearCalDot} ${isToday ? styles.yearCalToday : isPast ? styles.yearCalPast : styles.yearCalFuture}`}
                    title={`${today.getFullYear()}년 ${i + 1}일째`}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}

      {stage === 'show' && mode === 'memento' && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLabel}>기대수명 {Math.round(expectancy)}세 기준</p>
            <p className={`${styles.heroNum} ${styles.heroNumSmall}`}>약 {fmt(calc.remaining.days)}<span className={styles.heroUnit}>일이 남아 있습니다</span></p>
            <p className={styles.heroSub}>약 {fmt(calc.remaining.weeks)}주 · 약 {Math.round(calc.yearsRemaining)}년의 시간</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>인생을 주(週) 단위로</span>
              <span className={styles.cardLabelHint}>한 줄 = 1년 · 한 칸 = 1주</span>
            </div>
            <div className={styles.weekGridWrap}>
              <svg
                className={styles.weekGridSvg}
                viewBox={`0 0 ${weekGrid.width} ${weekGrid.height}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                {Array.from({ length: weekGrid.rows }).map((_, row) => (
                  Array.from({ length: weekGrid.cols }).map((__, col) => {
                    const idx = row * weekGrid.cols + col
                    const isPast = idx < weekGrid.passedCells
                    const isNow  = idx === weekGrid.passedCells
                    const x = col * (weekGrid.cellSize + weekGrid.gap)
                    const y = row * (weekGrid.cellSize + weekGrid.gap)
                    const fill = isPast ? 'rgba(255,255,255,0.35)' : isNow ? '#C8FF3E' : 'rgba(255,255,255,0.06)'
                    return (
                      <rect
                        key={`${row}-${col}`}
                        x={x}
                        y={y}
                        width={weekGrid.cellSize}
                        height={weekGrid.cellSize}
                        rx={1.5}
                        fill={fill}
                      />
                    )
                  })
                ))}
              </svg>
            </div>
            <div className={styles.weekLegend}>
              <span><span className={`${styles.legendDot} ${styles.legendDotPast}`} />지난 주 ({fmt(calc.passed.weeks)})</span>
              <span><span className={`${styles.legendDot} ${styles.legendDotNow}`} />현재 주</span>
              <span><span className={`${styles.legendDot} ${styles.legendDotAhead}`} />앞으로 ({fmt(calc.remaining.weeks)})</span>
            </div>
          </div>

          <div className={styles.meditationCard}>
            <p className={styles.meditationLabel}>오늘의 문장</p>
            <p className={styles.meditationText}>{meditation.text}</p>
            {meditation.author && <p className={styles.meditationAuthor}>— {meditation.author}</p>}
          </div>
        </>
      )}

      {/* 행동 전환 카드 (모든 모드 공통) */}
      {stage === 'show' && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <span>하루 {actionMin}분의 가치</span>
            <span className={styles.cardLabelHint}>오늘 시작하면 앞으로 얼마나?</span>
          </div>

          <div className={styles.actionInputRow}>
            <div className={styles.actionInputCell}>
              <p className={styles.actionLabel}>매일 투자 시간 (분)</p>
              <input
                className={styles.actionInput}
                type="number"
                min={1}
                max={480}
                value={actionMin}
                onChange={e => setActionMin(n(e.target.value, 1))}
              />
            </div>
            <div className={styles.actionInputCell}>
              <p className={styles.actionLabel}>활동</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Noto Sans KR, sans-serif' }}>
                {activity.icon} {activity.label}
              </p>
            </div>
          </div>

          <div className={styles.activityGrid}>
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                type="button"
                className={`${styles.activityBtn} ${activityId === a.id ? styles.activityActive : ''}`}
                onClick={() => setActivityId(a.id)}
              >
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>

          <div className={styles.actionResultGrid}>
            <div className={styles.actionResultCell}>
              <p className={styles.actionResultLabel}>1년 누적</p>
              <p className={styles.actionResultValue}>{fmt(action.oneYearHours)}<span className={styles.actionResultUnit}>시간</span></p>
            </div>
            <div className={styles.actionResultCell}>
              <p className={styles.actionResultLabel}>5년 누적</p>
              <p className={styles.actionResultValue}>{fmt(action.fiveYearHours)}<span className={styles.actionResultUnit}>시간</span></p>
            </div>
            <div className={styles.actionResultCell}>
              <p className={styles.actionResultLabel}>가능 시간 누적</p>
              <p className={styles.actionResultValue}>{fmt(action.totalHours)}<span className={styles.actionResultUnit}>시간</span></p>
            </div>
          </div>

          <div className={styles.actionEquivalent}>
            앞으로 매일 {actionMin}분씩 {activity.label}을(를) 이어가면 약 <strong>{action.equivYears.toFixed(1)}년</strong>의 시간을 이 활동에 쌓을 수 있어요.
          </div>

          <div className={styles.proverbCard}>
            {activity.proverb}
          </div>
        </div>
      )}

      {/* 공유 */}
      {stage === 'show' && (
        <button type="button" className={`${styles.shareBtn} ${copied ? styles.copied : ''}`} onClick={handleShare}>
          {copied ? '✓ 복사 완료' : '✨ 공유 텍스트 복사'}
        </button>
      )}

      {/* 정신건강 안내 (항상 하단) */}
      <div className={styles.support}>
        <span className={styles.supportIcon}>🤝</span>
        <div className={styles.supportBody}>
          <strong>이 도구를 보고 무거운 감정이 드신다면, 혼자 견디지 마세요.</strong>
          <ul>
            <li>자살예방상담전화 — <a href="tel:1393">1393</a> (24시간 무료)</li>
            <li>정신건강위기상담전화 — <a href="tel:15770199">1577-0199</a></li>
            <li>청소년 상담 — <a href="tel:1388">1388</a></li>
          </ul>
          <p style={{ marginTop: 8, color: 'var(--muted)' }}>위기 상황이 아니어도, 일상의 부담이 많을 때 상담받으실 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}
