import Link from 'next/link'
import CapitalGainsClient from './CapitalGainsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

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

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const para: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  marginBottom: '12px',
}
const strong: React.CSSProperties = { color: 'var(--text)' }
const formulaBox: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 16px',
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.9,
}
const tableWrap: React.CSSProperties = { overflowX: 'auto', WebkitOverflowScrolling: 'touch' }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 340 }
const th: React.CSSProperties = { padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, borderBottom: '1px solid var(--border)' }
const td: React.CSSProperties = { padding: '9px 10px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }
const tdNum: React.CSSProperties = { ...td, color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }

const FAQ_LD = [
  {
    q: '1주택인데 12억 넘으면 양도세 얼마나 나오나요?',
    a: '양도가액이 12억을 넘는 고가주택은 비과세가 아니라 <strong>12억 초과분에 대해서만</strong> 과세합니다. 과세대상 양도차익 = 전체 차익 × (양도가액 − 12억) ÷ 양도가액으로 안분합니다. 예로 <strong>15억에 팔아 차익 5억</strong>이면 과세대상은 5억 × (3억 ÷ 15억) = <strong>1억</strong>입니다. 여기에 장기보유특별공제(최대 80%)와 기본공제 250만원을 빼고 기본세율을 적용하므로, 장기 보유·거주한 1주택이면 실제 세액은 크게 줄어듭니다.',
  },
  {
    q: '1세대 1주택 비과세 요건은 무엇인가요?',
    a: '기본 요건은 양도일 현재 1세대가 국내에 1주택을 보유하고, 그 주택의 <strong>보유기간이 2년 이상</strong>인 경우입니다. 취득 당시 <strong>조정대상지역</strong>이었다면 보유 2년에 더해 <strong>거주 2년</strong>도 충족해야 합니다(비조정지역은 거주요건 없음). 이 요건을 갖추면 양도가액 12억 이하는 전액 비과세, 12억 초과는 초과분만 과세합니다. 일시적 2주택·상속·동거봉양 등 특례는 별도 판단이 필요합니다.',
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
    a: '주택·조합원입주권을 <strong>보유 1년 미만</strong>에 팔면 단기 중과로 세율 <strong>70%</strong>, <strong>1년 이상 2년 미만</strong>이면 <strong>60%</strong>가 적용됩니다. 분양권도 단기 보유 시 중과됩니다. 만 2년 이상 보유해야 6~45% 기본 누진세율과 비과세 자격이 적용되고, 장기보유특별공제는 보유 3년(거주분 특례는 거주 2년)부터 따질 수 있습니다. 단기 매도는 세 부담이 매우 크므로 보유기간 관리가 중요합니다.',
  },
  {
    q: '양도소득 기본공제 250만원은 매년 받나요?',
    a: '네. 양도소득 기본공제 <strong>연 250만원</strong>은 사람별로 1년에 한 번 적용됩니다. 같은 해에 여러 건을 양도해도 합쳐서 250만원만 공제되며, 해가 바뀌면 다시 250만원이 적용됩니다. 따라서 양도 시기를 연도별로 나누면 기본공제를 두 번 활용할 수 있습니다. 공제는 양도소득금액(장기보유공제 후)에서 차감해 과세표준을 만듭니다.',
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
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />1주택 양도소득세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        1세대 1주택 양도세를 <strong style={strong}>2026년 국세청 기준</strong>으로 단계별로 추정합니다. 12억 비과세·고가주택 안분, 장기보유특별공제(최대 80%), 단기 중과세율까지 한 번에 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년"
        basis="2026년 국세청 양도소득세 기준 · 12억 비과세·장기보유특별공제·단기 중과세율 반영"
        sources={[{ label: '국세청 양도소득세(nts.go.kr)', href: 'https://www.nts.go.kr/' }]}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 비과세 */}
        <div>
          <h2 style={sectionTitle}>1세대 1주택 양도세, 언제 비과세되나</h2>
          <p style={para}>
            1세대가 국내에 주택 1채만 보유하고 그 주택을 <strong style={strong}>2년 이상 보유</strong>한 뒤 팔면 양도소득세가 비과세됩니다. 취득 당시 <strong style={strong}>조정대상지역</strong>이었다면 보유 2년에 더해 <strong style={strong}>거주 2년</strong>까지 채워야 하고, 비조정지역이면 거주요건 없이 보유 2년만으로 됩니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            비과세는 양도가액 <strong style={strong}>12억원 이하</strong>까지만 전액 적용됩니다. 12억을 넘는 고가주택은 비과세가 아니라 초과분만 과세하므로, 같은 1주택이라도 12억 경계에서 세 부담이 갈립니다.
          </p>
        </div>

        {/* 2. 12억 안분 */}
        <div>
          <h2 style={sectionTitle}>12억 초과 고가주택 — 안분 산식</h2>
          <p style={para}>
            양도가액이 12억을 넘으면 전체 양도차익 중 <strong style={strong}>12억 초과분 비율</strong>만 과세대상이 됩니다. 산식은 다음과 같습니다.
          </p>
          <div style={formulaBox}>
            과세대상 양도차익 = 전체 양도차익 × <strong style={{ color: 'var(--accent-ink)' }}>(양도가액 − 12억) ÷ 양도가액</strong>
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            예로 <strong style={strong}>15억에 팔아 차익이 5억</strong>이면, 과세대상 = 5억 × (15억 − 12억) ÷ 15억 = 5억 × 0.2 = <strong style={strong}>1억원</strong>입니다. 나머지 4억은 비과세입니다. 이 1억에 다시 장기보유특별공제와 기본공제를 적용해 세액을 구합니다.
          </p>
        </div>

        {/* 3. 장기보유특별공제 표1/표2 */}
        <div>
          <h2 style={sectionTitle}>장기보유특별공제 — 표1 vs 표2</h2>
          <p style={para}>
            오래 보유할수록 양도차익에서 일정 비율을 공제합니다. 일반 부동산·다주택은 <strong style={strong}>표1(연 2%, 최대 30%)</strong>, 1세대 1주택은 <strong style={strong}>표2</strong>로 보유분과 거주분을 각각 따져 합산하며 <strong style={strong}>최대 80%</strong>까지 공제합니다.
          </p>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  {['기간', '표1 (일반·다주택)', '표2 보유분', '표2 거주분'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { y: '3년', t1: '6%', h: '12%', l: '12%' },
                  { y: '5년', t1: '10%', h: '20%', l: '20%' },
                  { y: '7년', t1: '14%', h: '28%', l: '28%' },
                  { y: '10년 이상', t1: '20%', h: '40% (한도)', l: '40% (한도)' },
                  { y: '15년 이상', t1: '30% (한도)', h: '40%', l: '40%' },
                ].map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...td, fontWeight: 500 }}>{r.y}</td>
                    <td style={tdNum}>{r.t1}</td>
                    <td style={tdNum}>{r.h}</td>
                    <td style={tdNum}>{r.l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            표2는 보유분(최대 40%)과 거주분(최대 40%)을 더해 합계 80%가 한도입니다. 거주 2~3년 구간은 8% 특례가 적용됩니다. 거주를 하지 않았다면 표2를 쓸 수 없어 표1(최대 30%)로 떨어집니다.
          </p>
        </div>

        {/* 4. 단기 중과세율·기본세율 */}
        <div>
          <h2 style={sectionTitle}>단기 보유 중과세율과 기본세율</h2>
          <p style={para}>
            보유기간이 짧으면 세율이 크게 올라갑니다. 주택·조합원입주권을 <strong style={strong}>1년 미만</strong> 보유 후 팔면 <strong style={strong}>70%</strong>, <strong style={strong}>1년 이상 2년 미만</strong>이면 <strong style={strong}>60%</strong>가 적용됩니다. 만 2년 이상 보유해야 아래 6~45% 기본 누진세율로 과세되고 비과세 자격이 생기며, 장기보유특별공제는 보유 3년부터(거주분 특례는 거주 2년부터) 의미가 있습니다.
          </p>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  {['과세표준', '세율', '누진공제'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { b: '1,400만원 이하', r: '6%', d: '—' },
                  { b: '5,000만원 이하', r: '15%', d: '126만원' },
                  { b: '8,800만원 이하', r: '24%', d: '576만원' },
                  { b: '1.5억원 이하', r: '35%', d: '1,544만원' },
                  { b: '3억원 이하', r: '38%', d: '1,994만원' },
                  { b: '5억원 이하', r: '40%', d: '2,594만원' },
                  { b: '10억원 이하', r: '42%', d: '3,594만원' },
                  { b: '10억원 초과', r: '45%', d: '6,594만원' },
                ].map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...td, fontWeight: 500 }}>{r.b}</td>
                    <td style={tdNum}>{r.r}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            기본세율은 과세표준에 세율을 곱한 뒤 누진공제를 빼는 방식입니다. 이 계산기는 양도세 단일 양도 건을 가정하며 다주택 중과·비교과세는 단순화했습니다.
          </p>
        </div>

        {/* 5. 4단계 */}
        <div>
          <h2 style={sectionTitle}>양도세 4단계 따라가기</h2>
          <p style={para}>
            양도소득세는 다음 4단계로 계산됩니다. 계산기의 세액 분해표가 이 흐름을 그대로 보여줍니다.
          </p>
          <div style={formulaBox}>
            ① 양도차익 = 양도가액 − 취득가액 − 필요경비
            <br />
            ② 양도소득금액 = 양도차익 − <strong style={{ color: 'var(--accent-ink)' }}>장기보유특별공제</strong>
            <br />
            ③ 과세표준 = 양도소득금액 − <strong style={{ color: 'var(--accent-ink)' }}>기본공제 250만원</strong>
            <br />
            ④ 산출세액 = 과세표준 × 세율 − 누진공제 → <strong style={{ color: 'var(--accent-ink)' }}>+ 지방소득세 10%</strong>
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            고가주택이면 ①에서 12억 안분을 먼저 거치고, 단기 보유면 ④에서 70/60% 단일세율이 들어갑니다.
          </p>
        </div>

        {/* 6. 신고·납부 */}
        <div>
          <h2 style={sectionTitle}>신고·납부 기한과 지방소득세</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            양도소득세는 양도일(잔금일)이 속한 달의 말일부터 <strong style={strong}>2개월 이내</strong> 예정신고·납부해야 합니다. 예로 6월에 잔금을 받으면 8월 말까지 신고합니다. 산출된 양도세의 <strong style={strong}>10%</strong>가 지방소득세로 추가되어 함께 납부합니다. 같은 해에 2건 이상 양도하면 확정신고(다음 해 5월)로 합산 정산할 수 있습니다. 기한을 넘기면 무신고·납부지연 가산세가 붙으므로 잔금일 기준으로 일정을 챙기세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
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
                  borderRadius: '12px',
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
    </div>
  )
}
