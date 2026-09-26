/* 상황별 가이드 — 해외여행 준비~귀국. 예산 비교·팁 표·시차는 도구와 같은 데이터(travelBudgetUtils·travelTipUtils·IANA)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { autoFill, calcBudget, DEFAULT_SELECTION, getCity } from '@/app/tools/life/travel-budget/travelBudgetUtils'
import { getCountry, type TipCategory } from '@/app/tools/life/travel-tip/travelTipUtils'
import { DUTY_FREE_LIMIT_USD, US_LIST_CLEARANCE_LIMIT_USD } from '@/lib/krCustoms'
import { TRAVELER_DUTY_FREE as TDF, TRAVELER_NON_REPORT_PENALTY, TRAVELER_SELF_REPORT_RELIEF } from '@/lib/collections'
import { todayStr } from '@/lib/date'
import { GuideSources, num, pct, type CollectionGuide } from './shared'

/** 계산기 기본 선택(도쿄·중간·5일·2인·LCC)에서 계절만 바꾼 예산 — 예비비는 계산기 기본 10% */
function budgetBySeason() {
  const rows = (['low', 'high'] as const).map((season) => {
    const sel = { ...DEFAULT_SELECTION, season }
    const r = calcBudget({ ...sel, ...autoFill(sel), reservePct: 10 })
    const fixed = r.items.filter((i) => i.id === 'flight' || i.id === 'hotel').reduce((s, i) => s + i.total, 0)
    return { season, total: r.total, fixedShare: fixed / r.subTotal }
  })
  return { low: rows[0], high: rows[1] }
}

/** 서울(UTC+9, 서머타임 없음)과의 시차 — 1월·7월 15일 정오 UTC 기준 */
function gapHours(tz: string, month: number): number {
  const year = Number(todayStr().slice(0, 4))
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    .formatToParts(new Date(Date.UTC(year, month - 1, 15, 12)))
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT'
  const m = /GMT([+-]\d+)?(?::(\d+))?/.exec(part)
  const off = m && m[1] ? Number(m[1]) + (m[2] ? Math.sign(Number(m[1])) * Number(m[2]) / 60 : 0) : 0
  return 9 - off
}

/** 한국 기준 표기 — 양수면 현지가 늦고, 음수면 현지가 빠르다 */
const gapLabel = (h: number) => (h === 0 ? '같음' : h > 0 ? `${h}시간 늦음` : `${-h}시간 빠름`)

/** 표의 팁 문화 표기 — 도구 분류(mandatory·optional·rare·no)를 문장형으로 */
const TIP_LABEL: Record<TipCategory, string> = {
  mandatory: '사실상 필수',
  optional: '선택',
  rare: '거의 없음',
  no: '팁 문화 없음',
}

function Body() {
  const b = budgetBySeason()
  const city = getCity(DEFAULT_SELECTION.cityId)
  const seasonUp = b.high.total / b.low.total - 1
  const tips = ['us', 'uk', 'th', 'jp'].map((id) => getCountry(id))
  const zones = [
    { name: '파리', tz: 'Europe/Paris' },
    { name: '뉴욕', tz: 'America/New_York' },
    { name: '시드니', tz: 'Australia/Sydney' },
  ].map((z) => ({ ...z, jan: gapHours(z.tz, 1), jul: gapHours(z.tz, 7) }))

  return (
    <>
      <h2>왜 예산 → 체류 한도 → 현지 → 귀국 순서인가</h2>
      <p>
        여행 경비에서 가장 큰 덩어리는 항공권과 숙박이고, 이 둘은 출발 전에 값이 정해집니다. 계산기 기본값({city.shortName}·중간 스타일·{DEFAULT_SELECTION.days}일·{DEFAULT_SELECTION.people}인·LCC)으로
        돌려 보면 예비비를 빼고도 항공·숙박이 비수기 {pct(b.low.fixedShare, 0)}, 성수기 {pct(b.high.fixedShare, 0)}를 차지하고, 계절만 성수기로 바꿔도 총액이
        {' '}{pct(seasonUp, 0)} 늘어납니다. 그래서 날짜를 정하기 전에 <Link href="/tools/life/travel-budget">예산</Link>부터 잡고, 유럽이라면 같은 단계에서
        {' '}<Link href="/tools/date/schengen">쉥겐 체류일</Link>을 확인합니다. 체류 한도는 항공권을 산 뒤에는 바꾸기 어려운 제약이기 때문입니다.
      </p>
      <p>
        현지 단계의 시차·팁·정산은 매일 반복되는 작은 계산이라 미리 기준만 알아 두면 됩니다. 마지막 귀국 단계는 순서가 바뀌면 안 되는 곳입니다. 면세 한도는
        쇼핑을 끝낸 뒤가 아니라 쇼핑 중에 따져야 하고, 시차 적응은 귀국 직후 며칠의 일정을 좌우합니다.
      </p>

      <h2>단계별로 확인할 숫자</h2>
      <DataFigure n={1} title="단계별 체크 숫자와 기준" source={<>자료: 관세법 시행규칙 제48조, EU 단기체류 규정, 계산기 기본값 — Youtil 계산</>}>
        <table>
          <thead>
            <tr><th scope="col">단계</th><th scope="col">확인할 숫자</th><th scope="col">기준</th></tr>
          </thead>
          <tbody>
            <tr><td>출발 전</td><td>쉥겐 체류일</td><td className="wrap">어느 날이든 직전 180일 안에 90일 이하. 입국일·출국일 모두 하루로 셈</td></tr>
            <tr><td>현지</td><td>한국과의 시차</td><td className="wrap">{zones.map((z) => `${z.name} 1월 ${gapLabel(z.jan)}·7월 ${gapLabel(z.jul)}`).join(' / ')}</td></tr>
            {tips.map((c) => (
              <tr key={c.id}>
                <td>현지</td>
                <td>팁 — {c.shortName}</td>
                <td className="wrap">
                  {TIP_LABEL[c.category]}
                  {c.rates.restaurant?.pct && c.rates.restaurant.pct.max > 0
                    ? ` · 식당 ${c.rates.restaurant.pct.min}~${c.rates.restaurant.pct.max}%`
                    : ''}
                  {c.serviceCharge && c.category !== 'no' ? ' · 계산서에 봉사료 포함 여부 확인' : ''}
                </td>
              </tr>
            ))}
            <tr><td>귀국</td><td>여행자 면세 한도</td><td className="wrap">1인 USD {num(TDF.baseUsd)} + 주류 {TDF.liquorLiters}L·USD {TDF.liquorUsd} 이하, 담배 {TDF.cigarettes}개비, 향수 {TDF.perfumeMl}mL</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        한국은 서머타임이 없어서 유럽·미국과의 시차가 계절에 따라 1시간씩 달라지고, 남반구인 시드니는 반대로 한국의 겨울에 차이가 커집니다. 현지 투어 시작 시각이나
        귀국편 환승 시간을 계산할 때 여름·겨울 중 어느 쪽 시차인지부터 확인하세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li>
          <strong>직구 한도와 여행자 한도를 섞어 쓰기.</strong> 이 가이드에 연결된 <Link href="/tools/life/customs">관부가세 계산기</Link>는 해외직구 기준(소액면세
          USD {DUTY_FREE_LIMIT_USD}, 미국발 목록통관 USD {US_LIST_CLEARANCE_LIMIT_USD})입니다. 직접 들고 들어오는 물건은 1인 USD {num(TDF.baseUsd)} 여행자 한도가 따로
          적용되고, 국내·해외 면세점에서 산 물건도 이 금액에 합산됩니다.
        </li>
        <li>
          <strong>신고를 건너뛰기.</strong> 한도를 넘긴 물건을 자진신고하면 관세의 {pct(TRAVELER_SELF_REPORT_RELIEF.rate, 0)}를 {num(TRAVELER_SELF_REPORT_RELIEF.capWon / 10_000)}만원
          한도에서 줄여 주지만, 신고하지 않다가 적발되면 납부세액의 {pct(TRAVELER_NON_REPORT_PENALTY.rate, 0)}(최근 2년 안에 2회 이상이면 {pct(TRAVELER_NON_REPORT_PENALTY.repeatRate, 0)})가 가산세로 붙습니다.
        </li>
        <li>
          <strong>쉥겐 180일을 달력 반년으로 착각하기.</strong> 1~6월, 7~12월처럼 끊기는 기간이 아니라 매일 뒤로 움직이는 창입니다. 영국·아일랜드는 쉥겐 지역이 아니어서
          그곳에서 보낸 날은 90일에 들어가지 않습니다.
        </li>
        <li>
          <strong>봉사료가 포함된 영수증에 팁을 또 얹기.</strong> 영국·프랑스처럼 봉사료(service charge)를 계산서에 자동으로 붙이는 나라가 많습니다. 금액을 나누기 전에 영수증부터 확인하고,
          일행 정산은 <Link href="/tools/life/dutch">더치페이 계산기</Link>로 한 번에 끝내면 귀국 후 송금 누락이 줄어듭니다.
        </li>
      </ul>
      <p>
        시차 적응은 생체시계를 옮기는 방향에 따라 속도가 다릅니다. 미국 CDC는 늦추는 쪽(서쪽)은 하루 약 1.5시간, 앞당기는 쪽(동쪽)은 하루 약 1시간을 기준으로 봅니다.
        유럽에 갈 때는 시계를 늦추지만 돌아올 때는 앞당겨야 하므로, 같은 시차라도 귀국 뒤 적응이 더 오래 걸리는 경우가 많습니다. 귀국 다음 날 중요한 일정을 잡기 전에
        {' '}<Link href="/tools/date/jet-lag">시차 적응 계산기</Link>로 며칠이 필요한지 먼저 확인하세요.
      </p>

      <Callout tone="note" title="직접 확인하거나 문의할 때">
        고가 시계·카메라처럼 한도를 크게 넘는 물건, 사업용 샘플, 장기 체류 비자처럼 계산기 밖의 판단이 필요한 경우에는 관세청 여행자 휴대품 예상세액 조회와 해당 국가
        대사관 안내를 기준으로 삼으세요. 이 페이지의 표는 규정을 요약한 것이라 예외 품목(농축산물·의약품 등)은 다루지 않습니다.
      </Callout>

      <GuideSources
        items={[
          { label: '관세청 — 여행자 휴대품 통관 안내', href: 'https://customs.go.kr/kcs/cm/cntnts/cntntsView.do?mi=2837&cntntsId=829' },
          { label: '관세청 — 여행자 휴대품 예상 세액 조회', href: 'https://www.customs.go.kr/kcs/ad/tax/ItemTaxCalculation.do' },
          { label: 'EU 집행위원회 — 단기 체류(90/180일) 계산기', href: 'https://ec.europa.eu/assets/home/visa-calculator/calculator.htm' },
          { label: 'CDC Yellow Book — Jet Lag', href: 'https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '해외여행, 단계마다 확인할 숫자', Body }
export default guide
