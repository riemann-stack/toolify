import type { MetadataRoute } from 'next'
import { categories } from '@/lib/tools'
import { COLLECTIONS } from '@/lib/collections'
// 페이지별 실제 마지막 변경일(git 이력 기반) — scripts/gen-lastmod.mts가 생성.
// 콘텐츠 변경 커밋 후 `npm run gen:lastmod` 재실행. 표현만 바꾼 기계적 커밋은
// 제목에 [skip-lastmod]를 넣거나 .lastmod-ignore에 해시를 등록해 lastmod가 리셋되지 않게 한다.
import lastmodMap from './sitemap-lastmod.json'

const BASE = 'https://youtil.kr'
const LASTMOD: Readonly<Record<string, string>> = lastmodMap

// priority·changefreq는 출력하지 않는다 — Google·Bing 모두 무시하는 값이고,
// 가정값(인기 도구 1.0, 전부 weekly)은 실측과 어긋나 오히려 신호를 흐린다. lastmod만 정확하게 유지.

const STATIC_PATHS = ['/', '/tools', '/collections', '/about', '/contact', '/privacy', '/terms', '/disclaimer']

/** YYYY-MM-DD 형식만 인정 (매니페스트 오염 방지). */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default function sitemap(): MetadataRoute.Sitemap {
  // 모든 경로는 현재 레지스트리·컬렉션에서 파생 — 도구가 병합·삭제되면 사이트맵에서도 자동으로 빠진다
  // (매니페스트에 남은 옛 경로는 조회되지 않을 뿐 무해. 리다이렉트 출발 URL은 레지스트리에 없으므로 미포함).
  const categoryPaths = categories.map((c) => `/tools/${c.id}`)
  const toolPaths = categories.flatMap((c) => c.tools.map((t) => t.href))
  // 상황별 가이드 컬렉션 랜딩 — 큐레이션 페이지도 검색엔진이 색인하도록 포함
  const collectionPaths = COLLECTIONS.map((c) => `/collections/${c.slug}`)

  // 정적 + 카테고리 + 컬렉션 + 전체 도구 (중복 제거, 순서 유지)
  const allPaths = Array.from(new Set([...STATIC_PATHS, ...categoryPaths, ...collectionPaths, ...toolPaths]))

  return allPaths.map((path) => {
    const lastmod = LASTMOD[path]
    return {
      url: path === '/' ? BASE : `${BASE}${path}`,
      // 매니페스트에 없으면(새 도구를 추가하고 아직 gen:lastmod 전) lastmod를 생략한다.
      // 빌드 시각을 넣으면 배포마다 날짜가 바뀌어 lastmod 신뢰도를 떨어뜨린다.
      ...(lastmod && DATE_RE.test(lastmod) ? { lastModified: lastmod } : {}),
    }
  })
}
