import Link from 'next/link'
import StrengthLevelClient from './StrengthLevelClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/sports/strength-level',
  title: '스트렝스 레벨 계산기 — 3대 측정·윌크스·DOTS 점수 + 입문~엘리트 등급',
  description:
    '스쿼트·벤치·데드 1RM으로 3대 합과 Wilks·DOTS 점수, 체중·성별·연령 보정 레벨(입문~엘리트)을 한 번에. 내 근력이 어느 수준인지 백분위로 확인.',
  keywords: ['스트렝스레벨', '3대측정', '3대중량', '윌크스계산기', 'DOTS점수', '파워리프팅토탈', '3대500', '체중대비근력', '벤치스쿼트데드'],
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
  { "q": "3대 운동이 뭔가요? 왜 이 세 가지인가요?", "a": "3대 운동은 <strong>스쿼트·벤치프레스·데드리프트</strong>를 말합니다. 하체·상체 밀기·전신 당기기를 대표하는 복합 다관절 운동으로, 세 종목의 1RM 합(3대 합)이 전신 근력의 표준 지표로 널리 쓰입니다. 파워리프팅 경기 종목도 이 세 가지입니다." },
  { "q": "Wilks 점수와 DOTS 점수는 무슨 차이인가요?", "a": "둘 다 <strong>체중이 다른 사람의 근력을 공정하게 비교</strong>하기 위한 보정 점수입니다. 같은 100kg을 들어도 가벼운 사람이 더 높은 점수를 받습니다. Wilks는 오래 쓰여 인지도가 높고, DOTS는 2020년 전후 도입된 최신 공식으로 현재 다수 연맹이 채택합니다. 본 도구는 두 점수를 모두 보여줍니다." },
  { "q": "레벨(입문~엘리트)은 어떤 기준으로 나뉘나요?", "a": "체중 대비 1RM 비율을 기준으로 합니다. 예를 들어 20대 남성 벤치프레스는 체중의 0.5배=초보, 1.0배=중급, 1.25배=상급, 1.5배 이상=엘리트입니다. 본 도구는 <strong>1RM 계산기와 동일한 기준</strong>을 사용하며, 성별·연령에 따라 자동 보정합니다." },
  { "q": "여성인데 점수가 낮게 나와요. 정상인가요?", "a": "레벨 기준은 성별 보정이 적용되므로 <strong>같은 레벨이라도 여성의 절대 무게 기준은 더 낮습니다</strong>(체중 대비 약 0.7배). Wilks·DOTS 점수는 성별 다항식으로 계산되어 남녀 점수를 직접 비교할 수 있게 설계돼 있습니다. 절대 무게가 아니라 같은 성별·체중대 내에서의 위치로 해석하세요." },
  { "q": "'3대 500'이면 어느 정도 수준인가요?", "a": "체중에 따라 다릅니다. 체중 70~80kg 남성 기준 3대 합 500kg은 대체로 <strong>상급</strong>에 해당하며, 꾸준히 훈련한 헬스인의 의미 있는 목표선입니다. 다만 체중 100kg인 사람의 500과 60kg인 사람의 500은 상대 근력이 크게 다릅니다 — 그래서 Wilks·DOTS 점수를 함께 보는 것이 정확합니다." },
  { "q": "1RM을 직접 측정하지 않았는데 어떻게 입력하나요?", "a": "실제 1RM 시도는 부상 위험이 크므로, 5회 정도 들 수 있는 무게로 <a href='/tools/sports/one-rm'>1RM 계산기</a>를 이용해 추정한 값을 넣으면 됩니다. 추정 오차는 2~5% 수준이라 레벨 판정에는 충분합니다." },
  { "q": "이 점수가 대회 공식 기록과 같나요?", "a": "Wilks·DOTS 계산식 자체는 공식과 동일하지만, 본 도구는 <strong>참고용 시뮬레이션</strong>입니다. 공식 기록은 심판 판정(스쿼트 깊이·벤치 정지·락아웃 등)을 통과한 시도만 인정되며, 체급·장비(로우바/장비) 구분이 있습니다. 실제 대회 기준과 차이가 있을 수 있습니다." },
]

export default function StrengthLevelPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💪 스트렝스 레벨 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        3대(스쿼트·벤치·데드) 기록으로 <strong style={{ color: 'var(--text)' }}>3대 합·윌크스·DOTS 점수</strong>와 입문~엘리트 레벨을 한 번에.
      </p>

      <StrengthLevelClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      {/* 1. 스트렝스 레벨이란 */}
      <h2 style={sectionTitle}>🏅 스트렝스 레벨이란?</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        스트렝스 레벨은 <strong style={{ color: 'var(--text)' }}>절대 무게가 아니라 체중 대비 상대 근력</strong>으로 내 위치를 가늠하는 지표입니다.
        같은 100kg 벤치라도 체중 60kg과 100kg은 의미가 전혀 다르기 때문에, 체중·성별·연령을 함께 봐야 공정합니다.
        본 도구는 <strong style={{ color: 'var(--text)' }}>입문 → 초보 → 중급 → 상급 → 엘리트</strong> 5단계로 평가합니다.
      </p>

      {/* 2. 3대 운동 레벨 기준표 */}
      <h2 style={sectionTitle}>📊 3대 운동 체중 대비 레벨 기준표</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        20대 남성 기준 (체중 대비 1RM 배수)입니다. 도구에서 성별·연령을 선택하면 자동 보정된 값으로 평가되며,
        <Link href="/tools/sports/one-rm" style={{ color: 'var(--accent)' }}> 1RM 계산기</Link>와 동일한 기준을 사용합니다.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
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
            <tr><td style={cell}>🦵 스쿼트</td><td style={cell}>0.75×</td><td style={cell}>1.25×</td><td style={cell}>1.5×</td><td style={cell}>2.0×+</td></tr>
            <tr><td style={cell}>🏋️ 벤치프레스</td><td style={cell}>0.5×</td><td style={cell}>1.0×</td><td style={cell}>1.25×</td><td style={cell}>1.5×+</td></tr>
            <tr><td style={cell}>💀 데드리프트</td><td style={cell}>1.0×</td><td style={cell}>1.5×</td><td style={cell}>2.0×</td><td style={cell}>2.5×+</td></tr>
            <tr><td style={cell}><strong>3대 합</strong></td><td style={cell}>2.25×</td><td style={cell}>3.75×</td><td style={cell}>4.75×</td><td style={cell}>6.0×+</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        예) 체중 75kg 남성의 3대 합이 281kg이면 3.75배 → <strong style={{ color: 'var(--text)' }}>중급</strong>. 450kg이면 6.0배 → 엘리트입니다.
      </p>

      {/* 3. Wilks vs DOTS */}
      <h2 style={sectionTitle}>🧮 Wilks vs DOTS — 두 점수의 차이</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        두 점수 모두 체중이 다른 사람의 근력을 한 줄로 세우기 위한 <strong style={{ color: 'var(--text)' }}>계수 보정 점수</strong>입니다.
        3대 합(kg)에 체중·성별 기반 계수를 곱해 산출합니다.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>구분</th>
              <th style={headCell}>Wilks</th>
              <th style={headCell}>DOTS</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>도입</td><td style={cell}>1994년 (Robert Wilks)</td><td style={cell}>2019년 전후</td></tr>
            <tr><td style={cell}>특징</td><td style={cell}>오랜 표준, 높은 인지도</td><td style={cell}>최신 데이터로 재보정, 다수 연맹 채택</td></tr>
            <tr><td style={cell}>계산</td><td style={cell}>5차 다항식 계수</td><td style={cell}>4차 다항식 계수</td></tr>
            <tr><td style={cell}>활용</td><td style={cell}>예전 기록·커뮤니티 비교</td><td style={cell}>현행 대회·랭킹</td></tr>
          </tbody>
        </table>
      </div>

      {/* 4. 점수 해석 가이드 */}
      <h2 style={sectionTitle}>🔢 DOTS · Wilks 점수 해석 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        대략적인 해석 기준입니다 (남녀 공통, 점수 자체가 성별 보정을 포함). 절대선이 아니라 <strong style={{ color: 'var(--text)' }}>참고 구간</strong>으로 보세요.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>점수</th>
              <th style={headCell}>해석</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong style={{ color: '#94A3B8' }}>~200</strong></td><td style={cell}>입문~초급 — 기본기 다지는 단계</td></tr>
            <tr><td style={cell}><strong style={{ color: '#0EA5E9' }}>200~300</strong></td><td style={cell}>중급 — 꾸준히 훈련한 일반 헬스인</td></tr>
            <tr><td style={cell}><strong style={{ color: '#EA580C' }}>300~400</strong></td><td style={cell}>상급 — 상위권 동호인</td></tr>
            <tr><td style={cell}><strong style={{ color: '#DC2626' }}>400~500</strong></td><td style={cell}>매우 우수 — 지역 대회 입상권</td></tr>
            <tr><td style={cell}><strong style={{ color: '#9333EA' }}>500+</strong></td><td style={cell}>엘리트급 — 전국·국제 수준</td></tr>
          </tbody>
        </table>
      </div>

      {/* 5. 성별·연령 보정 */}
      <h2 style={sectionTitle}>👥 성별·연령 보정 — 같은 무게라도 평가가 달라집니다</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        레벨 기준은 20대 남성을 기준으로, 여성·고연령일수록 같은 레벨에 더 낮은 절대 무게로 도달하도록 보정합니다
        (<Link href="/tools/sports/one-rm" style={{ color: 'var(--accent)' }}>1RM 계산기</Link>와 동일).
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
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
            <tr><td style={cell}><strong>남성</strong></td><td style={cell}>1.00×</td><td style={cell}>0.95×</td><td style={cell}>0.85×</td><td style={cell}>0.75×</td><td style={cell}>0.65×</td></tr>
            <tr><td style={cell}><strong>여성</strong></td><td style={cell}>0.70×</td><td style={cell}>0.665×</td><td style={cell}>0.595×</td><td style={cell}>0.525×</td><td style={cell}>0.455×</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        이 계수는 레벨 <strong style={{ color: 'var(--text)' }}>기준 무게</strong>에 곱해집니다. Wilks·DOTS 점수는 별도의 공식 다항식으로 계산되어 연령 보정과 무관합니다.
      </p>

      {/* 6. FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />
      {FAQ_LD.map((f, i) => (
        <details key={i} style={faqDetails}>
          <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
          <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
        </details>
      ))}

      {/* 7. 안전·면책 */}
      <h2 style={sectionTitle}>⚠️ 안전 주의사항</h2>
      <div style={{
        background: 'rgba(220, 38, 38, 0.06)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li><strong style={{ color: '#DC2626' }}>실제 1RM 시도는 신중히</strong> — 워밍업 후, 스포터·세이프티를 확보하고 시도하세요. 초보자는 추정값 사용을 권장합니다.</li>
          <li><strong style={{ color: '#DC2626' }}>레벨에 집착하지 마세요</strong> — 본 평가는 참고용이며, 체급·골격·종목 특성에 따라 개인차가 큽니다.</li>
          <li><strong style={{ color: '#DC2626' }}>통증은 즉시 중단</strong> — 관절·허리 통증은 부상 신호입니다. 지속되면 정형외과·스포츠의학과 전문의와 상담하세요.</li>
        </ul>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.7 }}>
          본 도구는 <strong>참고용 시뮬레이션</strong>이며 의학적·코칭 조언이 아닙니다. 레벨 기준·점수는 공개된 표준치를 근사한 추정값으로, 실제 대회 기록과 차이가 있을 수 있습니다.
        </p>
      </div>

      {/* 8. 관련 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>최대 중량 추정 + 훈련 중량표</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체질량지수·체지방률 추정</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>증량·감량 칼로리 기준</div>
        </Link>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>유산소·컨디셔닝 병행</div>
        </Link>
      </div>
    </div>
  )
}
