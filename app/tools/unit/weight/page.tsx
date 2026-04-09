import type { Metadata } from 'next'
import WeightClient from './WeightClient'

export const metadata: Metadata = {
  title: '무게 변환기 — kg g lb oz 파운드 온스 | Toolify',
  description: 'kg, g, mg, 파운드(lb), 온스(oz), 근, 돈 등 무게 단위를 즉시 변환.',
  keywords: ['무게변환기', '파운드kg변환', '온스그램변환', 'lb kg변환'],
}

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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>자주 쓰는 변환 값</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          <strong style={{ color: 'var(--text)' }}>1파운드(lb) = 453.59g</strong> · <strong style={{ color: 'var(--text)' }}>1온스(oz) = 28.35g</strong> · <strong style={{ color: 'var(--text)' }}>1근 = 600g</strong>. 헬스·다이어트에선 파운드, 요리·금 거래에선 온스와 돈이 자주 쓰입니다.
        </p>
      </div>
    </div>
  )
}