import Link from 'next/link'
import CircuitSimulatorClient from './CircuitSimulatorClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/circuit-simulator',
  title: '옴의 법칙 시뮬레이터 — 직렬·병렬 회로 전압·전류·저항·전력',
  description: '직렬·병렬·혼합 회로의 전압·전류·저항·전력을 시각화하는 인터랙티브 시뮬레이터. 옴의 법칙·키르히호프 법칙 학습, LED 저항 계산, 한국 중3·고1 물리 빈출 회로 문제 풀이까지.',
  keywords: ['옴의법칙', '전기회로계산기', '회로시뮬레이터', '직렬병렬', '키르히호프법칙', 'LED저항계산', '전기전자', '회로분석', '중3물리', '고1물리', '전력계산'],
})

export default function CircuitSimulatorPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚡ 옴의 법칙 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        직렬·병렬 회로에서 <strong style={{ color: 'var(--text)' }}>전압·전류·저항·전력을 시각적으로 학습</strong>합니다.
        7가지 빈출 회로 프리셋, 회로 SVG와 전류 흐름 애니메이션, 옴의 법칙 빠른 계산, <strong style={{ color: 'var(--text)' }}>단계별 풀이</strong>, 한국 중3·고1 물리 빈출 7문제까지.
      </p>

      <CircuitSimulatorClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 옴의 법칙 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            옴의 법칙(Ohm&apos;s Law)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            가장 기본적인 전기 법칙으로 1827년 독일 물리학자 <strong style={{ color: 'var(--text)' }}>게오르크 옴(Georg Ohm)</strong>이 발견했습니다.
            저항이 일정한 도체에서 전류는 전압에 비례합니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: '#3EFFD0' }}>V</span> = <span style={{ color: '#FFD700' }}>I</span> × <span style={{ color: '#FF8C3E' }}>R</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>전압(V) = 전류(A) × 저항(Ω)</div>
            <div></div>
            <div><span style={{ color: '#FFD700' }}>I</span> = V / R   <span style={{ color: 'var(--muted)' }}>(전류 = 전압 ÷ 저항)</span></div>
            <div><span style={{ color: '#FF8C3E' }}>R</span> = V / I   <span style={{ color: 'var(--muted)' }}>(저항 = 전압 ÷ 전류)</span></div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 9V 건전지 + 100Ω 저항 →
            전류 = <strong style={{ color: '#FFD700' }}>9 / 100 = 0.09A = 90mA</strong>
          </div>
        </div>

        {/* ── 2. 직렬·병렬 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            직렬·병렬 회로 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>━ 직렬 (Series)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>저항이 한 줄로 연결</li>
                <li>모든 저항에 <strong style={{ color: '#FFD700' }}>같은 전류</strong></li>
                <li>전압이 각 저항에 분배 (V = V₁ + V₂ + ...)</li>
                <li>합성 저항 = R₁ + R₂ + ... (커짐)</li>
                <li>한 곳 끊어지면 전체 작동 X</li>
                <li>활용: 분압 회로·LED 전류 제한</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>▥ 병렬 (Parallel)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>저항이 나란히 연결</li>
                <li>모든 저항에 <strong style={{ color: '#3EFFD0' }}>같은 전압</strong></li>
                <li>전류가 각 저항으로 분배 (I = I₁ + I₂ + ...)</li>
                <li>합성 저항 = 1/(1/R₁ + 1/R₂ + ...) (작아짐)</li>
                <li>한 곳 끊어져도 다른 회로 작동</li>
                <li>활용: 가정용 콘센트·전등 회로</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 3. 키르히호프 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            키르히호프 법칙 (Kirchhoff&apos;s Laws)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(62,255,155,0.05)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>KVL — 전압 법칙</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                &quot;닫힌 회로에서 모든 전압의 합 = 0&quot;<br />
                직렬 회로: <strong style={{ color: 'var(--text)' }}>V_전원 = V_R₁ + V_R₂ + ...</strong>
              </p>
            </div>
            <div style={{ background: 'rgba(62,255,155,0.05)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>KCL — 전류 법칙</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                &quot;노드에 들어가는 전류 = 나오는 전류&quot;<br />
                병렬 회로: <strong style={{ color: 'var(--text)' }}>I_전체 = I_R₁ + I_R₂ + ...</strong>
              </p>
            </div>
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.05)',
            border: '1px solid rgba(62,200,255,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            💡 <strong style={{ color: '#3EC8FF' }}>핵심:</strong> 옴의 법칙(V=IR)과 키르히호프 법칙을 결합하면 <strong>모든 회로 풀이가 가능</strong>합니다.
            본 시뮬레이터의 학습 모드 탭에서 단계별 적용 과정을 확인하세요.
          </div>
        </div>

        {/* ── 4. 전력 P=VI ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            전력 공식 P = VI
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div>P = V × I       <span style={{ color: 'var(--muted)' }}>(기본 — 전압 × 전류)</span></div>
            <div>P = I² × R      <span style={{ color: 'var(--muted)' }}>(I = V/R 대입)</span></div>
            <div>P = V² / R      <span style={{ color: 'var(--muted)' }}>(I = V/R 대입)</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 세 공식 모두 옴의 법칙(V=IR)에서 유도되며 결과는 동일</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>검증 (12V, 300Ω 회로):</strong>
            <br />· P = V × I = 12 × 0.04 = <strong style={{ color: '#FF6B6B' }}>0.48W</strong>
            <br />· P = I²R = 0.04² × 300 = <strong style={{ color: '#FF6B6B' }}>0.48W</strong>
            <br />· P = V²/R = 144 / 300 = <strong style={{ color: '#FF6B6B' }}>0.48W</strong>
          </div>
        </div>

        {/* ── 5. 합성 저항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            합성 저항 계산 공식
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '공식', '예시 (100Ω + 200Ω)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '직렬',          f: 'R = R₁ + R₂ + ...',                            ex: '100 + 200 = 300Ω' },
                  { s: '병렬 (일반)',    f: '1/R = 1/R₁ + 1/R₂ + ...',                      ex: '1/100 + 1/200 = 3/200, R ≈ 66.7Ω' },
                  { s: '병렬 (2개 단축)', f: 'R = R₁ × R₂ / (R₁ + R₂)',                      ex: '20000 / 300 ≈ 66.7Ω' },
                  { s: '병렬 (같은 값 N개)', f: 'R = R / N',                                  ex: '100Ω 4개 = 25Ω' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#FF8C3E', fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. LED 회로 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            LED 전류 제한 저항 — DIY 응용
          </h2>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            lineHeight: 1.85,
            marginBottom: 12,
          }}>
            ⚠️ <strong style={{ color: '#FF8C8C' }}>경고:</strong> LED를 전원에 직접 연결하면 즉시 망가집니다.
            반드시 <strong>전류 제한 저항을 직렬로 연결</strong>해야 합니다.
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 공식</span></div>
            <div>R = (V_source − V_LED) / I_LED</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 예시 (5V + 빨간 LED)</span></div>
            <div>V_LED = 2V, I_LED = 20mA</div>
            <div>R = (5 − 2) / 0.02 = <span style={{ color: '#FFD700' }}>150Ω</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>안전 마진을 위해 220Ω 권장 (전류 약간 낮아짐 → LED 수명 ↑)</div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['LED 색상', '전압강하 Vf', '5V 전원', '9V 전원'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '🔴 빨강',  v: '2.0V', a: '150Ω', b: '350Ω' },
                  { c: '🟢 녹색',  v: '2.2V', a: '140Ω', b: '340Ω' },
                  { c: '🟡 노랑',  v: '2.1V', a: '145Ω', b: '345Ω' },
                  { c: '🔵 파랑',  v: '3.4V', a: '80Ω',  b: '280Ω' },
                  { c: '⚪ 흰색',  v: '3.2V', a: '90Ω',  b: '290Ω' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFD700', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFD700', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ I_LED = 20mA 기준. 표준 저항 시리즈에서 가장 가까운 값 사용 권장 (220Ω, 330Ω 등).
          </p>
        </div>

        {/* ── 7. 회로 분석 단계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            회로 분석 6단계 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { n: 'STEP 1', t: '회로 타입 파악', d: '직렬·병렬·혼합 구분, 폐회로 확인' },
              { n: 'STEP 2', t: '합성 저항 계산', d: '직렬: 단순 덧셈 / 병렬: 역수 합' },
              { n: 'STEP 3', t: '전체 전류',     d: '옴의 법칙: I = V / R_total' },
              { n: 'STEP 4', t: '각 저항 분석',   d: '직렬: 전류 동일·전압 분배 / 병렬: 전압 동일·전류 분배' },
              { n: 'STEP 5', t: '전력 계산',     d: 'P = V×I 또는 I²R 또는 V²/R' },
              { n: 'STEP 6', t: 'KVL·KCL 검증', d: '합산 결과 = 입력값 확인' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EFFD0', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, color: '#3EFFD0', fontWeight: 800, letterSpacing: '0.04em', marginBottom: 4 }}>{g.n}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '직렬과 병렬 회로의 차이점은 무엇인가요?',
                a: '<strong>직렬은 저항이 한 줄로 연결</strong>되어 모든 저항에 같은 전류가 흐르며 전압이 분배됩니다. <strong>병렬은 저항이 나란히 연결</strong>되어 모든 저항에 같은 전압이 걸리며 전류가 분배됩니다. 직렬에서는 합성 저항이 커지고(R₁+R₂+...) 병렬에서는 합성 저항이 작아집니다(1/R=1/R₁+1/R₂+...). 가정용 콘센트는 병렬로 연결되어 한 가전이 꺼져도 다른 가전이 작동합니다.',
              },
              {
                q: '옴의 법칙은 모든 경우에 적용되나요?',
                a: '옴의 법칙(V=IR)은 <strong>저항이 일정한 선형 도체에서 정확히 성립</strong>합니다. 그러나 다이오드·LED·트랜지스터 같은 비선형 소자, 온도에 따라 저항이 변하는 경우, 매우 큰 전압·전류에서 발생하는 비선형 효과 등에서는 적용되지 않습니다. 일반 저항은 거의 옴의 법칙을 따르므로 본 시뮬레이터에서 정확한 결과를 얻을 수 있습니다.',
              },
              {
                q: 'LED에 저항이 왜 필요한가요?',
                a: 'LED는 자체 저항이 매우 낮아 전압이 일정 수준을 넘으면 전류가 급격히 증가해 즉시 손상됩니다. 따라서 적절한 저항을 직렬로 연결해 <strong>전류를 제한</strong>해야 합니다. 5V 전원에 빨간 LED(Vf=2V, IF=20mA)를 사용하려면 최소 150Ω(권장 220Ω) 저항이 필요합니다. 본 도구의 LED 회로 프리셋과 옴의 법칙 빠른 계산 탭에서 자동 계산해줍니다.',
              },
              {
                q: '저항의 정격(W)을 초과하면 어떻게 되나요?',
                a: '저항이 소비하는 전력이 정격(예: 1/4W = 0.25W)을 초과하면 <strong>저항이 발열로 손상</strong>됩니다. 저항값이 변형되거나 외부 코팅이 그을릴 수 있고, 심한 경우 화재 위험이 있습니다. 본 시뮬레이터는 각 저항의 전력 소비를 계산하고 정격 초과 시 ⚠️ 경고를 표시해 안전한 회로 설계를 도와줍니다. 일반적으로 안전 마진을 위해 <strong>계산된 전력의 2배 이상 정격</strong> 저항 사용을 권장합니다.',
              },
              {
                q: '한국 중3·고1 물리 시험에 자주 나오는 회로 패턴은?',
                a: '한국 중3·고1 물리 시험 빈출 패턴: ① 단순 직렬(전체 전류·각 저항 전압), ② 단순 병렬(전체 전류·합성 저항), ③ 직렬-병렬 혼합 (R₁ + (R₂//R₃)), ④ 분압 회로(특정 저항 양단 전압), ⑤ 전력 계산(P=VI=I²R=V²/R), ⑥ 키르히호프 법칙 적용. 본 시뮬레이터의 <strong>시험 빈출 패턴 탭</strong>에서 실제 시험 스타일 7문제를 풀어볼 수 있습니다.',
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
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 시각화',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/dev/css-converter',     icon: '🎨', name: 'CSS 값 변환기',         desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/music/frequency',       icon: '🎵', name: '주파수 음정 변환기',     desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/unit/battery',          icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh·Ah 변환' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',     desc: '추가 교육 도구 더보기' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
