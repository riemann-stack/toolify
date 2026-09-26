import Link from 'next/link'
import JwtClient from './JwtClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/jwt',
  title: 'JWT 디코더 — header·payload 클레임·만료 시각 확인',
  description: 'JWT를 붙여넣으면 header·payload를 Base64URL 디코드해 클레임을 표로 보여줍니다. exp·iat·nbf를 KST 시각으로 환산하고 만료 여부를 표시. 서명 검증은 하지 않으며 전부 브라우저에서 처리.',
  keywords: ['JWT 디코더', 'JWT 디코딩', 'JWT 파서', 'JWT 만료 확인', '토큰 클레임 확인', 'Base64URL 디코드', 'exp 시간 환산'],
})

const FAQ_LD = [
  {
    q: 'JWT를 이 도구로 디코딩해도 안전한가요?',
    a: '입력한 토큰은 <strong>브라우저 안에서만</strong> 디코드되고 서버로 전송되지 않습니다. 다만 JWT의 payload는 누구나 Base64URL만 풀면 읽을 수 있는 <strong>암호화되지 않은 정보</strong>입니다. 그래서 운영 중인 실제 토큰을 공유 화면이나 캡처에 노출하지 않는 편이 안전합니다. 만료된 토큰이나 테스트 토큰으로 확인하는 것을 권장합니다.',
  },
  {
    q: 'JWT 만료 시간은 어떻게 확인하나요?',
    a: 'payload의 <code>exp</code> 클레임이 만료 시각이며, 1970년 1월 1일부터의 초(epoch seconds)로 저장됩니다. 이 도구는 <code>exp</code>를 <strong>KST(한국 시각)로 환산</strong>해 보여주고, 현재 시각과 비교해 <strong>유효 / 만료 임박(5분 이내) / 만료됨</strong> 배지와 남은 시간을 함께 표시합니다. <code>exp</code>가 없는 토큰은 만료 개념이 없는 토큰입니다.',
  },
  {
    q: '서명 검증도 되나요?',
    a: '되지 않습니다. 서명 검증에는 토큰을 발급한 서버의 <strong>비밀키(HS256) 또는 공개키(RS256)</strong>가 필요한데, 정적 웹페이지에는 그 키가 없습니다. 이 도구는 header·payload를 디코드하고 시간 클레임을 환산하는 데까지만 합니다. 토큰이 위조되지 않았는지는 반드시 <strong>서버에서</strong> 확인해야 합니다.',
  },
  {
    q: 'payload에 비밀번호나 민감 정보를 넣어도 되나요?',
    a: '안 됩니다. JWT payload는 암호화가 아니라 <strong>인코딩</strong>일 뿐이라 누구나 풀어 읽을 수 있습니다. 비밀번호·주민번호·카드번호 같은 민감 정보를 넣으면 토큰을 가진 사람에게 그대로 노출됩니다. payload에는 사용자 ID·권한·만료 시각처럼 <strong>노출돼도 되는 식별 정보</strong>만 담는 것이 원칙입니다.',
  },
  {
    q: 'Bearer 토큰이 곧 JWT인가요?',
    a: '항상 그렇지는 않습니다. <code>Authorization: Bearer &lt;토큰&gt;</code>은 토큰을 <strong>전달하는 방식</strong>을 가리킬 뿐이고, 그 토큰이 JWT일 수도 있고 임의의 불투명 토큰(opaque token)일 수도 있습니다. 점(.)으로 3분할되고 각 부분이 Base64URL로 풀리면 JWT입니다. 이 도구는 <code>Bearer</code> 접두사를 자동으로 떼고 디코드합니다.',
  },
  {
    q: 'header.payload.signature 중 signature는 왜 안 풀리나요?',
    a: 'signature는 JSON이 아니라 <strong>해시·서명 알고리즘의 바이트 결과</strong>를 Base64URL로 인코딩한 값입니다. 사람이 읽을 수 있는 형태가 아니므로 원문 그대로 표시만 합니다. 이 값은 header와 payload, 그리고 비밀키로 다시 계산해 일치하는지 비교하는 <strong>검증용</strong>이며, 그 계산은 서버에서 이뤄집니다.',
  },
]

const code: React.CSSProperties = { background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }

/* 디코딩 예시 — 표의 Base64URL 문자열은 손으로 적지 않고 빌드 시 JSON에서 직접 인코딩한다 (RFC 7515 base64url, 패딩 없음) */
const b64url = (o: object) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64url')
const EX_HEADER = { alg: 'HS256', typ: 'JWT' }
/* 15분(900초)짜리 액세스 토큰 — 아래 '액세스 vs 리프레시' 표의 하한과 연결 */
const EX_PAYLOAD = { sub: 'user_42', role: 'member', iat: 1767222000, exp: 1767222000 + 900 }
const EX_LIFE = EX_PAYLOAD.exp - EX_PAYLOAD.iat
const SOON_SEC = 300 /* JwtClient의 '만료 임박' 기준(5분)과 같은 값 */
const EX_ROWS = [
  { part: 'Header', json: JSON.stringify(EX_HEADER), enc: b64url(EX_HEADER) },
  { part: 'Payload', json: JSON.stringify(EX_PAYLOAD), enc: b64url(EX_PAYLOAD) },
]
/* epoch 초 → 'YYYY-MM-DD HH:mm' KST (UTC+9 고정, 빌드 환경의 ICU·시간대와 무관하게 같은 문자열) */
const kst = (sec: number) => {
  const d = new Date((sec + 9 * 3600) * 1000)
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`
}

export default function JwtPage() {
  return (
    <ToolPage width={760} slug="/tools/dev/jwt">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />JWT 디코더
      </h1>
      <p className="tp-lead">
        JWT를 붙여넣으면 header·payload를 풀어 <strong style={{ color: 'var(--text)' }}>클레임을 표로</strong> 보여주고,
        exp·iat·nbf를 <strong style={{ color: 'var(--text)' }}>한국 시각으로 환산</strong>해 만료 여부까지 확인합니다. 서명은 검증하지 않습니다.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="RFC 7519(JWT) 등록 클레임 · RFC 8725(JWT 보안 권고) · RFC 9700(OAuth 2.0 보안 권고)"
        sources={[
          { label: 'RFC 7519 JSON Web Token', href: 'https://www.rfc-editor.org/rfc/rfc7519' },
          { label: 'RFC 8725 JWT Best Current Practices', href: 'https://www.rfc-editor.org/rfc/rfc8725' },
          { label: 'RFC 9700 OAuth 2.0 Security BCP', href: 'https://www.rfc-editor.org/rfc/rfc9700' },
          { label: 'NVD CVE-2015-9235', href: 'https://nvd.nist.gov/vuln/detail/CVE-2015-9235' },
        ]}
      />

      <JwtClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 구조 */}
        <div>
          <h2 className="g-h2">JWT 구조 — header.payload.signature</h2>
          <p className="g-p">
            JWT는 점(.)으로 나뉜 세 부분으로 이뤄집니다. 각 부분은 Base64URL로 인코딩되어 있어,
            일반 Base64와 달리 <code style={code}>+</code>·<code style={code}>/</code> 대신
            <code style={code}>-</code>·<code style={code}>_</code>를 쓰고 끝의 패딩(<code style={code}>=</code>)을 생략합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { n: '① Header', c: 'var(--red-600)', d: '서명 알고리즘(alg)과 타입(typ). 어떤 방식으로 서명했는지 알려줍니다.' },
              { n: '② Payload', c: 'var(--accent)', d: '클레임의 집합. 사용자 ID(sub)·발급자(iss)·만료(exp) 등이 담깁니다.' },
              { n: '③ Signature', c: 'var(--cyan-600)', d: 'header·payload와 비밀키로 만든 서명. 위변조를 잡아내는 검증용입니다.' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${p.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: p.c, fontWeight: 700, marginBottom: 6 }}>{p.n}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{p.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            디코딩은 이 과정을 거꾸로 하는 것뿐입니다. 아래 표는 예시 header·payload JSON을 실제로 Base64URL 인코딩한 결과로, 두 값을 점으로 이은 뒤 서명을 붙이면 토큰이 됩니다.
            JSON은 <code style={code}>{'{"'}</code>로 시작하므로 인코딩하면 거의 항상 <code style={code}>eyJ</code>로 시작합니다. 로그나 요청 헤더에서 <code style={code}>eyJ…</code> 문자열이
            점 두 개로 나뉘어 있다면 JWT일 가능성이 높습니다. 점이 네 개(다섯 부분)면 payload까지 암호화된 JWE라 내용을 볼 수 없고 이 도구도 &lsquo;부분 5개&rsquo; 오류를 내며,
            eyJ로 시작하지 않으면 대개 서버만 의미를 아는 불투명(opaque) 토큰입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['부분', '원래 JSON', 'Base64URL (토큰에 들어가는 값)'].map((hh) => (
                    <th scope="col" key={hh} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EX_ROWS.map((r) => (
                  <tr key={r.part} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.part}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all' }}>{r.json}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all' }}>{r.enc}</td>
                  </tr>
                ))}
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>Signature</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }} colSpan={2}>HMAC-SHA256(header.payload, 비밀키)의 32바이트 결과를 Base64URL로 — 비밀키가 없으면 계산할 수 없음</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            이 payload는 {kst(EX_PAYLOAD.iat)}에 발급돼 {kst(EX_PAYLOAD.exp)}(KST)에 만료되는, 수명 {EX_LIFE.toLocaleString('ko-KR')}초({EX_LIFE / 60}분)짜리입니다.
            아래 &lsquo;액세스 vs 리프레시&rsquo; 표의 가장 짧은 쪽이라 API 호출용 액세스 토큰으로 볼 수 있습니다. 이 도구는 남은 시간이 {SOON_SEC / 60}분 이하가 되면 &lsquo;만료 임박&rsquo; 배지를 띄우므로,
            이 토큰은 발급 {(EX_LIFE - SOON_SEC) / 60}분 뒤부터 임박으로 표시되고, 수명이 {SOON_SEC / 60}분 이하인 토큰은 발급 직후부터 임박으로 뜹니다.
          </p>
        </div>

        {/* 2. 주요 클레임 */}
        <div>
          <h2 className="g-h2">주요 클레임의 의미</h2>
          <p className="g-p">
            RFC 7519는 일곱 개의 표준 클레임을 정의합니다. 모두 선택 사항이지만 인증에서 자주 쓰입니다.
            나머지 키는 서비스가 자유롭게 정한 커스텀 클레임입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['클레임', '이름', '의미'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'iss', n: '발급자', d: '토큰을 발급한 주체 (예: 인증 서버 주소)' },
                  { k: 'sub', n: '주체', d: '토큰이 가리키는 대상 — 보통 사용자 식별자' },
                  { k: 'aud', n: '대상자', d: '이 토큰을 받기로 한 수신자' },
                  { k: 'exp', n: '만료 시각', d: '이 시각(epoch 초) 이후에는 무효' },
                  { k: 'nbf', n: '활성 시각', d: '이 시각 이전에는 사용 불가 (Not Before)' },
                  { k: 'iat', n: '발급 시각', d: '토큰이 만들어진 시각' },
                  { k: 'jti', n: '토큰 ID', d: '재사용·중복 방지를 위한 고유 식별자' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 서명 검증은 왜 서버에서만 */}
        <div>
          <h2 className="g-h2">왜 서명 검증은 서버에서만 가능한가</h2>
          <p className="g-p">
            서명은 header와 payload를 비밀키로 해싱한 결과입니다. 토큰이 진짜인지 확인하려면 같은 비밀키로
            서명을 다시 계산해 일치하는지 비교해야 합니다.
          </p>
          <ul className="g-list">
              <li><strong>HS256(대칭키):</strong> 서명과 검증에 같은 비밀키를 씁니다. 이 키를 브라우저에 두면 누구나 위조 토큰을 만들 수 있으므로 절대 노출하지 않습니다.</li>
              <li><strong>RS256(비대칭키):</strong> 개인키로 서명하고 공개키로 검증합니다. 공개키는 공개돼도 되지만, 검증 로직 자체는 보통 서버나 게이트웨이가 담당합니다.</li>
              <li>그래서 디코딩(읽기)과 검증(진위 확인)은 별개입니다. 이 도구는 <strong>읽기까지만</strong> 합니다.</li>
          </ul>
        </div>

        {/* 4. 시간 읽는 법 */}
        <div>
          <h2 className="g-h2">exp·iat 시간 읽는 법</h2>
          <p className="g-p">
            시간 클레임(exp·iat·nbf)은 <strong>Unix epoch 초</strong>로 저장됩니다 —
            1970년 1월 1일 0시(UTC)부터 흐른 초입니다. 예를 들어 <code style={code}>1767225600</code>은
            2026년 1월 1일 오전 9시(KST)를 가리킵니다.
          </p>
          <ul className="g-list">
              <li>이 도구는 초를 <strong>KST(Asia/Seoul)</strong>로 환산해 보여줍니다.</li>
              <li>값이 <strong>13자리</strong>면 밀리초로 저장됐을 가능성이 있어 배지로 표시합니다. JWT 표준은 초 단위이므로 13자리는 비표준 신호입니다.</li>
              <li><code style={code}>exp − iat</code>가 토큰의 유효 기간입니다 (예: 3600이면 1시간짜리 액세스 토큰).</li>
          </ul>
        </div>

        {/* 5. alg 혼동·none 공격 */}
        <div>
          <h2 className="g-h2">alg 혼동·none 공격 — header의 alg를 믿으면 안 되는 이유</h2>
          <p className="g-p">
            서명 검증에서 가장 흔한 실수는 <strong>header에 적힌 <code style={code}>alg</code> 값을 그대로 믿는 것</strong>입니다.
            공격자는 header만 고쳐도 되므로, 검증 서버가 알고리즘을 고정하지 않으면 두 가지 우회가 생깁니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공격', '조작', '통하는 조건'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'alg:none', n: 'alg을 none으로 바꾸고 서명을 비움', d: '라이브러리가 none을 서명 없는 토큰으로 통과시킬 때' },
                  { k: 'RS256→HS256', n: 'alg을 HS256으로 바꿔 공개키를 HMAC 비밀키로 사용', d: 'verify가 header의 alg를 따라 공개키로 HMAC 검증할 때' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontSize: 12 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            RS256→HS256 혼동은 공개키가 JWKS로 공개돼 있다는 점을 노립니다. 공개키를 그대로 HMAC 비밀키로 써서
            토큰을 다시 서명하면, header의 alg만 보고 공개키로 HMAC 검증하는 서버는 이를 유효한 서명으로 받아들입니다.
            실제로 node-jsonwebtoken 4.2.2 이전 버전은 비대칭키를 기대하는 검증에 대칭 알고리즘 토큰을 넣어 우회할 수 있었고
            (<code style={code}>CVE-2015-9235</code>, CVSS 9.8),
            pyjwt·php-jwt 등 여러 라이브러리가 같은 결함을 공유했습니다.
          </p>
          <ul className="g-list">
              <li><strong>알고리즘 화이트리스트:</strong> 검증 호출에서 <code style={code}>{"algorithms: ['RS256']"}</code>처럼 허용 알고리즘을 명시하고, 그 외에는 거부합니다. RFC 8725 §3.1은 라이브러리가 허용 집합을 지정하게 하고 header의 alg가 실제 연산과 같은지 확인하도록 요구합니다.</li>
              <li><strong>none 금지:</strong> RFC 8725 §3.2는 명시적 요청이 없는 한 none을 소비하지 말라고 권고합니다. 발급·검증 어느 쪽에서도 none을 기본 허용하지 않습니다.</li>
              <li><strong>알고리즘 고정:</strong> 발급 때 쓴 알고리즘을 서버가 이미 알고 있으므로, 검증은 header가 아니라 서버가 정한 알고리즘으로만 수행합니다.</li>
          </ul>
        </div>

        {/* 6. 액세스 vs 리프레시 토큰 수명 */}
        <div>
          <h2 className="g-h2">액세스 vs 리프레시 토큰 — 수명 설계</h2>
          <p className="g-p">
            토큰의 <code style={code}>exp − iat</code>로 종류를 역추정할 수 있습니다.
            수명이 짧으면 API 호출용 <strong>액세스 토큰</strong>, 며칠~몇 주로 길면 재발급용 <strong>리프레시 토큰</strong>일 가능성이 큽니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', 'exp − iat 예시', '역할'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '액세스 토큰', n: '900~3600초 (15분~1시간)', d: '리소스 접근에 직접 제시. 짧게 유지해 탈취 시 피해 창을 줄임' },
                  { k: '리프레시 토큰', n: '수 일~수 주', d: '만료된 액세스 토큰을 재발급받는 용도. 노출 위험이 커 회전이 필요' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            짧은 수명 + <strong>리프레시 토큰 회전(rotation)</strong>이 권장되는 이유는, 토큰이 새면 피해를 줄이기 위해서입니다.
            회전은 재발급 때마다 리프레시 토큰을 새로 내주고 이전 것을 즉시 폐기해, 한 번 쓰인 토큰이 다시 쓰이면 재사용을 탐지해 토큰 계열 전체를 무효화합니다.
            RFC 9700은 공개 클라이언트의 리프레시 토큰을 회전하거나 발신자 제약(mTLS·DPoP)으로 묶으라고 요구합니다.
          </p>
          <Callout tone="note" title="왜 로그아웃 즉시 무효화가 어려운가">
              JWT는 서명만 맞으면
              서버 조회 없이 유효하다고 판단하는 <strong>무상태(stateless)</strong> 토큰입니다.
              그래서 발급 뒤에는 <code style={code}>exp</code>가 지나기 전까지 서버가 회수할 수단이 기본적으로 없습니다.
              로그아웃해도 이미 나간 액세스 토큰은 만료까지 살아 있어, 즉시 차단하려면 블랙리스트·짧은 <code style={code}>exp</code>·서명키 교체 같은 상태 저장 장치를 더해야 합니다.
              이는 무상태의 장점을 일부 포기하는 트레이드오프입니다. 그래서 액세스 토큰을 짧게 두고 실질적 회수는 리프레시 단계에서 처리하는 설계가 자리 잡았습니다.
          </Callout>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·URL 안전 Base64 변환' },
              { href: '/tools/dev/hash',   icon: '🔒', name: '해시 생성기',          desc: 'SHA-256·HMAC — JWT 서명에 쓰는 해시' },
              { href: '/tools/dev/json',   icon: '📋', name: 'JSON 포맷터',          desc: '디코드한 payload 정렬·트리 뷰' },
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
