import type { Metadata } from 'next'
import Link from 'next/link'
import PregnancyClient from './PregnancyClient'

export const metadata: Metadata = {
  title: '임신 주수 계산기 — 출산 예정일·태아 크기·산전 검사 일정 | Youtil',
  description: '마지막 생리일·수정일·출산 예정일로 현재 임신 주수를 계산합니다. 태아 크기 비유, D-day 카운트다운, 산전 검사 일정, 시기별 체크리스트 제공. 참고: 산부인과 전문의 상담 권장.',
  keywords: ['임신주수계산기', '출산예정일계산기', '임신주수', '임신계산기', '출산예정일', '산전검사일정', '태아크기', '네겔레공식'],
}

export default function PregnancyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🤰 임신 주수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        마지막 생리 시작일을 입력하면 현재 임신 주수와 출산 예정일, 산전 검사 일정을 계산합니다.
      </p>

      {/* 면책 조항 — 상단 강조 */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        background: 'rgba(255,107,107,0.06)',
        border: '1px solid rgba(255,107,107,0.3)',
        borderRadius: '12px', padding: '14px 18px',
        marginBottom: '40px',
        fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7,
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>⚕️</span>
        <p>
          <strong style={{ color: 'var(--text)' }}>의료 면책 조항:</strong>{' '}
          본 계산기는 참고용이며, 정확한 진단은 반드시 <strong style={{ color: 'var(--text)' }}>산부인과 전문의와 상담</strong>하십시오.
          계산 결과는 마지막 생리일을 기준으로 한 이론적 수치이며, 실제 주수는 초음파 검사 결과에 따라 다를 수 있습니다.
        </p>
      </div>

      <PregnancyClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 네겔레 공식 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            출산 예정일 산출법 — 네겔레 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            네겔레 공식(Naegele's Rule)은 1800년대 독일 산부인과 의사 프란츠 카를 네겔레가 개발한 출산 예정일 계산법입니다.
            현재 전 세계 산부인과에서 가장 널리 사용되는 표준 방법입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,217,0.25)', borderRadius: '14px', padding: '20px 22px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#FF6BD9', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
              네겔레 공식 (Naegele&apos;s Rule)
            </p>
            {/* 시각화 공식 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                { label: '출산 예정일', isResult: true },
                { label: '=', isSym: true },
                { label: '마지막 생리\n시작일', isInput: true },
                { label: '+', isSym: true },
                { label: '7일', isOp: true },
                { label: '−', isSym: true },
                { label: '3개월', isOp: true },
                { label: '+', isSym: true },
                { label: '1년', isOp: true },
              ].map((item, i) => (
                item.isSym
                  ? <span key={i} style={{ fontSize: '20px', color: 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>{item.label}</span>
                  : <div key={i} style={{
                    background: item.isResult ? 'rgba(255,107,217,0.15)' : item.isInput ? 'var(--bg3)' : 'rgba(200,255,62,0.1)',
                    border: `1px solid ${item.isResult ? 'rgba(255,107,217,0.4)' : item.isInput ? 'var(--border)' : 'rgba(200,255,62,0.3)'}`,
                    borderRadius: '8px', padding: '8px 12px', textAlign: 'center',
                    fontSize: '12px', fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4,
                    color: item.isResult ? '#FF6BD9' : item.isInput ? 'var(--text)' : 'var(--accent)',
                  }}>{item.label}</div>
              ))}
            </div>

            {/* 예시 */}
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
                📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 마지막 생리 시작일이 <strong style={{ color: 'var(--text)' }}>2025년 10월 1일</strong>이라면<br />
                → 10월 1일 + 7일 = 10월 8일 → 10월 − 3개월 = 7월 8일 → + 1년 = <strong style={{ color: '#FF6BD9' }}>2026년 7월 8일</strong>이 출산 예정일
              </p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
            ※ 네겔레 공식은 생리 주기가 28일이고 배란이 14일째 일어난다는 가정을 기반으로 합니다.
            생리 주기가 불규칙하거나 길/짧은 경우 실제 예정일과 차이가 날 수 있으며, 최종 예정일은 초음파 검사로 확인합니다.
          </p>
        </div>

        {/* ── 2. 삼분기별 주요 변화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>삼분기별 주요 변화</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { period: '1삼분기 (1~13주)', color: '#3EC8FF', items: ['수정란 착상 → 배아 형성', '심장·뇌·척수 등 주요 장기 형성', '입덧 시작 (8~10주에 최고조)', '첫 산전 검사 및 기형아 1차 검사'] },
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

        {/* ── 3. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '임신 주수는 어떻게 계산하나요?', a: '임신 주수는 마지막 생리 시작일로부터 계산합니다. 실제 수정은 배란일(생리 시작 후 약 14일)에 일어나지만, 정확한 배란일을 알기 어렵기 때문에 의학적으로는 마지막 생리 시작일을 기준으로 삼습니다. 따라서 임신 1주차는 아직 수정 전인 시기입니다.' },
              { q: '출산 예정일은 어떻게 계산하나요?', a: '출산 예정일은 마지막 생리 시작일로부터 280일(40주) 후입니다. 네겔레 공식에 따라 마지막 생리 시작일에 7일을 더하고 3개월을 빼면 됩니다. 실제 출산은 예정일 ±2주 사이에 일어나는 경우가 많습니다.' },
              { q: '초음파 주수와 생리 기준 주수가 달라요!', a: '초기 초음파 검사에서 태아의 크기(CRL, 두부-둔부 길이)를 측정하여 주수를 보정할 수 있습니다. 이 경우 의사가 새로 지정해 준 주수가 더 정확합니다. 본 계산기는 생리 기준 주수를 사용하므로 초음파 결과와 1~2주 차이가 날 수 있습니다.' },
              { q: '임신 주수를 개월로 환산하면?', a: '의학적으로는 4주를 1개월로 봅니다. 예를 들어 28주는 7개월이 됩니다. 하지만 일반적인 달력 기준(30~31일/월)과는 차이가 있을 수 있으므로, 임신 경과는 주수(week)로 소통하는 것이 가장 정확합니다.' },
              { q: '임신 초기 증상에는 어떤 것이 있나요?', a: '착상혈(소량 출혈), 유방 팽창 및 압통, 입덧(메스꺼움·구토), 피로감, 빈뇨, 미각·후각 변화 등이 나타날 수 있습니다. 증상의 정도는 개인차가 크며, 아무런 증상이 없는 경우도 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 참고 출처 ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>참고 출처</p>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              '보건복지부 임신·출산 가이드라인',
              '대한산부인과학회 (KSOG) 산전 진료 지침',
              'WHO 임산부 산전 진료 권고안',
            ].map((source, i) => (
              <li key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>{source}</li>
            ))}
          </ul>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기',     desc: '출산 예정일까지 남은 날 카운트다운' },
              { href: '/tools/health/bmi',       icon: '⚖️', name: 'BMI 계산기',       desc: '임신 전 적정 체중 확인' },
              { href: '/tools/health/weightloss',icon: '🎯', name: '목표 체중 감량 계산기', desc: '출산 후 산후 체중 관리 계획' },
              { href: '/tools/date/age',         icon: '🎂', name: '만 나이 계산기',   desc: '아이 나이·예방접종 일정 관리' },
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