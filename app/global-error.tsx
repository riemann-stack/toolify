'use client'

/* app/global-error.tsx — 루트 레이아웃 자체가 실패했을 때의 마지막 화면 (Trust Ledger 상태 화면)
   ─ 루트 레이아웃을 대체하므로 <html>·<body>와 전역 스타일(globals.css → ui.css @import)을 직접 불러온다. metadata 대신 React 19 <title>.
   ─ Nav·Footer·AutoAds가 없는 상태 — 광고 슬롯도 스크립트 삽입도 없다. 이미 로드된 adsbygoogle에는 신규 요청 보류를 '시도'한다
     (AutoAds.tsx와 같은 best-effort 방식 · 우리가 1로 바꾼 경우에만 언마운트 때 0으로 되돌림).
   ─ 폰트 CSS는 따로 받지 않는다(장애 중 외부 요청 최소화) — --font-sans의 시스템 서체 폴백으로 렌더. */
import './globals.css'
import { useEffect } from 'react'
import s from './_trust/trust.module.css'

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  unstable_retry?: () => void
}) {
  useEffect(() => {
    let paused = false
    try {
      const q = window.adsbygoogle
      if (q && q.pauseAdRequests !== 1) { q.pauseAdRequests = 1; paused = true }
    } catch { /* 광고 차단 등 — 무시 */ }
    return () => {
      if (!paused) return
      try { if (window.adsbygoogle) window.adsbygoogle.pauseAdRequests = 0 } catch { /* 무시 */ }
    }
  }, [])

  const retry = () => (unstable_retry ?? reset)()

  return (
    <html lang="ko">
      <body>
        <title>일시적인 오류 | Youtil</title>
        <div className={s.state}>
          {/* 루트 레이아웃이 깨진 상태 — 클라이언트 라우터 대신 전체 새로고침으로 복구 */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={s.stateCode} aria-label="Youtil 홈">Youtil</a>
          <div role="alert">
            <h1 className={s.stateTitle}>사이트를 불러오지 못했습니다</h1>
          </div>
          <p className={s.stateLead}>
            화면을 그리는 중에 문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요. 계속되면{' '}
            <a href={`mailto:contact@youtil.kr?subject=${encodeURIComponent('[오류] 사이트 오류')}`}>contact@youtil.kr</a>로
            페이지 주소{error.digest ? '와 아래 오류 코드' : ''}를 알려 주세요.
          </p>
          {error.digest && (
            <p className={s.stateDigest}>오류 코드 <code>{error.digest}</code></p>
          )}
          <div className={s.actions}>
            <button type="button" className="ui-btn ui-btn-primary" onClick={retry}>다시 시도</button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 전체 새로고침으로 복구 */}
            <a className="ui-btn ui-btn-outline" href="/">홈으로</a>
          </div>
        </div>
      </body>
    </html>
  )
}
