/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './holidayBridge.module.css'
import {
  computeBridge, planSummaryText, loadSettings, saveSettings,
  shortKo, longKo, parseYmd,
  DEFAULT_SETTINGS,
  type BridgeSettings, type PeriodMode, type Plan, type DayInfo,
} from './holidayBridgeUtils'

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/
const DOW_HEAD = ['일', '월', '화', '수', '목', '금', '토']

export default function HolidayBridgeClient() {
  const [settings, setSettings] = useState<BridgeSettings>(DEFAULT_SETTINGS)
  const [kText, setKText] = useState(String(DEFAULT_SETTINGS.k))
  const [loaded, setLoaded] = useState(false)
  const [companyInput, setCompanyInput] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // 초기 로드
  useEffect(() => {
    const saved = loadSettings()
    setSettings(prev => ({ ...prev, ...saved }))
    if (typeof saved.k === 'number') setKText(String(saved.k))
    setLoaded(true)
  }, [])

  // 변경 시 저장
  useEffect(() => {
    if (loaded) saveSettings(settings)
  }, [settings, loaded])

  const result = useMemo(() => computeBridge(settings), [settings])

  const update = (patch: Partial<BridgeSettings>) => setSettings(prev => ({ ...prev, ...patch }))

  const onKChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 2)
    setKText(digits)
    const n = digits === '' ? 0 : Math.min(20, Math.max(0, parseInt(digits, 10) || 0))
    update({ k: n })
  }

  const addCompany = () => {
    const v = companyInput.trim()
    if (!YMD_RE.test(v)) return
    if (settings.companyHolidays.includes(v)) { setCompanyInput(''); return }
    update({ companyHolidays: [...settings.companyHolidays, v].sort() })
    setCompanyInput('')
  }
  const removeCompany = (d: string) =>
    update({ companyHolidays: settings.companyHolidays.filter(x => x !== d) })

  const copyPlan = (plan: Plan) => {
    const txt = planSummaryText(plan)
    navigator.clipboard?.writeText(txt).then(() => {
      setToast('플랜 요약을 복사했습니다')
      window.setTimeout(() => setToast(null), 1500)
    }).catch(() => {
      setToast('복사에 실패했습니다')
      window.setTimeout(() => setToast(null), 1500)
    })
  }

  // 히어로 대상: 전략에 따라 집중 1개 또는 분산 합산
  const isFocus = settings.strategy === 'focus'
  const heroPlan = result.focus

  // 분산 합산 표기용
  const spreadUsedK = result.spread.usedK
  const spreadGained = result.spread.totalGained
  const focusUsedK = heroPlan ? heroPlan.cost : 0
  const focusEff = heroPlan && heroPlan.cost > 0 ? (heroPlan.totalDays / heroPlan.cost) : 0

  // 캘린더용: 추천(집중 또는 분산) 연차일 집합
  const planLeaveSet = useMemo(() => {
    const set = new Set<string>()
    if (isFocus) {
      if (heroPlan) heroPlan.leaveDates.forEach(d => set.add(d))
    } else {
      result.spread.plans.forEach(p => p.leaveDates.forEach(d => set.add(d)))
    }
    return set
  }, [isFocus, heroPlan, result.spread.plans])

  const remaining = settings.k - (isFocus ? focusUsedK : spreadUsedK)

  return (
    <div className={s.wrap}>
      {/* 입력 카드 */}
      <div className={s.card}>
        <p className={s.cardLabel}>설정</p>
        <div className={s.grid}>
          {/* 연차 K */}
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="hb-k">
              보유 연차 <span className={s.fieldHint}>(0~20일)</span>
            </label>
            <input
              id="hb-k"
              className={s.numInput}
              type="text"
              inputMode="numeric"
              value={kText}
              onChange={e => onKChange(e.target.value)}
              placeholder="3"
              aria-label="보유 연차 일수"
            />
          </div>

          {/* 회사 지정 휴일 */}
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="hb-company">
              회사 지정 휴일 <span className={s.fieldHint}>(창립기념일 등)</span>
            </label>
            <div className={s.addRow}>
              <input
                id="hb-company"
                className={s.dateInput}
                type="date"
                min={`${settings.year}-01-01`}
                max={`${settings.year}-12-31`}
                value={companyInput}
                onChange={e => setCompanyInput(e.target.value)}
              />
              <button className={s.addBtn} onClick={addCompany} disabled={!YMD_RE.test(companyInput)}>
                추가
              </button>
            </div>
          </div>
        </div>

        {/* 회사휴일 칩 */}
        {settings.companyHolidays.length > 0 && (
          <div className={s.chipRow}>
            {settings.companyHolidays.map(d => (
              <span key={d} className={s.chip}>
                {longKo(d)}
                <button className={s.chipX} onClick={() => removeCompany(d)} aria-label={`${d} 삭제`}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* 탐색 기간 */}
        <div className={s.field} style={{ marginTop: 16 }}>
          <span className={s.fieldLabel}>탐색 기간</span>
          <div className={s.segment} role="group" aria-label="탐색 연도">
            {([2026, 2027] as const).map(y => (
              <button
                key={y}
                className={`${s.segBtn} ${settings.year === y ? s.segBtnActive : ''}`}
                onClick={() => update({ year: y })}
                aria-pressed={settings.year === y}
              >
                {y} 전체
              </button>
            ))}
          </div>
          <div className={s.segment} role="group" aria-label="분기 선택">
            {([['year', '연간'], ['q1', '1분기'], ['q2', '2분기'], ['q3', '3분기'], ['q4', '4분기']] as [PeriodMode, string][]).map(([p, label]) => (
              <button
                key={p}
                className={`${s.segBtn} ${settings.period === p ? s.segBtnActive : ''}`}
                onClick={() => update({ period: p })}
                aria-pressed={settings.period === p}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 전략 */}
        <div className={s.field} style={{ marginTop: 16 }}>
          <span className={s.fieldLabel}>연차 사용 선호</span>
          <div className={s.segment} role="group" aria-label="연차 사용 전략">
            {([['focus', '최대 한 방'], ['spread', '골고루 분산']] as ['focus' | 'spread', string][]).map(([v, label]) => (
              <button
                key={v}
                className={`${s.segBtn} ${settings.strategy === v ? s.segBtnActive : ''}`}
                onClick={() => update({ strategy: v })}
                aria-pressed={settings.strategy === v}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 토글 */}
        <div style={{ marginTop: 8 }}>
          <Toggle
            on={settings.saturdayWork}
            onClick={() => update({ saturdayWork: !settings.saturdayWork })}
            label="토요일 근무"
            hint={settings.saturdayWork ? '토요일을 평일(연차 후보)로 계산' : '토요일은 휴무로 계산'}
          />
          <Toggle
            on={settings.laborDay}
            onClick={() => update({ laborDay: !settings.laborDay })}
            label="근로자의 날(5/1) 휴무 포함"
            hint="법정공휴일 아님 · 유급휴일이라 회사별로 다름"
          />
        </div>
      </div>

      {/* 히어로 */}
      {isFocus ? (
        <div className={s.hero} role="status" aria-live="polite">
          {heroPlan ? (
            <>
              <p className={s.heroTop}>연차 {focusUsedK}개로 최대</p>
              <p className={s.heroNum}>
                {heroPlan.totalDays}<span className={s.heroUnit}>일 연속</span>
              </p>
              <div className={s.heroSub}>
                <span><strong>{longKo(heroPlan.startDate)}</strong> ~ <strong>{longKo(heroPlan.endDate)}</strong></span>
                <span>효율 <strong>{focusEff.toFixed(1)}배</strong></span>
                <span>연차 0 기준 +<strong>{heroPlan.gained}일</strong></span>
              </div>
            </>
          ) : (
            <>
              <p className={s.heroTop}>연차 0개 기준 최장 연휴</p>
              <p className={s.heroNum}>
                {result.baselineMaxRun}<span className={s.heroUnit}>일</span>
              </p>
              <p className={s.heroEmpty}>연차를 1개 이상 입력하면 추천 플랜이 나옵니다.</p>
            </>
          )}
        </div>
      ) : (
        <div className={s.hero} role="status" aria-live="polite">
          {result.spread.plans.length > 0 ? (
            <>
              <p className={s.heroTop}>연차 {spreadUsedK}개를 분산해</p>
              <p className={s.heroNum}>
                +{spreadGained}<span className={s.heroUnit}>일 추가 확보</span>
              </p>
              <div className={s.heroSub}>
                <span><strong>{result.spread.plans.length}개</strong> 구간에 분산</span>
                <span>총 사용 연차 <strong>{spreadUsedK}개</strong></span>
                <span>잔여 <strong>{Math.max(0, settings.k - spreadUsedK)}개</strong></span>
              </div>
            </>
          ) : (
            <>
              <p className={s.heroTop}>연차 0개 기준 최장 연휴</p>
              <p className={s.heroNum}>{result.baselineMaxRun}<span className={s.heroUnit}>일</span></p>
              <p className={s.heroEmpty}>연차를 1개 이상 입력하면 분산 플랜이 나옵니다.</p>
            </>
          )}
        </div>
      )}

      {/* 잔여 연차 */}
      <div className={s.remainBar}>
        <span>보유 연차 {settings.k}개 · 이 플랜 사용 {isFocus ? focusUsedK : spreadUsedK}개</span>
        <span>잔여 <strong>{Math.max(0, remaining)}개</strong></span>
      </div>

      {/* 분산 플랜 목록 */}
      {!isFocus && result.spread.plans.length > 0 && (
        <div className={s.planList}>
          <p className={s.sectionTitle}>골고루 분산 플랜</p>
          <p className={s.sectionHint}>연차 {spreadUsedK}개를 서로 겹치지 않는 {result.spread.plans.length}개 구간에 나눠 총 +{spreadGained}일을 확보합니다.</p>
          {result.spread.plans.map((p, i) => (
            <PlanCard key={`${p.startDate}-${i}`} plan={p} rank={`#${i + 1}`} onCopy={() => copyPlan(p)} active />
          ))}
        </div>
      )}

      {/* 추천 플랜 목록 (집중) */}
      {isFocus && result.top.length > 0 && (
        <div className={s.planList}>
          <p className={s.sectionTitle}>추천 플랜 (연차 {settings.k}개 이내)</p>
          <p className={s.sectionHint}>연속휴일이 긴 순서. 같은 연차로 여러 시기를 비교해 고르세요.</p>
          {result.top.map((p, i) => (
            <PlanCard
              key={`${p.startDate}-${i}`}
              plan={p}
              rank={i === 0 ? '최장' : `#${i + 1}`}
              onCopy={() => copyPlan(p)}
              active={!!heroPlan && p.startDate === heroPlan.startDate && p.endDate === heroPlan.endDate}
            />
          ))}
        </div>
      )}

      {/* 공짜 연휴 */}
      {result.free.length > 0 && (
        <div>
          <p className={s.sectionTitle}>공짜 연휴 (연차 0개, 3일 이상)</p>
          <p className={s.sectionHint}>주말과 공휴일만으로 자동으로 생기는 연휴입니다.</p>
          <div className={s.freeGrid}>
            {result.free.map(f => (
              <div key={f.startDate} className={s.freeCard}>
                <p className={s.freeDays}>{f.days}<span>일</span></p>
                <p className={s.freeName}>{f.names.length > 0 ? f.names[0] : '주말 연휴'}</p>
                <p className={s.freeRange}>{shortKo(f.startDate)} ~ {shortKo(f.endDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미니 캘린더 */}
      <MiniCalendar
        year={settings.year}
        period={settings.period}
        days={result.days}
        leaveSet={planLeaveSet}
      />

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  )
}

/* ── 토글 ── */
function Toggle({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <div className={s.toggleRow}>
      <span className={s.toggleText}>
        <span className={s.toggleLabel}>{label}</span>
        <span className={s.toggleHint}>{hint}</span>
      </span>
      <button
        type="button"
        className={`${s.switch} ${on ? s.switchOn : ''}`}
        onClick={onClick}
        role="switch"
        aria-checked={on}
        aria-label={label}
      >
        <span className={s.knob} />
      </button>
    </div>
  )
}

/* ── 플랜 카드 ── */
function PlanCard({ plan, rank, onCopy, active }: { plan: Plan; rank: string; onCopy: () => void; active?: boolean }) {
  const eff = plan.cost > 0 ? (plan.totalDays / plan.cost).toFixed(1) : '∞'
  return (
    <div className={`${s.planCard} ${active ? s.planCardActive : ''}`}>
      <div className={s.planTop}>
        <span className={s.planRange}>{longKo(plan.startDate)} ~ {longKo(plan.endDate)}</span>
        <span className={s.planRank}>{rank}</span>
      </div>
      <div className={s.leaveChips}>
        {plan.leaveDates.map(d => (
          <span key={d} className={s.leaveChip}>{shortKo(d)}</span>
        ))}
      </div>
      <div className={s.planMeta}>
        <span><span className="big">{plan.totalDays}일</span> 연속</span>
        <span>연차 <strong>{plan.cost}개</strong></span>
        <span>효율 <strong>{eff}배</strong></span>
        <span>연차 0 대비 +<strong>{plan.gained}일</strong></span>
      </div>
      <div className={s.planActions}>
        <button className={s.ghostBtn} onClick={onCopy}>요약 복사</button>
      </div>
    </div>
  )
}

/* ── 미니 캘린더 ── */
function MiniCalendar({ year, period, days, leaveSet }: {
  year: number
  period: PeriodMode
  days: DayInfo[]
  leaveSet: Set<string>
}) {
  // 월별 그룹
  const byMonth = useMemo(() => {
    const map = new Map<number, DayInfo[]>()
    for (const d of days) {
      const m = parseYmd(d.date).getMonth() + 1
      if (!map.has(m)) map.set(m, [])
      map.get(m)!.push(d)
    }
    return map
  }, [days])

  const months = Array.from(byMonth.keys()).sort((a, b) => a - b)

  return (
    <div className={s.calWrap}>
      <p className={s.sectionTitle}>{year}년 연휴 캘린더</p>
      <div className={s.calLegend}>
        <span className={s.legendItem}><span className={s.legendDot} style={{ background: 'var(--accent-strong)' }} />추천 연차일</span>
        <span className={s.legendItem}><span className={s.legendDot} style={{ background: 'var(--accent-dim)' }} />자연 연휴(주말·공휴일)</span>
        <span className={s.legendItem}><span className={s.legendDot} style={{ background: 'var(--danger)' }} />공휴일</span>
      </div>
      <div className="tableScroll">
        <div className={s.calMonths}>
          {months.map(m => {
            const cells = byMonth.get(m)!
            const first = parseYmd(cells[0].date)
            const lead = first.getDay() // 첫 날 앞 빈칸 수
            return (
              <div key={m} className={s.calMonth}>
                <p className={s.calMonthTitle}>{m}월</p>
                <div className={s.calGrid}>
                  {DOW_HEAD.map(h => <span key={h} className={s.calDow}>{h}</span>)}
                  {Array.from({ length: lead }).map((_, i) => (
                    <span key={`lead-${i}`} className={`${s.calCell} ${s.calEmpty}`}>·</span>
                  ))}
                  {cells.map(d => {
                    const day = parseYmd(d.date).getDate()
                    const isLeave = leaveSet.has(d.date)
                    let cls = s.calCell
                    if (isLeave) cls += ` ${s.calLeave}`
                    else if (d.holidayName) cls += ` ${s.calHoliday}${d.off ? ` ${s.calNatural}` : ''}`
                    else if (d.off) cls += ` ${s.calNatural} ${s.calWeekend}`
                    return (
                      <span key={d.date} className={cls} title={d.label ?? undefined}>{day}</span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {period !== 'year' && (
        <p className={s.sectionHint}>분기 보기에서는 해당 분기 달만 표시됩니다.</p>
      )}
    </div>
  )
}
