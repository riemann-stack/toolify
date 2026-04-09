import type { Metadata } from 'next'
import LadderClient from './LadderClient'

export const metadata: Metadata = {
  title: '사다리타기 — 온라인 무료 사다리 게임 | Toolify',
  description: '온라인 사다리타기 게임. 참가자와 결과를 입력하고 공정한 무작위 사다리를 생성합니다. 당번 정하기, 팀 나누기에 유용.',
  keywords: ['사다리타기', '온라인사다리타기', '사다리게임', '무료사다리타기', '당번정하기'],
}

export default function LadderPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪜 사다리타기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        참가자와 결과를 입력하고 공정한 사다리를 생성하세요.
      </p>
      <LadderClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>사다리타기 활용법</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          당번 정하기, 팀 나누기, 선물 교환 대상 정하기, 발표 순서 정하기 등에 활용하세요.
          사다리는 매번 새롭게 무작위로 생성되어 공정한 결과를 보장합니다.
        </p>
      </div>
    </div>
  )
}