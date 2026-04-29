import RecipeClient from './RecipeClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/recipe',
  title: '레시피 비율 계산기 — 인분 자동 계산·큰술↔g↔ml 단위 환산',
  description:
    '레시피의 재료를 원하는 인분 수에 맞게 자동 계산하고, 큰술·컵·g·ml 단위 환산, 양념 자동 보정, 레시피 저장, 장보기 리스트까지 한 번에.',
  keywords: [
    '레시피 비율 계산기', '인분 계산', '재료 비율', '큰술 g 환산', '컵 ml 변환',
    '양념 비율', '레시피 저장', '장보기 리스트', '요리 단위 변환', '베이킹 비율',
    '인분 변환', '한식 인분', '레시피 스케일링', '재료 환산', '음식 비율',
  ],
})

export default function RecipePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 레시피 비율·단위 변환 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        인분 수 자동 계산, 큰술↔g↔ml 단위 환산, 양념 보정, 레시피 저장, 장보기 리스트까지 한 번에. 인기 한식·양식·일식·디저트 프리셋 14종 + 50여 재료 밀도 데이터.
      </p>

      <RecipeClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 비율 계산 원리 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>레시피 인분 비율 계산 원리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            기본 공식: <code style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>변환량 = 기준량 × (목표 인분 ÷ 기준 인분)</code>
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            예: 2인분 100g → 4인분 200g, 2인분 1큰술 → 6인분 3큰술. 본 도구는 자동으로 모든 재료에 배율을 적용하고, <strong style={{ color: 'var(--text)' }}>양념(소금·간장·고추장·고춧가루·마늘 등)에는 자동 보정 80~90%</strong>를 적용해 짠맛 과다를 방지합니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, background: 'rgba(255,140,62,0.06)', border: '1px solid rgba(255,140,62,0.30)', borderRadius: 10, padding: '11px 14px' }}>
            ⚠️ 양념을 단순 배율로 늘리면 너무 짤 수 있습니다. 4인분 이상 늘릴 때는 계산값의 80%부터 시작해 간을 보면서 조절하는 것이 안전합니다.
          </p>
        </section>

        {/* 2. 한국 단위 표준 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>한국 단위 환산 표준</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: '한국 1컵',     val: '200ml',  desc: '계량컵 표준' },
              { label: '미국 1컵',     val: '240ml',  desc: '서양 레시피' },
              { label: '1큰술 (Tbsp)', val: '15ml',    desc: '국제 표준' },
              { label: '1작은술 (tsp)', val: '5ml',     desc: '1/3큰술' },
              { label: '1꼬집',        val: '≈ 0.5g',  desc: '엄지·검지' },
              { label: '1줌',          val: '≈ 10g',   desc: '손바닥 한 움큼' },
            ].map((it, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700 }}>{it.label}</p>
                <p style={{ fontSize: '15px', color: '#FFD700', fontFamily: 'Syne, sans-serif', fontWeight: 800, margin: '2px 0' }}>{it.val}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 부피 ↔ 무게 환산 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>부피 ↔ 무게 환산 (재료별 밀도)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            같은 부피라도 재료에 따라 무게가 크게 다릅니다. 본 도구는 50여 재료의 밀도 데이터로 자동 환산합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1컵 (200ml)', '1큰술 (15ml)', '밀도 g/ml'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['밀가루',     '110g',  '8.3g',  '0.55'],
                  ['설탕',       '170g',  '12.8g', '0.85'],
                  ['쌀',         '170g',  '12.8g', '0.85'],
                  ['물',         '200g',  '15g',   '1.0'],
                  ['우유',       '206g',  '15.5g', '1.03'],
                  ['버터',       '182g',  '14g',   '0.91'],
                  ['꿀',         '284g',  '21g',   '1.42'],
                  ['간장',       '232g',  '17g',   '1.16'],
                  ['고추장',     '240g',  '18g',   '1.20'],
                  ['올리브유',   '182g',  '14g',   '0.91'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>공식</strong>: 무게(g) = 부피(ml) × 밀도(g/ml). 밀가루는 체질·다짐 정도에 따라 ±20% 차이날 수 있어 정확한 베이킹은 저울 사용을 권장합니다.
          </p>
        </section>

        {/* 4. 양념 자동 보정 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>양념 자동 보정 — 왜 필요한가?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            인분이 늘어날수록 양념을 그대로 늘리면 짭니다. 본 도구는 다음 양념·향신료를 자동 인식해 보정 비율을 적용합니다:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            {['소금', '간장', '고추장', '된장', '쌈장', '고춧가루', '식초', '맛술', '꿀', '물엿', '올리고당', '다진마늘', '다진생강', '후추', '미원', '머스타드', '케첩'].map(name => (
              <div key={name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 11px', fontSize: 12, color: 'var(--text)' }}>
                🌶️ {name}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>적용 조건</strong>: 인분이 늘어날 때만 (줄어들 때는 X). 기본 85%이며 70~100% 슬라이더로 조정 가능. 첫 사용 시 80%부터 시작해 간을 보면서 조정하는 것을 권장합니다.
          </p>
        </section>

        {/* 5. 베이킹 vs 일반 요리 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>베이킹 vs 일반 요리 — 비율 정확도</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#3EC8FF', marginBottom: '6px' }}>🥘 일반 요리</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· ±10% 오차 허용</li>
                <li>· 간 조절 가능</li>
                <li>· 인분 늘릴 때 양념 보정 권장</li>
                <li>· 0.5 단위 반올림 OK</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFD700', marginBottom: '6px' }}>🍞 베이킹</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 비율 매우 중요 (±5%)</li>
                <li>· 정확한 값 그대로 사용</li>
                <li>· 부피보다 무게(g) 측정</li>
                <li>· 양념 보정·반올림 OFF 권장</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            정확한 베이킹 비율은 <Link href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)', fontWeight: 600 }}>베이커 퍼센트 계산기</Link>를 사용하면 더 좋습니다.
          </p>
        </section>

        {/* 6. 인기 한식 표준 인분 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>인기 한국 요리 표준 인분</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구의 14가지 프리셋 (한식·양식·일식·디저트):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { name: '🥘 김치찌개 (2인분)',  ing: '신김치 200g, 돼지고기 150g, 두부 100g, 다진마늘 1큰술' },
              { name: '🍲 된장찌개 (2인분)',  ing: '된장 2큰술, 두부 150g, 멸치육수 400ml, 애호박 1/2개' },
              { name: '🥩 소불고기 (2인분)',  ing: '소고기 300g, 양파 1/2개, 간장 3큰술, 참기름 1큰술' },
              { name: '🌶️ 떡볶이 (2인분)',    ing: '떡 400g, 어묵 100g, 고추장 2큰술, 설탕 2큰술' },
              { name: '🍝 크림 파스타 (1인분)', ing: '파스타면 100g, 생크림 150ml, 버터 1큰술, 치즈가루 2큰술' },
              { name: '🥞 팬케이크 (2인분)',  ing: '박력분 150g, 설탕 30g, 계란 1개, 우유 200ml' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{c.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.ing}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 장보기 리스트 활용 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>장보기 리스트 활용</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            여러 레시피를 한 주 메뉴로 계획할 때 [장보기 리스트] 탭에서 합산:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· 김치찌개 + 크림파스타 + 샐러드 → 양파·마늘 자동 합산</li>
            <li>· 마트 코너별 자동 분류 — 🥦 채소 / 🥩 육류·해산물 / 🥛 유제품 / 🌾 곡물·면류 / 🌶️ 양념·소스 / 🍎 과일·간식</li>
            <li>· 카카오톡 공유 가능 텍스트로 복사</li>
            <li>· 체크리스트 모드 — 구매한 재료 클릭으로 표시</li>
          </ul>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px', background: 'rgba(62,255,155,0.06)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 10, padding: '10px 13px' }}>
            <strong style={{ color: '#3EFF9B' }}>장점</strong>: 중복 구매 방지 · 정확한 양 파악 · 시간 절약 · 마트 동선 효율화.
          </p>
        </section>

        {/* 8. FAQ — 펼침 (accordion) */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '비율 계산 시 주의할 점은?',
                a: '<strong>양념류(소금·간장·고추장 등)는 단순 배율로 늘리면 너무 짤 수 있습니다.</strong> 특히 4인분 이상으로 늘릴 때는 계산된 양의 80~90%부터 시작해 간을 보면서 조절하세요. 마늘·고추 같은 향신료도 배율 그대로 늘리면 향이 과해질 수 있습니다. 본 도구의 "양념 자동 보정" 옵션을 활성화하면 양념·향신료에만 85% 보정이 자동 적용됩니다.',
              },
              {
                q: '큰술과 그램(g)을 어떻게 변환하나요?',
                a: '재료에 따라 다릅니다. 같은 1큰술도 재료마다 무게가 크게 달라집니다 — <code>밀가루 1큰술 ≈ 8.3g</code>, <code>설탕 1큰술 ≈ 12.8g</code>, <code>버터 1큰술 ≈ 14g</code>, <code>간장 1큰술 ≈ 17g</code> (밀도 1.16), <code>꿀 1큰술 ≈ 21g</code> (밀도 1.42). 본 도구의 <strong>[단위 환산]</strong> 탭에서 재료 이름을 입력하면 자동으로 정확한 변환값을 보여줍니다.',
              },
              {
                q: '오븐 온도나 조리 시간도 비례해서 늘려야 하나요?',
                a: '아닙니다. <strong>오븐 온도는 인분 수와 무관하게 동일</strong>하게 유지하고, 조리 시간은 재료의 두께·양에 따라 조금씩 늘어날 수 있지만 단순 배율로 늘리지 않습니다. 예: 2인분 닭볶음탕 → 4인분 시간 5~10분 추가 정도. 베이킹의 경우 틀 크기·반죽 높이가 시간에 큰 영향을 주므로 별도 조정이 필요합니다.',
              },
              {
                q: '베이킹 레시피도 사용할 수 있나요?',
                a: '네, 베이킹에도 사용할 수 있습니다. 단, 베이킹은 비율이 매우 중요해 약간의 오차도 결과에 영향을 줍니다 — <strong>"0.5 단위 반올림" 옵션은 끄고</strong> 정확한 값 사용 권장, <strong>"양념 자동 보정" 옵션은 끄기</strong> (베이킹은 보정 X), 부피보다 <strong>무게(g) 단위</strong> 권장. 더 정확한 베이킹 비율은 <a href="/tools/cooking/baker-percent" style="color: var(--accent); font-weight: 600;">베이커 퍼센트 계산기</a>를 활용하세요.',
              },
              {
                q: '저장된 레시피는 어디에 보관되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 회원가입·로그인 불필요, 빠른 접근, 사생활 보호. 단, 같은 브라우저·기기에서만 접근 가능하며 캐시 삭제·시크릿 모드 시 사라집니다. 다른 기기에서 사용하거나 영구 보관하려면 <strong>[백업 다운로드]</strong> 기능으로 JSON 파일을 정기적으로 저장하시기를 권장합니다.',
              },
              {
                q: '"꼬집"이나 "줌" 같은 어림 단위는 정확한가요?',
                a: '본 도구는 <strong>1꼬집 ≈ 0.5g, 1줌 ≈ 10g</strong>으로 평균값을 사용합니다. 실제로는 손 크기·재료에 따라 ±50% 차이날 수 있어, 어림 단위는 첫 시도 시 적게 넣고 간을 보며 추가하는 것이 안전합니다. 정확한 베이킹은 어림 단위를 피하고 g 단위로 입력하세요.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { href: '/tools/cooking/baker-percent',    icon: '🥖', name: '베이커 퍼센트 계산기',    desc: '제빵 정밀 비율·수분율' },
              { href: '/tools/cooking/baking-schedule',  icon: '🍞', name: '제빵 타임라인 계산기',    desc: '발효·굽기 일정 자동' },
              { href: '/tools/cooking/serving',          icon: '🍽️', name: '1인분 분량 계산기',         desc: '재료별 적정 분량' },
              { href: '/tools/cooking/food-storage',     icon: '🧊', name: '식재료 보관 기간 계산기',   desc: '냉장·냉동 유통기한' },
              { href: '/tools/cooking/substitute',       icon: '🔄', name: '식재료 대체 비율 계산기',   desc: '버터·설탕·계란 대체' },
              { href: '/tools/unit/weight',              icon: '⚖️', name: '무게 변환기',              desc: 'g·kg·oz·lb 단위' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>한국식품영양학회</strong> — 표준 식품 성분표</li>
            <li><strong style={{ color: 'var(--text)' }}>USDA FoodData Central</strong> — fdc.nal.usda.gov (재료 밀도)</li>
            <li><strong style={{ color: 'var(--text)' }}>King Arthur Baking — Ingredient Weight Chart</strong> (베이킹 표준)</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
