/* sitemap lastmod 매니페스트 생성 — 각 페이지가 '실제로 마지막 변경된 날'을 git 커밋 이력에서 산출.
   로컬에서 실행(전체 git 이력 필요) → app/sitemap-lastmod.json 커밋. sitemap.ts가 이 JSON을 읽어 lastmod로 사용.
   Vercel 빌드는 git 없이 커밋된 JSON만 읽으므로 빌드의 git 의존성 없음.
   콘텐츠 변경 커밋 전 `npx tsx scripts/gen-lastmod.mts` 재실행 권장.
   날짜 = git committer date(%cs, YYYY-MM-DD) — 지어낸 값 없음, 순수 이력 기반. */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { categories } from '../lib/tools'
import { COLLECTIONS } from '../lib/collections'

const FALLBACK = execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim()

/** 주어진 파일/디렉터리들을 마지막으로 건드린 커밋일 중 가장 최근(YYYY-MM-DD) */
function lastCommit(paths: string[]): string {
  let best = ''
  for (const p of paths) {
    try {
      const d = execSync(`git log -1 --format=%cs -- "${p}"`, { encoding: 'utf8' }).trim()
      if (d && d > best) best = d
    } catch { /* 미추적 경로 무시 */ }
  }
  return best || FALLBACK
}

const map: Record<string, string> = {}

// 정적 페이지 — 각 페이지의 실제 소스 파일
map['/'] = lastCommit(['app/page.tsx', 'app/HomeClient.tsx', 'components/HomeIntro.tsx', 'components/CollectionBanner.tsx'])
map['/tools'] = lastCommit(['app/tools/page.tsx', 'app/tools/ToolsBrowser.tsx', 'lib/tools.ts'])
map['/collections'] = lastCommit(['app/collections/page.tsx', 'lib/collections.ts'])
for (const s of ['about', 'contact', 'privacy', 'terms', 'disclaimer']) {
  map[`/${s}`] = lastCommit([`app/${s}/page.tsx`])
}

// 도구 — 도구 디렉터리 전체(page·Client·Utils·css 중 무엇이 바뀌어도 렌더된 페이지가 변경됨)
for (const c of categories) {
  for (const t of c.tools) {
    map[t.href] = lastCommit([`app${t.href}`])
  }
}

// 카테고리 인덱스 — 리스트 렌더러 + 그 카테고리 도구들 중 최근
for (const c of categories) {
  const toolDirs = c.tools.map((t) => `app${t.href}`)
  map[`/tools/${c.id}`] = lastCommit(['components/CategoryView.tsx', 'app/tools/[category]/page.tsx', ...toolDirs])
}

// 컬렉션 랜딩 — 데이터 소스 + 상세 템플릿
for (const col of COLLECTIONS) {
  map[`/collections/${col.slug}`] = lastCommit(['app/collections/[slug]/page.tsx', 'lib/collections.ts'])
}

// 키 정렬(안정적 diff)
const sorted: Record<string, string> = {}
for (const k of Object.keys(map).sort()) sorted[k] = map[k]

writeFileSync('app/sitemap-lastmod.json', JSON.stringify(sorted, null, 0) + '\n')
const dates = Object.values(sorted).sort()
console.log(`생성 ${Object.keys(sorted).length}개 · 최소 ${dates[0]} ~ 최대 ${dates[dates.length - 1]} · fallback ${FALLBACK}`)
