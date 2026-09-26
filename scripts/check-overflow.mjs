#!/usr/bin/env node
// scripts/check-overflow.mjs — 배포(또는 로컬) URL의 가로 넘침·폴드 지표 점검. PR 게이트.
// 사용: node scripts/check-overflow.mjs http://localhost:3000 /,/tools/finance,/tools/finance/salary
// 기준: 360·390·768·1024·1280에서 scrollWidth == innerWidth, 도구 페이지는 390에서 첫 입력·[role=status] top < 844
// 준비: playwright는 devDependency로만(npm i -D playwright && npx playwright install chromium). 서버는 별도로 띄운다(next start 등).
// 추가: 1280/1320에서 레일 표시 여부 · data-tool-region 1개 · role="status"가 도구 영역 밖에 없는지(주 결과 1곳 원칙) 보고
let chromium
try { ({ chromium } = await import('playwright')) } catch {
  console.error('playwright가 없습니다 — npm i -D playwright && npx playwright install chromium'); process.exit(2)
}

const [base = 'http://localhost:3000', list = '/,/tools,/tools/finance,/tools/finance/salary,/tools/health/bmi'] = process.argv.slice(2)
const WIDTHS = [360, 390, 768, 1024, 1280, 1320]
const b = await chromium.launch()
let fail = 0
for (const path of list.split(',')) for (const w of WIDTHS) {
  const p = await b.newPage({ viewport: { width: w, height: w < 700 ? 844 : 900 } })
  await p.goto(base + path, { waitUntil: 'networkidle' })
  const r = await p.evaluate(() => {
    const top = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null }
    const over = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1
      && !e.closest('.tableScroll, .ui-scroll, [data-hscroll]') && getComputedStyle(e).position !== 'fixed').length
    const rail = document.querySelector('[data-tool-page] aside')
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, over, input: top('[data-tool-region] input'), status: top('[data-tool-region] [role="status"]'),
      regions: document.querySelectorAll('[data-tool-region]').length, rail: rail ? getComputedStyle(rail).display !== 'none' : null,
      statusOutside: [...document.querySelectorAll('[role="status"]')].filter(e => !e.closest('[data-tool-region]') && e.getClientRects().length > 0).length }
  })
  const isTool = path.split('/').length === 4
  const bad = r.sw > r.iw || r.over > 0 || (w === 390 && isTool && (r.input ?? 0) > 844) || (isTool && r.regions > 1)
  if (bad) fail++
  console.log(`${bad ? '✗' : '✓'} ${path} @${w}  scrollWidth ${r.sw}/${r.iw} · 넘침 요소 ${r.over} · 입력 ${r.input} · 결과 ${r.status}${isTool ? ` · 도구영역 ${r.regions} · 레일 ${r.rail} · 영역 밖 status ${r.statusOutside}` : ''}`)
  await p.close()
}
await b.close()
process.exit(fail ? 1 : 0)
