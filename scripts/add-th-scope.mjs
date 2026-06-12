#!/usr/bin/env node
/**
 * th scope codemod — <thead> 내부의 <th>에 scope="col" 주입.
 *
 * 기계적·무위험 범위만:
 *  - <thead>…</thead> 블록 안의 <th ...>만 대상 (열 머리글 확정).
 *  - 이미 scope= 가 있으면 건너뜀.
 *  - tbody 안 행 라벨 th(scope="row")는 구조 판단이 필요하므로 제외.
 *
 * 사용: node scripts/add-th-scope.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = '/Users/riemann/toolify'
const DRY = process.argv.includes('--dry')

const files = execSync(`find "${ROOT}/app" "${ROOT}/components" -name "*.tsx"`)
  .toString().trim().split('\n').filter(Boolean).sort()

/** startIdx('<')부터 따옴표/중괄호 인식하며 태그 닫는 '>' 인덱스 반환. 실패 시 -1 */
function findTagEnd(src, startIdx) {
  let brace = 0
  let quote = null
  for (let i = startIdx + 1; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue }
    if (c === '{') brace++
    else if (c === '}') brace--
    else if (c === '>' && brace === 0) return i
  }
  return -1
}

let totalTags = 0
let totalFiles = 0
let skippedWithScope = 0
let skippedTemplate = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  if (!src.includes('<thead')) continue

  let out = ''
  let cursor = 0
  let changed = 0

  while (true) {
    const theadOpen = src.indexOf('<thead', cursor)
    if (theadOpen === -1) break
    const theadClose = src.indexOf('</thead>', theadOpen)
    if (theadClose === -1) break // 비정상 — 통째로 건너뜀

    out += src.slice(cursor, theadOpen)
    let region = src.slice(theadOpen, theadClose)

    // 문자열 리터럴로 HTML을 생성하는 코드(도구 출력물) 보호 —
    // <thead 가 있는 줄의 앞부분에 백틱이 홀수 개면 템플릿 리터럴 내부로 판단해 건너뜀
    const lineStart = src.lastIndexOf('\n', theadOpen) + 1
    const linePrefix = src.slice(lineStart, theadOpen)
    const backticks = (linePrefix.match(/`/g) || []).length
    if (backticks % 2 === 1) {
      skippedTemplate++
      out += region
      cursor = theadClose
      continue
    }

    // region 내 <th(공백/'>'/'/' 뒤따름) 탐색 — <thead> 자신은 제외
    let r = ''
    let ri = 0
    while (true) {
      const m = region.slice(ri).search(/<th[\s>/]/)
      if (m === -1) break
      const thIdx = ri + m
      // <thead 재출현 방지
      if (region.startsWith('<thead', thIdx)) {
        r += region.slice(ri, thIdx + 6)
        ri = thIdx + 6
        continue
      }
      const tagEnd = findTagEnd(region, thIdx)
      if (tagEnd === -1) { r += region.slice(ri, thIdx + 3); ri = thIdx + 3; continue }
      const openTag = region.slice(thIdx, tagEnd + 1)
      if (/\bscope\s*=/.test(openTag)) {
        skippedWithScope++
        r += region.slice(ri, tagEnd + 1)
        ri = tagEnd + 1
        continue
      }
      // <th 바로 뒤에 scope="col" 삽입
      r += region.slice(ri, thIdx) + '<th scope="col"' + region.slice(thIdx + 3, tagEnd + 1)
      ri = tagEnd + 1
      changed++
    }
    r += region.slice(ri)
    out += r
    cursor = theadClose
  }
  out += src.slice(cursor)

  if (changed > 0) {
    totalTags += changed
    totalFiles++
    console.log(`${file.replace(ROOT + '/', '')}: ${changed}개`)
    if (!DRY) writeFileSync(file, out)
  }
}

console.log(`\n합계: ${totalFiles}개 파일, ${totalTags}개 th에 scope="col" 주입 (이미 scope 있음 ${skippedWithScope}개 · 백틱 region ${skippedTemplate}개 건너뜀)${DRY ? ' [dry-run]' : ''}`)
