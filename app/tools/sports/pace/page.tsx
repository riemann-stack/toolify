import Link from 'next/link'
import PaceClient from './PaceClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/pace',
  title: '러닝 페이스 계산기 — 마라톤 완주 시간·트레드밀 시속 변환',
  description: '목표 페이스로 5km·10km·하프·풀 마라톤 완주 예상 시간 계산. 트레드밀 시속 ↔ 페이스 변환, 400m 트랙 바퀴당 소요 시간, 구간별 스플릿 표 제공.',
  keywords: ['러닝페이스계산기', '마라톤페이스계산기', '트레드밀시속변환', '달리기페이스', '마라톤완주시간', '400m트랙페이스', '러닝스플릿'],
})

export default function PacePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃 러닝 페이스 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 페이스 또는 완주 목표 시간으로 마라톤 완주 예상 시간을 계산합니다.
        트레드밀 시속 변환, 400m 트랙 바퀴당 시간, 구간별 스플릿도 함께 확인하세요.
      </p>

      <PaceClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 페이스 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페이스별 완주 예상 시간 기준표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            아래 표는 일정 페이스를 끝까지 유지했을 때의 이론적 완주 시간입니다. 실제 레이스에서는 후반부 페이스 저하를 고려해 목표 시간보다 약간 빠른 페이스로 출발하는 것이 일반적입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>페이스(/km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>시속(km/h)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>5km</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>10km</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>하프(21km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>풀(42km)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['4:00', '15.0', '20:00', '40:00', '1:24:23', '2:49:44'],
                  ['4:30', '13.3', '22:30', '45:00', '1:34:56', '3:09:53'],
                  ['5:00', '12.0', '25:00', '50:00', '1:45:29', '3:30:58'],
                  ['5:30', '10.9', '27:30', '55:00', '1:56:02', '3:51:04'],
                  ['6:00', '10.0', '30:00', '60:00', '2:06:35', '4:13:10'],
                  ['6:30', '9.2',  '32:30', '65:00', '2:17:08', '4:33:15'],
                  ['7:00', '8.6',  '35:00', '70:00', '2:27:41', '4:55:21'],
                ].map(([pace, kph, k5, k10, half, full], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{kph}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k5}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{half}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 트레드밀 시속 ↔ 페이스 변환표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            트레드밀 시속 ↔ 페이스 변환표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            런닝머신에는 페이스 대신 <strong style={{ color: 'var(--text)' }}>시속(km/h)</strong>이 표시됩니다. 야외 러닝 페이스와 동일하게 설정하려면 아래 표를 참고하세요. 400m 트랙 1바퀴 기준 소요 시간도 함께 확인할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>시속 (km/h)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>페이스 (/km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>400m 트랙 1바퀴</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['7.0',  '8:34', '3:26', '초보 조깅'],
                  ['8.0',  '7:30', '3:00', '가벼운 조깅'],
                  ['9.0',  '6:40', '2:40', '중급 러닝'],
                  ['10.0', '6:00', '2:24', '중급 러닝'],
                  ['11.0', '5:27', '2:11', '활동적 러닝'],
                  ['12.0', '5:00', '2:00', '준중급'],
                  ['13.0', '4:37', '1:51', '중급-상급'],
                  ['14.0', '4:17', '1:43', '상급 러닝'],
                  ['15.0', '4:00', '1:36', '엘리트 수준'],
                ].map(([kph, pace, track, level], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{kph}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 500 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{track}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '페이스(Pace)란 무엇인가요?', a: '페이스는 1km를 달리는 데 걸리는 시간입니다. "5분 30초 페이스"는 1km를 5분 30초에 달린다는 의미입니다. GPS 스마트워치나 러닝 앱에서 "min/km" 또는 "/km"로 표시됩니다. 미국에서는 1마일 기준 페이스(min/mi)를 주로 사용합니다.' },
              { q: '트레드밀과 야외 달리기는 페이스가 같나요?', a: '같은 시속으로 설정해도 일반적으로 트레드밀이 야외보다 더 쉽게 느껴집니다. 바람 저항이 없고 벨트가 발을 밀어주기 때문입니다. 야외 레이스를 목표로 한다면 트레드밀 경사도를 1~1.5%로 설정하면 야외와 비슷한 강도가 됩니다.' },
              { q: '400m 트랙 페이스는 왜 알아야 하나요?', a: '400m 트랙은 인터벌 훈련의 기본 단위입니다. "400m 인터벌 6회"처럼 트랙 훈련 프로그램은 바퀴당 목표 시간으로 구성됩니다. 예를 들어 킬로미터 페이스 5:00(km/h 12)이라면 400m 1바퀴에 2:00이 목표 시간이 됩니다.' },
              { q: '마라톤 서브4(4시간 이내 완주)를 위한 페이스는?', a: '마라톤 서브4를 달성하려면 평균 페이스 5분 41초/km(시속 약 10.5km/h)를 유지해야 합니다. 실제 레이스에서는 초반 흥분으로 오버페이스하지 않도록 전반부를 조금 여유 있게, 후반부에 페이스를 유지하는 네거티브 스플릿 전략을 권장합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',               desc: '러너에게 적합한 체중 범위 확인' },
              { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량(BMR) 계산기',     desc: '훈련 중 하루 칼로리 소비량 파악' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '레이스 전 목표 체중 달성 계획' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',              desc: '다음 마라톤 대회까지 남은 날' },
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