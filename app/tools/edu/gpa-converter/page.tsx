import Link from 'next/link'
import GpaConverterClient from './GpaConverterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/edu/gpa-converter',
  title: '학점(GPA) 환산기 — 한국 4.5·4.3 ↔ 미국 4.0 ↔ 영국 등급',
  description:
    '한국 대학 학점을 미국 4.0 GPA·영국 학위 등급(1st·2:1·2:2)·평어로 동시 환산. WES·비례·평어 3가지 방식 비교 + 한국 대학별 만점 가이드.',
  keywords: [
    '학점 환산', 'GPA 환산', 'GPA 변환', '4.5 4.0 환산', '4.3 4.0 환산',
    'WES GPA', 'WES 환산', '미국 GPA', '영국 GPA', 'UK honours',
    '서울대 학점', 'KAIST 학점', '연세대 학점', '고려대 학점',
    '유학 GPA', '대학원 GPA', 'MBA GPA', '교환학생 학점',
    '백분율 GPA', '평어 환산', 'A+ GPA', '평균 평점',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
              {
                q: '한국 4.5만점 4.0점은 미국 GPA로 얼마인가요?',
                a: '환산 방식에 따라 다릅니다. <strong>비례 환산</strong>: 4.0 / 4.5 × 4.0 = 약 <strong>3.56</strong>. <strong>WES 기준</strong>(가장 보수적, 미국 대학원 다수 채택): 4.0점은 백분율 약 89%에 해당해 <strong>A- ≈ 3.70</strong>. <strong>한국 평어 기준</strong>도 비슷하게 3.70 내외. 본인 도구의 비교 그리드에서 세 가지 결과를 한 번에 확인할 수 있습니다.',
              },
              {
                q: '서울대·KAIST는 4.3 만점인데, 다른 학교 4.5와 어떻게 비교하나요?',
                a: '단순히 만점만 비교하면 안 됩니다. 4.3만점에서는 A0가 4.0(만점은 A+의 4.3)이고, 4.5만점에서는 A0가 4.0(만점은 A+의 4.5)으로 <strong>A0 위치가 같습니다</strong>. 즉 4.3만점 학교의 학생이 불리한 것이 아니라, A+를 받기가 더 어렵게 설계되어 있을 뿐입니다. 영문 성적증명서에는 보통 만점이 명시되어 있으니 평가 기관도 이를 고려합니다.',
              },
              {
                q: 'WES 환산이 왜 가장 보수적인가요?',
                a: 'WES는 미국 대학원에 제출되는 외국 성적을 표준화하는 공인 기관으로, 학점 인플레이션을 방지하기 위해 보수적인 기준을 채택합니다. 한국 4.5만점 4.0점이 비례로는 3.56이지만 WES는 백분율(약 89%) 기반으로 3.70까지 인정합니다. 일부 항목에서는 비례보다 더 후한 경우도 있고, A+(95%↑)와 A(90~94%)를 둘 다 4.00으로 동일 처리해 만점 가까이의 차이를 무화하는 특징이 있습니다.',
              },
              {
                q: '미국 대학원 지원 시 평균 GPA 컷오프는?',
                a: '학교·전공·국적별로 다르지만 일반적으로 <strong>최저 3.0 (B 평균)</strong>이 권고선이고, Top 30 대학원은 <strong>3.5 이상</strong>이 안정권입니다. STEM 분야 Top 10은 4.0에 가까운 학생도 많아 GPA만으로 부족하고 추천서·논문·연구 경력이 더 중요. 본인 GPA가 컷오프 근처라면 다른 지원자와 차별화할 요소를 강화하는 게 우선입니다.',
              },
              {
                q: '영국 대학원 입학에 필요한 한국 학점은?',
                a: '학교·전공에 따라 다르지만, <strong>2:1 (Upper Second, 60%↑)</strong>이 대부분 영국 대학원의 입학 기본선입니다. 한국 4.5만점 기준 약 <strong>3.0 이상</strong>, 4.3만점 기준 약 <strong>2.8 이상</strong>이면 2:1 동등으로 봅니다. <strong>First Class (70%↑)</strong>는 4.5만점 약 3.5 / 4.3만점 약 3.3 이상이며, Oxbridge·LSE·UCL 등 상위 학교는 보통 First Class 동등을 요구합니다.',
              },
              {
                q: '교환학생 학점은 어떻게 인정되나요?',
                a: '교환학생 기간 동안 받은 외국 학교 성적은 <strong>한국 본교의 환산 기준</strong>으로 변환되어 본교 성적표에 기록됩니다. 다만 대부분의 한국 대학은 교환학생 성적을 <strong>"이수/미이수(P/F)"로만 표기</strong>하거나 별도 표기 없이 학점만 인정합니다 — 평점에 포함하지 않는 경우가 많아 GPA 보호 효과가 있습니다. 본교 교무처에 미리 확인하세요.',
            },
            {
              q: '재수강한 과목은 환산에 어떻게 반영되나요?',
              a: '한국에서는 재수강 시 <strong>높은 점수만 성적표에 표기</strong>되는 경우가 많아 GPA에 유리합니다. 그러나 WES·평가 기관은 <strong>모든 과목 시도를 합산</strong>해 평균을 내기도 하므로, 재수강 이력이 많을수록 외부 환산 GPA가 본교 GPA보다 낮게 나올 수 있습니다. 영문 성적표 발급 시 재수강 처리 방식을 학교에 문의하세요.',
            },
            {
              q: 'A+를 받아도 GPA가 4.0으로 캡되는 학교가 있다는데?',
              a: '미국 대부분 대학은 A+를 별도 인정하지 않고 A와 동일하게 <strong>4.00</strong>으로 처리합니다(MIT·하버드 등). 일부 학교(예: 일부 주립대)는 A+를 4.33으로 인정해 GPA가 4.0을 초과할 수 있고, 한국 4.3·4.5만점도 마찬가지로 A+에 추가 가중치를 줍니다. WES는 4.0을 상한으로 캡하므로 외부 환산 시 차이가 발생할 수 있습니다.',
            },
            ]

export default function GpaConverterPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>교육·학습</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎓 학점(GPA) 환산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        한국 4.5·4.3 ↔ 미국 4.0 ↔ 영국 학위 등급. <strong style={{ color: 'var(--text)' }}>WES·비례·평어 3방식</strong> 동시 비교 + 한국 대학별 만점.
      </p>

      <GpaConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 한국 vs 미국 vs 영국 */}
        <section>
          <h2 style={sectionTitle}>한국 ↔ 미국 ↔ 영국 학점 체계 비교</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            국가마다 학점·등급 표기가 달라 단순 비례 환산만으로는 부정확할 수 있습니다. 주요 3개 체계의 차이는 다음과 같습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['국가', '주요 만점', '평어', '특징'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🇰🇷 한국', '4.5 / 4.3 / 5.0', 'A+ ~ F (A0·B0 포함)', '학교별 만점이 다름, A+가 최고'],
                  ['🇺🇸 미국', '4.0 (4.3·4.33 일부)', 'A+ ~ F', 'A+ 도 4.0으로 캡(대부분), 학교마다 평점 가중치 다름'],
                  ['🇬🇧 영국', '백분율 (0~100)', 'First / 2:1 / 2:2 / 3rd', '학사 학위 등급 — 70%↑ = First'],
                  ['🇨🇦 캐나다', '4.0 / 4.3 / 9.0 (퀘벡)', 'A+ ~ F', '미국과 유사, 일부 4.3 사용'],
                  ['🇦🇺 호주', '7.0 (HD/D/C/P)', 'HD/D/C/P', 'High Distinction = 7.0 (85%↑)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 3가지 환산 방식 */}
        <section>
          <h2 style={sectionTitle}>3가지 환산 방식 — 언제 어떤 걸 써야 하나</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: '🏛️ WES 기준 (가장 보수적)',
                d: '미국 대학원 다수가 채택하는 World Education Services 표준. 한국 4.5만점 4.0점도 미국 3.30~3.70 정도로 보수적으로 평가. 백분율 브래킷 기반.',
                use: '미국 대학원 GRAD 지원, 미국 취업 학력 평가 시 권장',
                c: '#0891B2',
              },
              {
                t: '📏 비례 환산 (가장 관대)',
                d: '단순 비율: US GPA = (한국 GPA / 만점) × 4.0. 가장 관대해서 일부 학교 자체 환산이나 자기소개서용으로 사용. WES보다 0.2~0.5 높게 나오는 경향.',
                use: '본인 성적 상한선 추정, 학교 자체 환산 비교 용도',
                c: '#059669',
              },
              {
                t: '📝 평어 기준 (한국 성적표 직역)',
                d: '한국 성적표의 평어(A+/A0/A-/B+ …)를 미국 4.0 스케일로 평어별 매핑. 한국 대학 자체 환산이나 영문 성적표 발급 시 학교가 쓰는 방식과 가까움.',
                use: '교환학생 지원, 한국 대학 영문 성적증명서 발급 시',
                c: '#D97706',
              },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${m.c}`, borderRadius: 10, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: m.c, fontWeight: 700, margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75, margin: '0 0 6px' }}>{m.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>활용:</strong> {m.use}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>대원칙</strong>: 미국 대학원·취업은 WES 기준에 맞춰 준비하되, 학교 공식 환산이 제공되면 그걸 최우선으로 따르세요.
          </p>
        </section>

        {/* 3. 영국 학위 등급 */}
        <section>
          <h2 style={sectionTitle}>영국 학위 등급 (Honours classification)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            영국 학사 학위는 백분율 기반으로 4단계 등급이 매겨집니다. 영국 대학원 지원 시 본인의 한국 학점이 어느 등급에 해당하는지 미리 알아두면 유리합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            {[
              { abbr: '1st', name: 'First Class', cut: '70%↑', meaning: '최상위 — 박사·MBA 직행 가능', c: '#059669' },
              { abbr: '2:1', name: 'Upper Second', cut: '60-69%', meaning: '대학원 입학 기본선', c: '#0891B2' },
              { abbr: '2:2', name: 'Lower Second', cut: '50-59%', meaning: '취업 가능, 일부 대학원 OK', c: '#D97706' },
              { abbr: '3rd', name: 'Third Class', cut: '40-49%', meaning: '학사 학위는 인정', c: '#EA580C' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 22, color: g.c, fontWeight: 800, margin: '0 0 4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', letterSpacing: '-0.5px' }}>{g.abbr}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.name}</p>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, margin: '0 0 6px' }}>{g.cut}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
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
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/edu/review-interval',  icon: '🧠', name: '복습 간격 계산기',     desc: '에빙하우스·SM-2 다음 복습일' },
              { href: '/tools/edu/cognitive-test',   icon: '🧠', name: '인지 능력 테스트',     desc: '반응속도·집중력 측정' },
              { href: '/tools/edu/fermi-estimate',   icon: '🧮', name: '페르미 추정 계산기',   desc: '면접 추정 문제 사고력 훈련' },
              { href: '/tools/life/travel-budget',   icon: '✈️', name: '여행 예산 계산기',     desc: '유학·교환 생활비 시뮬' },
              { href: '/tools/finance/compound',     icon: '📈', name: '복리 계산기',           desc: '유학 자금 모으기 시뮬' },
              { href: '/tools/finance/savings',      icon: '💰', name: '저축액 계산기',         desc: '월 저축으로 학자금 만들기' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
