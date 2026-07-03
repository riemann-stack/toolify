import RandomClient from './RandomClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/life/random',
  title: '랜덤 추첨기 — 룰렛·가중치·팀 나누기·자리 배치',
  description:
    '룰렛 회전으로 점심·벌칙부터 가중치 추첨, 팀 나누기, 발표 순서, 자리 배치까지. 모바일에서도 빠른 칩 입력과 공정성 검증.',
  keywords: [
    '랜덤 추첨기', '룰렛', '점심 메뉴 룰렛', '돌림판', '제비뽑기',
    '팀 나누기', '가중치 추첨', '발표 순서', '자리 배치',
    '메뉴 추첨', '당번 정하기', '벌칙 룰렛', '랜덤 이름 뽑기',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.5px',
}

const FAQ_LD = [
              {
                q: '본 추첨기는 정말 공정한가요?',
                a: '본 도구는 JavaScript의 <code>Math.random()</code>을 사용합니다. 이는 <strong>의사난수(pseudo-random)</strong>로 완벽한 무작위는 아니지만 실용적인 추첨에는 충분히 공정합니다. <strong>[공정성] 탭</strong>에서 1,000~100,000회 시뮬레이션으로 직접 확인 가능. 법적·계약적 효력이 있는 추첨에는 공증 절차를 권장합니다.',
              },
              {
                q: '룰렛에서 가중치는 어떻게 작동하나요?',
                a: '룰렛 탭의 <strong>「⚖️ 가중치 조정」</strong> 토글을 켜면 각 항목 옆에 1~10 슬라이더가 나타납니다. 가중치가 큰 항목은 부채꼴 크기가 커지고, 회전 시 멈출 확률도 비례해 높아집니다. 토글을 끄면 모두 동일 확률(균등).',
              },
              {
                q: '명단 입력은 어떻게 하면 가장 빠른가요?',
                a: '<strong>이름 한 개씩 Enter</strong>로 칩이 추가됩니다. 여러 이름을 한 번에 넣고 싶다면 <strong>&quot;김민수, 이지은, 박서준&quot;</strong>처럼 쉼표나 줄바꿈으로 구분해서 붙여넣으면 자동 분리됩니다. 템플릿 카드를 클릭하면 음식·이름·번호·옵션이 한 번에 채워집니다.',
              },
              {
                q: '팀 나누기는 어떻게 균형을 맞추나요?',
                a: '① 명단 셔플 (Fisher-Yates 무작위), ② 리더 우선 배치 (지정 시), ③ 함께 묶을 그룹 처리 (가장 작은 팀에 통째로), ④ 나머지를 가장 작은 팀에 순환 배치, ⑤ <strong>떨어뜨릴 그룹은 같은 그룹 멤버가 있는 팀 자동 회피</strong>. 결과는 좌우 2열로 한눈에 비교할 수 있게 표시.',
              },
              {
                q: '자리 배치 4×6에서 이름이 잘려요',
                a: '본 도구는 <strong>열 수에 따라 폰트가 자동 조정</strong>됩니다 (열 2개 → 16px / 열 4개 → 14px / 열 6개 → 12px / 열 8개 이상 → 8~10px). 그래도 긴 이름은 일부 잘릴 수 있으니 셀에 마우스 올리면 툴팁으로 전체 이름을 확인할 수 있습니다.',
              },
              {
                q: '룰렛 결과를 미리 조작할 수 있나요?',
                a: '아닙니다. ① 가중치에 따라 결과 추첨 (Math.random), ② <strong>결과 항목이 12시 방향에 멈추도록 회전 각도 계산</strong>, ③ 4초 회전 애니메이션. 회전은 결정된 결과를 시각화한 것이며, 사용자가 결과를 조작할 수 없습니다. 룰렛 돌리기 버튼을 다시 누르면 새 결과.',
              },
            ]

export default function RandomPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="life" />랜덤 추첨기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        룰렛 회전으로 점심·벌칙부터 팀 나누기·자리 배치까지. 모바일에서도 <strong style={{ color: 'var(--text)' }}>빠른 칩 입력</strong>.
      </p>

      <RandomClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5가지 모드 */}
        <section>
          <h2 style={sectionTitle}>5가지 추첨 모드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🎰', name: '룰렛 (메인)',   desc: '4초 회전 → 결과 발표. 항목별 가중치 토글로 단순/불균등 둘 다' },
              { icon: '⚖️', name: '가중치 추첨',   desc: '1~20 가중치 + 확률 미리보기 + 여러 개 뽑기' },
              { icon: '👥', name: '팀 나누기',     desc: '명단 → 좌우 2분할 결과. 리더·묶기·떨어뜨리기 옵션' },
              { icon: '📋', name: '순서·자리',     desc: '발표 순서 / 행×열 자리. 고정·인접 회피' },
              { icon: '📊', name: '공정성 검증',   desc: '100~100,000회 시뮬레이션으로 분포 직접 확인' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 빠른 입력 (칩) */}
        <section>
          <h2 style={sectionTitle}>모바일에서도 빠른 칩 입력</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            텍스트박스에 줄바꿈으로 명단을 채우던 방식 대신, <strong style={{ color: 'var(--text)' }}>이름 한 개씩 Enter</strong>로 칩이 추가되는 방식을 채택했습니다. 모바일 키보드에서도 자연스럽게 입력·삭제할 수 있습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>Enter / 쉼표</strong> — 칩 추가</li>
              <li><strong style={{ color: 'var(--text)' }}>붙여넣기</strong> — &quot;김민수, 이지은, 박서준&quot; 또는 여러 줄 한 번에 → 자동 분리</li>
              <li><strong style={{ color: 'var(--text)' }}>Backspace</strong> — 입력 칸이 빈 상태에서 누르면 마지막 칩 삭제</li>
              <li><strong style={{ color: 'var(--text)' }}>× 버튼</strong> — 개별 칩 제거</li>
              <li><strong style={{ color: 'var(--text)' }}>템플릿 카드</strong> — 음식·이름·번호·옵션을 클릭 한 번에 채움</li>
              <li><strong style={{ color: 'var(--text)' }}>중복 표시·제거</strong> — 같은 이름 있으면 경고 + 한 번 클릭으로 정리</li>
            </ul>
          </div>
        </section>

        {/* 3. 룰렛 활용 */}
        <section>
          <h2 style={sectionTitle}>룰렛 — 가장 자주 쓰는 모드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구의 룰렛은 단순 추첨과 가중치 추첨을 <strong style={{ color: 'var(--text)' }}>모두 포함</strong>합니다. 평소엔 모든 칸 같은 크기로 균등 추첨, <strong style={{ color: 'var(--accent)' }}>가중치 토글</strong>을 켜면 항목별 ×1~×10 비중을 슬라이더로 조정해 칸 크기가 달라집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { title: '점심 메뉴',     desc: '못 정할 때 가장 빠른 결정' },
              { title: '벌칙 게임',     desc: '술자리·MT·동아리 모임' },
              { title: '이벤트 추첨',   desc: '경품·당첨자 시각화' },
              { title: '발언 순서',     desc: '회의·스터디 발언자 룰렛' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>🎰 {c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 가중치 추첨 */}
        <section>
          <h2 style={sectionTitle}>가중치 추첨 — 확률 차등</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            같은 항목을 여러 번 입력하는 대신 가중치로 확률을 조절합니다. <strong style={{ color: 'var(--text)' }}>확률 = 항목 가중치 / 전체 가중치 합</strong>.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif' }}>
              예: A=3, B=1, C=2 → 총합 6
              <br />→ A: <strong style={{ color: '#A16207' }}>3/6 = 50%</strong>, B: <strong style={{ color: '#A16207' }}>1/6 ≈ 17%</strong>, C: <strong style={{ color: '#A16207' }}>2/6 ≈ 33%</strong>
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>활용 예</strong>: 이벤트 응모권 횟수 = 가중치 / 선호 메뉴 비중 / 게임 아이템 등급별 차등 / 벌칙 분산(많이 받은 사람 가중치 ↓).
          </p>
        </section>

        {/* 5. 팀 나누기 알고리즘 */}
        <section>
          <h2 style={sectionTitle}>팀 나누기 알고리즘</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            결과는 <strong style={{ color: 'var(--text)' }}>좌우 2열 카드</strong>로 표시 — 한 화면에 A팀·B팀이 동시에 보입니다. 모바일에서도 가로 분할 유지.
          </p>
          <ol style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>리더 우선 배치</strong> — 각 팀에 1명씩 (지정 시)</li>
            <li><strong style={{ color: 'var(--text)' }}>함께 묶을 그룹</strong> — 가장 작은 팀에 통째로 배치</li>
            <li><strong style={{ color: 'var(--text)' }}>나머지 셔플 분배</strong> — Fisher-Yates 무작위 셔플 후 가장 작은 팀에 순환 배치</li>
            <li><strong style={{ color: 'var(--text)' }}>떨어뜨릴 그룹 회피</strong> — 같은 그룹 멤버가 있는 팀 자동 회피</li>
          </ol>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>활용</strong>: 학교 조별 활동·회사 회식 자리·운동 경기 팀·동아리 모임·게임 멀티플레이.
          </p>
        </section>

        {/* 6. 발표 순서·자리 */}
        <section>
          <h2 style={sectionTitle}>발표 순서·자리 배치</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            자리 배치 결과는 행·열 수에 따라 <strong style={{ color: 'var(--text)' }}>폰트 크기가 자동 조정</strong>됩니다. 다만 열이 많거나 이름이 매우 길면 좁은 셀에서 잘릴 수 있으며, 셀에 마우스를 올리면 툴팁으로 전체 이름을 확인할 수 있습니다. 발표 순서는 1번·마지막 고정과 제외자 옵션 지원.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { name: '학기 초 자리', desc: '학생 명단 → 행×열 자리 자동' },
              { name: '발표회 순서',  desc: '1번·마지막 고정 + 제외자' },
              { name: '회의 좌석',    desc: '같은 부서 떨어뜨리기' },
              { name: '시험 좌석',    desc: '커닝 방지 인접 회피' },
              { name: '결혼식 자리',  desc: '하객 무작위 + 그룹 묶기' },
              { name: '면접 좌석',    desc: '지원자 행렬 배치' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '3px' }}>{c.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 공정성 검증 */}
        <section>
          <h2 style={sectionTitle}>공정성 검증 — 큰 수의 법칙</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구가 정말 공정한지 의심된다면 <strong style={{ color: 'var(--text)' }}>[공정성] 탭</strong>에서 직접 시뮬레이션할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시뮬 횟수', '최대 상대 편차 (4개 균등·중앙값 근사)', '해석'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['100회',     '±20% 안팎',   '작은 표본 — 변동 큼'],
                  ['1,000회',   '±7% 안팎',    '상당히 균등'],
                  ['10,000회',  '±2% 안팎',    '거의 균등'],
                  ['100,000회', '±0.7% 안팎',  '이론값에 매우 근접'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#059669', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>큰 수의 법칙(Law of Large Numbers)</strong>: 시행 횟수가 많을수록 실제 비율이 기대 확률에 수렴합니다.
            위 &ldquo;상대 편차&rdquo;는 <strong style={{ color: 'var(--text)' }}>(실제−기대)/기대 × 100</strong>으로, 공정성 탭의 &ldquo;편차&rdquo; 열과 같은 기준입니다(절대 비율 %p 차이는 이보다 작습니다). 항목 수·가중치에 따라 값이 달라지므로 대략적 경향입니다.
          </p>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
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
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 style={sectionTitle}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>Fisher-Yates 셔플 알고리즘</strong> — Knuth, 1969 (Art of Computer Programming Vol.2)</li>
            <li><strong style={{ color: 'var(--text)' }}>Math.random() 의사난수</strong> — MDN Web Docs (구체적 알고리즘은 ECMAScript가 규정하지 않고 자바스크립트 엔진 구현에 따름)</li>
            <li><strong style={{ color: 'var(--text)' }}>큰 수의 법칙 (Law of Large Numbers)</strong> — 베르누이 정리</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
