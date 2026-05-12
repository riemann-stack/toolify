import Link from 'next/link'
import IpoDepositClient from './IpoDepositClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/ipo-deposit',
  title: '공모주 청약 증거금 계산기 — 비례 OO주 받으려면 얼마? 균등·청약단위·5사6입 자동',
  description: '비례경쟁률·공모가·증거금률·청약단위 입력 → 필요 증거금 자동. 역산(증거금→예상 주수), 시나리오 표, 5사6입, 청약 한도 경고, 균등배정 추첨 안내, 환불금 계산, 청약 종목 메모(D-day)까지.',
  keywords: ['공모주 증거금 계산기', '비례경쟁률 계산', '공모주 1주 받으려면', '청약 증거금 역산', '5사6입', '균등배정 추첨', '청약단위', '공모주 환불금', '청약 한도', '한국 공모주', 'IPO 증거금'],
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

export default function IpoDepositPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💰 공모주 청약 증거금 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        비례 1주 받으려면 얼마? 1,000만 원 넣으면 몇 주? 비례·균등·청약단위·5사6입·한도까지 한 번에. 시나리오 표·청약 종목 메모(D-day)·환불금 자동 계산.
      </p>

      <IpoDepositClient />

      {/* 1. 비례·균등 구조 가이드 */}
      <h2 style={sectionTitle}>📊 비례·균등 배정 구조 가이드 (50:50)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        2021년 이후 한국 공모주는 일반 청약 물량의 50%는 균등·50%는 비례 배정 원칙. 각각 다른 메커니즘으로 작동합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>구분</th>
              <th style={headCell}>균등배정</th>
              <th style={headCell}>비례배정</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>대상</strong></td><td style={cell}>최소 청약 단위 충족자 모두</td><td style={cell}>증거금 비율</td></tr>
            <tr><td style={cell}><strong>배정 방식</strong></td><td style={cell}>인원수로 균등 분배 → 부족 시 추첨</td><td style={cell}>청약 주수 ÷ 경쟁률 (5사6입)</td></tr>
            <tr><td style={cell}><strong>큰 증거금 효과</strong></td><td style={cell}>X (최소만 넣어도 같음)</td><td style={cell}>O (많을수록 많이 받음)</td></tr>
            <tr><td style={cell}><strong>위험</strong></td><td style={cell}>인기 종목은 추첨 떨어져 0주</td><td style={cell}>경쟁률 급변 시 예상치 빗나감</td></tr>
            <tr><td style={cell}><strong>전략</strong></td><td style={cell}>인기 종목은 여러 증권사? → 중복 X</td><td style={cell}>한도 내 최대 + 마감 직전 경쟁률 확인</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구는 비례배정 중심 계산기. 균등은 입력값으로 합산 표시 (추첨 보장 X 명시).
      </p>

      {/* 2. 청약단위 표 */}
      <h2 style={sectionTitle}>📏 청약단위 구간별 표 (일반 패턴)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        한국 증권사 일반 패턴 — 종목·증권사별 다를 수 있음. 본 도구는 자동 추천하며 직접 입력도 가능.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>청약 주수 구간</th>
              <th style={headCell}>단위</th>
              <th style={headCell}>예시</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>10 ~ 100주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>10주</td><td style={cell}>10·20·30·...·100</td></tr>
            <tr><td style={cell}>100 ~ 500주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>50주</td><td style={cell}>100·150·...·500</td></tr>
            <tr><td style={cell}>500 ~ 1,000주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>100주</td><td style={cell}>500·600·...·1,000</td></tr>
            <tr><td style={cell}>1,000 ~ 5,000주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>500주</td><td style={cell}>1,000·1,500·...·5,000</td></tr>
            <tr><td style={cell}>5,000주 이상</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>1,000주</td><td style={cell}>5,000·6,000·...</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 정확한 단위는 종목별 증권신고서·증권사 청약 안내 확인. 본 도구의 자동 추천은 일반 패턴 기준.
      </p>

      {/* 3. 5사6입 룰 */}
      <h2 style={sectionTitle}>🔢 5사6입 룰 — 비례 배정 소수점 처리</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        비례배정 = <strong style={{ color: 'var(--text)' }}>청약 주수 ÷ 경쟁률</strong> 결과는 정수가 아닐 수 있습니다. 한국 회계 표준 5사6입(0.5 미만 버림, 0.5 이상 올림) 적용.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>이론 배정</th>
              <th style={headCell}>5사6입 결과</th>
              <th style={headCell}>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>0.4주</td><td style={{ ...cell, color: '#FF8C8C', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>0주</td><td style={cell}>0.5 미만 → 미배정 (1주 보장 추첨 옵션 별도)</td></tr>
            <tr><td style={cell}>0.5주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>1주</td><td style={cell}>0.5 이상 → 올림</td></tr>
            <tr><td style={cell}>0.9주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>1주</td><td style={cell}>올림</td></tr>
            <tr><td style={cell}>1.4주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>1주</td><td style={cell}>1.5 미만 → 1주</td></tr>
            <tr><td style={cell}>1.5주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>2주</td><td style={cell}>올림</td></tr>
            <tr><td style={cell}>2.6주</td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>3주</td><td style={cell}>올림</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 일부 종목은 <strong style={{ color: 'var(--text)' }}>1주 보장 추첨</strong> — 0.5 미만 신청자 중 추첨으로 1주 배정. 본 도구의 &ldquo;1주 보장&rdquo; 옵션 활용. 정확한 룰은 증권신고서 확인.
      </p>

      {/* 4. 청약 한도·중복청약 */}
      <h2 style={sectionTitle}>🚫 청약 한도·중복청약 금지 가이드</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid #FFB83E44', borderRadius: '12px', padding: '16px 18px' }}>
          <p style={{ fontSize: '13px', color: '#FFB83E', fontWeight: 700, marginBottom: '8px' }}>📏 청약 한도</p>
          <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
            <li>증권사·종목별 다름 (보통 5,000~50,000주)</li>
            <li>일반 청약 / 우대 / 직원 한도 별개</li>
            <li>한도 초과 시 자동 잘림 — 큰 증거금도 한도까지만 효과</li>
            <li>본 도구의 한도 입력으로 자동 경고</li>
          </ul>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid #FF6B6B44', borderRadius: '12px', padding: '16px 18px' }}>
          <p style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 700, marginBottom: '8px' }}>🚫 중복청약 금지 (2021년 이후)</p>
          <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
            <li>한 종목당 한 증권사만 가능</li>
            <li>위반 시 배정 취소 + 자금 묶임</li>
            <li>가족 명의 차용도 적발 시 위험 (상속·증여세 영역)</li>
            <li>주관·인수단 다수 증권사 → 자기 거래 증권사 중 1개 선택</li>
          </ul>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ⚠️ 본 도구는 일반 안내. 정확한 한도·규정은 증권사 청약 안내 확인.
      </p>

      {/* 5. 자금 묶임 일정 */}
      <h2 style={sectionTitle}>📅 자금 묶임 일정 (D~D+10 일반)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        한국 공모주 청약 일정 일반 흐름. 종목·증권사별 1~2일 차이 가능. 본 도구의 메모 탭에서 종목별 D-day 자동 계산.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>단계</th>
              <th style={headCell}>일자</th>
              <th style={headCell}>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>① 청약일</strong></td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>D ~ D+1 (보통 2일)</td><td style={cell}>증거금 납입 (계좌 출금 또는 묶임)</td></tr>
            <tr><td style={cell}><strong>② 배정 발표</strong></td><td style={{ ...cell, fontFamily: 'Inter, system-ui, sans-serif' }}>D+1 ~ D+2</td><td style={cell}>증권사 알림 (HTS·MTS·문자)</td></tr>
            <tr><td style={cell}><strong>③ 환불</strong></td><td style={{ ...cell, color: '#3EFF9B', fontFamily: 'Inter, system-ui, sans-serif' }}>D+2 ~ D+3</td><td style={cell}>미배정분 환불 (증거금률 50%면 약 절반)</td></tr>
            <tr><td style={cell}><strong>④ 잔금 납입</strong></td><td style={{ ...cell, fontFamily: 'Inter, system-ui, sans-serif' }}>D+2 ~ D+3</td><td style={cell}>배정 주식 잔금 (증거금률 50%면 나머지 50%)</td></tr>
            <tr><td style={cell}><strong>⑤ 상장</strong></td><td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>D+7 ~ D+10</td><td style={cell}>거래 시작</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ⚠️ 자금 묶임 기간(보통 2~3일) 동안 다른 IPO 청약·예금 활용 불가. 큰 금액일수록 기회비용 ↑. 정확 일정은 증권신고서 확인.
      </p>

      {/* 6. 청약 수수료 일반 안내 */}
      <h2 style={sectionTitle}>💵 청약 수수료 일반 안내</h2>
      <div style={{ ...card }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          한국 증권사 일반 패턴(브랜드 추천 X · 정확 정보는 본인 거래 증권사 확인):
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '10px', paddingLeft: 18, marginBottom: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>전통 증권사</strong>: 보통 1,500~2,000원 (비대면·온라인 청약)</li>
          <li><strong style={{ color: 'var(--text)' }}>일부 증권사</strong>: 청약 수수료 무료 (주관사·우대 조건)</li>
          <li><strong style={{ color: 'var(--text)' }}>오프라인 청약</strong>: 보통 +500~1,000원 추가</li>
          <li>청약 자체에 수수료가 발생 — 비례 1주 받아도 청약 수수료가 더 클 수 있음 (주가가 크게 오를 가능성과 비교)</li>
          <li>본 도구는 수수료 자동 차감 X — 결과 값에서 직접 차감 권장</li>
        </ul>
      </div>

      {/* 7. FAQ — accordion */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 비례경쟁률 500:1이면 1주 받으려면 얼마 넣어야 하나요?</summary>
        <div style={faqAnswer}>
          공식: <strong style={{ color: 'var(--text)' }}>필요 증거금 = 목표 주수 × 경쟁률 × 공모가 × 증거금률</strong>.
          예: 1주 × 500 × 20,000원 × 50% = <strong style={{ color: 'var(--accent)' }}>500만 원</strong>.
          단, 청약단위(예: 100주 단위) 적용 시 올림 → 실제 필요 증거금 ↑. 본 도구는 자동 단위 적용.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 증거금률이 50%인지 100%인지 어떻게 아나요?</summary>
        <div style={faqAnswer}>
          종목별 증권신고서 또는 증권사 청약 안내에 명시. 일반적으로 <strong style={{ color: 'var(--text)' }}>50%</strong>가 표준이지만, 인기 IPO·일부 종목은 <strong style={{ color: 'var(--text)' }}>100%</strong> 요구. 본 도구는 50/100 빠른 입력 + 직접 입력 모두 지원.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 5사6입이 뭔가요? 0.5주는 어떻게 되나요?</summary>
        <div style={faqAnswer}>
          한국 회계 반올림 규칙 — <strong style={{ color: 'var(--text)' }}>0.5 미만 버림, 0.5 이상 올림</strong>. 비례 배정 = 청약 주수 ÷ 경쟁률 결과 적용.
          예: 0.4주 → 0주(미배정), 0.5주 → 1주, 1.4주 → 1주, 1.5주 → 2주.
          일부 종목은 <strong style={{ color: 'var(--text)' }}>1주 보장 추첨</strong>(0.5 미만이라도 추첨으로 1주 배정 — 본 도구의 옵션). 정확한 룰은 증권신고서 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 균등배정으로 무조건 1주 받을 수 있나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>아니요 — 추첨</strong>입니다. 균등배정 주수보다 청약 인원이 많으면 추첨 → 0주 가능. 인기 종목일수록 떨어질 확률 ↑.
          본 도구의 &ldquo;균등 기대&rdquo; 입력은 사용자 가정값:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>0주: 추첨 떨어짐 가정 (보수적)</li>
            <li>1주: 당첨 가정 (낙관적)</li>
          </ul>
          실제 결과는 증권사 청약 후 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 1억 넣어도 한도 때문에 다 못 쓰는 경우가 있다는데?</summary>
        <div style={faqAnswer}>
          맞습니다. 종목·증권사별 청약 한도(보통 5,000~50,000주)가 있어 큰 증거금도 한도까지만 효과. 한도 초과분은 자동 잘림.
          <br /><br />
          예: 한도 5,000주 + 공모가 20,000원 + 증거금률 50% = 최대 효과 증거금 5,000만 원. 이상 넣어도 비례 배정 늘지 X.
          본 도구는 한도 입력 시 자동 경고 + 시나리오 표에서 ⚠️ 표시.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 중복청약 금지는 가족 명의로 우회 가능한가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#FF6B6B' }}>비추천 — 위험.</strong> 2021년 이후 한 종목당 1 증권사 원칙. 가족 명의 차용은:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>적발 시 배정 취소 + 자금 묶임</li>
            <li>증여세·상속세 이슈 (자금 출처 추적 가능)</li>
            <li>증권사 모니터링 강화 추세</li>
          </ul>
          정상적인 본인 명의 1 증권사 청약 권장.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 청약하면 자금이 며칠 묶이나요?</summary>
        <div style={faqAnswer}>
          일반: 청약일(D)~환불일(D+2~3) <strong style={{ color: 'var(--text)' }}>약 2~3 영업일</strong>. 큰 금액일수록 기회비용 ↑(예: 5,000만 원 × 연 5% × 3/365 = 약 2만 원).
          상장(D+7~10)까지 배정분은 계속 묶임. 본 도구의 메모 탭에서 D-day 자동 계산.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 청약 수수료는 얼마인가요?</summary>
        <div style={faqAnswer}>
          한국 증권사 일반 1,500~2,000원 (비대면 청약). 일부는 무료. 본 도구는 특정 증권사 추천 X.
          <br />⚠️ 작은 청약(1주만 노릴 때)은 수수료가 비례 배정 가치보다 클 수 있어 주의. 정확한 수수료는 본인 거래 증권사 안내 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구로 계산한 값과 실제 결과가 다를 수 있는 이유는?</summary>
        <div style={faqAnswer}>
          <ul style={{ paddingLeft: 18, marginTop: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>경쟁률 변동</strong> — 청약 마감 1~2시간 전까지 급변</li>
            <li><strong style={{ color: 'var(--text)' }}>5사6입 변형</strong> — 종목별 1주 보장 추첨 등 변형 룰</li>
            <li><strong style={{ color: 'var(--text)' }}>균등배정 추첨</strong> — 인원에 따라 0~N주 변동</li>
            <li><strong style={{ color: 'var(--text)' }}>청약단위·한도</strong> — 종목·증권사별 다름</li>
            <li><strong style={{ color: 'var(--text)' }}>우대조건</strong> — 청약사 우수고객·신용점수 등</li>
            <li><strong style={{ color: 'var(--text)' }}>수수료·환불 시점</strong> — 실수령액에 영향</li>
          </ul>
          본 도구는 일반 가이드 — 마감 직전 실제 경쟁률·증권사 안내 재확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 공모주는 어디서 확인할 수 있나요?</summary>
        <div style={faqAnswer}>
          본 도구는 종목 추천 X — 공식 사이트에서 직접 확인:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><Link href="https://dart.fss.or.kr" target="_blank" style={{ color: 'var(--accent)' }}>DART (전자공시시스템)</Link> — 증권신고서·투자설명서</li>
            <li><Link href="https://kind.krx.co.kr" target="_blank" style={{ color: 'var(--accent)' }}>KIND (한국거래소)</Link> — 상장공시</li>
            <li>본인 거래 증권사 HTS/MTS — 청약 안내·일정</li>
            <li>금융감독원 1332 (분쟁·민원)</li>
            <li>금융투자협회 (kofia.or.kr) — 청약 가이드</li>
          </ul>
        </div>
      </details>

      {/* 8. 면책 */}
      <h2 style={sectionTitle}>⚠️ 면책 조항</h2>
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
          <li>본 도구는 <strong>일반 계산 가이드</strong>입니다. 비례경쟁률·균등배정·5사6입·청약단위·한도 등 변수가 많아 실제 결과와 차이 가능.</li>
          <li>본 도구는 <strong>특정 종목·증권사 추천 X · 주가 예측 X · 따상/따따상 보장 X · 실시간 청약 정보 X</strong>.</li>
          <li>균등배정은 추첨 — 인기 종목은 0주 가능. 본 도구의 &ldquo;균등 기대&rdquo;는 사용자 가정값.</li>
          <li>청약 자금 대출·레버리지 권유 X. 본인 자금 한도 내 보수적 운용 권장.</li>
          <li>중복청약 금지 위반 시 배정 취소 + 자금 묶임 + 추후 청약 제한 가능.</li>
          <li>투자 판단 전 필수 확인: <Link href="https://dart.fss.or.kr" target="_blank" style={{ color: 'var(--accent)' }}>DART 증권신고서</Link>, <Link href="https://kind.krx.co.kr" target="_blank" style={{ color: 'var(--accent)' }}>KIND 공시</Link>, 본인 거래 증권사 청약 안내.</li>
          <li>도움 받기: 금융감독원 1332 / 한국예탁결제원 / 본인 거래 증권사 고객센터.</li>
        </ul>
      </div>

      {/* 9. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배정 후 장기 수익 시뮬</div>
        </Link>
        <Link href="/tools/finance/stock" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📉</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>주식 물타기 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>상장 후 평단 관리</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배당주 IPO 활용</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>청약일·상장일 추적</div>
        </Link>
        <Link href="/tools/finance/4-insurance" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>4대보험 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>금융 소득 영향 참고</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자금 계획 참고</div>
        </Link>
      </div>
    </div>
  )
}
