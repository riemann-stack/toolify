import Link from 'next/link'
import NutsClient from './NutsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { NUTS_DATA, POPULAR_MIXES, PROC_DATA, SELENIUM_RDA, SELENIUM_UL, dangerThresholdOf } from './nutsData'

export const metadata = buildMetadata({
  path: '/tools/cooking/nuts',
  title: '견과류 섭취량 계산기 — 12종 알 수·혼합·셀레늄 경고',
  description: '12종 견과류 일일 권장 알 수·칼로리·영양소 + 혼합 직접 입력. 알레르기 필터와 셀레늄 자동 경고, 인기 믹스 6종.',
  keywords: ['견과류 적정량', '아몬드 하루', '호두 하루', '브라질너트 셀레늄', '견과류 혼합 계산', '견과류 알레르기', '다이어트 견과류', '견과류 칼로리', '셀레늄 과다', '하루 한 줌'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}

/* ── 가이드 표·예시 — 도구와 같은 데이터(nutsData)로 빌드 시 생성 ── */
const nutOf = (key: string) => NUTS_DATA.find(n => n.key === key)!
const r1 = (v: number) => Math.round(v * 10) / 10
/** 도구와 같은 비례 계산 — 1회 기준 영양값 × (g ÷ 1회 기준 g) */
const portion = (key: string, grams: number) => {
  const n = nutOf(key)
  const ratio = grams / n.servingGrams
  return { kcal: n.caloriePerServing * ratio, protein: n.protein * ratio, selenium: n.selenium * ratio }
}
const BRAZIL = nutOf('brazilNut')
const BRAZIL_UL_G = dangerThresholdOf(BRAZIL)            // 브라질너트만으로 셀레늄 상한(400μg)에 닿는 양
const BRAZIL_PER_NUT = BRAZIL.servingCount ? BRAZIL.selenium / BRAZIL.servingCount : 0
const MIX_ROWS = POPULAR_MIXES.map(m => {
  const parts = m.items.map(it => ({ name: nutOf(it.key).name, grams: it.grams, ...portion(it.key, it.grams) }))
  return {
    id: m.id, name: m.name, desc: m.desc,
    recipe: parts.map(p => `${p.name} ${p.grams}g`).join(' + '),
    grams: parts.reduce((a, p) => a + p.grams, 0),
    kcal: Math.round(parts.reduce((a, p) => a + p.kcal, 0)),
    protein: r1(parts.reduce((a, p) => a + p.protein, 0)),
    selenium: r1(parts.reduce((a, p) => a + p.selenium, 0)),
  }
})
const MIX_MAX_SE = Math.max(...MIX_ROWS.map(m => m.selenium))
// 계산 예시 — 아몬드 28g + 브라질너트 10g (생/무염)
const EX_A = portion('almond', 28)
const EX_B = portion('brazilNut', 10)
const EX_KCAL = Math.round(EX_A.kcal + EX_B.kcal)
const EX_SE = r1(EX_A.selenium + EX_B.selenium)
const EX_SE20 = EX_A.selenium + portion('brazilNut', 20).selenium

const FAQ_LD = [
  {
    q: '견과류는 하루에 얼마나 먹어야 하나요?',
    a: '본 도구는 대부분의 견과류 1회 기준을 <strong>28g(1온스, 한 줌)</strong>으로 잡습니다. 미국 영양성분 표시와 USDA FoodData Central에서 흔히 쓰는 단위로, 아몬드 약 23알, 호두 반쪽 약 14개, 피스타치오 약 49알에 해당합니다(브라질너트만 셀레늄 때문에 10g, 약 2알). 28g은 150~200kcal 정도라 하루 2,000kcal를 먹는 사람의 간식 몫(총 열량의 10~15%, 200~300kcal) 안에 들어갑니다. 도구의 합산 칼로리가 300kcal를 넘으면 경고가 뜨는 이유입니다.',
  },
  {
    q: '브라질너트는 왜 1~2알만 먹어야 하나요?',
    a: `브라질너트는 셀레늄 함량이 매우 높아 USDA 성분표 평균으로 1알(약 5g)에 약 ${Math.round(BRAZIL_PER_NUT)}μg이 들어 있고, 산지 토양에 따라 개체 편차도 큽니다. 2020 한국인 영양소 섭취기준의 성인 셀레늄 권장섭취량은 <strong>${SELENIUM_RDA}μg</strong>, 상한섭취량은 <strong>${SELENIUM_UL}μg</strong>이라 1알로도 권장량을 넘기고, 브라질너트만으로 약 ${Math.round(BRAZIL_UL_G)}g(4알 남짓)이면 상한에 닿습니다. 다른 음식으로 먹는 셀레늄까지 생각해 하루 1~2알이 권장됩니다. 셀레늄을 장기간 과잉 섭취하면 탈모, 손발톱 변형, 신경 증상이 나타날 수 있습니다. 도구는 입력한 견과류의 셀레늄을 합산해 권장량·상한 대비 비율로 보여줍니다.`,
  },
  {
    q: '여러 견과류를 섞어 먹는 게 더 좋나요?',
    a: '일반적으로 권장됩니다. 견과류마다 강점이 다르고(호두 오메가3, 아몬드·해바라기씨 비타민E, 호박씨 아연, 땅콩 단백질), 한 가지만 먹을 때보다 질리지 않아 꾸준히 먹기 쉽습니다. 본 도구의 인기 믹스 6종 프리셋(다이어트·근육·뇌 건강·심혈관·균형·트레일)은 한 번 클릭으로 적용되며, 알레르기 그룹을 체크하면 해당 견과가 든 믹스는 비활성화됩니다.',
  },
  {
    q: '견과류를 먹으면 살이 찌나요?',
    a: '견과류는 칼로리가 높지만(28g당 150~200kcal) 적정량을 지키면 체중 관리에 불리하지 않다는 연구가 많습니다. 불포화지방과 식이섬유·단백질이 포만감을 높여 다른 간식을 줄이는 효과가 있기 때문입니다. 다만 봉지째 먹다 보면 100g(600kcal 안팎)도 금방이니, 도구로 하루 양을 정해 덜어 먹는 것이 핵심입니다.',
  },
  {
    q: '견과류 알레르기는 어떻게 구분하나요?',
    a: '크게 세 그룹입니다. <strong>나무 견과류</strong>(아몬드·캐슈넛·피스타치오·호두·피칸·헤이즐넛·마카다미아·브라질너트·잣)는 서로 교차 반응이 흔하고, <strong>땅콩</strong>은 식물학적으로 콩과라 별도 그룹, <strong>씨앗류</strong>(해바라기씨·호박씨)는 또 다른 그룹입니다. 단, 그룹이 달라도 같은 공장에서 가공되며 교차 오염될 수 있습니다. 본 도구의 알레르기 필터는 그룹 단위로 해당 견과를 숨기고 합산에서 뺍니다.',
  },
  {
    q: '영유아·어린이는 견과류를 언제부터 먹어도 되나요?',
    a: '두 가지를 구분해야 합니다. <strong>통견과·큰 조각은 질식 위험</strong> 때문에 만 5세 이하에게 주지 않는 것이 일반적인 안전 수칙이고, 그 전에는 곱게 갈거나 페이스트로 풀어 먹입니다. 반면 <strong>알레르기 예방을 이유로 도입을 늦출 필요는 없다</strong>는 것이 최근 지침입니다 — 미국 NIAID 지침(2017)은 이유식을 시작한 영아에게 땅콩을 곱게 간 가루나 물에 묽힌 땅콩버터 형태로 넣도록 권하고, 심한 아토피 피부염이나 달걀 알레르기가 있는 고위험 영아는 먼저 전문의 평가를 거쳐 생후 4~6개월 무렵 시작하도록 합니다. 해당되거나 가족력이 있으면 소아청소년과·알레르기 전문의와 먼저 상담하세요.',
  },
  {
    q: '신장·갑상선 환자도 견과류 먹어도 되나요?',
    a: '<strong>의사 상담이 먼저입니다.</strong> 신장 질환은 인·칼륨 제한이 필요한 경우가 많은데 견과류는 두 성분이 모두 많은 편이라 처방 식단이 우선이고, 본 도구 결과를 그대로 적용하면 안 됩니다. 갑상선 질환은 셀레늄(브라질너트)이 관여하므로 갑상선 호르몬제를 복용 중이면 보충제·브라질너트 섭취를 주치의와 상의하세요. 당뇨는 무가당 견과류라면 대체로 괜찮지만 꿀·초콜릿 코팅 제품은 당분이 더해집니다.',
  },
  {
    q: '견과류 알레르기가 의심되면 어떻게 확인하나요?',
    a: '<strong>반드시 의료진 진단을 받으세요.</strong> 증상은 가벼움(입 가려움·두드러기) → 중간(부종·복통·구토) → 심함(호흡 곤란·아나필락시스) 순입니다. 호흡 곤란·의식 저하·전신 두드러기가 나타나면 아나필락시스 응급 상황이니 즉시 119에 신고하고, 처방받은 에피네프린 자가주사기가 있으면 바로 사용하세요. 진단은 알레르기 전문의·소아청소년과에서 피부 단자 시험, 혈액 특이 IgE 검사, 전문의 감독하의 경구 유발 시험으로 합니다.',
  },
  {
    q: '가공 견과류(가염·꿀·초콜릿)는 얼마나 다른가요?',
    a: `본 도구의 가공 상태 토글은 입력한 g을 견과 자체 무게로 보고, 코팅·기름·꿀·소금으로 더해지는 열량과 나트륨을 배수·추가량으로 어림합니다(실측값이 아닌 도구 추정값) — ${PROC_DATA.filter(p => p.key !== 'raw').map(p => `${p.label}: 칼로리 ×${p.calFactor}${p.sodiumAdd ? `, 나트륨 +${p.sodiumAdd}mg/28g` : ''}`).join(' · ')}. 초콜릿·꿀 코팅은 설탕이 더해지고, 가염·시즈닝 제품은 나트륨이 더해집니다. 같은 무게로 비교하면 코팅 제품은 견과 비율이 그만큼 줄어 열량 차이가 생각보다 작을 수 있으니, 실제 값은 제품 영양성분표를 우선하세요. 건강 목적이라면 평소엔 무염·생/건조, 가공 제품은 가끔 정도가 적당합니다.`,
  },
  {
    q: '어떤 견과류가 가장 건강에 좋나요?',
    a: '목적에 따라 다릅니다. 오메가3(ALA)는 호두, 비타민E는 아몬드·해바라기씨, 단백질은 땅콩·호박씨, 셀레늄은 브라질너트(소량)가 강점입니다. 특정 견과 하나에 집중하기보다 여러 종류를 한 줌 안에서 돌려 먹는 편이 영양 균형에 유리합니다 — 도구의 균형 믹스 프리셋이 그런 예시입니다.',
  },
]

export default function NutsPage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/nuts">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />견과류 섭취량 계산기
      </h1>
      <p className="tp-lead">
        12종 견과류 일일 권장 알 수·칼로리·영양소. 알레르기 필터와 <strong style={{ color: 'var(--text)' }}>셀레늄 자동 경고</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="셀레늄 권장 60μg·상한 400μg(2020 한국인 영양소 섭취기준) · 영양 성분은 USDA FoodData Central 평균값"
        sources={[
          { label: '보건복지부 2020 한국인 영양소 섭취기준', href: 'https://www.mohw.go.kr/board.es?mid=a10411010100&bid=0019&act=view&list_no=362385' },
          { label: 'USDA FoodData Central', href: 'https://fdc.nal.usda.gov/' },
          { label: 'NIH ODS 셀레늄 팩트시트', href: 'https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional/' },
          { label: 'NIAID 땅콩 알레르기 예방 지침(2017)', href: 'https://www.niaid.nih.gov/sites/default/files/addendum-peanut-allergy-prevention-guidelines.pdf' },
        ]}
      />

      <NutsClient />

      <GuideDivider />

      {/* 1. 빠른 참조표 — NUTS_DATA에서 생성 */}
      <h2 className="g-h2">12종 견과류 빠른 참조표</h2>
      <p className="g-p">
        계산기가 쓰는 견과류별 1회 기준량과 그때의 칼로리·단백질·대표 영양소, 그리고 하루 권장 한도입니다. 입력한 무게가 이 한도를 넘으면 &lsquo;초과&rsquo;로, 한도의 3배(브라질너트는 셀레늄 상한 도달량) 이상이면 &lsquo;위험&rsquo;으로 표시됩니다.
        알 수는 알 크기가 고른 견과만 적었고, 해바라기씨·호박씨·잣처럼 알이 작은 것은 무게로 재는 편이 정확합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>견과류</th>
              <th scope="col" style={headCell}>1회</th>
              <th scope="col" style={headCell}>알 수</th>
              <th scope="col" style={headCell}>칼로리</th>
              <th scope="col" style={headCell}>단백질</th>
              <th scope="col" style={headCell}>대표 영양소</th>
              <th scope="col" style={headCell}>하루 한도</th>
            </tr>
          </thead>
          <tbody>
            {NUTS_DATA.map(n => (
              <tr key={n.key}>
                <td style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap' }}>{n.name}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{n.servingGrams}g</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{n.servingCount === null ? '—' : n.key === 'walnut' ? `반쪽 약 ${n.servingCount}개` : `약 ${n.servingCount}알`}</td>
                <td style={{ ...cell, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{n.caloriePerServing}kcal</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{n.protein}g</td>
                <td style={cell}>{n.keyNutrient} {n.keyNutrientAmount.replace(/\s*\(.*\)$/, '')}</td>
                <td style={{ ...cell, whiteSpace: 'nowrap', color: n.danger ? 'var(--danger)' : 'var(--text)' }}>{n.maxDaily}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        영양 성분은 <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>USDA FoodData Central</a> 평균값, 셀레늄 권장·상한 기준은 2020 한국인 영양소 섭취기준(보건복지부·한국영양학회)입니다. 값은 품종·가공·브랜드에 따라 달라지는 평균치입니다.
      </p>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산 방식 — 칼로리·셀레늄은 이렇게 합산됩니다</h2>
      <p className="g-p">
        계산기는 견과마다 <strong>1회 기준 영양값 × (입력 g ÷ 1회 기준 g)</strong>로 비례 계산한 뒤 모두 더합니다. 칼로리에는 가공 상태 배수(볶음 ×1.05, 초콜릿·시즈닝 ×1.6 등)를 곱하고, 나트륨은 가공으로 더해지는 양을 28g당 값으로 환산해 더합니다.
        셀레늄 합계는 성인 권장섭취량 60μg과 상한섭취량 400μg 대비 비율로 표시되고, 하루 칼로리 목표를 비워 두면 체중 × 25(감량)·32(유지)·40(증량)kcal를 10kcal 단위로 반올림해 자동으로 잡습니다.
      </p>
      <p className="g-p">
        예를 들어 생 아몬드 28g과 브라질너트 10g을 함께 넣으면 칼로리는 {Math.round(EX_A.kcal)} + {Math.round(EX_B.kcal)} = <strong>{EX_KCAL}kcal</strong>, 셀레늄은 {r1(EX_A.selenium)} + {r1(EX_B.selenium)} = <strong>{EX_SE}μg</strong>입니다.
        권장량의 {Math.round(EX_SE / SELENIUM_RDA * 100)}%이지만 상한의 {Math.round(EX_SE / SELENIUM_UL * 100)}%라 하루 몫으로는 괜찮은 수준입니다. 여기서 브라질너트만 20g(약 4알)으로 늘리면 셀레늄이 {Math.round(EX_SE20)}μg, 상한의 {Math.round(EX_SE20 / SELENIUM_UL * 100)}%까지 올라가고 브라질너트 하루 한도(10g) 초과 표시가 뜹니다.
        몸무게 65kg·유지 목표라면 자동 목표는 2,080kcal이고, 위 조합은 그 약 {Math.round(EX_KCAL / 2080 * 100)}%로 간식 몫(10~15%) 안에 들어옵니다.
      </p>

      {/* 3. 브라질너트 셀레늄 */}
      <h2 className="g-h2">브라질너트 셀레늄 주의</h2>
      <Callout tone="warn" title={`브라질너트 1알(약 5g) = 셀레늄 약 ${Math.round(BRAZIL_PER_NUT)}μg (개체 편차 큼)`}>
        <ul className="g-list" style={{ margin: 0 }}>
          <li>성인 하루 셀레늄 권장섭취량 <strong>{SELENIUM_RDA}μg</strong>, 상한섭취량 <strong>{SELENIUM_UL}μg</strong> (2020 한국인 영양소 섭취기준)</li>
          <li>브라질너트 <strong>1알</strong>로도 하루 권장섭취량을 채울 수 있음</li>
          <li>브라질너트만으로 약 <strong>{Math.round(BRAZIL_UL_G)}g(4알 남짓)</strong>이면 상한에 도달 — 다른 음식의 셀레늄까지 고려해 하루 1~2알 권장</li>
        </ul>
      </Callout>
      <p className="g-p" style={{ marginTop: 14 }}>
        <strong>셀레늄 과잉 섭취 증상(셀레늄 중독)</strong>: 탈모, 손발톱이 부서지거나 빠짐, 구토·설사, 피로감, 숨에서 나는 마늘 냄새, 심하면 신경 증상. 셀레늄 함량은 브라질너트가 자란 토양에 따라 몇 배씩 차이 나서 성분표 평균보다 훨씬 많은 알도 있습니다.
        견과류 혼합팩은 브라질너트 비율을 반드시 확인하고, 셀레늄이 든 종합비타민을 먹고 있다면 <Link href="/tools/health/supplement" style={{ color: 'var(--accent-ink)' }}>영양제 성분 체크</Link>로 중복을 함께 보세요.
      </p>

      {/* 4. 견과류 혼합 가이드 — POPULAR_MIXES에서 생성 */}
      <h2 className="g-h2">견과류 혼합 가이드 — 인기 믹스 6종</h2>
      <p className="g-p">
        계산기의 <strong>인기 믹스 프리셋</strong>은 목적별로 짠 예시 조합이며, 한 번 클릭하면 아래 무게가 그대로 입력됩니다. 칼로리·단백질·셀레늄은 생/무염 기준으로 계산기와 같은 방식으로 합산한 값입니다.
        브라질너트가 빠져 있어 셀레늄은 가장 많은 믹스도 {MIX_MAX_SE}μg으로 권장량의 {Math.round(MIX_MAX_SE / SELENIUM_RDA * 100)}% 수준입니다 — 셀레늄까지 채우고 싶다면 믹스에 브라질너트 1알(약 5g)만 더해 보세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>믹스</th>
              <th scope="col" style={headCell}>구성</th>
              <th scope="col" style={headCell}>총량</th>
              <th scope="col" style={headCell}>칼로리</th>
              <th scope="col" style={headCell}>단백질</th>
              <th scope="col" style={headCell}>셀레늄</th>
            </tr>
          </thead>
          <tbody>
            {MIX_ROWS.map(m => (
              <tr key={m.id}>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}><strong>{m.name}</strong><br /><span style={{ color: 'var(--muted)', fontSize: 12 }}>{m.desc}</span></td>
                <td style={cell}>{m.recipe}</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{m.grams}g</td>
                <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--accent-ink)', fontWeight: 700 }}>{m.kcal}kcal</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{m.protein}g</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{m.selenium}μg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        알레르기 필터를 켜면 해당 그룹 견과류가 포함된 믹스는 자동으로 비활성화됩니다.
      </p>

      {/* 5. 알레르기 그룹 가이드 */}
      <h2 className="g-h2">알레르기 그룹 가이드</h2>
      <p className="g-p">
        견과류 알레르기는 그룹 안에서 교차 반응이 생길 수 있습니다. 본 도구의 알레르기 필터로 해당 그룹 전체를 한 번에 제외할 수 있습니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { group: '나무 견과류 (Tree nuts)', list: '아몬드 · 캐슈넛 · 피스타치오 · 호두 · 피칸 · 헤이즐넛 · 마카다미아 · 브라질너트 · 잣', note: '하나에 알레르기가 있으면 다른 나무 견과류도 주의 (교차 반응 흔함)' },
          { group: '콩과 (Legume)', list: '땅콩', note: '식물학적으로 견과류가 아닌 콩과 — 별도 알레르기 그룹. 영유아에게 흔한 알레르기 식품.' },
          { group: '씨앗류 (Seeds)', list: '해바라기씨 · 호박씨', note: '나무 견과류 알레르기와 별개. 단, 가공 시 교차 오염 가능.' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '6px' }}>{g.group}</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px', lineHeight: 1.6 }}>{g.list}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.note}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Callout tone="warn" title="아나필락시스 (응급)">
          호흡 곤란 · 의식 저하 · 전신 두드러기 → 즉시 <strong>119 신고</strong>, 처방받은 에피네프린 자가주사기가 있으면 바로 사용. 본 도구는 진단 도구가 아닙니다 — 의심되면 알레르기 전문의 진료를 받으세요.
        </Callout>
      </div>

      {/* 6. 영유아·임산부·환자 가이드 */}
      <h2 className="g-h2">영유아·임산부·환자 가이드</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>대상</th>
              <th scope="col" style={headCell}>주의사항</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>이유식 시작~돌 무렵</strong></td><td style={cell}>통견과·조각 금지(질식). 알레르기 예방을 위해 늦출 필요는 없어 곱게 간 가루·묽힌 땅콩버터로 소량 도입 (NIAID 2017)</td></tr>
            <tr><td style={cell}><strong>심한 습진·달걀 알레르기 영아</strong></td><td style={cell}>땅콩 알레르기 고위험 — 전문의 평가 후 생후 4~6개월 무렵 도입</td></tr>
            <tr><td style={cell}><strong>만 5세 이하</strong></td><td style={cell}>통견과는 질식 위험. 잘게 부수거나 갈아서 제공</td></tr>
            <tr><td style={cell}><strong>가족력 있는 영유아</strong></td><td style={cell}>소아청소년과 상담 후 도입. 첫 도입은 소량·낮 시간·집에서</td></tr>
            <tr><td style={cell}><strong>임산부</strong></td><td style={cell}>알레르기가 없다면 적정량은 일반적으로 무방. 브라질너트는 셀레늄 상한 주의</td></tr>
            <tr><td style={cell}><strong>신장 질환</strong></td><td style={cell}>인·칼륨 제한이 필요한 경우가 많음 — 처방 식단 우선</td></tr>
            <tr><td style={cell}><strong>갑상선 질환</strong></td><td style={cell}>셀레늄(브라질너트)·보충제 섭취는 주치의와 상의</td></tr>
            <tr><td style={cell}><strong>당뇨</strong></td><td style={cell}>무가당 견과류는 대체로 무방. 꿀·초콜릿 코팅 제품은 당분 추가</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        본 도구는 일반 가이드입니다. 기저 질환·임신·영유아는 반드시 의사·영양사와 상담하세요. 응급 119 · 식약처 식품안전 상담 1399.
      </p>

      {/* 7. 견과류 가성비 */}
      <h2 className="g-h2">견과류 가성비 (가격대 참고)</h2>
      <p className="g-p">
        견과류 가격은 원산지·시즌·구매 채널에 따라 크게 달라서, 아래는 종류 간 <strong>상대 비교용 대략적 가격대</strong>입니다(실시간 시세·공식 조사값 아님). 실제로 살 때는 <Link href="/tools/life/unit-price" style={{ color: 'var(--accent-ink)' }}>단가 비교 계산기</Link>로 g당 가격을 직접 비교하세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>견과류</th>
              <th scope="col" style={headCell}>1g당 가격대</th>
              <th scope="col" style={headCell}>1회분(28g) 환산</th>
              <th scope="col" style={headCell}>가성비</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>땅콩</td><td style={cell}>~12원</td><td style={cell}>~330원</td><td style={{ ...cell, color: 'var(--success)' }}>★★★★★</td></tr>
            <tr><td style={cell}>해바라기씨</td><td style={cell}>~20원</td><td style={cell}>~560원</td><td style={{ ...cell, color: 'var(--success)' }}>★★★★</td></tr>
            <tr><td style={cell}>호박씨</td><td style={cell}>~30원</td><td style={cell}>~840원</td><td style={{ ...cell, color: 'var(--success)' }}>★★★★</td></tr>
            <tr><td style={cell}>아몬드</td><td style={cell}>~50원</td><td style={cell}>~1,400원</td><td style={{ ...cell, color: 'var(--accent-ink)' }}>★★★</td></tr>
            <tr><td style={cell}>호두</td><td style={cell}>~60원</td><td style={cell}>~1,680원</td><td style={{ ...cell, color: 'var(--warning)' }}>★★★</td></tr>
            <tr><td style={cell}>캐슈넛</td><td style={cell}>~70원</td><td style={cell}>~1,960원</td><td style={{ ...cell, color: 'var(--warning)' }}>★★★</td></tr>
            <tr><td style={cell}>브라질너트</td><td style={cell}>~90원</td><td style={cell}>~900원 (10g)</td><td style={{ ...cell, color: 'var(--warning)' }}>★★ (소량만)</td></tr>
            <tr><td style={cell}>피스타치오</td><td style={cell}>~120원</td><td style={cell}>~3,360원</td><td style={{ ...cell, color: 'var(--warning)' }}>★★</td></tr>
            <tr><td style={cell}>마카다미아</td><td style={cell}>~200원</td><td style={cell}>~5,600원</td><td style={{ ...cell, color: 'var(--danger)' }}>★</td></tr>
            <tr><td style={cell}>잣</td><td style={cell}>~250원</td><td style={cell}>~7,000원</td><td style={{ ...cell, color: 'var(--danger)' }}>★</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        특정 브랜드 추천이 아닙니다. 영양 대비로 보면 단백질은 땅콩·호박씨, 비타민E는 아몬드·해바라기씨가 값에 비해 효율적입니다.
      </p>

      {/* 8. 가공 상태 비교 — PROC_DATA에서 생성 */}
      <h2 className="g-h2">무염 vs 가염 vs 가공 견과류</h2>
      <p className="g-p">
        계산기의 가공 상태 선택은 입력한 g을 견과 자체 무게로 보고, 코팅·기름·꿀·소금으로 더해지는 열량과 나트륨을 아래 배수·추가량으로 어림합니다. 실측 영양값이 아니라 도구의 추정값이므로, 포장 제품은 영양성분표의 100g당 열량·나트륨을 우선하세요. 가공 방식은 견과 자체의 영양보다 <strong>더해지는 설탕·기름·소금</strong>의 차이가 크다는 점이 핵심입니다.
        볶음은 풍미가 좋아지는 대신 열에 약한 성분이 일부 줄고, 오일 코팅·꿀·초콜릿은 칼로리를, 가염·시즈닝은 나트륨을 끌어올립니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>가공 상태</th>
              <th scope="col" style={headCell}>칼로리 배수</th>
              <th scope="col" style={headCell}>나트륨 추가(28g당)</th>
              <th scope="col" style={headCell}>도구 안내</th>
            </tr>
          </thead>
          <tbody>
            {PROC_DATA.map(p => (
              <tr key={p.key}>
                <td style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.label}</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>×{p.calFactor}</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{p.sodiumAdd ? `+${p.sodiumAdd}mg` : '—'}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{p.warning ?? '건강 목적이면 기본 선택'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 9. 보관법 */}
      <h2 className="g-h2">견과류 보관법 & 산패 주의</h2>
      <p className="g-p">
        견과류는 <strong>불포화지방산이 풍부해 산패되기 쉽습니다</strong>. 기름 쩐 냄새가 나거나 쓴맛이 나면 산패 신호이므로 먹지 말고 버리세요. 곰팡이가 핀 견과는 곰팡이독소 위험이 있어 해당 부분만 골라내지 말고 봉지째 폐기하는 것이 안전합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>보관 방법</th>
              <th scope="col" style={headCell}>장소</th>
              <th scope="col" style={headCell}>기간</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: '밀폐 용기, 실온', p: '서늘하고 어두운 곳', t: '1~2개월' },
              { m: '밀폐 용기, 냉장', p: '4°C 이하',            t: '1~3개월' },
              { m: '밀폐 용기, 냉동', p: '−18°C 이하',          t: '최대 1년' },
              { m: '껍질 있는 통째',  p: '서늘한 곳',            t: '6개월 이상' },
            ].map((r, i) => (
              <tr key={i}>
                <td style={cell}>{r.m}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{r.p}</td>
                <td style={{ ...cell, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        갈거나 다진 견과류는 공기와 닿는 표면이 넓어 통견과보다 훨씬 빨리 산패합니다. 필요할 때만 갈아서 쓰세요.
      </p>

      {/* 10. FAQ */}
      <Faq items={FAQ_LD} />

      {/* 11. 의료 면책 */}
      <h2 className="g-h2">의료 면책</h2>
      <Callout tone="warn">
        <ul className="g-list" style={{ margin: 0 }}>
          <li>본 도구는 <strong>일반 영양 가이드</strong>입니다. 영양 정보는 평균값(<a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a> · 2020 한국인 영양소 섭취기준)입니다.</li>
          <li>알레르기·기저 질환(신장·갑상선)이 있으면 적정량이 다릅니다 → 의사·영양사 상담.</li>
          <li>본 도구는 <strong>영양 진단·알레르기 진단·특정 브랜드 추천·의약품/보충제 비교</strong>를 제공하지 않습니다.</li>
          <li>도움 받기: <a href="https://www.kns.or.kr/" target="_blank" rel="noopener noreferrer">한국영양학회</a>, <a href="https://www.foodsafetykorea.go.kr/" target="_blank" rel="noopener noreferrer">식약처 식품안전나라</a>(1399), 응급(아나필락시스) 119.</li>
        </ul>
      </Callout>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>하루 칼로리 목표</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>다이어트 기간</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체중 적정성</div>
        </Link>
        <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>셀레늄 중복</div>
        </Link>
        <Link href="/tools/life/unit-price" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏷️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단가 비교</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>견과류 가성비</div>
        </Link>
        <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 비율</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>베이킹 견과</div>
        </Link>
      </div>
    </ToolPage>
  )
}
