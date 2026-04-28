import Link from 'next/link'
import IntervalTrainingClient from './IntervalTrainingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/interval-training',
  title: '인터벌 훈련 계산기 — 400m·800m·야소 800 풀코스 예측',
  description: '5km·10km·하프·풀코스 목표별 인터벌 페이스를 계산합니다. 400m·800m·1km 랩타임, 야소 800 풀코스 예측, 8주 단계별 훈련 스케줄 자동 생성.',
  keywords: ['인터벌훈련계산기', '인터벌페이스', '야소800계산기', '400m페이스', '800m페이스', '마라톤풀코스예측', '러닝인터벌', '인터벌스케줄'],
})

export default function IntervalTrainingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃‍♂️ 인터벌 훈련 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        최근 5km·10km·하프 기록만 입력하면 <strong style={{ color: 'var(--text)' }}>VDOT 기반 인터벌 페이스</strong>,
        400m·800m·1km 랩타임, 야소 800 풀코스 예측, 4~16주 단계별 훈련 스케줄을 한 화면에서 계산합니다.
      </p>

      <IntervalTrainingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Jack Daniels 5가지 강도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인터벌 훈련의 5가지 강도 (Jack Daniels VDOT)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: 'E', n: 'Easy',       c: '#3EFF9B',     d: '회복·기초 체력 (마라톤 페이스 +1~2분/km)' },
              { i: 'M', n: 'Marathon',   c: '#9B59B6',     d: '마라톤 페이스 (풀코스 목표 페이스)' },
              { i: 'T', n: 'Threshold',  c: '#3EC8FF',     d: '젖산 역치 (하프 페이스 부근)' },
              { i: 'I', n: 'Interval',   c: 'var(--accent)', d: 'V̇O2 최대 (5km 페이스)' },
              { i: 'R', n: 'Repetition', c: '#FF6B6B',     d: '스피드 (1마일 페이스)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>
                  {g.i} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginLeft: 6 }}>{g.n}</span>
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 거리별 추천 메뉴 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            거리별 인터벌 추천 메뉴
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['거리', '용도', '권장 횟수', '회복'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '400m',         u: '스피드·V̇O2',      r: '6~10회', c: '200m 조깅' },
                  { d: '800m',         u: '5km·야소 800',    r: '5~10회', c: '400m 조깅' },
                  { d: '1km',          u: '5km·10km 페이스', r: '4~6회',  c: '400m 조깅' },
                  { d: '1.6km (1마일)',u: '역치·V̇O2',         r: '3~5회',  c: '600m 조깅' },
                  { d: '2km',          u: '역치·하프',       r: '3~4회',  c: '600m 조깅' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#FFD93E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 야소 800 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            야소 800 완전 가이드 (한국 러너에게 인기)
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
            <div><span style={{ color: 'var(--muted)' }}>800m × 10회 평균</span> = <strong style={{ color: '#FFD93E' }}>X분 Y초</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>예상 풀코스</span>     = <strong style={{ color: '#FFD93E' }}>X시간 Y분</strong></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 미국 러닝 코치 Bart Yasso가 제시한 풀코스 예측 훈련법</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { i: '3:00/800m', m: '3:00:00 풀코스', c: '#3EFF9B' },
              { i: '3:30/800m', m: '3:30:00 풀코스', c: '#FFD93E' },
              { i: '4:00/800m', m: '4:00:00 풀코스', c: '#FF8C3E' },
              { i: '4:30/800m', m: '4:30:00 풀코스', c: '#FF6B6B' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: r.c, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r.i}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>→ {r.m}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.06)',
            border: '2px solid rgba(255,140,62,0.3)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>주의:</strong> 정확한 공식이 아닌 참고 지표입니다.
            야소 800은 <strong>스피드만 측정</strong>하므로 지구력 평가는 별도 필요합니다.
            실제 풀코스는 장거리주·페이스 유지력에 따라 상당한 차이가 발생합니다.
          </div>
        </div>

        {/* ── 4. VDOT 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            VDOT 표 — 5km 기록별 인터벌 페이스
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['5km 기록', 'VDOT', 'I 페이스 (1km)', 'R 페이스 (400m)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '25:00', v: 38, i: '4:54', r: '1:54' },
                  { t: '22:00', v: 44, i: '4:18', r: '1:42' },
                  { t: '20:00', v: 49, i: '3:54', r: '1:33' },
                  { t: '18:00', v: 54, i: '3:34', r: '1:25' },
                  { t: '17:00', v: 57, i: '3:24', r: '1:22' },
                  { t: '16:00', v: 60, i: '3:14', r: '1:18' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#FFD93E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.i}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 회복 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            회복 시간·거리 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'R 페이스 (스피드)', c: '#FF6B6B', time: '운동 시간의 1.5~2배', dist: '운동 거리의 1배' },
              { t: 'I 페이스 (5km)',    c: 'var(--accent)', time: '운동 시간과 동일', dist: '운동 거리의 50%' },
              { t: 'T 페이스 (역치)',   c: '#3EC8FF', time: '운동 시간의 25~50%', dist: '운동 거리의 25%' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>회복 시간: <strong style={{ color: 'var(--text)' }}>{g.time}</strong></p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>회복 거리: <strong style={{ color: 'var(--text)' }}>{g.dist}</strong></p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,217,62,0.05)',
            border: '1px solid rgba(255,217,62,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            💡 회복 중에는 <strong style={{ color: '#FFD93E' }}>완전 정지보다 가벼운 조깅이 효과적</strong>입니다 (젖산 제거 가속화).
          </div>
        </div>

        {/* ── 6. 트랙 환산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            트랙 거리 환산 (표준 트랙 1바퀴 = 400m)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {[
              { d: '200m',  l: '0.5바퀴' },
              { d: '400m',  l: '1바퀴' },
              { d: '800m',  l: '2바퀴' },
              { d: '1000m', l: '2.5바퀴' },
              { d: '1200m', l: '3바퀴' },
              { d: '1600m', l: '4바퀴 (1마일)' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, color: '#FFD93E', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인터벌 훈련 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📅 훈련 빈도', c: '#FFD93E', items: ['초보: 주 1회', '중급: 주 1~2회', '고급: 주 2~3회'] },
              { t: '🚫 금기 사항',  c: '#FF6B6B', items: ['주간 거리 15% 이상 고강도 X', '전날 장거리주·고강도 후 X', '통증·이상 시 즉시 중단', '부상 회복 직후 점진적 ↑'] },
              { t: '✅ 준비 운동',  c: '#3EFF9B', items: ['워밍업 1.5~3km 가벼운 조깅', '동적 스트레칭 5~10분', '인터벌 후 쿨다운 1.5~3km'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '인터벌 훈련은 얼마나 자주 해야 하나요?',
                a: '일반 러너는 <strong>주 1~2회가 적정</strong>입니다. 주 3회 이상 인터벌은 회복이 부족해 부상·과훈련 위험이 큽니다. 대회 준비 시기 8~12주 전부터 주 1회로 시작해 대회 4주 전 주 2회로 늘리는 것이 일반적입니다. 장거리주(주말)와 인터벌(주중)은 <strong>적어도 2일 이상 간격</strong>을 두세요.',
              },
              {
                q: '야소 800만으로 풀코스 기록을 정확히 알 수 있나요?',
                a: '<strong>야소 800은 스피드 능력 지표이지 정확한 풀코스 예측 공식은 아닙니다.</strong> 실제 풀코스 기록은 주간 누적 거리, 장거리주(30km 이상) 경험, 마라톤 페이스 지속주, 후반 페이스 유지력 등 종합 지구력에 좌우됩니다. 야소 800에서 3시간 30분이 나와도 장거리주가 부족하면 풀코스는 4시간을 넘길 수 있습니다. 참고용으로 활용하되 다른 훈련과 병행하세요.',
              },
              {
                q: '400m 인터벌과 800m 인터벌 중 어느 게 좋은가요?',
                a: '훈련 목적에 따라 다릅니다. <strong>400m</strong>는 스피드·V̇O2 향상(5km 기록 향상에 유리), <strong>800m</strong>는 5km~10km 페이스·야소 800(마라톤 준비), <strong>1km</strong>는 10km 기록 향상·역치 훈련, <strong>1.6km</strong>는 역치 훈련·하프 준비에 적합합니다. 한 가지만 고집하지 말고 주기별로 다양하게 섞는 것이 좋습니다.',
              },
              {
                q: '인터벌 훈련 후 회복은 얼마나 해야 하나요?',
                a: '인터벌 강도가 높을수록 회복 시간을 더 길게 잡아야 합니다. <strong>R 페이스</strong>(스피드)는 운동 시간의 1.5~2배, <strong>I 페이스</strong>(5km)는 운동 시간과 동일, <strong>T 페이스</strong>(역치)는 운동 시간의 25~50%가 적정입니다. 예를 들어 800m를 3분 30초에 뛰었다면 R 페이스라면 회복 5~7분, I 페이스라면 회복 3분 30초~5분이 적정합니다. <strong>회복 중에는 완전 정지보다 가벼운 조깅이 효과적</strong>입니다.',
              },
              {
                q: '트랙이 없으면 인터벌 훈련이 불가능한가요?',
                a: '<strong>가능합니다.</strong> ① GPS 시계로 거리 기반 인터벌(400m·800m·1km 자동 측정), ② 시간 기반 인터벌("3분 빠르게 + 2분 느리게 × 8회"), ③ 한적한 도로·공원 직선 구간 활용, ④ 운동장·공원 둘레 활용(둘레 길이 측정 후 반복) 등 다양한 방법이 있습니다. 트랙이 없어도 충분히 효과적이며, 도로·언덕에서의 변화가 실제 대회 코스 적응에 도움이 됩니다.',
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
              { href: '/tools/sports/pace',           icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
              { href: '/tools/sports/race-predictor', icon: '🏅', name: '마라톤 기록 예측 계산기', desc: 'Riegel·VDOT 공식 기록 예측' },
              { href: '/tools/sports/one-rm',         icon: '🏋️', name: '1RM 계산기',             desc: '근력 훈련 최대 중량 추정' },
              { href: '/tools/sports/fight-weight',   icon: '🥊', name: '격투기 체급 계산기',     desc: '복싱·UFC·MMA 감량 계획' },
              { href: '/tools/date/dday',             icon: '📅', name: 'D-day 계산기',           desc: '대회까지 남은 일수' },
              { href: '/tools/health/bmr',            icon: '🔥', name: '기초대사량(BMR) 계산기', desc: '하루 권장 칼로리·BMR' },
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
