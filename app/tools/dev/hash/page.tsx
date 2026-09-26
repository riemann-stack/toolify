import Link from 'next/link'
import HashClient from './HashClient'
import { ALGORITHMS, encodeText, formatHash, hashText, hmacSign, type TextEncoding } from './hashUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/hash',
  title: '해시 생성기 — MD5·SHA-1·SHA-256·SHA-512·HMAC + 파일 무결성',
  description: 'MD5·SHA-1·SHA-256·SHA-512 동시 + HMAC 서명(GitHub/Slack/AWS/JWT)·파일 무결성·SRI 해시. 안전성 등급. 전부 브라우저 처리.',
  keywords: [
    '해시 생성기', 'MD5 변환', 'SHA256 생성', 'SHA-256', 'SHA-512',
    'HMAC', 'HMAC-SHA256', 'HMAC 서명',
    '파일 해시', '체크섬', 'checksum',
    'SRI 해시', 'integrity 해시', 'subresource integrity',
    '무결성 확인', '파일 무결성', 'GitHub 웹훅 서명', 'Slack 서명',
    'AWS Signature V4', 'JWT 서명', 'JWT HS256',
    'hex base64 해시', '해시 충돌', '해시 알고리즘',
  ],
})

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const ROW: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 12 }
const CODE: React.CSSProperties = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', fontSize: '0.9em' }

const FAQ_LD = [
  {
    q: 'MD5는 안전한가요?',
    a: '<strong>보안 용도로는 쓰면 안 됩니다.</strong> 2004년 왕샤오윈(Wang) 연구팀이 실제 충돌 쌍을 발표했고, 2008년에는 MD5 충돌로 가짜 인증기관(CA) 인증서를 만드는 시연이, 2012년에는 Flame 악성코드가 MD5 충돌로 Microsoft 코드 서명을 위조한 사례가 나왔습니다. 반면 <strong>우연한 손상 검출(체크섬)·중복 파일 찾기·캐시 키</strong>처럼 누군가 일부러 충돌을 만들 이유가 없는 곳에서는 지금도 씁니다. 비밀번호 저장에는 MD5든 SHA-256이든 단순 해시가 아니라 Argon2id·bcrypt·scrypt 같은 전용 함수를 서버에서 써야 합니다.',
  },
  {
    q: 'SHA-1은 사용해도 되나요?',
    a: '<strong>새로 만드는 보안 기능에는 쓰지 마세요.</strong> 2017년 Google·CWI가 SHAttered로 같은 SHA-1 값을 가진 PDF 두 개를 만들었고, 2020년에는 앞부분을 공격자가 고를 수 있는 chosen-prefix 충돌까지 실용화됐습니다. 미국 NIST는 2022년 12월 SHA-1 퇴역을 발표하고 2030년 12월 31일까지 SHA-2·SHA-3로 교체하라고 권고했습니다. 주요 브라우저는 이미 SHA-1 서명 TLS 인증서를 신뢰하지 않습니다. 예외적으로 <strong>HMAC-SHA1</strong>은 충돌 공격의 영향을 직접 받지 않아 레거시 API에 남아 있고, Git 커밋 ID도 SHA-1 기반이지만 Git은 SHA-256 저장소 형식을 도입해 전환을 진행 중입니다.',
  },
  {
    q: '비밀번호를 SHA-256으로 해싱하면 안 되나요?',
    a: '<strong>안 됩니다.</strong> SHA-256은 빠르게 계산되도록 설계돼 GPU로 초당 수십억 번 대입할 수 있고, 솔트가 없으면 같은 비밀번호는 항상 같은 해시가 되어 미리 계산한 표(레인보 테이블)로 바로 역추적됩니다. 비밀번호 저장용으로는 일부러 느리고 메모리를 많이 쓰게 만든 <strong>Argon2id</strong>(2015년 Password Hashing Competition 우승작 Argon2의 권장 변형), <strong>scrypt</strong>, <strong>bcrypt</strong>를 서버에서 사용하세요. bcrypt·Argon2 라이브러리는 솔트를 자동 생성해 결과 문자열에 함께 담지만, scrypt는 Node <code>crypto.scrypt</code>·Python <code>hashlib.scrypt</code>처럼 솔트를 인자로 받는 API가 많아 무작위 솔트를 직접 만들어 해시와 함께 저장해야 합니다. 브라우저에서 해시해 서버로 보내는 방식은 그 해시값이 곧 비밀번호 역할을 하게 되므로 서버 측 처리를 대신하지 못합니다.',
  },
  {
    q: 'HMAC과 일반 해시의 차이는?',
    a: '일반 해시(SHA-256)는 <strong>메시지만 있으면 누구나</strong> 같은 값을 만들 수 있어 변조자가 해시도 새로 계산해 붙이면 그만입니다. <strong>HMAC</strong>은 비밀키를 섞어 <code>HMAC(K, m) = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m))</code>(RFC 2104)으로 계산하므로 키를 모르면 올바른 값을 만들 수 없습니다. 그래서 웹훅·API 요청이 정말 상대방에게서 왔는지, 중간에 바뀌지 않았는지 확인하는 데 씁니다. GitHub·Slack·Stripe 웹훅, AWS Signature V4, JWT HS256이 모두 HMAC-SHA256을 씁니다. 본 도구의 HMAC 탭에는 이 중 4개 서비스의 알고리즘·출력 형식 프리셋이 있습니다.',
  },
  {
    q: '같은 파일인데 다른 사이트·명령과 해시가 달라요',
    a: '해시는 <strong>바이트 단위</strong>로 계산되므로, 보기엔 같아도 바이트가 1개만 달라도 전혀 다른 값이 나옵니다. 흔한 원인은 ① 줄바꿈 차이(Windows CRLF vs macOS·Linux LF), ② 파일 앞의 UTF-8 BOM(EF BB BF), ③ 인코딩 차이(EUC-KR로 저장한 한글은 UTF-8과 바이트가 다름), ④ <code>echo</code>가 끝에 붙이는 줄바꿈(<code>echo -n</code> 또는 <code>printf</code>로 비교), ⑤ 알고리즘을 잘못 고름, ⑥ 다운로드 중 손상입니다. 반대로 <strong>파일 이름·수정 시각 같은 메타데이터는 해시에 들어가지 않습니다</strong> — 이름만 바꾼 파일은 해시가 같습니다. 본 도구의 파일 해시는 같은 파일에 대한 <code>sha256sum</code>·<code>shasum</code>·<code>certutil</code> 결과와 일치해야 정상입니다.',
  },
  {
    q: '큰 파일도 해시할 수 있나요?',
    a: '가능하지만 브라우저 메모리에 달려 있습니다. SHA 계열은 Web Crypto API가 스트리밍(조각 입력)을 지원하지 않아 <strong>파일 전체를 메모리에 올린 뒤 한 번에</strong> 계산하고, MD5는 자체 구현이라 <strong>8MB 조각</strong>으로 나눠 읽습니다. 100MB가 넘는 파일은 시간·메모리 경고를 표시합니다. 기기 메모리와 브라우저 한도에 따라 수 GB 파일은 실패할 수 있으니, OS 설치 이미지 같은 대용량은 <code>sha256sum file.iso</code>(Linux)·<code>shasum -a 256 file.iso</code>(macOS)·<code>Get-FileHash file.iso</code>(PowerShell)를 권장합니다.',
  },
  {
    q: 'SRI 해시(integrity)는 어떻게 만드나요?',
    a: 'SRI(Subresource Integrity)는 CDN에서 받아 오는 스크립트·스타일시트가 바뀌었으면 브라우저가 실행을 거부하게 하는 W3C 표준입니다. 값은 <code>sha384-</code> + 파일 바이트의 SHA-384를 <strong>표준 Base64</strong>로 인코딩한 문자열입니다. 파일 탭에 스크립트 파일을 넣으면 SRI 행에 그대로 나옵니다. 텍스트 탭에서 SHA-384 + Base64로 만들 수도 있지만, 붙여넣으면서 줄바꿈(CRLF→LF)이 바뀌면 실제 파일과 값이 달라지므로 파일 탭이 안전합니다. 사용할 때는 script·link 태그에 <code>integrity="sha384-…"</code>와 <code>crossorigin="anonymous"</code> 속성을 함께 추가합니다 — 다른 출처(CDN)의 파일은 CORS 응답 헤더가 있어야 검증이 되고, 없으면 로드 자체가 실패합니다.',
  },
  {
    q: 'hex와 Base64 중 무엇을 써야 하나요?',
    a: '같은 해시를 다르게 적은 것뿐이라 보안 강도는 같습니다. <strong>hex</strong>는 바이트당 2글자(SHA-256 = 64자)로 CLI·체크섬 파일·대부분의 웹훅 헤더(GitHub·Slack·Stripe)가 씁니다. <strong>Base64</strong>는 3바이트를 4글자로 적어 hex보다 약 1/3 짧고(SHA-256 = 44자), SRI의 <code>integrity</code> 값이 이 형식입니다. <strong>Base64URL</strong>은 <code>+</code>→<code>-</code>, <code>/</code>→<code>_</code>로 바꾸고 끝의 <code>=</code>를 뺀 형태(SHA-256 = 43자)로 JWT 서명(RFC 7515)이 씁니다. 비교할 때는 형식부터 맞추세요 — hex 값과 Base64 값은 같은 해시여도 문자열로는 절대 일치하지 않습니다.',
  },
  {
    q: '해시 충돌(collision)이란 무엇인가요?',
    a: '서로 다른 두 입력이 같은 해시값을 내는 현상입니다. 출력 길이가 정해져 있으니 충돌은 이론상 반드시 존재하고, 안전한 해시란 <strong>그런 쌍을 찾는 데 드는 계산이 비현실적으로 큰</strong> 해시를 말합니다. 256비트 해시는 생일 공격 기준 약 2<sup>128</sup>번 계산이 필요해 현재 기술로 불가능합니다. MD5는 2013년 발표된 개선 공격 기준 약 2<sup>18</sup>번 압축함수 계산이면 충돌 쌍을 만들 수 있고, SHA-1의 SHAttered는 약 2<sup>63</sup>번(단일 GPU로 약 110년 분량)의 계산이 들었습니다. 충돌이 가능하다는 것은 <strong>누군가 의도적으로 두 파일을 만들어 바꿔치기</strong>할 수 있다는 뜻이지, 다운로드 중 우연히 손상된 파일이 원본과 같은 해시를 낼 수 있다는 뜻은 아닙니다.',
  },
]

/* 테스트 벡터 — 본 도구의 hashText(= 텍스트 탭과 같은 함수)로 빌드 시 계산 */
const VECTORS: { label: string; input: string; enc: TextEncoding; point: string }[] = [
  { label: '빈 문자열', input: '', enc: 'utf8', point: '입력이 비어도 해시는 나온다 — 파일 해시가 이 값이면 빈 파일이거나 읽기에 실패한 것' },
  { label: 'abc', input: 'abc', enc: 'utf8', point: 'FIPS 180 예제 입력. 구현을 점검할 때 쓰는 기준값' },
  { label: 'abc + LF', input: 'abc\n', enc: 'utf8', point: 'echo abc | sha256sum 의 결과. echo가 줄바꿈을 붙인다' },
  { label: 'abc + CRLF', input: 'abc\r\n', enc: 'utf8', point: 'Windows 줄바꿈. 0D 한 바이트 차이로 완전히 다른 값' },
  { label: 'BOM + abc', input: '\uFEFFabc', enc: 'utf8', point: '“UTF-8 (BOM)”으로 저장한 파일. 앞에 EF BB BF가 붙는다' },
  { label: '한글 (UTF-8)', input: '한글', enc: 'utf8', point: '한글 한 글자 = UTF-8 3바이트' },
  { label: '한글 (ASCII 모드)', input: '한글', enc: 'ascii', point: 'ASCII 밖 문자가 모두 ?(3F)로 바뀌어 "??"와 같은 해시가 된다' },
]

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join(' ')

const SAFETY_TEXT = { safe: '안전', integrity: '무결성 전용', unsafe: '사용 금지' } as const
const SAFETY_COLOR = { safe: 'var(--success)', integrity: 'var(--warning)', unsafe: 'var(--danger)' } as const

export default async function HashPage() {
  const vectors = await Promise.all(VECTORS.map(async (v) => {
    const bytes = encodeText(v.input, v.enc)
    const sha256 = formatHash(await hashText(v.input, 'sha256', v.enc), 'hex_lower')
    return { ...v, bytesHex: toHex(bytes), byteLen: bytes.byteLength, sha256 }
  }))
  const abcSha256 = vectors[1].sha256
  const abcMd5 = formatHash(await hashText('abc', 'md5'), 'hex_lower')
  const HMAC_KEY = 'key'
  const HMAC_MSG = 'The quick brown fox jumps over the lazy dog'
  const hmacDemo = formatHash(await hmacSign(encodeText(HMAC_KEY, 'utf8'), encodeText(HMAC_MSG, 'utf8'), 'sha256'), 'hex_lower')

  return (
    <ToolPage width={880} slug="/tools/dev/hash">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />해시 생성기
      </h1>
      <p className="tp-lead">
        MD5·SHA-1·SHA-256·SHA-512 동시 + HMAC 서명·파일 무결성·SRI 해시. <strong style={{ color: 'var(--text)' }}>전부 브라우저 처리</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="MD5 RFC 1321 · SHA-1/SHA-2 NIST FIPS 180-4 · HMAC RFC 2104 · SRI W3C 권고 · NIST SHA-1 퇴역 발표(2022.12)"
        sources={[
          { label: 'NIST FIPS 180-4 (SHS)', href: 'https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.180-4.pdf' },
          { label: 'NIST SHA-1 퇴역 발표', href: 'https://www.nist.gov/news-events/news/2022/12/nist-retires-sha-1-cryptographic-algorithm' },
          { label: 'RFC 2104 (HMAC)', href: 'https://www.rfc-editor.org/rfc/rfc2104' },
          { label: 'W3C Subresource Integrity', href: 'https://www.w3.org/TR/SRI/' },
        ]}
      />

      <Callout tone="warn" title="MD5·SHA-1은 보안 용도에 쓰지 마세요">
        두 알고리즘은 충돌 공격이 실증돼 비밀번호 저장·디지털 서명·인증서에 쓸 수 없습니다. 파일 손상 확인(체크섬)처럼 비보안 용도로만 쓰고,
        비밀번호는 서버에서 Argon2id·bcrypt·scrypt로 처리하세요. 모든 계산은 브라우저에서 이뤄지며 입력은 외부로 전송되지 않습니다.
        분야별 안전 안내는 <Link href="/disclaimer#dev">면책조항</Link> 참고.
      </Callout>

      <HashClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>텍스트</strong> — 입력하는 즉시(200ms 디바운스) MD5·SHA-1·SHA-256·SHA-384·SHA-512 다섯 값을 동시에 보여 줍니다. 출력 형식(hex 소문자·대문자, Base64, Base64URL)과 인코딩(UTF-8·ASCII)을 고를 수 있습니다.</li>
        <li><strong>파일</strong> — 끌어다 놓거나 선택하면 다섯 해시와 SRI 값을 계산합니다. 배포처가 공개한 체크섬을 &lsquo;예상 해시&rsquo;에 붙여넣으면 일치 여부를 바로 표시합니다.</li>
        <li><strong>HMAC</strong> — 비밀키와 메시지로 HMAC-SHA1/256/384/512 서명을 만듭니다. 키는 텍스트·hex·Base64로 넣을 수 있고, GitHub·Slack·AWS·JWT 프리셋이 알고리즘과 출력 형식을 맞춰 줍니다.</li>
        <li><strong>가이드</strong> — 알고리즘 비교, 안전성 등급, SRI 사용법, CLI 명령 대조표.</li>
      </ol>
      <p className="g-note">
        출력 형식·인코딩·HMAC 알고리즘 같은 옵션만 이 브라우저에 저장합니다. 입력 텍스트·비밀키·파일은 저장하지도, 서버로 보내지도 않습니다(MD5는 자체 JavaScript 구현, 나머지는 브라우저 내장 Web Crypto API).
      </p>

      {/* 2. 알고리즘 비교 — ALGORITHMS에서 계산 */}
      <h2 className="g-h2">해시 알고리즘 비교 — 출력 길이로 알고리즘 알아보기</h2>
      <p className="g-p">
        해시는 입력 길이와 상관없이 <strong>항상 같은 길이</strong>로 나옵니다. 그래서 받은 체크섬이 어떤 알고리즘인지 모르면 글자 수로 먼저 가늠할 수 있습니다 —
        hex 32자면 MD5, 40자면 SHA-1, 64자면 SHA-256입니다. 본 도구의 파일 검증도 붙여넣은 값의 길이가 고른 알고리즘과 다르면 &lsquo;변조&rsquo;가 아니라
        &lsquo;알고리즘 불일치&rsquo;로 따로 알려 줍니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr style={ROW}>
              {['알고리즘', '출력', 'hex', 'Base64', 'Base64URL', '안전성', '주 용도'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {ALGORITHMS.map((a) => {
              const bytes = a.bits / 8
              return (
                <tr key={a.id} style={ROW}>
                  <th scope="row" style={{ ...TD, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{a.name}</th>
                  <td style={TD}>{a.bits}비트</td>
                  <td style={TD}>{a.hexLen}자</td>
                  <td style={TD}>{4 * Math.ceil(bytes / 3)}자</td>
                  <td style={TD}>{Math.ceil((bytes * 4) / 3)}자</td>
                  <td style={{ ...TD, color: SAFETY_COLOR[a.safety], fontWeight: 600 }}>{SAFETY_TEXT[a.safety]}</td>
                  <td style={{ ...TD, color: 'var(--muted)' }}>{a.useCases}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        길이는 본 도구의 알고리즘 정의에서 계산한 값입니다(Base64는 끝의 = 패딩 포함, Base64URL은 패딩 제외). SHA-384는 SHA-512를 다른 초깃값으로 계산해 앞 384비트만 쓰는 변형이라,
        64비트 CPU에서 SHA-256보다 빠른 경우가 많습니다 — 다만 SHA 전용 명령어(SHA-NI 등)가 있는 최신 CPU에서는 SHA-256이 더 빠를 수 있습니다.
      </p>

      {/* 3. 테스트 벡터 */}
      <h2 className="g-h2">보이는 글자가 같아도 해시가 다른 이유 — 테스트 벡터</h2>
      <p className="g-p">
        해시 함수는 글자가 아니라 <strong>바이트</strong>를 읽습니다. 아래 표는 본 도구의 텍스트 해시 함수로 직접 계산한 값으로, 줄바꿈 한 글자·보이지 않는 BOM·인코딩 모드만 달라도
        결과가 완전히 바뀌는 것을 보여 줍니다(입력이 1비트만 바뀌어도 출력 비트의 약 절반이 바뀌는 &lsquo;눈사태 효과&rsquo;).
        다른 도구와 값이 다를 때는 이 표의 경우부터 의심해 보세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={ROW}>
              {['입력', '실제 바이트 (hex)', '바이트 수', 'SHA-256 앞 16자리', '포인트'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {vectors.map((v) => (
              <tr key={v.label} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.label}</th>
                <td style={{ ...TD, ...MONO }}>{v.bytesHex || '(없음)'}</td>
                <td style={TD}>{v.byteLen}</td>
                <td style={{ ...TD, ...MONO, color: 'var(--accent-ink)' }}>{v.sha256.slice(0, 16)}…</td>
                <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{v.point}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        <strong>검산용 기준값</strong> — 텍스트 탭에 <code style={CODE}>abc</code>를 입력했을 때 SHA-256이{' '}
        <code style={{ ...CODE, wordBreak: 'break-all' }}>{abcSha256}</code>, MD5가 <code style={{ ...CODE, wordBreak: 'break-all' }}>{abcMd5}</code>이면 계산이 표준과 일치합니다.
        터미널에서 같은 값을 얻으려면 <code style={CODE}>printf abc | sha256sum</code>처럼 줄바꿈 없이 넘겨야 합니다.
        EUC-KR(CP949)로 저장된 한글 파일은 한 글자가 2바이트라, 같은 문장을 UTF-8로 입력한 텍스트 탭 결과와 다릅니다 — 이럴 땐 파일 탭으로 원본 바이트를 그대로 해시하세요.
      </p>

      {/* 4. 안전성 등급 */}
      <h2 className="g-h2">안전성 등급 — 무엇에 써도 되고 무엇에 쓰면 안 되나</h2>
      <p className="g-p">
        기준은 &lsquo;누군가 <strong>일부러</strong> 같은 해시를 가진 다른 데이터를 만들 동기가 있느냐&rsquo;입니다. 공격자가 끼어들 수 있는 곳이면 충돌 저항성이 필요하고,
        우연한 손상만 걸러내면 되는 곳이면 MD5로도 충분합니다.
      </p>
      <Callout tone="warn" title="MD5·SHA-1을 쓰면 안 되는 곳">
        <ul>
          <li><strong>비밀번호 저장</strong> — 단순 해시는 SHA-256도 부적합. Argon2id·bcrypt·scrypt(서버)</li>
          <li><strong>디지털 서명·코드 서명</strong> — 충돌 쌍으로 서명을 다른 문서에 옮겨 붙일 수 있음. SHA-256 이상 + RSA/ECDSA</li>
          <li><strong>TLS 인증서</strong> — 주요 브라우저가 SHA-1 서명 인증서를 신뢰하지 않음</li>
          <li><strong>JWT 서명</strong> — JWS 표준 HMAC 알고리즘은 HS256·HS384·HS512뿐(HMAC-SHA1은 목록에 없음)</li>
        </ul>
      </Callout>
      <ul className="g-list">
        <li><strong>파일 체크섬</strong> — 다운로드 중 손상 여부 확인. 단, 체크섬 자체를 같은 서버에서 받는다면 변조까지는 막지 못하므로 배포처가 SHA-256과 서명(GPG 등)을 함께 제공하면 그쪽을 쓰세요.</li>
        <li><strong>중복 파일 찾기·캐시 키</strong> — 같은 내용을 빠르게 식별하는 용도. 충돌을 일부러 만들 사람이 없는 내부 데이터라면 MD5도 무방합니다.</li>
        <li><strong>Git 커밋 ID</strong> — SHA-1 기반(충돌 탐지 기능을 넣은 변형). Git은 SHA-256 저장소 형식을 도입해 전환 중입니다.</li>
        <li><strong>레거시 연동</strong> — 상대 시스템이 MD5·SHA-1만 받을 때. 새로 설계한다면 SHA-256 이상을 쓰세요.</li>
      </ul>
      <p className="g-note">
        알려진 충돌 공격: MD5 2004(Wang 외) · SHA-1 SHAttered 2017.02(Google·CWI) · SHA-1 chosen-prefix 2020.01. NIST는 2030년 12월 31일까지 SHA-1을 SHA-2·SHA-3로 교체하도록 권고합니다.
      </p>

      {/* 5. HMAC */}
      <h2 className="g-h2">HMAC 서명 — 서비스별 형식과 검증할 때 틀리는 곳</h2>
      <p className="g-p">
        HMAC은 비밀키와 메시지를 함께 해시해, 키를 가진 쪽만 올바른 값을 만들 수 있게 한 메시지 인증 코드입니다. 서비스마다 <strong>무엇을 서명하는지</strong>(본문만? 타임스탬프 포함?)가 달라서,
        알고리즘을 맞춰도 서명 대상 문자열이 다르면 값이 일치하지 않습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={ROW}>
              {['서비스', '알고리즘 · 형식', '전송 위치', '서명 대상'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['GitHub Webhook', 'HMAC-SHA256 · hex', 'X-Hub-Signature-256: sha256=…', '요청 본문 원문(raw body)'],
              ['Slack', 'HMAC-SHA256 · hex', 'X-Slack-Signature: v0=…', 'v0:{X-Slack-Request-Timestamp}:{본문}'],
              ['Stripe Webhook', 'HMAC-SHA256 · hex', 'Stripe-Signature: t=…,v1=…', '{t}.{본문}'],
              ['AWS Signature V4', 'HMAC-SHA256 · hex', 'Authorization 헤더', '비밀키 → 날짜 → 리전 → 서비스 → aws4_request 순으로 4번 HMAC해 만든 서명 키로 StringToSign 서명'],
              ['JWT HS256·HS384·HS512', 'HMAC-SHA256/384/512 · Base64URL', '토큰의 세 번째 부분', 'Base64URL(헤더).Base64URL(페이로드)'],
            ].map((r) => (
              <tr key={r[0]} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</th>
                <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 600 }}>{r[1]}</td>
                <td style={{ ...TD, ...MONO }}>{r[2]}</td>
                <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="g-list" style={{ marginTop: 16 }}>
        <li><strong>본문을 다시 직렬화하지 말 것</strong> — 프레임워크가 JSON을 파싱한 뒤 다시 문자열로 만들면 공백·키 순서·유니코드 이스케이프가 바뀌어 서명이 틀어집니다. 받은 원문 바이트로 계산하세요.</li>
        <li><strong>접두어·구분자 확인</strong> — GitHub은 <code style={CODE}>sha256=</code>, Slack은 <code style={CODE}>v0=</code>이 헤더 값 앞에 붙습니다. 비교 전에 떼거나, 계산 결과에 같은 접두어를 붙이세요.</li>
        <li><strong>상수 시간 비교</strong> — 문자열 <code style={CODE}>==</code> 대신 Node의 <code style={CODE}>crypto.timingSafeEqual</code>, Python의 <code style={CODE}>hmac.compare_digest</code>를 쓰면 응답 시간 차이로 서명을 추측하는 공격을 막을 수 있습니다.</li>
        <li><strong>타임스탬프 검사</strong> — Slack·Stripe는 서명에 시각을 포함합니다. 몇 분(두 서비스 모두 5분을 권장·기본값으로 안내)보다 오래된 요청을 거절해야 재전송 공격을 막습니다.</li>
      </ul>
      <p className="g-p">
        <strong>직접 확인해 보기</strong> — HMAC 탭에서 키 <code style={CODE}>{HMAC_KEY}</code>, 메시지 <code style={CODE}>{HMAC_MSG}</code>, HMAC-SHA256·hex를 고르면{' '}
        <code style={{ ...CODE, wordBreak: 'break-all' }}>{hmacDemo}</code>가 나와야 합니다(본 도구의 서명 함수로 빌드 때 계산한 값).
      </p>

      {/* 6. 파일 무결성 */}
      <h2 className="g-h2">파일 무결성 검증 — CLI 명령 대조표</h2>
      <p className="g-p">
        OS 설치 이미지나 설치 파일은 배포처가 SHA-256 값(SHA256SUMS 파일 등)을 함께 공개합니다. 내려받은 파일로 같은 값을 계산해 비교하면 손상 여부를 알 수 있습니다.
        본 도구의 파일 탭 결과는 아래 명령의 출력과 같아야 합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr style={ROW}>
              {['알고리즘', 'Linux', 'macOS', 'Windows (cmd / PowerShell)'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['MD5', 'md5sum FILE', 'md5 FILE', 'certutil -hashfile FILE MD5 / Get-FileHash FILE -Algorithm MD5'],
              ['SHA-1', 'sha1sum FILE', 'shasum -a 1 FILE', 'certutil -hashfile FILE SHA1 / Get-FileHash FILE -Algorithm SHA1'],
              ['SHA-256', 'sha256sum FILE', 'shasum -a 256 FILE', 'certutil -hashfile FILE SHA256 / Get-FileHash FILE'],
              ['SHA-512', 'sha512sum FILE', 'shasum -a 512 FILE', 'certutil -hashfile FILE SHA512 / Get-FileHash FILE -Algorithm SHA512'],
            ].map((r) => (
              <tr key={r[0]} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{r[0]}</th>
                <td style={{ ...TD, ...MONO }}>{r[1]}</td>
                <td style={{ ...TD, ...MONO }}>{r[2]}</td>
                <td style={{ ...TD, ...MONO }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        PowerShell <code style={CODE}>Get-FileHash</code>는 알고리즘을 생략하면 SHA-256으로 계산하고 대문자 hex로 출력합니다. 본 도구의 &lsquo;예상 해시&rsquo; 칸은 대소문자를 구분하지 않고,
        <code style={CODE}>sha256sum</code> 출력 한 줄(해시 + 파일명), BSD·macOS 형식(<code style={CODE}>SHA256 (file) = …</code>), 바이트 사이에 공백·콜론이 들어간 형식에서도 해시 부분만 골라 비교합니다.
        여러 파일을 한 번에 확인할 때는 터미널의 <code style={CODE}>sha256sum -c SHA256SUMS</code>가 편합니다.
      </p>

      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일 ↔ Base64' },
          { href: '/tools/dev/jwt', icon: '🔑', name: 'JWT 디코더', desc: '헤더·페이로드 클레임·만료 시각 확인' },
          { href: '/tools/dev/number-base', icon: '🔢', name: '진법 변환기', desc: '2·8·10·16진 + 비트 연산' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontSize: 22, margin: '0 0 4px' }}>{t.icon}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>{t.name}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
