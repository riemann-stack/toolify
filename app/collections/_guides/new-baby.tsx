/* 상황별 가이드 — 임신·출산 준비. 배란·가임기는 cycleUtils(황체기 14일 모델), 예정일·주수·산전 검사 시기는 pregnancyUtils(280일·Naegele),
   100일·돌은 ageUtils(태어난 날 = 1일째)로 빌드 시 계산. 예시 날짜는 고정값이라 빌드 날짜와 무관 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcCycle, ovulationDayOf } from '@/app/tools/health/cycle/cycleUtils'
import { calcPregnancy, parseYmd, PREGNANCY_TOTAL_DAYS, PRENATAL_TESTS } from '@/app/tools/health/pregnancy/pregnancyUtils'
import { dateAtAge, nthDayDate } from '@/app/tools/date/age/ageUtils'
import { GuideSources, type CollectionGuide } from './shared'

/** 예시 — 마지막 생리 시작일 2026-01-05, 주기 28일, 생리 5일 */
const LMP = '2026-01-05'
const CYCLE = 28
const PERIOD = 5

const md = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`
const ymd = (d: Date) => `${d.getFullYear()}년 ${md(d)}`
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function Body() {
  const lmp = parseYmd(LMP) ?? new Date(2026, 0, 5)
  // 예시 주기의 배란·가임기 — 기준일을 LMP 당일로 고정(오늘 날짜와 무관)
  const cyc = calcCycle({ lastPeriod: lmp, periodLength: PERIOD, avgCycle: CYCLE, today: lmp })
  const preg = calcPregnancy({ inputMode: 'lmp', date: LMP, cycleLength: CYCLE }, addDays(lmp, PREGNANCY_TOTAL_DAYS))
  const due = preg?.dueDate ?? addDays(lmp, PREGNANCY_TOTAL_DAYS)
  const essentials = PRENATAL_TESTS.filter((t) => t.importance === 'essential' || t.id === 'nipt-1').sort((a, b) => a.startWeek - b.startWeek)
  const day100 = nthDayDate(due, 100)
  const firstBirthday = dateAtAge(due, 1)

  return (
    <>
      <h2>왜 계획 → 임신 주수 → 아기 기념일 순서인가</h2>
      <p>
        임신 준비부터 출산 뒤까지의 날짜는 모두 하나의 기준일, 마지막 생리 시작일(LMP)에서 나옵니다. 배란일과 가임기는 이 날짜와 평균 주기로 추정하고, 임신이 되면 임신 주수와 출산예정일도 같은
        날짜에서 셉니다. 그래서 <Link href="/tools/health/cycle">생리 주기 계산기</Link>에 날짜를 꾸준히 기록해 두는 것이 첫 단계이고, 그 기록이 <Link href="/tools/health/pregnancy">임신 주수 계산기</Link>와
        {' '}<Link href="/tools/date/dday">D-day</Link>로 그대로 이어집니다. 아기가 태어나면 기준일이 출생일로 바뀌어 <Link href="/tools/date/age">나이 계산기</Link>로 100일과 돌을 셉니다.
      </p>
      <p>
        예를 들어 마지막 생리가 {ymd(lmp)}에 시작했고 주기가 {CYCLE}일이라면, 다음 생리 14일 전을 배란일로 보는 모델에서 배란 예상일은 주기 {ovulationDayOf(CYCLE)}일째인 {md(cyc.ovulationDate)},
        가임기는 {md(cyc.fertilityStart)}~{md(cyc.fertilityEnd)}입니다. 이 주기에 임신했다면 출산예정일은 LMP에서 {PREGNANCY_TOTAL_DAYS}일 뒤인 {ymd(due)}입니다.
      </p>

      <h2>임신 주수별로 챙길 검사</h2>
      <DataFigure n={1} title={`LMP ${md(lmp)} 기준 주요 산전 검사 시기`} source={<>자료: 임신 주수 계산기의 검사 일정(보건복지부·대한산부인과학회 일반 가이드) — 실제 일정은 담당 의료진이 정함</>}>
        <table>
          <thead>
            <tr><th scope="col">검사</th><th scope="col" className="r">주수</th><th scope="col" className="r">예시 날짜</th></tr>
          </thead>
          <tbody>
            {essentials.map((t) => (
              <tr key={t.id}>
                <td className="wrap">{t.name}</td>
                <td className="r">{t.startWeek}~{t.endWeek}주</td>
                <td className="r">{md(addDays(lmp, t.startWeek * 7))}~{md(addDays(lmp, t.endWeek * 7 + 6))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        임신 주수는 수정일이 아니라 LMP부터 셉니다. 그래서 &lsquo;임신 4주&rsquo;는 수정 뒤 약 2주이고, 예정일인 40주는 수정 뒤 약 38주입니다. 주기가 {CYCLE}일보다 길거나 짧으면 배란이 그만큼 늦거나 빨라지므로,
        계산기에 평균 주기를 넣으면 예정일도 함께 보정됩니다. 첫 초음파로 잰 태아 크기가 LMP 계산과 다르면 의료진은 초음파 기준으로 예정일을 다시 잡기도 합니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>주기가 불규칙한데 달력 계산만 믿기.</strong> 배란일 추정은 주기가 일정하다는 가정입니다. 주기가 들쑥날쑥하다면 배란 테스트기나 기초체온 기록을 함께 쓰는 편이 정확합니다.</li>
        <li><strong>임신 개월 수를 달력 월로 세기.</strong> 국내에서 흔히 말하는 &lsquo;임신 10개월&rsquo;은 4주 단위로 센 것이라 달력 기준 9개월 남짓입니다. 주수로 소통하면 혼동이 없습니다.</li>
        <li><strong>100일을 출생일 + 100일로 세기.</strong> 한국 관행은 태어난 날을 1일째로 셉니다. 예정일인 {md(due)}에 태어난다면 100일은 {ymd(day100)}이고, 첫돌은 {ymd(firstBirthday)}입니다.</li>
        <li><strong>예정일을 확정일로 받아들이기.</strong> 예정일은 40주가 되는 날일 뿐이고, 그 전후 몇 주 안의 출산은 흔합니다. 출산 가방과 이동 계획은 예정일보다 몇 주 앞서 준비해 두세요.</li>
      </ul>

      <Callout tone="note" title="의료진과 기관에 확인할 것">
        검사 시기와 종류는 산모의 나이·병력에 따라 달라지므로 담당 산부인과의 일정이 기준입니다. 임신·출산 진료비 지원, 출산휴가·육아휴직 급여 같은 제도는 금액과 신청 기한이 해마다 바뀔 수 있으니
        정부24·고용노동부·국민건강보험공단 안내에서 최신 내용을 확인하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '질병관리청 국가건강정보포털', href: 'https://health.kdca.go.kr' },
          { label: 'ACOG — Methods for Estimating the Due Date (Committee Opinion 700)', href: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date' },
          { label: '정부24 — 임신·출산 지원 서비스', href: 'https://www.gov.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '임신·출산, 하나의 날짜에서 시작하는 계산', Body }
export default guide
