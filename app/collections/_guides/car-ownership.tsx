/* 상황별 가이드 — 첫 차 구매·관리. 취득세·자동차세는 자동차세 계산기와 같은 carTaxData.calcCarTax(세율은 lib/krVehicleTax),
   유가는 lib/krFuelPrices, 할부 이자는 loanUtils, 엔진오일 점도는 viscosityData(SAE J300)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcCarTax } from '@/app/tools/finance/car-tax/carTaxData'
import { calcLoan } from '@/app/tools/finance/loan/loanUtils'
import { SAE_GRADES } from '@/app/tools/unit/viscosity/viscosityData'
import { ACQUISITION_TAX_RATES, ANNUAL_PREPAY_DISCOUNT, annualTaxAgeDiscount, CAR_TAX_PER_CC_NON_BUSINESS, LIGHT_TAX_CAP } from '@/lib/krVehicleTax'
import { FUEL_PRICE_AS_OF, GASOLINE_PRICE } from '@/lib/krFuelPrices'
import { WINDOW_TINT_MIN_VLT } from '@/lib/collections'
import { GuideSources, manwon, num, pct, won, type CollectionGuide } from './shared'

const CARS = [
  { label: '경차', price: 15_000_000, cc: 998, type: 'light' as const },
  { label: '준중형', price: 25_000_000, cc: 1598, type: 'normal' as const },
  { label: '중형', price: 32_000_000, cc: 1999, type: 'normal' as const },
]
/** 연비·주행 예시 — 월 1,000km, 12km/L */
const DRIVE = { monthlyKm: 1000, kmPerL: 12 }
/** 할부 예시 — 2,000만원, 36개월, 연 6% 원리금균등 */
const LOAN = { principal: 20_000_000, months: 36, rate: 6 }

function Body() {
  const rows = CARS.map((c) => {
    const r = calcCarTax({
      carPrice: c.price, carType: c.type, fuelType: 'gasoline', cc: c.cc, yearsSinceReg: 0, regionId: 'seoul',
      monthlyKm: DRIVE.monthlyKm, efficiencyKmL: DRIVE.kmPerL, prepay: false, exemption: 'none', yearsToHold: 1,
    })
    return { ...c, acq: r.acquisitionTax, annual: r.annualCarTax + r.annualEduTax }
  })
  const fuelYear = (DRIVE.monthlyKm * 12 / DRIVE.kmPerL) * GASOLINE_PRICE
  const loan = calcLoan({ principal: LOAN.principal, annualRate: LOAN.rate, months: LOAN.months, method: 'equal-payment' })
  const [, mid, big] = rows
  const cliff = big.annual / mid.annual - 1
  const perCc = CAR_TAX_PER_CC_NON_BUSINESS
  const w20 = SAE_GRADES.find((g) => g.grade === 'xW-20')
  const w30 = SAE_GRADES.find((g) => g.grade === 'xW-30')
  // 차령 경감(지방세법 §127③) — 처음 경감되는 차령과 해마다 늘어나는 폭을 lib 함수에서 읽는다
  const ageFrom = Array.from({ length: 30 }, (_, i) => i + 1).find((a) => annualTaxAgeDiscount(a) > 0) ?? 3
  const ageStep = annualTaxAgeDiscount(ageFrom + 1) - annualTaxAgeDiscount(ageFrom)

  return (
    <>
      <h2>왜 사기 전 비용 → 출고 후 관리 순서인가</h2>
      <p>
        차는 사는 날 한 번 내는 돈(취득세·등록비)과 매년 내는 돈(자동차세·보험), 달릴 때마다 내는 돈(연료·소모품)으로 나뉩니다. 차종을 고르는 순간 앞의 두 가지가 거의 결정되기 때문에 계약 전에
        {' '}<Link href="/tools/finance/car-cost">유지비 계산기</Link>와 <Link href="/tools/finance/car-tax">자동차세 계산기</Link>로 먼저 비교하고, 할부라면 <Link href="/tools/finance/installment">할부 계산기</Link>로 이자까지 더해
        예산을 잡습니다. 출고 뒤의 연비·공기압·엔진오일은 달리는 비용을 줄이는 단계입니다.
      </p>

      <h2>차급별로 달라지는 세금</h2>
      <DataFigure n={1} title="휘발유 신차 기준 취득세와 연 자동차세" unit="서울·비영업용" source={<>계산: 자동차세 계산기와 같은 식(지방세법 §12·§127, 지방세특례제한법 §67) — 자동차세는 지방교육세 포함, 연납 할인 전</>}>
        <table>
          <thead>
            <tr><th scope="col">차급</th><th scope="col">가격·배기량</th><th scope="col" className="r">취득세</th><th scope="col" className="r">연 자동차세</th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.label}>
                <td>{c.label}</td>
                <td>{manwon(c.price)}·{num(c.cc)}cc</td>
                <td className="r">{won(c.acq)}</td>
                <td className="r">{won(c.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        자동차세는 배기량에 cc당 세액을 곱하는데, 세액이 {num(perCc[0].ccMax)}cc 이하 {perCc[0].perCc}원, {num(perCc[1].ccMax)}cc 이하 {perCc[1].perCc}원, 그 초과 {perCc[2].perCc}원으로 계단처럼 오릅니다.
        그래서 배기량은 {num(big.cc - mid.cc)}cc 차이인데 세금은 약 {pct(cliff, 0)} 더 나옵니다. 경차는 취득세율이 {pct(ACQUISITION_TAX_RATES.light, 0)}이고 {manwon(LIGHT_TAX_CAP)}까지 감면돼 이 가격대에서는 취득세가 없습니다.
        자동차세는 1월에 한 번에 내면 약 {pct(ANNUAL_PREPAY_DISCOUNT, 2)} 할인되고, 차령이 {ageFrom}년째부터 해마다 {pct(ageStep, 0)}씩(최대 {pct(annualTaxAgeDiscount(99), 0)}) 줄어듭니다.
      </p>
      <p>
        {fuelYear > Math.max(...rows.map((r) => r.annual)) ? '달리는 비용은 세금보다 큽니다. ' : ''}월 {num(DRIVE.monthlyKm)}km를 연비 {DRIVE.kmPerL}km/L로 달리면 휘발유값({FUEL_PRICE_AS_OF} 전국 평균 {num(GASOLINE_PRICE)}원/L 기준)이 1년에 약 {won(fuelYear)}입니다.
        할부도 비용입니다. {manwon(LOAN.principal)}을 {LOAN.months}개월, 연 {LOAN.rate}%로 나눠 내면 월 {won(loan.monthlyPayment)}씩, 이자만 모두 {won(loan.totalInterest)}이 듭니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>공인 연비로 연료비를 계산하기.</strong> 도심 주행 비중이 높으면 실제 연비는 표시값보다 낮습니다. 주유할 때마다 주행거리와 주유량을 기록해 <Link href="/tools/unit/fuel-economy">연비 계산기</Link>로 내 차의 실제 값을 쓰세요.</li>
        <li><strong>엔진오일 숫자를 &lsquo;진할수록 좋다&rsquo;로 읽기.</strong> 0W-20의 20은 100℃에서의 점도 등급으로 동점도 {w20?.minCst}~{w20?.maxCst}cSt 미만, 30은 {w30?.minCst}~{w30?.maxCst}cSt 미만입니다. W 앞 숫자는 추운 날 시동성 등급입니다. 제조사가 지정한 등급을 따르는 것이 기본입니다.</li>
        <li><strong>썬팅 필름 표기만 보고 고르기.</strong> 법 기준은 필름이 아니라 유리까지 합친 투과율로, 앞면 {WINDOW_TINT_MIN_VLT.front}%·운전석 좌우(1열 운전석·조수석) 옆면 {WINDOW_TINT_MIN_VLT.driverSide}% 이상이어야 합니다. 원래 유리도 빛을 일부 막으므로 <Link href="/tools/unit/window-tint">썬팅 투과율 계산기</Link>로 합산해 보세요.</li>
        <li><strong>할부 금리만 보고 비교하기.</strong> 같은 금리라도 기간이 길면 총이자가 커지고, 선수금·취급 수수료가 붙으면 실제 부담은 더 큽니다. 총상환액으로 비교하세요.</li>
      </ul>

      <Callout tone="note" title="계산기 밖에서 확인할 것">
        자동차보험료는 나이·경력·사고 이력에 따라 차이가 커서 계산기의 평균값과 다를 수 있습니다. 구매 전에 보험사 견적을 받아 유지비에 넣고, 다자녀·장애인 감면처럼 요건이 있는 혜택은 차량 등록 관청에서
        대상 여부를 확인하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '국가법령정보센터 — 지방세법(취득세·자동차세)', href: 'https://www.law.go.kr/법령/지방세법' },
          { label: '오피넷 — 전국 주유소 평균 가격', href: 'https://www.opinet.co.kr' },
          { label: '국가법령정보센터 — 도로교통법 시행령 제28조(창유리 가시광선 투과율)', href: 'https://www.law.go.kr/법령/도로교통법시행령/제28조' },
          { label: 'SAE J300 — Engine Oil Viscosity Classification', href: 'https://www.sae.org/standards/content/j300_202405/' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '첫 차, 계약 전에 비교할 숫자', Body }
export default guide
