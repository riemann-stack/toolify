/* 상황별 가이드 — 연말정산·새해 준비. 절세 표는 연말정산 계산기와 같은 lib/krYearEndTax.calcYearEnd로 빌드 시 계산, 실수령은 salaryUtils */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcSalary, NON_TAXABLE_ITEMS } from '@/app/tools/finance/salary/salaryUtils'
import {
  calcYearEnd, CARD_LIMIT_LOW, CARD_LOW_GROSS_CUT, CARD_RATE_CHECK, CARD_RATE_CREDIT, CARD_THRESHOLD_RATE, LOCAL_TAX_RATE,
  PENSION_CREDIT_GROSS_CUT, PENSION_CREDIT_RATE_HIGH, PENSION_SAVINGS_LIMIT, PENSION_TOTAL_LIMIT, YEAR_END_TAX_YEAR, type YearEndInput,
} from '@/lib/krYearEndTax'
import { FILING_CREDIT_RATE } from '@/lib/krInheritanceTax'
import { GuideSources, manwon, pct, won, type CollectionGuide } from './shared'

/** 예시 — 총급여 5,000만원 1인 가구, 신용카드 1,500만·체크카드 300만원 사용 */
const BASE: YearEndInput = {
  gross: 50_000_000, dependents: 0, children: 0, elderly: 0, disabled: 0,
  creditCard: 15_000_000, checkCash: 3_000_000, marketTransit: 0,
  pensionSavings: 0, irp: 0, insurance: 0, medical: 0, education: 0, donation: 0,
  monthlyRent: 0, isHomeless: false, nationalPension: null, otherInsurance: null, prepaidTax: null, prepaidIncludesLocal: true,
}
const EXTRA_SPEND = 3_000_000

function Body() {
  const base = calcYearEnd(BASE)
  const actions = [
    { label: `체크카드·현금영수증으로 ${manwon(EXTRA_SPEND)} 더 결제`, r: calcYearEnd({ ...BASE, checkCash: BASE.checkCash + EXTRA_SPEND }) },
    { label: `같은 ${manwon(EXTRA_SPEND)}을 신용카드로 결제`, r: calcYearEnd({ ...BASE, creditCard: BASE.creditCard + EXTRA_SPEND }) },
    { label: `연금저축 ${manwon(PENSION_SAVINGS_LIMIT)} + IRP ${manwon(PENSION_TOTAL_LIMIT - PENSION_SAVINGS_LIMIT)} 납입`, r: calcYearEnd({ ...BASE, pensionSavings: PENSION_SAVINGS_LIMIT, irp: PENSION_TOTAL_LIMIT - PENSION_SAVINGS_LIMIT }) },
  ].map((a) => ({ label: a.label, saved: base.decidedTotal - a.r.decidedTotal }))
  const salary = calcSalary({ grossYearly: BASE.gross, dependents: 1, childrenCount: 0, nonTaxableMonthly: NON_TAXABLE_ITEMS[0].monthlyMax, isInsured: true })
  const threshold = BASE.gross * CARD_THRESHOLD_RATE
  const pensionRateWithLocal = PENSION_CREDIT_RATE_HIGH * (1 + LOCAL_TAX_RATE)

  return (
    <>
      <h2>왜 12월에 세금부터 보는가</h2>
      <p>
        연말정산은 1~2월에 서류를 내는 일이지만, 결과를 바꿀 수 있는 행동은 12월 31일에 끝납니다. 카드를 어떤 수단으로 긁을지, 연금계좌에 얼마를 넣을지는 해가 바뀌면 되돌릴 수 없습니다.
        그래서 이 가이드는 <Link href="/tools/finance/salary">연봉 실수령액</Link>으로 올해 받은 돈을 확인하고, <Link href="/tools/finance/year-end-tax">연말정산 계산기</Link>로 환급·추가납부를 미리 본 뒤,
        프리랜서 소득이나 부동산 양도처럼 따로 신고하는 세금을 챙기는 순서로 짰습니다. 나이·D-day 같은 새해 계획은 세금 정리가 끝난 뒤의 일입니다.
      </p>
      <p>
        예로 총급여 {manwon(BASE.gross)}(식대 비과세 월 {manwon(NON_TAXABLE_ITEMS[0].monthlyMax)} 별도, 부양가족 없음)인 직장인의 월 실수령액은 약 {manwon(salary.netMonthly)}입니다.
        이 사람이 신용카드 {manwon(BASE.creditCard)}, 체크카드 {manwon(BASE.checkCash)}을 썼다면 {YEAR_END_TAX_YEAR}년 귀속 결정세액(지방소득세 포함)은 약 {won(base.decidedTotal)}으로 계산됩니다.
      </p>

      <h2>12월 31일 전에 바꿀 수 있는 숫자</h2>
      <DataFigure n={1} title={`총급여 ${manwon(BASE.gross)} — 행동별로 줄어드는 세금`} unit="지방소득세 포함" source={<>계산: 연말정산 계산기와 같은 식(조세특례제한법 §126의2, 소득세법 §59의3) — {YEAR_END_TAX_YEAR}년 귀속 기준</>}>
        <table>
          <thead>
            <tr><th scope="col">12월에 한 일</th><th scope="col" className="r">줄어드는 세금</th></tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.label}><td className="wrap">{a.label}</td><td className="r">{won(a.saved)}</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        카드 공제는 총급여의 {pct(CARD_THRESHOLD_RATE, 0)}({manwon(threshold)})를 넘게 쓴 부분부터 시작하고, 넘은 부분은 신용카드 {pct(CARD_RATE_CREDIT, 0)}, 체크카드·현금영수증 {pct(CARD_RATE_CHECK, 0)}를 소득에서 빼
        줍니다(기본 한도 {manwon(CARD_LIMIT_LOW)}, 총급여 {manwon(CARD_LOW_GROSS_CUT)} 이하). 그래서 문턱을 넘긴 뒤라면 어차피 쓸 돈을 체크카드로 돌리는 편이 유리합니다. 공제를 받으려고 소비를 늘리는 것은 손해라는 점도 표에서 보입니다.
        {' '}{manwon(EXTRA_SPEND)}을 더 써도 돌아오는 세금은 그 일부입니다. 반면 연금계좌 납입은 소비가 아니라 저축이면서 세액공제율이 {pct(pensionRateWithLocal, 1)}(총급여 {manwon(PENSION_CREDIT_GROSS_CUT)} 이하, 지방소득세 포함)라 효과가 큽니다.
        다만 연금저축은 원칙적으로 55세 이후 연금으로 받아야 혜택이 유지되니, 당장 쓸 돈으로 채우지는 마세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>부부가 같은 가족을 함께 공제하기.</strong> 자녀·부모의 기본공제는 한 사람만 받을 수 있습니다. 둘 다 넣으면 나중에 추가 세금과 가산세가 나옵니다.</li>
        <li><strong>간소화 자료만 믿기.</strong> 월세, 안경 구입비, 일부 기부금처럼 국세청 간소화 서비스에 빠지기 쉬운 항목은 영수증을 따로 챙겨 회사에 내야 합니다.</li>
        <li><strong>중도 퇴사 후 그대로 두기.</strong> 연중에 퇴사하면 회사는 카드·의료비 공제 없이 약식으로 정산합니다. 다음 해 5월 종합소득세 신고 때 공제를 넣으면 환급받을 수 있습니다.</li>
        <li><strong>따로 신고하는 세금을 잊기.</strong> 프리랜서 사업소득은 <Link href="/tools/finance/freelance-tax">종합소득세</Link>로, 부동산을 팔았다면 <Link href="/tools/finance/capital-gains-tax">양도소득세</Link>를 잔금일이 속한 달 말일부터 2개월 안에 예정신고합니다. 상속·증여세는 기한 안에 신고하면 산출세액의 {pct(FILING_CREDIT_RATE, 0)}를 공제받습니다.</li>
      </ul>
      <p>
        새해 계획 단계에서는 <Link href="/tools/date/age">나이 계산기</Link>로 만 나이를 확인하세요. 2023년 6월부터 법령·계약서의 나이는 특별한 규정이 없으면 만 나이로 읽습니다. 목표일이 있다면 <Link href="/tools/date/dday">D-day</Link>로 남은 날을 세어 두면 됩니다.
      </p>

      <Callout tone="note" title="세무 상담이 필요한 경우">
        근로소득 외에 사업·임대·금융소득이 함께 있거나, 한 해에 부동산 양도·퇴직·상속이 겹쳤다면 소득을 합산하는 방식에 따라 세금이 크게 달라집니다. 계산기 결과는 방향을 잡는 용도로 쓰고, 신고 전에 세무사와
        확인하세요. 정확한 연말정산 결과는 국세청 홈택스 모의계산이 기준입니다.
      </Callout>

      <GuideSources
        items={[
          { label: '국세청 홈택스 — 연말정산 간소화·모의계산', href: 'https://www.hometax.go.kr' },
          { label: '국가법령정보센터 — 조세특례제한법 제126조의2(신용카드 등 사용금액 소득공제)', href: 'https://www.law.go.kr/법령/조세특례제한법/제126조의2' },
          { label: '국가법령정보센터 — 소득세법 제59조의3(연금계좌세액공제)', href: 'https://www.law.go.kr/법령/소득세법/제59조의3' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '연말정산, 12월에 끝내야 할 숫자', Body }
export default guide
