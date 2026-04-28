import Link from 'next/link'
import ReviewIntervalClient from './ReviewIntervalClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/review-interval',
  title: '복습 간격 계산기 — 에빙하우스 망각곡선·SM-2 알고리즘 학습 일정',
  description: '학습일과 기억 점수로 다음 복습일을 계산합니다. 에빙하우스 망각곡선 시각화, SM-2 알고리즘, 시험일 역산, 학습 항목 자동 관리(localStorage 저장).',
  keywords: ['복습간격계산기', '망각곡선', '에빙하우스', 'SM-2알고리즘', '복습주기', '학습일정', '간격반복학습', '시험공부계획', 'Spaced Repetition', 'Anki'],
})

export default function ReviewIntervalPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧠 복습 간격 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>에빙하우스 망각곡선</strong>과 <strong style={{ color: 'var(--text)' }}>SM-2 알고리즘</strong>으로 다음 복습일을 계산하고,
        학습 항목을 브라우저에 저장해 자동 관리합니다. 시험일 역산 학습 계획, 망각곡선 SVG 시각화, Anki 같은 간격 반복 학습(SRS)을 무료로.
      </p>

      <ReviewIntervalClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 망각곡선 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            에빙하우스 망각곡선
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            1885년 독일 심리학자 <strong style={{ color: 'var(--text)' }}>헤르만 에빙하우스(Hermann Ebbinghaus)</strong>가 제시한 이론 —
            학습 후 시간이 지날수록 기억이 지수적으로 감소합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시점', '기억 유지율 (%)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '학습 직후',   r: '100%', c: '#3EFFD0' },
                  { t: '20분 후',     r: '약 58%', c: '#3EFF9B' },
                  { t: '1시간 후',    r: '약 44%', c: '#FFD700' },
                  { t: '1일 후',      r: '약 33%', c: '#FF8C3E' },
                  { t: '6일 후',      r: '약 25%', c: '#FF8C3E' },
                  { t: '31일 후',     r: '약 21%', c: '#FF6B6B' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            marginTop: 12,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 단순 모델</span></div>
            <div><span style={{ color: '#3EFFD0' }}>R(t)</span> = e^(−t/<span style={{ color: '#FFD700' }}>S</span>) × 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>R: 기억 유지율(%) · t: 경과 시간 · S: 기억 안정도</div>
          </div>
        </div>

        {/* ── 2. 간격 반복 학습 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            간격 반복 학습 (Spaced Repetition)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            같은 정보를 반복하되, 점점 간격을 늘려가며 학습하는 방법.
            에빙하우스 망각곡선의 단점을 극복하는 검증된 학습법입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🧠 망각 속도 둔화', d: '매번 복습할 때마다 기억 안정도가 증가해 망각 속도가 느려집니다.' },
              { t: '⏱️ 학습 시간 절약', d: '단순 반복 대비 50~70% 시간 효율화. 의대생·언어 학습자 표준 방법.' },
              { t: '📚 장기 기억 형성', d: '시험 직전 벼락치기보다 효과적. 평생 활용 가능한 지식으로 정착.' },
              { t: '🎯 정확한 타이밍', d: '"잊을 만 할 때" 복습이 가장 효과적. SM-2가 자동 계산.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EFFD0', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            🛠️ <strong style={{ color: 'var(--text)' }}>대표 SRS 도구:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li><strong>Anki</strong> (오픈소스, 무료) — apps.ankiweb.net</li>
              <li><strong>SuperMemo</strong> (원조)</li>
              <li><strong>Quizlet</strong> (단어장 SRS, 입문용)</li>
              <li><strong>Duolingo</strong> (언어 학습 + 게임화)</li>
            </ul>
          </div>
        </div>

        {/* ── 3. SM-2 알고리즘 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            SM-2 알고리즘 (SuperMemo 2)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            1985년 폴란드의 <strong style={{ color: 'var(--text)' }}>Piotr Wozniak</strong>이 만든 알고리즘.
            현재 대부분 SRS 도구의 기반입니다.
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
            <div><span style={{ color: 'var(--muted)' }}># 핵심 원리</span></div>
            <div>각 학습 항목에 <span style={{ color: '#3EFFD0' }}>난이도 계수(EF)</span> 부여 (기본 2.5)</div>
            <div>기억 점수(0~5)에 따라 EF 자동 조정</div>
            <div>점수 ↑ → EF ↑ → 다음 간격 길어짐</div>
            <div>점수 낮음(&lt;3) → 처음부터 다시 (간격 1일)</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 계산 공식</span></div>
            <div><span style={{ color: '#3EFFD0' }}>EF&apos;</span> = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))</div>
            <div><span style={{ color: '#3EFFD0' }}>다음 간격</span> = 이전 간격 × EF (3회 성공 후)</div>
          </div>
        </div>

        {/* ── 4. 권장 복습 간격 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            권장 복습 간격 (한국 학생용)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📘 일반 학습 (보통)', c: 'var(--accent)', items: ['1차: 학습 다음 날', '2차: 3일 후', '3차: 7일 후', '4차: 14일 후', '5차: 30일 후', '시험 2일 전 최종 복습'] },
              { t: '📕 어려운 내용',      c: '#FF6B6B',     items: ['1차: 당일 또는 다음 날', '2차: 2일 후', '3차: 5일 후', '4차: 10일 후', '5차: 21일 후'] },
              { t: '📗 외국어 단어장',    c: '#3EC8FF',     items: ['1차: 다음 날', '2차: 3~4일 후', '3차: 7일 후', '4차: 14일 후', '5차: 30일 후', '이후 매월 1회'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 효과적 복습 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            효과적인 복습 방법
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🧠 능동적 회상 (Active Recall)', d: '책을 보지 않고 떠올리기 · 노트만 보고 답 적기 · 누군가에게 설명하듯 말하기 → 단순 다시 읽기보다 2~3배 효과' },
              { t: '📊 분산 학습 (Distributed Practice)', d: '한 번에 4시간 vs 4일 동안 1시간씩 → 분산이 우수. 짧은 간격으로 자주 학습이 효율적' },
              { t: '🔗 개념 연결',                    d: '새 정보를 기존 지식과 연결 · 시각화·이미지화 · 비유와 예시 활용 → 장기 기억 형성' },
              { t: '✏️ 손으로 쓰기',                  d: '키보드 입력보다 손글씨가 기억 정착에 효과적 (cognitive engagement ↑)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'rgba(62,255,208,0.05)', border: '1px solid rgba(62,255,208,0.30)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 학습 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            학습 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '😴 수면의 중요성', d: '기억은 잠자는 동안 정리·강화됩니다. 7~9시간 수면 권장. 시험 전날 밤샘 < 충분한 수면.' },
              { t: '🎯 집중 환경',     d: '25~50분 집중 + 5~10분 휴식 (포모도로). 스마트폰 멀리 두기. 학습과 무관한 자극 최소화.' },
              { t: '💪 건강',          d: '규칙적 운동 → 기억력 ↑. 균형 잡힌 식단. 카페인 적정량 (오전 위주).' },
              { t: '⏰ 골든 타임',     d: '학습 후 기억 정착에 결정적. 학습 후 1시간 이내 한 번 훑어보기 — 이후 복습 효율 ↑.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            본 도구 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🌱 초보자',  d: '<strong>탭 1 (간단 복습 일정)</strong>부터 시작 · 보통 난이도 + 일반 강도 추천 · 일정 적힌 종이를 잘 보이는 곳에' },
              { t: '🌿 중급자',  d: '<strong>탭 3 (학습 항목 관리)</strong> 활용 · 매일 도구 방문해 "오늘 복습할 항목" 확인 · 정직하게 기억 점수 입력' },
              { t: '🌳 고급자',  d: '<strong>탭 2 (SM-2)</strong> + 탭 3 조합 · EF 변화 추적 · 백업 다운로드로 데이터 보존 · 다른 기기 사용 시 가져오기' },
              { t: '📅 시험 대비', d: '<strong>탭 4 (시험일 역산)</strong>으로 일별 학습량 미리 계산 · 시험 2일 전 최종 복습 시간 확보' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EFFD0', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: g.d }} />
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
                q: '복습은 언제 하는 것이 가장 효과적인가요?',
                a: '<strong>"잊을 만 할 때"</strong> 복습하는 것이 가장 효과적입니다. 너무 자주 복습하면 시간 낭비, 너무 늦으면 다시 학습해야 합니다. 에빙하우스 망각곡선에 따라 일반적으로 ① 학습 다음 날(기억 33%), ② 3일 후(20%), ③ 7일 후(15%), ④ 14일 후(10%) 이렇게 점진적으로 간격을 늘리는 것이 권장됩니다. 본 도구의 SM-2 알고리즘이 개인의 기억 점수에 따라 자동 조정해줍니다.',
              },
              {
                q: 'SM-2 알고리즘이 무엇인가요?',
                a: '<strong>SuperMemo 2(SM-2)</strong>는 1985년 Piotr Wozniak이 만든 간격 반복 학습 알고리즘입니다. 각 학습 항목의 난이도(EF, Easiness Factor)를 사용자의 기억 점수(0~5)에 따라 자동 조정하며, 다음 복습 간격을 계산합니다. <strong>Anki·Mnemosyne</strong> 등 대부분의 SRS(Spaced Repetition System) 도구의 기반이며, 의대생·언어 학습자가 가장 많이 사용하는 검증된 알고리즘입니다.',
              },
              {
                q: '망각곡선은 정말 정확한가요?',
                a: '에빙하우스의 원래 실험은 자기 자신을 대상으로 무의미한 음절을 외운 결과입니다. <strong>개인차·학습 내용·수면·집중도에 따라 실제 망각 속도는 크게 다를 수 있습니다.</strong> 그러나 "시간이 지날수록 기억이 지수적으로 감소"하는 일반 패턴은 검증되었으며, 간격 반복 학습은 수많은 후속 연구로 효과가 입증되었습니다. 본 도구는 이 일반 원리를 단순화한 참고용 도구입니다.',
              },
              {
                q: '매일 새로 학습하면 복습이 너무 많아지지 않나요?',
                a: '네, 간격 반복 학습의 단점입니다. 처음에는 매일 학습량 = 복습량이 늘어나지만, 간격이 점점 길어지면서 안정화됩니다. 30일 동안 매일 30개 신규 학습 시: ① 1주차 신규 30 + 복습 30 = 60개, ② 2주차 신규 30 + 복습 60 = 90개, ③ <strong>3주차 이후 신규 30 + 복습 약 100개로 안정</strong>. 본 도구의 <strong>탭 4 (시험일 역산)</strong>에서 일별 학습량을 미리 계산할 수 있습니다.',
              },
              {
                q: '본 도구의 데이터는 어디에 저장되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 장점: ① 회원가입·로그인 불필요, ② 빠른 접근, ③ 사생활 보호(서버에 데이터 X). 단점: ① 같은 브라우저·같은 기기에서만 접근, ② 캐시 삭제·시크릿 모드 시 사라짐, ③ 다른 기기 사용 시 백업·가져오기 필요. <strong>탭 3에서 [백업 다운로드]</strong> 기능으로 정기적으로 JSON 파일을 저장하시기를 권장합니다.',
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
              { href: '/tools/date/dday',              icon: '📅', name: 'D-day 계산기',           desc: '시험·자격증까지 카운트다운' },
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',          desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 시각화',       desc: '8개 행성 몸무게·나이·하루' },
              { href: '/tools/edu/sound-speed',        icon: '🔊', name: '음속 시뮬레이터',        desc: '천둥·번개 거리·에코·잔향' },
              { href: '/tools/edu/circuit-simulator',  icon: '⚡', name: '옴의 법칙 시뮬레이터',   desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/date/age',               icon: '🎂', name: '만 나이 계산기',         desc: '법 개정 기준 만 나이' },
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

        {/* ── 10. 외부 자원 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            추천 학습 자원
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 2 }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>Anki</strong> (무료 SRS): apps.ankiweb.net</li>
              <li><strong style={{ color: 'var(--text)' }}>Quizlet</strong> (단어장 SRS, 입문용)</li>
              <li><strong style={{ color: 'var(--text)' }}>SuperMemo</strong> (원조)</li>
              <li>책 <em>"어떻게 공부할 것인가" (Make It Stick)</em> — 벤지 카퍼·헨리 뢰디거</li>
              <li>책 <em>"메타인지 학습법"</em> — 학습 효율 향상에 관한 한국어 입문서</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
