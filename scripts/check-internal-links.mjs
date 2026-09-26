// 내부 도구 링크 ↔ lib/tools.ts 레지스트리 대조 — 깨진 /tools/* 링크 검출 (커밋 전 게이트용)
// 사용: node scripts/check-internal-links.mjs (오류 시 exit 1)
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const registry = readFileSync('lib/tools.ts', 'utf8')
const valid = new Set([...registry.matchAll(/href: '(\/tools\/[a-z-]+\/[a-z0-9-]+)'/g)].map(m => m[1]))

// 업데이트 기록(/updates)은 통폐합 이전 항목의 옛 도구 href를 기록 그대로 둔다 (화면에서는 레지스트리에 없는 href를 링크 없이 뺀다).
// 이 파일만 next.config.ts의 영구 리다이렉트 source(옛 주소)를 허용 — 오타·없는 주소는 여기서도 잡힌다.
const HISTORY_FILES = new Set([join('app', '_trust', 'updatesData.ts')])
const redirectSources = new Set(
  [...readFileSync('next.config.ts', 'utf8').matchAll(/source:\s*'(\/tools\/[a-z-]+\/[a-z0-9-]+)'/g)].map(m => m[1]),
)

const bad = []
function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) { if (!/node_modules|\.next/.test(p)) scan(p) }
    else if (/\.(tsx|ts)$/.test(name)) {
      const src = readFileSync(p, 'utf8')
      const history = HISTORY_FILES.has(p)
      for (const m of src.matchAll(/['"](\/tools\/[a-z-]+\/[a-z0-9-]+)['"]/g)) {
        if (valid.has(m[1]) || (history && redirectSources.has(m[1]))) continue
        bad.push(`${p}: ${m[1]}`)
      }
    }
  }
}
scan('app')
scan('components')
scan('lib')
if (bad.length) {
  console.error(`깨진 내부 도구 링크 ${bad.length}건:`)
  bad.forEach(b => console.error('  ' + b))
  process.exit(1)
}
console.log(`내부 도구 링크 정상 — 레지스트리 ${valid.size}개 경로 기준`)
