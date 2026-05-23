import type { MetadataRoute } from 'next'
import { categories } from '@/lib/tools'

const BASE = 'https://youtil.kr'

// 우선순위 1.0 페이지 (홈 + 핵심 인기 도구)
const HIGH_PRIORITY = new Set<string>([
  '/',
  '/tools/finance/salary',
  '/tools/date/age',
  '/tools/life/lotto',
  '/tools/health/bmi',
  '/tools/finance/stock',
  '/tools/date/military',
  '/tools/life/dutch',
])

const STATIC_PATHS = ['/', '/tools', '/about', '/contact', '/privacy', '/terms', '/disclaimer']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const categoryPaths = categories.map((c) => `/tools/${c.id}`)
  const categorySet = new Set(categoryPaths)
  const toolPaths = categories.flatMap((c) => c.tools.map((t) => t.href))

  // 정적 + 카테고리 + 전체 도구 (중복 제거)
  const seen = new Set<string>()
  const allPaths = [...STATIC_PATHS, ...categoryPaths, ...toolPaths].filter((p) => {
    if (seen.has(p)) return false
    seen.add(p)
    return true
  })

  return allPaths.map((path) => ({
    url: path === '/' ? BASE : `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: HIGH_PRIORITY.has(path) ? 1 : categorySet.has(path) ? 0.8 : 0.7,
  }))
}
