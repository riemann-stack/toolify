import LottoClient from './LottoClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { AVG_PRIZES, PRICE_PER_GAME, calcAfterTax } from './lottoUtils'

export const metadata = buildMetadata({
  path: '/tools/life/lotto',
  title: '로또 번호 생성기 — 8가지 모드·번호 분석·확률 시뮬',
  description:
    '8가지 생성 모드 + 번호 통계 분석 + 가상 추첨 시뮬로 1등 확률 1/8,145,060 체감까지. 생일 번호의 함정·등수별 당첨 확률·한국 로또 당첨금 세금 정리 포함.',
  keywords: [
    '로또 번호 생성기', '로또 6/45', '로또 번호 분석', '로또 확률 시뮬레이션',
    '1등 당첨 확률', '균형형 번호', '생일 번호 제외', '로또 통계',
    '로또 번호 추첨', '디지털 로또', '로또 시뮬레이터', '로또 1등 확률', '로또 번호 추천',
  ],
})

/* ── 가이드 수치는 모두 빌드 시 계산 (조합론 + 도구의 lottoUtils) ── */
const C = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}
const TOTAL = C(45, 6) // 8,145,060
const nf = (n: number, d = 0) => n.toLocaleString('ko-KR', { maximumFractionDigits: d })

/* 등수별 경우의 수 — 보너스 번호는 당첨 6개와 별도 1개 */
const PRIZE_ROWS = [
  { g: 1, cond: '6개 일치', ways: C(6, 6), how: 'C(6,6)' },
  { g: 2, cond: '5개 + 보너스', ways: C(6, 5) * 1, how: 'C(6,5) × 1' },
  { g: 3, cond: '5개 일치', ways: C(6, 5) * C(38, 1), how: 'C(6,5) × C(38,1)' },
  { g: 4, cond: '4개 일치', ways: C(6, 4) * C(39, 2), how: 'C(6,4) × C(39,2)' },
  { g: 5, cond: '3개 일치', ways: C(6, 3) * C(39, 3), how: 'C(6,3) × C(39,3)' },
].map(r => {
  const odds = TOTAL / r.ways
  return {
    ...r,
    odds: odds >= 1000 ? nf(Math.round(odds)) : nf(odds, 1),
    per10k: nf((r.ways / TOTAL) * 10000, r.g <= 2 ? 3 : r.g === 3 ? 2 : 1),
    prize: AVG_PRIZES[r.g],
    ev: (AVG_PRIZES[r.g] * r.ways) / TOTAL,
  }
})
const EV_TOTAL = PRIZE_ROWS.reduce((s, r) => s + r.ev, 0)
const YEARS_5_PER_WEEK = Math.round(TOTAL / 5 / 52)

/* 홀짝 분포 — 1~45 중 홀수 23개·짝수 22개 */
const ODD_ROWS = Array.from({ length: 7 }, (_, k) => ({
  k, pct: (C(23, k) * C(22, 6 - k)) / TOTAL * 100,
}))
const ALL_UNDER_31 = C(31, 6) / TOTAL * 100
/* 6개 합이 100~170인 조합 비율 (합 균형형 모드 범위) */
const SUM_100_170 = (() => {
  const dp = Array.from({ length: 7 }, () => new Array<number>(271).fill(0))
  dp[0][0] = 1
  for (let n = 1; n <= 45; n++) for (let k = 6; k >= 1; k--) for (let s = 270; s >= n; s--) dp[k][s] += dp[k - 1][s - n]
  let c = 0
  for (let s = 100; s <= 170; s++) c += dp[6][s]
  return c / TOTAL * 100
})()

/* 세금 예시 — 도구의 calcAfterTax(과세최저한 200만원·3억 초과분 33%) */
const TAX_ROWS = [
  { label: '5등 (고정)', gross: 5_000 },
  { label: '4등 (고정)', gross: 50_000 },
  { label: '3등 (평균 수준)', gross: AVG_PRIZES[3] },
  { label: '과세최저한 경계', gross: 2_000_000 },
  { label: '경계 바로 위', gross: 2_100_000 },
  { label: '2등 (평균 수준)', gross: AVG_PRIZES[2] },
  { label: '1등 (평균 수준)', gross: AVG_PRIZES[1] },
].map(r => ({ ...r, ...calcAfterTax(r.gross) }))
const T_1ST = TAX_ROWS[TAX_ROWS.length - 1]

const FAQ_LD = [
              {
                q: '자동과 수동 중 당첨 확률이 높은 것은?',
                a: '<strong>수학적으로 자동과 수동의 당첨 확률은 정확히 동일</strong>합니다. 각 번호 조합은 독립적이며, 어떤 번호도 다른 번호보다 당첨 확률이 높지 않습니다. 과거 당첨 번호가 미래 결과에 영향을 주지 않습니다(독립 시행). 본 도구의 8가지 생성 모드는 모두 1/8,145,060 확률이며, 차이는 조합의 패턴과 동시 당첨자 수에만 영향이 있을 수 있습니다.',
              },
              {
                q: '균형형이나 생일 제외형이 당첨에 유리한가요?',
                a: '<strong>당첨 확률 자체는 변화 없습니다</strong> (모두 1/8,145,060). 그러나 부수적 효과는 있습니다 — 균형형은 1,2,3,4,5,6 같은 단순 패턴 회피, 생일 제외형은 32~45 포함으로 흔한 조합 회피 → <strong>1등 동시 당첨자 수가 줄어들어 당첨금 분배액 ↑</strong>. 이는 1등 당첨 시 효과이며, 당첨 자체 확률은 동일합니다.',
              },
              {
                q: '확률 시뮬레이터의 결과는 정확한가요?',
                a: '본 도구의 시뮬레이터는 무작위 추첨을 반복한 통계적 결과입니다. 10,000회 시뮬레이션 시 <strong>5등 약 224회·4등 약 14회·3등 0~1회</strong> 예상이며, 1·2등은 거의 모든 경우 0회입니다. 회수금은 4·5등 고정 금액과 1~3등 역대 평균 수준의 가정 당첨금(1등 20억·2등 5,500만·3등 145만 원)으로 계산하므로, 실제 회차의 당첨금과는 다릅니다. 시뮬레이션은 <strong>학습·재미용으로만 활용</strong>하세요.',
              },
              {
                q: '로또 번호 통계가 미래 당첨 번호 예측에 도움이 되나요?',
                a: '<strong>도움이 되지 않습니다.</strong> 로또는 매 회차 독립 시행이며, "자주 나온 번호" "안 나온 번호"는 다음 회차와 무관합니다. 이를 <strong>"도박사의 오류(Gambler&apos;s Fallacy)"</strong>라고 합니다. 예: "지난 10회 7번이 안 나왔으니 이번엔 나올 것" → 잘못된 추론. 각 회차의 7번 출현 확률은 항상 6/45입니다. 본 도구의 통계는 학습 목적이며 예측 X.',
              },
              {
                q: '3등에 당첨되면 세금을 떼나요?',
                a: '복권 당첨금은 <strong>건별 200만원 이하이면 과세하지 않습니다</strong>(소득세법 제84조 과세최저한, 2023년 1월 지급분부터 5만원 → 200만원 상향). 3등은 회차마다 금액이 다르지만 역대 평균이 150만원 안팎이라 비과세인 경우가 많고, 판매액이 많고 당첨자가 적은 회차에 200만원을 넘으면 <strong>200만원을 빼지 않고 당첨금 전액</strong>에 22%(소득세 20% + 지방소득세 2%)가 원천징수됩니다.',
              },
              {
                q: '당첨금은 어디서, 언제까지 받나요?',
                a: '판매점 구매분 기준으로 <strong>4·5등은 전국 로또 판매점</strong>, 2·3등은 금액과 관계없이 NH농협은행 전국 지점, <strong>1등은 NH농협은행 본점</strong>에서 신분증과 당첨 복권을 가지고 받습니다(인터넷 구매분은 200만원 이하 당첨금이 예치금으로 자동 지급). 지급 기한은 <strong>지급개시일부터 1년</strong>이며, 지나면 받을 수 없고 복권기금으로 귀속됩니다. 세부 절차는 동행복권 당첨자 안내에서 확인하세요.',
              },
              {
                q: '로또에 얼마까지 쓰는 것이 적절한가요?',
                a: '건강한 구매를 위한 일반적인 예산 가이드(예시) — <strong>가처분 소득의 1% 안팎</strong> (예: 월 200만원이면 월 2만원 정도), "오락비"로 명확히 분류, 손실을 만회하려는 추가 구매 X, 가족·일·일상에 영향 없는 범위. 신호 점검: 정해진 예산을 자주 초과 / 손실 만회 위해 더 사기 / 끊기 어렵다고 느낌 → 즉시 <a href="tel:1336">1336</a> 상담. 로또는 일확천금이 아닌 <strong>"재미"</strong>로 즐기시기 바랍니다.',
              },
            ]

export default function LottoPage() {
  return (
    <ToolPage width={880} slug="/tools/life/lotto">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />로또 번호 생성기
      </h1>
      <p className="tp-lead">
        8가지 생성 모드 + 번호 통계 분석 + 가상 추첨으로 <strong style={{ color: 'var(--text)' }}>1등 체감</strong>까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="등수별 확률·패턴 비율은 조합론으로 빌드 시 계산 · 당첨금 배분은 동행복권 로또6/45 규정 · 세금은 소득세법 제84조(과세최저한 200만원)·제129조(3억 초과분 30%) + 지방소득세"
        sources={[
          { label: '동행복권 — 로또6/45 소개', href: 'https://www.dhlottery.co.kr/lt645/intro' },
          { label: '소득세법 제84조(기타소득의 과세최저한)', href: 'https://www.law.go.kr/법령/소득세법/제84조' },
          { label: '소득세법 제129조(원천징수세율)', href: 'https://www.law.go.kr/법령/소득세법/제129조' },
          { label: '한국도박문제예방치유원', href: 'https://www.kcgp.or.kr' },
        ]}
      />

      <LottoClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 로또 6/45 당첨 확률 (조합론 계산) */}
        <section>
          <h2 className="g-h2">로또 6/45 당첨 확률</h2>
          <p className="g-p">
            한국 로또는 1~45 중 6개 번호를 맞추는 게임입니다. 가능한 조합 수 = <code style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>C(45,6) = {nf(TOTAL)}</code>가지.
            추첨 때는 당첨 번호 6개 외에 보너스 번호 1개를 더 뽑는데, 보너스 번호는 2등을 가를 때만 쓰입니다.
            그래서 2등은 「당첨 번호 6개 중 5개를 맞추는 방법 6가지 × 나머지 한 자리가 보너스 번호인 1가지」로 6가지뿐이고,
            3등은 나머지 한 자리가 보너스도 아닌 38개 번호 중 하나인 경우라 228가지가 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등수', '조건', '경우의 수', '확률', '1만 게임당 기대 횟수'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRIZE_ROWS.map((row, i) => (
                  <tr key={row.g} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.g}등</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{row.cond}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(row.ways)} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({row.how})</span></td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>1 / {row.odds}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{row.per10k}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            감을 잡기 위해 매주 5게임(5,000원)씩 산다고 하면, 1등이 한 번 나올 때까지 평균 약 {nf(YEARS_5_PER_WEEK)}년이 걸리는 확률입니다.
            모든 조합을 한 장씩 사려면 {nf(TOTAL)}게임, 곧 약 {nf(TOTAL * PRICE_PER_GAME / 1e8, 1)}억 원이 듭니다.
          </p>
        </section>

        {/* 2. 당첨금 구조와 기대값 */}
        <section>
          <h2 className="g-h2">당첨금은 어떻게 정해지나 — 1게임의 기대값</h2>
          <p className="g-p">
            동행복권 규정상 로또 판매액의 50%가 당첨금 재원입니다. 4등(5만원)과 5등(5천원)은 고정 금액을 먼저 지급하고,
            남은 재원을 1등 75%, 2등 12.5%, 3등 12.5%로 나눠 각 등수 당첨자 수만큼 똑같이 나눕니다. 그래서 1~3등 금액은 회차마다 달라지고,
            1등 당첨자가 없으면 그 몫은 다음 회차 1등 당첨금으로 넘어갑니다. 역대 누적 평균은 1등 약 20억 원, 2등 약 5,500만 원대, 3등 약 140만 원대 수준입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등수', '가정 당첨금', '1게임당 기대 회수액'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRIZE_ROWS.map((row, i) => (
                  <tr key={row.g} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.g}등</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{nf(row.prize)}원{row.g >= 4 ? ' (고정)' : ' (평균 수준)'}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(row.ev, 1)}원</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 700 }} colSpan={2}>합계 (1게임 {nf(PRICE_PER_GAME)}원당, 세전)</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{nf(EV_TOTAL, 1)}원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            1,000원짜리 한 게임이 평균적으로 돌려주는 돈은 세전 약 {nf(EV_TOTAL)}원으로, 판매액의 절반을 당첨금으로 쓰는 구조와 맞아떨어집니다.
            그중 약 {nf(PRIZE_ROWS[0].ev / EV_TOTAL * 100)}%는 사실상 기대하기 어려운 1등 몫이고, 다음으로 큰 몫은 확률이 높은 5등({nf(PRIZE_ROWS[4].ev)}원)입니다.
            200만원을 넘는 당첨금은 세금까지 떼므로 세후 기대값은 이보다 더 낮습니다.
            본 도구의 가상 추첨 시뮬레이터도 이 가정 당첨금으로 회수금을 계산합니다.
          </p>
        </section>

        {/* 3. 8가지 모드 */}
        <section>
          <h2 className="g-h2">8가지 번호 생성 모드</h2>
          <p className="g-p">
            각 모드는 번호 조합의 패턴만 다를 뿐, <strong>1등 당첨 확률은 모두 1/8,145,060로 동일</strong>합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            {[
              { name: '완전 랜덤',  desc: '아무 제약 없이 1~45 무작위 6개 — 가장 단순' },
              { name: '균형형',     desc: '5구간(1~10/11~20/.../41~45)에 골고루 분포' },
              { name: '생일 제외',  desc: '번호를 하나 뽑을 때마다 60% 확률로 32~45 구간에서 골라 흔한 조합 회피' },
              { name: '연속 포함',  desc: '12·13 같은 연속 쌍 1개 포함 (3연속은 방지)' },
              { name: '연속 제외',  desc: '인접 번호가 없도록 — 거리 있는 조합' },
              { name: '끝수 분산',  desc: '같은 끝자리 숫자 겹침 최소화 (각 끝자리 ≤2개)' },
              { name: '균등 간격',  desc: '번호 간 간격을 6~9로 벌려 고르게 분산 (범위를 넘으면 부족분은 무작위로 채움)' },
              { name: '합 균형형',  desc: '총합이 100~170 사이가 되도록 (6개 합의 이론 평균 138 = 6 × 23)' },
            ].map((m) => (
              <div key={m.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 번호 분석 */}
        <section>
          <h2 className="g-h2">번호 분석 — 통계적 패턴 학습</h2>
          <p className="g-p">
            본 도구의 [번호 분석] 탭에서 6개 번호의 통계 패턴을 확인할 수 있습니다:
          </p>
          <ul className="g-list">
            <li><strong>홀짝 비율</strong> — 균형(3:3) vs 편향</li>
            <li><strong>저고 비율</strong> — 1~22 vs 23~45 분포</li>
            <li><strong>번호 총합</strong> — 6개 합의 이론 평균 138 (역대 당첨 번호의 평균도 이 근처)</li>
            <li><strong>구간 분포</strong> — 5구간(1~10/11~20/.../41~45)별 개수</li>
            <li><strong>소수·3의 배수</strong> 개수</li>
            <li><strong>연속 번호</strong> 쌍·끝자리 겹침</li>
            <li><strong>번호 간 간격</strong> — 인접 번호 차이의 이론 평균 ≈ 6.6 (= (max−min) 기댓값 ÷ 5)</li>
          </ul>
          <p className="g-p">
            분석 결과가 「균형」으로 나오는 조합이 많은 이유는 그런 조합이 원래 많기 때문입니다. 아래 표처럼 홀수 3개·짝수 3개인 조합이
            전체의 약 {nf(ODD_ROWS[3].pct, 1)}%로 가장 흔하고, 합이 100~170인 조합도 전체의 약 {nf(SUM_100_170, 1)}%입니다.
            당첨 번호가 균형형으로 자주 나오는 것은 특별한 법칙이 아니라, 흔한 패턴이 자주 보이는 당연한 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>홀 : 짝</th>
                  {ODD_ROWS.map(r => (
                    <th scope="col" key={r.k} style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>{r.k}:{6 - r.k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 600 }}>전체 조합 중 비율</th>
                  {ODD_ROWS.map(r => (
                    <td key={r.k} style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(r.pct, 1)}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="warn" title="통계 패턴은 학습용입니다">
              어떤 패턴도 다음 회차의 당첨 확률에 영향을 주지 않습니다. 특정 조합 하나의 1등 확률은 패턴과 관계없이 항상 1/{nf(TOTAL)}입니다.
            </Callout>
          </div>
        </section>

        {/* 5. 균형형 선호 이유 */}
        <section>
          <h2 className="g-h2">왜 사람들은 균형형을 선호할까?</h2>
          <p className="g-p">
            행동경제학적으로 사람들은 <code style={{ color: 'var(--text)' }}>1, 2, 3, 4, 5, 6</code>보다 <code style={{ color: 'var(--text)' }}>7, 12, 19, 24, 33, 41</code>이 더 &quot;무작위 같다&quot;고 느낍니다 — 인간 직관은 &quot;균등 분포 = 자연스러움&quot;으로 인식하기 때문.
          </p>
          <p className="g-p">
            실제 두 조합 모두 <strong>같은 1/8,145,060 확률</strong>입니다. 다만 균형형 선택의 실용적 이유:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            {[
              { title: '단독 1등 가능성 ↑', desc: '일반인이 잘 안 고르는 조합 → 동시 당첨자 적음' },
              { title: '당첨금 분배 적음 ↑', desc: '1등이 5명일 때보다 1명일 때 수령액 5배' },
              { title: '심리적 만족', desc: '"제대로 무작위인 것 같다"는 자기만족' },
              { title: '단순 패턴 회피', desc: '1,2,3,4,5,6도 확률은 동일하지만 함께 고르는 사람이 많아 당첨 시 분배액 ↓' },
            ].map((c) => (
              <div key={c.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 생일 번호 함정 */}
        <section>
          <h2 className="g-h2">생일 번호의 함정</h2>
          <p className="g-p">
            많은 사람이 가족·연인 생일로 번호를 고르면 다음과 같은 편중이 생깁니다:
          </p>
          <ul className="g-list">
            <li><strong>1~12 (월)</strong>: 너무 자주 선택됨</li>
            <li><strong>1~31 (일)</strong>: 32~45는 거의 무시됨</li>
            <li><strong>19XX·20XX 끝 두자리</strong>: 일부 번호 편중</li>
          </ul>
          <p className="g-p">
            6개가 모두 31 이하인 조합은 전체의 약 {nf(ALL_UNDER_31, 1)}%에 불과한데, 생일·기념일로만 번호를 고르면 선택이 전부 이 좁은 영역에 몰립니다.
            당첨 확률은 다른 조합과 같지만, 그 영역의 조합이 당첨되면 같은 번호를 고른 사람이 많아 <strong>동시 당첨자가 늘고 1인당 분배액이 줄어듭니다</strong>.
            본 도구의 [생일 제외형] 모드는 번호를 뽑을 때마다 60% 확률로 32~45 구간에서 골라 흔한 조합을 피합니다.
          </p>
        </section>

        {/* 7. 한국 로또 세금 */}
        <section>
          <h2 className="g-h2">한국 로또 세금과 실수령액</h2>
          <p className="g-p">
            복권 당첨금은 기타소득이지만 다른 소득과 합산하지 않는 <strong>무조건 분리과세</strong> 대상이라, 당첨금을 받을 때 원천징수되는 것으로 납세가 끝납니다.
            건별 200만원 이하는 과세최저한이라 세금이 없고(2023년 1월부터, 이전 5만원), 200만원을 넘으면 200만원을 빼지 않고 <strong>전액</strong>에 과세합니다.
            3억원까지는 22%(소득세 20% + 지방소득세 2%), 3억원 초과분은 33%(소득세 30% + 지방소득세 3%)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '당첨금', '세금', '실수령', '실효세율'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: h === '구분' ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TAX_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.label}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(row.gross)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(row.totalTax)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{nf(row.net)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{nf(row.effectiveRate, 2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            표에서 보듯 200만원과 210만원 사이에는 당첨금이 더 많은데도 실수령액이 줄어드는 문턱이 있습니다. 1등 {nf(T_1ST.gross / 1e8)}억 원이면
            3억까지 22%, 나머지 {nf((T_1ST.gross - 3e8) / 1e8)}억에 33%가 붙어 세금 약 {nf(T_1ST.totalTax / 1e8, 2)}억 원, 실수령 약 {nf(T_1ST.net / 1e8, 2)}억 원입니다.
            실제 원천징수에서는 당첨된 복권 1게임의 구입비 1,000원을 필요경비로 빼고 계산하므로 표보다 세금이 수백 원 적습니다.
            고액 당첨금을 가족에게 나눠 주면 증여세 문제가 생길 수 있으니 <strong>세무사 상담을 권합니다</strong>.
          </p>
        </section>

        {/* 8. 도박 의존 예방 */}
        <section>
          <h2 className="g-h2">도박 의존 예방 — 건강하게 즐기기</h2>
          <p className="g-p">
            로또는 합법 사행성 게임이지만, 의존 우려가 발생할 수 있습니다. 만 19세 미만에게는 판매할 수 없습니다(복권 및 복권기금법).
            <strong> 다음 신호가 있다면 주의가 필요</strong>합니다:
          </p>
          <ul className="g-list">
            <li>정해진 예산을 자주 초과 구매</li>
            <li>손실 만회 위해 더 많이 구매</li>
            <li>가족·일·일상에 지장</li>
            <li>끊으려 해도 다시 구매</li>
            <li>구매 사실을 가족에게 숨김</li>
            <li>돈 빌려서 구매</li>
          </ul>
          <Callout tone="note" title="도움이 필요하시면">
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
              <li><strong>한국도박문제예방치유원</strong>: <a href="tel:1336" style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>1336</a> (24시간·365일, 무료·익명)</li>
              <li>인터넷 상담: kcgp.or.kr</li>
              <li>단도박 모임 (GA): dandobakkorea.org</li>
            </ul>
            <p style={{ margin: '8px 0 0' }}>
              <strong>건강한 로또 즐기기</strong>: 예산은 미리 정하기(예시 — 가처분 소득의 1% 안팎, 월 200만원이면 월 2만원 정도), &quot;오락비&quot; 분류, 손실 인정, 일확천금 기대 X.
            </p>
          </Callout>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/life/random',         icon: '🎲', name: '랜덤 추첨기',           desc: '범용 무작위 뽑기' },
              { href: '/tools/life/dutch',          icon: '💸', name: '더치페이 계산기',       desc: '여러 명 비용 분배' },
              { href: '/tools/life/unit-price',     icon: '💵', name: '단가 비교 계산기',      desc: '쇼핑 가성비 비교' },
              { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기',  desc: '월급 세후 계산' },
              { href: '/tools/finance/compound',    icon: '📈', name: '복리 계산기',           desc: '저축·투자 누적' },
              { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속세 계산기',          desc: '대규모 자산 세금' },
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

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul className="g-list">
            <li><a href="https://www.dhlottery.co.kr/lt645/intro" target="_blank" rel="noopener noreferrer">동행복권 — 로또6/45 소개</a> (게임 방법·당첨금 배분·지급 안내)</li>
            <li><a href="https://www.law.go.kr/법령/소득세법/제84조" target="_blank" rel="noopener noreferrer">소득세법 제84조</a>·<a href="https://www.law.go.kr/법령/소득세법/제129조" target="_blank" rel="noopener noreferrer">제129조</a> — 과세최저한·원천징수세율 (국가법령정보센터)</li>
            <li><a href="https://www.kcgp.or.kr" target="_blank" rel="noopener noreferrer">한국도박문제예방치유원</a> — 헬프라인 1336 (24시간·365일 운영, 2026년 9월 확인)</li>
            <li><strong>단도박 모임 (GA Korea)</strong> — dandobakkorea.org</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
