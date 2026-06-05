import Link from 'next/link'
import HousingScoreClient from './HousingScoreClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/housing-score',
  title: '청약 가점 계산기 — 84점 만점 자동 + 커트라인 비교·시뮬레이션',
  description:
    '주택 청약 가점제 84점(무주택 32 + 부양가족 35 + 통장 17) 자동 계산. 생년월일·결혼일로 무주택 기간 자동 산정 + 최근 평균 당첨 가점 비교 + 가점 향상 시뮬 + 5가지 특별공급 자격 가이드 + 위장전입 등 함정 가이드 (2026년 기준).',
  keywords: [
    '청약 가점 계산기', '청약 가점', '주택청약', '청약 점수',
    '무주택 기간', '부양가족 가점', '청약통장 가입기간',
    '신혼부부 특별공급', '생애최초 특공', '다자녀 특공', '노부모 부양',
    '청약 커트라인', '서울 청약', '청약 1순위', '청약 함정',
    '재당첨 제한', '1주택 처분서약',
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

const FAQ_LD = [
  { "q":"청약 가점은 어디서 공식 확인하나요?","a":"한국부동산원 청약홈(applyhome.co.kr)에서 본인 인증 후 공식 가점을 조회할 수 있습니다. 청약 신청 시 청약홈에서 자동 계산되며, 본 도구의 결과와 약간 다를 수 있습니다(특수 케이스). 청약 신청 직전 반드시 청약홈에서 재확인하세요." },
  { "q":"만 30세 이전에 결혼하면 가점이 얼마나 유리한가요?","a":"매우 유리합니다. 예: 만 27세 결혼 시 결혼일부터 무주택 기간 카운트 → 만 42세 시점에 15년 누적 = 무주택 32점 만점. 반면 미혼이라면 만 30세부터 카운트 → 만 45세에야 만점. 3년 차이 = 무주택 6점 차이로 인기 단지 당락을 가를 수 있습니다." },
  { "q":"1주택자도 청약 가능한가요?","a":"가능하지만 가점은 0점 (무주택 영역)입니다. 1주택 + 처분서약: 무주택자로 간주되어 가점 회복. 단 입주 전 매도 완료 필수. 1주택 + 미서약: 추첨제로만 청약 가능 (민영 분양 한정). 다주택: 가점제 X, 추첨제 우선순위도 후순위. 처분 미이행 시 분양 취소 + 10년 청약 제한이 따르므로 신중히 결정." },
  { "q":"부모님을 부양가족으로 인정받으려면?","a":"다음 4가지 모두 충족해야 합니다: 만 60세 이상 (모두 만 60세 이상이어야 인정) 3년 이상 동일 세대 등록 (주민등록상 동거) 본인이 세대주 + 부모가 세대원 부모도 무주택 (주택 소유 시 부양가족 X) 주의: 위장전입 적발 시 분양 취소 + 형사처벌. 실거주·생활비 지원 증빙 필수." },
  { "q":"가점이 부족한데 어떻게 해야 하나요?","a":"세 가지 전략을 병행하세요: 1순위: 특별공급 자격 확인 — 신혼부부·생애최초·다자녀 자격 있으면 가점 무관 또는 별도 가점제로 경쟁 2순위: 추첨제 단지 노리기 — 민영 분양 중 추첨제 비율이 큰 단지 (강남 등은 추첨제 비율 ↑) 3순위: 가점 누적 후 도전 — 통장 유지 + 무주택 유지로 5~10년 후 만점 도전 가점이 부족한 30대는 특별공급 + 추첨제 비중 큰 단지를 우선 검토하세요." },
  { "q":"청약통장은 언제 만들어야 하나요?","a":"지금 당장이 정답입니다. 가점은 가입기간만 보므로, 매달 2만 원이라도 자동이체로 일찍 만드는 게 유리. 월 10만 원: 1순위 납입 충족 + 연말정산 소득공제(무주택 세대주·총급여 7천만 원 이하, 연 납입 300만 원 한도의 40% 공제 — 2024년 상향). 월 25만 원: 소득공제 한도(연 300만 원)까지 채워 절세 극대화. 월 50만 원: 가능한 빨리 예치금 충족 → 큰 평수 청약 가능. 청약통장 가입 후 15년이면 17점 만점 — 결혼·자녀와 무관한 안정적 가점원." },
  { "q":"본 도구의 정확도는?","a":"일반적인 케이스 95% 정확하지만, 다음 특수 케이스는 청약홈 공식 조회를 권장: 이혼·재혼·사별 1주택 처분 후 무주택 전환 (처분 시점 산정) 해외 거주 기간이 있는 경우 군 복무로 인한 세대 분리 특수관계인 (장애인 직계존속 동거 등) 본 도구는 예상 가점과 전략 수립용으로 활용하시고, 청약 직전엔 청약홈 공식 조회 필수." }
]

export default function HousingScorePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏠 청약 가점 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        생년월일·결혼일·자녀 수만 입력하면 <strong style={{ color: 'var(--text)' }}>84점 만점 자동 계산</strong> + 최근 인기 단지 커트라인 비교 + 가점 향상 시뮬 + 5가지 특별공급 자격·조건 안내.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 주택청약 제도 기준" sources={[{"label":"청약홈","href":"https://www.applyhome.co.kr"},{"label":"국토교통부","href":"https://www.molit.go.kr"}]} />

      <HousingScoreClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 가점제 84점 구조 */}
        <section>
          <h2 style={sectionTitle}>청약 가점제 84점 구조 (2026 기준)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            「주택공급에 관한 규칙」 별표1 기준 — 가점제는 <strong style={{ color: 'var(--text)' }}>3개 영역의 합계 84점</strong>입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>영역</th>
                  <th style={headCell}>최대</th>
                  <th style={headCell}>비중</th>
                  <th style={headCell}>핵심</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong>🏠 무주택 기간</strong></td>
                  <td style={cell}><strong style={{ color: '#0891B2' }}>32점</strong></td>
                  <td style={cell}>38%</td>
                  <td style={cell}>만 30세 또는 결혼일부터. 1년당 +2점, 15년 만점</td>
                </tr>
                <tr>
                  <td style={cell}><strong>👨‍👩‍👧‍👦 부양가족</strong></td>
                  <td style={cell}><strong style={{ color: '#059669' }}>35점</strong></td>
                  <td style={cell}>42%</td>
                  <td style={cell}>본인 제외 0명 = 5점, 1명당 +5점, 6명 만점</td>
                </tr>
                <tr>
                  <td style={cell}><strong>💳 청약통장 가입기간</strong></td>
                  <td style={cell}><strong style={{ color: '#FFD93E' }}>17점</strong></td>
                  <td style={cell}>20%</td>
                  <td style={cell}>6개월 미만 1점, 1년부터 1년당 +1점, 15년 만점</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>가장 변수가 큰 영역</strong>은 부양가족(35점). 결혼·자녀 한 명이 가점에 미치는 영향이 가장 큽니다.
          </p>
        </section>

        {/* 2. 무주택 기간 상세 */}
        <section>
          <h2 style={sectionTitle}>🏠 무주택 기간 — 언제부터 카운트?</h2>
          <div style={{ ...card }}>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.95 }}>
              <li><strong style={{ color: 'var(--text)' }}>만 30세 이상 + 미혼</strong>: 만 30세 생일부터</li>
              <li><strong style={{ color: 'var(--text)' }}>30세 이전 결혼</strong>: 혼인 신고일부터 (가장 유리)</li>
              <li><strong style={{ color: 'var(--text)' }}>30세 이후 결혼·이혼</strong>: 만 30세 생일부터 (결혼일과 무관)</li>
              <li><strong style={{ color: 'var(--text)' }}>만 30세 미만 + 미혼</strong>: <strong style={{ color: '#DC2626' }}>0년 (불리)</strong></li>
              <li><strong style={{ color: 'var(--text)' }}>1주택 처분서약</strong>: 매도일 또는 처분 동의일부터 카운트 재시작</li>
            </ul>
          </div>
          <div style={{ ...card, padding: 0, overflow: 'hidden', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={headCell}>무주택 기간</th>
                  <th style={headCell}>점수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1년 미만', '2점'],
                  ['1년 이상 ~ 2년 미만', '4점'],
                  ['3년 이상 ~ 4년 미만', '8점'],
                  ['5년 이상 ~ 6년 미만', '12점'],
                  ['10년 이상 ~ 11년 미만', '22점'],
                  ['15년 이상', '32점 (만점)'],
                ].map(([k, v], i) => (
                  <tr key={i}>
                    <td style={cell}>{k}</td>
                    <td style={cell}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 부양가족 상세 */}
        <section>
          <h2 style={sectionTitle}>👨‍👩‍👧‍👦 부양가족 — 누구를 셀 수 있나?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '✅ 배우자', desc: '혼인 신고 후 동일 세대 등록' },
              { name: '✅ 자녀 (미성년)', desc: '만 19세 미만 — 전원 인정' },
              { name: '✅ 자녀 (성인 미혼)', desc: '만 30세 미만 미혼 + 동일 세대' },
              { name: '✅ 직계존속 (부모)', desc: '만 60세 이상 + 동일 세대 3년 이상' },
              { name: '✅ 조부모·외조부모', desc: '직계존속 포함 — 만 60세↑ + 동거 3년↑' },
              { name: '❌ 형제·자매', desc: '방계 — 부양가족 X (절대 인정 X)' },
              { name: '❌ 만 30세 이상 자녀', desc: '미혼이어도 분리 — 부양가족 X' },
              { name: '❌ 기혼 자녀', desc: '나이 무관 — 분리 세대' },
            ].map((b, i) => {
              const ok = b.name.startsWith('✅')
              return (
                <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${ok ? '#05966944' : '#DC262644'}`, borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 13, color: ok ? '#059669' : '#DC2626', fontWeight: 700, margin: '0 0 4px' }}>{b.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              )
            })}
          </div>
          <div style={{ ...card, padding: 0, overflow: 'hidden', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>부양가족 수 (본인 제외)</th>
                  <th style={headCell}>점수</th>
                </tr>
              </thead>
              <tbody>
                {[['0명 (단독세대주)', '5점'], ['1명', '10점'], ['2명', '15점'], ['3명', '20점'], ['4명', '25점'], ['5명', '30점'], ['6명 이상', '35점 (만점)']].map(([k, v], i) => (
                  <tr key={i}><td style={cell}>{k}</td><td style={cell}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 청약통장 */}
        <section>
          <h2 style={sectionTitle}>💳 청약통장 — 가입기간 vs 1순위 조건</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            가점은 <strong style={{ color: 'var(--text)' }}>가입기간</strong>만 봅니다 (납입 횟수와 무관).
            그러나 <strong style={{ color: 'var(--text)' }}>청약 1순위 자격</strong>은 가입기간 + 납입 횟수가 모두 충족돼야 합니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>구분</th>
                  <th style={headCell}>가점 기준</th>
                  <th style={headCell}>1순위 조건</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong>가입 기간</strong></td>
                  <td style={cell}>6개월 미만 1점 / 1년 미만 2점 / 1년부터 1년당 +1점 / 15년 17점</td>
                  <td style={cell}>수도권 12개월 / 비수도권 6개월</td>
                </tr>
                <tr>
                  <td style={cell}><strong>납입 횟수</strong></td>
                  <td style={cell}>가점 X (점수 영향 없음)</td>
                  <td style={cell}>수도권 24회 / 비수도권 12회</td>
                </tr>
                <tr>
                  <td style={cell}><strong>예치금</strong></td>
                  <td style={cell}>가점 X</td>
                  <td style={cell}>지역·면적별 예치금 충족 (서울 85㎡ 300만 원 등)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            💡 한 달에 <strong style={{ color: 'var(--text)' }}>2만~50만 원</strong> 자유 납입 가능. 매월 10만 원 추천 (1순위 + 절세 + 예치금 빠른 충족).
          </p>
        </section>

        {/* 5. 최근 평균 당첨 가점 */}
        <section>
          <h2 style={sectionTitle}>최근 지역별 평균 당첨 가점</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>지역</th>
                  <th style={headCell}>평균 당첨</th>
                  <th style={headCell}>최저 당첨</th>
                  <th style={headCell}>대표 단지</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🏙️ 서울 강남·서초·송파',     '72점', '67점', '래미안·디에이치·아크로'],
                  ['🏙️ 서울 마포·성동·용산',     '67점', '60점', '한강뷰·도심접근'],
                  ['🏙️ 서울 일반구',              '60점', '54점', '동작·관악·구로·노원'],
                  ['🏘️ 수도권 인기',              '58점', '50점', '판교·과천·분당·동탄2'],
                  ['🏘️ 수도권 일반',              '48점', '40점', '용인·시흥·평택·의정부'],
                  ['🏞️ 지방 광역시 인기',         '50점', '42점', '부산 해운대·대구 수성'],
                  ['🏞️ 지방 광역시 일반',         '40점', '32점', '광주·울산·인천 일반구'],
                  ['🌾 지방 중소도시',             '32점', '22점', '특별공급 우선 검토'],
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={cell}>{row[0]}</td>
                    <td style={cell}><strong style={{ color: 'var(--accent)' }}>{row[1]}</strong></td>
                    <td style={cell}>{row[2]}</td>
                    <td style={cell}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 2023~2025 KAB·HUG 분양 통계 평균. 단지·평형·시기별 편차 큼 (±5~10점). <strong style={{ color: 'var(--text)' }}>최신 단지별 정확 가점</strong>은 한국부동산원 청약홈에서 분양 직후 발표하는 공식 통계 확인.
          </p>
        </section>

        {/* 6. 특별공급 5종 비교 */}
        <section>
          <h2 style={sectionTitle}>✨ 특별공급 5종 — 가점 부족 시 차선책</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            가점이 부족해도 특별공급 자격이 있다면 당첨 확률이 크게 올라갑니다. 본 도구의 「특별공급 자격 가이드」에서 조건 확인.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th style={headCell}>유형</th>
                    <th style={headCell}>공급 비율</th>
                    <th style={headCell}>핵심 자격</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>💑 신혼부부</strong></td>
                    <td style={cell}>민영 20% / 공공 30%</td>
                    <td style={cell}>혼인 7년 이내, 무주택, 소득 130% (맞벌이 140%)</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>🆕 생애최초</strong></td>
                    <td style={cell}>민영 7% / 공공 25%</td>
                    <td style={cell}>평생 무주택, 5년 이상 통장, 근로소득세 5년 납부</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>👨‍👩‍👧‍👦 다자녀</strong></td>
                    <td style={cell}>민영 10% / 공공 10%</td>
                    <td style={cell}>미성년 자녀 3명 이상 (일부 2자녀 인정), 소득 120%</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>👴 노부모부양</strong></td>
                    <td style={cell}>민영 3% / 공공 5%</td>
                    <td style={cell}>만 65세 이상 직계존속 3년 동거</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>🏛️ 기관추천</strong></td>
                    <td style={cell}>민영 10% / 공공 15%</td>
                    <td style={cell}>국가유공자·장애인·장기복무군인·중기 종사자 등</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 청약 가점은 어디서 공식 확인하나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>한국부동산원 청약홈(applyhome.co.kr)</strong>에서 본인 인증 후 공식 가점을 조회할 수 있습니다.
              청약 신청 시 청약홈에서 자동 계산되며, 본 도구의 결과와 약간 다를 수 있습니다(특수 케이스).
              청약 신청 직전 반드시 청약홈에서 재확인하세요.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 만 30세 이전에 결혼하면 가점이 얼마나 유리한가요?</summary>
            <div style={faqAnswer}>
              매우 유리합니다. 예: 만 27세 결혼 시 결혼일부터 무주택 기간 카운트 → 만 42세 시점에 15년 누적 = <strong style={{ color: 'var(--accent)' }}>무주택 32점 만점</strong>.
              반면 미혼이라면 만 30세부터 카운트 → 만 45세에야 만점.
              <strong>3년 차이 = 무주택 6점 차이</strong>로 인기 단지 당락을 가를 수 있습니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 1주택자도 청약 가능한가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>가능하지만 가점은 0점 (무주택 영역)</strong>입니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>1주택 + 처분서약</strong>: 무주택자로 간주되어 가점 회복. 단 입주 전 매도 완료 필수.</li>
                <li><strong>1주택 + 미서약</strong>: 추첨제로만 청약 가능 (민영 분양 한정).</li>
                <li><strong>다주택</strong>: 가점제 X, 추첨제 우선순위도 후순위.</li>
              </ul>
              처분 미이행 시 분양 취소 + 10년 청약 제한이 따르므로 신중히 결정.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 부모님을 부양가족으로 인정받으려면?</summary>
            <div style={faqAnswer}>
              다음 4가지 모두 충족해야 합니다:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>만 60세 이상</strong> (모두 만 60세 이상이어야 인정)</li>
                <li><strong>3년 이상 동일 세대</strong> 등록 (주민등록상 동거)</li>
                <li><strong>본인이 세대주</strong> + 부모가 세대원</li>
                <li><strong>부모도 무주택</strong> (주택 소유 시 부양가족 X)</li>
              </ul>
              <strong style={{ color: '#DC2626' }}>주의</strong>: 위장전입 적발 시 분양 취소 + 형사처벌. 실거주·생활비 지원 증빙 필수.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 가점이 부족한데 어떻게 해야 하나요?</summary>
            <div style={faqAnswer}>
              세 가지 전략을 병행하세요:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text)' }}>1순위: 특별공급 자격 확인</strong> — 신혼부부·생애최초·다자녀 자격 있으면 가점 무관 또는 별도 가점제로 경쟁</li>
                <li><strong style={{ color: 'var(--text)' }}>2순위: 추첨제 단지 노리기</strong> — 민영 분양 중 추첨제 비율이 큰 단지 (강남 등은 추첨제 비율 ↑)</li>
                <li><strong style={{ color: 'var(--text)' }}>3순위: 가점 누적 후 도전</strong> — 통장 유지 + 무주택 유지로 5~10년 후 만점 도전</li>
              </ul>
              가점이 부족한 30대는 특별공급 + 추첨제 비중 큰 단지를 우선 검토하세요.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 청약통장은 언제 만들어야 하나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>지금 당장</strong>이 정답입니다.
              가점은 가입기간만 보므로, 매달 2만 원이라도 자동이체로 일찍 만드는 게 유리.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>월 10만 원: 1순위 납입 충족 + 연말정산 소득공제 (무주택 세대주·총급여 7천만 원 이하 — 연 납입 300만 원 한도의 40% 공제, 2024년 상향)</li>
                <li>월 25만 원: 소득공제 한도(연 300만 원)까지 채워 절세 극대화</li>
                <li>월 50만 원: 가능한 빨리 예치금 충족 → 큰 평수 청약 가능</li>
              </ul>
              청약통장 가입 후 15년이면 <strong>17점 만점</strong> — 결혼·자녀와 무관한 안정적 가점원.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q7. 본 도구의 정확도는?</summary>
            <div style={faqAnswer}>
              일반적인 케이스 95% 정확하지만, 다음 특수 케이스는 청약홈 공식 조회를 권장:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>이혼·재혼·사별</li>
                <li>1주택 처분 후 무주택 전환 (처분 시점 산정)</li>
                <li>해외 거주 기간이 있는 경우</li>
                <li>군 복무로 인한 세대 분리</li>
                <li>특수관계인 (장애인 직계존속 동거 등)</li>
              </ul>
              본 도구는 <strong>예상 가점과 전략 수립용</strong>으로 활용하시고, 청약 직전엔 청약홈 공식 조회 필수.
            </div>
          </details>
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/finance/rent-jeonse" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏠</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월세·전세 비교</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>분양 대기 중 거주 옵션</div>
            </Link>
            <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>당첨 후 잔금·중도금 대출</div>
            </Link>
            <Link href="/tools/finance/real-estate" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏘️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>부동산 수익률</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>분양가 투자 가치 평가</div>
            </Link>
            <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>청약 자금 모으기</div>
            </Link>
            <Link href="/tools/finance/savings" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월 저축 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>청약저축·ISA·연금</div>
            </Link>
            <Link href="/tools/finance/ipo-deposit" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💵</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>공모주 증거금</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>주식 청약 분야</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
