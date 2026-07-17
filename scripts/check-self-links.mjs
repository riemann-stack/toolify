#!/usr/bin/env node
/* ──────────────────────────────────────────────────────
   scripts/check-self-links.mjs
   Disclaimer의 related 목록이 자기 자신 페이지를 링크하는지 검사.

   왜 런타임이 아니라 스크립트인가:
   Disclaimer는 인터랙션이 없는 순수 서버 컴포넌트다(네이티브 <details>).
   usePathname()으로 걸러내려면 'use client'가 필요한데, 현재 서버에서
   렌더되는 38개 페이지가 전부 클라이언트 번들로 넘어간다 — self-link 하나
   막자고 치를 대가가 아니다. 저작 실수는 저작 시점에 잡는 게 맞다.

   사용:
     node scripts/check-self-links.mjs         # 검사 (문제 있으면 exit 1)
     node scripts/check-self-links.mjs --dry   # 검사만, 항상 exit 0
   ────────────────────────────────────────────────────── */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const TOOLS_DIR = join(ROOT, 'app/tools')
const dryRun = process.argv.includes('--dry')

/** app/tools 아래 .tsx 전부 */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.tsx')) out.push(full)
  }
  return out
}

/** app/tools/<cat>/<slug>/... → /tools/<cat>/<slug> */
function toolPathOf(file) {
  const m = relative(ROOT, file).match(/^app(\/tools\/[^/]+\/[^/]+)\//)
  return m ? m[1] : null
}

const offenders = []
for (const file of walk(TOOLS_DIR)) {
  const src = readFileSync(file, 'utf8')
  if (!src.includes('Disclaimer')) continue
  const self = toolPathOf(file)
  if (!self) continue
  // related={[{ href: '<self>', label: '...' }]} 형태만 본다
  const re = new RegExp(`href:\\s*'${self.replace(/[/-]/g, '\\$&')}'`, 'g')
  if (re.test(src)) offenders.push({ file: relative(ROOT, file), self })
}

if (offenders.length === 0) {
  console.log('✓ self-link 없음 — 모든 도구의 관련 도구 링크가 자기 자신을 가리키지 않습니다.')
  process.exit(0)
}

console.error(`✗ 자기 자신을 링크하는 도구 ${offenders.length}개:\n`)
for (const o of offenders) console.error(`  ${o.file}\n    → ${o.self}`)
console.error(`
관련 도구 슬롯을 자기 자신에 낭비하고 있습니다(내부 링크 SEO 손해 + UX 혼란).
지우지 말고 **같은 카테고리의 실제 관련 도구로 교체**하세요 (lib/tools.ts 참고).
슬롯을 그냥 비우면 3개가 2개로 줄어듭니다.`)

process.exit(dryRun ? 0 : 1)
