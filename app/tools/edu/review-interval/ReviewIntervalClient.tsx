'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './review-interval.module.css'

// ─────────────────────────────────────────────
// 데이터·상수
// ─────────────────────────────────────────────
type Difficulty = 'easy' | 'normal' | 'hard'
type Intensity = 'fast' | 'normal' | 'relaxed'

const SIMPLE_INTERVALS: Record<Difficulty, number[]> = {
  easy:   [1, 4, 10, 21, 45],
  normal: [1, 3, 7, 14, 30],
  hard:   [1, 2, 5, 10, 21],
}
const INTENSITY_MULT: Record<Intensity, number> = { fast: 0.7, normal: 1.0, relaxed: 1.5 }

const SCORE_OPTIONS = [
  { v: 0, l: '전혀 기억 X', emoji: '😵' },
  { v: 1, l: '거의 기억 X', emoji: '😣' },
  { v: 2, l: '힌트 필요',   emoji: '😟' },
  { v: 3, l: '어렵게 기억', emoji: '😐' },
  { v: 4, l: '조금 고민 후', emoji: '🙂' },
  { v: 5, l: '바로 기억',   emoji: '😎' },
]

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function todayISO(): string { return toISODate(new Date()) }
function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function addDays(date: Date, days: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() + days)
  return r
}
function diffDays(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}
function fmtDate(d: Date): string {
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function fmtKorean(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}
function dDay(target: Date, base: Date = new Date()): string {
  const today = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const d = diffDays(today, t)
  if (d === 0) return 'D-DAY (오늘)'
  if (d > 0) return `D-${d}`
  return `D+${-d} (지남)`
}

// ─────────────────────────────────────────────
// SM-2 알고리즘
// ─────────────────────────────────────────────
type SM2Input = { quality: number; repetitions: number; ef: number; interval: number }
type SM2Output = { nextInterval: number; nextEF: number; nextRepetitions: number }
function sm2(input: SM2Input): SM2Output {
  const { quality } = input
  let ef = input.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  ef = Math.max(1.3, ef)
  let reps: number, interval: number
  if (quality < 3) {
    reps = 0
    interval = 1
  } else {
    reps = input.repetitions + 1
    if (reps === 1) interval = 1
    else if (reps === 2) interval = 6
    else interval = Math.round(input.interval * ef)
  }
  return { nextInterval: interval, nextEF: ef, nextRepetitions: reps }
}

// ─────────────────────────────────────────────
// 망각곡선 SVG
// ─────────────────────────────────────────────
function ForgettingCurve({ reviewDays, totalDays = 30, baseStability = 2.5 }: { reviewDays: number[]; totalDays?: number; baseStability?: number }) {
  const W = 720, H = 280
  const padL = 50, padR = 30, padT = 20, padB = 36
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const xScale = (d: number) => padL + (d / totalDays) * innerW
  const yScale = (r: number) => padT + (1 - r / 100) * innerH

  // 복습 안 한 곡선
  const pointsNoReview: [number, number][] = []
  for (let day = 0; day <= totalDays; day += 0.5) {
    const r = Math.exp(-day / baseStability) * 100
    pointsNoReview.push([xScale(day), yScale(r)])
  }

  // 복습 한 곡선 — 매 복습마다 100% 회복 + 안정도 1.6배 증가
  const pointsWithReview: [number, number][] = []
  let lastReview = 0
  let stability = baseStability
  let reviewIdx = 0
  for (let day = 0; day <= totalDays; day += 0.25) {
    while (reviewIdx < reviewDays.length && day >= reviewDays[reviewIdx]) {
      lastReview = reviewDays[reviewIdx]
      stability *= 1.6
      reviewIdx++
    }
    const r = Math.exp(-(day - lastReview) / stability) * 100
    pointsWithReview.push([xScale(day), yScale(Math.min(100, Math.max(0, r)))])
  }

  // 복습 마커 위치 (복습 직전 retention과 100%)
  const markers = reviewDays.filter(d => d <= totalDays).map((rd, i) => {
    const before = pointsWithReview.find(p => Math.abs(p[0] - xScale(rd - 0.25)) < 1)
    return {
      x: xScale(rd),
      yBefore: before ? before[1] : yScale(100),
      yAfter: yScale(100),
      day: rd,
      idx: i + 1,
    }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.curveSvg} aria-hidden="true">
      {/* 그리드 */}
      {[0, 25, 50, 75, 100].map(p => (
        <g key={p}>
          <line x1={padL} y1={yScale(p)} x2={W - padR} y2={yScale(p)} stroke="var(--bg3)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={padL - 8} y={yScale(p) + 4} fontSize="10" fill="var(--muted)" textAnchor="end" fontFamily="Syne, sans-serif" fontWeight={700}>{p}%</text>
        </g>
      ))}
      {[0, 7, 14, 21, 30].filter(d => d <= totalDays).map(d => (
        <g key={d}>
          <line x1={xScale(d)} y1={padT} x2={xScale(d)} y2={H - padB} stroke="var(--bg3)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={xScale(d)} y={H - padB + 16} fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={700}>{d}일</text>
        </g>
      ))}

      {/* 축 라벨 */}
      <text x={padL - 36} y={padT + innerH / 2} fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" transform={`rotate(-90 ${padL - 36} ${padT + innerH / 2})`}>기억 유지율 (%)</text>
      <text x={padL + innerW / 2} y={H - 6} fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif">학습 후 일수</text>

      {/* 복습 안 한 곡선 */}
      <polyline
        points={pointsNoReview.map(p => `${p[0]},${p[1]}`).join(' ')}
        fill="none" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="6 4" opacity="0.75"
      />
      <text x={padL + innerW * 0.5} y={yScale(35) + 6} fontSize="11" fill="#FF6B6B" fontFamily="Noto Sans KR, sans-serif" fontWeight={700}>복습 안 함</text>

      {/* 복습 한 곡선 */}
      <polyline
        points={pointsWithReview.map(p => `${p[0]},${p[1]}`).join(' ')}
        fill="none" stroke="#3EFFD0" strokeWidth="2.5"
      />

      {/* 복습 마커 */}
      {markers.map((m, i) => (
        <g key={i}>
          {/* 100% 점프 표시 */}
          <line x1={m.x} y1={m.yBefore} x2={m.x} y2={m.yAfter} stroke="#3EFFD0" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={m.x} cy={m.yAfter} r="5" fill="#3EFFD0" stroke="#0a0a2e" strokeWidth="2" />
          <text x={m.x} y={m.yAfter - 10} fontSize="10" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>R{m.idx}</text>
        </g>
      ))}

      {/* 범례 */}
      <g transform={`translate(${W - padR - 130}, ${padT + 4})`}>
        <rect x="0" y="0" width="130" height="36" fill="var(--bg2)" stroke="var(--border)" rx="4" opacity="0.92" />
        <line x1="8" y1="12" x2="22" y2="12" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="3 2" />
        <text x="26" y="15" fontSize="10" fill="var(--text)" fontFamily="Noto Sans KR, sans-serif">복습 안 함</text>
        <line x1="8" y1="26" x2="22" y2="26" stroke="#3EFFD0" strokeWidth="2.5" />
        <text x="26" y="29" fontSize="10" fill="var(--text)" fontFamily="Noto Sans KR, sans-serif">복습 함 (R1, R2…)</text>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// 학습 항목 타입
// ─────────────────────────────────────────────
type StudyItem = {
  id: string
  title: string
  startDate: string  // ISO
  difficulty: Difficulty
  intensity: Intensity
  memo?: string
  // SM-2 상태
  ef: number
  repetitions: number
  interval: number
  lastReviewDate: string
  nextReviewDate: string
  history: { date: string; quality: number }[]
}

const STORAGE_KEY = 'youtil-review-interval-items-v1'

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function ReviewIntervalClient() {
  const [tab, setTab] = useState<'simple' | 'sm2' | 'items' | 'exam'>('simple')

  // ─ TAB 1 ─
  const [studyDate, setStudyDate] = useState<string>(todayISO())
  const [examDate, setExamDate] = useState<string>('')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [intensity, setIntensity] = useState<Intensity>('normal')

  // ─ TAB 2 ─
  const [sm2Reps, setSm2Reps] = useState<number>(2)
  const [sm2EF, setSm2EF] = useState<string>('2.5')
  const [sm2Interval, setSm2Interval] = useState<string>('6')
  const [sm2Quality, setSm2Quality] = useState<number>(4)
  const [sm2LastDate, setSm2LastDate] = useState<string>(todayISO())

  // ─ TAB 3 ─
  const [items, setItems] = useState<StudyItem[]>([])
  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newDate, setNewDate] = useState<string>(todayISO())
  const [newDiff, setNewDiff] = useState<Difficulty>('normal')
  const [newIntens, setNewIntens] = useState<Intensity>('normal')
  const [newMemo, setNewMemo] = useState<string>('')
  const [scoringItemId, setScoringItemId] = useState<string>('')

  // ─ TAB 4 ─
  const [examTargetDate, setExamTargetDate] = useState<string>('')
  const [totalItems, setTotalItems] = useState<string>('800')
  const [dailyHours, setDailyHours] = useState<string>('2')
  const [minPerItem, setMinPerItem] = useState<string>('2')

  // ─ Copy ─
  const [copied, setCopied] = useState<boolean>(false)

  // localStorage 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  // ─────────────────────────────────────────────
  // TAB 1: 간단 일정
  // ─────────────────────────────────────────────
  const simpleSchedule = useMemo(() => {
    const start = parseISO(studyDate)
    const baseIntervals = SIMPLE_INTERVALS[difficulty]
    const mult = INTENSITY_MULT[intensity]
    const exam = examDate ? parseISO(examDate) : null

    const items = baseIntervals.map((interval, i) => {
      const adjusted = Math.max(1, Math.round(interval * mult))
      const date = addDays(start, adjusted)
      const valid = !exam || date < exam
      return { round: i + 1, interval: adjusted, date, valid, recommended: i < 2 ? '10~15분' : i < 4 ? '15~20분' : '20~30분' }
    }).filter(x => x.valid)

    // 시험 전 최종 복습 (시험일 -2일)
    const finalReview = exam ? addDays(exam, -(difficulty === 'hard' ? 1 : 2)) : null
    if (finalReview && finalReview > start) {
      // 마지막 일반 복습 이후
      const lastReview = items[items.length - 1]
      if (!lastReview || finalReview > lastReview.date) {
        items.push({
          round: items.length + 1,
          interval: diffDays(start, finalReview),
          date: finalReview,
          valid: true,
          recommended: '30분~ (최종 복습)',
          isFinal: true,
        } as typeof items[0] & { isFinal?: boolean })
      }
    }

    return items
  }, [studyDate, difficulty, intensity, examDate])

  // 망각곡선용 복습일들 (학습일 0 기준)
  const reviewDaysFromStart = simpleSchedule.map(s => s.interval)

  // ─────────────────────────────────────────────
  // TAB 2: SM-2
  // ─────────────────────────────────────────────
  const sm2Result = useMemo(() => {
    const ef = parseFloat(sm2EF) || 2.5
    const interval = parseFloat(sm2Interval) || 1
    const result = sm2({
      quality: sm2Quality,
      repetitions: sm2Reps,
      ef,
      interval,
    })
    const lastDate = parseISO(sm2LastDate)
    const nextDate = addDays(lastDate, result.nextInterval)
    return { ...result, prevEF: ef, prevInterval: interval, nextDate }
  }, [sm2Reps, sm2EF, sm2Interval, sm2Quality, sm2LastDate])

  // ─────────────────────────────────────────────
  // TAB 3: 학습 항목 관리
  // ─────────────────────────────────────────────
  function addItem() {
    if (!newTitle.trim()) return
    const start = parseISO(newDate)
    const baseIntervals = SIMPLE_INTERVALS[newDiff]
    const mult = INTENSITY_MULT[newIntens]
    const firstInterval = Math.max(1, Math.round(baseIntervals[0] * mult))
    const item: StudyItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      startDate: newDate,
      difficulty: newDiff,
      intensity: newIntens,
      memo: newMemo.trim() || undefined,
      ef: 2.5,
      repetitions: 0,
      interval: firstInterval,
      lastReviewDate: newDate,
      nextReviewDate: toISODate(addDays(start, firstInterval)),
      history: [],
    }
    setItems(prev => [item, ...prev])
    setShowAdd(false)
    setNewTitle(''); setNewMemo(''); setNewDate(todayISO())
  }

  function deleteItem(id: string) {
    if (!confirm('이 학습 항목을 삭제하시겠습니까?')) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function applyReview(id: string, quality: number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const result = sm2({
        quality,
        repetitions: item.repetitions,
        ef: item.ef,
        interval: item.interval,
      })
      const lastDate = new Date()
      return {
        ...item,
        ef: result.nextEF,
        repetitions: result.nextRepetitions,
        interval: result.nextInterval,
        lastReviewDate: toISODate(lastDate),
        nextReviewDate: toISODate(addDays(lastDate, result.nextInterval)),
        history: [...item.history, { date: toISODate(lastDate), quality }],
      }
    }))
    setScoringItemId('')
  }

  function exportData() {
    const data = JSON.stringify({ version: '1.0', exported: new Date().toISOString(), items }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-review-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (Array.isArray(data.items)) {
          if (confirm(`${data.items.length}개 항목을 가져옵니다. 기존 데이터가 덮어씌워집니다. 계속할까요?`)) {
            setItems(data.items)
          }
        }
      } catch {
        alert('잘못된 백업 파일입니다.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }
  function clearAll() {
    if (!confirm('모든 학습 항목을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return
    setItems([])
  }

  // 항목 분류
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
  }, [items])

  function categorize(item: StudyItem): 'today' | 'missed' | 'future' {
    const next = parseISO(item.nextReviewDate)
    const d = diffDays(todayStart, next)
    if (d === 0) return 'today'
    if (d < 0) return 'missed'
    return 'future'
  }

  const todayItems = sortedItems.filter(i => categorize(i) === 'today')
  const missedItems = sortedItems.filter(i => categorize(i) === 'missed')
  const dueItems = [...missedItems, ...todayItems]

  // 통계
  const stats = useMemo(() => {
    const totalReviews = items.reduce((sum, i) => sum + i.history.length, 0)
    const last7Days = items.reduce((sum, i) => {
      const cutoff = addDays(today, -7)
      return sum + i.history.filter(h => parseISO(h.date) >= cutoff).length
    }, 0)
    const allScores = items.flatMap(i => i.history.map(h => h.quality))
    const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0
    return {
      total: items.length,
      active: items.filter(i => categorize(i) !== 'missed' || i.history.length > 0).length,
      totalReviews,
      last7Days,
      avgScore,
    }
  }, [items, today])  // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // TAB 4: 시험 역산
  // ─────────────────────────────────────────────
  const examPlan = useMemo(() => {
    if (!examTargetDate) return null
    const exam = parseISO(examTargetDate)
    const daysLeft = diffDays(todayStart, exam)
    if (daysLeft <= 0) return { error: '시험일이 오늘 또는 이전입니다' }
    const total = parseFloat(totalItems) || 0
    const dailyHrs = parseFloat(dailyHours) || 0
    const perMin = parseFloat(minPerItem) || 0
    if (total <= 0 || dailyHrs <= 0 || perMin <= 0) return null
    const dailyMinutes = dailyHrs * 60
    const itemsPerDay = Math.max(1, Math.floor(dailyMinutes / perMin))
    // 신규 학습 일수 추정 — 매일 itemsPerDay개씩 학습 (단, 복습 시간이 점점 늘어남 고려)
    // 단순 모델: 신규 학습은 절반 시간, 복습은 절반 시간
    const newItemsPerDay = Math.max(1, Math.floor(itemsPerDay * 0.5))
    const learnDays = Math.ceil(total / newItemsPerDay)
    const totalLearnHours = (total * perMin) / 60
    const totalReviewHours = totalLearnHours * 1.5  // 복습 = 신규의 1.5배
    const totalRequiredHours = totalLearnHours + totalReviewHours
    const totalAvailableHours = daysLeft * dailyHrs
    const isShortage = learnDays > daysLeft - 2  // 시험 2일 전까지 학습 완료 필요
    return {
      daysLeft,
      newItemsPerDay,
      itemsPerDay,
      learnDays,
      totalLearnHours,
      totalReviewHours,
      totalRequiredHours,
      totalAvailableHours,
      isShortage,
      exam,
    }
  }, [examTargetDate, totalItems, dailyHours, minPerItem, todayStart])

  // 일별 학습 계획 생성 (간략화)
  const dailySchedule = useMemo(() => {
    if (!examPlan || 'error' in examPlan || !examPlan) return []
    const out: { date: Date; newItems: number; reviewItems: number; totalMin: number; isLast: boolean }[] = []
    const total = parseFloat(totalItems) || 0
    const perMin = parseFloat(minPerItem) || 2
    const newPerDay = examPlan.newItemsPerDay
    let learned = 0
    for (let i = 0; i < Math.min(examPlan.daysLeft, 30); i++) {
      const date = addDays(todayStart, i)
      const isLastDay = i === examPlan.daysLeft - 1
      const newToday = Math.min(newPerDay, Math.max(0, total - learned))
      learned += newToday
      // 복습 항목 수 추정 (간단: i * newPerDay × 0.4, 안정화)
      const reviewToday = Math.min(learned, Math.round(Math.min(150, learned * 0.4)))
      const totalMin = newToday * perMin + reviewToday * (perMin * 0.7)
      out.push({ date, newItems: newToday, reviewItems: reviewToday, totalMin, isLast: isLastDay })
    }
    return out
  }, [examPlan, totalItems, minPerItem, todayStart])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'simple') {
      text = [
        `[복습 일정 — 간단 모드]`,
        `학습일: ${studyDate} · 난이도: ${difficulty} · 강도: ${intensity}`,
        ``,
        ...simpleSchedule.map(r => `· ${r.round}차 ${fmtDate(r.date)} (${r.interval}일 후, ${r.recommended})`),
        ``,
        `https://youtil.kr/tools/edu/review-interval`,
      ].join('\n')
    } else if (tab === 'sm2') {
      text = [
        `[SM-2 정확 계산]`,
        `이전 EF: ${sm2EF} → 다음 EF: ${sm2Result.nextEF.toFixed(2)}`,
        `이전 간격: ${sm2Interval}일 → 다음 간격: ${sm2Result.nextInterval}일`,
        `다음 복습일: ${fmtDate(sm2Result.nextDate)}`,
        ``,
        `https://youtil.kr/tools/edu/review-interval`,
      ].join('\n')
    } else if (tab === 'items') {
      text = [
        `[학습 항목 관리]`,
        `총 ${stats.total}개 항목 · 오늘 복습 ${todayItems.length}개 · 놓친 ${missedItems.length}개`,
        `7일간 복습 완료: ${stats.last7Days}회 · 평균 점수: ${stats.avgScore.toFixed(1)}/5`,
        ``,
        `https://youtil.kr/tools/edu/review-interval`,
      ].join('\n')
    } else if (examPlan && !('error' in examPlan)) {
      text = [
        `[시험일 역산 학습 계획]`,
        `시험일: ${examTargetDate} (D-${examPlan.daysLeft})`,
        `매일 신규 ${examPlan.newItemsPerDay}개 · 일평균 ${examPlan.itemsPerDay}개 처리`,
        `${examPlan.isShortage ? '⚠️ 일정 부족 가능성' : '✓ 일정 가능'}`,
        ``,
        `https://youtil.kr/tools/edu/review-interval`,
      ].join('\n')
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        <strong>참고용 학습 도구입니다.</strong> 에빙하우스 망각곡선과 SM-2 알고리즘을 단순화한 모델이며,
        실제 기억력은 학습 내용·수면·집중도·개인차에 따라 달라집니다.
        학습 항목 데이터는 <strong>이 브라우저에 로컬 저장</strong>되며, 캐시 삭제 시 사라질 수 있으니 정기적 백업을 권장합니다.
      </div>

      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'simple' ? s.tabActive : ''}`} onClick={() => setTab('simple')}>간단 복습 일정</button>
        <button className={`${s.tabBtn} ${tab === 'sm2'    ? s.tabActive : ''}`} onClick={() => setTab('sm2')}>SM-2 정확 계산</button>
        <button className={`${s.tabBtn} ${tab === 'items'  ? s.tabActive : ''}`} onClick={() => setTab('items')}>학습 항목 관리</button>
        <button className={`${s.tabBtn} ${tab === 'exam'   ? s.tabActive : ''}`} onClick={() => setTab('exam')}>시험일 역산</button>
      </div>

      {/* ─── TAB 1 ─── */}
      {tab === 'simple' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>학습 정보</span></div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>학습일</span>
                <input className={s.dateInput} type="date" value={studyDate} onChange={e => setStudyDate(e.target.value)} />
              </div>
              <div>
                <span className={s.subLabel}>시험일·목표일 (선택)</span>
                <input className={s.dateInput} type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>학습 난이도</span>
              <div className={s.choiceRow}>
                <button className={`${s.choiceBtn} ${s.choiceEasy}   ${difficulty === 'easy'   ? s.choiceActive : ''}`} onClick={() => setDifficulty('easy')}>🟢 쉬움</button>
                <button className={`${s.choiceBtn} ${s.choiceNormal} ${difficulty === 'normal' ? s.choiceActive : ''}`} onClick={() => setDifficulty('normal')}>🟡 보통</button>
                <button className={`${s.choiceBtn} ${s.choiceHard}   ${difficulty === 'hard'   ? s.choiceActive : ''}`} onClick={() => setDifficulty('hard')}>🔴 어려움</button>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>복습 강도</span>
              <div className={s.choiceRow}>
                <button className={`${s.choiceBtn} ${s.choiceFast}    ${intensity === 'fast'    ? s.choiceActive : ''}`} onClick={() => setIntensity('fast')}>⚡ 빠르게</button>
                <button className={`${s.choiceBtn} ${s.choiceNormal}  ${intensity === 'normal'  ? s.choiceActive : ''}`} onClick={() => setIntensity('normal')}>⚙️ 일반</button>
                <button className={`${s.choiceBtn} ${s.choiceRelaxed} ${intensity === 'relaxed' ? s.choiceActive : ''}`} onClick={() => setIntensity('relaxed')}>🌊 여유있게</button>
              </div>
            </div>
          </div>

          {/* HERO */}
          {simpleSchedule.length > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>다음 복습일</p>
              <p className={s.heroNum}>{fmtKorean(simpleSchedule[0].date)}</p>
              <p className={s.heroSub}>
                <strong>{dDay(simpleSchedule[0].date)}</strong> · 1차 복습 ({simpleSchedule[0].interval}일 후)
              </p>
            </div>
          )}

          {/* 일정 표 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>복습 일정</span>
              <span className={s.cardLabelHint}>{simpleSchedule.length}회차</span>
            </div>
            <div className={s.tableScroll}>
              <table className={s.scheduleTable}>
                <thead>
                  <tr><th>회차</th><th>복습일</th><th>간격</th><th>권장 시간</th></tr>
                </thead>
                <tbody>
                  {simpleSchedule.map((r, i) => {
                    const isToday = diffDays(todayStart, r.date) === 0
                    const isMissed = diffDays(todayStart, r.date) < 0
                    const isFinal = 'isFinal' in r && (r as { isFinal?: boolean }).isFinal
                    return (
                      <tr key={i} className={isToday ? s.rowToday : isMissed ? s.rowMissed : isFinal ? s.rowFinal : ''}>
                        <td>{isFinal ? '최종' : r.round + '차'}</td>
                        <td>
                          {fmtDate(r.date)} {isToday && '⏰'}
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{dDay(r.date)}</div>
                        </td>
                        <td>{r.interval}일 후</td>
                        <td>{r.recommended}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 망각곡선 */}
          <div className={s.curveWrap}>
            <ForgettingCurve reviewDays={reviewDaysFromStart} totalDays={Math.max(30, ...reviewDaysFromStart) + 5} />
          </div>

          <div className={s.interpretCard}>
            💡 <strong>해석:</strong> 복습하지 않으면 7일 후 기억 유지율이 약 <strong>30% 이하</strong>로 떨어집니다.
            권장 일정대로 복습하면 기억 유지율 <strong>70% 이상</strong>을 시험까지 유지할 수 있습니다.
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 2: SM-2 ─── */}
      {tab === 'sm2' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>SM-2 입력</span>
              <span className={s.cardLabelHint}>SuperMemo 2 알고리즘</span>
            </div>
            <div className={s.gridThree}>
              <div>
                <span className={s.subLabel}>마지막 복습일</span>
                <input className={s.dateInput} type="date" value={sm2LastDate} onChange={e => setSm2LastDate(e.target.value)} />
              </div>
              <div>
                <span className={s.subLabel}>이전 복습 횟수</span>
                <input className={s.bigInput} type="number" min="0" max="20" step="1" value={sm2Reps} onChange={e => setSm2Reps(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <span className={s.subLabel}>이전 간격 (일)</span>
                <input className={s.bigInput} type="number" min="1" max="365" step="1" value={sm2Interval} onChange={e => setSm2Interval(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className={s.subLabel}>현재 난이도 계수 EF: {parseFloat(sm2EF).toFixed(2)} (1.3 ~ 3.0, 기본 2.5)</span>
              <div className={s.sliderRow}>
                <input type="range" min={1.3} max={3.0} step={0.05} value={sm2EF} onChange={e => setSm2EF(e.target.value)} />
                <span className={s.sliderValue}>EF {parseFloat(sm2EF).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>방금 복습 시도 — 기억 점수 (0~5)</span>
              <span className={s.cardLabelHint}>정직하게 입력</span>
            </div>
            <div className={s.scoreRow}>
              {SCORE_OPTIONS.map(o => (
                <button
                  key={o.v}
                  className={`${s.scoreBtn} ${s['score' + o.v]} ${sm2Quality === o.v ? s.scoreActive : ''}`}
                  onClick={() => setSm2Quality(o.v)}
                  type="button"
                >
                  <small>{o.v}</small>
                  {o.emoji}<br />
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* HERO */}
          <div className={s.hero}>
            <p className={s.heroLead}>다음 복습일</p>
            <p className={s.heroNum}>{fmtKorean(sm2Result.nextDate)}</p>
            <p className={s.heroSub}>
              <strong>{dDay(sm2Result.nextDate)}</strong> ·
              {sm2Quality < 3 ? ' 처음부터 다시 (간격 1일)' : ` 간격 ${sm2Result.nextInterval}일`}
            </p>
          </div>

          {/* 분석 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>SM-2 분석</span>
            </div>
            <table className={s.analysisTable}>
              <tbody>
                <tr><td>기억 점수</td><td>{sm2Quality} ({SCORE_OPTIONS[sm2Quality].l})</td></tr>
                <tr><td>이전 복습 횟수</td><td>{sm2Reps}회</td></tr>
                <tr><td>다음 복습 횟수</td><td>{sm2Result.nextRepetitions}회</td></tr>
                <tr><td>이전 EF</td><td>{sm2Result.prevEF.toFixed(2)}</td></tr>
                <tr><td>다음 EF</td><td>{sm2Result.nextEF.toFixed(2)} ({sm2Result.nextEF > sm2Result.prevEF ? '↑' : sm2Result.nextEF < sm2Result.prevEF ? '↓' : '→'})</td></tr>
                <tr><td>이전 간격</td><td>{sm2Result.prevInterval}일</td></tr>
                <tr className={s.totalRow}><td>다음 간격</td><td>{sm2Result.nextInterval}일</td></tr>
              </tbody>
            </table>
          </div>

          <div className={s.scoreGuide}>
            📚 <strong>점수별 동작:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li><strong style={{ color: '#FF6B6B' }}>0~2점:</strong> 처음부터 다시 시작 (간격 1일, 횟수 0)</li>
              <li><strong style={{ color: '#FFD700' }}>3점:</strong> 간격 약간 증가, EF 약간 ↓</li>
              <li><strong style={{ color: '#3EFF9B' }}>4점:</strong> 간격 정상 증가, EF 유지</li>
              <li><strong style={{ color: 'var(--accent)' }}>5점:</strong> 간격 크게 증가, EF 상승</li>
            </ul>
          </div>

          {/* 망각곡선 */}
          <div className={s.curveWrap}>
            <ForgettingCurve reviewDays={[sm2Result.nextInterval]} totalDays={Math.max(30, sm2Result.nextInterval + 5)} baseStability={parseFloat(sm2EF)} />
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 3: 학습 항목 관리 ─── */}
      {tab === 'items' && (
        <>
          {/* 통계 */}
          {items.length > 0 && (
            <div className={s.statsGrid}>
              <div className={s.statCard}>
                <p className={s.statValue}>{stats.total}</p>
                <p className={s.statLabel}>총 학습 항목</p>
              </div>
              <div className={s.statCard}>
                <p className={s.statValue}>{todayItems.length + missedItems.length}</p>
                <p className={s.statLabel}>복습 필요</p>
              </div>
              <div className={s.statCard}>
                <p className={s.statValue}>{stats.last7Days}</p>
                <p className={s.statLabel}>7일간 복습</p>
              </div>
              <div className={s.statCard}>
                <p className={s.statValue}>{stats.avgScore.toFixed(1)}<small style={{ fontSize: 12, color: 'var(--muted)' }}>/5</small></p>
                <p className={s.statLabel}>평균 점수</p>
              </div>
            </div>
          )}

          {/* 오늘 복습 강조 */}
          {dueItems.length > 0 && (
            <div className={s.todayBanner}>
              <p className={s.todayBannerTitle}>⏰ 복습할 항목 ({dueItems.length}개)</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>
                {missedItems.length > 0 && <>놓친 항목 <strong style={{ color: '#FF8C8C' }}>{missedItems.length}개</strong> · </>}
                {todayItems.length > 0 && <>오늘 복습 <strong style={{ color: '#3EFFD0' }}>{todayItems.length}개</strong></>}
              </p>
            </div>
          )}

          {/* 항목 추가 */}
          {!showAdd ? (
            <button
              style={{
                background: 'rgba(62,255,208,0.06)', border: '1px dashed #3EFFD0', borderRadius: 12,
                padding: '14px 18px', fontSize: 13.5, color: '#3EFFD0', fontFamily: 'Noto Sans KR, sans-serif',
                fontWeight: 700, cursor: 'pointer', width: '100%',
              }}
              onClick={() => setShowAdd(true)}
              type="button"
            >
              + 새 학습 항목 추가
            </button>
          ) : (
            <div className={s.itemAddCard}>
              <p className={s.itemAddTitle}>새 학습 항목</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span className={s.subLabel}>제목 *</span>
                  <input className={s.textInput} type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="예: 일본어 단어장 1과" maxLength={50} />
                </div>
                <div className={s.gridTwo}>
                  <div>
                    <span className={s.subLabel}>학습일</span>
                    <input className={s.dateInput} type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div>
                    <span className={s.subLabel}>메모 (선택)</span>
                    <input className={s.textInput} type="text" value={newMemo} onChange={e => setNewMemo(e.target.value)} placeholder="-" maxLength={100} />
                  </div>
                </div>
                <div>
                  <span className={s.subLabel}>난이도</span>
                  <div className={s.choiceRow}>
                    <button className={`${s.choiceBtn} ${s.choiceEasy}   ${newDiff === 'easy'   ? s.choiceActive : ''}`} onClick={() => setNewDiff('easy')}>🟢 쉬움</button>
                    <button className={`${s.choiceBtn} ${s.choiceNormal} ${newDiff === 'normal' ? s.choiceActive : ''}`} onClick={() => setNewDiff('normal')}>🟡 보통</button>
                    <button className={`${s.choiceBtn} ${s.choiceHard}   ${newDiff === 'hard'   ? s.choiceActive : ''}`} onClick={() => setNewDiff('hard')}>🔴 어려움</button>
                  </div>
                </div>
                <div>
                  <span className={s.subLabel}>복습 강도</span>
                  <div className={s.choiceRow}>
                    <button className={`${s.choiceBtn} ${s.choiceFast}    ${newIntens === 'fast'    ? s.choiceActive : ''}`} onClick={() => setNewIntens('fast')}>⚡ 빠르게</button>
                    <button className={`${s.choiceBtn} ${s.choiceNormal}  ${newIntens === 'normal'  ? s.choiceActive : ''}`} onClick={() => setNewIntens('normal')}>⚙️ 일반</button>
                    <button className={`${s.choiceBtn} ${s.choiceRelaxed} ${newIntens === 'relaxed' ? s.choiceActive : ''}`} onClick={() => setNewIntens('relaxed')}>🌊 여유</button>
                  </div>
                </div>
                <div className={s.itemActions}>
                  <button className={`${s.itemActionBtn} ${s.itemActionPrimary}`} onClick={addItem} type="button">저장</button>
                  <button className={s.itemActionBtn} onClick={() => { setShowAdd(false); setNewTitle('') }} type="button">취소</button>
                </div>
              </div>
            </div>
          )}

          {/* 항목 목록 */}
          {items.length === 0 ? (
            <div className={s.itemEmpty}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📚</p>
              저장된 학습 항목이 없습니다.
              <br />위의 [+ 새 학습 항목 추가] 버튼으로 시작하세요.
            </div>
          ) : (
            <div className={s.itemList}>
              {sortedItems.map(item => {
                const cat = categorize(item)
                const next = parseISO(item.nextReviewDate)
                const isScoring = scoringItemId === item.id
                return (
                  <div key={item.id} className={`${s.itemCard} ${
                    cat === 'today'  ? s.itemCardToday :
                    cat === 'missed' ? s.itemCardMissed :
                    s.itemCardFuture
                  }`}>
                    <div className={s.itemHeader}>
                      <span className={s.itemTitle}>{item.title}</span>
                      <span className={`${s.itemDday} ${
                        cat === 'today'  ? s.itemDdayToday :
                        cat === 'missed' ? s.itemDdayMissed :
                        s.itemDdayFuture
                      }`}>{dDay(next)}</span>
                    </div>
                    <div className={s.itemMeta}>
                      <span>📅 학습 <strong>{item.startDate}</strong></span>
                      <span>🔄 다음 <strong>{item.nextReviewDate}</strong></span>
                      <span>📊 {item.repetitions}회차 (EF {item.ef.toFixed(2)})</span>
                    </div>
                    {item.memo && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 6 }}>💭 {item.memo}</p>
                    )}
                    {isScoring ? (
                      <div className={s.scoreInline}>
                        <p className={s.scoreInlineTitle}>방금 복습 — 얼마나 기억나셨나요?</p>
                        <div className={s.scoreRow}>
                          {SCORE_OPTIONS.map(o => (
                            <button
                              key={o.v}
                              className={`${s.scoreBtn} ${s['score' + o.v]}`}
                              onClick={() => applyReview(item.id, o.v)}
                              type="button"
                            >
                              <small>{o.v}</small>
                              {o.emoji}
                            </button>
                          ))}
                        </div>
                        <button className={s.itemActionBtn} style={{ marginTop: 8 }} onClick={() => setScoringItemId('')} type="button">취소</button>
                      </div>
                    ) : (
                      <div className={s.itemActions}>
                        {(cat === 'today' || cat === 'missed') && (
                          <button className={`${s.itemActionBtn} ${s.itemActionPrimary}`} onClick={() => setScoringItemId(item.id)} type="button">✓ 복습 완료</button>
                        )}
                        <button className={`${s.itemActionBtn} ${s.itemActionDanger}`} onClick={() => deleteItem(item.id)} type="button">삭제</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 데이터 관리 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>데이터 관리</span>
            </div>
            <div className={s.dataMgmt}>
              <button className={s.itemActionBtn} onClick={exportData} disabled={items.length === 0} type="button">📥 백업 다운로드</button>
              <label className={s.itemActionBtn} style={{ cursor: 'pointer' }}>
                📤 백업 가져오기
                <input type="file" accept=".json,application/json" onChange={importData} style={{ display: 'none' }} />
              </label>
              <button className={`${s.itemActionBtn} ${s.itemActionDanger}`} onClick={clearAll} disabled={items.length === 0} type="button">⚠️ 전체 삭제</button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ※ 데이터는 이 브라우저의 localStorage에 저장됩니다. 다른 기기에서 사용하려면 백업 다운로드를 활용하세요.
            </p>
          </div>
        </>
      )}

      {/* ─── TAB 4: 시험일 역산 ─── */}
      {tab === 'exam' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>시험·학습 정보</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>시험일</span>
                <input className={s.dateInput} type="date" value={examTargetDate} onChange={e => setExamTargetDate(e.target.value)} />
              </div>
              <div>
                <span className={s.subLabel}>학습 항목 수 (단어/페이지/챕터 등)</span>
                <input className={s.bigInput} type="number" min="1" step="1" value={totalItems} onChange={e => setTotalItems(e.target.value)} />
              </div>
              <div>
                <span className={s.subLabel}>하루 공부 가능 시간 (시간)</span>
                <input className={s.bigInput} type="number" min="0.5" max="16" step="0.5" value={dailyHours} onChange={e => setDailyHours(e.target.value)} />
              </div>
              <div>
                <span className={s.subLabel}>항목당 평균 학습 시간 (분)</span>
                <input className={s.bigInput} type="number" min="0.5" max="60" step="0.5" value={minPerItem} onChange={e => setMinPerItem(e.target.value)} />
              </div>
            </div>
          </div>

          {examPlan && 'error' in examPlan && (
            <div className={s.warnCard}>⚠️ {examPlan.error}</div>
          )}

          {examPlan && !('error' in examPlan) && (
            <>
              <div className={s.hero}>
                <p className={s.heroLead}>일별 권장 학습량</p>
                <p className={s.heroNum}>매일 신규 {examPlan.newItemsPerDay}개</p>
                <p className={s.heroSub}>
                  <strong>D-{examPlan.daysLeft}</strong> · 일평균 약 {examPlan.itemsPerDay}개 처리 · 하루 {dailyHours}시간 권장
                </p>
              </div>

              {examPlan.isShortage && (
                <div className={s.warnCard}>
                  ⚠️ <strong>일정 부족 가능성:</strong> 현재 일정으로는 시험 전 학습 완료가 어려울 수 있습니다.
                  하루 학습 시간을 늘리거나, 학습 항목 수를 줄이거나, 복습 강도를 조정(빠르게)하는 것을 검토하세요.
                </div>
              )}

              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>총 소요 시간 추정</span>
                </div>
                <table className={s.analysisTable}>
                  <tbody>
                    <tr><td>총 학습 항목</td><td>{parseFloat(totalItems).toLocaleString('ko-KR')}개</td></tr>
                    <tr><td>신규 학습 시간</td><td>{examPlan.totalLearnHours.toFixed(1)}시간</td></tr>
                    <tr><td>복습 시간</td><td>{examPlan.totalReviewHours.toFixed(1)}시간</td></tr>
                    <tr><td>총 필요 시간</td><td>{examPlan.totalRequiredHours.toFixed(1)}시간</td></tr>
                    <tr className={s.totalRow}><td>가능 시간 (D-{examPlan.daysLeft} × {dailyHours}h)</td><td>{examPlan.totalAvailableHours.toFixed(1)}시간</td></tr>
                  </tbody>
                </table>
              </div>

              {/* 일별 계획 표 */}
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>일별 학습 계획 (앞 30일까지)</span>
                </div>
                <div className={s.tableScroll}>
                  <table className={s.scheduleTable}>
                    <thead>
                      <tr><th>일자</th><th>신규</th><th>복습</th><th>총 시간</th></tr>
                    </thead>
                    <tbody>
                      {dailySchedule.map((d, i) => {
                        const isToday = i === 0
                        const isLast = d.isLast
                        return (
                          <tr key={i} className={isToday ? s.rowToday : isLast ? s.rowFinal : ''}>
                            <td>{fmtDate(d.date)} {isToday && '(오늘)'} {isLast && '(시험 전날)'}</td>
                            <td>{d.newItems > 0 ? `${d.newItems}개` : '0 (완료)'}</td>
                            <td>{d.reviewItems}개</td>
                            <td>약 {(d.totalMin / 60).toFixed(1)}h</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
                {copied ? '✓ 복사됨' : '결과 복사하기'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
