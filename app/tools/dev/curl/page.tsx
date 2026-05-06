import Link from 'next/link'
import CurlClient from './CurlClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/curl',
  title: 'cURL 변환기 — fetch · axios · Python requests · Node.js · Go + 카카오·네이버·토스 API 예시',
  description: 'cURL 명령어를 fetch·axios·Python requests·Node.js http·Go 코드로 즉시 변환. HTTP 요청 구조 분석(headers·body·query). 카카오·네이버·토스·GitHub·OpenAI API 12개 예시 라이브러리. 모든 처리 브라우저 측.',
  keywords: [
    'cURL 변환', 'curl to fetch', 'curl to axios', 'curl to python',
    'cURL 변환기', 'cURL 컨버터', 'curl converter',
    'HTTP 코드 생성', 'fetch axios requests',
    '카카오 API 변환', '네이버 API curl', '토스 결제 cURL',
    'GitHub API curl', 'OpenAI API curl', 'Slack webhook',
    'Postman cURL import', 'GraphQL curl', 'AWS S3 curl',
    'Chrome DevTools Copy as cURL',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}
const codeStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'Syne, SF Mono, Consolas, monospace',
  fontSize: '12.5px',
  color: '#C8FF3E',
}

export default function CurlPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌀 cURL 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        cURL 명령어를 <strong style={{ color: 'var(--text)' }}>fetch · axios · Python requests · Node.js http · Go</strong> 5 언어 코드로 즉시 변환.
        HTTP 요청 구조 분석(headers·body·query) + <strong style={{ color: 'var(--text)' }}>카카오·네이버·토스·GitHub·OpenAI API 12개 예시</strong> 라이브러리.
        모든 처리가 브라우저에서 수행됩니다.
      </p>

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구의 cURL 파싱·코드 생성은 모두 <strong>브라우저에서 실행</strong>되며 입력 cURL·토큰·인증 정보는 외부로 전송되지 않습니다.
          <strong> 파일 업로드(@filename) · TLS 인증서(--cert) · 프록시(--proxy)</strong> 등 일부 옵션은 미지원이며 명시적으로 안내됩니다.
          생성된 코드는 일반 케이스 가정 어림이며, 운영 환경 적용 전 반드시 테스트하세요.
          <strong> Authorization · API 키</strong> 등 민감 헤더는 코드 복사 후 <strong>환경 변수</strong>로 옮기는 것을 권장합니다.
          분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <CurlClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 변환</strong> — cURL 붙여넣기 → 5개 언어 코드 동시 출력 (옵션: async/await·try/catch·민감 헤더 마스킹)</li>
          <li><strong>탭 2 요청 구조</strong> — METHOD·URL·Query·Headers·Auth·Cookies·Body 시각 분해 + Content-Type 자동 감지</li>
          <li><strong>탭 3 예시</strong> — 카카오·네이버·토스·쿠팡·GitHub·OpenAI·Slack·AWS·GraphQL·multipart 12개 카드, 클릭 시 자동 적용</li>
          <li><strong>탭 4 가이드</strong> — cURL 옵션 치트시트(15+) + 5 언어 비교 + 미지원 옵션 + 보안 주의</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력·옵션은 자동 저장됩니다. <strong>Chrome DevTools → Network → 우클릭 → Copy as cURL</strong> 그대로 붙여넣어도 동작합니다.
        </p>
      </div>

      {/* 2. cURL 옵션 치트시트 */}
      <h2 style={sectionTitle}>📖 cURL 옵션 치트시트 (15+)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          본 도구가 지원하는 cURL 옵션 사전입니다. 모든 옵션은 짧은 형식·긴 형식 모두 인식합니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>옵션</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>긴 형식</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>의미</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['-X', '--request', 'HTTP 메서드 (GET/POST/PUT/DELETE 등)'],
                ['-H', '--header', '헤더 추가'],
                ['-d', '--data', '본문 (POST 자동 전환)'],
                ['', '--data-raw', '본문 (@ 파일 처리 X)'],
                ['', '--data-urlencode', 'URL 인코드 본문'],
                ['-F', '--form', 'multipart/form-data 폼'],
                ['-u', '--user', 'Basic Auth (user:pass)'],
                ['-b', '--cookie', '쿠키'],
                ['-A', '--user-agent', 'User-Agent 헤더'],
                ['-e', '--referer', 'Referer 헤더'],
                ['-G', '--get', 'data를 query로 (GET)'],
                ['-k', '--insecure', 'SSL 검증 비활성 (정보용)'],
                ['-L', '--location', '리다이렉트 따라가기 (정보용)'],
                ['', '--compressed', 'gzip 응답 받기 (정보용)'],
                ['-v', '--verbose', '자세한 로그 (무시)'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px' }}><code style={codeStyle}>{row[0] || '—'}</code></td>
                  <td style={{ padding: '8px 10px' }}><code style={codeStyle}>{row[1]}</code></td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 5 언어 차이 */}
      <h2 style={sectionTitle}>🆚 5 언어 차이 — fetch · axios · Python · Node.js · Go</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 cURL을 5개 언어로 변환할 때 각 환경의 특징·관용을 반영합니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
          {[
            { emoji: '🟨', name: 'fetch (Modern JS)', when: '브라우저·Node 18+', pros: '내장, 표준', cons: 'JSON 자동 X (.json() 호출)' },
            { emoji: '🟦', name: 'axios', when: '구버전 브라우저·인터셉터 필요', pros: '인터셉터·자동 JSON·취소', cons: 'npm 의존성' },
            { emoji: '🐍', name: 'Python requests', when: '백엔드 스크립트·자동화', pros: '직관적, json= 자동', cons: '동기 (asyncio 별도)' },
            { emoji: '🟩', name: 'Node.js http/https', when: '의존성 없는 환경', pros: '내장, 가벼움', cons: '장황함, 콜백 패턴' },
            { emoji: '🐹', name: 'Go net/http', when: '백엔드·CLI', pros: '내장, 동시성', cons: 'Go 문법 학습 필요' },
          ].map((l, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', borderLeft: '3px solid #C8FF3E' }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{l.emoji} {l.name}</p>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '0 0 4px' }}><strong>언제:</strong> {l.when}</p>
              <p style={{ fontSize: 11.5, color: '#3EFFD0', margin: '0 0 4px' }}>✓ {l.pros}</p>
              <p style={{ fontSize: 11.5, color: '#FF8C3E', margin: 0 }}>✗ {l.cons}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 미지원 옵션 */}
      <h2 style={sectionTitle}>⚠️ 미지원 옵션 안내</h2>
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '2px solid rgba(255, 138, 62, 0.50)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '14px',
      }}>
        <p style={{ fontSize: 14, color: '#FFA63E', fontWeight: 700, margin: '0 0 12px' }}>
          🚨 본 도구가 <strong>지원하지 않는 cURL 옵션</strong> (생성 코드에 반영 X)
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.95 }}>
          <li><strong>📁 파일 업로드 @filename</strong> — <code style={codeStyle}>-d @body.txt</code>는 미지원, 단 multipart <code style={codeStyle}>-F file=@photo.jpg</code>는 지원 (placeholder 코드)</li>
          <li><strong>🔐 TLS 인증서</strong> <code style={codeStyle}>--cert</code> / <code style={codeStyle}>--key</code> / <code style={codeStyle}>--cacert</code></li>
          <li><strong>🌐 프록시</strong> <code style={codeStyle}>--proxy</code> / <code style={codeStyle}>--socks5</code></li>
          <li><strong>💾 파일 출력</strong> <code style={codeStyle}>-o</code> / <code style={codeStyle}>-O</code></li>
          <li><strong>📤 업로드</strong> <code style={codeStyle}>-T</code> / <code style={codeStyle}>--upload-file</code></li>
          <li><strong>📐 범위 다운로드</strong> <code style={codeStyle}>-r</code> / <code style={codeStyle}>--range</code></li>
          <li><strong>🔍 DNS 오버라이드</strong> <code style={codeStyle}>--resolve</code> / <code style={codeStyle}>--connect-to</code></li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 0', lineHeight: 1.7, fontStyle: 'italic' }}>
          위 옵션이 cURL에 있으면 파싱 시 오렌지 박스로 명시되며, 생성된 코드에는 반영되지 않습니다. <strong>수동 처리 필요</strong>.
        </p>
      </div>

      {/* 5. 한국 API 시나리오 */}
      <h2 style={sectionTitle}>🇰🇷 한국 API 자주 쓰는 시나리오</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          본 도구의 [📚 예시] 탭에 한국 백엔드 개발자가 자주 만나는 5개 API 예시가 준비되어 있습니다. 클릭 한 번으로 5 언어 코드 자동 생성.
        </p>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li>💬 <strong>카카오 메시지 보내기</strong> — Bearer 토큰 + form-urlencoded (talk_message API)</li>
          <li>💬 <strong>카카오 OAuth 토큰 발급</strong> — authorization_code → access_token</li>
          <li>🇰🇷 <strong>네이버 검색 API</strong> — X-Naver-Client-Id/Secret 헤더 (블로그 검색)</li>
          <li>💳 <strong>토스페이먼츠 결제 승인</strong> — Basic Auth + JSON body (payments/confirm)</li>
          <li>🛍️ <strong>쿠팡 파트너스 검색</strong> — HMAC-SHA256 서명 헤더 (제휴 상품)</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 실제 사용 시 <strong>YOUR_TOKEN·YOUR_CLIENT_ID 등 placeholder를 환경 변수로 교체</strong>하세요.
          예: Node.js <code style={codeStyle}>process.env.KAKAO_TOKEN</code>, Python <code style={codeStyle}>os.environ[&quot;NAVER_CLIENT_ID&quot;]</code>.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. fetch와 axios 어떤 게 더 좋나요?</summary>
        <p style={faqAnswer}>
          상황에 따라 다릅니다.<br />
          <strong>fetch (권장)</strong>:<br />
          • 브라우저·Node 18+ <strong>내장</strong> (의존성 0)<br />
          • 표준 Web API · 단순<br />
          • 단점: JSON 자동 변환 X (<code style={codeStyle}>.json()</code> 호출 필요), 인터셉터 X, 취소는 AbortController<br />
          <strong>axios</strong>:<br />
          • <strong>인터셉터</strong> (요청·응답 변환)·<strong>자동 JSON</strong>·진행률·취소 토큰·재시도 등 풍부한 기능<br />
          • 구버전 브라우저(IE) 지원<br />
          • 단점: <code style={codeStyle}>npm i axios</code> 의존성, 번들 크기 ↑<br />
          <strong>현대 프로젝트 (Next.js·Vite)</strong>: fetch + 필요시 SWR/TanStack Query 조합 권장. axios는 인터셉터·재시도가 핵심일 때.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. Python에선 requests vs httpx 차이?</summary>
        <p style={faqAnswer}>
          <strong>requests</strong>:<br />
          • 가장 널리 쓰이는 HTTP 클라이언트 (2011~)<br />
          • <strong>동기 (sync)</strong> 만 지원<br />
          • 단순, 직관적, 풍부한 문서<br />
          <strong>httpx</strong>:<br />
          • requests 호환 API + <strong>동기·비동기 모두 지원</strong><br />
          • HTTP/2 기본 지원<br />
          • FastAPI 등 비동기 프로젝트에 적합<br />
          본 도구는 <strong>requests 코드를 생성</strong>합니다 (가장 일반적). httpx 사용자는 import 부분만 변경하면 거의 호환:
          <code style={codeStyle}>{`import httpx; httpx.post(...)`}</code>. 비동기는 <code style={codeStyle}>{`httpx.AsyncClient()`}</code> 사용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. Node.js fetch는 언제부터?</summary>
        <p style={faqAnswer}>
          <strong>Node.js 18 (2022.04)</strong>부터 <code style={codeStyle}>fetch</code>가 전역으로 사용 가능 (node-fetch 패키지 불필요).<br />
          • Node 18~20: 실험적 (<code style={codeStyle}>--experimental-fetch</code> 플래그 없이 사용)<br />
          • Node 21+: 안정 stable<br />
          • <strong>Node 16 이하</strong>: <code style={codeStyle}>npm i node-fetch</code> 필요<br />
          본 도구의 fetch 코드는 Node 18+ 가정. 구버전이면:<br />
          <code style={codeStyle}>{`import fetch from 'node-fetch'`}</code><br />
          또는 axios·node http 코드를 사용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 다중 라인 cURL (\) 지원하나요?</summary>
        <div style={faqAnswer}>
          <strong>네, 완벽히 지원</strong>합니다. Chrome/Firefox DevTools의 &quot;Copy as cURL&quot;이 생성하는 다중 라인 형식 그대로 붙여넣어도 동작합니다.<br />
          예시:
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 11.5, fontFamily: 'Syne, monospace', color: 'var(--text)', marginTop: 6 }}>
{`curl 'https://api.example.com/data' \\
  -H 'accept: application/json' \\
  -H 'authorization: Bearer XXX' \\
  --compressed`}
          </pre>
          <strong>지원 형식</strong>:<br />
          • <code style={codeStyle}>{`\\`}</code> + 개행 (셸 표준)<br />
          • <code style={codeStyle}>{`\\`}</code> + CRLF (Windows 친화)<br />
          • 일반 한 줄<br />
          파서는 줄 이어짐을 공백으로 변환 후 토큰화합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 파일 업로드(-F)는 변환되나요?</summary>
        <p style={faqAnswer}>
          <strong>multipart 구조는 지원, 파일 자체는 placeholder</strong>입니다.<br />
          • <code style={codeStyle}>-F &quot;file=@photo.jpg&quot;</code> → 코드 생성: FormData에 파일 placeholder<br />
          • <strong>fetch / axios</strong>: <code style={codeStyle}>{`formData.append('file', fileInput.files[0])`}</code> 형식 (브라우저 파일 입력 가정)<br />
          • <strong>Python</strong>: <code style={codeStyle}>{`open('photo.jpg', 'rb')`}</code> 자동 추가<br />
          • <strong>Node.js / Go</strong>: 주석으로 form-data 패키지 또는 mime/multipart 사용 안내<br />
          실제 파일 처리 코드는 사용자가 직접 추가해야 합니다 (환경별로 다름). <strong>비-multipart 파일</strong> (<code style={codeStyle}>-d @body.txt</code>)는 <strong>미지원</strong>이며 경고 표시.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. Authorization 토큰을 안전하게 처리하려면?</summary>
        <p style={faqAnswer}>
          <strong>핵심 원칙</strong>: 토큰을 <strong>코드에 직접 하드코딩 X</strong>, 환경 변수로 분리.<br />
          • <strong>JavaScript (브라우저)</strong>: 절대 클라이언트 코드에 X. 백엔드 프록시 경유<br />
          • <strong>Node.js</strong>: <code style={codeStyle}>process.env.API_TOKEN</code> + .env 파일 (.gitignore)<br />
          • <strong>Python</strong>: <code style={codeStyle}>{`os.environ['API_TOKEN']`}</code> + python-dotenv<br />
          • <strong>Go</strong>: <code style={codeStyle}>{`os.Getenv("API_TOKEN")`}</code> + .env<br />
          • <strong>CI/CD</strong>: GitHub Actions Secrets·GitLab CI Variables<br />
          • <strong>운영</strong>: AWS Secrets Manager·Vault·Doppler 등 시크릿 매니저<br />
          본 도구의 <strong>마스킹 옵션</strong>을 켜면 코드 출력 시 <code style={codeStyle}>***</code>로 표시되어 우연한 노출을 방지합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. multipart/form-data 변환?</summary>
        <p style={faqAnswer}>
          <code style={codeStyle}>-F</code> 옵션이 multipart로 자동 변환됩니다.<br />
          • <strong>fetch / axios</strong>: <code style={codeStyle}>FormData</code> 객체 생성. <strong>Content-Type 헤더 직접 설정 금지</strong> (boundary 자동 생성)<br />
          • <strong>Python</strong>: <code style={codeStyle}>files=</code> + <code style={codeStyle}>data=</code> 분리<br />
          • <strong>Node.js / Go</strong>: form-data 패키지 또는 mime/multipart 사용 안내<br />
          <strong>주의</strong>: cURL의 <code style={codeStyle}>-F</code>는 자동으로 <code style={codeStyle}>Content-Type: multipart/form-data; boundary=...</code>를 생성합니다. 사용자가 직접 -H로 Content-Type을 지정하면 boundary 누락으로 깨질 수 있어요. 본 도구는 <strong>multipart 시 Content-Type 헤더를 자동 제거</strong>합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. GraphQL cURL 변환?</summary>
        <div style={faqAnswer}>
          GraphQL은 일반 HTTP POST + JSON body이므로 <strong>완벽히 변환</strong>됩니다.<br />
          예시 cURL:
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 11.5, fontFamily: 'Syne, monospace', color: 'var(--text)', marginTop: 6 }}>
{`curl -X POST 'https://api.github.com/graphql' \\
  -H 'Authorization: Bearer TOKEN' \\
  -d '{
    "query": "query { viewer { login } }",
    "variables": {}
  }'`}
          </pre>
          본 도구의 <strong>탭 3 예시</strong>에서 GraphQL 카드를 적용해 보세요. <code style={codeStyle}>query</code>·<code style={codeStyle}>variables</code> 필드가 포함된 JSON이 5 언어로 변환됩니다.<br />
          더 정교한 GraphQL 클라이언트(Apollo·urql·graphql-request)는 별도 라이브러리 사용 권장.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. AWS S3 cURL 변환?</summary>
        <p style={faqAnswer}>
          <strong>구조는 변환되지만, AWS Signature V4 서명은 사용자가 직접 처리</strong>해야 합니다.<br />
          • <strong>본 도구</strong>: cURL의 헤더(Authorization V4·x-amz-content-sha256·x-amz-date)를 그대로 5 언어 코드로 옮김<br />
          • <strong>실제 운영</strong>:<br />
          &nbsp;&nbsp;- <strong>JavaScript</strong>: <code style={codeStyle}>@aws-sdk/client-s3</code> 사용 (서명 자동)<br />
          &nbsp;&nbsp;- <strong>Python</strong>: <code style={codeStyle}>boto3</code><br />
          &nbsp;&nbsp;- <strong>Go</strong>: <code style={codeStyle}>aws-sdk-go-v2</code><br />
          본 도구는 <strong>학습·디버깅용</strong>이며 운영 환경에서는 SDK 사용 권장. 본 도구의 [📚 예시] 탭의 AWS S3 카드는 V4 서명 헤더 형식 참고용입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 본 도구는 입력 데이터를 서버에 보내나요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 모든 처리가 브라우저(클라이언트)에서 수행됩니다.</strong><br />
          • cURL 파싱: 직접 작성한 토큰화 + 플래그 파서 (~500줄, 외부 라이브러리 0)<br />
          • 코드 생성: 템플릿 문자열 (서버 호출 0)<br />
          • Network 탭 확인: 변환 시 어떤 fetch/XHR도 발생하지 않음<br />
          • 입력은 <strong>localStorage에만 저장</strong> (재방문 편의), 외부 전송 X<br />
          <strong>다만</strong>: 공용 PC·공유 기기에서 Authorization 토큰·API 키를 다룬 경우 사용 후 정리하세요.
          DevTools → Application → Local Storage에서 <code style={codeStyle}>youtil_curl_v1</code> 키 삭제 가능.
          민감 토큰은 <strong>마스킹 옵션</strong>으로 코드에서 *** 처리하고, 실제 값은 환경 변수로 옮기는 것을 권장합니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/url-encode" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔗</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>URL 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인코드·쿼리 편집·추적 정리
          </p>
        </Link>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
        <Link href="/tools/dev/yaml-json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📄</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>YAML ↔ JSON</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            K8s·Spring·OpenAPI 예시
          </p>
        </Link>
      </div>
    </div>
  )
}
