import Link from 'next/link'
import FormationClient from './FormationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/sports/formation',
  title: '축구 포메이션 생성기 — 4-3-3·4-4-2·5인제 풋살까지 라인업 시각화',
  description:
    '5·7·9·11인제 22+ 포메이션 + 커스텀(4-2-3-1 등) 라인업을 그라운드 위에 시각화. 선수 카드 클릭으로 이름·번호 편집 + PNG 다운로드와 마크다운 공유.',
  keywords: [
    '축구 포메이션', '포메이션 만들기', '라인업 생성기', '풋살 포메이션',
    '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3',
    '9인제 포메이션', '7인제 축구', '5인제 풋살',
    '포메이션 그리기', '팀 라인업', '축구 명단 정리',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

export default function FormationPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚽ 축구 포메이션 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        5·7·9·11인제 22+ 포메이션을 <strong style={{ color: 'var(--text)' }}>그라운드 위에 시각화</strong>. 선수 카드 클릭으로 이름·번호 편집, PNG 다운로드로 단톡·블로그 공유.
      </p>

      <FormationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <section>
          <h2 style={sectionTitle}>🛠️ 사용법 3단계</h2>
          <div style={card}>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>인원 + 포메이션 선택</strong> — 11/9/7/5인 + 프리셋 또는 커스텀(4-2-3-1 등)</li>
              <li><strong>선수 카드 클릭</strong>으로 등번호·이름 개별 편집 — 비워두면 자동 1~11 번호</li>
              <li><strong>PNG 다운로드</strong>로 단톡·블로그 공유, 또는 마크다운으로 텍스트 복사</li>
            </ol>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              💡 모든 입력은 자동 저장 — 새로고침해도 명단·포메이션·등번호·팀 색상이 유지됩니다.
            </p>
          </div>
        </section>

        {/* 1.5 활용 시나리오 */}
        <section>
          <h2 style={sectionTitle}>📌 활용 시나리오</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { icon: '🏆', name: '회사·동호회 축구',  desc: '주말 모임 라인업을 단톡방에 PNG로 공유. 포지션 명확히 전달' },
              { icon: '🎓', name: '학교·청소년 클럽',  desc: 'U-12 9인제·U-15 11인제 코치진의 보드 자료' },
              { icon: '🏟️', name: '풋살장 예약 팀',    desc: '5인제 다이아·박스 포메이션 사전 정리 + 멤버 확정' },
              { icon: '📺', name: '경기 분석·블로그',  desc: '관전평·전술 분석 시 시각 자료. 두 팀 라인업 동시 게재' },
              { icon: '🎮', name: 'FIFA·이풋볼 전술',  desc: '게임 전술 스쿼드 시뮬레이션' },
              { icon: '🏫', name: '체육 수업·합반',    desc: '팀 나누기 + 포지션 일괄 안내' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{b.icon} {b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 인원별 권장 포메이션 */}
        <section>
          <h2 style={sectionTitle}>🎯 인원별 추천 포메이션</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th style={headCell}>인원</th>
                    <th style={headCell}>추천 포메이션</th>
                    <th style={headCell}>특징·활용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}><strong>11인 정규</strong></td><td style={cell}>4-3-3 · 4-2-3-1 · 4-4-2</td><td style={cell}>국제 표준. 4-2-3-1이 현대 1순위</td></tr>
                  <tr><td style={cell}><strong>9인 청소년</strong></td><td style={cell}>3-3-2 · 2-4-2</td><td style={cell}>U-12 KFA 9인제 공식 권장</td></tr>
                  <tr><td style={cell}><strong>7인제</strong></td><td style={cell}>2-3-1 · 2-2-2</td><td style={cell}>동호회·사회인 축구. 공간 좁아 좌우 빠른 전환</td></tr>
                  <tr><td style={cell}><strong>5인제 풋살</strong></td><td style={cell}>1-2-1 (다이아) · 2-2 (박스)</td><td style={cell}>다이아가 가장 많이 쓰임. 박스는 점유</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. 주요 11인 포메이션 비교 */}
        <section>
          <h2 style={sectionTitle}>⚽ 주요 11인 포메이션 비교</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {[
              { name: '4-4-2',   color: '#0891B2', tag: '클래식', desc: '균형의 정석. 측면 미드와 투톱이 명확. 알렉스 퍼거슨의 맨유 황금기' },
              { name: '4-3-3',   color: '#059669', tag: '현대 공격', desc: '윙어 활용 + 중원 3인. 펩의 바르샤·클롭의 리버풀' },
              { name: '4-2-3-1', color: '#FFD93E', tag: '현대 표준', desc: '더블 볼란치 + 톱2.5. 22 카타르 월드컵에서 가장 흔한 포메이션' },
              { name: '3-5-2',   color: '#EA580C', tag: '스리백', desc: '윙백 공격 가담 + 투톱. 안토니오 콘테 인터' },
              { name: '3-4-3',   color: '#B885DA', tag: '공격적 3백', desc: '윙백 + 스리톱. 콘테 첼시·과르디올라 시티 변형' },
              { name: '5-4-1',   color: '#DC2626', tag: '5백 카운터', desc: '강팀 상대 잠그기 + 빠른 역습. 약체팀이 즐겨 쓰는 잠금 전술' },
              { name: '4-1-4-1', color: '#0D9488', tag: '수비 안정', desc: '단일 수비형 미드 + 박스 4. 점유와 안정 동시. 만치니 시티 시기' },
              { name: '3-6-1',   color: '#DB2777', tag: '점유 압도', desc: '미드 6인으로 중원 압도. 빌드업·점유 위주' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: 12, padding: '10px 12px', minWidth: 0 }}>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 17, fontWeight: 800, color: f.color, margin: 0 }}>{f.name}</p>
                <p style={{ fontSize: 11, color: f.color, fontWeight: 700, margin: '2px 0 6px', opacity: 0.85 }}>{f.tag}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 포지션 약어 */}
        <section>
          <h2 style={sectionTitle}>📚 포지션 약어 가이드</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th style={headCell}>약어</th>
                    <th style={headCell}>풀네임 · 역할</th>
                    <th style={headCell}>대표 선수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}><strong>GK</strong></td><td style={cell}>Goalkeeper · 골키퍼</td><td style={cell}>김승규·조현우·노이어</td></tr>
                  <tr><td style={cell}><strong>CB</strong></td><td style={cell}>Center Back · 중앙 수비</td><td style={cell}>김민재·반다이크</td></tr>
                  <tr><td style={cell}><strong>LB/RB</strong></td><td style={cell}>Left/Right Back · 풀백</td><td style={cell}>이용·트렌트 알렉산더-아놀드</td></tr>
                  <tr><td style={cell}><strong>LWB/RWB</strong></td><td style={cell}>Wing Back · 스리백 시스템의 측면</td><td style={cell}>알폰소 데이비스·아슈라프 하키미</td></tr>
                  <tr><td style={cell}><strong>DM</strong></td><td style={cell}>Defensive Mid · 수비형 미드 (홀딩)</td><td style={cell}>로드리·조르지뉴</td></tr>
                  <tr><td style={cell}><strong>CM</strong></td><td style={cell}>Central Mid · 중앙 미드</td><td style={cell}>케빈 더브라위너·모드리치</td></tr>
                  <tr><td style={cell}><strong>AM</strong></td><td style={cell}>Attacking Mid · 공격형 미드</td><td style={cell}>이강인·외데가르</td></tr>
                  <tr><td style={cell}><strong>LM/RM</strong></td><td style={cell}>Left/Right Mid · 측면 미드</td><td style={cell}>황희찬·살라</td></tr>
                  <tr><td style={cell}><strong>LW/RW</strong></td><td style={cell}>Left/Right Wing · 윙어</td><td style={cell}>손흥민·비니시우스</td></tr>
                  <tr><td style={cell}><strong>ST/CF</strong></td><td style={cell}>Striker · 중앙 공격수</td><td style={cell}>해리 케인·홀란드·음바페</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. 한국 축구 포메이션 트렌드 */}
        <section>
          <h2 style={sectionTitle}>🇰🇷 한국 축구의 포메이션 흐름</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            대한민국 대표팀과 K리그에서 자주 쓰이는 포메이션은 시대별로 변화해 왔습니다.
            현재 한국 축구의 주류는 <strong style={{ color: 'var(--text)' }}>4-2-3-1·4-1-4-1</strong>이며,
            클린스만 사임 후 황선홍·홍명보 체제에서 4-2-3-1을 표준으로 정착시켰습니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>시대</th>
                  <th style={headCell}>주류 포메이션</th>
                  <th style={headCell}>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>2002 한일 월드컵</td><td style={cell}><strong>3-4-3</strong></td><td style={cell}>거스 히딩크 — 공격적 스리백, 박지성 황의조 시대 시작</td></tr>
                <tr><td style={cell}>2010 남아공 월드컵</td><td style={cell}><strong>4-4-2 다이아</strong></td><td style={cell}>허정무 — 박지성 톱2.5, 박주영 원톱</td></tr>
                <tr><td style={cell}>2018 러시아 월드컵</td><td style={cell}><strong>4-4-2 / 4-2-3-1</strong></td><td style={cell}>신태용 — 손흥민 윙·박주호 풀백</td></tr>
                <tr><td style={cell}>2022 카타르 월드컵</td><td style={cell}><strong>4-2-3-1 / 4-4-2</strong></td><td style={cell}>벤투 — 빌드업 강화, 황희찬·이강인·조규성</td></tr>
                <tr><td style={cell}>2024~현재</td><td style={cell}><strong>4-2-3-1 / 4-1-4-1</strong></td><td style={cell}>대표팀 표준. 김민재·이강인·손흥민·황희찬</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 포메이션 선택 가이드 */}
        <section>
          <h2 style={sectionTitle}>🎯 우리 팀 포메이션 선택 가이드</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            동호회·청소년 팀이 포메이션을 고를 때 고려할 핵심 3가지:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { title: '1. 선수 풀 강점 분석', desc: '빠른 윙어가 많다 → 4-3-3 / 강한 중앙 미드 → 4-2-3-1 / 단단한 수비 + 카운터 → 5-3-2' },
              { title: '2. 경기장 크기', desc: '7인제·풋살은 공간 좁아 1-2-1 다이아·2-3-1이 유리. 11인제 정규 규격은 4-3-3·4-2-3-1' },
              { title: '3. 상대 강도', desc: '약체 상대 → 공격적(4-3-3·3-4-3) / 강팀 상대 → 수비적(5-4-1·4-5-1)' },
              { title: '4. 체력 수준', desc: '풀백 공격 가담은 체력 소모 큼. 동호회는 4-4-2·4-2-3-1 권장 / 청소년은 3-3-2(KFA U-12 표준)' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{b.title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 등번호 규칙 */}
        <section>
          <h2 style={sectionTitle}>🔢 축구 등번호의 전통적 의미</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            등번호는 단순한 식별 번호를 넘어 <strong style={{ color: 'var(--text)' }}>포지션의 상징</strong>으로 자리잡았습니다.
            본 도구는 등번호를 자유 입력으로 두지만, 전통 의미를 참고하면 팀 분위기가 살아납니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>번호</th>
                  <th style={headCell}>전통 포지션</th>
                  <th style={headCell}>대표 선수</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>1</strong></td><td style={cell}>골키퍼 (필수)</td><td style={cell}>김승규·노이어·부폰</td></tr>
                <tr><td style={cell}><strong>2~5</strong></td><td style={cell}>수비수 (2 RB, 3 LB, 4·5 CB)</td><td style={cell}>4번 = 캡틴·리베로 상징</td></tr>
                <tr><td style={cell}><strong>6</strong></td><td style={cell}>수비형 미드 / 리베로</td><td style={cell}>로드리·페르난도 토레스</td></tr>
                <tr><td style={cell}><strong>7</strong></td><td style={cell}>우측 윙 / 에이스</td><td style={cell}>호날두·베컴·박지성</td></tr>
                <tr><td style={cell}><strong>8</strong></td><td style={cell}>중앙 미드 (박투박)</td><td style={cell}>제라드·이니에스타·손흥민(토트넘)</td></tr>
                <tr><td style={cell}><strong>9</strong></td><td style={cell}>중앙 공격수 (스트라이커)</td><td style={cell}>홀란드·음바페·황의조</td></tr>
                <tr><td style={cell}><strong>10</strong></td><td style={cell}>플레이메이커·팀 에이스</td><td style={cell}>메시·펠레·마라도나·이강인</td></tr>
                <tr><td style={cell}><strong>11</strong></td><td style={cell}>좌측 윙·세컨드 스트라이커</td><td style={cell}>살라·비니시우스·손흥민(대표팀)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. 라인업 작성 팁 */}
        <section>
          <h2 style={sectionTitle}>💡 라인업 작성 실전 팁</h2>
          <div style={card}>
            <ul style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.95, paddingLeft: 20, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>주전 11명 + 후보 5~7명</strong>: 동호회 출전 인원이 들쭉날쭉할 때 옵션 확보 필수</li>
              <li><strong style={{ color: 'var(--text)' }}>측면 좌우 균형</strong>: 왼발잡이/오른발잡이를 좌우에 맞게 배치. 잘못 배치하면 크로스·드리블 효율 ↓</li>
              <li><strong style={{ color: 'var(--text)' }}>골키퍼는 가장 일찍 확정</strong>: GK 자원이 적어 교체 어려움. 첫 멤버 모집부터 우선</li>
              <li><strong style={{ color: 'var(--text)' }}>친선전·연습은 다양한 포메이션</strong>: 같은 포메이션만 고집 X. 4-3-3 ↔ 3-5-2 등 시험해보면 강·약점 파악</li>
              <li><strong style={{ color: 'var(--text)' }}>중요 경기는 익숙한 포메이션</strong>: 토너먼트·결승 등은 평소 가장 손에 익은 시스템으로</li>
              <li><strong style={{ color: 'var(--text)' }}>전반·후반 분리 라인업</strong>: 체력 안배 위해 전반·후반 다른 포메이션 운영 가능 (PNG 두 장 다운로드)</li>
            </ul>
          </div>
        </section>

        {/* 9. FAQ */}
        <section>
          <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 포메이션 표기 「4-3-3」은 어떻게 읽나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>골키퍼 제외</strong>, 뒤(수비)부터 앞(공격) 순으로 라인별 인원을 적습니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>4-3-3 = 수비 4 + 미드 3 + 공격 3 (+ GK 1) = 11명</li>
                <li>4-2-3-1 = 수비 4 + 수비형 미드 2 + 공격형 미드 3 + 톱 1 (+ GK 1) = 11명</li>
                <li>3-4-3 = 스리백 3 + 미드 4 + 스리톱 3 (+ GK 1) = 11명</li>
              </ul>
              본 도구의 「커스텀」 입력에 동일한 형식으로 적으면 자동 그려집니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 5인제 풋살에서 가장 많이 쓰는 포메이션은?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>1-2-1 다이아몬드</strong>가 가장 흔합니다.
              한 명씩 사방으로 자리 잡아 공·수 균형이 좋고, 피사도(고정수)·알라(측면) 역할이 명확합니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>1-2-1: 다이아 — 표준</li>
                <li>2-2: 박스 — 점유·짧은 패스</li>
                <li>3-1: 피라미드 — 압박</li>
                <li>1-3: 역피라미드 — 공격적</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 등번호·이름은 어떻게 입력하나요?</summary>
            <div style={faqAnswer}>
              그라운드 위 <strong style={{ color: 'var(--text)' }}>선수 원 카드를 클릭</strong>하면 등번호·이름 편집 모달이 뜹니다.
              하단의 「📋 선수 명단」 행을 클릭해도 같은 편집창이 열립니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>등번호 미입력 시 자동으로 <strong>1(GK)·2·3·…·11</strong> 번호로 표시</li>
                <li>이름은 6자 초과 시 자동 ellipsis (… 표시)</li>
                <li>모든 변경은 자동 저장 — 새로고침해도 유지</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. PNG로 저장한 이미지를 단톡에 어떻게 보내나요?</summary>
            <div style={faqAnswer}>
              <strong>「🖼️ PNG 다운로드」</strong>를 누르면 1600 × 2000 고해상도 이미지가 다운로드됩니다.
              파일명은 <code>팀이름-4-3-3.png</code> 형태. 카카오톡·디스코드·인스타·블로그에 그대로 첨부 가능.
              모바일에서는 다운로드 후 갤러리에서 공유 메뉴로 보낼 수 있습니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 한국축구협회(KFA) 9인제 규정에 맞나요?</summary>
            <div style={faqAnswer}>
              KFA U-12 9인제 표준 권장은 <strong style={{ color: 'var(--text)' }}>3-3-2</strong>입니다 (수비 3 + 미드 3 + 공격 2 + GK).
              본 도구의 9인 프리셋은 KFA 표준 + 변형 5종을 제공합니다.
              경기장 규격(68×47m)·경기 시간(25분 × 2)·교체는 본 도구 외 각 협회 공식 규정을 따르세요.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 데이터는 어디 저장되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#059669' }}>본인 브라우저(localStorage)에만 저장</strong>됩니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>✅ youtil 서버 전송 X · 다른 사람이 볼 수 없음</li>
                <li>✅ 다음 방문 시 자동 복원 (명단·포메이션·등번호·팀 색상)</li>
                <li>⚠️ 시크릿 모드·다른 기기는 자동 동기화 X — 백업 원하면 PNG 다운로드</li>
              </ul>
            </div>
          </details>
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/life/random" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎲</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>랜덤 추첨기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>팀 나누기·발표 순서</div>
            </Link>
            <Link href="/tools/sports/football-points" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏆</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>리그 승점 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>리그·토너먼트 운영</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체력 훈련 페이스</div>
            </Link>
            <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 트레이닝</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>축구 체력 훈련</div>
            </Link>
            <Link href="/tools/sports/baseball-stats" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚾</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>야구 기록 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>스포츠 종합</div>
            </Link>
            <Link href="/tools/life/dutch" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍻</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>더치페이 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>모임 회식비 정산</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
