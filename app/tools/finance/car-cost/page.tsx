import Link from 'next/link'
import CarCostClient from './CarCostClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GASOLINE_PRICE, FUEL_PRICE_AS_OF } from '@/lib/krFuelPrices'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import {
  autoTaxYearlyForCC,
  calcMaintenance,
  calcMonthlyConsumable,
  compareCarSpecs,
  compareFuelTypes,
  compareOwnVsShare,
  comparePurchaseModes,
  CAR_CATEGORIES,
  CARSHARING_RATES,
  DEFAULT_CONSUMABLES,
  EV_AUTO_TAX,
  FUEL_DATA_2026,
} from './carCostUtils'
import { ANNUAL_PREPAY_DISCOUNT, annualTaxAgeDiscount } from '@/lib/krVehicleTax'
import ToolPage from '@/components/ToolPage'

const taxWon = (cc: number) => `${autoTaxYearlyForCC(cc).toLocaleString('ko-KR')}원`
const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/** 만 원 단위 반올림 표기 (예: 1,229만) */
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString('ko-KR')}만`
const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`

/* ── 가이드 수치 — 전부 도구와 같은 함수·기본값으로 빌드 시 계산 (정적 수치 드리프트 방지) ── */
const KM = 1500                     // 기본 월 주행거리
const CAR_PRICE = 30_000_000         // 가솔린 기준 차량가 (연료 비교·구매 방식 탭 기본값)
const MID = CAR_CATEGORIES.find(c => c.id === 'midsize-kr') ?? CAR_CATEGORIES[1]
const DEPR_MONTHLY = CAR_PRICE * MID.depreciationRate / 12   // 정률 감가 첫해 월 환산 (유지비 탭 '감가율' 방식)

/* 유지비 탭 기본값 (간편 모드) */
const BASE = calcMaintenance({
  fuelType: 'gas', monthlyKm: KM, efficiency: 12, fuelPrice: GASOLINE_PRICE,
  insuranceYearly: 800_000, carTaxYearly: 200_000, parkingMonthly: 0,
  loanMonthly: 0, loanRemainingMonths: 0,
  variableCostMonthly: 50_000, washMonthly: 20_000,
  depreciationOn: false, depreciationMonthly: 0,
})
const BASE_WITH_DEPR = BASE.monthlyExclDepr + DEPR_MONTHLY

/* 보유 기간별 감가 (국산 중형 연 10% 정률) */
const HOLD_ROWS = [3, 5, 10].map(y => {
  const total = CAR_PRICE * (1 - Math.pow(1 - MID.depreciationRate, y))
  return { y, total, perYear: total / y, left: CAR_PRICE - total }
})
const HOLD5 = HOLD_ROWS[1], HOLD10 = HOLD_ROWS[2]

/* 구매 방식 탭 기본값 */
const PURCHASE = comparePurchaseModes({
  carPrice: CAR_PRICE, carCategory: 'midsize-kr', yearsOfHold: 5,
  variableCostMonthly: 50_000, insuranceYearly: 800_000, carTaxYearly: 200_000, parkingMonthly: 0,
  fuelMonthly: BASE.fuelMonthly, loanRate: 5, loanMonths: 60, loanDownPayment: 5_000_000,
}).results
const LOAN_INTEREST = (() => {
  const r = 0.05 / 12, n = 60, P = CAR_PRICE - 5_000_000
  const pay = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  return pay * n - P
})()

/* 연료 타입 탭 기본값 (5년·10년) */
const FUEL_CARS = [
  { fuelId: 'gasoline', carPrice: CAR_PRICE, depRate: 10 },
  { fuelId: 'diesel', carPrice: CAR_PRICE + 2_000_000, depRate: 10 },
  { fuelId: 'lpg', carPrice: CAR_PRICE - 2_000_000, depRate: 10 },
  { fuelId: 'hybrid', carPrice: CAR_PRICE + 5_000_000, depRate: 11 },
  { fuelId: 'electric', carPrice: 45_000_000, depRate: 18 },
  { fuelId: 'electricFast', carPrice: 45_000_000, depRate: 18 },
]
const FUEL5 = compareFuelTypes(FUEL_CARS, KM, 5)
const FUEL10 = compareFuelTypes(FUEL_CARS, KM, 10)
const FUEL5_BEST = FUEL5.reduce((a, b) => (b.totalCost < a.totalCost ? b : a))
const fuelRow = (rows: typeof FUEL5, id: string) => rows.find(r => r.fuel.id === id) ?? rows[0]
/* 유가(월 갱신)에 따라 순위가 바뀔 수 있어 결론 문장은 계산 결과로 분기 */
const GAS5 = fuelRow(FUEL5, 'gasoline'), EV5 = fuelRow(FUEL5, 'electric')
const GAS10 = fuelRow(FUEL10, 'gasoline'), EV10 = fuelRow(FUEL10, 'electric')
const EV_WINS_5 = EV5.totalCost < GAS5.totalCost
const EV_WINS_10 = EV10.totalCost < GAS10.totalCost
/** 10년 기준 가솔린 = 전기(가정 충전)가 되는 휘발유 가격 — 가솔린 10년 총비용 = 감가 + 주행 L × 가격 */
const GAS_BE_PRICE_10 = Math.round((EV10.totalCost - GAS10.totalDep) / (GAS10.totalFuelCost / GAS10.fuel.pricePerUnit) / 10) * 10
const LPG_PRICE = FUEL_DATA_2026.find(f => f.id === 'lpg')?.pricePerUnit ?? 0

/* 차종 비교 탭 기본 3대 */
const CAR_SPECS = compareCarSpecs([
  { name: '쏘나타급 가솔린', carPrice: 32_000_000, fuelTypeId: 'gasoline', efficiency: 12, insuranceYearly: 1_000_000, carTaxYearly: 520_000, variableCostMonthly: 50_000, parkingMonthly: 0, depreciationRate: 10 },
  { name: '아반떼급 가솔린', carPrice: 23_000_000, fuelTypeId: 'gasoline', efficiency: 14, insuranceYearly: 800_000, carTaxYearly: 300_000, variableCostMonthly: 50_000, parkingMonthly: 0, depreciationRate: 10 },
  { name: '아이오닉5급 전기', carPrice: 48_000_000, fuelTypeId: 'electric', efficiency: 5, insuranceYearly: 1_100_000, carTaxYearly: 130_000, variableCostMonthly: 30_000, parkingMonthly: 0, depreciationRate: 18 },
], KM)

/* 소모품 월 환산 (상세 모드 기본값) */
const CONSUMABLE_ROWS = DEFAULT_CONSUMABLES.filter(c => c.key !== 'wash').map(c => ({
  ...c,
  m1500: calcMonthlyConsumable({ ...c, enabled: true }, KM),
  m800: calcMonthlyConsumable({ ...c, enabled: true }, 800),
}))
const CONSUMABLE_SUM = CONSUMABLE_ROWS.reduce((s, c) => s + c.m1500, 0)

/* 보유 vs 카쉐어링 — 감가 제외(도구 표) / 감가 포함(같은 차 3,000만·연 10% 첫해 기준) */
const FUEL_PER_KM = BASE.fuelMonthly / KM
const SHARE_EXCL = compareOwnVsShare(BASE.monthlyExclDepr - BASE.fuelMonthly, FUEL_PER_KM)
const SHARE_INCL = compareOwnVsShare(BASE.monthlyExclDepr - BASE.fuelMonthly + DEPR_MONTHLY, FUEL_PER_KM)
const SHARE_PER_KM = CARSHARING_RATES.hourlyRate * CARSHARING_RATES.avgHoursPer100km / 100 + CARSHARING_RATES.perKmRate
/** 보유 비용 = 고정 + 연료/km × km, 카쉐어링 = 단가/km × km → 같아지는 주행거리 */
const breakEvenKm = (fixed: number) => Math.round(fixed / (SHARE_PER_KM - FUEL_PER_KM) / 10) * 10
const BE_EXCL = breakEvenKm(BASE.monthlyExclDepr - BASE.fuelMonthly)
const BE_INCL = breakEvenKm(BASE.monthlyExclDepr - BASE.fuelMonthly + DEPR_MONTHLY)

const PREPAY_2000 = Math.round(autoTaxYearlyForCC(2000) * ANNUAL_PREPAY_DISCOUNT)
/* 유지비 탭에서 감가(감가율 방식)를 켰을 때의 기본값: 현재 시세 2,500만 원 × 연 10% */
const TOOL_DEFAULT_CUR_PRICE = 25_000_000
const TOOL_DEFAULT_DEPR = TOOL_DEFAULT_CUR_PRICE * 0.10 / 12

export const metadata = buildMetadata({
  path: '/tools/finance/car-cost',
  title: '자동차 유지비 계산기 — 5년·10년 비용·구매 방식 비교·전기차 vs 가솔린',
  description: '유류비·보험료·자동차세·소모품·감가상각까지 합한 연간 유지비 총액 계산. 차종 비교, 전기차 vs 가솔린 연료비, 카쉐어링 손익분기점까지 자동 산출.',
  keywords: [
    '자동차 유지비 계산기', '자동차 1km당 비용', '전기차 vs 가솔린', '자동차 할부 vs 리스',
    '장기렌트 비교', '차 살 때 비용', '카쉐어링 vs 보유', '자동차 감가상각',
    '한국 자동차 보험료', '아이오닉5 유지비', '5년 자동차 유지비',
    '자동차세 계산', '쏘나타 유지비', '아반떼 유지비', '쏘카 vs 자가용',
  ],
})

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
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const tableBox: React.CSSProperties = { ...card, padding: 0, overflow: 'hidden' }
const h3: React.CSSProperties = { fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }

const FAQ_LD = [
          {
            q: '자동차 유지비에서 가장 큰 항목은 무엇인가요?',
            a: `감가상각을 넣느냐에 따라 달라집니다. 도구 기본값(월 ${KM.toLocaleString('ko-KR')}km·연비 12km/L·보험 80만 원)에서 감가를 빼면 유류비가 월 유지비의 약 ${pct(BASE.fuelMonthly, BASE.monthlyExclDepr)}로 가장 큽니다. 같은 조건에 3,000만 원 차의 첫해 감가(연 10%, 월 ${man(DEPR_MONTHLY)} 원)를 더하면 감가 ${pct(DEPR_MONTHLY, BASE_WITH_DEPR)}·유류비 ${pct(BASE.fuelMonthly, BASE_WITH_DEPR)}로 ${DEPR_MONTHLY > BASE.fuelMonthly ? '감가가 1위가 됩니다' : '유류비가 여전히 가장 크고 감가가 그다음입니다'}. 「유지비 계산」 탭의 비용 항목 분석에서 본인 비중을 확인하세요.`,
          },
          {
            q: '1km당 유지비는 어떻게 계산하나요?',
            a: `월 유지비 ÷ 월 주행거리입니다. 예) 월 50만 원, 월 1,500km → 1km당 약 333원. 유류비만 따지면 연비 12km/L·휘발유 ${GASOLINE_PRICE.toLocaleString('ko-KR')}원(${FUEL_PRICE_AS_OF}, 오피넷) 기준 약 ${Math.round(GASOLINE_PRICE / 12)}원/km입니다. 보험·세금 같은 고정비는 주행거리와 무관하게 나가므로, 적게 탈수록 1km당 비용이 가파르게 올라갑니다.`,
          },
          {
            q: '감가상각은 실제 나가는 돈인가요?',
            a: `매달 통장에서 빠지는 돈은 아니지만, 차를 팔 때 구매가보다 덜 받는 만큼이 확정 손실입니다. 도구는 정률(매년 남은 가치의 일정 %) 방식이라 초기 감가액이 크고 갈수록 줄어듭니다. 3,000만 원 국산 중형(연 10%)이면 5년 감가는 약 ${man(HOLD5.total)} 원(연평균 ${man(HOLD5.perYear)} 원), 10년이면 약 ${man(HOLD10.total)} 원(연평균 ${man(HOLD10.perYear)} 원)입니다.`,
          },
          {
            q: '소모품 교체 주기는 어떻게 알 수 있나요?',
            a: '차량 구매 시 받은 사용 설명서나 제조사 공식 홈페이지에서 확인하세요. 본 계산기의 기본값(엔진오일 1만km/12개월, 타이어 4만km, 배터리 36개월 등)은 일반적인 평균치이며 실제와 다를 수 있습니다. 정기 점검 시 정비사에게 현재 상태 확인 권장. 참고로 저는 신차 무상쿠폰이 있어 엔진오일을 5~6천km 또는 6개월 중 먼저 오는 쪽에 갈고 있습니다 — 매뉴얼(1만km)보다 자주인 셈인데, 시내·짧은 거리 위주로 타면 오일이 더 빨리 더러워지므로 주행 패턴에 맞춰 조절하면 됩니다.',
          },
          {
            q: '대중교통과 비교했을 때 차가 더 비싼가요?',
            a: `순수 비용만 보면 대부분 대중교통이 쌉니다. 도구 기본값의 월 유지비는 감가를 빼고도 약 ${man(BASE.monthlyExclDepr)} 원, 감가를 넣으면 약 ${man(BASE_WITH_DEPR)} 원입니다. 도구의 「유지비 계산」 탭에 월 대중교통비를 넣으면 차이를 바로 보여 줍니다. 다만 출퇴근 시간 절약, 짐·아이 동반, 대중교통이 불편한 지역 등 돈으로 환산하기 어려운 가치도 함께 따져야 합니다.`,
          },
          {
            q: '자동차 5년 보유와 10년 보유 어느 게 더 경제적인가요?',
            a: `감가만 보면 오래 탈수록 유리합니다. 3,000만 원·연 10% 정률 감가라면 연평균 감가가 5년 보유 ${man(HOLD5.perYear)} 원 → 10년 보유 ${man(HOLD10.perYear)} 원으로 줄고, 10년 감가의 약 ${pct(HOLD5.total, HOLD10.total)}가 처음 5년에 몰려 있습니다. 다만 6년차 이후에는 타이어·배터리·브레이크 외에 소모품이 아닌 부품 수리비가 늘 수 있고, 안전 사양 노후화도 고려해야 합니다. 자동차세는 차령 3년차부터 매년 5%씩(최대 50%) 줄어 장기 보유에 유리합니다.`,
          },
          {
            q: '현금 구매 vs 할부 어느 게 유리한가요?',
            a: `할부 금리가 그 돈을 굴려 얻을 수 있는 수익률보다 높으면 현금이 유리합니다. 도구 기본값(3,000만 원, 선수금 500만 원, 연 5%·60개월)이면 할부 이자는 약 ${man(LOAN_INTEREST)} 원입니다. 캐피탈·카드사 할부 금리는 신용도·프로모션에 따라 차이가 크니 여신금융협회 공시와 딜러 견적을 비교하고, 「구매 방식 비교」 탭에 실제 금리를 넣어 확인하세요.`,
          },
          {
            q: '리스·장기렌트는 일반인에게도 유리한가요?',
            a: '대부분 일반인에게는 비용 부담이 큽니다. 5년 이상 탈 생각이라면 보통 불리합니다. 유리한 경우: ① 사업자(비용 처리), ② 2~3년 단기 사용, ③ 신차로 자주 교체, ④ 보험 경력이 짧아 개인 보험료가 매우 비싼 경우(렌트는 보험 포함), ⑤ 관리 편의 우선. 광고 월 납입액에는 잔존가치·선납금·주행거리 약정·중도 해지 위약금이 빠져 있는 경우가 많으니 계약서의 총 납입액으로 비교하세요.',
          },
          {
            q: '전기차가 정말 유지비 더 싼가요?',
            a: `연료비만 보면 확실히 쌉니다 — 도구 기본값(월 ${KM.toLocaleString('ko-KR')}km)에서 5년 연료비가 가솔린 ${man(fuelRow(FUEL5, 'gasoline').totalFuelCost)} 원, 전기 가정 충전 ${man(fuelRow(FUEL5, 'electric').totalFuelCost)} 원입니다. 다만 전기차는 차값(4,500만 원 가정)과 감가율(연 18% 가정)이 높아, 5년 총비용(연료+감가)은 가솔린 ${man(GAS5.totalCost)} 원, 전기 ${man(EV5.totalCost)} 원으로 ${EV_WINS_5 ? '그래도 전기가 쌉니다' : '가솔린이 낫습니다'}. 10년으로 늘리면 가솔린 ${man(GAS10.totalCost)} 원, 전기 ${man(EV10.totalCost)} 원으로 ${EV_WINS_10 ? (EV_WINS_5 ? '격차가 더 벌어집니다' : '순서가 바뀝니다') : '여전히 가솔린이 낫습니다'}. 이 순위는 휘발유 가격에 민감해, 10년 기준으로는 휘발유가 L당 약 ${GAS_BE_PRICE_10.toLocaleString('ko-KR')}원일 때 두 차의 총비용이 같아집니다(현재 ${GASOLINE_PRICE.toLocaleString('ko-KR')}원, ${FUEL_PRICE_AS_OF}). 보조금으로 실구매가가 낮아지거나 주행거리가 길수록 전기차가 유리해지며, 배터리 보증 기간·거리는 계약 전에 확인하세요.`,
          },
          {
            q: '카쉐어링과 차 보유 어느 게 더 싼가요?',
            a: `월 주행거리와 감가를 넣느냐에 따라 갈립니다. 도구 가정(카쉐어링 시간당 ${CARSHARING_RATES.hourlyRate.toLocaleString('ko-KR')}원 + km당 ${CARSHARING_RATES.perKmRate}원, 100km당 ${CARSHARING_RATES.avgHoursPer100km}시간 이용)에서 손익분기는 감가 제외 시 월 약 ${BE_EXCL.toLocaleString('ko-KR')}km, 3,000만 원 차의 첫해 감가를 넣으면 월 약 ${BE_INCL.toLocaleString('ko-KR')}km입니다. 그보다 적게 타면 카쉐어링, 많이 타면 보유가 쌉니다. 실제 요금은 차종·시간대·회원 요금제에 따라 크게 다르니 본인 이용 패턴으로 「보유 vs 카쉐어링」 탭을 확인하세요.`,
          },
          {
            q: '자동차세 연납은 얼마나 아껴지나요?',
            a: `1월에 1년 치를 한 번에 내면 공제율 5%에서 남은 기간을 반영해 실질 약 ${(ANNUAL_PREPAY_DISCOUNT * 100).toFixed(2)}%가 줄어듭니다. 2,000cc 승용차(지방교육세 포함 연 ${taxWon(2000)})라면 약 ${won(PREPAY_2000)} 절약입니다. 3·6·9월에도 연납할 수 있지만 남은 기간이 짧아 공제액이 줄고, 전기차(연 ${won(EV_AUTO_TAX)})도 같은 방식으로 공제됩니다. 신청은 위택스나 관할 구청에서 합니다.`,
          },
        ]

export default function CarCostPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/car-cost">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />자동차 유지비 계산기
      </h1>
      <p className="tp-lead">
        유류·보험·세금·소모품·감가까지 합한 <strong style={{ color: 'var(--text)' }}>연간 진짜 비용</strong>. 차종·전기차 손익분기 비교.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 자동차세(배기량별 cc당 80/140/200원 + 지방교육세 30%, 전기차 13만원 정액)·유류세 반영 연료비 시세 기준" sources={[{"label":"위택스(자동차세)","href":"https://www.wetax.go.kr"},{"label":"오피넷 유가정보(한국석유공사)","href":"https://www.opinet.co.kr"},{"label":"국가법령정보센터 지방세법","href":"https://www.law.go.kr/법령/지방세법"},{"label":"보험다모아(자동차보험 비교)","href":"https://www.e-insmarket.or.kr"},{"label":"여신금융협회 공시","href":"https://www.crefia.or.kr"}]} />

      <CarCostClient />

      <GuideDivider />

      {/* 1. 유지비 항목 */}
      <h2 className="g-h2">자동차 유지비, 무엇을 더해야 하나</h2>
      <p className="g-p">
        차 한 대의 비용은 <strong>매달 같은 고정비</strong>, <strong>타는 만큼 느는 변동비</strong>, 그리고 <strong>팔 때 확정되는 감가</strong>로 나뉩니다. 할부금은 차값을 나눠 내는 것이라 감가와 겹치므로, 계산기는 할부금을 &lsquo;남은 개월 수만큼만&rsquo; 기간 총비용에 넣고 감가는 따로 켜고 끌 수 있게 했습니다.
      </p>

      <div style={card}>
        <h3 style={h3}>고정비 (매달 동일)</h3>
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>자동차 보험</strong> — 연령·경력·차종·특약에 따라 연 수십만~수백만 원까지 차이. 도구 기본값은 연 80만 원</li>
          <li><strong>자동차세</strong> — 배기량 기준 1,000cc {taxWon(1000)}, 2,000cc {taxWon(2000)}, 3,500cc {taxWon(3500)} (지방교육세 30% 포함) · 전기차 {won(EV_AUTO_TAX)} 정액</li>
          <li><strong>할부금</strong> — 남은 기간만 가산 (할부 종료 후 0)</li>
          <li><strong>월 주차비</strong> — 거주지·직장 주차 여건에 따라 0원부터 수십만 원</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={h3}>변동비 (주행거리에 비례)</h3>
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>유류비</strong> — 월 주행거리 ÷ 연비 × 유가 (전기차는 ÷ 전비 × kWh당 요금)</li>
          <li><strong>고속도로 통행료</strong> — 출퇴근 경로에 유료도로가 있으면 월 고정비처럼 커짐</li>
          <li><strong>소모품·정비</strong> — 교체 주기를 km와 개월 중 먼저 오는 쪽으로 환산 (아래 표)</li>
        </ul>
      </div>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산기는 이렇게 계산합니다</h2>
      <p className="g-p">
        「유지비 계산」 탭의 월 비용은 <strong>유류비 + (보험료 + 자동차세) ÷ 12 + 주차비 + 소모품·세차 + 할부금</strong>이고, 감가를 켜면 여기에 월 감가(현재 시세 × 연 감가율 ÷ 12, 또는 (구매가 − 현재 시세) ÷ 보유 개월)를 더합니다.
        1km당 비용은 감가를 포함한 월 비용 ÷ 월 주행거리입니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <caption style={{ captionSide: 'top', textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              도구 기본값으로 계산한 예 (월 {KM.toLocaleString('ko-KR')}km · 연비 12km/L · 휘발유 {GASOLINE_PRICE.toLocaleString('ko-KR')}원)
            </caption>
            <thead>
              <tr><th scope="col" style={headCell}>항목</th><th scope="col" style={headCell}>계산</th><th scope="col" style={headNum}>월 금액</th></tr>
            </thead>
            <tbody>
              <tr><td style={cell}>유류비</td><td style={cell}>{KM.toLocaleString('ko-KR')} ÷ 12 × {GASOLINE_PRICE.toLocaleString('ko-KR')}</td><td style={num}>{won(BASE.fuelMonthly)}</td></tr>
              <tr><td style={cell}>보험료·자동차세</td><td style={cell}>(800,000 + 200,000) ÷ 12</td><td style={num}>{won(BASE.fixedMonthly)}</td></tr>
              <tr><td style={cell}>소모품·세차</td><td style={cell}>50,000 + 20,000</td><td style={num}>{won(BASE.variableMonthly)}</td></tr>
              <tr><td style={cell}><strong>합계 (감가 제외)</strong></td><td style={cell}>1km당 {won(BASE.monthlyExclDepr / KM)}</td><td style={num}><strong>{won(BASE.monthlyExclDepr)}</strong></td></tr>
              <tr><td style={cell}>+ 감가 (예: 시세 3,000만 원 × 10% ÷ 12 — 도구 기본 시세 {man(TOOL_DEFAULT_CUR_PRICE)} 원이면 월 {won(TOOL_DEFAULT_DEPR)})</td><td style={cell}>1km당 {won(BASE_WITH_DEPR / KM)}</td><td style={num}><strong>{won(BASE_WITH_DEPR)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 소모품 */}
      <h2 className="g-h2">소모품 교체 주기와 월 환산 비용</h2>
      <p className="g-p">
        상세 모드는 소모품마다 <strong>1회 비용 ÷ 교체까지 걸리는 개월 수</strong>로 월 비용을 냅니다. km 주기와 개월 주기가 둘 다 있으면 먼저 도달하는 쪽이 교체 시점이라, 적게 타는 사람은 엔진오일도 &lsquo;12개월&rsquo; 주기에 걸려 월 비용이 거리만큼 줄지 않습니다.
        아래는 기본값이며, 실제 주기는 차량 설명서의 권장 주기를 따르세요.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>항목</th>
                <th scope="col" style={headCell}>기본 주기</th>
                <th scope="col" style={headNum}>1회 비용</th>
                <th scope="col" style={headNum}>월 1,500km</th>
                <th scope="col" style={headNum}>월 800km</th>
              </tr>
            </thead>
            <tbody>
              {CONSUMABLE_ROWS.map(c => (
                <tr key={c.key}>
                  <td style={cell}>{c.name}</td>
                  <td style={cell}>{[c.cycleKm ? `${(c.cycleKm / 10_000).toLocaleString('ko-KR')}만km` : null, c.cycleMon ? `${c.cycleMon}개월` : null].filter(Boolean).join(' 또는 ')}</td>
                  <td style={num}>{won(c.cost)}</td>
                  <td style={num}>{won(c.m1500)}</td>
                  <td style={num}>{won(c.m800)}</td>
                </tr>
              ))}
              <tr><td style={cell} colSpan={3}><strong>합계 (세차 제외)</strong></td><td style={num}><strong>{won(CONSUMABLE_SUM)}</strong></td><td style={num}><strong>{won(CONSUMABLE_ROWS.reduce((s, c) => s + c.m800, 0))}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 감가상각 */}
      <h2 className="g-h2">감가상각 — 차급별 기본 감가율과 보유 기간</h2>
      <p className="g-p">
        도구는 <strong>정률 감가</strong>(매년 남은 가치의 일정 비율이 빠짐)를 씁니다. 그래서 처음 몇 년의 감가액이 가장 크고, 오래 탈수록 연평균 감가가 줄어듭니다. 차급별 기본 감가율은 중고차 시세 흐름을 단순화한 가정값이라, 실제 매각가는 KB차차차·엔카 등의 시세로 확인하는 것이 정확합니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>차급 (기본값)</th>
                <th scope="col" style={headNum}>연 감가율</th>
                <th scope="col" style={headNum}>5년 뒤 잔존가치</th>
                <th scope="col" style={headCell}>예시</th>
              </tr>
            </thead>
            <tbody>
              {CAR_CATEGORIES.map(c => (
                <tr key={c.id}>
                  <td style={cell}>{c.name}</td>
                  <td style={num}>{Math.round(c.depreciationRate * 100)}%</td>
                  <td style={num}>{Math.round(Math.pow(1 - c.depreciationRate, 5) * 100)}%</td>
                  <td style={cell}>{c.exampleCars.join('·')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <caption style={{ captionSide: 'top', textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              3,000만 원 국산 중형 (연 {Math.round(MID.depreciationRate * 100)}%) — 보유 기간별 감가
            </caption>
            <thead>
              <tr>
                <th scope="col" style={headCell}>보유 기간</th>
                <th scope="col" style={headNum}>총 감가</th>
                <th scope="col" style={headNum}>연평균 감가</th>
                <th scope="col" style={headNum}>매각 예상가</th>
              </tr>
            </thead>
            <tbody>
              {HOLD_ROWS.map(r => (
                <tr key={r.y}>
                  <td style={cell}>{r.y}년</td>
                  <td style={num}>{man(r.total)}</td>
                  <td style={num}><strong>{man(r.perYear)}/년</strong></td>
                  <td style={num}>{man(r.left)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 보험료 */}
      <h2 className="g-h2">자동차 보험료 — 입력값 잡는 법</h2>
      <p className="g-p">
        보험료는 개인차가 가장 큰 항목이라 평균값보다 <strong>본인 갱신 안내문의 금액</strong>을 넣는 것이 정확합니다. 새로 가입한다면 보험다모아(손해보험협회·생명보험협회 공동 운영)에서 다이렉트 보험료를 한 번에 조회할 수 있습니다. 아래는 계산기 입력용으로 쓰는 대략적 범위이며 공식 통계가 아닙니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>운전자 구분</th>
                <th scope="col" style={headCell}>연 보험료 참고 범위</th>
                <th scope="col" style={headCell}>보험료를 움직이는 요인</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}>20대 신규</td><td style={cell}>약 150만 원 안팎</td><td style={cell}>가입 경력이 없어 가장 비쌈</td></tr>
              <tr><td style={cell}>30대</td><td style={cell}>약 80~100만 원</td><td style={cell}>가입 경력 5년 이상</td></tr>
              <tr><td style={cell}>40~50대 무사고</td><td style={cell}>약 60~80만 원</td><td style={cell}>할인 등급 누적</td></tr>
              <tr><td style={cell}>60대 이상</td><td style={cell}>약 70~90만 원</td><td style={cell}>연령에 따른 할증 가능</td></tr>
              <tr><td style={cell}>수입차·고가 차량</td><td style={cell}>위보다 높음</td><td style={cell}>차량가액·부품가가 높아 자차 보험료 상승</td></tr>
              <tr><td style={cell}>사고 이력</td><td style={cell}>할증</td><td style={cell}>사고 점수에 따라 3년간 할증</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <Callout tone="tip" title="보험료를 줄이는 입력 전 점검">
        운전자 범위(본인·부부 한정)와 연령 특약, 주행거리 특약(적게 타면 환급), 블랙박스 할인을 먼저 적용해 본 금액을 계산기에 넣으세요. 같은 차라도 특약 조합에 따라 수십만 원이 달라집니다.
      </Callout>

      {/* 6. 자동차세 */}
      <h2 className="g-h2">자동차세 — 배기량별 연 세액</h2>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>배기량</th>
                <th scope="col" style={headNum}>연 자동차세</th>
                <th scope="col" style={headCell}>대상 예시</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}>1,000cc</td><td style={num}><strong>{taxWon(1000)}</strong></td><td style={cell}>경차 (모닝·캐스퍼)</td></tr>
              <tr><td style={cell}>1,600cc</td><td style={num}><strong>{taxWon(1600)}</strong></td><td style={cell}>소형·준중형 1.6 (아반떼·코나 등, 1,598cc면 {taxWon(1598)})</td></tr>
              <tr><td style={cell}>2,000cc</td><td style={num}><strong>{taxWon(2000)}</strong></td><td style={cell}>중형 2.0 (쏘나타·K5)</td></tr>
              <tr><td style={cell}>2,500cc</td><td style={num}><strong>{taxWon(2500)}</strong></td><td style={cell}>중형~대형 2.5</td></tr>
              <tr><td style={cell}>3,000cc</td><td style={num}><strong>{taxWon(3000)}</strong></td><td style={cell}>대형 3.0</td></tr>
              <tr><td style={cell}>3,500cc</td><td style={num}><strong>{taxWon(3500)}</strong></td><td style={cell}>대형 SUV 3.5</td></tr>
              <tr><td style={cell}>전기차</td><td style={num}><strong>{won(EV_AUTO_TAX)}</strong></td><td style={cell}>배기량 무관 정액 (아이오닉5·EV6 등)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 12 }}>
        위 금액은 비영업용 승용차 기준으로, <strong>배기량 × cc당 세액</strong>(1,000cc 이하 80원 · 1,600cc 이하 140원 · 1,600cc 초과 200원)에 지방교육세 30%를 더한 값입니다. 구간 경계를 넘으면 차 전체 배기량에 높은 단가가 붙기 때문에 1,598cc와 1,999cc의 세금 차이가 큽니다.
        6월·12월에 나눠 내며, 1월에 연납하면 약 {(ANNUAL_PREPAY_DISCOUNT * 100).toFixed(2)}%를 공제받습니다. 등록 3년차부터는 매년 5%씩(차령 12년 이상 최대 50%) 줄어 — 예를 들어 차령 5년차는 {Math.round(annualTaxAgeDiscount(5) * 100)}%, 10년차는 {Math.round(annualTaxAgeDiscount(10) * 100)}% 경감됩니다.
      </p>

      {/* 7. 구매 방식 */}
      <h2 className="g-h2">현금·할부·리스·장기렌트 비교</h2>
      <p className="g-p">
        「구매 방식 비교」 탭 기본값(3,000만 원 국산 중형, 5년 보유, 할부 연 5%·60개월·선수금 500만 원)으로 계산한 결과입니다. 현금·할부는 5년 뒤 매각가(정률 감가)를 빼서 실제 부담만 남기고, 리스·렌트는 월 이용료를 <strong>차량가의 2.5%·2.8%로 가정</strong>한 값이라 실제 견적으로 바꿔 넣어야 의미가 있습니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>방식</th>
                <th scope="col" style={headNum}>월 평균</th>
                <th scope="col" style={headNum}>5년 총비용</th>
                <th scope="col" style={headCell}>계산 내용</th>
              </tr>
            </thead>
            <tbody>
              {PURCHASE.map(r => (
                <tr key={r.mode}>
                  <td style={cell}><strong>{r.mode}</strong></td>
                  <td style={num}>{man(r.monthly)}</td>
                  <td style={num}><strong>{man(r.totalCost)}</strong></td>
                  <td style={cell}>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-note">
        ※ 월 평균·5년 총비용은 유류·보험·세금·정비 등 운영비를 포함한 값이라 단순 납입액보다 큽니다(장기렌트는 보험·정비 포함 가정). 보유 기간이 할부 기간보다 짧으면 매각 시 남은 할부 잔액을 한꺼번에 갚는 것으로 계산합니다.
      </p>
      <Callout tone="warn" title="광고 월 납입액은 총비용이 아닙니다">
        리스·장기렌트 광고의 월 금액에는 선납금·보증금, 연간 주행거리 약정 초과 요금, 중도 해지 위약금, 반납 시 손상 정산이 빠져 있는 경우가 많습니다. 계약서의 &lsquo;총 납입액&rsquo;과 만기 인수가를 받아 이 계산기의 현금·할부 결과와 비교하세요.
      </Callout>

      {/* 8. 연료 타입 */}
      <h2 className="g-h2">가솔린·디젤·LPG·하이브리드·전기 — 5년과 10년</h2>
      <p className="g-p">
        「연료 타입 비교」 탭 기본값(월 {KM.toLocaleString('ko-KR')}km)으로 연료비와 감가만 더한 비교입니다. 휘발유·경유는 오피넷 {FUEL_PRICE_AS_OF} 전국 평균, LPG는 {LPG_PRICE.toLocaleString('ko-KR')}원/L, 전기는 가정 충전 {fuelRow(FUEL5, 'electric').fuel.pricePerUnit}원·급속 {fuelRow(FUEL5, 'electricFast').fuel.pricePerUnit}원/kWh를 가정했습니다. 도구는 연료비와 감가만 비교합니다. 보험·정비는 차종별로, 자동차세는 연료별로 달라(전기차 연 {won(EV_AUTO_TAX)} vs 2,000cc 가솔린 연 {taxWon(2000)}) 실제 차이는 「유지비 계산」·「차종 비교」 탭에서 확인하세요.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>연료</th>
                <th scope="col" style={headNum}>차량가</th>
                <th scope="col" style={headNum}>5년 연료비</th>
                <th scope="col" style={headNum}>5년 감가</th>
                <th scope="col" style={headNum}>5년 합계</th>
                <th scope="col" style={headNum}>10년 합계</th>
              </tr>
            </thead>
            <tbody>
              {FUEL5.map(r => (
                <tr key={r.fuel.id}>
                  <td style={cell}>{r.fuel.name}{r.fuel.id === FUEL5_BEST.fuel.id ? ' (5년 최저)' : ''}</td>
                  <td style={num}>{man(r.carPrice)}</td>
                  <td style={num}>{man(r.totalFuelCost)}</td>
                  <td style={num}>{man(r.totalDep)}</td>
                  <td style={num}><strong>{man(r.totalCost)}</strong></td>
                  <td style={num}>{man(fuelRow(FUEL10, r.fuel.id).totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 12 }}>
        {EV_WINS_5
          ? '현재 유가 기준으로는 5년만 타도 전기(가정 충전)가 가솔린보다 싸고, 10년이면 연료비 차이가 더 쌓여 격차가 벌어집니다.'
          : EV_WINS_10
            ? '5년만 타면 감가율이 높은 전기차가 불리하지만, 10년으로 늘리면 연료비 차이가 쌓여 전기(가정 충전)가 가솔린보다 싸집니다.'
            : '현재 유가 기준으로는 5년·10년 모두 감가율이 높은 전기차가 불리합니다 — 10년이면 격차가 줄지만 연료비 차이가 감가를 다 메우지 못합니다.'}
        {' '}10년 기준 손익분기 휘발유 가격은 L당 약 {GAS_BE_PRICE_10.toLocaleString('ko-KR')}원으로, 휘발유가 이보다 비싸면 전기가, 싸면 가솔린이 유리합니다. 전기차 보조금으로 실구매가가 낮아지면 손익분기는 더 앞당겨지고, 집에서 충전할 수 없어 급속 충전만 쓰면 뒤로 밀립니다. 탭에서 차량가와 보유 기간을 본인 조건으로 바꿔 보세요.
      </p>

      {/* 9. 차종별 */}
      <h2 className="g-h2">차종별 연간 유지비 예시</h2>
      <p className="g-p">
        「차종 비교」 탭의 기본 3대를 월 {KM.toLocaleString('ko-KR')}km로 계산한 값입니다(주차비 0원). 감가는 차량가 × 연 감가율로 첫해 기준입니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>차종</th>
                <th scope="col" style={headNum}>연료</th>
                <th scope="col" style={headNum}>보험</th>
                <th scope="col" style={headNum}>세금</th>
                <th scope="col" style={headNum}>소모품</th>
                <th scope="col" style={headNum}>감가</th>
                <th scope="col" style={headNum}>월 환산</th>
                <th scope="col" style={headNum}>1km당</th>
              </tr>
            </thead>
            <tbody>
              {CAR_SPECS.map(c => (
                <tr key={c.name}>
                  <td style={cell}>{c.name}</td>
                  <td style={num}>{man(c.yearlyFuel)}</td>
                  <td style={num}>{man(c.yearlyInsurance)}</td>
                  <td style={num}>{man(c.yearlyTax)}</td>
                  <td style={num}>{man(c.yearlyVariable)}</td>
                  <td style={num}>{man(c.yearlyDep)}</td>
                  <td style={num}><strong>{man(c.yearlyTotal / 12)}</strong></td>
                  <td style={num}>{won(c.perKm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10. 카쉐어링 */}
      <h2 className="g-h2">보유 vs 카쉐어링 손익분기</h2>
      <p className="g-p">
        보유 비용은 <strong>고정비 + km당 연료비 × 주행거리</strong>, 카쉐어링은 <strong>(시간 요금 + 주행 요금) × 주행거리</strong>로 둘 다 직선이라 한 점에서 만납니다. 도구 가정(시간당 {CARSHARING_RATES.hourlyRate.toLocaleString('ko-KR')}원, km당 {CARSHARING_RATES.perKmRate}원, 100km당 {CARSHARING_RATES.avgHoursPer100km}시간 이용)이면 카쉐어링은 1km당 약 {won(SHARE_PER_KM)}이고, 손익분기는
        감가를 빼면 월 <strong>약 {BE_EXCL.toLocaleString('ko-KR')}km</strong>, 3,000만 원 차의 첫해 감가(월 {man(DEPR_MONTHLY)} 원)를 넣으면 월 <strong>약 {BE_INCL.toLocaleString('ko-KR')}km</strong>입니다. 도구의 탭 표는 감가를 뺀 기준입니다.
      </p>
      <div style={tableBox}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>월 주행</th>
                <th scope="col" style={headNum}>보유 (감가 제외)</th>
                <th scope="col" style={headNum}>보유 (감가 포함)</th>
                <th scope="col" style={headNum}>카쉐어링</th>
              </tr>
            </thead>
            <tbody>
              {SHARE_EXCL.map((r, i) => (
                <tr key={r.monthlyKm}>
                  <td style={cell}>{r.monthlyKm.toLocaleString('ko-KR')}km</td>
                  <td style={num}>{man(r.ownCost)}</td>
                  <td style={num}>{man(SHARE_INCL[i].ownCost)}</td>
                  <td style={num}>{man(r.shareCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-note">※ 카쉐어링 실제 요금은 차종·대여 시간대·회원 요금제·보험 옵션에 따라 크게 다릅니다. 본인이 자주 쓰는 앱의 요금으로 바꿔 계산하면 손익분기가 달라집니다.</p>

      {/* 11. FAQ */}
      <Faq items={FAQ_LD} />

      {/* 12. 면책 */}
      <Disclaimer variant="finance" open>
        본 자동차 유지비 계산기는 <strong>일반 정보 제공 도구</strong>입니다. 실제 비용은 다음에 따라 다를 수 있습니다:
        <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
          <li>운전 습관·정비 주기</li>
          <li>보험 조건·할인 (다이렉트·운전자 한정 등)</li>
          <li>지역별 유가·주차비</li>
          <li>차량 상태·연식</li>
          <li>정책 변경 (자동차세·전기차 보조금 등)</li>
        </ul>
        <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>전문가 상담 권장:</p>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>리스·장기렌트 견적 — 캐피탈 회사 직접 문의 필수</li>
          <li>중고차 시세 — KB차차차·엔카 등 전문 사이트</li>
          <li>보험 견적 — 보험다모아·다이렉트 보험사 비교</li>
          <li>정비비 — 정비소 직접 견적</li>
          <li>「이 차 사세요」 같은 추천은 하지 않음 — 본인 상황·취향 종합 결정</li>
        </ul>
      </Disclaimer>

      {/* 13. 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { href: '/tools/finance/salary', name: '연봉 실수령액 계산기', desc: '월급 대비 차 유지비 비율' },
          { href: '/tools/finance/loan', name: '대출이자 계산기', desc: '자동차 할부 이자 정밀 계산' },
          { href: '/tools/finance/compound', name: '복리 계산기', desc: '차 안 사면 투자 효과' },
          { href: '/tools/finance/real-estate', name: '부동산 투자 수익률', desc: '차 vs 부동산 투자' },
        ].map(t => (
          <Link key={t.href} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{t.desc}</div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
