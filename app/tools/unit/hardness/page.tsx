import Link from 'next/link'
import HardnessClient from './HardnessClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/unit/hardness',
  title: '경도(Hardness) 변환기 — HRC·HRB·HV·HB·인장강도',
  description:
    'ASTM E140 강철 환산표 기반 경도 변환. 로크웰 HRC·HRB, 비커스 HV, 브리넬 HB 상호 변환 + 인장강도 추정. 칼·공구·금속 가공용 — 칼덕·메이커·엔지니어 필수.',
  keywords: [
    '경도 변환', '경도 환산', 'HRC HV 변환', 'HRC 환산표',
    '로크웰 경도', '비커스 경도', '브리넬 경도',
    'HRC HRB', 'HV HB', '인장강도 환산',
    '강철 경도', '칼 경도', 'HRC 칼날',
    '공구강 경도', 'HSS 경도', '드릴 비트 경도',
    'ASTM E140', '경도 측정',
    '나이프 경도', '칼덕', 'M390 ZDP-189',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
              {
                q: '경도가 높을수록 좋은 칼인가요?',
                a: '아닙니다. 경도가 올라가면 <strong>날 유지력은 증가하지만 인성(충격 견딤)은 감소</strong>합니다. 58 HRC 부엌칼은 갈기 쉽고 떨어뜨려도 안 부서지지만, 65 HRC 칼은 날이 오래 가는 대신 뼈에 부딪히면 이 빠질 수 있어요. 용도에 맞춰 선택 — 일반 주방은 54~58, EDC·하이엔드는 59~62, 초고경도·특수용은 63+ 권장.',
              },
              {
                q: 'HRC와 HRB는 왜 따로 있나요?',
                a: 'Rockwell 경도계는 압자(indenter)와 하중을 바꿔 여러 스케일을 측정합니다. <strong>HRC는 다이아 원뿔 + 150kgf</strong>로 단단한 강철에, <strong>HRB는 1/16인치 구(현행 표준은 초경 HRBW) + 100kgf</strong>로 연강·황동에 적합. 무른 금속에 HRC를 쓰면 압자가 너무 깊이 들어가 부정확하고, 단단한 강철에 HRB를 쓰면 강구가 변형되어 측정 자체가 안 됩니다. 두 스케일이 만나는 경계가 HRC 20 ≈ HRB 100.',
              },
              {
                q: '카바이드(텅스텐 카바이드)는 왜 변환이 안 되나요?',
                a: '카바이드는 <strong>HV 1500~2500</strong> 범위로 ASTM E140 표 끝(HV 940 ≈ HRC 68)을 한참 벗어나며, Rockwell C로 정확히 측정 불가능합니다. 카바이드는 자체적으로 <strong>HRA(다이아 원뿔 + 60kgf)</strong> 스케일을 쓰며 HRA 85~95 범위가 일반적. 본 도구는 강철 전용이라 카바이드는 별도 표가 필요해요.',
              },
              {
                q: 'Shore 경도와 비교할 수 있나요?',
                a: '<strong>직접 변환은 불가</strong>합니다. Shore A/D 듀로미터도 압입식이지만(스프링 하중 + 전용 압자, ASTM D2240), 압자 형상·하중·대상 재료가 강철용 HRC/HV/HB와 전혀 달라 1:1 매핑할 수 없어요. 참고로 금속에 쓰는 쇼어 경도(HS)는 다이아몬드 해머의 반발 높이를 재는 스클레로스코프 방식으로, 이름만 같은 별개 시험입니다. Shore D 80은 단단한 폴리카보네이트 수준이며 강철과 같은 영역이 아닙니다. 칼·공구는 HRC/HV, 고무·플라스틱은 Shore A/D로 별개 관리.',
              },
              {
                q: 'HRC 60과 HV 700 중 어느 게 더 정확한 측정인가요?',
                a: 'HV(비커스)가 측정 원리상 더 정밀합니다 — 압자가 작아 박판·코팅·열영향부(HAZ) 등 미세 영역을 잴 수 있고, 단일 척도로 연강(HV 50)부터 카바이드(HV 2000+)까지 연속 측정 가능. 다만 HRC는 측정이 빠르고 장비가 저렴해 산업 현장에서 더 흔히 쓰입니다. 정밀 R&D는 HV, 양산 품질관리는 HRC가 일반적.',
              },
              {
                q: '인장강도(MPa)는 어떻게 추정되나요?',
                a: '강철의 경우 <strong>UTS(MPa) ≈ 3.45 × HB</strong> 또는 <strong>UTS ≈ 3.2 × HV</strong> 근사가 자주 쓰입니다. 본 도구는 <strong>ISO 18265 표 A.1</strong>(비합금·저합금강의 경도-인장강도 환산표) 값을 보간해 사용하며, 위 근사식과 대체로 일치합니다(ASTM E140에는 인장강도 열이 없습니다). ISO 스스로 경도→인장강도 환산을 가장 신뢰도 낮은 환산으로 규정하니, 실측치는 합금 성분·압연 방향·시험 온도에 따라 ±10% 오차가 흔하고 설계 적용 전에는 인장시험이 필수입니다.',
              },
              {
                q: '같은 강재인데 HRC 표기가 다른 이유가 뭔가요?',
                a: '<strong>열처리(quenching·tempering)</strong>가 다르기 때문입니다. 같은 VG-10이라도 담금질 후 템퍼링 온도를 조정해 60 HRC ~ 62 HRC 범위로 자유롭게 조절 가능. 카탈로그의 HRC는 제조사의 표준 처리 결과이며, 다른 처리를 적용하면 다른 값이 나옵니다. 또한 표면 경화(carburizing·nitriding) 처리 시 표면만 HRC 60+이고 내부는 25 수준일 수 있어요.',
              },
              {
                q: '집에서 경도를 측정할 수 있나요?',
                a: '정확한 측정은 어렵지만 간이 비교는 가능합니다. <strong>줄(file) 테스트</strong>가 가장 흔한 방법 — 새 줄(통상 HRC 62~66)로 시편을 긁어 흔적이 안 남으면 시편이 ≥줄 경도, 쉽게 깎이면 ≤줄 경도. 칼덕은 <strong>경도 측정 파일 세트</strong>(40·45·50·55·60·65 HRC 표준 줄 6개 구성)를 구매해 비교하기도 해요. 정확한 수치는 휴대용 Rockwell 경도계(중고 50만원~) 또는 전문 실험실 의뢰가 필요합니다.',
              },
            ]

export default function HardnessPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="unit" />경도(Hardness) 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>HRC·HRB·HV·HB·인장강도</strong> 동시 환산. ASTM E140 강철 표 기반. 칼덕·메이커·금속 가공용.
      </p>

      <HardnessClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5개 스케일 개요 */}
        <section>
          <h2 style={sectionTitle}>5개 경도 스케일 — 언제 어떤 걸 쓰나</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['스케일', '압자', '하중', '실용 범위', '주 사용'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HRC',     '120° 다이아 원뿔',     '150 kgf',  '20~70',     '경강·공구강·HSS·칼날'],
                  ['HRB',     '1/16" 구 (현행 초경 HRBW)', '100 kgf',  '40~100',    '연강·황동·구리'],
                  ['HV',      '136° 다이아 피라미드',  '1~50 kgf', '50~1500',   '박판·코팅·미세 영역 (가장 광범위)'],
                  ['HB',      '10mm 초경(텅스텐카바이드) 구', '3000 kgf', '80~650',    '주철·주강 등 큰 부품'],
                  ['Tensile', '—',                    '—',        '255~2180 MPa', '강철 인장강도 추정 (ISO 18265 환산)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, marginTop: 12 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>HRC와 HRB는 측정 범위가 거의 겹치지 않습니다</strong> — HRC 20 ≈ HRB 100이 경계. 같은 시편에 두 스케일 모두 측정하지 마세요.
          </p>
        </section>

        {/* 2. ASTM E140 */}
        <section>
          <h2 style={sectionTitle}>ASTM E140 — 강철 경도 환산 표준</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구의 경도 상호 환산은 <strong style={{ color: 'var(--text)' }}>ASTM E140(Standard Hardness Conversion Tables for Metals)</strong>의 Table 1(비오스테나이트계 강 — 탄소강·합금강·공구강)과 Table 2(연질 구간·HRB)를 기반으로 합니다. 강철의 통계적 평균치를 정리한 표로, 1950년대부터 사용되어 산업 표준으로 자리 잡았어요. 인장강도 열은 E140에 없는 항목이라 <strong style={{ color: 'var(--text)' }}>ISO 18265(경도값의 인장강도 환산) 표 A.1</strong>(비합금·저합금강)을 따릅니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>강철 전용</strong> — 알루미늄·구리·니켈 합금은 별도 표가 있으며 본 도구는 적용되지 않습니다.</li>
            <li><strong style={{ color: 'var(--text)' }}>오차는 한 숫자로 못 박을 수 없음</strong> — E140은 &ldquo;재료별 편차가 커서 환산 오차의 신뢰한계를 제시할 수 없다&rdquo;(§6.2)고 명시합니다. 환산값은 어디까지나 근사치로, 같은 HV라도 강종·열처리에 따라 환산 HRC가 달라질 수 있어요.</li>
            <li><strong style={{ color: 'var(--text)' }}>스테인리스 칼 강재는 편차 주의</strong> — VG-10·M390 같은 고탄소 칼 강재는 공구강과 성질이 가까워 이 환산이 실무·카탈로그에서 널리 통용되지만, 마르텐사이트계 스테인리스는 Table 1과 편차를 보일 수 있어 ASTM이 전용 환산표를 추가하는 개정 작업(WK97782)을 진행 중입니다. 강재 비교·취미 용도로는 충분하고, 규격 판정·품질 검사라면 해당 스케일로 직접 측정하는 것이 원칙.</li>
            <li><strong style={{ color: 'var(--text)' }}>HRC ≥ 20 권장</strong> — 그 이하 영역은 측정 신뢰도가 떨어지므로 HRB를 사용하세요.</li>
            <li><strong style={{ color: 'var(--text)' }}>브리넬 구 표기</strong> — 현행 ASTM E10·ISO 6506은 초경(텅스텐카바이드) 구만 인정(HBW)합니다. 구형 강구(HBS) 측정값은 고경도(약 450 HB 이상)에서 HBW와 차이가 날 수 있어요.</li>
            <li><strong style={{ color: 'var(--text)' }}>인장강도는 추정값</strong> — 정확한 인장강도는 인장시험기로 측정해야 합니다. 통상 <code style={{ color: 'var(--text)' }}>UTS ≈ 3.45 × HB (MPa)</code> 근사가 자주 쓰이고, 본 도구의 ISO 18265 보간값도 이와 대체로 일치합니다.</li>
          </ul>
        </section>

        {/* 3. 칼 강재 가이드 */}
        <section>
          <h2 style={sectionTitle}>🔪 칼 강재(Steel) 경도 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            칼 경도는 <strong style={{ color: 'var(--text)' }}>날 끝 유지력(edge retention)</strong>과 <strong style={{ color: 'var(--text)' }}>인성(toughness)</strong>의 트레이드오프를 결정합니다. 일반적으로 60 HRC를 기준으로 위는 &ldquo;오래 가지만 잘 부러짐&rdquo;, 아래는 &ldquo;빨리 무뎌지지만 잘 안 부러짐&rdquo;. 아래 수치는 제조사 공표 HRC 스펙 기준 참고표이며, 스테인리스 칼 강재의 스케일 간 환산 편차는 위 ASTM E140 단락의 주의를 참고하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '54~58 HRC',  d: '일반 주방칼·외식업', desc: '자주 갈아 쓰는 용도. 갈기 쉽고 내충격 좋음. Wüsthof·Henckels 등 독일계 다수.', c: 'var(--success)' },
              { t: '58~61 HRC',  d: '미들~프리미엄 EDC',  desc: 'VG-10·154CM·AUS-10·CPM-S30V·S35VN. EDC 폴딩·일본 주방칼의 표준대.', c: 'var(--cat-health)' },
              { t: '61~64 HRC',  d: '하이엔드 폴딩',      desc: 'M390·ELMAX·MagnaCut 상단 열처리. 날 유지력 ↑ 충격에 약함.', c: 'var(--warning)' },
              { t: '64~68 HRC',  d: '초고경도·특수강',     desc: 'ZDP-189·K390 등. 갈기 어렵고 잘 부서짐. 정밀 작업용.', c: 'var(--danger)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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
              { href: '/tools/unit/converter',     icon: '🔄', name: '단위 변환기',          desc: '길이·무게·부피 일반 단위' },
              { href: '/tools/interior/screw',     icon: '🔩', name: '나사·피스 가이드',     desc: '나사 규격·앵커 매칭' },
              { href: '/tools/interior/wire',      icon: '⚡', name: '전선 굵기 계산기',     desc: 'sq·AWG 변환 + 전류' },
              { href: '/tools/interior/pipe',      icon: '🔧', name: '배관 굵기 계산기',     desc: '관경·유량·압력손실' },
              { href: '/tools/interior/rebar',     icon: '🏗️', name: '철근 배근 계산기',    desc: '철근 사양·이음' },
              { href: '/tools/interior/bolt-wrench', icon: '🔨', name: '볼트·렌치',           desc: '볼트 규격 ↔ 렌치 사이즈' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
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
