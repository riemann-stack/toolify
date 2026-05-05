import Link from 'next/link'
import KnitGaugeClient from './KnitGaugeClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/art/knit-gauge',
  title: '뜨개질 게이지(코·단) 계산기 — 패턴 변환·사이즈별 코 수·늘림 줄임·실 양',
  description: '10cm² 게이지 입력으로 패턴 코·단 수 변환, 한국 여성·남성·키즈 사이즈별 코 계산, 늘림·줄임 균등 분배, 실 양·바늘 호수 추천. 대바늘·코바늘·모자·양말·스웨터·담요 4탭.',
  keywords: [
    '뜨개질 게이지', '게이지 계산기', '코 수 계산', '단 수 계산', '게이지 스와치',
    '뜨개질 패턴 변환', '스웨터 코 수', '모자 코 수', '양말 게이지',
    '뜨개질 늘림 줄임', '실 양 계산', '바늘 호수 추천',
    'DK 게이지', '워스티드 게이지', '코바늘 게이지', '대바늘 게이지',
    'CYC 실 굵기', 'M1L kfb k2tog', 'Jeny 분배',
    '한국 스웨터 사이즈', '뜨개질 사이즈',
  ],
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

export default function KnitGaugePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작 · 디자인·미술
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧶 뜨개질 게이지(코·단) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        10cm² 게이지 입력으로 <strong style={{ color: 'var(--text)' }}>패턴 코·단 수 변환</strong>,{' '}
        한국 여성·남성·키즈 <strong style={{ color: 'var(--text)' }}>사이즈별 코 계산</strong>,{' '}
        <strong style={{ color: 'var(--text)' }}>늘림·줄임 균등 분배</strong>, 실 양·바늘 호수 추천.{' '}
        대바늘·코바늘·모자·양말·스웨터·담요 4탭.
      </p>

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구는 표준 게이지·사이즈 기반 <strong>어림 계산</strong>입니다. 실 종류·블로킹 후 변화·개인 손 텐션에 따라 5~15% 차이 발생.
          실제 작업은 반드시 <strong>게이지 스와치를 떠서 측정한 실제 게이지</strong>로 작업하세요.
          분야별 안전 안내는 <Link href="/disclaimer#art" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <KnitGaugeClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 게이지</strong> — 10cm² 안의 코·단 수 입력 (스와치를 떠서 측정한 실제 값) → 1cm당 코·단, 실 굵기, 권장 바늘 자동 계산 + SVG 시각화</li>
          <li><strong>탭 2 패턴 변환</strong> — 도안의 게이지·코·단을 입력하면 내 게이지 기준으로 자동 환산 + 바늘 호수 코칭</li>
          <li><strong>탭 3 사이즈별</strong> — 부위(스웨터/모자/양말/담요 등) 선택 + 가로·세로 cm 입력 → 정확한 시작 코 + 단 수. 한국 사이즈 칩으로 빠른 입력</li>
          <li><strong>탭 4 늘림·실 양</strong> — 늘림/줄임 균등 분배 (Jeny 알고리즘) + 실 굵기·작품 종류·사이즈로 실 양(g·실타래) 추정 + 바늘 호수 표</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 모든 입력값(게이지·치수·실 종류 등)은 자동 저장되어 새로고침해도 유지됩니다. 뜨개질 중 핸드폰으로 자유롭게 사용하세요.
        </p>
      </div>

      {/* 2. 게이지 스와치 만드는 법 */}
      <h2 style={sectionTitle}>📐 게이지 스와치 — 왜 필요한가?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 패턴, 같은 실, 같은 바늘이라도 사람마다 손 텐션이 달라 게이지가 다릅니다. <strong>스와치를 떠서 내 게이지를 측정해야</strong> 패턴이 정확하게 맞아요.
          <strong> 스와치를 생략하면 완성 후 사이즈가 +5~10cm 큰 / 작은 비극이 생깁니다.</strong>
        </p>
        <ol style={{ margin: '14px 0 0', paddingLeft: 20, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>15×15cm 시험 편물</strong>을 같은 실·바늘로 떠 줍니다 (가장자리 2~3코는 측정 제외용).</li>
          <li><strong>물에 적신 후 펴서 말립니다 (블로킹)</strong>. 실은 블로킹 후 5~15% 변하므로 필수.</li>
          <li>가운데 <strong>10×10cm를 핀으로 표시</strong>하고 그 안의 코·단 수를 셉니다.</li>
        </ol>
        <div style={{ background: 'rgba(255, 138, 62, 0.06)', border: '1px solid rgba(255, 138, 62, 0.40)', borderRadius: 10, padding: '12px 16px', marginTop: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.75 }}>
            ⚠️ <strong style={{ color: '#FFA63E' }}>흔한 실수 5가지</strong>
            <br />① 스와치를 너무 작게(5×5cm) 떠서 측정 — 가장자리 영향으로 부정확
            <br />② 블로킹 생략 — 실 종류에 따라 게이지가 한 호수 차이만큼 변함
            <br />③ 너무 빠듯하게 또는 느슨하게 측정 — 자연스러운 상태에서 핀으로 고정
            <br />④ 실을 바꿔도 같은 바늘 사용 — 실마다 권장 바늘이 다름
            <br />⑤ 스와치 게이지를 본판 게이지와 다르게 측정 — 같은 무늬·평직으로 통일
          </p>
        </div>
      </div>

      {/* 3. CYC 실 굵기 표 */}
      <h2 style={sectionTitle}>🧶 CYC 실 굵기 표 (0~7)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          미국 Craft Yarn Council(CYC)이 정한 실 굵기 표준. 한국 시판 실도 대부분 이 분류를 따릅니다 (다루마·카람·DROPS 등).
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>CYC</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>이름</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>코 수 / 10cm</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>바늘 mm</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>대표 작품</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['0', 'Lace',         '32–36', '1.5–2.25', '레이스·숄·도일리'],
                ['1', 'Fingering',    '28–32', '2.25–3.25', '양말·얇은 스웨터'],
                ['2', 'Sport',        '24–28', '3.25–3.75', '아동복·얇은 스웨터'],
                ['3', 'DK',           '21–24', '3.75–4.5',  '봄·가을 스웨터·가디건'],
                ['4', 'Worsted',      '16–20', '4.5–5.5',   '겨울 스웨터·모자·장갑'],
                ['5', 'Aran',         '16–18', '5.0–6.0',   '겨울 스웨터·케이블'],
                ['6', 'Bulky',        '12–15', '5.5–8.0',   '두꺼운 모자·블랭킷'],
                ['7', 'Super Bulky',  '7–12',  '8.0–12.0',  '대형 담요·러그'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#C485E0', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{row[3]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 같은 CYC 등급이라도 면·울·아크릴·리넨에 따라 게이지가 미묘하게 달라집니다. 표는 일반적 기준이며 실 라벨의 권장 게이지를 우선하세요.
        </p>
      </div>

      {/* 4. 한국 표준 사이즈 표 */}
      <h2 style={sectionTitle}>🇰🇷 한국 표준 사이즈 표</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          KS K 0050 의류 치수 기반 일반 가이드. 본 도구의 [📏 사이즈별] 탭에서 칩을 클릭하면 자동 적용됩니다.
        </p>
        {/* 여성 */}
        <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, margin: '14px 0 6px' }}>여성</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['XS (85)', 84, 56, 53, 36],
                ['S (90)',  88, 58, 55, 38],
                ['M (95)',  92, 60, 57, 39],
                ['L (100)', 96, 62, 58, 40],
                ['XL (105)', 100, 64, 59, 41],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 남성 */}
        <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, margin: '14px 0 6px' }}>남성</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['S (95)',  96,  66, 60, 42],
                ['M (100)', 100, 68, 61, 44],
                ['L (105)', 104, 70, 62, 46],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 키즈 */}
        <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, margin: '14px 0 6px' }}>키즈</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['100cm', 54, 41, 35, 28],
                ['110cm', 58, 45, 38, 30],
                ['120cm', 62, 49, 41, 32],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ 디자이너·브랜드마다 사이즈가 약간씩 다릅니다. 본 표는 KS K 0050 일반화 기준이며, 인디 디자이너 패턴은 각자 사이즈 표를 우선 참고하세요.
        </p>
      </div>

      {/* 5. 부위별 작업 팁 */}
      <h2 style={sectionTitle}>🎯 부위별 작업 팁</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li>👕 <strong>스웨터 몸통</strong> — 평직 작업 시 앞·뒤판 동일하게 떠서 옆선 봉합. 톱다운 원형 작업이면 한 번에 몸통 진행.</li>
          <li>💪 <strong>스웨터 소매</strong> — 손목에서 시작해 위로 갈수록 넓어짐 (늘림 분배). 또는 레글런·세트인 방식.</li>
          <li>🎩 <strong>모자 (비니)</strong> — 머리 둘레보다 10% 작게 떠야 늘어났을 때 잘 맞음 (음의 ease). 원형 작업 권장, 정수리는 cdd 줄임으로 마감.</li>
          <li>🧦 <strong>양말</strong> — 발 둘레보다 10% 작게. 원형 4-DPN 또는 매직 루프. Toe-up / Cuff-down 두 방식이 있어요.</li>
          <li>🧣 <strong>스카프</strong> — 평직 작업. 양 끝 무늬 통일이 중요. 가터·메리야스·시드 스티치가 인기.</li>
          <li>🛌 <strong>담요</strong> — 대형 작품. 색상 블록·모티브 결합 인기. 실 양 충분히 준비 (+15~20% 여유). 코바늘 그래니 스퀘어가 빠름.</li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 게이지 스와치가 꼭 필요한가요?</summary>
        <p style={faqAnswer}>
          <strong>네, 거의 모든 의류·핏이 중요한 작품에 필수</strong>입니다. 같은 실·바늘이라도 사람마다 손 텐션이 달라 게이지가 5~15% 차이 납니다.
          스와치 없이 패턴 그대로 떴는데 완성된 스웨터가 +5cm 큰/작은 비극이 자주 발생해요.<br />
          단, <strong>스와치 생략 가능한 경우</strong>: 스카프·머플러·도일리 등 핏이 중요하지 않은 작품, 본 작품을 풀어 다시 뜨는 게 큰 부담 아닐 때.
          그래도 모자·장갑·양말·스웨터·가디건은 반드시 스와치 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 게이지가 패턴과 다르면 어떻게 하나요?</summary>
        <p style={faqAnswer}>
          <strong>두 가지 방법</strong>이 있습니다:<br />
          <strong>① 바늘 호수 조정</strong> (가장 일반적) — 내 게이지가 헐거우면 한 호수 작은 바늘, 빽빽하면 한 호수 큰 바늘로 바꿔 다시 스와치. 보통 1~2호수 차이로 조정 가능.<br />
          <strong>② 코·단 수 변환</strong> — 본 도구의 [🔄 패턴 변환] 탭에서 자동 환산. 예: 패턴 100코 + 패턴 게이지 22코/10cm + 내 게이지 20코/10cm → 91코로 시작.<br />
          ⚠️ 변환은 <strong>단순 도안</strong>(평직·메리야스)에 잘 맞고, 케이블·레이스 같은 복잡한 패턴은 코 수가 무늬 반복 단위에 맞아야 하므로 ①번 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 코 게이지와 단 게이지 둘 다 맞춰야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>코 게이지가 우선</strong>입니다. 코 게이지는 가로 폭(둘레)을 결정하므로 옷의 핏을 좌우해요.<br />
          <strong>단 게이지</strong>는 길이를 결정하지만, 길이는 <strong>&quot;몇 단&quot;이 아닌 &quot;cm로&quot;</strong> 측정해 마감하면 됩니다 (예: &quot;55cm가 될 때까지 떠 줍니다&quot;).<br />
          실제 패턴 다수도 길이는 cm로 표기. 단 게이지 차이가 코 게이지 차이보다 크면 본 도구가 자동으로 경고를 띄워 줍니다 (탭 2).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 모자 시작 코는 머리 둘레 그대로?</summary>
        <p style={faqAnswer}>
          아닙니다. <strong>머리 둘레보다 10% 작게</strong> 떠야 늘어났을 때 잘 맞습니다 (negative ease).<br />
          • 머리 둘레 56cm → 시작 둘레 약 50cm로 작업 → 게이지 적용해 코 수 계산<br />
          • 본 도구의 [📏 사이즈별] 탭에서 모자 선택 시 신축 보정 -10%가 자동 적용<br />
          탄성이 큰 1×1·2×2 코 텐션 무늬(K1P1·K2P2 ribbing)는 -15%까지도 가능. 늘어남이 적은 가터·시드 스티치는 -5%만.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 양말 발 둘레 코 수는 어떻게?</summary>
        <p style={faqAnswer}>
          모자와 동일하게 <strong>발 둘레보다 10% 작게</strong>가 표준입니다.<br />
          • 발 둘레 22cm (성인 여성 평균) → 시작 둘레 약 20cm로 작업<br />
          • Fingering(양말실) 게이지 30코/10cm → 60코 시작이 일반적<br />
          • 양말은 보통 4-DPN(double-pointed needles) 또는 매직 루프 원형 작업<br />
          발등(instep)과 발바닥(sole)은 보통 같은 코 수, 발꿈치(heel) 부분만 절반의 코로 작업하는 게 표준 구조입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 한국·미국·일본 단위 차이는?</summary>
        <p style={faqAnswer}>
          <strong>코 게이지 측정 단위</strong>:<br />
          • 한국·유럽: <strong>10cm² (4 inch² 와 거의 동일)</strong><br />
          • 미국: <strong>4 inch²</strong> (= 10.16cm)<br />
          • 일본: <strong>10cm²</strong> 표준<br />
          본 도구는 셋 다 토글로 지원합니다. 또한 <strong>바늘 호수</strong>도 mm·US·UK 동시 표기 (탭 4).<br />
          • 미국식 6호 = 4.0mm = 영국식 8호<br />
          • 일본식 호수는 mm 표기와 약간 달라 (일본 5호 = 3.6mm). 본 도구는 mm 단위 우선.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 늘림(M1L)과 (kfb) 차이는?</summary>
        <p style={faqAnswer}>
          둘 다 1코 늘림이지만 모양이 달라요.<br />
          • <strong>M1L (Make 1 Left)</strong>: 두 코 사이 가로실을 들어 올려 새 코 만듦. <strong>거의 보이지 않음</strong>. 매끈한 라인 원할 때.<br />
          • <strong>kfb (Knit Front and Back)</strong>: 한 코의 앞과 뒤에 모두 떠서 1코 더 만듦. <strong>작은 매듭이 보임</strong>. 입문자에게 쉬움.<br />
          소매 늘림처럼 매끈해야 하는 곳은 M1L/M1R, 매듭이 무늬가 되는 디자인은 kfb. 본 도구의 [📊 늘림] 탭 약어 용어집에 8개 기법 설명 있습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 실 양 계산은 정확한가요?</summary>
        <p style={faqAnswer}>
          본 도구의 실 양은 <strong>표준 평직·메리야스 작업 기준 평균값</strong>입니다. 실제로는 다음 변수에 따라 ±20% 차이가 있어요.<br />
          • <strong>케이블·아란 패턴</strong>: 코가 많이 꼬여 평직보다 +20~30% 더 필요<br />
          • <strong>컬러워크·페어아일</strong>: 두 가닥 동시 + 부동사(浮動絲)로 +30% 추가<br />
          • <strong>레이스·튜닉</strong>: 평직보다 -10% 적게<br />
          • <strong>여유분</strong>: 항상 <strong>10~15% 더 구입</strong> 권장 (수정·실 부족 대비). 같은 다이로트(dye lot)로 한 번에 구입해야 색 일치.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 바늘 호수가 게이지에 영향?</summary>
        <p style={faqAnswer}>
          <strong>네, 가장 큰 영향</strong>입니다. 같은 실이라도 바늘이 굵으면 코가 커져 게이지가 헐거워지고, 바늘이 가늘면 빽빽해집니다.<br />
          • 한 호수(0.5mm) 차이로 보통 <strong>1~2코/10cm</strong> 변화<br />
          • 게이지가 패턴과 안 맞으면 <strong>실 바꾸지 말고 바늘 호수 먼저 조정</strong><br />
          • 본 도구의 [📊 늘림·실 양] 탭 마지막 표에 바늘 호수 ↔ 게이지 룩업 표가 있어 권장 호수를 바로 확인 가능합니다.<br />
          또한 <strong>바늘 재질</strong>(스틸·대나무·플라스틱)도 미세하게 영향. 매끄러운 스틸이 더 빨리 뜨이지만 텐션이 헐거워질 수 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 코바늘과 대바늘 게이지 차이?</summary>
        <p style={faqAnswer}>
          <strong>같은 실이라도 코바늘이 더 두껍고 빡빡한 편물</strong>이 됩니다 (코 단위가 더 큼).<br />
          • 같은 DK 실: 대바늘 22코/10cm, 코바늘 16~18코/10cm (단코 기준)<br />
          • 코바늘은 <strong>한 코의 높이가 더 큼</strong> → 단 게이지가 코 게이지와 더 비슷<br />
          • 코바늘 패턴은 <strong>&quot;단코·반쪽단코·긴뜨기·긴긴뜨기&quot;</strong> 등 종류별로 게이지가 달라, 패턴 명시 단 종류로 측정<br />
          본 도구의 게이지 입력은 코바늘·대바늘 모두 사용 가능하지만, 코바늘 사용 시에는 패턴이 명시한 단 종류와 동일하게 스와치를 떠 측정하세요.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/paint-mix" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>물감·잉크 혼합 비율</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            색 시뮬레이터 + 컬러 매칭
          </p>
        </Link>
        <Link href="/tools/unit/converter" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>통합 단위 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            cm·인치·g·온스 환산
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🌀</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금 비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            φ = 1.618 디자인 비율
          </p>
        </Link>
      </div>
    </div>
  )
}
