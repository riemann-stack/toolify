/* 상황별 가이드 — 홈베이킹·홈카페. 반죽 물 온도는 제빵 타임라인의 calcWaterTemp(DDT), 커피 비율은 brewUtils,
   차 온도는 teaUtils, 계란 시간은 eggUtils로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcWaterTemp } from '@/app/tools/cooking/baking-schedule/bakingUtils'
import { MIXING_METHODS } from '@/app/tools/cooking/baking-schedule/breadPresets'
import { coffeeToWater, getMethod } from '@/app/tools/cooking/brew/brewUtils'
import { getTea } from '@/app/tools/cooking/tea/teaUtils'
import { DONENESS } from '@/app/tools/cooking/egg-timer/eggUtils'
import { GuideSources, minSecKo, num, type CollectionGuide } from './shared'

/** 목표 반죽 온도(℃)와 계절별 실내·밀가루 온도 */
const TARGET_DOUGH = 25
const ROOMS = [18, 23, 28]
/** 베이커 퍼센트 예시 — 밀가루 500g 기준 기본 식빵 계열 배합(예시값) */
const FLOUR = 500
const BAKER = [
  { name: '물', pct: 70 },
  { name: '소금', pct: 2 },
  { name: '인스턴트 이스트', pct: 1 },
]
const COFFEE_G = 20

function Body() {
  const hand = MIXING_METHODS.find((m) => m.id === 'hand')
  const mixer = MIXING_METHODS.find((m) => m.id === 'mixer')
  const rows = ROOMS.map((t) => ({
    t,
    hand: calcWaterTemp({ targetDoughC: TARGET_DOUGH, flourTempC: t, roomTempC: t, hasLevain: false, mixingMethod: 'hand' }).waterTempC,
    mixer: calcWaterTemp({ targetDoughC: TARGET_DOUGH, flourTempC: t, roomTempC: t, hasLevain: false, mixingMethod: 'mixer' }).waterTempC,
  }))
  const drip = getMethod('drip')
  const green = getTea('green')
  const soft = DONENESS.find((d) => d.id === 'soft')
  const hard = DONENESS.find((d) => d.id === 'hard')

  return (
    <>
      <h2>왜 빵 → 디저트 → 브런치·홈카페 순서인가</h2>
      <p>
        빵은 시간이 가장 오래 걸리고 실패했을 때 되돌리기 어려운 작업입니다. 발효는 몇 시간에서 하루가 걸리므로, 완성 시각에서 거꾸로 일정을 짜는 <Link href="/tools/cooking/baking-schedule">제빵 타임라인</Link>이 먼저이고,
        재료는 <Link href="/tools/cooking/baker-percent">베이커 퍼센트</Link>로 밀가루 무게에 맞춰 정합니다. 과자·디저트는 비율만 맞으면 한두 시간 안에 끝나고, 계란·커피·차는 먹기 직전 몇 분의 계산입니다.
        긴 작업을 먼저 걸어 두고 짧은 작업을 그 사이에 끼워 넣는 순서입니다.
      </p>
      <p>
        베이커 퍼센트는 밀가루를 100으로 놓고 나머지를 비율로 적는 방식입니다. 밀가루 {FLOUR}g에 {BAKER.map((b) => `${b.name} ${b.pct}%(${num(FLOUR * b.pct / 100)}g)`).join(', ')}처럼 적어 두면 밀가루 양만 바꿔도
        전체 배합이 그대로 따라옵니다. 레시피를 옮겨 적을 때 이 형식으로 바꿔 두면 틀 크기가 달라져도 다시 계산할 필요가 없습니다.
      </p>

      <h2>계절이 바꾸는 물 온도</h2>
      <DataFigure n={1} title={`반죽 온도 ${TARGET_DOUGH}℃를 맞추는 물 온도`} unit="이스트 반죽·르방 없음" source={<>계산: 제빵 타임라인의 반죽 온도(DDT) 식 — 물 = 목표 × 3 − 밀가루 − 실내 − 마찰열(손반죽 {hand?.friction}℃, 스탠드믹서 {mixer?.friction}℃ 가정)</>}>
        <table>
          <thead>
            <tr><th scope="col">실내·밀가루 온도</th><th scope="col" className="r">손반죽</th><th scope="col" className="r">스탠드믹서</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t}><td>{r.t}℃</td><td className="r">{r.hand}℃</td><td className="r">{r.mixer}℃</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        같은 레시피라도 실내 {rows[0].t}℃와 {rows[rows.length - 1].t}℃에서 넣어야 할 물 온도는 손반죽 기준 {rows[0].hand - rows[rows.length - 1].hand}℃ 차이가 납니다. 반죽 온도가 몇 도만 달라져도 발효 시간이 크게 변하기 때문에, 레시피의 발효 시간이 안 맞는다면 대개 물 온도부터 의심해 볼 만합니다.
        믹서는 반죽하면서 마찰열이 더 생기므로 손반죽보다 차가운 물을 씁니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>부피(컵)로 계량하기.</strong> 밀가루는 담는 방식에 따라 같은 한 컵도 무게가 달라집니다. 베이커 퍼센트와 <Link href="/tools/cooking/recipe">인분 환산</Link>은 무게(g) 계량을 전제로 합니다.</li>
        <li><strong>사워도우 스타터를 아무 때나 쓰기.</strong> 스타터는 먹이를 준 뒤 가장 부풀었을 때가 힘이 좋습니다. <Link href="/tools/cooking/sourdough">사워도우 계산기</Link>로 먹이 비율과 시간을 맞춰 반죽 시각에 정점이 오게 하세요.</li>
        <li><strong>커피 원두와 물을 눈대중으로.</strong> 핸드드립은 원두 1g에 물 {drip.ratioMin}~{drip.ratioMax}g이 흔한 범위로, 원두 {COFFEE_G}g이면 물 약 {num(coffeeToWater(COFFEE_G, drip.ratioDefault))}g, 물 온도는 {drip.tempMin}~{drip.tempMax}℃가 기본값입니다. 쓴맛이 강하면 비율보다 분쇄도·온도를 먼저 바꿔 보세요.</li>
        <li><strong>녹차를 끓는 물로 우리기.</strong> 녹차는 {green.tempMin}~{green.tempMax}℃가 적정 범위라 끓는 물을 바로 부으면 떫은맛이 강해집니다. <Link href="/tools/cooking/tea">차 우리기 계산기</Link>에서 차 종류별 온도·시간을 확인하세요.</li>
      </ul>
      <p>
        계란은 <Link href="/tools/cooking/egg-timer">계란 타이머</Link> 기준(특란을 끓는 물에 넣는 경우)으로 반숙 {soft ? minSecKo(soft.seconds) : ''}, 표준 완숙 {hard ? minSecKo(hard.seconds) : ''} 안팎입니다.
        냉장고에서 바로 꺼낸 계란이나 큰 계란은 시간이 더 걸리므로 계산기에서 시작 온도와 크기를 바꿔 맞추세요.
      </p>

      <Callout tone="note" title="레시피보다 내 오븐을 믿을 때">
        가정용 오븐은 표시 온도와 실제 온도가 다른 경우가 많습니다. 레시피대로 구웠는데 색이 다르다면 오븐 온도계로 실제 온도를 한 번 재 보세요. 식품 알레르기가 있는 사람에게 줄 디저트는 재료 대체 전에
        성분을 꼭 확인하세요.
      </Callout>

      <GuideSources
        items={[
          { label: 'SCA(Specialty Coffee Association) — Brewing standards', href: 'https://sca.coffee/research/protocols-best-practices' },
          { label: 'King Arthur Baking — Baker’s percentage', href: 'https://www.kingarthurbaking.com/pro/reference/bakers-percentage' },
          { label: 'King Arthur Baking — Dough temperature(DDT)', href: 'https://www.kingarthurbaking.com/pro/reference/dough-temperature' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '홈베이킹, 비율과 온도로 실패 줄이기', Body }
export default guide
