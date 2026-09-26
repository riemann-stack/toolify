import Link from 'next/link'
import NationalPensionClient from './NationalPensionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import { todayStr } from '@/lib/date'
import { calcPension, pensionStartAge, NP_A_VALUE_2026, NP_EARLY_RATE, NP_DEFER_RATE } from '@/lib/krNationalPension'
import { calcBreakEven, fmtWon, adjustPct } from './nationalPensionUtils'
import { PENSION_BASE_CURRENT, pensionBasePeriodLabel } from '@/lib/krInsuranceRates'
import ToolPage from '@/components/ToolPage'

/* 기준소득월액 상·하한 — lib 스케줄에서 빌드 시점 구간 보간 (매년 7월 개정) */
const PB = PENSION_BASE_CURRENT
const PB_LABEL = pensionBasePeriodLabel(PB)
const man = (v: number) => `${(v / 10_000).toLocaleString('ko-KR')}만원`

export const metadata = buildMetadata({
  path: '/tools/finance/national-pension',
  title: '국민연금 예상 수령액 계산기 — 2026 A값·조기연기 반영',
  description:
    '가입기간·평균소득·출생연도로 노령연금 월 예상액을 추정합니다. 조기수령 감액·연기연금 가산, 부양가족연금까지. 2026년 A값 3,193,511원 기준.',
  keywords: [
    '국민연금 예상수령액',
    '국민연금 계산기',
    '노령연금 계산',
    '국민연금 조기수령',
    '연기연금',
    '국민연금 A값',
    '1969년생 국민연금',
    '부양가족연금',
  ],
})

const strong: React.CSSProperties = { color: 'var(--text)' }
const formulaBox: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '14px 16px',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.9,
}


/* ── 본문 표 — 계산기와 같은 lib/krNationalPension.calcPension으로 빌드 시점 계산 (부양가족 없음·정상수령) ── */
const NP_BASE = { mode: 'normal' as const, adjustYears: 0, spouse: false, dependents: 0, incomeBase: PB }
const COVER_YEARS = [10, 15, 20, 25, 30, 35, 40]
const B_LEVELS = [1_500_000, 2_500_000, 3_500_000, PB.max]
const COVER_ROWS = COVER_YEARS.map((y) => ({ y, m: B_LEVELS.map((b) => calcPension({ ...NP_BASE, totalMonths: y * 12, avgIncome: b }).monthly) }))

/** 조기·연기 — 가입 20년·B 250만원·1969년생 이후(정상 개시 65세) 기준, 손익분기는 보정 없는 단순 누적 */
const EX_START_AGE = pensionStartAge(1969)
const EX_NORMAL = calcPension({ ...NP_BASE, totalMonths: 240, avgIncome: 2_500_000 })
const ADJ_ROWS = ([['early', 5], ['early', 3], ['early', 1], ['normal', 0], ['defer', 1], ['defer', 3], ['defer', 5]] as const).map(([mode, yrs]) => {
  const r = calcPension({ ...NP_BASE, mode, adjustYears: yrs, totalMonths: 240, avgIncome: 2_500_000 })
  const be = mode === 'normal' ? null : calcBreakEven(EX_NORMAL.monthly, r.monthly, EX_START_AGE, yrs, mode).ageAtCrossover
  return { mode, yrs, startAge: mode === 'early' ? EX_START_AGE - yrs : mode === 'defer' ? EX_START_AGE + yrs : EX_START_AGE, factor: r.adjustFactor, monthly: r.monthly, be }
})
/** 비례상수 1.29 검산 — 40년 가입·B = A값이면 월액 ÷ A = 소득대체율 */
const REPLACEMENT = calcPension({ ...NP_BASE, totalMonths: 480, avgIncome: NP_A_VALUE_2026 }).monthly / NP_A_VALUE_2026

const TH: React.CSSProperties = { padding: '10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const TDL: React.CSSProperties = { ...TD, textAlign: 'left', fontWeight: 600 }

const FAQ_LD = [
  {
    q: '국민연금 예상 수령액은 어떻게 계산하나요?',
    a: '공단 간단계산 산식은 <strong>기본연금액 = 1.29 × (A값 + B값) × (1 + 0.05 × n/12)</strong>입니다. A값은 전체 가입자의 3년 평균 소득월액(2026년 3,193,511원), B값은 본인의 평균 기준소득월액, n은 20년(240개월)을 초과한 가입월수입니다. 여기에 가입기간 지급률(10년 50% → 20년 100%)을 곱한 뒤 12로 나눠 월액을 구합니다. 예로 20년 가입·B 250만원이면 월 약 612,052원입니다.',
  },
  {
    q: '10년만 납부하면 국민연금을 얼마나 받나요?',
    a: '가입 10년(120개월)은 노령연금 수급 최소 기간으로, 지급률이 <strong>50%</strong>입니다. 같은 소득이라도 20년 가입자의 절반 수준이 됩니다. 예로 B 250만원·정상수령이면 20년은 월 약 61만원, 10년은 그 절반인 월 약 30만원대입니다. 10년을 못 채우면 노령연금 대신 그동안 낸 보험료를 이자와 함께 반환일시금으로 받습니다.',
  },
  {
    q: '국민연금 조기수령하면 얼마나 깎이나요?',
    a: '조기노령연금은 정상 개시연령보다 1년 일찍 받을 때마다 <strong>연 6%</strong>(월 0.5%)씩 감액됩니다. 최대 5년 일찍 받으면 30% 감액되어 평생 70%만 받습니다. 일찍·오래 받는 대신 월액이 줄어드는 구조라, 손익분기 연령을 넘겨 장수할수록 정상수령이 누적상 유리해집니다.',
  },
  {
    q: '연기연금은 얼마나 더 받나요?',
    a: '연기연금은 정상 개시연령보다 1년 늦게 받을 때마다 <strong>연 7.2%</strong>(월 0.6%)씩 가산됩니다. 최대 5년 늦추면 36% 가산되어 평생 136%를 받습니다. 수급 시기를 미룰 여유가 있고 건강·기대수명이 길다면 연기연금이 유리할 수 있습니다.',
  },
  {
    q: 'A값이 무엇인가요?',
    a: 'A값은 <strong>전체 국민연금 가입자의 최근 3년간 평균 소득월액</strong>으로, 연금액 계산의 균등 부분(소득재분배 요소)에 들어갑니다. 2026년 적용 A값은 <strong>3,193,511원</strong>(적용기간 2025.12~2026.11)입니다. A값이 클수록 소득이 낮은 가입자에게 상대적으로 유리하게 작용합니다. 본인 소득인 B값과 합산해 기본연금액을 산정합니다.',
  },
  {
    q: '1969년생은 몇 살부터 국민연금을 받나요?',
    a: '출생연도에 따라 수급개시연령이 다릅니다. <strong>1969년생 이후 출생자는 만 65세</strong>부터 노령연금을 받습니다. 1965~1968년생은 64세, 1961~1964년생은 63세, 1957~1960년생은 62세, 1953~1956년생은 61세, 1952년 이전은 60세입니다.',
  },
  {
    q: '부양가족연금은 얼마나 가산되나요?',
    a: '노령연금 수급자에게 부양가족이 있으면 정액으로 가산됩니다(2026년 기준). <strong>배우자는 연 306,630원(월 약 25,552원)</strong>, <strong>자녀·부모는 1인당 연 204,360원(월 약 17,030원)</strong>입니다. 부양가족연금은 조기·연기 보정과 무관하게 정액으로 더해집니다.',
  },
  {
    q: '20년 납입하면 국민연금 월 얼마인가요?',
    a: '가입 20년(240개월)은 지급률 100% 구간입니다. 평균 기준소득월액(B값) <strong>250만원</strong>·정상수령 기준이면 월 약 <strong>612,052원</strong>입니다. B값이 높을수록, 가입기간이 20년을 넘을수록(1년당 5%씩 증액) 월액이 커집니다. 이 값은 공단 간단계산 산식 기반 추정이며 실제 연금은 가입연도별 재평가율에 따라 달라집니다.',
  },
]

const ageRows = [
  { y: '1952년 이전', a: '만 60세' },
  { y: '1953~1956년생', a: '만 61세' },
  { y: '1957~1960년생', a: '만 62세' },
  { y: '1961~1964년생', a: '만 63세' },
  { y: '1965~1968년생', a: '만 64세' },
  { y: '1969년생 이후', a: '만 65세' },
]

export default function NationalPensionPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/national-pension">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />국민연금 예상 수령액 계산기
      </h1>
      <p className="tp-lead">
        가입기간·평균소득·출생연도를 넣으면 노령연금 월 예상액을 <strong style={strong}>공단 간단계산 산식</strong>으로 추정합니다. 조기수령 감액·연기연금 가산, 부양가족연금까지 한 번에 비교합니다.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="A값 적용기간 2025.12~2026.11 · 기준소득월액 상·하한 2026년 7월~2027년 6월 적용분 기준"
        sources={[
          { label: '국민연금공단(nps.or.kr)', href: 'https://www.nps.or.kr/' },
          { label: '국가법령정보센터 국민연금법', href: 'https://www.law.go.kr/법령/국민연금법' },
        ]}
      />

      <Disclaimer
        variant="finance"
        sources={[{ label: '국민연금공단(nps.or.kr)', href: 'https://www.nps.or.kr/' }]}
      >
        본 계산기는 국민연금공단 간단계산 산식(1.29×(A+B)×지급률)을 단순화한 추정값입니다. 실제 연금액은 가입연도별 재평가율·소득대체율·비례상수 가중과 기준소득월액 이력에 따라 달라지며, 수급 자격(최소 가입 10년)·정확한 금액은 「내 곁에 국민연금」 앱 또는 국민연금공단(1355)에서 확인하세요. 수급 가능 여부를 단정하지 않습니다.
      </Disclaimer>

      {/* buildDate: SSG와 hydration이 같은 기준일을 쓰도록 빌드 시점 날짜 전달 */}
      <NationalPensionClient buildDate={todayStr()} />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 어떻게 계산되나 */}
        <div>
          <h2 className="g-h2">예상 수령액은 어떻게 계산되나</h2>
          <p className="g-p">
            노령연금의 기본연금액은 공단 간단계산 산식으로 추정합니다. 균등 부분인 A값(전체 가입자 평균소득)과 소득비례 부분인 B값(본인 평균소득)을 더한 뒤, 20년 초과 가입월수만큼 증액합니다.
          </p>
          <div style={formulaBox}>
            기본연금액 = <strong style={{ color: 'var(--accent-ink)' }}>1.29</strong> × (A값 + B값) × (1 + 0.05 × n / 12)
            <br />
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              · A값: 전체 가입자 3년 평균 소득월액 · B값: 본인 평균 기준소득월액 · n: 20년(240개월) 초과 가입월수
            </span>
          </div>
          <p className="g-p" style={{ marginTop: '12px' }}>
            여기에 가입기간 지급률(10년 50% → 20년 100%)을 곱하고 12로 나누면 월액이 됩니다. 검산 예시로 <strong>가입 20년·B 250만원·정상수령이면 1.29 × ({fmtWon(NP_A_VALUE_2026)} + 2,500,000) ÷ 12 = 월 약 {fmtWon(EX_NORMAL.monthly)}원</strong>입니다.
          </p>
          <p className="g-p">
            비례상수 1.29는 2025년 국민연금법 개정으로 2026년부터 적용되는 소득대체율 43%에 맞춘 값입니다. 40년 가입하고 평생 평균소득(B값)이 A값과 같은 사람을 넣으면 월 연금이 A값의 {(REPLACEMENT * 100).toFixed(1)}%가 되는데, 이것이 &lsquo;소득대체율&rsquo;의 정의입니다. 다만 실제로는 2025년 이전 가입기간에 그 당시 비례상수(소득대체율 41.5~70%)가 적용되므로, 오래전부터 가입한 사람일수록 실제 연금이 이 계산기 결과와 달라집니다.
          </p>
        </div>

        {/* 2. 가입기간 */}
        <div>
          <h2 className="g-h2">가입기간·소득별 월 예상액</h2>
          <p className="g-p">
            가입기간 지급률은 최소 가입 10년에서 <strong>50%</strong>로 시작해 1개월마다 약 0.417%p씩 올라 <strong>20년에 100%</strong>가 됩니다. 20년을 넘기면 지급률은 100%로 고정되지만, 초과한 가입월수 1년(12개월)마다 기본연금액 자체가 <strong>5%씩 증액</strong>됩니다. 아래 표는 계산기와 같은 함수로 구한 정상수령 월액(부양가족연금 제외)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>가입기간</th>
                  {B_LEVELS.map((b, i) => (
                    <th scope="col" key={b} style={TH}>B {man(b)}{i === B_LEVELS.length - 1 ? ' (상한)' : ''}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVER_ROWS.map((r) => (
                  <tr key={r.y} style={{ background: r.y === 20 ? 'var(--bg2)' : undefined }}>
                    <th scope="row" style={TDL}>{r.y}년</th>
                    {r.m.map((v, i) => <td key={i} style={TD}>{fmtWon(v)}원</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">2026년 A값 {fmtWon(NP_A_VALUE_2026)}원, 기준소득월액 상한 {man(PB.max)}({PB_LABEL}) 적용. 재평가율·가입연도별 비례상수는 반영하지 않은 추정입니다.</p>
          <p className="g-p" style={{ marginTop: 12 }}>
            같은 B값에서 10년 가입은 20년 가입의 정확히 절반이고, 30년은 20년의 1.5배(초과 10년 × 5%)입니다. 반면 B값을 250만원에서 350만원으로 40% 올려도 20년 기준 월액은 약 {Math.round((COVER_ROWS[2].m[2] / COVER_ROWS[2].m[1] - 1) * 100)}%만 늘어납니다. A값이 산식의 절반을 차지하는 소득재분배 구조 때문으로, 연금액을 늘리는 데는 소득보다 <strong>가입기간</strong>이 훨씬 강하게 작용합니다. 경력 단절·실직 기간이 있다면 추후납부나 임의가입으로 가입기간을 채우는 방법을 공단에 문의해 볼 만합니다.
          </p>
        </div>

        {/* 3. 조기 vs 연기 */}
        <div>
          <h2 className="g-h2">조기수령 vs 연기연금 — 감액·가산과 손익분기</h2>
          <p className="g-p">
            정상 개시연령보다 일찍 받는 <strong>조기노령연금</strong>은 1년당 <strong>{(NP_EARLY_RATE * 100).toFixed(0)}% 감액</strong>(월 0.5%, 최대 5년 30% 감액 → 70% 수령), 늦게 받는 <strong>연기연금</strong>은 1년당 <strong>{(NP_DEFER_RATE * 100).toFixed(1)}% 가산</strong>(월 0.6%, 최대 5년 36% 가산 → 136% 수령)입니다. 조기노령연금은 가입기간 10년 이상이고 소득이 있는 업무에 종사하지 않을 때 신청할 수 있고, 연기연금은 노령연금 수급권을 얻은 뒤 5년 안에서 전부 또는 일부를 늦출 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>선택</th>
                  <th scope="col" style={TH}>개시 나이</th>
                  <th scope="col" style={TH}>보정</th>
                  <th scope="col" style={TH}>월 예상액</th>
                  <th scope="col" style={TH}>손익분기 나이</th>
                </tr>
              </thead>
              <tbody>
                {ADJ_ROWS.map((r) => (
                  <tr key={`${r.mode}-${r.yrs}`} style={{ background: r.mode === 'normal' ? 'var(--bg2)' : undefined }}>
                    <th scope="row" style={TDL}>{r.mode === 'early' ? `조기 ${r.yrs}년` : r.mode === 'defer' ? `연기 ${r.yrs}년` : '정상수령'}</th>
                    <td style={TD}>만 {r.startAge}세</td>
                    <td style={TD}>{adjustPct(r.factor)}</td>
                    <td style={{ ...TD, fontWeight: 700 }}>{fmtWon(r.monthly)}원</td>
                    <td style={TD}>{r.be == null ? '—' : `약 ${r.be.toFixed(1)}세`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">가입 20년·B 250만원·1969년생 이후(정상 개시 만 {EX_START_AGE}세) 기준. 손익분기 나이는 물가 연동·세금·건강보험료를 뺀 단순 누적액이 정상수령과 같아지는 나이입니다.</p>
          <p className="g-p" style={{ marginTop: 12 }}>
            조기수령은 일찍 시작하는 대신 월액이 적어, 일정 나이를 넘겨 오래 받으면 정상수령에 누적액이 따라잡힙니다. 위 예에서 5년 조기수령은 약 {ADJ_ROWS[0].be?.toFixed(0)}세, 5년 연기는 약 {ADJ_ROWS[6].be?.toFixed(0)}세가 갈림길입니다. 실제 연금은 매년 물가만큼 오르므로 금액이 큰 쪽(연기)의 절대 증가액이 더 커지고, 연금소득이 늘면 건강보험료·세금 부담도 달라집니다. 건강·기대수명·은퇴 후 소득 공백을 함께 고려해 판단하세요.
          </p>
        </div>

        {/* 4. A값·B값 */}
        <div>
          <h2 className="g-h2">A값·B값이 무엇이고 어떻게 반영되나</h2>
          <p className="g-p">
            <strong>A값</strong>은 전체 국민연금 가입자의 최근 3년 평균 소득월액으로, 소득재분배(균등) 요소입니다. 2026년 적용 A값은 <strong>{fmtWon(NP_A_VALUE_2026)}원</strong>(적용기간 2025.12~2026.11)입니다. 소득이 낮은 가입자일수록 A값 비중이 커서 상대적으로 유리하게 작용합니다.
          </p>
          <p className="g-p">
            <strong>B값</strong>은 본인의 가입기간 평균 기준소득월액(소득비례 요소)입니다. 기준소득월액은 상·하한이 있어 너무 높거나 낮은 소득은 일정 범위로 조정되며, 계산기는 {man(PB.min)}~{man(PB.max)}({PB_LABEL} 적용, 매년 7월 조정) 범위로 클램프해 반영합니다. 실제 B값은 과거 각 연도의 소득을 &lsquo;재평가율&rsquo;로 현재 가치로 환산해 평균하므로, 지금 월급을 그대로 넣기보다 가입기간 전체의 평균 수준을 넣는 편이 실제에 가깝습니다.
          </p>
        </div>

        {/* 5. 출생연도별 개시연령 */}
        <div>
          <h2 className="g-h2">출생연도별 수급개시연령</h2>
          <p className="g-p">
            노령연금을 받기 시작하는 나이는 1998년 개정 국민연금법 부칙에 따라 출생연도별로 단계적으로 늦춰져 왔습니다. <strong>1969년생 이후는 만 65세</strong>가 기준이고, 조기수령은 이 나이보다 최대 5년 앞당겨, 연기연금은 최대 5년 늦춰 받을 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr>
                  {['출생연도', '수급개시연령', '조기수령 가능', '연기 최대'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...TH, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ageRows.map((r) => {
                  const age = parseInt(r.a.replace(/[^0-9]/g, ''), 10)
                  return (
                    <tr key={r.y}>
                      <th scope="row" style={TDL}>{r.y}</th>
                      <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.a}</td>
                      <td style={TD}>만 {age - 5}세부터</td>
                      <td style={TD}>만 {age + 5}세까지</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. 한계 */}
        <div>
          <h2 className="g-h2">이 계산기의 한계</h2>
          <p className="g-p">
            이 도구는 공단 간단계산 산식을 단순화한 추정입니다. 실제 연금액은 가입연도별 <strong>재평가율</strong>(과거 소득을 현재 가치로 환산하는 비율)과 <strong>소득대체율</strong>·비례상수의 연도별 가중, 그리고 매년 달라진 기준소득월액 이력을 모두 반영해 계산됩니다. 출산·군복무 크레딧, 추후납부, 반환일시금 반납 같은 가입기간 조정도 반영하지 않습니다. 이 계산기는 단일 평균소득과 2026년 A값을 가정하므로 실제와 차이가 납니다. 정확한 예상액은 「내 곁에 국민연금」 앱이나 국민연금공단(국번 없이 1355)에서 본인의 실제 가입이력으로 조회하세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/4-insurance', icon: '🧾', name: '4대보험 계산기', desc: '국민연금·건강·고용·산재 보험료' },
              { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '평균/통상 자동 + 퇴직소득세' },
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
