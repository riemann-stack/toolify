import Link from 'next/link'
import CognitiveTestClient from './CognitiveTestClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  ROUNDS, REACTION_DELAY_MS, REACTION_GRADES, gradeRangeText, getReactionGrade,
  STROOP_BANDS, DUAL_BANDS, interferenceBand, BAND_LABEL, bandsText,
  REACTION_SCALE, STROOP_SCALE, DUAL_SCALE, reactionScore, stroopScore, dualScore, calcTotalScore,
} from './cognitiveTestUtils'

export const metadata = buildMetadata({
  path: '/tools/edu/cognitive-test',
  title: '인지 능력 테스트 — 반응속도·스트룹·이중 과제 게임',
  description: '반응속도·스트룹 효과·이중 과제로 집중력과 인지 처리 속도를 게임처럼 측정하는 인지 능력 자가 테스트. 반응속도 등급표와 결과 해석 가이드 포함 — 임상 진단이 아닌 교육·게임용 참고 지표입니다.',
  keywords: ['인지능력테스트', '반응속도테스트', '스트룹효과', '이중과제', '집중력테스트', '인지심리학', '두뇌게임', 'reaction time test', 'stroop test'],
})

/* 점수 환산·판정 구간은 계산기와 같은 cognitiveTestUtils에서 가져와 빌드 시 표로 만든다 */
const SCORE_ROWS = [
  { name: '반응 속도', basis: `${ROUNDS.reaction}회 중 첫 1회(연습)를 뺀 ${ROUNDS.reaction - 1}회 평균`, unit: 'ms',
    points: [REACTION_SCALE.full, (REACTION_SCALE.full + REACTION_SCALE.zero) / 2, REACTION_SCALE.zero],
    bands: REACTION_GRADES.map(g => `${gradeRangeText(g).replace('ms', '')} ${g.label}`).join(' · ') },
  { name: '스트룹 간섭', basis: '불일치 평균 − 일치 평균 (정답 문항만)', unit: 'ms',
    points: [STROOP_SCALE.full, (STROOP_SCALE.full + STROOP_SCALE.zero) / 2, STROOP_SCALE.zero],
    bands: `${bandsText(STROOP_BANDS, '')} · 0 이하 오차 범위` },
  { name: '이중 과제 간섭률', basis: '(이중 평균 − 단일 평균) ÷ 단일 평균 (홀짝 정답 문항만)', unit: '%',
    points: [DUAL_SCALE.full, (DUAL_SCALE.full + DUAL_SCALE.zero) / 2, DUAL_SCALE.zero],
    bands: `${bandsText(DUAL_BANDS, '')} · 0 이하 오차 범위` },
]

/* 반응 속도 등급별 해석 — 등급 구간 자체는 REACTION_GRADES */
const GRADE_NOTE: Record<string, string> = {
  excellent: '반복해도 이 수준이면 매우 빠른 편. 한 번뿐이면 운 좋게 예측한 회차가 섞였을 수 있음',
  fast: '건강한 젊은 성인의 좋은 컨디션 범위',
  avg: '웹 측정에서 흔한 범위 (기기 지연 포함)',
  below: '일상에 문제없는 범위. 피로·터치 입력이면 흔함',
  slow: '피로·집중 부족·기기 지연 가능성. 쉬었다가 같은 조건으로 다시 측정',
}

/* 계산 예시 — 설명용 가상 입력값(실측 기록 아님) */
const EX_RT = [312, 268, 241, 255, 290, 236]
const EX_RT_MEAN = Math.round(EX_RT.slice(1).reduce((a, b) => a + b, 0) / (EX_RT.length - 1))
const EX_CONG = 720, EX_INC = 905
const EX_STROOP = EX_INC - EX_CONG
const EX_SINGLE = 610, EX_DUAL = 780
const EX_DUAL_PCT = Math.round(((EX_DUAL - EX_SINGLE) / EX_SINGLE) * 100)
const EX_TOTAL = calcTotalScore({ reaction: EX_RT_MEAN, stroop: EX_STROOP, dual: EX_DUAL_PCT })!.value
const bandWord = (b: keyof typeof BAND_LABEL) => BAND_LABEL[b].replace(/ \(.*\)$/, '')

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

const FAQ_LD = [
              {
                q: '평균 반응속도가 250ms인데 정상인가요?',
                a: '네, <strong>일반적인 건강한 성인 범위</strong> 안에 있습니다. 화면이 바뀌면 누르는 단순 반응속도는 실험실 장비로 재면 젊은 성인 평균이 200ms 남짓이고, 웹·일반 PC로 재면 마우스·화면 지연이 더해져 200~300ms 사이가 흔합니다. 반응속도는 수면·피로·집중도·기기 성능에 따라 매번 달라지므로, 한 번의 결과보다 여러 번 잰 평균을 보는 것이 의미 있습니다.',
              },
              {
                q: '스트룹 효과가 잘 안 나오는데 인지 능력이 좋은 건가요?',
                a: '간섭이 작다는 건 글자 뜻을 자동으로 읽는 반응을 잘 억누르고 색에 집중했다는 뜻으로, <strong>선택적 주의력</strong>이 잘 작동한 결과로 볼 수 있습니다. 다만 이 도구는 조건별 10문항뿐인 <strong>게임형 참고 지표</strong>라 우연 오차가 크고, 한글 읽기 속도·색 구분 능력·버튼 위치에 익숙한 정도에 따라서도 달라집니다. 간섭이 0 이하로 나오면 대개 문항 수가 적어 생긴 오차이니 다시 측정해 보세요.',
              },
              {
                q: '이중 과제 결과가 안 좋은데 ADHD인가요?',
                a: '<strong>이 도구의 결과로 ADHD를 판단할 수 없습니다.</strong> ADHD는 정신건강의학과 전문의가 DSM-5 기준 면담, 어릴 때부터의 발달력, 학교·직장·가정에서의 기능 평가, 필요하면 표준화된 주의력 검사와 심리검사를 종합해 진단합니다. 이중 과제 점수가 낮게 나오는 가장 흔한 이유는 <strong>수면 부족·피로·첫 시도라 방법이 낯선 것</strong>입니다. 다만 집중력 문제로 일상·학업·업무에 지속적인 어려움이 있다면 결과와 상관없이 전문의 상담을 받아 보세요.',
              },
              {
                q: '모바일과 데스크탑 결과가 다른 이유는?',
                a: '입력 방식과 화면 응답성이 다르기 때문입니다. 터치스크린은 손가락이 닿은 것을 인식하는 데 기기에 따라 수십 ms가 더 걸릴 수 있고, 화면 주사율(60Hz면 한 프레임 약 16.7ms, 120Hz면 약 8.3ms)만큼 자극이 늦게 보일 수도 있습니다. 그래서 <strong>같은 사람도 기기에 따라 수십 ms 차이</strong>가 나는 것이 정상이며, 기록을 비교할 때는 같은 기기·같은 입력 방식끼리만 비교하세요.',
              },
              {
                q: '매일 테스트하면 인지 능력이 향상되나요?',
                a: '반복하면 <strong>이 테스트 자체의 점수는 좋아집니다</strong>. 버튼 위치와 규칙에 익숙해지기 때문입니다. 하지만 그것이 일상의 주의력·기억력 향상으로 이어진다는 근거는 약합니다. 두뇌 훈련 연구 130여 편을 검토한 Simons 외(2016)의 리뷰는 &lsquo;훈련한 과제는 늘지만, 훈련하지 않은 일반 인지 능력으로의 전이는 근거가 부족하다&rsquo;고 결론지었습니다. 인지 건강에는 충분한 수면, 규칙적인 신체 활동, 사람들과의 교류, 새로운 것을 배우는 활동이 꾸준히 권장됩니다.',
              },
            ]

export default function CognitiveTestPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/cognitive-test">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />인지 능력 테스트
      </h1>
      <p className="tp-lead">
        반응속도·스트룹·이중 과제로 <strong style={{ color: 'var(--text)' }}>집중력과 인지 처리 속도</strong>를 게임처럼 측정.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="인지심리학 표준 과제(단순 반응시간 · Stroop 1935 · 이중 과제 간섭)를 게임화한 참고 지표 — 임상 검사 아님"
        sources={[
          { label: 'Stroop (1935) 원 논문', href: 'https://doi.org/10.1037/h0054651' },
          { label: 'Pashler (1994) 이중 과제 간섭 리뷰', href: 'https://doi.org/10.1037/0033-2909.116.2.220' },
          { label: 'Woods 외(2015) 단순 반응시간 요인', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4374455/' },
          { label: 'Simons 외(2016) 두뇌 훈련 효과 리뷰', href: 'https://doi.org/10.1177/1529100616661983' },
        ]}
      />

      <CognitiveTestClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 인지 능력 테스트란? ── */}
        <div>
          <h2 className="g-h2">
            인지 능력 테스트란?
          </h2>
          <p className="g-p">
            인지심리학 실험실에서 오래 써 온 표준 과제 세 가지를 브라우저에서 해 볼 수 있게 만든 도구입니다.
            각 과제는 서로 다른 능력을 봅니다.
          </p>
          <ul className="g-list">
            <li><strong>반응 속도(Simple Reaction Time)</strong> — 화면 색이 바뀌는 순간 누르기까지의 시간. 지각·운동 처리의 기본 속도.</li>
            <li><strong>스트룹 과제(Stroop, 1935)</strong> — 글자 뜻과 글자 색이 어긋날 때 색을 고르는 데 더 걸리는 시간. 자동 반응을 억누르는 선택적 주의·억제 능력.</li>
            <li><strong>이중 과제(Dual-Task)</strong> — 두 가지 일을 동시에 할 때 한 가지 일의 반응이 얼마나 느려지는지. 주의를 나누는 능력과 그 한계.</li>
          </ul>
          <Callout tone="warn" title="의학·임상 진단이 아닙니다">
            교육·자기 비교용 게임입니다. 결과로 주의력 장애나 인지 저하를 스스로 판단하지 마세요. 걱정되는 증상이 있다면 전문의와 상담하세요.
          </Callout>
        </div>

        {/* ── 2. 측정 방식 ── */}
        <div>
          <h2 className="g-h2">
            이 도구의 측정·계산 방식
          </h2>
          <p className="g-p">
            <strong>반응 속도</strong>는 버튼을 누른 뒤 {REACTION_DELAY_MS.min / 1000}~{REACTION_DELAY_MS.max / 1000}초 사이 무작위 시점에 화면이 바뀌고, 바뀐 순간부터 누를 때까지를 잽니다. {ROUNDS.reaction}번 중 첫 번째는 손을 푸는 연습으로 보고
            나머지 {ROUNDS.reaction - 1}번의 평균을 결과로 씁니다. 화면이 바뀌기 전에 누르면 &lsquo;너무 빨리 누름&rsquo;으로 기록하고 그 회차를 다시 합니다.
          </p>
          <p className="g-p">
            <strong>스트룹</strong>은 {ROUNDS.stroop}문항 중 절반은 글자와 색이 같고(일치), 절반은 다릅니다(불일치). 6가지 색 버튼 중 <strong>글자 색</strong>을 고르며,
            정답을 맞힌 문항만으로 조건별 평균을 내 &lsquo;불일치 평균 − 일치 평균&rsquo;을 간섭 시간으로 씁니다.
            <strong> 이중 과제</strong>는 숫자 1~9의 홀짝 판단을 먼저 혼자 {ROUNDS.dualSingle}번, 그다음 절반 확률로 나타나는 점을 함께 감시하면서 {ROUNDS.dualDouble}번 합니다.
            홀짝을 맞힌 문항의 평균 반응시간이 이중 조건에서 몇 % 늘었는지가 간섭률입니다.
          </p>
          <p className="g-p">
            종합 점수는 세 결과를 각각 0~100점으로 바꾼 뒤 단순 평균합니다. 아래 표가 계산기의 환산 기준과 판정 구간입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>항목</th>
                  <th scope="col" style={th}>계산</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>100점</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>50점</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>0점</th>
                  <th scope="col" style={th}>결과 화면 판정</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_ROWS.map(r => (
                  <tr key={r.name} style={rowBorder}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.name}</th>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.basis}</td>
                    {r.points.map((p, k) => (
                      <td key={k} style={{ ...tdNum, textAlign: 'right' }}>
                        {k === 0 ? '≤ ' : k === 2 ? '≥ ' : ''}{p}{r.unit}
                      </td>
                    ))}
                    <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.bands}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            예를 들어(설명용 가상 값) 반응 속도 6회가 {EX_RT.join('·')}ms라면 첫 회를 뺀 평균은 <strong>{EX_RT_MEAN}ms</strong>로 &lsquo;{getReactionGrade(EX_RT_MEAN).label}&rsquo; 구간이고 {Math.round(reactionScore(EX_RT_MEAN))}점입니다.
            스트룹 일치 평균 {EX_CONG}ms · 불일치 평균 {EX_INC}ms면 간섭 <strong>{EX_STROOP}ms</strong>로 &lsquo;{bandWord(interferenceBand(EX_STROOP, STROOP_BANDS))}&rsquo; 구간, {Math.round(stroopScore(EX_STROOP))}점입니다.
            이중 과제 단일 {EX_SINGLE}ms · 이중 {EX_DUAL}ms면 간섭률 <strong>{EX_DUAL_PCT}%</strong>로 &lsquo;{bandWord(interferenceBand(EX_DUAL_PCT, DUAL_BANDS))}&rsquo;, {Math.round(dualScore(EX_DUAL_PCT))}점이고,
            세 점수를 평균한 종합 점수는 <strong>{EX_TOTAL}점</strong>입니다.
          </p>
          <p className="g-note">판정 구간과 점수 환산은 이 도구가 정한 참고 기준이며, 연령별 규준이 있는 표준화 검사의 점수가 아닙니다.</p>
        </div>

        {/* ── 3. 반응 속도 ── */}
        <div>
          <h2 className="g-h2">
            반응 속도 (Reaction Time)
          </h2>
          <p className="g-p">
            화면 색이 바뀌는 순간 반응하는 시간으로, <strong>눈이 자극을 받아들이고 → 뇌가 알아차리고 → 운동 명령을 내려 → 손가락이 움직이기까지</strong>가 모두 들어 있습니다.
            아래는 이 도구의 등급 구간입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>등급</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>{ROUNDS.reaction - 1}회 평균</th>
                  <th scope="col" style={th}>해석</th>
                </tr>
              </thead>
              <tbody>
                {REACTION_GRADES.map(g => (
                  <tr key={g.key} style={rowBorder}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{g.label}</th>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{gradeRangeText(g)}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{GRADE_NOTE[g.key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            결과에 영향을 주는 요소는 수면·피로·카페인 같은 몸 상태, 나이(대체로 20대에 가장 빠르고 이후 서서히 느려짐), 그리고 기기입니다.
            대규모 측정 연구(Woods 외 2015)에서는 컴퓨터 하드웨어·소프트웨어가 더하는 지연 때문에 같은 사람도 장비에 따라 측정값이 달라진다는 점이 확인됐습니다.
            기기가 더하는 지연의 크기는 아래 &lsquo;정확한 측정의 한계&rsquo;에서 다룹니다.
          </p>
        </div>

        {/* ── 4. 스트룹 효과 ── */}
        <div>
          <h2 className="g-h2">
            스트룹 효과 (Stroop Effect)
          </h2>
          <p className="g-p">
            1935년 미국 심리학자 <strong>J. Ridley Stroop</strong>이 보고한 간섭 현상입니다. 글을 읽을 줄 아는 사람에게 글자 뜻은 저절로 읽히기 때문에,
            뜻과 다른 색을 말해야 할 때는 그 자동 반응을 누르느라 시간이 더 걸립니다.
          </p>
          <ul className="g-list">
            <li><strong>일치(Congruent)</strong> — &lsquo;빨강&rsquo;이 빨간색으로 적힘 → 뜻과 색이 같은 답을 가리켜 빠름</li>
            <li><strong>불일치(Incongruent)</strong> — &lsquo;빨강&rsquo;이 파란색으로 적힘 → 뜻이 색 판단을 방해해 느리고 실수도 늘어남</li>
            <li><strong>간섭 시간</strong> = 불일치 평균 − 일치 평균</li>
          </ul>
          <p className="g-p">
            간섭의 크기는 <strong>답하는 방식</strong>에 따라 크게 달라집니다. 원 실험처럼 소리 내어 색 이름을 말할 때, 키보드 키를 누를 때,
            이 도구처럼 6개 버튼 중 하나를 찾아 누를 때가 모두 다르므로, 다른 사이트나 논문의 수치와 직접 비교하지 마세요.
            임상 신경심리 검사에서는 표준화된 스트룹 검사를 전두엽 실행 기능 평가의 일부로 쓰지만, 그때는 연령별 규준과 정해진 절차가 있습니다.
          </p>
        </div>

        {/* ── 5. 이중 과제 ── */}
        <div>
          <h2 className="g-h2">
            이중 과제 간섭 (Dual-Task Interference)
          </h2>
          <p className="g-p">
            두 작업을 동시에 하면 적어도 한쪽의 반응이 느려지거나 틀리기 쉽습니다. Pashler(1994)는 여러 실험을 검토해, 단순한 두 과제라도
            &lsquo;어떤 반응을 할지 고르는 단계&rsquo;는 한 번에 하나씩만 처리되는 병목이 있다고 정리했습니다. 두 번째 과제는 첫 과제가 그 단계를 지나갈 때까지 기다려야 하는 셈입니다.
          </p>
          <p className="g-p">
            그래서 &lsquo;멀티태스킹&rsquo;의 상당 부분은 실제로는 두 일 사이를 빠르게 오가는 것이고, 오갈 때마다 시간이 손실됩니다.
            아주 익숙해진 동작(걸으면서 말하기)은 거의 간섭 없이 겹칠 수 있지만, 운전 중 통화처럼 둘 다 주의가 필요한 일은 반응이 늦어집니다.
            이 도구의 간섭률은 그 손실을 백분율로 보여 줍니다.
          </p>
        </div>

        {/* ── 6. 측정의 한계 ── */}
        <div>
          <h2 className="g-h2">
            정확한 측정의 한계
          </h2>
          <ul className="g-list">
            <li><strong>화면 주사율</strong> — 60Hz 화면은 한 프레임이 약 16.7ms라 자극이 최대 그만큼 늦게 보일 수 있음(144Hz는 약 6.9ms)</li>
            <li><strong>입력 장치·브라우저</strong> — 마우스·터치·트랙패드의 인식 지연과 브라우저 이벤트 처리 지연이 수 ms~수십 ms 더해짐</li>
            <li><strong>문항 수</strong> — 스트룹은 조건별 {ROUNDS.stroop / 2}문항, 이중 과제는 단일 {ROUNDS.dualSingle}·이중 {ROUNDS.dualDouble}문항이라 한 번의 결과는 우연 오차가 큼</li>
            <li><strong>연습 효과</strong> — 두 번째부터는 규칙에 익숙해져 점수가 좋아지는 것이 정상</li>
          </ul>
          <p className="g-p">
            임상 검사는 통제된 환경, 검증된 장비, 정해진 지시문, 연령별 규준으로 결과를 해석합니다. 이 도구의 결과는
            <strong> 같은 기기로 잰 어제의 나와 오늘의 나를 비교</strong>하거나 친구·가족과 재미로 겨루는 용도로 쓰고, 절대적인 능력 평가나 진단 대용으로 쓰지 마세요.
          </p>
        </div>

        {/* ── 7. 인지 처리 속도와 일상 ── */}
        <div>
          <h2 className="g-h2">
            인지 처리 속도와 일상
          </h2>
          <p className="g-p">
            반응 속도와 주의 전환 능력은 운전 중 돌발 상황 대응, 빠른 판단이 필요한 경기나 게임, 시간 제한이 있는 시험, 여러 요청을 번갈아 처리하는 업무 등에서 체감됩니다.
            다만 수십 ms 차이가 일상에서 결정적인 경우는 드물고, 운전이라면 속도·차간 거리·휴대폰을 보지 않는 습관이 반응 속도보다 훨씬 큰 차이를 만듭니다.
          </p>
          <Callout tone="warn">
            약물이나 보충제로 집중력·인지 능력을 높이려는 시도는 의사와 상담 없이 하지 마세요. 처방 약을 다른 사람에게 받아 복용하는 것은 건강상 위험하고 불법일 수 있습니다.
          </Callout>
        </div>

        {/* ── 8. 본 도구 활용 팁 ── */}
        <div>
          <h2 className="g-h2">
            본 도구 활용 팁
          </h2>
          <ul className="g-list">
            <li><strong>측정 조건 고정</strong> — 같은 기기, 같은 입력 방식(가능하면 데스크톱 마우스·키보드), 비슷한 시간대에 재야 기록끼리 비교할 수 있습니다.</li>
            <li><strong>한 번 연습 후 기록</strong> — 규칙을 익히는 첫 시도는 버리고, 두세 번 잰 평균을 내 기록으로 삼으세요.</li>
            <li><strong>추세로 보기</strong> — 하루 결과보다 몇 주 동안의 흐름이 의미 있습니다. 잠을 못 잔 날 기록이 떨어지는 것도 확인해 볼 만한 흐름입니다.</li>
          </ul>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 계산기',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 계산기',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/edu/sound-speed',       icon: '🔊', name: '음속 계산기',       desc: '천둥·번개 거리·반향·잔향' },
              { href: '/tools/edu/review-interval',   icon: '🧠', name: '복습 간격 계산기',       desc: '망각곡선·SM-2 알고리즘 학습 일정' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',    desc: '추가 교육 도구 더보기' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 11. 참고 자료 ── */}
        <div>
          <h2 className="g-h2">
            참고 자료
          </h2>
          <ul className="g-list">
            <li>Stroop, J.R. (1935). Studies of interference in serial verbal reactions. <em>Journal of Experimental Psychology</em>, 18(6), 643–662.</li>
            <li>Pashler, H. (1994). Dual-task interference in simple tasks: Data and theory. <em>Psychological Bulletin</em>, 116(2), 220–244.</li>
            <li>Woods, D.L. et al. (2015). Factors influencing the latency of simple reaction time. <em>Frontiers in Human Neuroscience</em>, 9, 131.</li>
            <li>Simons, D.J. et al. (2016). Do &ldquo;Brain-Training&rdquo; Programs Work? <em>Psychological Science in the Public Interest</em>, 17(3), 103–186.</li>
          </ul>
        </div>

      </div>
    </ToolPage>
  )
}
