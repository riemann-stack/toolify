import Link from 'next/link'
import Nesin5GradeClient from './Nesin5GradeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/edu/nesin-5grade',
  title: '내신 5등급제 계산기 — 석차·이수단위 가중 평균',
  description: '2025학년도 고1부터 적용되는 내신 5등급제 계산기. 과목별 석차·재적수·이수단위로 5등급 가중 평균과 구 9등급 환산을 동시에 계산. 등급 구간표 포함.',
  keywords: [
    '내신 계산기', '5등급제 계산기', '내신 5등급제 비율', '고교학점제 내신',
    '9등급 5등급 환산', '2027 대입 내신', '석차 등급 계산', '내신 평균',
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
    q: '내신 5등급제는 언제부터인가요?',
    a: '<strong>2025학년도 고등학교 1학년부터</strong> 적용됩니다. 즉 2025년에 고1이 된 학생(2027학년도 대입 대상)부터 기존 9등급제 대신 5등급제로 성적이 산출됩니다. 고2·고3(2024년 이전 고1)은 종전 9등급제를 유지합니다. 5등급제는 고교학점제 전면 시행과 함께 도입되었습니다.',
  },
  {
    q: '5등급제 비율은 어떻게 되나요?',
    a: '상대평가 누적 비율로 <strong>1등급 상위 10%, 2등급 34%, 3등급 66%, 4등급 90%, 5등급 100%</strong>입니다. 구간별로는 1등급 10%·2등급 24%·3등급 32%·4등급 24%·5등급 10%로, 가운데(3등급)가 가장 넓습니다. 특히 <strong>1등급이 기존 4%에서 10%로 크게 넓어져</strong> 상위권 변별이 어려워졌다는 평가가 있습니다.',
  },
  {
    q: '내신 평균은 어떻게 계산하나요?',
    a: '과목별 등급에 <strong>이수단위(학점)를 가중치로 곱해 평균</strong>을 냅니다. 예를 들어 국어(4단위) 1등급, 수학(4단위) 3등급, 영어(3단위) 2등급이면 (1×4 + 3×4 + 2×3) ÷ (4+4+3) = 22 ÷ 11 = <strong>2.0등급</strong>입니다. 단위 수가 큰 주요 과목이 평균에 더 크게 반영됩니다. 위 계산기에 과목을 추가해 자동으로 확인할 수 있습니다.',
  },
  {
    q: '9등급으로 환산하면 몇 등급인가요?',
    a: '같은 석차 백분율을 <strong>9등급 기준(1:4%·2:11%·3:23%·4:40%·5:60%·…)</strong>으로 다시 계산하면 됩니다. 예를 들어 석차 상위 8%는 5등급제에선 1등급이지만 9등급제에선 2등급입니다. 다만 5등급과 9등급은 구간이 달라 <strong>단순 1:1 대응이 아니며</strong>, 대학 반영 방식도 다르므로 환산값은 참고용으로만 보세요. 위 계산기가 두 값을 나란히 보여줍니다.',
  },
  {
    q: '성취도 A~E는 등급과 다른가요?',
    a: '네, 완전히 다릅니다. <strong>등급(1~5)은 다른 학생과 비교하는 상대평가</strong>이고, <strong>성취도(A~E)는 원점수 기준의 절대평가</strong>입니다(A 90%↑·B 80%↑·C 70%↑·D 60%↑·E 60% 미만). 5등급제에서는 대부분 과목이 <strong>등급과 성취도를 함께 표기</strong>합니다. 즉 같은 1등급이라도 성취도가 A일 수도, B일 수도 있습니다.',
  },
  {
    q: '2028 대입에는 어떻게 반영되나요?',
    a: '2028학년도 대입(현재 고1이 치르는 수능)부터 5등급제 내신과 통합·융합형 수능이 적용됩니다. 대학마다 <strong>내신 등급 반영 방식·과목별 가중치</strong>가 달라 아직 세부안이 확정·발표되는 중입니다. 이 계산기의 가중 평균은 <strong>단위 수 기준의 일반적 산출</strong>로, 실제 대학별 환산점수와는 다를 수 있으니 지원 대학의 요강을 확인하세요.',
  },
]

const RELATED = [
  { href: '/tools/edu/gpa-converter', icon: '🎓', name: '학점(GPA) 환산기', desc: '4.5↔4.0↔영국 등급' },
  { href: '/tools/edu/review-interval', icon: '🔁', name: '복습 간격 계산기', desc: '망각곡선 복습 주기' },
  { href: '/tools/edu/cognitive-test', icon: '🧠', name: '인지 능력 테스트', desc: '반응속도·기억력' },
  { href: '/tools/finance/housing-score', icon: '🏠', name: '청약 가점 계산기', desc: '84점 만점 자동' },
  { href: '/tools/date/dday', icon: '📅', name: 'D-Day 계산기', desc: '수능·시험 D-Day' },
  { href: '/tools/life/random', icon: '🎲', name: '랜덤 추첨기', desc: '발표·자리 뽑기' },
]

export default function Nesin5GradePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="edu" />내신 5등급제 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        2025 고1부터 적용되는 <strong style={{ color: 'var(--text)' }}>내신 5등급 가중 평균</strong> + 구 9등급 환산. 석차·재적수·이수단위만 입력.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="교육부 2028 대입제도 개편·고교학점제 5등급 상대평가 기준"
        sources={[
          { label: '교육부', href: 'https://www.moe.go.kr' },
        ]}
      />

      <Nesin5GradeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 style={sectionTitle}>내신 등급·평균 계산 방식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>석차 백분율</span> = 석차 ÷ 재적수 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>등급</span> = 백분율이 속한 누적 구간</div>
            <div><span style={{ color: 'var(--muted)' }}>평균 내신</span> = Σ(등급 × 이수단위) ÷ Σ이수단위</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 국어 4단위 1등급, 수학 4단위 3등급, 영어 3단위 2등급<br />
            • (1×4 + 3×4 + 2×3) ÷ (4+4+3) = 22 ÷ 11 = <strong style={{ color: 'var(--accent)' }}>2.0등급</strong>
          </div>
        </section>

        {/* 2. 5 vs 9 구간 비교 표 */}
        <section>
          <h2 style={sectionTitle}>5등급 vs 9등급 구간 비교</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['5등급', '누적 비율', '구간', '≈ 9등급'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1등급', '상위 10%', '10%', '1~2등급'],
                  ['2등급', '10 ~ 34%', '24%', '3~4등급'],
                  ['3등급', '34 ~ 66%', '32%', '4~5등급'],
                  ['4등급', '66 ~ 90%', '24%', '6~7등급'],
                  ['5등급', '90 ~ 100%', '10%', '8~9등급'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 9등급 대응은 대략적 범위입니다. 5등급 1등급(상위 10%)은 9등급으로는 1등급(4%)과 2등급(11%)에 걸쳐 있어 단순 1:1 대응이 아닙니다.
          </p>
        </section>

        {/* 3. 성취도 A~E */}
        <section>
          <h2 style={sectionTitle}>등급(상대) vs 성취도(절대) A~E</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>📊 등급 (1~5, 상대평가)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>다른 학생 대비 석차로 결정</li>
                <li>누적 비율 10·34·66·90·100%</li>
                <li>내신 평균·대입 반영의 핵심</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>🅰️ 성취도 (A~E, 절대평가)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>원점수(성취율) 기준</li>
                <li>A 90%↑ · B 80%↑ · C 70%↑ · D 60%↑ · E 60% 미만</li>
                <li>등급과 함께 학생부에 병기</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
