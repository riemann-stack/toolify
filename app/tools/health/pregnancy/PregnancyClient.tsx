'use client'

import { useState, useMemo } from 'react'
import styles from './pregnancy.module.css'

type InputMode = 'lmp' | 'conception' | 'duedate'

function addDays(date: Date, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}
function diffDays(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}
function fmtWeek(totalDays: number) {
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 }
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

// 주수별 태아 크기 비유
const FETAL_SIZE = [
  { maxWeek: 5,  size: '참깨',     emoji: '🌾', cm: '0.2cm' },
  { maxWeek: 7,  size: '블루베리', emoji: '🫐', cm: '1cm'   },
  { maxWeek: 9,  size: '포도',     emoji: '🍇', cm: '2.3cm' },
  { maxWeek: 11, size: '자두',     emoji: '🍑', cm: '4cm'   },
  { maxWeek: 13, size: '레몬',     emoji: '🍋', cm: '7cm'   },
  { maxWeek: 15, size: '오렌지',   emoji: '🍊', cm: '10cm'  },
  { maxWeek: 18, size: '사과',     emoji: '🍎', cm: '14cm'  },
  { maxWeek: 21, size: '바나나',   emoji: '🍌', cm: '26cm'  },
  { maxWeek: 24, size: '옥수수',   emoji: '🌽', cm: '30cm'  },
  { maxWeek: 27, size: '가지',     emoji: '🍆', cm: '36cm'  },
  { maxWeek: 30, size: '파인애플', emoji: '🍍', cm: '39cm'  },
  { maxWeek: 33, size: '코코넛',   emoji: '🥥', cm: '43cm'  },
  { maxWeek: 36, size: '양배추',   emoji: '🥬', cm: '47cm'  },
  { maxWeek: 40, size: '수박',     emoji: '🍉', cm: '50cm'  },
]
function getFetalSize(weeks: number) {
  return FETAL_SIZE.find(f => weeks <= f.maxWeek) ?? FETAL_SIZE[FETAL_SIZE.length - 1]
}

// 시기별 체크리스트
const CHECKLISTS = [
  { maxWeek: 13, label: '초기 (1~13주)',  items: ['엽산제 복용 시작 (신경관 결손 예방)', '첫 산전 검사 및 초음파', '기형아 1차 검사 (10~13주)', '음주·흡연·카페인 중단', '산부인과 등록'] },
  { maxWeek: 27, label: '중기 (14~27주)', items: ['철분제 복용 시작 (빈혈 예방)', '기형아 2차 검사 쿼드마크 (15~20주)', '정밀 초음파 (20~22주)', '임신성 당뇨 검사 (24~28주)', '태동 체크 시작'] },
  { maxWeek: 40, label: '말기 (28~40주)', items: ['백일해 예방접종 (27~36주 권장)', '태아 성장 초음파 (32주)', 'GBS 검사 (35~37주)', '분만 교실·출산 준비 교육', '입원 가방 준비'] },
]
function getChecklist(weeks: number) {
  return CHECKLISTS.find(c => weeks <= c.maxWeek) ?? CHECKLISTS[CHECKLISTS.length - 1]
}

const TRIMESTER_INFO = [
  { label: '1삼분기', range: '1~13주',  color: '#3EC8FF' },
  { label: '2삼분기', range: '14~27주', color: '#3EFF9B' },
  { label: '3삼분기', range: '28~40주', color: '#FF8C3E' },
]

const SCHEDULES = [
  { week: 8,  label: '첫 산전 검사' },
  { week: 11, label: '기형아 1차 (NT)' },
  { week: 16, label: '기형아 2차 (쿼드)' },
  { week: 20, label: '정밀 초음파' },
  { week: 24, label: '임신성 당뇨 검사' },
  { week: 32, label: '태아 성장 초음파' },
  { week: 36, label: 'GBS 검사' },
]

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const currentYear = new Date().getFullYear()
// 임신 관련: 최근 2년 ~ 미래 1년
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

export default function PregnancyClient() {
  const [mode,     setMode]     = useState<InputMode>('lmp')
  const [year,     setYear]     = useState('')
  const [month,    setMonth]    = useState('')
  const [day,      setDay]      = useState('')
  const [nickname, setNickname] = useState('')

  const daysInMonth = year && month ? getDaysInMonth(parseInt(year), parseInt(month)) : 31
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // 월 변경 시 일 초기화
  const handleMonthChange = (v: string) => {
    setMonth(v)
    setDay('')
  }
  // 모드 변경 시 날짜 초기화
  const handleModeChange = (m: InputMode) => {
    setMode(m)
    setYear(''); setMonth(''); setDay('')
  }

  const result = useMemo(() => {
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    if (!y || !m || !d) return null

    const input = new Date(y, m - 1, d)
    const today = new Date(); today.setHours(0,0,0,0)

    let lmp: Date, dueDate: Date
    if (mode === 'lmp') {
      lmp = input; dueDate = addDays(lmp, 280)
    } else if (mode === 'conception') {
      lmp = addDays(input, -14); dueDate = addDays(lmp, 280)
    } else {
      dueDate = input; lmp = addDays(dueDate, -280)
    }

    const elapsed   = diffDays(lmp, today)
    const remaining = diffDays(today, dueDate)
    if (elapsed < 0) return null

    const { weeks, days: remDays } = fmtWeek(elapsed)
    let trimester = 1
    if (weeks >= 28) trimester = 3
    else if (weeks >= 14) trimester = 2
    const progress  = Math.min(100, Math.round((elapsed / 280) * 100))
    const fetalSize = getFetalSize(weeks)
    const checklist = getChecklist(weeks)

    return {
      weeks, days: remDays, elapsed, remaining,
      lmpDate: fmtDate(lmp),
      dueDate: fmtDate(dueDate),
      trimester, progress,
      fetalSize, checklist,
      schedules: SCHEDULES.map(s => ({ ...s, done: weeks >= s.week })),
      isDone: remaining <= 0,
    }
  }, [year, month, day, mode])

  const modeLabels: Record<InputMode, string> = {
    lmp:       '마지막 생리 시작일',
    conception:'수정일 (배란일)',
    duedate:   '출산 예정일',
  }

  return (
    <div className={styles.wrap}>

      {/* 태명 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>태명 (선택)</label>
        <input className={styles.nicknameInput}
          type="text" placeholder="예: 콩이, 복덩이, 하늘이 ..."
          value={nickname} onChange={e => setNickname(e.target.value)}
          maxLength={10} />
      </div>

      {/* 입력 방식 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>입력 방식</label>
        <div className={styles.modeRow}>
          {(Object.keys(modeLabels) as InputMode[]).map(m => (
            <button key={m}
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => handleModeChange(m)}>
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 드롭다운 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>{modeLabels[mode]}</label>
        <div className={styles.selectRow}>
          {/* 년도 */}
          <div className={styles.selectWrap}>
            <select className={styles.select} value={year}
              onChange={e => { setYear(e.target.value); setDay('') }}>
              <option value="">년도</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>

          {/* 월 */}
          <div className={styles.selectWrap}>
            <select className={styles.select} value={month}
              onChange={e => handleMonthChange(e.target.value)}>
              <option value="">월</option>
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>

          {/* 일 */}
          <div className={styles.selectWrap}>
            <select className={styles.select} value={day}
              onChange={e => setDay(e.target.value)}
              disabled={!month}>
              <option value="">일</option>
              {days.map(d => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
        </div>
        {year && month && !day && (
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            일(日)을 선택해주세요
          </p>
        )}
      </div>

      {result ? (
        <>
          {/* 현재 임신 주수 */}
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>현재 임신 주수</div>
            <div className={styles.heroNum}>{result.weeks}주 {result.days}일</div>
            <div className={styles.heroSub}>
              {result.isDone
                ? '출산 예정일이 지났습니다 🎉'
                : nickname
                  ? `${nickname}이와의 만남까지 D-${result.remaining} 💕`
                  : `출산 예정일까지 D-${result.remaining}`}
            </div>
          </div>

          {/* 태아 크기 비유 */}
          <div className={styles.fetalCard}>
            <span className={styles.fetalEmoji}>{result.fetalSize.emoji}</span>
            <div>
              <p className={styles.fetalTitle}>
                현재 태아는 약 <strong>{result.fetalSize.cm}</strong>로
                <strong style={{ color: 'var(--accent)' }}> {result.fetalSize.size}</strong> 크기예요
              </p>
              <p className={styles.fetalSub}>
                {result.weeks}주차 기준 태아 크기 참고값 (개인차 있음)
              </p>
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
              {TRIMESTER_INFO.map((t, i) => (
                <div key={i}
                  className={`${styles.trimesterItem} ${result.trimester === i + 1 ? styles.trimesterActive : ''}`}
                  style={result.trimester === i + 1 ? { borderColor: t.color, color: t.color } : {}}>
                  <span className={styles.trimesterLabel}>{t.label}</span>
                  <span className={styles.trimesterRange}>{t.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 지금 꼭 해야 할 일 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>
              ✅ 지금 꼭 해야 할 일 — {result.checklist.label}
            </label>
            <div className={styles.checklistGrid}>
              {result.checklist.items.map((item, i) => (
                <div key={i} className={styles.checklistItem}>
                  <span className={styles.checklistDot} />
                  <span style={{ fontSize: '13px', color: 'var(--text)' }}>{item}</span>
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

          {/* 산전 검사 일정 */}
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

          {/* 면책 조항 */}
          <div className={styles.disclaimer}>
            <span style={{ fontSize: '16px' }}>⚕️</span>
            <p>본 계산기는 참고용이며, 정확한 진단은 반드시 산부인과 전문의와 상담하십시오.</p>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          년·월·일을 선택하면 임신 주수가 계산됩니다
        </div>
      )}
    </div>
  )
}