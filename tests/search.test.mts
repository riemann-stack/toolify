/* 검색 품질 회귀 테스트 (node:test) — 실행: npx tsx --test tests/search.test.mts
   질의 케이스는 scripts/search-regression.mts 의 CASES 단일 소스를 쓴다.
   통폐합 과도기 내성: 기대값은 병합 후 target href로 적고, 소스가 아직 레지스트리에 있으면 소스도 정답 인정. */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { allTools, type Tool } from '../lib/tools'
import { searchTools, createToolSearch, TOOL_ALIASES } from '../lib/search'
import { CASES, MERGED_INTO, evaluateCase, type SearchCase } from '../scripts/search-regression.mjs'

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
    // 예외: 병합 전까지 기능이 소스에만 있는 도구 — 소스가 레지스트리에 있는 동안만 별칭 허용.
    // 소스가 삭제되면 예외가 자동으로 풀려(그리고 고아 키 테스트도 걸려) 병합 단계에서 target으로 옮기게 된다.
    const holdUntilMerge = new Set(['/tools/edu/sci-units'])
    const gone = [...Object.keys(MERGED_INTO), '/tools/dev/tech-stack', '/tools/life/fart-risk']
      .filter(h => !(holdUntilMerge.has(h) && existing.has(h)))
    const left = gone.filter(h => h in TOOL_ALIASES)
    assert.deepEqual(left, [])
  })

  test('eV·전자볼트는 단위 변환기, 천문·원자 스케일 단위는 병합 전까지 sci-units', () => {
    const norm = (h: string) => (TOOL_ALIASES[h] ?? []).map(a => a.toLowerCase())
    assert.ok(norm('/tools/unit/converter').includes('ev'))
    assert.ok(norm('/tools/unit/converter').includes('전자볼트'))
    const scale = existing.has('/tools/edu/sci-units') ? '/tools/edu/sci-units' : '/tools/edu/sig-figs'
    for (const w of ['광년', '옹스트롬', '파섹', '천문단위']) assert.ok(norm(scale).includes(w), `${w} → ${scale}`)
    assert.ok(!norm('/tools/edu/sig-figs').includes('ev'))
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

  test('future: 신설 도구가 레지스트리에 생기면 1위가 신설 도구여야 통과', () => {
    const F = '/tools/finance/'
    const c: SearchCase = { q: '취득세', top1: [F + 'acquisition-tax', F + 'auction'], future: [F + 'acquisition-tax'] }
    const fake = (first: string) => () => [{ tool: { href: first }, score: 90 }]
    const before = new Set([F + 'auction'])
    const after = new Set([F + 'auction', F + 'acquisition-tax'])
    assert.ok(evaluateCase(c, fake(F + 'auction'), before).pass, '신설 전: 기존 도구 1위 허용')
    assert.ok(!evaluateCase(c, fake(F + 'auction'), after).pass, '신설 후: 기존 도구 1위면 실패')
    assert.ok(evaluateCase(c, fake(F + 'acquisition-tax'), after).pass, '신설 후: 신설 도구 1위면 통과')
  })

  test('병합 소스를 기대값으로 적은 케이스는 소스 삭제 후 target을 정답으로 본다', () => {
    const c: SearchCase = { q: '광년', top1: ['/tools/edu/sci-units'] }
    const fake = (first: string) => () => [{ tool: { href: first }, score: 90 }]
    const merged = new Set(['/tools/edu/sig-figs'])
    assert.ok(evaluateCase(c, fake('/tools/edu/sig-figs'), merged).pass)
    const premerge = new Set(['/tools/edu/sig-figs', '/tools/edu/sci-units'])
    assert.ok(!evaluateCase(c, fake('/tools/edu/sig-figs'), premerge).pass, '병합 전엔 소스만 정답')
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

  test('공백 없이 접미사를 치다 만 상태 → 어근으로 검색 (연봉계·연봉계ㅅ·연봉계사·연봉ㄱ)', () => {
    for (const q of ['연봉계', '연봉계ㅅ', '연봉계사', '연봉ㄱ', '연봉계산ㄱ', '나이계', '연봉 계사', '연봉 계산ㄱ']) {
      assert.equal(search(q)[0]?.tool.href, q.startsWith('나이') ? '/t/age' : '/t/salary', q)
    }
  })

  test('치다 만 접미사 제거는 어근이 어휘에 있는 2자 이상일 때만 (세계↛세, 인생↛인)', () => {
    const s = createToolSearch([T('/t/tax', '세 도구'), T('/t/in', '인 도구')], { '/t/tax': ['세'], '/t/in': ['인'] })
    assert.deepEqual(s('세계'), [])
    assert.deepEqual(s('인생'), [])
  })
})

describe('createToolSearch — 선택 토큰·복합어 별칭', () => {
  const T = (href: string, name: string, desc = ''): Tool => ({ href, icon: '', name, desc })

  test('선택(수치) 토큰은 평균에 넣지 않는다 — 못 맞춘 도구만 ×0.92', () => {
    const s = createToolSearch(
      [T('/t/pace', '러닝 페이스 계산기', '5km 10km 스플릿'), T('/t/swim', '수영 페이스 계산기', '100m 기록')],
      { '/t/pace': ['페이스'], '/t/swim': ['페이스', '수영페이스'] },
    )
    const r = s('5km 페이스')
    assert.equal(r[0]?.tool.href, '/t/pace')
    const solo = s('페이스')
    const at = (hits: typeof r, h: string) => hits.find(x => x.tool.href === h)?.score ?? 0
    // 5km를 desc(낮은 점수)로 맞춘 pace도 점수가 깎이지 않는다
    assert.equal(at(r, '/t/pace'), at(solo, '/t/pace'))
    // 5km를 못 맞춘 swim만 감점
    assert.ok(Math.abs(at(r, '/t/swim') - at(solo, '/t/swim') * 0.92) < 1e-9)
  })

  test('완결 단어는 "앞말 + 어휘 단어" 복합어 별칭만 낮은 점수로 확장, EXACT_ONLY는 제외', () => {
    const s = createToolSearch(
      [T('/t/pension', '연금 계산기'), T('/t/savings', '저축 계산기'), T('/t/url', 'URL 인코더'), T('/t/baker', '베이커 퍼센트')],
      { '/t/pension': ['연금'], '/t/savings': ['저축', '연금저축'], '/t/url': ['인코딩', '퍼센트인코딩'], '/t/baker': ['퍼센트'] },
    )
    const r = s('연금')
    assert.deepEqual(r.map(h => h.tool.href), ['/t/pension', '/t/savings'])
    assert.ok(r[1].score < 60, '복합어 확장은 정확 일치보다 한참 낮게')
    assert.ok(!s('퍼센트').some(h => h.tool.href === '/t/url'), '퍼센트 ↛ 퍼센트인코딩')
  })

  test('복합어 뒷말이 어휘에 없는 1글자면 확장하지 않는다 (나이 ↛ 나이프)', () => {
    const s = createToolSearch([T('/t/age', '나이 계산기'), T('/t/hard', '경도 변환기')], { '/t/age': ['나이'], '/t/hard': ['나이프'] })
    assert.deepEqual(s('나이').map(h => h.tool.href), ['/t/age'])
  })
})
