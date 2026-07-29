import Link from 'next/link'
import GoldenRatioClient from './GoldenRatioClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

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
                a: '유튜브 썸네일은 16:9 비율이 기준이라(공식 도움말 기준 최소 너비 640px, 권장 해상도 3840×2160px — 널리 쓰는 1280×720px도 사용 가능) 이미지 비율 자체를 바꿀 수는 없습니다. 대신 썸네일 내부 구도를 황금 비율로 설계하세요. 예를 들어 가로 1280px 썸네일이라면 61.8% : 38.2%로 나눈 792px 지점에 주요 피사체를 배치하면 시각적으로 안정감이 생깁니다. 이 계산기 [비율 변환] 탭에서 현재 이미지 비율과 황금 비율의 차이를 확인할 수 있습니다.' },
              { q: '황금 비율과 백은 비율(√2:1)의 차이는?',
                a: '디자인에서 말하는 백은 비율(白銀比)은 1:√2 ≈ 1:1.414로, A4 용지(297×210mm) 등 종이 규격(A/B 시리즈)에 적용된 비율입니다. 반을 접어도 같은 비율이 유지되는 실용적 특성이 있으며, 한국의 금강비·일본의 야마토비(大和比)와 같은 비율입니다. 황금 비율은 미적·디자인적 비율, 백은 비율은 실용적·기능적 비율이라고 보면 구분하기 쉽습니다. 참고로 수학에서 은비(Silver Ratio)의 표준 정의는 1+√2 ≈ 2.414(제2 금속비)로, 디자인 관행 용법과 병존합니다.' },
              { q: '피보나치 수열이 황금 비율과 연관된 이유는?',
                a: '피보나치 수열의 점화식 F(n+1) = F(n) + F(n-1)을 비율 F(n+1)/F(n) = R로 정리하면 R² - R - 1 = 0이라는 이차방정식이 됩니다. 이 방정식의 양의 해가 정확히 (1+√5)/2, 즉 φ입니다. 그래서 피보나치 수열의 인접 비율은 필연적으로 φ에 수렴합니다.' },
            ]

export default function GoldenRatioPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />황금 비율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        φ = 1.618 가로·세로 + 황금 직사각형·나선 시각화 + <strong style={{ color: 'var(--text)' }}>16:9·A4·인스타·유튜브 비교</strong>.
      </p>

      <GoldenRatioClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 황금 비율이란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            황금 비율(φ)이란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            황금 비율(Golden Ratio)은 두 양 a, b(a &gt; b)에 대해 <strong style={{ color: 'var(--text)' }}>(a+b) : a = a : b</strong>가 성립할 때의 비율로,
            그리스 문자 <strong style={{ color: 'var(--text)' }}>φ(피, phi)</strong>로 표기합니다 — 원주율 π(파이)와는 다른 문자입니다.
            예로부터 &ldquo;가장 아름다운 비율&rdquo;로 불려 왔지만, 널리 알려진 자연·예술 사례 중 상당수는 근거가 약합니다(아래 사실·속설 정리 참고).
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>황금 비율 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              φ = (1 + √5) / 2
            </p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
              = 1.6180339887...
            </p>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            피보나치 수열(1, 1, 2, 3, 5, 8, 13, 21, 34...)에서 인접한 두 수의 비율은
            항이 커질수록 φ에 수렴합니다. 예를 들어 21 ÷ 13 = 1.615, 34 ÷ 21 = 1.619, 55 ÷ 34 = 1.6176...
            수학·자연·디자인을 연결하는 핵심 상수입니다.
          </p>
        </div>

        {/* ── 2. 자연과 예술 속 황금 비율 — 사실과 속설 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            자연과 예술 속 황금 비율 — 사실과 속설
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            파르테논·모나리자·앵무조개 같은 유명 사례 대부분은 후대에 덧씌워진 통설로, 수학계 검증에서 반박됐습니다.
            실제로 확인되는 사례와 구분해 정리했습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { cat: '사실 · 식물', fact: true,  title: '해바라기·솔방울 잎차례', desc: '두상화의 시계·반시계 나선 개수가 34·55처럼 인접 피보나치 수로 나타남 — 황금각 137.5°(=360°/φ²) 잎차례로 설명되는 실증 현상. 다만 시민과학 실측(해바라기 657송이)에서 약 74%가 해당, 예외도 존재' },
              { cat: '사실 · 기하', fact: true,  title: '정오각형·펜타그램',     desc: '정오각형의 대각선과 변의 비율이 정확히 φ — 유클리드 『원론』이 다룬 수학적 사실' },
              { cat: '속설 · 건축', fact: false, title: '파르테논 신전',         desc: '황금비 설계 기록은 없고, 실측 정면 비율도 약 9:4(=2.25)로 φ와 불일치. φ가 문헌에 정의된 것도 신전 완공보다 약 130년 뒤(유클리드)' },
              { cat: '속설 · 회화', fact: false, title: '모나리자·최후의 만찬',   desc: '다빈치가 구도에 황금비를 썼다는 기록 없음 — 후대의 자의적 덧그리기로 평가. 다빈치는 파치올리의 황금비 책 삽화를 그렸을 뿐' },
              { cat: '속설 · 자연', fact: false, title: '앵무조개 껍데기',       desc: '로그 나선인 것은 맞지만 실측 성장비는 1/4바퀴당 평균 약 1.31~1.33으로 황금 나선(φ=1.618)이 아님' },
              { cat: '속설 · 기타', fact: false, title: '애플 로고·인체 배꼽 비율', desc: '애플 로고 디자이너는 "거의 프리핸드로 그렸다"며 황금비 사용을 부인했고, 배꼽 기준 1:1.618도 개인차가 커 인체 상수가 아님' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '11px', color: item.fact ? 'var(--success)' : 'var(--warning)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.cat}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 검증 출처: Markowsky, &ldquo;Misconceptions about the Golden Ratio&rdquo;, College Mathematics Journal (1992) · Falbo, College Mathematics Journal (2005) · Swinton 외, Royal Society Open Science (2016)
          </p>
        </div>

        {/* ── 3. 디자이너를 위한 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            디자이너를 위한 활용 팁
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '1. 로고 디자인 — 요소 크기 비율',
                tint: '#0EA5E9', ink: 'var(--accent-ink)',
                desc: '로고의 심볼과 텍스트, 여백 사이 관계를 황금 비율로 정하면 시각적 안정감이 생깁니다.',
                example: '심볼 크기 100px → 텍스트 크기 61.8px, 좌우 여백 38.2px',
              },
              {
                title: '2. 레이아웃 — 본문과 사이드바',
                tint: '#059669', ink: 'var(--cat-finance)',
                desc: '웹사이트 2단 레이아웃에서 콘텐츠와 사이드바를 61.8% : 38.2%로 나누면 황금 비율 구도가 됩니다.',
                example: '전체 1000px → 본문 618px + 사이드바 382px',
              },
              {
                title: '3. 타이포그래피 — 제목과 본문',
                tint: '#0891B2', ink: 'var(--cat-health)',
                desc: '본문 폰트 크기에 φ를 곱한 값을 제목 크기로 사용하면 자연스러운 위계가 생깁니다.',
                example: '본문 16px × 1.618 ≈ 26px (H3), × 1.618² ≈ 42px (H1)',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.tint}25`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.ink, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '8px' }}>{item.desc}</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '13px', color: 'var(--text)' }}>
                  예: {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 피보나치 수열표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            피보나치 수열과 φ의 수렴
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            피보나치 수열은 앞 두 항을 더해 다음 항을 만드는 수열입니다: <strong style={{ color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...</strong>
            인접한 두 항의 비율은 항이 커질수록 φ = 1.618에 수렴합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>n = {row.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{row.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row.ratio}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 12항만 가도 소수점 4자리까지 φ와 일치할 만큼 수렴이 빠릅니다.
          </p>
        </div>

        {/* ── 5. 황금 비율 vs 다른 비율 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            황금 비율 vs 다른 비율
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            황금 비율은 디자인·예술의 미적 가이드입니다. 매체·목적에 따라 다른 비율이 더 적합할 수 있으니 본 도구의 [비율 비교 시각화]에서 한눈에 확인하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>비율</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>값 (가로/세로)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>주요 사용처</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '황금 비율 (φ)', v: '1.618', u: '디자인·예술 — 대표적 미적 비율',      c: 'var(--accent-ink)' },
                  { n: '백은 비율 (√2)', v: '1.414', u: 'A4·B5 등 종이 규격 — 반 접어도 같은 비율', c: 'var(--cat-health)' },
                  { n: '16:9 (HD)',     v: '1.778', u: '유튜브·TV·모니터·가로 영상',           c: 'var(--cat-sports)' },
                  { n: '4:3',           v: '1.333', u: '구식 TV·아이패드·일부 카메라',         c: 'var(--cat-art)' },
                  { n: '21:9 (시네마)', v: '2.333', u: '울트라와이드 모니터·영화관',           c: 'var(--danger)' },
                  { n: '3:2',           v: '1.500', u: '35mm 카메라 사진 표준',                 c: 'var(--cat-finance)' },
                  { n: '1:1 (정사각)',  v: '1.000', u: '인스타 정사각 게시물·앨범 커버·로고',   c: 'var(--text)' },
                  { n: '9:16 (세로)',   v: '0.563', u: '인스타 스토리·릴스·틱톡 (모바일 세로)', c: 'var(--cat-life)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * &ldquo;반드시 황금 비율을 따라야 한다&rdquo;는 절대화는 피하세요. 디자인은 목적·문맥·타깃·매체에 따라 다른 비율도 효과적입니다.
          </p>
        </div>

        {/* ── 6. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
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
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
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
    </div>
  )
}
