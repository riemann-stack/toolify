// components/AutoAds.tsx
// Google AdSense 자동 광고 로더 + '광고 금지 화면' 신호.
// - lib/ads 의 ADS_ENABLED 가 true 이고 ADSENSE_CLIENT_ID 가 설정된 경우에만 동작
// - adsAllowed(false) 경로(민감·심사모드 제외 + 정책/내비/랜딩 + 404)에서는 스크립트를 로드하지 않음.
//   → 정책·저가치 페이지에 adsbygoogle.js·ins 주입 흔적이 남지 않음 (Publisher Policies 안전).
// - <AdFreeScreen />이 마운트된 동안(오류 화면 등)도 광고를 만들지 않음.
//
// 오류 화면 가드 (app/error.tsx):
//   AutoAds는 루트 레이아웃에 있어 도구 페이지에서 런타임 오류가 나 error.tsx가 본문을 대체해도
//   살아 있고, 경로도 그대로라 adsAllowed()만으로는 못 막는다. 스크립트가 이미 로드됐다면 자동 광고가
//   오류 화면에 붙을 수 있다(정책: 오류·콘텐츠 없는 화면 광고 금지).
//   → 오류 화면이 <AdFreeScreen />을 렌더할 때에만(그 화면에 마운트된 동안에만) 효과가 있다:
//     ① 아직 삽입 전이면 스크립트를 넣지 않는다 — 확정적(우리 코드가 삽입 자체를 안 함).
//     ② 이미 삽입·로드됐으면 `adsbygoogle.pauseAdRequests = 1`로 신규 광고 요청 보류를 '시도'한다 — best-effort.
//     ③ 오류 화면이 사라지면(재시도·다른 페이지 이동) 0으로 재개한다.
//   같은 보류/재개는 SPA 이동으로 광고 비허용 페이지(홈·정책 등)에 들어갈 때도 적용된다
//   (한 번 로드된 adsbygoogle.js는 언로드되지 않으므로).
//
//   ⚠ ②는 보장되지 않는다(best-effort):
//     Google이 문서화한 pauseAdRequests 사용법은 '스크립트 로드 "전에" 1로 설정 → 동의 등 조건 충족 후 0으로 재개'
//     뿐이다. 로드 "후에" 1로 바꿨을 때 자동 광고가 신규 요청을 멈추는지는 문서에 없다(현재 동작해도 예고 없이 바뀔 수 있음).
//     한계: 이미 화면에 붙은 광고(앵커·전면 등)를 떼지는 못한다.
//   ▶ 배포 후 확인: DevTools 네트워크 패널에서 'googlesyndication|doubleclick' 필터 → 광고 허용 도구 페이지에서
//     광고가 뜬 뒤 SPA 이동으로 홈·정책 페이지(또는 오류 화면)로 가서 신규 광고 요청(googleads.g.doubleclick.net/pagead/ads 등)이 더 나가지 않는지 본다.
//     나간다면 ②는 무효 — 이 주석·README를 고치고, 확실히 막아야 하는 화면은 전체 새로고침으로 진입하게 해
//     ①(삽입 안 함)이 적용되도록 하는 대안을 검토할 것.
//
// 서버 렌더 <script async>를 쓰지 않는 이유 (next/script afterInteractive 유지):
//   usePathname은 정적 프리렌더에서도 동작하므로 React 19의 <script async src> 호이스팅으로
//   루트 레이아웃을 동적으로 만들지 않고도 SSR HTML에 태그를 넣을 수는 있다.
//   그러나 그러면 스크립트가 하이드레이션 '전에' 실행될 수 있고, 자동 광고가 <html>/<body> style을
//   바꾸거나 본문에 요소를 삽입하면 하이드레이션 불일치 → React가 루트를 클라이언트 재렌더(CLS·광고 소실)한다.
//   소유권 인증은 layout의 <meta name="google-adsense-account">와 ads.txt로 이미 충족되므로
//   (adsense 감사 P3: 필수 아님) 하이드레이션 이후 삽입되는 현 방식을 유지한다.
'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { ADS_ENABLED, ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC, adsAllowed } from '@/lib/ads'

/* ── 광고 금지 화면 신호 (모듈 전역 카운터 — 여러 개가 동시에 마운트돼도 안전) ── */
let suppressCount = 0
const listeners = new Set<() => void>()

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
const getSnapshot = (): boolean => suppressCount > 0
const getServerSnapshot = (): boolean => false

function changeSuppress(delta: 1 | -1): void {
  suppressCount = Math.max(0, suppressCount + delta)
  listeners.forEach((l) => l())
}

/** 광고 금지 화면이 떠 있는지 — AutoAds·AdSlot이 구독. */
export function useAdsSuppressed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * 광고 금지 화면 표지. 오류 화면(app/error.tsx) 등 '게시자 콘텐츠가 없는 화면'에 렌더한다.
 * 렌더된 화면에서만 효과가 있다 — 마운트된 동안 자동 광고 스크립트 삽입·수동 슬롯 생성을 막고,
 * 이미 로드된 스크립트에는 신규 요청 보류를 시도한다(pauseAdRequests — best-effort, 위 헤더 주석 참고).
 *   사용: `import { AdFreeScreen } from '@/components/AutoAds'` → 오류 UI 안에 `<AdFreeScreen />`
 */
export function AdFreeScreen(): null {
  useEffect(() => {
    changeSuppress(1)
    return () => changeSuppress(-1)
  }, [])
  return null
}

/* ── 이미 로드된 스크립트의 신규 광고 요청 보류/재개 (best-effort) ──
   pauseAdRequests를 '로드 후에' 1로 바꾸는 것은 Google 문서 밖 사용법이라 효과가 보장되지 않는다
   (문서화된 것은 로드 전 1 → 이후 0 재개뿐). 실패해도 부작용이 없는 범위에서만 시도한다.
   기본 경로(허용 도구 페이지 직접 진입)에서는 아무것도 건드리지 않는다:
   우리가 1로 바꾼 적이 있을 때만 0으로 되돌린다(0으로 재개는 문서화된 동작). */
let pausedByUs = false

function syncAdRequestPause(pause: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (pause) {
      if (pausedByUs) return
      // 스크립트가 한 번도 삽입되지 않았다면 보류할 대상이 없음
      if (!document.querySelector(`script[src="${ADSENSE_SCRIPT_SRC}"]`)) return
      ;(window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1
      pausedByUs = true
    } else if (pausedByUs) {
      ;(window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0
      pausedByUs = false
    }
  } catch {
    /* adsbygoogle 객체 접근 실패 시 무시 */
  }
}

export default function AutoAds() {
  const pathname = usePathname()
  const suppressed = useAdsSuppressed()
  const active = ADS_ENABLED && !!ADSENSE_CLIENT_ID && adsAllowed(pathname) && !suppressed

  useEffect(() => {
    syncAdRequestPause(!active)
  }, [active])

  if (!active) return null

  return (
    <Script
      id="google-adsense-auto"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={ADSENSE_SCRIPT_SRC}
    />
  )
}
