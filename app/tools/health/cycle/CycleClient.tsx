/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo, useEffect, useRef } from 'react'
import s from './cycle.module.css'
import {
  PHASE_META, REGULARITY_LABEL, PMS_LEVEL_LABEL, LIFESTYLE_LABEL,
  PHASE_GUIDES,
  calcCycle, buildCalendar, phaseAngles, arcPath, polarToCartesian,
  fmtKor, fmtMonthDay, isoDate, fromIso, dateAdd, dateDiff, startOfDay,
  loadCycleData, saveCycleData, clearCycleData,
  recordsToCSV, csvToRecords, analyzeRecords,
  validateInput,
  type Phase, type Regularity, type PMSLevel, type Lifestyle,
  type CycleRecord,
} from './cycleUtils'

type TabKey = 'calendar' | 'guide' | 'fertility' | 'records'

const PERIOD_LEN_QUICK = [3, 4, 5, 6, 7]
const CYCLE_QUICK = [24, 26, 28, 30, 32, 35]

function uid(): string { return Math.random().toString(36).slice(2, 10) }

export default function CycleClient() {
  const [tab, setTab] = useState<TabKey>('calendar')

  // ── 입력 ───────────────────────────
  const today = useMemo(() => startOfDay(new Date()), [])
  const [lastPeriodIso, setLastPeriodIso] = useState<string>(isoDate(dateAdd(today, -7)))  // 기본: 7일 전
  const [periodLength, setPeriodLength] = useState<number>(5)
  const [avgCycle, setAvgCycle] = useState<number>(28)
  const [regularity, setRegularity] = useState<Regularity>('regular')
  const [pmsLevel, setPmsLevel] = useState<PMSLevel>('mild')
  const [lifestyle, setLifestyle] = useState<Lifestyle[]>([])
  const [trackingPregnancy, setTrackingPregnancy] = useState<boolean | null>(null)

  // ── localStorage 로드/저장 ─────────
  const [records, setRecords] = useState<CycleRecord[]>([])
  const [mounted, setMounted] = useState(false)
  const initialLoadRef = useRef(false)

  useEffect(() => {
    const data = loadCycleData()
    if (data) {
      setLastPeriodIso(data.lastPeriodDate)
      setPeriodLength(data.periodLength)
      setAvgCycle(data.avgCycle)
      if (data.regularity) setRegularity(data.regularity)
      if (data.pmsLevel) setPmsLevel(data.pmsLevel)
      if (data.lifestyle) setLifestyle(data.lifestyle)
      if (data.trackingPregnancy !== undefined) setTrackingPregnancy(data.trackingPregnancy)
      setRecords(data.records ?? [])
    }
    initialLoadRef.current = true
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!initialLoadRef.current) return
    saveCycleData({
      lastPeriodDate: lastPeriodIso,
      periodLength, avgCycle,
      regularity, pmsLevel,
      trackingPregnancy: trackingPregnancy ?? undefined,
      lifestyle,
      records,
    })
  }, [lastPeriodIso, periodLength, avgCycle, regularity, pmsLevel, trackingPregnancy, lifestyle, records])

  // ── 계산 ──────────────────────────
  const validationError = validateInput(lastPeriodIso, periodLength, avgCycle)
  const lastPeriod = useMemo(() => fromIso(lastPeriodIso), [lastPeriodIso])
  const cycleInput = useMemo(() => ({
    lastPeriod, periodLength, avgCycle, today,
  }), [lastPeriod, periodLength, avgCycle, today])

  const result = useMemo(
    () => validationError ? null : calcCycle(cycleInput),
    [cycleInput, validationError],
  )

  // ── 캘린더 월 ──────────────────────
  const [calMonth, setCalMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))
  const calendar = useMemo(
    () => validationError ? [] : buildCalendar(calMonth.year, calMonth.month, cycleInput),
    [calMonth, cycleInput, validationError],
  )
  const goPrevMonth = () => setCalMonth((p) => {
    const d = new Date(p.year, p.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const goNextMonth = () => setCalMonth((p) => {
    const d = new Date(p.year, p.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // ── 자가체크 ──────────────────────
  const [todayMood, setTodayMood] = useState<'good' | 'normal' | 'bad' | ''>('')
  const [todayIsPeriodStart, setTodayIsPeriodStart] = useState(false)
  const [todayNotes, setTodayNotes] = useState('')

  const todayIso = isoDate(today)
  const todayRecord = records.find((r) => r.date === todayIso)
  useEffect(() => {
    if (todayRecord) {
      setTodayMood(todayRecord.mood ?? '')
      setTodayIsPeriodStart(!!todayRecord.isPeriodStart)
      setTodayNotes(todayRecord.notes ?? '')
    }
  }, [todayRecord])

  const saveTodayCheck = () => {
    const newRec: CycleRecord = {
      id: todayRecord?.id ?? uid(),
      date: todayIso,
      isPeriodStart: todayIsPeriodStart,
      mood: todayMood || undefined,
      notes: todayNotes.trim() || undefined,
    }
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.date !== todayIso)
      return [...filtered, newRec].sort((a, b) => b.date.localeCompare(a.date))
    })
    // 만약 오늘이 생리 시작이면 lastPeriodIso 업데이트 권장
    if (todayIsPeriodStart && lastPeriodIso !== todayIso) {
      if (confirm('오늘을 마지막 생리 시작일로 업데이트하시겠습니까?')) {
        setLastPeriodIso(todayIso)
      }
    }
  }

  const analysis = useMemo(() => analyzeRecords(records), [records])

  // ── CSV ──────────────────────────
  const downloadCSV = () => {
    const csv = recordsToCSV(records)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-cycle-records-${todayIso}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  const importCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const imported = csvToRecords(text)
      if (imported.length > 0) {
        const merged = [...records.filter((r) => !imported.some((i) => i.date === r.date)), ...imported]
        merged.sort((a, b) => b.date.localeCompare(a.date))
        setRecords(merged)
      }
    }
    reader.readAsText(file)
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 전체 삭제 ────────────────────
  const wipeAllData = () => {
    if (!confirm('모든 입력·기록을 삭제하시겠습니까? (되돌릴 수 없음)')) return
    clearCycleData()
    setLastPeriodIso(isoDate(dateAdd(today, -7)))
    setPeriodLength(5)
    setAvgCycle(28)
    setRegularity('regular')
    setPmsLevel('mild')
    setLifestyle([])
    setTrackingPregnancy(null)
    setRecords([])
    setTodayMood('')
    setTodayIsPeriodStart(false)
    setTodayNotes('')
    alert('모든 데이터를 삭제했습니다.')
  }

  // ── 가임기 모드 — 관계일 입력 ──────
  const [intimacyDateIso, setIntimacyDateIso] = useState<string>('')
  const intimacyAnalysis = useMemo(() => {
    if (!intimacyDateIso || !result) return null
    const d = fromIso(intimacyDateIso)
    const ovDiff = dateDiff(d, result.ovulationDate)
    const inFertility = d >= result.fertilityStart && d <= result.fertilityEnd
    return { ovDiff, inFertility }
  }, [intimacyDateIso, result])

  return (
    <div className={s.wrap}>
      {/* 프라이버시 안내 — 항상 최상단 */}
      <div className={s.privacyBanner}>
        <strong>🔒 프라이버시 보호</strong>
        모든 입력·기록은 본인 브라우저(localStorage)에만 저장됩니다.
        youtil 서버·외부 전송 X · 익명 사용 · <button className={s.wipeLink} onClick={wipeAllData}>한 번 클릭 전체 삭제</button>
      </div>

      {/* ── 면책 (모든 탭 공통) ── */}
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량' },
          { href: '/tools/health/weightloss', label: '체중감량 계산기' }
        ]}
        sources={[
          { label: '대한산부인과학회', href: 'https://www.ksog.org' },
          { label: '보건복지부', href: 'https://www.mohw.go.kr' },
        ]}
      >
        본 도구는 일반 참고 가이드입니다 본 도구는 <strong>피임 방법 X · 임신 확진 X · 의학 진단 X</strong> 호르몬 약물·의약품 추천 X · 영양사 처방 X · 특정 브랜드 추천 X 다음 경우 <strong>산부인과 상담</strong>: 주기 변동 ±8일 이상 / 부정출혈·과다 출혈 / 6개월+ 무월경 / 심한 PMS·통증 / 임신 계획·피임
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="생리주기 도구 탭">
        <button type="button" role="tab" aria-selected={tab === 'calendar'} className={`${s.tab} ${tab === 'calendar' ? s.tabActive : ''}`} onClick={() => setTab('calendar')}>🌙 주기 캘린더</button>
        <button type="button" role="tab" aria-selected={tab === 'guide'} className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`} onClick={() => setTab('guide')}>💆 컨디션 가이드</button>
        <button type="button" role="tab" aria-selected={tab === 'fertility'} className={`${s.tab} ${tab === 'fertility' ? s.tabActive : ''}`} onClick={() => setTab('fertility')}>👶 가임기 참고</button>
        <button type="button" role="tab" aria-selected={tab === 'records'} className={`${s.tab} ${tab === 'records' ? s.tabActive : ''}`} onClick={() => setTab('records')}>📋 내 기록</button>
      </div>

      {/* ══════════ TAB 1: 주기 캘린더 ══════════ */}
      {tab === 'calendar' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>① 마지막 생리 시작일</span>
            <input type="date" className={s.input}
              aria-label="마지막 생리 시작일"
              max={isoDate(today)}
              value={lastPeriodIso}
              onChange={(e) => setLastPeriodIso(e.target.value)} />
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>② 생리 기간 (일)</span>
            <div className={s.pillRow} role="group" aria-label="생리 기간 선택">
              {PERIOD_LEN_QUICK.map((d) => (
                <button key={d} type="button" aria-pressed={periodLength === d} className={`${s.pill} ${periodLength === d ? s.pillActive : ''}`}
                  onClick={() => setPeriodLength(d)}>{d}일</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>③ 평균 주기 (일) — 생리 첫날 ~ 다음 생리 첫날</span>
            <div className={s.pillRow} role="group" aria-label="평균 주기 빠른 선택">
              {CYCLE_QUICK.map((d) => (
                <button key={d} type="button" aria-pressed={avgCycle === d} className={`${s.pill} ${avgCycle === d ? s.pillActive : ''}`}
                  onClick={() => setAvgCycle(d)}>{d}일</button>
              ))}
            </div>
            <div className={s.customRow}>
              <input type="number" inputMode="numeric" min={21} max={45}
                className={s.miniInput}
                aria-label="평균 주기 (일)"
                value={avgCycle}
                onChange={(e) => setAvgCycle(Math.max(21, Math.min(45, parseInt(e.target.value) || 28)))} />
              <span className={s.unitText}>일 (21~45)</span>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>④ 주기 규칙성 (선택)</span>
            <div className={s.pillRow} role="group" aria-label="주기 규칙성 선택">
              {(Object.keys(REGULARITY_LABEL) as Regularity[]).map((r) => (
                <button key={r} type="button" aria-pressed={regularity === r} className={`${s.pill} ${regularity === r ? s.pillActive : ''}`}
                  onClick={() => setRegularity(r)}>{REGULARITY_LABEL[r]}</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>⑤ PMS 강도 (선택)</span>
            <div className={s.pillRow} role="group" aria-label="PMS 강도 선택">
              {(Object.keys(PMS_LEVEL_LABEL) as PMSLevel[]).map((l) => (
                <button key={l} type="button" aria-pressed={pmsLevel === l} className={`${s.pill} ${pmsLevel === l ? s.pillActive : ''}`}
                  onClick={() => setPmsLevel(l)}>{PMS_LEVEL_LABEL[l]}</button>
              ))}
            </div>
          </div>

          {validationError && (
            <div className={s.empty}>{validationError}</div>
          )}

          {result && (
            <>
              {/* 히어로 */}
              <div className={s.hero}>
                <p className={s.heroLabel}>다음 생리 예정일</p>
                <p className={s.heroValue}>{fmtKor(result.nextPeriodDate)}</p>
                <p className={s.heroDDay}>
                  {result.daysToNextPeriod > 0 ? `D-${result.daysToNextPeriod}` : result.daysToNextPeriod === 0 ? 'D-DAY' : `D+${-result.daysToNextPeriod}`}
                  {' · '}
                  <span style={{ color: PHASE_META[result.phase].color }}>
                    {PHASE_META[result.phase].emoji} {PHASE_META[result.phase].label} ({result.dayInCycle}일차)
                  </span>
                </p>
              </div>

              {/* 오래된 입력 안내 — 마지막 생리일이 한 주기 이상 지나 자동 보정된 경우 */}
              {result.cyclesSinceLog >= 1 && (
                <div className={s.warningCard}>
                  <strong>📅 마지막 생리일이 오래되었어요</strong>
                  <p>입력한 마지막 생리 시작일이 한 주기(<strong>{avgCycle}일</strong>) 이상 지났습니다. 아래 결과는 평균 주기로 <strong>자동 보정</strong>한 추정치예요. 최근에 생리를 다시 시작했다면 위 <strong>①번 날짜를 업데이트</strong>하면 더 정확합니다.</p>
                </div>
              )}

              {/* 원형 차트 */}
              <CircleChart input={cycleInput} result={result} />

              {/* 요약 */}
              <div className={s.card}>
                <span className={s.cardLabel}>📅 주요 일정 요약</span>
                <table className={s.summaryTable}>
                  <tbody>
                    <tr>
                      <td>다음 생리 예정</td>
                      <td className={s.tdAccent}>{fmtKor(result.nextPeriodDate)}</td>
                    </tr>
                    <tr>
                      <td>현재 phase</td>
                      <td>
                        <span style={{ color: PHASE_META[result.phase].color }}>
                          {PHASE_META[result.phase].emoji} {PHASE_META[result.phase].label}
                        </span> ({result.dayInCycle}일차)
                      </td>
                    </tr>
                    <tr>
                      <td>배란 예상일</td>
                      <td>{fmtKor(result.ovulationDate)}</td>
                    </tr>
                    <tr>
                      <td>가임기 (참고)</td>
                      <td>{fmtMonthDay(result.fertilityStart)} ~ {fmtMonthDay(result.fertilityEnd)}</td>
                    </tr>
                    <tr>
                      <td>PMS 예상 구간</td>
                      <td>{fmtMonthDay(result.pmsStart)} ~ {fmtMonthDay(result.pmsEnd)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 월간 캘린더 */}
              <div className={s.card}>
                <div className={s.calHeader}>
                  <button className={s.calNav} onClick={goPrevMonth} aria-label="이전 달">‹</button>
                  <span className={s.calTitle}>{calMonth.year}년 {calMonth.month + 1}월</span>
                  <button className={s.calNav} onClick={goNextMonth} aria-label="다음 달">›</button>
                </div>
                <div className={s.calLegend}>
                  <span className={s.legendItem}><span className={s.legendDot} style={{ background: PHASE_META.menstrual.color }} /> 생리일</span>
                  <span className={s.legendItem}><span className={s.legendDot} style={{ background: PHASE_META.ovulation.color }} /> 배란일</span>
                  <span className={s.legendItem}><span className={s.legendBg} style={{ background: PHASE_META.ovulation.bgColor }} /> 가임기</span>
                  <span className={s.legendItem}><span className={s.legendBg} style={{ background: 'rgba(255, 184, 224, 0.25)' }} /> PMS 예상</span>
                </div>
                <div className={s.calGrid}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <div key={d} className={`${s.calHeadCell} ${i === 0 ? s.calHeadSun : i === 6 ? s.calHeadSat : ''}`}>{d}</div>
                  ))}
                  {calendar.map((cell, i) => {
                    // 생리기는 background 제거 → PMS(연분홍)와 색상 혼동 방지. 빨강 점으로만 표시
                    let bg = 'transparent'
                    if (cell.isInPMS && cell.phase === 'luteal') bg = 'rgba(255, 184, 224, 0.25)'
                    else if (cell.isInFertility) bg = PHASE_META.ovulation.bgColor
                    return (
                      <div key={i}
                        className={`${s.calCell} ${cell.inCurrentMonth ? '' : s.calCellOther} ${cell.isToday ? s.calCellToday : ''}`}
                        style={{ background: bg }}>
                        <span className={s.calDate}>{cell.date.getDate()}</span>
                        <div className={s.calDots}>
                          {cell.phase === 'menstrual' && (
                            <span
                              className={`${s.calDot} ${cell.isPeriodStart ? s.calDotStart : ''}`}
                              style={{ background: PHASE_META.menstrual.color }}
                              title={cell.isPeriodStart ? '생리 시작' : '생리일'}
                            />
                          )}
                          {cell.isOvulation && <span className={s.calDot} style={{ background: PHASE_META.ovulation.color }} title="배란일" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className={s.calNote}>
                  💡 다음 6개월까지 미리 확인 가능 — 여행·일정 계획에 참고
                </p>
              </div>

              {/* 불규칙 경고 */}
              {regularity === 'irregular' && (
                <div className={s.warningCard}>
                  <strong>⚠️ 많이 불규칙한 주기</strong>
                  <p>본 도구의 예측 정확도가 떨어질 수 있어요. 배란일·생리일은 특정 날짜가 아닌 <strong>범위</strong>로 보세요. 6개월+ 지속되는 불규칙은 <strong>산부인과 상담 권장</strong> (PCOS·갑상선 등 가능성 점검).</p>
                  <p>📞 산부인과 전문의 상담 권장 · 보건복지상담센터 <strong>129</strong> (보건복지부)</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 2: 컨디션 가이드 ══════════ */}
      {tab === 'guide' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>💆 라이프스타일 (선택 — 가이드 강조)</span>
            <div className={s.pillRow} role="group" aria-label="라이프스타일 선택">
              {(Object.keys(LIFESTYLE_LABEL) as Lifestyle[]).map((l) => (
                <button key={l}
                  type="button"
                  aria-pressed={lifestyle.includes(l)}
                  className={`${s.pill} ${lifestyle.includes(l) ? s.pillActive : ''}`}
                  onClick={() => setLifestyle((prev) =>
                    prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
                  )}>
                  {LIFESTYLE_LABEL[l]}
                </button>
              ))}
            </div>
            <p className={s.noteSmall}>
              ⚠️ 모든 안내는 <strong>일반 가이드</strong>입니다. 정확한 처방은 영양사·트레이너·의사 영역.
            </p>
          </div>

          {result && (
            <div className={s.guideCurrentBox} style={{ borderColor: PHASE_META[result.phase].color }}>
              <p className={s.guideCurrentLabel}>현재 단계</p>
              <p className={s.guideCurrentName} style={{ color: PHASE_META[result.phase].color }}>
                {PHASE_META[result.phase].emoji} {PHASE_META[result.phase].label} · {result.dayInCycle}일차
              </p>
            </div>
          )}

          {/* 4 phase 카드 */}
          {(['menstrual', 'follicular', 'ovulation', 'luteal'] as Phase[]).map((p) => {
            const guide = PHASE_GUIDES[p]
            const meta = PHASE_META[p]
            const isCurrent = result?.phase === p
            return (
              <div key={p} className={`${s.guideCard} ${isCurrent ? s.guideCardActive : ''}`}
                style={{ borderColor: isCurrent ? meta.color : undefined }}>
                <div className={s.guideHead}>
                  <span className={s.guideEmoji}>{meta.emoji}</span>
                  <span className={s.guideName} style={{ color: meta.color }}>{meta.label}</span>
                  {isCurrent && <span className={s.guideCurrent}>지금</span>}
                </div>
                <p className={s.guideDesc}>{guide.desc}</p>

                <div className={s.guideRow}>
                  <span className={s.guideRowLabel}>🏃 운동</span>
                  <span className={s.guideRowText}
                    style={lifestyle.includes('exercise') ? { color: 'var(--text)', fontWeight: 600 } : undefined}>
                    {guide.exercise}
                  </span>
                </div>
                <div className={s.guideRow}>
                  <span className={s.guideRowLabel}>🥗 영양</span>
                  <span className={s.guideRowText}
                    style={lifestyle.includes('diet') ? { color: 'var(--text)', fontWeight: 600 } : undefined}>
                    {guide.nutrition}
                  </span>
                </div>
                <div className={s.guideRow}>
                  <span className={s.guideRowLabel}>😴 수면</span>
                  <span className={s.guideRowText}
                    style={lifestyle.includes('sleep') ? { color: 'var(--text)', fontWeight: 600 } : undefined}>
                    {guide.sleep}
                  </span>
                </div>
                {guide.notes.length > 0 && (
                  <ul className={s.guideNotes}>
                    {guide.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                )}
                {guide.warning && <p className={s.guideWarning}>{guide.warning}</p>}
              </div>
            )
          })}

          {/* 운동 강도 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🏃 phase별 운동 강도 (일반 안내)</span>
            <table className={s.guideTable}>
              <thead>
                <tr><th>Phase</th><th>운동 강도</th></tr>
              </thead>
              <tbody>
                <tr><td>🩸 생리기</td><td>가볍게 (회복 중심)</td></tr>
                <tr><td>🌱 난포기</td><td>중·고강도 가능</td></tr>
                <tr><td>🥚 배란기</td><td>고강도 OK (컨디션 좋으면)</td></tr>
                <tr><td>🌙 황체기 초반</td><td>중강도</td></tr>
                <tr><td>🌙 황체기 후반</td><td>가볍게 (PMS 대비)</td></tr>
              </tbody>
            </table>
            <p className={s.noteSmall}>⚠️ 개인차 큼 — 본인 컨디션 우선. 통증·이상 시 즉시 중단.</p>
          </div>
        </>
      )}

      {/* ══════════ TAB 3: 가임기 참고 ══════════ */}
      {tab === 'fertility' && (
        <>
          <div className={s.dangerCard}>
            <strong>⚠️ 본 도구는 피임 방법이 아닙니다</strong>
            <p>
              캘린더·주기 기반 피임은 방법과 실천에 따라 일반적인 사용에서 실패율 편차가 크고 높은 편입니다(미국 CDC 기준 대략 2~23%대). 피임·임신 계획은 반드시 산부인과 상담을 받으세요.
              <br />📞 산부인과 전문의 상담 · 보건복지상담센터 <strong>129</strong> (보건복지부)
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>임신 준비 중이신가요?</span>
            <div className={s.pillRow} role="group" aria-label="임신 준비 여부">
              <button type="button" aria-pressed={trackingPregnancy === true} className={`${s.pill} ${trackingPregnancy === true ? s.pillActive : ''}`}
                onClick={() => setTrackingPregnancy(true)}>예</button>
              <button type="button" aria-pressed={trackingPregnancy === false} className={`${s.pill} ${trackingPregnancy === false ? s.pillActive : ''}`}
                onClick={() => setTrackingPregnancy(false)}>아니오</button>
              <button type="button" aria-pressed={trackingPregnancy === null} className={`${s.pill} ${trackingPregnancy === null ? s.pillActive : ''}`}
                onClick={() => setTrackingPregnancy(null)}>알리지 않음</button>
            </div>
            <p className={s.noteSmall}>본 응답도 본인 브라우저에만 저장.</p>
          </div>

          {trackingPregnancy === true && result && (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>👶 가임기 참고 정보</span>
                <table className={s.summaryTable}>
                  <tbody>
                    <tr>
                      <td>가임기 (참고)</td>
                      <td className={s.tdAccent}>{fmtKor(result.fertilityStart)} ~ {fmtKor(result.fertilityEnd)}</td>
                    </tr>
                    <tr>
                      <td>배란 예상일</td>
                      <td>{fmtKor(result.ovulationDate)}</td>
                    </tr>
                    <tr>
                      <td>다음 생리 예정</td>
                      <td>{fmtKor(result.nextPeriodDate)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className={s.noteSmall}>
                  ⚠️ 이 기간이 임신 가능성이 가장 높은 구간이지만, 정확한 배란일은 ±2일 변동 가능. 본 도구는 <strong>임신 가능성 % 표시 X · 임신 확정 X</strong>.
                </p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>관계일 입력 (선택 — 가임기 거리 확인)</span>
                <input type="date" className={s.input}
                  aria-label="관계일"
                  max={isoDate(today)}
                  value={intimacyDateIso}
                  onChange={(e) => setIntimacyDateIso(e.target.value)} />
                {intimacyAnalysis && (
                  <div className={s.intimacyResult}>
                    <p>
                      배란 예상일과 거리:{' '}
                      <strong>{intimacyAnalysis.ovDiff === 0 ? '당일' : intimacyAnalysis.ovDiff > 0 ? `+${intimacyAnalysis.ovDiff}일` : `${intimacyAnalysis.ovDiff}일`}</strong>
                    </p>
                    <p>
                      가임기 안에 있는지: <strong>{intimacyAnalysis.inFertility ? '✅ 가임기 안' : '❌ 가임기 밖'}</strong>
                    </p>
                    <p className={s.noteSmall}>
                      ⚠️ <strong>임신 가능성 % 표시 X</strong> — 의료 영역. 정확한 진단은 산부인과·HCG 검사.
                    </p>
                  </div>
                )}
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>🧪 임신 테스트기 시점 안내</span>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>
                  임신 테스트기는 보통 <strong style={{ color: 'var(--accent)' }}>생리 예정일 이후가 더 정확</strong>합니다.
                  너무 이른 검사는 음성이 나와도 확정 X. 양성·음성 관계없이 정확한 진단은 산부인과 상담.
                </p>
                {result && result.cyclesSinceLog >= 1 && (
                  <p className={s.intimacyHighlight}>
                    💡 마지막으로 기록한 생리일 기준 예정일이 이미 지났어요 — 아직 새 생리가 없다면 임신 테스트를 고려해볼 시점입니다.
                  </p>
                )}
              </div>
            </>
          )}

          {trackingPregnancy === false && (
            <div className={s.card}>
              <p className={s.noteSmall}>
                임신 준비 중이 아니라면 가임기 정보가 표시되지 않습니다.
                피임 방법은 산부인과 상담을 받으세요 (호르몬·기구·자연 등 방법 다양).
              </p>
            </div>
          )}
        </>
      )}

      {/* ══════════ TAB 4: 내 기록 ══════════ */}
      {tab === 'records' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>✅ 오늘 자가체크 ({fmtKor(today)})</span>

            <div className={s.field}>
              <label className={s.fieldLabel}>오늘 컨디션</label>
              <div className={s.pillRow} role="group" aria-label="오늘 컨디션 선택">
                {(['good', 'normal', 'bad'] as const).map((m) => (
                  <button key={m}
                    type="button"
                    aria-pressed={todayMood === m}
                    className={`${s.pill} ${todayMood === m ? s.pillActive : ''}`}
                    onClick={() => setTodayMood(m)}>
                    {m === 'good' ? '😊 좋음' : m === 'normal' ? '😐 보통' : '😩 안좋음'}
                  </button>
                ))}
                <button type="button" aria-pressed={todayMood === ''} className={`${s.pill} ${todayMood === '' ? s.pillActive : ''}`}
                  onClick={() => setTodayMood('')}>미응답</button>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.checkRow}>
                <input type="checkbox" checked={todayIsPeriodStart}
                  onChange={(e) => setTodayIsPeriodStart(e.target.checked)} />
                <span>🩸 오늘 생리 시작</span>
              </label>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>메모 (선택, 30자)</label>
              <input type="text" maxLength={30} className={s.input}
                aria-label="오늘 메모"
                placeholder="예: 약간 두통, 운동 X"
                value={todayNotes} onChange={(e) => setTodayNotes(e.target.value)} />
            </div>

            <button className={s.saveBtn} onClick={saveTodayCheck}>💾 오늘 기록 저장</button>
          </div>

          {/* 누적 분석 */}
          {analysis && analysis.count >= 2 && (
            <div className={`${s.card} ${analysis.isRegular ? s.analysisGood : s.analysisCaution}`}>
              <span className={s.cardLabel}>📊 누적 주기 분석 ({analysis.count}회)</span>
              <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 8px' }}>
                최근 {analysis.cycles.length}개 주기: {analysis.cycles.join('·')}일
              </p>
              <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 8px' }}>
                평균 <strong style={{ color: 'var(--accent)' }}>{analysis.avg.toFixed(1)}일</strong> · 변동폭 ±{(analysis.variance / 2).toFixed(1)}일
              </p>
              <p className={analysis.isRegular ? s.analysisOk : s.analysisWarn}>
                {analysis.isRegular
                  ? '✓ 규칙적 — 최근 기록 기준 참고 신뢰도 양호 (예측은 어디까지나 추정)'
                  : '⚠️ 불규칙 — 산부인과 상담 권장 (PCOS·갑상선 등 점검)'}
              </p>
            </div>
          )}

          {/* 기록 리스트 */}
          {records.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>📝 저장된 기록 ({records.length})</span>
              <div className={s.recordList}>
                {records.slice(0, 30).map((r) => (
                  <div key={r.id} className={s.recordItem}>
                    <span className={s.recordDate}>{r.date}</span>
                    {r.isPeriodStart && <span className={s.recordTag} style={{ background: PHASE_META.menstrual.bgColor, color: PHASE_META.menstrual.color }}>🩸 시작</span>}
                    {r.mood === 'good' && <span className={s.recordTag} style={{ color: PHASE_META.ovulation.color }}>😊 좋음</span>}
                    {r.mood === 'normal' && <span className={s.recordTag}>😐 보통</span>}
                    {r.mood === 'bad' && <span className={s.recordTag} style={{ color: PHASE_META.menstrual.color }}>😩 안좋음</span>}
                    {r.notes && <span className={s.recordNotes}>{r.notes}</span>}
                    <button className={s.recordRemove}
                      onClick={() => setRecords((p) => p.filter((x) => x.id !== r.id))}
                      aria-label="삭제">✕</button>
                  </div>
                ))}
                {records.length > 30 && (
                  <p className={s.noteSmall}>최근 30개만 표시. 전체는 CSV 다운로드.</p>
                )}
              </div>
            </div>
          )}

          {/* 데이터 관리 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔒 데이터 관리</span>
            <div className={s.dataActions}>
              <button className={s.copyBtn} onClick={downloadCSV}>📊 CSV 다운로드 (백업)</button>
              <button className={s.copyBtn} onClick={() => fileInputRef.current?.click()}>📤 CSV 가져오기 (복원)</button>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importCSV(file)
                  e.target.value = ''
                }} />
              <button className={s.dangerBtn} onClick={wipeAllData}>🗑️ 전체 삭제 (모든 입력·기록)</button>
            </div>
            <p className={s.noteSmall}>
              모든 데이터는 본인 브라우저(localStorage)에만 저장 · 서버 전송 X · 다른 기기 자동 동기화 X.
              백업·복원은 본인이 직접 관리.
            </p>
          </div>

          {!mounted && <div className={s.empty}>로딩 중…</div>}
          {mounted && records.length === 0 && (
            <div className={s.empty}>
              아직 저장된 기록이 없습니다.<br />
              위 &ldquo;오늘 자가체크&rdquo;에 입력 후 저장해보세요.
            </div>
          )}
        </>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 원형 차트 SVG
// ─────────────────────────────────────────────────────────────
function CircleChart({
  input, result,
}: {
  input: { lastPeriod: Date; periodLength: number; avgCycle: number; today?: Date }
  result: ReturnType<typeof calcCycle>
}) {
  const size = 400
  const cx = size / 2
  const cy = size / 2
  const rOuter = 125
  const rInner = 75

  const angles = phaseAngles(input)

  // ── phase 변경 지점의 날짜 (1, 생리기 끝, 배란기 시작, 배란기 끝) ──
  const periodLen = input.periodLength
  const ovulationDay = input.avgCycle - 14
  const boundaryDays = Array.from(new Set([
    1,                     // 생리기 시작 (12시)
    periodLen + 1,         // 난포기 시작
    ovulationDay - 1,      // 배란기 시작
    ovulationDay + 2,      // 황체기 시작
  ])).filter((d) => d >= 1 && d < input.avgCycle).sort((a, b) => a - b)

  // ── 오늘 마커 ──
  const todayAngle = ((result.dayInCycle - 1) / input.avgCycle) * 360
  const spokeStart = polarToCartesian(cx, cy, rInner + 2, todayAngle)
  const spokeEnd = polarToCartesian(cx, cy, rOuter + 8, todayAngle)
  // 모든 라벨을 middle anchor로 통일 → 일정한 시각 거리. dominantBaseline으로 수직 중앙
  const dayLabelPos = (angle: number) => polarToCartesian(cx, cy, rOuter + 22, angle)
  // 오늘 라벨은 도넛에서 더 띄움 (점 + 충분한 gap)
  const todayLabelPos = polarToCartesian(cx, cy, rOuter + 44, todayAngle)

  return (
    <div className={s.circleWrap}>
      <svg viewBox={`0 0 ${size} ${size}`} className={s.circleSvg} preserveAspectRatio="xMidYMid meet">
        {/* 4 phase 부채꼴 */}
        {(Object.keys(angles) as Phase[]).map((p) => {
          const { start, end } = angles[p]
          const meta = PHASE_META[p]
          const outerPath = arcPath(cx, cy, rOuter, start, end)
          return (
            <path key={p} d={outerPath} fill={meta.color} fillOpacity={0.7} stroke={meta.color} strokeWidth={1} />
          )
        })}
        {/* 도넛 가운데 hole */}
        <circle cx={cx} cy={cy} r={rInner} fill="var(--bg2)" />

        {/* phase 경계 일자 라벨 — 모두 middle anchor로 통일된 시각 거리 */}
        {boundaryDays.map((day) => {
          const angle = ((day - 1) / input.avgCycle) * 360
          const pos = dayLabelPos(angle)
          return (
            <text key={day} x={pos.x} y={pos.y}
              fontSize="14" fill="var(--text)" textAnchor="middle" dominantBaseline="middle"
              fontFamily="Noto Sans KR" fontWeight={600}>
              {day}일
            </text>
          )
        })}

        {/* 오늘 마커 — 스포크(선) + 점 + 라벨 */}
        <line x1={spokeStart.x} y1={spokeStart.y} x2={spokeEnd.x} y2={spokeEnd.y}
          stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={spokeEnd.x} cy={spokeEnd.y} r={7}
          fill="var(--accent)" stroke="#0D0D0D" strokeWidth={2} />
        <text x={todayLabelPos.x} y={todayLabelPos.y}
          fontSize="13" fill="var(--accent)" textAnchor="middle" dominantBaseline="middle"
          fontFamily="Noto Sans KR" fontWeight={800}>
          오늘 {result.dayInCycle}일
        </text>

        {/* 가운데 D-day + phase */}
        <text x={cx} y={cy - 4} fontSize="32" fill="var(--text)"
          textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight={800}>
          {result.daysToNextPeriod > 0 ? `D-${result.daysToNextPeriod}` : result.daysToNextPeriod === 0 ? 'D-DAY' : `D+${-result.daysToNextPeriod}`}
        </text>
        <text x={cx} y={cy + 24} fontSize="15" fill={PHASE_META[result.phase].color}
          textAnchor="middle" dominantBaseline="middle" fontFamily="Noto Sans KR" fontWeight={600}>
          {PHASE_META[result.phase].emoji} {PHASE_META[result.phase].label}
        </text>
      </svg>

      {/* Phase 범례 (이모지 X — 색상 점 + 이름만) */}
      <div className={s.circleLegend}>
        {(['menstrual', 'follicular', 'ovulation', 'luteal'] as Phase[]).map((p) => {
          const meta = PHASE_META[p]
          return (
            <span key={p} className={s.legendItem}>
              <span className={s.legendDot} style={{ background: meta.color }} />
              {meta.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
