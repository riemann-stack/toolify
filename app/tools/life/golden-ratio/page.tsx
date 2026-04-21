import type { Metadata } from 'next'
import Link from 'next/link'
import GoldenRatioClient from './GoldenRatioClient'

export const metadata: Metadata = {
  title: '황금 비율 계산기 — 피보나치 나선·디자인 비율 계산 | Youtil',
  description: '황금 비율(1:1.618)로 가로·세로를 자동 계산합니다. 피보나치 나선 시각화, 명함·A4·유튜브 썸네일 등 디자인 프리셋 제공. 디자이너·건축가 필수 도구.',
  keywords: ['황금비율계산기', '황금비계산기', '피보나치계산기', '디자인비율계산기', '황금비율', '황금나선'],
}

export default function GoldenRatioPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌀 황금 비율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        φ = 1.618 기반으로 가로·세로를 자동 계산하고, 피보나치 나선까지 시각화하세요.
      </p>

      <GoldenRatioClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 황금 비율이란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            황금 비율(φ)이란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            황금 비율(Golden Ratio)은 두 양 a, b(a &gt; b)에 대해 <strong style={{ color: 'var(--text)' }}>(a+b) : a = a : b</strong>가 성립할 때의 비율로,
            그리스 문자 φ(파이)로 표기합니다. 자연·예술·건축에서 가장 아름답게 인식되는 비율로 알려져 있습니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>황금 비율 공식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              φ = (1 + √5) / 2
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
              = 1.6180339887...
            </p>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            피보나치 수열(1, 1, 2, 3, 5, 8, 13, 21, 34...)에서 인접한 두 수의 비율은
            항이 커질수록 φ에 수렴합니다. 예를 들어 21 ÷ 13 = 1.615, 34 ÷ 21 = 1.619, 55 ÷ 34 = 1.6176...
            수학·자연·디자인을 연결하는 핵심 상수입니다.
          </p>
        </div>

        {/* ── 2. 자연과 예술 속 황금 비율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자연과 예술 속 황금 비율
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { cat: '건축',  title: '파르테논 신전',     desc: '기둥 간격과 지붕의 높이에 황금 비율이 사용됨' },
              { cat: '회화',  title: '모나리자·최후의 만찬', desc: '얼굴 윤곽과 구도에 황금 분할이 적용됨' },
              { cat: '자연',  title: '앵무조개·해바라기',   desc: '껍데기 나선과 씨앗 배열이 피보나치 나선' },
              { cat: '로고',  title: '애플·트위터 로고',    desc: '원호의 반지름이 황금 비율로 설계됨' },
              { cat: '인체',  title: '신체 비율',          desc: '배꼽 기준 상체 : 하체 = 1 : 1.618' },
              { cat: '음악',  title: '바흐·모차르트',       desc: '악장 길이 구성에 황금 분할 활용' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.cat}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 디자이너를 위한 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            디자이너를 위한 활용 팁
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '1. 로고 디자인 — 요소 크기 비율',
                color: '#C8FF3E',
                desc: '로고의 심볼과 텍스트, 여백 사이 관계를 황금 비율로 정하면 시각적 안정감이 생깁니다.',
                example: '심볼 크기 100px → 텍스트 크기 61.8px, 좌우 여백 38.2px',
              },
              {
                title: '2. 레이아웃 — 본문과 사이드바',
                color: '#3EFF9B',
                desc: '웹사이트 2단 레이아웃에서 콘텐츠와 사이드바를 61.8% : 38.2%로 나누면 황금 비율 구도가 됩니다.',
                example: '전체 1000px → 본문 618px + 사이드바 382px',
              },
              {
                title: '3. 타이포그래피 — 제목과 본문',
                color: '#3EC8FF',
                desc: '본문 폰트 크기에 φ를 곱한 값을 제목 크기로 사용하면 자연스러운 위계가 생깁니다.',
                example: '본문 16px × 1.618 ≈ 26px (H3), × 1.618² ≈ 42px (H1)',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '8px' }}>{item.desc}</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)' }}>
                  예: {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 피보나치 수열표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            피보나치 수열과 φ의 수렴
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            피보나치 수열은 앞 두 항을 더해 다음 항을 만드는 수열입니다: <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...</strong>
            인접한 두 항의 비율은 항이 커질수록 φ = 1.618에 수렴합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항 (n)', '값 F(n)', '비율 F(n)/F(n-1)', '차이'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
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
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>n = {row.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{row.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row.ratio}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 12항만 가도 소수점 4자리까지 φ와 일치합니다. 자연에서 피보나치 수열이 자주 나타나는 이유입니다.
          </p>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '황금 비율과 황금 분할의 차이는?',
                a: '같은 개념의 다른 표현입니다. "황금 비율(Golden Ratio)"은 비율 자체인 φ = 1.618...을 가리키고, "황금 분할(Golden Section)"은 선분을 이 비율로 나누는 작업을 뜻합니다. 실무에서는 구분 없이 혼용하는 경우가 많습니다.' },
              { q: '황금 비율이 아름답게 느껴지는 이유는?',
                a: '인간의 시지각이 자연에서 반복적으로 학습한 비율이라는 진화적 설명과, 수학적으로 자기 유사성(fractal)이 있어 시선의 흐름을 안정적으로 유도한다는 인지심리학적 설명이 공존합니다. 다만 모든 사람이 황금 비율만을 아름답다고 느끼는 것은 아니며, 실험 결과는 문화·개인차에 따라 다릅니다.' },
              { q: '유튜브 썸네일에 황금 비율을 어떻게 적용하나요?',
                a: '유튜브 썸네일 규격은 1280×720px(16:9)로 정해져 있어 이미지 규격 자체를 바꿀 수는 없습니다. 대신 썸네일 내부 구도를 황금 비율로 설계하세요. 예를 들어 가로 1280px을 61.8% : 38.2%로 나눈 792px 지점에 주요 피사체를 배치하면 시각적으로 안정감이 생깁니다. 이 계산기 "비율 변환" 탭에서 현재 이미지 비율과 황금 비율의 차이를 확인할 수 있습니다.' },
              { q: '황금 비율과 백은 비율(√2:1)의 차이는?',
                a: '백은 비율(Silver Ratio)은 √2 ≈ 1.414로, A4 용지(297×210mm)에 적용된 비율입니다. 반을 접어도 같은 비율이 유지되는 실용적 특성이 있어 종이 규격(A/B 시리즈)에 사용됩니다. 황금 비율은 미적·디자인적 비율, 백은 비율은 실용적·기능적 비율이라고 보면 구분하기 쉽습니다.' },
              { q: '피보나치 수열이 황금 비율과 연관된 이유는?',
                a: '피보나치 수열의 점화식 F(n+1) = F(n) + F(n-1)을 비율 F(n+1)/F(n) = R로 정리하면 R² - R - 1 = 0이라는 이차방정식이 됩니다. 이 방정식의 양의 해가 정확히 (1+√5)/2, 즉 φ입니다. 그래서 피보나치 수열의 인접 비율은 필연적으로 φ에 수렴합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/color',   icon: '🎨', name: '색상 코드 변환기',  desc: 'HEX·RGB·HSL 즉시 변환' },
              { href: '/tools/unit/length', icon: '📏', name: '길이 변환기',       desc: 'cm·m·inch·ft 단위 변환' },
              { href: '/tools/life/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 수 비율 자동 계산' },
              { href: '/tools/dev/lorem',   icon: '📝', name: '더미 텍스트 생성기', desc: '레이아웃 검증용 더미' },
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
