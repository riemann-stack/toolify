import type { Metadata } from 'next'
import BmrClient from './BmrClient'

export const metadata: Metadata = {
  title: '기초대사량 계산기 2026 — BMR·하루 칼로리 계산 | Youtil',
  description: 'Harris-Benedict 공식으로 기초대사량(BMR)과 활동량별 하루 권장 칼로리(TDEE)를 계산합니다. 다이어트·벌크업 칼로리 목표 제공.',
  keywords: ['기초대사량계산기', 'BMR계산기', '하루칼로리', 'TDEE계산기', '다이어트칼로리', '칼로리계산기'],
}

export default function BmrPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔥 기초대사량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        기초대사량(BMR)과 활동 수준에 따른 하루 권장 칼로리를 계산합니다.
      </p>

      <BmrClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>기초대사량(BMR)이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            기초대사량(BMR, Basal Metabolic Rate)은 생명 유지를 위해 최소한으로 필요한 에너지량입니다. 아무것도 하지 않고 누워있어도 심장 박동, 호흡, 체온 유지 등에 소모되는 칼로리입니다. 전체 에너지 소비의 약 60~70%를 차지합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>활동 수준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>활동 계수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>TDEE 계산법</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['거의 안 움직임 (사무직, 운동 없음)', '1.2', 'BMR × 1.2'],
                  ['가벼운 활동 (주 1~3회 운동)', '1.375', 'BMR × 1.375'],
                  ['보통 활동 (주 3~5회 운동)', '1.55', 'BMR × 1.55'],
                  ['활동적 (주 6~7회 강도 운동)', '1.725', 'BMR × 1.725'],
                  ['매우 활동적 (하루 2회 운동, 육체노동)', '1.9', 'BMR × 1.9'],
                ].map(([level, factor, calc], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{level}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{factor}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{calc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>목표별 칼로리 설정 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '체중 감량 (다이어트)', color: '#3EC8FF', content: 'TDEE에서 300~500kcal를 줄이면 주당 0.3~0.5kg 감량이 가능합니다. 하루 500kcal 부족 시 1주일에 약 0.5kg 감량 효과가 있습니다. 1,200kcal(여성) / 1,500kcal(남성) 이하로는 내리지 않는 것을 권장합니다.' },
              { title: '체중 유지', color: '#3EFF9B', content: 'TDEE와 동일한 칼로리를 섭취하면 체중이 유지됩니다. 탄수화물 45~65%, 단백질 15~25%, 지방 20~35%의 균형 잡힌 식단을 권장합니다.' },
              { title: '근육 증가 (벌크업)', color: '#FF8C3E', content: 'TDEE보다 200~500kcal를 추가 섭취하고 충분한 단백질(체중 1kg당 1.6~2.2g)을 섭취하면 근육 성장에 도움이 됩니다. 너무 많은 칼로리 잉여는 체지방 증가로 이어집니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'Harris-Benedict 공식이란?', a: '1919년 개발된 기초대사량 계산 공식으로 현재 가장 널리 사용됩니다. 남성: 88.362 + (13.397×체중kg) + (4.799×키cm) - (5.677×나이), 여성: 447.593 + (9.247×체중kg) + (3.098×키cm) - (4.330×나이)로 계산합니다.' },
              { q: '기초대사량은 왜 사람마다 다른가요?', a: '기초대사량은 근육량, 나이, 성별, 유전적 요인에 따라 달라집니다. 근육은 지방보다 에너지를 많이 소비하므로 근육량이 많을수록 기초대사량이 높습니다. 나이가 들수록 근육량이 감소해 기초대사량도 낮아집니다.' },
              { q: '다이어트 중 기초대사량이 낮아지나요?', a: '장기간 칼로리를 심하게 제한하면 신체가 적응해 기초대사량이 낮아질 수 있습니다. 이를 방지하려면 급격한 칼로리 제한보다 TDEE의 10~20% 수준에서 조절하고 규칙적인 근력 운동을 병행하는 것이 좋습니다.' },
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