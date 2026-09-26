import Link from 'next/link'
import KimjangClient from './KimjangClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { INGREDIENTS, CONSUMPTION_PROFILES, KIMCHI_VARIANTS, calcCabbages, calcIngredients } from './kimjangData'

export const metadata = buildMetadata({
  path: '/tools/cooking/kimjang',
  title: '김장 양 계산기 — 가족 수·기간별 배추 포기·재료·예상 비용 (KAMIS 시세)',
  description:
    '가족 수·소비 패턴·기간만 알려주면 배추 포기 수·고춧가루·마늘·젓갈·예상 비용 자동. 주요 농산물 KAMIS 실시간 시세 + D-day 일정.',
  keywords: [
    '김장 양 계산기', '김장 재료 계산', '배추 포기 수', '김장 비용',
    '김장 양념', '김장 일정', 'KAMIS 시세', '김장철 배추 가격',
    '깍두기 만들기', '총각김치', '동치미', '파김치', '갓김치',
    '김치 보관', '김장 레시피', '절임배추 몇 포기',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
  whiteSpace: 'nowrap',
}

/* ── 가이드 표·예시 — 도구의 calcCabbages()·calcIngredients()로 빌드 시 생성 ── */
const PROFILE = {
  heavy: CONSUMPTION_PROFILES.find(p => p.id === 'heavy')!,
  normal: CONSUMPTION_PROFILES.find(p => p.id === 'normal')!,
  light: CONSUMPTION_PROFILES.find(p => p.id === 'light')!,
}
const cab = (adults: number, kids: number, profileId = 'normal', months = 3) =>
  calcCabbages({ adults, kids, profileId, months })

const FAMILIES = [
  { label: '1인 (성인 1)', adults: 1, kids: 0 },
  { label: '2인 (성인 2)', adults: 2, kids: 0 },
  { label: '3인 (성인 2·어린이 1)', adults: 2, kids: 1 },
  { label: '4인 (성인 2·어린이 2)', adults: 2, kids: 2 },
  { label: '4인 (성인 4)', adults: 4, kids: 0 },
  { label: '5인 (성인 2·어린이 3)', adults: 2, kids: 3 },
]
const CAB_COLS = [
  { label: '보통 1개월', profileId: 'normal', months: 1 },
  { label: '보통 3개월', profileId: 'normal', months: 3 },
  { label: '보통 6개월', profileId: 'normal', months: 6 },
  { label: '잘 먹음 3개월', profileId: 'heavy', months: 3 },
  { label: '적게 먹음 3개월', profileId: 'light', months: 3 },
]
const CAB_TABLE = FAMILIES.map(f => ({
  ...f,
  cells: CAB_COLS.map(c => cab(f.adults, f.kids, c.profileId, c.months)),
}))

// 계산 예시 — 성인 2·어린이 2, 보통, 3개월 (기본 평균가)
const EX_DAILY = 2 * PROFILE.normal.adultDailyG + 2 * PROFILE.normal.kidDailyG
const EX_TOTAL_G = EX_DAILY * 3 * 30
const EX_CAB = cab(2, 2)
const EX_ITEMS = calcIngredients(EX_CAB, [])
const EX_COST = EX_ITEMS.reduce((a, it) => a + it.totalPriceWon, 0)
const exItem = (id: string) => EX_ITEMS.find(it => it.ing.id === id)!
const EX_BIG2 = exItem('baechu').totalPriceWon + exItem('gochugaru').totalPriceWon
const EX_BIG2_PCT = Math.round((EX_BIG2 / EX_COST) * 100)
const won = (n: number) => n.toLocaleString('ko-KR')

// 배추 1포기당 비율표 — INGREDIENTS 그대로 + 12포기 환산
const TWELVE = calcIngredients(12, [])
const NOTE: Record<string, string> = {
  baechu: '속이 찬 가을배추 · 절임 전 약 3kg',
  mu: '1개 약 1kg · 채 썰어 양념에',
  jjokpa: '1단 약 1kg · 4~5cm 길이로',
  gochugaru: '김장용 굵은 고춧가루',
  maneul: '깐마늘 기준',
  saenggang: '많이 넣으면 쓴맛',
  sugar: '매실청·배즙으로 대체 가능',
  chapssal: '묽게 쑤어 완전히 식혀 사용',
  myeoljeot: '까나리액젓으로 바꿔도 됨',
  saeu: '육젓·추젓 모두 사용',
  sogeum: '굵은소금(천일염)',
  water: '절임용 · 비용 0원',
}
const RATIO_ROWS = INGREDIENTS.filter(i => i.perCabbageAmt > 0).map(ing => {
  const t = TWELVE.find(x => x.ing.id === ing.id)
  return {
    id: ing.id,
    name: ing.name,
    per: `${ing.perCabbageAmt.toLocaleString('ko-KR')}${ing.unit}`,
    twelve: t ? `${t.displayAmount}${t.displayUnit}` : '—',
    price: ing.pricePerUnit > 0 ? `${ing.pricePerUnit.toLocaleString('ko-KR')}원/${ing.unit}` : '—',
    live: Boolean(ing.kamisItemCode),
    note: NOTE[ing.id] ?? '',
  }
})
const SALT = INGREDIENTS.find(i => i.id === 'sogeum')!.perCabbageAmt
const WATER_L = INGREDIENTS.find(i => i.id === 'water')!.perCabbageAmt
const BRINE_PCT = ((SALT / (SALT + WATER_L * 1000)) * 100).toFixed(1)

// 추가 김치 — KIMCHI_VARIANTS 그대로 + 예시(감산 전 9포기) 기준 양
const VARIANT_ROWS = KIMCHI_VARIANTS.map(v => {
  const kg = v.reduceRatio * EX_CAB * 2.5
  const extra = Object.entries(v.extraIngredients)
    .map(([id, amt]) => {
      const ing = INGREDIENTS.find(i => i.id === id)
      return ing ? `${ing.name} ${amt}${ing.unit}/kg` : ''
    })
    .filter(Boolean)
    .join(', ')
  return {
    id: v.id,
    name: v.name,
    reduce: `${Math.round(v.reduceRatio * 100)}%`,
    kg: kg.toFixed(1),
    extra,
    seasoning: v.skipSeasoning ? `×${v.seasoningRatio} (고춧가루·젓갈·찹쌀풀 제외)` : `×${v.seasoningRatio}`,
  }
})
const KKAK_ADJ = Math.max(1, Math.round(EX_CAB * (1 - 0.15)))

// 절임배추 상자 환산 — 도구 가정: 절임 후 1포기 ≈ 2.5kg
const BOX20 = Math.round(20000 / 2500)
const BOX10 = Math.round(10000 / 2500)
// aT 김장 비용 조사 기준(4인 가족 20포기)이 도구 모델로 며칠 분량인지
const AT20_DAYS = Math.round((20 * 2500) / (4 * PROFILE.normal.adultDailyG))

const FAQ_LD = [
  {
    q: '4인 가족 김장은 몇 포기가 적당한가요?',
    a: `식구 구성에 따라 꽤 다릅니다. 이 도구의 '보통'(성인 하루 ${PROFILE.normal.adultDailyG}g·어린이 ${PROFILE.normal.kidDailyG}g) 기준으로 3개월을 잡으면 성인 4명은 ${cab(4, 0)}포기, 성인 2명·어린이 2명은 ${cab(2, 2)}포기입니다. 매끼 김치를 먹고 찌개·볶음밥에도 자주 쓰는 '잘 먹음'이면 각각 ${cab(4, 0, 'heavy')}포기·${cab(2, 2, 'heavy')}포기로 늘어납니다. 참고로 aT(한국농수산식품유통공사)가 김장 비용을 조사할 때 쓰는 4인 가족 20포기는 이 도구 모델로 성인 4명이 '보통'으로 약 ${AT20_DAYS}일 먹는 양이라, 겨울을 넘겨 봄까지 먹거나 친지와 나누는 규모에 가깝습니다.`,
  },
  {
    q: '김장철 농산물 가격은 어디서 확인하나요?',
    a: 'KAMIS 농산물유통정보(kamis.or.kr)에서 품목별 일일 소매·도매가를 볼 수 있고, aT는 김장철마다 4인 가족 배추 20포기 기준 김장 비용을 조사해 발표합니다. 이 도구는 KAMIS의 서울 소매가로 배추·무·쪽파·고춧가루·마늘·생강 6개 품목을 조회하며, 젓갈·소금·설탕·찹쌀가루는 고정 평균가(2025년 11월)를 씁니다. 「최신 시세」 버튼으로 다시 조회할 수 있고, 조회에 실패하면 평균가로 계산했다고 표시합니다.',
  },
  {
    q: '김장 비용을 줄이려면 어디부터 보나요?',
    a: `비용은 배추와 고춧가루에 몰려 있습니다. 계산 예시(${EX_CAB}포기, 기본 평균가)에서 두 품목이 전체 ${won(EX_COST)}원 중 ${won(EX_BIG2)}원으로 약 ${EX_BIG2_PCT}%를 차지합니다. 고춧가루는 품질·원산지에 따라 값 차이가 크므로 필요한 양만 정확히 사고 남으면 밀봉해 냉동 보관하세요. 배추는 통배추와 절임배추의 총비용을 비교해 보세요 — 절임배추는 단가가 높지만 굵은소금과 절이는 노동이 빠집니다. 마늘·고춧가루처럼 큰 단위로 파는 품목은 이웃과 나눠 사는 것도 방법입니다.`,
  },
  {
    q: '절임배추 20kg 한 상자는 몇 포기 분량인가요?',
    a: `이 도구는 절인 배추 1포기를 약 2.5kg으로 보므로 20kg 상자는 약 ${BOX20}포기, 10kg 상자는 약 ${BOX10}포기로 계산하면 됩니다. 절임배추를 산다면 장보기 목록에서 배추·굵은소금·절임용 물은 빼고, 양념과 젓갈은 포기 수 그대로 쓰세요. 판매처마다 배추 크기가 달라 상자에 포기 수가 적혀 있으면 그 숫자를 우선합니다.`,
  },
  {
    q: '김장 김치는 얼마나 보관되나요?',
    a: '김치는 상한다기보다 온도에 따라 익는(시어지는) 속도가 달라집니다. 0℃ 안팎을 유지하는 김치냉장고가 장기 보관에 가장 유리하고, 문을 자주 여닫는 일반 냉장고는 더 빨리 시어집니다. 실온에서는 하루 이틀 사이에도 눈에 띄게 익으므로 담근 뒤 실온 발효는 1~2일로 끝내고 옮기세요. 보관 기간은 염도·온도·공기 접촉에 따라 크게 달라서 개월 수보다 맛으로 판단하는 편이 정확합니다. 표면을 비닐로 덮어 눌러 두고, 자주 꺼내 먹을 양은 작은 통에 따로 덜어 두면 큰 통이 덜 익습니다. 곰팡이가 피거나 물러져 이상한 냄새가 나면 먹지 마세요.',
  },
  {
    q: '김장이 처음인데 실패하지 않으려면?',
    a: '첫해에는 도구 결과의 절반 정도로 작게 시작하세요. 성패는 절임에서 갈립니다 — 도구 일정처럼 4~8시간 절이면서 중간에 한 번 뒤집고, 두꺼운 줄기를 구부렸을 때 부러지지 않고 휘면 다 절여진 것입니다. 절인 배추는 깨끗한 물에 2~3번 헹군 뒤 충분히 물을 빼야 양념이 묽어지지 않습니다. 양념은 전날 만들어 두면 고춧가루가 불어 맛이 어우러집니다. 통은 80% 정도만 채워야 발효 가스와 국물이 넘치지 않습니다.',
  },
  {
    q: '도구의 가격이 우리 동네와 다른데요?',
    a: 'KAMIS 연동 값은 서울 소매가 평균이라 지역·구매처(전통시장·대형마트·산지 직거래)·상품 등급에 따라 차이가 납니다. 재료별 단가 칸에 실제 구매가를 입력하면 총액이 바로 다시 계산됩니다. 칸을 비우면 시세(또는 기본 평균가)로 돌아갑니다.',
  },
]

export default function KimjangPage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/kimjang">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />김장 양 계산기
      </h1>
      <p className="tp-lead">
        가족 수·소비·기간만 알려주면 배추 포기·양념·비용 자동. 주요 농산물은 <strong style={{ color: 'var(--text)' }}>KAMIS 실시간 시세</strong> 연동.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="배추 1포기(절임 전 약 3kg·절임 후 약 2.5kg) 기준 가정 비율 · 가격은 KAMIS 서울 소매가(조회 실패·미연동 품목은 2025년 11월 평균가)"
        sources={[
          { label: 'KAMIS 농산물유통정보', href: 'https://www.kamis.or.kr' },
          { label: 'aT 한국농수산식품유통공사', href: 'https://www.at.or.kr' },
          { label: '기상청 날씨누리', href: 'https://www.weather.go.kr' },
        ]}
      />

      <KimjangClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 계산 원리 + 가족 구성별 포기 수 */}
        <section>
          <h2 className="g-h2">배추 포기 수는 이렇게 계산됩니다</h2>
          <p className="g-p">
            계산은 &lsquo;하루에 먹는 김치 무게&rsquo;에서 출발합니다. 소비 패턴마다 성인과 어린이의 하루 섭취량을 정해 두고(잘 먹음 성인 {PROFILE.heavy.adultDailyG}g·어린이 {PROFILE.heavy.kidDailyG}g, 보통 {PROFILE.normal.adultDailyG}g·{PROFILE.normal.kidDailyG}g, 적게 먹음 {PROFILE.light.adultDailyG}g·{PROFILE.light.kidDailyG}g),
            여기에 인원수를 곱해 하루 소비량을 구합니다. 하루 소비량에 보관 기간(1개월 = 30일)을 곱하면 필요한 김치 총량이 나오고, 이를 <strong>절인 배추 1포기 ≈ 2.5kg</strong>으로 나눈 뒤 올림해 포기 수를 정합니다.
            양념·젓갈은 포기 수에 배추 1포기당 비율을 곱하고, 개·단·포기로 사는 재료는 올림한 수량으로 비용을 매깁니다.
          </p>
          <p className="g-p">
            예를 들어 성인 2명·어린이 2명이 &lsquo;보통&rsquo;으로 3개월 먹는다면 하루 {EX_DAILY}g × 90일 = {won(EX_TOTAL_G)}g이고, {won(EX_TOTAL_G)} ÷ 2,500 = {(EX_TOTAL_G / 2500).toFixed(2)}이므로 <strong>{EX_CAB}포기</strong>가 됩니다.
            이때 고춧가루 {exItem('gochugaru').displayAmount}{exItem('gochugaru').displayUnit}, 다진 마늘 {exItem('maneul').displayAmount}{exItem('maneul').displayUnit}, 무 {exItem('mu').displayAmount}개, 쪽파 {exItem('jjokpa').displayAmount}단이 필요하고,
            시세 조회 없이 기본 평균가로 계산한 예상 비용은 약 {won(EX_COST)}원입니다. KAMIS 시세가 반영되면 이 금액은 달라집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>가족 구성</th>
                  {CAB_COLS.map(c => (
                    <th scope="col" key={c.label} style={{ ...headCell, textAlign: 'right' }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAB_TABLE.map(r => (
                  <tr key={r.label}>
                    <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</th>
                    {r.cells.map((n, j) => (
                      <td key={j} style={{ ...numCell, color: j === 1 ? 'var(--accent-ink)' : 'var(--text)', fontWeight: j === 1 ? 700 : 400 }}>{n}포기</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 도구의 계산식으로 생성한 값입니다(추가 김치 없음). 1포기 미만은 1포기로 올립니다. 하루 섭취량은 가정 조건별 추정치이므로 우리 집이 실제로 먹는 속도에 맞춰 패턴을 고르세요.
          </p>
        </section>

        {/* 2. 배추 1포기당 비율 */}
        <section>
          <h2 className="g-h2">배추 1포기당 양념 표준 비율</h2>
          <p className="g-p">
            아래 표는 도구가 쓰는 재료 데이터를 그대로 옮긴 것입니다. 가정 김장 레시피에서 흔히 쓰는 서울·중부식 배추김치 비율로, 12포기 열은 도구로 12포기를 계산했을 때의 장보기 수량입니다.
            &lsquo;시세 연동&rsquo; 표시가 있는 품목만 KAMIS 값으로 바뀌고, 나머지는 표의 기본 단가로 고정됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>재료</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>1포기당</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>12포기</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>기본 단가</th>
                  <th scope="col" style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                {RATIO_ROWS.map(r => (
                  <tr key={r.id}>
                    <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</th>
                    <td style={{ ...numCell, fontWeight: 700 }}>{r.per}</td>
                    <td style={numCell}>{r.twelve}</td>
                    <td style={numCell}>{r.price}{r.live && <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-ink)' }}>시세 연동</span>}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: '16px' }}>
            절임 소금은 포기당 굵은소금 {SALT}g·물 {WATER_L}L로 잡혀 있습니다. 소금을 전부 물에 녹이면 농도는 {SALT} ÷ ({SALT} + {won(WATER_L * 1000)}) ≈ {BRINE_PCT}%인데,
            실제로는 일부를 물에 풀어 배추를 적신 뒤 나머지를 두꺼운 줄기 사이사이에 뿌리는 방식이 흔합니다. 같은 양이라도 줄기에 뿌리는 비율을 늘리면 더 짜게 절여지니, 첫해에는 절임이 끝난 뒤 줄기 한 조각을 씹어 간을 확인하세요.
          </p>
          <p className="g-note">
            ※ 지역·집안마다 비율이 다릅니다. 남부 지방은 젓갈과 양념을 넉넉히 넣고 간을 세게 하는 편이고, 추운 지방은 상대적으로 담백하게 담그는 경향이 있습니다. 도구의 단가 칸과 마찬가지로 이 비율도 출발점으로 쓰세요.
          </p>
        </section>

        {/* 3. 추가 김치 */}
        <section>
          <h2 className="g-h2">추가 김치를 고르면 달라지는 것</h2>
          <p className="g-p">
            깍두기·총각김치·동치미·파김치·갓김치를 함께 고르면 도구는 두 가지를 합니다. 첫째, &lsquo;배추김치 양 자동 감산&rsquo;이 켜져 있으면 김치 종류별 감산율만큼 배추를 줄입니다(여러 개를 고르면 감산율을 더함).
            둘째, 감산 전 포기 수 × 감산율 × 2.5kg을 그 김치의 양으로 보고, 김치 1kg당 주재료와 양념을 더합니다. 양념은 같은 무게의 배추김치 대비 비율로 넣는데, 무가 주재료인 깍두기·총각김치는 0.6배, 파김치·갓김치는 1배이고, 동치미는 고춧가루·젓갈·찹쌀풀을 넣지 않습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>김치</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>배추 감산율</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>양 ({EX_CAB}포기 기준)</th>
                  <th scope="col" style={headCell}>추가 주재료</th>
                  <th scope="col" style={headCell}>양념 비율</th>
                </tr>
              </thead>
              <tbody>
                {VARIANT_ROWS.map(v => (
                  <tr key={v.id}>
                    <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.name}</th>
                    <td style={numCell}>{v.reduce}</td>
                    <td style={numCell}>약 {v.kg}kg</td>
                    <td style={cell}>{v.extra}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{v.seasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위 예시({EX_CAB}포기)에 깍두기를 더하면 배추는 {KKAK_ADJ}포기로 줄고, 깍두기 양은 줄어들기 전 {EX_CAB}포기를 기준으로 잡습니다. 감산을 끄면 배추는 {EX_CAB}포기 그대로 두고 깍두기 재료만 더합니다.
          </p>
        </section>

        {/* 4. 가격 데이터 */}
        <section>
          <h2 className="g-h2">가격 데이터는 어디서 오나</h2>
          <div style={card}>
            <p className="g-p">
              도구는 <strong>KAMIS(한국농수산식품유통공사 농산물유통정보)</strong> OpenAPI로 서울 소매가를 조회합니다. 응답은 1시간 단위로 캐시되므로 같은 시간대에는 같은 값이 보입니다.
            </p>
            <ul className="g-list">
              <li><strong>시세 연동 품목</strong>: 배추·무·쪽파·고춧가루·마늘·생강 (KAMIS의 kg 단가를 포기·개·단·g 단위로 환산)</li>
              <li><strong>고정 평균가 품목</strong>: 멸치액젓·새우젓·굵은소금·설탕·찹쌀가루 (2025년 11월 기준)</li>
              <li><strong>조회 실패 시</strong>: 모든 품목을 평균가로 계산하고 화면에 &lsquo;평균가로 계산&rsquo;이라고 표시</li>
              <li><strong>직접 입력</strong>: 단가 칸에 전단지·시장 가격을 넣으면 그 값이 시세보다 우선</li>
            </ul>
            <p className="g-note" style={{ marginBottom: 0 }}>
              시세 원본은 <a href="https://www.kamis.or.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>KAMIS 농산물유통정보(kamis.or.kr)</a>에서 품목·지역별로 직접 확인할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 5. 김장 시기 */}
        <section>
          <h2 className="g-h2">김장 시기 · 지역별 차이</h2>
          <p className="g-p">
            기상청은 김장 적기를 <strong>일 평균기온이 4℃ 이하로 유지되고 일 최저기온이 0℃ 이하로 내려가는 무렵</strong>으로 안내해 왔습니다. 그보다 따뜻하면 담근 김치가 실온에서 빨리 시어지고, 한파가 온 뒤에는 배추가 얼어 절이기 어렵습니다.
            그래서 북쪽·내륙일수록 빠르고 남쪽·해안일수록 늦습니다. 아래는 평년 기온을 기준으로 한 대략적인 경향이며, 그해 기온에 따라 1~2주씩 달라지므로 김장 날짜를 잡기 전에 지역 예보를 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>지역</th>
                  <th scope="col" style={headCell}>대략적 시기</th>
                  <th scope="col" style={headCell}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '강원·경기 북부', d: '11월 중순', t: '추위가 일찍 와 김장도 가장 이른 편' },
                  { r: '서울·인천·경기 남부', d: '11월 말~12월 초', t: '수도권 도매시장 물량이 몰리는 시기' },
                  { r: '충청·전북', d: '11월 말~12월 초', t: '젓갈을 다양하게 쓰는 지역' },
                  { r: '전남·경남', d: '12월 초~중순', t: '늦김장, 양념을 넉넉히 넣는 편' },
                  { r: '제주', d: '12월 중순 이후', t: '겨울이 따뜻해 짧게 먹을 양 위주' },
                ].map(row => (
                  <tr key={row.r}>
                    <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.r}</th>
                    <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--accent-ink)', fontWeight: 600 }}>{row.d}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 흔한 실수 */}
        <section>
          <h2 className="g-h2">절임·버무리기·보관에서 자주 하는 실수</h2>
          <ul className="g-list">
            <li><strong>절임 확인을 시간으로만 한다</strong> — 배추 크기와 기온에 따라 4시간이면 되는 날도, 8시간이 걸리는 날도 있습니다. 두꺼운 줄기를 구부려 부러지지 않고 휘는지로 판단하세요.</li>
            <li><strong>헹군 뒤 물을 덜 뺀다</strong> — 배추에 남은 물이 양념을 묽게 만들고 싱거워집니다. 소쿠리에 엎어 물이 거의 떨어지지 않을 때까지 둡니다.</li>
            <li><strong>찹쌀풀을 뜨거울 때 섞는다</strong> — 풀은 묽게 쑤어 완전히 식힌 뒤 고춧가루와 섞어야 양념이 익지 않고 고르게 섞입니다.</li>
            <li><strong>통을 가득 채운다</strong> — 발효가 시작되면 가스와 국물이 올라와 넘칩니다. 80% 정도만 담고 비닐이나 우거지로 표면을 덮어 누릅니다.</li>
            <li><strong>실온에 너무 오래 둔다</strong> — 도구 일정처럼 실온 발효는 1~2일(가을이면 더 짧게)로 끝내고 김치냉장고로 옮깁니다.</li>
            <li><strong>한꺼번에 너무 많이 산다</strong> — 첫해라면 계산 결과의 절반으로 시작해 우리 집 소비 속도를 확인한 뒤 이듬해 늘리는 편이 버리는 양이 적습니다.</li>
          </ul>
          <Callout tone="warn" title="김치는 익히지 않는 음식입니다">
            배추를 헹구는 물과 양념에 넣는 물은 반드시 먹는 물(수돗물·정수)을 쓰고, 버무리기 전에 손과 도구를 씻으세요. 가열 과정이 없어 물이나 손에서 옮은 식중독균이 그대로 남을 수 있습니다. 김치를 먹은 뒤 구토·설사가 여럿에게 함께 나타나면 의료기관을 찾으세요.
          </Callout>
        </section>

        <Faq items={FAQ_LD} />

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/recipe" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>레시피 비율 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>김치찌개·김치전 등 응용</div>
            </Link>
            <Link href="/tools/cooking/food-storage" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 보관 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>김치·발효식품 보관</div>
            </Link>
            <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 분량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>장보기 합산</div>
            </Link>
            <Link href="/tools/cooking/baker-percent" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥖</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>베이커 퍼센트</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>비율 기반 레시피</div>
            </Link>
            <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>없는 재료 대체</div>
            </Link>
            <Link href="/tools/finance/cost-rate" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>음식점 원가율</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>식당 운영 시</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
