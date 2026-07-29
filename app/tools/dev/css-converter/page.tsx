import Link from 'next/link'
import CssConverterClient from './CssConverterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/css-converter',
  title: 'CSS 단위 변환기 — px·rem·em·clamp()·aspect-ratio 계산',
  description: 'px·rem·em 변환 + clamp()·aspect-ratio 자동 생성. 반응형 CSS 작성 필수.',
  keywords: ['CSS단위변환기', 'px rem 변환', 'clamp생성기', 'aspect-ratio계산기', 'line-height변환', 'letter-spacing변환', 'CSS계산기', 'rem변환기'],
})

const codeBox: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '14px 16px',
  fontFamily: "'Fira Code', 'Consolas', monospace",
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

const FAQ_LD = [
              { q: 'rem과 em의 차이는 무엇인가요?', a: '<strong>rem</strong>은 root 요소(html)의 font-size를 기준으로, <strong>em</strong>은 부모 요소의 font-size를 기준으로 합니다. 중첩된 컴포넌트에서 em은 누적 계산되어 예상과 다른 결과가 나올 수 있어 <strong>일관성이 필요한 경우 rem을 권장</strong>합니다.' },
              { q: 'line-height에 unitless가 권장되는 이유는?', a: '<code>line-height: 1.5</code>처럼 <strong>단위 없는 값은 자식 요소에 상속될 때 자식의 font-size를 기준으로 재계산</strong>됩니다. 반면 em이나 %는 계산된 px값이 그대로 상속되어 자식의 font-size가 다를 때 의도와 다른 결과가 나올 수 있습니다.' },
              { q: 'clamp()에서 vw 단위만 쓰면 안 되나요?', a: '<code>font-size: 2vw</code>처럼 vw만 쓰면 최솟값·최댓값 제한이 없어 매우 좁거나 넓은 화면에서 글자가 너무 작거나 커집니다. <strong>clamp(min, preferred, max)</strong>로 안전한 범위를 설정하는 것이 권장됩니다.' },
              { q: 'letter-spacing에 % 단위를 쓸 수 있나요?', a: '과거 CSS2에는 길이 단위만 허용됐지만, 현행 CSS Text Module Level 4에 % 값이 추가되어 <strong>Safari·Firefox는 지원하고 Chrome도 도입을 진행 중</strong>입니다. 다만 브라우저별 지원 차이가 남아 있고, CSS의 %와 디자인 툴(Figma)의 %는 계산 기준이 다를 수 있어 실무에서는 여전히 em 단위가 안전합니다. 예: Figma 자간 5% → 0.05em. 1em = font-size와 같은 크기이므로 font-size가 변경되어도 자간 비율이 자동으로 유지됩니다.' },
              { q: 'aspect-ratio와 padding-top 방식 중 어느 것을 써야 하나요?', a: 'IE를 지원하지 않는다면 <strong>aspect-ratio가 훨씬 직관적</strong>이고 권장됩니다. IE 지원이 필요하거나 레거시 코드를 다룬다면 padding-top 방식을 사용하세요. 이 계산기에서 두 방법의 코드를 모두 확인하고 복사할 수 있습니다.' },
            ]

export default function CssConverterPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />CSS 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        px·rem·em 변환 + <strong style={{ color: 'var(--text)' }}>clamp()·aspect-ratio 자동 생성</strong>.
      </p>

      <CssConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 핵심 공식 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>CSS 단위 핵심 공식 참조표</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  ['px → %',   '(px ÷ base) × 100',       '24px ÷ 16px = 150%'],
                  ['px → vw',  '(px ÷ viewportWidth) × 100', '24px ÷ 1440px ≈ 1.67vw'],
                  ['px → vh',  '(px ÷ viewportHeight) × 100', '24px ÷ 900px ≈ 2.67vh'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: "'Fira Code', monospace" }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. rem vs em */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>rem vs em 완전 비교</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>항목</th>
                  <th scope="col" style={headCell}>rem</th>
                  <th scope="col" style={headCell}>em</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['기준',      'root(html) font-size', '부모 요소 font-size'],
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
        </div>

        {/* 3. 62.5% 트릭의 함정 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>px→rem 62.5% 트릭(1rem = 10px)의 함정</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            html에 <strong style={{ color: 'var(--text)' }}>font-size: 62.5%</strong>를 선언하면 브라우저 기본 16px × 0.625 = <strong style={{ color: 'var(--text)' }}>10px</strong>가 되어 1.6rem = 16px, 2.4rem = 24px처럼 암산이 쉬워집니다. 문제는 rem이 <strong style={{ color: 'var(--text)' }}>문서 전체에 적용되는 전역 기준</strong>이라는 점입니다. Shadow DOM 내부의 rem까지 예외 없이 바뀌므로, 1rem = 16px를 전제로 만들어진 서드파티 코드가 전부 62.5% 크기로 줄어듭니다.
          </p>
          <div style={codeBox}>
{`html { font-size: 62.5%; }    /* 1rem = 10px */

/* 내 코드 — 의도대로 */
h1   { font-size: 3.2rem; }   /* 32px ✅ */

/* 1rem = 16px 전제의 서드파티 — 함께 축소 */
.btn { font-size: 1rem; }     /* 기대 16px → 실제 10px ❌ */
.p-4 { padding: 1rem; }       /* Tailwind 4단위, 기대 16px → 10px ❌ */`}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '12px' }}>
            타이포그래피·여백 기본값을 rem으로 정의한 Bootstrap 5, spacing 1단위 = 0.25rem인 Tailwind CSS, rem을 쓰는 임베드 위젯(댓글·결제창 등)이 대표적인 충돌 지점입니다. 게다가 이 트릭은 프로젝트 전체를 한 번에 바꾸는 일괄 전환만 가능해, 이미 rem이 섞인 코드베이스에 점진적으로 도입할 수 없습니다. 62.5%가 고정 <span style={{ fontFamily: "'Fira Code', monospace" }}>font-size: 10px</span> 선언보다 나은 점은 사용자의 브라우저 글꼴 크기 설정에 비례해 확대된다는 것 하나인데, 루트를 100%로 두어도 같은 이점을 얻습니다. 결론적으로 외부 CSS를 전부 통제할 수 없다면 루트를 100%(16px)로 유지하고 px ÷ 16 나눗셈은 변환기에 맡기는 편이 안전합니다 — 이 변환기의 root font-size 기본값이 16인 이유입니다.
          </p>
        </div>

        {/* 4. clamp() 가이드 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>clamp() 완전 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>clamp(최솟값, 선호값, 최댓값)</strong>은 뷰포트 크기에 따라 값을 부드럽게 변화시키면서도 안전한 상·하한을 보장합니다.
          </p>
          <div style={codeBox}>
{`/* 선호값 계산 (선형 보간) */
slope     = (maxPx - minPx) / (maxVw - minVw)
intercept = minPx - slope × minVw
preferred = \`\${intercept/16}rem + \${slope*100}vw\`

/* 결과 예시 */
clamp(1rem, 0.5rem + 2.22vw, 2rem)
  → 360px 화면:  16px  (최솟값)
  → 1440px 화면: 32px  (최댓값)
  → 그 사이:     부드럽게 변화`}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Chrome 79+</span>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Firefox 75+</span>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Safari 13.1+</span>
            <span style={{ background: 'rgba(220,38,38,0.15)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>IE ❌</span>
          </div>
        </div>

        {/* 5. 100vh 문제와 dvh·svh·lvh */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>100vh 모바일 주소창 문제 — dvh·svh·lvh</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            모바일 브라우저의 주소창은 스크롤에 따라 나타났다 사라지지만, 기존 <strong style={{ color: 'var(--text)' }}>100vh는 주소창이 접힌 가장 큰 화면 기준</strong>으로 계산되는 경우가 대부분입니다. 그래서 첫 화면에서 100vh 요소의 하단 — 고정 버튼·CTA — 이 주소창에 가려지는 문제가 생깁니다. CSS Values Level 4는 이를 해결하는 세 가지 뷰포트 높이 단위를 추가했습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: "'Fira Code', monospace", fontWeight: 700, color: 'var(--accent)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '12px', marginBottom: '12px' }}>
            기존 vh를 dvh로 바꿔야 하는 경우는 <strong style={{ color: 'var(--text)' }}>스크롤 중에도 요소가 항상 보이는 영역과 일치해야 할 때</strong>뿐입니다. dvh는 주소창이 움직일 때마다 다시 계산되므로 대형 레이아웃이나 font-size에 쓰면 스크롤 중 요소가 계속 늘었다 줄었다 합니다. 첫 화면 잘림만 문제라면 svh가 더 안정적입니다. px→vh 공식(px ÷ viewportHeight × 100)은 세 단위에 그대로 적용되며 기준 높이만 달라집니다.
          </p>
          <div style={codeBox}>
{`/* 구형 브라우저 폴백 — 아랫줄이 지원되면 덮어씀 */
.hero { height: 100vh; height: 100dvh; }`}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Chrome 108+</span>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Firefox 101+</span>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>Safari 15.4+</span>
          </div>
        </div>

        {/* 6. aspect-ratio vs padding-top */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>aspect-ratio vs padding-top trick</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>✨ 최신 방법 (aspect-ratio)</p>
              <div style={codeBox}>{`.box { aspect-ratio: 16 / 9; }`}</div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
                <strong style={{ color: '#059669' }}>장점</strong>: 직관적, 코드 단순, 자식 배치 자유<br />
                <strong style={{ color: '#DC2626' }}>단점</strong>: IE 미지원
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>🛡️ 구형 방법 (padding-top)</p>
              <div style={codeBox}>{`.wrapper {
  position: relative;
  padding-top: 56.25%;
}
.content {
  position: absolute;
  inset: 0;
}`}</div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
                <strong style={{ color: '#059669' }}>장점</strong>: 모든 브라우저 지원<br />
                <strong style={{ color: '#DC2626' }}>단점</strong>: 코드 복잡, absolute 포지셔닝 필요
              </p>
            </div>
          </div>
        </div>

        {/* 7. line-height unitless */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>line-height unitless 권장 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>unitless</strong>(단위 없는) line-height는 자식 요소에 상속될 때 <strong style={{ color: 'var(--text)' }}>자식의 font-size</strong>로 재계산됩니다. 반면 em·%는 계산된 px값이 그대로 상속되어 의도와 달라질 수 있습니다.
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

        {/* 8. Figma → CSS */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Figma → CSS 변환 치트시트</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>Figma 표기</th>
                  <th scope="col" style={headCell}>CSS 변환</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['letter-spacing 5%',   'letter-spacing: 0.05em'],
                  ['line-height 150%',    'line-height: 1.5'],
                  ['font/line = 24/16',   'line-height: 1.5'],
                  ['width ratio 16:9',    'aspect-ratio: 16/9'],
                  ['corner 8',            'border-radius: 8px'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: "'Fira Code', monospace", color: 'var(--accent)' }}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 9. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* 10. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/color',     emoji: '🎨', name: '색상 코드 변환기',   desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/base64',    emoji: '🔐', name: 'Base64 인코더',       desc: '텍스트 ↔ Base64' },
              { href: '/tools/dev/json',      emoji: '📋', name: 'JSON 포맷터',         desc: '정렬·압축·검증' },
              { href: '/tools/art/charcount', emoji: '🔡', name: '글자수 세기',         desc: '실시간 카운트' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
