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
    a: '적혈구의 혈색소(헤모글로빈)에 <strong>포도당이 얼마나 붙어 있는지</strong>를 %로 나타낸 값입니다. 적혈구 수명이 평균 약 120일(NGSP)이어서, 당화혈색소는 <strong>최근 2~3개월 평균 혈당</strong>을 반영합니다(질병관리청 국가건강정보포털). 최근 혈당이 더 크게 기여하는 가중평균입니다. 그날 컨디션·식사에 좌우되는 자가혈당과 달리 장기 혈당 관리 상태를 보여줘서, 당뇨 진단·관리의 핵심 지표로 쓰입니다.',
  },
  {
    q: '평균혈당(eAG)으로 어떻게 바꾸나요?',
    a: '국제 공인 회귀식 <strong>eAG(mg/dL) = 28.7 × HbA1c − 46.7</strong>을 씁니다(ADAG 연구). 예를 들어 HbA1c 6.0%는 <strong>eAG 약 126mg/dL</strong>, 7.0%는 약 154mg/dL입니다. 이 값은 자가혈당 측정기에서 보는 mg/dL 단위와 같은 스케일이라, "내 당화혈색소가 실제 혈당으로 대략 얼마인지" 직관적으로 이해하는 데 도움이 됩니다.',
  },
  {
    q: '당화혈색소 정상 수치는 얼마인가요?',
    a: '대한당뇨병학회 2025 진료지침 제9판(표 1-1.1)은 <strong>5.7~6.4%를 당뇨병전단계</strong>, <strong>6.5% 이상을 당뇨병</strong> 기준으로 규정합니다. 따라서 <strong>5.7% 미만은 전단계 기준 아래</strong>로 읽는 것이 정확합니다 — 학회의 &lsquo;정상혈당&rsquo; 정의 자체는 공복혈장포도당 100mg/dL 미만·75g 경구포도당부하 2시간 후 140mg/dL 미만만 규정하고 당화혈색소 항목을 두지 않기 때문입니다. 또 6.5% 이상이 나와도 서로 다른 날 반복검사(또는 같은 날 다른 검사 2종 이상 충족)로 확진하므로, 이 계산기의 구간 표시는 참고용이며 진단이 아닙니다.',
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
        basis="대한당뇨병학회 2025 당뇨병 진료지침 제9판(진단기준·표 4-1.1)·ADAG 회귀식(Nathan 2008)·NGSP 기준"
        sources={[
          { label: '대한당뇨병학회', href: 'https://www.diabetes.or.kr' },
          { label: '질병관리청 국가건강정보포털 — 당뇨병', href: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5305' },
          { label: 'NGSP — HbA1c and eAG', href: 'https://ngsp.org/A1ceAG.asp' },
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

        {/* 2. HbA1c ↔ eAG 환산표 */}
        <section>
          <h2 style={sectionTitle}>당화혈색소 ↔ 평균 혈당(eAG) 환산표</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
            ADAG 회귀식을 4.5~12.0%에 0.5%p 간격으로 적용한 값입니다. 대한당뇨병학회 2025 당뇨병 진료지침 제9판 표 4-1.1(당화혈색소와 평균혈당의 관계)에 실린 8개 행(5%→97, 6%→126, 7%→154, 8%→183, 9%→212, 10%→240, 11%→269, 12%→298mg/dL)과 mg/dL 정수 단위까지 일치합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['HbA1c', 'eAG (mg/dL)', 'eAG (mmol/L)', '구간'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['4.5%', '82', '4.6', '전단계 기준 미만', 'var(--success)'],
                  ['5.0%', '97', '5.4', '전단계 기준 미만', 'var(--success)'],
                  ['5.5%', '111', '6.2', '전단계 기준 미만', 'var(--success)'],
                  ['6.0%', '126', '7.0', '당뇨병전단계', 'var(--warning)'],
                  ['6.5%', '140', '7.8', '당뇨병 범위', 'var(--danger)'],
                  ['7.0%', '154', '8.6', '당뇨병 범위', 'var(--danger)'],
                  ['7.5%', '169', '9.4', '당뇨병 범위', 'var(--danger)'],
                  ['8.0%', '183', '10.2', '당뇨병 범위', 'var(--danger)'],
                  ['8.5%', '197', '11.0', '당뇨병 범위', 'var(--danger)'],
                  ['9.0%', '212', '11.8', '당뇨병 범위', 'var(--danger)'],
                  ['9.5%', '226', '12.6', '당뇨병 범위', 'var(--danger)'],
                  ['10.0%', '240', '13.4', '당뇨병 범위', 'var(--danger)'],
                  ['10.5%', '255', '14.1', '당뇨병 범위', 'var(--danger)'],
                  ['11.0%', '269', '14.9', '당뇨병 범위', 'var(--danger)'],
                  ['11.5%', '283', '15.7', '당뇨병 범위', 'var(--danger)'],
                  ['12.0%', '298', '16.5', '당뇨병 범위', 'var(--danger)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: r[4], fontSize: 12, fontWeight: 600 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 출처: Nathan DM 등, 「Translating the A1C Assay Into Estimated Average Glucose Values」, Diabetes Care 2008;31(8):1473-1478 — 원문 회귀식은 eAG(mg/dL) = 28.7 × A1c − 46.7 (R² = 0.84), mmol/L 직접식은 1.59 × A1c − 2.59입니다. 위 표의 mmol/L은 학회 표 4-1.1과 같은 경로(mg/dL ÷ 18)로 냈기 때문에, 논문의 mmol/L 직접식으로 계산한 값과 일부 행에서 0.1 차이가 납니다(예: 7.0% → 8.6 vs 8.5).
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>같은 수치라도 개인차가 큽니다.</strong> ADAG 연구에서 당화혈색소 8%의 평균 혈당은 183mg/dL이지만 개인별 95% 구간은 147~217mg/dL(8.1~12.1mmol/L)이었습니다. 같은 8%인 사람들 사이에서 실제 평균 혈당이 30mg/dL 이상 벌어질 수 있다는 뜻이라, 표의 eAG는 대표값이지 내 평균 혈당의 확정값이 아닙니다.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
            ※ ADAG는 10개 국제 센터에서 507명(1형당뇨병 268명·2형당뇨병 159명·당뇨병 없는 성인 80명)을 3개월간 추적해 1인당 약 2,700건의 혈당을 측정한 연구지만, 참여자 83%(422명)가 비히스패닉 백인이고 동아시아인은 포함되지 않았습니다. 대한당뇨병학회 지침도 ADAG 연구가 동양인 대상은 아니어서 인종 간 차이가 있을 수 있다고 명시하고 있고, 2026년 7월 현재 한국인 전용 환산식은 공식 지침에 없습니다.
          </p>
        </section>

        {/* 3. 2~3개월 반영 원리 */}
        <section>
          <h2 style={sectionTitle}>왜 2~3개월 평균이 반영되나</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            포도당이 적혈구 속 혈색소에 붙으면 그 적혈구가 수명을 마칠 때까지 남습니다. 적혈구 수명은 평균 약 120일(NGSP)이라, 당화혈색소는 검사 직전 약 120일간의 혈당 노출을 누적해 보여줍니다. 대한당뇨병학회 지침은 이를 &ldquo;적혈구 수명기간인 3개월 내외의 혈당 평균치를 반영한다&rdquo;고 설명하고, 질병관리청 국가건강정보포털도 당화혈색소가 최근 2~3개월의 평균 혈당을 반영한다고 안내합니다.
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
            단, 단순 평균이 아니라 <strong style={{ color: 'var(--text)' }}>최근 혈당이 더 크게 기여하는 가중평균</strong>입니다(NGSP·ADA 2026). 그래서 검사 직전 몇 주의 관리가 수치에 비교적 빠르게 나타나고, NGSP도 임상적으로 의미 있는 변화를 확인하는 데 120일이 다 걸리지는 않는다고 설명합니다. 반대로 앞선 두 달의 혈당이 함께 섞여 나오므로, 검진 직전 며칠만 조심하는 방식으로 수치를 되돌리기는 어렵습니다.
          </p>
        </section>

        {/* 4. 진단 구간 표 */}
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
            ※ 대한당뇨병학회 2025 진료지침 제9판 표 1-1.1·ADA 2026 기준. 다만 학회의 &lsquo;정상혈당&rsquo; 정의는 8시간 이상 금식 후 혈장포도당 100mg/dL 미만·75g 경구포도당부하 2시간 후 140mg/dL 미만만 규정하고 당화혈색소 항목이 없으므로, 위 표의 &lsquo;정상&rsquo;은 <strong style={{ color: 'var(--text)' }}>당뇨병전단계 기준(5.7%) 미만</strong>이라는 뜻으로 읽어야 정확합니다. 당화혈색소 단독이 아니라 공복혈당·경구당부하검사 등과 함께 의료진이 진단합니다.
          </p>
        </section>

        {/* 5. 검진 결과 구간별 다음 행동 */}
        <section>
          <h2 style={sectionTitle}>검진 결과 구간별 다음 행동</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                t: '5.7% 미만 — 전단계 기준 미만',
                c: 'var(--success)',
                d: '대한당뇨병학회 2025 지침은 당뇨병 선별검사 결과가 정상인 성인에게 매년 재검사를 권고합니다. 선별검사 대상은 위험인자가 있는 19세 이상 모든 성인, 위험인자가 없어도 35세 이상 모든 성인입니다(2023년 제8판에서 40세 → 35세로 하향).',
              },
              {
                t: '5.7 ~ 6.4% — 당뇨병전단계',
                c: 'var(--warning)',
                d: '학회 기준으로 당뇨병전단계(공복혈당장애 100~125mg/dL, 내당능장애 경구포도당부하 2시간 140~199mg/dL와 병렬 기준)입니다. 학회는 이 결과에서 당뇨병이 의심되면 다른 방법의 선별검사를 추가로 시행하도록 권고합니다. 미국당뇨병학회(ADA 2026)는 전단계에서 최소 매년 당뇨병 발생 여부를 추적하라고 권고하며, 한국 지침에는 전단계 재검 주기 규정이 없으므로 정기 재검 간격은 담당 의료진과 상의해 정하세요.',
              },
              {
                t: '6.5% 이상 — 당뇨병 범위',
                c: 'var(--danger)',
                d: '이 수치 하나로 확진되는 것은 아닙니다. 학회 표 1-1.1 각주는 당화혈색소·공복혈장포도당·경구포도당부하 2시간 혈당 중 하나만 기준을 넘으면 서로 다른 날 검사를 반복하되, 같은 날 시행한 검사 중 두 가지 이상을 만족하면 바로 확진할 수 있다고 규정합니다. 자가 판단을 미루고 병원 확진 검사를 받으세요.',
              },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${b.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: b.c, margin: '0 0 6px' }}>{b.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>{b.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 국민건강보험공단 일반건강검진의 1차 공통 혈액검사 항목은 혈색소·공복혈당·AST·ALT·γ-GTP·혈청크레아티닌·e-GFR이며 <strong style={{ color: 'var(--text)' }}>당화혈색소는 1차 항목에 없습니다.</strong> 당화혈색소는 당뇨병 의심자의 2차 확진검사(진찰·공복혈당·당화혈색소)에서 실시하므로, 검진 결과지에 당화혈색소가 보이지 않는 경우가 많습니다. 또 학회 지침은 혈색소병증·임신·HIV·혈액투석 등의 조건에서 당화혈색소 검사의 정확도가 떨어질 수 있다고 밝히고 있습니다.
          </p>
        </section>

        {/* 6. 관리 팁 */}
        <section>
          <h2 style={sectionTitle}>당화혈색소 낮추는 생활 습관</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '식후 혈당 관리', d: '정제 탄수화물·단순당 줄이고, 채소·단백질 먼저 먹기. 식후 가벼운 걷기.' },
              { t: '규칙적 유산소', d: '주 150분 이상 걷기·자전거 등이 인슐린 감수성을 개선합니다.' },
              { t: '체중 관리', d: '과체중이면 5~7% 감량만으로도 혈당 수치가 눈에 띄게 좋아집니다.' },
              { t: '꾸준한 추적', d: '진단받은 성인은 학회 지침상 2~3개월마다(혈당조절이 안정적이면 연 2회까지) 측정 — 주기는 의료진과 상의하세요.' },
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

        {/* 7. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 8. 관련 도구 */}
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
