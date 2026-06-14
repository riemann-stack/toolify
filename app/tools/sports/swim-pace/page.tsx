import Link from 'next/link'
import SwimPaceClient from './SwimPaceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'

export const metadata = buildMetadata({
  path: '/tools/sports/swim-pace',
  title: '수영 페이스·SWOLF 계산기 — 100m 페이스·풀 환산·인터벌 send-off',
  description: '100m 페이스 ↔ 총기록 양방향, 25m·50m 풀 왕복수 환산, SWOLF·send-off·영법별 예상기록까지 한 화면에서.',
  keywords: ['수영페이스계산기', '스월프계산기', '100m페이스', '수영인터벌', '단수장수환산', '수영send off', '수영예상기록'],
})

const FAQ_LD = [
  { q: '수영 페이스는 어떤 단위로 읽나요?',
    a: '수영은 보통 <strong>100m당 시간</strong>으로 페이스를 말합니다. &ldquo;1:45 페이스&rdquo;는 100m를 1분 45초에 간다는 뜻입니다. 본 도구는 모든 입력을 100m당 초로 정규화해 계산하므로, 200m·400m처럼 거리가 달라도 같은 기준으로 비교됩니다. 25m 1바퀴 기록만 알 때는 그 시간을 4배 하면 대략 100m 페이스가 됩니다.' },
  { q: '1500m는 25m 풀과 50m 풀에서 각각 몇 바퀴인가요?',
    a: '왕복수 = 총거리 ÷ 풀 길이입니다.<br/>• <strong>25m 단수(SC)</strong>: 1500 ÷ 25 = <strong>60바퀴</strong><br/>• <strong>50m 장수(LC)</strong>: 1500 ÷ 50 = <strong>30바퀴</strong><br/>본 도구의 풀 길이 토글을 바꾸면 같은 거리의 왕복수가 자동으로 다시 계산됩니다. 거리 칸과 왕복수 칸은 서로 동기화되어 한쪽만 바꿔도 됩니다.' },
  { q: 'SWOLF 점수는 어떻게 계산하고 무엇을 의미하나요?',
    a: 'SWOLF는 <strong>한 바퀴(보통 25m) 소요 초 + 그 바퀴의 스트로크 수</strong>를 더한 값입니다. 예를 들어 25m를 20초에, 18번 저어 갔다면 SWOLF는 38입니다. 시간과 동작 수를 함께 보기 때문에 <strong>낮을수록 효율적</strong>이라고 해석합니다. 다만 키·팔 길이·영법에 따라 적정 스트로크 수가 달라 절대 등급표는 의미가 약합니다. 같은 사람이 같은 풀에서 추이를 보는 용도로 쓰는 편이 낫습니다.' },
  { q: '인터벌 보내기시간(send-off)은 어떻게 정하나요?',
    a: 'send-off는 <strong>목표 구간기록 + 휴식 시간</strong>으로 정한 출발 간격입니다. 예를 들어 100m를 1:40에 돌고 20초 쉬려면 send-off는 2:00이 됩니다. 시계가 2:00이 될 때마다 다음 100m를 출발하는 식입니다. 구간기록이 빨라지면 같은 send-off에서 휴식이 늘어나므로, 휴식을 일정하게 유지하려면 send-off도 함께 줄여야 합니다.' },
  { q: '영법마다 같은 거리 기록이 왜 다른가요?',
    a: '자유형이 가장 빠르고, 보통 접영 ≈ 자유형 부근, 배영·평영 순으로 느려집니다. 본 도구는 자유형 속도를 1로 두고 배영 0.9·평영 0.78·접영 0.92라는 <strong>통용 추정 계수</strong>로 예상기록을 환산합니다. 이 값은 검증된 상수가 아니라 대략적인 참고치입니다. 평영은 글라이드 비중이 커 개인차가 특히 크고, 거리가 길어질수록 영법 간 차이도 달라집니다.' },
  { q: '단수(25m)와 장수(50m)는 기록이 얼마나 차이 나나요?',
    a: '벽을 더 자주 차고 도는 25m 풀이 일반적으로 더 빠릅니다. 흔히 <strong>100m당 약 2~4초</strong> 차이가 난다고 말하지만, 이는 폭넓은 범위 추정일 뿐 단일 계수로 환산할 수 없습니다. 턴·잠영 실력, 거리, 영법에 따라 차이가 크게 벌어지거나 거의 없을 수도 있습니다. 본 도구는 단일 공식 대신 범위로만 안내합니다.' },
]

const sec = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' } as const
const lead = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' } as const

export default function SwimPacePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏊 수영 페이스·SWOLF 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        100m 페이스 ↔ 총기록을 양방향으로 환산하고, <strong style={{ color: 'var(--text)' }}>25m·50m 풀 왕복수</strong>·SWOLF·인터벌 send-off를 한 화면에서 확인합니다.
      </p>

      <SwimPaceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 페이스 읽는 법 */}
        <div>
          <h2 style={sec}>수영 페이스 읽는 법</h2>
          <p style={lead}>
            수영 페이스는 <strong style={{ color: 'var(--text)' }}>100m당 시간</strong>이 기준입니다. &ldquo;1:45&rdquo;는 100m를 1분 45초에 간다는 뜻이고, 이 페이스를 유지하면 200m는 3:30, 400m는 7:00이 됩니다. 거리에 비례해 단순히 곱하면 됩니다.
          </p>
          <p style={lead}>
            25m 1바퀴 기록만 잴 때는 그 시간을 4배 하면 대략 100m 페이스입니다. 다만 실제로는 출발·턴 구간이 빨라 긴 거리일수록 100m당 시간이 조금씩 늘어납니다. 본 도구의 거리별 예상기록 표는 페이스를 그대로 유지한다는 가정이므로, 후반 페이스 저하는 별도로 감안하세요.
          </p>
        </div>

        {/* 2. 단수 vs 장수 */}
        <div>
          <h2 style={sec}>단수(SC)와 장수(LC)의 차이</h2>
          <p style={lead}>
            <strong style={{ color: 'var(--text)' }}>단수(Short Course)</strong>는 25m 풀, <strong style={{ color: 'var(--text)' }}>장수(Long Course)</strong>는 50m 풀입니다. 같은 1500m라도 25m 풀에서는 60바퀴, 50m 풀에서는 30바퀴를 돕니다. 국내 일반 수영장 대부분이 25m이고, 50m는 정규 경기장·일부 센터에 있습니다.
          </p>
          <div className="tableScroll" style={{ borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>25m 단수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>50m 장수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['100m', '4바퀴', '2바퀴'],
                  ['400m', '16바퀴', '8바퀴'],
                  ['800m', '32바퀴', '16바퀴'],
                  ['1500m', '60바퀴', '30바퀴'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--bg2)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...lead, marginTop: 16, marginBottom: 0 }}>
            벽을 더 자주 차고 도는 25m 풀이 보통 빠릅니다. 통상 <strong style={{ color: 'var(--text)' }}>100m당 2~4초</strong> 차이로 말하지만 턴·잠영 실력에 따라 폭이 크니, 두 풀 기록을 비교할 땐 범위로만 보세요.
          </p>
        </div>

        {/* 3. SWOLF */}
        <div>
          <h2 style={sec}>SWOLF 계산과 해석</h2>
          <p style={lead}>
            SWOLF는 swim과 golf의 합성어로, <strong style={{ color: 'var(--text)' }}>한 바퀴 소요 초 + 스트로크 수</strong>입니다. 25m를 20초에, 18번 저어 갔다면 SWOLF는 38. 시간과 동작 수를 같이 보기 때문에 같은 시간이라도 적게 저은 쪽이 효율적이라고 봅니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={{ color: 'var(--text)' }}>낮을수록 효율적</strong> — 같은 속도면 스트로크가 적은 쪽, 같은 스트로크면 빠른 쪽이 유리</li>
            <li>스트로크만 줄이려고 무리하면 속도가 떨어져 SWOLF는 오히려 나빠질 수 있음</li>
            <li>키·팔 길이·영법에 따라 적정값이 달라 <strong style={{ color: 'var(--text)' }}>절대 등급표는 참고만</strong></li>
            <li>같은 사람이 같은 풀에서 측정한 <strong style={{ color: 'var(--text)' }}>추이</strong>를 보는 것이 가장 쓸모 있음</li>
          </ul>
        </div>

        {/* 4. 인터벌 send-off */}
        <div>
          <h2 style={sec}>인터벌 보내기시간(send-off)</h2>
          <p style={lead}>
            send-off는 다음 반복을 출발하는 간격입니다. <strong style={{ color: 'var(--text)' }}>목표 구간기록 + 휴식 = 출발 간격</strong>. 100m를 1:40에 돌고 20초 쉬려면 시계가 2:00마다 출발하면 됩니다. &ldquo;100m × 10, send-off 2:00&rdquo;처럼 적습니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li>구간기록이 빨라지면 같은 send-off에서 휴식이 자동으로 늘어남</li>
            <li>휴식을 일정하게 유지하려면 빨라진 만큼 send-off도 줄여야 함</li>
            <li>지구력 세트는 휴식 10~20초로 짧게, 스피드 세트는 길게 잡아 회복을 확보</li>
            <li>send-off를 못 맞춰 계속 늦어지면 그 세트는 너무 빠른 것 — 목표를 낮추기</li>
          </ul>
        </div>

        {/* 5. 영법별 속도차·전략 */}
        <div>
          <h2 style={sec}>영법별 속도차와 전략</h2>
          <p style={lead}>
            자유형이 가장 빠르고 접영이 그 부근, 배영·평영이 뒤를 잇습니다. 본 도구는 자유형을 1로 두고 <strong style={{ color: 'var(--text)' }}>배영 0.9·평영 0.78·접영 0.92</strong> 계수로 예상기록을 환산하는데, 이는 검증된 상수가 아니라 대략적인 참고치입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '자유형', d: '가장 빠르고 장거리에 효율적. 페이스 기준 영법으로 삼기 좋음.' },
              { t: '접영', d: '단거리는 자유형에 근접하지만 체력 소모가 커 길어지면 급격히 느려짐.' },
              { t: '배영', d: '자유형보다 약간 느린 수준. 호흡이 자유로워 페이스 유지엔 유리.' },
              { t: '평영', d: '글라이드 비중이 커 개인차가 가장 큼. 추정 계수의 오차도 제일 큼.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            계수는 종목 통념을 단순화한 값입니다. 본인 기록을 영법별로 직접 재서 비교하면 훨씬 정확합니다.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 함께 쓰면 좋은 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔완주 시간·구간 스플릿' },
              { href: '/tools/sports/interval-training', icon: '🏃‍♂️', name: '인터벌 훈련 계산기', desc: 'VDOT·인터벌 페이스·훈련 스케줄' },
              { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량(BMR) 계산기', desc: '운동 하루 칼로리 소비 추정' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
