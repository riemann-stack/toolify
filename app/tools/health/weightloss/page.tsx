import type { Metadata } from 'next'
import Link from 'next/link'
import WeightLossClient from './WeightLossClient'

export const metadata: Metadata = {
  title: '목표 체중 감량 기간 계산기 — 칼로리 적자·요요 방지 | Youtil',
  description: '현재 체중과 목표 체중, 하루 칼로리 적자를 입력해 목표 체중 달성일을 계산합니다. 요요 방지 감량 속도, TDEE 연동 가이드, 안전한 감량 속도 안내.',
  keywords: ['체중감량계산기', '다이어트기간계산기', '칼로리적자계산기', '감량기간계산', '목표체중달성일', '요요방지다이어트'],
}

export default function WeightLossPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·안전</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎯 목표 체중 감량 기간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        하루 칼로리 적자를 기반으로 목표 체중 달성까지 걸리는 기간을 계산합니다.
      </p>

      <WeightLossClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 감량 소요 기간 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            감량 소요 기간 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            체중 감량의 핵심은 <strong style={{ color: 'var(--text)' }}>칼로리 적자</strong>입니다.
            섭취 칼로리가 소비 칼로리보다 적으면 신체는 저장된 지방을 에너지원으로 사용합니다.
            지방 1kg을 소모하려면 약 <strong style={{ color: 'var(--text)' }}>7,700kcal</strong>의 누적 적자가 필요합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>감량 소요 기간 공식</p>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2.2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px' }}>
                <p>총 필요 칼로리 적자 = 목표 감량(kg) × <span style={{ color: 'var(--accent)' }}>7,700</span>kcal</p>
                <p>소요 기간(일) = 총 필요 칼로리 적자 ÷ <span style={{ color: 'var(--accent)' }}>하루 칼로리 적자</span></p>
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 5kg 감량 목표, 하루 500kcal 적자<br />
                → 총 필요 적자 = 5 × 7,700 = <strong style={{ color: 'var(--accent)' }}>38,500kcal</strong><br />
                → 소요 기간 = 38,500 ÷ 500 = <strong style={{ color: 'var(--accent)' }}>77일 (약 11주)</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. 요요 없이 감량하는 법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            요요 현상 없이 감량하는 법
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            빠른 감량보다 <strong style={{ color: 'var(--text)' }}>지속 가능한 속도</strong>로 줄이는 것이 장기적으로 훨씬 효과적입니다.
            급격한 체중 감량은 근육량 손실과 기초대사량 저하를 유발해 요요 현상의 주요 원인이 됩니다.
          </p>

          {/* 핵심 문구 강조 박스 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#3EFF9B', marginBottom: '6px' }}>
              주당 체중의 0.5~1% 감량이 요요 방지에 가장 효과적입니다
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              현재 체중 70kg이라면 주당 0.35~0.7kg 감량이 안전한 범위입니다.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '🥗', title: '급격한 식단 제한 금지', content: '하루 1,200kcal(여성) / 1,500kcal(남성) 이하로 섭취하면 신체가 절약 모드로 전환되어 기초대사량이 급락합니다. 이 상태에서 식사를 정상화하면 체중이 급격히 늘어나는 요요가 발생합니다.' },
              { icon: '💪', title: '근력 운동 병행', content: '칼로리 제한만으로 감량하면 지방뿐 아니라 근육도 함께 줄어듭니다. 근육량이 감소하면 기초대사량이 낮아져 같은 양을 먹어도 더 쉽게 살이 찌는 체질이 됩니다. 주 2~3회 근력 운동을 병행하세요.' },
              { icon: '📅', title: '목표를 장기적으로 설정', content: '6개월~1년에 걸쳐 천천히 감량한 체중이 훨씬 오래 유지됩니다. 급하게 뺀 체중은 근육 손실이 크고 요요 가능성이 높습니다. 목표 달성 후에도 3~6개월간 유지 기간을 가지는 것이 중요합니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 칼로리 적자별 감량 속도 (기존 유지) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>칼로리 적자별 감량 속도</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            지방 1kg을 태우려면 약 7,700kcal의 칼로리 적자가 필요합니다. 하루 칼로리 적자에 따른 주당 감량 속도는 다음과 같습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>하루 칼로리 적자</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>주당 감량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>월당 감량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>평가</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['300kcal',   '약 0.27kg', '약 1.2kg', '매우 안전', '#3EFF9B'],
                  ['500kcal',   '약 0.45kg', '약 2.0kg', '안전 권장', '#3EFF9B'],
                  ['700kcal',   '약 0.64kg', '약 2.7kg', '적극 감량', '#C8FF3E'],
                  ['1,000kcal', '약 0.91kg', '약 3.9kg', '주의 필요', '#FF8C3E'],
                  ['1,500kcal', '약 1.36kg', '약 5.9kg', '위험',      '#FF6B6B'],
                ].map(([deficit, weekly, monthly, level, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{deficit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{weekly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{monthly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 500 }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. FAQ (기존 3개 + 신규 2개) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '지방 1kg 감량에 7,700kcal가 필요한 이유는?',
                a: '지방 조직은 약 80%가 지방으로 구성되어 있으며 지방 1g은 약 9kcal의 에너지를 저장합니다. 1kg의 지방 조직에는 약 800g의 순수 지방이 포함되어 있어 800g × 9kcal = 7,200~7,700kcal가 됩니다.',
              },
              {
                q: '하루 최소 칼로리 섭취량은 얼마인가요?',
                a: '일반적으로 여성은 하루 1,200kcal, 남성은 1,500kcal 이하로 섭취하면 근손실, 영양 결핍 등의 부작용이 발생할 수 있습니다. 의사 또는 영양사의 지도 아래 진행하는 것이 안전합니다.',
              },
              {
                q: '실제 감량 속도가 계산기와 다를 수 있나요?',
                a: '네, 이 계산기는 이론적인 수치를 제공합니다. 실제 감량 속도는 신진대사율, 근육량, 수면, 스트레스, 호르몬 등 다양한 요인에 영향을 받습니다. 장기적으로는 근력 운동과 식이 조절을 병행하는 것이 효과적입니다.',
              },
              {
                q: '칼로리 적자를 어떻게 만들어야 하나요?',
                a: '칼로리 적자는 두 가지 방법으로 만들 수 있습니다. ① 식이 조절: 하루 섭취 칼로리를 줄이는 방법. ② 운동: 활동량을 늘려 소비 칼로리를 높이는 방법. 두 방법을 함께 사용하면 더 효과적입니다. 예를 들어 식단에서 250kcal, 운동으로 250kcal를 추가로 소모하면 하루 500kcal 적자를 달성할 수 있습니다.',
              },
              {
                q: '다이어트 정체기는 왜 오나요?',
                a: '처음 1~2주 감량 후 체중이 더 이상 줄지 않는 정체기가 오는 경우가 많습니다. 이는 신체가 낮아진 체중에 맞게 기초대사량을 낮추기 때문입니다. 정체기를 극복하려면 칼로리를 50~100kcal 더 줄이거나 운동 강도를 높이거나, 1~2주 유지 식단을 먹은 후 다시 적자로 돌아가는 방법(다이어트 브레이크)을 시도해볼 수 있습니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량(BMR) 계산기',    desc: '내 TDEE를 알고 정확한 칼로리 목표 설정' },
              { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기',                desc: '목표 체중이 적정 범위인지 먼저 확인' },
              { href: '/tools/health/pace',icon: '🏃', name: '러닝 페이스 계산기',        desc: '달리기로 칼로리를 소모해 적자 만들기' },
              { href: '/tools/date/dday',  icon: '📅', name: 'D-day 계산기',              desc: '목표 달성일까지 카운트다운' },
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