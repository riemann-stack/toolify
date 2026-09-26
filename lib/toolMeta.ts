/* lib/toolMeta.ts — 도구별 신뢰 메타(기준 점검일·최종 업데이트·기준·출처·검산·변경 기록) 단일 소스 (스펙 §10.2·10.7·10.8·10.22)
   바이라인(ToolHeader·ToolPage)·레일 기준 카드·참고 자료·AboutTool·JSON-LD가 모두 이 값을 읽는다 → 화면과 구조화 데이터가 어긋나지 않는다.

   데이터: lib/toolMeta.data.json — `node scripts/build-tool-meta.mjs --write`로만 생성한다(날짜를 손으로 쓰지 않는다).
   ── 정직성 규칙 (스펙 §13 Phase 2의 'sitemap-lastmod = reviewed'를 대체) ──
   · reviewed  = 사람이 적은 점검일만. 페이지의 <UpdatedMeta date="2026년 7월">에서 가져온다('2026-07'). 없으면 비운다.
   · updated   = 도구 page.tsx·*Utils.ts를 건드린 마지막 커밋일(YYYY-MM-DD). 제목에 [skip-lastmod]가 있거나
                 .lastmod-ignore에 등록된 기계적 커밋은 제외. 화면 표기는 반드시 '최종 업데이트'(검수·검산 아님).
   · verified  = tests/golden 골든 테스트가 실제로 통과한 도구만(스크립트가 node --test로 실행해 케이스 수를 센다).
                 범위가 일부면 full=false → '○○ 검산'처럼 범위를 붙여 표기한다.
   · 작성자    = AUTHOR(필명 '리만', 1인 운영) — '편집팀' 표기 금지. SiteJsonLd의 SITE_OPERATOR와 같은 객체.

   ⚠ 서버 컴포넌트 전용 — JSON 전체(~80KB)가 번들에 들어가므로 'use client' 파일에서 import하지 말 것.
     `import 'server-only'`가 이를 빌드 오류로 막는다(Next가 내장 별칭으로 해석 — 패키지 설치 불필요, Next 16 Turbopack 빌드로 확인). */
import 'server-only'
import data from './toolMeta.data.json'
import { SITE_OPERATOR, ORGANIZATION_ID } from '@/components/SiteJsonLd'
import { allTools } from './tools'

export interface ToolSource {
  label: string   // '근로소득 간이세액표 (소득세법 시행령 별표 2)'
  org?: string    // '국세청 홈택스 · 2026년 적용분' — 비어 있으면 화면에서 도메인을 대신 보여 준다
  href: string
}
export interface ToolChange { date: string; text: string } // date: 'YYYY-MM-DD'

export interface ToolVerified {
  cases: number      // 통과한 골든 테스트 케이스 수 (build-tool-meta가 node --test TAP 출력에서 실측)
  scope: string      // 검산 범위 '4대보험·근로소득세 공제 후 실수령액'
  full: boolean      // 도구의 핵심 계산 전체를 덮으면 true. false면 '<scope> 검산'으로 범위를 붙여 표기
  tests: string[]    // 'tests/golden/salaryInsurance.test.mts'
  date?: string      // 테스트 파일 마지막 커밋일. 아직 커밋 전이면 없음(지어내지 않는다)
}

export interface ToolMeta {
  slug: string                 // '/tools/finance/salary'
  reviewed?: string            // 사람이 적은 기준 점검일 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD' (UpdatedMeta date)
  updated?: string             // 'YYYY-MM-DD' git 최종 업데이트
  basis: string                // 적용 기준 한 줄 — 없으면 ''
  sources: ToolSource[]        // 번호 각주 [1]..[n] 순서 = 배열 순서
  verified?: ToolVerified
  method?: string              // (사람 입력) AboutTool '계산 기준' 서술
  group?: string               // (사람 입력) 허브 하위 분류 '급여·보험'
  iconName?: string            // (사람 입력) UiIcon 이름. 없으면 분야 아이콘
  changelog?: ToolChange[]     // 최신순 — *Utils.ts 커밋(일괄 커밋 제외)
  example?: { label: string; value: string; unit: string; caption: string } // (사람 입력) 허브 대표 예시
  ymyl?: boolean               // 금융·건강 → AboutTool 4행
  hasResult?: boolean          // 도구 코드에 role="status"/data-result-label/ResultHero가 있음 → 레일 미니 결과 렌더
}

/** 운영자 = 작성자. app/about·app/contact·푸터·Organization JSON-LD와 같은 객체(1인 운영, 필명). */
export const AUTHOR = SITE_OPERATOR
export { ORGANIZATION_ID }

/* ── JSON 로드 검증 (CLAUDE.md: 무검증 `as T` 금지) — 모듈 로드 시 1회 ─────────────── */
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/
const isStr = (v: unknown): v is string => typeof v === 'string'
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const optDate = (v: unknown) => (isStr(v) && DATE_RE.test(v) ? v : undefined)
const optStr = (v: unknown) => (isStr(v) && v.trim() ? v : undefined)

function parseSources(v: unknown): ToolSource[] {
  if (!Array.isArray(v)) return []
  const out: ToolSource[] = []
  for (const s of v) {
    if (!isObj(s) || !isStr(s.label) || !isStr(s.href) || !/^https?:\/\//.test(s.href)) continue
    out.push({ label: s.label, href: s.href, ...(optStr(s.org) && { org: s.org as string }) })
  }
  return out
}

function parseVerified(v: unknown): ToolVerified | undefined {
  if (!isObj(v) || typeof v.cases !== 'number' || !(v.cases > 0) || !isStr(v.scope) || typeof v.full !== 'boolean') return undefined
  const tests = Array.isArray(v.tests) ? v.tests.filter(isStr) : []
  if (tests.length === 0) return undefined // 테스트 파일 근거 없는 '검산'은 받지 않는다
  return { cases: v.cases, scope: v.scope, full: v.full, tests, ...(optDate(v.date) && { date: v.date as string }) }
}

function parseMeta(slug: string, raw: unknown): ToolMeta | undefined {
  if (!isObj(raw) || raw.slug !== slug) return undefined
  const changelog = Array.isArray(raw.changelog)
    ? raw.changelog.filter((c): c is ToolChange => isObj(c) && isStr(c.date) && DATE_RE.test(c.date) && isStr(c.text) && c.text.trim() !== '')
    : []
  const ex = raw.example
  const example = isObj(ex) && isStr(ex.label) && isStr(ex.value) && isStr(ex.unit) && isStr(ex.caption)
    ? { label: ex.label, value: ex.value, unit: ex.unit, caption: ex.caption } : undefined
  const verified = parseVerified(raw.verified)
  return {
    slug,
    reviewed: optDate(raw.reviewed),
    updated: optDate(raw.updated),
    basis: isStr(raw.basis) ? raw.basis : '',
    sources: parseSources(raw.sources),
    ...(verified && { verified }),
    ...(optStr(raw.method) && { method: raw.method as string }),
    ...(optStr(raw.group) && { group: raw.group as string }),
    ...(optStr(raw.iconName) && { iconName: raw.iconName as string }),
    ...(changelog.length > 0 && { changelog }),
    ...(example && { example }),
    ymyl: raw.ymyl === true,
    hasResult: raw.hasResult === true,
  }
}

const META = new Map<string, ToolMeta>()
{
  const root: unknown = data
  if (isObj(root)) {
    for (const [slug, raw] of Object.entries(root)) {
      if (!slug.startsWith('/tools/')) continue
      const m = parseMeta(slug, raw)
      if (m) META.set(slug, m)
    }
  }
}

export function getToolMeta(slug: string): ToolMeta | undefined {
  return META.get(slug.replace(/\/+$/, ''))
}

/** '/tools/finance/salary' → 'finance' */
export function catOf(slug: string): string {
  return slug.split('/')[2] ?? ''
}

/** '2026-07-14' → '2026.07.14' · '2026-07' → '2026.07' · '2026' → '2026' (Date 파싱 없이 문자열만 — UTC 해석 버그 회피) */
export function dotDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '.')
}

/** 바이라인 날짜 한 줄 — 사람이 적은 점검일이 있으면 그것, 없으면 git 최종 업데이트. 둘 다 없으면 null(지어내지 않음) */
export function metaDate(m: ToolMeta): { kind: 'reviewed' | 'updated'; iso: string; text: string } | null {
  if (m.reviewed) return { kind: 'reviewed', iso: m.reviewed, text: `${dotDate(m.reviewed)} 기준 점검` }
  if (m.updated) return { kind: 'updated', iso: m.updated, text: `최종 업데이트 ${dotDate(m.updated)}` }
  return null
}

/** 검산 표기 — 전체면 '검산', 일부면 '<범위> 검산' */
export function verifiedLabel(v: ToolVerified): string {
  return v.full ? '검산' : `${v.scope} 검산`
}

/** 출처 표시용 기관명 — org가 비어 있으면 도메인 */
export function sourceOrg(s: ToolSource): string {
  if (s.org) return s.org
  try { return new URL(s.href).hostname.replace(/^www\./, '') } catch { return '' }
}

/* ── JSON-LD (스펙 §10.22) — 보이는 바이라인과 같은 소스 ─────────────────────────────
   <ToolPage>(서버)가 렌더한다. AutoToolJsonLd(레이아웃, 클라이언트 — 이 JSON을 번들에 넣을 수 없음)의
   WebApplication 노드와 같은 @id를 쓰지만, 서로 다른 <script> 블록의 @id 병합에 기대지 않는다 —
   이 노드만으로도 유효한 SoftwareApplication 항목이 되도록 AutoToolJsonLd와 같은 필수·권장 값
   (name·applicationCategory·operatingSystem·offers)을 함께 넣는다. 값은 AutoToolJsonLd와 반드시 같게(APP_BASE).
   dateModified = 본문 시트 바이라인의 '최종 업데이트'(git)와 같은 값. 평점(aggregateRating)·리뷰는 넣지 않는다. */
const SITE = 'https://youtil.kr'
/** AutoToolJsonLd의 WebApplication 노드와 같은 값 — 한쪽을 바꾸면 다른 쪽도 바꾼다 */
const APP_BASE = {
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  inLanguage: 'ko-KR',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
} as const

export function toolAppId(slug: string): string {
  return `${SITE}${slug}#app`
}

export function toolLdExtras(slug: string): Record<string, unknown> | null {
  const m = getToolMeta(slug)
  if (!m) return null
  const t = allTools.find(x => x.href === m.slug)
  if (!t) return null // 이름 없는 SoftwareApplication 노드는 무효 — 레지스트리에 없는 경로면 내지 않는다
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': toolAppId(slug),
    name: t.name,
    description: t.desc,
    url: `${SITE}${m.slug}`,
    ...APP_BASE,
    author: { '@type': 'Person', name: AUTHOR.name, url: `${SITE}${AUTHOR.url}`, jobTitle: AUTHOR.role },
    publisher: { '@id': ORGANIZATION_ID },
    ...(m.updated && { dateModified: m.updated }),
    ...(m.sources.length > 0 && {
      citation: m.sources.map(s => ({ '@type': 'CreativeWork', name: s.label, url: s.href, ...(sourceOrg(s) && { publisher: { '@type': 'Organization', name: sourceOrg(s) } }) })),
    }),
  }
}
