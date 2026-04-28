'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import s from './four-insurance.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const parseComma = (v: string): number => {
  const x = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(x) ? x : 0
}
const fmt = (v: number, dp = 0): string =>
  v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
const fmtKRW = (v: number): string => `${Math.round(v).toLocaleString('ko-KR')}원`
const fmtComma = (v: string): string => {
  const num = v.replace(/[^\d]/g, '')
  if (!num) return ''
  return parseInt(num, 10).toLocaleString('ko-KR')
}

// ─────────────────────────────────────────────
// 4대보험 요율 (2025 / 2026)
// ─────────────────────────────────────────────
type RateSet = {
  pension:    { total: number; employee: number; employer: number; minBase: number; maxBase: number }
  health:     { total: number; employee: number; employer: number }
  ltc:        { rateOfSalary: number; employee: number; employer: number }
  unemp:      { employee: number; employer: number; extra: { under150: number; under1000: number; over1000: number } }
  workersCompAvg: number
}

const RATES: Record<2025 | 2026, RateSet> = {
  2025: {
    pension: { total: 9.0,  employee: 4.5,    employer: 4.5,    minBase: 390_000,  maxBase: 6_170_000 },
    health:  { total: 7.09, employee: 3.545,  employer: 3.545 },
    ltc:     { rateOfSalary: 0.9182, employee: 0.4591,  employer: 0.4591 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
  2026: {
    pension: { total: 9.5,  employee: 4.75,   employer: 4.75,   minBase: 400_000,  maxBase: 6_370_000 },
    health:  { total: 7.19, employee: 3.595,  employer: 3.595 },
    ltc:     { rateOfSalary: 0.9448, employee: 0.4724,  employer: 0.4724 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
}

// 산재보험 업종 예시 (% 단위)
const WORKERS_COMP_INDUSTRIES = [
  { key: 'office',        name: '사무직·금융업', rate: 0.07 },
  { key: 'retail',        name: '도소매·서비스', rate: 0.09 },
  { key: 'restaurant',    name: '음식점',         rate: 0.10 },
  { key: 'manufacturing', name: '제조업 평균',    rate: 0.15 },
  { key: 'transport',     name: '운수·창고업',    rate: 0.18 },
  { key: 'construction',  name: '건설업',         rate: 0.36 },
  { key: 'custom',        name: '직접 입력',      rate: 0.10 },
]

// 2026년 최저시급 (참고)
const MIN_WAGE_2026 = 10440

// ─────────────────────────────────────────────
// 핵심 계산
// ─────────────────────────────────────────────
type CalcInput = {
  monthlySalary: number
  taxFreeAmount: number
  workersCompRate: number
  companySize: 'under150' | 'under1000' | 'over1000'
  year: 2025 | 2026
}

function calc4Insurance(input: CalcInput) {
  const r = RATES[input.year]
  const taxableSalary = Math.max(0, input.monthlySalary - input.taxFreeAmount)
  const pensionBase = Math.min(Math.max(taxableSalary, r.pension.minBase), r.pension.maxBase)

  const pensionEmp  = pensionBase * (r.pension.employee / 100)
  const pensionEmpr = pensionBase * (r.pension.employer / 100)
  const healthEmp   = taxableSalary * (r.health.employee / 100)
  const healthEmpr  = taxableSalary * (r.health.employer / 100)
  const ltcEmp      = taxableSalary * (r.ltc.employee / 100)
  const ltcEmpr     = taxableSalary * (r.ltc.employer / 100)
  const unempEmp    = taxableSalary * (r.unemp.employee / 100)
  const unempEmpr   = taxableSalary * (r.unemp.employer / 100)
  const unempExtra  = taxableSalary * (r.unemp.extra[input.companySize] / 100)
  const workersEmpr = taxableSalary * (input.workersCompRate / 100)

  const employeeTotal = pensionEmp + healthEmp + ltcEmp + unempEmp
  const employerTotal = pensionEmpr + healthEmpr + ltcEmpr + unempEmpr + unempExtra + workersEmpr

  return {
    pensionEmp, pensionEmpr,
    healthEmp,  healthEmpr,
    ltcEmp,     ltcEmpr,
    unempEmp,   unempEmpr: unempEmpr + unempExtra,
    workersEmp: 0, workersEmpr,
    employeeTotal,
    employerTotal,
    grandTotal: employeeTotal + employerTotal,
    netSalary: input.monthlySalary - employeeTotal,
    companyTotalCost: input.monthlySalary + employerTotal,
    pensionBase,
    isPensionMinApplied: taxableSalary < r.pension.minBase,
    isPensionMaxApplied: taxableSalary > r.pension.maxBase,
    rates: r,
  }
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function FourInsuranceClient() {
  const [tab, setTab] = useState<'employee' | 'employer' | 'partTime' | 'freelance'>('employee')
  const [year, setYear] = useState<2025 | 2026>(2026)

  // ── TAB 1 ─
  const [salary, setSalary] = useState<string>('3,000,000')
  const [taxFree, setTaxFree] = useState<string>('200,000')

  // ── TAB 2 ─
  const [empSalary, setEmpSalary] = useState<string>('3,000,000')
  const [empTaxFree, setEmpTaxFree] = useState<string>('200,000')
  const [headCount, setHeadCount] = useState<string>('1')
  const [companySize, setCompanySize] = useState<'under150' | 'under1000' | 'over1000'>('under150')
  const [industry, setIndustry] = useState<string>('office')
  const [customWorkersRate, setCustomWorkersRate] = useState<string>('0.10')
  const [bonus, setBonus] = useState<string>('0')

  // ── TAB 3 ─
  const [hourlyWage, setHourlyWage] = useState<string>(MIN_WAGE_2026.toString())
  const [weekHours, setWeekHours] = useState<number>(20)

  // ── TAB 4 ─
  const [flAmount, setFlAmount] = useState<string>('3,000,000')
  const [flTaxFree, setFlTaxFree] = useState<string>('200,000')

  // ── COPY ─
  const [copied, setCopied] = useState<boolean>(false)

  // ─────────────────────────────────────────────
  // TAB 1 계산
  // ─────────────────────────────────────────────
  const empCalc = useMemo(() => calc4Insurance({
    monthlySalary: parseComma(salary),
    taxFreeAmount: parseComma(taxFree),
    workersCompRate: 0,
    companySize: 'under150',
    year,
  }), [salary, taxFree, year])

  // ─────────────────────────────────────────────
  // TAB 2 계산
  // ─────────────────────────────────────────────
  const selectedIndustry = WORKERS_COMP_INDUSTRIES.find(i => i.key === industry) ?? WORKERS_COMP_INDUSTRIES[0]
  const effectiveWorkersRate = industry === 'custom'
    ? parseFloat(customWorkersRate) || 0
    : selectedIndustry.rate
  // 추가 부담금: 출퇴근재해 0.06% + 임금채권부담금 0.06%
  const totalWorkersRate = effectiveWorkersRate + 0.06 + 0.06

  const employerCalc = useMemo(() => calc4Insurance({
    monthlySalary: parseComma(empSalary),
    taxFreeAmount: parseComma(empTaxFree),
    workersCompRate: totalWorkersRate,
    companySize,
    year,
  }), [empSalary, empTaxFree, totalWorkersRate, companySize, year])

  const headN = Math.max(1, parseInt(headCount, 10) || 1)
  const annualPerEmployee = employerCalc.companyTotalCost * 12 + parseComma(bonus)
  const annualTotal = annualPerEmployee * headN

  // 두루누리 자격
  const isDuruEligible = useMemo(() => {
    const monthly = parseComma(empSalary)
    return monthly < 2_700_000 && headN < 10
  }, [empSalary, headN])

  // ─────────────────────────────────────────────
  // TAB 3 계산
  // ─────────────────────────────────────────────
  const partTimeCalc = useMemo(() => {
    const hourly = parseComma(hourlyWage)
    const monthlyHours = weekHours * 4.345
    const weeklyExtra = weekHours >= 15 ? hourly * (weekHours / 5) : 0 // 주휴수당 단순화
    const monthlyExtra = weeklyExtra * 4.345
    const monthlyBase = hourly * monthlyHours
    const monthlySalary = monthlyBase + monthlyExtra

    // 의무 가입 여부
    const isOver60h = monthlyHours >= 60
    const isOver15h = weekHours >= 15
    // 1개월 이상 근무 가정
    const fullCoverage = isOver60h && isOver15h
    const onlyWorkersComp = !isOver60h && !isOver15h

    const calc = calc4Insurance({
      monthlySalary,
      taxFreeAmount: 0,
      workersCompRate: 0,
      companySize: 'under150',
      year,
    })

    return {
      monthlySalary, monthlyHours, weeklyExtra: monthlyExtra,
      isOver60h, isOver15h, fullCoverage, onlyWorkersComp,
      withCoverage: {
        gross: monthlySalary,
        deduction: calc.employeeTotal,
        net: calc.netSalary,
      },
      withoutCoverage: {
        gross: monthlySalary,
        deduction: 0,
        net: monthlySalary,
      },
    }
  }, [hourlyWage, weekHours, year])

  // ─────────────────────────────────────────────
  // TAB 4 계산
  // ─────────────────────────────────────────────
  const freelanceCalc = useMemo(() => {
    const amt = parseComma(flAmount)
    const incomeTax = amt * 0.03
    const localTax = amt * 0.003
    const flNet = amt - incomeTax - localTax

    const empResult = calc4Insurance({
      monthlySalary: amt,
      taxFreeAmount: parseComma(flTaxFree),
      workersCompRate: 0,
      companySize: 'under150',
      year,
    })
    const empNet = empResult.netSalary

    return {
      amt,
      freelance: { gross: amt, incomeTax, localTax, net: flNet },
      employee:  { gross: amt, deduction: empResult.employeeTotal, net: empNet },
      companyCostFree: amt,
      companyCostEmp: empResult.companyTotalCost,
      diffNet: flNet - empNet,
      diffCompanyCost: empResult.companyTotalCost - amt,
    }
  }, [flAmount, flTaxFree, year])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'employee') {
      text = [
        `[4대보험 — 직장인 (${year}년)]`,
        `월 보수: ${fmtKRW(parseComma(salary))} (비과세 ${fmtKRW(parseComma(taxFree))})`,
        ``,
        `국민연금: ${fmtKRW(empCalc.pensionEmp)}`,
        `건강보험: ${fmtKRW(empCalc.healthEmp)}`,
        `장기요양: ${fmtKRW(empCalc.ltcEmp)}`,
        `고용보험: ${fmtKRW(empCalc.unempEmp)}`,
        `합계: ${fmtKRW(empCalc.employeeTotal)}`,
        ``,
        `※ 소득세·지방세 별도`,
        `https://youtil.kr/tools/finance/4-insurance`,
      ].join('\n')
    } else if (tab === 'employer') {
      text = [
        `[4대보험 — 사업주 부담 (${year}년)]`,
        `직원 월급: ${fmtKRW(parseComma(empSalary))} × ${headN}명`,
        `사업장 규모: ${companySize === 'under150' ? '150인 미만' : companySize === 'under1000' ? '150~999인' : '1000인+'}`,
        ``,
        `근로자 부담: ${fmtKRW(employerCalc.employeeTotal)}`,
        `사업주 부담: ${fmtKRW(employerCalc.employerTotal)}`,
        `회사 월 총 부담: ${fmtKRW(employerCalc.companyTotalCost)} × ${headN}명 = ${fmtKRW(employerCalc.companyTotalCost * headN)}`,
        `회사 연 총 부담: ${fmtKRW(annualTotal)}`,
        ``,
        `https://youtil.kr/tools/finance/4-insurance`,
      ].join('\n')
    } else if (tab === 'partTime') {
      text = [
        `[알바 4대보험 비교]`,
        `시급 ${fmt(parseComma(hourlyWage))}원 × 주 ${weekHours}시간`,
        `월 예상 ${fmtKRW(partTimeCalc.monthlySalary)}`,
        ``,
        `4대보험 가입: 실수령 ${fmtKRW(partTimeCalc.withCoverage.net)} (공제 ${fmtKRW(partTimeCalc.withCoverage.deduction)})`,
        `4대보험 미가입: 실수령 ${fmtKRW(partTimeCalc.withoutCoverage.net)}`,
        ``,
        `https://youtil.kr/tools/finance/4-insurance`,
      ].join('\n')
    } else {
      text = [
        `[프리랜서 3.3% vs 4대보험]`,
        `월 지급액: ${fmtKRW(freelanceCalc.amt)}`,
        ``,
        `프리랜서 3.3%: 실수령 ${fmtKRW(freelanceCalc.freelance.net)}`,
        `근로자 4대보험: 실수령 ${fmtKRW(freelanceCalc.employee.net)} (소득세 별도)`,
        `차액: ${fmtKRW(Math.abs(freelanceCalc.diffNet))} ${freelanceCalc.diffNet > 0 ? '프리랜서 ↑' : '근로자 ↑'}`,
        ``,
        `https://youtil.kr/tools/finance/4-insurance`,
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
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>참고용 추정값입니다.</strong> {year}년 4대보험 요율 기준이며, 실제 보험료는 사업장 상황·요율 변경·지원 제도에 따라 달라질 수 있습니다.
        산재보험은 업종별 요율 + 출퇴근재해(0.06%) + 임금채권부담금(0.06%) 등에 따라 변동되므로,
        정확한 보험료는 4대 사회보험 정보연계센터(<a href="https://www.4insure.or.kr" target="_blank" rel="noopener noreferrer">www.4insure.or.kr</a>)에서 확인하세요.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${s.tabEmployee}  ${tab === 'employee'  ? s.tabActive : ''}`} onClick={() => setTab('employee')}>직장인</button>
        <button className={`${s.tabBtn} ${s.tabEmployer}  ${tab === 'employer'  ? s.tabActive : ''}`} onClick={() => setTab('employer')}>사업주</button>
        <button className={`${s.tabBtn} ${s.tabPartTime}  ${tab === 'partTime'  ? s.tabActive : ''}`} onClick={() => setTab('partTime')}>알바</button>
        <button className={`${s.tabBtn} ${s.tabFreelance} ${tab === 'freelance' ? s.tabActive : ''}`} onClick={() => setTab('freelance')}>프리랜서 3.3%</button>
      </div>

      {/* ──────────── TAB 1: 직장인 ──────────── */}
      {tab === 'employee' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>월 보수액·비과세</span>
              <span className={s.cardLabelHint}>식대 월 20만원까지 비과세</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>월 보수액 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.bigInput} type="text" inputMode="numeric" value={salary} onChange={e => setSalary(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>비과세 (식대 등)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={taxFree} onChange={e => setTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>
            <div className={s.yearToggle}>
              <button className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(salary) > 0 && (
            <div className={`${s.hero} ${s.heroEmployee}`}>
              <p className={s.heroLead}>월급에서 빠지는 4대보험</p>
              <div>
                <span className={s.heroNum}>{fmt(Math.round(empCalc.employeeTotal))}</span>
                <span className={s.heroUnit}>원</span>
              </div>
              <p className={s.heroSub}>
                요율 합계 <span className={s.heroSubAccent}>{(empCalc.rates.pension.employee + empCalc.rates.health.employee + empCalc.rates.ltc.employee + empCalc.rates.unemp.employee).toFixed(3)}%</span>
                {' · '}<span className={s.heroSubAccent}>{year}년 기준</span>
              </p>
              <div className={s.heroSecondary}>
                실수령 (4대보험만 차감): <strong>{fmtKRW(empCalc.netSalary)}</strong>
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--muted)' }}>※ 소득세·지방세 별도</p>
              </div>
            </div>
          )}

          {/* 항목별 표 */}
          {parseComma(salary) > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>항목별 공제</span>
                <span className={s.cardLabelHint}>근로자 부담분</span>
              </div>
              <table className={s.itemTable}>
                <thead>
                  <tr><th>항목</th><th>요율</th><th>공제액</th></tr>
                </thead>
                <tbody>
                  <tr className={s.rowPension}><td>국민연금</td><td>{empCalc.rates.pension.employee}%</td><td>{fmtKRW(empCalc.pensionEmp)}</td></tr>
                  <tr className={s.rowHealth}> <td>건강보험</td><td>{empCalc.rates.health.employee}%</td><td>{fmtKRW(empCalc.healthEmp)}</td></tr>
                  <tr className={s.rowLtc}>    <td>장기요양보험</td><td>{empCalc.rates.ltc.employee}%</td><td>{fmtKRW(empCalc.ltcEmp)}</td></tr>
                  <tr className={s.rowUnemp}>  <td>고용보험</td><td>{empCalc.rates.unemp.employee}%</td><td>{fmtKRW(empCalc.unempEmp)}</td></tr>
                  <tr className={s.totalRow}>
                    <td>합계</td>
                    <td>{(empCalc.rates.pension.employee + empCalc.rates.health.employee + empCalc.rates.ltc.employee + empCalc.rates.unemp.employee).toFixed(3)}%</td>
                    <td>{fmtKRW(empCalc.employeeTotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* 국민연금 상하한 안내 */}
              {(empCalc.isPensionMinApplied || empCalc.isPensionMaxApplied) && (
                <div className={s.pensionCapNote}>
                  📌 국민연금 기준소득월액 <strong>{empCalc.isPensionMinApplied ? '하한' : '상한'}</strong> 적용 — 실제 보수
                  {empCalc.isPensionMinApplied
                    ? ` ${fmtKRW(parseComma(salary) - parseComma(taxFree))} → 하한 ${fmtKRW(empCalc.rates.pension.minBase)} 기준 부과`
                    : ` ${fmtKRW(parseComma(salary) - parseComma(taxFree))} → 상한 ${fmtKRW(empCalc.rates.pension.maxBase)} 기준 부과`}
                </div>
              )}
            </div>
          )}

          {/* 2026년 변경 안내 */}
          {year === 2026 && (
            <div className={s.noticeCard}>
              <span className={s.noticeBadge}>📅 2026년 적용 요율</span>
              <div>2025년 대비 주요 변경사항:</div>
              <ul>
                <li>국민연금 <strong>9% → 9.5%</strong> (0.5%p ↑, 33년 만의 인상)</li>
                <li>건강보험 <strong>7.09% → 7.19%</strong> (0.1%p ↑)</li>
                <li>장기요양 <strong>0.9182% → 0.9448%</strong> (2.9% ↑)</li>
                <li>국민연금 기준소득월액 상한 <strong>617만 → 637만원</strong></li>
                <li>국민연금 기준소득월액 하한 <strong>39만 → 40만원</strong></li>
              </ul>
            </div>
          )}

          {/* 안내 — 정확한 실수령 계산 */}
          <div className={s.interpretCard}>
            본 계산기는 <strong>4대보험만</strong> 계산합니다.
            정확한 실수령액은 <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>에서 소득세·지방세까지 함께 확인하세요.
          </div>

          {parseComma(salary) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 사업주 ──────────── */}
      {tab === 'employer' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>채용 직원 정보</span>
              <span className={s.cardLabelHint}>사업주 부담 분석</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>직원 월 보수액 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.bigInput} type="text" inputMode="numeric" value={empSalary} onChange={e => setEmpSalary(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>비과세</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={empTaxFree} onChange={e => setEmpTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>직원 수</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="number" inputMode="numeric" min="1" max="1000" step="1" value={headCount} onChange={e => setHeadCount(e.target.value)} />
                  <span className={s.unit}>명</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>월 상여 (선택)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={bonus} onChange={e => setBonus(fmtComma(e.target.value))} />
                  <span className={s.unit}>원/연</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <span className={s.subLabel}>사업장 규모 (고용보험 사업주 추가 부담률)</span>
              <div className={s.choiceRow}>
                <button className={`${s.choiceBtn} ${companySize === 'under150'  ? s.choiceActive : ''}`} onClick={() => setCompanySize('under150')}>150인 미만<br /><small style={{ fontSize: 10 }}>+0.25%</small></button>
                <button className={`${s.choiceBtn} ${companySize === 'under1000' ? s.choiceActive : ''}`} onClick={() => setCompanySize('under1000')}>150~999인<br /><small style={{ fontSize: 10 }}>+0.65%</small></button>
                <button className={`${s.choiceBtn} ${companySize === 'over1000'  ? s.choiceActive : ''}`} onClick={() => setCompanySize('over1000')}>1,000인+<br /><small style={{ fontSize: 10 }}>+0.85%</small></button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <span className={s.subLabel}>산재보험 업종 ({selectedIndustry.name} {industry === 'custom' ? customWorkersRate : selectedIndustry.rate}% + 0.12% 추가부담)</span>
              <select className={s.selectInput} value={industry} onChange={e => setIndustry(e.target.value)}>
                {WORKERS_COMP_INDUSTRIES.map(i => (
                  <option key={i.key} value={i.key}>{i.name} {i.key !== 'custom' ? `(${i.rate}%)` : ''}</option>
                ))}
              </select>
              {industry === 'custom' && (
                <div className={s.inputRow} style={{ marginTop: 8 }}>
                  <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="50" step="0.01" value={customWorkersRate} onChange={e => setCustomWorkersRate(e.target.value)} />
                  <span className={s.unit}>%</span>
                </div>
              )}
            </div>

            <div className={s.yearToggle}>
              <button className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(empSalary) > 0 && (
            <div className={`${s.hero} ${s.heroEmployer}`}>
              <p className={s.heroLead}>직원 1명당 월 총 인건비</p>
              <div>
                <span className={s.heroNum}>{fmt(Math.round(employerCalc.companyTotalCost))}</span>
                <span className={s.heroUnit}>원</span>
              </div>
              <p className={s.heroSub}>
                월 부담 (4대보험): <span className={s.heroSubAccent}>{fmtKRW(employerCalc.employerTotal)}</span>
              </p>
              <div className={s.heroSecondary}>
                연간 총 부담 ({headN}명): <strong>{fmtKRW(annualTotal)}</strong>
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--muted)' }}>※ 퇴직금·연차수당·상여 추가 별도</p>
              </div>
            </div>
          )}

          {/* 부담 분리 표 */}
          {parseComma(empSalary) > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>근로자 vs 사업주 부담</span>
                <span className={s.cardLabelHint}>{year}년 요율</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.dualTable} style={{ minWidth: 460 }}>
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th style={{ textAlign: 'right' }}>근로자</th>
                      <th style={{ textAlign: 'right' }}>사업주</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={s.rowPension}>
                      <td>국민연금 ({employerCalc.rates.pension.employee}%)</td>
                      <td className={s.colEmployee}>{fmtKRW(employerCalc.pensionEmp)}</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.pensionEmpr)}</td>
                    </tr>
                    <tr className={s.rowHealth}>
                      <td>건강보험 ({employerCalc.rates.health.employee}%)</td>
                      <td className={s.colEmployee}>{fmtKRW(employerCalc.healthEmp)}</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.healthEmpr)}</td>
                    </tr>
                    <tr className={s.rowLtc}>
                      <td>장기요양 ({employerCalc.rates.ltc.employee}%)</td>
                      <td className={s.colEmployee}>{fmtKRW(employerCalc.ltcEmp)}</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.ltcEmpr)}</td>
                    </tr>
                    <tr className={s.rowUnemp}>
                      <td>고용보험</td>
                      <td className={s.colEmployee}>{fmtKRW(employerCalc.unempEmp)}</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.unempEmpr)}</td>
                    </tr>
                    <tr className={s.rowWorkers}>
                      <td>산재보험 ({totalWorkersRate.toFixed(2)}%)</td>
                      <td className={`${s.colEmployee} ${s.zero}`}>0</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.workersEmpr)}</td>
                    </tr>
                    <tr className={s.totalRow}>
                      <td>합계</td>
                      <td className={s.colEmployee}>{fmtKRW(employerCalc.employeeTotal)}</td>
                      <td className={s.colEmployer}>{fmtKRW(employerCalc.employerTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 회사 총 인건비 카드 */}
          {parseComma(empSalary) > 0 && (
            <div className={s.companyCostCard}>
              <div className={s.companyCostRow}>
                <span>직원 월급</span>
                <strong>{fmtKRW(parseComma(empSalary))}</strong>
              </div>
              <div className={s.companyCostRow}>
                <span>회사 4대보험 부담</span>
                <strong>+{fmtKRW(employerCalc.employerTotal)}</strong>
              </div>
              <div className={`${s.companyCostRow} ${s.totalRow}`}>
                <span>1명당 월 총 부담</span>
                <strong>{fmtKRW(employerCalc.companyTotalCost)}</strong>
              </div>
              <div className={`${s.companyCostRow} ${s.totalRow}`}>
                <span>{headN}명 월 총 부담</span>
                <strong>{fmtKRW(employerCalc.companyTotalCost * headN)}</strong>
              </div>
              <div className={`${s.companyCostRow} ${s.totalRow}`}>
                <span>{headN}명 연간 총 부담 (12개월{parseComma(bonus) > 0 ? ' + 상여' : ''})</span>
                <strong>{fmtKRW(annualTotal)}</strong>
              </div>
            </div>
          )}

          {/* 두루누리 안내 */}
          {isDuruEligible && (
            <div className={s.duruCard}>
              <span className={s.duruBadge}>💡 두루누리 지원 대상</span>
              <p>
                월급여 270만원 미만 ✅ · 사업장 10인 미만 ✅ — 두루누리 사회보험료 지원 대상에 해당될 수 있습니다.
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>국민연금·고용보험을 최대 80%까지 36개월간 지원</strong>받을 수 있습니다.
              </p>
              <ul>
                <li>입사일 직전 6개월간 고용 이력 없음</li>
                <li>재산 6억 이하 · 종합소득 4,300만 이하</li>
                <li>4대보험 취득신고 시 함께 신청</li>
                <li>국민연금공단 1355 상담</li>
              </ul>
            </div>
          )}

          {parseComma(empSalary) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 3: 알바 ──────────── */}
      {tab === 'partTime' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>알바 근무 정보</span>
              <span className={s.cardLabelHint}>2026 최저시급 {fmt(MIN_WAGE_2026)}원</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>시급 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.bigInput} type="text" inputMode="numeric" value={hourlyWage} onChange={e => setHourlyWage(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>주 근무시간: {weekHours}시간</span>
                <div className={s.sliderRow}>
                  <input type="range" min={1} max={40} step={1} value={weekHours} onChange={e => setWeekHours(Number(e.target.value))} />
                  <span className={s.sliderValue}>{weekHours}h/주</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              월 근무시간 ≈ <strong style={{ color: 'var(--text)' }}>{partTimeCalc.monthlyHours.toFixed(1)}시간</strong>
              {weekHours >= 15 && <> · 주휴수당 적용 ✅</>}
            </p>
          </div>

          {/* 의무 가입 상태 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>4대보험 의무 가입 여부</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                ① 1개월 이상 + 월 60시간 이상 → 국민·건강·고용 의무
                <span className={`${s.statusBadge} ${partTimeCalc.isOver60h ? s.statusYes : s.statusNo}`} style={{ marginLeft: 10 }}>
                  {partTimeCalc.isOver60h ? '✅ 의무' : '❌ 면제'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                ② 주 15시간 이상 → 주휴수당 + 고용보험 의무
                <span className={`${s.statusBadge} ${partTimeCalc.isOver15h ? s.statusYes : s.statusNo}`} style={{ marginLeft: 10 }}>
                  {partTimeCalc.isOver15h ? '✅ 의무' : '❌ 면제'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                ③ 산재보험 → 모든 근로자 (시간 무관)
                <span className={`${s.statusBadge} ${s.statusOnly}`} style={{ marginLeft: 10 }}>✅ 항상 적용</span>
              </div>
            </div>
          </div>

          {/* HERO */}
          {parseComma(hourlyWage) > 0 && (
            <div className={`${s.hero} ${s.heroPartTime}`}>
              <p className={s.heroLead}>월 예상 임금</p>
              <div>
                <span className={s.heroNum}>{fmt(Math.round(partTimeCalc.monthlySalary))}</span>
                <span className={s.heroUnit}>원</span>
              </div>
              <p className={s.heroSub}>
                기본 {fmt(Math.round(partTimeCalc.monthlySalary - partTimeCalc.weeklyExtra))}원
                {weekHours >= 15 && <> + 주휴수당 약 {fmt(Math.round(partTimeCalc.weeklyExtra))}원</>}
              </p>
            </div>
          )}

          {/* 시나리오 비교 */}
          {parseComma(hourlyWage) > 0 && (
            <div className={s.scenarioGrid}>
              <div className={`${s.scenarioCard} ${s.scenarioCardA}`}>
                <p className={s.scenarioTitle}>시나리오 A</p>
                <p className={s.scenarioName}>4대보험 미가입 (단시간)</p>
                <div className={s.scenarioRow}><span>세전 월급</span><strong>{fmtKRW(partTimeCalc.withoutCoverage.gross)}</strong></div>
                <div className={s.scenarioRow}><span>4대보험 공제</span><strong>0원</strong></div>
                <div className={s.scenarioBig}><span>실수령</span><strong>{fmtKRW(partTimeCalc.withoutCoverage.net)}</strong></div>
              </div>
              <div className={`${s.scenarioCard} ${s.scenarioCardB}`}>
                <p className={s.scenarioTitle}>시나리오 B</p>
                <p className={s.scenarioName}>4대보험 가입 (정규 알바)</p>
                <div className={s.scenarioRow}><span>세전 월급</span><strong>{fmtKRW(partTimeCalc.withCoverage.gross)}</strong></div>
                <div className={s.scenarioRow}><span>4대보험 공제</span><strong>−{fmtKRW(partTimeCalc.withCoverage.deduction)}</strong></div>
                <div className={s.scenarioBig}><span>실수령</span><strong>{fmtKRW(partTimeCalc.withCoverage.net)}</strong></div>
              </div>
            </div>
          )}

          {/* 차액 + 혜택 */}
          {parseComma(hourlyWage) > 0 && (
            <div className={s.diffCard}>
              <div className={s.diffRow}>
                <span>가입 시 월 공제액</span>
                <strong className={s.diffWarn}>−{fmtKRW(partTimeCalc.withCoverage.deduction)}</strong>
              </div>
              <div className={s.diffRow}>
                <span>실수령 차이 (월)</span>
                <strong className={s.diffWarn}>−{fmtKRW(partTimeCalc.withoutCoverage.net - partTimeCalc.withCoverage.net)}</strong>
              </div>
            </div>
          )}

          <div className={s.benefitCard}>
            <p className={s.benefitTitle}>4대보험 가입 시 혜택</p>
            <ul>
              <li>실업급여 (고용보험 가입 시) — 비자발적 퇴사 90~270일</li>
              <li>산재 보장 — 업무상 재해·질병 의료·휴업·장해</li>
              <li>국민연금 적립 — 노령연금·유족연금·장애연금</li>
              <li>건강보험 본인 자격 (피부양자 X)</li>
            </ul>
          </div>

          <div className={s.interpretCard}>
            단순 실수령액만 보면 미가입이 유리하지만, <strong>장기적 사회보장</strong> 측면에서는 가입이 권장됩니다.
            특히 1개월 이상 + 월 60시간 이상 근무는 사용자 동의 없이도 의무 가입 대상입니다.
          </div>

          {parseComma(hourlyWage) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 4: 프리랜서 ──────────── */}
      {tab === 'freelance' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>월 지급액</span>
              <span className={s.cardLabelHint}>회사가 지급하는 총액</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>월 지급액 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.bigInput} type="text" inputMode="numeric" value={flAmount} onChange={e => setFlAmount(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>비과세 (4대보험 시만)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={flTaxFree} onChange={e => setFlTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>
            <div className={s.yearToggle}>
              <button className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(flAmount) > 0 && (
            <div className={`${s.hero} ${s.heroFreelance}`}>
              <p className={s.heroLead}>실수령 차이 (근로자 관점)</p>
              <div>
                <span className={s.heroNum}>+{fmt(Math.round(Math.abs(freelanceCalc.diffNet)))}</span>
                <span className={s.heroUnit}>원/월</span>
              </div>
              <p className={s.heroSub}>
                {freelanceCalc.diffNet > 0 ? '프리랜서가 근로자보다 더 받음' : '근로자가 프리랜서보다 더 받음'}
                {' · '}<span className={s.heroSubAccent}>5월 종합소득세 신고 의무 별도</span>
              </p>
            </div>
          )}

          {/* 3 시나리오 */}
          {parseComma(flAmount) > 0 && (
            <div className={s.scenarioGrid3}>
              <div className={`${s.scenarioCard} ${s.scenarioCardP}`}>
                <p className={s.scenarioTitle}>시나리오 A</p>
                <p className={s.scenarioName}>프리랜서 3.3% 원천징수</p>
                <div className={s.scenarioRow}><span>월 지급액</span><strong>{fmtKRW(freelanceCalc.freelance.gross)}</strong></div>
                <div className={s.scenarioRow}><span>사업소득세 3.0%</span><strong>−{fmtKRW(freelanceCalc.freelance.incomeTax)}</strong></div>
                <div className={s.scenarioRow}><span>지방소득세 0.3%</span><strong>−{fmtKRW(freelanceCalc.freelance.localTax)}</strong></div>
                <div className={s.scenarioBig}><span>실수령</span><strong>{fmtKRW(freelanceCalc.freelance.net)}</strong></div>
              </div>
              <div className={`${s.scenarioCard} ${s.scenarioCardA}`}>
                <p className={s.scenarioTitle}>시나리오 B</p>
                <p className={s.scenarioName}>근로자 4대보험 가입</p>
                <div className={s.scenarioRow}><span>월 보수액</span><strong>{fmtKRW(freelanceCalc.employee.gross)}</strong></div>
                <div className={s.scenarioRow}><span>4대보험 공제</span><strong>−{fmtKRW(freelanceCalc.employee.deduction)}</strong></div>
                <div className={s.scenarioRow}><span>소득세</span><strong>(별도)</strong></div>
                <div className={s.scenarioBig}><span>실수령*</span><strong>{fmtKRW(freelanceCalc.employee.net)}</strong></div>
              </div>
              <div className={`${s.scenarioCard} ${s.scenarioCardC}`}>
                <p className={s.scenarioTitle}>시나리오 C</p>
                <p className={s.scenarioName}>회사 부담 (사업주 관점)</p>
                <div className={s.scenarioRow}><span>프리랜서 지급</span><strong>{fmtKRW(freelanceCalc.companyCostFree)}</strong></div>
                <div className={s.scenarioRow}><span>4대보험 (4대보험 + 회사부담)</span><strong>{fmtKRW(freelanceCalc.companyCostEmp)}</strong></div>
                <div className={s.scenarioBig}><span>회사 부담 차이</span><strong>+{fmtKRW(freelanceCalc.diffCompanyCost)}</strong></div>
              </div>
            </div>
          )}

          {parseComma(flAmount) > 0 && (
            <div className={s.diffCard}>
              <div className={s.diffRow}>
                <span>실수령 차이 (근로자 관점)</span>
                <strong className={freelanceCalc.diffNet > 0 ? s.diffPositive : s.diffWarn}>
                  {freelanceCalc.diffNet > 0 ? '프리랜서 ' : '근로자 '}
                  +{fmtKRW(Math.abs(freelanceCalc.diffNet))} 더 받음
                </strong>
              </div>
              <div className={s.diffRow}>
                <span>회사 부담 차이 (사업주 관점)</span>
                <strong className={s.diffPositive}>프리랜서 −{fmtKRW(freelanceCalc.diffCompanyCost)} 절감</strong>
              </div>
            </div>
          )}

          <div className={s.disguisedCard}>
            <strong>ℹ️ 프리랜서 vs 근로계약 — 단순 비용 비교를 넘어 다음을 고려해야 합니다:</strong>
            <ul>
              <li><strong style={{ color: 'var(--text)' }}>사회보장</strong>: 4대보험 가입자는 실업급여·국민연금·건강보험 보장</li>
              <li><strong style={{ color: 'var(--text)' }}>세금</strong>: 프리랜서는 5월 종합소득세 신고 의무, 경비 처리 가능</li>
              <li><strong style={{ color: 'var(--text)' }}>근로자 보호</strong>: 근로계약은 해고 제한·연차·퇴직금 적용</li>
              <li><strong style={{ color: 'var(--text)' }}>위장도급</strong>: 실질이 근로자인데 프리랜서로 계약하면 법 위반 가능</li>
            </ul>
            <p style={{ marginTop: 8, color: 'var(--muted)' }}>
              위장도급 의심 시 고용노동부 1350 또는 노무사 상담을 권장합니다.
            </p>
          </div>

          {parseComma(flAmount) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
