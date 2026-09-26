import RecipeClient from './RecipeClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { scaleRecipe, convertUnit } from './recipeUtils'
import { INGREDIENT_DENSITY, UNITS, findIngredient, findUnit, type UnitKey } from './ingredientDensity'
import { RECIPE_PRESETS } from './recipePresets'

export const metadata = buildMetadata({
  path: '/tools/cooking/recipe',
  title: '레시피 비율 계산기 — 인분 자동 계산·큰술↔g↔ml 단위 환산',
  description:
    '인분만 바꾸면 모든 재료가 비례 자동 + 큰술↔g↔ml 환산. 양념 보정, 레시피 저장, 장보기 리스트와 한식·양식·일식·중식 프리셋 22종.',
  keywords: [
    '레시피 비율 계산기', '인분 계산', '재료 비율', '큰술 g 환산', '컵 ml 변환',
    '양념 비율', '레시피 저장', '장보기 리스트', '요리 단위 변환', '베이킹 비율',
    '인분 변환', '한식 인분', '레시피 스케일링', '재료 환산', '음식 비율',
  ],
})

/* ── 가이드 표·예시 — 계산기의 recipeUtils·ingredientDensity로 빌드 시 생성 ── */
const g = (name: string, unit: UnitKey) => convertUnit(name, 1, unit, 'g')?.value ?? 0
const DENSITY_NAMES = ['밀가루', '설탕', '소금', '쌀', '물', '우유', '버터', '꿀', '간장', '고추장', '올리브유', '참기름', '고춧가루', '물엿']
const DENSITY_ROWS = DENSITY_NAMES.map(n => ({ name: n, cup: g(n, 'cup'), cupUS: g(n, 'cupUS'), tbsp: g(n, 'tbsp'), tsp: g(n, 'tsp'), d: findIngredient(n)?.gPerMl ?? 1 }))
const DENSITY_COUNT = INGREDIENT_DENSITY.length
const SEASONINGS = INGREDIENT_DENSITY.filter(i => i.isSeasoning).map(i => i.name)
const UNIT_ROWS = UNITS.filter(u => !u.count).map(u => ({
  key: u.key, name: u.name,
  val: u.ml !== undefined ? `${u.ml.toLocaleString()}ml` : u.g !== undefined ? `${u.g.toLocaleString()}g` : `약 ${u.approxG}g`,
  kind: u.ml !== undefined ? '부피' : u.g !== undefined ? '무게' : '어림 (평균값)',
}))

/* 김치찌개 프리셋(2인분) 스케일링 — 양념 보정 '표준(85%)'·'간 약하게(75%)' */
const KJ = RECIPE_PRESETS.find(p => p.id === 'kimchi-jjigae')!
const KJ_ING = KJ.ingredients.map((x, i) => ({ ...x, id: String(i) }))
const scaleKJ = (target: number, ratio: number, reduce = true, half = false) =>
  scaleRecipe(KJ_ING, KJ.basePeople, target, { roundHalfMode: half, reduceSeasoning: reduce, seasoningRatio: ratio })
const KJ_COLS = [
  { label: `${KJ.basePeople}인분 (원본)`, rows: scaleKJ(KJ.basePeople, 1, false) },
  { label: '4인분 · 보정 끔', rows: scaleKJ(4, 1, false) },
  { label: '4인분 · 표준 85%', rows: scaleKJ(4, 0.85) },
  { label: '6인분 · 표준 85%', rows: scaleKJ(6, 0.85) },
  { label: '6인분 · 간 약하게 75%', rows: scaleKJ(6, 0.75) },
]
const KJ_ROWS = KJ_ING.map((ing, i) => ({
  name: ing.name, seasoning: KJ_COLS[2].rows[i].isSeasoning,
  cells: KJ_COLS.map(c => `${c.rows[i].amount}${findUnit(c.rows[i].unit)?.name ?? ''}`),
}))
const soy = (rows: ReturnType<typeof scaleKJ>) => rows.find(r => r.name === '간장')!.amount
const KJ_SOY = { base: soy(KJ_COLS[0].rows), plain4: soy(KJ_COLS[1].rows), std4: soy(KJ_COLS[2].rows), std6: soy(KJ_COLS[3].rows), mild6: soy(KJ_COLS[4].rows), plain6: soy(scaleKJ(6, 1, false)) }
const KJ_HALF3 = soy(scaleKJ(3, 0.85, true, true))
const KJ_RAW3 = soy(scaleKJ(3, 0.85, true, false))
const KJ_PLAIN3 = soy(scaleKJ(3, 1, false))

const PRESET_PICK = ['kimchi-jjigae', 'doenjang-jjigae', 'bulgogi', 'mapo-tofu', 'cream-pasta', 'chicken-salad']
const PRESET_ROWS = PRESET_PICK.map(id => RECIPE_PRESETS.find(p => p.id === id)!).map(p => ({
  id: p.id, name: p.name, base: p.basePeople,
  ing: p.ingredients.slice(0, 4).map(x => `${x.name} ${x.amount}${findUnit(x.unit)?.name ?? ''}`).join(', '),
}))

const FAQ_LD = [
              {
                q: '비율 계산 시 주의할 점은?',
                a: '<strong>양념류(소금·간장·고추장 등)는 단순 배율로 늘리면 짜질 수 있습니다.</strong> 국물 요리는 냄비가 커져도 졸아드는 양이 인분에 비례해 늘지 않아 간이 세지기 쉽고, 마늘·고추 같은 향신료도 배율 그대로 늘리면 향이 과해집니다. 본 도구의 &ldquo;양념 자동 보정&rdquo;을 켜면(기본값) 인분이 늘어날 때 양념·향신료는 늘어나는 양의 85%만 더합니다. 그래도 4인분 이상으로 크게 늘릴 때는 계산값보다 조금 적게 넣고 간을 보며 채우세요.',
              },
              {
                q: '큰술과 그램(g)을 어떻게 변환하나요?',
                a: `재료의 밀도에 따라 다릅니다. 1큰술(15ml)의 무게는 계산기 기준 <code>밀가루 ≈ ${g('밀가루', 'tbsp')}g</code>, <code>설탕 ≈ ${g('설탕', 'tbsp')}g</code>, <code>버터 ≈ ${g('버터', 'tbsp')}g</code>, <code>간장 ≈ ${g('간장', 'tbsp')}g</code>, <code>꿀 ≈ ${g('꿀', 'tbsp')}g</code>입니다. 공식은 무게(g) = 부피(ml) × 밀도(g/ml)이고, <strong>[단위 환산]</strong> 탭에 재료 이름을 넣으면 내장된 ${DENSITY_COUNT}개 재료의 밀도로 바로 바꿔 줍니다. 목록에 없는 재료는 물(1.0g/ml)로 가정하고 그 사실을 함께 표시합니다.`,
              },
              {
                q: '오븐 온도나 조리 시간도 비례해서 늘려야 하나요?',
                a: '아닙니다. <strong>오븐 온도는 인분 수와 무관하게 그대로</strong> 두고, 조리 시간은 재료의 두께·냄비 크기에 따라 조금 늘어날 수 있지만 배율대로 늘리지 않습니다. 국물 요리는 양이 두 배가 되면 끓어오르기까지 시간이 더 걸리므로 &lsquo;끓기 시작한 뒤&rsquo; 시간을 기준으로 삼으세요. 베이킹은 틀 크기·반죽 높이가 시간에 큰 영향을 주므로 틀을 바꿨다면 별도로 조정해야 합니다.',
              },
              {
                q: '베이킹 레시피도 사용할 수 있나요?',
                a: '네. 다만 베이킹은 재료 사이의 비율이 결과를 좌우하므로 <strong>&ldquo;0.5 단위 반올림&rdquo;과 &ldquo;양념 자동 보정&rdquo;을 모두 끄고</strong> 정확한 값을 쓰세요(소금·꿀도 양념으로 인식돼 보정되기 때문). 부피보다 <strong>무게(g)</strong>로 계량하는 편이 훨씬 정확하고, 달걀처럼 개수로 넣는 재료는 반 개 단위가 나오면 풀어서 무게로 나누세요. 배합 자체를 설계하려면 <a href="/tools/cooking/baker-percent">베이커 퍼센트 계산기</a>가 더 적합합니다.',
              },
              {
                q: '미국 레시피의 1컵은 한국 1컵과 같은가요?',
                a: `다릅니다. 한국 가정 계량컵은 <strong>200ml</strong>, 미국 레시피의 컵은 <strong>약 240ml</strong>(영양표시용 법정 컵 240ml, 관습 컵 약 236.6ml)입니다. 계산기에서는 단위를 &lsquo;컵(미국)&rsquo;으로 고르면 240ml로 환산합니다. 밀가루 1컵이 한국 컵이면 약 ${g('밀가루', 'cup')}g, 미국 컵이면 약 ${g('밀가루', 'cupUS')}g으로 20% 차이가 나므로, 해외 레시피는 컵 표기가 어느 쪽인지 먼저 확인하세요. 미국 베이킹 자료는 밀가루를 떠 담는 방식에 따라 1컵을 120~130g 안팎으로 잡기도 해, 가능하면 레시피에 적힌 g 값을 우선하세요.`,
              },
              {
                q: '"꼬집"이나 "줌" 같은 어림 단위는 정확한가요?',
                a: '본 도구는 <strong>1꼬집 ≈ 0.5g, 1줌 ≈ 10g, 약간 ≈ 1g</strong>으로 평균값을 사용합니다. 실제로는 손 크기·재료에 따라 ±50% 차이날 수 있어, 어림 단위는 첫 시도 시 적게 넣고 간을 보며 추가하는 것이 안전합니다. 정확한 베이킹은 어림 단위를 피하고 g 단위로 입력하세요.',
              },
            ]

export default function RecipePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/recipe">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />레시피 비율 계산기
      </h1>
      <p className="tp-lead">
        인분만 바꾸면 모든 재료가 <strong style={{ color: 'var(--text)' }}>비례 자동</strong>. 큰술↔g↔ml 환산과 장보기 리스트까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="한국 계량 1컵 200ml·1큰술 15ml·1작은술 5ml, 미국 컵 240ml · 부피↔무게는 계산기 내장 재료 밀도(g/ml, 가정용 근사값)로 환산"
        sources={[
          { label: 'USDA FoodData Central (재료별 계량 단위 무게)', href: 'https://fdc.nal.usda.gov/' },
          { label: 'King Arthur Baking — Ingredient Weight Chart', href: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        ]}
      />

      <RecipeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 비율 계산 원리 */}
        <section>
          <h2 className="g-h2">레시피 인분 비율 계산 원리</h2>
          <p className="g-p">
            기본 공식은 <code style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>변환량 = 기준량 × (목표 인분 ÷ 기준 인분)</code> 하나입니다. 2인분 100g은 4인분 200g, 2인분 1큰술은 6인분 3큰술이 됩니다.
            계산 결과는 1 미만이면 소수 둘째 자리, 100 미만이면 첫째 자리, 그 이상은 정수로 반올림해 보여 주고, &lsquo;0.5 단위 반올림&rsquo;을 켜면 0.5 단위로 맞춥니다(소량이라 0이 되는 재료는 예외로 원래 자릿수를 유지).
          </p>
          <p className="g-p">
            양념만은 다르게 계산합니다. &lsquo;양념 자동 보정&rsquo;을 켜면 인분이 <strong>늘어날 때만</strong> 양념·향신료의 배율을 <code style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>1 + (배율 − 1) × 보정 비율</code>로 바꿔, 늘어나는 몫에만 보정을 겁니다. 배율 전체에 곱하지 않는 이유는 4→5인분처럼 조금 늘릴 때 양념이 오히려 원래보다 줄어드는 역전을 막기 위해서입니다. 인분을 줄일 때는 보정 없이 그대로 나눕니다.
          </p>
          <Callout tone="warn">
            보정은 &lsquo;짜질 위험&rsquo;을 줄이는 출발점일 뿐입니다. 국물 양·졸이는 시간·재료의 염도(김치·된장은 제품마다 다름)에 따라 간이 달라지니, 계산값보다 조금 적게 넣고 마지막에 간을 보며 채우세요.
          </Callout>
        </section>

        {/* 2. 김치찌개 스케일링 예시 */}
        <section>
          <h2 className="g-h2">예시 — 김치찌개 2인분을 4·6인분으로</h2>
          <p className="g-p">
            계산기에 들어 있는 김치찌개 프리셋({KJ.basePeople}인분)을 늘렸을 때의 실제 결과입니다. 굵게 표시된 재료가 양념으로 인식돼 보정을 받는 항목이고, 나머지 재료는 모든 열에서 정확히 배율대로 늘어납니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>재료</th>
                  {KJ_COLS.map(c => (
                    <th scope="col" key={c.label} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KJ_ROWS.map((r, i) => (
                  <tr key={r.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: r.seasoning ? 700 : 400, whiteSpace: 'nowrap' }}>{r.name}{r.seasoning ? ' (양념)' : ''}</td>
                    {r.cells.map((c, j) => (
                      <td key={j} style={{ padding: '9px 12px', color: r.seasoning && j >= 2 ? 'var(--accent-ink)' : 'var(--text)', fontWeight: r.seasoning && j >= 2 ? 700 : 400, whiteSpace: 'nowrap' }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            4인분이면 간장 {KJ_SOY.base}큰술은 단순 배율로 {KJ_SOY.plain4}큰술이지만 표준 보정에서는 늘어나는 {KJ_SOY.plain4 - KJ_SOY.base}큰술의 85%만 더해 {KJ_SOY.std4}큰술로 나옵니다. 6인분은 {KJ_SOY.plain6}큰술 대신 {KJ_SOY.std6}큰술(간 약하게면 {KJ_SOY.mild6}큰술)입니다.
            단, &lsquo;0.5 단위 반올림&rsquo;을 함께 켜면 보정이 반올림에 묻힐 수 있습니다 — 3인분 간장은 보정값이 {KJ_RAW3}큰술이지만 0.5 단위로 맞추면 {KJ_HALF3}큰술이 되어 단순 배율({KJ_PLAIN3}큰술)과 같아집니다. 계량스푼으로 떠 넣기 편한 값을 원하면 반올림을, 보정을 살리려면 반올림을 끄고 쓰세요.
          </p>
        </section>

        {/* 3. 단위 표준 */}
        <section>
          <h2 className="g-h2">한국 계량 단위와 환산 기준</h2>
          <p className="g-p">
            계산기가 쓰는 단위 정의입니다. 한국 레시피의 1컵은 200ml, 1큰술(밥숟가락이 아닌 계량스푼)은 15ml, 1작은술은 5ml로 1큰술 = 3작은술입니다. 집에서 쓰는 밥숟가락은 한 숟가락이 계량스푼 1큰술보다 적게 담기는 경우가 많으니, 양념은 계량스푼으로 재는 편이 레시피와 맛이 가장 비슷하게 나옵니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '환산', '종류'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UNIT_ROWS.map((u, i) => (
                  <tr key={u.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{u.val}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{u.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 개·반 개·쪽·단 같은 개수 단위는 크기가 제각각이라 무게·부피로 바꾸지 않습니다(인분 비율 계산에는 그대로 적용).
          </p>
        </section>

        {/* 4. 부피 ↔ 무게 환산 */}
        <section>
          <h2 className="g-h2">부피 ↔ 무게 환산 (재료별 밀도)</h2>
          <p className="g-p">
            같은 부피라도 재료에 따라 무게가 크게 다릅니다. 본 도구는 {DENSITY_COUNT}개 재료의 밀도 데이터로 <strong>무게(g) = 부피(ml) × 밀도(g/ml)</strong>를 계산합니다. 아래 값은 계산기가 실제로 내놓는 환산 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1컵 (200ml)', '미국 1컵 (240ml)', '1큰술 (15ml)', '1작은술 (5ml)', '밀도 g/ml'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DENSITY_ROWS.map((row, i) => (
                  <tr key={row.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.name}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.cup}g</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{row.cupUS}g</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.tbsp}g</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{row.tsp}g</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{row.d.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            가루 재료는 담는 방식에 따라 무게가 크게 흔들립니다. 밀가루를 봉지째 푹 떠서 누르면 체에 쳐서 살살 담은 것보다 20% 이상 무거워질 수 있어, 베이킹은 저울 계량을 권합니다. 액체라도 꿀·물엿처럼 점성이 높은 재료는 스푼에 남는 양이 많으니 무게로 재는 편이 정확합니다.
            목록에 없는 재료는 물(1.0g/ml)로 가정해 환산하고 결과 옆에 그 사실을 표시하므로, 튀김가루·빵가루처럼 가벼운 재료는 실제보다 무겁게 나온다는 점을 감안하세요.
          </p>
        </section>

        {/* 5. 양념 자동 보정 */}
        <section>
          <h2 className="g-h2">양념 자동 보정 — 어떤 재료에 적용되나</h2>
          <p className="g-p">
            재료 이름(별칭 포함)으로 양념 여부를 판단합니다. 현재 보정 대상은 다음 {SEASONINGS.length}가지입니다 — {SEASONINGS.join(', ')}. &lsquo;진간장&rsquo;·&lsquo;국간장&rsquo;·&lsquo;마늘&rsquo;처럼 별칭이나 이름 일부가 같아도 인식됩니다.
          </p>
          <p className="g-p">
            보정 강도는 세 단계입니다 — <strong>간 약하게</strong>(늘어나는 양념의 75%만 반영), <strong>표준</strong>(85%, 기본값), <strong>간 진하게</strong>(100%, 단순 배율과 같음). 설탕·식용유·참기름은 양념 목록에 없어 배율대로 늘어나므로, 단맛이나 기름진 정도가 과하다면 직접 줄이세요.
          </p>
        </section>

        {/* 6. 베이킹 vs 일반 요리 */}
        <section>
          <h2 className="g-h2">베이킹 vs 일반 요리 — 비율 정확도</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '일반 요리', '베이킹'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['허용 오차', '±10% 안팎, 간을 보며 조절', '재료 비율이 식감·부풀기를 좌우'],
                  ['계량', '계량스푼·컵으로 충분', '저울(g) 계량 권장'],
                  ['양념 자동 보정', '인분을 늘릴 때 권장', '끄기 (소금·꿀도 보정 대상이라서)'],
                  ['0.5 단위 반올림', '편의상 켜도 무방', '끄고 정확한 값 사용'],
                ].map((r, i) => (
                  <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            베이킹 레시피를 늘릴 때는 재료보다 <strong>틀</strong>이 더 문제입니다. 같은 반죽을 두 배로 만들어 한 틀에 담으면 높이가 달라져 굽는 시간과 온도를 다시 잡아야 하니, 틀을 두 개로 나누는 편이 안전합니다. 정밀한 배합은 <Link href="/tools/cooking/baker-percent">베이커 퍼센트 계산기</Link>를 쓰면 밀가루 기준 비율로 관리할 수 있습니다.
          </p>
        </section>

        {/* 7. 프리셋 */}
        <section>
          <h2 className="g-h2">프리셋 레시피의 기준 인분</h2>
          <p className="g-p">
            계산기에는 한식·양식·일식·중식·디저트·샐러드 {RECIPE_PRESETS.length}가지 프리셋이 들어 있습니다. 프리셋마다 기준 인분이 다르니(파스타·닭가슴살 샐러드는 1인분, 찌개·감자 샐러드는 2인분, 카레는 4인분) 불러온 뒤 목표 인분만 바꾸면 됩니다. 대표 프리셋의 주재료는 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['레시피', '기준', '주재료 (앞 4가지)'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRESET_ROWS.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{p.base}인분</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{p.ing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. 장보기 리스트 */}
        <section>
          <h2 className="g-h2">장보기 리스트 활용</h2>
          <p className="g-p">
            저장한 레시피 여러 개를 각각 원하는 인분으로 골라 [장보기 리스트] 탭에 넣으면, <strong>이름과 단위가 같은 재료</strong>를 합쳐 마트 코너(채소·육류·유제품·곡물·양념 등)별로 묶어 줍니다. 예를 들어 김치찌개와 제육볶음에 모두 들어가는 다진마늘은 한 줄로 합쳐지고, 어느 레시피에서 왔는지도 함께 표시됩니다.
            합산할 때는 양념 보정과 0.5 단위 반올림을 적용하지 않고 배율대로 계산한 값을 더하므로, 장볼 양이 모자라지 않습니다. 단위가 다르면(예: 양파 1개와 양파 100g) 별도 줄로 남으니 레시피를 저장할 때 단위를 통일해 두면 목록이 깔끔해집니다.
          </p>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/cooking/baker-percent',    icon: '🥖', name: '베이커 퍼센트 계산기',    desc: '제빵 정밀 비율·수분율' },
              { href: '/tools/cooking/baking-schedule',  icon: '🍞', name: '제빵 타임라인 계산기',    desc: '발효·굽기 일정 자동' },
              { href: '/tools/cooking/serving',          icon: '🍽️', name: '1인분 분량 계산기',         desc: '재료별 적정 분량' },
              { href: '/tools/cooking/food-storage',     icon: '🧊', name: '식재료 보관 계산기',   desc: '냉장·냉동 유통기한' },
              { href: '/tools/cooking/substitute',       icon: '🔄', name: '식재료 대체 계산기',   desc: '버터·설탕·계란 대체' },
              { href: '/tools/unit/converter',           icon: '⚖️', name: '단위 변환기',              desc: '무게·부피·온도 등 14종 통합 변환' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }} aria-hidden="true">{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul className="g-list">
            <li><a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a> — 식품별 &lsquo;1컵·1큰술&rsquo; 등 계량 단위 무게(부피당 무게로 밀도 확인)</li>
            <li><a href="https://www.kingarthurbaking.com/learn/ingredient-weight-chart" target="_blank" rel="noopener noreferrer">King Arthur Baking — Ingredient Weight Chart</a> — 베이킹 재료의 미국 컵당 무게</li>
          </ul>
          <p className="g-note">
            ※ 밀도는 제품·계량 방식에 따라 달라지는 가정용 근사값입니다. 레시피에 g 값이 적혀 있다면 그 값을 우선하세요.
          </p>
        </section>

      </div>
    </ToolPage>
  )
}
