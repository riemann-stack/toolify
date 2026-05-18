import Link from 'next/link'
import TravelTipClient from './TravelTipClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/travel-tip',
  title: '해외여행 팁 계산기 — 18개국 × 9 서비스 + 만족도 + 원화 환산',
  description: '18+ 국가 × 9 서비스(식당·택시·호텔·골프·마사지) 적정 팁 + 만족도 보정 + 봉사료 자동 안내 + 인원 분할·원화 환산.',
  keywords: ['해외여행 팁', '미국 팁', '일본 팁 문화', '유럽 식당 팁', '호텔 벨보이', '골프 캐디 팁', '마사지 팁', '크루즈 팁', '봉사료 Service Charge', '여행 매너'],
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

export default function TravelTipPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💵 해외여행 팁 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        18+ 국가별 식당·택시·호텔·골프·마사지 <strong style={{ color: 'var(--text)' }}>적정 팁</strong>. 만족도 보정과 인원 분할.
      </p>

      <TravelTipClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>국가 선택</strong> — 18개국 카드 (검색 가능)</li>
          <li><strong>서비스 선택</strong> — 식당·택시·호텔·골프·마사지 등 9종</li>
          <li><strong>금액·인원·만족도</strong> 입력 → 권장 팁 + 총액 + 1인당 + 원화 환산</li>
          <li><strong>국가별 매너 탭</strong>에서 18개국 팁 문화 한눈에 확인</li>
          <li><strong>시나리오 탭</strong>에서 신혼여행·골프투어·크루즈 시뮬</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>봉사료(Service Charge) 자동 포함</strong> 국가는
          별도 안내 카드가 표시됩니다. 미국 단체 6명+는 자동 18% 팁도 자동 적용.
        </p>
      </div>

      {/* 2. 국가별 팁 문화 */}
      <h2 style={sectionTitle}>🌍 국가별 팁 문화 (필수·선택·금지)</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🔴 필수', d: '🇺🇸 미국·🇨🇦 캐나다 — 안 주면 큰 결례. 식당 15-20% 표준.', c: '#FF3E8C' },
            { t: '🟡 선택', d: '🇪🇺 유럽·🇹🇭 동남아·🇦🇪 두바이 — 매너지만 강제 X. 5-15%.', c: '#FFB83E' },
            { t: '🟢 거의 없음', d: '🇹🇼 대만 — 일부 고급 식당만 봉사료 자동.', c: '#3EFFD0' },
            { t: '⚫ 주면 X', d: '🇯🇵 일본·🇨🇳 중국 — 팁 X, 무례할 수 있음.', c: '#9B9B9B' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 서비스별 권장 */}
      <h2 style={sectionTitle}>🛎️ 서비스별 권장 팁</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>서비스</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>미국·캐나다</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>유럽·동남아</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🍽️ 식당',          '15-20% (세전)', '5-10%'],
                ['🚕 택시·우버',      '15-20%',        '잔돈 반올림'],
                ['🛏️ 호텔 벨보이',    '$1~2/짐',       '€1~2/짐'],
                ['🛏️ 호텔 룸메이드',  '$2~5/박',       '선택'],
                ['🗺️ 투어·가이드',    '$10/일/인',     '€5~10/일/인'],
                ['💆 마사지',         '15-20%',        '태국 50~100바트 ⭐'],
                ['⛳ 골프 캐디',       '—',             '필리핀 200~500페소 ⭐'],
                ['💇 미용·이발',       '15-20%',        '5-10%'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'Inter, system-ui, sans-serif',
                      color: j === 0 ? 'var(--text)' : 'var(--accent)',
                      fontWeight: j === 0 ? 700 : 600,
                      fontSize: 12.5,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 봉사료 자동 포함 */}
      <h2 style={sectionTitle}>📋 봉사료(Service Charge) 자동 포함 안내</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          많은 국가의 식당·호텔이 <strong>봉사료(Service Charge·Gratuity)를 자동 청구</strong>합니다.
          이 경우 추가 팁은 선택입니다.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>🇬🇧 영국</strong>: 식당 12.5% 자동 흔함</li>
          <li><strong style={{ color: 'var(--text)' }}>🇫🇷 프랑스</strong>: &quot;Service Compris&quot; 표시 = 봉사료 포함</li>
          <li><strong style={{ color: 'var(--text)' }}>🇮🇹 이탈리아</strong>: Coperto(자릿값) €1~3 별도</li>
          <li><strong style={{ color: 'var(--text)' }}>🇭🇰 홍콩 / 🇸🇬 싱가포르</strong>: 식당 10% 자동</li>
          <li><strong style={{ color: 'var(--text)' }}>🇦🇪 두바이</strong>: 10% Service Charge + 5% VAT</li>
          <li><strong style={{ color: 'var(--text)' }}>🇺🇸 미국</strong>: 단체 6명+ 자동 18% 팁</li>
          <li><strong style={{ color: 'var(--text)' }}>🚢 크루즈</strong>: 1인 $15~20/일 자동 청구</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 영수증의 <strong>&quot;Service Charge&quot;·&quot;Gratuity&quot;·&quot;Auto Tip&quot;</strong> 항목 확인 후 추가 여부 결정.
        </p>
      </div>

      {/* 5. 한국인 자주 가는 여행지 */}
      <h2 style={sectionTitle}>🧳 한국인 자주 가는 여행지 팁 가이드</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🇺🇸 미국 신혼·출장', d: '식당 15-20% 필수. 우버 15-20%. 호텔 룸 $2~5/박.', c: '#3EC8FF' },
            { t: '🇯🇵 일본 가족여행', d: '🚫 팁 X. 료칸은 心付け(¥1~3K) 봉투. 답례 문화.', c: '#FFB83E' },
            { t: '🇹🇭 태국 휴양', d: '식당 5-10%. ⭐ 마사지 50~100바트가 표준.', c: '#3EFFD0' },
            { t: '🇵🇭 동남아 골프', d: '캐디 200~500페소. 식당 10%. 마사지 100페소.', c: '#FF8C3E' },
            { t: '🇮🇩 발리 풀빌라', d: '식당 5-10%. 마사지 Rp 30K. 기사 Rp 50K/일.', c: '#FF3E8C' },
            { t: '🇪🇺 유럽 자유여행', d: '식당 5-10% (Service Compris 확인). 호텔 €1~2.', c: '#9B59B6' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 미국 식당 팁은 얼마가 적당한가요?</summary>
        <p style={faqAnswer}>
          <strong>15~20%가 표준</strong>이며, 만족도에 따라 조정합니다:<br />
          • <strong>보통 (Standard)</strong>: 15%<br />
          • <strong>좋음 (Good)</strong>: 18%<br />
          • <strong>매우 좋음 (Excellent)</strong>: 20% 또는 그 이상<br />
          • 고급 레스토랑은 20-25%<br />
          • 카운터·테이크아웃은 10% 또는 잔돈<br />
          ⚠️ <strong>단체 6명+는 자동 18% 팁(Auto Gratuity)</strong>이 청구되니 영수증 확인.
          기준은 <strong>세전 금액(subtotal)</strong>이 일반적이지만, 세후 기준도 점차 확산.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 일본에서 팁을 주면 안 되나요?</summary>
        <p style={faqAnswer}>
          🚫 <strong>주지 마세요.</strong> 일본은 팁 문화가 없으며, 오히려 무례하게 받아들일 수 있습니다.
          가격에 모든 서비스가 포함되어 있다는 자부심.<br />
          예외:<br />
          • <strong>료칸(旅館)</strong>: 心付け(고코로즈케) ¥1,000~3,000을 작은 봉투(ぽち袋)에<br />
          • <strong>고급 호텔 컨시어지</strong>: 특별한 부탁 시 봉투에<br />
          현금을 그대로 건네면 거절당할 수 있어요. 정 감사 표현하고 싶다면 <strong>한국식 선물(떡·과자·차)</strong>이 더 자연스럽습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 봉사료(Service Charge)가 이미 포함된 경우?</summary>
        <p style={faqAnswer}>
          이미 봉사료가 자동 청구된 경우 <strong>추가 팁은 선택</strong>입니다.<br />
          영수증 확인 항목:<br />
          • <strong>&quot;Service Charge&quot;·&quot;Gratuity&quot;</strong>: 봉사료 (보통 10-12.5%)<br />
          • <strong>&quot;Auto Gratuity&quot;</strong>: 자동 팁 (미국 단체)<br />
          • <strong>&quot;Service Compris&quot;</strong> (프랑스): 봉사료 포함<br />
          • <strong>&quot;含む&quot;·&quot;包含&quot;</strong> (일본·중국): 포함<br />
          이미 포함되어 있다면 잔돈 반올림이나 €1~2 추가 정도가 매너. 두 번 내지 마세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 카드로 결제하면 팁은 어떻게?</summary>
        <p style={faqAnswer}>
          국가·매장별로 다릅니다:<br />
          • <strong>미국·캐나다</strong>: 영수증에 &quot;Tip&quot; 빈칸 → 직접 적고 사인<br />
          • <strong>독일·북유럽</strong>: 카드 단말기 입력 시 미리 말해야 함 (&quot;30 Euro&quot;)<br />
          • <strong>일본</strong>: 카드 결제 시 팁 X (애초에 팁 X)<br />
          • <strong>동남아·발리</strong>: 카드도 가능하지만 <strong>현금이 더 확실</strong> (직원 손에 직접)<br />
          ⚠️ <strong>벨보이·룸메이드·기사·캐디</strong>는 항상 <strong>현금</strong>이 표준 — 카드로 줄 수 없음.
          여행 전 <strong>$1·$5·£1·€1 등 소액 지폐 충분히 환전</strong>이 핵심.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 단체 식사에 자동 팁이 붙는 이유?</summary>
        <p style={faqAnswer}>
          미국·캐나다는 <strong>6명 이상 단체 식당</strong> 이용 시 자동 <strong>18% 팁(Auto Gratuity)</strong>이 청구됩니다.
          이유:<br />
          • 단체는 결제·계산이 복잡해 직원 부담 ↑<br />
          • 일행 중 한 명이 팁을 안 주면 분배 어려움<br />
          • 매장 정책으로 일관성 확보<br />
          영수증 하단에 &quot;<strong>Gratuity 18% included</strong>&quot; 표시. <strong>또 팁을 추가하지 마세요</strong> — 이중 팁이 됩니다.
          서비스가 매우 좋았다면 추가 2~5%만 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 호텔 벨보이·룸메이드 팁 얼마?</summary>
        <p style={faqAnswer}>
          <strong>현금 + 정액제</strong>가 원칙:<br />
          • <strong>벨보이 (Bellboy)</strong>: 짐 1개당 $1~2 (5성급은 $2~3)<br />
          • <strong>도어맨 (Doorman)</strong>: 택시 잡아주면 $1~2<br />
          • <strong>룸메이드 (Housekeeper)</strong>: 매일 아침 베개 위 $2~5 (체크아웃 시 한 번에 X — 매일 사람이 다름)<br />
          • <strong>컨시어지 (Concierge)</strong>: 특별 예약·티켓 도움 시 $5~20<br />
          • <strong>룸서비스</strong>: 영수증에 이미 18% 포함 多 → 확인 후 추가<br />
          유럽은 약 절반 (€1~2). 동남아는 호텔 등급별 다름 (5성급은 미국 수준).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 우버·택시는 팁 필수인가?</summary>
        <p style={faqAnswer}>
          • <strong>🇺🇸 미국·🇨🇦 캐나다</strong>: <strong>15~20% 필수</strong>. 우버 앱에서 도착 후 입력 가능 (잊지 말 것)<br />
          • <strong>🇪🇺 유럽</strong>: 잔돈 반올림 (€10.50 → €11 등) 또는 5%<br />
          • <strong>🇯🇵 일본</strong>: X (오히려 거절)<br />
          • <strong>🇸🇬 싱가포르·🇭🇰 홍콩</strong>: X 또는 잔돈<br />
          • <strong>🇹🇭 태국·🇻🇳 베트남</strong>: 미터 사용 시 잔돈만, 흥정 가격엔 별도 X<br />
          짐을 트렁크에 실어주거나 특별 도움 시 추가 $1~5.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 동남아 마사지 팁은 얼마?</summary>
        <p style={faqAnswer}>
          한국 관광객에게 가장 인기 있는 카테고리입니다 (가성비 최고).<br />
          • <strong>🇹🇭 태국</strong>: <strong>50~100바트</strong> (1시간 마사지 기준). 1회 200바트 정도 = 매우 만족<br />
          • <strong>🇮🇩 발리</strong>: <strong>Rp 10,000~50,000</strong><br />
          • <strong>🇵🇭 필리핀</strong>: <strong>50~100페소</strong><br />
          • <strong>🇻🇳 베트남</strong>: <strong>VND 20,000~50,000</strong><br />
          ※ 5성급 호텔 스파는 비율(15~20%) 적용. 로컬 마사지샵은 정액 권장.
          마사지사 손에 직접 (사장님 X). 봉투에 넣어주면 더 좋음.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 골프 캐디 팁 (동남아)?</summary>
        <p style={faqAnswer}>
          한국 골프투어객의 핵심 페인 포인트입니다.<br />
          • <strong>🇵🇭 필리핀 (클락·세부)</strong>: 캐디 <strong>200~500페소</strong>, 캐디 마스터 100페소<br />
          • <strong>🇹🇭 태국</strong>: 캐디 <strong>500~800바트</strong> (1라운드)<br />
          • <strong>🇻🇳 베트남 (다낭·하노이)</strong>: 캐디 <strong>VND 200,000~500,000</strong><br />
          • <strong>🇮🇩 인도네시아</strong>: 캐디 <strong>Rp 100,000~200,000</strong><br />
          ※ <strong>현금 필수</strong> (페소·바트 등 현지 통화). 만족도가 매우 좋으면 1.5~2배.
          단체 라운드면 캐디·캐디 마스터·골프장 도우미·기사 모두 별도 준비.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 팁을 안 주면 어떻게 되나요?</summary>
        <p style={faqAnswer}>
          국가별로 결과가 매우 다릅니다:<br />
          • <strong>🇺🇸 미국</strong>: 큰 결례. 직원이 따라 나와 항의할 수도 (인종차별로 오해될 위험). 다음 방문 시 서비스 X<br />
          • <strong>🇪🇺 유럽</strong>: 무례하게 보이지만 큰 문제 X<br />
          • <strong>🇯🇵 일본·🇨🇳 중국</strong>: 오히려 안 주는 게 정상<br />
          • <strong>🇹🇭 동남아</strong>: 서운해 하지만 강제 X<br />
          미국은 직원 시급이 매우 낮고 (팁 포함 시급) 팁이 생계 — 안 주면 직원 임금이 깎이는 구조.
          그래서 미국·캐나다 식당·우버는 <strong>예산에 팁을 미리 포함</strong>해 계산하는 것이 마음 편합니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 여행 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
        <Link href="/tools/unit/size" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🛍️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외 직구 사이즈</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            US·EU·UK → 한국 사이즈
          </p>
        </Link>
        <Link href="/tools/life/dutch" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍻</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>더치페이 N빵</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 일행 더치페이 정산
          </p>
        </Link>
      </div>
    </div>
  )
}
