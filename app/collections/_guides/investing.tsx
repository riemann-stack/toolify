/* 상황별 가이드 — 주식·재테크. 복리는 compoundUtils.calcCompound, 배당 필요 원금은 dividendUtils.requiredPrincipal(세율 lib/krFinancialIncomeTax),
   금 단위·순도는 goldUtils, 공모주 최소 단위는 ipoUtils로 빌드 시 계산. 종목·상품 추천 없음 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcCompound } from '@/app/tools/finance/compound/compoundUtils'
import { requiredPrincipal } from '@/app/tools/finance/dividend/dividendUtils'
import { KARATS, UNITS } from '@/app/tools/finance/gold-converter/goldUtils'
import { SUBSCRIPTION_UNITS } from '@/app/tools/finance/ipo-deposit/ipoUtils'
import { COMPREHENSIVE_TAX_THRESHOLD, GENERAL_DIVIDEND_TAX_RATE } from '@/lib/krFinancialIncomeTax'
import { GuideSources, manwon, num, pct, type CollectionGuide } from './shared'

const MONTHLY = 500_000
const RATES = [3, 5, 7]
const YEARS = [10, 20, 30]
/** 배당 예시 — 세후 월 100만원, 배당수익률 4% */
const DIV = { monthly: 1_000_000, yieldPct: 4 }
const LOSSES = [0.1, 0.2, 0.3, 0.5]

function Body() {
  const grid = RATES.map((rate) => ({
    rate,
    cells: YEARS.map((years) => calcCompound({ principal: 0, contribution: MONTHLY, contributionFreqId: 'monthly', compoundFreqId: 'monthly', annualRate: rate, years })),
  }))
  const top = grid[grid.length - 1]
  const midRate = grid[grid.length - 2]
  // 같은 30년에서 수익률 2%p 차이 vs 같은 수익률에서 기간 10년 차이 — 결론 문장을 계산 결과로 고른다
  const gapByRate = top.cells[2].finalValue - midRate.cells[2].finalValue
  const gapByTime = top.cells[2].finalValue - top.cells[1].finalValue
  const need = requiredPrincipal(DIV.monthly, DIV.yieldPct, GENERAL_DIVIDEND_TAX_RATE * 100, 100)
  const thresholdPrincipal = COMPREHENSIVE_TAX_THRESHOLD / (DIV.yieldPct / 100)
  const don = UNITS.find((u) => u.key === 'don')?.inGram ?? 3.75
  const troy = UNITS.find((u) => u.key === 'troyOz')?.inGram ?? 31.1034768
  const k18 = KARATS.find((k) => k.key === '18k')
  const k14 = KARATS.find((k) => k.key === '14k')
  const minIpo = SUBSCRIPTION_UNITS[0].min

  return (
    <>
      <h2>왜 굴리기 → 매매 → 실물 순서인가</h2>
      <p>
        투자 결과를 가장 크게 가르는 변수는 종목 선택보다 기간과 납입액입니다. 그래서 먼저 <Link href="/tools/finance/compound">복리 계산기</Link>로 매달 넣을 돈과 기간이 만드는 차이를 보고,
        {' '}<Link href="/tools/finance/dividend">배당 계산기</Link>로 목표 현금흐름에 필요한 원금을 거꾸로 계산합니다. 개별 매매의 평단·손익은 이 큰 틀 안에서 판단할 문제이고, 금 같은 실물은 비중을 정한 뒤 단위와 순도를 맞추는 단계입니다.
      </p>

      <h2>기간이 만드는 차이</h2>
      <DataFigure n={1} title={`매달 ${manwon(MONTHLY)}씩 모을 때 기간·수익률별 평가액`} unit="월복리·세전·수수료 전" source={<>계산: 복리 계산기와 같은 식 — 수익률은 가정값이며 실제 수익을 보장하지 않음</>}>
        <table>
          <thead>
            <tr><th scope="col">연 수익률</th>{YEARS.map((y) => <th key={y} scope="col" className="r">{y}년</th>)}</tr>
          </thead>
          <tbody>
            {grid.map((g) => (
              <tr key={g.rate}>
                <td>{g.rate}%</td>
                {g.cells.map((c, i) => <td key={YEARS[i]} className="r">{manwon(c.finalValue)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        연 {top.rate}%를 가정하면 {YEARS[2]}년 동안 넣은 원금은 {manwon(top.cells[2].totalContribution)}인데 평가액은 {manwon(top.cells[2].finalValue)}이고, 그중 {manwon(top.cells[2].totalInterest)}이 수익입니다.
        같은 조건에서 10년 늦게 시작해 {YEARS[1]}년만 모으면 {manwon(top.cells[1].finalValue)}에 그칩니다. {YEARS[2]}년 기준으로 수익률 {top.rate - midRate.rate}%p 차이는 {manwon(gapByRate)}, 같은 수익률에서 기간 10년 차이는 {manwon(gapByTime)}이라
        {gapByTime > gapByRate ? ' 수익률을 조금 더 올리는 것보다 일찍 시작하는 것이 더 큰 차이를 만듭니다.' : ' 이 조건에서는 수익률 차이가 기간 차이보다 큽니다.'}
      </p>
      <p>
        배당으로 세후 월 {manwon(DIV.monthly)}을 받으려면 배당수익률 {DIV.yieldPct}%, 배당소득세 {pct(GENERAL_DIVIDEND_TAX_RATE, 1)}를 가정할 때 원금이 약 {manwon(need)} 필요합니다. 또 이자·배당이 한 해
        {' '}{manwon(COMPREHENSIVE_TAX_THRESHOLD)}을 넘으면 금융소득 종합과세 대상이 되는데, 같은 수익률이면 원금 {manwon(thresholdPrincipal)} 언저리에서 이 선에 닿습니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li>
          <strong>손실률과 회복률을 같게 보기.</strong> 떨어진 만큼 오르면 본전이 아닙니다. {LOSSES.map((l) => `−${pct(l, 0)}는 +${pct(1 / (1 - l) - 1, 1)}`).join(', ')} 올라야 원금으로 돌아옵니다.
          {' '}<Link href="/tools/finance/stock">물타기 계산기</Link>는 추가 매수 뒤 평단과 회복에 필요한 상승률을 함께 보여 줍니다.
        </li>
        <li><strong>공모주 증거금을 청약 금액 전체로 알기.</strong> 대개 청약 금액의 일부(흔히 50%)만 증거금으로 내고, 균등 배정은 최소 청약 수량({minIpo}주 등)만 넣어도 참여할 수 있습니다. 증권사·종목마다 조건이 다르니 <Link href="/tools/finance/ipo-deposit">공모주 증거금 계산기</Link>에 공고의 숫자를 넣으세요.</li>
        <li><strong>돈과 온스를 섞어 쓰기.</strong> 국내 시세의 1돈은 {don}g, 국제 시세의 1트로이온스는 {num(troy, 2)}g(약 {num(troy / don, 2)}돈)입니다. 반지·목걸이는 18K({pct(k18?.ratio ?? 0.75, 1)})·14K({pct(k14?.ratio ?? 0.583, 1)})처럼 순도만큼만 금 값이 매겨집니다.</li>
        <li><strong>세금과 수수료를 빼고 비교하기.</strong> 표의 평가액은 세전·수수료 전입니다. 같은 상품이라도 일반 계좌와 절세 계좌의 세후 결과는 크게 다릅니다.</li>
      </ul>

      <Callout tone="warn" title="이 가이드가 하지 않는 일">
        이 페이지와 계산기는 종목이나 상품을 추천하지 않으며, 표의 수익률은 계산을 위한 가정입니다. 원금 손실이 가능한 상품은 투자설명서를 확인하고, 개별 자문이 필요하면 금융위원회에 등록된 투자자문업자나
        금융감독원 금융소비자 정보포털의 안내를 이용하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '국가법령정보센터 — 소득세법 제129조(원천징수세율)·제14조(종합과세)', href: 'https://www.law.go.kr/법령/소득세법' },
          { label: '금융감독원 금융소비자 정보포털 파인', href: 'https://fine.fss.or.kr' },
          { label: '한국거래소 KRX 금시장', href: 'https://www.krx.co.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '재테크, 종목보다 먼저 계산할 숫자', Body }
export default guide
