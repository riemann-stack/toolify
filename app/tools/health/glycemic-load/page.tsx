import Link from 'next/link'
import GlycemicLoadClient from './GlycemicLoadClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/health/glycemic-load',
  title: '당부하지수(GL) 계산기 — 식품별 GI·GL 조회표',
  description: '음식과 섭취량으로 당부하지수(GL)를 계산하고 한 끼 총 GL을 합산. 밥·과일·간식 GI 조회표와 저·중·고 판정. 혈당 스파이크 관리 참고용.',
  keywords: [
    '당부하지수 계산', 'GL 지수', '혈당지수 GI 표', '당부하지수 낮은 음식',
    '혈당 스파이크 음식', 'GI GL 차이', '혈당지수 계산기', '식품 GI',
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
    q: 'GI와 GL(당부하지수)의 차이가 뭔가요?',
    a: '<strong>GI(혈당지수)</strong>는 그 음식의 탄수화물이 <strong>얼마나 빨리 혈당을 올리는지</strong>를 포도당(100) 기준으로 나타낸 값입니다. 하지만 GI는 "실제로 얼마나 먹는지"를 반영하지 못합니다. 대표적으로 <strong>수박은 GI가 72로 높지만</strong> 한 쪽에 든 탄수화물이 적어 실제 혈당 영향은 작습니다. 이를 보완한 것이 <strong>GL(당부하지수) = 탄수화물량 × GI ÷ 100</strong>으로, 먹는 양까지 반영해 더 현실적입니다.',
  },
  {
    q: 'GL은 얼마부터 높은 건가요?',
    a: '1회 섭취 기준으로 <strong>GL 10 이하는 낮음, 11~19는 보통, 20 이상은 높음</strong>으로 봅니다. 하루 총합으로는 대략 80 이하를 낮은 편으로 봅니다. 예를 들어 흰쌀밥 한 공기는 GL이 약 57로 매우 높고, 사과 한 개는 약 9로 낮습니다. GL이 높은 음식을 자주·많이 먹으면 혈당이 급격히 오르내리는 "혈당 스파이크"가 반복될 수 있습니다.',
  },
  {
    q: '혈당 스파이크가 왜 문제인가요?',
    a: '혈당이 <strong>급격히 올랐다가 급격히 떨어지는 것</strong>을 혈당 스파이크라고 합니다. 반복되면 인슐린 저항성을 키우고, 급강하 뒤에 다시 배고픔·피로·집중력 저하가 오기 쉽습니다. GL이 낮은 음식을 고르고, 흰쌀밥 같은 고GL 음식은 <strong>채소·단백질과 함께, 양을 조절해</strong> 먹으면 스파이크를 완만하게 만들 수 있습니다.',
  },
  {
    q: '같은 음식이라도 GI가 달라질 수 있나요?',
    a: '네, 꽤 많이 달라집니다. <strong>조리법(오래 익힐수록 ↑), 숙성도(잘 익은 바나나 ↑), 가공(주스로 갈면 ↑), 함께 먹는 음식(지방·단백질·식이섬유는 ↓)</strong>에 따라 실제 혈당 반응이 바뀝니다. 그래서 이 조회표의 GI 값은 <strong>대표 참고치</strong>이며, 같은 음식도 상황에 따라 ±10 이상 차이날 수 있습니다.',
  },
  {
    q: 'GL을 낮추는 실전 팁이 있나요?',
    a: '① <strong>먹는 순서</strong> — 채소·단백질을 먼저, 밥·면을 나중에. ② <strong>정제 탄수 줄이기</strong> — 흰쌀밥 대신 잡곡밥, 흰빵 대신 통밀빵. ③ <strong>통째로 먹기</strong> — 주스보다 생과일, 곱게 간 것보다 덜 가공된 형태. ④ <strong>식후 가벼운 활동</strong> — 10~15분 걷기만으로도 식후 혈당이 완만해집니다. 양을 줄이는 것만으로도 GL은 비례해서 내려갑니다.',
  },
  {
    q: '당뇨가 있으면 이대로 먹으면 되나요?',
    a: '<strong>아니요. 이 도구는 참고용입니다.</strong> 당뇨·임신성 당뇨·전단계가 있으면 개인의 혈당 반응·약물·전체 식단을 고려해야 하므로, 반드시 <strong>의사·영양사와 상의</strong>해 식이를 정하세요. GI·GL은 식품을 비교하는 하나의 지표일 뿐, 열량·영양 균형·전체 식사 맥락을 대체하지 않습니다.',
  },
]

const RELATED = [
  { href: '/tools/health/hba1c', icon: '🩸', name: '당화혈색소 변환기', desc: 'HbA1c↔평균혈당' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 계산기', desc: '목표까지 기간' },
  { href: '/tools/cooking/nuts', icon: '🥜', name: '견과류 섭취량 계산기', desc: '하루 적정량' },
  { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '비만도·정상 체중' },
  { href: '/tools/cooking/serving', icon: '🍚', name: '1인분 분량 계산기', desc: '식재료 1인분' },
]

export default function GlycemicLoadPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        건강·웰빙
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />당부하지수(GL) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        음식·섭취량으로 <strong style={{ color: 'var(--text)' }}>당부하지수(GL)를 계산</strong>하고 한 끼 총 GL 합산 + 식품별 GI 조회표.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="GL = 탄수화물(g)×GI÷100 · 판정 저 ≤10 / 중 11~19 / 고 ≥20 (1회 기준)"
        sources={[
          { label: '국제 GI 표 (시드니대 GI 데이터베이스)', href: 'https://glycemicindex.com' },
          { label: 'Harvard Health — GI/GL 안내', href: 'https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods' },
        ]}
      />

      <GlycemicLoadClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 공식 */}
        <section>
          <h2 style={sectionTitle}>당부하지수(GL) 계산 공식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>GL</span> = 1회 섭취 탄수화물(g) × GI ÷ 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>판정: 저 ≤10 · 중 11~19 · 고 ≥20 (1회 기준)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>예: 흰쌀밥 1공기 = 66g × 86 ÷ 100 ≈ 57 (고)</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ GI가 높아도 실제 먹는 양의 탄수화물이 적으면 GL은 낮습니다(예: 수박). 그래서 <strong style={{ color: 'var(--text)' }}>양까지 반영한 GL</strong>이 혈당 영향을 더 현실적으로 보여줍니다.
          </p>
        </section>

        {/* 2. GI vs GL 대표 예 */}
        <section>
          <h2 style={sectionTitle}>GI는 높은데 GL은 낮은 음식</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품 (1회분)', 'GI', '탄수', 'GL', '판정'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i >= 1 && i <= 3 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['수박 (1쪽)', '72', '11g', '8', '낮음', 'var(--success)'],
                  ['흰쌀밥 (1공기)', '86', '66g', '57', '높음', 'var(--danger)'],
                  ['사과 (중 1개)', '36', '25g', '9', '낮음', 'var(--success)'],
                  ['감자 찐 (중 1개)', '82', '24g', '20', '높음', 'var(--danger)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[3]}</td>
                    <td style={{ padding: '10px 12px', color: r[5], fontWeight: 700 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            수박·사과는 GI만 보면 오해할 수 있지만, 실제 먹는 양 기준 GL은 낮습니다. 반대로 흰쌀밥·감자는 GI도 높고 양도 많아 GL이 큽니다.
            GI 값은 국제 GI 표(International Tables of GI/GL Values)를 참고한 대표치로, 조리법·숙성도에 따라 달라질 수 있습니다.
          </p>
        </section>

        {/* 3. GL 낮추기 */}
        <section>
          <h2 style={sectionTitle}>혈당 스파이크 줄이는 실전 습관</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '먹는 순서 바꾸기', d: '채소·단백질 먼저 → 밥·면 나중에. 식후 혈당 상승이 완만해집니다.' },
              { t: '정제 탄수 → 통곡물', d: '흰쌀밥→잡곡밥, 흰빵→통밀빵. 식이섬유가 흡수를 늦춥니다.' },
              { t: '주스보다 생과일', d: '갈거나 즙을 내면 GI가 올라갑니다. 통째로 씹어 먹기.' },
              { t: '식후 10분 걷기', d: '가벼운 활동만으로도 식후 혈당이 낮아집니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>✅ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

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
