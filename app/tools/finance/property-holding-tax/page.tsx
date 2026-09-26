import Link from 'next/link'
import PropertyHoldingTaxClient from './PropertyHoldingTaxClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { calcHoldingTax, calcCompTax } from '@/lib/krPropertyTax'

export const metadata = buildMetadata({
  path: '/tools/finance/property-holding-tax',
  title: '주택 보유세 계산기 — 2026 재산세+종합부동산세',
  description:
    '공시가격만 넣으면 재산세·종부세·도시지역분·농특세까지 한 번에. 1세대 1주택 특례·고령 및 장기보유 세액공제 반영한 2026년 보유세 추정과 납부 시기·세부담 상한 가이드.',
  keywords: [
    '주택 보유세 계산기',
    '재산세 계산기',
    '종합부동산세 계산기',
    '보유세 계산',
    '1세대 1주택 종부세',
    '공정시장가액비율',
    '종부세 기본공제',
    '재산세 종부세 차이',
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
}

const TH: React.CSSProperties = { padding: '9px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, fontSize: 12, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '9px 10px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

/* ── 본문 표·예시 — 계산기와 같은 lib/krPropertyTax(calcHoldingTax)로 빌드 시점 계산 ── 단위: 원, 도시지역 가정 */
const EOK = 100_000_000
const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`
/** 원 → '3억 6,000만원' / '3억원' / '5,000만원' (억 단위 표기) */
const manwon = (v: number) => {
  const man = Math.round(v / 10_000)
  if (man < 10_000) return `${man.toLocaleString('ko-KR')}만원`
  const eok = Math.floor(man / 10_000)
  const rest = man % 10_000
  return rest === 0 ? `${eok.toLocaleString('ko-KR')}억원` : `${eok.toLocaleString('ko-KR')}억 ${rest.toLocaleString('ko-KR')}만원`
}
const oneHouse = (eok: number, age = 40, holdYears = 0) =>
  calcHoldingTax({ publicPrice: eok * EOK, houses: 1, oneHouse: true, urbanArea: true, holdYears, age })
const multi = (prices: number[]) =>
  calcHoldingTax({ publicPrice: 0, publicPrices: prices.map((p) => p * EOK), houses: (Math.min(3, prices.length) as 1 | 2 | 3), oneHouse: false, urbanArea: true, holdYears: 0, age: 40 })

/** 1세대 1주택 공시가격별 보유세 (세액공제 없음 / 70세·15년 보유 → 세액공제 80%) */
const ONE_HOUSE_ROWS = [3, 6, 9, 12, 15, 20, 30].map((eok) => ({ eok, base: oneHouse(eok), credit: oneHouse(eok, 70, 15) }))
/** 20억 1주택 풀이 예시 */
const EX20 = oneHouse(20)
/** 같은 예시를 중복분 산식 분자에 재산세 공정시장가액비율 60%를 넣어 계산한 값(해석 차이 비교용).
 *  20억 1주택은 재산세 특례세율(9억 이하) 대상이 아니라 본세 = 표준세율 상당액이므로 분모·부과세액 모두 baseTax */
const EX20_ALT60 = calcCompTax(20 * EOK, 1, true, 0, 40, EX20.property.baseTax, 0.6, EX20.property.baseTax)
/** 합산 공시가격이 같아도 보유 형태에 따라 */
const MIX_ROWS = [
  { label: '18억 1채 (1세대 1주택)', total: 18, r: oneHouse(18) },
  { label: '9억 × 2채', total: 18, r: multi([9, 9]) },
  { label: '6억 × 3채', total: 18, r: multi([6, 6, 6]) },
  { label: '20억 × 2채', total: 40, r: multi([20, 20]) },
  { label: '15억 + 15억 + 10억 (3채)', total: 40, r: multi([15, 15, 10]) },
]

const FAQ_LD = [
  {
    q: '공시가격 8억 1주택이면 보유세가 얼마인가요?',
    a: '1세대 1주택 기준 연간 보유세는 <strong>약 126만원</strong>입니다(도시지역분 포함). 재산세 본세 63만원에 도시지역분(과표 3.6억 × 0.14%) 약 50.4만원, 지방교육세(본세 × 20%) 12.6만원을 더해 재산세 합계 약 126만원이고, 공시 8억은 1주택 종부세 기본공제 12억 이하라 <strong>종합부동산세는 0원</strong>입니다. 공정시장가액비율은 6억 초과 1주택이라 45%가 적용됩니다.',
  },
  {
    q: '1주택 재산세는 공정시장가액비율이 얼마인가요?',
    a: '재산세 과세표준은 공시가격에 공정시장가액비율을 곱해 구합니다. 1세대 1주택은 한시 특례로 공시 <strong>3억 이하 43%, 3~6억 44%, 6억 초과 45%</strong>가 적용되고, 그 외(다주택·법인 등)는 <strong>60%</strong>입니다. 예로 공시 8억 1주택이면 8억 × 45% = 3.6억이 과세표준입니다. 비율이 낮을수록 세금이 줄어 1주택자에게 유리합니다.',
  },
  {
    q: '종합부동산세는 공시가격 얼마부터 내나요?',
    a: '주택분 종부세 기본공제는 <strong>1세대 1주택 12억원, 그 외 9억원</strong>입니다. 공시가격이 이 금액을 넘는 부분에만 과세하므로, 1주택자는 공시 <strong>12억원을 초과</strong>해야 종부세가 발생합니다. 공시 12억 이하 1주택은 재산세만 냅니다. 다주택자는 합산 공시가격이 9억을 넘으면 과세 대상입니다.',
  },
  {
    q: '부부 공동명의는 종부세 공제를 각각 받나요?',
    a: '공동명의 1주택은 지분별로 각자 과세하므로 인별 기본공제 <strong>9억원씩, 부부 합산 18억원</strong>까지 공제받을 수 있습니다. 단독명의 1세대 1주택 12억 공제보다 공제 총액이 클 수 있어 고가 주택에서 유리할 수 있습니다. 반대로 단독명의는 고령자·장기보유 세액공제(최대 80%)를 받을 수 있어, 보유자 나이·기간에 따라 유불리가 갈립니다. 공동명의 1주택자는 매년 9월 16~30일에 신청하면 단독명의처럼 1세대 1주택 특례(12억 공제·세액공제)를 적용받는 쪽을 선택할 수도 있습니다.',
  },
  {
    q: '재산세와 종부세를 둘 다 내면 이중과세 아닌가요?',
    a: '이중과세를 막기 위해 종부세 산출세액에서 <strong>같은 과세대상에 이미 부과된 재산세 상당액을 공제</strong>합니다. 즉 종부세는 재산세를 차감한 차액만 부담하는 구조라 이중과세가 아닙니다. 본 계산기는 종부세법 시행령의 비율식 — 부과된 재산세 × (종부세 과세표준 × 재산세 공정시장가액비율 × 재산세 표준세율) ÷ 표준세율로 계산한 재산세 상당액 — 으로 중복분을 계산합니다. 1세대 1주택은 이 산식의 공정시장가액비율에 특례비율(43~45%)을 넣었는데, 60%로 보는 해석에서는 공제액이 커져 종부세가 더 낮게 나오므로(본문 20억 예시 참고) 세부담상한 적용 여부와 함께 실제 금액은 홈택스 고지서로 확인하세요.',
  },
  {
    q: '고령자·장기보유 세액공제는 얼마나 받나요?',
    a: '1세대 1주택자는 종부세에서 <strong>고령자 공제</strong>(만 60세 20% · 65세 30% · 70세 40%)와 <strong>장기보유 공제</strong>(5년 20% · 10년 40% · 15년 50%)를 받습니다. 두 공제는 합산하되 <strong>한도는 80%</strong>입니다. 예로 70세·15년 보유면 40%+50%=90%지만 80%까지만 적용됩니다. 다주택자는 이 세액공제를 받지 못합니다.',
  },
  {
    q: '3주택 이상이면 종부세 중과세율이 어떻게 되나요?',
    a: '3주택 이상은 종부세 과세표준 <strong>12억원 초과분</strong>에 중과세율이 적용됩니다. 12억까지는 일반세율(0.5~1.0%)과 같고, 초과 구간은 1.3%/1.5%/2.0%/2.7% 대신 <strong>2.0% → 3.0% → 4.0% → 5.0%</strong>로 올라갑니다. 2주택 이하는 일반세율(0.5~2.7%)입니다. 본 계산기는 주택별 공시가격을 받아 합계로 종부세를 계산하고, 주택 수에 맞는 세율을 적용합니다.',
  },
  {
    q: '보유세는 언제 내고 분납이 되나요?',
    a: '재산세·종부세 모두 <strong>매년 6월 1일</strong> 현재 소유자에게 1년치가 부과됩니다. 재산세는 주택분을 <strong>7월과 9월에 절반씩</strong> 나눠 부과(위택스, 연세액 20만원 이하는 조례에 따라 7월에 한 번에)하고, 종합부동산세는 <strong>12월 1~15일</strong>에 납부(홈택스)합니다. 종부세는 납부세액이 250만원을 초과하면 <strong>6개월 분납</strong>이 가능하고, 재산세도 250만원 초과 시 분납할 수 있습니다. 농어촌특별세는 종부세에 함께 부과됩니다.',
  },
]

const fmvRows = [
  { range: '공시 3억 이하', ratio: '43%' },
  { range: '공시 3억~6억', ratio: '44%' },
  { range: '공시 6억 초과', ratio: '45%' },
  { range: '그 외 (다주택 등)', ratio: '60%' },
]

export default function PropertyHoldingTaxPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/property-holding-tax">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />주택 보유세 계산기
      </h1>
      <p className="tp-lead">
        공시가격을 넣으면 <strong style={strong}>재산세와 종합부동산세</strong>를 한 번에 추정합니다. 도시지역분·지방교육세·농어촌특별세까지 분해해 보여주고, 1세대 1주택 특례세율·12억 공제·고령자/장기보유 세액공제를 2026년 기준으로 반영합니다.
      </p>

      <UpdatedMeta
        date="2026년"
        basis="2026년 재산세·종합부동산세 기준 · 개편 진행 시 변동 가능"
        sources={[
          { label: '위택스(wetax.go.kr)', href: 'https://www.wetax.go.kr/' },
          { label: '국세청(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '국가법령정보센터 지방세법', href: 'https://www.law.go.kr/법령/지방세법' },
          { label: '국가법령정보센터 종합부동산세법', href: 'https://www.law.go.kr/법령/종합부동산세법' },
        ]}
      />

      <Disclaimer
        variant="finance"
        sources={[
          { label: '위택스(재산세)', href: 'https://www.wetax.go.kr/' },
          { label: '국세청(nts.go.kr)', href: 'https://www.nts.go.kr/' },
          { label: '행안부 지방세법', href: 'https://www.law.go.kr/법령/지방세법' },
          { label: '법제처 종합부동산세법', href: 'https://www.law.go.kr/법령/종합부동산세법' },
        ]}
      >
        본 계산기는 2026년 기준 재산세·종합부동산세를 단순화한 추정치이며 참고용입니다. 2026년 종합부동산세 개편(기본공제·세율 조정)이 진행될 수 있고, 공동명의·세부담 상한·과세표준 상한·감면·일시적 2주택 특례 등은 반영하지 않거나 약식 처리합니다. 실제 고지세액은 위택스(재산세)·국세청 홈택스(종부세) 또는 세무 전문가로 확인하세요.
      </Disclaimer>

      <PropertyHoldingTaxClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div>

        {/* 1. 보유세란 */}
        <div>
          <h2 className="g-h2">보유세란 — 재산세와 종합부동산세의 관계</h2>
          <p className="g-p">
            보유세는 주택을 <strong>가지고 있는 동안 매년</strong> 내는 세금으로, 지방세인 <strong>재산세</strong>와 국세인 <strong>종합부동산세</strong>로 나뉩니다. 재산세는 모든 주택에 부과되고, 종부세는 공시가격이 기본공제(1세대 1주택 12억·일반 9억)를 넘는 고가·다주택에만 추가로 붙습니다.
          </p>
          <p className="g-p">
            두 세금은 같은 주택을 대상으로 하지만 종부세 계산 시 이미 낸 재산세 상당액을 빼주는 <strong>중복분 공제</strong>가 있어 이중과세가 아닙니다. 재산세는 7·9월에 위택스로, 종부세는 12월에 홈택스로 부과됩니다.
          </p>
        </div>

        {/* 2. 재산세 계산법 */}
        <div>
          <h2 className="g-h2">2026 재산세 계산법</h2>
          <p className="g-p">
            재산세는 공시가격에 공정시장가액비율을 곱한 과세표준에 누진세율을 적용합니다. 1세대 1주택은 한시 특례로 공정시장가액비율이 낮고 특례세율(공시 9억 이하)이 적용됩니다.
          </p>
          <div style={formulaBox}>
            과세표준 = 공시가격 × <strong style={{ color: 'var(--accent-ink)' }}>공정시장가액비율</strong>
            <br />
            재산세 합계 = 본세 + 도시지역분(과표 × <strong style={{ color: 'var(--accent-ink)' }}>0.14%</strong>) + 지방교육세(본세 × <strong style={{ color: 'var(--accent-ink)' }}>20%</strong>)
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            공정시장가액비율은 1주택일수록 낮습니다. 도시지역에 있으면 도시지역분이 추가되며, 지방교육세는 본세의 20%로 함께 부과됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 320 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공시가격 구간', '공정시장가액비율'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fmvRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.range}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            예를 들어 도시지역의 공시가격 8억 1세대 1주택이면 과세표준은 8억 × 45% = {manwon(oneHouse(8).property.taxBase)}이고, 공시 9억 이하라 특례세율로 본세 {won(oneHouse(8).property.baseTax)}, 도시지역분 {won(oneHouse(8).property.urbanTax)}, 지방교육세 {won(oneHouse(8).property.eduTax)}을 더해 재산세 합계 {won(oneHouse(8).property.total)}입니다. 같은 집이 다주택자 소유라면 공정시장가액비율 60%와 표준세율이 적용돼 재산세가 {won(multi([8, 1]).perHouse[0].total)}으로 늘어납니다. 특례세율은 공시 9억까지만 적용되므로 9억을 조금 넘는 주택은 세액이 한 번에 뛰는 구간이 있습니다.
          </p>
        </div>

        {/* 3. 종부세 계산법 */}
        <div>
          <h2 className="g-h2">2026 종합부동산세 계산법</h2>
          <p className="g-p">
            종부세는 공시가격에서 기본공제를 뺀 금액에 공정시장가액비율 60%를 곱해 과세표준을 만든 뒤 누진세율을 적용합니다. 기본공제는 <strong>1세대 1주택 12억원, 그 외 9억원</strong>입니다.
          </p>
          <div style={formulaBox}>
            과세표준 = (공시가격 − <strong style={{ color: 'var(--accent-ink)' }}>기본공제</strong>) × <strong style={{ color: 'var(--accent-ink)' }}>60%</strong>
            <br />
            결정세액 = (산출세액 − 재산세 중복분) × (1 − 세액공제율)
            <br />
            종부세 합계 = 결정세액 + 농어촌특별세(결정세액 × <strong style={{ color: 'var(--accent-ink)' }}>20%</strong>)
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            산출세액에서 같은 주택에 부과된 재산세 상당액(중복분)을 빼고, 1세대 1주택자는 세액공제를 적용한 뒤, 결정세액의 20%인 농어촌특별세를 더합니다.
          </p>
          <p className="g-p">
            공시가격 20억 1세대 1주택(세액공제 없음)으로 풀어 보면 과세표준은 (20억 − 12억) × 60% = {manwon(EX20.comp.taxBase)}, 산출세액은 {won(EX20.comp.computedTax)}입니다. 여기서 재산세 중복분 {won(EX20.comp.propOverlap)}을 빼면 결정세액 {won(EX20.comp.decidedTax)}, 농어촌특별세 {won(EX20.comp.ruralTax)}를 더해 종부세 합계 {won(EX20.comp.total)}입니다. 같은 해 재산세 {won(EX20.property.total)}과 합친 보유세는 {won(EX20.total)}으로, 공시가격의 약 {(EX20.effectiveRate * 100).toFixed(2)}%입니다.
          </p>
          <p className="g-note">
            위 중복분은 1세대 1주택 특례 공정시장가액비율(45%)을 공제 산식에 적용한 값입니다. 산식의 비율을 일반 주택과 같은 60%로 보는 해석에서는 중복분이 {won(EX20_ALT60.propOverlap)}으로 커져 종부세 합계가 {won(EX20_ALT60.total)}까지 낮아지므로, 실제 고지액은 홈택스 고지서로 확인하세요.
          </p>
        </div>

        {/* 3-1. 공시가격별 1주택 보유세 */}
        <div>
          <h2 className="g-h2">공시가격별 1세대 1주택 보유세 한눈에</h2>
          <p className="g-p">
            아래는 도시지역 1세대 1주택을 계산기와 같은 함수로 계산한 연간 보유세입니다. 공시 12억까지는 재산세만 내고, 그 위부터 종부세가 붙습니다. 오른쪽 열은 만 70세 이상·15년 이상 보유로 세액공제 한도 80%를 받는 경우로, 종부세가 크게 줄지만 재산세는 그대로입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>공시가격</th>
                  <th scope="col" style={TH}>재산세 합계</th>
                  <th scope="col" style={TH}>종부세 (농특세 포함)</th>
                  <th scope="col" style={TH}>보유세 합계</th>
                  <th scope="col" style={TH}>공시가 대비</th>
                  <th scope="col" style={TH}>세액공제 80% 시 합계</th>
                </tr>
              </thead>
              <tbody>
                {ONE_HOUSE_ROWS.map(({ eok, base, credit }) => (
                  <tr key={eok}>
                    <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{eok}억</th>
                    <td style={TD}>{won(base.property.total)}</td>
                    <td style={TD}>{base.comp.total > 0 ? won(base.comp.total) : '—'}</td>
                    <td style={{ ...TD, fontWeight: 700 }}>{won(base.total)}</td>
                    <td style={{ ...TD, color: 'var(--accent-ink)' }}>{(base.effectiveRate * 100).toFixed(2)}%</td>
                    <td style={TD}>{won(credit.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">도시지역분 포함, 세부담 상한·과세표준 상한 미반영. 공시가격은 시세가 아니라 매년 공시되는 주택 공시가격(공동주택은 국토교통부, 단독주택은 시·군·구 공시 — 부동산공시가격알리미에서 조회)입니다.</p>
        </div>

        {/* 4. 1세대1주택 혜택 */}
        <div>
          <h2 className="g-h2">1세대 1주택자 혜택 — 특례세율·공제·세액공제</h2>
          <p className="g-p">
            1세대 1주택자는 세 가지 혜택을 받습니다. 첫째 재산세 <strong>특례세율</strong>(공시 9억 이하)과 낮은 공정시장가액비율(43~45%), 둘째 종부세 기본공제 <strong>12억원</strong>(일반보다 3억 높음), 셋째 종부세 <strong>세액공제</strong>입니다.
          </p>
          <p className="g-p">
            세액공제는 <strong>고령자 공제</strong>(60세 20% · 65세 30% · 70세 40%)와 <strong>장기보유 공제</strong>(5년 20% · 10년 40% · 15년 50%)를 합산해 적용하며 <strong>한도는 80%</strong>입니다. 예로 70세·15년 보유면 90%가 아니라 80%까지만 종부세에서 차감됩니다.
          </p>
        </div>

        {/* 5. 다주택 중과 */}
        <div>
          <h2 className="g-h2">다주택자 종부세 중과세율과 합산과세</h2>
          <p className="g-p">
            종부세는 개인이 보유한 모든 주택의 공시가격을 <strong>합산</strong>해 과세합니다. 합산 공시가격에서 9억(다주택)을 뺀 과세표준에 세율을 적용합니다.
          </p>
          <p className="g-p">
            <strong>3주택 이상</strong>은 과세표준 12억원 초과분에 중과세율이 붙습니다. 12억까지는 일반세율(0.5~1.0%)과 같지만, 초과 구간은 <strong>2.0% → 3.0% → 4.0% → 5.0%</strong>로 올라가 2주택 이하(0.5~2.7%)보다 부담이 큽니다. 재산세는 주택마다 따로 부과되므로, 본 계산기는 주택별 공시가격을 받아 재산세는 주택별로 계산해 더하고 종부세는 합계에 주택 수에 맞는 세율을 적용합니다.
          </p>
          <p className="g-p">
            합산 공시가격이 같아도 보유 형태에 따라 세금이 달라집니다. 1주택은 공제가 크고 재산세 비율도 낮아 가장 유리하고, 3주택 중과는 과세표준이 12억을 넘어야 차이가 생깁니다. 아래는 도시지역·세액공제 없음 기준입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>보유 형태</th>
                  <th scope="col" style={TH}>합산 공시가격</th>
                  <th scope="col" style={TH}>재산세 합계</th>
                  <th scope="col" style={TH}>종부세 (농특세 포함)</th>
                  <th scope="col" style={TH}>보유세 합계</th>
                </tr>
              </thead>
              <tbody>
                {MIX_ROWS.map((m) => (
                  <tr key={m.label}>
                    <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>{m.label}</th>
                    <td style={TD}>{m.total}억</td>
                    <td style={TD}>{won(m.r.property.total)}</td>
                    <td style={TD}>{won(m.r.comp.total)}</td>
                    <td style={{ ...TD, fontWeight: 700 }}>{won(m.r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">40억 3채는 종부세 과세표준이 {manwon(MIX_ROWS[4].r.comp.taxBase)}으로 12억을 넘어 초과분에 중과세율이 붙고, 같은 합계의 2채보다 종부세가 {won(MIX_ROWS[4].r.comp.total - MIX_ROWS[3].r.comp.total)} 많습니다.</p>
        </div>

        {/* 6. 납부·절세 */}
        <div>
          <h2 className="g-h2">납부 시기·분납·세부담 상한·절세 체크포인트</h2>
          <p className="g-p">
            재산세는 <strong>7월(16~31일)과 9월(16~30일)에 절반씩</strong>(위택스, 연세액 20만원 이하는 조례에 따라 7월에 한 번에), 종부세는 <strong>12월 1~15일</strong>(홈택스)에 냅니다. 두 세금 모두 납부세액이 <strong>250만원을 초과</strong>하면 분납할 수 있고, 종부세는 6개월까지 나눠 낼 수 있습니다.
          </p>
          <p className="g-p">
            두 세금의 과세기준일은 <strong>매년 6월 1일</strong>입니다(지방세법 제114조, 종합부동산세법 제3조). 6월 1일 현재 사실상 소유자(지방세법 제107조 — 잔금 지급일과 등기 접수일 중 빠른 날에 취득한 것으로 봄, 같은 법 시행령 제20조)가 그해 1년치를 모두 내므로, 집을 사고팔 때 잔금을 6월 1일까지 치르면 매수인이, 6월 2일 이후에 치르면 매도인이 그해 보유세를 부담합니다. 잔금일을 며칠 조정하는 것만으로 수십~수백만원이 오갈 수 있어 계약서에 미리 정해 두는 경우가 많습니다.
          </p>
          <p className="g-p">
            재산세에는 전년 대비 급격한 인상을 막는 <strong>세부담 상한</strong>(공시 3억 이하 105% · 3~6억 110% · 6억 초과 130%)과 주택 과세표준 상한 장치가 있어, 공시가격이 크게 오른 해에는 실제 고지액이 이 계산기 값보다 낮을 수 있습니다. 절세 측면에서는 부부 공동명의 활용, 1세대 1주택 요건 유지, 고령·장기보유 세액공제 시점 관리, 일시적 2주택 특례 활용이 핵심입니다. 본 계산기는 세부담 상한·공동명의를 반영하지 않으므로 참고용으로만 보세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 수익률 계산기', desc: '매매·임대·대출 레버리지 반영한 자기자본 수익률' },
              { href: '/tools/finance/auction', icon: '🏛️', name: '경매 비용 계산기', desc: '낙찰가 + 취득세·명도·수리·대출까지 진짜 비용' },
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

      </div>
    </ToolPage>
  )
}
