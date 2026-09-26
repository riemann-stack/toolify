/* 검색 회귀 테스트 — lib/search.ts searchTools() 품질 고정 (ux UX-02).
   실행: npx tsx scripts/search-regression.mts [--verbose] [--impl <search 모듈 경로>]
     --verbose : 질의별 상위 5개와 점수 출력
     --impl    : 다른 구현(예: 변경 전 스냅샷)으로 같은 케이스를 돌려 전후 비교
   tests/search.test.mts 가 같은 CASES를 node:test로 돌린다 — 케이스 추가는 여기에만.

   [통폐합 내성] 기대값은 "통폐합 후" 대상(target) href로 적는다. 소스 도구가 아직
   lib/tools.ts에 남아 있으면 그 소스도 정답으로 인정하고, 소스가 삭제되면 target만 인정한다.
   반대로 기대값이 병합 소스(예: 병합 전까지 기능이 소스에만 있는 sci-units)면 소스가 있을 땐
   소스만, 삭제된 뒤엔 target을 정답으로 본다.
   → 병합 전·후 어느 시점에 돌려도 통과.
   [신설 예정 도구] 아직 없는 미래 도구 href(예: acquisition-tax)는 존재할 때만 정답 후보가 된다.
   future에 적은 href가 하나라도 레지스트리에 생기면 1위는 반드시 그중 하나여야 한다
   (도구를 만들고 별칭을 안 옮기면 실패 → 기존 도구가 계속 1위를 가져가는 것 방지). */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { allTools } from '../lib/tools'
import { searchTools as defaultSearch } from '../lib/search'

/** 포트폴리오 통합(2026-09-26 반영): source → target. 소스는 레지스트리에서 삭제됐고 next.config.ts가 301로 보낸다
 *  (tests/redirects.test.mts가 이 맵과 301 목적지가 일치하는지 검사). 옛 기대값이 소스를 적어도 target을 정답으로 본다. */
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
  /** 상위 within개(기본 8 = UI 기본 limit)에 모두 있어야 함 — 재현율(복합어 별칭 등) */
  present?: string[]
  /** present 검사 범위 (기본 8. 모바일 Nav는 20) */
  within?: number
  /** 신설 예정 도구 href — 하나라도 레지스트리에 생기면 1위가 그중 하나여야 함 */
  future?: string[]
  /** true면 top1에 병합 소스를 정답으로 인정하지 않는다 — 별칭이 아니라 채점 로직을 고정하는 케이스용 */
  strict?: boolean
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
  { q: '주휴수당', top1: [F + 'hourly-pay', F + 'part-time-pay', F + '4-insurance'], future: [F + 'hourly-pay', F + 'part-time-pay'], note: '알바 급여 도구 신설 전까지 4대보험(알바 모드)' },
  { q: '알바', top1: [F + 'hourly-pay', F + 'part-time-pay', F + '4-insurance'], future: [F + 'hourly-pay', F + 'part-time-pay'] },
  { q: '건강보험료', top1: [F + '4-insurance'] },
  { q: '퇴사일', top1: [F + 'severance'] },

  // ── 선택(수치) 토큰: 평균에 넣지 않고, 못 맞춘 도구만 감점 ──
  { q: '5km 페이스', top1: ['/tools/sports/pace'], strict: true, note: '5km를 desc에서 맞춘 pace가 평균 하락으로 밀리던 버그' },
  { q: '10km 페이스', top1: ['/tools/sports/pace'], strict: true },
  { q: '연봉 3000', top1: [F + 'salary'] },
  { q: '3.3% 세금', top1: [F + 'freelance-tax'], top3: [F + 'salary'] },

  // ── 타이핑 중(공백 없이 접미사를 치다 만 상태) ──
  { q: '연봉계', top1: [F + 'salary'] },
  { q: '연봉계ㅅ', top1: [F + 'salary'] },
  { q: '퇴직금계사', top1: [F + 'severance'] },
  { q: '퇴직금 계사', top1: [F + 'severance'] },
  { q: '양도세ㄱ', top1: [F + 'capital-gains-tax'], absent: [F + 'car-tax'] },
  { q: '평수계', top1: ['/tools/unit/area'] },
  // 실제 단어를 치는 중인 입력은 끝을 접미사 조각으로 자르지 않는다 (리뷰 회귀)
  { q: '음주측', top1: ['/tools/health/blood-alcohol'] },
  { q: '월세공', top1: [F + 'year-end-tax'] },
  { q: '대체공', top1: ['/tools/date/holiday-bridge'] },
  { q: '페르미추', top1: ['/tools/edu/fermi-estimate'] },
  { q: '연봉 계산ㄱ', top1: [F + 'salary'] },
  { q: '부동산 공시', top1: [F + 'property-holding-tax'], note: "'공시'는 '공식'을 치다 만 조각이 아니라 실제 단어(공시가격) — 필수 토큰 유지" },

  // ── 세금 별칭 교정: 양도세·취득세가 자동차세로 가지 않게 ──
  { q: '양도세', top1: [F + 'capital-gains-tax'], absent: [F + 'car-tax'] },
  { q: '양도세 계산기', top1: [F + 'capital-gains-tax'], absent: [F + 'car-tax'] },
  { q: '양도소득세', top1: [F + 'capital-gains-tax'] },
  { q: '취득세', top1: [F + 'acquisition-tax', F + 'auction', F + 'real-estate'], future: [F + 'acquisition-tax'] },
  { q: '부동산 취득세', top1: [F + 'acquisition-tax', F + 'auction', F + 'real-estate'], future: [F + 'acquisition-tax'] },
  { q: '자동차 취득세', top1: [F + 'car-tax'] },
  { q: '자동차세', top1: [F + 'car-tax'] },
  { q: '적금', top1: [F + 'deposit-savings', F + 'compound'], future: [F + 'deposit-savings'] },
  { q: '적금 이자', top1: [F + 'deposit-savings', F + 'compound'], future: [F + 'deposit-savings'] },

  // ── 짧은 별칭 오탐 방지 ──
  { q: '나이', top1: ['/tools/date/age'], absent: ['/tools/unit/hardness'] },
  { q: '만나이 계산기', top1: ['/tools/date/age'] },
  { q: '술', top3All: ['/tools/life/alcohol', '/tools/health/blood-alcohol'], note: "'술'↛'기술' 부분일치는 tests/search.test.mts 합성 데이터로 고정 (dev/tech-stack 폐지)" },
  { q: '퍼센트', top1: ['/tools/life/percent', '/tools/cooking/baker-percent'], future: ['/tools/life/percent'], absent: ['/tools/dev/url-encode'] },
  { q: '볼트', top1: ['/tools/interior/screw'], absent: ['/tools/edu/sig-figs'] },

  // ── 복합어 별칭: 완결 단어 + 또 하나의 단어 ("연금" → 연금저축) — 낮은 점수라도 결과에 나와야 ──
  { q: '연금', top3: [F + 'national-pension'], present: [F + 'savings'] },
  { q: '연금저축', top1: [F + 'savings'] },
  { q: '이자', top1: [F + 'loan'], present: [F + 'compound'] },
  { q: '마라톤', top1: ['/tools/sports/race-predictor'], present: ['/tools/sports/pace'] },
  { q: '주담대', top1: [F + 'loan'], present: [F + 'dsr'] },
  { q: '용량', present: ['/tools/life/unit-price'] },
  { q: '단위', top1: ['/tools/unit/converter'], present: ['/tools/life/unit-price'] },
  { q: '한국', present: ['/tools/date/server-time'] },
  { q: '시간', present: ['/tools/life/pomodoro'], within: 20, note: "'시간'은 이름 일치 도구가 많아 모바일 Nav 범위(20)로 확인" },
  { q: '비용', present: ['/tools/life/dutch'] },

  // ── 과학 단위: eV는 단위 변환기, 천문·원자 스케일은 sig-figs [과학적 표기] 탭(구 sci-units) ──
  { q: 'eV', top1: ['/tools/unit/converter'] },
  { q: '전자볼트', top1: ['/tools/unit/converter'] },
  { q: '광년', top1: ['/tools/edu/sig-figs'] },
  { q: '옹스트롬', top1: ['/tools/edu/sig-figs'] },
  { q: '파섹', top1: ['/tools/edu/sig-figs'] },
  { q: '천문단위', top1: ['/tools/edu/sig-figs'] },

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
  // 2026-09-26 통합 때 옮기거나 더한 별칭 (소스 도구 이름·기능어)
  { q: '레이스 플래너', top1: ['/tools/sports/pace'], strict: true },
  { q: '코스 고도', top1: ['/tools/sports/pace'], strict: true },
  { q: '존2 심박', top1: ['/tools/sports/interval-training'], strict: true },
  { q: '정크 마일', top1: ['/tools/sports/interval-training'], strict: true },
  { q: 'EPL 승점', top1: ['/tools/sports/league-scenarios'], strict: true },
  { q: '와셔', top1: ['/tools/interior/screw'], strict: true },
  { q: '볼트 토크', top1: ['/tools/interior/screw'], strict: true },
  { q: '케이크 1호', top1: ['/tools/cooking/baking-recipe'], strict: true },
  { q: '프리딜레이', top1: ['/tools/art/tap-tempo'], strict: true },
  { q: 'k8s', top1: ['/tools/dev/json'], strict: true },
  { q: 'yaml to json', top1: ['/tools/dev/json'], strict: true },
  { q: '생명표', top1: ['/tools/date/age'], strict: true },
  { q: '메멘토모리', top1: ['/tools/date/age'], strict: true },
  { q: '매몰비용', top1: [F + 'stock'], strict: true },
  // 소스 도구 이름·설명에만 있던 말 — 삭제 뒤 0건이 되지 않게 (리뷰 회귀)
  { q: '월드컵 경우의 수', top1: ['/tools/sports/league-scenarios'], strict: true },
  { q: '챔스', top1: ['/tools/sports/league-scenarios'], strict: true },
  { q: '타이브레이커', top1: ['/tools/sports/league-scenarios'], strict: true },
  { q: '목표 승점', top1: ['/tools/sports/league-scenarios'], strict: true },
  { q: '순위', top1: ['/tools/sports/league-scenarios'], present: [F + 'wealth-rank'], strict: true, note: "이름에서 '순위'가 빠져도 1위 유지 (자산 순위는 '자산 순위'로)" },
  { q: '자산 순위', top1: [F + 'wealth-rank'] },
  { q: '언덕', top1: ['/tools/sports/pace'], strict: true },
  { q: '매도', top1: [F + 'stock'], strict: true },
  { q: '과학적 표기법', top1: ['/tools/edu/sig-figs'], strict: true },
  { q: '지수 표기', top1: ['/tools/edu/sig-figs'], strict: true },
  // '고도 보정'은 대회 개최지 고도 보정(race-predictor) — pace의 코스 언덕 보정은 '코스 고도'·'언덕 보정'
  { q: '고도 보정', top1: ['/tools/sports/race-predictor'], strict: true },
  { q: '언덕 보정', top1: ['/tools/sports/pace'], strict: true },
  { q: '토크', top1: ['/tools/unit/converter'], absent: ['/tools/dev/token-counter'], strict: true, note: "'토크' 단독은 단위 변환기 토크 분야 — 볼트 체결 토크는 '체결 토크'" },
  { q: '체결 토크', top1: ['/tools/interior/screw'], strict: true },
  // 옮긴 별칭이 다른 도구의 질의를 뺏지 않는지 (케이크인치 ↛ 인치, 레시피 배율은 recipe 몫이라 미등록)
  { q: '인치', top1: ['/tools/unit/converter'] },
  { q: '레시피', top1: ['/tools/cooking/recipe'] },
  { q: '유산소', top1: ['/tools/sports/vo2max'] },
  { q: '축구', top1: ['/tools/sports/formation'], present: ['/tools/sports/league-scenarios'] },
]

export interface CaseResult {
  c: SearchCase
  pass: boolean
  failures: string[]
  got: { href: string; score: number }[]
}

type SearchFn = (q: string, limit?: number) => { tool: { href: string }; score: number }[]

const EXISTING = new Set(allTools.map(t => t.href))

/**
 * 기대 href 목록 → 지금 레지스트리 기준 정답 집합
 * (존재하는 href + 아직 남은 병합 소스 + 이미 삭제된 병합 소스를 적었다면 그 target)
 */
export function acceptedHrefs(hrefs: string[], existing: ReadonlySet<string> = EXISTING): Set<string> {
  const out = new Set<string>()
  for (const h of hrefs) {
    if (existing.has(h)) out.add(h)
    else if (MERGED_INTO[h] && existing.has(MERGED_INTO[h])) out.add(MERGED_INTO[h])
    for (const [src, dst] of Object.entries(MERGED_INTO)) {
      if (dst === h && existing.has(src)) out.add(src)
    }
  }
  return out
}

/** existing: 레지스트리 href 집합 (기본 lib/tools.ts — 테스트에서 신설·병합 시점을 흉내 낼 때 주입) */
export function evaluateCase(c: SearchCase, search: SearchFn = defaultSearch, existing: ReadonlySet<string> = EXISTING): CaseResult {
  const within = c.within ?? 8
  const hits = search(c.q, Math.max(8, within))
  const got = hits.map(h => ({ href: h.tool.href, score: h.score }))
  const all = got.map(g => g.href)
  const hrefs = all.slice(0, 8)
  const top3 = hrefs.slice(0, 3)
  const failures: string[] = []

  if (c.top1) {
    const ok = c.strict ? new Set(c.top1.filter(h => existing.has(h))) : acceptedHrefs(c.top1, existing)
    if (ok.size === 0) failures.push(`top1 기대 도구가 레지스트리에 없음: ${c.top1.join(', ')}`)
    else if (!hrefs[0] || !ok.has(hrefs[0])) failures.push(`1위 ${hrefs[0] ?? '(없음)'} ∉ {${[...ok].join(', ')}}`)
  }
  if (c.top3) {
    const ok = acceptedHrefs(c.top3, existing)
    if (ok.size === 0) failures.push(`top3 기대 도구가 레지스트리에 없음: ${c.top3.join(', ')}`)
    else if (!top3.some(h => ok.has(h))) failures.push(`상위 3에 {${[...ok].join(', ')}} 중 하나도 없음`)
  }
  if (c.top3All) {
    for (const h of c.top3All) {
      const ok = acceptedHrefs([h], existing)
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
  if (c.present) {
    const pool = all.slice(0, within)
    for (const h of c.present) {
      const ok = acceptedHrefs([h], existing)
      if (ok.size === 0) failures.push(`present 기대 도구가 레지스트리에 없음: ${h}`)
      else if (!pool.some(x => ok.has(x))) failures.push(`재현율: ${h} 가 상위 ${within}에 없음`)
    }
  }
  if (c.future) {
    const live = c.future.filter(h => existing.has(h))
    if (live.length && !live.includes(hrefs[0] ?? '')) {
      failures.push(`신설 도구 {${live.join(', ')}} 가 레지스트리에 있는데 1위가 ${hrefs[0] ?? '(없음)'} — 별칭을 신설 도구로 옮길 것`)
    }
  }
  return { c, pass: failures.length === 0, failures, got: got.slice(0, 8) }
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
