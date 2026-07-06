import Link from 'next/link'
import SigFigsClient from './SigFigsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/edu/sig-figs',
  title: '유효숫자·오차 계산기 — 반올림·상대오차·오차 전파',
  description:
    '측정값의 유효숫자 자동 판별과 유효숫자/소수점 반올림 + 절대·상대·백분율오차 + 두 측정값의 오차 전파(덧셈·뺄셈·곱셈·나눗셈·거듭제곱). 일반물리·일반화학 실험 보고서용.',
  keywords: [
    '유효숫자 계산기', '유효숫자 개수', '유효숫자 반올림', '오차 전파 계산기',
    '오차 전파', '상대오차', '백분율오차', '절대오차', '불확도', '측정 오차',
    '실험 보고서 오차', '일반물리 실험', '일반화학 실험', '과학적 표기 반올림',
  ],
})

const h2: React.CSSProperties = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }

const FAQ_LD = [
              { q: '1500의 유효숫자는 몇 개인가요?', a: '소수점이 없는 정수의 후행 0은 <strong>모호</strong>합니다. 1500은 표기만으로 2개(1,5)인지 4개(1,5,0,0)인지 알 수 없어요. 명확히 하려면 과학적 표기로 씁니다 — <strong>1.5×10³</strong>(2개), <strong>1.50×10³</strong>(3개), <strong>1.500×10³</strong>(4개). 본 계산기는 이런 경우 모호함을 경고합니다.' },
              { q: '0.04560은 유효숫자가 몇 개죠?', a: '<strong>4개</strong>입니다. 앞쪽 선행 0(0.0…)은 자릿수만 나타내므로 무효이고, 4·5·6과 <strong>맨 끝 0</strong>이 유효합니다. 소수점 뒤의 후행 0은 일부러 적은 것이므로 유효숫자에 포함됩니다.' },
              { q: '계산 결과는 유효숫자를 어떻게 맞추나요?', a: '<strong>곱셈·나눗셈</strong>은 유효숫자가 가장 적은 값에 맞추고, <strong>덧셈·뺄셈</strong>은 소수점 자리수가 가장 적은 값에 맞춥니다. 최종 답을 먼저 다 계산한 뒤 마지막에 한 번만 반올림하는 것이 좋습니다(중간 반올림 누적 오차 방지).' },
              { q: '오차 전파에서 제곱합과 단순 합은 언제 쓰나요?', a: '측정 오차들이 <strong>서로 독립인 무작위 오차</strong>일 때는 제곱합 √(δA²+δB²)(표준 불확도)을 씁니다. 통계를 모르거나 최악의 경우 상한을 보수적으로 잡고 싶을 때는 절대값을 그냥 더하는 <strong>단순 합(최대 오차)</strong>을 씁니다. 본 도구는 둘 다 보여줍니다.' },
              { q: '불확도는 유효숫자 몇 개로 적나요?', a: '관례상 불확도(δ)는 <strong>1~2개 유효숫자</strong>로 반올림하고, 측정값을 그 불확도와 <strong>같은 소수 자리</strong>에 맞춥니다. 예: 9.8123 ± 0.0456 → <strong>9.81 ± 0.05</strong> 또는 9.812 ± 0.046. 본 계산기는 2자리 기준으로 정리해 보여줍니다.' },
            ]

export default function SigFigsPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>교육·학습</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="edu" />유효숫자·오차 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        측정값의 <strong style={{ color: 'var(--text)' }}>유효숫자를 판별·반올림</strong>하고,
        <strong style={{ color: 'var(--text)' }}> 상대·백분율오차</strong>와 두 측정값의
        <strong style={{ color: 'var(--text)' }}> 오차 전파</strong>까지. 실험 보고서·과제에 바로 쓰는 도구.
      </p>

      <SigFigsClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 유효숫자 규칙 */}
        <section>
          <h2 style={h2}>유효숫자 세는 규칙</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '0이 아닌 숫자는 모두 유효', d: '123 → 3개, 45.6 → 3개', e: '✓' },
              { t: '사이에 낀 0은 유효', d: '1024 → 4개, 80.05 → 4개', e: '✓' },
              { t: '소수점 앞쪽 선행 0은 무효', d: '0.0045 → 2개 (4, 5만)', e: '✗' },
              { t: '소수점 뒤 후행 0은 유효', d: '0.04560 → 4개, 2.300 → 4개', e: '✓' },
              { t: '소수점 없는 정수의 후행 0은 모호', d: '1500 → 2~4개 (표기로 구분 불가)', e: '⚠️' },
            ].map((x, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{x.e}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{x.t}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 모호한 후행 0은 <strong style={{ color: 'var(--text)' }}>과학적 표기</strong>(예: 1.5×10³ vs 1.500×10³)로 쓰면 명확해집니다.
          </p>
        </section>

        {/* 2. 오차 종류 */}
        <section>
          <h2 style={h2}>오차의 종류</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '절대오차', d: '측정값과 참값(또는 불확도)의 차이. 측정값과 같은 단위.', e: '|측정 − 참|' },
              { t: '상대오차', d: '절대오차를 기준값으로 나눈 비율. 단위 없음.', e: '절대오차 ÷ |참값|' },
              { t: '백분율오차', d: '상대오차를 %로 표현. 정확도 비교에 편리.', e: '상대오차 × 100%' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0D9488', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{x.e}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 오차 전파 공식 */}
        <section>
          <h2 style={h2}>오차 전파 공식</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연산', '결과 R', '불확도 δR (독립 오차)'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['덧셈·뺄셈', 'A ± B', 'δR = √(δA² + δB²)'],
                  ['곱셈·나눗셈', 'A·B, A/B', 'δR/R = √((δA/A)² + (δB/B)²)'],
                  ['거듭제곱', 'Aⁿ', 'δR/R = |n|·(δA/A)'],
                  ['상수 곱', 'k·A', 'δR = |k|·δA'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: '#0D9488', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 위 제곱합(quadrature) 공식은 오차가 <strong style={{ color: 'var(--text)' }}>서로 독립인 무작위 오차</strong>일 때 표준입니다.
            모든 오차가 겹친 최악의 경우(상한)는 절대값을 단순히 더합니다.
          </p>
        </section>

        {/* 4. 실전 워크스루 — 밀도 측정 */}
        <section>
          <h2 style={h2}>실전 워크스루 — 밀도 측정 오차 합성</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            저울로 잰 질량 <strong style={{ color: 'var(--text)' }}>m = 25.32 ± 0.01 g</strong>과 메스실린더로 잰 부피
            <strong style={{ color: 'var(--text)' }}> V = 10.2 ± 0.1 mL</strong>로 밀도 ρ = m/V를 구하는 전형적인 실험 상황을 끝까지 풀어봅니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '① 측정값 정리', d: 'm = 25.32 g (유효숫자 4개), V = 10.2 mL (3개). 나눗셈이므로 결과 유효숫자는 적은 쪽인 3개가 상한.' },
              { t: '② 상대오차로 변환', d: 'δm/m = 0.01/25.32 ≈ 0.040%, δV/V = 0.1/10.2 ≈ 0.98%. 부피 오차가 질량의 약 25배 — 부피가 지배적.' },
              { t: '③ 나눗셈 → 제곱합 합성', d: 'δρ/ρ = √(0.040² + 0.98²)% ≈ 0.98%. 지배항이 있으면 합성 결과는 지배항과 거의 같아집니다.' },
              { t: '④ 절대 불확도 환산', d: 'ρ = 25.32/10.2 = 2.4824 g/mL, δρ = 2.4824 × 0.0098 ≈ 0.024 g/mL.' },
              { t: '⑤ 최종 표기', d: '불확도 1자리로 정리하면 ρ = 2.48 ± 0.02 g/mL. 유효숫자 규칙(3개)으로 맞춘 2.48과도 일치.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 이 분석의 실용적 결론: 더 좋은 저울을 사도 결과는 거의 나아지지 않습니다. 상대오차가 0.98%로 지배적인
            <strong style={{ color: 'var(--text)' }}> 부피 측정(피펫·뷰렛 사용 등)을 개선</strong>해야 최종 불확도가 줄어듭니다.
            오차 전파는 "어느 측정에 투자할지"를 알려주는 도구이기도 합니다.
          </p>
        </section>

        {/* 5. 로그·지수·삼각함수 오차 전파 */}
        <section>
          <h2 style={h2}>로그·지수·삼각함수의 오차 전파</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            사칙연산이 아닌 함수는 1차 근사 <strong style={{ color: 'var(--text)' }}>δR = |dR/dA| × δA</strong>로 전파합니다.
            pH·반감기·감쇠 계산에서 자주 쓰는 형태를 정리했습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['함수 R', '불확도 δR', '비고·용례'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['ln A', 'δR = δA/A', 'A의 상대오차가 그대로 절대 불확도가 됨'],
                  ['log₁₀ A', 'δR = δA/(A·ln10) ≈ 0.434·(δA/A)', 'pH = −log[H⁺] 계산'],
                  ['eᴬ', 'δR/R = δA', 'A의 절대 불확도가 상대오차가 됨 (지수 감쇠)'],
                  ['10ᴬ', 'δR/R = ln10·δA ≈ 2.303·δA', 'pH → 농도 역산'],
                  ['sin A', 'δR = |cos A|·δA', 'δA는 라디안 단위'],
                  ['tan A', 'δR = δA/cos²A', '90° 부근에서 급격히 커짐'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: '#0D9488', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 예시: 농도 [H⁺] = (2.0 ± 0.2)×10⁻⁵ M(상대오차 10%)이면 pH = 4.70이고
            δpH ≈ 0.434 × 0.10 ≈ <strong style={{ color: 'var(--text)' }}>0.04</strong> — 즉 pH = 4.70 ± 0.04.
            로그는 상대오차를 절대오차로 바꾸므로, 농도 오차가 커도 pH 불확도는 의외로 작게 나옵니다.
            반대로 pH ± 0.01의 측정으로 농도를 역산하면 상대오차는 2.303 × 0.01 ≈ 2.3%가 됩니다.
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={h2}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={h2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/edu/sci-units', icon: '🔬', name: '과학 단위 변환기', desc: '과학적 표기·접두어·eV' },
              { href: '/tools/edu/fermi-estimate', icon: '🧮', name: '페르미 추정 계산기', desc: '자릿수 어림 사고력' },
              { href: '/tools/unit/converter', icon: '📐', name: '단위 변환기', desc: '길이·무게·온도 등 14종' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 계산기', desc: '전압·전류·저항 풀이' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
