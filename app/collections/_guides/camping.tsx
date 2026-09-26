/* 상황별 가이드 — 캠핑·등산. 산행 시간은 hikingUtils(3개 공식·휴식·일몰 1시간 전 하산 기준), 자외선은 uvProtectionUtils,
   타이어 공기압의 기온 영향은 이상기체 식(절대압 ∝ 절대온도)으로, TPMS 경고선은 공기압 도구의 tpms(자동차규칙 별표 6)로 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calculate, fmtDuration, koreanMin, MOUNTAINS, naismithMin, SUN_AVERAGES, toblerMin } from '@/app/tools/sports/hiking-time/hikingUtils'
import { baseBurnMinutes, SKIN_TYPES } from '@/app/tools/health/uv-protection/uvProtectionUtils'
import { TPMS_DROP_RATIO, tpmsWarnPsi } from '@/lib/krTpms'
import { GuideSources, num, pct, type CollectionGuide } from './shared'

/** 1 psi = 6.894757 kPa, 표준 대기압 101.325 kPa */
const PSI_KPA = 6.894757
const ATM_KPA = 101.325
/** 게이지압(psi)을 t1(℃)에서 맞춘 뒤 t2(℃)가 됐을 때의 게이지압 — 부피 일정 가정 */
function gaugeAt(psi: number, t1: number, t2: number): number {
  const abs1 = psi * PSI_KPA + ATM_KPA
  const abs2 = abs1 * (273.15 + t2) / (273.15 + t1)
  return (abs2 - ATM_KPA) / PSI_KPA
}
/** gaugeAt의 역 — t2(℃)에서 target psi가 되려면 t1(℃)에서 몇 psi였나 */
function gaugeBefore(target: number, t1: number, t2: number): number {
  return gaugeAt(target, t2, t1)
}

function Body() {
  const mt = MOUNTAINS[0]
  const formulas = [
    naismithMin(mt.distanceKm, mt.elevGainM),
    toblerMin(mt.distanceKm, mt.elevGainM, mt.elevLossM),
    koreanMin(mt.distanceKm, mt.elevGainM, mt.elevLossM),
  ]
  const oct = SUN_AVERAGES.find((s) => s.month === 10)?.seoul.set ?? '17:50'
  const plan = calculate({
    distanceKm: mt.distanceKm, elevGainM: mt.elevGainM, elevLossM: mt.elevLossM,
    fitness: 'normal', terrain: 'normal', pack: 'day', group: 'solo', weather: 'normal',
    startTime: '09:00', sunsetTime: oct, restMode: 'auto', manualRestMin: 0,
  })
  const campMonths = [4, 5, 9, 10].map((m) => ({ m, set: SUN_AVERAGES.find((s) => s.month === m)?.seoul.set ?? '' }))
  const skin = SKIN_TYPES.find((s) => s.id === 'III') ?? SKIN_TYPES[0]
  const uv = [5, 8, 10].map((uvi) => ({ uvi, min: baseBurnMinutes(uvi, skin) }))
  const tire = { psi: 35, warm: 20 }
  const cold10 = gaugeAt(tire.psi, tire.warm, tire.warm - 10)
  const cold20 = gaugeAt(tire.psi, tire.warm, tire.warm - 20)
  const warnPsi = tpmsWarnPsi(tire.psi)
  // 20℃ 추운 아침에 경고선에 닿으려면 전날 따뜻할 때 이미 몇 psi였어야 하나
  const lowBefore = gaugeBefore(warnPsi, tire.warm, tire.warm - 20)

  return (
    <>
      <h2>왜 일정 → 짐 → 안전·이동 순서인가</h2>
      <p>
        산과 캠핑장에서는 시간이 곧 안전입니다. 몇 시에 출발해 몇 시에 내려와야 하는지가 정해져야 물·간식·보온 의류를 얼마나 챙길지, 헤드랜턴이 필요한지가 정해집니다. 그래서 첫 단계는
        {' '}<Link href="/tools/sports/hiking-time">산행 시간 계산기</Link>로 코스 시간을 잡는 일이고, 그다음이 <Link href="/tools/life/packing">준비물 체크리스트</Link>입니다. 자외선과 타이어 공기압은
        출발 당일 아침에 확인하는 값이라 마지막에 둡니다.
      </p>

      <h2>산행 시간, 공식마다 다르다</h2>
      <DataFigure n={1} title={`${mt.name} 코스(${mt.distanceKm}km·오르내림 ${mt.elevGainM}m) 이동 시간`} unit="휴식 제외" source={<>계산: 산행 시간 계산기와 같은 식. 표준 코스타임은 계산기 프리셋 값(약 {mt.baseHours}시간)</>}>
        <table>
          <thead>
            <tr><th scope="col">공식</th><th scope="col" className="r">이동 시간</th></tr>
          </thead>
          <tbody>
            {formulas.map((f) => (
              <tr key={f.formula}><td>{f.label}</td><td className="r">{fmtDuration(f.totalMin)}</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        19세기 스코틀랜드에서 나온 Naismith 식은 내리막 시간을 따로 세지 않아, 바위가 많고 경사가 급한 국내 코스에서는 시간을 크게 짧게 잡습니다. 한국 코스타임 식에 50분 걷고 10분 쉬는 휴식을 더하면
        {' '}{fmtDuration(plan.totalMin)}이 나와 표준 코스타임과 비슷해집니다. 계산기는 일몰 1시간 전을 하산 완료 목표로 보는데, 서울 기준 평균 일몰은
        {' '}{campMonths.map((c) => `${c.m}월 ${c.set}`).join(', ')}입니다. 10월에 9시 출발이면 여유가 있지만, 출발이 늦어지거나 일행 중 속도가 느린 사람이 있으면 금방 빠듯해집니다.
      </p>

      <h2>출발 당일 확인할 숫자</h2>
      <p>
        자외선은 <Link href="/tools/health/uv-protection">자외선 차단 시간 계산기</Link> 기준으로 한국인에게 흔한 피부 타입 III가 아무것도 바르지 않았을 때 자외선지수
        {' '}{uv.map((u) => `${u.uvi}에서 약 ${Math.round(u.min)}분`).join(', ')}이면 붉어지기 시작합니다. 자외선은 고도가 높을수록 강해지고 구름이 낀 날에도 상당 부분 통과하므로, 능선 산행이라면 흐린 날에도 차단제를 챙기세요.
      </p>
      <p>
        타이어 공기압은 기온을 탑니다. 기온 {tire.warm}℃에서 {tire.psi}psi로 맞춘 타이어는 10℃ 추운 아침에 약 {num(cold10, 1)}psi, 20℃ 추운 산간 아침에는 약 {num(cold20, 1)}psi까지 내려갑니다.
        약 {pct(1 - cold20 / tire.psi, 0)} 낮아지는 셈이라 이것만으로는 경고등이 켜지지 않지만(국내 TPMS 경고 기준은 권장값의 {pct(TPMS_DROP_RATIO, 0)} 감소, {tire.psi}psi면 약 {num(warnPsi, 1)}psi),
        {' '}{tire.warm}℃에서 이미 약 {num(lowBefore, 1)}psi로 빠져 있던 타이어는 그 아침에 경고선에 닿습니다. 가을 캠핑장에서 아침에만 경고등이 켜진다면 공기압이 원래 부족했다는 신호입니다. <Link href="/tools/unit/tire-pressure">공기압 단위 변환기</Link>로 차량 기준값(운전석 문 안쪽 표기)을 내 게이지 단위로 바꿔 두고, 주행 전 식은 상태에서 재세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>휴식 시간을 빼고 일정을 짜기.</strong> 이동 시간만으로 계획하면 정상 사진·점심·화장실만으로도 하산이 일몰에 걸립니다. 휴식을 포함한 총 소요 시간으로 계획하세요.</li>
        <li><strong>하산을 쉽게 보기.</strong> 내리막은 무릎 부담 때문에 생각보다 느리고, 사고도 피로가 쌓인 하산 길에서 잦습니다. 한국 코스타임 식이 내리막 시간을 따로 더하는 이유입니다.</li>
        <li><strong>차단제를 한 번만 바르기.</strong> 땀·마찰로 지워지기 때문에 계산된 보호 시간은 바른 양이 그대로 남아 있을 때의 이론값입니다. 야외 활동 중에는 두어 시간마다 덧바르세요.</li>
        <li><strong>타이어 옆면의 최대 공기압에 맞추기.</strong> 옆면 숫자는 타이어가 견딜 수 있는 한계이고, 적정값은 차량 제조사 표기입니다.</li>
      </ul>

      <Callout tone="warn" title="출발 전 확인할 공식 정보">
        국립공원은 탐방로별로 입산할 수 있는 시간을 정해 두고(입산시간지정제), 기상특보·산불 조심 기간에는 탐방로를 통제합니다. 출발 전날 국립공원공단 안내와 기상청 산악 날씨를 확인하고,
        조난이나 부상 때는 계산보다 119 신고가 먼저입니다.
        등산로 곳곳의 위치 표지판 번호를 알려 주면 구조가 빨라집니다.
      </Callout>

      <GuideSources
        items={[
          { label: '국립공원공단 — 입산시간지정제', href: 'https://www.knps.or.kr/portal/main/contents.do?menuNo=8000198' },
          { label: '기상청 날씨누리 — 생활기상지수(자외선지수)', href: 'https://www.weather.go.kr/w/forecast/life/life-weather-index.do' },
          { label: 'WHO — Radiation: Ultraviolet (UV)', href: 'https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)' },
          { label: 'NHTSA — Tires (적정 공기압·냉간 측정)', href: 'https://www.nhtsa.gov/equipment/tires' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '캠핑·등산, 출발 전에 재는 시간과 숫자', Body }
export default guide
