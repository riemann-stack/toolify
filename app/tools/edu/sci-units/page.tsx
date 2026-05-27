import Link from 'next/link'
import SciUnitsClient from './SciUnitsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/edu/sci-units',
  title: '과학 단위 변환기 — SI 접두어·과학적 표기·옹스트롬·eV·광년',
  description:
    'SI 접두어(나노·마이크로·메가)와 과학적·공학적 표기 상호 변환 + 옹스트롬(Å)·나노미터·천문단위·광년·파섹, eV·MeV·GeV 등 과학 스케일 단위 환산 + 주요 물리 상수표.',
  keywords: [
    '과학 단위 변환기', '과학적 표기법 변환', '공학적 표기', 'SI 접두어',
    '옹스트롬 nm 변환', 'Å nm', 'eV J 변환', 'MeV GeV', '광년 km', '천문단위 AU',
    '나노 마이크로 변환', '물리 상수표', '지수 변환',
  ],
})

const h2: React.CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }

const FAQ_LD = [
              { q: '과학적 표기와 공학적 표기의 차이는?', a: '둘 다 가수 × 10ⁿ 형태지만, <strong>과학적 표기</strong>는 가수를 1 이상 10 미만으로 두고(예: 1.5×10⁻⁶), <strong>공학적 표기</strong>는 지수를 항상 3의 배수로 맞춥니다(예: 15×10⁻⁶ → 보통 1.5×10⁻⁶ µ 단위와 대응). 공학적 표기는 SI 접두어(k·M·µ·n)와 바로 짝지어집니다.' },
              { q: '옹스트롬(Å)과 나노미터(nm)는 어떻게 변환하나요?', a: '<strong>1 Å = 0.1 nm = 10⁻¹⁰ m</strong>입니다. 즉 10 Å = 1 nm. 결정학·반도체·분광학에서 원자 단위 길이를 표현할 때 Å를 쓰고, 빛 파장은 nm를 주로 씁니다(가시광선 약 380~750 nm = 3,800~7,500 Å).' },
              { q: 'eV를 줄(J)로 바꾸면?', a: '<strong>1 eV = 1.602176634 × 10⁻¹⁹ J</strong>입니다. 1 eV는 전자 하나가 1V 전위차를 지날 때 얻는 에너지로 정의됩니다. keV(10³)·MeV(10⁶)·GeV(10⁹)·TeV(10¹²)는 각각 X선·핵반응·입자가속기·LHC 스케일 에너지에 쓰입니다.' },
              { q: '이 도구는 일반 단위 변환기와 무엇이 다른가요?', a: '일반 <a href="/tools/unit/converter" style="color:#0D9488;text-decoration:underline">단위 변환기</a>는 평·근·인치 같은 생활 단위 중심입니다. 본 도구는 <strong>지수 표기 변환 + 옹스트롬·광년·eV 같은 과학·천문 스케일 단위 + 물리 상수</strong>에 특화되어 있습니다.' },
              { q: '물리 상수 값은 믿을 수 있나요?', a: 'CODATA 권장값 및 2019년 SI 재정의 기준입니다. c(빛의 속도)·h(플랑크)·e(기본 전하)·k_B(볼츠만)·N_A(아보가드로)는 <strong>정의 상수(정확값)</strong>이고, G(만유인력)·전자 질량 등은 측정값이라 불확도가 있습니다.' },
            ]

export default function SciUnitsPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>교육·학습</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔬 과학 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        SI 접두어와 <strong style={{ color: 'var(--text)' }}>과학적·공학적 표기</strong>를 상호 변환하고,
        <strong style={{ color: 'var(--text)' }}> 옹스트롬·광년·eV</strong> 같은 과학 스케일 단위와 주요 물리 상수까지 한 곳에서.
      </p>

      <SciUnitsClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 표기법 3종 */}
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
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{x.d}</p>
                <p style={{ fontSize: 13, color: '#0D9488', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{x.e}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. SI 접두어 표 */}
        <section>
          <h2 style={h2}>SI 접두어 (지수 ↔ 기호)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '이름', '배수', '예시'].map((hh, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{hh}</th>
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
                    <td style={{ padding: '9px 10px', color: '#0D9488', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r[2]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 계산기는 퀘타(Q,10³⁰)~퀙토(q,10⁻³⁰)까지 전체 접두어를 지원합니다.
          </p>
        </section>

        {/* 3. 과학 단위 예시 */}
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
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0D9488', marginBottom: 4 }}>{x.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
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

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={h2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/unit/converter', icon: '📐', name: '단위 변환기', desc: '길이·무게·온도 등 14종' },
              { href: '/tools/edu/fermi-estimate', icon: '🧮', name: '페르미 추정 계산기', desc: '자릿수 어림 사고력' },
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 계산기', desc: '천문 스케일 체감' },
              { href: '/tools/edu/sound-speed', icon: '🔊', name: '음속 계산기', desc: '소리 거리·시간' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
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
