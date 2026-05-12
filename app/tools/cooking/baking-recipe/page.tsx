import Link from 'next/link'
import BakingRecipeClient from './BakingRecipeClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/baking-recipe',
  title: '베이킹 레시피 계산기 — 마들렌·파운드·쿠키·머핀 비율·분량 변환',
  description: '마들렌·파운드케이크·쿠키·머핀·마카롱·스콘·휘낭시에·카스테라·브라우니·커스터드 10종 제과 비율 자동 환산. 비율 진단·식감 보정·틀 용량 기준 분량 변환·인기 레시피 프리셋 17종.',
  keywords: ['베이킹 레시피 계산기', '마들렌 황금비율', '파운드케이크 1:1:1:1', '쿠키 비율', '머핀 비율', '마카롱 비율', '제과 비율', '베이킹 분량 변환', '베이킹 비율 진단', '홈베이킹 계산기'],
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

export default function BakingRecipePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧁 베이킹 레시피 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        마들렌·파운드·쿠키·머핀·마카롱 등 제과 레시피를 품목별 기준 재료 100%로 자동 환산. 비율 진단·식감 보정·틀 용량 기준 분량 변환까지.
      </p>

      <BakingRecipeClient />

      {/* 1. 품목별 황금비율 가이드 */}
      <h2 style={sectionTitle}>📐 품목별 황금비율 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        제과는 품목마다 기준 재료가 다릅니다. 빵은 밀가루 100%(베이커 퍼센트)지만, 마들렌은 계란 100%, 파운드는 버터 100%처럼 직관적인 기준을 사용합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>품목</th>
              <th style={headCell}>기준</th>
              <th style={headCell}>황금비율</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>🐚 마들렌</td><td style={cell}>계란 100%</td><td style={cell}>설탕·밀가루·버터 = 1:1:1:1 + BP 3% + 꿀 10%</td></tr>
            <tr><td style={cell}>🍰 파운드케이크</td><td style={cell}>버터 100%</td><td style={cell}>설탕·계란·밀가루 = 1:1:1:1 + BP 2%</td></tr>
            <tr><td style={cell}>🍪 쿠키</td><td style={cell}>밀가루 100%</td><td style={cell}>버터 50~80%, 설탕 60~90%, 계란 30%</td></tr>
            <tr><td style={cell}>🧁 머핀</td><td style={cell}>밀가루 100%</td><td style={cell}>설탕 70%, 우유 80%, 오일 50%, 계란 50%, BP 4%</td></tr>
            <tr><td style={cell}>🥮 마카롱</td><td style={cell}>흰자 100%</td><td style={cell}>아몬드가루·슈가파우더 130%, 설탕 100%</td></tr>
            <tr><td style={cell}>🥐 스콘</td><td style={cell}>밀가루 100%</td><td style={cell}>버터 25~50%, 설탕 15%, 우유 50%, BP 4%</td></tr>
            <tr><td style={cell}>🟫 휘낭시에</td><td style={cell}>흰자 100%</td><td style={cell}>아몬드 80%, 슈가파우더 100%, 브라운버터 90%</td></tr>
            <tr><td style={cell}>🟨 카스테라</td><td style={cell}>계란 100%</td><td style={cell}>설탕 70%, 강력분 45%, 꿀 15%, 미즈아메 5%</td></tr>
            <tr><td style={cell}>🍫 브라우니</td><td style={cell}>초콜릿 100%</td><td style={cell}>버터 100%, 설탕 100%, 계란 50%, 밀가루 30~50%</td></tr>
            <tr><td style={cell}>🍮 커스터드</td><td style={cell}>우유 100%</td><td style={cell}>노른자 15%, 설탕 20%, 옥수수전분 6%</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구는 품목 선택만으로 위 황금비율을 자동 입력합니다. 슬라이더로 식감을 즉시 조정할 수도 있어요.
      </p>

      {/* 2. 비율 진단 가이드 */}
      <h2 style={sectionTitle}>🔍 비율 진단 가이드 — 어떤 재료가 어떤 식감을 만드나</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        같은 품목이라도 비율이 5~10%만 달라져도 식감이 크게 바뀝니다. 본 도구의 &ldquo;비율 진단&rdquo; 탭은 입력값을 분석해 식감과 풍미를 미리 예측합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>재료</th>
              <th style={headCell}>↑ 많아질 때</th>
              <th style={headCell}>↓ 적어질 때</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>설탕</strong></td><td style={cell}>단맛 ↑ · 갈변 빠름 · 퍼짐 ↑</td><td style={cell}>식감 푸석 · 보존성 ↓</td></tr>
            <tr><td style={cell}><strong>버터</strong></td><td style={cell}>풍미 ↑ · 식감 묵직 · (쿠키) 퍼짐 ↑</td><td style={cell}>식감 가벼움 · 풍미 ↓</td></tr>
            <tr><td style={cell}><strong>밀가루</strong></td><td style={cell}>구조 ↑ · 푸석 가능</td><td style={cell}>fudgy/촉촉 · 무너지기 쉬움</td></tr>
            <tr><td style={cell}><strong>계란</strong></td><td style={cell}>부풀기 ↑ · 단단함</td><td style={cell}>식감 무너짐 · 결합력 ↓</td></tr>
            <tr><td style={cell}><strong>액체 (우유·물)</strong></td><td style={cell}>촉촉 ↑ · 밀도 ↓</td><td style={cell}>건조 가능</td></tr>
            <tr><td style={cell}><strong>베이킹파우더</strong></td><td style={cell}>부풀기 ↑ · 4% 초과 시 쓴맛·금속 맛</td><td style={cell}>덜 부풂</td></tr>
            <tr><td style={cell}><strong>황설탕 vs 백설탕</strong></td><td style={cell}>황설탕 ↑ → 쫀득·캐러멜 풍미</td><td style={cell}>백설탕 ↑ → 바삭·퍼짐</td></tr>
          </tbody>
        </table>
      </div>

      {/* 3. 틀 용량 기준 분량 가이드 */}
      <h2 style={sectionTitle}>📦 틀 용량 기준 분량 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        한국 홈베이커들이 가장 많이 묻는 것: &ldquo;이 레시피를 내 틀에 맞게 어떻게 줄여요?&rdquo; 본 도구의 &ldquo;분량 변환&rdquo; 탭에서 틀 종류만 고르면 자동 환산됩니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>틀</th>
              <th style={headCell}>1개당 / 1틀 용량</th>
              <th style={headCell}>참고</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>마들렌 표준틀</td><td style={cell}>1개 28g</td><td style={cell}>12구 = 336g 반죽</td></tr>
            <tr><td style={cell}>마들렌 미니틀</td><td style={cell}>1개 18g</td><td style={cell}>20구 = 360g</td></tr>
            <tr><td style={cell}>미니 파운드 (8×4×4)</td><td style={cell}>1틀 200g</td><td style={cell}>가벼운 선물용</td></tr>
            <tr><td style={cell}>표준 파운드 (20×8×7)</td><td style={cell}>1틀 800g</td><td style={cell}>가장 흔한 사이즈</td></tr>
            <tr><td style={cell}>표준 머핀</td><td style={cell}>1개 65g</td><td style={cell}>12구 = 780g</td></tr>
            <tr><td style={cell}>표준 쿠키 (지름 6cm)</td><td style={cell}>1개 30g</td><td style={cell}>20개 = 600g</td></tr>
            <tr><td style={cell}>표준 마카롱 (지름 4cm)</td><td style={cell}>1개 12g (껍질)</td><td style={cell}>50쌍 = 600g 반죽</td></tr>
            <tr><td style={cell}>원형 1호 (15cm)</td><td style={cell}>1틀 700g</td><td style={cell}>2~3인 케이크</td></tr>
            <tr><td style={cell}>원형 2호 (18cm)</td><td style={cell}>1틀 1,100g</td><td style={cell}>4~5인 케이크</td></tr>
            <tr><td style={cell}>원형 3호 (21cm)</td><td style={cell}>1틀 1,500g</td><td style={cell}>6~8인 케이크</td></tr>
          </tbody>
        </table>
      </div>

      {/* 4. 식감별 비율 조정 */}
      <h2 style={sectionTitle}>🎚️ 식감별 비율 조정 치트시트</h2>
      <div style={{ ...card }}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
          <li><strong>촉촉하게</strong> — 사워크림·요거트 +10~20% / 꿀·미즈아메 +5~10%</li>
          <li><strong>가볍게</strong> — 밀가루 일부 옥수수전분 대체 (10~20%)</li>
          <li><strong>진한 풍미</strong> — 브라운 버터·꿀·바닐라 추가</li>
          <li><strong>덜 단</strong> — 설탕 -10~20% (단, 보존성 ↓·식감 변화 주의)</li>
          <li><strong>쫀득 쿠키</strong> — 황설탕 ↑ · 계란 +5~10g · 냉장 1시간</li>
          <li><strong>바삭 쿠키</strong> — 백설탕 ↑ · 녹인 버터 사용 · 얇게 굽기</li>
          <li><strong>fudgy 브라우니</strong> — 밀가루 30~40%까지 ↓ · 다크 초콜릿 70%+</li>
          <li><strong>케이크형 브라우니</strong> — 밀가루 +10% · 베이킹파우더 +1%</li>
        </ul>
      </div>

      {/* 5. 베이커 퍼센트 vs 본 도구 */}
      <h2 style={sectionTitle}>🧁 vs 🍞 베이킹 레시피 vs 베이커 퍼센트 — 사용자 분기</h2>
      <div style={{ ...card }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          두 도구는 영역이 다릅니다. 빵을 만들면 <Link href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)' }}>베이커 퍼센트 계산기</Link>, 디저트(제과)를 만들면 본 도구를 사용하세요.
        </p>
        <div style={{ ...card, marginTop: 14, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={headCell}>구분</th>
                <th style={headCell}>🍞 베이커 퍼센트</th>
                <th style={headCell}>🧁 베이킹 레시피 (본 도구)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}>대상</td><td style={cell}>빵 (식빵·바게트·치아바타·소금빵)</td><td style={cell}>제과 (마들렌·파운드·쿠키·머핀·마카롱·디저트)</td></tr>
              <tr><td style={cell}>기준</td><td style={cell}>밀가루 100% (고정)</td><td style={cell}>품목별 자동 (계란·버터·밀가루·흰자 등)</td></tr>
              <tr><td style={cell}>핵심</td><td style={cell}>발효 시간·수분율·반죽 온도</td><td style={cell}>비율 진단·식감 보정·굽기</td></tr>
              <tr><td style={cell}>전문 영역</td><td style={cell}>글루텐·이스트·발효종</td><td style={cell}>유지·계란·당도·머랭</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 마들렌 황금비율이 정확히 뭔가요?</summary>
        <div style={faqAnswer}>
          가장 클래식한 마들렌 비율: <strong style={{ color: 'var(--text)' }}>계란 : 설탕 : 밀가루 : 버터 = 1 : 1 : 1 : 1</strong> + 베이킹파우더 3%, 꿀 10%.
          계란 100g 기준 → 설탕 100g · 밀가루 100g · 버터 95~100g · BP 3g · 꿀 10g.
          변형: 브라운 버터(버터 110% + 꿀 12%), 레몬(레몬 제스트 5%), 초코(코코아 가루 10% + 우유 10%). 본 도구의 마들렌 모드 + 식감 슬라이더를 활용하세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 1:1:1:1 파운드케이크가 정말 균형 잡힌 비율인가요?</summary>
        <div style={faqAnswer}>
          르 코르동 블루 등 클래식 학교의 표준입니다: <strong style={{ color: 'var(--text)' }}>버터 : 설탕 : 계란 : 밀가루 = 1 : 1 : 1 : 1</strong> + 베이킹파우더 2%.
          균형 잡힌 풍미·식감, 외우기 쉽고 안정적인 결과가 장점입니다.
          한국 입맛에는 설탕 80%로 줄이거나, 사워크림 +20%/우유 +10%로 촉촉하게, 버터 110% + 아몬드 가루 +10%로 묵직하게 변형할 수 있어요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 쿠키가 너무 퍼지는데 어떻게 하나요?</summary>
        <div style={faqAnswer}>
          본 도구의 비율 진단을 활용하세요. 원인은 보통 <strong style={{ color: 'var(--text)' }}>버터 비율 70% 이상, 백설탕 과다, 베이킹소다 과다, 반죽 온도 높음, 오븐 온도 낮음</strong>입니다.
          해결책: ① 냉장 휴지 30분~1시간(필수) ② 황설탕 비율 ↑ ③ 밀가루 +5~10% ④ 베이킹소다 ↓ → 베이킹파우더로 일부 대체 ⑤ 오븐 175~190°C 충분히 예열 ⑥ 차가운 반죽으로 굽기.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 본 도구와 베이커 퍼센트 도구는 어떻게 다른가요?</summary>
        <div style={faqAnswer}>
          두 도구는 영역이 다릅니다.
          🍞 <strong style={{ color: 'var(--text)' }}>베이커 퍼센트 계산기</strong>(/tools/cooking/baker-percent)는 빵 전용으로, 밀가루 100% 기준에 발효 시간·반죽 온도·이스트·발효종 중심입니다.
          🧁 <strong style={{ color: 'var(--text)' }}>베이킹 레시피 계산기</strong>(본 도구)는 제과 전용으로, 품목별 자동 기준(계란·버터·흰자 등)에 비율 진단·식감 보정·굽기 중심입니다.
          빵을 만들면 베이커 퍼센트, 디저트를 만들면 본 도구를 쓰세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 틀이 다른데 같은 레시피를 사용 가능한가요?</summary>
        <div style={faqAnswer}>
          본 도구의 &ldquo;분량 변환&rdquo; 탭을 활용하세요.
          예: 표준 파운드(800g) 레시피 → 미니 파운드(200g) 3개로 만들면 ×0.75 (200×3=600g/800g). 18cm 원형 → 21cm 원형은 ×1.36.
          다만 ① 굽는 시간은 별도 조정(작을수록 ↓·클수록 ↑) ② 마카롱·머랭처럼 민감한 품목은 신중히 환산해야 합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 알레르기가 있어도 본 도구 결과를 사용해도 되나요?</summary>
        <div style={faqAnswer}>
          본 도구는 일반 가이드입니다. 알레르기 환자는 <strong style={{ color: 'var(--text)' }}>라벨 확인 필수</strong>이며, 의사·영양사 상담 후 진행하세요.
          대체 가이드(참고용): 계란 → 아쿠아파바·플랙스에그 / 우유 → 두유·아몬드밀크 / 밀(글루텐) → 쌀가루·아몬드 가루 / 견과(아몬드) → 코코넛 가루 / 버터 → 코코넛 오일·식물성 유지.
          단, 대체 시 식감이 크게 변할 수 있고, <strong style={{ color: 'var(--text)' }}>본 도구의 결과로 자가 진단·자가 처방은 금물</strong>입니다. 영아·어린이 첫 시도는 의사와 상담 후 소량부터, 응급 약(에피펜 등)을 준비하세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 굽는 시간이 권장보다 모자란데 더 구워야 하나요?</summary>
        <div style={faqAnswer}>
          가정용 오븐은 표시 온도와 실제 온도 차이가 <strong style={{ color: 'var(--text)' }}>±20°C까지</strong> 납니다. 권장 시간 -1분 후 한 번 열어보고 ① 표면 색 ② 가운데 살짝 통통 ③ 이쑤시개로 찔러 묻어나는 정도를 종합 판단하세요.
          마들렌·머핀은 살짝 부족하게 굽는 게 촉촉하고, 쿠키는 가운데가 약간 무른 상태에서 꺼내면 식으면서 완벽해집니다. 오븐 온도계를 따로 두면 자기 오븐의 편차를 알 수 있어요.
        </div>
      </details>

      {/* 7. 안전 / 면책 */}
      <h2 style={sectionTitle}>⚠️ 안전 · 면책</h2>
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
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 정확한 결과는 본인의 오븐·재료로 테스트가 필요합니다.</li>
          <li>오븐별 편차 ±20°C·±3분, 재료(특히 버터·밀가루) 브랜드별 차이가 있습니다.</li>
          <li><strong>알레르기 주의</strong> — 계란·우유·밀(글루텐)·견과(아몬드 가루) 라벨 필수 확인. 의심 시 의료진 상담.</li>
          <li><strong>다이어트·당뇨</strong> — 정확한 영양 자문은 영양사·의사와 상담하세요. 본 도구는 칼로리·당분 계산이 아닙니다.</li>
          <li>본 도구는 정확한 영양 성분 분석·알레르기 진단·특정 브랜드 추천을 하지 않습니다.</li>
        </ul>
      </div>

      {/* 8. 관련 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/cooking/baker-percent" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥖</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>베이커 퍼센트 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>빵·발효 반죽 (밀가루 100%)</div>
        </Link>
        <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 비율</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>버터·설탕·계란 대체</div>
        </Link>
        <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>인분 환산</div>
        </Link>
        <Link href="/tools/cooking/unit" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📏</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>요리 단위 변환기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>g·ml·컵·큰술</div>
        </Link>
        <Link href="/tools/cooking/thawing" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>해동 시간 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>버터·계란 실온화</div>
        </Link>
        <Link href="/tools/life/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>생일 케이크 일정</div>
        </Link>
      </div>
    </div>
  )
}
