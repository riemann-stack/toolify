import Link from 'next/link'
import JetLagClient from './JetLagClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/date/jet-lag',
  title: '시차 적응 계산기 — 여행 전·기내·도착 후 수면 타이밍',
  description: '여행 전·중·후 시차 적응 일정과 수면 타이밍 자동 가이드. 출장·여행 컨디션 관리에.',
  keywords: ['시차적응계산기', '시차극복방법', '해외여행시차', '기내수면타이밍', '시차적응기간', '제트래그', '유럽시차적응', '미국시차적응'],
})

const FAQ_LD = [
              {
                q: '시차 적응에 며칠이나 걸리나요?',
                a: '생체시계는 하루에 <strong>서쪽(늦춤) 약 1.5시간, 동쪽(앞당김) 약 1시간</strong>씩 이동합니다(CDC 기준). 즉 위상이동 크기 ÷ 이 속도가 대략적인 적응 일수입니다. 서울→파리(약 8시간 서쪽)는 6일 안팎, 서울→뉴욕(약 14시간 서쪽)은 10일 안팎이 걸립니다. 개인차가 크며 젊을수록, 규칙적인 수면 습관을 가진 사람일수록 빠르게 적응합니다.',
              },
              {
                q: '서울→뉴욕은 동쪽으로 비행하는데 왜 「서쪽 이동」으로 분류되나요?',
                a: '시차 적응의 「동쪽/서쪽」은 비행 경로가 아니라 <strong>생체시계를 어느 쪽으로 옮기느냐</strong>입니다. 앞당김(동쪽)은 어렵고, 늦춤(서쪽)은 인간 내재주기(24.2시간)가 약간 길어 상대적으로 쉽습니다.<br/><br/>생체시계 오정렬의 최대치는 12시간이라 <strong>시계 차이가 12시간을 넘으면 더 짧은 반대 방향으로 적응</strong>합니다. 서울→뉴욕은 시계상 14시간 뒤지지만, 동시에 10시간 앞당김이기도 합니다. 다만 앞당김이 8시간을 넘는 대이동은 신체가 오히려 늦춤(지연)으로 재동조하는 경향이 있어 <strong>「서쪽」으로 처리</strong>합니다(Eastman & Burgess, 2009). 반면 서울→호놀룰루(시계 19시간 뒤)는 앞당김이 5시간뿐이라 <strong>「동쪽」</strong>이 더 짧습니다 — 계산기가 이를 자동 판별합니다.',
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
                a: '기관별 입장이 갈립니다. 시차 적응에 효과적이라는 연구가 다수 있고(Cochrane 리뷰: 5개 이상 시간대 이동에서 시차 감소) 미국 CDC 여행의학 지침도 선택지로 다루지만, <strong>영국 NHS는 근거 부족을 이유로 시차 목적 사용을 권장하지 않습니다</strong>. 복용한다면 타이밍은 <strong>도착지의 목표 취침 시각 30~60분 전</strong>이 기본이며, 낮에 잘못 복용하면 오히려 졸음·적응 지연을 유발합니다.<br/><br/>용량은 일반적으로 <strong>0.5~1mg 저용량</strong>이 사용됩니다. 고용량(3~5mg)도 시차 적응 효과는 비슷하지만, 저용량이 다음날 잔류 졸림 등 부작용이 적습니다(효과가 더 커서가 아니라 내약성 때문).<br/><br/>한국에서 멜라토닌은 <strong>전문의약품</strong>(서카딘 등)으로 분류되어 처방이 필요합니다 — 복용 여부는 의사·약사와 상담해 결정하세요. 임산부·청소년·우울증·자가면역질환자는 특히 주의가 필요합니다.',
              },
              {
                q: '도착 첫날 낮잠은 얼마나 자도 되나요?',
                a: '<strong>현지 오후 3시 이전</strong>이라면 20~30분 이내의 낮잠은 도움이 됩니다. 30분 이상 자면 깊은 수면 단계(SWS)에 들어가 오히려 피로감(sleep inertia)이 커지고 당일 밤 수면을 방해합니다. <strong>오후 5시 이후 낮잠은 절대 금지</strong>. 본 계산기는 도착 시각을 기준으로 자동 판정해 「가능/주의/금지」를 표시합니다.',
              },
              {
                q: '카페인 컷오프 시각은 어떻게 정해지나요?',
                a: '카페인 반감기는 건강한 성인 평균 <strong>약 5시간</strong>(FDA 4~6시간)입니다. 취침 6시간 전에 섭취해도 총수면시간이 1시간 이상 줄었다는 연구가 있어(Drake 2013), 본 계산기는 잔류 효과까지 고려한 보수적 버퍼로 <strong>평소 취침 시각 − 8시간</strong>을 마지막 허용 시각으로 계산합니다(8시간은 반감기가 아니라 안전 버퍼). 예) 평소 23시 취침 → 15시 이후 카페인 컷.<br/><br/>임신부(반감기 최대 15시간까지 연장)·고혈압·불안장애가 있다면 반감기가 길어 더 <strong>이른 시각</strong>(예: 취침 10시간 전, 13시경)에 끊는 것이 안전합니다.',
              },
              {
                q: '햇빛 노출이 정말 시차 적응에 도움이 되나요?',
                a: '네. 햇빛은 가장 강력한 <strong>생체시계 동기화 신호(zeitgeber)</strong>입니다.<br/>· <strong>아침 햇빛(6~10시)</strong> — 생체시계를 앞당김 → 동쪽 이동 적응에 도움<br/>· <strong>저녁 햇빛(15~19시)</strong> — 생체시계를 늦춤 → 서쪽 이동 적응에 도움<br/><br/>실내에서도 창가에 앉거나 야외 산책 10~30분만으로 효과가 있습니다. 야외는 흐린 날에도 실내 조명(300~500 lux)보다 수 배~수십 배 밝습니다(짙은 흐림 1,000~2,000 lux, 밝은 흐림 1만 lux 이상, 맑은 날 직사광 10만 lux).',
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
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="date" />시차 적응 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        여행 전·중·후 <strong style={{ color: 'var(--text)' }}>시차 적응 일정과 수면 타이밍</strong> 자동 가이드.
      </p>

      <JetLagClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 과학 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응의 과학 — 왜 힘든가</h2>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>인기 여행지별 시차 & 적응 기간</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>목적지</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>시계 차이</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>생체시계 방향</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>예상 적응</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['도쿄', '0시간', '—', '없음'],
                  ['방콕', '-2시간', '서쪽 (늦춤)', '1~2일'],
                  ['두바이', '-5시간', '서쪽 (늦춤)', '3~4일'],
                  ['파리', '-8시간', '서쪽 (늦춤)', '5~6일'],
                  ['런던', '-9시간', '서쪽 (늦춤)', '6일'],
                  ['뉴욕', '-14시간', '서쪽 (늦춤)', '약 10일'],
                  ['LA', '-17시간', '동/서 (경계)', '7~11일'],
                  ['호놀룰루', '-19시간', '동쪽 (앞당김 5h)', '약 5일'],
                  ['시드니', '+1시간', '동쪽 (앞당김)', '1~2일'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
            ※ 서울(UTC+9) 기준. 「시계 차이」는 실제 시각 차이, 「생체시계 방향」은 실제 적응 방향입니다.
            뉴욕·LA·호놀룰루처럼 시계 차이가 12시간을 넘으면 더 짧은 반대 방향으로 적응하며, LA는 서머타임 여부에 따라 경계(동↔서)에 걸칩니다.
            위 계산기는 입력한 출발일 기준으로 서머타임을 반영하므로 표(표준시)와 1시간가량 다를 수 있습니다.
          </p>
        </div>

        {/* 3. 공식 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>시차 적응 핵심 공식</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '적응 기간 (동쪽)', formula: '시차 × 1.5일' },
              { title: '적응 기간 (서쪽)', formula: '시차 × 1.0일' },
              { title: '카페인 컷오프', formula: '목표 취침 − 카페인 반감기(6~10h) = 마지막 허용 시각' },
              { title: '낮잠 허용 기준', formula: '현지 오후 3시 이전 + 20~30분 이내 = 안전' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.title}</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)', fontWeight: 700 }}>{item.formula}</code>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 방향별 가이드 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이동 방향별 완전 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-health)', marginBottom: '10px' }}>← 서쪽 이동 (미주·유럽)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 늦추기',
                  '기내: 현지 밤 시간대에 수면',
                  '도착 후: 저녁 햇빛 노출 (생체시계 지연)',
                  '멜라토닌: 상담 후 도착지 저녁에 (국내 처방 필요)',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-life)', marginBottom: '10px' }}>→ 동쪽 이동 (호주·하와이)</p>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>단기 출장 vs 장기 여행 전략</h2>
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
          <Faq items={FAQ_LD} />
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
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
