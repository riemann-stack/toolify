import type { Metadata } from 'next'
import WeightLossClient from './WeightLossClient'

export const metadata: Metadata = {
  title: '체중 감량 기간 계산기 — 다이어트 목표일 계산 | Youtil',
  description: '현재 체중과 목표 체중, 하루 칼로리 적자를 입력해 목표 체중 달성일을 계산합니다. 안전한 감량 속도 가이드 제공.',
  keywords: ['체중감량계산기', '다이어트기간계산기', '칼로리적자계산기', '감량기간계산', '목표체중달성일'],
}

export default function WeightLossPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎯 목표 체중 감량 기간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        하루 칼로리 적자를 기반으로 목표 체중 달성까지 걸리는 기간을 계산합니다.
      </p>

      <WeightLossClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>칼로리 적자별 감량 속도</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            지방 1kg을 태우려면 약 7,700kcal의 칼로리 적자가 필요합니다. 하루 칼로리 적자에 따른 주당 감량 속도는 다음과 같습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>하루 칼로리 적자</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>주당 감량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>월당 감량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>평가</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['300kcal', '약 0.27kg', '약 1.2kg', '매우 안전', '#3EFF9B'],
                  ['500kcal', '약 0.45kg', '약 2.0kg', '안전 권장', '#3EFF9B'],
                  ['700kcal', '약 0.64kg', '약 2.7kg', '적극 감량', '#C8FF3E'],
                  ['1,000kcal', '약 0.91kg', '약 3.9kg', '주의 필요', '#FF8C3E'],
                  ['1,500kcal', '약 1.36kg', '약 5.9kg', '위험', '#FF6B6B'],
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

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '지방 1kg 감량에 7,700kcal가 필요한 이유는?', a: '지방 조직은 약 80%가 지방으로 구성되어 있으며 지방 1g은 약 9kcal의 에너지를 저장합니다. 1kg의 지방 조직에는 약 800g의 순수 지방이 포함되어 있어 800g × 9kcal = 7,200~7,700kcal가 됩니다.' },
              { q: '하루 최소 칼로리 섭취량은 얼마인가요?', a: '일반적으로 여성은 하루 1,200kcal, 남성은 1,500kcal 이하로 섭취하면 근손실, 영양 결핍 등의 부작용이 발생할 수 있습니다. 의사 또는 영양사의 지도 아래 진행하는 것이 안전합니다.' },
              { q: '실제 감량 속도가 계산기와 다를 수 있나요?', a: '네, 이 계산기는 이론적인 수치를 제공합니다. 실제 감량 속도는 신진대사율, 근육량, 수면, 스트레스, 호르몬 등 다양한 요인에 영향을 받습니다. 장기적으로는 근력 운동과 식이 조절을 병행하는 것이 효과적입니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}