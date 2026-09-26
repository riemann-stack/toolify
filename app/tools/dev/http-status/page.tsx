import Link from 'next/link'
import HttpStatusClient from './HttpStatusClient'
import { ALL_CODES, CATEGORY_META, getStats, type CategoryKey } from './httpStatusUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/http-status',
  title: 'HTTP 상태 코드 검색기 — 200·301·401·403·404·500 등 한국어 설명 + 디버깅 가이드',
  description: 'HTTP 상태 코드 65+ 한국어 설명·발생 시기·해결 힌트 + Cloudflare(521·524)·nginx(499) 비표준과 CORS·JWT·Lambda 시나리오.',
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

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top', lineHeight: 1.6 }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowLine: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const code: React.CSSProperties = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }

/* 분류표 — 수록 개수는 이 도구의 데이터(ALL_CODES)에서 빌드 시 센다 */
const CAT_ORDER: CategoryKey[] = ['1xx', '2xx', '3xx', '4xx', '5xx', 'nonstandard']
const CAT_KR: Record<CategoryKey, string> = {
  '1xx': '정보 — 요청을 받았고 처리가 이어지는 중',
  '2xx': '성공 — 요청이 의도대로 처리됨',
  '3xx': '리다이렉트 — 다른 URI나 저장된 사본으로 안내',
  '4xx': '클라이언트 오류 — 요청 쪽을 고쳐야 함',
  '5xx': '서버 오류 — 서버·게이트웨이 쪽 문제',
  nonstandard: '표준 밖 — CDN·서버 소프트웨어가 자체 정의',
}
const CAT_REPS: Record<CategoryKey, number[]> = {
  '1xx': [100, 101, 103],
  '2xx': [200, 201, 204, 206],
  '3xx': [301, 302, 304, 307, 308],
  '4xx': [400, 401, 403, 404, 422, 429],
  '5xx': [500, 502, 503, 504],
  nonstandard: [521, 522, 524, 499],
}
const CAT_ROWS = CAT_ORDER.map((k) => ({
  k,
  range: CATEGORY_META[k].range,
  n: ALL_CODES.filter((c) => c.category === k).length,
  reps: CAT_REPS[k].filter((code) => ALL_CODES.some((c) => c.code === code)).join(' · '),
}))
const STATS = getStats()

/* RFC 9110 §15.1 — 명시적 캐시 지시가 없어도 '추정 만료(heuristic expiration)'로 재사용될 수 있는 코드 */
const HEURISTIC_CACHEABLE = [200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414, 501]
const EXTRA_NAMES: Record<number, { name: string; nameKr: string }> = {
  203: { name: 'Non-Authoritative Information', nameKr: '원본이 아닌 정보(프록시가 변형)' },
}
const CACHE_ROWS = HEURISTIC_CACHEABLE.map((code) => {
  const c = ALL_CODES.find((x) => x.code === code)
  return { code, name: c?.name ?? EXTRA_NAMES[code]?.name ?? '', nameKr: c?.nameKr ?? EXTRA_NAMES[code]?.nameKr ?? '' }
})

const FAQ_LD = [
  {
    q: '401과 403의 차이는?',
    a: '<strong>401 Unauthorized</strong>는 이름과 달리 "인증되지 않음"(unauthenticated)을 뜻합니다 — 자격 증명이 없거나 만료·위조된 경우이고, RFC 9110은 401 응답에 <code>WWW-Authenticate</code> 헤더를 반드시(MUST) 넣도록 정합니다. <strong>403 Forbidden</strong>은 서버가 요청자를 알아본 뒤에도 거절하는 경우입니다(권한·스코프 부족, IP 차단, 만료된 서명 URL 등).<br />예: Authorization 헤더 없이 호출 → 401, 일반 사용자 토큰으로 관리자 API 호출 → 403. "다시 로그인하면 풀리는 문제"면 401, "로그인해도 안 되는 문제"면 403으로 기억하면 됩니다.',
  },
  {
    q: '301과 302 중 무엇을 써야 하나요?',
    a: '주소가 영구히 바뀌었으면 <strong>301</strong>(또는 308), 잠시 다른 곳으로 보내는 것이면 <strong>302</strong>(또는 307)입니다. Google 검색 센터 문서 기준으로 영구 리다이렉트는 "대상 URL을 대표(canonical)로 삼으라"는 강한 신호, 임시 리다이렉트는 약한 신호라 원래 URL이 검색 결과에 계속 남을 수 있습니다.<br />주의할 점은 캐시입니다. RFC 9110상 301은 캐시 지시가 없어도 저장될 수 있는 코드라, 잘못 건 301은 서버 설정을 되돌려도 방문자 브라우저에 한동안 남습니다. 확신이 없으면 302로 동작을 확인한 뒤 301로 바꾸고, POST 요청을 POST 그대로 옮겨야 하면 308·307을 쓰세요(301·302는 브라우저가 GET으로 바꿔 재요청해도 되는 코드입니다).',
  },
  {
    q: '502와 504는 어떻게 구분하나요?',
    a: '둘 다 nginx·CDN·로드밸런서 같은 중간 서버(게이트웨이)가 만든 응답입니다. <strong>502 Bad Gateway</strong>는 뒤쪽 서버에서 잘못된 응답을 받았거나 연결 자체가 실패한 경우, <strong>504 Gateway Timeout</strong>은 정해진 시간 안에 응답이 오지 않은 경우입니다.<br />nginx라면 error.log 문구로 바로 갈립니다 — <code>connect() failed (111: Connection refused)</code>·<code>upstream prematurely closed connection</code>은 502, <code>upstream timed out (110: Connection timed out)</code>은 504. 504는 대개 느린 DB 쿼리나 외부 API 대기가 원인이므로 애플리케이션 로그의 요청 처리 시간을 함께 확인하세요.',
  },
  {
    q: 'CORS 오류는 몇 번 상태 코드인가요?',
    a: 'CORS 오류는 상태 코드가 아니라 <strong>브라우저가 응답을 스크립트에 넘겨주지 않는 현상</strong>입니다. 그래서 서버는 200을 보냈는데 콘솔에는 CORS 오류가 찍히는 일이 흔합니다. 대표 유형은 ① 응답에 <code>Access-Control-Allow-Origin</code>이 없음(상태가 200이어도 차단), ② preflight(<code>OPTIONS</code>) 요청을 서버·게이트웨이가 405·403·404로 거절, ③ 쿠키를 함께 보내면서(<code>credentials: "include"</code>) <code>Access-Control-Allow-Origin: *</code>를 사용 — 자격 증명이 포함된 요청에는 와일드카드가 허용되지 않습니다. DevTools 네트워크 탭에서 OPTIONS 요청이 따로 있는지, 그 응답에 Allow-Origin·Allow-Methods·Allow-Headers가 있는지부터 확인하세요. 이 도구의 디버깅 탭 "CORS preflight 실패" 시나리오에 단계별 점검 순서가 있습니다.',
  },
  {
    q: '429 Too Many Requests를 받으면 어떻게 재시도해야 하나요?',
    a: '429는 RFC 6585가 정의한 "요청 한도 초과"이며, 서버는 <code>Retry-After</code> 헤더로 기다릴 시간을 알려줄 수 있습니다. 이 값은 초 단위 숫자(<code>Retry-After: 120</code>)일 수도, HTTP 날짜일 수도 있으므로(RFC 9110) 두 형식을 모두 처리해야 합니다. 헤더가 없으면 1→2→4→8초처럼 간격을 늘리면서 무작위 지연(jitter)을 섞는 지수 백오프가 일반적입니다 — 여러 클라이언트가 같은 순간에 재시도해 다시 한도를 넘는 것을 막기 위해서입니다. 한도 자체는 서비스마다 다르므로(예: GitHub REST API는 인증 시 시간당 5,000회, 비인증 60회) 해당 API 문서를 확인하세요.',
  },
  {
    q: 'Cloudflare 521·522·524는 어떻게 다른가요?',
    a: '모두 Cloudflare가 원본(origin) 서버와 통신하다 실패했을 때 Cloudflare가 직접 만드는 비표준 코드이고, 실패한 단계가 다릅니다.<br />• <strong>521 Web Server Is Down</strong>: 원본이 TCP 연결을 거부 — 서버 다운, 방화벽이 Cloudflare IP 대역을 차단<br />• <strong>522 Connection Timed Out</strong>: TCP 연결 수립 단계에서 시간 초과 — 과부하, 네트워크·보안 그룹 설정<br />• <strong>524 A Timeout Occurred</strong>: 연결은 됐지만 기본 100초 안에 HTTP 응답이 오지 않음 — 원본 처리 지연(Enterprise 플랜은 최대 6,000초까지 조정 가능)<br />521·522는 원본 서버 상태와 Cloudflare IP 허용 목록(cloudflare.com/ips)을, 524는 오래 걸리는 작업을 비동기(202 Accepted + 상태 조회)로 바꾸는 것을 먼저 검토하세요.',
  },
  {
    q: '200·201·204는 각각 언제 쓰나요?',
    a: '• <strong>200 OK</strong>: 결과 본문을 돌려줄 때(GET 조회, 수정 후 최신 상태 반환)<br />• <strong>201 Created</strong>: 요청으로 새 리소스가 생겼을 때. RFC 9110은 POST로 생성했다면 새 리소스를 가리키는 <code>Location</code> 헤더를 담아 201로 응답하도록 권고(SHOULD)합니다<br />• <strong>204 No Content</strong>: 성공했지만 돌려줄 본문이 없을 때(삭제 완료, 저장만 하는 PUT, CORS preflight)<br />RFC 9110의 DELETE 정의도 "처리 완료 + 추가 정보 없음"이면 204, 결과 설명을 담으면 200, 아직 처리 전이면 202를 권합니다. 흔한 버그: 204 응답에 <code>response.json()</code>을 호출하면 본문이 없어 파싱 오류가 납니다.',
  },
  {
    q: '422와 400은 어떻게 나누나요?',
    a: '<strong>400 Bad Request</strong>는 요청 자체를 해석할 수 없을 때(JSON 문법 오류, 필수 헤더 형식 오류)입니다. <strong>422 Unprocessable Content</strong>(옛 명칭 Unprocessable Entity)는 RFC 9110 정의대로 "형식과 문법은 맞지만 담긴 내용을 처리할 수 없을 때" — 이메일 형식이 틀린 필드, 비즈니스 규칙 위반 같은 검증 실패입니다.<br />프레임워크 기본값은 제각각입니다: FastAPI는 Pydantic 검증 실패 시 자동으로 422, Spring Boot는 <code>@Valid</code> 실패 시 400, Rails 스캐폴드 컨트롤러는 저장 실패 시 422를 씁니다. 어느 쪽이든 응답 본문에 필드별 오류 목록을 담아 두면 클라이언트가 폼 옆에 오류를 표시하기 쉽습니다.',
  },
  {
    q: 'JWT가 만료되면 401인가요, 403인가요?',
    a: '<strong>401</strong>입니다. 만료된 토큰은 "인증 정보가 유효하지 않은" 상태이고, 401이어야 클라이언트가 refresh token으로 새 access token을 받아 원래 요청을 재시도하는 흐름(axios interceptor 등)이 동작합니다. Bearer 토큰 방식(RFC 6750)에서는 <code>WWW-Authenticate: Bearer error="invalid_token"</code>으로 이유를 함께 알릴 수 있습니다. 만료에 403을 돌려주는 구현은 클라이언트가 "권한 없음"으로 받아들여 재발급을 시도하지 않는 문제가 생깁니다. 403은 토큰은 유효하지만 그 리소스에 접근할 권한이 없을 때 씁니다.',
  },
  {
    q: '점검 중일 때는 어떤 상태 코드를 보내야 하나요?',
    a: '<strong>503 Service Unavailable</strong>입니다. RFC 9110은 503을 "일시적 과부하나 예정된 점검으로 지금은 처리할 수 없음"으로 정의하고, 언제 다시 시도하면 되는지 <code>Retry-After</code>로 알릴 수 있게 합니다. 점검 안내 페이지를 200으로 내보내면 검색엔진·모니터링 도구는 정상 페이지로 받아들여, 안내문이 그대로 색인되거나 장애 경보가 울리지 않습니다. 반대로 404·410은 "없는 페이지"라는 뜻이라 일시적인 상황에는 맞지 않습니다.',
  },
]

export default function HttpStatusPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/http-status">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />HTTP 상태 코드 검색기
      </h1>
      <p className="tp-lead">
        HTTP 65+ 상태 코드 한국어 설명·발생 시기·해결 힌트. <strong style={{ color: 'var(--text)' }}>CORS·JWT·Lambda 시나리오</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="RFC 9110(HTTP Semantics)·RFC 9111(캐시)·RFC 6585 등 IETF 표준과 IANA 상태 코드 레지스트리 · 비표준 코드는 Cloudflare·nginx 공식 문서"
        sources={[
          { label: 'RFC 9110 HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110' },
          { label: 'IANA HTTP 상태 코드 레지스트리', href: 'https://www.iana.org/assignments/http-status-codes/' },
          { label: 'RFC 9111 HTTP Caching', href: 'https://www.rfc-editor.org/rfc/rfc9111' },
          { label: 'RFC 6585 추가 상태 코드', href: 'https://www.rfc-editor.org/rfc/rfc6585' },
          { label: 'Cloudflare HTTP 상태 코드 문서', href: 'https://developers.cloudflare.com/support/troubleshooting/http-status-codes/' },
          { label: 'Google 검색 센터 — 리다이렉트', href: 'https://developers.google.com/search/docs/crawling-indexing/301-redirects' },
        ]}
      />

      <Callout tone="warn" title="설명의 범위">
        상태 코드 설명·해결 힌트는 <strong>RFC 9110 등 표준 명세와 일반적인 운영 사례를 정리한 것</strong>이며 모든 상황을 다루지는 않습니다.
        실제 장애는 <strong>서버 로그·DevTools 네트워크 탭·CDN 대시보드</strong>로 추가 진단이 필요하고, Cloudflare(521·524)·nginx(499) 같은 비표준 코드는 해당 벤더 문서가 우선입니다.
        분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent-ink)' }}>면책조항</Link> 참고.
      </Callout>

      <HttpStatusClient />

      <GuideDivider />

      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>검색</strong> — 코드 번호(404)나 키워드(인증·timeout)를 입력하면 자동완성 목록과 상세 카드(의미·발생 시기·해결 힌트·RFC 조항)가 열립니다.</li>
        <li><strong>카테고리별</strong> — 1xx~5xx와 비표준 코드를 한 화면에 펼쳐 보고, 카드를 누르면 검색 탭의 상세로 이동합니다.</li>
        <li><strong>디버깅</strong> — JWT 401·CORS preflight·Lambda 504·Cloudflare 521 등 운영에서 자주 만나는 12개 시나리오를 원인과 점검 순서로 정리했습니다.</li>
        <li><strong>가이드</strong> — 분류별 의미, 자주 헷갈리는 코드 쌍, 프레임워크별 기본 응답을 요약합니다.</li>
      </ol>
      <p className="g-p">
        자주 찾는 코드는 별표로 즐겨찾기에 넣어 두면 이 브라우저에 저장되어 다음 방문 때 바로 열 수 있습니다. 상단의 빠른 칩 12개는 200·301·302·400·401·403·404·429·500·502·503·504입니다.
      </p>

      <h2 className="g-h2">상태 코드 5분류와 이 도구의 수록 범위</h2>
      <p className="g-p">
        상태 코드는 세 자리 숫자이고 <strong>첫 자리가 분류</strong>를 정합니다. RFC 9110은 클라이언트가 모든 코드를 알 필요는 없지만 첫 자리의 의미는 반드시 이해하고,
        모르는 코드를 받으면 <strong>같은 분류의 x00으로 취급</strong>하라고 규정합니다 — 처음 보는 <code style={code}>429</code>를 받은 오래된 클라이언트도 최소한 <code style={code}>400</code>류 클라이언트 오류로는 처리한다는 뜻입니다.
        코드 옆의 영문 문구(reason phrase)는 권고일 뿐이라 서버가 바꾸거나 생략해도 되고, HTTP/2·HTTP/3에는 이 문구를 담는 자리 자체가 없으므로 프로그램은 숫자만 보고 판단해야 합니다.
        이 도구에는 표준 {STATS.standard}개와 비표준 {STATS.nonstandard}개가 수록되어 있고, 분류별 개수는 아래 표와 같습니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['분류', '범위', '의미', '수록', '대표 코드'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {CAT_ROWS.map((r) => (
              <tr key={r.k} style={rowLine}>
                <td style={tdMono}>{r.k === 'nonstandard' ? '비표준' : r.k}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{r.range}</td>
                <td style={td}>{CAT_KR[r.k]}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.n}개</td>
                <td style={{ ...tdMuted, fontFamily: 'var(--font-mono)' }}>{r.reps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        코드를 읽을 때는 <strong>누가 그 코드를 만들었는지</strong>부터 구분하세요. 같은 502라도 애플리케이션이 직접 보낸 것인지, 앞단의 nginx·로드밸런서·CDN이 백엔드와 통신하다 실패해서 대신 만든 것인지에 따라 봐야 할 로그가 완전히 달라집니다.
        응답의 <code style={code}>Server</code> 헤더와 오류 페이지 모양(Cloudflare 안내 화면, nginx 기본 페이지)이 가장 빠른 단서입니다.
      </p>

      <h2 className="g-h2">자주 헷갈리는 코드 쌍</h2>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['쌍', '앞 코드', '뒤 코드', '가르는 질문'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['401 / 403', '자격 증명 없음·만료', '알아봤지만 권한 없음', '다시 로그인하면 풀리는가?'],
              ['400 / 422', '요청을 해석할 수 없음(문법 오류)', '해석은 되지만 내용 검증 실패', 'JSON 파서가 통과했는가?'],
              ['404 / 410', '없음(영구인지 모름)', '영구 삭제 — 다시 생기지 않음', '삭제를 확정했는가?'],
              ['301 / 308', '영구 이동(POST가 GET으로 바뀔 수 있음)', '영구 이동(메서드 유지)', 'POST 요청도 옮겨야 하는가?'],
              ['502 / 504', '뒤 서버가 잘못 응답·연결 실패', '뒤 서버 응답 시간 초과', '백엔드가 떠 있는데 느린가?'],
              ['500 / 503', '예상 못 한 서버 오류', '일시적 과부하·점검', '잠시 뒤 재시도로 풀리는가?'],
            ].map((r) => (
              <tr key={r[0]} style={rowLine}>
                <td style={tdMono}>{r[0]}</td>
                <td style={td}>{r[1]}</td>
                <td style={td}>{r[2]}</td>
                <td style={tdMuted}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        404와 410의 차이는 RFC 9110 문구에 그대로 드러납니다 — 410은 &ldquo;대상이 더 이상 없고 그 상태가 영구적일 가능성이 높을 때&rdquo; 쓰며, 영구적인지 알 수 없으면 404를 쓰라고 합니다.
        그래서 게시물을 의도적으로 지운 경우에는 410이, 단순히 경로가 틀린 경우에는 404가 정확합니다.
      </p>

      <h2 className="g-h2">리다이렉트 5종 — 메서드·캐시·검색엔진 신호</h2>
      <p className="g-p">
        3xx 리다이렉트는 &ldquo;영구냐 임시냐&rdquo;만 고르면 끝나는 문제가 아닙니다. HTTP/1.0 시절 301·302를 브라우저마다 다르게 구현한 탓에, 지금 표준(RFC 9110)은 <strong>301·302에서 POST를 GET으로 바꿔 재요청하는 것을 허용</strong>하고,
        메서드를 반드시 유지해야 하는 경우를 위해 307·308을 따로 두었습니다. 캐시 여부와 Google의 해석까지 함께 보면 다음과 같습니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['코드', '성격', 'POST 요청의 재요청', '캐시 지시 없을 때', 'Google 색인 신호'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['301', '영구 이동', 'GET으로 바뀔 수 있음', '저장될 수 있음', '강함 — 새 URL이 대표'],
              ['302', '임시 이동', 'GET으로 바뀔 수 있음', '저장 안 함', '약함 — 원래 URL 유지 경향'],
              ['303', '결과는 다른 곳에', 'GET(또는 HEAD)으로 조회', '저장 안 함', '임시로 취급'],
              ['307', '임시 이동', '메서드 유지(변경 금지)', '저장 안 함', '약함'],
              ['308', '영구 이동', '메서드 유지', '저장될 수 있음', '강함'],
            ].map((r) => (
              <tr key={r[0]} style={rowLine}>
                <td style={tdMono}>{r[0]}</td>
                <td style={td}>{r[1]}</td>
                <td style={td}>{r[2]}</td>
                <td style={td}>{r[3]}</td>
                <td style={tdMuted}>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        실무 규칙으로 옮기면 — 도메인·경로 개편처럼 되돌릴 일이 없는 이동은 301(API라면 308), 로그인 후 원래 페이지로 보내기·점검 우회·A/B 분기처럼 일시적인 이동은 302(POST를 유지해야 하면 307),
        폼 제출 뒤 결과 페이지로 보내 새로고침 시 중복 제출을 막는 패턴(Post/Redirect/Get)은 303입니다. 리다이렉트가 A → B → C로 이어지는 체인은 요청 왕복만 늘리므로 최종 주소로 바로 보내도록 정리하세요.
      </p>

      <h2 className="g-h2">캐시 지시가 없어도 저장될 수 있는 코드</h2>
      <p className="g-p">
        응답에 <code style={code}>Cache-Control</code>이나 <code style={code}>Expires</code>가 없어도 브라우저·프록시·CDN이 스스로 유효 기간을 추정해 재사용할 수 있는 코드가 정해져 있습니다(RFC 9110 §15.1의 heuristically cacheable).
        RFC 9111은 이 추정 기간의 전형적인 값으로 <strong>Last-Modified 이후 경과 시간의 10%</strong>를 예로 듭니다. 예를 들어 30일 전에 수정된 파일이라면 약 3일 동안은 서버에 다시 묻지 않고 저장된 사본을 쓸 수 있다는 계산입니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['코드', '이름', '뜻'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {CACHE_ROWS.map((r) => (
              <tr key={r.code} style={rowLine}>
                <td style={tdMono}>{r.code}</td>
                <td style={td}>{r.name}</td>
                <td style={tdMuted}>{r.nameKr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        목록에 <strong>301·308·404·410</strong>이 들어 있다는 점이 핵심입니다. 실수로 건 영구 리다이렉트, 배포 직전 잠깐 났던 404가 CDN이나 방문자 브라우저에 남아 &ldquo;고쳤는데 계속 보인다&rdquo;는 문의로 이어지는 이유입니다.
        오류 응답과 리다이렉트에도 <code style={code}>Cache-Control</code>을 명시하고(짧게 두거나 <code style={code}>no-store</code>), 반대로 302·307은 기본적으로 저장되지 않으므로 캐시하려면 명시적으로 지시해야 합니다.
      </p>

      <h2 className="g-h2">5xx·게이트웨이 오류를 좁혀 가는 순서</h2>
      <ol className="g-list">
        <li><strong>응답을 만든 계층 확인</strong> — 오류 페이지와 <code style={code}>Server</code>·<code style={code}>cf-ray</code> 같은 헤더로 CDN, 로드밸런서, 웹 서버, 애플리케이션 중 어디서 끝났는지 봅니다.</li>
        <li><strong>그 계층의 로그에서 같은 시각의 요청 찾기</strong> — nginx라면 access.log의 상태·<code style={code}>$upstream_status</code>·응답 시간, error.log의 upstream 메시지를 함께 봅니다.</li>
        <li><strong>시간 제한 비교</strong> — 앞단의 제한이 뒷단 처리 시간보다 짧으면 앞단은 504·524를 보내고, 뒷단 nginx에는 &ldquo;클라이언트가 먼저 끊음&rdquo;을 뜻하는 499가 남습니다.</li>
        <li><strong>재현 조건 기록</strong> — 특정 요청 크기·특정 시간대·배포 직후처럼 조건이 보이면 원인이 빨리 좁혀집니다.</li>
      </ol>
      <p className="g-p">
        각 계층의 기본 시간 제한은 다음과 같습니다. 값이 계층마다 다르기 때문에 가장 짧은 제한이 먼저 발동하고, 사용자는 그 계층이 만든 코드를 보게 됩니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['계층·설정', '기본 제한', '넘었을 때 코드'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['nginx proxy_read_timeout (upstream 응답 대기)', '60초', '504 — error.log에 upstream timed out'],
              ['Cloudflare 원본 응답 대기', '100초 (Enterprise는 최대 6,000초로 조정)', '524'],
              ['AWS API Gateway REST API 통합 제한', '29초', '504'],
            ].map((r) => (
              <tr key={r[0]} style={rowLine}>
                <td style={td}>{r[0]}</td>
                <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 700 }}>{r[1]}</td>
                <td style={tdMuted}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="tip" title="시간 제한을 늘리기 전에">
        제한을 계속 늘리는 것은 대개 증상 완화에 그칩니다. 수십 초 걸리는 작업(대용량 내보내기, 외부 API 여러 번 호출)은 요청을 받자마자 <strong>202 Accepted</strong>와 작업 ID를 돌려주고,
        클라이언트가 상태 조회 API로 완료를 확인하게 바꾸면 어느 계층의 제한에도 걸리지 않습니다.
      </Callout>

      <h2 className="g-h2">프레임워크별 기본 응답 코드</h2>
      <p className="g-p">
        백엔드 프레임워크가 <strong>따로 지정하지 않았을 때 자동으로 돌려주는 코드</strong>를 알면, 로그에 찍힌 코드가 의도한 것인지 기본값인지 바로 구분할 수 있습니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['프레임워크', '상황', '기본 응답'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['Spring Boot', '@PostMapping 메서드가 값 반환', '200 (201은 ResponseEntity·@ResponseStatus로 지정)'],
              ['Spring Boot', '@DeleteMapping 메서드가 void', '200 (204는 직접 지정)'],
              ['Spring Boot', '@Valid 검증 실패', '400'],
              ['Spring Boot', '처리되지 않은 예외', '500'],
              ['Express', 'res.json() / res.send()', '200'],
              ['Express', 'next(err) 후 기본 오류 처리기', 'err.status가 없으면 500'],
              ['FastAPI', 'Pydantic 요청 검증 실패', '422'],
              ['FastAPI', 'raise HTTPException(status_code=404)', '지정한 코드'],
              ['Django REST framework', 'serializer.is_valid(raise_exception=True) 실패', '400'],
              ['Django REST framework', '권한(permission_classes) 거부', '403 (미인증이고 인증 방식이 challenge를 주면 401)'],
            ].map((r, i) => (
              <tr key={i} style={rowLine}>
                <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r[1]}</td>
                <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="g-h2">표준 코드와 비표준 코드의 출처</h2>
      <ul className="g-list">
        <li><strong>IETF 표준</strong> — 대부분의 코드는 RFC 9110(2022, 이전 RFC 7231·7232·7233·7235·7538을 대체)이 정의하고, 428·429·431·511은 RFC 6585, 103 Early Hints는 RFC 8297, 425는 RFC 8470, 451은 RFC 7725, WebDAV의 207·507은 RFC 4918이 정의합니다. 공식 등록 목록은 IANA 상태 코드 레지스트리입니다.</li>
        <li><strong>Cloudflare 520~530</strong> — Cloudflare가 원본 서버와의 통신 실패를 구분하려고 자체 정의한 코드입니다. 다른 CDN에서는 의미가 없습니다.</li>
        <li><strong>nginx 444·494·499</strong> — 444·499는 nginx가 access.log에 남기는 자체 코드로, 클라이언트가 받는 응답 자체가 없습니다(444는 응답 없이 연결 종료, 499는 클라이언트가 먼저 연결을 끊음). 494(요청 헤더가 너무 큼)는 nginx 내부 코드라 클라이언트 응답과 access.log에는 400으로 기록되고, <code style={code}>error_page 494</code>로만 따로 잡을 수 있습니다 — 표준에서 같은 뜻의 코드는 431입니다.</li>
        <li><strong>Microsoft IIS</strong> — 440(Login Time-out)·449(Retry With) 같은 자체 코드가 있지만 이 도구에는 수록하지 않았습니다.</li>
      </ul>
      <p className="g-p">
        비표준 코드는 제품 버전에 따라 의미가 바뀌거나 사라질 수 있으므로, 이 도구의 설명은 출발점으로 쓰고 최종 판단은 해당 벤더 문서로 확인하세요.
      </p>

      <Faq items={FAQ_LD} />

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/curl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>cURL 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            cURL → fetch·axios·Python·Go
          </p>
        </Link>
        <Link href="/tools/dev/url-encode" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>URL 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인코드·쿼리 편집·추적 정리
          </p>
        </Link>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
