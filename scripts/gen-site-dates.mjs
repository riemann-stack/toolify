#!/usr/bin/env node
/* lib/siteDates.json 생성 — 홈·허브가 쓰는 '날짜 사실'을 git 이력에서 뽑아 커밋용 JSON으로 고정한다.
   Vercel 빌드는 git 이력 없이 이 JSON만 읽는다(gen-lastmod.mts와 같은 방식). 날짜를 손으로 쓰지 않는다.

   ① addedAt   — 도구별 공개일 = 도구 디렉터리의 page.tsx가 처음 커밋된 날(author date %as).
                  committer date(%cs)는 rebase·amend·cherry-pick 때 오늘로 바뀌어 전체 도구가 'NEW'로 되돌아갈 수 있어 쓰지 않는다.
                  카테고리 이동(next.config.ts 301: /tools/music/* → /tools/art/* 등)이나 통합(date/diff → dday)으로
                  경로가 바뀐 도구는 옛 경로의 첫 커밋까지 포함해 가장 이른 날짜를 쓴다 → 이동만으로 'NEW'가 되지 않게.
                  아직 커밋 전인 새 도구는 항목을 만들지 않는다(지어내지 않음 → NEW 배지도 붙지 않음).
   ② legalUpdated — 홈 '2026 기준 숫자'가 읽는 법정 수치 단일 소스(lib/kr*.ts)를 마지막으로 바꾼 커밋일(%cs — 반영일).
                  제목에 [skip-lastmod]가 있거나 .lastmod-ignore에 등록된 기계적 커밋은 건너뛴다.
   ③ goldenUpdated — tests/golden(법정 수치 골든 테스트)을 마지막으로 바꾼 커밋일.

   사용: node scripts/gen-site-dates.mjs [--dry]   (저장소 루트에서, 전체 git 이력 필요 — shallow clone이면 부정확)
   실행 시점: 도구를 추가·이동하거나 lib/kr*.ts를 고친 커밋 '뒤에' 실행 → JSON 변경분 커밋. */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)

const DRY = process.argv.includes('--dry')
const OUT = 'lib/siteDates.json'
const LEGAL_FILES = [
  'lib/krInsuranceRates.ts', 'lib/krIncomeTax.ts', 'lib/krUnemployment.ts',
  'lib/krNationalPension.ts', 'lib/krHolidays.ts',
]
const GOLDEN_DIR = 'tests/golden'

/** 기기 로컬 YYYY-MM-DD — toISOString()은 KST 00~09시에 어제가 된다(CLAUDE.md) */
function localToday(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
  console.error('[gen-site-dates] shallow clone — 전체 이력이 없어 날짜가 틀린다. `git fetch --unshallow` 후 다시 실행하세요.')
  process.exit(1)
}

/* ── .lastmod-ignore (gen-lastmod.mts와 같은 형식) ── */
const ignored = existsSync('.lastmod-ignore')
  ? readFileSync('.lastmod-ignore', 'utf8').split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim().toLowerCase()).filter(v => /^[0-9a-f]{7,40}$/.test(v))
  : []
const isIgnored = (hash, subject) => subject.includes('[skip-lastmod]') || ignored.some(h => hash.startsWith(h))

/** 경로들을 건드린 커밋(최신순). date = committer date(%cs, 기본) 또는 author date(%as) */
function commits(paths, dateFmt = '%cs') {
  let raw = ''
  try { raw = git(['log', `--format=%H%x1f${dateFmt}%x1f%s`, '--', ...paths]) } catch { return [] }
  return raw.split('\n').filter(Boolean).map(line => {
    const [hash = '', date = '', subject = ''] = line.split('\x1f')
    return { hash: hash.toLowerCase(), date, subject }
  })
}

/** 마지막 '실질' 변경일 — 전부 기계적 커밋이면 그중 최신 */
function lastReal(paths) {
  const rows = commits(paths)
  if (rows.length === 0) return null
  return (rows.find(r => !isIgnored(r.hash, r.subject)) ?? rows[0]).date
}

/* ── 도구 목록: lib/tools.ts의 href 리터럴 (TS 로더 없이 읽기) ── */
const toolsSrc = readFileSync('lib/tools.ts', 'utf8')
const hrefs = [...new Set([...toolsSrc.matchAll(/href:\s*'(\/tools\/[a-z0-9-]+\/[a-z0-9-]+)'/g)].map(m => m[1]))]

/* ── 옛 경로: next.config.ts의 도구 단위 301 (source → destination) ── */
const cfg = readFileSync('next.config.ts', 'utf8')
const oldPaths = new Map() // destination → [source…]
for (const m of cfg.matchAll(/source:\s*'(\/tools\/[a-z0-9-]+\/[a-z0-9-]+)'\s*,\s*destination:\s*'(\/tools\/[a-z0-9-]+\/[a-z0-9-]+)'/g)) {
  const list = oldPaths.get(m[2]) ?? []
  list.push(m[1])
  oldPaths.set(m[2], list)
}

const addedAt = {}
let moved = 0
let missing = 0
for (const href of hrefs) {
  const candidates = [href, ...(oldPaths.get(href) ?? [])]
  const dates = candidates.flatMap(p => commits([`app${p}/page.tsx`], '%as').map(r => r.date)).filter(Boolean).sort()
  if (dates.length === 0) { missing++; continue }
  const own = commits([`app${href}/page.tsx`], '%as').map(r => r.date).sort()[0]
  if (own && own !== dates[0]) moved++
  addedAt[href] = dates[0]
}

const out = {
  generated: localToday(), // 스크립트 실행일 — 표시용 아님, 재생성 추적용
  legalUpdated: lastReal(LEGAL_FILES),
  goldenUpdated: lastReal([GOLDEN_DIR]),
  addedAt: Object.fromEntries(Object.entries(addedAt).sort(([a], [b]) => a.localeCompare(b))),
}

const byMonth = {}
for (const d of Object.values(addedAt)) byMonth[d.slice(0, 7)] = (byMonth[d.slice(0, 7)] ?? 0) + 1
console.log(`[gen-site-dates] 도구 ${hrefs.length} · 날짜 ${Object.keys(addedAt).length} · 미커밋 ${missing} · 옛 경로 반영 ${moved}`)
console.log(`[gen-site-dates] legalUpdated ${out.legalUpdated} · goldenUpdated ${out.goldenUpdated}`)
console.log('[gen-site-dates] 월별 공개 수', byMonth)
if (DRY) process.exit(0)
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
console.log(`[gen-site-dates] ${OUT} 기록`)
