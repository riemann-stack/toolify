// components/AdSlot.tsx
// 광고 슬롯. 자동광고(AutoAds)가 페이지에 광고를 직접 게재하므로,
// 이 컴포넌트는 슬롯 ID(data-ad-slot)가 주어진 경우에만 실제 <ins> 광고를 렌더링합니다.
// - 슬롯 ID가 없으면 프로덕션에서 아무것도 렌더링하지 않습니다(빈 공백 방지 → 심사 시 "의도 없는 공백" 제거).
// - 광고 제외 경로(lib/ads)와 광고 금지 화면(<AdFreeScreen /> 마운트 중 — 오류 화면 등)에서는 렌더링하지 않습니다.
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { adsAllowed, ADSENSE_CLIENT_ID } from '@/lib/ads'
import { useAdsSuppressed } from '@/components/AutoAds'

type AdSlotPosition = 'in-article' | 'sidebar' | 'footer' | 'between-tools'

interface AdSlotProps {
  /** 애드센스 슬롯 ID (data-ad-slot 숫자) — 광고 단위 생성 후 채움. 없으면 프로덕션에서 렌더링 X */
  slotId?: string
  /** 페이지 내 의미적 위치 라벨 */
  position: AdSlotPosition
  /** 레이아웃 시프트(CLS) 방지용 최소 높이(px) */
  minHeight?: number
}

export default function AdSlot({ slotId, position, minHeight = 250 }: AdSlotProps) {
  const pathname = usePathname()
  const suppressed = useAdsSuppressed()
  const allowed = adsAllowed(pathname) && !suppressed
  const isProd = process.env.NODE_ENV === 'production'
  const showIns = isProd && allowed && !!slotId && !!ADSENSE_CLIENT_ID
  const pushed = useRef(false)

  useEffect(() => {
    if (!showIns || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      /* adsbygoogle 미로드 시 무시 */
    }
  }, [showIns])

  // 광고 비허용 경로(민감·심사모드 제외 + 정책/내비/랜딩 페이지) 또는 광고 금지 화면: 렌더링 안 함
  if (!allowed) return null

  // 개발 환경: 시각적 자리표시자
  if (!isProd) {
    return (
      <div
        data-ad-slot={position}
        data-ad-slot-id={slotId}
        style={{
          minHeight,
          background: 'color-mix(in srgb, var(--accent) 4%, transparent)',
          border: '1px dashed color-mix(in srgb, var(--accent) 25%, transparent)',
          borderRadius: 'var(--radius-m)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: 12,
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.04em',
          margin: '24px 0',
        }}
      >
        [Ad Slot — {position}{slotId ? '' : ' · slotId 없음 → 프로덕션 미표시'}]
      </div>
    )
  }

  // 프로덕션: 슬롯 ID가 없으면 빈 공백을 만들지 않음.
  // (자동광고 스크립트가 페이지 적절한 위치에 광고를 직접 게재합니다.)
  if (!showIns) return null

  // 프로덕션 + 슬롯 ID 보유: 실제 애드센스 디스플레이 광고 단위 렌더링
  return (
    <ins
      className="adsbygoogle"
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-ad-position={position}
      style={{ display: 'block', minHeight, margin: '24px 0' }}
    />
  )
}
