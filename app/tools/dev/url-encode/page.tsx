import Link from 'next/link'
import UrlEncodeClient from './UrlEncodeClient'
import { TRACKING_GROUPS, MAX_DECODE_ITERATIONS, analyzeKorean, cleanTrackingParams, decodeUrl, detectTrackingParams } from './urlEncodeUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/url-encode',
  title: 'URL 인코더/디코더 — encodeURIComponent + 쿼리 편집기 + UTM·네이버·카카오 추적 정리',
  description: 'URL 인코드/디코드(encodeURIComponent·encodeURI) + URL 분해와 쿼리 파라미터 표 편집. UTM·fbclid·네이버·카카오·쿠팡 추적 정리.',
  keywords: [
    'URL 인코드', 'URL 디코드', 'URL encoder', 'URL decoder',
    'encodeURIComponent', 'encodeURI', 'decodeURIComponent',
    '쿼리스트링', '쿼리 파라미터', 'query string',
    'utm 제거', 'utm 파라미터', '추적 파라미터 제거', 'tracking 제거',
    '네이버 검색 URL', 'n_media', 'n_query', '네이버 추적',
    '카카오 추적', '쿠팡 추적', 'fbclid', 'gclid',
    '한글 URL 인코딩', 'percent encoding', 'percent encode',
    'URL 분해', 'URL 파싱', 'OAuth state',
  ],
})

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top', lineHeight: 1.6 }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }
const rowLine: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const code: React.CSSProperties = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }

/* 함수별 인코딩 비교 — 손으로 적지 않고 빌드 시 JS 엔진으로 직접 인코딩한다 */
const strict3986 = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (ch) => '%' + ch.charCodeAt(0).toString(16).toUpperCase())
const CHAR_ROWS = [' ', '!', '#', '%', '&', "'", '*', '+', '/', ':', '=', '?', '@', '~', 'é', '한', '😀'].map((ch) => ({
  ch,
  comp: encodeURIComponent(ch),
  uri: encodeURI(ch),
  form: new URLSearchParams({ v: ch }).toString().slice(2),
  strict: strict3986(ch),
  esc: escape(ch),
}))

/* UTF-8 바이트 분해 — 도구의 analyzeKorean()과 같은 함수 */
const UTF8_ROWS = analyzeKorean('한국안녕韓é😀')
const EX_TEXT = '서울 맛집'
const EX_ENC = encodeURIComponent(EX_TEXT)

/* 이중 인코딩 예시 — 도구의 decodeUrl()로 1회·반복 디코드 결과를 계산 */
const DBL_SRC = 'a b&c'
const DBL = encodeURIComponent(encodeURIComponent(DBL_SRC))
const DBL_ONCE = decodeUrl(DBL, false).result
const DBL_REPEAT = decodeUrl(DBL, true)

/* 추적 정리 예시 — 도구의 detect/clean 함수로 계산 */
const CLEAN_SRC = 'https://shop.example.com/item?id=42&q=a+b&utm_source=naver&utm_medium=cpc&n_media=27758&fbclid=IwAR0abc'
const CLEAN_OUT = cleanTrackingParams(CLEAN_SRC, new Set(detectTrackingParams(CLEAN_SRC).map((m) => m.key)))
const TRACK_TOTAL = TRACKING_GROUPS.reduce((n, g) => n + g.keys.length + (g.domainKeys?.keys.length ?? 0), 0)

const FAQ_LD = [
  {
    q: 'encodeURIComponent와 encodeURI는 어떻게 다른가요?',
    a: '<strong>encodeURIComponent</strong>는 <code>: / ? # @ &amp; = + $ ,</code> 같은 URL 구분 문자까지 모두 인코딩합니다. <strong>encodeURI</strong>는 주소 전체가 들어온다고 보고 이 구분 문자를 그대로 둡니다.<br />그래서 쿼리 값·경로 한 조각에는 encodeURIComponent, 이미 모양이 갖춰진 전체 URL에서 공백·한글만 바꿀 때는 encodeURI를 씁니다. 예: <code>encodeURIComponent("a&amp;b")</code> = <code>a%26b</code>(값으로 안전), <code>encodeURI("a&amp;b")</code> = <code>a&amp;b</code>(그대로 넣으면 <code>&amp;</code> 뒤가 다른 파라미터로 잘립니다). 어느 쪽인지 애매하면 값 단위로 encodeURIComponent를 쓰는 편이 안전합니다.',
  },
  {
    q: 'escape()는 왜 쓰면 안 되나요?',
    a: 'escape()는 URL 표준 인코딩이 아닙니다. ECMAScript 명세에서도 웹 호환용 부록(Annex B)으로만 남아 있습니다. 동작이 표준과 두 군데서 어긋납니다.<br />• 0~255 범위 문자는 UTF-8이 아니라 Latin-1 한 바이트로 바꿉니다 — <code>é</code> → <code>%E9</code>(표준은 <code>%C3%A9</code>)<br />• 그보다 큰 문자는 <code>%uXXXX</code>라는 비표준 형식이 됩니다 — <code>한</code> → <code>%uD55C</code>, 이모지는 서로게이트 두 개(<code>%uD83D%uDE00</code>)<br />서버의 URL 디코더는 <code>%u</code> 형식을 모르므로 값이 깨지거나 오류가 납니다. 이 도구는 escape()를 제공하지 않고, 위 비교표에 결과만 참고로 실었습니다.',
  },
  {
    q: '한글 한 글자가 왜 %XX가 세 개인가요?',
    a: 'URL에는 ASCII 문자만 그대로 쓸 수 있어서, 그 밖의 문자는 먼저 <strong>UTF-8 바이트</strong>로 바꾼 뒤 바이트마다 <code>%XX</code>를 붙입니다. UTF-8은 코드포인트 U+0080~U+07FF를 2바이트, U+0800~U+FFFF를 3바이트, U+10000 이상을 4바이트로 표현합니다. 한글 음절(U+AC00~U+D7A3)과 대부분의 한자는 3바이트 구간이라 <code>%XX</code> 세 개(9자), 이모지는 4바이트라 네 개(12자)가 됩니다. 예: 한(U+D55C) → 바이트 ED 95 9C → <code>%ED%95%9C</code>.',
  },
  {
    q: '공백은 +인가요, %20인가요?',
    a: '쓰이는 규칙이 다릅니다. RFC 3986의 URL 문법에서 공백은 <code>%20</code>이고 <code>+</code>는 그냥 더하기 기호입니다. 반면 HTML 폼 전송 형식(<code>application/x-www-form-urlencoded</code>, WHATWG URL 표준)은 공백을 <code>+</code>로 씁니다 — <code>new URLSearchParams({a: " "}).toString()</code>의 결과가 <code>a=+</code>인 이유입니다.<br />문제는 디코딩입니다. <code>decodeURIComponent</code>는 <code>+</code>를 공백으로 바꾸지 않으므로, 검색 URL(<code>q=a+b</code>)을 그대로 디코드하면 <code>a+b</code>가 남습니다. 이 도구는 디코드 옵션의 "+를 공백으로"를 켜면 폼 규칙으로 해석하고, 실제 + 기호는 <code>%2B</code>로 들어와 있으므로 디코드 후에도 +로 남습니다. 인코딩 결과는 항상 <code>%20</code>입니다.',
  },
  {
    q: '%2520처럼 이중 인코딩이 생기는 이유는?',
    a: '이미 인코딩된 값을 한 번 더 인코딩했기 때문입니다. 공백 → <code>%20</code>, 그 <code>%</code>가 다시 <code>%25</code>가 되어 <code>%2520</code>이 됩니다. 프런트엔드가 인코딩한 값을 HTTP 클라이언트 라이브러리가 또 인코딩하거나, OAuth <code>redirect_uri</code>처럼 URL 안에 URL을 넣는 과정에서 흔히 생깁니다. 이 도구의 디코드 탭에서 "반복 디코드"를 켜면 값이 더 바뀌지 않을 때까지 최대 5회 풀어 원문을 확인할 수 있습니다. 근본 해결은 코드에서 인코딩을 <strong>값을 URL에 넣는 마지막 한 곳</strong>에서만 하도록 정리하는 것입니다.',
  },
  {
    q: 'UTM 같은 추적 파라미터를 지워도 페이지가 정상 동작하나요?',
    a: '대부분은 그렇습니다. <code>utm_*</code>는 Google Analytics 등이 유입 경로를 기록하는 값이고, <code>fbclid</code>·<code>gclid</code>는 광고 클릭 식별자라 페이지 내용과 무관합니다. 다만 일부 사이트는 캠페인 파라미터로 다른 랜딩 화면을 보여 주기도 하므로 정리한 URL을 한 번 열어 보고 공유하세요. 이 도구는 미리 등록한 추적 키만 제거 후보로 고르고, <code>src</code>·<code>pid</code>처럼 다른 사이트에서는 상품 ID 같은 기능용으로 쓰이는 키는 해당 플랫폼 주소(쿠팡·카카오)일 때만 추적으로 분류합니다.',
  },
  {
    q: '네이버 n_media·n_query 같은 파라미터는 무엇인가요?',
    a: '네이버 검색광고가 광고 클릭 시 랜딩 URL에 자동으로 붙이는 추적 파라미터입니다. <code>n_media</code>는 광고가 노출된 매체 ID, <code>n_query</code>는 사용자가 입력한 검색어, <code>n_keyword</code>·<code>n_keyword_id</code>는 광고주가 등록한 키워드와 그 ID, <code>n_rank</code>는 광고 노출 순위, <code>n_ad_group</code>·<code>n_ad</code>는 광고그룹·소재 ID, <code>n_campaign_type</code>은 캠페인 유형입니다. 광고 성과 분석용이라 지워도 페이지 동작에는 영향이 없고, n_query에 검색어가 그대로 들어 있으므로 공유 전에 지우는 편이 좋습니다.',
  },
  {
    q: 'URL은 최대 몇 자까지 쓸 수 있나요?',
    a: '표준 상한은 없고 RFC 9110은 <strong>최소 8,000옥텟</strong> 지원을 권고합니다. 서버·브라우저별 기본 한도는 위 ‘URL 길이 한도’ 표를 참고하고, 긴 텍스트나 JSON은 URL이 아니라 POST 본문으로 보내세요.',
  },
  {
    q: 'OAuth 콜백 URL을 디코드할 때 주의할 점은?',
    a: '콜백 URL에는 <code>code</code>(1회용 인가 코드), <code>state</code>(CSRF 방지용 임의 값), 때로는 <code>access_token</code>이 들어 있습니다. 디코드해서 확인하는 것은 문제없지만 <strong>값을 수정하거나 남에게 공유하면 안 됩니다</strong> — state를 바꾸면 검증이 실패하고, 토큰이 노출되면 계정이 탈취될 수 있습니다. 이 도구의 처리는 모두 브라우저 안에서 이뤄지지만 입력값은 편의를 위해 이 브라우저의 localStorage(<code>youtil_url_encode_v1</code>)에 저장되므로, 공용 PC에서 토큰이 든 URL을 다뤘다면 입력을 지우거나 DevTools → Application → Local Storage에서 해당 키를 삭제하세요.',
  },
]

export default function UrlEncodePage() {
  return (
    <ToolPage width={880} slug="/tools/dev/url-encode">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />URL 인코더/디코더
      </h1>
      <p className="tp-lead">
        URL 인코드/디코드 + URL 분해와 쿼리 파라미터 표 편집. <strong style={{ color: 'var(--text)' }}>UTM·추적 파라미터 일괄 정리</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="RFC 3986(URI 문법)·WHATWG URL 표준(폼 인코딩)·ECMAScript encodeURIComponent 정의 · URL 길이는 RFC 9110 권고와 서버 기본 설정"
        sources={[
          { label: 'RFC 3986 URI Generic Syntax', href: 'https://www.rfc-editor.org/rfc/rfc3986' },
          { label: 'WHATWG URL Standard', href: 'https://url.spec.whatwg.org/' },
          { label: 'ECMAScript encodeURIComponent', href: 'https://tc39.es/ecma262/#sec-encodeuricomponent-uricomponent' },
          { label: 'RFC 9110 §4.1 URI 길이', href: 'https://www.rfc-editor.org/rfc/rfc9110#section-4.1' },
        ]}
      />

      <Callout tone="warn" title="입력과 정리 결과">
        인코드·디코드·파싱은 모두 <strong>브라우저에서 실행</strong>되며 입력 URL은 외부로 전송되지 않습니다(입력 최대 100KB).
        추적 파라미터 정리는 일반적인 광고 추적 키를 지우는 것이라 <strong>일부 사이트의 캠페인 분기 같은 기능</strong>도 함께 사라질 수 있으니 결과를 확인한 뒤 쓰세요.
        OAuth state·CSRF 토큰 같은 보안 값은 수정하거나 공유하지 마세요. 분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent-ink)' }}>면책조항</Link> 참고.
      </Callout>

      <UrlEncodeClient />

      <GuideDivider />

      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>인코드/디코드</strong> — 입력에 <code style={code}>%XX</code> 형태가 하나라도 있으면 디코드, 없으면 인코드로 자동 판단합니다(수동 전환 가능). 인코드는 encodeURIComponent·encodeURI 중 고르고, 디코드는 &ldquo;반복 디코드(최대 {MAX_DECODE_ITERATIONS}회)&rdquo;와 &ldquo;+를 공백으로&rdquo; 옵션이 있습니다. 한글·이모지 같은 비ASCII 문자는 글자별 UTF-8 바이트 표로 풀어 보여 줍니다.</li>
        <li><strong>URL 분해·편집</strong> — scheme·host·port·path·query·fragment(사용자 정보가 있으면 user·password)로 나누고, 쿼리 파라미터를 표에서 추가·수정·삭제하면 URL이 즉시 다시 조립됩니다. 조립할 때 키와 값은 각각 encodeURIComponent로 인코딩됩니다.</li>
        <li><strong>추적 정리</strong> — 7개 그룹 {TRACK_TOTAL}개 추적 키 중 URL에 들어 있는 것을 찾아 그룹별·개별로 골라 지웁니다.</li>
        <li><strong>가이드</strong> — 함수 비교, RFC 3986 문자 분류, 흔한 실수, 추적 키 사전을 도구 안에서 바로 볼 수 있습니다.</li>
      </ol>
      <p className="g-p">
        입력과 옵션은 이 브라우저에 자동 저장되어 새로고침해도 유지됩니다. 퍼센트 인코딩 자체는 RFC 3986이 정한 규칙이고, 브라우저의 encodeURIComponent는 이 규칙을 ECMAScript 명세대로 구현한 함수입니다.
      </p>

      <h2 className="g-h2">함수별 인코딩 결과 비교</h2>
      <p className="g-p">
        RFC 3986은 URL에 그대로 써도 되는 <strong>비예약 문자(unreserved)</strong>를 영문자·숫자와 <code style={code}>- . _ ~</code> 네 기호로 정하고, <code style={code}>: / ? # [ ] @</code>(구분자)와 <code style={code}>! $ &amp; &apos; ( ) * + , ; =</code>(하위 구분자)를 예약 문자로 둡니다.
        그런데 자바스크립트의 인코딩 함수들은 이 경계를 조금씩 다르게 그어서 같은 문자도 결과가 달라집니다. 아래 표는 각 함수를 실제로 실행한 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['문자', 'encodeURIComponent', 'encodeURI', 'URLSearchParams(폼)', 'RFC 3986 엄격', 'escape() — 사용 금지'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {CHAR_ROWS.map((r) => (
              <tr key={r.ch} style={rowLine}>
                <td style={{ ...tdMono, fontWeight: 700 }}>{r.ch === ' ' ? '(공백)' : r.ch}</td>
                <td style={{ ...tdMono, color: 'var(--accent-ink)' }}>{r.comp}</td>
                <td style={tdMono}>{r.uri}</td>
                <td style={tdMono}>{r.form}</td>
                <td style={tdMono}>{r.strict}</td>
                <td style={{ ...tdMono, color: 'var(--muted)' }}>{r.esc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        읽는 법: encodeURIComponent는 비예약 문자 외에 <code style={code}>! &apos; ( ) *</code>도 그대로 둡니다. 브라우저 주소로는 문제없지만, <strong>서명 계산</strong>처럼 비예약 문자만 남기도록 요구하는 규격에서는 이 다섯 글자가 서명 불일치를 일으킵니다
        — OAuth 1.0(RFC 5849)과 AWS 서명 버전 4가 대표적이며, 이때는 &lsquo;RFC 3986 엄격&rsquo; 열처럼 다섯 글자를 추가로 치환해야 합니다.
        URLSearchParams는 폼 규칙이라 공백을 <code style={code}>+</code>로, <code style={code}>~</code>를 <code style={code}>%7E</code>로 바꾸고, escape()는 é·한글·이모지에서 표준과 전혀 다른 값을 만듭니다.
      </p>

      <h2 className="g-h2">한글·이모지가 길어지는 이유 — UTF-8 바이트</h2>
      <p className="g-p">
        ASCII 밖의 문자는 먼저 UTF-8 바이트열로 바뀌고, 각 바이트가 <code style={code}>%</code>와 16진수 두 자리로 적힙니다. 그래서 URL 길이는 글자 수가 아니라 <strong>바이트 수 × 3</strong>으로 늘어납니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['글자', '코드포인트', 'UTF-8 바이트', 'URL 인코딩', '인코딩 후 길이'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {UTF8_ROWS.map((r) => (
              <tr key={r.char} style={rowLine}>
                <td style={{ ...td, fontSize: '18px', fontWeight: 700 }}>{r.char}</td>
                <td style={tdMono}>{r.codepoint}</td>
                <td style={tdMono}>{r.bytes.length} ({r.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')})</td>
                <td style={{ ...tdMono, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.hexEncoded}</td>
                <td style={td}>{r.hexEncoded.length}자</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        계산 예: &ldquo;{EX_TEXT}&rdquo;는 한글 4글자와 공백 1개, 5글자지만 encodeURIComponent 결과는 <code style={code}>{EX_ENC}</code>로 <strong>{EX_ENC.length}자</strong>가 됩니다(한글 4 × 9자 + 공백 3자).
        검색어·상품명이 들어가는 URL이 금세 수백 자가 되는 이유이고, 로그나 문서에 붙여 넣을 때는 디코드한 형태가 훨씬 읽기 쉽습니다.
      </p>

      <h2 className="g-h2">URL 길이 한도 — 어디서 잘리나</h2>
      <p className="g-p">
        HTTP 표준은 URL 길이 상한을 정하지 않는 대신, 모든 송수신 측이 최소 8,000옥텟은 처리하도록 권고합니다. 실제로는 요청이 거치는 경로 중 <strong>가장 짧은 한도</strong>에서 잘리고, 서버마다 돌려주는 코드도 다릅니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['구간', '기본 한도', '넘으면'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['RFC 9110 권고', '최소 8,000옥텟은 지원', '—'],
              ['nginx (large_client_header_buffers 4 8k)', '요청 줄이 버퍼 하나(8KB)를 넘으면 거부', '414 URI Too Long'],
              ['Apache (LimitRequestLine)', '8,190바이트', '414 URI Too Long'],
              ['IIS 요청 필터링', 'URL 경로 4,096바이트 · 쿼리 문자열 2,048바이트', '404.14 · 404.15'],
              ['Chrome', '2MB', '탐색하지 않음'],
              ['Internet Explorer(지원 종료)', '2,083자', '— 흔히 말하는 2,000자 안전선의 출처'],
            ].map((r) => (
              <tr key={r[0]} style={rowLine}>
                <td style={{ ...td, fontWeight: 600 }}>{r[0]}</td>
                <td style={td}>{r[1]}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        CDN·로드밸런서·WAF가 앞에 있으면 그 계층의 한도가 먼저 적용되므로, 긴 URL이 필요한 기능이라면 실제 운영 경로로 한 번 요청해 보고 결정하세요. 필터 조건이 수십 개인 검색처럼 데이터가 큰 요청은 POST 본문으로 옮기는 편이 안전합니다.
      </p>

      <h2 className="g-h2">흔한 실수와 확인 방법</h2>
      <ol className="g-list">
        <li>
          <strong>이중 인코딩</strong> — &ldquo;{DBL_SRC}&rdquo;를 두 번 인코딩하면 <code style={code}>{DBL}</code>가 됩니다. 한 번 디코드하면 <code style={code}>{DBL_ONCE}</code>로 여전히 인코딩이 남고,
          반복 디코드를 켜면 {DBL_REPEAT.iterations}회 만에 원문 &ldquo;{DBL_REPEAT.result}&rdquo;로 돌아옵니다. 서버 로그에 <code style={code}>%25</code>가 보이면 이중 인코딩을 의심하세요.
        </li>
        <li><strong>쿼리 값에 encodeURI 사용</strong> — 값 속의 <code style={code}>&amp;</code>·<code style={code}>=</code>·<code style={code}>#</code>가 그대로 남아 파라미터가 잘리거나 뒷부분이 fragment로 사라집니다. 값에는 encodeURIComponent를 쓰세요.</li>
        <li><strong>+와 공백 혼동</strong> — 폼 형식으로 만든 URL을 decodeURIComponent로 풀면 +가 남고, 반대로 +가 들어간 값(전화번호 +82, 수식 1+1)을 인코딩 없이 붙이면 서버가 공백으로 읽습니다.</li>
        <li><strong>짝이 맞지 않는 %</strong> — <code style={code}>%</code> 뒤에는 16진수 두 자리가 와야 합니다. &ldquo;50% 할인&rdquo; 같은 원문을 디코드하면 URIError가 나므로, 이런 값은 먼저 인코딩해야 합니다.</li>
        <li><strong>escape()/unescape() 사용</strong> — 오래된 코드에 남아 있는 경우가 많습니다. 위 비교표처럼 결과가 표준과 달라 서버에서 한글이 깨집니다.</li>
      </ol>

      <h2 className="g-h2">추적 파라미터 — 이 도구가 지우는 키</h2>
      <p className="g-p">
        광고 클릭·검색 결과·SNS 공유를 거치면 URL 뒤에 유입 경로를 기록하는 파라미터가 붙습니다. 페이지 내용과는 무관하지만 URL을 길게 만들고, 검색어(<code style={code}>n_query</code>)나 캠페인 이름이 그대로 드러나며,
        같은 페이지가 분석 도구에서 서로 다른 주소로 집계되는 원인이 됩니다. 아래 표는 이 도구의 추적 키 사전 그대로이며, <code style={code}>utm_*</code>처럼 별표가 붙은 항목은 그 접두어로 시작하는 모든 키를 뜻합니다.
      </p>
      <div className="tableScroll">
        <table style={tableStyle}>
          <thead>
            <tr style={rowLine}>
              {['그룹', '어디서든 추적으로 보는 키', '해당 플랫폼 주소에서만'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {TRACKING_GROUPS.map((g) => (
              <tr key={g.id} style={rowLine}>
                <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{g.label}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{g.keys.join(' · ')}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                  {g.domainKeys ? `${g.domainKeys.keys.join(' · ')} (${g.domainKeys.domains.join(', ')})` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        정리 예: <code style={code}>{CLEAN_SRC}</code>에서 추적 키 {CLEAN_OUT.removedCount}개를 지우면 <code style={code}>{CLEAN_OUT.cleanUrl}</code>가 됩니다.
        남은 파라미터는 다시 조립되면서 encodeURIComponent 규칙으로 인코딩되므로, 폼 형식의 <code style={code}>q=a+b</code>는 같은 뜻의 <code style={code}>q=a%20b</code>로 바뀝니다. 값의 의미는 같지만 원문과 글자가 달라지니 비교할 때 참고하세요.
      </p>

      <Faq items={FAQ_LD} />

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
        <Link href="/tools/dev/regex" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>정규식 테스트기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            매칭·캡처·치환·치트시트
          </p>
        </Link>
        <Link href="/tools/dev/base64" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>Base64 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            텍스트 ↔ Base64·URL-safe
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
