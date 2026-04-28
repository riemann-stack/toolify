import Link from 'next/link'
import LunarClient from './LunarClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/lunar',
  title: '양음력 변환기 2026 — 음력 ↔ 양력 · 간지 확인',
  description: '음력 생일을 양력으로, 양력을 음력으로 즉시 변환합니다. 윤달 지원, 60갑자 간지와 띠까지 한눈에 확인.',
  keywords: ['양음력변환', '음력양력변환', '음력달력', '양력음력', '음력생일', '윤달계산', '60갑자', '간지계산'],
})

export default function LunarPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌙 양음력 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        양력과 음력을 서로 변환하고 해당 연도의 60갑자 간지까지 확인합니다. 1900~2100년 지원.
      </p>

      <LunarClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>양력과 음력, 무엇이 다를까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>양력(태양력)</strong>은 지구가 태양을 한 바퀴 도는 365.25일을 기준으로 하며 현재 세계 표준 달력입니다.
            <strong style={{ color: 'var(--text)' }}> 음력(태음력)</strong>은 달이 차고 기우는 주기 약 29.5일을 한 달로 삼기 때문에 1년이 약 354일로 양력보다 11일가량 짧습니다.
            이 차이를 보정하기 위해 <strong style={{ color: 'var(--accent)' }}>19년에 7번</strong> 윤달을 끼워 넣어 계절과 달력을 맞춥니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            한국의 공식 달력은 1896년부터 양력이지만 설날·추석·제사·음력 생일 등 전통 절기는 여전히 음력 기준으로 챙깁니다.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>사용 방법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', title: '변환 방향 선택', content: '상단 토글에서 "양력 → 음력" 또는 "음력 → 양력" 을 고릅니다.' },
              { step: '2', title: '날짜 입력', content: '년/월/일 드롭다운에서 변환할 날짜를 선택합니다. 1900년부터 2100년까지 지원됩니다.' },
              { step: '3', title: '윤달 체크 (필요 시)', content: '음력 → 양력 변환 시 해당 월이 윤달이 있는 달이라면 "윤O월로 계산" 체크박스가 나타납니다.' },
              { step: '4', title: '결과 확인', content: '변환된 날짜와 해당 연도의 60갑자, 띠를 함께 확인할 수 있습니다.' },
            ].map((item) => (
              <div key={item.step} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', minWidth: '24px' }}>{item.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '윤달이란 무엇인가요?', a: '음력은 1년이 약 354일이라 양력과 11일 차이가 납니다. 3년마다 약 33일의 오차가 생기므로 19년에 7번 한 달을 덧붙여 계절과 맞추는데, 이 달이 윤달입니다. 제사·결혼 등 중요한 일은 윤달을 피하는 전통이 있습니다.' },
              { q: '음력 생일은 매년 양력으로 바뀌나요?', a: '네. 음력 생일은 매년 양력 날짜가 달라집니다. 예를 들어 음력 1월 1일(설날)은 2026년에는 2월 17일, 2027년에는 2월 6일입니다. 이 계산기에서 매년 확인할 수 있습니다.' },
              { q: '60갑자는 어떻게 계산되나요?', a: '천간(갑을병정무기경신임계 10개)과 지지(자축인묘진사오미신유술해 12개)를 조합해 60년 주기로 순환합니다. 2024년은 갑진(甲辰), 2026년은 병오(丙午)년입니다.' },
              { q: '이 계산기는 얼마나 정확한가요?', a: '한국천문연구원의 공식 음력 데이터를 기반으로 1900~2100년 범위에서 날짜·윤달·간지 모두 정확하게 제공합니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>관련 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/life/zodiac', emoji: '🐲', name: '띠·별자리 계산기', desc: '60갑자·궁합까지' },
              { href: '/tools/date/age', emoji: '🎂', name: '만 나이 계산기', desc: '통일법 기준' },
              { href: '/tools/date/dday', emoji: '📅', name: 'D-day 계산기·일정 관리', desc: '두 날짜 사이·페이스 통합' },
              { href: '/tools/date/military', emoji: '🎖️', name: '군 전역일 계산기', desc: '전역일·복무율' },
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
        </div>
      </div>
    </div>
  )
}
