import type { Metadata } from 'next'
import PomodoroClient from './PomodoroClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '뽀모도로 타이머 — 집중력 향상 25분 공부 타이머 | Youtil',
  description: '뽀모도로 기법으로 25분 집중·5분 휴식을 반복합니다. 집중/휴식 시간 커스텀, 사이클 카운트, 알림음 지원.',
  keywords: ['뽀모도로타이머', '포모도로타이머', '공부타이머', '집중타이머', '뽀모도로기법', '타이머'],
}

export default function PomodoroPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍅 뽀모도로 타이머
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        25분 집중, 5분 휴식을 반복하는 뽀모도로 기법으로 집중력을 높이세요.
      </p>

      <PomodoroClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>뽀모도로 기법이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            뽀모도로(Pomodoro) 기법은 1980년대 프란체스코 시릴로가 개발한 시간 관리 방법론입니다. 토마토 모양 주방 타이머(이탈리아어로 '뽀모도로')에서 이름을 따왔습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { step: '1', title: '25분 집중', desc: '한 가지 작업에만 집중합니다. 방해 요소를 모두 차단하세요.', color: '#C8FF3E' },
              { step: '2', title: '5분 휴식',  desc: '짧게 스트레칭하거나 물을 마십니다. 스마트폰은 내려놓으세요.', color: '#3EC8FF' },
              { step: '3', title: '4번 반복',  desc: '25분 집중 + 5분 휴식을 4번 반복합니다.', color: '#FF8C3E' },
              { step: '4', title: '15~30분 긴 휴식', desc: '4번의 뽀모도로를 완료하면 긴 휴식을 취합니다.', color: '#FF6BD9' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: s.color, flexShrink: 0 }}>{s.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '뽀모도로 기법의 효과는 과학적으로 검증되었나요?', a: '네, 여러 연구에서 짧은 집중과 규칙적인 휴식이 인지 능력과 생산성을 향상시킨다고 밝혔습니다. 우리 뇌는 장시간 집중하면 주의력이 급격히 저하되는데, 뽀모도로 기법은 이를 방지하여 지속적인 고집중 상태를 유지합니다.' },
              { q: '25분이 너무 짧거나 길게 느껴질 때는?', a: '뽀모도로 기법은 고정된 규칙이 아닙니다. 개인의 집중력에 따라 15분, 45분 등으로 조절할 수 있습니다. 본 타이머는 집중·휴식 시간을 자유롭게 설정할 수 있습니다. 처음에는 25분으로 시작해 자신에게 맞는 시간을 찾아보세요.' },
              { q: '집중 중에 급한 일이 생기면 어떻게 하나요?', a: '뽀모도로 기법에서는 집중 시간 중 방해를 받으면 메모해두고 다음 뽀모도로에서 처리하는 것을 권장합니다. 정말 긴급한 일이 아니라면 현재 뽀모도로를 완료한 후 처리하는 습관을 들이면 집중력이 향상됩니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기',     desc: '시험·마감까지 남은 날' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 계산기', desc: '건강 목표 관리' },
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