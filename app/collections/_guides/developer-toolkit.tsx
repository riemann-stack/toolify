/* 상황별 가이드 — 개발자 툴킷. 인코딩 길이는 표준 식(Base64 4·⌈n/3⌉, UTF-8 퍼센트 인코딩)을 빌드 시 계산,
   로컬 LLM 메모리는 llmVramData.calcVram(가중치 + KV 캐시 + 오버헤드)으로 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcVram, MODELS, OVERHEAD_GB, QUANTS } from '@/app/tools/dev/llm-vram/llmVramData'
import { GuideSources, num, type CollectionGuide } from './shared'

const B64_SIZES = [1024, 100 * 1024, 1024 * 1024]
const b64Len = (n: number) => 4 * Math.ceil(n / 3)
const HASHES = [
  { name: 'MD5', bits: 128 },
  { name: 'SHA-1', bits: 160 },
  { name: 'SHA-256', bits: 256 },
]
const KB = (n: number) => (n >= 1024 * 1024 ? `${num(n / 1024 / 1024)}MB` : `${num(n / 1024)}KB`)
const QUANT_IDS = ['Q4_K_M', 'Q8_0', 'F16']
const CTXS = [8192, 32768]
/** 서버 기본 시간대(UTC)와 한국 표준시(KST, UTC+9, 서머타임 없음)의 차이 */
const KST_OFFSET_H = 9

function Body() {
  const ga = encodeURIComponent('가')
  const phrase = '서울 날씨'
  const model = MODELS[0]
  const vram = QUANT_IDS.map((id) => {
    const q = QUANTS.find((x) => x.id === id)
    return { id, cells: CTXS.map((ctx) => (q ? calcVram(model, q.bpw, ctx, 2) : null)) }
  })
  const cronUtcHour = 9

  return (
    <>
      <h2>왜 인코딩 → 데이터 → 토큰·스케줄 → API → 배포 순서인가</h2>
      <p>
        이 묶음은 요청 하나가 만들어져 나가는 순서를 따릅니다. 문자열을 전송 가능한 형태로 바꾸고(<Link href="/tools/dev/base64">Base64</Link>·<Link href="/tools/dev/url-encode">URL 인코딩</Link>), 본문 구조를 검증하고(<Link href="/tools/dev/json">JSON·YAML</Link>·
        <Link href="/tools/dev/regex">정규식</Link>), 인증 토큰과 실행 시각을 확인한 뒤(<Link href="/tools/dev/jwt">JWT</Link>·<Link href="/tools/dev/cron">크론</Link>), 실제 호출과 응답을 해석합니다(<Link href="/tools/dev/curl">cURL 변환</Link>·
        <Link href="/tools/dev/http-status">HTTP 상태 코드</Link>). 문제가 생겼을 때도 같은 순서로 거꾸로 짚어 가면 어느 단계에서 값이 틀어졌는지 빨리 찾을 수 있습니다.
      </p>

      <h2>인코딩하면 길이가 얼마나 늘어나나</h2>
      <DataFigure n={1} title="인코딩·해시 결과의 길이" source={<>계산: Base64 = 4 × ⌈바이트 ÷ 3⌉(패딩 포함), URL 인코딩 = UTF-8 바이트마다 %XX 3자, 해시 16진 문자열 = 비트 ÷ 4</>}>
        <table>
          <thead>
            <tr><th scope="col">입력</th><th scope="col">방식</th><th scope="col" className="r">결과 길이</th></tr>
          </thead>
          <tbody>
            {B64_SIZES.map((n) => (
              <tr key={n}><td>{KB(n)} 파일</td><td>Base64</td><td className="r">{num(b64Len(n))}자</td></tr>
            ))}
            <tr><td>한글 &lsquo;가&rsquo;</td><td>URL 인코딩</td><td className="r">{ga.length}자 ({ga})</td></tr>
            <tr><td>&lsquo;{phrase}&rsquo;</td><td>URL 인코딩</td><td className="r">{encodeURIComponent(phrase).length}자</td></tr>
            {HASHES.map((h) => (
              <tr key={h.name}><td>아무 길이</td><td>{h.name}</td><td className="r">{h.bits / 4}자(16진)</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        Base64는 원본보다 약 3분의 1 커지므로 큰 이미지를 data URI로 넣으면 문서 크기가 그만큼 늘어납니다. 한글은 UTF-8에서 한 글자가 3바이트라 URL에 넣으면 9자가 되고, 쿼리스트링 길이 제한에 생각보다 빨리 닿습니다.
        해시는 입력 길이와 상관없이 결과 길이가 고정이라, 길이가 다르면 알고리즘부터 다르다는 신호입니다.
      </p>

      <h2>로컬 LLM에 필요한 메모리</h2>
      <DataFigure n={2} title={`${model.name}의 양자화·문맥 길이별 메모리`} unit="GB · KV 캐시 F16" source={<>계산: 가중치(매개변수 × 비트 ÷ 8) + KV 캐시(2 × 레이어 × KV 헤드 × 헤드 차원 × 문맥 × 2바이트) + 오버헤드 {OVERHEAD_GB}GB — LLM 메모리 계산기와 같은 식</>}>
        <table>
          <thead>
            <tr><th scope="col">양자화</th>{CTXS.map((c) => <th key={c} scope="col" className="r">문맥 {num(c / 1024)}K</th>)}</tr>
          </thead>
          <tbody>
            {vram.map((v) => (
              <tr key={v.id}><td>{v.id}</td>{v.cells.map((c, i) => <td key={CTXS[i]} className="r">{c ? num(c.totalGB, 1) : '—'}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        같은 모델이라도 문맥 길이를 {num(CTXS[0] / 1024)}K에서 {num(CTXS[1] / 1024)}K로 늘리면 KV 캐시가 네 배가 되어 필요한 메모리가 몇 GB씩 늘어납니다. GPU 메모리가 빠듯하다면 양자화 단계를 낮추기 전에 문맥 길이부터 줄여 보는 것도 방법입니다.
        {' '}<Link href="/tools/dev/llm-vram">LLM 메모리 계산기</Link>와 <Link href="/tools/dev/token-counter">토큰 계산기</Link>로 모델과 입력 길이를 함께 맞춰 보세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>Base64·JWT를 암호화로 여기기.</strong> 둘 다 누구나 되돌릴 수 있는 인코딩입니다. JWT 페이로드는 서명만 되어 있을 뿐 내용은 그대로 읽히므로 비밀번호·개인정보를 넣으면 안 됩니다.</li>
        <li><strong>JWT exp를 밀리초로 비교하기.</strong> exp·iat는 초 단위 유닉스 시간입니다. 자바스크립트의 Date.now()는 밀리초라 1000으로 나눠 비교해야 합니다.</li>
        <li><strong>크론 시간대를 확인하지 않기.</strong> 서버가 UTC라면 &lsquo;0 {cronUtcHour} * * *&rsquo;는 한국 시각 {cronUtcHour + KST_OFFSET_H}시에 실행됩니다. 또 일(day-of-month)과 요일을 둘 다 지정하면 표준 크론은 둘 중 하나만 맞아도 실행합니다.</li>
        <li><strong>MD5·SHA-1로 비밀번호를 저장하기.</strong> 파일 무결성 확인에는 쓸 수 있어도 비밀번호 저장에는 bcrypt·Argon2처럼 느리게 설계된 전용 함수를 써야 합니다.</li>
        <li><strong>리다이렉트 코드를 대충 고르기.</strong> 301·302는 클라이언트가 POST를 GET으로 바꿀 수 있고, 308·307은 메서드를 유지합니다. API 주소를 옮길 때는 이 차이가 동작을 바꿉니다.</li>
      </ul>

      <Callout tone="warn" title="운영 비밀값은 붙여 넣지 말 것">
        이 도구들은 브라우저 안에서 계산하지만, 운영 환경의 API 키·액세스 토큰·개인 키는 어떤 웹 도구에도 붙여 넣지 않는 것을 원칙으로 삼으세요. 실수로 노출했다면 즉시 키를 폐기하고 재발급하는 것이 먼저입니다.
      </Callout>

      <GuideSources
        items={[
          { label: 'IETF RFC 4648 — Base16, Base32, Base64 Encodings', href: 'https://www.rfc-editor.org/rfc/rfc4648' },
          { label: 'IETF RFC 3986 — URI Generic Syntax(퍼센트 인코딩)', href: 'https://www.rfc-editor.org/rfc/rfc3986' },
          { label: 'IETF RFC 7519 — JSON Web Token', href: 'https://www.rfc-editor.org/rfc/rfc7519' },
          { label: 'IETF RFC 9110 — HTTP Semantics(3xx 리다이렉트)', href: 'https://www.rfc-editor.org/rfc/rfc9110' },
          { label: 'OWASP — Password Storage Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '개발 도구, 값이 틀어지는 지점 찾기', Body }
export default guide
