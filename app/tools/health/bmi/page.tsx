import type { Metadata } from 'next'
import Link from 'next/link'
import BmiClient from './BmiClient'

export const metadata: Metadata = {
  title: 'BMI 계산기 2026 — 체질량지수·비만도·러닝 체중 관리 | Youtil',
  description: '키와 체중을 입력해 BMI(체질량지수)를 계산합니다. WHO·대한비만학회 기준 비만도 판정, 키별 정상 체중 범위, 러너 전용 체중 관리 팁 제공.',
  keywords: ['BMI계산기', '체질량지수', '비만도계산기', 'BMI비만', '체중계산기', 'BMI정상범위', '러닝체중관리'],
}

export default function BmiPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·피트니스</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚖️ BMI 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        키와 체중을 입력하면 BMI 체질량지수와 비만도를 즉시 계산합니다.
      </p>

      <BmiClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BMI 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            BMI 체질량지수 산출 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BMI(Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값입니다.
            1832년 벨기에 통계학자 아돌프 케틀레가 개발한 지표로, 현재 WHO와 전 세계 의료 기관에서
            비만도 판정의 표준 지표로 사용됩니다.
            한국인을 포함한 아시아인은 서양인보다 같은 BMI에서 체지방률이 높아
            대한비만학회에서는 별도 기준을 적용합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '20px 22px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>BMI 계산 공식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              BMI = 체중(kg) ÷ 키(m)²
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: 키 170cm, 체중 65kg → BMI = 65 ÷ (1.7 × 1.7) = <strong style={{ color: 'var(--accent)' }}>22.5</strong> (정상)
            </p>
          </div>
        </div>

        {/* ── 2. WHO vs 대한비만학회 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            BMI 기준표 — WHO vs 대한비만학회
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>분류</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>WHO 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>대한비만학회 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>건강 위험도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['저체중',     '18.5 미만',   '18.5 미만',   '낮음 (영양불량 위험)', '#3EC8FF'],
                  ['정상',       '18.5 ~ 24.9', '18.5 ~ 22.9', '보통',                '#3EFF9B'],
                  ['과체중',     '25.0 ~ 29.9', '23.0 ~ 24.9', '약간 높음',           '#C8FF3E'],
                  ['비만 1단계', '25.0 ~ 29.9', '25.0 ~ 29.9', '높음',                '#FF8C3E'],
                  ['비만 2단계', '30.0 이상',   '30.0 이상',   '매우 높음',           '#FF3E3E'],
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

        {/* ── 3. 키별 정상 체중 범위 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            키별 정상 체중 범위 (대한비만학회 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>키</th>
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

        {/* ── 4. 러너 전용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🏃 러닝 효율을 높이는 체중 관리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            마라톤과 같은 지구력 운동에서는 체중과 기록이 밀접하게 연결됩니다.
            단순히 체중을 줄이는 것이 아니라 <strong style={{ color: 'var(--text)' }}>근육량을 유지하면서 체지방률을 조절</strong>하는 것이 기록 향상의 핵심입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { icon: '⚡', color: '#C8FF3E', title: '체중과 러닝 기록의 관계',   content: '스포츠 과학 연구에 따르면 체중 1kg 감량 시 10km 레이스에서 약 2~3분, 마라톤에서 약 8~12분 기록이 향상될 수 있습니다. 단, 이는 근육량을 유지한 상태의 체지방 감량일 때 해당합니다.' },
              { icon: '⚠️', color: '#FF8C3E', title: '무리한 감량의 위험',         content: '마라톤과 같은 지구력 운동에서 낮은 BMI가 유리할 수 있지만, 무리한 체중 감량은 피로 골절, 근육 손실, 면역력 저하 등 부상 위험을 크게 높입니다. 특히 여성 러너의 경우 지나친 저체중은 골밀도 감소와 호르몬 이상을 유발할 수 있습니다.' },
              { icon: '🎯', color: '#3EC8FF', title: '러너에게 권장하는 BMI 범위', content: '엘리트 마라토너의 평균 BMI는 남성 약 18~20, 여성 약 17~19 수준이지만, 일반 러너는 정상 범위(18.5~22.9)를 목표로 하는 것이 건강하고 지속 가능합니다. 자신의 적정 체중을 확인하고 건강한 러닝 라이프를 즐기세요!' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${tip.color}30`, borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tip.color, marginBottom: '6px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.15)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>✅ 러너를 위한 체중 관리 핵심 요약</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                '급격한 체중 감량보다 주당 0.3~0.5kg 이내의 점진적 감량 권장',
                '단백질 섭취를 충분히 유지해 근육량 손실 방지 (체중 1kg당 1.2~1.6g)',
                '훈련 강도가 높은 시기에는 감량보다 컨디션 유지 우선',
                'BMI보다 체지방률(남성 10~15%, 여성 16~22%)이 더 정확한 지표',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 5. FAQ (기존 4개 + 신규 4개) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'BMI가 정상인데 왜 배가 나올까요?',
                a: 'BMI는 체지방의 분포를 반영하지 않습니다. 근육량이 적고 복부에 지방이 집중된 경우 BMI가 정상이어도 복부비만일 수 있습니다. 허리둘레가 남성 90cm, 여성 85cm 이상이면 복부비만으로 판정합니다.' },
              { q: '운동선수나 근육량이 많은 사람의 BMI는 어떻게 해석하나요?',
                a: 'BMI는 근육과 지방을 구분하지 않아 근육량이 많은 운동선수는 BMI가 높게 나와도 실제로는 건강할 수 있습니다. 정확한 체성분 분석을 원한다면 인바디 검사나 체지방률 측정을 권장합니다.' },
              { q: 'BMI를 낮추려면 얼마나 감량해야 하나요?',
                a: 'BMI 1 단위를 낮추려면 키에 따라 다르지만, 170cm 기준으로 약 2.9kg 감량이 필요합니다. 의학적으로 체중의 5~10%를 감량하면 혈압, 혈당, 콜레스테롤 수치 개선에 효과적이라고 알려져 있습니다.' },
              { q: 'BMI 계산기는 어린이나 노인에게도 적용되나요?',
                a: 'BMI는 성인(18세 이상) 기준입니다. 어린이와 청소년은 나이와 성별을 고려한 백분위수 기준을 사용하고, 65세 이상 노인은 근감소증 위험으로 인해 BMI 해석 기준이 다를 수 있습니다.' },
              { q: 'BMI가 정상인데도 비만일 수 있나요?',
                a: 'BMI는 체중과 키만으로 계산하기 때문에 근육량과 체지방률을 구분하지 못합니다. 근육이 많은 운동선수는 BMI가 높아도 실제로는 건강한 체형일 수 있고, 반대로 BMI가 정상이어도 체지방률이 높은 "마른 비만"일 수 있습니다. 정확한 체성분 파악을 위해 체성분 분석(InBody 등)을 함께 활용하는 것이 좋습니다.' },
              { q: '한국 기준과 WHO 기준이 다른 이유는?',
                a: '아시아인은 서양인에 비해 같은 BMI에서 체지방률이 더 높고, 복부 비만 경향이 강해 심혈관 질환 위험이 더 높습니다. 이에 한국 비만학회는 WHO보다 낮은 기준(과체중 23 이상, 비만 25 이상)을 적용하고 있습니다.' },
              { q: '임산부는 BMI를 어떻게 해석해야 하나요?',
                a: '임신 중에는 체중이 자연스럽게 증가하므로 일반 BMI 기준을 그대로 적용하기 어렵습니다. 임신 전 BMI를 기준으로 저체중(18.5 미만)은 12~18kg, 정상(18.5~24.9)은 11~16kg, 과체중(25 이상)은 7~11kg 증가를 권장합니다. 구체적인 목표는 담당 의사와 상담하세요.' },
              { q: 'BMI만으로 건강을 판단해도 될까요?',
                a: 'BMI는 비만도를 빠르게 파악하는 데 유용하지만 완벽한 지표는 아닙니다. 허리둘레(복부비만), 체지방률, 혈압, 혈당, 콜레스테롤 수치 등을 함께 고려해야 종합적인 건강 상태를 평가할 수 있습니다. BMI와 함께 기초대사량(BMR) 계산기도 활용해 보세요.' },
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
              { href: '/tools/health/bmr',       icon: '🔥', name: '기초대사량 계산기',         desc: '내 몸이 하루에 소비하는 기본 칼로리' },
              { href: '/tools/health/pace',       icon: '🏃', name: '러닝 페이스 계산기',       desc: '목표 기록별 적정 페이스 계산' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '칼로리 적자로 목표 달성일 예측' },
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',           desc: '나이에 맞는 건강 관리 계획 수립' },
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