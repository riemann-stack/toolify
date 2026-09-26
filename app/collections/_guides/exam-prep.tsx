/* 상황별 가이드 — 수능·시험. 복습 간격·SM-2·시험일 역산은 reviewIntervalUtils, 뽀모도로 주기는 pomodoroUtils,
   학점 환산은 gpaData, 수능일은 D-day 도구의 기념일 데이터(koreanHolidays)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { EXAM_NEW_SHARE, examLoad, examMinDays, SIMPLE_INTERVALS, sm2 } from '@/app/tools/edu/review-interval/reviewIntervalUtils'
import { POMODORO_PRESETS } from '@/app/tools/life/pomodoro/pomodoroUtils'
import { convertGpa, crossConvert } from '@/app/tools/edu/gpa-converter/gpaData'
import { SEASONAL_PRESETS } from '@/app/tools/date/dday/koreanHolidays'
import { kstTodayStr } from '@/lib/todayInfo'
import { GuideSources, num, pct, ymdKo, type CollectionGuide } from './shared'

/** SM-2에서 매번 4점(조금 망설였지만 정답)으로 답했을 때의 간격 */
function sm2Sequence(quality: number, rounds: number): number[] {
  let st = { quality, repetitions: 0, ef: 2.5, interval: 0 }
  const out: number[] = []
  for (let i = 0; i < rounds; i++) {
    const o = sm2(st)
    out.push(o.nextInterval)
    st = { quality, repetitions: o.nextRepetitions, ef: o.nextEF, interval: o.nextInterval }
  }
  return out
}
const cumulative = (xs: number[]) => xs.reduce<number[]>((acc, x) => [...acc, (acc[acc.length - 1] ?? 0) + x], [])
/** 시험일 역산 예시 — 외울 항목 300개, 하루 3시간, 항목당 10분 */
const LOAD = { items: 300, hours: 3, minPerItem: 10 }
const GPA = { value: 3.8, scale: '4.5' as const }

function Body() {
  const simple = SIMPLE_INTERVALS.normal
  const smDays = cumulative(sm2Sequence(4, simple.length))
  const load = examLoad(LOAD.items, LOAD.hours, LOAD.minPerItem)
  const minDays = examMinDays(load, LOAD.hours)
  const pomo = POMODORO_PRESETS[0]
  const cycleMin = pomo.focus * pomo.every + pomo.short * (pomo.every - 1) + pomo.long
  // 생성일(한국 날짜) 이후의 수능일만 — 상세 라우트가 하루마다 다시 생성된다 (D-day 도구 프리셋과 같은 데이터 — 교육부 발표: 2027학년도 2026-11-19, 2028학년도 2027-11-18)
  const today = kstTodayStr()
  const exams = SEASONAL_PRESETS.filter((e) => e.category === 'exam' && e.date >= today)
  const linear = convertGpa(GPA.value, GPA.scale, 'linear')
  const wes = convertGpa(GPA.value, GPA.scale, 'wes')

  return (
    <>
      <h2>왜 루틴 → 일정 → 성적 순서인가</h2>
      <p>
        시험 준비에서 가장 오래 쓰는 도구는 매일의 루틴입니다. 얼마나 집중하고 언제 복습할지가 정해져야 남은 날짜로 무엇을 할 수 있는지 계산할 수 있고, 성적 환산은 결과가 나온 뒤의 일입니다.
        {exams.length > 0 ? ` 다가오는 수능은 ${exams.map((e) => ymdKo(e.date)).join(', ')}입니다.` : ''}
        {' '}<Link href="/tools/life/pomodoro">뽀모도로</Link>의 기본값({pomo.focus}분 집중·{pomo.short}분 휴식, {pomo.every}회마다 {pomo.long}분 긴 휴식)으로 한 바퀴를 돌면 {cycleMin}분에 순수 집중 {pomo.focus * pomo.every}분이 들어갑니다.
        하루 공부 시간을 이 단위로 세면 계획과 실제의 차이가 잘 보입니다.
      </p>

      <h2>복습은 언제 하나</h2>
      <DataFigure n={1} title="처음 공부한 날(D+0) 기준 복습 날짜" unit="보통 난이도" source={<>계산: 복습 간격 계산기의 기본 일정과 SM-2(매 회 4점, 시작 쉬움 계수 2.5) — 같은 식</>}>
        <table>
          <thead>
            <tr><th scope="col">회차</th><th scope="col" className="r">기본 일정</th><th scope="col" className="r">SM-2</th></tr>
          </thead>
          <tbody>
            {simple.map((d, i) => (
              <tr key={i}><td>{i + 1}회</td><td className="r">D+{d}</td><td className="r">D+{smDays[i]}</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        두 방식 모두 첫 복습은 다음 날이고, 기억이 단단해질수록 간격이 넓어집니다. 차이는 뒤로 갈수록 커지는데, SM-2는 답할 때의 확신도에 따라 간격을 늘리거나 줄이므로 시험까지 남은 날이 짧다면
        {' '}<Link href="/tools/edu/review-interval">복습 간격 계산기</Link>에 시험일을 넣어 마지막 복습이 시험 직전에 오도록 맞추세요.
      </p>
      <p>
        남은 날이 충분한지도 계산할 수 있습니다. 외울 항목이 {LOAD.items}개, 하루 {LOAD.hours}시간, 항목당 {LOAD.minPerItem}분이면 하루 {load.itemsPerDay}개를 다룰 수 있는데, 계산기는 그 시간의
        {' '}{pct(EXAM_NEW_SHARE, 0)}만 새 항목에 쓰고 나머지는 복습에 쓴다고 봅니다. 그래서 하루 {load.newItemsPerDay}개씩 새로 익히는 데 {load.learnDays}일, 복습까지 합쳐 약 {num(load.totalRequiredHours)}시간이 필요해
        최소 {minDays}일 전에는 시작해야 합니다. 이보다 날이 적다면 범위를 줄이거나 하루 시간을 늘려야 한다는 신호입니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>복습을 &lsquo;다시 읽기&rsquo;로 하기.</strong> 간격 복습은 책을 덮고 떠올려 보는 것이 핵심입니다. 떠올리지 못한 항목만 다시 보면 같은 시간에 더 많은 항목을 점검할 수 있습니다.</li>
        <li><strong>접수·수강신청 시각을 대충 기억하기.</strong> 마감이 있는 일정은 <Link href="/tools/date/dday">D-day</Link>에 등록하고, 선착순 신청은 <Link href="/tools/date/server-time">서버 시간</Link>으로 학교 서버 기준 시각을 확인하세요.</li>
        <li><strong>학점 환산 결과를 하나로 믿기.</strong> {GPA.scale} 만점에 {GPA.value}점은 4.3 만점으로 비례 환산하면 {crossConvert(GPA.value, GPA.scale, '4.3')}이지만, 미국식 4.0 환산은 방법에 따라 {linear.usGpa}(비례)에서 {wes.usGpa}(WES 방식)까지 벌어집니다. 지원처가 정한 방식이 있다면 그것을 따르세요.</li>
        <li><strong>컨디션 기록 없이 밤을 새우기.</strong> <Link href="/tools/edu/cognitive-test">인지 테스트</Link>로 반응 속도를 며칠 재 두면 수면이 부족한 날의 저하를 숫자로 확인할 수 있습니다.</li>
      </ul>

      <Callout tone="note" title="공식 안내를 먼저 확인할 것">
        시험 시간표, 반입 금지 물품, 성적 통지일은 한국교육과정평가원 등 시험 주관 기관의 공고가 기준입니다. 학점 환산은 대학·기관마다 공식 환산표가 따로 있는 경우가 많으니, 제출용 서류라면 학교 학사팀에 확인하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '한국교육과정평가원 — 대학수학능력시험', href: 'https://www.suneung.re.kr' },
          { label: 'SuperMemo — SM-2 알고리즘 원문(Wozniak)', href: 'https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method' },
          { label: 'WES(World Education Services) — 학력·성적 평가', href: 'https://www.wes.org/' },
          { label: '교육부 — 2028학년도 수능 시행일 발표(정책브리핑)', href: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156692078' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '시험 준비, 남은 날을 숫자로 나누기', Body }
export default guide
