import Link from 'next/link'
import RadiationClient from './RadiationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/unit/radiation',
  title: '방사선·전자파 단위 변환기 — Sv·rem·Gy·rad·Bq·Ci + 일상 노출 비교',
  description:
    '시버트·렘·그레이·라드·베크렐·큐리 동시 환산 + μSv/h ↔ mSv/년 노출률 변환. 비행기·CT·치과 X-ray 일상 노출 비교 + SAR·EMF 별도 섹션.',
  keywords: [
    '방사선 단위', 'Sievert 변환', 'mSv μSv', '시버트 렘',
    'Gray rad', '베크렐 큐리', 'Bq Ci 변환',
    '방사선량 계산기', '연간 방사선 노출',
    'CT 방사선량', '치과 X-ray', '항공 방사선', '후쿠시마 방사능',
    '바나나 등가량', 'EMF 단위', 'SAR 휴대폰', 'μT 자기장', 'ICRP 한도',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

export default function RadiationPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ☢️ 방사선·전자파 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>Sv·rem·Gy·rad·Bq·Ci</strong> 동시 환산 + μSv/h ↔ mSv/년 + CT·치과·항공 일상 노출 비교 + EMF 참고치.
      </p>

      <RadiationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 3가지 측정 단위 개요 */}
        <section>
          <h2 style={sectionTitle}>3가지 방사선 측정 단위 — 무엇이 다른가</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            방사선은 측정 관점에 따라 단위가 다릅니다 — <strong style={{ color: 'var(--text)' }}>방사능(얼마나 방출)</strong>, <strong style={{ color: 'var(--text)' }}>흡수선량(물질이 흡수)</strong>, <strong style={{ color: 'var(--text)' }}>선량당량(인체 영향)</strong>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['관점', 'SI 단위', '구 단위', '의미'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['방사능 (활성도)',  'Bq (베크렐)', 'Ci (큐리)', '초당 붕괴 횟수. 1 Ci = 3.7×10¹⁰ Bq (라듐 1g 활성도)'],
                  ['흡수선량',        'Gy (그레이)', 'rad (라드)', '물질이 흡수한 에너지. 1 Gy = 1 J/kg = 100 rad'],
                  ['선량당량',        'Sv (시버트)', 'rem (렘)',  '인체 영향 가중치 반영. 1 Sv = 100 rem'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75, marginTop: 12 }}>
            ⓘ 일상에서 가장 많이 쓰는 단위는 <strong style={{ color: 'var(--text)' }}>μSv·mSv</strong>입니다(인체 노출량). 식품 검사에서는 <strong style={{ color: 'var(--text)' }}>Bq/kg</strong>(킬로그램당 방사능). 방사선 치료에서는 <strong style={{ color: 'var(--text)' }}>Gy</strong>(흡수선량).
          </p>
        </section>

        {/* 2. 일상 노출 가이드 */}
        <section>
          <h2 style={sectionTitle}>📊 일상 노출 — 한국인 평균 vs 의료·여행</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            한국인 평균 자연 방사선 노출은 <strong style={{ color: 'var(--text)' }}>약 3 mSv/년</strong>(라돈·우주선·식이 포함). 의료 영상이 가장 큰 인공 노출원이며, 항공 여행이 그 다음입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🌍 자연 노출 (한국 평균)', d: '3 mSv/년', desc: '라돈 1.2 + 우주선 0.3 + 토양 0.5 + 식이 1.0', c: '#059669' },
              { t: '🏥 의료 영상 평균',       d: '2~3 mSv/년', desc: 'CT 1회면 자연 노출의 1~3년치, X-ray는 1주~한 달치', c: '#0891B2' },
              { t: '🛫 항공 (장거리)',        d: '0.05~0.1 mSv/편도', desc: '인천→뉴욕 12h ≈ 0.06 mSv, 승무원은 연 1.5~3 mSv', c: '#0EA5E9' },
              { t: '☢️ 일반인 인공 한도',      d: '1 mSv/년 (자연 제외)', desc: 'ICRP·원안위 권고 — 의료 영상은 별도 적용', c: '#D97706' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 12.5, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 16, color: 'var(--text)', fontWeight: 800, margin: '0 0 6px', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 이온화 vs 비이온화 */}
        <section>
          <h2 style={sectionTitle}>이온화 방사선 vs 비이온화 전자파</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            "방사선"과 "전자파"는 일상에서 혼용되지만 물리적으로 매우 다른 영역입니다. 본 도구의 단위 환산은 <strong style={{ color: 'var(--text)' }}>이온화 방사선</strong>(에너지가 원자에서 전자를 떼어낼 만큼 큰)에만 적용됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              {
                t: '⚛️ 이온화 방사선 (Ionizing)',
                desc: '알파·베타·감마·X-ray·중성자. DNA 손상 가능. 단위: Sv·Gy·Bq. 원전·의료영상·방사선치료·자연 방사능(라돈·우라늄).',
                c: '#DC2626',
              },
              {
                t: '📡 비이온화 전자파 (Non-ionizing)',
                desc: '전파·마이크로파·적외선·가시광·일부 자외선. 열·자극 정도 가능. 단위: V/m·W/kg(SAR)·μT. 휴대폰·WiFi·송전선·전자레인지.',
                c: '#9333EA',
              },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, margin: '0 0 6px' }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75, marginTop: 12 }}>
            ⓘ WHO·IARC 기준 휴대폰 RF는 발암성 등급 <strong style={{ color: 'var(--text)' }}>2B</strong>(가능성 있음, 커피·피클과 같은 등급), 이온화 방사선은 <strong style={{ color: 'var(--text)' }}>1</strong>(확실한 발암 물질). 절대적 위험도가 다릅니다.
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '방사능과 방사선의 차이는?',
                a: '<strong>방사능(Radioactivity)</strong>은 물질의 성질로 "얼마나 방사선을 내는지"를 가리키며 단위는 Bq·Ci. <strong>방사선(Radiation)</strong>은 그 물질에서 나오는 에너지(알파·베타·감마·X-ray 등). 비유하자면 방사능은 "전구의 와트수", 방사선은 "그 전구에서 나오는 빛"입니다. 인체 영향을 평가할 땐 받은 양(선량당량, Sv·rem)이 가장 중요합니다.',
              },
              {
                q: 'CT 1회 방사선이 정말 위험한가요?',
                a: '<strong>일반적인 CT 1회(7~10 mSv)는 자연 노출 2~3년치에 해당</strong>하지만 단일 의료 노출은 상당히 안전한 범위입니다. ICRP는 진단 영상의 위험을 <strong>10,000명당 추가 암 1명 미만</strong>으로 추정합니다. 반복 촬영(연 50 mSv↑)이나 어린이·임산부는 신중해야 하며, 의사와 상의해 필요성을 확인하세요. 진단 가치 대비 위험이 훨씬 낮은 경우가 대부분입니다.',
              },
              {
                q: '비행기를 자주 타면 방사선 노출이 위험한가요?',
                a: '<strong>일반 승객은 거의 무시할 수준</strong>입니다. 인천→뉴욕 왕복 1회 ≈ 0.1 mSv (가슴 X-ray 1회 수준). 한 달 1회 장거리 비행해도 연 1.2 mSv 정도로 일반인 인공 한도 안에 들어옵니다. 다만 <strong>승무원·조종사는 직무상 연 1.5~3 mSv</strong>를 추가로 받아 노출 관리 대상이며, 임신 중 승무원은 한도가 더 엄격합니다.',
              },
              {
                q: '치과 X-ray는 안전한가요?',
                a: '매우 안전합니다. <strong>치과 Bitewing 1장 ≈ 5 μSv (0.005 mSv)</strong>로 자연 노출 반나절치, 비행 1시간 수준. 디지털 센서가 표준화된 현재는 더 낮습니다. 임산부도 납복(lead apron) 차폐를 하면 태아 노출이 미미해 필요 시 시술 가능합니다.',
              },
              {
                q: '바나나에서 방사선이 나온다는 게 사실인가요?',
                a: '<strong>네, 모든 음식에 자연 방사성 물질이 있습니다.</strong> 바나나는 칼륨-40(K-40)이 풍부해 1개당 약 0.1 μSv를 받습니다. 이를 <strong>BED (Banana Equivalent Dose)</strong>라 부르며 일상 노출을 직관적으로 비유할 때 씁니다. CT 1회 ≈ 7만 개 바나나, 자연 1년 노출 ≈ 3만 개. 단 K-40은 체내 항상성으로 유지되어 바나나를 많이 먹어도 누적되지 않습니다.',
              },
              {
                q: '후쿠시마 처리수 방류는 위험한가요?',
                a: '<strong>한국 원자력안전위원회·IAEA는 일상에 미치는 영향이 무시할 수준이라고 평가</strong>합니다. 방류 전 ALPS로 처리해 대부분의 핵종이 제거되고, 남은 삼중수소(트리튬)는 자연 농도와 비슷한 수준으로 희석. 한국 주변 해역의 농도 변화 추정치는 <strong>연 0.000001 mSv 미만</strong>으로, 자연 변동(연 ±0.3 mSv) 안에 묻힙니다. 다만 장기 모니터링이 필요하다는 데는 과학계도 동의합니다.',
              },
              {
                q: '휴대폰 SAR이 1.6 W/kg을 넘으면 위험한가요?',
                a: '<strong>한국·미국·EU 모두 SAR 한도는 안전 마진을 50배 적용한 값</strong>입니다. 즉 실제 인체 영향이 발생하는 수준의 1/50에서 한도를 정한 것. 시판되는 모든 휴대폰은 한도 이하이며, 한도를 살짝 넘어도 즉각 위험은 없습니다. 더 줄이고 싶다면 이어폰·스피커폰 사용, 통화 중 머리에서 1cm 떼기 등이 효과적입니다.',
              },
              {
                q: '송전선 근처에 사는 게 암 위험을 높이나요?',
                a: 'WHO·IARC는 극저주파(ELF) 자기장을 <strong>2B 등급(가능성 있음)</strong>으로 분류하지만, 대부분 연구에서 일상 노출 수준의 송전선 자기장은 명확한 인과관계가 확인되지 않았습니다. 154 kV 송전선 직하 3 μT는 ICNIRP 한도 200 μT의 1.5%. 다만 만성 노출 영향에 대한 연구는 계속되고 있어 가능하면 일정 거리를 두는 게 권장됩니다.',
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

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/hardness',       icon: '🛠️', name: '경도 변환기',     desc: 'HRC·HV·HB 강철 경도' },
              { href: '/tools/unit/viscosity',      icon: '🛢️', name: '점도 변환기',     desc: 'cP·cSt·SAE 윤활유' },
              { href: '/tools/unit/brewing',        icon: '🍺', name: '양조 도수·당도',   desc: 'Brix·SG·ABV·Proof' },
              { href: '/tools/unit/converter',      icon: '📐', name: '단위 변환기',      desc: '길이·무게·부피 일반' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 지수',    desc: 'UV·SPF 일광화상 시간' },
              { href: '/tools/edu/cosmic-calendar', icon: '🌌', name: '우주 달력',       desc: '138억년 압축 타임라인' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
