#!/usr/bin/env node
// scripts/check-content-slots.mjs — 도구 페이지 '콘텐츠 슬롯' 최소선 점검 (읽기 전용). AdSense 재신청 전 게이트.
// 최소선: 리드 1 · 가이드 h2 ≥3 · 데이터 표 ≥1 · FAQ ≥4 · 공식 출처 ≥1 · 가이드 본문 ≥1,200자
// 사용: node scripts/check-content-slots.mjs [--root=.] [--json]
// 출처 수: lib/toolMeta.data.json(= <UpdatedMeta>·<Disclaimer> 출처, build-tool-meta.mjs 생성)이 있으면 그 값, 없으면 페이지의 sources={…} href 수.
// 리드: 레거시 <h1>…</h1><p> 또는 <ToolHeader lead=…>. 읽기 전용 — 파일을 쓰지 않는다.
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1]
const ROOT = arg('root') || process.cwd()
const pages = []
for (const c of readdirSync(join(ROOT, 'app/tools'))) {
  if (c.startsWith('[') || c.startsWith('_')) continue
  let ds = []; try { ds = readdirSync(join(ROOT, 'app/tools', c)) } catch { continue }
  for (const d of ds) { const f = `app/tools/${c}/${d}/page.tsx`; if (existsSync(join(ROOT, f))) pages.push(f) }
}
pages.sort()
let META = {}
try { META = JSON.parse(readFileSync(join(ROOT, 'lib/toolMeta.data.json'), 'utf8')) } catch { /* 없으면 페이지 기준 */ }

const rows = pages.map(f => {
  const s = readFileSync(join(ROOT, f), 'utf8')
  const gi = s.indexOf('<GuideDivider')
  const guide = gi < 0 ? '' : s.slice(gi)
  const text = guide
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')        // JSX 주석
    .replace(/style=\{\{[^}]*\}\}/g, '')               // 인라인 스타일
    .replace(/<[^>]+>/g, ' ').replace(/\{[^{}]*\}/g, ' ')
    .replace(/\s+/g, '')
  const faq = (s.match(/\bq:\s*['"`]/g) || []).length
  const page = '/' + f.replace(/^app\//, '').replace(/\/page\.tsx$/, '')
  const srcM = s.match(/sources=\{(\[[\s\S]*?\])\}/)
  const metaSrc = META[page] && Array.isArray(META[page].sources) ? META[page].sources.length : null
  const sources = metaSrc ?? (srcM ? (srcM[1].match(/href/g) || []).length : 0)
  const r = {
    page,
    lead: /<h1[\s\S]*?<\/h1>\s*<p\b/.test(s) || /<ToolHeader\b[\s\S]*?\blead=/.test(s) ? 1 : 0,
    h2: (guide.match(/<h2\b/g) || []).length - (/(자주 묻는 질문|함께 쓰면 좋은)/.test(guide) ? (guide.match(/<h2[^>]*>[^<]*(자주 묻는 질문|함께 쓰면 좋은)/g) || []).length : 0),
    tables: (guide.match(/<table\b/g) || []).length,
    faq, sources, chars: text.length,
  }
  r.miss = [r.lead < 1 && '리드', r.h2 < 3 && 'h2<3', r.tables < 1 && '표 없음', r.faq < 4 && 'FAQ<4', r.sources < 1 && '출처 없음', r.chars < 1200 && '본문<1200자'].filter(Boolean)
  return r
})
const thin = rows.filter(r => r.miss.length)
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0) }
const count = k => rows.filter(r => r.miss.includes(k)).length
console.log(`도구 페이지 ${rows.length}개 · 최소선 미달 ${thin.length}개`)
for (const k of ['리드', 'h2<3', '표 없음', 'FAQ<4', '출처 없음', '본문<1200자']) console.log(`  ${k.padEnd(10)} ${count(k)}`)
console.log('\n미달 항목 2개 이상 (통폐합·보강 1순위):')
for (const r of thin.filter(r => r.miss.length >= 2).sort((a, b) => b.miss.length - a.miss.length || a.chars - b.chars))
  console.log(`  ${r.page.padEnd(44)} ${String(r.chars).padStart(5)}자  ${r.miss.join(', ')}`)
