import Link from 'next/link'
import BakingRecipeClient from './BakingRecipeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import Faq from '@/components/Faq'
import RelatedTools from '@/components/RelatedTools'
import { BAKING_ITEMS, MOLD_PRESETS, INGREDIENT_LABEL, type IngredientKey, type RatioSpec } from './bakingData'
import { scaleRatios, totalWeight, diagnose } from './bakingUtils'
import { HO_PRESETS, HEIGHT_PRESETS, panVolume, convertPan, type PanSpec } from './cakePanData'
import { eggGrade } from '@/lib/krEggGrades'

export const metadata = buildMetadata({
  path: '/tools/cooking/baking-recipe',
  title: '제과 레시피 계산기 — 마들렌·파운드·머핀 비율·분량 변환 + 케이크 팬 호수',
  description: '마들렌·파운드·쿠키·머핀·마카롱 등 제과 10종 비율 자동 + 식감 보정·틀 용량 분량 변환·프리셋 19종. 케이크 팬 탭에서 호수(1호 15cm~)↔cm↔인치, 원형·사각·무스링 부피 기준 레시피 배율과 인원·굽기 보정까지.',
  keywords: ['제과 레시피 계산기', '마들렌 황금비율', '파운드케이크 1:1:1:1', '쿠키 비율', '머핀 비율', '마카롱 비율', '제과 비율', '베이킹 분량 변환', '베이킹 비율 진단', '홈베이킹 계산기',
    '케이크 팬 호수', '케이크 1호 크기', '2호 케이크 사이즈', '베이킹 틀 변환', '레시피 배율 계산', '제누와즈 틀 크기', '무스링 사이즈', '케이크 호수별 인원'],
})

/* ── 가이드 표·예시 숫자는 계산기와 같은 데이터(bakingData·cakePanData)와 함수(scaleRatios·convertPan)로 빌드 시 계산 ── */
type Ratios = Partial<Record<IngredientKey, number>>
const n1 = (v: number) => (Math.round(v * 10) / 10).toString()           // 계산기 fmt(n, 1)과 같은 반올림
const n2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2)
const ml = (v: number) => Math.round(v).toLocaleString('ko-KR')
const listRatios = (r: Ratios, skip?: IngredientKey) =>
  (Object.entries(r) as [IngredientKey, number | undefined][])
    .filter(([k, v]) => k !== skip && v != null && v > 0)
    .map(([k, v]) => `${INGREDIENT_LABEL[k].replace(' (전란)', '')} ${n1(v as number)}`)
    .join(' · ')
const defaultsOf = (id: string): Ratios => {
  const it = BAKING_ITEMS.find((i) => i.id === id) ?? BAKING_ITEMS[0]
  const out: Ratios = {}
  for (const [k, v] of Object.entries(it.typicalRatios) as [IngredientKey, RatioSpec | undefined][]) if (v) out[k] = v.default
  return out
}

// 표 1 — 품목별 기본값(계산기에서 품목을 고르면 채워지는 값)
const ITEM_ROWS = BAKING_ITEMS.map((it) => ({
  id: it.id,
  name: it.name,
  base: INGREDIENT_LABEL[it.defaultBase].replace(' (전란)', ''),
  ratios: listRatios(defaultsOf(it.id), it.defaultBase),
  bake: it.bakingTemp
    ? `${it.bakingTemp.celsius}℃ · ${it.bakingTemp.minutes}분${it.bakingTemp.drying ? ` (굽기 전 ${it.bakingTemp.drying} 건조)` : ''}`
    : '냄비 가열 (오븐 X)',
}))

// 계산 예시 — 클래식 마들렌(계란 100g) → 표준 마들렌틀 12개
const MAD = defaultsOf('madeleine')
const MAD_W = scaleRatios(MAD, 'egg', 100)
const MAD_TOTAL = totalWeight(MAD_W)
const MAD_MOLD = MOLD_PRESETS.madeleine.find((m) => m.name === '표준 마들렌틀') ?? MOLD_PRESETS.madeleine[0]
const MAD_COUNT = 12
const MAD_TARGET = (MAD_MOLD.perPiece ?? 0) * MAD_COUNT
const MAD_FACTOR = MAD_TARGET / MAD_TOTAL
const MAD_BUTTER_G = 90                                     // '버터가 90g뿐' 예시
const MAD_BY_BUTTER = scaleRatios(MAD, 'butter', MAD_BUTTER_G)
const MAD_EXAMPLE_ROWS = (Object.keys(MAD_W) as IngredientKey[]).map((k) => ({
  k, label: INGREDIENT_LABEL[k], pct: MAD[k] ?? 0, g: MAD_W[k] ?? 0, scaled: (MAD_W[k] ?? 0) * MAD_FACTOR,
}))

// 표 3 — 클래식 동량 배합 vs 제과기능사 실기 공개문제 배합(마드레느·파운드케이크는 박력분 100 기준)을 계산기의 기준 재료로 환산
// extras: 계산기 입력 항목에 없는 시험 재료 — 환산 열에서도 같은 배율(100 ÷ 시험 배합의 기준 재료 %)로 곱해 함께 적는다
const EXAM = [
  {
    name: '마드레느', item: 'madeleine', base: 'egg' as IngredientKey,
    classic: defaultsOf('madeleine'),
    exam: { flour: 100, sugar: 100, egg: 100, butter: 100, bakingPowder: 2, lemonZest: 1, salt: 0.5 } as Ratios,
    extras: [] as [string, number][],
  },
  {
    name: '파운드케이크', item: 'poundcake', base: 'butter' as IngredientKey,
    classic: defaultsOf('poundcake'),
    exam: { flour: 100, sugar: 80, butter: 80, egg: 80, bakingPowder: 2, salt: 1 } as Ratios,
    extras: [['유화제', 2], ['탈지분유', 2], ['바닐라향', 0.5]] as [string, number][],
  },
].map((e) => {
  const conv = scaleRatios(e.exam, e.base, 100)
  const factor = 100 / (e.exam[e.base] ?? 100)
  const extrasText = (f: number) => (e.extras.length ? ` + ${e.extras.map(([name, v]) => `${name} ${n1(v * f)}`).join(' · ')}` : '')
  const warn = diagnose(e.item, conv).warnings.map((w) => w.message.replace(/^⚠️\s*/, ''))
  return { ...e, conv, warn, examExtras: extrasText(1), convExtras: extrasText(factor) }
})
const POUND_EXAM = EXAM[1]

// 표 2 — 틀 용량 (계산기 '분량 변환' 탭과 같은 값)
const mold = (item: string, name: string) => (MOLD_PRESETS[item] ?? []).find((m) => m.name === name)
const MOLD_ROWS = [
  { item: 'madeleine', name: '표준 마들렌틀', n: 12, unit: '구' },
  { item: 'madeleine', name: '미니 마들렌틀', n: 20, unit: '구' },
  { item: 'muffin', name: '표준 머핀', n: 12, unit: '구' },
  { item: 'cookie', name: '표준 쿠키 (지름 6cm)', n: 20, unit: '개' },
  { item: 'macaron', name: '표준 마카롱 (지름 4cm)', n: 50, unit: '장(25쌍)' },
  { item: 'financier', name: '표준 휘낭시에틀', n: 12, unit: '구' },
  { item: 'poundcake', name: '소형 파운드 (15×6×6)', n: 0, unit: '' },
  { item: 'poundcake', name: '표준 파운드 (20×8×7)', n: 0, unit: '' },
  { item: 'castella', name: '표준 카스테라 (24×8×7)', n: 0, unit: '' },
].map((r) => ({ ...r, m: mold(r.item, r.name) })).filter((r) => r.m)
const POUND_STD = mold('poundcake', '표준 파운드 (20×8×7)')

// 표 4·5·6 — 케이크 팬
const round = (d: number, h: number): PanSpec => ({ shape: 'round', d, w: 0, l: 0, h })
const square = (w: number, l: number, h: number): PanSpec => ({ shape: 'square', d: 0, w, l, h })
const ratioOf = (a: PanSpec, b: PanSpec) => convertPan(a, b)?.ratio ?? 0
const HEIGHTS = HEIGHT_PRESETS.filter((h) => h.id !== 'custom')
const HIGH_H = HEIGHTS.find((h) => h.id === 'high')?.h ?? 7
const MOUSSE_H = HEIGHTS.find((h) => h.id === 'mousse')?.h ?? 5
const LOW_H = HEIGHTS.find((h) => h.id === 'low')?.h ?? 4.5
const HO = (label: string) => HO_PRESETS.find((p) => p.label === label) ?? HO_PRESETS[1]
const R_1_2 = ratioOf(round(HO('1호').d, HIGH_H), round(HO('2호').d, HIGH_H))
const R_2_3 = ratioOf(round(HO('2호').d, HIGH_H), round(HO('3호').d, HIGH_H))
const R_1M_2H = ratioOf(round(HO('1호').d, MOUSSE_H), round(HO('2호').d, HIGH_H))
const R_2_3_D = ratioOf(round(HO('2호').d, MOUSSE_H), round(HO('3호').d, MOUSSE_H))      // 2호→3호 지름 배율(같은 높이)
const R_2M_3H = ratioOf(round(HO('2호').d, MOUSSE_H), round(HO('3호').d, HIGH_H))
const IN = 2.54
const US_PANS = [
  { name: '8인치 원형 1개', spec: round(8 * IN, 2 * IN), mult: 1 },
  { name: '9인치 원형 1개', spec: round(9 * IN, 2 * IN), mult: 1 },
  { name: '8인치 정사각 1개', spec: square(8 * IN, 8 * IN, 2 * IN), mult: 1 },
  { name: '8인치 원형 2개 (2단)', spec: round(8 * IN, 2 * IN), mult: 2 },
  { name: '9인치 원형 2개 (2단)', spec: round(9 * IN, 2 * IN), mult: 2 },
].map((u) => {
  const vol = (panVolume(u.spec) ?? 0) * u.mult
  const cands = HO_PRESETS.map((p) => ({ p, v: panVolume(round(p.d, HIGH_H)) ?? 0 }))
  // 부피가 '가장 가까운' 호수 — 배율의 로그 거리로 비교(×0.85와 ×1.16을 대칭으로 본다)
  const best = cands.reduce((a, b) => (Math.abs(Math.log(b.v / vol)) < Math.abs(Math.log(a.v / vol)) ? b : a))
  return { name: u.name, vol, near: best.p.label, ratio: best.v / vol }
})
const US8 = US_PANS[0]
const US9 = US_PANS[1]
const US_DEPTH = HIGH_H / (2 * IN)                                                  // 같은 비율로 채울 때 반죽 깊이 배율(높은팬 ÷ 2인치)

// 계란 — 축산법 시행규칙 계란 중량규격(껍질째, lib/krEggGrades — 2026.5.21 명칭 2XL·XL·L·M·S 병행) ·
// 구성비는 Illinois Extension 'Eggs Structure'(껍질 11% · 흰자 58% · 노른자 31%, 크기와 무관하게 거의 일정)
const EGG_XL = [eggGrade('XL').min, eggGrade('XL').max ?? 0]
const EGG_L = [eggGrade('L').min, eggGrade('L').max ?? 0]
const SHELL = 0.11, WHITE = 0.58, YOLK = 0.31
const rng = (w: number[], f: number) => `${Math.round(w[0] * f)}~${Math.round(w[1] * f)}g`
const EGG_XL_MID = (EGG_XL[0] + EGG_XL[1]) / 2
const CUSTARD_YOLK_G = 500 * (defaultsOf('custard').eggYolk ?? 15) / 100

const FAQ_LD = [
  { q: "마들렌 황금비율이 정확히 뭔가요?", a: `가장 클래식한 마들렌 비율은 <strong>계란 : 설탕 : 밀가루 : 버터 = 1 : 1 : 1 : 1</strong>에 베이킹파우더 3%, 꿀 10%입니다. 계란 100g 기준이면 설탕·밀가루·버터 각 100g, 베이킹파우더 3g, 꿀 10g이에요. 한국산업인력공단 제과기능사 실기 공개문제의 마드레느도 박력분·설탕·계란·버터가 모두 100(베이킹파우더 2, 레몬껍질 1, 소금 0.5)인 같은 동량 구조입니다. 변형은 브라운 버터(버터 110% + 꿀 12%), 레몬(레몬 제스트 5%), 초코(코코아 가루 10% + 우유 10%)가 대표적이고, 계산기의 프리셋 탭에서 바로 불러올 수 있습니다.` },
  { q: "1:1:1:1 파운드케이크가 정말 균형 잡힌 비율인가요?", a: `파운드케이크라는 이름 자체가 버터·설탕·계란·밀가루를 1파운드씩 넣던 데서 왔고, 프랑스에서도 &lsquo;4분의 1이 넷&rsquo;이라는 뜻의 카트르카르(quatre-quarts)로 부릅니다. 네 재료가 같은 무게라 외우기 쉽고 결과가 안정적이어서 이 계산기의 파운드 기본값도 1:1:1:1 + 베이킹파우더 2%입니다. 다만 유일한 정답은 아닙니다 — 제과기능사 실기 배합은 박력분 100에 설탕·버터·계란 각 80(+ 유화제·탈지분유)이라 버터 기준으로 바꾸면 <strong>밀가루 ${n1(POUND_EXAM.conv.flour ?? 0)}%</strong>인, 조금 더 단단한 배합이에요. 덜 달게는 설탕 80%, 촉촉하게는 사워크림 +20% 또는 우유 +10%, 묵직하게는 버터 110% + 아몬드 가루 +10%로 조정합니다.` },
  { q: "쿠키가 너무 퍼지는데 어떻게 하나요?", a: "비율 진단 탭에 현재 비율을 넣어 보세요. 원인은 보통 <strong>버터가 밀가루의 70%를 넘음, 백설탕 과다, 베이킹소다 과다, 반죽 온도 높음, 오븐 예열 부족</strong>입니다. 해결책은 ① 냉장 휴지 30분~1시간 ② 황설탕 비율 ↑ ③ 밀가루 +5~10% ④ 베이킹소다 ↓ → 베이킹파우더로 일부 대체 ⑤ 오븐 175~190°C 충분히 예열 ⑥ 차가운 반죽 상태로 굽기. 계산기의 &lsquo;퍼짐 줄이기&rsquo; 보정 버튼은 밀가루 +10, 버터 -5를 한 번에 적용합니다." },
  { q: "레시피에 '계란 2개'처럼 개수로 적혀 있으면 몇 g으로 넣나요?", a: `계란 크기는 껍질째 무게로 나뉩니다. 축산법 시행규칙의 중량규격상 <strong>특란(2026년 5월 개정 명칭 XL) ${EGG_XL[0]}~${EGG_XL[1]}g, 대란(L) ${EGG_L[0]}~${EGG_L[1]}g</strong>이에요. 껍질이 전체 무게의 약 11%, 흰자 58%, 노른자 31%라서 특란 1개를 깨면 내용물은 약 ${rng(EGG_XL, 1 - SHELL)}(흰자 ${rng(EGG_XL, WHITE)}, 노른자 ${rng(EGG_XL, YOLK)})입니다. 따라서 이 계산기의 &lsquo;계란 100g&rsquo;은 특란 2개에 조금 못 미치는 양이고, 마카롱·휘낭시에의 흰자 100g은 특란 흰자 3개 가까이, 커스터드 우유 500g에 들어가는 노른자 ${n1(CUSTARD_YOLK_G)}g은 노른자 약 ${Math.round(CUSTARD_YOLK_G / (EGG_XL_MID * YOLK))}개입니다. 제과는 계란 몇 g 차이가 식감에 그대로 나타나니, 풀어 둔 계란을 저울에 올려 필요한 g만 덜어 쓰세요.` },
  { q: "틀이 다른데 같은 레시피를 사용 가능한가요?", a: "&ldquo;분량 변환&rdquo; 탭을 쓰세요. 예를 들어 표준 파운드틀(20×8×7, 반죽 약 470g) 레시피를 소형 파운드틀(15×6×6, 약 230g) 2개로 나누면 ×0.98(230×2=460g ÷ 470g)입니다. 원형 케이크틀은 호수·높이에 따라 부피가 달라지니 &ldquo;케이크 팬&rdquo; 탭에서 두 팬의 지름·높이로 부피 배율을 구하세요. 사각팬은 판매처마다 자체 호수 체계를 써서 같은 &lsquo;1호&rsquo;가 13.5cm인 곳도 14.5cm인 곳도 있고, <strong>파운드(오란다)팬의 &lsquo;대/중/소&rsquo;는 판매처마다 전혀 다른 실물</strong>을 가리켜 표준 규격이 없습니다 — 이런 틀은 자로 잰 가로×세로×높이를 &ldquo;케이크 팬&rdquo; 탭의 사각 입력에 넣는 게 가장 정확합니다. 굽는 시간은 별도로 조정해야 하고, 마카롱·머랭처럼 민감한 품목은 한 번에 크게 늘리지 마세요." },
  { q: "알레르기가 있어도 본 도구 결과를 사용해도 되나요?", a: "이 도구는 일반 배합 가이드라 알레르기 여부를 판단하지 못합니다. 알레르기가 있다면 재료 라벨을 반드시 확인하고 의사·영양사와 상담하세요. 아몬드 가루처럼 지금은 알레르기 표시란에 나오지 않을 수 있는 재료는 본문 &lsquo;알레르기 표시와 안전하게 쓰는 법&rsquo;을 참고하세요. 대체 재료(계란 → 아쿠아파바, 우유 → 두유·아몬드밀크, 버터 → 식물성 유지 등)는 계산기의 입력 항목이 아니므로, 원래 재료의 g을 먼저 구한 뒤 같은 g만큼 바꿔 넣는 방식으로 쓰세요. 대체하면 식감이 크게 달라질 수 있습니다." },
  { q: "굽는 시간이 권장보다 모자란데 더 구워야 하나요?", a: "가정용 오븐은 설정 온도와 실제 내부 온도가 다른 경우가 많고, 같은 오븐 안에서도 앞뒤·위아래 위치에 따라 익는 속도가 다릅니다. 권장 시간 1~2분 전에 한 번 열어 ① 표면 색 ② 가운데를 눌렀을 때 탄력 ③ 이쑤시개로 찔러 묻어나는 정도를 함께 보세요. 마들렌·머핀은 살짝 덜 구운 쪽이 촉촉하고, 쿠키는 가운데가 약간 무를 때 꺼내면 식으면서 굳습니다. 오븐 온도계를 하나 두면 내 오븐이 설정보다 높게 도는지 낮게 도는지 알 수 있어요." },
  // ── 케이크 팬 탭 (구 /tools/cooking/cake-pan FAQ 흡수) ──
  { q: "케이크 1호는 몇 cm이고, 호수별로 몇 인분인가요?", a: "한국 원형 케이크 팬 기준 <strong>1호 = 지름 15cm</strong>이고, 호수가 1 오를 때마다 지름이 3cm씩 커집니다(2호 18cm, 3호 21cm, 4호 24cm, 5호 27cm). 미니는 판매처에 따라 11.3~12cm로 약간 편차가 있어요. 제과점의 완성 케이크는 아이싱 두께 때문에 1호를 16cm로 표기하는 곳도 있으니, 팬 기준인지 완성 케이크 기준인지 구분해야 합니다. 인원은 케이크샵 관행 기준 <strong>미니(12cm) 1~2인, 1호 2~3인, 2호 4~5인, 3호 6~8인, 4호 8~12인</strong> 정도로 안내되지만 가게마다 표기가 크게 다릅니다(1호를 4~6인분으로 쓰는 곳도 있어요). 식사 뒤 디저트로 먹는 자리라면 한 치수 작게 잡아도 충분한 경우가 많습니다." },
  { q: "1호 레시피를 2호로 바꾸면 재료를 몇 배 해야 하나요?", a: `같은 높이의 팬이라면 <strong>(지름비)² = (18÷15)² = ${n2(R_1_2)}배</strong>입니다. 계산 편의상 &lsquo;1.5배&rsquo;로 반올림해 쓰는 관행이 널리 퍼져 있어요(2호→3호도 ${n2(R_2_3)}배지만 1.5배로 통용). 높이가 다른 팬으로 옮길 때는 <strong>(지름비)² × (높이비)</strong>를 곱해야 합니다 — 1호 무스링(높이 ${MOUSSE_H}cm) 레시피를 2호 높은팬(${HIGH_H}cm)으로 옮기면 ${n2(R_1_2)} × ${n2(HIGH_H / MOUSSE_H)} = <strong>${n2(R_1M_2H)}배</strong>예요. 계산기의 &ldquo;케이크 팬&rdquo; 탭이 정확값과 통용 반올림 구간을 함께 보여줍니다.` },
  { q: "높은팬과 일반팬은 뭐가 다른가요?", a: `한국 원형 팬은 <strong>일반팬 높이 ${LOW_H}cm / 높은팬 ${HIGH_H}cm</strong>의 이원 체계로 판매됩니다. 제누와즈(스펀지 시트)를 구워 생크림 케이크를 만들 때는 높은팬 ${HIGH_H}cm가 사실상 표준이에요. 무스링은 지름 체계(1호 15cm~)는 같지만 높이 ${MOUSSE_H}cm가 표준이라, 같은 &lsquo;2호&rsquo;라도 일반팬과 높은팬의 부피는 ${n2(HIGH_H / LOW_H)}배 차이 납니다. 배율 계산에 높이가 꼭 들어가야 하는 이유입니다.` },
  { q: "미국 레시피의 6인치·8인치 팬은 몇 호인가요?", a: `지름만 보면 <strong>6인치(15.2cm)≈1호, 7인치(17.8cm)≈2호</strong>는 오차 0.3cm 이내로 사실상 같고, <strong>8인치(20.3cm)는 3호(21cm)보다 0.7cm 작으며 9인치(22.9cm)는 약 3.6호</strong>라 정확히 대응하는 호수가 없어요. 게다가 미국 표준 케이크팬은 높이 2인치(약 5cm)라 한국 높은팬(${HIGH_H}cm)보다 얕습니다. 부피로 비교하면 8인치 원형 1개(약 ${ml(US8.vol)}ml)는 ${US8.near} 높은팬에 ×${n2(US8.ratio)}, 9인치 원형 1개(약 ${ml(US9.vol)}ml)는 ${US9.near} 높은팬에 ×${n2(US9.ratio)}로 옮기면 됩니다. 미국 레이어 케이크는 팬 2개(2단) 분량인 경우가 많으니 레시피의 팬 개수를 꼭 확인하세요.` },
  { q: "팬을 키우면 굽는 시간·온도는 어떻게 바꾸나요?", a: `정해진 환산 공식은 없지만 원리는 분명합니다. 굽는 시간은 반죽의 양보다 <strong>반죽의 두께(깊이)</strong>에 좌우돼요. King Arthur Baking은 8~9인치 레시피를 6인치 팬 여러 개로 나눠 구울 때 반죽 깊이가 거의 같아 시간이 원래 범위 안에 든다고 안내하면서도, 권장 시간 5분 전부터 익었는지 확인하라고 덧붙입니다. 반대로 더 깊은 팬으로 옮기거나 반죽을 두껍게 채우면 열이 가운데까지 닿는 데 오래 걸려 가장자리는 마르고 가운데는 덜 익기 쉽습니다. 이때는 온도를 조금 낮추고 시간을 5분 단위로 늘려 가며 <strong>꼬치 테스트</strong>(중앙에 찔러 반죽이 묻어나지 않으면 완료)로 판정하세요. 배율(예: 1호→2호 ${n2(R_1_2)}배)만큼 시간을 곱하는 계산은 맞지 않습니다.` },
]

export default function BakingRecipePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/baking-recipe">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />제과 레시피 계산기
      </h1>
      <p className="tp-lead">
        마들렌·파운드·쿠키·머핀·마카롱 등 <strong style={{ color: 'var(--text)' }}>10종 비율 자동</strong> + 식감 보정·틀 용량 환산.
      </p>
      {/* 도구 메타(lib/toolMeta)의 basis·sources도 이 값에서 생성 — 케이크 팬 호수 규격(구 cake-pan 출처) 포함 */}
      <UpdatedMeta
        date="2026년 9월"
        basis="품목별 기본 비율은 통용 동량 배합(마들렌·파운드 1:1:1:1)과 제과기능사 실기 공개문제 대조 · 케이크 팬은 부피비 환산(원형 1호 15cm·호당 +3cm·높은팬 7cm, 판매 규격 교차 확인) · 계란 무게는 축산법 시행규칙 중량규격"
        sources={[
          { label: 'Q-Net — 제과기능사 실기 공개문제(2026)', href: 'https://www.q-net.or.kr/cst006.do?id=cst00602&gSite=Q&gId=&artlSeq=5250954&brdId=Q006&code=1204' },
          { label: 'King Arthur Baking — 팬 크기와 부피', href: 'https://www.kingarthurbaking.com/blog/2025/08/18/baking-pan-size' },
          { label: 'King Arthur Baking — 6인치 팬으로 나눠 굽기', href: 'https://www.kingarthurbaking.com/blog/2022/09/28/how-to-turn-any-cake-recipe-into-6-inch-mini-cakes' },
          { label: '국가법령정보센터 — 축산법 시행규칙(계란 중량규격)', href: 'https://www.law.go.kr/법령/축산법시행규칙' },
          { label: 'Illinois Extension — 계란 구조·구성비', href: 'https://extension.illinois.edu/eggs-structure' },
          { label: '국가법령정보센터 — 식품표시광고법 시행규칙(알레르기 표시)', href: 'https://www.law.go.kr/법령/식품등의표시ㆍ광고에관한법률시행규칙' },
          { label: '식품의약품안전처 — 식품표시광고법 시행규칙 개정안 입법예고(알레르기 표시 대상 확대)', href: 'https://www.mfds.go.kr/brd/m_209/view.do?seq=44285' },
          { label: '카우2004 — 케이크 팬 판매 규격', href: 'https://www.cow2004.com' },
          { label: '웰베이킹 — 케이크 팬 판매 규격', href: 'https://wellbaking.co.kr' },
        ]}
      />

      <BakingRecipeClient />

      <GuideDivider />

      {/* 1. 품목별 기본 비율 */}
      <h2 className="g-h2">품목별 기준 재료와 기본 비율</h2>
      <p className="g-p">
        제과는 품목마다 &lsquo;100%로 두는 재료&rsquo;가 다릅니다. 빵은 밀가루를 100%로 두는 베이커 퍼센트가 표준이지만, 마들렌은 계란, 파운드케이크는 버터,
        마카롱·휘낭시에는 흰자, 브라우니는 초콜릿, 커스터드는 우유를 기준으로 삼을 때 배합이 가장 단순하게 읽힙니다. 기준 재료를 무엇으로 잡든 재료 사이의
        비율은 같아서, 기준만 바꿔 적은 두 레시피는 같은 반죽이에요. 아래 표는 계산기에서 품목을 고르면 자동으로 채워지는 기본값을 같은 데이터에서 그대로 뽑은 것입니다.
      </p>
      <DataFigure n={1} title="품목별 기준 재료·기본 비율·굽기 조건 (계산기 기본값)" unit="단위: 기준 재료 대비 %">
        <table>
          <thead>
            <tr>
              <th scope="col">품목</th>
              <th scope="col">기준 (100%)</th>
              <th scope="col">기본 비율</th>
              <th scope="col">굽기</th>
            </tr>
          </thead>
          <tbody>
            {ITEM_ROWS.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.name}</th>
                <td>{r.base}</td>
                <td className="wrap">{r.ratios}</td>
                <td className="wrap">{r.bake}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip">
        기본값은 출발점입니다. 식감 보정 버튼(예: 마들렌 &lsquo;더 촉촉하게&rsquo; = 꿀 +5·버터 +5)은 기준 재료 대비 %p를 더하거나 빼는 방식이라,
        계란 100g 레시피에서 &lsquo;+5&rsquo;는 5g입니다.
      </Callout>

      {/* 2. 계산 원리 */}
      <h2 className="g-h2">계산 원리 — 기준 재료 g 하나로 전체를 환산</h2>
      <p className="g-p">
        레시피 탭은 기준 재료의 무게 하나만 받습니다. 나머지 재료는 모두 &lsquo;기준 재료 대비 몇 %&rsquo;로 저장돼 있어, 입력한 g에 비율을 곱하면 바로 무게가 나옵니다.
        분량 변환 탭은 여기서 한 단계 더 나아가, 만들고 싶은 개수나 틀에 필요한 반죽량을 현재 총 반죽량으로 나눈 배율을 모든 재료에 똑같이 곱합니다.
      </p>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
        padding: '18px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2.1, marginBottom: 16,
      }}>
        <div><span style={{ color: 'var(--muted)' }}>재료 g</span> = 기준 재료 g × (재료 % ÷ 기준 재료 %)</div>
        <div><span style={{ color: 'var(--muted)' }}>필요 반죽</span> = 1개당 g × 개수 (개수형) · 틀 1개 반죽 g (틀형 — 파운드·카스테라는 틀 부피 ÷ 비용적)</div>
        <div><span style={{ color: 'var(--muted)' }}>분량 배율</span> = 필요 반죽 g ÷ 현재 총 반죽 g</div>
      </div>
      <p className="g-p">
        예를 들어 클래식 마들렌을 계란 100g으로 잡으면 총 반죽은 <strong>{n1(MAD_TOTAL)}g</strong>입니다. 표준 마들렌틀({MAD_MOLD.perPiece}g) {MAD_COUNT}구를 채우려면
        {' '}{MAD_MOLD.perPiece} × {MAD_COUNT} = {MAD_TARGET}g이 필요하므로 배율은 {MAD_TARGET} ÷ {n1(MAD_TOTAL)} = <strong>×{n2(MAD_FACTOR)}</strong>이고,
        계란·설탕·밀가루·버터는 각각 {n1((MAD_W.egg ?? 0) * MAD_FACTOR)}g이 됩니다. 계산기의 분량 변환 탭에서 같은 조건을 고르면 같은 숫자가 나옵니다.
      </p>
      <DataFigure n={2} title={`클래식 마들렌 — 계란 100g 기준 → 표준 마들렌틀 ${MAD_COUNT}구`} unit="단위: g">
        <table>
          <thead>
            <tr>
              <th scope="col">재료</th>
              <th scope="col" className="r">비율</th>
              <th scope="col" className="r">계란 100g 기준</th>
              <th scope="col" className="r">{MAD_COUNT}구 ({MAD_TARGET}g) 환산</th>
            </tr>
          </thead>
          <tbody>
            {MAD_EXAMPLE_ROWS.map((r) => (
              <tr key={r.k}>
                <th scope="row">{r.label}</th>
                <td className="r">{r.pct}%</td>
                <td className="r">{n1(r.g)}</td>
                <td className="r em">{n1(r.scaled)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">합계</th>
              <td className="r">—</td>
              <td className="r">{n1(MAD_TOTAL)}</td>
              <td className="r em">{n1(MAD_TOTAL * MAD_FACTOR)}</td>
            </tr>
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        가진 재료가 부족할 때는 기준 재료를 바꾸면 됩니다. 버터가 {MAD_BUTTER_G}g뿐이라면 기준을 버터로 바꾸고 {MAD_BUTTER_G}g을 넣으세요. 비율은 그대로라
        계란·설탕·밀가루도 {n1(MAD_BY_BUTTER.egg ?? 0)}g씩, 총 반죽은 {n1(totalWeight(MAD_BY_BUTTER))}g으로 줄어듭니다.
        베이킹파우더·바닐라처럼 1~3g인 재료는 0.1g 단위 저울이 없으면 오차가 커지니, 배율이 작을 때는 미량 재료부터 조심해서 계량하세요.
      </p>

      {/* 3. 클래식 vs 제과기능사 배합 */}
      <h2 className="g-h2">클래식 동량 배합과 제과기능사 배합 비교</h2>
      <p className="g-p">
        &lsquo;황금비율&rsquo;은 하나로 정해진 규격이 아닙니다. 한국산업인력공단이 공개하는 제과기능사 실기 문제는 마드레느·파운드케이크 배합을 박력분 100% 기준으로 적는데,
        같은 마들렌·파운드라도 배합이 다를 수 있어요. 아래 표는 공개문제 배합을 이 계산기의 기준 재료로 바꿔 적고, 그 값을 비율 진단에 넣었을 때 나오는 결과까지 계산한 것입니다.
      </p>
      <DataFigure n={3} title="계산기 기본값 vs 제과기능사 실기 배합 (기준 재료로 환산)" unit="단위: 기준 재료 대비 %">
        <table>
          <thead>
            <tr>
              <th scope="col">품목</th>
              <th scope="col">계산기 기본값</th>
              <th scope="col">기능사 배합 (박력분 100)</th>
              <th scope="col">기준 재료로 환산</th>
              <th scope="col">비율 진단</th>
            </tr>
          </thead>
          <tbody>
            {EXAM.map((e) => (
              <tr key={e.item}>
                <th scope="row">{e.name}<small>{INGREDIENT_LABEL[e.base].replace(' (전란)', '')} 100 기준</small></th>
                <td className="wrap">{listRatios(e.classic, e.base)}</td>
                <td className="wrap">{listRatios(e.exam, 'flour')}{e.examExtras}</td>
                <td className="wrap">{listRatios(e.conv, e.base)}{e.convExtras}</td>
                <td className="wrap">{e.warn.length ? e.warn.join(' ') : '범위 안 (경고 없음)'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        마드레느는 네 재료가 모두 100이라 기준을 무엇으로 잡아도 1:1:1:1이고, 계산기 기본값과 차이는 베이킹파우더(3% vs 2%)와 꿀·레몬껍질 정도입니다.
        파운드케이크는 설탕·버터·계란이 밀가루의 80%라, 버터 기준으로 바꾸면 밀가루가 {n1(POUND_EXAM.conv.flour ?? 0)}%가 됩니다.
        {POUND_EXAM.warn.length > 0
          ? <>비율 진단 탭의 범위는 1:1:1:1을 중심으로 잡혀 있어 이 배합에는 &lsquo;{POUND_EXAM.warn[0]}&rsquo; 주의가 뜨지만, 유화제·탈지분유를 넣고 크리밍법으로 공기를 충분히 포집하는 시험용 배합이라 실패한 배합이라는 뜻은 아닙니다.</>
          : <>이 배합은 비율 진단 탭의 통용 범위 안에 들어 경고가 뜨지 않습니다.</>}
        {' '}진단 결과는 &lsquo;기준에서 얼마나 벗어났는지&rsquo;를 알려 주는 신호로 읽으세요.
      </p>

      {/* 4. 비율 진단 */}
      <h2 className="g-h2">비율 진단 가이드 — 어떤 재료가 어떤 식감을 만드나</h2>
      <p className="g-p">
        같은 품목이라도 주재료 비율이 5~10%p만 달라져도 식감이 달라집니다. 비율 진단 탭은 품목별 통용 범위와 입력값을 비교해 범위를 벗어난 재료에 주의·경고를 띄우고,
        단맛·촉촉함·퍼짐 같은 특성을 막대로 보여 줍니다. 예측 막대는 재료 비율로 계산한 상대 지표라 실제 맛을 측정한 값이 아니며, 같은 레시피를 조금씩 바꿔 가며 방향을 비교하는 데 쓰세요.
      </p>
      <DataFigure n={4} title="재료 비율이 바뀔 때 식감 변화" >
        <table>
          <thead>
            <tr>
              <th scope="col">재료</th>
              <th scope="col">많아질 때</th>
              <th scope="col">적어질 때</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">설탕</th><td className="wrap">단맛 ↑ · 갈변 빠름 · (쿠키) 퍼짐 ↑</td><td className="wrap">식감 푸석 · 보존성 ↓</td></tr>
            <tr><th scope="row">버터</th><td className="wrap">풍미 ↑ · 식감 묵직 · (쿠키) 퍼짐 ↑</td><td className="wrap">식감 가벼움 · 풍미 ↓</td></tr>
            <tr><th scope="row">밀가루</th><td className="wrap">구조 ↑ · 푸석 가능</td><td className="wrap">촉촉·꾸덕(fudgy) · 무너지기 쉬움</td></tr>
            <tr><th scope="row">계란</th><td className="wrap">부풀기 ↑ · 단단함</td><td className="wrap">식감 무너짐 · 결합력 ↓</td></tr>
            <tr><th scope="row">액체 (우유·물)</th><td className="wrap">촉촉 ↑ · 밀도 ↓</td><td className="wrap">건조 가능</td></tr>
            <tr><th scope="row">베이킹파우더</th><td className="wrap">부풀기 ↑ · 권장 범위(마들렌 2~4%, 머핀 3~5%)를 넘으면 쓴맛·금속 맛</td><td className="wrap">덜 부풂</td></tr>
            <tr><th scope="row">황설탕 vs 백설탕</th><td className="wrap">황설탕 ↑ → 쫀득·캐러멜 풍미</td><td className="wrap">백설탕 ↑ → 바삭·퍼짐</td></tr>
          </tbody>
        </table>
      </DataFigure>

      {/* 5. 틀 용량 */}
      <h2 className="g-h2">틀 용량으로 반죽량 정하기</h2>
      <p className="g-p">
        마들렌·머핀·쿠키처럼 개수로 만드는 품목은 &lsquo;1개당 반죽 g × 개수&rsquo;가 필요한 반죽량입니다. 파운드·카스테라처럼 틀 하나를 채우는 품목은
        틀 부피를 비용적(반죽 1g이 구워진 뒤 차지하는 부피, cm³/g)으로 나눠 구해요. 파운드는 제과 이론의 표준 비용적 2.4를 써서
        20×8×7cm 틀(1,120cm³)이면 1,120 ÷ 2.4 ≈ 467g, 계산기는 10g 단위로 반올림해 {POUND_STD?.volume ?? 470}g을 씁니다.
        카스테라의 3.5는 꿀이 든 무거운 거품 반죽을 틀 높이의 약 60%까지 채우는 기준으로 이 도구가 잡은 근사값입니다.
      </p>
      <DataFigure n={5} title="틀별 반죽량 (계산기 '분량 변환' 탭 값)" unit="단위: g">
        <table>
          <thead>
            <tr>
              <th scope="col">틀</th>
              <th scope="col" className="r">1개당 / 1틀</th>
              <th scope="col" className="r">예시 분량</th>
            </tr>
          </thead>
          <tbody>
            {MOLD_ROWS.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                <td className="r">{r.m?.perPiece != null ? `1개 ${r.m.perPiece}` : `1틀 약 ${r.m?.volume}`}</td>
                <td className="r">{r.m?.perPiece != null ? `${r.n}${r.unit} = ${r.m.perPiece * r.n}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        마카롱은 껍질(꼬끄) 1장 기준이라 완성품 1개에 2장이 들어갑니다. 원형 케이크틀(미니~5호)·무스링·사각팬은 틀마다 1개당 g을 정할 수 없어 계산기의{' '}
        <Link href="/tools/cooking/baking-recipe?tab=pan">케이크 팬 탭</Link>에서 지름·높이로 부피를 비교해 환산합니다.
      </p>

      {/* 6. 케이크 팬 호수 체계와 배율 (구 cake-pan 흡수) */}
      <h2 className="g-h2">한국 케이크 팬 호수 체계와 배율표</h2>
      <p className="g-p">
        케이크 팬은 두 팬의 <strong>부피 비율</strong>만큼 레시피 전체를 곱합니다. 원형 부피는 π × (지름÷2)² × 높이, 사각은 가로 × 세로 × 높이이고,
        높이가 같으면 높이가 약분돼 배율은 지름비의 제곱만 남습니다. King Arthur Baking도 팬을 바꿀 때는 지름이 아니라 부피를 비교하라고 안내하는데,
        9인치 원형이 8인치보다 지름은 1인치 크지만 부피는 약 27% 크다는 것이 같은 원리(9² ÷ 8² ≈ 1.27)예요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 8 }}>
        {[
          { t: '원형 팬 (표준화 강함)', d: `1호 15cm 기점, 호당 +3cm. 높이는 일반 ${LOW_H} / 높은팬 ${HIGH_H}cm 이원 체계. 제누와즈용은 높은팬이 표준.` },
          { t: '무스링', d: `지름 체계는 원형 팬과 동일(1호 15cm~), 높이만 ${MOUSSE_H}cm 표준. 높은형 6~7cm 별도. 떡케이크 틀로도 통용.` },
          { t: '사각·파운드 (비표준)', d: '판매처마다 치수가 달라 규격 합의 없음. 오란다팬 대/중/소는 가게마다 전혀 다른 실물 — 실측 입력 권장.' },
        ].map((c) => (
          <div key={c.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
          </div>
        ))}
      </div>
      <DataFigure n={6} title="원형 팬 호수 간 레시피 배율 (같은 높이)" unit="행: 레시피의 팬 → 열: 내 팬">
        <table>
          <thead>
            <tr>
              <th scope="col">레시피 ＼ 내 팬</th>
              {HO_PRESETS.map((p) => <th key={p.label} scope="col" className="r">{p.label} ({p.d}cm)</th>)}
            </tr>
          </thead>
          <tbody>
            {HO_PRESETS.map((a) => (
              <tr key={a.label}>
                <th scope="row">{a.label} ({a.d}cm)</th>
                {HO_PRESETS.map((b) => (
                  <td key={b.label} className="r">
                    {a.label === b.label ? '—' : `×${n2(ratioOf(round(a.d, HIGH_H), round(b.d, HIGH_H)))}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        1호 레시피를 3호로 키우면 ×{n2(ratioOf(round(HO('1호').d, HIGH_H), round(HO('3호').d, HIGH_H)))}로 거의 두 배, 4호면 ×{n2(ratioOf(round(HO('1호').d, HIGH_H), round(HO('4호').d, HIGH_H)))}입니다.
        계란처럼 개수로 넣는 재료는 딱 떨어지지 않으니 환산값에 가까운 개수로 정한 뒤 나머지 재료를 그 계란 무게에 맞춰 조정하는 편이 편합니다.
        호수별 부피·인원·인치 대응표는 계산기의 케이크 팬 탭 아래에 있어요.
      </p>

      {/* 7. 높이·미국 팬 */}
      <h2 className="g-h2">높이가 다른 팬과 미국 레시피 팬 환산</h2>
      <p className="g-p">
        지름이 같아도 높이가 다르면 부피가 높이에 정비례해 달라집니다. 무스링·일반팬·높은팬 사이를 오갈 때는 아래 높이 배율을 지름 배율에 한 번 더 곱하세요.
      </p>
      <DataFigure n={7} title="같은 지름에서 높이만 다를 때 배율" unit="행: 레시피의 팬 → 열: 내 팬">
        <table>
          <thead>
            <tr>
              <th scope="col">레시피 ＼ 내 팬</th>
              {HEIGHTS.map((h) => <th key={h.id} scope="col" className="r">{h.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {HEIGHTS.map((a) => (
              <tr key={a.id}>
                <th scope="row">{a.label}</th>
                {HEIGHTS.map((b) => <td key={b.id} className="r">{a.id === b.id ? '—' : `×${n2(b.h / a.h)}`}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="warn" title="높이를 빼먹는 게 가장 흔한 실수">
        2호 무스링({MOUSSE_H}cm) 레시피로 3호 높은팬({HIGH_H}cm) 제누와즈를 구우려고 지름 배율 ×{n2(R_2_3_D)}만 곱하면 반죽이 모자랍니다.
        높이 배율 ×{n2(HIGH_H / MOUSSE_H)}까지 곱한 <strong>×{n2(R_2M_3H)}</strong>가 맞아요.
      </Callout>
      <p className="g-p" style={{ marginTop: 16 }}>
        미국 레시피의 표준 케이크팬은 높이 2인치(약 5cm)라 지름만 비교하면 어긋납니다. 아래는 미국 팬의 부피를 한국 높은팬({HIGH_H}cm) 가운데 부피가 가장 가까운 호수로 옮길 때의 배율입니다.
        미국 레시피는 얕은 팬 2개에 나눠 굽는 레이어 케이크가 많아, 그 반죽을 높은팬 하나에 부으면 반죽이 두꺼워져 굽는 시간이 늘어납니다.
      </p>
      <DataFigure n={8} title="미국 레시피 팬(높이 2인치) → 한국 높은팬 배율">
        <table>
          <thead>
            <tr>
              <th scope="col">미국 레시피 팬</th>
              <th scope="col" className="r">부피</th>
              <th scope="col">가까운 한국 팬</th>
              <th scope="col" className="r">배율</th>
            </tr>
          </thead>
          <tbody>
            {US_PANS.map((u) => (
              <tr key={u.name}>
                <th scope="row">{u.name}</th>
                <td className="r">약 {ml(u.vol)}ml</td>
                <td>{u.near} 높은팬</td>
                <td className="r em">×{n2(u.ratio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        표 8의 배율로 옮기면 팬을 채우는 비율은 같아도 팬 높이가 2인치(5.08cm)에서 {HIGH_H}cm로 바뀌어 반죽 깊이가 약 {n1(US_DEPTH)}배가 됩니다.
        굽는 시간은 부피 배율로 곱하지 말고, 아래 FAQ &lsquo;팬을 키우면 굽는 시간·온도는&rsquo;의 원칙대로 깊이를 기준으로 조정하세요.
      </p>

      {/* 8. 식감별 조정 */}
      <h2 className="g-h2">식감별 비율 조정 치트시트</h2>
      <p className="g-p">
        아래 조정값의 %p는 모두 기준 재료 대비입니다. 계산기에 한 번에 적용되는 보정 버튼이 있으면 버튼 이름과 실제로 바뀌는 값을 함께 적었습니다.
      </p>
      <ul className="g-list">
        <li><strong>촉촉하게</strong> — 사워크림·요거트 +10~20%p 또는 꿀·미즈아메 +5~10%p. 버튼: 마들렌 &lsquo;더 촉촉하게&rsquo;(꿀 +5·버터 +5), 파운드 &lsquo;촉촉한&rsquo;(사워크림 20%), 머핀 &lsquo;더 촉촉하게&rsquo;(우유 +20)</li>
        <li><strong>가볍게</strong> — 밀가루의 10~20%를 옥수수 전분으로 대체</li>
        <li><strong>진한 풍미</strong> — 브라운 버터·꿀·바닐라 추가. 버튼: 마들렌 &lsquo;더 진하게&rsquo;(버터 +10·꿀 +5), 휘낭시에 &lsquo;풍미 ↑&rsquo;(브라운 버터 +10)</li>
        <li><strong>덜 달게</strong> — 설탕 -10~20%p. 설탕은 수분을 붙잡아 촉촉함·보존성에도 관여하니 한 번에 크게 줄이지 마세요. 버튼: 마들렌 -10, 머핀 -15, 브라우니 -20, 파운드 설탕 80%</li>
        <li><strong>쫀득한 쿠키</strong> — 황설탕 비중 ↑ · 냉장 휴지 1시간. 버튼: &lsquo;더 쫀득하게&rsquo;(황설탕 +10·백설탕 -10)</li>
        <li><strong>바삭한 쿠키</strong> — 백설탕 비중 ↑ · 녹인 버터 · 얇게 굽기. 버튼: &lsquo;더 바삭하게&rsquo;(백설탕 +10·황설탕 -10)</li>
        <li><strong>꾸덕한(fudgy) 브라우니</strong> — 밀가루 30~40%까지 ↓ · 카카오 70% 이상 다크 초콜릿. 버튼: &lsquo;진한 fudgy&rsquo;(밀가루 -10)</li>
        <li><strong>케이크형 브라우니</strong> — 밀가루 ↑. 버튼: &lsquo;케이크형&rsquo;(밀가루 +10)</li>
      </ul>

      {/* 9. 베이커 퍼센트와의 차이 */}
      <h2 className="g-h2">제과 레시피 계산기와 베이커 퍼센트 계산기의 차이</h2>
      <p className="g-p">
        두 도구는 기준을 잡는 방식이 다릅니다. 빵(발효 반죽)을 만든다면 <Link href="/tools/cooking/baker-percent">베이커 퍼센트 계산기</Link>,
        디저트(제과)를 만든다면 이 도구가 맞습니다.
      </p>
      <DataFigure n={9} title="베이커 퍼센트 vs 제과 레시피 계산기">
        <table>
          <thead>
            <tr>
              <th scope="col">구분</th>
              <th scope="col">베이커 퍼센트</th>
              <th scope="col">제과 레시피 (이 도구)</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">대상</th><td className="wrap">빵 (식빵·바게트·치아바타·소금빵)</td><td className="wrap">제과 (마들렌·파운드·쿠키·머핀·마카롱·디저트)</td></tr>
            <tr><th scope="row">기준</th><td className="wrap">밀가루 100% 고정</td><td className="wrap">품목별 (계란·버터·밀가루·흰자·초콜릿·우유)</td></tr>
            <tr><th scope="row">핵심</th><td className="wrap">수분율·발효 시간·반죽 온도</td><td className="wrap">비율 진단·식감 보정·틀 환산</td></tr>
            <tr><th scope="row">전문 영역</th><td className="wrap">글루텐·이스트·발효종</td><td className="wrap">유지·계란·당도·머랭</td></tr>
          </tbody>
        </table>
      </DataFigure>

      {/* 10. 알레르기·안전 */}
      <h2 className="g-h2">알레르기 표시와 안전하게 쓰는 법</h2>
      <p className="g-p">
        제과 재료에는 알레르기 유발 재료가 많습니다. 식품표시광고법 시행규칙(별표 2)은 알류(가금류)·우유·밀·대두·땅콩·호두·잣·복숭아 등 22종을 원재료로 쓰면
        양과 관계없이 알레르기 표시란에 적도록 정하고 있지만, <strong>2026년 9월 현재 아몬드와 코코넛은 이 목록에 없습니다</strong>.
        식약처가 2026년 8월 참깨·들깨·아몬드·캐슈넛을 표시 대상에 추가하는 시행규칙 개정안을 입법예고해, 개정안이 확정·시행되면 아몬드도 알레르기 표시란에 적힙니다.
        그 전까지는 마카롱·휘낭시에에 쓰는 아몬드 가루가 알레르기 표시란에 따로 나오지 않을 수 있으니 원재료명을 직접 확인하세요.
      </p>
      <Callout tone="warn" title="사용 전 확인">
        <ul className="g-list" style={{ margin: 0 }}>
          <li>결과는 일반 배합 가이드입니다. 오븐·재료 브랜드(특히 버터·밀가루)에 따라 결과가 달라지니 첫 시도는 소량으로 테스트하세요.</li>
          <li>알레르기가 의심되면 라벨을 확인하고 의료진과 상담하세요. 대체 재료는 식감이 크게 달라질 수 있습니다.</li>
          <li>이 도구는 칼로리·당류 같은 영양 성분을 계산하지 않습니다. 식이 조절이 필요하면 영양사·의사와 상담하세요.</li>
        </ul>
      </Callout>

      <Faq items={FAQ_LD} />

      <RelatedTools items={[
        { href: '/tools/cooking/baker-percent', desc: '빵·발효 반죽 (밀가루 100%)' },
        { href: '/tools/cooking/substitute', desc: '버터·설탕·계란 대체 비율' },
        { href: '/tools/cooking/egg-timer', desc: '계란 크기별 삶는 시간' },
        { href: '/tools/cooking/serving', desc: '인분 환산' },
        { href: '/tools/cooking/thawing', desc: '버터·계란 실온화' },
        { href: '/tools/date/dday', desc: '생일 케이크 일정' },
      ]} />
    </ToolPage>
  )
}
