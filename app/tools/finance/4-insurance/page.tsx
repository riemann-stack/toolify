import Link from 'next/link'
import FourInsuranceClient from './FourInsuranceClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import { todayStr } from '@/lib/date'
import {
  INSURANCE_RATES, PENSION_BASE_CURRENT, previousPensionBase, pensionBasePeriodLabel,
  WORKERS_COMP_INDUSTRIES, WORKERS_COMP_COMMUTE_PERMILLE, WAGE_CLAIM_LEVY_PERMILLE,
  PENSION_RATE_LAW, pensionTotalRateFor,
} from '@/lib/krInsuranceRates'
import { BENEFIT_DAYS_2019 } from '@/lib/krUnemployment'
import { calc4Insurance } from './fourInsuranceUtils'
import ToolPage from '@/components/ToolPage'

const R25 = INSURANCE_RATES[2025]
const R26 = INSURANCE_RATES[2026]

/* 산재보험 — lib 고시 요율(‰)에서 파생. 예시표는 금융·보험업(최저 요율 업종) 기준 */
const WC26 = WORKERS_COMP_INDUSTRIES[2026]
const WC_MIN = Math.min(...WC26.map(i => i.permille)) / 10          // %
const WC_MAX = Math.max(...WC26.map(i => i.permille)) / 10          // %
const WC_EXTRA = (WORKERS_COMP_COMMUTE_PERMILLE + WAGE_CLAIM_LEVY_PERMILLE) / 10 // 0.12%
const WC_FIN = (WC26.find(i => i.key === 'finance')?.permille ?? 5) / 10          // 0.5%
const WC_CONS = (WC26.find(i => i.key === 'construction')?.permille ?? 35) / 10   // 3.5%
const r4 = (n: number) => Math.round(n * 1e4) / 1e4

/* 국민연금 기준소득월액 상·하한 — lib 스케줄에서 빌드 시점 구간을 보간 (매년 7월 개정) */
const PB = PENSION_BASE_CURRENT
const PB_PREV = previousPensionBase(PB)
const PB_LABEL = pensionBasePeriodLabel(PB)
const man = (v: number) => `${(v / 10_000).toLocaleString('ko-KR')}만`
const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`
/** 장기요양 요율을 '건강보험료 대비 %'로 환산 (0.9448 ÷ 7.19 = 13.14%) */
const ltcOfHealth = (r: typeof R26) => (Math.round(r.ltc.rateOfSalary / r.health.total * 1e4) / 100).toFixed(2)

/* ── 계산 예시 — 도구 엔진(calc4Insurance)으로 빌드 시 계산: 월 300만원 · 비과세 0 · 150인 미만 · 금융·보험업 ── */
const SAMPLE = 3_000_000
const calcAt = (year: 2025 | 2026, salary: number, taxFree = 0, wcRate = WC_FIN + WC_EXTRA) =>
  calc4Insurance({ monthlySalary: salary, taxFreeAmount: taxFree, workersCompRate: wcRate, companySize: 'under150', year, pensionPeriod: PB })
const EX = calcAt(2026, SAMPLE)
const EX25 = calcAt(2025, SAMPLE)
const EMP_UP = EX.employeeTotal - EX25.employeeTotal
const EMP_UP_TF = calcAt(2026, SAMPLE, 200_000).employeeTotal - calcAt(2025, SAMPLE, 200_000).employeeTotal
const WC_CONS_AMT = calcAt(2026, SAMPLE, 0, WC_CONS + WC_EXTRA).workersEmpr
const EMP_RATE_26 = r4(R26.pension.employee + R26.health.employee + R26.ltc.employee + R26.unemp.employee) // 근로자 부담 합계 %

/* 국민연금 법정 단계 인상 (2026 9.5% → 2033 13%) — lib 스케줄 */
const PENSION_STEPS = Array.from({ length: PENSION_RATE_LAW.finalYear - 2026 + 1 }, (_, i) => 2026 + i)
  .map(y => ({ y, total: pensionTotalRateFor(y) }))

/* 두루누리 예시 — 월 250만원 근로자 본인 부담분(국민연금 + 고용보험)의 80% */
const DURU = calcAt(2026, 2_500_000)
const DURU_EMP = DURU.pensionEmp + DURU.unempEmp

/* 구직급여 소정급여일수 범위 (2019.10 이후 이직자) */
const UI_DAYS = Object.values(BENEFIT_DAYS_2019).flatMap(o => Object.values(o))
const UI_MIN = Math.min(...UI_DAYS), UI_MAX = Math.max(...UI_DAYS)

export const metadata = buildMetadata({
  path: '/tools/finance/4-insurance',
  title: '4대보험 계산기 — 국민연금·건강보험·고용보험·산재보험 (2026년)',
  description: '국민연금·건강보험·고용·산재 — 근로자/사업주 부담을 한눈에. 알바·프리랜서 3.3% 비교, 두루누리 지원 안내와 2026년 최신 요율 자동 반영.',
  keywords: ['4대보험계산기', '4대보험요율', '국민연금계산', '건강보험계산', '고용보험', '산재보험', '4대보험 사업주부담', '알바 4대보험', '프리랜서 3.3%', '두루누리'],
})

const FAQ_LD = [
              {
                q: '2026년 4대보험 요율은 얼마나 인상되었나요?',
                a: `2026년에는 <strong>국민연금이 ${R25.pension.total}%에서 ${R26.pension.total}%로 ${r4(R26.pension.total - R25.pension.total)}%p 인상</strong>되어 ${PENSION_RATE_LAW.flatSinceYear}년 이후 ${2026 - PENSION_RATE_LAW.flatSinceYear}년 만에 요율이 바뀌었습니다(${PENSION_RATE_LAW.finalYear}년 ${PENSION_RATE_LAW.finalTotal}%까지 매년 ${PENSION_RATE_LAW.stepTotal}%p 단계 인상). 건강보험은 ${R25.health.total}%에서 ${R26.health.total}%로, 장기요양보험은 보수 대비 ${R25.ltc.rateOfSalary}%에서 ${R26.ltc.rateOfSalary}%로 올랐고, 고용보험(실업급여)은 ${r4(R26.unemp.employee + R26.unemp.employer)}%로 동결되었습니다. 산재보험은 업종별로 고시됩니다. 월급 300만원(비과세 없음) 기준 근로자 부담은 월 약 ${won(Math.round(EMP_UP / 100) * 100)} 늘어납니다(국민연금 +${won(EX.pensionEmp - EX25.pensionEmp)} 포함 · 비과세 20만원이면 약 ${won(Math.round(EMP_UP_TF / 100) * 100)}).`,
              },
              {
                q: '직원 1명 채용 시 회사가 실제 부담하는 금액은 얼마인가요?',
                a: `월급 300만원 직원이면 회사는 <strong>월 약 ${man(Math.round(EX.employerTotal / 10_000) * 10_000)}원의 4대보험을 추가 부담</strong>합니다(150인 미만·금융·보험업 기준). 국민연금 ${won(EX.pensionEmpr)}, 건강보험 ${won(EX.healthEmpr)}, 장기요양 ${won(EX.ltcEmpr)}, 고용보험(실업급여 + 고용안정·직업능력개발) ${won(EX.unempEmpr)}에 산재보험 ${won(EX.workersEmpr)}(출퇴근재해·임금채권부담금 포함 ${r4(WC_FIN + WC_EXTRA)}%)이 더해집니다. 산재 요율이 높은 건설업(${r4(WC_CONS + WC_EXTRA)}%)이면 산재보험만 약 ${won(Math.round(WC_CONS_AMT / 100) * 100)}입니다. 금융·보험업 기준 회사 총 인건비는 월 약 ${man(Math.round(EX.companyTotalCost / 10_000) * 10_000)}원, 연 약 ${man(Math.round(EX.companyTotalCost * 12 / 10_000) * 10_000)}원이며, 퇴직금·연차수당·상여는 별도입니다.`,
              },
              {
                q: '알바도 4대보험에 의무 가입해야 하나요?',
                a: '근로시간이 기준이 됩니다. <strong>월 60시간(주 15시간) 이상 일하는 알바는 국민연금·건강보험·고용보험 가입 대상</strong>이고, 산재보험은 근로시간과 관계없이 모든 근로자에게 적용됩니다. 월 60시간 미만 초단시간 근로자는 국민연금·건강보험이 원칙적으로 제외되고(본인 희망 가입 등 예외 있음), 고용보험도 원칙적으로 제외되지만 <strong>3개월 이상 계속 일하거나 일용근로자라면 고용보험이 적용</strong>됩니다. 즉 하루·며칠 단위 일용직 알바도 고용보험은 신고 대상입니다. 주 15시간 이상이면 주휴수당도 발생하니 급여 계산 시 함께 확인하세요.',
              },
              {
                q: '프리랜서 3.3%와 4대보험 급여 중 어느 게 유리한가요?',
                a: `같은 금액을 받는다면 떼는 비율만 보면 프리랜서가 유리해 보입니다. 프리랜서는 3.3%(사업소득세 3% + 지방소득세 0.3%)만 원천징수되고, 근로자는 2026년 기준 4대보험만 약 ${EMP_RATE_26.toFixed(2)}%가 빠집니다(차이 약 ${r4(EMP_RATE_26 - 3.3).toFixed(1)}%p, 근로자는 소득세 별도). 하지만 <strong>프리랜서는 5월 종합소득세 신고로 세금을 다시 정산</strong>하고, 국민연금·건강보험을 지역가입자로 따로 내며, 퇴직금·연차·실업급여를 받기 어렵습니다. 반대로 근로자는 회사가 연금·건강보험의 절반, 고용보험의 절반 이상(고용안정·직업능력개발분 포함), 산재보험 전액을 부담해 줍니다. 계약 형식보다 실제 일하는 방식(출퇴근·업무 지시·전속성)이 근로자라면 근로자로 인정된다는 점도 기억하세요.`,
              },
              {
                q: '두루누리 사회보험료 지원은 어떻게 신청하나요?',
                a: `두루누리는 <strong>근로자 10명 미만 사업장</strong>에서 월평균보수가 고시 기준액 미만인 <strong>신규 가입 근로자</strong>의 국민연금·고용보험료 <strong>80%를 최대 36개월</strong> 지원하는 제도입니다(이 계산기는 월 270만원 미만을 대상 여부 표시에 씁니다). 신규 가입자는 지원 신청일 직전 6개월간 국민연금·고용보험 사업장 가입 이력이 없는 근로자를 말하고, 재산·종합소득이 일정 기준 이상이면 지원에서 빠집니다. 사업주가 4대보험 취득신고를 할 때 함께 신청하면 되며, 기준액과 제외 요건은 해마다 바뀔 수 있으니 두루누리 누리집이나 국민연금공단(1355)·근로복지공단(1588-0075)에서 확인하세요. 예: 월 250만원 신규 근로자면 본인 부담 국민연금 ${won(DURU.pensionEmp)} + 고용보험 ${won(DURU.unempEmp)} 중 약 ${won(DURU_EMP * 0.8)}을 지원받습니다.`,
              },
              {
                q: '월급에서 비과세 식대는 4대보험 계산에서 빠지나요?',
                a: `네. 4대보험료는 비과세 소득을 뺀 보수를 기준으로 매기므로 식대(월 20만원 이내) 같은 비과세 수당은 제외됩니다. 이 계산기의 「비과세」 칸에 넣으면 국민연금·건강·장기요양·고용·산재보험 모두 줄어든 보수로 계산됩니다. 월급 300만원 중 20만원이 비과세면 근로자 부담 4대보험은 월 ${won(calcAt(2026, SAMPLE, 200_000).employeeTotal)}으로, 비과세가 없을 때(${won(EX.employeeTotal)})보다 약 ${won(Math.round((EX.employeeTotal - calcAt(2026, SAMPLE, 200_000).employeeTotal) / 10) * 10)} 적습니다.`,
              },
            ]

export default function FourInsurancePage() {
  return (
    <ToolPage width={760} slug="/tools/finance/4-insurance">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />4대보험 계산기
      </h1>
      <p className="tp-lead">
        국민연금·건강·고용·산재 — 근로자/사업주 부담 정확히. <strong style={{ color: 'var(--text)' }}>알바·프리랜서 비교</strong>까지.
      </p>

      <UpdatedMeta date="2026년 9월" basis={`2026년 4대보험 요율·국민연금 기준소득월액 상·하한(${PB_LABEL}) 기준`} sources={[{"label":"4대 사회보험 정보연계센터","href":"https://www.4insure.or.kr"},{"label":"국민연금공단","href":"https://www.nps.or.kr"},{"label":"국민건강보험공단","href":"https://www.nhis.or.kr"},{"label":"고용노동부(산재보험료율 고시)","href":"https://www.moel.go.kr"},{"label":"국가법령정보센터 — 고용보험법","href":"https://www.law.go.kr/법령/고용보험법"},{"label":"두루누리 사회보험료 지원","href":"https://insurancesupport.or.kr"}]} />

      {/* buildDate: SSG와 hydration이 같은 기준일을 쓰도록 빌드 시점 날짜를 전달 (FourInsuranceClient useAsOfDate 참고) */}
      <FourInsuranceClient buildDate={todayStr()} />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 2026 요율 한눈에 ── */}
        <div>
          <h2 className="g-h2">
            2026년 4대보험 요율 한눈에 보기
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['보험', '총 요율', '근로자', '사업주'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '국민연금',          c: 'var(--sky-500)', t: `${R26.pension.total}%`,  e: `${R26.pension.employee}%`,  r: `${R26.pension.employer}%` },
                  { n: '건강보험',          c: 'var(--red-600)', t: `${R26.health.total}%`, e: `${R26.health.employee}%`, r: `${R26.health.employer}%` },
                  { n: '장기요양보험*',     c: 'var(--orange-600)', t: `${R26.ltc.rateOfSalary}%`, e: `${R26.ltc.employee}%`, r: `${R26.ltc.employer}%` },
                  { n: '고용보험 (실업급여)', c: 'var(--cyan-600)', t: `${r4(R26.unemp.employee + R26.unemp.employer)}%`,  e: `${R26.unemp.employee}%`,  r: `${R26.unemp.employer}%` },
                  { n: '고용보험 (고용안정·직업능력개발)', c: 'var(--cyan-600)', t: `${R26.unemp.extra.under150}~${R26.unemp.extra.over1000}%`, e: '0%', r: `${R26.unemp.extra.under150}~${R26.unemp.extra.over1000}%` },
                  { n: '산재보험',          c: 'var(--yellow-700)', t: `업종별 ${WC_MIN}~${WC_MAX}% 등`, e: '0%', r: '100%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, boxShadow: `inset 3px 0 0 0 ${r.c}`, paddingLeft: 16 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            * 장기요양보험은 보수월액 기준 {R26.ltc.rateOfSalary}% (건강보험료의 약 {ltcOfHealth(R26)}%로 환산)<br />
            * 고용안정·직업능력개발 요율은 150인 미만 {R26.unemp.extra.under150}%, 150인 이상 우선지원대상기업 0.45%, 150인 이상 1,000인 미만 {R26.unemp.extra.under1000}%, 1,000인 이상 {R26.unemp.extra.over1000}%로 사업주만 냅니다(계산기는 우선지원대상기업 구간을 따로 두지 않았습니다).<br />
            * 산재보험은 사업종류별 고시 요율(예: 금융·보험업 {WC_FIN}%, 건설업 {WC_CONS}%)에 출퇴근재해 {WORKERS_COMP_COMMUTE_PERMILLE / 10}%가 더해지고, 임금채권부담금 {WAGE_CLAIM_LEVY_PERMILLE / 10}%도 사업주가 함께 냅니다. 광업·임업 등 고위험 업종은 요율이 더 높습니다.
          </p>
        </div>

        {/* ── 2. 2026 변경사항 ── */}
        <div>
          <h2 className="g-h2">
            2026년 4대보험 변경사항
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '2025년', '2026년', '변화'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '국민연금 (합계)', a: `${R25.pension.total}%`, b: `${R26.pension.total}%`, d: `+${r4(R26.pension.total - R25.pension.total)}%p` },
                  { k: '건강보험 (합계)', a: `${R25.health.total}%`, b: `${R26.health.total}%`, d: `+${r4(R26.health.total - R25.health.total)}%p` },
                  { k: '장기요양 (보수 대비)', a: `${R25.ltc.rateOfSalary}%`, b: `${R26.ltc.rateOfSalary}%`, d: `건보료의 ${ltcOfHealth(R25)}% → ${ltcOfHealth(R26)}%` },
                  { k: '고용보험 실업급여 (합계)', a: `${r4(R25.unemp.employee + R25.unemp.employer)}%`, b: `${r4(R26.unemp.employee + R26.unemp.employer)}%`, d: '동결' },
                  { k: '산재보험 평균 요율', a: `${R25.workersCompAvg}%`, b: `${R26.workersCompAvg}%`, d: '업종별 고시' },
                  ...(PB_PREV ? [
                    { k: '국민연금 기준소득월액 상한', a: `${man(PB_PREV.max)}원`, b: `${man(PB.max)}원`, d: `${PB_LABEL} 적용` },
                    { k: '국민연금 기준소득월액 하한', a: `${man(PB_PREV.min)}원`, b: `${man(PB.min)}원`, d: '매년 7월 조정' },
                  ] : []),
                ].map((r, i) => (
                  <tr key={r.k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            국민연금 요율은 {PENSION_RATE_LAW.flatSinceYear}년부터 {R25.pension.total}%로 묶여 있다가 2026년 1월에 처음 올랐고, 기준소득월액 상·하한은 요율과 달리 매년 7월에 바뀝니다. 그래서 같은 해 안에서도 1~6월과 7~12월의 국민연금 상한 적용액이 다를 수 있습니다. 계산기는 오늘 날짜에 적용되는 상·하한 구간을 자동으로 고릅니다.
          </p>
        </div>

        {/* ── 3. 국민연금 단계 인상 ── */}
        <div>
          <h2 className="g-h2">국민연금 보험료율 단계 인상 일정</h2>
          <p className="g-p">
            2025년 국민연금법 개정으로 보험료율은 2026년 {R26.pension.total}%에서 매년 {PENSION_RATE_LAW.stepTotal}%p씩 올라 {PENSION_RATE_LAW.finalYear}년 {PENSION_RATE_LAW.finalTotal}%에서 멈춥니다. 근로자와 회사가 절반씩 부담하므로 월급 300만원 근로자의 본인 부담이 연도별로 어떻게 달라지는지 계산했습니다(기준소득월액 상·하한 안쪽이라 상한 조정의 영향은 없음).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연도', '총 요율', '근로자 부담', '월 300만원 본인 부담'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PENSION_STEPS.map((r, i) => (
                  <tr key={r.y} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.y}년</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.total}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r4(r.total / 2)}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }}>{won(SAMPLE * r.total / 200)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 보험별 가이드 ── */}
        <div>
          <h2 className="g-h2">
            보험별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { n: '국민연금',     c: 'var(--sky-500)', d: `만 18세 이상 60세 미만 근로자가 사업장가입자. 노령연금은 출생연도에 따라 만 63~65세(1969년생부터 65세)에 받기 시작. 기준소득월액 ${man(PB.min)}~${man(PB.max)}원(${PB_LABEL}).` },
              { n: '건강보험',     c: 'var(--red-600)', d: '직장가입자는 회사와 절반씩 부담, 자영업자는 지역가입자. 소득 요건을 채운 가족은 피부양자로 등록 가능. 매년 4월 전년도 보수 기준으로 보험료를 정산.' },
              { n: '장기요양보험', c: 'var(--orange-600)', d: '65세 이상 또는 노인성 질병이 있는 사람이 등급 판정을 받으면 방문요양·요양시설 급여. 건강보험료와 함께 부과.' },
              { n: '고용보험',     c: 'var(--cyan-600)', d: `비자발적 이직 시 구직급여(가입기간·나이에 따라 ${UI_MIN}~${UI_MAX}일), 출산전후휴가·육아휴직 급여, 국민내일배움카드 등 직업훈련 지원.` },
              { n: '산재보험',     c: 'var(--yellow-700)', d: '사업주가 100% 부담. 업무상 재해·질병을 보장하며 2018년부터 출퇴근 재해도 포함. 단시간·일용 근로자도 적용.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.n}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 직원 1명 채용 시 회사 부담 ── */}
        <div>
          <h2 className="g-h2">
            직원 1명 채용 시 회사 실제 부담
          </h2>
          <p className="g-p">
            월급 {man(SAMPLE)}원 · 비과세 없음 · 150인 미만 · 금융·보험업 기준으로 계산기 「사업주」 탭과 같은 식을 돌린 결과입니다. 근로자와 회사가 각각 얼마를 내는지 나란히 보면 회사 부담이 왜 더 큰지 드러납니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '근로자', '사업주'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { i: `국민연금 (${R26.pension.employee}%씩)`, e: EX.pensionEmp, r: EX.pensionEmpr },
                  { i: `건강보험 (${R26.health.employee}%씩)`, e: EX.healthEmp, r: EX.healthEmpr },
                  { i: `장기요양 (${R26.ltc.employee}%씩)`, e: EX.ltcEmp, r: EX.ltcEmpr },
                  { i: `고용보험 (${R26.unemp.employee}% / ${r4(R26.unemp.employer + R26.unemp.extra.under150)}%)`, e: EX.unempEmp, r: EX.unempEmpr },
                  { i: `산재보험 (${WC_FIN}% + ${WC_EXTRA}%)`, e: 0, r: EX.workersEmpr },
                  { i: '4대보험 합계', e: EX.employeeTotal, r: EX.employerTotal, a: true },
                ].map((row, i) => (
                  <tr key={row.i} style={{ borderBottom: '1px solid var(--border)', background: row.a ? 'var(--accent-dim)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: row.a ? 'var(--accent-ink)' : 'var(--text)', fontWeight: row.a ? 800 : 600 }}>{row.i}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: row.a ? 'var(--accent-ink)' : 'var(--text)', fontWeight: row.a ? 800 : 600, whiteSpace: 'nowrap' }}>{won(row.e)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: row.a ? 'var(--accent-ink)' : 'var(--text)', fontWeight: row.a ? 800 : 600, whiteSpace: 'nowrap' }}>{won(row.r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            근로자는 월 {won(EX.employeeTotal)}을 떼여 4대보험 공제 후 {won(EX.netSalary)}을 받고(소득세 별도), 회사는 월급에 {won(EX.employerTotal)}을 더해 <strong>월 약 {won(Math.round(EX.companyTotalCost / 10) * 10)}, 연 약 {man(Math.round(EX.companyTotalCost * 12 / 10_000) * 10_000)}원</strong>을 씁니다. 월급의 약 {(EX.employerTotal / SAMPLE * 100).toFixed(1)}%가 회사 몫 보험료이고, 퇴직금(연 1개월분 수준)·연차수당·상여는 여기에 포함되지 않습니다.
          </p>
          <p className="g-p">
            계산 순서는 ① 월급에서 비과세 수당을 빼 보수월액을 구하고 ② 국민연금만 기준소득월액 상·하한({man(PB.min)}~{man(PB.max)}원)으로 자른 뒤 ③ 각 요율을 곱하는 방식입니다. 실제 고지서는 보험마다 10원 미만을 절사합니다. 또 건강·고용·산재보험은 신고한 보수로 먼저 매긴 뒤 다음 해에 실제 받은 보수로 정산하고, 국민연금은 정산 대신 매년 7월 기준소득월액을 다시 정하므로 계산기 값과 몇십 원~몇만 원 차이가 날 수 있습니다.
          </p>
        </div>

        {/* ── 6. 두루누리 지원 ── */}
        <div>
          <h2 className="g-h2">
            두루누리 사회보험료 지원
          </h2>
          <p className="g-p">
            소규모 사업장의 저임금 근로자와 사업주가 내는 국민연금·고용보험료 일부를 나라에서 지원하는 제도입니다. 요건은 해마다 조정되므로 신청 전 두루누리 누리집에서 해당 연도 기준을 확인하세요.
          </p>
          <ul className="g-list">
            <li><strong>사업장</strong> — 근로자 10명 미만</li>
            <li><strong>근로자</strong> — 월평균보수가 고시 기준액 미만(이 계산기는 270만원 미만을 대상 표시 기준으로 사용)</li>
            <li><strong>신규 가입자</strong> — 지원 신청일 직전 6개월간 국민연금·고용보험 사업장 가입 이력이 없는 근로자</li>
            <li><strong>지원 내용</strong> — 국민연금·고용보험료의 80%, 최대 36개월 (재산·종합소득이 기준 이상이면 제외)</li>
            <li><strong>신청</strong> — 4대보험 취득신고 때 함께 신청 · 국민연금공단 1355, 근로복지공단 1588-0075</li>
          </ul>
          <p className="g-p">
            예를 들어 월 250만원 신규 근로자라면 본인 부담 국민연금 {won(DURU.pensionEmp)}과 고용보험 {won(DURU.unempEmp)}을 합한 {won(DURU_EMP)} 가운데 약 {won(DURU_EMP * 0.8)}을 매달 지원받습니다. 사업주 부담분도 따로 지원되므로, 직원을 새로 뽑는 소상공인은 채용 비용을 따질 때 이 금액을 빼고 계산하는 것이 맞습니다.
          </p>
        </div>

        {/* ── 7. 알바 의무 가입 ── */}
        <div>
          <h2 className="g-h2">
            알바 4대보험 의무 가입 기준
          </h2>
          <p className="g-p">
            알바·단시간 근로자는 보험마다 적용 기준이 조금씩 다릅니다. 흔히 &lsquo;월 60시간 미만이면 4대보험 없음&rsquo;으로 알지만, 고용보험과 산재보험은 예외가 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['보험', '가입 대상', '주요 적용 제외'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['국민연금', '만 18세 이상 60세 미만 근로자', '월 60시간 미만 단시간 근로자(본인 희망 가입 등 예외 있음), 1개월 미만 일용근로자(1개월 이상 이어지며 월 8일 이상 등 요건을 채우면 가입)'],
                  ['건강보험', '모든 근로자', '월 60시간 미만 단시간 근로자, 1개월 미만 일용근로자'],
                  ['고용보험', '모든 근로자', '월 60시간(주 15시간) 미만 — 단, 3개월 이상 계속 근로하거나 일용근로자면 적용'],
                  ['산재보험', '근로시간·기간과 무관하게 모든 근로자', '없음(사업주 100% 부담)'],
                ].map(([k, who, ex], i) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{who}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기의 「알바」 탭은 주당 근무시간 × 4.345주로 월 근로시간을 추정해 60시간 이상이면 국민연금·건강·고용보험 공제를 넣고, 60시간 미만이면 공제 없이 보여 줍니다. 일용직이거나 3개월 넘게 일할 예정이라면 60시간 미만이어도 고용보험료(월 보수의 {R26.unemp.employee}%)는 빠진다고 보고 계산하세요. 주 15시간 이상이면 주휴수당이 붙어 월급 자체가 커지는 점도 탭에 반영되어 있습니다.
          </p>
        </div>

        {/* ── 8. 프리랜서 vs 4대보험 ── */}
        <div>
          <h2 className="g-h2">
            프리랜서 3.3% vs 근로자 4대보험 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'color-mix(in srgb, var(--purple-600) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--purple-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--purple-600)', fontWeight: 700, marginBottom: 8 }}>프리랜서 (사업소득자)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>원천징수 3.3% (사업소득세 3% + 지방소득세 0.3%)</li>
                <li>5월 종합소득세 신고로 세금 정산</li>
                <li>필요경비 공제 가능 (장부·증빙 필요)</li>
                <li>국민연금·건강보험은 지역가입자로 본인이 전액 부담</li>
                <li>예술인·노무제공자(특고)는 고용보험 적용 대상(노무제공자는 산재보험도 적용, 예술인 산재는 임의가입)</li>
              </ul>
            </div>
            <div style={{ background: 'color-mix(in srgb, var(--accent) 4%, transparent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>근로자 (4대보험)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>4대보험 본인 부담 약 {EMP_RATE_26.toFixed(1)}% (2026년)</li>
                <li>소득세 별도 (간이세액표로 매월 원천징수 → 연말정산)</li>
                <li>국민연금·건강보험 절반과 산재보험 전액을 회사가 부담</li>
                <li>퇴직금·연차·해고 제한 등 근로기준법 보호</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="warn" title="위장 프리랜서(가짜 3.3%) 주의">
              출퇴근 시간이 정해져 있고 회사의 업무 지시를 받는 등 실질이 근로자라면, 계약서가 프리랜서 계약이어도 근로자로 인정되어 4대보험·퇴직금·연차 대상이 됩니다. 의심되면 고용노동부 고객상담센터 <strong>1350</strong> 또는 노무사 상담을 권장합니다.
            </Callout>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',     icon: '💰', name: '연봉 실수령액 계산기',  desc: '2026년 기준 세후 월 실수령액' },
              { href: '/tools/finance/installment',icon: '💳', name: '카드 할부 계산기',      desc: '월 납부액·일시불 vs 무이자 비교' },
              { href: '/tools/finance/vat',        icon: '🧾', name: '부가세 계산기',         desc: '공급가액·부가세 역산 계산' },
              { href: '/tools/finance/cost-rate',  icon: '🍽️', name: '음식점 원가율 계산기',    desc: '재료비·배달 수수료·실질 원가율' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',  desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',       desc: '원리금균등·원금균등 비교' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
