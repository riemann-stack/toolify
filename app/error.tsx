'use client'

// 세그먼트 에러 바운더리 — 도구 하나의 런타임 예외가 사이트 전체 백화면이 되는 것을 방지.
// Nav·Footer는 루트 레이아웃이 유지하고, 본문 영역만 이 폴백으로 교체된다.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px 120px', textAlign: 'center' }}>
      <p style={{ fontSize: '44px', marginBottom: '16px' }} aria-hidden>
        🛠️
      </p>
      <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>
        일시적인 오류가 발생했어요
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '28px' }}>
        도구를 불러오는 중 문제가 생겼습니다. 다시 시도해도 반복되면{' '}
        <a href="mailto:contact@youtil.kr" style={{ color: 'var(--accent)' }}>contact@youtil.kr</a>로 알려주세요.
        {error.digest && (
          <span style={{ display: 'block', fontSize: '12px', marginTop: '8px', color: 'var(--muted)' }}>
            오류 코드: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--accent-strong)', color: '#ffffff', border: 'none', borderRadius: '10px',
            padding: '12px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            fontFamily: '"Noto Sans KR", sans-serif',
          }}
        >
          다시 시도
        </button>
        <a
          href="/"
          style={{
            background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px',
            padding: '12px 22px', fontSize: '14px', fontWeight: 700,
            fontFamily: '"Noto Sans KR", sans-serif',
          }}
        >
          홈으로
        </a>
      </div>
    </div>
  )
}
