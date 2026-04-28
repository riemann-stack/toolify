import Link from 'next/link'
import Base64Client from './Base64Client'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/base64',
  title: 'Base64 인코더/디코더 — 텍스트·파일·JWT·이미지 Data URI',
  description: '텍스트·파일·이미지를 Base64로 변환하고 JWT 토큰을 디코딩합니다. URL-safe Base64, Hex/Binary/URL/HTML 다중 변환, 이미지 미리보기·Data URI 생성, JWT 만료 검증까지 무료 온라인 도구.',
  keywords: ['base64인코더', 'base64디코더', 'base64변환기', 'JWT디코더', '이미지base64', 'datauri생성', 'URL-safe base64', '파일base64변환', 'JWT만료확인', 'hex변환'],
})

export default function Base64Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자·텍스트
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔐 Base64 인코더/디코더
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        텍스트·<strong style={{ color: 'var(--text)' }}>파일·이미지</strong>를 Base64로 변환하고 <strong style={{ color: 'var(--text)' }}>JWT 토큰</strong>을 디코딩합니다.
        URL-safe Base64, Hex·Binary·URL·HTML <strong style={{ color: 'var(--text)' }}>6가지 인코딩 동시 변환</strong>, 이미지 Data URI 생성, JWT 만료 시간 검증까지.
      </p>

      <Base64Client />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Base64 원리 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Base64 인코딩 원리
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            Base64는 바이너리 데이터를 <strong style={{ color: 'var(--text)' }}>64개의 ASCII 문자(A-Z, a-z, 0-9, +, /)</strong>로 표현하는 인코딩 방식입니다.
            텍스트 기반 시스템에서 이진 데이터를 안전하게 전송하기 위해 1987년 RFC 1421(PEM)에서 처음 정의되었으며, 현재는 RFC 4648 표준입니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 변환 단위</span></div>
            <div>3 바이트 (24 비트) → <span style={{ color: '#3EFF9B' }}>4 문자 (6 비트 × 4)</span></div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 예시: &quot;Cat&quot; → &quot;Q2F0&quot;</span></div>
            <div>C(67) a(97) t(116) → 01000011 01100001 01110100</div>
            <div>→ 010000 110110 000101 110100</div>
            <div>→ 16(<span style={{ color: '#3EC8FF' }}>Q</span>) 54(<span style={{ color: '#3EC8FF' }}>2</span>) 5(<span style={{ color: '#3EC8FF' }}>F</span>) 52(<span style={{ color: '#3EC8FF' }}>0</span>)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📐 <strong style={{ color: 'var(--text)' }}>크기 변화:</strong> Base64는 항상 원본보다 약 <strong style={{ color: '#FF8C3E' }}>33% 증가</strong>합니다 (3바이트 → 4문자 = 4/3 ≈ 1.33).
            10MB 파일을 Base64로 변환하면 약 13.3MB가 됩니다.
          </div>
        </div>

        {/* ── 2. 사용 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Base64 주요 사용 사례
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📧 이메일 첨부파일',      c: 'var(--accent)', d: 'MIME 표준에서 이미지·문서를 7-bit ASCII로 안전하게 전송' },
              { t: '🔑 JWT 토큰',            c: '#3EC8FF',       d: 'JSON Web Token의 헤더·페이로드를 URL-safe Base64로 인코딩' },
              { t: '🖼️ 이미지 Data URI',     c: '#3EFF9B',       d: 'HTML/CSS에 이미지를 직접 임베드 (data:image/png;base64,...)' },
              { t: '🔐 HTTP Basic 인증',     c: '#FFD700',       d: 'Authorization 헤더에 user:password를 Base64로 전송' },
              { t: '📦 PDF 임베드',          c: '#FF8C3E',       d: 'API 응답에 PDF 바이너리를 텍스트로 포함' },
              { t: '🔒 PEM 인증서',          c: '#9B59B6',       d: 'X.509 인증서·SSH 키를 텍스트 파일로 저장' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. URL-safe vs 표준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            표준 Base64 vs URL-safe Base64
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '표준 Base64', 'URL-safe (RFC 4648 §5)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '치환',          v1: '+, /, =', v2: '-, _, (없음)' },
                  { k: '패딩 (=)',      v1: '항상 포함', v2: '생략 가능' },
                  { k: 'URL/파일명',    v1: '⚠️ 인코딩 필요', v2: '✓ 그대로 사용' },
                  { k: '주요 사용처',    v1: '이메일·일반', v2: 'JWT·OAuth·URL' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{r.v1}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'rgba(62,200,255,0.05)', border: '1px solid rgba(62,200,255,0.30)', borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
            💡 <strong style={{ color: '#3EC8FF' }}>예시:</strong>
            표준 <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>SGVsbG8/V29ybGQ+</code> →
            URL-safe <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>SGVsbG8_V29ybGQ-</code>
          </div>
        </div>

        {/* ── 4. JWT 구조 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            JWT(JSON Web Token) 구조
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <div><span style={{ color: '#FF6B6B' }}>HEADER</span>.<span style={{ color: 'var(--accent)' }}>PAYLOAD</span>.<span style={{ color: '#3EC8FF' }}>SIGNATURE</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 각 부분은 URL-safe Base64로 인코딩된 JSON</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #FF6B6B', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 6 }}>HEADER</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>알고리즘(alg)·토큰 타입(typ). 예: <code>HS256</code>, <code>RS256</code></p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>PAYLOAD (Claims)</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>사용자 정보·만료 시간(exp)·발급(iat)·발급자(iss)·대상(aud)</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EC8FF', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 6 }}>SIGNATURE</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>HEADER.PAYLOAD를 비밀키로 서명. 위변조 검증용.</p>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.05)',
            border: '1px solid rgba(255,140,62,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>보안 주의:</strong> JWT의 PAYLOAD는 <strong>암호화가 아닌 인코딩</strong>입니다.
            누구나 디코딩 가능하므로 <strong>비밀번호·민감 정보는 PAYLOAD에 절대 포함하지 마세요.</strong>
            서명 검증은 비밀키가 있어야 가능하며, 본 도구는 디코딩만 수행합니다.
          </div>
        </div>

        {/* ── 5. Data URI ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이미지 Data URI 활용
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 형식</span></div>
            <div>data:[MIME 타입];base64,[데이터]</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 예시</span></div>
            <div>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 12 }}>
            {[
              { t: '✅ 적합한 경우',  c: '#3EFF9B', items: ['작은 아이콘 (< 5KB)', 'CSS 배경 이미지 단일 파일', '오프라인 HTML 이메일 템플릿', '캐시 분리가 불필요한 경우'] },
              { t: '❌ 부적합한 경우', c: '#FF6B6B', items: ['큰 이미지 (> 50KB)', '여러 페이지에서 재사용', '브라우저 캐싱이 중요할 때', '이미지 최적화·CDN 활용 필요'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 다중 인코딩 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인코딩 방식 비교 (&quot;Hi&quot; 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['인코딩', '결과', '주요 용도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { e: 'Base64',     v: 'SGk=',                     u: '이메일·일반 바이너리 전송' },
                  { e: 'Base64 URL', v: 'SGk',                       u: 'JWT·URL 파라미터' },
                  { e: 'Hex',        v: '4869',                     u: '해시·암호화·디버깅' },
                  { e: 'Binary',     v: '01001000 01101001',         u: '교육·로우레벨 분석' },
                  { e: 'URL Encoded',v: 'Hi (변경 없음)',            u: '쿼리 스트링 (특수문자만 변환)' },
                  { e: 'HTML Entity',v: 'Hi (변경 없음)',            u: 'HTML 본문 안전 삽입 (&lt;&gt; 등)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 보안 주의 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ Base64는 암호화가 아닙니다
          </h2>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.30)',
            borderRadius: 14,
            padding: '16px 20px',
            fontSize: 13,
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: '#FF8C8C' }}>흔한 오해:</strong> &quot;Base64는 암호화 같다&quot;라고 생각하는 경우가 있지만, 사실 Base64는 단순 <strong>인코딩</strong>이며 누구나 디코딩할 수 있습니다.
            </p>
            <ul style={{ paddingLeft: 22, color: 'var(--muted)', margin: 0 }}>
              <li>비밀번호·API 키·신용카드 정보를 Base64로 &quot;감춰서&quot; 저장하는 것은 보안에 도움이 되지 않습니다</li>
              <li>JWT의 PAYLOAD는 누구나 디코딩 가능 — 민감 정보 포함 금지</li>
              <li>실제 보호가 필요하면 <strong style={{ color: 'var(--text)' }}>HTTPS, 암호화(AES·RSA), 해싱(bcrypt·argon2)</strong>을 사용하세요</li>
            </ul>
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
                q: 'Base64로 인코딩하면 파일 크기가 왜 커지나요?',
                a: 'Base64는 <strong>3바이트(24비트)를 4문자(6비트 × 4)</strong>로 표현하므로 항상 4/3 = 약 33% 커집니다. 10MB 파일은 약 13.3MB가 되며, 줄바꿈·패딩까지 포함하면 더 늘어날 수 있습니다. 따라서 큰 파일은 Base64 대신 multipart/form-data나 파일 업로드 API를 사용하는 것이 효율적입니다.',
              },
              {
                q: 'JWT 토큰을 디코딩해도 보안에 문제 없나요?',
                a: '<strong>JWT의 HEADER와 PAYLOAD는 암호화가 아닌 인코딩</strong>이므로 누구나 디코딩할 수 있습니다. 토큰 보유자가 내용을 보는 것은 정상이지만, <strong>PAYLOAD에 민감 정보(비밀번호, 신용카드 등)를 절대 포함하면 안 됩니다.</strong> 토큰의 무결성은 SIGNATURE로 보장되며, 서명 검증은 비밀키가 필요합니다. 본 도구는 디코딩만 수행하며 서명 검증은 하지 않습니다.',
              },
              {
                q: '한글을 Base64로 인코딩하면 깨지는 이유는?',
                a: '브라우저 기본 <code>btoa()</code>는 ASCII 외 문자를 처리하지 못하는 한계가 있습니다. 본 도구는 <strong>UTF-8로 먼저 변환</strong>한 후 Base64 인코딩하므로 한글·이모지·특수문자도 안전합니다. 디코딩 시에도 동일한 방식을 사용해야 깨지지 않습니다. <code>btoa(unescape(encodeURIComponent(text)))</code> 패턴이 표준입니다.',
              },
              {
                q: 'URL-safe Base64는 언제 사용하나요?',
                a: '표준 Base64에 포함된 <strong>+, /, =</strong>가 URL이나 파일명에서 특수한 의미를 가지므로 인코딩이 추가로 필요합니다. URL-safe는 이를 <strong>-, _</strong>로 치환하고 패딩을 생략해 그대로 URL이나 파일명에 사용할 수 있습니다. <strong>JWT, OAuth, URL 파라미터, S3 사전 서명 URL</strong> 등에서 표준입니다.',
              },
              {
                q: '이미지를 Base64 Data URI로 임베드하는 게 좋을까요?',
                a: '경우에 따라 다릅니다. <strong>5KB 이하 작은 아이콘</strong>은 HTTP 요청 절감·CSS 통합 면에서 유리하지만, <strong>50KB 이상 큰 이미지</strong>는 ① 33% 크기 증가, ② 캐시 분리 불가, ③ 페이지 초기 로딩 지연 등의 단점이 큽니다. 일반적으로 <strong>SVG 아이콘 단일·이메일 템플릿</strong>은 Data URI, <strong>일반 이미지</strong>는 CDN 사용을 권장합니다.',
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
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: 'JSON 정렬·압축·트리·검증' },
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
