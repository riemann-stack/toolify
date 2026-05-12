#!/usr/bin/env node
/**
 * 모바일 touch 환경에서 :hover 상태가 잔존해 .active 색상을 덮어쓰는 문제를
 * 방지하기 위해, 모든 CSS 파일의 :hover 규칙을 @media (hover: hover) 로 감싼다.
 *
 * 이미 감싸진 규칙(이미 부모가 @media (hover: hover))은 다시 감싸지 않는다.
 * 일회성 마이그레이션 스크립트 — 결과만 보고 결정.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = '/Users/riemann/toolify'
const HOVER_MARKER = '/* @hover-wrapped */'

function listCssFiles() {
  const out = execSync(
    `find "${ROOT}/app" "${ROOT}/components" -type f \\( -name "*.css" -o -name "*.module.css" \\) 2>/dev/null`,
  ).toString()
  return out.trim().split('\n').filter(Boolean)
}

/**
 * @hover 가 포함된 selector 의 rule 블록을 찾아 @media (hover: hover) 로 감싼다.
 * @media 블록 내부 규칙도 처리한다 (단, 이미 (hover: hover) 안이면 skip).
 */
function transformCss(src) {
  if (src.includes(HOVER_MARKER)) return src // 이미 처리됨

  const out = []
  let i = 0
  const len = src.length

  // 현재 위치가 (hover: hover) @media 블록 내부인지 추적 — 단순화: depth 스택
  const stack = [] // 'media-hover-hover' or 'other'

  while (i < len) {
    // @media 블록 시작?
    if (src[i] === '@') {
      const atRuleEnd = src.indexOf('{', i)
      if (atRuleEnd === -1) {
        out.push(src.slice(i))
        break
      }
      const header = src.slice(i, atRuleEnd)
      const isHoverHoverMedia = /^@media[^{]*\bhover\s*:\s*hover\b/i.test(header)
      out.push(src.slice(i, atRuleEnd + 1))
      stack.push(isHoverHoverMedia ? 'media-hover-hover' : 'other-at')
      i = atRuleEnd + 1
      continue
    }

    // 닫는 중괄호 — at-rule 스택에서 pop
    if (src[i] === '}') {
      if (stack.length > 0) stack.pop()
      out.push(src[i])
      i++
      continue
    }

    // 일반 rule 시작: selector { ... } 형태 찾기
    // selector 종료는 `{` 또는 `;` 또는 `}` 까지
    // 여기서 ; 나 } 만나면 그냥 출력하고 진행
    const nextOpen = src.indexOf('{', i)
    const nextSemi = src.indexOf(';', i)
    const nextClose = src.indexOf('}', i)

    const stops = [nextOpen, nextSemi, nextClose].filter(x => x >= 0)
    if (stops.length === 0) {
      out.push(src.slice(i))
      break
    }
    const nextStop = Math.min(...stops)
    if (src[nextStop] !== '{') {
      // selector 가 아니라 그냥 토큰
      out.push(src.slice(i, nextStop + 1))
      i = nextStop + 1
      continue
    }

    // rule 블록 발견
    const selector = src.slice(i, nextStop)
    // 매칭하는 } 찾기 (rule 내부에는 중괄호가 없다고 가정 — module CSS 표준)
    let depth = 1
    let j = nextStop + 1
    while (j < len && depth > 0) {
      if (src[j] === '{') depth++
      else if (src[j] === '}') depth--
      if (depth === 0) break
      j++
    }
    if (j >= len) {
      out.push(src.slice(i))
      break
    }

    const body = src.slice(nextStop, j + 1) // {...}
    const hasHover = /:hover\b/.test(selector)
    const insideHoverMedia = stack.includes('media-hover-hover')

    if (hasHover && !insideHoverMedia) {
      // 들여쓰기 추출 (selector 시작 직전의 공백)
      const leadingWs = (src.slice(0, i).match(/[ \t]*$/) || [''])[0]
      out.push(`@media (hover: hover) {\n${leadingWs}  ${selector.trimStart()}${body}\n${leadingWs}}`)
    } else {
      out.push(selector + body)
    }
    i = j + 1
  }

  return HOVER_MARKER + '\n' + out.join('')
}

const files = listCssFiles()
let modified = 0
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const transformed = transformCss(src)
  if (transformed !== src) {
    writeFileSync(file, transformed)
    modified++
  }
}
console.log(`Processed ${files.length} files, modified ${modified}.`)
