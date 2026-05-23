'use client'

/* /tools/* 전 페이지 자동 구조화 데이터 — BreadcrumbList + WebApplication.
   경로(usePathname)를 lib/tools 레지스트리와 대조해 자동 생성하므로
   도구를 추가해도 별도 작업이 필요 없습니다. */

import { usePathname } from 'next/navigation'
import { categories } from '@/lib/tools'

const BASE = 'https://youtil.kr'

export default function AutoToolJsonLd() {
  const pathname = usePathname()
  if (!pathname || !pathname.startsWith('/tools')) return null

  // 경로 → 카테고리/도구 매칭
  let category: (typeof categories)[number] | undefined
  let tool: { href: string; name: string; desc: string } | undefined
  for (const c of categories) {
    if (pathname === `/tools/${c.id}`) { category = c; break }
    const t = c.tools.find((x) => x.href === pathname)
    if (t) { category = c; tool = t; break }
  }

  // 빵부스러기 항목
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
      name: tool.name,
      description: tool.desc,
      url: `${BASE}${tool.href}`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: 'Youtil', url: BASE },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    })
  }

  return (
    <>
      {graphs.map((g, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(g) }} />
      ))}
    </>
  )
}
