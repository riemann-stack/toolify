import type { CSSProperties } from 'react'
import { gzipSync } from 'node:zlib'
import Link from 'next/link'
import JsonClient from './JsonClient'
import { analyzeJson, jsonToCsv, jsonToInterfaces, unescapeJson } from './jsonUtils'
import { EXAMPLES, byteLength, jsonToYaml, yamlToJson, type ConvertOpts } from './yamlJsonUtils'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/json',
  title: 'JSON 포맷터 — 정렬·검증·트리 뷰·TS 인터페이스 + YAML ↔ JSON 변환',
  description: 'JSON 정렬·압축·검증·트리 뷰 + TypeScript 인터페이스 자동 생성 + YAML·CSV 변환·키 정렬·에러 위치. YAML ↔ JSON 양방향 변환·검증 탭(K8s·Compose·Actions 예시 12개)까지.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON트리뷰어', 'JSON유효성검사', 'JSON to TypeScript', 'JSON to YAML', 'JSON to CSV', 'JSON정렬키', 'JSON에러위치', 'YAML JSON 변환', 'yaml to json', 'YAML 검증', 'Kubernetes YAML', 'Docker Compose', 'GitHub Actions yaml'],
})

/* ══════════════════════════════════════════════════════════════
   빌드 시 계산 — 가이드의 예시 숫자·메시지는 도구와 같은 함수(jsonUtils·yamlJsonUtils)와
   같은 엔진(V8 JSON.parse/stringify, js-yaml)으로 만든다. 손으로 적은 값이 도구 결과와 어긋나지 않게.
   ══════════════════════════════════════════════════════════════ */
const PRETTY: ConvertOpts = { indent: '2', jsonCompact: false, sortKeys: false }
const COMPACT: ConvertOpts = { ...PRETTY, jsonCompact: true }

/** 비율 → 부호 붙은 정수 % (음수는 U+2212) */
const pct = (ratio: number) => {
  const n = Math.sign(ratio) * Math.round(Math.abs(ratio) * 100) // 반올림을 부호와 무관하게(표·본문 범위가 같은 값)
  return n > 0 ? `+${n}%` : n < 0 ? `−${-n}%` : '0%'
}
const pctRange = (xs: number[]) => `${Math.round(Math.min(...xs) * 100)}~${Math.round(Math.max(...xs) * 100)}%`
const fmtB = (n: number) => `${n.toLocaleString('ko-KR')}B`

// 1) 가이드 공용 예시 JSON — 크기·통계·TypeScript 예시가 모두 이 값에서 나온다
const SAMPLE = { name: 'Alice', age: 30, address: { city: 'Seoul' } }
const SAMPLE_MIN = JSON.stringify(SAMPLE)
const SAMPLE_MIN_B = byteLength(SAMPLE_MIN)
const SAMPLE_P2_B = byteLength(JSON.stringify(SAMPLE, null, 2))
const SAMPLE_P4_B = byteLength(JSON.stringify(SAMPLE, null, 4))
const SAMPLE_SAVE = Math.round((1 - SAMPLE_MIN_B / SAMPLE_P2_B) * 100)
const SAMPLE_STATS = analyzeJson(SAMPLE)

// 2) JSON.parse 오류 메시지 (V8 — Chrome·Edge·Node.js). 빌드한 Node의 실제 메시지
const parseMessage = (src: string) => {
  try { JSON.parse(src); return '(오류 없음)' } catch (e) { return e instanceof Error ? e.message : String(e) }
}
/** 보이지 않는 문자(BOM·줄바꿈·탭)를 표에서 알아볼 수 있게 */
const visible = (s: string) => (s === '' ? '(빈 문자열)' : s.replace(/\uFEFF/g, '[BOM]').replace(/\n/g, '↵').replace(/\t/g, '⇥'))
const PARSE_ERRORS = [
  { cause: '객체 마지막 쉼표', src: '{"a": 1,}', fix: '마지막 값 뒤 쉼표 삭제. 쉼표 뒤에 다음 키를 기다렸기 때문에 "큰따옴표 키가 와야 한다"는 메시지가 나온다' },
  { cause: '배열 마지막 쉼표', src: '[1, 2,]', fix: '마지막 원소 뒤 쉼표 삭제' },
  { cause: '작은따옴표', src: "{'a': 1}", fix: '키·문자열 모두 큰따옴표(")로. Python dict를 print한 결과를 복사하면 흔하다' },
  { cause: '따옴표 없는 키', src: '{a: 1}', fix: '"a"처럼 키를 큰따옴표로. JS 객체 리터럴을 그대로 붙여 넣었을 때 흔하다' },
  { cause: 'NaN·undefined 값', src: '{"a": NaN}', fix: 'JSON에는 NaN·Infinity·undefined가 없다. null이나 문자열로 바꾼다' },
  { cause: '주석', src: '{"a": 1} // 메모', fix: '주석 삭제 (JSONC·JSON5 파서가 아닌 한 모두 오류)' },
  { cause: '문자열 안 실제 줄바꿈', src: '{"a": "줄1\n줄2"}', fix: '\\n으로 이스케이프. 탭 등 U+0000~U+001F 제어 문자도 모두 \\t·\\uXXXX로' },
  { cause: '숫자 앞자리 0', src: '{"n": 007}', fix: '7로 쓰거나, 우편번호·코드처럼 앞자리 0이 의미 있으면 "007" 문자열로' },
  { cause: '허용되지 않는 이스케이프', src: '{"a": "\\x41"}', fix: 'JSON 이스케이프는 \\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX뿐 — \\x41은 \\u0041로' },
  { cause: 'BOM', src: '\uFEFF{"a": 1}', fix: '"UTF-8(BOM 없음)"으로 다시 저장. 메시지의 따옴표 사이 글자가 보이지 않는 BOM이다' },
  { cause: '빈 입력', src: '', fix: '본문이 비어 있다 — 204 No Content나 실패한 요청에 response.json()을 불렀을 때 흔하다' },
  { cause: 'HTML 응답', src: '<!DOCTYPE html><html>', fix: 'API가 JSON 대신 오류·로그인 페이지를 돌려줬다. URL·인증·상태 코드부터 확인' },
].map((r) => ({ ...r, shown: visible(r.src), msg: visible(parseMessage(r.src)) }))
const DUP_PARSED = JSON.stringify(JSON.parse('{"a": 1, "a": 2}'))
const DUP_YAML_MSG = (yamlToJson('{"a": 1, "a": 2}', COMPACT).error ?? '').split(' (')[0]

// 3) 2⁵³ 한계
const BIG_SRC = '{"id": 1234567890123456789}'
const BIG_OUT = String((JSON.parse(BIG_SRC) as { id: number }).id)
const SAFE_OUT = String(JSON.parse('9007199254740993'))
const MAX_SAFE = Number.MAX_SAFE_INTEGER.toLocaleString('en-US')

// 4) JSON.stringify가 바꾸거나 지우는 값
const stringifyOut = (f: () => string | undefined) => {
  try {
    const r = f()
    return r === undefined ? 'undefined (문자열이 아님)' : r
  } catch (e) {
    return `${e instanceof Error ? e.name : 'Error'}: ${e instanceof Error ? e.message : String(e)}`
  }
}
const STRINGIFY_ROWS = [
  { js: '{ a: undefined, b: 1 }', out: stringifyOut(() => JSON.stringify({ a: undefined, b: 1 })), note: '값이 undefined인 키는 통째로 빠진다 — 받는 쪽에는 "필드 없음"으로 보인다' },
  { js: '[undefined, () => 1]', out: stringifyOut(() => JSON.stringify([undefined, () => 1])), note: '배열에서는 자리를 지키려고 null이 된다' },
  { js: '{ f: () => 1, s: Symbol() }', out: stringifyOut(() => JSON.stringify({ f: () => 1, s: Symbol() })), note: '함수·Symbol 값도 키째 빠진다' },
  { js: '[NaN, Infinity, -0]', out: stringifyOut(() => JSON.stringify([NaN, Infinity, -0])), note: 'NaN·±Infinity는 null, −0은 0' },
  { js: 'new Date(Date.UTC(2026, 8, 26))', out: stringifyOut(() => JSON.stringify(new Date(Date.UTC(2026, 8, 26)))), note: 'toJSON()이 불려 UTC 기준 ISO 문자열 — 받는 쪽에서 다시 Date로 바꿔야 한다' },
  { js: 'new Map([["a", 1]])', out: stringifyOut(() => JSON.stringify(new Map([['a', 1]]))), note: 'Map·Set은 {} — Object.fromEntries(map)이나 [...set]으로 바꿔서 직렬화' },
  { js: 'BigInt(10)', out: stringifyOut(() => JSON.stringify(BigInt(10))), note: '오류로 멈춘다 — 문자열로 바꾸거나 BigInt.prototype.toJSON을 정의' },
  { js: 'undefined', out: stringifyOut(() => JSON.stringify(undefined)), note: '최상위가 undefined면 문자열이 아니라 undefined — 그대로 보내면 본문이 비어 받는 쪽이 "Unexpected end of JSON input"' },
]

// 5) 정렬·압축 크기와 gzip — 예시 탭의 데이터(도구와 같은 변환 함수) + 반복 레코드 예시
const gz = (s: string) => gzipSync(Buffer.from(s, 'utf8')).length
function exampleData(id: string): unknown {
  const ex = EXAMPLES.find((e) => e.id === id)
  if (!ex) return undefined
  if (ex.format === 'json') return JSON.parse(ex.code)
  const r = yamlToJson(ex.code, COMPACT)
  return r.success && r.result ? JSON.parse(r.result) : undefined
}
const USERS_50 = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1, name: `user${i + 1}`, email: `user${i + 1}@example.com`, active: i % 3 !== 0, roles: ['reader'],
}))
const SIZE_ROWS = [
  { label: 'package.json 예시', data: exampleData('package-json') },
  { label: 'K8s Deployment 예시 (YAML → JSON)', data: exampleData('k8s-deployment') },
  { label: 'OpenAPI 3.0 예시 (YAML → JSON)', data: exampleData('openapi') },
  { label: '사용자 50건 배열 (id·name·email·active·roles)', data: USERS_50 },
].filter((r) => r.data !== undefined).map((r) => {
  const pretty = JSON.stringify(r.data, null, 2)
  const min = JSON.stringify(r.data)
  const p = byteLength(pretty), m = byteLength(min), gp = gz(pretty), gm = gz(min)
  return { label: r.label, p, m, gp, gm, save: 1 - m / p, gzSave: 1 - gm / gp }
})
const MIN_SAVE_RANGE = pctRange(SIZE_ROWS.map((r) => r.save))
const GZ_SAVE_RANGE = pctRange(SIZE_ROWS.map((r) => r.gzSave))

// 6) TypeScript 인터페이스 — 도구의 jsonToInterfaces 출력 그대로
const TS_BASIC = jsonToInterfaces(SAMPLE, 'Root').join('\n\n')
const TS_EDGE_IN = { 'user-id': 7, response: { ok: true }, items: [{ id: 1 }, { id: 2, memo: 'x' }], deletedAt: null, tags: [] }
const TS_EDGE = jsonToInterfaces(TS_EDGE_IN, 'Root').join('\n\n')

// 7) 변환 탭 예시 — 이스케이프는 JsonClient와 같은 식, CSV·해제는 같은 함수
const ESC_IN = { msg: 'say "hi"' }
const ESC_OUT = JSON.stringify(JSON.stringify(ESC_IN))
const UNESC_IN = JSON.stringify(JSON.stringify({ a: 1 }))
const UNESC_OUT = unescapeJson(JSON.parse(UNESC_IN), 2)
const CSV_IN = [{ name: 'kim', tags: ['a', 'b'] }, { name: 'lee, j', memo: 'say "hi"' }]
const CSV_OUT = jsonToCsv(CSV_IN)

// 8) YAML 값 해석 — 본 도구(YAML 1.2 규칙)로 읽은 값과 JSON → YAML 때의 출력
const yamlReads = (scalar: string) => {
  const r = yamlToJson(`v: ${scalar}`, COMPACT)
  return r.success && r.result ? JSON.stringify((JSON.parse(r.result) as { v: unknown }).v) : '오류'
}
const yamlWrites = (str: string) => (jsonToYaml(JSON.stringify({ v: str }), PRETTY).result ?? '').trim()
/* py: PyYAML 6.0 yaml.safe_load 결과(YAML 1.1 규칙) — 2026-09 실행 확인값 */
const YAML_VALUE_ROWS = [
  { src: 'yes', py: 'True', note: 'YAML 1.1은 yes·no·on·off를 boolean으로 정의' },
  { src: 'NO', py: 'False', note: '국가 코드 NO(노르웨이)가 false가 되는 이른바 Norway problem' },
  { src: 'on', py: 'True', note: 'GitHub Actions의 on: 키도 PyYAML로 읽으면 True 키가 된다' },
  { src: '0755', py: '493', note: 'YAML 1.1은 0으로 시작하면 8진수. 1.2는 8진수를 0o755로만 쓴다' },
  { src: '3.10', py: '3.1', note: '1.1·1.2 모두 실수 — 끝의 0이 사라진다(python-version: 3.10 → 3.1)' },
  { src: '22:22', py: '1342', note: 'YAML 1.1의 60진수. Compose 포트 매핑을 따옴표로 쓰는 이유' },
  { src: '2026-09-26', py: 'datetime.date(2026, 9, 26)', note: '1.1 로더는 날짜 객체로 바꾼다' },
  { src: '~', py: 'None', note: '~·null·빈 값은 모두 null' },
  { src: '.inf', py: 'inf', note: 'JSON에는 무한대가 없어 JSON으로 옮기면 null' },
].map((r) => ({ ...r, tool: yamlReads(r.src), quoted: yamlWrites(r.src) }))

// 9) 흔한 YAML 오류 — 도구의 yamlToJson이 내는 메시지 첫 줄
const yamlOutcome = (src: string) => {
  const r = yamlToJson(src, COMPACT)
  return r.success ? `오류 없음 → ${r.result}` : (r.error ?? '').split('\n')[0].split(' — ')[0]
}
const YAML_ERRORS = [
  { cause: '탭 들여쓰기', src: 'a:\n\tb: 1', fix: '들여쓰기는 공백만. 에디터에서 탭을 공백으로 바꾸는 설정을 켠다' },
  { cause: '콜론 뒤 공백 누락', src: 'a: 1\nb:2', fix: 'b: 2처럼 띄운다. b:2는 키가 아니라 문자열 한 덩어리라, 파일에 이 줄 하나뿐이면 오류 없이 문자열 "b:2"가 된다' },
  { cause: '들여쓰기 불일치', src: 'a:\n  b: 1\n   c: 2', fix: '같은 레벨은 같은 칸 수로' },
  { cause: '값 안의 ": "', src: 'title: 주의: 공백', fix: '값 전체를 따옴표로 — title: "주의: 공백"' },
  { cause: '중복 키', src: 'k: v\nk: w', fix: '하나로 합친다. PyYAML 등 일부 파서는 오류 없이 마지막 값으로 덮어써 더 찾기 어렵다' },
  { cause: '커스텀 태그', src: 'x: !Ref Foo', fix: 'CloudFormation이면 Ref: Foo 같은 긴 형식으로. 본 도구는 커스텀 태그를 해석하지 않는다' },
  { cause: '정의 안 된 별칭', src: 'x: *foo', fix: '앵커 &foo를 먼저 정의하거나, 문자열이면 "*foo"처럼 따옴표' },
  { cause: '닫히지 않은 따옴표', src: 'key: "unclosed', fix: '따옴표 짝을 맞춘다' },
  { cause: '공백 뒤 #', src: 'msg: hello #world', fix: '" #" 뒤는 주석이라 값이 잘린다. 값에 #이 들어가면 따옴표' },
  { cause: '리스트 들여쓰기 어긋남', src: 'items:\n- a\n - b', fix: '"- "의 칸을 맞춘다. 한 칸 밀린 줄은 앞 항목 값의 연속으로 읽힌다' },
].map((r) => ({ ...r, shown: visible(r.src), outcome: yamlOutcome(r.src) }))

// 10) FAQ 수치 — 예시 탭 데이터로 YAML ↔ JSON 크기 비율
const Y2J = EXAMPLES.filter((e) => e.format === 'yaml').flatMap((e) => {
  const y = byteLength(e.code)
  const p = yamlToJson(e.code, PRETTY).result
  const c = yamlToJson(e.code, COMPACT).result
  return p && c ? [{ p: byteLength(p) / y, c: byteLength(c) / y }] : []
})
const Y2J_PRETTY = `${Math.min(...Y2J.map((x) => x.p)).toFixed(1)}~${Math.max(...Y2J.map((x) => x.p)).toFixed(1)}배`
const Y2J_COMPACT = `${pct(Math.min(...Y2J.map((x) => x.c)) - 1)}~${pct(Math.max(...Y2J.map((x) => x.c)) - 1)}`
const j2yChange = (id: string) => {
  const ex = EXAMPLES.find((e) => e.id === id)
  const r = ex ? jsonToYaml(ex.code, PRETTY).result : undefined
  return ex && r ? pct(byteLength(r) / byteLength(ex.code) - 1) : ''
}

const FAQ_LD = [
              {
                q: 'JSON에 주석을 쓰면 왜 오류가 나나요?',
                a: 'JSON 표준(RFC 8259·ECMA-404)에는 <strong>주석 문법이 없습니다.</strong> JSON을 만든 Douglas Crockford는 2012년, 주석에 파싱 지시문을 넣어 쓰는 사례가 보여 상호운용성을 지키려고 주석을 뺐다는 취지로 설명했습니다. 주석이 필요하면 <strong>JSONC</strong>(tsconfig.json·VS Code 설정 파일)나 <strong>JSON5</strong>를 쓰고, 순수 JSON만 받는 곳에 넘기기 전에는 주석을 지우세요. 같은 이유로 YAML → JSON 변환 때 YAML의 <code>#</code> 주석은 모두 사라지고, 다시 YAML로 되돌려도 복원되지 않습니다. <strong>YAML ↔ JSON 탭</strong>은 입력에서 주석을 발견하면 경고로 알려 줍니다.',
              },
              {
                q: 'API 응답 JSON에서 TypeScript 타입을 자동 생성할 수 있나요?',
                a: '네, <strong>변환 탭 → TypeScript 인터페이스</strong>를 쓰세요. 중첩 객체는 별도 인터페이스로 분리되고, 키와 값 타입이 모두 같은 구조는 한 인터페이스로 재사용됩니다. 알아 둘 한계는 세 가지입니다. ① <strong>배열은 첫 번째 원소만 보고</strong> 타입을 정하므로 원소마다 필드가 다르면 빠진 필드를 직접 보완해야 합니다. ② 샘플 값이 <code>null</code>인 필드는 실제 타입을 알 수 없어 <code>null</code>로 두고 주석을 다니 <code>string | null</code>처럼 고쳐 쓰세요. ③ 옵셔널 여부(<code>?</code>)는 JSON 한 건으로 판단할 수 없습니다. 키는 코드 단위 순(대문자가 소문자보다 앞)으로 정렬되고, <code>Response</code>·<code>Date</code>처럼 전역 타입과 겹치는 이름에는 <code>Type</code>·<code>Data</code> 접미사가 붙습니다.',
              },
              {
                q: 'JSON Beautify(정렬)와 Minify(압축) 차이는?',
                a: `<strong>Beautify</strong>는 들여쓰기와 줄바꿈을 넣어 사람이 읽기 좋게, <strong>Minify</strong>는 의미 없는 공백을 모두 지워 한 줄로 만듭니다. 파싱 결과는 같습니다. 가이드의 예시 JSON은 <strong>2칸 들여쓰기 ${SAMPLE_P2_B}바이트 → 압축 ${SAMPLE_MIN_B}바이트(약 −${SAMPLE_SAVE}%)</strong>입니다. 다만 실제 전송에 gzip을 쓰면 차이가 크게 줄어듭니다 — 가이드의 크기 비교 표에서 압축만 했을 때 ${MIN_SAVE_RANGE} 줄던 크기 차이가 gzip 뒤에는 ${GZ_SAVE_RANGE}로 좁혀집니다. 전송량이 문제라면 서버의 gzip·brotli 전송 압축을 먼저 확인하세요.`,
              },
              {
                q: 'JSON 파싱 오류 위치를 어떻게 찾나요?',
                a: '브라우저 오류 메시지에는 보통 <code>at position N</code>(0부터 센 문자 위치)이나 <code>line N column N</code> 형식으로 위치가 들어 있습니다. 본 도구는 이를 줄·열로 바꿔 <strong>해당 줄의 텍스트와 ^ 표시</strong>로 보여 주고, 메시지에 위치 정보가 없으면 위치 표시는 생략합니다. 표시된 위치는 오류가 <em>발견된</em> 곳이라 원인은 그 바로 앞에 있는 경우가 많습니다(예: 마지막 쉼표는 다음 <code>}</code> 위치에서 발견). 메시지별 원인은 가이드의 파싱 오류 표를 참고하세요.',
              },
              {
                q: '두 JSON의 차이점을 비교하는 방법은?',
                a: '두 JSON을 비교하기 전 <strong>키 알파벳 정렬</strong>을 적용하면 순서 차이로 인한 가짜 diff를 제거할 수 있습니다. 본 도구의 <strong>변환 → 키 정렬</strong>로 정규화한 후, GitHub의 diff·VSCode의 비교 도구·jq 같은 CLI 도구로 의미적 차이만 확인하세요. 큰 JSON은 <code>jq -S</code>(키 정렬) + <code>diff</code> 조합이 효율적입니다. 배열은 순서 자체가 데이터라 정렬하지 않으므로, 원소 순서만 다른 배열은 여전히 차이로 나옵니다.',
              },
              {
                q: "Unexpected token '<' … is not valid JSON 오류는 왜 나나요?",
                a: '<code>JSON.parse</code>나 <code>fetch</code>의 <code>response.json()</code>에 <strong>JSON이 아닌 HTML</strong>이 들어왔다는 뜻입니다. 첫 글자 <code>&lt;</code>는 대개 <code>&lt;!DOCTYPE html&gt;</code>의 시작으로, API 주소 오타(404 페이지), 서버 오류(500 페이지), 로그인 만료로 인한 로그인 페이지 리다이렉트, 개발 서버의 프록시 설정 누락이 흔한 원인입니다. 개발자 도구 Network 탭에서 그 요청의 <strong>상태 코드</strong>와 <code>Content-Type</code>(JSON이면 <code>application/json</code>)을 먼저 확인하고, 코드에서는 <code>response.ok</code>를 검사한 뒤에 <code>.json()</code>을 부르세요. 비슷한 <code>Unexpected end of JSON input</code>은 본문이 <strong>비어 있을 때</strong>(204 No Content, 빈 응답) 납니다.',
              },
              {
                q: 'YAML과 JSON 어떤 차이가 있나요?',
                a: '둘 다 같은 데이터 구조(객체·배열·문자열·숫자·boolean·null)를 표현하지만 <strong>문법과 용도</strong>가 다릅니다.<br>• <strong>YAML</strong>: 들여쓰기 기반·주석 지원·앵커/별칭·멀티 도큐먼트 — 사람이 편집하는 <strong>설정 파일</strong>에 적합 (K8s·CI·Spring)<br>• <strong>JSON</strong>: 중괄호·대괄호 기반·문자열 필수 따옴표·주석 미지원 — 기계가 처리하는 <strong>API·데이터 교환</strong>에 표준<br>YAML 1.2는 JSON 문서를 그대로 읽을 수 있도록(사실상 상위 집합) 설계됐지만 예외가 있습니다. 대표적으로 <strong>중복 키</strong>는 JSON.parse가 마지막 값으로 통과시키는 반면 YAML 파서는 오류로 거부합니다. 반대로 YAML 문서 대부분은 JSON이 아닙니다.',
              },
              {
                q: 'YAML 들여쓰기는 탭 vs 공백?',
                a: '<strong>YAML은 들여쓰기에 탭 문자를 허용하지 않습니다(공백만 사용).</strong> 탭으로 들여쓰면 파싱 오류가 나며, 본 도구의 YAML ↔ JSON 탭도 <code>tab characters must not be used in indentation</code> 오류와 줄·열 위치를 보여 줍니다.<br>• <strong>관례</strong>: 2 spaces (DevOps·K8s·Docker), 4 spaces (Java/Spring 일부)<br>• <strong>한 파일 내 통일</strong> 필수 — 2/4 혼용은 들여쓰기 오류<br><strong>에디터 설정</strong>: VS Code <code>"editor.insertSpaces": true</code>, <code>"editor.tabSize": 2</code> · IntelliJ Settings → Editor → Code Style → YAML → Tabs and Indents<br>YAML 출력은 들여쓰기 옵션에서 Tab을 골라도 <strong>공백 2칸</strong>으로 나옵니다(Tab은 JSON 출력에만 적용).',
              },
              {
                q: 'K8s 매니페스트의 ---는 무엇인가요?',
                a: '<strong>YAML 멀티 도큐먼트 구분자</strong>입니다. 한 파일에 여러 YAML 도큐먼트를 담을 때 사용해요. K8s에서는 <strong>Deployment + Service + ConfigMap</strong>을 한 파일에 묶을 때 자주 씁니다. YAML ↔ JSON 탭은 각 도큐먼트를 원소로 담은 <strong>JSON 배열</strong>로 변환하며(<code>[{...pod}, {...service}]</code>), 멀티 도큐먼트를 발견하면 경고로 안내합니다.',
              },
              {
                q: 'yes/no가 자동으로 boolean이 되는데 어떻게?',
                a: '<strong>YAML 1.1 규칙</strong> 때문입니다. YAML 1.1은 <code>yes·no·on·off</code>(대소문자 변형 포함)를 boolean으로 정의했고, PyYAML처럼 1.1을 따르는 파서가 여전히 널리 쓰입니다. 잘 알려진 예가 국가 코드 <code>NO</code>(노르웨이)가 <code>false</code>가 되는 이른바 Norway problem이고, Docker Compose 문서가 environment의 yes·no·true·false 값을 따옴표로 감싸라고 안내하는 것도 같은 이유입니다.<br><strong>해결</strong>: 문자열로 쓸 값은 따옴표로 감싸세요 — <code>country: "NO"</code>. YAML 1.2 코어 스키마에서는 <code>true·false</code>(True·TRUE 같은 대소문자 변형 포함)만 boolean입니다.<br>본 도구는 YAML 1.2 규칙으로 읽어 yes/no를 문자열로 유지하고, JSON → YAML 변환 때는 <code>"yes"</code> 같은 문자열을 따옴표로 감싸 YAML 1.1 로더에서도 문자열로 남게 합니다. 가이드의 YAML 값 표에 두 규칙의 차이를 정리했습니다.',
              },
              {
                q: '앵커(&)와 별칭(*)이 무엇인가요?',
                a: '<strong>YAML의 참조 메커니즘</strong>입니다. 같은 데이터를 여러 곳에서 재사용해 중복을 줄여요. 예를 들어 <code>defaults: &amp;defaults</code> 아래에 <code>timeout: 30</code>, <code>retries: 3</code> 같은 공통값을 두고, <code>prod:</code> 항목에서 <code>&lt;&lt;: *defaults</code>로 끌어와 재사용합니다. <strong>JSON 변환 시</strong>에는 앵커가 펼쳐져 모든 곳에 데이터가 복사됩니다(참조 관계 손실). 역변환 시 자동 앵커 생성은 끔(<code>noRefs: true</code>)으로 두어 깔끔한 YAML 출력을 보장합니다.',
              },
              {
                q: 'YAML → JSON 변환 결과가 원본보다 길어요',
                a: `<strong>YAML → JSON</strong>은 대개 길어집니다 — 키마다 따옴표(<code>name</code> → <code>"name"</code>), 중괄호·대괄호, 콤마 구분자가 붙고 들여쓰기도 유지되기 때문입니다. YAML ↔ JSON 탭의 YAML 예시 ${Y2J.length}개를 2칸 Pretty JSON으로 바꾸면 <strong>원본의 약 ${Y2J_PRETTY}</strong>가 되고, <strong>Compact(한 줄)</strong>로 바꾸면 원본 YAML 대비 ${Y2J_COMPACT}로 비슷하거나 더 작아집니다. 반대로 <strong>JSON → YAML</strong>은 괄호·따옴표가 빠져 대개 짧아집니다(예시 package.json ${j2yChange('package-json')}, tsconfig.json ${j2yChange('tsconfig')}). 파일 크기가 중요하면 옵션의 <strong>JSON 출력: Compact</strong>를 쓰세요.`,
              },
              {
                q: '입력한 JSON·YAML이 서버로 전송되나요?',
                a: '<strong>아니요. 모든 처리가 브라우저에서 수행됩니다.</strong> 정렬·검증·트리 뷰·TypeScript 변환은 브라우저 내장 JSON 파서로, YAML 변환·검증은 <strong>js-yaml</strong>(MIT 라이선스) 라이브러리로 처리하며, 입력 데이터를 담은 요청은 발생하지 않습니다(처음 열 때 변환 코드 파일만 내려받음 — 개발자 도구 Network 탭에서 확인 가능). 결과 파일 저장도 <code>Blob</code> URL로 브라우저 안에서 만듭니다. JSON 탭 입력은 저장하지 않고, <strong>YAML ↔ JSON 탭의 입력·옵션만</strong> 재방문 편의를 위해 이 브라우저 localStorage에 저장합니다. 공용 PC에서 K8s 시크릿·DB 비밀번호 등을 다뤘다면 개발자 도구 → Application → Local Storage에서 <code>youtil_yaml_json_v1</code> 키를 지우세요.',
              },
            ]

/* 가이드 표·코드 공통 스타일 (토큰만) */
const TABLE: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
const TH: CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TH_NUM: CSSProperties = { ...TH, textAlign: 'right' }
const TD: CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const TD_NUM: CSSProperties = { ...TD, textAlign: 'right', whiteSpace: 'nowrap' }
const TD_MONO: CSSProperties = { ...TD, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }
const TD_MUTED: CSSProperties = { ...TD, color: 'var(--muted)' }
const ROW: CSSProperties = { borderBottom: '1px solid var(--border)' }
const CODE_BOX: CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '14px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--text)',
  lineHeight: 1.7,
  overflowX: 'auto',
  margin: '0 0 16px',
  whiteSpace: 'pre',
}

export default function JsonPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/json">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />JSON 포맷터
      </h1>
      <p className="tp-lead">
        JSON 정렬·압축·검증·트리 뷰 + <strong style={{ color: 'var(--text)' }}>TypeScript 인터페이스 자동</strong> + YAML/CSV 변환.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="JSON 문법 RFC 8259·ECMA-404 · YAML 1.2.2(코어 스키마) · 브라우저 JSON.parse/stringify · YAML 처리 js-yaml 4 · CSV 따옴표 규칙 RFC 4180"
        sources={[
          { label: 'RFC 8259 JSON 데이터 교환 형식', href: 'https://www.rfc-editor.org/rfc/rfc8259' },
          { label: 'ECMA-404 JSON 문법', href: 'https://ecma-international.org/publications-and-standards/standards/ecma-404/' },
          { label: 'YAML 1.2.2 명세', href: 'https://yaml.org/spec/1.2.2/' },
          { label: 'MDN JSON.stringify()', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify' },
          { label: 'RFC 4180 CSV 형식', href: 'https://www.rfc-editor.org/rfc/rfc4180' },
        ]}
      />

      <JsonClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. JSON 기본 ── */}
        <div>
          <h2 className="g-h2">
            JSON(JavaScript Object Notation)이란?
          </h2>
          <p className="g-p">
            JSON은 값 종류가 <strong>6가지(문자열·숫자·불리언·null·객체·배열)</strong>뿐인 데이터 교환 포맷으로, 현행 표준은 IETF의 RFC 8259(2017)와
            같은 문법을 정의한 ECMA-404입니다. 문법이 작다고 함정까지 없는 것은 아닙니다 — <strong>숫자의 정밀도는 표준이 규정하지 않아 언어(구현체)마다 다르고</strong>,
            JavaScript 값 중 일부는 직렬화할 때 조용히 사라지며, 한글 이스케이프 기본값도 JavaScript와 Python이 서로 반대입니다.
            아래에서 오류 메시지별 원인, 이런 함정, 변환 탭의 동작 규칙, 그리고 CLI에서 짝으로 쓰는 jq 치트시트까지 다룹니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># JSON 기본 데이터 타입</span></div>
            <div><span style={{ color: 'var(--cyan-600)' }}>&quot;string&quot;</span> · <span style={{ color: 'var(--yellow-700)' }}>123</span> · <span style={{ color: 'var(--purple-600)' }}>true / false</span> · <span style={{ color: 'var(--muted)' }}>null</span></div>
            <div><span style={{ color: 'var(--muted)' }}>{'{ object }'}</span> · <span style={{ color: 'var(--muted)' }}>{'[ array ]'}</span></div>
          </div>
        </div>

        {/* ── 2. 파싱 오류 메시지 ── */}
        <div>
          <h2 className="g-h2">
            JSON 파싱 오류 — 메시지별 원인과 고치는 법
          </h2>
          <p className="g-p">
            정렬·압축·검증 탭은 브라우저 내장 <code>JSON.parse</code>로 검사하고, 오류 메시지 속 <code>position N</code>(0부터 센 문자 위치)이나
            <code> line N column N</code>을 찾아 해당 줄과 ^ 표시로 위치를 보여 줍니다. 아래 표의 메시지는 Chrome·Edge·Node.js가 쓰는 V8 엔진에
            잘못된 입력을 실제로 넣어 이 페이지를 빌드할 때 받은 문구입니다. Firefox·Safari는 문구가 다르므로 &apos;원인&apos; 열로 대조하세요.
            표시되는 위치는 오류가 <strong>발견된</strong> 곳이라, 마지막 쉼표처럼 원인이 바로 앞 글자에 있는 경우가 많습니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 720 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>원인</th>
                  <th scope="col" style={TH}>잘못된 입력</th>
                  <th scope="col" style={TH}>V8 오류 메시지</th>
                  <th scope="col" style={TH}>고치는 법</th>
                </tr>
              </thead>
              <tbody>
                {PARSE_ERRORS.map((r) => (
                  <tr key={r.cause} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.cause}</th>
                    <td style={TD_MONO}>{r.shown}</td>
                    <td style={{ ...TD_MONO, color: 'var(--muted)' }}>{r.msg}</td>
                    <td style={TD}>{r.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">↵는 문자열 안의 실제 줄바꿈, [BOM]은 보이지 않는 U+FEFF 문자를 표시한 것입니다.</p>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>BOM</strong>은 표준이 애매하게 다루는 경우입니다. RFC 8259는 JSON을 만드는 쪽이 BOM을 붙이면 안 된다(MUST NOT)고 하면서, 읽는 쪽은
            오류 대신 무시해도 된다(MAY)고 허용합니다. 그래서 jq처럼 BOM을 건너뛰는 도구에서는 멀쩡하던 파일이 <code>JSON.parse</code>에서만 실패할 수 있습니다.
            대표적인 경우가 Node.js에서 <code>fs.readFileSync(경로, &apos;utf8&apos;)</code>로 읽은 뒤 <code>JSON.parse</code>할 때입니다 — Node는 BOM을 지우지 않습니다(브라우저의
            <code>response.json()</code>·<code>TextDecoder</code>는 지움). 메모장·Excel에서 &apos;UTF-8(BOM)&apos;으로 저장한 파일이 스크립트에서만 첫 글자 오류를 낸다면 이것부터 의심하세요.
          </p>
          <p className="g-p">
            오류가 나지 않아 더 위험한 경우도 있습니다. RFC 8259는 객체 안의 이름이 고유해야 한다(SHOULD)고 권고만 하므로 <code>{'{"a": 1, "a": 2}'}</code>도
            문법상 유효하고, <code>JSON.parse</code>는 마지막 값만 남깁니다(결과 <code>{DUP_PARSED}</code>). 설정 파일을 병합하다 생긴 중복 키를 찾고 싶다면
            YAML ↔ JSON 탭에서 방향을 &apos;YAML → JSON&apos;으로 고정하고 넣어 보세요. YAML은 중복 키를 허용하지 않아 <code>{DUP_YAML_MSG}</code> 오류와 위치를 알려 줍니다.
          </p>
        </div>

        {/* ── 3. 2^53 정밀도 한계 ── */}
        <div>
          <h2 className="g-h2">
            JSON.parse가 64비트 ID를 조용히 바꾸는 이유 — 2⁵³ 한계
          </h2>
          <p className="g-p">
            RFC 8259는 숫자의 범위·정밀도를 구현체 재량에 맡기되, 호환성을 위해 IEEE 754 배정밀도(double)가 정확히 표현하는 범위를 기준으로 삼으라고 안내합니다.
            JavaScript는 모든 숫자를 double로 다루기 때문에 정수는 <strong>2⁵³−1 = {MAX_SAFE}</strong>(Number.MAX_SAFE_INTEGER)까지만 정확합니다.
            트위터(X) ID나 스노우플레이크 방식 주문번호처럼 <strong>64비트 정수 ID</strong>가 이 한계를 넘으면, JSON.parse는 오류 한 줄 없이 끝자리를 반올림해 버립니다.
            본 도구도 브라우저 JSON.parse를 쓰므로, 큰 정수가 든 JSON을 정렬·압축하면 같은 방식으로 바뀐 값이 출력됩니다.
          </p>
          <pre style={CODE_BOX}>{`# 실제로 깨지는 예 (브라우저·Node.js 공통, 이 페이지 빌드 때 실행한 결과)
JSON.parse('${BIG_SRC}').id
// → ${BIG_OUT}
JSON.parse('9007199254740993')
// → ${SAFE_OUT}`}</pre>
          <p className="g-p">
            대처는 세 가지입니다. ① <strong>서버가 ID를 문자열로 직렬화</strong> — 트위터 API v1.1이 숫자 <code>id</code>와 별도로 문자열 <code>id_str</code>을 함께 내려주고,
            v2부터는 ID를 아예 문자열로만 주는 이유가 바로 이것입니다. ② <strong>json-bigint 같은 대체 파서</strong> — 큰 정수를 BigInt로 보존하며 파싱합니다.
            ③ BigInt를 직접 쓸 때는 반대 방향을 주의하세요 — <strong>JSON.stringify는 BigInt를 직렬화하지 못하고 TypeError</strong>를 던집니다(아래 표).
            참고로 Python의 int는 임의 정밀도라 같은 JSON도 값이 온전히 유지되고, jq 1.7은 큰 정수를 계산 없이 통과시키면(<code>jq .</code>) 자릿수를 그대로 유지합니다.
            &quot;Python·jq에선 맞는데 JS에서만 ID가 다르다&quot;면 십중팔구 이 문제입니다.
          </p>
        </div>

        {/* ── 4. JSON.stringify ── */}
        <div>
          <h2 className="g-h2">
            JSON.stringify가 조용히 바꾸거나 지우는 값
          </h2>
          <p className="g-p">
            JSON을 <em>만드는</em> 쪽에서도 데이터가 소리 없이 달라집니다. JavaScript 값 중 JSON에 대응하는 타입이 없는 것은 JSON.stringify가 빼 버리거나
            다른 값으로 바꾸기 때문입니다. &apos;보낸 필드가 서버에 없다&apos;, &apos;숫자가 null로 왔다&apos; 같은 증상은 대개 여기서 시작합니다.
            &apos;결과&apos; 열은 이 페이지를 빌드할 때 실제로 실행한 출력입니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 640 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>JSON.stringify( … )</th>
                  <th scope="col" style={TH}>결과</th>
                  <th scope="col" style={TH}>무슨 일이 일어났나</th>
                </tr>
              </thead>
              <tbody>
                {STRINGIFY_ROWS.map((r) => (
                  <tr key={r.js} style={ROW}>
                    <td style={TD_MONO}>{r.js}</td>
                    <td style={TD_MONO}>{r.out}</td>
                    <td style={TD}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            필드를 빼지 않고 &quot;값 없음&quot;을 명시하고 싶다면 <code>undefined</code> 대신 <code>null</code>을 넣으세요. 날짜는 ISO 8601 문자열로 주고받는 것이
            가장 무난하지만, 받는 쪽 JSON.parse는 이 문자열을 Date로 되돌려 주지 않으므로 reviver 함수나 스키마 라이브러리로 직접 변환해야 합니다.
          </p>
        </div>

        {/* ── 5. JSON vs JSON5 vs JSONC ── */}
        <div>
          <h2 className="g-h2">
            JSON vs JSON5 vs JSONC
          </h2>
          <p className="g-p">
            설정 파일에서 &quot;JSON인데 주석이 된다&quot;면 대개 JSONC나 JSON5입니다. 주석이나 확장 문법이 들어 있으면 순수 JSON 파서(본 도구 포함)에서 오류가 나므로,
            API로 보내거나 다른 프로그램에 넘기기 전에 표준 JSON으로 바꿔야 합니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 560 }}>
              <thead>
                <tr style={ROW}>
                  {['기능', 'JSON (RFC 8259)', 'JSON5', 'JSONC'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '주석 (// · /* */)',     a: '불가', b: '허용', c: '허용' },
                  { k: '마지막 쉼표',            a: '불가', b: '허용', c: '파서마다 다름 (tsconfig·VS Code 설정 파일은 허용)' },
                  { k: '작은따옴표 문자열',      a: '불가', b: '허용', c: '불가' },
                  { k: '따옴표 없는 키',         a: '불가', b: '허용 (식별자 형태)', c: '불가' },
                  { k: '16진수·Infinity·NaN',    a: '불가', b: '허용', c: '불가' },
                  { k: '규격',                   a: 'IETF RFC 8259 · ECMA-404', b: 'JSON5 명세(spec.json5.org)', c: '공식 표준 없음 (jsonc.org 초안 · VS Code 구현이 사실상 기준)' },
                  { k: '주요 사용처',            a: 'API·데이터 교환', b: '사람이 쓰는 설정 파일', c: 'tsconfig.json·VS Code 설정' },
                ].map((r) => (
                  <tr key={r.k} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left' }}>{r.k}</th>
                    <td style={TD}>{r.a}</td>
                    <td style={TD}>{r.b}</td>
                    <td style={TD}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 정렬 vs 압축 ── */}
        <div>
          <h2 className="g-h2">
            JSON 정렬(Beautify) vs 압축(Minify) — gzip을 켜면 차이는?
          </h2>
          <p className="g-p">
            정렬은 들여쓰기·줄바꿈을 넣어 사람이 읽기 좋게, 압축은 의미 없는 공백을 모두 지워 한 줄로 만듭니다. 파싱하면 같은 데이터이고, 정렬 탭의 크기 비교는
            입력을 UTF-8 바이트로 셉니다. 가이드 예시 <code>{SAMPLE_MIN}</code>은 압축 {fmtB(SAMPLE_MIN_B)}, 2칸 정렬 {fmtB(SAMPLE_P2_B)}, 4칸 정렬 {fmtB(SAMPLE_P4_B)}입니다.
            그런데 웹에서는 응답을 gzip·brotli로 한 번 더 압축해 보내는 경우가 많아, 실제 전송량 차이는 이보다 훨씬 작습니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 680 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>데이터</th>
                  <th scope="col" style={TH_NUM}>정렬(2칸)</th>
                  <th scope="col" style={TH_NUM}>압축</th>
                  <th scope="col" style={TH_NUM}>압축 효과</th>
                  <th scope="col" style={TH_NUM}>gzip 후 정렬</th>
                  <th scope="col" style={TH_NUM}>gzip 후 압축</th>
                  <th scope="col" style={TH_NUM}>gzip 후 차이</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((r) => (
                  <tr key={r.label} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left' }}>{r.label}</th>
                    <td style={TD_NUM}>{fmtB(r.p)}</td>
                    <td style={TD_NUM}>{fmtB(r.m)}</td>
                    <td style={TD_NUM}>{pct(-r.save)}</td>
                    <td style={TD_NUM}>{fmtB(r.gp)}</td>
                    <td style={TD_NUM}>{fmtB(r.gm)}</td>
                    <td style={TD_NUM}>{pct(-r.gzSave)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            이 페이지를 빌드할 때 Node.js zlib 기본 수준(6)으로 계산. 앞의 세 줄은 YAML ↔ JSON 탭 예시 데이터(package.json은 그대로, K8s·OpenAPI는 도구와 같은 함수로 YAML → JSON 변환)이고, 사용자 50건 배열은 크기 비교용 예시 데이터입니다.
          </p>
          <p className="g-p" style={{ marginTop: 16 }}>
            압축만 하면 크기가 {MIN_SAVE_RANGE} 줄지만, gzip을 거친 뒤에는 정렬본과의 차이가 {GZ_SAVE_RANGE}로 좁혀집니다. 들여쓰기 공백은 같은 패턴이 반복돼
            gzip이 대부분 압축해 버리기 때문입니다. 그래서 전송량을 줄이려면 ① 서버·CDN의 gzip·brotli 전송 압축이 켜져 있는지부터 확인하고(응답 헤더
            <code> Content-Encoding</code>) ② 압축(Minify)은 그 위에 더하는 작은 이득으로 보면 됩니다. 반대로 로그·설정 파일처럼 사람이 열어 볼 파일은
            정렬해 두는 편이 diff·리뷰에 유리합니다.
          </p>
        </div>

        {/* ── 7. JSON → TypeScript ── */}
        <div>
          <h2 className="g-h2">
            JSON → TypeScript 인터페이스 자동 생성
          </h2>
          <p className="g-p">
            변환 탭의 TypeScript 인터페이스는 JSON <strong>한 건</strong>을 보고 타입을 추론합니다. 아래 두 결과는 이 페이지를 빌드할 때 도구와 같은 함수로 만든 출력
            그대로입니다. 첫 번째는 기본형, 두 번째는 추론이 한계에 부딪히는 경우를 일부러 모은 예시입니다.
          </p>
          <pre style={CODE_BOX}>{`# 입력\n${SAMPLE_MIN}\n\n# 출력\n${TS_BASIC}`}</pre>
          <pre style={CODE_BOX}>{`# 입력\n${JSON.stringify(TS_EDGE_IN)}\n\n# 출력\n${TS_EDGE}`}</pre>
          <ul className="g-list">
            <li><strong>배열은 첫 번째 원소만 봅니다</strong> — 두 번째 원소에만 있는 <code>memo</code>가 <code>ItemsItem</code>에서 빠진 이유입니다. 원소마다 모양이 다르면 <code>memo?: string</code>처럼 직접 보완하세요.</li>
            <li><strong>null과 빈 배열</strong>은 실제 타입을 알 수 없어 각각 <code>null</code>(주석 표시)·<code>unknown[]</code>으로 둡니다. 응답 여러 건을 보고 <code>string | null</code>, <code>string[]</code>처럼 고치세요.</li>
            <li><strong>전역 타입과 겹치는 이름</strong> — <code>response</code> 키가 <code>ResponseData</code>가 된 것처럼, <code>Response</code>·<code>Date</code>·<code>Event</code>·<code>Map</code> 등 TypeScript·DOM 전역 타입과 같은 이름에는 <code>Type</code>(이미 전역에 있으면 <code>Data</code>) 접미사를 붙여 충돌을 피합니다.</li>
            <li><strong>식별자로 못 쓰는 키</strong>(<code>user-id</code>, 숫자로 시작하는 키)는 <code>&quot;user-id&quot;</code>처럼 따옴표로 감쌉니다. 키 순서는 코드 단위 순(대문자가 소문자보다 앞)입니다.</li>
            <li><strong>같은 구조는 재사용</strong> — 키와 값 타입이 모두 같은 객체만 한 인터페이스로 합칩니다. 키 이름만 같고 타입이 다르면 <code>Address2</code>처럼 번호가 붙은 별도 인터페이스가 됩니다.</li>
          </ul>
          <p className="g-p">
            생성된 타입은 컴파일 시점의 약속일 뿐 런타임에 응답을 검사하지 않습니다. 외부 API처럼 모양이 바뀔 수 있는 데이터라면 스키마 검증을 따로 두세요.
          </p>
        </div>

        {/* ── 8. 변환 탭 동작 ── */}
        <div>
          <h2 className="g-h2">
            변환 탭 — YAML·CSV·키 정렬·이스케이프가 하는 일
          </h2>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 640 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>모드</th>
                  <th scope="col" style={TH}>하는 일</th>
                  <th scope="col" style={TH}>입력 → 출력 (빌드 시 실행)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>YAML</th>
                  <td style={TD}>JSON → YAML 한 방향. 들여쓰기 2칸, 긴 줄 자동 줄바꿈 없음. yes·on·날짜형·3.10처럼 YAML에서 타입이 바뀔 문자열은 따옴표로 감쌉니다.</td>
                  <td style={TD_MUTED}>아래 YAML 값 표 참고</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>CSV (배열만)</th>
                  <td style={TD}>객체 배열을 표로. 헤더는 모든 객체 키의 합집합(처음 나온 순서), 중첩 값은 JSON 문자열, null은 빈 칸. 쉼표·큰따옴표·줄바꿈이 든 칸은 큰따옴표로 감싸고 안의 &quot;는 &quot;&quot;로(RFC 4180 방식).</td>
                  <td style={TD_MONO}>{`${JSON.stringify(CSV_IN)}\n→\n${CSV_OUT}`}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>키 알파벳 정렬</th>
                  <td style={TD}>모든 깊이의 객체 키를 코드 단위 순으로 정렬. 배열 원소 순서는 데이터이므로 그대로 둡니다. 두 JSON을 diff하기 전 정규화용(jq -S와 거의 같은 효과). 단, &quot;2&quot;·&quot;10&quot;처럼 정수 형태인 키는 JavaScript 객체 규칙상 항상 숫자 순으로 맨 앞에 옵니다(jq -S는 문자 순이라 &quot;10&quot;이 &quot;2&quot;보다 앞).</td>
                  <td style={TD_MUTED}>—</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>문자열 이스케이프</th>
                  <td style={TD}>압축한 JSON 전체를 한 번 더 JSON 문자열로 감쌉니다. 코드 속 문자열 리터럴, 환경 변수, 다른 JSON의 필드 값으로 넣을 때.</td>
                  <td style={TD_MONO}>{`${JSON.stringify(ESC_IN)}\n→\n${ESC_OUT}`}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>이스케이프 해제</th>
                  <td style={TD}>입력이 JSON 문자열이면 한 번 풀고, 그 안이 다시 JSON이면 선택한 들여쓰기로 정렬합니다. 로그에 문자열로 찍힌 JSON을 읽을 때.</td>
                  <td style={TD_MONO}>{`${UNESC_IN}\n→\n${UNESC_OUT}`}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            변환 탭의 YAML은 JSON → YAML 한 방향입니다. YAML을 JSON으로 되돌리거나 YAML 문법을 검증하려면 마지막
            <strong> YAML ↔ JSON 탭</strong>을 쓰세요 — 두 형식의 차이와 변환 때 사라지는 정보는
            아래 <a href="#yaml-json">YAML ↔ JSON 섹션</a>에 정리했습니다. TypeScript 인터페이스는 위 절을 참고하세요.
          </p>
          <Callout tone="tip" title="CSV를 Excel에서 열었더니 한글이 깨진다면">
            출력 CSV는 UTF-8 텍스트입니다. 파일로 저장해 Excel에서 바로 열면 한글이 깨질 수 있으니, Excel의 <strong>데이터 → 텍스트/CSV에서</strong>로 가져오면서
            파일 원본을 &apos;65001: 유니코드(UTF-8)&apos;로 지정하거나, 저장할 때 &apos;UTF-8(BOM)&apos; 인코딩을 고르세요. Google Sheets는 UTF-8을 그대로 읽습니다.
          </Callout>
        </div>

        {/* ── 9. 통계 읽는 법 ── */}
        <div>
          <h2 className="g-h2">
            통계·크기 표시 읽는 법
          </h2>
          <p className="g-p">
            유효한 JSON을 넣으면 입력칸 아래에 네 가지 수치가 뜹니다. 가이드 예시 <code>{SAMPLE_MIN}</code>(2칸 정렬 상태로 입력)을 기준으로 계산하면 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 560 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>항목</th>
                  <th scope="col" style={TH}>세는 방법</th>
                  <th scope="col" style={TH_NUM}>예시 값</th>
                </tr>
              </thead>
              <tbody>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>키 개수</th>
                  <td style={TD}>모든 객체의 키를 중첩까지 합산. 배열 원소는 키로 세지 않습니다.</td>
                  <td style={TD_NUM}>{SAMPLE_STATS.keys}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>객체 / 배열</th>
                  <td style={TD}>최상위를 포함한 객체·배열의 개수</td>
                  <td style={TD_NUM}>{SAMPLE_STATS.objects} / {SAMPLE_STATS.arrays}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>최대 깊이</th>
                  <td style={TD}>최상위 값을 0으로 두고 객체·배열 안으로 들어갈 때마다 +1. YAML ↔ JSON 탭의 &apos;중첩 깊이&apos;와 같은 기준입니다.</td>
                  <td style={TD_NUM}>{SAMPLE_STATS.depth}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>크기</th>
                  <td style={TD}>입력 텍스트의 UTF-8 바이트. 영문·숫자·공백은 1바이트, 한글 1자는 3바이트입니다.</td>
                  <td style={TD_NUM}>{fmtB(SAMPLE_P2_B)}</td>
                </tr>
                <tr style={ROW}>
                  <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>압축 절약률</th>
                  <td style={TD}>(원본 − 압축) ÷ 원본. 정렬·압축 탭에만 표시하며, 원본이 이미 한 줄이라 줄어들 게 없으면 표시하지 않습니다.</td>
                  <td style={TD_NUM}>{(((SAMPLE_P2_B - SAMPLE_MIN_B) / SAMPLE_P2_B) * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            &apos;원본 입력&apos;은 붙여 넣은 텍스트 그대로의 크기이고 &apos;정렬&apos;은 선택한 들여쓰기로 다시 만든 크기입니다. 4칸으로 들여쓴 JSON을 붙여 넣고 2칸을 고르면
            정렬 결과가 원본보다 작게 나오는 것이 정상입니다. 깊이가 예상보다 크면 트리 뷰어 탭에서 ▾로 접어 가며 어느 가지가 깊은지 찾으면 됩니다.
          </p>
        </div>

        {/* ── 10. 한글 이스케이프 비교 ── */}
        <div>
          <h2 className="g-h2">
            한글 이스케이프 — JS와 Python의 기본값이 반대입니다
          </h2>
          <p className="g-p">
            같은 &quot;한&quot;이라도 직렬화 결과는 언어마다 다릅니다. JavaScript의 JSON.stringify는 한글을 그대로 내보내지만,
            Python의 json.dumps는 기본 옵션 <strong>ensure_ascii=True</strong> 때문에
            <code>{'\\ud55c'}</code> 형태로 이스케이프합니다. 두 표기는 표준상 완전히 동등해서 어떤 파서든 같은 문자열로 읽지만,
            파일 크기와 사람이 읽을 수 있는지가 달라집니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 480 }}>
              <thead>
                <tr style={ROW}>
                  {['항목', 'JS JSON.stringify', 'Python json.dumps'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '\'한\' 직렬화 결과',   a: '"한" (그대로)',        b: '"\\ud55c" (이스케이프)' },
                  { k: '동작 바꾸는 옵션',      a: '없음 (항상 그대로)',    b: 'ensure_ascii=False' },
                  { k: '\'한\' 1자 크기(UTF-8)', a: '3바이트',             b: '6바이트 (2배)' },
                  { k: '파싱 결과',            a: '동일한 \'한\'',        b: '동일한 \'한\'' },
                ].map((r) => (
                  <tr key={r.k} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left' }}>{r.k}</th>
                    <td style={TD}>{r.a}</td>
                    <td style={TD}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            실무 팁: Python 로그에서 복사한 <code>\uXXXX</code> 덩어리도 유효한 JSON이므로,
            본 도구에 붙여넣고 <strong>정렬(Beautify)만 해도 원래 한글로 표시</strong>됩니다.
            반대로 JSON을 JS 코드 문자열 안에 임베드할 때는 변환 탭의 &apos;문자열 이스케이프&apos;를, <code>\uXXXX</code>를 풀 때는
            &apos;이스케이프 해제&apos;를 쓰면 됩니다. 한글 비중이 큰 데이터는 이스케이프 시 글자당 3바이트 → 6바이트로 커지므로,
            전송·저장용이라면 Python 쪽에서 ensure_ascii=False로 끄는 편이 이득입니다.
          </p>
        </div>

        {/* ── 11. jq 실전 치트시트 ── */}
        <div>
          <h2 className="g-h2">
            jq 실전 치트시트 — 화면에서 확인, CLI에서 반복
          </h2>
          <p className="g-p">
            구조 파악은 본 도구의 트리 뷰가 빠르지만, 같은 처리를 스크립트·파이프라인에서 반복할 땐 jq가 표준입니다.
            아래는 예시 JSON <code>{'{"users":[{"name":"kim","age":32},{"name":"lee","age":25},{"name":"park","age":41}]}'}</code> 기준,
            jq 1.7 실행 결과로 확인한 자주 쓰는 필터입니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 560 }}>
              <thead>
                <tr style={ROW}>
                  {['명령', '용도', '출력'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: "jq '.users[].name'",                u: '특정 키만 추출',            o: '"kim" "lee" "park"' },
                  { c: "jq -r '.users[0].name'",            u: '따옴표 없이 원시 출력',      o: 'kim' },
                  { c: "jq '.users[] | select(.age >= 30)'", u: '조건으로 필터',             o: 'kim·park 객체만' },
                  { c: "jq '.users | map(.name)'",          u: '배열로 재구성',             o: '["kim","lee","park"]' },
                  { c: "jq '.users | sort_by(.age)'",       u: '값 기준 정렬',              o: '나이 오름차순 배열 (lee·kim·park)' },
                  { c: "jq '.users | length'",              u: '개수 세기',                 o: '3' },
                  { c: "jq 'keys'",                          u: '최상위 키 목록',            o: '["users"]' },
                  { c: 'jq -c .',                            u: '압축(Minify)',              o: '한 줄 JSON' },
                  { c: 'jq -S .',                            u: '키 재귀 정렬',              o: '본 도구 \'키 정렬\'과 거의 같은 정규화(정수 형태 키 순서만 다름)' },
                ].map((r) => (
                  <tr key={r.c} style={ROW}>
                    <td style={{ ...TD, fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.c}</td>
                    <td style={TD}>{r.u}</td>
                    <td style={{ ...TD_MONO, color: 'var(--muted)' }}>{r.o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            가장 요긴한 조합은 <strong>키 정렬 diff</strong>입니다.
            <code>-S</code>가 모든 키를 재귀적으로 알파벳 정렬해 주므로(본 도구의 변환 → 키 정렬과 거의 같은 정규화 — &quot;2&quot;·&quot;10&quot; 같은 정수 형태 키의 순서만 다름),
            키 순서만 다른 두 JSON은 diff가 비어 있게 됩니다.
          </p>
          <pre style={CODE_BOX}>{`# 두 JSON을 의미 기준으로 비교 (키 순서 차이 무시)
diff <(jq -S . a.json) <(jq -S . b.json)`}</pre>
        </div>

        {/* ── 12. YAML ↔ JSON 탭 (구 /tools/dev/yaml-json) ── */}
        <div>
          <h2 className="g-h2" id="yaml-json">
            YAML ↔ JSON 탭 — 양방향 변환·검증·예시 {EXAMPLES.length}개
          </h2>
          <p className="g-p">
            마지막 <strong>YAML ↔ JSON</strong> 탭은 설정 파일용 작업 공간입니다. 하위 탭 세 개로 나뉩니다.
          </p>
          <ol className="g-list">
            <li><strong>변환</strong> — 왼쪽에 YAML/JSON 붙여넣기 → 오른쪽 자동 변환. 형식 자동 감지 + 방향(자동·YAML → JSON·JSON → YAML)·들여쓰기(2·4칸·Tab)·JSON Pretty/Compact·키 알파벳 정렬 옵션. 입력이 바뀌면 200ms 뒤 다시 계산합니다.</li>
            <li><strong>검증</strong> — 단일 입력 + 형식 자동 감지 + 유효성 + 통계(줄·키·깊이·문자·바이트·실행 시간) + 최상위 5개 항목 구조 미리보기. 유효하면 &apos;변환 탭으로 보내기&apos;로 바로 넘깁니다.</li>
            <li><strong>예시 {EXAMPLES.length}개</strong> — Kubernetes(Pod·Deployment·ConfigMap·Helm values)·Docker Compose·GitHub Actions·GitLab CI·Spring(application.yml·멀티 프로파일)·OpenAPI 3.0·package.json·tsconfig.json. 누르면 변환 탭에 바로 적용됩니다.</li>
          </ol>
          <p className="g-p">
            이 탭의 입력·옵션은 이 브라우저에 자동 저장되고, 결과는 복사하거나 convert-YYYYMMDD.json/.yaml 파일로 저장할 수 있습니다.
            YAML을 읽을 때는 YAML 1.2 코어 스키마 규칙(js-yaml의 JSON_SCHEMA + 병합 키 <code>{'<<'}</code>)을 쓰므로 yes/no·날짜형 값이 문자열로 남습니다.
          </p>
          <h3 className="g-h3">자주 쓰는 변환 시나리오</h3>
          <ul className="g-list">
            <li><strong>Spring application.yml → JSON</strong> — 외부 시스템 연동·설정 백업·환경별 비교</li>
            <li><strong>K8s 매니페스트 → JSON</strong> — jq로 필드를 골라내거나 JSON만 받는 스크립트·API에 넘길 때</li>
            <li><strong>GitHub Actions YAML 검증</strong> — 워크플로 푸시 전 들여쓰기·구문 오류 사전 발견</li>
            <li><strong>OpenAPI YAML → JSON</strong> — 일부 SDK 생성 도구는 JSON만 지원</li>
            <li><strong>Helm values.yaml → JSON</strong> — 외부 시크릿 매니저(Vault·AWS Secrets Manager) 연동</li>
            <li><strong>Docker Compose 검증</strong> — 멀티 서비스 정의 들여쓰기·키 오타 확인</li>
            <li><strong>운영 설정 ↔ 백업</strong> — JSON 백업·아카이브 → YAML 편집 후 다시 적용</li>
          </ul>
          <Callout tone="warn" title="운영 설정 파일은 변환 전후를 반드시 검증하세요">
            변환·검증은 모두 <strong>브라우저에서 실행</strong>되며 입력 데이터는 외부로 전송되지 않습니다.
            YAML → JSON 변환 시 <strong>주석·앵커·별칭 정보가 손실</strong>되고 해석할 수 없는 커스텀 태그(!Ref 등)는 변환 오류로 표시되니, K8s·Spring 등 운영 환경 설정 파일은 변환 전후
            <strong> 반드시 검증·테스트 후 적용</strong>하세요. 입력은 500KB로 제한되며, 깊은 중첩(100단계 이상)이나 매우 큰 파일은 일부 브라우저에서 느릴 수 있습니다.
            분야별 안전 안내는 <Link href="/disclaimer#dev">면책조항</Link> 참고.
          </Callout>
        </div>

        {/* ── 13. YAML vs JSON 비교 ── */}
        <div>
          <h2 className="g-h2">
            YAML vs JSON 비교
          </h2>
          <p className="g-p">
            두 형식은 <strong>같은 데이터 구조</strong>(객체·배열·문자열·숫자·boolean·null)를 표현하지만 문법이 크게 다릅니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 480 }}>
              <thead>
                <tr style={ROW}>
                  {['항목', 'YAML', 'JSON'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['주석', '# 지원', '미지원'],
                  ['들여쓰기', '의미 있음 (구조를 결정)', '무의미 (가독성용)'],
                  ['따옴표', '선택적', '문자열 필수 (")'],
                  ['키 표기', '"" 없이 가능', '반드시 "key"'],
                  ['마지막 쉼표', '블록 스타일엔 쉼표가 없음 · 플로 스타일 [a, b, ]은 허용', '금지 (오류)'],
                  ['데이터 타입', '따옴표 없는 값을 자동 추론 (아래 표의 함정)', '문법으로 명시'],
                  ['중복 키', '오류', '문법상 허용 (JSON.parse는 마지막 값)'],
                  ['멀티 도큐먼트', '--- 구분', '1 도큐먼트만'],
                  ['앵커/별칭', '지원 (& *)', '미지원'],
                  ['스펙 복잡도', '높음', '단순'],
                  ['주 사용처', 'DevOps·CI·설정', 'API·웹 데이터'],
                ].map((r) => (
                  <tr key={r[0]} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left' }}>{r[0]}</th>
                    <td style={TD}>{r[1]}</td>
                    <td style={TD}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>일반 룰</strong>: 사람이 자주 편집하는 설정 파일(K8s·CI·Spring) → YAML, API/웹 데이터 교환 → JSON.
          </p>
        </div>

        {/* ── 14. YAML 값 해석 ── */}
        <div>
          <h2 className="g-h2">
            따옴표 없이 쓰면 값이 바뀌는 YAML — 1.1과 1.2 규칙 비교
          </h2>
          <p className="g-p">
            YAML은 따옴표 없는 값의 타입을 모양으로 추측합니다. 문제는 그 규칙이 버전마다 다르다는 점입니다. 2009년에 나온 YAML 1.2는 JSON과 맞추려고 규칙을 줄였지만,
            PyYAML(Ansible 등)처럼 1.1 규칙을 따르는 파서가 여전히 많이 쓰입니다. 같은 파일이 도구마다 다르게 읽히는 이유입니다.
            &apos;본 도구&apos; 열은 YAML ↔ JSON 탭이 실제로 읽은 값(JSON 표기), &apos;PyYAML&apos; 열은 PyYAML 6.0의 <code>yaml.safe_load</code> 결과(Python 표기)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 720 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>YAML 값</th>
                  <th scope="col" style={TH}>본 도구 (1.2 규칙)</th>
                  <th scope="col" style={TH}>PyYAML (1.1 규칙)</th>
                  <th scope="col" style={TH}>문자열로 두려면</th>
                  <th scope="col" style={TH}>메모</th>
                </tr>
              </thead>
              <tbody>
                {YAML_VALUE_ROWS.map((r) => (
                  <tr key={r.src} style={ROW}>
                    <th scope="row" style={{ ...TD_MONO, fontWeight: 600, textAlign: 'left' }}>{`v: ${r.src}`}</th>
                    <td style={TD_MONO}>{r.tool}</td>
                    <td style={TD_MONO}>{r.py}</td>
                    <td style={TD_MONO}>{r.quoted}</td>
                    <td style={TD}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">&apos;문자열로 두려면&apos; 열은 YAML ↔ JSON 탭에서 JSON → YAML로 변환했을 때의 출력입니다. 변환 탭의 YAML 모드는 같은 값을 작은따옴표(&apos;yes&apos;)로 감쌉니다.</p>
          <p className="g-p" style={{ marginTop: 16 }}>
            가장 안전한 습관은 <strong>숫자·boolean으로 쓸 게 아니면 따옴표로 감싸는 것</strong>입니다. 특히 버전 번호(3.10), 파일 권한(0755), 포트 매핑(22:22),
            국가·언어 코드(노르웨이 NO·노르웨이어 no), 앞자리 0이 있는 코드(007)는 어느 파서를 쓰든 따옴표가 정답입니다. 본 도구로 JSON → YAML 변환하면 이런 문자열을 자동으로 따옴표로 감싸므로,
            Ansible(PyYAML)·Spring Boot(SnakeYAML)처럼 1.1 규칙으로 읽는 곳에 넘겨도 값이 바뀌지 않습니다.
          </p>
        </div>

        {/* ── 15. 변환 시 손실 정보 ── */}
        <div>
          <h2 className="g-h2">
            YAML → JSON 변환 시 손실되는 정보
          </h2>
          <ul className="g-list">
            <li><strong>주석 (#)</strong> — JSON은 주석을 지원하지 않으므로 모두 삭제. <strong>역변환 시 복원 불가</strong></li>
            <li><strong>앵커 (&amp;) / 별칭 (*)</strong> — 펼쳐져 데이터 중복으로 변환됨. 참조 관계 손실. 병합 키 <code>{'<<: *defaults'}</code>도 값이 합쳐진 형태로 펼쳐짐</li>
            <li><strong>멀티 도큐먼트 (---)</strong> — JSON 배열로 통합 변환 (구분 정보 손실)</li>
            <li><strong>태그 (!·!!)</strong> — <code>!Ref</code>(CloudFormation)·<code>!!python/object</code> 같은 커스텀 태그와, JSON에 대응 타입이 없는 <code>!!timestamp</code>·<code>!!binary</code>는 해석하지 않고 변환 오류로 표시. <code>!!str 123</code>처럼 JSON 타입으로 바꾸는 표준 태그는 적용됨</li>
            <li><strong>JSON에 없는 값</strong> — <code>.inf</code>·<code>.nan</code>은 JSON에 대응 값이 없어 <code>null</code>로 바뀜. 날짜처럼 보이는 <code>2026-09-26</code>은 문자열 그대로 유지</li>
            <li><strong>따옴표 없는 값의 해석</strong> — 본 도구는 1.2 규칙이라 <code>0755</code>를 10진수 755로, <code>3.10</code>을 3.1로 읽습니다(위 표). 원래 표기를 살려야 하면 원본 YAML에서 따옴표로 감싸세요</li>
          </ul>
          <p className="g-p">
            YAML ↔ JSON 탭은 주석·앵커/별칭·멀티 도큐먼트를 변환 결과 아래 경고로 알려 주고, 해석할 수 없는 태그는 변환 오류로 표시합니다.
            원본 보존이 필요하면 변환하지 말고 원본 형식 그대로 쓰세요.
          </p>
        </div>

        {/* ── 16. 흔한 YAML 오류 ── */}
        <div>
          <h2 className="g-h2">
            흔한 YAML 오류 — 도구가 내는 메시지와 원인
          </h2>
          <p className="g-p">
            아래 메시지는 YAML ↔ JSON 탭이 쓰는 js-yaml이 각 입력에 실제로 낸 오류의 첫 줄입니다. 괄호 안 숫자는 (줄:열)로, 파서가 더 읽지 못하고 멈춘
            곳이라 실제 원인보다 뒤(때로는 입력 끝 다음 줄)를 가리킬 수 있습니다. 마지막 두 줄처럼
            <strong> 오류 없이 값만 바뀌는</strong> 경우가 더 위험하니, 변환 결과를 꼭 눈으로 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 720 }}>
              <thead>
                <tr style={ROW}>
                  <th scope="col" style={TH}>원인</th>
                  <th scope="col" style={TH}>잘못된 YAML</th>
                  <th scope="col" style={TH}>도구 결과</th>
                  <th scope="col" style={TH}>고치는 법</th>
                </tr>
              </thead>
              <tbody>
                {YAML_ERRORS.map((r) => (
                  <tr key={r.cause} style={ROW}>
                    <th scope="row" style={{ ...TD, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.cause}</th>
                    <td style={{ ...TD_MONO, whiteSpace: 'pre' }}>{r.shown.replace(/↵/g, '\n')}</td>
                    <td style={{ ...TD_MONO, color: 'var(--muted)' }}>{r.outcome}</td>
                    <td style={TD}>{r.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">⇥는 탭 문자를 표시한 것입니다.</p>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 17. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 18. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/charcount',     icon: '🔡', name: '글자수 세기',           desc: '바이트·트위터 가중치·플랫폼 한도' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/art/lorem',         icon: '📝', name: '더미 텍스트 생성기',    desc: 'Lorem Ipsum·한글 더미' },
              { href: '/tools/art/color',         icon: '🎨', name: '색상 코드 변환기',      desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 단위 변환기',          desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/unit/battery',      icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh·Ah 변환' },
              { href: '/tools/dev/regex',         icon: '🔍', name: '정규식 테스트기',       desc: '매칭·캡처·치환·치트시트' },
              { href: '/tools/dev/hash',          icon: '🔒', name: '해시 생성기',           desc: 'MD5·SHA·HMAC·파일 무결성' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
