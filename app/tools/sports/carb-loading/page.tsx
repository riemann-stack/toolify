import Link from 'next/link'
import CarbLoadingClient from './CarbLoadingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/carb-loading',
  title: '카보로딩 계산기 — 마라톤 탄수화물 로딩 플래너',
  description: '체중·대회 유형으로 대회 전 하루 탄수화물 목표량(g)과 날짜별 플랜을 계산. 밥·바나나·에너지젤 등 음식 환산 + 대회 아침 섭취량까지.',
  keywords: [
    '카보로딩', '카보로딩 방법', '마라톤 카보로딩', '탄수화물 로딩', '글리코겐 로딩',
    '마라톤 전날 식사', '카보로딩 음식', '대회 전 식단',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '카보로딩이 뭔가요?',
    a: '<strong>카보로딩(carbohydrate loading, 글리코겐 로딩)</strong>은 지구력 대회 전에 탄수화물을 평소보다 많이 먹어 근육·간에 저장되는 <strong>글리코겐(에너지 저장 형태)</strong>을 최대로 채워두는 식이 전략입니다. 마라톤처럼 90분을 넘는 경기에서는 저장된 글리코겐이 바닥나면 이른바 "벽(bonking)"에 부딪혀 급격히 느려지는데, 로딩으로 이 시점을 늦출 수 있습니다.',
  },
  {
    q: '탄수화물을 얼마나 먹어야 하나요?',
    a: '풀코스·울트라처럼 <strong>90분을 넘는 경기</strong>는 대회 전 1~2일간 <strong>체중 1kg당 10~12g</strong>의 탄수화물이 권장됩니다(IOC·ACSM). 65kg이면 하루 650~780g입니다. 하프나 60~90분 경기는 8~10g/kg, 10km 이하 짧은 경기는 7~8g/kg 정도로 전날 일반 충전이면 충분하고 굳이 극단적인 로딩은 필요 없습니다. 위 계산기에 체중과 대회 유형을 넣으면 하루 목표량과 음식 환산이 나옵니다.',
  },
  {
    q: '언제부터 시작해야 하나요?',
    a: '풀코스 기준 <strong>대회 2~3일 전(D-2)부터</strong> 시작하는 것이 일반적입니다. 예전에는 일주일 전 탄수화물을 극도로 줄였다가 채우는 "고갈-로딩" 방식을 썼지만, 요즘은 <strong>고갈 단계 없이 대회 전 36~48시간만 충전</strong>하는 방식이 부작용이 적고 효과는 비슷하다고 봅니다. 이 기간에는 훈련량을 줄여(테이퍼링) 저장된 글리코겐을 아껴야 합니다.',
  },
  {
    q: '로딩하면 몸무게가 느는데 괜찮나요?',
    a: '네, <strong>정상입니다.</strong> 글리코겐 1g은 물 약 3g과 함께 저장되기 때문에, 로딩을 제대로 하면 <strong>체중이 1~2kg 늘고 몸이 약간 무겁게</strong> 느껴집니다. 이 물은 경기 중 에너지를 쓰면서 함께 방출되어 오히려 탈수를 늦춰줍니다. 늘어난 체중을 걱정해 로딩을 건너뛰면 후반에 더 크게 무너질 수 있습니다.',
  },
  {
    q: '무엇을 먹어야 하나요?',
    a: '소화가 잘 되고 <strong>지방·식이섬유가 적은 탄수화물</strong> 위주가 좋습니다 — 흰쌀밥·떡·감자·고구마·파스타·식빵·바나나·스포츠음료 등. 로딩 기간에 <strong>식이섬유(현미·잡곡·채소)를 줄이면</strong> 대회 당일 화장실 문제를 줄일 수 있습니다. 가장 중요한 원칙은 <strong>대회 당일과 전날에 새로운 음식을 시도하지 않는 것</strong> — 반드시 평소 먹어 소화가 검증된 음식만 드세요.',
  },
  {
    q: '대회 당일 아침은 어떻게 먹나요?',
    a: '출발 <strong>1~4시간 전에 체중 1kg당 1~4g</strong>의 탄수화물을 먹습니다(ACSM). 시작 시간이 가까울수록 적게, 소화 시간이 넉넉할수록 많이 드세요. 예를 들어 출발 3시간 전이라면 밥·바나나·식빵 등으로 충분히, 1시간 전이라면 바나나·에너지젤처럼 가볍고 빠른 것으로. 카페인에 익숙하다면 커피 한 잔도 도움이 될 수 있지만, 이 역시 평소 마시던 것만 드세요.',
  },
]

const RELATED = [
  { href: '/tools/sports/race-plan', icon: '🏁', name: '레이스 페이스 플래너', desc: '구간별 목표 페이스' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '대회 수분 전략' },
  { href: '/tools/sports/race-predictor', icon: '⏱️', name: '마라톤 기록 계산기', desc: '완주 예상 시간' },
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록 환산' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
]

export default function CarbLoadingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />카보로딩 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        마라톤 대회 전 <strong style={{ color: 'var(--text)' }}>하루 탄수화물 목표량과 날짜별 플랜</strong> + 밥·바나나·젤 음식 환산.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="ACSM·IOC 스포츠영양 권고 탄수화물 섭취 기준 (g/kg)"
        sources={[
          { label: 'ACSM 공동 성명 — Nutrition and Athletic Performance (2016)', href: 'https://pubmed.ncbi.nlm.nih.gov/26891166/' },
        ]}
      />

      <CarbLoadingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 원리 */}
        <section>
          <h2 style={sectionTitle}>카보로딩은 왜, 어떻게 효과가 있나</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            우리 몸은 탄수화물을 <strong style={{ color: 'var(--text)' }}>글리코겐</strong> 형태로 근육과 간에 저장합니다. 하지만 저장량은 한정돼 있어, 마라톤처럼 오래 달리면 대개 <strong style={{ color: 'var(--text)' }}>30km 안팎에서 바닥</strong>나며 이때 몸이 급격히 무거워지는 &lsquo;벽&rsquo;을 만납니다. 대회 전 며칠간 탄수화물을 늘리고 운동량을 줄이면 이 저장고를 평소보다 크게 채워, 벽에 부딪히는 시점을 뒤로 미룰 수 있습니다.
          </p>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>하루 목표(g)</span> = 체중(kg) × 탄수화물 계수(g/kg)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>90분 초과: 10~12 · 60~90분: 8~10 · 60분 이내: 7~8</div>
            <div><span style={{ color: 'var(--muted)' }}>대회 아침</span> = 체중 × 1~4 g (출발 1~4시간 전)</div>
          </div>
        </section>

        {/* 2. 대회 유형별 표 */}
        <section>
          <h2 style={sectionTitle}>대회 유형별 로딩 가이드</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대회', '탄수화물', '로딩 기간', '비고'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['풀코스·울트라', '10~12 g/kg', '대회 전 2일', '집중 로딩 효과 큼'],
                  ['하프·장시간 훈련', '8~10 g/kg', '대회 전날', '가벼운 충전'],
                  ['10km 이하', '7~8 g/kg', '대회 전날', '극단 로딩 불필요'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 실수 */}
        <section>
          <h2 style={sectionTitle}>흔한 실수 4가지</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '새 음식 시도', d: '대회 전날·당일 처음 먹는 음식은 배탈 위험. 검증된 음식만.' },
              { t: '지방·기름 과다', d: '삼겹살·튀김 등은 소화 느림. 탄수화물 위주로.' },
              { t: '식이섬유 과다', d: '현미·잡곡·생채소는 화장실 문제. 로딩 땐 흰쌀·정제 탄수화물.' },
              { t: '운동을 그대로', d: '로딩 기간에 훈련량 안 줄이면 채운 글리코겐을 다 써버림.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>❌ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 면책 */}
        <Disclaimer variant="medical" open>
          본 계산기는 <strong>일반 스포츠영양 가이드</strong>이며 개인 맞춤 처방이 아닙니다. 당뇨·신장질환 등 질환이 있거나 식이 조절이 필요한 경우 반드시 전문의·임상영양사와 상담 후 적용하세요.
        </Disclaimer>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
