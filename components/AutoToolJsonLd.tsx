'use client'

/* /tools/* 전 페이지 자동 구조화 데이터 — BreadcrumbList + WebApplication (스펙 §10.22).
   경로(usePathname)를 lib/tools 레지스트리와 대조해 자동 생성하므로 도구를 추가해도 별도 작업이 필요 없다.
   ─ 보이는 바이라인과 같은 값만: author = 리만(필명, 1인 운영 — SITE_OPERATOR), publisher = Organization(@id, SiteJsonLd).
   ─ 날짜(dateModified)·출처(citation)는 서버 전용 lib/toolMeta에 있어 여기(클라이언트 번들)에 넣지 않는다 →
     <ToolPage>가 같은 @id(URL#app)의 WebApplication 노드로 보탠다. 병합에 기대지 않도록 그 노드도 단독으로 유효하게
     같은 이름·분류·OS·offers를 갖는다(lib/toolMeta APP_BASE — 여기 값과 반드시 같게).
   ─ 평점(aggregateRating)·리뷰는 넣지 않는다(실제 평점 데이터 없음 — 가짜 신호 금지). */

import { usePathname } from 'next/navigation'
import { categories } from '@/lib/tools'
import { SITE_OPERATOR, ORGANIZATION_ID, WEBSITE_ID } from './SiteJsonLd'

const BASE = 'https://youtil.kr'

export default function AutoToolJsonLd() {
  const pathname = usePathname()
  if (!pathname || !pathname.startsWith('/tools')) return null
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  // 경로 → 카테고리/도구 매칭
  let category: (typeof categories)[number] | undefined
  let tool: { href: string; name: string; desc: string } | undefined
  for (const c of categories) {
    if (path === `/tools/${c.id}`) { category = c; break }
    const t = c.tools.find((x) => x.href === path)
    if (t) { category = c; tool = t; break }
  }

  // 빵부스러기 항목 (화면 ToolBreadcrumb: 홈 › 분야 › 도구 — JSON-LD는 '전체 도구' 단계를 포함해 사이트 구조를 그대로)
  const crumbs: { name: string; url: string }[] = [
    { name: '홈', url: BASE },
    { name: '전체 도구', url: `${BASE}/tools` },
  ]
  if (category) crumbs.push({ name: category.name, url: `${BASE}/tools/${category.id}` })
  if (tool) crumbs.push({ name: tool.name, url: `${BASE}${tool.href}` })

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }

  const graphs: object[] = [breadcrumb]

  if (tool) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${BASE}${tool.href}#app`, // ToolPage의 보강 노드(dateModified·citation)와 같은 @id
      name: tool.name,
      description: tool.desc,
      url: `${BASE}${tool.href}`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'ko-KR',
      isAccessibleForFree: true,
      author: { '@type': 'Person', name: SITE_OPERATOR.name, jobTitle: SITE_OPERATOR.role, url: `${BASE}${SITE_OPERATOR.url}` },
      publisher: { '@id': ORGANIZATION_ID },
      isPartOf: { '@id': WEBSITE_ID },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    })
  }

  return (
    <>
      {graphs.map((g, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(g).replace(/</g, '\\u003c') }} />
      ))}
    </>
  )
}
