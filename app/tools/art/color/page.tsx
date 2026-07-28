import ColorClient from './ColorClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

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

const FAQ_LD = [
              {
                q: 'RGBA와 HEXA의 차이는?',
                a: '둘 다 알파(투명도)를 포함하지만 표기법이 다릅니다. <strong>RGBA</strong>는 0~1 소수(<code>rgba(8,145,178,0.5)</code>), <strong>HEXA</strong>는 8자리 HEX(<code>#0891B280</code>)로 표기합니다. 80은 16진수로 128, 즉 50% 투명도입니다. 현대 CSS는 둘 다 지원하며, HEXA는 간결해 디자인 시스템에서 자주 사용됩니다.',
              },
              {
                q: 'WCAG 대비비 기준은 어떻게 정해졌나요?',
                a: 'WCAG는 W3C가 만든 국제 표준으로, <strong>시력 20/40 (정상의 절반) 사용자도 읽을 수 있도록</strong> 설정되었습니다 (AAA 7:1은 약 20/80 기준). 한국 웹 접근성 인증(KWCAG, WCAG 기반), 미국 ADA Title II 규칙(주·지방정부, WCAG 2.1 AA), 유럽 EAA(EN 301 549→WCAG 2.1 AA) 모두 WCAG 계열 기준을 채택하므로 <strong>처음부터 AA 이상을 목표로</strong> 디자인하는 것이 좋습니다.',
              },
              {
                q: 'OKLCH는 무엇이고 왜 채택해야 하나요?',
                a: '2020년 제안된 <strong>인간 시각에 균일한 색공간</strong>입니다. L(명도), C(채도), H(색상)으로 구성되며 — HSL의 큰 결점인 "노란색이 파란색보다 훨씬 밝게 보이는 문제"를 해결합니다. 채도 조절 시 명도가 흔들리지 않아 다크 모드 자동 변환에서 정확하며, CSS Color 4 표준에서 권장하고 있습니다. <strong>Tailwind 4·shadcn/ui</strong> 등 최신 디자인 시스템이 채택 중입니다.',
              },
              {
                q: '한 색상에서 어떤 팔레트를 만들어야 할까요?',
                a: '용도에 따라 다릅니다 — 브랜드 메인 컬러는 <strong>Tailwind 11단계(50~950)</strong>, 강조·대비가 필요하면 <strong>보색 또는 분할 보색</strong>, 부드러운 디자인은 <strong>유사색(±30°)</strong>, 다양한 카테고리 구분에는 <strong>삼각·사각 배색</strong>, 다크 모드용에는 <strong>단색 명도 단계</strong>가 적합합니다. 대부분의 디자인 시스템은 Primary 11단계 + Neutral 11단계 + Semantic 4종(Success/Warning/Error/Info)을 기본 구성으로 채택합니다.',
              },
              {
                q: '이미지에서 색상 추출은 정확한가요?',
                a: '본 도구는 <strong>픽셀 빈도 기반 단순 양자화 알고리즘</strong>을 사용합니다. 가볍고 빠르지만 미묘한 색상 차이를 무시하거나, 작지만 중요한 강조색을 놓칠 수 있고, 그라디언트 이미지에서는 부정확할 수 있습니다. 정밀한 추출이 필요하면 <strong>Adobe Color, Coolors</strong> 같은 전문 도구를 권장합니다. 본 도구의 결과는 빠른 팔레트 영감용으로 활용하세요.',
              },
            ]

export default function ColorPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />색상 코드 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        HEX·RGB·HSL·OKLCH 변환 + WCAG 대비비 + 팔레트·Tailwind 매칭·<strong style={{ color: 'var(--text)' }}>이미지 색 추출</strong>.
      </p>

      <ColorClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 색상 형식 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>색상 코드 형식 종합 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            본 도구는 12가지 색상 형식을 동시에 표시·변환합니다. 각 형식은 사용처가 명확히 다르므로, 적재적소에 맞는 표기를 선택하면 협업과 유지보수가 쉬워집니다.
            아래 예시는 모두 같은 색 <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>#0891B2</code>를 각 형식으로 표기한 값입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['형식', '예시', '주요 사용처'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HEX',    '#0891B2',                'HTML/CSS 표준, 디자인 툴 공통'],
                  ['HEXA',   '#0891B280',              '알파 포함 — 8자리 HEX (약 50% 알파)'],
                  ['RGB',    'rgb(8, 145, 178)',       'CSS, JavaScript, 이미지 처리'],
                  ['RGBA',   'rgba(8, 145, 178, 0.5)','반투명 색상 — 그림자·오버레이'],
                  ['HSL',    'hsl(192, 91%, 36%)',     '색상 직관 조작 — 명도 조절 쉬움'],
                  ['HSV',    'hsv(192, 96%, 70%)',     'Photoshop·Figma 등 디자인 툴 표준'],
                  ['CMYK',   'cmyk(96%, 19%, 0%, 30%)','인쇄 참고용 — 명함·브로슈어'],
                  ['HWB',    'hwb(192 3% 30%)',         '직관적 명도 — CSS Color 4'],
                  ['LAB',    'lab(55.1 -24.1 -27)',     '인간 시각 균일 색공간 — CSS lab() D50 기준'],
                  ['OKLCH',  'oklch(60.9% 0.111 221.7)','CSS Color 4 최신 표준 — Tailwind 4 기본'],
                ].map(([fmt, ex, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{fmt}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{ex}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. WCAG */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>WCAG 색상 대비비 (접근성)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            W3C가 정한 웹 접근성 표준 — 텍스트와 배경 색상의 명도 대비를 1:1 ~ 21:1 사이의 수치로 평가합니다.
            한국 정보접근성 인증(KWCAG)·미국 ADA Title II 규칙·유럽 EAA 모두 WCAG 계열 기준을 채택합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등급', '일반 텍스트', '큰 텍스트 (18pt+)', 'UI 컴포넌트'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AAA (최상)', '7 : 1 이상',  '4.5 : 1 이상', '— '],
                  ['AA (표준)',  '4.5 : 1 이상','3 : 1 이상',   '3 : 1 이상'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '10px 12px', color: j === 0 ? 'var(--accent)' : 'var(--text)', fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginTop: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '6px' }}>
              <strong style={{ color: 'var(--text)' }}>계산 공식:</strong> 대비비 = (밝은 색 휘도 + 0.05) / (어두운 색 휘도 + 0.05)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>상대 휘도(L):</strong> 0.2126 × R + 0.7152 × G + 0.0722 × B (각 채널은 sRGB → 선형 변환 후 적용)
            </p>
          </div>
        </section>

        {/* 3. 색맹 시뮬레이션 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>색맹 시뮬레이션</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            색각 이상은 북유럽계 기준 남성 약 8%, 여성 약 0.5%가 갖고 있습니다 (아시아·아프리카계는 이보다 낮음).
            한국은 남성 약 5.9%, 여성 약 0.4%로 남성 100만 명 이상 규모입니다 (질병관리청 국가건강정보포털).
            본 도구는 Machado 2009·Brettel 1997 모델(선형 RGB 적용)로 4가지 유형을 동시에 시뮬레이션합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {[
              { type: '적색맹 (Protanopia)',    pct: '남성 약 1%',  hint: 'L-cone 결손' },
              { type: '녹색맹 (Deuteranopia)',  pct: '남성 약 1%',  hint: 'M-cone 결손' },
              { type: '청색맹 (Tritanopia)',    pct: '매우 드뭄',   hint: 'S-cone 결손' },
              { type: '전색맹 (Achromatopsia)', pct: '극히 드뭄',   hint: '휘도만 지각' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{t.type}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{t.pct}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{t.hint}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '10px' }}>
            위 4종은 완전 이색자(색맹) 기준입니다. 실제로 가장 흔한 유형은 이보다 변화가 약한
            <strong style={{ color: 'var(--text)' }}> 녹색약(Deuteranomaly, 남성 약 5%)</strong>으로,
            색맹 시뮬레이션에서 구분이 어려운 조합은 녹색약 사용자에게도 부담이 됩니다.
          </p>
          <div style={{ marginTop: '14px', background: 'color-mix(in srgb, var(--danger) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--danger)' }}>디자인 가이드:</strong> 색상만으로 정보 전달 X (텍스트·아이콘 병행) · 빨강·녹색 조합 주의 · 명도 차이도 함께 활용 · 흑백 변환에서도 구분 가능한지 검증.
            </p>
          </div>
        </section>

        {/* 4. 팔레트 이론 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>팔레트 이론 (색상환 기반 8가지 조합)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            {[
              { icon: '⚖️', name: '보색 (Complementary)',   desc: '180° — 강한 대비, 주의 끌기, 브랜드 강조' },
              { icon: '🌊', name: '유사색 (Analogous)',     desc: '±30° — 조화로움, 자연스러운 그라디언트' },
              { icon: '🔺', name: '삼각 (Triadic)',         desc: '120° 간격 — 균형 있는 다채로움' },
              { icon: '🟦', name: '사각 (Tetradic)',        desc: '90° 간격 — 복잡하지만 풍부한 색감' },
              { icon: '✂️', name: '분할 보색',              desc: '보색의 인접 2색 — 강하지만 부드러움' },
              { icon: '🌗', name: '단색 (Monochromatic)',   desc: '같은 색의 명도 변화 — 미니멀 디자인' },
              { icon: '💧', name: '톤 (Tones)',             desc: '같은 색의 채도 변화 (회색 섞기) — 차분한 분위기' },
              { icon: '🎨', name: 'Tailwind 11단계',        desc: '50/100/.../900/950 — 디자인 시스템 표준' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{p.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 디자인 토큰·CSS 변수 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>디자인 토큰·CSS 변수</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            현대 웹 개발의 표준 — Tailwind, shadcn/ui, MUI, Chakra 모두 동일한 패턴을 따릅니다. 본 도구는 한 색상에서 11단계 스케일과 다양한 형식의 CSS 변수를 자동 생성합니다.
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)', overflow: 'auto', lineHeight: 1.8 }}>{`:root {
  /* #0891B2 입력 시 실제 생성 예시 */
  --color-primary-50:  #f4f9fb;
  --color-primary-500: #0bc5f4;  /* 명도 정규화 단계 (L 50%) */
  --color-primary-900: #0a4351;

  /* 입력한 기준색 + 다중 형식 (color-mix·alpha 조작용) */
  --color-primary:     #0891b2;
  --color-primary-rgb: 8 145 178;
  --color-primary-hsl: 192 91% 36%;
}`}</pre>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
            500 단계는 입력색이 아니라 명도를 50%로 정규화한 값입니다 — 입력한 기준색 자체는 <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>--color-primary</code>로 함께 내보냅니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>장점:</strong> 다크 모드 쉽게(변수만 교체) · 디자인 일관성 · 유지보수 용이 · 디자인 시스템 표준
          </p>
        </section>

        {/* 6. Tailwind */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>Tailwind CSS 색상 시스템</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            Tailwind v4는 26개 기본 색상 × 11단계 = <strong style={{ color: 'var(--text)' }}>총 286개 색상</strong>을 제공합니다 — slate, gray, zinc, neutral, stone에 v4.1+에서 추가된 taupe, mauve, mist, olive까지 무채색·저채도 9종, red부터 rose까지 유채색 17종. v4부터 색이 OKLCH로 정의되고, 커스텀 색상도 <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>tailwind.config.js</code> 대신 CSS의 <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>@theme</code> 블록에 CSS 변수로 선언합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구의 <strong style={{ color: 'var(--text)' }}>가장 가까운 Tailwind 매칭</strong> 기능은 입력한 색과 RGB 유클리드 거리가 가장 가까운 5개 클래스를 v4 팔레트(sRGB 변환값) 기준으로 자동 추천합니다. 디자이너가 시안에서 정한 색을 개발자가 Tailwind 클래스로 옮길 때 매우 유용합니다.
          </p>
        </section>

        {/* 7. 그라디언트 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>그라디언트 디자인</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            CSS는 3가지 그라디언트 함수를 제공합니다 — <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>linear-gradient</code> (직선 방향), <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>radial-gradient</code> (원형), <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>conic-gradient</code> (회전).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            {[
              { tip: '비슷한 색상 조합', desc: '자연스럽고 부드러운 분위기' },
              { tip: '보색 조합',         desc: '강렬하고 시선을 끄는 효과' },
              { tip: '3색 메시 그라디언트', desc: '풍부한 색감 — 영화 포스터 느낌' },
              { tip: '같은 색의 명도 변화', desc: '세련되고 통일감 있는 분위기' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '3px' }}>{t.tip}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '14px' }}>
            <strong style={{ color: 'var(--text)' }}>접근성 주의:</strong> 그라디언트 위 텍스트는 가장 어두운/밝은 부분 기준으로 대비비를 확인하세요. 본 도구의 <em>10단계 색상 미리보기</em>가 전 구간 색상을 보여주므로 가독성 검증에 활용 가능합니다.
          </p>
        </section>

        {/* 8. 활용 팁 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>활용 팁 5가지</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              '브랜드 컬러를 입력 → Tailwind 11단계 즉시 생성 → 그대로 디자인 시스템에 채택',
              '시안의 핵심 색상을 추출 탭으로 뽑고 → 접근성 탭에서 텍스트 색상과 대비비 검증',
              'UI 상태 자동 생성 (hover -8% / active -15%)으로 버튼·링크 디자인 시간 절감',
              '브랜드 색상이 색맹 사용자에게 어떻게 보이는지 확인 → 명도/아이콘으로 보강',
              '인기 그라디언트 프리셋 9종을 시안 백그라운드 제안용으로 빠르게 비교',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '10px', alignItems: 'baseline', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
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
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            {[
              { href: '/tools/art/lorem',         icon: '📝', name: '더미 텍스트 생성기', desc: '문단·버튼·카드·JSON 더미 데이터' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 단위 변환기',     desc: 'px·rem·clamp() 변환' },
              { href: '/tools/art/charcount',     icon: '🔡', name: '글자수 세기',        desc: '공백 포함·제외 실시간 카운트' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',        desc: 'JSON 정렬·압축·유효성' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 변환' },
              { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',         desc: '2·8·10·16진 + 비트 시각화' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>WCAG 2.1</strong> — <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>w3.org/TR/WCAG21</a></li>
            <li><strong style={{ color: 'var(--text)' }}>Tailwind CSS v4 색상</strong> — <a href="https://tailwindcss.com/docs/colors" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>tailwindcss.com/docs/colors</a></li>
            <li><strong style={{ color: 'var(--text)' }}>CSS Color Module Level 4</strong> — <a href="https://www.w3.org/TR/css-color-4/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>w3.org/TR/css-color-4</a></li>
            <li><strong style={{ color: 'var(--text)' }}>OKLCH 제안</strong> — <a href="https://bottosson.github.io/posts/oklab/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>bottosson.github.io/posts/oklab</a></li>
            <li><strong style={{ color: 'var(--text)' }}>색맹 시뮬레이션 모델</strong> — <a href="https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Machado et al. 2009</a> · Brettel et al. 1997 · <a href="https://daltonlens.org/opensource-cvd-simulation/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>daltonlens.org 구현 리뷰</a></li>
            <li><strong style={{ color: 'var(--text)' }}>색각 이상 유병률</strong> — <a href="https://health.kdca.go.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>질병관리청 국가건강정보포털</a></li>
            <li><strong style={{ color: 'var(--text)' }}>한국 웹 접근성 인증</strong> — <a href="https://www.wa.or.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>wa.or.kr</a> · 확인일 2026-07-26</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
