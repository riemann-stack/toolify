/* 검색 회귀 테스트 — lib/search.ts searchTools() 품질 고정 (ux UX-02).
   실행: npx tsx scripts/search-regression.mts [--verbose] [--impl <search 모듈 경로>]
     --verbose : 질의별 상위 5개와 점수 출력
     --impl    : 다른 구현(예: 변경 전 스냅샷)으로 같은 케이스를 돌려 전후 비교
   tests/search.test.mts 가 같은 CASES를 node:test로 돌린다 — 케이스 추가는 여기에만.

   [통폐합 내성] 기대값은 "통폐합 후" 대상(target) href로 적는다. 소스 도구가 아직
   lib/tools.ts에 남아 있으면 그 소스도 정답으로 인정하고, 소스가 삭제되면 target만 인정한다.
   → 병합 전·후 어느 시점에 돌려도 통과. 아직 없는 미래 도구 href(예: acquisition-tax)는
   존재할 때만 정답 후보가 된다. */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { allTools } from '../lib/tools'
import { searchTools as defaultSearch } from '../lib/search'

/** 결정된 포트폴리오 병합: source → target (소스는 곧 레지스트리에서 삭제) */
export const MERGED_INTO: Record<string, string> = {
  '/tools/sports/race-plan': '/tools/sports/pace',
  '/tools/sports/lsd': '/tools/sports/interval-training',
  '/tools/sports/football-points': '/tools/sports/league-scenarios',
  '/tools/interior/bolt-wrench': '/tools/interior/screw',
  '/tools/cooking/cake-pan': '/tools/cooking/baking-recipe',
  '/tools/art/bpm': '/tools/art/tap-tempo',
  '/tools/dev/yaml-json': '/tools/dev/json',
  '/tools/date/life-time': '/tools/date/age',
  '/tools/edu/sci-units': '/tools/edu/sig-figs',
  '/tools/finance/stock-decision': '/tools/finance/stock',
}

export interface SearchCase {
  q: string
  /** 1위가 이 중 하나 */
  top1?: string[]
  /** 상위 3개에 이 중 하나 이상 */
  top3?: string[]
  /** 상위 3개에 모두 포함 */
  top3All?: string[]
  /** 1위 도구 href 접두 (예: '/tools/finance/') */
  top1Prefix?: string
  /** 상위 8개(UI 기본 limit)에 없어야 함 — 오탐 방지 */
  absent?: string[]
  note?: string
}

const F = '/tools/finance/'
export const CASES: SearchCase[] = [
  // ── 자연어 질의: "~계산기/~계산" 접미사·붙여쓰기 ──
  { q: '퇴직금 계산', top1: [F + 'severance'] },
  { q: '퇴직금', top1: [F + 'severance'] },
  { q: '연봉계산기', top1: [F + 'salary'] },
  { q: '연봉 계산기', top1: [F + 'salary'] },
  { q: '세금 계산기', top1Prefix: F, top3: [F + 'salary', F + 'year-end-tax', F + 'freelance-tax'] },
  { q: '월급 세금', top1: [F + 'salary'] },
  { q: '대출 계산기', top1: [F + 'loan'] },
  { q: '대출이자', top1: [F + 'loan'] },
  { q: '4대보험 계산', top1: [F + '4-insurance'] },
  { q: '연말정산', top1: [F + 'year-end-tax'] },
  { q: '실업급여 계산기', top1: [F + 'unemployment-benefit'] },
  { q: '주휴수당', top1: [F + 'hourly-pay', F + '4-insurance'], note: '알바 급여 도구 신설 전까지 4대보험(알바 모드)' },

  // ── 세금 별칭 교정: 양도세·취득세가 자동차세로 가지 않게 ──
  { q: '양도세', top1: [F + 'capital-gains-tax'], absent: [F + 'car-tax'] },
  { q: '양도세 계산기', top1: [F + 'capital-gains-tax'], absent: [F + 'car-tax'] },
  { q: '양도소득세', top1: [F + 'capital-gains-tax'] },
  { q: '취득세', top1: [F + 'acquisition-tax', F + 'auction', F + 'real-estate'] },
  { q: '부동산 취득세', top1: [F + 'acquisition-tax', F + 'auction', F + 'real-estate'] },
  { q: '자동차 취득세', top1: [F + 'car-tax'] },
  { q: '자동차세', top1: [F + 'car-tax'] },
  { q: '적금', top1: [F + 'deposit-savings', F + 'compound'] },
  { q: '적금 이자', top1: [F + 'deposit-savings', F + 'compound'] },

  // ── 짧은 별칭 오탐 방지 ──
  { q: '나이', top1: ['/tools/date/age'], absent: ['/tools/unit/hardness'] },
  { q: '만나이 계산기', top1: ['/tools/date/age'] },
  { q: '술', top3All: ['/tools/life/alcohol', '/tools/health/blood-alcohol'], absent: ['/tools/dev/tech-stack'] },
  { q: '퍼센트', top1: ['/tools/life/percent', '/tools/cooking/baker-percent'], absent: ['/tools/dev/url-encode'] },
  { q: '볼트', top1: ['/tools/interior/screw'], absent: ['/tools/edu/sig-figs', '/tools/edu/sci-units'] },

  // ── 대표 도구 ──
  { q: '평수', top1: ['/tools/unit/area'], top3: ['/tools/interior/room-area'] },
  { q: '평수 계산', top1: ['/tools/unit/area'] },
  { q: 'bmi', top1: ['/tools/health/bmi'] },
  { q: 'BMI 계산기', top1: ['/tools/health/bmi'] },
  { q: '전역일', top1: ['/tools/date/military'] },
  { q: '음력', top1: ['/tools/date/lunar'] },
  { q: '음력 변환', top1: ['/tools/date/lunar'] },
  { q: '글자수', top1: ['/tools/art/charcount'] },
  { q: '글자수 세기', top1: ['/tools/art/charcount'] },
  { q: '라면', top1: ['/tools/cooking/ramen'] },
  { q: '카포', top1: ['/tools/art/capo'] },
  { q: '나사', top1: ['/tools/interior/screw'] },
  { q: '디데이', top1: ['/tools/date/dday'] },
  { q: 'dday', top1: ['/tools/date/dday'] },
  { q: '러닝 페이스', top1: ['/tools/sports/pace'] },
  { q: '청약', top3All: [F + 'housing-score', F + 'ipo-deposit'] },
  { q: 'json', top1: ['/tools/dev/json'] },

  // ── 초성 ──
  { q: 'ㅇㅂ', top1: [F + 'salary'] },
  { q: 'ㅌㅈㄱ', top1: [F + 'severance'] },
  { q: 'ㄴㅇ', top1: ['/tools/date/age'] },

  // ── 통폐합 후 대상으로 흡수된 키워드 ──
  { q: '딜레이', top1: ['/tools/art/tap-tempo'] },
  { q: 'bpm', top1: ['/tools/art/tap-tempo'] },
  { q: 'yaml', top1: ['/tools/dev/json'] },
  { q: '케이크 호수', top1: ['/tools/cooking/baking-recipe'] },
  { q: '기대수명', top1: ['/tools/date/age'] },
  { q: '승점', top1: ['/tools/sports/league-scenarios'] },
  { q: 'lsd', top1: ['/tools/sports/interval-training'] },
  { q: '네거티브 스플릿', top1: ['/tools/sports/pace'] },
  { q: '팔까 살까', top1: [F + 'stock'] },
  { q: '과학적 표기', top1: ['/tools/edu/sig-figs'] },
  { q: '스패너', top1: ['/tools/interior/screw'] },
]

export interface CaseResult {
  c: SearchCase
  pass: boolean
  failures: string[]
  got: { href: string; score: number }[]
}

type SearchFn = (q: string, limit?: number) => { tool: { href: string }; score: number }[]

const EXISTING = new Set(allTools.map(t => t.href))

/** 기대 href 목록 → 지금 레지스트리 기준 정답 집합 (존재하는 target + 아직 남은 병합 소스) */
export function acceptedHrefs(hrefs: string[]): Set<string> {
  const out = new Set<string>()
  for (const h of hrefs) {
    if (EXISTING.has(h)) out.add(h)
    for (const [src, dst] of Object.entries(MERGED_INTO)) {
      if (dst === h && EXISTING.has(src)) out.add(src)
    }
  }
  return out
}

export function evaluateCase(c: SearchCase, search: SearchFn = defaultSearch): CaseResult {
  const hits = search(c.q, 8)
  const got = hits.map(h => ({ href: h.tool.href, score: h.score }))
  const hrefs = got.map(g => g.href)
  const top3 = hrefs.slice(0, 3)
  const failures: string[] = []

  if (c.top1) {
    const ok = acceptedHrefs(c.top1)
    if (ok.size === 0) failures.push(`top1 기대 도구가 레지스트리에 없음: ${c.top1.join(', ')}`)
    else if (!hrefs[0] || !ok.has(hrefs[0])) failures.push(`1위 ${hrefs[0] ?? '(없음)'} ∉ {${[...ok].join(', ')}}`)
  }
  if (c.top3) {
    const ok = acceptedHrefs(c.top3)
    if (ok.size === 0) failures.push(`top3 기대 도구가 레지스트리에 없음: ${c.top3.join(', ')}`)
    else if (!top3.some(h => ok.has(h))) failures.push(`상위 3에 {${[...ok].join(', ')}} 중 하나도 없음`)
  }
  if (c.top3All) {
    for (const h of c.top3All) {
      const ok = acceptedHrefs([h])
      if (ok.size === 0) failures.push(`top3All 기대 도구가 레지스트리에 없음: ${h}`)
      else if (!top3.some(x => ok.has(x))) failures.push(`상위 3에 ${h} 없음`)
    }
  }
  if (c.top1Prefix && !(hrefs[0] ?? '').startsWith(c.top1Prefix)) {
    failures.push(`1위 ${hrefs[0] ?? '(없음)'} 가 ${c.top1Prefix} 아님`)
  }
  if (c.absent) {
    for (const h of c.absent) if (hrefs.includes(h)) failures.push(`오탐: ${h} 가 상위 8에 등장 (${hrefs.indexOf(h) + 1}위)`)
  }
  return { c, pass: failures.length === 0, failures, got }
}

export function runAll(search: SearchFn = defaultSearch): CaseResult[] {
  return CASES.map(c => evaluateCase(c, search))
}

// ── CLI ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose')
  const implIdx = args.indexOf('--impl')
  let search: SearchFn = defaultSearch
  let label = 'lib/search.ts'
  if (implIdx >= 0 && args[implIdx + 1]) {
    const p = resolve(args[implIdx + 1])
    const mod = (await import(pathToFileURL(p).href)) as { searchTools?: SearchFn }
    if (typeof mod.searchTools !== 'function') throw new Error(`${p}: searchTools export 없음`)
    search = mod.searchTools
    label = p
  }
  const short = (h: string) => h.replace('/tools/', '')
  const results = runAll(search)
  for (const r of results) {
    const mark = r.pass ? 'PASS' : 'FAIL'
    const top = r.got.slice(0, verbose ? 5 : 3).map(g => `${short(g.href)}(${Math.round(g.score)})`).join(' | ') || '0건'
    console.log(`${mark}  ${r.c.q.padEnd(12)} → ${top}`)
    for (const f of r.failures) console.log(`        · ${f}`)
  }
  const pass = results.filter(r => r.pass).length
  console.log(`\n[${label}] ${pass}/${results.length} 통과`)
  if (pass !== results.length) process.exitCode = 1
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (invokedDirectly) void main()
