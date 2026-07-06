import Link from 'next/link'
import JsonClient from './JsonClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/json',
  title: 'JSON 포맷터 — 정렬·압축·트리 뷰·TypeScript 인터페이스 생성',
  description: 'JSON 정렬·압축·검증·트리 뷰 + TypeScript 인터페이스 자동 생성 + YAML·CSV 변환과 키 정렬·이스케이프·에러 위치.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON트리뷰어', 'JSON유효성검사', 'JSON to TypeScript', 'JSON to YAML', 'JSON to CSV', 'JSON정렬키', 'JSON에러위치'],
})

const FAQ_LD = [
              {
                q: 'JSON에 주석을 쓰면 왜 오류가 나나요?',
                a: 'JSON 표준(RFC 8259)은 <strong>주석을 허용하지 않습니다.</strong> Douglas Crockford는 "주석을 허용하면 사람들이 파싱 지시문을 적기 시작해 호환성이 깨질 수 있어 의도적으로 뺐다"고 밝혔습니다. 주석이 필요하면 <strong>JSON5</strong>(트레일링 컴마·주석·작은따옴표 허용)나 <strong>JSONC</strong>(VSCode·tsconfig.json에서 사용)를 사용하세요.',
              },
              {
                q: 'API 응답 JSON에서 TypeScript 타입을 자동 생성할 수 있나요?',
                a: '네, 본 도구의 <strong>변환 탭 → TypeScript 인터페이스</strong>를 사용하세요. JSON을 붙여넣으면 자동으로 인터페이스를 생성합니다. 중첩 객체는 별도 인터페이스로 분리되어 재사용 가능하며, 키는 알파벳 순으로 정렬됩니다. <strong>옵셔널 필드(?)는 null 값일 때 자동 표시</strong>되며, 추가 검증·튜닝은 수동으로 진행하면 됩니다.',
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
            ]

export default function JsonPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />JSON 포맷터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        JSON 정렬·압축·검증·트리 뷰 + <strong style={{ color: 'var(--text)' }}>TypeScript 인터페이스 자동</strong> + YAML/CSV 변환.
      </p>

      <JsonClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. JSON 기본 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># JSON 기본 데이터 타입</span></div>
            <div><span style={{ color: '#0891B2' }}>&quot;string&quot;</span> · <span style={{ color: '#A16207' }}>123</span> · <span style={{ color: '#9333EA' }}>true / false</span> · <span style={{ color: 'var(--muted)' }}>null</span></div>
            <div><span style={{ color: 'var(--muted)' }}>{'{ object }'}</span> · <span style={{ color: 'var(--muted)' }}>{'[ array ]'}</span></div>
          </div>
        </div>

        {/* ── 2. 자주 발생하는 오류 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 발생하는 JSON 오류 7가지
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { e: 'Trailing comma',  c: '#DC2626', d: '마지막 요소 뒤 쉼표 — JSON 표준 비허용. JSON5/JSONC는 허용.' },
              { e: 'Single quotes',   c: '#DC2626', d: '문자열에 작은따옴표(\') 사용 — JSON은 큰따옴표(") 전용.' },
              { e: 'Unquoted keys',   c: '#DC2626', d: '키에 따옴표 없음 — { name: "John" } ❌ → { "name": "John" } ✓.' },
              { e: 'undefined / NaN', c: '#DC2626', d: 'JS 값 undefined·NaN·Infinity는 JSON에 사용 불가. null로 대체.' },
              { e: '주석 포함',         c: '#DC2626', d: 'JSON은 // 또는 /* */ 주석 미지원. JSON5·JSONC는 지원.' },
              { e: 'Escape 누락',      c: '#DC2626', d: '문자열 안의 ", \\, 줄바꿈은 \\", \\\\, \\n으로 이스케이프 필수.' },
              { e: '인코딩 BOM',       c: '#DC2626', d: 'UTF-8 BOM(\\uFEFF)은 JSON 표준 미허용. 파일 저장 시 주의.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.e}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 2^53 정밀도 한계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
            marginBottom: 12,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 실제로 깨지는 예 (Node.js·브라우저 공통)</span></div>
            <div>JSON.parse(&apos;{'{'}&quot;id&quot;: 1234567890123456789{'}'}&apos;).id</div>
            <div><span style={{ color: '#DC2626' }}>// → 1234567890123456800  ← 끝 세 자리가 조용히 바뀜</span></div>
            <div>JSON.parse(&apos;9007199254740993&apos;)  <span style={{ color: '#DC2626' }}>// → 9007199254740992</span></div>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON vs JSON5 vs JSONC
          </h2>
          <div style={{ overflowX: 'auto' }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON 정렬(Beautify) vs 압축(Minify)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✦ 정렬 (Beautify)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>가독성 ↑ (들여쓰기 2/4칸)</li>
                <li>디버깅·코드 리뷰</li>
                <li>아래 예시 JSON: 52 → 74바이트</li>
                <li>API 응답 분석·로그 분석</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #059669', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#059669', fontWeight: 700, marginBottom: 8 }}>⊟ 압축 (Minify)</p>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON → TypeScript 인터페이스 자동 생성
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            REST API 응답을 그대로 붙여넣으면 TypeScript 인터페이스를 자동 생성합니다.
            중첩 객체는 별도 인터페이스로 분리되어 코드에 바로 활용할 수 있습니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 입력 JSON</span></div>
            <div>{'{ "name": "Alice", "age": 30, "address": { "city": "Seoul" } }'}</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 자동 생성 TypeScript</span></div>
            <div><span style={{ color: '#9333EA' }}>interface</span> <span style={{ color: '#0891B2' }}>Address</span> {'{'}</div>
            <div>  <span style={{ color: '#0891B2' }}>city</span>: <span style={{ color: '#059669' }}>string</span></div>
            <div>{'}'}</div>
            <div></div>
            <div><span style={{ color: '#9333EA' }}>interface</span> <span style={{ color: '#0891B2' }}>Root</span> {'{'}</div>
            <div>  <span style={{ color: '#0891B2' }}>address</span>: <span style={{ color: '#0891B2' }}>Address</span></div>
            <div>  <span style={{ color: '#0891B2' }}>age</span>: <span style={{ color: '#059669' }}>number</span></div>
            <div>  <span style={{ color: '#0891B2' }}>name</span>: <span style={{ color: '#059669' }}>string</span></div>
            <div>{'}'}</div>
          </div>
        </div>

        {/* ── 7. JSON ↔ YAML ↔ CSV ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON ↔ YAML ↔ CSV 변환
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'YAML',    c: '#0891B2', d: 'Kubernetes·Docker Compose·GitHub Actions·Ansible 설정 파일 표준' },
              { t: 'CSV',     c: '#059669', d: '엑셀·Google Sheets·DB import에 사용. 객체 배열 → 평탄화된 표' },
              { t: '키 정렬',  c: 'var(--accent)', d: '두 JSON 비교(diff) 시 키 순서 차이를 제거하고 의미 차이만 비교' },
              { t: '이스케이프', c: '#A16207', d: 'JSON을 다시 JS 문자열에 임베드할 때 사용 (코드 안에 JSON 리터럴)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 한글 이스케이프 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한글 이스케이프 — JS와 Python의 기본값이 반대입니다
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            같은 &quot;한&quot;이라도 직렬화 결과는 언어마다 다릅니다. JavaScript의 JSON.stringify는 한글을 그대로 내보내지만,
            Python의 json.dumps는 기본 옵션 <strong style={{ color: 'var(--text)' }}>ensure_ascii=True</strong> 때문에
            <code>{'\\ud55c'}</code> 형태로 이스케이프합니다. 두 표기는 표준상 완전히 동등해서 어떤 파서든 같은 문자열로 읽지만,
            파일 크기와 사람이 읽을 수 있는지가 달라집니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 10. jq 실전 치트시트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            jq 실전 치트시트 — 화면에서 확인, CLI에서 반복
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            구조 파악은 본 도구의 트리 뷰가 빠르지만, 같은 처리를 스크립트·파이프라인에서 반복할 땐 jq가 표준입니다.
            아래는 예시 JSON <code>{'{"users":[{"name":"kim","age":32},{"name":"lee","age":25},{"name":"park","age":41}]}'}</code> 기준,
            jq 1.7 실행 결과로 확인한 자주 쓰는 필터입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: '12px', whiteSpace: 'nowrap' }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: '12px' }}>{r.o}</td>
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
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '12px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 두 JSON을 의미 기준으로 비교 (키 순서 차이 무시)</span></div>
            <div>diff &lt;(jq -S . a.json) &lt;(jq -S . b.json)</div>
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 11. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
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

        {/* ── 12. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
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
    </div>
  )
}
