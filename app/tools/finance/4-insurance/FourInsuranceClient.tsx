'use client'

import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import {
  MIN_HOURLY_WAGE, previousPensionBase, pensionBasePeriodLabel,
  WORKERS_COMP_INDUSTRIES, WORKERS_COMP_COMMUTE_PERMILLE, WAGE_CLAIM_LEVY_PERMILLE,
} from '@/lib/krInsuranceRates'
import { todayStr } from '@/lib/date'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { calc4Insurance, pensionBaseForYear, yearViewLabel } from './fourInsuranceUtils'
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

const man = (v: number): string => `${(v / 10_000).toLocaleString('ko-KR')}만`

// ─────────────────────────────────────────────
// 기준일 — 국민연금 기준소득월액 상·하한(매년 7월 개정) 구간 선택용
// SSG(빌드)와 hydration 첫 렌더는 page.tsx가 빌드 때 넘긴 날짜(buildDate)를 같이 쓰고(불일치 없음),
// hydration 직후 기기 날짜(todayStr)로 다시 렌더한다 → 7월 1일 전 빌드·후 방문이어도 값이 맞다.
// ─────────────────────────────────────────────
const noopSubscribe = () => () => {}
function useAsOfDate(buildDate: string): string {
  return useSyncExternalStore(noopSubscribe, todayStr, () => buildDate)
}

// 산재보험 업종 — 요율 단일 소스 lib/krInsuranceRates (고시 천분율 ‰ → 화면 % = ÷10)
type IndustryOption = { key: string; name: string; rate: number } // rate: %
const industryOptions = (year: 2025 | 2026): IndustryOption[] => [
  ...WORKERS_COMP_INDUSTRIES[year].map(i => ({ key: i.key, name: i.name, rate: i.permille / 10 })),
  { key: 'custom', name: '직접 입력', rate: 0.5 },
]
// 전 업종 공통 가산: 출퇴근재해 0.06% + 임금채권부담금 0.06%
const WORKERS_EXTRA_RATE = (WORKERS_COMP_COMMUTE_PERMILLE + WAGE_CLAIM_LEVY_PERMILLE) / 10

// 2026년 최저시급 (참고) — lib/krInsuranceRates 단일 소스 (고용노동부 고시 10,320원)
const MIN_WAGE_2026 = MIN_HOURLY_WAGE[2026]

// 핵심 계산: ./fourInsuranceUtils.ts (calc4Insurance — 골든 테스트 대상)

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function FourInsuranceClient({ buildDate }: { buildDate?: string }) {
  const [tab, setTab] = useState<'employee' | 'employer' | 'partTime' | 'freelance'>('employee')
  const [year, setYear] = useState<2025 | 2026>(2026)
  const asOf = useAsOfDate(buildDate ?? todayStr())
  const { pensionPeriod, pensionPrev, pensionLabel, viewLabel } = useMemo(() => {
    const p = pensionBaseForYear(year, asOf)
    return {
      pensionPeriod: p,
      pensionPrev: previousPensionBase(p),
      pensionLabel: pensionBasePeriodLabel(p),   // 상·하한 고시 적용기간 (7월~익년 6월)
      viewLabel: yearViewLabel(year, p),         // 선택 연도 요율과 함께 쓰이는 기간 (예: 2025년 7~12월)
    }
  }, [year, asOf])

  // ── TAB 1 ─
  const [salary, setSalary] = useState<string>('3,000,000')
  const [taxFree, setTaxFree] = useState<string>('200,000')

  // ── TAB 2 ─
  const [empSalary, setEmpSalary] = useState<string>('3,000,000')
  const [empTaxFree, setEmpTaxFree] = useState<string>('200,000')
  const [headCount, setHeadCount] = useState<string>('1')
  const [companySize, setCompanySize] = useState<'under150' | 'under1000' | 'over1000'>('under150')
  const [industry, setIndustry] = useState<string>('finance')
  const [customWorkersRate, setCustomWorkersRate] = useState<string>('0.5')
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
    pensionPeriod,
  }), [salary, taxFree, year, pensionPeriod])

  // ─────────────────────────────────────────────
  // TAB 2 계산
  // ─────────────────────────────────────────────
  const industries = industryOptions(year)
  const selectedIndustry = industries.find(i => i.key === industry) ?? industries[0]
  const effectiveWorkersRate = industry === 'custom'
    ? Math.min(50, Math.max(0, parseFloat(customWorkersRate) || 0))
    : selectedIndustry.rate
  // 추가 부담금: 출퇴근재해 0.06% + 임금채권부담금 0.06%
  const totalWorkersRate = effectiveWorkersRate + WORKERS_EXTRA_RATE

  const employerCalc = useMemo(() => calc4Insurance({
    monthlySalary: parseComma(empSalary),
    taxFreeAmount: parseComma(empTaxFree),
    workersCompRate: totalWorkersRate,
    companySize,
    year,
    pensionPeriod,
  }), [empSalary, empTaxFree, totalWorkersRate, companySize, year, pensionPeriod])

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

    // 의무 가입 여부 — 국민·건강·고용보험은 월 60시간 이상이면 적용(주 15시간은 주휴수당 기준)
    const isOver60h = monthlyHours >= 60
    const isOver15h = weekHours >= 15

    const calc = calc4Insurance({
      monthlySalary,
      taxFreeAmount: 0,
      workersCompRate: 0,
      companySize: 'under150',
      year,
      pensionPeriod,
    })
    // 월 60시간 미만이면 국민·건강·고용 가입 의무가 없어 근로자 공제 0 (산재는 사업주 부담)
    const employeeDeduction = isOver60h ? calc.employeeTotal : 0

    return {
      monthlySalary, monthlyHours, weeklyExtra: monthlyExtra,
      isOver60h, isOver15h,
      withCoverage: {
        gross: monthlySalary,
        deduction: employeeDeduction,
        net: monthlySalary - employeeDeduction,
      },
      withoutCoverage: {
        gross: monthlySalary,
        deduction: 0,
        net: monthlySalary,
      },
    }
  }, [hourlyWage, weekHours, year, pensionPeriod])

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
      pensionPeriod,
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
  }, [flAmount, flTaxFree, year, pensionPeriod])

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
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '국민연금공단', href: 'https://www.nps.or.kr' },
          { label: '국민건강보험공단', href: 'https://www.nhis.or.kr' },
          { label: '근로복지공단', href: 'https://www.comwel.or.kr' },
        ]}
      >
        참고용 추정값입니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={s.tabs} role="tablist" aria-label="4대보험 계산 대상">
        <button type="button" role="tab" aria-selected={tab === 'employee'} className={`${s.tabBtn} ${s.tabEmployee}  ${tab === 'employee'  ? s.tabActive : ''}`} onClick={() => setTab('employee')}>직장인</button>
        <button type="button" role="tab" aria-selected={tab === 'employer'} className={`${s.tabBtn} ${s.tabEmployer}  ${tab === 'employer'  ? s.tabActive : ''}`} onClick={() => setTab('employer')}>사업주</button>
        <button type="button" role="tab" aria-selected={tab === 'partTime'} className={`${s.tabBtn} ${s.tabPartTime}  ${tab === 'partTime'  ? s.tabActive : ''}`} onClick={() => setTab('partTime')}>알바</button>
        <button type="button" role="tab" aria-selected={tab === 'freelance'} className={`${s.tabBtn} ${s.tabFreelance} ${tab === 'freelance' ? s.tabActive : ''}`} onClick={() => setTab('freelance')}>프리랜서 3.3%</button>
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
                <label htmlFor="fi-salary" className={s.subLabel}>월 보수액 (원)</label>
                <div className={s.inputRow}>
                  <input id="fi-salary" className={s.bigInput} type="text" inputMode="numeric" value={salary} onChange={e => setSalary(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <label htmlFor="fi-taxfree" className={s.subLabel}>비과세 (식대 등)</label>
                <div className={s.inputRow}>
                  <input id="fi-taxfree" className={s.smallInput} type="text" inputMode="numeric" value={taxFree} onChange={e => setTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>
            <div className={s.yearToggle} role="group" aria-label="적용 연도">
              <button type="button" aria-pressed={year === 2025} className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button type="button" aria-pressed={year === 2026} className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(salary) > 0 && (
            <div role="status" className={`${s.hero} ${s.heroEmployee}`}>
              <p className={s.heroLead}>월급에서 빠지는 4대보험</p>
              <div>
                <span className={s.heroNum}>{fmt(Math.round(empCalc.employeeTotal))}</span>
                <span className={s.heroUnit}>원</span>
              </div>
              <p className={s.heroSub}>
                요율 합계 <span className={s.heroSubAccent}>{(empCalc.rates.pension.employee + empCalc.rates.health.employee + empCalc.rates.ltc.employee + empCalc.rates.unemp.employee).toFixed(3)}%</span>
                {' · '}<span className={s.heroSubAccent}>{viewLabel} 기준</span>
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
                  <tr><th scope="col">항목</th><th scope="col">요율</th><th scope="col">공제액</th></tr>
                </thead>
                <tbody>
                  <tr className={s.rowPension}><td>국민연금</td><td>{empCalc.rates.pension.employee}%</td><td>{fmtKRW(empCalc.pensionEmp)}</td></tr>
                  <tr className={s.rowHealth}><td>건강보험</td><td>{empCalc.rates.health.employee}%</td><td>{fmtKRW(empCalc.healthEmp)}</td></tr>
                  <tr className={s.rowLtc}><td>장기요양보험</td><td>{empCalc.rates.ltc.employee}%</td><td>{fmtKRW(empCalc.ltcEmp)}</td></tr>
                  <tr className={s.rowUnemp}><td>고용보험</td><td>{empCalc.rates.unemp.employee}%</td><td>{fmtKRW(empCalc.unempEmp)}</td></tr>
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
                    ? ` ${fmtKRW(parseComma(salary) - parseComma(taxFree))} → 하한 ${fmtKRW(empCalc.pensionPeriod.min)} 기준 부과`
                    : ` ${fmtKRW(parseComma(salary) - parseComma(taxFree))} → 상한 ${fmtKRW(empCalc.pensionPeriod.max)} 기준 부과`}
                  {` (${viewLabel} 기준)`}
                </div>
              )}
            </div>
          )}

          {/* 2026년 변경 안내 */}
          {year === 2026 && (
            <div className={s.noticeCard}>
              <span className={s.noticeBadge}>2026년 적용 요율</span>
              <div>2025년 대비 주요 변경사항:</div>
              <ul>
                <li>국민연금 <strong>9% → 9.5%</strong> (0.5%p ↑, 1998년 이후 28년 만의 인상)</li>
                <li>건강보험 <strong>7.09% → 7.19%</strong> (0.1%p ↑)</li>
                <li>장기요양 <strong>0.9182% → 0.9448%</strong> (2.9% ↑)</li>
                <li>국민연금 기준소득월액 상한 <strong>{pensionPrev ? `${man(pensionPrev.max)} → ` : ''}{man(pensionPeriod.max)}원</strong> ({pensionLabel} · 매년 7월 조정)</li>
                <li>국민연금 기준소득월액 하한 <strong>{pensionPrev ? `${man(pensionPrev.min)} → ` : ''}{man(pensionPeriod.min)}원</strong></li>
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
                <label htmlFor="fi-emp-salary" className={s.subLabel}>직원 월 보수액 (원)</label>
                <div className={s.inputRow}>
                  <input id="fi-emp-salary" className={s.bigInput} type="text" inputMode="numeric" value={empSalary} onChange={e => setEmpSalary(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <label htmlFor="fi-emp-taxfree" className={s.subLabel}>비과세</label>
                <div className={s.inputRow}>
                  <input id="fi-emp-taxfree" className={s.smallInput} type="text" inputMode="numeric" value={empTaxFree} onChange={e => setEmpTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <label htmlFor="fi-headcount" className={s.subLabel}>직원 수</label>
                <div className={s.inputRow}>
                  <input id="fi-headcount" className={s.smallInput} type="number" inputMode="numeric" min="1" max="1000" step="1" value={headCount} onChange={e => setHeadCount(e.target.value)} />
                  <span className={s.unit}>명</span>
                </div>
              </div>
              <div>
                <label htmlFor="fi-bonus" className={s.subLabel}>연 상여 (선택)</label>
                <div className={s.inputRow}>
                  <input id="fi-bonus" className={s.smallInput} type="text" inputMode="numeric" value={bonus} onChange={e => setBonus(fmtComma(e.target.value))} />
                  <span className={s.unit}>원/연</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <span className={s.subLabel}>사업장 규모 (고용보험 사업주 추가 부담률)</span>
              <div className={s.choiceRow} role="group" aria-label="사업장 규모">
                <button type="button" aria-pressed={companySize === 'under150'} className={`${s.choiceBtn} ${companySize === 'under150'  ? s.choiceActive : ''}`} onClick={() => setCompanySize('under150')}>150인 미만<br /><small style={{ fontSize: 11 }}>+0.25%</small></button>
                <button type="button" aria-pressed={companySize === 'under1000'} className={`${s.choiceBtn} ${companySize === 'under1000' ? s.choiceActive : ''}`} onClick={() => setCompanySize('under1000')}>150~999인<br /><small style={{ fontSize: 11 }}>+0.65%</small></button>
                <button type="button" aria-pressed={companySize === 'over1000'} className={`${s.choiceBtn} ${companySize === 'over1000'  ? s.choiceActive : ''}`} onClick={() => setCompanySize('over1000')}>1,000인+<br /><small style={{ fontSize: 11 }}>+0.85%</small></button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label htmlFor="fi-industry" className={s.subLabel}>산재보험 업종 ({selectedIndustry.name} {effectiveWorkersRate}% + 출퇴근재해·임금채권 {WORKERS_EXTRA_RATE.toFixed(2)}%)</label>
              <select id="fi-industry" className={s.selectInput} value={industry} onChange={e => setIndustry(e.target.value)}>
                {industries.map(i => (
                  <option key={i.key} value={i.key}>{i.name} {i.key !== 'custom' ? `(${i.rate}%)` : ''}</option>
                ))}
              </select>
              {industry === 'custom' && (
                <div className={s.inputRow} style={{ marginTop: 8 }}>
                  <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="50" step="0.01" value={customWorkersRate} onChange={e => setCustomWorkersRate(e.target.value)} aria-label="산재보험 업종 요율 직접 입력 (%)" />
                  <span className={s.unit}>%</span>
                </div>
              )}
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>
                산재 요율은 직무가 아니라 사업장의 사업종류로 정해집니다. 정확한 요율은 근로복지공단 고지서에서 확인하세요.
              </p>
            </div>

            <div className={s.yearToggle} role="group" aria-label="적용 연도">
              <button type="button" aria-pressed={year === 2025} className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button type="button" aria-pressed={year === 2026} className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(empSalary) > 0 && (
            <div role="status" className={`${s.hero} ${s.heroEmployer}`}>
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
                      <th scope="col">항목</th>
                      <th scope="col" style={{ textAlign: 'right' }}>근로자</th>
                      <th scope="col" style={{ textAlign: 'right' }}>사업주</th>
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
              <span className={s.duruBadge}>두루누리 지원 대상</span>
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
                <label htmlFor="fi-hourly" className={s.subLabel}>시급 (원)</label>
                <div className={s.inputRow}>
                  <input id="fi-hourly" className={s.bigInput} type="text" inputMode="numeric" value={hourlyWage} onChange={e => setHourlyWage(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>주 근무시간: {weekHours}시간</span>
                <div className={s.sliderRow}>
                  <input type="range" min={1} max={40} step={1} value={weekHours} onChange={e => setWeekHours(Number(e.target.value))}
                    aria-label="주 근무시간" aria-valuetext={`주 ${weekHours}시간`} />
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
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                ① 1개월 이상 + 월 60시간 이상 → 국민·건강·고용 의무
                <span className={`${s.statusBadge} ${partTimeCalc.isOver60h ? s.statusYes : s.statusNo}`} style={{ marginLeft: 10 }}>
                  {partTimeCalc.isOver60h ? '✅ 의무' : '❌ 면제'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                ② 주 15시간 이상 → 주휴수당 발생
                <span className={`${s.statusBadge} ${partTimeCalc.isOver15h ? s.statusYes : s.statusNo}`} style={{ marginLeft: 10 }}>
                  {partTimeCalc.isOver15h ? '✅ 발생' : '❌ 없음'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                ③ 산재보험 → 모든 근로자 (시간 무관)
                <span className={`${s.statusBadge} ${s.statusOnly}`} style={{ marginLeft: 10 }}>✅ 항상 적용</span>
              </div>
            </div>
          </div>

          {/* HERO */}
          {parseComma(hourlyWage) > 0 && (
            <div role="status" className={`${s.hero} ${s.heroPartTime}`}>
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
                <p className={s.scenarioName}>{partTimeCalc.isOver60h ? '4대보험 가입 (월 60시간↑ 의무)' : '국민·건강·고용 미적용 (월 60시간 미만)'}</p>
                <div className={s.scenarioRow}><span>세전 월급</span><strong>{fmtKRW(partTimeCalc.withCoverage.gross)}</strong></div>
                <div className={s.scenarioRow}><span>4대보험 공제</span><strong>{partTimeCalc.withCoverage.deduction > 0 ? `−${fmtKRW(partTimeCalc.withCoverage.deduction)}` : '0원'}</strong></div>
                <div className={s.scenarioBig}><span>실수령</span><strong>{fmtKRW(partTimeCalc.withCoverage.net)}</strong></div>
              </div>
            </div>
          )}

          {/* 차액 + 혜택 */}
          {parseComma(hourlyWage) > 0 && partTimeCalc.isOver60h && (
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
          {parseComma(hourlyWage) > 0 && !partTimeCalc.isOver60h && (
            <div className={s.interpretCard}>
              월 근무시간이 60시간 미만이라 <strong>국민·건강·고용보험 가입 의무가 없습니다</strong>(근로자 공제 0원). 산재보험만 사업주가 부담합니다. 단, 월 60시간 이상이거나 3개월 이상 계속 근로 시 가입 대상이 될 수 있습니다.
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
                <label htmlFor="fi-fl-amount" className={s.subLabel}>월 지급액 (원)</label>
                <div className={s.inputRow}>
                  <input id="fi-fl-amount" className={s.bigInput} type="text" inputMode="numeric" value={flAmount} onChange={e => setFlAmount(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <label htmlFor="fi-fl-taxfree" className={s.subLabel}>비과세 (4대보험 시만)</label>
                <div className={s.inputRow}>
                  <input id="fi-fl-taxfree" className={s.smallInput} type="text" inputMode="numeric" value={flTaxFree} onChange={e => setFlTaxFree(fmtComma(e.target.value))} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>
            <div className={s.yearToggle} role="group" aria-label="적용 연도">
              <button type="button" aria-pressed={year === 2025} className={`${s.yearBtn} ${year === 2025 ? s.yearActive : ''}`} onClick={() => setYear(2025)}>2025년</button>
              <button type="button" aria-pressed={year === 2026} className={`${s.yearBtn} ${year === 2026 ? s.yearActive : ''}`} onClick={() => setYear(2026)}>2026년</button>
            </div>
          </div>

          {/* HERO */}
          {parseComma(flAmount) > 0 && (
            <div role="status" className={`${s.hero} ${s.heroFreelance}`}>
              <p className={s.heroLead}>공제 후 차이 <small style={{ fontWeight: 400, opacity: 0.85 }}>(근로자 소득세 차감 전)</small></p>
              <div>
                <span className={s.heroNum}>+{fmt(Math.round(Math.abs(freelanceCalc.diffNet)))}</span>
                <span className={s.heroUnit}>원/월</span>
              </div>
              <p className={s.heroSub}>
                {freelanceCalc.diffNet > 0 ? '프리랜서(3.3% 후)가 더 받음' : '근로자(4대보험 후)가 더 받음'}
                {' · '}<span className={s.heroSubAccent}>근로자 소득세 반영 시 격차 더 큼</span>
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
                <div className={s.scenarioRow}><span>소득세·지방세</span><strong>(추가 차감)</strong></div>
                <div className={s.scenarioBig}><span>4대보험 후*</span><strong>{fmtKRW(freelanceCalc.employee.net)}</strong></div>
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
                <span>공제 후 차이 <small style={{ color: 'var(--muted)' }}>(근로자 소득세 전)</small></span>
                <strong className={freelanceCalc.diffNet > 0 ? s.diffPositive : s.diffWarn}>
                  {freelanceCalc.diffNet > 0 ? '프리랜서 ' : '근로자 '}
                  +{fmtKRW(Math.abs(freelanceCalc.diffNet))}
                </strong>
              </div>
              <div className={s.diffRow}>
                <span>회사 부담 차이 (사업주 관점)</span>
                <strong className={s.diffPositive}>프리랜서 −{fmtKRW(freelanceCalc.diffCompanyCost)} 절감</strong>
              </div>
            </div>
          )}

          {parseComma(flAmount) > 0 && (
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: '2px 2px 0' }}>
              * 근로자 시나리오는 <strong style={{ color: 'var(--text)' }}>4대보험만 차감</strong>한 금액으로, 소득세·지방세(간이세액·연말정산)가 추가로 빠집니다. 두 방식 모두 연 1회 정산(프리랜서 5월 종소세 / 근로자 연말정산)이 있어 <strong style={{ color: 'var(--text)' }}>실제 세후 격차는 위 값보다 큽니다</strong>. 정확한 근로자 세후는 <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>에서 확인하세요.
            </p>
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
