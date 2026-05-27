import Link from 'next/link'
import JetLagClient from './JetLagClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/date/jet-lag',
  title: '시차 적응 계산기 — 여행 전·기내·도착 후 수면 타이밍',
  description: '여행 전·중·후 시차 적응 일정과 수면 타이밍 자동 가이드. 출장·여행 컨디션 관리에.',
  keywords: ['시차적응계산기', '시차극복방법', '해외여행시차', '기내수면타이밍', '시차적응기간', '제트래그', '유럽시차적응', '미국시차적응'],
})

const FAQ_LD = [
              {
                q: '시차 적응에 며칠이나 걸리나요?',
                a: '일반적으로 <strong>시차 1시간당 1~1.5일</strong>이 필요합니다. 서울→뉴욕은 약 14시간 시차이므로 10~14일, 서울→파리는 8시간이므로 6~8일이 걸립니다. 개인차가 크며 젊을수록, 규칙적인 수면 습관을 가진 사람일수록 빠르게 적응합니다.',
              },
              {
                q: '서울→뉴욕은 동쪽으로 비행하는데 왜 「서쪽 이동」으로 분류되나요?',
                a: '시차 적응에서 말하는 「동쪽/서쪽」은 <strong>비행 경로</strong>가 아니라 <strong>시간대(UTC 오프셋)의 변화 방향</strong>입니다.<br/><br/>· <strong>동쪽 이동</strong> = 시간이 「앞으로」 가는 것 (UTC 오프셋 ↑) — 생체시계를 앞당겨야 함 → 어려움<br/>· <strong>서쪽 이동</strong> = 시간이 「뒤로」 가는 것 (UTC 오프셋 ↓) — 생체시계를 늦춰도 됨 → 쉬움<br/><br/>예) 서울(UTC+9) → 뉴욕(UTC-5)은 비행기는 태평양을 건너 동쪽으로 날아가지만, <strong>도착지 시간이 14시간 뒤로 이동</strong>하므로 「시간대 서쪽」으로 분류됩니다. 인간 생체시계가 24.2시간으로 자연스럽게 늘어지는 특성상 「늦추는 쪽(서쪽)」이 적응이 더 쉽습니다.',
              },
              {
                q: '동쪽과 서쪽 이동 중 어느 쪽이 더 힘드나요?',
                a: '시간대 기준 <strong>동쪽 이동(시계 앞당김)</strong>이 더 어렵습니다. 인간의 생체시계는 자연적으로 약 24.2시간 주기로 작동해 「늘리는 것(서쪽)」은 쉽지만 「줄이는 것(동쪽)」은 힘듭니다. 같은 시차라도 동쪽은 서쪽보다 약 <strong>1.5배</strong> 더 긴 적응 기간이 필요합니다.<br/><br/>예) 서울→호주(시드니, +1h)는 동쪽 이동 — 시차는 작지만 적응이 미묘하게 어려움.',
              },
              {
                q: '비행기에서 언제 자는 게 좋나요?',
                a: '<strong>도착지의 밤 시간(22:00~06:00)에 해당하는 구간</strong>에 수면하는 것이 이상적입니다. 본 계산기는 이륙 시각·비행 시간·시차를 바탕으로 비행 축에서 도착지 밤 시간이 어디 걸치는지 자동으로 계산해 「권장 수면 시작/종료/총 가능 시간」을 알려줍니다.',
              },
              {
                q: '단기 출장(1~3일)도 시차 적응을 해야 하나요?',
                a: '권장하지 않습니다. <strong>2~3일짜리 단기 출장</strong>은 적응 자체에 시차의 1~2배 시간이 들기 때문에 적응을 시도하지 말고 <strong>한국 시간 유지 전략</strong>(한국 낮 시간대에 회의·식사·수면)이 효율적입니다. 본 계산기는 체류 일수가 3일 이하면 한국 시간 유지를 자동 추천합니다.',
              },
              {
                q: '멜라토닌 복용이 효과적인가요?',
                a: '소량(0.5~1mg)의 멜라토닌은 시차 적응에 효과적이라는 연구가 다수 있습니다.<br/>· <strong>서쪽 이동</strong> — 도착 직후 도착지 취침 시각(21~22시) 30~60분 전 복용<br/>· <strong>동쪽 이동</strong> — 출발 며칠 전부터 앞당긴 취침 시각에 복용<br/><br/>한국에서 멜라토닌은 <strong>전문의약품</strong>으로 분류되어 처방이 필요합니다. 임산부·청소년·우울증·자가면역질환자는 사용 전 반드시 의사 상담 필요. 고용량(3~5mg)은 오히려 수면 질을 떨어뜨릴 수 있습니다.',
              },
              {
                q: '도착 첫날 낮잠은 얼마나 자도 되나요?',
                a: '<strong>현지 오후 3시 이전</strong>이라면 20~30분 이내의 낮잠은 도움이 됩니다. 30분 이상 자면 깊은 수면 단계(SWS)에 들어가 오히려 피로감(sleep inertia)이 커지고 당일 밤 수면을 방해합니다. <strong>오후 5시 이후 낮잠은 절대 금지</strong>. 본 계산기는 도착 시각을 기준으로 자동 판정해 「가능/주의/금지」를 표시합니다.',
              },
              {
                q: '카페인 컷오프 시각은 어떻게 정해지나요?',
                a: '카페인은 평균적으로 <strong>5~7시간 반감기</strong>를 가지지만, 잔류 효과까지 고려하면 <strong>섭취 8시간 후</strong>에도 일부가 체내에 남아 수면을 방해할 수 있습니다. 본 계산기는 <strong>평소 취침 시각 − 8시간</strong>을 카페인 마지막 허용 시각으로 자동 계산합니다. 예) 평소 23시 취침 → 15시 이후 카페인 컷.<br/><br/>임신·고혈압·불안장애가 있다면 더 보수적으로 6시간 전(17시 컷)에 끊는 것이 안전합니다.',
              },
              {
                q: '햇빛 노출이 정말 시차 적응에 도움이 되나요?',
                a: '네. 햇빛은 가장 강력한 <strong>생체시계 동기화 신호(zeitgeber)</strong>입니다.<br/>· <strong>아침 햇빛(6~10시)</strong> — 생체시계를 앞당김 → 동쪽 이동 적응에 도움<br/>· <strong>저녁 햇빛(15~19시)</strong> — 생체시계를 늦춤 → 서쪽 이동 적응에 도움<br/><br/>실내에서도 창가에 앉거나 야외 산책 10~30분만으로 효과가 있습니다. 흐린 날도 약 10,000 lux로 실내 조명(300~500 lux)의 30배.',
              },
              {
                q: '7일 적응 스케줄대로 안 따르면 어떻게 되나요?',
                a: '몸이 자연 적응에 의존하게 되어 평균 적응 기간이 1.5~2배 길어질 수 있습니다. 특히 동쪽 이동은 자연 적응으로 2주 이상 걸리는 경우가 흔합니다. 본 계산기 스케줄은 <strong>점진적 수면 시각 조정 + 햇빛 활용 + 카페인 컷오프</strong>를 종합한 일반 가이드입니다. 직장 일정 등으로 100% 따르기 어렵다면 <strong>아침 햇빛·저녁 카페인 차단 두 가지만이라도</strong> 우선 지키세요.',
              },
            ]

export default function JetLagPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ✈️ 시차 적응 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        여행 전·중·후 <strong style={{ color: 'var(--text)' }}>시차 적응 일정과 수면 타이밍</strong> 자동 가이드.
      </p>

      <JetLagClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 과학 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응의 과학 — 왜 힘든가</h2>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>인기 여행지별 시차 & 적응 기간</h2>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응 핵심 공식</h2>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이동 방향별 완전 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0891B2', marginBottom: '10px' }}>← 서쪽 이동 (미주·유럽)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 늦추기',
                  '기내: 현지 밤 시간대에 수면',
                  '도착 후: 저녁 햇빛 노출 (생체시계 지연)',
                  '멜라토닌: 도착지 저녁에 복용',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', marginBottom: '10px' }}>→ 동쪽 이동 (호주·하와이)</p>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>단기 출장 vs 장기 여행 전략</h2>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((item, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {item.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: item.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      emoji: '📅', name: 'D-Day 계산기', desc: '여행 출발 D-day·기간' },
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
