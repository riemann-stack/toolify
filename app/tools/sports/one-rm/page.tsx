import Link from 'next/link'
import OneRMClient from './OneRMClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/one-rm',
  title: '1RM 계산기 — 벤치·스쿼트·데드 최대 중량 + 워밍업 자동 + 성·연령 보정',
  description: '12종 1RM 공식(Epley·Brzycki·Lombardi·O\'Conner)으로 진짜 최대 무게 추정 + RPE 보정·성·연령 수준·워밍업 5세트 자동·진행 그래프.',
  keywords: ['1RM계산기', '벤치프레스1RM', '스쿼트1RM', '데드리프트1RM', '워밍업계산기', 'RPE계산기', '훈련중량계산기', '헬스1RM', '1RM공식', '체중대비1RM'],
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

export default function OneRMPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏋️ 1RM &amp; 훈련 중량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        5RM·8RM 기록으로 <strong style={{ color: 'var(--text)' }}>진짜 최대 무게</strong> 추정 + RPE 보정과 워밍업 5세트 자동.
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

      {/* 2. RPE 보정 가이드 (NEW) */}
      <h2 style={sectionTitle}>🎯 RPE / RIR — 체감 강도 보정의 원리</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        모든 1RM 공식은 <strong style={{ color: 'var(--text)' }}>&ldquo;마지막 한 번도 더 못 드는 상태(AMRAP)&rdquo;</strong>를 가정합니다. 하지만 실제 훈련에서는 1~3회 여유를 두고 끝내는 경우가 많죠. 그대로 공식에 넣으면 1RM이 과소 추정됩니다. <strong style={{ color: 'var(--text)' }}>RPE/RIR 보정</strong>은 이 차이를 메워줍니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>RPE</th>
              <th style={headCell}>RIR (남은 횟수)</th>
              <th style={headCell}>체감</th>
              <th style={headCell}>본 도구 보정</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong style={{ color: '#FF6B6B' }}>10</strong></td>
              <td style={cell}>0회 (AMRAP)</td>
              <td style={cell}>한 번도 더 불가능</td>
              <td style={cell}>보정 없음 (기준)</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FFB83E' }}>9</strong></td>
              <td style={cell}>1회</td>
              <td style={cell}>한 번 더 가능했음</td>
              <td style={cell}>+1회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#FFB83E' }}>8</strong></td>
              <td style={cell}>2~3회</td>
              <td style={cell}>2~3회 여유</td>
              <td style={cell}>+2회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>7</strong></td>
              <td style={cell}>3~4회</td>
              <td style={cell}>꽤 가벼움</td>
              <td style={cell}>+3회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>6</strong></td>
              <td style={cell}>5회+</td>
              <td style={cell}>워밍업 수준</td>
              <td style={cell}>+4회 (참고용)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        예) 80kg × 5회 RPE 8로 끝났다면 → 실제로는 7회 가능했다고 보고 80kg × 7회로 1RM 추정. 반복 입력만 보정하므로 어떤 공식과도 호환됩니다.
      </p>

      {/* 3. 성별·연령 보정 (NEW) */}
      <h2 style={sectionTitle}>👥 성별·연령별 수준 보정 — 같은 무게라도 평가가 달라집니다</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        상대적 근력은 절대 무게가 아니라 <strong style={{ color: 'var(--text)' }}>체중·성별·연령에 대한 비율</strong>로 봐야 정확합니다. 본 도구는 20대 남성 기준의 ExRx·Strength Level 데이터에 다음 보정을 적용합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>구분</th>
              <th style={headCell}>20대</th>
              <th style={headCell}>30대</th>
              <th style={headCell}>40대</th>
              <th style={headCell}>50대</th>
              <th style={headCell}>60대+</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>남성 보정</strong></td>
              <td style={cell}>1.00×</td>
              <td style={cell}>0.95×</td>
              <td style={cell}>0.85×</td>
              <td style={cell}>0.75×</td>
              <td style={cell}>0.65×</td>
            </tr>
            <tr>
              <td style={cell}><strong>여성 보정</strong></td>
              <td style={cell}>0.70×</td>
              <td style={cell}>0.665×</td>
              <td style={cell}>0.595×</td>
              <td style={cell}>0.525×</td>
              <td style={cell}>0.455×</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        예) 50대 여성이 벤치프레스 체중의 0.7배를 들면 → <strong style={{ color: 'var(--text)' }}>중급</strong> 평가 (남성 20대 기준의 1.0×에 해당). 같은 무게라도 연령·성별에 따라 평가가 한 단계씩 올라갈 수 있습니다.
      </p>

      {/* 4. 워밍업 5세트 — 부상 예방의 핵심 (NEW) */}
      <h2 style={sectionTitle}>🔥 워밍업 5세트 — 부상 예방의 핵심</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        본 세트 강도가 80% 이상이면 <strong style={{ color: 'var(--text)' }}>최소 5세트의 점진적 워밍업</strong>이 필요합니다. 갑자기 무거운 무게를 들면 관절·인대가 적응할 시간이 없어 부상 위험이 급증합니다. 본 도구의 &ldquo;훈련 중량&rdquo; 탭에서 본 세트 강도(%1RM)를 선택하면 자동으로 워밍업 세트가 생성됩니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>세트</th>
              <th style={headCell}>강도</th>
              <th style={headCell}>반복</th>
              <th style={headCell}>휴식</th>
              <th style={headCell}>목적</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>1</td>
              <td style={cell}>빈 봉 (20kg)</td>
              <td style={cell}>10회</td>
              <td style={cell}>60초</td>
              <td style={cell}>폼 워밍업·근육 활성화</td>
            </tr>
            <tr>
              <td style={cell}>2</td>
              <td style={cell}>40%</td>
              <td style={cell}>8회</td>
              <td style={cell}>60초</td>
              <td style={cell}>혈류·관절액 순환</td>
            </tr>
            <tr>
              <td style={cell}>3</td>
              <td style={cell}>60%</td>
              <td style={cell}>5회</td>
              <td style={cell}>90초</td>
              <td style={cell}>중추신경 활성화</td>
            </tr>
            <tr>
              <td style={cell}>4</td>
              <td style={cell}>70%</td>
              <td style={cell}>3회</td>
              <td style={cell}>2분</td>
              <td style={cell}>본 세트 직전 적응</td>
            </tr>
            <tr>
              <td style={cell}>5</td>
              <td style={cell}>80%</td>
              <td style={cell}>1회</td>
              <td style={cell}>3분</td>
              <td style={cell}>예열 싱글 (95%+ 도전 시 90% 추가)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 세트 60% 미만은 워밍업 2~3세트로 충분, <strong style={{ color: 'var(--text)' }}>95%+ 도전</strong>은 90% 예열 싱글을 추가해 6세트로 늘립니다.
      </p>

      {/* 5. 종목별 체중 대비 수준 기준표 (확장) */}
      <h2 style={sectionTitle}>📊 12종 운동 체중 대비 수준 기준표</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        20대 남성 기준입니다. 도구 내에서 성별·연령을 선택하면 자동 보정된 값으로 평가됩니다.
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
            <tr><td style={cell}>🏋️ 벤치프레스</td><td style={cell}>0.5×</td><td style={cell}>1.0×</td><td style={cell}>1.25×</td><td style={cell}>1.5×+</td></tr>
            <tr><td style={cell}>📐 인클라인 벤치</td><td style={cell}>0.4×</td><td style={cell}>0.85×</td><td style={cell}>1.05×</td><td style={cell}>1.3×+</td></tr>
            <tr><td style={cell}>🦵 스쿼트</td><td style={cell}>0.75×</td><td style={cell}>1.25×</td><td style={cell}>1.5×</td><td style={cell}>2.0×+</td></tr>
            <tr><td style={cell}>🤸 프론트 스쿼트</td><td style={cell}>0.6×</td><td style={cell}>1.0×</td><td style={cell}>1.25×</td><td style={cell}>1.6×+</td></tr>
            <tr><td style={cell}>💀 데드리프트</td><td style={cell}>1.0×</td><td style={cell}>1.5×</td><td style={cell}>2.0×</td><td style={cell}>2.5×+</td></tr>
            <tr><td style={cell}>🪢 루마니안 데드</td><td style={cell}>0.85×</td><td style={cell}>1.3×</td><td style={cell}>1.7×</td><td style={cell}>2.1×+</td></tr>
            <tr><td style={cell}>🏋️ 오버헤드프레스</td><td style={cell}>0.35×</td><td style={cell}>0.65×</td><td style={cell}>0.85×</td><td style={cell}>1.1×+</td></tr>
            <tr><td style={cell}>🔙 바벨로우</td><td style={cell}>0.5×</td><td style={cell}>0.9×</td><td style={cell}>1.15×</td><td style={cell}>1.4×+</td></tr>
            <tr><td style={cell}>🔝 풀업 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.25×</td><td style={cell}>+0.5×</td><td style={cell}>+0.75×</td></tr>
            <tr><td style={cell}>🔝 친업 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.3×</td><td style={cell}>+0.55×</td><td style={cell}>+0.8×</td></tr>
            <tr><td style={cell}>💪 딥스 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.3×</td><td style={cell}>+0.55×</td><td style={cell}>+0.85×</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
        예) 70kg 남성이 벤치 87.5kg = 1.25× → 상급. 풀업 체중+0.3× (예: 70kg + 21kg) → 중급.
      </p>

      {/* 6. 훈련 강도 완전 가이드 */}
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
            <tr><td style={cell}><strong style={{ color: '#FF6B6B' }}>95~100%</strong></td><td style={cell}>1~2회</td><td style={cell}>최대 근력 테스트</td><td style={cell}>3~5분</td></tr>
            <tr><td style={cell}><strong style={{ color: '#FF6B6B' }}>90%</strong></td><td style={cell}>3~4회</td><td style={cell}>최대 근력</td><td style={cell}>3~5분</td></tr>
            <tr><td style={cell}><strong style={{ color: '#FFB83E' }}>85%</strong></td><td style={cell}>5~6회</td><td style={cell}>근력·근비대</td><td style={cell}>2~3분</td></tr>
            <tr><td style={cell}><strong style={{ color: '#FFB83E' }}>80%</strong></td><td style={cell}>8회</td><td style={cell}>근비대 (최적)</td><td style={cell}>90초~2분</td></tr>
            <tr><td style={cell}><strong style={{ color: '#C8FF3E' }}>75%</strong></td><td style={cell}>10회</td><td style={cell}>근비대</td><td style={cell}>90초</td></tr>
            <tr><td style={cell}><strong style={{ color: '#3EFF9B' }}>70%</strong></td><td style={cell}>12회</td><td style={cell}>근비대·지구력</td><td style={cell}>60~90초</td></tr>
            <tr><td style={cell}><strong style={{ color: '#3EFF9B' }}>65%</strong></td><td style={cell}>15회</td><td style={cell}>근지구력</td><td style={cell}>60초</td></tr>
            <tr><td style={cell}><strong style={{ color: '#3EFF9B' }}>60%</strong></td><td style={cell}>15회+</td><td style={cell}>워밍업·회복</td><td style={cell}>30~60초</td></tr>
          </tbody>
        </table>
      </div>

      {/* 7. 한국 헬스장 환경 — 원판·바벨 가이드 (NEW) */}
      <h2 style={sectionTitle}>🇰🇷 한국 헬스장 환경 — 원판·바벨 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        한국 일반 헬스장은 미국·유럽과 환경이 조금 다릅니다. 운동 계획 시 참고하세요.
      </p>
      <div style={{ ...card }}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
          <li><strong>바벨</strong> — 대부분 <strong style={{ color: 'var(--accent)' }}>20kg 올림픽 바</strong>. 일부 헬스장은 18kg·15kg 변형 바도 비치. 본인이 다니는 곳을 확인하세요.</li>
          <li><strong>원판</strong> — 25/20/15/10/5/2.5/1.25kg가 표준. <strong style={{ color: 'var(--accent)' }}>고무 범퍼판</strong>은 데드/클린 가능 구역에만 있는 경우가 많음.</li>
          <li><strong>스쿼트랙·파워랙</strong> — 피크타임에 대기. 새벽 5~7시·오후 2~4시·밤 10시 이후가 비교적 한산.</li>
          <li><strong>플랫폼</strong> — 전문 데드리프트 플랫폼이 있는 곳은 드물고, 일반 헬스장은 <strong style={{ color: 'var(--accent)' }}>고중량 데드/낙하 금지</strong>인 곳이 많음. 체이닝·스트랩 활용 또는 웨이트존 확인.</li>
          <li><strong>스포터</strong> — 한국 헬스장 문화상 모르는 사람에게 부탁하기 어려움. 95% 이상 도전 시 <strong style={{ color: 'var(--accent)' }}>세이프티 바</strong>로 자기 안전을 확보하세요.</li>
        </ul>
      </div>

      {/* 8. 프로그램 추천 (NEW) */}
      <h2 style={sectionTitle}>📅 1RM 기반 인기 프로그램 — 어떤 걸 골라야 할까?</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        본 도구로 추정한 1RM은 다양한 프로그램의 작업 중량 계산에 그대로 쓰입니다. 자신의 경력·목표에 맞는 프로그램을 골라보세요.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>프로그램</th>
              <th style={headCell}>대상</th>
              <th style={headCell}>구조</th>
              <th style={headCell}>1RM 활용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>StrongLifts 5×5</strong></td>
              <td style={cell}>초보</td>
              <td style={cell}>주 3회 · 5세트 5회</td>
              <td style={cell}>시작 무게는 1RM의 50%부터, 매 세션 +2.5kg</td>
            </tr>
            <tr>
              <td style={cell}><strong>Starting Strength</strong></td>
              <td style={cell}>초보</td>
              <td style={cell}>주 3회 · 3세트 5회</td>
              <td style={cell}>1RM 추정 후 점진적 무게 증가 기준점</td>
            </tr>
            <tr>
              <td style={cell}><strong>5/3/1 Wendler</strong></td>
              <td style={cell}>중급</td>
              <td style={cell}>4주 사이클 · 빅3 + 보조</td>
              <td style={cell}>훈련 1RM = 실제 1RM × 90%, 거기서 강도 산정</td>
            </tr>
            <tr>
              <td style={cell}><strong>nSuns</strong></td>
              <td style={cell}>중급+</td>
              <td style={cell}>주 4~6회 · 9세트 메인</td>
              <td style={cell}>1RM의 65~95% 피라미드 (주마다 +/- 조정)</td>
            </tr>
            <tr>
              <td style={cell}><strong>Smolov Jr.</strong></td>
              <td style={cell}>중급+</td>
              <td style={cell}>3주 단기 강화</td>
              <td style={cell}>벤치/스쿼트 1RM의 70~95% 고볼륨</td>
            </tr>
            <tr>
              <td style={cell}><strong>PPL (Push/Pull/Legs)</strong></td>
              <td style={cell}>모든 레벨</td>
              <td style={cell}>주 6회 · 분할</td>
              <td style={cell}>1RM의 70~85% 8~12회 근비대 위주</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 <strong style={{ color: 'var(--text)' }}>초보 6개월 미만</strong>은 1RM 기반 프로그램보다 <strong style={{ color: 'var(--text)' }}>폼 익히기 + 8~12회 4세트</strong>를 권장합니다. 1RM 측정은 6개월 이상 일관된 훈련 후가 좋아요.
      </p>

      {/* 9. 원판 조합 빠른 참조표 */}
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
            <tr><td style={cell}><strong>40kg</strong></td><td style={cell}>10</td><td style={cell}><strong>100kg</strong></td><td style={cell}>20 + 20</td></tr>
            <tr><td style={cell}><strong>50kg</strong></td><td style={cell}>15</td><td style={cell}><strong>110kg</strong></td><td style={cell}>20 + 20 + 5</td></tr>
            <tr><td style={cell}><strong>60kg</strong></td><td style={cell}>20</td><td style={cell}><strong>120kg</strong></td><td style={cell}>20 + 20 + 10</td></tr>
            <tr><td style={cell}><strong>70kg</strong></td><td style={cell}>20 + 5</td><td style={cell}><strong>140kg</strong></td><td style={cell}>20 × 3</td></tr>
            <tr><td style={cell}><strong>80kg</strong></td><td style={cell}>20 + 10</td><td style={cell}><strong>160kg</strong></td><td style={cell}>25 + 20 + 15</td></tr>
            <tr><td style={cell}><strong>90kg</strong></td><td style={cell}>20 + 15</td><td style={cell}><strong>180kg</strong></td><td style={cell}>25 × 2 + 20 + 10</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 원판은 항상 <strong style={{ color: 'var(--text)' }}>무거운 것부터 안쪽</strong>에 끼우고, 양쪽 무게를 대칭으로 맞추세요. 2.5kg·1.25kg 소형 원판을 활용하면 2.5kg 단위 점진적 과부하가 가능합니다.
      </p>

      {/* 10. FAQ — accordion 형식 */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 1RM을 직접 측정해야 하나요?</summary>
        <div style={faqAnswer}>
          초·중급자는 <strong style={{ color: 'var(--text)' }}>추정치 사용을 권장</strong>합니다. 실제 1RM 시도는 부상 위험이 크고, 숙련된 스포터·올바른 폼이 필요합니다. 5회 수행 가능한 무게로 추정해도 오차는 2~5% 수준이라 충분히 신뢰할 만합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 반복 수는 몇 회가 가장 정확한가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>3~6회 범위</strong>가 가장 정확합니다. 1~2회는 일시적 컨디션 영향이 크고, 10회 이상은 근지구력이 변수로 작용해 추정 오차가 커집니다. RPE 9~10 수준(AMRAP 또는 1회 여유)으로 수행해야 정확합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. RPE를 매번 정확히 매기기 어려운데, 그냥 RPE 10으로 가정해도 될까요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>RPE 10 기준이 본 도구의 기본값</strong>입니다. 정확히 RPE를 매길 자신이 없다면 RPE 보정을 끄고 그대로 입력하세요. 다만 &ldquo;끝나고 1~2회 더 가능했던 것 같다&rdquo;는 느낌이 들면 RPE 8~9로 보정해야 1RM이 과소 추정되지 않습니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 여성도 같은 공식을 써도 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>공식 자체는 성별과 무관하게 적용</strong>됩니다 (Epley·Brzycki 모두 마찬가지). 차이는 &ldquo;수준 평가&rdquo;에서만 나타나며, 본 도구는 성별을 선택하면 자동으로 여성 보정(체중 대비 약 70%)을 적용합니다. 또한 연령대를 함께 선택하면 더 정확합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 40~50대인데 20대 기준으로 평가받으니 의욕이 떨어져요.</summary>
        <div style={faqAnswer}>
          매우 자연스러운 반응입니다. 본 도구는 <strong style={{ color: 'var(--text)' }}>연령 보정</strong>을 적용해 40대는 20대 대비 85%, 50대는 75%, 60대+는 65% 기준으로 평가합니다. 연령대를 정확히 선택하면 같은 무게가 한 단계 위 수준으로 평가될 수 있어요. 절대 무게보다 <strong style={{ color: 'var(--text)' }}>지난 분기 대비 본인의 변화</strong>를 보는 것이 더 중요합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 워밍업은 정말 5세트나 필요한가요? 시간이 너무 오래 걸려요.</summary>
        <div style={faqAnswer}>
          본 세트가 <strong style={{ color: 'var(--text)' }}>80% 이상이면 5세트가 표준</strong>입니다. 60% 미만이면 2~3세트로 충분하고, 본 도구는 본 세트 강도에 따라 자동으로 워밍업 세트 수를 조절합니다. 워밍업을 줄이고 부상으로 한 달 쉬는 것보다, 매 세션 5분 더 투자하는 게 훨씬 효율적입니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 컨디션에 따라 1RM이 왜 이렇게 차이가 나죠?</summary>
        <div style={faqAnswer}>
          1RM은 <strong style={{ color: 'var(--text)' }}>수면·영양·스트레스·카페인</strong>에 민감하게 반응합니다. 10~15% 일일 편차는 정상이며, <strong style={{ color: 'var(--text)' }}>주간 평균</strong>을 보는 것이 더 정확합니다. 디로드 주간 뒤에는 일시적으로 5~10% 떨어질 수 있어요. 본 도구의 &ldquo;내 기록&rdquo; 탭에 누적하면 추세선으로 변동성을 흡수할 수 있습니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 1RM을 얼마나 자주 갱신해야 하나요?</summary>
        <div style={faqAnswer}>
          초보자는 <strong style={{ color: 'var(--text)' }}>4~6주</strong>, 중급 이상은 <strong style={{ color: 'var(--text)' }}>8~12주</strong>마다 재측정이 적절합니다. 프로그램 전환·디로드 후가 좋은 타이밍입니다. 매주 갱신은 오히려 변동성 노이즈에 흔들려 장기 추세를 놓치기 쉬워요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 풀업·딥스 같은 맨몸 운동의 1RM은 어떻게 계산하나요?</summary>
        <div style={faqAnswer}>
          맨몸 운동은 <strong style={{ color: 'var(--text)' }}>체중 + 추가 중량</strong>으로 봅니다. 예: 체중 70kg + 풀업 벨트 20kg = 총 90kg이 작업 중량. 본 도구의 풀업·친업·딥스는 이 &ldquo;추가 중량&rdquo; 기준이며, 수준 표의 &ldquo;+0.3×&rdquo;는 체중 70kg이면 +21kg 추가가 중급이라는 뜻입니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 기록은 어디에 저장되나요? 데이터가 사라질 수 있나요?</summary>
        <div style={faqAnswer}>
          모든 기록은 <strong style={{ color: 'var(--text)' }}>이 브라우저(localStorage)에만 저장</strong>됩니다. 서버로 전송되지 않으며, 브라우저 데이터를 지우거나 시크릿 모드로 접속하면 사라집니다. 다른 기기에서는 보이지 않으니 중요한 기록은 별도로 메모해두세요.
        </div>
      </details>

      {/* 11. 안전 주의사항 */}
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
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.7 }}>
          본 도구는 <strong>부상 진단·보충제·도핑·영양 상담·코칭/PT 추천</strong>을 하지 않습니다. 통증이 지속되면 정형외과 또는 스포츠의학과 전문의와 상담하세요.
        </p>
      </div>

      {/* 12. 관련 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
