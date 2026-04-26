// components/AdSlot.tsx
// 광고 슬롯 자리표시자. 애드센스 승인 후 프로덕션 분기에 ins 태그를 삽입할 예정.
// position 으로 의미적 라벨을 부여해, 추후 GA·heatmap 분석이나 A/B 테스트에 사용 가능.

type AdSlotPosition = 'in-article' | 'sidebar' | 'footer' | 'between-tools'

interface AdSlotProps {
  /** 애드센스 슬롯 ID (예: 'ca-pub-XXX/1234567890') — 승인 후 채움 */
  slotId?: string
  /** 페이지 내 의미적 위치 라벨 */
  position: AdSlotPosition
  /** 레이아웃 시프트(CLS) 방지용 최소 높이(px) */
  minHeight?: number
}

export default function AdSlot({ slotId, position, minHeight = 250 }: AdSlotProps) {
  // 개발 환경: 시각적 자리표시자
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        data-ad-slot={position}
        data-ad-slot-id={slotId}
        style={{
          minHeight,
          background: 'rgba(200,255,62,0.04)',
          border: '1px dashed rgba(200,255,62,0.25)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: 12,
          fontFamily: "'Noto Sans KR', sans-serif",
          letterSpacing: '0.04em',
          margin: '24px 0',
        }}
      >
        [Ad Slot — {position}]
      </div>
    )
  }

  // 프로덕션: 애드센스 승인 전에는 빈 자리만 차지 (CLS 방지),
  // 승인 후 이 곳에 <ins className="adsbygoogle" .../> 와 push 스크립트 추가 예정
  return (
    <div
      data-ad-slot={position}
      data-ad-slot-id={slotId}
      style={{ minHeight, margin: '24px 0' }}
      aria-hidden="true"
    />
  )
}
