import Link from 'next/link'
import HyroxClient from './HyroxClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/sports/hyrox',
  title: '하이록스(HYROX) 계산기 — 완주 시간 예측·목표 페이스·부문별 중량',
  description:
    '하이록스 완주 시간 예측 + 목표 시간 역산 + 부문별(Open/Pro·남녀) 중량·규격을 한 번에. 8km 런 + 8개 스테이션 + 록스존 페이싱 전략 계산기.',
  keywords: [
    '하이록스 계산기', 'HYROX 계산기', '하이록스 완주시간', '하이록스 페이스',
    '하이록스 중량', '하이록스 Open Pro', '하이록스 스테이션', '하이록스 기록 예측',
    'SkiErg', '월볼', '썰매밀기', '하이록스 입문',
  ],
})

const h2: React.CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }

export default function HyroxPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏋️ 하이록스(HYROX) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        8km 런 + 8개 스테이션 + 록스존을 합쳐 <strong style={{ color: 'var(--text)' }}>완주 시간을 예측</strong>하고,
        목표 시간에 필요한 런 페이스를 역산하며, <strong style={{ color: 'var(--text)' }}>부문별 중량·규격</strong>까지 한 곳에서 확인하세요.
      </p>

      <HyroxClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 하이록스란 */}
        <section>
          <h2 style={h2}>하이록스(HYROX)란?</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            하이록스는 <strong style={{ color: 'var(--text)' }}>1km 달리기와 기능성 운동(스테이션)을 8번 번갈아 수행</strong>하는 실내 피트니스 레이스입니다.
            전 세계 동일한 규격·중량으로 진행돼 기록을 직접 비교할 수 있는 것이 특징이며, 마라톤처럼 「완주」 자체가 목표가 되는 대중 종목으로 빠르게 성장하고 있습니다.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            총 거리는 <strong style={{ color: 'var(--text)' }}>달리기 8km + 8개 스테이션</strong>, 그리고 운동 사이를 이동·전환하는 <strong style={{ color: 'var(--text)' }}>록스존(RoxZone)</strong>까지 모두 기록에 포함됩니다.
          </p>
        </section>

        {/* 2. 진행 순서 */}
        <section>
          <h2 style={h2}>경기 진행 순서 (런 → 스테이션 8회 반복)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>순서</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>스테이션</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>규격</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['① 런 ', '스키에르그 (SkiErg)', '1,000m'],
                    ['② 런 ', '썰매 밀기 (Sled Push)', '50m'],
                    ['③ 런 ', '썰매 끌기 (Sled Pull)', '50m'],
                    ['④ 런 ', '버피 브로드 점프', '80m'],
                    ['⑤ 런 ', '로잉 (Rowing)', '1,000m'],
                    ['⑥ 런 ', '파머스 캐리', '200m'],
                    ['⑦ 런 ', '샌드백 런지', '100m'],
                    ['⑧ 런 ', '월 볼 (Wall Balls)', '100/75회'],
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r[0]}<span style={{ color: '#CA8A04', fontWeight: 700 }}>1km</span></td>
                      <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 매 스테이션 직전에 1km 달리기가 들어가므로 런은 총 8회(8km)입니다. 월 볼은 남자 100회·여자 75회.
          </p>
        </section>

        {/* 3. 부문 */}
        <section>
          <h2 style={h2}>참가 부문 (Division)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'Open', d: '입문·일반. 표준 중량. 가장 많이 참가하는 부문.', c: '#0EA5E9' },
              { t: 'Pro', d: '고중량 부문. 썰매·런지·월볼 중량이 더 무겁습니다.', c: '#DC2626' },
              { t: 'Doubles (2인)', d: '둘이 한 팀으로 스테이션 작업을 분담. 런은 함께.', c: '#059669' },
              { t: 'Relay (4인)', d: '4명이 코스를 나눠 이어 달리는 릴레이 방식.', c: '#9333EA' },
            ].map((x, i) => (
              <div key={i} style={{ ...card, borderLeft: `4px solid ${x.c}` }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: x.c, marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 기록 단축 팁 */}
        <section>
          <h2 style={h2}>기록 단축 핵심 포인트</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '런이 곧 기록이다', d: '완주 시간의 절반 가까이가 달리기. 스테이션 후 무거운 다리로도 페이스를 유지하는 「컴파운드 러닝」 훈련이 핵심.' },
              { t: '월 볼 = 마지막 함정', d: '체력이 바닥난 상태의 100회. 폼 무너지면 노렙(no-rep). 평소 50회 연속 + 호흡 리듬을 연습.' },
              { t: '썰매는 자세·각도', d: '낮은 자세로 다리로 밀고, 멈추지 않고 짧은 보폭으로. 그립·신발 마찰이 시간을 가른다.' },
              { t: '록스존을 줄여라', d: '전환 8회 합이 의외로 크다. 동선·장비 세팅을 미리 그려두면 수십 초 절약.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 5. FAQ */}
        <section>
          <h2 style={h2}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                q: '하이록스 완주 시간은 보통 얼마나 걸리나요?',
                a: '개인전(Open) 기준 대략 <strong>엘리트 55~65분, 상급 70~80분, 중급 85~95분, 입문 100~120분</strong>입니다. 완주 자체가 목표라면 시간 제한은 사실상 없으며, 처음에는 90분~2시간을 잡고 페이싱하는 경우가 많습니다.',
              },
              {
                q: '이 계산기의 예상 시간은 정확한가요?',
                a: '스테이션 시간은 <strong>개인 편차가 매우 커서</strong> 레벨 기본값은 일반 참고 추정치입니다. 가장 정확하게 쓰려면 본인의 연습 기록(스키에르그·로잉·월볼 등)을 직접 입력하세요. 런 페이스도 「스테이션 직후의 지친 다리」 기준으로 평소보다 보수적으로 잡는 것이 현실적입니다.',
              },
              {
                q: 'Open과 Pro의 차이는 무엇인가요?',
                a: '운동 종류·순서는 같지만 <strong>중량이 다릅니다</strong>. 예) 썰매 밀기 Open 남 152kg → Pro 남 202kg, 월 볼 Open 남 6kg → Pro 남 9kg. 거리·횟수(런 8km, 월볼 100회 등)는 동일합니다. 입문이라면 Open으로 시작하는 것이 일반적입니다.',
              },
              {
                q: '록스존(RoxZone)이 뭔가요?',
                a: '런과 스테이션 사이를 <strong>이동·전환하는 구간</strong>으로, 그 시간도 전부 기록에 포함됩니다. 전환이 8번 있어 합치면 수 분에 달하므로, 동선과 장비 세팅을 미리 익혀 두면 의외로 큰 시간을 아낄 수 있습니다.',
              },
              {
                q: '런과 스테이션 중 어디에 더 집중해야 하나요?',
                a: '완주 시간에서 <strong>달리기가 차지하는 비중이 가장 큽니다</strong>(엘리트일수록 더 큼). 본 계산기의 「시간 비중」 막대로 본인 비중을 확인하고, 런 비중이 크면 컴파운드 러닝을, 스테이션 비중이 크면 근지구력·테크닉을 보강하세요.',
              },
            ].map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={h2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스 ↔ 완주 시간 환산' },
              { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
              { href: '/tools/sports/interval-training', icon: '🏃‍♂️', name: '인터벌 훈련 계산기', desc: '런 스피드 강화' },
              { href: '/tools/sports/one-rm', icon: '🏋️', name: '1RM 계산기', desc: '근력 훈련 최대 중량' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
