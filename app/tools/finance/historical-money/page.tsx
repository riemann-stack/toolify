import Link from 'next/link'
import HistoricalMoneyClient from './HistoricalMoneyClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { ERAS, PRICE_ITEMS, YEAR_MAX, convert, cpi, eraFromYear, fmtCompact, fmtMoney } from './historicalMoneyData'

export const metadata = buildMetadata({
  path: '/tools/finance/historical-money',
  title: '한국 화폐가치 환산기 — 圓·환·원 + 1945~2026 구매력 계산',
  description:
    '1960년 50환, 1980년 만원의 현재 가치는? 한국 圓·환·원 화폐사 + 통계청 CPI 기반 구매력 환산. 화폐개혁 환산표와 시대별 짜장면·집값·월급 비교.',
  keywords: [
    '한국 화폐사', '화폐 가치 환산', '구매력 환산', '인플레이션 계산기',
    '환 원 변환', '1953 화폐개혁', '1962 화폐개혁',
    '옛날 돈 가치', '과거 화폐 가치',
    '한국 CPI', '소비자물가지수', '인플레이션',
    '1960년 짜장면', '1970년 월급', '1980년 집값',
    '圓 환 원', '환 원 환산', '한국은행 화폐사',
  ],
})

/* ── 가이드 수치: 모두 도구와 같은 계산 엔진(historicalMoneyData)에서 빌드 시점에 생성 ── */
const NOW = YEAR_MAX
const won = (n: number) => `${fmtMoney(n)}원`
const cpiStr = (c: number) => (c < 1 ? c.toFixed(4) : c.toFixed(2))
const factorStr = (f: number) => (f < 10 ? f.toFixed(2) : Math.round(f).toLocaleString('ko-KR'))

/** 표 2 — 연도별 CPI와 NOW년까지의 누적 배수, 당시 1만(그해 단위)의 NOW년 가치 */
const FACTOR_YEARS = [1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]
const FACTOR_ROWS = FACTOR_YEARS.map(y => {
  const r = convert(10_000, y, NOW)
  return { year: y, era: eraFromYear(y), cpi: cpi(y), factor: r.inflationFactor, value: r.outputAmount }
})

/** 표 1 — 단위 변천. 환산 비율은 ERAS.toCurrentWon에서 */
const ERA_CONTEXT: Record<string, string> = {
  won_old: '광복 뒤 조선은행권을 그대로 쓰다가 1950년 한국은행 설립 후 한국은행권 발행. 한국전쟁기 초인플레이션',
  hwan: '1차 화폐개혁(1953.2.15, 100圓 = 1환). 전쟁 중 팽창한 통화 정리',
  won: '2차 화폐개혁(1962.6.10, 10환 = 1원). 이후 단위 변경 없음',
}

const EX_1950 = convert(10_000, 1950, NOW)       // 1만 圓
const EX_1970 = convert(10_000, 1970, NOW)
const EX_JJM = convert(250, 1960, NOW)          // 1960년 짜장면 250환
const EX_JJM_WRONG = convert(25, 1960, NOW)     // '25원'으로 이미 환산된 값을 1960년에 넣은 경우
const EX_1980 = convert(10_000_000, 1980, NOW)
const EX_BACK = convert(1_000_000, NOW, 1980)   // 현재 → 과거
const EX_BACK_1990 = convert(1_000_000, NOW, 1990)
const EX_1961 = convert(10_000, 1961, NOW)
const EX_1962 = convert(10_000, 1962, NOW)
/** 임금 비교 — 도구의 가격 카드(PRICE_ITEMS) 값을 그대로 읽어 카드와 본문이 어긋나지 않게 */
const WAGE_PRICES = PRICE_ITEMS.find(p => p.name === '근로자 월평균 임금')?.prices
const WAGE = WAGE_PRICES?.[1970] && WAGE_PRICES?.[2024]
  ? { y1970: WAGE_PRICES[1970], y2024: WAGE_PRICES[2024], conv: convert(WAGE_PRICES[1970], 1970, 2024).outputAmount }
  : null

const FAQ_LD = [
              {
                q: '환과 원은 같은 거 아닌가요?',
                a: '아닙니다. <strong>환(圜)은 1953~1962년만 사용</strong>된 별개의 통화 단위입니다. 1962년 6월 화폐개혁으로 <strong>10환 = 1원</strong>으로 절하되며 현재의 원으로 바뀌었어요. 한자 圓(원)과 圜(환)은 모양이 비슷해 혼동되지만 다른 글자·다른 통화입니다. 1953년 이전의 옛 圓은 또 다른 단위로, 광복~한국전쟁기 통화입니다(1,000圓 = 현재 1원).',
              },
              {
                q: '왜 1965년 이전 데이터는 추정치인가요?',
                a: '통계청의 공식 소비자물가지수 시계열은 <strong>1965년부터 시작</strong>합니다. 그 이전(1945~1964)은 한국은행·역사 자료를 바탕으로 몇 개의 기준 연도 값을 정하고, 사이 연도는 <strong>선형 보간</strong>으로 채운 추정치입니다. 한국전쟁기와 그 직후의 초인플레이션 시기는 해마다 물가 흐름이 고르지 않았고 자료 자체도 불완전해 오차가 큽니다. 1965년 이후끼리 비교하면 공식 통계만 쓰게 됩니다.',
              },
              {
                q: '1960년 짜장면이 250환인데 단순 환산하면 왜 몇천 원밖에 안 되나요?',
                a: `본 도구는 <strong>전체 소비자물가</strong> 기준 환산입니다. 250환(1960)은 화폐개혁 단위로 25원(현재 단위)이고, 누적 물가를 곱하면 ${NOW}년 가치 약 ${won(EX_JJM.outputAmount)} 수준이에요. 그런데 도구의 가격 카드에 넣은 2024년 짜장면 값은 7,000원이죠 — 외식비가 평균 CPI보다 빠르게 올랐다는 뜻입니다(인건비·임대료 비중이 큰 품목). 옛 가격 자료는 출처마다 차이가 크다는 점도 감안하세요. 시대별 가격 비교 카드의 "실질 +X%"는 <strong>실질가격 변동률</strong>이며, 양수면 CPI보다 더 빠르게 올랐다는 뜻입니다.`,
              },
              {
                q: '1950년 월급이 만원(圓)이었는데 지금 얼마예요?',
                a: `1만 圓(1950) = 100환(1953) = 10원(현재 단위). 거기에 1950~${NOW}년 누적 물가를 곱하면 <strong>현재 가치 약 ${won(EX_1950.outputAmount)}</strong> 수준이 나옵니다. 1950년은 전쟁 발발 직후 초인플레이션 시기라 추정 오차가 특히 큽니다. 월급처럼 소득을 비교할 때는 물가 환산값보다 지금의 임금 수준과 견주는 편이 체감에 가깝습니다 — 한국은 1960년대 이후 실질 임금이 물가보다 훨씬 빠르게 올랐기 때문입니다.`,
              },
              {
                q: '집값은 왜 일반 CPI보다 훨씬 많이 올랐나요?',
                a: `소비자물가지수에는 <strong>주택 매매가격이 들어가지 않습니다</strong>. 주거비는 전세·월세 가격으로만 반영되고, 자기 집에 사는 비용(자가주거비)은 본 지수가 아닌 보조지표로 따로 봅니다. 그래서 평균 CPI로 환산한 1980년 1천만원은 ${NOW}년 가치로 약 ${won(EX_1980.outputAmount)}이지만, 도구의 가격 카드(서울 아파트 평균 1980년 1,100만원 → 2024년 11억원)로는 약 100배가 올랐습니다. 자산 가격 상승과 소비자 물가 상승은 서로 다른 현상입니다.`,
              },
              {
                q: '제3차 화폐개혁이 있을까요?',
                a: '주기적으로 "리디노미네이션"(예: 1,000원 → 1원) 논의가 나오지만 한국은행과 정부는 <strong>단기 시행 계획이 없다</strong>는 입장을 반복해 왔습니다. 화폐 단위를 바꾸면 ATM·회계 시스템·가격 표시를 일괄 교체해야 하고, 가격 끝자리 올림으로 물가 기대를 자극할 수 있어 신중하게 다뤄집니다. 설령 단위가 바뀌어도 이 도구처럼 비율(예: 1,000 : 1)만 곱하면 과거 금액과 이어서 비교할 수 있습니다.',
              },
              {
                q: '"현재 → 과거" 방향은 무엇을 계산하나요?',
                a: `지금 돈으로 과거의 같은 구매력을 거꾸로 구합니다. 예를 들어 ${NOW}년 100만원은 1990년 물가로 약 ${won(EX_BACK_1990.outputAmount)}에 해당합니다. 1962년 이전 연도를 고르면 결과가 그해 단위(환·圓)로 표시되므로, 옛 신문 기사나 가계부 속 금액과 바로 견줄 수 있습니다.`,
              },
            ]

export default function HistoricalMoneyPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/historical-money">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />한국 화폐가치 환산기
      </h1>
      <p className="tp-lead">
        圓·환·원 화폐사 + <strong style={{ color: 'var(--text)' }}>1945~2026 구매력 환산</strong>. &ldquo;1960년 짜장면 250환은 지금 얼마?&rdquo;
      </p>

      <UpdatedMeta date="2026년 9월" basis="통계청 소비자물가지수(CPI, 2020=100) 기반 · 1965~2025년 연도별 공식 통계, 이전은 추정치 · 2026년 물가 추정(전년 대비 +2%)" sources={[{"label":"통계청 KOSIS","href":"https://kosis.kr"},{"label":"한국은행 경제통계시스템","href":"https://ecos.bok.or.kr"},{"label":"KOSIS 소비자물가지수(2020=100)","href":"https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1J22003"},{"label":"한국은행(화폐 발행)","href":"https://www.bok.or.kr"}]} />

      <HistoricalMoneyClient />

      <GuideDivider />

      <h2 className="g-h2">한국 화폐사 — 圓·환·원 한눈에</h2>
      <p className="g-p">
        대한민국은 광복 이후 두 번의 화폐개혁(1953·1962)을 거치며 통화 단위가 바뀌었습니다. 단순 단위 변환과 구매력 변환을 혼동하지 않는 게 중요해요 — 화폐개혁은 단위 이름과 자릿수를 바꾸는 <strong>리디노미네이션(redenomination)</strong>이라 개혁 시점의 구매력은 그대로지만, 시간이 흐르면 인플레이션으로 가치가 달라집니다.
        이 도구는 입력한 연도가 어느 단위를 쓰던 때인지 먼저 판단하고, 그 단위를 현재의 원으로 바꾼 뒤 물가 배수를 곱합니다.
      </p>
      <DataFigure n={1} title="화폐 단위 변천과 현재 원 환산 비율" source={<>자료: 한국은행 화폐 발행 연혁 — 환산 비율은 도구 계산 엔진(ERAS)과 같은 값</>}>
        <table>
          <thead>
            <tr><th scope="col">시기</th><th scope="col">단위</th><th scope="col" className="r">1단위 = 현재 원</th><th scope="col">맥락</th></tr>
          </thead>
          <tbody>
            {ERAS.map(e => (
              <tr key={e.id}>
                <th scope="row">{e.startYear}~{e.endYear >= 2100 ? '현재' : e.endYear}</th>
                <td>{e.label}</td>
                <td className="r em">{e.toCurrentWon === 1 ? '1 (기준)' : `1/${Math.round(1 / e.toCurrentWon).toLocaleString('ko-KR')}`}</td>
                <td className="wrap">{ERA_CONTEXT[e.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2 className="g-h2">두 번의 화폐개혁 — 무엇이 어떻게 바뀌었나</h2>
      <h3 className="g-h3">1953년 1차 화폐개혁 (100圓 → 1환)</h3>
      <p className="g-p">
        한국전쟁으로 통화량이 불어나 물가가 치솟고 위조지폐까지 돌자 1953년 2월 15일 단행됐습니다. <strong>100圓 = 1환</strong>으로 단위를 절하하면서 새 돈으로 바꿔 주는 금액에 한도를 두고 나머지는 예금으로 묶어, 시중에 풀린 돈을 거둬들이는 효과를 노렸습니다. 다만 전쟁이 이어지던 때라 물가 안정 효과는 제한적이었습니다.
      </p>
      <h3 className="g-h3">1962년 2차 화폐개혁 (10환 → 1원)</h3>
      <p className="g-p">
        5·16 이후 군사정부(국가재건최고회의)가 1962년 6월 10일 단행했습니다. <strong>10환 = 1원</strong>으로 다시 절하했고, 명목 목표는 숨은 자금을 끌어내 산업 자금으로 쓰는 것이었지만 실제 동원 효과는 작았고 단위 절하만 정착했습니다. 이후 60년 넘게 같은 단위를 쓰고 있습니다.
      </p>
      <p className="g-p">
        두 개혁을 합치면 <strong>1원(현재) = 10환 = 1,000圓</strong>입니다. 그래서 같은 &lsquo;1만&rsquo;이라도 어느 해 돈이냐에 따라 결과가 크게 갈립니다. 1961년 1만환은 {NOW}년 가치로 약 {won(EX_1961.outputAmount)}이지만, 한 해 뒤 1962년 1만원은 약 {won(EX_1962.outputAmount)}입니다 — 물가가 한 해 사이에 그만큼 뛴 게 아니라 단위가 10배 커졌기 때문입니다.
      </p>
      <Callout tone="tip" title="개혁 연도는 한 해 앞을 고르세요">
        도구는 1953년 전체를 환, 1962년 전체를 원으로 계산합니다. 1953년 1~2월, 1962년 1~6월에 적힌 옛 단위 금액이라면 1952년·1961년을 선택해야 단위가 맞습니다.
      </Callout>

      <h2 className="g-h2">구매력 환산은 어떻게 계산되나</h2>
      <p className="g-p">
        본 도구의 환산은 통계청 KOSIS 소비자물가지수(CPI)를 기반으로 하며, 두 단계로 진행됩니다.
      </p>
      <ol className="g-list">
        <li><strong>단위 통일</strong> — 입력 금액을 화폐개혁 비율로 현재 원(1962년 이후 단위)에 맞춥니다. 50환(1960)은 5원으로, 1만 圓(1950)은 10원으로 바뀝니다.</li>
        <li><strong>CPI 비율 곱셈</strong> — <code>현재가치 = 단위 통일 금액 × CPI(대상 연도) ÷ CPI(입력 연도)</code>. 2020=100으로 맞춘 연간 지수를 씁니다. 대상 연도가 1962년 이전이면 마지막에 그해 단위로 되돌려 표시합니다.</li>
      </ol>
      <p className="g-p">
        CPI 시계열은 세 구간으로 이뤄집니다. 1965~2025년은 통계청 연간 지수(연간 상승률 공표치로 2020=100에서 역산), 2026년은 전년 대비 +2%를 가정한 추정치, 1945~1964년은 몇 개 기준 연도의 추정값 사이를 직선으로 이은 값입니다. 아래 표는 도구가 실제로 쓰는 지수와, 그해 1만(당시 단위)이 {NOW}년에 얼마인지를 계산 엔진에서 그대로 뽑은 것입니다.
      </p>
      <DataFigure n={2} title={`연도별 소비자물가지수와 ${NOW}년까지의 누적 배수`} unit="지수: 2020=100 · 금액: 원" source={<>자료: 통계청 소비자물가지수(1965~2025), 1965년 이전·{NOW}년은 추정 — 도구 계산 엔진에서 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">연도</th><th scope="col" className="r">CPI</th><th scope="col" className="r">{NOW}년까지 배수</th><th scope="col" className="r">당시 1만 → {NOW}년 가치</th></tr>
          </thead>
          <tbody>
            {FACTOR_ROWS.map(r => (
              <tr key={r.year}>
                <th scope="row">{r.year}{r.year < 1965 && <small>추정</small>}</th>
                <td className="r">{cpiStr(r.cpi)}</td>
                <td className="r">×{factorStr(r.factor)}</td>
                <td className="r em">1만{r.era.symbol} → {won(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        <strong>계산 예시</strong> — 1970년 1만원은 CPI가 {cpiStr(cpi(1970))}에서 {cpiStr(cpi(NOW))}로 올랐으므로 ×{factorStr(EX_1970.inflationFactor)}, 곧 {NOW}년 가치 약 <strong>{won(EX_1970.outputAmount)}</strong>입니다.
        1960년 짜장면 250환은 25원으로 바꾼 뒤 물가를 곱해 약 {won(EX_JJM.outputAmount)}이 됩니다.
        방향을 바꿔 {NOW}년 100만원을 1980년으로 되돌리면 약 {won(EX_BACK.outputAmount)}입니다.
      </p>
      <p className="g-p">
        CPI는 식료품·교통·주거·통신·교육 등 약 460개 품목의 가중평균이라 <strong>품목별 체감과 다를 수 있습니다</strong>. 특히 주택 매매가격은 지수에 들어가지 않아 집값 상승은 반영되지 않고, 가전제품·통신 요금처럼 품질이 좋아지며 값이 덜 오른 품목도 평균 안에 섞여 있습니다.
      </p>

      <h2 className="g-h2">결과를 해석할 때 자주 하는 실수</h2>
      <ul className="g-list">
        <li><strong>이미 원으로 환산된 옛 가격을 다시 넣기</strong> — 요즘 기사나 책은 1960년 짜장면을 &lsquo;25원&rsquo;처럼 현재 단위로 바꿔 적기도 합니다. 이 값을 1960년에 그대로 넣으면 도구는 25환으로 읽어 약 {won(EX_JJM_WRONG.outputAmount)}을 내놓습니다 — 10배 작게 나오는 것이죠. 1962년 이전 자료는 원문 단위(환·圓)인지 먼저 확인하세요.</li>
        {WAGE && (
          <li><strong>물가 환산값을 임금과 바로 비교하기</strong> — 도구의 가격 카드 기준 1970년 월평균 임금 {won(WAGE.y1970)}은 2024년 물가로 약 {won(WAGE.conv)}인데, 가격 카드의 2024년 월평균 임금({fmtCompact(WAGE.y2024)}원)은 그 약 {(WAGE.y2024 / WAGE.conv).toFixed(1)}배입니다. 물가 배수는 &lsquo;같은 물건을 사는 데 드는 돈&rsquo;이지 &lsquo;그 돈이 얼마나 큰 소득이었나&rsquo;가 아닙니다.</li>
        )}
        <li><strong>1965년 이전 결과를 정밀한 값으로 읽기</strong> — 기준 연도 사이를 직선으로 이었기 때문에 전쟁기처럼 물가가 한 해에 몇 배씩 뛴 시기는 연도별 편차가 뭉개집니다. 자릿수와 대략의 크기를 보는 용도로 쓰세요.</li>
        <li><strong>{NOW}년 값을 확정치로 보기</strong> — 올해 지수는 전년 대비 +2%를 가정한 추정입니다. 통계청 연간 지수가 나오면 결과가 조금 달라질 수 있습니다.</li>
      </ul>
      <Callout tone="note" title="법적 금액 산정과는 다릅니다">
        이 도구의 값은 소비자물가로 본 &lsquo;체감 구매력&rsquo;입니다. 오래된 채권·배상금·재산 가액처럼 법적 효력이 걸린 금액은 법원·세무 기준에 따라 따로 산정되므로 전문가와 확인하세요.
      </Callout>

      <Faq items={FAQ_LD} />

      {/* 함께 쓰면 좋은 도구 */}
      <section>
        <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { href: '/tools/finance/compound',     icon: '📈', name: '복리 계산기',           desc: '시간이 만드는 자산 시뮬' },
            { href: '/tools/finance/salary',       icon: '💰', name: '연봉 실수령액',          desc: '현재 기준 월급·세후' },
            { href: '/tools/finance/savings',      icon: '💰', name: '저축액 계산기',          desc: '월 저축으로 자산 만들기' },
            { href: '/tools/finance/inheritance',  icon: '🏛️', name: '상속·증여세 계산기',     desc: '관계별 공제·10년 합산' },
            { href: '/tools/finance/real-estate',  icon: '🏘️', name: '부동산 수익률',          desc: '매매 vs 임대 ROI' },
            { href: '/tools/finance/gold-converter', icon: '🥇', name: '금시세·돈 환산',       desc: '한돈·g·돈 단위 변환' },
          ].map((tool, i) => (
            <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
              <span style={{ fontSize: '22px' }}>{tool.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </ToolPage>
  )
}
