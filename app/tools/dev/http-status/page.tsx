import Link from 'next/link'
import HttpStatusClient from './HttpStatusClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/http-status',
  title: 'HTTP 상태 코드 검색기 — 200·301·401·403·404·500 등 한국어 설명 + 디버깅 가이드',
  description: 'HTTP 상태 코드 65+ 한국어 설명·발생 시기·해결 힌트·실제 한국 사이트 사례. 200·301·401·403·404·429·500·502·504 등 표준 + Cloudflare(521·524)·nginx(499) 비표준 코드. CORS·JWT·Lambda 디버깅 시나리오 12개.',
  keywords: [
    'HTTP 상태 코드', 'HTTP status code',
    '404 의미', '500 에러', '401 unauthorized', '403 forbidden',
    '502 bad gateway', '504 gateway timeout',
    'Cloudflare 521 522', 'CORS preflight 405', 'JWT 401',
    '429 rate limit', '422 validation', '301 vs 302',
    'REST API 응답 코드', 'Spring Boot 응답 코드', 'FastAPI 422',
    'nginx 499', 'CDN 502',
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

export default function HttpStatusPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌐 HTTP 상태 코드 검색기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        HTTP 상태 코드 <strong style={{ color: 'var(--text)' }}>65+ 한국어 설명·발생 시기·해결 힌트·실제 한국 사이트 사례</strong>.
        200·301·401·403·404·429·500·502·504 등 표준 + <strong style={{ color: 'var(--text)' }}>Cloudflare(521·524)·nginx(499) 비표준</strong>.
        CORS·JWT·Lambda 디버깅 시나리오 12개.
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
          ⚠️ 본 도구의 HTTP 상태 코드 설명·해결 힌트는 <strong>RFC 7231·9110 등 표준 명세와 일반적 운영 경험을 정리한 어림</strong>이며, 모든 시나리오를 완전히 커버하지 않습니다.
          실제 운영 환경에서 마주친 오류는 <strong>서버 로그·DevTools Network 탭·CDN 대시보드</strong> 등 추가 진단이 필요합니다.
          <strong> Cloudflare(521·524)·nginx(499) 등 비표준 코드는 해당 벤더의 공식 문서를 우선</strong> 참조하세요.
          분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <HttpStatusClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 검색</strong> — 코드 번호(404) 또는 키워드(인증·timeout) 입력 → 자동완성 결과 + 큰 상세 카드 + 한국 사이트 사례 + RFC 링크</li>
          <li><strong>탭 2 카테고리별</strong> — 1xx~5xx + 비표준 한 페이지 전체 보기, 카드 클릭 시 탭 1 상세</li>
          <li><strong>탭 3 디버깅</strong> — 실제 운영 시나리오 12개 (JWT 401·CORS 405·Lambda 504·CF 521 등) — 원인·단계별 해결</li>
          <li><strong>탭 4 가이드</strong> — 5+1 카테고리 의미 + 흔한 혼동 5쌍 (401 vs 403, 502 vs 504) + 프레임워크별 응답</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 ⭐ 즐겨찾기 추가 → localStorage 저장. 빠른 칩 12개로 인기 코드 즉시 접근.
        </p>
      </div>

      {/* 2. 5+1 카테고리 의미 */}
      <h2 style={sectionTitle}>📊 5+1 카테고리 의미 (1xx ~ 5xx + 비표준)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          HTTP 상태 코드는 <strong>첫 자리 숫자</strong>로 의미를 분류합니다. 카테고리만 봐도 성공인지 클라이언트 문제인지 서버 문제인지 즉시 판단 가능.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>카테고리</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>범위</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>의미</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>대표</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ℹ️ 1xx', '100~199', 'Informational (정보)', '100, 101, 103', '#888888'],
                ['✅ 2xx', '200~299', 'Success (성공)', '200, 201, 204, 304', '#3EFFD0'],
                ['↪️ 3xx', '300~399', 'Redirect (리다이렉트)', '301, 302, 307, 308', '#3EC8FF'],
                ['⚠️ 4xx', '400~499', 'Client Error (클라이언트 오류)', '400, 401, 403, 404, 429', '#FFB83E'],
                ['🚨 5xx', '500~599', 'Server Error (서버 오류)', '500, 502, 503, 504', '#FF3E8C'],
                ['🔌 비표준', '벤더', 'Cloudflare·nginx 자체 정의', '521, 524, 499', '#9B59B6'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: row[4], fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Syne, monospace' }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontFamily: 'Syne, monospace', fontSize: 12 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 흔한 혼동 비교 */}
      <h2 style={sectionTitle}>🆚 흔한 혼동 비교 (401 vs 403, 502 vs 504, 301 vs 302)</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>401 vs 403</strong> — 401: 인증 정보 X·만료 (토큰 누락) / 403: 인증은 됐지만 권한 없음 (스코프 부족)</li>
          <li><strong>301 vs 302</strong> — 301: 영구 이동 (SEO 인덱스 갱신) / 302: 임시 이동 (SEO 영향 X)</li>
          <li><strong>502 vs 504</strong> — 502: 백엔드 다운·잘못된 응답 / 504: 백엔드 응답 너무 느림 (timeout)</li>
          <li><strong>200 vs 204</strong> — 200: 성공 + 본문 있음 / 204: 성공 + 본문 없음 (DELETE 후 헤더만)</li>
          <li><strong>200 vs 201</strong> — 200: 단순 성공 (조회·수정) / 201: 성공 + 새 리소스 생성 (POST + Location 헤더)</li>
        </ul>
      </div>

      {/* 4. 표준 vs 비표준 출처 */}
      <h2 style={sectionTitle}>📜 표준 vs 비표준 출처</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li>📖 <strong>표준 RFC</strong>: 7231 (HTTP/1.1)·6585 (추가 코드 428·429·431·511)·8297 (103 Early Hints)·7235 (인증)·7232 (조건부)·7538 (308)·7540 (HTTP/2)·4918 (WebDAV)·9110 (HTTP 의미론, 2022 최신)</li>
          <li>☁️ <strong>Cloudflare 5xx (520~530)</strong>: Cloudflare 자체 정의 — Origin 서버 통신 문제 진단</li>
          <li>🔌 <strong>nginx (444·494·499)</strong>: nginx 내부 코드 — 클라이언트 종료·헤더 크기·차단</li>
          <li>🟦 <strong>Microsoft IIS</strong>: 440 (Login Time-out)·449 (Retry With)·451 (Redirect)</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ 비표준 코드는 해당 벤더 공식 문서를 우선 참조하세요. 본 도구는 운영에서 자주 보이는 비표준 11개를 포함합니다.
        </p>
      </div>

      {/* 5. 프레임워크별 응답 */}
      <h2 style={sectionTitle}>🛠️ 프레임워크별 기본 응답 코드 (Spring·Express·FastAPI·Django)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          백엔드 프레임워크가 <strong>자동으로 반환</strong>하는 코드를 알면 디버깅이 빨라집니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>프레임워크</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>패턴·실패</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>기본 응답</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🍃 Spring Boot', '@PostMapping', '200 (또는 ResponseEntity로 201)'],
                ['🍃 Spring Boot', '@DeleteMapping', '200 (수동 204 권장)'],
                ['🍃 Spring Boot', '@Valid 실패', '400 Bad Request (자동)'],
                ['🍃 Spring Boot', '@ExceptionHandler 미정의', '500 Internal'],
                ['🟢 Express', 'res.json()', '200 OK'],
                ['🟢 Express', 'next(err) (error middleware)', '500 (기본)'],
                ['🐍 FastAPI', 'Pydantic validation 실패', '422 Unprocessable Entity'],
                ['🐍 FastAPI', 'HTTPException(404)', '지정 status_code'],
                ['🐍 Django REST', 'serializer.is_valid() 실패', '400 Bad Request'],
                ['🐍 Django REST', 'permission_classes 실패', '403 Forbidden'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontSize: 12.5 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: '#C8FF3E', fontFamily: 'Syne, monospace', fontWeight: 700 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 401과 403의 차이는?</summary>
        <p style={faqAnswer}>
          가장 흔한 혼동입니다.<br />
          • <strong>401 Unauthorized</strong>: 인증 정보가 <strong>없거나 만료</strong>됨 (이름과 달리 &quot;권한 부족&quot;이 아님). 실제 의미는 &quot;Unauthenticated&quot;<br />
          • <strong>403 Forbidden</strong>: 인증은 됐지만 <strong>해당 리소스에 권한 없음</strong> (스코프 부족·IP 차단·CDN 서명 만료)<br />
          <strong>예시</strong>:<br />
          • Authorization 헤더 없이 API 호출 → <strong>401</strong> (토큰 자체 없음)<br />
          • 일반 사용자 토큰으로 관리자 API 호출 → <strong>403</strong> (토큰은 있지만 권한 부족)<br />
          • JWT exp 시간 지남 → <strong>401</strong> (재로그인 필요)<br />
          본 도구의 [🔍 검색]에서 401·403을 비교하며 확인 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 301과 302 어떤 걸 써야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>SEO·캐시</strong> 관점에서 매우 다릅니다.<br />
          • <strong>301 Moved Permanently</strong>: 영구 이동. 검색엔진이 <strong>새 URL로 인덱스 갱신</strong>, 브라우저 캐시. SEO 점수 이전.<br />
          • <strong>302 Found</strong>: 임시 이동. 검색엔진은 <strong>원본 URL 유지</strong>, 캐시 X<br />
          <strong>사용 가이드</strong>:<br />
          • 도메인 영구 변경 (daum.net → kakao.com) → <strong>301</strong><br />
          • A/B 테스트·임시 분기·점검 페이지 → <strong>302</strong><br />
          • POST → POST 메서드 보존 필요 → <strong>307</strong> (임시) / <strong>308</strong> (영구)<br />
          ⚠️ <strong>301은 캐시되므로 신중히</strong>. 한 번 잘못 설정하면 사용자 브라우저에 영구 캐시.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 502와 504 차이는?</summary>
        <p style={faqAnswer}>
          둘 다 게이트웨이(nginx·CDN) 관련 5xx지만 원인이 다릅니다.<br />
          • <strong>502 Bad Gateway</strong>: 게이트웨이가 백엔드에서 <strong>잘못된 응답</strong> 받음 (TCP RST·헤더 깨짐·백엔드 다운)<br />
          • <strong>504 Gateway Timeout</strong>: 게이트웨이가 백엔드 응답을 <strong>기다리다 timeout</strong> (백엔드 너무 느림)<br />
          <strong>구분 방법</strong>:<br />
          • 백엔드 서비스가 <code style={codeStyle}>systemctl status</code>에서 active이면 → <strong>504</strong> (응답 느림)<br />
          • 백엔드 다운이면 → <strong>502</strong><br />
          <strong>일반적 원인</strong>: 502 - nginx upstream 다운·헬스체크 실패 / 504 - Lambda 30초 초과·DB 슬로우 쿼리·외부 API 무응답
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. CORS 오류는 몇 번 코드인가요?</summary>
        <p style={faqAnswer}>
          <strong>고정된 코드 없음</strong> — 상황에 따라 다릅니다.<br />
          • <strong>preflight OPTIONS 미응답</strong> → 405 Method Not Allowed 또는 응답 자체 없음<br />
          • <strong>Allow-Origin 헤더 누락</strong> → 200 OK이지만 브라우저가 차단 (네트워크 탭은 200, 콘솔은 CORS 오류)<br />
          • <strong>credentials: include + Allow-Origin: *</strong> → 200이지만 브라우저 차단<br />
          <strong>해결</strong>: 본 도구의 [🐛 디버깅] 탭에서 &quot;CORS preflight 실패&quot; 시나리오 참조.
          핵심: 서버에 <code style={codeStyle}>{`Access-Control-Allow-Origin`}</code>·<code style={codeStyle}>{`Allow-Methods`}</code>·<code style={codeStyle}>{`Allow-Headers`}</code> 설정.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 429 Too Many Requests 발생 시?</summary>
        <p style={faqAnswer}>
          API rate limit 초과. 응답에 따라 대응:<br />
          • <strong>Retry-After 헤더</strong> 확인 (대기 시간 sec) → 그 시간만큼 대기 후 재시도<br />
          • <strong>X-RateLimit-Remaining·X-RateLimit-Reset</strong> 헤더 모니터링<br />
          • <strong>Exponential backoff</strong> 패턴: 1초 → 2초 → 4초 → 8초 (랜덤 지터 추가)<br />
          • <strong>캐싱·요청 묶기</strong> (배치)로 호출 줄이기<br />
          • <strong>API 플랜 업그레이드</strong> (paid tier)<br />
          <strong>한국 API 한도</strong>:<br />
          • 네이버 검색: 25,000회/일<br />
          • 카카오 메시지: 분당 한도 (계정별 다름)<br />
          • OpenAI: tier별 RPM·TPM<br />
          • GitHub: 시간당 5000 (인증), 60 (비인증)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. Cloudflare 521·522·524 차이?</summary>
        <p style={faqAnswer}>
          모두 Cloudflare ↔ Origin 서버 통신 문제이지만 단계가 다릅니다.<br />
          • <strong>521 Web Server Is Down</strong>: TCP 연결 거부 — Origin 서버 다운·방화벽이 Cloudflare IP 차단<br />
          • <strong>522 Connection Timed Out</strong>: TCP 핸드셰이크 timeout — 네트워크 지연·과부하<br />
          • <strong>524 A Timeout Occurred</strong>: 연결은 됐지만 100초 내 HTTP 응답 못 받음 — Origin 처리 너무 느림<br />
          <strong>해결</strong>:<br />
          • 521/522: Origin 서버 상태 확인 + Cloudflare IP 화이트리스트 (cloudflare.com/ips)<br />
          • 524: Origin 처리 시간 단축, 비동기 처리, Cloudflare Enterprise는 100초 → 6000초 가능<br />
          <strong>WebSocket·SSE 장기 연결</strong>은 524 자주 발생 → Cloudflare Enterprise 또는 Cloudflare Tunnel 사용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 200 vs 204 vs 201 언제 쓰나요?</summary>
        <p style={faqAnswer}>
          REST API 설계 시 의도를 명확히:<br />
          • <strong>200 OK</strong>: 성공 + <strong>응답 본문 있음</strong> — GET·PUT·PATCH 결과 반환<br />
          • <strong>201 Created</strong>: 성공 + <strong>새 리소스 생성</strong> — POST. <strong>Location 헤더 필수</strong> (새 URL)<br />
          • <strong>204 No Content</strong>: 성공 + <strong>응답 본문 없음</strong> — DELETE 성공 / PUT으로 변경했지만 결과 안 보낼 때 / CORS preflight<br />
          <strong>실수</strong>:<br />
          • DELETE 후 200 + 빈 본문 → 잘못 (204가 명확)<br />
          • POST 후 200 + 새 리소스 → 잘못 (201 + Location 헤더)<br />
          • 204 응답에 <code style={codeStyle}>response.json()</code> 호출 → 오류 (본문 없음)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 422 Unprocessable Entity는 언제?</summary>
        <div style={faqAnswer}>
          400과 다른 점이 핵심:<br />
          • <strong>400 Bad Request</strong>: <strong>구문 오류</strong> (JSON 파싱 실패·콤마 누락)<br />
          • <strong>422 Unprocessable Entity</strong>: 구문은 맞지만 <strong>의미 검증 실패</strong> (이메일 형식 X·필수 필드 빈 값·비즈니스 규칙 위반)<br />
          <strong>프레임워크 자동 사용</strong>:<br />
          • <strong>FastAPI</strong>: Pydantic validation 실패 시 자동 422<br />
          • <strong>Spring Boot</strong>: @Valid 실패 시 기본 400 (수동 422 권장)<br />
          • <strong>Rails ActiveRecord</strong>: validation 실패 시 422<br />
          REST 베스트 프랙티스는 <strong>422 사용</strong>으로 의미 명확화. 응답 본문에 필드별 오류 배열 포함:
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 11.5, fontFamily: 'Syne, monospace', color: 'var(--text)', marginTop: 6 }}>
{`{ "detail": [
  { "loc": ["body", "email"], "msg": "invalid email", "type": "value_error.email" }
]}`}
          </pre>
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. JWT 만료가 401인가 403인가?</summary>
        <p style={faqAnswer}>
          <strong>401 Unauthorized</strong>가 정답입니다.<br />
          • JWT exp 시간 지남 = 인증 정보 만료 = <strong>인증 안 됨</strong> 상태 → 401<br />
          • 401 응답으로 클라이언트는 <strong>refresh_token으로 재발급</strong>할 수 있음을 알 수 있음<br />
          • 403은 &quot;토큰은 유효한데 권한 부족&quot; (다른 사용자 데이터 접근 등)<br />
          <strong>실제 동작</strong>:<br />
          1. JWT 만료 → 서버가 401 + WWW-Authenticate 헤더 응답<br />
          2. 클라이언트(axios interceptor 등)가 401 감지<br />
          3. refresh_token으로 새 access_token 발급<br />
          4. 원래 요청 재시도<br />
          <strong>일부 잘못된 구현</strong>: JWT 만료에 403 반환 — 클라이언트 재시도 로직이 작동 X. 401이 표준.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 본 도구의 데이터 출처는?</summary>
        <p style={faqAnswer}>
          본 도구의 데이터는 다음을 종합한 정보입니다:<br />
          • <strong>RFC 표준</strong>: 7231 (HTTP/1.1), 9110 (최신 의미론, 2022), 7235 (인증), 7232 (조건부), 6585·6566·8297·7538·7540 (확장)<br />
          • <strong>WebDAV</strong>: RFC 4918, 5842<br />
          • <strong>비표준 출처</strong>:<br />
          &nbsp;&nbsp;- Cloudflare 5xx (520·521·522·523·524·525·526·530): Cloudflare 공식 docs<br />
          &nbsp;&nbsp;- nginx (444·494·499): nginx 공식 wiki<br />
          • <strong>한국 사이트 사례</strong>: 카카오·네이버·토스·쿠팡·AWS Lambda 운영 경험<br />
          • <strong>해결 힌트</strong>: 일반적·검증된 디버깅 단계만 (위험한 워크어라운드 X)<br />
          정확한 명세는 외부 RFC·MDN·Cloudflare docs를 우선 참조하세요.
          본 도구는 모든 데이터가 <strong>정적</strong>이며 외부 API 호출 0개.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/curl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🌀</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>cURL 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            cURL → fetch·axios·Python·Go
          </p>
        </Link>
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
      </div>
    </div>
  )
}
