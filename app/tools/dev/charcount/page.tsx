import type { Metadata } from 'next'
import CharCountClient from './CharCountClient'

export const metadata: Metadata = {
  title: '글자수 세기 — 공백 포함/제외 실시간 카운트 | Toolify',
  description: '텍스트 글자수를 실시간으로 세어드립니다. 공백 포함/제외, 단어수, 줄수, 바이트 수까지 한번에 확인.',
  keywords: ['글자수세기', '글자수계산기', '자수세기', '단어수세기', '글자수확인'],
}

export default function CharCountPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔡 글자수 세기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        텍스트를 입력하면 글자수, 단어수, 줄수를 실시간으로 계산합니다.
      </p>
      <CharCountClient />
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>글자수 세기 활용 팁</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          SNS 글자수 제한(트위터 140자, 인스타그램 2,200자), 이력서 자기소개서 분량 체크, 문자 메시지 바이트 확인 등에 활용할 수 있습니다. 한글 1자는 UTF-8 기준 3바이트입니다.
        </p>
      </div>
    </div>
  )
}