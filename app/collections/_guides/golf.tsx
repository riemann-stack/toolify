/* 상황별 가이드 — 골프 라운드. 디퍼런셜·핸디캡 산입 개수는 golfHandicapUtils(WHS), 정산은 golfCostUtils(COURSE_PRESETS·TODAY_DEFAULTS),
   거리 환산·바람 보정은 golfDistanceUtils로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcDifferential, getUsedCount, lowRoundAdjustment, MAX_HANDICAP_INDEX } from '@/app/tools/sports/golf-handicap/golfHandicapUtils'
import { COURSE_PRESETS, TODAY_DEFAULTS } from '@/app/tools/sports/golf-cost/golfCostUtils'
import { HEADWIND_PCT_PER_MPH, M_TO_YARD, MPS_TO_MPH, TAILWIND_PCT_PER_MPH } from '@/app/tools/sports/golf-distance/golfDistanceUtils'
import { GuideSources, num, pct, won, type CollectionGuide } from './shared'

const SCORE = 95
const COURSES = [
  { cr: 70.5, slope: 120 },
  { cr: 72.0, slope: 130 },
  { cr: 74.0, slope: 140 },
]
const WIND_MPS = 5
const YARDS = 150
/** WHS 디퍼런셜 표기 — 소수 첫째 자리 반올림(.x5는 올림). toFixed는 16.95를 이진수 16.9499…로 읽어 16.9로 내리므로
    12자리 유효숫자로 정리한 뒤 반올림한다 */
const tenth = (x: number) => (Math.round(Number((x * 10).toPrecision(12))) / 10).toFixed(1)

function Body() {
  const diffs = COURSES.map((c) => ({ ...c, d: calcDifferential(SCORE, c.cr, c.slope) }))
  const counts = [3, 5, 8, 12, 20].map((n) => ({ n, used: getUsedCount(n), adj: lowRoundAdjustment(n) }))
  const p = COURSE_PRESETS.publicWeekend
  const n = TODAY_DEFAULTS.players
  const perPlayer = p.green + p.cart / n + p.caddie / n
  const withExtras = perPlayer + TODAY_DEFAULTS.mealAmount + TODAY_DEFAULTS.shadeAmount / n + TODAY_DEFAULTS.carpoolTotal / n
  const head = WIND_MPS * MPS_TO_MPH * HEADWIND_PCT_PER_MPH
  const tail = WIND_MPS * MPS_TO_MPH * TAILWIND_PCT_PER_MPH

  return (
    <>
      <h2>왜 준비 → 스코어·비용 순서인가</h2>
      <p>
        라운드 전에 알아야 할 숫자는 내 클럽이 실제로 얼마나 가는지입니다. 연습장 표지판은 야드, 국내 코스 거리목은 미터인 경우가 많아 단위부터 맞춰야 하는데, {YARDS}야드는 약 {num(YARDS / M_TO_YARD)}m입니다.
        {' '}<Link href="/tools/sports/golf-distance">비거리 계산기</Link>로 드라이버·7번 아이언 기록에서 클럽별 거리를 정리하고, <Link href="/tools/sports/grip-size">그립 사이즈</Link>로 장비가 손에 맞는지 확인합니다.
        라운드가 끝난 뒤에는 스코어를 <Link href="/tools/sports/golf-handicap">핸디캡</Link>으로 바꿔 실력을 객관화하고, 비용은 <Link href="/tools/sports/golf-cost">라운드 비용 계산기</Link>로 1인당 정산합니다.
      </p>
      <p>
        바람도 거리 계산에 넣어야 합니다. 비거리 계산기의 경험칙(맞바람 시속 1마일당 {pct(HEADWIND_PCT_PER_MPH, 1)}, 뒷바람 {pct(TAILWIND_PCT_PER_MPH, 1)})으로 보면 초속 {WIND_MPS}m 맞바람은 약 {pct(head, 0)} 짧게,
        같은 세기의 뒷바람은 약 {pct(tail, 0)} 길게 보냅니다. 맞바람의 손해가 뒷바람의 이득보다 크다는 점이 클럽 선택에서 중요합니다.
      </p>

      <h2>같은 {SCORE}타, 다른 디퍼런셜</h2>
      <DataFigure n={1} title={`스코어 ${SCORE}타의 코스별 스코어 디퍼런셜`} source={<>계산: WHS 스코어 디퍼런셜 = (조정 스코어 − 코스 레이팅) × 113 ÷ 슬로프 레이팅 — 핸디캡 계산기와 같은 식(PCC 0 가정)</>}>
        <table>
          <thead>
            <tr><th scope="col" className="r">코스 레이팅</th><th scope="col" className="r">슬로프</th><th scope="col" className="r">디퍼런셜</th></tr>
          </thead>
          <tbody>
            {diffs.map((c) => (
              <tr key={`${c.cr}-${c.slope}`}><td className="r">{c.cr.toFixed(1)}</td><td className="r">{c.slope}</td><td className="r">{tenth(c.d)}</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        어려운 코스(레이팅·슬로프가 높은 코스)에서 친 {SCORE}타는 쉬운 코스의 {SCORE}타보다 좋은 기록으로 계산됩니다. 핸디캡 지수는 최근 20개 라운드 가운데 가장 좋은 8개 디퍼런셜의 평균이고, 기록이 적으면
        {' '}{counts.filter((c) => c.n < 20).map((c) => `${c.n}라운드는 ${c.used}개${c.adj ? `(조정 ${c.adj})` : ''}`).join(', ')}만 씁니다. 상한은 {MAX_HANDICAP_INDEX.toFixed(1)}입니다.
        그래서 라운드 수가 적을 때의 핸디캡은 한두 번의 좋은 날에 크게 좌우됩니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>파 합계로 디퍼런셜을 계산하기.</strong> 기준은 파(72)가 아니라 스코어카드의 코스 레이팅과 슬로프입니다. 같은 골프장도 티 박스 색에 따라 값이 다르니 친 티의 값을 넣으세요.</li>
        <li><strong>그린피만 보고 예산을 잡기.</strong> 대중형 주말 평균 그린피 {won(p.green)}에 팀당 카트비 {won(p.cart)}·캐디피 {won(p.caddie)}을 {n}명이 나누면 1인당 {won(perPlayer)}이고, 식사·그늘집·카풀 기름값(계산기 기본값)까지 더하면 약 {won(withExtras)}입니다.</li>
        <li><strong>팀 단위 비용을 1인 비용처럼 나누기.</strong> 카트·캐디피는 팀당, 그린피는 1인당입니다. 3인 라운드라면 팀당 비용의 1인 몫이 커지므로 인원을 정확히 넣어 정산하세요.</li>
        <li><strong>스크린 골프 거리를 필드에 그대로 쓰기.</strong> 비거리 기록은 장소를 나눠 저장하고, 필드 거리는 실제 라운드 기록을 기준으로 삼는 편이 정확합니다.</li>
      </ul>

      <Callout tone="note" title="공식 핸디캡이 필요할 때">
        대회 참가나 클럽 공식 핸디캡은 대한골프협회 등 공인 기관의 기록 제출 절차를 따라야 합니다. 이 계산기는 개인 기록으로 추정하는 용도이며, 경기 중 발생한 코스 조건 보정(PCC)과 홀별 최대 타수 조정은 반영하지 않습니다.
      </Callout>

      <GuideSources
        items={[
          { label: 'World Handicap System (USGA·R&A)', href: 'https://www.whs.com' },
          { label: '대한골프협회(KGA)', href: 'https://www.kgagolf.or.kr' },
          { label: '한국레저산업연구소 — 레저백서(그린피 조사)', href: 'https://www.kole.kr/book' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '골프 라운드, 거리·핸디캡·정산의 숫자', Body }
export default guide
