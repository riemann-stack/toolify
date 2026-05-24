import Link from 'next/link'
import GradientGeneratorClient from './GradientGeneratorClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/art/gradient-generator',
  title: 'CSS 그라디언트 생성기 — Linear·Radial·Conic·Mesh + OKLCH 보간 + Tailwind·SwiftUI·Flutter 코드',
  description:
    'Linear·Radial·Conic·Mesh 5종 × OKLCH·LAB 보간 비교 + 노이즈 + Tailwind/SwiftUI/Flutter 코드와 한국 무드 30+ 프리셋.',
  keywords: [
    'CSS 그라디언트', '그라디언트 생성기', 'gradient generator',
    'linear-gradient', 'radial-gradient', 'conic-gradient', 'mesh gradient',
    'OKLCH 보간', 'LAB 보간', 'HSL 그라디언트', 'CSS Color 4',
    'Tailwind 그라디언트', 'tailwind gradient', 'arbitrary value',
    'SwiftUI LinearGradient', 'Flutter LinearGradient',
    'SVG gradient', 'React gradient style',
    'WCAG 대비비 그라디언트', '접근성 그라디언트', '색맹 시뮬',
    '한국 그라디언트', '한강 일몰', '벚꽃 그라디언트', '단풍 그라디언트',
    'mesh.cool', 'stripe gradient', 'vaporwave', 'pastel gradient',
    '노이즈 그라디언트', 'grain gradient', '이미지 색상 추출',
    '컬러스톱', 'color stop', '그라디언트 PNG', '그라디언트 SVG',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}

const faqQuestion: React.CSSProperties = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '8px',
}

const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

const codeBlock: React.CSSProperties = {
  background: '#0E0E0F',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '12px 14px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '12px',
  color: '#C8FF9E',
  overflowX: 'auto',
  margin: '10px 0',
  lineHeight: 1.6,
}

export default function GradientGeneratorPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌈 CSS 그라디언트 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        Linear·Radial·Conic·Mesh 5종 × OKLCH·LAB 보간 + <strong style={{ color: 'var(--text)' }}>Tailwind/SwiftUI/Flutter 코드</strong>.
      </p>

      <GradientGeneratorClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 색공간 보간 가이드 */}
        <section>
          <h2 style={sectionTitle}>색상 보간 모드 — 왜 OKLCH가 중요한가</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            그라디언트의 품질은 두 색상 사이를 어떤 색공간에서 보간하느냐에 크게 좌우됩니다. RGB는 단순하지만 보색 사이 중간이 회색에 가까워지고, HSL은 hue가 짧은 길로 회전하며 채도가 떨어지기 쉽습니다. OKLCH는 인간 시각의 인지 균등성을 반영해 설계되어 UI 그라디언트에 적합합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['색공간', '특징', '추천 용도', '단점'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['RGB',   '직선 보간 (가장 단순)', '단색 명도 변화·이펙트',     '보색 중간이 탁한 회색이 됨'],
                  ['HSL',   'Hue 회전 보간',          '일러스트·만화풍 그라디언트', '명도 변화 반영 X'],
                  ['OKLCH', '인지 균등 (CSS Color 4)', 'UI 그라디언트 ★ 권장',      '브라우저 지원 Chrome 111+'],
                  ['LAB',   '인쇄 표준 색공간',        '인쇄물·정밀 디자인',         '브라우저 지원 제한적'],
                ].map(([sp, feat, use, con], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{sp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{feat}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{use}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{con}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px' }}>
            본 도구는 RGB 외 색공간을 사용할 때 자동으로 16개 중간 stop을 생성해 모든 브라우저에서 동일한 결과를 보여주며, &quot;CSS&quot; 코드로 출력할 때는 modern syntax (<code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: '4px' }}>linear-gradient(in oklch, ...)</code>)도 함께 지원합니다.
          </p>
        </section>

        {/* 2. 그라디언트 유형 */}
        <section>
          <h2 style={sectionTitle}>5종 그라디언트 유형 — 언제 무엇을 쓸까</h2>
          <ul style={{ ...faqAnswer, paddingLeft: '20px', lineHeight: 2 }}>
            <li><strong>Linear</strong> — 가장 보편. 헤더·버튼·배경. 각도(0~360°)로 방향 결정.</li>
            <li><strong>Radial</strong> — 중심에서 방사형. 스포트라이트·spotlight 카드·발광 효과. <code>circle</code>은 정원, <code>ellipse</code>는 컨테이너 비율을 따름.</li>
            <li><strong>Conic</strong> — 시계 방향으로 회전. 도넛 차트·360° 색환·로딩 인디케이터. 단, Figma 미지원.</li>
            <li><strong>Mesh</strong> — 4 모서리 색상 합성. 부드럽고 트렌디한 SaaS 스타일 (Stripe·Mesh.cool). CSS는 multi-radial-gradient로 출력.</li>
            <li><strong>Repeating</strong> — Linear/Radial을 반복. 패턴·스트라이프·줄무늬 배경.</li>
          </ul>
        </section>

        {/* 3. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <p style={faqQuestion}>Q1. RGB와 OKLCH 보간 — 실제로 어떻게 다른가요?</p>
              <div style={faqAnswer}>
                두 색을 단순 RGB로 보간하면 중간이 어두워지거나 채도가 떨어집니다 (특히 빨강↔파랑). OKLCH는 인지적으로 균등한 색공간이라 같은 거리만큼 떨어진 색이 사람 눈에 같은 차이로 느껴집니다.
                <div style={codeBlock}>{`/* 예시: 노랑 → 파랑 */
linear-gradient(90deg, yellow, blue)            /* RGB: 중간이 칙칙한 회색 */
linear-gradient(in oklch, yellow, blue)         /* OKLCH: 중간이 자연스러운 초록 */`}</div>
                Chrome 111+, Safari 16.4+에서 native syntax 지원. 본 도구는 자동으로 dense stops를 생성해 폴백을 제공합니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q2. Tailwind에서 mesh gradient를 쓰려면?</p>
              <div style={faqAnswer}>
                Tailwind 4의 arbitrary value 문법으로 직접 CSS를 넣거나 <code>theme.extend.backgroundImage</code>에 등록하는 방식이 있습니다.
                <div style={codeBlock}>{`/* 1) arbitrary value (1회용) */
<div className="bg-[radial-gradient(circle_at_0%_0%,#E11D48_0%,transparent_70%)]" />

/* 2) tailwind.config.js 등록 (재사용) */
theme: {
  extend: {
    backgroundImage: {
      'mesh-1': 'radial-gradient(circle at 0% 0%, #E11D48 0%, transparent 70%), radial-gradient(...)',
    },
  },
}
// 사용: <div className="bg-mesh-1" />`}</div>
                본 도구의 &quot;Tailwind&quot; 코드 탭은 arbitrary value 형태로 자동 변환합니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q3. 그라디언트 위에 텍스트 가독성을 어떻게 보장하나요?</p>
              <div style={faqAnswer}>
                그라디언트는 위치마다 색이 다르므로 <strong>전 구간 worst-case 대비비</strong>를 봐야 합니다. 본 도구의 &quot;분석·접근성&quot; 탭은 그라디언트를 12개 지점으로 샘플링해 흰/검 텍스트와의 최저 대비비를 표시합니다. WCAG 기준:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>본문 (16px 미만): <strong>4.5:1 이상</strong> (AA)</li>
                  <li>큰 글자 (18pt+ 또는 14pt+ 굵게): <strong>3:1 이상</strong></li>
                  <li>UI 컴포넌트·아이콘: <strong>3:1 이상</strong></li>
                </ul>
                그라디언트 위에 텍스트를 올릴 때는 어두운 영역 위에 흰 텍스트, 밝은 영역 위에 검정 텍스트를 둘 수 없으므로 <code>text-shadow</code>나 반투명 오버레이로 보강하는 것도 흔한 접근입니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q4. Figma에서 conic gradient를 어떻게 쓰나요?</p>
              <div style={faqAnswer}>
                Figma는 2026년 5월 기준 conic-gradient를 직접 지원하지 않습니다. 대안:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>SVG 임포트</strong>: 본 도구의 SVG 코드를 다운로드 후 Figma에 import (단, SVG conic은 표준이 아니라 radial로 폴백됨)</li>
                  <li><strong>이미지로 export</strong>: 본 도구의 PNG 다운로드를 Figma에 배치</li>
                  <li><strong>Linear/Radial로 대체</strong>: 디자인 의도가 회전 효과가 아니라면 Linear가 호환성·유지보수 측면에서 우월</li>
                </ul>
                Sketch와 Adobe XD도 마찬가지로 conic 미지원입니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q5. SwiftUI / Flutter에 적용하는 방법은?</p>
              <div style={faqAnswer}>
                본 도구의 &quot;Swift&quot;, &quot;Flutter&quot; 코드 탭이 그대로 복사·사용 가능한 코드를 출력합니다. 단, 두 프레임워크 모두 mesh gradient는 표준 지원이 제한적입니다.
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>SwiftUI</strong>: iOS 18 / macOS 15+에서 <code>MeshGradient</code> 지원, 그 미만은 <code>LinearGradient</code> 폴백 권장</li>
                  <li><strong>Flutter</strong>: mesh 표준 위젯이 없어 <code>RadialGradient</code> 4개를 <code>Stack</code>으로 합성</li>
                </ul>
                Hex 색상은 SwiftUI에서는 <code>Color(hex: &quot;#xxxxxx&quot;)</code> extension이, Flutter에서는 <code>Color(0xFFxxxxxx)</code>가 필요합니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q6. 노이즈/그레인 효과는 어떻게 만드나요?</p>
              <div style={faqAnswer}>
                요즘 디자인 트렌드인 그레인 그라디언트는 SVG <code>feTurbulence</code> 필터로 생성한 노이즈 패턴을 그라디언트 위에 오버레이합니다. 본 도구는 노이즈 슬라이더 (0~100%) 조절만으로 자동 생성·미리보기·PNG export까지 지원합니다.
                <div style={codeBlock}>{`/* CSS multi-background로 노이즈 + 그라디언트 합성 */
background-image:
  url("data:image/svg+xml,...feTurbulence..."),
  linear-gradient(135deg, #E11D48, #0891B2);`}</div>
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q7. WCAG 대비비를 통과하는 그라디언트를 만드는 팁?</p>
              <div style={faqAnswer}>
                전 구간 4.5:1 이상을 통과시키려면 그라디언트의 명도 폭을 좁게 유지해야 합니다. 다음 패턴이 안전합니다:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>어두운 그라디언트 + 흰 텍스트</strong>: HSL 기준 명도 0~30% 범위에서만 변화</li>
                  <li><strong>밝은 그라디언트 + 검정 텍스트</strong>: HSL 명도 75~95% 범위</li>
                  <li><strong>중간 명도는 피하기</strong>: 명도 40~60%는 흰/검 양쪽 모두 4.5:1 미달 가능</li>
                </ul>
                불가피하게 명도 폭이 큰 그라디언트가 필요하면, 텍스트 영역에만 어두운 오버레이 (<code>linear-gradient(rgba(0,0,0,0.4), transparent)</code>)를 추가하거나 strong text-shadow 적용이 일반적 우회법입니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q8. 이미지에서 색상을 추출할 때 안전한가요?</p>
              <div style={faqAnswer}>
                네. 본 도구의 &quot;이미지 → 색상 추출&quot; 기능은 <strong>전적으로 브라우저 내에서만 처리</strong>됩니다. 이미지는 서버에 업로드되지 않으며, K-means 클러스터링으로 5개 대표 색상을 추출한 뒤 메모리에서 즉시 폐기됩니다 (URL.revokeObjectURL). 사진의 EXIF 정보나 원본도 외부로 전송되지 않습니다.
              </div>
            </div>

          </div>
        </section>

        {/* 4. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <ul style={{ ...faqAnswer, paddingLeft: '20px', lineHeight: 2 }}>
            <li><Link href="/tools/art/color" style={{ color: 'var(--accent)' }}>색상 코드 변환기</Link> — HEX·RGB·HSL·OKLCH 단일 색상 변환과 팔레트 생성</li>
            <li><Link href="/tools/art/paint-mix" style={{ color: 'var(--accent)' }}>물감 혼합 계산기</Link> — 실제 안료 혼합 시뮬레이션 (Subtractive)</li>
            <li><Link href="/tools/dev/css-converter" style={{ color: 'var(--accent)' }}>CSS 단위 변환기</Link> — px·rem·em·clamp() 단위 변환</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
