'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  calcPension,
  pensionStartAge,
  NP_A_VALUE_2026,
  NP_PROPORTION_CONSTANT,
  NP_INCOME_FLOOR,
  NP_INCOME_CAP,
  NP_MIN_COVERAGE_MONTHS,
  NP_DEPENDENT_SPOUSE_YEAR,
  NP_DEPENDENT_OTHER_YEAR,
  type PensionMode,
} from '@/lib/krNationalPension'
import {
  fmtWon,
  commafy,
  parseAmount,
  adjustPct,
  calcBreakEven,
} from './nationalPensionUtils'
import s from './nationalPension.module.css'

const STORAGE_KEY = 'youtil:national-pension:inputs-v1'

const MODES: { id: PensionMode; label: string }[] = [
  { id: 'normal', label: '정상수령' },
  { id: 'early', label: '조기수령' },
  { id: 'defer', label: '연기연금' },
]

/* 입력 상한 — lib이 최종 클램프하지만 입력단에서도 상식 범위 (월 41만~659만은 lib, 표시는 0~2천만) */
const INCOME_INPUT_MAX = 20_000_000
const MAX_YEARS = 50
const CURRENT_YEAR = 2026

interface Stored {
  birthYear?: unknown
  years?: unknown
  months?: unknown
  income?: unknown
  mode?: unknown
  adjustYears?: unknown
  spouse?: unknown
  dependents?: unknown
}

function isMode(v: unknown): v is PensionMode {
  return v === 'normal' || v === 'early' || v === 'defer'
}

export default function NationalPensionClient() {
  const [birthYear, setBirthYear] = useState('1985')
  const [years, setYears] = useState('20')
  const [months, setMonths] = useState('0')
  const [income, setIncome] = useState('2,500,000')
  const [mode, setMode] = useState<PensionMode>('normal')
  const [adjustYears, setAdjustYears] = useState('5')
  const [spouse, setSpouse] = useState(false)
  const [dependents, setDependents] = useState('0')
  const [copied, setCopied] = useState(false)

  /* localStorage 복원 — 무검증 as 금지: 타입·범위·enum 검증 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: Stored = JSON.parse(raw)
      if (typeof j.birthYear === 'string' && /^\d{4}$/.test(j.birthYear)) setBirthYear(j.birthYear)
      if (typeof j.years === 'string' && /^\d{1,2}$/.test(j.years)) setYears(j.years)
      if (typeof j.months === 'string' && /^\d{1,2}$/.test(j.months)) setMonths(j.months)
      if (typeof j.income === 'string') setIncome(commafy(j.income))
      if (isMode(j.mode)) setMode(j.mode)
      if (typeof j.adjustYears === 'string' && /^[0-5]$/.test(j.adjustYears)) setAdjustYears(j.adjustYears)
      if (typeof j.spouse === 'boolean') setSpouse(j.spouse)
      if (typeof j.dependents === 'string' && /^\d$/.test(j.dependents)) setDependents(j.dependents)
    } catch {}
  }, [])

  /* 저장 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ birthYear, years, months, income, mode, adjustYears, spouse, dependents }),
      )
    } catch {}
  }, [birthYear, years, months, income, mode, adjustYears, spouse, dependents])

  /* 파싱 + 입력단 클램프 */
  const birthYearN = useMemo(() => {
    const y = parseInt(birthYear, 10)
    if (!Number.isFinite(y)) return CURRENT_YEAR - 40
    return Math.min(CURRENT_YEAR, Math.max(1920, y))
  }, [birthYear])

  const yearsN = Math.min(MAX_YEARS, Math.max(0, parseInt(years, 10) || 0))
  const monthsN = Math.min(11, Math.max(0, parseInt(months, 10) || 0))
  const totalMonths = yearsN * 12 + monthsN
  const incomeN = Math.min(INCOME_INPUT_MAX, Math.max(0, parseAmount(income)))
  const adjustYearsN = mode === 'normal' ? 0 : Math.min(5, Math.max(0, parseInt(adjustYears, 10) || 0))
  const dependentsN = Math.min(9, Math.max(0, parseInt(dependents, 10) || 0))

  const startAge = pensionStartAge(birthYearN)

  /* 주 계산 — 전부 lib */
  const result = useMemo(
    () =>
      calcPension({
        totalMonths,
        avgIncome: incomeN,
        mode,
        adjustYears: adjustYearsN,
        spouse,
        dependents: dependentsN,
      }),
    [totalMonths, incomeN, mode, adjustYearsN, spouse, dependentsN],
  )

  /* 비교용 정상수령 결과 (보정 없는 기준선) — 통계 재계산 금지, lib 재호출 */
  const normalResult = useMemo(
    () =>
      calcPension({
        totalMonths,
        avgIncome: incomeN,
        mode: 'normal',
        adjustYears: 0,
        spouse,
        dependents: dependentsN,
      }),
    [totalMonths, incomeN, spouse, dependentsN],
  )

  /* 손익분기 — UI 단순 누적 교차 (보정·통계 미재계산, result.monthly만 사용) */
  const breakEven = useMemo(() => {
    if (mode === 'normal' || !result.eligible || incomeN <= 0 || adjustYearsN <= 0) return null
    return calcBreakEven(
      normalResult.monthly,
      result.monthly,
      startAge,
      adjustYearsN,
      mode,
    )
  }, [mode, result.eligible, result.monthly, normalResult.monthly, startAge, adjustYearsN, incomeN])

  const monthlyDiff = result.monthly - normalResult.monthly // 정상 대비 월액 차

  /* 복사 */
  const summary = useMemo(() => {
    if (!result.eligible) {
      return `[국민연금 예상 수령액]\n총 가입 ${yearsN}년 ${monthsN}개월 — 가입 10년(120개월) 미만으로 노령연금 수급 자격 미충족\n출처: 국민연금공단 youtil.kr`
    }
    const modeLabel = MODES.find((m) => m.id === mode)!.label
    return (
      `[국민연금 예상 수령액]\n` +
      `월 ${fmtWon(result.monthly)}원 (연 ${fmtWon(result.annual)}원, 세전)\n` +
      `· 가입 ${yearsN}년 ${monthsN}개월 · 평균소득월액 ${fmtWon(result.B)}원\n` +
      `· 수급 방식 ${modeLabel}${adjustYearsN > 0 ? ` ${adjustYearsN}년 (${adjustPct(result.adjustFactor)})` : ''}\n` +
      `· ${birthYearN}년생 만 ${startAge}세부터\n` +
      `※ 공단 간단계산 산식 기반 추정 · youtil.kr`
    )
  }, [result, yearsN, monthsN, mode, adjustYearsN, birthYearN, startAge])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const hasIncome = incomeN > 0 // 소득 입력 전에는 결과를 숨겨 '빈칸→숫자' 오해 방지
  const incomeClamped = incomeN > 0 && incomeN !== result.B // lib이 41만~659만으로 클램프했는지 (빈칸은 제외)

  return (
    <div className={s.wrap}>
      {/* ── 입력 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>출생연도 · 가입기간</span>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="np-birth">출생연도</label>
            <input
              id="np-birth"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="1985"
            />
            <p className={s.helpText}>
              {birthYear.length === 4 ? (
                <>
                  <strong>{birthYearN}년생</strong>은 만 <strong className={s.cellAccent}>{startAge}세</strong>부터 노령연금 수급
                </>
              ) : (
                '4자리 연도 입력 (예: 1985) → 수급개시연령 표시'
              )}
            </p>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="np-income">평균 기준소득월액 (B)</label>
            <input
              id="np-income"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={income}
              onChange={(e) => setIncome(commafy(e.target.value))}
              placeholder="2,500,000"
            />
            <p className={s.helpText}>
              현재 월소득 수준 입력 (원)
              {incomeClamped && (
                <>
                  {' · '}
                  <span className={s.cellAccent}>{fmtWon(result.B)}원으로 적용</span> (상·하한 {fmtWon(NP_INCOME_FLOOR)}~{fmtWon(NP_INCOME_CAP)}원)
                </>
              )}
            </p>
          </div>
        </div>

        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="np-years">총 가입기간 — 연</label>
            <div className={s.inputUnit}>
              <input
                id="np-years"
                type="text"
                inputMode="numeric"
                className={s.input}
                value={years}
                onChange={(e) => setYears(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              />
              <span className={s.unitSuffix}>년</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="np-months">개월</label>
            <div className={s.inputUnit}>
              <input
                id="np-months"
                type="text"
                inputMode="numeric"
                className={s.input}
                value={months}
                onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              />
              <span className={s.unitSuffix}>개월</span>
            </div>
          </div>
        </div>
        <p className={s.helpText}>
          총 가입월수 <strong className={s.cellAccent}>{totalMonths}개월</strong> ({yearsN}년 {monthsN}개월)
          {' · '}최소 가입 <strong>{NP_MIN_COVERAGE_MONTHS}개월(10년)</strong> 이상부터 노령연금 수급
        </p>
      </div>

      {/* ── 수급 방식 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>수급 방식</span>
        <div className={s.segment} role="group" aria-label="수급 방식 선택">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${s.seg} ${mode === m.id ? s.segActive : ''}`}
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode !== 'normal' && (
          <div className={s.field} style={{ marginTop: 14, marginBottom: 0 }}>
            <label className={s.fieldLabel} htmlFor="np-adjust">
              {mode === 'early' ? '조기수령 연수 (정상보다 일찍)' : '연기 연수 (정상보다 늦게)'}
            </label>
            <select
              id="np-adjust"
              className={s.select}
              value={adjustYears}
              onChange={(e) => setAdjustYears(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={String(y)}>{y}년</option>
              ))}
            </select>
            <p className={s.helpText}>
              {mode === 'early'
                ? '조기노령연금은 연 6%씩 감액 (최대 5년 30% 감액)'
                : '연기연금은 연 7.2%씩 가산 (최대 5년 36% 가산)'}
            </p>
          </div>
        )}
      </div>

      {/* ── 부양가족 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>부양가족 (부양가족연금 가산)</span>
        <div className={s.checkRow}>
          <input
            id="np-spouse"
            type="checkbox"
            checked={spouse}
            onChange={(e) => setSpouse(e.target.checked)}
          />
          <label htmlFor="np-spouse">배우자 있음 (연 {fmtWon(NP_DEPENDENT_SPOUSE_YEAR)}원 가산)</label>
        </div>
        <div className={s.field} style={{ marginTop: 8, marginBottom: 0 }}>
          <label className={s.fieldLabel} htmlFor="np-dependents">자녀·부모 수 (1인당 연 {fmtWon(NP_DEPENDENT_OTHER_YEAR)}원)</label>
          <div className={s.inputUnit}>
            <input
              id="np-dependents"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={dependents}
              onChange={(e) => setDependents(e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
            />
            <span className={s.unitSuffix}>명</span>
          </div>
        </div>
      </div>

      {/* ── 결과: 히어로 ── */}
      {!result.eligible ? (
        <div className={s.notEligible}>
          <p className={s.notEligibleIcon} aria-hidden>⏳</p>
          <p className={s.notEligibleTitle}>아직 수급 자격 전입니다</p>
          <p className={s.notEligibleSub}>
            가입 <strong>10년(120개월) 이상</strong>부터 노령연금을 받습니다.
            <br />
            현재 입력 <strong>{totalMonths}개월</strong> — {NP_MIN_COVERAGE_MONTHS - totalMonths}개월 더 가입하면 수급 자격이 생깁니다.
          </p>
        </div>
      ) : !hasIncome ? (
        <div className={s.notEligible}>
          <p className={s.notEligibleIcon} aria-hidden>💰</p>
          <p className={s.notEligibleTitle}>평균 소득월액을 입력하세요</p>
          <p className={s.notEligibleSub}>
            평균 기준소득월액(B)을 입력하면 예상 노령연금액이 계산됩니다.
          </p>
        </div>
      ) : (
        <div className={s.hero}>
          <p className={s.heroLabel}>월 예상 노령연금액 (세전)</p>
          <p className={s.heroValue} role="status">
            {fmtWon(result.monthly)}
            <span className={s.heroUnit}>원/월</span>
          </p>
          <div className={s.subline}>
            <span>연 환산 <strong>{fmtWon(result.annual)}원</strong></span>
            <span>{birthYearN}년생은 만 <strong>{startAge}세</strong>부터</span>
          </div>
          <button type="button" className={s.copyBtn} onClick={onCopy}>
            {copied ? '✅ 복사됨' : '📋 결과 요약 복사'}
          </button>
        </div>
      )}

      {/* ── 내역 분해 ── */}
      {result.eligible && hasIncome && (
        <div className={s.card}>
          <span className={s.cardLabel}>예상액 내역 분해</span>
          <div className={s.tableScroll}>
            <table className={s.detailTable}>
              <tbody>
                <tr>
                  <td>기본연금액 (연)</td>
                  <td className={s.cellMono}>{fmtWon(result.basicAnnual)}원</td>
                </tr>
                <tr>
                  <td>가입기간 지급률</td>
                  <td className={s.cellMono}>{Math.round(result.payRate * 1000) / 10}%</td>
                </tr>
                <tr>
                  <td>┗ 노령연금액 (기본 × 지급률, 연)</td>
                  <td className={s.cellMono}>{fmtWon(result.oldAgeAnnual)}원</td>
                </tr>
                {mode !== 'normal' && (
                  <tr>
                    <td>{mode === 'early' ? '조기수령 보정' : '연기연금 보정'} ({adjustYearsN}년)</td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}>{adjustPct(result.adjustFactor)}</td>
                  </tr>
                )}
                {mode !== 'normal' && (
                  <tr>
                    <td>┗ 보정 후 노령연금액 (연)</td>
                    <td className={s.cellMono}>{fmtWon(result.adjustedAnnual)}원</td>
                  </tr>
                )}
                {result.dependentAnnual > 0 && (
                  <tr>
                    <td>부양가족연금 가산 (연)</td>
                    <td className={s.cellMono}>+{fmtWon(result.dependentAnnual)}원</td>
                  </tr>
                )}
                <tr className={s.cellTotal}>
                  <td><strong>연 예상액</strong></td>
                  <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtWon(result.annual)}원</strong></td>
                </tr>
                <tr className={s.cellTotal}>
                  <td><strong>월 예상액</strong></td>
                  <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtWon(result.monthly)}원</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 산식 대입값 펼침 — 투명 공개 */}
          <details className={s.formulaDetails} style={{ marginTop: 14 }}>
            <summary>산식 대입값 보기 (A값·비례상수·B·n)</summary>
            <div className={s.formulaBox} style={{ marginTop: 10 }}>
              기본연금액 = 비례상수 <strong>{NP_PROPORTION_CONSTANT}</strong> × (A값 <strong>{fmtWon(NP_A_VALUE_2026)}</strong> + B <strong>{fmtWon(result.B)}</strong>) × (1 + 0.05 × n <strong>{result.n}</strong> ÷ 12)
              <br />
              = <strong>{fmtWon(result.basicAnnual)}원</strong> (연)
              <br />
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                · A값: 전체 가입자 3년 평균 소득월액 (2026 적용) · B: 본인 평균 기준소득월액(상·하한 클램프 후) · n: 20년(240개월) 초과 가입월수 → {result.n}개월
              </span>
            </div>
          </details>
        </div>
      )}

      {/* ── 조기/연기 참고 비교 + 손익분기 ── */}
      {result.eligible && hasIncome && mode !== 'normal' && adjustYearsN > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>정상수령과 비교 (참고)</span>
          <div className={s.compareCard}>
            <div className={s.compareRow}>
              <span className="label">정상수령 (만 {startAge}세 개시)</span>
              <span className={s.val}>{fmtWon(normalResult.monthly)}원/월</span>
            </div>
            <div className={s.compareRow}>
              <span className="label">
                {mode === 'early' ? `조기수령 (만 ${startAge - adjustYearsN}세 개시)` : `연기연금 (만 ${startAge + adjustYearsN}세 개시)`}
              </span>
              <span className={`${s.val} ${s.valAccent}`}>{fmtWon(result.monthly)}원/월</span>
            </div>
            <div className={s.compareRow}>
              <span className="label">월액 차이</span>
              <span className={s.val}>
                {monthlyDiff >= 0 ? '+' : '−'}{fmtWon(Math.abs(monthlyDiff))}원
                {' '}({adjustPct(result.adjustFactor)})
              </span>
            </div>
          </div>

          {breakEven && breakEven.ageAtCrossover !== null ? (
            <div className={s.tipBox}>
              💡 단순 손익분기 연령: 약 <strong>만 {breakEven.ageAtCrossover.toFixed(1)}세</strong>
              {mode === 'early'
                ? ' — 이 나이를 넘겨 오래 받을수록 정상수령이 누적상 유리해집니다.'
                : ' — 이 나이를 넘겨 오래 받을수록 연기연금이 누적상 유리해집니다.'}
            </div>
          ) : (
            <div className={s.tipBox}>💡 입력 조건에서는 단순 누적 손익분기 교차가 발생하지 않습니다.</div>
          )}
          <p className={s.helpText}>
            ※ 손익분기는 <strong>보정·물가·기대수명을 반영하지 않은</strong> 단순 누적 수령액 교차점입니다. 실제 유불리는 건강·물가상승·소득공백 등에 따라 달라지므로 참고용입니다.
          </p>
        </div>
      )}

      <a
        href="/tools/finance/4-insurance"
        className={s.crossLink}
      >
        🧾 4대보험 계산기 → 매달 내는 국민연금 보험료부터 확인
      </a>
    </div>
  )
}
