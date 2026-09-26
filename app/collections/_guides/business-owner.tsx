/* 상황별 가이드 — 자영업·프리랜서. 종합소득세 예시는 freelanceTaxUtils.calculate(경비율 lib/krExpenseRates·세율 lib/krIncomeTax)
   + 무기장 가산세(lib/collections NO_BOOK_PENALTY — 계산기 결과에 없는 항목이라 따로 더함),
   4대보험 사업주 부담은 fourInsuranceUtils.calc4Insurance(lib/krInsuranceRates, 오늘이 속한 연도의 요율 키), 간이과세 기준은 vatUtils로 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calculate, type CalcInputs } from '@/app/tools/finance/freelance-tax/freelanceTaxUtils'
import { calc4Insurance, pensionBaseForYear, type InsuranceYear } from '@/app/tools/finance/4-insurance/fourInsuranceUtils'
import { SIMPLIFIED_EXEMPT_THRESHOLD, SIMPLIFIED_THRESHOLD } from '@/app/tools/finance/vat/vatUtils'
import { INSURANCE_RATES } from '@/lib/krInsuranceRates'
import { EXPENSE_RATES, HUMAN_SERVICE_SIMPLE_LIMIT } from '@/lib/krExpenseRates'
import { BUSINESS_WITHHOLDING_RATE } from '@/lib/krHourlyPay'
import { LOCAL_INCOME_TAX_RATIO } from '@/lib/krIncomeTax'
import { BIZ_TAX_DEADLINES, NO_BOOK_PENALTY } from '@/lib/collections'
import { kstTodayStr } from '@/lib/todayInfo'
import { GuideSources, manwon, pct, won, type CollectionGuide } from './shared'

/** 예시 프리랜서 — 소프트웨어 프리랜서(940926), 장부 없이 추계 신고, 부양가족 없음, 3.3% 원천징수, 직전 연도 수입 = 올해 수입 */
const FREELANCER: Omit<CalcInputs, 'revenue'> = {
  industryId: 'developer', expenseMode: 'simple', bookExpenses: 0, isNewBusiness: false,
  customRates: false, customSimpleRate: 0, customBaseRate: 0,
  spouseExempt: false, dependents: 0, pensionPaid: 0, yellowUmbrella: 0, pensionSavings: 0, donations: 0,
  useStandard: true, prevYearWithholding: 0, withholdingMode: 'auto',
}
const REVENUES = [20_000_000, 30_000_000, 50_000_000]
/** 예시 직원 — 월 250만원(식대 비과세 20만원), 150인 미만 사업장 */
const STAFF = { monthly: 2_500_000, taxFree: 200_000 }
/** 예시 메뉴 — 부가세 포함 판매가 12,000원, 재료비 4,200원 */
const MENU = { price: 12_000, cost: 4_200 }

function Body() {
  const rows = REVENUES.map((revenue) => {
    const r = calculate({ ...FREELANCER, revenue })
    // 무기장 가산세 — 직전 연도 수입(= 예시 수입)이 소규모사업자 기준 이상이면 산출세액 × 20%, 개인지방소득세에 그 10% 별도
    const penaltyNational = revenue >= NO_BOOK_PENALTY.smallBizRevenueBelow ? Math.floor(r.computedTax * NO_BOOK_PENALTY.rate) : 0
    const penalty = penaltyNational + Math.floor(penaltyNational * LOCAL_INCOME_TAX_RATIO)
    return { revenue, r, penalty, settle: r.refund - penalty }
  })
  const penalized = rows.filter((x) => x.penalty > 0)
  const rate = EXPENSE_RATES['940926']
  // 4대보험 계산기와 같은 입력 — 오늘(한국 날짜)이 속한 연도의 요율 키(표에 아직 없으면 최신 연도)와 그 연도 안의 국민연금 기준소득월액 구간
  const asOf = kstTodayStr()
  const rateYears = (Object.keys(INSURANCE_RATES).map(Number) as InsuranceYear[]).sort((a, b) => a - b)
  const rateYear = rateYears.filter((y) => y <= Number(asOf.slice(0, 4))).pop() ?? rateYears[0]
  const staff = calc4Insurance({
    monthlySalary: STAFF.monthly, taxFreeAmount: STAFF.taxFree, workersCompRate: INSURANCE_RATES[rateYear].workersCompAvg,
    companySize: 'under150', year: rateYear, pensionPeriod: pensionBaseForYear(rateYear, asOf),
  })
  const netPrice = MENU.price / 1.1
  const withholdingPct = BUSINESS_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO)

  return (
    <>
      <h2>왜 세금·보험을 먼저, 원가·자금을 나중에 보는가</h2>
      <p>
        세금과 4대보험은 기한과 가산세가 법으로 정해진 돈이라 사장님이 조절할 수 있는 폭이 작습니다. 그래서 먼저 얼마가 언제 나가는지를 정해 두고, 남은 돈으로 원가·가격·현금흐름을 설계하는 순서가 맞습니다.
        개인 일반과세자의 부가세 확정신고는 {BIZ_TAX_DEADLINES.vatGeneral.join('과 ')}, 간이과세자는 {BIZ_TAX_DEADLINES.vatSimplified}까지이고, 종합소득세는 다음 해
        {' '}{BIZ_TAX_DEADLINES.incomeTax}까지(성실신고확인 대상은 {BIZ_TAX_DEADLINES.incomeTaxDiligent}) 신고합니다. 이 날짜에 맞춰 매달 매출의 일정 비율을 따로 떼어 두는 것이 자금 관리의 출발점입니다.
      </p>

      <h2>프리랜서 종합소득세, 수입이 늘 때 생기는 계단</h2>
      <p>
        {pct(withholdingPct, 1)}(소득세 {pct(BUSINESS_WITHHOLDING_RATE, 0)} + 지방소득세)를 떼고 받는 프리랜서는 5월에 1년 치를 정산합니다. 아래 표는 소프트웨어 프리랜서(단순경비율 {rate.simpleRate}%, 기준경비율 {rate.baseRate}%)가
        장부 없이 추계로 신고하고, 직전 연도 수입도 같은 수준이라고 가정한 결과입니다.
      </p>
      <DataFigure n={1} title="수입별 종합소득세 정산(지방소득세 포함)" unit="부양가족 없음·장부 없음" source={<>계산: 결정세액은 종합소득세 계산기와 같은 식(소득세법 §55·§80, 국세청 경비율), 무기장 가산세는 계산기 결과에 없는 항목이라 따로 더함(소득세법 §81의5·지방세법 §99) — 원천징수는 수입의 {pct(withholdingPct, 1)}</>}>
        <table>
          <thead>
            <tr><th scope="col">연 수입</th><th scope="col">적용 경비율</th><th scope="col" className="r">결정세액</th><th scope="col" className="r">무기장 가산세</th><th scope="col" className="r">5월 정산</th></tr>
          </thead>
          <tbody>
            {rows.map(({ revenue, r, penalty, settle }) => (
              <tr key={revenue}>
                <td>{manwon(revenue)}</td>
                <td>{r.canUseSimple ? '단순' : '기준'} {r.expenseRate}%</td>
                <td className="r">{won(r.totalTax)}</td>
                <td className="r">{penalty > 0 ? won(penalty) : '—'}</td>
                <td className="r">{settle >= 0 ? `환급 ${won(settle)}` : `추가 납부 ${won(-settle)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        인적용역 사업자는 직전 연도 수입이 {manwon(HUMAN_SERVICE_SIMPLE_LIMIT)} 이상이면 단순경비율을 쓸 수 없습니다. 기준경비율은 주요 경비(매입·임차료·인건비)를 증빙으로 따로 빼 주는 방식이라, 증빙 없이 신고하면
        표처럼 세금이 크게 뛰고 환급이 추가 납부로 바뀝니다. 직전 연도 수입이 {manwon(NO_BOOK_PENALTY.smallBizRevenueBelow)} 이상이면 소규모사업자에서도 빠져, 장부 없이 신고할 때
        무기장 가산세(산출세액의 {pct(NO_BOOK_PENALTY.rate, 0)}, 지방소득세 {pct(LOCAL_INCOME_TAX_RATIO, 0)} 별도)까지 붙습니다.
        {penalized.length > 0 ? ` 표의 ${penalized.map((x) => `${manwon(x.revenue)} 줄은 ${won(x.penalty)}`).join(', ')}을 이 가산세로 더 냅니다.` : ''}
        {' '}수입이 이 선들에 가까워지면 그해부터 장부와 증빙을 챙겨 두는 편이 유리합니다.
      </p>

      <h2>직원을 한 명 뽑으면</h2>
      <p>
        월 {manwon(STAFF.monthly)}(식대 비과세 {manwon(STAFF.taxFree)} 포함)을 주는 직원 한 명의 4대보험 사업주 부담은 {rateYear}년 요율로 매달 약 {won(staff.employerTotal)}입니다. 급여 외에 이 금액이 더 나가므로 회사가 부담하는 월 인건비는
        약 {won(staff.companyTotalCost)}입니다. <Link href="/tools/finance/4-insurance">4대보험 계산기</Link>에서 산재보험 업종 요율을 내 업종으로 바꾸면 더 정확해집니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>부가세 포함 가격으로 원가율을 계산하기.</strong> 판매가 {won(MENU.price)}이 부가세 포함이라면 내 매출은 약 {won(netPrice)}입니다. 재료비 {won(MENU.cost)}의 원가율은 {pct(MENU.cost / MENU.price, 1)}가 아니라 {pct(MENU.cost / netPrice, 1)}입니다. <Link href="/tools/finance/cost-rate">원가율 계산기</Link>에는 부가세를 뺀 매출을 넣으세요.</li>
        <li><strong>간이과세 기준을 한 해만 보기.</strong> 한 해 공급대가가 {manwon(SIMPLIFIED_THRESHOLD)} 이상이 되면 그다음 해 7월부터 일반과세자로 바뀝니다. {manwon(SIMPLIFIED_EXEMPT_THRESHOLD)} 미만이면 간이과세자는 납부 의무가 면제되지만 신고는 해야 합니다.</li>
        <li><strong>부가세를 내 돈으로 쓰기.</strong> 손님에게 받은 부가세는 나중에 낼 세금입니다. <Link href="/tools/finance/vat">부가세 계산기</Link>로 매출에 섞인 세액을 매달 따로 떼어 두세요.</li>
        <li><strong>카드 할부 수수료를 가격에 넣지 않기.</strong> 장비·재료를 할부로 사면 그 이자도 원가입니다. <Link href="/tools/finance/installment">할부 계산기</Link>로 총 수수료를 확인한 뒤 가격을 정하세요.</li>
      </ul>

      <Callout tone="note" title="세무사와 상의할 때">
        장부 방식(간편장부·복식부기)을 고르거나, 일반과세·간이과세 전환, 사업용 카드·계좌 등록, 직원 채용 뒤 원천세 신고를 시작하는 시점에는 세무 대리인의 도움을 받는 편이 비용보다 이득인 경우가 많습니다.
        홈택스의 모의계산과 국세청 상담센터도 함께 활용하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '국세청 — 부가가치세 신고 안내', href: 'https://www.nts.go.kr' },
          { label: '국세청 홈택스 — 기준·단순경비율 조회', href: 'https://www.hometax.go.kr' },
          { label: '국가법령정보센터 — 부가가치세법 제49조·제67조', href: 'https://www.law.go.kr/법령/부가가치세법' },
          { label: '국가법령정보센터 — 소득세법 제70조·제70조의2·제81조의5(무기장 가산세)', href: 'https://www.law.go.kr/법령/소득세법' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '자영업·프리랜서, 기한과 원가의 숫자', Body }
export default guide
