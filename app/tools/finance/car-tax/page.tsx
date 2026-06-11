import Link from 'next/link'
import CarTaxClient from './CarTaxClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/car-tax',
  title: '자동차 세금 종합 계산기 — 취득세·자동차세·유류세·공채까지',
  description:
    '자동차 구매 시 취득세 + 공채 매입 + 등록비 + 매년 자동차세·지방교육세·환경부담금·유류세까지 한 화면에. 친환경차·다자녀·장애인 감면 자동 + 연납 약 5% 할인 + 5/10년 누적 시뮬레이션 (2026년 기준).',
  keywords: [
    '자동차 세금', '취득세 계산기', '자동차세 계산기', '자동차세 연납',
    '공채 매입', '도시철도채권', '지역개발채권', '유류세',
    '환경개선부담금', '자동차 양도세', '자동차 양도소득세',
    '전기차 취득세', '하이브리드 감면', '다자녀 자동차 감면',
    '장애인 자동차세 면제', '자동차세 감면', '경차 취득세',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
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

const FAQ_LD = [
  { "q":"중고차도 취득세를 내나요?","a":"네, 매매가 기준 동일하게 7% (경차 4%)를 매수인이 납부합니다. 단 신차 출고가가 아니라 매매가 기준이라 절대 금액은 줄어듭니다. 예: 5년 된 쏘나타 1,500만 원에 매수 → 취득세 105만 원 + 공채 + 등록비. 연식이 오래되어 자동차세는 이미 상당 % 감면된 상태로 인수." },
  { "q":"자동차세 연납은 언제 얼마 할인되나요?","a":"1월에 일괄 납부 시 약 4.6% 할인됩니다 (2026년 공제율 5% × 잔여 11개월 기준). 공제율 5%는 신청 시점의 잔여 기간에 비례 적용 — 1월: 약 4.6% (최대 할인) 3월: 약 3.75% 6월: 약 2.5% 9월: 약 1.25%. 연납 공제율은 과거 10%→5%로 단계 인하되었고 향후 3%로 축소 전망. 위택스(wetax.go.kr) 또는 카드사 앱(삼성·신한 등)에서 자동이체 가능. 주의: 연납 정책은 매년 일부 변경 — 최신은 위택스에서 확인." },
  { "q":"전기차 세금이 정말 일반차보다 많이 절약되나요?","a":"네, 5년 기준 세금만 약 330만 원, 유류세까지 포함하면 약 900만 원 절감됩니다. 취득세: 140만원 한도 면제 (4,000만 원 차량 기준 280만→140만) 자동차세: 2000cc 가솔린 약 52만/년(본세 40만+교육세 12만) vs 전기차 13만/년(본세 10만+교육세 3만) — 연 39만 차이 유류세: 연 1만 8천km 운행 시 휘발유 약 112만 원 vs 전기 0원 5년 합산: 취득세 140 + 자동차세 39×5(195) + 유류세 112×5(560) = 약 895만 원 절감 단, 전기차 자체 가격이 비싸고 배터리 교체 비용(약 1,000~2,000만)은 고려해야 함." },
  { "q":"공채를 보유하는 게 이득인가요, 즉시 매도가 이득인가요?","a":"대부분의 경우 즉시 매도가 더 이득입니다. 공채 표면 이자율 2~3% (5년 만기) 시중 예금 금리 3~5% 수준에서 기회비용 ↑ 5년 후 받는 원금·이자보다, 즉시 매도 + 다른 곳 운용이 보통 이득 단, 매도 시 약 10~15% 할인 — 이게 「실비용」으로 잡힘 부동산 매매 시 「국민주택채권」과 비슷한 구조." },
  { "q":"차량 명의를 부모님으로 하면 절세되나요?","a":"제한적입니다. 부모님이 65세 이상 + 본인 명의 자동차 없음 → 자동차세 50% 감면 (지방세법) 부모님이 장애인·국가유공자 → 본인 명의 1대 전액 면제 단 명의자가 운전·관리해야 하며, 위장 등록 적발 시 세금 추징 + 가산세 보험료는 명의자 기준이라 운전자 한정 특약 잘못 설정 시 사고 시 보상 X 명의 절세는 합법 범위 내에서 신중히. ※ 65세 이상 명의 50% 감면 등은 본 도구에서 자동 계산되지 않으며, 감면 자격 항목은 다자녀·장애인·국가유공자만 반영합니다." },
  { "q":"환경개선부담금은 누가 내나요?","a":"경유차 소유자만 납부합니다 (휘발유·LPG·전기차 X). 연 2회 (3월·9월) 부과 차종·배기량·연식별 차등 — 평균 연 8~22만 원 경차·하이브리드 경유차는 50% 감면 저공해차 인증(3종 1·2급) → 일부 감면 본 도구는 경유차 환경부담금 기본 정액만 반영하며 위 50%·저공해 감면은 자동 계산되지 않습니다. 노후 경유차는 조기폐차 보조금(50~600만원) 활용 권장." }
]

export default function CarTaxPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🚗 자동차 세금 종합 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        <strong style={{ color: 'var(--text)' }}>취득세·자동차세·유류세·공채·환경부담금</strong>까지 자동차 관련 모든 세금을 한 화면에. 친환경차·다자녀·장애인 감면 자동 반영 + 5/10년 누적 시뮬.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 자동차세 기준" sources={[{"label":"위택스","href":"https://www.wetax.go.kr"},{"label":"행정안전부","href":"https://www.mois.go.kr"}]} />

      <CarTaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 자동차 관련 세금 한눈에 */}
        <section>
          <h2 style={sectionTitle}>자동차 관련 세금 한눈에</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            자동차에 부과되는 세금은 <strong style={{ color: 'var(--text)' }}>구매·보유·운행·양도</strong> 4단계로 나눌 수 있습니다. 본 도구는 이 4단계를 모두 자동 계산합니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>시점</th>
                  <th style={headCell}>세금·비용</th>
                  <th style={headCell}>핵심</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong>🛒 구매 시</strong></td>
                  <td style={cell}>취득세 + 지방교육세 + 공채 매입 + 번호판비</td>
                  <td style={cell}>일반 승용 <strong style={{ color: '#D97706' }}>7%</strong> · 경차 4% · 영업용 4%</td>
                </tr>
                <tr>
                  <td style={cell}><strong>🗓️ 매년 보유</strong></td>
                  <td style={cell}>자동차세 + 지방교육세 (30%) + 환경개선부담금</td>
                  <td style={cell}>cc당 단가 × 연식 감면 (최대 50%)</td>
                </tr>
                <tr>
                  <td style={cell}><strong>⛽ 운행 시</strong></td>
                  <td style={cell}>유류세 (교통·에너지·환경세 + 교육세 + 주행세 + VAT)</td>
                  <td style={cell}>휘발유 L당 약 <strong>745원</strong> · 경유 528원</td>
                </tr>
                <tr>
                  <td style={cell}><strong>💰 양도 시</strong></td>
                  <td style={cell}>개인 차량은 <strong style={{ color: '#059669' }}>비과세</strong></td>
                  <td style={cell}>사업자·영업용은 사업소득 별도</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 취득세 상세 */}
        <section>
          <h2 style={sectionTitle}>🛒 취득세 — 차종별 세율과 감면</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>차종</th>
                  <th style={headCell}>취득세율</th>
                  <th style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>일반 승용차</strong></td><td style={cell}>7%</td><td style={cell}>가장 흔한 기준</td></tr>
                <tr><td style={cell}>경차 (1000cc 이하)</td><td style={cell}><strong style={{ color: '#059669' }}>4%</strong></td><td style={cell}>모닝·레이·스파크</td></tr>
                <tr><td style={cell}>영업용 (택시·버스·화물)</td><td style={cell}><strong style={{ color: '#059669' }}>4%</strong></td><td style={cell}>사업자 등록 필수</td></tr>
                <tr><td style={cell}>⚡ 전기·수소차</td><td style={cell}>7% (단, 140만원 한도 면제)</td><td style={cell}>실제: max(0, 7%·가격 − 140만)</td></tr>
                <tr><td style={cell}>🔋 하이브리드</td><td style={cell}>7%</td><td style={cell}>감면 2024년 종료</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>5,000만 원 일반 승용차</strong> 기준 취득세는 <strong style={{ color: 'var(--accent)' }}>350만 원</strong>.
            전기차라면 350만 - 140만 = 210만 원으로 절감.
          </p>
        </section>

        {/* 3. 자동차세 cc별 */}
        <section>
          <h2 style={sectionTitle}>🗓️ 자동차세 — cc당 단가와 감면</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            자동차세 본세 + 지방교육세(30%) + 환경부담금(경유차)이 매년 부과됩니다.
            <strong style={{ color: 'var(--text)' }}> 3년차부터 5%씩, 최대 50% (12년차 이상)</strong> 감면됩니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>배기량</th>
                  <th style={headCell}>cc당 단가</th>
                  <th style={headCell}>예시</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>1000cc 이하</strong></td><td style={cell}>80원</td><td style={cell}>모닝 998cc → 약 8만 원/년</td></tr>
                <tr><td style={cell}><strong>1600cc 이하</strong></td><td style={cell}>140원</td><td style={cell}>아반떼 1.6 → 약 22만 원/년</td></tr>
                <tr><td style={cell}><strong>1600cc 초과</strong></td><td style={cell}>200원</td><td style={cell}>쏘나타 2.0 → 약 40만 원/년</td></tr>
                <tr><td style={cell}>⚡ 전기·수소차</td><td style={cell}>—</td><td style={cell}>본세 <strong style={{ color: '#059669' }}>10만 원</strong> (+교육세 = 13만/년·차령 경감 없음)</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ※ 위 본세(cc당 단가·전기차 10만)에 <strong>지방교육세 30% 가산</strong>됩니다. 연납(1월) 시 약 4.6% 할인 (2026년 공제율 5%).
          </p>
        </section>

        {/* 4. 공채 매입 */}
        <section>
          <h2 style={sectionTitle}>🎫 공채 매입 — 잊기 쉬운 숨은 비용</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            차량 등록 시 의무적으로 매입하는 <strong style={{ color: 'var(--text)' }}>도시철도채권 / 지역개발채권</strong>입니다.
            보유 시 만기에 원금 + 이자를 받지만, 대부분 <strong style={{ color: '#D97706' }}>즉시 매도(10~15% 할인)</strong>해서 실비용으로 처리합니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>지역</th>
                  <th style={headCell}>매입 비율</th>
                  <th style={headCell}>3,000만 원 차 즉시 매도 실비</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>서울</strong></td><td style={cell}>12%</td><td style={cell}>약 43만 원</td></tr>
                <tr><td style={cell}>인천·부산·대구·광주·대전·울산</td><td style={cell}>4%</td><td style={cell}>약 14만 원</td></tr>
                <tr><td style={cell}>경기·세종 등 광역</td><td style={cell}>6%</td><td style={cell}>약 22만 원</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 만기 5년 보유 시 약 10% 이자 회수 가능. 그러나 시중 금리가 낮아 즉시 매도가 보편적.
            본 도구는 즉시 매도 기준 실비용 표시.
          </p>
        </section>

        {/* 5. 유류세 */}
        <section>
          <h2 style={sectionTitle}>⛽ 유류세 — 주유할 때마다 내는 간접세</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            주유소 표시 가격에 이미 포함되어 있어 의식하기 어렵지만, <strong style={{ color: 'var(--text)' }}>휘발유 가격의 약 45%·경유 35%가 세금</strong>입니다.
            교통·에너지·환경세 + 교육세 + 주행세 + 부가가치세 4중 부과.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>연료</th>
                  <th style={headCell}>L당 세금</th>
                  <th style={headCell}>월 1,500km 주행 시 연간</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>⛽ 휘발유</td><td style={cell}>약 <strong style={{ color: '#D97706' }}>745원</strong></td><td style={cell}>1,500km × 12 ÷ 12km/L × 745 = 약 112만 원</td></tr>
                <tr><td style={cell}>🛢️ 경유</td><td style={cell}>약 <strong>528원</strong></td><td style={cell}>1,500km × 12 ÷ 14km/L × 528 = 약 68만 원</td></tr>
                <tr><td style={cell}>🟢 LPG</td><td style={cell}>약 230원</td><td style={cell}>대부분 영업용·택시</td></tr>
                <tr><td style={cell}>🔌 전기</td><td style={cell}><strong style={{ color: '#059669' }}>0원</strong></td><td style={cell}>유류세 면제 — 전기차 최대 장점</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 감면 제도 */}
        <section>
          <h2 style={sectionTitle}>🎁 감면 제도 정리</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { name: '⚡ 전기·수소차', desc: '취득세 140만원 한도 면제 + 자동차세 정액 13만원 + 유류세 0원', color: '#059669' },
              { name: '👨‍👩‍👧‍👦 다자녀 가구', desc: '18세 미만 자녀 3명+ 1대 → 취득세 한도 면제 (6인승↓ 140만·7인승↑ 200만)', color: '#FFD93E' },
              { name: '♿ 장애인 1~3급', desc: '본인 명의 1대 → 취득세·자동차세 전액 면제 (배기량 2000cc 이하)', color: '#0891B2' },
              { name: '🎖️ 국가유공자', desc: '본인 명의 1대 → 취득세·자동차세 전액 면제', color: '#B885DA' },
              { name: '🚙 경차 (1000cc↓)', desc: '취득세 4% (일반의 57% 수준) + 자동차세 cc당 80원 + 유류 면세 25만원', color: '#EA580C' },
              { name: '⏳ 12년 이상 보유', desc: '자동차세 최대 50% 감면 — 장기 보유 가성비 ↑', color: '#DC2626' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 14, color: b.color, fontWeight: 700, marginBottom: 6 }}>{b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 양도 안내 */}
        <section>
          <h2 style={sectionTitle}>💰 자동차 양도 — 양도소득세는 비과세</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
              개인이 사업 외 목적으로 사용한 자동차의 양도는 <strong style={{ color: '#059669' }}>양도소득세 비과세</strong>입니다 (소득세법 시행령 제162조).
              즉, 중고차 매도 시 차익이 있더라도 세금 신고·납부 없음.
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.9 }}>
              <li>양도 시 보유 일수 비례로 자동차세 자동 환급/환수</li>
              <li>등록세는 매수인 부담 (이전등록)</li>
              <li><strong>사업자·영업용 차량</strong>은 사업소득으로 신고 (부가세 환급분 회수 포함)</li>
              <li><strong>폐차</strong> 시 폐차보상금 가능 — 노후 경유차는 조기폐차 지원금 별도</li>
              <li><strong>증여·상속</strong>은 증여세·상속세 별도 (시가 기준)</li>
            </ul>
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 중고차도 취득세를 내나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>네, 매매가 기준 동일하게 7% (경차 4%)</strong>를 매수인이 납부합니다.
              단 신차 출고가가 아니라 <strong>매매가</strong> 기준이라 절대 금액은 줄어듭니다.
              <br /><br />
              예: 5년 된 쏘나타 1,500만 원에 매수 → 취득세 105만 원 + 공채 + 등록비.
              연식이 오래되어 자동차세는 이미 상당 % 감면된 상태로 인수.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 자동차세 연납은 언제 얼마 할인되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>1월에 일괄 납부 시 약 4.6% 할인</strong>됩니다 (2026년 공제율 5% × 잔여 11개월 기준).
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>1월: 약 4.6% (최대 할인)</li>
                <li>3월: 약 3.75%</li>
                <li>6월: 약 2.5%</li>
                <li>9월: 약 1.25%</li>
              </ul>
              연납 공제율은 과거 10%에서 5%로 단계 인하되었고, 향후 3%로 축소가 전망됩니다.
              위택스(wetax.go.kr) 또는 카드사 앱(삼성·신한 등)에서 자동이체 가능.
              <strong style={{ color: '#D97706' }}>주의</strong>: 연납 정책은 매년 일부 변경 — 최신은 위택스에서 확인.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 전기차 세금이 정말 일반차보다 많이 절약되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#059669' }}>네, 5년 기준 세금만 약 330만 원, 유류세까지 약 900만 원 절감</strong>됩니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>취득세</strong>: 140만원 한도 면제 (4,000만 원 차량 기준 280만→140만)</li>
                <li><strong>자동차세</strong>: 2000cc 가솔린 약 52만/년(본세 40만+교육세 12만) vs 전기차 13만/년 — 연 39만 차이</li>
                <li><strong>유류세</strong>: 연 1만 8천km 운행 시 휘발유 약 112만 원 vs 전기 0원</li>
                <li>5년 합산: 취득세 140 + 자동차세 39×5 + 유류세 112×5 = 약 <strong style={{ color: 'var(--accent)' }}>895만 원 절감</strong></li>
              </ul>
              단, 전기차 자체 가격이 비싸고 배터리 교체 비용(약 1,000~2,000만)은 고려해야 함.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 공채를 보유하는 게 이득인가요, 즉시 매도가 이득인가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>대부분의 경우 즉시 매도가 더 이득</strong>입니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>공채 표면 이자율 2~3% (5년 만기)</li>
                <li>시중 예금 금리 3~5% 수준에서 기회비용 ↑</li>
                <li>5년 후 받는 원금·이자보다, 즉시 매도 + 다른 곳 운용이 보통 이득</li>
                <li>단, 매도 시 약 10~15% 할인 — 이게 「실비용」으로 잡힘</li>
              </ul>
              부동산 매매 시 「국민주택채권」과 비슷한 구조.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 차량 명의를 부모님으로 하면 절세되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#EA580C' }}>제한적</strong>입니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>부모님이 65세 이상 + 본인 명의 자동차 없음 → 자동차세 50% 감면 (지방세법)</li>
                <li>부모님이 장애인·국가유공자 → 본인 명의 1대 전액 면제</li>
                <li>단 명의자가 운전·관리해야 하며, 위장 등록 적발 시 세금 추징 + 가산세</li>
                <li>보험료는 명의자 기준이라 운전자 한정 특약 잘못 설정 시 사고 시 보상 X</li>
              </ul>
              명의 절세는 합법 범위 내에서 신중히. <strong>※ 65세 이상 명의 50% 감면 등은 본 도구에서 자동 계산되지 않습니다</strong> — 감면 자격 항목은 다자녀·장애인·국가유공자만 반영.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 환경개선부담금은 누가 내나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>경유차 소유자</strong>만 납부합니다 (휘발유·LPG·전기차 X).
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>연 2회 (3월·9월) 부과</li>
                <li>차종·배기량·연식별 차등 — 평균 연 8~22만 원</li>
                <li>경차·하이브리드 경유차는 50% 감면</li>
                <li>저공해차 인증(3종 1·2급) → 일부 감면</li>
              </ul>
본 도구는 경유차 환경부담금 <strong>기본 정액만 반영</strong>합니다 — 위 경차·하이브리드 50%·저공해 인증 감면은 자동 계산되지 않습니다. 노후 경유차는 조기폐차 보조금(50~600만원) 활용 권장.
            </div>
          </details>
        </section>

        {/* 9. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/finance/car-cost" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🚗</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>자동차 유지비 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>유류·보험·감가 포함 연간 진짜 비용</div>
            </Link>
            <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자동차 할부·금리 비교</div>
            </Link>
            <Link href="/tools/finance/installment" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카드 할부 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일시불 vs 무이자 비교</div>
            </Link>
            <Link href="/tools/finance/freelance-tax" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💼</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>프리랜서 종소세</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>사업용 차량 경비 처리</div>
            </Link>
            <Link href="/tools/unit/fuel-economy" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⛽</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연비 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>km/L·mpg·전기차 전비</div>
            </Link>
            <Link href="/tools/unit/tire-pressure" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛞</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>타이어 공기압</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>psi·kPa·bar 변환</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
