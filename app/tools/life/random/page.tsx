import type { Metadata } from 'next'
import RandomClient from './RandomClient'

export const metadata: Metadata = {
  title: '랜덤 추첨기 — 숫자·항목 무작위 뽑기 | Toolify',
  description: '숫자 범위에서 랜덤 번호를 뽑거나, 직접 입력한 항목 중에서 무작위로 추첨합니다. 경품 추첨, 당번 정하기에 유용.',
  keywords: ['랜덤추첨기', '무작위추첨', '랜덤뽑기', '경품추첨기', '번호추첨기'],
}

export default function RandomPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎲 랜덤 추첨기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        숫자 범위 추첨과 항목 추첨 두 가지 모드를 지원합니다.
      </p>
      <RandomClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>랜덤 추첨기 활용법</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          경품 당첨자 추첨, 팀 나누기, 당번 정하기, 메뉴 고르기 등 공정한 무작위 선택이 필요할 때 사용하세요. 항목 추첨 모드에서는 이름이나 항목을 줄바꿈으로 구분해 입력하면 됩니다.
        </p>
      </div>
    </div>
  )
}