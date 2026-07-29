import type { MetadataRoute } from 'next'
import { categories } from '@/lib/tools'
import { COLLECTIONS } from '@/lib/collections'
// 페이지별 실제 마지막 변경일(git 이력 기반) — scripts/gen-lastmod.mts가 생성.
// 콘텐츠 변경 커밋 전 `npx tsx scripts/gen-lastmod.mts` 재실행.
import lastmodMap from './sitemap-lastmod.json'

const BASE = 'https://youtil.kr'
const LASTMOD: Record<string, string> = lastmodMap

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

const STATIC_PATHS = ['/', '/tools', '/collections', '/about', '/contact', '/privacy', '/terms', '/disclaimer']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const categoryPaths = categories.map((c) => `/tools/${c.id}`)
  const categorySet = new Set(categoryPaths)
  const toolPaths = categories.flatMap((c) => c.tools.map((t) => t.href))
  // 상황별 가이드 컬렉션 랜딩 — 큐레이션 페이지도 검색엔진이 색인하도록 포함
  const collectionPaths = COLLECTIONS.map((c) => `/collections/${c.slug}`)
  const collectionSet = new Set(collectionPaths)

  // 정적 + 카테고리 + 컬렉션 + 전체 도구 (중복 제거)
  const seen = new Set<string>()
  const allPaths = [
    ...STATIC_PATHS,
    ...categoryPaths,
    ...collectionPaths,
    ...toolPaths,
  ].filter((p) => {
    if (seen.has(p)) return false
    seen.add(p)
    return true
  })

  return allPaths.map((path) => ({
    url: path === '/' ? BASE : `${BASE}${path}`,
    // 매니페스트의 실제 변경일 우선, 누락 시 빌드시각 폴백(정상 경로에선 매니페스트가 전부 커버)
    lastModified: LASTMOD[path] ?? now,
    changeFrequency: 'weekly',
    priority: HIGH_PRIORITY.has(path)
      ? 1
      : categorySet.has(path) || collectionSet.has(path)
        ? 0.6
        : 0.7,
  }))
}
