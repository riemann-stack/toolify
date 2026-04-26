import Link from 'next/link'
import NutsClient from './NutsClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/nuts',
  title: '견과류 하루 적정 섭취량 계산기 — 아몬드·호두·브라질너트',
  description: '아몬드·호두·캐슈넛·브라질너트 등 견과류별 하루 적정 섭취량(g·알 수)과 칼로리·영양소를 계산합니다. 브라질너트 셀레늄 위험, 가공 상태별 주의사항 안내.',
  keywords: ['견과류섭취량', '아몬드하루몇개', '호두하루몇개', '브라질너트하루', '견과류칼로리', '견과류영양소', '혼합견과류하루권장량'],
})

export default function NutsPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌰 견과류 하루 적정 섭취량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        아몬드·호두·브라질너트 등 12종 견과류별 <strong style={{ color: 'var(--text)' }}>알 수·그램·칼로리·영양소</strong>를 계산합니다. 가공 상태·개인 목표 반영, 브라질너트 셀레늄 과잉 경고 포함.
      </p>

      <NutsClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            견과류 하루 적정 섭취량 빠른 참조표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['견과류', '1회', '알 수', '칼로리', '핵심 영양소', '특이사항'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🌰 아몬드',       s: '28g', c: '약 23알',    k: '164kcal', v: '비타민E',      note: '-' },
                  { n: '🌰 호두',         s: '28g', c: '반쪽 14개',  k: '185kcal', v: '오메가3',      note: '-' },
                  { n: '🥜 캐슈넛',       s: '28g', c: '약 18알',    k: '157kcal', v: '마그네슘',     note: '-' },
                  { n: '🌰 브라질너트',   s: '10g', c: '2~3알',      k: '66kcal',  v: '셀레늄',       note: '⚠️ 엄격 제한' },
                  { n: '🥜 땅콩',         s: '28g', c: '약 28알',    k: '161kcal', v: '단백질',       note: '콩과식물' },
                  { n: '🌻 해바라기씨',   s: '28g', c: '—',          k: '165kcal', v: '비타민E',      note: '-' },
                  { n: '🎃 호박씨',       s: '28g', c: '—',          k: '151kcal', v: '아연',         note: '-' },
                  { n: '🌰 피스타치오',   s: '28g', c: '약 49알',    k: '159kcal', v: '비타민B6',     note: '알이 가장 많음' },
                  { n: '🌰 마카다미아',   s: '28g', c: '약 10알',    k: '204kcal', v: '단일불포화',   note: '고칼로리' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.v}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 브라질너트 주의 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🚨 브라질너트 셀레늄 주의
          </h2>
          <div style={{ background: 'rgba(255,50,50,0.06)', border: '2px solid rgba(255,80,80,0.4)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 700, marginBottom: '8px' }}>
              브라질너트 1알 = 셀레늄 약 68~91μg
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>성인 하루 셀레늄 권장량: <strong>55μg</strong></li>
              <li>상한 섭취량(UL): <strong>400μg</strong> — 이 이상 독성</li>
              <li>브라질너트 <strong>2~3알</strong>이면 이미 일일 권장량 초과</li>
              <li>브라질너트 <strong>4~5알</strong> 이상 매일 섭취 시 상한선 접근</li>
            </ul>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>셀레늄 과잉 섭취 증상 (Selenosis)</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              탈모 · 손발톱 변형·탈락 · 구토·설사 · 신경계 손상 · 마늘 냄새 호흡 · 피로감
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
              ⚠️ 장기 과다 섭취로 인한 셀레늄 중독(selenosis) 사례가 의학 저널에 다수 보고되어 있습니다. 견과류 혼합팩을 사실 때 브라질너트 비율을 반드시 확인하세요.
            </p>
          </div>
        </div>

        {/* ── 3. 목적별 선택 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목적별 견과류 선택 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { goal: '🔻 다이어트', c: '#3EFF9B', picks: '피스타치오(껍질), 아몬드', why: '껍질 까는 시간으로 섭취 속도 조절, 식이섬유·단백질로 포만감' },
              { goal: '📉 혈당 관리', c: '#3EC8FF', picks: '아몬드, 호두', why: '혈당 지수(GI) 낮고, 인슐린 감수성 개선' },
              { goal: '💪 근육 증가', c: '#C8FF3E', picks: '땅콩, 호박씨', why: '단백질 함량 최다 (28g당 7~8g)' },
              { goal: '🧠 뇌 건강', c: '#B885DA', picks: '호두', why: '오메가3(ALA)가 DHA 전구체로 변환, 뇌 지방산 공급' },
              { goal: '🌟 항산화', c: '#FFB83E', picks: '아몬드·해바라기씨', why: '비타민E 최다, 세포 산화 스트레스 감소' },
              { goal: '🛡 면역·갑상선', c: '#FF8C3E', picks: '브라질너트(소량)', why: '셀레늄 공급 — 단, 하루 2~3알 엄수' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: g.c, fontWeight: 700, marginBottom: '6px' }}>{g.goal}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{g.picks}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 가공 상태 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            무염 vs 가염 vs 가공 견과류
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '🌱 무염 건조',     c: '#3EFF9B', d: '가장 건강. 원래 영양소 그대로 보존. 건강 목적이면 이 선택이 기본.' },
              { n: '🧂 가염',          c: '#3EC8FF', d: '나트륨 추가 (28g당 약 150mg). 고혈압·신장 질환 있으면 주의.' },
              { n: '🔥 볶음',          c: '#FFB83E', d: '일부 항산화 성분 감소, 칼로리 소폭 증가(+5%). 풍미는 향상.' },
              { n: '🛢 오일 코팅',     c: '#FF8C3E', d: '불필요한 지방 추가(+10%). 기름 종류에 따라 트랜스지방 우려.' },
              { n: '🍫 초콜릿·시즈닝', c: '#FF6B6B', d: '설탕·트랜스지방·나트륨 급증(+60%). 건강 효과가 크게 감소 — 간식으로 분류.' },
              { n: '🍯 꿀 코팅',       c: '#FFB83E', d: '당분 추가(+20%). 혈당 상승 빠름, 당뇨 주의.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderLeft: `3px solid ${s.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: s.c, fontWeight: 700, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 보관법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            견과류 보관법 & 산패 주의
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            견과류는 <strong style={{ color: 'var(--text)' }}>불포화지방산이 풍부해 산패되기 쉽습니다</strong>. 냄새가 이상하거나 쓴맛이 나면 산패 신호이므로 즉시 폐기하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['보관 방법', '장소', '기간'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '밀폐 용기, 실온', p: '서늘하고 어두운 곳', t: '1~2개월' },
                  { m: '밀폐 용기, 냉장', p: '4°C 이하',            t: '1~3개월' },
                  { m: '밀폐 용기, 냉동', p: '−18°C 이하',          t: '최대 1년' },
                  { m: '껍질 있는 통째',  p: '서늘한 곳',            t: '6개월 이상' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            💡 분쇄한 견과류는 통째보다 산패가 3~5배 빠릅니다. 필요할 때만 갈아서 사용하세요.
          </p>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '견과류는 하루에 얼마나 먹어야 하나요?',
                a: '대부분의 견과류는 하루 28g(1온스, 한 줌)이 국제 영양 학회의 표준 1회 제공량입니다. 이는 아몬드 약 23알, 호두 반쪽 14개, 피스타치오 약 49알에 해당합니다. 하루 열량의 10~15%를 초과하지 않는 것이 좋으며, 2000kcal 기준 하루 약 160~200kcal(28g 내외)가 적절합니다.' },
              { q: '브라질너트는 왜 2~3알만 먹어야 하나요?',
                a: '브라질너트는 셀레늄 함량이 매우 높아 1알에만 약 68~91μg의 셀레늄이 들어있습니다. 성인 하루 셀레늄 상한 섭취량은 400μg인데 브라질너트 4~5알이면 이를 초과할 수 있습니다. 셀레늄 과잉 섭취 시 탈모, 손발톱 변형, 신경계 손상이 발생할 수 있습니다. 하루 2~3알(10g 이내)로 제한하세요.' },
              { q: '견과류를 먹으면 살이 찌나요?',
                a: '견과류는 칼로리가 높지만(28g당 150~200kcal) 연구에 따르면 오히려 체중 관리에 도움이 됩니다. 포화지방 대신 불포화지방이 많고 식이섬유와 단백질이 포만감을 높여 전체 식사량을 줄이는 효과가 있습니다. 단, 대량 섭취는 칼로리 과잉으로 이어질 수 있으니 적정량 준수가 중요합니다.' },
              { q: '견과류 알레르기는 어떻게 구분하나요?',
                a: '견과류 알레르기는 크게 세 그룹으로 나뉩니다. 핵과류(아몬드·캐슈넛·피스타치오·호두·피칸·헤이즐넛)는 서로 교차 반응이 있어 하나에 알레르기가 있으면 다른 핵과류도 주의해야 합니다. 땅콩은 콩과식물로 견과류와 다른 알레르기 그룹입니다. 씨앗류(해바라기씨·호박씨)는 또 다른 그룹입니다.' },
              { q: '어떤 견과류가 가장 건강에 좋나요?',
                a: '목적에 따라 다릅니다. 심혈관 건강에는 오메가3가 풍부한 호두, 항산화에는 비타민E가 많은 아몬드와 해바라기씨, 단백질 보충에는 땅콩, 면역과 갑상선 건강에는 브라질너트(소량)가 좋습니다. 특정 견과류에 집중하기보다 혼합 견과류(mixed nuts)를 다양하게 섭취하는 것이 영양소 균형 면에서 가장 좋습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 의료 면책 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            의료 면책 조항
          </h2>
          <div style={{ background: 'rgba(200,255,62,0.04)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
              본 계산기는 일반적인 영양 정보를 참고용으로 제공합니다. 개인의 건강 상태, 알레르기, 기저 질환(신장 질환·갑상선 질환 등)에 따라 적정 섭취량이 다를 수 있습니다. 브라질너트 등 특정 견과류의 경우 과다 섭취 시 건강에 해로울 수 있으며, 구체적인 식이 계획은 의사 또는 영양사와 상담하시기 바랍니다. <br />
              <span style={{ fontSize: '11px' }}>* 참고: 한국영양학회 영양소 섭취기준, WHO 영양 지침, USDA FoodData Central</span>
            </p>
          </div>
        </div>

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량(BMR) 계산기',  desc: '하루 칼로리 목표 계산' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 계산기',          desc: '다이어트 기간·칼로리 적자' },
              { href: '/tools/cooking/recipe',    icon: '📐', name: '레시피 비율 계산기',         desc: '견과류 혼합 레시피' },
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',                desc: '현재 체중 적정성' },
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
