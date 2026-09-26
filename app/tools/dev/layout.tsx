'use client'

/* /tools/dev 전용 JetBrains Mono 로더 (FINAL_SPEC §6.2).
   - 전역 폰트(Pretendard Variable)는 app/layout.tsx <head>에서 비차단 로드. 모노는 개발자 도구에서만 받는다
     → 그 밖의 페이지에서 var(--font-mono) 는 SF Mono·Menlo·Consolas·D2Coding 등 시스템 모노로 렌더된다.
   - 비차단: SSR 때 preconnect·preload(as=style) 힌트만 <head>에 내보내 조기 fetch 하고,
     적용은 effect 가 삽입하는 stylesheet(스크립트 삽입 = 렌더 비차단)로 한다. 같은 URL이라 캐시 1회.
   - effect 라서 서버 렌더 첫 진입과 클라이언트 내비게이션(/tools → /tools/dev/…) 모두에서 동작한다.
   - 상위 app/tools/layout.tsx(브레드크럼·JSON-LD)는 그대로 감싼다 — 이 레이아웃은 children 만 통과시킨다. */
import { useEffect, type ReactNode } from 'react'
import { preconnect, preload } from 'react-dom'

const MONO_CSS_URL = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'

export default function DevLayout({ children }: { children: ReactNode }) {
  preconnect('https://fonts.googleapis.com')
  preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
  preload(MONO_CSS_URL, { as: 'style' })

  useEffect(() => {
    if (document.querySelector(`link[rel="stylesheet"][href="${MONO_CSS_URL}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = MONO_CSS_URL
    document.head.appendChild(link)
  }, [])

  return <>{children}</>
}
