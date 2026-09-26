/* 상황별 가이드 — 운동·러닝 루틴. 예시 값은 기초대사량(bmrUtils)·1RM(oneRMUtils)·VDOT/Riegel(lib/running, racePredictorUtils)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { ACTIVITY_FACTORS, calcMifflin } from '@/app/tools/health/bmr/bmrUtils'
import { REP_FACTOR, repFactor } from '@/app/tools/sports/one-rm/oneRMUtils'
import { fmtPace, predictTime } from '@/app/tools/sports/race-predictor/racePredictorUtils'
import { DANIELS_PCT, E_FAST_PCT, paceFromVdot, vdotFromRace } from '@/lib/running'
import { GuideSources, hourMinKo, minSecKo, num, type CollectionGuide } from './shared'

/** 예시 — 30세 남성 175cm·70kg, 주 3~5회 운동, 벤치프레스 60kg×10회, 10km 55분 */
const P = { gender: 'male' as const, height: 175, weight: 70, age: 30 }
const LIFT = { kg: 60, reps: 10 }
const RUN = { km: 10, sec: 55 * 60 }
const HALF_KM = 21.0975
/** 카페인 반감기(시간) — 카페인 계산기의 '보통(성인 평균)' 프리셋과 같은 값 */
const CAFFEINE_HALF_LIFE_H = 5

function Body() {
  const bmr = calcMifflin(P)
  const act = ACTIVITY_FACTORS.find((a) => a.id === 'moderate') ?? ACTIVITY_FACTORS[0]
  const oneRmEpley = LIFT.kg * REP_FACTOR.epley(LIFT.reps)
  const oneRmAvg = LIFT.kg * repFactor('auto', LIFT.reps)
  const vdot = vdotFromRace(RUN.km, RUN.sec)
  const half = predictTime(RUN.km, RUN.sec, HALF_KM)
  // 반복수가 많을수록 공식 간 차이가 커진다 — 5회·15회에서 Epley 대 Brzycki
  const spread = (r: number) => Math.abs(REP_FACTOR.epley(r) - REP_FACTOR.brzycki(r)) / REP_FACTOR.brzycki(r)
  const caffeineLeft = (hours: number) => Math.pow(0.5, hours / CAFFEINE_HALF_LIFE_H)
  const racePace = RUN.sec / RUN.km
  const easyFast = paceFromVdot(vdot, E_FAST_PCT)
  const easySlow = paceFromVdot(vdot, DANIELS_PCT.E)

  return (
    <>
      <h2>왜 기준치 → 근력 → 유산소 → 회복 순서인가</h2>
      <p>
        운동 강도는 대부분 &lsquo;내 최대치의 몇 %&rsquo;로 정합니다. 근력 운동은 1회 최대 중량(1RM)의 비율로, 러닝은 최근 기록에서 구한 VDOT의 비율로 페이스를 잡습니다. 그래서 첫 단계는 몸의 기준치를
        재는 일입니다. <Link href="/tools/health/bmr">기초대사량</Link>은 운동을 늘릴 때 먹는 양을 얼마나 늘려야 하는지 알려 주고, <Link href="/tools/sports/one-rm">1RM</Link>과
        {' '}<Link href="/tools/sports/race-predictor">기록 예측</Link>은 오늘 들 무게와 달릴 속도를 알려 줍니다. 회복을 마지막에 둔 이유는 덜 중요해서가 아니라, 앞 단계의 강도가 정해져야 얼마나 쉬어야 하는지도
        정해지기 때문입니다.
      </p>
      <p>
        양의 기준으로는 세계보건기구(WHO) 2020년 지침이 쓰기 좋습니다. 성인은 일주일에 중강도 유산소 150~300분 또는 고강도 75~150분, 그리고 주 2일 이상 근력 운동을 권합니다. 계획을 짤 때 이 범위를
        먼저 채우고, 기록 향상은 그다음에 욕심내는 편이 오래갑니다.
      </p>

      <h2>예시로 보는 기준치</h2>
      <DataFigure n={1} title={`${P.age}세 남성 ${P.height}cm·${P.weight}kg의 운동 기준치`} source={<>계산: Mifflin-St Jeor, Epley 외 3개 1RM 공식, Daniels VDOT·Riegel·Cameron — 각 계산기와 같은 식</>}>
        <table>
          <thead>
            <tr><th scope="col">항목</th><th scope="col">입력</th><th scope="col" className="r">결과</th></tr>
          </thead>
          <tbody>
            <tr><td>기초대사량</td><td>키·체중·나이</td><td className="r">{num(bmr)}kcal</td></tr>
            <tr><td>하루 소비 열량</td><td>{act.desc}(× {act.factor})</td><td className="r">{num(bmr * act.factor)}kcal</td></tr>
            <tr><td>추정 1RM</td><td>벤치 {LIFT.kg}kg × {LIFT.reps}회</td><td className="r">{num(oneRmEpley)}kg (4개 공식 평균 {num(oneRmAvg, 1)}kg)</td></tr>
            <tr><td>VDOT</td><td>10km {hourMinKo(RUN.sec)}</td><td className="r">{num(vdot, 1)}</td></tr>
            <tr><td>이지런 페이스</td><td>VDOT의 {Math.round(DANIELS_PCT.E * 100)}~{Math.round(E_FAST_PCT * 100)}%</td><td className="r">{fmtPace(easyFast)}~{fmtPace(easySlow)}/km</td></tr>
            <tr><td>하프 예상 기록</td><td>3개 공식 평균</td><td className="r">약 {hourMinKo(half.avg)}</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <p>
        표에서 눈여겨볼 곳은 이지런 페이스입니다. 10km를 km당 {minSecKo(racePace)}에 달린 사람의 쉬운 달리기는 그보다 km당 {minSecKo(easyFast - racePace)}~{minSecKo(easySlow - racePace)} 느립니다. 대부분의 훈련 거리를 이 속도로 쌓고,
        {' '}<Link href="/tools/sports/buildup">빌드업</Link>·<Link href="/tools/sports/interval-training">인터벌</Link>처럼 빠른 훈련은 주 1~2회로 제한하는 것이 부상 없이 기록을 올리는 기본 구조입니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>고반복 세트로 1RM을 추정하기.</strong> 공식마다 가정이 달라 반복수가 늘수록 결과가 벌어집니다. Epley와 Brzycki의 차이는 5회에서 약 {Math.round(spread(5) * 100)}%지만 15회에서는 약 {Math.round(spread(15) * 100)}%입니다. 10회 이하 세트로 추정하세요.</li>
        <li><strong>예측 기록을 목표로 바로 쓰기.</strong> 하프 예상 기록 약 {hourMinKo(half.avg)}은 그 거리를 달릴 만큼 장거리 훈련을 했다는 전제의 값입니다. 10km만 달려 본 상태라면 이보다 느리게 잡는 편이 안전합니다.</li>
        <li><strong>매번 기록 경신을 노리기.</strong> 쉬운 날이 쉬워야 어려운 날이 가능합니다. 이지런을 목표보다 빠르게 달리면 회복이 늦어져 인터벌 품질이 떨어집니다.</li>
        <li><strong>오후 커피를 가볍게 보기.</strong> 카페인 반감기를 {CAFFEINE_HALF_LIFE_H}시간으로 보면 오후 3시에 마신 카페인의 약 {Math.round(caffeineLeft(8) * 100)}%가 밤 11시에도 남아 있습니다. 수면이 줄면 <Link href="/tools/health/sleep-debt">수면 부채</Link>가 쌓이고 회복이 늦어집니다.</li>
      </ul>

      <Callout tone="warn" title="운동을 멈추고 진료를 받을 때">
        운동 중 가슴 통증·어지럼·심한 호흡곤란이 있거나, 고혈압·당뇨·심장 질환으로 치료 중이라면 강도를 올리기 전에 의사와 상의하세요. 관절 통증이 1~2주 넘게 이어질 때도 같은 운동을 반복하기보다
        진료가 먼저입니다.
      </Callout>

      <GuideSources
        items={[
          { label: 'WHO — Guidelines on physical activity and sedentary behaviour (2020)', href: 'https://www.who.int/publications/i/item/9789240015128' },
          { label: 'Mifflin MD et al. (1990) — A new predictive equation for resting energy expenditure', href: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '운동 루틴, 기준치부터 재고 시작하기', Body }
export default guide
