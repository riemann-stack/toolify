import Link from 'next/link'
import GpaConverterClient from './GpaConverterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { convertGpa, UK_CUTS, type ScaleId } from './gpaData'

export const metadata = buildMetadata({
  path: '/tools/edu/gpa-converter',
  title: '학점(GPA) 환산기 — 한국 4.5·4.3 ↔ 미국 4.0 ↔ 영국 등급',
  description:
    '한국 대학 학점을 미국 4.0 GPA·영국 학위 등급(1st·2:1·2:2)·평어로 동시 환산. WES·비례·평어 3가지 방식 비교 + 한국 대학별 만점 가이드.',
  keywords: [
    '학점 환산', 'GPA 환산', 'GPA 변환', '4.5 4.0 환산', '4.3 4.0 환산',
    'WES GPA', 'WES 환산', '미국 GPA', '영국 GPA', 'UK honours',
    '서울대 학점', 'KAIST 학점', '연세대 학점', '고려대 학점',
    '유학 GPA', '대학원 GPA', 'MBA GPA', '교환학생 학점',
    '백분율 GPA', '평어 환산', 'A+ GPA', '평균 평점',
  ],
})

/* 대표 평점 환산표 — 손으로 적지 않고 도구와 같은 convertGpa()로 빌드 시 계산한다 */
const SAMPLE_ROWS: [number, ScaleId][] = [
  [4.5, '4.5'], [4.3, '4.5'], [4.0, '4.5'], [3.75, '4.5'], [3.5, '4.5'], [3.0, '4.5'], [2.5, '4.5'],
  [4.3, '4.3'], [4.0, '4.3'], [3.7, '4.3'], [3.3, '4.3'], [3.0, '4.3'], [2.7, '4.3'],
]
const SAMPLE = SAMPLE_ROWS.map(([g, sc]) => ({
  g, sc,
  lin: convertGpa(g, sc, 'linear'),
  wes: convertGpa(g, sc, 'wes'),
  kr: convertGpa(g, sc, 'korean'),
}))
/* 본문 계산 예시(4.5 만점 3.75) — 문장 속 숫자도 같은 함수에서 */
const EX_LIN = convertGpa(3.75, '4.5', 'linear')
const EX_WES = convertGpa(3.75, '4.5', 'wes')
const EX_KR = convertGpa(3.75, '4.5', 'korean')
const A0_LIN = convertGpa(4.0, '4.5', 'linear').usGpa
const A0_WES = convertGpa(4.0, '4.5', 'wes').usGpa
const TOP_LIN = convertGpa(4.3, '4.5', 'linear').usGpa
const B0_LIN = convertGpa(3.0, '4.5', 'linear').usGpa
const B0_WES = convertGpa(3.0, '4.5', 'wes').usGpa
const cutsOf = (sc: ScaleId) => UK_CUTS[sc].map(v => v.toFixed(1)).join('·')

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '9px 12px', color: 'var(--text)' }
const TDM: React.CSSProperties = { padding: '9px 12px', color: 'var(--muted)' }

const FAQ_LD = [
              {
                q: '한국 4.5만점 4.0점은 미국 GPA로 얼마인가요?',
                a: '환산 방식에 따라 다릅니다. <strong>비례 환산</strong>: 4.0 / 4.5 × 4.0 = 약 <strong>3.56</strong>. <strong>WES 기준</strong>(과목 평어를 미국 평어로 옮겨 평균 — 외국 학력 평가 기관 WES의 방식): 4.5만점의 4.0은 A0 평균이라 미국 <strong>A = 4.00</strong>으로 환산되어 비례보다 높게 나옵니다. <strong>한국 평어 기준</strong>도 A0 → 4.00입니다. 평점 4.0이 백분율 89%라고 해서 원점수 89점(A-)으로 보면 안 된다는 점에 주의하세요. 본 도구의 비교 그리드에서 세 가지 결과를 나란히 확인할 수 있습니다.',
              },
              {
                q: '서울대·KAIST는 4.3 만점인데, 다른 학교 4.5와 어떻게 비교하나요?',
                a: '만점 숫자만으로 유불리를 따질 수 없습니다. 두 체계 모두 <strong>A0 = 4.0으로 같고</strong>, 다른 것은 가산 폭입니다. 4.5만점은 +등급에 0.5를 더하고(A+ 4.5·B+ 3.5) −등급이 없으며, 4.3만점은 +등급에 0.3만 더하는 대신 A-(3.7)·B-(2.7) 같은 −등급이 있습니다. 그래서 같은 B+라도 4.5만점 성적표에는 3.5, 4.3만점 성적표에는 3.3으로 적힙니다. 백분율 비례로 옮기면(4.3만점 4.0 → 4.5만점 4.19) 이 평어 구성이 반영되지 않으므로, 영문 성적증명서의 만점 표기를 그대로 두고 평가 기관의 판단에 맡기는 편이 안전합니다.',
              },
              {
                q: 'WES 환산은 어떤 점에서 보수적인가요?',
                a: 'WES는 미국·캐나다 대학과 기관에 제출되는 외국 성적을 표준화하는 평가 기관으로, 과목별 평어를 미국 평어로 옮겨 평균을 냅니다. 한국 4.5·4.3 만점에서는 B+ → 3.3, B0 → 3.0처럼 옮겨지므로 대체로 비례 환산보다 높게 나옵니다(4.5만점 4.0점이면 비례 3.56, WES 4.00). 다만 A+와 A0를 둘 다 4.00으로 처리해 상위권 변별이 사라진다(4.0 캡)는 점에서 보수적이라 불립니다.',
              },
              {
                q: '미국 대학원 지원 시 평균 GPA 컷오프는?',
                a: '학교·전공마다 공개 기준이 다르지만, 많은 대학원이 <strong>최저 3.0(B 평균)</strong>을 지원 자격으로 제시합니다. 상위권 프로그램은 합격자 평균이 이보다 높은 경우가 많지만 정확한 수치는 학교가 공개하는 합격자 통계로 확인해야 합니다. 연구 중심 과정은 GPA 외에 추천서·연구 경력·논문이 크게 작용하므로, 본인 GPA가 기준선 근처라면 다른 지원자와 차별화할 요소를 강화하는 게 우선입니다.',
              },
              {
                q: '영국 대학원 입학에 필요한 한국 학점은?',
                a: '학교·전공에 따라 다르지만, <strong>2:1 (Upper Second, 60%↑)</strong>이 대부분 영국 대학원의 입학 기본선입니다. 한국 4.5만점 기준 약 <strong>3.0 이상</strong>, 4.3만점 기준 약 <strong>2.8 이상</strong>이면 2:1 동등으로 보는 경우가 많습니다. <strong>First Class (70%↑)</strong>는 4.5만점 약 3.5 / 4.3만점 약 3.3 이상이 대략적 기준이며, 학교마다 국가별 동등표(출신 대학 구분 포함)가 따로 있으니 지원 학교의 국가별 입학 요건 페이지를 확인하세요.',
              },
              {
                q: '교환학생 학점은 어떻게 인정되나요?',
                a: '교환학생 기간 동안 받은 외국 학교 성적은 <strong>한국 본교의 인정 기준</strong>에 따라 본교 성적표에 옮겨집니다. 학교에 따라 <strong>"이수/미이수(P/F)"로만 표기</strong>하거나 학점만 인정하고 평점 계산에서 빼기도 하고, 환산 평어를 그대로 반영하기도 합니다. 반영 방식에 따라 평균 평점이 달라지므로 출국 전에 본교 국제처·교무처 규정을 확인하세요.',
            },
            {
              q: '재수강한 과목은 환산에 어떻게 반영되나요?',
              a: '한국에서는 재수강 시 <strong>높은 점수만 성적표에 표기</strong>되는 경우가 많아 GPA에 유리합니다. 그러나 WES·평가 기관은 <strong>모든 과목 시도를 합산</strong>해 평균을 내기도 하므로, 재수강 이력이 많을수록 외부 환산 GPA가 본교 GPA보다 낮게 나올 수 있습니다. 영문 성적표 발급 시 재수강 처리 방식을 학교에 문의하세요.',
            },
            {
              q: 'A+를 받아도 GPA가 4.0으로 캡되는 학교가 있다는데?',
              a: '미국 대학마다 다릅니다. 하버드 칼리지처럼 <strong>A+ 평어가 아예 없어 A(4.00)가 최고</strong>인 곳이 있고, A+를 두더라도 4.00으로 계산하는 학교가 많으며, 일부는 A+를 4.33으로 인정해 GPA가 4.0을 넘기도 합니다. MIT처럼 5.0 척도(A = 5)를 쓰는 학교도 있습니다. 한국 4.3·4.5만점은 A+에 가산점을 주므로, 4.0을 상한으로 두는 WES 환산에서는 A+와 A0의 차이가 사라집니다.',
            },
            ]

export default function GpaConverterPage() {
  return (
    <ToolPage width={880} slug="/tools/edu/gpa-converter">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />학점(GPA) 환산기
      </h1>
      <p className="tp-lead">
        한국 4.5·4.3 ↔ 미국 4.0 ↔ 영국 학위 등급. <strong style={{ color: 'var(--text)' }}>WES·비례·평어 3방식</strong> 동시 비교 + 한국 대학별 만점.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="비례 = 평점 ÷ 만점 × 4.0 · WES·평어 = 한국 평어(A+·A0 → 4.0, B+ → 3.3 …)를 미국 4.0 평어로 옮겨 인접 평어 사이를 선형 보간 · 영국 등급은 4.5 만점 First≈3.5·2:1≈3.0 / 4.3 만점 First≈3.3·2:1≈2.8의 대략값(학교별 동등표가 우선)"
        sources={[
          { label: 'WES (World Education Services) — 외국 학력·성적 평가', href: 'https://www.wes.org/' },
          { label: '대학알리미 — 대학별 성적 평가 결과 공시', href: 'https://www.academyinfo.go.kr/' },
        ]}
      />

      <GpaConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 한국 vs 미국 vs 영국 */}
        <section>
          <h2 className="g-h2">한국 ↔ 미국 ↔ 영국 학점 체계 비교</h2>
          <p className="g-p">
            국가마다 학점·등급 표기가 달라 단순 비례 환산만으로는 부정확할 수 있습니다. 주요 체계의 차이는 다음과 같습니다. 같은 나라 안에서도 대학마다 척도가 다르다는 점이 가장 큰 함정입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['국가', '주요 만점', '평어', '특징'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['한국', '4.5 / 4.3 (일부 5.0)', 'A+ ~ F (A0·B0 포함)', '학교별 만점이 다름, A+가 최고. 4.3제는 −등급(A-·B-)이 있음'],
                  ['미국', '4.0 (A+ 4.33 인정 학교 일부)', 'A+ ~ F', 'A+를 두지 않거나 4.0으로 계산하는 학교가 많음. MIT는 5.0 척도'],
                  ['영국', '백분율 (0~100)', 'First / 2:1 / 2:2 / 3rd', '학사 학위 등급 — 보통 70%↑ = First'],
                  ['캐나다', '4.0 / 4.33 / 백분율', 'A+ ~ F', '주·대학마다 다름 (요크대는 9점 척도)'],
                  ['호주', '7점 (HD/D/C/P)', 'HD/D/C/P', 'HD = 7, D = 6, C = 5, P = 4 · HD 컷은 대학마다 80~85%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row[0]}</td>
                    <td style={{ ...TD, fontWeight: 700 }}>{row[1]}</td>
                    <td style={TDM}>{row[2]}</td>
                    <td style={TDM}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 3가지 환산 방식 */}
        <section>
          <h2 className="g-h2">3가지 환산 방식 — 언제 어떤 걸 써야 하나</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: 'WES 기준 (평어 매핑 · 4.0 캡)',
                d: 'World Education Services는 미국·캐나다의 대학과 기관이 널리 인정하는 외국 학력 평가 기관입니다. 과목 평어를 미국 평어로 옮겨 평균을 내므로 한국 4.5·4.3 만점에서는 대체로 비례보다 높게 나오지만, A+와 A0를 둘 다 4.00으로 캡해 상위권 변별이 없다는 점에서 보수적입니다. 본 도구는 평균 평점을 인접한 두 평어의 혼합으로 보고 추정합니다.',
                use: '미국 대학원 지원, 해외 취업·이민 서류의 학력 평가를 준비할 때',
                c: 'var(--cyan-600)',
              },
              {
                t: '비례 환산 (단순 비율)',
                d: '단순 비율: US GPA = (한국 GPA / 만점) × 4.0. 계산이 투명해 빠른 어림이나 자기소개서용으로 쓰입니다. 한국 4.5·4.3 만점에서는 대체로 WES보다 낮게 나옵니다(예: 4.5만점 4.0점은 비례 3.56, WES 4.00).',
                use: '빠른 어림 계산, 지원 학교가 비례 환산을 명시했을 때',
                c: 'var(--emerald-600)',
              },
              {
                t: '평어 기준 (한국 성적표 직역)',
                d: '한국 성적표의 평어(A+/A0/A-/B+ …)를 미국 4.0 스케일로 평어별 매핑합니다. 4.5·4.3 만점 입력에서는 WES와 같은 숫자가 나오고, 표시되는 평어만 한국식(A0·B0)입니다. 100점(원점수) 입력에서는 A+를 4.3으로 본 뒤 4.0으로 잘라 씁니다.',
                use: '교환학생 지원, 한국 대학 영문 성적증명서와 대조할 때',
                c: 'var(--amber-600)',
              },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${m.c}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75, margin: '0 0 6px' }}>{m.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>활용:</strong> {m.use}
                </p>
              </div>
            ))}
          </div>
          <Callout tone="note" title="대원칙">
            미국 대학원·취업은 WES 기준에 맞춰 준비하되, 지원 학교가 자체 환산식이나 지정 평가 기관을 명시하면 그것을 최우선으로 따르세요.
          </Callout>
        </section>

        {/* 3. 계산식과 대표값 */}
        <section>
          <h2 className="g-h2">이 도구의 계산식과 대표 평점 환산표</h2>
          <p className="g-p">
            입력한 평점은 먼저 <strong>백분율(평점 ÷ 만점 × 100)</strong>로 바뀌고, 비례 환산은 이 백분율을 25로 나눠 4.0 척도로 옮깁니다. WES·평어 방식은 백분율을 쓰지 않습니다.
            평균 평점이 두 평어 사이에 있으면 <strong>두 평어가 섞인 성적표</strong>로 보고, 한국 평어를 미국 평어로 바꾼 값 사이를 같은 비율로 보간합니다.
            예를 들어 4.5 만점 3.75는 A0(4.0)와 B+(3.5)의 한가운데이므로, 미국 평어 A(4.0)와 B+(3.3)의 한가운데인 <strong>{EX_WES.usGpa.toFixed(2)}</strong>가 됩니다.
            같은 입력의 비례 환산은 3.75 ÷ 4.5 × 4.0 = <strong>{EX_LIN.usGpa.toFixed(2)}</strong>, 평어 기준은 {EX_KR.usGpa.toFixed(2)}(가장 가까운 평어 {EX_KR.letter})입니다.
            영국 등급은 백분율이 아니라 만점별 평점 컷(4.5 만점 {cutsOf('4.5')}, 4.3 만점 {cutsOf('4.3')})으로 1st·2:1·2:2·3rd를 가릅니다.
            영국 70%·60% 컷은 영국 원점수 기준이라 한국 평점 비율에 그대로 대면 등급이 과하게 나오기 때문입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <caption style={{ captionSide: 'bottom', textAlign: 'left', fontSize: 12, color: 'var(--muted)', paddingTop: 8 }}>
                도구와 같은 계산 함수로 생성한 값입니다. 영국 등급은 대략적 동등값입니다.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['만점', '평점', '백분율', '비례', 'WES', '평어 기준', '영국 등급'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={TDM}>{r.sc}</td>
                    <td style={{ ...TD, fontWeight: 700 }}>{r.g.toFixed(2)}</td>
                    <td style={TDM}>{r.lin.percent.toFixed(1)}%</td>
                    <td style={TD}>{r.lin.usGpa.toFixed(2)}</td>
                    <td style={{ ...TD, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.wes.usGpa.toFixed(2)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({r.wes.letter})</span></td>
                    <td style={TD}>{r.kr.usGpa.toFixed(2)} <span style={{ color: 'var(--muted)' }}>({r.kr.letter})</span></td>
                    <td style={TD}>{r.wes.ukClass.abbr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            방식 간 차이는 <strong>A0 평균(4.5 만점 4.0) 부근에서 가장 큽니다</strong> — WES {A0_WES.toFixed(2)}, 비례 {A0_LIN.toFixed(2)}.
            만점(4.5)에서는 세 방식이 모두 4.00으로 같아지고, 4.3처럼 A+가 섞인 평점은 WES로는 4.00에 묶이지만 비례로는 {TOP_LIN.toFixed(2)}까지 내려갑니다.
            B0 평균(4.5 만점 3.0)에서도 차이가 남습니다(WES {B0_WES.toFixed(2)} · 비례 {B0_LIN.toFixed(2)}).
            따라서 지원서에 한 숫자만 적어야 한다면, 그 숫자가 어느 방식으로 나온 것인지 함께 밝히는 편이 오해를 줄입니다.
          </p>
        </section>

        {/* 4. 영국 학위 등급 */}
        <section>
          <h2 className="g-h2">영국 학위 등급 (Honours classification)</h2>
          <p className="g-p">
            영국 학사 학위는 백분율 기반으로 4단계 등급이 매겨집니다. 영국 대학원 지원 시 본인의 한국 학점이 어느 등급에 해당하는지 미리 알아두면 유리합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            {[
              { abbr: '1st', name: 'First Class', cut: '70%↑', meaning: '최상위 등급 — 박사과정 장학 심사 등에서 유리', c: 'var(--emerald-600)' },
              { abbr: '2:1', name: 'Upper Second', cut: '60-69%', meaning: '대다수 대학원의 입학 기본선', c: 'var(--cyan-600)' },
              { abbr: '2:2', name: 'Lower Second', cut: '50-59%', meaning: '일부 석사과정 지원 가능', c: 'var(--amber-600)' },
              { abbr: '3rd', name: 'Third Class', cut: '40-49%', meaning: '학위는 수여되나 대학원 진학은 어려운 편', c: 'var(--orange-600)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 20, color: g.c, fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>{g.abbr}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.name}</p>
                <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, margin: '0 0 6px' }}>{g.cut}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 자주 하는 실수 */}
        <section>
          <h2 className="g-h2">환산 전에 확인할 것 — 자주 하는 실수</h2>
          <ul className="g-list">
            <li><strong>평점 비율을 원점수로 읽기</strong> — 4.5 만점 4.0은 88.9%지만 &lsquo;원점수 89점&rsquo;이 아니라 A0 평균입니다. 백분율 칸은 비례 환산을 위한 중간값일 뿐입니다.</li>
            <li><strong>4.3 ↔ 4.5 비례값을 공식 성적처럼 쓰기</strong> — 위 도구의 만점 상호 환산은 백분율 비례라 평어 구성(−등급 유무)을 반영하지 못합니다. 지원서에는 성적표에 적힌 평점과 만점을 그대로 쓰고, 환산값은 참고로만 두세요.</li>
            <li><strong>전체 평점만 준비하기</strong> — 해외 대학원은 전공 과목 평점이나 마지막 2년(약 60학점) 평점을 따로 묻는 경우가 있습니다. 과목별 평어와 학점이 있어야 다시 계산할 수 있으니 성적표 원본을 기준으로 정리해 두세요.</li>
            <li><strong>P/F·재수강 과목 처리</strong> — 본교 평점에서 빠진 과목이라도 평가 기관은 성적표에 적힌 모든 시도를 볼 수 있습니다. 영문 성적증명서에 재수강 이력이 어떻게 찍히는지 먼저 확인하세요.</li>
            <li><strong>필요한 평가 방식 확인 없이 신청하기</strong> — 학교마다 WES 같은 외부 평가를 요구하거나, 자체 심사만 하거나, 특정 기관만 인정합니다. 평가 비용과 기간이 드는 일이므로 지원 요강에서 요구 사항을 먼저 확인하세요.</li>
          </ul>
          <p className="g-p">
            국내 대학의 학점 분포가 궁금하다면 대학알리미 공시의 &lsquo;성적 평가 결과&rsquo;에서 학교별 A·B·C 비율을 비교해 볼 수 있습니다. 같은 3.8이라도 A 비율이 높은 학교와 낮은 학교에서 갖는 의미가 다르기 때문에, 해외 심사에서 학교 이름과 성적 분포가 함께 고려되기도 합니다.
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/edu/nesin-5grade',     icon: '🎓', name: '내신 5등급제 계산기',   desc: '석차·학점 가중 평균' },
              { href: '/tools/edu/review-interval',  icon: '🧠', name: '복습 간격 계산기',     desc: '에빙하우스·SM-2 다음 복습일' },
              { href: '/tools/edu/fermi-estimate',   icon: '🧮', name: '페르미 추정 계산기',   desc: '면접 추정 문제 사고력 훈련' },
              { href: '/tools/life/travel-budget',   icon: '✈️', name: '여행 예산 계산기',     desc: '유학·교환 생활비 시뮬' },
              { href: '/tools/finance/compound',     icon: '📈', name: '복리 계산기',           desc: '유학 자금 모으기 시뮬' },
              { href: '/tools/finance/savings',      icon: '💰', name: '저축액 계산기',         desc: '월 저축으로 학자금 만들기' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
