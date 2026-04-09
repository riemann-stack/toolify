import type { Metadata } from 'next'
import DdayClient from './DdayClient'

export const metadata: Metadata = {
  title: 'D-day 계산기 — 날짜 카운트다운 | Toolify',
  description: '특정 날짜까지 남은 일수를 계산합니다. 수능, 결혼식, 시험, 여행 등 중요한 날짜를 디데이로 관리하세요.',
  keywords: ['디데이계산기', 'D-day계산기', '날짜카운트다운', '남은일수계산', '디데이'],
}

export default function DdayPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📅 D-day 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 날짜까지 남은 일수를 계산합니다. 여러 개의 디데이를 동시에 관리할 수 있어요.
      </p>
      <DdayClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>D-day 계산기 활용법</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          수능, 공무원 시험, 결혼식, 여행, 군 전역일 등 중요한 날짜를 등록해두면 오늘 기준으로 남은 일수를 바로 확인할 수 있습니다. D+는 이미 지난 날짜를 기준으로 경과된 일수를 나타냅니다.
        </p>
      </div>
    </div>
  )
}