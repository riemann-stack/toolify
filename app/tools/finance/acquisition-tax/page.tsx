import AcquisitionTaxClient from './AcquisitionTaxClient'
import css from './acquisitionTax.module.css'
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
  calcHouseAcquisitionTax, calcAcquisitionTaxByCause, applyFirstHomeRelief, firstHomeIneligibility,
  ACQ_RATE_PCT, HOUSE_STANDARD_BRACKETS, FIRST_HOME_RELIEF, LOW_VALUE_HOUSE_MAX_STD_VALUE,
  GIFT_HOUSE_HEAVY_MIN_STD_VALUE, TEMP_TWO_HOMES_DISPOSAL_YEARS, ACQ_FILING_DEADLINE, NATIONAL_HOUSING_AREA_M2,
  ACQ_REFORM_PROPOSAL_2026,
  type AcqTaxBreakdown, type AcquisitionInput,
} from '@/lib/krAcquisitionTax'
import { buildHouseMatrix, buildCauseCompare, won, num, pct } from './acquisitionTaxUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/acquisition-tax',
  title: '부동산 취득세 계산기 2026 — 주택 수·조정지역 중과, 생애최초 감면, 증여·상속·신축',
  description:
    '매매·증여·상속·신축별 취득세·지방교육세·농어촌특별세를 세목별로 계산. 6~9억 구간 0.01%p 세율, 다주택·법인 8·12% 중과, 일시적 2주택, 생애최초 200만·300만원 감면까지 2026년 지방세법 기준.',
  keywords: [
    '취득세 계산기', '부동산 취득세', '주택 취득세', '아파트 취득세', '취득세율', '다주택 취득세 중과',
    '생애최초 취득세 감면', '증여 취득세', '상속 취득세', '신축 취득세', '원시취득 취득세',
    '오피스텔 취득세', '지방교육세', '농어촌특별세', '일시적 2주택 취득세', '조정대상지역 취득세',
  ],
})

/* ─── 본문 수치 — 전부 lib/krAcquisitionTax 단일 소스로 빌드 시 생성 (손으로 적은 세율·세액 없음) ─── */
const E = 100_000_000
const R = ACQ_RATE_PCT
const B = HOUSE_STANDARD_BRACKETS
const FH = FIRST_HOME_RELIEF
const P = ACQ_REFORM_PROPOSAL_2026
const eok = (n: number) => `${(n / E).toLocaleString('ko-KR')}억`
const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만원`
const ymd = (s: string) => { const [y, m, d] = s.split('-'); return `${y}년 ${Number(m)}월 ${Number(d)}일` }
const house = (price: number, o: Partial<Parameters<typeof calcHouseAcquisitionTax>[0]> = {}) =>
  calcHouseAcquisitionTax({ price, homeCount: 1, adjusted: false, over85: false, ...o })
const byCause = (o: Omit<AcquisitionInput, 'over85'> & { over85?: boolean }) => calcAcquisitionTaxByCause({ over85: false, ...o })

/* 대표 예시 */
const SEVEN = house(7 * E)
const SEVEN85 = house(7 * E, { over85: true })
const S8 = house(10 * E, { homeCount: 2, adjusted: true })
const S12 = house(10 * E, { homeCount: 3, adjusted: true })
const S8_85 = house(10 * E, { homeCount: 2, adjusted: true, over85: true })
const S12_85 = house(10 * E, { homeCount: 3, adjusted: true, over85: true })
const ONE10 = house(10 * E)
const ONE10_85 = house(10 * E, { over85: true })
const CORP5 = house(5 * E, { corporate: true })
const GIFT5 = byCause({ cause: 'gift', property: 'house', value: 5 * E })
const GIFT5H = byCause({ cause: 'gift', property: 'house', value: 5 * E, adjusted: true, giftStdValueOver3eok: true })
const INH5 = byCause({ cause: 'inherit', property: 'house', value: 5 * E })
const INH5ONE = byCause({ cause: 'inherit', property: 'house', value: 5 * E, inheritHomelessOneHouse: true })
const ORIG5 = byCause({ cause: 'original', property: 'house', value: 5 * E })
const ORIG5_85 = byCause({ cause: 'original', property: 'house', value: 5 * E, over85: true })
const NONHOUSE5 = byCause({ cause: 'purchase', property: 'nonHouse', value: 5 * E })
const FIVE = house(5 * E)
const FIRST5 = applyFirstHomeRelief(FIVE, { capKind: 'general', over85: false })
const FIRST7_85 = applyFirstHomeRelief(SEVEN85, { capKind: 'general', over85: true })
/* 부모 주택이 있는 세대의 자녀(30세 미만 미혼) — 세대 2주택. 비조정은 표준세율이라 감면 계산, 조정은 중과라 감면 미계산 */
const FAM_IN: AcquisitionInput = { cause: 'purchase', property: 'house', value: 5 * E, over85: false, homeCount: 2, adjusted: false }
const FAM2 = calcAcquisitionTaxByCause(FAM_IN)
const FAM2_OK = firstHomeIneligibility(FAM_IN, FAM2) === null
const FAM2_FIRST = applyFirstHomeRelief(FAM2, { capKind: 'general', over85: false })
const FAM2_ADJ = house(5 * E, { homeCount: 2, adjusted: true })
const EDGE_MID = house(B.low + 750_000) // 6억 75만원 — 반올림 경계

/* 표 1 — 취득 원인·물건별 세율 */
type RateRow = { label: string; sub?: string; le: AcqTaxBreakdown; gt?: AcqTaxBreakdown }
const RATE_ROWS: RateRow[] = [
  { label: '주택 매매 1주택', sub: `${eok(B.low)} 이하`, le: house(5 * E), gt: house(5 * E, { over85: true }) },
  { label: '주택 매매 1주택', sub: `${eok(B.high)} 초과`, le: ONE10, gt: ONE10_85 },
  { label: '주택 매매 중과', sub: '조정 2주택·비조정 3주택', le: S8, gt: S8_85 },
  { label: '주택 매매 중과', sub: '조정 3주택+·비조정 4주택+·법인', le: S12, gt: S12_85 },
  { label: '주택 외 매매', sub: '오피스텔·상가·토지', le: NONHOUSE5 },
  { label: '농지 매매', le: byCause({ cause: 'purchase', property: 'farmland', value: 5 * E }) },
  { label: '주택 증여', le: GIFT5, gt: byCause({ cause: 'gift', property: 'house', value: 5 * E, over85: true }) },
  { label: '주택 증여 중과', sub: `조정지역·시가표준액 ${eok(GIFT_HOUSE_HEAVY_MIN_STD_VALUE)} 이상`, le: GIFT5H, gt: byCause({ cause: 'gift', property: 'house', value: 5 * E, adjusted: true, giftStdValueOver3eok: true, over85: true }) },
  { label: '주택 외·농지 증여', le: byCause({ cause: 'gift', property: 'nonHouse', value: 5 * E }) },
  { label: '주택 상속', le: INH5, gt: byCause({ cause: 'inherit', property: 'house', value: 5 * E, over85: true }) },
  { label: '주택 상속 특례', sub: '무주택 1가구 1주택', le: INH5ONE, gt: byCause({ cause: 'inherit', property: 'house', value: 5 * E, inheritHomelessOneHouse: true, over85: true }) },
  { label: '주택 외 상속', le: byCause({ cause: 'inherit', property: 'nonHouse', value: 5 * E }) },
  { label: '농지 상속', le: byCause({ cause: 'inherit', property: 'farmland', value: 5 * E }) },
  { label: '주택 신축', sub: '원시취득', le: ORIG5, gt: ORIG5_85 },
  { label: '주택 외 신축', sub: '원시취득', le: byCause({ cause: 'original', property: 'nonHouse', value: 5 * E }) },
]

/* 표 2 — 취득가액별 1주택 세액 */
const PRICE_ROWS = [3, 5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 12, 15].map(p => ({ price: p * E, le: house(p * E), gt: house(p * E, { over85: true }) }))

/* 표 3 — 10억 주택, 주택 수 × 지역 */
const MATRIX10 = buildHouseMatrix(10 * E, false)

/* 표 4 — 5억, 취득 원인별 */
const CAUSE5 = buildCauseCompare(5 * E, 'house', false)
const CAUSE5_85 = buildCauseCompare(5 * E, 'house', true)

/* 표 5 — 생애최초 감면 전후 (85㎡ 이하, 일반 한도) */
const FIRST_ROWS = [2, 3, 5, 7, 9, 12].map(p => {
  const b = house(p * E)
  return { price: p * E, b, r: applyFirstHomeRelief(b, { capKind: 'general', over85: false }) }
})

/** 농특세 칸 — 주택은 85㎡ 이하 / 초과, 특례 등 0이면 '없음' */
const ruralCell = (row: RateRow) => {
  if (!row.gt) return pct(row.le.ruralRate)
  return row.gt.ruralRate === 0 ? '없음' : `비과세 / ${pct(row.gt.ruralRate)}`
}

const FAQ_LD = [
  {
    q: `${eok(7 * E)}원 아파트를 사면 취득세가 정확히 얼마인가요?`,
    a: `무주택자나 1주택이 되는 매수라면 ${eok(B.low)}~${eok(B.high)} 구간 공식이 적용됩니다. (7억 × 2/3억 − 3) = 1.6666…%를 소수점 넷째자리까지 반올림하면 <strong>${pct(SEVEN.acquisitionRate)}</strong>이고, 취득세 ${won(SEVEN.acquisitionTax)} + 지방교육세 ${won(SEVEN.educationTax)} = <strong>${won(SEVEN.total)}</strong>입니다. 전용 ${NATIONAL_HOUSING_AREA_M2}㎡를 넘으면 농어촌특별세 ${won(SEVEN85.ruralTax)}이 더해져 ${won(SEVEN85.total)}이 됩니다.`,
  },
  {
    q: `전용면적 ${NATIONAL_HOUSING_AREA_M2}㎡를 넘으면 세금이 얼마나 늘어나나요?`,
    a: `취득세·지방교육세는 그대로이고 농어촌특별세만 붙습니다. 1주택 표준세율이면 과세표준의 ${pct(ONE10_85.ruralRate)}, 8% 중과면 ${pct(S8_85.ruralRate)}, 12% 중과면 ${pct(S12_85.ruralRate)}입니다. 국민주택규모(${NATIONAL_HOUSING_AREA_M2}㎡, 수도권 외 읍·면은 100㎡) 이하 주택은 농어촌특별세법 §4에 따라 비과세입니다.`,
  },
  {
    q: '일시적 2주택이면 조정대상지역에서도 중과를 피할 수 있나요?',
    a: `네. 조정대상지역에서 두 번째 주택을 사더라도 종전 주택을 기한(현행 ${TEMP_TWO_HOMES_DISPOSAL_YEARS}년, 지방세법 시행령 §28의5) 안에 처분하면 1주택 세율(${B.lowPct}~${B.highPct}%)로 신고할 수 있습니다. 기한 안에 팔지 못하면 중과세율(${pct(S8.acquisitionRate)})과의 차액과 가산세가 추징됩니다. 주의할 점은 행정안전부가 ${ymd(P.announced)} 발표한 지방세제 개편안입니다. ${ymd(P.tempTwoHomesFrom)} 이후 신규 취득분부터 종전 주택이 조정대상지역에 있으면 이 기한을 <strong>${P.tempTwoHomesYears}년</strong>으로 줄이는 내용인데, 처분기한은 시행령 사항이라 국회 의결 없이 바뀔 수 있습니다. 2026년 9월 기준으로는 개정 전이지만, 그 이후 취득한다면 계약 전에 위택스·관할 세무과에서 시행 여부를 확인하고 ${P.tempTwoHomesYears}년 안에 처분하는 것을 기준으로 계획하는 편이 안전합니다.`,
  },
  {
    q: '오피스텔을 사면 취득세는 몇 %이고, 주택 수에 들어가나요?',
    a: `오피스텔은 용도와 관계없이 '주택 외' 유상취득이라 취득세 ${pct(NONHOUSE5.acquisitionRate)} + 지방교육세 ${pct(NONHOUSE5.educationRate)} + 농어촌특별세 ${pct(NONHOUSE5.ruralRate)} = <strong>${pct(NONHOUSE5.totalRate)}</strong>입니다. 다만 2020년 8월 12일 이후 취득한 오피스텔 중 재산세가 주택으로 과세되는 주거용 오피스텔은 이후 다른 주택을 살 때 주택 수에 포함됩니다. 생애최초 감면은 현행법상 오피스텔에 적용되지 않습니다(개편안에서 포함 추진 중).`,
  },
  {
    q: '생애최초 감면을 받은 뒤 추징되는 경우가 있나요?',
    a: `지방세특례제한법 §36의3④에 따라 ① 취득일부터 ${FH.residenceStartMonths}개월 안에 전입해 상시 거주를 시작하지 않은 경우, ② ${FH.residenceStartMonths}개월 안에 다른 주택을 추가로 취득한 경우(상속 제외), ③ 상시 거주 ${FH.residenceYears}년이 되기 전에 매각·증여하거나 다른 용도(임대 등)로 사용한 경우 감면받은 세액이 추징됩니다. 정당한 사유가 인정되는 예외는 시행령에서 정합니다.`,
  },
  {
    q: '부모님 집이 있는데 제가 처음 집을 사면 생애최초 감면을 받을 수 있나요?',
    a: `받을 수 있습니다. 지방세특례제한법 §36의3의 요건은 <strong>본인과 배우자</strong>가 주택을 소유한 적이 없는 것이고, 부모 등 다른 세대원의 주택은 따지지 않습니다. 다만 취득세율은 세대 기준 주택 수로 정해지고, 30세 미만 미혼 자녀는 부모와 따로 살아도 원칙적으로 같은 세대로 봅니다(지방세법 시행령 §28의3). 부모 집이 1채 있는 세대에서 비조정지역 ${eok(5 * E)}원 주택을 사면 세대 2주택이어도 표준세율 ${pct(FAM2.acquisitionRate)}라 감면 후 ${won(FAM2_FIRST.after.total)}을 내지만, 조정대상지역이면 ${pct(FAM2_ADJ.acquisitionRate)} 중과로 ${won(FAM2_ADJ.total)}이 됩니다. 중과 산출세액에 감면이 어떻게 적용되는지는 확인하지 못해 이 계산기는 중과 취득에는 감면을 계산하지 않습니다.`,
  },
  {
    q: '부모님께 아파트를 증여받으면 취득세는 얼마인가요?',
    a: `증여(무상취득)는 ${pct(R.gift)}이고 과세표준은 2023년부터 시가인정액(매매사례가액·감정가액 등)입니다. ${eok(5 * E)}원 주택(${NATIONAL_HOUSING_AREA_M2}㎡ 이하)이면 ${won(GIFT5.total)}입니다. 조정대상지역에 있는 시가표준액 ${eok(GIFT_HOUSE_HEAVY_MIN_STD_VALUE)}원 이상 주택은 ${pct(R.giftHeavy)} 중과로 ${won(GIFT5H.total)}까지 늘어나지만, 증여하는 부모가 1세대 1주택자이고 배우자·직계존비속에게 주는 경우에는 중과되지 않습니다.`,
  },
  {
    q: '상속받은 집의 취득세는 언제까지, 얼마를 내나요?',
    a: `상속개시일이 속하는 달의 말일부터 ${ACQ_FILING_DEADLINE.inheritMonths}개월(상속인 중 외국 거주자가 있으면 ${ACQ_FILING_DEADLINE.inheritAbroadMonths}개월) 안에 신고·납부합니다. 세율은 ${pct(R.inherit)}(농지 ${pct(R.inheritFarmland)})이고 과세표준은 시가표준액(공시가격)입니다. 상속인 가구가 무주택이고 그 집이 유일한 주택이 되면 특례세율 ${pct(R.inheritOneHouse)}가 적용돼 합계 ${pct(INH5ONE.totalRate)}로 줄어듭니다.`,
  },
  {
    q: '위택스 모의계산 결과와 조금 다른 이유는 무엇인가요?',
    a: '이 계산기는 세목별로 10원 미만을 절사하고, 입력한 조건(주택 수·조정대상지역·저가주택 여부 등)을 그대로 믿고 계산합니다. 위택스는 과세표준(시가표준액·시가인정액) 판단, 감면 중복 적용, 주택 수 산정 제외 대상 등을 신고 단계에서 함께 봅니다. 차이가 나면 위택스·관할 시·군·구청 세무과 결과가 기준입니다.',
  },
]

export default function AcquisitionTaxPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/acquisition-tax" article="v2">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />부동산 취득세 계산기
      </h1>
      <p className="tp-lead">
        매매·증여·상속·신축 중 <strong>취득 원인</strong>과 취득 후 주택 수, 조정대상지역, 전용 {NATIONAL_HOUSING_AREA_M2}㎡ 초과 여부를 넣으면
        취득세·지방교육세·농어촌특별세를 세목별로 나눠 계산합니다. 다주택 중과({pct(S8.acquisitionRate)}·{pct(S12.acquisitionRate)})와 생애최초 감면(최대 {man(FH.caps.general)}·{man(FH.caps.smallCapital)})까지 반영합니다.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="지방세법 §11·§13의2·§15·§151, 지방세특례제한법 §36의3(2026.1.1 시행), 농어촌특별세법 §5 기준 — 2026.8.26 발표 지방세제 개편안은 시행 전이라 미반영(일시적 2주택 처분기한 단축 예정은 본문 안내)"
        sources={[
          { label: '지방세법 제11조(부동산 취득의 세율)', href: 'https://www.law.go.kr/법령/지방세법/제11조' },
          { label: '지방세특례제한법 제36조의3(생애최초 주택 취득세 감면)', href: 'https://www.law.go.kr/법령/지방세특례제한법/제36조의3' },
          { label: '위택스 취득세 신고·모의계산', href: 'https://www.wetax.go.kr' },
        ]}
      />

      <AcquisitionTaxClient />

      <GuideDivider />

      <h2 className="g-h2">취득세 고지서에는 세금이 세 가지 들어 있습니다</h2>
      <p className="g-p">
        흔히 &lsquo;취득세&rsquo;라고 부르는 금액은 실제로는 <strong>취득세(본세) + 지방교육세 + 농어촌특별세</strong>의 합계입니다.
        세 세목 모두 같은 과세표준(매매가·시가인정액·시가표준액 등)에 각자의 세율을 곱해 구하고, 신고·납부도 한 번에 합니다.
        그래서 &ldquo;1주택은 1%&rdquo;라고 알고 있어도 실제 납부액은 {eok(5 * E)}원 주택 기준 {won(FIVE.total)}, 곧 {pct(FIVE.totalRate)}가 됩니다.
      </p>
      <ul className="g-list">
        <li><strong>취득세</strong> — 지방세법 §11(표준세율)·§13의2(주택 중과)·§15(세율 특례)로 정합니다. 주택 매매는 가격에 따라 {B.lowPct}~{B.highPct}%, 증여 {pct(R.gift)}, 상속 {pct(R.inherit)}, 신축 {pct(R.original)}, 주택 외 매매 {pct(R.nonHouse)}입니다.</li>
        <li><strong>지방교육세</strong> — 지방세법 §151①1호. 원칙은 (표준세율 − {pct(R.midStandard)}) × {R.eduSharePct}%입니다. 주택 매매 1~3% 구간은 &lsquo;취득세율 × 1/2 × {R.eduSharePct}%&rsquo;, 곧 취득세의 10분의 1이고, 8·12% 중과는 {pct(S8.educationRate)}로 고정됩니다.</li>
        <li><strong>농어촌특별세</strong> — 농어촌특별세법 §5①6호. 표준세율을 {pct(R.midStandard)}로 놓고 계산한 취득세의 10%, 곧 과세표준의 {pct(R.ruralBase)}가 기본이고 중과되면 (중과세율 − {pct(R.midStandard)}) × 10%로 늘어납니다. 전용 {NATIONAL_HOUSING_AREA_M2}㎡ 이하 주택은 비과세입니다(§4 11호).</li>
      </ul>
      <p className="g-p">
        각 세목은 10원 미만을 잘라 내고 더합니다. 아래 표 1은 이 계산기가 쓰는 세율을 취득 원인·물건별로 한데 모은 것입니다. 숫자는 모두 계산 엔진에서 뽑아 만든 값이라 계산기 결과와 항상 같습니다.
      </p>
      <DataFigure n={1} title="취득 원인·물건별 세율 (2026년 9월 시행 법령)" unit="단위: %" source={<>자료: 지방세법 §11·§13의2·§15·§151, 농어촌특별세법 §5 — Youtil 계산 엔진(lib/krAcquisitionTax)에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">구분</th><th scope="col" className="r">취득세</th><th scope="col" className="r">교육세</th><th scope="col" className="r">농특세</th><th scope="col" className="r">합계<br />({NATIONAL_HOUSING_AREA_M2}㎡ 이하)</th><th scope="col" className="r">합계<br />({NATIONAL_HOUSING_AREA_M2}㎡ 초과·주택 외)</th></tr>
          </thead>
          <tbody>
            {RATE_ROWS.map((row, i) => (
              <tr key={i}>
                <th scope="row">{row.label}{row.sub && <>{' '}<small className={css.thSub}>{row.sub}</small></>}</th>
                <td className="r">{pct(row.le.acquisitionRate)}</td>
                <td className="r">{pct(row.le.educationRate)}</td>
                <td className="r">{ruralCell(row)}</td>
                <td className="r em">{row.gt ? pct(row.le.totalRate) : '—'}</td>
                <td className="r em">{pct((row.gt ?? row.le).totalRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        무주택 1가구의 상속 특례는 &lsquo;표준세율 − {pct(R.midStandard)}&rsquo;로 계산하는 세율 특례(지방세법 §15①2호 가목)라 농어촌특별세 계산에 표준세율 {pct(R.midStandard)}를 넣으면 0이 됩니다. 그래서 면적과 관계없이 합계 {pct(INH5ONE.totalRate)}로 안내됩니다.
      </p>

      <h2 className="g-h2">주택 매매 {B.lowPct}~{B.highPct}% 구간 — {eok(B.low)}과 {eok(B.high)} 사이는 0.01%p 단위로 올라갑니다</h2>
      <p className="g-p">
        1주택 매수(또는 비조정지역 2주택, 일시적 2주택)에는 지방세법 §11①8호의 표준세율이 적용됩니다. 취득가액 {eok(B.low)}원 이하는 {B.lowPct}%, {eok(B.high)}원 초과는 {B.highPct}%이고,
        그 사이는 <strong>(취득가액 × 2/3억원 − 3) × 1/100</strong>이라는 공식으로 세율을 구합니다. 이때 세율은 &ldquo;소수점 이하 다섯째자리에서 반올림하여 넷째자리까지&rdquo; 계산하므로 퍼센트로 보면 0.01%p 단위가 됩니다.
      </p>
      <p className="g-p">
        <strong>계산 예시</strong> — {eok(7 * E)}원 아파트, 1주택, 전용 {NATIONAL_HOUSING_AREA_M2}㎡ 이하: 7 × 2/3 − 3 = 1.6666…이므로 세율은 {pct(SEVEN.acquisitionRate)}입니다.
        취득세 {won(SEVEN.acquisitionTax)}, 지방교육세는 취득세율의 10분의 1인 {pct(SEVEN.educationRate)}를 곱해 {won(SEVEN.educationTax)}, 합계 <strong>{won(SEVEN.total)}</strong>입니다.
        같은 집이 {NATIONAL_HOUSING_AREA_M2}㎡를 넘으면 농어촌특별세 {won(SEVEN85.ruralTax)}이 추가돼 {won(SEVEN85.total)}입니다.
      </p>
      <p className="g-p">
        반올림 경계도 확인해 볼 만합니다. 취득가액 {num(EDGE_MID.price)}원이면 공식 값이 정확히 1.005%라 반올림되어 {pct(EDGE_MID.acquisitionRate)}가 되고, 취득세는 {won(EDGE_MID.acquisitionTax)}(10원 미만 절사)입니다. 세율이 가격에 비례해 조금씩 오르도록 설계돼 있어 {eok(B.low)}원이나 {eok(B.high)}원을 1원 넘긴다고 세액이 계단처럼 뛰지는 않습니다.
      </p>
      <DataFigure n={2} title="취득가액별 1주택 취득세 (매매·개인·중과 없음)" unit="단위: 원" source={<>자료: 지방세법 §11①8호·§151①1호, 농어촌특별세법 §5 — Youtil 계산 엔진에서 생성, 세목별 10원 미만 절사</>}>
        <table>
          <thead>
            <tr><th scope="col">취득가액</th><th scope="col" className="r">취득세율</th><th scope="col" className="r">취득세</th><th scope="col" className="r">지방교육세</th><th scope="col" className="r">합계 (85㎡ 이하)</th><th scope="col" className="r">합계 (85㎡ 초과)</th></tr>
          </thead>
          <tbody>
            {PRICE_ROWS.map(row => (
              <tr key={row.price}>
                <th scope="row">{eok(row.price)}</th>
                <td className="r">{pct(row.le.acquisitionRate)}</td>
                <td className="r">{num(row.le.acquisitionTax)}</td>
                <td className="r">{num(row.le.educationTax)}</td>
                <td className="r em">{num(row.le.total)}</td>
                <td className="r">{num(row.gt.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip" title="취득가액은 계약서 금액">
        매매의 과세표준은 사실상 취득가격(지방세법 §10의3)으로, 보통 부동산 거래신고 금액과 같습니다. 중개보수·인테리어 비용은 들어가지 않지만,
        매도인의 양도세를 매수인이 대신 부담하기로 했다면 그 금액도 취득가격에 포함될 수 있습니다.
      </Callout>

      <h2 className="g-h2">다주택·법인 중과 — 주택 수와 조정대상지역이 세율을 가릅니다</h2>
      <p className="g-p">
        지방세법 §13의2는 개인이 주택을 사서 1세대 주택 수가 늘어날 때 세율을 크게 올립니다. 기준은 <strong>이번 주택을 포함한 취득 후 1세대 보유 주택 수</strong>와
        <strong>취득하는 주택이 조정대상지역에 있는지</strong> 두 가지입니다. 조정대상지역에서는 2주택부터 {pct(S8.acquisitionRate)}, 3주택부터 {pct(S12.acquisitionRate)}가,
        그 밖의 지역에서는 3주택 {pct(S8.acquisitionRate)}, 4주택 이상 {pct(S12.acquisitionRate)}가 적용됩니다. 법인은 주택 수·지역과 관계없이 {pct(CORP5.acquisitionRate)}입니다.
      </p>
      <DataFigure n={3} title={`${eok(10 * E)}원 주택을 살 때 — 취득 후 주택 수 × 지역별 합계 (85㎡ 이하)`} unit="단위: 원" source={<>자료: 지방세법 §13의2①, §151①1호 — Youtil 계산 엔진에서 생성. 일시적 2주택·저가주택 특례 미적용</>}>
        <table>
          <thead>
            <tr><th scope="col">취득 후 주택 수</th><th scope="col" className="r">비조정 세율</th><th scope="col" className="r">비조정 합계</th><th scope="col" className="r">조정 세율</th><th scope="col" className="r">조정 합계</th></tr>
          </thead>
          <tbody>
            {MATRIX10.map(m => (
              <tr key={m.homeCount}>
                <th scope="row">{m.label}</th>
                <td className="r">{pct(m.normal.totalRate)}</td>
                <td className="r">{num(m.normal.total)}</td>
                <td className="r">{pct(m.adjusted.totalRate)}</td>
                <td className="r em">{num(m.adjusted.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        같은 {eok(10 * E)}원 주택이라도 1주택이면 {won(ONE10.total)}, 조정대상지역 2주택이면 {won(S8.total)}, 3주택이면 {won(S12.total)}으로 세 배 넘게 차이 납니다.
        중과가 걸리면 지방교육세는 {pct(S8.educationRate)}로 고정되고, {NATIONAL_HOUSING_AREA_M2}㎡를 넘는 주택의 농어촌특별세는 {pct(S8_85.ruralRate)}({pct(S8.acquisitionRate)} 중과)·{pct(S12_85.ruralRate)}({pct(S12.acquisitionRate)} 중과)로 올라갑니다.
      </p>
      <h3 className="g-h3">주택 수를 셀 때 알아 둘 점</h3>
      <ul className="g-list">
        <li><strong>1세대</strong>는 주민등록상 같은 세대가 기준입니다. 배우자와 30세 미만 미혼 자녀는 따로 살아도 같은 세대로 보는 것이 원칙이며, 자녀의 소득 요건 등 예외는 지방세법 시행령 §28의3이 정합니다.</li>
        <li>2020년 8월 12일 이후 취득한 <strong>분양권·입주권·주거용 오피스텔</strong>도 주택 수에 들어갑니다. 분양권으로 받는 아파트는 분양권을 취득한 날을 기준으로 주택 수를 셉니다.</li>
        <li>시가표준액 {eok(LOW_VALUE_HOUSE_MAX_STD_VALUE.capital)}원 이하 주택(2025년 1월 2일 이후 비수도권 주택은 {eok(LOW_VALUE_HOUSE_MAX_STD_VALUE.nonCapital)}원 이하)은 사는 순간 중과되지 않고, 이후 다른 주택을 살 때 주택 수에서도 빠집니다. 다만 도시정비법상 정비구역·소규모주택정비 사업구역 주택은 예외입니다(시행령 §28의2·§28의4).</li>
        <li>상속받은 주택은 상속개시일부터 5년 동안 주택 수에서 제외됩니다(시행령 §28의4).</li>
      </ul>
      <h3 className="g-h3">일시적 2주택</h3>
      <p className="g-p">
        이사하려고 새집을 먼저 샀다면 조정대상지역이라도 곧바로 {pct(S8.acquisitionRate)}가 되지는 않습니다. 종전 주택을 새집 취득일부터 {TEMP_TWO_HOMES_DISPOSAL_YEARS}년 안에 처분하는 조건으로
        1주택 세율({B.lowPct}~{B.highPct}%)로 신고할 수 있습니다(시행령 §28의5). 기한 안에 팔지 못하면 중과세율과의 차액이 가산세와 함께 추징되므로, 계산기에서 &lsquo;일시적 2주택&rsquo;을 끄고 중과 금액도 미리 확인해 두는 편이 안전합니다.
      </p>
      <p className="g-p">
        다만 행정안전부가 {ymd(P.announced)} 발표한 「2026년 지방세제 개편안」에는 종전 주택이 조정대상지역에 있으면 처분기한을 <strong>{P.tempTwoHomesYears}년</strong>으로 줄이는 안이 들어 있고,
        {ymd(P.tempTwoHomesFrom)} 이후 신규 취득분부터 적용하겠다는 계획입니다. 처분기한은 법률이 아니라 시행령(§28의5)에서 정하므로 국회 의결 없이 바뀔 수 있습니다.
        이 페이지는 기준일(2026년 9월) 현행대로 {TEMP_TWO_HOMES_DISPOSAL_YEARS}년으로 계산하지만, {ymd(P.tempTwoHomesFrom)} 이후에 새집을 취득한다면 계약 전에 위택스·관할 세무과에서 시행 여부를 확인하고
        서울 전역처럼 조정대상지역에 있는 종전 주택은 {P.tempTwoHomesYears}년 안에 처분하는 것을 기준으로 계획하는 편이 안전합니다.
      </p>
      <Callout tone="warn" title="조정대상지역은 계약 직전에 다시 확인">
        2025년 10월 15일 주택시장 안정화 대책으로 서울 25개 자치구 전역과 경기 12곳(과천, 광명, 성남 분당·수정·중원, 수원 영통·장안·팔달, 안양 동안, 용인 수지, 의왕, 하남)이
        조정대상지역으로 지정됐습니다. 지정·해제는 수시로 바뀌므로 <a href="https://www.molit.go.kr/policy/stable/sta_b_03.jsp" target="_blank" rel="noopener noreferrer">국토교통부 지정 현황<span className="srOnly">(새 창)</span></a>에서 확인하세요.
        지정 공고 전에 매매계약(분양계약 포함)을 맺고 계약금을 낸 사실이 증빙되면 지정 전에 취득한 것으로 봅니다(지방세법 §13의2).
      </Callout>

      <h2 className="g-h2">증여·상속·신축은 세율도, 과세표준도 다릅니다</h2>
      <p className="g-p">
        무상으로 받거나 직접 지은 부동산은 매매와 계산 방법이 다릅니다. 세율만 다른 것이 아니라 <strong>무엇을 과세표준으로 삼는지</strong>도 달라서, 같은 집이라도 취득 원인에 따라 세액이 크게 벌어집니다.
      </p>
      <h3 className="g-h3">증여 — {pct(R.gift)}, 조정대상지역 고가주택은 {pct(R.giftHeavy)}</h3>
      <p className="g-p">
        증여(상속 외 무상취득)는 지방세법 §11①2호의 {pct(R.gift)}가 표준세율이고, 2023년부터 과세표준이 시가표준액이 아닌 <strong>시가인정액</strong>(취득일 전후 매매사례가액·감정가액·공매가액, §10의2①)으로 바뀌었습니다.
        지방교육세는 ({pct(R.gift)} − {pct(R.midStandard)}) × {R.eduSharePct}% = {pct(GIFT5.educationRate)}입니다. {eok(5 * E)}원 아파트({NATIONAL_HOUSING_AREA_M2}㎡ 이하)를 증여받으면 취득세 {won(GIFT5.acquisitionTax)} + 지방교육세 {won(GIFT5.educationTax)} = <strong>{won(GIFT5.total)}</strong>입니다.
      </p>
      <p className="g-p">
        조정대상지역에 있는 시가표준액 {eok(GIFT_HOUSE_HEAVY_MIN_STD_VALUE)}원 이상 주택을 증여받으면 §13의2②에 따라 {pct(R.giftHeavy)}로 중과되어 같은 {eok(5 * E)}원 기준 {won(GIFT5H.total)}이 됩니다. 이때 {eok(GIFT_HOUSE_HEAVY_MIN_STD_VALUE)}원은 증여가액이 아니라 공시가격 기준이고,
        수증자의 주택 수는 따지지 않습니다. 다만 <strong>1세대 1주택자가 배우자나 직계존비속에게 증여</strong>하는 경우에는 중과하지 않습니다(시행령 §28의6). 대출 등 채무를 함께 넘기는 부담부증여는 채무액만큼을 유상취득으로 보아 매매 세율을 적용하므로 이 계산기의 증여 결과와 다릅니다.
      </p>
      <h3 className="g-h3">상속 — {pct(R.inherit)}, 무주택 가구는 {pct(R.inheritOneHouse)}</h3>
      <p className="g-p">
        상속은 §11①1호에 따라 농지 {pct(R.inheritFarmland)}, 그 밖의 부동산 {pct(R.inherit)}입니다. 과세표준은 시가가 아니라 <strong>시가표준액</strong>(공동주택 공시가격 등, §10의2②1호)이어서 증여보다 과세표준 자체가 낮게 잡히는 경우가 많습니다.
        공시가격 {eok(5 * E)}원 주택({NATIONAL_HOUSING_AREA_M2}㎡ 이하)은 취득세 {won(INH5.acquisitionTax)} + 지방교육세 {won(INH5.educationTax)} = {won(INH5.total)}입니다.
        상속인과 같은 세대가 상속주택 외에 주택이 없어 상속으로 1가구 1주택이 되면 §15①2호 가목 특례로 세율이 {pct(R.inheritOneHouse)}가 되어 <strong>{won(INH5ONE.total)}</strong>으로 줄어듭니다. 공동상속이면 지분별로 나눠 계산하고, 특례 요건(1가구 1주택 판정)은 지방세법 시행령 §29가 정합니다.
      </p>
      <h3 className="g-h3">신축(원시취득) — {pct(R.original)}</h3>
      <p className="g-p">
        건물을 새로 짓는 원시취득은 §11①3호의 {pct(R.original)}이고 과세표준은 공사비·설계비·감리비 등 사실상 취득가격(§10의4)입니다. 원시취득은 §13의2 다주택 중과 대상이 아니어서
        이미 집이 여러 채인 사람이 단독주택을 지어도 {pct(R.original)}가 적용됩니다. 신축 비용 {eok(5 * E)}원 주택은 {NATIONAL_HOUSING_AREA_M2}㎡ 이하면 {won(ORIG5.total)}, 초과면 {won(ORIG5_85.total)}입니다. 땅을 사는 것은 별개의 유상취득(토지 {pct(R.nonHouse)})이라는 점도 함께 계산해야 합니다.
      </p>
      <DataFigure n={4} title={`${eok(5 * E)}원 주택, 취득 원인만 바꿨을 때`} unit="단위: 원" source={<>자료: 지방세법 §11①1~3·8호, §13의2②, §15①, §151 — Youtil 계산 엔진에서 생성. 과세표준은 원인마다 다르므로 같은 금액을 넣은 단순 비교</>}>
        <table>
          <thead>
            <tr><th scope="col">취득 원인</th><th scope="col" className="r">합계 세율</th><th scope="col" className="r">합계 (85㎡ 이하)</th><th scope="col" className="r">합계 (85㎡ 초과)</th></tr>
          </thead>
          <tbody>
            {CAUSE5.map((c, i) => (
              <tr key={c.key}>
                <th scope="row">{c.label}</th>
                <td className="r">{pct(c.b.totalRate)}</td>
                <td className="r em">{num(c.b.total)}</td>
                <td className="r">{num(CAUSE5_85[i].b.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2 className="g-h2">생애최초 주택 구입 감면 — 최대 {man(FH.caps.general)}·{man(FH.caps.smallCapital)}, 교육세도 함께 줄어듭니다</h2>
      <p className="g-p">
        지방세특례제한법 §36의3은 <strong>본인과 배우자 모두 주택을 소유한 적이 없는 사람</strong>이 거주할 목적으로 취득당시가액 {eok(FH.maxPrice)}원 이하 주택을 유상으로 살 때 취득세를 깎아 줍니다.
        소득 요건은 없습니다. 취득세 산출세액이 한도 이하면 전액 면제, 넘으면 한도만큼 공제하는 방식이며, 2026년 1월 1일 시행 개정으로 적용 기한이 {ymd(FH.sunset)}까지 연장됐습니다.
      </p>
      <p className="g-p">
        요건은 <strong>본인과 배우자</strong>만 봅니다. 부모 등 같은 세대의 다른 가족이 집을 가지고 있어도 감면 대상이 될 수 있습니다. 헷갈리는 지점은 세율입니다. 취득세율은 세대 기준 주택 수로 정하고,
        30세 미만 미혼 자녀는 부모와 따로 살아도 원칙적으로 같은 세대로 봅니다(지방세법 시행령 §28의3). 그래서 부모 집이 1채 있는 세대에서 비조정지역 {eok(5 * E)}원 주택을 처음 사면
        세대 2주택이어도 표준세율 {pct(FAM2.acquisitionRate)}{FAM2_OK ? <>가 적용되어 감면 후 {won(FAM2_FIRST.after.total)}을 내지만</> : <>가 적용되지만</>}, 같은 집이 조정대상지역이면 {pct(FAM2_ADJ.acquisitionRate)} 중과로 {won(FAM2_ADJ.total)}이 됩니다.
        중과 산출세액에 감면이 어떻게 적용되는지는 확인하지 못해, 이 계산기는 중과세율이 적용되는 취득에는 생애최초 감면을 계산하지 않고 그 사실만 알려 줍니다.
      </p>
      <ul className="g-list">
        <li><strong>일반 한도 {man(FH.caps.general)}</strong> — 아파트를 포함한 대부분의 주택.</li>
        <li><strong>소형주택 {man(FH.caps.smallCapital)}</strong> — 전용 {FH.smallMaxAreaM2}㎡ 이하이면서 취득당시가액이 수도권 {eok(FH.smallMaxPrice.capital)}원·비수도권 {eok(FH.smallMaxPrice.nonCapital)}원 이하인 연립·다세대·다가구·도시형생활주택(아파트 제외).</li>
        <li><strong>인구감소지역 {man(FH.caps.depopulation)}</strong> — 2026년 1월 1일 시행 개정으로 기존 {man(FH.caps.general)}에서 늘어났습니다. 수도권 인구감소지역(인천 강화·옹진, 경기 연천·가평)도 포함되는지와 가액 요건은 이 페이지에서 확인하지 못했으니 위택스·관할 세무과에 확인하세요.</li>
      </ul>
      <p className="g-p">
        감면은 취득세에만 적용되는 것 같지만, 지방교육세도 취득세 감면율만큼 줄어듭니다(지방세법 §151①1호). {eok(5 * E)}원 주택이면 취득세 {won(FIVE.acquisitionTax)}에서 {won(FIRST5.acquisitionRelief)}이 빠지고
        지방교육세도 {won(FIVE.educationTax)}에서 {won(FIRST5.after.educationTax)}으로 줄어, 납부액이 {won(FIVE.total)} → <strong>{won(FIRST5.after.total)}</strong>이 됩니다. 실제 절감액은 {won(FIRST5.netRelief)}입니다.
      </p>
      <p className="g-p">
        전용 {NATIONAL_HOUSING_AREA_M2}㎡를 넘는 주택은 한 가지를 더 봐야 합니다. 농어촌특별세법 §5①1호는 감면받은 취득세의 {FH.ruralOnReliefPct}%를 농어촌특별세로 걷고, {NATIONAL_HOUSING_AREA_M2}㎡ 이하 주택만 이를 비과세합니다.
        그래서 {eok(7 * E)}원·{NATIONAL_HOUSING_AREA_M2}㎡ 초과 주택은 {won(SEVEN85.total)}에서 취득세 {won(FIRST7_85.acquisitionRelief)}·교육세 {won(FIRST7_85.educationRelief)}이 줄지만 감면분 농특세 {won(FIRST7_85.ruralOnRelief)}이 붙어 <strong>약 {won(FIRST7_85.after.total)}</strong>을 내는 것으로 계산됩니다.
        이 금액은 추정입니다. 계산기는 본세분 농어촌특별세(과세표준의 {pct(R.ruralBase)})를 감면과 관계없이 그대로 두는데, 농어촌특별세법 §5①6호는 그 기준을 &lsquo;지방세법·지방세특례제한법 등에 따라 산출한 취득세액&rsquo;으로 정하고 있어
        본세분도 감면에 맞춰 줄어드는 방식으로 계산될 수 있습니다. 감면분 농특세 산정 방식은 신고 전 위택스 모의계산으로 꼭 확인하세요.
      </p>
      <DataFigure n={5} title="생애최초 감면 전후 (1주택·85㎡ 이하·일반 한도)" unit="단위: 원" source={<>자료: 지방세특례제한법 §36의3, 지방세법 §151①1호 — Youtil 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">취득가액</th><th scope="col" className="r">감면 전 합계</th><th scope="col" className="r">줄어드는 세액</th><th scope="col" className="r">감면 후 합계</th></tr>
          </thead>
          <tbody>
            {FIRST_ROWS.map(row => (
              <tr key={row.price}>
                <th scope="row">{eok(row.price)}</th>
                <td className="r">{num(row.b.total)}</td>
                <td className="r">−{num(row.r.netRelief)}</td>
                <td className="r em">{num(row.r.after.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        감면은 신고할 때 신청해야 적용되고, 요건을 지키지 못하면 추징됩니다. 취득일부터 {FH.residenceStartMonths}개월 안에 전입해 상시 거주를 시작해야 하고, {FH.residenceStartMonths}개월 안에 다른 주택을 추가로 사면 안 되며(상속 제외),
        상시 거주 {FH.residenceYears}년이 되기 전에 팔거나 증여하거나 임대 등 다른 용도로 쓰면 감면세액을 다시 냅니다(§36의3④).
      </p>
      <Callout tone="note" title="개편안은 아직 반영하지 않았습니다">
        행정안전부는 {ymd(P.announced)} 「2026년 지방세제 개편안」에서 생애최초 감면 대상에 주거용 오피스텔을 넣고, {P.firstHomeYouthUnderAge}세 미만 청년의 한도를 {man(FH.caps.general)}에서 {man(P.firstHomeYouthCap)}으로 올리는 안을 발표했습니다.
        세부 요건은 법안이 확정돼야 알 수 있습니다. 국회 심의를 거쳐 법이 바뀌면 계산 엔진과 이 설명을 함께 고치며, 그 전까지는 현행법 기준으로 계산합니다.
      </Callout>

      <h2 className="g-h2">신고·납부 기한과 위택스로 검산하는 법</h2>
      <p className="g-p">
        취득세는 스스로 계산해 신고·납부하는 세금입니다(지방세법 §20①). 매매·신축은 <strong>취득일부터 {ACQ_FILING_DEADLINE.purchaseDays}일</strong>, 증여는 <strong>취득일이 속하는 달의 말일부터 {ACQ_FILING_DEADLINE.giftMonths}개월</strong>,
        상속은 <strong>상속개시일이 속하는 달의 말일부터 {ACQ_FILING_DEADLINE.inheritMonths}개월</strong>(외국 거주 상속인이 있으면 {ACQ_FILING_DEADLINE.inheritAbroadMonths}개월) 안에 해야 합니다.
        매매의 취득일은 보통 잔금일이고, 잔금 전에 등기를 먼저 하면 등기일입니다. 기한을 넘기면 무신고 가산세와 하루 단위로 붙는 납부지연 가산세(지방세기본법 §53·§55)가 더해집니다.
      </p>
      <p className="g-p">
        실제 신고는 부동산 소재지 시·군·구에 하며, <a href="https://www.wetax.go.kr" target="_blank" rel="noopener noreferrer">위택스(wetax.go.kr)<span className="srOnly">(새 창)</span></a>에서 온라인 신고와 모의계산을 할 수 있습니다(서울은 이택스도 가능).
        이 계산기로 대략의 금액과 중과·감면 여부를 먼저 파악한 뒤, 같은 조건을 위택스 모의계산에 넣어 세목별 금액이 일치하는지 대조하는 순서를 권합니다. 주택 수 산정 제외, 감면 중복, 시가인정액 판단처럼 이 계산기가 사용자 입력에 맡기는 부분은 위택스·세무과 판단이 기준입니다.
      </p>

      <h2 className="g-h2">이 계산기가 판단하지 않는 예외</h2>
      <ul className="g-list">
        <li><strong>국민주택규모</strong> — 농어촌특별세 비과세 기준 {NATIONAL_HOUSING_AREA_M2}㎡는 수도권·도시지역 기준이며, 수도권 밖 읍·면 지역은 100㎡까지 비과세될 수 있습니다. 해당하면 &lsquo;{NATIONAL_HOUSING_AREA_M2}㎡ 초과&rsquo;를 끄고 계산하세요.</li>
        <li><strong>고급주택·사치성 재산</strong>(지방세법 §13⑤)과 <strong>법인의 과밀억제권역 안 취득·신증축</strong>(§13①·②) 중과는 반영하지 않습니다.</li>
        <li><strong>농지 감면</strong> — 2년 이상 자경한 농민의 농지 취득 등 지방세특례제한법상 농지 감면은 반영하지 않습니다.</li>
        <li><strong>다른 주택 감면</strong> — 출산·양육 주택 감면(지방세특례제한법 §36의5) 등 생애최초 외 감면은 계산하지 않습니다.</li>
        <li><strong>중과 취득의 생애최초 감면</strong> — 부모 주택 등으로 세대 주택 수가 늘어 중과세율이 적용되면 감면을 계산하지 않고 안내만 합니다.</li>
        <li><strong>주택 수 판정</strong> — 입력한 주택 수를 그대로 씁니다. 상속주택·저가주택 등 제외 대상은 빼고 입력해야 합니다.</li>
        <li><strong>사후 추징</strong> — 일시적 2주택 미처분, 생애최초 거주 요건 위반 시의 추징세액과 가산세는 계산하지 않습니다.</li>
      </ul>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '국가법령정보센터 지방세법', href: 'https://www.law.go.kr/법령/지방세법' },
          { label: '지방세법 제13조의2(법인의 주택 취득 등 중과)', href: 'https://www.law.go.kr/법령/지방세법/제13조의2' },
          { label: '지방세법 제151조(지방교육세 과세표준과 세율)', href: 'https://www.law.go.kr/법령/지방세법/제151조' },
          { label: '농어촌특별세법 제5조(과세표준과 세율)', href: 'https://www.law.go.kr/법령/농어촌특별세법/제5조' },
          { label: '행정안전부 보도자료 — 지방 저가주택 취득세 중과 기준 완화', href: 'https://www.mois.go.kr/frt/bbs/type010/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000008&nttId=117228' },
          { label: '국토교통부 조정대상지역 지정 현황', href: 'https://www.molit.go.kr/policy/stable/sta_b_03.jsp' },
        ]}
      >
        이 계산은 2026년 9월 시행 법령과 입력한 조건을 기준으로 한 <strong>추정치</strong>입니다. 주택 수·조정대상지역·과세표준(시가인정액·시가표준액)의 최종 판단과
        감면 적용 여부는 부동산 소재지 시·군·구청 세무과가 정하며, 신고 전 위택스 모의계산으로 확인하세요.
      </Disclaimer>

      <RelatedTools
        items={[
          { href: '/tools/finance/real-estate', desc: '취득세 포함 자기자본 수익률' },
          { href: '/tools/finance/property-holding-tax', desc: '산 다음 해부터 내는 재산세·종부세' },
          { href: '/tools/finance/capital-gains-tax', desc: '팔 때 내는 양도소득세' },
          { href: '/tools/finance/inheritance', desc: '증여·상속 받을 때 국세' },
          { href: '/tools/finance/dsr', desc: '주택담보대출 한도' },
          { href: '/tools/finance/auction', desc: '경매 낙찰가 기준 총비용' },
        ]}
      />
    </ToolPage>
  )
}
