import Link from 'next/link'
import EggTimerClient from './EggTimerClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/cooking/egg-timer',
  title: '계란 삶는 시간 계산기 — 반숙·완숙·잼노른자 8단계 + 한국 요리 프리셋 + 실시간 타이머 (라면·김밥·장조림·라멘 아지타마)',
  description:
    '계란 삶기 정확한 시간 — 흐름 노른자부터 단단한 완숙까지 8단계 익힘 스펙트럼, 한국 계란 크기(왕란/특란/대란/중란/소란) · 시작 온도 · 조리법 · 고도 · 개수 자동 보정. 라면·김밥·장조림·양념장계란·라멘 아지타마 등 10가지 한국 요리 프리셋과 실시간 카운트다운 타이머·알림음·브라우저 알림.',
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

export default function EggTimerPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥚 계란 삶는 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        흐름 노른자부터 단단한 완숙까지 익힘 8단계, 한국 계란 크기·시작 온도·조리법·고도까지 정확 보정. 10가지 한국 요리 프리셋(라면·김밥·장조림·라멘 아지타마 등)과 실시간 타이머·알림음·브라우저 알림으로 언제든 정확한 계란.
      </p>

      <EggTimerClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 익힘 8단계 시간표 */}
        <section>
          <h2 style={sectionTitle}>익힘 8단계 — 30초 차이로 노른자가 달라진다</h2>
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
          <h2 style={sectionTitle}>한국 계란 크기 표 (축산물품질평가원 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['크기', '무게 (g)', '특란 대비 시간', '용도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{size}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{w}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{adj}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 한국 요리 추천표 */}
        <section>
          <h2 style={sectionTitle}>한국 요리별 익힘 추천</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['요리', '추천 단계', '시간', '핵심 팁'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍜 라면 계란',         '반숙',         '6:00',  '라면 마지막 6분에 같이 투입 가능'],
                  ['🍙 김밥 계란',         '단단한 완숙',  '14:00', '식초 첨가·자르기 좋음'],
                  ['🥩 장조림 계란',       '표준 완숙',    '11:30', '메추리알도 동일·양념장 1~2일 절임'],
                  ['🍱 마야크(양념장)',    '잼 노른자',    '7:00',  '잼 노른자 핵심·간장+물엿+참기름'],
                  ['🍜 라멘 아지타마',     '잼 노른자',    '7:00',  '미림+간장+물 1:1:1 / 12시간+ 절임'],
                  ['🥚 마요계란',         '표준 완숙',    '11:30', '으깨고 마요+소금+머스타드'],
                  ['🍳 데빌드 에그',       '단단한 완숙',  '14:00', '반으로 잘라 노른자만 빼고 채움'],
                  ['🥗 반숙 샐러드',       '흐름반숙',     '6:30',  '가장 예쁜 반숙 단면'],
                  ['🐔 백숙용',           '단단한 완숙',  '14:00', '백숙 위에 올림'],
                  ['🥚 데일리 한 알',     '반숙',         '6:00',  '아침 한 알·6분이 무난'],
                ].map(([dish, stage, time, tip], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{dish}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{stage}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{time}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <p style={faqQuestion}>Q1. 냉장 vs 실온, 시간 얼마나 차이나나요?</p>
              <div style={faqAnswer}>
                약 <strong style={{ color: 'var(--text)' }}>+1분 차이</strong>. 냉장(4°C) 계란을 끓는 물에 바로 넣으면 내부가 데워지는 데 추가 시간이 필요합니다. 또한 <strong style={{ color: '#FF8C8C' }}>갈라짐 위험도 큼</strong> — 식초 1Ts 첨가 또는 30분~1시간 실온 방치 후 조리 권장.
                <br /><br />
                반대로 미지근(30°C, 미지근 물에 5분 담갔다 빼기)은 -30초. 결과적으로 냉장 vs 미지근은 약 90초 차이.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q2. 껍질이 안 벗겨질 때 해결법?</p>
              <div style={faqAnswer}>
                4가지 핵심:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong style={{ color: 'var(--text)' }}>5~7일 묵은 계란 사용</strong> — 너무 신선한 계란은 막이 단단해 안 벗겨짐</li>
                  <li><strong style={{ color: 'var(--text)' }}>식초 1Ts 또는 베이킹소다 1ts</strong> 끓는 물에 첨가</li>
                  <li><strong style={{ color: 'var(--text)' }}>삶은 직후 얼음물 5분</strong> — 막이 수축하며 흰자와 분리</li>
                  <li><strong style={{ color: 'var(--text)' }}>둥근 쪽 (공기집)부터 까기</strong> — 살짝 굴려 균열 낸 뒤 시작</li>
                </ul>
                특히 잼 노른자는 흰자가 약해 더 어려움 — 묵은 계란 + 얼음물 조합 필수.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q3. 노른자가 회녹색이 되는 이유?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>너무 오래 끓이면</strong> 흰자의 황(S)과 노른자의 철(Fe)이 반응해 황화철(FeS)이 형성됩니다. 회색-녹색 띠처럼 보이며 황 냄새가 납니다.
                <br /><br />
                <strong style={{ color: '#FFB83E' }}>안전성 문제는 없지만</strong> 식감과 비주얼이 떨어집니다. 예방:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>12분 이내로 끝내기</li>
                  <li>완성 즉시 얼음물에 5분 (반응 정지)</li>
                  <li>자주 발생하면 시간 1~2분 단축</li>
                </ul>
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q4. 잼 노른자 정확한 시간은?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>7분 (특란 + 실온 + 끓는 물 투입)</strong>이 표준. 라멘 아지타마와 양념장계란(마야크 에그)의 핵심 단계입니다. 흰자는 완전히 익고 노른자는 걸쭉한 잼 농도 (걸레 짜듯).
                <br /><br />
                정확도가 중요하니 다음 조건 통일:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>크기: 특란 (68~78g)</li>
                  <li>온도: 실온 (30분 꺼낸 상태) — 냉장 시 8분</li>
                  <li>조리법: 끓는 물 투입 → 정확히 7분 → 즉시 얼음물 5분</li>
                  <li>껍질 까기: 5~7일 묵은 계란 사용 + 둥근 쪽부터</li>
                </ul>
                ±15초 차이로 농도가 크게 달라지므로 타이머 필수.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q5. 라면 계란 반숙은 몇 분?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>6분</strong>. 흰자는 다 익고 노른자는 약 60% 흐르는 상태. 라면 국물에 풀면 진하고 부드러워집니다.
                <br /><br />
                팁: 라면 끓이는 동시에 계란 삶기 어렵다면, 라면 끓는 물에 마지막 6분 동안 계란을 같이 넣고 익히면 동시 완성 가능. 단, 라면 양념이 침투할 수 있음.
                <br /><br />
                흐름 노른자(5분)를 원하면 라면 위에 노른자 깨서 올리는 방식도 추천. 한국 신선란은 비교적 안전하지만 어린이·임산부는 완전 익힘 권장.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q6. 12개 한꺼번에 삶을 때 시간 보정은?</p>
              <div style={faqAnswer}>
                계란이 많을수록 물의 열용량이 부족해져 약간 더 시간이 걸립니다:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>1~6개</strong>: 표준 시간</li>
                  <li><strong>7~11개</strong>: 표준 시간 (영향 미미)</li>
                  <li><strong>12~17개</strong>: <strong style={{ color: 'var(--text)' }}>+1분</strong></li>
                  <li><strong>18개+</strong>: <strong style={{ color: 'var(--text)' }}>+2분</strong> 또는 2번에 나눠 조리</li>
                </ul>
                또한 냄비가 너무 작으면 물 온도가 더 떨어지므로 큰 냄비 + 충분한 물(계란이 완전히 잠길 정도) 사용 권장.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q7. 고도가 높은 곳에서 시간은?</p>
              <div style={faqAnswer}>
                고도가 높을수록 물의 끓는점이 낮아져(100m당 -0.3°C) 더 오래 걸립니다:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>0~300m</strong> (한국 대부분 도시): 보정 불필요</li>
                  <li><strong>500m</strong>: +5%</li>
                  <li><strong>1,000m</strong> (한라산 영실): +10%</li>
                  <li><strong>1,500m+</strong> (백두산·후지산): +15%</li>
                </ul>
                한국 도시에서는 거의 영향 없음. 캠핑·산행 시에만 고려.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q8. 찜기로 삶으면 끓이기와 차이?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>찜기는 +1~2분(약 +10%) 더 필요</strong>합니다. 끓는 물에 직접 닿는 것보다 증기로 익히는 열전달이 약하기 때문.
                <br /><br />
                <strong>장점:</strong>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>균일한 익힘 (위치별 차이 적음)</li>
                  <li>껍질이 잘 벗겨짐 (증기로 막 분리)</li>
                  <li>갈라짐 위험 적음</li>
                </ul>
                <strong>단점:</strong> 시간 ↑, 정확도 떨어짐. 한 번에 많은 양 (12개+) 익힐 때는 찜기가 유리.
              </div>
            </div>

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

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>관련 도구</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><Link href="/tools/cooking/microwave" style={{ color: 'var(--accent)' }}>전자레인지 출력·시간 환산</Link> — 600~1200W 변환</li>
            <li><Link href="/tools/cooking/ramen" style={{ color: 'var(--accent)' }}>라면 물양 계산기</Link> — 라면별 권장 물양</li>
            <li><Link href="/tools/cooking/frying" style={{ color: 'var(--accent)' }}>튀김 시간 계산기</Link> — 재료별 기름 온도</li>
            <li><Link href="/tools/cooking/thawing" style={{ color: 'var(--accent)' }}>냉동·해동 시간 계산기</Link> — 식품 해동</li>
            <li><Link href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)' }}>베이커 퍼센트 계산기</Link> — 제빵 배합비</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
