import type { Metadata } from 'next'
import Link from 'next/link'
import CarCostClient from './CarCostClient'

export const metadata: Metadata = {
  title: '자동차 유지비 계산기 — 하루 유지비·감가상각·1km당 비용 | Youtil',
  description: '유류비, 보험료, 자동차세, 소모품, 감가상각까지 자동차 유지비를 월·일 단위로 계산합니다. 내 차 하루 유지비, 1km당 비용, 연간 총 유지비 즉시 확인.',
  keywords: ['자동차유지비계산기', '내차유지비', '차유지비계산기', '자동차감가상각계산기', '1km당비용', '유류비계산기', '차량유지비월환산'],
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
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
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

export default function CarCostPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🚗 자동차 유지비 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        유류비·보험·자동차세·소모품·감가상각까지 — 자동차 유지비를 월·일·1km 단위로 환산해 보여드려요. 내 차의 진짜 비용을 한눈에 확인하세요.
      </p>

      <CarCostClient />

      {/* 1. 자동차 유지비 항목 가이드 */}
      <h2 style={sectionTitle}>📋 자동차 유지비 항목 완전 가이드</h2>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🏛️ 고정비 (매달 동일)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>자동차 보험</strong> — 연 평균 80~120만원 (월 약 7~10만원)</li>
          <li><strong style={{ color: 'var(--text)' }}>자동차세</strong> — 배기량 기준 연 10~50만원+</li>
          <li><strong style={{ color: 'var(--text)' }}>할부금</strong> — 해당 시</li>
          <li><strong style={{ color: 'var(--text)' }}>월 주차비</strong> — 지역별 0~20만원</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🛣️ 변동비 (사용량에 따라)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>유류비</strong> — 월 주행거리 × 유가 ÷ 연비</li>
          <li><strong style={{ color: 'var(--text)' }}>고속도로 통행료</strong> — 이용에 따라</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🔧 소모품 (주기적)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>엔진오일</strong> — 1만km 또는 1년</li>
          <li><strong style={{ color: 'var(--text)' }}>타이어 (4개)</strong> — 4만km 또는 3~4년</li>
          <li><strong style={{ color: 'var(--text)' }}>배터리</strong> — 약 3년</li>
          <li><strong style={{ color: 'var(--text)' }}>브레이크 패드</strong> — 3~4만km (앞바퀴 기준)</li>
          <li><strong style={{ color: 'var(--text)' }}>에어컨 필터·와이퍼</strong> — 6~12개월</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>📉 감가상각 (잠재 비용)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>국산 중형</strong> — 연 8~12%</li>
          <li><strong style={{ color: 'var(--text)' }}>수입차</strong> — 연 12~15%</li>
          <li><strong style={{ color: 'var(--text)' }}>전기차</strong> — 연 15~20%</li>
        </ul>
      </div>

      {/* 2. 차종별 월 유지비 예시 */}
      <h2 style={sectionTitle}>🚙 차종별 월 유지비 예시 (참고용)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>차종 예시</th>
              <th style={headCell}>월 유지비 (감가 제외)</th>
              <th style={headCell}>월 유지비 (감가 포함)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>경차 (모닝급)</td>
              <td style={cell}>약 20~30만원</td>
              <td style={cell}>약 30~40만원</td>
            </tr>
            <tr>
              <td style={cell}>소형차 (아반떼급)</td>
              <td style={cell}>약 25~40만원</td>
              <td style={cell}>약 40~55만원</td>
            </tr>
            <tr>
              <td style={cell}>중형차 (쏘나타급)</td>
              <td style={cell}>약 35~55만원</td>
              <td style={cell}>약 55~80만원</td>
            </tr>
            <tr>
              <td style={cell}>SUV (투싼급)</td>
              <td style={cell}>약 40~65만원</td>
              <td style={cell}>약 65~100만원</td>
            </tr>
            <tr>
              <td style={cell}>전기차 (아이오닉5급)</td>
              <td style={cell}>약 20~35만원</td>
              <td style={cell}>약 50~90만원</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>※ 월 1,500km 기준, 개인 조건(보험·할부·주차비 등)에 따라 크게 달라집니다.</p>

      {/* 3. 감가상각 */}
      <h2 style={sectionTitle}>📉 감가상각이 가장 큰 비용인 이유</h2>
      <div style={card}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li>신차 구매 후 <strong>1년 내 가치 15~25% 하락</strong></li>
          <li>5년 후 잔존 가치는 보통 <strong>40~60% 수준</strong></li>
          <li>감가는 &ldquo;보이지 않는 비용&rdquo;이지만 실제로는 자산 손실로 이어집니다</li>
        </ul>
        <div style={{
          marginTop: '14px',
          padding: '12px 14px',
          background: 'var(--bg3)',
          borderRadius: '10px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.7,
        }}>
          📊 <strong>예시</strong> — 3,000만원 차를 5년 보유 후 1,500만원에 매각하면<br />
          총 감가 1,500만원 = 월 25만원 = <strong style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>하루 약 8,200원</strong>
        </div>
      </div>

      {/* 4. 전기차 vs 가솔린차 */}
      <h2 style={sectionTitle}>🔋 전기차 vs 가솔린차 유지비 비교</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>공통 비용</strong> — 보험·세금·주차·일부 소모품
        </p>
      </div>
      <div style={{ ...card, borderTop: '3px solid #3EFF9B' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#3EFF9B' }}>🟢 전기차 절감 항목</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
          유류비 → <strong style={{ color: 'var(--text)' }}>충전비가 가솔린의 1/3 ~ 1/4 수준</strong> (완속 충전 기준).
          연간 1만 5천km 주행 시 가솔린 약 200만원 → 전기 약 50~80만원 수준으로 절감 가능.
        </p>
      </div>
      <div style={{ ...card, borderTop: '3px solid #FF6B6B' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#FF6B6B' }}>🔴 전기차 추가 고려사항</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li>배터리 교체 비용 — 10년 후 약 1,000~1,500만원</li>
          <li>감가상각률이 가솔린차보다 높은 경향 (연 15~20%)</li>
          <li>고속(공용) 충전 빈도가 높으면 단가 차이 줄어듬</li>
        </ul>
      </div>

      {/* 5. FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 자동차 유지비에서 가장 큰 항목은 무엇인가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>감가상각을 포함하면 감가가 40~60%</strong>를 차지하는 경우가 많습니다.
          감가를 제외하면 유류비가 가장 큰 항목(40~50%)이 되며, 보험료가 두 번째로 큰 고정비입니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 1km당 유지비는 어떻게 계산하나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>월 유지비 ÷ 월 주행거리</strong>로 계산합니다.
          예) 월 50만원, 월 1,500km → 1km당 약 333원. 유류비만 따지면 연비 12km/L·유가 1,650원 기준 약 138원/km입니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 감가상각은 실제 나가는 돈인가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          직접 지출하는 돈은 아니지만 <strong style={{ color: 'var(--text)' }}>실질적인 자산 손실</strong>입니다.
          차를 팔 때 구매가보다 낮은 금액을 받게 되는 것이 감가상각 손실이며, 신차를 자주 바꾸는 경우 가장 큰 비용 요소가 됩니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 소모품 교체 주기는 어떻게 알 수 있나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          차량 구매 시 받은 <strong style={{ color: 'var(--text)' }}>사용 설명서나 제조사 공식 홈페이지</strong>에서 확인하세요.
          본 계산기의 기본값은 일반적인 평균치이며 실제와 다를 수 있습니다. 정기 점검 시 정비사에게 현재 상태를 확인받는 것이 가장 정확합니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 대중교통과 비교했을 때 차가 더 비싼가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          대도시 대중교통 월 10만원 내외 vs 차량 유지비 월 35~80만원(감가 제외)으로 단순 비용만 보면 <strong style={{ color: 'var(--text)' }}>대중교통이 훨씬 저렴</strong>합니다.
          그러나 이동 편의성, 시간 절약, 짐 운반 등 비화폐적 가치도 고려해야 합니다. 월 주행거리가 높을수록 1km당 비용은 낮아집니다.
        </p>
      </div>

      {/* 6. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        <Link href="/tools/finance/salary" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💴</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연봉 실수령액 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>월급 대비 차 유지비 비율 파악</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자동차 할부 이자 계산</div>
        </Link>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>절약분 재투자 시뮬레이션</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>차 vs 투자 비교</div>
        </Link>
      </div>
    </div>
  )
}
