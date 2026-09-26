import Link from 'next/link'
import CurlClient from './CurlClient'
import { parseCurl, type ParsedCurl } from './curlUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/curl',
  title: 'cURL 변환기 — fetch·axios·Python·Node·Go 변환 + 카카오·네이버 API 예시',
  description: 'cURL 명령어 → fetch·axios·Python requests·Node.js·Go 5 언어 즉시 변환 + 카카오·네이버·토스·GitHub·OpenAI API 12개 예시.',
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

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const code: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  color: 'var(--text)',
  wordBreak: 'break-all',
}

/* ── 해석 규칙 표 — 손으로 적지 않고 도구와 같은 parseCurl로 빌드 시 계산한다 ── */
const BODY_LABEL: Record<string, string> = {
  json: 'JSON', urlencode: '폼 (urlencoded)', form: '폼', multipart: 'multipart', raw: '원문 그대로',
}
const PARSE_SAMPLES: { cmd: string; note: (p: ParsedCurl) => string }[] = [
  { cmd: `curl https://api.example.com/users`, note: () => '옵션이 없으면 curl도 GET' },
  { cmd: `curl -d 'name=kim&age=30' https://api.example.com/users`, note: () => 'curl과 같음 — -d가 있으면 POST + 폼 Content-Type' },
  { cmd: `curl -d '{"name":"kim"}' https://api.example.com/users`, note: () => 'curl 자체는 폼 Content-Type으로 보냄 — 도구는 본문 모양을 보고 JSON으로 추정' },
  { cmd: `curl --json '{"name":"kim"}' https://api.example.com/users`, note: () => 'curl 7.82+ 단축 옵션 — Accept: application/json도 함께' },
  { cmd: `curl -G -d 'q=coffee' -d 'page=2' https://api.example.com/search`, note: (p) => `본문이 쿼리 문자열로 이동 → ${p.url}` },
  { cmd: `curl -F 'file=@photo.jpg' -F 'title=trip' https://api.example.com/upload`, note: () => '파일은 자리표시 코드 — 실제 경로·파일 입력은 직접 연결' },
  { cmd: `curl -I https://api.example.com/health`, note: () => '본문 대신 fetch·Node 코드는 상태·헤더, Python 코드는 헤더를 출력 — axios·Go 코드는 빈 본문을 출력하므로 상태·헤더(response.status·headers, resp.Status·Header)로 바꿔 쓰기' },
  { cmd: `curl -d @body.json https://api.example.com/users`, note: () => '메서드는 POST로 맞추지만 파일 내용은 직접 읽어 넣어야 함 (경고 표시)' },
]
const PARSE_ROWS = PARSE_SAMPLES.map(({ cmd, note }) => {
  const p = parseCurl(cmd)
  if ('error' in p) throw new Error(`curl 가이드 예시 파싱 실패: ${cmd}`)
  const ct = p.bodyType === 'multipart'
    ? 'boundary 포함 자동 생성'
    : p.headers.find((h) => h.key.toLowerCase() === 'content-type')?.value ?? '—'
  return { cmd, method: p.method, body: p.bodyType ? BODY_LABEL[p.bodyType] : '없음', ct, note: note(p) }
})

const OPTION_ROWS: [string, string, string, string][] = [
  ['-X', '--request', 'HTTP 메서드 지정', '반영'],
  ['-H', '--header', '요청 헤더 추가', '반영'],
  ['-d', '--data', '본문 전송 (메서드 미지정 시 POST)', '반영 · @파일은 경고'],
  ['', '--data-raw', '본문 전송 (@를 파일로 해석하지 않음)', '반영'],
  ['', '--data-binary', '본문을 가공 없이 전송', '반영 · @파일은 경고'],
  ['', '--data-urlencode', '값을 URL 인코딩해 전송', '반영'],
  ['', '--json', 'JSON 본문 + Content-Type·Accept 헤더', '반영'],
  ['-F', '--form', 'multipart/form-data 필드·파일', '반영 · 파일은 자리표시'],
  ['-u', '--user', 'Basic 인증 (user:pass)', '반영'],
  ['-b', '--cookie', 'Cookie 헤더 (name=value; …)', '반영'],
  ['-A', '--user-agent', 'User-Agent 헤더', '반영'],
  ['-e', '--referer', 'Referer 헤더', '반영'],
  ['-G', '--get', '-d 본문을 쿼리 문자열로 옮겨 GET', '반영'],
  ['-I', '--head', 'HEAD 요청 (응답 헤더만)', '반영'],
  ['-k', '--insecure', 'TLS 인증서 검증 끄기', '표시만 — 코드엔 넣지 않음'],
  ['-L', '--location', '리다이렉트 따라가기', '표시만'],
  ['', '--compressed', '압축 응답 요청·해제', '표시만'],
  ['-s -S -v -i', '', '진행·로그 출력 제어', '무시'],
  ['-m', '--max-time', '전체 요청 제한 시간', '건너뜀 (경고) — 타임아웃은 직접 추가'],
]

const LANG_ROWS: [string, string, string, string][] = [
  ['fetch', '브라우저 · Node 18+ 내장', '의존성 없음, 웹 표준', '4xx·5xx에도 reject하지 않음 → response.ok 확인. JSON은 .json() 호출'],
  ['axios', '브라우저 · Node (npm 설치)', '인터셉터, 자동 JSON 변환, AbortController 취소', '2xx가 아니면 기본적으로 예외. 번들 크기 증가'],
  ['Python requests', '스크립트 · 자동화 · 백엔드', 'json= · data= · files=로 본문 구분', '동기 전용. 4xx·5xx도 예외 없음 → raise_for_status(). 기본 타임아웃 없음'],
  ['Node http/https', '의존성 없는 Node 스크립트', '저수준 제어, 추가 설치 없음', '리다이렉트·압축 해제·JSON 파싱을 직접 처리. 본문은 스트림으로 모아야 함'],
  ['Go net/http', '백엔드 · CLI', '표준 라이브러리, 동시 요청에 강함', 'http.DefaultClient는 타임아웃 없음. resp.Body.Close() 필수'],
]

const BEHAVIOR_ROWS: [string, string, string, string, string, string][] = [
  ['리다이렉트', '-L 없으면 따라가지 않음', '기본으로 따라감 (redirect: follow)', '기본으로 따라감 (head()는 예외)', '따라가지 않음', '최대 10회 따라감'],
  ['압축 응답', '--compressed 없으면 요청·해제 안 함', '브라우저가 처리 (Accept-Encoding 설정 불가)', 'gzip·deflate 자동 해제 (br·zstd는 brotli·zstandard 패키지가 있을 때만)', '해제하지 않음 (zlib로 직접)', 'Accept-Encoding을 직접 넣지 않았을 때만 자동 해제 (Transport가 gzip 요청)'],
  ['TLS 검증 끄기', '-k', '끌 수 없음', 'verify=False', 'rejectUnauthorized: false', 'InsecureSkipVerify: true'],
  ['Cookie · Referer 헤더', '-b · -e로 전송', '금지 헤더라 무시됨 → credentials·referrer 옵션', '그대로 전송', '그대로 전송', '그대로 전송'],
]

const FAQ_LD = [
  {
    q: 'fetch와 axios 중 어떤 코드를 쓰는 게 좋나요?',
    a: '의존성을 늘리고 싶지 않다면 <strong>fetch</strong>가 기본입니다. 브라우저와 Node.js 18 이상에 내장된 표준 API라 설치가 필요 없습니다. 대신 4xx·5xx 응답에도 Promise가 reject되지 않으므로 <code>response.ok</code>를 직접 확인해야 하고, JSON은 <code>.json()</code>으로 꺼내야 합니다.<br /><strong>axios</strong>는 요청·응답 인터셉터, 자동 JSON 변환, 2xx 외 상태 코드의 예외 처리, <code>AbortController</code> 기반 취소를 기본으로 제공합니다. 인증 토큰 자동 첨부·재시도처럼 공통 처리가 많은 프로젝트라면 axios가 편하고, 단순 호출이라면 fetch로 충분합니다.',
  },
  {
    q: 'Python에서 requests와 httpx는 무엇이 다른가요?',
    a: '<strong>requests</strong>는 가장 널리 쓰이는 동기(sync) HTTP 클라이언트입니다. <strong>httpx</strong>는 requests와 거의 같은 사용법에 동기·비동기(<code>httpx.AsyncClient</code>)를 모두 지원해 FastAPI 같은 비동기 프로젝트에 어울립니다. HTTP/2도 쓸 수 있지만 기본값은 HTTP/1.1이며, <code>pip install "httpx[http2]"</code>로 h2 패키지를 설치하고 <code>http2=True</code>로 켜야 합니다.<br />이 도구는 requests 코드를 생성합니다. httpx로 옮길 때는 <code>import requests</code>를 <code>import httpx</code>로, <code>requests.post(...)</code>를 <code>httpx.post(...)</code>로 바꾸면 대부분 그대로 동작합니다. 단 httpx는 기본적으로 리다이렉트를 따라가지 않으므로 필요하면 <code>follow_redirects=True</code>를 추가하세요.',
  },
  {
    q: 'Node.js에서 fetch는 언제부터 쓸 수 있나요?',
    a: 'Node.js 18(2022년 4월)부터 <code>fetch</code>가 전역으로 들어 있어 node-fetch 패키지가 필요 없습니다. Node 18~20에서는 실험적(experimental) 기능이지만 플래그 없이 기본 활성화돼 있고, Node 21부터 안정(stable)으로 표시됩니다. Node 16 이하라면 <code>npm i node-fetch</code> 후 <code>import fetch from \'node-fetch\'</code>를 추가하거나, 이 도구의 axios 또는 Node http 코드를 쓰세요.',
  },
  {
    q: '여러 줄로 된 cURL(줄 끝 \\)도 붙여넣을 수 있나요?',
    a: '네. 브라우저 개발자 도구의 "Copy as cURL"이 만드는 여러 줄 형식을 그대로 붙여넣으면 됩니다. 백슬래시+줄바꿈(셸 표준), 백슬래시+CRLF(Windows에서 복사한 경우), 한 줄 형식을 모두 읽고, 본문에 작은따옴표·줄바꿈이 있을 때 Chrome이 쓰는 <code>$\'…\'</code> 인용도 풀어서 해석합니다. <code>-sSL</code>처럼 붙여 쓴 짧은 옵션과 <code>-XPUT</code>처럼 값을 붙인 옵션도 나눠 읽습니다. 다만 셸을 완전히 흉내 내지는 않으므로 <code>$VAR</code> 변수 치환이나 <code>$(…)</code> 명령 치환은 처리하지 않습니다.',
  },
  {
    q: '-F로 파일을 올리는 multipart 명령은 어떻게 변환되나요?',
    a: 'multipart 구조는 5개 언어 모두 변환되고, 파일 자체는 자리표시 코드로 들어갑니다. fetch·axios는 <code>FormData</code>에 브라우저 파일 입력(<code>fileInput.files[0]</code>)을 넣는 형태, Python은 <code>files=</code>에 <code>open(\'photo.jpg\', \'rb\')</code>, Node.js는 form-data 패키지와 <code>fs.createReadStream</code>, Go는 <code>mime/multipart</code>와 <code>os.Open</code>을 쓰는 코드가 만들어집니다.<br />multipart는 본문 구분자(boundary)가 Content-Type 헤더에 들어가야 하므로 라이브러리가 헤더를 직접 만들어야 합니다. 원본에 <code>-H \'Content-Type: multipart/form-data\'</code>가 있으면 boundary가 빠져 서버가 본문을 못 읽기 때문에, 이 도구는 multipart일 때 입력한 Content-Type을 5개 언어 코드 모두에서 뺍니다.',
  },
  {
    q: '-d @body.json처럼 파일에서 본문을 읽는 명령은 왜 경고가 뜨나요?',
    a: '브라우저 안에서 도는 변환기는 사용자 컴퓨터의 파일을 읽을 수 없어서 본문을 코드에 옮길 수 없습니다. 이 도구는 메서드를 curl과 같이 POST로 맞추고 경고를 띄우므로, 생성된 코드에 본문을 직접 연결하세요. 예를 들어 Python은 <code>data=open(\'body.json\', \'rb\')</code>, Node.js는 <code>fs.readFileSync(\'body.json\')</code>, Go는 <code>os.Open("body.json")</code>으로 연 파일을 요청 본문에 넘기면 됩니다. multipart 파일 업로드(<code>-F file=@…</code>)는 이와 달리 자리표시 코드까지 생성됩니다.',
  },
  {
    q: 'Authorization 토큰은 생성된 코드에서 어떻게 다뤄야 하나요?',
    a: '토큰을 코드에 그대로 두지 말고 환경 변수로 옮기는 것이 원칙입니다. Node.js는 <code>process.env.API_TOKEN</code>과 .env 파일(.gitignore에 등록), Python은 <code>os.environ[\'API_TOKEN\']</code>과 python-dotenv, Go는 <code>os.Getenv("API_TOKEN")</code>을 씁니다. 브라우저용 fetch·axios 코드에 비밀 키를 넣으면 누구나 개발자 도구로 볼 수 있으므로 반드시 백엔드를 거쳐 호출하세요. CI에서는 GitHub Actions Secrets 같은 저장소 비밀값, 운영 환경에서는 시크릿 매니저를 쓰는 편이 안전합니다. 화면 공유·캡처가 걱정되면 마스킹 옵션을 켜 코드 속 민감 헤더를 <code>***</code>로 가리세요.',
  },
  {
    q: 'GraphQL 요청도 변환되나요?',
    a: '네. GraphQL은 보통 <code>query</code>·<code>variables</code> 필드를 가진 JSON을 POST로 보내는 일반 HTTP 요청이라 그대로 변환됩니다. 예시 탭의 GraphQL 카드를 적용해 보세요. 캐시·타입 생성이 필요한 앱이라면 Apollo Client, urql, graphql-request 같은 전용 클라이언트를 검토하는 것이 좋습니다.',
  },
  {
    q: 'AWS S3 cURL을 변환하면 바로 쓸 수 있나요?',
    a: '구조는 변환되지만 그대로 재사용하기는 어렵습니다. AWS Signature V4 서명(<code>Authorization</code>, <code>x-amz-date</code>, <code>x-amz-content-sha256</code>)은 요청 시각과 본문 해시를 넣어 계산하므로, 복사한 서명은 시간이 지나거나 본문이 바뀌면 거부됩니다. 이 도구는 헤더를 있는 그대로 옮기므로 학습·디버깅용으로 쓰고, 실제 코드는 서명을 자동으로 계산하는 SDK(JavaScript <code>@aws-sdk/client-s3</code>, Python <code>boto3</code>, Go <code>aws-sdk-go-v2</code>)를 쓰세요.',
  },
  {
    q: '입력한 cURL이나 토큰이 서버로 전송되나요?',
    a: '아니요. 파싱과 코드 생성 모두 브라우저 안의 자바스크립트로 처리되며, 변환할 때 네트워크 요청이 발생하지 않습니다(개발자 도구 Network 탭에서 확인할 수 있습니다). 재방문 편의를 위해 입력과 옵션을 이 브라우저의 localStorage에 저장하지만, Authorization·Cookie·API 키 헤더나 <code>-u</code> 인증이 든 입력은 저장하지 않고 옵션만 저장합니다. 공용 PC에서 썼다면 개발자 도구 → Application → Local Storage에서 <code>youtil_curl_v1</code> 키를 지우세요.',
  },
]

export default function CurlPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/curl">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />cURL 변환기
      </h1>
      <p className="tp-lead">
        cURL 명령어를 <strong style={{ color: 'var(--text)' }}>fetch·axios·Python·Node·Go</strong> 5 언어로 즉시 변환. 한국 API 12개 예시.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="curl 공식 매뉴얼 옵션 정의 · WHATWG Fetch 금지 헤더 · 각 언어 표준 HTTP 클라이언트 문서"
        sources={[
          { label: 'curl 매뉴얼', href: 'https://curl.se/docs/manpage.html' },
          { label: 'Everything curl', href: 'https://everything.curl.dev/' },
          { label: 'MDN 금지 요청 헤더', href: 'https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_request_header' },
          { label: 'Go net/http', href: 'https://pkg.go.dev/net/http' },
        ]}
      />

      <Callout tone="warn" title="변환 범위">
        cURL 파싱·코드 생성은 모두 <strong>브라우저에서 실행</strong>되며 입력한 명령·토큰은 외부로 전송되지 않습니다.
        TLS 인증서(<code>--cert</code>)·프록시(<code>--proxy</code>)·파일 본문(<code>-d @파일</code>) 등 일부 옵션은 코드에 옮기지 못하며, 파싱 결과에 따로 표시됩니다.
        생성된 코드는 일반적인 경우를 가정한 출발점이므로 운영 환경에 넣기 전 반드시 테스트하고, Authorization·API 키 같은 민감 헤더는 환경 변수로 옮기세요.
        분야별 안내는 <Link href="/disclaimer#dev">면책조항</Link>을 참고하세요.
      </Callout>

      <CurlClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>변환 탭</strong> — cURL을 붙여넣으면 5개 언어 코드가 동시에 나옵니다. async/await, try/catch 오류 처리, 민감 헤더 마스킹을 옵션으로 고를 수 있습니다.</li>
        <li><strong>요청 구조 탭</strong> — 메서드·URL·쿼리·헤더·인증·쿠키·본문을 나눠 보여 주고, Content-Type을 자동으로 판별합니다. 코드가 기대와 다르면 여기서 도구가 명령을 어떻게 읽었는지 먼저 확인하세요.</li>
        <li><strong>예시 탭</strong> — 카카오·네이버·토스·쿠팡·GitHub·OpenAI·Slack·AWS·GraphQL·multipart 등 12개 카드를 누르면 바로 입력됩니다.</li>
        <li><strong>가이드 탭</strong> — 옵션 요약, 언어별 비교, 미지원 옵션, 보안 주의를 도구 안에서 바로 볼 수 있습니다.</li>
      </ol>
      <Callout tone="tip" title="브라우저에서 요청 복사하기">
        Chrome·Edge·Firefox 개발자 도구 → Network 탭 → 요청 우클릭 → <strong>Copy as cURL</strong> 결과를 그대로 붙여넣으면 됩니다.
        Windows에서는 cmd용이 아닌 bash용 복사를 고르세요. 입력은 자동 저장되지만 Authorization·Cookie 같은 민감 헤더가 든 입력은 저장하지 않습니다.
      </Callout>

      {/* 2. 해석 규칙 */}
      <h2 className="g-h2">도구가 cURL을 해석하는 규칙</h2>
      <p className="g-p">
        cURL은 메서드를 적지 않아도 다른 옵션으로 요청 방식을 정합니다. 이 도구는 메서드를 다음 순서로 결정합니다.
        ① <code style={code}>-X</code>로 지정한 값 → ② <code style={code}>-I</code>면 HEAD → ③ <code style={code}>-G</code>면 GET →
        ④ 본문 옵션(<code style={code}>-d</code>·<code style={code}>--data-*</code>·<code style={code}>--json</code>·<code style={code}>-F</code>)이 있으면 POST → ⑤ 그 밖에는 GET.
        그래서 <code style={code}>-X PUT -d …</code>는 PUT, <code style={code}>-d …</code>만 있으면 POST가 됩니다.
      </p>
      <p className="g-p">
        본문 형식은 Content-Type 헤더가 있으면 그 값을 따르고, 없으면 본문 모양으로 추정합니다. <code style={code}>key=value&amp;key2=value2</code> 꼴이면 폼(urlencoded),
        <code style={code}>{'{'}</code>나 <code style={code}>[</code>로 시작하는 올바른 JSON이면 JSON, 둘 다 아니면 원문 그대로 보냅니다.
        <code style={code}>-F</code>가 하나라도 있으면 multipart가 우선하고, Content-Type이 JSON인데 본문이 JSON 문법에 맞지 않으면 원문 전송 코드로 바꾸고 경고를 띄웁니다.
        아래 표는 이 페이지를 만들 때 도구의 파서로 직접 돌린 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>입력한 cURL</th>
              <th scope="col" style={th}>메서드</th>
              <th scope="col" style={th}>본문</th>
              <th scope="col" style={th}>Content-Type</th>
              <th scope="col" style={th}>비고</th>
            </tr>
          </thead>
          <tbody>
            {PARSE_ROWS.map((r) => (
              <tr key={r.cmd} style={rowBorder}>
                <td style={td}><code style={code}>{r.cmd}</code></td>
                <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.method}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.body}</td>
                <td style={tdMuted}>{r.ct}</td>
                <td style={tdMuted}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="note" title="원본 명령과 달라질 수 있는 한 가지">
        실제 curl은 본문 내용을 해석하지 않으므로, Content-Type 없이 <code>-d &apos;{'{'}&quot;name&quot;:&quot;kim&quot;{'}'}&apos;</code>를 보내면 서버에는 <code>application/x-www-form-urlencoded</code>로 전달됩니다.
        이 도구는 JSON 본문을 보면 <code>application/json</code>을 붙여 주는데, 원래 명령이 폼 형식으로 서버에서 통하고 있었다면 결과가 달라질 수 있습니다.
        원본 그대로 재현하려면 cURL에 <code>-H &apos;Content-Type: …&apos;</code>를 명시한 뒤 변환하세요.
      </Callout>

      {/* 3. 옵션 치트시트 */}
      <h2 className="g-h2">cURL 옵션 치트시트 — 도구가 반영하는 범위</h2>
      <p className="g-p">
        짧은 형식과 긴 형식을 모두 인식하며, <code style={code}>--header=값</code>처럼 등호로 붙인 긴 옵션도 읽습니다.
        &lsquo;표시만&rsquo;인 옵션은 요청 구조 탭에 표시되지만 생성 코드에는 넣지 않습니다. 특히 <code style={code}>-k</code>를 코드에 그대로 옮기면
        운영 환경에서 중간자 공격을 막는 인증서 검증이 꺼진 채 남기 쉬워서 일부러 제외했습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>짧은 형식</th>
              <th scope="col" style={th}>긴 형식</th>
              <th scope="col" style={th}>curl에서의 의미</th>
              <th scope="col" style={th}>이 도구의 처리</th>
            </tr>
          </thead>
          <tbody>
            {OPTION_ROWS.map(([s, l, m, h]) => (
              <tr key={s + l} style={rowBorder}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{s ? <code style={code}>{s}</code> : '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{l ? <code style={code}>{l}</code> : '—'}</td>
                <td style={td}>{m}</td>
                <td style={tdMuted}>{h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. 5 언어 비교 */}
      <h2 className="g-h2">5 언어 차이 — fetch · axios · Python · Node.js · Go</h2>
      <p className="g-p">
        같은 요청이라도 언어마다 &lsquo;오류&rsquo;로 보는 기준과 기본 동작이 다릅니다. 변환된 코드를 고를 때는 실행 환경뿐 아니라
        HTTP 오류 상태를 예외로 던지는지, 타임아웃이 기본으로 걸려 있는지를 함께 보세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>코드</th>
              <th scope="col" style={th}>주로 쓰는 곳</th>
              <th scope="col" style={th}>장점</th>
              <th scope="col" style={th}>주의할 점</th>
            </tr>
          </thead>
          <tbody>
            {LANG_ROWS.map(([n, w, pros, cons]) => (
              <tr key={n} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{n}</td>
                <td style={tdMuted}>{w}</td>
                <td style={td}>{pros}</td>
                <td style={td}>{cons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. 동작 차이 */}
      <h2 className="g-h2">변환 후 동작이 달라지는 지점 — 리다이렉트·압축·TLS·쿠키</h2>
      <p className="g-p">
        코드가 문법적으로 같아도 HTTP 클라이언트의 기본값이 curl과 달라서 결과가 바뀌는 경우가 있습니다. cURL에서 잘 되던 요청이
        변환 후 다른 응답을 받는다면 아래 네 가지를 먼저 의심해 보세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr style={rowBorder}>
              {['항목', 'cURL', 'fetch (브라우저)', 'Python requests', 'Node http/https', 'Go net/http'].map((h) => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BEHAVIOR_ROWS.map(([k, ...cells]) => (
              <tr key={k} style={rowBorder}>
                <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{k}</th>
                {cells.map((c, i) => <td key={i} style={i === 0 ? td : tdMuted}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        <strong>리다이렉트</strong> — curl은 <code style={code}>-L</code>이 없으면 301·302 응답을 그대로 돌려주지만, fetch·requests·Go는 기본으로 새 주소를 따라갑니다.
        로그인 후 리다이렉트처럼 3xx 응답 자체를 봐야 한다면 Node.js fetch는 <code style={code}>redirect: &apos;manual&apos;</code>, requests는 <code style={code}>allow_redirects=False</code>를 지정하세요.
        브라우저 fetch는 manual로 두어도 보안상 Location 헤더를 읽을 수 없습니다.
        axios는 브라우저에서는 브라우저 규칙을 따르고, Node.js에서는 기본 21회까지 따라갑니다.
      </p>
      <p className="g-p">
        <strong>압축</strong> — 복사한 cURL에 <code style={code}>Accept-Encoding: gzip, deflate, br</code> 헤더가 남아 있으면 Go·Node http 코드는 압축된 바이트를 그대로 받습니다.
        Go는 헤더를 직접 넣은 요청의 응답을 자동으로 풀지 않고, Node http는 원래 풀지 않기 때문입니다. Python requests도 gzip·deflate만 기본으로 풀고,
        br·zstd 응답은 brotli·zstandard 패키지가 설치돼 있지 않으면 압축된 채로 넘겨줍니다(최근 브라우저 복사본은 <code style={code}>zstd</code>까지 적습니다). 어느 경우든 JSON 파싱이 실패하므로
        이 헤더를 지우고 각 클라이언트가 스스로 압축을 협상하게 두는 것이 가장 간단합니다.
      </p>
      <p className="g-p">
        <strong>쿠키</strong> — 브라우저의 fetch는 Cookie·Referer·Accept-Encoding 같은 금지 헤더를 스크립트가 설정해도 조용히 무시합니다.
        브라우저 코드에서 쿠키를 보내려면 헤더 대신 <code style={code}>credentials: &apos;include&apos;</code>를 쓰고, 다른 도메인이면 서버의 CORS 설정(Access-Control-Allow-Credentials)도 맞아야 합니다.
      </p>

      {/* 6. 운영 전 점검 */}
      <h2 className="g-h2">생성 코드를 운영에 옮기기 전 점검할 것</h2>
      <ul className="g-list">
        <li><strong>타임아웃</strong> — curl의 <code style={code}>-m</code>/<code style={code}>--max-time</code>은 코드에 옮기지 않습니다. requests는 <code style={code}>timeout</code> 인자가 없으면 응답을 무기한 기다리고, 생성된 Go 코드가 쓰는 <code style={code}>http.DefaultClient</code>도 타임아웃이 없습니다. <code style={code}>requests.get(…, timeout=10)</code>, <code style={code}>{'&http.Client{Timeout: 10 * time.Second}'}</code>, fetch는 <code style={code}>signal: AbortSignal.timeout(10000)</code>처럼 명시하세요.</li>
        <li><strong>오류 판정</strong> — fetch와 requests는 404·500에도 예외를 던지지 않습니다. try/catch 옵션을 켜면 Python은 <code style={code}>raise_for_status()</code>, fetch는 async / await 모드일 때 <code style={code}>response.ok</code>로 상태를 검사하는 코드가 함께 생성됩니다. Promise then 모드의 fetch 코드에는 이 검사가 없으니 첫 <code style={code}>.then</code>에 직접 넣으세요.</li>
        <li><strong>응답 형식</strong> — fetch·Python·Node 코드는 응답을 JSON으로 읽습니다. HTML이나 일반 텍스트를 돌려주는 API라면 fetch는 <code style={code}>.text()</code>, Python은 <code style={code}>response.text</code>로 바꾸고, Node는 <code style={code}>JSON.parse</code>를 빼고 모은 Buffer 문자열을 그대로 쓰세요.</li>
        <li><strong>Basic 인증</strong> — <code style={code}>-u user:pass</code>는 fetch·Node 코드에서 변환 시점에 계산한 Base64 문자열로 들어갑니다. Base64는 암호화가 아니므로 HTTPS로만 보내고, 비밀번호가 바뀌면 다시 변환하거나 코드에서 계산하도록 고치세요.</li>
      </ul>

      {/* 7. 미지원 옵션 */}
      <h2 className="g-h2">코드에 반영되지 않는 옵션</h2>
      <p className="g-p">
        아래 옵션은 파일 시스템, 인증서 저장소, 네트워크 경로처럼 실행 환경에 달린 설정이라 코드 한 줄로 옮기기 어렵습니다.
        명령에 들어 있으면 파싱 결과에 따로 표시되고, 값까지 함께 건너뛰므로 URL이 잘못 잡히지는 않습니다. 필요한 경우 각 언어의 클라이언트 설정으로 직접 옮기세요.
      </p>
      <Callout tone="warn" title="생성 코드에 들어가지 않는 cURL 옵션">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>파일 본문 <code>-d @파일</code>·<code>--data-binary @파일</code>·<code>--json @파일</code> — 메서드만 POST로 맞추고 본문은 직접 연결 (multipart <code>-F file=@…</code>는 지원)</li>
          <li>TLS 인증서 <code>--cert</code>/<code>-E</code>·<code>--key</code>·<code>--cacert</code>·<code>--cert-type</code></li>
          <li>프록시 <code>--proxy</code>/<code>-x</code>·<code>--proxy-user</code>·<code>--socks4</code>·<code>--socks5</code></li>
          <li>파일 저장 <code>-o</code>·<code>-O</code>·<code>-J</code>, 업로드 <code>-T</code>/<code>--upload-file</code></li>
          <li>범위·이어받기 <code>-r</code>/<code>--range</code>·<code>-C</code>/<code>--continue-at</code></li>
          <li>DNS 고정 <code>--resolve</code>·<code>--connect-to</code>, 전송 제어 <code>--limit-rate</code>·<code>--no-buffer</code></li>
        </ul>
      </Callout>

      {/* 8. 한국 API 시나리오 */}
      <h2 className="g-h2">한국 API 자주 쓰는 시나리오</h2>
      <p className="g-p">
        예시 탭에는 국내 백엔드 개발에서 자주 만나는 API 5개가 들어 있습니다. 인증 방식이 서로 달라서, 각 방식이 언어별 코드로 어떻게 바뀌는지 비교해 보기 좋습니다.
      </p>
      <ul className="g-list">
        <li><strong>카카오 메시지 보내기</strong> — Bearer 토큰 헤더 + form-urlencoded 본문</li>
        <li><strong>카카오 OAuth 토큰 발급</strong> — 인가 코드(authorization_code)를 액세스 토큰으로 교환</li>
        <li><strong>네이버 검색 API</strong> — X-Naver-Client-Id·X-Naver-Client-Secret 헤더 두 개로 인증</li>
        <li><strong>토스페이먼츠 결제 승인</strong> — 시크릿 키 Basic 인증 + JSON 본문</li>
        <li><strong>쿠팡 파트너스 검색</strong> — HMAC-SHA256 서명 헤더 (서명은 요청마다 새로 계산해야 함)</li>
      </ul>
      <Callout tone="tip" title="자리표시 값 바꾸기">
        YOUR_TOKEN·YOUR_CLIENT_ID 같은 자리표시 값은 환경 변수로 바꿔 쓰세요. 예: Node.js <code>process.env.KAKAO_TOKEN</code>, Python <code>os.environ[&quot;NAVER_CLIENT_ID&quot;]</code>.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/url-encode" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔗</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>URL 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인코드·쿼리 편집·추적 정리
          </p>
        </Link>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
        <Link href="/tools/dev/jwt" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔑</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JWT 디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Bearer 토큰 클레임·만료 확인
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
