import Link from 'next/link'
import IntervalTrainingClient from './IntervalTrainingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/sports/interval-training',
  title: '인터벌 훈련 계산기 — VDOT 페이스·야소 800·E/M/T/I/R 강도',
  description: 'VDOT 기반 정확한 인터벌 페이스 + 거리별 1바퀴 랩타임·워밍업~쿨다운 세션 자동 정리 + 4~16주 트레이닝 스케줄. E·M·T·I·R 5가지 강도 완벽 설명.',
  keywords: ['인터벌훈련계산기', '인터벌페이스', '야소800계산기', '400m페이스', '800m페이스', '마라톤풀코스예측', '러닝인터벌', '인터벌스케줄', 'VDOT 계산기', 'I 페이스', 'R 페이스', 'Jack Daniels VDOT', '한국 마라톤 훈련', '풀코스 예측'],
})

export default function IntervalTrainingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃‍♂️ 인터벌 훈련 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        VDOT 기반 정확한 인터벌 페이스 + <strong style={{ color: 'var(--text)' }}>4~16주 풀 트레이닝 스케줄</strong>.
      </p>

      <IntervalTrainingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Jack Daniels 5가지 강도 (E·M·T·I·R) 자세히 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
            러닝 훈련의 5가지 강도 — E · M · T · I · R 완벽 정리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '18px' }}>
            미국 러닝 코치 <strong style={{ color: 'var(--text)' }}>잭 다니엘스(Jack Daniels)</strong>는 모든 러닝 훈련을 <strong style={{ color: 'var(--text)' }}>딱 5가지 강도</strong>로 나눴습니다.
            느린 것부터 빠른 순서로 <strong style={{ color: 'var(--text)' }}>E → M → T → I → R</strong>이며, 강도마다 키워지는 능력이 다릅니다.
            아래 표의 페이스는 <strong style={{ color: 'var(--text)' }}>마라톤 5시간 / 5km 30분 수준</strong>의 러너를 예시로 든 것으로, 본인 기록을 입력하면 위 계산기가 정확한 페이스를 계산해 줍니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                i: 'E', n: 'Easy · 편하게', c: '#059669',
                what: '심폐 기초·모세혈관·미토콘드리아 발달 (러닝의 토대)',
                feel: '옆 사람과 대화가 편하게 되는 속도. 코로 숨쉬기 가능',
                pace: '대회 마라톤 페이스보다 1~1.5분/km 느리게',
                use: '회복주, 워밍업·쿨다운, 장거리주(LSD)의 기본 페이스',
              },
              {
                i: 'M', n: 'Marathon · 마라톤', c: '#9333EA',
                what: '목표 풀코스 페이스에 몸을 적응시키기 (페이스 감각·연료 효율)',
                feel: '대화는 짧게 가능. "조금 힘들지만 오래 갈 수 있는" 정도',
                pace: '본인 풀코스 목표 페이스 그대로',
                use: '풀코스 준비기의 페이스 지속주(10~20km), 대회 리허설',
              },
              {
                i: 'T', n: 'Threshold · 역치(템포)', c: '#0891B2',
                what: '젖산 역치 끌어올리기 → 더 빠른 속도를 더 오래 유지',
                feel: '"편하게 힘든(comfortably hard)" 강도. 한두 단어만 겨우 말함',
                pace: '약 1시간 전력으로 달릴 수 있는 속도(하프 페이스 부근)',
                use: '20~40분 템포런, 1~2km 반복(크루즈 인터벌)',
              },
              {
                i: 'I', n: 'Interval · 인터벌', c: '#0EA5E9',
                what: '최대산소섭취량(V̇O₂max) 자극 → 심폐 능력의 천장을 올림',
                feel: '말하기 거의 불가능. 3~5분 이상 버티기 힘든 강도',
                pace: '약 5km 레이스 페이스',
                use: '400m~1.2km 반복 + 동일 시간 회복 (이 도구의 핵심 메뉴)',
              },
              {
                i: 'R', n: 'Repetition · 반복주', c: '#DC2626',
                what: '스피드·러닝 이코노미(달리기 효율)·무산소 파워',
                feel: '거의 전력 질주. 폼이 무너지지 않는 선까지만',
                pace: '약 1마일(1.5km) 레이스 페이스 — 가장 빠름',
                use: '200~400m 짧은 반복 + 충분한 완전 회복(2~3배)',
              },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${g.c}`, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: g.c, fontWeight: 800, fontFamily: 'Inter, system-ui, sans-serif' }}>{g.i}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginLeft: 8 }}>{g.n}</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', gap: '4px 10px', fontSize: 12.5, lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>키우는 것</span><span style={{ color: 'var(--text)' }}>{g.what}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>체감</span><span style={{ color: 'var(--text)' }}>{g.feel}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>페이스</span><span style={{ color: 'var(--text)' }}>{g.pace}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>대표 훈련</span><span style={{ color: 'var(--text)' }}>{g.use}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 12, padding: '13px 16px', fontSize: 13, color: 'var(--text)', marginTop: 14, lineHeight: 1.85 }}>
            💡 <strong style={{ color: 'var(--accent)' }}>한 줄 요약:</strong> 느릴수록(E·M) 오래 달리는 <strong>지구력</strong>을, 빠를수록(I·R) 짧고 강하게 <strong>심폐·스피드</strong>를 키웁니다.
            인터벌 훈련에서 가장 많이 쓰는 강도는 <strong style={{ color: '#0EA5E9' }}>I(인터벌)</strong>와 <strong style={{ color: '#DC2626' }}>R(반복주)</strong>이며, 둘 다 반드시 충분한 회복 조깅과 함께 해야 효과가 납니다.
          </div>
        </div>

        {/* ── 2. 거리별 추천 메뉴 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                    <td style={{ padding: '10px 12px', color: '#CA8A04', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 야소 800 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            <div><span style={{ color: 'var(--muted)' }}>800m × 10회 평균</span> = <strong style={{ color: '#CA8A04' }}>X분 Y초</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>예상 풀코스</span>     = <strong style={{ color: '#CA8A04' }}>X시간 Y분</strong></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 미국 러닝 코치 Bart Yasso가 제시한 풀코스 예측 훈련법</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { i: '3:00/800m', m: '3:00:00 풀코스', c: '#059669' },
              { i: '3:30/800m', m: '3:30:00 풀코스', c: '#CA8A04' },
              { i: '4:00/800m', m: '4:00:00 풀코스', c: '#EA580C' },
              { i: '4:30/800m', m: '4:30:00 풀코스', c: '#DC2626' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: r.c, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{r.i}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>→ {r.m}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(234,88,12,0.06)',
            border: '2px solid rgba(234,88,12,0.3)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#EA580C' }}>주의:</strong> 정확한 공식이 아닌 참고 지표입니다.
            야소 800은 <strong>스피드만 측정</strong>하므로 지구력 평가는 별도 필요합니다.
            실제 풀코스는 장거리주·페이스 유지력에 따라 상당한 차이가 발생합니다.
          </div>
        </div>

        {/* ── 4. VDOT 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                    <td style={{ padding: '10px 12px', color: '#CA8A04', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.i}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 회복 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            회복 시간·거리 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'R 페이스 (스피드)', c: '#DC2626', time: '운동 시간의 1.5~2배', dist: '운동 거리의 1배' },
              { t: 'I 페이스 (5km)',    c: 'var(--accent)', time: '운동 시간과 동일', dist: '운동 거리의 50%' },
              { t: 'T 페이스 (역치)',   c: '#0891B2', time: '운동 시간의 25~50%', dist: '운동 거리의 25%' },
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
            💡 회복 중에는 <strong style={{ color: '#CA8A04' }}>완전 정지보다 가벼운 조깅이 효과적</strong>입니다 (젖산 제거 가속화).
          </div>
        </div>

        {/* ── 6. 트랙 환산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                <p style={{ fontSize: 16, color: '#CA8A04', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인터벌 훈련 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📅 훈련 빈도', c: '#CA8A04', items: ['초보: 주 1회', '중급: 주 1~2회', '고급: 주 2~3회'] },
              { t: '🚫 금기 사항',  c: '#DC2626', items: ['주간 거리 15% 이상 고강도 X', '전날 장거리주·고강도 후 X', '통증·이상 시 즉시 중단', '부상 회복 직후 점진적 ↑'] },
              { t: '✅ 준비 운동',  c: '#059669', items: ['워밍업 1.5~3km 가벼운 조깅', '동적 스트레칭 5~10분', '인터벌 후 쿨다운 1.5~3km'] },
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

        {/* ── 8. 16주 풀 스케줄 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📅 16주 풀 인터벌 스케줄 구조
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [훈련 스케줄] 탭은 4~16주 자동 생성. 점진적 강도 증가 + 회복주 + 피크 + 테이퍼 4단계 구조 — 매주 같은 강도는 정체·부상 위험.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { p: '1~4주', n: '🟢 적응', d: '기초 체력 + 인터벌 폼 익히기. 낮은 강도 자주.' },
              { p: '5~8주', n: '🟡 발전', d: '페이스 ↑ + 거리 ↑. 야소 800 등 메뉴 다양화.' },
              { p: '9~12주', n: '🔴 피크', d: '최고 강도 + 대회 시뮬. 주 2회 가능.' },
              { p: '13~16주', n: '🟠 테이퍼', d: '강도 ↓ + 회복. 대회 직전 1~2주 집중 회복.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>{m.p}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>{m.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 4주마다 회복주 자동 삽입 (강도 ↓·회복). 매 주차 페이스·회복·총 거리는 [훈련 스케줄] 탭의 6컬럼 표 자동 생성.
          </p>
        </div>

        {/* ── 9. 1바퀴(400m) 페이스 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏟️ 1바퀴(400m) 페이스 일정성 — 인터벌 효과의 핵심
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 거리별 랩타임 표에 <strong style={{ color: 'var(--text)' }}>1바퀴(400m) 환산 컬럼</strong>이 추가되었습니다. 인터벌 효과는 페이스 일정성에 좌우됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 랩타임</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1바퀴(400m)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>트랙</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '400m',   t: '1:45', l: '1:45',    track: '1바퀴' },
                  { d: '800m',   t: '3:29', l: '1:44.5',  track: '2바퀴' },
                  { d: '1km',    t: '4:21', l: '1:44.4',  track: '2.5바퀴' },
                  { d: '1.2km',  t: '5:13', l: '1:44.3',  track: '3바퀴' },
                  { d: '1.6km',  t: '6:57', l: '1:44.3',  track: '4바퀴 (1마일)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#CA8A04', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.track}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 첫 바퀴 너무 빠르면 후반 무너짐 / 마지막 바퀴 빨라지면 초반 너무 느렸음. 일정 페이스 = V̇O2 max 자극 정확. GPS 시계 또는 트랙 통과 기록 활용.
          </p>
        </div>

        {/* ── 10. 목적별 거리 선택 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🎯 목적별 인터벌 거리 선택
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            위 [추천 인터벌 세션]에서 거리와 횟수를 고르면 워밍업~쿨다운까지 한 세션이 정리됩니다. 어떤 거리를 고를지는 <strong style={{ color: 'var(--text)' }}>훈련 목적</strong>에 따라 달라지며, 한 가지 거리만 고집하지 말고 주기별로 다양화하는 것이 좋습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>주된 효과</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 시기</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '200~400m', e: '🔴 R 스피드 (최대 속도·러닝 이코노미)', t: '시즌 초반·스피드 강화 주기' },
                  { d: '600~800m', e: '🟡 I·R 혼합 (5km·야소 800)',           t: '5km 대회·풀코스 야소 800' },
                  { d: '1km',      e: '🟡 I 페이스 (V̇O2 max)',                 t: '5km·10km 기록 향상' },
                  { d: '1.2~1.6km', e: '🟡 I·T 혼합 (V̇O2 + 역치)',            t: '10km·하프 준비' },
                  { d: '2~3km',    e: '🔵 T 페이스 (역치)',                    t: '하프·풀코스 지구력' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#CA8A04', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 11. 한국 인기 대회 시즌 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏃 한국 인기 마라톤 대회 시즌
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [훈련 스케줄] 탭에서 <strong style={{ color: 'var(--text)' }}>대회 빠른 선택</strong>으로 D-day 자동 입력. 봄(3~5월)·가을(9~11월)이 한국 마라톤 시즌입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { s: '🌸 봄 시즌 (3~5월)', races: '서울국제(3월)·동아(3월)·대구(4월)·서울하프(5월)', plan: '12월부터 16주 시작' },
              { s: '🍁 가을 시즌 (10~11월)', races: '춘천(10월)·JTBC(11월)', plan: '6~7월부터 16주 시작' },
              { s: '🏃 단기 (10km·하프)', races: '연중 자주 개최', plan: '8~12주 단축 스케줄 가능' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{m.s}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--text)', marginBottom: '6px', lineHeight: 1.6 }}>{m.races}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>📅 준비: {m.plan}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 본 도구의 풀 스케줄 + 대회 직전 테이퍼(13~16주차) 활용. 봄 대회 → 12월부터 / 가을 대회 → 6~7월부터 시작 권장.
          </p>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 12. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                a: '<strong>가능합니다.</strong> ① GPS 시계로 거리 기반 인터벌(400m·800m·1km 자동 측정), ② 시간 기반 인터벌(&ldquo;3분 빠르게 + 2분 느리게 × 8회&rdquo;), ③ 한적한 도로·공원 직선 구간 활용, ④ 운동장·공원 둘레 활용(둘레 길이 측정 후 반복) 등 다양한 방법이 있습니다. 트랙이 없어도 충분히 효과적이며, 도로·언덕에서의 변화가 실제 대회 코스 적응에 도움이 됩니다.',
              },
              {
                q: '16주 훈련 스케줄에서 매주 페이스가 다른 이유는?',
                a: '점진적 강도 증가 + 회복주 + 피크 + 테이퍼 구조입니다.<br/>• <strong>1~4주</strong>: 적응 (낮은 강도, 자주)<br/>• <strong>5~8주</strong>: 발전 (페이스 ↑)<br/>• <strong>9~12주</strong>: 피크 (최고 강도)<br/>• <strong>13~16주</strong>: 테이퍼 (회복·대회 준비)<br/>본 도구의 [훈련 스케줄] 표는 각 주 정확한 페이스·회복·총 거리를 표시합니다. 매주 같은 강도는 정체·부상 위험.',
              },
              {
                q: '1바퀴(400m) 페이스가 왜 중요한가요?',
                a: '인터벌 효과는 <strong>페이스 일정성</strong>에 좌우됩니다. 첫 바퀴 너무 빠르면 후반 무너지고, 마지막 바퀴 빨라지면 초반 너무 느렸다는 의미. 일정 페이스 = V̇O2 max 자극 정확. 본 도구는 800m·1km·1.6km 인터벌의 1바퀴(400m) 환산을 자동 표시합니다 (예: 800m 3:29 = 1바퀴 1:44.5). GPS 시계 또는 트랙 통과 기록 활용 권장.',
              },
              {
                q: 'VDOT 43.4가 무슨 의미인가요?',
                a: 'Jack Daniels의 V̇O2 max 추정 지표입니다.<br/>• VDOT 30: 5km 35분 수준<br/>• VDOT 40: 5km 24분<br/>• VDOT 50: 5km 19분<br/>• VDOT 60: 5km 16분<br/>• VDOT 70: 엘리트 수준<br/>본인 5km·10km·하프 기록으로 VDOT 자동 계산 (숫자 ↑ = 능력 ↑). 본 도구는 VDOT 기반으로 5가지 강도(E·M·T·I·R) 페이스를 정확 산출합니다.',
              },
              {
                q: '인터벌 훈련 중 부상이 의심되면 어떻게 해야 하나요?',
                a: '<strong>즉시 중단</strong> + 다음 단계 진행:<br/>1. 운동 즉시 중단<br/>2. RICE (Rest·Ice·Compression·Elevation)<br/>3. 24시간 관찰<br/>4. 통증 지속 → 정형외과·재활의학과<br/><strong>응급 신호 (즉시 119)</strong>: 가슴 통증·심한 호흡곤란 / 어지러움·실신 / 다리 마비.<br/>⚠️ &ldquo;통증을 무시하고 계속 훈련&rdquo; 절대 X. 부상 회복 후 점진적 복귀. 본 도구의 [부상 이력] 체크 시 강도가 자동으로 -10% 보정됩니다.',
              },
              {
                q: '한국 인기 대회 시즌에 맞춰 훈련하려면?',
                a: '본 도구의 [훈련 스케줄] 탭 상단에 <strong>한국 인기 대회 빠른 선택</strong>이 있습니다. 대회 클릭 시 D-day와 종목이 자동 입력됩니다.<br/>• <strong>봄 대회</strong> (3~5월): 서울국제·동아(3월) / 대구(4월) / 서울하프(5월) → 12월부터 16주 시작<br/>• <strong>가을 대회</strong> (10~11월): 춘천(10월) / JTBC(11월) → 6~7월부터 16주 시작<br/>본 도구의 풀 스케줄 + 대회 직전 테이퍼(13~16주차)로 시즌 준비.',
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/pace',           icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
              { href: '/tools/sports/race-predictor', icon: '🏅', name: '마라톤 기록 계산기', desc: 'Riegel·VDOT 공식 기록 예측' },
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
