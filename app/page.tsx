import HomeClient from './HomeClient'
import { getFeaturedSlug } from '@/lib/collections'

// ISR — 1시간마다 정적 HTML 재생성. 컬렉션 배너의 "오늘의 시즌 추천"이
// 첫 페인트부터 정확하도록 서버에서 미리 계산해 prop으로 내려준다.
export const revalidate = 3600

/** 연중 일자(1-366). 서버/클라이언트 모두 UTC로 동일하게 계산 */
function dayOfYearUTC(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  return Math.floor((d.getTime() - start) / 86_400_000)
}

export default function HomePage() {
  const d = new Date()
  const featuredSlug = getFeaturedSlug(d.getUTCMonth() + 1, dayOfYearUTC(d))
  return <HomeClient initialFeaturedSlug={featuredSlug} />
}
