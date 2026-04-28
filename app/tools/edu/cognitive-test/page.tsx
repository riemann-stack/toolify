import Link from 'next/link'
import CognitiveTestClient from './CognitiveTestClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/cognitive-test',
  title: '인지 능력 테스트 — 반응속도·스트룹·이중 과제 게임',
  description: '반응속도, 스트룹 효과, 이중 과제 간섭을 측정하는 인지 심리학 게임. 집중력과 인지 처리 속도를 시각화하고 친구와 비교해 보세요. 게임형 참고 도구입니다.',
  keywords: ['인지능력테스트', '반응속도테스트', '스트룹효과', '이중과제', '집중력테스트', '인지심리학', '두뇌게임', 'reaction time test', 'stroop test'],
})

export default function CognitiveTestPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧠 인지 능력 테스트
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>반응속도·스트룹 효과·이중 과제</strong>로 집중력과 인지 처리 속도를 측정하는 인지 심리학 게임입니다.
        <strong style={{ color: '#FF8C3E' }}> 게임형 참고 도구</strong>이며 의학적 진단이 아닙니다. 친구와 점수를 공유하며 즐겨보세요.
      </p>

      <CognitiveTestClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 인지 능력 테스트란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인지 능력 테스트란?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            인지 심리학에서 사용하는 표준 실험을 게임화한 도구로, <strong style={{ color: 'var(--text)' }}>집중력·억제 통제·작업 전환 능력</strong>을 측정합니다.
            본 도구는 3가지 검증된 인지 심리학 실험을 제공합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🚀 반응 속도', c: '#3EFFD0', d: '시각 자극에 대한 단순 반응 시간 측정 (Simple Reaction Time)' },
              { t: '🎨 스트룹 효과', c: 'var(--accent)', d: '글자 의미와 색상이 충돌할 때 발생하는 인지 간섭 (Stroop Effect, 1935)' },
              { t: '🔄 이중 과제', c: '#FF8C3E', d: '두 작업 동시 수행 시 성능 저하 정도 (Dual-Task Interference)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.06)',
            border: '1px solid rgba(255,140,62,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>본 도구는 의학·임상 진단이 아닌 교육·게임 목적입니다.</strong>
            결과로 자가 진단하지 마세요.
          </div>
        </div>

        {/* ── 2. 반응 속도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            반응 속도 (Reaction Time)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            화면 색이 바뀌는 순간 반응하는 시간을 측정합니다.
            <strong style={{ color: 'var(--text)' }}> 시각 자극 → 인지 → 운동 명령 → 손가락 동작</strong>까지의 시간입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등급', '범위', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { e: '🚀 매우 빠름', r: '~ 200ms', n: '최상위 (프로 게이머·F1 드라이버)', c: '#3EFFD0' },
                  { e: '✨ 빠름',       r: '201~250ms', n: '상위', c: '#3EFF9B' },
                  { e: '⭐ 평균',       r: '251~300ms', n: '일반 성인', c: 'var(--accent)' },
                  { e: '👍 평균 이하',   r: '301~350ms', n: '일상에 무리 없음', c: '#FFD700' },
                  { e: '🐢 느림',       r: '351ms+',   n: '피로·집중 부족·고령일 가능성', c: '#FF8C3E' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            🎯 <strong style={{ color: 'var(--text)' }}>영향 요소:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>수면·피로·카페인 섭취</li>
              <li>나이 (20대 가장 빠름, 점진적 감소)</li>
              <li>기기 성능·입력 지연·모니터 주사율</li>
              <li>시간대 (오후 2~5시 가장 빠름, 저녁·새벽 느림)</li>
            </ul>
          </div>
        </div>

        {/* ── 3. 스트룹 효과 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            스트룹 효과 (Stroop Effect)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            1935년 미국 심리학자 <strong style={{ color: 'var(--text)' }}>J. Ridley Stroop</strong>이 발견한 인지 간섭 현상입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>일치 (Congruent) — 빠름</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong style={{ color: '#FF4444' }}>빨강</strong>이 빨간색으로 표시 → 글자 의미와 색상이 일치 → 자동 처리와 통제 처리가 동일 답
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>불일치 (Incongruent) — 느림</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong style={{ color: '#3E5BFF' }}>빨강</strong>(파란색 표시) → 글자 의미와 색상이 충돌 → 통제 처리가 자동 처리에 간섭받음
              </p>
            </div>
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 18px',
            marginTop: 12,
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.85,
          }}>
            <strong style={{ color: 'var(--text)' }}>원리:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>글자 의미 읽기 = 자동 처리 (빠름)</li>
              <li>글자 색상 판단 = 통제 처리 (느림)</li>
              <li>둘이 충돌 → 통제 처리가 자동 처리에 간섭받음</li>
              <li><strong style={{ color: 'var(--text)' }}>간섭 시간</strong> = 불일치 평균 - 일치 평균 (일반 성인 150~400ms)</li>
            </ul>
          </div>
          <div style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
            🔬 <strong style={{ color: '#C485E0' }}>활용 분야:</strong> 임상 신경심리 검사 (전두엽 기능) · ADHD·인지 장애 연구 ·
            거짓말 탐지 · 스포츠 인지 훈련
          </div>
        </div>

        {/* ── 4. 이중 과제 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이중 과제 간섭 (Dual-Task Interference)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            두 작업을 동시에 할 때 성능이 떨어지는 현상입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>원리:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>인지 자원은 한정됨</li>
              <li>두 작업이 같은 자원 사용 시 충돌</li>
              <li>결과: 반응 느려짐 + 정답률 감소</li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(62,255,208,0.06)',
            border: '1px solid #3EFFD0',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🧠 <strong style={{ color: '#3EFFD0' }}>"진정한 멀티태스킹은 가능한가?"</strong>
            <br />인지 심리학 연구 결과: 사실상 불가능합니다.
            <ul style={{ paddingLeft: 22, marginTop: 6, color: 'var(--muted)' }}>
              <li>뇌는 빠르게 작업 전환 (Task Switching)</li>
              <li>매번 전환마다 시간 손실</li>
              <li>한 작업에 집중할 때 효율 가장 높음</li>
              <li>일반 간섭률: 20~40%</li>
            </ul>
          </div>
        </div>

        {/* ── 5. 측정의 한계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 정확한 측정의 한계
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF6B6B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>웹 환경 한계</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>모니터 주사율 (60Hz=16ms, 144Hz=7ms 오차)</li>
                <li>브라우저 이벤트 큐 지연 (5~20ms)</li>
                <li>입력 방식 (마우스 vs 터치 vs 트랙패드)</li>
                <li>디바이스 성능 차이</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFFD0', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFFD0', fontWeight: 700, marginBottom: 8 }}>임상 vs 본 도구</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>임상: 통제된 환경, 정밀 장비, 반복 측정</li>
                <li>본 도구: 일반 환경, 게임형 참고</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderLeft: '4px solid #3EFFD0', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
            <strong style={{ color: '#3EFFD0' }}>본 결과 활용 방법:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6, color: 'var(--muted)' }}>
              <li>✅ 자기 비교 (어제 vs 오늘) 참고용</li>
              <li>✅ 친구·가족 간 게임 비교</li>
              <li>❌ 절대값 의학 평가</li>
              <li>❌ 진단·검사 대체</li>
            </ul>
          </div>
        </div>

        {/* ── 6. 인지 처리 속도와 일상 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인지 처리 속도와 일상
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🚗 운전',     d: '특히 위급 상황 대응 시간' },
              { t: '🎮 게임',     d: '경쟁 게임 승부에 직결' },
              { t: '⚖️ 의사결정', d: '긴급 상황에서 판단 속도' },
              { t: '📚 학습',     d: '시험 시간 관리·문제 풀이' },
              { t: '💼 업무',     d: '일상 작업 효율' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(62,255,155,0.05)',
            border: '1px solid rgba(62,255,155,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ✅ <strong style={{ color: '#3EFF9B' }}>인지 처리 속도 향상 (일반론):</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6, color: 'var(--muted)' }}>
              <li>충분한 수면 (7~9시간)</li>
              <li>규칙적 운동 (특히 유산소)</li>
              <li>명상·집중력 훈련</li>
              <li>균형 잡힌 식단 (특히 오메가-3)</li>
              <li>두뇌 게임 (단, 효과는 게임에 한정)</li>
            </ul>
            <p style={{ marginTop: 8, fontSize: 12, color: '#FF8C8C' }}>
              ⚠️ 약물·보충제로 인지 능력을 향상시키려는 시도는 의학 전문가 상담 없이 권장되지 않습니다.
            </p>
          </div>
        </div>

        {/* ── 7. 본 도구 활용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            본 도구 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🎯 정확한 측정을 위해', items: ['데스크탑·키보드·마우스 권장 (터치 지연 X)', '조용한 환경', '충분한 휴식 후', '같은 시간대 반복 측정', '첫 측정은 익숙해진 후 (warm-up)'] },
              { t: '📊 결과 해석', items: ['단일 결과가 아닌 트렌드 보기', '자기 평소 결과와 비교', '친구·가족과 게임으로 즐기기', '의학 진단으로 오용 금지'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
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
                q: '평균 반응속도가 250ms인데 정상인가요?',
                a: '네, <strong>일반적인 건강한 성인 범위</strong> 안에 있습니다. 성인의 단순 반응속도는 보통 200~300ms 사이로, 250ms는 평균~빠른 수준입니다. 반응속도는 수면·피로·집중도·카페인·기기 성능에 따라 매번 다릅니다. 한 번의 결과로 인지 능력을 판단하지 말고, 여러 번 측정해 평균을 보거나 자신의 평소 기록과 비교하는 것이 좋습니다.',
              },
              {
                q: '스트룹 효과가 잘 안 나오는데 인지 능력이 좋은 건가요?',
                a: '스트룹 간섭이 작다는 건 글자 의미 자동 처리를 잘 억제한다는 의미로, <strong>선택적 주의력과 실행 기능이 좋다</strong>고 해석될 수 있습니다. 그러나 본 도구는 <strong>게임형 참고 지표이지 임상 검사가 아니므로</strong> "인지 능력이 우수하다"고 단정하기는 어렵습니다. 또한 한국어 글자에 익숙한 정도, 색깔 구분 능력 등에 따라 결과가 다를 수 있습니다.',
              },
              {
                q: '이중 과제 결과가 안 좋은데 ADHD인가요?',
                a: '<strong>본 도구의 결과로 ADHD를 자가 진단하지 마세요.</strong> ADHD는 신경과·정신건강의학과 전문의의 종합 평가로만 진단됩니다 — DSM-5 기준 면접 평가, 표준화된 임상 검사(K-WAIS-IV, Conners 평가척도), 발달력·일상 기능 평가, 신경학적 검사 등. 이중 과제 결과가 떨어지는 건 <strong>수면 부족·피로·집중 부족 등 일시적 요인</strong>일 가능성이 훨씬 높습니다. 지속적인 집중력·주의력 문제로 일상에 어려움이 있다면 전문의 상담을 받으세요.',
              },
              {
                q: '모바일과 데스크탑 결과가 다른 이유는?',
                a: '입력 방식과 화면 응답성이 달라 결과 차이가 발생합니다. <strong>모바일 터치는 인식 지연 약 20~50ms 추가</strong>되며, 모바일 화면 주사율은 보통 60Hz(일부 120Hz)입니다. 반면 데스크탑 마우스는 가장 빠른 입력이며, 모니터 주사율도 144Hz·240Hz 가능합니다. 따라서 <strong>모바일 결과는 데스크탑보다 20~50ms 느릴 수 있으며</strong>, 정확한 측정·자기 기록 갱신은 동일 환경에서 비교하는 것이 좋습니다.',
              },
              {
                q: '매일 테스트하면 인지 능력이 향상되나요?',
                a: '본 도구를 반복하면 <strong>도구 자체에 익숙해져서 결과가 좋아질 수 있지만</strong>, 이것이 일반적인 인지 능력 향상으로 이어진다는 과학적 증거는 약합니다. "두뇌 트레이닝 게임이 인지 능력을 향상시키는가?"는 인지 심리학에서 활발히 연구된 주제로, 대부분의 메타 분석은 <strong>"특정 게임 능력만 향상되고 일반 인지 능력 전이는 제한적"</strong>이라고 결론짓습니다. 진정한 인지 건강은 <strong>충분한 수면·규칙적 운동·사회적 상호작용·평생 학습</strong>이 가장 효과적이라는 것이 일관된 연구 결과입니다.',
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
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 시뮬레이터',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/edu/sound-speed',       icon: '🔊', name: '음속 시뮬레이터',       desc: '천둥·번개 거리·반향·잔향' },
              { href: '/tools/edu/review-interval',   icon: '🧠', name: '복습 간격 계산기',       desc: '망각곡선·SM-2 알고리즘 학습 일정' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',    desc: '추가 교육 도구 더보기' },
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

        {/* ── 10. 참고 자료 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            참고 자료
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 2 }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>Stroop, J.R. (1935). Studies of interference in serial verbal reactions. <em>Journal of Experimental Psychology</em>, 18(6).</li>
              <li>Pashler, H. (1994). Dual-task interference in simple tasks: Data and theory. <em>Psychological Bulletin</em>, 116(2).</li>
              <li>Sternberg, R.J. <em>Cognitive Psychology</em> — 인지 심리학 표준 교과서</li>
              <li>Simons, D.J. et al. (2016). Do "Brain-Training" Programs Work? <em>Psychological Science</em>.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
