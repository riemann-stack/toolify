import Link from 'next/link'
import CustomsClient from './CustomsClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/customs',
  title: '관부가세 계산기 — 미국 $200 · 30+ 품목 · 목록통관 자동',
  description: '미국·중국·유럽·일본 직구 면세 한도 자동 + 30+ 품목 관세율 + 부가세·개소세 자동 계산과 한국 백화점 가격 비교.',
  keywords: ['해외직구 관세', '관부가세 계산기', '미국 200달러 면세', '목록통관', '일반통관', '아마존 직구', '알리익스프레스 관세', '명품 직구', '노트북 무관세', '합산 과세'],
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

export default function CustomsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📦 관부가세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        미국·중국·유럽·일본 직구 면세 한도 + 30+ 품목 관세율. <strong style={{ color: 'var(--text)' }}>백화점 가격과 직접 비교</strong>.
      </p>

      <CustomsClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>출발 국가 선택</strong> — 미국 (200달러), 기타 (150달러)</li>
          <li><strong>품목 선택</strong> — 30+ 카테고리 (의류·신발·전자·노트북 등)</li>
          <li><strong>상품 가격·배송비·환율</strong> 입력</li>
          <li><strong>자가사용 vs 사업자</strong> 선택</li>
          <li><strong>결과 확인</strong> — 면세/과세 자동 판단 + 세금 + 최종가 + 한국 백화점 비교</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>품목별 관세 탭</strong>에서 30+ 품목 매트릭스 확인.
          <strong style={{ color: 'var(--accent)' }}> 시나리오 탭</strong>에서 아마존·알리 등 6 케이스 원클릭 자동.
        </p>
      </div>

      {/* 2. 목록통관 vs 일반통관 */}
      <h2 style={sectionTitle}>📋 목록통관 vs 일반통관 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #0D9488', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#0D9488', fontWeight: 700, margin: '0 0 6px' }}>✅ 목록통관 (Type C)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>관세·부가세 면제</strong><br />
              조건:<br />
              • 자가사용 (사업자 X)<br />
              • 한도 이하 ($200/$150)<br />
              • 21개 지정 품목<br />
              • 합산 과세 X (2일 내 분리)
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #DB2777', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 6px' }}>❌ 일반통관 (Type D)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>관세 + 부가세 부과</strong><br />
              조건:<br />
              • 한도 초과<br />
              • 21개 외 품목<br />
              • 사업자 직구<br />
              • 합산 과세 적용
            </p>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong>21개 목록통관 품목</strong>: 의류·신발·가방·소품·주얼리·시계·완구·문구·운동용품·화장품·생활용품·도서·CD·DVD·가공식품·영양제·악기·공구·전기제품·기타 잡화.
        </p>
      </div>

      {/* 3. 미국 vs 기타 */}
      <h2 style={sectionTitle}>🇺🇸 미국 $200 vs 🌏 기타 $150 면세</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>한미 FTA</strong>로 미국발 직구만 <strong>$200까지</strong> 면세 (다른 국가는 $150).
          이 차이는 미국 직구의 가장 큰 장점입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>국가</th>
                <th style={{ padding: '6px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>면세 한도</th>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>인기 사이트</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🇺🇸 미국',          '$200',  'Amazon · iHerb · eBay'],
                ['🇨🇳 중국·홍콩',     '$150',  'AliExpress · Temu'],
                ['🇪🇺 유럽',          '$150',  'Matchesfashion · Farfetch'],
                ['🇯🇵 일본',          '$150',  'Rakuten · Amazon JP'],
                ['🇬🇧 영국',          '$150',  'Selfridges · ASOS'],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '6px 0',
                      textAlign: j === 1 ? 'right' : 'left',
                      fontFamily: j === 1 ? 'Inter, system-ui, sans-serif' : 'Noto Sans KR, sans-serif',
                      color: j === 1 ? 'var(--accent)' : 'var(--text)',
                      fontWeight: j === 0 || j === 1 ? 700 : 500,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 품목별 관세율 */}
      <h2 style={sectionTitle}>📊 품목별 관세율 (의류 13% · 가방 8% · 도서 0%)</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '⭐ 무관세 (0%)', d: '노트북·태블릿·핸드폰·도서. 부가세 10%만 부과 (도서는 부가세도 면제).', c: '#0D9488' },
            { t: '👜 8%', d: '가방·핸드백·지갑·가죽 신발·시계·선글라스·전자제품·완구·운동용품.', c: '#D97706' },
            { t: '👕 13%', d: '의류 (편직·직물·니트·셔츠·바지·재킷)·운동화·유아 의류.', c: '#EA580C' },
            { t: '💄 6.5%', d: '화장품·헤어·바디 케어 (기초·립스틱·파운데이션 등).', c: '#0891B2' },
            { t: '🍷 15~36%', d: '와인 15% + 주세 30% / 치즈 36% / 일부 식품 8~30%.', c: '#DB2777' },
            { t: '⚠️ 200만원+ 개소세', d: '가방·시계·주얼리: 200만원 초과분에 개별소비세 20% 추가.', c: '#9B59B6' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 합산 과세 */}
      <h2 style={sectionTitle}>⚠️ 합산 과세 주의사항 (2일 내 같은 발송지)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>같은 사람·같은 발송지·2일 이내</strong> 도착하는 직구는 합산되어 면세 한도가 한 번만 적용됩니다.
          이를 모르고 한 번에 여러 건 주문하면 갑자기 과세 대상이 됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.85 }}>
            ❌ <strong>나쁜 예</strong>: 같은 날 미국 아마존에서 $150 + $80 주문 → 합산 $230 → 과세<br />
            ✅ <strong>좋은 예</strong>: 며칠 시간차로 분할 주문 → 도착일 분리 → 각각 면세<br />
            ✅ <strong>대안</strong>: 다른 사이트·다른 발송지로 분산 (eBay + Amazon)
          </p>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ <strong>배송 추적 일자</strong>가 기준이라 실제로는 배대지·국제배송 일정에 따라 변동 — 안전하게 1주일 간격 권장.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 미국 직구 200달러 넘으면 얼마 세금?</summary>
        <p style={faqAnswer}>
          예: 미국에서 운동화 250달러 (관세율 13%, 환율 1,400원):<br />
          • 과세가격 = 250 × 1,400 = <strong>350,000원</strong><br />
          • 관세 = 350,000 × 13% = <strong>45,500원</strong><br />
          • 부가세 = (350,000 + 45,500) × 10% = <strong>39,550원</strong><br />
          • 총 세금 = <strong>약 85,050원</strong><br />
          • 최종 = <strong>약 435,000원</strong> (직구가 + 25%)<br />
          무관세 품목(노트북·핸드폰)이라면 부가세만 10%로 35,000원만 부담.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 알리·테무는 왜 거의 무세금?</summary>
        <p style={faqAnswer}>
          중국 직구 면세 한도 $150 = 약 21만원. 알리·테무 대부분 상품이 <strong>저가($5~30)</strong>라
          한 건당 면세 한도에 한참 못 미칩니다.<br />
          • 1건 주문 = 보통 $20~50 = 면세<br />
          • 단 <strong>2일 내 여러 건 주문 시 합산</strong>으로 과세 위험<br />
          • 가구·가전 등 고가는 과세 (예: 청소기 $200 → 과세)<br />
          ⚠️ 최근 알리·테무 직구 폭증으로 관세청이 통관 강화 중 — 분할 주문 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 명품 가방 직구 vs 한국 면세점?</summary>
        <p style={faqAnswer}>
          유럽 명품 가방 €1,500 (약 225만원) 기준:<br />
          • <strong>직구 (Matchesfashion)</strong>: 225만 + 관세 8% (18만) + 부가세 (24.3만) + 개소세 (5만, 200만 초과분) = <strong>약 272만원</strong><br />
          • <strong>한국 백화점</strong>: 약 350~400만원<br />
          • <strong>한국 면세점</strong>: 약 240~280만원<br />
          → <strong>직구가 백화점 대비 30% 절감</strong>, 면세점과 비슷.<br />
          단 <strong>A/S·정품 인증</strong>은 백화점이 우월. 명품 직구는 정식 매장 영수증 보관 필수.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 노트북·핸드폰은 정말 무관세?</summary>
        <p style={faqAnswer}>
          네, <strong>관세 0%</strong>입니다 (HS Code 8471·8517 — 정보기술협정 ITA).<br />
          단 <strong>부가세 10%</strong>는 면제 X. 미국 면세 한도 $200을 초과하면:<br />
          • 노트북 $1,500 (약 210만) → 관세 0 + 부가세 21만 = 약 <strong>231만원</strong><br />
          • 한국 출시가 대비 보통 <strong>20~30% 절감</strong> (애플·아수스·델 등)<br />
          • A/S는 한국 공식 서비스센터에서 가능 (글로벌 워런티)<br />
          단 <strong>노트북 + 다른 품목 같이 주문</strong>은 합산 위험 — 노트북만 따로 주문 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 합산 과세란? (2일 내 같은 사람)</summary>
        <p style={faqAnswer}>
          <strong>같은 사람(수취인)·같은 발송지·2일 이내</strong> 도착하는 직구는 합산되어 면세 한도가 한 번만 적용됩니다.<br />
          예시:<br />
          • 같은 날 아마존에서 $150 + $80 주문 → 합산 $230 → <strong>과세</strong><br />
          • 1주일 시간차 주문 → 도착일 분리 → <strong>각각 면세</strong><br />
          기준은 <strong>국내 도착일</strong>이며 배대지·국제배송 일정에 따라 변동. 안전하게 1주일 간격 권장.
          관세청 통관시스템에서 자동 합산되므로 회피하기 어렵습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 분할 발송으로 면세 가능?</summary>
        <p style={faqAnswer}>
          가능하지만 주의 사항 多:<br />
          ✅ <strong>안전한 분할</strong>:<br />
          • 1주일 이상 시간차로 주문<br />
          • 다른 사이트·다른 발송지 활용 (eBay + Amazon)<br />
          • 가족 명의로 분산 (단, 명의 도용은 불법)<br /><br />
          ❌ <strong>위험한 분할</strong>:<br />
          • 같은 사이트에 같은 날 분할 주문<br />
          • 의도적 회피로 판단되면 <strong>관세 회피</strong>로 처벌 가능<br />
          • 통관 시스템이 자동 합산 — 적발 위험 ↑<br />
          ※ 면세 한도 회피보다는 <strong>한도 내 알찬 직구</strong>가 정답.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 사업자 직구는 면세 X?</summary>
        <p style={faqAnswer}>
          네, <strong>사업자 등록 명의 직구는 면세 한도 적용 X</strong>. 사업자는 자가사용이 아닌 영리 목적으로 보아
          무조건 일반통관 + 관세 + 부가세 부과.<br />
          • <strong>1인 자가사용</strong>: 면세 한도 적용<br />
          • <strong>사업자 직구</strong>: 한도 X, 모든 건 과세<br />
          • <strong>구매대행</strong>: 사업자가 대행하지만 명의는 본인 → 자가사용 면세 가능<br />
          단 자가사용 위장하여 판매·영리하면 관세 회피로 적발 시 가산세 + 형사처벌.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 자가사용 인정 기준?</summary>
        <p style={faqAnswer}>
          <strong>본인·가족이 사용</strong>한다고 신고하면 자가사용으로 인정. 단 다음은 의심 받음:<br />
          ⚠️ <strong>의심 사례</strong>:<br />
          • 같은 품목을 <strong>대량 주문</strong> (예: 신발 5켤레, 가방 3개)<br />
          • <strong>같은 사이즈·디자인 다수</strong><br />
          • <strong>전문 영업장 발송 주소</strong><br />
          • <strong>월 5회 이상 직구</strong><br /><br />
          ✅ <strong>안전 사례</strong>:<br />
          • 다양한 사이즈·색상<br />
          • 가족 선물·자기 사용 명목<br />
          • 월 1~3회 적정 빈도<br />
          판매 의심 시 <strong>구매 영수증 요구·세무조사</strong> 가능. 정직하게 자가사용으로만 활용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 통관 수수료는 얼마?</summary>
        <p style={faqAnswer}>
          • <strong>목록통관 (면세)</strong>: 통관 수수료 X (관세사 안 거침)<br />
          • <strong>일반통관 (과세)</strong>:<br />
            - 관세사 수수료 약 <strong>5,000~30,000원/건</strong> (가격·품목별)<br />
            - 큰 화물은 추가<br />
            - <strong>EMS·DHL·FedEx</strong>는 자체 통관 (포함된 경우 多)<br />
            - <strong>배대지(Shipster·Mall)</strong> 사용 시 별도 수수료 (kg당 5천~1만원)<br />
          본 도구의 계산은 통관 수수료 미포함 — 실제 결제 시 +5천~3만원 추가 예상.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 직구 vs 구매대행 차이?</summary>
        <p style={faqAnswer}>
          • <strong>직구 (직접 구매)</strong>:<br />
            - 본인이 해외 사이트에서 직접 결제<br />
            - 카드 해외 결제 + 영문 주소 입력<br />
            - <strong>가장 저렴</strong> (수수료 X)<br />
            - 영문 가능 + A/S 직접 처리 필요<br /><br />
          • <strong>구매대행</strong>:<br />
            - 한국 업체가 대신 주문·결제<br />
            - <strong>수수료 5~15%</strong> 추가<br />
            - A/S·반품 대행 가능<br />
            - 영문 어려운 사람·고가 직구에 유리<br /><br />
          • <strong>배대지 (배송대행지)</strong>:<br />
            - 미국·일본 등 현지 주소 빌리기<br />
            - 직접 주문 후 배대지로 발송<br />
            - <strong>국제배송 + 통관 대행</strong>만 (수수료 5천~2만원)<br />
            - 직구와 구매대행 중간 옵션
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/unit/size" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🛍️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외 직구 사이즈</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            US·EU·UK → 한국 의류·신발
          </p>
        </Link>
        <Link href="/tools/life/travel-budget" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 예산</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18 도시 × 3 스타일
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💰</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 + 6 항아리
          </p>
        </Link>
      </div>
    </div>
  )
}
