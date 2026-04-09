import type { Metadata } from 'next'
import Base64Client from './Base64Client'

export const metadata: Metadata = {
  title: 'Base64 인코더/디코더 — 텍스트 변환 | Toolify',
  description: '텍스트를 Base64로 인코딩하거나, Base64를 텍스트로 디코딩합니다. URL-safe Base64도 지원.',
  keywords: ['base64인코더', 'base64디코더', 'base64변환기', '텍스트base64'],
}

export default function Base64Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔐 Base64 인코더/디코더
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        텍스트를 Base64로 인코딩하거나 Base64를 원문으로 디코딩합니다.
      </p>
      <Base64Client />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Base64란?</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          Base64는 바이너리 데이터를 ASCII 문자로 변환하는 인코딩 방식입니다. 이메일 첨부파일, JWT 토큰, 이미지 데이터 URI 등에 널리 사용됩니다. URL-safe 모드는 <code>+</code>를 <code>-</code>로, <code>/</code>를 <code>_</code>로 대체해 URL에서 안전하게 사용할 수 있습니다.
        </p>
      </div>
    </div>
  )
}