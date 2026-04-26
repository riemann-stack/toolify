import type { Metadata } from 'next'
import Link from 'next/link'
import BmrClient from './BmrClient'

export const metadata: Metadata = {
  title: '기초대사량 계산기 2026 — BMR·TDEE·하루 칼로리 계산 | Youtil',
  description: 'Harris-Benedict 공식으로 기초대사량(BMR)과 활동량별 하루 권장 칼로리(TDEE)를 계산합니다. 다이어트·벌크업·마라톤 훈련 칼로리 목표 제공.',
  keywords: ['기초대사량계산기', 'BMR계산기', '하루칼로리', 'TDEE계산기', '다이어트칼로리', '칼로리계산기', '마라톤칼로리'],
}

export default function BmrPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔥 기초대사량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        기초대사량(BMR)과 활동 수준에 따른 하루 권장 칼로리를 계산합니다.
      </p>

      <BmrClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BMR이란? + TDEE 개념 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            기초대사량(BMR)과 TDEE란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            기초대사량(BMR, Basal Metabolic Rate)은 생명 유지를 위해 최소한으로 필요한 에너지량입니다.
            아무것도 하지 않고 누워있어도 심장 박동, 호흡, 체온 유지 등에 소모되는 칼로리로,
            전체 에너지 소비의 약 <strong style={{ color: 'var(--text)' }}>60~70%</strong>를 차지합니다.
          </p>

          {/* BMR vs TDEE 구분 박스 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>BMR</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>기초대사량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                완전한 안정 상태에서 생명 유지에 필요한 최소 칼로리. 아무것도 안 해도 소모됩니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>TDEE</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>총 일일 에너지 소비량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                BMR에 활동량을 반영한 <strong style={{ color: 'var(--text)' }}>하루 실제 소비 칼로리</strong>. 다이어트·식단 설계의 기준이 됩니다.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              💡 <strong style={{ color: 'var(--text)' }}>쉽게 이해하기:</strong> BMR은 자동차가 주차 중에도 소모하는 연료(엔진 공회전)이고,
              TDEE는 실제 주행거리에 따른 총 연료 소비량입니다.
              체중을 관리하려면 BMR이 아닌 <strong style={{ color: 'var(--accent)' }}>TDEE를 기준으로 식단을 설계</strong>해야 합니다.
            </p>
          </div>
        </div>

        {/* ── 2. Harris-Benedict 공식 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            Harris-Benedict 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            1919년 개발되어 현재 가장 널리 사용되는 기초대사량 계산 공식입니다.
            체중, 키, 나이, 성별을 반영해 비교적 정확한 BMR 추정이 가능합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 남성 */}
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.3)', borderRadius: '12px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '18px' }}>👨</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#3EC8FF', letterSpacing: '0.04em' }}>남성 BMR 공식</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 88.362<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (13.397 × 체중<span style={{ color: '#3EC8FF' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (4.799 × 키<span style={{ color: '#3EC8FF' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (5.677 × 나이<span style={{ color: '#3EC8FF' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 남성, 70kg, 175cm → BMR = 88.362 + 938 + 840 − 170 =
                <strong style={{ color: '#3EC8FF' }}> 약 1,696kcal</strong>
              </p>
            </div>

            {/* 여성 */}
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,213,0.3)', borderRadius: '12px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '18px' }}>👩</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF6BD9', letterSpacing: '0.04em' }}>여성 BMR 공식</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 447.593<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (9.247 × 체중<span style={{ color: '#FF6BD9' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (3.098 × 키<span style={{ color: '#FF6BD9' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (4.330 × 나이<span style={{ color: '#FF6BD9' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 여성, 55kg, 163cm → BMR = 447.593 + 509 + 505 − 130 =
                <strong style={{ color: '#FF6BD9' }}> 약 1,332kcal</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. 활동 수준별 TDEE 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            활동 수준별 TDEE 계산
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BMR에 아래 활동 계수를 곱하면 하루 총 소비 칼로리(TDEE)가 됩니다.
            자신의 활동 수준을 솔직하게 평가할수록 더 정확한 결과를 얻을 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>활동 수준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>활동 계수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>TDEE 계산법</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['거의 안 움직임 (사무직, 운동 없음)', '1.2',   'BMR × 1.2'],
                  ['가벼운 활동 (주 1~3회 운동)',        '1.375', 'BMR × 1.375'],
                  ['보통 활동 (주 3~5회 운동)',          '1.55',  'BMR × 1.55'],
                  ['활동적 (주 6~7회 강도 운동)',        '1.725', 'BMR × 1.725'],
                  ['매우 활동적 (하루 2회 운동·육체노동)', '1.9',   'BMR × 1.9'],
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

          {/* 마라톤 러너 팁 */}
          <div style={{ marginTop: '12px', background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🏃</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>마라톤 러너를 위한 팁</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                마라톤 훈련기에는 평소보다 TDEE가 <strong style={{ color: 'var(--text)' }}>500~1,000kcal</strong>까지 치솟을 수 있습니다.
                충분한 탄수화물 섭취가 부상을 방지하고 회복 속도를 높입니다.
                장거리 훈련 당일에는 탄수화물 비율을 평소보다 10~15%p 높여 글리코겐 저장량을 충분히 확보하세요.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 목표별 칼로리 설정 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목표별 칼로리 설정 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                title: '체중 감량 (다이어트)',
                color: '#3EC8FF',
                content: 'TDEE에서 300~500kcal를 줄이면 주당 0.3~0.5kg 감량이 가능합니다. 하루 500kcal 부족 시 1주일에 약 0.5kg 감량 효과가 있습니다. 1,200kcal(여성) / 1,500kcal(남성) 이하로는 내리지 않는 것을 권장합니다.',
              },
              {
                title: '체중 유지',
                color: '#3EFF9B',
                content: 'TDEE와 동일한 칼로리를 섭취하면 체중이 유지됩니다. 탄수화물 45~65%, 단백질 15~25%, 지방 20~35%의 균형 잡힌 식단을 권장합니다.',
              },
              {
                title: '근육 증가 (벌크업)',
                color: '#FF8C3E',
                content: 'TDEE보다 200~500kcal를 추가 섭취하고 충분한 단백질(체중 1kg당 1.6~2.2g)을 섭취하면 근육 성장에 도움이 됩니다. 너무 많은 칼로리 잉여는 체지방 증가로 이어집니다.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: 'Harris-Benedict 공식이란?',
                a: '1919년 개발된 기초대사량 계산 공식으로 현재 가장 널리 사용됩니다. 남성: 88.362 + (13.397×체중kg) + (4.799×키cm) - (5.677×나이), 여성: 447.593 + (9.247×체중kg) + (3.098×키cm) - (4.330×나이)로 계산합니다. 이후 Mifflin-St Jeor 공식도 개발되었으나 두 공식 모두 ±10% 수준의 오차가 있을 수 있습니다.',
              },
              {
                q: '기초대사량은 왜 사람마다 다른가요?',
                a: '기초대사량은 근육량, 나이, 성별, 유전적 요인에 따라 달라집니다. 근육은 지방보다 에너지를 많이 소비하므로 근육량이 많을수록 기초대사량이 높습니다. 나이가 들수록 근육량이 감소해 기초대사량도 낮아집니다.',
              },
              {
                q: '다이어트 중 기초대사량이 낮아지나요?',
                a: '장기간 칼로리를 심하게 제한하면 신체가 적응해 기초대사량이 낮아질 수 있습니다. 이를 방지하려면 급격한 칼로리 제한보다 TDEE의 10~20% 수준에서 조절하고 규칙적인 근력 운동을 병행하는 것이 좋습니다.',
              },
              {
                q: 'TDEE는 매일 같은가요?',
                a: '아닙니다. TDEE는 그날의 활동량에 따라 달라집니다. 장거리 달리기를 한 날은 TDEE가 평소보다 수백~1,000kcal 높을 수 있고, 완전 휴식일은 BMR에 가까워집니다. 주간 평균 TDEE를 기준으로 주간 총 칼로리 목표를 설정하는 방법이 실용적입니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',               desc: '현재 체중이 적정 범위인지 확인' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '칼로리 적자로 목표 달성일 예측' },
              { href: '/tools/health/pace',        icon: '🏃', name: '러닝 페이스 계산기',       desc: '마라톤 훈련 시 목표 페이스 계산' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',           desc: '식사·운동 루틴을 집중해서 관리' },
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