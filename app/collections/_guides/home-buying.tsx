/* 상황별 가이드 — 내 집 마련~셀프 인테리어. DSR·취득세·중개보수·보유세는 도구와 같은 lib(krLoanRules·krAcquisitionTax·krBrokerageFee·krPropertyTax)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { principalFromAnnual } from '@/app/tools/finance/dsr/dsrUtils'
import { bankbookScore, dependentScore, unhomedScore } from '@/app/tools/finance/housing-score/housingScoreData'
import { TRIM_M } from '@/app/tools/interior/wallpaper/wallpaperUtils'
import {
  DSR_LIMIT_RATIO, LTV_NON_REGULATED, LTV_REGULATED_FIRST_TIME, LTV_REGULATED_NO_HOME, STRESS_RATE_DEFAULT, STRESS_RATE_REGULATED,
} from '@/lib/krLoanRules'
import { ACQ_FILING_DEADLINE, calcHouseAcquisitionTax } from '@/lib/krAcquisitionTax'
import { BROKERAGE_VAT_PCT, calcBrokerageFee } from '@/lib/krBrokerageFee'
import { calcHoldingTax, COMP_DEDUCT_ONEHOUSE } from '@/lib/krPropertyTax'
import { GuideSources, manwon, num, pct, won, type CollectionGuide } from './shared'

/** 예시 차주 — 연소득 6,000만원·기존 대출 없음·연 4.0%·30년 원리금균등·변동금리 */
const EX = { incomeMan: 6_000, rate: 4.0, years: 30 }

function Body() {
  const capacity = EX.incomeMan * DSR_LIMIT_RATIO // 만원
  const stress = [0, STRESS_RATE_DEFAULT, STRESS_RATE_REGULATED].map((add) => ({
    add,
    loan: principalFromAnnual(capacity, EX.rate + add, EX.years, 'equal') * 10_000,
  }))
  const drop = 1 - stress[2].loan / stress[0].loan
  const prices = [500_000_000, 800_000_000, 1_000_000_000].map((price) => {
    const acq = calcHouseAcquisitionTax({ price, homeCount: 1, adjusted: false, over85: false })
    const fee = calcBrokerageFee({ deal: 'sale', property: 'house', amount: price })
    return { price, acq, fee: fee.maxFee + fee.vat }
  })
  const holding = [300_000_000, 600_000_000, 900_000_000].map((publicPrice) => ({
    publicPrice,
    total: calcHoldingTax({ publicPrice, houses: 1, oneHouse: true, urbanArea: true, holdYears: 0, age: 40 }).total,
  }))
  const maxScore = unhomedScore(15) + dependentScore(6) + bankbookScore(15)

  return (
    <>
      <h2>왜 한도 → 집 → 인테리어 순서인가</h2>
      <p>
        매물을 먼저 보고 대출을 맞추면 계획이 거꾸로 무너집니다. 주택담보대출 한도는 집값 대비 비율(LTV), 소득 대비 연간 원리금(DSR {pct(DSR_LIMIT_RATIO, 0)}),
        수도권·규제지역의 금액 상한 가운데 <strong>가장 작은 값</strong>으로 정해지고, 이 중 DSR은 집이 아니라 내 소득이 결정합니다. 그래서 첫 단계는 매물이 아니라
        {' '}<Link href="/tools/finance/dsr">DSR 계산기</Link>로 내 소득이 감당하는 대출액을 아는 일입니다. 아래 표는 연소득 {num(EX.incomeMan)}만원, 기존 대출 없음,
        연 {EX.rate}%·{EX.years}년 원리금균등(변동금리)을 가정한 결과입니다.
      </p>
      <DataFigure n={1} title={`연소득 ${num(EX.incomeMan)}만원의 DSR 기준 최대 대출`} unit="변동금리·30년" source={<>자료: 금융위원회 스트레스 DSR·10·15 대책 기준 — Youtil 계산(DSR 계산기와 같은 식)</>}>
        <table>
          <thead>
            <tr><th scope="col">스트레스 가산금리</th><th scope="col" className="r">심사 금리</th><th scope="col" className="r">최대 대출</th></tr>
          </thead>
          <tbody>
            {stress.map((s) => (
              <tr key={s.add}>
                <td>{s.add === 0 ? '가산 없음(비교용)' : `+${s.add}%p`}</td>
                <td className="r">{(EX.rate + s.add).toFixed(1)}%</td>
                <td className="r">{manwon(s.loan)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        수도권·규제지역 주담대는 스트레스 가산금리 하한이 {STRESS_RATE_REGULATED}%p라, 같은 소득이라도 한도가 비교용 값보다 약 {pct(drop, 0)} 줄어듭니다. 여기에 LTV가 겹칩니다.
        규제지역 무주택자는 {LTV_REGULATED_NO_HOME}%(생애최초 구입은 {LTV_REGULATED_FIRST_TIME}%), 비규제지역 무주택·1주택자는 {LTV_NON_REGULATED}%라 지역을 정하는 순간 필요한 자기자금이 크게 달라집니다.
      </p>

      <h2>집값 말고 준비할 현금</h2>
      <p>
        한도를 알았다면 다음은 계약 전에 현금으로 나가는 돈입니다. 취득세는 잔금일(취득일)부터 {ACQ_FILING_DEADLINE.purchaseDays}일 안에 신고·납부해야 하고, 중개보수는 법정 상한 안에서
        협의하는 금액입니다. 1주택·전용 85㎡ 이하·비조정지역 매매를 기준으로 계산하면 다음과 같습니다.
      </p>
      <DataFigure n={2} title="매매가별 취득세와 중개보수 상한" unit="1주택·85㎡ 이하" source={<>자료: 지방세법 제11조, 공인중개사법 시행규칙 별표1 — 중개보수는 상한에 부가세 {BROKERAGE_VAT_PCT}% 포함</>}>
        <table>
          <thead>
            <tr><th scope="col">매매가</th><th scope="col" className="r">취득세 등</th><th scope="col" className="r">중개보수 상한</th></tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.price}>
                <td>{manwon(p.price)}</td>
                <td className="r">{won(p.acq.total)} ({p.acq.totalRate}%)</td>
                <td className="r">{won(p.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        집을 산 뒤에는 매년 6월 1일 현재 소유자에게 보유세가 부과됩니다. 1세대 1주택·도시지역 기준으로 공시가격 {holding.map((h) => `${manwon(h.publicPrice)}이면 재산세 등 약 ${won(h.total)}`).join(', ')}이고,
        종합부동산세는 1주택자라면 공시가격 {manwon(COMP_DEDUCT_ONEHOUSE)}을 넘는 부분부터 붙습니다. 시세가 아니라 공시가격 기준이라는 점을 <Link href="/tools/finance/property-holding-tax">보유세 계산기</Link>에 넣을 때 기억하세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>중개보수를 고정 요율로 알기.</strong> 표의 금액은 상한이고 실제 보수는 계약 전에 협의합니다. 일반과세자 중개사무소는 부가세를 따로 받습니다.</li>
        <li><strong>청약 가점을 자기 기준으로 세기.</strong> 만점은 {maxScore}점(무주택 기간 {unhomedScore(15)} + 부양가족 {dependentScore(6)} + 통장 가입기간 {bankbookScore(15)})이지만, 만 30세 전 미혼 기간은 무주택 기간에 들어가지 않고 형제·자매는 부양가족이 아닙니다. <Link href="/tools/finance/housing-score">청약 가점 계산기</Link>로 날짜를 넣어 확인하세요.</li>
        <li><strong>공급면적으로 자재를 주문하기.</strong> 분양 광고의 평형은 공용 부분까지 포함한 공급면적입니다. 도배·바닥재는 실제로 잰 벽·바닥 면적으로 계산하고, 도배지는 한 장마다 천장고에 {TRIM_M * 100}cm 안팎의 재단 여유를 더해 장 수를 셉니다.</li>
        <li><strong>경매 낙찰가만 보고 입찰하기.</strong> 취득세·법무 비용·명도 비용과 대출 가능액은 입찰 전에 <Link href="/tools/finance/auction">경매 비용 계산기</Link>로 따로 확인해야 합니다.</li>
      </ul>

      <Callout tone="note" title="전문가와 상의할 때">
        일시적 2주택·증여·공동명의처럼 세금이 갈리는 선택, 선순위 권리와 전세 보증이 얽힌 매물, 경매 물건의 권리 분석은 계산기로 판단할 수 없습니다. 계약 전에 세무사·법무사와
        상의하고, 대출은 은행 창구에서 실제 심사 금리로 한도를 다시 받아 보세요.
      </Callout>

      <GuideSources
        items={[
          { label: '금융위원회 — 주택시장 안정화를 위한 대출수요 관리 방안(10·15 대책)', href: 'https://www.fsc.go.kr/no010101/85432' },
          { label: '국가법령정보센터 — 지방세법 제11조(부동산 취득의 세율)', href: 'https://www.law.go.kr/법령/지방세법/제11조' },
          { label: '국가법령정보센터 — 공인중개사법 시행규칙', href: 'https://www.law.go.kr/법령/공인중개사법시행규칙' },
          { label: '청약홈 — 청약 가점제 안내', href: 'https://www.applyhome.co.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '내 집 마련, 계약 전에 확인할 숫자', Body }
export default guide
