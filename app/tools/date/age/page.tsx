import type { Metadata } from 'next'
import AgeClient from './AgeClient'

export const metadata: Metadata = {
  title: '만 나이 계산기 2026 — 법 개정 기준 | Toolify',
  description: '2023년 6월 시행된 만 나이 통일법 기준으로 만 나이를 즉시 계산합니다. 생년월일 입력만으로 현재 만 나이 확인.',
  keywords: ['만나이계산기', '만나이계산', '나이계산기', '만나이변환', '만나이통일법'],
}

export default function AgePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎂 만 나이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        생년월일을 입력하면 현재 기준 만 나이를 즉시 계산합니다.
      </p>
      <AgeClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>만 나이 통일법이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            2023년 6월 28일부터 시행된 법으로, 행정·사법 분야에서 나이 계산을 만 나이로 통일했습니다. 만 나이는 태어난 날을 0세로 시작해 생일이 지날 때마다 1살씩 더하는 방식입니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>세는 나이 vs 만 나이</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            세는 나이는 태어나자마자 1세로 시작해 매년 1월 1일에 1살씩 증가합니다. 만 나이는 생일 기준으로 계산되므로 생일이 지나기 전에는 세는 나이보다 2살, 생일이 지난 후에는 1살 적게 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}