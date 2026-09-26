#!/usr/bin/env node
// scripts/redesign-codemod.mjs — youtil.kr 리디자인 코드모드 (정규식, 규칙별 단계 실행)
// 사용: node scripts/redesign-codemod.mjs --rules=F,S,C [--write] [--root=.]
//   기본은 dry-run: 파일을 쓰지 않고 규칙별 치환 수·파일 수·잔여 수만 출력한다. --write 일 때만 기록.
//   규칙: F 폰트 · S 하늘색 rgba · C 청록 rgba · H 레거시 hex→원시 토큰 · A 구 브랜드 hex→accent · R radius 토큰
//         W 페이지 래퍼→<ToolPage> · G 가이드 조판 인라인→클래스   (탐지만: D 헤더 · Q 인라인 FAQ · L/L1 관련 도구 · E 이모지)
// 한 PR = 한 규칙(또는 F+토큰). 적용 후 반드시: npx tsc --noEmit && npm run build && node scripts/check-overflow.mjs
// ⚠ 커밋 제목에 [skip-lastmod]를 넣는다(또는 해시를 .lastmod-ignore에 등록). 이 코드모드는 page.tsx 200개를 기계적으로 건드리므로,
//   빠뜨리면 전 도구의 '최종 업데이트'·JSON-LD dateModified·sitemap lastmod가 코드모드 날짜로 바뀐다(scripts/build-tool-meta.mjs·gen-lastmod.mts).
//   실제 내용 변경(감사 수정 등)과 같은 커밋에 섞지 말고 따로 커밋한 뒤, 리디자인 커밋에만 [skip-lastmod]를 붙인다.
//
// 레포 이식 메모(2026-09-26, 스펙 원본 대비):
//   · 대상 파일 = git 추적 + 미추적(.gitignore 제외) — 새 도구 페이지도 포함
//   · W: import 삽입을 '마지막 import 문 뒤'로(여러 줄 import { … } 안에 끼어들던 원본 정규식 수정),
//        여는/닫는 태그 중 한쪽만 맞는 페이지는 기록하지 않고 목록으로 보고(W-불일치)
//   · W 결과물은 <ToolPage width slug> — components/ToolPage.tsx가 children을 수정 없이 구조화한다
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1]
const WRITE = process.argv.includes('--write')
const ROOT = arg('root') || process.cwd()
const RULES = (arg('rules') || 'F,S,C,H,A,R,W,G,D,Q,L,L1,E').split(',')

const files = [...new Set(execSync(`git ls-files -co --exclude-standard -- 'app/**' 'components/**' 'lib/**'`, { cwd: ROOT }).toString().trim().split('\n'))]
  .filter(f => /\.(tsx|ts|css)$/.test(f))

// ── 제외 목록 (H·A·S·C 색 규칙) ─────────────────────────────
// ① 색 문자열 뒤에 알파 2자리를 붙이는 파일: `${c}22`, c + '22', '#DC262644' — var()에는 붙일 수 없음 → 수동 color-mix 전환
const ALPHA_CONCAT = /\$\{[^}]+\}[0-9A-Fa-f]{2}\b|\+\s*'[0-9A-Fa-f]{2}'|#[0-9A-Fa-f]{6}[0-9A-Fa-f]{2}\b/
// ② 색 자체가 데이터·결과인 도구, OG 이미지(next/og는 CSS 변수 불가), 캔버스
const DATA_TOOLS = /app\/tools\/art\/(color|gradient|paint-mix|palette|contrast)|app\/tools\/life\/lotto|app\/tools\/dev\/(color|css)|opengraph|\/icon\./
const CANVAS = /\b(fillStyle|strokeStyle|addColorStop|ctx\.font)\b/
// ③ 토큰 정의 파일 — hex를 var(--같은 이름)으로 바꾸면 '--red-600: var(--red-600)' 순환이 되어 사이트 전체 색이 무효가 된다(a58f4f3 사고)
const TOKEN_DEFS = /^app\/(globals\.css|styles\/)/
const colorExcluded = (f, s) => TOKEN_DEFS.test(f) || ALPHA_CONCAT.test(s) || DATA_TOOLS.test(f) || CANVAS.test(s)

const pct = a => `${Math.round(parseFloat(a) * 100)}%`
const PRIM = { DC2626: 'red-600', '059669': 'emerald-600', EA580C: 'orange-600', '0891B2': 'cyan-600', A16207: 'yellow-700', '0D9488': 'teal-600',
  D97706: 'amber-600', '0EA5E9': 'sky-500', '9333EA': 'purple-600', DB2777: 'pink-600', '9B59B6': 'amethyst', '0F766E': 'teal-700' }
const RADIUS = { 8: 's', 12: 'm', 14: 'card', 16: 'card', 20: 'lg', 999: 'pill' }

const R = {
  F: { tsx: [
    // mono 먼저(따옴표 무관·같은 따옴표로 닫힘) → sans
    [/fontFamily:\s*(['"`])(?:(?!\1).)*?(?:JetBrains Mono|SF Mono|Menlo|Consolas|monospace)(?:(?!\1).)*?\1/g, () => "fontFamily: 'var(--font-mono)'"],
    [/fontFamily:\s*(['"`])(?:(?!\1).)*?(?:Inter|Noto Sans KR|Pretendard|system-ui|Apple SD Gothic Neo|sans-serif)(?:(?!\1).)*?\1/g, () => "fontFamily: 'var(--font-sans)'"],
    // SVG 표현 속성 fontFamily="…"/{'…'} 는 삭제 → 부모 CSS(var(--font-sans)) 상속
    [/\s+fontFamily=(?:\{\s*)?(['"])(?:(?!\1).)*?(?:Inter|Noto Sans KR|system-ui|sans-serif)(?:(?!\1).)*?\1(?:\s*\})?/g, () => ''],
    // 삼항 등 남은 문자열 리터럴 — 알려진 스택만
    [/(['"])(?:Inter, "Noto Sans KR", system-ui, sans-serif|Noto Sans KR, sans-serif|'?Noto Sans KR'?, sans-serif|Inter, system-ui, sans-serif)\1/g, () => "'var(--font-sans)'"],
  ], css: [
    [/font-family:\s*'Inter',\s*'SF Mono'[^;]*;/g, () => 'font-family: var(--font-num);'],       // 숫자 표시용 — 모노로 바뀌지 않게 먼저
    [/font-family:\s*[^;{}]*(?:JetBrains Mono|SF Mono|Menlo|Consolas|monospace)[^;{}]*;/g, () => 'font-family: var(--font-mono);'],
    [/font-family:\s*[^;{}]*(?:Inter|Noto Sans KR|system-ui|sans-serif)[^;{}]*;/g, () => 'font-family: var(--font-sans);'],
  ] },
  S: { color: true, any: [
    [/rgba\(\s*(?:14,\s*165,\s*233|2,\s*132,\s*199)\s*,\s*(0?\.\d+|1)\s*\)/g, (_, a) => `color-mix(in srgb, var(--accent) ${pct(a)}, transparent)`],
  ] },
  C: { color: true, any: [ // 청록 516곳은 데이터 계열 — accent가 아니라 원시 토큰으로(의미 보존)
    [/rgba\(\s*8,\s*145,\s*178\s*,\s*(0?\.\d+|1)\s*\)/g, (_, a) => `color-mix(in srgb, var(--cyan-600) ${pct(a)}, transparent)`],
  ] },
  H: { color: true, any: [
    [new RegExp(`#(${Object.keys(PRIM).join('|')})\\b(?![0-9A-Fa-f])`, 'gi'), (_, h) => `var(--${PRIM[h.toUpperCase()]})`],
  ] },
  A: { color: true, any: [ // 구 브랜드(sky-600/700)는 의미가 브랜드이므로 바로 토큰
    [/#0284C7\b(?![0-9A-Fa-f])/gi, () => 'var(--accent)'], [/#0369A1\b(?![0-9A-Fa-f])/gi, () => 'var(--accent-ink)'],
  ] },
  R: { tsx: [
    [/borderRadius:\s*'?(\d+)(?:px)?'?(?=\s*[,}])/g, (m, n) => RADIUS[n] ? `borderRadius: 'var(--radius-${RADIUS[n]})'` : m],
  ], css: [
    [/border-radius:\s*(\d+)px;/g, (m, n) => RADIUS[n] ? `border-radius: var(--radius-${RADIUS[n]});` : m],
  ] },
  W: { page: true, tsx: [
    [/<div style=\{\{ maxWidth: '(760|880)px', margin: '0 auto', padding: '60px 24px 80px' \}\}>/, (_, w, f) => `<ToolPage width={${w}} slug="${f}">`],
    [/\n    <\/div>\n  \)\n\}(\s*)$/, (_, ws) => `\n    </ToolPage>\n  )\n}${ws}`],
  ] },
  G: { page: true, tsx: [
    [/<h2 style=\{\{ fontFamily: '[^']*', fontSize: '(?:20|22)px', fontWeight: 700, marginBottom: '\d+px' \}\}>/g, () => '<h2 className="g-h2">'],
    [/<p style=\{\{ fontSize: '14px', color: 'var\(--muted\)', lineHeight: 1\.\d+(?:, marginBottom: '\d+px')? \}\}>/g, () => '<p className="g-p">'],
    [/<div style=\{\{ overflowX: 'auto'(?:, marginBottom: '(\d+)px')? \}\}>/g, (_, mb) => mb ? `<div className="tableScroll" style={{ marginBottom: '${mb}px' }}>` : '<div className="tableScroll">'],
  ] },
}
const DETECT = {
  D: /<p style=\{\{ fontSize: '12px', color: 'var\(--muted\)', letterSpacing: '0\.08em', textTransform: 'uppercase', marginBottom: '10px' \}\}>\s*[^<]+?\s*<\/p>\s*<h1 style=\{\{[^}]*\}\}>\s*<ToolIconBadge catId="\w+" \/>[^<]+?<\/h1>/g,
  Q: /<FaqJsonLd items=\{(\w+)\} \/>\s*(?:<div style=\{\{[^}]*\}\}>\s*)?\{\s*\1\.map\(/g,
  L: /함께 쓰면 좋은 (?:도구|계산기)<\/h2>\s*<(?:div|ul)\b/g,          // 전체(그리드 98 + 목록형 등)
  L1: /함께 쓰면 좋은 도구<\/h2>\s*<div style=\{\{[^}]*gridTemplateColumns[^}]*\}\}>\s*\{\s*\[/g, // 배열 리터럴 그리드 — AST 기계 변환 가능
  E: /💡|⚠️/g,
}

const stats = {}; const add = (k, n, f) => { stats[k] ??= { n: 0, files: new Set() }; stats[k].n += n; if (n) stats[k].files.add(f) }
const wMismatch = []
/** 마지막 import 문 끝 위치 — 여러 줄 import { … } from '…' 포함 */
function afterLastImport(s) {
  let end = -1
  for (const m of s.matchAll(/^import\s[\s\S]*?['"][^'"\n]+['"];?[ \t]*$/gm)) end = m.index + m[0].length
  return end
}
let written = 0
for (const f of files) {
  let src
  try { src = readFileSync(join(ROOT, f), 'utf8') } catch { continue } // 삭제 중인 파일
  let s = src
  const isCss = f.endsWith('.css'), isPage = /^app\/tools\/[^/]+\/[^/]+\/page\.tsx$/.test(f)
  const slug = isPage ? '/' + f.replace(/^app\//, '').replace(/\/page\.tsx$/, '') : ''
  for (const k of RULES) {
    if (DETECT[k]) { if (!isCss) add(k, (s.match(DETECT[k]) || []).length, f); continue }
    const r = R[k]; if (!r) continue
    if (r.page && !isPage) continue
    if (r.color && colorExcluded(f, s)) { add(k + '(제외 파일)', 1, f); continue }
    const list = r.any || (isCss ? r.css : r.tsx) || []
    if (k === 'W') {
      // 여는 태그·닫는 태그가 둘 다 맞을 때만 적용(한쪽만 바꾸면 JSX가 깨진다)
      const [[openRe, openFn], [closeRe, closeFn]] = list
      const o = openRe.test(s), c = closeRe.test(s)
      if (s.includes("from '@/components/ToolPage'")) continue // 이미 적용됨
      if (o !== c || (!o && isPage)) { wMismatch.push(`${f} (여는 태그 ${o ? 'O' : 'X'} · 닫는 태그 ${c ? 'O' : 'X'})`); continue }
      s = s.replace(openRe, (...m) => { add(k, 1, f); return openFn(...m.slice(0, -2), slug) })
      s = s.replace(closeRe, (...m) => { add(k, 1, f); return closeFn(...m.slice(0, -2), slug) })
      const at = afterLastImport(s)
      s = at < 0 ? `import ToolPage from '@/components/ToolPage'\n${s}` : `${s.slice(0, at)}\nimport ToolPage from '@/components/ToolPage'${s.slice(at)}`
      continue
    }
    for (const [re, fn] of list) s = s.replace(re, (...m) => { add(k, 1, f); return fn(...m.slice(0, -2), slug) })
  }
  if (WRITE && s !== src) { writeFileSync(join(ROOT, f), s); written++ }
}
// 잔여 지표 (gate)
const resid = { font: 0, sky: 0, cyan: 0, guideP: 0 }
if (!WRITE) for (const f of files) {
  let s
  try { s = readFileSync(join(ROOT, f), 'utf8') } catch { continue }
  resid.font += (s.match(/Inter\b|Noto Sans KR/g) || []).length
  resid.sky += (s.match(/rgba\(\s*(?:14,\s*165,\s*233|2,\s*132,\s*199)/g) || []).length
  resid.cyan += (s.match(/rgba\(\s*8,\s*145,\s*178/g) || []).length
  resid.guideP += (s.match(/<p style=\{\{ fontSize: '14px', color: 'var\(--muted\)'/g) || []).length
}
console.log(WRITE ? `written files: ${written}` : 'DRY-RUN (파일 미수정)')
if (WRITE && written > 0) console.log('⚠ 커밋 제목에 [skip-lastmod]를 넣으세요 — 내용 변경 커밋과 분리. 커밋 후 node scripts/build-tool-meta.mjs --write 로 lib/toolMeta.data.json 갱신')
for (const [k, v] of Object.entries(stats)) console.log(`${k.padEnd(10)} ${String(v.n).padStart(6)}  files ${v.files.size}`)
if (!WRITE) console.log('현재 잔여(적용 전 기준):', resid)
if (RULES.includes('W')) {
  const pages = files.filter(f => /^app\/tools\/[^/]+\/[^/]+\/page\.tsx$/.test(f)).length
  console.log(`W 대상 도구 페이지 ${pages} · 적용 ${stats.W ? stats.W.files.size : 0} · 불일치 ${wMismatch.length}`)
  for (const m of wMismatch) console.log(`  ! W-불일치 ${m}`)
}
