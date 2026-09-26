import Link from 'next/link'
import InheritanceClient from './InheritanceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  INHERITANCE_GIFT_TAX_BRACKETS, GIFT_DEDUCTION, GENERATION_SKIP_SURCHARGE_RATE, FILING_CREDIT_RATE,
  INHERITANCE_BASIC_DEDUCTION, INHERITANCE_CHILD_DEDUCTION, INHERITANCE_LUMP_SUM_DEDUCTION,
  SPOUSE_INHERITANCE_DEDUCTION_MIN, SPOUSE_INHERITANCE_DEDUCTION_MAX, FUNERAL_DEDUCTION_MIN,
  FINANCIAL_ASSET_DEDUCTION, COHABIT_HOME_DEDUCTION_MAX, financialAssetDeduction,
} from '@/lib/krInheritanceTax'
import { calcInheritanceTax, calcGiftTax, getSpouseLegalShare, formatShortKRW } from './inheritanceUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/inheritance',
  title: '상속·증여세 계산기 2026 — 분배·배우자공제·10년 주기 절세',
  description: '관계별 공제·10년 합산·배우자 공제를 반영한 상속·증여세 추정. 상속인별 분배·유류분 확인과 분산 증여 시뮬레이션으로 절세 전략까지 참고할 수 있습니다.',
  keywords: [
    '상속세계산기', '증여세계산기', '상속증여비교', '증여세공제', '상속세공제',
    '분할증여계산기', '자녀증여세', '배우자상속공제', '법정상속분',
    '10년 합산 증여', '분산 증여', '미성년 자녀 증여', '한국 상속세',
    '유류분', '상속인 분배', '부동산 증여', '부담부증여',
  ],
})

const relCard: React.CSSProperties = {
  display: 'block',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  textDecoration: 'none',
}

/* ── 가이드 표·예시: 모두 계산기와 같은 엔진(inheritanceUtils · lib/krInheritanceTax)에서 빌드 시점 생성 ── */
const EOK = 100_000_000
const krw = formatShortKRW
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`
const eok2 = (n: number) => `${(n / EOK).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}억원`

/** 표 1 — 증여재산공제 (§53·§53의2) */
const GIFT_ROWS: { who: string; sub?: string; amount: string; note: string }[] = [
  { who: '배우자', amount: krw(GIFT_DEDUCTION.spouse), note: '법률혼 배우자' },
  { who: '성인 자녀·손자녀', sub: '부모·조부모 등 직계존속에게서', amount: krw(GIFT_DEDUCTION.adultDescendant), note: '증여일 현재 만 19세 이상. 증여자 모두 합산' },
  { who: '미성년 자녀·손자녀', sub: '부모·조부모 등 직계존속에게서', amount: krw(GIFT_DEDUCTION.minorDescendant), note: '만 19세 미만. 증여자 모두 합산' },
  { who: '부모·조부모', sub: '자녀·손자녀 등 직계비속에게서', amount: krw(GIFT_DEDUCTION.ascendant), note: '증여자 모두 합산' },
  { who: '기타 친족', sub: '6촌 이내 혈족·4촌 이내 인척', amount: krw(GIFT_DEDUCTION.otherRelative), note: '며느리·사위·형제자매 등' },
  { who: '타인', amount: '0원', note: '공제 없음' },
  { who: '혼인·출산 공제', sub: '직계존속에게서 (§53의2)', amount: '1억원', note: '혼인신고 전후 2년·출생 후 2년 이내. 위 공제와 별도, 이 계산기 미반영' },
]

/** 증여세 계산 예시 */
const GIFT_1 = calcGiftTax(1 * EOK, '성인자녀', 0)
const GIFT_3 = calcGiftTax(3 * EOK, '성인자녀', 0)
const GIFT_GC = calcGiftTax(2 * EOK, '손자녀', 0, true)

/** 표 3 — 배우자 실제 상속분별 상속세 (총 20억 · 배우자 + 자녀 2명) */
const SP_TOTAL = 20 * EOK
const SP_LEGAL = SP_TOTAL * getSpouseLegalShare(2, 0)
const SP_ROWS = [0, 5 * EOK, 7 * EOK, SP_LEGAL, 10 * EOK, 15 * EOK].map(share => {
  const r = calcInheritanceTax({ totalAsset: SP_TOTAL, priorGift: 0, funeral: 0, debt: 0, hasSpouse: true, childCount: 2, spouseActualShare: share })
  return { share, isLegal: share === SP_LEGAL, r }
})
const SP_FIRST = SP_ROWS[0].r
const SP_BEST = SP_ROWS[3].r

/** 표 4 — 상속세가 생기기 시작하는 재산 규모 (채무·사전증여·금융재산공제 없음, 장례비 최소 공제, 배우자는 법정상속분만큼 상속) */
function taxFreeCeiling(hasSpouse: boolean, childCount: number): number {
  let lo = 0, hi = 100 * EOK
  const tax = (t: number) => calcInheritanceTax({ totalAsset: t, priorGift: 0, funeral: 0, debt: 0, hasSpouse, childCount, parentsAlive: 0 }).finalTax
  while (hi - lo > 10_000) { const mid = Math.floor((lo + hi) / 2); if (tax(mid) > 0) hi = mid; else lo = mid }
  return Math.round(lo / 1_000_000) * 1_000_000 // 표시는 '약 ○억원'
}
const CEIL_ROWS = [
  { label: '배우자 + 자녀 1명', spouse: true, kids: 1 },
  { label: '배우자 + 자녀 2명', spouse: true, kids: 2 },
  { label: '배우자 + 자녀 3명', spouse: true, kids: 3 },
  { label: '자녀만 (배우자 없음)', spouse: false, kids: 2 },
  { label: '배우자 단독 상속 (자녀·부모 없음)', spouse: true, kids: 0 },
].map(c => ({ ...c, ceil: taxFreeCeiling(c.spouse, c.kids) }))

/** 표 5 — 10년 주기 증여 계획 (자녀 1명, 직계존속 공제만) */
const PLAN = [
  { age: 0, limit: GIFT_DEDUCTION.minorDescendant },
  { age: 10, limit: GIFT_DEDUCTION.minorDescendant },
  { age: 20, limit: GIFT_DEDUCTION.adultDescendant },
  { age: 30, limit: GIFT_DEDUCTION.adultDescendant },
  { age: 40, limit: GIFT_DEDUCTION.adultDescendant },
].reduce<{ age: number; limit: number; cum: number }[]>((acc, p) => [...acc, { ...p, cum: (acc.length ? acc[acc.length - 1].cum : 0) + p.limit }], [])
const PLAN_TOTAL = PLAN[PLAN.length - 1].cum

const FAQ_LD = [
          {
            q: '10년 내 증여액이 합산된다는 게 무슨 의미인가요?',
            a: '동일인에게서 10년 이내에 증여받은 금액은 모두 합산해서 공제 한도와 세율을 계산합니다. 예: 2020년에 3천만원, 2024년에 4천만원을 자녀에게 증여하면 합계 7천만원에서 공제 5천만원을 뺀 2천만원이 과세표준이 됩니다.',
          },
          {
            q: '사망 전 증여는 상속세에 포함되나요?',
            a: '포함됩니다. 사망일 전 10년 이내에 상속인(배우자·자녀)에게, 5년 이내에 상속인이 아닌 사람(손자녀·며느리·사위 등)에게 준 재산은 상속재산에 다시 더해집니다. 그래서 사망 1년 전 증여는 절세 효과가 거의 없고, 11년 전에 자녀에게 준 재산은 합산되지 않습니다. 증여 당시 가액으로 합산되고 이미 낸 증여세는 빼 준다는 점은 위 「사전증여 합산」 항목을 참고하세요.',
          },
          {
            q: '배우자 상속공제는 얼마나 되나요?',
            a: '배우자가 실제로 상속받은 금액에 대해 최소 5억원, 최대 30억원까지 공제됩니다. 법정상속분 이내의 실제 취득 금액과 30억원 중 작은 금액이 공제됩니다. 「상속세 계산」 탭에서 실제 상속분에 따른 정량 시뮬을 자동 표시합니다.',
          },
          {
            q: '부동산을 증여할 때 세금 기준은 무엇인가요?',
            a: '원칙적으로 시가(해당 재산의 매매가·감정평가액, 비슷한 아파트의 매매사례가액 등)를 기준으로 하며, 시가 산정이 어려운 경우 공시가격(주택은 공시가격, 토지는 개별공시지가)을 적용합니다. 공시가격이 시가보다 낮은 경우가 많아 절세 효과가 있을 수 있지만, 국세청이 시가 적용을 강화하는 추세입니다. 본 도구의 「부동산 증여 모드」에서 단순 추정 가능.',
          },
          {
            q: '미성년 자녀 공제는 2천만원인데 성년이 되면 추가로 받을 수 있나요?',
            a: '네. 공제 한도는 증여받는 날의 나이로 정해지고, 그날부터 거슬러 10년 안에 이미 공제받은 금액을 빼고 남은 만큼만 적용됩니다. 예를 들어 15세에 2천만원을 받아 공제를 다 쓴 자녀가 19세(성년)에 다시 증여받으면, 10년이 지나지 않았어도 한도가 5천만원으로 올라가 3천만원을 추가로 공제받을 수 있습니다. 각 증여일부터 거슬러 10년 안에 공제받은 금액을 빼므로, 앞선 증여(이 예에서는 15세·19세 증여)가 모두 10년 밖으로 벗어나야 5천만원 전액이 다시 적용됩니다.',
          },
          {
            q: '배우자 + 자녀 2명일 때 법정상속분은 어떻게 되나요?',
            a: '한국 민법 기준: 배우자 1.5, 자녀 각 1. 합계 비율 3.5에서 배우자 = 1.5/3.5 = 약 43%(3/7), 자녀 각 = 1/3.5 = 약 29%(2/7). 예: 총 7억 상속 시 배우자 3억, 자녀 1·2 각 2억. 협의 분할 시 다르게 나눌 수 있지만 유류분(법정 × 1/2) 침해 시 분쟁 가능. 본 도구의 「상속인별 분배」 탭에서 자동 계산.',
          },
          {
            q: '배우자가 상속을 더 많이 받으면 세금이 더 줄어드나요?',
            a: '법정상속분까지만 줄어들고 그보다 더 받으면 공제는 늘지 않은 채 2차 상속(배우자 사망 시) 부담만 커지는데, 총 20억원·배우자 + 자녀 2명일 때 배우자 몫별 세액은 위 표 5에서 확인할 수 있습니다.',
          },
          {
            q: '부모님과 조부모님 모두에게 증여받으면 공제가 별도인가요?',
            a: '별도가 아닙니다. 부모와 조부모는 모두 직계존속 그룹으로 묶여, 수증자 기준 10년간 합산 5천만원(미성년자 2천만원)까지만 공제됩니다. 아버지·어머니·조부모가 각자 5천만원씩 따로 공제되는 것이 아닙니다. 또한 부모가 살아 있는 상태에서 조부모가 손자녀에게 직접 증여하면 세대생략 할증으로 산출세액의 30%가 가산됩니다. 며느리·사위 등 인척은 기타 친족으로 1천만원 별도 공제. 복잡한 경우 세무사 상담 필수.',
          },
          {
            q: '부동산 증여는 증여세만 내면 되나요?',
            a: '아닙니다. 다음 모두 별도 발생: ① 증여세(수증자), ② 취득세(시가인정액 기준 3.5%, 조정대상지역의 시가표준액 3억원 이상 주택을 1세대 2주택 이상인 사람이 증여하면 12% — 1세대 1주택자가 배우자·직계존비속에게 주면 3.5%, 지방교육세·농어촌특별세 별도), ③ 자금출처 소명(수증자), ④ 양도세(부담부증여 시 증여자), ⑤ 재산세(이전 후). 평가액을 낮게 신고했다가 국세청이 시가로 다시 평가하면 과소신고 가산세와 납부지연 가산세가 붙으므로, 신고 전에 세무사와 평가 방법부터 확인하세요.',
          },
          {
            q: '유류분이란 무엇인가요?',
            a: '유류분은 유언으로도 침해할 수 없는 상속인의 최소 권리입니다. 배우자·직계비속(자녀)은 법정상속분 × 1/2, 직계존속(부모)은 법정상속분 × 1/3입니다. 형제자매의 유류분은 2024년 4월 25일 헌법재판소 위헌 결정(민법 1112조 4호)으로 폐지되었습니다. 예: 배우자 + 자녀 2명 / 자녀 법정상속분 2/7 → 유류분 1/7. 유언으로 일부 상속인을 배제하면 유류분 청구권 행사 가능 — 분쟁 발생. 본 도구의 「상속인별 분배」 탭에서 유류분 자동 표시.',
          },
          {
            q: '결혼·출산 때 받는 증여는 공제가 더 있나요?',
            a: '네. 2024년 1월 1일 이후 증여분부터 <strong>혼인·출산 증여재산공제</strong>(상증법 §53의2)가 생겼습니다. 부모·조부모 등 직계존속에게 혼인신고일 전후 2년 이내, 또는 자녀 출생일(입양신고일)부터 2년 이내에 증여받으면 기본 공제(성인 5천만원)와 별도로 <strong>최대 1억원</strong>을 더 공제합니다. 혼인 공제와 출산 공제를 합쳐 1억원이 한도입니다. 이 계산기는 혼인·출산 공제를 넣지 않으므로, 해당된다면 증여액에서 1억원을 뺀 금액으로 계산해 보세요.',
          },
        ]

export default function InheritancePage() {
  return (
    <ToolPage width={880} slug="/tools/finance/inheritance">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />상속·증여세 계산기
      </h1>
      <p className="tp-lead">
        관계별 공제·10년 합산·배우자 공제를 반영한 상속·증여세 추정 + <strong style={{ color: 'var(--text)' }}>분산 증여 시뮬레이션</strong>.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 상속·증여세법 기준" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스","href":"https://hometax.go.kr"},{"label":"상속세 및 증여세법 (국가법령정보센터)","href":"https://www.law.go.kr/법령/상속세및증여세법"},{"label":"민법 (법정상속분·유류분)","href":"https://www.law.go.kr/법령/민법"}]} />

      <InheritanceClient />

      <GuideDivider />

      <h2 className="g-h2">증여세 공제 한도 (2026년 기준)</h2>
      <p className="g-p">
        증여재산공제는 <strong>받는 사람(수증자)</strong>을 기준으로, 증여일부터 거슬러 <strong>10년 동안 받은 금액을 합산</strong>해 적용됩니다(상속세 및 증여세법 §53). 같은 그룹의 증여자 — 예컨대 아버지·어머니·할아버지 — 에게서 받은 금액은 모두 한 바구니에 담기므로, 부모가 나눠 준다고 공제가 늘어나지 않습니다. 누적 합계가 한도를 넘는 부분만 과세됩니다.
      </p>
      <DataFigure n={1} title="수증자 기준 증여재산공제 (10년 합산 한도)" source={<>자료: 상속세 및 증여세법 §53·§53의2 — 금액은 lib/krInheritanceTax 단일 소스에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">받는 사람</th><th scope="col" className="r">공제 한도</th><th scope="col">비고</th></tr>
          </thead>
          <tbody>
            {GIFT_ROWS.map(r => (
              <tr key={r.who}>
                <th scope="row">{r.who}{r.sub && <small>{r.sub}</small>}</th>
                <td className="r em">{r.amount}</td>
                <td className="wrap">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        <strong>계산 예시</strong> — 성인 자녀가 부모에게 1억원을 받으면 공제 {krw(GIFT_DEDUCTION.adultDescendant)}을 뺀 {krw(GIFT_1.taxableBase)}이 과세표준이고, 10% 세율로 {krw(GIFT_1.calculatedTax)}, 기한 내 신고하면 {pct(FILING_CREDIT_RATE)} 신고세액공제를 받아 <strong>{krw(GIFT_1.finalTax)}</strong>입니다. 3억원이면 과세표준이 1억원을 넘어 20% 구간에 들어가 {krw(GIFT_3.finalTax)}입니다.
        부모가 살아 있는데 조부모가 성인 손자녀에게 바로 2억원을 주면 세대생략 할증 {pct(GENERATION_SKIP_SURCHARGE_RATE)}({krw(GIFT_GC.surchargeAmount ?? 0)})이 붙어 {krw(GIFT_GC.finalTax)}이 됩니다(미성년 손자녀가 20억원을 넘게 받으면 40%). 자녀가 먼저 사망해 손자녀가 대신 받는 경우에는 할증이 없습니다.
      </p>

      <h2 className="g-h2">상속세 주요 공제 항목</h2>
      <ul className="g-list">
        <li><strong>일괄공제 {krw(INHERITANCE_LUMP_SUM_DEDUCTION)}</strong> — 기초공제({krw(INHERITANCE_BASIC_DEDUCTION)}) + 인적공제(자녀 1인당 {krw(INHERITANCE_CHILD_DEDUCTION)}, 미성년자·65세 이상 연로자·장애인 공제 등) 합계와 비교해 큰 금액을 적용합니다(§18·§20·§21). 배우자가 단독으로 상속받으면 일괄공제 없이 기초공제와 인적공제만 가능합니다. 이 계산기는 인적공제 중 자녀공제만 반영합니다.</li>
        <li><strong>배우자 상속공제 최소 {krw(SPOUSE_INHERITANCE_DEDUCTION_MIN)} ~ 최대 {krw(SPOUSE_INHERITANCE_DEDUCTION_MAX)}</strong> — 배우자가 실제로 받은 금액을 법정상속분 한도 안에서 공제합니다(§19). 배우자가 한 푼도 안 받아도 최소 공제는 적용됩니다.</li>
        <li><strong>금융재산공제</strong> — 순금융재산 {krw(FINANCIAL_ASSET_DEDUCTION.fullUpTo)} 이하 전액 · {krw(FINANCIAL_ASSET_DEDUCTION.flatUpTo)} 이하 {krw(FINANCIAL_ASSET_DEDUCTION.flat)} · {krw(FINANCIAL_ASSET_DEDUCTION.flatUpTo)} 초과는 <strong>순금융재산 전체</strong>의 {pct(FINANCIAL_ASSET_DEDUCTION.rate)}(최대 {krw(FINANCIAL_ASSET_DEDUCTION.max)}, §22). 예컨대 순금융재산이 3억원이면 1억원 초과분이 아니라 3억원 전체의 {pct(FINANCIAL_ASSET_DEDUCTION.rate)}인 {krw(financialAssetDeduction(3 * EOK))}이 공제됩니다.</li>
        <li><strong>동거주택 상속공제</strong> — 주택 가액의 100%(최대 {krw(COHABIT_HOME_DEDUCTION_MAX)}). 피상속인과 10년 이상 계속 동거, 그 기간 1세대 1주택, 상속받는 자녀가 무주택 등 요건을 모두 갖춰야 합니다(§23의2).</li>
        <li><strong>장례비 공제</strong> — 증빙이 없거나 적어도 {krw(FUNERAL_DEDUCTION_MIN)}, 장례비 최대 1,000만원에 봉안시설·자연장지 비용 500만원까지 따로 인정됩니다(시행령 §9②).</li>
      </ul>
      <p className="g-p">
        이 공제들을 합치면 상당한 재산까지 상속세가 나오지 않습니다. 아래 표는 계산기에 채무·사전증여·금융재산 없이 재산 총액만 넣었을 때 세액이 0원으로 유지되는 최대 금액을 찾아 본 것입니다. 배우자가 법정상속분만큼 상속한다고 가정했으며, 금융재산공제·동거주택공제가 더해지면 선은 그만큼 올라갑니다.
      </p>
      <DataFigure n={2} title="상속세가 0원인 재산 규모의 상한 (단순 가정)" source={<>자료: 계산기 엔진(calcInheritanceTax)으로 탐색해 100만원 단위 반올림 — 장례비 최소 공제 {krw(FUNERAL_DEDUCTION_MIN)} 포함</>}>
        <table>
          <thead>
            <tr><th scope="col">상속인 구성</th><th scope="col" className="r">이 금액까지 상속세 0원</th></tr>
          </thead>
          <tbody>
            {CEIL_ROWS.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="r em">약 {eok2(r.ceil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        배우자와 자녀가 함께 상속하면 일괄공제 {krw(INHERITANCE_LUMP_SUM_DEDUCTION)}과 배우자 최소 공제 {krw(SPOUSE_INHERITANCE_DEDUCTION_MIN)}이 겹쳐 흔히 &lsquo;10억까지는 상속세가 없다&rsquo;고 말합니다. 자녀가 1명이면 배우자 법정상속분(3/5)이 커서 선이 더 올라가고, 배우자 단독 상속은 일괄공제를 못 쓰는 대신 배우자 공제가 재산 전체에 적용됩니다. 다만 사망 전 10년 안에 자녀에게 증여한 재산이 있으면 그 금액이 상속재산에 더해져 선이 내려갑니다.
      </p>

      <h2 className="g-h2">증여세·상속세 세율표 (동일 누진 구조)</h2>
      <DataFigure n={3} title="상속세·증여세 세율 (§26, 증여세는 §56에서 준용)" unit="누진공제: 원" source={<>자료: 상속세 및 증여세법 §26 — lib/krInheritanceTax 단일 소스에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">과세표준</th><th scope="col" className="r">세율</th><th scope="col" className="r">누진공제</th></tr>
          </thead>
          <tbody>
            {INHERITANCE_GIFT_TAX_BRACKETS.map(b => (
              <tr key={b.min}>
                <th scope="row">{b.max === Infinity ? `${krw(b.min)} 초과` : b.min === 0 ? `${krw(b.max)} 이하` : `${krw(b.min)} 초과 ~ ${krw(b.max)} 이하`}</th>
                <td className="r em">{pct(b.rate)}</td>
                <td className="r">{b.deduction === 0 ? '—' : krw(b.deduction)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        산출세액 = 과세표준 × 세율 − 누진공제입니다. 예를 들어 과세표준 2억원이면 2억 × 20% − 1천만원 = <strong>3천만원</strong>입니다. 법정 신고기한 안에 신고하면 산출세액의 {pct(FILING_CREDIT_RATE)}를 신고세액공제로 빼 주므로(§69), 계산기의 최종 세액은 이 공제를 반영한 값입니다.
      </p>

      <h2 className="g-h2">법정상속분 가이드</h2>
      <p className="g-p">
        민법 §1009는 같은 순위 상속인끼리 균등하게 나누되, 배우자는 다른 상속인보다 <strong>5할을 더해</strong>(1.5 : 1) 받도록 정합니다. 자녀가 있으면 자녀와, 자녀가 없으면 부모(직계존속)와 공동상속하고, 둘 다 없으면 배우자가 단독 상속합니다. 본 도구의 「상속인별 분배」 탭에서 인원수만 넣으면 자동으로 계산됩니다.
      </p>
      <DataFigure n={4} title="가족 구성별 법정상속분" source={<>자료: 민법 §1000·§1003·§1009</>}>
        <table>
          <thead>
            <tr><th scope="col">가족 구성</th><th scope="col">배우자</th><th scope="col">자녀</th><th scope="col">부모</th></tr>
          </thead>
          <tbody>
            {[
              ['배우자 + 자녀 1명',     '3/5 (60%)',  '2/5 (40%)',   '—'],
              ['배우자 + 자녀 2명',     '3/7 (43%)',  '각 2/7 (29%)', '—'],
              ['배우자 + 자녀 3명',     '3/9 (33%)',  '각 2/9 (22%)', '—'],
              ['배우자 + 부모 2명 (자녀 없음)', '3/7 (43%)', '—', '각 2/7'],
              ['배우자만 (자녀·부모 없음)', '100%',        '—',           '—'],
              ['자녀만 (배우자 없음)',     '—',           '각 1/n',      '—'],
              ['부모만',                '—',          '—',           '각 1/n'],
            ].map(row => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        협의 분할로 법정 비율과 다르게 나눌 수 있지만, 유언이나 생전 증여로 한 사람이 몫을 거의 받지 못했다면 <strong>유류분</strong>(배우자·자녀는 법정상속분의 1/2, 부모는 1/3)을 돌려 달라고 청구할 수 있습니다(민법 §1112). 형제자매의 유류분은 2024년 4월 헌법재판소 위헌 결정으로 효력을 잃었습니다.
      </p>

      <h2 className="g-h2">배우자 상속공제 — 실제 상속분에 따른 차이</h2>
      <p className="g-p">
        배우자 공제는 배우자가 <strong>실제로 받은 금액</strong>만큼 인정되지만 법정상속분과 {krw(SPOUSE_INHERITANCE_DEDUCTION_MAX)}이 상한이고, 아무리 적게 받아도 {krw(SPOUSE_INHERITANCE_DEDUCTION_MIN)}은 공제됩니다. 그래서 배우자 몫을 늘리면 법정상속분에 닿을 때까지는 세금이 줄고, 그 뒤로는 변하지 않습니다. 아래는 총 {eok2(SP_TOTAL)} · 배우자 + 자녀 2명(배우자 법정상속분 약 {eok2(SP_LEGAL)})을 계산기에 넣은 결과입니다.
      </p>
      <DataFigure n={5} title={`배우자 실제 상속분별 상속세 — 총 ${eok2(SP_TOTAL)}, 배우자 + 자녀 2명`} unit="단위: 원" source={<>자료: 계산기 엔진(calcInheritanceTax)으로 생성 — 일괄공제 5억·장례비 최소 공제 500만원 포함, 신고세액공제 3% 반영</>}>
        <table>
          <thead>
            <tr><th scope="col">배우자 실제 상속</th><th scope="col" className="r">배우자 공제</th><th scope="col" className="r">과세표준</th><th scope="col" className="r">상속세</th></tr>
          </thead>
          <tbody>
            {SP_ROWS.map(row => (
              <tr key={row.share}>
                <th scope="row">{row.share === 0 ? '0원 (포기)' : eok2(row.share)}{row.isLegal && <small>법정상속분</small>}</th>
                <td className="r">{krw(row.r.spouseDeduction)}</td>
                <td className="r">{krw(row.r.taxableBase)}</td>
                <td className="r em">{krw(row.r.finalTax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip" title="법정상속분까지가 공제 효과의 끝">
        이 예에서 배우자가 법정상속분(약 {eok2(SP_LEGAL)})을 받으면 상속세가 {krw(SP_FIRST.finalTax)}에서 {krw(SP_BEST.finalTax)}으로 줄지만, 그보다 더 받아도 공제는 늘지 않습니다. 배우자가 받은 재산은 훗날 배우자가 사망할 때 다시 상속세 대상이 되므로(2차 상속), 배우자의 나이와 자녀 상황을 함께 고려하세요. 5억원을 넘는 배우자 공제(실제 상속분 기준)를 받으려면 상속세 신고기한 다음 날부터 9개월 안에 상속재산 분할(등기 등)을 마쳐야 하며, 못 마치면 최소 5억원만 공제됩니다.
      </Callout>

      <h2 className="g-h2">10년 주기 활용 — 장기 증여 계획</h2>
      <p className="g-p">
        증여재산공제는 10년 단위로 다시 채워집니다. 직전 증여일로부터 10년이 지난 뒤 증여하면 한도가 새로 적용되므로, 일찍 시작할수록 세금 없이 옮길 수 있는 금액이 커집니다. 아래는 자녀 1명에게 직계존속 공제만 활용했을 때의 예입니다.
      </p>
      <DataFigure n={6} title="자녀 1명 · 10년 간격 증여 시 비과세 한도 누계" source={<>자료: 상속세 및 증여세법 §53 — 혼인·출산 공제(최대 1억원) 제외</>}>
        <table>
          <thead>
            <tr><th scope="col">증여 시점 (자녀 나이)</th><th scope="col" className="r">이번 공제 한도</th><th scope="col" className="r">누계</th></tr>
          </thead>
          <tbody>
            {PLAN.map(p => (
              <tr key={p.age}>
                <th scope="row">{p.age === 0 ? '출생 직후' : `${p.age}세`}<small>{p.age < 19 ? '미성년' : '성인'}</small></th>
                <td className="r">{krw(p.limit)}</td>
                <td className="r em">{krw(p.cum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        이렇게 하면 자녀 1명에게 40세까지 <strong>{krw(PLAN_TOTAL)}</strong>을 증여세 없이 줄 수 있고, 혼인·출산 공제 요건을 갖추면 1억원이 더해집니다. 증여 간격이 하루라도 10년에 못 미치면 앞의 증여와 합산되니 날짜를 기록해 두세요. 또 증여세가 0원이어도 사망 전 10년 안에 준 재산은 상속세 계산 때 다시 합산됩니다.
      </p>

      <h2 className="g-h2">사전증여 합산 — 사망 직전 증여는 효과가 없다</h2>
      <ul className="g-list">
        <li><strong>사망 전 10년 이내 상속인에게 한 증여</strong>는 상속재산에 합산됩니다(§13①1호). 이미 낸 증여세는 상속세에서 공제되지만, 합산 때문에 더 높은 세율 구간이 적용될 수 있습니다.</li>
        <li><strong>사망 전 5년 이내 상속인이 아닌 사람(손자녀·며느리·사위 등)에게 한 증여</strong>도 합산됩니다(§13①2호).</li>
        <li>합산되는 금액은 <strong>증여 당시 평가액</strong>이라, 그 뒤 값이 크게 오른 재산은 미리 증여한 효과가 일부 남습니다.</li>
        <li>결국 절세 효과는 건강할 때 일찍, 10년 이상 간격으로 시작해야 온전히 나타납니다.</li>
      </ul>

      <h2 className="g-h2">상속·증여세 신고 기한</h2>
      <ul className="g-list">
        <li><strong>상속세</strong> — 상속개시일(사망일)이 속하는 달의 말일부터 <strong>6개월 이내</strong> 신고·납부(§67). 피상속인이나 상속인 전원이 외국에 주소를 둔 경우 9개월입니다. 예: 3월 10일 사망 → 9월 30일까지.</li>
        <li><strong>증여세</strong> — 증여받은 날이 속하는 달의 말일부터 <strong>3개월 이내</strong> 신고·납부(§68). 예: 3월 10일 증여 → 6월 30일까지. 증여일로부터 딱 3개월이 아니라 그달 말일부터 셉니다.</li>
        <li>두 세금 모두 기한 안에 신고하면 산출세액의 {pct(FILING_CREDIT_RATE)}를 공제받고, 기한을 넘기면 무신고·납부지연 가산세가 붙습니다. 납부할 세액이 1천만원을 넘으면 나눠 내는 분납, 2천만원을 넘으면 연부연납을 신청할 수 있습니다.</li>
      </ul>

      <h2 className="g-h2">부동산 증여 시 주의사항</h2>
      <p className="g-p">
        부동산 증여는 <strong>증여세 외에 다음 부담이 따로 생깁니다</strong>. 본 도구는 증여세와 취득세(본세)만 단순 추정합니다.
      </p>
      <ul className="g-list">
        <li><strong>취득세</strong>(수증자 부담) — 무상취득 일반 3.5%. 조정대상지역의 시가표준액 3억원 이상 주택을 1세대 2주택 이상인 사람이 증여하면 12%(1세대 1주택자가 배우자·직계존비속에게 증여하면 3.5%). 지방교육세·농어촌특별세가 별도로 붙고, 2023년부터 과세표준은 시가인정액 기준입니다.</li>
        <li><strong>양도소득세</strong> — 전세보증금·대출을 함께 넘기는 부담부증여라면 넘긴 채무만큼은 증여자가 양도한 것으로 보아 양도세가 과세됩니다.</li>
        <li><strong>재산세·종합부동산세</strong> — 이전 뒤 매년 수증자에게 부과됩니다.</li>
        <li><strong>자금출처</strong> — 증여세나 취득세를 수증자가 낼 돈이 없어 증여자가 대신 내면 그 금액도 추가 증여가 됩니다.</li>
        <li><strong>평가 방법</strong> — 원칙은 시가(매매가·감정가·유사 매매사례가액)이고, 시가가 없을 때만 공시가격을 씁니다. 아파트는 유사 매매사례가 흔해 공시가격으로 신고하기 어렵습니다.</li>
      </ul>
      <Callout tone="warn" title="부담부증여는 세무사와 먼저">
        부담부증여는 증여세와 양도세가 한 거래에 얽히고, 채무를 실제로 수증자가 갚는지까지 사후 관리됩니다. 신고 전에 세무사·변호사와 평가 방법과 세 부담을 함께 확인하세요.
      </Callout>

      <h2 className="g-h2">상속세 vs 증여세 선택 기준 (참고용)</h2>
      <h3 className="g-h3">상속이 유리할 수 있는 경우</h3>
      <ul className="g-list">
        <li>배우자가 있어 배우자 공제(최소 5억 ~ 최대 30억)를 크게 쓸 수 있는 경우</li>
        <li>전체 재산이 위 표 2의 &lsquo;상속세 0원&rsquo; 선 안쪽이라 미리 증여하면 오히려 증여세만 생기는 경우</li>
        <li>상속인이 여럿이라 일괄공제·인적공제 효과가 큰 경우</li>
      </ul>
      <h3 className="g-h3">증여가 유리할 수 있는 경우</h3>
      <ul className="g-list">
        <li>재산 가치가 앞으로 크게 오를 것으로 예상될 때 — 합산은 증여 당시 가액으로 되므로 상승분이 상속재산에서 빠집니다</li>
        <li>자녀·손자녀가 여럿이어서 수증자별 공제와 낮은 세율 구간을 나눠 쓸 수 있는 경우</li>
        <li>10년 주기 공제를 여러 번 활용할 시간적 여유가 있는 경우</li>
      </ul>
      <p className="g-p">
        위 내용은 일반적인 참고 사항이며 가족 구성·재산 종류·건강 상태에 따라 결과가 달라집니다. 상속세가 예상되는 규모라면 사전에 세무사와 상속·증여 시나리오를 비교해 보는 것이 좋습니다.
      </p>

      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        sources={[
          { label: '국세청 상속·증여세 안내(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '국세청 홈택스', href: 'https://hometax.go.kr/' },
        ]}
      >
        본 계산기는 관계별 공제·10년 합산·배우자 공제를 단순화한 모델로 상속·증여세를 추정하는 참고용 도구입니다. 사전증여 합산, 감정평가·시가 산정, 부담부증여, 가업·영농 상속공제 등 개별 사정에 따라 실제 세액은 크게 달라질 수 있으며, 본 결과는 세무 자문이나 신고 근거가 아닙니다. 실제 신고·납부 전 홈택스 모의계산 또는 세무사 상담으로 확인하세요.
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/compound" style={relCard}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>증여 후 자산 성장 시뮬레이션</div>
        </Link>
        <Link href="/tools/finance/dividend" style={relCard}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>상속 자산 운용</div>
        </Link>
        <Link href="/tools/finance/loan" style={relCard}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>부동산 자금 계획</div>
        </Link>
        <Link href="/tools/finance/salary" style={relCard}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연봉 실수령액</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>세후 소득 파악</div>
        </Link>
      </div>

    </ToolPage>
  )
}
