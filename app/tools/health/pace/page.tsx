import type { Metadata } from 'next'
import PaceClient from './PaceClient'

export const metadata: Metadata = {
  title: '러닝 페이스 계산기 — 마라톤 목표 기록 속도 계산 | Youtil',
  description: '목표 완주 시간으로 킬로미터당 페이스와 시속을 계산합니다. 5km, 10km, 하프마라톤, 풀마라톤 모두 지원. 서브3·서브4 페이스 안내.',
  keywords: ['러닝페이스계산기', '마라톤페이스', '킬로페이스', '서브4페이스', '달리기속도계산', '러닝속도'],
}

export default function PacePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃 러닝 페이스 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 완주 시간을 입력하면 킬로미터당 페이스와 시속을 계산합니다.
      </p>

      <PaceClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>마라톤 목표 기록별 필요 페이스</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>목표 기록</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>필요 페이스</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>시속</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['서브3 (2시간 59분)', `4'15"/km`, '14.1km/h', '엘리트'],
                  ['서브3.5 (3시간 29분)', `4'58"/km`, '12.1km/h', '상급'],
                  ['서브4 (3시간 59분)', `5'41"/km`, '10.6km/h', '중상급'],
                  ['서브4.5 (4시간 29분)', `6'23"/km`, '9.4km/h', '중급'],
                  ['서브5 (4시간 59분)', `7'06"/km`, '8.5km/h', '초중급'],
                  ['완주 목표 (6시간)', `8'32"/km`, '7.0km/h', '입문'],
                ].map(([goal, pace, speed, level], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{goal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{speed}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>거리별 세계 기록 및 일반인 평균</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>세계 기록 (남)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>일반인 평균</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>입문자 목표</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['5km', '12분 35초', '25~35분', '35분 이내'],
                  ['10km', '26분 06초', '50분~1시간 10분', '1시간 이내'],
                  ['하프마라톤', '57분 31초', '2시간~2시간 30분', '2시간 30분 이내'],
                  ['풀마라톤', '2시간 00분 35초', '4시간~5시간', '5시간 이내'],
                ].map(([dist, world, avg, beginner], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{dist}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{world}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{avg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{beginner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '페이스와 속도의 차이는 무엇인가요?', a: '페이스는 1km를 달리는 데 걸리는 시간(분:초)이고, 속도는 시간당 이동 거리(km/h)입니다. 페이스 6분00초는 시속 10km와 동일합니다. 러닝에서는 페이스가 더 직관적으로 사용됩니다.' },
              { q: '서브4 달성을 위한 훈련 방법은?', a: '풀마라톤 서브4(4시간 이내)를 위해서는 km당 5분 41초 이내의 페이스가 필요합니다. 주 3~4회, 월 150~200km 이상의 훈련량과 함께 인터벌 트레이닝, 장거리 달리기를 병행하면 효과적입니다.' },
              { q: '러닝 페이스 계산기는 어떻게 활용하나요?', a: '대회 목표 기록을 입력해 필요한 페이스를 파악하고, 훈련 시 해당 페이스를 기준으로 달리면 됩니다. 처음에는 목표보다 10~15% 느린 페이스로 훈련하고 점차 목표 페이스에 맞춰가는 것이 좋습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}