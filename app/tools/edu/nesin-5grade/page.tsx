import Link from 'next/link'
import Nesin5GradeClient from './Nesin5GradeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { GRADE5_CUM, GRADE9_CUM, pctToGrade } from './nesinData'

export const metadata = buildMetadata({
  path: '/tools/edu/nesin-5grade',
  title: '내신 5등급제 계산기 — 석차·이수단위 가중 평균',
  description: '2025학년도 고1부터 적용되는 내신 5등급제 계산기. 과목별 석차·재적수·이수단위로 5등급 가중 평균과 구 9등급 환산을 동시에 계산. 등급 구간표 포함.',
  keywords: [
    '내신 계산기', '5등급제 계산기', '내신 5등급제 비율', '고교학점제 내신',
    '9등급 5등급 환산', '2028 대입 내신', '석차 등급 계산', '내신 평균',
  ],
})

/* 5등급 ↔ 9등급 대응 — 손으로 적지 않고 도구의 누적 비율(GRADE5_CUM·GRADE9_CUM)에서 계산한다.
   ⚠️ 예전 표는 2등급 '3~4', 3등급 '4~5', 4등급 '6~7'로 적혀 있었으나, 10~11%·60~66%·89~90% 구간이
      각각 9등급 2·6·8등급에 걸쳐 실제 범위는 2~4 · 4~6 · 6~8이다. */
const G5_ROWS = GRADE5_CUM.map((hi, i) => {
  const lo = i === 0 ? 0 : GRADE5_CUM[i - 1]
  const g9lo = pctToGrade(lo + 1e-6, GRADE9_CUM)
  const g9hi = pctToGrade(hi, GRADE9_CUM)
  return {
    g: `${i + 1}등급`,
    cum: i === 0 ? `상위 ${hi}%` : `${lo} ~ ${hi}%`,
    width: `${hi - lo}%`,
    g9: g9lo === g9hi ? `${g9lo}등급` : `${g9lo}~${g9hi}등급`,
  }
})
/* 재적 200명 예제 — 도구 rankToGrade와 같은 '수강자수 × 누적비율 반올림' 규칙 */
const EX_N = 200
const EX_ROWS = GRADE5_CUM.map((c, i) => {
  const cumCount = Math.round((EX_N * c) / 100)
  const prev = i === 0 ? 0 : Math.round((EX_N * GRADE5_CUM[i - 1]) / 100)
  return { g: `${i + 1}등급`, c: `${c}%`, raw: ((EX_N * c) / 100).toFixed(1), cumCount, n: cumCount - prev, from: prev + 1 }
})

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }

const FAQ_LD = [
  {
    q: '내신 5등급제는 언제부터인가요?',
    a: '<strong>2025학년도 고등학교 1학년부터</strong> 적용됩니다. 즉 2025년에 고1이 된 학생(2028학년도 대입 대상)부터 기존 9등급제 대신 5등급제로 성적이 산출됩니다. 2026년 현재 고1·고2가 5등급제이고, 2024년에 입학한 현재 고3은 종전 9등급제를 유지합니다. 5등급제는 고교학점제 전면 시행과 함께 도입되었습니다.',
  },
  {
    q: '5등급제 비율은 어떻게 되나요?',
    a: '상대평가 누적 비율로 <strong>1등급 상위 10%, 2등급 34%, 3등급 66%, 4등급 90%, 5등급 100%</strong>입니다(교육부훈령 제555호 [별표 9]). 실제 인원은 별표 9 단서에 따라 <strong>수강자수 × 누적비율을 반올림</strong>해 정합니다. 구간별로는 1등급 10%·2등급 24%·3등급 32%·4등급 24%·5등급 10%로, 가운데(3등급)가 가장 넓습니다. 특히 <strong>1등급이 기존 4%에서 10%로 크게 넓어져</strong> 상위권 변별이 어려워졌다는 평가가 있습니다.',
  },
  {
    q: '내신 평균은 어떻게 계산하나요?',
    a: '과목별 등급에 <strong>이수단위(학점)를 가중치로 곱해 평균</strong>을 냅니다. 예를 들어 국어(4학점) 1등급, 수학(4학점) 3등급, 영어(3학점) 2등급이면 (1×4 + 3×4 + 2×3) ÷ (4+4+3) = 22 ÷ 11 = <strong>2.0등급</strong>입니다. 학점 수가 큰 주요 과목이 평균에 더 크게 반영됩니다. 위 계산기에 과목을 추가해 자동으로 확인할 수 있습니다.',
  },
  {
    q: '9등급으로 환산하면 몇 등급인가요?',
    a: '같은 석차 백분율을 <strong>9등급 기준(1:4%·2:11%·3:23%·4:40%·5:60%·…)</strong>으로 다시 계산하면 됩니다. 예를 들어 석차 상위 8%는 5등급제에선 1등급이지만 9등급제에선 2등급입니다. 다만 5등급과 9등급은 구간이 달라 <strong>단순 1:1 대응이 아니며</strong>, 대학 반영 방식도 다르므로 환산값은 참고용으로만 보세요. 위 계산기가 두 값을 나란히 보여줍니다.',
  },
  {
    q: '성취도 A~E는 등급과 다른가요?',
    a: '네, 완전히 다릅니다. <strong>등급(1~5)은 다른 학생과 비교하는 상대평가</strong>이고, <strong>성취도(A~E)는 성취율 기준의 절대평가</strong>입니다(성취율 90%↑ A·80%↑ B·70%↑ C·60%↑ D). 여기서 기준은 원점수가 아니라 <strong>성취율</strong>이며, 교육부훈령 제555호 [별표 9]는 “기준 성취율에 따른 분할점수를 과목별로 학교가 설정할 수 있다”고 정하므로 <strong>원점수 90점이 곧 A는 아닙니다</strong>. 5등급제에서 대부분 과목은 <strong>등급과 성취도를 함께 표기</strong>하므로, 같은 1등급이라도 성취도는 A일 수도 B일 수도 있습니다.',
  },
  {
    q: '2028 대입에는 어떻게 반영되나요?',
    a: '2028학년도 대입(2025년 고1 입학생, 즉 2026년 현재 고2가 치르는 수능)부터 5등급제 내신과 통합·융합형 수능이 적용됩니다. 대학마다 <strong>내신 등급 반영 방식·과목별 가중치</strong>가 달라 아직 세부안이 확정·발표되는 중입니다. 대교협 「2028학년도 대학입학전형기본사항」에도 <strong>공통 환산 기준은 없고</strong> 학생부 활용은 “대학 자율”로만 규정돼 있습니다. 이 계산기의 가중 평균은 <strong>학점 수 기준의 일반적 산출</strong>로, 실제 대학별 환산점수와는 다를 수 있으니 지원 대학의 모집요강을 확인하세요.',
  },
]

const RELATED = [
  { href: '/tools/edu/gpa-converter', icon: '🎓', name: '학점(GPA) 환산기', desc: '4.5↔4.0↔영국 등급' },
  { href: '/tools/edu/review-interval', icon: '🔁', name: '복습 간격 계산기', desc: '망각곡선 복습 주기' },
  { href: '/tools/edu/cognitive-test', icon: '🧠', name: '인지 능력 테스트', desc: '반응속도·기억력' },
  { href: '/tools/finance/housing-score', icon: '🏠', name: '청약 가점 계산기', desc: '84점 만점 자동' },
  { href: '/tools/date/dday', icon: '📅', name: 'D-Day 계산기', desc: '수능·시험 D-Day' },
  { href: '/tools/life/random', icon: '🎲', name: '랜덤 추첨기', desc: '발표·자리 뽑기' },
]

export default function Nesin5GradePage() {
  return (
    <ToolPage width={760} slug="/tools/edu/nesin-5grade">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />내신 5등급제 계산기
      </h1>
      <p className="tp-lead">
        2025 고1부터 적용되는 <strong style={{ color: 'var(--text)' }}>내신 5등급 가중 평균</strong> + 구 9등급 환산. 석차·재적수·학점(구 이수단위)만 입력.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="교육부훈령 제555호(시행 2026-03-01) [별표 9] 석차등급·성취도 기준 / 2028 대입제도 개편"
        sources={[
          { label: '국가법령정보센터 — 학교생활기록 작성 및 관리지침(훈령 제555호)', href: 'https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000274694' },
          { label: '교육부', href: 'https://www.moe.go.kr' },
          { label: '한국대학교육협의회 — 대학입학전형기본사항', href: 'https://www.kcue.or.kr' },
        ]}
      />

      <Nesin5GradeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 className="g-h2">내신 등급·평균 계산 방식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '18px 20px', fontFamily: 'var(--font-mono)',
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>석차 백분율</span> = 석차 ÷ 재적수 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>등급</span> = 백분율이 속한 누적 구간</div>
            <div><span style={{ color: 'var(--muted)' }}>평균 내신</span> = Σ(등급 × 학점) ÷ Σ학점</div>
          </div>
          <Callout tone="note" title="예시">
            국어 4학점 1등급, 수학 4학점 3등급, 영어 3학점 2등급 → (1×4 + 3×4 + 2×3) ÷ (4+4+3) = 22 ÷ 11 = <strong>2.0등급</strong>.
            이 계산기는 석차를 넣은 과목만 평균에 넣으므로, 성취도만 있는 과목·P 과목은 분자와 분모에서 모두 빠집니다. 대학이 이런 과목을 어떻게 반영할지는 모집요강마다 다릅니다.
          </Callout>
        </section>

        {/* 2. 5 vs 9 구간 비교 표 */}
        <section>
          <h2 className="g-h2">5등급 vs 9등급 구간 비교</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['5등급', '누적 비율', '구간', '같은 백분율의 9등급'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {G5_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{r.cum}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.width}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.g9}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            오른쪽 열은 같은 석차 백분율을 9등급 누적 비율(4·11·23·40·60·77·89·96·100%)에 넣었을 때 나올 수 있는 범위입니다. 5등급 1등급(상위 10%)은 9등급으로는 1등급(4%)과 2등급(11%)에 걸쳐 있고,
            5등급 3등급(34~66%)은 9등급 4·5·6등급 세 칸에 걸칩니다. 그래서 &lsquo;5등급 평균 2.0 = 9등급 평균 ○○&rsquo; 같은 고정 환산식은 없고, 과목별 석차를 알아야 9등급 값을 다시 계산할 수 있습니다 — 위 계산기가 과목마다 두 값을 함께 보여 주는 이유입니다.
          </p>
        </section>

        {/* 3. 등급 판정 worked example */}
        <section>
          <h2 className="g-h2">등급 판정 계산 예제 — 재적 200명</h2>
          <p className="g-p">
            「학교생활기록 작성 및 관리지침」(교육부훈령 제555호, 시행 2026-03-01) <strong>[별표 9] 제4조 라목 4)</strong>는 석차누적비율 상한을 10 · 34 · 66 · 90 · 100%로 정합니다. 같은 항의 단서는 <strong>“등급별 누적 학생수는 수강자수와 누적 등급비율을 곱한 값을 반올림하여 계산한다”</strong>고 규정합니다. 즉 커트라인은 비율이 아니라 <strong>반올림한 누적 인원</strong>입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등급', '누적비율', `${EX_N}명 × 비율`, '반올림 누적인원', '등급 인원', '석차 범위'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EX_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.raw}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.cumCount}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}명</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.from} ~ {r.cumCount}위</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="경계 석차는 어떻게 되나요">
            • <strong>정확히 20등(=10.0%)이면 1등급</strong>입니다. 표가 “10% 이하”를 1등급으로 두고, 누적 인원(20명)으로도 20위까지 1등급이라 두 방식이 일치합니다.<br />
            • 수강자수가 딱 떨어지지 않으면 달라집니다. 부산광역시교육청 「2026학년도 고등학교 학업성적관리 시행지침」(2026. 2.)의 <strong>178명 예시</strong>는 누적인원 17.80·60.52·117.48·160.20·178을 반올림해 18·61·117·160·178로 잡고, 등급별 인원을 <strong>18 · 43 · 56 · 43 · 18명</strong>으로 배분합니다. 이때 18위는 백분율로 10.11%지만 1등급이고, 3등급은 명목 32%(56.96명)가 아니라 56명입니다.<br />
            • 위 계산기도 <strong>이 반올림 누적인원 규칙</strong>으로 판정합니다 — 재적 178명·석차 18등을 넣으면 백분율(10.11%)이 아니라 누적인원(18명) 기준으로 1등급이 나옵니다.
          </Callout>
          <p className="g-note">
            ※ 등급 경계에 동점자가 생기면 [별표 9] 라목 5)에 따라 <strong>중간석차백분율</strong>로 등급을 부여합니다. 중간석차 산식은 훈령이 아니라 시·도교육청 시행지침에 있으므로 학교 학업성적관리규정을 확인하세요. 동점자는 모두 최상의 석차를 받고 괄호에 인원이 병기됩니다(라목 6).
          </p>
        </section>

        {/* 4. 성취도 A~E */}
        <section>
          <h2 className="g-h2">등급(상대) vs 성취도(절대) A~E</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>등급 (1~5, 상대평가)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>다른 학생 대비 석차로 결정</li>
                <li>누적 비율 10·34·66·90·100%</li>
                <li>내신 평균·대입 반영의 핵심</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>성취도 (A~E, 절대평가)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>원점수가 아니라 <strong>성취율</strong> 기준</li>
                <li>성취율 90%↑ A · 80%↑ B · 70%↑ C · 60%↑ D · 60% 미만 E(선택과목)</li>
                <li>분할점수는 학교가 과목별로 설정 — 등급과 함께 병기</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. 등급이 안 나오는 과목 */}
        <section>
          <h2 className="g-h2">등급이 안 나오는 과목 — 절대평가 범위</h2>
          <p className="g-p">
            훈령 제555호 <strong>제15조 제4항</strong>은 석차등급을 산출하지 않는 과목을 세 유형으로 나눕니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대상 과목', '학생부 기재 항목', '성취도'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['사회·과학 융합선택 9과목(여행지리, 역사로 탐구하는 현대 세계, 사회문제 탐구, 금융과 경제생활, 윤리문제 탐구, 기후변화와 지속가능한 세계, 과학의 역사와 문화, 기후변화와 환경생태, 융합과학 탐구) · 특수교육 전문 교과', '교과·과목·학점·원점수/과목평균·성취도·분포비율·수강자수 (석차등급만 빠짐)', 'A~E'],
                  ['공통과목 ‘과학탐구실험’ · 체육·예술 교과(군) 과목 — 특수목적고 선택 과목은 제외(석차등급 산출)', '교과·과목·학점·성취도 (원점수·분포비율·수강자수도 미기재)', 'A~C'],
                  ['교양 교과(군) 과목', '교과·과목·학점·이수여부', 'P'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', lineHeight: 1.7 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.7 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 석차등급을 산출하는 과목이라도 <strong>수강자수가 5명 이하</strong>이거나(제15조 제10항) <strong>공동교육과정·온라인학교</strong>로 이수한 과목은(제15항) 석차등급란에 ‘ㆍ’이 들어갑니다. 훈령상 인원 기준은 ‘5명 이하’ 하나뿐입니다.
          </p>
          <Callout tone="warn" title="성취도 A~E는 ‘원점수’가 아니라 ‘성취율’ 기준">
            [별표 9] 제4조 라목 3)의 표 기준은 원점수가 아니라 성취율이고, 같은 조항이 <strong>“기준 성취율에 따른 분할점수를 과목별로 학교가 설정할 수 있다”</strong>고 정합니다. 따라서 <strong>‘원점수 90점이면 무조건 A’로 단정할 수 없고</strong>, A 커트라인은 과목·학교마다 다를 수 있습니다.<br />
            • <strong>5단계(A~E)</strong> — 성취율 90%↑ A · 80%↑ B · 70%↑ C · 60%↑ D. E는 공통과목이 40% 이상~60% 미만이고, 40%에 못 미쳐도 최소 성취수준 보장지도를 이수하면 E를 받습니다. 선택과목은 60% 미만이 모두 E입니다.<br />
            • <strong>3단계(A~C) 과목만 원점수 직결</strong> — 과학탐구실험은 80%↑ A · 60% 이상~80% 미만 B · 40% 이상~60% 미만 C, 체육·예술은 80%↑ A · 60% 이상~80% 미만 B · 60% 미만 C. 경기도교육청 시행지침은 “3단계 평정 과목의 경우 분할점수는 별도의 분할점수 산출 방법을 사용하지 않고 원점수에 따라 평정한다”고 명시합니다.
          </Callout>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
