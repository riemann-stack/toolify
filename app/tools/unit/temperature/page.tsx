import type { Metadata } from 'next'
import TemperatureClient from './TemperatureClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '온도 변환기 — 섭씨 화씨 켈빈 변환 계산기 | Youtil',
  description: '섭씨(°C), 화씨(°F), 켈빈(K) 온도를 즉시 변환합니다. 체온·날씨·요리·과학 실험 등 다양한 상황에서 활용하세요.',
  keywords: ['온도변환기', '섭씨화씨변환', '화씨섭씨변환', '온도계산기', '켈빈변환', '°C°F변환'],
}

export default function TemperaturePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌡️ 온도 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        섭씨, 화씨, 켈빈 온도를 즉시 변환합니다.
      </p>

      <TemperatureClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 계산 예시 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '해외 레시피 — 오븐 온도 변환', content: '미국 레시피에서 350°F로 예열하라고 나왔을 때, 섭씨로 변환하면 약 177°C입니다. 한국 오븐은 섭씨 기준이므로 180°C로 설정하면 됩니다.' },
              { title: '해외여행 — 현지 날씨 파악', content: '미국 날씨 앱에서 68°F로 표시될 때 섭씨로 변환하면 20°C입니다. 선선한 가을 날씨로 가벼운 외투가 필요한 날씨입니다.' },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{ex.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>온도 단위 변환 공식</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>변환</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>공식</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>예시</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['섭씨 → 화씨', '°F = (°C × 9/5) + 32', '100°C = 212°F'],
                  ['화씨 → 섭씨', '°C = (°F − 32) × 5/9', '98.6°F = 37°C'],
                  ['섭씨 → 켈빈', 'K = °C + 273.15',       '0°C = 273.15K'],
                  ['켈빈 → 섭씨', '°C = K − 273.15',       '373.15K = 100°C'],
                ].map(([conv, formula, example], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{conv}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'monospace' }}>{formula}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{example}</td>
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
              { q: '섭씨와 화씨가 같아지는 온도는?', a: '-40°C = -40°F입니다. 이 온도가 섭씨와 화씨가 일치하는 유일한 지점입니다. 공식에 대입하면 (-40 × 9/5) + 32 = -72 + 32 = -40이 됩니다.' },
              { q: '켈빈(K)은 어떤 상황에서 사용하나요?', a: '켈빈은 절대 온도 단위로 과학·공학 분야에서 주로 사용합니다. 켈빈 0K는 절대 영도(-273.15°C)로 이론적으로 가장 낮은 온도입니다. 기체 법칙, 열역학 계산 등에서 켈빈 단위가 필수입니다.' },
              { q: '화씨를 사용하는 나라는 어디인가요?', a: '주로 미국, 미얀마, 라이베리아에서 일상적으로 화씨를 사용합니다. 대부분의 국가는 섭씨를 공식 단위로 사용하며, 과학 분야에서는 켈빈이 국제 표준 단위(SI)입니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 함께 쓰면 좋은 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/length', icon: '📏', name: '길이 변환기',  desc: '인치·피트·cm 변환' },
              { href: '/tools/unit/weight', icon: '⚖️', name: '무게 변환기',  desc: '파운드·kg 변환' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}