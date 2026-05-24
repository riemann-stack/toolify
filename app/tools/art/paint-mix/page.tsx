import Link from 'next/link'
import PaintMixClient from './PaintMixClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/art/paint-mix',
  title: '물감 혼합 계산기 — 색 섞기 시뮬레이터 + 분량 환산 + 30+ 레시피',
  description: '수채·아크릴·유화·잉크·푸드컬러·레진 안료 혼합 시뮬(Subtractive·Additive·RYB) + ml/g 환산·ΔE 매칭·30+ 인기 레시피.',
  keywords: [
    '물감 혼합', '물감 비율 계산기', '색 만들기', '잉크 섞기', '잉크 혼합 비율',
    '수채화 색 비율', '아크릴 색조 비율', '유화 색 만들기',
    '살색 만들기', '황토색 만들기', '차콜 회색 만들기', '민트색 비율',
    '12색환', '색환', '보색', '유사색', '삼각배색',
    '푸드컬러 비율', '베이킹 색소', '레진 안료 비율',
    'CMY 혼합', 'RYB 모델', '델타 E', 'ΔE 색차',
    '만년필 잉크 혼합', '다이아민 잉크', '컬러 매칭',
  ],
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

export default function PaintMixPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작 · 디자인·미술
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎨 물감 혼합 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        수채·아크릴·유화·잉크 안료 혼합 시뮬 + ml/g 환산 + <strong style={{ color: 'var(--text)' }}>ΔE 매칭과 30+ 인기 레시피</strong>.
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
          ⚠️ 본 도구의 색 시뮬레이션은 <strong>디지털 RGB 공간의 근사</strong>이며, 실제 물감·잉크의 안료 농도·매체(수성/유성)·건조 후 변색을 완전히 반영하지 않습니다.
          정확한 색은 <strong>반드시 소량 테스트</strong> 후 작업하세요. 분야별 안전 안내는{' '}
          <Link href="/disclaimer#art" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <PaintMixClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 색 혼합</strong> — 컬러 피커·HEX·프리셋으로 2~4색 추가, 비율 슬라이더로 조정 → 결과 색 자동 계산</li>
          <li><strong>모델 선택</strong> — 물감(기본)·빛·RYB(학교) 중 선택. 결과가 즉시 재계산됩니다</li>
          <li><strong>탭 2 분량 환산</strong> — 총량(ml/g/큰술)을 입력하면 색별 정확 분량을 표로 출력</li>
          <li><strong>탭 3 컬러 매칭</strong> — 목표 색을 입력하고 팔레트 선택 → 알고리즘이 2~3색 혼합 비율 추천</li>
          <li><strong>탭 4 레시피</strong> — 30+ 인기 색 카드 클릭 시 탭 1에 자동 적용 + 12색환에서 보색 탐색</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력값(색·비율·모델·총량·단위)은 자동 저장되어 새로고침해도 유지됩니다.
        </p>
      </div>

      {/* 2. 색 혼합 과학 */}
      <h2 style={sectionTitle}>🧪 색 혼합 과학 — 빛 vs 물감 vs RYB</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          색을 섞는 방법은 크게 세 가지입니다. 어떤 모델을 쓰느냐에 따라 결과가 완전히 달라요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 14 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #9333EA', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 14, color: '#9333EA', fontWeight: 700, margin: '0 0 6px' }}>⚫ Subtractive (물감·잉크)</p>
            <p style={{ fontSize: 12.5, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              안료가 빛을 <strong>흡수</strong>하고 남은 빛을 반사. 섞을수록 어두워짐.<br />
              <strong>3원색 = Cyan·Magenta·Yellow (CMY)</strong>, 모두 합치면 검정.
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0, fontStyle: 'italic' }}>
              👉 수채·아크릴·유화·잉크·인쇄·머리 염색 모두 이 방식
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #D97706', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 14, color: '#D97706', fontWeight: 700, margin: '0 0 6px' }}>💡 Additive (빛)</p>
            <p style={{ fontSize: 12.5, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              빛이 <strong>더해질수록</strong> 밝아짐. <br />
              <strong>3원색 = Red·Green·Blue (RGB)</strong>, 모두 합치면 흰색.
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0, fontStyle: 'italic' }}>
              👉 모니터·LED·무대 조명·프로젝터
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #0D9488', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 14, color: '#0D9488', fontWeight: 700, margin: '0 0 6px' }}>🎒 RYB (전통)</p>
            <p style={{ fontSize: 12.5, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              학교 미술의 <strong>빨강·노랑·파랑</strong> 3원색. <br />
              직관적이지만 과학적으론 부정확 (CMY가 더 정확).
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0, fontStyle: 'italic' }}>
              👉 학교 미술·전통 회화·아동 교육
            </p>
          </div>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
          💡 <strong style={{ color: 'var(--text)' }}>같은 빨강 + 파랑이 다른 결과를 내는 이유</strong> — Subtractive 모델에서는 어두운 보라가, Additive에서는 마젠타가, RYB에서는 자주빛 보라가 나옵니다.
          본 도구의 기본값은 <strong>Subtractive</strong>이며, 실제 물감 혼합과 가장 비슷한 결과를 보여줍니다.
        </p>
      </div>

      {/* 3. 12색환 + 보색 */}
      <h2 style={sectionTitle}>🎡 12색환 + 보색 표</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          색환에서 <strong>마주 보는 두 색</strong>이 보색입니다. 보색은 함께 쓰면 강한 대비를 주고, <strong>섞으면 무채색(회색·갈색)</strong>이 됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>주색</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>보색</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>혼합 결과 (Subtractive)</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>활용</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['빨강', '초록', '갈색·올리브', '크리스마스·보색 대비'],
                ['주황', '파랑', '회색·진청', '보헤미안·일몰'],
                ['노랑', '보라', '카키·회록', '봄꽃·라일락'],
                ['연두', '자홍', '회록색', '식물·스킨톤'],
                ['청록', '주황빨강', '회갈색', '바다·일몰'],
                ['하늘', '주황', '회색·코랄', '하늘·해변'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: '#9333EA', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 그림자·중성색이 필요할 때 <strong>검정만 추가하지 말고 보색을 살짝 섞으세요</strong>. 자연스럽고 살아있는 회색이 만들어집니다.
        </p>
      </div>

      {/* 4. 30+ 레시피 표 */}
      <h2 style={sectionTitle}>📚 30+ 인기 색 레시피 — 학교 12색 기준</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 작가·취미생이 자주 만드는 30+ 색의 학교 12색 비율입니다. 본 페이지의 [📚 레시피] 탭에서 카드 클릭으로 즉시 적용 가능.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>분류</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>색 이름</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>비율</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['👶 피부톤', '살색 (밝은)', '흰색 8 + 빨강 1 + 노랑 1'],
                ['🧒 피부톤', '살색 (중간)', '흰색 5 + 주황 2 + 빨강 1'],
                ['🟫 땅', '황토색', '노랑 4 + 빨강 2 + 검정 1'],
                ['🐪 땅', '카멜 베이지', '주황 3 + 갈색 1 + 흰색 4'],
                ['☕ 땅', '모카 브라운', '갈색 5 + 검정 1 + 빨강 1'],
                ['☁️ 하늘', '하늘색 (밝음)', '흰색 6 + 하늘 3 + 파랑 1'],
                ['🌫️ 하늘', '청회색', '파랑 3 + 검정 1 + 흰색 4'],
                ['🌊 하늘', '군청', '파랑 5 + 보라 1 + 검정 1'],
                ['🫐 하늘', '인디고', '파랑 4 + 검정 2 + 보라 1'],
                ['🌱 식물', '민트', '초록 1 + 흰색 6 + 하늘 1'],
                ['🌿 식물', '세이지 그린', '연두 3 + 흰색 3 + 검정 1'],
                ['🫒 식물', '올리브', '노랑 3 + 초록 2 + 검정 1'],
                ['💜 꽃', '라벤더', '파랑 2 + 빨강 1 + 흰색 5'],
                ['🪸 꽃', '코럴 핑크', '빨강 2 + 주황 2 + 흰색 3'],
                ['🌸 꽃', '더스티 핑크', '분홍 4 + 갈색 1 + 흰색 2'],
                ['🍷 꽃', '버건디', '빨강 4 + 검정 2 + 보라 1'],
                ['🌻 꽃', '머스타드', '노랑 5 + 주황 1 + 갈색 1'],
                ['🪨 회색', '차콜 그레이', '검정 5 + 흰색 1 + 파랑 1'],
                ['🥈 회색', '실버 그레이', '검정 1 + 흰색 6'],
                ['🐘 회색', '웜 그레이', '검정 2 + 흰색 5 + 갈색 1'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: 12 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: '#9333EA', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ 본 표는 일부 미리보기이며, 전체 30+ 레시피(테라코타·세이지·코랄·플럼·아이보리 등)는 [📚 레시피] 탭에서 확인 가능합니다.
        </p>
      </div>

      {/* 5. 분야별 가이드 */}
      <h2 style={sectionTitle}>🎓 분야별 가이드 — 수채·아크릴·잉크·푸드컬러</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li>💧 <strong>수채화</strong> — 4색 한정 팔레트(울트라마린·번트 시에나·옐로우 오커·알리자린 크림슨)로 거의 모든 색 가능. 물 비율 ↑ → 투명. 두 번 이상 덧칠 시 진해짐.</li>
          <li>🖌️ <strong>아크릴</strong> — 6색 기본(타이타늄 화이트·블랙·카드뮴 옐로우/레드/블루·프탈로 그린). 건조 후 살짝 어두워지므로 한 톤 밝게 섞기.</li>
          <li>🎨 <strong>유화</strong> — Zorn 4색 팔레트(울트라마린·알리자린·옐로우 오커·티타늄 화이트)로 인물 가능. 건조 수일 소요, 두꺼운 임파스토는 갈라짐 주의.</li>
          <li>✒️ <strong>만년필 잉크</strong> — 같은 브랜드·같은 베이스(dye/pigment)끼리만. ⚠️ 다른 브랜드 혼합 시 침전·만년필 막힘 위험. 시린지로 별도 테스트 필수.</li>
          <li>🧁 <strong>푸드컬러</strong> — 식약처 허가 식용 색소만. 젤 타입이 색 진하고 반죽 묽어짐 적음. 액상은 1방울씩 추가, 30분 후 발색 확인 (시간 지나며 진해짐).</li>
          <li>💎 <strong>레진·에폭시</strong> — 전용 마이카 파우더·레진 안료. 일반 물감은 경화 방해. ⚠️ 환기·장갑·고글 필수, 안료는 레진 무게의 3% 이하.</li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 모니터 색이랑 실제 물감 색이 왜 다른가요?</summary>
        <p style={faqAnswer}>
          <strong>모니터는 빛(RGB)을 더하는 방식, 물감은 빛(CMY)을 흡수하는 방식</strong>이기 때문입니다. 둘은 본질적으로 다른 색 공간이라 100% 일치할 수 없어요.
          또한 모니터마다 색 보정이 달라(sRGB / P3 / AdobeRGB), 같은 HEX도 화면별로 다르게 보입니다. 본 도구는 sRGB 기준이며, 실제 물감 결과는 <strong>안료 종류·매체(수성/유성)·종이/캔버스·건조 변색</strong>까지 반영해 차이가 생깁니다.
          정확한 색은 <strong>반드시 소량 테스트</strong> 후 작업하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. Subtractive·Additive·RYB 모델 차이는?</summary>
        <p style={faqAnswer}>
          <strong>Subtractive(물감)</strong>: 안료가 빛을 흡수. 3원색 CMY(시안·마젠타·옐로우), 모두 섞으면 검정. 본 도구의 <strong>기본값</strong>이며 실제 물감 혼합과 가장 비슷.<br />
          <strong>Additive(빛)</strong>: 빛이 더해짐. 3원색 RGB(빨강·초록·파랑), 모두 합치면 흰색. 모니터·LED·무대 조명용.<br />
          <strong>RYB(전통)</strong>: 학교 미술 빨강·노랑·파랑 3원색. 직관적이지만 과학적으론 CMY가 더 정확. 학교 수업·아동 교육용.<br />
          같은 빨강+파랑이라도 모델별 결과가 달라집니다 — Subtractive는 어두운 보라, Additive는 마젠타, RYB는 자주빛 보라.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 살색은 어떻게 만들어요?</summary>
        <p style={faqAnswer}>
          밝기에 따라 비율이 다릅니다. 본 도구의 [📚 레시피] 탭에 3종 톤이 있습니다:<br />
          • <strong>밝은 살색 (아기·어린이)</strong>: 흰색 8 + 빨강 1 + 노랑 1<br />
          • <strong>중간 살색 (일반 동양인)</strong>: 흰색 5 + 주황 2 + 빨강 1<br />
          • <strong>어두운 살색 (구릿빛)</strong>: 갈색 3 + 주황 2 + 흰색 4<br />
          핵심은 <strong>흰색 베이스 + 주황(빨강+노랑)</strong>입니다. 너무 빨간 살색이 나오면 노랑을 더 추가하세요. 인물의 그림자 색은 살색에 보색(파랑·보라)을 살짝 섞으면 자연스럽습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 보색을 섞으면 왜 회색·갈색이 나오나요?</summary>
        <p style={faqAnswer}>
          보색은 색환에서 <strong>마주 보는 색</strong>으로, 두 색이 흡수하는 빛의 파장이 정확히 <strong>가시광선 전체를 덮습니다</strong>.
          물감이 모든 빛을 흡수하면 = 빛이 안 반사됨 = 회색·갈색·검정처럼 보여요.<br />
          • 빨강 + 초록 = 갈색·올리브<br />
          • 주황 + 파랑 = 회색·진청<br />
          • 노랑 + 보라 = 카키·회록<br />
          이 특성을 활용해 <strong>그림자·중성색</strong>을 만들 때 검정만 추가하지 말고 보색을 살짝 섞으면 살아있는 회색이 됩니다. (작가들이 자주 쓰는 테크닉)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 빨강 + 파랑 = 보라가 항상 나오나요?</summary>
        <p style={faqAnswer}>
          이론적으론 보라지만 실제론 <strong>탁한 갈색·회보라</strong>가 자주 나옵니다.<br />
          이유는 <strong>대부분의 빨강이 약간의 노랑을 포함</strong>하기 때문이에요. 카드뮴 레드는 노랑 기운, 알리자린 크림슨은 파랑 기운. 빨강에 노랑이 섞이면 + 파랑 → 3원색이 모두 모여 회색·갈색이 됩니다.<br />
          <strong>선명한 보라를 원하면</strong> 알리자린 크림슨(파랑 기운 빨강) + 울트라마린 또는 퀴나크리돈 마젠타 + 코발트 블루 조합을 쓰세요. 학교 12색 빨강만으로는 한계가 있습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 안료 농도가 다른데 같은 비율이면 같은 색?</summary>
        <p style={faqAnswer}>
          아닙니다. 같은 1ml라도 <strong>안료 농도(pigment load)</strong>에 따라 결과가 크게 달라집니다.<br />
          • <strong>전문가 물감</strong>(신한 SWC·홀베인·다니엘 스미스): 안료 농도 ↑ → 적은 양으로도 진함<br />
          • <strong>학생용 물감</strong>(펜텔·칼라플러스): 안료 농도 ↓, 비활성 충전제 ↑ → 같은 양이라도 흐림<br />
          • <strong>젤 푸드컬러</strong>: 액상보다 4~5배 진함 → 절반 이하로 사용<br />
          본 도구의 [분량 환산] 탭에 <strong>안료 농도 보정 슬라이더(0.5×~2.0×)</strong>가 있으니, 진한 안료는 0.5×, 흐린 안료는 1.5×~2× 적용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 잉크 혼합 시 주의사항은?</summary>
        <p style={faqAnswer}>
          만년필 잉크는 <strong>같은 브랜드·같은 베이스끼리만</strong> 혼합하세요. 다른 조합은 <strong>침전·응집·만년필 막힘 위험</strong>이 큽니다.<br />
          • <strong>안전한 조합</strong>: 같은 브랜드 dye 잉크끼리 (예: 다이아민 + 다이아민)<br />
          • <strong>위험한 조합</strong>: dye + pigment, 다른 브랜드, 산성(iron gall) + 알칼리성<br />
          • 혼합 전 <strong>시린지·작은 용기에서 테스트</strong>해 24시간 후 침전 확인<br />
          • 만년필 분해 청소가 어려운 모델(파일럿 캡리스 등)에는 혼합 잉크 사용 금지<br />
          캘리그래피용 펜촉(Nikko·Brause)은 만년필보다 막힘 영향 적어 자유로운 혼합 가능합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 푸드컬러는 어떤 비율로 사용?</summary>
        <p style={faqAnswer}>
          <strong>식약처 허가 식용 색소</strong>(타르색소·천연색소)만 사용해야 하며, 미술용 안료는 절대 식용 금지입니다.<br />
          • <strong>젤 푸드컬러</strong>: 이쑤시개로 살짝 찍어 첨가 (1g 이하). 색이 진하고 반죽 묽어짐 적음<br />
          • <strong>액상 푸드컬러</strong>: 1방울씩 추가. 풍부한 색은 5~10방울 필요<br />
          • <strong>천연 색소</strong>(비트·당근·시금치 분말): 분말 1~3% 첨가, 발색은 약하지만 안전<br />
          • <strong>30분 후 발색 확인</strong> — 시간이 지날수록 진해지므로 처음엔 적게<br />
          베이킹 작업은 <a href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)' }}>베이커 퍼센트 계산기</a>·<a href="/tools/cooking/baking-recipe" style={{ color: 'var(--accent)' }}>베이킹 레시피 환산</a>도 함께 활용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 레진 안료는 g 단위로 정확해야 하는 이유?</summary>
        <p style={faqAnswer}>
          레진(에폭시)은 화학 경화 반응을 거치므로 <strong>안료 비율이 너무 높으면 경화 불량</strong>이 발생합니다.<br />
          • <strong>안전 한계</strong>: 안료가 레진+경화제 전체 무게의 <strong>3% 이하</strong>를 권장<br />
          • <strong>5% 이상</strong>: 끈적임·표면 결함·완전 경화 실패 가능<br />
          • <strong>10% 이상</strong>: 경화 자체가 안 되거나 며칠 지나도 액상 유지<br />
          전자저울(0.01g)로 정밀 계량하고, 일반 물감/잉크 대신 <strong>레진 전용 안료(마이카 파우더·알코올 잉크·레진 페이스트)</strong>를 사용하세요. 일반 수성 물감은 레진의 화학 결합을 방해해 경화 불량 원인이 됩니다.<br />
          ⚠️ 작업 시 환기·장갑·고글 필수. 미경화 레진은 피부 자극·알레르기 유발.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. ΔE(델타 E)가 무엇인가요?</summary>
        <p style={faqAnswer}>
          <strong>두 색이 사람 눈에 얼마나 다르게 보이는지</strong> 수치화한 값입니다 (CIELAB 색공간 거리). 작을수록 비슷.<br />
          • <strong>ΔE 0~1</strong>: 완벽 — 일반인 거의 구별 불가<br />
          • <strong>ΔE 1~2</strong>: 매우 비슷 — 훈련된 눈만 구별<br />
          • <strong>ΔE 2~5</strong>: 비슷 — 한눈에 비슷, 자세히 보면 차이<br />
          • <strong>ΔE 5~10</strong>: 가능 — 명확히 다르지만 같은 계열<br />
          • <strong>ΔE 10+</strong>: 다름 — 완전히 다른 색<br />
          본 도구의 <strong>컬러 매칭</strong> 탭은 ΔE를 최소화하는 혼합 비율을 brute-force로 탐색합니다. 인쇄·도장·자동차 페인트 업계 표준 지표예요.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/color" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>색상 코드 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            HEX·RGB·HSL·OKLCH·WCAG 대비비
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🌀</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금 비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            φ = 1.618 디자인 비율
          </p>
        </Link>
        <Link href="/tools/unit/converter" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>단위 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            ml·g·큰술·당도·농도 환산
          </p>
        </Link>
      </div>
    </div>
  )
}
