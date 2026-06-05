// components/AutoAds.tsx
// Google AdSense 자동 광고 로더.
// - lib/ads 의 ADS_ENABLED 가 true 이고 ADSENSE_CLIENT_ID 가 설정된 경우에만 동작
// - adsAllowed(false) 경로(민감 카테고리 + 정책/내비/랜딩 페이지)에서는 스크립트를 로드하지 않음.
//   → 정책·저가치 페이지에 adsbygoogle.js·ins 주입 흔적이 남지 않음 (Publisher Policies 안전).
// 승인 전(ADS_ENABLED=false)에는 아무것도 렌더링하지 않습니다.
'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { ADS_ENABLED, ADSENSE_CLIENT_ID, adsAllowed } from '@/lib/ads'

export default function AutoAds() {
  const pathname = usePathname()

  if (!ADS_ENABLED || !ADSENSE_CLIENT_ID) return null
  if (!adsAllowed(pathname)) return null

  return (
    <Script
      id="google-adsense-auto"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
    />
  )
}
