#!/usr/bin/env node
/**
 * "함께 쓰면 좋은 도구" 섹션 그리드를 항상 2열로 통일.
 * - 페이지 별로 해당 h2 텍스트가 등장한 뒤 가장 가까운 gridTemplateColumns 한 곳을 치환.
 * - 기존 패턴은 보통 repeat(auto-fit, minmax(NNNpx, 1fr)) 인데 모바일에서 1열로 축소되는 문제 해결.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = '/Users/riemann/toolify'

function listPages() {
  const out = execSync(
    `grep -rl "함께 쓰면 좋은 도구" "${ROOT}/app/tools" 2>/dev/null || true`,
  ).toString()
  return out.trim().split('\n').filter(Boolean)
}

let modified = 0
for (const file of listPages()) {
  const src = readFileSync(file, 'utf8')
  const idx = src.indexOf('함께 쓰면 좋은 도구')
  if (idx < 0) continue

  const before = src.slice(0, idx)
  const after = src.slice(idx)

  // after 안에서 첫 번째 gridTemplateColumns 위치 찾기
  const gtcRe = /gridTemplateColumns:\s*['"`]([^'"`]+)['"`]/
  const m = after.match(gtcRe)
  if (!m) continue
  const matchStart = after.indexOf(m[0])
  // 이미 repeat(2, 1fr) 인 경우 skip
  if (/repeat\(\s*2\s*,\s*1fr\s*\)/.test(m[1])) continue
  // 길이가 너무 멀면 (1000자 초과) 잘못 매칭일 가능성이 있어 skip
  if (matchStart > 2000) continue

  const replaced = after.replace(gtcRe, `gridTemplateColumns: 'repeat(2, 1fr)'`)
  writeFileSync(file, before + replaced)
  modified++
  console.log(`fixed: ${file.replace(ROOT + '/', '')}`)
}
console.log(`Total modified: ${modified}`)
