import MilitaryClient from './MilitaryClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/military',
  title: '군 전역일 계산기 — 복무율 D-day',
  description: '입대일과 복무 형태(육군·해군·공군·해병대·사회복무요원)를 선택하면 전역일과 현재 복무율을 계산합니다.',
  keywords: ['전역일계산기', '군복무기간계산기', '전역일계산', '복무율계산기', '군대전역일', '사회복무요원전역일'],
})

export default function MilitaryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎖️ 군 전역일·복무율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        입대일과 복무 형태를 선택하면 전역일과 현재 복무율을 계산합니다.
      </p>

      <MilitaryClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>2024년 기준 병역 의무 복무 기간</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>복무 형태</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>복무 기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>복무일수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['육군 현역병', '18개월', '548일'],
                  ['해병대 현역병', '18개월', '548일'],
                  ['의무경찰', '18개월', '548일'],
                  ['해군 현역병', '20개월', '610일'],
                  ['공군 현역병', '21개월', '640일'],
                  ['사회복무요원', '21개월', '640일'],
                  ['산업기능요원', '23개월 + 대기', '-'],
                  ['예술체육요원', '34개월', '-'],
                ].map(([type, period, days], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{period}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '전역일 계산은 정확한가요?', a: '본 계산기는 입대일부터 법정 복무 기간을 기준으로 계산합니다. 실제 전역일은 복무 중 징계, 포상휴가, 병가, 위로휴가 등에 따라 달라질 수 있습니다. 정확한 전역일은 소속 부대의 인사 담당자에게 확인하세요.' },
              { q: '포상휴가나 특별휴가는 전역일에 영향을 주나요?', a: '일반적으로 포상휴가는 복무 기간에 산입되어 전역일이 앞당겨집니다. 반면 징계로 인한 복무 연장은 전역일을 늦출 수 있습니다. 이러한 변동 사항은 개인마다 다르므로 부대 확인이 필요합니다.' },
              { q: '현역과 사회복무요원 중 어떤 것이 유리한가요?', a: '현역은 군 내에서 복무하며 18~21개월이 소요됩니다. 사회복무요원은 사회 기관에서 복무하며 21개월이 소요됩니다. 각자의 신체등위, 희망 진로, 개인 사정에 따라 다르므로 일률적으로 비교하기 어렵습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}