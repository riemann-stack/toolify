import type { Metadata } from 'next'
import Link from 'next/link'
import CookingUnitClient from './CookingUnitClient'

export const metadata: Metadata = {
  title: '요리 단위 변환기 — 컵·큰술·oz·근·오븐온도 변환 | Youtil',
  description: '요리할 때 필요한 모든 단위를 즉시 변환합니다. 컵·큰술·작은술·ml·oz·g·근·냥, 섭씨·화씨·가스마크 오븐 온도 변환. 해외 레시피 번역에 필수.',
  keywords: ['요리단위변환기', '컵ml변환', '큰술ml', '온스그램변환', '오븐온도변환', '화씨섭씨변환', '해외레시피단위', '요리계량'],
}

export default function CookingUnitPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥄 요리 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        컵·큰술·작은술·ml·oz·g·근, 오븐 온도까지 요리에 필요한 모든 단위를 즉시 변환하세요. 해외 레시피 번역에 필수.
      </p>

      <CookingUnitClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 계산 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '예시 1 — 미국 베이킹 레시피 컵 변환',
                color: '#C8FF3E',
                desc: '미국 레시피에 "1 cup butter" → 한국 계량으로',
                calc: '1 US Cup = 240ml ≠ 한국 컵 200ml (약 20% 차이)',
                result: '한국 컵 기준: 약 1.2컵 (또는 240ml 직접 계량 권장)',
                sub: '베이킹은 부피보다 무게 계량이 더 정확합니다. 버터 240ml ≈ 227g',
              },
              {
                title: '예시 2 — 영국 레시피 오븐 온도',
                color: '#3EC8FF',
                desc: '영국 레시피에 "Gas Mark 4로 예열" → 섭씨/화씨로',
                calc: 'Gas Mark 4 = 180°C = 350°F',
                result: '한국 오븐 기준 180°C 설정',
                sub: '케이크·쿠키 등 가장 일반적으로 쓰이는 베이킹 온도',
              },
              {
                title: '예시 3 — 정육점 고기 계량',
                color: '#FF8C3E',
                desc: '"삼겹살 한 근" → 그램으로 변환',
                calc: '법정 단위 1근 = 600g',
                result: '600g (약 1.32 lb)',
                sub: '⚠️ 일부 전통 시장에서는 1근을 400g 또는 500g으로 파는 경우도 있으니 구입 전 확인 필요',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${ex.color}25`, borderRadius: '12px', padding: '18px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: ex.color, marginBottom: '8px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>{ex.desc}</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)', margin: '8px 0' }}>
                  {ex.calc}
                </div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: ex.color, marginBottom: '4px' }}>→ {ex.result}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{ex.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 한국 vs 미국 컵 차이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 한국 vs 미국 계량컵 차이 주의
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,180,78,0.35)', borderRadius: '14px', padding: '20px 22px', marginBottom: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              {[
                { label: '🇰🇷 한국 계량컵', val: '200 ml', color: '#C8FF3E' },
                { label: '🇺🇸 미국 컵 (US Cup)', val: '240 ml', color: '#3EC8FF' },
                { label: '🇬🇧 영국 컵 (Imperial)', val: '250 ml', color: '#FF8C3E' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', fontFamily: 'Noto Sans KR, sans-serif' }}>{item.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              한국 컵(200ml)과 미국 컵(240ml)의 차이는 <strong style={{ color: 'var(--text)' }}>약 20%</strong>입니다.
              쿠키·케이크처럼 정밀한 계량이 필요한 베이킹에서는 이 차이가 실패 원인이 됩니다.
              해외 레시피를 번역할 때 「1 cup」이 미국 레시피라면 <strong style={{ color: '#FFB44E' }}>200ml가 아닌 240ml</strong>를 계량하세요.
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
            💡 <strong style={{ color: 'var(--text)' }}>베이킹 꿀팁:</strong> 부피보다 무게 계량이 훨씬 정확합니다.
            저울이 있다면 「1 cup flour = 120g」 처럼 무게로 변환해 사용하는 것을 추천합니다.
          </p>
        </div>

        {/* ── 3. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            요리 단위 빠른 참조표
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* 부피 */}
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.04em' }}>부피</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>단위</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>ml</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 작은술 (tsp)', '5'],
                    ['1 큰술 (tbsp)', '15'],
                    ['1 종이컵', '180'],
                    ['1 한국 컵', '200'],
                    ['1 fl oz', '29.6'],
                    ['1 미국 컵', '240'],
                    ['1 파인트 (pt)', '473'],
                    ['1 쿼트 (qt)', '946'],
                  ].map(([unit, val], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{unit}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 무게 */}
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#3EFF9B', marginBottom: '10px', letterSpacing: '0.04em' }}>무게</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>단위</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>g</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 oz (온스)', '28.35'],
                    ['1 lb (파운드)', '453.6'],
                    ['1 근', '600'],
                    ['1 냥', '37.5'],
                    ['1 돈', '3.75'],
                    ['1 관', '3,750'],
                    ['한 꼬집', '≈ 0.5'],
                    ['약간', '≈ 1'],
                  ].map(([unit, val], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{unit}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 오븐 온도 */}
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFB44E', marginBottom: '10px', letterSpacing: '0.04em' }}>오븐 온도</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['°C', '°F', 'Gas Mark', '용도'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: i === 3 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['150', '300', '2', '머랭·건조·슈트루델', '#3EC8FF'],
                    ['170', '325', '3', '파운드케이크·치즈케이크', '#88DDAA'],
                    ['180', '350', '4', '쿠키·케이크·마들렌 (가장 일반적)', '#C8FF3E'],
                    ['190', '375', '5', '스콘·비스킷·타르트', '#AADD66'],
                    ['200', '400', '6', '빵·머핀·롤케이크', '#FFB44E'],
                    ['220', '425', '7', '피자·바게트·구이', '#FF8C3E'],
                    ['250', '480', '9', '나폴리식 피자 (고온)', '#FF6B6B'],
                  ].map(([c, f, gm, desc, color], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: color as string }}>{c}°C</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{f}°F</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--muted)' }}>GM {gm}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: '12px' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 4. 재료별 1큰술·1컵 무게 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            재료별 1큰술·1컵 무게 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            부피와 무게는 재료마다 밀도가 달라 직접 계산할 수 없습니다.
            아래 표는 레시피에서 자주 쓰이는 재료의 기준값입니다.
            (모든 값은 한국 기준 1컵 = 200ml 기준)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1큰술(15ml)', '1컵(200ml)', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['물', '15 g', '200 g', '밀도 1g/ml'],
                  ['밀가루 (박력분)', '8 g', '110 g', '체질 후 기준'],
                  ['설탕 (백설탕)', '12 g', '160 g', '꽉 채운 기준'],
                  ['소금', '18 g', '240 g', '정제염 기준'],
                  ['버터', '14 g', '190 g', '상온 기준'],
                  ['꿀', '21 g', '280 g', '점성 있음'],
                  ['올리브오일', '13 g', '180 g', '밀도 0.9'],
                  ['간장', '18 g', '240 g', ''],
                  ['고춧가루', '6 g', '80 g', ''],
                  ['코코아파우더', '7 g', '90 g', '체질 후'],
                ].map(([food, tbsp, cup, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500, fontFamily: 'Noto Sans KR, sans-serif' }}>{food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{tbsp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{cup}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 재료 브랜드·상태(체질 여부, 눌러 담기 여부)에 따라 실제 무게가 최대 ±15% 차이날 수 있습니다.
          </p>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '한국 레시피의 \'컵\'과 미국 레시피의 \'cup\'이 다른가요?',
                a: '네, 다릅니다. 한국 계량컵은 200ml, 미국은 240ml로 약 20% 차이납니다. 마카롱이나 파운드케이크처럼 계량이 정밀해야 하는 베이킹에서 이 차이가 실패 원인이 됩니다. 해외 레시피라면 반드시 어느 나라 기준인지 확인 후 사용하세요.' },
              { q: '1큰술은 몇 작은술인가요?',
                a: '1큰술(tablespoon, tbsp) = 3작은술(teaspoon, tsp) = 15ml입니다. 한국·미국 공통으로 적용됩니다. (단, 미국 1큰술은 14.79ml로 약간 다름) 작은술 = 5ml이므로 세 번 담으면 큰술 1개 분량이 됩니다.' },
              { q: '\'약간\'과 \'조금\'은 정확히 얼마인가요?',
                a: '정확한 법적 정의는 없지만 요리 관용 표현으로 한 꼬집 ≈ 0.5g, 약간 ≈ 1g, 조금 ≈ 2~3g으로 통용됩니다. 소금 등 간을 보며 조절하는 재료에 주로 쓰이며, 레시피에 "약간"이 나오면 0.5~1g 정도를 기준으로 조절하면 됩니다.' },
              { q: '오븐 온도를 에어프라이어로 변환하면?',
                a: '일반적으로 에어프라이어는 오븐보다 약 20°C 낮게 설정하고 조리 시간은 20~25% 단축합니다. 예: 오븐 180°C → 에어프라이어 160°C. 에어프라이어는 순환식 열풍 방식이라 열전달 효율이 높기 때문입니다. 단, 기종마다 차이가 있으므로 처음엔 짧게 설정 후 확인하며 추가 조리하세요.' },
              { q: '전통 시장의 \'한 근\'이 정확히 600g인가요?',
                a: '법정 단위로 1근 = 600g이지만, 일부 전통 시장에서는 고기 1근을 400g 또는 500g으로 계산하는 관행이 남아 있습니다. 특히 정육점에서 고기를 구입할 때 몇 그램인지 직접 확인하는 것을 권장합니다. 채소류나 약재 1근은 기준이 달리 적용되기도 합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',       desc: '섭씨·화씨·켈빈 즉시 변환' },
              { href: '/tools/unit/weight',      icon: '⚖️', name: '무게 변환기',       desc: 'kg·g·lb·oz·근·돈 변환' },
              { href: '/tools/life/recipe',      icon: '📐', name: '레시피 비율 계산기', desc: '인분 수에 맞게 재료 비율 자동 계산' },
              { href: '/tools/life/dutch',       icon: '🍻', name: '더치페이 계산기',    desc: '식사비 n빵 계산' },
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
