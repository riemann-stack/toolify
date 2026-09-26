/* 상황별 가이드 — 자취 시작. 최저임금·4대보험(lib/krInsuranceRates), 실수령(salaryUtils), 월세 세액공제(lib/krYearEndTax),
   적금 이자 원천징수(lib/krFinancialIncomeTax), 전자레인지 환산(microwaveUtils)을 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcSalary } from '@/app/tools/finance/salary/salaryUtils'
import { convertTime, portionFactor } from '@/app/tools/cooking/microwave/microwaveUtils'
import { MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS, minHourlyWageFor } from '@/lib/krInsuranceRates'
import { RENT_GROSS_CAP, RENT_LIMIT, RENT_RATE_LOW, PENSION_CREDIT_GROSS_CUT } from '@/lib/krYearEndTax'
import { GENERAL_INTEREST_TAX_RATE, withholdInterestTax } from '@/lib/krFinancialIncomeTax'
import { guideHref } from '@/lib/guides'
import { kstTodayStr } from '@/lib/todayInfo'
import { GuideSources, manwon, minSecKo, num, pct, won, type CollectionGuide } from './shared'

/** 예시 적금 — 매달 50만원, 12개월, 연 3.5% 단리(만기 일시 지급) */
const SAV = { monthly: 500_000, months: 12, rate: 0.035 }
/** 예시 월세 — 월 50만원 */
const RENT_MONTHLY = 500_000

function Body() {
  // 최저임금은 연도 키 조회 — 올해(한국 날짜) 시행값, 다음 해 값은 고시돼 표에 있을 때만 보여 준다
  const year = Number(kstTodayStr().slice(0, 4))
  const minHourly = minHourlyWageFor(year)
  const minMonthly = minHourly * MONTHLY_WORK_HOURS
  const nextHourly = (MIN_HOURLY_WAGE as Readonly<Record<number, number>>)[year + 1]
  const net = calcSalary({ grossYearly: minMonthly * 12, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0, isInsured: true })
  // 적금 이자: n번째 달 납입분은 (months − n + 1)개월 동안 이자가 붙는다 → 합계 개월 수 = months(months+1)/2
  const monthSum = (SAV.months * (SAV.months + 1)) / 2
  const interest = SAV.monthly * SAV.rate * (monthSum / 12)
  const tax = withholdInterestTax(interest, 'general').total
  const principal = SAV.monthly * SAV.months
  const effective = (interest - tax) / principal
  const rentYear = RENT_MONTHLY * 12
  const rentCredit = Math.min(rentYear, RENT_LIMIT) * RENT_RATE_LOW
  const mw = { from: 700, to: 1000, sec: 180 }
  const mwSec = convertTime(mw.from, mw.sec, mw.to)

  return (
    <>
      <h2>왜 돈 → 집 → 살림 순서인가</h2>
      <p>
        자취를 시작하면 가장 먼저 정해야 하는 숫자는 매달 고정으로 나갈 수 있는 돈의 크기입니다. 월세, 관리비, 통신비는 한 번 정하면 1~2년 동안 바꾸기 어렵기 때문에, 집을 보러 가기 전에 월급에서
        실제로 손에 남는 돈을 먼저 알아야 합니다. <Link href="/tools/finance/salary">연봉 실수령액</Link>과 <Link href="/tools/finance/4-insurance">4대보험 계산기</Link>로 월 실수령을 확인하고,
        {' '}<Link href="/tools/finance/savings">저축 계산기</Link>로 저축액을 먼저 떼어 둔 뒤 남은 범위에서 집을 고르는 순서입니다. 명세서에서 무엇이 빠지는지는 <Link href={guideHref('first-paycheck')}>첫 월급 명세서 읽는 법</Link>에 자세히 풀어 두었습니다.
      </p>

      <h2>기준이 되는 숫자</h2>
      <DataFigure n={1} title="자취 첫해에 알아 둘 숫자" source={<>자료: 고용노동부 최저임금 고시, 소득세법·조세특례제한법 — Youtil 계산(각 계산기와 같은 식)</>}>
        <table>
          <thead>
            <tr><th scope="col">항목</th><th scope="col">기준</th><th scope="col" className="r">값</th></tr>
          </thead>
          <tbody>
            <tr><td>최저임금 월 환산({year})</td><td>{num(minHourly)}원 × {MONTHLY_WORK_HOURS}시간</td><td className="r">{won(minMonthly)}</td></tr>
            <tr><td>그 월급의 실수령</td><td>4대보험·소득세 공제 후</td><td className="r">약 {won(net.netMonthly)}</td></tr>
            {nextHourly !== undefined && (
              <tr><td>최저임금 월 환산({year + 1})</td><td>{num(nextHourly)}원 × {MONTHLY_WORK_HOURS}시간</td><td className="r">{won(nextHourly * MONTHLY_WORK_HOURS)}</td></tr>
            )}
            <tr><td>월세 {manwon(RENT_MONTHLY)} 세액공제</td><td>총급여 {manwon(PENSION_CREDIT_GROSS_CUT)} 이하 {pct(RENT_RATE_LOW, 0)}</td><td className="r">연 {won(rentCredit)}</td></tr>
            <tr><td>적금 월 {manwon(SAV.monthly)}·1년·연 {pct(SAV.rate, 1)}</td><td>이자소득세 {pct(GENERAL_INTEREST_TAX_RATE, 1)} 뒤</td><td className="r">{won(interest - tax)}</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        마지막 줄이 흔한 착각을 보여 줍니다. 연 {pct(SAV.rate, 1)} 적금이라도 매달 넣는 돈은 평균 반년 정도만 이자가 붙기 때문에, 1년 뒤 받는 세후 이자는 원금 {manwon(principal)}의 약 {pct(effective, 1)}입니다.
        목돈을 만들 때는 금리보다 납입액과 기간이 훨씬 큰 영향을 줍니다.
      </p>

      <h2>집을 고를 때</h2>
      <p>
        <Link href="/tools/finance/rent-jeonse">전월세 비교 계산기</Link>는 전세대출 이자와 월세를 같은 기간의 총비용으로 바꿔 비교합니다. 여기에 월세 세액공제를 넣는 것을 잊지 마세요. 무주택 세대주이고
        총급여가 {manwon(RENT_GROSS_CAP)} 이하인 등 요건을 갖추면 연 {manwon(RENT_LIMIT)} 한도에서 월세의 일부를 세금에서 돌려받습니다. 다만 계약한 집으로 전입신고를 해야 하므로, 전입이 안 되는 조건의 방은 이 혜택을
        계산에서 빼야 합니다. 방을 보러 갈 때는 <Link href="/tools/interior/room-area">방 면적 계산기</Link>로 실제 가로·세로를 재 두면 침대·책상이 들어가는지 미리 확인할 수 있습니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>세전 월급으로 월세를 정하기.</strong> 최저임금 기준으로도 세전과 실수령의 차이는 월 {won(minMonthly - net.netMonthly)}입니다. 고정비 비율은 실수령 기준으로 계산하세요.</li>
        <li><strong>관리비·공과금을 빼고 비교하기.</strong> 월세가 싸도 관리비가 높으면 총비용은 역전됩니다. 전월세 비교에 관리비를 함께 넣어야 공정합니다.</li>
        <li><strong>전자레인지 시간을 그대로 따라 하기.</strong> 포장지의 {mw.from}W {minSecKo(mw.sec)}은 {mw.to}W 제품에서 약 {minSecKo(mwSec)}입니다. 두 개를 한 번에 데울 때도 시간은 두 배가 아니라 약 {num(portionFactor(2), 2)}배면 충분합니다. <Link href="/tools/cooking/microwave">출력 환산기</Link>로 내 제품 기준으로 바꿔 두세요.</li>
        <li><strong>대용량이 늘 싸다고 믿기.</strong> 용량이 다른 상품은 <Link href="/tools/life/unit-price">단위 가격</Link>으로 비교하고, 다 먹기 전에 상하는 식재료라면 <Link href="/tools/cooking/food-storage">보관 기한</Link>까지 따져야 실제로 싼지 알 수 있습니다.</li>
      </ul>

      <Callout tone="note" title="계약 전에 꼭 확인할 것">
        보증금이 큰 계약이라면 등기부등본의 선순위 권리와 전세보증금 반환보증 가입 가능 여부를 계약 전에 확인하세요. 계산기는 비용을 비교할 뿐, 보증금이 안전한지는 판단하지 못합니다. 판단이 어렵다면
        공인중개사에게 설명을 요청하거나 법률구조공단 등 공공 상담을 이용하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '고용노동부 — 최저임금 고시', href: 'https://www.moel.go.kr' },
          { label: '국세청 — 월세액 세액공제 안내', href: 'https://www.nts.go.kr' },
          { label: '주택도시보증공사(HUG) — 전세보증금반환보증', href: 'https://www.khug.or.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '자취 첫해, 돈과 집의 숫자', Body }
export default guide
