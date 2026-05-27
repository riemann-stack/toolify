import Link from 'next/link'
import EggTimerClient from './EggTimerClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/cooking/egg-timer',
  title: '계란 삶는 시간 계산기 — 반숙·완숙·잼노른자 8단계 + 한국 요리 프리셋 + 실시간 타이머 (라면·김밥·장조림·라멘 아지타마)',
  description:
    '반숙·완숙·잼노른자 8단계 익힘 + 한국 계란 크기·시작 온도·조리법·고도 자동 보정. 한국 요리 10종 프리셋과 실시간 타이머.',
  keywords: [
    '계란 삶는 시간', '계란 삶기', '계란 익히는 시간',
    '반숙 시간', '완숙 시간', '잼 노른자 시간',
    '라멘 계란 시간', '아지타마 시간', '양념장계란', '마야크 에그',
    '라면 계란 반숙', '김밥 계란', '장조림 계란', '백숙 계란',
    '특란 삶는 시간', '왕란 삶는 시간', '한국 계란 크기',
    '마요계란', '데빌드 에그', '에그 샐러드',
    '계란 껍질 잘 벗기기', '노른자 회녹색', '계란 갈라짐 방지',
    '냉장 계란 삶기', '실온 계란', '계란 찜기',
    '인스턴트팟 계란', '5-5-5 룰', '고도 계란 삶기',
    '계란 응고 온도', '계란 단백질', '온천계란 시간',
    '계란 타이머', '실시간 계란 알림',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}
const faqQuestion: React.CSSProperties = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '8px',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

const FAQ_LD = [
              {
                q: '냉장 vs 실온, 시간 얼마나 차이나나요?',
                a: '약 <strong>+1분 차이</strong>. 냉장(4°C) 계란을 끓는 물에 바로 넣으면 내부가 데워지는 데 추가 시간이 필요합니다. 또한 <strong>갈라짐 위험도 큼</strong> — 식초 1Ts 첨가 또는 30분~1시간 실온 방치 후 조리 권장.<br/><br/>반대로 미지근(30°C, 미지근 물에 5분 담갔다 빼기)은 −30초. 결과적으로 냉장 vs 미지근은 약 90초 차이.',
              },
              {
                q: '껍질이 안 벗겨질 때 해결법?',
                a: '4가지 핵심 —<br/>· <strong>5~7일 묵은 계란 사용</strong> — 너무 신선한 계란은 막이 단단해 안 벗겨짐<br/>· <strong>식초 1Ts 또는 베이킹소다 1ts</strong> 끓는 물에 첨가<br/>· <strong>삶은 직후 얼음물 5분</strong> — 막이 수축하며 흰자와 분리<br/>· <strong>둥근 쪽 (공기집)부터 까기</strong> — 살짝 굴려 균열 낸 뒤 시작<br/><br/>특히 잼 노른자는 흰자가 약해 더 어려움 — 묵은 계란 + 얼음물 조합 필수.',
              },
              {
                q: '노른자가 회녹색이 되는 이유?',
                a: '<strong>너무 오래 끓이면</strong> 흰자의 황(S)과 노른자의 철(Fe)이 반응해 황화철(FeS)이 형성됩니다. 회색-녹색 띠처럼 보이며 황 냄새가 납니다.<br/><br/><strong>안전성 문제는 없지만</strong> 식감과 비주얼이 떨어집니다.<br/>예방 —<br/>· 12분 이내로 끝내기<br/>· 완성 즉시 얼음물에 5분 (반응 정지)<br/>· 자주 발생하면 시간 1~2분 단축',
              },
              {
                q: '잼 노른자 정확한 시간은?',
                a: '<strong>7분 (특란 + 실온 + 끓는 물 투입)</strong>이 표준. 라멘 아지타마와 양념장계란(마야크 에그)의 핵심 단계입니다. 흰자는 완전히 익고 노른자는 걸쭉한 잼 농도.<br/><br/>정확도가 중요하니 다음 조건 통일 —<br/>· 크기: 특란 (68~78g)<br/>· 온도: 실온 (30분 꺼낸 상태) — 냉장 시 8분<br/>· 조리법: 끓는 물 투입 → 정확히 7분 → 즉시 얼음물 5분<br/>· 껍질 까기: 5~7일 묵은 계란 사용 + 둥근 쪽부터<br/><br/>±15초 차이로 농도가 크게 달라지므로 타이머 필수.',
              },
              {
                q: '라면 계란 반숙은 몇 분?',
                a: '취향에 따라 <strong>6분(반숙) ~ 7분(잼 노른자)</strong>이 무난합니다.<br/>· <strong>6분</strong> — 흰자 완전 익힘 + 노른자 약 60% 흐름<br/>· <strong>7분</strong> — 노른자가 걸쭉한 「잼」 농도 (라멘 아지타마와 동일, 가장 일반적)<br/>· <strong>5분</strong> — 거의 흐르는 상태. 노른자를 깨서 국물에 풀고 싶을 때<br/><br/><strong>라면과 동시 조리는 비추천</strong> — 라면 자체 조리 시간이 3~5분이라 6~7분짜리 계란을 같이 넣으면 라면이 너무 불어버립니다. 라면 끓이기 전에 따로 삶아두고 완성 직전에 올리는 것이 정석.',
              },
              {
                q: '12개 한꺼번에 삶을 때 시간 보정은?',
                a: '계란이 많을수록 물의 열용량이 부족해져 약간 더 시간이 걸립니다 —<br/>· <strong>1~11개</strong>: 표준 시간 (영향 미미)<br/>· <strong>12~17개</strong>: <strong>+1분</strong><br/>· <strong>18개+</strong>: <strong>+2분</strong> 또는 2번에 나눠 조리<br/><br/>또한 냄비가 너무 작으면 물 온도가 더 떨어지므로 큰 냄비 + 충분한 물(계란이 완전히 잠길 정도) 사용 권장.',
              },
              {
                q: '고도가 높은 곳에서 시간은?',
                a: '고도가 높을수록 물의 끓는점이 낮아져(100m당 -0.3°C) 더 오래 걸립니다 —<br/>· <strong>0~300m</strong> (한국 대부분 도시): 보정 불필요<br/>· <strong>500m</strong>: +5%<br/>· <strong>1,000m</strong> (한라산 영실): +10%<br/>· <strong>1,500m+</strong> (백두산·후지산): +15%<br/><br/>한국 도시에서는 거의 영향 없음. 캠핑·산행 시에만 고려.',
              },
              {
                q: '찜기로 삶으면 끓이기와 차이?',
                a: '<strong>찜기는 +1~2분(약 +10%) 더 필요</strong>합니다. 끓는 물에 직접 닿는 것보다 증기로 익히는 열전달이 약하기 때문.<br/><br/><strong>장점</strong> — 균일한 익힘(위치별 차이 적음), 껍질 잘 벗겨짐, 갈라짐 위험 적음.<br/><strong>단점</strong> — 시간 ↑, 정확도 ↓. 한 번에 많은 양(12개+) 익힐 때는 찜기가 유리.',
              },
              {
                q: '계란이 자꾸 갈라지는데 왜 그런가요?',
                a: '주요 원인 3가지 —<br/>· <strong>냉장 → 끓는 물 직행</strong> — 급격한 온도 차로 껍질 팽창. 30분 실온 방치 또는 미지근 물 5분 담그기로 예방<br/>· <strong>둥근 쪽 공기집 압력</strong> — 가열 시 공기가 팽창하면서 껍질을 깨뜨림. 압정으로 미세 구멍을 뚫어 압력 배출<br/>· <strong>물에 던져 넣기</strong> — 부드럽게 숟가락으로 살짝 내려놓기<br/><br/><strong>식초 1Ts 첨가</strong>도 효과적 — 새어나온 흰자가 빨리 응고해 더 이상 새지 않게 막아줍니다.',
              },
              {
                q: '온천계란(온센타마고)은 어떻게 만드나요?',
                a: '<strong>65~70°C 따뜻한 물에 30~40분</strong> 담가 천천히 익히는 방식입니다. 보통 삶은 계란과 다른 점은 <strong>흰자가 살짝 응고된 상태(반투명 푸딩)이고 노른자는 균일한 커스터드 농도</strong>가 된다는 것입니다.<br/><br/>가정용 간이 방법 —<br/>· 보온병에 70°C 물 + 계란 → 30분 방치<br/>· 또는 큰 냄비 끓는 물 끄고 계란 투입 → 10분 방치<br/><br/>본 도구의 8단계와는 별도 카테고리. 일본 료칸 조식·소바 토핑·오야꼬동에 사용.',
              },
            ]

export default function EggTimerPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥚 계란 삶는 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        반숙·완숙·잼노른자 <strong style={{ color: 'var(--text)' }}>8단계 익힘</strong> + 계란 크기·시작 온도 자동 보정 + 실시간 타이머.
      </p>

      <EggTimerClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 익힘 8단계 시간표 */}
        <section>
          <h2 style={sectionTitle}>익힘 8단계 — 30초 단위로 기억하자</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            끓는 물에 특란을 투입한 시점부터 측정한 시간 기준. 30초 단위로 노른자 농도가 크게 달라지므로 본 도구로 정확히 맞추세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시간', '단계', '노른자 농도', '추천 요리'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['5:00',   '흐름 노른자',     '완전 흐름',           '토스트 디핑·에그 베네딕트'],
                  ['6:00',   '반숙',            '60% 흐름',            '라면·우동·반숙 토핑'],
                  ['6:30',   '흐름반숙',        '가장자리 살짝 굳음',   '반숙 샐러드'],
                  ['7:00',   '잼 노른자',       '걸쭉한 잼 농도',       '라멘 아지타마·양념장계란'],
                  ['8:30',   '커스터드',        '커스터드 푸딩 농도',   '오야꼬동·찜요리'],
                  ['10:00',  '부드러운 완숙',    '균일·살짝 촉촉',       '에그 샌드위치'],
                  ['11:30',  '표준 완숙',       '균일하게 단단',        '마요계란·데일리'],
                  ['14:00',  '단단한 완숙',      '아주 단단',           '장조림·김밥·백숙용'],
                ].map(([t, stage, yolk, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{stage}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{yolk}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 특란(68~78g) + 실온(20°C) + 끓는 물 투입 기준. 냉장 계란은 +1분, 왕란은 +30초.
          </p>
        </section>

        {/* 2. 한국 계란 크기 */}
        <section>
          <h2 style={sectionTitle}>한국 계란 크기 (축산물품질평가)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap', width: 70 }}>크기</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>무게 (g)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>특란 대비 시간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>용도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['왕란', '78g+',     '+30초',  '대형마트·이중노른자 가능성'],
                  ['특란', '68~78g',   '기준',   '마트·편의점 표준 (가장 흔함)'],
                  ['대란', '60~68g',   '-15초',  '소형마트·재래시장'],
                  ['중란', '52~60g',   '-30초',  '계란말이·간편식'],
                  ['소란', '44~52g',   '-45초',  '베이킹·도시락'],
                ].map(([size, w, adj, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{size}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{w}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{adj}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 한국 요리 추천표 — 핵심 팁 컬럼 제거, 모바일 1줄 표시 */}
        <section>
          <h2 style={sectionTitle}>한국 요리별 익힘 추천</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>요리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>추천 단계</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>시간</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍜 라면 계란',       '잼 노른자',    '7:00'],
                  ['🍙 김밥 계란',       '단단한 완숙',  '14:00'],
                  ['🥩 장조림 계란',     '표준 완숙',    '11:30'],
                  ['🍱 마야크(양념장)',  '잼 노른자',    '7:00'],
                  ['🍜 라멘 아지타마',   '잼 노른자',    '7:00'],
                  ['🥚 마요계란',       '표준 완숙',    '11:30'],
                  ['🍳 데빌드 에그',     '단단한 완숙',  '14:00'],
                  ['🥗 반숙 샐러드',     '흐름반숙',     '6:30'],
                  ['🐔 백숙용',         '단단한 완숙',  '14:00'],
                  ['🥚 데일리 한 알',   '반숙',         '6:00'],
                ].map(([dish, stage, time], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{dish}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{stage}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, textAlign: 'right' }}>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '10px', fontSize: '12px' }}>
            💡 <strong style={{ color: 'var(--text)' }}>특란 + 끓는 물 투입 + 실온</strong> 기준. 냉장 계란은 +1분, 왕란은 +30초. 라면 계란은 라면 끓이기와 별도로 삶은 뒤 토핑하는 것이 정확합니다 (라면 자체 조리 시간이 3~5분이라 동시 조리 어려움).
          </p>
        </section>

        {/* 4. FAQ — 아코디언 */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 응고 온도 과학 */}
        <section>
          <h2 style={sectionTitle}>흰자·노른자 응고 온도 (왜 30초 차이로 농도가 달라지나)</h2>
          <p style={faqAnswer}>
            계란은 단백질 덩어리. 단백질은 일정 온도에 도달하면 변성·응고합니다. 끓는 물(100°C)에서 계란 내부 온도가 다음 임계점에 도달하는 시점을 정확히 계산한 것이 본 도구의 8단계 시간입니다:
          </p>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2, marginTop: '12px' }}>
            <li><strong style={{ color: 'var(--text)' }}>흰자 응고 시작: 62°C</strong> — 투명한 액체 → 불투명 흰색</li>
            <li><strong style={{ color: 'var(--text)' }}>흰자 완전 응고: 80°C</strong> — 단단한 흰자</li>
            <li><strong style={{ color: 'var(--text)' }}>노른자 응고 시작: 65°C</strong> — 점도 ↑</li>
            <li><strong style={{ color: 'var(--text)' }}>노른자 잼 농도: 70°C</strong> — 라멘 아지타마</li>
            <li><strong style={{ color: 'var(--text)' }}>노른자 완전 응고: 78°C</strong> — 단단한 완숙</li>
          </ul>
          <p style={{ ...faqAnswer, marginTop: '12px' }}>
            계란 내부는 외부보다 천천히 데워지므로(특히 노른자는 중심에 있음), 같은 끓는 물이라도 시간에 따라 노른자 중심 온도가 65~78°C 사이를 통과합니다. 30초 차이가 큰 이유 — 임계 온도 구간이 좁아 30초만 더 익혀도 잼이 굳어지기 시작.
          </p>
        </section>

        {/* 6. 관련 도구 — 2열 카드 그리드 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/microwave',     icon: '🔥', name: '전자레인지 출력 환산기', desc: '600~1200W 양방향 변환·식품 프리셋' },
              { href: '/tools/cooking/ramen',         icon: '🍜', name: '라면 물양 계산기',       desc: '라면별 권장 물양·조리 시간' },
              { href: '/tools/cooking/frying',        icon: '🍳', name: '튀김 시간 계산기',       desc: '재료별 기름 온도·튀김 시간' },
              { href: '/tools/cooking/thawing',       icon: '🧊', name: '해동 시간 계산기',       desc: '식품·두께·전자레인지별 해동' },
              { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트 계산기',   desc: '제빵 배합비·수분율·르방' },
              { href: '/tools/cooking/serving',       icon: '🍽️', name: '1인분 분량 계산기',     desc: '재료별 인분 분량·장보기 리스트' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
