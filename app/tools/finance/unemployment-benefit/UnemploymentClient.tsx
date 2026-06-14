/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './unemployment.module.css'
import {
  calcUnemployment,
  avgDailyFromMonthly,
  avgDailyFromThreeMonths,
  ageGroup,
  COVERAGE_BRACKETS,
  BENEFIT_DAYS_2019,
  UI_DAILY_CAP_2026,
  UI_DAILY_FLOOR_2026,
  UI_WAGE_DAILY_CAP_2026,
  type CoverageBracket,
  type AgeGroup,
} from '@/lib/krUnemployment'

const STORAGE_KEY = 'youtil:unemployment-benefit:inputs-v1'

type WageMode = 'simple' | 'detail'

/* 가입기간 구간 → calcUnemployment(totalMonths) 전달용 대표 월수.
   coverageBracket()이 같은 구간으로 분류하는 임의 대표값이라 결과(소정급여일수)는 표 lookup과 동일. */
const BRACKET_REP_MONTHS: Record<CoverageBracket, number> = {
  lt1: 6,
  y1to3: 24,
  y3to5: 48,
  y5to10: 84,
  y10plus: 120,
}

/* 가입기간 구간 라벨 (표 헤더용 — 짧은 형태) */
const BRACKET_SHORT: Record<CoverageBracket, string> = {
  lt1: '1년 미만',
  y1to3: '1~3년',
  y3to5: '3~5년',
  y5to10: '5~10년',
  y10plus: '10년+',
}

const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  under50: '50세 미만',
  '50plus': '50세 이상·장애인',
}

/* 콤마 천단위 — 입력 중 표시용 */
function withCommas(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('ko-KR')
}
/* 콤마 문자열 → 숫자(원) + 상한 클램프 */
function toNum(raw: string, cap = 100_000_000): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n, cap)
}

/* 원 단위 콤마 표시 */
function won(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

/* 만나이 파싱 (0~120) */
function parseAge(raw: string): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(n)) return 0
  return Math.min(Math.max(n, 0), 120)
}

/* 퇴사일(YYYY-MM-DD) → 직전 3개월(퇴사 전월부터 역순 3개월)의 달력 총일수.
   UTC 해석 피해 분해 파싱. 미입력/형식오류면 0(=호출측 90일 fallback). */
function priorThreeMonthDays(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 0
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10))
  const end = new Date(y, m - 1, d)
  if (Number.isNaN(end.getTime())) return 0
  // 퇴사일 직전 3개월 = 퇴사일 전날부터 90일 구간이 아니라, '사유 발생일 이전 3개월'의 달력일수.
  // 통상 산정: 이직일 직전 3개월간의 총 일수(이직일 당일 제외, 직전 3개월 경계까지).
  // 분해 파싱한 end에서 3개월 전 같은 날을 빼서 일수 차이로 근사.
  const start = new Date(y, m - 1 - 3, d)
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  if (diff < 80 || diff > 100) return 0 // 비정상값 방어 → fallback 90
  return diff
}

const BRACKET_IDS = COVERAGE_BRACKETS.map((b) => b.id)
const AGE_GROUPS: AgeGroup[] = ['under50', '50plus']

export default function UnemploymentClient() {
  const [age, setAge] = useState('35')
  const [bracket, setBracket] = useState<CoverageBracket>('y1to3')
  const [disabled, setDisabled] = useState(false)

  const [wageMode, setWageMode] = useState<WageMode>('simple')
  const [monthly, setMonthly] = useState('3,000,000')
  const [m1, setM1] = useState('3,000,000')
  const [m2, setM2] = useState('3,000,000')
  const [m3, setM3] = useState('3,000,000')

  const [leaveDate, setLeaveDate] = useState('') // 퇴사일 (선택)
  const [involuntary, setInvoluntary] = useState(false) // 안내용 체크 (계산 비반영)

  /* localStorage 복원 — enum/형식 검증 후에만 반영 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: unknown = JSON.parse(raw)
      if (!j || typeof j !== 'object') return
      const o = j as Record<string, unknown>
      if (typeof o.age === 'string') setAge(o.age)
      if (typeof o.bracket === 'string' && BRACKET_IDS.includes(o.bracket as CoverageBracket)) {
        setBracket(o.bracket as CoverageBracket)
      }
      if (typeof o.disabled === 'boolean') setDisabled(o.disabled)
      if (o.wageMode === 'simple' || o.wageMode === 'detail') setWageMode(o.wageMode)
      if (typeof o.monthly === 'string') setMonthly(o.monthly)
      if (typeof o.m1 === 'string') setM1(o.m1)
      if (typeof o.m2 === 'string') setM2(o.m2)
      if (typeof o.m3 === 'string') setM3(o.m3)
      if (typeof o.leaveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.leaveDate)) setLeaveDate(o.leaveDate)
      if (typeof o.involuntary === 'boolean') setInvoluntary(o.involuntary)
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ age, bracket, disabled, wageMode, monthly, m1, m2, m3, leaveDate, involuntary }),
      )
    } catch {}
  }, [age, bracket, disabled, wageMode, monthly, m1, m2, m3, leaveDate, involuntary])

  const ageN = parseAge(age)
  const totalDays = useMemo(() => {
    const d = priorThreeMonthDays(leaveDate)
    return d > 0 ? d : 90
  }, [leaveDate])

  /* 평균임금일액 산정 */
  const avgDailyRaw = useMemo(() => {
    if (wageMode === 'simple') {
      return avgDailyFromMonthly(toNum(monthly), totalDays)
    }
    return avgDailyFromThreeMonths(toNum(m1), toNum(m2), toNum(m3), totalDays)
  }, [wageMode, monthly, m1, m2, m3, totalDays])

  const result = useMemo(
    () => calcUnemployment(avgDailyRaw, ageN, disabled, BRACKET_REP_MONTHS[bracket]),
    [avgDailyRaw, ageN, disabled, bracket],
  )

  const currentAgeGroup = ageGroup(ageN, disabled)
  const bracketLabel = COVERAGE_BRACKETS.find((b) => b.id === bracket)?.label ?? ''
  const hasWage = result.avgDailyWageRaw > 0

  const resetAll = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setAge('35'); setBracket('y1to3'); setDisabled(false)
    setWageMode('simple'); setMonthly('3,000,000')
    setM1('3,000,000'); setM2('3,000,000'); setM3('3,000,000')
    setLeaveDate(''); setInvoluntary(false)
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        open
        related={[
          { href: '/tools/finance/severance', label: '퇴직금 계산기' },
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
        ]}
        sources={[
          { label: '고용노동부', href: 'https://www.moel.go.kr' },
          { label: '고용보험', href: 'https://www.ei.go.kr' },
        ]}
      >
        본 계산기는 <strong>2026년 기준 추정·참고용</strong>입니다. 자발적 퇴사 여부 등 수급자격 판정과 실제 지급액은 고용센터의 최종 심사로 결정되며, 본 도구는 <strong>수급 가능 여부를 판정하지 않습니다</strong>. 정확한 금액은 고용보험(ei.go.kr) 모의계산 또는 관할 고용센터(국번없이 1350)에 확인하세요.
      </Disclaimer>

      {/* 저장 안내 + 초기화 */}
      <div className={s.card}>
        <p className={s.helpText} style={{ margin: 0 }}>
          🔒 입력한 나이·가입기간·급여 정보는 <strong>이 브라우저(localStorage)에만 저장</strong>되며 서버로 전송되지 않습니다. 공용 PC라면 사용 후 초기화하세요.
        </p>
        <button type="button" className={s.resetBtn} onClick={resetAll}>🗑️ 입력값 초기화</button>
      </div>

      {/* 나이·가입기간·장애인 */}
      <div className={s.card}>
        <span className={s.cardLabel}>이직(퇴사) 당시 조건</span>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ub-age">이직 당시 만 나이 (세)</label>
            <input
              id="ub-age"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              placeholder="35"
            />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ub-bracket">고용보험 총 가입기간</label>
            <select
              id="ub-bracket"
              className={s.select}
              value={bracket}
              onChange={(e) => setBracket(e.target.value as CoverageBracket)}
            >
              {COVERAGE_BRACKETS.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>
        <label className={s.checkRow} htmlFor="ub-disabled">
          <input
            id="ub-disabled"
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          <span className={s.checkLabel}>
            장애인입니다
            <span className={s.checkDesc}>장애인은 만 50세 미만이어도 50세 이상 소정급여일수 표가 적용됩니다.</span>
          </span>
        </label>
      </div>

      {/* 임금 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>퇴직 전 임금 (세전)</span>
        <div className={s.tabs} role="tablist" aria-label="임금 입력 방식">
          <button
            type="button"
            role="tab"
            aria-selected={wageMode === 'simple'}
            className={`${s.tab} ${wageMode === 'simple' ? s.tabActive : ''}`}
            onClick={() => setWageMode('simple')}
          >
            간편 (월급 1개)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={wageMode === 'detail'}
            className={`${s.tab} ${wageMode === 'detail' ? s.tabActive : ''}`}
            onClick={() => setWageMode('detail')}
          >
            상세 (3개월 각각)
          </button>
        </div>

        {wageMode === 'simple' ? (
          <div className={s.field} style={{ marginTop: 14 }}>
            <label className={s.fieldLabel} htmlFor="ub-monthly">월급 (세전, 원)</label>
            <input
              id="ub-monthly"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={monthly}
              onChange={(e) => setMonthly(withCommas(e.target.value))}
              placeholder="3,000,000"
            />
            <p className={s.helpText}>퇴직 전 평균 월급(세전)을 입력하세요. 평균임금일액 = 월급 × 3 ÷ {totalDays}일.</p>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <div className={s.monthGrid}>
              {([
                ['3개월 전', m1, setM1, 'ub-m1'],
                ['2개월 전', m2, setM2, 'ub-m2'],
                ['직전 1개월', m3, setM3, 'ub-m3'],
              ] as [string, string, (v: string) => void, string][]).map(([label, val, setter, id]) => (
                <div key={id} className={s.monthCard}>
                  <p className={s.monthLabel}>{label}</p>
                  <div className={s.field} style={{ margin: 0 }}>
                    <label className={s.fieldLabel} htmlFor={id}>급여 (세전, 원)</label>
                    <input
                      id={id}
                      type="text"
                      inputMode="numeric"
                      className={s.input}
                      value={val}
                      onChange={(e) => setter(withCommas(e.target.value))}
                      placeholder="3,000,000"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className={s.helpText}>퇴직 전 3개월 각 급여(세전)를 입력하세요. 평균임금일액 = 3개월 합 ÷ {totalDays}일.</p>
          </div>
        )}

        <div className={s.field} style={{ marginTop: 12 }}>
          <label className={s.fieldLabel} htmlFor="ub-leave">퇴사일 (선택)</label>
          <input
            id="ub-leave"
            type="date"
            className={s.input}
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
          />
          <p className={s.helpText}>
            입력하면 직전 3개월 달력 총일수(<strong>{totalDays}일</strong>)를 자동 산정합니다. 미입력 시 90일로 가정합니다.
          </p>
        </div>

        <label className={s.checkRow} htmlFor="ub-involuntary" style={{ marginTop: 4 }}>
          <input
            id="ub-involuntary"
            type="checkbox"
            checked={involuntary}
            onChange={(e) => setInvoluntary(e.target.checked)}
          />
          <span className={s.checkLabel}>
            비자발적 퇴사 또는 정당한 사유의 자발적 퇴사다
            <span className={s.checkDesc}>안내용 체크일 뿐 계산에 반영되지 않습니다. 수급자격은 고용센터가 판정합니다.</span>
          </span>
        </label>
        {involuntary && (
          <div className={s.noteCard} style={{ marginTop: 10 }}>
            <strong>ℹ️ 수급자격 판정은 별도</strong>
            <p>
              본 계산기는 금액만 추정합니다. 실제 수급 가능 여부는 이직 사유·피보험 단위기간(이직 전 18개월 중 180일) 등을 고용센터가 심사해 결정합니다.
            </p>
          </div>
        )}
      </div>

      {/* ════════ 결과 ════════ */}
      {hasWage ? (
        <>
          {/* 히어로 — 1일 구직급여액 */}
          <div className={s.hero} role="status" aria-label="1일 구직급여액">
            <p className={s.heroLabel}>💵 1일 구직급여액</p>
            <p className={s.heroValue}>
              {won(result.dailyBenefit)}<span className={s.heroUnit}>원/일</span>
            </p>
            <div className={s.badgeRow}>
              {result.capped === 'upper' && <span className={`${s.badge} ${s.badgeUpper}`}>상한액 적용</span>}
              {result.capped === 'lower' && <span className={`${s.badge} ${s.badgeLower}`}>하한액 적용</span>}
              {result.wageCapped && <span className={`${s.badge} ${s.badgeWage}`}>임금일액 상한({won(UI_WAGE_DAILY_CAP_2026)}원) 적용</span>}
            </div>
            <p className={s.heroSub}>
              총 예상 수급액 <strong>{won(result.totalBenefit)}원</strong> = {won(result.dailyBenefit)}원 × {result.benefitDays}일
            </p>
          </div>

          {/* 요약 4분할 */}
          <div className={s.statGrid}>
            <div className={s.statCard}>
              <p className={s.statLabel}>소정급여일수</p>
              <p className={s.statValue}>{result.benefitDays}<span className="unit">일</span></p>
              <p className={s.statSub}>{AGE_GROUP_LABEL[currentAgeGroup]} · {bracketLabel}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>총 예상 수급액</p>
              <p className={s.statValue}>{won(result.totalBenefit)}<span className="unit">원</span></p>
              <p className={s.statSub}>1일액 × 소정급여일수</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>월 환산 예상액 (참고)</p>
              <p className={s.statValue}>{won(result.monthlyBenefit)}<span className="unit">원</span></p>
              <p className={s.statSub}>1일액 × 30일</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>산정 평균임금일액</p>
              <p className={s.statValue}>{won(result.avgDailyWage)}<span className="unit">원</span></p>
              <p className={s.statSub}>
                {result.wageCapped
                  ? `임금일액 상한(${won(UI_WAGE_DAILY_CAP_2026)}원) 적용`
                  : '상한 미적용'}
              </p>
            </div>
          </div>

          {/* 1일액 산정 흐름 — 왜 하한/상한이 됐나 */}
          <div className={s.card}>
            <span className={s.cardLabel}>1일 구직급여액이 정해진 과정</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr>
                    <td>평균임금일액 (산정)</td>
                    <td className={s.cellMono}>
                      {won(result.avgDailyWageRaw)}원
                      {result.wageCapped && <> → 상한 {won(result.avgDailyWage)}원</>}
                    </td>
                  </tr>
                  <tr>
                    <td>× 60% (구직급여율)</td>
                    <td className={s.cellMono}>{won(result.rawDaily)}원</td>
                  </tr>
                  <tr>
                    <td>상·하한 적용 후</td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}>{won(result.dailyBenefit)}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={s.tipBox}>
              {result.capped === 'lower' && (
                <>
                  📉 평균임금의 60%({won(result.rawDaily)}원)가 <strong>하한액 {won(UI_DAILY_FLOOR_2026)}원</strong>보다 낮아 하한액으로 지급됩니다.
                </>
              )}
              {result.capped === 'upper' && (
                <>
                  📈 평균임금의 60%({won(result.rawDaily)}원)가 <strong>상한액 {won(UI_DAILY_CAP_2026)}원</strong>을 넘어 상한액으로 지급됩니다.
                </>
              )}
              {result.capped === 'none' && (
                <>
                  ✅ 평균임금의 60%({won(result.rawDaily)}원)가 상한 {won(UI_DAILY_CAP_2026)}원·하한 {won(UI_DAILY_FLOOR_2026)}원 사이라 그대로 지급됩니다.
                </>
              )}
              <br />
              2026년 상한({won(UI_DAILY_CAP_2026)}원)과 하한({won(UI_DAILY_FLOOR_2026)}원)의 폭이 {won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}원으로 매우 좁아, 많은 경우 상한 또는 하한에서 금액이 결정됩니다.
            </div>
          </div>

          {/* 수급기간 안내 */}
          <div className={s.warnCard}>
            <strong>⏳ 수급기간 12개월 제한</strong>
            <p>
              구직급여는 <strong>이직일 다음 날부터 12개월 이내</strong>에만 받을 수 있습니다. 이 기간을 넘기면 소정급여일수({result.benefitDays}일)가 남아 있어도 지급이 종료됩니다. 퇴사 후 지체 없이 워크넷 구직등록·수급자격을 신청하세요.
            </p>
          </div>

          {/* 소정급여일수 전체 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>소정급여일수 표 (2019.10. 이후 이직자)</span>
            <div className={s.tableScroll}>
              <table className={s.daysTable}>
                <thead>
                  <tr>
                    <th scope="col">연령 구분</th>
                    {BRACKET_IDS.map((id) => (
                      <th scope="col" key={id}>{BRACKET_SHORT[id]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AGE_GROUPS.map((ag) => (
                    <tr key={ag} className={ag === currentAgeGroup ? s.rowActive : ''}>
                      <th scope="row">{AGE_GROUP_LABEL[ag]}</th>
                      {BRACKET_IDS.map((id) => {
                        const active = ag === currentAgeGroup && id === bracket
                        return (
                          <td key={id} className={active ? s.cellActive : ''}>
                            {BENEFIT_DAYS_2019[ag][id]}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.helpText}>
              강조된 칸이 입력하신 <strong>{AGE_GROUP_LABEL[currentAgeGroup]} · {bracketLabel}</strong> 기준 소정급여일수({result.benefitDays}일)입니다. 가입기간이 길수록, 50세 이상·장애인일수록 일수가 늘어납니다.
            </p>
          </div>
        </>
      ) : (
        <div className={s.card} style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '32px 20px' }}>
          월급(또는 3개월 급여)을 입력하면 1일 구직급여액과 총 예상 수급액이 계산됩니다.
        </div>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/finance/severance" className={s.crossLink}>
        💼 퇴직금 계산기 → 퇴사 시 받는 퇴직금·퇴직소득세도 함께 확인
      </Link>
    </div>
  )
}
