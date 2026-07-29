/* 홈 전용 구조화 데이터 — 카테고리 ItemList.
   전역 WebSite/Organization(SiteJsonLd)에 더해, 홈에서 도구 카테고리 구조를
   검색엔진에 명시해 사이트링크·이해도를 돕습니다. app/page.tsx에서 1회 렌더. */
import { categories, totalTools } from '@/lib/tools'

const BASE = 'https://youtil.kr'

const ITEM_LIST = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Youtil 도구 카테고리',
  description: `금융·건강·생활·날짜·변환 등 ${categories.length}개 카테고리, ${totalTools}개의 무료 온라인 계산기·도구`,
  numberOfItems: categories.length,
  itemListElement: categories.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    url: `${BASE}/tools/${c.id}`,
  })),
}

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ITEM_LIST) }}
    />
  )
}
