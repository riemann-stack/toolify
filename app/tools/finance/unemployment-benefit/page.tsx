import Link from 'next/link'
import UnemploymentClient from './UnemploymentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import Callout from '@/components/Callout'
import { minHourlyWageFor, MONTHLY_WORK_HOURS, WORK_HOURS_WEEK } from '@/lib/krInsuranceRates'
import { todayStr } from '@/lib/date'
import {
  avgDailyFromMonthly,
  BENEFIT_DAYS_2019,
  calcUnemploymentFromWages,
  COVERAGE_BRACKETS,
  ordinaryDailyFromMonthly,
  UI_BENEFIT_RATE,
  UI_CAP_CONFIRMED_THROUGH,
  UI_DAILY_WORK_HOURS,
  UI_DAILY_CAP_2026,
  UI_DAILY_FLOOR_2026,
  UI_WAGE_DAILY_CAP_2026,
  uiDailyCapFor,
  uiDailyFloor,
  type AgeGroup,
} from '@/lib/krUnemployment'
import ToolPage from '@/components/ToolPage'

const won = (n: number) => n.toLocaleString('ko-KR')

export const metadata = buildMetadata({
  path: '/tools/finance/unemployment-benefit',
  title: '실업급여 계산기 — 2026 구직급여 1일액·소정급여일수·총수급액',
  description:
    `퇴직 전 3개월 급여와 나이·고용보험 가입기간으로 2026년 실업급여 하루 얼마·며칠·총 얼마인지 계산합니다. 상한 ${won(UI_DAILY_CAP_2026)}원·하한 ${won(UI_DAILY_FLOOR_2026)}원, 통상임금 비교·이직일 연도별 하한 반영.`,
  keywords: [
    '실업급여 계산기',
    '2026 실업급여',
    '구직급여 상한액',
    '소정급여일수',
    '실업급여 하루 얼마',
    '고용보험 실업급여',
    '실업급여 모의계산',
    '실업급여 며칠',
  ],
})

/* 월급별 예시 — 계산기와 같은 함수로 빌드 시 계산. 만 35세·가입 1~3년·1일 8시간·90일, 월급 = 고정급(통상임금) 가정.
   기초일액 = max(평균임금일액, 1일 통상임금) — 고용보험법 §45② (계산기 '전부 고정급' 체크와 같은 경로). 마지막 열은 같은 사람의 2027년 이직(상·하한 연도만 바꿈). */
const EX_AGE = 35
const EX_MONTHS = 24
const EX_DAYS = BENEFIT_DAYS_2019.under50.y1to3
const NEXT_YEAR = 2027
const rowFor = (m: number, year = 2026, fixed = true) =>
  calcUnemploymentFromWages({
    avgDaily: avgDailyFromMonthly(m),
    ordinaryDaily: fixed ? ordinaryDailyFromMonthly(m) : 0,
    age: EX_AGE, disabled: false, totalMonths: EX_MONTHS, year,
  })
/* 60%가 그대로 적용되는 기초일액 구간 */
const PASS_LOW_DAILY = Math.ceil(UI_DAILY_FLOOR_2026 / UI_BENEFIT_RATE)
const PASS_HIGH_DAILY = Math.floor(UI_DAILY_CAP_2026 / UI_BENEFIT_RATE)
/* 고정급 월급제: 기초일액 = 월급 × 8 ÷ 209 → 월급 환산 */
const PASS_LOW_MONTH = Math.ceil((PASS_LOW_DAILY * MONTHLY_WORK_HOURS) / UI_DAILY_WORK_HOURS)
const PASS_HIGH_MONTH = Math.floor((PASS_HIGH_DAILY * MONTHLY_WORK_HOURS) / UI_DAILY_WORK_HOURS)
/* 변동급이 커서 평균임금일액이 기초일액일 때: 3개월 임금을 30일 기준 월액으로 환산 */
const PASS_LOW_MONTH_AVG = PASS_LOW_DAILY * 30
const PASS_HIGH_MONTH_AVG = PASS_HIGH_DAILY * 30
const PASS_MID_MONTH = Math.round((PASS_LOW_MONTH + PASS_HIGH_MONTH) / 2 / 10_000) * 10_000
const WAGE_ROWS = [...new Set([2_000_000, PASS_MID_MONTH, 3_000_000, 4_000_000, 6_000_000])]
  .sort((a, b) => a - b)
  .map(m => ({ m, r: rowFor(m), next: rowFor(m, NEXT_YEAR) }))
/* FAQ '월급 300만원' — 고정급(§45② 통상임금 비교) vs 변동급이 섞여 평균임금일액만 쓰는 경우 */
const R300 = rowFor(3_000_000)
const R300_AVG = rowFor(3_000_000, 2026, false)
const R300_NEXT = rowFor(3_000_000, NEXT_YEAR)
const capWord = (c: 'upper' | 'lower' | 'none') => (c === 'upper' ? '상한액' : c === 'lower' ? '하한액' : '60% 그대로')
/* 2027년 이직자 — 하한은 2027 최저시급(고시)으로, 상한은 미고시라 2026 값 유지(lib UI_WAGE_CAP_SCHEDULE) → 하한이 상한을 넘는다 */
const MIN_WAGE_2027 = minHourlyWageFor(NEXT_YEAR)
const FLOOR_2027 = uiDailyFloor(UI_DAILY_WORK_HOURS, NEXT_YEAR)
const CAP_2027 = uiDailyCapFor(NEXT_YEAR)
const CAP_2027_CONFIRMED = NEXT_YEAR <= UI_CAP_CONFIRMED_THROUGH
/* 2026 인상 전 1일 상한(2019.10~2025 이직자) */
const CAP_PREV = uiDailyCapFor(2025)
/* 만원 단위 구간 표시 — 하한은 올림·상한은 내림해 표시 구간이 실제 구간 안에 들도록 (반올림하면 297만처럼 구간 밖 값이 나옴) */
const manCeil = (n: number) => `${Math.ceil(n / 10_000).toLocaleString('ko-KR')}만`
const manFloor = (n: number) => `${Math.floor(n / 10_000).toLocaleString('ko-KR')}만`

const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  under50: '50세 미만',
  '50plus': '50세 이상 · 장애인',
}
const AGE_GROUPS: AgeGroup[] = ['under50', '50plus']
const BRACKET_SHORT: Record<string, string> = {
  lt1: '1년 미만',
  y1to3: '1~3년',
  y3to5: '3~5년',
  y5to10: '5~10년',
  y10plus: '10년+',
}

const FAQ_LD = [
  {
    q: '2026년 실업급여는 하루 얼마인가요? (상한·하한)',
    a: `2026년 1일 구직급여 <strong>상한액은 ${won(UI_DAILY_CAP_2026)}원</strong>, <strong>하한액은 ${won(UI_DAILY_FLOOR_2026)}원</strong>입니다. 본인 기초일액(이직 전 3개월 평균임금일액, 1일 통상임금이 더 크면 통상임금)의 60%로 계산하되 이 상·하한 사이로 정해집니다. 상한은 2019년(${won(CAP_PREV)}원) 이후 7년 만에 올랐는데, 최저임금 인상으로 2026년 하한이 옛 상한보다 높아지는 역전을 막기 위해서였습니다. 하한은 최저임금에 연동됩니다(최저시급 × 이직 전 1일 소정근로시간 × 80%). ${won(UI_DAILY_FLOOR_2026)}원은 하루 8시간 근무 기준이고, 하루 4시간 근무했다면 하한도 절반인 ${won(uiDailyFloor(4))}원입니다. 두 값의 폭이 ${won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}원으로 좁아, 실제로는 대부분 상한 또는 하한 부근에서 결정됩니다. 상·하한은 <strong>이직일이 속한 해</strong> 기준이라, ${NEXT_YEAR}년에 이직하면 하한이 ${NEXT_YEAR}년 최저시급(${won(MIN_WAGE_2027)}원)으로 계산돼 8시간 기준 ${won(FLOOR_2027)}원이 됩니다${FLOOR_2027 > CAP_2027 ? `. 이는 ${CAP_2027_CONFIRMED ? `${NEXT_YEAR}년` : '현행'} 상한 ${won(CAP_2027)}원보다 높아, 상한이 따로 조정되지 않으면 하한이 지급됩니다` : ''}.`,
  },
  {
    q: '실업급여는 한 달에 얼마 받나요?',
    a: `구직급여는 1일액 기준이라 한 달(30일)이면 1일액 × 30입니다. 하한액(${won(UI_DAILY_FLOOR_2026)}원)이면 약 <strong>${won(UI_DAILY_FLOOR_2026 * 30)}원</strong>, 상한액(${won(UI_DAILY_CAP_2026)}원)이면 약 <strong>${won(UI_DAILY_CAP_2026 * 30)}원</strong>입니다. 다만 매달 정확히 30일치가 지급되는 게 아니라 실업인정일 사이의 일수만큼 지급되므로, 위 금액은 참고용 월 환산치입니다.`,
  },
  {
    q: '자발적으로 퇴사해도 실업급여를 받을 수 있나요?',
    a: '원칙적으로 자발적 퇴사는 구직급여 대상이 아니지만, <strong>정당한 사유의 자발적 퇴사</strong>(예: 임금 체불, 통근 곤란, 질병, 사업장 이전 등 법령이 정한 사유)는 예외적으로 인정될 수 있습니다. 이 계산기는 <strong>금액만 추정</strong>하며 수급자격을 판정하지 않습니다. 자발/비자발 여부와 정당한 사유 해당 여부는 관할 고용센터가 심사합니다.',
  },
  {
    q: '고용보험에 180일 가입하면 실업급여를 받나요?',
    a: '수급 요건 중 하나가 <strong>이직 전 18개월(피보험 단위기간) 중 180일 이상</strong> 근무입니다. 다만 180일은 단순 재직일이 아니라 보수 지급의 기초가 된 날(유급일)을 합산한 일수라, 실제로는 약 7~8개월 이상 근무해야 채워지는 경우가 많습니다. 그리고 180일을 채워도 이직 사유가 비자발(또는 정당한 자발)이어야 하고, 근로 의사·능력이 있어야 합니다. 일수 충족만으로 자동 지급되지는 않습니다.',
  },
  {
    q: '소정급여일수(며칠 받는지)는 어떻게 정해지나요?',
    a: `이직 당시 <strong>만 나이</strong>와 <strong>고용보험 총 가입기간</strong> 두 가지로 정해집니다. 50세 미만은 가입기간에 따라 ${BENEFIT_DAYS_2019.under50.lt1}~${BENEFIT_DAYS_2019.under50.y10plus}일, 50세 이상·장애인은 ${BENEFIT_DAYS_2019['50plus'].lt1}~${BENEFIT_DAYS_2019['50plus'].y10plus}일입니다. 예를 들어 50세 미만이고 가입기간 1~3년이면 ${BENEFIT_DAYS_2019.under50.y1to3}일, 50세 이상이고 10년 이상이면 ${BENEFIT_DAYS_2019['50plus'].y10plus}일입니다.`,
  },
  {
    q: '실업급여 평균임금은 어떻게 계산하나요?',
    a: `퇴직 직전 3개월간 받은 임금 총액을 그 기간의 <strong>총 달력일수(보통 89~92일)</strong>로 나눈 1일 평균임금이 기준입니다. 다만 이 금액이 1일 통상임금보다 적으면 <strong>통상임금을 기초일액</strong>으로 씁니다(고용보험법 제45조 제2항). 평균임금은 주말까지 포함한 달력일수로, 통상임금은 소정근로시간으로 나누기 때문에 변동급 없는 월급제라면 대개 통상임금이 더 큽니다. 이 기초일액의 60%가 구직급여 1일액이 됩니다. 단 기초일액 자체에도 상한(2026년 ${won(UI_WAGE_DAILY_CAP_2026)}원)이 있어, 고소득자는 임금일액이 상한으로 잘린 뒤 60%가 적용됩니다.`,
  },
  {
    q: '신청 기간이 지나면(이직 후 12개월) 어떻게 되나요?',
    a: '구직급여는 <strong>이직일 다음 날부터 12개월 이내</strong>에만 받을 수 있습니다. 이 12개월을 넘기면 소정급여일수가 남아 있어도 더 이상 지급되지 않습니다. 예를 들어 소정급여일수가 150일이어도 신청·수급이 늦어 12개월이 지나면 남은 일수는 소멸합니다. 그래서 퇴사 직후 고용24(work24.go.kr) 구직등록과 수급자격 신청을 서두르는 것이 중요합니다.',
  },
  {
    q: '월급 300만원이면 실업급여가 얼마인가요?',
    a: `월급 300만원이 기본급처럼 매달 같은 고정급이라면 두 금액을 비교합니다. 평균임금일액은 약 ${won(Math.round(R300.avgDaily))}원(300만 × 3 ÷ 90일), 1일 통상임금은 약 ${won(Math.round(R300.ordinaryDaily))}원(300만 ÷ ${MONTHLY_WORK_HOURS}시간 × ${UI_DAILY_WORK_HOURS}시간)이라 ${R300.ordinaryApplied ? '고용보험법 제45조 제2항에 따라 더 큰 <strong>통상임금이 기초일액</strong>이 됩니다' : '평균임금일액이 기초일액이 됩니다'}.${R300.wageCapped ? ` 이 값은 기초일액 상한 ${won(R300.wageCap)}원으로 잘리고,` : ''} 그 60%는 ${won(R300.rawDaily)}원이라 <strong>${capWord(R300.capped)} ${won(R300.dailyBenefit)}원</strong>이 지급액입니다(2026년 이직 기준). 만 35세·가입기간 1~3년이면 소정급여일수 ${R300.benefitDays}일, 총 예상 수급액은 약 ${won(R300.totalBenefit)}원입니다. ${NEXT_YEAR}년 1월 1일 이후 이직하면 ${R300_NEXT.capConfirmed ? '' : `(${NEXT_YEAR}년 상한은 아직 고시 전이라 현행 상한 ${won(R300_NEXT.dailyCap)}원이 유지된다고 가정하면) `}${R300_NEXT.floorOverCap ? `하한(${won(R300_NEXT.dailyFloor)}원)이 상한(${won(R300_NEXT.dailyCap)}원)보다 높아 ` : ''}1일 ${won(R300_NEXT.dailyBenefit)}원, 총 ${won(R300_NEXT.totalBenefit)}원입니다${R300_NEXT.capConfirmed ? '' : ' — 상한이 새로 정해지면 달라질 수 있습니다'}. 월급에 연장수당 같은 변동급이 섞여 고정급 부분이 작다면 평균임금일액이 기준이 될 수 있고, 그 60%(${won(R300_AVG.rawDaily)}원)로 계산하면 ${capWord(R300_AVG.capped)} ${won(R300_AVG.dailyBenefit)}원${R300_AVG.capped === 'lower' ? `(하루 ${UI_DAILY_WORK_HOURS}시간 근무 기준)` : ''}, 총 ${won(R300_AVG.totalBenefit)}원입니다.`,
  },
  {
    q: '수급 중에 빨리 재취업하면 남은 실업급여는 사라지나요?',
    a: '소정급여일수를 <strong>절반 이상 남기고</strong> 재취업해 <strong>12개월 이상 계속 고용</strong>되면(또는 12개월 이상 사업을 계속하면) 남은 구직급여의 절반을 <strong>조기재취업수당</strong>으로 받을 수 있습니다. 예를 들어 150일 중 30일만 받고 재취업했다면 남은 120일분의 절반인 60일분입니다. 12개월 고용을 채운 뒤 신청하며, 그 사이 하루라도 고용이 끊기면 받지 못합니다. 재취업 시점 요건 등 세부 조건은 고용24에서 확인하세요.',
  },
  {
    q: '실업급여 첫 입금은 언제 되나요?',
    a: '수급자격 신청 뒤 첫 <strong>7일은 대기기간</strong>이라 급여가 나오지 않습니다. 대기기간은 소정급여일수에서 빠지지 않으므로 총 수급액(1일액 × 소정급여일수)은 줄지 않고, 지급 시작만 그만큼 늦어집니다. 이후 고용센터가 정한 실업인정일(보통 4주 간격)에 구직활동을 신고하면 인정받은 기간의 급여가 지정 계좌로 들어옵니다. 퇴사 직후 회사의 이직확인서 제출이 늦으면 수급자격 인정도 늦어지니 퇴사 전 미리 요청해 두세요.',
  },
]

export default function UnemploymentBenefitPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/unemployment-benefit">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />실업급여(구직급여) 계산기
      </h1>
      <p className="tp-lead">
        퇴직 전 3개월 급여와 이직 당시 나이·고용보험 가입기간으로 2026년 구직급여가 <strong style={{ color: 'var(--text)' }}>하루 얼마, 며칠, 총 얼마</strong>인지 계산합니다. 2026년 상한 {won(UI_DAILY_CAP_2026)}원·하한 {won(UI_DAILY_FLOOR_2026)}원을 반영하고, 이직일이 {NEXT_YEAR}년이면 그해 최저시급 하한({won(FLOOR_2027)}원)으로 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis={`2026년 구직급여 상한 ${won(UI_DAILY_CAP_2026)}원·하한 ${won(UI_DAILY_FLOOR_2026)}원, ${NEXT_YEAR}년 이직자 하한 ${won(FLOOR_2027)}원 기준`}
        sources={[
          { label: '고용노동부(moel.go.kr)', href: 'https://www.moel.go.kr/' },
          { label: '고용보험(ei.go.kr)', href: 'https://www.ei.go.kr/' },
          { label: '국가법령정보센터 고용보험법', href: 'https://www.law.go.kr/법령/고용보험법' },
          { label: '고용24(work24.go.kr)', href: 'https://www.work24.go.kr/' },
        ]}
      />

      {/* buildDate: SSG와 hydration이 같은 기준일(이직일 미입력 시 상·하한 연도)을 쓰도록 빌드 시점 날짜 전달 */}
      <UnemploymentClient buildDate={todayStr()} />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 실업급여란·요건 ── */}
        <div>
          <h2 className="g-h2">
            실업급여(구직급여)란? 수급 요건
          </h2>
          <p className="g-p">
            실업급여 중 구직급여는 고용보험 가입 근로자가 비자발적으로 일자리를 잃고 재취업을 준비하는 동안 받는 급여입니다. 흔히 말하는 &lsquo;실업급여&rsquo;가 이 구직급여입니다. 핵심 요건은 네 가지입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { t: '피보험 단위기간', v: '180일 이상', d: '이직 전 18개월 중 보수의 기초가 된 날 합산 180일 이상.' },
              { t: '이직 사유', v: '비자발 원칙', d: '권고사직·계약만료 등. 정당한 사유의 자발적 퇴사는 예외 인정.' },
              { t: '근로 의사·능력', v: '있어야 함', d: '재취업할 의사와 능력이 있고 적극적으로 구직활동을 해야.' },
              { t: '신청 시기', v: '12개월 이내', d: '이직일 다음 날부터 12개월 안에 수급을 마쳐야 함.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px' }}>{c.v}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="g-note" style={{ marginTop: '12px' }}>
            이 계산기는 위 요건의 충족 여부, 즉 <strong style={{ color: 'var(--text)' }}>수급자격을 판정하지 않습니다.</strong> 자격이 인정된다는 가정 아래 금액(1일액·소정급여일수·총수급액)만 추정합니다. 자격 판정은 관할 고용센터가 합니다.
          </p>
        </div>

        {/* ── 2. 1일 구직급여액 계산법 ── */}
        <div>
          <h2 className="g-h2">
            1일 구직급여액 — 기초일액의 60%와 2026 상·하한
          </h2>
          <p className="g-p">
            1일 구직급여액은 <strong style={{ color: 'var(--text)' }}>기초일액 × 60%</strong>로 계산하되, 2026년 상한 {won(UI_DAILY_CAP_2026)}원과 하한 {won(UI_DAILY_FLOOR_2026)}원 사이로 정해집니다. 상한을 먼저 적용하고, 그 값이 하한보다 낮으면 하한액을 받습니다(고용보험법 제46조 — 하한이 상한보다 높아지는 해에도 하한이 우선). 기초일액은 퇴직 전 3개월 평균임금일액이지만, 그 금액이 1일 통상임금보다 적으면 <strong style={{ color: 'var(--text)' }}>통상임금</strong>을 씁니다(고용보험법 제45조 제2항).
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', fontFamily: 'var(--font-sans)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
              기초일액(평균임금일액·1일 통상임금 중 큰 쪽, 상한 {won(UI_WAGE_DAILY_CAP_2026)}원) → <strong>×0.60</strong> → 1일 상한 → 1일 하한 → 1일 구직급여액
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
              예: 기초일액 10만원 → ×0.6 = 6만원 → 하한 {won(UI_DAILY_FLOOR_2026)}원보다 낮아 <strong style={{ color: 'var(--accent-ink)' }}>{won(UI_DAILY_FLOOR_2026)}원</strong> 지급.
            </p>
          </div>
          <p className="g-p" style={{ marginTop: '12px' }}>
            2026년은 상한과 하한의 폭이 <strong>{won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}원에 불과</strong>합니다. 하한은 최저임금에 연동돼(최저시급 × 1일 소정근로시간 × 80%) 매년 오르는데 상한은 2019년부터 {won(CAP_PREV)}원에 묶여 있다가 2026년에야 올라 두 값이 가까워졌습니다. 하루 근무시간이 8시간보다 짧았던 단시간 근로자는 하한도 그만큼 낮아지니(4시간이면 {won(uiDailyFloor(4))}원), 위 도구에서 1일 소정근로시간을 함께 선택하세요.
          </p>
          <Callout tone="note" title={`이직일(마지막 근무일)이 ${NEXT_YEAR}년 1월 1일 이후라면`}>
            하한은 <strong>이직일 당시</strong> 최저임금으로 정해집니다. {NEXT_YEAR}년 최저시급 {won(MIN_WAGE_2027)}원이 고시돼, {NEXT_YEAR}년 이직자의 하한은 8시간 기준 {won(FLOOR_2027)}원으로 오릅니다.
            {FLOOR_2027 > CAP_2027
              ? <> 이는 {CAP_2027_CONFIRMED ? `${NEXT_YEAR}년` : '현재'} 상한({won(CAP_2027)}원)보다 높은데, 고용보험법 제46조 제2항은 산정액이 하한보다 낮으면 하한을 지급하도록 하므로 하루 {UI_DAILY_WORK_HOURS}시간 근무자는 임금과 관계없이 {won(FLOOR_2027)}원을 받습니다.</>
              : <> {NEXT_YEAR}년 상한은 {won(CAP_2027)}원입니다.</>}
            {!CAP_2027_CONFIRMED && <> {NEXT_YEAR}년 상한은 아직 고시되지 않아 이 계산기는 {UI_CAP_CONFIRMED_THROUGH}년 상한을 그대로 씁니다. 정부가 2026년 9월 상한을 하한에 연동하는 개편안을 내놓았지만 시행령 개정 전이니, 최종 금액은 고용노동부 발표로 확인하세요.</>}
            {' '}위 계산기에 이직일(마지막 근무일)을 넣으면 그해 상·하한으로 계산합니다.
          </Callout>
        </div>

        {/* ── 2-1. 월급별 예시 ── */}
        <div>
          <h2 className="g-h2">
            월급별 1일 구직급여 — 60%가 그대로 적용되는 구간
          </h2>
          <p className="g-p">
            2026년 이직자는 상·하한 폭이 좁아서, 기초일액의 60%가 그대로 지급액이 되는 사람은 기초일액이 <strong>{won(PASS_LOW_DAILY)}~{won(PASS_HIGH_DAILY)}원</strong>인 경우뿐입니다. 월급이 고정급뿐인 주 5일 근무자는 1일 통상임금(월급 ÷ {MONTHLY_WORK_HOURS}시간 × {UI_DAILY_WORK_HOURS}시간)이 기초일액이 되므로 세전 월급 약 <strong>{manCeil(PASS_LOW_MONTH)}~{manFloor(PASS_HIGH_MONTH)} 원</strong> 구간이고, 이보다 적게 받았으면 하한, 많이 받았으면 상한이 적용됩니다. 변동급이 많아 평균임금일액이 기초일액이 되는 경우라면 3개월 임금을 30일 기준으로 환산해 월 약 {manCeil(PASS_LOW_MONTH_AVG)}~{manFloor(PASS_HIGH_MONTH_AVG)} 원이 이 구간입니다.
            아래는 만 {EX_AGE}세·가입기간 1~3년(소정급여일수 {EX_DAYS}일)·1일 {UI_DAILY_WORK_HOURS}시간·주 5일 근무, 월급 전액이 고정급이라고 가정해 계산기와 같은 방식(평균임금일액 = 월급 × 3 ÷ 90일, 둘 중 큰 쪽)으로 구한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['세전 월급', '평균임금일액', '1일 통상임금', '기초일액 × 60%', '1일 지급액 (2026 이직)', '적용', `총액 (${EX_DAYS}일)`, `${NEXT_YEAR}년 이직 시 1일액`].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '9px 10px', textAlign: i === 0 || i === 5 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WAGE_ROWS.map(({ m, r, next }) => (
                  <tr key={m} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{won(m)}원</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: r.ordinaryApplied ? 'var(--muted)' : undefined }}>{won(Math.round(r.avgDaily))}원</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: r.ordinaryApplied ? undefined : 'var(--muted)' }}>{won(Math.round(r.ordinaryDaily))}원</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{won(r.rawDaily)}원</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--accent-ink)', fontWeight: 700 }}>{won(r.dailyBenefit)}원</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.capped === 'upper' ? (r.wageCapped ? '기초일액 상한 → 1일 상한' : '1일 상한') : r.capped === 'lower' ? '하한' : '60% 그대로'}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{won(r.totalBenefit)}원</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{won(next.dailyBenefit)}원{next.capped === 'lower' ? ' (하한)' : next.capped === 'upper' ? ' (상한)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 둘 중 흐리게 표시한 쪽은 기초일액에 쓰이지 않은 값입니다. 월급이 고정급뿐이면 1일 통상임금이 평균임금일액보다 항상 커서 통상임금이 기초일액이 됩니다. 월급에 연장·야간수당 같은 변동급이 섞여 있으면 통상임금은 고정급 부분으로만 계산하므로 결과가 달라집니다 — 계산기의 &lsquo;전부 고정급&rsquo; 체크를 해제하고 월 고정급을 따로 입력하세요. 마지막 열은 같은 사람이 {NEXT_YEAR}년 1월 1일 이후 이직했을 때로, {NEXT_YEAR}년 최저시급 하한과 {CAP_2027_CONFIRMED ? `${NEXT_YEAR}년` : `${UI_CAP_CONFIRMED_THROUGH}년(${NEXT_YEAR}년 미고시)`} 상한을 적용했습니다. 상여금·연차수당은 산입 방식이 따로 있어 고용센터 산정과 다를 수 있습니다.
          </p>
        </div>

        {/* ── 3. 소정급여일수 전체 표 ── */}
        <div>
          <h2 className="g-h2">
            소정급여일수 — 내 나이·가입기간이면 며칠 받나
          </h2>
          <p className="g-p">
            며칠 동안 받는지는 이직 당시 <strong style={{ color: 'var(--text)' }}>만 나이</strong>와 <strong style={{ color: 'var(--text)' }}>고용보험 총 가입기간</strong>으로 정해집니다(2019.10. 이후 이직자 기준). 장애인은 나이와 무관하게 50세 이상 표가 적용됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연령 구분</th>
                  {COVERAGE_BRACKETS.map((b) => (
                    <th scope="col" key={b.id} style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{BRACKET_SHORT[b.id]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.map((ag, i) => (
                  <tr key={ag} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--text)', fontWeight: 600 }}>{AGE_GROUP_LABEL[ag]}</th>
                    {COVERAGE_BRACKETS.map((b) => (
                      <td key={b.id} style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                        {BENEFIT_DAYS_2019[ag][b.id]}일
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note" style={{ marginTop: '12px' }}>
            가입기간이 길수록, 50세 이상·장애인일수록 일수가 늘어 최대 {BENEFIT_DAYS_2019['50plus'].y10plus}일까지 받습니다. 위 도구에 나이·가입기간을 넣으면 해당 칸이 강조 표시됩니다.
          </p>
        </div>

        {/* ── 4. 평균임금·임금일액 상한 ── */}
        <div>
          <h2 className="g-h2">
            평균임금 산정과 임금일액 상한 {won(UI_WAGE_DAILY_CAP_2026)}원
          </h2>
          <p className="g-p">
            평균임금일액은 <strong style={{ color: 'var(--text)' }}>퇴직 직전 3개월 임금 총액 ÷ 그 기간 총 달력일수</strong>입니다. 3개월이 달력상 며칠인지에 따라 분모가 89~92일로 달라지므로, 위 도구에 이직일(마지막 근무일)을 입력하면 직전 3개월 총일수를 자동 산정합니다(미입력 시 90일 가정).
          </p>
          <p className="g-p">
            이렇게 구한 평균임금일액이 1일 통상임금보다 적으면 통상임금이 기초일액이 됩니다(고용보험법 제45조 제2항). 1일 통상임금은 월 통상임금 ÷ 월 소정근로시간({MONTHLY_WORK_HOURS}시간, 주 {WORK_HOURS_WEEK}시간 기준) × 1일 소정근로시간이라, 주말까지 달력일수로 나누는 평균임금보다 크게 나오기 쉽습니다.
          </p>
          <p className="g-p">
            기초일액에도 상한이 있습니다. 2026년 임금일액 상한은 <strong style={{ color: 'var(--text)' }}>{won(UI_WAGE_DAILY_CAP_2026)}원</strong>으로, 고소득자는 임금일액이 이 값으로 잘린 뒤 60%가 적용됩니다. 다만 {won(UI_WAGE_DAILY_CAP_2026)}원의 60%는 {won(Math.round(UI_WAGE_DAILY_CAP_2026 * 0.6))}원이라, 결국 1일액 상한 {won(UI_DAILY_CAP_2026)}원으로 다시 한 번 제한됩니다.
          </p>
          <p className="g-note">
            간편 모드는 월급 1개로 추정(월급 × 3 ÷ 총일수)하고, 상세 모드는 직전 3개월 급여를 각각 입력해 합산합니다. &lsquo;전부 고정급&rsquo; 체크(기본)는 월급(상세 모드는 직전 1개월 급여)을 월 통상임금으로 보고 1일 통상임금(× {UI_DAILY_WORK_HOURS} ÷ {MONTHLY_WORK_HOURS})과 비교하며, 변동급이 있으면 체크를 풀고 월 고정급을 따로 넣으면 같은 비교를 합니다. 상여·연차수당 등 포함 범위는 실제 정산과 다를 수 있으니, 정확한 금액은 고용센터·고용보험 모의계산으로 확인하세요.
          </p>
        </div>

        {/* ── 5. 수급기간·반복수급 주의 ── */}
        <div>
          <h2 className="g-h2">
            수급기간 12개월 제한과 반복수급 주의
          </h2>
          <p className="g-p">
            구직급여는 <strong style={{ color: 'var(--text)' }}>이직일 다음 날부터 12개월(수급기간) 이내</strong>에만 받을 수 있습니다. 소정급여일수가 며칠 남았든 이 12개월을 넘기면 지급이 종료됩니다. 예컨대 소정급여일수가 150일이어도 신청이 늦거나 중간에 길게 비우면 남은 일수가 소멸할 수 있습니다.
          </p>
          <p className="g-p">
            수급기간 연장도 가능합니다. 임신·출산·육아나 본인 질병·부상, 가족 간호 등으로 이직 후 곧바로 취업할 수 없는 사정이 있으면 그 기간만큼 수급기간을 늘려 달라고 신청할 수 있으니(최대 4년 범위), 해당하면 12개월이 지나기 전에 고용센터에 문의하세요.
          </p>
          <p className="g-p">
            짧은 기간에 구직급여를 여러 번 받은 <strong>반복수급자</strong>의 급여를 깎는 방안(5년 안에 3회 이상 받으면 횟수에 따라 10~50% 감액 등)은 정부가 2024년 7월 국무회의에서 의결한 고용보험법 개정안에 담긴 내용으로, 국회 입법을 거쳐야 적용됩니다. 본 계산기는 감액을 반영하지 않으니, 최근 몇 년 사이 수급한 적이 있다면 신청 전 고용센터에 현재 적용 여부를 확인하세요.
          </p>
          <p className="g-note">
            수급 중에는 정해진 실업인정일마다 구직활동을 신고해야 하며, 신고를 빠뜨리면 해당 기간 급여가 지급되지 않을 수 있습니다.
          </p>
        </div>

        {/* ── 6. 신청 절차·서류 ── */}
        <div>
          <h2 className="g-h2">
            신청 절차와 필요 서류
          </h2>
          <p className="g-p">
            퇴사 후 다음 순서로 진행합니다. 자격 신청 교육과 구직등록을 마쳐야 수급자격 인정 신청이 가능합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '1', t: '이직확인서 처리 확인', d: '회사가 고용보험에 이직확인서·피보험자격 상실 신고를 제출했는지 확인.' },
              { n: '2', t: '고용24 구직등록', d: '고용24(work24.go.kr)에서 구직신청을 등록. 옛 워크넷은 고용24로 통합됐습니다.' },
              { n: '3', t: '수급자격 신청교육', d: '고용보험 누리집 온라인 또는 고용센터에서 교육 수강.' },
              { n: '4', t: '수급자격 인정 신청', d: '거주지 관할 고용센터 방문해 수급자격 인정 신청.' },
              { n: '5', t: '실업인정·급여 수급', d: '정해진 실업인정일마다 구직활동 신고 → 급여 지급.' },
            ].map((c) => (
              <div key={c.n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>STEP {c.n}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="g-note" style={{ marginTop: '12px' }}>
            상세 절차·서식은 고용24(work24.go.kr)에서 확인하고, 절차가 헷갈리면 고용센터(국번없이 1350)에 문의하세요.
          </p>
        </div>

        {/* ── 면책 (하단 단일 배치) ── */}
        <Disclaimer
          variant="finance"
          sources={[
            { label: '고용노동부(moel.go.kr)', href: 'https://www.moel.go.kr/' },
            { label: '고용보험(ei.go.kr)', href: 'https://www.ei.go.kr/' },
          ]}
        >
          본 계산기는 2026년 상·하한(이직일이 {NEXT_YEAR}년이면 그해 최저시급 하한) 기준 추정·참고용입니다. 자발적 퇴사 여부 등 <strong>수급자격 판정과 실제 지급액은 고용센터의 최종 심사로 결정</strong>되며, 본 도구는 수급 가능 여부를 판정하지 않습니다. 정확한 금액은 고용보험(ei.go.kr) 모의계산 또는 관할 고용센터(국번없이 1350)에 확인하세요.
        </Disclaimer>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '입사·퇴사일과 3개월 급여로 퇴직금·퇴직소득세·실수령 자동' },
              { href: '/tools/finance/salary', icon: '💰', name: '연봉 실수령액 계산기', desc: '연봉에서 4대보험·소득세 빼고 월 실수령액' },
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
