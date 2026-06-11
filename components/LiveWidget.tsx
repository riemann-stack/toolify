'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const pad = (n: number) => n.toString().padStart(2, '0')

export default function LiveWidget() {
  // 클라이언트 마운트 후에만 시각 표시 (SSR 하이드레이션 불일치 방지)
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    // 시계 — 마운트 후 시각 표시 + 1초 주기 갱신 (하이드레이션 안전 패턴, 의도됨)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  let text = ' '
  if (now) {
    const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS[now.getDay()]}요일`
    const h = now.getHours()
    const ampm = h < 12 ? '오전' : '오후'
    const h12 = h % 12 || 12
    const timeStr = `${ampm} ${h12}시 ${pad(now.getMinutes())}분 ${pad(now.getSeconds())}초`
    text = `${dateStr} · ${timeStr}`
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '8px 0 2px',
        color: 'var(--muted)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.6,
        }}
        aria-live="off"
      >
        {text}
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
        내 기기 시계 기준 ·{' '}
        <Link
          href="/tools/date/server-time"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          정확한 서버 시간 확인
        </Link>
      </div>
    </div>
  )
}
