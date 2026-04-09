import type { Metadata } from 'next'
import CompoundClient from './CompoundClient'

export const metadata: Metadata = {
  title: '복리 계산기 — 투자 수익 계산 | Toolify',
  description: '원금, 연 수익률, 기간을 입력해 복리 투자 수익을 계산합니다. 적립식/거치식 모두 지원.',
  keywords: ['복리계산기', '복리투자', '투자수익계산기', '이자계산기', '적립식복리'],
}

export default function CompoundPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📈 복리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원금과 연 수익률로 복리 투자 수익을 계산합니다. 매월 적립식도 지원합니다.
      </p>
      <CompoundClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>복리의 마법</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            복리는 이자에 이자가 붙는 방식입니다. 단리와 달리 시간이 지날수록 수익이 기하급수적으로 늘어납니다.
            연 7% 수익률로 10년 투자하면 원금이 약 2배, 20년이면 약 4배가 됩니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>72의 법칙</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            원금이 2배가 되는 기간을 빠르게 계산하는 방법으로, 72를 연 수익률(%)로 나누면 됩니다.
            연 6% 수익률이면 72 ÷ 6 = 12년 후에 원금이 2배가 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}