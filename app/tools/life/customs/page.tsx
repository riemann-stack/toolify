import Link from 'next/link'
import CustomsClient from './CustomsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/life/customs',
  title: '관부가세 계산기 — 미국 $200 · 29개 품목 · 목록통관 자동',
  description: '미국·중국·유럽·일본 직구 간이 예상세액 — 면세 한도(물품가격 기준) 자동 판정 + 29개 품목 관세율 + 부가세·개소세·교육세·주세 계산. HS코드·원산지·FTA 미반영 참고용.',
  keywords: ['해외직구 관세', '관부가세 계산기', '미국 200달러 면세', '목록통관', '일반통관', '아마존 직구', '알리익스프레스 관세', '명품 직구', '노트북 무관세', '합산 과세'],
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

const FAQ_LD = [
  { "q":"미국 직구 200달러 넘으면 얼마 세금?","a":"예: 미국에서 운동화 250달러 (관세율 13%, 환율 1,400원): • 과세가격 = 250 × 1,400 = 350,000원 • 관세 = 350,000 × 13% = 45,500원 • 부가세 = (350,000 + 45,500) × 10% = 39,550원 • 총 세금 = 약 85,050원 • 최종 = 약 435,000원 (직구가 + 25%) 무관세 품목(노트북·핸드폰)이라면 부가세만 10%로 35,000원만 부담." },
  { "q":"알리·테무는 왜 거의 무세금?","a":"중국 직구 면세 한도 $150 = 약 21만원. 알리·테무 대부분 상품이 저가($5~30)라 한 건당 면세 한도에 한참 못 미칩니다. • 1건 주문 = 보통 $20~50 = 면세 • 단 같은 날 같은 쇼핑몰에서 여러 건 구매 시 합산되어 과세될 수 있음 • 가구·가전 등 고가는 과세 (예: 청소기 $200 → 과세) ⚠️ 최근 알리·테무 직구 폭증으로 관세청이 통관·검사를 강화하는 추세. 면세 한도를 노린 인위적 분산 구매는 권장하지 않으며, 정확한 현행 기준은 관세청 해외직구 안내를 확인하세요." },
  { "q":"명품 가방 직구 vs 한국 면세점?","a":"유럽 명품 가방 €1,500 (약 225만원) 기준: • 직구 (Matchesfashion): 225만 + 관세 8% (약 18만) + 개소세·교육세 (약 11만, 200만 초과분 20% + 교육세 30%) + 부가세 (약 25만) = 약 280만원 • 한국 백화점: 약 350~400만원 • 한국 면세점: 약 240~280만원 → 직구가 백화점 대비 약 25~30% 절감, 면세점과 비슷. 단 A/S·정품 인증은 백화점이 우월. 명품 직구는 정식 매장 영수증 보관 필수." },
  { "q":"노트북·핸드폰은 정말 무관세?","a":"네, 관세 0%입니다 (HS Code 8471·8517 — 정보기술협정 ITA). 단 부가세 10%는 면제 X. 미국 면세 한도 $200을 초과하면: • 노트북 $1,500 (약 210만) → 관세 0 + 부가세 21만 = 약 231만원 • 한국 출시가 대비 보통 20~30% 절감 (애플·아수스·델 등) • A/S는 한국 공식 서비스센터에서 가능 (글로벌 워런티) ※ 같은 날 같은 쇼핑몰에서 다른 품목과 함께 구매하면 합산되어 한도를 넘길 수 있습니다." },
  { "q":"합산 과세란? (현행 기준)","a":"같은 날, 같은 해외 판매자(쇼핑몰)에서 구매한 여러 건은 합산되어 면세 한도가 한 번만 적용됩니다. 예: 같은 날 같은 쇼핑몰에서 $150 + $80 구매 → 합산 $230 → 과세. 반면 서로 다른 날 또는 다른 판매처에서 구매한 물품은 같은 날 통관(입항)되어도 원칙적으로 합산하지 않습니다. 과거의 '같은 발송지·2일 이내 입항' 기준은 현행과 다릅니다. 면세 한도를 노린 가족 명의·발송지 분산 등 인위적 회피는 권장하지 않으며 명의 도용은 불법입니다. 정확한 현행 기준은 관세청 해외직구 안내를 확인하세요." },
  { "q":"여러 건 살 때 합산되나요?","a":"합산은 '같은 날, 같은 판매자(쇼핑몰)' 구매분에만 적용됩니다. 서로 다른 날 또는 다른 판매처에서 구매하면 같은 날 입항해도 원칙적으로 합산하지 않으므로, 일정·쇼핑몰이 자연스럽게 다르면 각각 한도가 적용됩니다. 다만 면세 한도를 노린 '가족 명의 분산·발송지 쪼개기' 같은 인위적 회피는 권장하지 않으며, 명의 도용은 불법이고 자가사용 위장이 적발되면 가산세·처벌 대상입니다. 정확한 현행 기준은 관세청 해외직구 안내를 참고하세요." },
  { "q":"사업자 직구는 면세 X?","a":"네, 사업자 등록 명의 직구는 면세 한도 적용 X. 사업자는 자가사용이 아닌 영리 목적으로 보아 무조건 일반통관 + 관세 + 부가세 부과. • 1인 자가사용: 면세 한도 적용 • 사업자 직구: 한도 X, 모든 건 과세 • 구매대행: 사업자가 대행하지만 명의는 본인 → 자가사용 면세 가능 단 자가사용 위장하여 판매·영리하면 관세 회피로 적발 시 가산세 + 형사처벌." },
  { "q":"자가사용 인정 기준?","a":"본인·가족이 사용한다고 신고하면 자가사용으로 인정. 단 다음은 의심 받음: ⚠️ 의심 사례: • 같은 품목을 대량 주문 (예: 신발 5켤레, 가방 3개) • 같은 사이즈·디자인 다수 • 전문 영업장 발송 주소 • 월 5회 이상 직구 ✅ 안전 사례: • 다양한 사이즈·색상 • 가족 선물·자기 사용 명목 • 월 1~3회 적정 빈도 판매 의심 시 구매 영수증 요구·세무조사 가능. 정직하게 자가사용으로만 활용." },
  { "q":"통관 수수료는 얼마?","a":"• 목록통관 (면세): 통관 수수료 X (관세사 안 거침) • 일반통관 (과세): - 관세사 수수료 약 5,000~30,000원/건 (가격·품목별) - 큰 화물은 추가 - EMS·DHL·FedEx는 자체 통관 (포함된 경우 多) - 배대지(몰테일·아이포터 등) 사용 시 별도 수수료 (kg당 5천~1만원) 본 도구의 계산은 통관 수수료 미포함 — 실제 결제 시 +5천~3만원 추가 예상." },
  { "q":"직구 vs 구매대행 차이?","a":"• 직구 (직접 구매): - 본인이 해외 사이트에서 직접 결제 - 카드 해외 결제 + 영문 주소 입력 - 가장 저렴 (수수료 X) - 영문 가능 + A/S 직접 처리 필요 • 구매대행: - 한국 업체가 대신 주문·결제 - 수수료 5~15% 추가 - A/S·반품 대행 가능 - 영문 어려운 사람·고가 직구에 유리 • 배대지 (배송대행지): - 미국·일본 등 현지 주소 빌리기 - 직접 주문 후 배대지로 발송 - 국제배송 + 통관 대행만 (수수료 5천~2만원) - 직구와 구매대행 중간 옵션" }
]

export default function CustomsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="life" />관부가세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        미국·중국·유럽·일본 직구 면세 한도(물품가격 기준) + 29개 품목 관세율·부가세·개소세·주세. <strong style={{ color: 'var(--text)' }}>간이 예상세액</strong> (HS·원산지·FTA 미반영).
      </p>

      <CustomsClient />

      <GuideDivider />

      {/* 공식 출처 · 기준일 */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginTop: 28, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Noto Sans KR, sans-serif' }}>📌 공식 출처 · 기준일</p>
        <p style={{ margin: 0 }}>
          본 도구는 <strong style={{ color: 'var(--text)' }}>간이 예상세액</strong>으로 HS코드·원산지·FTA·개별 규정이 반영되지 않습니다.
          실제 세액·면세·합산·통관 가능 여부는 아래 관세청 공식 자료로 확인하세요.
        </p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          <li><a href="https://www.customs.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>관세청 (customs.go.kr) — 해외직구·합산과세 안내</a></li>
          <li><a href="https://unipass.customs.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>관세청 UNI-PASS (unipass.customs.go.kr) — 예상세액 조회</a></li>
        </ul>
        <p style={{ margin: '8px 0 0', fontSize: 12 }}>
          기준일: <strong style={{ color: 'var(--text)' }}>2026년 6월</strong> · 마지막 검토: <strong style={{ color: 'var(--text)' }}>2026-06-07</strong> · 관세·면세·합산 제도는 수시로 바뀌므로 통관 전 공식 출처를 확인하세요.
        </p>
      </div>

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>출발 국가 선택</strong> — 미국 (200달러), 기타 (150달러)</li>
          <li><strong>품목 선택</strong> — 29개 카테고리 (의류·신발·전자·노트북 등)</li>
          <li><strong>상품 가격·배송비·환율</strong> 입력</li>
          <li><strong>자가사용 vs 사업자</strong> 선택</li>
          <li><strong>결과 확인</strong> — 면세/과세 자동 판단 + 관세·부가세·개소세·주세 간이 예상세액 + 예상 결제액</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>품목별 관세 탭</strong>에서 29개 품목 매트릭스 확인.
          <strong style={{ color: 'var(--accent)' }}> 시나리오 탭</strong>에서 아마존·알리 등 6 케이스 원클릭 자동.
        </p>
      </div>

      {/* 2. 목록통관 vs 일반통관 */}
      <h2 style={sectionTitle}>📋 목록통관 vs 일반통관 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #0D9488', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#0D9488', fontWeight: 700, margin: '0 0 6px' }}>✅ 목록통관 (간이 절차)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>관세·부가세 면제</strong><br />
              조건:<br />
              • 자가사용 (사업자 X)<br />
              • 물품가격 한도 이하 ($200/$150)<br />
              • 목록통관 가능 품목 (배제대상 아님)
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #DB2777', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 6px' }}>❌ 일반(수입)신고</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>정식 신고 후 통관</strong><br />
              사유:<br />
              • 한도 초과 또는 사업자<br />
              • 목록통관 배제대상 (의약품·검역·주류 등)<br />
              • 단, 배제대상도 소액·자가사용이면 관·부가세 면제 가능 (주류·담배 제외)
            </p>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 목록통관은 <strong>&lsquo;21개 허용 지정&rsquo;</strong> 방식이 아니라 <strong>배제대상만 관리</strong>하는 방식입니다. 대부분의 자가사용 소비재(의류·신발·전자·화장품 등)는 목록통관 가능하고, <strong>의약품·건강기능식품·의료기기·검역대상 식품/동식물·주류·담배</strong> 등만 배제되어 일반신고합니다.
        </p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ <strong style={{ color: 'var(--text)' }}>소액면세(물품가격 $150·미국 $200 이하)는 통관 절차와 별개</strong>입니다. 배제대상 품목(예: 일부 식품)도 자가사용·한도 이하면 관·부가세는 면제될 수 있고, 단지 <strong>일반(간이)신고</strong> 절차를 거칩니다. 반면 <strong>주류·담배 등은 한도와 무관하게 과세</strong>됩니다. 면세 한도는 운임·보험료를 <strong>제외한 물품가격</strong> 기준입니다.
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
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>국가</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>면세 한도</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>인기 사이트</th>
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
                      fontFamily: j === 1 ? 'Inter, "Noto Sans KR", system-ui, sans-serif' : 'Noto Sans KR, sans-serif',
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
            { t: '⚠️ 200만원+ 개소세', d: '가방·시계·주얼리: (과세가격+관세) 200만원 초과분에 개별소비세 20% + 교육세(개소세의 30%) 추가.', c: '#9B59B6' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 합산 과세 */}
      <h2 style={sectionTitle}>⚠️ 합산 과세 기준 (현행)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>같은 날, 같은 해외 판매자(쇼핑몰)</strong>에서 구매한 여러 건은 합산되어 면세 한도가 한 번만 적용됩니다.
          반면 <strong>서로 다른 날 또는 다른 판매처</strong>에서 구매한 물품은 같은 날 통관(입항)되어도 원칙적으로 합산하지 않습니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.85 }}>
            • 같은 날 같은 쇼핑몰에서 $150 + $80 구매 → 합산 $230 → <strong>과세</strong><br />
            • 다른 날 또는 다른 판매처 구매 → 같은 날 입항해도 원칙적으로 <strong>각각 한도 적용</strong>
          </p>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 과거의 <strong>&ldquo;같은 발송지·2일 이내 입항&rdquo;</strong> 기준은 현행과 다릅니다. 면세 한도를 노린 가족 명의·발송지 분산 등 인위적 회피는 권장하지 않으며, 명의 도용은 불법입니다. 정확한 현행 기준은 아래 <strong>관세청 공식 출처</strong>를 확인하세요.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

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
          • 단 <strong>같은 날, 같은 쇼핑몰에서 여러 건 구매 시 합산</strong>되어 과세될 수 있음<br />
          • 가구·가전 등 고가는 과세 (예: 청소기 $200 → 과세)<br />
          ⚠️ 최근 알리·테무 직구 폭증으로 관세청이 통관·검사를 강화하는 추세입니다.
          면세 한도를 노린 인위적 분산 구매는 권장하지 않으며, 정확한 현행 기준은 관세청 해외직구 안내를 확인하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 명품 가방 직구 vs 한국 면세점?</summary>
        <p style={faqAnswer}>
          유럽 명품 가방 €1,500 (약 225만원) 기준:<br />
          • <strong>직구 (Matchesfashion)</strong>: 225만 + 관세 8% (약 18만) + 개소세·교육세 (약 11만, 200만 초과분 20% + 교육세 30%) + 부가세 (약 25만) = <strong>약 280만원</strong><br />
          • <strong>한국 백화점</strong>: 약 350~400만원<br />
          • <strong>한국 면세점</strong>: 약 240~280만원<br />
          → <strong>직구가 백화점 대비 약 25~30% 절감</strong>, 면세점과 비슷.<br />
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
          ※ <strong>같은 날 같은 쇼핑몰</strong>에서 다른 품목과 함께 구매하면 합산되어 한도를 넘길 수 있습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 합산 과세란? (현행 기준)</summary>
        <p style={faqAnswer}>
          <strong>같은 날, 같은 해외 판매자(쇼핑몰)</strong>에서 구매한 여러 건은 합산되어 면세 한도가 한 번만 적용됩니다.<br />
          • 같은 날 같은 쇼핑몰에서 $150 + $80 구매 → 합산 $230 → <strong>과세</strong><br />
          • <strong>다른 날 또는 다른 판매처</strong> 구매 → 같은 날 입항해도 원칙적으로 <strong>합산 안 함</strong><br />
          ※ 과거의 <strong>&ldquo;같은 발송지·2일 이내 입항&rdquo;</strong> 기준은 현행과 다릅니다. 정확한 현행 기준은 관세청 해외직구 안내를 확인하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 여러 건 살 때 합산되나요?</summary>
        <p style={faqAnswer}>
          합산은 <strong>&ldquo;같은 날·같은 판매자&rdquo;</strong> 구매분에만 적용됩니다. 서로 다른 날 또는 다른 판매처에서 구매하면
          같은 날 입항해도 원칙적으로 합산하지 않으므로, 일정·쇼핑몰이 자연스럽게 다르면 각각 한도가 적용됩니다.<br /><br />
          다만 면세 한도를 노린 <strong>가족 명의 분산·발송지 쪼개기</strong> 같은 인위적 회피는 권장하지 않습니다.
          명의 도용은 불법이고, 자가사용 위장이 적발되면 <strong>가산세·처벌</strong> 대상입니다.
          정확한 현행 기준은 관세청 해외직구 안내를 참고하세요.
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
            - <strong>배대지(몰테일·아이포터 등)</strong> 사용 시 별도 수수료 (kg당 5천~1만원)<br />
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
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
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
