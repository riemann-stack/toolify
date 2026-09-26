/* 상황별 가이드 — 김장·겨울 저장 음식. 배추 포기 수·양념·재료비·일정은 김장 계산기와 같은 kimjangData(calcCabbages·calcIngredients·KIMJANG_SCHEDULE),
   해동 후 조리 권장 시간은 thawingUtils로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { calcCabbages, calcIngredients, CONSUMPTION_PROFILES, INGREDIENTS, KIMJANG_SCHEDULE } from '@/app/tools/cooking/kimjang/kimjangData'
import { FOOD_TIPS } from '@/app/tools/cooking/thawing/thawingUtils'
import { GuideSources, num, won, type CollectionGuide } from './shared'

/** 예시 가구 — 성인 2·아이 2, 김치 소비 '보통' */
const FAMILY = { adults: 2, kids: 2, profileId: 'normal' }
const MONTHS = [2, 3, 4]
const SHOW = ['gochugaru', 'maneul', 'myeoljeot', 'sogeum']

function Body() {
  const profile = CONSUMPTION_PROFILES.find((p) => p.id === FAMILY.profileId) ?? CONSUMPTION_PROFILES[1]
  const rows = MONTHS.map((months) => {
    const cabbages = calcCabbages({ ...FAMILY, months })
    const ing = calcIngredients(cabbages, [])
    return {
      months, cabbages,
      cost: ing.reduce((s, i) => s + i.totalPriceWon, 0),
      shown: SHOW.map((id) => ing.find((i) => i.ing.id === id)).filter((i): i is NonNullable<typeof i> => Boolean(i)),
    }
  })
  const saltPer = INGREDIENTS.find((i) => i.id === 'sogeum')?.perCabbageAmt ?? 0
  const waterPer = INGREDIENTS.find((i) => i.id === 'water')?.perCabbageAmt ?? 0
  const priceNote = INGREDIENTS.find((i) => i.id === 'baechu')?.source ?? ''
  const step = (label: string) => KIMJANG_SCHEDULE.find((s) => s.label.includes(label))
  const salting = step('절이기')
  const ferment = step('실온 발효')
  const fridge = step('김치냉장고')
  const chicken = FOOD_TIPS.find((f) => f.key === 'chicken')
  const meat = FOOD_TIPS.find((f) => f.key === 'beef_pork')

  return (
    <>
      <h2>왜 담그기 → 보관·활용 순서인가</h2>
      <p>
        겨울 저장 음식은 &lsquo;얼마나 오래 먹을지&rsquo;에서 시작합니다. 김장 양은 가족이 하루에 먹는 양과 먹을 기간으로 정해지고, 그 양이 정해져야 김치냉장고와 냉동실에 무엇을 얼마나 넣을 수 있는지가 보입니다.
        그래서 <Link href="/tools/cooking/kimjang">김장 계산기</Link>와 <Link href="/tools/cooking/fruit-syrup">과일청 계산기</Link>로 담글 양을 먼저 정하고, 남은 공간과 재료는 <Link href="/tools/cooking/food-storage">보관 기한</Link>·
        <Link href="/tools/cooking/thawing">해동</Link>·<Link href="/tools/cooking/substitute">대체 재료</Link> 계산으로 관리합니다.
      </p>

      <h2>가족 수로 정하는 김장 양</h2>
      <DataFigure n={1} title={`성인 ${FAMILY.adults}·아이 ${FAMILY.kids} 가구의 김장 양`} unit={`소비 '${profile.label.split(' ')[0]}'`} source={<>계산: 김장 계산기와 같은 식(성인 하루 {profile.adultDailyG}g·아이 {profile.kidDailyG}g, 배추 1포기 ≈ 김치 2.5kg). 재료비는 {priceNote.replace(/\s*\(.*$/, '')} 기준 참고치</>}>
        <table>
          <thead>
            <tr><th scope="col">먹을 기간</th><th scope="col" className="r">배추</th><th scope="col">주요 양념</th><th scope="col" className="r">재료비</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.months}>
                <td>{r.months}개월</td>
                <td className="r">{r.cabbages}포기</td>
                <td className="wrap">{r.shown.map((i) => `${i.ing.name.replace(/\s*\(.*\)$/, '')} ${i.displayAmount}${i.displayUnit}`).join(' · ')}</td>
                <td className="r">약 {won(r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        양념은 배추 포기 수에 비례하므로 먼저 포기 수를 정하면 나머지는 따라옵니다. 절임에는 포기당 굵은소금 약 {saltPer}g과 물 {waterPer}L가 기준이고, 일정은 대개
        {salting ? ` 전날 절이기(${salting.desc.split('.')[0]})` : ''}{ferment ? `, 버무린 뒤 실온 발효(${ferment.desc.replace(/\s*\(.*\)$/, '')})` : ''}{fridge ? `, 이후 김치냉장고(${fridge.desc.split('. ')[1] ?? fridge.desc})` : ''} 순서입니다.
        배추 크기가 기준(절임 전 약 3kg)보다 작으면 포기 수를 늘려야 같은 양이 나옵니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>한 번에 너무 많이 담그기.</strong> 김치는 익을수록 신맛이 강해져 먹는 속도보다 많이 담그면 뒤쪽 몇 달 치는 찌개용이 됩니다. 김치냉장고 용량과 소비량으로 기간을 정하고, 더 필요하면 나눠 담그세요.</li>
        <li><strong>과일청 설탕을 크게 줄이기.</strong> 과일청 계산기의 기본값은 과일과 설탕을 같은 무게로 넣는 것입니다. 설탕을 줄이면 달지 않은 대신 발효·곰팡이 위험이 커지므로 냉장 숙성하고 빨리 먹어야 합니다.</li>
        <li><strong>상온에서 해동하기.</strong> 고기·생선은 냉장 해동이 기본입니다. 해동 계산기 기준으로 닭고기는 해동 뒤 {chicken?.cookingHours ?? 12}시간, 소·돼지고기는 {meat?.cookingHours ?? 24}시간 안에 조리하고, 냉장고 밖(실온·찬물·전자레인지)에서 녹인 것은 다시 얼리지 말고 바로 조리하세요.</li>
        <li><strong>냉동실을 무기한 창고로 쓰기.</strong> 냉동해도 품질은 서서히 떨어집니다. 넣은 날짜를 적어 두고 <Link href="/tools/cooking/food-storage">보관 기한 계산기</Link>로 먹을 순서를 정하세요. 냉장 0~4℃, 냉동 −18℃ 이하 유지가 기본입니다.</li>
      </ul>

      <Callout tone="note" title="식품 안전이 의심될 때">
        색·냄새·곰팡이가 이상하면 계산된 기한과 관계없이 버리는 것이 원칙입니다. 영유아·임산부·노약자가 먹을 음식은 더 보수적으로 판단하고, 식중독 증상이 있으면 병원 진료를 받으세요.
      </Callout>

      <GuideSources
        items={[
          { label: '식품의약품안전처 식품안전나라 — 식품 보관·해동 안내', href: 'https://www.foodsafetykorea.go.kr' },
          { label: '농산물유통정보(KAMIS) — 배추·고춧가루 소매가격', href: 'https://www.kamis.or.kr' },
          { label: '세계김치연구소', href: 'https://www.wikim.re.kr' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '김장과 저장 음식, 양부터 정하기', Body }
export default guide
