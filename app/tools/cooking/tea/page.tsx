import Link from 'next/link'
import TeaClient from './TeaClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/tea',
  title: '차 우리기 시간·온도 계산기 — 녹차·말차·우롱·보이·홍차 9종',
  description: '녹차·옥로·말차·백차·우롱·홍차·보이·허브·루이보스 9종 차별 권장 온도·시간·비율. 다탕 우림 스케줄(세차 포함), 냉침 모드, 카페인 비교, 떫음 위험 게이지까지 4탭.',
  keywords: ['차 우리기', '녹차 온도', '홍차 시간', '보이차 세차', '말차 비율', '우롱차 다탕', '냉침차 만들기', '허브티 시간', '카페인 함량', '차 종류'],
})

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

export default function TeaPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍵 차 우리기 시간·온도 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        <strong style={{ color: 'var(--text)' }}>녹차·옥로·말차·백차·우롱·홍차·보이·허브·루이보스 9종</strong> 차별
        권장 온도·시간·비율 + 다탕 스케줄(세차 포함) + 냉침 모드 + 카페인 비교 + 떫음 위험 게이지 4탭.
      </p>

      <TeaClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>차 종류 선택</strong> — 9종 카드 (녹차·홍차·우롱·보이·허브 등)</li>
          <li><strong>다구·진하기 선택</strong> — 게이완 / 다관 / 머그 / 티백 + 연하게/기본/진하게</li>
          <li><strong>찻잎·물 양 입력</strong> — 프리셋 또는 직접 (3g + 200ml가 표준)</li>
          <li><strong>결과 확인</strong> — 권장 온도·시간·비율 + 떫음 게이지 + 카페인 추정</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>다탕 스케줄 탭</strong>에서 보이·우롱의 세차 → 1탕 → 2탕 ... 8탕까지
          단계별 시간을 확인하고, <strong style={{ color: 'var(--accent)' }}>냉침 모드 탭</strong>에서 카페인·탄닌 비교를 볼 수 있어요.
        </p>
      </div>

      {/* 2. 매트릭스 */}
      <h2 style={sectionTitle}>📊 차 종류별 권장 온도·시간 매트릭스</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>차</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>온도</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>1탕</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>비율</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>카페인</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🍵 녹차',   '70~80°C', '1~1.5분', '1:60', '25mg/g'],
                ['🍃 옥로',   '50~60°C', '90~120s', '1:30', '35mg/g'],
                ['💚 말차',   '70~80°C', '즉시 격불', '2g/70ml', '65mg/g'],
                ['🤍 백차',   '75~85°C', '2~3분',   '1:50', '10mg/g'],
                ['🌸 우롱차', '90~95°C', '30~45s',  '1:25', '20mg/g'],
                ['☕ 홍차',   '95~100°C','3~5분',   '1:50', '35mg/g'],
                ['🪵 보이차', '95~100°C','세차→30s','1:25', '25mg/g'],
                ['🌼 허브티', '95~100°C','5~7분',   '1:60', '0'],
                ['🍂 루이보스','95~100°C','5~7분',  '1:80', '0'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'Syne, sans-serif',
                      color: j === 1 ? 'var(--accent)' : 'var(--text)',
                      fontWeight: j === 0 ? 700 : 600,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 진하게 마시고 싶을 때 */}
      <h2 style={sectionTitle}>💡 진하게 마시고 싶을 때 — 시간을 늘리지 마세요</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          많은 사람이 <strong>&quot;차가 연하다&quot;고 우림 시간을 늘리는데, 이건 가장 잘못된 선택</strong>입니다.
          시간을 길게 하면 <strong style={{ color: '#FF3E8C' }}>탄닌(떫음)·쓴맛이 폭증</strong>해 마실 수 없게 돼요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 8px' }}>✅ 올바른 진하게 마시기</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
            <li><strong>찻잎 양을 1.5배</strong>로 (3g → 4.5g)</li>
            <li><strong>물을 줄이기</strong> (1:50 → 1:40)</li>
            <li><strong>물 온도 ±5°C</strong> 미세 조정 (홍차·우롱은 ↑, 녹차는 ↓)</li>
            <li><strong>고급 찻잎</strong>으로 변경 (세작 → 우전, 세작 → 옥로)</li>
          </ul>
        </div>
        <div style={{ background: 'rgba(255, 62, 140, 0.06)', borderRadius: 10, padding: '14px 16px', marginTop: 10, border: '1px solid rgba(255, 62, 140, 0.3)' }}>
          <p style={{ fontSize: 13, color: '#FF3E8C', fontWeight: 700, margin: '0 0 6px' }}>❌ 피해야 할 것</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.8 }}>
            우림 시간을 권장 대비 1.5배 이상 늘리면 떫음·쓴맛이 비선형적으로 폭증합니다.
            특히 녹차·옥로는 시간보다 <strong style={{ color: 'var(--text)' }}>온도</strong>가 핵심이에요.
          </p>
        </div>
      </div>

      {/* 4. 다탕 우림 */}
      <h2 style={sectionTitle}>🍃 다탕(多湯) 우림이란? — 세차·1탕·2탕·3탕</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          다탕(多湯)은 <strong>같은 찻잎으로 여러 번 우려 풍미 변화를 즐기는 방식</strong>입니다.
          중국·대만의 우롱·보이차 문화에서 유래했어요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '💦 세차 (洗茶)',  d: '뜨거운 물로 10초 헹구고 첫 물은 버림. 잡내 제거 + 찻잎 깨움. 보이·우롱 필수.', c: '#9B9B9B' },
            { t: '🍃 1탕',          d: '본 추출 시작. 가장 산뜻하고 풀향·꽃향이 강한 단계.',                            c: '#3EFFD0' },
            { t: '🌿 2탕',          d: '풍미가 가장 균형잡힌 단계. 단맛·바디감 풍부.',                                  c: '#3EC8FF' },
            { t: '🪴 3탕 이후',     d: '깊은 후미·은은한 마무리. 우롱·보이는 5~8탕까지 가능.',                          c: '#FFB83E' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 냉침차 */}
      <h2 style={sectionTitle}>🧊 냉침차 만들기 — 카페인·탄닌 줄이는 법</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          냉침(Cold Brew Tea)은 <strong>상온·냉장에서 6~12시간 천천히 추출</strong>하는 방식.
          뜨거운 물보다 카페인은 약 40%, 탄닌은 약 50% 적게 추출돼 부드러운 맛이 됩니다.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>상온 (20°C)</strong>: 4~6시간 — 빠르고 풍미 진함</li>
          <li><strong style={{ color: 'var(--text)' }}>냉장 (4°C)</strong>: 6~12시간 — 가장 부드럽고 맑음</li>
          <li><strong style={{ color: 'var(--text)' }}>비율</strong>: 1:60~80 (핫보다 약간 진하게)</li>
          <li><strong style={{ color: 'var(--text)' }}>위생</strong>: 끓인 후 식힌 물·정수기물 권장, 24~48시간 내 음용</li>
          <li><strong style={{ color: 'var(--text)' }}>추천</strong>: 녹차·홍차·허브티·루이보스·콜드브루 우롱</li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 녹차는 왜 70~80°C로 우려야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>녹차는 비발효차</strong>로 카테킨·탄닌이 매우 높아 끓는 물(95°C+)로 우리면 떫음·쓴맛이
          폭증합니다. 70~80°C로 낮추면 카테킨이 천천히 추출되며, 단맛 성분(테아닌·아미노산)이
          잘 살아납니다. 옥로(교쿠로)는 더 낮은 50~60°C로 우려 우마미(감칠맛)를 극대화해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 우림 시간을 길게 하면 더 진해지나요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 떫음·쓴맛만 폭증합니다.</strong> 차의 단맛·향 성분은 1~3분에 거의 추출이 끝나고,
          그 이후엔 탄닌·카페인만 계속 우러나와요. 진하게 마시고 싶다면
          <strong> 찻잎 양을 늘리거나(1.5배), 물을 줄이거나, 온도를 미세 조정</strong>하세요.
          시간을 늘리는 건 가장 잘못된 선택입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 보이차 세차는 왜 하나요?</summary>
        <p style={faqAnswer}>
          보이차는 <strong>장기 저장(생차 10년+, 숙차 5년+)된 발효차</strong>로 표면에 먼지·잡내가 있을 수 있어요.
          뜨거운 물로 10초 빠르게 헹구고 첫 물을 버리면:<br />
          ① 먼지·이물질 제거<br />
          ② 찻잎이 물을 흡수해 다음 추출이 잘 됨 (찻잎 깨우기)<br />
          ③ 보관 중 생긴 산화물·잡내 제거<br />
          우롱차도 같은 이유로 세차하며, 녹차·홍차는 신선해서 세차 안 합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 말차와 녹차는 같은 차인가요?</summary>
        <p style={faqAnswer}>
          <strong>같은 차나무에서 나온 다른 형태</strong>입니다. 말차(抹茶)는 차광 재배한 녹차(텐차)를
          맷돌로 곱게 갈아 가루로 만든 것. 일반 녹차는 잎을 우려서 잎은 버리지만,
          말차는 <strong>가루 자체를 마시므로</strong> 카테킨·카페인·항산화 성분을 통째로 섭취합니다.
          그래서 카페인이 일반 녹차의 2~3배에 달해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 카모마일·페퍼민트·루이보스 우리는 시간 차이?</summary>
        <p style={faqAnswer}>
          모두 카페인 0이며 끓는 물로 우리지만 시간은 다릅니다.<br />
          • <strong>카모마일</strong>: 5~7분 (뚜껑 덮고 향 보존)<br />
          • <strong>페퍼민트</strong>: 5분 (오래 우리면 멘톨이 떫어짐)<br />
          • <strong>루이보스</strong>: 5~10분 (오래 우려도 떫음 적음, 임산부·아이도 OK)<br />
          허브티는 잎이 아닌 꽃·뿌리·줄기라 추출이 느려 5분 이상 필요해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 냉침차는 카페인이 정말 적은가요?</summary>
        <p style={faqAnswer}>
          네, 일반적으로 <strong>핫추출 대비 30~50% 적게</strong> 추출됩니다.
          카페인은 고온에서 더 잘 녹기 때문이에요. 탄닌도 약 50% 적어 부드러운 맛이 납니다.
          단, 시간이 길어 총 추출량은 비슷할 수 있고, 향·풍미는 핫추출이 더 강합니다.
          카페인 민감자·임산부는 냉침 + 저카페인 차(백차·허브) 조합이 안전해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 다관·게이완·머그 어느 게 좋나요?</summary>
        <p style={faqAnswer}>
          용도가 다릅니다.<br />
          • <strong>게이완 (개완)</strong>: 광동·복건식 작은 사발. 우롱·보이·백차 표준 (작게 여러 번)<br />
          • <strong>다관 (차호)</strong>: 전통 중국식 작은 주전자. 옥로·우롱·보이에 적합<br />
          • <strong>머그 + 티볼</strong>: 서양식. 1회 우림용. 녹차·홍차·허브에 편리<br />
          • <strong>티백</strong>: 편의·휴대용. 시간을 30~50% 단축<br />
          입문자는 <strong>머그+티볼</strong>로 시작하고, 우롱·보이를 즐기게 되면 게이완을 추천합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 같은 찻잎으로 몇 번까지 우릴 수 있나요?</summary>
        <p style={faqAnswer}>
          차 종류·품질에 따라 다릅니다.<br />
          • <strong>녹차·홍차</strong>: 2~3탕 (이후 풍미 약함)<br />
          • <strong>백차</strong>: 3~4탕<br />
          • <strong>우롱차</strong>: 5~8탕 (고산차·동방미인 더 많이 가능)<br />
          • <strong>보이차</strong>: 6~10탕 (오래 묵힌 차일수록 다탕 가능)<br />
          • <strong>허브티</strong>: 1~2탕 (재추출은 향이 약함)<br />
          • <strong>티백</strong>: 1탕 권장 (분쇄가 너무 가늘어 2탕은 떫음)<br />
          탕마다 시간을 점점 늘리는 것이 다탕 우림의 정석입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 임산부·아이는 어떤 차가 안전한가요?</summary>
        <p style={faqAnswer}>
          카페인이 없는 차가 안전합니다.<br />
          • ✅ <strong>허브티 (카모마일·페퍼민트·라벤더)</strong> — 카페인 0<br />
          • ✅ <strong>루이보스</strong> — 카페인 0, 항산화·미네랄 풍부<br />
          • ⚠️ <strong>백차·녹차</strong> — 저카페인이라 가끔 OK이지만 임산부는 1일 1잔 이내<br />
          • ❌ <strong>홍차·말차·옥로</strong> — 카페인 높음, 임신 후기·수유 중 비추천<br />
          단, 일부 허브(세이지·로즈마리·특정 한약차)는 임산부 금기이니 라벨 확인 필수.
          정확한 권고는 산부인과·소아과와 상담하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 차에 가장 좋은 물은? (연수·경수·정수)</summary>
        <p style={faqAnswer}>
          <strong>연수(Soft Water, 미네랄 적은 물)가 가장 좋습니다.</strong>
          한국 수돗물은 비교적 연수에 가까워 정수 후 사용하면 무난해요.<br />
          • ✅ <strong>정수기물·연수 생수 (백두산수·삼다수)</strong>: 차의 향·맛 잘 살아남<br />
          • ⚠️ <strong>경수 (에비앙 등 미네랄 풍부 물)</strong>: 차에 침전·맛 변화 발생, 부적합<br />
          • ❌ <strong>증류수</strong>: 미네랄 0이라 향이 평면적이고 깊이 없음<br />
          일본 차업계는 <strong>경도 30~80mg/L</strong>를 가장 이상적으로 봅니다.
          그리고 <strong>한 번 끓였다 식힌 물</strong>이 산소가 빠져 차 추출에 더 좋아요.
        </p>
      </details>

      {/* cooking 도구 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/cooking/brew" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>☕</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>커피 브루잉 비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            6 추출법 + 푸어 스케줄
          </p>
        </Link>
        <Link href="/tools/cooking/recipe" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>레시피 비율·단위 변환</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인분·큰술·g 환산
          </p>
        </Link>
        <Link href="/tools/health/supplement" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>영양제 성분 체크</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            카페인·약물 상호작용 체크
          </p>
        </Link>
      </div>
    </div>
  )
}
