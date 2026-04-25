import type { Metadata } from 'next'
import Link from 'next/link'
import SubstituteClient from './SubstituteClient'

export const metadata: Metadata = {
  title: '식재료 대체 비율 계산기 — 버터·설탕·계란·생크림 대체 가이드 | Youtil',
  description: '버터 대신 오일, 설탕 대신 꿀, 생크림 대신 우유+버터 등 요리·베이킹 재료 대체 비율을 즉시 계산합니다. 맛·질감 차이, 주의사항, 비건·글루텐프리 옵션 포함.',
  keywords: ['식재료대체', '버터대신오일', '설탕대신꿀', '생크림대체', '베이킹소다베이킹파우더', '계란대체', '비건베이킹', '레몬즙대체'],
}

export default function SubstitutePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔄 식재료 대체 비율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        버터 대신 오일, 설탕 대신 꿀, 생크림 대신 우유+버터 등 <strong style={{ color: 'var(--text)' }}>재료 대체 비율</strong>을 즉시 계산합니다. 맛·질감 차이, 주의사항, 비건·글루텐프리 옵션까지 포함.
      </p>

      <SubstituteClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 대체 가이드 빠른 참조표
          </h2>

          {/* 버터 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🧈 버터 대체</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '식물성 오일', r: '0.75배', u: '일반 요리', w: '쿠키 부적합' },
                  { n: '코코넛 오일', r: '1.0배',  u: '베이킹',     w: '코코넛 향' },
                  { n: '그릭요거트',  r: '0.5배',  u: '머핀·케이크', w: '약간 신맛' },
                  { n: '아보카도',    r: '1.0배',  u: '브라우니',   w: '단맛 베이킹만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 설탕 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍯 설탕 대체</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '꿀',         r: '0.75배',    u: '머핀·드레싱',   w: '160°C 이하' },
                  { n: '메이플시럽', r: '0.75배',    u: '팬케이크',       w: '액체 줄이기' },
                  { n: '알룰로스',   r: '1.3배',     u: '저당 디저트',    w: '단맛 약함' },
                  { n: '스테비아',   r: '매우 적게', u: '음료',           w: '부피 손실' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 생크림 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🥛 생크림 대체</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '우유 + 버터',  r: '1.0배', u: '소스·수프',  w: '휘핑 X' },
                  { n: '코코넛 크림',  r: '1.0배', u: '카레·비건',  w: '코코넛 향' },
                  { n: '에바포레이티드 밀크', r: '1.0배', u: '파스타 소스', w: '단맛 약간' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 베이킹소다 vs 베이킹파우더 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            베이킹소다 vs 베이킹파우더 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #FF8C3E', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#FF8C3E', fontWeight: 700, marginBottom: '8px' }}>🥄 베이킹소다 (NaHCO₃)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>단독으로는 작용 X</li>
                <li>산성 재료(식초·레몬즙·요거트·코코아)와 만나야 부풂</li>
                <li>베이킹파우더보다 약 <strong style={{ color: 'var(--text)' }}>3배 강함</strong></li>
                <li>너무 많이 쓰면 쓴맛</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>🧁 베이킹파우더</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>베이킹소다 + 산성분(주석산) + 전분</li>
                <li><strong style={{ color: 'var(--text)' }}>단독 사용 가능</strong></li>
                <li>일반 케이크·머핀에 사용</li>
                <li>이중 작용 — 반죽 시·구울 때 두 번 부풂</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'rgba(200,255,62,0.06)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>🔁 대체 공식</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>베이킹파우더 1작은술 = <strong style={{ color: 'var(--text)' }}>베이킹소다 1/4작은술 + 산성재료 1/2작은술</strong></li>
              <li>베이킹소다 1작은술 = <strong style={{ color: 'var(--text)' }}>베이킹파우더 3작은술</strong> (산성 재료가 많은 레시피만)</li>
            </ul>
          </div>
        </div>

        {/* ── 3. 비건 대체 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            비건 대체 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #B885DA', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#B885DA', fontWeight: 700, marginBottom: '8px' }}>🥚 계란 1개 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>플랙스에그</strong>: 아마씨 1큰술 + 물 3큰술 (5분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>치아씨드</strong>: 1큰술 + 물 3큰술 (10분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>으깬 바나나 1/2개</strong>: 단맛·바나나향 추가</li>
                <li><strong style={{ color: 'var(--text)' }}>두부 60g</strong>: 무미, 키슈·스크램블 적합</li>
                <li><strong style={{ color: 'var(--text)' }}>아쿠아파바 3큰술</strong>: 흰자 대체, 머랭 가능</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EC8FF', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#3EC8FF', fontWeight: 700, marginBottom: '8px' }}>🥛 유제품 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>우유 → 두유·아몬드밀크·귀리밀크</strong> (1:1 비율)</li>
                <li><strong style={{ color: 'var(--text)' }}>버터 → 코코넛 오일</strong> (1:1, 고체 상태)</li>
                <li><strong style={{ color: 'var(--text)' }}>생크림 → 코코넛 크림</strong> (1:1, 차갑게 하면 휘핑 가능)</li>
                <li><strong style={{ color: 'var(--text)' }}>요거트 → 두유 + 레몬즙</strong> (1컵당 1큰술)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. 글루텐프리 대체 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            글루텐프리 대체 (밀가루 1컵 대체)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '쌀가루 + 잔탄검',     r: '쌀가루 1컵 + 잔탄검 1/4작은술', c: '#3EFF9B', d: '글루텐 효과를 잔탄검으로 보완. 가장 무난한 선택.' },
              { n: '아몬드 가루',         r: '동량 (액체 약간 줄이기)',         c: '#FFB83E', d: '쿠키·케이크에 적합. 너트향, 진한 색.' },
              { n: '오트밀 가루 + 잔탄검', r: '동량 + 잔탄검 1/4작은술',         c: '#C8FF3E', d: '머핀·쿠키. 진한 식감.' },
              { n: '시판 글루텐프리 믹스', r: '동량',                            c: '#3EC8FF', d: '가장 안전. 이미 잔탄검·여러 가루 블렌딩됨.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.c}33`, borderLeft: `3px solid ${g.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '13px', color: g.c, fontWeight: 700 }}>{g.n}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{g.r}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '버터 대신 오일을 쓸 때 양은 어떻게 조절하나요?',
                a: '일반적으로 버터 100g을 오일 75ml(약 75%)로 대체합니다. 버터에는 수분(약 15%)이 포함되어 있어 같은 양을 쓰면 너무 기름지기 때문입니다. 쿠키나 페이스트리는 버터의 고체 성질이 중요해 오일 대체가 부적합하지만, 머핀·브라우니·팬케이크는 오일로 대체해도 잘 됩니다.' },
              { q: '베이킹소다 대신 베이킹파우더를 써도 되나요?',
                a: '가능하지만 양을 3배로 늘려야 합니다. 베이킹소다 1작은술 = 베이킹파우더 3작은술입니다. 다만 레시피에 산성 재료(식초·레몬즙·요거트·코코아)가 많이 들어간다면 베이킹파우더로는 충분한 반응이 일어나지 않아 부적합합니다.' },
              { q: '설탕 대신 꿀을 쓸 때 주의할 점은?',
                a: '꿀은 설탕보다 단맛이 강하고 수분이 있어 양을 75%로 줄이고 다른 액체 재료를 1/4컵 정도 줄여야 합니다. 또한 꿀은 빨리 타기 때문에 베이킹 온도를 약 15°C 낮추는 것이 좋습니다(180°C → 160°C). 쿠키 색깔이 더 진해지고 풍미가 깊어집니다.' },
              { q: '비건 베이킹에서 계란을 어떻게 대체하나요?',
                a: '가장 인기 있는 대체는 플랙스에그입니다. 아마씨 가루 1큰술과 물 3큰술을 섞어 5분 두면 끈끈해지는데 이것이 계란 1개 역할을 합니다. 무미·무취에 가까워 대부분 베이킹에 적합합니다. 달콤한 베이킹에는 으깬 바나나(계란 1개당 1/2개)나 사과소스도 좋습니다.' },
              { q: '생크림이 없을 때 어떻게 만들 수 있나요?',
                a: '생크림 1컵 = 우유 3/4컵 + 버터 1/4컵(녹여서 식힌 것)으로 대체 가능합니다. 단, 이 조합은 휘핑(거품 내기)이 안 되므로 휘핑크림 용도로는 사용할 수 없습니다. 소스, 수프, 카레 등 가열 요리에는 거의 동일하게 쓸 수 있습니다. 휘핑이 필요하다면 코코넛 크림(차갑게 식힌 것)을 사용하는 것이 좋습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',       icon: '📐', name: '레시피 비율 계산기',     desc: '인분 변경 시 재료 비율 조정' },
              { href: '/tools/cooking/unit',         icon: '🥄', name: '요리 단위 변환기',       desc: 'g·ml·컵·큰술 즉시 변환' },
              { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 기간 계산기', desc: '냉장·냉동 D-day 추적' },
              { href: '/tools/cooking/nuts',         icon: '🌰', name: '견과류 적정 섭취량 계산기', desc: '하루 권장 섭취량·칼로리' },
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
