#!/usr/bin/env node
/**
 * 폼 라벨 프로그램적 연결 codemod — label htmlFor ↔ input/select id 쌍 주입.
 *
 * 보수적 매칭만 자동화:
 *  - 텍스트를 가진 <label>(htmlFor 없음) 바로 다음(같은 카드 내, 300자 이내)에
 *    나오는 첫 <input>/<select> 가 구조적으로 모호하지 않은 경우만 변환.
 *  - 건너뜀: 이미 htmlFor/id/aria-label(ledby) 있는 곳, checkbox/radio/hidden,
 *    label 내부에 컨트롤이 든 암묵 연결(checkLabel 패턴), label 하나에 컨트롤 여러 개,
 *    .map( 콜백 내부(정적 id가 중복 렌더됨), label-컨트롤 사이에 button/textarea 개입.
 *  - id 형식: {도구slug}-{라벨 영문화 또는 f순번}, 디렉터리(=페이지) 내 유니크 보장.
 *
 * 사용: node scripts/add-input-labels.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = '/Users/riemann/toolify'
const DRY = process.argv.includes('--dry')

const files = execSync(`find "${ROOT}/app/tools" -name "*Client.tsx"`)
  .toString().trim().split('\n').filter(Boolean).sort()

// ── 파서 유틸 ────────────────────────────────────────────────────────────────

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

/** 따옴표/주석 인식 괄호 매칭: openParenIdx('(')의 짝 ')' 인덱스. 실패 시 -1 */
function findParenClose(src, openParenIdx) {
  let depth = 0
  let quote = null
  for (let i = openParenIdx; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) return -1; continue }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; if (i < 1) return -1; continue }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue }
    if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return i }
  }
  return -1
}

/** .map( 콜백 범위 목록 — 이 안의 label은 변환 금지(정적 id 중복 위험) */
function mapRanges(src) {
  const ranges = []
  const re = /\.map\s*\(/g
  let m
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1
    const close = findParenClose(src, open)
    ranges.push([open, close < 0 ? src.length : close]) // 매칭 실패 시 보수적으로 EOF까지
  }
  return ranges
}

/** label 내부 텍스트에서 보이는 글자 추출 ({...} 표현식·태그 제거) */
function visibleText(inner) {
  let out = ''
  let brace = 0
  let inTag = false
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (brace > 0) { if (c === '{') brace++; else if (c === '}') brace--; continue }
    if (c === '{') { brace = 1; continue }
    if (c === '<') { inTag = true; continue }
    if (c === '>') { inTag = false; continue }
    if (!inTag) out += c
  }
  return out.replace(/\s+/g, ' ').trim()
}

// 한글 라벨 → 영문 필드명 (대표어만, 못 찾으면 순번)
const DICT = [
  ['원금', 'principal'], ['금리', 'rate'], ['이자율', 'rate'], ['이자', 'interest'],
  ['거치', 'grace'], ['기간', 'period'], ['개월', 'months'], ['연도', 'year'], ['년도', 'year'],
  ['보증금', 'deposit'], ['월세', 'rent'], ['전세', 'jeonse'], ['관리비', 'fee'],
  ['금액', 'amount'], ['가격', 'price'], ['비용', 'cost'], ['예산', 'budget'],
  ['연봉', 'salary'], ['월급', 'salary'], ['소득', 'income'], ['매출', 'revenue'], ['수입', 'income'],
  ['저축', 'saving'], ['적금', 'saving'], ['예금', 'deposit'], ['투자', 'invest'], ['수익률', 'yield'],
  ['나이', 'age'], ['연령', 'age'], ['생년', 'birth'], ['키', 'height'], ['신장', 'height'],
  ['몸무게', 'weight'], ['체중', 'weight'], ['체지방', 'bodyfat'],
  ['날짜', 'date'], ['시간', 'time'], ['시각', 'time'], ['요일', 'day'],
  ['시작', 'start'], ['종료', 'end'], ['목표', 'goal'], ['현재', 'current'],
  ['인원', 'people'], ['수량', 'qty'], ['횟수', 'count'], ['개수', 'count'],
  ['거리', 'distance'], ['속도', 'speed'], ['온도', 'temp'], ['무게', 'weight'],
  ['넓이', 'area'], ['면적', 'area'], ['평수', 'area'], ['높이', 'height'], ['너비', 'width'], ['길이', 'length'],
  ['비율', 'ratio'], ['할인', 'discount'], ['세율', 'taxrate'], ['환율', 'fx'], ['단위', 'unit'],
  ['이름', 'name'], ['제목', 'title'], ['텍스트', 'text'], ['메모', 'memo'], ['색상', 'color'],
]

function fieldName(text, seq) {
  // 1) ASCII 단어가 있으면 그대로 (예: "CSS 픽셀" → css)
  const ascii = (text.toLowerCase().match(/[a-z][a-z0-9]+/g) || []).join('-').slice(0, 24)
  if (ascii.length >= 2) return ascii.replace(/-+$/, '')
  // 2) 사전 매칭
  for (const [ko, en] of DICT) if (text.includes(ko)) return en
  // 3) 순번
  return `f${seq}`
}

// ── 본 처리 ──────────────────────────────────────────────────────────────────

const stats = {
  converted: 0,
  skipAlreadyLinked: 0,   // htmlFor 또는 input id/aria-label 기존재
  skipImplicit: 0,        // label이 컨트롤을 감싸는 암묵 연결 (checkbox 등)
  skipNoText: 0,          // 보이는 텍스트 없음(동적 라벨)
  skipNoControl: 0,       // 다음 label 전까지 input/select 없음 (섹션 제목용 label)
  skipMultiControl: 0,    // label 하나에 컨트롤 여러 개 → 모호
  skipInterposed: 0,      // 사이에 button/textarea/.map( 개입
  skipTooFar: 0,          // 첫 컨트롤이 300자 초과 거리
  skipCheckRadio: 0,      // checkbox/radio/hidden
  skipInsideMap: 0,       // .map( 콜백 내부
  filesModified: 0,
}

const usedIdsByDir = new Map() // 디렉터리(=페이지) 단위 id 유니크 보장

// 디렉터리별 기존 id 선수집
for (const file of files) {
  const dir = path.dirname(file)
  if (!usedIdsByDir.has(dir)) usedIdsByDir.set(dir, new Set())
  const set = usedIdsByDir.get(dir)
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(/\sid=["']([^"']+)["']/g)) set.add(m[1])
}

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  if (!/<label[\s>]/.test(src)) continue
  const dir = path.dirname(file)
  const slug = path.basename(dir)
  const used = usedIdsByDir.get(dir)
  const maps = mapRanges(src)
  const insideMap = (idx) => maps.some(([a, b]) => idx > a && idx < b)

  const edits = [] // { at, insert }
  let seq = 0

  const labelRe = /<label(?=[\s>])/g
  let lm
  while ((lm = labelRe.exec(src))) {
    const lStart = lm.index
    const lOpenEnd = findTagEnd(src, lStart)
    if (lOpenEnd < 0) continue
    const openTag = src.slice(lStart, lOpenEnd + 1)
    if (/\bhtmlFor\s*=/.test(openTag)) { stats.skipAlreadyLinked++; continue }

    const lClose = src.indexOf('</label>', lOpenEnd)
    if (lClose < 0) continue
    const inner = src.slice(lOpenEnd + 1, lClose)
    if (/<label[\s>]/.test(inner)) continue // 중첩 label — 비정상, 건너뜀
    if (/<(input|select|textarea)\b/.test(inner)) { stats.skipImplicit++; continue }

    const text = visibleText(inner)
    if (!/[0-9A-Za-z가-힣]/.test(text)) { stats.skipNoText++; continue }

    if (insideMap(lStart)) { stats.skipInsideMap++; continue }

    // 다음 label 전까지가 이 label의 관할 구간
    const after = lClose + '</label>'.length
    const nextLabel = src.slice(after).search(/<label[\s>]/)
    const windowEnd = nextLabel < 0 ? src.length : after + nextLabel
    const win = src.slice(after, windowEnd)

    const ctrls = [...win.matchAll(/<(input|select)\b/g)]
    if (ctrls.length === 0) { stats.skipNoControl++; continue }
    if (ctrls.length > 1) { stats.skipMultiControl++; continue }

    const ctrlOff = ctrls[0].index
    if (ctrlOff > 300) { stats.skipTooFar++; continue }
    const between = win.slice(0, ctrlOff)
    if (/<(button|textarea)\b/.test(between) || between.includes('.map(')) {
      stats.skipInterposed++; continue
    }

    const ctrlStart = after + ctrlOff
    const ctrlOpenEnd = findTagEnd(src, ctrlStart)
    if (ctrlOpenEnd < 0) continue
    const ctrlTag = src.slice(ctrlStart, ctrlOpenEnd + 1)
    if (/\sid\s*=/.test(ctrlTag) || /aria-label(ledby)?\s*=/.test(ctrlTag)) {
      stats.skipAlreadyLinked++; continue
    }
    if (/type=["'](checkbox|radio|hidden)["']/.test(ctrlTag)) { stats.skipCheckRadio++; continue }
    if (insideMap(ctrlStart)) { stats.skipInsideMap++; continue }

    // id 생성 — 페이지(디렉터리) 내 유니크
    seq++
    let id = `${slug}-${fieldName(text, seq)}`
    if (used.has(id)) { let n = 2; while (used.has(`${id}-${n}`)) n++; id = `${id}-${n}` }
    used.add(id)

    edits.push({ at: lOpenEnd, insert: ` htmlFor="${id}"` })
    edits.push({ at: ctrlStart + ctrls[0][0].length, insert: ` id="${id}"` })
    stats.converted++
  }

  if (edits.length) {
    let out = src
    edits.sort((a, b) => b.at - a.at)
    for (const e of edits) out = out.slice(0, e.at) + e.insert + out.slice(e.at)
    if (!DRY) writeFileSync(file, out)
    stats.filesModified++
    console.log(`${DRY ? '[dry] ' : ''}${file.replace(ROOT + '/', '')}: +${edits.length / 2}`)
  }
}

console.log('\n── 결과 ──')
for (const [k, v] of Object.entries(stats)) console.log(`${k}: ${v}`)
