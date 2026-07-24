/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './life-time.module.css'

/* ─────────────────────────────────────────────────────────
 * 활동·격언 데이터
 * ───────────────────────────────────────────────────────── */
const ACTIVITIES = [
  { id: 'read',   icon: '📖', label: '독서',          proverb: '매일 30분의 독서는 1년이면 약 180시간 — 책 20권이 넘는 독서량입니다.' },
  { id: 'sport',  icon: '🏃', label: '운동',          proverb: '주 150분 걷기 수준의 활동만으로 기대수명이 3~4년 늘어난다는 대규모 연구가 있습니다 (PLOS Medicine, 2012).' },
  { id: 'create', icon: '🎨', label: '창작',          proverb: '매일 30분의 창작은 5년이면 한 권의 책, 한 장의 앨범이 됩니다.' },
  { id: 'family', icon: '👨‍👩‍👧', label: '가족 시간',  proverb: '함께한 시간의 양이 곧 관계의 깊이입니다.' },
  { id: 'side',   icon: '💼', label: '사이드 프로젝트', proverb: '하루 30분의 사이드 프로젝트는 5년 후 부업·이직·창업의 기반이 됩니다.' },
  { id: 'medi',   icon: '🧘', label: '명상',          proverb: '8주 명상 프로그램으로 불안·우울·스트레스 지표가 개선된다는 메타분석이 있습니다 (JAMA Internal Medicine, 2014).' },
  { id: 'music',  icon: '🎵', label: '악기 연습',     proverb: '하루 1시간씩 5년이면 약 1,800시간 — 아마추어 합주에 참여할 실력을 기대할 수 있는 시간입니다.' },
  { id: 'lang',   icon: '🌐', label: '외국어 학습',   proverb: '하루 30분, 2년이면 약 365시간 — 기초 회화를 탄탄히 쌓기에 충분한 시간입니다.' },
] as const
type ActivityId = typeof ACTIVITIES[number]['id']

const MEDITATIONS = [
  { text: '시간은 줄어드는 것이 아니라, 선택으로 채워지는 것입니다.', author: null },
  { text: '원하는 것은 거의 무엇이든 살 수 있지만, 시간은 살 수 없다.', author: '워런 버핏 (2017년 대담)' },
  { text: '메멘토 모리, 카르페 디엠 — 죽음을 기억하고, 오늘을 살아라.', author: '라틴 격언' },
  { text: '삶이 짧은 게 아니라, 우리가 시간을 낭비할 뿐이다.', author: '세네카, 「인생의 짧음에 관하여」 1장' },
  { text: '시간을 누군가에게 주는 것은 가장 진심 어린 선물입니다.', author: null },
  { text: '지금 당장이라도 삶을 떠날 수 있다. 그 사실이 네가 행하고 말하고 생각하는 것을 결정하게 하라.', author: '마르쿠스 아우렐리우스, 「명상록」 2.11' },
  { text: '만 년을 살 것처럼 행동하지 마라. 살 수 있는 동안, 할 수 있는 동안, 선한 사람이 되라.', author: '마르쿠스 아우렐리우스, 「명상록」 4.17' },
]

/* 기대수명 프리셋 */
/* 남·여 = 국가데이터처(구 통계청) 2024년 생명표(2025-12 발표), 세계 = UN WPP 2024 (WHO 최신 공식치는 2021년 71.4세라 미사용) */
const EXPECTANCY_PRESETS = [
  { id: 'kor_m', label: '🇰🇷 한국 남성 평균', value: 80.8 },
  { id: 'kor_f', label: '🇰🇷 한국 여성 평균', value: 86.6 },
  { id: 'who',   label: '🌐 세계 평균 (UN)',   value: 73.3 },
  { id: 'cent',  label: '✨ 100세 시대',       value: 100  },
]

/* 2024년 생명표 성·연령별 기대여명(년) — 국가데이터처 간이생명표 공표 원값 (0세 기대수명과 달리
   해당 나이까지 생존한 사람의 잔여 기대치. 예: 80세 남 8.52년 → 종점 약 88.5세).
   구간 사이 나이는 선형보간(근사), 100세 이상은 100+ 개방구간 값으로 클램프. */
const EX_AGES   = [0, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
const EX_MALE   = [80.81, 80.02, 76.07, 71.10, 66.14, 61.22, 56.33, 51.49, 46.67, 41.88, 37.17, 32.55, 28.06, 23.72, 19.54, 15.53, 11.84, 8.52, 5.90, 3.99, 2.71, 1.89]
const EX_FEMALE = [86.58, 85.76, 81.81, 76.84, 71.87, 66.95, 62.04, 57.15, 52.26, 47.41, 42.60, 37.82, 33.09, 28.39, 23.75, 19.21, 14.87, 10.89, 7.56, 5.07, 3.37, 2.30]

function remainingEx(age: number, sex: 'm' | 'f'): number {
  const vals = sex === 'm' ? EX_MALE : EX_FEMALE
  if (age <= 0) return vals[0]
  if (age >= 100) return vals[vals.length - 1]
  let i = 0
  while (i < EX_AGES.length - 2 && EX_AGES[i + 1] <= age) i++
  const t = (age - EX_AGES[i]) / (EX_AGES[i + 1] - EX_AGES[i])
  return vals[i] + (vals[i + 1] - vals[i]) * t
}

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

  /* SSG 빌드 시각이 정적 HTML에 박히는 것 방지 — 마운트 후에만 시간 의존 결과 렌더 */
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  /* 입력: 생년월일 */
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps
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
    const usesEx = expectancyPreset === 'kor_m' || expectancyPreset === 'kor_f'
    let endDate: Date
    if (usesEx && today.getTime() >= birthDate.getTime()) {
      /* 성별 프리셋 = 현재 나이까지 생존을 반영한 잔여 기대여명으로 종점 계산 (0세 기대수명 고정 종점의 과소 추정 방지) */
      const ageYears = (today.getTime() - birthDate.getTime()) / (365.25 * 86400000)
      const ex = remainingEx(ageYears, expectancyPreset === 'kor_m' ? 'm' : 'f')
      endDate = new Date(today)
      endDate.setDate(endDate.getDate() + Math.round(ex * 365.25))
    } else {
      /* 직접 입력·기타 프리셋 = 입력 나이 고정 종점. 소수 기대수명을 연+일로 반영 — 반올림(81세) 시 표기와 어긋남 */
      endDate = new Date(birthDate)
      endDate.setFullYear(birthDate.getFullYear() + Math.floor(expectancy))
      endDate.setDate(endDate.getDate() + Math.round((expectancy % 1) * 365.25))
    }
    const endAge = (endDate.getTime() - birthDate.getTime()) / (365.25 * 86400000)
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

    /* 매년 (월, 일)이 (오늘, 종점] 사이에 실제로 몇 번 오는지 — 연수 내림이 아닌 달력 기준 */
    const countAnnual = (month: number, day: number) => {
      let cnt = 0
      for (let y = today.getFullYear(); y <= endDate.getFullYear(); y++) {
        const d = new Date(y, month - 1, day)
        if (d.getTime() > today.getTime() && d.getTime() <= endDate.getTime()) cnt++
      }
      return cnt
    }
    /* (오늘, 종점] 사이 실제 토요일 수 */
    const firstSat = new Date(today)
    firstSat.setDate(firstSat.getDate() + (((6 - firstSat.getDay()) + 7) % 7 || 7))
    const weekends = firstSat.getTime() <= endDate.getTime()
      ? Math.floor((endDate.getTime() - firstSat.getTime()) / (7 * 86400000)) + 1
      : 0

    return {
      passed: { days: passedDays, weeks: passedWeeks, hours: passedDays * 24, minutes: passedDays * 24 * 60 },
      remaining: { days: remainingDays, weeks: remainingWeeks, hours: remainingDays * 24 },
      total: { days: totalDays, weeks: totalWeeks },
      progress,
      yearsRemaining,
      usesEx,
      endAge,
      beyond: passedMs > totalMs,  // 나이가 설정한 기대수명을 이미 넘어선 경우 (고정 종점 모드에서만 발생)
      futureBirth: birthDate.getTime() > today.getTime(),
      events: {
        birthdays:  countAnnual(birthDate.getMonth() + 1, birthDate.getDate()),
        springs:    countAnnual(3, 1),
        newYears:   countAnnual(1, 1),
        christmas:  countAnnual(12, 25),
        weekends,
        fullMoons:  Math.max(0, Math.floor(yearsRemaining * 12.37)),
      },
    }
  }, [birthDate, expectancy, expectancyPreset, today])

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
    const rows = Math.max(1, Math.round(calc.endAge))
    const cols = 52
    const totalCells = rows * cols
    const passedCells = Math.min(totalCells, calc.passed.weeks)
    const cellSize = 8
    const gap = 2
    const width = cols * (cellSize + gap)
    const height = rows * (cellSize + gap)
    return { rows, cols, totalCells, passedCells, cellSize, gap, width, height }
  }, [calc.endAge, calc.passed.weeks])

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
      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/age', label: '나이 계산기' },
          { href: '/tools/date/dday', label: 'D-day 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량 계산기' },
        ]}
      >
        본 도구는 평균 기대수명 통계를 바탕으로 한 <strong>참고용 추정</strong>이며, 실제 수명·남은 시간을 예측하지 않습니다. 동기 부여·시간 인식을 돕기 위한 도구로만 활용하세요.
      </Disclaimer>

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
          <button type="button" aria-pressed={mode === 'growth'} className={`${styles.modeCard} ${styles.modeGrowth} ${mode === 'growth' ? styles.modeActive : ''}`} onClick={() => selectMode('growth')}>
            <div className={styles.modeIcon}>🌱</div>
            <div className={styles.modeName}>성장 모드</div>
            <div className={styles.modeDesc}>지금까지의 시간 + 가능한 시간. 성취·가능성 중심.</div>
          </button>
          <button type="button" aria-pressed={mode === 'balance'} className={`${styles.modeCard} ${styles.modeBalance} ${mode === 'balance' ? styles.modeActive : ''}`} onClick={() => selectMode('balance')}>
            <div className={styles.modeIcon}>⏳</div>
            <div className={styles.modeName}>균형 모드</div>
            <div className={styles.modeDesc}>살아온 시간과 앞으로의 시간 균형. 진행률·만남 중심.</div>
          </button>
          <button type="button" aria-pressed={mode === 'memento'} className={`${styles.modeCard} ${styles.modeMemento} ${mode === 'memento' ? styles.modeActive : ''}`} onClick={() => selectMode('memento')}>
            <div className={styles.modeIcon}>📿</div>
            <div className={styles.modeName}>메멘토 모리</div>
            <div className={styles.modeDesc}>전통적 의미의 시간 인식. 진지한 톤.</div>
          </button>
        </div>
      </div>

      {/* 메멘토 진입 확인 */}
      {stage === 'mementoConfirm' && (
        <div className={styles.mementoConfirm}>
          <p className={styles.mementoConfirmTitle}>메멘토 모리 모드 진입 안내</p>
          <p className={styles.mementoConfirmBody}>
            이 모드는 <strong style={{ color: '#8E44AD' }}>시간의 유한성을 직시</strong>하기 위한 모드입니다.
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
      {mounted && stage === 'show' && (
        <div className={styles.card}>
          <div className={styles.cardLabel}><span>기본 정보</span></div>

          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>생년월일</p>
          <div className={styles.dobRow}>
            <select className={styles.dobSelect} aria-label="출생 연도" value={birthYear} onChange={e => {
              const y = Number(e.target.value)
              setBirthYear(y)
              /* 연도 변경으로 2/29 등이 사라지면 일(日)을 말일로 클램프 — 방치 시 2/31→3/3 정규화 오차 */
              setBirthDay(d => Math.min(d, new Date(y, birthMonth, 0).getDate()))
            }}>
              {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select className={styles.dobSelect} aria-label="출생 월" value={birthMonth} onChange={e => {
              const m = Number(e.target.value)
              setBirthMonth(m)
              setBirthDay(d => Math.min(d, new Date(birthYear, m, 0).getDate()))
            }}>
              {monthOptions.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select className={styles.dobSelect} aria-label="출생 일" value={birthDay} onChange={e => setBirthDay(Number(e.target.value))}>
              {dayOptions.map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>

          <div style={{ height: 14 }} />
          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>성별 (선택 — 기대수명 자동 추천)</p>
          <div className={styles.genderRow}>
            <button type="button" aria-pressed={gender === 'male'} className={`${styles.genderBtn} ${gender === 'male' ? styles.genderActive : ''}`}   onClick={() => setGender('male')}>남성</button>
            <button type="button" aria-pressed={gender === 'female'} className={`${styles.genderBtn} ${gender === 'female' ? styles.genderActive : ''}`} onClick={() => setGender('female')}>여성</button>
          </div>

          <div style={{ height: 14 }} />
          <p className={styles.cardLabelHint} style={{ marginBottom: 6 }}>기대수명</p>
          <div className={styles.expectancyGrid}>
            {EXPECTANCY_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                aria-pressed={expectancyPreset === p.id} className={`${styles.expectancyBtn} ${expectancyPreset === p.id ? styles.expectancyActive : ''}`}
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
              type="number" inputMode="decimal"
              min={1}
              max={150}
              aria-label="기대수명 직접 입력 (세)"
              value={expectancyCustom}
              onChange={e => { setExpectancyCustom(Math.min(150, n(e.target.value, 1))); setExpectancyPreset(null) }}
            />
            <span className={styles.unit}>세 (직접 입력)</span>
          </div>
          <p className={styles.cardLabelHint} style={{ marginTop: 10, lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>남성·여성 평균 프리셋</strong>은 현재 나이까지 생존을 반영한 <strong style={{ color: 'var(--text)' }}>나이별 기대여명</strong>(2024년 생명표, 구간 선형보간 근사)으로 종점을 계산합니다 — 나이가 많을수록 종점이 80.8세·86.6세보다 늦어집니다(예: 60세 남성 종점 약 83.7세, 80세 남성 약 88.5세). 세계 평균·100세·직접 입력은 입력한 나이를 고정 종점으로 사용합니다.
          </p>
        </div>
      )}

      {/* ─── 결과 ─── */}
      {/* 미래 생년월일 가드 — 올해 말일 등 오늘 이후 날짜 선택 시 결과 대신 안내 */}
      {mounted && stage === 'show' && calc.futureBirth && (
        <div className={styles.card} role="alert">
          <div className={styles.cardLabel}><span>생년월일 확인</span></div>
          <p className={styles.cardLabelHint} style={{ lineHeight: 1.8 }}>
            선택한 생년월일이 오늘 이후입니다. 아직 오지 않은 날짜로는 살아온 시간을 계산할 수 없어요 — 생년월일을 다시 확인해 주세요.
          </p>
        </div>
      )}

      {mounted && stage === 'show' && !calc.futureBirth && mode === 'growth' && (
        <>
          <div className={styles.hero} role="status">
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

          <div className={styles.hero} style={{ borderColor: 'rgba(8,145,178,0.35)' }}>
            {calc.beyond ? (
              <>
                <p className={styles.heroLabel}>평균 너머의 시간</p>
                <p className={styles.heroSub} style={{ fontSize: 14, lineHeight: 1.8 }}>
                  설정한 기대수명({expectancy % 1 ? expectancy.toFixed(1) : expectancy}세)은 <strong style={{ color: 'var(--text)' }}>평균일 뿐</strong>이며, 이미 그 평균을 넘어 하루하루를 더하고 계십니다.
                  「100세 시대」 프리셋이나 직접 입력으로 목표 나이를 조정해 보세요.
                </p>
              </>
            ) : (
              <>
                <p className={styles.heroLabel}>앞으로 펼쳐질</p>
                <p className={`${styles.heroNum} ${styles.heroNumSmall}`} style={{ color: 'var(--cat-health)' }}>{fmt(calc.remaining.days)}<span className={styles.heroUnit}>일이 함께할 가능 시간</span></p>
                <p className={styles.heroSub}>“가능 시간”은 채워가는 것입니다. 어떻게 채울지는 오늘의 선택에 달려 있어요.</p>
              </>
            )}
          </div>
        </>
      )}

      {mounted && stage === 'show' && !calc.futureBirth && mode === 'balance' && (
        <>
          <div className={styles.hero} role="status">
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
                <span>{calc.usesEx ? `약 ${calc.endAge.toFixed(1)}세` : `${expectancy % 1 ? expectancy.toFixed(1) : expectancy}세`}</span>
              </div>
              <p className={styles.progressPct}>{calc.progress.toFixed(1)}% 지점</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>앞으로 만날 수 있는</span>
              <span className={styles.cardLabelHint}>기대수명 기준</span>
            </div>
            {calc.beyond && (
              <p className={styles.cardLabelHint} style={{ marginBottom: 10, lineHeight: 1.7 }}>
                설정한 기대수명을 이미 넘어 0으로 표시됩니다 — 평균일 뿐이니 직접 입력으로 목표 나이를 조정해 보세요.
              </p>
            )}
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

      {mounted && stage === 'show' && !calc.futureBirth && mode === 'memento' && (
        <>
          <div className={styles.hero} role="status">
            <p className={styles.heroLabel}>{calc.usesEx ? `현재 나이 기대여명 반영 · 종점 약 ${calc.endAge.toFixed(1)}세` : `기대수명 ${expectancy % 1 ? expectancy.toFixed(1) : expectancy}세 기준`}</p>
            {calc.beyond ? (
              <p className={styles.heroSub} style={{ fontSize: 14, lineHeight: 1.8 }}>
                통계적 평균을 이미 넘어서셨습니다. 기대수명은 <strong style={{ color: 'var(--text)' }}>집단의 평균</strong>일 뿐 개인의 시간을 정하지 않습니다 — 지금의 하루하루가 평균 너머의 시간입니다. 직접 입력으로 목표 나이를 설정해 계속 살펴보세요.
              </p>
            ) : (
              <>
                <p className={`${styles.heroNum} ${styles.heroNumSmall}`}>약 {fmt(calc.remaining.days)}<span className={styles.heroUnit}>일이 남아 있습니다</span></p>
                <p className={styles.heroSub}>약 {fmt(calc.remaining.weeks)}주 · 약 {Math.round(calc.yearsRemaining)}년의 시간</p>
              </>
            )}
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
                    const fill = isPast ? 'rgba(15,23,42,0.4)' : isNow ? 'var(--accent)' : 'rgba(15,23,42,0.06)'
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
      {mounted && stage === 'show' && !calc.futureBirth && (
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
                type="number" inputMode="decimal"
                min={1}
                max={480}
                aria-label="매일 투자 시간 (분)"
                value={actionMin}
                onChange={e => setActionMin(Math.min(480, n(e.target.value, 1)))}
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
                aria-pressed={activityId === a.id} className={`${styles.activityBtn} ${activityId === a.id ? styles.activityActive : ''}`}
                onClick={() => setActivityId(a.id)}
              >
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>

          {calc.beyond && (
            <p className={styles.cardLabelHint} style={{ marginBottom: 10, lineHeight: 1.7 }}>
              설정한 기대수명 기준 잔여 시간이 0이라 아래는 기간별 일반 예시입니다 — 오늘부터 1년·5년을 이어갈 때의 누적량이에요.
            </p>
          )}
          <div className={styles.actionResultGrid}>
            <div className={styles.actionResultCell}>
              <p className={styles.actionResultLabel}>1년 누적</p>
              <p className={styles.actionResultValue}>{fmt(action.oneYearHours)}<span className={styles.actionResultUnit}>시간</span></p>
            </div>
            <div className={styles.actionResultCell}>
              <p className={styles.actionResultLabel}>5년 누적</p>
              <p className={styles.actionResultValue}>{fmt(action.fiveYearHours)}<span className={styles.actionResultUnit}>시간</span></p>
            </div>
            {!calc.beyond && (
              <div className={styles.actionResultCell}>
                <p className={styles.actionResultLabel}>가능 시간 누적</p>
                <p className={styles.actionResultValue}>{fmt(action.totalHours)}<span className={styles.actionResultUnit}>시간</span></p>
              </div>
            )}
          </div>

          {!calc.beyond && (
            <div className={styles.actionEquivalent}>
              앞으로 매일 {actionMin}분씩 {activity.label}을(를) 이어가면 약 <strong>{action.equivYears.toFixed(1)}년</strong>의 시간을 이 활동에 쌓을 수 있어요.
            </div>
          )}

          <div className={styles.proverbCard}>
            {activity.proverb}
          </div>
        </div>
      )}

      {/* 공유 */}
      {mounted && stage === 'show' && !calc.futureBirth && (
        <button type="button" className={`${styles.shareBtn} ${copied ? styles.copied : ''}`} onClick={handleShare}>
          {copied ? '✓ 복사 완료' : '공유 텍스트 복사'}
        </button>
      )}

      {/* 정신건강 안내 (항상 하단) */}
      <div className={styles.support}>
        <span className={styles.supportIcon}>🤝</span>
        <div className={styles.supportBody}>
          <strong>이 도구를 보고 무거운 감정이 드신다면, 혼자 견디지 마세요.</strong>
          <ul>
            <li>자살예방 상담전화 — <a href="tel:109">109</a> (24시간 무료, 카카오톡 SNS 상담 &lsquo;마들랜&rsquo; 병행)</li>
            <li>정신건강상담전화 — <a href="tel:15770199">1577-0199</a> (24시간)</li>
            <li>청소년상담1388 — <a href="tel:1388">1388</a> (9~24세 청소년·보호자, 휴대전화는 지역번호+1388)</li>
          </ul>
          <p style={{ marginTop: 8, color: 'var(--muted)' }}>위기 상황이 아니어도, 일상의 부담이 많을 때 상담받으실 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}
