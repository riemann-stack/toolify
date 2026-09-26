/* 상황별 가이드 — 다이어트. 예시 수치는 BMI·기초대사량·감량 계산기와 같은 util(bmiUtils·bmrUtils·weightLossUtils)과 견과류 데이터로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { BMI_CATEGORIES, calcBMI, classifyBMI, getWeightRanges } from '@/app/tools/health/bmi/bmiUtils'
import { ACTIVITY_FACTORS, calcMifflin } from '@/app/tools/health/bmr/bmrUtils'
import { calcWeightLossPlan, DANGER_THRESHOLDS, KCAL_PER_KG, SAFE_SPEEDS } from '@/app/tools/health/weightloss/weightLossUtils'
import { NUTS_DATA } from '@/app/tools/cooking/nuts/nutsData'
import { GuideSources, num, type CollectionGuide } from './shared'

/** 예시 — 35세 여성, 163cm·68kg, 가벼운 활동(주 1~3회 운동) */
const P = { gender: 'female' as const, height: 163, weight: 68, age: 35 }

function Body() {
  const bmi = calcBMI(P.height, P.weight)
  const cls = classifyBMI(bmi, 'KOREA')
  const normal = getWeightRanges(P.height, 'KOREA').find((r) => r.id === 'normal')
  const target = normal?.maxWeight ?? P.weight
  const bmr = calcMifflin(P)
  const activity = ACTIVITY_FACTORS.find((a) => a.id === 'light') ?? ACTIVITY_FACTORS[0]
  const tdee = bmr * activity.factor
  const speed = SAFE_SPEEDS.find((s) => s.id === 'slow') ?? SAFE_SPEEDS[0]
  const plan = calcWeightLossPlan({ currentWeight: P.weight, targetWeight: target, height: P.height, gender: P.gender, age: P.age, tdee, speedId: speed.id, startDate: '2026-01-01' })
  const kr = BMI_CATEGORIES.KOREA
  const who = BMI_CATEGORIES.WHO
  const krOver = kr.find((c) => c.id === 'overweight')?.min
  const krObese = kr.find((c) => c.id === 'obese-1')?.min
  const whoOver = who.find((c) => c.id === 'overweight')?.min
  const whoObese = who.find((c) => c.id === 'obese-1')?.min
  // 1회 제공량이 같은(28g) 견과류끼리만 비교 — 브라질너트처럼 제공량이 다른 품목은 뺀다
  const nutServing = NUTS_DATA[0].servingGrams
  const nutKcal = NUTS_DATA.filter((n) => n.servingGrams === nutServing).map((n) => n.caloriePerServing)

  return (
    <>
      <h2>왜 진단 → 목표 → 식단 순서인가</h2>
      <p>
        감량 계획은 두 숫자에서 시작합니다. 지금 체중이 어느 구간인지(BMI), 그리고 하루에 몸이 쓰는 열량이 얼마인지(기초대사량 × 활동계수)입니다. 첫 숫자가 목표 체중을, 둘째 숫자가 하루 섭취량의
        기준을 정합니다. 이 둘 없이 식단부터 바꾸면 너무 적게 먹거나, 줄였는데도 유지 열량보다 많이 먹는 일이 생깁니다. 그래서 <Link href="/tools/health/bmi">BMI</Link>와
        {' '}<Link href="/tools/health/bmr">기초대사량</Link>으로 진단하고, <Link href="/tools/health/weightloss">감량 계산기</Link>로 기간을 정한 다음, 간식·카페인·영양제 같은 세부를 점검합니다.
      </p>
      <p>
        한국 기준은 서양 기준보다 엄격합니다. 대한비만학회 기준은 BMI {krOver} 이상을 과체중(비만 전 단계), {krObese} 이상을 비만으로 보지만, WHO 국제 기준은 각각 {whoOver}, {whoObese}입니다.
        같은 체중이라도 어느 기준을 쓰느냐에 따라 판정이 한 단계 달라질 수 있습니다.
      </p>

      <h2>예시로 보는 숫자</h2>
      <DataFigure n={1} title={`${P.age}세 여성 ${P.height}cm·${P.weight}kg의 감량 계획`} unit={`${activity.name}·주 ${speed.percentPerWeek}% 감량`} source={<>계산: Mifflin-St Jeor 식, 체지방 1kg ≈ {num(KCAL_PER_KG)}kcal 가정 — BMI·기초대사량·감량 계산기와 같은 식</>}>
        <table>
          <thead>
            <tr><th scope="col">항목</th><th scope="col" className="r">값</th></tr>
          </thead>
          <tbody>
            <tr><td>BMI(한국 기준 판정)</td><td className="r">{bmi.toFixed(1)} ({cls.name})</td></tr>
            <tr><td>정상 범위 상한 체중</td><td className="r">{target}kg</td></tr>
            <tr><td>기초대사량</td><td className="r">{num(bmr)}kcal</td></tr>
            <tr><td>하루 유지 열량(× {activity.factor})</td><td className="r">{num(tdee)}kcal</td></tr>
            {plan && <tr><td>하루 줄일 열량</td><td className="r">{num(plan.dailyDeficit)}kcal</td></tr>}
            {plan && <tr><td>목표 섭취량</td><td className="r">{num(plan.targetDailyCalories)}kcal</td></tr>}
            {plan && <tr><td>예상 기간</td><td className="r">약 {plan.weeksRequired}주</td></tr>}
          </tbody>
        </table>
      </DataFigure>
      <p>
        주 {speed.percentPerWeek}%는 체중 {P.weight}kg 기준 일주일에 약 {plan ? plan.weeklyLossKg : '-'}kg입니다. 속도를 두 배로 올리면 기간은 절반이 되지만 하루 섭취량이 크게 내려가 근육 손실과 요요 위험이 커집니다.
        감량 계산기는 여성 {num(DANGER_THRESHOLDS.minDailyKcalFemale)}kcal, 남성 {num(DANGER_THRESHOLDS.minDailyKcalMale)}kcal 아래로 내려가는 계획에 경고를 띄우는데, 목표 섭취량이 이 선에 가깝다면 섭취를 더 줄이기보다 활동량을 늘리는 쪽이 낫습니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>첫 주 감량을 기준으로 삼기.</strong> 시작 직후 줄어드는 체중에는 수분과 글리코겐이 많이 섞여 있습니다. 1kg당 {num(KCAL_PER_KG)}kcal 가정은 체지방 기준이라, 첫 1~2주는 계산보다 빨리 빠지고 이후 느려지는 것이 정상입니다.</li>
        <li><strong>건강 간식이라 양을 안 세기.</strong> 견과류는 한 줌(약 {nutServing}g)에 {Math.min(...nutKcal)}~{Math.max(...nutKcal)}kcal입니다. <Link href="/tools/cooking/nuts">견과류 계산기</Link>로 하루 몇 알인지 정해 두면 간식이 목표 섭취량을 넘기지 않습니다.</li>
        <li><strong>카페인·영양제를 식단 밖으로 보기.</strong> 식욕을 누르려고 마신 커피가 수면을 줄이면 다음 날 식욕이 늘 수 있습니다. 여러 영양제를 함께 먹을 때는 같은 성분이 겹치지 않는지 <Link href="/tools/health/supplement">영양제 계산기</Link>로 확인하세요.</li>
        <li><strong>체중만 보기.</strong> 근력 운동을 병행하면 체중은 천천히 줄어도 허리둘레가 먼저 줄어듭니다. 한 달에 한 번은 허리둘레를 함께 재 두세요.</li>
      </ul>

      <Callout tone="warn" title="의사·영양사와 먼저 상의할 때">
        BMI {krObese} 이상에서 당뇨·고혈압 약을 먹고 있거나, 임신·수유 중이거나, 식사 조절이 폭식과 절식을 오가는 패턴으로 바뀌었다면 계산기 목표보다 진료가 먼저입니다. 약물·수술 치료가 필요한 경우도
        계산기로는 판단할 수 없습니다.
      </Callout>

      <GuideSources
        items={[
          { label: '대한비만학회 — 비만의 진단 기준', href: 'https://general.kosso.or.kr/html/?pmode=obesityDiagnosis' },
          { label: 'WHO — Obesity and overweight (BMI classification)', href: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '다이어트, 계산으로 정하는 목표와 속도', Body }
export default guide
