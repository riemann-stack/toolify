import Link from 'next/link'
import ChildHeightClient from './ChildHeightClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/health/child-height',
  title: '자녀 예상 키 계산기 — 부모 키로 아들·딸 성인 키 예측',
  description:
    '아버지·어머니 키만 입력하면 중간부모키(MPH) 공식으로 자녀의 예상 성인 키와 ±8.5cm 범위를 계산합니다. 통계적 추정이며 의학 진단이 아닙니다.',
  keywords: [
    '자녀 예상 키 계산',
    '아들 예상키 공식',
    '딸 예상키 계산',
    '중간부모키',
    '부모 키로 자녀 키 예측',
    '예상 키 계산기',
    '아이 키 계산',
    'MPH 키 예측',
  ],
})

const FAQ_LD = [
  {
    q: '부모 키로 자녀 예상 키를 어떻게 계산하나요?',
    a: '가장 널리 쓰이는 방법은 <strong>중간부모키(MPH)</strong> 공식입니다. 아버지와 어머니 키를 더한 뒤 성별 보정값 <strong>13cm</strong>를 남아는 더하고 여아는 뺀 다음, 2로 나눕니다. 예를 들어 아버지 178cm·어머니 162cm라면 아들은 (178+162+13)÷2 = <strong>176.5cm</strong>, 딸은 (178+162−13)÷2 = <strong>163.5cm</strong>가 예상 중앙값입니다. 이 계산기는 키 두 개만 넣으면 자동으로 결과와 ±8.5cm 범위를 보여줍니다.',
  },
  {
    q: '아들 예상 키 공식이 뭔가요?',
    a: '아들(남아)의 예상 성인 키는 <strong>(아버지 키 + 어머니 키 + 13) ÷ 2</strong>입니다. 어머니 키에 13cm를 더하는 것은 성인 남성이 여성보다 평균적으로 약 13cm 크다는 통계 보정 때문입니다. 예: 아버지 175cm·어머니 162cm → (175+162+13)÷2 = <strong>175.0cm</strong>. 이 값은 중앙값이고 실제로는 위아래로 ±8.5cm 정도 범위를 가질 수 있습니다.',
  },
  {
    q: '딸 예상 키 계산법 알려주세요.',
    a: '딸(여아)의 예상 성인 키는 <strong>(아버지 키 + 어머니 키 − 13) ÷ 2</strong>입니다. 아버지 키에서 13cm를 빼는 것은 같은 평균 신장차 보정을 반대로 적용하기 때문입니다. 예: 아버지 178cm·어머니 162cm → (178+162−13)÷2 = <strong>163.5cm</strong>. 마찬가지로 ±8.5cm 범위로 해석합니다.',
  },
  {
    q: '중간부모키 오차 범위가 얼마나 되나요?',
    a: '일반적으로 예측 중앙값 기준 <strong>±8.5cm</strong>(약 ±2 표준편차)로 봅니다. 이 범위 안에 들어올 확률이 대략 95%(3~97 백분위)라는 뜻이지, 그 안이 보장된다는 뜻은 아닙니다. 예상 중앙값이 176.5cm라면 실제 성인 키는 대략 <strong>168 ~ 185cm</strong> 사이에서 나타날 수 있습니다. 영양·수면·사춘기 시기 등에 따라 이 범위를 벗어나는 경우도 있습니다.',
  },
  {
    q: '두 살 때 키 두 배가 진짜 어른 키인가요?',
    a: '오래 알려진 <strong>두배법</strong>(남아 만 2세, 여아 만 18개월 키 × 2)은 어림짐작용일 뿐 정확도가 낮습니다. 성장 속도는 사춘기 전후로 크게 달라지고 개인차가 커서, 같은 두 살 키라도 성인 키가 크게 갈립니다. 부모 키를 함께 고려하는 중간부모키(MPH)가 더 안정적인 추정이며, 정확한 예측은 병원의 <strong>뼈나이(골연령) 검사</strong>가 필요합니다.',
  },
  {
    q: '부모가 작으면 아이도 무조건 작나요?',
    a: '아닙니다. 키는 유전의 영향이 크지만(흔히 약 60~80%로 인용) <strong>유전만으로 결정되지 않습니다.</strong> 부모가 작아도 충분한 영양·수면·운동과 사춘기 시기에 따라 부모보다 큰 경우가 흔합니다. 반대로 부모가 커도 만성질환·영양 불균형이 있으면 예상보다 작을 수 있습니다. MPH는 부모 키의 평균 경향을 보여줄 뿐, 개별 결과를 단정하지 않습니다.',
  },
  {
    q: '예상 키보다 더 크려면 어떻게 해야 하나요?',
    a: '키는 유전이 큰 비중을 차지하지만 <strong>후천적 요인</strong>도 무시할 수 없습니다. ① 충분한 <strong>수면</strong> — 성장호르몬은 깊은 수면 중 가장 많이 분비됩니다. ② 균형 잡힌 <strong>영양</strong> — 단백질·칼슘·비타민D를 거르지 않기. ③ 규칙적인 <strong>운동</strong> — 점프·스트레칭 등 자극이 되는 활동. ④ 과도한 체중 증가·이른 사춘기를 피하기. 다만 이런 노력으로 바꿀 수 있는 폭은 제한적이며, 키에 큰 변화가 필요하면 성장클리닉 상담을 권합니다.',
  },
  {
    q: '예상 키가 작게 나오면 병원에 가봐야 하나요?',
    a: '예상 중앙값 자체가 낮다고 곧 문제는 아닙니다. 다만 <strong>또래 평균보다 키가 많이 작거나(하위 3% 미만), 1년에 4cm 미만으로 자라거나, 성장 곡선에서 갑자기 떨어지는 경우</strong>에는 소아청소년과·성장클리닉 진료를 권합니다. 병원에서는 <strong>뼈나이(골연령) X선</strong>, 성장호르몬 검사 등으로 저성장 여부를 평가합니다. 이 계산기는 통계적 추정일 뿐 진단 도구가 아니므로, 걱정된다면 전문의 상담이 가장 정확합니다.',
  },
]

const h2Style = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
} as const

const pMuted = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.85,
  marginBottom: '12px',
} as const

export default function ChildHeightPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />자녀 예상 키 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        아버지·어머니 키만 입력하면 <strong style={{ color: 'var(--text)' }}>중간부모키(MPH) 공식</strong>으로 아들·딸의 예상 성인 키와 ±8.5cm 범위를 계산합니다. 통계적 추정이며 의학 진단이 아닙니다.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="Tanner 중간부모키(MPH) 공식 · 한국 성인 평균 키는 참고치"
        sources={[
          { label: 'Tanner MPH (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/5440182/' },
          { label: '질병관리청 소아청소년 성장도표', href: 'https://knhanes.kdca.go.kr/' },
        ]}
      />

      <Disclaimer
        variant="medical"
        sources={[
          { label: 'Tanner et al., 중간부모키 (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/5440182/' },
          { label: '질병관리청 소아청소년 성장도표', href: 'https://knhanes.kdca.go.kr/' },
        ]}
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
        ]}
      >
        이 계산기는 <strong>중간부모키(MPH) 공식에 기반한 통계적 추정</strong>이며 의학적 진단이 아닙니다. 실제 성인 키는 유전 외에도 영양·수면·운동·사춘기 시기·성장판·질환 등 다양한 변수에 크게 좌우됩니다. 예측 범위(±8.5cm)는 평균적인 분포일 뿐 개별 보장이 아니며, <strong>저성장이 의심되거나 성장이 걱정되면 반드시 소아청소년과·성장 전문의의 뼈나이(골연령) 검사 등 정식 진료</strong>를 받으세요. 한국 성인 평균 키는 참고치이며 백분위·우열의 근거가 아닙니다.
      </Disclaimer>

      <ChildHeightClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. MPH란 + 13cm 보정 ── */}
        <div>
          <h2 style={h2Style}>중간부모키(MPH)란? — 13cm 보정의 의미</h2>
          <p style={pMuted}>
            중간부모키(Mid-Parental Height, MPH)는 부모의 키 평균에서 자녀의 성인 키를 추정하는 방법으로, 1970년 Tanner가 정리한 공식이 표준으로 쓰입니다. 핵심은 <strong style={{ color: 'var(--text)' }}>부모 두 사람 키의 평균</strong>에 성별 차이를 보정하는 것입니다.
          </p>
          <p style={pMuted}>
            보정값 <strong style={{ color: 'var(--text)' }}>13cm</strong>는 성인 남성이 성인 여성보다 평균적으로 약 13cm 크다는 통계에서 나옵니다. 자녀가 아들이면 어머니 키를 13cm 끌어올려(부모를 &lsquo;남성 기준&rsquo;으로 맞춰) 평균을 내고, 딸이면 아버지 키를 13cm 내려(부모를 &lsquo;여성 기준&rsquo;으로 맞춰) 평균을 냅니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
              아들 = (아버지 + 어머니 + 13) ÷ 2 &nbsp;·&nbsp; 딸 = (아버지 + 어머니 − 13) ÷ 2
            </p>
          </div>
        </div>

        {/* ── 2. 남아·여아 공식 + 계산 예시 ── */}
        <div>
          <h2 style={h2Style}>아들·딸 예상키 공식과 계산 예시</h2>
          <p style={pMuted}>
            아버지 178cm·어머니 162cm를 예로 들어 보겠습니다. 부모 키 합은 <strong style={{ color: 'var(--text)' }}>340cm</strong>입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>👦 아들</p>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
                (178 + 162 + 13) ÷ 2 = 353 ÷ 2 = <strong style={{ color: 'var(--accent-ink)' }}>176.5cm</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>👧 딸</p>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
                (178 + 162 − 13) ÷ 2 = 327 ÷ 2 = <strong style={{ color: 'var(--accent-ink)' }}>163.5cm</strong>
              </p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            같은 부모라도 아들과 딸의 예상 중앙값은 정확히 <strong style={{ color: 'var(--text)' }}>13cm 차이</strong>가 납니다(176.5 − 163.5 = 13). 보정값을 한쪽은 더하고 다른 쪽은 빼기 때문입니다.
          </p>
        </div>

        {/* ── 3. ±8.5cm 범위는 왜 ── */}
        <div>
          <h2 style={h2Style}>예측 범위(±8.5cm)는 왜 생기나 — 유전 외 변수</h2>
          <p style={pMuted}>
            MPH가 알려주는 값은 <strong style={{ color: 'var(--text)' }}>중앙값(가장 가능성 높은 한 점)</strong>일 뿐, 실제 키는 그 주변에 흩어져 나타납니다. 일반적으로 중앙값 ±8.5cm(약 ±2 표준편차) 안에 들어올 확률을 95% 정도로 봅니다. 즉 예상 176.5cm라면 실제는 대략 <strong style={{ color: 'var(--text)' }}>168 ~ 185cm</strong> 사이가 흔합니다.
          </p>
          <p style={pMuted}>
            이 폭이 생기는 이유는 키가 부모 두 사람의 평균으로만 결정되지 않기 때문입니다. 조부모 등 더 윗세대 유전자, 영양 상태, 수면, 운동량, <strong style={{ color: 'var(--text)' }}>사춘기가 빠른지 늦은지</strong>, 만성질환 유무 등이 모두 영향을 줍니다. 특히 사춘기 시작 시점은 최종 키를 크게 흔드는 변수입니다 — 일찍 시작하면 성장판이 일찍 닫혀 예상보다 작을 수 있습니다.
          </p>
        </div>

        {/* ── 4. 다른 예측법과의 차이 ── */}
        <div>
          <h2 style={h2Style}>두배법·뼈나이 등 다른 예측법과의 차이</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방법', '입력', '정확도·특징'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '중간부모키(MPH)', i: '부모 키 2개', d: '간단·유전 경향 반영. 중앙값 ±8.5cm. 후천 변수는 미반영' },
                  { m: '두배법', i: '만 2세(남)·18개월(여) 키', d: '암산용 어림법. 개인차 커 정확도 낮음' },
                  { m: '뼈나이(골연령)', i: '손목 X선 + 현재 키', d: '병원 검사. 성장판 상태 반영해 가장 정밀' },
                  { m: '성장도표 백분위 추적', i: '연령별 키 기록', d: '곡선 추세로 이상 조기 발견에 유용' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{r.m}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{r.i}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            이 계산기는 MPH만 사용합니다. 두배법은 별도 참고용으로 도구 안에 안내만 두었고 계산에는 넣지 않았습니다. 정밀한 예측이 필요하면 <strong style={{ color: 'var(--text)' }}>뼈나이 검사</strong>가 기준이 됩니다.
          </p>
        </div>

        {/* ── 5. 후천적 요인 ── */}
        <div>
          <h2 style={h2Style}>키 성장에 영향을 주는 후천적 요인</h2>
          <p style={pMuted}>
            키는 유전이 큰 비중(흔히 60~80%로 인용)을 차지하지만, 나머지는 후천적 환경이 좌우합니다. 다음 세 가지가 핵심입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '😴', t: '수면', d: '성장호르몬은 깊은 잠(특히 밤 10시~새벽 2시 깊은 수면 구간)에 가장 많이 분비됩니다. 초등학생 9~11시간, 청소년 8~10시간 수면이 권장됩니다.' },
              { icon: '🥗', t: '영양', d: '근육·뼈를 만드는 단백질, 뼈 성장의 칼슘과 흡수를 돕는 비타민D가 중요합니다. 다만 과도한 열량으로 비만이 되면 사춘기가 빨라져 오히려 최종 키에 불리할 수 있습니다.' },
              { icon: '🏃', t: '운동', d: '점프·달리기·스트레칭처럼 뼈에 적당한 자극을 주는 활동이 성장판을 돕습니다. 반대로 지나친 고강도 훈련·과도한 체중 부하는 역효과일 수 있습니다.' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{r.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{r.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{r.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            후천적 노력으로 바꿀 수 있는 폭은 제한적입니다. 다만 수면 부족·영양 불균형처럼 성장을 깎아먹는 요인을 줄이는 것은 분명한 도움이 됩니다.
          </p>
        </div>

        {/* ── 6. 작게 나오면 병원 안내 ── */}
        <div>
          <h2 style={h2Style}>예상키가 작게 나오면 — 병원 성장 검사 안내</h2>
          <p style={pMuted}>
            예상 중앙값이 낮다는 것만으로 문제가 있는 것은 아닙니다. 부모가 작으면 자녀의 예상 중앙값도 자연히 낮게 나오는 것이 정상입니다. 다만 아래 같은 <strong style={{ color: 'var(--text)' }}>저성장 신호</strong>가 보이면 소아청소년과·성장클리닉 상담을 권합니다.
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
            <li>· 또래 같은 성별·나이 평균보다 키가 많이 작음(하위 3% 미만, 성장도표 기준)</li>
            <li>· 1년에 키가 4cm 미만으로 자람(사춘기 전 기준)</li>
            <li>· 성장 곡선의 백분위가 갑자기 떨어짐</li>
            <li>· 또래보다 사춘기가 지나치게 빠르거나 늦음</li>
          </ul>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            병원에서는 손목 <strong style={{ color: 'var(--text)' }}>X선으로 뼈나이(골연령)</strong>를 측정해 성장판이 얼마나 남았는지 보고, 필요하면 성장호르몬·갑상선 등 검사를 합니다. 뼈나이가 실제 나이보다 어리면 더 자랄 여지가 있다는 뜻이기도 합니다. 정확한 평가와 개입 시기는 전문의 진료로만 판단할 수 있습니다.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={h2Style}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '키·체중으로 비만도와 정상 체중 범위' },
              { href: '/tools/date/age', icon: '🎂', name: '만 나이 계산기', desc: '아이 나이·생일 기준 정확한 만 나이' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
                }}
              >
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
