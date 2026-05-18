import Link from 'next/link'
import FormationClient from './FormationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/sports/formation',
  title: '축구 포메이션 생성기 — 4-3-3·4-4-2·5인제 풋살까지 라인업 시각화',
  description:
    '5·7·9·11인제 22+ 포메이션 + 커스텀(4-2-3-1 등) + 명단 칩 입력으로 그라운드 위에 시각화. PNG 다운로드와 마크다운 공유.',
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
        5·7·9·11인제 22+ 포메이션 + 명단 칩 입력으로 <strong style={{ color: 'var(--text)' }}>그라운드 위에 시각화</strong>. PNG 다운로드.
      </p>

      <FormationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <section>
          <h2 style={sectionTitle}>🛠️ 사용법 4단계</h2>
          <div style={card}>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>인원 수 선택</strong> — 11(정규)·9(청소년)·7(7인제)·5(풋살)</li>
              <li><strong>포메이션 선택</strong> — 프리셋 클릭 또는 「4-2-3-1」 식으로 커스텀 입력</li>
              <li><strong>명단 일괄 입력</strong> — 이름 칩으로 한 번에. 「등번호 자동」으로 1·2·3… 자동 채움</li>
              <li><strong>선수 카드 클릭</strong>으로 개별 편집, <strong>PNG 다운로드</strong>로 단톡·블로그 공유</li>
            </ol>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              💡 모든 입력은 자동 저장 — 새로고침해도 명단·포메이션·등번호·팀 색상이 유지됩니다.
            </p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { name: '4-4-2',   color: '#3EC8FF', tag: '클래식', desc: '균형의 정석. 측면 미드와 투톱이 명확. 알렉스 퍼거슨의 맨유 황금기' },
              { name: '4-3-3',   color: '#3EFF9B', tag: '현대 공격', desc: '윙어 활용 + 중원 3인. 펩의 바르샤·클롭의 리버풀' },
              { name: '4-2-3-1', color: '#FFD93E', tag: '현대 표준', desc: '더블 볼란치 + 톱2.5. 22 카타르 월드컵에서 가장 흔한 포메이션' },
              { name: '3-5-2',   color: '#FF8C3E', tag: '스리백', desc: '윙백 공격 가담 + 투톱. 안토니오 콘테 인터' },
              { name: '3-4-3',   color: '#B885DA', tag: '공격적 3백', desc: '윙백 + 스리톱. 콘테 첼시·과르디올라 시티 변형' },
              { name: '4-2-3-1', color: '#FF6B6B', tag: '5백 카운터', desc: '강팀 상대 잠그기 + 빠른 전환' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 800, color: f.color, margin: 0 }}>{f.name}</p>
                <p style={{ fontSize: 11, color: f.color, fontWeight: 700, margin: '2px 0 6px', opacity: 0.85 }}>{f.tag}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
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

        {/* 5. 활용 시나리오 */}
        <section>
          <h2 style={sectionTitle}>📌 활용 시나리오</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { icon: '🏆', name: '회사·동호회 축구', desc: '주말 모임 라인업 → 단톡 공유 (PNG 다운로드)' },
              { icon: '🎓', name: '학교·청소년 클럽', desc: '9인제·7인제 코치진 보드. KFA 표준 포메이션' },
              { icon: '🏟️', name: '풋살장 예약 팀', desc: '5인제 다이아·박스 포지션 사전 정리' },
              { icon: '📺', name: '경기 분석·블로그', desc: '관전평 작성 시 시각 자료로 활용' },
              { icon: '🎮', name: 'FIFA·이풋볼 전술', desc: '게임 전술 짤 때 시각화로 정리' },
              { icon: '🏫', name: '체육 수업·합반', desc: '팀 나누기 + 포지션 일괄 안내' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{b.icon} {b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
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
            <summary style={faqSummary}>Q3. 명단 11명을 빨리 입력하는 법은?</summary>
            <div style={faqAnswer}>
              칩 입력창에 <strong style={{ color: 'var(--text)' }}>「김민재, 손흥민, 이강인, ...」</strong>처럼 쉼표나 줄바꿈으로 구분해서 한 번에 붙여넣으면 자동 분리됩니다.
              그 다음 <strong>「등번호 자동」</strong>을 누르면 1번(GK)부터 차례로 채워집니다.
              포지션 무작위 배치를 원하면 <strong>「무작위 배치」</strong> 버튼.
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
              <strong style={{ color: '#3EFF9B' }}>본인 브라우저(localStorage)에만 저장</strong>됩니다.
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
