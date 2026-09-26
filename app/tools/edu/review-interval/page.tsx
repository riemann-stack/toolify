import Link from 'next/link'
import ReviewIntervalClient from './ReviewIntervalClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  type Difficulty, type Intensity, INTENSITY_MULT, FINAL_REVIEW_OFFSET, scheduleOffsets, buildSimpleSchedule, addDays, sm2,
  CURVE_BASE_STABILITY, CURVE_GROWTH, retention, EXAM_NEW_SHARE, EXAM_REVIEW_RATIO, EXAM_FINISH_BUFFER,
  DAILY_REVIEW_SHARE, DAILY_REVIEW_MAX, examLoad, examMinDays,
} from './reviewIntervalUtils'

export const metadata = buildMetadata({
  path: '/tools/edu/review-interval',
  title: '복습 간격 계산기 — 에빙하우스 망각곡선·SM-2 알고리즘 학습 일정',
  description: '에빙하우스 망각곡선·SM-2 알고리즘으로 다음 복습일을 자동 계산하는 간격 반복 학습 도구. 기억 점수(0~5)별 간격 자동 조정, 시험일 역산 학습량 계획, 학습 항목 관리와 JSON 백업까지 브라우저에서 바로.',
  keywords: ['복습간격계산기', '망각곡선', '에빙하우스', 'SM-2알고리즘', '복습주기', '학습일정', '간격반복학습', '시험공부계획', 'Spaced Repetition', 'Anki'],
})

/* 가이드 표·예시는 계산기와 같은 reviewIntervalUtils의 값·식으로 빌드 시 계산한다 */
const DIFF_LABEL: Record<Difficulty, string> = { easy: '쉬움', normal: '보통', hard: '어려움' }
const INTENS_LABEL = (i: Intensity) => `${{ fast: '빠르게', normal: '보통', relaxed: '여유' }[i]} ×${INTENSITY_MULT[i].toFixed(1)}`
const SCHEDULE_ROWS = (['easy', 'normal', 'hard'] as Difficulty[]).flatMap(d =>
  (['fast', 'normal', 'relaxed'] as Intensity[]).map(i => ({ key: `${d}-${i}`, d, i, days: scheduleOffsets(d, i) })))

/* 시험일 필터 예시 — 보통·보통, 시험이 학습일로부터 EX_EXAM_DAY일 뒤 (기준일은 계산용 임의 날짜) */
const EX_EXAM_DAY = 10
const EX_REF = new Date(2026, 0, 5)
const EX_ROWS = buildSimpleSchedule(EX_REF, 'normal', 'normal', addDays(EX_REF, EX_EXAM_DAY))
const EX_REGULAR = EX_ROWS.filter(r => !r.isFinal).map(r => r.interval)
const EX_FINAL = EX_ROWS.find(r => r.isFinal)?.interval
const EX_DROPPED = scheduleOffsets('normal', 'normal').filter(d => !EX_REGULAR.includes(d))

const SCORE_TEXT = ['전혀 기억 안 남', '거의 기억 안 남', '힌트가 필요했음', '어렵게 기억', '조금 고민 후 기억', '바로 기억']
const SM2_ROWS = [5, 4, 3, 2, 1, 0].map(q => {
  let ef = 2.5, reps = 0, iv = 0
  const seq: number[] = []
  for (let k = 0; k < 5; k++) { const o = sm2({ quality: q, repetitions: reps, ef, interval: iv }); seq.push(o.nextInterval); ef = o.nextEF; reps = o.nextRepetitions; iv = o.nextInterval }
  return { q, firstEF: sm2({ quality: q, repetitions: 0, ef: 2.5, interval: 0 }).nextEF, lastEF: ef, seq }
})
/* 원문처럼 소수 간격을 올림했을 때의 다섯 번째 간격 — '원문과 다른 점' 비교용.
   EF를 0.1씩 더하면 부동소수 오차(3.0000000000000004)가 생겨 50×EF가 151로 올림되므로 6자리에서 먼저 정리한다 */
const ceilClean = (x: number) => Math.ceil(Math.round(x * 1e6) / 1e6)
function fifthIntervalCeil(q: number): number {
  let ef = 2.5, reps = 0, iv = 0
  for (let k = 0; k < 5; k++) { const o = sm2({ quality: q, repetitions: reps, ef, interval: iv }, ceilClean); ef = o.nextEF; reps = o.nextRepetitions; iv = o.nextInterval }
  return iv
}
const SM2_Q4 = SM2_ROWS.find(r => r.q === 4)!
const SM2_Q5 = SM2_ROWS.find(r => r.q === 5)!
const SM2_Q3 = SM2_ROWS.find(r => r.q === 3)!
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)

/* 매일 신규 N개씩 '보통·보통' 일정으로 학습할 때 d일째 복습 항목 수 = N × (d 이하인 복습 간격의 개수) */
const NEW_PER_DAY = 30
const NORMAL_DAYS = scheduleOffsets('normal', 'normal')
const LOAD_ROWS = NORMAL_DAYS.map(day => ({ day, reviews: NEW_PER_DAY * NORMAL_DAYS.filter(k => k <= day).length }))
const STEADY_REVIEWS = NEW_PER_DAY * NORMAL_DAYS.length

/* 시험일 역산 탭 기본값(800개 · 하루 2시간 · 항목당 2분)으로 본 계산 예시 */
const EXAM = { total: 800, hours: 2, perMin: 2 }
const EXAM_LOAD = examLoad(EXAM.total, EXAM.hours, EXAM.perMin)
const EXAM_MIN_DAYS = examMinDays(EXAM_LOAD, EXAM.hours)

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const codeBox: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2, margin: '0 0 16px', overflowX: 'auto' }

const FAQ_LD = [
  {
    q: '복습은 언제 하는 것이 가장 효과적인가요?',
    a: '<strong>&quot;완전히 잊기 직전&quot;</strong>에 다시 떠올리는 것이 효율적입니다. 너무 자주 하면 시간이 낭비되고, 너무 늦으면 처음부터 다시 외워야 합니다. 그래서 간격 반복은 ① 학습 다음 날, ② 3일 후, ③ 7일 후, ④ 14일 후처럼 간격을 점점 늘립니다. 에빙하우스의 원자료에서도 다시 외울 때 절약된 시간 비율(절약률)은 1일 뒤 약 34%, 6일 뒤 약 25%, 31일 뒤 약 21%로 처음 며칠 동안 가장 빠르게 줄었습니다. 시험까지 남은 기간이 길수록 첫 복습 간격도 길게 잡는 편이 유리하다는 연구(Cepeda 외 2008)도 있습니다.',
  },
  {
    q: 'SM-2 알고리즘이 무엇인가요?',
    a: '<strong>SuperMemo 2(SM-2)</strong>는 1987년 폴란드의 Piotr Wozniak이 만든 간격 반복 알고리즘입니다. 항목마다 난이도 계수(EF, 기본 2.5)를 두고, 복습할 때 매긴 기억 점수(0~5)로 EF를 조정해 다음 간격을 &lsquo;이전 간격 × EF&rsquo;로 늘립니다. 공개된 단순한 규칙이라 Anki·Mnemosyne 같은 플래시카드 프로그램이 변형해 써 왔고, Anki는 2023년 23.10 버전부터 FSRS라는 다른 알고리즘도 선택할 수 있게 했습니다.',
  },
  {
    q: '망각곡선은 정말 정확한가요?',
    a: '에빙하우스의 원래 실험은 <strong>자기 자신 한 명</strong>이 무의미 음절 목록을 외운 결과입니다. 2015년 같은 방법으로 재현한 연구(Murre &amp; Dros)도 비슷한 곡선을 얻었지만, <strong>학습 내용·사전 지식·수면·집중도에 따라 실제 망각 속도는 사람마다, 과목마다 크게 다릅니다.</strong> 확실한 것은 &lsquo;처음에 가파르게, 뒤로 갈수록 완만하게&rsquo; 잊는다는 모양과, 간격을 두고 복습하면 오래 남는다는 점입니다. 이 도구의 그래프는 그 원리를 보여 주는 단순 모델이지 개인의 기억을 예측하지 않습니다.',
  },
  {
    q: '매일 새로 학습하면 복습이 너무 많아지지 않나요?',
    a: `많아집니다. 이 도구의 &lsquo;보통·보통&rsquo; 일정(1·3·7·14·30일)으로 매일 신규 ${NEW_PER_DAY}개씩 외우면 복습량은 ${LOAD_ROWS.map(r => `${r.day}일째 ${r.reviews}개`).join(', ')}로 늘다가 <strong>30일째부터 하루 ${STEADY_REVIEWS}개로 고정</strong>됩니다(각 항목이 다섯 번씩 복습되기 때문). 신규 ${NEW_PER_DAY}개를 더하면 하루 ${NEW_PER_DAY + STEADY_REVIEWS}개입니다. 감당이 안 되면 신규 개수를 줄이거나 쉬운 항목은 &lsquo;쉬움&rsquo;·&lsquo;여유&rsquo; 일정으로 돌리세요. <strong>시험일 역산 탭</strong>에서 하루 가능 시간 안에 들어오는지 미리 확인할 수 있습니다.`,
  },
  {
    q: '기억 점수 3점과 4점은 어떻게 구분하나요?',
    a: 'SM-2 원문의 구분을 따르면 <strong>5점</strong>은 망설임 없이 정답, <strong>4점</strong>은 잠깐 고민한 뒤 정답, <strong>3점</strong>은 한참 애써서 겨우 정답입니다. <strong>2점 이하</strong>는 틀렸거나 답을 보고 나서야 떠오른 경우로, 간격이 1일로 초기화됩니다. 점수가 EF를 바꾸므로 후하게 주면 간격이 너무 빨리 늘어 나중에 한꺼번에 잊고, 박하게 주면 불필요한 복습이 늘어납니다. 답을 확인하기 전에 먼저 소리 내어 말하거나 적어 본 뒤 점수를 매기는 것이 가장 정직한 방법입니다.',
  },
]

export default function ReviewIntervalPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/review-interval">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />복습 간격 계산기
      </h1>
      <p className="tp-lead">
        에빙하우스 망각곡선·SM-2 알고리즘으로 <strong style={{ color: 'var(--text)' }}>다음 복습일 자동</strong> + 학습 항목 관리.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="에빙하우스(1885) 절약률 원자료 · SM-2 원 알고리즘(Wozniak) · 학습 기법 효과 리뷰(Dunlosky 외 2013)"
        sources={[
          { label: 'Ebbinghaus, Memory 7장 (York Univ. Classics)', href: 'https://psychclassics.yorku.ca/Ebbinghaus/memory7.htm' },
          { label: 'SuperMemo — SM-2 알고리즘 원문', href: 'https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method' },
          { label: 'Dunlosky 외(2013) 학습 기법 리뷰', href: 'https://doi.org/10.1177/1529100612453266' },
          { label: 'Cepeda 외(2008) 간격 효과 연구', href: 'https://doi.org/10.1111/j.1467-9280.2008.02209.x' },
        ]}
      />

      <ReviewIntervalClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 망각곡선 ── */}
        <div>
          <h2 className="g-h2">
            에빙하우스 망각곡선
          </h2>
          <p className="g-p">
            1885년 독일 심리학자 <strong>헤르만 에빙하우스(Hermann Ebbinghaus)</strong>는 무의미 음절 목록을 외운 뒤 일정 시간이 지나 다시 외우면서,
            처음보다 얼마나 적은 시간으로 다시 외워지는지를 쟀습니다. 아래 표는 그 원자료의 <strong>절약률</strong>(다시 외울 때 줄어든 학습 시간의 비율)로,
            &lsquo;기억하고 있는 비율&rsquo;과는 다른 지표입니다. 절약률은 20분 만에 58%, 하루 만에 34%로 가파르게 떨어지지만, 그 뒤로는 한 달이 지나도 21%까지만 줄어듭니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>학습 후 경과</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>재학습 절약률</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['20분', '58.2%'],
                  ['1시간', '44.2%'],
                  ['약 9시간 (8.8시간)', '35.8%'],
                  ['1일', '33.7%'],
                  ['2일', '27.8%'],
                  ['6일', '25.4%'],
                  ['31일', '21.1%'],
                ].map(([t, r]) => (
                  <tr key={t} style={rowBorder}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{t}</th>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">출처: Ebbinghaus, <em>Memory</em>(1885, 영역 1913) 7장. 13음절 목록 여러 개를 학습한 본인 1명의 평균값입니다.</p>
          <p className="g-p" style={{ marginTop: 16 }}>
            에빙하우스는 이 감소가 경과 시간의 로그에 따라 느려진다고 정리했습니다. 이 도구의 그래프는 원리를 보여 주려고 더 단순한 지수 모델을 씁니다.
          </p>
          <div style={codeBox}>
            <div><span style={{ color: 'var(--muted)' }}># 그래프용 단순 모델</span></div>
            <div>R(t) = e^(−t/S) × 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>R: 기억 유지율(%) · t: 마지막 복습 후 일수 · S: 기억 안정도(처음 {CURVE_BASE_STABILITY}일, 복습할 때마다 ×{CURVE_GROWTH})</div>
          </div>
          <p className="g-p">
            이 모델에서 복습하지 않으면 7일 뒤 유지율은 약 {Math.round(retention(7))}%까지 떨어지고, 복습할 때마다 곡선이 100%로 돌아가며 기울기가 완만해집니다.
            실제 사람의 기억을 예측하는 식이 아니라 &lsquo;간격을 늘려 가며 복습하면 왜 덜 잊는지&rsquo;를 보여 주는 그림으로 보세요.
          </p>
        </div>

        {/* ── 2. 간격 반복 학습 ── */}
        <div>
          <h2 className="g-h2">
            간격 반복 학습 (Spaced Repetition)
          </h2>
          <p className="g-p">
            같은 내용을 한 번에 몰아서 여러 번 보는 것(집중 학습)보다 <strong>시간 간격을 두고 나눠 보는 것(분산 학습)</strong>이 오래 남는다는 &lsquo;간격 효과&rsquo;는
            100년 넘게 반복 확인된 결과입니다. 학습 기법 10가지를 검토한 Dunlosky 외(2013)의 리뷰는 <strong>분산 학습</strong>과
            <strong> 스스로 시험 보기(연습 테스트)</strong> 두 가지만 &lsquo;효용 높음&rsquo;으로 평가했고, 다시 읽기·밑줄 긋기·요약은 &lsquo;효용 낮음&rsquo;으로 분류했습니다.
          </p>
          <p className="g-p">
            간격을 얼마나 둘지는 <strong>언제까지 기억해야 하느냐</strong>에 달려 있습니다. 1,350여 명을 대상으로 한 Cepeda 외(2008)의 실험에서 최적 복습 간격은
            시험이 1주 뒤라면 그 기간의 약 20~40%, 1년 뒤라면 약 5~10%였습니다. 다음 주 쪽지 시험이면 1~3일 뒤 복습이, 1년 뒤 자격시험이면 3주~한 달 간격까지 늘려도 된다는 뜻입니다.
            이 도구의 난이도·강도 선택과 SM-2 점수는 그 간격을 조절하는 손잡이입니다.
          </p>
          <p className="g-p">
            플래시카드 프로그램으로는 <strong>Anki</strong>(오픈소스·무료, 데스크톱·안드로이드), <strong>SuperMemo</strong>(원조), 단어장 앱의 복습 기능 등이 있습니다.
            이 도구는 그런 앱 없이 &lsquo;언제 다시 볼지&rsquo;만 빠르게 정하고 싶을 때, 또는 SM-2가 간격을 어떻게 늘리는지 직접 확인하고 싶을 때 쓰기 좋습니다.
          </p>
        </div>

        {/* ── 3. 간단 복습 일정표 ── */}
        <div>
          <h2 className="g-h2">
            이 도구의 기본 복습 간격표
          </h2>
          <p className="g-p">
            &lsquo;간단 복습 일정&rsquo; 탭은 난이도별 기본 간격에 강도 배율을 곱하고 반올림해(최소 1일) 학습일로부터 며칠 뒤에 복습할지 정합니다.
            아래 표의 숫자는 학습일을 0일로 셌을 때의 복습 날짜(D+n)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>난이도</th>
                  <th scope="col" style={th}>강도</th>
                  {[1, 2, 3, 4, 5].map(n => <th key={n} scope="col" style={{ ...th, textAlign: 'right' }}>{n}차</th>)}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE_ROWS.map(r => (
                  <tr key={r.key} style={{ ...rowBorder, background: r.i === 'normal' ? 'var(--bg2)' : 'transparent' }}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{DIFF_LABEL[r.d]}</th>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{INTENS_LABEL(r.i)}</td>
                    {r.days.map((d, k) => <td key={k} style={{ ...tdNum, textAlign: 'right' }}>{d}일</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            어려움·빠르게 조합은 반올림 때문에 1차와 2차가 같은 날(D+1)로 겹칩니다. 이때 2차는 하루 뒤로 미뤄 해도 됩니다.
            시험일을 넣으면 시험일 당일이나 그 뒤로 넘어가는 회차는 빼고, 마지막 일반 복습보다 뒤라면 <strong>시험 {FINAL_REVIEW_OFFSET.normal}일 전</strong>(어려움은 {FINAL_REVIEW_OFFSET.hard}일 전)에 최종 복습을 하나 더 넣습니다.
            예를 들어 보통·보통으로 공부한 내용의 시험이 {EX_EXAM_DAY}일 뒤라면 {EX_REGULAR.join('·')}일째 복습 후 {EX_FINAL}일째 최종 복습이 잡히고, {EX_DROPPED.join('·')}일째 회차는 표시되지 않습니다.
          </p>
        </div>

        {/* ── 4. SM-2 알고리즘 ── */}
        <div>
          <h2 className="g-h2">
            SM-2 알고리즘 (SuperMemo 2)
          </h2>
          <p className="g-p">
            1987년 폴란드의 <strong>Piotr Wozniak</strong>이 만든 알고리즘입니다(종이로 하던 첫 방식 SM-0는 1985년).
            복습 직후 기억 점수 q(0~5)를 매기면 항목별 난이도 계수 EF가 바뀌고, 세 번째 복습부터는 이전 간격에 EF를 곱해 다음 간격이 정해집니다.
          </p>
          <div style={codeBox}>
            <div><span style={{ color: 'var(--muted)' }}># 이 도구의 계산 순서</span></div>
            <div>EF&apos; = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02)), 최소 1.3</div>
            <div>q &lt; 3 → 반복 횟수 0으로 초기화, 다음 간격 1일</div>
            <div>q ≥ 3 → 1회째 1일, 2회째 6일, 3회째부터 이전 간격 × EF&apos; (반올림)</div>
          </div>
          <p className="g-p">
            아래 표는 새 항목(EF 2.5)이 매번 같은 점수를 받는다고 가정하고 계산기와 같은 식으로 다섯 번 연속 돌린 결과입니다.
            4점을 계속 받으면 EF가 그대로라 간격이 {SM2_Q4.seq.join(' → ')}일로 늘고, 5점이면 EF가 0.1씩 올라 다섯 번째 간격이 {SM2_Q5.seq[4]}일까지 벌어집니다.
            3점이면 EF가 매번 내려가 다섯 번째 간격이 {SM2_Q3.seq[4]}일에 그칩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>점수 q</th>
                  <th scope="col" style={th}>의미</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>첫 복습 뒤 EF</th>
                  <th scope="col" style={th}>같은 점수 5회 연속 시 간격(일)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>5회 누적</th>
                </tr>
              </thead>
              <tbody>
                {SM2_ROWS.map(r => (
                  <tr key={r.q} style={rowBorder}>
                    <th scope="row" style={{ ...tdNum, fontWeight: 700, textAlign: 'left' }}>{r.q}점</th>
                    <td style={td}>{SCORE_TEXT[r.q]}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{r.firstEF.toFixed(2)}</td>
                    <td style={tdNum}>{r.q < 3 ? '매번 1일로 초기화' : r.seq.join(' → ')}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{r.q < 3 ? '—' : `${sum(r.seq)}일`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="원문과 다른 점">
            Wozniak의 원문은 점수가 3 미만이면 &lsquo;EF를 바꾸지 않고&rsquo; 처음부터 다시 시작하라고 적고 있습니다. 이 도구는 여러 구현체처럼 틀린 경우에도 EF를 낮추고,
            간격에는 갱신된 EF를 곱합니다(갱신 전 EF를 쓰는 구현도 있어 같은 점수라도 간격이 하루 이틀 다를 수 있습니다). 또 원문은 4점 미만을 받은 항목을 그날 안에 한 번 더 복습하라고 권하는데,
            이 규칙은 계산에 넣지 않았으니 직접 챙기세요.
            끝으로 원문은 소수 간격을 올림하지만 이 도구는 반올림합니다. 올림으로 계산하면 5점 연속의 다섯 번째 간격은 {fifthIntervalCeil(5)}일(표 {SM2_Q5.seq[4]}일),
            3점 연속은 {fifthIntervalCeil(3)}일(표 {SM2_Q3.seq[4]}일)로, 회차가 쌓일수록 차이가 벌어집니다.
          </Callout>
        </div>

        {/* ── 5. 복습량 ── */}
        <div>
          <h2 className="g-h2">
            매일 새로 외우면 복습량은 얼마나 늘까?
          </h2>
          <p className="g-p">
            간격 반복을 시작하면 처음 한 달은 복습이 계속 쌓입니다. 보통·보통 일정으로 매일 신규 {NEW_PER_DAY}개를 외운다고 하면,
            d일째에 복습할 항목은 &lsquo;그 날짜에 도래한 회차 수 × {NEW_PER_DAY}개&rsquo;입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>학습 시작 후</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>그날 복습</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>신규 포함 합계</th>
                </tr>
              </thead>
              <tbody>
                {LOAD_ROWS.map(r => (
                  <tr key={r.day} style={rowBorder}>
                    <th scope="row" style={{ ...tdNum, fontWeight: 600, textAlign: 'left' }}>{r.day}일째~</th>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{r.reviews}개</td>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{r.reviews + NEW_PER_DAY}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            30일째부터는 매일 다섯 회차가 동시에 돌아와 하루 {STEADY_REVIEWS}개에서 멈춥니다. 복습 한 개는 새로 외우는 것보다 훨씬 빨리 끝나지만,
            처음 계획을 세울 때 신규 개수를 욕심내면 한 달 뒤에 무너지기 쉽습니다. 신규 개수를 하루 가능 시간에서 거꾸로 정하는 편이 안전합니다.
          </p>
        </div>

        {/* ── 6. 시험일 역산 ── */}
        <div>
          <h2 className="g-h2">
            시험일 역산 탭은 어떻게 계산하나요?
          </h2>
          <p className="g-p">
            하루 공부 가능 시간 ÷ 항목당 학습 시간으로 하루 처리량을 구하고, 그 <strong>{EXAM_NEW_SHARE * 100}%를 신규 학습</strong>에, 나머지를 복습에 쓴다고 봅니다.
            복습에 드는 총시간은 신규 학습 시간의 {EXAM_REVIEW_RATIO}배로 어림합니다. 신규 학습이 시험 {EXAM_FINISH_BUFFER}일 전까지 끝나지 않거나, 필요한 총시간이 남은 일수 × 하루 시간을 넘으면
            &lsquo;일정 부족 가능성&rsquo;을 표시합니다.
          </p>
          <p className="g-p">
            기본값(항목 {EXAM.total}개, 하루 {EXAM.hours}시간, 항목당 {EXAM.perMin}분)으로 풀어 보면 하루 처리량 {EXAM_LOAD.itemsPerDay}개 중 신규는 {EXAM_LOAD.newItemsPerDay}개라
            신규 학습에만 {EXAM_LOAD.learnDays}일이 걸립니다. 필요한 시간은 신규 {EXAM_LOAD.totalLearnHours.toFixed(1)}시간 + 복습 {EXAM_LOAD.totalReviewHours.toFixed(1)}시간 = 약 {EXAM_LOAD.totalRequiredHours.toFixed(1)}시간이므로,
            <strong> 시험이 D-{EXAM_MIN_DAYS} 이상 남아야</strong> 이 조건으로 소화됩니다. 그보다 촉박하면 하루 시간을 늘리거나 범위를 줄여야 한다는 신호입니다.
            일별 계획표는 하루 가능 시간을 넘지 않도록 신규 학습 시간을 먼저 떼어 두고, 남은 시간에만 복습(지금까지 익힌 항목의 약 {DAILY_REVIEW_SHARE * 100}%, 최대 {DAILY_REVIEW_MAX}개)을 배정합니다.
          </p>
        </div>

        {/* ── 7. 효과적 복습 ── */}
        <div>
          <h2 className="g-h2">
            효과적인 복습 방법
          </h2>
          <ul className="g-list">
            <li><strong>다시 읽지 말고 떠올리기(인출 연습)</strong> — 책을 덮고 핵심을 적거나 말해 본 뒤 확인합니다. 틀린 것을 확인하는 과정 자체가 기억을 강화합니다.</li>
            <li><strong>나눠서 하기(분산 학습)</strong> — 같은 4시간이라도 하루 몰아서보다 여러 날에 나누는 편이 오래 남습니다. 이 도구가 정해 주는 날짜가 바로 그 분산입니다.</li>
            <li><strong>섞어서 풀기(교차 연습)</strong> — 수학처럼 문제 유형을 고르는 능력이 필요한 과목은 한 유형만 몰아 풀기보다 섞어 풀 때 시험 적응력이 좋아집니다.</li>
            <li><strong>왜 그런지 설명하기</strong> — &lsquo;왜 이게 맞지?&rsquo;를 스스로 묻고 답하거나 남에게 설명하듯 정리하면 기존 지식과 연결되어 잘 잊히지 않습니다.</li>
          </ul>
          <Callout tone="warn" title="공부한 느낌과 실제 기억은 다릅니다">
            밑줄 긋기와 여러 번 다시 읽기는 익숙해진 느낌을 주지만, 연구에서는 기억을 오래 남기는 효과가 작았습니다.
            복습 시간에 책을 다시 읽고 있다면 덮고 떠올리는 방식으로 바꿔 보세요.
          </Callout>
        </div>

        {/* ── 8. 학습 주의사항 ── */}
        <div>
          <h2 className="g-h2">
            학습 시 주의사항
          </h2>
          <p className="g-p">
            기억은 잠자는 동안 정리·강화됩니다. 미국수면의학회 권고는 성인 하루 7시간 이상, 13~18세 청소년 8~10시간으로,
            시험 전날 밤을 새우면 새로 외운 내용이 정리될 시간이 사라지고, 다음 날 시험에 필요한 주의력도 떨어집니다. 복습 일정이 촘촘해도 잠을 줄여 가며 맞추는 것은 손해입니다.
          </p>
          <p className="g-p">
            복습은 짧게, 자주 하는 편이 좋습니다. 한 번에 몇 시간씩 몰아서 하기보다 25~50분 단위로 끊고 쉬는 식이 집중을 유지하기 쉽고,
            휴대폰처럼 주의를 빼앗는 물건은 손이 닿지 않는 곳에 둡니다. 복습 날짜를 놓쳤다면 그날 바로 하면 됩니다 — 하루 이틀 늦는 것은 일정 전체를 다시 짤 이유가 되지 않습니다.
          </p>
        </div>

        {/* ── 9. 활용 팁 ── */}
        <div>
          <h2 className="g-h2">
            본 도구 활용 팁
          </h2>
          <ul className="g-list">
            <li><strong>처음이라면</strong> — 간단 복습 일정 탭에서 보통 난이도·보통 강도로 시작하고, 나온 날짜를 달력이나 플래너에 옮겨 적으세요.</li>
            <li><strong>여러 과목을 관리한다면</strong> — 학습 항목 관리 탭에 항목을 등록하고 매일 &lsquo;오늘 복습할 항목&rsquo;을 확인한 뒤 기억 점수를 정직하게 입력하세요.</li>
            <li><strong>간격을 더 정밀하게</strong> — SM-2 탭에서 점수에 따라 EF와 간격이 어떻게 바뀌는지 확인할 수 있습니다.</li>
            <li><strong>시험이 정해졌다면</strong> — 시험일 역산 탭으로 하루 학습량을 먼저 확인하고, 시험 2일 전 최종 복습 시간을 비워 두세요.</li>
            <li><strong>기록 보관</strong> — 항목은 이 브라우저에만 저장되므로, 기기를 바꾸거나 캐시를 지우기 전에는 백업 다운로드로 JSON 파일을 받아 두세요.</li>
          </ul>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 10. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',              icon: '📅', name: 'D-day 계산기',           desc: '시험·자격증까지 카운트다운' },
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',          desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 계산기',       desc: '8개 행성 몸무게·나이·하루' },
              { href: '/tools/edu/sound-speed',        icon: '🔊', name: '음속 계산기',        desc: '천둥·번개 거리·에코·잔향' },
              { href: '/tools/edu/circuit-simulator',  icon: '⚡', name: '옴의 법칙 계산기',   desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/date/age',               icon: '🎂', name: '만 나이 계산기',         desc: '법 개정 기준 만 나이' },
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

        {/* ── 12. 외부 자원 ── */}
        <div>
          <h2 className="g-h2">
            추천 학습 자원
          </h2>
          <ul className="g-list">
            <li><strong>Anki</strong> — 무료 오픈소스 플래시카드 프로그램 (apps.ankiweb.net)</li>
            <li><strong>SuperMemo</strong> — SM 알고리즘을 만든 원조 프로그램</li>
            <li>책 <em>『어떻게 공부할 것인가』(Make It Stick)</em> — 피터 브라운·헨리 뢰디거·마크 맥대니얼. 인출 연습·간격 학습 연구를 일반인용으로 정리</li>
            <li>논문 Dunlosky 외(2013), <em>Improving Students&apos; Learning With Effective Learning Techniques</em> — 학습 기법 10가지의 근거를 비교한 리뷰</li>
          </ul>
        </div>

      </div>
    </ToolPage>
  )
}
