import type { Metadata } from 'next'
import AreaClient from './AreaClient'

export const metadata: Metadata = {
  title: '평수 ㎡ 변환기 — 평방미터 계산기 | Toolify',
  description: '평수를 제곱미터(㎡)로, 제곱미터를 평수로 즉시 변환. 아파트 평수 계산, 분양면적 환산에 유용.',
  keywords: ['평수계산기', '평수변환', '제곱미터변환', '㎡평수', '아파트평수'],
}

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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>평수 계산 공식</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
          <strong style={{ color: 'var(--text)' }}>1평 = 3.305785 ㎡</strong>로, 평수에 3.3058을 곱하면 제곱미터가 됩니다. 반대로 ㎡를 3.3058로 나누면 평수가 나와요.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          아파트 분양 시 공급면적과 전용면적을 구분해서 계산하세요. 일반적으로 광고에 표기되는 평수는 공급면적 기준입니다.
        </p>
      </div>
    </div>
  )
}