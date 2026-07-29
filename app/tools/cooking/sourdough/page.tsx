import Link from 'next/link'
import SourdoughClient from './SourdoughClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/sourdough',
  title: '사워도우 스타터 계산기 — 르방 안정화 진단·피크 시간 예측',
  description: '사워도우 스타터(르방)가 안정화됐는지 3가지 조건으로 진단하고, 급이 비율·온도로 피크 시간을 예측합니다. 1:1:1~1:5:5 급이 비율표·온도별 발효 속도·아세톤 냄새 등 실패 해결 가이드 포함.',
  keywords: ['사워도우스타터계산기', '르방피크시간', '사워도우안정화', '르방계산기', '사워도우급이', '르방스타터', '천연발효빵계산기'],
})

const FAQ_LD = [
              { q: '사워도우 스타터가 안정화됐는지 어떻게 알 수 있나요?',
                a: '3가지 조건을 모두 충족하면 안정화로 봅니다. ① 급이 후 매번 비슷한 시간에 2배 이상 팽창, ② 피크 후 규칙적으로 꺼짐, ③ 이 패턴이 2~3회 이상 반복됨. 냄새는 시큼하지만 상쾌해야 하며, 아세톤이나 구린 냄새는 없어야 합니다.' },
              { q: '왜 초반(2~3일차)에 폭발적으로 부풀다가 조용해지나요?',
                a: '초반의 활발한 반응은 주로 류코노스톡(Leuconostoc) 같은 비효모성 세균들의 반응입니다. 이들이 산성 환경을 만들면 자연도태되고, 내산성이 강한 야생 효모와 젖산균이 자리잡으면서 일시적으로 조용해집니다. 이 "조용한 시기"가 오히려 안정화 진행 중이라는 신호입니다.' },
              { q: '냉장 보관 중인 스타터는 얼마나 오래 살 수 있나요?',
                a: '건강한 스타터는 냉장 보관 시 1~2주, 길게는 몇 달도 유지됩니다. 냉장에서 꺼낸 후 1~2회 급이로 활성화시키면 사용 가능합니다. 물 위에 뜨는 회색/검은 액체(후치, hooch)는 알코올로 버리고 아래 스타터만 사용하면 됩니다.' },
              { q: '통밀이나 호밀을 섞으면 왜 더 빨리 활성화되나요?',
                a: '통밀과 호밀에는 겨(bran)가 포함되어 있어 야생 효모와 영양분이 풍부합니다. 특히 호밀은 펜토산 성분이 발효를 촉진해 백밀 단독보다 훨씬 빠르게 활성화됩니다. 처음 스타터를 만들 때 호밀 10~20%를 섞으면 안정화가 빨라집니다.' },
              { q: '사워도우를 베이킹에 사용할 때 가장 좋은 타이밍은?',
                a: '피크 직전~피크 직후 1시간 이내가 최적입니다. 스타터를 물에 넣었을 때 뜨는지 확인하는 플로트 테스트와 함께, 표면에 많은 기포가 보이고 전체가 둥글게 부풀어 있을 때 사용하세요. 피크를 완전히 지나 꺼지기 시작하면 활성이 떨어져 빵이 잘 부풀지 않을 수 있습니다.' },
            ]

export default function SourdoughPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />사워도우 스타터 &amp; 르방 피크 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        스타터 안정화 진단 + 피크 시간 예측 + <strong style={{ color: 'var(--text)' }}>급이 일정 자동 스케줄러</strong>.
      </p>

      <SourdoughClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 사워도우 스타터란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            사워도우 스타터(르방)란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            사워도우 스타터는 <strong style={{ color: 'var(--text)' }}>야생 효모(Wild Yeast)와 젖산균(LAB)의 공생 배양체</strong>입니다. 밀가루와 물만으로 공기 중의 미생물을 포집해 만드는 천연 발효종으로, 프랑스어로는 <strong style={{ color: 'var(--text)' }}>르방(Levain)</strong>이라 부릅니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '🍞 깊은 풍미',  desc: '젖산·초산이 만드는 복합적인 산미와 감칠맛. 상업 이스트 빵에서는 얻을 수 없는 향미.' },
              { title: '🌾 소화 흡수',  desc: '긴 발효 중 글루텐이 일부 분해되고 피트산이 중화되어, 일반 빵보다 소화가 잘 됩니다.' },
              { title: '🕰️ 긴 보존성',  desc: '산성 환경 덕분에 곰팡이 억제 효과가 있어 상업 빵보다 오래 보관할 수 있습니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 7~14일 로드맵 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            사워도우 스타터 7~14일 로드맵
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['일차', '예상 상태', '냄새', '권장 행동'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '1~2일',    s: '반응 없거나 약한 기포',     n: '밀가루 냄새',       a: '그냥 기다리기' },
                  { d: '2~3일',    s: '활발한 기포, 2배 이상 팽창', n: '시큼하고 역함',     a: '정상! 계속 급이' },
                  { d: '3~5일',    s: '팽창 줄어듦',               n: '아세톤/치즈 냄새',  a: '급이 비율 늘리기' },
                  { d: '5~8일',    s: '들쑥날쑥',                  n: '시큼함 안정',       a: '같은 시간 급이 유지' },
                  { d: '8~12일',   s: '패턴 형성',                 n: '상큼한 시큼함',     a: '피크 타이밍 기록' },
                  { d: '12~14일',  s: '예측 가능한 피크',          n: '요거트+빵 냄새',    a: '베이킹 테스트!' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 급이 비율 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            급이 비율 이해하기
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--accent)', textAlign: 'center', margin: '0 0 8px' }}>
              1 : 1 : 1
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
              스타터 : 물 : 밀가루 &nbsp;·&nbsp; 예) 20g : 20g : 20g
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['비율', '특징', '피크 속도', '적합 온도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '1:1:1', f: '음식 적음 → 빠름',   p: '3~4시간',   t: '서늘한 곳' },
                  { r: '1:2:2', f: '균형 잡힌 표준',     p: '4~6시간',   t: '20~24°C' },
                  { r: '1:3:3', f: '여유로운 급이',       p: '5~8시간',   t: '따뜻한 곳' },
                  { r: '1:5:5', f: '음식 많음 → 느림',    p: '7~10시간',  t: '25°C 이상' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.f}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 500 }}>{row.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ※ 피크 속도는 <strong style={{ color: 'var(--text)' }}>24°C·백밀·피크 직후 급이</strong> 기준 (위 계산기와 동일). 온도가 10°C 낮아지면 약 2배 느려지고, 통밀·호밀을 섞으면 빨라집니다. &lsquo;적합 온도&rsquo;는 각 비율에 권장하는 보관 환경입니다.
          </p>
        </div>

        {/* ── 4. 온도별 발효 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            온도별 발효 속도 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '15~18°C', c: '#0891B2', title: '느린 발효', desc: '피크 12~18시간. 복잡한 산미 발달에 유리합니다. 겨울철 실내 일반.' },
              { t: '20~22°C', c: '#059669', title: '표준 속도', desc: '균형 잡힌 발효. 대부분의 레시피가 가정하는 기준 온도입니다.' },
              { t: '23~25°C', c: '#0EA5E9', title: '빠른 발효', desc: '여름 실내 일반. 급이 주기를 12시간 이하로 짧게 가져가세요.' },
              { t: '26~28°C', c: '#EA580C', title: '매우 빠름', desc: '급이 비율을 1:3:3 이상으로 늘려야 과발효를 막을 수 있습니다.' },
              { t: '28°C+',   c: '#DC2626', title: '주의 구간', desc: '아세톤 생성 위험. 냉장 보관이나 에어컨 공간 활용을 고려하세요.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${z.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 800, color: z.c, marginBottom: '4px' }}>{z.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>{z.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 자주 하는 실수 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 하는 실수 &amp; 해결법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { p: '🧪 아세톤/매니큐어 냄새', c: '#DC2626', s: '과산성화 상태. 스타터 일부만 남기고 1:5:5 비율로 리셋. 2~3회 급이 후 정상화됩니다.' },
              { p: '💥 초반 폭발 후 조용해짐', c: '#0EA5E9', s: '유해균→효모로 교체되는 정상 과정. 2~3일 더 급이를 유지하면 다시 반응이 올라옵니다.' },
              { p: '⏱️ 피크가 너무 빠름 (2시간 이내)', c: '#EA580C', s: '온도가 과도하게 높습니다. 더 시원한 곳으로 옮기거나 급이 비율을 1:3:3 이상으로 늘리세요.' },
              { p: '⏳ 24시간 동안 피크 없음', c: '#0891B2', s: '너무 차갑습니다. 22~25°C 공간으로 옮기거나 호밀가루 10~20%를 섞어 활성화 속도를 높이세요.' },
              { p: '💧 물처럼 묽어짐', c: '#EA580C', s: '과발효로 글루텐이 분해된 상태. 급이 횟수를 1일 2회로 늘리고, 밀가루 비율을 스타터의 2배로.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.c}55`, borderLeft: `3px solid ${m.c}`, borderRadius: '10px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: m.c, marginBottom: '6px' }}>{m.p}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{m.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 플로트 테스트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            플로트 테스트(Float Test) 해석 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            스타터 한 찻숟가락을 물에 넣어 떠오르는지 확인하는 간단한 성숙도 테스트입니다. 충분히 가스가 차 있으면 떠오릅니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { icon: '✅', title: '뜨면', color: '#059669', desc: '충분한 가스 생성 = 베이킹 준비 완료. 피크 직후 타이밍일 가능성이 높습니다.' },
              { icon: '❌', title: '가라앉으면', color: '#DC2626', desc: '아직 미성숙이거나 이미 피크를 지난 상태. 1~2시간 더 기다리거나 다음 급이 후 재테스트.' },
              { icon: '⚠️', title: '주의', color: '#EA580C', desc: '묽은 스타터·호밀 비율이 높은 경우 부정확할 수 있습니다. 부피 2배 팽창 확인을 병행하세요.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '18px', marginBottom: '6px' }}>{f.icon}</p>
                <p style={{ fontSize: '13px', color: f.color, fontWeight: 700, marginBottom: '6px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ_LD.map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
                <summary style={{ cursor: 'pointer', padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--text)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span>Q. {faq.q}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>▼</span>
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, padding: '0 20px 16px', margin: 0, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>A. {faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',    desc: '르방 양에 맞춰 재료 비율 자동 계산' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',          desc: '베이킹 날까지 카운트다운' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',       desc: '반죽 휴지 시간 관리' },
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
