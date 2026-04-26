import Link from 'next/link'
import AlcoholClient from './AlcoholClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/alcohol',
  title: '알코올 도수 계산기 — 혼합 음료·소맥 도수 계산',
  description: '소맥, 폭탄주 등 혼합 음료의 알코올 도수를 계산합니다. 표준 음주량(g), 목표 도수에 맞는 희석 비율 계산. 절주 계획에 활용하세요.',
  keywords: ['알코올도수계산기', '소맥도수계산기', '혼합주도수', '폭탄주도수', '표준음주량', '알코올계산기'],
})

export default function AlcoholPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍺 알코올 도수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        혼합 음료의 도수와 표준 음주량을 계산하고, 목표 도수에 맞는 희석량을 확인하세요.
      </p>

      <AlcoholClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 계산 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            계산 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '예시 1 — 소맥 황금 비율 도수 계산',
                color: '#C8FF3E',
                desc: '소주 50ml (16%) + 맥주 400ml (4.5%) 혼합',
                calc: '(50×0.16 + 400×0.045) / 450 × 100 = (8 + 18) / 450 × 100',
                result: '혼합 도수 ≈ 5.78%',
                sub: '총 450ml · 순수 알코올 26ml · 알코올 20.8g · 표준잔 약 2.6잔',
              },
              {
                title: '예시 2 — 와인 도수 낮추기 (목표 도수 계산)',
                color: '#3EC8FF',
                desc: '와인 150ml (13%) → 목표 도수 8%로 희석',
                calc: '추가할 물 = (150 × 13 / 8) - 150 = 243.75 - 150',
                result: '물 약 93.8ml 추가',
                sub: '최종 용량 243.8ml · 도수 8% 달성',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${ex.color}25`, borderRadius: '12px', padding: '18px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: ex.color, marginBottom: '8px' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>{ex.desc}</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', margin: '10px 0', fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)' }}>
                  {ex.calc}
                </div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: ex.color, marginBottom: '4px' }}>{ex.result}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{ex.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 자주 마시는 술 도수 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 마시는 술 도수 기준표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '도수 범위', '일반 용량', '1잔 알코올'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['소주',     '16~25%', '360ml (1병)',    '~46g (1병 기준 16%)', '#C8FF3E'],
                  ['맥주',     '4~5%',   '500ml (1캔)',    '~16g',                '#3EFF9B'],
                  ['막걸리',   '6~8%',   '750ml (1병)',    '~36g',                '#FF8C3E'],
                  ['와인',     '12~14%', '150ml (1잔)',    '~14.4g',              '#C83EFF'],
                  ['소주(희석)', '40%→16%', '희석 후 360ml', '46g (원액 기준)',   '#3EC8FF'],
                  ['양주·위스키','40~50%','45ml (1샷)',    '~14.4g',              '#FF8C3E'],
                  ['사케',     '15~16%', '180ml (1홉)',    '~21.6g',              '#FF3E8C'],
                  ['막걸리(생)','6~8%',  '750ml',          '~28.8g (6%)',         '#3EFF9B'],
                ].map(([name, abv, vol, alc, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{abv}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{vol}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{alc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.8 (알코올 밀도). 실제 제품마다 도수가 다를 수 있습니다.
          </p>
        </div>

        {/* ── 3. 표준 음주량 안내 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 표준 음주량 안내
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            표준 음주량(Standard Drink)은 알코올 섭취량을 객관적으로 비교하기 위한 기준 단위입니다.
            한국은 <strong style={{ color: 'var(--text)' }}>1표준잔 = 알코올 8g</strong> 기준을 사용합니다 (WHO는 10g 기준).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { drink: '소주 1잔 (50ml, 16%)',  alc: '6.4g', std: '0.8표준잔', color: '#C8FF3E' },
              { drink: '맥주 1캔 (500ml, 4.5%)', alc: '18g',  std: '2.25표준잔', color: '#3EFF9B' },
              { drink: '와인 1잔 (150ml, 13%)',  alc: '15.6g', std: '1.95표준잔', color: '#C83EFF' },
              { drink: '양주 1샷 (45ml, 40%)',   alc: '14.4g', std: '1.8표준잔', color: '#FF8C3E' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: item.color, fontWeight: 600, marginBottom: '6px' }}>{item.drink}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{item.alc}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.std}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.15)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>보건복지부 저위험 음주 권고 기준</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: '남성', value: '주 14표준잔 이하', sub: '1일 4잔 이하' },
                { label: '여성', value: '주 7표준잔 이하',  sub: '1일 2잔 이하' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '소맥 황금 비율의 도수는?',
                a: '소맥 황금 비율은 보통 소주 50ml(16%) + 맥주 400~450ml(4.5%) 조합을 말합니다. 이 계산기로 계산하면 혼합 도수는 약 5.5~5.8% 수준입니다. 사람마다 선호하는 비율이 다르므로 직접 입력해 원하는 도수를 찾아보세요.' },
              { q: '알코올 순수량(g)은 어떻게 계산하나요?',
                a: '알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.8입니다. 0.8을 곱하는 이유는 알코올(에탄올)의 밀도가 물(1g/ml)보다 낮은 0.8g/ml이기 때문입니다. 예를 들어 소주 1잔 50ml(16%) = 50 × 0.16 × 0.8 = 6.4g입니다.' },
              { q: '표준 음주량이란 무엇인가요?',
                a: '표준 음주량(Standard Drink)은 술의 종류나 용량에 관계없이 알코올 섭취량을 동일한 기준으로 비교하기 위한 단위입니다. 한국은 알코올 8g을 1표준잔으로 정의합니다. 맥주 한 캔과 소주 한 잔의 실제 알코올 양이 얼마나 차이 나는지 비교하는 데 유용합니다.' },
              { q: '음주 후 운전 가능 시간은 어떻게 계산하나요?',
                a: '체내 알코올 분해 속도는 개인마다 크게 다르지만, 일반적으로 시간당 알코올 약 7~10g이 분해됩니다. 정확한 분해 시간은 체중, 성별, 건강 상태, 빈속 여부 등에 따라 달라지므로 이 계산기의 결과로 운전 가능 여부를 판단해서는 안 됩니다. 음주 후에는 반드시 대리운전이나 대중교통을 이용하세요.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 절주 안내 ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B6B', marginBottom: '10px' }}>⚠️ 책임 있는 음주 안내</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '10px' }}>
            본 계산기는 음주를 권장하지 않으며, 책임 있는 음주 문화를 위한 참고 도구입니다.
            계산 결과는 체내 알코올 분해 속도나 취기의 정도를 보장하지 않습니다.
          </p>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              '임산부 및 수유 중인 분은 음주를 삼가세요.',
              '미성년자의 음주는 법으로 금지되어 있습니다.',
              '약물 복용 중에는 음주 전 반드시 의사와 상담하세요.',
              '음주 후 운전은 절대 금지입니다.',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',    icon: '🍻', name: '더치페이 계산기',  desc: '술자리 비용 n빵 계산' },
              { href: '/tools/life/pomodoro', icon: '🍅', name: '뽀모도로 타이머',  desc: '음주 후 휴식·회복 타이머' },
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '안주 인분 수 자동 계산' },
              { href: '/tools/unit/weight',   icon: '⚖️', name: '무게 변환기',       desc: 'g·ml·oz 단위 변환' },
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
