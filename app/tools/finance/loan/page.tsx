import type { Metadata } from 'next'
import LoanClient from './LoanClient'

export const metadata: Metadata = {
  title: '대출이자 계산기 — 원리금균등·원금균등 상환 비교 | Toolify',
  description: '대출 원금, 금리, 기간을 입력해 원리금균등과 원금균등 상환 방식을 비교합니다. 월 납입액과 총 이자를 즉시 계산.',
  keywords: ['대출이자계산기', '원리금균등', '원금균등', '주택담보대출계산기', '대출상환계산기'],
}

export default function LoanPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💳 대출이자 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원리금균등과 원금균등 두 상환 방식을 비교해 총 이자와 월 납입액을 계산합니다.
      </p>
      <LoanClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>원리금균등 vs 원금균등</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            원리금균등은 매달 동일한 금액을 납입하는 방식으로 초기 부담이 적지만 총 이자가 많습니다. 원금균등은 매달 동일한 원금을 상환해 초기 납입액이 높지만 총 이자가 적습니다. 소득이 안정적이라면 원금균등 방식이 유리합니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>중도상환 수수료</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            대부분의 대출 상품은 일정 기간 내 중도상환 시 수수료가 발생합니다. 본 계산기는 중도상환 수수료를 포함하지 않으며, 실제 대출 조건은 금융기관에서 확인하세요.
          </p>
        </div>
      </div>
    </div>
  )
}