import Link from 'next/link'
import NumberBaseClient from './NumberBaseClient'
import { parseBig, toBase, padBits, toUnsigned, applyOp, unsignedMax, signedRange, type Base, type BitWidth } from './numberBaseUtils'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/number-base',
  title: '진법 변환기 — 2진수·8진수·10진수·16진수·비트·ASCII',
  description: '2·8·10·16진수 변환 + 비트 시각화·2의 보수·ASCII·비트 연산. 파일 시그니처 HEX 덤프 읽기·IPv4 서브넷·IEEE 754 부동소수점까지 실무 가이드 수록.',
  keywords: ['진법변환기', '2진수', '8진수', '10진수', '16진수', '진법변환', '비트연산', 'ASCII', '2의보수', 'binary', 'hex', '진법계산', '비트마스크'],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-mono)' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }
const code: React.CSSProperties = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }
const monoBox: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '18px 20px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text)',
  lineHeight: 2,
  overflowX: 'auto',
}

/* 입력 해석 예시 — 도구와 같은 parseBig()/toBase()로 빌드 시 계산 */
const INPUT_EXAMPLES: { input: string; base: Base }[] = [
  { input: '0xFF', base: 16 },
  { input: '1111 0000', base: 2 },
  { input: '1010_1010', base: 2 },
  { input: '#FF8800', base: 16 },
  { input: '0o755', base: 8 },
  { input: '18446744073709551615', base: 10 },
]
const INPUT_ROWS = INPUT_EXAMPLES.map(({ input, base }) => {
  const n = parseBig(input, base)
  return {
    input, base,
    dec: n === null ? '—' : n.toString(),
    bin: n === null ? '—' : toBase(n, 2),
    hex: n === null ? '—' : toBase(n, 16),
  }
})
const BIG = parseBig('18446744073709551615', 10)
const BIG_AS_NUMBER = BIG === null ? '' : String(Number(BIG))

/* 2의 보수·시프트 예시 — padBits/toUnsigned/applyOp */
const TC_ROWS = [127, 5, -1, -5, -128].map((v) => {
  const n = BigInt(v)
  const u = toUnsigned(n, 8)
  return { v, bits: padBits(n, 8), unsigned: u.toString(), hex: u.toString(16).toUpperCase().padStart(2, '0') }
})
const SHIFT_TOOL = applyOp(BigInt(-8), BigInt(1), 'RSHIFT', 8)
const SHIFT_OVERFLOW = applyOp(BigInt(200), BigInt(1), 'LSHIFT', 8)

/* 비트 폭별 범위 — unsignedMax/signedRange로 정확한 값 계산 */
const WIDTHS: BitWidth[] = [8, 16, 32, 64]
const fmtBig = (n: bigint) => n.toLocaleString('ko-KR')
const WIDTH_ROWS = WIDTHS.map((w) => ({
  w,
  umax: fmtBig(unsignedMax(w)),
  hex: unsignedMax(w).toString(16).toUpperCase(),
  smin: fmtBig(signedRange(w).min),
  smax: fmtBig(signedRange(w).max),
}))

const FAQ_LD = [
  {
    q: '왜 16진수를 자주 사용하나요?',
    a: '16 = 2⁴라서 <strong>16진수 한 자리가 정확히 2진수 4자리</strong>에 대응하기 때문입니다. 1바이트(8비트)는 16진수 두 자리로 딱 떨어지므로, 메모리 주소·색상 코드(#RRGGBB)·HEX 덤프·해시값처럼 바이트 단위 데이터를 사람이 읽을 때 표준처럼 쓰입니다. <code>11111111</code>보다 <code>0xFF</code>가 짧고, 자리를 4비트씩 끊어 읽으면 암산 없이 2진수로 되돌릴 수 있습니다(F = 1111, 8 = 1000 → 0xF8 = 11111000).',
  },
  {
    q: '2의 보수는 왜 사용하나요?',
    a: '음수를 비트로 표현하는 방식 중 회로가 가장 단순하기 때문입니다. ① 0의 표현이 하나뿐이고(부호+절댓값·1의 보수 방식은 +0과 −0이 따로 생김), ② 덧셈 회로 하나로 뺄셈까지 처리하며(a − b = a + (−b)), ③ 부호를 바꾸는 방법이 "비트 반전 후 +1"로 간단합니다. 8비트에서 −5는 5(00000101)를 반전(11111010)한 뒤 1을 더한 11111011이고, 같은 비트를 부호 없이 읽으면 251(= 256 − 5)입니다. 현대 CPU와 대부분의 언어가 정수에 이 방식을 씁니다.',
  },
  {
    q: 'ASCII와 유니코드의 차이는 무엇인가요?',
    a: 'ASCII는 1963년 미국 표준으로 처음 제정되고 1967년 개정에서 소문자가 추가되어 지금의 <strong>7비트, 128자</strong>(제어 문자 33개 + 출력 문자 95개)가 된 문자 집합입니다. 유니코드는 전 세계 문자를 하나의 번호 체계로 모은 표준으로, 2025년 9월 공개된 Unicode 17.0 기준 <strong>159,801자</strong>를 정의합니다(최근에는 매년 9월 새 버전이 나오며 글자 수가 늘어납니다). 유니코드의 U+0000~U+007F는 ASCII와 번호가 같아 호환되며, 한글 완성형 음절은 U+AC00~U+D7A3에 11,172자(초성 19 × 중성 21 × 종성 28)가 배치되어 있습니다.',
  },
  {
    q: '비트 연산은 언제 사용하나요?',
    a: '① <strong>플래그</strong>: 여러 on/off 옵션을 정수 하나에 담고 OR로 켜고 AND로 확인, ② <strong>마스킹</strong>: 특정 비트만 추출(<code>x &amp; 0x0F</code>), ③ <strong>권한</strong>: 리눅스 파일 권한 755는 8진수 한 자리씩 rwx 3비트, ④ <strong>색상·바이너리 포맷</strong>: <code>(color &gt;&gt; 16) &amp; 0xFF</code>로 빨강 채널 분리, ⑤ <strong>체크섬·해시</strong>: XOR 누적. 곱셈·나눗셈을 시프트로 바꾸는 최적화는 요즘 컴파일러가 알아서 하므로, 가독성을 해치면서까지 직접 쓸 이유는 거의 없습니다.',
  },
  {
    q: '0.1 + 0.2가 0.30000000000000004로 나오는데 버그인가요?',
    a: '버그가 아니라 <strong>IEEE 754 부동소수점 표준의 정상 동작</strong>입니다. 10진수 0.1은 2진수로 무한 반복 소수(0.000110011…)여서 64비트에 담는 순간 미세한 반올림 오차가 생깁니다. 실무 회피법: ① 금액은 원 단위 정수로 계산, ② 1 부근 값의 비교는 <code>Math.abs(a - b) &lt; Number.EPSILON</code>(큰 수는 허용 오차를 값 크기에 비례시켜야 정확), ③ 화면 표시 단계에서만 <code>toFixed()</code> 사용. 참고로 0.5·0.25처럼 분모가 2의 거듭제곱인 소수는 오차 없이 정확하게 저장됩니다.',
  },
  {
    q: '16진수에서 A~F는 무엇을 의미하나요?',
    a: '16진수는 한 자리에 0~15를 담아야 하는데 숫자 기호는 0~9뿐이라 알파벳을 빌려 <strong>A=10, B=11, C=12, D=13, E=14, F=15</strong>로 씁니다. 예를 들어 <code>0xFF = 15 × 16 + 15 = 255</code>입니다. 대문자와 소문자는 같은 값이며, 이 변환기는 결과를 대문자로 표시하고 입력은 둘 다 받습니다.',
  },
]

export default function NumberBasePage() {
  return (
    <ToolPage width={760} slug="/tools/dev/number-base">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />진법 변환기
      </h1>
      <p className="tp-lead">
        2·8·10·16진 변환 + 비트 시각화 + <strong style={{ color: 'var(--text)' }}>2의 보수·ASCII·비트 연산</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="정수는 임의 정밀도(BigInt)로 계산 · 부동소수점은 IEEE 754-2019, 문자 코드는 ASCII(RFC 20)·Unicode 17.0, 서브넷은 CIDR(RFC 4632) 기준"
        sources={[
          { label: 'IEEE 754-2019 부동소수점 표준', href: 'https://standards.ieee.org/standard/754-2019.html' },
          { label: 'Unicode 17.0', href: 'https://www.unicode.org/versions/Unicode17.0.0/' },
          { label: 'RFC 20 ASCII', href: 'https://www.rfc-editor.org/rfc/rfc20' },
          { label: 'RFC 4632 CIDR', href: 'https://www.rfc-editor.org/rfc/rfc4632' },
          { label: 'W3C PNG 명세(파일 시그니처)', href: 'https://www.w3.org/TR/png/' },
        ]}
      />

      <NumberBaseClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 0. 입력 규칙과 계산 방식 ── */}
        <div>
          <h2 className="g-h2">이 변환기의 입력 규칙과 계산 방식</h2>
          <p className="g-p">
            진법 변환 탭은 입력을 먼저 정리합니다 — 앞뒤·중간 공백과 밑줄(_)을 지우고, 선택한 진법에 맞는 접두사(<code style={code}>0x</code>·<code style={code}>0b</code>·<code style={code}>0o</code>)와 16진수의 <code style={code}>#</code>을 떼어 냅니다.
            그래서 코드에서 복사한 <code style={code}>0xFF</code>, 4비트씩 띄어 쓴 <code style={code}>1111 0000</code>, 색상 코드 <code style={code}>#FF8800</code>을 그대로 붙여 넣어도 됩니다. 음수 부호는 10진수 입력에서만 받습니다.
            계산은 자바스크립트 Number가 아니라 <strong>BigInt(임의 정밀도 정수)</strong>로 하므로 2⁵³을 넘는 값도 한 자리도 틀리지 않습니다. 아래 표는 이 도구의 파싱 함수로 계산한 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>입력</th>
                  <th scope="col" style={th}>선택 진법</th>
                  <th scope="col" style={thR}>10진수</th>
                  <th scope="col" style={th}>16진수</th>
                  <th scope="col" style={th}>2진수</th>
                </tr>
              </thead>
              <tbody>
                {INPUT_ROWS.map((r, i) => (
                  <tr key={r.input} style={rowStyle(i)}>
                    <td style={{ ...tdMono, whiteSpace: 'nowrap', fontWeight: 700 }}>{r.input}</td>
                    <td style={td}>{r.base}진수</td>
                    <td style={tdR}>{r.dec}</td>
                    <td style={{ ...tdMono, color: 'var(--accent-ink)' }}>{r.hex}</td>
                    <td style={{ ...tdMono, fontSize: '12px', color: 'var(--muted)', wordBreak: 'break-all' }}>{r.bin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            마지막 행은 64비트 부호 없는 정수의 최댓값(2⁶⁴ − 1)입니다. 같은 값을 자바스크립트 Number로 바꾸면 <code style={code}>{BIG_AS_NUMBER}</code>이 되어 끝자리가 달라집니다 —
            Number는 IEEE 754 배정밀도라 2⁵³(9,007,199,254,740,992)을 넘는 정수를 정확히 담지 못하기 때문입니다. 데이터베이스의 64비트 ID나 해시값을 다룰 때 이 차이로 값이 바뀌는 사고가 흔합니다.
          </p>
        </div>

        {/* ── 1. 실무 HEX 덤프 읽기 ── */}
        <div>
          <h2 className="g-h2">
            실무 HEX 덤프 읽기 — 파일 시그니처(매직 넘버)
          </h2>
          <p className="g-p">
            확장자를 지워도 파일 종류를 알아낼 수 있는 이유는, 대부분의 파일 포맷이 <strong>첫머리 몇 바이트에 고유한 식별자(매직 넘버)</strong>를
            규격으로 못 박아 두기 때문입니다. 업로드 파일의 확장자 위조 검사, 다운로드가 중간에 깨졌는지 확인, 리눅스 <code style={code}>file</code> 명령의
            포맷 판별이 전부 이 원리로 동작합니다. 16진수 읽기가 실무에서 가장 자주 쓰이는 곳이 바로 이 HEX 덤프입니다.
          </p>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['포맷', '시그니처 (HEX)', 'ASCII로 읽으면'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'PNG',  s: '89 50 4E 47 0D 0A 1A 0A', a: '.PNG.... — "PNG" 문자 + 전송 손상 감지용 바이트' },
                  { f: 'JPEG', s: 'FF D8 FF',                a: 'SOI 마커 (JFIF는 FF D8 FF E0, EXIF는 FF D8 FF E1)' },
                  { f: 'ZIP',  s: '50 4B 03 04',             a: '"PK.." — DOCX·XLSX·APK·JAR도 ZIP 기반이라 동일' },
                  { f: 'PDF',  s: '25 50 44 46 2D',          a: '"%PDF-"' },
                  { f: 'GIF',  s: '47 49 46 38',             a: '"GIF8" (GIF87a·GIF89a)' },
                  { f: 'ELF',  s: '7F 45 4C 46',             a: '".ELF" — 리눅스 실행 파일' },
                ].map((r, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.f}</td>
                    <td style={{ ...tdMono, whiteSpace: 'nowrap' }}>{r.s}</td>
                    <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}><strong>직접 확인하는 절차</strong></p>
          <ul className="g-list">
            <li>macOS·리눅스: 터미널에서 <code style={code}>xxd 파일명 | head -1</code> — 첫 16바이트가 HEX와 ASCII로 나란히 출력됩니다</li>
            <li>윈도우: HxD 같은 헥스 에디터로 열어 첫 줄을 위 표와 대조하면 됩니다</li>
            <li>PNG의 첫 바이트 <strong>89</strong>를 위 변환기에 넣으면 <strong>10001001</strong> — 최상위 비트가 1인 비(非)ASCII 값입니다. 7비트 채널로 잘못 전송되면 이 비트가 깎여 시그니처가 깨지므로, 손상을 즉시 알아채도록 PNG 규격이 일부러 고른 값입니다. 뒤따르는 0D 0A(CR LF)와 0A(LF)도 줄바꿈 변환을 감지하는 용도입니다</li>
            <li>ZIP의 <strong>PK</strong>(50 4B)는 PKZIP 개발자 필 카츠(Phil Katz)의 이니셜입니다</li>
          </ul>
        </div>

        {/* ── 2. 진법 간 관계 ── */}
        <div>
          <h2 className="g-h2">
            진법 간 단축 변환 관계
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>2진수 ↔ 16진수 (가장 자주)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong>2진수 4자리 = 16진수 1자리</strong>
                <br />0000 = 0 / 0001 = 1 / 1010 = A / 1111 = F
                <br />8비트(1바이트) = 16진수 2자리 (예: 0xFF)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-sports)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-sports-ink)', fontWeight: 700, marginBottom: 8 }}>2진수 ↔ 8진수</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong>2진수 3자리 = 8진수 1자리</strong>
                <br />000 = 0 / 111 = 7
                <br />Unix 권한(rwx)에 자주 사용 (chmod 755)
              </p>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 대응 관계 덕분에 2진수를 16진수로 바꿀 때는 나눗셈이 필요 없습니다. 오른쪽 끝부터 4자리씩 끊어 각 묶음을 한 글자로 바꾸면 됩니다 — <code style={code}>1111 1000 1000 0000</code> → F·8·8·0 → <code style={code}>0xF880</code>.
            8진수는 3자리씩 끊습니다. <code style={code}>111 101 101</code> → 7·5·5 → <code style={code}>0o755</code>이고, 이것이 곧 rwx r-x r-x 권한입니다. 10진수와의 변환만 자리값 계산(또는 나눗셈 반복)이 필요하며, 이 도구의 &lsquo;계산 과정 학습&rsquo; 탭이 그 과정을 단계별로 보여 줍니다.
          </p>
        </div>

        {/* ── 3. 비트 폭 ── */}
        <div>
          <h2 className="g-h2">
            비트 폭별 표현 범위
          </h2>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>비트</th>
                  <th scope="col" style={thR}>부호 없는 최대</th>
                  <th scope="col" style={th}>16진수</th>
                  <th scope="col" style={thR}>부호 있는 최소</th>
                  <th scope="col" style={thR}>부호 있는 최대</th>
                </tr>
              </thead>
              <tbody>
                {WIDTH_ROWS.map((r, i) => (
                  <tr key={r.w} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.w}-bit ({r.w / 8}B)</td>
                    <td style={tdR}>{r.umax}</td>
                    <td style={{ ...tdMono, fontSize: '12px' }}>0x{r.hex}</td>
                    <td style={tdR}>{r.smin}</td>
                    <td style={tdR}>{r.smax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            부호 있는 범위가 음수 쪽으로 하나 더 긴 것(−128 ~ 127)은 2의 보수에서 0이 양수 쪽 자리를 하나 차지하기 때문입니다.
            자주 쓰는 2의 거듭제곱은 2⁸ = 256(1바이트), 2¹⁰ = 1,024(1KiB), 2¹⁶ = 65,536(포트 번호 0~65,535, 유니코드 기본 다국어 평면), 2²⁰ = 1,048,576(1MiB), 2³² = 4,294,967,296(IPv4 주소 전체 개수)입니다.
          </p>
        </div>

        {/* ── 4. IPv4·서브넷 ── */}
        <div>
          <h2 className="g-h2">
            IPv4 주소·서브넷을 진법으로 읽기
          </h2>
          <p className="g-p">
            <strong>192.168.0.1</strong> 같은 IP 주소는 사실 32비트 2진수 하나를 8비트씩 네 토막 내어 10진수로 적은 것입니다.
            서브넷 마스크와 CIDR 표기(/24)가 어렵게 느껴진다면, 진법으로 풀어서 보는 것이 가장 빠른 이해법입니다.
          </p>
          <div style={monoBox}>
            <div><span style={{ color: 'var(--muted)' }}># 192.168.0.1 을 32비트로 분해</span></div>
            <div>192.168.0.1 = <span style={{ color: 'var(--accent-ink)' }}>11000000.10101000.00000000.00000001</span></div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># /24 = 앞 24비트가 네트워크, 뒤 8비트가 호스트</span></div>
            <div>255.255.255.0 = <span style={{ color: 'var(--cat-health-ink)' }}>11111111.11111111.11111111</span>.<span style={{ color: 'var(--danger)' }}>00000000</span></div>
          </div>
          <div className="tableScroll" style={{ marginTop: 12 }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['CIDR', '서브넷 마스크', '전체 주소', '사용 가능 호스트'].map((h, i) => (
                    <th scope="col" key={i} style={i < 2 ? th : thR}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '/24', m: '255.255.255.0',   t: '256', h: '254' },
                  { c: '/25', m: '255.255.255.128', t: '128', h: '126' },
                  { c: '/26', m: '255.255.255.192', t: '64',  h: '62' },
                  { c: '/28', m: '255.255.255.240', t: '16',  h: '14' },
                  { c: '/30', m: '255.255.255.252', t: '4',   h: '2' },
                ].map((r, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...tdMono, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.c}</td>
                    <td style={tdMono}>{r.m}</td>
                    <td style={tdR}>{r.t}</td>
                    <td style={tdR}>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="왜 2ⁿ − 2인가">
            호스트 비트가 전부 0인 주소는 네트워크 자체를, 전부 1인 주소는 브로드캐스트를 가리키므로 장비에 배정할 수 없습니다. &quot;같은 서브넷인가?&quot; 판정도 결국 비트 연산입니다 —
            <strong> IP AND 마스크</strong>의 결과가 서로 같으면 같은 네트워크입니다. 예를 들어 /25에서 192.168.0.130은 마지막 옥텟 130 = 10000010의 최상위 비트가 1이므로
            192.168.0.128~255 쪽 서브넷에 속합니다. (점대점 링크용 /31은 RFC 3021에 따라 예외적으로 두 주소를 모두 씁니다.)
          </Callout>
        </div>

        {/* ── 5. 2의 보수 ── */}
        <div>
          <h2 className="g-h2">
            2의 보수 (Two&apos;s Complement)
          </h2>
          <p className="g-p">
            컴퓨터가 음수를 비트로 표현하는 표준 방식입니다. 규칙은 &ldquo;양수의 비트를 모두 뒤집고 1을 더한다&rdquo; 하나뿐이고, 결과를 부호 없이 읽으면 <strong>2ⁿ − |값|</strong>이 됩니다.
            아래 8비트 예시는 변환기의 &lsquo;비트 표현·연산&rsquo; 탭에 같은 값을 넣어 확인할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={thR}>부호 있는 값</th>
                  <th scope="col" style={th}>8비트 2의 보수</th>
                  <th scope="col" style={thR}>부호 없이 읽으면</th>
                  <th scope="col" style={th}>16진수</th>
                </tr>
              </thead>
              <tbody>
                {TC_ROWS.map((r, i) => (
                  <tr key={r.v} style={rowStyle(i)}>
                    <td style={tdR}>{r.v}</td>
                    <td style={{ ...tdMono, color: r.v < 0 ? 'var(--danger)' : 'var(--accent-ink)', fontWeight: 700 }}>{r.bits}</td>
                    <td style={tdR}>{r.unsigned}</td>
                    <td style={tdMono}>0x{r.hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            최상위 비트(MSB)가 1이면 음수입니다. 같은 <code style={code}>11111011</code>이 부호 있는 정수로는 −5, 부호 없는 정수(<code style={code}>uint8</code>)로는 251인 것처럼, <strong>비트 자체에는 부호 정보가 없고 해석 방식이 값을 정한다</strong>는 점이 핵심입니다.
            C·Java에서 부호 있는 바이트를 다른 정수형으로 옮길 때 0xFB가 251이 아니라 −5가 되는(부호 확장) 버그가 여기서 생깁니다.
          </p>
        </div>

        {/* ── 6. IEEE 754 부동소수점 ── */}
        <div>
          <h2 className="g-h2">
            IEEE 754 부동소수점 — 0.1 + 0.2 ≠ 0.3인 이유
          </h2>
          <p className="g-p">
            브라우저 콘솔에 <code style={code}>0.1 + 0.2</code>를 입력하면
            <strong> 0.30000000000000004</strong>가 나옵니다. 버그가 아니라 소수를 2진수 비트로 저장하는
            IEEE 754 표준의 정상 동작입니다. 1/3을 10진수로 정확히 적을 수 없듯이(0.3333…), 분모에 5가 들어 있는 0.1(= 1/10)은
            2진수로 무한 반복 소수가 되어 유한한 비트에 담는 순간 반올림 오차가 생깁니다.
          </p>
          <div style={monoBox}>
            <div><span style={{ color: 'var(--muted)' }}># 10진수 0.1 → 2진수: 0011 이 무한 반복</span></div>
            <div>0.1 = <span style={{ color: 'var(--accent-ink)' }}>0.000110011001100110011...</span>₂</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 64비트에 잘라 담긴 실제 값 (반올림 오차)</span></div>
            <div>0.1 → <span style={{ color: 'var(--danger)' }}>0.1000000000000000055511151231...</span></div>
            <div>0.1 + 0.2 → <span style={{ color: 'var(--danger)' }}>0.30000000000000004</span></div>
          </div>
          <div className="tableScroll" style={{ marginTop: 12 }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['형식', '부호', '지수', '가수(유효숫자)', '유효 십진 자릿수'].map((h, i) => (
                    <th scope="col" key={i} style={i === 0 ? th : thR}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: 'float32 (단정밀도)', s: '1비트', e: '8비트',  m: '23비트', d: '약 7자리' },
                  { t: 'float64 (배정밀도)', s: '1비트', e: '11비트', m: '52비트', d: '약 15~16자리' },
                ].map((r, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...tdMono, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.s}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.e}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.m}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}><strong>실무 대처법</strong></p>
          <ul className="g-list">
            <li>금액 계산은 부동소수점 대신 <strong>정수(원 단위)</strong>로 처리하고 표시할 때만 변환</li>
            <li>1 부근 값의 동등 비교는 === 대신 <code style={code}>Math.abs(a - b) &lt; Number.EPSILON</code> — 큰 수는 허용 오차를 값 크기에 비례시킬 것</li>
            <li>분모가 2의 거듭제곱인 소수(0.5, 0.25, 0.125)는 오차 없이 정확히 저장됨 — 0.25 + 0.25 === 0.5 는 true</li>
            <li>정수도 2⁵³ = 9,007,199,254,740,992를 넘으면 모든 정수를 표현하지 못함 — JS의 Number.MAX_SAFE_INTEGER(2⁵³ − 1)를 넘으면 BigInt 사용</li>
          </ul>
          <p className="g-note">이 변환기는 정수 전용입니다. 소수점이 있는 값의 2진 표현(부호·지수·가수 비트)을 직접 분해하는 기능은 없습니다.</p>
        </div>

        {/* ── 7. 비트 연산 활용 ── */}
        <div>
          <h2 className="g-h2">
            비트 연산 활용 가이드
          </h2>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연산', '동작', '활용 예시'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: 'AND (&)',    d: '둘 다 1일 때만 1',   u: '마스킹 — 0xFF & 0x0F = 0x0F (하위 4비트만 추출)' },
                  { o: 'OR (|)',     d: '하나라도 1이면 1',   u: '비트 설정 — 0x10 | 0x01 = 0x11 (특정 비트 ON)' },
                  { o: 'XOR (^)',    d: '다르면 1, 같으면 0', u: '토글 — 같은 값으로 두 번 XOR하면 원래 값' },
                  { o: 'NOT (~)',    d: '0↔1 반전',           u: '비트 반전, 마스크 생성 (flags & ~READ = READ 끄기)' },
                  { o: 'LSHIFT (<<)', d: '왼쪽 이동',         u: 'x << n = x × 2ⁿ (비트 폭을 넘친 상위 비트는 버려짐)' },
                  { o: 'RSHIFT (>>)', d: '오른쪽 이동',       u: '양수 x >> n = x ÷ 2ⁿ의 몫' },
                ].map((r, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...tdMono, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.o}</td>
                    <td style={td}>{r.d}</td>
                    <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 변환기의 비트 연산은 선택한 비트 폭 안에서 <strong>부호 없는 값</strong>으로 계산하고, 시프트는 빈자리를 0으로 채우는 <strong>논리 시프트</strong>입니다.
            그래서 8비트에서 −8 RSHIFT 1은 11111000을 오른쪽으로 민 01111100 = <strong>{SHIFT_TOOL.toString()}</strong>이 되고, 200 LSHIFT 1은 넘친 비트가 잘려 <strong>{SHIFT_OVERFLOW.toString()}</strong>이 됩니다(400 − 256).
            반면 자바스크립트의 <code style={code}>-8 &gt;&gt; 1</code>은 부호를 유지하는 산술 시프트라 −4, <code style={code}>-8 &gt;&gt;&gt; 1</code>은 32비트 논리 시프트라 2,147,483,644입니다. 결과를 코드와 대조할 때는 언어의 비트 폭과 시프트 종류를 먼저 맞추세요.
          </p>
          <ul className="g-list">
            <li>플래그 관리: <code style={code}>flags |= READ; if (flags &amp; READ) ...</code></li>
            <li>Linux 파일 권한: chmod 755 = 0o755 = 111 101 101 = rwxr-xr-x</li>
            <li>RGB 채널 분리: <code style={code}>r = (color &gt;&gt; 16) &amp; 0xFF</code></li>
            <li>자바스크립트의 비트 연산자는 피연산자를 <strong>32비트 정수로 잘라</strong> 계산합니다. 2³¹ 이상의 값에 <code style={code}>|</code>·<code style={code}>&amp;</code>를 쓰면 값이 바뀌므로, 큰 수는 BigInt(<code style={code}>BigInt(x) &amp; BigInt(0xFF)</code>)로 계산하세요</li>
          </ul>
        </div>

        {/* ── 8. ASCII ── */}
        <div>
          <h2 className="g-h2">
            ASCII 표준
          </h2>
          <p className="g-p">
            ASCII(American Standard Code for Information Interchange)는 1963년 미국 표준으로 처음 제정된 <strong>7비트, 128자</strong> 문자 집합입니다. 1963년판에는 소문자가 없었고, 소문자가 들어간 지금의 배치는 1967년 개정판에서 완성되었습니다(RFC 20이 옮겨 실은 것도 이 개정 배치).
            128~255번을 쓰는 &lsquo;확장 ASCII&rsquo;는 하나의 표준이 아니라 ISO 8859-1(서유럽 라틴 문자), 코드 페이지 437(도스) 등 규격마다 배정이 다릅니다.
            이 도구의 ASCII 표에서 &lsquo;확장 보기&rsquo;로 보이는 128~255는 유니코드 U+0080~U+00FF(= ISO 8859-1 배치)이며, 그중 128~159는 화면에 보이지 않는 C1 제어 문자입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { range: '0~31',   label: '제어 문자',   c: 'var(--muted)', d: 'NUL, TAB(9), LF(10), CR(13), ESC(27) 등' },
              { range: '32',     label: '공백 (SPACE)', c: 'var(--cat-finance-ink)', d: '문자열 구분' },
              { range: '48~57',  label: '숫자 0~9',     c: 'var(--cat-sports-ink)', d: 'ord(\'0\') = 48 = 0x30' },
              { range: '65~90',  label: '대문자 A~Z',   c: 'var(--accent-ink)', d: 'ord(\'A\') = 65 = 0x41' },
              { range: '97~122', label: '소문자 a~z',   c: 'var(--cat-health-ink)', d: 'ord(\'a\') = 97 (대문자 + 32)' },
              { range: '127',    label: 'DEL',          c: 'var(--danger)', d: '천공 테이프의 구멍을 모두 뚫어 글자를 지우던 흔적' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: g.c, fontWeight: 800, marginBottom: 2 }}>{g.range}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{g.label}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            대문자와 소문자의 차이가 정확히 32(= 0x20, 2진수로 여섯 번째 비트 하나)라는 점이 설계의 흔적입니다. <code style={code}>&apos;A&apos;</code>(01000001)와 <code style={code}>&apos;a&apos;</code>(01100001)는 비트 하나만 다르므로, 옛 시스템은 이 비트를 XOR로 뒤집어 대소문자를 바꿨습니다.
            숫자 문자도 &lsquo;0&rsquo;이 0x30에서 시작해 <code style={code}>문자 − 0x30</code>(또는 <code style={code}>&amp; 0x0F</code>)이 곧 숫자 값입니다.
            유니코드의 U+0000~U+007F는 ASCII와 번호가 같고, 한글 완성형 음절은 <code style={code}>U+AC00 ~ U+D7A3</code>에 11,172자(가~힣)가 들어 있습니다.
          </p>
        </div>

        {/* ── 9. 언어별 표기 ── */}
        <div>
          <h2 className="g-h2">
            프로그래밍 언어별 진법 표기
          </h2>
          <div className="tableScroll">
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['언어', '16진수', '2진수', '8진수'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { l: 'C',                h: '0xFF',    b: '0b11111111 (C23부터 표준)', o: '0377 (앞에 0)' },
                  { l: 'C++',              h: '0xFF',    b: '0b11111111 (C++14+)',       o: '0377' },
                  { l: 'Java',             h: '0xFF',    b: '0b11111111 (Java 7+)',      o: '0377' },
                  { l: 'Python 3',         h: '0xff',    b: '0b11111111',                o: '0o377 (0377은 문법 오류)' },
                  { l: 'JavaScript / TS',  h: '0xFF',    b: '0b11111111',                o: '0o377 (0377은 엄격 모드 오류)' },
                  { l: 'Rust',             h: '0xFF',    b: '0b1111_1111',               o: '0o377' },
                  { l: 'Go',               h: '0xFF',    b: '0b1111_1111 (Go 1.13+)',    o: '0o377 또는 0377' },
                  { l: 'CSS 색상',          h: '#FF0000', b: '—',                          o: '—' },
                  { l: 'HTML 문자 참조',     h: '&#x41;',  b: '—',                          o: '—' },
                  { l: 'URL 인코딩',        h: '%41',     b: '—',                          o: '—' },
                ].map((r, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.l}</td>
                    <td style={tdMono}>{r.h}</td>
                    <td style={{ ...tdMono, fontSize: 12 }}>{r.b}</td>
                    <td style={tdMono}>{r.o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            앞에 0을 붙이면 8진수가 되는 C 계열 규칙은 흔한 함정입니다 — C·Java에서 <code style={code}>010</code>은 10이 아니라 8입니다. 그래서 Python 3와 자바스크립트 엄격 모드는 이 표기를 금지하고 <code style={code}>0o</code> 접두사만 허용합니다.
            밑줄(<code style={code}>1111_1111</code>)은 Java 7·Python 3.6·Rust·Go 1.13 이상과 JS(ES2021)에서 자릿수 구분자로 쓸 수 있고, C++14와 C23은 작은따옴표(<code style={code}>0b1111&apos;1111</code>)를 씁니다.
          </p>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        <Faq items={FAQ_LD} />

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/charcount',     name: '글자수 세기',           desc: '바이트·트위터 가중치·플랫폼 한도' },
              { href: '/tools/dev/base64',        name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/dev/json',          name: 'JSON 포맷터',          desc: 'JSON 정렬·트리·TS 변환' },
              { href: '/tools/art/color',         name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', name: 'CSS 단위 변환기',         desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/edu/circuit-simulator', name: '옴의 법칙 계산기', desc: '직렬·병렬 회로 시각화' },
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
                  transition: 'border-color 0.15s',
                }}
              >
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
