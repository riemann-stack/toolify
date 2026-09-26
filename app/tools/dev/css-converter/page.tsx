import Link from 'next/link'
import CssConverterClient from './CssConverterClient'
import { convertLength, type LenCfg } from './cssConverterUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/css-converter',
  title: 'CSS 단위 변환기 — px·rem·em·clamp()·aspect-ratio 계산',
  description: 'px↔rem·em·vw 변환 + clamp() 유동 타이포·aspect-ratio 코드 자동 생성. 62.5% 트릭의 함정, 100vh 모바일 문제(dvh·svh), line-height unitless, Figma→CSS 치트시트까지.',
  keywords: ['CSS단위변환기', 'px rem 변환', 'clamp생성기', 'aspect-ratio계산기', 'line-height변환', 'letter-spacing변환', 'CSS계산기', 'rem변환기'],
})

const codeBox: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '14px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text)',
  lineHeight: 1.8,
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
}

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const tableWrap: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', minWidth: 480 }
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const badge = (ok: boolean): React.CSSProperties => ({
  background: `color-mix(in srgb, var(${ok ? '--success' : '--danger'}) 12%, transparent)`,
  color: `var(${ok ? '--success' : '--danger'})`,
  border: `1px solid color-mix(in srgb, var(${ok ? '--success' : '--danger'}) 30%, transparent)`,
  borderRadius: 'var(--radius-xs)',
  padding: '2px 8px',
  fontSize: '12px',
  fontWeight: 600,
})

/* 계산 예시·조견표 — 손으로 적지 않고 도구와 같은 convertLength()로 빌드 시 계산 */
const round4 = (n: number) => String(+n.toFixed(4))
const DEFAULT_CFG: LenCfg = { rootFontSize: 16, parentFontSize: 16, viewportWidth: 1440, viewportHeight: 900, baseValue: 100 }
const EX_FONT = convertLength(24, 'px', 'font-size', DEFAULT_CFG)
const EX_WIDTH = convertLength(24, 'px', 'width', DEFAULT_CFG)
const exVal = (rows: { unit: string; value: number }[], u: string) => round4(rows.find((r) => r.unit === u)?.value ?? NaN)

const REM_ROWS: [number, string][] = [
  [4, '간격 스케일 최소 단위 — Tailwind 1단위와 동일'],
  [8, '기본 간격'],
  [12, '캡션·라벨'],
  [13, '본문 보조'],
  [14, '모바일 본문'],
  [16, '루트 기준값 — 브라우저 관행 기본'],
  [20, '소제목·리드 문장'],
  [24, 'h3·아이콘'],
  [32, 'h2'],
  [40, '대형 제목'],
  [48, '히어로 타이틀'],
]
const REM_TABLE = REM_ROWS.map(([px, use]) => ({ px, rem: exVal(convertLength(px, 'px', 'font-size', DEFAULT_CFG), 'rem'), use }))

/* clamp() 선호값 — 이 페이지 clamp() 생성기(ClampTab, root 16px·rem 출력)와 같은 선형 보간식·반올림 */
function clampCode(minPx: number, maxPx: number, minVw = 360, maxVw = 1440, root = 16): string {
  const slope = (maxPx - minPx) / (maxVw - minVw)
  const intercept = minPx - slope * minVw
  const intRem = +(intercept / root).toFixed(4)
  const svw = +(slope * 100).toFixed(4)
  const pref = intRem !== 0 ? `${intRem}rem + ${svw}vw` : `${svw}vw`
  return `clamp(${+(minPx / root).toFixed(4)}rem, ${pref}, ${+(maxPx / root).toFixed(4)}rem)`
}
const TYPE_SCALE: [string, number, number][] = [['h1', 28, 42], ['h2', 22, 32], ['h3', 18, 24], ['본문', 14, 16], ['캡션', 12, 13]]
const TYPE_ROWS = TYPE_SCALE.map(([step, min, max]) => ({ step, range: `${min} → ${max}px`, code: clampCode(min, max) }))
const CLAMP_EX = clampCode(16, 32)

const FAQ_LD = [
  { q: 'rem과 em의 차이는 무엇인가요?', a: '<strong>rem</strong>은 루트 요소(html)의 font-size를, <strong>em</strong>은 그 요소 자신의 font-size를 기준으로 합니다(font-size 속성에 쓴 em만 부모 글꼴 기준). 그래서 em을 중첩된 컴포넌트의 font-size에 쓰면 1.2em 안의 1.2em이 1.44배가 되는 식으로 누적됩니다. 문서 전체에서 같은 크기가 필요하면 rem, 버튼 안 아이콘·여백처럼 &ldquo;이 요소 글자 크기에 비례&rdquo;해야 하면 em이 맞습니다.' },
  { q: 'line-height에 단위 없는 값이 권장되는 이유는?', a: '<code>line-height: 1.5</code>처럼 <strong>단위 없는 값은 숫자 그대로 상속</strong>되어 자식마다 자기 font-size에 곱해집니다. 반면 em이나 %는 부모에서 px로 계산이 끝난 값이 상속되므로, 부모 20px·1.5em(=30px) 아래의 12px 자식도 줄 간격 30px을 물려받아 줄 사이가 지나치게 벌어집니다. CSS 2.1 명세의 line-height 정의(숫자는 지정값 그대로 상속, %는 계산된 길이로 상속)가 이 차이의 근거입니다.' },
  { q: 'clamp()에서 vw 단위만 쓰면 안 되나요?', a: '<code>font-size: 2vw</code>처럼 vw만 쓰면 상·하한이 없어 360px 화면에서는 7.2px, 2560px 화면에서는 51.2px처럼 극단적인 값이 됩니다. 또 vw는 브라우저 확대(Ctrl +)에 반응하지 않아 저시력 사용자가 글자를 키울 수 없습니다. <strong>clamp(최솟값, rem + vw, 최댓값)</strong>처럼 선호값에 rem을 섞고 양쪽을 rem으로 묶으면 두 문제가 함께 해결됩니다 — 이 변환기의 clamp() 생성기가 만드는 형태입니다.' },
  { q: 'letter-spacing에 % 단위를 쓸 수 있나요?', a: '현행 CSS Text Module Level 4는 letter-spacing에 % 값을 허용하고, 기준을 <strong>그 요소의 font-size</strong>로 정합니다. 즉 CSS의 <code>5%</code>는 <code>0.05em</code>과 같고, font-size의 %로 표시하는 Figma 자간과도 기준이 같습니다. 다만 Chrome은 145 버전부터 지원해(Firefox·Safari는 먼저 지원) 그보다 오래된 브라우저에서는 선언이 통째로 무시됩니다. 폭넓은 호환이 필요하면 같은 값을 em으로 쓰는 편이 안전합니다 — 예: Figma 자간 −2% → <code>letter-spacing: -0.02em</code>.' },
  { q: 'aspect-ratio와 padding-top 방식 중 어느 것을 써야 하나요?', a: '지금은 <strong>aspect-ratio</strong>가 기본입니다. Chrome 88·Firefox 89·Safari 15부터 지원해 현행 브라우저에서는 문제가 없고, 코드가 한 줄이며 자식 요소를 absolute로 띄울 필요도 없습니다. padding-top 방식은 %가 <strong>부모 너비</strong> 기준이라는 성질(16:9면 9 ÷ 16 = 56.25%)을 이용한 우회로, 인터넷 익스플로러나 아주 오래된 웹뷰를 지원해야 할 때만 필요합니다. 이 계산기는 두 방식의 코드를 모두 만들어 줍니다.' },
]

export default function CssConverterPage() {
  return (
    <ToolPage width={760} slug="/tools/dev/css-converter">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />CSS 단위 변환기
      </h1>
      <p className="tp-lead">
        px·rem·em 변환 + <strong style={{ color: 'var(--text)' }}>clamp()·aspect-ratio 자동 생성</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="W3C CSS Values and Units 4(rem·vw·dvh·clamp)·CSS Text 4(letter-spacing)·CSS Box Sizing 4(aspect-ratio)·CSS 2.1(line-height) 정의 기준"
        sources={[
          { label: 'W3C CSS Values and Units Level 4', href: 'https://www.w3.org/TR/css-values-4/' },
          { label: 'W3C CSS Text Module Level 4', href: 'https://www.w3.org/TR/css-text-4/' },
          { label: 'W3C CSS Box Sizing Level 4', href: 'https://www.w3.org/TR/css-sizing-4/' },
          { label: 'W3C CSS 2.1 line-height', href: 'https://www.w3.org/TR/CSS21/visudet.html#propdef-line-height' },
        ]}
      />

      <CssConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 핵심 공식 */}
        <div>
          <h2 className="g-h2">CSS 단위 핵심 공식 참조표</h2>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>변환</th>
                  <th scope="col" style={headCell}>공식</th>
                  <th scope="col" style={headCell}>예시 (root 16px)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['px → rem', 'px ÷ rootFontSize',       '24px = 1.5rem'],
                  ['rem → px', 'rem × rootFontSize',      '1.5rem = 24px'],
                  ['px → em',  'px ÷ parentFontSize',     '24px = 1.5em'],
                  ['px → %',   '(px ÷ 기준) × 100 — font-size는 부모 글꼴, width 등은 부모 너비', 'font-size 24px ÷ 16px = 150%'],
                  ['px → vw',  '(px ÷ viewportWidth) × 100', '24px ÷ 1440px ≈ 1.67vw'],
                  ['px → vh',  '(px ÷ viewportHeight) × 100', '24px ÷ 900px ≈ 2.67vh'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)', whiteSpace: 'nowrap' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)' }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            변환기는 어떤 단위로 입력하든 <strong>먼저 px로 바꾼 뒤</strong>(입력값 × 원래 단위의 기준) 각 단위의 기준으로 다시 나눕니다. 그래서 기준값 패널의 root·parent·viewport·부모 크기를 바꾸면 모든 행이 한꺼번에 다시 계산됩니다.
            주의할 곳은 %입니다 — 같은 24px도 <strong>어느 속성이냐</strong>에 따라 기준이 달라집니다. 기본값(root·parent 16px, 뷰포트 1440×900, 부모 크기 100px)으로 계산하면
            font-size 24px은 {exVal(EX_FONT, 'rem')}rem · {exVal(EX_FONT, '%')}% · {exVal(EX_FONT, 'vw')}vw · {exVal(EX_FONT, 'vh')}vh이고,
            같은 24px을 width로 보면 rem·vw 값은 그대로지만 %는 부모 크기 기준이라 {exVal(EX_WIDTH, '%')}%가 됩니다.
          </p>
        </div>

        {/* 2. px → rem 조견표 */}
        <div>
          <h2 className="g-h2">px → rem 조견표 (root 16px)</h2>
          <p className="g-p">
            아래 표는 root font-size 16px 기준의 <span style={mono}>px ÷ 16</span> 산술입니다. 한 가지 주의 — <strong>16px은 CSS 표준이 정한 수치가 아닙니다</strong>. W3C 명세(CSS Values Level 4)는 rem을 &ldquo;루트 요소 font-size와 같다&rdquo;로만 정의하고 숫자를 정하지 않으며, 16px은 주요 브라우저의 기본 글꼴 크기 관행이라 사용자 설정으로 바뀔 수 있습니다. rem을 쓰는 이유가 정확히 이 지점입니다 — 사용자가 브라우저 설정에서 기본 글꼴을 20px로 키우면 px로 고정한 텍스트는 그대로지만, rem으로 쓴 텍스트는 20 ÷ 16 = 1.25배로 함께 커져 사용자의 선택을 존중합니다.
          </p>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>px</th>
                  <th scope="col" style={headCell}>rem</th>
                  <th scope="col" style={headCell}>흔한 쓰임</th>
                </tr>
              </thead>
              <tbody>
                {REM_TABLE.map((row, i, arr) => (
                  <tr key={row.px}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row.px}px</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)' }}>{row.rem}rem</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            13px = 0.8125rem처럼 암산이 지저분한 값도 표 그대로 쓰면 됩니다. 루트 font-size가 16px이 아닌 프로젝트라면 위 변환기에서 root 값을 바꿔 다시 계산하세요.
          </p>
        </div>

        {/* 3. rem vs em */}
        <div>
          <h2 className="g-h2">rem vs em 완전 비교</h2>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>항목</th>
                  <th scope="col" style={headCell}>rem</th>
                  <th scope="col" style={headCell}>em</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['기준',      'root(html) font-size', '자기 font-size (font-size 속성에서는 부모)'],
                  ['상속',      '일관성 유지',           '중첩 시 누적되어 복잡'],
                  ['사용처',    '전역 크기 조절',        '컴포넌트 내부 상대 크기'],
                  ['추천 상황', 'font-size, spacing',    '아이콘, 버튼 내부 padding'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 변환기의 em 계산은 &lsquo;parent font-size&rsquo;를 기준으로 합니다. font-size에 쓰는 em이라면 그대로 맞고, padding·margin처럼 다른 속성에 쓰는 em은 명세상 <strong>그 요소 자신의 font-size</strong>가 기준이므로 parent 칸에 해당 요소의 글자 크기를 넣고 계산하세요.
          </p>
        </div>

        {/* 4. 62.5% 트릭의 함정 */}
        <div>
          <h2 className="g-h2">px→rem 62.5% 트릭(1rem = 10px)의 함정</h2>
          <p className="g-p">
            html에 <strong>font-size: 62.5%</strong>를 선언하면 브라우저 기본 16px × 0.625 = <strong>10px</strong>가 되어 1.6rem = 16px, 2.4rem = 24px처럼 암산이 쉬워집니다. 문제는 rem이 <strong>문서 전체에 적용되는 전역 기준</strong>이라는 점입니다. Shadow DOM 내부의 rem까지 예외 없이 바뀌므로, 1rem = 16px를 전제로 만들어진 서드파티 코드가 전부 62.5% 크기로 줄어듭니다.
          </p>
          <div style={codeBox}>
{`html { font-size: 62.5%; }    /* 1rem = 10px */

/* 내 코드 — 의도대로 */
h1   { font-size: 3.2rem; }   /* 32px ✅ */

/* 1rem = 16px 전제의 서드파티 — 함께 축소 */
.btn { font-size: 1rem; }     /* 기대 16px → 실제 10px ❌ */
.p-4 { padding: 1rem; }       /* Tailwind 4단위, 기대 16px → 10px ❌ */`}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            타이포그래피·여백 기본값을 rem으로 정의한 Bootstrap 5, spacing 1단위 = 0.25rem인 Tailwind CSS, rem을 쓰는 임베드 위젯(댓글·결제창 등)이 대표적인 충돌 지점입니다. 게다가 이 트릭은 프로젝트 전체를 한 번에 바꾸는 일괄 전환만 가능해, 이미 rem이 섞인 코드베이스에 점진적으로 도입할 수 없습니다. 62.5%가 고정 <span style={mono}>font-size: 10px</span> 선언보다 나은 점은 사용자의 브라우저 글꼴 크기 설정에 비례해 확대된다는 것 하나인데, 루트를 100%로 두어도 같은 이점을 얻습니다. 결론적으로 외부 CSS를 전부 통제할 수 없다면 루트를 100%(16px)로 유지하고 px ÷ 16 나눗셈은 변환기에 맡기는 편이 안전합니다 — 이 변환기의 root font-size 기본값이 16인 이유입니다.
          </p>
        </div>

        {/* 5. Tailwind와 rem */}
        <div>
          <h2 className="g-h2">Tailwind와 rem — spacing scale·임의값</h2>
          <p className="g-p">
            Tailwind의 spacing 유틸리티는 rem 기반입니다. v3 공식 문서의 명문은 <strong>&ldquo;spacing 1단위 = 0.25rem, 일반적인 브라우저 기본값에서 4px&rdquo;</strong> — v4는 같은 결과를 테마 변수 <span style={mono}>--spacing: 0.25rem</span>에 숫자를 곱하는 방식으로 만듭니다(2026-07 v3·v4 문서 기준). 단위가 rem이므로 위에서 본 &lsquo;사용자 글꼴 설정 존중&rsquo;이 유틸리티 전체에 자동으로 적용됩니다.
          </p>
          <div style={codeBox}>
{`/* spacing: 1단위 = 0.25rem (root 16px일 때 4px) */
p-1 = 0.25rem =  4px      p-4 = 1rem   = 16px
p-2 = 0.5rem  =  8px      p-6 = 1.5rem = 24px
p-3 = 0.75rem = 12px      p-8 = 2rem   = 32px

/* v4 내부 구현 — 테마 변수 × 숫자 */
--spacing: 0.25rem;
.p-4 { padding: calc(var(--spacing) * 4); }`}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            스케일에 없는 값은 대괄호 <strong>임의값(arbitrary value)</strong> 문법으로 즉석 생성합니다. 공식 문서 예시는 <span style={mono}>top-[117px]</span>·<span style={mono}>text-[22px]</span>이고, <span style={mono}>w-[13px]</span>처럼 어느 유틸리티에나 같은 문법이 통하며 <span style={mono}>lg:top-[344px]</span>처럼 반응형·상태 수정자와도 결합됩니다. 다만 공식 문서가 임의값을 소개하는 맥락 자체가 &ldquo;배경 이미지를 딱 맞는 자리에 놓기 위해 top: 117px이 정말로 필요할 때&rdquo; — 즉 1회용 탈출구입니다. 같은 값이 여러 곳에서 반복된다면 임의값을 복붙하기보다 테마 변수로 등록해 일반 유틸리티처럼 쓰는 편이 유지보수에 낫습니다.
          </p>
        </div>

        {/* 6. clamp() 가이드 */}
        <div>
          <h2 className="g-h2">clamp() 완전 가이드</h2>
          <p className="g-p">
            <strong>clamp(최솟값, 선호값, 최댓값)</strong>은 뷰포트 크기에 따라 값을 부드럽게 변화시키면서도 안전한 상·하한을 보장합니다. 생성기는 두 점(최소 뷰포트에서 최솟값, 최대 뷰포트에서 최댓값)을 지나는 직선을 구해 선호값을 &lsquo;rem + vw&rsquo; 형태로 적습니다.
          </p>
          <div style={codeBox}>
{`/* 선호값 계산 (선형 보간) */
slope     = (maxPx - minPx) / (maxVw - minVw)
intercept = minPx - slope × minVw
preferred = \`\${intercept/16}rem + \${slope*100}vw\`

/* 결과 예시 — 360~1440px, 16→32px */
${CLAMP_EX}
  → 360px 화면:  16px  (최솟값)
  → 1440px 화면: 32px  (최댓값)
  → 그 사이:     부드럽게 변화`}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            검산: 기울기는 (32 − 16) ÷ (1440 − 360) = 0.0148…이므로 뷰포트가 100px 넓어질 때마다 글자는 1.4815px씩 커지고(그래서 선호값의 vw 계수가 기울기 × 100 = 1.4815vw), 절편은 16 − 0.0148… × 360 = 10.667px = 0.6667rem입니다. 뷰포트 900px이라면 10.667 + 0.014815 × 900 ≈ 24px로, 정확히 16과 32의 중간값이 나옵니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            <span style={badge(true)}>Chrome 79+</span>
            <span style={badge(true)}>Firefox 75+</span>
            <span style={badge(true)}>Safari 13.1+</span>
            <span style={badge(false)}>IE 미지원</span>
          </div>
        </div>

        {/* 7. 타이포 스케일 실전 */}
        <div>
          <h2 className="g-h2">타이포 스케일 실전 — h1~캡션 clamp() 세트</h2>
          <p className="g-p">
            위 선형 보간 공식을 실제 타이포 단계에 적용한 세트입니다. 뷰포트 기준은 360~1440px — 이 페이지 clamp() 생성기의 기본값과 같아서, 같은 px를 입력하면 아래와 동일한 코드가 나옵니다. CSS Values Level 4 정의대로 <strong>clamp(MIN, VAL, MAX)는 max(MIN, min(VAL, MAX))와 같은 값</strong>이므로, 선호값(가운데 vw 식)이 어떤 값이 되어도 결과는 항상 MIN~MAX 사이로 잘립니다. 이 등가식을 그대로 계산해 보면, 실수로 MIN을 MAX보다 크게 지정했을 때 바깥쪽 max()가 마지막에 적용되어 MIN이 이긴다는 것도 도출됩니다.
          </p>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>단계</th>
                  <th scope="col" style={headCell}>크기 (360→1440px)</th>
                  <th scope="col" style={headCell}>clamp() 코드</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_ROWS.map((row, i, arr) => (
                  <tr key={row.step}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row.step}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, whiteSpace: 'nowrap' }}>{row.range}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>{row.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            단계가 내려갈수록 vw 계수(기울기)가 작아지는 점에 주목하세요 — 본문·캡션은 360→1440px 전 구간에서 각각 2px·1px만 변합니다. 변화 폭이 이 정도로 작은 단계는 clamp() 없이 고정 rem으로 두는 선택도 실용적입니다. 큰 제목일수록 유동의 이득이 크고, 작은 글자일수록 고정이 단순합니다.
          </p>
        </div>

        {/* 8. 100vh 문제와 dvh·svh·lvh */}
        <div>
          <h2 className="g-h2">100vh 모바일 주소창 문제 — dvh·svh·lvh</h2>
          <p className="g-p">
            모바일 브라우저의 주소창은 스크롤에 따라 나타났다 사라지지만, 기존 <strong>100vh는 주소창이 접힌 가장 큰 화면 기준</strong>으로 계산되는 경우가 대부분입니다. 그래서 첫 화면에서 100vh 요소의 하단 — 고정 버튼·CTA — 이 주소창에 가려지는 문제가 생깁니다. CSS Values Level 4는 이를 해결하는 세 가지 뷰포트 높이 단위를 추가했습니다.
          </p>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>단위</th>
                  <th scope="col" style={headCell}>기준</th>
                  <th scope="col" style={headCell}>적합한 곳</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['100svh', '주소창이 모두 표시된 가장 작은 화면', '첫 화면 히어로·하단 고정 버튼 — 절대 가려지지 않음'],
                  ['100lvh', '주소창이 접힌 가장 큰 화면',          '배경·장식 레이어 — 기존 모바일 100vh와 사실상 동일'],
                  ['100dvh', '지금 실제로 보이는 높이(실시간 변동)', '풀스크린 모달·채팅 입력창 — 스크롤 중 리사이즈 주의'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            기존 vh를 dvh로 바꿔야 하는 경우는 <strong>스크롤 중에도 요소가 항상 보이는 영역과 일치해야 할 때</strong>뿐입니다. dvh는 주소창이 움직일 때마다 다시 계산되므로 대형 레이아웃이나 font-size에 쓰면 스크롤 중 요소가 계속 늘었다 줄었다 합니다. 첫 화면 잘림만 문제라면 svh가 더 안정적입니다. px→vh 공식(px ÷ viewportHeight × 100)은 세 단위에 그대로 적용되며 기준 높이만 달라집니다.
          </p>
          <div style={codeBox}>
{`/* 구형 브라우저 폴백 — 아랫줄이 지원되면 덮어씀 */
.hero { height: 100vh; height: 100dvh; }`}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            <span style={badge(true)}>Chrome 108+</span>
            <span style={badge(true)}>Firefox 101+</span>
            <span style={badge(true)}>Safari 15.4+</span>
          </div>
          <Callout tone="warn" title="100vw는 스크롤바 폭을 포함합니다">
            가로 방향에도 비슷한 함정이 있습니다. CSS Values Level 4는 루트의 overflow가 스크롤바를 항상 띄우는 값(<span style={mono}>overflow: scroll</span> 등)이 아니면 <strong>뷰포트 단위를 스크롤바가 없다고 가정하고</strong> 계산하도록 정합니다.
            그래서 스크롤바가 자리를 차지하는 데스크톱 환경(윈도우의 기본 스크롤바 등)에서 <span style={mono}>width: 100vw</span> 요소는 스크롤바 폭만큼 넘쳐 가로 스크롤이 생깁니다. 전체 폭이 필요하면 100vw 대신 <span style={mono}>width: 100%</span>를 쓰세요.
          </Callout>
        </div>

        {/* 9. aspect-ratio vs padding-top */}
        <div>
          <h2 className="g-h2">aspect-ratio vs padding-top trick</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '10px' }}>현행 방법 (aspect-ratio)</p>
              <div style={codeBox}>{`.box { aspect-ratio: 16 / 9; }`}</div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
                <strong style={{ color: 'var(--success)' }}>장점</strong>: 직관적, 코드 단순, 자식 배치 자유<br />
                <strong style={{ color: 'var(--danger)' }}>단점</strong>: IE 미지원
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '10px' }}>구형 방법 (padding-top)</p>
              <div style={codeBox}>{`.wrapper {
  position: relative;
  padding-top: 56.25%;
}
.content {
  position: absolute;
  inset: 0;
}`}</div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
                <strong style={{ color: 'var(--success)' }}>장점</strong>: 모든 브라우저 지원<br />
                <strong style={{ color: 'var(--danger)' }}>단점</strong>: 코드 복잡, absolute 포지셔닝 필요
              </p>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            padding-top 방식이 동작하는 이유는 CSS에서 세로 padding의 %도 <strong>부모의 너비</strong>를 기준으로 계산되기 때문입니다. 16:9라면 9 ÷ 16 × 100 = 56.25%, 4:3이라면 75%, 21:9라면 약 42.86%입니다. aspect-ratio는 너비나 높이 중 하나가 정해져 있을 때만 나머지를 계산하므로, 둘 다 고정값을 주면 비율이 무시된다는 점도 기억해 두세요.
          </p>
        </div>

        {/* 10. line-height unitless */}
        <div>
          <h2 className="g-h2">line-height unitless 권장 이유</h2>
          <p className="g-p">
            <strong>unitless</strong>(단위 없는) line-height는 자식 요소에 상속될 때 <strong>자식의 font-size</strong>로 재계산됩니다. 반면 em·%는 계산된 px값이 그대로 상속되어 의도와 달라질 수 있습니다.
          </p>
          <div style={codeBox}>
{`/* 부모 */
.parent { font-size: 20px; line-height: 1.5; }
/* 자식 */
.child  { font-size: 12px; }

/* unitless (1.5)   → 자식 line-height = 12px × 1.5 = 18px  ✅ */
/* em (1.5em)       → 자식 line-height = 20px × 1.5 = 30px  ❌ (부모 값 그대로 상속) */
/* % (150%)         → 자식 line-height = 20px × 1.5 = 30px  ❌ */`}
          </div>
        </div>

        {/* 11. Figma → CSS */}
        <div>
          <h2 className="g-h2">Figma → CSS 변환 치트시트</h2>
          <div className="tableScroll" style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>Figma 표기</th>
                  <th scope="col" style={headCell}>CSS 변환</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['letter-spacing 5%',               'letter-spacing: 0.05em'],
                  ['line-height 150%',                'line-height: 1.5'],
                  ['font 16px · line-height 24px',    'line-height: 1.5 (24 ÷ 16)'],
                  ['width ratio 16:9',                'aspect-ratio: 16/9'],
                  ['corner 8',                        'border-radius: 8px'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)' }}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            Figma의 자간·행간은 font-size 대비 %로 표시되므로 CSS에서는 em(자간)이나 단위 없는 숫자(행간)로 옮기면 글자 크기를 바꿔도 비율이 유지됩니다. 행간을 px로 지정한 디자인(예: 16px 글자에 24px)은 나눗셈 결과를 단위 없이 쓰는 것이 위 line-height 절의 이유로 가장 안전합니다.
          </p>
        </div>

        <Faq items={FAQ_LD} />

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/color',     name: '색상 코드 변환기',   desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/base64',    name: 'Base64 인코더',       desc: '텍스트 ↔ Base64' },
              { href: '/tools/dev/json',      name: 'JSON 포맷터',         desc: '정렬·압축·검증' },
              { href: '/tools/art/charcount', name: '글자수 세기',         desc: '실시간 카운트' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
