import Link from 'next/link'
import ClimbingGradeClient from './ClimbingGradeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'
import UpdatedMeta from '@/components/UpdatedMeta'
import { BANDS, BOULDER_ROWS, ROUTE_ROWS } from './climbingData'

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
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' }
const bandDot: React.CSSProperties = { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '7px', verticalAlign: 'middle' }
const tableNote: React.CSSProperties = { fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.75 }

const FAQ_LD = [
  { q: 'V등급과 Font(폰테인블로)는 어떻게 다른가요?', a: '둘 다 <strong>볼더링(짧고 강한 문제)</strong> 난이도 체계입니다. V등급(V-scale)은 미국 텍사스 휴코탱크스에서 시작된 미국식, Font는 프랑스 퐁텐블로에서 유래한 유럽식입니다. 예를 들어 <strong>V4 ≈ Font 6B/6B+</strong>입니다. 한국 실내 클라이밍장은 대부분 V등급(또는 자체 색깔)을 쓰고, 유럽·아웃도어 자료는 Font가 많습니다.' },
  { q: 'YDS 5.10은 어느 정도 수준인가요?', a: 'YDS(요세미티 십진법)는 <strong>루트(리드/스포츠) 클라이밍</strong> 체계로 5.0부터 시작해 5.10부터 a·b·c·d로 세분됩니다. <strong>5.10대는 중급</strong> 수준으로, 꾸준히 다닌 동호인이 도전하는 구간입니다(French 6a~6b+, UIAA VI+~VII+). 5.12 이상이면 고급, 5.14 이상은 엘리트입니다.' },
  { q: '등급이 정확히 1:1로 변환되나요?', a: '아닙니다. 클라이밍 등급은 <strong>주관적이고 구간이 겹칩니다</strong>. 같은 V4라도 Font 6B일 수도 6B+일 수도 있고, 루트 성향(파워형·지구력형)이나 출처에 따라 한 단계 차이날 수 있습니다. 본 변환기는 <strong>표준 환산표 기준 근사치</strong>이며, 정확한 비교는 실제 등반 감각으로 보정하세요.' },
  { q: '실내 클라이밍장 색깔 난이도는 왜 체육관마다 다른가요?', a: '색깔 난이도(빨강·파랑 등)는 <strong>각 체육관이 자체적으로 정한 것</strong>이라 표준이 없습니다. 같은 “파랑”이라도 A체육관과 B체육관의 V등급이 다를 수 있어요. 그래서 본 변환기는 색깔이 아니라 <strong>국제 표준 체계(V·Font·YDS 등)</strong> 기준으로 환산합니다. 다니는 체육관의 색깔 ↔ V등급 표를 한번 확인해 두면 비교가 쉽습니다.' },
  { q: '볼더링 등급과 루트 등급을 직접 비교할 수 있나요?', a: '직접 1:1 비교는 어렵습니다. 볼더링(V·Font)은 <strong>짧고 폭발적인 힘</strong>, 루트(YDS·French)는 <strong>지구력과 긴 시퀀스</strong>를 보기 때문에 측정하는 능력이 다릅니다. 대략 V등급에 한 동작의 어려움이, YDS에 전체 루트의 지속적 난이도가 반영된다고 이해하면 됩니다. 본 도구는 모드(볼더링/루트)를 나눠 각 체계 안에서만 환산합니다.' },
  { q: '처음 시작하면 어느 등급부터 도전하나요?', a: '실내 볼더링이라면 <strong>V0~V1(Font 4~5)</strong>부터 시작해 기본 무브와 발 쓰기를 익힙니다. 몇 달 꾸준히 다니면 V2~V3(초급), 1년 안팎이면 V4~V5(중급)에 도전하는 경우가 많습니다. 다만 진도는 개인차·체형·훈련량에 따라 크게 다르니 등급보다 <strong>꾸준함과 부상 없는 등반</strong>에 집중하세요.' },
  { q: 'Font 6A(볼더링)와 French 6a(루트)는 같은 난이도인가요?', a: '아닙니다. 표기는 비슷하지만 <strong>완전히 다른 체계</strong>입니다. 관례상 볼더링 Font 등급은 대문자(6A·7B+), 루트 French 등급은 소문자(6a·7b+)로 구분해 적습니다. 같은 숫자·알파벳이라도 볼더링 쪽이 훨씬 어려워, Font 6C+의 무브 난이도는 French 7c 루트에 가깝다고 알려져 있습니다. 통용 환산으로 <strong>Font 6A ≈ V3</strong>(볼더링), <strong>French 6a ≈ 5.10a</strong>(루트) 수준입니다.' },
  { q: '현재 세계에서 가장 어려운 클라이밍 등급은 무엇인가요?', a: '2026년 6월 기준 볼더링 최고 통용 등급은 <strong>V17(Font 9A)</strong>입니다. 2016년 날레 후카타이발이 핀란드의 ‘버든 오브 드림스(Burden of Dreams)’를 초등하며 처음 제안했고, 2025년 5월에는 한국의 <strong>이성수</strong>가 이 문제를 완등했습니다. 루트(리드) 최고 등급은 <strong>9c(5.15d)</strong>로, 2017년 아담 온드라가 노르웨이의 ‘사일런스(Silence)’를 초등한 것이 세계 최초의 9c입니다.' },
  { q: 'UIAA 등급은 어디에서 쓰이나요?', a: 'UIAA(국제산악연맹) 등급은 로마숫자(IV·VII+ 등)를 쓰며, 주로 <strong>독일·오스트리아·스위스 등 중부 유럽</strong>과 알파인(전통) 등반 자료에서 사용됩니다. 스포츠 클라이밍 가이드북은 대부분 French를 쓰기 때문에, UIAA는 알파인 루트나 유럽 가이드북을 볼 때 환산 용도로 알아두면 좋습니다. French·YDS와의 환산은 출처에 따라 반 단계~한 단계 차이가 날 수 있습니다.' },
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

      <UpdatedMeta
        date="2026년 6월"
        basis="통용 등급 환산표 기준 (근사 변환 · 공인 단일 표준 없음)"
        sources={[
          { label: 'Wikipedia — Grade (climbing)', href: 'https://en.wikipedia.org/wiki/Grade_(climbing)' },
          { label: '99Boulders', href: 'https://www.99boulders.com/bouldering-grades' },
        ]}
      />

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

        {/* 볼더링 변환표 (서버 렌더) */}
        <div>
          <h2 style={sectionTitle}>📋 볼더링 등급 변환표 — V등급 ↔ Font</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            V-scale과 Font 사이에는 공인된 단일 표준이 없으며, 아래는 널리 쓰이는 <strong style={{ color: 'var(--text)' }}>통용 근사 변환</strong>입니다. (위 변환기와 동일한 데이터)
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>V등급 (미국)</th>
                  <th style={th}>Font (퐁텐블로)</th>
                  <th style={th}>난이도</th>
                </tr>
              </thead>
              <tbody>
                {BOULDER_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.v}</td>
                    <td style={{ ...td, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.font}</td>
                    <td style={td}>
                      <span style={{ ...bandDot, background: BANDS[r.band].color }} />
                      {BANDS[r.band].label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={tableNote}>
            ※ Font 등급은 구간이 겹쳐 V3 ≈ 6A/6A+처럼 묶어 표기했습니다. 출처에 따라 한 단계 차이날 수 있습니다. (2026년 6월 확인, Wikipedia 등급 비교표 기준)
          </p>
        </div>

        {/* 루트 변환표 (서버 렌더) */}
        <div>
          <h2 style={sectionTitle}>📋 루트(리드) 등급 변환표 — YDS ↔ French ↔ UIAA</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            미국 YDS, 유럽 French(스포츠 표준), 중부 유럽 UIAA의 <strong style={{ color: 'var(--text)' }}>통용 근사 변환</strong>입니다. UIAA는 특히 근사적입니다. (위 변환기와 동일한 데이터)
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>YDS (미국)</th>
                  <th style={th}>French (프렌치)</th>
                  <th style={th}>UIAA</th>
                  <th style={th}>난이도</th>
                </tr>
              </thead>
              <tbody>
                {ROUTE_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.yds}</td>
                    <td style={{ ...td, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.french}</td>
                    <td style={{ ...td, color: '#0891B2', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.uiaa}</td>
                    <td style={td}>
                      <span style={{ ...bandDot, background: BANDS[r.band].color }} />
                      {BANDS[r.band].label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={tableNote}>
            ※ 특히 5.11~5.12(6c~7c) 구간은 출처마다 환산이 반 단계~한 단계씩 다릅니다. 본 표는 통용 환산표 중 하나일 뿐, 절대 기준이 아닙니다. (2026년 6월 확인, Wikipedia·Guide Dolomiti 등급 비교표 교차 참고)
          </p>
        </div>

        {/* 난이도 밴드별 가이드 */}
        <div>
          <h2 style={sectionTitle}>🎯 볼더링 난이도 밴드별 가이드 — 나는 어디쯤?</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            클라이밍 미디어(99Boulders 등)에서 통용되는 분류입니다. 분류 기준은 출처마다 조금씩 다르며, 진도는 개인차가 큽니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #94A3B8' }}>
              <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 700, marginBottom: '8px' }}>입문 · V0~V2 (Font 4~5+)</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li>클라이밍을 막 시작한 단계</li>
                <li>기본 무브·발 쓰기·홀드 잡기 학습</li>
                <li>이 구간에서는 진도가 빠른 편</li>
              </ul>
            </div>
            <div style={{ ...card, borderTop: '3px solid #0EA5E9' }}>
              <p style={{ fontSize: '13px', color: '#0EA5E9', fontWeight: 700, marginBottom: '8px' }}>중급 · V3~V5 (Font 6A~6C+)</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li>어느 정도 꾸준히 다닌 동호인</li>
                <li>근력이 붙고 쉬운 문제는 플래시(첫 시도 완등)</li>
                <li>다양한 무브 레퍼토리가 생기는 시기</li>
              </ul>
            </div>
            <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
              <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>상급 · V6+ (Font 7A~)</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li>수년간 등반한 상위권 동호인 (V6~V8)</li>
                <li>V9~V12는 전문 훈련 영역, 체육관 최상위권</li>
                <li>V13+는 세계 엘리트 — 진도가 크게 느려지는 구간</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 볼더링 vs 루트 */}
        <div>
          <h2 style={sectionTitle}>🧗 볼더링 vs 루트 — 무엇이 다른가요?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #A16207' }}>
              <p style={{ fontSize: '13px', color: '#A16207', fontWeight: 700, marginBottom: '8px' }}>볼더링 (V · Font)</p>
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
