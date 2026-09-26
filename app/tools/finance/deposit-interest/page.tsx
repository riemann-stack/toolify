import Link from 'next/link'
import DepositInterestClient from './DepositInterestClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import DataFigure from '@/components/DataFigure'
import Callout from '@/components/Callout'
import RelatedTools from '@/components/RelatedTools'
import {
  GENERAL_FIN_TAX_PCT, WITHHOLDING_PCT, LOCAL_TAX_PCT, LOCAL_INCOME_TAX_RATIO, RURAL_SPECIAL_TAX_RATIO,
  COMPREHENSIVE_TAX_THRESHOLD, COOP_DEPOSIT, COOP_REDUCED_RATES, TAX_FREE_SAVINGS, SMALL_TAX_EXEMPT_LIMIT, TAX_ROUNDING_UNIT,
  FIN_TAX_REVIEWED, withholdInterestTax, withholdCoopDepositTax, coopDepositTotalRate, ratePct, coopExemptLastJoinYear,
  type FinTaxLine,
} from '@/lib/krFinancialIncomeTax'
import {
  calcDeposit, depositEquivalentOfSavings, savingsRateForSameInterest, won, manwon, pct2,
  type DepositInput,
} from './depositInterestUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/deposit-interest',
  title: '예금 적금 이자 계산기 — 세후 만기 수령액·단리 월복리·비과세',
  description:
    `정기예금·정기적금 이자를 단리·월복리로 계산하고 이자소득세 ${WITHHOLDING_PCT}%·지방소득세(10원 미만 절사)를 뺀 세후 만기 수령액을 보여 줍니다. 적금↔예금 금리 환산, 비과세종합저축·상호금융 예탁금 과세까지.`,
  keywords: [
    '예금이자계산기', '적금이자계산기', '예적금 이자 계산', '세후이자', '만기수령액',
    `이자소득세 ${GENERAL_FIN_TAX_PCT}`, '적금 실효금리', '월복리 적금', '단리 복리 차이',
    '비과세종합저축', '상호금융 비과세', '새마을금고 비과세', '금융소득종합과세',
  ],
})

/* ── 빌드 시점 예시·표 — 모두 계산 엔진·lib 단일 소스에서 생성 (손으로 적은 숫자 없음) ── */
const BASE_DEP: DepositInput = { product: 'deposit', amount: 10_000_000, months: 12, ratePct: 3.5, method: 'simple', taxType: 'general' }
const BASE_SAV: DepositInput = { product: 'savings', amount: 500_000, months: 12, ratePct: 5, method: 'simple', taxType: 'general' }
const EX_DEP = calcDeposit(BASE_DEP)
const EX_DEP_M = calcDeposit({ ...BASE_DEP, method: 'monthly' })
const EX_SAV = calcDeposit(BASE_SAV)
const EX_SAV_M = calcDeposit({ ...BASE_SAV, method: 'monthly' })
const EX_SAV_COOP = calcDeposit({ ...BASE_SAV, taxType: 'coopExempt' })
const EX_SAV_30 = calcDeposit({ ...BASE_SAV, amount: 300_000 })
const EX_BIG = calcDeposit({ product: 'deposit', amount: 300_000_000, months: 36, ratePct: 4, method: 'simple', taxType: 'general' })
const EX_BIG_YEAR = calcDeposit({ product: 'deposit', amount: 300_000_000, months: 12, ratePct: 4, method: 'simple', taxType: 'general' })
const EX_SMALL = withholdInterestTax(5_000, 'general')

const lineOf = (lines: FinTaxLine[], key: FinTaxLine['key']) => lines.find(l => l.key === key)?.amount ?? 0
const DEP_INC = lineOf(EX_DEP.taxLines, 'income')
const DEP_LOC = lineOf(EX_DEP.taxLines, 'local')
const SAV_INC = lineOf(EX_SAV.taxLines, 'income')
const SAV_LOC = lineOf(EX_SAV.taxLines, 'local')
const SAV_LOC_RAW = Math.floor(SAV_INC * LOCAL_INCOME_TAX_RATIO)
const SAV_FLAT = Math.round(EX_SAV.grossInterest * GENERAL_FIN_TAX_PCT / 100)
const SAV_RURAL = lineOf(EX_SAV_COOP.taxLines, 'rural')
const SMALL_INC = lineOf(EX_SMALL.lines, 'income')
const SMALL_LOC = lineOf(EX_SMALL.lines, 'local')
const SAV_N = BASE_SAV.months
const SAV_SUM_N = (SAV_N * (SAV_N + 1)) / 2
const NET_KEEP_PCT = pct2(100 - GENERAL_FIN_TAX_PCT)

/* 일 단위(연 365일) 계산 예 — 같은 원금·금리로 365일 vs 366일 (원 미만 절사, 만분율 정수 연산) */
const DEP_BP = Math.round(BASE_DEP.ratePct * 100)
const dayInterest = (days: number) => Math.floor((BASE_DEP.amount * DEP_BP * days) / (10_000 * 365))
const DAY_365 = dayInterest(365)
const DAY_366 = dayInterest(366)

/* 표 1 — 1,000만원 정기예금 단리 vs 월복리 (세전) */
const T1_RATES = [3, 4, 5]
const T1_MONTHS = [12, 36, 60]
const T1 = T1_RATES.map(rate => ({
  rate,
  cells: T1_MONTHS.map(m => {
    const a = calcDeposit({ ...BASE_DEP, ratePct: rate, months: m })
    const b = calcDeposit({ ...BASE_DEP, ratePct: rate, months: m, method: 'monthly' })
    return { simple: a.grossInterest, monthly: b.grossInterest, diff: b.grossInterest - a.grossInterest }
  }),
}))

/* 표 2 — 적금 금리(단리) → 같은 총액 예금 환산 금리 */
const T2_RATES = [3, 4, 5, 6, 8, 10]
const T2_MONTHS = [6, 12, 24, 36]
const EQ_5_12 = depositEquivalentOfSavings(5, 12)

/* 표 3 — 세전 이자별 과세 유형 비교 */
const T3_INTEREST = [5_000, EX_SAV.grossInterest, 1_000_000, 5_000_000]
const T3 = T3_INTEREST.map(i => ({
  i,
  general: withholdInterestTax(i, 'general').total,
  coop: withholdInterestTax(i, 'coopExempt').total,
}))

/* 표 4 — 상호금융 예탁금 가입 시기별 과세 (조세특례제한법 §89의3, 2025.12.23 개정 — 가입일 기준) */
const COOP_RATES = [0, ...COOP_REDUCED_RATES]
const COOP_REDUCED = COOP_REDUCED_RATES.map(ratePct)
const COOP_REDUCED_TOTAL = COOP_REDUCED_RATES.map(r => ratePct(coopDepositTotalRate(r)))
const COOP_RURAL_PCT = ratePct(COOP_DEPOSIT.exemptRuralTaxRate)
const joinRange = (from: number, to?: number) =>
  from === 0 ? `${to}년까지 가입` : to === undefined ? `${from}년 이후 가입` : from === to ? `${from}년 가입` : `${from}~${to}년 가입`
const STD_LAST = coopExemptLastJoinYear('standard')
const HIGH_LAST = coopExemptLastJoinYear('highIncome')
const HIGH_TAXED = (COOP_DEPOSIT.groups.find(g => g.id === 'highIncome')?.phases ?? []).filter(p => p.rate > 0)
/** '2026년 가입분 5%(농어촌특별세 포함 5.9%), 2027년 이후 가입분 9%(9.5%)' */
const HIGH_TAXED_TEXT = HIGH_TAXED.map((p, i) =>
  `${p.joinYearFrom}년${p.joinYearTo === p.joinYearFrom ? '' : ' 이후'} 가입분 ${ratePct(p.rate)}%(${i === 0 ? '농어촌특별세 포함 ' : ''}${ratePct(coopDepositTotalRate(p.rate))}%)`,
).join(', ')
const COOP_MIN_AGE = COOP_DEPOSIT.minAge

/* 표 5 — 예시 적금 이자에 가입 단계별 원천징수 (소득세 + 농어촌특별세) */
const T5 = COOP_RATES.map(rate => {
  const t = withholdCoopDepositTax(EX_SAV.grossInterest, rate)
  const exempt = withholdCoopDepositTax(EX_SAV.grossInterest, rate, true)
  return { rate, income: lineOf(t.lines, 'income'), rural: lineOf(t.lines, 'rural'), total: t.total, exemptTotal: exempt.total }
})

const TFS = TAX_FREE_SAVINGS
const TFS_UNTIL = `${TFS.joinUntil.y}년 ${TFS.joinUntil.m}월 ${TFS.joinUntil.d}일`
const TFS_CHANGE = `${TFS.seniorRuleChangedFrom.y}년 ${TFS.seniorRuleChangedFrom.m}월 ${TFS.seniorRuleChangedFrom.d}일`
const COOP_SAL = manwon(COOP_DEPOSIT.incomeTest.totalSalary)
const COOP_INC = manwon(COOP_DEPOSIT.incomeTest.comprehensiveIncome)
const LOCAL_RATIO_PCT = ratePct(LOCAL_INCOME_TAX_RATIO)
const RURAL_RATIO_PCT = ratePct(RURAL_SPECIAL_TAX_RATIO)
const THRESHOLD = manwon(COMPREHENSIVE_TAX_THRESHOLD)

const LAW = {
  it129: 'https://www.law.go.kr/법령/소득세법/제129조',
  it14: 'https://www.law.go.kr/법령/소득세법/제14조',
  it86: 'https://www.law.go.kr/법령/소득세법/제86조',
  itd45: 'https://www.law.go.kr/법령/소득세법시행령/제45조',
  local: 'https://www.law.go.kr/법령/지방세법/제103조의13',
  tfs: 'https://www.law.go.kr/법령/조세특례제한법/제88조의2',
  coop: 'https://www.law.go.kr/법령/조세특례제한법/제89조의3',
  coopIncome: 'https://www.law.go.kr/법령/조세특례제한법/제88조의5',
  coopDecree: 'https://www.law.go.kr/법령/조세특례제한법시행령/제83조의3',
  rural: 'https://www.law.go.kr/법령/농어촌특별세법/제5조',
  ruralDef: 'https://www.law.go.kr/법령/농어촌특별세법/제2조',
  ruralExempt: 'https://www.law.go.kr/법령/농어촌특별세법시행령/제4조',
  treasury: 'https://www.law.go.kr/법령/국고금관리법/제47조',
  ntsTiming: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6476&cntntsId=7912',
  ntsExempt: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6474&cntntsId=7910',
}

const FAQ_LD = [
  {
    q: `연 ${BASE_SAV.ratePct}% 적금인데 이자가 생각보다 적은 이유는 무엇인가요?`,
    a: `적금은 넣은 돈 전체가 1년 내내 예치되지 않기 때문입니다. 월 ${won(BASE_SAV.amount)}원을 ${SAV_N}개월 넣으면 첫 달 돈은 ${SAV_N}개월, 마지막 달 돈은 1개월만 이자를 받습니다. 세전 이자는 ${won(BASE_SAV.amount)} × ${BASE_SAV.ratePct}% ÷ 12 × ${SAV_SUM_N} = <strong>${won(EX_SAV.grossInterest)}원</strong>으로, 총 납입 ${manwon(EX_SAV.principal)}을 처음부터 예금에 넣었다고 치면 <strong>연 약 ${pct2(EX_SAV.depositEquivPct)}% 예금</strong>과 같습니다. 환산식은 적금 금리 × (n+1) ÷ 2n입니다.`,
  },
  {
    q: '예금 이자에서 세금은 정확히 얼마나 떼나요?',
    a: `일반 예·적금은 이자소득세 ${WITHHOLDING_PCT}%와 그 ${LOCAL_RATIO_PCT}%인 지방소득세(이자 대비 ${LOCAL_TAX_PCT}%)를 떼어 합계 ${GENERAL_FIN_TAX_PCT}%입니다. 각 세액은 ${TAX_ROUNDING_UNIT}원 미만을 버립니다. ${manwon(BASE_DEP.amount)}을 연 ${BASE_DEP.ratePct}% 단리로 ${BASE_DEP.months}개월 맡기면 세전 이자 ${won(EX_DEP.grossInterest)}원에서 소득세 ${won(DEP_INC)}원·지방소득세 ${won(DEP_LOC)}원을 떼고 <strong>세후 ${won(EX_DEP.netInterest)}원</strong>, 만기에 ${won(EX_DEP.maturity)}원을 받습니다.`,
  },
  {
    q: '단리와 월복리는 실제로 얼마나 차이 나나요?',
    a: `기간이 짧으면 차이가 작습니다. ${manwon(BASE_DEP.amount)}·연 ${BASE_DEP.ratePct}%·${BASE_DEP.months}개월 예금은 단리 ${won(EX_DEP.grossInterest)}원, 월복리 ${won(EX_DEP_M.grossInterest)}원으로 세전 ${won(EX_DEP_M.grossInterest - EX_DEP.grossInterest)}원 차이입니다. 월 ${won(BASE_SAV.amount)}원·연 ${BASE_SAV.ratePct}% ${SAV_N}개월 적금도 단리 ${won(EX_SAV.grossInterest)}원 vs 월복리 ${won(EX_SAV_M.grossInterest)}원입니다. 금리가 높고 기간이 길수록 벌어지므로 3년 이상 상품이라면 본문 표 1에서 확인하세요.`,
  },
  {
    q: '이자가 몇천 원뿐이어도 세금을 떼나요?',
    a: `네. 원천징수세액이 ${won(SMALL_TAX_EXEMPT_LIMIT)}원 미만이면 걷지 않는 소액부징수(소득세법 §86)는 이자소득에는 적용되지 않습니다. 이자 ${won(5_000)}원이면 소득세 ${won(SMALL_INC)}원·지방소득세 ${won(SMALL_LOC)}원이 원천징수됩니다.`,
  },
  {
    q: '비과세종합저축은 누가 가입할 수 있나요?',
    a: `${TFS.article}에 따라 ${TFS.eligible.slice(0, 5).join(', ')} 등이 1인당 저축원금 ${manwon(TFS.limitPerPerson)}까지 가입할 수 있고, 이자·배당에 세금이 붙지 않습니다. ${TFS_CHANGE} 이후 가입분부터 65세 이상 요건이 &lsquo;기초연금 수급자&rsquo;로 좁혀졌고, 가입 기한은 ${TFS_UNTIL}입니다. ${TFS.excluded}은 가입할 수 없습니다.`,
  },
  {
    q: `농협·새마을금고 예탁금은 세금이 정말 ${COOP_RURAL_PCT}%뿐인가요?`,
    a: `${HIGH_LAST}년 12월 31일까지 가입한 예탁금은 그렇습니다. 조합원(준조합원·회원)의 예탁금 1인당 ${manwon(COOP_DEPOSIT.limitPerPerson)}까지는 이자소득세·지방소득세 없이 농어촌특별세 ${COOP_RURAL_PCT}%만 뗍니다. 2025년 12월 개정으로 ${HIGH_LAST + 1}년 이후 가입분은 가입한 해와 가입자에 따라 달라집니다. ${COOP_DEPOSIT.memberUnions} 조합원이거나 직전 과세기간 총급여 ${COOP_SAL}(종합소득금액 ${COOP_INC}) 이하인 사람은 ${STD_LAST}년 가입분까지 비과세이고, 그 밖의 가입자는 ${HIGH_TAXED_TEXT}입니다. 이자를 받는 해가 아니라 <strong>가입한 해</strong>가 기준이며, 농어민·임업인 등은 농어촌특별세도 면제됩니다.`,
  },
  {
    q: `예금 이자가 ${THRESHOLD}을 넘으면 어떻게 되나요?`,
    a: `한 해 이자·배당 합계가 ${THRESHOLD} 이하이면 은행이 뗀 ${GENERAL_FIN_TAX_PCT}%로 끝나지만(소득세법 §14③6호), 넘으면 초과분이 다른 소득과 합산되어 다음 해 5월 종합소득세를 신고해야 합니다. 예·적금 이자는 실제로 받은 날이 속한 해의 소득이라, 3년 만기 일시 지급 예금은 3년치 이자가 한 해에 잡힙니다. 3억원을 연 4% 단리로 36개월 맡기면 만기 해 이자가 ${manwon(EX_BIG.grossInterest)}으로 기준을 넘지만, 1년 만기로 나누면 해마다 ${manwon(EX_BIG_YEAR.grossInterest)}입니다.`,
  },
  {
    q: '만기 전에 해지하면 이자는 얼마나 받나요?',
    a: '약정 금리가 아니라 은행이 상품별로 정한 중도해지 이율(예치 기간 구간별로 약정 금리보다 낮은 비율)이 적용됩니다. 이 계산기의 월별 누적 이자 표는 만기까지 유지할 때의 약정 이자라 중도해지 환급금과 다릅니다. 정확한 금액은 은행 앱이나 창구에서 중도해지 예상 금액을 조회해 확인하세요.',
  },
  {
    q: '은행 앱 금액과 몇 원~몇백 원 다른 이유는 무엇인가요?',
    a: `이 계산기는 개월 수를 12로 나누는 월 단위 공식입니다. 예치 일수를 365로 나누는 일 단위 상품이면 같은 12개월도 기간 안에 2월 29일이 끼는지에 따라 달라집니다 — ${manwon(BASE_DEP.amount)}·연 ${BASE_DEP.ratePct}%라면 365일 ${won(DAY_365)}원, 366일 ${won(DAY_366)}원입니다. 적금은 회차별 실제 입금일, 우대금리 충족 여부도 차이를 만듭니다.`,
  },
]

export default function DepositInterestPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/deposit-interest">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />예·적금 이자 계산기
      </h1>
      <p className="tp-lead">
        정기예금·정기적금의 세전 이자와 <strong>세금을 뗀 만기 수령액</strong>을 계산합니다. 이자소득세·지방소득세는 은행처럼 10원 미만을 버리고, 적금 금리를 예금 금리로 환산해 비교해 줍니다.
      </p>

      <UpdatedMeta
        date={FIN_TAX_REVIEWED}
        basis={`이자소득 원천징수 ${WITHHOLDING_PCT}% + 지방소득세 ${LOCAL_TAX_PCT}%(합계 ${GENERAL_FIN_TAX_PCT}%, 각 ${TAX_ROUNDING_UNIT}원 미만 절사) · 비과세종합저축·상호금융 예탁금은 2025년 12월 23일 개정 조세특례제한법 §88의2·§89의3(가입일 기준) 조문 대조 · 이자는 월 단위(개월/12) 공식`}
        sources={[
          { label: '소득세법 §129', href: LAW.it129 },
          { label: '조세특례제한법 §89의3', href: LAW.coop },
          { label: '국세청 비과세 금융소득', href: LAW.ntsExempt },
        ]}
      />

      <DepositInterestClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <section>
          <h2 className="g-h2">예금·적금 이자 공식 — 단리와 월복리</h2>
          <p className="g-p">
            정기예금은 목돈을 한 번에 맡기고, 정기적금은 매달 같은 금액을 나눠 넣습니다. 두 상품 모두 &lsquo;연 몇 %&rsquo;로 광고하지만 이자가 붙는 원금의 크기와 기간이 달라서 같은 금리여도 받는 이자는 크게 다릅니다.
            이 계산기는 은행 상품설명서에서 흔히 쓰는 <strong>월 단위 공식(개월 수 ÷ 12)</strong>을 그대로 씁니다. 연이율을 r, 기간을 n개월이라고 하면 다음과 같습니다.
          </p>
          <ul className="g-list">
            <li><strong>정기예금 단리</strong> — 이자 = 원금 × r × n ÷ 12</li>
            <li><strong>정기예금 월복리</strong> — 이자 = 원금 × {'{'}(1 + r/12)<sup>n</sup> − 1{'}'}</li>
            <li><strong>정기적금 단리</strong> — 이자 = 월 납입액 × r/12 × n(n+1)/2</li>
            <li><strong>정기적금 월복리</strong> — 이자 = 월 납입액 × (1 + r/12) × {'{'}(1 + r/12)<sup>n</sup> − 1{'}'} ÷ (r/12) − 월 납입액 × n</li>
          </ul>
          <p className="g-p">
            적금 단리식의 n(n+1)/2는 &lsquo;회차별로 돈이 머무는 개월 수의 합&rsquo;입니다. {SAV_N}개월 적금이라면 첫 달에 넣은 돈은 {SAV_N}개월, 둘째 달 돈은 {SAV_N - 1}개월, 마지막 달 돈은 1개월만 은행에 있습니다. 1부터 {SAV_N}까지 더하면 {SAV_SUM_N}이므로
            월 {won(BASE_SAV.amount)}원·연 {BASE_SAV.ratePct}% 적금의 세전 이자는 {won(BASE_SAV.amount)} × {BASE_SAV.ratePct}% ÷ 12 × {SAV_SUM_N} = <strong>{won(EX_SAV.grossInterest)}원</strong>입니다.
          </p>
          <p className="g-p">
            예금으로 계산해 보면, {manwon(BASE_DEP.amount)}을 연 {BASE_DEP.ratePct}% 단리로 {BASE_DEP.months}개월 맡길 때 세전 이자는 {won(BASE_DEP.amount)} × {BASE_DEP.ratePct}% × {BASE_DEP.months}/12 = <strong>{won(EX_DEP.grossInterest)}원</strong>입니다.
            여기서 이자소득세 {won(DEP_INC)}원과 지방소득세 {won(DEP_LOC)}원을 떼면 세후 이자는 {won(EX_DEP.netInterest)}원, 만기에 통장에 들어오는 돈은 <strong>{won(EX_DEP.maturity)}원</strong>입니다.
            같은 조건을 월복리로 바꾸면 세전 이자가 {won(EX_DEP_M.grossInterest)}원으로 {won(EX_DEP_M.grossInterest - EX_DEP.grossInterest)}원 늘어납니다. 월복리 효과는 금리가 높고 기간이 길수록 커지지만, 1년짜리 상품에서는 생각보다 작습니다.
          </p>
          <DataFigure n={1} title={`${manwon(BASE_DEP.amount)} 정기예금 — 단리 vs 월복리 세전 이자`} unit="단위: 원" source={<>자료: 위 공식으로 Youtil 계산(원 미만 절사). 실제 상품은 이자 계산 방식이 상품설명서에 따라 다릅니다.</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">연이율</th>
                  {T1_MONTHS.map(m => <th key={m} scope="col" className="r">{m}개월 단리 → 월복리</th>)}
                </tr>
              </thead>
              <tbody>
                {T1.map(row => (
                  <tr key={row.rate}>
                    <th scope="row">연 {row.rate}%</th>
                    {row.cells.map((c, i) => (
                      <td key={i} className="r">{won(c.simple)} → {won(c.monthly)}<small>+{won(c.diff)}</small></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </section>

        {/* ── 2. 적금 ↔ 예금 환산 ── */}
        <section>
          <h2 className="g-h2">적금 금리가 예금의 절반 수준인 이유 — 실효금리 환산</h2>
          <p className="g-p">
            &lsquo;연 {BASE_SAV.ratePct}% 적금&rsquo;은 연 {BASE_SAV.ratePct}% 예금보다 이자가 훨씬 적습니다. 적금은 총 납입액 전체가 기간 내내 예치되는 것이 아니라, 평균적으로 <strong>(n+1)/2개월</strong>만 예치되기 때문입니다.
            {SAV_N}개월 적금의 평균 예치 기간은 {pct2((SAV_N + 1) / 2)}개월이므로, 같은 총액을 첫 달에 한꺼번에 예금에 넣었다고 치면 연 {BASE_SAV.ratePct}% × {pct2((SAV_N + 1) / 2)}/{SAV_N} ≈ <strong>연 {pct2(EQ_5_12)}% 예금</strong>과 이자가 같습니다.
          </p>
          <p className="g-p">
            환산식은 <strong>예금 환산 금리 = 적금 금리 × (n+1) ÷ 2n</strong>입니다. 거꾸로 예금 금리를 적금 금리로 바꾸려면 × 2n ÷ (n+1)을 하면 됩니다 — 연 {BASE_DEP.ratePct}% {BASE_DEP.months}개월 예금과 같은 이자를 주는 적금은 연 {pct2(savingsRateForSameInterest(BASE_DEP.ratePct, BASE_DEP.months))}%여야 합니다.
            기간이 길어질수록 (n+1)/2n이 1/2에 가까워지므로 &lsquo;적금 금리의 약 절반 = 예금 환산 금리&rsquo;라고 기억하면 편합니다.
          </p>
          <DataFigure n={2} title="적금(단리) 금리 → 같은 총액 예금 환산 금리" unit="단위: 연 %" source={<>자료: 예금 환산 금리 = 적금 금리 × (n+1) ÷ 2n — Youtil 계산(세전, 단리 기준)</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">적금 금리</th>
                  {T2_MONTHS.map(m => <th key={m} scope="col" className="r">{m}개월</th>)}
                </tr>
              </thead>
              <tbody>
                {T2_RATES.map(rate => (
                  <tr key={rate}>
                    <th scope="row">연 {rate}%</th>
                    {T2_MONTHS.map(m => <td key={m} className="r">{pct2(depositEquivalentOfSavings(rate, m))}%</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            이 비교는 &lsquo;이미 목돈이 있을 때&rsquo; 의미가 있습니다. 매달 월급에서 떼어 모으는 돈이라면 적금 외에 대안이 마땅치 않으므로 환산 금리가 낮다고 적금이 손해인 것은 아닙니다.
            반대로 목돈을 굴릴 곳을 찾는 중이라면 &lsquo;고금리 적금 특판&rsquo;의 숫자를 그대로 예금 금리와 비교하면 안 되고, 위 표처럼 환산한 뒤 비교해야 합니다.
            적립식으로 오래 굴릴 때의 복리 효과는 <Link href="/tools/finance/compound">복리 계산기</Link>에서 연 단위로 따로 볼 수 있습니다.
          </p>
          <Callout tone="tip" title="특판 적금은 월 납입 한도부터 확인">
            광고 속 최고 금리는 급여이체·카드 실적 같은 우대 조건을 모두 채웠을 때의 값이고, 고금리 적금일수록 월 납입 한도가 작습니다. 연 {BASE_SAV.ratePct}%라도 월 {won(300_000)}원 한도라면 {SAV_N}개월 세전 이자는 {won(EX_SAV_30.grossInterest)}원, 세후 {won(EX_SAV_30.netInterest)}원입니다. 계산기에는 조건을 실제로 채울 수 있는 금리만 넣으세요.
          </Callout>
        </section>

        {/* ── 3. 세금 ── */}
        <section>
          <h2 className="g-h2">이자에서 떼는 세금 {GENERAL_FIN_TAX_PCT}% — 구성과 10원 미만 절사</h2>
          <p className="g-p">
            은행은 이자를 줄 때 세금을 먼저 떼고(원천징수) 나머지만 입금합니다. 일반 예·적금 이자에는 소득세 <strong>{WITHHOLDING_PCT}%</strong>가 붙고(<a href={LAW.it129} target="_blank" rel="noopener noreferrer">소득세법 §129①1호</a>),
            그 소득세의 {LOCAL_RATIO_PCT}%가 개인지방소득세로 함께 걷힙니다(<a href={LAW.local} target="_blank" rel="noopener noreferrer">지방세법 §103의13</a>). 이자 대비로는 {WITHHOLDING_PCT}% + {LOCAL_TAX_PCT}% = <strong>{GENERAL_FIN_TAX_PCT}%</strong>이고, 세후 이자는 대략 이자의 {NET_KEEP_PCT}%입니다.
          </p>
          <p className="g-p">
            세액의 {TAX_ROUNDING_UNIT}원 미만 끝수는 버립니다(<a href={LAW.treasury} target="_blank" rel="noopener noreferrer">국고금 관리법 §47①</a>). 소득세를 먼저 {TAX_ROUNDING_UNIT}원 미만 절사하고, 그 소득세의 {LOCAL_RATIO_PCT}%를 다시 {TAX_ROUNDING_UNIT}원 미만 절사해 지방소득세를 구합니다.
            월 {won(BASE_SAV.amount)}원 적금의 세전 이자 {won(EX_SAV.grossInterest)}원이라면 소득세 {won(SAV_INC)}원, 지방소득세는 {won(SAV_LOC_RAW)}원에서 끝수를 버린 {won(SAV_LOC)}원으로 합계 {won(SAV_INC + SAV_LOC)}원입니다.
            이자에 {GENERAL_FIN_TAX_PCT}%를 한 번에 곱한 {won(SAV_FLAT)}원과 몇 원 차이가 나는 것은 이 때문이고, 두 번 절사하므로 차이는 20원을 넘지 않습니다.
          </p>
          <p className="g-p">
            원천징수세액이 {won(SMALL_TAX_EXEMPT_LIMIT)}원 미만이면 걷지 않는 소액부징수 규정(<a href={LAW.it86} target="_blank" rel="noopener noreferrer">소득세법 §86</a>)은 <strong>이자소득에는 적용되지 않습니다</strong>(같은 조 1호).
            그래서 이자가 {won(5_000)}원뿐이어도 소득세 {won(SMALL_INC)}원과 지방소득세 {won(SMALL_LOC)}원이 원천징수됩니다.
          </p>
          <DataFigure n={3} title="세전 이자별 원천징수 세액 — 과세 유형 비교" unit="단위: 원" source={<>자료: 소득세법 §129·지방세법 §103의13·농어촌특별세법 §5 세율, 국고금 관리법 §47 끝수 절사 — Youtil 계산</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">세전 이자</th>
                  <th scope="col" className="r">일반과세 {GENERAL_FIN_TAX_PCT}%</th>
                  <th scope="col" className="r">조합 예탁금 {COOP_RURAL_PCT}%</th>
                  <th scope="col" className="r">비과세종합저축</th>
                </tr>
              </thead>
              <tbody>
                {T3.map(row => (
                  <tr key={row.i}>
                    <th scope="row">{won(row.i)}</th>
                    <td className="r">−{won(row.general)}<small>세후 {won(row.i - row.general)}</small></td>
                    <td className="r">−{won(row.coop)}<small>세후 {won(row.i - row.coop)}</small></td>
                    <td className="r">0<small>세후 {won(row.i)}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </section>

        {/* ── 4. 비과세·저율과세 ── */}
        <section>
          <h2 className="g-h2">비과세종합저축과 상호금융 예탁금 — 2025년 12월 개정 반영</h2>
          <p className="g-p">
            <strong>비과세종합저축</strong>(<a href={LAW.tfs} target="_blank" rel="noopener noreferrer">{TFS.article}</a>)은 가입 대상자가 1인당 저축원금 <strong>{manwon(TFS.limitPerPerson)}</strong>까지 넣은 예·적금의 이자·배당에 세금을 전혀 매기지 않는 제도입니다.
            소득세·지방소득세가 모두 0원이라 위 예시 적금이라면 세전 이자 {won(EX_SAV.grossInterest)}원을 그대로 받습니다. 2025년 12월 개정으로 가입 기한이 <strong>{TFS_UNTIL}</strong>까지 연장되었고,
            {' '}{TFS_CHANGE} 이후 가입분부터 고령자 요건이 &lsquo;만 65세 이상&rsquo;에서 &lsquo;만 65세 이상 기초연금 수급자&rsquo;로 좁혀졌습니다. 그 전에 가입한 계좌는 만기까지 비과세가 유지됩니다.
          </p>
          <ul className="g-list">
            {TFS.eligible.map(e => <li key={e}>{e}</li>)}
          </ul>
          <p className="g-p">
            단, <strong>{TFS.excluded}</strong>은 가입할 수 없습니다. 한도 {manwon(TFS.limitPerPerson)}은 은행마다가 아니라 모든 금융회사의 비과세종합저축을 합친 금액이고, 자격은 가입하는 금융회사가 확인합니다.
          </p>
          <p className="g-p">
            <strong>상호금융 예탁금</strong>(<a href={LAW.coop} target="_blank" rel="noopener noreferrer">{COOP_DEPOSIT.article}</a>)은 농협·수협·신협·산림조합·새마을금고의 조합원(준조합원·회원 포함) 가운데 가입 당시 {COOP_MIN_AGE}세 이상인 거주자가 1인당 예탁금 <strong>{manwon(COOP_DEPOSIT.limitPerPerson)}</strong>까지 받는 혜택입니다. 한도는 모든 조합의 예탁금을 합친 금액입니다(<a href={LAW.coopDecree} target="_blank" rel="noopener noreferrer">같은 법 시행령 §83의3①</a>).
            이자소득세와 지방소득세가 면제되는 대신, 면제받은 세액(이자의 {WITHHOLDING_PCT}%)의 {RURAL_RATIO_PCT}%가 농어촌특별세로 붙어(<a href={LAW.rural} target="_blank" rel="noopener noreferrer">농어촌특별세법 §5①2호·④</a>) 실제 세율은 <strong>{COOP_RURAL_PCT}%</strong>입니다.
            위 예시 적금이라면 세금이 {won(SAV_RURAL)}원뿐이어서 세후 이자가 {won(EX_SAV_COOP.netInterest)}원으로, 일반과세보다 {won(EX_SAV_COOP.netInterest - EX_SAV.netInterest)}원 많습니다.
          </p>
          <p className="g-p">
            2025년 12월 23일 개정(2026년 1월 1일 시행)으로 이 비과세는 <strong>가입한 해와 가입자</strong>에 따라 끝나는 시점이 달라졌습니다. 기준은 이자를 받는 해가 아니라 가입한 해입니다 — 조문이 &lsquo;{HIGH_TAXED[0]?.joinYearFrom}년 1월 1일부터 {HIGH_TAXED[0]?.joinYearTo}년 12월 31일까지 가입함으로써 발생하는 이자소득&rsquo;처럼 가입일로 단계를 나눕니다.
            {' '}{HIGH_LAST}년 12월 31일까지 가입한 예탁금은 소득과 관계없이 비과세입니다(§89의3①). {HIGH_LAST + 1}년 이후 가입분은 <strong>{COOP_DEPOSIT.memberUnions}의 조합원</strong>이거나 직전 과세기간 소득이 기준 이하인 사람만 {STD_LAST}년 가입분까지 비과세가 이어지고(§89의3②),
            {' '}그 밖의 가입자는 {HIGH_TAXED_TEXT}로 분리과세됩니다. 저율과세 이자는 종합소득에 합산하지 않고 개인지방소득세도 붙지 않습니다.
            {' '}개정 전 조문은 이자가 <em>발생한 해</em>를 기준으로 {HIGH_LAST + 1}년 발생분 {COOP_REDUCED[0]}%, {HIGH_LAST + 2}년 이후 발생분 {COOP_REDUCED[1]}%를 매기도록 되어 있었으므로, 개정 전에 나온 기사·안내문과 내용이 다를 수 있습니다.
          </p>
          <p className="g-p">
            소득 기준은 두 갈래입니다(<a href={LAW.coopIncome} target="_blank" rel="noopener noreferrer">조세특례제한법 §88의5②1호</a>). 직전 과세기간 소득이 근로소득뿐이라면(종합소득에 합산되지 않는 분리과세 소득은 있어도 됨) <strong>총급여 {COOP_SAL} 이하</strong>, 다른 종합소득도 있었다면 <strong>종합소득금액 {COOP_INC} 이하</strong>(총급여 {COOP_SAL} 초과 근로소득이 있으면 제외)여야 합니다.
            조합원 자격이 아니라 소득 기준으로 비과세를 받으려면 세무서에서 소득확인증명서를 발급받아 조합에 내야 합니다(<a href={LAW.coopDecree} target="_blank" rel="noopener noreferrer">시행령 §83의3②</a>). 소득과 무관한 조합원 요건은 {COOP_DEPOSIT.memberUnions}의 &lsquo;조합원&rsquo;에만 있으므로(시행령 §82의5②), 이들 조합의 준조합원과 신협·새마을금고 회원은 이 소득 기준으로 판단합니다.
            예를 들어 소득 기준을 넘는 새마을금고 회원이 {HIGH_TAXED[0]?.joinYearFrom}년에 12개월 예탁금에 가입하면, 만기 이자를 이듬해에 받더라도 가입한 해 기준인 {COOP_REDUCED[0]}% 단계가 적용됩니다. 만기 후 재예치나 기간 연장이 새 가입으로 처리되는지는 조합에 확인하세요.
          </p>
          <DataFigure n={4} title="상호금융 예탁금 이자 — 가입 연도·가입자별 과세" unit={`1인당 ${manwon(COOP_DEPOSIT.limitPerPerson)} 한도`} source={<>자료: {COOP_DEPOSIT.article}①·②(2025년 12월 23일 개정, 가입일 기준), §88의5②1호(소득 기준). 괄호는 농어촌특별세(농어촌특별세법 §5①2호·④)를 더한 합계세율. {HIGH_LAST}년까지 가입분은 두 그룹 모두 비과세</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">가입자</th>
                  {COOP_RATES.map(rate => (
                    <th key={rate} scope="col" className="wrap">{rate === 0 ? `비과세 (${COOP_RURAL_PCT}%)` : `소득세 ${ratePct(rate)}% (${ratePct(coopDepositTotalRate(rate))}%)`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COOP_DEPOSIT.groups.map(g => (
                  <tr key={g.id}>
                    <th scope="row" className="wrap">{g.label}</th>
                    {COOP_RATES.map(rate => {
                      const p = g.phases.find(ph => ph.rate === rate)
                      return <td key={rate} className="wrap">{p ? joinRange(p.joinYearFrom, p.joinYearTo) : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
          <p className="g-p">
            저율과세 가입분에도 농어촌특별세가 붙습니다. 농어촌특별세법은 예탁금의 비과세뿐 아니라 {COOP_REDUCED.join('%·')}% 특례세율 적용도 &lsquo;감면&rsquo;으로 보고(<a href={LAW.ruralDef} target="_blank" rel="noopener noreferrer">§2①2호</a>), 감면세액을 &lsquo;이자 × {WITHHOLDING_PCT}% − 실제 낸 소득세&rsquo;로 계산하기 때문입니다(§5④).
            그래서 합계세율은 {COOP_REDUCED.map((p, i) => `${p}% 가입분 ${COOP_REDUCED_TOTAL[i]}%`).join(', ')}입니다. 다만 다음 사람의 예탁금 감면에는 농어촌특별세를 매기지 않으므로(<a href={LAW.ruralExempt} target="_blank" rel="noopener noreferrer">농어촌특별세법 시행령 §4⑦3호</a>) 비과세 가입분은 0%, 저율과세 가입분은 소득세율 그대로입니다.
          </p>
          <ul className="g-list">
            {COOP_DEPOSIT.ruralTaxExemptPersons.map(e => <li key={e}>{e}</li>)}
          </ul>
          <p className="g-p">
            계산기의 &lsquo;상호금융 예탁금&rsquo;은 비과세({COOP_RURAL_PCT}%) 기준이므로, 저율과세 가입분이거나 농어촌특별세 면제 대상이면 아래 표의 합계세율을 &lsquo;세율 직접 입력&rsquo;에 넣으세요. 위 예시 적금(세전 이자 {won(EX_SAV.grossInterest)}원)으로 계산하면 다음과 같습니다.
          </p>
          <DataFigure n={5} title={`예탁금 세전 이자 ${won(EX_SAV.grossInterest)}원 — 가입 단계별 원천징수`} unit="단위: 원" source={<>자료: 조세특례제한법 §89의3, 농어촌특별세법 §5①2호·④·시행령 §4⑦3호, 국고금 관리법 §47 끝수 절사 — Youtil 계산. 비교: 일반과세 {GENERAL_FIN_TAX_PCT}%면 {won(EX_SAV.taxTotal)}원</>}>
            <table>
              <thead>
                <tr>
                  <th scope="col">가입 단계</th>
                  <th scope="col" className="r">소득세</th>
                  <th scope="col" className="r">농어촌특별세</th>
                  <th scope="col" className="r">합계</th>
                  <th scope="col" className="r wrap">농특세 면제 대상</th>
                </tr>
              </thead>
              <tbody>
                {T5.map(row => (
                  <tr key={row.rate}>
                    <th scope="row">{row.rate === 0 ? '비과세' : `소득세 ${ratePct(row.rate)}%`}</th>
                    <td className="r">{won(row.income)}</td>
                    <td className="r">{won(row.rural)}</td>
                    <td className="r">{won(row.total)}<small>{ratePct(coopDepositTotalRate(row.rate))}%</small></td>
                    <td className="r">{won(row.exemptTotal)}<small>{ratePct(coopDepositTotalRate(row.rate, true))}%</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </section>

        {/* ── 5. 은행 계산과 차이 ── */}
        <section>
          <h2 className="g-h2">은행 앱 금액과 다른 이유 — 일수 계산·입금일·중도해지</h2>
          <p className="g-p">
            이 계산기는 개월 수를 12로 나누는 월 단위 공식을 씁니다. 실제 상품은 상품설명서의 &lsquo;이자 계산 방법&rsquo;에 따라 월 단위로 계산하기도 하고, <strong>예치 일수를 365로 나누는 일 단위</strong>로 계산하기도 합니다.
            일 단위라면 같은 12개월이라도 기간 안에 2월 29일이 끼는지에 따라 이자가 달라집니다. {manwon(BASE_DEP.amount)}·연 {BASE_DEP.ratePct}%라면 365일은 {won(DAY_365)}원, 366일은 {won(DAY_366)}원입니다.
          </p>
          <p className="g-p">
            <strong>적금 입금일</strong>도 차이를 만듭니다. 은행은 회차마다 실제로 입금한 날부터 만기까지를 따져 이자를 계산하므로, 매달 약정일에 넣으면 이 계산기의 공식과 거의 같지만 입금이 늦어지면 상품에 따라 만기일이 뒤로 밀리거나 늦은 기간만큼 이자가 줄어듭니다.
            미리 여러 회차를 넣는 선납이 가능한 상품도 있으니 상품설명서의 입금 규칙을 확인하세요.
          </p>
          <p className="g-p">
            <strong>중도해지</strong>하면 약정 금리가 아니라 예치 기간 구간별로 정한 중도해지 이율이 적용되어 이자가 크게 줄어듭니다. 계산기의 월별 누적 이자 표는 만기까지 유지할 때 달마다 쌓이는 약정 이자이지 해지 환급금이 아닙니다.
            만기일이 지나 찾지 않은 돈에는 대개 약정 금리보다 낮은 만기 후 이율이 붙습니다. 마지막으로, 입력하는 연이율은 <strong>실제로 받을 금리</strong>(기본 금리 + 충족한 우대 금리)여야 합니다.
          </p>
        </section>

        {/* ── 6. 금융소득종합과세 ── */}
        <section>
          <h2 className="g-h2">금융소득종합과세 {THRESHOLD}과 이자를 받는 시점</h2>
          <p className="g-p">
            한 해 이자·배당 합계가 <strong>{THRESHOLD} 이하</strong>이면 은행이 뗀 {GENERAL_FIN_TAX_PCT}%로 납세가 끝납니다(분리과세, <a href={LAW.it14} target="_blank" rel="noopener noreferrer">소득세법 §14③6호</a>). 넘으면 초과분이 근로·사업·연금소득 등과 합산되어 다음 해 5월 종합소득세를 신고해야 하고,
            합산된 세율이 {WITHHOLDING_PCT}%보다 높으면 추가 세금을 냅니다. 비과세종합저축 이자처럼 비과세되는 이자나 조합 예탁금 저율 분리과세 이자는 이 합계에 들어가지 않습니다.
          </p>
          <p className="g-p">
            예·적금 이자는 원칙적으로 <strong>실제로 이자를 받는 날</strong>이 속한 해의 소득입니다(<a href={LAW.itd45} target="_blank" rel="noopener noreferrer">소득세법 시행령 §45</a>, <a href={LAW.ntsTiming} target="_blank" rel="noopener noreferrer">국세청 금융소득의 수입시기</a>). 만기에 이자를 한꺼번에 받는 장기 예금은 여러 해치 이자가 한 해에 몰립니다.
            3억원을 연 4% 단리로 36개월 맡기면 만기 해의 이자가 <strong>{manwon(EX_BIG.grossInterest)}</strong>으로 기준을 넘지만, 같은 돈을 1년 만기로 굴리며 해마다 이자를 받으면 해마다 {manwon(EX_BIG_YEAR.grossInterest)}씩 나뉩니다.
            종합과세가 걱정되는 규모라면 만기 시점을 나누거나 비과세·분리과세 상품을 먼저 채우는 것이 일반적인 방법입니다. 배당소득과의 합산 관리는 <Link href="/tools/finance/dividend">월배당 목표 자산 계산기</Link>의 종합과세 탭에서도 볼 수 있습니다.
          </p>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        <section>
          <Disclaimer
            variant="finance"
            open
            sources={[
              { label: '소득세법 §129 (원천징수세율)', href: LAW.it129 },
              { label: '지방세법 §103의13 (특별징수)', href: LAW.local },
              { label: '조세특례제한법 §88의2 (비과세종합저축)', href: LAW.tfs },
              { label: '조세특례제한법 §89의3 (조합등예탁금)', href: LAW.coop },
              { label: '조세특례제한법 §88의5 (소득 기준)', href: LAW.coopIncome },
              { label: '농어촌특별세법 §5 (감면세액의 10%)', href: LAW.rural },
              { label: '국고금 관리법 §47 (끝수 계산)', href: LAW.treasury },
              { label: '국세청 — 금융소득의 수입시기', href: LAW.ntsTiming },
            ]}
          >
            본 계산기는 월 단위(개월/12) 공식과 {FIN_TAX_REVIEWED} 기준 세법으로 계산한 <strong>추정치</strong>입니다. 실제 이자는 은행의 일수 계산 방식, 입금일, 우대금리 충족 여부, 중도해지·만기 후 이율에 따라 달라집니다.
            비과세·저율과세 적용 여부는 가입 자격과 한도를 금융회사가 확인해 결정하며, 금융소득종합과세 여부는 한 해 전체 금융소득으로 판단합니다.
          </Disclaimer>
        </section>

        <RelatedTools items={[
          { href: '/tools/finance/compound', desc: '적립·거치 복리를 10년·20년 시나리오로' },
          { href: '/tools/finance/dividend', desc: '예금 대신 배당 — 필요한 원금과 세후 월배당' },
          { href: '/tools/finance/savings', desc: '한 달에 얼마를 모을 수 있는지 저축률 진단' },
          { href: '/tools/finance/loan', desc: '예금 금리와 대출 금리 — 상환이 나은지 비교' },
        ]} />
      </div>
    </ToolPage>
  )
}
