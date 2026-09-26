import Link from 'next/link'
import SigFigsClient from './SigFigsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import UpdatedMeta from '@/components/UpdatedMeta'
import { CONSTANTS } from './notationData'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/edu/sig-figs',
  title: '유효숫자·과학적 표기 계산기 — 반올림·오차 전파·SI 접두어·물리 상수',
  description:
    '유효숫자 자동 판별·반올림 + 절대·상대·백분율오차 + 오차 전파(덧셈·뺄셈·곱셈·나눗셈·거듭제곱). 과학적 표기 탭에서 일반·과학적·공학적 표기와 SI 접두어 변환, 옹스트롬·광년·eV 등 과학 스케일 단위 환산, CODATA 물리 상수표까지. 실험 보고서용.',
  keywords: [
    '유효숫자 계산기', '유효숫자 개수', '유효숫자 반올림', '오차 전파 계산기',
    '오차 전파', '상대오차', '백분율오차', '절대오차', '불확도', '측정 오차',
    '실험 보고서 오차', '일반물리 실험', '일반화학 실험', '과학적 표기 반올림',
    '과학적 표기법 변환', '공학적 표기', 'SI 접두어', '지수 변환', '과학 단위 변환기',
    '옹스트롬 nm 변환', 'eV J 변환', '광년 km', '천문단위 AU', '물리 상수표',
  ],
})

const h2: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }

const FAQ_LD = [
              { q: '1500의 유효숫자는 몇 개인가요?', a: '소수점이 없는 정수의 후행 0은 <strong>모호</strong>합니다. 1500은 표기만으로 2개(1,5)인지 4개(1,5,0,0)인지 알 수 없어요. 명확히 하려면 과학적 표기로 씁니다 — <strong>1.5×10³</strong>(2개), <strong>1.50×10³</strong>(3개), <strong>1.500×10³</strong>(4개). 본 계산기는 이런 경우 모호함을 경고합니다.' },
              { q: '0.04560은 유효숫자가 몇 개죠?', a: '<strong>4개</strong>입니다. 앞쪽 선행 0(0.0…)은 자릿수만 나타내므로 무효이고, 4·5·6과 <strong>맨 끝 0</strong>이 유효합니다. 소수점 뒤의 후행 0은 일부러 적은 것이므로 유효숫자에 포함됩니다.' },
              { q: '계산 결과는 유효숫자를 어떻게 맞추나요?', a: '<strong>곱셈·나눗셈</strong>은 유효숫자가 가장 적은 값에 맞추고, <strong>덧셈·뺄셈</strong>은 소수점 자리수가 가장 적은 값에 맞춥니다. 최종 답을 먼저 다 계산한 뒤 마지막에 한 번만 반올림하는 것이 좋습니다(중간 반올림 누적 오차 방지).' },
              { q: '오차 전파에서 제곱합과 단순 합은 언제 쓰나요?', a: '측정 오차들이 <strong>서로 독립인 무작위 오차</strong>일 때는 제곱합 √(δA²+δB²)(표준 불확도)을 씁니다. 통계를 모르거나 최악의 경우 상한을 보수적으로 잡고 싶을 때는 절대값을 그냥 더하는 <strong>단순 합(최대 오차)</strong>을 씁니다. 본 도구는 둘 다 보여줍니다.' },
              { q: '불확도는 유효숫자 몇 개로 적나요?', a: '관례상 불확도(δ)는 <strong>1~2개 유효숫자</strong>로 반올림하고, 측정값을 그 불확도와 <strong>같은 소수 자리</strong>에 맞춥니다. 예: 9.8123 ± 0.0456 → <strong>9.81 ± 0.05</strong> 또는 9.812 ± 0.046. 본 계산기는 2자리 기준으로 정리해 보여줍니다.' },
              // ↓ 과학적 표기 탭(구 /tools/edu/sci-units) FAQ
              { q: '과학적 표기와 공학적 표기의 차이는?', a: '둘 다 가수 × 10ⁿ 형태지만, <strong>과학적 표기</strong>는 가수를 1 이상 10 미만으로 두고(예: 1.5×10⁻⁶), <strong>공학적 표기</strong>는 지수를 항상 3의 배수로 맞춥니다(예: 1.5×10⁻⁵ = 15×10⁻⁶ = 15 µ). 공학적 표기는 SI 접두어(k·M·µ·n)와 바로 짝지어집니다.' },
              { q: '옹스트롬(Å)과 나노미터(nm)는 어떻게 변환하나요?', a: '<strong>1 Å = 0.1 nm = 10⁻¹⁰ m</strong>입니다. 즉 10 Å = 1 nm. 결정학·반도체·분광학에서 원자 단위 길이를 표현할 때 Å를 쓰고, 빛 파장은 nm를 주로 씁니다(가시광선 약 380~750 nm = 3,800~7,500 Å).' },
              { q: 'eV를 줄(J)로 바꾸면?', a: '<strong>1 eV = 1.602176634 × 10⁻¹⁹ J</strong>입니다. 1 eV는 전자 하나가 1V 전위차를 지날 때 얻는 에너지로 정의됩니다. keV(10³)·MeV(10⁶)·GeV(10⁹)·TeV(10¹²)는 각각 X선·핵반응·입자가속기·LHC 스케일 에너지에 쓰입니다.' },
              { q: '물리 상수 값은 믿을 수 있나요?', a: 'CODATA 2022 권장값(NIST 공개, 2026년 6월 확인) 및 2019년 SI 재정의 기준입니다. c(빛의 속도)·h(플랑크)·e(기본 전하)·k_B(볼츠만)·N_A(아보가드로)는 <strong>정의 상수(정확값)</strong>이고, G(만유인력)·전자 질량 등은 측정값이라 불확도가 있습니다.' },
              { q: '파섹(pc)은 어떻게 정의되나요?', a: '<strong>1 AU(지구–태양 평균 거리)가 1초각(1″)으로 보이는 거리</strong>, 즉 연주시차가 1″인 별까지의 거리입니다. IAU 2015 결의 B2 기준으로 정확히 648,000/π AU이며, 약 3.0857×10¹⁶ m ≈ 3.26광년에 해당합니다. 기준이 되는 1 AU도 IAU 2012 결의 B2에서 정확히 149,597,870,700 m로 정의되어 있습니다.' },
              { q: '달톤(Da)은 어디에 쓰이는 단위인가요?', a: '<strong>탄소-12 원자 질량의 1/12</strong>로 정의되는 질량 단위로, 원자질량단위(u)와 같은 단위입니다(SI와 병용이 허용된 단위, BIPM SI 브로슈어 9판). 1 Da = 1.66053906892×10⁻²⁷ kg(CODATA 2022)입니다. 단백질·핵산 등 생체분자 질량을 <strong>kDa</strong>로 표기할 때 널리 쓰입니다 — 예: 몰질량 64,000 g/mol인 단백질은 64 kDa.' },
              { q: '광년과 파섹 중 어느 것을 쓰나요?', a: '같은 거리 단위지만 쓰임이 다릅니다. IAU에 따르면 <strong>광년(ly)은 주로 대중·교양 매체</strong>에서, <strong>파섹(pc)은 천문학 연구</strong>에서 쓰입니다. 1 pc ≈ 3.26 ly이며, 더 먼 거리는 킬로파섹(kpc)·메가파섹(Mpc)처럼 SI 접두어를 붙여 표기합니다.' },
            ]

export default function SigFigsPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/sig-figs">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />유효숫자·과학적 표기 계산기
      </h1>
      <p className="tp-lead">
        측정값의 <strong style={{ color: 'var(--text)' }}>유효숫자를 판별·반올림</strong>하고,
        <strong style={{ color: 'var(--text)' }}> 상대·백분율오차</strong>와 두 측정값의
        <strong style={{ color: 'var(--text)' }}> 오차 전파</strong>,
        <strong style={{ color: 'var(--text)' }}> 과학적·공학적 표기·SI 접두어</strong> 변환과 물리 상수표까지. 실험 보고서·과제에 바로 쓰는 도구.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="과학적 표기 탭 — 물리 상수 CODATA 2022 권장값 · AU·파섹은 IAU 정의 기준"
        sources={[
          { label: 'NIST CODATA', href: 'https://physics.nist.gov/cuu/Constants/' },
          { label: 'IAU Measuring the Universe', href: 'https://iauarchive.eso.org/public/themes/measuring/' },
        ]}
      />

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

          {/* 지수 표기 계산 규칙 — 구 sci-units '유효숫자와 지수 표기 계산 규칙' 섹션을 이 섹션에 합침 */}
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: '24px 0 10px' }}>지수 표기로 계산할 때 유효숫자 맞추기</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            측정값을 곱하거나 나눌 때 결과의 유효숫자는 <strong style={{ color: 'var(--text)' }}>피연산자 중 가장 적은 자릿수</strong>를 따릅니다.
            계산기가 뱉는 긴 소수를 그대로 옮겨 적으면 실제보다 정밀한 척하는 셈이 됩니다. 과학적 표기의 장점이 여기서 드러납니다 —
            3000은 유효숫자가 1자리인지 4자리인지 모호하지만, 3.0×10³으로 쓰면 2자리임이 명확합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '① 가수끼리 곱한다', d: '1.5×10⁻⁶ × 2.0×10³을 계산해 봅니다. 먼저 가수만 곱하면 1.5 × 2.0 = 3.0.' },
              { t: '② 지수끼리 더한다', d: '10의 지수는 곱셈에서 서로 더해집니다. (-6) + 3 = -3이므로 중간 결과는 3.0×10⁻³.' },
              { t: '③ 유효숫자를 맞춘다', d: '두 값 모두 유효숫자 2자리이므로 결과도 2자리. 이때 3×10⁻³이 아니라 소수점 아래 0을 남긴 3.0×10⁻³으로 써야 2자리 정밀도가 전달됩니다.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 반올림이 필요한 예: 2.46×10⁵ × 1.2×10² = 2.952×10⁷ → 유효숫자 2자리로 반올림해 3.0×10⁷.
            덧셈·뺄셈은 규칙이 다릅니다 — 유효숫자 개수가 아니라 <strong>소수점 자릿값</strong>이 가장 낮은 정밀도에 맞춥니다(예: 12.1 + 0.532 = 12.632 → 12.6).
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
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-600)', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{x.e}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 오차 전파 공식 */}
        <section>
          <h2 style={h2}>오차 전파 공식</h2>
          <div className="tableScroll">
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
                    <td style={{ padding: '9px 10px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
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
            오차 전파는 &ldquo;어느 측정에 투자할지&rdquo;를 알려주는 도구이기도 합니다.
          </p>
        </section>

        {/* 5. 로그·지수·삼각함수 오차 전파 */}
        <section>
          <h2 style={h2}>로그·지수·삼각함수의 오차 전파</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            사칙연산이 아닌 함수는 1차 근사 <strong style={{ color: 'var(--text)' }}>δR = |dR/dA| × δA</strong>로 전파합니다.
            pH·반감기·감쇠 계산에서 자주 쓰는 형태를 정리했습니다.
          </p>
          <div className="tableScroll">
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
                    <td style={{ padding: '9px 10px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[1]}</td>
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

        {/* 6. 표기법 3종 (↓ 6~11: 과학적 표기 탭 — 구 /tools/edu/sci-units 가이드) */}
        <section>
          <h2 style={h2}>일반 · 과학적 · 공학적 표기</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '일반 표기', d: '우리가 평소 쓰는 십진수. 자릿수가 많으면 읽기 어려움.', e: '0.0000015 / 1,500,000' },
              { t: '과학적 표기 (Scientific)', d: '가수(1 이상 10 미만) × 10ⁿ. 자릿수에 관계없이 간결.', e: '1.5 × 10⁻⁶ / 1.5 × 10⁶' },
              { t: '공학적 표기 (Engineering)', d: '지수를 항상 3의 배수로. SI 접두어(k·M·µ·n)와 1:1 대응.', e: '1.5 × 10⁻⁶ → 1.5 µ' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{x.e}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SI 접두어 표 */}
        <section>
          <h2 style={h2}>SI 접두어 (지수 ↔ 기호)</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '이름', '배수', '예시'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['T', '테라', '10¹²', '1 TB = 10¹² B'],
                  ['G', '기가', '10⁹', '1 GHz = 10⁹ Hz'],
                  ['M', '메가', '10⁶', '1 MW = 10⁶ W'],
                  ['k', '킬로', '10³', '1 km = 1,000 m'],
                  ['m', '밀리', '10⁻³', '1 mm = 0.001 m'],
                  ['µ', '마이크로', '10⁻⁶', '1 µm = 10⁻⁶ m'],
                  ['n', '나노', '10⁻⁹', '1 nm = 10⁻⁹ m'],
                  ['p', '피코', '10⁻¹²', '1 pF = 10⁻¹² F'],
                  ['f', '펨토', '10⁻¹⁵', '1 fs = 10⁻¹⁵ s'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[2]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 위 계산기의 &lsquo;과학적 표기&rsquo; 탭은 퀘타(Q,10³⁰)~퀙토(q,10⁻³⁰)까지 전체 접두어를 지원합니다.
          </p>
        </section>

        {/* 8. SI 접두어 vs 이진 접두어 */}
        <section>
          <h2 style={h2}>SI 접두어 vs 이진 접두어 — 1TB가 931GB로 보이는 이유</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            SI 접두어는 10의 거듭제곱(십진)이지만 컴퓨터 메모리는 2의 거듭제곱으로 커집니다. 이 혼동을 정리하려고
            국제 표준 <strong style={{ color: 'var(--text)' }}>IEC 80000-13</strong>은 이진 접두어(Ki·Mi·Gi·Ti)를 따로 정의했습니다.
            1 KiB(키비바이트) = 2¹⁰ = 1,024바이트로 1 kB(1,000바이트)와 2.4% 차이가 나고, 단위가 커질수록 격차도 벌어집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SI(십진)', '값', 'IEC(이진)', '값', '격차'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['kB 킬로', '10³ B', 'KiB 키비', '2¹⁰ = 1,024 B', '+2.4%'],
                  ['MB 메가', '10⁶ B', 'MiB 메비', '2²⁰ ≈ 1.049×10⁶ B', '+4.9%'],
                  ['GB 기가', '10⁹ B', 'GiB 기비', '2³⁰ ≈ 1.074×10⁹ B', '+7.4%'],
                  ['TB 테라', '10¹² B', 'TiB 테비', '2⁴⁰ ≈ 1.100×10¹² B', '+10.0%'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[3]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: 12 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 실전 예: SSD 제조사는 십진 기준으로 1 TB = 10¹² 바이트를 담아 팝니다. 그런데 윈도우 탐색기는 용량을
            2³⁰바이트(GiB) 단위로 나눠 계산하면서 표기만 &lsquo;GB&rsquo;로 하기 때문에, 10¹² ÷ 2³⁰ ≈ 931.3이 되어
            같은 드라이브가 931GB로 보입니다. 용량이 사라진 게 아니라 나누는 기준이 다를 뿐입니다.
          </p>
        </section>

        {/* 9. 과학 단위 예시 */}
        <section>
          <h2 style={h2}>자주 쓰는 과학 단위</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'Å 옹스트롬', d: '1 Å = 0.1 nm = 10⁻¹⁰ m. 원자 반지름·화학 결합 길이.' },
              { t: 'AU 천문단위', d: '1 AU ≈ 1.496×10¹¹ m. 지구–태양 평균 거리.' },
              { t: 'ly 광년', d: '1 ly ≈ 9.461×10¹⁵ m. 빛이 1년 동안 가는 거리.' },
              { t: 'pc 파섹', d: '1 pc ≈ 3.086×10¹⁶ m ≈ 3.26 ly. 천문 거리 표준.' },
              { t: 'eV 전자볼트', d: '1 eV ≈ 1.602×10⁻¹⁹ J. 원자·광자·입자 에너지.' },
              { t: 'Da 달톤', d: '원자질량단위(u). 1 Da ≈ 1.661×10⁻²⁷ kg.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-600)', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. 실생활 스케일 예시 */}
        <section>
          <h2 style={h2}>실생활 스케일 예시</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                t: '반도체와 나노미터(nm)',
                d: '가시광선 파장이 400~700 nm인데, 최신 반도체는 그보다 훨씬 작은 패턴을 새깁니다. 첨단 공정의 EUV(극자외선) 노광 장비는 파장 13.5 nm 빛을 사용해 — 기존 DUV(193 nm)의 약 1/14 — 7·5·3나노 공정의 핵심 회로층을 그립니다.',
                e: 'EUV 파장 13.5 nm = 1.35×10⁻⁸ m',
              },
              {
                t: '천문 거리 — AU·광년·파섹 고르기',
                d: '태양계 안에서는 AU(1 AU = 149,597,870,700 m, IAU 2012 정의)를 쓰고, 별 사이 거리부터는 광년·파섹을 씁니다. 태양에서 가장 가까운 별 프록시마 센타우리까지는 약 4.25광년(약 1.3 pc)입니다.',
                e: '4.25 ly ≈ 4.02×10¹³ km',
              },
              {
                t: 'eV로 읽는 에너지 사다리',
                d: '가시광선 광자는 약 1.8~3.1 eV(E=hc/λ 환산), X선 광자는 100 eV~100 keV이고 그 이상은 감마선으로 분류됩니다. 입자가속기 LHC는 양성자를 13.6 TeV(2022년 3차 가동 시작 기준)로 충돌시킵니다 — 가시광 광자의 수조 배 에너지입니다.',
                e: '1 TeV = 10¹² eV ≈ 1.6×10⁻⁷ J',
              },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{x.e}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 출처: ASML(EUV 13.5 nm)·NASA(전자기 스펙트럼, 프록시마 센타우리 4.25광년)·CERN(LHC 13.6 TeV)·IAU(AU 정의) — 2026년 6월 확인.
          </p>
        </section>

        {/* 11. 물리 상수표 (계산기 '과학적 표기' 탭의 '물리 상수표'와 동일 데이터) */}
        <section>
          <h2 style={h2}>주요 물리 상수표 (CODATA 2022)</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '이름', '값', '단위'].map((hh, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONSTANTS.map((c, i) => (
                  <tr key={c.symbol} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{c.symbol}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{c.name}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{c.value}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: 12 }}>{c.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ c·h·ħ·e·k_B·N_A·R·σ는 2019년 SI 재정의에 따른 <strong>정확값(불확도 없음)</strong>이고, G·m_e·m_p·ε₀는 측정값입니다.
            출처: NIST CODATA 2022 권장값(physics.nist.gov, 2026년 6월 확인). 위 계산기 &lsquo;과학적 표기&rsquo; 탭의 &lsquo;물리 상수표&rsquo;와 동일한 값입니다.
          </p>
        </section>

        {/* 12. FAQ */}
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

        {/* 13. 관련 도구 */}
        <section>
          <h2 style={h2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/edu/fermi-estimate', icon: '🧮', name: '페르미 추정 계산기', desc: '자릿수 어림 사고력' },
              { href: '/tools/unit/converter', icon: '📐', name: '단위 변환기', desc: '길이·무게·온도 등 14종' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 계산기', desc: '전압·전류·저항 풀이' },
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 계산기', desc: '천문 스케일 체감' },
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
    </ToolPage>
  )
}
