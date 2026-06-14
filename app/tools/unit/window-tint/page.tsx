import Link from 'next/link'
import WindowTintClient from './WindowTintClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/unit/window-tint',
  title: '선팅 투과율(VLT) 계산기 — 곱셈식·법규 70/40·차광률',
  description: '원유리 × 필름 농도를 곱해 실제 가시광선 투과율(VLT)을 계산합니다. 표기값이 필름 자체값인지 부착 후 합산값인지 토글로 구분, 도로교통법 앞면 70%·옆면 40% 기준과 자동 대조, 차광률·덧방·야간 시인성까지.',
  keywords: [
    '선팅 투과율 계산',
    '틴팅 VLT 계산기',
    '선팅 농도 35 투과율',
    '앞유리 선팅 기준 70',
    '운전석 선팅 40',
    '선팅 곱셈 계산',
    '차광률 계산',
  ],
})

const FAQ_LD = [
  {
    q: '농도 35% 필름을 붙이면 실제 투과율도 35%인가요?',
    a: '표기가 <strong>필름 자체값</strong>이면 아닙니다. 원유리 투과율과 곱해야 합니다. 원유리 75% × 필름 35% = <strong>약 26%</strong>가 실제 투과율입니다. 반대로 표기가 <strong>부착 후 합산값</strong>(표준유리에 붙여 측정한 값)이면 그 35%가 이미 실제 투과율이라 원유리와 또 곱하면 이중계산이 됩니다. 이 계산기의 표기 해석 토글로 두 경우를 구분하세요.',
  },
  {
    q: '왜 투과율을 더하지 않고 곱하나요?',
    a: '빛이 유리를 통과한 뒤 필름을 또 통과하기 때문입니다. 원유리에서 75%가 통과하고, 그중 35%가 필름을 통과하면 75% × 35% = 26.25%가 남습니다. 더하면(75+35) 100%가 넘어 말이 안 됩니다. 필름을 한 겹 더 덧방하면 그 값도 다시 곱합니다.',
  },
  {
    q: '앞유리와 운전석 옆면 선팅 기준은 몇 %인가요?',
    a: '도로교통법 시행령 제28조상 <strong>앞면(앞유리) 70% 이상</strong>, <strong>운전석·조수석(1열) 옆면 40% 이상</strong>의 가시광선 투과율을 확보해야 합니다. 즉 농도가 그 아래로 짙으면 기준 미달입니다. 뒷유리와 2열 이후 옆면은 투과율 제한이 없습니다.',
  },
  {
    q: '기준 미달이면 과태료가 얼마인가요?',
    a: '단속 시 범칙금·과태료 대상이 될 수 있으며 통상 2만원 안팎으로 알려져 있습니다. 다만 단속은 측정기로 실제 투과율을 재서 판단하고, 금액·운영은 시기·지자체에 따라 달라질 수 있어 단정하기 어렵습니다. 이 계산기 값은 곱셈식 추정이므로 참고용으로만 보세요.',
  },
  {
    q: '농도가 짙을수록(숫자가 낮을수록) 야간에 위험한가요?',
    a: '투과율이 낮을수록 들어오는 빛이 줄어 야간·우천·터널에서 인지 거리가 짧아질 수 있습니다. 합산 VLT가 <strong>35% 미만</strong>이면 운전석 옆면은 시야 확보에 불리할 수 있어 주의가 필요합니다. 다만 개인 시력·도로 조명에 따라 체감 차이가 크므로 단정적인 위험 수치는 아닙니다.',
  },
  {
    q: '제 차 원유리 투과율을 모르면 몇 %로 두나요?',
    a: '별도 코팅이 없는 일반 출고(OEM) 유리는 보통 약 70~80% 투과합니다. 앞유리는 더 높은 편입니다. 정확한 값을 모르면 기본 <strong>75%</strong>로 두고 계산해도 무방하고, 최종 적합 여부는 자동차 정기검사나 투과율 측정기로 확인하는 것이 정확합니다.',
  },
]

export default function WindowTintPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪟 선팅 투과율(VLT) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        원유리와 필름 농도를 <strong style={{ color: 'var(--text)' }}>곱해서</strong> 실제 가시광선 투과율을 구합니다. 표기값이 필름 자체값인지 부착 후 합산값인지 구분하고, 앞면 70%·옆면 40% 법규 기준과 바로 대조합니다.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="도로교통법 시행령 제28조 기준"
        sources={[{ label: '국가법령정보센터(law.go.kr)', href: 'https://www.law.go.kr/' }]}
      />

      <Disclaimer
        variant="default"
        open
        sources={[{ label: '국가법령정보센터 — 도로교통법 시행령', href: 'https://www.law.go.kr/' }]}
      >
        곱셈식 추정 참고용입니다. 실제 투과율은 유리·필름 종류·시공·측정장비에 따라 다르고, 시중 필름 표기는 부착 후 측정값일 수 있어 차이가 날 수 있습니다. 최종 적합 여부는 자동차 정기검사·투과율 측정기로 확인하세요.
      </Disclaimer>

      <WindowTintClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. VLT란 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            VLT란? — 투과율·농도·차광률 정리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            VLT(Visible Light Transmission)는 <strong style={{ color: 'var(--text)' }}>가시광선 투과율</strong>, 즉 유리·필름을 통과해 들어오는 빛의 비율(%)입니다. 선팅 가게에서 말하는 &lsquo;농도 35&rsquo;가 바로 이 투과율을 가리킵니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { t: '투과율(VLT)', v: '높을수록 밝음', d: '통과하는 빛의 비율. 70%면 밝고 5%면 거의 안 보임.' },
              { t: '농도(%)', v: '낮을수록 짙음', d: '실무에선 투과율과 같은 숫자로 통용. &lsquo;농도 15&rsquo; = 투과율 15%.' },
              { t: '차광률(%)', v: '100 − VLT', d: '막아내는 빛의 비율. 투과율 26%면 차광률 74%.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px' }}>{c.v}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            주의할 점 하나. &lsquo;농도 35 필름&rsquo;을 붙였다고 차창의 최종 투과율이 35%가 되는 게 아닙니다. 유리 자체 투과율과 곱해지기 때문입니다 — 다음 항목에서 설명합니다.
          </p>
        </div>

        {/* ── 2. 왜 곱셈인가 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            왜 더하지 않고 곱하나 — 75% × 35% ≈ 26%
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            빛은 유리를 먼저 지나고, 살아남은 빛이 필름을 다시 지납니다. 원유리에서 75%가 통과하고 그중 35%가 필름을 통과하면 남는 건 <strong style={{ color: 'var(--text)' }}>75% × 35% = 26.25%</strong>입니다. 더해서 110%가 될 수는 없습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
              들어온 빛 100 → 유리 통과 <strong>×0.75</strong> → 75 → 필름 통과 <strong>×0.35</strong> → <strong style={{ color: 'var(--accent-ink)' }}>26.25</strong>
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
              필름을 한 겹 더 덧방하면 그 투과율도 다시 곱합니다. 예: 26.25% 위에 50% 필름 한 장 → 26.25% × 0.50 ≈ 13.1%.
            </p>
          </div>
        </div>

        {/* ── 3. 표기 농도의 함정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            표기 농도의 함정 — 자체값 vs 부착 후 값
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            여기서 많이들 헷갈립니다. 제품 카탈로그·스펙표에 적힌 투과율이 <strong style={{ color: 'var(--text)' }}>필름 자체값</strong>인지, <strong style={{ color: 'var(--text)' }}>표준유리에 붙여 잰 합산값</strong>인지에 따라 계산이 달라집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>① 필름 자체값으로 표기된 경우</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                필름만의 투과율입니다. <strong style={{ color: 'var(--text)' }}>원유리 투과율과 곱해야</strong> 실제 차창 값이 나옵니다. 계산기의 &lsquo;필름 자체값&rsquo; 토글.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>② 부착 후 합산값으로 표기된 경우</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                이미 표준유리에 붙여 측정한 값이라 <strong style={{ color: 'var(--text)' }}>그대로가 실제 투과율</strong>입니다. 여기에 원유리를 또 곱하면 이중계산. &lsquo;부착 후 합산값&rsquo; 토글.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            시중 표기는 <strong style={{ color: 'var(--text)' }}>②(부착 후 값)인 경우가 적지 않습니다.</strong> 표기 기준이 불확실하면 두 토글을 모두 켜보고 결과 폭을 가늠하세요. 어느 쪽이든 최종 확인은 측정기로.
          </p>
        </div>

        {/* ── 4. 한국 법규 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 선팅 법규 — 앞면 70% · 옆면 40%
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            <strong style={{ color: 'var(--text)' }}>도로교통법 시행령 제28조</strong>는 운전에 직접 영향을 주는 창의 최소 투과율을 정합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['창 위치', '최소 투과율', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '앞면(앞유리)', v: '70% 이상', n: '가장 엄격 — 전방 시야' },
                  { p: '운전석·조수석(1열) 옆면', v: '40% 이상', n: '좌우 시야 확보' },
                  { p: '뒷유리·2열 이후 옆면', v: '제한 없음', n: '법적 투과율 규정 없음' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            단속은 투과율 측정기로 실제 값을 재서 판단합니다. 기준 미달이면 범칙금·과태료(통상 2만원 안팎) 대상이 될 수 있으나, 금액·운영은 시기·지자체에 따라 달라질 수 있어 단정하기 어렵습니다. 출처: <a href="https://www.law.go.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>국가법령정보센터 ↗</a>
          </p>
        </div>

        {/* ── 5. 농도별 야간 시인성 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            농도별 야간 시인성·안전
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            투과율이 낮을수록 들어오는 빛이 줄어 야간·우천·터널에서 보이는 거리가 짧아집니다. 아래는 일반적인 체감 기준으로, 개인 시력·도로 조명에 따라 차이가 큽니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['합산 VLT', '체감', '야간 주행'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { v: '70% 이상', f: '거의 투명', n: '앞유리 가능, 야간 시야 충분' },
                  { v: '40~70%', f: '옅음', n: '옆면 가능, 야간 무난' },
                  { v: '35~40%', f: '보통', n: '야간 시야 확보 양호한 하한' },
                  { v: '15~35%', f: '짙음', n: '야간·우천 시 인지거리 단축 주의' },
                  { v: '5~15%', f: '매우 짙음', n: '야간·후진 시야 크게 저하' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.f}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            운전석 옆면은 법규상 40% 이상이 필요할 뿐 아니라 야간 안전 측면에서도 너무 짙게 하지 않는 편이 낫습니다. 뒷유리는 제한이 없지만 후진·차선 변경 시야를 생각해 정하세요.
          </p>
        </div>

        {/* ── 6. 최종은 정기검사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            최종 확인은 측정기·정기검사로
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
            이 계산기는 곱셈식 추정값입니다. 같은 &lsquo;농도 35&rsquo; 필름도 제조사·시공·유리 곡면에 따라 실측값이 달라지고, 표기가 부착 후 값인지 자체값인지에 따라 결과가 크게 갈립니다. 단속·검사는 <strong style={{ color: 'var(--text)' }}>투과율 측정기</strong>로 실제 값을 잽니다. 적합 여부가 빠듯하면 시공 전후로 측정기 수치를 직접 확인하는 것이 안전합니다. 일반 출고 차의 유리가 이미 약 75% 안팎 투과한다는 점을 감안하면, 옆면에 짙은 농도를 붙일 때 40% 기준을 넘기기는 생각보다 쉽지 않습니다.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 계산기', desc: '공기압 변환·규격 해석·교체시기' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/life/vin-decoder',    icon: '🔎', name: '차대번호(VIN) 해석', desc: '제조국·연식·차종 17자리 분석' },
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
