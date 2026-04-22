import type { Metadata } from 'next'
import Link from 'next/link'
import RecipeClient from './RecipeClient'

export const metadata: Metadata = {
  title: '레시피 비율 계산기 — 인분 수 맞춤 재료 계산 | Youtil',
  description: '요리 레시피 재료를 원하는 인분 수에 맞게 자동으로 비율 계산합니다. 2인분 레시피를 5인분으로 변환, 큰술·컵·g 단위 지원.',
  keywords: ['레시피계산기', '인분계산기', '요리재료계산기', '레시피비율', '요리계산기'],
}

export default function RecipePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 레시피 비율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        요리 레시피의 재료를 원하는 인분 수에 맞게 자동으로 비율 계산합니다.
      </p>

      <RecipeClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 계산 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            계산 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '예시 1 — 된장찌개 2인분 → 4인분',
                color: '#3EFF9B',
                rows: [
                  ['된장',  '2큰술',  '4큰술'],
                  ['두부',  '150g',   '300g'],
                  ['애호박','반 개',  '1개'],
                  ['멸치육수','400ml','800ml'],
                  ['대파',  '1/2대',  '1대'],
                ],
              },
              {
                title: '예시 2 — 크림파스타 1인분 → 3인분',
                color: '#C8FF3E',
                rows: [
                  ['파스타면',   '100g',   '300g'],
                  ['생크림',    '150ml',  '450ml'],
                  ['버터',      '1큰술',  '3큰술'],
                  ['소금',      '1/4작은술','3/4작은술'],
                  ['파마산치즈', '2큰술',  '6큰술'],
                ],
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${ex.color}25`, borderRadius: '12px', padding: '18px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: ex.color, marginBottom: '12px' }}>{ex.title}</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['재료', '기준량', '변환량'].map((h, j) => (
                        <th key={j} style={{ padding: '6px 8px', textAlign: j === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ex.rows.map(([name, from, to], j) => (
                      <tr key={j} style={{ borderBottom: j < ex.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '7px 8px', color: 'var(--text)', fontWeight: 500 }}>{name}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: 'var(--muted)' }}>{from}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', color: ex.color, fontWeight: 700 }}>{to}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 단위별 환산 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            요리 단위 환산 기준표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            레시피에서 자주 쓰는 계량 단위와 ml 기준 환산값입니다.
            계량컵·계량스푼은 브랜드마다 약간 차이가 있을 수 있으므로 참고용으로 사용하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', 'ml 기준', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1컵 (계량컵)', '200ml', '한국 기준 (미국은 240ml)'],
                  ['1큰술 (Tbsp)', '15ml', '계량스푼 큰 것'],
                  ['1작은술 (tsp)', '5ml', '계량스푼 작은 것'],
                  ['1/2큰술', '7.5ml', '=1큰술 ÷ 2'],
                  ['1꼬집', '약 0.5g', '손가락 두 개로 집은 양'],
                  ['1줌', '약 10g', '손바닥으로 한 움큼'],
                ].map(([unit, ml, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{ml}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '비율 계산 시 주의할 점은?',
                a: '양념류(소금, 간장, 고추장 등)는 단순 배율로 늘리면 너무 짜질 수 있습니다. 특히 2인분 이상으로 늘릴 때는 계산된 양의 80~90%부터 시작해 간을 보면서 조절하는 것을 권장합니다. 마늘·고추 같은 향신료도 배율 그대로 늘리면 향이 과해질 수 있으니 주의하세요.' },
              { q: '오븐 온도나 조리 시간도 비례해서 늘려야 하나요?',
                a: '아닙니다. 오븐 온도는 인분 수와 무관하게 동일하게 유지하고, 조리 시간은 재료의 두께나 양에 따라 조금씩 늘어날 수 있지만 단순 배율로 늘리지 않습니다. 예를 들어 2인분 닭볶음탕을 4인분으로 늘려도 조리 시간은 5~10분 정도만 더 늘면 됩니다.' },
              { q: '소수점이 나오면 어떻게 계량하나요?',
                a: '"소수점 0.5 단위로 반올림" 옵션을 켜면 1.5큰술, 2.5컵처럼 계량하기 편한 값으로 반올림됩니다. 옵션 없이 계산 시 1.67큰술처럼 나오면 2큰술의 약 5/6로 눈대중으로 맞추거나, ml로 환산(1큰술=15ml이므로 1.67큰술≈25ml)해서 계량컵으로 측정할 수 있습니다.' },
              { q: '베이킹 레시피도 사용할 수 있나요?',
                a: '네, 베이킹에도 사용할 수 있습니다. 단, 베이킹은 비율이 매우 중요해 약간의 오차도 결과에 영향을 줄 수 있으므로, 소수점 반올림 옵션보다는 그대로(정확하게) 계산된 값을 사용하는 것이 좋습니다. 틀의 크기도 함께 고려하세요. 예를 들어 2인분용 틀에서 4인분을 구우면 높이가 두 배가 되어 속까지 익히는 시간이 크게 늘어납니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/weight', icon: '⚖️', name: '무게 변환기',         desc: 'g·kg·lb·oz·근·돈 단위 변환' },
              { href: '/tools/life/dutch',  icon: '🍻', name: '더치페이 계산기',      desc: '요리 재료비 n빵 계산' },
              { href: '/tools/unit/length', icon: '📏', name: '길이 변환기',           desc: '식재료·용기 크기 단위 변환' },
              { href: '/tools/life/random', icon: '🎲', name: '랜덤 추첨기',           desc: '오늘 메뉴 뭐 먹지? 랜덤 결정' },
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
