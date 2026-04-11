import type { Metadata } from 'next'
import PregnancyClient from './PregnancyClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '임신 주수 계산기 — 출산 예정일·산전 검사 일정 | Youtil',
  description: '마지막 생리일·수정일·출산 예정일로 현재 임신 주수를 계산합니다. 출산 예정일, 삼분기, 산전 검사 일정을 한눈에 확인.',
  keywords: ['임신주수계산기', '출산예정일계산기', '임신주수', '임신계산기', '출산예정일', '산전검사일정'],
}

export default function PregnancyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🤰 임신 주수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        마지막 생리 시작일을 입력하면 현재 임신 주수와 출산 예정일, 산전 검사 일정을 계산합니다.
      </p>

      <PregnancyClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 계산 예시 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>마지막 생리 시작일이 2025년 10월 1일인 경우</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
              출산 예정일은 2026년 7월 8일(40주 후)입니다. 2026년 4월 11일 기준으로 계산하면 약 28주 1일로 3삼분기 진입 직전입니다. 이 시기는 태아가 빠르게 성장하는 시기로 임신성 당뇨 검사(24주)를 마치고 태아 성장 초음파(32주) 준비를 해야 합니다.
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>삼분기별 주요 변화</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { period: '1삼분기 (1~13주)', color: '#3EC8FF', items: ['수정란 착상 → 배아 형성', '심장, 뇌, 척수 등 주요 장기 형성', '입덧 시작 (8~10주에 최고조)', '첫 산전 검사 및 기형아 1차 검사'] },
              { period: '2삼분기 (14~27주)', color: '#3EFF9B', items: ['입덧 감소, 안정기 진입', '태동 시작 (18~22주)', '성별 확인 가능 (초음파)', '정밀 초음파, 기형아 2차 검사'] },
              { period: '3삼분기 (28~40주)', color: '#FF8C3E', items: ['태아 급성장 (체중·폐 발달)', '분만 준비 교육 권장', 'GBS 검사, NST(태아심박동 검사)', '출산 준비 (입원 가방 등)'] },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${t.color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: t.color, marginBottom: '10px' }}>{t.period}</p>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {t.items.map((item, j) => (
                    <li key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '임신 주수는 어떻게 계산하나요?', a: '임신 주수는 마지막 생리 시작일로부터 계산합니다. 실제 수정은 배란일(생리 시작 후 약 14일)에 일어나지만, 정확한 배란일을 알기 어렵기 때문에 의학적으로는 마지막 생리 시작일을 기준으로 삼습니다. 따라서 임신 1주차는 아직 수정 전인 시기입니다.' },
              { q: '출산 예정일은 어떻게 계산하나요?', a: '출산 예정일은 마지막 생리 시작일로부터 280일(40주) 후입니다. 네겔레 공식(Naegele\'s rule)에 따라 마지막 생리 시작일에 1년을 더하고, 3개월을 빼고, 7일을 더해도 됩니다. 실제 출산은 예정일 ±2주 사이에 일어나는 경우가 많습니다.' },
              { q: '임신 초기 증상에는 어떤 것이 있나요?', a: '착상혈(소량 출혈), 유방 팽창 및 압통, 입덧(메스꺼움·구토), 피로감, 빈뇨, 미각·후각 변화 등이 나타날 수 있습니다. 증상의 정도는 개인차가 크며, 아무런 증상이 없는 경우도 있습니다.' },
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
              { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',     desc: '출산 예정일 카운트다운' },
              { href: '/tools/health/bmi',    icon: '⚖️', name: 'BMI 계산기',       desc: '임신 전 적정 체중 확인' },
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