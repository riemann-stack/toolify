/* 리다이렉트 위생 (node:test) — 실행: npx tsx --test tests/redirects.test.mts
   next.config.ts redirects()가
   ① 체인 없이 한 번에 최종 목적지로 보내는지 (목적지 경로가 다른 규칙의 source면 실패)
   ② 목적지 페이지가 실제로 있고, source 페이지는 없는지 (둘 다 있으면 301이 페이지를 가린다)
   ③ 통합 소스(scripts/search-regression.mts MERGED_INTO)·폐지 도구가 모두 영구(301/308) 규칙을 갖고,
      통합 소스는 대상 도구로 가는지 (?tab= 딥링크 허용)
   를 확인한다. 옛 주소 규칙은 영구 유지(삭제 금지) — 이 테스트가 규칙 삭제도 잡는다. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as nextConfigModule from '../next.config'
import { MERGED_INTO } from '../scripts/search-regression.mjs'

interface Redirect { source: string; destination: string; permanent?: boolean }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
type ConfigLike = { redirects?: () => Promise<Redirect[]> }
const mod = nextConfigModule as unknown as { default?: ConfigLike & { default?: ConfigLike } }
const config: ConfigLike = mod.default?.default ?? mod.default ?? {}
const pathOf = (url: string) => url.split(/[?#]/)[0]
const pageExists = (path: string) => existsSync(resolve(ROOT, `app${path}/page.tsx`))

/** 폐지(대체 도구 없음) → 분야 허브. 원칙은 원래 분야 허브, fart-risk만 예외로 건강 허브 (next.config.ts 주석 참고) */
const RETIRED: Record<string, string> = {
  '/tools/dev/tech-stack': '/tools/dev',
  '/tools/life/fart-risk': '/tools/health', // 생활(재미·교양)에 있었지만 내용이 소화기 증상·저FODMAP — 예외
}

describe('next.config.ts redirects', async () => {
  assert.equal(typeof config.redirects, 'function', 'next.config.ts에 redirects()가 없음')
  const rules = await config.redirects!()
  const bySource = new Map(rules.map((r) => [r.source, r]))

  test('source 중복 없음', () => {
    assert.equal(bySource.size, rules.length)
  })

  test('체인 없음 — 목적지 경로가 다른 규칙의 source가 아니다', () => {
    const chains = rules.filter((r) => bySource.has(pathOf(r.destination))).map((r) => `${r.source} → ${r.destination}`)
    assert.deepEqual(chains, [])
  })

  test('모두 영구 이동', () => {
    assert.deepEqual(rules.filter((r) => r.permanent !== true).map((r) => r.source), [])
  })

  test('목적지 페이지는 있고, source 페이지는 없다', () => {
    assert.deepEqual(rules.filter((r) => !pageExists(pathOf(r.destination))).map((r) => r.destination), [], '목적지 없음')
    assert.deepEqual(rules.filter((r) => pageExists(r.source)).map((r) => r.source), [], 'source 페이지가 남아 301이 가림')
  })

  test('통합 소스는 대상 도구로 (?tab= 허용)', () => {
    for (const [src, dst] of Object.entries(MERGED_INTO)) {
      const r = bySource.get(src)
      assert.ok(r, `${src} 리다이렉트 없음`)
      assert.equal(pathOf(r.destination), dst, `${src} → ${r.destination} (기대: ${dst})`)
    }
  })

  test('폐지 도구는 분야 허브로', () => {
    for (const [src, dst] of Object.entries(RETIRED)) {
      assert.equal(bySource.get(src)?.destination, dst, src)
    }
  })
})
