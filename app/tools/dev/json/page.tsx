import Link from 'next/link'
import JsonClient from './JsonClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/json',
  title: 'JSON 포맷터 — 정렬·압축·트리 뷰·TypeScript 인터페이스 생성',
  description: 'JSON 정렬(Beautify)·압축(Minify)·검증·트리 뷰어, JSON → TypeScript 인터페이스 자동 생성, JSON ↔ YAML·CSV 변환, 키 알파벳 정렬, 이스케이프·해제, 에러 위치 표시까지.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON트리뷰어', 'JSON유효성검사', 'JSON to TypeScript', 'JSON to YAML', 'JSON to CSV', 'JSON정렬키', 'JSON에러위치'],
})

export default function JsonPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자·텍스트
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📋 JSON 포맷터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        JSON <strong style={{ color: 'var(--text)' }}>정렬·압축·검증·트리 뷰어</strong>, <strong style={{ color: 'var(--text)' }}>TypeScript 인터페이스</strong> 자동 생성,
        <strong style={{ color: 'var(--text)' }}> YAML·CSV 변환</strong>, 키 알파벳 정렬, 이스케이프·해제, 에러 위치 표시까지 한 도구에서.
      </p>

      <JsonClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. JSON 기본 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON(JavaScript Object Notation)이란?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            JSON은 데이터를 저장하고 전송하기 위한 <strong style={{ color: 'var(--text)' }}>경량 데이터 형식</strong>입니다.
            Douglas Crockford가 2001년 표준화했고, 현재는 RFC 8259(2017)로 정의된 가장 널리 쓰이는 데이터 교환 포맷입니다.
            사람이 읽기 쉽고 기계가 파싱하기 쉬워 <strong style={{ color: 'var(--text)' }}>API·설정 파일·NoSQL DB·로그</strong>에서 표준입니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '12.5px',
            color: 'var(--text)',
            lineHeight: 1.85,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># JSON 기본 데이터 타입</span></div>
            <div><span style={{ color: '#3EC8FF' }}>&quot;string&quot;</span> · <span style={{ color: '#FFD700' }}>123</span> · <span style={{ color: '#C485E0' }}>true / false</span> · <span style={{ color: 'var(--muted)' }}>null</span></div>
            <div><span style={{ color: 'var(--muted)' }}>{'{ object }'}</span> · <span style={{ color: 'var(--muted)' }}>{'[ array ]'}</span></div>
          </div>
        </div>

        {/* ── 2. 자주 발생하는 오류 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 발생하는 JSON 오류 7가지
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { e: 'Trailing comma',  c: '#FF6B6B', d: '마지막 요소 뒤 쉼표 — JSON 표준 비허용. JSON5/JSONC는 허용.' },
              { e: 'Single quotes',   c: '#FF6B6B', d: '문자열에 작은따옴표(\') 사용 — JSON은 큰따옴표(") 전용.' },
              { e: 'Unquoted keys',   c: '#FF6B6B', d: '키에 따옴표 없음 — { name: "John" } ❌ → { "name": "John" } ✓.' },
              { e: 'undefined / NaN', c: '#FF6B6B', d: 'JS 값 undefined·NaN·Infinity는 JSON에 사용 불가. null로 대체.' },
              { e: '주석 포함',         c: '#FF6B6B', d: 'JSON은 // 또는 /* */ 주석 미지원. JSON5·JSONC는 지원.' },
              { e: 'Escape 누락',      c: '#FF6B6B', d: '문자열 안의 ", \\, 줄바꿈은 \\", \\\\, \\n으로 이스케이프 필수.' },
              { e: '인코딩 BOM',       c: '#FF6B6B', d: 'UTF-8 BOM(\\uFEFF)은 JSON 표준 미허용. 파일 저장 시 주의.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 12.5, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.e}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. JSON vs JSON5 vs JSONC ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON vs JSON5 vs JSONC
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기능', 'JSON (RFC 8259)', 'JSON5', 'JSONC'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
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

        {/* ── 4. 정렬 vs 압축 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON 정렬(Beautify) vs 압축(Minify)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✦ 정렬 (Beautify)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>가독성 ↑ (들여쓰기 2/4칸)</li>
                <li>디버깅·코드 리뷰</li>
                <li>크기 약 20~30% 증가</li>
                <li>API 응답 분석·로그 분석</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFF9B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>⊟ 압축 (Minify)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>공백·줄바꿈 제거</li>
                <li>네트워크 전송 절약</li>
                <li>크기 약 20~40% 감소</li>
                <li>API 응답·임베드</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. JSON → TypeScript ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            <div><span style={{ color: '#C485E0' }}>interface</span> <span style={{ color: '#3EC8FF' }}>Address</span> {'{'}</div>
            <div>  <span style={{ color: '#3EC8FF' }}>city</span>: <span style={{ color: '#3EFF9B' }}>string</span></div>
            <div>{'}'}</div>
            <div></div>
            <div><span style={{ color: '#C485E0' }}>interface</span> <span style={{ color: '#3EC8FF' }}>Root</span> {'{'}</div>
            <div>  <span style={{ color: '#3EC8FF' }}>address</span>: <span style={{ color: '#3EC8FF' }}>Address</span></div>
            <div>  <span style={{ color: '#3EC8FF' }}>age</span>: <span style={{ color: '#3EFF9B' }}>number</span></div>
            <div>  <span style={{ color: '#3EC8FF' }}>name</span>: <span style={{ color: '#3EFF9B' }}>string</span></div>
            <div>{'}'}</div>
          </div>
        </div>

        {/* ── 6. JSON ↔ YAML ↔ CSV ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON ↔ YAML ↔ CSV 변환
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'YAML',    c: '#3EC8FF', d: 'Kubernetes·Docker Compose·GitHub Actions·Ansible 설정 파일 표준' },
              { t: 'CSV',     c: '#3EFF9B', d: '엑셀·Google Sheets·DB import에 사용. 객체 배열 → 평탄화된 표' },
              { t: '키 정렬',  c: 'var(--accent)', d: '두 JSON 비교(diff) 시 키 순서 차이를 제거하고 의미 차이만 비교' },
              { t: '이스케이프', c: '#FFD700', d: 'JSON을 다시 JS 문자열에 임베드할 때 사용 (코드 안에 JSON 리터럴)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. JSON Pointer / 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JSON 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🔍 큰 JSON 분석',        d: '트리 뷰어로 접고 펼치며 구조 파악. 키 개수·깊이 통계로 복잡도 측정.' },
              { t: '⚡ 네트워크 절감',       d: 'API 응답은 항상 Minify. gzip 압축까지 적용 시 추가 70% 절감.' },
              { t: '🔀 두 JSON 비교',        d: '키 알파벳 정렬 후 diff 도구 사용 시 순서 차이 없이 의미 차이만 확인.' },
              { t: '🛠️ TypeScript 타입',     d: 'API 명세 없이 응답 JSON만으로 타입 정의 빠르게 생성. 후 수동 다듬기.' },
              { t: '📋 클립보드 → 코드',     d: 'API 응답 복사 → 변환 → 붙여넣기로 mock 데이터·테스트 데이터 즉시 생성.' },
              { t: '🚨 에러 위치 추적',       d: '파싱 오류 시 라인·컬럼 자동 표시. 큰 파일에서도 즉시 위치 확인.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
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
                a: '<strong>Beautify</strong>는 들여쓰기와 줄바꿈을 추가해 가독성을 높이는 작업으로, 디버깅이나 코드 리뷰 시 사용합니다. <strong>Minify</strong>는 모든 공백과 줄바꿈을 제거해 크기를 줄이는 작업으로, 네트워크 전송이나 저장 공간 절약이 필요할 때 사용합니다. API 응답은 보통 Minify로 전송하고, 분석할 때만 Beautify로 변환합니다. 일반적으로 <strong>Minify 시 20~40% 크기 감소</strong>됩니다.',
              },
              {
                q: 'JSON 파싱 오류 위치를 어떻게 찾나요?',
                a: 'JavaScript 표준 오류 메시지에는 보통 <code>at position N</code> 또는 <code>at line N column N</code> 형식으로 위치가 포함됩니다. 본 도구는 이를 자동으로 분석해 <strong>해당 라인의 텍스트와 컬럼 위치(^표시)</strong>를 보여줍니다. 자주 발생하는 원인은 ① trailing comma, ② 작은따옴표, ③ 키에 따옴표 누락, ④ 이스케이프되지 않은 특수문자입니다.',
              },
              {
                q: '두 JSON의 차이점을 비교하는 방법은?',
                a: '두 JSON을 비교하기 전 <strong>키 알파벳 정렬</strong>을 적용하면 순서 차이로 인한 가짜 diff를 제거할 수 있습니다. 본 도구의 <strong>변환 → 키 정렬</strong>로 정규화한 후, GitHub의 diff·VSCode의 비교 도구·jq 같은 CLI 도구로 의미적 차이만 확인하세요. 큰 JSON은 <code>jq -S</code>(키 정렬) + <code>diff</code> 조합이 효율적입니다.',
              },
            ].map((f, i) => (
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

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/dev/charcount',     icon: '🔡', name: '글자수 세기',           desc: '바이트·트위터 가중치·플랫폼 한도' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/dev/lorem',         icon: '📝', name: '더미 텍스트 생성기',    desc: 'Lorem Ipsum·한글 더미' },
              { href: '/tools/dev/color',         icon: '🎨', name: '색상 코드 변환기',      desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',          desc: 'px·rem·em·clamp() 변환' },
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
