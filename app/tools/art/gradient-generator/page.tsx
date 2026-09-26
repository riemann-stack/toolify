import Link from 'next/link'
import GradientGeneratorClient from './GradientGeneratorClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  interpolate, analyzeContrast, exportCss, exportTailwind, buildMeshCss,
  type ColorSpace, type GradientConfig, type Stop,
} from './gradientUtils'
import { hexToRgb, rgbToHex, rgbToOklch, relativeLuminance, contrastRatio, hslToRgb, fmtRatio } from '../color/colorUtils'

export const metadata = buildMetadata({
  path: '/tools/art/gradient-generator',
  title: 'CSS 그라디언트 생성기 — Linear·Radial·Conic·Mesh + OKLCH 보간 + Tailwind·SwiftUI·Flutter 코드',
  description:
    'Linear·Radial·Conic·Mesh·반복 6유형 × OKLCH·LAB 보간 비교 + 노이즈 + Tailwind/SwiftUI/Flutter 코드와 한국 무드 30+ 프리셋.',
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

/* ── 표·코드 공용 스타일 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const pre: React.CSSProperties = {
  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)',
  padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text)',
  overflowX: 'auto', margin: '0 0 16px', lineHeight: 1.7, whiteSpace: 'pre',
}
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const swatch = (hex: string): React.CSSProperties => ({
  display: 'inline-block', width: 14, height: 14, borderRadius: 'var(--radius-s)', background: hex,
  border: '1px solid var(--border)', verticalAlign: '-2px', marginRight: 6,
})

/* ── 빌드 시 도구의 보간 함수(gradientUtils.interpolate)로 계산하는 값 — 손으로 옮겨 적지 않는다 ── */
const SPACES: { key: ColorSpace; label: string }[] = [
  { key: 'rgb', label: 'RGB' }, { key: 'hsl', label: 'HSL' }, { key: 'oklch', label: 'OKLCH' }, { key: 'lab', label: 'LAB' },
]
const PAIRS = [
  { name: '노랑 → 파랑', a: '#FFFF00', b: '#0000FF' },
  { name: '빨강 → 초록', a: '#FF0000', b: '#00FF00' },
  { name: '로즈 → 청록', a: '#E11D48', b: '#0891B2' },
  { name: '흰색 → 파랑', a: '#FFFFFF', b: '#0000FF' },
  { name: '검정 → 흰색', a: '#000000', b: '#FFFFFF' },
]
const rgbOf = (hex: string) => hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
const mid = (a: string, b: string, sp: ColorSpace) => rgbToHex(interpolate(rgbOf(a), rgbOf(b), 0.5, sp))
const okL = (hex: string) => rgbToOklch(rgbOf(hex)).l
const lum = (hex: string) => relativeLuminance(rgbOf(hex))

/* 도구 기본값(GradientGeneratorClient DEFAULT_CONFIG)과 같은 3색 · OKLCH · 135° */
const DEMO_STOPS: Stop[] = [
  { id: 'demo-1', hex: '#E11D48', pos: 0 },
  { id: 'demo-2', hex: '#7B82E0', pos: 50 },
  { id: 'demo-3', hex: '#0891B2', pos: 100 },
]
const DEMO_CFG: GradientConfig = { type: 'linear', space: 'oklch', angle: 135, shape: 'circle', stops: DEMO_STOPS, noise: 0 }
const DEMO_REPORT = analyzeContrast(DEMO_STOPS, 'oklch')
const DEMO_CSS = exportCss(DEMO_CFG)
const DEMO_TW = exportTailwind(DEMO_CFG)
/* 도구 기본 mesh 4모서리(GradientGeneratorClient DEFAULT_CONFIG.mesh) — 테마 등록 예시용, 레이어마다 줄바꿈 */
const DEMO_MESH = buildMeshCss({ tl: '#E11D48', tr: '#FFB938', bl: '#0891B2', br: '#7B82E0' })
  .replace(/\s{2,}/g, ' ').split('), ').join('),\n    ')

/* WCAG 대비비 = (밝은 휘도 + 0.05) / (어두운 휘도 + 0.05) 를 흰(1.0)·검(0) 글자에 대해 풀면 나오는 휘도 경계 */
const Y_WHITE_MAX = 1.05 / 4.5 - 0.05 // 흰 글자 4.5:1 → 배경 휘도 ≤ 0.1833
const Y_BLACK_MIN = 4.5 * 0.05 - 0.05 // 검은 글자 4.5:1 → 배경 휘도 ≥ 0.175

/* HSL 명도(L)가 같아도 색상(H)에 따라 대비비가 크게 달라짐을 보여 주는 표 (채도 80% 고정) */
const HSL_HUES = [
  { h: 0, name: '빨강' }, { h: 60, name: '노랑' }, { h: 120, name: '초록' }, { h: 220, name: '파랑' }, { h: 280, name: '보라' },
]
const HSL_LS = [30, 50, 70]
const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }
const hslContrast = (h: number, l: number) => {
  const c = hslToRgb({ h, s: 80, l })
  return { hex: rgbToHex(c), w: contrastRatio(c, WHITE), k: contrastRatio(c, BLACK) }
}

const TYPE_ROWS = [
  ['Linear', 'linear-gradient(각도)', '같은 각도의 linearGradient', 'LinearGradient', 'LinearGradient'],
  ['Radial', 'radial-gradient(circle|ellipse at center)', 'radialGradient', 'RadialGradient (endRadius 200)', 'RadialGradient (radius 0.7)'],
  ['Conic', 'conic-gradient(from 각도)', 'radial로 폴백 (SVG에 conic 없음)', 'AngularGradient (각도 −90° 보정)', 'SweepGradient'],
  ['Mesh', 'radial-gradient 4겹 + 베이스 1겹', 'radialGradient 4개 겹침', 'MeshGradient (iOS 18+)', 'RadialGradient Stack (모서리 1개 예시)'],
  ['Linear 반복', 'repeating-linear-gradient', '주기만큼 stop을 이어 붙여 흉내', 'LinearGradient (반복 미지원)', 'TileMode.repeated'],
  ['Radial 반복', 'repeating-radial-gradient', '주기만큼 stop을 이어 붙여 흉내', 'RadialGradient (반복 미지원)', 'TileMode.repeated'],
]

const FAQ_LD = [
  { q: 'RGB와 OKLCH 보간 — 실제로 어떻게 다른가요?', a: '두 색을 RGB로 보간하면 채널값을 산술 평균할 뿐이라, 보색에 가까운 두 색 사이가 탁한 회색으로 가라앉습니다. 노랑→파랑의 50% 지점이 RGB에서는 정확히 <code>#808080</code> 회색이 되는 것이 대표적입니다. OKLCH는 명도(L)·채도(C)·색상각(H)을 따로 보간하므로 같은 구간에서 청록 계열을 지나갑니다. 보간 색공간을 지정하는 native 문법(<code>linear-gradient(in oklch, …)</code>)은 Chrome 111+·Safari 16.2+·Firefox 127+에서 지원되고, 이 도구의 CSS 코드는 보간색을 16개 stop으로 풀어 쓴 폴백 선언을 먼저 넣은 뒤 native 선언을 이어 붙여 구형 브라우저에서도 배경이 표시됩니다(React·Tailwind 코드는 native 문법만 출력).' },
  { q: 'Tailwind에서 mesh gradient를 쓰려면?', a: 'Tailwind에는 mesh 전용 유틸리티가 없어 두 가지 방법을 씁니다. 한 번만 쓸 때는 이 도구의 Tailwind 탭이 출력하는 arbitrary value(<code>bg-[…]</code>, 공백은 밑줄로 치환)를 그대로 붙여 넣고, 여러 곳에서 재사용할 때는 v4라면 CSS의 <code>@theme</code>에 <code>--background-image-이름</code> 변수로, v3 이하라면 <code>tailwind.config.js</code>의 <code>theme.extend.backgroundImage</code>에 등록한 뒤 <code>bg-이름</code>으로 씁니다. 등록 방법은 위 가이드의 코드 블록과 같고, mesh는 값 자리에 CSS 탭이 출력하는 radial-gradient 4겹 + 베이스 1겹 목록을 그대로 넣으면 됩니다(코드 블록의 <code>bg-mesh</code>가 도구 기본 mesh 예시).' },
  { q: '그라디언트 위에 텍스트 가독성을 어떻게 보장하나요?', a: '배경색이 위치마다 다르므로 <strong>전 구간에서 가장 불리한 지점</strong>의 대비비로 판정합니다. "분석·접근성" 탭의 흰 글자·검은 글자 최저 대비비가 일반 텍스트 4.5:1(AA), 큰 글자(18pt, 굵게는 14pt 이상)·UI 구성요소 3:1을 넘는지 보면 되고, 샘플링 방식과 둘 다 미달일 때의 처리는 위 \'그라디언트 위 텍스트\' 절에 정리했습니다.' },
  { q: 'Figma에서 conic gradient를 어떻게 쓰나요?', a: 'Figma의 <strong>Angular 그라디언트</strong>가 CSS conic-gradient에 해당합니다. fill 종류에서 Angular를 고르고 색상 stop을 같은 순서로 배치하면 됩니다. 파일로 옮길 때는 주의가 필요합니다. SVG 포맷에는 conic 그라디언트가 없어 이 도구의 SVG 내보내기는 radial로 대체되므로, 모양을 그대로 옮기려면 PNG로 내보내 배치하거나 Figma 안에서 Angular로 다시 만드는 편이 안전합니다. Figma가 복사해 주는 CSS를 쓸 때도 시작 각도와 stop 위치를 이 도구의 미리보기와 한 번 대조해 보세요.' },
  { q: 'SwiftUI / Flutter에 적용하는 방법은?', a: '"Swift", "Flutter" 코드 탭이 복사해 바로 쓸 수 있는 코드를 출력합니다. SwiftUI는 iOS 18·macOS 15부터 <code>MeshGradient</code>를 지원하므로 mesh는 그 이상에서만 쓰고, 반복(repeating) 유형은 SwiftUI에 대응 기능이 없어 일반 Linear·Radial로 출력됩니다. Flutter는 표준 mesh 위젯이 없어 모서리마다 <code>RadialGradient</code>를 겹치는 Stack 예시를 주며(첫 모서리만 채워진 템플릿), 반복 유형은 <code>TileMode.repeated</code>로 옮깁니다. HEX 색은 SwiftUI에서 <code>Color(hex:)</code> 확장이 따로 필요하고, Flutter는 <code>Color(0xFFxxxxxx)</code>로 씁니다.' },
  { q: '노이즈(그레인) 효과는 어떻게 만들어지나요?', a: 'SVG <code>feTurbulence</code> 필터(fractalNoise, baseFrequency 0.85, 옥타브 2)로 만든 노이즈 타일을 data URI로 인코딩해 그라디언트 위에 한 겹 더 까는 방식입니다. 노이즈 슬라이더 값은 노이즈 층의 불투명도로 바뀌는데, 100%일 때 불투명도 0.5가 상한이라 그라디언트가 완전히 덮이지는 않습니다. CSS·React 코드에는 이 노이즈 층이 <code>background</code>의 첫 번째 레이어로 함께 출력됩니다.' },
  { q: 'WCAG 4.5:1을 전 구간에서 통과시키려면 색을 어떻게 골라야 하나요?', a: `모든 stop과 그 사이 색을 배경 상대 휘도의 한쪽 범위에 모으면 됩니다 — <strong>흰 글자</strong>는 휘도 <strong>${Y_WHITE_MAX.toFixed(3)} 이하</strong>, <strong>검은 글자</strong>는 <strong>${Y_BLACK_MIN.toFixed(3)} 이상</strong>. HSL 명도(L)는 색상에 따라 실제 밝기가 크게 달라 기준으로 쓰기 어려우니, 경계값의 유도 과정과 색상별 비교표가 있는 위 '그라디언트 위 텍스트' 절을 참고하세요.` },
  { q: '이미지에서 대표색 5개는 어떻게 뽑나요?', a: '올린 이미지를 폭 80px로 줄인 뒤 반투명 픽셀(알파 50% 미만)을 빼고, 남은 픽셀을 <strong>K-평균 군집화</strong>(k=5, 8회 반복)로 다섯 무리로 나눠 각 무리의 평균색을 씁니다. 초기 중심을 픽셀 목록에서 균등 간격으로 고르기 때문에 같은 이미지는 항상 같은 결과가 나오고, 결과는 밝기순으로 정렬되며 겹치는 색은 하나로 합칩니다. 적용하면 색이 0~100% 구간에 균등 간격 stop으로 배치됩니다. 면적이 작은 강조색은 평균에 묻히기 쉬우니 필요하면 stop 색을 직접 고쳐 주세요. 처리는 모두 브라우저 안에서 이뤄지고 이미지는 서버로 전송되지 않습니다.' },
]

export default function GradientGeneratorPage() {
  return (
    <ToolPage width={880} slug="/tools/art/gradient-generator">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />CSS 그라디언트 생성기
      </h1>
      <p className="tp-lead">
        Linear·Radial·Conic·Mesh·반복 6유형 × OKLCH·LAB 보간 + <strong style={{ color: 'var(--text)' }}>Tailwind/SwiftUI/Flutter 코드</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="W3C CSS Images 4(그라디언트 문법)·CSS Color 4(oklch·lab 보간) · WCAG 2.2 대비 기준"
        sources={[
          { label: 'W3C CSS Images Module Level 4', href: 'https://www.w3.org/TR/css-images-4/' },
          { label: 'W3C CSS Color Module Level 4', href: 'https://www.w3.org/TR/css-color-4/' },
          { label: 'W3C WCAG 2.2', href: 'https://www.w3.org/TR/WCAG22/' },
          { label: 'MDN <color-interpolation-method>', href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method' },
        ]}
      />

      <GradientGeneratorClient />

      <GuideDivider />
      <div>

        {/* 1. 색공간 보간 가이드 */}
        <section>
          <h2 className="g-h2">색상 보간 모드 — 왜 OKLCH가 중요한가</h2>
          <p className="g-p">
            그라디언트의 품질은 두 색 사이를 <strong>어떤 색공간에서 보간하느냐</strong>에 크게 좌우됩니다. HEX·rgb()·hsl() 같은 기존 표기의 색으로 만든 CSS 그라디언트는 보간 방식을 따로 지정하지 않으면 sRGB 채널값을 직선으로 섞는데, 이 방식은 계산이 단순한 대신 사람이 느끼는 밝기·채도와 어긋납니다. CSS Color 4·CSS Images 4는 <code>in oklch</code>·<code>in lab</code>처럼 보간 색공간을 고르는 문법을 새로 정의했고, 이 도구의 &quot;보간 모드 비교&quot; 카드는 같은 stop을 네 가지 방식으로 동시에 그려 차이를 바로 보여 줍니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['색공간', '보간 방식', '추천 용도', '약점'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['RGB',   'R·G·B 채널을 각각 직선 보간', '같은 계열 색의 명도 변화', '보색 사이가 탁한 회색으로 가라앉음'],
                  ['HSL',   '색상각은 짧은 쪽으로 회전, S·L은 직선', '일러스트·팝한 무지개 톤', 'HSL 명도가 지각 명도와 달라 중간이 튀게 밝아지기 쉬움'],
                  ['OKLCH', '지각 균등 명도·채도·색상각을 따로 보간', 'UI 배경·버튼 (도구 기본값)', '채도 높은 중간색이 sRGB 색역 밖으로 나가면 잘려 보임'],
                  ['LAB',   'CIE Lab(D50) 좌표를 직선 보간', '측색·인쇄 기준과 맞출 때', '파랑 쪽이 보라·분홍빛으로 휘기 쉬움'],
                ].map(([sp, feat, use, con], i) => (
                  <tr key={sp} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700, ...mono }}>{sp}</td>
                    <td style={td}>{feat}</td>
                    <td style={td}>{use}</td>
                    <td style={tdMuted}>{con}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            HSL에서 색상각은 360°를 넘어 0°로 이어지는 원이라, 두 색 사이를 도는 방향이 둘입니다. 이 도구는 CSS 기본값과 같이 <strong>짧은 쪽(shorter hue)</strong>으로 돌고, OKLCH에서 한쪽이 무채색(채도 거의 0)이면 그 색의 색상각은 무시하고 다른 쪽 색상각을 그대로 씁니다. 흰색·회색에서 시작하는 그라디언트가 엉뚱한 색을 거쳐 가지 않도록 하는 처리입니다.
          </p>
        </section>

        {/* 2. 50% 지점 비교표 — 빌드 시 계산 */}
        <section>
          <h2 className="g-h2">같은 두 색, 보간 방식별 50% 지점 색</h2>
          <p className="g-p">
            아래 표는 이 도구가 쓰는 보간 함수로 두 색의 <strong>정중앙(50%)</strong>을 계산한 값입니다. 괄호 속 L은 OKLCH 명도(0~100)로, 사람 눈에 느껴지는 밝기에 가깝습니다. 양 끝의 L과 비교하면 어느 방식에서 중간이 어둡게 꺼지거나 튀게 밝아지는지 알 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>색 쌍 (양 끝 L)</th>
                  {SPACES.map(s => <th scope="col" key={s.key} style={th}>{s.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {PAIRS.map((p, i) => (
                  <tr key={p.name} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {p.name}
                      <div style={{ ...mono, fontSize: 12, color: 'var(--muted)', fontWeight: 400, marginTop: 2 }}>
                        L {okL(p.a).toFixed(1)} → {okL(p.b).toFixed(1)}
                      </div>
                    </th>
                    {SPACES.map(s => {
                      const hex = mid(p.a, p.b, s.key)
                      return (
                        <td key={s.key} style={{ ...td, ...mono, whiteSpace: 'nowrap' }}>
                          <span style={swatch(hex)} aria-hidden="true" />{hex}
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>L {okL(hex).toFixed(1)}</div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            표에서 읽을 점은 세 가지입니다. 첫째, <strong>노랑→파랑</strong>은 RGB 중간이 <code>{mid('#FFFF00', '#0000FF', 'rgb')}</code> 회색이라 채도가 완전히 사라지지만, OKLCH는 <code>{mid('#FFFF00', '#0000FF', 'oklch')}</code> 청록 계열로 색을 유지합니다. 둘째, <strong>빨강→초록</strong>은 HSL 중간이 <code>{mid('#FF0000', '#00FF00', 'hsl')}</code>(상대 휘도 {lum(mid('#FF0000', '#00FF00', 'hsl')).toFixed(2)})이 되어 양 끝(빨강 {lum('#FF0000').toFixed(2)}·초록 {lum('#00FF00').toFixed(2)})보다 밝게 튀어 띠가 생긴 것처럼 보입니다. 셋째, <strong>검정→흰색</strong>은 RGB 중간 <code>{mid('#000000', '#FFFFFF', 'rgb')}</code>의 명도는 L {okL(mid('#000000', '#FFFFFF', 'rgb')).toFixed(1)} — 한가운데(L 50)보다 밝게 치우치고, OKLCH는 중간이 L {okL(mid('#000000', '#FFFFFF', 'oklch')).toFixed(1)}이라 명도가 고르게 변합니다.
          </p>
          <p className="g-note">
            * 값은 이 도구의 JS 보간(sRGB 색역 밖 성분은 채널별로 잘라냄) 기준입니다. 브라우저의 native 보간은 색역 밖 색을 채도부터 줄이는 방식으로 매핑할 수 있어, 채도가 아주 높은 쌍에서는 HEX 끝자리가 조금 다를 수 있습니다.
          </p>
        </section>

        {/* 3. 유형별 출력 */}
        <section>
          <h2 className="g-h2">그라디언트 유형 6종과 코드 탭별 출력 차이</h2>
          <p className="g-p">
            유형은 모양으로 고르면 됩니다. <strong>Linear</strong>는 헤더·버튼 배경처럼 한 방향으로 흐르는 면에, <strong>Radial</strong>은 스포트라이트·발광 효과에(<code>circle</code>은 정원, <code>ellipse</code>는 요소 비율을 따르는 타원), <strong>Conic</strong>은 도넛 차트·색상환·로딩 표시처럼 중심을 도는 색에 어울립니다. <strong>Mesh</strong>는 네 모서리 색이 번지듯 섞이는 배경이고, <strong>반복</strong> 유형은 한 주기(5~100%, 기본 25%)를 되풀이해 줄무늬·동심원 패턴을 만듭니다.
          </p>
          <p className="g-p">
            문제는 같은 설정이라도 내보내는 곳마다 지원 범위가 다르다는 점입니다. 아래 표는 이 도구의 코드 생성 함수가 유형마다 실제로 무엇을 출력하는지 정리한 것입니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['유형', 'CSS·React', 'SVG 내보내기', 'SwiftUI', 'Flutter'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {TYPE_ROWS.map(([name, css, svg, swift, flutter], i) => (
                  <tr key={name} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{name}</th>
                    <td style={{ ...td, ...mono, fontSize: 12 }}>{css}</td>
                    <td style={tdMuted}>{svg}</td>
                    <td style={tdMuted}>{swift}</td>
                    <td style={tdMuted}>{flutter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            CSS 탭은 RGB 외 보간을 고르면 선언을 두 줄 냅니다. 먼저 보간색을 16개 stop으로 풀어 쓴 선언을 두고, 그 아래 <code>in oklch</code> 같은 native 선언을 둡니다. native 문법을 모르는 브라우저는 두 번째 줄을 통째로 무시하고 첫 줄을 쓰며, 지원하는 브라우저는 뒤의 선언으로 덮어씁니다. 도구 기본값(3색 · OKLCH · 135°)의 실제 출력은 다음과 같습니다.
          </p>
          <pre style={pre}>{DEMO_CSS}</pre>
          <p className="g-p">
            Tailwind 탭은 같은 native 선언을 arbitrary value로 바꾸며, 클래스 안에서는 공백을 쓸 수 없어 밑줄로 치환합니다. 여러 곳에서 재사용할 그라디언트는 테마에 등록해 두는 편이 관리가 쉽습니다.
          </p>
          <pre style={pre}>{`/* 1회용 — 도구 Tailwind 탭 출력 그대로 */
<div class="${DEMO_TW}"></div>

/* v4 — CSS의 @theme에 등록 → class="bg-brand" · "bg-mesh" */
@theme {
  --background-image-brand: linear-gradient(in oklch 135deg, #E11D48, #7B82E0, #0891B2);
  --background-image-mesh:
    ${DEMO_MESH};
}

/* v3 이하 — tailwind.config.js → class="bg-brand" · "bg-mesh" */
theme: { extend: { backgroundImage: {
  brand: 'linear-gradient(in oklch 135deg, #E11D48, #7B82E0, #0891B2)',
  mesh: '${DEMO_MESH.replace(/\n\s*/g, ' ')}',
} } }`}</pre>
          <Callout tone="note" title="내보내기에서 모양이 바뀌는 경우">
            SVG에는 conic 그라디언트가 없어 SVG 내보내기에서 conic은 radial로 대체되고, 반복 유형은 주기만큼 stop을 이어 붙인 일반 그라디언트로 나갑니다. SwiftUI도 반복을 지원하지 않아 일반 그라디언트로 나갑니다. 모양을 그대로 옮겨야 하면 PNG(1920×1080·1080×1080·1200×630·1080×1920)로 내보내세요.
          </Callout>
        </section>

        {/* 4. 텍스트 대비 */}
        <section>
          <h2 className="g-h2">그라디언트 위 텍스트 — 전 구간 최저 대비비로 판정하기</h2>
          <p className="g-p">
            단색 배경은 대비비를 한 번만 재면 되지만, 그라디언트는 위치마다 배경색이 바뀝니다. 글자는 보통 한 가지 색이므로 <strong>가장 불리한 지점의 대비비</strong>가 곧 그 조합의 등급입니다. 분석·접근성 탭은 균등 12개 지점에 더해 모든 stop 위치와 인접 stop 사이의 25·50·75% 지점을 샘플링해 흰 글자·검은 글자의 최저값을 따로 구합니다. 좁은 구간에 stop이 몰린 그라디언트에서 균등 샘플만 쓰면 어두운 띠를 건너뛸 수 있기 때문입니다.
          </p>
          <p className="g-p">
            예를 들어 도구 기본값(<code>#E11D48</code> → <code>#7B82E0</code> → <code>#0891B2</code>, OKLCH)을 분석하면 흰 글자 최저 <strong>{DEMO_REPORT.whiteRatio.toFixed(2)}:1</strong>, 검은 글자 최저 <strong>{DEMO_REPORT.blackRatio.toFixed(2)}:1</strong>이 나옵니다. 둘 다 일반 텍스트 기준 4.5:1에 못 미치고 큰 글자 기준 3:1만 넘으므로, 이 배경 위 본문은 {DEMO_REPORT.bestText === 'black' ? '검은' : '흰'} 글자가 상대적으로 낫더라도 AA를 통과하지 못합니다. 가장 불리한 지점은 {DEMO_REPORT.worstSampleAt.toFixed(0)}% 위치의 <code>{DEMO_REPORT.worstSampleHex}</code>입니다.
          </p>
          <p className="g-p">
            기준을 휘도 하나로 바꿔 보면 색을 고르기가 쉬워집니다. WCAG 대비비는 (밝은 쪽 휘도 + 0.05) ÷ (어두운 쪽 휘도 + 0.05)이고 흰색의 휘도는 1, 검은색은 0이므로, 흰 글자가 4.5:1을 넘으려면 배경의 상대 휘도가 <strong>{Y_WHITE_MAX.toFixed(3)} 이하</strong>, 검은 글자는 <strong>{Y_BLACK_MIN.toFixed(3)} 이상</strong>이어야 합니다. 두 경계가 겹치므로 단색 배경은 흰색·검은색 중 하나로 반드시 통과하지만, 그라디언트가 이 경계를 가로질러 양쪽으로 넓게 퍼지면 어느 글자색도 전 구간을 통과하지 못합니다.
          </p>
          <p className="g-p">
            흔한 실수는 HSL 명도(L)로 이 경계를 가늠하는 것입니다. 아래 표처럼 HSL L이 같아도 색상에 따라 대비비가 몇 배씩 달라집니다(채도 80% 고정, 흰 글자 / 검은 글자 순).
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>색상 (H)</th>
                  {HSL_LS.map(l => <th scope="col" key={l} style={th}>L {l}% · 흰 / 검</th>)}
                </tr>
              </thead>
              <tbody>
                {HSL_HUES.map((hue, i) => (
                  <tr key={hue.h} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{hue.name} ({hue.h}°)</th>
                    {HSL_LS.map(l => {
                      const c = hslContrast(hue.h, l)
                      return (
                        <td key={l} style={{ ...td, ...mono, whiteSpace: 'nowrap' }}>
                          <span style={swatch(c.hex)} aria-hidden="true" />
                          <span style={{ fontWeight: c.w >= 4.5 ? 700 : 400 }}>{fmtRatio(c.w)}</span>
                          {' / '}
                          <span style={{ fontWeight: c.k >= 4.5 ? 700 : 400 }}>{fmtRatio(c.k)}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">* 굵은 숫자가 4.5:1 이상(AA 일반 텍스트 통과). 대비비는 소수 둘째 자리 내림 — 도구 표시와 같은 규칙입니다.</p>
          <p className="g-p" style={{ marginTop: 16 }}>
            같은 L 30%라도 노랑은 흰 글자와 {fmtRatio(hslContrast(60, 30).w)}:1에 그치지만 파랑은 {fmtRatio(hslContrast(220, 30).w)}:1입니다. 노랑·초록 계열은 HSL 명도가 낮아도 실제로는 밝고, 파랑·보라 계열은 명도가 높아도 실제로는 어둡습니다. 그래서 글자를 올릴 그라디언트는 HSL 슬라이더보다 OKLCH 명도나 분석 탭의 수치를 기준으로 조정하는 것이 정확합니다.
          </p>
          <Callout tone="tip" title="두 글자색 모두 미달일 때">
            그라디언트 전체를 바꾸기 어렵다면 텍스트가 놓이는 영역에만 반투명 오버레이(예: <code>linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45))</code>)를 한 겹 더 깔고, 오버레이까지 합친 색으로 다시 대비를 확인하세요. 색맹 시뮬레이션 탭에서 적색맹·녹색맹·청색맹으로 봤을 때 stop 사이 구분이 사라지는 조합이면, 색 차이 대신 명도 차이로 정보를 구분하도록 바꾸는 것이 좋습니다.
          </Callout>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <ul className="g-list">
            <li><Link href="/tools/art/color">색상 코드 변환기</Link> — HEX·RGB·HSL·OKLCH 단일 색상 변환과 팔레트 생성</li>
            <li><Link href="/tools/art/paint-mix">물감 혼합 계산기</Link> — 실제 안료 혼합 시뮬레이션 (Subtractive)</li>
            <li><Link href="/tools/dev/css-converter">CSS 단위 변환기</Link> — px·rem·em·clamp() 단위 변환</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
