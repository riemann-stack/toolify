import Link from 'next/link'
import KimjangClient from './KimjangClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/cooking/kimjang',
  title: '김장 양 계산기 — 가족 수·기간별 배추 포기·재료·예상 비용 (KAMIS 시세)',
  description:
    '가족 수·소비 패턴·기간만 알려주면 배추 포기 수·고춧가루·마늘·젓갈·예상 비용 자동. KAMIS 실시간 시세 연동 + D-day 일정.',
  keywords: [
    '김장 양 계산기', '김장 재료 계산', '배추 포기 수', '김장 비용',
    '김장 양념', '김장 일정', 'KAMIS 시세', '김장철 배추 가격',
    '깍두기 만들기', '총각김치', '동치미', '파김치', '갓김치',
    '김치 보관', '김장 레시피', '한식진흥원 김장',
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

export default function KimjangPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥬 김장 양 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        가족 수·소비·기간만 알려주면 배추 포기·양념·비용 자동. <strong style={{ color: 'var(--text)' }}>KAMIS 실시간 시세 연동</strong>.
      </p>

      <KimjangClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 김장 양 계산 원리 */}
        <section>
          <h2 style={sectionTitle}>김장 양 계산 원리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구는 <strong style={{ color: 'var(--text)' }}>한국식품과학회·한식진흥원 표준 비율</strong>을 기반으로 계산합니다.
            핵심 가정:
          </p>
          <ul style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>배추 1포기</strong>: 절임 전 약 3kg → 절임 후 김치 약 2.5kg</li>
            <li><strong style={{ color: 'var(--text)' }}>한국인 평균 1일 김치 섭취</strong>: 성인 80g, 어린이 40g (보통 패턴)</li>
            <li><strong style={{ color: 'var(--text)' }}>4인 가족 1포기 ≈ 1주일 분량</strong> (잘 먹는 가정은 5~6일)</li>
            <li><strong style={{ color: 'var(--text)' }}>3개월 분량 4인 가족</strong>: 약 12~15포기 (소비 패턴별 변동)</li>
          </ul>
        </section>

        {/* 2. 배추 1포기당 표준 비율 */}
        <section>
          <h2 style={sectionTitle}>배추 1포기당 양념 표준 비율</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>재료</th>
                  <th style={headCell}>1포기당</th>
                  <th style={headCell}>4인 12포기</th>
                  <th style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>배추 (절임 전)</td><td style={cell}><strong>1포기 (≈3kg)</strong></td><td style={cell}>12포기 (≈36kg)</td><td style={cell}>속이 꽉 찬 가을 배추</td></tr>
                <tr><td style={cell}>무</td><td style={cell}>0.4개 (≈400g)</td><td style={cell}>5개</td><td style={cell}>채 썰어 양념에</td></tr>
                <tr><td style={cell}>고춧가루</td><td style={cell}><strong>100g</strong></td><td style={cell}>1.2kg (2근)</td><td style={cell}>햇고추 추천</td></tr>
                <tr><td style={cell}>다진 마늘</td><td style={cell}>60g</td><td style={cell}>720g</td><td style={cell}>국산 ↑</td></tr>
                <tr><td style={cell}>다진 생강</td><td style={cell}>15g</td><td style={cell}>180g</td><td style={cell}>너무 많으면 쓴맛</td></tr>
                <tr><td style={cell}>멸치액젓</td><td style={cell}>60ml</td><td style={cell}>720ml</td><td style={cell}>1.8L 1병 사면 1~2년</td></tr>
                <tr><td style={cell}>새우젓 (육젓)</td><td style={cell}>50g</td><td style={cell}>600g</td><td style={cell}>6월 육젓이 단맛</td></tr>
                <tr><td style={cell}>쪽파</td><td style={cell}>0.15단</td><td style={cell}>2단 (≈2kg)</td><td style={cell}>5cm로 자름</td></tr>
                <tr><td style={cell}>찹쌀가루 (풀)</td><td style={cell}>30g</td><td style={cell}>360g</td><td style={cell}>물 3배로 풀 끓임</td></tr>
                <tr><td style={cell}>굵은소금 (절임)</td><td style={cell}>300g</td><td style={cell}>3.6kg</td><td style={cell}>천일염 추천 (5kg 1포)</td></tr>
                <tr><td style={cell}>설탕</td><td style={cell}>10g</td><td style={cell}>120g</td><td style={cell}>매실청·배즙으로 대체 가능</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 지역·집안마다 비율 다름 (전라도 양념 많음·경상도 짜고 매움·강원도 담백). 본 도구는 서울·중부 평균.
          </p>
        </section>

        {/* 3. 농산물 가격 데이터 출처 */}
        <section>
          <h2 style={sectionTitle}>📊 가격 데이터 출처</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 10px' }}>
              본 도구는 <strong style={{ color: 'var(--accent)' }}>KAMIS(한국농수산식품유통공사)</strong> OpenAPI를 통해 농산물 소매 시세를 실시간 조회합니다.
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>실시간 데이터</strong>: 서울 소매가 일별 평균 (배추·무·고춧가루·마늘·생강·쪽파)</li>
              <li><strong style={{ color: 'var(--text)' }}>폴백</strong>: API 키 미설정·실패 시 <strong>최근 KAMIS 평균</strong> 사용</li>
              <li><strong style={{ color: 'var(--text)' }}>캐싱</strong>: 1시간 단위 캐시로 호출 최소화</li>
              <li><strong style={{ color: 'var(--text)' }}>가격 직접 수정</strong>: 각 재료 단가를 사용자가 자유롭게 변경 (마트 광고지 가격으로 교체 가능)</li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', marginBottom: 0, lineHeight: 1.7 }}>
              💡 KAMIS API 무료 신청: <a href="https://www.kamis.or.kr/customer/reference/openapi_list.do" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>kamis.or.kr/customer/reference/openapi_list.do</a> (1~2일 내 키 발급, 일 1만 회 제한)
            </p>
          </div>
        </section>

        {/* 4. 한국 김장 시기·트렌드 */}
        <section>
          <h2 style={sectionTitle}>한국 김장 시기 · 지역별 차이</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { region: '🗻 강원·경기 북부', date: '11월 중순', color: '#0891B2', tips: '일찍 추워서 짧게 절임. 담백한 맛' },
              { region: '🏙️ 서울·인천', date: '11월 말 ~ 12월 초', color: '#059669', tips: '표준 시기. 도매시장 가격 변동 큼' },
              { region: '🌾 충청·전북', date: '11월 말', color: '#D97706', tips: '양념 풍성. 젓갈·갈치속젓 활용' },
              { region: '🍊 전남·경남', date: '12월 초~중', color: '#EA580C', tips: '늦김장. 양념 많고 진함' },
              { region: '🌊 제주', date: '12월 중', color: '#B885DA', tips: '겨울도 따뜻. 단기 보관용' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '4px' }}>{b.region}</p>
                <p style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px', fontFamily: 'Inter, system-ui, sans-serif' }}>{b.date}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.tips}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 4인 가족 김장은 몇 포기가 적당한가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>3개월 분량 12~15포기</strong>가 표준입니다 (보통 소비 패턴 기준).
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>매끼 김치 잘 먹는 가정 + 김치찌개·볶음밥 활용 多 → 15~20포기</li>
                <li>김치 가끔 먹는 가정 → 6~10포기</li>
                <li>김장 1년치 (직장인 자취 + 부모님 보내기) → 25~40포기</li>
              </ul>
              본 도구의 「소비 패턴」으로 자동 조정.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 김장철 농산물 가격은 어떻게 확인하나요?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>KAMIS</strong> (kamis.or.kr) — 한국농수산식품유통공사 일일 소매·도매가</li>
                <li><strong style={{ color: 'var(--text)' }}>aT 농수산물 가격정보</strong> — 산지·도매·소매 추세</li>
                <li><strong style={{ color: 'var(--text)' }}>aT 김장 비용 발표</strong> — 매년 11월 초 4인 가족 평균 발표</li>
                <li><strong style={{ color: 'var(--text)' }}>전통시장 · 마트 광고지</strong> — 실구매가는 더 저렴 (특히 농협 하나로마트 김장 행사)</li>
              </ul>
              본 도구는 KAMIS 자동 연동 — 「↻ 최신 시세」 버튼으로 갱신.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 김장 비용을 줄이는 팁이 있나요?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>김장철 직전 (10월 말)</strong>: 배추·무 가격이 평년보다 안정. 11월 첫째 주가 보통 최저점</li>
                <li><strong style={{ color: 'var(--text)' }}>농협 하나로마트 김장 행사</strong>: 11월 한 달 진행. 일반 마트 대비 10~20% 저렴</li>
                <li><strong style={{ color: 'var(--text)' }}>전통시장 + 농산물 직거래</strong>: 도매상 통하면 30% 절감</li>
                <li><strong style={{ color: 'var(--text)' }}>주말 알뜰장</strong>: 시·구청 주최 김장 알뜰장 (서울 마포구·강서구 등)</li>
                <li><strong style={{ color: 'var(--text)' }}>이웃·친구와 공동 구매</strong>: 마늘 1접·고춧가루 1박스 분할</li>
                <li><strong style={{ color: 'var(--text)' }}>가족 김장 모임</strong>: 노동력 분담 + 양념 한 번에</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 김장 김치는 얼마나 보관되나요?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>김치냉장고 0~3℃</strong>: 6~12개월 (가장 권장)</li>
                <li><strong style={{ color: 'var(--text)' }}>일반 냉장고 4℃</strong>: 2~3개월 (점점 시어짐)</li>
                <li><strong style={{ color: 'var(--text)' }}>실온</strong>: 1~3일 (이후 빠르게 익음)</li>
              </ul>
              김치냉장고 없으면 12월~2월 베란다 보관도 가능 (영하 5℃ 이상 유지).
              너무 익은 김치는 김치찌개·볶음밥·만두소·김치전 활용 — <Link href="/tools/cooking/recipe" style={{ color: 'var(--accent)' }}>레시피 비율 계산기</Link>로 응용.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 김장이 처음인데 실패 안 하려면?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>첫해는 4~6포기로 소량 시작</strong> — 본 도구 결과의 절반으로 시도</li>
                <li><strong style={{ color: 'var(--text)' }}>절임이 70%</strong> — 짠맛 부족하면 양념 빠짐, 너무 짜면 못 먹음. 4~6시간 + 중간 뒤집기 + 배추 잎이 휘면 됨</li>
                <li><strong style={{ color: 'var(--text)' }}>양념은 미리 만들어 1~3시간 숙성</strong> — 따로 두면 맛이 어우러짐</li>
                <li><strong style={{ color: 'var(--text)' }}>버무릴 때 위생 장갑 + 큰 다라이</strong> — 손맛은 위생적으로</li>
                <li><strong style={{ color: 'var(--text)' }}>김치통은 80%만</strong> — 발효 가스로 부풀음. 가득 채우면 흘러넘침</li>
                <li><strong style={{ color: 'var(--text)' }}>실온 1~2일 후 김냉</strong> — 발효 시작 시점에 옮김</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 본 도구의 가격이 우리 동네와 다른데요?</summary>
            <div style={faqAnswer}>
              KAMIS는 서울 소매가 평균이라 지역별 차이가 있습니다. 각 재료의 단가 칸을 직접 클릭해서
              마트 광고지·전통시장 가격으로 수정 가능 — 총액이 자동 재계산됩니다.
              <br /><br />
              지역 차이 일반 경향:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>서울·수도권: 평균 또는 +5~10%</li>
                <li>지방 도시: 평균 -5~15%</li>
                <li>도서·산간: +10~20%</li>
                <li>농산물 산지 (전남·경북): -20~30%</li>
              </ul>
            </div>
          </details>
        </section>

        {/* 6. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/recipe" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>레시피 비율 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>김치찌개·김치전 등 응용</div>
            </Link>
            <Link href="/tools/cooking/food-storage" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 보관 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>김치·발효식품 보관</div>
            </Link>
            <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 분량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>장보기 합산</div>
            </Link>
            <Link href="/tools/cooking/baker-percent" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥖</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>베이커 퍼센트</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>비율 기반 레시피</div>
            </Link>
            <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>없는 재료 대체</div>
            </Link>
            <Link href="/tools/finance/cost-rate" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>음식점 원가율</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>식당 운영 시</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
