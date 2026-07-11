import Link from 'next/link'
import Hba1cClient from './Hba1cClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/health/hba1c',
  title: '당화혈색소 평균혈당 변환기 — HbA1c ↔ eAG',
  description: '건강검진 당화혈색소(HbA1c %)를 추정 평균혈당(eAG, mg/dL·mmol/L)으로 양방향 변환. 정상·당뇨 전단계·당뇨 진단 구간과 환산표까지.',
  keywords: [
    '당화혈색소 평균혈당 변환', '당화혈색소 6.0 혈당', 'eAG 계산', '당화혈색소 정상수치',
    '건강검진 당화혈색소', '당뇨 전단계 수치', 'HbA1c 혈당', '당화혈색소 환산표',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '당화혈색소(HbA1c)가 뭔가요?',
    a: '적혈구의 혈색소(헤모글로빈)에 <strong>포도당이 얼마나 붙어 있는지</strong>를 %로 나타낸 값입니다. 적혈구 수명이 약 2~3개월이라, 당화혈색소는 <strong>최근 2~3개월 평균 혈당</strong>을 반영합니다. 그날 컨디션·식사에 좌우되는 자가혈당과 달리 장기 혈당 관리 상태를 보여줘서, 당뇨 진단·관리의 핵심 지표로 쓰입니다.',
  },
  {
    q: '평균혈당(eAG)으로 어떻게 바꾸나요?',
    a: '국제 공인 회귀식 <strong>eAG(mg/dL) = 28.7 × HbA1c − 46.7</strong>을 씁니다(ADAG 연구). 예를 들어 HbA1c 6.0%는 <strong>eAG 약 126mg/dL</strong>, 7.0%는 약 154mg/dL입니다. 이 값은 자가혈당 측정기에서 보는 mg/dL 단위와 같은 스케일이라, "내 당화혈색소가 실제 혈당으로 대략 얼마인지" 직관적으로 이해하는 데 도움이 됩니다.',
  },
  {
    q: '당화혈색소 정상 수치는 얼마인가요?',
    a: '대한당뇨병학회·ADA 기준으로 <strong>5.7% 미만이 정상</strong>, <strong>5.7~6.4%는 당뇨 전단계</strong>, <strong>6.5% 이상이면 당뇨병 범위</strong>입니다. 다만 당화혈색소 하나만으로 진단하지 않고, 공복혈당·경구당부하검사 등과 함께 의료진이 종합 판단합니다. 이 계산기의 구간 표시는 참고용이며 진단이 아닙니다.',
  },
  {
    q: '당뇨 관리 목표는 몇 %인가요?',
    a: '일반적으로 당뇨 환자의 목표는 <strong>당화혈색소 6.5% 미만</strong>(대한당뇨병학회)으로 제시되지만, <strong>개인별로 다릅니다.</strong> 젊고 합병증이 없으면 더 엄격하게, 고령이거나 저혈당 위험이 크면 7.0~8.0%로 완화하기도 합니다. 목표치는 반드시 담당 의료진과 상의해 개인에 맞게 정해야 합니다.',
  },
  {
    q: '당화혈색소가 실제와 다를 수 있나요?',
    a: '네. 당화혈색소는 적혈구·혈색소 상태의 영향을 받습니다. <strong>빈혈, 최근 수혈·출혈, 임신, 특정 혈색소 이상(변이 혈색소), 만성 신장·간질환</strong> 등이 있으면 실제 평균 혈당과 차이가 날 수 있습니다. 이런 경우 자가혈당 측정이나 다른 지표(당화알부민 등)를 함께 참고하며, 해석은 의료진과 함께 하는 것이 안전합니다.',
  },
  {
    q: 'mmol/L은 뭔가요?',
    a: '혈당 단위로, 한국·미국은 <strong>mg/dL</strong>을, 유럽·영국·호주 등은 <strong>mmol/L</strong>을 주로 씁니다. 변환은 <strong>mmol/L = mg/dL ÷ 18</strong>입니다. 예를 들어 126mg/dL는 약 7.0mmol/L입니다. 해외 자료나 해외 검진 결과를 볼 때 이 계산기의 두 단위를 모두 확인하면 편합니다.',
  },
]

const RELATED = [
  { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '비만도·정상 체중' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 계산기', desc: '목표까지 기간' },
  { href: '/tools/cooking/nuts', icon: '🥜', name: '견과류 섭취량 계산기', desc: '하루 적정량' },
  { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 계산기', desc: '음주 후 BAC' },
  { href: '/tools/health/caffeine', icon: '☕', name: '카페인 잔존량 트래커', desc: '체내 카페인' },
]

export default function Hba1cPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        건강·웰빙
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />당화혈색소 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        건강검진 <strong style={{ color: 'var(--text)' }}>당화혈색소(HbA1c)를 추정 평균혈당(eAG)</strong>으로 양방향 변환 + 진단 구간·환산표.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="대한당뇨병학회 진료지침·ADAG(ADA/NGSP) 회귀식 기준"
        sources={[
          { label: '대한당뇨병학회', href: 'https://www.diabetes.or.kr' },
        ]}
      />

      <Hba1cClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 변환식 */}
        <section>
          <h2 style={sectionTitle}>변환 공식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>eAG (mg/dL)</span> = 28.7 × HbA1c − 46.7</div>
            <div><span style={{ color: 'var(--muted)' }}>eAG (mmol/L)</span> = mg/dL ÷ 18</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>예: HbA1c 6.0% → eAG 126mg/dL (7.0mmol/L)</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ ADAG(A1c-Derived Average Glucose) 연구의 공인 회귀식입니다. eAG는 2~3개월 평균 혈당의 <strong style={{ color: 'var(--text)' }}>추정치</strong>로, 자가혈당 측정값과는 다를 수 있습니다.
          </p>
        </section>

        {/* 2. 진단 구간 표 */}
        <section>
          <h2 style={sectionTitle}>당뇨 진단 구간</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', 'HbA1c', '추정 평균혈당', '공복혈당(참고)'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['정상', '< 5.7%', '< 117mg/dL', '< 100mg/dL', 'var(--success)'],
                  ['당뇨 전단계', '5.7 ~ 6.4%', '117 ~ 137', '100 ~ 125', 'var(--warning)'],
                  ['당뇨병', '≥ 6.5%', '≥ 140mg/dL', '≥ 126mg/dL', 'var(--danger)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r[4], fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 대한당뇨병학회·ADA 기준. 당화혈색소 단독이 아니라 공복혈당·경구당부하검사 등과 함께 의료진이 진단합니다.
          </p>
        </section>

        {/* 3. 관리 팁 */}
        <section>
          <h2 style={sectionTitle}>당화혈색소 낮추는 생활 습관</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '식후 혈당 관리', d: '정제 탄수화물·단순당 줄이고, 채소·단백질 먼저 먹기. 식후 가벼운 걷기.' },
              { t: '규칙적 유산소', d: '주 150분 이상 걷기·자전거 등이 인슐린 감수성을 개선합니다.' },
              { t: '체중 관리', d: '과체중이면 5~7% 감량만으로도 혈당 수치가 눈에 띄게 좋아집니다.' },
              { t: '꾸준한 추적', d: '3~6개월마다 당화혈색소를 재서 추세를 확인하세요.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>✅ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 일반적인 생활 정보이며, 약물·인슐린 조절은 반드시 의료진과 상의하세요.
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
