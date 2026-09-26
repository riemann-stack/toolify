/* 상황별 가이드 — 명절 가족 행사. 연휴·연차 표는 징검다리 연휴 계산기와 같은 로직(holidayBridgeUtils)·공휴일 단일 소스(lib/krHolidays)로 빌드 시 계산.
   생성일(한국 날짜) 이후의 설·추석만 싣는다 — 상세 라우트가 하루마다 다시 생성(revalidate)되므로 지난 명절이 '다가오는'에 남지 않는다.
   서버 전용 텍스트라 하이드레이션 불일치 없음. */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { buildDays, buildPlans, DEFAULT_SETTINGS, extractRuns, parseYmd } from '@/app/tools/date/holiday-bridge/holidayBridgeUtils'
import { AGE_BAND_FACTOR } from '@/app/tools/cooking/serving/servingData'
import { calcSimpleSplit, ROUNDING_OPTIONS } from '@/app/tools/life/dutch/dutchUtils'
import { HOLIDAY_YEARS, KOREAN_HOLIDAYS } from '@/lib/krHolidays'
import { LEAVE_MIN_WORKERS } from '@/lib/krLabor'
import { kstTodayStr } from '@/lib/todayInfo'
import { GuideSources, won, type CollectionGuide } from './shared'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const md = (s: string) => { const d = parseYmd(s); return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})` }
const ymdKo = (s: string) => { const d = parseYmd(s); return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일` }

/** 연차를 이만큼까지 붙여 본다 */
const MAX_LEAVE = 3

interface HolidayRow { year: number; name: string; natural: { start: string; end: string; days: number }; best: { start: string; end: string; days: number; leave: string[] } | null; substitute: boolean }

function upcomingHolidays(today: string, limit: number): HolidayRow[] {
  const out: HolidayRow[] = []
  for (const year of HOLIDAY_YEARS.map(Number)) {
    const s = { ...DEFAULT_SETTINGS, year, k: MAX_LEAVE }
    const days = buildDays(s)
    const runs = extractRuns(days)
    const plans = buildPlans(days, runs, MAX_LEAVE)
    for (const name of ['설날', '추석']) {
      const h = KOREAN_HOLIDAYS[year]?.find((x) => x.name.split('·').includes(name))
      if (!h || h.date <= today) continue
      const ri = runs.findIndex((r) => r.startDate <= h.date && h.date <= r.endDate)
      if (ri < 0) continue
      const best = plans
        .filter((p) => p.aRun <= ri && ri <= p.bRun && p.cost > 0)
        .sort((a, b) => b.totalDays - a.totalDays || a.cost - b.cost)[0]
      const substitute = KOREAN_HOLIDAYS[year].some((x) => x.name === `${name} 대체공휴일`)
      out.push({
        year, name, substitute,
        natural: { start: runs[ri].startDate, end: runs[ri].endDate, days: runs[ri].days },
        best: best ? { start: best.startDate, end: best.endDate, days: best.totalDays, leave: best.leaveDates } : null,
      })
    }
  }
  return out.slice(0, limit)
}

function Body() {
  const today = kstTodayStr()
  const rows = upcomingHolidays(today, 4)
  const seolDates = HOLIDAY_YEARS.map(Number)
    .map((y) => KOREAN_HOLIDAYS[y]?.find((x) => x.name === '설날')?.date)
    .filter((d): d is string => Boolean(d))
    .slice(0, 4)
  // 차례 비용 예: 3남매가 437,000원을 1,000원 올림으로 나누고 남는 돈은 공금으로
  const splitEx = { total: 437_000, people: 3 }
  const split = calcSimpleSplit({ totalAmount: splitEx.total, peopleCount: splitEx.people, rounding: 'ceil-1000', remainder: 'common-fund' })
  const roundingName = ROUNDING_OPTIONS.find((o) => o.id === 'ceil-1000')?.name ?? ''

  return (
    <>
      <h2>왜 인원 → 날짜 → 정산 순서인가</h2>
      <p>
        명절 준비에서 가장 먼저 정해야 하는 숫자는 모이는 사람 수입니다. 장보기 양, 음식 가짓수, 누가 얼마를 낼지가 모두 인원에서 출발하기 때문입니다. 다만 아이를 성인 한 명으로
        세면 음식이 크게 남습니다. <Link href="/tools/cooking/serving">인분 계산기</Link>는 초등학생을 성인의 {AGE_BAND_FACTOR.school}인분, 유아를 {AGE_BAND_FACTOR.preschool}인분,
        중·고생을 {AGE_BAND_FACTOR.teen}인분으로 환산하니, 머릿수 대신 이렇게 환산한 인원으로 <Link href="/tools/cooking/holiday-table">상차림 계산기</Link>를 돌리세요.
      </p>
      <p>
        날짜는 인원 다음입니다. 설과 추석은 음력이라 양력 날짜가 해마다 바뀝니다. 음력 1년은 354일 안팎이어서 대개 열흘 남짓 앞당겨지다가, 윤달이 든 해를 지나면 다시 늦어집니다.
        설날만 봐도 {seolDates.map(ymdKo).join(' → ')}로 움직입니다. 날짜가 정해져야 연차와 이동 계획을 세울 수 있고, 비용 정산은 모든 지출이 끝난 뒤에 한 번에 합니다.
      </p>

      <h2>다가오는 명절, 연차를 붙이면</h2>
      <p>
        아래 표는 주 5일 근무·토요일 휴무를 기준으로 공휴일과 주말만으로 쉬는 기간, 그리고 연차를 {MAX_LEAVE}일까지 붙였을 때 가장 길게 이어지는 연휴입니다.
        같은 명절이라도 요일 배치에 따라 연차 1일로 열흘을 쉬는 해가 있고, {MAX_LEAVE}일로도 주말과 이어지지 않는 해가 있습니다.
      </p>
      <DataFigure n={1} title="설·추석 연휴와 연차 활용" unit={`연차 ${MAX_LEAVE}일 이내`} source={<>자료: 관공서의 공휴일에 관한 규정·우주항공청 월력요항 — Youtil 계산(징검다리 연휴 계산기와 같은 로직)</>}>
        <table>
          <thead>
            <tr><th scope="col">명절</th><th scope="col">공휴일+주말</th><th scope="col">연차를 붙이면</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.year}-${r.name}`}>
                <td>{r.year} {r.name}{r.substitute ? ' (대체공휴일 포함)' : ''}</td>
                <td>{md(r.natural.start)}~{md(r.natural.end)} {r.natural.days}일</td>
                <td className="wrap">
                  {r.best
                    ? `${md(r.best.start)}~${md(r.best.end)} ${r.best.days}일 — 연차 ${r.best.leave.length}일(${r.best.leave.map(md).join('·')})`
                    : `연차 ${MAX_LEAVE}일로는 주말과 이어지지 않음`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2>자주 하는 실수</h2>
      <ul>
        <li>
          <strong>모든 직장이 공휴일에 쉰다고 가정하기.</strong> 관공서 공휴일을 유급휴일로 보장하는 규정은 상시 {LEAVE_MIN_WORKERS}명 이상 사업장에 적용됩니다. 그보다 작은 사업장이나 교대 근무자는
          회사 휴무일부터 확인한 뒤 <Link href="/tools/date/holiday-bridge">징검다리 연휴 계산기</Link>에 회사 휴일을 넣어야 표와 같은 결과가 나옵니다.
        </li>
        <li>
          <strong>연차를 늦게 신청하기.</strong> 연차는 근로자가 원하는 날에 쓰는 것이 원칙이지만, 사업 운영에 막대한 지장이 있으면 회사가 시기를 바꿀 수 있습니다. 명절 앞뒤는
          신청이 몰리는 때라 날짜가 정해지는 대로 먼저 신청하는 편이 안전합니다.
        </li>
        <li>
          <strong>정산 규칙을 나중에 정하기.</strong> 예를 들어 차례 비용 {won(splitEx.total)}을 {splitEx.people}남매가 나누면 1인당 {won(split.exactPerPerson)}으로 끝자리가 남습니다.
          {' '}{roundingName}으로 {won(split.perPerson)}씩 걷으면 {won(split.remainder)}이 남으니, 이 돈을 다음 모임 공금으로 둘지 미리 정해 두면 뒷말이 없습니다.
        </li>
      </ul>

      <Callout tone="note" title="직접 확인할 것">
        임시공휴일은 정부가 그때그때 지정하므로 이 표와 계산기에 미리 들어가 있지 않습니다. 발표가 나오면 달력이 바뀔 수 있으니 연휴 직전에 한 번 더 확인하고, 교대·특수 근무라면 회사 근무표를
        기준으로 삼으세요.
      </Callout>

      <GuideSources
        items={[
          { label: '국가법령정보센터 — 관공서의 공휴일에 관한 규정', href: 'https://www.law.go.kr/법령/관공서의공휴일에관한규정' },
          { label: '국가법령정보센터 — 근로기준법 제55조·제60조', href: 'https://www.law.go.kr/법령/근로기준법' },
          { label: '한국천문연구원 천문우주지식정보 — 음양력·월력요항', href: 'https://astro.kasi.re.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '명절 준비, 인원·날짜·비용 순서로', Body }
export default guide
