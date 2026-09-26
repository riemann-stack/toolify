/* lib/toolSignals.ts — '인기'·'NEW' 배지와 도구 공개일의 단일 소스 (UX-10: 인기 정의 5중화·배지 인플레 해소)

   · 인기(HOT) = app/popular-tools.json(GA4 최근 28일 조회 상위, scripts/gen-popular.mts가 주간 갱신) — 수기 라벨 아님
   · NEW       = 공개일(addedAt)이 NEW_BADGE_DAYS 이내. 공개일은 lib/siteDates.json(git 첫 커밋, scripts/gen-site-dates.mjs)
                 또는 Tool.addedAt(아직 커밋 전인 새 도구만). 날짜가 없으면 NEW를 붙이지 않는다(지어내지 않음)
   · Tool.badge(수기 라벨)는 읽지 않는다 → 105/200 NEW 인플레가 자동으로 사라지고, 60일이 지나면 저절로 만료

   서버 컴포넌트에서 쓰고, 클라이언트에는 계산된 결과(배지 맵·칩 목록)만 props로 넘긴다 — JSON 전체를 번들에 싣지 않기 위해. */
import popularJson from '@/app/popular-tools.json'
import siteDatesJson from './siteDates.json'
import { allTools, type Tool } from './tools'
import { todayStr } from './date'

/** NEW 배지 유지 기간(일) — 스펙 §10.19 '출시 60일 이내' */
export const NEW_BADGE_DAYS = 60
/** HOT 배지 = 인기 순위 상위 N (매니페스트가 GA 상위 10개를 담는다 ≈ 전체의 5%) */
export const HOT_BADGE_TOP = 10

export type ToolBadge = 'hot' | 'new'

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const KNOWN = new Set(allTools.map(t => t.href))

/* ── 인기 매니페스트 (JSON 검증 — 무검증 `as T` 금지) ───────────────────── */
export interface PopularData {
  /** 조회수 순 도구 href (현존 도구만, 중복 제거) */
  hrefs: string[]
  /** 집계일 'YYYY-MM-DD' */
  generated?: string
  /** 집계 기간(일) */
  days?: number
  /** 'ga4' 등 — GA 실측이 아니면 '조회 순' 표기를 하지 않는다 */
  source?: string
}

function parsePopular(raw: unknown): PopularData {
  if (!isObj(raw) || !Array.isArray(raw.hrefs)) return { hrefs: [] }
  const hrefs: string[] = []
  for (const h of raw.hrefs) if (typeof h === 'string' && KNOWN.has(h) && !hrefs.includes(h)) hrefs.push(h)
  return {
    hrefs,
    ...(typeof raw.generated === 'string' && DAY_RE.test(raw.generated) && { generated: raw.generated }),
    ...(typeof raw.days === 'number' && Number.isFinite(raw.days) && raw.days > 0 && { days: raw.days }),
    ...(typeof raw.source === 'string' && { source: raw.source }),
  }
}

export const POPULAR: PopularData = parsePopular(popularJson)

/** GA 실측 매니페스트인지 — '최근 28일 조회' 같은 표기는 이때만 */
export const POPULAR_IS_MEASURED = POPULAR.source === 'ga4' && POPULAR.hrefs.length > 0

/** 인기 순위 (1부터). 순위에 없으면 0 */
export function popularRank(href: string): number {
  return POPULAR.hrefs.indexOf(href) + 1
}

/* ── 날짜 사실 (git 기반 생성 JSON) ─────────────────────────────────── */
function parseDates(raw: unknown): { addedAt: Record<string, string>; legalUpdated?: string; goldenUpdated?: string } {
  const addedAt: Record<string, string> = {}
  if (!isObj(raw)) return { addedAt }
  if (isObj(raw.addedAt)) {
    for (const [href, d] of Object.entries(raw.addedAt)) if (typeof d === 'string' && DAY_RE.test(d)) addedAt[href] = d
  }
  const opt = (v: unknown) => (typeof v === 'string' && DAY_RE.test(v) ? v : undefined)
  return { addedAt, legalUpdated: opt(raw.legalUpdated), goldenUpdated: opt(raw.goldenUpdated) }
}

const DATES = parseDates(siteDatesJson)

/** 법정 수치 단일 소스(lib/kr*.ts)를 마지막으로 바꾼 커밋일 — 홈 '기준 숫자' 표기용. 없으면 undefined(표기 생략) */
export const LEGAL_UPDATED: string | undefined = DATES.legalUpdated
/** 법정 수치 골든 테스트(tests/golden)를 마지막으로 바꾼 커밋일 */
export const GOLDEN_UPDATED: string | undefined = DATES.goldenUpdated

/** 도구 공개일 'YYYY-MM-DD' — Tool.addedAt(수기, 커밋 전 새 도구) > siteDates.json(git 첫 커밋) */
export function toolAddedAt(t: Pick<Tool, 'href' | 'addedAt'>): string | undefined {
  if (t.addedAt && DAY_RE.test(t.addedAt)) return t.addedAt
  return DATES.addedAt[t.href]
}

/** 'YYYY-MM-DD' 두 날짜 사이 일수 (b - a). Date 문자열 파싱 없이 분해 → UTC 해석 버그 회피 */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

export function isNewTool(t: Pick<Tool, 'href' | 'addedAt'>, today: string = todayStr()): boolean {
  const d = toolAddedAt(t)
  if (!d) return false
  const age = daysBetween(d, today)
  return age >= 0 && age <= NEW_BADGE_DAYS
}

export function isHotTool(href: string): boolean {
  const r = popularRank(href)
  return r > 0 && r <= HOT_BADGE_TOP
}

/** 화면 배지 — 인기 우선. 수기 Tool.badge는 무시 */
export function toolBadge(t: Pick<Tool, 'href' | 'addedAt'>, today: string = todayStr()): ToolBadge | undefined {
  if (isHotTool(t.href)) return 'hot'
  if (isNewTool(t, today)) return 'new'
  return undefined
}

/** 배지가 붙는 도구만 모은 맵 — 클라이언트 컴포넌트에 props로 넘길 때 */
export function badgeMap(tools: readonly Tool[] = allTools, today: string = todayStr()): Record<string, ToolBadge> {
  const out: Record<string, ToolBadge> = {}
  for (const t of tools) {
    const b = toolBadge(t, today)
    if (b) out[t.href] = b
  }
  return out
}

/** 최근 공개된 도구 (공개일 내림차순) — 홈 '업데이트 기록'용 */
export function recentlyAdded(limit: number): { tool: Tool; date: string }[] {
  return allTools
    .map(tool => ({ tool, date: toolAddedAt(tool) }))
    .filter((x): x is { tool: Tool; date: string } => !!x.date)
    .sort((a, b) => b.date.localeCompare(a.date) || a.tool.name.localeCompare(b.tool.name, 'ko'))
    .slice(0, limit)
}
