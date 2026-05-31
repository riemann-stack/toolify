import HomeClient from './HomeClient'
import { getFeaturedSlug } from '@/lib/collections'

// ISR — 1시간마다 정적 HTML 재생성. 컬렉션 배너의 "오늘의 시즌 추천"이
// 첫 페인트부터 정확하도록 서버에서 미리 계산해 prop으로 내려준다.
export const revalidate = 3600

/** 주어진 Date의 UTC 필드 기준 연중 일자(1-366) */
function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  return Math.floor((d.getTime() - start) / 86_400_000)
}

export default function HomePage() {
  // 한국(KST = UTC+9) 기준 '오늘'로 시즌 추천을 계산한다.
  // 서버는 UTC로 동작하므로 +9h 시프트 후 UTC 필드를 읽으면 KST 달력 날짜가 된다.
  // (UTC 그대로 쓰면 자정~오전 9시 KST 구간에서 최대 9시간, 연·월 경계에서는 시즌 풀까지 어긋남)
  const kst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  const featuredSlug = getFeaturedSlug(kst.getUTCMonth() + 1, dayOfYear(kst))
  return <HomeClient initialFeaturedSlug={featuredSlug} />
}
