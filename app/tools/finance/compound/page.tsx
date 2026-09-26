import Link from 'next/link'
import CompoundClient from './CompoundClient'
import CompoundChart from './CompoundChart'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import { calcCompound, reverseCalcContribution, calcRealValue, COMPOUND_FREQUENCIES, formatEok } from './compoundUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/compound',
  title: '복리 계산기 — 목표 역산·인플레이션·수익률 시나리오 한 번에',
  description: '거치·적립·복리 주기·인플레이션을 반영해 시간이 만드는 자산을 시나리오별로 비교하고 목표 금액을 역산. ISA·연금저축 등 절세 계좌는 비교 가이드로 정리.',
  keywords: [
    '복리계산기', '복리투자계산기', '복리수익계산', '목표금액역산',
    '적립식복리', '거치식복리', '월적립계산기', '1억만들기',
    'ISA계산기', '연금저축계산기', 'IRP계산기', '절세계좌비교',
    '72의법칙', '실질수익률', '인플레이션계산기', '실질가치계산',
    'S&P500복리', '장기투자시뮬레이션', '눈덩이효과', '코스트에버리지',
  ],
})

/* ── 본문 표·예시 — 계산기와 같은 compoundUtils로 빌드 시점 계산 (손으로 적은 숫자 없음) ── */
const man = (v: number) => `${Math.round(v / 10_000).toLocaleString('ko-KR')}만원`

/** 72의 법칙 vs 정확한 2배 기간(ln2 / ln(1+r)) + 1,000만원 30년 연복리 */
const RULE72_ROWS = [2, 3, 5, 7, 10, 15].map((r) => ({
  r,
  rule: 72 / r,
  exact: Math.log(2) / Math.log(1 + r / 100),
  fv30: calcCompound({ principal: 10_000_000, contribution: 0, contributionFreqId: 'yearly', compoundFreqId: 'yearly', annualRate: r, years: 30 }).finalValue,
}))

/** 목표 역산 — 초기 원금 0, 매월 적립·월복리 (계산기 역산과 같이 만원 단위 올림) */
const GOAL_ROWS = ([[1e8, 10, 7], [1e8, 20, 7], [3e8, 20, 7], [5e8, 30, 7], [1e9, 30, 7], [1e9, 20, 10]] as const).map(([goal, years, rate]) => {
  const r = reverseCalcContribution({ goal, principal: 0, years, annualRate: rate, contributionFreqId: 'monthly', compoundFreqId: 'monthly' })
  const monthly = r?.requiredMonthly ?? 0
  const paid = monthly * 12 * years
  return { goal, years, rate, monthly, paid, label: r?.feasibilityLabel.replace(/^\S+\s/, '') ?? '' }
})

/** 인플레이션 — 30년 뒤 명목 1억·10억의 오늘 구매력 */
const INFL_ROWS = ([[1e8, 2], [1e8, 2.5], [1e8, 3], [1e9, 2.5], [1e9, 3]] as const).map(([v, i]) => ({ v, i, r: calcRealValue(v, 0, i, 30, 0) }))

/** 복리 주기 — 표시 금리 연 10%, 1,000만원 거치 */
const FREQ_ROWS = [...COMPOUND_FREQUENCIES].reverse().map((f) => {
  const y1 = calcCompound({ principal: 10_000_000, contribution: 0, contributionFreqId: 'monthly', compoundFreqId: f.id, annualRate: 10, years: 1 })
  const y30 = calcCompound({ principal: 10_000_000, contribution: 0, contributionFreqId: 'monthly', compoundFreqId: f.id, annualRate: 10, years: 30 })
  return { f, eff: (y1.finalValue / 10_000_000 - 1) * 100, y1: y1.finalValue, y30: y30.finalValue }
})

/** 계산기 기본값 해석 예시: 초기 1,000만원 + 매월 30만원, 20년, 연 7% 월복리, 물가 2% */
const DEF = calcCompound({ principal: 10_000_000, contribution: 300_000, contributionFreqId: 'monthly', compoundFreqId: 'monthly', annualRate: 7, years: 20 })
const DEF_REAL = calcRealValue(DEF.finalValue, 0, 2, 20, 7)

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const TDL: React.CSSProperties = { ...TD, textAlign: 'left', fontWeight: 700 }

const FAQ_LD = [
              {
                q: '복리와 단리의 차이는 무엇인가요?',
                a: '단리는 원금에만 이자가 붙는 방식이고, 복리는 이자에도 이자가 붙는 방식입니다. 1,000만 원을 연 10% 단리로 10년 투자하면 2,000만 원이지만, 연복리로 투자하면 2,594만 원이 됩니다. 장기 투자일수록 두 방식의 차이가 기하급수적으로 커집니다.',
              },
              {
                q: '실질 수익률이란 무엇인가요? (인플레이션)',
                a: '명목 수익률에서 물가 상승률을 걷어낸 수익률로, 실제 구매력이 얼마나 늘었는지를 보여 줍니다. 연 5% 수익을 올렸어도 물가가 3% 올랐다면 실질 수익률은 (1.05 ÷ 1.03) − 1 ≈ 1.94%입니다. 본 계산기는 「물가 상승률」 입력만 채우면 결과 영역에서 Fisher 공식으로 명목·실질 가치를 동시에 표시합니다.',
              },
              {
                q: '월 복리와 연 복리 중 어느 것이 유리한가요?',
                a: '같은 표시 금리라면 복리 계산 주기가 짧을수록 유리합니다. 연 10% 기준으로 연 복리는 10%이지만, 월 복리의 실효 연수익률은 약 10.47%이고 일복리는 10.52%입니다. 30년이 누적되면 최종 금액 차이는 약 14%까지 벌어집니다(1,000만원 거치 시 연복리 1억 7,449만원, 월복리 1억 9,837만원으로 약 2,390만원 차이). 본 계산기의 「수익률」 입력 카드 안 복리 주기 선택지(일/월/분기/연)를 바꿔 비교해보세요.',
              },
              {
                q: '적립식 투자가 거치식보다 유리한 경우는?',
                a: '수익률이 같다면 목돈을 처음에 한 번에 넣는 거치식이 복리 기간이 길어 최종 금액이 더 큽니다. 적립식은 목돈이 없어도 시작할 수 있고, 가격이 오르내리는 자산을 매달 같은 금액으로 사면 쌀 때 더 많이 사게 되는 평균 매입 단가 효과(코스트 에버리지)가 있어 직장인의 장기 투자에 흔히 쓰입니다. 계산기는 초기 원금과 정기 납입을 함께 넣어 두 방식을 섞어 볼 수 있습니다.',
              },
              {
                q: '세금은 복리 수익에 어떤 영향을 주나요?',
                a: '국내 이자·배당소득은 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됩니다(소득세법 제129조). 연간 금융소득이 2,000만 원을 넘으면 초과분은 종합소득세 과세 대상입니다. ISA(비과세 한도 초과분 9.9% 분리과세)·연금저축·IRP(납입 시 세액공제, 연 1,500만원 이하 연금 수령 시 3.3~5.5% 연금소득세) 같은 절세 계좌를 쓰면 세후 복리 효과가 커집니다. 본 계산기 결과는 세전 금액이니, 본문 「계좌 유형별 세율 비교」 표를 함께 보세요.',
              },
              {
                q: '「1억 만들려면 월 얼마」를 계산하고 싶어요',
                a: '본 계산기의 「목표 금액」 입력란에 1억(10,000만원)을 넣고 기간·수익률·초기 원금을 설정하세요. 결과 영역에 이진 탐색으로 계산된 필요한 월 적립액(만원 단위 올림)과 「매우 합리적 / 합리적 / 도전적 / 비현실적」 4단계 현실성 배지가 자동 표시됩니다. 예: 1억 / 10년 / 7% → 월 58만원, 1억 / 20년 / 7% → 월 20만원.',
              },
              {
                q: '연금저축과 IRP는 어떻게 다른가요?',
                a: '둘 다 납입액에 세액공제(총급여 5,500만원 이하 16.5%, 초과 13.2%)를 받고, 55세 이후 연금으로 받으면 3.3~5.5%의 연금소득세만 냅니다(연간 연금수령액 1,500만원 이하일 때 — 초과하면 종합과세 또는 16.5% 분리과세 선택). 세액공제 대상 납입액은 연금저축 연 600만원까지, IRP를 합치면 연 900만원까지입니다(소득세법 제59조의3). 연금저축은 누구나 가입할 수 있고, IRP는 소득이 있는 사람이 가입하며 위험자산 투자 비중 제한이 있습니다. 둘 다 연금 외 방식으로 중도 인출하면 세액공제받은 납입액과 운용수익에 기타소득세 16.5%가 부과됩니다.',
              },
              {
                q: '시나리오 비교에서 13% 공격적은 너무 낙관적 아닌가요?',
                a: '맞습니다. 흔히 인용되는 S&P500의 명목 장기 평균은 연 10% 안팎이고, 연 13%를 넘는 수익은 1980~1990년대나 2010년대 같은 특정 강세장 기간에 나타났을 뿐입니다. 그 사이 2000~2002년, 2008년처럼 고점 대비 절반 가까이 떨어진 구간도 있었습니다. 13%는 「상한 시나리오」로만 활용하고, 7%(기준)와 4%(보수적)를 중심으로 계획을 세우세요.',
              },
              {
                q: '본 계산기는 투자 자문 도구인가요?',
                a: '아닙니다. 본 도구는 입력값 기반의 수학적 시뮬레이션이며, 특정 상품 추천이나 수익 보장이 아닙니다. 실제 투자 수익률은 시장 변동성·세금·수수료에 따라 달라지며, 과거 수익률은 미래 수익을 보장하지 않습니다. 가입 전 반드시 금융사·세무 전문가와 상담하세요.',
              },
            ]

export default function CompoundPage() {
  return (
    <ToolPage width={760} slug="/tools/finance/compound">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />복리 계산기
      </h1>
      <p className="tp-lead">
        거치·적립·복리 주기·인플레이션까지 반영해, <strong style={{ color: 'var(--text)' }}>시간이 만드는 자산</strong>을 시나리오별로 비교.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="이자·배당소득세 15.4%(소득세 14% + 지방소득세 1.4%) 반영 · 소득세법 제129조 기준"
        sources={[
          { label: '국세청', href: 'https://www.nts.go.kr' },
          { label: '국가법령정보센터 소득세법 제129조(원천징수세율)', href: 'https://www.law.go.kr/법령/소득세법/제129조' },
          { label: '국가법령정보센터 소득세법 제59조의3(연금계좌세액공제)', href: 'https://www.law.go.kr/법령/소득세법/제59조의3' },
          { label: '국가법령정보센터 조세특례제한법 제91조의18(ISA)', href: 'https://www.law.go.kr/법령/조세특례제한법/제91조의18' },
          { label: '한국은행 물가안정목표', href: 'https://www.bok.or.kr' },
        ]}
      />

      <CompoundClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 복리의 마법 + 그래프 (기존 SEO 보존) ── */}
        <div>
          <h2 className="g-h2">
            복리의 마법 — 눈덩이 효과(Snowball Effect)
          </h2>
          <p className="g-p">
            복리(複利)는 원금에서 발생한 이자가 다시 원금에 합산되어 그 다음 기간의 이자를 계산하는 방식입니다.
            시간이 지날수록 이자가 이자를 낳는 <strong>「눈덩이 효과(Snowball Effect)」</strong>가 발생합니다.
            처음에는 단리와 큰 차이가 없어 보이지만, 10년이 넘어가면서 그 차이가 기하급수적으로 벌어집니다.
          </p>
          <p className="g-p">
            아래 그래프는 1,000만 원을 금리별로 30년간 연복리로 투자했을 때의 누적 자산을 보여줍니다.
            연 3%와 연 10%의 차이가 30년 후 얼마나 벌어지는지 확인해보세요.
          </p>

          {/* 그래프 */}
          <CompoundChart />
        </div>

        {/* ── 2. 복리 계산 공식 (기존 SEO 보존) ── */}
        <div>
          <h2 className="g-h2">
            복리 계산 공식
          </h2>
          <p className="g-p">
            복리 계산의 핵심 공식은 아래와 같습니다. 적립식은 매 납입금이 각각 남은 기간만큼 복리로 불어난 값을 모두 더한 것이고, 계산기는 납입금을 <strong>각 주기의 시작 시점</strong>에 넣는 것으로 계산합니다(기초 납입).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>거치식 복리 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>
                FV = PV × (1 + r)ⁿ
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                FV = 미래 가치(Future Value) · PV = 현재 원금(Present Value)<br />
                r = 복리 주기당 이율(월복리면 연 수익률 ÷ 12) · n = 복리 횟수(월복리면 개월 수)
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>적립식 복리 공식 (매월 초 납입)</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>
                FV = PMT × [(1 + r)ⁿ − 1] ÷ r × (1 + r)
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                PMT = 매월 납입금(Payment) · r = 월 이율(연 수익률 ÷ 12) · n = 총 납입 횟수(월 수)<br />
                마지막 × (1 + r)을 빼면 월말 납입(기말) 공식 — 같은 조건에서 한 달치 이자만큼 적게 나옵니다.
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>실질 수익률 — Fisher 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>
                r_real = (1 + r_nominal) / (1 + π) − 1
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                r_real = 실질 수익률 · r_nominal = 명목 수익률 · π = 물가 상승률(인플레이션)
              </div>
            </div>
          </div>
          <Callout tone="note" title="계산기는 거치식과 적립식을 합산합니다">
            초기 원금(거치)과 정기 납입(적립)을 함께 넣으면 두 공식의 합이 결과가 되고, 적립 주기(매일·매주·매월·매년)와 복리 주기(일·월·분기·연)가 다르면 더 촘촘한 쪽에 맞춰 한 단계씩 시뮬레이션합니다.
          </Callout>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>결과 읽는 법(기본값 예시):</strong> 초기 1,000만원에 매월 30만원을 20년 동안 연 7%(월복리)로 넣으면 최종 금액은 {formatEok(DEF.finalValue)}이고, 그중 내가 넣은 돈은 {formatEok(DEF.totalContribution)}, 수익은 {formatEok(DEF.totalInterest)}입니다. 결과 카드의 &lsquo;실효 연수익률 {DEF.effectiveAnnualReturn}%&rsquo;는 월복리로 1년간 실제로 불어나는 비율이고, 물가 2%를 넣으면 이 금액의 오늘 구매력은 {formatEok(DEF_REAL.realValue)}으로 표시됩니다. 세금·수수료를 넣지 않은 세전 값이라는 점을 기억하세요.
          </p>
        </div>

        {/* ── 3. 72의 법칙 (기존 SEO 보존) ── */}
        <div>
          <h2 className="g-h2">
            복리의 마법: 원금이 2배가 되는 「72의 법칙」
          </h2>
          <p className="g-p">
            <strong>72를 연 수익률(%)로 나누면</strong> 원금이 약 2배가 되는 기간(년)을 빠르게 계산할 수 있습니다.
            정확한 값은 ln 2 ÷ ln(1 + r)이고, 연 6~10% 구간에서는 72의 법칙과 거의 같습니다. 수익률이 아주 낮거나 높으면 오차가 커지는데, 아래 표에서 두 값을 비교해 보세요.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-ink)', marginBottom: '6px' }}>
              2배 기간 ≈ 72 ÷ 연 수익률(%)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: 연 6% 수익률이면 72 ÷ 6 = <strong style={{ color: 'var(--accent-ink)' }}>12년</strong> 후 원금이 2배
            </p>
          </div>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>연 수익률</th>
                  <th scope="col" style={TH}>72 법칙</th>
                  <th scope="col" style={TH}>정확한 2배 기간</th>
                  <th scope="col" style={TH}>1,000만원 → 30년 후</th>
                </tr>
              </thead>
              <tbody>
                {RULE72_ROWS.map((row) => (
                  <tr key={row.r}>
                    <th scope="row" style={TDL}>{row.r}%</th>
                    <td style={TD}>{row.rule.toFixed(1)}년</td>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{row.exact.toFixed(1)}년</td>
                    <td style={TD}>{man(row.fv30)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 세금·수수료 미반영, 원금 1,000만 원 거치식·연복리 기준(계산기 기본값은 월복리라 값이 조금 더 큽니다). 과거 수익률이 미래를 보장하지 않습니다.
          </p>
        </div>

        {/* ── 4. 목표 역산 — "1억 만들려면 월 얼마?" ── */}
        <div>
          <h2 className="g-h2">
            목표 역산 — &ldquo;1억 만들려면 월 얼마?&rdquo;
          </h2>
          <p className="g-p">
            대부분의 사람은 「얼마를 적립할까」가 아니라 「언제까지 얼마를 모으고 싶다」로 생각합니다.
            본 도구의 <strong>목표 역산</strong> 기능은 목표 금액·기간·수익률을 고정하고
            필요한 월 적립액을 <strong>이진 탐색(Binary Search)</strong>으로 찾은 뒤 만원 단위로 올려 보여 줍니다. 아래 표는 같은 함수로 계산한 값입니다.
          </p>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>목표</th>
                  <th scope="col" style={TH}>기간</th>
                  <th scope="col" style={TH}>수익률</th>
                  <th scope="col" style={TH}>월 적립액 (초기 0)</th>
                  <th scope="col" style={TH}>총 납입액</th>
                  <th scope="col" style={TH}>현실성 배지</th>
                </tr>
              </thead>
              <tbody>
                {GOAL_ROWS.map((row) => (
                  <tr key={`${row.goal}-${row.years}-${row.rate}`}>
                    <th scope="row" style={TDL}>{formatEok(row.goal)}</th>
                    <td style={TD}>{row.years}년</td>
                    <td style={TD}>{row.rate}%</td>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{man(row.monthly)}</td>
                    <td style={TD}>{formatEok(row.paid)}</td>
                    <td style={TD}>{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 매월 초 납입·월복리·세전. 현실성 배지는 월 적립액 20만원 미만 &lsquo;매우 합리적&rsquo;, 60만원 미만 &lsquo;합리적&rsquo;, 150만원 미만 &lsquo;도전적&rsquo;, 그 이상 &lsquo;비현실적&rsquo; 기준입니다.
          </p>
          <p className="g-p" style={{ marginTop: 12 }}>
            같은 1억이라도 기간을 10년에서 20년으로 늘리면 월 적립액은 3분의 1 수준으로 줄고, 총 납입액도 크게 줄어듭니다. 복리에서는 금액보다 <strong>시작 시점</strong>이 더 큰 변수라는 뜻입니다. 반대로 수익률 가정을 1%p만 높여도 필요 적립액이 눈에 띄게 줄어드니, 목표 역산을 할 때는 낙관적 수익률로 계획을 세우지 않도록 보수적 시나리오도 함께 확인하세요.
          </p>
        </div>

        {/* ── 5. 계좌 유형별 세율 비교 ── */}
        <div>
          <h2 className="g-h2">
            계좌 유형별 세율 비교 — 절세 계좌 4종 + 비교 기준 2종
          </h2>
          <p className="g-p">
            한국에서 이자·배당 수익에 대한 일반 과세는 <strong>15.4%</strong>(소득세 14% + 지방소득세 1.4%)입니다.
            절세 계좌를 활용하면 세금을 크게 줄일 수 있으니 자신의 상황에 맞는 계좌를 선택해 운용하세요. 계산기 결과는 세전 금액이므로, 일반 계좌라면 수익의 15.4%가 빠진다고 보면 됩니다.
          </p>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 580 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>계좌</th>
                  <th scope="col" style={{ ...TH, textAlign: 'center' }}>세율</th>
                  <th scope="col" style={TH}>연 한도</th>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['일반 계좌',       '15.4%', '제한 없음', '이자·배당 소득세 14% + 지방소득세 1.4%'],
                  ['ISA (서민형)',    '9.9%',  '납입 2,000만',  '400만원까지 비과세, 초과분 9.9% 분리과세 (소득 조건) · 의무 3년'],
                  ['ISA (일반형)',    '9.9%',  '납입 2,000만',  '200만원까지 비과세, 초과분 9.9% 분리과세 · 의무 3년'],
                  ['연금저축',        '3.3~5.5%',  '세액공제 600만',    '납입 시 16.5%(총급여 5,500만 이하)·13.2% 세액공제 · 55세 이후 연금 수령'],
                  ['IRP',             '3.3~5.5%',  '세액공제 900만(연저 합산)', '연금저축과 합산 900만원까지 세액공제 · 납입 한도는 합산 1,800만'],
                  ['비과세 (이론)',   '0%',    '제한 없음', '세금 없음 가정 (이론적 최대치)'],
                ].map((row) => (
                  <tr key={row[0]}>
                    <th scope="row" style={TDL}>{row[0]}</th>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{row[1]}</td>
                    <td style={TD}>{row[2]}</td>
                    <td style={{ ...TD, textAlign: 'left', color: 'var(--muted)', fontSize: 12, lineHeight: 1.6, whiteSpace: 'normal' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 2026년 9월 기준 단순화. 연금계좌 세율은 연금 수령 나이(70세 미만 5.5%·80세 미만 4.4%·80세 이상 3.3%) 기준이며, 연간 연금수령액 1,500만원 이하일 때 적용됩니다(초과하면 종합과세 또는 16.5% 분리과세 선택). 연금 외 수령 시에는 세액공제받은 납입액과 운용수익에 기타소득세 16.5%가 부과됩니다. ISA 의무 보유·중도 해지 불이익은 가입 전 금융사에서 확인하세요.
          </p>
        </div>

        {/* ── 6. 인플레이션과 실질 가치 ── */}
        <div>
          <h2 className="g-h2">
            인플레이션 — 30년 후 1억의 실질 가치
          </h2>
          <p className="g-p">
            화폐 가치는 시간이 지나면 떨어집니다. 한국은행의 물가안정목표는 소비자물가 상승률 연 2%이고, 최근 10년(2016~2025년) 소비자물가 상승률 평균도 약 2.1%였습니다.
            장기 계획에서는 명목 금액이 아니라 <strong>실질 수익률 = (1 + 명목) ÷ (1 + 물가) − 1</strong>로 판단해야 합니다. 연 7% 수익에 물가 2%면 실질 수익률은 약 4.9%입니다.
          </p>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>30년 후 명목 자산</th>
                  <th scope="col" style={{ ...TH, textAlign: 'center' }}>물가 상승률</th>
                  <th scope="col" style={TH}>실질 가치 (오늘 구매력)</th>
                  <th scope="col" style={TH}>구매력 손실</th>
                </tr>
              </thead>
              <tbody>
                {INFL_ROWS.map((row) => (
                  <tr key={`${row.v}-${row.i}`}>
                    <th scope="row" style={TDL}>{formatEok(row.v)}</th>
                    <td style={{ ...TD, textAlign: 'center' }}>{row.i.toFixed(1)}%</td>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{formatEok(row.r.realValue)}</td>
                    <td style={{ ...TD, color: 'var(--danger)' }}>−{row.r.purchasingPowerLossPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 실질 가치 = 명목 자산 ÷ (1 + 물가 상승률)^년수. 본 계산기 상단의 「물가 상승률」 입력란에서 1.5~4.0% 프리셋으로 시뮬레이션할 수 있습니다.
          </p>
        </div>

        {/* ── 7. 시나리오 비교 — 4가지 수익률 ── */}
        <div>
          <h2 className="g-h2">
            수익률 가정 시나리오
          </h2>
          <p className="g-p">
            단일 수익률만 가정하면 미래 자산을 과대 또는 과소평가하기 쉽습니다.
            본 도구는 4가지 시나리오를 동시에 비교해 <strong>「현실적 범위」</strong>를 제공합니다. 실제 투자 수익은 해마다 크게 흔들리므로, 시나리오 값은 &lsquo;장기 평균이 이 정도라면&rsquo;이라는 가정으로만 읽으세요.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { name: '보수적 4%',  color: 'var(--cyan-600)', desc: '예금·채권 중심 포트폴리오 가정', warn: '변동성 낮음' },
              { name: '기준 7%',    color: 'var(--accent)', desc: '주식·채권 분산투자 장기 가정 (명목 수익률)', warn: '장기 계획용 중간값' },
              { name: '낙관적 10%', color: 'var(--yellow-700)', desc: 'S&P500 명목 장기 평균으로 흔히 인용되는 수준', warn: '연간 등락 큼 (2008년 약 −37%)' },
              { name: '공격적 13%', color: 'var(--orange-600)', desc: '성장주 중심 · 특정 강세장 기간 수준', warn: '고점 대비 반토막 구간도 있었음' },
            ].map((sc) => (
              <div key={sc.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${sc.color}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{sc.name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 4 }}>{sc.desc}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{sc.warn}</p>
              </div>
            ))}
          </div>
          <p className="g-note" style={{ marginTop: 12 }}>
            ※ 본 시나리오는 가정값이며 특정 상품 수익을 예측하지 않습니다. 과거 수익률 ≠ 미래 보장.
          </p>
        </div>

        {/* ── 8. 복리 주기 차이 ── */}
        <div>
          <h2 className="g-h2">
            복리 주기 — 일·월·분기·연 차이
          </h2>
          <p className="g-p">
            연 10%로 표시된 상품도 복리 주기에 따라 실효 수익률이 다릅니다. 표시 금리를 주기 수로 나눠 그만큼 자주 복리를 붙이므로 주기가 짧을수록 유리합니다. 예금·적금 광고의 &lsquo;연 ○%&rsquo;는 보통 단리 또는 연 단위 표시 금리이니, 월복리 상품과 비교할 때는 실효 연수익률로 맞춰 보세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ ...TH, textAlign: 'left' }}>복리 주기</th>
                  <th scope="col" style={TH}>실효 연수익률</th>
                  <th scope="col" style={TH}>1,000만원 → 1년 후</th>
                  <th scope="col" style={TH}>→ 30년 후</th>
                </tr>
              </thead>
              <tbody>
                {FREQ_ROWS.map((row) => (
                  <tr key={row.f.id}>
                    <th scope="row" style={TDL}>{row.f.name} ({row.f.periodsPerYear}회)</th>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{row.eff.toFixed(3)}%</td>
                    <td style={TD}>{row.y1.toLocaleString('ko-KR')}원</td>
                    <td style={TD}>{formatEok(row.y30)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 표시 금리(명목) 연 10% 기준. 1년 차이는 0.5%p 남짓이지만 30년 누적하면 연복리와 일복리의 최종 금액 차이가 2,600만원을 넘습니다.
          </p>
        </div>

        {/* ── 10. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💰', name: '연봉 실수령액 계산기', desc: '매월 얼마를 투자할 수 있는지 확인' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '대출 상환 vs 투자, 어느 쪽이 유리?' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '추가 매수 시 평단가 시뮬레이션' },
              { href: '/tools/life/dutch',       icon: '🍻', name: '더치페이 계산기',     desc: '여러 명이 모은 자금 정산' },
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
        </div>

      </div>
    </ToolPage>
  )
}
