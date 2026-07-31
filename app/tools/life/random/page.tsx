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
                q: '사다리타기와 룰렛 중 어느 쪽이 더 공정한가요?',
                a: '사다리타기는 가로줄이 적으면 <strong>출발 위치 바로 아래 근처에 도착이 몰리는</strong> 통계적 편향이 있습니다 (Physica A 2006 분석 — 가로줄이 늘수록 서서히 균등에 접근). 반면 본 도구의 순서·팀 추첨은 Fisher-Yates 균등 셔플, 룰렛은 가중치에 비례한 확률로 직접 추첨하므로 사다리 같은 구조적 편향이 없습니다. 사다리를 쓴다면 가로줄을 넉넉히 추가하고 당첨 위치를 아무도 모르게 정하세요.',
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
              { title: '벌칙 게임',     desc: '모임·MT·동아리 게임' },
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

        {/* 8. 사다리 게임 공정성 */}
        <section>
          <h2 style={sectionTitle}>사다리 게임은 정말 공정할까</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            사다리타기(아미다쿠지)는 의외로 <strong style={{ color: 'var(--text)' }}>완전한 균등 추첨이 아닙니다</strong>. 통계물리 학술지 분석(Inoue, &ldquo;Statistical analysis on Amida-kuji&rdquo;, Physica A 369권 2호, 2006)에 따르면 사다리에서 도착 위치의 확률분포는 1차원 확산 과정을 따릅니다 — 가로줄 하나가 확산의 한 걸음이어서, 가로줄이 적으면 <strong style={{ color: 'var(--text)' }}>출발 위치 바로 아래 근처에 도착할 확률이 균등보다 높아집니다</strong>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사다리 구성', '균등이라면', '실제 계산'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['세로 3줄 · 가로 3개', '각 33.3%', '전수 8패턴 — 출발 위치별 당첨 확률 25% / 37.5% / 37.5%'],
                  ['세로 6줄 · 가로 10개', '각 16.7%', '바로 아래 도착 37% 이상, 반대편 끝은 약 1%'],
                  ['세로 6줄 · 가로 50개', '각 16.7%', '14.7~18.7% — 여전히 완전 균등에 못 미침'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            세로 3줄 전수 계산은 언론 보도에 따르면 일본 슈쿠토쿠대학 이가라시 가즈히로 특임교수가 검증한 값으로(데일리스포츠 2018), 당첨이 오른쪽 끝에 보일 때 출발 위치에 따라 당첨 확률이 갈리며 일반적으로 <strong style={{ color: 'var(--text)' }}>당첨 위치 바로 위 출발이 가장 유리</strong>합니다. 세로 6줄 수치는 전이행렬(마르코프 연쇄) 계산값입니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '8px' }}>
            정리하면 사다리의 공정성은 <strong style={{ color: 'var(--text)' }}>가로줄 수에 따라 달라집니다</strong> — 가로줄이 충분히 많아지면 균등에 접근하지만 수렴이 느립니다. 사다리를 쓴다면 가로줄을 넉넉히 추가하고 당첨 위치를 아무도 모르는 상태로 정하는 것이 좋습니다. 반면 본 도구의 순서·팀 추첨은 사다리 구조를 거치지 않고 균등 셔플로 직접 뽑고, 룰렛은 가중치에 비례한 확률로 직접 추첨하기 때문에 구조적 편향이 없습니다.
          </p>
        </section>

        {/* 9. 난수 생성 방식 */}
        <section>
          <h2 style={sectionTitle}>이 도구의 난수는 어떻게 만들어지나</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            명단 섞기(팀·순서·자리)는 <strong style={{ color: 'var(--text)' }}>Fisher-Yates 셔플</strong>을 사용합니다. 배열 끝에서부터 각 자리를 아직 확정되지 않은 자리 중 하나와 무작위로 맞바꾸는 방식으로, 모든 순열이 같은 확률로 나오는 균등 셔플의 표준 알고리즘입니다(컴퓨터용 O(n) 구현 원전: Durstenfeld, CACM Algorithm 235, 1964). 가중치 추첨은 <code>Math.random()</code> 값을 가중치 합의 누적 구간에 대응시켜 뽑습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
              <strong style={{ color: 'var(--text)' }}>MDN 공식 경고 (2026-07 기준)</strong>: <code>Math.random()</code>은 0 이상 1 미만의 의사난수를 근사 균등 분포로 반환하지만, <strong style={{ color: 'var(--text)' }}>암호학적으로 안전한 난수는 제공하지 않으므로 보안 관련 용도로 쓰지 말라</strong>고 MDN 문서가 명시합니다. 점심 메뉴·자리 배치·발표 순서 같은 일상 추첨에는 충분히 공정하지만, 경품 추첨처럼 금전·이해관계가 큰 추첨이라면 암호학적 난수(<code>crypto.getRandomValues()</code> — MDN 기준 &ldquo;암호학적으로 강한 난수&rdquo;) 기반 도구나 공증 절차를 권장합니다.
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            흔한 잘못된 구현이 <code>sort(() =&gt; Math.random() - 0.5)</code>입니다. MDN sort 규격상 비교 함수는 같은 쌍에 항상 같은 결과를 줘야 하며, 어기면 동작 자체가 미정의라 편향이 생깁니다. 실제로 2010년 EU 브라우저 선택 화면(browserchoice.eu)이 이 방식을 써서 1만 회 시뮬레이션(IE 엔진)에서 Internet Explorer가 5개 중 마지막 위치에 50.34% 몰리는 편향이 확인됐고(Rob Weir 분석), Microsoft도 알고리즘 수정을 인정했습니다(The Register 2010-03-09 보도). 본 도구는 이 방식을 쓰지 않습니다.
          </p>
        </section>

        {/* 10. FAQ */}
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
            <li><strong style={{ color: 'var(--text)' }}>Fisher-Yates 셔플 O(n) 구현 원전</strong> — R. Durstenfeld, &ldquo;Algorithm 235: Random permutation&rdquo;, Communications of the ACM 7(7), 1964</li>
            <li><strong style={{ color: 'var(--text)' }}>사다리(아미다쿠지) 통계 분석</strong> — Y. Inoue, &ldquo;Statistical analysis on Amida-kuji&rdquo;, Physica A 369(2), 867–876, 2006</li>
            <li><strong style={{ color: 'var(--text)' }}>Math.random() 의사난수·보안 경고, Crypto.getRandomValues()</strong> — MDN Web Docs, 2026-07 기준 (구체적 알고리즘은 ECMAScript가 규정하지 않고 자바스크립트 엔진 구현에 따름)</li>
            <li><strong style={{ color: 'var(--text)' }}>랜덤 비교자 셔플 편향 실사례</strong> — R. Weir, &ldquo;Doing the Microsoft Shuffle&rdquo; (2010) · The Register 보도 (2010-03-09)</li>
            <li><strong style={{ color: 'var(--text)' }}>큰 수의 법칙 (Law of Large Numbers)</strong> — 베르누이 정리</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
