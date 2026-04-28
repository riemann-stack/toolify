import Link from 'next/link'
import FermiEstimateClient from './FermiEstimateClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/fermi-estimate',
  title: '페르미 추정 계산기 — 변수 분해·시나리오 비교 사고력 훈련',
  description: '정확한 데이터가 없어도 변수로 쪼개고 낮음·기준·높음 시나리오로 대략적인 답을 추정합니다. 서울 커피 판매량·시장 규모(TAM)·전국 일회용 컵 등 15개 템플릿 + 자유 추정 + 민감도 분석.',
  keywords: ['페르미추정', '페르미문제', '어림값계산', '논리적사고', '시장규모추정', 'TAM SAM SOM', '면접대비', '컨설팅사고법', '비즈니스분석', 'fermi estimation'],
})

export default function FermiEstimatePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧮 페르미 추정 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        정확한 데이터가 없어도 <strong style={{ color: 'var(--text)' }}>변수로 쪼개고 시나리오를 비교해 대략의 자릿수</strong>를 추정합니다.
        15개 템플릿(서울 커피 판매량, 피아노 조율사, 시장 규모 TAM 등) + 자유 추정 + 민감도 분석 + localStorage 라이브러리.
        <strong style={{ color: '#3EC8FF' }}> 정답이 아닌 사고 과정</strong>을 가치 있게 만드는 도구입니다.
      </p>

      <FermiEstimateClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 페르미 추정이란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페르미 추정이란?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            <strong style={{ color: 'var(--text)' }}>페르미 추정(Fermi Estimation)</strong>은 노벨 물리학상 수상자
            <strong style={{ color: 'var(--text)' }}> 엔리코 페르미</strong>가 사용한 대략적 추정 사고법입니다.
            정확한 데이터 없이도 합리적 추정이 가능하다는 것을 보여줍니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🧩 큰 문제를 작은 변수로', d: '분해할 수 없는 문제는 없다 — 4~7개의 합리적 변수로 쪼개기' },
              { t: '🎯 합리적 가정', d: '인구·비율·빈도·평균 — 신뢰할 수 있는 통계 활용' },
              { t: '✖️ 곱셈으로 결합', d: '각 변수를 곱하면 자릿수(order of magnitude) 정확도' },
              { t: '🔍 가치는 사고 과정', d: '정답이 아닌 논리 분해 자체가 비즈니스·면접·연구의 핵심' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFFD0', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(155,89,182,0.06)',
            border: '1px solid rgba(155,89,182,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🎼 <strong style={{ color: '#C485E0' }}>가장 유명한 문제:</strong> &quot;시카고에 피아노 조율사는 몇 명일까?&quot;
            <br />→ 인구 → 가구 → 피아노 보유 비율 → 조율 빈도 → 조율사 작업량
            <br />→ <strong>약 100~200명</strong> (실제 약 150명) — 페르미가 학생들에게 던진 고전 문제.
          </div>
        </div>

        {/* ── 2. 4단계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페르미 추정 4단계
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { n: 'STEP 1', t: '문제 정의',  d: '"무엇을 추정하고 싶은가?" 명확하고 측정 가능한 단위로' },
              { n: 'STEP 2', t: '변수 분해',  d: '큰 문제를 4~7개 변수로 쪼개기 (각 변수 독립적이도록)' },
              { n: 'STEP 3', t: '가정 입력',  d: '인구·비율·빈도·평균 — 신뢰할 수 있는 자료 활용' },
              { n: 'STEP 4', t: '곱셈·검증',  d: '변수값 곱하기 → 시나리오 비교 → 실제 데이터와 비교' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '4px solid #3EFFD0', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, color: '#3EFFD0', fontWeight: 800, letterSpacing: '0.04em', marginBottom: 4 }}>{g.n}</p>
                <p style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 활용 분야 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페르미 추정의 활용 분야
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '💼 비즈니스·창업', items: ['신사업 시장 규모 (TAM·SAM·SOM)', '매출·고객 수 예측', '광고·마케팅 효과 추정'], c: '#FFD700' },
              { t: '🎓 교육·면접',     items: ['컨설팅 면접 (맥킨지·BCG·베인)', 'MBA 케이스 스터디', '논리적 사고 훈련'], c: '#9B59B6' },
              { t: '📊 정책·연구',     items: ['환경 영향 평가', '인구 통계 추정', '자원 사용량 예측'], c: '#3EFF9B' },
              { t: '🌍 일상 호기심',   items: ['"지구 모래알 수"', '"평생 먹는 밥의 양"', '"한국 전체 자판기 수"'], c: 'var(--accent)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 시나리오 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시나리오 비교의 가치
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            페르미 추정의 핵심은 <strong style={{ color: 'var(--text)' }}>단일 답이 아닌 범위</strong>입니다.
            세 가지 시나리오를 비교하면 추정의 불확실성과 가장 민감한 변수를 파악할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { l: '🟦 보수적', d: '낮은 가정', c: '#3EC8FF' },
              { l: '🟢 기준',  d: '평균 가정', c: 'var(--accent)' },
              { l: '🟡 낙관적', d: '높은 가정', c: '#FFD700' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4 }}>{g.l}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 18px',
            marginTop: 12,
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.85,
          }}>
            <strong style={{ color: 'var(--text)' }}>예: &quot;서울 커피 판매량&quot;</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>보수적: <strong style={{ color: '#3EC8FF' }}>94만 잔</strong></li>
              <li>기준: <strong style={{ color: 'var(--accent)' }}>169만 잔</strong></li>
              <li>낙관적: <strong style={{ color: '#FFD700' }}>263만 잔</strong></li>
            </ul>
            → 진짜 답은 이 범위 안에 있을 가능성이 높습니다.
          </div>
        </div>

        {/* ── 5. 한국 통계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 쓰는 한국 통계 (페르미 추정용)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '👥 인구', items: ['한국 인구: 약 5,100만 명', '서울 인구: 약 940만 명', '한국 가구 수: 약 2,100만 가구', '25-40세 직장인: 약 1,500만 명'] },
              { t: '💰 소득·소비', items: ['1인당 GDP: 약 3,400만원/년', '가구 평균 소득: 약 6,500만원/년', '외식 비용: 가구당 월 50만원'] },
              { t: '🏢 기업·시장', items: ['한국 사업체: 약 600만 개', '중소기업: 약 700만 개', '카페: 약 9만 개', '편의점: 약 5만 개'] },
              { t: '🚗 교통·환경', items: ['자동차 등록: 약 2,500만 대', '전기차: 약 60만 대 (2024)', '1인 일일 음식물 쓰레기: 약 0.3kg'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 위 통계는 2024년 기준 추정치이며, 정확한 값은 통계청·관련 기관 확인이 필요합니다.
          </p>
        </div>

        {/* ── 6. 컨설팅 면접 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            컨설팅 면접에서의 페르미 추정
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>주요 컨설팅 회사 면접 빈출 문제:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6, color: 'var(--muted)' }}>
              <li>&quot;한국에 자동차 정비소는 몇 개 있을까?&quot;</li>
              <li>&quot;스타벅스 강남점의 일일 매출은?&quot;</li>
              <li>&quot;한국에서 1년에 팔리는 우산은 몇 개?&quot;</li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(255,215,0,0.05)',
            border: '1px solid rgba(255,215,0,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⭐ <strong style={{ color: '#FFD700' }}>답변 평가 기준:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6, color: 'var(--muted)' }}>
              <li>① 논리 구조 (변수 분해의 합리성)</li>
              <li>② 가정의 타당성 (출처·근거)</li>
              <li>③ 계산 정확성</li>
              <li>④ 결과 검증·해석</li>
              <li>⑤ 의사소통 (명확한 설명)</li>
            </ul>
            <p style={{ marginTop: 8, fontSize: 12.5, color: '#FFD700', fontWeight: 700 }}>
              ※ 정확한 답이 중요하지 않음 — <strong>사고 과정</strong>을 평가받음
            </p>
          </div>
        </div>

        {/* ── 7. TAM·SAM·SOM ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            TAM·SAM·SOM 분석 (시장 규모)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            비즈니스에서 페르미 추정의 표준 형식. 신사업·창업 단계에서 시장 규모 추정에 필수입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'TAM', n: 'Total Addressable Market', d: '전체 시장 규모. "이 제품이 모든 사람에게 팔린다면?" 가장 큰 추정값.', c: '#FFD700' },
              { t: 'SAM', n: 'Serviceable Available Market', d: '실제 도달 가능한 시장. "내 회사가 서비스 가능한 범위?" TAM의 일부.', c: '#FF8C3E' },
              { t: 'SOM', n: 'Serviceable Obtainable Market', d: '실제 점유 가능한 시장. "현실적으로 얼마를 가져올 수 있나?" SAM의 일부.', c: '#FF6B6B' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: g.c, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontStyle: 'italic' }}>{g.n}</p>
                <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            marginTop: 12,
          }}>
            <div><span style={{ color: '#FFD700' }}>TAM</span> = 인구 × 1인당 소비</div>
            <div><span style={{ color: '#FF8C3E' }}>SAM</span> = TAM × 도달 비율</div>
            <div><span style={{ color: '#FF6B6B' }}>SOM</span> = SAM × 점유 비율</div>
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '페르미 추정의 정확도는 어느 정도인가요?',
                a: '페르미 추정은 정확한 답을 구하는 것이 목적이 아닙니다. 일반적으로 <strong>실제 값의 1/3~3배 범위</strong>에 들어가면 좋은 추정으로 평가합니다. 예를 들어 실제 값이 100이면 33~300 사이의 추정도 합리적이라고 봅니다. 이는 "자릿수의 정확성(order of magnitude)"으로 표현되며, 페르미 추정의 핵심 가치는 <strong>정확성이 아닌 사고 과정과 의사결정 도움</strong>입니다.',
              },
              {
                q: '페르미 추정에서 가장 중요한 변수는 어떻게 찾나요?',
                a: '<strong>민감도 분석</strong>을 통해 찾을 수 있습니다. 각 변수를 동일한 비율(예: +20%)로 변경했을 때 결과가 가장 크게 변하는 변수가 가장 민감한 변수입니다. 본 도구의 <strong>시나리오 비교 탭</strong>에서 자동으로 민감도 그래프를 표시합니다. 가장 민감한 변수일수록 추정 정확도에 큰 영향을 주므로, 해당 변수에 대해서는 더 정확한 데이터를 찾는 것이 좋습니다.',
              },
              {
                q: '페르미 추정으로 시장 규모를 정말 추정할 수 있나요?',
                a: '네, 비즈니스 분석에서 매우 자주 사용되는 방법입니다. 특히 신사업·창업 단계에서 정확한 시장 데이터가 없을 때 <strong>페르미 추정으로 TAM·SAM·SOM을 계산하는 것이 표준</strong>입니다. 다만 의사결정에는 다음을 함께 활용하세요: ① 실제 시장 조사(설문·인터뷰), ② 산업 보고서(KISDI, 한국정보화진흥원 등), ③ 경쟁사 분석. 페르미 추정은 빠른 초기 추정에 적합하며, 구체적 사업 결정에는 정밀 데이터가 필요합니다.',
              },
              {
                q: '변수가 너무 많으면 추정이 더 정확해지나요?',
                a: '<strong>아닙니다. 변수가 많을수록 오히려 부정확해질 수 있습니다.</strong> 각 변수에 작은 오차가 곱해지면서 누적되기 때문입니다. 페르미 추정의 권장 변수 개수는 <strong>4~7개</strong>입니다. 너무 적으면(1~2개) 단순한 곱셈에 불과하고, 너무 많으면(8개+) 오차가 누적됩니다. 적절한 4~5개 변수로 핵심을 분해하는 것이 가장 효과적입니다. 본 도구의 템플릿은 모두 4~5개 변수 구조로 설계되어 있습니다.',
              },
              {
                q: '추정 결과를 어떻게 검증하나요?',
                a: '다음 방법으로 검증할 수 있습니다: ① <strong>다른 방식으로 다시 추정</strong>(Top-down vs Bottom-up — 시장 규모를 인구로 추정 vs 매출로 추정), ② <strong>실제 데이터와 비교</strong>(통계청·산업협회 보고서), ③ <strong>시나리오 비교</strong>(보수적·기준·낙관적이 합리적 범위인지), ④ <strong>동료·전문가 의견</strong>(다른 사람도 비슷한 추정을 하는지). 페르미 추정은 항상 검증과 함께해야 정확한 의사결정에 활용 가능합니다.',
              },
            ].map((f, i) => (
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
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 시각화',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/review-interval',   icon: '🧠', name: '복습 간격 계산기',       desc: '망각곡선·SM-2 학습 일정' },
              { href: '/tools/edu/cognitive-test',    icon: '🧠', name: '인지 능력 테스트',       desc: '반응속도·스트룹·이중 과제' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 시뮬레이터',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',     desc: '추가 교육 도구 더보기' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 10. 학습 자료 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            추천 학습 자료
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 2 }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li><em>&quot;How to Solve It&quot;</em> — George Pólya (사고법 고전)</li>
              <li><em>&quot;Thinking in Bets&quot;</em> — Annie Duke (불확실성 하의 의사결정)</li>
              <li><em>&quot;Range&quot;</em> — David Epstein (다재다능 사고)</li>
              <li>컨설팅 면접 케이스: <em>Vault Guide to Consulting Case Interviews</em></li>
              <li>&quot;Case in Point&quot; (Marc Cosentino) — 컨설팅 케이스 방법론 표준</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
