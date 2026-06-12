import Link from 'next/link'
import BrewClient from './BrewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/cooking/brew',
  title: '커피 브루잉 계산기 — 핸드드립·프렌치프레스·콜드브루 6 추출법',
  description: '핸드드립·프렌치프레스·에어로프레스·콜드브루·모카포트·에스프레소 6가지 추출법 + 비율·온도·시간·분쇄도 매트릭스.',
  keywords: ['커피 비율', '핸드드립 비율', '1:15 비율', 'SCA 골든컵', '콜드브루 비율', '에스프레소 추출', '푸어 스케줄', '블루밍', '홈카페 계산', '원두 g 물 ml'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
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
  { "q":"1:15 비율이면 정확히 얼마인가요?","a":"원두 1g당 물 15ml이라는 뜻입니다. 즉 원두 20g + 물 300ml, 원두 30g + 물 450ml처럼 쉽게 곱셈으로 환산할 수 있어요. SCA가 권장하는 골든 컵 영역(1:15~17)의 시작점이며, 가장 일반적인 핸드드립·프렌치프레스 표준 비율입니다." },
  { "q":"핸드드립 표준 비율은?","a":"1:15 ~ 1:17이 가장 일반적입니다. V60·하리오·칼리타·케맥스 모두 비슷해요. 진하게 마시고 싶으면 1:14~15, 연하게 마시고 싶으면 1:17~18. 일반 머그(250ml) 기준으로 1:16이라면 원두 약 16g + 물 250ml가 표준입니다." },
  { "q":"콜드브루는 왜 1:8로 진하게 추출하나요?","a":"콜드브루는 보통 농축액(Concentrate) 형태로 만들고, 마실 때 물·우유·얼음으로 1:1 또는 1:2 희석해서 마시기 때문입니다. 1:8 농축액을 1:1 희석하면 결과적으로 1:16의 일반 추출과 비슷한 농도가 됩니다. 바로 마실 거라면 1:15~17 비율로 만들면 됩니다." },
  { "q":"에스프레소 1:2 비율은 어떻게 측정하나요?","a":"에스프레소의 비율은 인풋(원두):아웃풋(추출된 샷)을 의미합니다. 예: 원두 18g + 추출된 샷 36g = 1:2. 다른 추출법과 달리 \"물의 양\"이 아니라 \"추출된 샷의 무게\"를 기준으로 합니다. 일반적으로 1:1.5(리스트레토), 1:2(노멀), 1:2.5~3(룽고)으로 분류해요. 에스프레소 머신의 저울 또는 샷글라스로 측정합니다." },
  { "q":"블루밍은 왜 하나요?","a":"신선한 원두에는 로스팅 중 발생한 CO₂ 가스가 갇혀 있어요. 첫 푸어를 적게 부어 30초 휴지하면 가스가 빠지면서 원두가 부풀어 오릅니다(블루밍·꽃피기). 이 과정 없이 바로 본 추출을 하면 가스가 물의 침투를 방해해 추출이 고르지 않게 됩니다. 거품이 거의 안 올라오면 로스팅 후 1주일 이상 지난 원두일 가능성이 높아요." },
  { "q":"라이트와 다크 로스팅 비율 차이는?","a":"• 라이트 로스팅: 밀도가 높고 추출이 어려워 1:14~15로 진하게. 신맛·꽃향·과일향이 두드러집니다. • 미디엄: SCA 표준 1:15~17. 균형이 가장 좋아요. • 다크 로스팅: 밀도가 낮고 쓴맛이 강해 1:16~18로 약하게. 쓴맛·캐러멜·초콜릿 향이 강조됩니다." },
  { "q":"아이스 커피는 얼음 무게를 어떻게 빼나요?","a":"핫푸어 후 얼음 위에 부어 만드는 \"재패니즈 아이스\"는 얼음이 녹으면서 희석되는 만큼 추출수에서 빼야 합니다. 예: 300ml 아이스를 만들려면 얼음 100g + 추출수 200ml (총 300ml). 추출수 비율은 1:13~14로 평소보다 진하게 빼는 것이 기본입니다. 콜드브루는 처음부터 차게 추출하므로 얼음 보정이 필요 없어요." },
  { "q":"SCA 골든 컵은 무엇인가요?","a":"SCA(Specialty Coffee Association)가 정한 \"가장 균형 잡힌 추출 영역\". 비율 1:15~17, TDS 1.15~1.35%, 추출 수율 18~22%, 물 온도 90~96°C 기준입니다. 이 범위 안에서 신맛·단맛·쓴맛이 가장 조화롭다는 것이 SCA의 권장이며, 핸드드립·푸어오버의 표준 시작점으로 널리 사용됩니다." },
  { "q":"홈브루가 카페보다 얼마나 싼가요?","a":"원두 100g 25,000원 기준으로 1잔(원두 16g) ≈ 약 4,000원이지만, 이건 SP 원두(스페셜티) 기준이고 일반 원두는 100g 10,000~15,000원 → 1잔 약 1,500~2,400원. 카페 1잔 4,500~5,500원 대비 1잔당 2,000~3,500원 절감, 1일 1잔이면 월 6~10만원 / 연 70~120만원 절감이 가능합니다. 비용 비교 탭에서 본인 원두 가격으로 정확히 계산해 보세요." },
  { "q":"추출 후 맛이 너무 쓰면? (과추출 진단)","a":"쓴맛은 과추출(Over-extraction)의 신호입니다. 원인 순서: ① 분쇄가 너무 가늘다 — 한 단계 굵게 ② 추출 시간이 너무 길다 — 푸어를 더 빠르게 ③ 물 온도가 너무 높다 — 90°C 이하로 ④ 비율이 너무 진하다 — 1:16~17로 늘리기 ⑤ 다크 로스팅 원두 — 1:17~18 권장. 반대로 신맛만 강하고 단맛이 부족하면 과소추출(Under) — 분쇄를 가늘게, 시간 길게, 비율 진하게로 조정합니다." }
]

export default function BrewPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ☕ 커피 브루잉 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        핸드드립·콜드브루·에어로프레스 <strong style={{ color: 'var(--text)' }}>6가지 추출법</strong> + 비율·온도·시간·분쇄도 매트릭스.
      </p>

      <BrewClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>추출법 선택</strong> — 6종 카드 (핸드드립이 가장 흔함)</li>
          <li><strong>비율 선택</strong> — 추출법별 권장 비율 기본 (핸드드립 1:16, SCA 골든 1:15~17) 또는 1:5~25 슬라이더</li>
          <li><strong>입력 모드 선택</strong> — 원두→물 / 물→원두 / 잔수 기준</li>
          <li><strong>결과 확인</strong> — 원두·물·잔수 + 권장 온도·시간·분쇄도</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>푸어 스케줄 탭</strong>에서 핸드드립의 블루밍·1차·2차 푸어
          시간과 물량을 단계별로 확인할 수 있어요.
        </p>
      </div>

      {/* 2. 추출법별 황금 비율 */}
      <h2 style={sectionTitle}>📊 추출법별 황금 비율 매트릭스</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>추출법</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>비율</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>온도</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>시간</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>분쇄</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['☕ 핸드드립',     '1:15~17', '90~93°C', '2:30~3:30', '중간 🧂'],
                ['🪶 프렌치프레스', '1:15~17', '92~95°C', '4분 침지',   '굵게 🧂'],
                ['💉 에어로프레스', '1:13~15', '80~85°C', '1:30~2:00', '중세'],
                ['🧊 콜드브루',     '1:8~10',  '4~22°C',  '12~24시간',  '굵게 🧂'],
                ['☕ 모카포트',     '1:7~10',  '95~100°C', '4~6분',      '매우 가늘게 🌾'],
                ['💪 에스프레소',   '1:1.5~2.5','92~94°C','25~30초',    '매우 가늘게 🌾'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'Inter, "Noto Sans KR", system-ui, sans-serif',
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

      {/* 3. SCA 골든 컵 */}
      <h2 style={sectionTitle}>🏆 SCA 골든 컵 표준이란?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>SCA(Specialty Coffee Association)</strong>가 정한 &quot;가장 균형 잡힌 추출 영역&quot;을 골든 컵(Golden Cup)이라고 합니다.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>비율</strong>: 1:15~17 (원두 1g당 물 15~17ml)</li>
          <li><strong style={{ color: 'var(--text)' }}>TDS (Total Dissolved Solids)</strong>: 1.15~1.35% (음료의 총 용해 고형분 농도)</li>
          <li><strong style={{ color: 'var(--text)' }}>추출 수율</strong>: 18~22% (원두 무게 중 물에 녹은 비율)</li>
          <li><strong style={{ color: 'var(--text)' }}>물 온도</strong>: 90~96°C</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          이 영역에서 신맛·단맛·쓴맛이 가장 균형을 이룬다는 것이 SCA의 권장이지만,
          개인 취향에 따라 1:14의 진한 영역이나 1:18의 연한 영역도 충분히 매력적이에요.
        </p>
      </div>

      {/* 4. 로스팅 정도별 */}
      <h2 style={sectionTitle}>🔥 로스팅 정도별 비율 조정법</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🌾 라이트 (시나몬·시티)', d: '신맛·꽃향·과일향. 1:14~15로 진하게 추출하면 산미·단맛이 균형.', c: '#C9A77D' },
            { t: '🍂 미디엄 (시티·풀시티)', d: '균형 잡힌 단맛·바디. SCA 표준 1:15~17 적용 권장.',                c: '#7B4F2C' },
            { t: '🌑 다크 (프렌치·이탈리안)', d: '쓴맛·캐러멜·초콜릿. 1:16~18로 약하게 빼면 쓴맛 완화.',           c: '#3A1E10' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c === '#3A1E10' ? '#D97706' : g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⚠️ 비율보다 더 큰 영향을 주는 변수: <strong style={{ color: 'var(--text)' }}>원두 신선도(로스팅 일자 7~21일) → 분쇄도 → 물 온도 → 추출 시간 → 비율</strong> 순서.
          신선한 원두 + 적절한 분쇄도가 비율 미세 조정보다 큰 차이를 만듭니다.
        </p>
      </div>

      {/* 5. 푸어 스케줄 의미 */}
      <h2 style={sectionTitle}>⏱️ 푸어 스케줄 — 블루밍·1차·2차 의미</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { t: '🌱 블루밍 (Bloom)', d: '원두 무게 × 2g의 물로 적셔 30초 휴지. CO₂ 가스가 빠지며 부풀어 오릅니다. 신선한 원두는 거품이 잘 일어나요.', c: '#0D9488' },
            { t: '💧 1차 푸어',        d: '0:30~1:30, 누적 60%까지. 가운데서 원형으로 천천히 따릅니다. 가장 진한 추출이 일어나는 단계.',         c: '#0891B2' },
            { t: '💧 2차 푸어',        d: '1:30~2:30, 누적 100%까지. 안쪽 원만 따라 균형을 맞춥니다. 산미·향이 추출되는 단계.',                  c: '#EA580C' },
            { t: '⏳ 추출 마무리',     d: '2:30~3:30, 드리퍼의 물이 모두 빠질 때까지 대기. 너무 빠르면 굵은 분쇄, 너무 느리면 가는 분쇄.',         c: '#9B59B6' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 1:15 비율이면 정확히 얼마인가요?</summary>
        <p style={faqAnswer}>
          원두 1g당 물 15ml이라는 뜻입니다. 즉 <strong>원두 20g + 물 300ml</strong>, <strong>원두 30g + 물 450ml</strong>처럼
          쉽게 곱셈으로 환산할 수 있어요. SCA가 권장하는 골든 컵 영역(1:15~17)의 시작점이며,
          가장 일반적인 핸드드립·프렌치프레스 표준 비율입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 핸드드립 표준 비율은?</summary>
        <p style={faqAnswer}>
          <strong>1:15 ~ 1:17</strong>이 가장 일반적입니다. V60·하리오·칼리타·케맥스 모두 비슷해요.
          진하게 마시고 싶으면 1:14~15, 연하게 마시고 싶으면 1:17~18. 일반 머그(250ml) 기준으로
          1:16이라면 원두 약 16g + 물 250ml가 표준입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 콜드브루는 왜 1:8로 진하게 추출하나요?</summary>
        <p style={faqAnswer}>
          콜드브루는 보통 <strong>농축액(Concentrate)</strong> 형태로 만들고, 마실 때 물·우유·얼음으로
          1:1 또는 1:2 희석해서 마시기 때문입니다. 1:8 농축액을 1:1 희석하면 결과적으로 1:16의
          일반 추출과 비슷한 농도가 됩니다. 바로 마실 거라면 1:15~17 비율로 만들면 됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 에스프레소 1:2 비율은 어떻게 측정하나요?</summary>
        <p style={faqAnswer}>
          에스프레소의 비율은 <strong>인풋(원두):아웃풋(추출된 샷)</strong>을 의미합니다.
          예: 원두 18g + 추출된 샷 36g = 1:2. 다른 추출법과 달리 &quot;물의 양&quot;이 아니라
          &quot;추출된 샷의 무게&quot;를 기준으로 합니다. 일반적으로 1:1.5(리스트레토), 1:2(노멀),
          1:2.5~3(룽고)으로 분류해요. 에스프레소 머신의 저울 또는 샷글라스로 측정합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 블루밍은 왜 하나요?</summary>
        <p style={faqAnswer}>
          신선한 원두에는 <strong>로스팅 중 발생한 CO₂ 가스</strong>가 갇혀 있어요. 첫 푸어를 적게 부어
          30초 휴지하면 가스가 빠지면서 원두가 부풀어 오릅니다(블루밍·꽃피기). 이 과정 없이 바로
          본 추출을 하면 가스가 물의 침투를 방해해 추출이 고르지 않게 됩니다.
          <strong> 거품이 거의 안 올라오면 로스팅 후 1주일 이상 지난 원두</strong>일 가능성이 높아요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 라이트와 다크 로스팅 비율 차이는?</summary>
        <p style={faqAnswer}>
          • <strong>라이트 로스팅</strong>: 밀도가 높고 추출이 어려워 <strong>1:14~15로 진하게</strong>.
          신맛·꽃향·과일향이 두드러집니다.<br />
          • <strong>미디엄</strong>: SCA 표준 <strong>1:15~17</strong>. 균형이 가장 좋아요.<br />
          • <strong>다크 로스팅</strong>: 밀도가 낮고 쓴맛이 강해 <strong>1:16~18로 약하게</strong>.
          쓴맛·캐러멜·초콜릿 향이 강조됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 아이스 커피는 얼음 무게를 어떻게 빼나요?</summary>
        <p style={faqAnswer}>
          핫푸어 후 얼음 위에 부어 만드는 &quot;재패니즈 아이스&quot;는 얼음이 녹으면서 희석되는 만큼
          <strong> 추출수에서 빼야</strong> 합니다. 예: 300ml 아이스를 만들려면 얼음 100g + 추출수 200ml
          (총 300ml). 추출수 비율은 1:13~14로 평소보다 진하게 빼는 것이 기본입니다.
          콜드브루는 처음부터 차게 추출하므로 얼음 보정이 필요 없어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. SCA 골든 컵은 무엇인가요?</summary>
        <p style={faqAnswer}>
          <strong>SCA(Specialty Coffee Association)</strong>가 정한 &quot;가장 균형 잡힌 추출 영역&quot;.
          비율 1:15~17, TDS 1.15~1.35%, 추출 수율 18~22%, 물 온도 90~96°C 기준입니다.
          이 범위 안에서 신맛·단맛·쓴맛이 가장 조화롭다는 것이 SCA의 권장이며,
          핸드드립·푸어오버의 표준 시작점으로 널리 사용됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 홈브루가 카페보다 얼마나 싼가요?</summary>
        <p style={faqAnswer}>
          원두 100g 25,000원 기준으로 <strong>1잔(원두 16g) ≈ 약 4,000원</strong>이지만,
          이건 SP 원두(스페셜티) 기준이고 일반 원두는 100g 10,000~15,000원 → <strong>1잔 약 1,500~2,400원</strong>.
          카페 1잔 4,500~5,500원 대비 <strong>1잔당 2,000~3,500원 절감</strong>,
          1일 1잔이면 <strong>월 6~10만원 / 연 70~120만원 절감</strong>이 가능합니다.
          비용 비교 탭에서 본인 원두 가격으로 정확히 계산해 보세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 추출 후 맛이 너무 쓰면? (과추출 진단)</summary>
        <p style={faqAnswer}>
          쓴맛은 <strong>과추출(Over-extraction)</strong>의 신호입니다. 원인 순서:<br />
          ① <strong>분쇄가 너무 가늘다</strong> — 한 단계 굵게<br />
          ② <strong>추출 시간이 너무 길다</strong> — 푸어를 더 빠르게<br />
          ③ <strong>물 온도가 너무 높다</strong> — 90°C 이하로<br />
          ④ <strong>비율이 너무 진하다</strong> — 1:16~17로 늘리기<br />
          ⑤ <strong>다크 로스팅 원두</strong> — 1:17~18 권장.<br />
          반대로 <strong>신맛만 강하고 단맛이 부족</strong>하면 과소추출(Under) — 분쇄를 가늘게,
          시간 길게, 비율 진하게로 조정합니다.
        </p>
      </details>

      {/* cooking 도구 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/cooking/recipe" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>레시피 비율·단위 변환</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인분·큰술·g 환산
          </p>
        </Link>
        <Link href="/tools/cooking/baker-percent" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🥖</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>베이커 퍼센트 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            제빵 배합비·수분율
          </p>
        </Link>
        <Link href="/tools/cooking/baking-schedule" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍞</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>제빵 타임라인 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            발효·굽기 일정 자동
          </p>
        </Link>
      </div>
    </div>
  )
}
