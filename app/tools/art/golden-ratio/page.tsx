import Link from 'next/link'
import GoldenRatioClient from './GoldenRatioClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'

/* 가이드 표는 손으로 적지 않고 도구와 같은 식으로 빌드 시 계산한다 (GoldenRatioClient의 PHI·비교식과 동일) */
const PHI = (1 + Math.sqrt(5)) / 2
const f2 = (n: number) => n.toFixed(2)
/* 비율 변환 탭과 같은 비교식: 가로형(W≥H)은 φ, 세로형(H>W)은 1/φ 대비 차이(%) */
const diffPct = (w: number, h: number) => {
  const target = h > w ? 1 / PHI : PHI
  return ((w / h - target) / target) * 100
}
const fmtDiff = (d: number) => (Math.abs(d) < 0.005 ? '0%' : `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(2)}%`)

/* 계산기 탭의 프리셋과 같은 값 — 긴 변(A)을 넣었을 때의 결과 */
const PRESET_ROWS = [
  { label: '명함 가로', a: 90, unit: 'mm' },
  { label: 'A4 긴 변', a: 297, unit: 'mm' },
  { label: '인스타 정사각 한 변', a: 1080, unit: 'px' },
  { label: '유튜브 썸네일 가로', a: 1280, unit: 'px' },
]

const RATIO_ROWS = [
  { n: '황금 비율 (φ)', w: PHI, h: 1, u: '디자인·예술 — 대표적 미적 비율', c: 'var(--accent-ink)' },
  { n: '16:10', w: 16, h: 10, u: '1920×1200 모니터·일부 노트북 — 흔한 화면비 중 φ에 가장 가까움', c: 'var(--cat-edu)' },
  { n: '3:2', w: 3, h: 2, u: '35mm 카메라 사진 표준', c: 'var(--cat-finance)' },
  { n: '백은 비율 (√2)', w: Math.SQRT2, h: 1, u: 'A4·B5 등 종이 규격 — 반 접어도 같은 비율', c: 'var(--cat-health)' },
  { n: '16:9 (HD)', w: 16, h: 9, u: '유튜브·TV·모니터·가로 영상', c: 'var(--cat-sports)' },
  { n: '4:3', w: 4, h: 3, u: '구식 TV·아이패드·일부 카메라', c: 'var(--cat-art)' },
  { n: '21:9 (시네마)', w: 21, h: 9, u: '울트라와이드 모니터', c: 'var(--danger)' },
  { n: '1:1 (정사각)', w: 1, h: 1, u: '인스타 정사각 게시물·앨범 커버·로고', c: 'var(--text)' },
  { n: '9:16 (세로)', w: 9, h: 16, u: '인스타 스토리·릴스·틱톡 (모바일 세로)', c: 'var(--cat-life)' },
  { n: '4:5 (세로)', w: 4, h: 5, u: '인스타 세로 게시물 1080×1350', c: 'var(--cat-life)' },
]

export const metadata = buildMetadata({
  path: '/tools/art/golden-ratio',
  title: '황금 비율 계산기 — 1:1.618 가로세로·황금분할·피보나치 나선',
  description: '황금 비율 φ=1.618로 긴 변·짧은 변·전체 길이 자동 계산 + 가로세로 비율(W:H)과 황금비 차이 비교 + 황금 직사각형·나선 시각화. 16:9·A4·인스타·유튜브 비율 비교까지.',
  keywords: ['황금비율계산기', '황금비계산기', '황금분할', '1:1.618', '피보나치계산기', '디자인비율계산기', '황금비율', '황금나선', '황금사각형', '비율비교', '백은비율', '16:9 비율', '이미지 비율 계산'],
})

const FAQ_LD = [
              { q: '황금 비율과 황금 분할의 차이는?',
                a: '같은 개념의 다른 표현입니다. &ldquo;황금 비율(Golden Ratio)&rdquo;은 비율 자체인 φ = 1.618...을 가리키고, &ldquo;황금 분할(Golden Section)&rdquo;은 선분을 이 비율로 나누는 작업을 뜻합니다. 실무에서는 구분 없이 혼용하는 경우가 많습니다.' },
              { q: '황금 비율이 아름답게 느껴지는 이유는?',
                a: '인간의 시지각이 자연에서 반복적으로 학습한 비율이라는 진화적 설명과, 수학적으로 자기 유사성(fractal)이 있어 시선의 흐름을 안정적으로 유도한다는 인지심리학적 설명이 공존합니다. 다만 모든 사람이 황금 비율만을 아름답다고 느끼는 것은 아니며, 실험 결과는 문화·개인차에 따라 다릅니다.' },
              { q: '유튜브 썸네일에 황금 비율을 어떻게 적용하나요?',
                a: '유튜브 썸네일은 16:9 비율이 기준이라(공식 도움말 기준 최소 너비 640px, 권장 해상도 3840×2160px — 널리 쓰는 1280×720px도 사용 가능) 이미지 비율 자체를 바꿀 수는 없습니다. 대신 썸네일 내부 구도를 황금 비율로 설계하세요. 예를 들어 가로 1280px 썸네일이라면 61.8% : 38.2%로 나눈 791px 지점에 주요 피사체를 배치하면 시각적으로 안정감이 생깁니다. 이 계산기 [비율 변환] 탭에서 현재 이미지 비율과 황금 비율의 차이를 확인할 수 있습니다.' },
              { q: '황금 비율과 백은 비율(√2:1)의 차이는?',
                a: '디자인에서 말하는 백은 비율(白銀比)은 1:√2 ≈ 1:1.414로, A4 용지(297×210mm) 등 종이 규격(A/B 시리즈)에 적용된 비율입니다. 반을 접어도 같은 비율이 유지되는 실용적 특성이 있으며, 한국의 금강비·일본의 야마토비(大和比)와 같은 비율입니다. 황금 비율은 미적·디자인적 비율, 백은 비율은 실용적·기능적 비율이라고 보면 구분하기 쉽습니다. 참고로 수학에서 은비(Silver Ratio)의 표준 정의는 1+√2 ≈ 2.414(제2 금속비)로, 디자인 관행 용법과 병존합니다.' },
              { q: '피보나치 수열이 황금 비율과 연관된 이유는?',
                a: '피보나치 수열의 점화식 F(n+1) = F(n) + F(n-1)을 비율 F(n+1)/F(n) = R로 정리하면 R² - R - 1 = 0이라는 이차방정식이 됩니다. 이 방정식의 양의 해가 정확히 (1+√5)/2, 즉 φ입니다. 그래서 피보나치 수열의 인접 비율은 필연적으로 φ에 수렴합니다.' },
            ]

export default function GoldenRatioPage() {
  return (
    <ToolPage width={760} slug="/tools/art/golden-ratio">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />황금 비율 계산기
      </h1>
      <p className="tp-lead">
        φ = 1.618 가로·세로 + 황금 직사각형·나선 시각화 + <strong style={{ color: 'var(--text)' }}>16:9·A4·인스타·유튜브 비교</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="φ = (1+√5)/2 — 유클리드 『원론』 6권 정의 3(외중비) · 자연·예술 사례 검증 = Markowsky(1992)·Falbo(2005)·Swinton & Ochu(2016) · 종이 비율 = ISO 216 · 썸네일 규격 = YouTube 고객센터"
        sources={[
          { label: '유클리드 『원론』 6권 정의 3 — 외중비 (D. Joyce 편, Clark Univ.)', href: 'https://mathcs.clarku.edu/~djoyce/elements/bookVI/defVI3.html' },
          { label: 'OEIS A001622 — φ의 소수 전개', href: 'https://oeis.org/A001622' },
          { label: 'Markowsky, Misconceptions about the Golden Ratio (1992)', href: 'https://doi.org/10.1080/07468342.1992.11973428' },
          { label: 'Swinton & Ochu, 해바라기 나선 시민과학 실측 (2016)', href: 'https://royalsocietypublishing.org/doi/10.1098/rsos.160091' },
          { label: 'ISO 216 (A·B 시리즈 용지 규격)', href: 'https://www.iso.org/standard/36631.html' },
          { label: 'YouTube 고객센터 — 맞춤 미리보기 이미지', href: 'https://support.google.com/youtube/answer/72431' },
        ]}
      />

      <GoldenRatioClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 황금 비율이란? ── */}
        <div>
          <h2 className="g-h2">
            황금 비율(φ)이란?
          </h2>
          <p className="g-p">
            황금 비율(Golden Ratio)은 두 양 a, b(a &gt; b)에 대해 <strong style={{ color: 'var(--text)' }}>(a+b) : a = a : b</strong>가 성립할 때의 비율로,
            그리스 문자 <strong style={{ color: 'var(--text)' }}>φ(피, phi)</strong>로 표기합니다 — 원주율 π(파이)와는 다른 문자입니다.
            예로부터 &ldquo;가장 아름다운 비율&rdquo;로 불려 왔지만, 널리 알려진 자연·예술 사례 중 상당수는 근거가 약합니다(아래 사실·속설 정리 참고).
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-line)', borderRadius: 'var(--radius-card)', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>황금 비율 공식</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              φ = (1 + √5) / 2
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '28px', fontWeight: 800, color: 'var(--accent-ink)', letterSpacing: '-0.5px' }}>
              = 1.6180339887...
            </p>
          </div>

          <p className="g-p">
            피보나치 수열(1, 1, 2, 3, 5, 8, 13, 21, 34...)에서 인접한 두 수의 비율은
            항이 커질수록 φ에 수렴합니다. 예를 들어 21 ÷ 13 = 1.615, 34 ÷ 21 = 1.619, 55 ÷ 34 = 1.6176...
            수학·자연·디자인을 연결하는 핵심 상수입니다.
          </p>
        </div>

        {/* ── 1-2. 계산 원리 (도구 로직 그대로) ── */}
        <div>
          <h2 className="g-h2">
            계산 원리 — 긴 변·짧은 변·전체 중 하나만 알면 된다
          </h2>
          <p className="g-p">
            [황금 비율 계산] 탭은 세 값 중 하나를 기준으로 나머지 둘을 구합니다. φ에는 <strong>1/φ = φ − 1 ≈ 0.618</strong>,
            <strong> 1/φ² = 2 − φ ≈ 0.382</strong>라는 성질이 있어서, 황금 분할된 전체 길이 T에서 긴 변 A는 항상 약 61.8%, 짧은 변 B는 약 38.2%를 차지합니다.
          </p>
          <ul className="g-list">
            <li><strong>긴 변(A)을 넣으면</strong> — B = A ÷ φ, T = A + B. 예: A = 100 → B = 61.80, T = 161.80</li>
            <li><strong>짧은 변(B)을 넣으면</strong> — A = B × φ, T = A + B. 예: 본문 글자 16px을 B로 두면 A = 25.89px(제목 크기 후보)</li>
            <li><strong>전체(T)를 넣으면</strong> — A = T ÷ φ, B = T − A. 예: 1000px 폭 → 618.03px + 381.97px</li>
          </ul>
          <p className="g-p">
            계산은 φ를 소수 16자리(1.6180339887498948)까지 쓰고, 화면에는 선택한 소수점 자릿수(0~3)로 반올림해 보여 줍니다.
            아래 표는 도구의 프리셋 버튼을 눌렀을 때와 같은 값으로, 빌드할 때 같은 식으로 계산해 넣은 것입니다(소수 둘째 자리).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['프리셋', '긴 변 A', '짧은 변 B = A ÷ φ', '전체 T = A + B'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRESET_ROWS.map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.a}{r.unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-ink)' }}>{f2(r.a / PHI)}{r.unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{f2(r.a + r.a / PHI)}{r.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 프리셋은 규격의 &lsquo;긴 변 하나&rsquo;만 가져와 황금 분할한 값입니다. 예를 들어 명함 90mm를 넣으면 짧은 변 55.62mm가 나오는데,
            국내에서 흔히 쓰는 90×50mm 명함 자체가 황금 직사각형이라는 뜻은 아닙니다(90÷50 = 1.8).
          </p>
        </div>

        {/* ── 2. 자연과 예술 속 황금 비율 — 사실과 속설 ── */}
        <div>
          <h2 className="g-h2">
            자연과 예술 속 황금 비율 — 사실과 속설
          </h2>
          <p className="g-p">
            파르테논·모나리자·앵무조개 같은 유명 사례 대부분은 후대에 덧씌워진 통설로, 수학계 검증에서 반박됐습니다.
            실제로 확인되는 사례와 구분해 정리했습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { cat: '사실 · 식물', fact: true,  title: '해바라기·솔방울 잎차례', desc: '두상화의 시계·반시계 나선 개수가 34·55처럼 인접 피보나치 수로 나타남 — 황금각 137.5°(=360°/φ²) 잎차례로 설명되는 실증 현상. 다만 시민과학 실측(해바라기 657송이에서 읽어 낸 나선 수 768개)에서 약 74%만 피보나치 수였고, 예외도 존재' },
              { cat: '사실 · 기하', fact: true,  title: '정오각형·펜타그램',     desc: '정오각형의 대각선과 변의 비율이 정확히 φ — 유클리드 『원론』이 다룬 수학적 사실' },
              { cat: '속설 · 건축', fact: false, title: '파르테논 신전',         desc: '황금비 설계 기록은 없고, 실측 정면 비율도 약 9:4(=2.25)로 φ와 불일치. φ가 문헌에 정의된 것도 신전 완공보다 약 130년 뒤(유클리드)' },
              { cat: '속설 · 회화', fact: false, title: '모나리자·최후의 만찬',   desc: '다빈치가 구도에 황금비를 썼다는 기록 없음 — 후대의 자의적 덧그리기로 평가. 다빈치는 파치올리의 황금비 책 삽화를 그렸을 뿐' },
              { cat: '속설 · 자연', fact: false, title: '앵무조개 껍데기',       desc: '로그 나선인 것은 맞지만 실측 성장비는 1/4바퀴당 평균 약 1.31~1.33으로 황금 나선(φ=1.618)이 아님' },
              { cat: '속설 · 기타', fact: false, title: '애플 로고·인체 배꼽 비율', desc: '애플 로고 디자이너는 "거의 프리핸드로 그렸다"며 황금비 사용을 부인했고, 배꼽 기준 1:1.618도 개인차가 커 인체 상수가 아님' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '11px', color: item.fact ? 'var(--success)' : 'var(--warning)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.cat}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-note">
            * 검증 출처: Markowsky, &ldquo;Misconceptions about the Golden Ratio&rdquo;, College Mathematics Journal (1992) · Falbo, College Mathematics Journal (2005) · Swinton 외, Royal Society Open Science (2016)
          </p>
        </div>

        {/* ── 3. 디자이너를 위한 활용 팁 ── */}
        <div>
          <h2 className="g-h2">
            디자이너를 위한 활용 팁
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '1. 로고 디자인 — 요소 크기 비율',
                ink: 'var(--accent-ink)',
                desc: '로고의 심볼과 텍스트, 여백 사이 관계를 황금 비율로 정하면 시각적 안정감이 생깁니다.',
                example: '심볼 크기 100px → 텍스트 크기 61.8px, 좌우 여백 38.2px',
              },
              {
                title: '2. 레이아웃 — 본문과 사이드바',
                ink: 'var(--cat-finance)',
                desc: '웹사이트 2단 레이아웃에서 콘텐츠와 사이드바를 61.8% : 38.2%로 나누면 황금 비율 구도가 됩니다.',
                example: '전체 1000px → 본문 618px + 사이드바 382px',
              },
              {
                title: '3. 타이포그래피 — 제목과 본문',
                ink: 'var(--cat-health)',
                desc: '본문 폰트 크기에 φ를 곱한 값을 제목 크기로 사용하면 자연스러운 위계가 생깁니다.',
                example: '본문 16px × 1.618 ≈ 26px (H3), × 1.618² ≈ 42px (H1)',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.ink, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '8px' }}>{item.desc}</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '10px 14px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text)' }}>
                  예: {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 피보나치 수열표 ── */}
        <div>
          <h2 className="g-h2">
            피보나치 수열과 φ의 수렴
          </h2>
          <p className="g-p">
            피보나치 수열은 앞 두 항을 더해 다음 항을 만드는 수열입니다: <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...</strong>
            인접한 두 항의 비율은 항이 커질수록 φ = 1.618에 수렴합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항 (n)', '값 F(n)', '비율 F(n)/F(n-1)', '차이'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 2, f: 1,   ratio: '-',      diff: '-' },
                  { n: 3, f: 2,   ratio: '2.0000', diff: '+23.6%' },
                  { n: 4, f: 3,   ratio: '1.5000', diff: '-7.3%' },
                  { n: 5, f: 5,   ratio: '1.6667', diff: '+3.0%' },
                  { n: 6, f: 8,   ratio: '1.6000', diff: '-1.1%' },
                  { n: 7, f: 13,  ratio: '1.6250', diff: '+0.43%' },
                  { n: 8, f: 21,  ratio: '1.6154', diff: '-0.16%' },
                  { n: 9, f: 34,  ratio: '1.6190', diff: '+0.06%' },
                  { n: 10, f: 55, ratio: '1.6176', diff: '-0.02%' },
                  { n: 11, f: 89, ratio: '1.6182', diff: '+0.01%' },
                  { n: 12, f: 144, ratio: '1.6180', diff: '≈ 0%' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>n = {row.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{row.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row.ratio}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 12항만 가도 소수점 4자리까지 φ와 일치할 만큼 수렴이 빠릅니다.
          </p>
        </div>

        {/* ── 5. 황금 비율 vs 다른 비율 — 차이는 비율 변환 탭과 같은 식으로 빌드 시 계산 ── */}
        <div>
          <h2 className="g-h2">
            황금 비율 vs 다른 비율
          </h2>
          <p className="g-p">
            황금 비율은 여러 선택지 중 하나일 뿐, 매체마다 이미 정해진 비율이 있습니다. 아래 &lsquo;φ 대비 차이&rsquo;는 [비율 변환] 탭에 가로·세로를 넣었을 때 나오는 값과 같습니다.
            흔한 화면비 중에서는 <strong>16:10(1.600)</strong>이 φ와 1.11% 차이로 가장 가깝고, 우리가 매일 보는 16:9는 φ보다 약 9.9% 더 넓습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>비율</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>값 (가로/세로)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>φ 대비 차이</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>주요 사용처</th>
                </tr>
              </thead>
              <tbody>
                {RATIO_ROWS.map((r, i) => (
                  <tr key={r.n} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700 }}>{(r.w / r.h).toFixed(3)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{fmtDiff(diffPct(r.w, r.h))}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 세로형(9:16·4:5)은 세로 황금비(가로:세로 = 1:1.618, 즉 0.618)와 비교한 값입니다. 영화관 스코프 화면은 21:9(2.333)가 아니라 약 2.39:1이라 표에서 따로 다루지 않았습니다.
          </p>
        </div>

        {/* ── 5-2. 비율 변환 탭 결과 읽는 법 ── */}
        <div>
          <h2 className="g-h2">
            [비율 변환] 탭 결과 읽는 법
          </h2>
          <p className="g-p">
            가로(W)·세로(H)를 넣으면 세 가지가 나옵니다. 첫째 <strong>현재 비율</strong>은 두 값을 1000배 해 정수로 만든 뒤 최대공약수로 나눈 단순비입니다.
            항이 100을 넘으면(예: 1618×1000) 분모 1~40 중 오차 0.5% 이내인 가장 작은 비로 바꾸고 앞에 &lsquo;≈&rsquo;를 붙입니다.
            둘째 <strong>황금 비율 대비 차이</strong>는 (W/H − φ) ÷ φ × 100으로 계산하며, 세로가 더 긴 입력은 기준을 1/φ(0.618)로 바꿔 비교합니다. 차이가 ±1% 안이면 황금 비율에 근접한 것으로 강조 표시됩니다.
            셋째 <strong>제안값</strong>은 한 변을 그대로 두고 다른 변을 φ에 맞춘 길이입니다.
          </p>
          <ul className="g-list">
            <li><strong>1920×1080 (풀HD)</strong> — 현재 비율 16:9, 소수 비율 {f2(1920 / 1080)}, 차이 {fmtDiff(diffPct(1920, 1080))}. 세로 1080을 유지하면 가로 {f2(1080 * PHI)}, 가로 1920을 유지하면 세로 {f2(1920 / PHI)}이 황금 비율입니다.</li>
            <li><strong>1080×1350 (인스타 세로 4:5)</strong> — 세로형이라 0.618과 비교해 차이 {fmtDiff(diffPct(1080, 1350))}. 세로 1350 유지 시 가로 {f2(1350 / PHI)}, 가로 1080 유지 시 세로 {f2(1080 * PHI)}.</li>
          </ul>
          <p className="g-p">
            플랫폼이 비율을 정해 둔 이미지(썸네일 16:9, 스토리 9:16)는 제안값대로 캔버스를 바꾸면 잘리거나 여백이 생깁니다.
            이런 경우에는 캔버스는 그대로 두고, 제안값을 &lsquo;내부 구도&rsquo;에 쓰는 편이 현실적입니다. 예를 들어 1280px 썸네일이라면 왼쪽에서 {f2(1280 / PHI)}px 또는 {f2(1280 - 1280 / PHI)}px 지점에 세로 기준선을 두고 주요 피사체를 배치합니다.
          </p>
        </div>

        {/* ── 5-3. 흔한 실수와 한계 ── */}
        <div>
          <h2 className="g-h2">
            자주 하는 실수와 적용 시 주의점
          </h2>
          <ul className="g-list">
            <li>
              <strong>단위 버튼은 환산기가 아닙니다.</strong> px·cm·mm·pt·inch 단위 버튼은 결과 옆에 붙는 표기일 뿐이라, 90을 입력하고 mm에서 px로 바꿔도 숫자는 그대로 55.62입니다.
              인쇄물(mm)을 화면 픽셀로 옮기려면 해상도가 필요합니다 — 300dpi 기준 1mm ≈ 11.81px이므로 명함 90mm는 약 1063px, 짧은 변 55.62mm는 약 657px입니다.
            </li>
            <li>
              <strong>여백(gap)을 빼고 나누세요.</strong> 1000px 컨테이너를 618:382로 나누는 예시는 간격이 0일 때 이야기입니다. 칼럼 사이에 24px 간격이 있다면 976px을 나눠야 하므로
              본문 {f2(976 / PHI)}px + 사이드바 {f2(976 - 976 / PHI)}px이 됩니다. 간격을 포함해 나누면 두 칼럼 비율이 φ에서 벗어납니다.
            </li>
            <li>
              <strong>긴 변과 짧은 변을 헷갈리지 마세요.</strong> 짧게 쓰고 싶은 값을 &lsquo;긴 변(A)&rsquo; 칸에 넣으면 결과가 기대보다 38.2% 작게 나옵니다. 기준으로 삼을 값이 짧은 쪽이면 [짧은 변(B) → A 계산]을 고르세요.
            </li>
            <li>
              <strong>픽셀은 정수로 반올림해도 됩니다.</strong> 667.48px을 667px로 써도 비율 오차는 0.1% 미만이라 눈으로 구별되지 않습니다. 정수 격자가 필요하면 피보나치 쌍(8:5, 13:8, 21:13)을 쓰면 오차가 각각 1.1%, 0.43%, 0.16%입니다.
            </li>
            <li>
              <strong>3분할 구도와 다릅니다.</strong> 사진의 3분할선은 가장자리에서 33.3% 지점이고, 황금 분할선(이른바 파이 그리드)은 38.2% 지점이라 화면 중앙에 조금 더 가깝습니다. 카메라의 격자 표시는 대부분 3분할이므로 둘을 같은 것으로 보면 안 됩니다.
            </li>
          </ul>
          <Callout tone="note" title="황금 비율은 규칙이 아니라 출발점">
            황금 비율이 다른 비율보다 더 아름답게 느껴진다는 주장은 실험마다 결과가 엇갈립니다. 매체 규격(16:9·A4)이나 본문 가독성(한 줄 길이·글자 크기)처럼 먼저 지켜야 할 조건이 있다면 그쪽이 우선이고, 황금 비율은 남은 자유도 안에서 비례를 정하는 기준 하나로 쓰는 편이 안전합니다.
          </Callout>
        </div>

        {/* ── 6. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/color',     icon: '🎨', name: '색상 코드 변환기',  desc: 'HEX·RGB·HSL 즉시 변환' },
              { href: '/tools/unit/converter', icon: '📏', name: '단위 변환기',       desc: '길이·면적 등 14종 변환' },
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 수 비율 자동 계산' },
              { href: '/tools/art/lorem',     icon: '📝', name: '더미 텍스트 생성기', desc: '레이아웃 검증용 더미' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
