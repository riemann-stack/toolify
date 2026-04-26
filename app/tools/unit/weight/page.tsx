import WeightClient from './WeightClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit/weight',
  title: '무게 변환기 — kg g lb oz 파운드 온스 근 돈 변환',
  description: 'kg, g, mg, 파운드(lb), 온스(oz), 근, 돈 등 무게 단위를 즉시 변환. 요리, 헬스, 금 거래 등 다양한 상황에 활용.',
  keywords: ['무게변환기', '파운드kg변환', '온스그램변환', 'lb kg변환', '근kg변환', '무게단위변환'],
})

export default function WeightPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚖️ 무게 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        kg, g부터 파운드, 온스, 근, 돈까지 무게 단위를 즉시 변환합니다.
      </p>

      <WeightClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>무게 단위 환산표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>단위</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>g (그램)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>kg (킬로그램)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>주요 활용</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1파운드 (lb)', '453.59g', '0.45359kg', '미국 체중 표기'],
                  ['1온스 (oz)', '28.35g', '0.02835kg', '요리, 금 거래'],
                  ['1근 (한국)', '600g', '0.6kg', '정육점, 과일'],
                  ['1돈', '3.75g', '0.00375kg', '금·귀금속 거래'],
                  ['1냥 (兩)', '37.5g', '0.0375kg', '한약재, 귀금속'],
                  ['1관 (貫)', '3,750g', '3.75kg', '전통 단위'],
                ].map(([unit, g, kg, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{g}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{kg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>자주 쓰는 변환 값</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            헬스·다이어트에서는 파운드(lb)가 자주 쓰입니다. 체중 150lb는 약 68kg입니다. 요리에서는 온스(oz)가 쓰이며 8oz는 약 227g입니다. 금 거래에서는 돈(3.75g)과 냥(37.5g)이 쓰이며, 순금 1돈은 약 3.75g입니다.
          </p>
        </div>
      </div>
    </div>
  )
}