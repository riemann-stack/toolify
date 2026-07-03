import Link from 'next/link'
import RacePredictorClient from './RacePredictorClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/race-predictor',
  title: '마라톤 기록 계산기 — VDOT·Riegel·Cameron·환경/연령 보정·목표 역산',
  description: '5km·10km·하프 기록으로 풀코스 예상 시간 + 3공식 평균과 기온·습도·고도·연령 자동 보정·VDOT 추이.',
  keywords: ['마라톤 기록 예측', 'VDOT 계산기', 'Riegel 공식', 'Cameron 공식', '서브3 페이스', '서브4 페이스', '5km 풀 환산', '하프 풀 예측', '마라톤 환경 보정', '한국 마라톤 시즌', 'Jack Daniels 페이스'],
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

const FAQ_LD = [
  { "q":"5km 기록으로 풀 마라톤을 예측해도 정확한가요?","a":"5km는 유산소·무산소 혼합 에너지 시스템에 의존하지만 풀 마라톤은 순수 유산소 지구력이 결정합니다. 거리 차이가 클수록 예측 오차가 커지므로 10km 이상 기록을 기준으로 권장. 본 도구는 3개 공식 평균값으로 오차를 완화합니다." },
  { "q":"VDOT과 VO2max는 같은 개념인가요?","a":"엄밀히 다릅니다. VO2max는 실험실에서 측정하는 최대산소섭취량(ml/kg/min)이고, VDOT은 실제 레이스 기록에서 역산한 &ldquo;해당 기록을 내려면 필요한 유산소 능력&rdquo; 지표입니다. 두 숫자의 크기는 비슷하지만 VDOT은 러닝 경제성·정신력까지 포함된 통합 지표에 가깝습니다." },
  { "q":"대회 당일 기온·습도가 다르면 기록이 얼마나 차이 나나요?","a":"본 도구의 환경 보정 활용. 봄·가을(15°C 이하·습도 60% 이하)은 평시 기록, 여름(25°C·습도 80%)은 약 +4~6%, 겨울(영하·바람)은 페이스 ↓·근육 경직 위험. 서브3 러너 기준: 평시 3:00 → 25°C·습도 80% 약 3:08(+8분) → 30°C·습도 80% 약 3:13(+13분, ⚠️ 위험). 25°C 이상은 열사병 위험 — 평시 페이스 -10%로 시작, 충분한 수분·전해질, 어지러움 시 즉시 중단·119." },
  { "q":"서브3:30 달성하려면 5km 기록이 얼마여야 하나요?","a":"본 도구의 목표 역산 탭에서 즉시 확인. 서브3:30 (VDOT 약 45 기준): 5km 약 22:00 / 10km 약 45:40 / 하프 약 1:41:00. ⚠️ 단 짧은 거리 능력만으로 풀 마라톤 보장 X — 30km+ 장거리 훈련, 16주+ 체계적 준비 필수. 본인 현재 기록을 함께 입력하면 격차(VDOT 차)와 예상 향상 기간이 표시됩니다." },
  { "q":"50대 마라톤 시작하는데 너무 늦었나요?","a":"늦지 않았습니다. 한국 마스터스 마라톤(40대+) 인구는 매우 큽니다. 50대 풀 평균 약 4:00~4:30, 60대+ 풀 5:00~5:30 충분 가능. 세계 기록 보유자 60대도 풀 3:00:00 가능. 본 도구의 연령 보정을 적용하면 본인 잠재력을 동급 능력 기준으로 비교 가능. ⚠️ 시작 시 의사 상담(특히 50대+), 점진적(걷기 → 조깅 → 러닝), 부상 예방(스트레칭·근력) 권장." },
  { "q":"훈련 페이스 E·M·T·I·R는 무엇이며 본 도구와 인터벌 훈련 계산기 차이는?","a":"E(Easy·회복), M(Marathon·대회 페이스), T(Threshold·역치 템포), I(Interval·V̇O₂max), R(Repetition·스피드) — Jack Daniels 5단계 훈련 존입니다. 주간 훈련 중 E가 80%, 고강도(T/I/R)가 20% 수준이 이상적. 📊 본 도구: 기록 예측·환경 보정·목표 역산 중심 (훈련 페이스는 결과 부산물). 🏃 인터벌 훈련 계산기: 인터벌 페이스 정확·400m 랩·4~16주 훈련 스케줄·한국 대회 매칭. 매일 페이스 추적은 별도 러닝 앱 활용." },
  { "q":"네거티브 스플릿이 왜 유리한가요?","a":"전반부를 아껴두면 글리코겐 고갈·근피로 누적을 늦출 수 있어 후반부 페이스 저하가 작아집니다. 세계기록 대부분은 네거티브 또는 이븐 스플릿이었습니다. 초보자는 전반을 평균 페이스보다 5초/km 느리게 출발하는 것만으로도 효과를 볼 수 있어요. 본 도구의 페이스 전략 탭에서 균등·네거티브·포지티브 3가지 스플릿을 거리별로 자동 계산." },
  { "q":"본 도구의 기록을 다른 기기로 옮길 수 있나요?","a":"localStorage는 본 브라우저에만 저장되며 서버로 전송되지 않습니다. 다른 기기·브라우저 자동 동기화 X. 백업: 📈 내 기록 탭 → 📊 CSV 다운로드 → Notion·Google Drive 등에 보관. 정기 백업(월 1회) 권장." }
]

export default function RacePredictorPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />마라톤 기록 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        5km·10km·하프 기록으로 <strong style={{ color: 'var(--text)' }}>풀코스 예상 시간</strong> + 기온·고도·연령 자동 보정.
      </p>

      <RacePredictorClient />

      <GuideDivider />

      {/* 1. 3공식 비교 */}
      <h2 style={sectionTitle}>📐 3가지 예측 공식</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { name: 'Riegel (1981)', color: 'var(--accent)', formula: 't₂ = t₁ × (d₂/d₁)^1.06',
            desc: '가장 널리 쓰이는 공식. 지수 1.06은 거리 증가에 따른 페이스 저하를 반영. 5~30km 예측에서 안정적.' },
          { name: 'VDOT (Daniels)', color: '#EA580C', formula: 'vo2 ÷ %VO2max',
            desc: '잭 다니엘스의 유산소 능력 통합 지표. 시간에 따른 최대산소섭취량 비율 감소를 지수 함수로 보정.' },
          { name: 'Cameron (1998)', color: '#0891B2', formula: 't₂ = t₁ × (d₂/d₁) × a(d₁)/a(d₂)',
            desc: '엘리트 기록 통계 회귀 함수 a(d). 10마일+ 장거리 마라톤 예측 편차가 작은 편.' },
        ].map((f, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '13px', color: f.color, fontWeight: 700, marginBottom: '8px' }}>{f.name}</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '13px', color: 'var(--text)', fontWeight: 700, background: 'var(--bg3)', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>{f.formula}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* 2. 공식별 추천 거리 */}
      <h2 style={sectionTitle}>📊 공식별 추천 사용 거리</h2>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>기준 → 목표</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>Riegel</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>VDOT</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>Cameron</th>
            </tr>
          </thead>
          <tbody>
            {[
              { from: '5km → 10km',   r: '★★★', v: '★★★', c: '★★' },
              { from: '10km → 하프',  r: '★★★', v: '★★★', c: '★★★' },
              { from: '하프 → 풀',    r: '★★',  v: '★★★', c: '★★★' },
              { from: '10km → 풀',    r: '★',   v: '★★',  c: '★★★' },
              { from: '5km → 풀',     r: '—',   v: '★',   c: '★★' },
            ].map((r, i) => (
              <tr key={i}>
                <td style={cell}>{r.from}</td>
                <td style={{ ...cell, textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.r}</td>
                <td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.v}</td>
                <td style={{ ...cell, textAlign: 'center', color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        본 도구는 3개 공식 평균을 기본 표시 — 단일 공식 의존 X.
      </p>

      {/* 3. 환경 자동 보정 (NEW) */}
      <h2 style={sectionTitle}>🌡️ 환경 자동 보정 — 대회 당일은 평시와 다릅니다</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        본 도구의 <strong style={{ color: 'var(--text)' }}>환경 보정</strong> 체크박스를 켜면 기온·습도·고도 슬라이더로 즉시 보정된 기록을 확인할 수 있습니다. 봄·가을 평시 기록과 한여름 대회 기록은 같은 능력에서도 5~10% 차이 납니다.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>요인</th>
              <th scope="col" style={headCell}>구간</th>
              <th scope="col" style={headCell}>영향</th>
              <th scope="col" style={headCell}>비고</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>기온</strong></td><td style={cell}>~15°C</td><td style={cell}>0%</td><td style={cell}>최적</td></tr>
            <tr><td style={cell}></td><td style={cell}>15~20°C</td><td style={cell}>+1.5%</td><td style={cell}>적정</td></tr>
            <tr><td style={cell}></td><td style={cell}>20~25°C</td><td style={cell}>+3.5%</td><td style={cell}>주의</td></tr>
            <tr><td style={cell}></td><td style={cell}>25~30°C</td><td style={cell}>+6%</td><td style={cell}>⚠️ 위험</td></tr>
            <tr><td style={cell}></td><td style={cell}>30°C+</td><td style={cell}>+8%↑</td><td style={cell}>🔴 열사병 위험</td></tr>
            <tr><td style={cell}><strong>습도</strong></td><td style={cell}>~60%</td><td style={cell}>0%</td><td style={cell}>건조</td></tr>
            <tr><td style={cell}></td><td style={cell}>60~80%</td><td style={cell}>+1%</td><td style={cell}>보통</td></tr>
            <tr><td style={cell}></td><td style={cell}>80%+</td><td style={cell}>+2.5%</td><td style={cell}>다습</td></tr>
            <tr><td style={cell}><strong>고도</strong></td><td style={cell}>~200m</td><td style={cell}>0%</td><td style={cell}>해수면</td></tr>
            <tr><td style={cell}></td><td style={cell}>200~500m</td><td style={cell}>+1.5%</td><td style={cell}>저고도</td></tr>
            <tr><td style={cell}></td><td style={cell}>500~1000m</td><td style={cell}>+3%</td><td style={cell}>중고도</td></tr>
            <tr><td style={cell}></td><td style={cell}>1000~2000m</td><td style={cell}>+5%</td><td style={cell}>고고도</td></tr>
            <tr><td style={cell}></td><td style={cell}>2000m+</td><td style={cell}>+7%</td><td style={cell}>고지대</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        예) 평시 3:30 + 23°C(+3.5%) + 75%(+1%) = 3:30 × 1.045 ≈ <strong style={{ color: 'var(--text)' }}>3:39:30</strong>.
      </p>

      {/* 4. 목표 역산 (NEW) */}
      <h2 style={sectionTitle}>🎯 목표 ↔ 필요 능력 역산 — 어디까지 가야 할까</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        도구의 <strong style={{ color: 'var(--text)' }}>목표 역산 탭</strong>에서 풀 마라톤 목표 시간을 넣으면, 그 능력에 도달하기 위한 5km·10km·하프 기록을 자동 계산합니다. 본인 현재 기록을 함께 입력하면 격차(VDOT 차)와 예상 향상 기간까지 보여줍니다.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>풀 목표</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>VDOT</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>5km</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>10km</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>하프</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>서브5 (5:00:00)</strong></td><td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>28.7</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>31:49</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1:06:11</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>2:26:28</td></tr>
            <tr><td style={cell}><strong>서브4:30</strong></td><td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>32.8</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>28:30</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>59:13</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>2:11:14</td></tr>
            <tr><td style={cell}><strong>서브4 (4:00:00)</strong></td><td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>37.9</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>25:14</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>52:22</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1:56:06</td></tr>
            <tr><td style={cell}><strong>서브3:30</strong></td><td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>44.6</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>22:00</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>45:37</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1:41:06</td></tr>
            <tr><td style={cell}><strong>서브3 (3:00:00)</strong></td><td style={{ ...cell, textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>53.5</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>18:48</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>38:59</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1:26:16</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ⚠️ 짧은 거리 능력만으로 풀 마라톤 보장 X — 30km+ 장거리 훈련 필수. 16주+ 체계 준비는 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>.
      </p>

      {/* 5. 연령·성별 보정 */}
      <h2 style={sectionTitle}>👥 연령·성별 보정 가이드 — 같은 능력도 평가는 다릅니다</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        WMA(World Masters Athletics) 통계 평균을 기준으로, 본 도구의 연령·성별 보정 옵션은 본인 기록을 동급 능력의 20대 남성 환산 시간으로 비교 표시합니다. 통계 평균이며 개인차 큼 — 꾸준한 훈련 = 연령 극복 가능.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>구분</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>20대</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>30대</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>40대</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>50대</th>
              <th scope="col" style={{ ...headCell, textAlign: 'center' }}>60대+</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>남성 보정</strong></td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>1.00</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.97</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.92</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.84</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.76</td></tr>
            <tr><td style={cell}><strong>여성 보정</strong></td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.91</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.88</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.83</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.76</td><td style={{ ...cell, textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>0.68</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        예) 50대 남성 풀 4:30:00은 동급 능력의 20대 남성 풀 3:46(보정 0.84)과 같은 수준. 60대도 풀 3:00:00 가능한 마스터스 러너 다수.
      </p>

      {/* 6. 한국 시즌 가이드 */}
      <h2 style={sectionTitle}>📅 한국 마라톤 시즌 가이드</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {[
          { season: '봄 (3~4월)',     temp: '12~18°C',  rating: '⭐ 적정',          races: '서울국제·동아·서울하프', color: '#059669' },
          { season: '가을 (9~11월)',  temp: '12~18°C',  rating: '⭐⭐ 최적',         races: '춘천·JTBC',              color: '#0EA5E9' },
          { season: '여름 (6~8월)',   temp: '25~30°C',  rating: '⚠️ 위험',          races: '드물게 야간 대회',        color: '#EA580C' },
          { season: '겨울 (12~2월)',  temp: '0~10°C',   rating: '⚠️ 바람·근경직',   races: '드문 대회',               color: '#0891B2' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: s.color, fontWeight: 700, marginBottom: '6px' }}>{s.season}</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', marginBottom: '4px' }}>{s.temp}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{s.rating}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{s.races}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7 }}>
        ⚠️ 특정 대회 추천 X — 일반 정보만. 참가 신청은 공식 홈페이지에서. 16주 훈련 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>.
      </p>

      {/* 7. 기록 추이 활용 */}
      <h2 style={sectionTitle}>📈 기록 추이 — 본인 발전을 시각화하세요</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          <strong>📈 내 기록 탭</strong>에서 5km·10km·하프·풀 기록을 누적하면 VDOT 추이 그래프와 풀 마라톤 환산 변화를 한눈에 볼 수 있습니다.
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '12px', paddingLeft: '18px' }}>
          <li>모든 데이터는 <strong style={{ color: 'var(--text)' }}>본 브라우저(localStorage)</strong>에만 저장 — 서버 전송 X</li>
          <li>다른 기기와 자동 동기화 X → 백업은 <strong style={{ color: 'var(--text)' }}>📊 CSV 다운로드</strong> 활용</li>
          <li>일반적으로 VDOT 1↑ ≈ 6~12주 꾸준한 훈련, 6 VDOT 향상 ≈ 6~12개월</li>
          <li>0인 달도 OK — 통계는 본인 발전 참고용, 부상 시 즉시 휴식</li>
        </ul>
      </div>

      {/* 운영자 노트 — 날씨·코스 실전 변수 */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: '14px', padding: '18px 20px', marginBottom: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '8px' }}>🏃 직접 뛰어보니 — 같은 몸도 날씨로 갈린다</p>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 }}>
          2026년 2월 밀양 하프(기온 20도 안팎·업힐 많은 코스)에서 1:51대를 뛰었는데, 2주 뒤 3월 고양 하프(기온 0~3도·평지)에서는 1:44대가 나왔습니다. 2주 사이 훈련이 크게 늘었을 리 없으니, 7분 차이는 거의 날씨와 코스 몫입니다. 예측기 숫자는 &lsquo;선선한 날씨·평탄한 코스&rsquo; 기준에 가깝다고 보고, 더운 날이나 업힐 코스면 그만큼 여유를 두세요.
        </p>
      </div>

      {/* 8. FAQ — accordion */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 5km 기록으로 풀 마라톤을 예측해도 정확한가요?</summary>
        <div style={faqAnswer}>
          5km는 유산소·무산소 혼합 에너지 시스템에 의존하지만 풀 마라톤은 순수 유산소 지구력이 결정합니다. 거리 차이가 클수록 예측 오차가 커지므로 <strong style={{ color: 'var(--text)' }}>10km 이상 기록을 기준</strong>으로 권장. 본 도구는 3개 공식 평균값으로 오차를 완화합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. VDOT과 VO2max는 같은 개념인가요?</summary>
        <div style={faqAnswer}>
          엄밀히 다릅니다. VO2max는 실험실에서 측정하는 최대산소섭취량(ml/kg/min)이고, VDOT은 실제 레이스 기록에서 역산한 &ldquo;해당 기록을 내려면 필요한 유산소 능력&rdquo; 지표입니다. 두 숫자의 크기는 비슷하지만 VDOT은 러닝 경제성·정신력까지 포함된 통합 지표에 가깝습니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 대회 당일 기온·습도가 다르면 기록이 얼마나 차이 나나요?</summary>
        <div style={faqAnswer}>
          본 도구의 환경 보정 활용. 봄·가을(15°C 이하·습도 60% 이하)은 평시 기록, 여름(25°C·습도 80%)은 약 +4~6%, 겨울(영하·바람)은 페이스 ↓·근육 경직 위험.
          서브3 러너 기준: 평시 3:00 → 25°C·습도 80% 약 3:08(+8분) → 30°C·습도 80% 약 3:13(+13분, ⚠️ 위험).
          25°C 이상은 열사병 위험 — 평시 페이스 -10%로 시작, 충분한 수분·전해질, 어지러움 시 즉시 중단·119.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 서브3:30 달성하려면 5km 기록이 얼마여야 하나요?</summary>
        <div style={faqAnswer}>
          본 도구의 <strong style={{ color: 'var(--text)' }}>목표 역산 탭</strong>에서 즉시 확인. 서브3:30 (VDOT 약 45 기준): 5km 약 22:00 / 10km 약 45:40 / 하프 약 1:41:00.
          ⚠️ 단 짧은 거리 능력만으로 풀 마라톤 보장 X — 30km+ 장거리 훈련, 16주+ 체계적 준비 필수. 본인 현재 기록을 함께 입력하면 격차(VDOT 차)와 예상 향상 기간이 표시됩니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 50대 마라톤 시작하는데 너무 늦었나요?</summary>
        <div style={faqAnswer}>
          늦지 않았습니다. 한국 마스터스 마라톤(40대+) 인구는 매우 큽니다. 50대 풀 평균 약 4:00~4:30, 60대+ 풀 5:00~5:30 충분 가능. 세계 기록 보유자 60대도 풀 3:00:00 가능.
          본 도구의 <strong style={{ color: 'var(--text)' }}>연령 보정</strong>을 적용하면 본인 잠재력을 동급 능력 기준으로 비교 가능.
          ⚠️ 시작 시 의사 상담(특히 50대+), 점진적(걷기 → 조깅 → 러닝), 부상 예방(스트레칭·근력) 권장.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 훈련 페이스 E·M·T·I·R는 무엇이며 본 도구와 인터벌 훈련 계산기 차이는?</summary>
        <div style={faqAnswer}>
          E(Easy·회복), M(Marathon·대회 페이스), T(Threshold·역치 템포), I(Interval·V̇O₂max), R(Repetition·스피드) — Jack Daniels 5단계 훈련 존입니다. 주간 훈련 중 E가 80%, 고강도(T/I/R)가 20% 수준이 이상적.
          <br /><br />
          📊 <strong style={{ color: 'var(--text)' }}>본 도구</strong>: 기록 예측·환경 보정·목표 역산 중심 (훈련 페이스는 <strong style={{ color: 'var(--text)' }}>결과 부산물</strong>).
          🏃 <strong style={{ color: 'var(--text)' }}>인터벌 훈련 계산기</strong>: 인터벌 페이스 정확·400m 랩·4~16주 훈련 스케줄·한국 대회 매칭.
          매일 페이스 추적은 별도 러닝 앱 활용.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 네거티브 스플릿이 왜 유리한가요?</summary>
        <div style={faqAnswer}>
          전반부를 아껴두면 글리코겐 고갈·근피로 누적을 늦출 수 있어 후반부 페이스 저하가 작아집니다. 세계기록 대부분은 네거티브 또는 이븐 스플릿이었습니다. 초보자는 전반을 평균 페이스보다 5초/km 느리게 출발하는 것만으로도 효과를 볼 수 있어요.
          본 도구의 <strong style={{ color: 'var(--text)' }}>페이스 전략 탭</strong>에서 균등·네거티브·포지티브 3가지 스플릿을 거리별로 자동 계산.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 본 도구의 기록을 다른 기기로 옮길 수 있나요?</summary>
        <div style={faqAnswer}>
          localStorage는 <strong style={{ color: 'var(--text)' }}>본 브라우저에만 저장</strong>되며 서버로 전송되지 않습니다. 다른 기기·브라우저 자동 동기화 X.
          백업: 📈 내 기록 탭 → <strong style={{ color: 'var(--text)' }}>📊 CSV 다운로드</strong> → Notion·Google Drive 등에 보관. 정기 백업(월 1회) 권장.
        </div>
      </details>

      {/* 9. 안전·면책 */}
      <h2 style={sectionTitle}>⚠️ 안전 · 면책</h2>
      <div style={{
        background: 'rgba(217, 119, 6, 0.06)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 3공식 평균으로 오차 완화하나 실제 ±5~10% 차이 가능.</li>
          <li>5km → 풀 예측은 거리차 大 → 오차 ↑. <strong>10km 이상 기록 권장</strong>.</li>
          <li>환경 보정·연령 보정도 평균 통계 — 개인차 큼 (실제 ±20% 차이 가능).</li>
          <li><strong>25°C 이상 시 열사병 위험</strong> — 충분한 수분·전해질, 어지러움·구토 시 즉시 중단·119.</li>
          <li>본 도구는 <strong>부상 진단·영양/식단 자문·신발/기어 추천·약물/도핑 정보</strong>를 제공하지 않습니다.</li>
          <li>도움 받기: 한국스포츠의학회(KASEM), 정형외과·재활의학과, 응급 119, 한국도핑방지위원회 (kada-ad.or.kr).</li>
        </ul>
      </div>

      {/* 10. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT 인터벌 페이스·4~16주 스케줄</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스↔시간 변환·구간 스플릿</div>
        </Link>
        <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>러너 근력 보강</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련일 칼로리 산정</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>러너 체중 범위</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>다음 마라톤까지</div>
        </Link>
      </div>
    </div>
  )
}
