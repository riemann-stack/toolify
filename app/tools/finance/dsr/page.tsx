import Link from 'next/link'
import DsrClient from './DsrClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/finance/dsr',
  title: 'DSR·LTV·스트레스DSR 계산기 — 내 대출 한도 한 번에',
  description:
    '연소득·기존 대출·집값·금리 한 번 입력으로 DSR(총부채원리금상환비율)·LTV(담보인정비율)·스트레스 DSR을 동시에 계산. 변동·혼합·고정금리별 스트레스 가산금리 반영해 최대 대출 한도까지.',
  keywords: [
    'DSR 계산기', 'LTV 계산기', '스트레스DSR 계산기', '스트레스 DSR 3단계',
    '총부채원리금상환비율', '담보인정비율', '주택담보대출 한도', '대출 한도 계산',
    'DSR 40%', 'LTV 70%', '변동금리 스트레스금리', '주담대 한도',
  ],
})

const h2: React.CSSProperties = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }

const FAQ_LD = [
              {
                q: 'DSR과 DTI는 어떻게 다른가요?',
                a: '<strong>DSR</strong>은 「모든 대출」의 연간 원리금을, <strong>DTI</strong>는 「주택담보대출 원리금 + 기타 대출은 이자만」을 따집니다. 즉 DSR이 더 엄격합니다. 현재 한국의 대출 규제는 DSR 중심이며, DSR 40%(은행권)가 핵심 기준입니다.',
              },
              {
                q: '스트레스 DSR이 적용되면 한도가 얼마나 줄어드나요?',
                a: '같은 조건에서 변동형 + 3단계(가산 약 +1.5%p) 기준 대략 <strong>14~16% 정도 한도가 감소</strong>합니다(만기 30년 기준). 만기가 길수록, 가산금리가 클수록, 금리 변동 위험이 큰 상품(변동형)일수록 감소폭이 커집니다. 순수 고정금리는 스트레스 가산이 0이라 한도 손해가 없습니다.',
              },
              {
                q: '왜 LTV는 충분한데 대출이 안 나오나요?',
                a: '소득 대비 부담(DSR)에서 막혔기 때문입니다. 집값이 비싸 LTV 여유가 있어도, 연소득이 적거나 기존 대출이 많으면 DSR 40%를 먼저 초과합니다. 본 계산기는 「최종 한도」 옆에 LTV/DSR 중 어디에 묶였는지 표시합니다.',
              },
              {
                q: '신용대출도 DSR에 포함되나요?',
                a: '네. <strong>신용대출·마이너스통장·자동차할부·카드론·학자금 등 거의 모든 대출</strong>의 연간 원리금이 합산됩니다. 신용대출은 만기를 짧게(보통 5~10년) 산정해 DSR 부담이 의외로 큽니다. 주담대 한도를 늘리려면 기존 대출부터 정리하는 게 효과적입니다.',
              },
              {
                q: '계산기의 기본값(DSR 40%·LTV 70%·스트레스 1.5%p)을 믿어도 되나요?',
                a: '<strong>참고용 일반 기준</strong>일 뿐입니다. LTV는 규제지역·주택 수·생애최초 여부에 따라, 스트레스 금리는 시행 단계·금리유형·기준금리에 따라 계속 바뀝니다. 정확한 본인 적용값은 거래 은행이나 금융위·은행연합회 공시로 확인하고, 계산기의 [규제 기준값 수정]에서 직접 넣어 보세요.',
              },
              {
                q: '전세자금대출도 DSR에 들어가나요?',
                a: '전세자금대출은 원칙적으로 <strong>이자만 DSR에 반영</strong>되며(원금 제외), 일부는 DSR 산정에서 제외되기도 합니다. 정책에 따라 달라지므로 본 계산기에서는 「기존 대출 연 상환액」 칸에 본인 상황에 맞는 금액을 직접 넣어 계산하세요.',
              },
            ]

export default function DsrPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />DSR·LTV·스트레스DSR 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        연소득·기존 대출·집값·금리를 <strong style={{ color: 'var(--text)' }}>한 번만 입력</strong>하면 DSR·LTV·스트레스 DSR을 동시에 계산하고,
        세 기준 중 가장 빡빡한 쪽으로 <strong style={{ color: 'var(--text)' }}>예상 최대 대출 한도</strong>를 알려드려요.
        <br /><span style={{ fontSize: '13px' }}>※ 금리유형별 스트레스 적용률 등 일부 기준은 <strong style={{ color: 'var(--text)' }}>대표 추정치</strong>입니다. 정확한 본인 적용값은 거래 은행·금융위 공시로 확인하고, [규제 기준값 수정]에서 직접 넣어 보세요.</span>
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 DSR 규제 참고 기준(추정)" sources={[{"label":"금융감독원","href":"https://www.fss.or.kr"}]} />

      <DsrClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 세 가지 개념 */}
        <section>
          <h2 style={h2}>DSR · LTV · 스트레스 DSR — 3분 정리</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                t: 'DSR — 소득 대비 빚 갚는 부담', c: '#059669',
                d: '총부채원리금상환비율. 내 연소득에서 「모든 대출의 1년치 원리금」이 차지하는 비율입니다. 주택담보대출뿐 아니라 신용대출·자동차할부·카드론까지 전부 합산해요.',
                f: 'DSR(%) = (모든 대출 연간 원리금 ÷ 연소득) × 100  ·  은행 40% / 2금융권 50% 이내',
              },
              {
                t: 'LTV — 집값 대비 빌릴 수 있는 한도', c: '#0891B2',
                d: '담보인정비율. 담보로 잡는 주택 가격 대비 대출 가능 비율입니다. 규제지역·주택 수·생애최초 여부에 따라 한도가 달라집니다.',
                f: 'LTV(%) = (대출금 ÷ 주택가격) × 100  ·  비규제 70% / 생애최초 최대 80% / 규제지역 50% 등',
              },
              {
                t: '스트레스 DSR — 금리 오를 걸 미리 반영', c: '#D97706',
                d: '변동금리로 빌리면 나중에 금리가 오를 수 있으니, DSR을 계산할 때 실제 금리에 「스트레스 가산금리」를 더해 더 보수적으로 한도를 잡는 제도입니다. 그만큼 빌릴 수 있는 금액이 줄어듭니다.',
                f: '스트레스 DSR = 실제금리 + 스트레스 가산금리(변동형일수록 큼)로 원리금을 재계산한 DSR',
              },
            ].map((x, i) => (
              <div key={i} style={{ ...card, borderLeft: `4px solid ${x.c}` }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: x.c, marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 8 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', lineHeight: 1.7, fontFamily: "'Noto Sans KR', sans-serif" }}>{x.f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 한도는 셋 중 가장 작은 값 */}
        <section>
          <h2 style={h2}>실제 한도 = 셋 중 가장 작은 값</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 14 }}>
            대출 한도는 LTV와 (스트레스)DSR을 <strong style={{ color: 'var(--text)' }}>각각 계산한 뒤 더 작은 쪽</strong>으로 정해집니다.
            집값이 비싸 LTV 여유가 있어도 소득이 적으면 DSR에서 막히고, 반대로 소득이 충분해도 집값 대비 대출이 크면 LTV에서 막혀요.
            본 계산기는 둘을 모두 따져 「최종 한도」와 어디에 묶였는지(LTV/DSR)를 함께 보여줍니다.
          </p>
          <div style={{ ...card }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
              📌 <strong>예시</strong> — 연소득 6,000만원 / 기존 대출 연 300만원 / 집값 5억 / 금리 4.5% / 30년 / 변동형
              <br />• LTV 70% → 최대 3.5억
              <br />• 스트레스 DSR 40%(가산 +1.5%p 반영) → 약 2.9억
              <br />→ <strong style={{ color: '#059669' }}>실제 한도 ≈ 2.9억 (DSR에 묶임)</strong>
            </p>
          </div>
        </section>

        {/* 3. 스트레스 DSR 단계 */}
        <section>
          <h2 style={h2}>스트레스 DSR — 단계와 가산금리</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 14 }}>
            스트레스 DSR은 기준 스트레스 금리(보통 <strong style={{ color: 'var(--text)' }}>하한 1.5%p ~ 상한 3.0%p</strong>)에 단계별 적용률을 곱해 적용됩니다.
            단계가 올라갈수록, 그리고 금리 변동 위험이 클수록(변동형 &gt; 혼합형 &gt; 주기형 &gt; 고정형) 가산폭이 커져 한도가 줄어듭니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '적용률', '변동형 가산(예시)', '특징'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1단계', '25%', '약 +0.38%p', '도입 초기 — 일부 주담대'],
                  ['2단계', '50%', '약 +0.75%p', '적용 대상·금액 확대'],
                  ['3단계', '100%', '약 +1.5%p', '전면 적용 — 가장 보수적'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: '#D97706', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 13 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, lineHeight: 1.75 }}>
            ※ 위 가산금리는 기준 1.5%p를 가정한 <strong style={{ color: 'var(--text)' }}>참고 예시</strong>입니다. 실제 적용 단계·기준 금리·금리유형별 비율은 금융위원회 발표와 은행별 적용에 따라 달라지므로,
            정확한 값은 <strong style={{ color: 'var(--text)' }}>금융위·은행연합회 공시</strong>나 거래 은행에서 확인하세요. 계산기의 [규제 기준값 수정]에서 직접 바꿔 시뮬레이션할 수 있습니다.
          </p>
        </section>

        {/* 4. 한도 늘리는 법 */}
        <section>
          <h2 style={h2}>대출 한도를 늘리는 현실적인 방법</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🗓️ 만기를 늘린다', d: '30년 → 40년으로 늘리면 연 원리금이 줄어 DSR 한도가 올라갑니다. 단 총이자는 늘어요.' },
              { t: '💳 기존 대출을 줄인다', d: '신용대출·카드론·자동차할부도 전부 DSR에 잡힙니다. 먼저 갚으면 주담대 여력이 커져요.' },
              { t: '🔒 고정·혼합금리 선택', d: '순수 고정형은 스트레스 가산이 0, 혼합형은 변동형보다 작아 같은 조건에서 한도가 더 나옵니다.' },
              { t: '👫 소득 합산', d: '부부 합산 소득으로 신청하면 DSR 분모(연소득)가 커져 한도가 늘어납니다.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 5. FAQ */}
        <section>
          <h2 style={h2}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={h2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/finance/loan', icon: '💳', name: '대출이자 계산기', desc: '원리금균등·원금균등 월 상환액' },
              { href: '/tools/finance/rent-jeonse', icon: '🏠', name: '월세·전세 비교', desc: '전세대출 vs 월세 손익분기' },
              { href: '/tools/finance/housing-score', icon: '🏠', name: '청약 가점 계산기', desc: '84점 만점 가점 자동 계산' },
              { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 수익률 계산기', desc: '레버리지 반영 자기자본 수익률' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
