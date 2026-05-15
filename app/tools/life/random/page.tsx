import RandomClient from './RandomClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/random',
  title: '랜덤 추첨기 — 가중치·공정성 검증·자리 배치',
  description:
    '숫자·항목 무작위 추첨부터 가중치 추첨, 룰렛, 팀 나누기, 발표 순서, 자리 배치, 공정성 시뮬레이션까지. 메뉴·당번·경품·발표 추첨에 활용. 무료·로그인 없음.',
  keywords: [
    '랜덤 추첨기', '무작위 뽑기', '룰렛', '팀 나누기', '가중치 추첨',
    '발표 순서', '자리 배치', '메뉴 추첨', '당번 정하기', '공정성 검증',
    '랜덤 룰렛', '점심 메뉴 룰렛', '제비뽑기', '팀 편성기', '랜덤 이름 뽑기',
  ],
})

export default function RandomPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎲 랜덤 추첨기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        숫자·항목·가중치 추첨, 룰렛, 팀 나누기, 발표 순서, 자리 배치, 공정성 검증까지 한 번에. <strong style={{ color: 'var(--text)' }}>Fisher-Yates 셔플 + Math.random() 의사난수</strong>로 충분히 균등한 분포를 보장하며, [공정성 검증] 탭에서 직접 확인할 수 있습니다.
      </p>

      <RandomClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 6가지 모드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>6가지 추첨 모드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🎲', name: '간단 추첨',     desc: '숫자 범위·항목 명단 무작위 뽑기 (Fisher-Yates 셔플)' },
              { icon: '⚖️', name: '가중치 추첨',   desc: '항목별 다른 확률 부여 (1~20 가중치)' },
              { icon: '🎰', name: '룰렛 모드',     desc: '시각적 회전 애니메이션 4초 — 점심 메뉴·벌칙' },
              { icon: '👥', name: '팀 나누기',     desc: '명단 → 균등 팀 자동 편성 (리더·함께·떨어뜨릴 옵션)' },
              { icon: '📋', name: '순서·자리 배치', desc: '발표 순서 / 행×열 자리 (고정·인접 회피)' },
              { icon: '📊', name: '공정성 검증',   desc: '1,000~100,000회 시뮬레이션으로 분포 확인' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 가중치 추첨 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>가중치 추첨 활용</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            같은 항목을 여러 개 입력하는 대신 가중치로 확률을 조절합니다. <strong style={{ color: 'var(--text)' }}>확률 = 항목 가중치 / 전체 가중치 합</strong>.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif' }}>
              예: A=3, B=1, C=2 → 총합 6
              <br />→ A: <strong style={{ color: '#FFD700' }}>3/6 = 50%</strong>, B: <strong style={{ color: '#FFD700' }}>1/6 ≈ 17%</strong>, C: <strong style={{ color: '#FFD700' }}>2/6 ≈ 33%</strong>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { case: '이벤트 응모권', detail: '응모 횟수 = 가중치 → 많이 응모한 사람 ↑' },
              { case: '선호 메뉴',     detail: '좋아하는 메뉴 가중치 ↑ → 자주 뽑힘' },
              { case: '벌칙 분산',     detail: '자주 받은 사람 가중치 ↓ → 다른 사람 차례' },
              { case: '게임 아이템',   detail: '레어 1, 일반 5, 흔함 10 → 등급별 차등' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{c.case}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 팀 나누기 알고리즘 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>팀 나누기 알고리즘</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구는 다음 4단계로 팀을 자동 편성합니다:
          </p>
          <ol style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>리더 우선 배치</strong> — 각 팀에 1명씩 (지정 시)</li>
            <li><strong style={{ color: 'var(--text)' }}>함께 묶을 그룹</strong> — 가장 작은 팀에 통째로 배치</li>
            <li><strong style={{ color: 'var(--text)' }}>나머지 셔플 분배</strong> — Fisher-Yates 무작위 셔플 후 가장 작은 팀에 순환 배치</li>
            <li><strong style={{ color: 'var(--text)' }}>떨어뜨릴 그룹 회피</strong> — 같은 그룹 사람이 있는 팀은 자동 회피</li>
          </ol>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>활용</strong>: 학교 조별 활동·회사 회식 자리·운동 경기 팀·동아리 모임·게임 멀티플레이.
          </p>
        </section>

        {/* 4. 룰렛 심리학 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>룰렛의 심리학 — 왜 재미있을까?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { title: '시각적 긴장감', desc: '회전 중 결과를 예상하며 4초간 기대감 ↑' },
              { title: '공정성 체감',   desc: '모든 항목이 부채꼴로 보임 → 조작 X 인식' },
              { title: '결정의 재미',   desc: '단순 결과보다 과정 자체가 즐거움' },
              { title: '책임 분산',     desc: '"내가 정한 게 아니라 룰렛이 정함"' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>🎰 {c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>활용</strong>: 점심 메뉴(못 정할 때) · 벌칙 게임 · 이벤트 추첨 · 어린이 게임 · 회의 발언자.
          </p>
        </section>

        {/* 5. 발표 순서·자리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>발표 순서·자리 배치</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            학교·회사에서 자주 쓰이는 추첨:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[
              { name: '학기 초 자리', desc: '학생 명단 → 행×열 자리 자동' },
              { name: '발표회 순서',  desc: '발표자 무작위 + 1번·마지막 고정' },
              { name: '회의 자리',    desc: '직급·부서별 떨어뜨릴 그룹 옵션' },
              { name: '면접 좌석',    desc: '면접관·지원자 행렬' },
              { name: '결혼식 자리',  desc: '하객 무작위 + 같은 그룹 묶기' },
              { name: '시험 좌석',    desc: '커닝 방지 인접 분리' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '3px' }}>{c.name}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.55 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>옵션</strong>: 1번·마지막 고정 · 제외자 · 떨어뜨릴 사람(인접 회피) · 행/열 자유 설정 (최대 20×20).
          </p>
        </section>

        {/* 6. 공정성 검증 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>공정성 검증 — 큰 수의 법칙</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구의 추첨이 정말 공정한지 의심된다면 <strong style={{ color: 'var(--text)' }}>[공정성 검증] 탭</strong>에서 직접 시뮬레이션해 확인할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시뮬 횟수', '편차 (4개 균등 항목 기준)', '해석'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['100회',     '±10%',     '작은 표본 — 변동 큼'],
                  ['1,000회',   '±2~3%',    '상당히 균등'],
                  ['10,000회',  '±1% 미만',  '거의 완벽'],
                  ['100,000회', '±0.5% 미만', '이론값에 매우 근접'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#3EFF9B', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>큰 수의 법칙(Law of Large Numbers)</strong>: 시행 횟수가 많을수록 실제 비율이 기대 확률에 수렴합니다. 본 도구의 <code style={{ color: 'var(--text)' }}>Math.random()</code> 의사난수는 1,000회 이상에서 매우 균등한 분포를 보입니다.
          </p>
        </section>

        {/* 7. 가중치 vs 단순 추첨 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>가중치 vs 단순 추첨 — 언제 어떤 모드를?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>🎲 단순 추첨 (균등)</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 모든 항목 같은 확률</li>
                <li>· 메뉴·당번·자리 배치</li>
                <li>· 가장 일반적</li>
                <li>· 셔플 알고리즘 (Fisher-Yates)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFD700', marginBottom: '6px' }}>⚖️ 가중치 추첨 (불균등)</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 항목별 다른 확률</li>
                <li>· 응모권·선호도·확률표</li>
                <li>· 게임·이벤트</li>
                <li>· 누적 가중치 알고리즘</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            ⚠️ <strong style={{ color: 'var(--text)' }}>가중치도 무작위입니다</strong> — 가중치 50% 항목이 무조건 뽑히지는 않으며, 여러 번 시행해야 비율이 수렴합니다. 50% 가중치는 &quot;평균적으로 절반 정도 뽑힌다&quot;는 의미입니다.
          </p>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '본 추첨기는 정말 공정한가요?',
                a: '본 도구는 JavaScript의 <code>Math.random()</code> 함수를 사용합니다. 이는 <strong>의사난수(pseudo-random)</strong>로 완벽한 무작위는 아니지만 실용적인 추첨에는 충분히 공정합니다. <strong>[공정성 검증] 탭</strong>에서 1,000~100,000회 시뮬레이션으로 직접 확인하실 수 있으며, 대부분의 경우 이론값과 1% 미만 차이를 보입니다. 법적·계약적 효력이 있는 추첨에는 공증 절차를 권장합니다.',
              },
              {
                q: '가중치 추첨은 어떻게 작동하나요?',
                a: '각 항목에 부여한 가중치 비율에 따라 확률이 결정됩니다. 예: A=3, B=1, C=2일 때 총합 6 → A: <strong>3/6 = 50%</strong>, B: 1/6 ≈ 17%, C: 2/6 ≈ 33%. 가중치는 1~20 사이 정수가 가능하며, 입력 영역 옆에 실시간으로 확률 %가 표시됩니다. 가중치 추첨도 무작위이므로 50% 확률 항목이 무조건 뽑히지는 않으며, 평균적으로 절반이 뽑힌다는 의미입니다.',
              },
              {
                q: '팀 나누기는 어떻게 균형을 맞추나요?',
                a: '본 도구의 팀 나누기는 다음 단계로 작동합니다 — ① 명단 셔플 (Fisher-Yates 무작위), ② 리더 우선 배치 (지정 시), ③ 함께 묶을 그룹 처리 (가장 작은 팀에 통째로), ④ 나머지 명단을 가장 작은 팀에 순환 배치, ⑤ <strong>떨어뜨릴 그룹은 같은 그룹 멤버가 있는 팀 자동 회피</strong>. 팀별 인원 균등을 우선하며, 성별·실력 등 자동 균형 옵션은 추후 업데이트 예정입니다. 현재는 &quot;함께 묶을 사람&quot;·&quot;떨어뜨릴 사람&quot;으로 수동 조정할 수 있습니다.',
              },
              {
                q: '명단을 매번 입력하기 번거로운데?',
                a: '<strong>[저장된 명단]</strong> 기능을 사용하시면 됩니다. 자주 쓰는 명단(예: &quot;우리 동아리 15명&quot;)을 저장해 다음 방문 시 한 번의 클릭으로 복사 → 붙여넣기 가능합니다. 저장된 명단은 사용자 브라우저의 <strong>localStorage</strong>에 보관되며, 캐시 삭제·시크릿 모드 시 사라집니다. 다른 기기에서 사용하려면 텍스트로 복사해 두세요.',
              },
              {
                q: '룰렛 결과를 미리 조작할 수 있나요?',
                a: '아닙니다. 본 도구의 룰렛은 다음 순서로 작동합니다 — ① 가중치에 따라 결과 추첨 (Math.random), ② <strong>결과 항목이 12시 방향에 멈추도록 회전 각도 계산</strong>, ③ 4초 회전 애니메이션 + 결과 팝업. 회전 애니메이션은 결정된 결과를 시각화한 것이며, 사용자가 결과를 조작할 수 없습니다. [다시 돌리기]를 누르면 새로운 무작위 결과가 나옵니다.',
              },
              {
                q: '"꼬집"이나 어림 단위처럼 정확히 알 수 없는 분배도 가능한가요?',
                a: '본 도구는 <strong>정확한 항목명·숫자</strong>가 필요합니다. 어림 단위는 사용자 직접 입력 후 처리합니다. 예: &quot;간식을 적당히 나눠줘&quot;는 처리 어려우므로, 항목을 명확히 입력 후 (예: &quot;사탕 3개·초콜릿 2개·쿠키 1개&quot;) 가중치 추첨으로 변환하시기 바랍니다.',
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

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/life/ladder',     icon: '🪜', name: '사다리타기',           desc: '결과 + 역할 매칭 게임' },
              { href: '/tools/life/lotto',      icon: '🎰', name: '로또 번호 생성기',     desc: '8가지 모드·확률 시뮬' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',      desc: '회식·모임 비용 분배' },
              { href: '/tools/life/unit-price', icon: '💵', name: '단가 비교 계산기',     desc: '쇼핑 가성비 비교' },
              { href: '/tools/life/zodiac',     icon: '🐲', name: '띠·별자리 계산기',     desc: '재미용 운세 정보' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',      desc: '집중·휴식 사이클' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>Fisher-Yates 셔플 알고리즘</strong> — Knuth, 1969 (Art of Computer Programming Vol.2)</li>
            <li><strong style={{ color: 'var(--text)' }}>Math.random() 의사난수</strong> — MDN Web Docs (xorshift128+ 기반)</li>
            <li><strong style={{ color: 'var(--text)' }}>큰 수의 법칙 (Law of Large Numbers)</strong> — 베르누이 정리</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
