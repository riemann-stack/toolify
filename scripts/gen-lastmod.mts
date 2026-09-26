/* sitemap lastmod 매니페스트 생성 — 각 페이지가 '실제로 마지막 변경된 날'을 git 커밋 이력에서 산출.
   로컬에서 실행(전체 git 이력 필요 — shallow clone이면 부정확) → app/sitemap-lastmod.json 커밋.
   sitemap.ts가 이 JSON을 읽어 lastmod로 사용. Vercel 빌드는 git 없이 커밋된 JSON만 읽으므로 빌드의 git 의존성 없음.
   실행 시점: 콘텐츠 변경을 '커밋한 뒤' `npm run gen:lastmod` → JSON 변경분 커밋 (git log는 커밋된 이력만 본다).
   날짜 = git committer date(%cs, YYYY-MM-DD) — 지어낸 값 없음, 순수 이력 기반.

   ── 기계적 커밋 제외 (lastmod 리셋 방지) ──
   토큰·색·헤더 코드모드, 포맷팅, 광고 설정처럼 '표현만 바뀌고 콘텐츠는 그대로'인 전역 커밋이 lastmod를
   일괄로 같은 날짜로 리셋하면 Google이 lastmod를 불신한다. 다음 커밋은 건너뛰고 그 이전의 가장 최근 커밋일을 쓴다.
     1) 커밋 제목(subject)에 `[skip-lastmod]`가 들어간 커밋 — 커밋할 때 붙이는 방식(권장)
     2) 저장소 루트 `.lastmod-ignore`에 해시가 등록된 커밋 — 이미 만들어진 커밋을 사후 등록
        (한 줄에 해시 하나, 7자 이상 약식 해시 허용, `#` 이후는 주석 — git blame-ignore-revs와 같은 방식)
   경로를 건드린 커밋이 전부 제외 대상이면 그중 가장 최근 커밋일을 쓴다(이력이 있는데 날짜를 비울 수는 없음).
   아직 커밋된 적 없는 경로(새 도구 추가 직후)는 오늘 날짜(로컬 기준).

   `--dry`: 파일을 쓰지 않고 기존 JSON 대비 바뀔 항목만 출력 (재생성 전 점검용). */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categories } from '../lib/tools'
import { COLLECTIONS } from '../lib/collections'
import { todayStr } from '../lib/date'

// 어디서 실행하든 저장소 루트 기준으로 동작
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)

const DRY = process.argv.includes('--dry')
const OUT_FILE = 'app/sitemap-lastmod.json'
const SKIP_MARKER = '[skip-lastmod]'
const IGNORE_FILE = '.lastmod-ignore'
const TODAY = todayStr()

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

/** .lastmod-ignore 파싱 — 해시(7~40자 16진)만 채택, 나머지 줄은 경고 후 무시 */
function loadIgnoredHashes(): string[] {
  if (!existsSync(IGNORE_FILE)) return []
  const out: string[] = []
  readFileSync(IGNORE_FILE, 'utf8').split(/\r?\n/).forEach((line, i) => {
    const v = line.replace(/#.*$/, '').trim().toLowerCase()
    if (!v) return
    if (/^[0-9a-f]{7,40}$/.test(v)) out.push(v)
    else console.warn(`[gen-lastmod] ${IGNORE_FILE}:${i + 1} 해시 형식 아님 — 무시: ${line.trim()}`)
  })
  return out
}

const IGNORED = loadIgnoredHashes()
const isIgnoredHash = (hash: string) => IGNORED.some((h) => hash.startsWith(h))

interface CommitRow { hash: string; date: string; subject: string }

/** 경로 집합을 건드린 커밋 목록(최신순). 한 번의 git log로 조회 — 경로별 최신일의 최댓값과 동일한 의미. */
function commitsTouching(paths: string[]): CommitRow[] {
  let raw = ''
  try {
    // %x1f(단위 구분자)로 필드 분리 — 제목에 탭·공백이 있어도 안전
    raw = git(['log', '--format=%H%x1f%cs%x1f%s', '--', ...paths])
  } catch {
    return [] // 미추적 경로 등
  }
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash = '', date = '', subject = ''] = line.split('\x1f')
      return { hash: hash.toLowerCase(), date, subject }
    })
}

let skippedHits = 0

/** 주어진 파일/디렉터리들을 마지막으로 '실질 변경'한 커밋일(YYYY-MM-DD) */
function lastCommit(paths: string[]): string {
  const rows = commitsTouching(paths)
  if (rows.length === 0) return TODAY // 한 번도 커밋되지 않은 새 경로
  const real = rows.find((r) => !r.subject.includes(SKIP_MARKER) && !isIgnoredHash(r.hash))
  if (real && real !== rows[0]) skippedHits++
  return (real ?? rows[0]).date
}

const map: Record<string, string> = {}

// 정적 페이지 — 각 페이지의 실제 소스 파일
// 홈: 인기 도구 순위(app/popular-tools.json)는 의도적으로 제외 — 주간 GA4 봇 커밋이 매주 홈 lastmod를
//   갱신하면 '순위 재정렬'을 콘텐츠 변경으로 신고하는 셈이라 lastmod 신뢰도를 떨어뜨린다.
//   (이중 안전장치: refresh-popular.yml 봇 커밋 제목에도 [skip-lastmod]가 붙는다.)
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

if (DRY) {
  let prev: Record<string, string> = {}
  try {
    const parsed: unknown = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) prev = parsed as Record<string, string>
  } catch { /* 없음 */ }
  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(sorted)])).sort()
  const changes = keys.filter((k) => prev[k] !== sorted[k])
  for (const k of changes) console.log(`  ${k}: ${prev[k] ?? '(없음)'} → ${sorted[k] ?? '(삭제)'}`)
  console.log(`[dry] 변경 ${changes.length}건 — 파일은 쓰지 않음`)
} else {
  writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 0) + '\n')
}
const dates = Object.values(sorted).sort()
console.log(
  `${DRY ? '[dry] ' : ''}생성 ${Object.keys(sorted).length}개 · 최소 ${dates[0]} ~ 최대 ${dates[dates.length - 1]}` +
    ` · 기계적 커밋 건너뜀 ${skippedHits}경로 (ignore ${IGNORED.length}개 + '${SKIP_MARKER}' 제목) · 미커밋 경로 날짜 ${TODAY}`,
)
