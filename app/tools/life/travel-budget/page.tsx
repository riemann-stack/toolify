import Link from 'next/link'
import TravelBudgetClient from './TravelBudgetClient'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/life/travel-budget',
  title: '해외여행 예산 계산기 — 18개 도시 × 3 스타일 + 9 항목 자동',
  description: '18개 도시(일본·유럽·동남아·미국) × 3스타일(배낭·중간·럭셔리) 평균 + 9 항목 자동 추천과 도시 평균 비교를 도넛 차트로.',
  keywords: ['해외여행 예산', '일본 여행 비용', '유럽 자유여행', '동남아 1주일', '여행 견적', '항공권 평균', '숙박비', '여행 스타일', '배낭여행', '럭셔리 여행'],
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

const FAQ_LD = [
  { "q":"일본 5박 6일 여행 비용 평균은?","a":"도쿄·오사카 기준 (1인): • 🎒 배낭: 항공 25만 + 5박 × 25만 = 약 150만원 • 🧳 중간: 항공 40만 + 5박 × 38만 = 약 230만원 • 🥂 럭셔리: 항공 80만 + 5박 × 75만 = 약 455만원 (성수기는 +30~50%) 후쿠오카·삿포로는 약 -15% 더 저렴. 정확한 견적은 본 도구의 자동 채우기로 본인 조건에 맞춰 계산하세요." },
  { "q":"동남아 1주일 예산은 얼마면 충분?","a":"7박 8일 기준 (1인): • 🇹🇭 방콕·푸켓 중간 스타일: 항공 60만 + 7박 × 24만 = 약 230만원 • 🇻🇳 다낭·하노이: 항공 60만 + 7박 × 22만 = 약 215만원 • 🇵🇭 세부·보라카이: 항공 60만 + 7박 × 29만 = 약 265만원 • 🇮🇩 발리: 항공 80만 + 7박 × 25만 = 약 255만원 배낭 스타일은 위의 60~70%, 럭셔리는 200%+. 비수기 + LCC 활용 시 -30% 절감 가능." },
  { "q":"유럽 자유여행 보통 얼마?","a":"7~10일 기준 (1인, 중간 스타일): • 🇫🇷 파리 7일: 항공 120만 + 7박 × 81만 = 약 690만원 • 🇮🇹 이탈리아 10일 (로마·피렌체·베네치아): 항공 120만 + 10박 × 73만 = 약 850만원 • 🇪🇸 스페인 7일: 항공 120만 + 7박 × 62만 = 약 555만원 • 🇬🇧 영국 7일: 항공 120만 + 7박 × 102만 = 약 835만원 유럽은 항공권 비중이 큼 — 비수기·경유편으로 -20~30% 절감 가능. 다국가 투어는 유레일·LCC 활용." },
  { "q":"항공권은 언제 사야 가장 싼가?","a":"일반적인 가이드: • 일본·동남아: 출발 2~3개월 전 • 미국·유럽: 출발 3~5개월 전 • 오세아니아: 출발 4~6개월 전 • 비수기: 4·5·9·10·11월 (한국 명절·연휴 외) • 요일: 화·수요일 출발이 비교적 저렴한 경향 (특정 요일·시간이 항상 최저는 아님) • 비교 사이트: 스카이스캐너·구글 플라이트·카약·트립닷컴 ⚠️ 여름 휴가·설·추석은 무조건 비싸므로 6개월 전 예매 권장." },
  { "q":"숙박·식비를 줄이는 방법?","a":"숙박: • 호스텔·게스트하우스: 도미토리 2~5만원/박 • 에어비앤비·부킹닷컴: 1~2주 단위 할인 多 • 쿠팡·트립닷컴 한국 카드 할인 • 도시 외곽·역세권 외 = 최대 -50% 식비: • 로컬 식당·시장·푸드코트 (3~5천원·태국·베트남) • 편의점·마트 활용 (도시락·과일) • 구글맵 평점 4.0~4.3이 가성비 좋음 • 호텔 조식 vs 외부 = 일본·유럽은 호텔 조식 가성비, 동남아는 외부." },
  { "q":"여행자보험 꼭 들어야 하나?","a":"강력 권장입니다. 1주일 1인 약 2~5만원으로 큰 보장. • 해외 의료비: 미국·유럽은 응급실 1회 200~500만원도 흔함 • 항공 지연·취소: 호텔비·항공 재예매 보상 • 분실·도난: 가방·노트북·카메라 보상 • 코로나·풍토병 격리 보상 • 법적 분쟁·구조비 한국 카드 일부는 자동 가입 (해외이용·골드카드) — 보장 한도 확인 필수. 자체 보험 없으면 월 1~3만원 카드 무료보험도 활용 가능." },
  { "q":"통신·로밍 얼마 잡아야?","a":"1주일 기준: • eSim (에어랄로·코코·홀리피쉬): 일본 1~3만원, 동남아 1~2만원, 유럽 2~5만원 ⭐ 추천 • Wi-Fi 도시락 (도시락·말톡): 일 5~7천원 (1주 4~5만원) • 현지 유심: 공항 구입, 일주일 2~5만원 • 통신사 로밍 (T·KT·LG): 일 1~1.5만원, 비싸지만 편리 가족 여행은 Wi-Fi 도시락 1대로 공유 가능 (가성비 ↑). 1인은 eSim이 가장 유리." },
  { "q":"환전 vs 카드 vs 트래블월렛 어느 게 유리?","a":"용도별 다름: • 현금 환전: 약 1~3% 수수료. 시장·소액·팁용. 한국 시중은행·환전소 비교 (서울역 외환·인천공항 환전소). • 해외 신용카드 (마스터·비자): 약 1.5~2% 수수료 + 1.1% 해외이용. 큰 결제·식당·호텔. • 트래블월렛·트래블로그·SOL트래블 ⭐ 주요 통화 환전 수수료 0%(통화·한도·시간대별 조건 상이), 체크카드처럼 사용. 최근 가장 인기. • 현지 ATM 출금: 일 수수료 + 환전 손실 — 비추. 추천 조합: 트래블월렛·트래블로그 + 일부 현금 + 해외 신용카드 1장." },
  { "q":"예비비 10~20% 왜 추가하나요?","a":"예상치 못한 지출이 항상 발생하기 때문입니다. • 항공 지연 → 호텔 추가 • 도난·분실 → 재구매 • 의료비·약값 • 환율 변동 (출국 전 vs 현지) • 충동 구매·기념품·즉흥 투어 • 친구·가족 선물 예비비 없으면 카드 한도 부족·귀국 후 결제 부담으로 스트레스. 일반 여행 10%, 새 국가 15%, 장기·모험 20% 권장." },
  { "q":"단체 여행이 1인 여행보다 싸나?","a":"일반적으로 단체가 더 쌉니다 (1인당 비용 기준): • 숙박: 2인 1실이 1인보다 50~70% 절감 (싱글룸 차지 X) • 택시·우버: 4명 분할 시 1/4 비용 • 투어·식사: 단체 할인·세트 메뉴 가능 • 항공권: 동일 (인당 동일) 단점: • 의견 조율·일정 충돌 • 식성·취향 차이 단, 패키지여행은 자유여행 대비 -20~40% 가능 (대신 자유도 ↓)." }
]

export default function TravelBudgetPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ✈️ 해외여행 예산 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        18개 도시 × 배낭·중간·럭셔리 3스타일 평균 + <strong style={{ color: 'var(--text)' }}>9개 항목 자동 추천</strong>을 도넛 차트로.
      </p>

      <TravelBudgetClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>도시·스타일·시즌·항공사 선택</strong> — 18 도시 × 3 스타일</li>
          <li><strong>일수·인원 입력</strong> — 자동 채우기 버튼으로 9 항목 자동 추천</li>
          <li><strong>9 항목 조정</strong> — 본인 예산에 맞게 미세 조정</li>
          <li><strong>예비비 10~20%</strong> 추가 (예상치 못한 지출 대비)</li>
          <li><strong>결과 확인</strong> — 총비용 + 1인당 + 하루 평균 + 도넛 + 평균 비교</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>3 스타일 비교 탭</strong>에서 같은 일정을 배낭/중간/럭셔리 동시 견적 가능.
          <strong style={{ color: 'var(--accent)' }}> 항목 진단 탭</strong>은 본인 예산이 평균 대비 과다·과소인지 자동 분석.
        </p>
      </div>

      {/* 2. 도시별 1박 평균 */}
      <h2 style={sectionTitle}>🌆 도시별 1박 평균 비용 (인기 도시 12곳 — 전체 18곳은 위 계산기)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>도시</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>🎒 배낭</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>🧳 중간</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>🥂 럭셔리</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🇯🇵 도쿄·오사카',     '25만원',   '38만원',  '75만원'],
                ['🇯🇵 후쿠오카·삿포로', '21만원',   '32만원',  '62만원'],
                ['🇹🇭 방콕·푸켓',       '13만원',   '24만원',  '50만원'],
                ['🇻🇳 다낭·하노이',     '12만원',   '22만원',  '43만원'],
                ['🇵🇭 세부·보라카이',   '16만원',   '29만원',  '58만원'],
                ['🇮🇩 발리',           '13만원',   '25만원',  '58만원'],
                ['🇸🇬 싱가포르',       '31만원',   '55만원',  '110만원'],
                ['🇭🇰 홍콩',           '38만원',   '65만원',  '130만원'],
                ['🇹🇼 대만',           '18만원',   '31만원',  '58만원'],
                ['🇺🇸 LA·뉴욕·하와이', '55만원',   '95만원',  '190만원'],
                ['🇫🇷 파리',           '47만원',   '81만원',  '160만원'],
                ['🇬🇧 영국',           '58만원',   '102만원', '200만원'],
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
          ※ <strong style={{ color: 'var(--text)' }}>1박 1인 기준</strong>, 숙박+식비+교통/투어 합계, 항공권 별도.
          2024년경 대략적 평균치(2인 1실·중급 식당 가정, 세금·팁 제외)이며 시기·환율·취향에 따라 ±30% 이상 차이.
          묶음 표기 도시(도쿄·오사카, LA·뉴욕·하와이 등)는 도시 간 편차가 큽니다.
        </div>
      </div>

      {/* 3. 시즌별 항공권 */}
      <h2 style={sectionTitle}>✈️ 시즌별 항공권 평균 (LCC vs 풀서비스)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>지역</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>LCC 비수기</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>LCC 성수기</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>풀서비스 비수기</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>풀서비스 성수기</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🇯🇵 일본',           '25만',  '50만',  '40만',  '80만'],
                ['🇹🇭 동남아',         '35만',  '70만',  '60만',  '120만'],
                ['🇺🇸 미국·하와이',   '100만', '180만', '130만', '250만'],
                ['🇪🇺 유럽',           '90만',  '160만', '120만', '220만'],
                ['🇦🇺 호주·뉴질랜드', '80만',  '150만', '110만', '200만'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      textAlign: j === 0 ? 'left' : 'right',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'Inter, system-ui, sans-serif',
                      color: 'var(--text)',
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
          ※ <strong style={{ color: 'var(--text)' }}>왕복 1인 기준</strong>, 인천 출발. 비수기 4·5·9·10·11월 / 성수기 7·8·12·1월·연휴.
        </div>
      </div>

      {/* 4. 여행 스타일 */}
      <h2 style={sectionTitle}>🎒 여행 스타일 (배낭·중간·럭셔리) 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🎒 배낭여행', d: '호스텔 도미토리·로컬 식당·대중교통·박물관 무료. 자유로움·대화·문화 체험.', range: '하루 약 5~20만원', c: '#0D9488' },
            { t: '🧳 중간 (Mid-range)', d: '3~4성 호텔·일반 식당·기본 투어·시티패스. 가성비 최고.', range: '하루 약 12~40만원', c: '#D97706' },
            { t: '🥂 럭셔리', d: '5성 호텔·미슐랭·프라이빗 투어·비즈니스 항공. 휴식·기념일.', range: '하루 약 30~100만원', c: '#DB2777' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 6px', lineHeight: 1.7 }}>{g.d}</p>
              <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, margin: 0 }}>{g.range}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          위 1인 하루 범위(항공 제외, 현지비)는 <strong style={{ color: 'var(--text)' }}>도시별 차이가 큽니다</strong> — 동남아는 낮고 일본·유럽·미국은 높습니다(위 도시 표 참고).
          한국 일반 여행객은 <strong style={{ color: 'var(--text)' }}>중간 스타일</strong>이 가장 만족도 높고, 신혼·기념일은 럭셔리, 학생·장기 여행은 배낭이 일반적.
        </p>
      </div>

      {/* 5. 예비비 */}
      <h2 style={sectionTitle}>💰 예비비 — 왜 10~20% 추가해야 하나</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          여행 중 예상치 못한 지출이 항상 발생합니다. <strong>예비비를 따로 잡지 않으면</strong> 카드 한도 부족·환전 추가·귀국 후 결제 지연 등 스트레스로 이어져요.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>일반 여행 (재방문 도시)</strong>: <strong>10%</strong> 권장</li>
          <li><strong style={{ color: 'var(--text)' }}>새 국가·자유여행</strong>: <strong>15%</strong> (예약 변경·교통비 추가)</li>
          <li><strong style={{ color: 'var(--text)' }}>장기 여행·모험·하이시즌</strong>: <strong>20%+</strong> (현지 예약·환율 변동)</li>
          <li><strong style={{ color: 'var(--text)' }}>주요 예상치 못한 지출</strong>: 분실 도난·급한 의료·항공 지연·숙소 변경·현지 투어 추가·기념품·환전 손실</li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 일본 5박 6일 여행 비용 평균은?</summary>
        <p style={faqAnswer}>
          도쿄·오사카 기준 (1인):<br />
          • <strong>🎒 배낭</strong>: 항공 25만 + 5박 × 25만 = 약 <strong>150만원</strong><br />
          • <strong>🧳 중간</strong>: 항공 40만 + 5박 × 38만 = 약 <strong>230만원</strong><br />
          • <strong>🥂 럭셔리</strong>: 항공 80만 + 5박 × 75만 = 약 <strong>455만원</strong><br />
          (성수기는 +30~50%) 후쿠오카·삿포로는 약 -15% 더 저렴.
          정확한 견적은 본 도구의 자동 채우기로 본인 조건에 맞춰 계산하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 동남아 1주일 예산은 얼마면 충분?</summary>
        <p style={faqAnswer}>
          7박 8일 기준 (1인):<br />
          • <strong>🇹🇭 방콕·푸켓 중간 스타일</strong>: 항공 60만 + 7박 × 24만 = 약 <strong>230만원</strong><br />
          • <strong>🇻🇳 다낭·하노이</strong>: 항공 60만 + 7박 × 22만 = 약 <strong>215만원</strong><br />
          • <strong>🇵🇭 세부·보라카이</strong>: 항공 60만 + 7박 × 29만 = 약 <strong>265만원</strong><br />
          • <strong>🇮🇩 발리</strong>: 항공 80만 + 7박 × 25만 = 약 <strong>255만원</strong><br />
          배낭 스타일은 위의 60~70%, 럭셔리는 200%+. 비수기 + LCC 활용 시 -30% 절감 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 유럽 자유여행 보통 얼마?</summary>
        <p style={faqAnswer}>
          7~10일 기준 (1인, 중간 스타일):<br />
          • <strong>🇫🇷 파리 7일</strong>: 항공 120만 + 7박 × 81만 = 약 <strong>690만원</strong><br />
          • <strong>🇮🇹 이탈리아 10일 (로마·피렌체·베네치아)</strong>: 항공 120만 + 10박 × 73만 = 약 <strong>850만원</strong><br />
          • <strong>🇪🇸 스페인 7일</strong>: 항공 120만 + 7박 × 62만 = 약 <strong>555만원</strong><br />
          • <strong>🇬🇧 영국 7일</strong>: 항공 120만 + 7박 × 102만 = 약 <strong>835만원</strong><br />
          유럽은 항공권 비중이 큼 — 비수기·경유편으로 -20~30% 절감 가능. 다국가 투어는 유레일·LCC 활용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 항공권은 언제 사야 가장 싼가?</summary>
        <p style={faqAnswer}>
          일반적인 가이드:<br />
          • <strong>일본·동남아</strong>: 출발 2~3개월 전<br />
          • <strong>미국·유럽</strong>: 출발 3~5개월 전<br />
          • <strong>오세아니아</strong>: 출발 4~6개월 전<br />
          • <strong>비수기</strong>: 4·5·9·10·11월 (한국 명절·연휴 외)<br />
          • <strong>요일</strong>: 화·수요일 출발이 비교적 저렴한 경향 (특정 요일·시간이 항상 최저는 아님)<br />
          • <strong>비교 사이트</strong>: 스카이스캐너·구글 플라이트·카약·트립닷컴<br />
          ⚠️ 여름 휴가·설·추석은 무조건 비싸므로 6개월 전 예매 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 숙박·식비를 줄이는 방법?</summary>
        <p style={faqAnswer}>
          숙박:<br />
          • <strong>호스텔·게스트하우스</strong>: 도미토리 2~5만원/박<br />
          • <strong>에어비앤비·부킹닷컴</strong>: 1~2주 단위 할인 多<br />
          • <strong>쿠팡·트립닷컴</strong> 한국 카드 할인<br />
          • 도시 외곽·역세권 외 = 최대 -50%<br /><br />
          식비:<br />
          • <strong>로컬 식당·시장·푸드코트</strong> (3~5천원·태국·베트남)<br />
          • <strong>편의점·마트</strong> 활용 (도시락·과일)<br />
          • <strong>구글맵 평점 4.0~4.3</strong>이 가성비 좋음<br />
          • 호텔 조식 vs 외부 = 일본·유럽은 호텔 조식 가성비, 동남아는 외부.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 여행자보험 꼭 들어야 하나?</summary>
        <p style={faqAnswer}>
          <strong>강력 권장</strong>입니다. 1주일 1인 약 2~5만원으로 큰 보장.<br />
          • <strong>해외 의료비</strong>: 미국·유럽은 응급실 1회 200~500만원도 흔함<br />
          • <strong>항공 지연·취소</strong>: 호텔비·항공 재예매 보상<br />
          • <strong>분실·도난</strong>: 가방·노트북·카메라 보상<br />
          • <strong>코로나·풍토병 격리</strong> 보상<br />
          • <strong>법적 분쟁·구조비</strong><br />
          한국 카드 일부는 자동 가입 (해외이용·골드카드) — 보장 한도 확인 필수. 자체 보험 없으면 <strong>월 1~3만원 카드 무료보험</strong>도 활용 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 통신·로밍 얼마 잡아야?</summary>
        <p style={faqAnswer}>
          1주일 기준:<br />
          • <strong>eSim (에어랄로·코코·홀리피쉬)</strong>: 일본 1~3만원, 동남아 1~2만원, 유럽 2~5만원 ⭐ 추천<br />
          • <strong>Wi-Fi 도시락 (도시락·말톡)</strong>: 일 5~7천원 (1주 4~5만원)<br />
          • <strong>현지 유심</strong>: 공항 구입, 일주일 2~5만원<br />
          • <strong>통신사 로밍 (T·KT·LG)</strong>: 일 1~1.5만원, 비싸지만 편리<br />
          가족 여행은 <strong>Wi-Fi 도시락 1대</strong>로 공유 가능 (가성비 ↑). 1인은 eSim이 가장 유리.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 환전 vs 카드 vs 트래블월렛 어느 게 유리?</summary>
        <p style={faqAnswer}>
          용도별 다름:<br />
          • <strong>현금 환전</strong>: 약 1~3% 수수료. 시장·소액·팁용. 한국 시중은행·환전소 비교 (서울역 외환·인천공항 환전소).<br />
          • <strong>해외 신용카드 (마스터·비자)</strong>: 약 1.5~2% 수수료 + 1.1% 해외이용. 큰 결제·식당·호텔.<br />
          • <strong>트래블월렛·트래블로그·SOL트래블</strong> ⭐ <strong>주요 통화 수수료 0%</strong> 환전(통화·한도·시간대별 조건 상이), 체크카드처럼 사용. 최근 가장 인기.<br />
          • <strong>현지 ATM 출금</strong>: 일 수수료 + 환전 손실 — 비추.<br />
          추천 조합: <strong>트래블월렛·트래블로그 + 일부 현금 + 해외 신용카드 1장</strong>.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 예비비 10~20% 왜 추가하나요?</summary>
        <p style={faqAnswer}>
          <strong>예상치 못한 지출이 항상 발생</strong>하기 때문입니다.<br />
          • 항공 지연 → 호텔 추가<br />
          • 도난·분실 → 재구매<br />
          • 의료비·약값<br />
          • 환율 변동 (출국 전 vs 현지)<br />
          • 충동 구매·기념품·즉흥 투어<br />
          • 친구·가족 선물<br /><br />
          <strong>예비비 없으면 카드 한도 부족·귀국 후 결제 부담</strong>으로 스트레스. 일반 여행 10%, 새 국가 15%, 장기·모험 20% 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 단체 여행이 1인 여행보다 싸나?</summary>
        <p style={faqAnswer}>
          <strong>일반적으로 단체가 더 쌉니다</strong> (1인당 비용 기준):<br />
          • <strong>숙박</strong>: 2인 1실이 1인보다 50~70% 절감 (싱글룸 차지 X)<br />
          • <strong>택시·우버</strong>: 4명 분할 시 1/4 비용<br />
          • <strong>투어·식사</strong>: 단체 할인·세트 메뉴 가능<br />
          • <strong>항공권</strong>: 동일 (인당 동일)<br />
          단점:<br />
          • 의견 조율·일정 충돌<br />
          • 식성·취향 차이<br />
          단, <strong>패키지여행</strong>은 자유여행 대비 -20~40% 가능 (대신 자유도 ↓).
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/life/travel-tip" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 팁 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18국 × 9 서비스 + 만족도
          </p>
        </Link>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
        <Link href="/tools/life/dutch" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍻</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>더치페이 N빵</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 일행 정산
          </p>
        </Link>
      </div>
    </div>
  )
}
