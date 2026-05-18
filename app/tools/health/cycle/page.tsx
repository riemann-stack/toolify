import Link from 'next/link'
import CycleClient from './CycleClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/health/cycle',
  title: '생리주기·배란일 계산기 — 다음 생리·가임기·PMS 시각화·컨디션 가이드',
  description: '마지막 생리일·평균 주기 → 다음 생리·배란·가임기·PMS를 원형·월간 캘린더로 시각화 + 4단계 phase별 컨디션 가이드.',
  keywords: ['생리주기 계산기', '배란일 계산기', '가임기 계산기', 'PMS 계산기', '생리예정일 계산기', '월경주기 계산기', '난포기 황체기', '생리주기 캘린더', '여성 주기 트래킹', 'menstrual cycle calculator'],
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
  marginBottom: '14px',
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

export default function CyclePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌙 생리주기·배란일 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        마지막 생리일과 평균 주기로 다음 생리·배란·가임기를 <strong style={{ color: 'var(--text)' }}>원형 시각화</strong> + phase별 컨디션.
      </p>

      <CycleClient />

      {/* 1. 4 phase 가이드 */}
      <h2 style={sectionTitle}>🌙 4단계 phase 가이드 (생리주기 변화)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        평균 28일 주기 기준 — 4단계로 컨디션·호르몬·체감이 자연스럽게 순환합니다 (개인차 큼).
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>Phase</th>
              <th style={headCell}>일자 (28일 기준)</th>
              <th style={headCell}>일반 특징</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong style={{ color: '#FF8C8C' }}>🩸 생리기</strong></td>
              <td style={cell}>1~5일</td>
              <td style={cell}>몸 회복 집중 · 컨디션 ↓ · 가벼운 운동·휴식 우선</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FFD93E' }}>🌱 난포기</strong></td>
              <td style={cell}>6~13일</td>
              <td style={cell}>에너지·집중력 ↑ · 새 운동 루틴 시작에 적합</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>🥚 배란기</strong></td>
              <td style={cell}>13~15일</td>
              <td style={cell}>체온 0.3~0.5°C ↑ · 분비물 변화 · 일부 중간통</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#B885DA' }}>🌙 황체기</strong></td>
              <td style={cell}>16~28일</td>
              <td style={cell}>후반부 PMS 가능 · 붓기·식욕·기분 변동 · 강도 조절</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구는 사용자 주기에 맞게 4 phase 자동 보정. 컨디션 가이드 탭에서 본인 라이프스타일별 강조.
      </p>

      {/* 2. 평균 주기 28일 ≠ 모두 */}
      <h2 style={sectionTitle}>📐 평균 주기 28일 ≠ 모두 — 21~45일 정상 범위</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          교과서에서 흔히 말하는 &ldquo;28일 주기&rdquo;는 <strong style={{ color: 'var(--accent)' }}>평균값</strong>일 뿐입니다.
          실제로는 <strong style={{ color: 'var(--text)' }}>21~45일 모두 정상 범위</strong>이며, 본인의 일정한 리듬이 있으면 OK.
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '12px', paddingLeft: '18px', marginBottom: 0 }}>
          <li>21일 미만: 너무 짧음 → 산부인과 상담</li>
          <li>21~45일: 정상 범위 (본인 평균 기억)</li>
          <li>45일 초과: 너무 김 → 산부인과 상담</li>
          <li>변동폭 ±8일+: 불규칙 → 산부인과 상담</li>
        </ul>
      </div>

      {/* 3. 가임기·배란일 추정 원리 */}
      <h2 style={sectionTitle}>🥚 가임기·배란일 추정 원리 (황체기 14일 모델)</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
          본 도구의 추정 모델 (사용자 주기 보정):
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>다음 생리</strong> = 마지막 생리일 + 평균 주기</li>
          <li><strong style={{ color: 'var(--text)' }}>배란일</strong> = 다음 생리일 - 14일 (황체기 길이가 가장 일정해서)</li>
          <li><strong style={{ color: 'var(--text)' }}>가임기</strong> = 배란일 -5일 ~ +1일 (정자 생존 ~5일 + 난자 24시간)</li>
          <li><strong style={{ color: 'var(--text)' }}>PMS 예상</strong> = 다음 생리 -7일 ~ -1일</li>
        </ul>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.7 }}>
          ⚠️ 이는 통계 평균 모델 — 실제 배란일은 ±2일 변동 가능. 스트레스·수면·체중·약물 등 영향. 정확한 배란 확인은 산부인과 초음파·LH 검사.
        </p>
      </div>

      {/* 4. PMS 일반 가이드 */}
      <h2 style={sectionTitle}>💆 PMS·생리전증후군 일반 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        PMS(Premenstrual Syndrome)는 생리 시작 1주~수일 전부터 나타나는 신체·정서 변화. 가임기 여성의 75% 정도가 경험.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { name: '신체 증상', color: '#FFB83E', items: '붓기·체중 일시 ↑·복부 팽만·유방 압통·두통·여드름·피로' },
          { name: '정서 증상', color: '#B885DA', items: '기분 변동·짜증·불안·우울·집중력 ↓·식욕 ↑·수면 변화' },
          { name: '일반 대처', color: '#3EFF9B', items: '카페인·염분 ↓·수분 ↑·규칙 운동·충분한 수면·일정 여유' },
          { name: '🚨 심한 PMS (PMDD)', color: '#FF6B6B', items: '일상에 심각한 영향 → 산부인과·정신건강의학과 상담 권장' },
        ].map((b, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px' }}>{b.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.items}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7 }}>
        ⚠️ 본 도구는 PMS 일반 안내만 — 정확한 진단·약물은 산부인과 영역. 보건복지부 여성건강 상담 <strong>1577-1366</strong>.
      </p>

      {/* 5. 산부인과 상담 신호 */}
      <h2 style={sectionTitle}>🏥 산부인과 상담 신호</h2>
      <div style={{ background: 'rgba(255, 107, 107, 0.06)', border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '12px', padding: '18px 22px' }}>
        <p style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 700, marginBottom: '10px' }}>다음 경우 산부인과 상담 권장</p>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
          <li>주기 변동폭 <strong>±8일 이상</strong> 지속 (PCOS·갑상선·스트레스 등)</li>
          <li><strong>부정출혈</strong> (생리 외 출혈, 관계 후 출혈)</li>
          <li><strong>과다 출혈</strong> (시간당 패드 변경)</li>
          <li>6개월+ <strong>무월경</strong> (임신 X 확인 후)</li>
          <li>심한 PMS·생리통 — 일상에 심각한 영향</li>
          <li>임신 계획·피임 결정</li>
          <li>21일 미만 / 45일 초과 주기</li>
        </ul>
        <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '14px', lineHeight: 1.7, marginBottom: 0 }}>
          📞 <strong>도움 받기</strong>: 보건복지부 여성·아동 상담 <strong style={{ color: '#FFB83E' }}>1577-1366</strong> · 청소년 상담 <strong style={{ color: '#FFB83E' }}>1388</strong> · 응급 <strong style={{ color: '#FFB83E' }}>119</strong>
        </p>
      </div>

      {/* 6. FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 평균 주기 28일이 아닌데 정상인가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>네, 21~45일 모두 정상 범위</strong>입니다. &ldquo;28일&rdquo;은 평균값일 뿐. 본인의 일정한 리듬(예: 항상 26일 또는 32일)이 있으면 정상.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>21일 미만 또는 45일 초과 → 산부인과 상담</li>
            <li>같은 사람이 매월 21~45일 사이로 들쭉날쭉 (변동폭 ±8일+) → 상담 권장</li>
          </ul>
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 가임기는 어떻게 계산하나요?</summary>
        <div style={faqAnswer}>
          본 도구의 모델: <strong style={{ color: 'var(--text)' }}>배란일 -5일 ~ +1일</strong>이 가임기.
          이유: 정자는 자궁 내에서 최대 5일 생존, 난자는 배란 후 약 24시간 수정 가능.
          배란일은 다음 생리 -14일 (황체기 길이가 가장 일정).
          <br /><br />
          ⚠️ 이는 통계 평균 — 실제 배란일은 ±2일 변동 가능. 정확한 진단은 산부인과 초음파·LH 검사.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 본 도구를 피임으로 써도 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#FF6B6B' }}>절대 비추천.</strong> 캘린더 기반 피임의 실패율은 <strong>약 24%</strong>(일반 사용 기준)로 매우 높습니다.
          배란일은 스트레스·수면·체중·여행 등으로 ±2일 이상 변동 가능. 본 도구는 <strong>참고 정보 제공</strong>만 합니다.
          <br /><br />
          피임 방법은 산부인과 상담 필수 (호르몬·기구·자연 등 다양한 옵션). 보건복지부 여성건강 상담 <strong>1577-1366</strong>.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 주기가 들쭉날쭉한데 어떻게 해야 하나요?</summary>
        <div style={faqAnswer}>
          본 도구의 <strong>주기 규칙성 → &ldquo;많이 불규칙&rdquo;</strong> 선택 시 안내가 표시됩니다.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>변동폭 ±3일 이내: 정상 (규칙적)</li>
            <li>±4~7일: 약간 불규칙 — 스트레스·체중 변화 점검</li>
            <li>±8일+: 불규칙 — <strong style={{ color: 'var(--text)' }}>산부인과 상담 권장</strong> (PCOS·갑상선·조기난소부전 등 가능성)</li>
          </ul>
          <strong>📋 내 기록 탭</strong>에서 매번 생리 시작일을 체크하면 본인 변동폭 자동 분석.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. PMS는 무엇이고 언제 산부인과 가야 하나요?</summary>
        <div style={faqAnswer}>
          PMS(생리전증후군) = 생리 1주~수일 전 나타나는 신체·정서 변화. 가임기 여성 약 75% 경험.
          <br /><br />
          일반 PMS: 붓기·기분 변동·식욕 ↑ → 본 도구의 컨디션 가이드 참고.
          <br /><br />
          <strong style={{ color: '#FF6B6B' }}>심한 PMS (PMDD)</strong>: 일상에 심각한 영향 (출근·관계 등) → 산부인과·정신건강의학과 상담 권장. 보건복지부 1577-1366.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 임신 테스트기는 언제 사용하면 정확한가요?</summary>
        <div style={faqAnswer}>
          일반 안내: <strong style={{ color: 'var(--text)' }}>생리 예정일 이후</strong>가 더 정확. 너무 이른 검사는 음성이라도 확정 X.
          <br /><br />
          본 도구의 <strong>👶 가임기 참고 탭</strong>에서 임신 준비 중 선택 시, 생리 예정일 기준 안내 표시.
          정확한 진단은 산부인과 HCG 검사·초음파.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 황체기에 체중이 늘어요. 살이 찐 건가요?</summary>
        <div style={faqAnswer}>
          황체기 후반(생리 직전)에는 호르몬 영향으로 <strong style={{ color: 'var(--text)' }}>1~3kg 일시 변동</strong>이 흔합니다.
          이는 수분 보유·소화 변화·식욕 증가 등 복합 요인 — <strong>지방 증가가 아닌 경우가 많음</strong>.
          <br /><br />
          정확한 체중 추세는 <strong style={{ color: 'var(--text)' }}>주간 평균</strong>으로 보세요. 다이어트 중이라면 황체기는 유지 모드, 난포기에 집중.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 본 도구의 데이터는 어디 저장되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#3EFF9B' }}>본인 브라우저(localStorage)에만 저장</strong>됩니다.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>✅ youtil 서버 전송 X · 외부 서비스 X</li>
            <li>✅ Google Analytics에 cycle 데이터 X (일반 페이지뷰만)</li>
            <li>✅ 익명 사용 (이름·이메일·전화 입력 X)</li>
            <li>✅ 한 번 클릭 전체 삭제 (페이지 상단 또는 데이터 관리)</li>
            <li>⚠️ 다른 기기·브라우저 자동 동기화 X — CSV 백업 권장</li>
            <li>⚠️ 시크릿 모드/브라우저 데이터 삭제 시 사라짐</li>
          </ul>
          민감 데이터인 만큼 <strong>본인 자유 + 책임</strong>으로 관리됩니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구와 임신 주수 계산기 차이는?</summary>
        <div style={faqAnswer}>
          영역이 다릅니다.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>🌙 <strong style={{ color: 'var(--text)' }}>본 도구 (생리주기·배란일)</strong>: <strong>임신 전</strong> 주기 트래킹·시각화·가임기 참고</li>
            <li>🤰 <Link href="/tools/health/pregnancy" style={{ color: 'var(--accent)' }}>임신 주수 계산기</Link>: <strong>임신 확인 후</strong> 주차·태아 발달·검사 일정·출산 준비</li>
          </ul>
          본 도구의 가임기 모드 → 임신 가능성 점검 → 임신 확인 시 임신 주수 계산기로 이동하는 동선.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 청소년인데 사용해도 되나요?</summary>
        <div style={faqAnswer}>
          본 도구는 일반 주기 트래킹 도구이므로 누구나 사용 가능. 단:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>초경 후 2~3년은 주기가 매우 불규칙한 게 정상</li>
            <li>심한 통증·과다 출혈 시 부모와 함께 산부인과</li>
            <li>임신·피임 관련 정보는 <strong style={{ color: 'var(--text)' }}>전문가 상담</strong>이 우선 (학교 보건교사·소아청소년과·산부인과)</li>
            <li>청소년 상담 1388 (24시간) · 보건복지부 1577-1366</li>
          </ul>
          본 도구는 의료 상담을 대체하지 않습니다.
        </div>
      </details>

      {/* 7. 면책 */}
      <h2 style={sectionTitle}>⚠️ 의료 면책</h2>
      <div style={{
        background: 'rgba(255, 184, 62, 0.06)',
        border: '1px solid rgba(255, 184, 62, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 참고 가이드</strong>입니다.</li>
          <li>본 도구는 <strong>피임 방법 X · 임신 확진 X · 의학 진단 X · 약물 추천 X · 영양 처방 X · 특정 브랜드 추천 X</strong>.</li>
          <li>주기·배란일·가임기는 통계 평균 모델 — 실제 ±2일 이상 변동 가능 (스트레스·수면·체중·약물).</li>
          <li>모든 데이터는 본인 브라우저(localStorage)에만 저장 — 서버 전송 X.</li>
          <li>도움 받기: 보건복지부 여성·아동 상담 <strong>1577-1366</strong> · 청소년 <strong>1388</strong> · 응급 <strong>119</strong>.</li>
        </ul>
      </div>

      {/* 8. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/health/pregnancy" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🤰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>임신 주수 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>임신 확인 후 주차·태아·검사</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>phase별 칼로리 일반 안내</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체중 적정성</div>
        </Link>
        <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>철분·B6 일반 안내</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>황체기 변동 이해</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>생리·검진 일정</div>
        </Link>
      </div>
    </div>
  )
}
