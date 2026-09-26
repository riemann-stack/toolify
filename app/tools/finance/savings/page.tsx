import Link from 'next/link'
import SavingsClient from './SavingsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  AGE_GROUPS, GRADES, JARS, FIXED_ITEMS, VAR_ITEMS, HOUSEHOLD_AVG_EXPENSE,
  calcSavings, calcSavingsRate, getGrade, monthlyForGoal, simulateGrowth, fmt,
} from './savingsUtils'

export const metadata = buildMetadata({
  path: '/tools/finance/savings',
  title: '저축액 계산기 — 저축률 진단 + 6 항아리 + 청년미래적금·ISA·연금저축',
  description: '수입·지출로 저축률을 진단하고 연령대별 권장 수준과 비교합니다. 6 항아리 분배, 청년미래적금·ISA·연금저축 절세 상품 비교, 1억 모으기 목표 역산까지.',
  keywords: ['저축률 계산', '월 저축 가능 금액', '권장 저축률', '6 항아리 모델', '청년미래적금', '청년도약계좌', 'ISA 계좌', '연금저축', 'IRP', '재무 진단', '목표 금액 역산'],
})

/* ── 가이드 표·예시: 모두 계산기와 같은 엔진(savingsUtils)에서 빌드 시점 생성 ── */
const fmtWon = (n: number) => Math.round(n).toLocaleString('ko-KR')

/** 입력칸 기본값(1인 가구·실수령 300만원) 그대로의 진단 */
const DEF_INCOME = 300
const DEF_FIXED = FIXED_ITEMS.reduce((a, e) => a + e.defaultMan, 0)
const DEF_VAR = VAR_ITEMS.reduce((a, e) => a + e.defaultMan, 0)
const DEF_SAVE = calcSavings(DEF_INCOME, DEF_FIXED + DEF_VAR)
const DEF_RATE = calcSavingsRate(DEF_INCOME, DEF_SAVE)
const DEF_GRADE = getGrade(DEF_RATE)
const DEF_EATOUT = VAR_ITEMS.find(e => e.id === 'eatout')?.defaultMan ?? 0
const CUT_RATE = calcSavingsRate(DEF_INCOME, DEF_SAVE + DEF_EATOUT * 0.3)
const CUT_GRADE = getGrade(CUT_RATE)
const REF_INCOME = DEF_INCOME

/** 표 1 — 등급 구간 */
const GRADE_ROWS = GRADES.map((g, i) => ({
  ...g,
  range: i === 0 ? `${g.rateMin}% 이상`
    : i === GRADES.length - 1 ? `${GRADES[i - 1].rateMin}% 미만 (적자 포함)`
    : `${g.rateMin}~${GRADES[i - 1].rateMin}% 미만`,
}))

/** 표 3 — 1억 목표 월 저축액 (만원) */
const GOAL_RATES = [0, 3, 5, 7]
const GOAL_ROWS = [3, 5, 7, 10, 15, 20].map(years => ({ years, monthly: GOAL_RATES.map(r => monthlyForGoal(10_000, years, r)) }))
const goalM = (years: number, rate: number) => fmt(monthlyForGoal(10_000, years, rate))

/** 적금(월초 납입·단리) vs 계산기 공식(월말 적립·월복리) — 월 100만원·12개월·연 3.5% */
const BANK_PRE = 1_000_000 * 0.035 / 12 * (12 * 13 / 2)
const BANK_POST = BANK_PRE * (1 - 0.154)
const GROW_1Y = simulateGrowth(100, 1, 3.5)
const TOOL_INT = ((GROW_1Y[GROW_1Y.length - 1]?.balance ?? 1_200) - 1_200) * 10_000

const FAQ_LD = [
            {
              q: '한국인 평균 저축률은 얼마인가요?',
              a: '기준으로 삼는 지표에 따라 크게 다릅니다. 가계동향조사가 발표하는 <strong>흑자율</strong>(처분가능소득 중 소비하고 남은 비율)은 2025년 분기별 약 30% 안팎이지만, 여기에는 대출 원금 상환도 포함돼 이 도구의 저축률(대출 원리금을 지출로 빼고 계산)과 바로 비교하기 어렵습니다. 한국은행 국민계정의 가계 순저축률은 이보다 훨씬 낮은 한 자릿수~10% 안팎입니다. 평균과 비교하기보다 연령대별 권장 저축률(20~50%)과 본인 목표를 기준으로 삼는 편이 실용적입니다.',
            },
            {
              q: '사회 초년생은 월급의 몇 %를 저축해야 하나요?',
              a: `이 계산기는 20대 사회초년생에게 <strong>30~40%</strong>를 권장 구간으로 둡니다. 월 실수령 250만원이면 75~100만원입니다. ① 부양 부담이 가장 적은 시기이고, ② 적립 기간이 길수록 복리 효과가 커지며(목표 역산 표에서 1억을 10년에 모으려면 연 5% 기준 월 약 ${goalM(10, 5)}만원, 20년이면 약 ${goalM(20, 5)}만원), ③ 결혼·내 집 마련 같은 큰 지출이 앞에 있기 때문입니다. 2026년 6월 출시된 청년미래적금은 정부기여금을 더해 주므로 만 19~34세라면 모집 기간(매년 6월·12월)에 가입 요건을 먼저 확인해 보세요.`,
            },
            {
              q: '고정비와 변동비 구분 기준은?',
              a: '<strong>고정비</strong>는 매월 일정 금액이 자동으로 빠져나가며 단기간 줄이기 어려운 비용 — 월세·관리비·대출 원리금·통신비·교통비 정기권·보험료. <strong>변동비</strong>는 본인 의사로 조절 가능한 비용 — 식비·외식·쇼핑·문화·여행. 저축률을 올리려면 조절 가능한 <strong>변동비부터 줄이고, 고정비는 1년에 한 번 재점검</strong>하는 것이 효과적입니다 — 계산기의 외식비 절감 시뮬레이션으로 절감률별 효과를 확인해 보세요.',
            },
            {
              q: '청년도약계좌는 아직 가입할 수 있나요?',
              a: '<strong>신규 가입은 2025년 12월에 종료</strong>됐습니다. 이미 가입한 사람은 만기(5년)까지 유지하면 정부 기여금과 비과세 혜택을 계속 받을 수 있으니, 중도해지보다는 유지를 먼저 검토하세요. 새로 시작하는 만 19~34세 청년은 2026년 6월 출시된 <strong>청년미래적금</strong>(월 최대 50만원·3년, 정부기여금 일반형 6%·우대형 12%)을 확인하면 됩니다. 소득 요건과 우대형 대상은 금융위원회·서민금융진흥원 공고로 확인하세요.',
            },
            {
              q: 'ISA와 연금저축 어느 게 더 좋은가요?',
              a: '목적이 다릅니다. <strong>ISA</strong>는 의무 가입기간 3년을 채우면 순이익 200만원(서민형 400만원)까지 비과세되고, 납입원금 범위의 중도 인출도 가능해 3~5년 뒤 쓸 중기 자금에 맞습니다. <strong>연금저축</strong>은 연말정산에서 납입액(연 600만원 한도)의 13.2~16.5%를 세액공제(최대 연 99만원)해 주는 대신 만 55세 이후 연금으로 받아야 혜택이 유지되는 노후 자금입니다. 직장인이라면 연금저축 600만원 → 여유가 있으면 IRP로 300만원 추가 → 나머지는 ISA 순으로 채우는 경우가 많습니다.',
            },
            {
              q: '비상금은 얼마나 모아야 하나요?',
              a: '흔히 <strong>월 생활비의 3~6개월치</strong>를 기준으로 삼습니다. 월 200만원을 쓴다면 600만~1,200만원입니다. 실직·질병 같은 일이 생겼을 때 다음 소득이 들어올 때까지 버티는 돈이므로, 소득이 불규칙한 자영업자·프리랜서는 더 넉넉히 잡는 편이 안전합니다. <strong>보관 장소</strong>는 바로 꺼낼 수 있는 파킹통장·CMA가 적당하고, 해지하면 이자가 깎이는 적금이나 가격이 흔들리는 펀드는 피하세요.',
            },
            {
              q: '6 항아리 모델은 한국 상황에 맞나요?',
              a: '비율은 고정된 규칙이 아니라 출발점입니다. 주거비 부담이 커서 생활비(NEC) 55%로는 부족하다면 <strong>NEC를 60~65%로 늘리고 놀이·기부 비율을 줄이는</strong> 식으로 조정하세요. 이때도 <strong>FFA(재정자유·투자)+LTSS(장기 목적 저축) 합계 20%</strong>는 지키는 편이 좋습니다. 계산기의 6 항아리 탭에서 비율을 바꾸면 합계 100%가 맞는지와 항아리별 금액을 바로 확인할 수 있습니다.',
            },
            {
              q: '1억 모으려면 월 얼마 저축?',
              a: `기간·수익률에 따라 다릅니다(월복리·세전). <strong>5년·연 3%</strong>: 월 약 ${goalM(5, 3)}만원 / <strong>5년·연 6%</strong>: 월 약 ${goalM(5, 6)}만원 / <strong>7년·연 6%</strong>: 월 약 ${goalM(7, 6)}만원 / <strong>10년·연 6%</strong>: 월 약 ${goalM(10, 6)}만원 / <strong>15년·연 7%</strong>: 월 약 ${goalM(15, 7)}만원. 기간이 길수록 이자가 이자를 낳아 필요한 월 저축액이 빠르게 줄어듭니다. 예금·적금으로 모은다면 이자소득세 15.4%를 뺀 세후 금리로 계산해야 실제에 가깝습니다. 목표 역산 탭에서 본인 조건으로 확인하세요.`,
            },
            {
              q: '부채가 많을 때 저축이 우선인가 상환이 우선인가?',
              a: '<strong>세후 금리끼리 비교</strong>하는 것이 기본입니다. 예금·적금 이자에는 15.4%가 원천징수되므로 연 3.5% 적금의 세후 수익률은 약 3.0%입니다. 대출 금리가 이보다 높다면 여윳돈으로 원금을 갚는 쪽이 확실한 수익입니다(중도상환수수료가 있는지 먼저 확인). 카드론·현금서비스처럼 금리가 높은 빚은 가장 먼저 갚고, 정부기여금이 붙는 청년 적금이나 세액공제가 큰 연금저축처럼 금리 이상의 혜택이 있는 상품은 예외로 따져 보세요. 어느 경우든 몇 달치 비상금은 남겨 두어야 급한 일에 다시 고금리 대출을 쓰지 않습니다.',
            },
          ]

export default function SavingsPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/savings">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />저축액 계산기
      </h1>
      <p className="tp-lead">
        수입·지출 → 저축률과 권장 수준 비교 + <strong style={{ color: 'var(--text)' }}>6 항아리 분배</strong>. 청년미래적금·ISA 절세 비교.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 절세 상품 기준 · 1인 가구 소비지출은 2024년 가계동향조사(168.9만원)" sources={[{"label":"국가데이터처 KOSIS","href":"https://kosis.kr"},{"label":"금융위원회 (청년미래적금)","href":"https://www.fsc.go.kr"},{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"금융감독원 금융상품한눈에","href":"https://finlife.fss.or.kr"},{"label":"소득세법 (연금계좌 세액공제 §59의3)","href":"https://www.law.go.kr/법령/소득세법"}]} />

      <SavingsClient />

      <GuideDivider />

      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>가구·연령 선택</strong> — 1인/2인/3인/4인+, 20대~50대. 연령대에 따라 비교할 권장 저축률 구간이 바뀝니다.</li>
        <li><strong>월 실수령액 입력</strong> — 세전 연봉이 아니라 통장에 들어오는 금액입니다. <Link href="/tools/finance/salary">연봉 실수령액 계산기</Link>로 먼저 확인하세요.</li>
        <li><strong>고정비·변동비 항목별 입력</strong> — 월세·통신·식비·외식·쇼핑 등 {FIXED_ITEMS.length + VAR_ITEMS.length}항목(만원 단위). 카드 명세서 최근 3개월 평균을 넣으면 한 달 치 들쭉날쭉함이 줄어듭니다.</li>
        <li><strong>결과 확인</strong> — 저축액·저축률·등급(S~D)과 권장 구간 비교, 외식비 절감 시뮬레이션을 봅니다.</li>
      </ol>
      <Callout tone="tip" title="목표부터 정하고 싶다면">
        &lsquo;목표 역산&rsquo; 탭에서 1억·전세 자금·내 집 마련 같은 목표를 고르면 필요한 월 저축액과 연도별 누적표가 바로 나옵니다.
      </Callout>

      <h2 className="g-h2">저축률은 이렇게 계산됩니다</h2>
      <p className="g-p">
        이 계산기의 저축률은 <strong>(월 수입 − 월 지출) ÷ 월 수입 × 100</strong>입니다. 수입은 실수령액과 부수입의 합, 지출은 고정비 {FIXED_ITEMS.length}항목과 변동비 {VAR_ITEMS.length}항목의 합입니다. 지출이 수입보다 크면 저축액이 음수(적자)로 표시됩니다.
      </p>
      <p className="g-p">
        <strong>계산 예시</strong> — 입력칸 기본값(1인 가구, 실수령 {DEF_INCOME}만원)을 그대로 두면 고정비 {DEF_FIXED}만원 + 변동비 {DEF_VAR}만원 = 지출 {DEF_FIXED + DEF_VAR}만원이라 저축액 {DEF_SAVE}만원, 저축률 <strong>{DEF_RATE.toFixed(1)}%</strong>로 {DEF_GRADE.grade}등급입니다. 여기서 외식·카페 {DEF_EATOUT}만원을 30% 줄이면 {fmt(DEF_EATOUT * 0.3, 1)}만원이 더 남아 저축률이 {CUT_RATE.toFixed(1)}%({CUT_GRADE.grade}등급)로 올라갑니다.
      </p>
      <DataFigure n={1} title="저축률 등급 구간 (이 계산기의 진단 기준)" source={<>자료: 계산기 엔진(savingsUtils GRADES) — 통계상 백분위가 아닌 안내용 구간</>}>
        <table>
          <thead>
            <tr><th scope="col">등급</th><th scope="col" className="r">저축률</th><th scope="col">의미</th></tr>
          </thead>
          <tbody>
            {GRADE_ROWS.map(g => (
              <tr key={g.grade}>
                <th scope="row">{g.grade} · {g.label}</th>
                <td className="r em">{g.range}</td>
                <td className="wrap">{g.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <ul className="g-list">
        <li><strong>대출 원리금은 지출로 계산됩니다.</strong> 원금 상환은 부채를 줄이는 일이라 사실상 자산 형성에 가깝지만, 이 도구는 보수적으로 지출에 넣습니다. 대출 원금 비중이 크다면 실제 순자산 증가 속도는 저축률보다 빠릅니다.</li>
        <li><strong>청약·연금 납입을 &lsquo;기타 고정&rsquo;에 넣으면 저축액에서 빠집니다.</strong> 청약통장·연금저축처럼 모이는 돈까지 저축률에 포함하고 싶다면 그 금액을 기타 고정에서 빼고 보세요.</li>
        <li><strong>연 단위 지출을 빠뜨리기 쉽습니다.</strong> 자동차 보험·재산세·명절·경조사처럼 1년에 몇 번 나가는 돈은 12로 나눠 월 지출에 더해야 저축률이 부풀려지지 않습니다.</li>
      </ul>

      <h2 className="g-h2">한국인 평균 저축률 vs 권장 저축률</h2>
      <p className="g-p">
        &lsquo;평균 저축률&rsquo;은 지표마다 크게 다릅니다. 가계동향조사의 흑자율은 처분가능소득에서 소비지출을 뺀 비율이라 대출 원금 상환까지 포함해 30% 안팎으로 나오고, 국민계정의 가계 순저축률은 그보다 훨씬 낮습니다. 이 계산기의 저축률은 대출 원리금을 지출로 빼므로 흑자율과 바로 비교하기 어렵습니다. 그래서 평균과 견주기보다 생애 단계별 권장 구간을 기준으로 삼는 편이 실용적이에요.
      </p>
      <DataFigure n={2} title={`연령대별 권장 저축률과 월 실수령 ${REF_INCOME}만원 기준 저축액`} unit="단위: 만원" source={<>자료: 계산기 엔진(savingsUtils AGE_GROUPS) — 공식 통계가 아닌 생애 단계별 가이드 값</>}>
        <table>
          <thead>
            <tr><th scope="col">생애 단계</th><th scope="col" className="r">권장 저축률</th><th scope="col" className="r">월 저축액</th><th scope="col">이유</th></tr>
          </thead>
          <tbody>
            {AGE_GROUPS.map(a => (
              <tr key={a.id}>
                <th scope="row">{a.label}</th>
                <td className="r">{a.rateMin}~{a.rateMax}%</td>
                <td className="r em">{fmt(REF_INCOME * a.rateMin / 100)}~{fmt(REF_INCOME * a.rateMax / 100)}</td>
                <td className="wrap">{a.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        1인 가구라면 지출 규모도 비교해 볼 수 있습니다. 2024년 가계동향조사에서 1인 가구 월평균 소비지출은 약 {HOUSEHOLD_AVG_EXPENSE['1'].expense}만원이었고, 계산기는 이 값과 내 지출의 차이를 보여줍니다. 2인 이상 가구는 가구원 수별 공식 값을 확인하기 전까지 비교를 생략합니다.
      </p>

      <h2 className="g-h2">6 항아리 모델이란?</h2>
      <p className="g-p">
        <strong>T. Harv Eker</strong>가 책 &quot;Secrets of the Millionaire Mind&quot;에서 소개해 널리 알려진 재정 분배 방법(JARS)입니다. 수입을 6개 목적에 비율로 먼저 나눠 두고, 각 항아리 안에서만 쓰는 방식이라 &lsquo;쓰고 남은 돈을 저축&rsquo;하는 습관을 &lsquo;나눠 둔 뒤 쓰는&rsquo; 습관으로 바꿔 줍니다. 괄호 안은 월 {REF_INCOME}만원일 때 금액입니다.
      </p>
      <ul className="g-list">
        {JARS.map(j => (
          <li key={j.id}><strong>{j.label} {j.pct}%</strong> ({fmt(REF_INCOME * j.pct / 100)}만원) — {j.desc.split('— ')[1] ?? j.desc}</li>
        ))}
      </ul>
      <p className="g-p">
        기본 비율에서 FFA+LTSS 합계는 20%로, 이 계산기의 B등급 하한과 같습니다. 월세·통신비 부담이 커 생활비(NEC) 55%로는 부족하다면 NEC를 늘리는 대신 놀이·기부 비율을 줄이고, FFA+LTSS 합계 20%는 지키는 식으로 조정해 보세요. 항아리는 <strong>별도 계좌·통장</strong>으로 나눠 두면 경계가 흐려지지 않습니다.
      </p>

      <h2 className="g-h2">목표 역산은 어떻게 계산하나 — 적금 이자와 다른 점</h2>
      <p className="g-p">
        목표 역산 탭은 매달 말 같은 금액을 넣고 월 단위로 복리가 붙는다고 가정한 <strong>적립식 미래가치 공식</strong>을 거꾸로 풉니다. 월 이율 r = 연 수익률 ÷ 12, 기간 n개월일 때 <strong>월 저축액 = 목표 금액 × r ÷ ((1 + r)<sup>n</sup> − 1)</strong>입니다. 수익률이 0%면 목표 금액을 개월 수로 나눕니다.
      </p>
      <DataFigure n={3} title="1억원을 모으는 데 필요한 월 저축액" unit="단위: 만원 · 세전" source={<>자료: 계산기 엔진(savingsUtils monthlyForGoal)으로 생성 — 월말 적립·월복리, 이자소득세 미반영</>}>
        <table>
          <thead>
            <tr><th scope="col">기간</th>{GOAL_RATES.map(r => <th scope="col" key={r} className="r">연 {r}%</th>)}</tr>
          </thead>
          <tbody>
            {GOAL_ROWS.map(row => (
              <tr key={row.years}>
                <th scope="row">{row.years}년</th>
                {row.monthly.map((m, i) => <td key={i} className={i === 0 ? 'r' : 'r em'}>{fmt(m, 1)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        기간이 두 배가 되면 필요한 월 저축액은 절반보다 더 줄어듭니다. 이자가 이자를 낳는 기간이 길어지기 때문입니다. 다만 은행 적금은 이 공식과 이자 계산 방식이 다릅니다. 정액 적금은 보통 매달 초 넣은 돈마다 남은 개월 수만큼 <strong>단리</strong>로 이자를 붙이고, 이자에서 <strong>15.4%</strong>(이자소득세 14% + 지방소득세 1.4%)를 원천징수합니다.
      </p>
      <p className="g-p">
        예를 들어 월 100만원·12개월·연 3.5% 적금은 세전 이자 {fmtWon(BANK_PRE)}원, 세후 {fmtWon(BANK_POST)}원입니다. 같은 조건을 이 계산기 공식(월말 적립·월복리·세전)으로 계산하면 {fmtWon(TOOL_INT)}원으로, 1년짜리에서는 세후 적금 이자와 비슷한 수준입니다. 예금·적금으로 목표를 세운다면 수익률 칸에 광고 금리 대신 <strong>세후 금리</strong>(연 3.5%라면 약 {fmt(3.5 * (1 - 0.154), 1)}%)를 넣는 편이 현실에 가깝습니다.
      </p>
      <Callout tone="warn" title="수익률이 높을수록 결과는 불확실합니다">
        주식·ETF의 기대수익률(6~8%)은 해마다 크게 흔들리는 평균값이라, 같은 기간이라도 끝나는 시점의 시장에 따라 목표에 못 미칠 수 있습니다. 목표 시점이 3년 이내로 가까운 돈은 원금 손실이 없는 예금·적금 금리로 계산하세요.
      </Callout>

      <h2 className="g-h2">청년미래적금 vs ISA vs 연금저축 비교</h2>
      <DataFigure n={4} title="절세·정책 저축 상품 한눈에 (2026년 9월 기준)" source={<>자료: 금융위원회·국세청 공고, 소득세법·조세특례제한법 — 가입 전 취급 금융기관 최신 공고 확인</>}>
        <table>
          <thead>
            <tr><th scope="col">상품</th><th scope="col">자격</th><th scope="col">한도/년</th><th scope="col">핵심 혜택</th></tr>
          </thead>
          <tbody>
            {[
              ['청년미래적금', '만 19~34세 + 소득 요건', '600만원 (월 50만원)', '정부기여금 일반형 6%·우대형 12% (2026.6 출시)'],
              ['ISA', '만 19세 이상 (근로소득 있는 만 15세 이상 포함)', '2,000만원', '순이익 200만원(서민형 400만원) 비과세, 초과분 9.9% 분리과세'],
              ['연금저축', '나이·소득 제한 없음', '600만원 (세액공제 한도)', '세액공제 16.5%·13.2% (최대 연 99만원)'],
              ['IRP', '소득 있는 근로자·자영업자', '900만원 (연금저축 합산)', '세액공제 최대 연 148.5만원 (연금저축 합산)'],
              ['주택청약종합저축', '무주택 세대주 + 총급여 7천만원 이하 (소득공제 요건)', '300만원 (소득공제 인정 한도)', '납입액 40% 소득공제 (연 120만원 한도)'],
              ['청년도약계좌', '기존 가입자만 (신규 2025.12 종료)', '840만원', '정부 기여금 월 최대 약 3.3만원 + 비과세'],
            ].map(row => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                <td className="wrap">{row[1]}</td>
                <td>{row[2]}</td>
                <td className="wrap">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        <strong>우선순위 예시</strong> — 청년이라면 <strong>청년미래적금 → 주택청약 → ISA → 연금저축</strong> 순(청년도약계좌 기존 가입자는 만기 유지 우선), 30~40대 직장인은 <strong>연금저축 600만원 → IRP 추가(합계 900만원) → ISA</strong> 순으로 채우는 경우가 많습니다. 연금저축 세액공제율은 총급여 5,500만원(종합소득 4,500만원) 이하 16.5%, 초과 13.2%입니다. 연금계좌는 만 55세 이후 연금으로 받아야 혜택이 유지되고, 중도해지하면 세액공제받은 납입액과 운용수익에 기타소득세 16.5%가 부과되므로 당장 쓸 수 있는 비상금과는 분리하세요.
      </p>

      <h2 className="g-h2">변동비 절감 5가지 팁</h2>
      <ol className="g-list">
        <li><strong>외식·배달 줄이기</strong> — 계산기의 외식·카페 기본값 {DEF_EATOUT}만원에서 30%를 줄이면 월 {fmt(DEF_EATOUT * 0.3, 1)}만원, 1년이면 {fmt(DEF_EATOUT * 0.3 * 12)}만원입니다.</li>
        <li><strong>구독 서비스 정리</strong> — OTT·음악·클라우드가 겹치지 않는지 카드 명세서에서 정기결제만 모아 보세요. 매일 쓰는 것만 남기면 됩니다.</li>
        <li><strong>커피·카페 가계부</strong> — 1잔 5,000원을 매일 사면 한 달 약 15만원입니다. 주 3회로 줄이기만 해도 월 8만원 넘게 남습니다.</li>
        <li><strong>충동 구매 24시간 룰</strong> — 장바구니에 담고 하루 뒤 다시 결정하면 필요 없는 구매를 걸러낼 수 있습니다.</li>
        <li><strong>고정비는 1년에 한 번 점검</strong> — 통신 요금제·보험 보장 중복·자동차 보험 갱신 조건을 해마다 비교하세요. 고정비는 한 번 줄이면 매달 효과가 이어집니다.</li>
      </ol>

      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: '금융위원회', href: 'https://www.fsc.go.kr' },
          { label: '국세청', href: 'https://www.nts.go.kr' },
        ]}
      >
        본 계산기의 저축률 진단·목표 역산은 단순 복리 모델 기반 참고용 추정치입니다. 청년미래적금 기여금·가입 요건, ISA·연금저축 한도와 세율 등 절세 상품 조건은 연도별로 변동되므로, 가입·투자 전 금융위원회·서민금융진흥원·국세청과 취급 금융기관의 최신 공고를 확인하세요.
      </Disclaimer>

      {/* 관련 도구 — 최신 도구들과 동일 포맷 */}
      <section style={{ marginTop: '40px' }}>
        <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기',  desc: '4대보험·세금 + 월 실수령' },
            { href: '/tools/finance/compound',    icon: '📈', name: '복리 계산기',           desc: '거치·적립·목표역산·시나리오' },
            { href: '/tools/finance/dividend',    icon: '💰', name: '월배당 목표 자산',      desc: '은퇴 자산 + 배당 ETF 시뮬' },
            { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속·증여세 계산기',     desc: '관계별 공제·10년 합산' },
            { href: '/tools/finance/loan',        icon: '💳', name: '대출이자 계산기',       desc: '원리금균등·갈아타기·중도상환' },
            { href: '/tools/finance/housing-score', icon: '🏠', name: '청약 가점 계산기',    desc: '84점 만점 자동 + 특공 자가진단' },
          ].map((tool, i) => (
            <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
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
