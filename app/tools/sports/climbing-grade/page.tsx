import Link from 'next/link'
import ClimbingGradeClient from './ClimbingGradeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/sports/climbing-grade',
  title: '클라이밍 등급 변환기 — V·Font·YDS·French·UIAA 난이도 환산',
  description:
    '볼더링 V등급 ↔ Font(폰), 루트 YDS ↔ French ↔ UIAA 클라이밍 난이도를 한 번에 환산. 등급별 난이도 밴드(입문~엘리트)와 표준 변환표.',
  keywords: ['클라이밍등급변환', '볼더링V등급', '폰테인블로등급', 'YDS난이도', '클라이밍난이도표', 'V등급폰환산', '클라이밍등급표', '실내클라이밍등급'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const FAQ_LD = [
  { q: 'V등급과 Font(폰테인블로)는 어떻게 다른가요?', a: '둘 다 <strong>볼더링(짧고 강한 문제)</strong> 난이도 체계입니다. V등급(V-scale)은 미국 텍사스 휴코탱크스에서 시작된 미국식, Font는 프랑스 퐁텐블로에서 유래한 유럽식입니다. 예를 들어 <strong>V4 ≈ Font 6B/6B+</strong>입니다. 한국 실내 클라이밍장은 대부분 V등급(또는 자체 색깔)을 쓰고, 유럽·아웃도어 자료는 Font가 많습니다.' },
  { q: 'YDS 5.10은 어느 정도 수준인가요?', a: 'YDS(요세미티 십진법)는 <strong>루트(리드/스포츠) 클라이밍</strong> 체계로 5.0부터 시작해 5.10부터 a·b·c·d로 세분됩니다. <strong>5.10대는 중급</strong> 수준으로, 꾸준히 다닌 동호인이 도전하는 구간입니다(French 6a~6b+, UIAA VI+~VII+). 5.12 이상이면 고급, 5.14 이상은 엘리트입니다.' },
  { q: '등급이 정확히 1:1로 변환되나요?', a: '아닙니다. 클라이밍 등급은 <strong>주관적이고 구간이 겹칩니다</strong>. 같은 V4라도 Font 6B일 수도 6B+일 수도 있고, 루트 성향(파워형·지구력형)이나 출처에 따라 한 단계 차이날 수 있습니다. 본 변환기는 <strong>표준 환산표 기준 근사치</strong>이며, 정확한 비교는 실제 등반 감각으로 보정하세요.' },
  { q: '실내 클라이밍장 색깔 난이도는 왜 체육관마다 다른가요?', a: '색깔 난이도(빨강·파랑 등)는 <strong>각 체육관이 자체적으로 정한 것</strong>이라 표준이 없습니다. 같은 “파랑”이라도 A체육관과 B체육관의 V등급이 다를 수 있어요. 그래서 본 변환기는 색깔이 아니라 <strong>국제 표준 체계(V·Font·YDS 등)</strong> 기준으로 환산합니다. 다니는 체육관의 색깔 ↔ V등급 표를 한번 확인해 두면 비교가 쉽습니다.' },
  { q: '볼더링 등급과 루트 등급을 직접 비교할 수 있나요?', a: '직접 1:1 비교는 어렵습니다. 볼더링(V·Font)은 <strong>짧고 폭발적인 힘</strong>, 루트(YDS·French)는 <strong>지구력과 긴 시퀀스</strong>를 보기 때문에 측정하는 능력이 다릅니다. 대략 V등급에 한 동작의 어려움이, YDS에 전체 루트의 지속적 난이도가 반영된다고 이해하면 됩니다. 본 도구는 모드(볼더링/루트)를 나눠 각 체계 안에서만 환산합니다.' },
  { q: '처음 시작하면 어느 등급부터 도전하나요?', a: '실내 볼더링이라면 <strong>V0~V1(Font 4~5)</strong>부터 시작해 기본 무브와 발 쓰기를 익힙니다. 몇 달 꾸준히 다니면 V2~V3(초급), 1년 안팎이면 V4~V5(중급)에 도전하는 경우가 많습니다. 다만 진도는 개인차·체형·훈련량에 따라 크게 다르니 등급보다 <strong>꾸준함과 부상 없는 등반</strong>에 집중하세요.' },
]

export default function ClimbingGradePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧗 클라이밍 등급 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        볼더링 <strong style={{ color: 'var(--text)' }}>V등급 ↔ Font</strong>, 루트 <strong style={{ color: 'var(--text)' }}>YDS ↔ French ↔ UIAA</strong> 난이도를 한 번에 환산.
      </p>

      <ClimbingGradeClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 체계 설명 */}
        <div>
          <h2 style={sectionTitle}>🪢 클라이밍 등급 체계 한눈에</h2>
          <div style={{ ...card }}>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.95 }}>
              <li><strong style={{ color: 'var(--text)' }}>V등급 (V-scale)</strong> — 미국식 <strong>볼더링</strong> 등급. V0~V17. 한국 실내 클라이밍장 다수가 사용.</li>
              <li><strong style={{ color: 'var(--text)' }}>Font (퐁텐블로)</strong> — 유럽식 <strong>볼더링</strong> 등급. 4~9A. 숫자+알파벳(6A·6B+ 등).</li>
              <li><strong style={{ color: 'var(--text)' }}>YDS (요세미티 십진법)</strong> — 미국식 <strong>루트(리드)</strong> 등급. 5.5~5.15d, 5.10부터 a·b·c·d.</li>
              <li><strong style={{ color: 'var(--text)' }}>French (프렌치)</strong> — 유럽식 <strong>루트</strong> 등급. 스포츠 클라이밍 국제 표준(6a·7a+ 등).</li>
              <li><strong style={{ color: 'var(--text)' }}>UIAA</strong> — 독일·알파인권 루트 등급. 로마숫자(VII+ 등). 가장 근사적.</li>
            </ul>
          </div>
        </div>

        {/* 볼더링 vs 루트 */}
        <div>
          <h2 style={sectionTitle}>🧗 볼더링 vs 루트 — 무엇이 다른가요?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #CA8A04' }}>
              <p style={{ fontSize: '13px', color: '#CA8A04', fontWeight: 700, marginBottom: '8px' }}>볼더링 (V · Font)</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li>짧고 강한 문제(보통 4~12동작)</li>
                <li>로프 없이 매트 위에서</li>
                <li>폭발적인 파워·정교한 무브</li>
                <li>실내 클라이밍 입문에 흔함</li>
              </ul>
            </div>
            <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
              <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>루트/리드 (YDS · French)</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li>길고 지속적인 벽(수 m~수십 m)</li>
                <li>로프·확보 장비 사용</li>
                <li>지구력·페이스 배분이 중요</li>
                <li>아웃도어 스포츠 클라이밍 표준</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 한국 맥락 */}
        <div>
          <h2 style={sectionTitle}>🇰🇷 한국 실내 클라이밍 팁</h2>
          <div style={{ ...card, fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: 0 }}>
              한국 실내 클라이밍장은 대부분 <strong style={{ color: 'var(--text)' }}>V등급 또는 자체 색깔 난이도</strong>를 씁니다. 색깔은 표준이 없어 체육관마다 달라서, 다른 체육관·아웃도어와 비교하려면 V·Font·YDS 같은 국제 체계로 환산하는 게 정확합니다. 다니는 체육관의 <strong style={{ color: 'var(--text)' }}>색깔 ↔ V등급</strong> 표를 한번 받아두면 위 변환기와 함께 어디서든 내 수준을 가늠할 수 있어요.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <div style={{
          background: 'rgba(217,119,6,0.06)',
          border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.8,
        }}>
          <strong style={{ color: '#D97706' }}>⚠️ 참고용 안내</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            클라이밍 등급은 본질적으로 <strong style={{ color: 'var(--text)' }}>주관적이며 구간이 겹칩니다</strong>. 본 변환은 널리 쓰이는 표준 환산표 기준 근사치로, 출처·세터·루트 성향에 따라 한 단계 차이날 수 있습니다. 안전 등반(매트·확보·파트너 확인)을 항상 우선하세요.
          </p>
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/strength-level', icon: '💪', name: '스트렝스 레벨 계산기', desc: '근력 수준·윌크스 점수' },
              { href: '/tools/sports/one-rm', icon: '🏋️', name: '1RM 계산기', desc: '최대 중량·훈련 강도' },
              { href: '/tools/sports/hiking-time', icon: '🥾', name: '등산 시간 계산기', desc: '아웃도어 코스 소요 시간' },
              { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '체중 대비 근력 관리' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
