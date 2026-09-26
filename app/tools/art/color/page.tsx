import ColorClient from './ColorClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  hexToRgb, rgbToHex, rgbToHsl, rgbToHsv, rgbToCmyk, rgbToHwb, rgbToLab, rgbToOklch, hslToRgb,
  formatHex, formatHexa, formatRgb, formatRgba, formatHsl, formatHsla, formatHsv, formatHwb, formatCmyk, formatLab, formatOklch,
  contrastRatio, fmtRatio, suggestPassingColor, simulateColorblind, rgbDistance,
  complementary, analogous, triadic, tetradic, splitComplement, monochromatic, shades, tailwindScale,
  type HSL, type RGB,
} from './colorUtils'
import { TAILWIND_COLORS } from './tailwindColors'

export const metadata = buildMetadata({
  path: '/tools/art/color',
  title: '색상 코드 변환기 — HEX·RGB·HSL·OKLCH·WCAG·팔레트·Tailwind',
  description:
    'HEX는 물론 rgb()·hsl() 문자열로도 입력해 HEX·RGB·HSL·OKLCH·알파를 변환. WCAG 대비비, 팔레트, Tailwind v4 매칭, CSS 변수, 그라디언트, 이미지 추출까지.',
  keywords: [
    '색상코드변환', 'HEX RGB HSL', '색상변환기', 'OKLCH', 'WCAG 대비비',
    '접근성 색상', '팔레트 생성', 'Tailwind 색상', 'CSS 변수', '색맹 시뮬레이션',
    '그라디언트 생성', '이미지 색상 추출', 'CMYK 변환', 'HSL 변환', '컬러 피커',
    '디자인 토큰', 'LAB 색공간', 'HEXA 알파', '톤 팔레트',
  ],
})

/* ── 표 공용 스타일 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdMuted: React.CSSProperties = { ...td, color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const swatch = (hex: string): React.CSSProperties => ({
  display: 'inline-block', width: 14, height: 14, borderRadius: 'var(--radius-s)', background: hex,
  border: '1px solid var(--border)', verticalAlign: '-2px', marginRight: 4,
})

/* ── 가이드의 예시 값은 전부 빌드 시 도구의 변환 함수(colorUtils)로 계산 — 도구 기본색 #0891B2 ── */
const BASE_HEX = '#0891B2'
const BASE: RGB = hexToRgb(BASE_HEX) ?? { r: 8, g: 145, b: 178 }
const BASE_HSL = rgbToHsl(BASE)
/* 정수 HSL로 표시한 값을 다시 RGB로 되돌렸을 때의 오차(도구의 hslToRgb 그대로) */
const ROUND_TRIP = hslToRgb(BASE_HSL)
const ROUND_TRIP_HEX = rgbToHex(ROUND_TRIP)
const ROUND_TRIP_DIFF = Math.max(Math.abs(ROUND_TRIP.r - BASE.r), Math.abs(ROUND_TRIP.g - BASE.g), Math.abs(ROUND_TRIP.b - BASE.b))
const WHITE: RGB = { r: 255, g: 255, b: 255 }
const BLACK: RGB = { r: 0, g: 0, b: 0 }

const FORMAT_ROWS: [string, string, string][] = [
  ['HEX',   formatHex(BASE), 'HTML/CSS 기본 표기, 디자인 툴 공통'],
  ['HEXA',  formatHexa({ ...BASE, a: 0.5 }), '8자리 HEX — 끝 두 자리가 알파(80 = 128/255 ≈ 50%)'],
  ['RGB',   formatRgb(BASE), 'CSS·JavaScript·이미지 처리'],
  ['RGBA',  formatRgba({ ...BASE, a: 0.5 }), '반투명 색 — 그림자·오버레이'],
  ['HSL',   formatHsl(BASE_HSL), '색상각·채도·명도로 직관 조작'],
  ['HSLA',  formatHsla({ ...BASE_HSL, a: 0.5 }), 'HSL + 알파'],
  ['HSV',   formatHsv(rgbToHsv(BASE)), 'Photoshop·Figma 컬러 피커의 좌표계'],
  ['HWB',   formatHwb(rgbToHwb(BASE)), 'CSS Color 4 — 흰색·검정 섞는 양으로 표기'],
  ['CMYK',  formatCmyk(rgbToCmyk(BASE)), '인쇄 참고용 단순 환산(ICC 프로파일 미적용)'],
  ['LAB',   formatLab(rgbToLab(BASE)), 'CSS lab() — D50 백색점 CIE Lab'],
  ['OKLCH', formatOklch(rgbToOklch(BASE)), 'CSS Color 4 지각 균등 색공간 — Tailwind v4 기본'],
  ['십진',  `${BASE.r}, ${BASE.g}, ${BASE.b}`, '프로그램 입력·스프레드시트용 R, G, B'],
]

const RATIO_WHITE = contrastRatio(BASE, WHITE)
const RATIO_BLACK = contrastRatio(BASE, BLACK)
const FIX = suggestPassingColor(BASE, WHITE, 4.5)
const FIX_HEX = FIX ? rgbToHex(FIX) : null
const FIX_L = FIX ? rgbToHsl(FIX).l : null

const CB_ROWS: { type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'; name: string; cone: string; freq: string; model: string }[] = [
  { type: 'protanopia', name: '적색맹 (Protanopia)', cone: 'L원추(적) 결손', freq: '남성 약 1%', model: 'Machado 2009' },
  { type: 'deuteranopia', name: '녹색맹 (Deuteranopia)', cone: 'M원추(녹) 결손', freq: '남성 약 1%', model: 'Machado 2009' },
  { type: 'tritanopia', name: '청색맹 (Tritanopia)', cone: 'S원추(청) 결손', freq: '매우 드묾', model: 'Brettel 1997' },
  { type: 'achromatopsia', name: '전색맹 (Achromatopsia)', cone: '휘도만 지각', freq: '극히 드묾', model: '선형 휘도 근사' },
]
const RED: RGB = { r: 220, g: 38, b: 38 }    // #DC2626
const GREEN: RGB = { r: 22, g: 163, b: 74 }  // #16A34A

const hslHexes = (arr: HSL[]) => arr.map(h => rgbToHex(hslToRgb(h)))
const PALETTE_ROWS: { name: string; rule: string; use: string; hexes: string[] }[] = [
  { name: '보색', rule: '색상각 +180°', use: '강한 대비·강조 버튼', hexes: hslHexes(complementary(BASE_HSL)) },
  { name: '유사색', rule: '−30° · 0 · +30°', use: '조화로운 배경·부드러운 그라디언트', hexes: hslHexes(analogous(BASE_HSL)) },
  { name: '삼각', rule: '120° 간격 3색', use: '균형 잡힌 다채로움(차트·일러스트)', hexes: hslHexes(triadic(BASE_HSL)) },
  { name: '사각', rule: '90° 간격 4색', use: '카테고리 구분이 많을 때', hexes: hslHexes(tetradic(BASE_HSL)) },
  { name: '분할 보색', rule: '+150° · +210°', use: '보색보다 덜 자극적인 대비', hexes: hslHexes(splitComplement(BASE_HSL)) },
  { name: '단색 (명도)', rule: 'HSL 명도 15→85% 5단계', use: '미니멀·다크 모드 단계', hexes: hslHexes(monochromatic(BASE_HSL, 5)) },
  { name: '톤 (채도)', rule: '기준 채도의 100→20% 5단계', use: '차분한 보조색·비활성 상태', hexes: hslHexes(shades(BASE_HSL, 5)) },
]

const SCALE = tailwindScale(BASE_HSL)
const scaleHex = (shade: number) => (SCALE.find(s => s.shade === shade)?.hex ?? '').toLowerCase()

const TW_NEAREST = Object.entries(TAILWIND_COLORS)
  .flatMap(([k, shadesMap]) => Object.entries(shadesMap).map(([n, h]) => ({ name: `${k}-${n}`, hex: h, d: rgbDistance(BASE, hexToRgb(h) ?? BLACK) })))
  .sort((a, b) => a.d - b.d)
  .slice(0, 3)

const FAQ_LD = [
              {
                q: 'RGBA와 HEXA의 차이는?',
                a: '둘 다 알파(투명도)를 포함하지만 표기법이 다릅니다. <strong>RGBA</strong>는 0~1 소수(<code>rgba(8,145,178,0.5)</code>), <strong>HEXA</strong>는 8자리 HEX(<code>#0891B280</code>)로 표기합니다. 80은 16진수로 128, 즉 50% 투명도입니다. 현대 CSS는 둘 다 지원하며, HEXA는 간결해 디자인 시스템에서 자주 사용됩니다.',
              },
              {
                q: 'WCAG 대비비 기준은 어떻게 정해졌나요?',
                a: 'WCAG는 W3C가 만든 국제 표준으로, 4.5:1은 <strong>시력 20/40(정상의 절반) 수준의 저시력 사용자도 읽을 수 있도록</strong> 잡은 값입니다(AAA 7:1은 약 20/80 기준). 한국 웹 접근성 인증(KWCAG, WCAG 기반), 미국 ADA Title II 규칙(주·지방정부, WCAG 2.1 AA), 유럽 EAA(EN 301 549→WCAG 2.1 AA) 모두 WCAG 계열 기준을 채택하므로 <strong>처음부터 AA 이상을 목표로</strong> 디자인하는 것이 좋습니다. 최신판 WCAG 2.2도 대비 기준(1.4.3·1.4.6·1.4.11)은 2.1과 같습니다.',
              },
              {
                q: 'OKLCH는 무엇이고 왜 채택해야 하나요?',
                a: '2020년 비외른 오토손(Björn Ottosson)이 발표한 <strong>지각적으로 균일한 색공간 Oklab</strong>을 명도(L)·채도(C)·색상각(H)의 극좌표로 쓴 것입니다. HSL의 큰 결점인 "같은 명도 값인데 노란색이 파란색보다 훨씬 밝게 보이는 문제"를 크게 줄여, 채도나 색상을 바꿔도 체감 밝기가 덜 흔들립니다. CSS Color 4에 <code>oklch()</code> 함수로 정식 포함됐고, <strong>Tailwind v4·shadcn/ui</strong> 등 최신 디자인 시스템이 기본 색 정의에 쓰고 있습니다.',
              },
              {
                q: '한 색상에서 어떤 팔레트를 만들어야 할까요?',
                a: '용도에 따라 다릅니다 — 브랜드 메인 컬러는 <strong>Tailwind 11단계(50~950)</strong>, 강조·대비가 필요하면 <strong>보색 또는 분할 보색</strong>, 부드러운 디자인은 <strong>유사색(±30°)</strong>, 다양한 카테고리 구분에는 <strong>삼각·사각 배색</strong>, 다크 모드용에는 <strong>단색 명도 단계</strong>가 적합합니다. 흔한 구성은 Primary 11단계 + Neutral 11단계 + 상태색(Success/Warning/Error/Info)입니다.',
              },
              {
                q: '이미지 색 추출은 어떤 방식으로 색을 고르나요?',
                a: '이미지를 100×100px로 줄인 뒤 반투명 픽셀(알파 50% 미만)을 빼고, R·G·B를 각각 24단위 구간으로 묶어 <strong>가장 많이 나온 구간부터</strong> 고릅니다. 대표색은 구간의 경계값이 아니라 그 구간에 속한 픽셀의 실제 평균이라 흰색이 회색으로 어두워지지 않고, 비율(%)도 함께 표시됩니다. 빈도 순이므로 면적이 작은 강조색은 빠지기 쉽고, 그라디언트 사진처럼 색이 연속으로 변하면 비슷한 색이 여러 구간으로 쪼개집니다. 브랜드 색을 정확히 뽑아야 하면 결과를 출발점으로 삼고 변환 탭에서 값을 다듬으세요. 이미지는 브라우저 안에서만 처리됩니다(5MB 이하).',
              },
            ]

export default function ColorPage() {
  return (
    <ToolPage width={880} slug="/tools/art/color">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />색상 코드 변환기
      </h1>
      <p className="tp-lead">
        HEX·RGB·HSL·OKLCH 변환 + WCAG 대비비 + 팔레트·Tailwind 매칭·<strong style={{ color: 'var(--text)' }}>이미지 색 추출</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="W3C WCAG 2.2 명도 대비 기준 · CSS Color 4(lab()·oklch()) · 질병관리청 색각이상 유병률"
        sources={[
          { label: 'W3C WCAG 2.2', href: 'https://www.w3.org/TR/WCAG22/' },
          { label: 'W3C CSS Color Module Level 4', href: 'https://www.w3.org/TR/css-color-4/' },
          { label: '질병관리청 국가건강정보포털 — 색각이상', href: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1469' },
        ]}
      />

      <ColorClient />

      <GuideDivider />
      <div>

        {/* 1. 색상 형식 가이드 */}
        <section>
          <h2 className="g-h2">색상 코드 형식 종합 가이드</h2>
          <p className="g-p">
            본 도구는 12가지 색상 형식을 동시에 표시·변환합니다. 각 형식은 사용처가 명확히 다르므로, 적재적소에 맞는 표기를 선택하면 협업과 유지보수가 쉬워집니다.
            아래 예시는 모두 같은 색 <code style={mono}>{BASE_HEX}</code>를 도구의 변환 함수로 계산한 값입니다(HEXA·RGBA·HSLA는 알파 50% 예시).
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['형식', '예시', '주요 사용처'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {FORMAT_ROWS.map(([fmt, ex, use], i) => (
                  <tr key={fmt} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700, textAlign: 'left', ...mono }}>{fmt}</th>
                    <td style={{ ...td, ...mono, whiteSpace: 'nowrap' }}>{ex}</td>
                    <td style={tdMuted}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            변환에서 자주 헷갈리는 점이 두 가지 있습니다. 첫째, HSL·HSV·HWB는 정수로 반올림해 표시하므로 HSL 값을 다시 HEX로 되돌리면 채널값이 몇 단계씩 달라질 수 있습니다. 기본색도 <code style={mono}>{formatHex(BASE)}</code> → <code style={mono}>{formatHsl(BASE_HSL)}</code> → <code style={mono}>{ROUND_TRIP_HEX}</code>로, 채널당 최대 {ROUND_TRIP_DIFF}씩 바뀝니다 — 원본 색은 HEX나 RGB로 보관하세요. 둘째, CMYK는 잉크·용지 특성을 반영하는 ICC 프로파일 없이 RGB에서 단순 환산한 값이라 인쇄소의 실제 색과 다를 수 있습니다. 명함·인쇄물은 인쇄소가 지정한 프로파일로 디자인 툴에서 다시 변환하는 것이 안전합니다.
          </p>
        </section>

        {/* 2. WCAG */}
        <section>
          <h2 className="g-h2">WCAG 색상 대비비 (접근성)</h2>
          <p className="g-p">
            W3C가 정한 웹 접근성 표준 — 텍스트와 배경 색상의 명도 대비를 1:1 ~ 21:1 사이의 수치로 평가합니다.
            한국 정보접근성 인증(KWCAG)·미국 ADA Title II 규칙·유럽 EAA 모두 WCAG 계열 기준을 채택합니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등급', '일반 텍스트', '큰 텍스트 (18pt 또는 굵게 14pt 이상)', 'UI 컴포넌트·그래픽'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AAA (1.4.6)', '7 : 1 이상', '4.5 : 1 이상', '—'],
                  ['AA (1.4.3 · 1.4.11)', '4.5 : 1 이상', '3 : 1 이상', '3 : 1 이상'],
                ].map((row, i) => (
                  <tr key={row[0]} style={rowStyle(i)}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ ...td, color: j === 0 ? 'var(--accent-ink)' : 'var(--text)', fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>계산 공식:</strong> 대비비 = (밝은 색 휘도 + 0.05) ÷ (어두운 색 휘도 + 0.05). 여기서 상대 휘도 L = 0.2126 × R + 0.7152 × G + 0.0722 × B이고, R·G·B는 sRGB 감마를 풀어 선형값으로 바꾼 뒤 넣습니다. 초록 계수가 가장 크고 파랑이 가장 작아서, 같은 채도라도 초록·노랑 계열은 밝게, 파랑·보라 계열은 어둡게 계산됩니다.
          </p>
          <p className="g-p">
            <strong>예시:</strong> 도구 기본색 <code style={mono}>{BASE_HEX}</code>에 흰 글자를 올리면 <strong>{fmtRatio(RATIO_WHITE)} : 1</strong>로, 큰 글자·아이콘 기준 3:1은 넘지만 본문 기준 4.5:1에는 못 미칩니다. 같은 색 위에 검은 글자는 {fmtRatio(RATIO_BLACK)} : 1로 AA를 통과합니다. 브랜드 색 버튼에 흰 글자를 꼭 써야 한다면 접근성 탭의 자동 추천처럼 색상각과 채도는 두고 명도만 내리면 되는데, 이 색은 HSL 명도 {BASE_HSL.l}% → {FIX_L}%인 <code style={mono}>{FIX_HEX}</code>({FIX ? fmtRatio(contrastRatio(FIX, WHITE)) : '—'} : 1)에서 처음 4.5:1을 넘습니다.
          </p>
          <p className="g-note">
            * 도구의 대비비 표시는 소수 둘째 자리에서 내림합니다. 반올림하면 4.495가 &lsquo;4.50&rsquo;으로 보이는데 판정은 미달이라 모순이 생기기 때문입니다.
          </p>
        </section>

        {/* 3. 색맹 시뮬레이션 */}
        <section>
          <h2 className="g-h2">색맹 시뮬레이션</h2>
          <p className="g-p">
            색각 이상은 북유럽계 기준 남성 약 8%, 여성 약 0.5%가 갖고 있습니다 (아시아·아프리카계는 이보다 낮음).
            한국은 남성 약 5.9%, 여성 약 0.4%로 남성 100만 명 이상 규모입니다 (질병관리청 국가건강정보포털).
            본 도구는 선형 RGB에서 적색맹·녹색맹은 Machado 2009, 청색맹은 Brettel 1997 모델로 계산하고, 전색맹은 휘도만 남기는 방식으로 근사합니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['유형', '원인', '빈도', '모델', `${BASE_HEX} → 보이는 색`].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {CB_ROWS.map((r, i) => {
                  const hex = rgbToHex(simulateColorblind(BASE, r.type))
                  return (
                    <tr key={r.type} style={rowStyle(i)}>
                      <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.name}</th>
                      <td style={tdMuted}>{r.cone}</td>
                      <td style={tdMuted}>{r.freq}</td>
                      <td style={tdMuted}>{r.model}</td>
                      <td style={{ ...td, ...mono, whiteSpace: 'nowrap' }}><span style={swatch(hex)} aria-hidden="true" />{hex}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            위 4종은 완전 이색자(색맹) 기준입니다. 실제로 가장 흔한 유형은 이보다 변화가 약한 <strong>녹색약(Deuteranomaly, 남성 약 5%)</strong>으로,
            색맹 시뮬레이션에서 구분이 어려운 조합은 녹색약 사용자에게도 부담이 됩니다.
            대표적인 예가 &lsquo;빨강 = 오류, 초록 = 성공&rsquo; 표시입니다. 빨강 <code style={mono}>#DC2626</code>과 초록 <code style={mono}>#16A34A</code>는 녹색맹 시뮬레이션에서 각각 <code style={mono}>{rgbToHex(simulateColorblind(RED, 'deuteranopia'))}</code>·<code style={mono}>{rgbToHex(simulateColorblind(GREEN, 'deuteranopia'))}</code>로 거의 같은 황갈색이 되고, 두 색끼리의 대비비도 {fmtRatio(contrastRatio(RED, GREEN))} : 1에 불과해 명도로도 구분되지 않습니다.
          </p>
          <Callout tone="warn" title="디자인 가이드">
            색상만으로 정보를 전달하지 마세요(WCAG 1.4.1) — 텍스트·아이콘·패턴을 함께 쓰고, 빨강·초록 조합에는 명도 차이를 크게 두며, 흑백으로 바꿔도 구분되는지 확인합니다.
          </Callout>
        </section>

        {/* 4. 팔레트 이론 */}
        <section>
          <h2 className="g-h2">팔레트 이론 (색상환 기반 조합)</h2>
          <p className="g-p">
            팔레트 탭의 조합은 모두 HSL 색상환에서 색상각(H)을 돌리거나 명도·채도를 단계적으로 바꿔 만듭니다. 아래 표는 기준색 <code style={mono}>{BASE_HEX}</code>(hsl {BASE_HSL.h}°, {BASE_HSL.s}%, {BASE_HSL.l}%)를 넣었을 때 도구가 실제로 내놓는 색입니다. 기준색도 HSL 정수값을 거쳐 다시 계산하므로 첫 색의 끝자리가 입력과 조금 다를 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['조합', '규칙', '결과', '어울리는 쓰임'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PALETTE_ROWS.map((p, i) => (
                  <tr key={p.name} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{p.name}</th>
                    <td style={{ ...tdMuted, whiteSpace: 'nowrap' }}>{p.rule}</td>
                    <td style={{ ...td, ...mono, fontSize: 12 }}>
                      {p.hexes.map(h => (
                        <span key={h} style={{ display: 'inline-block', marginRight: 8, whiteSpace: 'nowrap' }}><span style={swatch(h)} aria-hidden="true" />{h}</span>
                      ))}
                    </td>
                    <td style={tdMuted}>{p.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            HSL로 색상각만 돌리면 명도(L) 값은 그대로지만 체감 밝기는 달라집니다. 위 삼각 조합의 세 색은 모두 HSL 명도 {BASE_HSL.l}%인데, 연두색 <code style={mono}>{PALETTE_ROWS[2].hexes[2]}</code>이 자홍색 <code style={mono}>{PALETTE_ROWS[2].hexes[1]}</code>보다 훨씬 밝아 보이는 것이 그 예입니다(흰색 대비 {fmtRatio(contrastRatio(hexToRgb(PALETTE_ROWS[2].hexes[2]) ?? BLACK, WHITE))} : 1 대 {fmtRatio(contrastRatio(hexToRgb(PALETTE_ROWS[2].hexes[1]) ?? BLACK, WHITE))} : 1). 팔레트를 텍스트 배경으로 쓸 계획이라면 조합을 고른 뒤 각 색을 접근성 탭에서 한 번씩 확인하세요.
          </p>
        </section>

        {/* 5. 디자인 토큰·CSS 변수 */}
        <section>
          <h2 className="g-h2">디자인 토큰·CSS 변수</h2>
          <p className="g-p">
            Tailwind, shadcn/ui, MUI, Chakra 같은 디자인 시스템은 색을 이름 붙인 변수(토큰)로 관리합니다. 본 도구는 한 색상에서 11단계 스케일과 여러 형식의 CSS 변수를 자동 생성합니다.
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '14px 16px', ...mono, fontSize: '12px', color: 'var(--text)', overflow: 'auto', lineHeight: 1.8, margin: '0 0 12px' }}>{`:root {
  /* ${BASE_HEX} 입력 시 실제 생성 예시 (일부) */
  --color-primary-50:  ${scaleHex(50)};
  --color-primary-500: ${scaleHex(500)};  /* 명도 정규화 단계 (L 50%) */
  --color-primary-900: ${scaleHex(900)};

  /* 입력한 기준색 + 다중 형식 (color-mix·alpha 조작용) */
  --color-primary:     ${BASE_HEX.toLowerCase()};
  --color-primary-rgb: ${BASE.r} ${BASE.g} ${BASE.b};
  --color-primary-hsl: ${BASE_HSL.h} ${BASE_HSL.s}% ${BASE_HSL.l}%;
}`}</pre>
          <p className="g-p">
            500 단계는 입력색이 아니라 명도를 50%로 정규화한 값입니다 — 입력한 기준색 자체는 <code style={mono}>--color-primary</code>로 함께 내보냅니다. 11단계는 HSL 명도를 97·94·86·76·66·50·42·34·26·18·10%로 두고 입력색의 채도에 단계별 배율을 곱해 만듭니다 — 밝은 쪽은 50 단계에서 절반(×0.5)까지, 어두운 쪽은 950 단계에서 ×0.8까지 채도를 낮춥니다. 공백으로 구분한 <code style={mono}>-rgb</code>·<code style={mono}>-hsl</code> 변수는 <code style={mono}>rgb(var(--color-primary-rgb) / 0.5)</code>처럼 알파만 바꿔 쓰는 용도입니다. 다크 모드는 같은 변수 이름에 다른 값을 넣어 전환하면 컴포넌트 코드를 건드리지 않아도 됩니다.
          </p>
        </section>

        {/* 6. Tailwind */}
        <section>
          <h2 className="g-h2">Tailwind CSS 색상 시스템</h2>
          <p className="g-p">
            Tailwind v4는 26개 기본 색상 × 11단계 = <strong>총 286개 색상</strong>을 제공합니다 — slate, gray, zinc, neutral, stone에 v4.2+에서 추가된 taupe, mauve, mist, olive까지 무채색·저채도 9종, red부터 rose까지 유채색 17종. v4부터 색이 OKLCH로 정의되고, 커스텀 색상도 <code style={mono}>tailwind.config.js</code> 대신 CSS의 <code style={mono}>@theme</code> 블록에 CSS 변수로 선언합니다.
          </p>
          <p className="g-p">
            본 도구의 <strong>가장 가까운 Tailwind 매칭</strong> 기능은 입력한 색과 RGB 유클리드 거리가 가장 가까운 5개 클래스를 v4 팔레트(sRGB 변환값) 기준으로 추천합니다. 예를 들어 <code style={mono}>{BASE_HEX}</code>는 {TW_NEAREST.map((m, i) => (
              <span key={m.name}>{i > 0 ? ', ' : ''}<code style={mono}>{m.name}</code>({m.hex}, 거리 {m.d.toFixed(1)})</span>
            ))} 순으로 가깝습니다. 거리 {TW_NEAREST[0].d.toFixed(0)} 안팎인 {TW_NEAREST[0].name}은 나란히 놓아야 차이가 보이는 정도지만, 거리가 30을 넘는 {TW_NEAREST[1].name}부터는 색조가 눈에 띄게 달라집니다. 가장 가까운 후보도 거리가 크다면 억지로 맞추기보다 기준색을 그대로 <code style={mono}>@theme</code>에 등록하는 편이 낫습니다. RGB 거리는 계산이 단순한 대신 지각 차이와 완전히 비례하지 않는다는 점도 감안하세요.
          </p>
        </section>

        {/* 7. 그라디언트 */}
        <section>
          <h2 className="g-h2">그라디언트 디자인</h2>
          <p className="g-p">
            CSS는 3가지 그라디언트 함수를 제공합니다 — <code style={mono}>linear-gradient</code> (직선 방향), <code style={mono}>radial-gradient</code> (원형), <code style={mono}>conic-gradient</code> (회전). 색 조합에 따라 분위기가 달라집니다.
          </p>
          <ul className="g-list">
            <li><strong>비슷한 색상 조합</strong> — 자연스럽고 부드러운 분위기</li>
            <li><strong>보색 조합</strong> — 강렬하고 시선을 끄는 효과 (중간이 탁해지기 쉬워 보간 방식 선택이 중요)</li>
            <li><strong>3색 조합</strong> — 풍부한 색감, 포스터·히어로 배경</li>
            <li><strong>같은 색의 명도 변화</strong> — 세련되고 통일감 있는 분위기</li>
          </ul>
          <p className="g-p">
            <strong>접근성 주의:</strong> 그라디언트 위 텍스트는 가장 어두운/밝은 부분 기준으로 대비비를 확인하세요. 본 도구의 <em>10단계 색상 미리보기</em>가 전 구간 색상을 보여주므로 가독성 검증에 활용 가능합니다. 보간 방식 비교·전 구간 대비 분석이 필요하면 <Link href="/tools/art/gradient-generator">CSS 그라디언트 생성기</Link>를 쓰세요.
          </p>
        </section>

        {/* 8. 활용 팁 */}
        <section>
          <h2 className="g-h2">활용 팁 5가지</h2>
          <ol className="g-list">
            <li>브랜드 컬러를 입력 → Tailwind 11단계 즉시 생성 → 그대로 디자인 시스템에 채택</li>
            <li>시안의 핵심 색상을 추출 탭으로 뽑고 → 접근성 탭에서 텍스트 색상과 대비비 검증</li>
            <li>UI 상태 자동 생성(hover는 HSL 명도 −8%p, active는 −15%p)으로 버튼·링크 디자인 시간 절감</li>
            <li>브랜드 색상이 색맹 사용자에게 어떻게 보이는지 확인 → 명도/아이콘으로 보강</li>
            <li>인기 그라디언트 프리셋 9종을 시안 배경 제안용으로 빠르게 비교</li>
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            {[
              { href: '/tools/art/lorem',         icon: '📝', name: '더미 텍스트 생성기', desc: '문단·버튼·카드·JSON 더미 데이터' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 단위 변환기',     desc: 'px·rem·clamp() 변환' },
              { href: '/tools/art/charcount',     icon: '🔡', name: '글자수 세기',        desc: '공백 포함·제외 실시간 카운트' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',        desc: 'JSON 정렬·압축·유효성' },
              { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',         desc: '2·8·10·16진 + 비트 시각화' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul className="g-list">
            <li><strong>WCAG 2.2</strong> (대비 기준은 2.1과 동일) — <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">w3.org/TR/WCAG22</a> · <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer">WCAG 2.1</a></li>
            <li><strong>Tailwind CSS v4 색상</strong> — <a href="https://tailwindcss.com/docs/colors" target="_blank" rel="noopener noreferrer">tailwindcss.com/docs/colors</a></li>
            <li><strong>CSS Color Module Level 4</strong> — <a href="https://www.w3.org/TR/css-color-4/" target="_blank" rel="noopener noreferrer">w3.org/TR/css-color-4</a></li>
            <li><strong>Oklab 원문</strong> — <a href="https://bottosson.github.io/posts/oklab/" target="_blank" rel="noopener noreferrer">bottosson.github.io/posts/oklab</a></li>
            <li><strong>색맹 시뮬레이션 모델</strong> — <a href="https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html" target="_blank" rel="noopener noreferrer">Machado et al. 2009</a> · Brettel et al. 1997 · <a href="https://daltonlens.org/opensource-cvd-simulation/" target="_blank" rel="noopener noreferrer">daltonlens.org 구현 리뷰</a></li>
            <li><strong>색각 이상 유병률</strong> — <a href="https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1469" target="_blank" rel="noopener noreferrer">질병관리청 국가건강정보포털 &lsquo;색각이상(색맹)&rsquo;</a></li>
            <li><strong>한국 웹 접근성 인증</strong> — <a href="https://www.wa.or.kr/" target="_blank" rel="noopener noreferrer">wa.or.kr</a> · 확인일 2026-07-26</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
