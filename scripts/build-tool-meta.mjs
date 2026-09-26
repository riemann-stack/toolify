#!/usr/bin/env node
// scripts/build-tool-meta.mjs — lib/toolMeta.data.json 생성 (스펙 §13 Phase 2 + 정직성 규칙). 기본 dry-run.
//
// 사용: node scripts/build-tool-meta.mjs            # dry-run: 파일을 쓰지 않고 요약·변경 항목만 출력
//       node scripts/build-tool-meta.mjs --write    # lib/toolMeta.data.json 기록
//       node scripts/build-tool-meta.mjs --check    # 커밋된 JSON이 최신이 아니면 exit 1 (CI용)
//       node scripts/build-tool-meta.mjs --verbose  # 도구별 상세
//       node scripts/build-tool-meta.mjs --changelog  # 도구별 변경 기록 후보(git) 출력 — 사람이 골라 changelog에 옮긴다
//
// 입력(자동) — 날짜를 손으로 쓰지 않는다
//   ① app/tools/<cat>/<slug>/page.tsx 의 <UpdatedMeta date basis sources> → reviewed('2026년 7월' → '2026-07')·basis·sources
//      <Disclaimer sources> 도 공식 출처로 합친다(href 중복 제거).
//   ② git log — updated: 도구의 '내용' 파일을 건드린 마지막 커밋일(%cs). 제목에 [skip-lastmod]가 있거나
//      .lastmod-ignore에 등록된 커밋은 건너뛴다(scripts/gen-lastmod.mts와 같은 규칙). 커밋 이력이 없으면 비운다.
//      내용 파일 = page.tsx(가이드·FAQ) + 도구 폴더의 로직·데이터 .ts(*Utils·*Data·*Constants…, .d.ts 제외)
//               + 그 파일들이 import하는 법정·공식 수치 lib(lib/kr*.ts·running·vinDecoder, lib 안 import 1단계 포함)
//               + 다른 도구 폴더의 로직 .ts를 상대 경로로 import하면 그 파일.
//      *Client.tsx(화면)는 넣지 않는다 — UI 수정은 '업데이트'(계산·내용 변경)가 아니다.
//      ⚠ 리디자인·코드모드처럼 page.tsx를 기계적으로 건드리는 커밋은 제목에 [skip-lastmod]를 넣거나
//        해시를 .lastmod-ignore에 등록한다. 그러지 않으면 200개 도구의 '최종 업데이트'·dateModified가 그 날짜로 바뀐다.
//      ⚠ CI에서 --check를 돌리면 actions/checkout에 fetch-depth: 0이 필요하다(얕은 클론이면 updated가 전부 달라진다).
//      changelog는 자동으로 채우지 않는다 — 커밋 제목('Wave5 신규 도구 3종…', 'tools update')은 공개 문구로 부적합하고
//      다른 도구 이야기가 섞인다. `--changelog`로 *Utils.ts 커밋 후보(일괄 커밋 제외)를 출력 → 사람이 문구를 다듬어 JSON에 적는다.
//   ③ tests/golden — verified: 아래 GOLDEN 표의 테스트를 실제로 실행(tsx --test, TAP)해 해당 스위트의 통과 케이스 수를 센다.
//      실패가 하나라도 있거나, 테스트가 그 도구(또는 도구가 import하는 lib 모듈)를 참조하지 않으면 verified를 붙이지 않는다.
//   ④ 도구 폴더의 role="status" / data-result-label / <ResultHero → hasResult (레일 미니 결과 렌더 여부)
// 사람이 채우는 필드(보존): method · group · iconName · example · changelog([{date, text}] — 사용자에게 보이는 문구) — 기존 JSON 값을 그대로 유지.
//   basis·sources는 페이지에 <UpdatedMeta>/<Disclaimer sources>가 있으면 페이지가 기준, 없으면 기존 JSON 값을 유지.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)

const WRITE = process.argv.includes('--write')
const CHECK = process.argv.includes('--check')
const VERBOSE = process.argv.includes('--verbose')
const CHANGELOG = process.argv.includes('--changelog')
const OUT = 'lib/toolMeta.data.json'
const SKIP_MARKER = '[skip-lastmod]'
const BULK_DIRS = 6 // 도구 폴더를 이만큼 이상 건드린 커밋은 changelog에서 제외(일괄 코드모드·감사 커밋)
const YMYL = new Set(['finance', 'health'])

/* ── 골든 테스트 ↔ 도구 (사람이 정한 범위 — 스크립트가 파일 존재·참조·통과를 검증) ──────────
   suite: 최상위 describe 이름 정규식. full: 도구의 핵심 계산 전체를 덮는가(아니면 '<scope> 검산'으로 범위 표기)
   한 도구에 여러 항목이면: full = 하나라도 full이면 true(범위 표기는 그 항목의 scope), 아니면 scope를 ' · '로 잇는다.
   넣지 않은 테스트: energyPrices(단가 상수·재수출 동일성 — 계산 검산이 아님), running의 buildup·lsd(계수 동일성만 확인),
                    incomeTax의 rent-jeonse(세액 절감은 부가 계산)·salary(salaryInsurance가 이미 전체 검산). */
const GOLDEN = [
  // 신규 도구 5종(2026-09-26) — 도구 전용 골든 테스트라 계산 전체(full)
  { slug: '/tools/finance/deposit-interest', file: 'tests/golden/depositInterest.test.mts', suite: /./,
    scope: '예·적금 세후 이자·만기 수령액', full: true },
  { slug: '/tools/finance/acquisition-tax', file: 'tests/golden/acquisitionTaxCauses.test.mts', suite: /./,
    scope: '취득 원인별 취득세·지방교육세·농특세', full: true },
  { slug: '/tools/finance/acquisition-tax', file: 'tests/golden/acquisitionTax.test.mts', suite: /^(?!.*(경매|auction))/,
    scope: '유상 주택 표준세율·중과', full: true },
  { slug: '/tools/finance/brokerage-fee', file: 'tests/golden/brokerageFee.test.mts', suite: /./,
    scope: '중개보수 상한요율·한도액', full: true },
  { slug: '/tools/finance/real-estate', file: 'tests/golden/brokerageFee.test.mts', suite: /./,
    scope: '매매 중개보수', full: false },
  { slug: '/tools/finance/annual-leave', file: 'tests/golden/annualLeave.test.mts', suite: /./,
    scope: '연차 발생·잔여·연차수당', full: true },
  { slug: '/tools/finance/hourly-pay', file: 'tests/golden/hourlyPay.test.mts', suite: /./,
    scope: '주휴수당·가산수당·월 환산', full: true },
  { slug: '/tools/finance/dividend', file: 'tests/golden/dividendTax.test.mts', suite: /./,
    scope: '배당소득세 15.4%·종합과세 기준', full: false },
  { slug: '/tools/finance/salary', file: 'tests/golden/salaryInsurance.test.mts', suite: /^salary\b/,
    scope: '4대보험·근로소득세 공제 후 실수령액', full: true },
  { slug: '/tools/finance/4-insurance', file: 'tests/golden/salaryInsurance.test.mts', suite: /^4-insurance\b/,
    scope: '근로자·사업주 4대보험료', full: true },
  { slug: '/tools/finance/4-insurance', file: 'tests/golden/pensionBase.test.mts', suite: /^(4-insurance|clampPensionBase|pensionBaseAt)\b/,
    scope: '근로자·사업주 4대보험료', full: true },
  { slug: '/tools/finance/4-insurance', file: 'tests/golden/workersComp.test.mts', suite: /./,
    scope: '산재보험 업종 요율', full: false },
  { slug: '/tools/finance/national-pension', file: 'tests/golden/salaryInsurance.test.mts', suite: /^national-pension\b/,
    scope: '기준소득월액 상·하한', full: false },
  { slug: '/tools/finance/auction', file: 'tests/golden/acquisitionTax.test.mts', suite: /경매|auction/,
    scope: '취득세·지방교육세·농특세', full: false },
  { slug: '/tools/finance/auction', file: 'tests/golden/loanRules.test.mts', suite: /./,
    scope: '경락대출 LTV·DSR 한도', full: false },
  { slug: '/tools/finance/real-estate', file: 'tests/golden/acquisitionTax.test.mts', suite: /^(?!.*(경매|auction))/,
    scope: '취득세·지방교육세·농특세', full: false },
  { slug: '/tools/finance/unemployment-benefit', file: 'tests/golden/unemployment.test.mts', suite: /./,
    scope: '구직급여 1일액 상·하한', full: false },
  { slug: '/tools/finance/freelance-tax', file: 'tests/golden/expenseRates.test.mts', suite: /./,
    scope: '경비율·단순경비율 적용 한도', full: false },
  { slug: '/tools/finance/freelance-tax', file: 'tests/golden/incomeTax.test.mts', suite: /./,
    scope: '소득세 기본세율 구간', full: false },
  { slug: '/tools/finance/capital-gains-tax', file: 'tests/golden/incomeTax.test.mts', suite: /./,
    scope: '소득세 기본세율 구간', full: false },
  { slug: '/tools/finance/severance', file: 'tests/golden/incomeTax.test.mts', suite: /./,
    scope: '소득세 기본세율 구간', full: false },
  { slug: '/tools/finance/dividend', file: 'tests/golden/incomeTax.test.mts', suite: /./,
    scope: '소득세 기본세율 구간', full: false },
  { slug: '/tools/finance/inheritance', file: 'tests/golden/inheritanceTax.test.mts', suite: /./,
    scope: '상속세·증여세 세율·공제', full: false },
  { slug: '/tools/finance/property-holding-tax', file: 'tests/golden/propertyTax.test.mts', suite: /./,
    scope: '재산세·종합부동산세', full: false },
  { slug: '/tools/finance/year-end-tax', file: 'tests/golden/yearEndTax.test.mts', suite: /./,
    scope: '세액공제·소득공제 구성요소', full: false },
  { slug: '/tools/finance/vat', file: 'tests/golden/vatReverse.test.mts', suite: /./,
    scope: '부가세 역산·가산 반올림', full: false },
  { slug: '/tools/finance/car-tax', file: 'tests/golden/vehicleTax.test.mts', suite: /^(?!car-cost)/,
    scope: '자동차 취득세·자동차세', full: false },
  { slug: '/tools/finance/car-cost', file: 'tests/golden/vehicleTax.test.mts', suite: /^car-cost\b/,
    scope: '자동차세', full: false },
  { slug: '/tools/life/customs', file: 'tests/golden/customs.test.mts', suite: /./,
    scope: '관부가세 면세 한도·세액 적층', full: false },
  { slug: '/tools/health/blood-alcohol', file: 'tests/golden/drunkDriving.test.mts', suite: /./,
    scope: '음주운전 처벌 기준', full: false },
  { slug: '/tools/sports/race-predictor', file: 'tests/golden/running.test.mts', suite: /^(VDOT|Riegel)/,
    scope: 'VDOT·Riegel 기록 예측식', full: false },
  { slug: '/tools/sports/interval-training', file: 'tests/golden/running.test.mts', suite: /^(계수|훈련 페이스)/,
    scope: 'VDOT 훈련 페이스', full: false },
  { slug: '/tools/sports/vo2max', file: 'tests/golden/running.test.mts', suite: /^(VDOT|훈련 페이스)/,
    scope: 'VDOT 훈련 페이스', full: false },
]

/* ── 유틸 ─────────────────────────────────────────────────────────────── */
const git = args => { try { return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 << 20 }) } catch { return '' } }
const readJson = f => { try { const v = JSON.parse(readFileSync(f, 'utf8')); return v && typeof v === 'object' && !Array.isArray(v) ? v : {} } catch { return {} } }
const warn = []

const IGNORED = existsSync('.lastmod-ignore')
  ? readFileSync('.lastmod-ignore', 'utf8').split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim().toLowerCase()).filter(v => /^[0-9a-f]{7,40}$/.test(v))
  : []
const isSkipped = c => c.subject.includes(SKIP_MARKER) || IGNORED.some(h => c.hash.startsWith(h))

function commits(paths) {
  if (paths.length === 0) return []
  return git(['log', '--format=%H%x1f%cs%x1f%s', '--', ...paths]).split('\n').filter(Boolean).map(l => {
    const [hash = '', date = '', subject = ''] = l.split('\x1f')
    return { hash: hash.toLowerCase(), date, subject }
  })
}
const dirCountCache = new Map()
function toolDirsTouched(hash) {
  if (!dirCountCache.has(hash)) {
    const names = git(['show', '--name-only', '--format=', hash]).split('\n')
    dirCountCache.set(hash, new Set(names.map(n => (n.match(/^app\/tools\/[^/]+\/[^/]+\//) || [])[0]).filter(Boolean)).size)
  }
  return dirCountCache.get(hash)
}
function cleanSubject(s) {
  let t = s.replace(/\[(skip[- ][a-z]+|[a-z-]+ ci)\]/gi, '').replace(/^(fix|feat|chore|refactor|docs|style|perf|test)(\([^)]*\))?!?:\s*/i, '').trim()
  if (t.length > 72) { // 긴 감사 제목은 '·' 경계에서 자른다
    const cut = t.slice(0, 72); const i = Math.max(cut.lastIndexOf('·'), cut.lastIndexOf(' — '), cut.lastIndexOf(', '))
    t = (i > 30 ? cut.slice(0, i) : cut).trim() + '…'
  }
  return t
}

/** 여는 태그 전체(중괄호·따옴표 깊이를 따라 '>'를 찾는다) — 예: extractTag(src, 'UpdatedMeta') */
function extractTag(src, name, from = 0) {
  const re = new RegExp(`<${name}\\b`, 'g'); re.lastIndex = from
  const m = re.exec(src); if (!m) return null
  let depth = 0, q = null
  for (let i = m.index + 1; i < src.length; i++) {
    const c = src[i]
    if (q) { if (c === '\\') { i++; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'" || c === '`') { q = c; continue }
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) return src.slice(m.index, i + 1)
  }
  return null
}
/** 속성 값: "…" | '…' | {'…'} | {"…"} | {`…`} → 문자열(템플릿 식은 제거) */
function attrString(tag, attr) {
  const m = tag.match(new RegExp(`\\b${attr}=(?:"([^"]*)"|'([^']*)'|\\{\\s*(['"\`])([\\s\\S]*?)\\3\\s*\\})`))
  if (!m) return null
  let v = m[1] ?? m[2] ?? m[4] ?? ''
  if (/\$\{/.test(v)) {
    v = v.replace(/\s*\(\$\{[^}]*\}\)/g, '').replace(/\$\{[^}]*\}/g, '').replace(/\s{2,}/g, ' ').replace(/·\s*·/g, '·').trim()
  }
  return v.replace(/\s+/g, ' ').trim()
}
/** 식별자(`NAME` 또는 `OBJ.key`)를 문자열 상수로 풀기 — 같은 파일의 const, 없으면 그 파일이 import한 모듈(@/·상대 경로)의 export const.
 *  새 도구 페이지가 href: LAW.x · date={X_REVIEWED}처럼 상수를 참조해도 출처·기준일을 읽기 위함. 풀지 못하면 null */
function resolveIdent(src, file, expr, depth = 0) {
  if (depth > 2) return null
  const [name, key] = expr.split('.')
  const esc = x => x.replace(/[$]/g, '\\$')
  if (key) {
    const obj = src.match(new RegExp(`const\\s+${esc(name)}\\b[^=]*=\\s*\\{([\\s\\S]*?)\\n\\s*\\}`))
    if (obj) { const kv = obj[1].match(new RegExp(`\\b${esc(key)}\\s*:\\s*(['"\`])((?:(?!\\1).)*)\\1`)); if (kv) return kv[2] }
  } else {
    const c = src.match(new RegExp(`const\\s+${esc(name)}\\b[^=]*=\\s*(['"\`])((?:(?!\\1).)*)\\1`))
    if (c && !/\$\{/.test(c[2])) return c[2]
  }
  const imp = [...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)].find(m => m[1].split(',').some(x => x.trim().split(/\s+as\s+/).pop() === name))
  if (!imp) return null
  const base = imp[2].startsWith('@/') ? imp[2].slice(2) : imp[2].startsWith('.') ? join(dirname(file), imp[2]) : null
  if (!base) return null
  for (const ext of ['.ts', '.tsx', '/index.ts']) {
    if (existsSync(base + ext)) return resolveIdent(readFileSync(base + ext, 'utf8'), base + ext, expr, depth + 1)
  }
  return null
}
/** sources={[{label, href}, …]} 또는 sources={CONST} → [{label, href}] (href가 상수 참조여도 resolveIdent로 푼다) */
function attrSources(tag, src, file = '') {
  let body = null
  const lit = tag.match(/\bsources=\{\s*(\[[\s\S]*\])\s*\}/)
  if (lit) body = lit[1]
  else {
    const id = tag.match(/\bsources=\{\s*([A-Za-z_$][\w$]*)\s*\}/)
    if (id) { const d = src.match(new RegExp(`const\\s+${id[1]}\\b[^=]*=\\s*(\\[[\\s\\S]*?\\n\\s*\\])`)); if (d) body = d[1] }
  }
  if (!body) return []
  const out = []
  const re = /\{\s*["']?label["']?\s*:\s*(["'`])((?:(?!\1).)*)\1\s*,\s*["']?href["']?\s*:\s*(?:(["'`])((?:(?!\3).)*)\3|([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?))/g
  for (const m of body.matchAll(re)) {
    const href = m[4] ?? (m[5] ? resolveIdent(src, file, m[5]) : null)
    const label = m[2].replace(/\s*\(?\$\{[^}]*\}\)?/g, '').replace(/\s*↗$/, '').replace(/\s{2,}/g, ' ').trim()
    if (href && /^https?:\/\//.test(href) && label) out.push({ label, href })
  }
  return out
}
/** '2026년 7월' → '2026-07' · '2026년' → '2026' · '2026.07.14'/'2026-07-14' → '2026-07-14' · 그 외 null */
function parseKoDate(s) {
  if (!s) return null
  let m = s.match(/^(\d{4})\s*년(?:\s*(\d{1,2})\s*월)?(?:\s*(\d{1,2})\s*일)?/)
  if (m) return [m[1], m[2] && m[2].padStart(2, '0'), m[3] && m[3].padStart(2, '0')].filter(Boolean).join('-')
  m = s.match(/^(\d{4})[.-](\d{1,2})(?:[.-](\d{1,2}))?\.?$/)
  if (m) return [m[1], m[2].padStart(2, '0'), m[3] && m[3].padStart(2, '0')].filter(Boolean).join('-')
  return null
}

/* ── 골든 테스트 실행(파일당 1회) → 최상위 스위트별 { pass, fail } ─────────────── */
const tapCache = new Map()
function runTap(file) {
  if (tapCache.has(file)) return tapCache.get(file)
  let out = ''
  try {
    out = execFileSync('npx', ['--no-install', 'tsx', '--test', '--test-reporter=tap', file], { encoding: 'utf8', timeout: 180_000, stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) { out = String(e.stdout || '') } // 실패가 있어도 TAP은 stdout에 남는다
  const suites = new Map()
  const lines = out.split('\n')
  let top = null
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i]
    const sub = L.match(/^# Subtest: (.*)$/)
    if (sub) { top = sub[1]; continue }
    const r = L.match(/^(\s*)(not )?ok \d+ - (.*?)(?: # (SKIP|TODO).*)?$/)
    if (!r) continue
    // 바로 뒤 YAML 블록의 type 으로 리프(test)/스위트 판별
    let type = ''
    for (let j = i + 1; j < Math.min(lines.length, i + 12); j++) { const t = lines[j].match(/type: '(\w+)'/); if (t) { type = t[1]; break } if (/^\s*\.\.\.\s*$/.test(lines[j])) break }
    if (type !== 'test') continue
    const key = r[1].length === 0 ? r[3] : top
    if (!key) continue
    const s = suites.get(key) ?? { pass: 0, fail: 0 }
    if (r[4]) { /* skip/todo는 세지 않음 */ } else if (r[2]) s.fail++; else s.pass++
    suites.set(key, s)
  }
  const res = { suites, ok: /^# fail 0$/m.test(out), ran: /^# tests \d+$/m.test(out) }
  tapCache.set(file, res)
  return res
}

/* ── 도구의 '내용' 파일 (updated 계산 대상) ─────────────────────────────────── */
const DATA_LIB = /^(kr[A-Z]\w*|running|vinDecoder)$/ // 법정·공식 수치·공식 lib — lib/date·seo·tools 같은 공용 유틸은 제외
const IMPORT_RE = /from\s+['"]([^'"]+)['"]/g
function contentFiles(dir, files) {
  const own = files.filter(n => /\.m?ts$/.test(n) && !n.endsWith('.d.ts')).map(n => join(dir, n))
  const out = new Set([join(dir, 'page.tsx'), ...own])
  const scan = (file, depth) => {
    let src = ''
    try { src = readFileSync(file, 'utf8') } catch { return }
    for (const [, spec] of src.matchAll(IMPORT_RE)) {
      let target = null
      const lib = spec.match(/^(?:@\/lib\/|(?:\.\.?\/)+lib\/|\.\/)([\w-]+)$/)
      if (lib && DATA_LIB.test(lib[1]) && (spec.startsWith('@/lib/') || file.startsWith('lib/') || /\/lib\//.test(spec))) target = `lib/${lib[1]}.ts`
      else if (spec.startsWith('.') && !file.startsWith('lib/')) {
        const r = join(dirname(file), spec).replace(/\\/g, '/')
        if (/^app\/tools\/[^/]+\/[^/]+\/[^/]+$/.test(r) && existsSync(`${r}.ts`)) target = `${r}.ts` // 다른 도구의 로직 .ts
      }
      if (!target || out.has(target) || !existsSync(target)) continue
      out.add(target)
      if (depth < 1) scan(target, depth + 1)
    }
  }
  for (const n of files.filter(n => /\.(m?ts|tsx)$/.test(n) && !n.endsWith('.d.ts'))) scan(join(dir, n), 0)
  return [...out].sort()
}

/* ── 도구 목록 (파일시스템 기준 — 새 도구도 포함) ─────────────────────── */
const pages = []
for (const cat of readdirSync('app/tools')) {
  const cd = join('app/tools', cat)
  if (!statSync(cd).isDirectory() || cat.startsWith('[') || cat.startsWith('_')) continue
  for (const slug of readdirSync(cd)) {
    const f = join(cd, slug, 'page.tsx')
    if (existsSync(f)) pages.push(f)
  }
}
pages.sort()

const registry = new Set([...readFileSync('lib/tools.ts', 'utf8').matchAll(/href:\s*'(\/tools\/[^']+)'/g)].map(m => m[1]))
const prev = readJson(OUT)
const out = {}
const stat = { reviewed: 0, updated: 0, srcUM: 0, srcDisc: 0, withSrc: 0, basis: 0, verified: 0, hasResult: 0, changelog: 0 }

for (const f of pages) {
  const dir = f.replace(/\/page\.tsx$/, '')
  const slug = '/' + dir.replace(/^app\//, '')
  const cat = slug.split('/')[2]
  if (!registry.has(slug)) warn.push(`${slug}: lib/tools.ts 레지스트리에 없음`)
  const src = readFileSync(f, 'utf8')
  const files = readdirSync(dir)
  const p = prev[slug] && typeof prev[slug] === 'object' ? prev[slug] : {}

  // ① UpdatedMeta · Disclaimer
  const um = extractTag(src, 'UpdatedMeta')
  const dateIdent = um && um.match(/\bdate=\{\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*\}/)
  const reviewedRaw = um ? (attrString(um, 'date') ?? (dateIdent ? resolveIdent(src, f, dateIdent[1]) : null)) : null
  const reviewed = parseKoDate(reviewedRaw)
  if (um && reviewedRaw && !reviewed) warn.push(`${slug}: UpdatedMeta date 해석 불가 '${reviewedRaw}' → reviewed 비움`)
  const umBasis = um ? attrString(um, 'basis') : null
  const umSources = um ? attrSources(um, src, f) : []
  let discSources = []
  for (let at = 0, tag; (tag = extractTag(src, 'Disclaimer', at)); at = src.indexOf(tag, at) + tag.length) discSources.push(...attrSources(tag, src, f))
  const seen = new Set(); const pageSources = []
  for (const s of [...umSources, ...discSources]) if (!seen.has(s.href)) { seen.add(s.href); pageSources.push({ label: s.label, org: '', href: s.href }) }
  if (umSources.length) stat.srcUM++
  if (discSources.length) stat.srcDisc++

  // ② git
  const logicFiles = files.filter(n => /Utils\.m?ts$/.test(n)).map(n => join(dir, n)) // changelog 후보용(계산 로직)
  const deps = contentFiles(dir, files)
  const upd = commits(deps).find(c => !isSkipped(c))
  const humanLog = Array.isArray(p.changelog)
    ? p.changelog.filter(c => c && typeof c.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && typeof c.text === 'string' && c.text.trim())
    : []
  if (CHANGELOG) {
    const cand = commits(logicFiles).filter(c => !isSkipped(c) && toolDirsTouched(c.hash) < BULK_DIRS).slice(0, 5)
    if (cand.length) console.log(`${slug}\n${cand.map(c => `  ${c.date}  ${cleanSubject(c.subject)}  (${c.hash.slice(0, 7)})`).join('\n')}`)
  }

  // ③ 골든 테스트
  let verified // undefined = 근거 없음 · null = 실패로 제외
  for (const g of GOLDEN.filter(g => g.slug === slug)) {
    if (verified === null) break
    if (!existsSync(g.file)) { warn.push(`${slug}: ${g.file} 없음 → verified 제외`); continue }
    const tsrc = readFileSync(g.file, 'utf8')
    const refDir = tsrc.includes(`app/tools/${cat}/${slug.split('/')[3]}/`)
    const libs = [...tsrc.matchAll(/from '(?:\.\.\/)+lib\/([\w-]+)'/g)].map(m => m[1])
    const toolSrc = files.filter(n => /\.(ts|tsx|mts)$/.test(n)).map(n => readFileSync(join(dir, n), 'utf8')).join('\n')
    const refLib = libs.some(l => toolSrc.includes(`@/lib/${l}'`) || toolSrc.includes(`lib/${l}'`))
    if (!refDir && !refLib) { warn.push(`${slug}: ${g.file}가 도구·도구의 lib를 참조하지 않음 → verified 제외`); continue }
    const tap = runTap(g.file)
    const hits = [...tap.suites].filter(([name]) => g.suite.test(name))
    const pass = hits.reduce((a, [, s]) => a + s.pass, 0)
    const fail = hits.reduce((a, [, s]) => a + s.fail, 0)
    if (!tap.ran || hits.length === 0 || pass === 0) { warn.push(`${slug}: ${g.file} 스위트 ${g.suite} 실행 결과 없음 → verified 제외`); continue }
    if (fail > 0) { warn.push(`${slug}: ${g.file} 실패 ${fail}건 → verified 제외`); verified = null; break }
    const date = git(['log', '-1', '--format=%cs', '--', g.file]).trim()
    if (!verified) verified = { cases: pass, scope: g.scope, full: g.full, tests: [g.file], ...(date && { date }) }
    else {
      // 여러 항목 합치기: 하나라도 full이면 full(범위 표기는 그 항목), 아니면 범위를 잇는다. 같은 파일을 두 번 세지 않도록 스위트 정규식이 겹치지 않게 적는다
      const scope = verified.full ? verified.scope : g.full ? g.scope : [...new Set([...verified.scope.split(' · '), g.scope])].join(' · ')
      verified = { ...verified, cases: verified.cases + pass, scope, full: verified.full || g.full, tests: [...new Set([...verified.tests, g.file])], ...(date && (!verified.date || date > verified.date) && { date }) }
    }
  }

  // ④ 결과 요소
  const hasResult = files.filter(n => n.endsWith('.tsx')).some(n => /role=["']status["']|data-result-label|<ResultHero\b/.test(readFileSync(join(dir, n), 'utf8')))

  const basis = umBasis ?? (typeof p.basis === 'string' ? p.basis : '')
  const sources = pageSources.length ? pageSources : (Array.isArray(p.sources) ? p.sources : [])
  const m = {
    slug,
    ...(reviewed && { reviewed }),
    ...(upd && { updated: upd.date }),
    basis,
    sources,
    ...(verified && { verified }),
    ...(typeof p.method === 'string' && p.method && { method: p.method }),
    ...(typeof p.group === 'string' && p.group && { group: p.group }),
    ...(typeof p.iconName === 'string' && p.iconName && { iconName: p.iconName }),
    ...(humanLog.length && { changelog: humanLog }),
    ...(p.example && typeof p.example === 'object' && { example: p.example }),
    ymyl: YMYL.has(cat),
    hasResult,
  }
  out[slug] = m
  if (reviewed) stat.reviewed++
  if (m.updated) stat.updated++
  if (sources.length) stat.withSrc++
  if (basis) stat.basis++
  if (verified) stat.verified++
  if (hasResult) stat.hasResult++
  if (humanLog.length) stat.changelog++
  if (VERBOSE) console.log(`${slug.padEnd(44)} reviewed ${m.reviewed ?? '-'} · updated ${m.updated ?? '-'}${upd ? ` (${upd.hash.slice(0, 7)})` : ''} · 내용 파일 ${deps.length} · 출처 ${sources.length} · ${verified ? `검산 ${verified.cases}건${verified.full ? '' : '(일부)'}` : '-'}${hasResult ? '' : ' · 결과요소 없음'}`)
}
for (const href of registry) if (!out[href]) warn.push(`${href}: 레지스트리에 있으나 page.tsx 없음`)

const json = JSON.stringify(out, null, 1) + '\n'
const prevJson = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
const changed = Object.keys(out).filter(k => JSON.stringify(prev[k]) !== JSON.stringify(out[k]))
const missing = Object.values(out).filter(m => !m.basis || !m.sources.length)

console.log(`${WRITE ? 'WRITE' : CHECK ? 'CHECK' : 'DRY-RUN (파일 미수정)'} · 도구 ${pages.length}`)
console.log(`  reviewed(UpdatedMeta date)   ${stat.reviewed}`)
console.log(`  updated(git, skip 제외)      ${stat.updated}`)
console.log(`  출처 있음                    ${stat.withSrc}  (UpdatedMeta ${stat.srcUM} · Disclaimer ${stat.srcDisc})`)
console.log(`  적용 기준(basis) 있음        ${stat.basis}`)
console.log(`  검산(골든 테스트 통과)       ${stat.verified}  ${Object.values(out).filter(m => m.verified).map(m => `${m.slug.split('/').pop()}:${m.verified.cases}${m.verified.full ? '' : '*'}`).join(' ')}  (*=범위 한정)`)
console.log(`  결과 요소(hasResult)         ${stat.hasResult}`)
console.log(`  changelog(사람 작성) 있음     ${stat.changelog}`)
console.log(`  사람 입력 필요(basis·출처)   ${missing.length}`)
console.log(`  기존 JSON 대비 변경 항목     ${changed.length}${changed.length && changed.length <= 12 ? ' — ' + changed.join(', ') : ''}`)
for (const w of warn) console.log(`  ! ${w}`)

if (CHECK) process.exit(json === prevJson ? 0 : 1)
if (WRITE) writeFileSync(OUT, json)
