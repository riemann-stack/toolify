import type { Metadata } from 'next'
import BmiClient from './BmiClient'

export const metadata: Metadata = {
  title: 'BMI 계산기 2026 — 체질량지수 비만도 계산 | Youtil',
  description: '키와 체중을 입력해 BMI(체질량지수)를 계산합니다. WHO 기준 및 대한비만학회 기준 비만도 판정, 정상 체중 범위 안내.',
  keywords: ['BMI계산기', '체질량지수', '비만도계산기', 'BMI비만', '체중계산기', 'BMI정상범위'],
}

export default function BmiPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚖️ BMI 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        키와 체중으로 체질량지수(BMI)를 계산하고 비만도를 확인합니다.
      </p>

      <BmiClient />

      {/* SEO 콘텐츠 */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>BMI 기준표 — WHO vs 대한비만학회</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BMI(Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값입니다. 한국인을 포함한 아시아인은 서양인보다 같은 BMI에서 체지방률이 높아 대한비만학회에서는 별도 기준을 적용합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>분류</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>WHO 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>대한비만학회 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>건강 위험도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['저체중',    '18.5 미만',   '18.5 미만',   '낮음 (영양불량 위험)', '#3EC8FF'],
                  ['정상',      '18.5 ~ 24.9', '18.5 ~ 22.9', '보통',                '#3EFF9B'],
                  ['과체중',    '25.0 ~ 29.9', '23.0 ~ 24.9', '약간 높음',            '#C8FF3E'],
                  ['비만 1단계', '25.0 ~ 29.9', '25.0 ~ 29.9', '높음',                '#FF8C3E'],
                  ['비만 2단계', '30.0 이상',   '30.0 이상',   '매우 높음',            '#FF3E3E'],
                ].map(([label, who, korea, risk, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{who}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{korea}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>키별 정상 체중 범위 (대한비만학회 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>키</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>정상 체중 범위</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>과체중 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>비만 기준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['155cm', '44.4 ~ 55.0kg', '55.1 ~ 60.1kg', '60.2kg 이상'],
                  ['160cm', '47.4 ~ 58.6kg', '58.7 ~ 64.0kg', '64.1kg 이상'],
                  ['165cm', '50.3 ~ 62.3kg', '62.4 ~ 68.1kg', '68.2kg 이상'],
                  ['170cm', '53.5 ~ 66.2kg', '66.3 ~ 72.3kg', '72.4kg 이상'],
                  ['175cm', '56.7 ~ 70.2kg', '70.3 ~ 76.6kg', '76.7kg 이상'],
                  ['180cm', '59.9 ~ 74.2kg', '74.3 ~ 81.0kg', '81.1kg 이상'],
                ].map(([height, normal, over, obese], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{height}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EFF9B' }}>{normal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#C8FF3E' }}>{over}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF6B6B' }}>{obese}</td>
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
              {
                q: 'BMI가 정상인데 왜 배가 나올까요?',
                a: 'BMI는 체지방의 분포를 반영하지 않습니다. 근육량이 적고 복부에 지방이 집중된 경우 BMI가 정상이어도 복부비만일 수 있습니다. 허리둘레가 남성 90cm, 여성 85cm 이상이면 복부비만으로 판정합니다.',
              },
              {
                q: '운동선수나 근육량이 많은 사람의 BMI는 어떻게 해석하나요?',
                a: 'BMI는 근육과 지방을 구분하지 않아 근육량이 많은 운동선수는 BMI가 높게 나와도 실제로는 건강할 수 있습니다. 정확한 체성분 분석을 원한다면 인바디 검사나 체지방률 측정을 권장합니다.',
              },
              {
                q: 'BMI를 낮추려면 얼마나 감량해야 하나요?',
                a: 'BMI 1 단위를 낮추려면 키에 따라 다르지만, 170cm 기준으로 약 2.9kg 감량이 필요합니다. 의학적으로 체중의 5~10%를 감량하면 혈압, 혈당, 콜레스테롤 수치 개선에 효과적이라고 알려져 있습니다.',
              },
              {
                q: 'BMI 계산기는 어린이나 노인에게도 적용되나요?',
                a: 'BMI는 성인(18세 이상) 기준입니다. 어린이와 청소년은 나이와 성별을 고려한 백분위수 기준을 사용하고, 65세 이상 노인은 근감소증 위험으로 인해 BMI 해석 기준이 다를 수 있습니다.',
              },
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