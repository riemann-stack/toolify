import Link from 'next/link'
import JetLagClient from './JetLagClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/jet-lag',
  title: '시차 적응 계산기 — 여행 전·기내·도착 후 수면 타이밍',
  description: '시차 적응 예상 기간, 출국 전 수면 조정 스케줄, 기내 수면 타이밍, 도착 후 낮잠·햇빛 노출 계산. 서울-뉴욕·런던·파리 시차 극복 가이드.',
  keywords: ['시차적응계산기', '시차극복방법', '해외여행시차', '기내수면타이밍', '시차적응기간', '제트래그', '유럽시차적응', '미국시차적응'],
})

export default function JetLagPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ✈️ 시차 적응 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        출국 전 수면 조정부터 기내 수면 타이밍, 도착 후 낮잠·햇빛 노출까지 시차 적응 전 과정을 시간 단위로 계산해요.
      </p>

      <JetLagClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 과학 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응의 과학 — 왜 힘든가</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            인간의 뇌에는 약 <strong style={{ color: 'var(--text)' }}>24.2시간 주기</strong>로 작동하는 생체시계(서카디안 리듬)가 있습니다.
            어두워지면 <strong style={{ color: 'var(--text)' }}>멜라토닌</strong>이 분비돼 수면 신호를 보내고, 아침엔 <strong style={{ color: 'var(--text)' }}>코르티솔</strong>이 분비돼 각성 신호를 보냅니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            장거리 비행 뒤엔 이 두 호르몬의 분비 타이밍이 현지 시간과 어긋나면서 피로·불면·소화장애가 생깁니다.
            특히 <strong style={{ color: 'var(--accent)' }}>동쪽 이동(시계를 앞당김)이 서쪽 이동(시계를 늦춤)보다 힘든 이유</strong>는 생체시계가 24시간보다 약간 길기 때문입니다. 늘리는 건 쉽지만 줄이는 건 어렵습니다.
          </p>
        </div>

        {/* 2. 여행지별 시차 표 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>인기 여행지별 시차 & 적응 기간</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>목적지</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>시차</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>이동 방향</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>예상 적응</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['도쿄', '0시간', '—', '없음'],
                  ['방콕', '-2시간', '서쪽', '1~2일'],
                  ['두바이', '-5시간', '서쪽', '4~5일'],
                  ['파리', '-8시간', '서쪽', '6~8일'],
                  ['런던', '-9시간', '서쪽', '7~9일'],
                  ['뉴욕', '-14시간', '서쪽', '10~14일'],
                  ['LA', '-17시간', '서쪽', '12~17일'],
                  ['시드니', '+2시간', '동쪽', '2~3일'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
            ※ 서울(UTC+9) 기준. 서머타임이 적용되는 지역은 계절에 따라 1시간 차이.
          </p>
        </div>

        {/* 3. 공식 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응 핵심 공식</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '적응 기간 (동쪽)', formula: '시차 × 1.5일' },
              { title: '적응 기간 (서쪽)', formula: '시차 × 1.0일' },
              { title: '카페인 컷오프', formula: '목표 취침 − 카페인 반감기(6~10h) = 마지막 허용 시각' },
              { title: '낮잠 허용 기준', formula: '현지 오후 3시 이전 + 20~30분 이내 = 안전' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.title}</span>
                <code style={{ fontFamily: 'Syne, monospace', fontSize: '14px', color: 'var(--accent)', fontWeight: 700 }}>{item.formula}</code>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 방향별 가이드 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이동 방향별 완전 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(62,200,255,0.06)', border: '1px solid rgba(62,200,255,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#3EC8FF', marginBottom: '10px' }}>← 서쪽 이동 (미주·유럽)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 늦추기',
                  '기내: 현지 밤 시간대에 수면',
                  '도착 후: 저녁 햇빛 노출 (생체시계 지연)',
                  '멜라토닌: 도착지 저녁에 복용',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'rgba(255,140,62,0.06)', border: '1px solid rgba(255,140,62,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#FF8C3E', marginBottom: '10px' }}>→ 동쪽 이동 (호주·하와이)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 앞당기기',
                  '기내: 현지 낮 시간대 각성 유지',
                  '도착 후: 아침 햇빛 최대 노출',
                  '주의: 서쪽보다 1.5배 더 어려움',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. 단기 vs 장기 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>단기 출장 vs 장기 여행 전략</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>단기 출장 (2~3일)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '적응 포기, 한국 시간 유지 전략',
                  '회의는 한국 낮 시간대에 맞춰 일정',
                  '카페인·수면제 단기 활용 고려',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>1주일 이상</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '적응 전략 적극 시행',
                  '도착 즉시 현지 시간 동기화',
                  '낮잠 최소화, 햇빛 적극 활용',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 6. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '시차 적응에 며칠이나 걸리나요?', a: '일반적으로 시차 1시간당 1~1.5일이 필요합니다. 서울에서 뉴욕은 약 14시간 차이로 10~14일이 걸릴 수 있습니다. 개인차가 크며 젊을수록, 규칙적인 수면 습관을 가진 사람일수록 빠르게 적응합니다.' },
              { q: '동쪽과 서쪽 이동 중 어느 쪽이 더 힘드나요?', a: '동쪽 이동(예: 서울→호주, 한국→하와이)이 더 어렵습니다. 인간의 생체시계는 자연적으로 24시간보다 약간 길어(24.2시간) 시간을 늘리는 서쪽 이동에 더 쉽게 적응합니다. 동쪽 이동은 시계를 억지로 앞당기는 것이라 더 힘듭니다.' },
              { q: '비행기에서 언제 자는 게 좋나요?', a: '도착지의 밤 시간(22:00~06:00)에 해당하는 구간에 수면하는 것이 이상적입니다. 예를 들어 인천→뉴욕 비행에서 뉴욕 현지 밤 시간대에 최대한 수면하면 도착 후 시차 적응이 빨라집니다.' },
              { q: '멜라토닌 복용이 효과적인가요?', a: '소량(0.5~1mg)의 멜라토닌은 시차 적응에 효과적이라는 연구가 있습니다. 서쪽 이동 시 도착지 취침 시각(21~22시)에, 동쪽 이동 시 출발 며칠 전부터 앞당긴 취침 시각에 복용을 고려하세요. 의사와 상담 후 복용을 권장합니다.' },
              { q: '도착 첫날 낮잠은 얼마나 자도 되나요?', a: '현지 오후 3시 이전이라면 20~30분 이내의 낮잠은 도움이 됩니다. 30분 이상 자면 깊은 수면 단계에 들어가 오히려 피로감이 커지고 당일 밤 수면을 방해할 수 있습니다. 오후 5시 이후에는 낮잠을 피하세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      emoji: '📅', name: 'D-day 계산기·일정 관리', desc: '여행 출발 D-day·기간' },
              { href: '/tools/life/pomodoro',  emoji: '🍅', name: '뽀모도로 타이머',   desc: '기내 활동 루틴' },
              { href: '/tools/date/age',       emoji: '🎂', name: '만 나이 계산기',    desc: '여권 만료 확인용' },
              { href: '/tools/date/lunar',     emoji: '🌙', name: '음양력 변환기',     desc: '여행지 명절 확인' },
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
