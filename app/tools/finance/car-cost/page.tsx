import Link from 'next/link'
import CarCostClient from './CarCostClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/car-cost',
  title: '자동차 유지비 계산기 — 5년·10년 비용·구매 방식 비교·전기차 vs 가솔린 | Youtil',
  description: '유류비·보험·자동차세·소모품·감가상각 자동 계산. 현금·할부·리스·장기렌트 비교, 차종 비교 (경차·중형·SUV·전기), 전기 vs 하이브리드 vs 가솔린, 보유 vs 카쉐어링 손익분기까지. 한국 2026년 기준.',
  keywords: [
    '자동차 유지비 계산기', '자동차 1km당 비용', '전기차 vs 가솔린', '자동차 할부 vs 리스',
    '장기렌트 비교', '차 살 때 비용', '카쉐어링 vs 보유', '자동차 감가상각',
    '한국 자동차 보험료', '아이오닉5 유지비', '5년 자동차 유지비',
    '자동차세 계산', '쏘나타 유지비', '아반떼 유지비', '쏘카 vs 자가용',
  ],
})

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
        유류비·보험·자동차세·소모품·감가상각 + <strong style={{ color: 'var(--text)' }}>구매 방식 비교 (현금·할부·리스·장기렌트) + 차종 비교 + 전기 vs 가솔린 + 보유 vs 카쉐어링</strong>까지.
        3년·5년·10년 총비용 한 번에.
      </p>

      <CarCostClient />

      {/* 1. 자동차 유지비 항목 가이드 (기존 보존) */}
      <h2 style={sectionTitle}>📋 자동차 유지비 항목 완전 가이드</h2>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🏛️ 고정비 (매달 동일)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>자동차 보험</strong> — 연 평균 60~150만원 (연령·차종·경력별)</li>
          <li><strong style={{ color: 'var(--text)' }}>자동차세</strong> — 배기량 기준 8만~80만원/년 · 전기차 13만/년 정액</li>
          <li><strong style={{ color: 'var(--text)' }}>할부금</strong> — 남은 기간만 가산 (할부 종료 후 0)</li>
          <li><strong style={{ color: 'var(--text)' }}>월 주차비</strong> — 지역별 0~20만원</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🛣️ 변동비 (사용량에 따라)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>유류비</strong> — 월 주행거리 × 유가 ÷ 연비</li>
          <li><strong style={{ color: 'var(--text)' }}>고속도로 통행료</strong> — 이용에 따라</li>
          <li><strong style={{ color: 'var(--text)' }}>엔진오일·타이어·정비비</strong> — 한국 평균 월 4~6만원</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>🔧 소모품 평균 (한국 표준)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>엔진오일</strong> — 5,000km 또는 6개월 (8만/회 → 월 1.5만)</li>
          <li><strong style={{ color: 'var(--text)' }}>타이어 (4개)</strong> — 4만km 또는 3년 (60~80만/세트 → 월 1.5~2만)</li>
          <li><strong style={{ color: 'var(--text)' }}>배터리</strong> — 약 3년 (15만/회 → 월 4천)</li>
          <li><strong style={{ color: 'var(--text)' }}>브레이크 패드</strong> — 3~4만km (앞바퀴 기준 15만)</li>
          <li><strong style={{ color: 'var(--text)' }}>에어컨 필터·와이퍼</strong> — 6~12개월</li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>📉 감가상각 (잠재 비용)</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>국산 경·소형</strong> — 연 10%</li>
          <li><strong style={{ color: 'var(--text)' }}>국산 중형</strong> — 연 8~10%</li>
          <li><strong style={{ color: 'var(--text)' }}>국산 대형·SUV</strong> — 연 12%</li>
          <li><strong style={{ color: 'var(--text)' }}>수입차</strong> — 연 13%</li>
          <li><strong style={{ color: 'var(--text)' }}>전기차</strong> — 연 15~20% (가장 큼)</li>
          <li><strong style={{ color: 'var(--text)' }}>하이브리드</strong> — 연 11%</li>
        </ul>
      </div>

      {/* 2. 한국 자동차 보험료 가이드 (NEW) */}
      <h2 style={sectionTitle}>🛡️ 한국 자동차 보험료 평균 (2026년)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>운전자 구분</th>
              <th style={headCell}>연 보험료 평균</th>
              <th style={headCell}>비고</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>20대 신규</td><td style={cell}><strong style={{ color: '#FF6B6B' }}>약 150만원</strong></td><td style={cell}>경력 X · 가장 비쌈</td></tr>
            <tr><td style={cell}>30대 안정</td><td style={cell}>약 80~100만원</td><td style={cell}>경력 5년+</td></tr>
            <tr><td style={cell}>40~50대 무사고</td><td style={cell}><strong style={{ color: '#3EFF9B' }}>약 60~80만원</strong></td><td style={cell}>최저 구간</td></tr>
            <tr><td style={cell}>60대+</td><td style={cell}>약 70~90만원</td><td style={cell}>연령 할증 시작</td></tr>
            <tr><td style={cell}>외제차</td><td style={cell}>+30~50%</td><td style={cell}>기본료의 1.3~1.5배</td></tr>
            <tr><td style={cell}>사고 경력</td><td style={cell}>+할증</td><td style={cell}>3년간 할증</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
        ※ 다이렉트 보험·운전자 한정 특약·차량 가액 조정으로 최대 30% 절감 가능. 매년 비교 견적 권장.
      </p>

      {/* 3. 자동차세 자동 계산 (NEW) */}
      <h2 style={sectionTitle}>🏛️ 자동차세 (배기량별 자동)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>배기량</th>
              <th style={headCell}>연 자동차세</th>
              <th style={headCell}>대상 예시</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>1,000cc 이하</td><td style={cell}><strong>80,000원</strong></td><td style={cell}>경차 (모닝·캐스퍼)</td></tr>
            <tr><td style={cell}>1,500cc 이하</td><td style={cell}><strong>200,000원</strong></td><td style={cell}>소형 (아반떼 1.6 GDI)</td></tr>
            <tr><td style={cell}>2,000cc 이하</td><td style={cell}><strong>400,000원</strong></td><td style={cell}>준중형·중형 (쏘나타·K5)</td></tr>
            <tr><td style={cell}>2,500cc 이하</td><td style={cell}><strong>500,000원</strong></td><td style={cell}>중형~대형</td></tr>
            <tr><td style={cell}>3,000cc 이하</td><td style={cell}><strong>600,000원</strong></td><td style={cell}>대형 (그랜저 3.0)</td></tr>
            <tr><td style={cell}>3,000cc 초과</td><td style={cell}><strong style={{ color: '#FF6B6B' }}>800,000원+</strong></td><td style={cell}>대형 SUV (팰리세이드)</td></tr>
            <tr><td style={cell}><strong style={{ color: '#3EC8FF' }}>전기차</strong></td><td style={cell}><strong style={{ color: '#3EC8FF' }}>130,000원 정액</strong></td><td style={cell}>아이오닉5·EV6 등</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
        ※ 6월·12월 분납. 1월 일시납 시 약 10% 공제. 연식 5년 초과 시 단계별 인하.
      </p>

      {/* 4. 5년 vs 10년 보유 비교 (NEW) */}
      <h2 style={sectionTitle}>📅 5년 vs 10년 보유 — 어느 게 경제적?</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
          한국 평균 자동차 보유 기간은 약 <strong style={{ color: 'var(--text)' }}>5.5년</strong>입니다.
          일반적으로 10년 보유가 더 경제적이지만, 정비비·안전·신차감 우선순위에 따라 달라집니다.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>보유 기간</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 감가</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>1년당 감가</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>3년</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>약 1,000만</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 333만/년</td>
                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>가장 비쌈 (초기 감가 큼)</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>5년 ⭐</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>약 1,800만</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 360만/년</td>
                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>한국 평균 보유 기간</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>10년</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>약 2,300만</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EFF9B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 230만/년</td>
                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>가장 경제적 (정비비 ↑ 주의)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          ※ 3,000만 차량 기준. 실제는 모델·시장에 따라 차이.
        </p>
      </div>

      {/* 5. 구매 방식 비교 (NEW) */}
      <h2 style={sectionTitle}>💳 현금·할부·리스·장기렌트 비교</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
        3,000만 차량 / 5년 보유 가정 — 본 도구의 「구매 방식 비교」 탭에서 정량 비교 가능.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>방식</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 부담</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>5년 총비용</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: 'rgba(200,255,62,0.06)' }}>
              <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>현금 ★</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>약 28만</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 1,680만</td>
              <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>이자 X · 가장 저렴</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>할부 (5년·5%)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>약 56만</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 3,375만</td>
              <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>이자 약 397만 추가</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>리스</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>약 75만</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 4,500만</td>
              <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>비소유 · 비용 처리 (사업자)</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>장기렌트</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>약 84만</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>약 5,040만</td>
              <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>비소유 · 보험·정비 포함</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
        ※ 본인 상황별 추천: 자금 충분 → 현금, 자금 부족 + 5년+ → 할부, 사업자 → 리스, 관리 편함 우선 → 장기렌트.
        ⚠️ 광고 표시 가격 ≠ 실제 비용 — 캐피탈 회사 직접 견적 필수.
      </p>

      {/* 6. 전기차 vs 가솔린 (기존 보존·강화) */}
      <h2 style={sectionTitle}>🔋 전기차 vs 가솔린 정량 비교</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
        5년 보유 / 연 1만 5천km 가정 — 본 도구의 「연료 타입 비교」 탭에서 6가지(가솔린·디젤·LPG·하이브리드·전기 가정/급속) 비교 가능.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연료</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>차량가</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: '#FF8C3E', fontWeight: 700 }}>5년 연료비</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontWeight: 700 }}>5년 감가</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>5년 총비용</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>가솔린</td><td style={cell}>3,000만</td><td style={cell}>약 1,031만</td><td style={cell}>약 1,228만</td><td style={cell}><strong>2,259만</strong></td></tr>
            <tr><td style={cell}>디젤</td><td style={cell}>3,200만</td><td style={cell}>약 803만</td><td style={cell}>약 1,310만</td><td style={cell}><strong>2,113만</strong></td></tr>
            <tr style={{ background: 'rgba(62,255,155,0.06)' }}>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>LPG ★</strong></td>
              <td style={cell}>2,800만</td>
              <td style={cell}>약 833만</td>
              <td style={cell}>약 1,146만</td>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>1,979만</strong></td>
            </tr>
            <tr><td style={cell}>하이브리드</td><td style={cell}>3,500만</td><td style={cell}>약 688만</td><td style={cell}>약 1,500만</td><td style={cell}><strong>2,188만</strong></td></tr>
            <tr><td style={cell}>전기 (가정)</td><td style={cell}>4,500만</td><td style={cell}><strong style={{ color: '#3EFF9B' }}>약 300만</strong></td><td style={cell}>약 2,820만</td><td style={cell}>3,120만</td></tr>
            <tr><td style={cell}>전기 (급속)</td><td style={cell}>4,500만</td><td style={cell}>약 525만</td><td style={cell}>약 2,820만</td><td style={cell}>3,345만</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
        ※ 5년 보유 시 LPG·하이브리드 가장 저렴, 전기차는 감가 큼. 전기차 유리 조건: 10년+ 장기 보유 + 가정 충전 + 시내 주행 위주 + 환경 가치 우선.
        배터리 교체(10년+ 후 1,000~1,500만), 보조금(약 700만+) 별도.
      </p>

      {/* 7. 차종별 월 유지비 (기존 보존) */}
      <h2 style={sectionTitle}>🚙 차종별 월 유지비 예시</h2>
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
            <tr><td style={cell}>경차 (모닝급)</td><td style={cell}>약 20~30만원</td><td style={cell}>약 30~40만원</td></tr>
            <tr><td style={cell}>소형차 (아반떼급)</td><td style={cell}>약 25~40만원</td><td style={cell}>약 40~55만원</td></tr>
            <tr><td style={cell}>중형차 (쏘나타급)</td><td style={cell}>약 35~55만원</td><td style={cell}>약 55~80만원</td></tr>
            <tr><td style={cell}>SUV (투싼급)</td><td style={cell}>약 40~65만원</td><td style={cell}>약 65~100만원</td></tr>
            <tr><td style={cell}>전기차 (아이오닉5급)</td><td style={cell}>약 20~35만원</td><td style={cell}>약 50~90만원</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>※ 월 1,500km 기준, 개인 조건에 따라 차이. 본 도구의 「차종 비교」 탭에서 직접 비교 가능.</p>

      {/* 8. 카쉐어링 손익분기 (NEW) */}
      <h2 style={sectionTitle}>🚙 보유 vs 카쉐어링 손익분기</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
          쏘카·그린카 등 카쉐어링이 보유보다 유리한 경계는 <strong style={{ color: 'var(--text)' }}>월 800km</strong> 부근입니다.
          본 도구의 「보유 vs 카쉐어링」 탭에서 본인 상황 정량 비교.
        </p>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13.5, lineHeight: 1.85, color: 'var(--text)' }}>
          <li>월 500km 미만: <strong style={{ color: '#C485E0' }}>쏘카·그린카 압도적 유리</strong></li>
          <li>월 500~800km: 카쉐어링 약간 유리</li>
          <li>월 800~1,200km: 비슷</li>
          <li>월 1,200km+: <strong style={{ color: '#3EC8FF' }}>보유 유리</strong></li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
          ※ 2026 쏘카 기준: 시간당 8,000원 + km당 200원 (보험·연료 포함). 서울 강남·홍대는 월 1,000km까지도 카쉐어링이 유리할 수 있음.
        </p>
      </div>

      {/* 9. FAQ — accordion */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문 (FAQ)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          {
            q: '자동차 유지비에서 가장 큰 항목은 무엇인가요?',
            a: '감가상각을 포함하면 감가가 40~60%를 차지하는 경우가 많습니다. 감가를 제외하면 유류비가 가장 큰 항목(40~50%)이 되며, 보험료가 두 번째로 큰 고정비입니다. 본 도구의 「유지비 계산」 탭 비용 항목 분석에서 본인 비중 확인 가능.',
          },
          {
            q: '1km당 유지비는 어떻게 계산하나요?',
            a: '월 유지비 ÷ 월 주행거리로 계산합니다. 예) 월 50만원, 월 1,500km → 1km당 약 333원. 유류비만 따지면 연비 12km/L·유가 1,650원 기준 약 138원/km. 주행거리가 적을수록 1km당 비용이 높아지므로 월 800km 미만이면 카쉐어링 검토.',
          },
          {
            q: '감가상각은 실제 나가는 돈인가요?',
            a: '직접 지출하는 돈은 아니지만 실질적인 자산 손실입니다. 차를 팔 때 구매가보다 낮은 금액을 받게 되는 것이 감가상각이며, 신차를 자주 바꾸는 경우 가장 큰 비용 요소가 됩니다. 5년 보유 → 1년당 감가 약 360만, 10년 → 약 230만으로 장기 보유가 일반적으로 경제적.',
          },
          {
            q: '소모품 교체 주기는 어떻게 알 수 있나요?',
            a: '차량 구매 시 받은 사용 설명서나 제조사 공식 홈페이지에서 확인하세요. 본 계산기의 기본값(엔진오일 1만km/12개월, 타이어 4만km, 배터리 36개월 등)은 일반적인 평균치이며 실제와 다를 수 있습니다. 정기 점검 시 정비사에게 현재 상태 확인 권장.',
          },
          {
            q: '대중교통과 비교했을 때 차가 더 비싼가요?',
            a: '대도시 대중교통 월 10만원 내외 vs 차량 유지비 월 35~80만원(감가 제외)으로 단순 비용만 보면 대중교통이 훨씬 저렴합니다. 그러나 이동 편의성·시간 절약·짐 운반 등 비화폐적 가치도 고려해야 합니다. 월 주행거리가 높을수록 1km당 비용은 낮아짐.',
          },
          {
            q: '자동차 5년 보유와 10년 보유 어느 게 더 경제적인가요?',
            a: '일반적으로 10년 보유가 더 경제적입니다. 5년 보유는 1년당 감가가 약 360만원으로 가장 큰 반면, 10년 보유는 약 230만원으로 줄어듭니다(초기 5년에 감가의 60% 발생). 다만 정비비는 후반부에 늘어나며, 안전·기능 노후화·신차감 등 본인 우선순위에 따라 다릅니다. 한국 평균 보유 기간은 5.5년.',
          },
          {
            q: '현금 구매 vs 할부 어느 게 유리한가요?',
            a: '자금 여유에 따라 다릅니다. 자금 충분 + 다른 투자처 수익률 < 할부 금리(5~7%) → 현금 구매. 자금 부족 + 다른 투자 수익률 > 할부 금리 → 할부. 2026년 한국 자동차 할부 평균 금리 5~7%. 현재 예금·복리 수익률보다 높으므로 일반적으로 현금 구매가 유리합니다. 본 도구의 「구매 방식 비교」 탭에서 정량 비교.',
          },
          {
            q: '리스·장기렌트는 일반인에게도 유리한가요?',
            a: '대부분 일반인에게는 비용 부담이 큽니다. 5년+ 장기 보유 의도라면 비추천. 유리한 경우: ① 사업자(비용 처리·절세), ② 단기 사용(2~3년), ③ 신차 자주 교체, ④ 신용 X 또는 신용카드 X, ⑤ 관리 편함 우선. ⚠️ 광고 표시 가격 ≠ 실제 비용. 잔존가치·중도 해지·보험·정비 별도 옵션 등 숨은 비용 많으니 계약서 꼼꼼히.',
          },
          {
            q: '전기차가 정말 유지비 더 싼가요?',
            a: '연료비는 가솔린의 1/3~1/4 수준이지만 다음 추가 비용이 있습니다: ① 차량 가격 +1,000~2,000만(보조금 후), ② 감가율 ↑ (연 15~20%), ③ 배터리 교체 (10년+ 후 1,000~1,500만), ④ 충전기 설치 (아파트 50~200만). 5년 보유 비교 시 일반 가솔린 약 2,259만 vs 전기 가정 충전 약 3,120만으로 가솔린이 유리. 전기차는 10년+ 장기 + 가정 충전 + 시내 주행 + 환경 가치 시 유리.',
          },
          {
            q: '카쉐어링과 차 보유 어느 게 더 싼가요?',
            a: '월 주행거리에 따라 다릅니다. 월 500km 미만: 쏘카·그린카 압도적 유리. 월 500~800km: 카쉐어링 약간 유리. 월 800~1,200km: 비슷. 월 1,200km+: 보유 유리. 2026년 쏘카 평균 시간당 8,000원 + km당 200원(보험·연료 포함). 서울 강남·홍대는 카쉐어링 인프라 좋아서 월 1,000km까지도 카쉐어링이 유리할 수 있음. 본 도구의 「보유 vs 카쉐어링」 탭에서 정량 비교.',
          },
          {
            q: '본 계산기는 추천을 해주나요?',
            a: '아닙니다. 본 도구는 일반 정보 제공 도구이며, 「이 차 사세요」 같은 추천을 하지 않습니다. 실제 비용은 운전 습관·정비 주기·보험 조건·지역별 유가/주차비·차량 상태·연식·정책 변경에 따라 다릅니다. 리스·장기렌트 견적은 캐피탈 회사 직접 문의, 보험·정비는 전문가 상담 필수.',
          },
        ].map((faq, i) => (
          <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              Q{i + 1}. {faq.q}
            </summary>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      {/* 10. 면책 강화 */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.04)',
        border: '1px solid rgba(255, 107, 107, 0.30)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginTop: '32px',
        fontSize: '13px',
        color: 'var(--muted)',
        lineHeight: 1.85,
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#FF8C8C', marginBottom: 10 }}>⚖️ 면책 조항</p>
        <p style={{ marginBottom: 8 }}>
          본 자동차 유지비 계산기는 <strong style={{ color: 'var(--text)' }}>일반 정보 제공 도구</strong>입니다. 실제 비용은 다음에 따라 다를 수 있습니다:
        </p>
        <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
          <li>운전 습관·정비 주기</li>
          <li>보험 조건·할인 (다이렉트·운전자 한정 등)</li>
          <li>지역별 유가·주차비</li>
          <li>차량 상태·연식</li>
          <li>정책 변경 (자동차세·전기차 보조금 등)</li>
        </ul>
        <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>전문가 상담 권장:</p>
        <ul style={{ paddingLeft: 18 }}>
          <li>리스·장기렌트 견적 — 캐피탈 회사 직접 문의 필수</li>
          <li>중고차 시세 — KB차차차·엔카 등 전문 사이트</li>
          <li>보험 견적 — 다이렉트 보험사 비교</li>
          <li>정비비 — 정비소 직접 견적</li>
          <li>「이 차 사세요」 같은 추천은 하지 않음 — 본인 상황·취향 종합 결정</li>
        </ul>
      </div>

      {/* 11. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        <Link href="/tools/finance/salary" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💴</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연봉 실수령액 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>월급 대비 차 유지비 비율</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자동차 할부 이자 정밀 계산</div>
        </Link>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>차 안 사면 투자 효과</div>
        </Link>
        <Link href="/tools/finance/real-estate" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏘️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>부동산 투자 수익률</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>차 vs 부동산 투자</div>
        </Link>
      </div>
    </div>
  )
}
