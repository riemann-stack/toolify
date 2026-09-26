/* 검색 품질 회귀 테스트 (node:test) — 실행: npx tsx --test tests/search.test.mts
   질의 케이스는 scripts/search-regression.mts 의 CASES 단일 소스를 쓴다.
   통폐합 과도기 내성: 기대값은 병합 후 target href로 적고, 소스가 아직 레지스트리에 있으면 소스도 정답 인정. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { allTools, type Tool } from '../lib/tools'
import { searchTools, createToolSearch, TOOL_ALIASES } from '../lib/search'
import { CASES, MERGED_INTO, evaluateCase } from '../scripts/search-regression.mjs'

describe('검색 회귀 케이스 (scripts/search-regression.mts)', () => {
  test('케이스 30개 이상', () => {
    assert.ok(CASES.length >= 30, `케이스 ${CASES.length}개`)
  })
  for (const c of CASES) {
    test(`"${c.q}"`, () => {
      const r = evaluateCase(c)
      const got = r.got.slice(0, 5).map(g => `${g.href}(${Math.round(g.score)})`).join(' | ') || '0건'
      assert.ok(r.pass, `${r.failures.join(' / ')}\n  결과: ${got}`)
    })
  }
})

describe('별칭 맵 위생', () => {
  const existing = new Set(allTools.map(t => t.href))

  test('별칭 키는 모두 레지스트리에 있는 도구 (삭제·병합 후 고아 별칭 없음)', () => {
    const orphans = Object.keys(TOOL_ALIASES).filter(h => !existing.has(h))
    assert.deepEqual(orphans, [], `lib/search.ts TOOL_ALIASES 고아 키: ${orphans.join(', ')} — 대상 도구로 옮기거나 삭제`)
  })

  test('병합 소스·삭제 도구에는 별칭을 두지 않는다 (target으로 이동)', () => {
    const gone = [...Object.keys(MERGED_INTO), '/tools/dev/tech-stack', '/tools/life/fart-risk']
    const left = gone.filter(h => h in TOOL_ALIASES)
    assert.deepEqual(left, [])
  })

  test("car-tax는 일반 '취득세'·'양도세'를 소유하지 않는다", () => {
    const carTax = (TOOL_ALIASES['/tools/finance/car-tax'] ?? []).map(a => a.replace(/\s+/g, ''))
    assert.ok(!carTax.includes('취득세'))
    assert.ok(!carTax.includes('양도세'))
    assert.ok(carTax.includes('자동차취득세'))
  })
})

describe('searchTools 동작', () => {
  test('빈 질의·공백만 → 빈 배열', () => {
    assert.deepEqual(searchTools(''), [])
    assert.deepEqual(searchTools('   '), [])
  })

  test('limit 준수', () => {
    assert.ok(searchTools('계산기', 5).length <= 5)
    assert.ok(searchTools('계산기', 60).length > 8, '불용어만 있는 질의는 원문으로 검색')
  })

  test('대소문자 무시', () => {
    assert.equal(searchTools('BMI')[0]?.tool.href, searchTools('bmi')[0]?.tool.href)
  })

  test('기본 호출은 partial 결과를 섞지 않는다', () => {
    for (const q of ['연봉 존재하지않는말', '이사 비용']) {
      assert.ok(searchTools(q).every(h => !h.partial), q)
    }
  })

  test('점수 내림차순', () => {
    const hits = searchTools('세금', 20)
    for (let i = 1; i < hits.length; i++) assert.ok(hits[i - 1].score >= hits[i].score)
  })
})

describe('createToolSearch (합성 데이터)', () => {
  const T = (href: string, name: string, desc = ''): Tool => ({ href, icon: '', name, desc })
  const tools = [
    T('/t/age', '나이 계산기', '만 나이와 연 나이'),
    T('/t/hard', '경도 변환기', 'HRC HV 환산'),
    T('/t/salary', '연봉 실수령액 계산기', '세금 떼고 월급'),
    T('/t/stack', '기술 스택 추천기', '프레임워크 추천'),
  ]
  const aliases = {
    '/t/age': ['나이', '만나이'],
    '/t/hard': ['경도', '나이프'],
    '/t/salary': ['연봉', '월급'],
    '/t/missing': ['유령', '나이'], // 레지스트리에 없는 키 — 무시돼야 함
  }
  const search = createToolSearch(tools, aliases)

  test('고아 별칭 키가 있어도 오류 없이 무시', () => {
    assert.doesNotThrow(() => search('유령'))
    assert.deepEqual(search('유령'), [])
    assert.deepEqual(search('나이').map(h => h.tool.href), ['/t/age'])
  })

  test('완결 단어는 다른 별칭의 접두로 확장하지 않는다 (나이 ↛ 나이프)', () => {
    assert.ok(!search('나이').some(h => h.tool.href === '/t/hard'))
    assert.equal(search('나이프')[0]?.tool.href, '/t/hard')
  })

  test('IME 조합 중 입력도 접두 매치 (연보·연ㅂ → 연봉)', () => {
    assert.equal(search('연보')[0]?.tool.href, '/t/salary')
    assert.equal(search('연ㅂ')[0]?.tool.href, '/t/salary')
  })

  test('1글자는 단어 중간 부분일치 금지 (술 ↛ 기술)', () => {
    assert.deepEqual(search('술'), [])
  })

  test('접미사 제거·붙여쓰기', () => {
    for (const q of ['연봉 계산기', '연봉계산기', '연봉 계산', '연봉 5000']) {
      assert.equal(search(q)[0]?.tool.href, '/t/salary', q)
    }
  })

  test('다중 토큰 AND — 한 토큰이라도 없으면 제외, partial 옵션일 때만 추천', () => {
    assert.deepEqual(search('연봉 존재하지않는말'), [])
    const p = search('연봉 존재하지않는말', 8, { partial: true })
    assert.equal(p[0]?.tool.href, '/t/salary')
    assert.equal(p[0]?.partial, true)
  })

  test('초성 검색', () => {
    assert.equal(search('ㅇㅂ')[0]?.tool.href, '/t/salary')
    assert.equal(search('ㄴㅇ')[0]?.tool.href, '/t/age')
  })
})
