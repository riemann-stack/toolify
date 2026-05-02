import Link from 'next/link'
import AlcoholClient from './AlcoholClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/alcohol',
  title: '알코올 도수 계산기 — 잔 단위·소맥·하이볼·1인당 분배·기준 도수 변환',
  description:
    '소주잔·맥주잔·양주샷 단위 입력. 혼합 도수, 목표 도수 희석(물·맥주·탄산수·토닉), 같은 알코올량 비교(소주↔맥주↔와인), 술자리 1인당 분배, 본인 기준 도수로 환산까지. 한국 표준 잔·병 데이터 + 보건복지부 저위험 음주 가이드.',
  keywords: [
    '알코올도수계산기', '소맥도수계산기', '소맥 황금 비율', '하이볼 도수', '진토닉 도수',
    '술자리 1인당 알코올', '소주 맥주 환산', '와인 알코올량', '표준잔', '술자리 1인당 분배',
    '소주 17.5도', '저위험 음주', '혼합주도수', '폭탄주도수', '표준음주량',
  ],
})

export default function AlcoholPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍺 알코올 도수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        혼합 도수·소맥 황금 비율·하이볼·목표 도수 희석(맥주·탄산수)·같은 알코올량 비교·술자리 1인당 알코올 분배·기준 도수 변환까지. <strong style={{ color: 'var(--text)' }}>한국 표준 잔 단위</strong>로 정확하게.
      </p>

      <AlcoholClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 한국 잔 단위 가이드 (NEW·SEO 핵심) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            한국 표준 잔·병 단위 (ml 기준)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            본 도구는 한국 음주 환경에서 가장 많이 쓰이는 잔·병 규격을 기본 제공합니다. 본인이 마신 갯수만 입력하면 자동 계산됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['잔/병', '용량', '일반 도수', '1잔 알코올(g)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍶 소주잔',         '50ml',    '16%',   '6.3g',   '#C8FF3E'],
                  ['🍺 맥주잔 (작은)',  '300ml',   '4.5%',  '10.7g',  '#3EFF9B'],
                  ['🍺 맥주잔 (큰)',    '500ml',   '4.5%',  '17.8g',  '#3EFF9B'],
                  ['🥃 양주 샷',        '30ml',    '40%',   '9.5g',   '#FF8C3E'],
                  ['🥃 양주 1온스',     '45ml',    '40%',   '14.2g',  '#FF8C3E'],
                  ['🍷 와인잔',         '150ml',   '13%',   '15.4g',  '#C83EFF'],
                  ['🥣 막걸리 사발',    '200ml',   '6%',    '9.5g',   '#FF8C3E'],
                  ['🍶 사케 잔',        '60ml',    '15%',   '7.1g',   '#FF3E8C'],
                  ['🥤 종이컵',         '180ml',   '—',     '—',      '#3EC8FF'],
                  ['🍹 하이볼잔',       '300ml',   '~7%',   '16.6g',  '#3EC8FF'],
                  ['🍶 소주 1병',       '360ml',   '16%',   '45.5g',  '#C8FF3E'],
                  ['🥫 맥주 1캔',       '500ml',   '4.5%',  '17.8g',  '#3EFF9B'],
                  ['🍶 막걸리 1병',     '750ml',   '6%',    '35.5g',  '#FF8C3E'],
                  ['🍷 와인 1병',       '750ml',   '13%',   '77.0g',  '#C83EFF'],
                  ['🥃 위스키 1병',     '700ml',   '40%',   '221.0g', '#FF8C3E'],
                ].map(([name, vol, abv, alc, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 600 }}>{name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{vol}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{abv}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{alc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7893 (에탄올 밀도). 제품 라벨의 도수가 다르면 [기준 도수 변환] 도구로 정확 계산.
          </p>
        </section>

        {/* ── 2. 인기 칵테일·하이볼 도수 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            인기 한국 칵테일·하이볼 도수
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            아래 6가지는 본 도구의 [혼합 도수] 탭에서 한 번의 클릭으로 자동 채워집니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>칵테일</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>레시피</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🥃 하이볼',         r: '위스키 30ml + 탄산수 270ml (1:9)',  abv: '4.0%' },
                  { n: '🍸 진토닉',          r: '진 45ml + 토닉워터 200ml',           abv: '7.3%' },
                  { n: '🥃 잭콕',           r: '잭다니엘 30ml + 콜라 200ml',         abv: '5.2%' },
                  { n: '🍊 스크류드라이버', r: '보드카 30ml + 오렌지주스 200ml',     abv: '5.2%' },
                  { n: '🍻 소맥 황금 (1:8)', r: '소주 50ml + 맥주 400ml',           abv: '5.78%' },
                  { n: '🍻 소맥 진하게(1:5)', r: '소주 60ml + 맥주 300ml',           abv: '6.4%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.abv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 하이볼은 가게마다 1:5(진하게)부터 1:12(약하게)까지 다양. 본인 취향은 [목표 도수 희석] 탭으로 정확 계산.
          </p>
        </section>

        {/* ── 3. 같은 알코올량 환산 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            같은 알코올량 환산 (1표준잔 = 8g)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            한국 표준잔(8g 알코올)에 해당하는 각 술의 양을 비교하면, 같은 한 잔이라도 종류별로 알코올 양이 크게 다름을 알 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>술</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1표준잔(8g) 분량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>실제 1잔 (표준잔)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍶 소주',     '16%',  '63ml',    '소주잔 50ml = 0.79 표준잔'],
                  ['🍺 맥주',     '4.5%', '225ml',   '500ml 캔 = 2.22 표준잔'],
                  ['🍷 와인',     '13%',  '78ml',    '와인잔 150ml = 1.93 표준잔'],
                  ['🥃 위스키',   '40%',  '25ml',    '샷 30ml = 1.18 표준잔'],
                  ['🥣 막걸리',   '6%',   '169ml',   '사발 200ml = 1.18 표준잔'],
                  ['🍶 사케',     '15%',  '68ml',    '오쵸코 60ml = 0.89 표준잔'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. 술자리 1인당 알코올 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            술자리 1인당 알코올 가이드 (예시)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            본 도구의 [1인당 분배] 탭에서 자동 계산. 아래는 흔한 술자리 시나리오 예시입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                title: '시나리오 A — 4명, 가벼운 술자리',
                detail: '소주 1병 (16%) + 맥주 4캔 (500ml, 4.5%)',
                perPerson: '1인당 약 29g (3.6 표준잔)',
                risk: '🟡 남성 권장 90% / 여성 181% (여성 큰 폭 초과)',
                color: '#FFD93E',
              },
              {
                title: '시나리오 B — 4명, 보통 술자리',
                detail: '소주 3병 + 맥주 6캔',
                perPerson: '1인당 약 61g (7.7 표준잔)',
                risk: '🟠 남성 권장 192% / 여성 384% (큰 폭 초과)',
                color: '#FF8C3E',
              },
              {
                title: '시나리오 C — 4명, 회식 진한 술자리',
                detail: '소주 5병 + 맥주 10캔 + 위스키 200ml',
                perPerson: '1인당 약 117g (14.6 표준잔)',
                risk: '🔴 위험 음주 — 절대 운전 X · 다음날 출근 운전도 단속 가능',
                color: '#FF6B6B',
              },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}25`, borderRadius: '12px', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: s.color, marginBottom: '6px' }}>{s.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>{s.detail}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>→ {s.perPerson}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.risk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. 본인 기준 도수 변환 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            소주 도수가 제품마다 다른 이유
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            한국 소주는 브랜드별로 도수가 다르므로, 같은 1병이라도 알코올 양이 크게 차이납니다. 본 도구의 슬라이더로 본인이 마시는 소주 도수를 정확히 입력하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>브랜드</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1병 (360ml) 알코올</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['진로 이즈백',       '16%',   '45.5g'],
                  ['처음처럼',           '16.5%', '46.9g'],
                  ['좋은데이',           '16.5%', '46.9g'],
                  ['처음처럼 빨간뚜껑',  '16.9%', '48.0g'],
                  ['진로 (오리지널)',    '17.5%', '49.7g'],
                  ['한라산',             '25%',   '71.1g'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 같은 1병이라도 한라산(25%) vs 이즈백(16%) = 알코올 약 56% 차이. 큰 차이입니다.
          </p>
        </section>

        {/* ── 6. 표준 음주량 안내 (기존 유지·확장) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 표준 음주량 & 보건복지부 저위험 음주 권고
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국은 <strong style={{ color: 'var(--text)' }}>1표준잔 = 알코올 8g</strong> 기준 (WHO는 10g). 보건복지부 권고는 아래와 같으나, <strong style={{ color: '#FF8C3E' }}>WHO(2023)는 &ldquo;알코올 섭취량에 안전한 수준은 없다&rdquo;</strong>고 발표했습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.15)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>한국 보건복지부 저위험 음주 권고 기준</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: '남성', value: '주 14표준잔 이하', sub: '1일 4잔(32g) 이하' },
                { label: '여성', value: '주 7표준잔 이하',  sub: '1일 2잔(16g) 이하' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. FAQ (accordion) ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '소맥 황금 비율의 도수는?',
                a: '가장 흔한 비율은 <strong>소주 50ml(16%) + 맥주 400ml(4.5%)</strong> 조합으로 약 5.78%입니다. &quot;진하게(1:5, 6.4%)&quot;, &quot;약하게(1:10, 5.5%)&quot; 취향에 따라 본 도구의 [혼합 도수] 탭에서 자유롭게 조정 가능. 단, 도수보다 마시는 속도·안주·수분이 취기에 더 큰 영향을 줍니다.',
              },
              {
                q: '알코올 순수량(g)은 어떻게 계산하나요?',
                a: '<strong>알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7893</strong>입니다. 0.7893은 에탄올 밀도(g/ml)로, 물(1g/ml)보다 가볍습니다. 예: 소주 1잔 50ml × 16% × 0.7893 = 약 6.3g.',
              },
              {
                q: '잔 단위와 병 단위 어느 게 더 정확한가요?',
                a: '둘 다 정확합니다. 본인이 익숙한 단위를 선택하세요. 일반적으로 1차 술자리는 잔 단위(몇 잔 마셨나), 총량 계산은 병 단위(몇 병 마셨나)를 사용합니다. 본 도구는 둘 다 지원하며, 잔 단위가 기본입니다. 단, 정확한 ml은 라벨 확인 필수 — 소주병 360ml, 맥주병/캔 500ml, 막걸리 750ml 표준.',
              },
              {
                q: '하이볼 만들 때 위스키 + 탄산수 비율은?',
                a: '일반적 황금 비율은 <strong>위스키 1 : 탄산수 9</strong> — 위스키 30ml + 탄산수 270ml로 약 4% 도수. 진하게는 1:6(약 5.7%), 약하게는 1:12(약 3.1%). 한국 술집 표준은 보통 1:7(약 5%) 수준입니다. 본 도구의 [목표 도수 희석] 탭에서 정확 계산 가능.',
              },
              {
                q: '같은 알코올량인데 술 종류에 따라 취하는 정도가 다른가요?',
                a: '학술적으로는 <strong>알코올 g이 같으면 BAC도 비슷</strong>합니다 (Widmark 공식). 다만 체감이 다른 이유는 ① 마시는 속도(소주 빠름·맥주 천천히) ② 위장 흡수 속도(탄산 음료 흡수↑) ③ 안주·식사(지방질 ↓) ④ 도수(높은 도수 → 식도·위 자극). 본 도구의 [알코올 환산] 탭에서 같은 8g이라도 술 종류별 양 차이를 확인할 수 있습니다.',
              },
              {
                q: '4명이 소주 3병 + 맥주 6캔 마시면 1인당 얼마인가요?',
                a: '본 도구의 [1인당 분배] 탭으로 자동 계산: 소주 3병(138g) + 맥주 6캔(108g) = 총 246g, 4명 균등 시 <strong>1인당 약 61.5g (7.7 표준잔)</strong>. 한국 보건복지부 1일 권장 (남 32g)의 192%, 여성 권장(16g)의 384%. ⚠️ 절대 운전 X, 다음날 출근 운전도 단속 가능 (BAC 잔류). 일주일 이상 간격 권장.',
              },
              {
                q: '소주 도수가 제품마다 다른데 정확히 계산하려면?',
                a: '본 도구 하단의 [본인 기준 도수 변환] 슬라이더에서 본인이 마신 소주 도수(14~25%)를 직접 설정하세요. 주요 도수: 진로 이즈백 16% · 처음처럼 16.5% · 진로 17.5% · 한라산 25%. 같은 1병이라도 한라산(71g) vs 이즈백(46g) = 알코올 약 56% 차이.',
              },
              {
                q: '음주 후 운전 가능 시간은 어떻게 계산하나요?',
                a: '체내 알코올 분해 속도는 개인마다 크게 달라(시간당 7~10g) 정확한 시점 예측은 어렵습니다. 본 도구의 결과를 운전 가능 여부 판단에 사용하지 마세요. 음주 후에는 반드시 대리(카카오 T 1577-1577 / 티맵 1644-3030) 또는 대중교통을 이용. 다음날 아침 출근 운전도 BAC 잔류로 단속 가능합니다. 본 도구의 [알코올 환산] 결과 카드 → 혈중알코올 도구 링크에서 BAC 추정 가능.',
              },
              {
                q: '맥주(4.5%)로 소주를 희석하면 어떻게 되나요?',
                a: '맥주로 희석할 때는 <strong>목표 도수가 맥주(4.5%)보다 높아야</strong> 가능합니다. 예: 소주 50ml(16%) + 맥주 X = 목표 8% → 맥주 약 200ml 필요. 단, 목표가 4.5% 이하면 무한히 추가해도 도달할 수 없습니다 (수학적 한계). 본 도구의 [목표 도수 희석] 탭에 다양한 희석재료 비교표가 자동 생성됩니다.',
              },
              {
                q: '음주 칼로리는 어떻게 되나요?',
                a: '알코올 1g = 7 kcal (지방 9, 탄수화물·단백질 4보다 높음). 예: 소주 1병 360ml(16%) → 알코올 45.5g × 7 = <strong>약 318 kcal</strong> (밥 1공기 314 kcal). 맥주는 알코올 외에도 당분으로 칼로리 추가 — 1캔 약 200 kcal. 술자리에서의 안주 칼로리는 별도. 본 도구는 알코올 칼로리만 표시합니다.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* ── 8. 책임 있는 음주 (강화) ── */}
        <section style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#FF6B6B', marginBottom: '12px' }}>⚠️ 책임 있는 음주 안내</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 계산기는 <strong style={{ color: 'var(--text)' }}>음주를 권장하지 않으며</strong>, 본인 음주량 인지·관리 보조 도구입니다. 계산 결과는 체내 알코올 분해 속도나 취기 정도를 보장하지 않습니다.
          </p>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>임산부·수유 중·미성년자는 절대 음주 금지 (법적 금지)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>약물 복용 중 음주는 의사 상담 필수 (수면제·항우울제·진통제 위험)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>음주 후 운전 절대 금지 (다음날 아침 운전도 BAC 잔류 가능)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>WHO(2023): &ldquo;알코올 섭취량에 안전한 수준은 없다&rdquo; — 가능한 적게</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>주 21표준잔(남) / 14표준잔(여) 이상은 위험 음주(WHO 기준)</li>
          </ul>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>📞 도움이 필요하면</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
              {[
                { label: '한국알코올중독상담센터', tel: '1899-0975' },
                { label: '정신건강 위기상담',     tel: '1577-0199' },
                { label: '카카오 T 대리',          tel: '1577-1577' },
                { label: '티맵 대리',             tel: '1644-3030' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF8C3E' }}>{c.tel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 소멸 계산기', desc: 'BAC 추정·운전 가능 시각' },
              { href: '/tools/life/dutch',           icon: '🍻', name: '더치페이 계산기',         desc: '술자리 비용 N빵' },
              { href: '/tools/health/bmr',           icon: '🔥', name: 'BMR 계산기',              desc: '알코올 칼로리 vs 일일 권장' },
              { href: '/tools/health/supplement',    icon: '💊', name: '영양제 성분 체크',         desc: '약물 + 알코올 주의' },
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
        </section>

      </div>
    </div>
  )
}
