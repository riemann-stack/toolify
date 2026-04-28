import Link from 'next/link'
import RacePredictorClient from './RacePredictorClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/race-predictor',
  title: '마라톤 레이스 기록 예측 계산기 — VDOT·Riegel·훈련 페이스',
  description: '5km·10km·하프 기록으로 풀 마라톤 예상 기록 계산. Riegel·VDOT·Cameron 3가지 공식 비교, Jack Daniels 훈련 페이스(E/M/T/I/R), 구간별 스플릿, 기온·습도·고도 보정까지.',
  keywords: ['마라톤예측계산기', '레이스기록예측', 'VDOT계산기', 'Riegel공식', '잭다니엘스훈련페이스', '마라톤서브3', '마라톤서브4', '네거티브스플릿', '페이스전략'],
})

export default function RacePredictorPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏅 마라톤 레이스 기록 예측 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        5km·10km·하프 기록을 입력하면 Riegel·VDOT·Cameron 3가지 공식으로 풀 마라톤 예상 기록을 계산합니다.
        Jack Daniels 훈련 페이스, 구간별 스플릿, 날씨·고도 보정까지 한 번에.
      </p>

      <RacePredictorClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 3가지 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            3가지 예측 공식
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: 'Riegel (1981)', color: 'var(--accent)', formula: 't₂ = t₁ × (d₂/d₁)^1.06',
                desc: '가장 널리 쓰이는 공식. 지수 1.06은 거리 증가에 따른 페이스 저하를 반영. 5~30km 예측에 정확도가 높고 계산이 단순합니다.' },
              { name: 'VDOT (Daniels)', color: '#FF8C3E', formula: 'vo2 ÷ %VO2max',
                desc: '잭 다니엘스 박사의 유산소 능력 지표. 시간에 따른 최대산소섭취량 비율 감소를 지수 함수로 보정해 중·장거리에서 우수합니다.' },
              { name: 'Cameron (1998)', color: '#3EC8FF', formula: 't₂ = t₁ × a(d₂)/a(d₁)',
                desc: '엘리트 기록 통계에서 회귀한 계수 함수 a(d). 10마일 이상 장거리의 마라톤 예측 편차가 작은 편으로 알려져 있습니다.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: '12px', padding: '16px 18px' }}>
                <p style={{ fontSize: '13px', color: f.color, fontWeight: 700, marginBottom: '8px' }}>{f.name}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)', fontWeight: 700, background: 'var(--bg3)', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  {f.formula}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 공식 정확도 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            공식별 추천 사용 거리
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기준 → 목표', 'Riegel', 'VDOT', 'Cameron'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { from: '5km → 10km',   r: '★★★', v: '★★★', c: '★★' },
                  { from: '10km → 하프',  r: '★★★', v: '★★★', c: '★★★' },
                  { from: '하프 → 풀',    r: '★★',  v: '★★★', c: '★★★' },
                  { from: '10km → 풀',    r: '★',   v: '★★',  c: '★★★' },
                  { from: '5km → 풀',     r: '—',   v: '★',   c: '★★' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.from}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontFamily: 'Syne, sans-serif' }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Syne, sans-serif' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            실전에서는 3개 공식의 평균값을 기준 목표로 삼고, 컨디션·날씨·훈련량에 맞춰 ±2% 범위에서 페이스를 조정하는 것을 권장합니다.
          </p>
        </div>

        {/* ── 3. VDOT 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            VDOT 레벨별 기록 기준표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['VDOT', '5km', '10km', '하프', '풀'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'center', color: i === 0 ? 'var(--accent)' : 'var(--muted)', fontWeight: i === 0 ? 700 : 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { v: '30', k5: '30:40', k10: '63:46', half: '2:21:04', full: '4:49:17' },
                  { v: '35', k5: '26:22', k10: '54:57', half: '2:02:00', full: '4:10:39' },
                  { v: '40', k5: '23:09', k10: '48:06', half: '1:46:27', full: '3:39:18' },
                  { v: '45', k5: '20:39', k10: '42:50', half: '1:34:53', full: '3:14:06' },
                  { v: '50', k5: '18:40', k10: '38:42', half: '1:25:40', full: '2:54:00' },
                  { v: '55', k5: '17:03', k10: '35:22', half: '1:18:09', full: '2:37:41' },
                  { v: '60', k5: '15:44', k10: '32:35', half: '1:11:50', full: '2:24:00' },
                  { v: '65', k5: '14:36', k10: '30:16', half: '1:06:30', full: '2:12:50' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.k5}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.k10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.half}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            VDOT(V-dot-O2max)은 Jack Daniels 박사가 제안한 러너의 유산소 능력 통합 지표입니다. 숫자가 클수록 동일 거리에서 더 빠른 기록이 가능하며, 훈련 페이스(E/M/T/I/R)도 VDOT 기반으로 산출됩니다.
          </p>
        </div>

        {/* ── 4. 서브 목표 요건 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            풀 마라톤 서브 목표별 요건
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['목표', '평균 페이스/km', '10km 기록', 'VDOT(근사)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { g: '서브5 (5:00:00)',  p: '7:06', k10: '~64:00', v: '~30' },
                  { g: '서브4:30',          p: '6:24', k10: '~56:00', v: '~34' },
                  { g: '서브4 (4:00:00)',  p: '5:41', k10: '~49:30', v: '~39' },
                  { g: '서브3:30',          p: '4:59', k10: '~43:30', v: '~44' },
                  { g: '서브3 (3:00:00)',  p: '4:16', k10: '~37:30', v: '~52' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.k10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 날씨·고도 영향 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            기온·습도·고도가 기록에 미치는 영향
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { title: '🌡️ 기온', color: '#FF8C3E', items: ['15°C 이하: 최적 (보정 없음)', '15~20°C: +1.5%', '20~25°C: +3.5%', '25°C 이상: +6% 이상'] },
              { title: '💧 습도', color: '#3EC8FF', items: ['60% 이하: 최적', '61~80%: +1%', '80% 초과: +2.5%', '기온과 곱 효과 주의'] },
              { title: '🏔️ 고도', color: '#C8FF3E', items: ['해수면: 기준', '500m: +1.5%', '1000m: +3%', '2000m 이상: +7% 이상'] },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${c.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: c.color, fontWeight: 700, marginBottom: '8px' }}>{c.title}</p>
                <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                  {c.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7 }}>
            대회 당일 예상 기록 = 평시 목표 × (1 + 기온% + 습도% + 고도%). 예) 목표 3:30 + 기온 23°C(3.5%) + 습도 75%(1%) = 3:30 × 1.045 ≈ 3:39:30.
          </p>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '5km 기록으로 풀 마라톤을 예측해도 정확한가요?',
                a: '5km는 유산소·무산소 혼합 에너지 시스템에 의존하지만 풀 마라톤은 순수 유산소 지구력이 결정합니다. 거리 차이가 클수록 예측 오차가 커지므로 10km 이상 기록을 기준으로 삼는 것을 권장합니다. 본 계산기는 3개 공식의 평균값을 제시해 오차를 완화합니다.' },
              { q: 'VDOT과 VO2max는 같은 개념인가요?',
                a: '엄밀히 다릅니다. VO2max는 실험실에서 측정하는 최대산소섭취량(ml/kg/min)이고, VDOT은 실제 레이스 기록에서 역산한 "해당 기록을 내려면 필요한 유산소 능력" 지표입니다. 두 숫자의 크기는 비슷하지만 VDOT은 러닝 경제성·정신력까지 포함된 통합 지표에 가깝습니다.' },
              { q: '훈련 페이스 E/M/T/I/R는 무엇인가요?',
                a: 'Jack Daniels가 정의한 5단계 훈련 존입니다. E(Easy)=회복·지구력, M(Marathon)=레이스 페이스, T(Threshold)=젖산역치 템포, I(Interval)=VO2max 인터벌, R(Repetition)=속도·러닝 이코노미. 주간 훈련 중 E가 80%, 고강도(T/I/R)가 20% 수준이 이상적입니다.' },
              { q: '네거티브 스플릿이 왜 유리한가요?',
                a: '전반부를 아껴두면 글리코겐 고갈·근피로 누적을 늦출 수 있어 후반부 페이스 저하가 작아집니다. 세계기록 대부분은 네거티브 또는 이븐 스플릿이었습니다. 초보자는 전반을 평균 페이스보다 5초/km 느리게 출발하는 것만으로도 효과를 볼 수 있습니다.' },
              { q: '더위에서 목표 기록을 어떻게 조정해야 하나요?',
                a: '기온이 15°C를 넘을 때마다 기록은 평균 1.5~2%씩 느려집니다. 25°C에서는 6% 이상 느려질 수 있어 서브3 러너라면 +10분을 감안해야 합니다. 대회 당일 기온·습도를 확인해 목표 페이스를 조정하고, 물·전해질 섭취를 평소보다 자주 하는 것이 중요합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/pace',       icon: '🏃', name: '러닝 페이스 계산기',       desc: '페이스 ↔ 완주 시간·시속 변환' },
              { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량(BMR) 계산기',   desc: '훈련일 하루 칼로리 산정' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '레이스 전 체중 조절 계획' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',              desc: '다음 마라톤까지 남은 날' },
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
