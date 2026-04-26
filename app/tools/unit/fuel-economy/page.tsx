import Link from 'next/link'
import FuelEconomyClient from './FuelEconomyClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit/fuel-economy',
  title: '연비 변환기 km/L ↔ mpg ↔ L/100km — 전기차 전비 포함',
  description: 'km/L, L/100km, mpg(미국·영국) 연비 단위를 즉시 변환합니다. 전기차 전비(km/kWh·MPGe), 100km 주행 비용 계산 지원.',
  keywords: ['연비변환기', 'km/L mpg', 'L/100km 변환', '미국연비', '전기차전비', 'MPGe', 'mpg km 변환'],
})

export default function FuelEconomyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⛽ 연비 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>km/L · L/100km · mpg(미국·영국)</strong> 연비 단위를 즉시 변환합니다. 전기차 전비(km/kWh·MPGe)와 100km 주행 비용 계산도 지원합니다.
      </p>

      <FuelEconomyClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 국가별 연비 표기 차이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            국가별 연비 표기 차이
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            같은 차량이라도 나라마다 표기 단위가 다릅니다. <strong style={{ color: 'var(--text)' }}>“높을수록 좋은” 단위</strong>(km/L, mpg)와 <strong style={{ color: 'var(--text)' }}>“낮을수록 좋은” 단위</strong>(L/100km)가 섞여 있어 직관적 비교가 어렵습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { flag: '🇰🇷', country: '한국', unit: 'km/L',     dir: '높을수록 ↑',  ex: '15 km/L (소형 가솔린)' },
              { flag: '🇯🇵', country: '일본', unit: 'km/L',     dir: '높을수록 ↑',  ex: '20 km/L (하이브리드)' },
              { flag: '🇪🇺', country: '유럽', unit: 'L/100km',  dir: '낮을수록 ↑',  ex: '6.7 L/100km' },
              { flag: '🇺🇸', country: '미국', unit: 'mpg (US)', dir: '높을수록 ↑',  ex: '35 mpg' },
              { flag: '🇬🇧', country: '영국', unit: 'mpg (UK)', dir: '높을수록 ↑',  ex: '42 mpg (US와 다름)' },
              { flag: '🇨🇦', country: '캐나다', unit: 'L/100km', dir: '낮을수록 ↑', ex: '미국 mpg 병기' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.flag} {c.country}</p>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '2px' }}>{c.unit}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{c.dir}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.85 }}>{c.ex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. mpg US vs UK ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            mpg US vs mpg UK — 같은 단위, 다른 결과
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            mpg(miles per gallon)는 미국과 영국에서 모두 사용되지만, <strong style={{ color: 'var(--accent)' }}>1갤런의 용량 자체가 다릅니다</strong>. 같은 차량의 mpg 수치가 영국이 더 크게 나오는 이유입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>🇺🇸 1 US 갤런</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '-0.5px' }}>3.78541 L</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '4px' }}>10 km/L = <strong style={{ color: 'var(--text)' }}>23.5 mpg (US)</strong></p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>🇬🇧 1 UK(Imperial) 갤런</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '-0.5px' }}>4.54609 L</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '4px' }}>10 km/L = <strong style={{ color: 'var(--text)' }}>28.2 mpg (UK)</strong></p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⚠️ 영국 자동차 잡지나 직구 사이트에서 mpg를 봤다면 <strong style={{ color: 'var(--text)' }}>UK 갤런 기준</strong>일 가능성이 높습니다. 미국 EPA 기준과 약 20% 차이가 발생합니다.
          </p>
        </div>

        {/* ── 3. L/100km이 낮을수록 좋은 이유 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            L/100km이 낮을수록 좋은 이유
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            한국·미국식 표기는 <strong style={{ color: 'var(--text)' }}>“연료 1단위로 얼마나 가는가”</strong>(거리 ÷ 연료)인 반면, 유럽식 L/100km는 <strong style={{ color: 'var(--text)' }}>“100km 가는 데 얼마나 쓰는가”</strong>(연료 ÷ 거리)입니다. 즉 <strong style={{ color: 'var(--accent)' }}>소비량 기준</strong>이라 숫자가 작을수록 효율이 좋습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['차량', 'km/L', 'L/100km', '평가'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '경차',          k: '20', l: '5.0',  e: '🌟 매우 우수' },
                  { c: '소형 가솔린',   k: '15', l: '6.7',  e: '✅ 우수' },
                  { c: '중형 세단',     k: '12', l: '8.3',  e: '보통' },
                  { c: '대형 SUV',      k: '8',  l: '12.5', e: '🔶 평균 이하' },
                  { c: '스포츠카',      k: '6',  l: '16.7', e: '❌ 낮음' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.l}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            💡 유럽이 L/100km를 쓰는 이유 중 하나는 <strong style={{ color: 'var(--text)' }}>“100km 갈 때 얼마나 비용이 드는지”</strong>가 더 직관적이기 때문입니다. 연비가 5 → 4 km/L로 떨어지는 것보다, L/100km 20 → 25로 늘어나는 게 “25% 더 든다”는 게 더 명확합니다.
          </p>
        </div>

        {/* ── 4. 인기 차종별 연비 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인기 차종별 연비 참고표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            제조사 공인 복합연비 기준 일반적인 수치입니다. 실제 운행 환경(시내/고속, 계절, 운전 습관)에 따라 ±20% 이상 차이날 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['차량', '연료', '복합연비', '환산'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { car: '현대 아반떼 (가솔린)',     fuel: '가솔린',  v: '15.3 km/L',  conv: '6.5 L/100km · 36 mpg US' },
                  { car: '현대 그랜저 (가솔린)',     fuel: '가솔린',  v: '11.7 km/L',  conv: '8.5 L/100km · 28 mpg US' },
                  { car: '토요타 프리우스 (HEV)',    fuel: '하이브리드', v: '20.9 km/L',  conv: '4.8 L/100km · 49 mpg US' },
                  { car: '기아 쏘렌토 (디젤)',       fuel: '디젤',    v: '13.2 km/L',  conv: '7.6 L/100km · 31 mpg US' },
                  { car: '포르쉐 911 카레라',        fuel: '가솔린',  v: '8.1 km/L',   conv: '12.3 L/100km · 19 mpg US' },
                  { car: '테슬라 모델 3 (RWD)',      fuel: '전기',    v: '6.1 km/kWh', conv: '164 Wh/km · 128 MPGe' },
                  { car: '현대 아이오닉 5 (롱레인지)', fuel: '전기',  v: '4.9 km/kWh', conv: '204 Wh/km · 103 MPGe' },
                  { car: '기아 EV6 (롱레인지)',      fuel: '전기',    v: '5.1 km/kWh', conv: '196 Wh/km · 107 MPGe' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.car}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.fuel}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px', fontFamily: 'Syne, sans-serif' }}>{r.conv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 자주 검색되는 변환 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 변환
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { q: '30 mpg(US)는 km/L?',      a: '약 12.75 km/L', sub: '30 ÷ 2.35215 = 12.75' },
              { q: 'L/100km 7은 km/L?',      a: '약 14.3 km/L',  sub: '100 ÷ 7 = 14.29' },
              { q: '50 MPGe는 km/kWh?',      a: '약 1.48 km/kWh', sub: '(50 × 1.60934) ÷ 33.7 = 1.48' },
              { q: '20 km/L은 L/100km?',      a: '5.0 L/100km',   sub: '100 ÷ 20 = 5.0' },
              { q: '150 Wh/km은 km/kWh?',    a: '약 6.67 km/kWh', sub: '1000 ÷ 150 = 6.67' },
              { q: '40 mpg(US) vs 40 mpg(UK)', a: '17.0 vs 14.2 km/L', sub: 'UK 갤런이 더 커서 같은 mpg면 km/L↓' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: '17px', color: 'var(--accent)', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px', letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: 'MPGe는 정확히 무엇인가요?',
                a: '<strong>MPGe(Miles Per Gallon equivalent)</strong>는 미국 EPA가 전기차를 가솔린차와 비교하기 위해 만든 단위입니다. <strong>1갤런 가솔린의 에너지 = 33.7 kWh</strong>로 정의하고, 이 에너지로 갈 수 있는 거리(마일)를 표시합니다. 예: 100 MPGe 전기차는 가솔린 1갤런어치 전기로 100마일을 가는 셈.',
              },
              {
                q: '복합연비, 시내연비, 고속연비는 무슨 차이?',
                a: '제조사 카탈로그에 표기되는 <strong>복합연비</strong>는 시내(stop-and-go)와 고속(정속) 주행을 일정 비율(보통 시내 55% : 고속 45%)로 가중평균한 값입니다. 실제로는 <strong>시내연비</strong>가 가장 낮고 <strong>고속연비</strong>가 가장 높게 나옵니다. 본인 주행 패턴에 가까운 항목으로 비교하세요.',
              },
              {
                q: '겨울에 전기차 전비가 떨어지는 이유?',
                a: '리튬이온 배터리의 화학 반응이 저온에서 둔화되고, <strong>히터 가동에 5~10kWh가 추가 소모</strong>됩니다. 일반적으로 영하 10도 이하에서는 여름 대비 <strong>전비가 30~40% 감소</strong>할 수 있습니다. 가솔린차도 겨울에 5~15% 떨어지지만 EV가 훨씬 민감합니다.',
              },
              {
                q: '연비 1km/L 차이가 1년에 얼마 차이?',
                a: '연 15,000km, 휘발유 1,800원/L 기준으로 <strong>15 km/L vs 14 km/L</strong>는 연 약 <strong>13만원</strong> 차이입니다. (15,000÷14 - 15,000÷15) × 1800 ≈ 128,571원. 5년이면 65만원, 10년이면 130만원입니다.',
              },
              {
                q: '하이브리드차는 어떤 단위로 표기하나요?',
                a: '하이브리드(HEV)는 외부 충전 없이 가솔린만 넣으므로 <strong>일반 km/L 또는 mpg</strong>로 표기합니다. 다만 PHEV(플러그인 하이브리드)는 EV 모드 km/kWh와 가솔린 모드 km/L가 별도로 표시되며, 미국 EPA는 두 모드 결합 MPGe를 함께 공시합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/finance/car-cost', icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·소모품·감가상각 환산' },
              { href: '/tools/unit/length',      icon: '📏', name: '길이 변환기',           desc: 'km·mile·m·ft 단위 변환' },
              { href: '/tools/unit/battery',     icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh·Ah 변환' },
              { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',           desc: '섭씨·화씨·켈빈 즉시 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
