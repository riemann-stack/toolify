import Link from 'next/link'
import GoldConverterClient from './GoldConverterClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { UNITS, KARATS, PRODUCT_DEFAULTS, calculatePrice, pureGoldGram, type GoldProduct, type WeightUnit } from './goldUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/gold-converter',
  title: '금 단위·가격 계산기 — 돈·g·트로이온스 변환 + 순도 환산 + 시세',
  description:
    '돈·g·트로이온스·푼·냥 9단위 + 14K/18K/24K 환산. 시세를 직접 입력하면 매수/매도 실거래가 계산 (실시간 자동 시세 아님). KRX 금현물·골드바·금통장 비교.',
  keywords: [
    '금 단위 변환', '돈 g 변환', '한돈 g', '한냥 g', '1돈 그램',
    '트로이온스 변환', '트로이온스 g', 'oz t 변환',
    '14K 순도', '18K 순도', '24K 순도', 'K 함량', 'K 환산', '순금 환산',
    '금 시세 계산', '골드바 가격', '1돈 가격', '금 1g 가격',
    'KRX 금현물', 'KRX 금현물 부가세', '금통장', '금통장 양도세',
    '한국조폐공사 골드바', '한국금거래소', '은행 골드바',
    '돌반지 무게', '돌반지 한돈', '결혼반지 g', '세배돈 무게',
    '코리아 프리미엄', '국제 금시세', '금 부가세',
    '푼 돈 냥', '한국 무게 단위', '냥 그램',
    '금 매수 매도', '금 스프레드', '귀금속 세공비',
    '금 단위 환산', '금 가격 계산기',
  ],
})

const DON_G = UNITS.find(u => u.key === 'don')?.inGram ?? 3.75
const fmtNum = (n: number, d: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: d })

/* 단위 변환표 — goldUtils.UNITS(도구와 같은 환산 계수)에서 생성 */
const UNIT_USE: Record<WeightUnit, string> = {
  pun: '돌반지·세뱃돈 등 소량 표기',
  don: '한국 금 거래 표준 (돌반지·골드바)',
  nyang: '대형 골드바·전통 표기',
  g: 'SI 단위·국제 시세 환산',
  kg: '대량 골드바·기관 거래',
  troyOz: '국제 금 시세 표준 (USD/oz t)',
  dwt: '미국 귀금속 업계 표기',
  grain: '극미량 표기',
  oz: '일반 온스 — 금 시세에는 쓰지 않음 (혼동 주의)',
}
/** 표 표시명 재정의 — goldUtils 라벨에 이미 괄호가 있는 단위 */
const UNIT_NAME: Partial<Record<WeightUnit, string>> = { oz: '일반 온스 (oz)' }

const UNIT_ORDER: WeightUnit[] = ['pun', 'don', 'nyang', 'g', 'kg', 'troyOz', 'dwt', 'grain', 'oz']
const UNIT_ROWS = UNIT_ORDER.map(k => UNITS.find(u => u.key === k)).filter((u): u is (typeof UNITS)[number] => !!u)

/* 순도표 — KARATS 비율로 순금 함량 계산 (1돈 = DON_G g 제품 기준) */
const KARAT_NOTE: Record<string, [string, string]> = {
  '24k': ['999~999.9', '순금 기준점 — 골드바·돌반지·투자용. 무르고 긁히기 쉬워 일상 착용 반지엔 덜 쓰임'],
  '22k': ['916·917', '인도·동남아 예물에 흔함. 색이 진하고 24K보다 단단함'],
  '21k': ['875', '중동 지역 보석에 흔한 순도'],
  '18k': ['750', '국내 예물·고급 주얼리에 흔함. 합금 배합으로 옐로·화이트·로즈 등 색상 선택 폭이 넓음'],
  '14k': ['585', '국내·미국 일상 주얼리에 흔함. 단단하지만 합금 비율이 높아 니켈 등에 민감하면 알레르기 가능'],
  '10k': ['417', '저가 주얼리·체인. 합금 비율이 커 변색 가능성이 높음'],
}

/* 상품별 즉시 왕복(매수 → 바로 매도) 비용 — 도구 기본 가정(PRODUCT_DEFAULTS)으로 시세 100 기준 계산 */
const PRODUCTS: GoldProduct[] = ['krx', 'bankbook', 'bar']
const ROUND_TRIP = PRODUCTS.map(p => {
  const d = PRODUCT_DEFAULTS[p]
  const r = calculatePrice(1, '24k', { productType: p, pricePerGram24k: 100, vatIncluded: false, spreadPercent: d.spread, feePercent: d.fee, craftFee: 0, usdKrw: 0, internationalOzUsd: 0 })
  return { p, label: d.label, spread: d.spread, fee: d.fee, vat: d.vat, buy: r.buyCost, sell: r.sellRevenue, loss: (r.buyCost - r.sellRevenue) / r.buyCost * 100, breakEven: (r.buyCost / r.sellRevenue - 1) * 100 }
})
const BAR_RT = ROUND_TRIP.find(r => r.p === 'bar') ?? ROUND_TRIP[0]
const KRX_RT = ROUND_TRIP.find(r => r.p === 'krx') ?? ROUND_TRIP[0]
/* 18K 10g 매도 — 골드바(실물) 기본 스프레드·수수료 적용 시 순금 환산 시세 대비 수령 비율 */
const SELL_RATIO_BAR = (1 - PRODUCT_DEFAULTS.bar.spread / 100) * (1 - PRODUCT_DEFAULTS.bar.fee / 100) * 100

const FAQ_LD = [
              {
                q: '1돈은 정확히 몇 그램인가요?',
                a: '<strong>1돈 = 3.75g</strong>입니다. 한국 금 거래의 표준 단위로, 돌반지·골드바·예물 등 거의 모든 거래에 사용됩니다.<br/><br/>관련 단위 — 1푼 = 0.375g (1/10돈), 1냥 = 37.5g (10돈). 1kg = 266.67돈, 1트로이온스(oz t) = 31.1g ≈ 8.294돈.',
              },
              {
                q: '트로이온스(oz t)와 일반 온스(oz)는 같나요?',
                a: '<strong>아닙니다.</strong><br/>• <strong>트로이온스 (oz t) = 31.1034768g</strong> — 귀금속 전용 단위. 국제 금 시세의 기준.<br/>• <strong>일반 온스 (avoirdupois oz) = 28.349523125g</strong> — 식료품 등 일반 용도. 금 시세에는 쓰지 않음.<br/><br/>두 값은 1959년 국제 야드·파운드 협정에서 정해진 정의값으로, NIST SP 811 환산표에 실려 있습니다. 국제 시세(USD/oz t)를 일반 온스로 잘못 나누면 1g당 가격이 약 9.7% 높게 계산되니 주의하세요.',
              },
              {
                q: '18K 반지를 녹이면 순금이 얼마나 나오나요?',
                a: `18K = 75.0% 순금이므로 <strong>18K 10g → 순금 7.5g</strong> (24K 환산). 14K 10g → 순금 ${fmtNum(pureGoldGram(10, '14k'), 2)}g, 22K 10g → 순금 ${fmtNum(pureGoldGram(10, '22k'), 2)}g.<br/><br/>팔 때는 매장이 순금 환산 시세에서 매입 마진(스프레드)과 수수료를 뺍니다. 이 계산기의 골드바(실물) 기본값(스프레드 ${PRODUCT_DEFAULTS.bar.spread}%, 수수료 ${PRODUCT_DEFAULTS.bar.fee}%)이면 순금 7.5g 시세의 <strong>약 ${SELL_RATIO_BAR.toFixed(1)}%</strong>를 받는 것으로 계산됩니다. 주얼리는 세공비를 되돌려 받지 못하고, 매장에 따라 18K·14K 매입가를 이보다 낮게 치는 경우가 많으니 [가격 계산] 탭에서 스프레드를 10% 이상으로 올려 보수적으로 확인하세요.`,
              },
              {
                q: '골드바 살 때 정말 부가세 10%를 내나요?',
                a: '네. <strong>개인이 골드바를 매수할 때 부가세 10%가 부과</strong>됩니다. 매수 가격은 시세 × 1.1(부가세)에 매장 수수료가 더해지는 구조라, 시세보다 10% 이상 비싸게 사게 됩니다.<br/><br/><strong>매도 시 부가세는 환급되지 않습니다.</strong> 즉, 매수 시 낸 부가세는 회수 불가. 따라서 시세가 부가세+스프레드를 상쇄할 만큼 상승해야 손익분기 — 단기 매매에 큰 함정.<br/><br/>예외 — <strong>KRX 금현물·금통장은 계좌 안에서 사고파는 동안 부가세가 없습니다</strong>. 다만 둘 다 실물로 인출하는 순간 부가세 10%가 붙습니다.',
              },
              {
                q: 'KRX 금현물이 가장 유리한 이유?',
                a: `3가지 이유:<br/>• <strong>부가세 면제</strong> — 금시장 안에서 거래하는 동안 부가세가 없음<br/>• <strong>매매차익 비과세</strong> — 시세 차익에 양도소득세·배당소득세가 없음<br/>• <strong>거래 비용이 작음</strong> — 이 계산기 기본값으로 즉시 사고팔면 왕복 손실 약 ${KRX_RT.loss.toFixed(1)}%(골드바 약 ${BAR_RT.loss.toFixed(1)}%)<br/><br/>단점 — 실물이 아닌 계좌 잔고로 보유합니다. 실물로 받으려면 증권사를 통해 정해진 중량 단위로 인출을 신청해야 하고, 이때 부가세 10%와 인출 수수료가 붙습니다. 증권사의 금현물 계좌가 필요합니다.`,
              },
              {
                q: '금통장 매매차익에 세금 15.4%를 내나요?',
                a: '네. <strong>은행 금통장(골드뱅킹)의 매매차익은 배당소득으로 분류되어 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수</strong>됩니다. 이자·배당 등 연간 금융소득 합계가 2,000만원을 넘으면 넘는 부분은 다른 소득과 합산하는 금융소득종합과세 대상이 됩니다.<br/><br/>예 — 1,000만원 투자 → 1,500만원 매도 → 차익 500만원 × 15.4% = 77만원 세금, 차익 중 423만원 수령. 같은 시세 차이를 KRX 금현물로 거래했다면 차익에 세금이 없습니다.<br/><br/>금통장의 장점은 0.01g 단위 적립이 가능하고 은행에서 바로 가입한다는 점, 단점은 배당소득세 + 스프레드 + 실물 인출 시 부가세 10%입니다.',
              },
              {
                q: '매수-매도 스프레드가 뭐고 왜 골드바는 크나요?',
                a: `<strong>스프레드 = 매장이 파는 가격과 되사는 가격의 차이</strong>입니다. 매장의 마진과 재고·시세 변동 위험 비용이 들어 있습니다.<br/><br/>예 — 매장이 시세보다 3% 높게 팔고 7% 낮게 되사면 사는 값과 파는 값 사이에 약 10%의 차이가 생깁니다. 실물은 보관·운송·감정·정련 비용이 들기 때문에 스프레드가 큽니다. KRX 금현물은 거래소에서 매수·매도 호가가 맞춰지는 구조라 차이가 작고, 이 계산기는 기본값으로 ${PRODUCT_DEFAULTS.krx.spread}%를 씁니다.`,
              },
              {
                q: '코리아 프리미엄이란?',
                a: '<strong>한국 금 시세가 국제 시세보다 비싼 비율</strong>. 한국 1g 시세를 트로이온스(oz t)로 환산한 값과 국제 시세(USD/oz t) × 환율을 비교합니다.<br/><br/>국내 시세에 부가세가 포함돼 있으면 비교가 틀어지므로, 이 계산기는 「부가세 포함」을 켜면 시세를 1.1로 나눈 뒤 비교합니다. 결과가 +5%를 넘으면 「프리미엄 5% 초과」, −5% 미만이면 「국내가 더 저렴」으로 표시하는데, 이 ±5%는 도구가 쓰는 표시 기준일 뿐 공식 기준은 아닙니다. 국내 수급 쏠림·환율 급변 때 프리미엄이 커지곤 하므로, 매수·매도 판단 전에 원인을 함께 확인하세요.',
              },
            ]

export default function GoldConverterPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/gold-converter">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />금 단위·가격 계산기
      </h1>
      <p className="tp-lead">
        돈·g·트로이온스·푼·냥 9단위 + 14K/18K/24K 환산. <strong style={{ color: 'var(--text)' }}>시세를 직접 입력</strong>하면 매수·매도 실거래가까지 — 실시간 자동 시세 연동은 아닙니다.
      </p>

      <UpdatedMeta date="2026년 7월" basis="무게 9단위·순도(14/18/24K) 고정 환산 + 사용자가 입력한 24K 1g 시세(KRX 금시장 기준) 기반 매수·매도가 계산. 골드바 부가세 10%·KRX 금현물 비과세·금통장 배당소득세 15.4% 등 국내 세제·거래비용(스프레드·수수료·세공비) 가정 반영. 시세는 실시간 자동 연동이 아니며 직접 입력값입니다." sources={[{"label":"한국거래소(KRX 금시장)","href":"https://www.krx.co.kr"},{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"NIST SP 811 (단위 환산 계수)","href":"https://www.nist.gov/pml/special-publication-811"},{"label":"국가법령정보센터 — 조세특례제한법","href":"https://www.law.go.kr/법령/조세특례제한법"}]} />

      <GoldConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 한국 무게 단위 */}
        <section>
          <h2 className="g-h2">한국 무게 단위 변환표</h2>
          <p className="g-p">
            한국 금 거래는 전통적으로 <strong>돈</strong>을 사용합니다. 1돈 = 3.75g이며, 1냥 = 10돈 = 37.5g, 1푼 = 0.1돈 = 0.375g입니다. 국제 거래는 트로이온스(oz t = 31.1034768g)가 기준입니다. 아래 표는 계산기가 쓰는 환산 계수 그대로이며, 트로이온스·펜니웨이트·그레인·일반 온스는 1959년 국제 야드·파운드 협정에서 정해진 정의값으로, NIST SP 811 환산표에 실려 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '환산 (g)', '환산 (돈)', '용도'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UNIT_ROWS.map((u, i) => (
                  <tr key={u.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{UNIT_NAME[u.key] ?? (u.label === u.short ? u.label : `${u.label} (${u.short})`)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtNum(u.inGram, 7)}g</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{fmtNum(u.inGram / DON_G, 3)}돈</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{UNIT_USE[u.key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            국제 시세를 돈 단위 가격으로 바꿀 때는 <strong>1돈 가격 = (USD/oz t 시세 × 환율) ÷ 31.1034768 × 3.75</strong>입니다. 1트로이온스가 약 {fmtNum(31.1034768 / DON_G, 3)}돈이므로, 온스당 원화 가격을 이 값으로 나눠도 같습니다. 여기에 골드바라면 부가세 10%와 매장 마진이 더해져야 국내 매장 가격과 비슷해집니다.
          </p>
        </section>

        {/* 2. K 순도 표 */}
        <section>
          <h2 className="g-h2">금 순도 (Karat) 가이드</h2>
          <p className="g-p">
            K 숫자는 24분의 X로 순금 비율을 나타냅니다 (24K = 24/24 = 100% 기준점). 실제 거래되는 순금은 품위 999(99.9%)~999.9(99.99%) — 본 계산기는 24K를 100% 기준으로 환산합니다. 18K/14K는 은·구리 등을 섞은 합금이라 단단하고 색상이 다양해 일상 주얼리에 쓰입니다. 오른쪽 열은 1돈({DON_G}g)짜리 제품에 들어 있는 순금 양입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Karat', '순도 (%)', '각인 표기', '특징·용도', '1돈 제품의 순금'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KARATS.map((k, i) => (
                  <tr key={k.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{k.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{(k.ratio * 100).toFixed(1)}%{k.key === '24k' ? ' (기준)' : ''}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{KARAT_NOTE[k.key]?.[0] ?? '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{KARAT_NOTE[k.key]?.[1] ?? ''}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{fmtNum(pureGoldGram(DON_G, k.key), 3)}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            국내 14K 제품은 보통 585(58.5%)로 각인되지만 계산기는 14 ÷ 24 = {((KARATS.find(k => k.key === '14k')?.ratio ?? 0.583) * 100).toFixed(1)}%로 환산하므로, 585 제품을 정밀하게 따지면 순금 양이 0.2%p가량 더 많습니다. 반대로 각인만 있고 품위 검사를 거치지 않은 제품은 표기보다 함량이 낮을 수 있으니, 큰 금액을 사고팔 때는 매장의 순도 측정 결과를 확인하세요.
          </p>
        </section>

        {/* 3. KRX 비교표 */}
        <section>
          <h2 className="g-h2">KRX 금현물 vs 골드바 vs 금통장</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', 'KRX 금현물', '골드바', '금통장'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['부가세',          '면제 (실물 인출 시 10%)', '매수 시 10%',     '면제 (실물 인출 시 10%)'],
                  ['매매차익 과세',    '비과세',           '비과세',          '배당소득세 15.4%'],
                  ['도구 기본 스프레드', `${PRODUCT_DEFAULTS.krx.spread}%`, `${PRODUCT_DEFAULTS.bar.spread}%`, `${PRODUCT_DEFAULTS.bankbook.spread}%`],
                  ['도구 기본 수수료',  `${PRODUCT_DEFAULTS.krx.fee}%`, `${PRODUCT_DEFAULTS.bar.fee}%`, `${PRODUCT_DEFAULTS.bankbook.fee}%`],
                  ['최소 거래 단위',   '1g',             '제품 규격 (1g~1kg)', '0.01g'],
                  ['보관 형태',       '계좌 (예탁 보관)',  '실물',           '계좌'],
                  ['매도 방법',       '장중 증권사 앱',    '매장 방문 매입',   '은행 영업일 매도'],
                  ['실물 전환',       '가능 (부가세·수수료)', '이미 실물',      '가능 (부가세 10%)'],
                  ['어울리는 용도',    '단기·중기 투자',   '선물·증여·실물', '소액 적립'],
                ].map(([item, krx, bar, bank], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{krx}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{bar}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 2026년 기준. KRX 금현물은 한국거래소 KRX 금시장(증권사 금현물 계좌 필요), 금통장은 은행 골드뱅킹 상품. 스프레드·수수료는 계산기의 기본 가정값이며 실제는 증권사·은행·매장·시점별로 다릅니다.
          </p>
        </section>

        {/* 4. 골드바 거래 비용 구조 */}
        <section>
          <h2 className="g-h2">사자마자 팔면 얼마가 남나 — 상품별 왕복 비용</h2>
          <p className="g-p">
            계산기 [가격 계산] 탭의 식은 <strong>매수 비용 = 시세 × (1 + 부가세 + 수수료) + 세공비</strong>, <strong>매도 수령액 = 시세 × (1 − 스프레드) × (1 − 수수료)</strong>입니다. 상품별 기본값으로 시세 100짜리 24K 금을 사서 곧바로 판다고 가정하면 다음과 같습니다. 오른쪽 열은 본전을 찾으려면 시세가 몇 % 올라야 하는지입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상품', '매수 비용', '매도 수령액', '왕복 손실', '본전 시세 상승률'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROUND_TRIP.map((r, i) => (
                  <tr key={r.p} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.buy.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.sell.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.loss.toFixed(1)}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700 }}>+{r.breakEven.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            골드바는 부가세 10%를 돌려받지 못하고 되팔 때 스프레드까지 빠져, 기본값으로는 산 값의 약 {BAR_RT.loss.toFixed(1)}%를 잃고 시작합니다. 시세가 {BAR_RT.breakEven.toFixed(1)}% 넘게 올라야 본전이라는 뜻입니다. 금통장은 이 표의 손실 외에 차익의 15.4%가 세금으로 빠집니다. 그래서 <strong>단기 매매가 목적이면 KRX 금현물</strong>, 실물 보유·선물·증여가 목적이면 골드바가 맞고, 골드바를 살 거라면 오래 들고 갈 계획일 때 비용 구조가 납득됩니다.
          </p>
          <Callout tone="warn" title="매장 매입가는 계산기 기본값보다 낮을 수 있습니다">
            스프레드·수수료 기본값은 비교를 위한 가정입니다. 실제로 팔기 전에 두세 곳에 매입가를 물어 [가격 계산] 탭의 스프레드 칸에 넣어 보면, 매장별 차이가 금액으로 바로 보입니다.
          </Callout>
        </section>

        {/* 5. 골드바 살 때 확인할 것 */}
        <section>
          <h2 className="g-h2">골드바 살 때 확인할 것</h2>
          <ul className="g-list">
            <li><strong>품위·중량 각인</strong> — 999.9 같은 품위와 중량, 제조사 각인, 일련번호가 있는지 봅니다.</li>
            <li><strong>보증서</strong> — 제조사·판매처의 품질 보증서를 함께 받아 두면 되팔 때 감정 절차가 수월합니다.</li>
            <li><strong>가격의 부가세 포함 여부</strong> — 매장 표시가가 부가세 포함인지 확인하고, 계산기의 「부가세 포함」 체크를 맞춰 입력하세요.</li>
            <li><strong>되팔 곳의 매입 조건</strong> — 산 곳과 다른 매장에 팔면 매입가를 낮게 쳐주는 경우가 있으니 매입 정책을 미리 물어봅니다.</li>
            <li><strong>해외 제품</strong> — PAMP·Heraeus 같은 해외 브랜드를 직접 들여오면 통관 시 관세·부가세와 환율 차이가 추가됩니다.</li>
          </ul>
          <p className="g-p">
            판매처는 은행 창구, 금 거래소, 귀금속 매장 등 다양하고 제조사도 한국조폐공사·민간 정련사·해외 브랜드로 나뉩니다. 같은 무게라도 소형 바(1g·1돈)는 제조 비용 비중이 커서 1g당 가격이 대형 바보다 높은 편이니, 적립 목적이면 1g당 가격으로 비교하세요.
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/vat',       icon: '🧾', name: '부가세 계산기',          desc: '부가세 역산·견적서' },
              { href: '/tools/finance/compound',  icon: '📈', name: '복리 계산기',            desc: '금 vs 예금·주식 장기 수익' },
              { href: '/tools/finance/stock',     icon: '📉', name: '주식 물타기 계산기',     desc: '평단가·추가 매수 시뮬' },
              { href: '/tools/finance/savings',   icon: '💰', name: '월 저축 가능 금액 계산기', desc: '금 적립 시뮬·예산 분배' },
              { href: '/tools/unit/converter',    icon: '📐', name: '단위 변환기',            desc: '길이·부피·온도 등 일반 단위' },
              { href: '/tools/finance/loan',      icon: '🏦', name: '대출 이자 계산기',       desc: '원리금·총 이자 시뮬' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
