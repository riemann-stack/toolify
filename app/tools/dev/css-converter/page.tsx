import Link from 'next/link'
import CssConverterClient from './CssConverterClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/css-converter',
  title: 'CSS 값 변환기 — px·rem·em·clamp()·aspect-ratio 계산',
  description: 'px, rem, em, %, vw, vh 단위 변환부터 line-height, letter-spacing, aspect-ratio, clamp() 생성까지 CSS에서 자주 헷갈리는 값을 빠르게 변환하고 코드를 복사하세요.',
  keywords: ['CSS단위변환기', 'px rem 변환', 'clamp생성기', 'aspect-ratio계산기', 'line-height변환', 'letter-spacing변환', 'CSS계산기', 'rem변환기'],
})

const codeBox: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '14px 16px',
  fontFamily: "'Fira Code', 'Consolas', monospace",
  fontSize: '12.5px',
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

export default function CssConverterPage() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎨 CSS 값 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        px·rem·em 단위 변환부터 clamp() 생성, aspect-ratio 계산까지. CSS에서 자주 헷갈리는 값을 한곳에서 변환하고 바로 복사하세요.
      </p>

      <CssConverterClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 핵심 공식 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>CSS 단위 핵심 공식 참조표</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>변환</th>
                  <th style={headCell}>공식</th>
                  <th style={headCell}>예시 (root 16px)</th>
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
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row[0]}</td>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>rem vs em 완전 비교</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>항목</th>
                  <th style={headCell}>rem</th>
                  <th style={headCell}>em</th>
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

        {/* 3. clamp() 가이드 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>clamp() 완전 가이드</h2>
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
            <span style={{ background: 'rgba(62,255,155,0.15)', color: '#3EFF9B', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>Chrome 79+</span>
            <span style={{ background: 'rgba(62,255,155,0.15)', color: '#3EFF9B', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>Firefox 75+</span>
            <span style={{ background: 'rgba(62,255,155,0.15)', color: '#3EFF9B', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>Safari 13.1+</span>
            <span style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>IE ❌</span>
          </div>
        </div>

        {/* 4. aspect-ratio vs padding-top */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>aspect-ratio vs padding-top trick</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>✨ 최신 방법 (aspect-ratio)</p>
              <div style={codeBox}>{`.box { aspect-ratio: 16 / 9; }`}</div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
                <strong style={{ color: '#3EFF9B' }}>장점</strong>: 직관적, 코드 단순, 자식 배치 자유<br />
                <strong style={{ color: '#FF6B6B' }}>단점</strong>: IE 미지원
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
                <strong style={{ color: '#3EFF9B' }}>장점</strong>: 모든 브라우저 지원<br />
                <strong style={{ color: '#FF6B6B' }}>단점</strong>: 코드 복잡, absolute 포지셔닝 필요
              </p>
            </div>
          </div>
        </div>

        {/* 5. line-height unitless */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>line-height unitless 권장 이유</h2>
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

        {/* 6. Figma → CSS */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Figma → CSS 변환 치트시트</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>Figma 표기</th>
                  <th style={headCell}>CSS 변환</th>
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

        {/* 7. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'rem과 em의 차이는 무엇인가요?', a: 'rem은 root 요소(html)의 font-size를 기준으로, em은 부모 요소의 font-size를 기준으로 합니다. 중첩된 컴포넌트에서 em은 누적 계산되어 예상과 다른 결과가 나올 수 있어 일관성이 필요한 경우 rem을 권장합니다.' },
              { q: 'line-height에 unitless가 권장되는 이유는?', a: 'line-height: 1.5처럼 단위 없는 값은 자식 요소에 상속될 때 자식의 font-size를 기준으로 재계산됩니다. 반면 em이나 %는 계산된 px값이 그대로 상속되어 자식의 font-size가 다를 때 의도와 다른 결과가 나올 수 있습니다.' },
              { q: 'clamp()에서 vw 단위만 쓰면 안 되나요?', a: 'font-size: 2vw처럼 vw만 쓰면 최솟값·최댓값 제한이 없어 매우 좁거나 넓은 화면에서 글자가 너무 작거나 커집니다. clamp(min, preferred, max)로 안전한 범위를 설정하는 것이 권장됩니다.' },
              { q: 'letter-spacing에 % 단위를 쓸 수 있나요?', a: 'CSS 명세상 letter-spacing은 % 단위를 공식 지원하지 않습니다. 실무에서는 em 단위를 권장합니다. 1em = font-size와 같은 크기이므로 font-size가 변경되어도 자간 비율이 자동으로 유지됩니다.' },
              { q: 'aspect-ratio와 padding-top 방식 중 어느 것을 써야 하나요?', a: 'IE를 지원하지 않는다면 aspect-ratio가 훨씬 직관적이고 권장됩니다. IE 지원이 필요하거나 레거시 코드를 다룬다면 padding-top 방식을 사용하세요. 이 계산기에서 두 방법의 코드를 모두 확인하고 복사할 수 있습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 8. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/dev/color',     emoji: '🎨', name: '색상 코드 변환기',   desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/base64',    emoji: '🔐', name: 'Base64 인코더',       desc: '텍스트 ↔ Base64' },
              { href: '/tools/dev/json',      emoji: '📋', name: 'JSON 포맷터',         desc: '정렬·압축·검증' },
              { href: '/tools/dev/charcount', emoji: '🔡', name: '글자수 세기',         desc: '실시간 카운트' },
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
