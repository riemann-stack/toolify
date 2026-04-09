import type { Metadata } from 'next'
import JsonClient from './JsonClient'

export const metadata: Metadata = {
  title: 'JSON 포맷터 — JSON 정렬·압축·유효성 검사 | Toolify',
  description: 'JSON을 보기 좋게 정렬하거나 한 줄로 압축합니다. 유효성 검사로 JSON 오류 위치를 즉시 확인.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON유효성검사', 'JSON뷰어'],
}

export default function JsonPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📋 JSON 포맷터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        JSON을 정렬·압축하고 유효성을 검사합니다.
      </p>
      <JsonClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>JSON 포맷터 활용법</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          API 응답을 보기 좋게 정렬하거나, 저장 공간 절약을 위해 공백을 제거한 압축 JSON으로 변환할 수 있습니다. 잘못된 JSON을 붙여넣으면 오류 위치를 즉시 알려드립니다.
        </p>
      </div>
    </div>
  )
}