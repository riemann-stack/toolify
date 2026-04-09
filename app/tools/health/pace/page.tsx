import type { Metadata } from 'next'
import PaceClient from './PaceClient'

export const metadata: Metadata = {
  title: '러닝 페이스 계산기 — 마라톤 속도 계산 | Toolify',
  description: '목표 완주 시간으로 킬로미터당 페이스를 계산합니다. 5km, 10km, 하프마라톤, 풀마라톤 모두 지원.',
  keywords: ['러닝페이스계산기', '마라톤페이스', '킬로페이스', '달리기속도계산', '러닝속도'],
}

export default function PacePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃 러닝 페이스 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 완주 시간을 입력하면 킬로미터당 페이스와 시속을 계산합니다.
      </p>
      <PaceClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>페이스란?</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          러닝에서 페이스는 1km를 달리는 데 걸리는 시간(분:초)을 의미합니다. 예를 들어 5분 30초 페이스는 1km를 5분 30초에 달린다는 뜻입니다. 초보 러너는 보통 6~8분/km, 중급은 5~6분/km, 서브4 마라톤은 5분 41초/km 이내가 목표입니다.
        </p>
      </div>
    </div>
  )
}