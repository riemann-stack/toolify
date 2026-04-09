import type { Metadata } from 'next'
import BmiClient from './BmiClient'

export const metadata: Metadata = {
  title: 'BMI 계산기 — 체질량지수 비만도 계산 | Toolify',
  description: '키와 체중을 입력해 BMI(체질량지수)를 계산합니다. WHO 기준 저체중·정상·과체중·비만 판정.',
  keywords: ['BMI계산기', '체질량지수', '비만도계산기', 'BMI비만', '체중계산기'],
}

export default function BmiPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚖️ BMI 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        키와 체중으로 체질량지수(BMI)를 계산하고 비만도를 확인합니다.
      </p>
      <BmiClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>BMI란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            BMI(Body Mass Index, 체질량지수)는 체중(kg)을 키(m)의 제곱으로 나눈 값입니다. WHO 기준으로 18.5 미만은 저체중, 18.5~24.9는 정상, 25~29.9는 과체중, 30 이상은 비만으로 분류됩니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>아시아 기준 BMI</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            한국을 포함한 아시아인은 같은 BMI에서 서양인보다 체지방률이 높아 대한비만학회 기준으로 25 이상을 비만으로 분류합니다. BMI는 참고 지표이며 근육량, 골격 등 개인차가 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}