import Link from 'next/link'
import ServingClient from './ServingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  SERVING_DATA, AGE_BAND_LABEL, AGE_BAND_FACTOR, APPETITE_MULT, DIETARY_LABEL,
  calcItem, type Applied, type AgeBand, type DietaryFlag,
} from './servingData'

export const metadata = buildMetadata({
  path: '/tools/cooking/serving',
  title: '1인분 분량 계산기 — 파스타·고기·쌀 인분별 장보기 + 합산 목록 + 가족 저장',
  description: 'n인분 식단의 재료별 정확한 분량과 합산 장보기 마크다운. 냉장고 재료 빼기·가족 구성 저장·채식·비건·글루텐프리 필터.',
  keywords: ['1인분 분량 계산기', '파스타 1인분', '삼겹살 1인분', '쌀 1인분', '장보기 목록', '인분 환산', '4인분 장보기', '아이 포함 인분', '한국 가정 장보기', '냉장고 정리', '채식 장보기', '글루텐프리'],
})

/* ── 가이드 표·예시 — 계산기와 같은 calcItem(servingData)으로 빌드 시 생성 ── */
const item = (key: string) => SERVING_DATA.find(d => d.key === key)!
const A = (o: Partial<Applied> = {}): Applied => ({ meal: 'main', appetite: 'normal', carb: 'yes', variant: null, ...o })
const unitOf = (key: string) => item(key).unit.split(' ')[0]
const range = (key: string, people: number, o: Partial<Applied> = {}) => {
  const c = calcItem(item(key), people, A(o))
  return `${c.min.toLocaleString()}~${c.max.toLocaleString()}${unitOf(key)}`
}
const per = (key: string, o: Partial<Applied> = {}) => calcItem(item(key), 1, A(o)).perPerson

const CARB_ROWS = SERVING_DATA.filter(d => d.category === 'noodle' || d.category === 'grain').map(d => ({
  key: d.key, name: d.name, prep: d.prepNote, one: range(d.key, 1), two: range(d.key, 2), four: range(d.key, 4),
  cooked: d.rawToCooked === 1 ? '그대로' : `약 ${d.rawToCooked}배`,
}))
const PROTEIN_KEYS = ['beefGrill', 'bulgogi', 'shabuBeef', 'porkGrill', 'jeyukMeat', 'chickenBreast', 'chickenThigh', 'soupMeat', 'hotpotMeat', 'tofu']
const PROTEIN_ROWS = PROTEIN_KEYS.map(k => ({
  key: k, name: item(k).name, withCarb: range(k, 1), noCarb: range(k, 1, { carb: 'no' }), four: range(k, 4),
  cooked: item(k).rawToCooked === 1 ? '그대로' : `약 ${Math.round(item(k).rawToCooked * 100)}%`,
}))

/* 2020 한국인 영양소 섭취기준 활용자료(보건복지부·한국영양학회, 2022)의 식품군별 대표식품 1인 1회 분량 — 비교용 참고값.
   2025 한국인 영양소 섭취기준(2025-12 발표)의 식사구성안 값은 확인 후 교체할 것 */
const KDRI_ROWS = [
  { group: '곡류 (1회 300kcal)', food: '백미 90g (쌀밥 210g)', key: 'rice', kdri: 90 },
  { group: '곡류 (1회 300kcal)', food: '국수 말린 것 90g', key: 'somyeon', kdri: 90 },
  { group: '고기·생선·달걀·콩류 (1회 100kcal)', food: '돼지고기(생) 60g', key: 'porkGrill', kdri: 60 },
  { group: '고기·생선·달걀·콩류 (1회 100kcal)', food: '쇠고기(생) 60g', key: 'beefGrill', kdri: 60 },
  { group: '고기·생선·달걀·콩류 (1회 100kcal)', food: '닭고기(생) 60g', key: 'chickenBreast', kdri: 60 },
  { group: '고기·생선·달걀·콩류 (1회 100kcal)', food: '두부 80g', key: 'tofu', kdri: 80 },
].map(r => ({ ...r, name: item(r.key).name, tool: per(r.key), times: per(r.key) / r.kdri }))

/* 4인 메뉴 예시 — 계산기에서 재료를 함께 고르고 조리 방식을 지정했을 때와 같은 값 */
const MENUS = [
  { title: '삼겹살 구이', variant: '구이', keys: ['porkGrill', 'ssamVeg', 'rice'] },
  { title: '제육볶음', variant: '볶음', keys: ['jeyukMeat', 'cabbage', 'rice'] },
  { title: '비빔국수', variant: '비빔', keys: ['somyeon'] },
  { title: '샤브샤브', variant: '전골', keys: ['shabuBeef', 'cabbage', 'beansprout', 'mushroom', 'tofu'] },
].map(m => ({ ...m, items: m.keys.map(k => `${item(k).name} ${range(k, 4, { variant: m.variant })}`) }))

/* 조리 전·후 중량 — rawToCooked */
const COOKED_KEYS = ['pasta', 'somyeon', 'riceNoodle', 'rice', 'brownRice', 'juk', 'porkGrill', 'bulgogi', 'shabuBeef', 'cabbage', 'beansprout']
const COOKED_ROWS = COOKED_KEYS.map(k => ({ key: k, name: item(k).name, prep: item(k).prepNote, x: item(k).rawToCooked, after: Math.round(100 * item(k).rawToCooked) }))

const AGE_ROWS = (Object.keys(AGE_BAND_FACTOR) as AgeBand[]).map(a => ({ id: a, label: AGE_BAND_LABEL[a], f: AGE_BAND_FACTOR[a] }))
const FAMILY_EX = 2 * AGE_BAND_FACTOR.adult + AGE_BAND_FACTOR.school
const DIET_ROWS = (Object.keys(DIETARY_LABEL) as DietaryFlag[]).map(f => ({ id: f, label: DIETARY_LABEL[f], hidden: SERVING_DATA.filter(d => d.notFor?.includes(f)).map(d => d.name) }))

const PORK3 = { yes: range('porkGrill', 3), no: range('porkGrill', 3, { carb: 'no' }), snack: range('porkGrill', 3, { meal: 'snack' }) }
const RICE4 = calcItem(item('rice'), 4, A())

const FAQ_LD = [
  { q: '파스타 1인분은 몇 그램인가요?', a: `계산기 기준 메인 식사 1인분은 건면 <strong>${range('pasta', 1)}</strong>(기준값 ${per('pasta')}g)입니다. 이탈리아식 코스에서 파스타는 첫 접시라 80g 안팎으로 적게 잡지만, 한 접시로 끝내는 식사라면 100g 안팎이 무난하고 많이 먹는 편이면 식사량 &lsquo;많이&rsquo;(×1.25)를 고르세요. 삶으면 약 ${item('pasta').rawToCooked}배로 불어납니다.` },
  { q: '삼겹살 3인분이면 몇 g 사야 하나요?', a: `성인 3명 기준 계산값입니다 — 밥·쌈과 함께 먹는 메인 식사면 <strong>${PORK3.yes}</strong>, 밥 없이 고기 위주면 <strong>${PORK3.no}</strong>, 술자리 안주면 <strong>${PORK3.snack}</strong>. 마트 포장은 400g·600g·1kg 단위가 많으니 600g 팩을 기본으로, 고기 위주라면 1kg을 사고 남는 양은 소분해 냉동하는 편이 경제적입니다.` },
  { q: '소면 2인분은 건면 기준 몇 g인가요?', a: `메인 식사 기준 1인분 ${range('somyeon', 1)}, 2인분 <strong>${range('somyeon', 2)}</strong>입니다. 조리 방식을 &lsquo;비빔&rsquo;으로 고르면 1인당 10g이 더해집니다(국물은 그대로). 소면 한 봉(500g)은 대략 5인분입니다.` },
  { q: '장보기 분량과 실제 먹는 양이 다른 이유는?', a: '계산기는 마트에서 사야 할 <strong>조리 전 무게</strong>를 보여 줍니다. 고기는 익으면 수분·지방이 빠져 15~25% 줄고, 건면은 물을 먹어 2~2.5배, 생쌀은 밥이 되면 약 2.2~2.4배가 됩니다. 결과 카드의 &lsquo;조리 후 예상량&rsquo;이 이 배율을 곱한 값입니다.' },
  { q: '어른 2명 + 아이 1명이면 몇 인분으로 계산하나요?', a: `&lsquo;내 가족&rsquo; 탭은 연령대별 계수를 씁니다 — 성인 1.00, 중·고생 0.90, 초등생 0.65, 유아 0.40, 영아 0.25. 성인 2명 + 초등생 1명은 <strong>${FAMILY_EX}인분</strong>입니다. 인원 입력의 &lsquo;성인 + 아이&rsquo; 간편 모드는 아이를 연령 구분 없이 0.6인분으로 셈하므로 같은 구성이 2.6인분으로 나옵니다.` },
  { q: '4인 가족 삼겹살 장보기는 어떻게 하나요?', a: `성인 3 + 아이 1(간편 모드, 실질 3.6인분)로 삼겹살·쌈채소·쌀·두부를 고르고 메인 식사·탄수화물 포함으로 두면 삼겹살 <strong>${range('porkGrill', 3.6)}</strong>, 쌈채소 ${range('ssamVeg', 3.6)}, 쌀 ${range('rice', 3.6)}, 두부 ${range('tofu', 3.6)}(약 1모)가 나옵니다. 냉면·볶음밥으로 마무리할 계획이면 고기를 조금 줄이고, 고기 위주로 먹는다면 &lsquo;탄수화물 없음&rsquo;으로 바꾸세요.` },
  { q: '냉장고에 이미 있는 재료를 어떻게 빼나요?', a: `장보기 목록 탭에서 재료별 &lsquo;냉장고 보유&rsquo;에 g을 넣으면 필요 범위의 양 끝에서 그만큼 뺍니다. 예를 들어 4인분 쌀 ${RICE4.min}~${RICE4.max}g이 필요한데 100g이 있으면 ${RICE4.min - 100}~${RICE4.max - 100}g만 사면 됩니다. 보유량이 충분하면 목록에 &lsquo;✓ 보유분 충분&rsquo;으로 표시됩니다. 남은 재료가 아직 먹어도 되는지는 <a href="/tools/cooking/food-storage">식재료 보관 계산기</a>에서 확인하세요.` },
  { q: '채식·비건 가족은 어떻게 쓰나요?', a: '식이 제한 칩을 켜면 해당 그룹에 맞지 않는 재료가 목록에서 숨겨집니다 — 채식·비건은 고기류·국거리·전골용 고기·어묵·만두, 글루텐프리는 밀가루 면류(파스타·소면·중면·우동·라면사리·칼국수)와 만두. 계산기 재료 목록에 계란·유제품이 따로 없어 현재는 채식과 비건 필터가 숨기는 재료가 같습니다. 재료를 빼기만 하면 단백질·비타민 B12·철·칼슘이 부족해지기 쉬우므로 두부·콩류를 늘리고, 식단 설계는 영양사와 상의하는 것이 안전합니다.' },
  { q: '영양 기준의 1회 분량(고기 60g)보다 계산기 1인분이 훨씬 많은데요?', a: '두 숫자는 쓰임새가 다릅니다. 2020 한국인 영양소 섭취기준 활용자료의 <strong>1인 1회 분량</strong>은 하루 식단을 짤 때 세는 영양 단위(고기·생선·달걀·콩류 1회 = 약 100kcal, 생고기 60g)이고, 계산기의 1인분은 <strong>한 끼에 실제로 사서 먹는 양</strong>입니다. 그래서 삼겹살 구이 한 끼는 고기 1회 분량의 3배가 넘습니다. 반면 쌀 1인분(90g)과 국수 1인분(건면 90g)은 곡류 1회 분량과 거의 같습니다.' },
  { q: '두부·라면사리·감자처럼 개수로 사는 재료는요?', a: '계산은 g으로 하되, 개수 환산값을 함께 보여 줍니다 — 두부 1모 약 300g, 라면사리 1봉 약 110g, 감자 중간 1개 약 150g 기준으로 &lsquo;약 0.5~0.6모&rsquo;처럼 표시합니다. 만두는 처음부터 개 단위로 계산하고 1개 단위로 반올림합니다. 제품마다 1모·1봉 무게가 다르니 포장에 적힌 중량으로 한 번 확인하세요.' },
]

export default function ServingPage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/serving">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />1인분 분량 계산기
      </h1>
      <p className="tp-lead">
        n인분 식단의 재료별 정확한 분량과 <strong style={{ color: 'var(--text)' }}>합산 장보기</strong>. 채식·비건·글루텐프리 필터.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="1인분 기준값은 이 계산기의 재료 데이터(가정 식사량 통용값 — 공식 기준 아님) · 비교용 1회 분량은 2020 한국인 영양소 섭취기준 활용자료(보건복지부·한국영양학회, 2022) — 2025년 개정판 식사구성안 반영 전"
        sources={[
          { label: '보건복지부 — 2020 한국인 영양소 섭취기준 활용자료', href: 'https://www.mohw.go.kr/board.es?mid=a10411010100&bid=0019&act=view&list_no=370012' },
          { label: '한국영양학회 — 한국인 영양소 섭취기준 자료실', href: 'https://www.kns.or.kr/FileRoom/FileRoom.asp?BoardID=Kdr' },
        ]}
      />

      <ServingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 계산 원리 */}
        <section>
          <h2 className="g-h2">1인분은 이렇게 계산됩니다</h2>
          <p className="g-p">
            재료마다 <strong>식사 유형별 기준량</strong>(메인·곁들임·안주·가벼운 식사)이 들어 있고, 여기에 세 가지 보정을 더합니다. ① 조리 방식(예: 소면을 비빔으로 +10g, 소불고기를 전골로 −20g) ② 탄수화물 여부 — 밥·면을 함께 먹으면 고기·채소 기준량을 줄이고, 밥 없이 먹으면 늘립니다(면·밥 자체는 보정하지 않음) ③ 식사량 배율 — 적게 ×{APPETITE_MULT.small}, 보통 ×{APPETITE_MULT.normal}, 많이 ×{APPETITE_MULT.large}.
            이렇게 나온 1인 기준량에 실질 인원(아이는 계수로 환산)을 곱한 뒤 <strong>±10% 범위</strong>로 보여 줍니다. 반올림 단위는 고기류(구이·볶음·샤브샤브용 고기, 닭고기)와 면이 10g, 국·전골용 고기와 나머지 재료가 5g이며, 만두는 1개 단위입니다.
          </p>
          <p className="g-p">
            예를 들어 성인 3명이 삼겹살을 먹는다면 밥·쌈과 함께인 메인 식사는 1인 {per('porkGrill')}g × 3 = <strong>{PORK3.yes}</strong>, 밥 없이 고기 위주면 1인 {per('porkGrill', { carb: 'no' })}g으로 <strong>{PORK3.no}</strong>, 술자리 안주면 1인 {per('porkGrill', { meal: 'snack' })}g으로 <strong>{PORK3.snack}</strong>입니다.
            범위의 아래쪽은 &lsquo;딱 맞게&rsquo;, 위쪽은 &lsquo;모자라지 않게&rsquo;로 읽으면 되고, 마트 포장 단위가 범위 사이에 걸리면 위쪽 포장을 고른 뒤 남는 양을 소분 냉동하는 편이 실패가 적습니다.
          </p>
        </section>

        {/* 2. 면·밥 참조표 */}
        <section>
          <h2 className="g-h2">면·밥 1인분 참조표</h2>
          <p className="g-p">
            성인·메인 식사·보통 식사량일 때 계산기가 내놓는 값입니다. 면과 밥은 탄수화물 보정을 받지 않아 함께 먹는 반찬과 상관없이 같습니다. 모두 <strong>조리 전 무게</strong>(건면·생쌀)이고, 우동·볶음밥용 밥처럼 처음부터 조리된 상태로 파는 재료는 그 상태 무게입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '조리 후', '기준'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CARB_ROWS.map((r, i) => (
                  <tr key={r.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.one}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.two}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.four}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.cooked}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.prep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 고기·단백질 참조표 */}
        <section>
          <h2 className="g-h2">고기·두부 1인분 — 밥과 함께 vs 고기 위주</h2>
          <p className="g-p">
            고기는 무엇과 함께 먹느냐에 따라 필요량이 크게 달라집니다. 아래는 성인 1명·메인 식사 기준으로, &lsquo;탄수화물 포함&rsquo;(계산기 기본값)과 &lsquo;탄수화물 없음&rsquo;을 나란히 놓았습니다. 모두 생고기 무게입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '밥·면과 함께 1인', '고기 위주 1인', '4인 (밥과 함께)', '익히면'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROTEIN_ROWS.map((r, i) => (
                  <tr key={r.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.withCarb}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.noCarb}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.four}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.cooked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            같은 돼지·소고기라도 요리 유형에 따라 기준량이 다른 이유는 <strong>한 그릇에서 고기가 차지하는 몫</strong>이 달라서입니다. 구이는 고기가 곧 식사라 가장 많고(삼겹살 1인 {per('porkGrill')}g), 볶음은 양념·채소가 섞여 줄고(제육 {per('jeyukMeat')}g), 전골은 채소·두부·면사리가 나눠 맡으며(전골용 {per('hotpotMeat')}g), 국은 국물이 포만감을 채워 가장 적습니다(국거리 {per('soupMeat')}g). 뼈째 파는 닭·갈비는 뼈 무게만큼 더 사야 한다는 점도 기억하세요.
          </p>
        </section>

        {/* 4. 영양 기준 1회 분량과 비교 */}
        <section>
          <h2 className="g-h2">영양 기준의 &lsquo;1회 분량&rsquo;과 비교하면</h2>
          <p className="g-p">
            보건복지부·한국영양학회가 펴낸 <strong>2020 한국인 영양소 섭취기준 활용자료</strong>(2022)는 식단을 짤 때 쓰는 식품군별 &lsquo;1인 1회 분량&rsquo;을 정해 두었습니다. 곡류는 1회가 약 300kcal, 고기·생선·달걀·콩류는 약 100kcal가 되도록 잡은 영양 계산 단위입니다. 계산기의 한 끼 1인분(메인·밥과 함께)이 이 단위로 몇 회분인지 비교하면 다음과 같습니다.
            보건복지부는 2025년 12월 말 개정판인 <a href="https://www.mohw.go.kr/board.es?mid=a10411010200&bid=0019&act=view&list_no=1488446" target="_blank" rel="noopener noreferrer">2025 한국인 영양소 섭취기준</a>을 발표했으므로, 아래 1회 분량은 개정 전 값이라는 점을 감안하고 식단 설계에 쓸 때는 개정판의 식사구성안을 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품군', '1인 1회 분량', '계산기 재료', '계산기 1인분', '회분'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KDRI_ROWS.map((r, i) => (
                  <tr key={r.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.group}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.food}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.tool}g</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.times.toFixed(1)}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            쌀·국수 1인분은 곡류 1회 분량과 거의 일치하지만, 구이용 고기는 한 끼에 2.5~3회분 이상을 먹게 됩니다. 장보기 분량을 정할 때는 계산기 값을, 하루 영양 균형을 따질 때는 1회 분량을 기준으로 삼으세요. 체중 조절이나 질환 때문에 식단을 관리 중이라면 식사량 &lsquo;적게&rsquo;(×{APPETITE_MULT.small})를 쓰거나 영양사와 상의해 한 끼 양을 정하는 것이 좋습니다.
          </p>
        </section>

        {/* 5. 조리 전·후 */}
        <section>
          <h2 className="g-h2">조리 전·후 무게 변화</h2>
          <p className="g-p">
            계산기가 <strong>건면·생쌀·생고기</strong> 같은 조리 전 무게로 계산하는 이유는 마트에서 파는 단위가 그렇기 때문입니다. 조리 후 무게는 삶는 시간·굽기 정도·불 세기에 따라 흔들리므로 결과 카드에는 참고용 배율로만 표시합니다. 아래는 계산기에 들어 있는 배율로 100g을 조리했을 때의 예상 무게입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '기준', '배율', '100g → 조리 후'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COOKED_ROWS.map((r, i) => (
                  <tr key={r.key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.prep}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>×{r.x}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>약 {r.after}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 면·밥은 물을 흡수해 늘고, 고기·채소는 수분이 빠져 줄어듭니다. 죽은 물 양에 따라 5~6배까지 달라집니다.
          </p>
        </section>

        {/* 6. 아이 포함 */}
        <section>
          <h2 className="g-h2">아이 포함 시 분량 조정</h2>
          <p className="g-p">
            &lsquo;내 가족&rsquo; 탭은 구성원마다 연령대 계수와 식사량 배율을 곱해 더합니다. 성인 2명 + 초등생 1명이면 1 + 1 + 0.65 = <strong>{FAMILY_EX}인분</strong>이고, 그 초등생이 많이 먹는 편이라면 0.65 × {APPETITE_MULT.large} = {(AGE_BAND_FACTOR.school * APPETITE_MULT.large).toFixed(2)}인분으로 셈합니다.
            인원 입력의 간편 모드는 연령을 묻지 않고 &lsquo;성인 + 아이&rsquo;에서 아이 1명을 0.6인분, &lsquo;아이 위주&rsquo;에서 전원을 0.65인분으로 계산합니다. 아이 나이가 제각각이면 가족 탭이 더 정확합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연령대', '성인 대비 계수'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGE_ROWS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.f.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 계수는 가정 식사량을 어림한 값입니다. 이유식·유아식은 아이의 월령과 발달에 맞춰야 하므로 <Link href="/tools/cooking/baby-porridge">이유식 계산기</Link>나 소아청소년과 안내를 따르세요.
          </p>
        </section>

        {/* 7. 메뉴별 장보기 */}
        <section>
          <h2 className="g-h2">4인 메뉴별 장보기 예시</h2>
          <p className="g-p">
            재료별 분량 탭에서 재료를 여러 개 고르면 장보기 목록 탭이 같은 조건(인원·식사 유형·조리 방식)으로 한꺼번에 합산해 복사할 수 있는 목록을 만듭니다. 아래는 성인 4명·메인 식사·밥과 함께를 기준으로, 메뉴에 맞는 조리 방식을 고른 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['메뉴 (조리 방식)', '4인 구입량'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MENUS.map((m, i) => (
                  <tr key={m.title} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.title} ({m.variant})</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{m.items.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            조리 방식은 목록 전체에 한 번에 적용되고, 해당 방식의 보정값이 없는 재료(쌀·쌈채소·두부 등)는 그대로입니다. 샤브샤브에 칼국수 사리를 넣을 계획이라면 사리는 1인분 전체가 아니라 나눠 먹는 양이므로, 면 재료를 따로 &lsquo;곁들임&rsquo;으로 계산해 더하는 편이 현실적입니다.
          </p>
          <Callout tone="warn">
            냉장고 보유량을 빼고 산 재료는 그만큼 오래된 재료를 먼저 쓰는 셈입니다. 남은 고기·채소가 아직 안전한지는 <Link href="/tools/cooking/food-storage">식재료 보관 계산기</Link>로, 냉동해 둔 재료는 <Link href="/tools/cooking/thawing">해동 시간 계산기</Link>로 확인하세요.
          </Callout>
        </section>

        {/* 8. 식이 제한 */}
        <section>
          <h2 className="g-h2">채식·비건·글루텐프리 필터</h2>
          <p className="g-p">
            식이 제한 칩은 재료를 &lsquo;숨기기&rsquo;만 하고 대체 재료의 양을 늘려 주지는 않습니다. 필터별로 숨겨지는 재료는 아래와 같습니다. 재료 목록에 계란·유제품 항목이 따로 없어 지금은 채식과 비건이 같은 재료를 숨기며, 쌀국수면은 쌀로 만들어 글루텐프리에서도 남습니다(제품에 따라 밀이 섞일 수 있으니 원재료 표시 확인).
          </p>
          <ul className="g-list">
            {DIET_ROWS.map(d => (
              <li key={d.id}><strong>{d.label}</strong> — {d.hidden.join(', ')}</li>
            ))}
          </ul>
          <Callout tone="note">
            고기·생선을 빼면 단백질·비타민 B12·철·아연이, 유제품까지 빼면 칼슘이 부족해지기 쉽습니다. 두부·콩류·달걀(채식)로 단백질을 보충하고, 성장기 아이나 임신 중인 가족이 있다면 식단을 영양사와 상의하세요. 알레르기가 있으면 가공식품의 원재료 표시를 반드시 확인해야 합니다.
          </Callout>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',         icon: '📐', name: '레시피 비율 계산기',   desc: '인분 환산·비율 조정' },
              { href: '/tools/cooking/substitute',     icon: '🔄', name: '식재료 대체 비율',     desc: '부족 시 대체재' },
              { href: '/tools/cooking/food-storage',   icon: '🧊', name: '식재료 보관 계산기',   desc: '냉장·냉동 소비 기한' },
              { href: '/tools/cooking/thawing',        icon: '❄️', name: '해동 시간 계산기',     desc: '고기·냉동 안전 해동' },
              { href: '/tools/life/unit-price',        icon: '🏷️', name: '단가 비교 계산기',     desc: '마트 가격 분석' },
              { href: '/tools/life/dutch',             icon: '🍻', name: '더치페이 계산기',      desc: '외식 정산' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }} aria-hidden="true">{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
