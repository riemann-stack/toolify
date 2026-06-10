import Link from 'next/link'
import HyroxClient from './HyroxClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

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

const FAQ_LD = [
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
              {
                q: '더블스(Doubles)는 어떻게 진행되나요?',
                a: '2인 1팀(남자·여자·혼성) 형식으로, 공식 규정상 <strong>1km 달리기는 두 명이 전 구간을 함께</strong> 뛰어야 합니다(한 명이 앞서가면 1분 페널티, 「함께 달리기」 페널티가 3회를 넘으면 랭킹 제외). 스테이션은 두 명이 함께 입장·퇴장하되, 작업량은 「You go, I go」 방식으로 한 명이 수행하는 동안 다른 한 명이 쉬며 자유롭게 분담합니다. 서로 약한 종목을 상대가 더 맡는 분담 전략이 핵심입니다. (HYROX 공식 더블스 룰북 시즌 25/26 기준)',
              },
              {
                q: '더블스와 릴레이(Relay)의 차이는 무엇인가요?',
                a: '<strong>더블스는 2인이 런 8km 전부를 함께 뛰고</strong> 스테이션 작업만 나누는 반면, <strong>릴레이는 4인이 코스를 나눠</strong> 한 명당 1km 런 2회 + 해당 스테이션 2개씩 수행합니다. 두 부문 모두 남자·여자·혼성 팀으로 참가할 수 있어, 풀코스가 부담스러운 입문자는 릴레이 → 더블스 → 개인전 순서로 단계를 밟는 경우가 많습니다. (HYROX 공식 릴레이 룰북 시즌 25/26 기준)',
              },
              {
                q: '첫 출전 준비물과 당일 체크리스트가 궁금해요.',
                a: '공식 규정상 <strong>등록은 hyrox.com에서만</strong> 가능하며 대회 당일 만 16세 이상이어야 합니다. 당일 체크리스트: ① 발목 타이밍 칩 착용(미착용 시 기록 무효) ② 본인 스타트 웨이브 시간 엄수(임의 변경 시 실격) ③ 급수대 물은 음용 전용(몸에 부으면 페널티) ④ 장비·레인은 크루가 배정(임의 선택 불가). 개인 준비물은 접지력 좋은 러닝화, 가벼운 운동복, 에너지젤·전해질 보급 정도면 충분합니다.',
              },
              {
                q: '하이록스 준비에는 훈련 기간이 얼마나 필요한가요?',
                a: '정해진 공식 기준은 없으며 본인의 체력 베이스에 따라 크게 다릅니다. 일반적인 지구력 종목 훈련 원칙처럼 <strong>주 3~5회 훈련을 수 개월에 걸쳐 점진적으로</strong> 쌓는 것이 무난하며, 핵심 구성은 ① 런 베이스(주 2~3회) ② 스테이션 근지구력(썰매·월볼·로잉) ③ 「런+스테이션」을 이어 붙이는 컴파운드 시뮬레이션입니다. 부상 이력이 있거나 운동 경험이 적다면 전문가와 상담 후 시작하는 것이 안전합니다.',
              },
            ]

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

        {/* 한국 하이록스 현황 */}
        <section>
          <h2 style={h2}>한국 하이록스 현황 (2026년 6월 기준)</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            하이록스는 <strong style={{ color: 'var(--text)' }}>2024년 2월 인천 송도컨벤시아에서 국내 최초로 개최</strong>된 이후 매년 규모가 빠르게 커지고 있습니다.
            2025년 11월에는 서울 코엑스에서 첫 서울 대회가 열렸고(참가자의 약 22%가 외국인), 2026년 5월 인천 대회는 국내 최초로 3일간 진행될 만큼 성장했습니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>대회</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>일정 · 장소</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>규모</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['하이록스 인천 2024', '2024년 2월 · 송도컨벤시아', '1,068명 (국내 첫 개최)'],
                    ['하이록스 인천 2025', '2025년 5월 · 인천', '4,054명'],
                    ['하이록스 서울 2025', '2025년 11월 8~9일 · 코엑스', '6,000명+ (첫 서울 대회)'],
                    ['하이록스 인천 2026', '2026년 5월 15~17일 · 송도컨벤시아', '약 15,000명 등록 (국내 최초 3일)'],
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 참가비는 부문·시기마다 다르며, 2025년 11월 서울 대회 기준 <strong style={{ color: 'var(--text)' }}>1인 약 20만 원</strong> 수준으로 보도되었습니다(한국경제, 2025년 11월). 인기 부문은 조기 매진되는 경우가 많습니다.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>
            ※ 차기 서울 대회는 2026년 하반기 개최가 예고되어 있으나, 확정 일정·장소·티켓 오픈은 공식 사이트{' '}
            <a href="https://hyrox.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>hyrox.com</a>
            에서 확인하세요. 공식 규정상 대회 등록은 hyrox.com을 통해서만 가능합니다. (출처: 인천광역시·인천관광공사 보도자료, 한국경제·우리일보 보도, HYROX 공식 룰북 시즌 25/26)
          </p>
        </section>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 5. FAQ */}
        <section>
          <h2 style={h2}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_LD.map((f, i) => (
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
