import Link from 'next/link'
import CapitalGainsClient from './CapitalGainsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { BRACKETS_2026, marginalRate } from '@/lib/krIncomeTax'
import {
  calcCapitalGains, ltsdTable1Rate, ltsdTable2HoldRate, ltsdTable2LiveRate,
  CG_HIGH_PRICE_THRESHOLD, CG_BASIC_DEDUCTION, type CapitalGainsInput,
} from './capitalGainsUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/capital-gains-tax',
  title: '1주택 양도소득세 계산기 — 12억 비과세·장기보유공제 2026',
  description:
    '1세대 1주택 양도세를 2026년 국세청 기준으로. 12억 비과세·고가주택 안분, 장기보유특별공제(최대 80%), 단기 중과세율까지 단계별 계산.',
  keywords: [
    '1주택 양도소득세',
    '양도세 계산기',
    '12억 비과세',
    '장기보유특별공제',
    '고가주택 양도세',
    '1세대1주택 비과세',
    '양도소득세 계산',
    '부동산 양도세',
  ],
})

const strong: React.CSSProperties = { color: 'var(--text)' }
const formulaBox: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '14px 16px',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.9,
  margin: '0 0 16px',
}

/* ── 가이드 표·예시: 모두 계산기와 같은 엔진(capitalGainsUtils · lib/krIncomeTax)에서 빌드 시점 생성 ── */
const EOK = 100_000_000
const MAN = 10_000
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`
const eok = (n: number) => `${(n / EOK).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}억`
/** 1억 이상은 'X억 Y만원', 미만은 'Y만원' */
const manwon = (n: number) => {
  const totalMan = Math.round(n / MAN)
  const e = Math.floor(totalMan / 10_000)
  const m = totalMan % 10_000
  if (e === 0) return `${m.toLocaleString('ko-KR')}만원`
  return m === 0 ? `${e}억원` : `${e}억 ${m.toLocaleString('ko-KR')}만원`
}
const TH = CG_HIGH_PRICE_THRESHOLD

/** 표 1 — 양도가액별 과세대상 비율 (A − 12억) ÷ A */
const APPORTION_ROWS = [12, 13, 15, 20, 30, 50].map(e => {
  const A = e * EOK
  return { A, ratio: A > TH ? (A - TH) / A : 0 }
})

/** 표 2 — 장기보유특별공제율 (보유·거주 만 연수) */
const LTSD_YEARS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15]
const LTSD_ROWS = LTSD_YEARS.map(y => ({ y, t1: ltsdTable1Rate(y), h: ltsdTable2HoldRate(y), l: ltsdTable2LiveRate(y) }))

/** 표 4 — 같은 매매(15억 양도·10억 취득)의 조건별 세액 */
const EX_BASE: CapitalGainsInput = {
  salePrice: 15 * EOK, acquirePrice: 10 * EOK, expenses: 0,
  holdYears: 10, liveYears: 10, oneHouse: true, liveReqMet: true, propertyType: 'house',
}
const SCENARIOS: { label: string; sub: string; input: CapitalGainsInput }[] = [
  { label: '1주택 · 보유 10년 · 거주 10년', sub: '고가주택 안분 + 표2 80%', input: EX_BASE },
  { label: '1주택 · 보유 5년 · 거주 5년', sub: '표2 보유 20% + 거주 20%', input: { ...EX_BASE, holdYears: 5, liveYears: 5 } },
  { label: '1주택 · 보유 10년 · 거주 없음', sub: '비조정 취득 — 비과세는 되지만 표1', input: { ...EX_BASE, liveYears: 0 } },
  { label: '1주택 · 보유 10년 · 거주요건 미충족', sub: '조정 취득 — 비과세 불가, 전체 차익 과세', input: { ...EX_BASE, liveYears: 0, liveReqMet: false } },
  { label: '1주택 · 보유 1년 6개월', sub: '2년 미만 — 단기 60%', input: { ...EX_BASE, holdYears: 1.5, liveYears: 1.5 } },
]
const SCEN_ROWS = SCENARIOS.map(sc => ({ ...sc, r: calcCapitalGains(sc.input) }))
const EX_A = SCEN_ROWS[0].r
const EX_B = SCEN_ROWS[2].r
const EX_D = SCEN_ROWS[3].r

const FAQ_LD = [
  {
    q: '1주택인데 12억 넘으면 양도세 얼마나 나오나요?',
    a: '양도가액이 12억을 넘는 고가주택은 비과세가 아니라 <strong>12억 초과분에 대해서만</strong> 과세합니다. 과세대상 양도차익 = 전체 차익 × (양도가액 − 12억) ÷ 양도가액으로 안분합니다. 예로 <strong>15억에 팔아 차익 5억</strong>이면 과세대상은 5억 × (3억 ÷ 15억) = <strong>1억</strong>입니다. 여기에 장기보유특별공제(최대 80%)와 기본공제 250만원을 빼고 기본세율을 적용하므로, 장기 보유·거주한 1주택이면 실제 세액은 크게 줄어듭니다.',
  },
  {
    q: '1세대 1주택 비과세 요건은 무엇인가요?',
    a: '기본 요건은 양도일 현재 1세대가 국내에 1주택을 보유하고, 그 주택의 <strong>보유기간이 2년 이상</strong>인 경우입니다. 2017년 8월 3일 이후 취득한 주택이 취득 당시 <strong>조정대상지역</strong>이었다면 보유 2년에 더해 <strong>거주 2년</strong>도 충족해야 합니다(비조정지역 취득분은 거주요건 없음). 이 요건을 갖추면 양도가액 12억 이하는 전액 비과세, 12억 초과는 초과분만 과세합니다. 일시적 2주택·상속·동거봉양 등 특례는 별도 판단이 필요합니다.',
  },
  {
    q: '장기보유특별공제 80%는 어떤 조건인가요?',
    a: '1세대 1주택의 장기보유특별공제(표2)는 <strong>보유기간</strong>과 <strong>거주기간</strong>을 각각 연 4%씩(각 최대 40%) 따져 합산합니다. 따라서 <strong>보유 10년 + 거주 10년</strong>이면 40% + 40% = <strong>80%</strong>로 최대치입니다. 거주를 적게 했다면 보유분만 인정되어 공제율이 낮아집니다. 다주택·일반 부동산은 표1(연 2%, 최대 30%)이 적용됩니다.',
  },
  {
    q: '취득세·중개수수료도 경비로 빼주나요?',
    a: '네. <strong>취득세·등록세, 법무사 비용, 취득·양도 시 중개수수료</strong>는 필요경비로 인정됩니다. 또 발코니 확장·새시 교체·난방시설 교체 같은 <strong>자본적지출</strong>도 경비입니다. 다만 도배·장판·페인트 같은 수익적지출(원상회복·소모성 수선)은 인정되지 않습니다. 경비가 클수록 양도차익이 줄어 세액이 낮아지므로 증빙(세금계산서·계좌이체)을 보관하세요.',
  },
  {
    q: '1년 안에 팔면 양도세율이 얼마인가요?',
    a: '주택·조합원입주권을 <strong>보유 1년 미만</strong>에 팔면 단기 중과로 세율 <strong>70%</strong>, <strong>1년 이상 2년 미만</strong>이면 <strong>60%</strong>가 적용됩니다. 분양권은 보유 1년 미만 70%, 1년 이상이면 보유기간과 관계없이 <strong>60%</strong> 단일세율입니다. 주택·입주권은 만 2년 이상 보유해야 6~45% 기본 누진세율과 비과세 자격이 적용되고, 장기보유특별공제는 보유 3년(거주분 특례는 거주 2년)부터 따질 수 있습니다. 단기 매도는 세 부담이 매우 크므로 보유기간 관리가 중요합니다.',
  },
  {
    q: '양도소득 기본공제 250만원은 매년 받나요?',
    a: '네. 양도소득 기본공제 <strong>연 250만원</strong>은 사람별로 1년에 한 번 적용됩니다. 같은 해에 부동산을 여러 건 양도해도 합쳐서 250만원만 공제되며(주식·파생상품 등은 그룹별로 따로 250만원), 해가 바뀌면 다시 250만원이 적용됩니다. 따라서 양도 시기를 연도별로 나누면 기본공제를 두 번 활용할 수 있습니다. 공제는 양도소득금액(장기보유공제 후)에서 차감해 과세표준을 만듭니다.',
  },
  {
    q: '양도소득세에 지방소득세도 따로 붙나요?',
    a: '네. 산출된 양도소득세의 <strong>10%</strong>가 지방소득세로 추가됩니다. 예로 양도소득세가 1,000만원이면 지방소득세 100만원이 더해져 총 1,100만원을 냅니다. 양도소득세는 양도일이 속한 달의 말일부터 2개월 이내 예정신고·납부하고, 지방소득세는 함께 신고합니다. 이 계산기의 총 납부세액은 양도세와 지방소득세를 합한 금액입니다.',
  },
  {
    q: '거주는 안 하고 보유만 했으면 공제가 어떻게 되나요?',
    a: '1세대 1주택이라도 <strong>거주를 하지 않았다면</strong> 장기보유특별공제 표2(최대 80%)가 아니라 <strong>표1(연 2%, 최대 30%)</strong>이 적용됩니다. 또 취득 당시 조정대상지역이었던 주택은 거주 2년을 못 채우면 비과세 자체가 불가합니다. 즉 거주 여부가 비과세 판정과 공제율 모두에 영향을 줍니다. 이 계산기에서 거주요건 체크를 해제하면 표1 기준으로 다시 계산됩니다.',
  },
]

export default function CapitalGainsTaxPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/capital-gains-tax">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />1주택 양도소득세 계산기
      </h1>
      <p className="tp-lead">
        1세대 1주택 양도세를 <strong style={strong}>2026년 국세청 기준</strong>으로 단계별로 추정합니다. 12억 비과세·고가주택 안분, 장기보유특별공제(최대 80%), 단기 중과세율까지 한 번에 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년"
        basis="2026년 국세청 양도소득세 기준 · 12억 비과세·장기보유특별공제·단기 중과세율 반영"
        sources={[
          { label: '국세청 양도소득세(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '소득세법 §89·§95·§104 (국가법령정보센터)', href: 'https://www.law.go.kr/법령/소득세법' },
          { label: '소득세법 시행령 §154·§162', href: 'https://www.law.go.kr/법령/소득세법시행령' },
        ]}
      />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '국세청 양도소득세(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '국세청 홈택스', href: 'https://hometax.go.kr/' },
          { label: '법제처 소득세법', href: 'https://www.law.go.kr/' },
        ]}
      >
        본 계산기는 1세대 1주택 양도소득세를 2026년 국세청 기준으로 추정한 참고용 결과입니다. 비과세 요건 충족·고가주택 안분·장기보유특별공제 적용은 취득 시점 조정대상지역 지정, 세대·거주 요건, 부수토지·겸용주택·일시적 2주택 등 개별 사정에 따라 달라지며, 본 도구는 그 적용 가능 여부를 판정·확정하지 않습니다(특히 비과세는 안내일 뿐 확정 아님). 다주택 중과·분양권·조합원입주권의 특수 케이스는 단순화되어 있습니다. 정확한 세액과 비과세 판정은 관할 세무서·세무사 또는 홈택스 모의계산으로 확인하세요.
      </Disclaimer>

      <CapitalGainsClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />

      <h2 className="g-h2">1세대 1주택 양도세, 언제 비과세되나</h2>
      <p className="g-p">
        1세대가 국내에 주택 1채만 보유하고 그 주택을 <strong>2년 이상 보유</strong>한 뒤 팔면 양도소득세가 비과세됩니다(소득세법 §89①3호, 시행령 §154). 2017년 8월 3일 이후 취득한 주택이 취득 당시 <strong>조정대상지역</strong>이었다면 보유 2년에 더해 <strong>거주 2년</strong>까지 채워야 하고, 비조정지역에서 취득했다면 거주요건 없이 보유 2년만으로 됩니다. 조정대상지역 여부는 파는 시점이 아니라 <strong>살 때</strong>를 기준으로 보므로, 그 뒤 지정이 풀렸어도 거주요건은 남습니다.
      </p>
      <p className="g-p">
        비과세는 양도가액 <strong>{eok(TH)}원 이하</strong>까지만 전액 적용됩니다. {eok(TH)}을 넘는 고가주택은 비과세가 아니라 초과분만 과세하므로, 같은 1주택이라도 {eok(TH)} 경계에서 세 부담이 갈립니다. 반대로 요건을 하나라도 못 채우면 양도가액이 {eok(TH)} 이하여도 전체 차익이 과세됩니다.
      </p>
      <Callout tone="warn" title="'1주택'은 세대 전체로 셉니다">
        주택 수는 본인 명의만이 아니라 같은 세대(배우자, 함께 사는 직계존비속 등)가 가진 주택을 모두 합쳐 판정합니다. 조합원입주권과 2021년 이후 취득한 분양권도 주택 수에 들어갑니다. 이사·상속·혼인·동거봉양으로 잠시 2주택이 된 경우의 특례는 요건이 까다로워 이 계산기가 판정하지 않으니, 홈택스 모의계산이나 세무사로 확인하세요.
      </Callout>

      <h2 className="g-h2">{eok(TH)} 초과 고가주택 — 안분 산식</h2>
      <p className="g-p">
        양도가액이 {eok(TH)}을 넘으면 전체 양도차익 중 <strong>{eok(TH)} 초과분 비율</strong>만 과세대상이 됩니다(시행령 §160). 산식은 다음과 같습니다.
      </p>
      <div style={formulaBox}>
        과세대상 양도차익 = 전체 양도차익 × <strong style={{ color: 'var(--accent-ink)' }}>(양도가액 − {eok(TH)}) ÷ 양도가액</strong>
      </div>
      <p className="g-p">
        예로 <strong>15억에 팔아 차익이 5억</strong>이면, 과세대상 = 5억 × (15억 − 12억) ÷ 15억 = 5억 × 0.2 = <strong>1억원</strong>입니다. 나머지 4억은 비과세입니다. 이 1억에 다시 장기보유특별공제와 기본공제를 적용해 세액을 구합니다. 비율은 차익과 관계없이 양도가액만으로 정해지므로, 아래 표로 내 매도가의 과세 비율을 바로 확인할 수 있습니다.
      </p>
      <DataFigure n={1} title="양도가액별 과세대상 비율 (1세대 1주택 비과세 요건 충족 시)" source={<>자료: 소득세법 시행령 §160① — 계산기 엔진(capitalGainsUtils)에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">양도가액</th><th scope="col" className="r">과세되는 차익 비율</th><th scope="col" className="r">차익 5억일 때 과세대상</th></tr>
          </thead>
          <tbody>
            {APPORTION_ROWS.map(r => (
              <tr key={r.A}>
                <th scope="row">{eok(r.A)}원</th>
                <td className="r">{r.ratio === 0 ? '0% (전액 비과세)' : pct(r.ratio)}</td>
                <td className="r em">{r.ratio === 0 ? '—' : manwon(5 * EOK * r.ratio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2 className="g-h2">장기보유특별공제 — 표1 vs 표2</h2>
      <p className="g-p">
        3년 이상 보유한 주택은 양도차익에서 일정 비율을 공제합니다(소득세법 §95②). 일반 부동산·다주택은 <strong>표1(연 2%, 최대 30%)</strong>, 비과세 요건을 갖춘 1세대 1주택 중 2년 이상 거주한 경우는 <strong>표2</strong>로 보유분과 거주분을 각각 따져 합산하며 <strong>최대 80%</strong>까지 공제합니다.
      </p>
      <DataFigure n={2} title="보유·거주 기간별 장기보유특별공제율" source={<>자료: 소득세법 §95② 표1·표2 — 계산기 엔진에서 생성. 연수는 만 연수(소수점 버림)</>}>
        <table>
          <thead>
            <tr><th scope="col">기간</th><th scope="col" className="r">표1 (일반·다주택)</th><th scope="col" className="r">표2 보유분</th><th scope="col" className="r">표2 거주분</th></tr>
          </thead>
          <tbody>
            {LTSD_ROWS.map(r => (
              <tr key={r.y}>
                <th scope="row">{r.y === 15 ? '15년 이상' : `${r.y}년`}</th>
                <td className="r">{r.t1 === 0 ? '—' : pct(r.t1)}</td>
                <td className="r">{r.h === 0 ? '—' : pct(r.h)}</td>
                <td className="r em">{r.l === 0 ? '—' : pct(r.l)}{r.y === 2 && <small>보유 3년 이상일 때</small>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        표2는 보유분(최대 40%)과 거주분(최대 40%)을 더해 합계 80%가 한도이고, 10년 이상이면 두 칸 모두 한도에 닿습니다. 거주 2~3년 구간의 8%는 보유가 3년 이상일 때만 인정되는 특례입니다. 거주기간이 2년 미만이면 표2를 쓸 수 없어 표1로 떨어집니다. 보유·거주 모두 10년이면 {pct(ltsdTable2HoldRate(10) + ltsdTable2LiveRate(10))}이지만, 같은 10년 보유라도 거주가 2년 미만이면 {pct(ltsdTable1Rate(10))}로 줄어듭니다.
        공제율은 &lsquo;X년 이상 X+1년 미만&rsquo; 구간으로 매겨지므로, 보유 9년 11개월은 9년 구간입니다. 계산기도 입력한 연수의 소수점을 버리고 구간을 찾습니다.
      </p>

      <h2 className="g-h2">단기 보유 중과세율과 기본세율</h2>
      <p className="g-p">
        보유기간이 짧으면 세율이 크게 올라갑니다(소득세법 §104①). 주택·조합원입주권을 <strong>1년 미만</strong> 보유 후 팔면 <strong>70%</strong>, <strong>1년 이상 2년 미만</strong>이면 <strong>60%</strong>가 적용됩니다. 분양권은 1년 미만 70%, 1년 이상이면 기간과 관계없이 60%입니다. 주택·입주권은 만 2년 이상 보유해야 아래 6~45% 기본 누진세율로 과세되고 비과세 자격이 생기며, 장기보유특별공제는 보유 3년부터(거주분 특례는 거주 2년부터) 의미가 있습니다.
      </p>
      <DataFigure n={3} title="양도소득세 기본세율 (종합소득세율과 같은 표)" unit="누진공제: 원" source={<>자료: 소득세법 §55①·§104①1호 — lib/krIncomeTax 단일 소스에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">과세표준</th><th scope="col" className="r">세율</th><th scope="col" className="r">누진공제</th></tr>
          </thead>
          <tbody>
            {BRACKETS_2026.map((b, i) => (
              <tr key={i}>
                <th scope="row">{b.upTo === Infinity ? `${manwon(BRACKETS_2026[i - 1].upTo)} 초과` : `${manwon(b.upTo)} 이하`}</th>
                <td className="r em">{pct(b.rate)}</td>
                <td className="r">{b.deduction === 0 ? '—' : b.deduction.toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        기본세율은 과세표준에 세율을 곱한 뒤 누진공제를 빼는 방식입니다. 이 계산기는 양도 1건을 가정하며 다주택 중과·비교과세는 단순화했습니다.
      </p>

      <h2 className="g-h2">양도세 4단계 따라가기</h2>
      <p className="g-p">
        양도소득세는 다음 4단계로 계산됩니다. 계산기의 세액 분해표가 이 흐름을 그대로 보여줍니다.
      </p>
      <div style={formulaBox}>
        ① 양도차익 = 양도가액 − 취득가액 − 필요경비
        <br />
        ② 양도소득금액 = 양도차익 − <strong style={{ color: 'var(--accent-ink)' }}>장기보유특별공제</strong>
        <br />
        ③ 과세표준 = 양도소득금액 − <strong style={{ color: 'var(--accent-ink)' }}>기본공제 {manwon(CG_BASIC_DEDUCTION)}</strong>
        <br />
        ④ 산출세액 = 과세표준 × 세율 − 누진공제 → <strong style={{ color: 'var(--accent-ink)' }}>+ 지방소득세 10%</strong>
      </div>
      <p className="g-p">
        고가주택이면 ①에서 {eok(TH)} 안분을 먼저 거치고, 단기 보유면 ④에서 70/60% 단일세율이 들어갑니다. 아래 표는 <strong>15억에 팔고 10억에 샀던(차익 5억)</strong> 같은 집을 조건만 바꿔 계산기에 넣은 결과입니다.
      </p>
      <DataFigure n={4} title="같은 매매(15억 양도·10억 취득)의 조건별 세액" unit="단위: 원" source={<>자료: 계산기 엔진(capitalGainsUtils)으로 생성 — 필요경비 0원, 지방소득세 포함</>}>
        <table>
          <thead>
            <tr><th scope="col">조건</th><th scope="col" className="r">과세대상 차익</th><th scope="col" className="r">장기보유공제</th><th scope="col" className="r">과세표준</th><th scope="col" className="r">총 납부세액</th></tr>
          </thead>
          <tbody>
            {SCEN_ROWS.map(sc => (
              <tr key={sc.label}>
                <th scope="row">{sc.label}<small>{sc.sub}</small></th>
                <td className="r">{sc.r.taxableGain.toLocaleString('ko-KR')}</td>
                <td className="r">{sc.r.ltsdRate === 0 ? '—' : pct(sc.r.ltsdRate)}</td>
                <td className="r">{sc.r.taxBase.toLocaleString('ko-KR')}</td>
                <td className="r em">{sc.r.totalTax.toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        첫 줄을 따라가 보면, 차익 5억 중 과세대상은 {manwon(EX_A.taxableGain)}이고 표2 {pct(EX_A.ltsdRate)} 공제 뒤 {manwon(EX_A.gainIncome)}, 기본공제를 빼면 과세표준 {manwon(EX_A.taxBase)}입니다. {pct(marginalRate(EX_A.taxBase))} 구간이라 산출세액 {EX_A.computedTax.toLocaleString('ko-KR')}원에 지방소득세를 더해 <strong>{EX_A.totalTax.toLocaleString('ko-KR')}원</strong>입니다.
        같은 집에 살지 않았다면(셋째 줄) 표1 {pct(EX_B.ltsdRate)}만 적용돼 약 {manwon(EX_B.totalTax)}으로 늘고, 조정대상지역에서 사서 거주요건을 못 채웠다면(넷째 줄) 비과세가 사라져 차익 전체가 과세되며 약 {manwon(EX_D.totalTax)}이 됩니다. 같은 집, 같은 차익인데 거주 여부 하나로 세액이 약 {Math.round(EX_D.totalTax / EX_A.totalTax)}배 벌어지는 셈입니다.
      </p>

      <h2 className="g-h2">보유·거주기간과 필요경비 — 입력 전에 확인할 것</h2>
      <ul className="g-list">
        <li><strong>취득일·양도일</strong>은 원칙적으로 잔금을 치른 날(대금청산일)이고, 잔금 전에 소유권이전등기를 했다면 등기접수일입니다(소득세법 §98, 시행령 §162). 계약일로 기간을 세면 2년·3년·10년 경계에서 구간이 어긋날 수 있습니다.</li>
        <li><strong>거주기간</strong>은 주민등록등본상 전입일부터 전출일까지로 봅니다(시행령 §154⑥). 실제로 살았어도 전입신고가 늦었다면 그만큼 빠집니다.</li>
        <li><strong>필요경비</strong>로는 취득세, 법무사·중개 수수료, 발코니 확장·새시·보일러 교체 같은 자본적지출이 인정됩니다. 도배·장판처럼 원상회복 성격의 수선비는 빠집니다. 영수증과 계좌이체 내역이 있어야 인정받기 쉽습니다.</li>
        <li><strong>상속·증여받은 주택</strong>은 취득가액이 상속·증여 당시 평가액이고 보유기간 계산도 달라질 수 있어, 이 계산기의 단순 입력으로는 정확하지 않을 수 있습니다.</li>
      </ul>

      <h2 className="g-h2">신고·납부 기한과 지방소득세</h2>
      <p className="g-p">
        양도소득세는 양도일(잔금일)이 속한 달의 말일부터 <strong>2개월 이내</strong> 예정신고·납부해야 합니다(소득세법 §105). 예로 6월에 잔금을 받으면 8월 말까지 신고합니다. 산출된 양도세의 <strong>10%</strong>가 지방소득세로 추가되어 함께 납부합니다. 1세대 1주택이라도 12억 초과로 과세분이 생기면 신고해야 하고, 같은 해에 2건 이상 양도했는데 예정신고 때 합산하지 않았다면 다음 해 5월 확정신고로 합산 정산해야 합니다. 기한을 넘기면 무신고·납부지연 가산세가 붙으므로 잔금일 기준으로 일정을 챙기세요.
      </p>

      <Faq items={FAQ_LD} />

      <AdSlot position="between-tools" minHeight={250} />

      {/* 관련 도구 */}
      <div>
        <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { href: '/tools/finance/real-estate', icon: '🏠', name: '부동산 수익률 계산기', desc: '자기자본 수익률·레버리지 효과' },
            { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '평균/통상 자동 + 퇴직소득세' },
          ].map((t, i) => (
            <Link
              key={i}
              href={t.href}
              style={{
                display: 'block',
                padding: '14px 16px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
