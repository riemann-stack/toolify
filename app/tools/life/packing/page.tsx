import Link from 'next/link'
import PackingClient from './PackingClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/packing',
  title: '여행 짐 계산기 — 일수·기온·세탁 → 카테고리별 개수 + 체크리스트',
  description: '일수·기온·세탁 가능·활동량·사진 중요도로 카테고리별 옷 개수 + 최소·넉넉 2버전 체크리스트와 캐리어 추천.',
  keywords: ['여행 옷 개수', '여행 짐 싸기', '패킹 리스트', '캐리어 사이즈', '5박 옷 몇 벌', '한 달 살기', '여행 체크리스트', '항공사 수하물', '신혼여행 패킹', '아기 동반 여행'],
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

export default function PackingPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧳 여행 짐 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        일수·기온·세탁 가능·활동량으로 카테고리별 옷 개수 + <strong style={{ color: 'var(--text)' }}>최소·넉넉 2버전</strong>.
      </p>

      <PackingClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>여행 일수·인원 입력</strong> — 슬라이더로 1~30일</li>
          <li><strong>기온대 선택</strong> — 6 단계 (-10°C ~ 30°C+)</li>
          <li><strong>세탁·활동량·사진·옵션</strong> 선택 → 자동 보정</li>
          <li><strong>최소/넉넉 2 버전 비교</strong> + 짐 무게 + 캐리어 추천</li>
          <li><strong>체크리스트 탭</strong>에서 옷 + 세면·약·서류 8 카테고리 통합 체크</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>시나리오 탭</strong>에서 신혼·동남아·유럽·골프·캠핑·아기 동반 6가지 자동 입력 가능.
          체크리스트는 클립보드 복사로 가족·친구와 공유.
        </p>
      </div>

      {/* 2. 일수별 옷 개수 */}
      <h2 style={sectionTitle}>📅 여행 일수별 옷 개수 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>일수</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>상의</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>하의</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>속옷·양말</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>총 무게</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['3박',  '3~4벌', '2벌', '4세트', '~5kg'],
                ['5박',  '4~6벌', '2~3벌', '6세트', '~7kg'],
                ['7박',  '5~7벌', '3벌', '8세트', '~9kg'],
                ['10박', '6~8벌', '3~4벌', '11세트', '~11kg'],
                ['14박 (2주)', '7~10벌 (세탁 활용)', '4벌', '15세트', '~13kg'],
                ['30박 (한 달)', '10~12벌 (매일 세탁)', '4~5벌', '15~20세트', '~15kg'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      textAlign: j === 0 ? 'left' : 'right',
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
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }}>
          ※ <strong style={{ color: 'var(--text)' }}>중간 활동·환절기 기준</strong>. 세탁 가능하면 -30~50%, 한여름·운동·격식 일정은 +20~30%.
        </div>
      </div>

      {/* 3. 기온대별 가이드 */}
      <h2 style={sectionTitle}>🌡️ 기온대별 옷 가이드</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '❄️ 혹한 (-10°C↓)', d: '두꺼운 니트·플리스·기모. 롱패딩·롱코트. 내복·핫팩·털모자·장갑·머플러 필수.', c: '#0891B2' },
            { t: '🥶 겨울 (0~10°C)', d: '니트·후리스·긴팔. 패딩·트렌치. 머플러·장갑.', c: '#9B59B6' },
            { t: '🍂 봄·가을 (10~20°C)', d: '긴팔·맨투맨·셔츠. 자켓·가디건·바람막이. 일교차 큼 → 레이어드.', c: '#D97706' },
            { t: '🌤️ 초여름 (20~25°C)', d: '반팔·긴팔 혼용. 가벼운 가디건 (실내 냉방). 우산·선글라스.', c: '#0D9488' },
            { t: '☀️ 여름 (25~30°C)', d: '반팔·민소매·린넨. 모자·선글라스·선크림 SPF 50+.', c: '#EA580C' },
            { t: '🔥 한여름 (30°C↑)', d: '통풍 셔츠·드라이핏·민소매. 수영복 2벌. 휴대용 선풍기.', c: '#DB2777' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 세탁 전략 */}
      <h2 style={sectionTitle}>🧺 세탁 가능 여부에 따른 패킹 전략</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>❌ 세탁 불가</strong>: 일수만큼 옷 필요 (5박 = 5벌+). 캐리어 1.5배 증가</li>
          <li><strong style={{ color: 'var(--text)' }}>🌀 코인·호텔 세탁 (3~4일에 1회)</strong>: 옷 절반 가능 (5박 = 3벌)</li>
          <li><strong style={{ color: 'var(--text)' }}>🧺 숙소 매일 세탁</strong>: 옷 1/3 가능 (5박 = 2~3벌). <strong>장기 여행 추천</strong></li>
          <li><strong style={{ color: 'var(--text)' }}>💡 압축팩 활용</strong>: 부피 -30%, 캐리어 한 단계 작게 가능</li>
          <li><strong style={{ color: 'var(--text)' }}>💡 호텔 세탁 가격</strong>: 동남아 1벌 1~3천원, 유럽·미국 1벌 5~10천원 (코인세탁기가 가성비)</li>
        </ul>
      </div>

      {/* 5. 캐리어 사이즈 */}
      <h2 style={sectionTitle}>🛄 캐리어 사이즈·항공사 수하물</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>캐리어</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>크기</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>용량</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>적합한 일수</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🎒 백팩·기내 휴대 (20인치)', '~ 55cm', '~ 7kg', '1~3박 / 비즈니스 출장'],
                ['🧳 24인치 (중형)',           '~ 65cm', '~ 15kg', '3~7박 / 가벼운 자유여행'],
                ['🧳 28인치 (대형)',           '~ 75cm', '~ 23kg', '7박~ / 가족·장기 여행'],
                ['🧳 28인치+ (특대)',          '75cm+',  '23~32kg', '한 달~ / 이주·유학'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      textAlign: j === 0 ? 'left' : (j === 3 ? 'left' : 'right'),
                      fontFamily: j === 0 || j === 3 ? 'Noto Sans KR, sans-serif' : 'Inter, system-ui, sans-serif',
                      color: j === 0 || j === 3 ? 'var(--text)' : 'var(--accent)',
                      fontWeight: j === 0 ? 700 : 600,
                      fontSize: 12.5,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }}>
          ※ 항공사·노선·등급별 한도 다름:<br />
          • <strong style={{ color: 'var(--text)' }}>LCC</strong>: 기내 7~10kg, 위탁 15~20kg (추가 요금 多)<br />
          • <strong style={{ color: 'var(--text)' }}>풀서비스</strong>: 기내 7~12kg, 위탁 23kg 표준 (대한항공·아시아나)<br />
          • <strong style={{ color: 'var(--text)' }}>비즈니스·퍼스트</strong>: 위탁 32kg × 2개
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 5박 6일 여행에 옷 몇 벌이 적당한가요?</summary>
        <p style={faqAnswer}>
          중간 활동·환절기 기준 1인:<br />
          • <strong>👕 상의</strong>: 4~6벌 (세탁 가능 시 3~4벌)<br />
          • <strong>👖 하의</strong>: 2~3벌 (3일에 1벌)<br />
          • <strong>🩲 속옷·양말</strong>: 6세트 (일수+1)<br />
          • <strong>🧥 아우터</strong>: 1~2벌 (날씨에 따라)<br />
          • <strong>👟 신발</strong>: 1~2족<br />
          여름은 -1벌, 겨울은 +1벌, 격식·운동복 추가 시 +1세트씩.
          본 도구의 <strong>옷 계산 탭</strong>에서 본인 조건으로 정확히 계산.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 한 달 살기는 몇 벌 가져가야?</summary>
        <p style={faqAnswer}>
          <strong>매일 세탁이 가능하다면 옷은 7~10벌이면 충분</strong>합니다. 핵심은 <strong>세탁</strong>:<br />
          • 상의 7~10벌, 하의 4~5벌, 속옷·양말 7~10세트<br />
          • 빨래비누·세제 1~2개 + 빨랫줄 (호스텔)<br />
          • 코인세탁기·에어비앤비 세탁기 활용 (3~4일에 1회)<br />
          • 현지에서 옷 구입도 좋은 옵션 (동남아·유럽 가성비)<br />
          한 달 살기는 <strong>옷보다 필수품(약·전자기기·서류)</strong>가 더 중요. 가벼운 캐리어 + 큰 보조가방 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 세탁 가능하면 옷을 얼마나 줄일 수 있나요?</summary>
        <p style={faqAnswer}>
          • <strong>매일 세탁</strong>: 옷 <strong>1/3 가능</strong> (5박 → 2~3벌)<br />
          • <strong>3~4일에 1회 세탁</strong>: 옷 <strong>절반 가능</strong> (5박 → 3벌)<br />
          • <strong>세탁 불가</strong>: 일수만큼 (5박 → 5벌)<br />
          호텔·에어비앤비 예약 시 <strong>세탁기 유무 확인</strong>이 짐 무게에 큰 영향. 동남아 호텔 세탁은 1벌 1~3천원으로 매우 저렴해 자주 활용 가능.
          유럽은 1벌 5~10천원으로 비싸므로 <strong>코인세탁소(Laundromat)</strong> 활용 추천.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 여름 vs 겨울 패킹 차이는?</summary>
        <p style={faqAnswer}>
          • <strong>여름</strong>: 옷이 가벼움 → 캐리어 작게 가능. 단 <strong>땀으로 자주 갈아입어</strong> 옷 수는 +30%. 수영복·모자·선크림 필수<br />
          • <strong>겨울</strong>: 옷이 무겁고 부피 큼 → <strong>캐리어 1단계 큼</strong>. 패딩·니트·내복으로 압축팩 효과 큼<br />
          • <strong>아우터 차이</strong>: 여름 1벌(가벼움) vs 겨울 2~3벌(부피 大)<br />
          • <strong>신발 차이</strong>: 여름 슬리퍼·운동화, 겨울 부츠 (무거움)<br />
          겨울 여행은 <strong>입고 출국 + 위탁</strong> 조합으로 무게 분산. 패딩·코트는 입고 비행기 탑승.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 캐리어 기내 vs 위탁 어떻게 결정?</summary>
        <p style={faqAnswer}>
          • <strong>3박 이하 + 7kg 미만</strong>: 기내 휴대 (시간 절약·분실 0)<br />
          • <strong>4~7박</strong>: 24인치 위탁 (일반)<br />
          • <strong>7박+ 또는 가족</strong>: 28인치 위탁<br />
          기내 장점:<br />
          • 공항 대기 시간 0<br />
          • 분실·지연 위험 0<br />
          • 추가 요금 X (일부 LCC 제외)<br />
          위탁 장점:<br />
          • 액체·기내 금지품 자유 (액체 100ml 룰 X)<br />
          • 무게 한도 큼 (15~23kg)<br />
          • 짐 무게 어깨 부담 X<br />
          출장·짧은 여행은 <strong>기내</strong>, 가족·휴양은 <strong>위탁</strong> 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 압축팩 효과는?</summary>
        <p style={faqAnswer}>
          <strong>부피 -30~50% 가능</strong> (무게는 동일). 특히 효과적인 항목:<br />
          • <strong>패딩·플리스</strong>: -50% (가장 큼)<br />
          • <strong>니트·이불</strong>: -40%<br />
          • <strong>일반 의류</strong>: -20~30%<br />
          • <strong>속옷·양말</strong>: -30%<br />
          종류:<br />
          • <strong>롤업 압축팩</strong> (진공 X, 손으로 말기): 다이소 1~3천원, 가성비 ⭐<br />
          • <strong>진공 압축팩 + 펌프</strong>: 더 강력하지만 부피 큰 펌프 필요<br />
          ⚠️ 단점: 옷이 구겨짐 (도착 후 다림질 필요), 캐리어가 작아져도 무게 한도 초과 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 신발 몇 켤레 가져가야?</summary>
        <p style={faqAnswer}>
          최소 1족 + 추가 1~2족 (활동 따라):<br />
          • <strong>도시 관광</strong>: 편한 운동화 1족 (매일 1만보+)<br />
          • <strong>휴양</strong>: 운동화 + 슬리퍼·아쿠아슈즈<br />
          • <strong>비치</strong>: 슬리퍼·샌들 + 아쿠아슈즈<br />
          • <strong>등산</strong>: 트레킹화 + 운동화<br />
          • <strong>격식·디너</strong>: + 구두·드레스슈즈<br />
          • <strong>골프</strong>: 골프화 + 일반화<br />
          신발은 부피·무게 큼 → 가능하면 <strong>입고 출국 + 1족만 추가</strong>가 최선. 캐리어 바닥에 신발 → 공간 비우는 핵심.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 가족 여행 짐 어떻게 분배?</summary>
        <p style={faqAnswer}>
          4인 가족 7박 기준:<br />
          • <strong>부부 28인치 캐리어 1개</strong> (위탁 23kg) — 부모 옷·공동 짐<br />
          • <strong>큰아이 24인치</strong> — 본인 옷 + 학용품<br />
          • <strong>작은아이 기내 캐리어</strong> — 본인 옷·장난감<br />
          • <strong>공동 백팩 1개</strong> — 카메라·태블릿·여권·비상약<br /><br />
          전략:<br />
          • <strong>옷은 1캐리어에 모음</strong> (분실 시 분산 위험)<br />
          • <strong>아기 동반 시</strong> 추가 가방 (기저귀·이유식·아기띠)<br />
          • <strong>공항에서 가족 4인이면</strong> 카트 + 짐 분산 (한 사람에게 몰리지 않게)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 골프·등산 패킹 차이?</summary>
        <p style={faqAnswer}>
          <strong>⛳ 골프투어 (4박)</strong>:<br />
          • 골프복 4세트 (라운드별)<br />
          • 골프 장갑 2~3개 (땀에 젖음)<br />
          • 골프화 + 일반화<br />
          • 골프공·티 (현지 비싸요)<br />
          • 비옷·우산 (스콜 대비)<br />
          • 골프백 별도 위탁 (23kg)<br /><br />
          <strong>🎒 등산·캠핑 (3박)</strong>:<br />
          • 등산복 2세트 (땀)<br />
          • 등산화·트래킹화<br />
          • 방수 자켓·바람막이<br />
          • 모기·벌레 퇴치제<br />
          • 헤드랜턴<br />
          • 응급 키트 (찰과상·뱀·벌)<br />
          공통: <strong>운동복 + 운동화 + 비상약</strong> 필수. 시나리오 탭에서 자동 입력 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 아기 동반 여행 추가 항목?</summary>
        <p style={faqAnswer}>
          아기 짐만 별도 캐리어가 필요할 정도입니다:<br />
          • <strong>기저귀</strong>: 1일 5~7장 × 일수 + 여유분 (현지 가격·브랜드 다름)<br />
          • <strong>물티슈</strong>: 충분히<br />
          • <strong>분유·이유식</strong>: 현지 어려움 — 충분히<br />
          • <strong>젖병·이유식 도구</strong> + 보온병<br />
          • <strong>아기띠 + 휴대용 유모차</strong> (기내 무료)<br />
          • <strong>담요·블랭킷·인형</strong><br />
          • <strong>아기 옷</strong>: 1일 2~3벌 (음식 흘림·기저귀 누수)<br />
          • <strong>아기 약·체온계·해열제</strong><br />
          • <strong>장난감·이어폰</strong> (기내 칭얼이 대비)<br />
          • <strong>카시트</strong>: 렌터카 시 (동남아 X 多)<br />
          시나리오 탭의 <strong>아기 동반 가족여행</strong> 자동 입력 활용.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 여행 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/life/travel-budget" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 예산 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18 도시 × 3 스타일
          </p>
        </Link>
        <Link href="/tools/life/travel-tip" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 팁 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18국 × 9 서비스
          </p>
        </Link>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
      </div>
    </div>
  )
}
