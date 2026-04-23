import type { Metadata } from 'next'
import Link from 'next/link'
import ServingClient from './ServingClient'

export const metadata: Metadata = {
  title: '1인분 분량 계산기 — 파스타·고기·쌀 인분별 장보기 가이드 | Youtil',
  description: '파스타 1인분 몇 g, 소면 2인분, 불고기 3인분 장보기 분량을 계산합니다. 면류·고기류·쌀·채소 건면/생고기 기준, 식사량·탄수화물 포함 여부 반영.',
  keywords: ['1인분분량계산기', '파스타1인분몇g', '소면1인분', '불고기인분계산', '장보기분량', '인분계산기', '요리분량가이드', '샤브샤브1인분'],
}

export default function ServingPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍽️ 1인분 분량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        파스타·소면·고기·쌀 등 재료별 <strong style={{ color: 'var(--text)' }}>인분별 장보기 분량</strong>을 계산합니다. 건면/생고기 기준 · 식사 유형·식사량·탄수화물 포함 여부 반영 · 복수 재료 합산 장보기 목록 제공.
      </p>

      <ServingClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            재료별 1인분 기준 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            메인 식사, 보통 식사량, 성인 기준
          </p>

          {/* 면류 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍝 면류 (건면 기준)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '조리 후'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '파스타',       a: '90~110g',   b: '180~220g',  c: '360~440g',  d: '약 2.2배' },
                  { n: '소면',         a: '80~100g',   b: '160~200g',  c: '320~400g',  d: '약 2.5배' },
                  { n: '우동면 (생)',  a: '180~220g',  b: '360~440g',  c: '720~880g',  d: '그대로' },
                  { n: '쌀국수면',     a: '70~90g',    b: '140~180g',  c: '280~360g',  d: '약 2.3배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 고기류 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🥩 고기류 (생고기 기준)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '조리 후'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '소고기 구이',   a: '180~220g', b: '360~440g', c: '720~880g',  d: '약 75%' },
                  { n: '소불고기',      a: '150~200g', b: '300~400g', c: '600~800g',  d: '약 80%' },
                  { n: '삼겹살 구이',   a: '200~250g', b: '400~500g', c: '800~1000g', d: '약 75%' },
                  { n: '닭가슴살',      a: '130~170g', b: '260~340g', c: '520~680g',  d: '약 75%' },
                  { n: '샤브샤브',      a: '130~170g', b: '260~340g', c: '520~680g',  d: '약 85%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 쌀 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍚 쌀 (생쌀 기준)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '밥이 되면'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '흰쌀',     a: '85~95g',  b: '170~190g', c: '340~380g', d: '약 2.4배' },
                  { n: '현미',     a: '90~100g', b: '180~200g', c: '360~400g', d: '약 2.2배' },
                  { n: '죽용 쌀',  a: '40~50g',  b: '80~100g',  c: '160~200g', d: '약 5~6배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 조리 전/후 중량 변화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            조리 전 / 후 중량 변화 완전 가이드
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>왜 건면·생고기 기준인가</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>마트에서 파는 단위가 <strong style={{ color: 'var(--text)' }}>조리 전 기준</strong>이기 때문</li>
              <li>조리 후 무게는 재료·조리법·시간마다 크게 달라짐</li>
              <li>장보기 기준으로는 조리 전이 가장 실용적</li>
            </ul>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료 유형', '변화율', '예시'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '면류',          p: '+100~150%',  e: '건면 100g → 삶은 면 200~250g' },
                  { t: '고기',          p: '−20~30%',    e: '생고기 100g → 익은 고기 70~80g' },
                  { t: '쌀',            p: '+120~140%',  e: '생쌀 100g → 밥 220~240g' },
                  { t: '채소 (손질 전)', p: '−10~20%',    e: '손질 전 100g → 손질 후 80~90g' },
                  { t: '채소 (볶음)',    p: '−30~40%',    e: '생채소 100g → 볶은 채소 60~70g' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 상황별 분량 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            상황별 분량 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: '🥩 삼겹살 파티 3인 (성인)', items: [
                { label: '고기만 먹는 경우', v: '1인당 250g = 750g' },
                { label: '쌈채소 포함 시', v: '1인당 200g = 600g' },
                { label: '냉면/볶음밥 함께 시', v: '1인당 150g = 450g' },
              ] },
              { title: '🍝 파스타 4인 (메인, 사이드 없음)', items: [
                { label: '일반 식사', v: '400~440g' },
                { label: '많이 먹는 편', v: '480~520g' },
                { label: '크림 소스 (무거운 소스)', v: '360~400g' },
              ] },
              { title: '🍲 샤브샤브 세팅 2인', items: [
                { label: '고기', v: '300~360g' },
                { label: '두부', v: '1모 (300~350g)' },
                { label: '채소', v: '200~250g' },
                { label: '면사리 (선택)', v: '200g' },
              ] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '10px' }}>{g.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {g.items.map((it, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>{it.label}</span>
                      <span style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{it.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 아이 포함 분량 조정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            아이 포함 시 분량 조정 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            연령별 성인 대비 식사량 비율입니다. 이 비율을 성인 인분에 곱해 전체 분량을 계산합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { age: '만 3~5세',   pct: '30~40%', c: '#3EC8FF' },
              { age: '만 6~9세',   pct: '50~60%', c: '#3EFF9B' },
              { age: '만 10~13세', pct: '70~80%', c: '#C8FF3E' },
              { age: '만 14세+',   pct: '거의 성인', c: '#FFB83E' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{g.age}</p>
                <p style={{ fontSize: '18px', color: g.c, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>{g.pct}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,255,62,0.04)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>💡 계산 예시</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>
              성인 2명 + 초등생(10세) 1명 = 2 + 0.75 = <strong>2.75인분</strong>으로 계산
            </p>
          </div>
        </div>

        {/* ── 5. 요리 유형별 고기 분량 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            요리 유형별 고기 분량이 달라지는 이유
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '🔥 구이',             c: '#FFB83E', d: '고기가 메인 — 1인당 200~250g 필요' },
              { n: '🍳 볶음 (제육·불고기)', c: '#FF8C3E', d: '양념·채소가 섞여 포만감 증가 — 1인당 150~180g' },
              { n: '🍲 국·찌개',          c: '#3EC8FF', d: '국물이 포만감을 채움 — 1인당 100~130g' },
              { n: '♨️ 전골·샤브샤브',     c: '#B885DA', d: '채소·두부·면사리와 함께 — 1인당 120~150g' },
              { n: '🥣 육수 베이스 (설렁탕)', c: '#3EFF9B', d: '뼈 포함으로 무게 증가 — 1인당 300~400g (뼈 포함)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderLeft: `3px solid ${s.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: s.c, fontWeight: 700, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '파스타 1인분은 몇 그램인가요?',
                a: '메인 식사 기준 건면 90~110g이 표준입니다. 이탈리아 레스토랑 기준 1인분은 보통 80~100g이지만, 한국인 식사량 기준으로는 사이드 없이 먹을 때 100~120g이 적당합니다. 삶으면 약 2.2배(200~240g)로 늘어납니다.' },
              { q: '삼겹살 3인분이면 몇 g 사야 하나요?',
                a: '고기만 구워 먹는 경우 1인당 200~250g, 3인이면 600~750g입니다. 쌈채소와 함께 먹으면 1인당 180~200g(540~600g), 볶음밥이나 냉면을 마무리로 먹는다면 1인당 150~180g(450~540g)으로 줄여도 됩니다. 마트 삼겹살은 보통 400g, 600g, 1kg 단위로 팔리니 600g 또는 1kg이 3인에게 적당합니다.' },
              { q: '소면 2인분은 건면 기준 몇 g인가요?',
                a: '메인 식사 기준 1인당 80~100g으로 2인분은 160~200g입니다. 소면만 단독으로 비빔국수나 잔치국수로 먹는다면 상한(200g) 기준이 좋습니다. 일반 소면 한 봉(500g)으로 5인분 정도 가능합니다.' },
              { q: '장보기 분량과 실제 먹는 양이 다른 이유는?',
                a: '고기는 익으면 20~30% 줄어들고, 면은 삶으면 2~2.5배 늘어납니다. 이 계산기는 마트에서 구입해야 할 \'조리 전\' 기준으로 표시합니다. 실제 섭취량이 궁금하다면 결과 카드의 \'조리 후 예상량\'을 확인하세요.' },
              { q: '어른 2명 + 아이 1명이면 몇 인분 기준으로 준비하나요?',
                a: '아이 연령에 따라 다르지만 초등 저학년(7~9세) 기준 성인 0.5~0.6인분으로 계산합니다. 성인 2명 + 초등생 1명 = 약 2.6인분으로 준비하면 적당합니다. 넉넉하게 준비하고 싶다면 3인분 기준으로 구입하면 됩니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',         desc: '인분 수에 맞게 재료 비율 조정' },
              { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',           desc: 'g·컵·큰술·oz 즉시 변환' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',            desc: '식비 n빵·단위 올림' },
              { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간 계산기',      desc: '고기 해동 시간·안전 가이드' },
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
