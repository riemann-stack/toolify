import Link from 'next/link'
import JsonClient from './JsonClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/json',
  title: 'JSON 포맷터 — 정렬·검증·트리 뷰·TS 인터페이스 + YAML ↔ JSON 변환',
  description: 'JSON 정렬·압축·검증·트리 뷰 + TypeScript 인터페이스 자동 생성 + YAML·CSV 변환·키 정렬·에러 위치. YAML ↔ JSON 양방향 변환·검증 탭(K8s·Compose·Actions 예시 12개)까지.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON트리뷰어', 'JSON유효성검사', 'JSON to TypeScript', 'JSON to YAML', 'JSON to CSV', 'JSON정렬키', 'JSON에러위치', 'YAML JSON 변환', 'yaml to json', 'YAML 검증', 'Kubernetes YAML', 'Docker Compose', 'GitHub Actions yaml'],
})

const FAQ_LD = [
              {
                q: 'JSON에 주석을 쓰면 왜 오류가 나나요?',
                a: 'JSON 표준(RFC 8259)은 <strong>주석을 허용하지 않습니다.</strong> Douglas Crockford는 "주석을 허용하면 사람들이 파싱 지시문을 적기 시작해 호환성이 깨질 수 있어 의도적으로 뺐다"고 밝혔습니다. 주석이 필요하면 <strong>JSON5</strong>(트레일링 컴마·주석·작은따옴표 허용)나 <strong>JSONC</strong>(VSCode·tsconfig.json에서 사용)를 사용하세요. 같은 이유로 YAML → JSON 변환 때 YAML의 <code>#</code> 주석은 모두 제거되고, 다시 YAML로 되돌려도 복원되지 않습니다. <strong>YAML ↔ JSON 탭</strong>은 입력에서 주석을 발견하면 경고로 알려 줍니다.',
              },
              {
                q: 'API 응답 JSON에서 TypeScript 타입을 자동 생성할 수 있나요?',
                a: '네, 본 도구의 <strong>변환 탭 → TypeScript 인터페이스</strong>를 사용하세요. JSON을 붙여넣으면 자동으로 인터페이스를 생성합니다. 중첩 객체는 별도 인터페이스로 분리되어 재사용 가능하며, 키는 알파벳 순으로 정렬됩니다. 샘플 값이 <code>null</code>인 필드는 실제 타입을 알 수 없어 <code>null</code>로 두고 주석을 달아 두니, <code>string | null</code>처럼 실제 타입으로 바꿔 쓰면 됩니다. 옵셔널 여부(<code>?</code>)는 JSON 한 건만으로는 판단할 수 없어 필요한 곳에 직접 붙이세요.',
              },
              {
                q: 'JSON Beautify(정렬)와 Minify(압축) 차이는?',
                a: '<strong>Beautify</strong>는 들여쓰기와 줄바꿈을 추가해 가독성을 높이는 작업으로, 디버깅이나 코드 리뷰 시 사용합니다. <strong>Minify</strong>는 모든 공백과 줄바꿈을 제거해 크기를 줄이는 작업으로, 네트워크 전송이나 저장 공간 절약이 필요할 때 사용합니다. API 응답은 보통 Minify로 전송하고, 분석할 때만 Beautify로 변환합니다. 감소 폭은 들여쓰기·중첩 깊이에 따라 달라지는데, 예를 들어 가이드 본문의 예시 JSON은 <strong>2칸 들여쓰기 74바이트 → 압축 52바이트(약 −30%)</strong>입니다.',
              },
              {
                q: 'JSON 파싱 오류 위치를 어떻게 찾나요?',
                a: 'JavaScript 표준 오류 메시지에는 보통 <code>at position N</code> 또는 <code>at line N column N</code> 형식으로 위치가 포함됩니다. 본 도구는 이를 자동으로 분석해 <strong>해당 라인의 텍스트와 컬럼 위치(^표시)</strong>를 보여줍니다. 자주 발생하는 원인은 ① trailing comma, ② 작은따옴표, ③ 키에 따옴표 누락, ④ 이스케이프되지 않은 특수문자입니다.',
              },
              {
                q: '두 JSON의 차이점을 비교하는 방법은?',
                a: '두 JSON을 비교하기 전 <strong>키 알파벳 정렬</strong>을 적용하면 순서 차이로 인한 가짜 diff를 제거할 수 있습니다. 본 도구의 <strong>변환 → 키 정렬</strong>로 정규화한 후, GitHub의 diff·VSCode의 비교 도구·jq 같은 CLI 도구로 의미적 차이만 확인하세요. 큰 JSON은 <code>jq -S</code>(키 정렬) + <code>diff</code> 조합이 효율적입니다.',
              },
              {
                q: 'YAML과 JSON 어떤 차이가 있나요?',
                a: '둘 다 같은 데이터 구조(객체·배열·문자열·숫자·boolean·null)를 표현하지만 <strong>문법과 용도</strong>가 다릅니다.<br>• <strong>YAML</strong>: 들여쓰기 기반·주석 지원·앵커/별칭·멀티 도큐먼트 — 사람이 편집하는 <strong>설정 파일</strong>에 적합 (K8s·CI·Spring)<br>• <strong>JSON</strong>: 중괄호·대괄호 기반·문자열 필수 따옴표·주석 미지원 — 기계가 처리하는 <strong>API·데이터 교환</strong>에 표준<br>모든 JSON은 유효한 YAML이지만 (YAML은 JSON 슈퍼셋), 그 반대는 아닙니다.',
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
                a: '<strong>YAML 1.1의 악명 높은 함정</strong>입니다. YAML 1.1에서는 <code>yes·no·on·off·true·false</code>가 모두 boolean으로 해석돼요.<br><strong>실제 사고 사례</strong>: 노르웨이 ISO 코드 <code>NO</code> → <code>false</code>로 해석되어 데이터 깨짐 · Docker 환경 변수 <code>SETTING: yes</code> → <code>true</code>로 해석<br><strong>해결</strong>: YAML 1.2 사용 — boolean은 <code>true</code>/<code>false</code>만(yes/no는 문자열) · 따옴표로 감싸기 — <code>country: "NO"</code><br>본 도구는 <strong>JSON_SCHEMA</strong>(YAML 1.2 기준)로 읽어 yes/no를 문자열로 유지하고, JSON → YAML 변환 때는 <code>"yes"</code> 같은 문자열을 따옴표로 감싸 YAML 1.1 로더에서도 문자열로 남게 합니다.',
              },
              {
                q: '앵커(&)와 별칭(*)이 무엇인가요?',
                a: '<strong>YAML의 참조 메커니즘</strong>입니다. 같은 데이터를 여러 곳에서 재사용해 중복을 줄여요. 예를 들어 <code>defaults: &amp;defaults</code> 아래에 <code>timeout: 30</code>, <code>retries: 3</code> 같은 공통값을 두고, <code>prod:</code> 항목에서 <code>&lt;&lt;: *defaults</code>로 끌어와 재사용합니다. <strong>JSON 변환 시</strong>에는 앵커가 펼쳐져 모든 곳에 데이터가 복사됩니다(참조 관계 손실). 역변환 시 자동 앵커 생성은 끔(<code>noRefs: true</code>)으로 두어 깔끔한 YAML 출력을 보장합니다.',
              },
              {
                q: 'YAML → JSON 변환 결과가 원본보다 길어요',
                a: '<strong>YAML → JSON</strong>은 대개 길어집니다 — 키마다 따옴표(<code>name</code> → <code>"name"</code>), 중괄호·대괄호, 콤마 구분자가 붙고 들여쓰기도 유지되기 때문입니다. YAML ↔ JSON 탭의 YAML 예시 10개를 2칸 Pretty JSON으로 바꾸면 <strong>원본의 약 1.3~1.9배</strong>가 되고, <strong>Compact(한 줄)</strong>로 바꾸면 원본 YAML 대비 −22%~+3%로 비슷하거나 더 작아집니다. 반대로 <strong>JSON → YAML</strong>은 괄호·따옴표가 빠져 대개 짧아집니다(예시 package.json −30%, tsconfig.json −18%). 파일 크기가 중요하면 옵션의 <strong>JSON 출력: Compact</strong>를 쓰세요.',
              },
              {
                q: '입력한 JSON·YAML이 서버로 전송되나요?',
                a: '<strong>아니요. 모든 처리가 브라우저에서 수행됩니다.</strong> 정렬·검증·트리 뷰·TypeScript 변환은 브라우저 내장 JSON 파서로, YAML 변환·검증은 <strong>js-yaml</strong>(MIT 라이선스) 라이브러리로 처리하며, 입력 데이터를 담은 요청은 발생하지 않습니다(처음 열 때 변환 코드 파일만 내려받음 — 개발자 도구 Network 탭에서 확인 가능). 결과 파일 저장도 <code>Blob</code> URL로 브라우저 안에서 만듭니다. JSON 탭 입력은 저장하지 않고, <strong>YAML ↔ JSON 탭의 입력·옵션만</strong> 재방문 편의를 위해 이 브라우저 localStorage에 저장합니다. 공용 PC에서 K8s 시크릿·DB 비밀번호 등을 다뤘다면 개발자 도구 → Application → Local Storage에서 <code>youtil_yaml_json_v1</code> 키를 지우세요.',
              },
            ]

export default function JsonPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/json">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />JSON 포맷터
      </h1>
      <p className="tp-lead">
        JSON 정렬·압축·검증·트리 뷰 + <strong style={{ color: 'var(--text)' }}>TypeScript 인터페이스 자동</strong> + YAML/CSV 변환.
      </p>

      <JsonClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. JSON 기본 ── */}
        <div>
          <h2 className="g-h2">
            JSON(JavaScript Object Notation)이란?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            JSON은 값 종류가 <strong style={{ color: 'var(--text)' }}>6가지(문자열·숫자·불리언·null·객체·배열)</strong>뿐인 데이터 교환 포맷으로, 현행 표준은 RFC 8259(2017)입니다.
            문법이 작다고 함정까지 없는 것은 아닙니다 — <strong style={{ color: 'var(--text)' }}>숫자의 정밀도는 표준이 규정하지 않아 언어(구현체)마다 다르고</strong>,
            한글 이스케이프 기본값도 JavaScript와 Python이 서로 반대입니다. 아래에서 오류 7종과 함께 이 두 가지 함정, 그리고 CLI에서 짝으로 쓰는 jq 치트시트까지 다룹니다.
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

        {/* ── 2. 자주 발생하는 오류 ── */}
        <div>
          <h2 className="g-h2">
            자주 발생하는 JSON 오류 7가지
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { e: 'Trailing comma',  c: 'var(--red-600)', d: '마지막 요소 뒤 쉼표 — JSON 표준 비허용. JSON5/JSONC는 허용.' },
              { e: 'Single quotes',   c: 'var(--red-600)', d: '문자열에 작은따옴표(\') 사용 — JSON은 큰따옴표(") 전용.' },
              { e: 'Unquoted keys',   c: 'var(--red-600)', d: '키에 따옴표 없음 — { name: "John" } ❌ → { "name": "John" } ✓.' },
              { e: 'undefined / NaN', c: 'var(--red-600)', d: 'JS 값 undefined·NaN·Infinity는 JSON에 사용 불가. null로 대체.' },
              { e: '주석 포함',         c: 'var(--red-600)', d: 'JSON은 // 또는 /* */ 주석 미지원. JSON5·JSONC는 지원.' },
              { e: 'Escape 누락',      c: 'var(--red-600)', d: '문자열 안의 ", \\, 줄바꿈은 \\", \\\\, \\n으로 이스케이프 필수.' },
              { e: '인코딩 BOM',       c: 'var(--red-600)', d: 'UTF-8 BOM(\\uFEFF)은 JSON 표준 미허용. 파일 저장 시 주의.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.e}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 2^53 정밀도 한계 ── */}
        <div>
          <h2 className="g-h2">
            JSON.parse가 64비트 ID를 조용히 바꾸는 이유 — 2⁵³ 한계
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            RFC 8259는 숫자의 범위·정밀도를 구현체 재량에 맡깁니다. JavaScript는 모든 숫자를 IEEE 754 배정밀도(double)로 다루기 때문에
            정수는 <strong style={{ color: 'var(--text)' }}>2⁵³−1 = 9,007,199,254,740,991</strong>(Number.MAX_SAFE_INTEGER)까지만 정확합니다.
            트위터(X) ID나 스노우플레이크 방식 주문번호처럼 <strong style={{ color: 'var(--text)' }}>64비트 정수 ID</strong>가 이 한계를 넘으면,
            JSON.parse는 오류 한 줄 없이 끝자리를 반올림해 버립니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
            marginBottom: 12,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 실제로 깨지는 예 (Node.js·브라우저 공통)</span></div>
            <div>JSON.parse(&apos;{'{'}&quot;id&quot;: 1234567890123456789{'}'}&apos;).id</div>
            <div><span style={{ color: 'var(--red-600)' }}>{'// → 1234567890123456800  ← 끝 세 자리가 조용히 바뀜'}</span></div>
            <div>JSON.parse(&apos;9007199254740993&apos;)  <span style={{ color: 'var(--red-600)' }}>{'// → 9007199254740992'}</span></div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            대처는 세 가지입니다. ① <strong style={{ color: 'var(--text)' }}>서버가 ID를 문자열로 직렬화</strong> — 트위터 API가 숫자 id와 별도로
            문자열 <code>id_str</code>을 함께 내려주는 이유가 바로 이것입니다. ② <strong style={{ color: 'var(--text)' }}>json-bigint 같은 대체 파서</strong> —
            큰 정수를 BigInt로 보존하며 파싱합니다. ③ BigInt를 직접 쓸 때는 반대 방향을 주의하세요 —
            <strong style={{ color: 'var(--text)' }}>JSON.stringify는 BigInt를 직렬화하지 못하고 TypeError</strong>를 던집니다.
            참고로 Python의 int는 임의 정밀도라 같은 JSON도 값이 온전히 유지됩니다 — &quot;Python에선 맞는데 JS에서만 ID가 다르다&quot;면 십중팔구 이 문제입니다.
          </p>
        </div>

        {/* ── 4. JSON vs JSON5 vs JSONC ── */}
        <div>
          <h2 className="g-h2">
            JSON vs JSON5 vs JSONC
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기능', 'JSON (RFC 8259)', 'JSON5', 'JSONC'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '주석',           a: '❌',     b: '✓',       c: '✓' },
                  { k: 'Trailing comma', a: '❌',     b: '✓',       c: '✓' },
                  { k: 'Single quote',   a: '❌',     b: '✓',       c: '❌' },
                  { k: 'Unquoted keys',  a: '❌',     b: '✓',       c: '❌' },
                  { k: '주요 사용처',     a: 'API·일반', b: '설정 파일', c: 'tsconfig·VSCode' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 정렬 vs 압축 ── */}
        <div>
          <h2 className="g-h2">
            JSON 정렬(Beautify) vs 압축(Minify)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✦ 정렬 (Beautify)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>가독성 ↑ (들여쓰기 2/4칸)</li>
                <li>디버깅·코드 리뷰</li>
                <li>아래 예시 JSON: 52 → 74바이트</li>
                <li>API 응답 분석·로그 분석</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--emerald-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--emerald-600)', fontWeight: 700, marginBottom: 8 }}>⊟ 압축 (Minify)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>공백·줄바꿈 제거</li>
                <li>네트워크 전송 절약</li>
                <li>아래 예시 JSON: 74 → 52바이트(약 −30%)</li>
                <li>API 응답·임베드</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 6. JSON → TypeScript ── */}
        <div>
          <h2 className="g-h2">
            JSON → TypeScript 인터페이스 자동 생성
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            REST API 응답을 그대로 붙여넣으면 TypeScript 인터페이스를 자동 생성합니다.
            중첩 객체는 별도 인터페이스로 분리되어 코드에 바로 활용할 수 있습니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 입력 JSON</span></div>
            <div>{'{ "name": "Alice", "age": 30, "address": { "city": "Seoul" } }'}</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 자동 생성 TypeScript</span></div>
            <div><span style={{ color: 'var(--purple-600)' }}>interface</span> <span style={{ color: 'var(--cyan-600)' }}>Address</span> {'{'}</div>
            <div>  <span style={{ color: 'var(--cyan-600)' }}>city</span>: <span style={{ color: 'var(--emerald-600)' }}>string</span></div>
            <div>{'}'}</div>
            <div></div>
            <div><span style={{ color: 'var(--purple-600)' }}>interface</span> <span style={{ color: 'var(--cyan-600)' }}>Root</span> {'{'}</div>
            <div>  <span style={{ color: 'var(--cyan-600)' }}>address</span>: <span style={{ color: 'var(--cyan-600)' }}>Address</span></div>
            <div>  <span style={{ color: 'var(--cyan-600)' }}>age</span>: <span style={{ color: 'var(--emerald-600)' }}>number</span></div>
            <div>  <span style={{ color: 'var(--cyan-600)' }}>name</span>: <span style={{ color: 'var(--emerald-600)' }}>string</span></div>
            <div>{'}'}</div>
          </div>
        </div>

        {/* ── 7. JSON ↔ YAML ↔ CSV ── */}
        <div>
          <h2 className="g-h2">
            JSON ↔ YAML ↔ CSV 변환
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'YAML',    c: 'var(--cyan-600)', d: 'Kubernetes·Docker Compose·GitHub Actions·Ansible 설정 파일 표준' },
              { t: 'CSV',     c: 'var(--emerald-600)', d: '엑셀·Google Sheets·DB import에 사용. 객체 배열 → 평탄화된 표' },
              { t: '키 정렬',  c: 'var(--accent)', d: '두 JSON 비교(diff) 시 키 순서 차이를 제거하고 의미 차이만 비교' },
              { t: '이스케이프', c: 'var(--yellow-700)', d: 'JSON을 다시 JS 문자열에 임베드할 때 사용 (코드 안에 JSON 리터럴)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            변환 탭의 YAML은 JSON → YAML 한 방향입니다. YAML을 JSON으로 되돌리거나 YAML 문법을 검증하려면 마지막
            <strong style={{ color: 'var(--text)' }}> YAML ↔ JSON 탭</strong>을 쓰세요 — 두 형식의 차이와 변환 때 사라지는 정보는
            아래 <a href="#yaml-json" style={{ color: 'var(--accent-ink)' }}>YAML ↔ JSON 섹션</a>에 정리했습니다.
          </p>
        </div>

        {/* ── 8. 한글 이스케이프 비교 ── */}
        <div>
          <h2 className="g-h2">
            한글 이스케이프 — JS와 Python의 기본값이 반대입니다
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            같은 &quot;한&quot;이라도 직렬화 결과는 언어마다 다릅니다. JavaScript의 JSON.stringify는 한글을 그대로 내보내지만,
            Python의 json.dumps는 기본 옵션 <strong style={{ color: 'var(--text)' }}>ensure_ascii=True</strong> 때문에
            <code>{'\\ud55c'}</code> 형태로 이스케이프합니다. 두 표기는 표준상 완전히 동등해서 어떤 파서든 같은 문자열로 읽지만,
            파일 크기와 사람이 읽을 수 있는지가 달라집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', 'JS JSON.stringify', 'Python json.dumps'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '\'한\' 직렬화 결과',   a: '"한" (그대로)',        b: '"\\ud55c" (이스케이프)' },
                  { k: '동작 바꾸는 옵션',      a: '없음 (항상 그대로)',    b: 'ensure_ascii=False' },
                  { k: '\'한\' 1자 크기(UTF-8)', a: '3바이트',             b: '6바이트 (2배)' },
                  { k: '파싱 결과',            a: '동일한 \'한\'',        b: '동일한 \'한\'' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            실무 팁: Python 로그에서 복사한 <code>\uXXXX</code> 덩어리도 유효한 JSON이므로,
            본 도구에 붙여넣고 <strong style={{ color: 'var(--text)' }}>정렬(Beautify)만 해도 원래 한글로 표시</strong>됩니다.
            반대로 JSON을 JS 코드 문자열 안에 임베드할 때는 변환 탭의 &apos;문자열 이스케이프&apos;를, <code>\uXXXX</code>를 풀 때는
            &apos;이스케이프 해제&apos;를 쓰면 됩니다. 한글 비중이 큰 데이터는 이스케이프 시 글자당 3바이트 → 6바이트로 커지므로,
            전송·저장용이라면 Python 쪽에서 ensure_ascii=False로 끄는 편이 이득입니다.
          </p>
        </div>

        {/* ── 9. JSON Pointer / 활용 팁 ── */}
        <div>
          <h2 className="g-h2">
            JSON 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🔍 큰 JSON 분석',        d: '트리 뷰어로 접고 펼치며 구조 파악. 키 개수·깊이 통계로 복잡도 측정.' },
              { t: '⚡ 네트워크 절감',       d: 'API 응답은 Minify가 기본. gzip·brotli 전송 압축과 병행하면 반복 키가 많을수록 효과가 커집니다.' },
              { t: '🔀 두 JSON 비교',        d: '키 알파벳 정렬 후 diff 도구 사용 시 순서 차이 없이 의미 차이만 확인.' },
              { t: '🛠️ TypeScript 타입',     d: 'API 명세 없이 응답 JSON만으로 타입 정의 빠르게 생성. 후 수동 다듬기.' },
              { t: '📋 클립보드 → 코드',     d: 'API 응답 복사 → 변환 → 붙여넣기로 mock 데이터·테스트 데이터 즉시 생성.' },
              { t: '🚨 에러 위치 추적',       d: '파싱 오류 시 라인·컬럼 자동 표시. 큰 파일에서도 즉시 위치 확인.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 10. jq 실전 치트시트 ── */}
        <div>
          <h2 className="g-h2">
            jq 실전 치트시트 — 화면에서 확인, CLI에서 반복
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            구조 파악은 본 도구의 트리 뷰가 빠르지만, 같은 처리를 스크립트·파이프라인에서 반복할 땐 jq가 표준입니다.
            아래는 예시 JSON <code>{'{"users":[{"name":"kim","age":32},{"name":"lee","age":25},{"name":"park","age":41}]}'}</code> 기준,
            jq 1.7 실행 결과로 확인한 자주 쓰는 필터입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['명령', '용도', '출력'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: "jq '.users[].name'",                u: '특정 키만 추출',            o: '"kim" "lee" "park"' },
                  { c: "jq -r '.users[0].name'",            u: '따옴표 없이 원시 출력',      o: 'kim' },
                  { c: "jq '.users[] | select(.age >= 30)'", u: '조건으로 필터',             o: 'kim·park 객체만' },
                  { c: "jq '.users | map(.name)'",          u: '배열로 재구성',             o: '["kim","lee","park"]' },
                  { c: "jq '.users | sort_by(.age)'",       u: '값 기준 정렬',              o: '나이 오름차순 배열' },
                  { c: "jq '.users | length'",              u: '개수 세기',                 o: '3' },
                  { c: "jq 'keys'",                          u: '최상위 키 목록',            o: '["users"]' },
                  { c: 'jq -c .',                            u: '압축(Minify)',              o: '한 줄 JSON' },
                  { c: 'jq -S .',                            u: '키 재귀 정렬',              o: '본 도구 \'키 정렬\'과 동일' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'nowrap' }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12, marginBottom: 12 }}>
            가장 요긴한 조합은 <strong style={{ color: 'var(--text)' }}>키 정렬 diff</strong>입니다.
            <code>-S</code>가 모든 키를 재귀적으로 알파벳 정렬해 주므로(본 도구의 변환 → 키 정렬과 같은 정규화),
            키 순서만 다른 두 JSON은 diff가 비어 있게 됩니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 두 JSON을 의미 기준으로 비교 (키 순서 차이 무시)</span></div>
            <div>diff &lt;(jq -S . a.json) &lt;(jq -S . b.json)</div>
          </div>
        </div>

        {/* ── 11. YAML ↔ JSON 탭 (구 /tools/dev/yaml-json) ── */}
        <div>
          <h2 className="g-h2" id="yaml-json">
            YAML ↔ JSON 탭 — 양방향 변환·검증·예시 12개
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            마지막 <strong style={{ color: 'var(--text)' }}>YAML ↔ JSON</strong> 탭은 설정 파일용 작업 공간입니다. 하위 탭 세 개로 나뉩니다.
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text)', lineHeight: 1.95 }}>
            <li><strong>변환</strong> — 왼쪽에 YAML/JSON 붙여넣기 → 오른쪽 자동 변환. 형식 자동 감지 + 방향(자동·YAML → JSON·JSON → YAML)·들여쓰기(2·4칸·Tab)·JSON Pretty/Compact·키 알파벳 정렬 옵션. 입력이 바뀌면 200ms 뒤 다시 계산합니다.</li>
            <li><strong>검증</strong> — 단일 입력 + 형식 자동 감지 + 유효성 + 통계(줄·키·깊이·문자·바이트·실행 시간) + 최상위 5개 항목 구조 미리보기. 유효하면 &apos;변환 탭으로 보내기&apos;로 바로 넘깁니다.</li>
            <li><strong>예시 12개</strong> — Kubernetes(Pod·Deployment·ConfigMap·Helm values)·Docker Compose·GitHub Actions·GitLab CI·Spring(application.yml·멀티 프로파일)·OpenAPI 3.0·package.json·tsconfig.json. 누르면 변환 탭에 바로 적용됩니다.</li>
          </ol>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            💡 이 탭의 입력·옵션은 자동 저장됩니다. 결과는 📋 복사 또는 💾 파일 저장(convert-YYYYMMDD.json/yaml).
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '20px 0 8px' }}>자주 쓰는 변환 시나리오</h3>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.95 }}>
            <li>🍃 <strong>Spring application.yml → JSON</strong> — 외부 시스템 연동·설정 백업·환경별 비교</li>
            <li>☸️ <strong>K8s YAML → JSON</strong> — kubectl 일부 명령에 JSON 사용 (<code>kubectl create -f - --dry-run=client -o json</code>)</li>
            <li>🐙 <strong>GitHub Actions YAML 검증</strong> — 워크플로 푸시 전 들여쓰기·구문 오류 사전 발견</li>
            <li>🔌 <strong>OpenAPI YAML → JSON</strong> — 일부 SDK 생성 도구는 JSON만 지원</li>
            <li>⛵ <strong>Helm values.yaml → JSON</strong> — 외부 시크릿 매니저(Vault·AWS Secrets Manager) 연동</li>
            <li>🐳 <strong>Docker Compose 검증</strong> — 멀티 서비스 정의 들여쓰기·키 오타 확인</li>
            <li>📋 <strong>운영 설정 ↔ 백업</strong> — JSON 백업·아카이브 → YAML 편집 후 다시 적용</li>
          </ul>
          <div style={{ background: 'var(--warning-soft)', border: '1px solid color-mix(in srgb, var(--warning) 40%, transparent)', borderRadius: 'var(--radius-m)', padding: '12px 16px', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
              ⚠️ 변환·검증은 모두 <strong>브라우저에서 실행</strong>되며 입력 데이터는 외부로 전송되지 않습니다.
              YAML → JSON 변환 시 <strong>주석·앵커·별칭 정보가 손실</strong>되고 해석할 수 없는 커스텀 태그(!Ref 등)는 변환 오류로 표시되니, K8s·Spring 등 운영 환경 설정 파일은 변환 전후
              <strong> 반드시 검증·테스트 후 적용</strong>하세요. 입력은 500KB로 제한되며, 깊은 중첩(100+) 또는 매우 큰 파일은 일부 브라우저에서 느릴 수 있습니다.
              분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent-ink)' }}>면책조항</Link> 참고.
            </p>
          </div>
        </div>

        {/* ── 12. YAML vs JSON 비교 ── */}
        <div>
          <h2 className="g-h2">
            YAML vs JSON 비교
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            두 형식은 <strong style={{ color: 'var(--text)' }}>같은 데이터 구조</strong>(객체·배열·문자열·숫자·boolean·null)를 표현하지만 문법이 크게 다릅니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', 'YAML', 'JSON'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['주석', '# 지원', '미지원'],
                  ['들여쓰기', '의미 있음 (필수)', '무의미 (가독성용)'],
                  ['따옴표', '선택적', '문자열 필수 (")'],
                  ['키 표기', '"" 없이 가능', '반드시 "key"'],
                  ['마지막 콤마', '없음', '금지 (오류)'],
                  ['데이터 타입', '자동 추론 (1.1 함정)', '명시적'],
                  ['멀티 도큐먼트', '--- 구분', '1 도큐먼트만'],
                  ['앵커/별칭', '지원 (& *)', '미지원'],
                  ['스펙 복잡도', '높음', '단순'],
                  ['주 사용처', 'DevOps·CI·설정', 'API·웹 데이터'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            💡 <strong style={{ color: 'var(--text)' }}>일반 룰</strong>: 사람이 자주 편집하는 설정 파일(K8s·CI·Spring) → YAML, API/웹 데이터 교환 → JSON.
          </p>
        </div>

        {/* ── 13. 변환 시 손실 정보 ── */}
        <div>
          <h2 className="g-h2">
            YAML → JSON 변환 시 손실되는 정보
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--warning)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text)', lineHeight: 1.95 }}>
              <li><strong>💬 주석 (#)</strong> — JSON은 주석을 지원하지 않으므로 모두 삭제. <strong>역변환 시 복원 불가</strong></li>
              <li><strong>🔗 앵커 (&amp;) / 별칭 (*)</strong> — 펼쳐져 데이터 중복으로 변환됨. 참조 관계 손실. 병합 키 <code>{'<<: *defaults'}</code>도 값이 합쳐진 형태로 펼쳐짐</li>
              <li><strong>📚 멀티 도큐먼트 (---)</strong> — JSON 배열로 통합 변환 (구분 정보 손실)</li>
              <li><strong>🏷️ 커스텀 태그 (!·!!)</strong> — <code>!!python/object</code>·<code>!Ref</code> 등은 라이브러리별 동작 다름 (표준 아님). 본 도구는 해석하지 않고 변환 오류로 표시</li>
              <li><strong>📅 특수 타입</strong> — 날짜·정규식 등 JSON에 없는 타입은 문자열로 변환</li>
              <li><strong>⚠️ YAML 1.1 자동 타입 추론</strong> — <code>yes</code>/<code>no</code>가 boolean, 0으로 시작하는 숫자(예: <code>0755</code>)가 8진수로 해석 (본 도구는 JSON_SCHEMA 기준이라 yes/no는 문자열로 유지하지만, <code>0755</code>는 8진수가 아닌 10진수 755로 읽습니다. 파일 권한처럼 앞자리 0을 살려야 하면 따옴표로 감싸세요)</li>
            </ul>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 0' }}>
              YAML ↔ JSON 탭은 주석·앵커/별칭·멀티 도큐먼트를 변환 결과 아래 경고로 알려 주고, 해석할 수 없는 커스텀 태그(!Ref·!!python/object 등)는 변환 오류로 표시합니다.
              원본 보존이 필요하면 변환하지 말고 원본 형식 그대로 쓰세요.
            </p>
          </div>
        </div>

        {/* ── 14. 흔한 YAML 오류 ── */}
        <div>
          <h2 className="g-h2">
            흔한 YAML 오류 5가지
          </h2>
          <ol style={{ margin: 0, paddingLeft: 22, fontSize: 13, color: 'var(--text)', lineHeight: 1.95 }}>
            <li><strong>탭 문자 사용</strong> — YAML은 공백만 허용. 에디터에서 &quot;탭 → 공백 2/4&quot; 자동 변환 설정 필수</li>
            <li><strong>콜론 뒤 공백 누락</strong> — <code>key:value</code> ❌ → <code>key: value</code> ✅</li>
            <li><strong>들여쓰기 불일치</strong> — 같은 레벨에서 2/4 spaces 혼용 금지. 한 파일 내 통일</li>
            <li><strong>특수문자 escape</strong> — <code>{'${}'}</code>·콜론·따옴표 포함 시 따옴표로 감싸기 (<code>{`url: "https://api.com"`}</code>)</li>
            <li><strong>중복 키</strong> — 같은 레벨 같은 키는 YAML 스펙상 오류. 본 도구는 오류로 알려 주지만 일부 파서는 마지막 값으로 조용히 덮어써 디버깅이 어려움</li>
          </ol>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 15. FAQ ── */}
        <div>
          <h2 className="g-h2">
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 16. 관련 도구 ── */}
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
