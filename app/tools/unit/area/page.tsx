import AreaClient from './AreaClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit/area',
  title: '평수 ㎡ 변환기 — 평방미터 계산기',
  description: '평수를 제곱미터(㎡)로, 제곱미터를 평수로 즉시 변환. 아파트·오피스텔 평수 계산. 전용면적·공급면적 구분 안내.',
  keywords: ['평수계산기', '평수변환', '제곱미터변환', '㎡평수', '아파트평수', '평수㎡변환'],
})

export default function AreaPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏠 평수 ↔ ㎡ 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        평수와 제곱미터(㎡)를 즉시 변환합니다. 아파트·오피스텔 분양 면적 계산에 유용해요.
      </p>

      <AreaClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>아파트 평수별 ㎡ 환산표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>평수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>㎡ (제곱미터)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>일반 명칭</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['10평', '33.06㎡', '소형 원룸'],
                  ['15평', '49.59㎡', '소형 아파트'],
                  ['20평', '66.12㎡', '소형 아파트'],
                  ['24평', '79.34㎡', '국민 평형 (소)'],
                  ['25평', '82.64㎡', '국민 평형'],
                  ['30평', '99.17㎡', '중형 아파트'],
                  ['32평', '105.79㎡', '중형 아파트'],
                  ['34평', '112.40㎡', '중형 아파트'],
                  ['40평', '132.23㎡', '대형 아파트'],
                  ['50평', '165.29㎡', '대형 아파트'],
                ].map(([pyeong, sqm, type], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{pyeong}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{sqm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>전용면적 vs 공급면적 vs 계약면적</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '전용면적', content: '실제 거주하는 공간으로 방, 거실, 주방, 욕실만 포함합니다. 발코니·계단·엘리베이터는 제외됩니다. 아파트 실사용 면적을 가장 정확히 나타냅니다.' },
              { title: '공급면적', content: '전용면적에 주거공용면적(계단, 엘리베이터, 복도 등)을 합산한 면적입니다. 분양 광고에서 가장 많이 표기되는 면적으로 통상 "몇 평"이라 할 때 공급면적을 기준으로 합니다.' },
              { title: '계약면적', content: '공급면적에 기타공용면적(관리사무소, 주차장, 노인정 등)을 더한 면적입니다. 가장 넓은 면적으로 표기되며 분양가 산정의 기준이 됩니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>평수 계산 공식</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            1평은 정확히 3.30578㎡이며, 계산 편의상 3.3058을 사용합니다.
            평수를 ㎡로 변환하려면 평수에 3.3058을 곱하고, ㎡를 평수로 변환하려면 3.3058로 나누면 됩니다.
          </p>
        </div>

      </div>
    </div>
  )
}