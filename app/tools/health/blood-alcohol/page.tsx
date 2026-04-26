import type { Metadata } from 'next'
import Link from 'next/link'
import BloodAlcoholClient from './BloodAlcoholClient'

export const metadata: Metadata = {
  title: '음주 후 혈중알코올 소멸 계산기 — BAC 추정·운전 가능 시각 | Youtil',
  description: '체중·음주량 기반으로 혈중알코올농도(BAC)를 추정하고 면허정지·취소 기준 해소 시각을 계산합니다. Widmark 공식 적용. 음주운전 예방 참고 도구.',
  keywords: ['혈중알코올계산기', '음주후운전가능시간', 'BAC계산기', '혈중알코올농도계산', '음주운전기준', '알코올소멸시간', '음주측정계산기'],
}

export default function BloodAlcoholPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍺 혈중알코올 소멸 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        체중·음주량을 바탕으로 혈중알코올농도(BAC)를 추정하고 면허정지·취소 기준 해소 시각을 안내합니다.
      </p>

      {/* 상단 법적 면책 */}
      <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '14px', padding: '18px 20px', marginBottom: '32px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#FF6B6B', marginBottom: '10px' }}>⚠️ 법적 면책 조항</p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
          본 계산기는 <strong style={{ color: 'var(--text)' }}>음주 예방 교육 목적의 참고용 도구</strong>입니다.
          계산 결과는 개인의 신체 상태, 음식 섭취량, 건강 상태 등에 따라 실제와 크게 다를 수 있습니다.
          결과와 관계없이 <strong style={{ color: '#FF6B6B' }}>음주 후에는 절대 운전하지 마시고</strong> 대리운전 또는 대중교통을 이용하세요.
          음주운전은 형사처벌 대상이며, 본 계산기는 법적 판단 근거가 되지 않습니다.
        </p>
      </div>

      <BloodAlcoholClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Widmark 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Widmark 공식
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Blood Alcohol Concentration</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px' }}>
              BAC(g/dL) = 알코올(g) ÷ (체중(kg) × r × 10)
            </p>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
              <li>남성 체수분비율 <strong style={{ color: '#3EC8FF' }}>r = 0.68</strong></li>
              <li>여성 체수분비율 <strong style={{ color: '#FF3E8C' }}>r = 0.55</strong></li>
              <li>알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7894 (에탄올 밀도)</li>
              <li>감소율: 시간당 <strong style={{ color: 'var(--text)' }}>약 0.015 g/dL</strong> (표준, 개인차 있음)</li>
            </ul>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', marginTop: '14px', fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
              <span style={{ color: 'var(--muted)' }}>예시</span> 70kg 남성이 소주 1병(360ml × 16%) 음주 시<br/>
              알코올 = 360 × 0.16 × 0.7894 ≈ <strong>45.5g</strong><br/>
              최고 BAC = 45.5 ÷ (70 × 0.68 × 10) ≈ <strong style={{ color: 'var(--accent)' }}>0.096 g/dL</strong>
            </div>
          </div>
        </div>

        {/* ── 2. 음주운전 처벌 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            음주운전 처벌 기준 (2023년 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>BAC</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>처벌 수준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>내용</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['0.03~0.049%', '면허정지',   '벌점 100점, 100일 정지',                                        '#FF8C3E'],
                  ['0.05~0.079%', '면허정지',   '벌점 100점, 100일 정지',                                        '#FF8C3E'],
                  ['0.08~0.099%', '면허취소',   '1년 결격, 1년 이하 징역 또는 500만원 이하 벌금',                '#FF6B6B'],
                  ['0.10~0.199%', '면허취소',   '2년 결격, 1~2년 징역 또는 500만~1000만원 벌금',                 '#FF6B6B'],
                  ['0.20% 이상',  '면허취소',   '3년 결격, 2~5년 징역 또는 1000만~2000만원 벌금',                '#FF3E3E'],
                  ['측정 거부',   '면허취소',   '5년 결격, 1~5년 징역 또는 500만~2000만원 벌금',                 '#FF3E3E'],
                ].map(([bac, level, desc, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{bac}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 600 }}>{level}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            ※ 윤창호법(2018년) 이후 기준. 음주운전으로 사망사고 발생 시 <strong style={{ color: '#FF6B6B' }}>무기징역까지 가능</strong>합니다.
          </p>
        </div>

        {/* ── 3. 음주량별 BAC 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            음주량별 BAC 예시
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
            70kg 남성, 식사 후 기준. 개인차 있음 — 참고용
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>음주량</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>알코올(g)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>최고 BAC</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>0.03 해소</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['소주 1잔 (50ml)',      '약 6.3g',   '약 0.013%', '즉시 이하',     '#3EFF9B'],
                  ['소주 반병 (180ml)',    '약 22.7g',  '약 0.048%', '약 1.2시간',    '#FFD700'],
                  ['맥주 500cc 2잔',       '약 28.4g',  '약 0.060%', '약 2.0시간',    '#FF8C3E'],
                  ['소주 1병 (360ml)',     '약 45.5g',  '약 0.095%', '약 4.3시간',    '#FF6B6B'],
                  ['소주 2병 (720ml)',     '약 91.0g',  '약 0.191%', '약 10.7시간',   '#FF3E3E'],
                ].map(([drink, alc, bac, clear, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{drink}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{alc}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{bac}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{clear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 알코올 분해 영향 요인 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧬 알코올 분해에 영향을 주는 요인
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { icon: '⚖️', title: '체중',       desc: '체중이 클수록 체내 수분량이 많아 BAC가 희석됩니다.' },
              { icon: '🚻', title: '성별',       desc: '여성은 체수분 비율이 남성보다 낮아 동일 음주량에도 BAC가 높게 나옵니다.' },
              { icon: '🍽️', title: '공복 여부',  desc: '공복 시 알코올 흡수가 최대 20% 빨라져 BAC가 더 높고 빠르게 상승합니다.' },
              { icon: '😴', title: '피로·수면 부족', desc: '간 기능이 저하되어 알코올 분해 속도가 느려집니다.' },
              { icon: '👵', title: '연령',       desc: '노화에 따라 알코올 분해 효소(ALDH·ADH) 활성이 감소합니다.' },
              { icon: '💊', title: '약물 복용',  desc: '일부 약물이 알코올 분해 효소를 방해하거나 부작용을 증폭시킵니다.' },
              { icon: '🫧', title: '탄산 음료 혼합', desc: '탄산이 위 배출을 촉진해 알코올 흡수 속도가 증가할 수 있습니다.' },
              { icon: '🧬', title: '유전적 체질', desc: 'ALDH2 유전자 변이(아시아인 약 40%)는 알코올 분해를 저하시킵니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '18px', marginBottom: '6px' }}>{item.icon}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
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
                q: 'Widmark 공식은 얼마나 정확한가요?',
                a: 'Widmark 공식은 1930년대 스웨덴의 Erik Widmark가 개발한 표준 법의학 공식으로, 수사기관과 법원에서도 사용됩니다. 다만 개인의 신진대사율, 음식 섭취, 간 기능 등에 따라 ±20~30%의 오차가 발생할 수 있어 참고용으로만 활용해야 합니다. 실제 음주 측정기 결과와는 다를 수 있습니다.',
              },
              {
                q: '커피나 물을 마시면 술이 빨리 깨나요?',
                a: '아니요. 커피(카페인)는 각성 효과로 술에 덜 취한 것처럼 느껴지게 할 수 있지만 BAC 자체는 변하지 않습니다. 물도 BAC를 직접적으로 낮추지 않으나 탈수 예방에 도움됩니다. 알코올 분해는 간에서 이루어지며, 시간이 유일한 해결책입니다.',
              },
              {
                q: '음주 후 잠을 자면 더 빨리 깨나요?',
                a: '수면 자체가 알코올 분해를 빠르게 하지는 않습니다. 시간당 0.015 g/dL 감소율은 수면 중에도 동일하게 적용됩니다. 다만 수면 후에도 BAC가 여전히 높을 수 있으며, 아침에 운전하기 전 반드시 충분한 시간이 경과했는지 확인해야 합니다. 전날 과음한 경우 숙취 운전으로 단속되는 사례가 매우 많습니다.',
              },
              {
                q: "'숙취'가 없으면 술이 다 깬 건가요?",
                a: '아닙니다. 숙취 증상(두통, 구역질, 피로감)과 BAC는 별개입니다. 숙취가 없어도 혈중알코올이 단속 기준치 이상 남아있을 수 있습니다. 특히 대량 음주 후 다음 날 아침에는 여전히 단속 기준(0.03%)을 초과하는 경우가 많으므로, 반드시 시간 경과를 확인하고 불확실하면 대중교통을 이용하세요.',
              },
              {
                q: '음주 측정 거부 시 처벌은?',
                a: '음주 측정 거부는 그 자체로 형사처벌 대상입니다. 면허 취소(5년 결격)와 1~5년 징역 또는 500만~2000만원 벌금이 부과될 수 있습니다. 측정 거부는 사실상 BAC 0.2% 이상 음주와 동일한 처벌을 받으며, "측정하지 않으면 불리하지 않다"는 생각은 잘못된 통념입니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 안전 귀가 ── */}
        <div style={{ background: 'rgba(62,200,255,0.07)', border: '1px solid rgba(62,200,255,0.3)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#3EC8FF', marginBottom: '12px' }}>
            🚕 음주 후 운전은 절대 안 됩니다
          </p>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
            <li><strong style={{ color: 'var(--text)' }}>카카오 T 대리 · 티맵 대리</strong> 앱으로 즉시 호출</li>
            <li><strong style={{ color: 'var(--text)' }}>지정운전 서비스</strong> · 지역 대리운전 업체 이용</li>
            <li><strong style={{ color: 'var(--text)' }}>택시 · 지하철 · 버스</strong> 등 대중교통 이용</li>
            <li><strong style={{ color: 'var(--text)' }}>동행자 중 비음주자</strong>에게 운전 부탁</li>
          </ul>
          <p style={{ fontSize: '13px', color: '#3EC8FF', lineHeight: 1.7, fontWeight: 600 }}>
            💡 가장 안전한 방법은 <strong>술자리 시작 전에 미리 대리운전을 예약</strong>하거나 아예 차를 두고 가는 것입니다.
          </p>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/alcohol',  icon: '🍺', name: '알코올 도수 계산기', desc: '혼합 음료 도수·표준 음주량' },
              { href: '/tools/life/dutch',    icon: '🍻', name: '더치페이 계산기',   desc: '술자리 N빵 정산' },
              { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',     desc: '금주 시작일 관리' },
              { href: '/tools/health/bmi',    icon: '⚖️', name: 'BMI 계산기',       desc: '체질량지수·비만도 확인' },
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
