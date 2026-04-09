import type { Metadata } from 'next'
import DiffClient from './DiffClient'

export const metadata: Metadata = {
  title: '날짜 차이 계산기 — 두 날짜 사이 일수 계산 | Toolify',
  description: '두 날짜 사이의 일수, 주수, 개월수, 연수를 계산합니다. 근무일수, 프로젝트 기간 계산에 유용.',
  keywords: ['날짜계산기', '날짜차이계산', '일수계산기', '기간계산기', '날짜간격계산'],
}

export default function DiffPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📆 날짜 차이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        두 날짜 사이의 정확한 기간을 계산합니다.
      </p>
      <DiffClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>날짜 차이 계산 활용법</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          입사일부터 오늘까지 근속 기간, 계약 시작일과 종료일 사이의 일수, 두 이벤트 사이의 간격 등을 계산할 때 유용합니다. 윤년과 월별 일수 차이를 자동으로 반영합니다.
        </p>
      </div>
    </div>
  )
}