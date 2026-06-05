import Link from 'next/link'
import WealthRankClient from './WealthRankClient'
import AdSlot from '@/components/AdSlot'
import UpdatedMeta from '@/components/UpdatedMeta'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/wealth-rank',
  title: '자산 순위 계산기 — 내 순자산 상위 몇 %? (전국·시도·연령대·세계)',
  description:
    '순자산을 입력하면 전국·시도·연령대·세계 기준 상위 몇 %인지 바로 확인. 2025 가계금융복지조사 분포·상위 구간 보도치 + UBS 세계 부 보고서 기반. 상위 10%·1% 진입선과 또래 비교까지.',
  keywords: ['자산순위계산기', '순자산상위', '상위몇퍼센트', '자산백분위', '순자산순위', '상위10퍼센트', '상위1퍼센트', '가구순자산', '연령대별자산', '세계자산순위'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const th: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: 'var(--muted)', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px',
}
const tdNum: React.CSSProperties = {
  ...td, textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
}

const NATION_ROWS = [
  { k: '상위 0.1%', v: '약 86.7억', real: true },
  { k: '상위 1%', v: '약 33.0억', real: true },
  { k: '상위 5%', v: '약 15.2억', real: true },
  { k: '상위 10%', v: '약 11.0억', real: true },
  { k: '상위 20%', v: '약 6.6억', real: false },
  { k: '중앙값 (상위 50%)', v: '약 2.45억', real: false },
  { k: '평균', v: '4.71억', real: true },
]

const REGION_ROWS = [
  { k: '서울', v: '7억 1,288만' },
  { k: '세종', v: '6억 648만' },
  { k: '경기', v: '5억 6,006만' },
  { k: '제주', v: '4억 8,103만' },
  { k: '전국 평균', v: '4억 7,144만' },
]

const AGE_ROWS = [
  { k: '39세 이하', v: '약 2.3억', real: false },
  { k: '40대', v: '약 4.5억', real: false },
  { k: '50대', v: '5억 5,161만', real: true },
  { k: '60세 이상', v: '약 4.6억', real: false },
]

const WORLD_ROWS = [
  { k: '$1,000,000 이상', v: '상위 1.6%', desc: '백만장자 약 6,000만 명' },
  { k: '$100,000 ~ $1,000,000', v: '16.4%', desc: '세계 부의 약 39%' },
  { k: '$10,000 ~ $100,000', v: '41.3%', desc: '약 15.7억 명' },
  { k: '$10,000 미만', v: '40.7%', desc: '가장 넓은 층' },
]

const FAQ_LD = [
  { q: '순자산이 정확히 뭔가요? 무엇을 더하고 빼나요?', a: '<strong>순자산 = 총자산 − 부채</strong>입니다. 총자산에는 <strong>거주·투자용 부동산, 전월세 보증금(내가 맡긴 것), 예적금, 주식·펀드·코인, 자동차, 전세금</strong> 등 가진 모든 자산을 넣고, 부채에는 <strong>주택담보대출, 신용대출, 전세보증금(세입자에게 받은 것), 카드 미결제액</strong> 등 갚아야 할 돈을 넣습니다. 이 계산기의 “총자산 − 부채로 계산” 버튼을 누르면 둘을 입력해 자동으로 순자산을 구해줍니다.' },
  { q: '상위 10%·상위 1%에 들려면 순자산이 얼마여야 하나요?', a: '가구 순자산이 <strong>약 11억이면 상위 10%</strong>, <strong>약 33억이면 상위 1%</strong>입니다(분포는 2025 가계금융복지조사, 상위 1%·5% 컷은 상위 구간 보도치 기준). 참고로 <strong>10억 이상은 상위 11.8%</strong>, <strong>15.2억이면 상위 5%</strong>입니다. 순자산 3억 미만 가구가 전체의 57%로, 중앙값은 약 2.4~2.5억 수준입니다.' },
  { q: '데이터 출처와 기준 시점은 어떻게 되나요?', a: '한국 기준은 통계청·한국은행·금융감독원이 함께 발표한 <strong>「2025년 가계금융복지조사」(기준일 2025년 3월 31일, 2025년 12월 공표)</strong>와 상위 구간 보도치를 사용했습니다. 세계 기준은 <strong>UBS Global Wealth Report 2025</strong>(2024년 말, 성인 1인당)를 사용했습니다. 모두 가장 최근 공개 통계입니다.' },
  { q: '시도·연령대 순위는 얼마나 정확한가요?', a: '시·도와 연령대 비교는 <strong>전국 순자산 분포를 해당 그룹의 평균 순자산으로 보정한 추정치</strong>입니다. <strong>서울·세종·경기·제주(2025 실측 평균)와 50대(실측 평균)</strong>는 실제 통계값을 쓰지만, 그 외 시·도와 연령대는 평균 수준을 반영한 추정이라 실제 분포와 차이가 있을 수 있습니다. 그룹 안에서의 대략적 위치를 보는 용도로 참고하세요.' },
  { q: '세계 순위는 어떻게 계산되나요?', a: 'UBS 보고서의 <strong>성인 1인당 순자산 분포</strong>에 입력값을 1달러 = 1,380원으로 환산해 대입합니다. 세계 기준 상위 10%는 약 <strong>$307,000(약 4.2억)</strong>, 상위 1%는 약 <strong>$1.45M(약 20억)</strong> 수준입니다. 다만 우리 조사는 <strong>가구 단위</strong>, UBS는 <strong>1인 단위</strong>라 그대로 비교하면 순위가 다소 높게 나오므로 <strong>참고용</strong>으로 봐 주세요.' },
  { q: '왜 가구 기준인가요? 개인 기준은 없나요?', a: '한국의 자산 통계인 가계금융복지조사가 <strong>가구(세대) 단위</strong>로 조사되기 때문에, 국내 순위는 가구 기준이 가장 정확합니다. 혼자 사는 1인 가구라면 입력한 순자산이 곧 개인 자산이 됩니다. 부부·가족이라면 <strong>가구 전체 합산 순자산</strong>을 넣어야 통계와 같은 기준으로 비교됩니다.' },
]

export default function WealthRankPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📊 자산 순위 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        내 <strong style={{ color: 'var(--text)' }}>순자산</strong>이 상위 몇 %인지 — <strong style={{ color: 'var(--text)' }}>전국·시도·연령대·세계</strong> 기준으로 한 번에. 2025 가계금융복지조사 분포와 상위 구간 보도치, UBS 세계 부 보고서를 바탕으로 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년 5월"
        basis="2025 가계금융복지조사 분포·상위 구간 보도치 + UBS GWR 2025"
        sources={[
          { label: '국가데이터처 가계금융복지조사', href: 'https://kostat.go.kr' },
          { label: '한국은행 보도자료', href: 'https://www.bok.or.kr' },
          { label: 'UBS Global Wealth Report', href: 'https://www.ubs.com' },
        ]}
      />

      <WealthRankClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 전국 분포 */}
        <div>
          <h2 style={sectionTitle}>한국 가구 순자산 분포 (2025년)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={th}>구간</th>
                  <th style={{ ...th, textAlign: 'right' }}>순자산 기준선</th>
                </tr>
              </thead>
              <tbody>
                {NATION_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>
                      {r.k}
                      {!r.real && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500, marginLeft: 6 }}>추정</span>}
                    </td>
                    <td style={tdNum}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            가구 기준. 상위 0.1~10%·1%·5%·평균은 통계청 등 「2025년 가계금융복지조사」와 상위 구간 보도치(2024년 컷)를 따른 값이며, 상위 20%·중앙값은 분포 보간 추정입니다.
          </p>
        </div>

        {/* 연령대·지역 평균 */}
        <div>
          <h2 style={sectionTitle}>연령대·지역별 평균 순자산</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={th}>가구주 연령대</th>
                    <th style={{ ...th, textAlign: 'right' }}>평균 순자산</th>
                  </tr>
                </thead>
                <tbody>
                  {AGE_ROWS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 700 }}>
                        {r.k}
                        {!r.real && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500, marginLeft: 6 }}>추정</span>}
                      </td>
                      <td style={tdNum}>{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={th}>지역 (상위)</th>
                    <th style={{ ...th, textAlign: 'right' }}>평균 순자산</th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_ROWS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 700 }}>{r.k}</td>
                      <td style={tdNum}>{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            50대와 서울·세종·경기·제주는 2025 실측 평균입니다. 그 외 연령대·시도는 평균 수준 추정치로, 계산기에서 17개 시·도를 모두 선택할 수 있습니다.
          </p>
        </div>

        {/* 세계 분포 */}
        <div>
          <h2 style={sectionTitle}>세계 순자산 분포 (UBS 2025)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>성인 1인 순자산</th>
                  <th style={{ ...th, textAlign: 'right' }}>비중</th>
                </tr>
              </thead>
              <tbody>
                {WORLD_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={td}>
                      <strong style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{r.k}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>{r.desc}</span>
                    </td>
                    <td style={tdNum}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            UBS Global Wealth Report 2025(2024년 말 기준). 세계 상위 10% 진입선은 약 $307,000(약 4.2억), 상위 1%는 약 $1.45M(약 20억) 수준입니다.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <div style={{
          background: 'rgba(14,165,233,0.05)',
          border: '1px solid rgba(14,165,233,0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.8,
        }}>
          <strong style={{ color: 'var(--accent)' }}>참고용 안내</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            본 계산기는 공개 통계를 바탕으로 한 <strong style={{ color: 'var(--text)' }}>추정 순위</strong>로, 투자 권유나 재무 자문이 아닙니다. 실제 분포는 조사 방법·시점·표본에 따라 달라지며, 특히 시·도·연령대·세계 비교는 보정·환산이 들어간 참고치입니다. 중요한 의사결정은 원자료와 전문가 상담을 통해 확인하세요.
          </p>
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/savings', icon: '💰', name: '저축액 계산기', desc: '저축률·한국 평균 비교' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기', desc: '자산 불리기 시뮬' },
              { href: '/tools/finance/salary', icon: '💴', name: '연봉 실수령액 계산기', desc: '월 실수령 계산' },
              { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 수익률 계산기', desc: '자기자본 수익률' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
