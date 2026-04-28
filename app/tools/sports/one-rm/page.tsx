import Link from 'next/link'
import OneRMClient from './OneRMClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/one-rm',
  title: '1RM 계산기 — 벤치프레스·스쿼트·데드리프트 최대 중량 추정',
  description: '반복 횟수와 중량으로 1RM(최대 근력)을 추정합니다. Epley·Brzycki·Lombardi·O\'Conner 4가지 공식 비교, 강도별 훈련 중량표, 반복수별 예상 중량, 원판 조합 계산.',
  keywords: ['1RM계산기', '벤치프레스1RM', '스쿼트1RM', '데드리프트1RM', '최대중량계산기', '훈련중량계산기', '헬스1RM', '1RM공식'],
})

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
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

export default function OneRMPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏋️ 1RM & 훈련 중량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        반복 수행 가능한 무게로 1RM(1회 최대 중량)을 추정하고, 강도별 훈련 중량·반복수별 예상 중량·원판 조합까지 한 번에 계산하세요.
      </p>

      <OneRMClient />

      {/* 1. 공식 4가지 비교 */}
      <h2 style={sectionTitle}>📐 1RM 추정 공식 4가지 비교</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        1RM은 직접 측정이 어렵고 부상 위험이 크기 때문에, 서브맥시멀 세트(2~10회)의 수행 기록을 바탕으로 추정하는 것이 일반적입니다. 대표적인 4가지 공식은 각기 다른 데이터셋에서 유도되어 결과가 조금씩 다릅니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>공식</th>
              <th style={headCell}>식</th>
              <th style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>Epley (1985)</strong></td>
              <td style={cell}>w × (1 + r/30)</td>
              <td style={cell}>가장 널리 쓰임. 5~10회 범위에서 안정적.</td>
            </tr>
            <tr>
              <td style={cell}><strong>Brzycki (1993)</strong></td>
              <td style={cell}>w × 36 / (37 − r)</td>
              <td style={cell}>저반복(1~5회)에서 정확. 10회 이상에서 과대 추정.</td>
            </tr>
            <tr>
              <td style={cell}><strong>Lombardi (1989)</strong></td>
              <td style={cell}>w × r<sup>0.1</sup></td>
              <td style={cell}>지수형. 고반복 구간에서 보수적 결과.</td>
            </tr>
            <tr>
              <td style={cell}><strong>O&apos;Conner (1989)</strong></td>
              <td style={cell}>w × (1 + r/40)</td>
              <td style={cell}>Epley보다 낮게 나옴. 안전 마진 선호 시.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 <strong style={{ color: 'var(--text)' }}>평균값 사용 권장</strong> — 한 공식만 믿기보다 4가지 평균을 사용하면 오차가 줄어듭니다. 반복 횟수가 <strong>5회 이하</strong>일 때 추정이 가장 정확합니다.
      </p>

      {/* 2. 종목별 체중 대비 수준 기준표 */}
      <h2 style={sectionTitle}>📊 종목별 체중 대비 수준 기준표</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        1RM을 체중으로 나눈 값(bodyweight ratio)은 자신의 수준을 객관적으로 파악하는 지표입니다. 아래 기준은 ExRx·Strength Level 등의 데이터 평균입니다 (성인 남성 기준, 여성은 대략 70%).
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: '14px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>종목</th>
              <th style={headCell}>초보</th>
              <th style={headCell}>중급</th>
              <th style={headCell}>상급</th>
              <th style={headCell}>엘리트</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>🏋️ 벤치프레스</td>
              <td style={cell}>0.5×</td>
              <td style={cell}>1.0×</td>
              <td style={cell}>1.25×</td>
              <td style={cell}>1.5×+</td>
            </tr>
            <tr>
              <td style={cell}>🦵 스쿼트</td>
              <td style={cell}>0.75×</td>
              <td style={cell}>1.25×</td>
              <td style={cell}>1.5×</td>
              <td style={cell}>2.0×+</td>
            </tr>
            <tr>
              <td style={cell}>💀 데드리프트</td>
              <td style={cell}>1.0×</td>
              <td style={cell}>1.5×</td>
              <td style={cell}>2.0×</td>
              <td style={cell}>2.5×+</td>
            </tr>
            <tr>
              <td style={cell}>🏋️ 오버헤드프레스</td>
              <td style={cell}>0.35×</td>
              <td style={cell}>0.65×</td>
              <td style={cell}>0.85×</td>
              <td style={cell}>1.1×+</td>
            </tr>
            <tr>
              <td style={cell}>🔙 바벨로우</td>
              <td style={cell}>0.5×</td>
              <td style={cell}>0.9×</td>
              <td style={cell}>1.15×</td>
              <td style={cell}>1.4×+</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
        예) 체중 70kg 남성이 벤치프레스 1RM 87.5kg이면 1.25× → 상급. 스쿼트 105kg이면 1.5× → 상급.
      </p>

      {/* 3. 훈련 강도 완전 가이드 */}
      <h2 style={sectionTitle}>💪 훈련 강도 완전 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        목표에 따라 1RM 대비 사용 중량과 반복 수를 조절해야 합니다. 근력·근비대·근지구력은 요구 강도가 다르며, 세트 사이 휴식 시간도 달라집니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>강도</th>
              <th style={headCell}>반복</th>
              <th style={headCell}>목표</th>
              <th style={headCell}>휴식</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong style={{ color: '#FF6B6B' }}>95~100%</strong></td>
              <td style={cell}>1~2회</td>
              <td style={cell}>최대 근력 테스트</td>
              <td style={cell}>3~5분</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FF6B6B' }}>90%</strong></td>
              <td style={cell}>3~4회</td>
              <td style={cell}>최대 근력</td>
              <td style={cell}>3~5분</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FFB83E' }}>85%</strong></td>
              <td style={cell}>5~6회</td>
              <td style={cell}>근력·근비대</td>
              <td style={cell}>2~3분</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FFB83E' }}>80%</strong></td>
              <td style={cell}>8회</td>
              <td style={cell}>근비대 (최적)</td>
              <td style={cell}>90초~2분</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#C8FF3E' }}>75%</strong></td>
              <td style={cell}>10회</td>
              <td style={cell}>근비대</td>
              <td style={cell}>90초</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>70%</strong></td>
              <td style={cell}>12회</td>
              <td style={cell}>근비대·지구력</td>
              <td style={cell}>60~90초</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>65%</strong></td>
              <td style={cell}>15회</td>
              <td style={cell}>근지구력</td>
              <td style={cell}>60초</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>60%</strong></td>
              <td style={cell}>15회+</td>
              <td style={cell}>워밍업·회복</td>
              <td style={cell}>30~60초</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. 원판 조합 빠른 참조표 */}
      <h2 style={sectionTitle}>⚖️ 원판 조합 빠른 참조표</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        20kg 올림픽 바벨 기준, 양쪽에 끼울 원판 조합입니다. 실제 헬스장에서 자주 쓰이는 중량만 정리했어요.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>총 중량</th>
              <th style={headCell}>한쪽 원판</th>
              <th style={headCell}>총 중량</th>
              <th style={headCell}>한쪽 원판</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>40kg</strong></td>
              <td style={cell}>10</td>
              <td style={cell}><strong>100kg</strong></td>
              <td style={cell}>20 + 20</td>
            </tr>
            <tr>
              <td style={cell}><strong>50kg</strong></td>
              <td style={cell}>15</td>
              <td style={cell}><strong>110kg</strong></td>
              <td style={cell}>20 + 20 + 5</td>
            </tr>
            <tr>
              <td style={cell}><strong>60kg</strong></td>
              <td style={cell}>20</td>
              <td style={cell}><strong>120kg</strong></td>
              <td style={cell}>20 + 20 + 10</td>
            </tr>
            <tr>
              <td style={cell}><strong>70kg</strong></td>
              <td style={cell}>20 + 5</td>
              <td style={cell}><strong>140kg</strong></td>
              <td style={cell}>20 × 3</td>
            </tr>
            <tr>
              <td style={cell}><strong>80kg</strong></td>
              <td style={cell}>20 + 10</td>
              <td style={cell}><strong>160kg</strong></td>
              <td style={cell}>25 + 20 + 15</td>
            </tr>
            <tr>
              <td style={cell}><strong>90kg</strong></td>
              <td style={cell}>20 + 15</td>
              <td style={cell}><strong>180kg</strong></td>
              <td style={cell}>25 × 2 + 20 + 10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 원판은 항상 <strong style={{ color: 'var(--text)' }}>무거운 것부터 안쪽</strong>에 끼우고, 양쪽 무게를 대칭으로 맞추세요. 2.5kg·1.25kg 소형 원판을 활용하면 2.5kg 단위 점진적 과부하가 가능합니다.
      </p>

      {/* 5. FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Q. 1RM 직접 측정해야 하나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          초·중급자는 <strong style={{ color: 'var(--text)' }}>추정치 사용을 권장</strong>합니다. 실제 1RM 시도는 부상 위험이 크고, 숙련된 스포터·올바른 폼이 필요합니다. 5회 수행 가능한 무게로 추정해도 오차는 2~5% 수준입니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Q. 반복 수는 몇 회가 가장 정확한가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>3~6회 범위</strong>가 가장 정확합니다. 1~2회는 일시적 컨디션 영향이 크고, 10회 이상은 근지구력이 변수로 작용해 추정 오차가 커집니다. RPE 9~10 수준(AMRAP)으로 수행해야 정확합니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Q. 여성도 같은 공식을 써도 되나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          공식 자체는 성별과 무관하게 적용됩니다. 체중 대비 기준표만 여성 기준으로 환산해서 보세요(대략 <strong style={{ color: 'var(--text)' }}>남성 기준의 70%</strong>). 예: 벤치 중급 여성 ≈ 0.7×, 스쿼트 중급 여성 ≈ 0.9×.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Q. 컨디션에 따라 왜 이렇게 차이가 나죠?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          1RM은 <strong style={{ color: 'var(--text)' }}>수면·영양·스트레스·카페인</strong>에 민감하게 반응합니다. 10~15% 일일 편차는 정상이며, 주간 평균을 보는 것이 더 정확합니다. 디로드 주간 뒤에는 일시적으로 5~10% 떨어질 수 있어요.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Q. 1RM을 얼마나 자주 갱신해야 하나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          초보자는 <strong style={{ color: 'var(--text)' }}>4~6주</strong>, 중급 이상은 <strong style={{ color: 'var(--text)' }}>8~12주</strong>마다 재측정이 적절합니다. 프로그램 전환·디로드 후가 좋은 타이밍입니다. 매주 갱신은 오히려 변동성 노이즈에 흔들려 장기 추세를 놓치기 쉬워요.
        </p>
      </div>

      {/* 6. 안전 주의사항 */}
      <h2 style={sectionTitle}>⚠️ 안전 주의사항</h2>
      <div style={{
        background: 'rgba(255, 107, 107, 0.06)',
        border: '1px solid rgba(255, 107, 107, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li><strong style={{ color: '#FF8C8C' }}>워밍업 필수</strong> — 점진적으로 중량을 올려 5~6세트 워밍업 후 본 세트 진입.</li>
          <li><strong style={{ color: '#FF8C8C' }}>스쿼트·벤치는 스포터·세이프티 필수</strong> — 90% 이상 시도 시 혼자 하지 마세요.</li>
          <li><strong style={{ color: '#FF8C8C' }}>폼 붕괴 = 실패</strong> — 반복수보다 동작의 일관성이 중요합니다. 폼이 무너진 반복은 카운트에서 제외하세요.</li>
          <li><strong style={{ color: '#FF8C8C' }}>통증은 즉시 중단</strong> — 관절·허리 통증은 부상 신호입니다. 운동 후 지속되면 전문의 상담.</li>
          <li><strong style={{ color: '#FF8C8C' }}>초보자는 고반복 권장</strong> — 운동 경력 6개월 미만은 1RM 추정보다 8~12회 폼 익히기가 우선입니다.</li>
        </ul>
      </div>

      {/* 7. 관련 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체질량지수 비만도 확인</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>하루 권장 칼로리 계산</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>칼로리 적자로 달성일 예측</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>마라톤 목표 기록별 페이스</div>
        </Link>
      </div>
    </div>
  )
}
