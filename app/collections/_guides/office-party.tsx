/* 상황별 가이드 — 회식. 정산 예시는 dutchUtils, 혈중알코올 표는 bacUtils(Widmark)·alcoholUtils(소주 도수), 법정 기준은 lib/krDrunkDriving */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcDrinkSplit, calcSimpleSplit } from '@/app/tools/life/dutch/dutchUtils'
import { calcPeakBAC, DECAY_RATES } from '@/app/tools/health/blood-alcohol/bacUtils'
import { KOREAN_DAILY_LOW_RISK_G, SOJU_ABV_ASOF, SOJU_BRANDS, sojuBottleAlcoholG } from '@/app/tools/life/alcohol/alcoholUtils'
import { BAC_THRESHOLDS, BICYCLE_PM_FINES, DRUNK_DRIVING_PENALTY_BY_ID, fmtManwonWon, fmtPenaltyShort } from '@/lib/krDrunkDriving'
import { GuideSources, num, won, type CollectionGuide } from './shared'

const bacPct = (x: number) => `${x.toFixed(3)}%`
const hours = (h: number) => (h <= 0 ? '—' : `약 ${Math.ceil(h * 2) / 2}시간`)

function Body() {
  // 회식 예: 총 32만원 중 술값 12만원, 8명 중 5명이 술을 마심 — 100원 올림
  const party = { total: 320_000, drink: 120_000, people: 8, drinkers: 5 }
  const flat = calcSimpleSplit({ totalAmount: party.total, peopleCount: party.people, rounding: 'exact', remainder: 'common-fund' })
  const split = calcDrinkSplit({ totalAmount: party.total, drinkAmount: party.drink, totalPeople: party.people, drinkers: party.drinkers, rounding: 'ceil-100' })

  // 혈중알코올 예: 가장 흔한 도수의 소주 1·2병, 보통 식사, 분해 속도 '보통'
  const soju = SOJU_BRANDS[0]
  const g1 = sojuBottleAlcoholG(soju.abv)
  const rate = DECAY_RATES.find((d) => d.id === 'normal')?.rate ?? 0.015
  const people = [
    { label: '남성 70kg', sex: 'male' as const, w: 70 },
    { label: '여성 55kg', sex: 'female' as const, w: 55 },
  ]
  const rows = people.flatMap((p) => [1, 2].map((bottles) => {
    const peak = calcPeakBAC({ weightKg: p.w, sex: p.sex, alcoholGrams: g1 * bottles, foodMultiplier: 1 })
    return { key: `${p.label}-${bottles}`, label: p.label, bottles, peak, toSuspend: (peak - BAC_THRESHOLDS.GENERAL_SUSPEND) / rate, toZero: peak / rate }
  }))
  const suspend = DRUNK_DRIVING_PENALTY_BY_ID.suspend
  const revoke = DRUNK_DRIVING_PENALTY_BY_ID.revoke
  const aggravated = DRUNK_DRIVING_PENALTY_BY_ID.aggravated
  // 표에서 가장 무거운 구간(§148조의2③1호)에 드는 예 — 문장이 표 값을 따라가게 계산
  const heavy = rows.filter((r) => r.peak >= BAC_THRESHOLDS.AGGRAVATED)

  return (
    <>
      <h2>왜 정산 규칙을 먼저, 술자리 안전은 끝까지인가</h2>
      <p>
        회식에서 뒷말이 나오는 지점은 대개 계산입니다. 규칙은 술이 들어가기 전, 모두가 맑은 정신일 때 정해야 합니다. 예를 들어 총 {won(party.total)} 가운데 술값이 {won(party.drink)}이고
        {' '}{party.people}명 중 {party.drinkers}명만 마셨다면, 똑같이 나누면 1인당 {won(flat.perPerson)}이지만 술값을 따로 떼면 마시지 않은 사람은 {won(split.nonDrinkerAmount)},
        마신 사람은 {won(split.drinkerAmount)}을 냅니다. <Link href="/tools/life/dutch">더치페이 계산기</Link>의 술값 분리가 이 계산입니다. 메뉴·순서·당번을 정할 때 쓰는
        {' '}<Link href="/tools/life/ladder">사다리</Link>와 <Link href="/tools/life/random">랜덤 뽑기</Link>도 결과가 나오기 전에 규칙(몇 명을, 무엇을 걸고)을 먼저 말해 두어야 공정하다는 인상을 줍니다.
      </p>
      <p>
        안전 단계는 자리의 마지막이 아니라 처음부터 끝까지 이어집니다. 알코올 계산기가 참고 기준으로 쓰는 하루 음주량은 남성 {KOREAN_DAILY_LOW_RISK_G.male}g·여성 {KOREAN_DAILY_LOW_RISK_G.female}g(순수 알코올)인데,
        도수 {soju.abv}% 소주 한 병(360mL)에만 약 {g1}g이 들어 있습니다. <Link href="/tools/life/alcohol">알코올 계산기</Link>로 잔 수를 알코올 양으로 바꿔 보면 페이스를 조절하기 쉽습니다.
      </p>

      <h2>숫자로 보는 다음 날 아침</h2>
      <DataFigure n={1} title={`소주(${soju.abv}%) 1·2병 뒤 혈중알코올 추정`} unit="보통 식사·분해 보통" source={<>계산: Widmark 식, 분해 속도 시간당 {rate}% — 혈중알코올 계산기와 같은 식. 도수 기준 {SOJU_ABV_ASOF}. 개인차 ±20~30%</>}>
        <table>
          <thead>
            <tr><th scope="col">사람</th><th scope="col" className="r">양</th><th scope="col" className="r">최고 추정치</th><th scope="col" className="r">{BAC_THRESHOLDS.GENERAL_SUSPEND}% 아래까지</th><th scope="col" className="r">0까지</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td className="r">{r.bottles}병</td>
                <td className="r">{bacPct(r.peak)}</td>
                <td className="r">{hours(r.toSuspend)}</td>
                <td className="r">{hours(r.toZero)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        시간은 마시기를 끝낸 시각부터 셉니다. 밤 12시까지 두 병을 마셨다면 다음 날 출근길에도 단속 기준을 넘을 수 있다는 뜻입니다. 도로교통법상 처벌은 농도 구간마다 다릅니다(초범 기준).
        {' '}{BAC_THRESHOLDS.GENERAL_SUSPEND}~{BAC_THRESHOLDS.REVOKE}% 미만은 면허정지와 {fmtPenaltyShort(suspend, ' 징역 또는 ')} 벌금,
        {' '}{BAC_THRESHOLDS.REVOKE}~{BAC_THRESHOLDS.AGGRAVATED}% 미만은 면허취소와 {fmtPenaltyShort(revoke, ' 징역 또는 ')} 벌금,
        {' '}{BAC_THRESHOLDS.AGGRAVATED}% 이상은 면허취소와 {fmtPenaltyShort(aggravated, ' 징역 또는 ')} 벌금입니다.
        {heavy.length > 0 && <>{' '}표의 {heavy.map((r) => `${r.label} ${r.bottles}병(${bacPct(r.peak)})`).join(', ')}은 최고치 기준으로 마지막 구간에 듭니다.</>}
        {' '}자전거({fmtManwonWon(BICYCLE_PM_FINES.bicycle.fine)})와 전동킥보드 같은 개인형 이동장치({fmtManwonWon(BICYCLE_PM_FINES.pm.fine)})도 음주 운전은 범칙금 대상입니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>한숨 자면 괜찮다고 여기기.</strong> 잠은 분해 속도를 높이지 않습니다. 표처럼 알코올은 시간당 일정량씩 줄어들 뿐이라, 늦게까지 마셨다면 아침 운전 계획부터 바꿔야 합니다.</li>
        <li><strong>계산값을 운전 허가로 쓰기.</strong> <Link href="/tools/health/blood-alcohol">혈중알코올 계산기</Link>는 체질·식사·약 복용에 따른 차이를 다 담지 못합니다. 결과가 0에 가까워도 술을 마신 날은 운전하지 않는 것이 기준입니다.</li>
        <li><strong>술 안 마신 사람에게 같은 몫을 받기.</strong> 음료만 마신 사람과 술을 마신 사람의 몫 차이는 위 예시에서 1인당 {won(split.drinkerAmount - split.nonDrinkerAmount)}입니다. 매번 반복되면 작은 돈이 아닙니다.</li>
        <li><strong>끝자리를 두고 실랑이하기.</strong> {num(party.people)}명이 나누면 끝자리가 남는 경우가 많습니다. 100원·1,000원 단위 올림으로 걷고 남는 돈은 다음 모임 공금으로 돌리는 식의 규칙을 정해 두세요.</li>
      </ul>

      <Callout tone="warn" title="이럴 때는 계산기 대신">
        수면제·진통제·항우울제 등 약을 먹는 중이거나 평소보다 빨리 취하는 느낌이 든다면 계산값과 상관없이 그날은 마시지 않는 편이 안전합니다. 음주 뒤 의식이 흐려지거나 구토가 멈추지 않는 사람이 있으면
        계산할 때가 아니라 119에 연락할 때입니다.
      </Callout>

      <GuideSources
        items={[
          { label: '국가법령정보센터 — 도로교통법 제44조·제148조의2', href: 'https://www.law.go.kr/법령/도로교통법' },
          { label: '질병관리청 국가건강정보포털', href: 'https://health.kdca.go.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '회식 자리, 정산과 안전의 숫자', Body }
export default guide
