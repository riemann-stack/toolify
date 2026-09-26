import Link from 'next/link'
import FermiEstimateClient from './FermiEstimateClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/edu/fermi-estimate',
  title: '페르미 추정 계산기 — 변수 분해·시나리오 비교 사고력 훈련',
  description: '막막한 문제를 몇 개의 변수(최대 7개)로 쪼개 어림값을 구하는 페르미 추정 훈련 도구. 보수적·기준·낙관 시나리오 비교와 민감도 분석, TAM·SAM·SOM 시장 규모 추정, 컨설팅 면접 빈출 문제와 페르미 추정용 한국 통계표까지.',
  keywords: ['페르미추정', '페르미문제', '어림값계산', '논리적사고', '시장규모추정', 'TAM SAM SOM', '면접대비', '컨설팅사고법', '비즈니스분석', 'fermi estimation'],
})

/* ─────────────────────────────────────────────
   오차 누적 표 — 빌드 시 계산. 각 변수의 추정이 참값에서 전형적으로 ×2만큼(로그 표준편차 log 2) 벗어나고
   변수끼리 독립이라고 가정하면, 곱한 결과의 로그 오차는 √n배로 커진다(오차 전파). 모두 같은 방향으로 틀리면 2ⁿ배.
   '1/3~3배 안' 확률은 로그 정규 오차 가정의 P(|Z| ≤ log 3 / σ).
   ───────────────────────────────────────────── */
function erf(x: number): number {   // Abramowitz–Stegun 7.1.26 (오차 < 1.5×10⁻⁷)
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const withinFactor3 = (sigmaLog: number) => erf(Math.log(3) / sigmaLog / Math.SQRT2)
const ERROR_ROWS = [1, 2, 3, 4, 5, 6, 7].map(n => ({
  n,
  worst: 2 ** n,
  typical: 2 ** Math.sqrt(n),
  p3: withinFactor3(Math.sqrt(n) * Math.LN2),
}))
const DIRECT_P3 = withinFactor3(Math.LN10)   // 분해 없이 한 번에 어림, 전형 오차 ×10
const ROW4 = ERROR_ROWS[3]
const pct = (v: number) => `${Math.round(v * 100)}%`

/* 자주 쓰는 한국 통계 — 괄호 시점이 있는 값은 기관 발표 확인값, 나머지는 어림값 */
const KR_STATS: { cat: string; item: string; value: string; basis: string }[] = [
  { cat: '인구', item: '한국 인구', value: '약 5,100만 명', basis: '어림값' },
  { cat: '인구', item: '서울 인구', value: '약 940만 명', basis: '어림값' },
  { cat: '인구', item: '일반가구 수', value: '약 2,250만 가구', basis: '2025년 11월 1일, 인구주택총조사' },
  { cat: '인구', item: '취업자 수', value: '약 2,800만 명', basis: '어림값' },
  { cat: '소득·소비', item: '1인당 국민총소득(GNI)', value: '약 5,240만 원/년', basis: '2025년 잠정, 한국은행 국민계정' },
  { cat: '소득·소비', item: '가구 평균 소득', value: '약 7,400만 원/년', basis: '2024년 소득, 가계금융복지조사' },
  { cat: '소득·소비', item: '외식 비용', value: '가구당 월 50만 원 안팎', basis: '어림값' },
  { cat: '기업·시장', item: '사업체 수', value: '약 600만 개 (99% 이상 중소기업)', basis: '어림값' },
  { cat: '기업·시장', item: '카페', value: '약 9만 개', basis: '어림값' },
  { cat: '기업·시장', item: '편의점', value: '약 5만 개', basis: '어림값' },
  { cat: '교통·환경', item: '자동차 등록 대수', value: '약 2,670만 대', basis: '2026년 6월, 국토교통부' },
  { cat: '교통·환경', item: '전기차 등록 대수', value: '약 110만 대', basis: '2026년 6월, 국토교통부' },
  { cat: '교통·환경', item: '1인당 하루 음식물 쓰레기', value: '약 0.3kg', basis: '어림값' },
]

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

const FAQ_LD = [
              {
                q: '페르미 추정의 정확도는 어느 정도인가요?',
                a: '페르미 추정은 정확한 답을 구하는 것이 목적이 아닙니다. 흔히 <strong>실제 값의 1/3~3배 범위</strong>에 들어가면 좋은 추정으로 봅니다. 예를 들어 실제 값이 100이면 33~300 사이의 추정도 합리적입니다. 3은 √10(≈3.16)에 가까운 수라, 로그로 보면 &lsquo;자릿수(order of magnitude)가 반 자리 이내로 맞았다&rsquo;는 뜻입니다. 페르미 추정의 핵심 가치는 <strong>정확성이 아닌 사고 과정과 의사결정 도움</strong>입니다.',
              },
              {
                q: '페르미 추정에서 가장 중요한 변수는 어떻게 찾나요?',
                a: '<strong>민감도 분석</strong>을 통해 찾을 수 있습니다. 각 변수를 동일한 비율(예: +20%)로 변경했을 때 결과가 가장 크게 변하는 변수가 가장 민감한 변수입니다. 본 도구의 <strong>시나리오 비교 탭</strong>에서 자동으로 민감도 그래프를 표시합니다. 가장 민감한 변수일수록 추정 정확도에 큰 영향을 주므로, 해당 변수에 대해서는 더 정확한 데이터를 찾는 것이 좋습니다.',
              },
              {
                q: '페르미 추정으로 시장 규모를 정말 추정할 수 있나요?',
                a: '네, 비즈니스 분석에서 매우 자주 사용되는 방법입니다. 특히 신사업·창업 단계에서 정확한 시장 데이터가 없을 때 <strong>페르미 추정으로 TAM·SAM·SOM을 계산하는 것이 표준</strong>입니다. 다만 의사결정에는 다음을 함께 활용하세요: ① 실제 시장 조사(설문·인터뷰), ② 산업 보고서(KISDI, 한국지능정보사회진흥원(NIA) 등), ③ 경쟁사 분석. 페르미 추정은 빠른 초기 추정에 적합하며, 구체적 사업 결정에는 정밀 데이터가 필요합니다.',
              },
              {
                q: '변수가 너무 많으면 추정이 더 정확해지나요?',
                a: '<strong>꼭 그렇지는 않습니다.</strong> 변수를 쪼개면 각 변수는 근거를 대기 쉬워지지만, 곱할 때마다 오차도 함께 곱해집니다. 다행히 서로 독립인 오차는 일부 상쇄되어 전형적인 오차는 변수 개수의 제곱근 비율로만 커집니다(가이드의 오차 누적 표 참고). 그래서 &lsquo;근거를 댈 수 있는 수준까지만&rsquo; 쪼개는 것이 원칙이고, 더 쪼개도 근거가 나아지지 않는 변수는 합쳐 두는 편이 낫습니다. 정해진 표준 개수는 없으며, 이 도구는 최대 7개까지 받고 템플릿은 문제에 따라 2~4개 변수로 나뉘어 있습니다.',
              },
              {
                q: '추정 결과를 어떻게 검증하나요?',
                a: '다음 방법으로 검증할 수 있습니다: ① <strong>다른 방식으로 다시 추정</strong>(Top-down vs Bottom-up — 시장 규모를 인구로 추정 vs 매출로 추정), ② <strong>실제 데이터와 비교</strong>(통계청·산업협회 보고서), ③ <strong>시나리오 비교</strong>(보수적·기준·낙관적이 합리적 범위인지), ④ <strong>동료·전문가 의견</strong>(다른 사람도 비슷한 추정을 하는지). 페르미 추정은 항상 검증과 함께해야 정확한 의사결정에 활용 가능합니다.',
              },
            ]

export default function FermiEstimatePage() {
  return (
    <ToolPage width={760} slug="/tools/edu/fermi-estimate">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />페르미 추정 계산기
      </h1>
      <p className="tp-lead">
        막막한 문제를 변수로 쪼개고 시나리오로 비교해 <strong style={{ color: 'var(--text)' }}>대략 답을 추정</strong>하는 사고력 훈련.
      </p>

      <FermiEstimateClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 페르미 추정이란? ── */}
        <div>
          <h2 className="g-h2">
            페르미 추정이란?
          </h2>
          <p className="g-p">
            <strong>페르미 추정(Fermi Estimation)</strong>은 노벨 물리학상 수상자 <strong>엔리코 페르미</strong>가 즐겨 쓰던 어림 계산법으로,
            정확한 자료가 없는 질문을 근거를 댈 수 있는 작은 숫자 몇 개의 곱으로 바꿔 답의 크기를 가늠합니다.
          </p>
          <ul className="g-list">
            <li><strong>큰 문제를 작은 변수로</strong> — &lsquo;모르겠다&rsquo; 대신 &lsquo;인구 × 비율 × 빈도&rsquo;처럼 각각은 짐작할 수 있는 양으로 쪼갭니다.</li>
            <li><strong>근거 있는 가정</strong> — 인구·가구 수처럼 공식 통계가 있는 값은 통계를 쓰고, 비율·빈도는 왜 그 숫자인지 한 줄로 설명할 수 있어야 합니다.</li>
            <li><strong>곱해서 자릿수 맞추기</strong> — 목표는 소수점까지의 정답이 아니라 &lsquo;수만인가 수백만인가&rsquo;를 맞히는 것입니다.</li>
            <li><strong>과정이 곧 결과물</strong> — 어떤 가정이 결과를 가장 크게 좌우하는지 드러나므로, 다음에 무엇을 조사해야 할지가 분명해집니다.</li>
          </ul>
          <Callout tone="tip" title="가장 유명한 문제">
            &quot;시카고에 피아노 조율사는 몇 명일까?&quot; — 인구 → 가구 → 피아노 보유 비율 → 조율 빈도 → 조율사 한 명의 연간 작업량 순으로 쪼갭니다.
            흔히 소개되는 풀이(인구 500만, 가구당 2명, 20가구 중 1가구가 매년 조율, 조율 1건 2시간, 조율사 연 2,000시간 근무)로 계산하면 약 125명이 나옵니다.
            실제 숫자는 집계 시점과 출처에 따라 수십~수백 명으로 다르게 인용되는데, 중요한 것은 &lsquo;수십만 명&rsquo;도 &lsquo;세 명&rsquo;도 아닌 수백 명 규모라는 자릿수입니다.
            이 도구의 &lsquo;서울 피아노 조율사 수&rsquo; 템플릿이 같은 구조의 한국판입니다.
          </Callout>
        </div>

        {/* ── 2. 4단계 ── */}
        <div>
          <h2 className="g-h2">
            페르미 추정 4단계
          </h2>
          <ol className="g-list">
            <li><strong>문제 정의</strong> — &lsquo;무엇을, 어느 범위에서, 어떤 단위로&rsquo;를 먼저 정합니다. &lsquo;서울 커피 판매량&rsquo;보다 &lsquo;서울에서 하루에 팔리는 아메리카노 잔 수&rsquo;가 계산 가능한 질문입니다.</li>
            <li><strong>변수 분해</strong> — 결과 단위가 맞도록 변수를 곱셈(필요하면 나눗셈)으로 잇습니다. 서로 겹치지 않게, 각 변수에 근거를 댈 수 있을 만큼만 쪼갭니다.</li>
            <li><strong>가정 입력</strong> — 공식 통계가 있는 값(인구·가구 수)은 통계를, 비율·빈도는 경험이나 작은 표본에서 나온 근거를 씁니다. 변수마다 최솟값·최댓값도 함께 적어 둡니다.</li>
            <li><strong>곱셈·검증</strong> — 기준값으로 곱한 뒤 보수적·낙관적 시나리오로 범위를 보고, 가능하면 다른 경로(매출에서 거꾸로, 공급 쪽에서)로 한 번 더 추정해 자릿수가 맞는지 확인합니다.</li>
          </ol>
        </div>

        {/* ── 3. 활용 분야 ── */}
        <div>
          <h2 className="g-h2">
            페르미 추정의 활용 분야
          </h2>
          <ul className="g-list">
            <li><strong>비즈니스·창업</strong> — 신사업 시장 규모(TAM·SAM·SOM), 매장 하루 매출, 앱 사용자 수처럼 자료가 없는 초기 숫자를 가늠할 때</li>
            <li><strong>면접·교육</strong> — 컨설팅·기획 직군 면접의 추정 문제, 경영학 케이스 스터디, 과학 수업의 어림 계산 연습</li>
            <li><strong>정책·연구</strong> — 일회용 컵·음식물 쓰레기 같은 환경 부담, 전기차 충전 전력처럼 정밀 조사 전에 규모를 먼저 보는 단계</li>
            <li><strong>일상 호기심</strong> — 지구 해변의 모래알 수, 평생 먹는 쌀알 수처럼 감이 오지 않는 큰 수를 자릿수로 체감할 때</li>
          </ul>
        </div>

        {/* ── 4. 시나리오 비교 ── */}
        <div>
          <h2 className="g-h2">
            시나리오 비교의 가치
          </h2>
          <p className="g-p">
            페르미 추정의 결과는 <strong>숫자 하나가 아니라 범위</strong>로 읽어야 합니다. 이 도구의 시나리오 탭은 변수마다 슬라이더의 최솟값·최댓값(없으면 기준값의 ±30%)을
            하나씩 넣어 보고, 결과를 낮추는 쪽 끝값을 모아 <strong>보수적</strong>, 높이는 쪽 끝값을 모아 <strong>낙관적</strong> 시나리오를 만듭니다.
            나눗셈으로 들어가는 변수(예: 피자집 1개당 서비스 인구)는 값이 클수록 결과가 작아지므로 자동으로 반대쪽에 배정됩니다.
          </p>
          <p className="g-p">
            민감도는 각 변수만 20% 올렸을 때 결과가 몇 % 바뀌는지로 계산합니다. 단순 곱셈 변수는 모두 20%로 같게 나오고, 나눗셈 변수는 약 17%(1 − 1/1.2)로 조금 작게 나옵니다.
            그래서 민감도가 비슷할 때는 &lsquo;범위가 가장 넓은 변수&rsquo;, 즉 최솟값과 최댓값의 비가 가장 큰 변수부터 자료를 찾아 좁히는 것이 효과적입니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 18px',
            marginTop: 12,
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.85,
          }}>
            <strong style={{ color: 'var(--text)' }}>예: &quot;서울 하루 아메리카노 판매량&quot; 템플릿 기본값</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>보수적: <strong style={{ color: 'var(--cyan-600)' }}>약 13.5만 잔</strong></li>
              <li>기준: <strong style={{ color: 'var(--accent)' }}>약 203만 잔</strong></li>
              <li>낙관적: <strong style={{ color: 'var(--yellow-700)' }}>약 1,440만 잔</strong></li>
            </ul>
            → 네 변수의 범위 끝값이 겹치면 보수적과 낙관적이 100배 가까이 벌어집니다. 이 템플릿에선 &lsquo;매일 커피 마시는 비율&rsquo;(10~60%, 6배)과 &lsquo;1인 평균 잔 수&rsquo;(0.5~3잔, 6배)의 범위가 가장 넓으니, 이 두 변수부터 설문·통계로 좁혀 보세요.
          </div>
        </div>

        {/* ── 4.5 오차 누적 ── */}
        <div>
          <h2 className="g-h2">
            변수를 쪼개면 오차는 얼마나 쌓일까?
          </h2>
          <p className="g-p">
            곱셈으로 이어진 추정에서 각 변수의 오차는 결과에 곱해져 들어갑니다. 변수 하나하나가 대개 참값의 절반~두 배 안에서 틀린다고(전형 오차 ×2) 해 보죠.
            모든 변수가 같은 방향으로 두 배씩 틀리는 최악의 경우 결과는 2ⁿ배 벗어나지만, 서로 독립인 오차는 일부 상쇄되어 전형적인 오차는 2^√n배 정도로만 커집니다.
            아래 표는 이 가정(각 변수의 로그 오차가 표준편차 log 2인 정규분포)으로 계산한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>곱하는 변수 수</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>최악 (모두 같은 방향)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>전형적 오차</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>1/3~3배 안에 들 확률</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_ROWS.map(r => (
                  <tr key={r.n} style={rowBorder}>
                    <th scope="row" style={{ ...tdNum, fontWeight: 600, textAlign: 'left' }}>{r.n}개</th>
                    <td style={{ ...tdNum, textAlign: 'right' }}>×{r.worst}</td>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>×{r.typical.toFixed(1)}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{pct(r.p3)}</td>
                  </tr>
                ))}
                <tr style={{ ...rowBorder, background: 'var(--bg2)' }}>
                  <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>쪼개지 않고 한 번에 어림 (전형 오차 ×10)</th>
                  <td style={{ ...tdNum, textAlign: 'right' }}>—</td>
                  <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>×10</td>
                  <td style={{ ...tdNum, textAlign: 'right' }}>{pct(DIRECT_P3)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            표에서 보듯 변수 {ROW4.n}개를 각각 두 배 안쪽으로 맞히면 결과가 &lsquo;1/3~3배&rsquo; 안에 들 확률은 약 {pct(ROW4.p3)}로,
            감으로 한 번에 찍어 열 배쯤 틀리는 경우({pct(DIRECT_P3)})보다 높습니다. 이것이 페르미 추정이 통하는 이유입니다.
            반대로 변수를 늘려도 각 변수의 근거가 나아지지 않으면 오차만 쌓이므로, 쪼갤 때마다 &lsquo;이 변수는 전체를 직접 짐작하는 것보다 확실히 쉬운가?&rsquo;를 물어보세요.
            변수끼리 서로 연관되어 있으면(예: 커피 마시는 비율과 1인당 잔 수를 모두 높게 잡는 습관) 상쇄가 일어나지 않아 최악 쪽에 가까워진다는 점도 기억해 둘 만합니다.
          </p>
        </div>

        {/* ── 5. 한국 통계 ── */}
        <div>
          <h2 className="g-h2">
            자주 쓰는 한국 통계 (페르미 추정용)
          </h2>
          <p className="g-p">
            인구·가구 수처럼 공식 통계가 있는 값은 어림하지 말고 통계를 쓰는 것이 페르미 추정의 기본입니다. 템플릿과 자유 추정에서 자주 쓰는 값을 모았습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>분야</th>
                  <th scope="col" style={th}>항목</th>
                  <th scope="col" style={th}>값</th>
                  <th scope="col" style={th}>기준 시점·출처</th>
                </tr>
              </thead>
              <tbody>
                {KR_STATS.map(r => (
                  <tr key={r.item} style={rowBorder}>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.cat}</td>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{r.item}</th>
                    <td style={{ ...tdNum, fontWeight: 700 }}>{r.value}</td>
                    <td style={{ ...td, color: r.basis === '어림값' ? 'var(--muted)' : 'var(--text)' }}>{r.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            기준 시점이 적힌 값은 해당 기관 발표치를 반올림한 것이고, &lsquo;어림값&rsquo;은 추정 연습용 대략치입니다. 보고서·사업계획서에 쓸 때는 반드시 KOSIS 등에서 최신 값을 확인하세요.
          </p>
          <UpdatedMeta
            date="2026년 9월"
            basis="페르미 추정용 한국 통계 어림값"
            sources={[
              { label: 'KOSIS 국가통계포털', href: 'https://kosis.kr' },
              { label: '한국은행 ECOS', href: 'https://ecos.bok.or.kr' },
              { label: '국토교통 통계누리', href: 'https://stat.molit.go.kr' },
            ]}
          />
        </div>

        {/* ── 6. 컨설팅 면접 ── */}
        <div>
          <h2 className="g-h2">
            컨설팅 면접에서의 페르미 추정
          </h2>
          <p className="g-p">
            컨설팅·전략기획 직군 면접에서는 &quot;한국에 자동차 정비소는 몇 개 있을까?&quot;, &quot;강남역 앞 카페의 하루 매출은?&quot;, &quot;한국에서 1년에 팔리는 우산은 몇 개?&quot;
            같은 질문이 단골로 나옵니다. 면접관이 보는 것은 숫자 자체보다 다음과 같은 과정입니다.
          </p>
          <ol className="g-list">
            <li><strong>논리 구조</strong> — 수요 쪽(사람·가구)으로 풀지 공급 쪽(매장·설비)으로 풀지 먼저 밝히고, 변수가 빠짐없이 겹치지 않게 나뉘었는가</li>
            <li><strong>가정의 근거</strong> — &lsquo;20%&rsquo;라고만 하지 않고 왜 20%인지 한마디 근거를 붙였는가</li>
            <li><strong>계산</strong> — 큰 수를 반올림해 암산하기 쉽게 다루고, 단위를 끝까지 맞췄는가</li>
            <li><strong>검증</strong> — 결과를 상식이나 다른 경로의 추정과 비교해 말이 되는지 확인했는가</li>
            <li><strong>전달</strong> — 중간 과정을 소리 내어 설명해 면접관이 따라올 수 있었는가</li>
          </ol>
          <p className="g-p">
            연습할 때는 이 도구의 자유 추정 탭에서 변수를 직접 쪼개 본 뒤, 시나리오 탭에서 어느 가정이 결과를 가장 크게 흔드는지 확인하고 그 가정의 근거를 말로 설명해 보세요.
          </p>
        </div>

        {/* ── 7. TAM·SAM·SOM ── */}
        <div>
          <h2 className="g-h2">
            TAM·SAM·SOM 분석 (시장 규모)
          </h2>
          <p className="g-p">
            시장 규모를 세 겹으로 나눠 보는 틀로, 사업계획서와 투자 설명 자료에서 흔히 씁니다. 바깥에서 안으로 좁혀 갈수록 현실적인 숫자가 됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'TAM', n: 'Total Addressable Market', d: '전체 시장 규모. "이 제품이 모든 사람에게 팔린다면?" 가장 큰 추정값.', c: 'var(--yellow-700)' },
              { t: 'SAM', n: 'Serviceable Available Market', d: '실제 도달 가능한 시장. "내 회사가 서비스 가능한 범위?" TAM의 일부.', c: 'var(--orange-600)' },
              { t: 'SOM', n: 'Serviceable Obtainable Market', d: '실제 점유 가능한 시장. "현실적으로 얼마를 가져올 수 있나?" SAM의 일부.', c: 'var(--red-600)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 800, color: g.c, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontStyle: 'italic' }}>{g.n}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            marginTop: 12,
          }}>
            <div><span style={{ color: 'var(--yellow-700)' }}>TAM</span> = 인구 × 1인당 소비</div>
            <div><span style={{ color: 'var(--orange-600)' }}>SAM</span> = TAM × 도달 비율</div>
            <div><span style={{ color: 'var(--red-600)' }}>SOM</span> = SAM × 점유 비율</div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 도구의 &lsquo;SaaS 한국 TAM&rsquo; 템플릿은 대상 기업 70만 개 × 제품 필요성 30% × 구매 의향 10% × 연간 결제 60만 원으로 약 126억 원을 냅니다.
            구조상 구매 의향까지 곱했으므로 엄밀히는 TAM보다 SAM에 가까운 값입니다. 흔한 실수는 TAM을 크게 부풀린 뒤 &lsquo;그중 1%만 가져와도&rsquo;라고 말하는 것인데,
            점유율 1%의 근거(영업 인력, 마케팅 예산, 경쟁사 수)가 없으면 SOM은 설득력이 없습니다. SOM은 위에서 깎아 내려오기보다
            &lsquo;첫해 영업 가능한 고객 수 × 전환율 × 객단가&rsquo;처럼 아래에서 쌓아 올려 교차 확인하는 편이 안전합니다.
          </p>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 계산기',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/review-interval',   icon: '🧠', name: '복습 간격 계산기',       desc: '망각곡선·SM-2 학습 일정' },
              { href: '/tools/edu/cognitive-test',    icon: '🧠', name: '인지 능력 테스트',       desc: '반응속도·스트룹·이중 과제' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 계산기',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',     desc: '추가 교육 도구 더보기' },
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

        {/* ── 10. 학습 자료 ── */}
        <div>
          <h2 className="g-h2">
            추천 학습 자료
          </h2>
          <ul className="g-list">
            <li><em>How to Solve It</em> — George Pólya. 문제를 작은 문제로 나눠 푸는 사고법의 고전</li>
            <li><em>Guesstimation</em> — Lawrence Weinstein·John Adam. 과학·일상 속 페르미 문제 풀이 모음</li>
            <li><em>Thinking in Bets</em> — Annie Duke. 불확실한 상황에서 확률로 판단하는 법</li>
            <li><em>Case in Point</em> — Marc Cosentino. 컨설팅 케이스 면접 준비서</li>
          </ul>
        </div>

      </div>
    </ToolPage>
  )
}
