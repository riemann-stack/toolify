import Link from 'next/link'
import HolidayTableClient from './HolidayTableClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/cooking/holiday-table',
  title: '명절 상차림 계산기 — 설날·추석·제사 인원별 품목·비용 자동',
  description:
    '명절(설날·추석·제사) × 차례상·간소 차림·식사 위주 + 인원만 입력하면 떡국떡·갈비·전·나물·과일 등 50종 품목별 수량과 비용 자동 계산. KAMIS 실시간 시세 연동 + 5열 차례상 배치 가이드.',
  keywords: [
    '명절 상차림', '차례상', '제사상', '설날 차례', '추석 차례',
    '명절 비용', '제사 비용', '차례상 차림', '5열 차례상',
    '어동육서', '홍동백서', '조율이시', '명절 장보기', 'KAMIS 시세',
    '설날 떡국', '추석 송편', '제사 음식',
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

export default function HolidayTablePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍱 명절 상차림 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        설날·추석·제사 × 상 형식 + 인원만 입력하면 <strong style={{ color: 'var(--text)' }}>품목별 수량과 비용 자동</strong>. KAMIS 실시간 시세 연동 + 5열 차례상 배치 가이드.
      </p>

      <HolidayTableClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 명절·차례·제사 차이 */}
        <section>
          <h2 style={sectionTitle}>차례 vs 제사 vs 명절 식사 — 무엇이 다른가</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>구분</th>
                  <th style={headCell}>시기</th>
                  <th style={headCell}>대상</th>
                  <th style={headCell}>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong style={{ color: '#FFB83E' }}>차례</strong></td>
                  <td style={cell}>설날·추석 (양대 명절)</td>
                  <td style={cell}>4대조 이상 조상 통합</td>
                  <td style={cell}>간소한 5열 차림. 송편·떡국 필수</td>
                </tr>
                <tr>
                  <td style={cell}><strong style={{ color: '#FF6B6B' }}>제사 (기제사)</strong></td>
                  <td style={cell}>고인 기일 매년</td>
                  <td style={cell}>특정 조상 (4대까지)</td>
                  <td style={cell}>정식 5열 차례상. 메·갱·5탕 모두</td>
                </tr>
                <tr>
                  <td style={cell}><strong style={{ color: '#3EFF9B' }}>명절 식사</strong></td>
                  <td style={cell}>차례 직후 또는 별도</td>
                  <td style={cell}>가족 모임</td>
                  <td style={cell}>실용적 메뉴 — 떡국·갈비·잡채 등</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            본 도구는 <strong style={{ color: 'var(--text)' }}>3가지 모두 지원</strong> — 명절 선택 후 「차례상(정석)」 · 「간소 차림」 · 「식사 위주」 토글로 전환.
          </p>
        </section>

        {/* 2. 5열 차례상 원칙 */}
        <section>
          <h2 style={sectionTitle}>5열 차례상 — 4대 배치 원칙</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '어동육서 (魚東肉西)',  color: '#3EC8FF', desc: '동쪽에 어물(생선), 서쪽에 육류. 생선 머리는 동쪽, 꼬리는 서쪽 향함' },
              { name: '두동미서 (頭東尾西)',  color: '#3EFF9B', desc: '머리는 동쪽, 꼬리는 서쪽. 어물 배치의 세부 원칙' },
              { name: '홍동백서 (紅東白西)',  color: '#FF6B6B', desc: '동쪽에 붉은 과일(대추·사과), 서쪽에 흰 과일(배·곶감)' },
              { name: '조율이시 (棗栗梨柿)',  color: '#FFB83E', desc: '대추→밤→배→감(곶감) 순서로 좌→우 배치. 5열 과일 핵심' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 14, color: b.color, fontWeight: 700, marginBottom: 6 }}>{b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>유교 표준안 (성균관 차례상)</strong>: 최근에는 9~12종 간소 차림이 표준으로 권장됨.
            「조율이시」 등 전통 원칙은 따르되 음식 가짓수는 줄이는 추세.
          </p>
        </section>

        {/* 3. 명절별 핵심 음식 */}
        <section>
          <h2 style={sectionTitle}>명절별 필수 음식</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>🐲 설날 (음력 1.1)</p>
              <ul style={{ fontSize: 12.5, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>떡국</strong> 필수 — 흰떡 (장수·재산 상징)</li>
                <li>갈비찜 — 한우 사용 비중 높음</li>
                <li>전 3종 (동태·동그랑땡·호박)</li>
                <li>3색 나물·과일 (조율이시)</li>
                <li>식혜·청주·한과</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>🌕 추석 (음력 8.15)</p>
              <ul style={{ fontSize: 12.5, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>송편</strong> 필수 — 햇곡식의 의미</li>
                <li>토란국 — 추석 대표 국물</li>
                <li>햇과일 (햇사과·햇배·단감)</li>
                <li>갈비찜·전·3색 나물</li>
                <li>한과·식혜</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>🕯️ 제사 (기일)</p>
              <ul style={{ fontSize: 12.5, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>메·갱</strong> (밥·국) 위(位)별 1세트</li>
                <li>탕 3종 (육탕·소탕·어탕)</li>
                <li>적·전 (어동육서)</li>
                <li>3색 나물·3색 과일</li>
                <li>시루떡·청주·식혜</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. 가격 데이터·KAMIS */}
        <section>
          <h2 style={sectionTitle}>가격 데이터 — KAMIS 실시간 시세 연동</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 10px' }}>
              본 도구는 <strong style={{ color: '#FFB83E' }}>KAMIS(한국농수산식품유통공사)</strong> OpenAPI를 통해
              명절 핵심 농산물의 서울 소매 시세를 실시간 조회합니다.
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>실시간 연동 품목</strong>: 배추·무·사과·배·감·시금치·애호박·대파·마늘</li>
              <li><strong style={{ color: 'var(--text)' }}>폴백</strong>: API 키 미설정·실패 시 <strong>최근 명절 평균가</strong> 사용</li>
              <li><strong style={{ color: 'var(--text)' }}>캐싱</strong>: 1시간 단위로 호출 절약</li>
              <li><strong style={{ color: 'var(--text)' }}>가격 직접 수정</strong>: 각 품목 단가 옆 칸을 클릭하면 자유롭게 변경 — 마트 광고지 가격 적용 가능</li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.7 }}>
              ⚠️ 명절 1~2주 전부터 농산물 가격이 크게 오릅니다 (특히 시금치·사과·배). 「최신 시세」 버튼으로 현재 가격을 확인하고 비교하세요.
            </p>
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 4인 가족 설날 차례상 비용은 보통 얼마인가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>한국농수산식품유통공사(aT)</strong>가 매년 발표하는 4인 가족 설날 차례상 비용은
              최근 <strong style={{ color: 'var(--accent)' }}> 약 28~33만 원</strong> (전통 시장 기준), <strong>대형 마트 36~42만 원</strong> 정도로 형성됩니다.
              본 도구의 「설날 + 차례상 + 4인」 결과와 거의 일치합니다.
              간소 차림으로 가면 <strong>15~22만 원</strong>까지 줄일 수 있습니다 (가장 최신은 aT·KAMIS 공식 사이트 확인).
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 차례상에서 빼면 안 되는 음식은?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>전통적 필수</strong>:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>설날 — <strong>떡국</strong> (장수·재산 상징, 흰떡 사용)</li>
                <li>추석 — <strong>송편</strong> (햇곡식 의미)</li>
                <li>제사 — <strong>메·갱</strong> (밥·국), <strong>청주</strong></li>
                <li>3종 모두 — <strong>3색 과일</strong> (조율이시), <strong>3색 나물</strong> (시금치·도라지·고사리)</li>
              </ul>
              <strong style={{ color: '#FF8C3E' }}>주의</strong>: 최근 성균관에서도 「간소 차림 표준안」을 권장 — 가짓수보다 정성이 중요.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 명절 비용을 줄이는 가장 효과적인 방법은?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>명절 1~2주 전 장보기</strong> — 명절 가까울수록 가격 ↑ (특히 시금치·사과 30% 인상)</li>
                <li><strong style={{ color: 'var(--text)' }}>농협 하나로마트 명절 행사</strong> — 일반 마트 대비 10~20% 저렴</li>
                <li><strong style={{ color: 'var(--text)' }}>전통시장 + 농산물 직거래</strong> — 도매상 통하면 30% 절감</li>
                <li><strong style={{ color: 'var(--text)' }}>간소 차림 선택</strong> — 5열 정석 X. 9~12종 표준 차림으로 30~50% 절감</li>
                <li><strong style={{ color: 'var(--text)' }}>전 미리 부치기·냉동</strong> — 명절 직전 폭증 가격 회피</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 차례상에 올리면 안 되는 음식이 있나요?</summary>
            <div style={faqAnswer}>
              전통 금기 음식:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text)' }}>복숭아</strong> — 귀신을 쫓는 과일이라고 여겨짐</li>
                <li><strong style={{ color: 'var(--text)' }}>꽁치·삼치·갈치</strong> — 「치」자 들어가는 생선</li>
                <li><strong style={{ color: 'var(--text)' }}>고추·마늘 양념</strong> 강한 음식 — 산적·나물에 진한 양념 X (간장·참기름 위주)</li>
                <li><strong style={{ color: 'var(--text)' }}>붉은팥</strong> — 흰콩·녹두 사용 권장</li>
              </ul>
              본 도구의 음식 구성은 이 금기를 따릅니다. (지역·가문별 차이 있을 수 있음)
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 4인 가족 추석 차례상 vs 식사 위주 비용 차이?</summary>
            <div style={faqAnswer}>
              본 도구 기준 (4인 가족, 최근 시세):
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text)' }}>추석 차례상 (정석)</strong>: 약 35~45만 원</li>
                <li><strong style={{ color: 'var(--text)' }}>추석 간소 차림</strong>: 약 20~28만 원</li>
                <li><strong style={{ color: 'var(--text)' }}>추석 식사 위주</strong>: 약 15~20만 원</li>
              </ul>
              차이의 주된 원인: 차례상은 어동육서·조율이시 등 격식을 위해 다양한 종류를 소량씩 사야 해서 단위당 비용 ↑.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 본 도구의 데이터는 어디서 가져오나요?</summary>
            <div style={faqAnswer}>
              <ul style={{ paddingLeft: 18, marginTop: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>농산물 시세</strong>: KAMIS(한국농수산식품유통공사) OpenAPI — 일별 서울 소매가 평균</li>
                <li><strong style={{ color: 'var(--text)' }}>육류·수산·가공식품</strong>: 최근 시장 평균가 (마트·정육점 기준) 하드코딩</li>
                <li><strong style={{ color: 'var(--text)' }}>인당 권장량</strong>: 한식진흥원·성균관 차례상 표준안 + 한국식품과학회 자료 종합</li>
                <li><strong style={{ color: 'var(--text)' }}>저장</strong>: 본인 브라우저(localStorage)에만 — 서버 전송 X</li>
              </ul>
            </div>
          </details>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/kimjang" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥬</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>김장 양 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배추·양념 + KAMIS 연동</div>
            </Link>
            <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 분량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일상 식단·장보기</div>
            </Link>
            <Link href="/tools/cooking/recipe" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>레시피 비율 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>인분 자동 보정</div>
            </Link>
            <Link href="/tools/cooking/food-storage" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 보관 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>명절 후 남은 음식</div>
            </Link>
            <Link href="/tools/date/lunar" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🌙</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>음력 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>명절·제사 음력 날짜</div>
            </Link>
            <Link href="/tools/life/dutch" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍻</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>더치페이 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>형제·자매 분담</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
