import Link from 'next/link'
import CarTaxClient from './CarTaxClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  calcCarTax, ACQUISITION_TAX_RATES, EV_TAX_CAP, LIGHT_TAX_CAP, MULTI_CHILD_TAX_CAP, TWO_CHILD_TAX_CAP,
  annualTaxByCC, annualTaxAgeDiscount, carAgeFromYears, EDU_TAX_RATE, ANNUAL_PREPAY_DISCOUNT, EV_ANNUAL_TAX,
  REGIONS, BOND_DISCOUNT_RATE, REGISTRATION_FEE, FUEL_TAX, DIESEL_ENV_FEE_LAST_REG_YEAR,
  type CarTaxInputs, type CarTaxResult,
} from './carTaxData'
import { CAR_TAX_PER_CC_NON_BUSINESS } from '@/lib/krVehicleTax'
import { GASOLINE_PRICE, DIESEL_PRICE, FUEL_PRICE_AS_OF } from '@/lib/krFuelPrices'

/* ── 가이드 수치 — 전부 계산기와 같은 함수·상수로 빌드 시 계산 (정적 수치 드리프트 방지) ── */
const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/** 만 원 단위 (소수 1자리까지, 예: 254.7만) */
const man = (n: number) => `${(Math.round(n / 1_000) / 10).toLocaleString('ko-KR')}만`
const pct = (r: number, d = 0) => `${(r * 100).toFixed(d)}%`

/** 계산기 기본 입력값 (CarTaxClient 초기 state와 동일) */
const DEF: CarTaxInputs = {
  carPrice: 30_000_000, carType: 'normal', fuelType: 'gasoline', cc: 1999, yearsSinceReg: 0,
  regionId: 'seoul', monthlyKm: 1500, efficiencyKmL: 12, prepay: true, exemption: 'none', yearsToHold: 5,
}
const D = calcCarTax(DEF)
const D_Y1 = D.yearlyBreakdown[0]
const D_Y5 = D.yearlyBreakdown[D.yearlyBreakdown.length - 1]

/* 4,000만 원 휘발유 2.0 vs 전기차 (5년, 서울, 월 1,500km, 연납) */
const GAS40 = calcCarTax({ ...DEF, carPrice: 40_000_000 })
const EV40 = calcCarTax({ ...DEF, carPrice: 40_000_000, carType: 'ev', fuelType: 'electric', cc: 0 })
const taxOnly = (r: CarTaxResult) => r.acquisitionTax + r.yearlyBreakdown.reduce((s, y) => s + y.carTax + y.eduTax, 0)
const EV_TAX_GAP = taxOnly(GAS40) - taxOnly(EV40)
const EV_ALL_GAP = GAS40.totalForPeriod - EV40.totalForPeriod
const GAS40_ANNUAL_TAX = GAS40.annualCarTax + GAS40.annualEduTax
const EV40_ANNUAL_TAX = EV40.annualCarTax + EV40.annualEduTax

/* 자동차세 조견표 — 배기량 × 차령 (지방교육세 30% 포함, 연납 공제 전) */
const AGES = [1, 3, 5, 8, 12]
const CC_ROWS = [
  { label: '경차 998cc', cc: 998 },
  { label: '1.6 1,598cc', cc: 1598 },
  { label: '2.0 1,999cc', cc: 1999 },
  { label: '2.5 2,497cc', cc: 2497 },
  { label: '3.3 3,342cc', cc: 3342 },
].map(r => ({
  ...r,
  byAge: AGES.map(a => annualTaxByCC(r.cc, false) * (1 - annualTaxAgeDiscount(a)) * (1 + EDU_TAX_RATE)),
}))

/* 연납 — 공제율(연 5%) × 남은 개월/12. 1월 값은 lib ANNUAL_PREPAY_DISCOUNT */
const PREPAY_BASE_RATE = ANNUAL_PREPAY_DISCOUNT * 12 / 11
const PREPAY_MONTHS = [
  { m: '1월', r: ANNUAL_PREPAY_DISCOUNT },
  { m: '3월', r: PREPAY_BASE_RATE * 9 / 12 },
  { m: '6월', r: PREPAY_BASE_RATE * 6 / 12 },
  { m: '9월', r: PREPAY_BASE_RATE * 3 / 12 },
]
const PREPAY_2000 = annualTaxByCC(1999, false) * (1 + EDU_TAX_RATE) * ANNUAL_PREPAY_DISCOUNT

/* 공채 — 서울은 배기량별, 그 밖은 도구 대표값을 비율별로 묶는다 */
const BOND_PRICE = 30_000_000
const bondReal = (rate: number) => BOND_PRICE * rate * BOND_DISCOUNT_RATE
const BOND_GROUPS = Array.from(
  REGIONS.filter(r => r.id !== 'seoul').reduce((m, r) => m.set(r.bondRate, [...(m.get(r.bondRate) ?? []), r.name]), new Map<number, string[]>()),
).sort((a, b) => b[0] - a[0])

/* 유류세 — 탄력세율 정액분(부가세 별도·한시 인하 전) + 판매가의 1/11 부가세 */
const KM_YEAR = 1500 * 12
const FUEL_ROWS = [
  { name: '휘발유', tax: FUEL_TAX.gasoline.taxPerLiter, eff: 12, price: GASOLINE_PRICE },
  { name: '경유', tax: FUEL_TAX.diesel.taxPerLiter, eff: 14, price: DIESEL_PRICE },
  { name: 'LPG', tax: FUEL_TAX.lpg.taxPerLiter, eff: 10, price: 0 },
]
const taxShare = (tax: number, price: number) => (tax + price / 11) / price

/* 중고차 예시 — 5년 된 차 1,500만 원 매수 */
const USED_PRICE = 15_000_000
const USED_AGE_DISCOUNT = annualTaxAgeDiscount(carAgeFromYears(5))
/* 부가세 포함가를 그대로 넣었을 때 */
const VAT_INCL_PRICE = 33_000_000
const acqNormal = (p: number) => p * ACQUISITION_TAX_RATES.normal

export const metadata = buildMetadata({
  path: '/tools/finance/car-tax',
  title: '자동차 세금 종합 계산기 — 취득세·자동차세·유류세·공채까지',
  description:
    '자동차 구매 시 취득세 + 공채 매입 + 등록비 + 매년 자동차세·지방교육세·환경부담금·유류세까지 한 화면에. 친환경차·다자녀·장애인 감면 자동 + 연납 약 5% 할인 + 5/10년 누적 시뮬레이션 (2026년 기준).',
  keywords: [
    '자동차 세금', '취득세 계산기', '자동차세 계산기', '자동차세 연납',
    '공채 매입', '도시철도채권', '지역개발채권', '유류세',
    '환경개선부담금', '자동차 양도세', '자동차 양도소득세',
    '전기차 취득세', '하이브리드 감면', '다자녀 자동차 감면',
    '장애인 자동차세 면제', '자동차세 감면', '경차 취득세',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const tableBox: React.CSSProperties = { ...card, padding: 0, overflow: 'hidden', marginBottom: '16px' }
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const num: React.CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const headNum: React.CSSProperties = { ...headCell, textAlign: 'right' }

const FAQ_LD = [
  {
    q: '중고차도 취득세를 내나요?',
    a: `네. 매수인이 이전등록할 때 일반 승용 ${pct(ACQUISITION_TAX_RATES.normal)}(경차 ${pct(ACQUISITION_TAX_RATES.light)}, ${man(LIGHT_TAX_CAP)} 원까지 면제)를 냅니다. 신차 출고가가 아니라 거래 가격이 기준이라 금액은 줄어듭니다. 예를 들어 5년 된 2.0 승용차를 ${man(USED_PRICE)} 원에 사면 취득세는 ${won(acqNormal(USED_PRICE))}이고, 공채와 등록비가 더해집니다. 다만 신고한 거래 가격이 차종·연식별 시가표준액보다 낮으면 시가표준액으로 과세될 수 있으니 위택스에서 시가표준액을 미리 조회해 두세요. 5년 경과(차령 6) 차는 자동차세가 이미 ${pct(USED_AGE_DISCOUNT)} 경감된 상태입니다.`,
  },
  {
    q: '자동차세 연납은 언제 얼마 할인되나요?',
    a: `1월에 1년 치를 한꺼번에 내면 공제율 ${pct(PREPAY_BASE_RATE)}에 남은 기간(2~12월, 11개월)을 곱해 실질 약 ${pct(ANNUAL_PREPAY_DISCOUNT, 2)}가 줄어듭니다. 3월 신청은 약 ${pct(PREPAY_MONTHS[1].r, 2)}, 6월은 ${pct(PREPAY_MONTHS[2].r, 2)}, 9월은 ${pct(PREPAY_MONTHS[3].r, 2)}로 늦을수록 작아집니다. 1,999cc 승용차(지방교육세 포함 연 ${won(annualTaxByCC(1999, false) * (1 + EDU_TAX_RATE))})라면 1월 연납으로 약 ${won(PREPAY_2000)}을 아낍니다. 공제율은 지방세법 시행령으로 정해져 해마다 바뀔 수 있으니 신청 전 위택스 공지를 확인하세요. 위택스나 관할 구청에서 신청하며, 한 번 신청하면 다음 해부터 1월에 자동으로 연납 고지서가 나옵니다.`,
  },
  {
    q: '전기차 세금이 정말 일반차보다 많이 절약되나요?',
    a: `세금만 보면 확실히 적습니다. 4,000만 원 차량을 서울에서 신차로 사 5년 타는 경우(연납, 월 1,500km) 계산기 결과로 비교하면 취득세는 휘발유 2.0이 ${man(GAS40.acquisitionTax)} 원, 전기차가 ${man(EV40.acquisitionTax)} 원(${man(EV_TAX_CAP)} 원 한도 감면)입니다. 자동차세(교육세 포함)는 첫해 기준 휘발유 연 ${won(GAS40_ANNUAL_TAX)}, 전기차 연 ${won(EV40_ANNUAL_TAX)}입니다. 취득세와 5년 자동차세만 합친 차이는 약 ${man(EV_TAX_GAP)} 원이고, 연비 12km/L 휘발유차의 유류세(연 약 ${man(GAS40.annualFuelTax)} 원)까지 넣으면 5년 차이는 약 ${man(EV_ALL_GAP)} 원입니다. 다만 전기차는 충전 요금이 따로 들고 차량 가격 자체가 비싼 경우가 많으니, 차값과 연료비까지 합친 비교는 자동차 유지비 계산기에서 확인하세요.`,
  },
  {
    q: '공채를 보유하는 게 이득인가요, 즉시 매도가 이득인가요?',
    a: `대부분 등록 당일 즉시 매도(할인)합니다. 도시철도채권·지역개발채권은 만기가 5년 이상으로 길고 표면금리가 시중 금리보다 낮게 정해져 있어, 만기까지 들고 있으면 그 돈을 다른 곳에 굴리지 못하는 기회비용이 큽니다. 즉시 매도하면 매입액에서 할인액을 뺀 금액을 바로 돌려받고, 그 할인액이 실제 비용이 됩니다. 할인율은 채권 시세에 따라 매일 바뀌며, 본 도구는 매입액의 ${pct(BOND_DISCOUNT_RATE)}를 실비용으로 가정합니다. 부동산 등기 때 사는 국민주택채권과 같은 구조입니다.`,
  },
  {
    q: '차량 명의를 부모님으로 하면 절세되나요?',
    a: '대부분 효과가 없습니다. 나이가 많다는 이유로 자동차세를 깎아 주는 제도는 없습니다. 장애인·상이 국가유공자는 본인 명의 1대(또는 주민등록상 같은 세대인 가족과의 공동명의 등 요건 충족 시)에 취득세·자동차세 감면이 있지만, 명의만 빌린 것이 드러나면 감면세액 추징과 가산세가 붙습니다. 보험도 명의자 기준이라 운전자 범위를 잘못 정하면 사고 때 보상을 못 받을 수 있습니다. 본 도구의 감면 자격은 다자녀·장애인·상이 국가유공자만 반영합니다.',
  },
  {
    q: '환경개선부담금은 누가 내나요?',
    a: `배출가스 기준 유로4 이하인 노후 경유차 소유자만 냅니다. 유로5·6 기준으로 나온 경유차(대략 2012년 이후 출고)는 부과 대상이 아니라 신차 경유차는 내지 않습니다. 대상 차량은 3월·9월 연 2회 부과되며 금액은 배기량·차령·지역에 따라 다릅니다. 본 도구는 경과 년수로 등록연도를 추정해 ${DIESEL_ENV_FEE_LAST_REG_YEAR}년 이전 등록 경유차에만 배기량별 추정액을 더합니다. 노후 경유차라면 지자체 조기폐차 지원금도 확인해 보세요.`,
  },
  {
    q: '견적서의 차량 가격을 그대로 넣으면 되나요?',
    a: `신차 취득세의 과세표준에는 부가가치세가 들어가지 않습니다(지방세법 시행령 §18). 견적서의 부가세 포함 가격을 그대로 넣으면 취득세가 10% 크게 나옵니다. 예를 들어 부가세 포함 ${man(VAT_INCL_PRICE)} 원 차라면 공급가액 ${man(VAT_INCL_PRICE / 1.1)} 원을 넣어야 취득세 ${man(acqNormal(VAT_INCL_PRICE / 1.1))} 원이 나오고, 포함가를 넣으면 ${man(acqNormal(VAT_INCL_PRICE))} 원으로 과다 계산됩니다. 반대로 할인·프로모션으로 실제 계약 가격이 낮아졌다면 그 가격이 기준입니다. 전기차 구매 보조금은 과세표준에서 빠지지 않으므로 보조금 차감 전 가격을 넣으세요.`,
  },
  {
    q: '연중에 차를 팔거나 폐차하면 자동차세는 어떻게 되나요?',
    a: '자동차세는 1년을 두 기(1~6월분은 6월, 7~12월분은 12월 고지)로 나눠 부과하고, 양도·말소가 있으면 소유 기간만큼 일할 계산합니다. 파는 사람과 사는 사람이 각자 소유한 날수만큼 나눠 고지받으므로, 매매 대금에서 자동차세를 따로 정산할 필요는 없습니다. 1월에 연납했다면 팔거나 폐차한 뒤 남은 기간분이 환급되니 위택스에서 환급 신청 여부를 확인하세요. 계산기의 N년 누적 시뮬레이션은 매년 1월 1일부터 12월 31일까지 보유한다고 가정합니다.',
  },
]

export default function CarTaxPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/car-tax">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />자동차 세금 종합 계산기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>취득세·자동차세·유류세·공채·환경부담금</strong>까지 자동차 관련 모든 세금을 한 화면에. 친환경차·다자녀·장애인 감면 자동 반영 + 5/10년 누적 시뮬.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 자동차세·취득세 감면 기준" sources={[{"label":"위택스","href":"https://www.wetax.go.kr"},{"label":"행정안전부","href":"https://www.mois.go.kr"},{"label":"국가법령정보센터 지방세법","href":"https://www.law.go.kr/법령/지방세법"},{"label":"국가법령정보센터 지방세특례제한법","href":"https://www.law.go.kr/법령/지방세특례제한법"},{"label":"오피넷(한국석유공사)","href":"https://www.opinet.co.kr"}]} />

      <CarTaxClient />

      <GuideDivider />

      {/* 1. 자동차 관련 세금 한눈에 */}
      <h2 className="g-h2">자동차 관련 세금 한눈에</h2>
      <p className="g-p">
        자동차에 붙는 세금은 <strong>구매·보유·운행·양도</strong> 4단계로 나뉩니다. 구매 때는 한 번 내는 취득세와 공채가, 보유하는 동안은 해마다 자동차세가, 운행할 때는 기름값에 섞인 유류세가 나갑니다. 계산기는 이 네 단계를 한 번에 계산해 &lsquo;차를 사서 N년 타면 세금으로 얼마가 나가는지&rsquo;를 보여 줍니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>시점</th>
              <th scope="col" style={headCell}>세금·비용</th>
              <th scope="col" style={headCell}>핵심</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>구매 시</strong></td>
              <td style={cell}>취득세 + 공채 매입(즉시 매도 할인액) + 번호판·등록비</td>
              <td style={cell}>일반 승용 <strong>{pct(ACQUISITION_TAX_RATES.normal)}</strong> · 경차 {pct(ACQUISITION_TAX_RATES.light)}({man(LIGHT_TAX_CAP)} 원까지 면제) · 영업용 {pct(ACQUISITION_TAX_RATES.business)}</td>
            </tr>
            <tr>
              <td style={cell}><strong>매년 보유</strong></td>
              <td style={cell}>자동차세 + 지방교육세({pct(EDU_TAX_RATE)}) + 환경개선부담금(노후 경유차)</td>
              <td style={cell}>cc당 단가 × 차령 경감(최대 50%)</td>
            </tr>
            <tr>
              <td style={cell}><strong>운행 시</strong></td>
              <td style={cell}>유류세(교통·에너지·환경세 + 교육세 + 주행세) + 부가가치세</td>
              <td style={cell}>휘발유 L당 약 <strong>{FUEL_TAX.gasoline.taxPerLiter}원</strong> · 경유 {FUEL_TAX.diesel.taxPerLiter}원 (부가세 별도)</td>
            </tr>
            <tr>
              <td style={cell}><strong>양도 시</strong></td>
              <td style={cell}>개인 차량은 <strong style={{ color: 'var(--success)' }}>양도소득세 없음</strong></td>
              <td style={cell}>사업자·영업용은 사업소득으로 별도 신고</td>
            </tr>
          </tbody>
        </table></div>
      </div>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산기는 이렇게 계산합니다</h2>
      <p className="g-p">
        계산기의 모든 결과는 아래 네 줄의 공식에서 나옵니다. 세율·감면 한도·cc당 단가는 지방세법·지방세특례제한법의 2026년 과세연도 기준값을 씁니다.
      </p>
      <ul className="g-list">
        <li><strong>취득세</strong> = 차량가 × 차종별 세율 − 감면액. 전기차 감면과 다자녀 감면처럼 두 가지 이상에 해당하면 감면액이 큰 하나만 적용합니다(지방세특례제한법 §180 중복 감면 배제).</li>
        <li><strong>공채 실비용</strong> = 차량가 × 지역·배기량별 매입 비율 × 즉시 매도 할인율({pct(BOND_DISCOUNT_RATE)} 가정).</li>
        <li><strong>자동차세</strong> = 배기량 × cc당 단가 × (1 − 차령 경감률) × (1 − 연납 공제율), 여기에 지방교육세 {pct(EDU_TAX_RATE)}를 더합니다. 차령은 등록한 해를 1년으로 세며, 누적 시뮬레이션에서는 해마다 차령이 1씩 늘어 경감률이 자동으로 커집니다.</li>
        <li><strong>유류세</strong> = 월 주행거리 × 12 ÷ 연비 × L당 세액. 주행거리와 연비는 매년 같다고 가정합니다.</li>
      </ul>
      <p className="g-p">
        기본값(차량가 {man(DEF.carPrice)} 원, 1,999cc 휘발유, 서울 신차, 월 {DEF.monthlyKm.toLocaleString('ko-KR')}km, 연비 {DEF.efficiencyKmL}km/L, 1월 연납)으로 계산하면 구매 시 취득세 {won(D.acquisitionTax)}, 공채 실비 {won(D.bondCost)}, 등록비 {won(REGISTRATION_FEE)}을 합해 <strong>{won(D.initialTotal)}</strong>이 듭니다. 첫해 보유·운행 세금은 자동차세 {won(D_Y1.carTax)}, 지방교육세 {won(D_Y1.eduTax)}, 유류세 {won(D_Y1.fuelTax)}을 합한 <strong>{won(D_Y1.total)}</strong>이고, 5년째에는 차령 경감으로 자동차세가 {won(D_Y5.carTax)}까지 줄어 5년간 보유·운행 세금은 {won(D.totalForPeriod - D.initialTotal)}, 구매 시 비용까지 더한 5년 누적은 <strong>{won(D.totalForPeriod)}</strong>입니다. 이 중 유류세가 가장 큰 몫을 차지하므로, 주행거리가 많은 사람일수록 차종 선택이 세금 총액을 크게 좌우합니다.
      </p>

      {/* 3. 취득세 */}
      <h2 className="g-h2">취득세 — 차종별 세율과 감면</h2>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>차종</th>
              <th scope="col" style={headCell}>취득세율</th>
              <th scope="col" style={headCell}>비고</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>일반 승용차</strong></td><td style={cell}>{pct(ACQUISITION_TAX_RATES.normal)}</td><td style={cell}>비영업용 승용차의 기본 세율</td></tr>
            <tr><td style={cell}>경차 (1,000cc 미만)</td><td style={cell}><strong style={{ color: 'var(--success)' }}>{pct(ACQUISITION_TAX_RATES.light)}</strong> ({man(LIGHT_TAX_CAP)} 원까지 면제)</td><td style={cell}>비영업용 승용 경차 면제는 2027년 말까지 · 공채 매입도 면제</td></tr>
            <tr><td style={cell}>영업용 (택시·버스·화물)</td><td style={cell}><strong style={{ color: 'var(--success)' }}>{pct(ACQUISITION_TAX_RATES.business)}</strong></td><td style={cell}>사업자 등록 필수</td></tr>
            <tr><td style={cell}>전기·수소차</td><td style={cell}>{pct(ACQUISITION_TAX_RATES.ev)} (단, {man(EV_TAX_CAP)} 원 한도 감면)</td><td style={cell}>실제 납부액 = max(0, 차량가 × 7% − {man(EV_TAX_CAP)} 원)</td></tr>
            <tr><td style={cell}>하이브리드</td><td style={cell}>{pct(ACQUISITION_TAX_RATES.hybrid)}</td><td style={cell}>감면 2024년 종료</td></tr>
          </tbody>
        </table></div>
      </div>
      <Callout tone="tip" title="차량가 5,000만 원이면">
        일반 승용차 취득세는 {won(acqNormal(50_000_000))}입니다. 같은 가격의 전기차라면 {man(EV_TAX_CAP)} 원이 감면돼 {won(Math.max(0, acqNormal(50_000_000) - EV_TAX_CAP))}을 냅니다. 전기차 감면 한도는 차량가 {man(EV_TAX_CAP / ACQUISITION_TAX_RATES.ev)} 원(= {man(EV_TAX_CAP)} 원 ÷ 7%)에서 다 차므로, 그보다 싼 전기차는 취득세가 0원입니다.
      </Callout>

      {/* 4. 자동차세 */}
      <h2 className="g-h2">자동차세 — cc당 단가와 차령 경감</h2>
      <p className="g-p">
        자동차세 본세는 배기량에 cc당 단가를 곱한 값이고, 여기에 지방교육세 {pct(EDU_TAX_RATE)}가 붙습니다. 차령(등록한 해를 1년으로 셈) 3년부터 해마다 5%씩, 최대 50%(차령 12년 이상)까지 줄어듭니다. 예를 들어 2024년에 등록한 차는 2026년에 차령 3년이라 5%가 줄어듭니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>배기량 (비영업용 승용)</th>
              <th scope="col" style={headCell}>cc당 단가</th>
              <th scope="col" style={headCell}>본세 예시</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>1,000cc 이하</strong></td><td style={cell}>{CAR_TAX_PER_CC_NON_BUSINESS[0].perCc}원</td><td style={cell}>998cc → {won(annualTaxByCC(998, false))}/년</td></tr>
            <tr><td style={cell}><strong>1,600cc 이하</strong></td><td style={cell}>{CAR_TAX_PER_CC_NON_BUSINESS[1].perCc}원</td><td style={cell}>1,598cc → {won(annualTaxByCC(1598, false))}/년</td></tr>
            <tr><td style={cell}><strong>1,600cc 초과</strong></td><td style={cell}>{CAR_TAX_PER_CC_NON_BUSINESS[2].perCc}원</td><td style={cell}>1,999cc → {won(annualTaxByCC(1999, false))}/년</td></tr>
            <tr><td style={cell}>전기·수소차</td><td style={cell}>—</td><td style={cell}>정액 {won(EV_ANNUAL_TAX)} (+교육세 = {won(EV_ANNUAL_TAX * (1 + EDU_TAX_RATE))}/년)</td></tr>
          </tbody>
        </table></div>
      </div>
      <p className="g-p">
        아래 조견표는 지방교육세까지 더한 <strong>1년 치 자동차세</strong>입니다(연납 공제 전). 같은 차라도 1,600cc 경계를 넘는 순간 cc당 단가가 140원에서 200원으로 뛰어, 1,598cc와 1,999cc의 세금 차이가 배기량 차이보다 훨씬 큽니다. 오래 탈수록 세금이 줄어드는 폭도 눈여겨보세요.
      </p>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>배기량</th>
              {AGES.map(a => <th scope="col" key={a} style={headNum}>차령 {a}년{a >= 12 ? '+' : ''}</th>)}
            </tr>
          </thead>
          <tbody>
            {CC_ROWS.map(r => (
              <tr key={r.cc}>
                <th scope="row" style={{ ...cell, fontWeight: 600, textAlign: 'left' }}>{r.label}</th>
                {r.byAge.map((v, i) => <td key={i} style={num}>{won(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <p className="g-note">
        ※ 차령 경감률: 1~2년 0% · 3년 5% · 5년 15% · 8년 30% · 12년 이상 50%. 1월 연납 시 위 금액에서 약 {pct(ANNUAL_PREPAY_DISCOUNT, 2)}가 더 줄어듭니다.
      </p>

      {/* 5. 공채 */}
      <h2 className="g-h2">공채 매입 — 잊기 쉬운 숨은 비용</h2>
      <p className="g-p">
        차를 등록할 때는 시·도가 발행하는 <strong>도시철도채권 또는 지역개발채권</strong>을 의무적으로 사야 합니다. 만기까지 보유하면 원금과 이자를 돌려받지만, 대부분은 등록 현장에서 바로 되팔고 그 할인액만 비용으로 떠안습니다. 매입 비율은 조례로 정해져 지역과 배기량마다 다릅니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>지역</th>
              <th scope="col" style={headCell}>매입 비율 (도구 적용값)</th>
              <th scope="col" style={headNum}>{man(BOND_PRICE)} 원 차 즉시 매도 실비</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>서울</strong></td>
              <td style={cell}>1,600cc 미만 9% · 2,000cc 미만 12% · 2,000cc 이상 20%</td>
              <td style={num}>1,999cc {won(bondReal(0.12))} · 2,000cc 이상 {won(bondReal(0.20))}</td>
            </tr>
            {BOND_GROUPS.map(([rate, names]) => (
              <tr key={rate}>
                <td style={cell}>{names.join('·')}</td>
                <td style={cell}>{pct(rate)} (대표값)</td>
                <td style={num}>{won(bondReal(rate))}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <p className="g-note">
        ※ 경차(1,000cc 미만)는 공채 매입이 면제됩니다. 서울 1,000~1,600cc 소형차는 2023~2025년 한시 면제가 있었으며 2026년 연장 여부는 서울시에 확인하세요.
        서울 외 지역도 조례에 따라 배기량별로 비율이 다른데, 본 도구는 지역 대표값으로 약식 계산합니다.
        전기·수소·하이브리드 같은 친환경차는 지역에 따라 채권 매입 감면이 있을 수 있는데, 본 도구에는 반영하지 않았습니다.
      </p>

      {/* 6. 유류세 */}
      <h2 className="g-h2">유류세 — 주유할 때마다 내는 간접세</h2>
      <p className="g-p">
        주유소 가격에 이미 들어 있어 의식하기 어렵지만, 휘발유·경유에는 L당 정액인 교통·에너지·환경세와 그에 비례하는 교육세(15%)·주행세(26%)가 붙고, 판매 가격 전체에 부가가치세 10%가 한 번 더 붙습니다. 정액 세금은 정부가 한시적으로 인하하기도 해서, 아래 L당 세액은 인하가 없을 때의 기준값입니다. {FUEL_PRICE_AS_OF} 전국 평균가(오피넷)로 계산하면, 한시 인하가 없다고 가정할 때 휘발유 가격의 약 <strong>{pct(taxShare(FUEL_ROWS[0].tax, GASOLINE_PRICE))}</strong>, 경유 가격의 약 <strong>{pct(taxShare(FUEL_ROWS[1].tax, DIESEL_PRICE))}</strong>가 세금입니다(인하가 시행 중이면 그만큼 낮아집니다).
      </p>
      <div style={tableBox}>
        <div className="tableScroll"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>연료</th>
              <th scope="col" style={headNum}>L당 유류세 (부가세 별도)</th>
              <th scope="col" style={headCell}>월 1,500km 주행 시 연간 유류세</th>
            </tr>
          </thead>
          <tbody>
            {FUEL_ROWS.map(f => (
              <tr key={f.name}>
                <td style={cell}>{f.name}</td>
                <td style={num}>약 {f.tax.toLocaleString('ko-KR')}원</td>
                <td style={cell}>{KM_YEAR.toLocaleString('ko-KR')}km ÷ {f.eff}km/L × {f.tax}원 = 약 {man(KM_YEAR / f.eff * f.tax)} 원</td>
              </tr>
            ))}
            <tr><td style={cell}>전기</td><td style={num}><strong style={{ color: 'var(--success)' }}>0원</strong></td><td style={cell}>유류세 없음 (충전 요금에는 부가세 등 별도)</td></tr>
          </tbody>
        </table></div>
      </div>
      <p className="g-note">
        ※ LPG는 2019년부터 일반인도 승용차를 살 수 있게 되었고, L당 세금이 휘발유의 3분의 1 수준입니다. 하이브리드는 휘발유 세액으로 계산하되 연비가 높아 유류세가 그만큼 줄어듭니다.
      </p>

      {/* 7. 감면 제도 */}
      <h2 className="g-h2">감면 제도 정리</h2>
      <p className="g-p">
        감면은 차종에 따른 것(전기·경차)과 사람에 따른 것(다자녀·장애인·상이 국가유공자)으로 나뉩니다. 계산기에서 &lsquo;감면 자격&rsquo;을 고르면 차종 감면과 비교해 더 큰 쪽이 자동으로 적용됩니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { name: '전기·수소차', desc: `취득세 ${man(EV_TAX_CAP)} 원 한도 감면 + 자동차세 정액 ${man(EV_ANNUAL_TAX * (1 + EDU_TAX_RATE))} 원(교육세 포함) + 유류세 없음` },
          { name: '다자녀 가구', desc: `18세 미만 자녀 3명 이상은 1대 취득세 면제(6인승 이하 ${man(MULTI_CHILD_TAX_CAP)} 원 한도), 2명은 50% 경감(${man(TWO_CHILD_TAX_CAP)} 원 한도) — 2027년까지` },
          { name: '장애인', desc: '장애 정도가 심한 장애인 등 본인(또는 같은 세대 가족 공동) 명의 1대 → 취득세·자동차세 면제 (승용은 배기량 2,000cc 이하 등 요건)' },
          { name: '상이 국가유공자', desc: '상이등급 판정을 받은 국가유공자 등 요건을 갖춘 본인 명의 1대 → 취득세·자동차세 면제. 모든 국가유공자가 대상은 아니므로 보훈부 등록 내용 확인' },
          { name: '경차 (1,000cc 미만)', desc: `취득세 ${man(LIGHT_TAX_CAP)} 원까지 면제(2027년까지)·공채 면제 + 자동차세 cc당 80원 + 경차 유류세 환급 연 30만 원 한도` },
          { name: '차령 12년 이상', desc: '자동차세 최대 50% 경감 — 오래 탈수록 매년 5%씩 줄어듦' },
        ].map((b) => (
          <div key={b.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{b.name}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
          </div>
        ))}
      </div>
      <Callout tone="warn" title="감면은 겹쳐 받을 수 없습니다">
        전기차를 사는 다자녀 가구처럼 감면 사유가 둘 이상이면 감면액이 가장 큰 하나만 적용됩니다(지방세특례제한법 §180). 장애인·유공자 감면은 명의·동일 세대·용도 요건을 어기면 감면세액이 추징되니, 등록 전에 관할 시·군·구 세무부서에 요건을 확인하세요.
      </Callout>

      {/* 8. 양도 */}
      <h2 className="g-h2">자동차 양도 — 양도소득세는 없습니다</h2>
      <div style={{ ...card, marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
          자동차는 소득세법 §94가 정한 양도소득세 과세대상(부동산·주식 등)에 들어가지 않아, 개인이 쓰던 차를 팔 때는 <strong style={{ color: 'var(--success)' }}>양도소득세가 없습니다</strong>.
          중고차를 산 값보다 비싸게 팔아도 따로 신고·납부할 세금이 없습니다.
        </p>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.9 }}>
          <li>연중 양도 시 자동차세는 소유 기간만큼 일할 계산(연납분은 환급)</li>
          <li>이전등록 취득세·공채는 매수인 부담</li>
          <li><strong>사업자·영업용 차량</strong>은 사업소득으로 신고 (부가세 환급분 회수 포함)</li>
          <li><strong>폐차</strong> 시 폐차보상금 가능 — 노후 경유차는 조기폐차 지원금 별도</li>
          <li><strong>증여·상속</strong>은 증여세·상속세 별도 (시가 기준)</li>
        </ul>
      </div>

      {/* 9. 주의할 점 */}
      <h2 className="g-h2">결과를 볼 때 자주 하는 실수</h2>
      <ul className="g-list">
        <li><strong>부가세 포함 가격 입력</strong> — 신차 취득세는 부가세를 뺀 가격이 기준입니다. 포함가를 넣으면 취득세가 10% 부풀려집니다.</li>
        <li><strong>경과 년수와 차령 혼동</strong> — 입력하는 값은 &lsquo;등록 후 지난 햇수&rsquo;이고, 계산기가 여기에 1을 더해 차령으로 바꿉니다. 올해 등록한 신차는 0을 넣으세요.</li>
        <li><strong>공채 실비를 매입액으로 착각</strong> — 결과의 공채 금액은 즉시 매도했을 때 떠안는 할인액입니다. 등록 현장에서 잠깐 필요한 매입 대금은 이보다 훨씬 큽니다.</li>
        <li><strong>유류세를 연료비로 착각</strong> — 유류세는 기름값 중 세금 부분만입니다. 실제 주유비 전체는 자동차 유지비 계산기에서 보세요.</li>
        <li><strong>감면 요건 과신</strong> — 다자녀 감면은 자녀 나이·차량 인승, 장애인 감면은 장애 정도·배기량·명의 요건이 있습니다. 계산기는 요건을 충족했다고 가정합니다.</li>
      </ul>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '위택스 자동차세 안내', href: 'https://www.wetax.go.kr/' },
          { label: '행정안전부 지방세', href: 'https://www.mois.go.kr/' },
          { label: '국가법령정보센터 지방세법', href: 'https://www.law.go.kr/법령/지방세법' },
        ]}
      >
        본 계산기의 자동차세·연납 할인·감면 결과는 표준 세율 기준의 참고용 추정치입니다. 차종 분류·연식 경감·감면 요건은 지자체와 개별 차량 조건에 따라 달라질 수 있으므로, 실제 고지·납부 금액은 위택스 또는 관할 지자체 세무부서에서 확인하세요.
      </Disclaimer>

      {/* 관련 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/car-cost" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🚗</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>자동차 유지비 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>유류·보험·감가 포함 연간 진짜 비용</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자동차 할부·금리 비교</div>
        </Link>
        <Link href="/tools/finance/installment" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카드 할부 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일시불 vs 무이자 비교</div>
        </Link>
        <Link href="/tools/finance/freelance-tax" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💼</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>프리랜서 종소세</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>사업용 차량 경비 처리</div>
        </Link>
        <Link href="/tools/unit/fuel-economy" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⛽</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연비 변환기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>km/L·mpg·전기차 전비</div>
        </Link>
        <Link href="/tools/unit/tire-pressure" style={{ ...card, display: 'block', textDecoration: 'none' }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛞</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>타이어 공기압</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>psi·kPa·bar 변환</div>
        </Link>
      </div>
    </ToolPage>
  )
}
