import type { Metadata } from 'next'
import Base64Client from './Base64Client'

export const metadata: Metadata = {
  title: 'Base64 인코더/디코더 — 텍스트 Base64 변환 | Youtil',
  description: '텍스트를 Base64로 인코딩하거나 Base64를 텍스트로 디코딩합니다. URL-safe Base64 지원. JWT, 이미지 데이터URI 변환에 활용.',
  keywords: ['base64인코더', 'base64디코더', 'base64변환기', '텍스트base64', 'base64온라인', 'base64decode'],
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Base64란 무엇인가?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            Base64는 바이너리 데이터를 64개의 ASCII 문자(A-Z, a-z, 0-9, +, /)로 표현하는 인코딩 방식입니다. 텍스트 기반 시스템에서 이진 데이터를 안전하게 전송하기 위해 개발되었습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '이메일 첨부파일', content: 'MIME 표준에서 이메일 첨부파일을 텍스트로 전송하기 위해 Base64를 사용합니다.' },
              { title: 'JWT 토큰', content: 'JSON Web Token(JWT)의 헤더와 페이로드 부분이 Base64URL로 인코딩됩니다. 인증 시스템에서 널리 사용됩니다.' },
              { title: '이미지 데이터 URI', content: 'HTML이나 CSS에서 이미지를 직접 삽입할 때 data:image/png;base64,... 형태로 Base64 인코딩된 이미지 데이터를 사용합니다.' },
              { title: 'API 인증', content: 'HTTP Basic 인증에서 사용자명:비밀번호를 Base64로 인코딩해 Authorization 헤더에 담습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Base64 vs URL-safe Base64</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            표준 Base64는 +와 /를 사용하는데, 이 문자들은 URL에서 특별한 의미를 가집니다. URL-safe Base64는 +를 -로, /를 _로 대체해 URL이나 파일명에서 안전하게 사용할 수 있습니다. JWT 토큰이나 URL 파라미터에 포함할 때는 URL-safe 모드를 사용하세요.
          </p>
        </div>
      </div>
    </div>
  )
}