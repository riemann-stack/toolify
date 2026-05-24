import Link from 'next/link'
import ViscosityClient from './ViscosityClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/unit/viscosity',
  title: '점도(Viscosity) 변환기 — cP·cSt·SUS·SAE J300·ISO VG',
  description:
    'cP(mPa·s)·cSt·SUS·Pa·s 점도 단위 동시 환산 + SAE J300 엔진오일 등급 (0W-20·5W-30 등) ↔ cSt 매핑 + ISO VG 산업 윤활유. 자동차 DIY·산업 정비용.',
  keywords: [
    '점도 변환', '점도 환산', 'cP cSt 변환',
    '센티포아즈', '센티스토크', 'mPa s',
    'SAE J300', '0W-20', '5W-30', '엔진오일 등급',
    'ISO VG', '유압유 점도', '기어유 점도',
    'SUS Saybolt', '동점도', '절대점도',
    '윤활유 선택', '자동차 오일', '미션오일',
    '점도 계산기', '오일 점도',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

export default function ViscosityPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🛢️ 점도(Viscosity) 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>cP·cSt·SUS·Pa·s</strong> 동시 환산 + SAE J300 엔진오일·ISO VG 산업 윤활유 매칭. 자동차 DIY·정비용.
      </p>

      <ViscosityClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 절대 vs 동 */}
        <section>
          <h2 style={sectionTitle}>절대점도 vs 동점도 — 무엇이 다른가</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            점도에는 두 종류가 있고, <strong style={{ color: 'var(--text)' }}>밀도(ρ)로 서로 변환</strong>됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '절대점도 μ (Dynamic)',  d: 'cP = mPa·s', desc: '두 평행판 사이 유체를 끌 때 필요한 힘. 정량적·물리적 의미가 직관적', c: '#059669' },
              { t: '동점도 ν (Kinematic)',  d: 'cSt = mm²/s', desc: '중력에 의해 자유낙하하는 유체 거동. 오일 카탈로그·SAE/ISO 표준', c: '#0891B2' },
              { t: '관계식',               d: 'ν = μ / ρ', desc: '밀도 1.0(물)이면 두 값이 같아지지만, 오일(ρ≈0.87)은 다름', c: '#D97706' },
              { t: 'SI 단위',              d: 'Pa·s = 1000 cP', desc: '학술·연구용 SI. 산업 현장은 거의 안 씀', c: '#9333EA' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.t}</p>
                <p style={{ fontSize: 16, color: 'var(--text)', fontWeight: 800, margin: '0 0 6px', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. SAE J300 */}
        <section>
          <h2 style={sectionTitle}>SAE J300 — 엔진오일 등급의 의미</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>0W-20</strong>처럼 두 숫자로 표기되는 SAE J300 다등급(multigrade) 오일은:
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>앞 숫자 + W (Winter)</strong> — 저온 시동성. 숫자가 낮을수록 영하에서 잘 흐름. <code style={{ color: 'var(--text)' }}>0W &lt; 5W &lt; 10W</code>.</li>
            <li><strong style={{ color: 'var(--text)' }}>뒷 숫자</strong> — 100°C 고온 동점도(cSt) 범위. 클수록 고온에서 더 점성 유지. <code style={{ color: 'var(--text)' }}>20 = 6.9~9.3 cSt, 30 = 9.3~12.5, 40 = 12.5~16.3, 50 = 16.3~21.9</code>.</li>
            <li><strong style={{ color: 'var(--text)' }}>다등급의 이점</strong> — 저온 시동성과 고온 안정성을 동시에 확보(점도지수 향상제 첨가).</li>
            <li><strong style={{ color: 'var(--text)' }}>차량별 권장</strong> — 반드시 차량 매뉴얼·주유구 캡을 확인. 잘못된 등급은 연비·엔진 보호 모두 저하.</li>
          </ul>
        </section>

        {/* 3. ISO VG */}
        <section>
          <h2 style={sectionTitle}>ISO VG — 산업용 윤활유 등급 (ISO 3448)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            산업용 윤활유(유압유·기어유·터빈유)는 <strong style={{ color: 'var(--text)' }}>ISO Viscosity Grade</strong>로 분류됩니다. VG 번호 = <strong>40°C 동점도의 중심값(cSt)</strong>이며 ±10% 허용. 예를 들어 VG 46은 41.4~50.6 cSt @40°C.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['VG', '범위 (cSt @40°C)', '대표 용도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['VG 32',  '28.8~35.2',  '유압유 표준 (실내)'],
                  ['VG 46',  '41.4~50.6',  '유압유 표준 (옥외)'],
                  ['VG 68',  '61.2~74.8',  '중부하 유압·기어'],
                  ['VG 100', '90.0~110.0', '경기어·고온 베어링'],
                  ['VG 220', '198~242',    '기어유 (중형)'],
                  ['VG 460', '414~506',    '고하중 기어·웜기어'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '0W-20과 5W-30 중 뭘 넣어야 하나요?',
                a: '<strong>차량 매뉴얼·주유구 캡 표기 우선</strong>. 최신 한국·일본 승용차(현대·기아·도요타·혼다)는 연비 우선으로 0W-20·5W-20을 권장. 유럽차(BMW·메르세데스)는 5W-30·5W-40이 표준. 고출력 터보·고연식·고온 환경은 한 등급 위(예: 5W-30 → 5W-40)를 고려할 수 있지만, 매뉴얼을 크게 벗어나는 등급은 보증·연비 모두 손해입니다.',
              },
              {
                q: 'cP와 cSt 중 어느 게 더 정확한 점도 지표인가요?',
                a: '용도가 다릅니다. <strong>cP(절대점도)</strong>는 두 평면 사이 마찰력을 직접 측정해 물리적 의미가 명확 — 학술·연구·정밀 측정에 적합. <strong>cSt(동점도)</strong>는 중력 낙하 시간으로 측정해 측정이 간편 — 윤활유 카탈로그·SAE/ISO 표준이 cSt를 채택한 이유. 본질적으로 같은 점성도를 다른 방식으로 표현한 것이며 밀도로 정확히 변환됩니다.',
              },
              {
                q: 'SUS는 왜 다른 단위들과 정확히 변환이 어렵나요?',
                a: 'SUS(Saybolt Universal Seconds)는 <strong>표준 컵에서 60mL의 액체가 흘러나오는 시간</strong>을 직접 측정하는 단위입니다. 컵 구조의 비선형성과 유체 흐름 특성 때문에 cSt와 단순 비례하지 않으며, 특히 32~100 SUS 영역은 보정식이 복잡합니다(ASTM D2161). 100 SUS 이상에서는 <code style="color: var(--text)">SUS ≈ 4.6347 × cSt</code>가 ±1% 안에서 잘 맞지만, 그 이하에서는 표 lookup이 더 정확해요.',
              },
              {
                q: '엔진오일 점도지수(VI)가 뭔가요?',
                a: '<strong>Viscosity Index(VI)</strong> — 온도 변화에 따른 점도 변화량을 나타내는 무차원 지수. 100이 기준이고 높을수록 온도에 둔감. 광유는 VI 80~110, 합성유는 130~180+. <strong>다등급 오일(0W-20 등)은 VI 150 이상</strong>이라야 W 등급과 100°C 등급을 동시에 만족할 수 있어요. 카탈로그에 VI가 표기되어 있다면 클수록 광범위 온도에서 안정적이라는 뜻.',
              },
              {
                q: '엔진오일 등급을 올리면 연비가 떨어지나요?',
                a: '<strong>네, 일반적으로</strong>. 0W-20 → 5W-30 → 10W-40으로 점도가 올라갈수록 엔진 내부 저항이 증가해 연비 1~3% 감소가 보고됩니다. 최신 엔진은 0W-20 이하 저점도 오일에 최적화되어 더 점도 높은 오일을 넣으면 연비·동력 모두 손해. 다만 노후 엔진은 약간 점도 높은 오일로 누유·소음 감소 효과를 보기도 합니다(임시방편).',
              },
              {
                q: 'SAE 등급과 ISO VG 등급은 직접 변환되나요?',
                a: '<strong>정확한 1:1 변환은 불가</strong>합니다. SAE는 -35°C·100°C 두 온도, ISO VG는 40°C 단일 온도로 측정해 기준 자체가 달라요. 대략적으로 ISO VG 68 ≈ SAE 20W-20, VG 100 ≈ SAE 30, VG 150 ≈ SAE 40, VG 220 ≈ SAE 50 (단등급 비교) 정도이지만, 다등급(0W-30 등)은 단순 매핑이 어렵습니다. 본 도구의 점도 입력을 활용하면 동일 cSt에서 두 등급을 동시에 확인 가능합니다.',
              },
              {
                q: '꿀·케첩 같은 비뉴턴 유체는 왜 단일 점도 값이 안 나오나요?',
                a: '뉴턴 유체(물·오일 등)는 전단속도와 무관하게 점도가 일정하지만, <strong>비뉴턴 유체</strong>는 흐름 속도·압력에 따라 점도가 변합니다. 케첩은 흔드는 동안만 묽어지고(전단희석), 옥수수 전분물은 빠르게 누르면 단단해져요(전단증점). 이런 유체의 점도는 <strong>특정 전단속도에서의 값</strong>으로만 의미가 있어 단일 cP 표기가 부정확합니다.',
              },
              {
                q: '브레이크액 DOT 등급은 점도와 다른가요?',
                a: '맞습니다. <strong>DOT 3/4/5/5.1은 비등점·습기 흡수 기준</strong>이지 점도 등급이 아닙니다. 다만 미국·유럽 표준은 점도 한도(예: -40°C에서 1800 mm²/s 이하)도 함께 명시하므로 결과적으로 모든 DOT 등급이 비슷한 점도 범위를 가져요. 브레이크액은 <strong>비등점·흡습성 우선</strong>으로 등급 선택하고, 점도는 자동으로 따라옵니다.',
              },
            ].map((f, i) => (
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

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/hardness',      icon: '🛠️', name: '경도(Hardness) 변환기', desc: 'HRC·HV·HB 등 강재 경도 환산' },
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',          desc: '길이·면적·무게·부피 통합' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비',         desc: '유류·오일·소모품 연간 비용' },
              { href: '/tools/finance/car-tax',    icon: '🧾', name: '자동차 세금',           desc: '취득세·자동차세·유류세' },
              { href: '/tools/unit/fuel-economy',  icon: '⛽', name: '연비 변환기',           desc: 'km/L·MPG·L/100km' },
              { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 공기압',         desc: 'psi·kPa·bar 변환' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
