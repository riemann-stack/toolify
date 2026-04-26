import Link from 'next/link'
import TirePressureClient from './TirePressureClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit/tire-pressure',
  title: '타이어 공기압 변환기 psi ↔ kPa ↔ bar — 권장 공기압 체크',
  description: 'psi, kPa, bar, kgf/cm² 타이어 공기압 단위를 즉시 변환합니다. 차량별 권장 공기압 비교, 부족·과다 진단, 자전거·오토바이 지원.',
  keywords: ['타이어공기압변환', 'psi kPa 변환', '타이어공기압', '자전거공기압', '권장공기압', 'bar psi 변환'],
})

export default function TirePressurePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🛞 타이어 공기압 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>psi · kPa · bar · kgf/cm²</strong> 타이어 공기압 단위를 즉시 변환하고, 차량별 권장 공기압과 비교해 부족·과다 여부를 진단합니다. 자전거·오토바이도 지원합니다.
      </p>

      <TirePressureClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 국가별 공기압 단위 표기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            국가별 공기압 단위 표기
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            나라마다, 또 차량 매뉴얼·주유소 공기 주입기마다 표기 단위가 다릅니다. 같은 “보통 공기압”도 단위에 따라 30~240의 숫자로 다양하게 표시됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { flag: '🇺🇸', area: '미국·한국 운전자', unit: 'psi',     ex: '32 psi (보통 세단)' },
              { flag: '🇰🇷', area: '한국 차량 표기',    unit: 'kPa',     ex: '220 kPa (운전석 도어 스티커)' },
              { flag: '🇪🇺', area: '유럽',              unit: 'bar',     ex: '2.2 bar (≈ 32 psi)' },
              { flag: '🇯🇵', area: '일본·과거 한국',    unit: 'kgf/cm²', ex: '2.25 kgf/cm² (≈ 32 psi)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.flag} {c.area}</p>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '4px' }}>{c.unit}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.ex}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            💡 한국은 차량 매뉴얼·도어 스티커는 <strong style={{ color: 'var(--text)' }}>kPa</strong>로 표기하지만, 실제 운전자는 미국식 <strong style={{ color: 'var(--text)' }}>psi</strong> 게이지를 더 많이 씁니다. 두 단위는 약 7배 차이(1 psi ≈ 6.895 kPa).
          </p>
        </div>

        {/* ── 2. 차종별 권장 공기압 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            차종별 권장 공기압 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            정확한 값은 <strong style={{ color: 'var(--text)' }}>운전석 도어 안쪽 스티커</strong>나 차량 매뉴얼이 우선입니다. 아래는 일반적인 참고 범위입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['차종', 'psi', 'kPa', 'bar'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '경차 (모닝·스파크)',         p: '31~33',  k: '213~228', b: '2.1~2.3' },
                  { c: '소형 세단 (아반떼·K3)',      p: '32~35',  k: '220~241', b: '2.2~2.4' },
                  { c: '중형 세단 (쏘나타·K5)',      p: '33~35',  k: '228~241', b: '2.3~2.4' },
                  { c: '대형 세단 (그랜저·K8)',      p: '33~36',  k: '228~248', b: '2.3~2.5' },
                  { c: '소형 SUV (코나·셀토스)',     p: '33~35',  k: '228~241', b: '2.3~2.4' },
                  { c: '중·대형 SUV (싼타페·쏘렌토)', p: '33~36',  k: '228~248', b: '2.3~2.5' },
                  { c: '경상용·승합차',              p: '40~50',  k: '275~345', b: '2.8~3.5' },
                  { c: '로드바이크',                 p: '90~120', k: '620~830', b: '6.2~8.3' },
                  { c: '그래블·투어링 자전거',       p: '50~80',  k: '345~550', b: '3.5~5.5' },
                  { c: 'MTB',                       p: '25~50',  k: '170~340', b: '1.7~3.4' },
                  { c: '오토바이 (스쿠터·일반)',     p: '32~42',  k: '220~290', b: '2.2~2.9' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.k}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontSize: '11px' }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 공기압 부족·과다의 영향 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            공기압 부족·과다의 영향 (연비·마모·안전)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(255,140,62,0.08)', border: '1px solid rgba(255,140,62,0.4)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: '#FF8C3E', fontWeight: 800, marginBottom: '8px' }}>🔻 공기압 부족</p>
              <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '4px', listStyle: 'none' }}>
                <li>• <strong style={{ color: 'var(--text)' }}>연비 약 3% 감소</strong> (10% 부족 시)</li>
                <li>• 타이어 측면(숄더) 마모 가속</li>
                <li>• 펑크·블로아웃(고속 파열) 위험</li>
                <li>• 핸들 무거움, 조향 느슨함</li>
                <li>• 타이어 발열 증가 → 수명 단축</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: '#FF6B6B', fontWeight: 800, marginBottom: '8px' }}>🔺 공기압 과다</p>
              <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '4px', listStyle: 'none' }}>
                <li>• 승차감 저하 (노면 진동 직접 전달)</li>
                <li>• 타이어 중앙 마모 가속</li>
                <li>• 접지 면적 감소 → <strong style={{ color: 'var(--text)' }}>제동 거리 증가</strong></li>
                <li>• 코너링 시 미끄러짐 위험</li>
                <li>• 노면 충격으로 휠·서스펜션 손상 가능</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            📌 <strong style={{ color: 'var(--text)' }}>한국교통안전공단</strong> 자료에 따르면 부적정 공기압으로 인한 타이어 사고가 전체 고속도로 사고 원인의 상당 부분을 차지합니다. 월 1회 이상 점검을 권장합니다.
          </p>
        </div>

        {/* ── 4. 계절별 변화 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            계절별 공기압 변화 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            기체는 온도에 따라 부피가 변하므로, 공기압도 외부 기온에 영향을 받습니다. 일반적으로 <strong style={{ color: 'var(--accent)' }}>기온 10°C 변화 시 약 1 psi(≈ 7 kPa)</strong> 변동합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시기', '기온 변화', '공기압 변화', '대응'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '늦가을 → 초겨울', t: '20°C → 0°C', p: '약 -2 psi', a: '재충전 필수 (TPMS 경고등 점등 시즌)' },
                  { s: '한겨울',          t: '0°C → -10°C', p: '약 -1 psi', a: '주1회 점검' },
                  { s: '초봄 → 늦봄',     t: '5°C → 20°C',  p: '약 +1.5 psi', a: '과다 시 일부 빼기' },
                  { s: '한여름',          t: '25°C → 35°C', p: '약 +1 psi',   a: '주행 후 측정 금지(과측정)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.t}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontSize: '11px' }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⚠️ 측정은 반드시 <strong style={{ color: 'var(--text)' }}>주행 전 “냉간(cold)” 상태</strong>에서 하세요. 주행 직후에는 마찰열로 3~5 psi 더 높게 측정됩니다. 또한 공기 대신 <strong style={{ color: 'var(--text)' }}>질소 충전</strong>은 온도에 따른 변화가 살짝 작지만, 일반 운전자에게는 큰 차이가 없습니다.
          </p>
        </div>

        {/* ── 5. 자전거 공기압 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자전거 공기압 (로드 / 그래블 / MTB)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            자전거는 자동차보다 훨씬 광범위한 공기압을 사용합니다. <strong style={{ color: 'var(--text)' }}>타이어 옆면(사이드월)</strong>에 표기된 최소~최대 범위를 반드시 확인하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { type: '🚴 로드바이크',        psi: '90~120 psi', desc: '얇은 타이어로 노면 마찰 최소화. 라이더 체중에 따라 조정.' },
              { type: '🚲 그래블·투어링',     psi: '50~80 psi',  desc: '비포장 약간 + 포장. 그립과 속도의 균형.' },
              { type: '🚵 MTB (XC)',         psi: '30~45 psi',  desc: '비포장 트레일에서 그립 우선. 림 보호 위해 너무 낮추지 않기.' },
              { type: '🛵 MTB (다운힐·튜브리스)', psi: '20~30 psi', desc: '튜브리스 시스템 한정. 일반 클린처는 펑크 위험.' },
              { type: '🚴‍♀️ 시티·하이브리드',    psi: '50~70 psi',  desc: '도심 주행. 너무 높으면 진동, 너무 낮으면 무거움.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.type}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '4px' }}>{c.psi}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 자주 검색되는 변환 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 변환
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { q: '35 psi는 kPa?',         a: '약 241 kPa',  sub: '35 × 6.89476 = 241.3 kPa' },
              { q: '2.3 bar는 psi?',         a: '약 33.4 psi', sub: '2.3 ÷ 0.0689476 = 33.36 psi' },
              { q: '220 kPa는 psi?',         a: '약 31.9 psi', sub: '220 ÷ 6.89476 = 31.91 psi' },
              { q: '32 psi는 bar?',         a: '약 2.21 bar', sub: '32 × 0.0689476 = 2.206 bar' },
              { q: '2.0 kgf/cm²는 psi?',     a: '약 28.5 psi', sub: '2.0 ÷ 0.0703069 = 28.45 psi' },
              { q: '100 psi (로드바이크)는 bar?', a: '약 6.89 bar', sub: '100 × 0.0689476 = 6.895 bar' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: '17px', color: 'var(--accent)', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px', letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '공기압은 얼마나 자주 점검해야 하나요?',
                a: '<strong>월 1~2회 정기 점검</strong>이 권장됩니다. 타이어는 멀쩡한 상태에서도 자연 누설로 <strong>월 1~2 psi</strong> 정도 빠집니다. 환절기에는 큰 폭의 변동이 있으므로 추가 점검이 필요합니다.',
              },
              {
                q: 'TPMS 경고등이 켜졌는데 보충해도 다시 켜져요',
                a: 'TPMS 센서는 일반적으로 <strong>권장값의 약 75%</strong> 이하로 떨어지면 경고합니다. 재충전 후에도 다시 켜진다면 (1) 펑크 의심, (2) 휠 림 손상으로 미세 누설, (3) TPMS 센서 자체 고장 중 하나일 가능성이 높습니다. 정비소에서 누설 점검을 받으세요.',
              },
              {
                q: '주유소 셀프 공기 주입기 정확도가 낮은 것 같아요',
                a: '주유소 게이지는 ±2~3 psi 오차가 일반적입니다. 정확한 측정은 <strong>휴대용 디지털 공기압 게이지</strong>로 별도 측정을 권장합니다. 1만원대 제품도 ±0.5 psi 수준 정확도를 제공합니다.',
              },
              {
                q: '뒷타이어가 앞타이어보다 공기압이 높은 이유?',
                a: '대부분의 차량은 엔진이 앞에 있어 앞이 무겁기 때문에 <strong>앞바퀴가 같은 공기압이라도 더 눌립니다.</strong> 매뉴얼에서 “승차 인원이 많거나 짐이 많을 때”는 뒷바퀴 공기압을 더 올리라고 안내합니다(보통 +3~5 psi).',
              },
              {
                q: '질소 충전이 정말 효과가 있나요?',
                a: '이론적으로 질소는 분자가 커서 누설이 약간 적고 온도 변화에 둔감합니다. 다만 <strong>일반 공기도 78%가 질소</strong>이므로 차이는 크지 않으며, 일반 운전자에게는 비용 대비 효과가 미미합니다. 항공기·F1 등 극한 환경에서 의미가 있습니다.',
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/finance/car-cost',  icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/unit/length',       icon: '📏', name: '길이 변환기',           desc: 'km·mile·m·ft 단위 변환' },
              { href: '/tools/unit/fuel-economy', icon: '⛽', name: '연비 단위 변환기',     desc: 'km/L·mpg·L/100km 변환' },
              { href: '/tools/unit/temperature',  icon: '🌡️', name: '온도 변환기',           desc: '계절별 기온 환산' },
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
