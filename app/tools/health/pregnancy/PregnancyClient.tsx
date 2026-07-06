'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './pregnancy.module.css'
import {
  InputMode, CYCLE_LENGTHS, FETAL_SIZE_COMPARISON,
  PREPARATION_CHECKLIST, TRIMESTERS,
  calcPregnancy, getFetalSize, generateTestSchedule, calcMilestones,
  fmtDateKo, fmtDateInput,
  saveProfile, loadProfile, clearProfile,
} from './pregnancyUtils'

type Tab = 'main' | 'tests' | 'fetal' | 'checklist' | 'reverse'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'main',      name: '주수 계산',  icon: '' },
  { id: 'tests',     name: '산전 검사',  icon: '' },
  { id: 'fetal',     name: '태아 크기',   icon: '' },
  { id: 'checklist', name: '체크리스트', icon: '' },
  { id: 'reverse',   name: '예정일 역산', icon: '' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  main:      styles.tabActive,
  tests:     styles.tabActiveTests,
  fetal:     styles.tabActiveFetal,
  checklist: styles.tabActiveChecklist,
  reverse:   styles.tabActiveReverse,
}

const today = () => fmtDateInput(new Date())

export default function PregnancyClient() {
  const [tab, setTab] = useState<Tab>('main')

  /* 공통 입력 */
  const [inputMode, setInputMode] = useState<InputMode>('lmp')
  const [date, setDate] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [babyName, setBabyName] = useState('')
  const [isMultiple, setIsMultiple] = useState(false)

  /* 체크리스트 진행 */
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({})

  /* date input 범위 — 마운트 후 설정(하이드레이션 안전). min은 약 45주 전으로 비현실적 과거 입력 방지 */
  const [maxDate, setMaxDate] = useState('')
  const [minDate, setMinDate] = useState('')
  useEffect(() => {
    setMaxDate(today())
    const m = new Date(); m.setDate(m.getDate() - 315)
    setMinDate(fmtDateInput(m))
  }, [])

  /* localStorage 자동 불러오기 */
  const [loadedFromStorage, setLoadedFromStorage] = useState(false)
  useEffect(() => {
    const saved = loadProfile()
    if (saved) {
      setInputMode(saved.inputMode)
      setDate(saved.date)
      setCycleLength(saved.cycleLength)
      setBabyName(saved.babyName ?? '')
      setIsMultiple(!!saved.isMultiple)
      setChecklistProgress(saved.checklistProgress ?? {})
      setLoadedFromStorage(true)
    }
  }, [])

  /* 메인 계산 */
  const result = useMemo(() => {
    if (!date) return null
    return calcPregnancy({
      inputMode, date, cycleLength, isMultiple,
    })
  }, [inputMode, date, cycleLength, isMultiple])

  const fetal = result ? getFetalSize(result.currentWeek) : null
  const tests = useMemo(() => result ? generateTestSchedule(result.datingLmp) : [], [result])
  const milestones = useMemo(() => result ? calcMilestones(result.datingLmp) : [], [result])

  /* 체크리스트 */
  const currentTrimester = result?.trimester ?? 1
  const handleCheck = (id: string, checked: boolean) => {
    const next = { ...checklistProgress, [id]: checked }
    setChecklistProgress(next)
  }

  /* 자동 저장 */
  const handleSave = () => {
    saveProfile({
      inputMode, date, cycleLength, isMultiple,
      babyName: babyName || undefined,
      checklistProgress,
      savedAt: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const handleClear = () => {
    if (!confirm('저장된 임신 정보를 모두 삭제하시겠어요?')) return
    clearProfile()
    setBabyName('')
    setDate('')
    setChecklistProgress({})
    setLoadedFromStorage(false)
  }

  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  /* 진행률·삼분기 마커 */
  const markerPos = result
    ? Math.min(100, Math.max(0, (result.currentWeek / 40) * 100))
    : 0

  /* 태아 그리드 (1~40주) */
  const fetalGridWeeks = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => i + 1)
  }, [])

  /* 체크리스트 합계 */
  const allItemsCount = useMemo(() => {
    return Object.values(PREPARATION_CHECKLIST).reduce((s, arr) => s + arr.length, 0)
  }, [])
  const completedCount = useMemo(() => {
    return Object.values(checklistProgress).filter(Boolean).length
  }, [checklistProgress])

  /* 역산 탭 — 예정일 입력 */
  const [reverseDate, setReverseDate] = useState('')

  const reverseResult = useMemo(() => {
    if (!reverseDate) return null
    return calcPregnancy({
      inputMode: 'duedate',
      date: reverseDate,
      cycleLength,
    })
  }, [reverseDate, cycleLength])

  const applyReverse = () => {
    if (!reverseResult) return
    setInputMode('duedate')
    setDate(reverseDate)
    setTab('main')
  }

  /* 비현실적 주수 가드 — 43주 이상은 정상 분만 범위를 벗어남(입력·모드 오류 가능) */
  const overdue = !!result && result.currentWeek > 42
  const reverseOverdue = !!reverseResult && reverseResult.currentWeek > 42

  /* ────────────────── 렌더 ────────────────── */
  return (
    <div className={styles.wrap}>

      {/* 면책 — 사이트 표준 (기본 접힘) */}
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/date/dday', label: 'D-day 계산기' },
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량 계산기' },
        ]}
        sources={[
          { label: '대한산부인과학회', href: 'https://www.ksog.org' },
          { label: '보건복지부', href: 'https://www.mohw.go.kr' },
        ]}
      >
        정확한 임신 주수는 초음파 검사로만 확인 가능하며, 산전 검사 일정·태아 크기는 일반 가이드라인입니다.
        질 출혈·심한 복통·발열(38℃↑)·심한 두통·태동 감소(2삼분기 이후)·양수 누출 등 응급 신호 시 즉시 산부인과·응급실로,
        응급 상황은 즉시 <strong>119</strong>로 연락하세요.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="임신 계산 기능">
        {TABS.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {loadedFromStorage && (
        <div className={styles.infoBox}>
          💾 저장된 임신 정보를 불러왔습니다. 오늘 기준 주수가 자동 갱신됩니다.
        </div>
      )}

      {/* 공통 입력 */}
      <div className={styles.card}>
        <label className={styles.label}>
          입력 방식
          <span className={styles.labelHint}>기본: 마지막 생리일</span>
        </label>
        <div className={styles.optionRow} role="group" aria-label="입력 방식">
          {([
            { v: 'lmp',        label: '마지막 생리일' },
            { v: 'conception', label: '수정일 (배란일)' },
            { v: 'duedate',    label: '출산 예정일' },
          ] as { v: InputMode; label: string }[]).map(o => (
            <button key={o.v} type="button" aria-pressed={inputMode === o.v}
              className={`${styles.optionBtn} ${inputMode === o.v ? styles.optionActive : ''}`}
              onClick={() => setInputMode(o.v)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.label}>
          {inputMode === 'lmp' ? '마지막 생리 시작일' : inputMode === 'conception' ? '수정일' : '출산 예정일'}
        </label>
        <input className={styles.dateInput} type="date"
          min={inputMode === 'duedate' ? undefined : (minDate || undefined)}
          max={inputMode === 'duedate' ? undefined : (maxDate || undefined)}
          value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className={styles.card}>
        <label className={styles.label} htmlFor="pregnancy-f1">
          태명 <span className={styles.labelHint}>선택</span>
        </label>
        <input id="pregnancy-f1" className={styles.dateInput} type="text"
          placeholder="예: 콩이, 복덩이, 하늘이..."
          value={babyName} maxLength={10}
          onChange={e => setBabyName(e.target.value)} />
      </div>

      <details className={styles.advanced}>
        <summary>고급 옵션 (생리주기 보정 · 쌍태아)</summary>
        <div className={styles.label} style={{ marginTop: 4 }}>생리주기 — {cycleLength}일</div>
        <div className={styles.optionRow6} role="group" aria-label="생리주기">
          {CYCLE_LENGTHS.map(c => (
            <button key={c.value} type="button" aria-pressed={cycleLength === c.value}
              className={`${styles.optionBtn} ${cycleLength === c.value ? styles.optionActive : ''}`}
              onClick={() => setCycleLength(c.value)}
              title={c.name}>
              {c.value}일{c.value === 28 && ' ★'}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
          ⓘ 네겔레 공식은 28일 주기 가정. 24일은 4일 빠르게, 35일은 7일 늦게 보정. 불규칙 주기는 초음파 기준 주수가 더 정확합니다.
        </p>

        <label className={styles.label} style={{ marginTop: 14 }}>다태아 여부</label>
        <div className={styles.toggleRow} role="group" aria-label="다태아 여부">
          <button type="button" aria-pressed={!isMultiple} className={`${styles.toggleBtn} ${!isMultiple ? styles.toggleActive : ''}`}
            onClick={() => setIsMultiple(false)}>단태아</button>
          <button type="button" aria-pressed={isMultiple} className={`${styles.toggleBtn} ${isMultiple ? styles.toggleActive : ''}`}
            onClick={() => setIsMultiple(true)}>쌍태아 이상</button>
        </div>
        {isMultiple && (
          <div className={styles.warnBox} style={{ marginTop: 8 }}>
            ⚠️ <strong>쌍태아 임신은 검진 빈도가 더 잦고(2~3주 간격), 평균 분만 시기가 36~37주</strong>로 단태아와 다릅니다.
            <strong> 본 도구의 예정일·산전 검사·마일스톤은 단태아 40주 기준 그대로 표시되며 쌍태아용으로 조정되지 않습니다</strong> — 실제 일정은 담당 산부인과 안내를 우선하세요.
          </div>
        )}
      </details>

      {!result && (
        <div style={{
          background: 'var(--bg2)', border: '1px dashed var(--border)',
          borderRadius: 14, padding: '30px 20px', textAlign: 'center',
          color: 'var(--muted)', fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif',
        }}>
          {inputMode === 'lmp' ? '마지막 생리 시작일' : inputMode === 'conception' ? '수정일' : '출산 예정일'}을 선택하면 임신 주수가 계산됩니다
        </div>
      )}

      {/* ─────────── 탭 1: 주수 계산 ─────────── */}
      {tab === 'main' && result && (
        <>
          {overdue && (
            <div className={styles.warnBox}>
              ⚠️ <strong>임신 {result.currentWeek}주는 정상 분만 범위(보통 37~42주)를 벗어납니다.</strong> 입력한 날짜·입력 방식을 다시 확인하세요. 실제로 예정일이 지났다면 즉시 산부인과 진료가 필요합니다.
            </div>
          )}
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>
              {babyName ? `🤱 ${babyName}` : '현재 임신 주수'}
            </div>
            <div className={styles.heroNum}>{result.currentWeek}주 {result.currentDay}일</div>
            <div className={styles.heroSub}>
              {result.isPast
                ? '출산 예정일이 지났습니다 🎉'
                : babyName
                  ? `${babyName}와의 만남까지 D-${result.daysToDue} 💕`
                  : `출산 예정일까지 D-${result.daysToDue}`}
            </div>
          </div>

          {/* 삼분기 진행 게이지 */}
          <div className={styles.card}>
            <label className={styles.label}>
              임신 진행률
              <span className={styles.labelHint}>{result.progressPercent}%</span>
            </label>
            <div className={styles.triBar}>
              {TRIMESTERS.map(t => {
                const span = (t.endWeek - t.startWeek + 1)
                return (
                  <div key={t.id} className={styles.triSeg}
                    style={{ flex: span, background: t.color }}>
                    {t.name}
                  </div>
                )
              })}
              <div className={styles.triLabel} style={{ left: `${markerPos}%` }}>
                {result.currentWeek}주
              </div>
              <div className={styles.triMarker} style={{ left: `${markerPos}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, marginTop: 8 }}>
              <span>0주</span><span>13주</span><span>27주</span><span>40주</span>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className={styles.grid2}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>마지막 생리일</div>
              <div className={styles.statValue}>{fmtDateKo(result.lmp)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>추정 수정일</div>
              <div className={styles.statValue}>{fmtDateKo(result.conceptionDate)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>출산 예정일</div>
              <div className={`${styles.statValue} ${styles.accentValue}`}>{fmtDateKo(result.dueDate)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>임신 개월수 (의학)</div>
              <div className={styles.statValue}>약 {result.monthsApprox}개월 ({TRIMESTERS.find(t => t.id === result.trimester)?.name})</div>
            </div>
          </div>

          {/* 다음 마일스톤 */}
          {milestones.length > 0 && (
            <div className={styles.card}>
              <label className={styles.label}>다음 마일스톤</label>
              <div className={styles.milestoneList}>
                {milestones.map((m, i) => {
                  const isPast = m.daysUntil < 0
                  return (
                    <div key={i} className={`${styles.milestoneRow} ${isPast ? styles.milestonePast : ''}`}>
                      <span className={styles.milestoneName}>{m.name}</span>
                      <span className={styles.milestoneWeek}>{m.week}주</span>
                      <span className={styles.milestoneDday}>
                        {isPast ? `완료` : `D-${m.daysUntil}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 현재 주차 핵심 정보 (미니) */}
          {fetal && (
            <div className={styles.fetalBig} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <span style={{ fontSize: 36 }}>{fetal.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, fontFamily: 'Noto Sans KR' }}>
                    {result.currentWeek}주차 — <span style={{ color: '#DB2777' }}>{fetal.size} 크기 ({fetal.length})</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{fetal.development}</div>
                </div>
              </div>
              <button type="button" className={styles.copyBtn} style={{ marginTop: 12 }}
                onClick={() => setTab('fetal')}>자세히 보기</button>
            </div>
          )}

          {loadedFromStorage && (
            <button type="button" className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={handleClear} style={{ alignSelf: 'flex-end' }}>
              저장된 정보 삭제
            </button>
          )}
        </>
      )}

      {/* ─────────── 탭 2: 산전 검사 ─────────── */}
      {tab === 'tests' && result && (
        <>
          <div className={styles.warnBox}>
            ⚠️ <strong>본 일정은 보건복지부·대한산부인과학회의 일반 가이드라인이며 의학적 처방이 아닙니다.</strong>
            검사 시기·항목은 병원·산모 상태·고위험 임신·쌍태아 여부에 따라 달라집니다. 실제 일정은 담당 산부인과 안내를 우선하세요.
          </div>

          <div className={styles.card}>
            <label className={styles.label}>
              산전 검사 일정 ({tests.length}건)
              <span className={styles.labelHint}>현재 {result.currentWeek}주 기준</span>
            </label>
            <div className={styles.testList}>
              {tests.map(t => {
                const cls = t.status === 'past' ? styles.testRowPast :
                            t.status === 'current' ? styles.testRowCurrent : styles.testRowUpcoming
                return (
                  <div key={t.test.id} className={`${styles.testRow} ${cls}`}>
                    <div>
                      <div className={styles.testName}>
                        {t.status === 'past' ? '✅' : t.status === 'current' ? '🟡' : '📅'}
                        {' '}{t.test.name}
                        {t.test.importance === 'essential' && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: '#EA580C', fontWeight: 700 }}>핵심</span>
                        )}
                      </div>
                      <div className={styles.testDesc}>{t.test.desc}</div>
                    </div>
                    <div>
                      <div className={styles.testWindow}>
                        {fmtDateKo(t.startDate).slice(5, 10)} ~ {fmtDateKo(t.endDate).slice(5, 10)}
                      </div>
                      <div className={`${styles.testStatus} ${t.status === 'current' ? styles.testStatusCurrent : ''}`}>
                        {t.test.startWeek}~{t.test.endWeek}주 ·
                        {' '}{t.status === 'past' ? '완료' :
                              t.status === 'current' ? '진행 중' :
                              t.daysUntil > 0 ? `D-${t.daysUntil}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.infoBox}>
            💡 <strong>국민건강보험에서 일부 검사 비용을 지원</strong>합니다 (본인부담률 차이 있음). 검사 비용·필요성은 담당 산부인과·국민건강보험공단 1577-1000으로 문의하세요.
          </div>

          <div className={styles.resultActions}>
            <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(tests.map(t => `${t.test.name} (${t.test.startWeek}~${t.test.endWeek}주) — ${fmtDateKo(t.startDate)}`).join('\n'))}>
              {copied ? '✓ 복사됨' : '일정 복사'}
            </button>
            <a className={styles.copyBtn} href="/tools/date/dday" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              D-day 계산기
            </a>
            <button type="button" className={styles.copyBtn} onClick={() => setTab('checklist')}>체크리스트</button>
          </div>
        </>
      )}

      {/* ─────────── 탭 3: 태아 크기 ─────────── */}
      {tab === 'fetal' && result && fetal && (
        <>
          <div className={styles.warnBox}>
            ⚠️ <strong>본 정보는 일반적 발달 패턴이며 의학적 진단이 아닙니다.</strong>
            태아 크기·발달은 개체차가 매우 크며 정상 범위 내에서도 다양한 차이가 있습니다. 정확한 평가는 산부인과 초음파로만 가능합니다.
          </div>

          <div className={styles.fetalBig}>
            <span className={styles.fetalEmojiBig}>{fetal.emoji}</span>
            <div className={styles.fetalSizeBig}>{fetal.size} 크기</div>
            <div className={styles.fetalLength}>{fetal.length} · {result.currentWeek}주차</div>
            <div className={styles.fetalDev}>{fetal.development}</div>
          </div>

          <div className={styles.card}>
            <label className={styles.label}>임산부 가이드 (현재 주차)</label>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <div className={`${styles.guideTitle} ${styles.guideTitleGood}`}>✅ 추천 활동</div>
                <ul className={styles.guideList}>
                  <li>임산부 요가·필라테스</li>
                  <li>가벼운 산책 (30분)</li>
                  <li>충분한 수면 (8시간+)</li>
                  <li>균형 잡힌 식단</li>
                </ul>
              </div>
              <div className={styles.guideCard}>
                <div className={`${styles.guideTitle} ${styles.guideTitleBad}`}>🚫 피해야 할 것</div>
                <ul className={styles.guideList}>
                  <li>음주·흡연</li>
                  <li>카페인 과다 (200mg↑)</li>
                  <li>생식 (회·날달걀)</li>
                  <li>살균되지 않은 유제품</li>
                  <li>격렬한 운동</li>
                </ul>
              </div>
              <div className={styles.guideCard}>
                <div className={`${styles.guideTitle} ${styles.guideTitleTip}`}>🌱 영양 권장</div>
                <ul className={styles.guideList}>
                  <li>엽산 (1삼분기 핵심)</li>
                  <li>철분 (2삼분기 이후)</li>
                  <li>칼슘·비타민 D</li>
                  <li>충분한 수분</li>
                </ul>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ⓘ 구체적 영양제·식이 가이드는 산부인과·영양사 상담 필수. 개인 건강 상태에 따라 권장사항이 달라집니다.
            </p>
          </div>

          <div className={styles.card}>
            <label className={styles.label}>40주 발달 그리드 (전체 보기)</label>
            <div className={styles.fetalGrid}>
              {fetalGridWeeks.map(w => {
                const data = FETAL_SIZE_COMPARISON[w]
                if (!data) return null
                const active = w === result.currentWeek
                return (
                  <div key={w} className={`${styles.fetalCell} ${active ? styles.fetalCellActive : ''}`}
                    title={`${w}주차 — ${data.size} (${data.length}) · ${data.development}`}>
                    <div className={styles.fetalCellWeek}>{w}주</div>
                    <div className={styles.fetalCellEmoji}>{data.emoji}</div>
                    <div className={styles.fetalCellSize}>{data.length}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ─────────── 탭 4: 체크리스트 ─────────── */}
      {tab === 'checklist' && result && (
        <>
          <div className={styles.warnBox}>
            ⓘ <strong>본 체크리스트는 일반 가이드입니다.</strong> 개인 상황·고위험 임신·다태아 시 추가/변경 항목 있을 수 있으니 담당 산부인과 상담을 권장합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.label}>
              전체 진행률 — {completedCount}/{allItemsCount} ({Math.round((completedCount / allItemsCount) * 100)}%)
            </label>
            <div className={styles.progressBarBig}>
              <div className={styles.progressBarBigFill}
                style={{ width: `${(completedCount / allItemsCount) * 100}%` }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 6 }}>
              임신 진행 단계에 따라 자연스럽게 늘어납니다. 모든 항목을 동시에 완료할 필요 없으며, 현재 삼분기에 맞는 항목부터 진행하세요.
            </p>
          </div>

          {([1, 2, 3] as const).map(tri => {
            const items = PREPARATION_CHECKLIST[tri]
            const triInfo = TRIMESTERS.find(t => t.id === tri)!
            const triCompleted = items.filter(it => checklistProgress[it.id]).length
            const isCurrentTri = currentTrimester === tri
            return (
              <details key={tri}
                open={isCurrentTri}
                style={{
                  background: 'var(--bg2)',
                  border: `1px solid ${isCurrentTri ? triInfo.color : 'var(--border)'}`,
                  borderLeft: `4px solid ${triInfo.color}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  color: isCurrentTri ? triInfo.color : 'var(--text)',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{triInfo.name} ({triInfo.startWeek}~{triInfo.endWeek}주){isCurrentTri && ' · 현재'}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>
                    {triCompleted}/{items.length}
                  </span>
                </summary>
                <div className={styles.checklistBlock} style={{ marginTop: 10 }}>
                  {items.map(it => (
                    <label key={it.id}
                      className={`${styles.checkLine} ${checklistProgress[it.id] ? styles.checkLineDone : ''}`}>
                      <input type="checkbox"
                        checked={!!checklistProgress[it.id]}
                        onChange={e => handleCheck(it.id, e.target.checked)} />
                      <span>{it.name}</span>
                    </label>
                  ))}
                </div>
              </details>
            )
          })}

          <div className={styles.resultActions}>
            <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(
                ([1, 2, 3] as const).map(tri =>
                  `[${TRIMESTERS.find(t => t.id === tri)!.name}]\n` +
                  PREPARATION_CHECKLIST[tri].map(it =>
                    `${checklistProgress[it.id] ? '☑' : '☐'} ${it.name}`,
                  ).join('\n'),
                ).join('\n\n'),
              )}>
              {copied ? '✓ 복사됨' : '텍스트 복사'}
            </button>
            <button type="button" className={`${styles.copyBtn} ${saved ? styles.copied : ''}`}
              onClick={handleSave}>{saved ? '✓ 저장됨' : '저장'}</button>
            <button type="button" className={`${styles.copyBtn}`}
              onClick={() => { if (confirm('체크리스트를 초기화할까요?')) setChecklistProgress({}) }}>초기화</button>
          </div>
        </>
      )}

      {/* ─────────── 탭 5: 예정일 역산 ─────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.warnBox}>
            🎯 <strong>출산 예정일 → 마지막 생리일·수정일·현재 주수</strong> 자동 역산. 산부인과에서 받은 예정일을 입력해 일정 관리에 활용하세요.
          </div>

          <div className={styles.card}>
            <label className={styles.label} htmlFor="pregnancy-f2">출산 예정일</label>
            <input id="pregnancy-f2" className={styles.dateInput} type="date"
              value={reverseDate}
              onChange={e => setReverseDate(e.target.value)} />
          </div>

          {reverseResult && (
            <>
              {reverseOverdue && (
                <div className={styles.warnBox}>
                  ⚠️ <strong>현재 {reverseResult.currentWeek}주는 정상 범위를 벗어납니다.</strong> 입력한 출산 예정일을 다시 확인하세요.
                </div>
              )}
              <div className={styles.heroCard}>
                <div className={styles.heroLabel}>예정일 {fmtDateKo(reverseResult.dueDate)} 기준</div>
                <div className={styles.heroNum}>{reverseResult.currentWeek}주 {reverseResult.currentDay}일</div>
                <div className={styles.heroSub}>
                  {reverseResult.isPast ? '예정일이 지났습니다' : `D-${reverseResult.daysToDue}`}
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>추정 마지막 생리일</div>
                  <div className={styles.statValue}>{fmtDateKo(reverseResult.lmp)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>추정 수정일</div>
                  <div className={styles.statValue}>{fmtDateKo(reverseResult.conceptionDate)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>현재 주수</div>
                  <div className={styles.statValue}>{reverseResult.currentWeek}주 {reverseResult.currentDay}일 ({TRIMESTERS.find(t => t.id === reverseResult.trimester)?.name})</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>임신 개월수 (의학)</div>
                  <div className={styles.statValue}>약 {reverseResult.monthsApprox}개월</div>
                </div>
              </div>

              <div className={styles.resultActions}>
                <button type="button" className={styles.copyBtn} onClick={applyReverse}>
                  이 정보로 산전 검사 일정 보기
                </button>
                <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`예정일 ${fmtDateKo(reverseResult.dueDate)} → 현재 ${reverseResult.currentWeek}주 ${reverseResult.currentDay}일 · LMP ${fmtDateKo(reverseResult.lmp)}`)}>
                  {copied ? '✓ 복사됨' : '복사'}
                </button>
                <button type="button" className={styles.copyBtn} onClick={() => { applyReverse(); setTab('checklist') }}>
                  체크리스트 보기
                </button>
              </div>
            </>
          )}
        </>
      )}

    </div>
  )
}
