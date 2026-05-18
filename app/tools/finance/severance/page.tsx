import Link from 'next/link'
import SeveranceClient from './SeveranceClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/severance',
  title: '퇴직금 실수령액 계산기 — 평균/통상 자동 + 퇴직소득세(2023 개정) + 시뮬',
  description: '입사·퇴사일과 3개월 급여로 퇴직금·퇴직소득세·실수령 자동. 2023 개정 반영 + DB/DC/IRP 4모드와 퇴사일 시뮬레이션.',
  keywords: ['퇴직금 계산기', '퇴직금 실수령액', '평균임금 통상임금', '퇴직소득세', '근속연수공제', '환산급여공제', '퇴사일 시뮬', 'DB DC IRP', '퇴직연금', '근로기준법'],
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

export default function SeverancePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💼 퇴직금 실수령액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        입사·퇴사일과 3개월 급여로 <strong style={{ color: 'var(--text)' }}>퇴직금·퇴직소득세·실수령</strong> 자동. DB/DC/IRP 4모드.
      </p>

      <SeveranceClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>입사일·퇴사일 입력</strong> — 자동으로 재직일수·산정기간 계산</li>
          <li><strong>월별 임금 입력</strong> — 퇴사 전 3개월 기본급+고정수당 (자동으로 3구간 분할)</li>
          <li><strong>상여금·연차수당</strong> — 평균임금에 ×3/12 자동 반영</li>
          <li><strong>결과 확인</strong> — 세전 퇴직금 / 퇴직소득세 / 실수령 + 시각화</li>
          <li><strong>탭 전환</strong>으로 평균 vs 통상 비교, 퇴사일 시뮬, 총 입금액 분석</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>퇴사일 시뮬 탭</strong>에서 ±90일 슬라이더로 퇴직금 변화를 그래프로 확인할 수 있어요.
          1년·2년·3년 마일스톤이 자동 표시되어 가장 유리한 퇴사일을 정할 수 있습니다.
        </p>
      </div>

      {/* 2. 퇴직금 공식 */}
      <h2 style={sectionTitle}>📐 퇴직금 계산 공식</h2>
      <div style={card}>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 0 }}>
          <p style={{ fontSize: 14, color: 'var(--accent)', margin: 0, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, lineHeight: 2 }}>
            법정 퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>1일 평균임금</strong> = 퇴사 전 3개월 임금 총액 / 총일수 (89~92일)</li>
          <li><strong style={{ color: 'var(--text)' }}>임금 총액</strong> = 기본급 + 고정수당 + (상여금 × 3/12) + (연차수당 × 3/12)</li>
          <li><strong style={{ color: 'var(--text)' }}>적용 임금</strong> = max(평균임금, 통상임금) — 근로자에게 유리한 큰 금액</li>
          <li><strong style={{ color: 'var(--text)' }}>발생 요건</strong> = 계속근로 1년 이상 + 주 15시간 이상 (근로자퇴직급여보장법 §4)</li>
        </ul>
      </div>

      {/* 3. 평균 vs 통상 */}
      <h2 style={sectionTitle}>⚖️ 평균임금 vs 통상임금 — 둘 중 큰 것 적용</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          근로기준법 §2 ②: <strong style={{ color: 'var(--accent)' }}>평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 함.</strong>
          → 근로자에게 항상 유리한 큰 금액을 적용.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, marginTop: 12 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #3EC8FF', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, margin: '0 0 4px' }}>📊 평균임금</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              3개월 임금 총액 ÷ 3개월 총일수<br />
              <strong>포함</strong>: 기본급·고정수당·상여금×3/12·연차수당×3/12<br />
              <strong>특징</strong>: 변동 임금 모두 반영해 더 큰 경향
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #FFB83E', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#FFB83E', fontWeight: 700, margin: '0 0 4px' }}>⏱️ 통상임금</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              월 통상임금 / 209시간 × 1일 소정시간<br />
              <strong>포함</strong>: 기본급·고정수당만 (변동성 X)<br />
              <strong>특징</strong>: 상여금·연차수당 X — 작아 보이지만 안정적
            </p>
          </div>
        </div>
      </div>

      {/* 4. 퇴직소득세 */}
      <h2 style={sectionTitle}>💸 퇴직소득세 — 환산급여·근속연수공제 (2023 개정)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          퇴직소득세는 일반 근로소득세보다 <strong>훨씬 적은 세율</strong>이 적용됩니다.
          근속연수가 길수록 공제가 커지고, 환산급여로 누진세율을 분산해 부담을 줄여요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 2 }}>
            ① 환산급여 = (퇴직금 − 근속연수공제) × 12 / 근속연수<br />
            ② 과세표준 = 환산급여 − 환산급여공제<br />
            ③ 산출세액 = 과세표준 × 누진세율 (6~45%)<br />
            ④ <strong style={{ color: 'var(--accent)' }}>퇴직소득세 = 산출세액 × 근속연수 / 12</strong><br />
            ⑤ 지방소득세 = 퇴직소득세 × 10%
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>근속연수공제 (2023 확대)</strong>: 5년 이하 100만/년, 5~10년 200만/년, 10~20년 250만/년, 20년+ 300만/년</li>
          <li><strong style={{ color: 'var(--text)' }}>환산급여공제</strong>: 800만 이하 100% / 1억 이하 60% / 3억 이하 45~55% / 그 이상 35%</li>
          <li><strong style={{ color: 'var(--text)' }}>지방소득세</strong>: 퇴직소득세의 10% 자동 가산</li>
          <li>근속연수 1년 미만은 <strong>1년으로 절상</strong>해 세액 계산 (소득세법 §49)</li>
        </ul>
      </div>

      {/* 5. DB·DC·IRP */}
      <h2 style={sectionTitle}>🏦 DB · DC · IRP — 퇴직연금 3 종류</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '💼 일반 퇴직금', d: '근로기준법 기준 법정 퇴직금. 회사가 직접 지급. 14일 내 의무.', c: '#3EFFD0' },
            { t: '🏦 DB형 퇴직연금', d: '확정급여형 — 평균임금 × 30 × 근속/365 (일반과 동일 계산). 회사가 적립·운용.', c: '#3EC8FF' },
            { t: '📊 DC형 퇴직연금', d: '확정기여형 — 회사가 매년 임금총액의 1/12 이상 적립, 근로자 운용. 결과 변동.', c: '#FFB83E' },
            { t: '🏛️ IRP', d: '5,500만원 초과 퇴직금은 의무 이전. 연금 수령 시 절세 효과.', c: '#FF8C3E' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⚠️ <strong style={{ color: '#FF3E8C' }}>DC형은 별도 계산 필요</strong> — 운용 결과에 따라 법정 퇴직금과 다를 수 있음.
          정확한 금액은 회사 인사팀·금융사 IRP 계좌에서 확인하세요.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 퇴직금은 누구나 받을 수 있나요?</summary>
        <p style={faqAnswer}>
          <strong>두 가지 조건</strong> 모두 충족해야 법정 퇴직금이 발생합니다:<br />
          1. <strong>계속근로기간 1년 이상</strong> (수습·시용 기간 포함)<br />
          2. <strong>4주 평균 1주 소정근로시간 15시간 이상</strong><br />
          1년 미만이거나 주 15시간 미만이면 법정 퇴직금 의무 X (회사가 자율적으로 지급할 수는 있음).
          정규직·계약직·파트타임 모두 위 조건만 충족하면 동일하게 적용됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 평균임금과 통상임금 차이는?</summary>
        <p style={faqAnswer}>
          • <strong>평균임금</strong>: 퇴사 전 3개월 임금 총액 / 총일수. 상여금·연차수당까지 포함해 일반적으로 더 큼.<br />
          • <strong>통상임금</strong>: 정기·일률·고정 지급분. 기본급+고정수당만 (상여금 X).<br />
          근로기준법 §2 ②: <strong>평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 봄</strong> — 근로자에게 유리한 큰 금액 적용.
          본 도구는 두 임금을 자동 계산해 큰 쪽을 적용합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 상여금·연차수당이 평균임금에 포함되나요?</summary>
        <p style={faqAnswer}>
          네, 다음 비율로 평균임금에 포함됩니다:<br />
          • <strong>최근 1년 상여금 총액 × 3/12</strong> = 3개월분 상당<br />
          • <strong>미사용 연차수당 × 3/12</strong> = 3개월분 상당<br />
          예: 상여금 1년 600만원 → 평균임금 산정 시 150만원 가산 / 연차수당 100만원 → 25만원 가산.
          단 <strong>일시적·우발적 수당</strong>(특별보너스·상여금 외 명목)은 제외될 수 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 1일 통상임금 계산은 왜 209시간으로 나누나요?</summary>
        <p style={faqAnswer}>
          <strong>월 평균 근무시간 = 209시간</strong>이라는 한국 노동법상 표준 때문입니다.<br />
          • 주 40시간 + 주휴 8시간 = <strong>주 48시간</strong><br />
          • 월 4.345주 × 48시간 ≈ <strong>209시간/월</strong><br />
          • 1일 통상임금 = 월 통상임금 / 209 × 1일 소정시간 (8시간이면 ÷ 209 × 8)<br />
          시급제·일급제는 다른 공식 적용. 정확한 시급·연봉 환산은{' '}
          <Link href="/tools/finance/salary" style={{ color: 'var(--accent)' }}>연봉 실수령액 계산기</Link> 참고.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 퇴직소득세가 일반 소득세보다 적은 이유?</summary>
        <p style={faqAnswer}>
          <strong>여러 해 누적된 소득을 한 번에 받기 때문에 누진세 부담을 덜어주는 특별 계산법</strong>이 적용됩니다.<br />
          • <strong>근속연수공제</strong>: 1년당 100~300만원 공제<br />
          • <strong>환산급여 ×12/N</strong>: 12배 환산 후 누진세율 적용 → 원금 ÷N 다시 분배<br />
          • <strong>환산급여공제</strong>: 추가 공제 (60~100% 구간)<br />
          예: 5년 근속 5,000만원 퇴직금 → 일반 소득세는 1,000만원+, 퇴직소득세는 약 100~200만원 수준 (5~10배 적음).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 1년 미만 근무하면 퇴직금이 0인가요?</summary>
        <p style={faqAnswer}>
          네, <strong>법정 퇴직금은 0</strong>입니다 (근로자퇴직급여보장법 §4).
          단:<br />
          • <strong>회사 자율 지급</strong>: 일부 회사는 1년 미만에도 자체 규정으로 지급<br />
          • <strong>중도 정산</strong>: 1년 직전에 무리하게 퇴사하면 퇴직금 0 위험<br />
          • <strong>퇴직금 분쟁</strong>: 365일이 며칠 부족하면 입사·퇴사일 정확 확인 + 노무사 상담<br />
          본 도구의 시뮬레이터 탭에서 1년 도달까지 며칠 남았는지 확인 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. DB와 DC 퇴직연금 차이는?</summary>
        <p style={faqAnswer}>
          • <strong>DB형 (확정급여형)</strong>: <strong>법정 퇴직금과 동일 계산</strong> (평균임금 × 30 × 근속/365). 회사가 적립·운용·결과 책임.
          → 안정적, 임금 인상 시 퇴직금 증가<br />
          • <strong>DC형 (확정기여형)</strong>: 회사가 매년 임금총액의 1/12 이상을 <strong>근로자 IRP 계좌에 적립</strong>. 근로자가 운용.
          → 운용 잘하면 더 많이 받지만 손실 위험도 본인 부담<br />
          최근 신규 입사자는 DC형이 일반적. 본인이 어떤 제도인지는 회사 인사팀에서 확인.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. IRP 의무이전 5,500만원 기준?</summary>
        <p style={faqAnswer}>
          퇴직급여 보장법 §17: <strong>퇴직금이 5,500만원을 초과하면 IRP(개인형 퇴직연금) 계좌로 의무 이전</strong>.<br />
          • IRP로 받으면 <strong>퇴직소득세 이연</strong> (수령 시 과세)<br />
          • 일시 인출 시 일반 퇴직소득세 즉시 부과<br />
          • <strong>연금 수령 시 30~40% 추가 절세</strong> (연금소득세 적용)<br />
          IRP 계좌는 미리 개설 (은행·증권사·보험사). 퇴사 전 인사팀에 IRP 정보 제출.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 퇴사일을 며칠 늦추면 얼마나 차이?</summary>
        <p style={faqAnswer}>
          매우 차이 큽니다. 특히 <strong>1년·2년·3년 마일스톤</strong> 직후가 가장 유리:<br />
          • <strong>5월 30일 (재직 729일) → 6월 1일 (731일)</strong>: 단 2일 차이 + 마일스톤 도달 시 퇴직금 약 2~5% 증가 가능<br />
          • <strong>1년 미달 → 1년 이상</strong>: 0원 → 약 1개월치 (월급의 1배 이상) 발생<br />
          • <strong>호봉·연차 인상 직전·직후</strong>: 평균임금 자체가 변해 퇴직금 영향<br />
          시뮬레이터 탭에서 ±90일 슬라이더로 정확히 비교하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 분쟁 시 어디에 상담하나요?</summary>
        <p style={faqAnswer}>
          • <strong>고용노동부 고객상담센터</strong>: ☎ <strong>1350</strong> (무료, 평일 9~18시)<br />
          • <strong>고용노동부 민원마당</strong>: minwon.moel.go.kr — 임금체불·퇴직금 미지급 신고<br />
          • <strong>공인노무사</strong>: 평균임금·통상임금 다툼, 분쟁 시 위임 (수임료 협의)<br />
          • <strong>법률구조공단</strong>: ☎ 132 — 무료 법률 상담<br />
          • 회사가 퇴직금을 <strong>14일 내</strong> 지급하지 않으면 미지급 + 연 20% 지연이자 발생 (근퇴법 §9).
        </p>
      </details>

      {/* finance 도구 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 금융 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/finance/salary" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💴</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>연봉 실수령액 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            4대보험·세금·시급
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💰</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 + 6 항아리 + 절세
          </p>
        </Link>
        <Link href="/tools/finance/4-insurance" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🏥</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>4대보험 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            국민연금·건강·고용·산재
          </p>
        </Link>
      </div>
    </div>
  )
}
