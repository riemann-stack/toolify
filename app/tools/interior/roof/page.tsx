import Link from 'next/link'
import RoofClient from './RoofClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/roof',
  title: '지붕 면적 계산기 — 박공·모임·외쪽·평지붕·맞배 5가지 + 물매·처마·로스율',
  description: '박공·모임·외쪽·평지붕·맞배 5가지 + 물매·경사각·처마·로스율 → 평면·표면·자재 면적과 자재별 일반 단가.',
  keywords: ['지붕 면적 계산기', '박공지붕 면적', '모임지붕', '외쪽지붕', '평지붕 방수 면적', '슁글 면적', '기와 면적', '물매 계산', '지붕 경사각', '처마 길이', '옥상 방수'],
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

export default function RoofPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>주거·인테리어</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏠 지붕 면적 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        박공·모임·외쪽·평지붕·맞배 5가지 + 물매·처마·로스율 → <strong style={{ color: 'var(--text)' }}>자재 면적과 단가</strong>.
      </p>

      <RoofClient />

      {/* 1. 5가지 지붕 형태 비교 */}
      <h2 style={sectionTitle}>🔺 5가지 지붕 형태 비교</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>형태</th>
              <th style={headCell}>특징</th>
              <th style={headCell}>장점</th>
              <th style={headCell}>주 사용처</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>🔺 박공지붕</strong></td>
              <td style={cell}>두 사면 + 정삼각 능선</td>
              <td style={cell}>시공 단순·저렴</td>
              <td style={cell}>단독주택 (가장 흔함)</td>
            </tr>
            <tr>
              <td style={cell}><strong>🏔️ 모임지붕</strong></td>
              <td style={cell}>4사면 + 정점</td>
              <td style={cell}>풍압에 강함·외관 안정</td>
              <td style={cell}>전원주택·고급 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>📐 외쪽지붕</strong></td>
              <td style={cell}>한 사면만 경사</td>
              <td style={cell}>가장 단순·자재 절약</td>
              <td style={cell}>창고·증축·모던 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>🟦 평지붕</strong></td>
              <td style={cell}>거의 평면 (1~2물매)</td>
              <td style={cell}>옥상 활용 가능</td>
              <td style={cell}>아파트·옥탑·도심 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>🏯 맞배지붕</strong></td>
              <td style={cell}>박공 + 긴 처마</td>
              <td style={cell}>여름 그늘·전통미</td>
              <td style={cell}>한옥·전통 건축</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 물매 ↔ 경사각 변환 */}
      <h2 style={sectionTitle}>📏 물매 ↔ 경사각 변환표</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        한국 건축 표준 표기는 <strong style={{ color: 'var(--text)' }}>물매</strong> — 수평 10에 대한 수직 비율.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>물매</th>
              <th style={headCell}>경사각</th>
              <th style={headCell}>경사 배율 (자재 면적/평면)</th>
              <th style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: '1물매', d: '5.7°',  f: '×1.005', n: '거의 평면 — 방수 중요' },
              { m: '2물매', d: '11.3°', f: '×1.020', n: '저경사' },
              { m: '3물매', d: '16.7°', f: '×1.044', n: '일반 단독주택' },
              { m: '4물매', d: '21.8°', f: '×1.077', n: '표준' },
              { m: '5물매', d: '26.6°', f: '×1.118', n: '표준' },
              { m: '6물매', d: '31.0°', f: '×1.166', n: '적설 지역' },
              { m: '7물매', d: '35.0°', f: '×1.221', n: '한옥 평균' },
              { m: '8물매', d: '38.7°', f: '×1.281', n: '가파름' },
              { m: '10물매', d: '45.0°', f: '×1.414', n: '매우 가파름' },
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.m}</td>
                <td style={{ ...cell, fontFamily: 'Inter, system-ui, sans-serif' }}>{r.d}</td>
                <td style={{ ...cell, fontFamily: 'Inter, system-ui, sans-serif' }}>{r.f}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. 처마 표준 */}
      <h2 style={sectionTitle}>🏠 처마 길이 표준</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {[
          { len: '0~30cm', use: '최소 (모던 주택·창고)', color: '#0891B2' },
          { len: '60~90cm', use: '표준 (단독주택)', color: '#059669' },
          { len: '90cm~1.2m', use: '여유 (햇빛 차단·차양)', color: '#FFD93E' },
          { len: '1.2m+', use: '한옥·전통 (긴 처마)', color: '#EA580C' },
        ].map((p, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${p.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '15px', color: p.color, fontWeight: 700, marginBottom: '4px', fontFamily: 'Inter, system-ui, sans-serif' }}>{p.len}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{p.use}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7 }}>
        💡 처마는 단순 디자인이 아니라 <strong style={{ color: 'var(--text)' }}>여름 햇빛 차단·우수 처리·외벽 보호</strong> 역할. 한국 단독주택은 60~90cm가 표준.
      </p>

      {/* 4. 자재 일반 단가 */}
      <h2 style={sectionTitle}>💰 지붕재·방수재 일반 단가 가이드 (2026 기준 참고)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        ⚠️ 일반 가격 범위 — 실제 가격은 자재·지역·시즌·구매처별 ±30% 변동 가능. 정확한 가격은 <Link href="/tools/life/unit-price" style={{ color: 'var(--accent)' }}>단가 비교 계산기</Link>·실제 견적 확인.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>자재</th>
              <th style={headCell}>일반 단가 (원/㎡)</th>
              <th style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>🟫 아스팔트 슁글</td><td style={cell}>30,000~50,000</td><td style={cell}>가장 흔함·시공 단순·30년 보증</td></tr>
            <tr><td style={cell}>🟧 시멘트 기와</td><td style={cell}>25,000~45,000</td><td style={cell}>내구성 ↑·무거움</td></tr>
            <tr><td style={cell}>🟦 점토 기와</td><td style={cell}>50,000~100,000</td><td style={cell}>한옥 전통·자연 단열</td></tr>
            <tr><td style={cell}>⬜ 금속 패널 (강판)</td><td style={cell}>60,000~120,000</td><td style={cell}>경량·내구성 ↑·단열 약함</td></tr>
            <tr><td style={cell}>⚫ 폴리카보네이트</td><td style={cell}>30,000~70,000</td><td style={cell}>투명·베란다·테라스용</td></tr>
            <tr><td style={cell}>🌫️ 우레탄 도막 방수</td><td style={cell}>25,000~50,000</td><td style={cell}>평지붕 표준·5~10년 주기</td></tr>
            <tr><td style={cell}>🟧 시트 방수</td><td style={cell}>30,000~60,000</td><td style={cell}>내구성 ↑·시공 까다로움</td></tr>
            <tr><td style={cell}>⚫ 아스팔트 방수</td><td style={cell}>20,000~40,000</td><td style={cell}>저렴·냄새·환기 필수</td></tr>
          </tbody>
        </table>
      </div>

      {/* 5. 셀프 시공 vs 전문 시공 */}
      <h2 style={sectionTitle}>🛠️ 셀프 시공 vs 전문 시공 가이드</h2>
      <div style={{ background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '12px', padding: '18px 22px' }}>
        <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '10px' }}>⚠️ 지붕 작업은 고소작업 — 전문가 시공 강력 권장</p>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
          <li><strong>낙상 위험</strong>: 한국 산재 사망사고의 주요 원인 중 하나</li>
          <li><strong>방수 시공</strong>: 잘못하면 누수 → 구조물 손상·곰팡이</li>
          <li><strong>자재·도구</strong>: 안전벨트·헬멧·미끄럼 방지 신발 필수</li>
          <li><strong>날씨</strong>: 폭우·강풍·고온일 시 절대 작업 X</li>
          <li><strong>구조 안전</strong>: 적설량·풍하중 등은 구조기사 영역</li>
          <li>2층 이상·복잡한 형태는 반드시 전문 시공사 견적</li>
        </ul>
        <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '14px', lineHeight: 1.7, marginBottom: 0 }}>
          📞 응급: <strong style={{ color: '#D97706' }}>119</strong> · 한국건설기술연구원 · 대한건축사협회 · 가까운 건축사사무소
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 박공지붕과 맞배지붕 차이는?</summary>
        <div style={faqAnswer}>
          기본 형태는 비슷합니다 — 두 사면이 능선에서 만나는 삼각형 단면. 차이는 <strong style={{ color: 'var(--text)' }}>처마 길이와 디테일</strong>.
          박공은 짧은 처마·단순함, 맞배는 긴 처마·전통 디테일(서까래·기와)이 특징. 한옥은 거의 맞배.
          본 도구의 면적 계산은 두 형태 모두 동일 공식 (처마 길이만 다르게 입력).
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 물매가 뭔가요? 경사각과 어떻게 다른가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>물매 = 한국 건축 표준 표기</strong> — 수평 10에 대한 수직 비율. 예: 4물매 = 수평 10cm 가면 수직 4cm 올라감 = tan⁻¹(4/10) ≈ 21.8°.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>3물매 ≈ 16.7° (저경사 단독주택)</li>
            <li>4~5물매 ≈ 22~27° (표준)</li>
            <li>6물매+ ≈ 31°+ (적설 지역·한옥)</li>
          </ul>
          본 도구는 둘 다 지원 — 한쪽 입력하면 자동 변환.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 처마 길이는 어떻게 정하나요?</summary>
        <div style={faqAnswer}>
          한국 단독주택 표준 <strong style={{ color: 'var(--text)' }}>60~90cm</strong>. 짧으면(30cm 미만) 외벽이 비·햇빛에 직접 노출되고, 길면(1m+) 한옥·차양 효과. 4면이 다를 수 있어서(앞·뒤만 길고 좌·우는 짧음) 본 도구의 <strong>4면 개별 입력</strong> 옵션 사용 권장.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 로스율은 왜 포함해야 하나요?</summary>
        <div style={faqAnswer}>
          자재 시공 시 <strong style={{ color: 'var(--text)' }}>자투리·교체분·시공 손실</strong>이 발생. 일반적으로:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>5~10%: 단순 형태(외쪽·박공)·숙련 시공</li>
            <li>10~15%: 표준 (대부분 케이스)</li>
            <li>15~20%: 모임지붕·복잡 형태·복잡한 경사</li>
          </ul>
          부족하면 추가 주문(배송비 ↑) 또는 색상 차이 발생 가능. 약간 여유 있게 권장.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 옥상 방수 면적은 어떻게 계산하나요?</summary>
        <div style={faqAnswer}>
          평지붕 옥상은 거의 평면이므로 <strong style={{ color: 'var(--text)' }}>평면 면적과 표면 면적이 동일</strong>. 본 도구에서 형태=평지붕 선택 시 자동.
          <br /><br />
          단, 방수재는 벽체 측면도 일부 올려야 함(보통 30~50cm) — 정확한 견적은 시공사. 일반 우레탄 도막 방수는 25,000~50,000원/㎡.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 슁글 vs 기와 vs 금속 패널 — 어느 게 좋은가요?</summary>
        <div style={faqAnswer}>
          용도·예산·디자인 따라 다릅니다 (특정 추천 X — 본 도구는 일반 안내만):
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>아스팔트 슁글</strong>: 가장 흔함·저렴·시공 쉬움 (가성비)</li>
            <li><strong>시멘트/점토 기와</strong>: 무거움·내구성 ↑·전통 디자인</li>
            <li><strong>금속 패널</strong>: 경량·내구성 매우 ↑·모던 디자인·단열 약함</li>
          </ul>
          정확한 선택은 건축사·시공사와 상담. 본 도구는 면적 계산만.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 본 도구로 정확한 견적이 나오나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>일반 가이드 수준</strong>입니다. 실제 견적과 ±10~30% 차이 가능 — 이유:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>도면 vs 실측 차이 (±5~10%)</li>
            <li>자재 단가 ±30% (지역·시즌·구매처)</li>
            <li>인건비·운반비·부속자재 (별도)</li>
            <li>철거·기존 자재 처분 (별도)</li>
            <li>복잡한 형태(천창·돌출) 추가 비용</li>
          </ul>
          정확한 견적은 시공사 실측 후 견적서 받으세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 본 도구의 자재 단가는 어디 기준인가요?</summary>
        <div style={faqAnswer}>
          2026년 한국 일반 가격 범위 — <strong>특정 브랜드·매장 X · 일반 안내만</strong>. 광고법·정확성 회피.
          정확한 가격은 <Link href="/tools/life/unit-price" style={{ color: 'var(--accent)' }}>단가 비교 계산기</Link>·실제 견적 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 태양광 패널 설치 면적도 계산되나요?</summary>
        <div style={faqAnswer}>
          본 도구는 <strong style={{ color: 'var(--text)' }}>지붕 전체 면적</strong>만 계산. 태양광 패널 설치는:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>남향 면적만 활용 (북향은 비효율)</li>
            <li>경사·각도가 발전량에 영향 (별도 영역)</li>
            <li>인버터·배선·구조 보강 필요</li>
          </ul>
          정확한 발전량·시공은 태양광 전문업체·한국에너지공단 상담.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 셀프 시공 가능한가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#DC2626' }}>강력 비추천</strong>. 지붕 작업은 고소작업 — 한국 산재 사망사고 주요 원인. 안전벨트·헬멧·미끄럼 방지 신발 필수, 폭우·강풍·고온 시 작업 금지. 방수 시공 잘못하면 누수로 구조물 손상.
          <br /><br />
          단순 보수(슁글 한 장 교체 등)는 가능하지만 전체 시공은 전문 시공사 강력 권장. 가까운 건축사사무소·시공사 견적 받으세요. 응급 119.
        </div>
      </details>

      {/* 면책 */}
      <h2 style={sectionTitle}>⚠️ 면책 조항</h2>
      <div style={{
        background: 'rgba(217, 119, 6, 0.06)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 면적 계산 가이드</strong>입니다. 도면 vs 실측 ±5~10% 차이 가능.</li>
          <li>자재 단가는 일반 가격 범위 — 실제 ±30% 변동. 정확한 가격은 단가 비교·시공사 견적.</li>
          <li>본 도구는 <strong>특정 브랜드·시공사 추천 X · 구조 안전 보장 X · 시공 가이드 X · 태양광 발전량 X · 단열/방습 진단 X</strong>.</li>
          <li>⚠️ 지붕 작업은 고소작업 — 전문가 시공 강력 권장. 셀프 시공 시 안전벨트·헬멧 필수. 응급 <strong>119</strong>.</li>
          <li>도움: 한국건설기술연구원 · 대한건축사협회 · 가까운 건축사사무소·시공사 견적.</li>
        </ul>
      </div>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/interior/room-area" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>공간 면적 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>실내 벽·바닥·천장</div>
        </Link>
        <Link href="/tools/interior/paint" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎨</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>페인트 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>지붕 도장 시</div>
        </Link>
        <Link href="/tools/interior/wallpaper" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧱</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>도배 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>벽지 롤 수</div>
        </Link>
        <Link href="/tools/interior/flooring" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🪵</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>바닥재 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>장판·마루·타일</div>
        </Link>
        <Link href="/tools/interior/molding" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📏</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>몰딩 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>천장·바닥 몰딩</div>
        </Link>
        <Link href="/tools/life/unit-price" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏷️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단가 비교 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자재 가격 비교</div>
        </Link>
      </div>
    </div>
  )
}
