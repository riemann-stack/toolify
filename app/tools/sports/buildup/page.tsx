import Link from 'next/link'
import BuildupClient from './BuildupClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/buildup',
  title: '러닝 빌드업 훈련 계산기 — 4가지 프로파일·구간별 페이스표·VDOT 자동·워치 포맷',
  description: '거리·시작 페이스·끝 페이스·구간 입력 → 구간별 빌드업 페이스표·시각화·강도 라벨·안전성 체크. 균등/후반집중/마지막질주/레이스단계 4가지 프로파일, 12개 프리셋, 워치 워크아웃 포맷, 내 루틴 저장.',
  keywords: ['빌드업 러닝', '빌드업 훈련 계산기', '프로그레시브 런', '빌드업 페이스', '5km 빌드업', '10km 빌드업', '하프 빌드업', '풀 마라톤 빌드업', 'VDOT 페이스', 'progression run', '러닝 페이스 그래프'],
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

export default function BuildupPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📈 러닝 빌드업 훈련 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        오늘 빌드업, 어떻게 짜지? 거리·페이스·구간·프로파일 입력 → 구간별 페이스표 + 시각화 + 안전성 체크 + 워치 워크아웃 포맷. 12개 검증된 프리셋·내 루틴 저장.
      </p>

      <BuildupClient />

      {/* 1. 빌드업 vs 인터벌 vs 템포런 */}
      <h2 style={sectionTitle}>📊 빌드업 vs 인터벌 vs 템포런 차이</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        세 훈련 모두 페이스 변화가 있지만 메커니즘과 효과가 다릅니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>훈련</th>
              <th style={headCell}>구조</th>
              <th style={headCell}>주효과</th>
              <th style={headCell}>예시</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>📈 빌드업 (본 도구)</strong></td><td style={cell}>점진적 가속 (E → T)</td><td style={cell}>페이스 조절·후반 지구력</td><td style={cell}>10km를 6:00 → 4:50/km</td></tr>
            <tr><td style={cell}><strong>🏃 인터벌</strong></td><td style={cell}>고강도 + 회복 반복</td><td style={cell}>V̇O₂max·심폐 자극</td><td style={cell}>800m × 6회 (3분 R)</td></tr>
            <tr><td style={cell}><strong>🌡️ 템포런</strong></td><td style={cell}>20~40분 일정 페이스</td><td style={cell}>젖산 역치 향상</td><td style={cell}>30분 @ T 페이스</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구는 <strong style={{ color: 'var(--text)' }}>빌드업 단일 세션 설계</strong> 전용. 인터벌·16주 훈련 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>.
      </p>

      {/* 2. 4가지 프로파일 가이드 */}
      <h2 style={sectionTitle}>📐 4가지 빌드업 프로파일 가이드</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { name: '🟢 균등 (Linear)', color: '#3EFFD0', curve: '6:00 → 5:45 → 5:30 → 5:15 → 5:00', use: '가장 단순·표준. 모든 거리에 적합.' },
          { name: '🟡 후반 집중 (Back-loaded)', color: '#3EFF9B', curve: '6:00 → 6:00 → 5:50 → 5:30 → 5:00', use: '하프·풀 준비. 후반 30%에 가속.' },
          { name: '🟠 마지막 자극 (Sprint Finish)', color: '#FFD93E', curve: '6:00 → 6:00 → 6:00 → 5:40 → 4:50', use: '회복 후 가벼운 자극·평일 짧은 훈련.' },
          { name: '🔴 레이스 페이스 단계 (Race-pace Ladder)', color: '#FF8C3E', curve: 'E → M → HM → 10K (4구간 고정)', use: '레이스 페이스 적응·하프 대비.' },
        ].map((p, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${p.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: p.color, fontWeight: 700, marginBottom: '8px' }}>{p.name}</p>
            <p style={{ fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text)', marginBottom: '8px' }}>{p.curve}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{p.use}</p>
          </div>
        ))}
      </div>

      {/* 3. 거리·목적별 표준 */}
      <h2 style={sectionTitle}>🎯 거리·목적별 빌드업 표준</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>거리</th>
              <th style={headCell}>구간</th>
              <th style={headCell}>프로파일 추천</th>
              <th style={headCell}>활용</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>3~5km</strong></td><td style={cell}>3~5구간</td><td style={cell}>마지막 자극</td><td style={cell}>회복 후 첫 자극·입문자</td></tr>
            <tr><td style={cell}><strong>6~8km</strong></td><td style={cell}>4~6구간</td><td style={cell}>균등 / 후반 집중</td><td style={cell}>평일 자극주</td></tr>
            <tr><td style={cell}><strong>10km</strong></td><td style={cell}>5구간 (2km씩)</td><td style={cell}>균등 (★ 표준)</td><td style={cell}>가장 표준적·10K 대비</td></tr>
            <tr><td style={cell}><strong>14~16km</strong></td><td style={cell}>4구간</td><td style={cell}>레이스 페이스 단계</td><td style={cell}>하프 준비</td></tr>
            <tr><td style={cell}><strong>18~25km</strong></td><td style={cell}>4~5구간</td><td style={cell}>후반 집중</td><td style={cell}>풀 마라톤 LSD</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구의 <strong>📋 프리셋 탭</strong>에서 12개 검증된 프리셋을 한 번 클릭으로 적용 가능.
      </p>

      {/* 4. 자주 하는 실수 5가지 */}
      <h2 style={sectionTitle}>🚫 안전한 빌드업 — 자주 하는 실수 5가지</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { title: '1. 시작이 너무 빠름', err: 'E 페이스보다 빠르게 출발 → 후반 가속 여력 X', fix: '시작은 본인 E 페이스(회복일 페이스)에 +30초 정도 여유' },
          { title: '2. 끝이 너무 빠름 (5K 페이스 이하)', err: '빌드업 ≠ 레이스. 5K 페이스 이하는 인터벌 영역.', fix: '끝은 T(역치) 페이스 또는 10K 페이스까지가 표준' },
          { title: '3. 격차가 너무 큼 (>120초/km)', err: '시작 6:30 → 끝 4:00 같은 극단 가속은 적응 어려움', fix: '90초/km 이내 권장. 큰 격차는 거리·구간 늘리기' },
          { title: '4. 고강도 구간이 너무 많음 (>50%)', err: '후반 절반 이상이 T·I 강도 → 누적 피로로 부상 위험', fix: '고강도는 마지막 20~30% 권장' },
          { title: '5. 회복 다음날 강한 빌드업', err: '전날 LSD·인터벌 후 강한 빌드업 → 누적 부하', fix: '회복 다음날은 회복 빌드업(🌱 프리셋) 또는 휴식' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #FFB83E', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: '#FFB83E', fontWeight: 700, marginBottom: '6px' }}>{m.title}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 4px' }}>❌ {m.err}</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>✅ {m.fix}</p>
          </div>
        ))}
      </div>

      {/* 5. 빌드업 후 회복 */}
      <h2 style={sectionTitle}>🌳 빌드업 후 회복 가이드 (간단 안내)</h2>
      <div style={card}>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
          <li><strong style={{ color: 'var(--accent)' }}>쿨다운</strong>: 빌드업 직후 5~10분 매우 천천히 (E 페이스보다 +60초/km)</li>
          <li><strong style={{ color: 'var(--accent)' }}>스트레칭</strong>: 정적 스트레칭 5~10분 (햄스트링·종아리·고관절 굴근)</li>
          <li><strong style={{ color: 'var(--accent)' }}>다음날</strong>: 회복 러닝(E 페이스 30~40분) 또는 휴식. 강한 빌드업 X</li>
          <li><strong style={{ color: 'var(--accent)' }}>주간 빈도</strong>: 강한 빌드업은 주 1~2회 권장 (인터벌·LSD와 분산)</li>
          <li>⚠️ 통증·심한 피로 시 즉시 휴식. 부상 의심 시 정형외과·재활의학과</li>
        </ul>
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7, marginBottom: 0 }}>
          ⚠️ 본 도구는 <strong>영양·식단 자문 X · 부상 진단 X · 신발/기어 추천 X</strong>. 일반 가이드만 제공.
        </p>
      </div>

      {/* 6. FAQ — accordion */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 빌드업 vs 인터벌 vs 템포런 차이는?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>빌드업</strong>은 점진적 가속(E→T), <strong style={{ color: 'var(--text)' }}>인터벌</strong>은 고강도+회복 반복, <strong style={{ color: 'var(--text)' }}>템포런</strong>은 일정 페이스로 20~40분.
          빌드업 = 페이스 조절·후반 지구력 / 인터벌 = V̇O₂max / 템포 = 젖산 역치 향상.
          본 도구는 빌드업 전용. 인터벌은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 시작 페이스는 어떻게 정하나요?</summary>
        <div style={faqAnswer}>
          본인 <strong style={{ color: 'var(--text)' }}>E(Easy) 페이스</strong>에 +30초/km 정도 여유 두는 게 표준. E 페이스는 회복일·LSD 페이스(약간 숨차지만 대화 가능).
          <strong style={{ color: 'var(--text)' }}>레이스 기반 탭</strong>에 5K/10K/하프 기록 입력 시 VDOT 기반 E·M·T·I 페이스 자동 표시.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 끝 페이스는 5K 페이스보다 빨라도 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#FF6B6B' }}>비추천</strong>. 5K 페이스 이하는 인터벌(I·R) 영역으로 빌드업 정의를 벗어남. 표준은 <strong style={{ color: 'var(--text)' }}>T(역치) 페이스 ~ 10K 페이스</strong>까지가 안전.
          본 도구의 안전성 체크가 자동 경고합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 5km 빌드업은 어떻게 짜야 하나요?</summary>
        <div style={faqAnswer}>
          짧은 거리는 적응 시간 부족 → <strong style={{ color: 'var(--text)' }}>마지막 자극(sprint finish)</strong> 프로파일 추천.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>1~4km: E 페이스 (편안)</li>
            <li>마지막 1km: M 또는 T 페이스</li>
          </ul>
          본 도구의 <strong>🌱 회복 후 5km 가벼운 자극</strong> 프리셋 활용.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 풀 마라톤 대비 빌드업은 며칠 전에 하나요?</summary>
        <div style={faqAnswer}>
          일반 가이드:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong style={{ color: 'var(--text)' }}>6~8주 전</strong>: 25km 빌드업 (후반 10km M 페이스 적응)</li>
            <li><strong style={{ color: 'var(--text)' }}>4~6주 전</strong>: 20km 빌드업 (후반 8km M 페이스)</li>
            <li><strong style={{ color: 'var(--text)' }}>1~2주 전</strong>: 12km 빌드업 (페이스 점검·자신감)</li>
          </ul>
          본 도구의 <strong>💪 풀 대비 20km/25km</strong>·<strong>🔥 풀 직전 12km 점검</strong> 프리셋 활용. 정확한 일정은 본인 컨디션·코치와 상담.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 트레드밀에서도 빌드업 가능한가요?</summary>
        <div style={faqAnswer}>
          가능합니다. 트레드밀은 <strong style={{ color: 'var(--text)' }}>속도(km/h)</strong>로 입력:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>5:00/km = 12.0 km/h</li>
            <li>5:30/km = 10.9 km/h</li>
            <li>6:00/km = 10.0 km/h</li>
          </ul>
          본 도구는 페이스(mm:ss/km) 표시 — 본인이 환산. 트레드밀은 외부 변수(바람·지형) 없어 페이스 안정적이지만, 1% 경사 추가 권장(실외 환산).
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 본 도구의 워치 포맷은 어떤 워치에서 작동하나요?</summary>
        <div style={faqAnswer}>
          본 도구는 <strong style={{ color: 'var(--text)' }}>단순 텍스트 포맷</strong>(예: &ldquo;2.0km @ 5:30/km&rdquo;)을 제공합니다. 가민·코로스·애플워치 등 워치별 직접 가져오기 형식이 다르므로:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>가민 Connect → 워크아웃 수동 생성 (구간별 거리·페이스 입력)</li>
            <li>코로스 → COROS App 워크아웃 빌더</li>
            <li>애플워치 → 운동 앱 직접 입력</li>
          </ul>
          본 도구의 텍스트는 입력 참고용. 자동 import는 워치 앱 자체 워크아웃 빌더 활용.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 안전성 체크가 빨강(🔴)이면 절대 하면 안 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>절대 금지가 아니라 강력 보류 권장</strong>. 본 도구는 일반 가이드 — 본인 한계 보장 X.
          🔴가 나오면:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>설계를 조정 (페이스·거리·구간)</li>
            <li>프리셋(📋 탭)에서 본인 수준에 맞는 거 선택</li>
            <li>VDOT(레이스 기록) 입력으로 정확도 ↑</li>
          </ul>
          그래도 진행한다면 본인 책임. 통증·이상 시 즉시 중단.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구와 인터벌 훈련 계산기 차이는?</summary>
        <div style={faqAnswer}>
          영역이 다릅니다.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>📈 <strong style={{ color: 'var(--text)' }}>본 도구 (빌드업)</strong>: 오늘 한 번의 빌드업 세션 설계 (거리·프로파일·페이스 곡선)</li>
            <li>🏃 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>: 인터벌 페이스 정확·400m 랩·4~16주 풀 훈련 스케줄·한국 대회 매칭</li>
            <li>🏅 <Link href="/tools/sports/race-predictor" style={{ color: 'var(--accent)' }}>마라톤 기록 예측</Link>: VDOT·기록 예측·환경 보정·목표 역산</li>
            <li>🏃 <Link href="/tools/sports/pace" style={{ color: 'var(--accent)' }}>러닝 페이스 계산기</Link>: 페이스↔시간 단순 변환</li>
          </ul>
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 자주 쓰는 빌드업 루틴은 어디 저장되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>본인 브라우저(localStorage)에만 저장</strong> — 서버 전송 X. 다른 기기 자동 동기화 X.
          백업: <strong>💾 내 루틴 탭</strong> → 📊 CSV 다운로드 → Notion·Google Drive 등에 보관. 정기 백업(월 1회) 권장.
        </div>
      </details>

      {/* 7. 면책 */}
      <h2 style={sectionTitle}>⚠️ 면책 조항</h2>
      <div style={{
        background: 'rgba(255, 184, 62, 0.06)',
        border: '1px solid rgba(255, 184, 62, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 빌드업 설계 가이드</strong>입니다. 페이스·거리 추천은 평균값 — 컨디션·날씨·지형에 따라 조정.</li>
          <li>안전성 체크는 일반 가이드 — 본인 한계 보장 X.</li>
          <li>본 도구는 <strong>부상 진단·영양 자문·신발/기어 추천·약물/도핑 정보</strong>를 제공하지 않습니다.</li>
          <li>인터벌·16주 훈련 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent)' }}>인터벌 훈련 계산기</Link>.</li>
          <li>통증·심한 피로 시 즉시 휴식. 부상 의심 시 정형외과·재활의학과.</li>
          <li>도움 받기: 한국스포츠의학회 / 정형외과·재활의학과 / 응급 119.</li>
        </ul>
      </div>

      {/* 8. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        <Link href="/tools/sports/race-predictor" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>마라톤 기록 예측</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT·환경 보정·역산</div>
        </Link>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>16주 스케줄·인터벌 페이스</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스↔시간 변환</div>
        </Link>
        <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>러너 근력 보강</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련일 칼로리</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>대회 일정 추적</div>
        </Link>
      </div>
    </div>
  )
}
