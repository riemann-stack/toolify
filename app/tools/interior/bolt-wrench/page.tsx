import Link from 'next/link'
import BoltWrenchClient from './BoltWrenchClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/bolt-wrench',
  title: '볼트 스패너 계산기 — M3~M24 + ISO/DIN/KS vs JIS + 알렌·와셔·토크',
  description: 'M3~M24 + ISO/DIN/KS vs 옛 JIS 비교 + 알렌렌치·와셔·너트·토크 등급과 공구 세트 추천 4프리셋.',
  keywords: ['볼트 스패너 사이즈', 'M8 스패너', '알렌렌치 사이즈', '소켓 사이즈', 'ISO JIS 차이', '와셔 사이즈', '너트 높이', '체결 토크', '강도등급', '공구 세트'],
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

export default function BoltWrenchPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔧 볼트 스패너 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        M3~M24 + ISO/DIN/KS vs 옛 JIS 비교 + <strong style={{ color: 'var(--text)' }}>알렌렌치·와셔·너트·토크 등급</strong>.
      </p>

      <BoltWrenchClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>볼트 종류 선택</strong> — 외부 6각(육각볼트)인지 내부 6각(소켓캡·버튼·플랫·세트)인지</li>
          <li><strong>사이즈 선택</strong> — M3 ~ M24 (가장 흔한 M6 / M8 / M10)</li>
          <li><strong>규격 토글</strong> — 외부 6각의 경우 ISO·DIN·KS 현행 ↔ 옛 JIS</li>
          <li><strong>결과 확인</strong> — 스패너/알렌 사이즈 + 와셔·너트·토크 한 번에</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 모르는 볼트 사이즈는 <strong style={{ color: 'var(--accent)' }}>역검색 탭</strong>에서
          가지고 있는 스패너·알렌 사이즈를 입력하면 가능한 볼트 후보가 나와요.
        </p>
      </div>

      {/* 2. JIS와 ISO/DIN/KS 차이 */}
      <h2 style={sectionTitle}>⚠️ JIS와 ISO/DIN/KS, 왜 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 정비·DIY 현장에서 가장 헷갈리는 지점입니다.
          같은 <strong>M8 볼트</strong>라도 만든 시기·국적에 따라 머리 크기가 다릅니다.
        </p>
        <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.95, paddingLeft: 18, margin: '8px 0 12px' }}>
          <li><strong style={{ color: 'var(--text)' }}>1990년대 이전</strong>: 일본·한국은 JIS B 1180 기준. M8=12mm, M10=14mm, M12=17mm</li>
          <li><strong style={{ color: 'var(--text)' }}>현재</strong>: ISO 4014/4017 · DIN 933 · KS B 1002 모두 통일. M8=13mm, M10=17mm, M12=19mm</li>
          <li><strong style={{ color: 'var(--text)' }}>주의 영역</strong>: 옛 자전거·기계·구형 자동차에 옛 JIS 사이즈가 잔존</li>
        </ul>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px' }}>주요 차이 사이즈</p>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0' }}>M8</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>ISO 13 mm / JIS 12 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M10</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>ISO 17 mm / JIS 14 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M12</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>ISO 19 mm / JIS 17 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M14</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif' }}>ISO 22 mm / JIS 19 mm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 알렌렌치는 왜 다른가요? */}
      <h2 style={sectionTitle}>🔑 알렌렌치 사이즈는 왜 외부 스패너랑 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 M8 볼트인데 외부 6각이면 13mm 스패너,
          소켓캡(알렌볼트)이면 6mm 알렌으로 다른 이유는 <strong>측정 위치</strong>가 다르기 때문입니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>외부 6각 (스패너)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              머리 바깥쪽 6각 평면 사이 거리(across-flat).
              볼트 직경보다 항상 큼.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>내부 6각 (알렌)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              머리 안쪽 6각 홈 평면 사이 거리.
              볼트 직경보다 작음 (약 0.7~0.8배).
            </p>
          </div>
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          또한 같은 M8이라도 머리 모양(소켓캡·버튼·플랫·세트)에 따라 알렌 사이즈가 다릅니다.
          버튼/플랫은 머리가 얕아서 한 단계 작은 알렌을 씁니다.
        </p>
      </div>

      {/* 4. 토크 등급 */}
      <h2 style={sectionTitle}>📊 토크 등급(8.8 / 10.9 / 12.9) 어떻게 읽나요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          볼트 머리에 새겨진 숫자는 <strong>강도등급(Property Class)</strong>입니다.
          앞 숫자×100 = 인장강도(MPa), 앞×뒤×10 = 항복강도(MPa).
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.9 }}>
            예시 <strong style={{ color: 'var(--accent)' }}>8.8 등급</strong>:<br />
            • 인장강도 = 8 × 100 = <strong style={{ color: 'var(--accent)' }}>800 MPa</strong><br />
            • 항복강도 = 8 × 8 × 10 = <strong style={{ color: 'var(--accent)' }}>640 MPa</strong><br />
            • 즉 항복비 0.8 = 인장의 80% 지점에서 영구 변형 시작
          </p>
        </div>
        <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.95, paddingLeft: 18, marginTop: 12 }}>
          <li><strong style={{ color: 'var(--text)' }}>4.8</strong> — 일반 강·가구·전기 (가장 흔함)</li>
          <li><strong style={{ color: 'var(--text)' }}>8.8</strong> — 범용 기계·자동차 일반부 (한국 산업 표준)</li>
          <li><strong style={{ color: 'var(--text)' }}>10.9</strong> — 엔진·서스펜션·구조물 (고강도)</li>
          <li><strong style={{ color: 'var(--text)' }}>12.9</strong> — 항공·정밀 공구 (최고 강도, 취성 주의)</li>
        </ul>
      </div>

      {/* 5. 공구 세트 가이드 */}
      <h2 style={sectionTitle}>🧰 자주 쓰는 공구 세트 가이드</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { t: '🚲 자전거', c: 'var(--accent)', d: '알렌이 핵심. 2~8mm 알렌세트 + 8/10/13/15mm 콤비스패너 + 토크렌치(카본).' },
          { t: '🪑 가구·DIY', c: '#FF8C3E', d: '이케아·한샘 표준 알렌 3/4/5/6mm + 10/13/14mm 스패너 + 드라이버.' },
          { t: '🚗 자동차', c: '#3EC8FF', d: '3/8" 라쳇 + 8~22mm 소켓 풀세트 + 토크렌치 20~110Nm + 잭/잭스탠드.' },
          { t: '🏭 산업', c: '#FF3E8C', d: '1/2" 라쳇 + 6~32mm 임팩트 소켓 + 100~500Nm 토크렌치 + 슬러그 스패너.' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.d}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. M8 스패너는 13mm인가요 12mm인가요?</summary>
        <p style={faqAnswer}>
          <strong>현행 ISO·DIN·KS 규격은 13mm</strong>입니다. 다만 1990년대 이전에 만들어진
          일본·한국산 기계·자전거·구형 자동차에는 <strong>옛 JIS 기준 12mm</strong>가 잔존합니다.
          내 스패너가 헐겁게 들어가면 옛 JIS 사이즈를 의심해 보세요. 13mm 스패너를 12mm 볼트에 쓰면
          머리가 둥글게 마모(rounded)될 수 있으니 주의.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 알렌렌치 인치(SAE)와 mm 차이가 큰가요?</summary>
        <p style={faqAnswer}>
          가까운 사이즈 차이가 0.05~0.15mm로 매우 작습니다. 예: 1/8&quot; ≈ 3.18mm로 3mm 알렌과 거의 같음.
          그래서 응급 시 인치 알렌으로 mm 볼트를 풀 수는 있지만, <strong>꽉 조여진 볼트는 둥글림 위험</strong>이
          높아 권장하지 않습니다. 자가정비라면 mm·인치 둘 다 갖추는 게 안전합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 몽키스패너로 모든 볼트를 풀어도 되나요?</summary>
        <p style={faqAnswer}>
          가능하지만 권장하지 않습니다. 몽키는 <strong>한 면만 잡아서 토크가 비대칭</strong>이고,
          조 간격이 흔들리면 머리가 둥글게 마모됩니다. 임시·예비용으로만 사용하세요.
          스패너/소켓이 정공구이며, 둥글게 마모된 볼트를 풀 때는 오히려 한 사이즈 작은 SAE(인치)
          소켓을 망치로 때려 박아 사용하는 방법이 효과적입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 임팩트 드라이버 소켓이랑 핸드 소켓이 다른가요?</summary>
        <p style={faqAnswer}>
          네, 다릅니다. <strong>핸드 소켓(은색·크롬바나듐)</strong>은 매끈하고 얇으며 손 토크용입니다.
          여기에 임팩트를 사용하면 <strong>깨져 파편이 튈 위험</strong>이 있습니다.
          임팩트는 반드시 <strong>임팩트 전용 소켓(검정색·크롬몰리)</strong>을 사용하세요.
          최근에는 임팩트 겸용으로 표시된 제품도 있습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 토크렌치 꼭 써야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>고급 부품·안전 부품은 필수</strong>입니다. 자전거 카본 시트포스트·스템(5~8Nm),
          자동차 휠너트(80~140Nm 차종별), 엔진 헤드볼트 등은 적정 토크 미만이면 풀리고,
          초과면 부품 파손·균열이 발생합니다. 일반 가구 조립처럼 손감각으로 충분한 곳도 있지만,
          한 번 정확한 토크를 익히면 손감각도 정확해집니다. 토크렌치는 <strong>조일 때만</strong>
          사용하고 풀 때는 일반 핸들을 쓰세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 녹슨 볼트가 풀리지 않을 때는?</summary>
        <p style={faqAnswer}>
          순서대로: ① <strong>침투제(WD-40·PB Blaster)</strong>를 충분히 뿌리고 10~30분 대기 →
          ② 머리를 망치로 가볍게 두드려 충격 전달 →
          ③ <strong>역방향으로 살짝 조였다가 풀기</strong>(녹 균열) →
          ④ 그래도 안 되면 토치로 가열(주변 도장·플라스틱 주의) →
          ⑤ 마지막 수단은 볼트 익스트랙터·드릴링. 한 사이즈 큰 스패너는 둥글림이 더 심해지므로 금물입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 와셔는 왜 같이 쓰나요?</summary>
        <p style={faqAnswer}>
          ① <strong>하중 분산</strong>으로 모재 손상 방지(목재·연질 금속에 특히 중요), ②
          <strong>풀림 방지</strong>(스프링와셔), ③ <strong>접지·전기 도통</strong>(이붙이와셔),
          ④ <strong>틈새 메움·간격 조정</strong>. 와셔는 <strong>볼트 머리 쪽 + 너트 쪽 둘 다</strong>
          넣는 것이 표준이며, 스프링와셔는 평와셔 안쪽(나사산 쪽)에 넣습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 나일론락너트 재사용이 가능한가요?</summary>
        <p style={faqAnswer}>
          <strong>비권장</strong>입니다. 한 번 체결하면 나일론 인서트가 영구 변형되어
          풀림 방지력이 30~50% 감소합니다. 안전 부품(휠허브·서스펜션·핸들바 등)은
          반드시 새것을 사용하세요. 임시 분해·조립이라면 2~3회 재사용은 큰 무리는 아니지만,
          <strong>풀림 토크가 분명히 떨어진 너트는 폐기</strong>가 정답입니다.
          반복 분해가 잦은 곳은 더블너트·스프링와셔 조합으로 대체하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 스테인리스 볼트는 토크가 다른가요?</summary>
        <p style={faqAnswer}>
          네, 보통 <strong>일반 강 8.8 등급의 60~70% 정도</strong>가 안전 토크입니다.
          스테인리스(SUS304·SUS316)는 강도등급 표기가 A2-70·A4-80으로 다르며,
          마찰계수도 높아 <strong>긁어붙임(galling) 현상</strong>이 잘 일어납니다.
          체결 시 항상 항착방지제(anti-seize)나 윤활제를 바르고, 천천히 균등하게 조이세요.
          정확한 값은 제조사 데이터시트를 우선 확인하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 경량 차량 휠너트는 몇 Nm로 조여야 하나요?</summary>
        <p style={faqAnswer}>
          차종마다 매우 다릅니다. 일반적인 가이드:
          국산 경차·소형 80~100Nm, 중형 100~120Nm, SUV·대형 120~140Nm,
          트럭·중장비 200Nm 이상. <strong>반드시 차량 매뉴얼·휠 제조사 사양 확인</strong>이
          우선이며, 토크렌치로 별 모양(star pattern) 순서로 2~3회 나눠 조이세요.
          <strong>휠너트는 안전 직결 부품</strong>이므로 자신 없으면 정비공장을 이용하세요.
        </p>
      </details>

      {/* 인테리어 도구 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 인테리어 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/interior/screw" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔩</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>나사 규격 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            7종 나사 → 탭드릴·관통홀·인치↔mm
          </p>
        </Link>
        <Link href="/tools/interior/molding" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📏</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>몰딩 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            천장·걸레받이·문틀 둘레
          </p>
        </Link>
        <Link href="/tools/interior/wallpaper" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🧱</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>도배 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            벽지 롤 수·셀프 시공 비용
          </p>
        </Link>
      </div>
    </div>
  )
}
