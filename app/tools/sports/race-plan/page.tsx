import Link from 'next/link'
import RacePlanClient from './RacePlanClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import { PACE_TABLE, fmtPace } from './racePlanUtils'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/race-plan',
  title: '레이스 페이스 플래너 — 구간별 페이스·코스 고도 반영·통과 예상 시각',
  description: '마라톤·하프 구간별 목표 페이스를 짜고 코스 고저(고도)를 입력하면 언덕 보정·예상 완주 시간·지점별 통과 시각까지. 균등·네거티브 스플릿 자동 분배.',
  keywords: [
    '레이스 페이스 플래너', '마라톤 페이스 분배', '구간별 페이스', '네거티브 스플릿', '페이스 전략',
    '마라톤 완주 시간 계산', '코스 고도 페이스', '오르막 페이스', '통과 예상 시각', '스플릿 계획',
    '하프 마라톤 페이스', 'GAP 페이스', '레이스 데이 플랜', '페이스 밴드',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px', fontWeight: 700, marginBottom: '14px',
}

const FAQ_LD = [
  { q: '구간 페이스만 넣으면 완주 시간이 정확한가요?',
    a: '입력한 페이스를 그대로 유지한다는 가정의 계산값입니다(페이스 × 거리 합산). 실제로는 누적 피로·기온·습도·노면·보급에 따라 후반이 느려지는 경향(positive drift)이 있어 참고용으로 보세요. 코스 고도를 입력하면 언덕에 의한 차이를 어느 정도 반영할 수 있습니다.' },
  { q: '왜 네거티브 스플릿을 권장하나요?',
    a: '대부분의 개인 최고기록이 후반을 더 빠르게 뛴 네거티브 스플릿에서 나옵니다. 초반 과속은 글리코겐 조기 고갈·후반 급감속(벽)의 가장 흔한 원인입니다. 본 도구의 네거티브 전략은 기준 페이스 기준 앞을 살짝 느리게(+3%)·뒤를 빠르게(−3%) 대칭 분배해 구간 평균이 기준과 같도록 합니다.' },
  { q: '고도(언덕) 보정은 얼마나 정확한가요?',
    a: '추정치입니다. 흔한 코칭 경험칙과 Strava GAP·Minetti의 경사 에너지 곡선을 단순화해 <strong>오르막 1%당 약 +12초/km, 내리막 1%당 약 −6초/km</strong>로 가감합니다. 실제 손실/이득은 경사 길이·노면·개인 능력·피로도에 따라 크게 다르므로, 자동 보정으로 채운 뒤 구간을 직접 조정하는 것을 권장합니다.' },
  { q: '고도는 어떻게 입력하나요?',
    a: '[코스 고도 입력]을 켜고 각 km 지점의 고도(해발 m)를 넣으면, 직전 지점과의 차이로 구간 경사(%)·총 상승/하강이 자동 계산됩니다. 대회 코스맵의 고도 프로파일에서 km 단위 고도를 읽어 입력하면 됩니다. [고도로 페이스 자동 보정]을 켜고 전략 버튼을 누르면 언덕이 페이스에 반영됩니다.' },
  { q: '풀코스는 왜 42.195km인가요?',
    a: '1908년 런던 올림픽에서 왕실 관람을 위해 코스를 늘린 거리가 표준이 되었습니다. 본 도구는 마지막 0.195km(하프는 0.0975km)를 별도 구간으로 정확히 반영해 완주 시간을 계산합니다.' },
  { q: '통과 예상 시각은 어디에 쓰나요?',
    a: '[출발 시각]을 넣으면 5K·10K·하프·완주 지점을 몇 시 몇 분에 통과하는지 시계 시각으로 보여줍니다. 가족·페이서가 응원 지점에서 기다리거나 미팅을 잡을 때 유용합니다.' },
  { q: '트레드밀이나 트랙에서도 쓸 수 있나요?',
    a: '페이스(분:초/km) 기반이라 그대로 사용 가능합니다. 트레드밀은 외부 변수가 없어 페이스가 안정적이며, 실외 환산 시 1% 경사를 더하는 것이 일반적입니다. 트랙 인터벌 계획에도 구간별 페이스 입력으로 활용할 수 있습니다.' },
]

export default function RacePlanPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />레이스 페이스 플래너
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        구간별 목표 페이스를 짜고 <strong style={{ color: 'var(--text)' }}>코스 고도</strong>를 입력하면 언덕 보정·예상 완주 시간·지점별 <strong style={{ color: 'var(--text)' }}>통과 시각</strong>까지.
      </p>

      <RacePlanClient />

      <GuideDivider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '52px' }}>

        {/* 1. 사용법 */}
        <section>
          <h2 style={sectionTitle}>3단계 사용법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '거리·기준 페이스 선택', d: '5K·10K·하프·풀 또는 직접 거리를 고르고, 목표 평균 페이스(분:초/km)를 입력합니다.' },
              { n: '②', t: '전략으로 자동 분배', d: '균등·네거티브·포지티브 중 하나를 누르면 구간별 페이스가 자동으로 채워집니다. 이후 특정 구간만 직접 조정 가능.' },
              { n: '③', t: '(선택) 코스 고도 입력', d: '언덕이 있는 코스라면 각 km 고도를 넣어 경사·상승/하강을 반영하고, 자동 보정으로 언덕 페이스를 추정합니다.' },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{x.n}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{x.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 전략 */}
        <section>
          <h2 style={sectionTitle}>페이스 분배 전략</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '균등 (Even)', c: '#0891B2', d: '처음부터 끝까지 같은 페이스. 가장 단순하고 에너지 분배가 안정적. 평지 코스·입문자에게 무난.' },
              { t: '네거티브 (권장)', c: '#059669', d: '후반을 앞보다 빠르게. 초반을 아껴 후반 가속 — 대부분의 PB가 이 방식. 기록 도전에 가장 유리.' },
              { t: '포지티브', c: '#EA580C', d: '초반을 빠르게. 컨디션이 좋거나 내리막 시작 코스에 한정. 후반 급감속(벽) 위험이 커 일반적으로 비권장.' },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${x.c}55`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: x.c, marginBottom: '6px' }}>{x.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 고도와 페이스 */}
        <section>
          <h2 style={sectionTitle}>코스 고도와 페이스</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            언덕은 페이스에 직접적인 영향을 줍니다. 본 도구는 각 구간의 경사를 추정해 페이스를 가감합니다 — <strong style={{ color: 'var(--text)' }}>오르막 1%당 약 +12초/km, 내리막 1%당 약 −6초/km</strong>(흔한 코칭 경험칙 + Strava GAP·Minetti 경사 비용 곡선을 단순화한 추정치).
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.3)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              ⚠️ <strong>추정의 한계</strong> — 실제 언덕 손실/이득은 경사가 이어지는 길이, 노면(트레일·아스팔트), 개인 능력, 누적 피로에 따라 크게 달라집니다. 가파른 내리막은 오히려 근육 손상으로 이득이 줄거나 손해가 되기도 합니다. <strong>자동 보정은 출발점일 뿐</strong>, 코스를 잘 안다면 구간을 직접 조정하세요.
            </p>
          </div>
        </section>

        {/* 4. 목표 시간별 페이스 */}
        <section>
          <h2 style={sectionTitle}>완주 목표 시간별 필요 페이스 (균등 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>풀코스 목표</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>필요 페이스</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>하프 목표</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>필요 페이스</th>
                </tr>
              </thead>
              <tbody>
                {PACE_TABLE.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.full}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{fmtPace(r.fullPace)}/km</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.half}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{fmtPace(r.halfPace)}/km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            ※ 풀코스 3:00 ≈ 하프 1:30과 같은 페이스(4:16/km)지만, 실제로는 거리가 길수록 페이스가 느려지는 게 정상입니다. 과거 기록으로 거리별 예상 시간을 보려면 <Link href="/tools/sports/race-predictor" style={{ color: 'var(--accent)' }}>마라톤 기록 계산기</Link>를 함께 쓰세요.
          </p>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((item, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {item.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: item.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 면책 */}
        <div style={{ background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            본 도구의 결과는 <strong style={{ color: 'var(--text)' }}>참고용 추정</strong>입니다. 실제 기록은 컨디션·기온·습도·코스·보급·페이싱 실행력에 따라 달라지며, 고도 보정은 단순화한 모델입니다. 무리한 페이스는 부상·탈진 위험이 있으니 본인 수준에 맞게 계획하세요.
          </p>
        </div>

        {/* 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/pace',           emoji: '🏃', name: '러닝 페이스 계산기', desc: '페이스 ↔ 완주 시간·스플릿' },
              { href: '/tools/sports/race-predictor', emoji: '🏅', name: '마라톤 기록 계산기', desc: '기록으로 거리별 예상 시간' },
              { href: '/tools/sports/buildup',        emoji: '📈', name: '러닝 빌드업 계산기', desc: '프로그레시브 훈련 페이스표' },
              { href: '/tools/sports/vo2max',         emoji: '🫁', name: 'VO₂ Max 계산기',     desc: '심폐 체력·훈련 페이스 추정' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
