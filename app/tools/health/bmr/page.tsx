import type { Metadata } from 'next'
import BmrClient from './BmrClient'

export const metadata: Metadata = {
  title: '기초대사량 계산기 — 하루 칼로리 계산 | Toolify',
  description: 'Harris-Benedict 공식으로 기초대사량(BMR)과 활동량별 하루 권장 칼로리를 계산합니다.',
  keywords: ['기초대사량계산기', 'BMR계산기', '하루칼로리', '칼로리계산기', '다이어트칼로리'],
}

export default function BmrPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔥 기초대사량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        기초대사량(BMR)과 활동 수준에 따른 하루 권장 칼로리를 계산합니다.
      </p>
      <BmrClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>기초대사량이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            기초대사량(BMR)은 생명 유지를 위해 최소한으로 필요한 에너지량입니다. 심장 박동, 호흡, 체온 유지 등 기본적인 신체 기능에 소모되는 칼로리로, 아무것도 하지 않아도 소모됩니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>다이어트 칼로리 계산법</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            체중 감량을 위해서는 하루 권장 칼로리(TDEE)보다 300~500kcal 적게 섭취하는 것을 권장합니다. 1kg의 지방은 약 7,700kcal에 해당하므로 하루 500kcal 부족 시 약 2주에 1kg 감량이 가능합니다.
          </p>
        </div>
      </div>
    </div>
  )
}