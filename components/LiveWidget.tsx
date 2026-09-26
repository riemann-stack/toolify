'use client'
/* components/LiveWidget.tsx — 홈 '오늘' 한 줄: 오늘 날짜 · 다음 공휴일 D-n (UX-10: 1초 시계 → 실용 정보)
   · 서버(ISR)가 KST 기준으로 계산한 값을 initial로 받아 SSR에 바로 그린다 → 빈 자리 없음
   · 마운트 후 기기 날짜로 한 번 다시 계산 — ISR 캐시가 하루 넘게 묵었을 때만 글자가 바뀐다(한 줄 고정 높이 → CLS 0)
   · 공휴일 데이터는 lib/krHolidays 단일 소스(대체공휴일 포함). 데이터 범위 밖이면 공휴일 부분을 생략 */
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { todayStr } from '@/lib/date'
import { todayInfo, type TodayInfo } from '@/lib/todayInfo'
import styles from '@/app/page.module.css'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

function ymd(s: string): [number, number, number] {
  const [y, m, d] = s.split('-').map(Number)
  return [y, m, d]
}
/** 'YYYY-MM-DD' → '9월 26일 (토)' — Date 문자열 파싱 없이(UTC 해석 버그 회피) */
function label(s: string): string {
  const [y, m, d] = ymd(s)
  return `${m}월 ${d}일 (${WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`
}
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = ymd(a)
  const [by, bm, bd] = ymd(b)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

export default function LiveWidget({ initial }: { initial: TodayInfo }) {
  const [info, setInfo] = useState(initial)
  useEffect(() => {
    const t = todayStr()
    // 기기 날짜가 서버 렌더 날짜와 다를 때만 갱신(의도된 마운트 후 1회 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t !== initial.today) setInfo(todayInfo(t))
  }, [initial.today])

  const n = info.next
  const d = n ? dayDiff(info.today, n.date) : 0
  return (
    <p className={styles.hmToday}>
      <span>오늘 <b>{label(info.today)}</b></span>
      {n && (
        <span>
          {d === 0 ? <>오늘은 <b>{n.name}</b></> : <>다음 공휴일 <b>{n.name}</b> {label(n.date)} · <b className="num">D-{d}</b></>}
        </span>
      )}
      <Link href="/tools/date/holiday-bridge">연차 붙여 쉬는 날 계산</Link>
    </p>
  )
}
