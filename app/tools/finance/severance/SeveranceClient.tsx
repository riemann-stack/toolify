/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import s from './severance.module.css'
import {
  PENSIONS,
  type PensionMode,
  parseDate, isoDate, daysBetween, addDays,
  calcThreeMonthPeriod, splitMonths,
  calcThreeMonthTotal, calcAverageWageDaily, calcOrdinaryWageDaily,
  calcSeverance, calcSeveranceTax, checkEligibility,
  fmt, fmtMan, fmtDate,
} from './severanceUtils'

type Tab = 'calc' | 'compare' | 'sim' | 'total'

const STORAGE_KEY = 'youtil_severance_v1'

/* 오늘 날짜 ISO */
function todayIso(): string {
  return isoDate(new Date())
}
function isoOffset(days: number): string {
  return isoDate(addDays(new Date(), days))
}

export default function SeveranceClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 공통 입력 */
  const [startIso, setStartIso] = useState(isoDate(addDays(new Date(), -730)))  // 2년 전
  const [endIso, setEndIso] = useState(isoOffset(30))                            // 30일 후
  const [weekHours, setWeekHours] = useState('40')
  const [dailyHours, setDailyHours] = useState('8')

  /* 월별 임금 (3구간) */
  const [m1Base, setM1Base] = useState('250')
  const [m2Base, setM2Base] = useState('250')
  const [m3Base, setM3Base] = useState('250')
  const [m1Allow, setM1Allow] = useState('20')
  const [m2Allow, setM2Allow] = useState('20')
  const [m3Allow, setM3Allow] = useState('20')

  /* 추가 */
  const [yearlyBonus, setYearlyBonus] = useState('300')
  const [unusedLeave, setUnusedLeave] = useState('100')

  /* 통상임금 (탭 2) */
  const [monthlyOrdinary, setMonthlyOrdinary] = useState('270')

  /* 탭 4: 퇴사월 입금 */
  const [pensionMode, setPensionMode] = useState<PensionMode>('normal')
  const [lastSalary, setLastSalary] = useState('250')
  const [extraLeave, setExtraLeave] = useState('100')
  const [insuranceAdj, setInsuranceAdj] = useState('0')
  const [otherDeduct, setOtherDeduct] = useState('0')

  /* 탭 3: 시뮬레이터 슬라이더 (퇴사일 ±일) */
  const [simOffset, setSimOffset] = useState(0)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.startIso) setStartIso(j.startIso)
      if (j.endIso) setEndIso(j.endIso)
      if (j.weekHours) setWeekHours(j.weekHours)
      if (j.dailyHours) setDailyHours(j.dailyHours)
      if (j.m1Base) setM1Base(j.m1Base)
      if (j.m2Base) setM2Base(j.m2Base)
      if (j.m3Base) setM3Base(j.m3Base)
      if (j.m1Allow) setM1Allow(j.m1Allow)
      if (j.m2Allow) setM2Allow(j.m2Allow)
      if (j.m3Allow) setM3Allow(j.m3Allow)
      if (j.yearlyBonus) setYearlyBonus(j.yearlyBonus)
      if (j.unusedLeave) setUnusedLeave(j.unusedLeave)
      if (j.monthlyOrdinary) setMonthlyOrdinary(j.monthlyOrdinary)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startIso, endIso, weekHours, dailyHours,
        m1Base, m2Base, m3Base, m1Allow, m2Allow, m3Allow,
        yearlyBonus, unusedLeave, monthlyOrdinary,
      }))
    } catch {}
  }, [startIso, endIso, weekHours, dailyHours, m1Base, m2Base, m3Base, m1Allow, m2Allow, m3Allow, yearlyBonus, unusedLeave, monthlyOrdinary])

  /* 계산 */
  const startDate = parseDate(startIso)
  const endDate = parseDate(endIso)
  const weekHrs = parseFloat(weekHours) || 0
  const dailyHrs = parseFloat(dailyHours) || 8

  const eligibility = useMemo(() => checkEligibility(startDate, endDate, weekHrs), [startDate, endDate, weekHrs])
  const period = useMemo(() => calcThreeMonthPeriod(endDate), [endDate])
  const monthSplits = useMemo(() => splitMonths(period.start, period.end), [period.start, period.end])

  const wageInputs = useMemo(() => ({
    monthlyBase: [parseFloat(m1Base) || 0, parseFloat(m2Base) || 0, parseFloat(m3Base) || 0],
    monthlyAllowance: [parseFloat(m1Allow) || 0, parseFloat(m2Allow) || 0, parseFloat(m3Allow) || 0],
    yearlyBonusMan: parseFloat(yearlyBonus) || 0,
    unusedLeaveMan: parseFloat(unusedLeave) || 0,
  }), [m1Base, m2Base, m3Base, m1Allow, m2Allow, m3Allow, yearlyBonus, unusedLeave])

  const totals = useMemo(() => calcThreeMonthTotal(wageInputs), [wageInputs])
  const dailyAvgWage = calcAverageWageDaily(totals.total, period.days)
  const dailyOrdWage = calcOrdinaryWageDaily(parseFloat(monthlyOrdinary) || 0, dailyHrs)
  const dailyAppliedWage = Math.max(dailyAvgWage, dailyOrdWage)
  const appliedReason = dailyAvgWage >= dailyOrdWage ? '평균임금 적용' : '통상임금 적용 (평균 < 통상)'

  const severanceMan = useMemo(() => calcSeverance(dailyAppliedWage, eligibility.daysWorked), [dailyAppliedWage, eligibility.daysWorked])
  const tax = useMemo(() => calcSeveranceTax(severanceMan, eligibility.daysWorked), [severanceMan, eligibility.daysWorked])

  /* 시뮬레이터: 퇴사일 ±90일 */
  const simData = useMemo(() => {
    const points: { offset: number; days: number; severance: number }[] = []
    for (let off = -30; off <= 90; off += 1) {
      const newEnd = addDays(endDate, off)
      const days = daysBetween(startDate, newEnd)
      if (days < 365 || days > 365 * 50) {
        points.push({ offset: off, days, severance: 0 })
        continue
      }
      const sev = calcSeverance(dailyAppliedWage, days)
      points.push({ offset: off, days, severance: sev })
    }
    return points
  }, [startDate, endDate, dailyAppliedWage])

  /* 마일스톤 (1년/2년/3년/5년/10년) 도달 일자 */
  const milestones = useMemo(() => {
    return [365, 730, 1095, 1825, 3650].map((d) => {
      const target = addDays(startDate, d - 1)
      const offset = Math.floor((target.getTime() - endDate.getTime()) / 86400000)
      return { years: Math.floor(d / 365), days: d, target, offset }
    }).filter((m) => Math.abs(m.offset) <= 90)
  }, [startDate, endDate])

  /* 탭 4: 퇴사월 총 입금 */
  const lastSalaryN = parseFloat(lastSalary) || 0
  const extraLeaveN = parseFloat(extraLeave) || 0
  const insN = parseFloat(insuranceAdj) || 0
  const othN = parseFloat(otherDeduct) || 0
  const totalDeposit = tax.netSeverance + lastSalaryN + extraLeaveN - insN - othN

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'calc',    label: '💼 퇴직금' },
          { id: 'compare', label: '⚖️ 평균 vs 통상' },
          { id: 'sim',     label: '📅 퇴사일 시뮬' },
          { id: 'total',   label: '💰 퇴사월 총입금' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 공통: 입사일·퇴사일·근로시간 */}
      <div className={s.card}>
        <span className={s.cardLabel}>근무 기간 · 소정 근로시간</span>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel}>입사일</label>
            <input type="date" className={s.input} value={startIso} onChange={(e) => setStartIso(e.target.value)} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>퇴사일</label>
            <input type="date" className={s.input} value={endIso} onChange={(e) => setEndIso(e.target.value)} />
          </div>
        </div>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel}>주 소정 근로시간 (시간)</label>
            <input type="number" className={s.input} value={weekHours} onChange={(e) => setWeekHours(e.target.value)} min={1} max={70} step={1} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>1일 소정 근로시간 (시간)</label>
            <input type="number" className={s.input} value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} min={1} max={12} step={0.5} />
          </div>
        </div>
        <div className={s.helpText}>
          📅 재직일수: <strong className={s.cellAccent}>{eligibility.daysWorked.toLocaleString()}일</strong>
          {' · '}<strong>{eligibility.yearsRaw.toFixed(2)}년</strong>
        </div>
      </div>

      {/* 적격성 경고 */}
      {!eligibility.eligible && (
        <div className={s.warnCardStrong}>
          <strong>🚨 법정 퇴직금 발생 X</strong>
          <p>
            {eligibility.reasons.map((r, i) => <span key={i}>{r}<br /></span>)}
            계속근로기간 1년 이상 + 주 15시간 이상이어야 법정 퇴직금 발생 (근로자퇴직급여 보장법 §4).
          </p>
        </div>
      )}
      {eligibility.warnings.length > 0 && (
        <div className={s.warnCard}>
          <strong>⚠️ 주의</strong>
          <p>{eligibility.warnings.join(' · ')}</p>
        </div>
      )}

      {/* ════════ 탭 1: 퇴직금 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 산정기간 자동 표시 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📅 평균임금 산정기간 (퇴사 전 3개월)</span>
            <div className={s.periodBox}>
              <p>
                기간: <strong>{fmtDate(period.start)}</strong> ~ <strong>{fmtDate(period.end)}</strong>
              </p>
              <p>
                총일수: <strong className={s.cellAccent}>{period.days}일</strong>
              </p>
            </div>
            <p className={s.helpText}>
              퇴직금 계산은 퇴사 전 3개월의 임금 총액을 총일수로 나눈 1일 평균임금이 기준입니다.
              월마다 89~92일로 다르니 자동 계산이 안전.
            </p>
          </div>

          {/* 월별 임금 입력 */}
          <div className={s.card}>
            <span className={s.cardLabel}>월별 임금 (3개월)</span>
            <div className={s.monthGrid}>
              {monthSplits.slice(0, 3).map((m, i) => {
                const baseGetter = [m1Base, m2Base, m3Base][i]
                const baseSetter = [setM1Base, setM2Base, setM3Base][i]
                const allowGetter = [m1Allow, m2Allow, m3Allow][i]
                const allowSetter = [setM1Allow, setM2Allow, setM3Allow][i]
                return (
                  <div key={i} className={s.monthCard}>
                    <p className={s.monthLabel}>{i + 1}구간 — {m.label} ({m.days}일)</p>
                    <div className={s.field}>
                      <label className={s.fieldLabel}>기본급 (만원)</label>
                      <input type="number" className={s.input} value={baseGetter} onChange={(e) => baseSetter(e.target.value)} min={0} max={5000} step={1} />
                    </div>
                    <div className={s.field}>
                      <label className={s.fieldLabel}>고정수당 (식대·교통 등, 만원)</label>
                      <input type="number" className={s.input} value={allowGetter} onChange={(e) => allowSetter(e.target.value)} min={0} max={500} step={1} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>상여금 · 연차수당</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>최근 1년 상여금 총액 (만원)</label>
                <input type="number" className={s.input} value={yearlyBonus} onChange={(e) => setYearlyBonus(e.target.value)} min={0} max={20000} step={10} />
                <p className={s.helpText}>상여금 × 3/12 만큼 평균임금에 반영</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>미사용 연차수당 (만원)</label>
                <input type="number" className={s.input} value={unusedLeave} onChange={(e) => setUnusedLeave(e.target.value)} min={0} max={5000} step={10} />
                <p className={s.helpText}>연차수당 × 3/12 만큼 평균임금에 반영</p>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>💼 예상 퇴직금</p>
            <p className={s.heroValue}>
              세전 <strong>{fmtMan(severanceMan)}</strong>
            </p>
            <p className={s.heroSub}>
              실수령 <strong style={{ color: 'var(--accent)' }}>{fmtMan(tax.netSeverance)}</strong>
              {' · '}세금 <strong>{fmtMan(tax.totalTax)}</strong> ({tax.taxRatePct.toFixed(1)}%)
            </p>
          </div>

          {/* SVG 막대 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>세전 / 세금 / 실수령 비교</span>
            <SeveranceBarChart pre={severanceMan} tax={tax.totalTax} net={tax.netSeverance} />
          </div>

          {/* 적용 임금 */}
          <div className={s.card}>
            <span className={s.cardLabel}>적용 임금 분석</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>1일 평균임금</td><td className={s.cellMono}>{fmt(dailyAvgWage * 10000, 0)}원</td></tr>
                  <tr><td>1일 통상임금</td><td className={s.cellMono}>{fmt(dailyOrdWage * 10000, 0)}원</td></tr>
                  <tr><td>적용</td><td className={`${s.cellMono} ${s.cellAccent}`}>{appliedReason} ({fmt(dailyAppliedWage * 10000, 0)}원)</td></tr>
                  <tr><td>3개월 임금 총액</td><td className={s.cellMono}>{fmtMan(totals.total)}</td></tr>
                  <tr><td>┗ 기본급+수당</td><td className={s.cellMono}>{fmtMan(totals.baseTotal + totals.allowanceTotal)}</td></tr>
                  <tr><td>┗ 상여금 (×3/12)</td><td className={s.cellMono}>{fmtMan(totals.bonusPortion)}</td></tr>
                  <tr><td>┗ 연차수당 (×3/12)</td><td className={s.cellMono}>{fmtMan(totals.leavePortion)}</td></tr>
                  <tr><td>3개월 총일수</td><td className={s.cellMono}>{period.days}일</td></tr>
                </tbody>
              </table>
            </div>
            <div className={s.tipBox}>
              💡 평균임금({fmt(dailyAvgWage * 10000, 0)}원) {dailyAvgWage >= dailyOrdWage ? '≥' : '<'} 통상임금({fmt(dailyOrdWage * 10000, 0)}원)
              → <strong>{appliedReason}</strong> (근로기준법 §2)
            </div>
          </div>

          {/* 퇴직소득세 상세 */}
          <div className={s.card}>
            <span className={s.cardLabel}>퇴직소득세 계산 상세 (2023 개정)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>세법상 근속연수</td><td className={s.cellMono}>{tax.yearsTax}년 (1년 미만 절상)</td></tr>
                  <tr><td>근속연수공제</td><td className={s.cellMono}>{fmtMan(tax.yearsDeduction)}</td></tr>
                  <tr><td>환산급여</td><td className={s.cellMono}>{fmtMan(tax.envWage)}</td></tr>
                  <tr><td>환산급여공제</td><td className={s.cellMono}>{fmtMan(tax.envDeduction)}</td></tr>
                  <tr><td>과세표준</td><td className={s.cellMono}>{fmtMan(tax.taxBase)}</td></tr>
                  <tr><td>산출세액</td><td className={s.cellMono}>{fmtMan(tax.rawTax)}</td></tr>
                  <tr><td>퇴직소득세</td><td className={s.cellMono}>{fmtMan(tax.incomeTax)}</td></tr>
                  <tr><td>지방소득세 (10%)</td><td className={s.cellMono}>{fmtMan(tax.localTax)}</td></tr>
                  <tr><td>총 세금</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(tax.totalTax)}</td></tr>
                  <tr><td>실수령액</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(tax.netSeverance)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.helpText}>
              ※ 환산급여 = (퇴직금 − 근속연수공제) × 12 / 근속연수<br />
              ※ 퇴직소득세 = 산출세액 × 근속연수 / 12<br />
              ※ 본 계산은 일반 사례 기준이며, 외국인·중간정산 이력 등은 별도 적용
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 평균 vs 통상 비교 ════════ */}
      {tab === 'compare' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>월 통상임금 입력</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>월 통상임금 (기본급 + 고정수당, 만원)</label>
              <input type="number" className={s.input} value={monthlyOrdinary} onChange={(e) => setMonthlyOrdinary(e.target.value)} min={0} max={5000} step={1} />
              <p className={s.helpText}>
                통상임금 = 변동성 없는 정기·일률·고정 지급분 (기본급 + 직책수당·식대 등 고정수당)
              </p>
            </div>
          </div>

          <div className={s.compareGrid}>
            {/* 평균임금 카드 */}
            <div className={`${s.compareCard} ${dailyAvgWage >= dailyOrdWage ? s.compareWin : ''}`}>
              <p className={s.compareTitle}>📊 평균임금</p>
              <p className={s.compareValue}>{fmt(dailyAvgWage * 10000, 0)} 원/일</p>
              <p className={s.compareDesc}>
                3개월 임금 총액({fmtMan(totals.total)}) ÷ 총일수({period.days}일)
              </p>
              <ul className={s.compareList}>
                <li>기본급 + 고정수당</li>
                <li>+ 상여금 ×3/12</li>
                <li>+ 연차수당 ×3/12</li>
              </ul>
            </div>

            {/* 통상임금 카드 */}
            <div className={`${s.compareCard} ${dailyOrdWage > dailyAvgWage ? s.compareWin : ''}`}>
              <p className={s.compareTitle}>⏱️ 통상임금</p>
              <p className={s.compareValue}>{fmt(dailyOrdWage * 10000, 0)} 원/일</p>
              <p className={s.compareDesc}>
                월 통상임금({monthlyOrdinary}만원) ÷ 209시간 × {dailyHrs}시간
              </p>
              <ul className={s.compareList}>
                <li>기본급 + 고정수당만</li>
                <li>상여금 X (변동성 있음)</li>
                <li>연차수당 X</li>
              </ul>
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>적용 결과</p>
            <p className={s.heroValue}>
              <strong style={{ color: 'var(--accent)' }}>{appliedReason}</strong>
            </p>
            <p className={s.heroSub}>
              {dailyAvgWage >= dailyOrdWage
                ? '평균임금이 통상임금 이상이라 평균임금이 적용됩니다.'
                : '계산된 평균임금이 통상임금보다 낮아, 통상임금을 평균임금으로 봅니다 (근로기준법 §2).'}
            </p>
          </div>

          <div className={s.warnCard}>
            <strong>📌 평균임금 vs 통상임금</strong>
            <p>
              근로기준법 §2 ②: <strong>평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 함.</strong><br />
              → 근로자에게 유리한 큰 금액 적용 원칙.<br />
              <br />
              일반적으로 상여금·수당이 많은 직장은 평균임금이 더 크지만,
              기본급 위주이고 상여금이 적은 경우 통상임금이 더 클 수 있어요.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 퇴사일 시뮬레이터 ════════ */}
      {tab === 'sim' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>퇴사일 ±90일 슬라이더</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>현재 퇴사일 ({fmtDate(endDate)}) 기준 ±일</label>
              <input
                type="range"
                min={-30}
                max={90}
                step={1}
                value={simOffset}
                onChange={(e) => setSimOffset(parseInt(e.target.value))}
                className={s.slider}
              />
              <div className={s.helpText}>
                슬라이더 위치: <strong className={s.cellAccent}>{simOffset > 0 ? `+${simOffset}` : simOffset}일</strong>
                {' '}(퇴사일 → {fmtDate(addDays(endDate, simOffset))})
              </div>
            </div>
          </div>

          <SimChart points={simData} highlight={simOffset} />

          {/* 마일스톤 */}
          {milestones.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>근속 마일스톤</span>
              <div className={s.milestoneGrid}>
                {milestones.map((m) => (
                  <div key={m.years} className={s.milestoneCard}>
                    <p className={s.milestoneYear}>{m.years}년</p>
                    <p className={s.milestoneDate}>{fmtDate(m.target)}</p>
                    <p className={s.milestoneOffset} style={{ color: m.offset > 0 ? '#FF8C3E' : 'var(--accent)' }}>
                      {m.offset > 0 ? `${m.offset}일 더 근무 필요` : m.offset === 0 ? '✅ 도달' : `이미 ${-m.offset}일 초과`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 비교표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>퇴사일별 비교 (±5/15/30일)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>퇴사일</th>
                    <th>재직일수</th>
                    <th>예상 퇴직금</th>
                    <th>차이</th>
                  </tr>
                </thead>
                <tbody>
                  {[-30, -15, -5, 0, 5, 15, 30, 60, 90].map((off) => {
                    const target = simData.find((p) => p.offset === off)
                    const base = simData.find((p) => p.offset === 0)
                    if (!target || !base) return null
                    const diff = target.severance - base.severance
                    return (
                      <tr key={off} className={off === 0 ? s.rowActive : ''}>
                        <td>{fmtDate(addDays(endDate, off))}</td>
                        <td className={s.cellMono}>{target.days}일</td>
                        <td className={`${s.cellMono} ${off === 0 ? s.cellAccent : ''}`}>{target.severance > 0 ? fmtMan(target.severance) : '—'}</td>
                        <td className={s.cellMono} style={{ color: diff > 0 ? 'var(--accent)' : diff < 0 ? '#FF3E8C' : 'var(--muted)' }}>
                          {off === 0 ? '기준' : (diff > 0 ? '+' : '') + fmtMan(diff)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>📅 퇴사일 결정 팁</strong>
            <p>
              • <strong>1년 미만</strong>이면 법정 퇴직금 0 — 가능하면 1년 채우기<br />
              • 매년 마일스톤(1·2·3·5·10년) 도달 직후 퇴사가 가장 유리<br />
              • <strong>월말 퇴사</strong>가 일반적이지만, 며칠 차이로 마일스톤 변화 큼<br />
              • 단, 회사 내부 규정·연차사용·인수인계 등도 고려해야 함
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 퇴사월 총 입금액 ════════ */}
      {tab === 'total' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>퇴직 제도 모드</span>
            <div className={s.pillRow}>
              {PENSIONS.map((p) => (
                <button
                  key={p.id}
                  className={`${s.pill} ${pensionMode === p.id ? s.pillActive : ''}`}
                  onClick={() => setPensionMode(p.id)}
                  type="button"
                  title={p.desc}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
            <div className={s.tipBox}>
              💡 {PENSIONS.find((p) => p.id === pensionMode)!.desc}
            </div>
          </div>

          {pensionMode === 'dc' && (
            <div className={s.warnCardStrong}>
              <strong>⚠️ DC형은 별도 계산 필요</strong>
              <p>
                DC형 퇴직연금은 <strong>회사가 매년 임금총액의 1/12 이상을 적립</strong>하고
                근로자 운용에 따라 결과가 달라집니다.<br />
                법정 퇴직금 계산과 다를 수 있으니 <strong>회사·금융사 IRP 계좌</strong>에서 정확히 확인하세요.<br />
                본 도구의 표시값은 일반 퇴직금 기준이며 DC형 추정과 다릅니다.
              </p>
            </div>
          )}

          <div className={s.card}>
            <span className={s.cardLabel}>마지막 월급·수당·공제</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>마지막 월급 (실수령, 만원)</label>
                <input type="number" className={s.input} value={lastSalary} onChange={(e) => setLastSalary(e.target.value)} min={0} max={5000} step={10} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>미사용 연차수당 (만원)</label>
                <input type="number" className={s.input} value={extraLeave} onChange={(e) => setExtraLeave(e.target.value)} min={0} max={5000} step={10} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>4대보험 정산 (만원, 환급은 음수)</label>
                <input type="number" className={s.input} value={insuranceAdj} onChange={(e) => setInsuranceAdj(e.target.value)} min={-200} max={500} step={1} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>기타 공제 (만원)</label>
                <input type="number" className={s.input} value={otherDeduct} onChange={(e) => setOtherDeduct(e.target.value)} min={0} max={500} step={1} />
              </div>
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>💰 퇴사월 총 입금 예상액</p>
            <p className={s.heroValue}>
              <strong>{fmtMan(totalDeposit)}</strong>
            </p>
            <p className={s.heroSub}>
              퇴직금 + 마지막 월급 + 연차수당 - 4대보험 - 기타 공제
            </p>
          </div>

          {/* 도넛 차트 + 항목 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>입금·공제 구성</span>
            <DonutChart
              data={[
                { id: 'sev',    label: '퇴직금 실수령', value: tax.netSeverance, color: '#3EFFD0' },
                { id: 'sal',    label: '마지막 월급',   value: lastSalaryN, color: '#3EC8FF' },
                { id: 'leave',  label: '연차수당',     value: extraLeaveN, color: '#FFB83E' },
              ].filter((d) => d.value > 0)}
              total={tax.netSeverance + lastSalaryN + extraLeaveN}
            />
            <div className={s.tableScroll} style={{ marginTop: 12 }}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>퇴직금 (세전)</td><td className={s.cellMono}>{fmtMan(severanceMan)}</td></tr>
                  <tr><td>퇴직소득세 + 지방소득세</td><td className={s.cellMono} style={{ color: '#FF3E8C' }}>−{fmtMan(tax.totalTax)}</td></tr>
                  <tr><td>퇴직금 실수령</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(tax.netSeverance)}</td></tr>
                  <tr><td>마지막 월급</td><td className={s.cellMono}>{fmtMan(lastSalaryN)}</td></tr>
                  <tr><td>미사용 연차수당</td><td className={s.cellMono}>{fmtMan(extraLeaveN)}</td></tr>
                  {insN !== 0 && <tr><td>4대보험 정산</td><td className={s.cellMono} style={{ color: insN > 0 ? '#FF3E8C' : 'var(--accent)' }}>{insN > 0 ? '−' : '+'}{fmtMan(Math.abs(insN))}</td></tr>}
                  {othN > 0 && <tr><td>기타 공제</td><td className={s.cellMono} style={{ color: '#FF3E8C' }}>−{fmtMan(othN)}</td></tr>}
                  <tr className={s.cellTotal}>
                    <td><strong>총 입금 예상</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtMan(totalDeposit)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💡 퇴사 전 체크리스트</strong>
            <p>
              ✅ <strong>미사용 연차</strong>를 모두 사용·정산 받기<br />
              ✅ 마지막 월급 정확 계산 (일할 계산 X / O 회사 규정 확인)<br />
              ✅ 퇴직금 14일 내 지급 의무 (지연 시 지연이자 발생)<br />
              ✅ 4대보험 상실 신고 → 다음 직장 또는 지역가입 전환<br />
              ✅ 퇴직소득세 원천징수 영수증 보관 (연말정산 시)<br />
              ✅ 5,500만원 초과 시 IRP 계좌 의무 이전 사전 개설
            </p>
          </div>
        </>
      )}

      {/* 안내 */}
      <div className={s.disclaimer}>
        <strong>📌 사용 안내</strong>
        <ul>
          <li>이 계산기는 <strong>입력값 기준 모의계산</strong>이며, 실제 퇴직금은 임금 항목·해석·회사 정산에 따라 달라질 수 있습니다.</li>
          <li>평균임금·통상임금 판단은 노무사 영역입니다.</li>
          <li>퇴직소득세는 <strong>2023년 개정 세법</strong> 기준이며, 매년 변동될 수 있습니다.</li>
          <li>DC형 퇴직연금은 회사 적립·운용 결과에 따라 다르므로 회사·금융사에서 정확히 확인하세요.</li>
          <li>분쟁·정확한 산정은 <strong>고용노동부 (1350) 또는 공인노무사</strong> 상담을 권장합니다.</li>
          <li>모든 데이터는 브라우저에 저장, 서버 전송 X.</li>
        </ul>
      </div>

      {/* 크로스링크 */}
      <Link href="/tools/finance/savings" className={s.crossLink}>
        💰 월 저축가능 금액 계산기 → 퇴직금으로 자산 형성·재무 진단
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   세전·세금·실수령 막대 차트
   ───────────────────────────────────────────── */
function SeveranceBarChart({ pre, tax, net }: { pre: number; tax: number; net: number }) {
  const maxVal = Math.max(pre, 1)
  const items = [
    { label: '세전 퇴직금', value: pre, color: '#3EC8FF' },
    { label: '세금 (퇴직+지방)', value: tax, color: '#FF3E8C' },
    { label: '실수령액', value: net, color: '#3EFFD0' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it) => {
        const w = (it.value / maxVal) * 100
        return (
          <div key={it.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{it.label}</span>
            <div style={{ height: 28, background: 'var(--bg3)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${Math.max(w, 4)}%`,
                background: it.color,
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '0 8px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0D0D0D', fontFamily: 'Syne, sans-serif' }}>{fmtMan(it.value)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   퇴사일 시뮬레이션 라인 차트
   ───────────────────────────────────────────── */
function SimChart({ points, highlight }: { points: { offset: number; days: number; severance: number }[]; highlight: number }) {
  const W = 700
  const H = 200
  const padL = 50
  const padR = 12
  const padT = 16
  const padB = 30

  const offsets = points.map((p) => p.offset)
  const minOff = Math.min(...offsets)
  const maxOff = Math.max(...offsets)
  const sevs = points.map((p) => p.severance).filter((v) => v > 0)
  const minSev = sevs.length > 0 ? Math.min(...sevs) : 0
  const maxSev = sevs.length > 0 ? Math.max(...sevs) : 1

  const xScale = (off: number) => padL + ((off - minOff) / (maxOff - minOff || 1)) * (W - padL - padR)
  const yScale = (v: number) => H - padB - ((v - minSev) / (maxSev - minSev || 1)) * (H - padT - padB)

  const pathD = points.filter((p) => p.severance > 0).map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.offset)} ${yScale(p.severance)}`).join(' ')

  const highlightP = points.find((p) => p.offset === highlight)

  return (
    <div className="card" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
        퇴사일 변화 → 퇴직금 변화
      </span>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 600, width: '100%' }}>
          {/* 축 */}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--border)" strokeWidth="1" />

          {/* X축 라벨 */}
          {[-30, -15, 0, 15, 30, 60, 90].map((off) => {
            if (off < minOff || off > maxOff) return null
            return (
              <g key={off}>
                <line x1={xScale(off)} y1={H - padB - 2} x2={xScale(off)} y2={H - padB + 4} stroke="var(--muted)" strokeWidth="0.8" />
                <text x={xScale(off)} y={H - 10} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Syne">
                  {off > 0 ? `+${off}` : off}일
                </text>
              </g>
            )
          })}

          {/* 0 라인 */}
          {minOff <= 0 && maxOff >= 0 && (
            <line x1={xScale(0)} y1={padT} x2={xScale(0)} y2={H - padB} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3,2" />
          )}

          {/* 라인 */}
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" />

          {/* 강조 점 */}
          {highlightP && highlightP.severance > 0 && (
            <g>
              <circle cx={xScale(highlightP.offset)} cy={yScale(highlightP.severance)} r={6} fill="#FF3E8C" stroke="#000" strokeWidth="1" />
              <text x={xScale(highlightP.offset)} y={yScale(highlightP.severance) - 12} fill="#FF3E8C" fontSize="11" textAnchor="middle" fontFamily="Syne" fontWeight="700">
                {fmtMan(highlightP.severance)}
              </text>
            </g>
          )}

          {/* Y축 값 (3개) */}
          {sevs.length > 0 && [minSev, (minSev + maxSev) / 2, maxSev].map((v, i) => (
            <text key={i} x={padL - 6} y={yScale(v) + 3} fill="var(--muted)" fontSize="9" textAnchor="end" fontFamily="Syne">{fmtMan(v)}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   도넛 차트
   ───────────────────────────────────────────── */
interface DonutDatum { id: string; label: string; value: number; color: string }
function DonutChart({ data, total }: { data: DonutDatum[]; total: number }) {
  if (data.length === 0 || total <= 0) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>입력값 없음</p>

  const cx = 100, cy = 100, rOuter = 80, rInner = 50

  function describeArc(startAngle: number, endAngle: number) {
    const x1 = cx + rOuter * Math.cos(startAngle)
    const y1 = cy + rOuter * Math.sin(startAngle)
    const x2 = cx + rOuter * Math.cos(endAngle)
    const y2 = cy + rOuter * Math.sin(endAngle)
    const x3 = cx + rInner * Math.cos(endAngle)
    const y3 = cy + rInner * Math.sin(endAngle)
    const x4 = cx + rInner * Math.cos(startAngle)
    const y4 = cy + rInner * Math.sin(startAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`
  }

  const slices = data.reduce<{ d: DonutDatum; cum: number }[]>((acc, d) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : null
    const cum = last ? last.cum + last.d.value : 0
    acc.push({ d, cum })
    return acc
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, alignItems: 'center' }}>
      <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220 }}>
        {slices.map(({ d, cum }) => {
          const startAngle = (cum / total) * Math.PI * 2 - Math.PI / 2
          const endAngle = ((cum + d.value) / total) * Math.PI * 2 - Math.PI / 2
          return <path key={d.id} d={describeArc(startAngle, endAngle)} fill={d.color} opacity={0.85} />
        })}
        <circle cx={cx} cy={cy} r={rInner - 2} fill="var(--bg2)" />
        <text x={cx} y={cy - 4} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Syne">총 입금</text>
        <text x={cx} y={cy + 14} fill="var(--accent)" fontSize="13" textAnchor="middle" fontFamily="Syne" fontWeight="800">
          {fmtMan(total)}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.label}</span>
            <span style={{ fontFamily: 'Syne, sans-serif', color: 'var(--muted)', fontWeight: 700 }}>{fmtMan(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* todayIso 사용 안 하지만 선언상 keep */
void todayIso
