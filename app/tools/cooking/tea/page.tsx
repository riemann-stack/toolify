import Link from 'next/link'
import TeaClient from './TeaClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  TEAS, STRENGTHS, COLD_GUIDES, getTea,
  recommendWaterMl, recommendLeafG, recommendTemp, recommendTime,
  caffeineMg, tanninRisk, buildSteepSchedule, fmtTime,
  type TeaId,
} from './teaUtils'

export const metadata = buildMetadata({
  path: '/tools/cooking/tea',
  title: '차 우리기 계산기 — 녹차·말차·우롱·보이·홍차 9종',
  description: '녹차·말차·백차·우롱·홍차·보이·허브 9종 + 차별 온도/시간/비율 + 다탕 스케줄·냉침 모드·카페인 비교·떫음 게이지.',
  keywords: ['차 우리기', '녹차 온도', '홍차 시간', '보이차 세차', '말차 비율', '우롱차 다탕', '냉침차 만들기', '허브티 시간', '카페인 함량', '차 종류'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12, fontWeight: 600, background: 'var(--bg3)', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)', verticalAlign: 'top' }

/* ── 가이드 표·예시 — teaUtils의 계산 함수로 빌드 시 생성 ── */
const MATRIX = TEAS.map(t => {
  const temp = recommendTemp(t, 'normal')
  const whisk = t.id === 'matcha'
  return {
    id: t.id,
    name: t.shortName,
    temp: `${temp.min}~${temp.max}°C`,
    first: whisk ? '격불 즉시' : fmtTime(recommendTime(t, 'normal', 'mug')),
    ratio: `1:${t.ratioWaterPerLeaf}`,
    water3: `${recommendWaterMl(t, 3, 'normal')}ml`,
    schedule: whisk
      ? '1회(가루째 마심)'
      : buildSteepSchedule(t).map(s => (s.isRinse ? `세차 ${s.sec}초` : fmtTime(s.sec))).join(' → '),
    caf3: t.caffeineMgPerG > 0 ? `${caffeineMg(t, 3)}mg` : '0',
  }
})

// 녹차 3g 예시 — 진하기·떫음 게이지
const G = getTea('green')
const G_T = recommendTime(G, 'normal', 'mug')
const G_TEMP = recommendTemp(G, 'normal')
const G_TEMP_S = recommendTemp(G, 'strong')
const G_TEMP_L = recommendTemp(G, 'light')
const firstSecAtRisk = (min: number) => {
  for (let s = 1; s <= G_T * 3; s++) if (tanninRisk(G, s, 'normal', 'mug') >= min) return s
  return G_T * 3
}
const G_WARN = firstSecAtRisk(40)
const G_OVER = firstSecAtRisk(70)
const BLACK = getTea('black')
const BLACK_BAG = recommendTime(BLACK, 'normal', 'teabag')

// 냉침 — 도구는 핫 추출 추정치의 60%로 표시
const COLD_RATIO = 0.6
const G_CAF3 = caffeineMg(G, 3)
const COLD_ROOM = COLD_GUIDES.find(c => c.mode === 'room')!
const COLD_FRIDGE = COLD_GUIDES.find(c => c.mode === 'fridge')!
const names = (ids: TeaId[]) => ids.map(id => getTea(id).shortName).join('·')

/* 일본식품표준성분표(8정) 침출액 카페인 — 성분표 비고란의 우림 조건 그대로.
   '도구 찻잎 함량'은 같은 찻잎 양을 이 도구의 mg/g로 계산한 값(상한) */
const BREW_REF: { name: string; cond: string; per100: number; leafG: number; waterMl: number; toolId: TeaId }[] = [
  { name: '옥로(교쿠로)', cond: '찻잎 10g · 60℃ 물 60ml · 2분 30초', per100: 160, leafG: 10, waterMl: 60, toolId: 'gyokuro' },
  { name: '센차(녹차)', cond: '찻잎 10g · 90℃ 물 430ml · 1분', per100: 20, leafG: 10, waterMl: 430, toolId: 'green' },
  { name: '우롱차', cond: '찻잎 15g · 90℃ 물 650ml · 30초', per100: 20, leafG: 15, waterMl: 650, toolId: 'oolong' },
  { name: '홍차', cond: '찻잎 5g · 끓는 물 360ml · 1분 30초~4분', per100: 30, leafG: 5, waterMl: 360, toolId: 'black' },
]
const BREW_ROWS = BREW_REF.map(r => {
  const brewed = Math.round((r.per100 * r.waterMl) / 100)
  const leaf = caffeineMg(getTea(r.toolId), r.leafG)
  return { ...r, brewed, leaf, pct: Math.round((brewed / leaf) * 100) }
})
const cup200 = (id: TeaId) => (BREW_REF.find(r => r.toolId === id)!.per100 * 2)
const MATCHA_2G = caffeineMg(getTea('matcha'), 2)
const schedText = (id: TeaId) => buildSteepSchedule(getTea(id)).filter(s => !s.isRinse).map(s => fmtTime(s.sec)).join(' → ')
const steepList = (id: TeaId) => getTea(id).steeps.map((sec, i) => `${i + 1}탕 ${fmtTime(sec)}`).join('·')
const maxSteeps = (id: TeaId) => getTea(id).maxSteeps

const FAQ_LD = [
  { q: '녹차는 왜 70~80°C로 우려야 하나요?', a: '녹차의 떫고 쓴맛을 내는 카테킨은 물이 뜨거울수록 많이, 빨리 우러납니다. 반면 감칠맛·단맛을 내는 아미노산(테아닌)은 낮은 온도에서도 잘 우러나서, 온도를 낮추면 맛의 균형이 단맛 쪽으로 옮겨 갑니다. 끓는 물을 바로 부으면 같은 시간에도 떫은맛이 도드라지는 이유입니다. 차광 재배로 아미노산이 많은 옥로(교쿠로)는 이 효과를 살리려고 50~60°C까지 낮춰 우립니다.' },
  { q: '우림 시간을 길게 하면 더 진해지나요?', a: `진해지긴 하지만 떫은맛이 먼저 커집니다. 향과 감칠맛 성분은 초반에 빠르게 우러나고, 카테킨·탄닌은 시간이 갈수록 계속 늘어나기 때문입니다. 이 도구의 떫음 게이지는 권장 시간의 약 1.12배를 넘으면 '떫음 시작', 1.5배부터 '과추출'로 표시합니다. 녹차 기본값(권장 ${fmtTime(G_T)})이라면 ${fmtTime(G_WARN)}부터 떫음 시작, ${fmtTime(G_OVER)}부터 과추출입니다. 진하게 마시고 싶다면 시간 대신 찻잎을 늘리거나 물을 줄이세요.` },
  { q: '보이차·우롱차는 왜 세차(첫물 버리기)를 하나요?', a: '보이차는 덩어리로 눌러 굳힌(긴압) 차를 오래 보관하는 경우가 많고, 우롱차는 둥글게 말린 잎이 단단합니다. 뜨거운 물로 10초 정도 빠르게 헹궈 첫물을 버리면 보관 중 묻은 먼지·잡내를 씻어 내고, 말린 잎이 물을 먹어 풀리면서 다음 탕부터 고르게 우러납니다. 오래 묵히지 않은 보이차도 긴압차라면 세차하는 편이 잎이 잘 풀립니다. 녹차·홍차는 잎이 얇고 바로 우러나 세차하면 향만 잃습니다.' },
  { q: '말차와 녹차는 같은 차인가요?', a: `같은 차나무의 잎이지만 먹는 방식이 다릅니다. 말차는 차광 재배한 잎을 쪄서 말린 뒤(텐차) 맷돌로 곱게 간 가루로, 잎을 우려 마시는 녹차와 달리 가루째 마십니다. 일본식품표준성분표(8정)의 말차 카페인은 100g당 3.2g, 즉 1g당 약 32mg이라 2g을 격불한 한 잔이면 약 ${MATCHA_2G}mg을 그대로 섭취합니다. 잎 속 카페인 일부만 우러나는 녹차와 달리 가루 전체를 먹기 때문입니다.` },
  { q: '카모마일·페퍼민트·루이보스는 얼마나 우리나요?', a: `셋 다 카페인이 없고 끓는 물로 우립니다. 이 도구는 허브티 ${steepList('herbal')}, 루이보스 ${steepList('rooibos')}으로 계산합니다. 허브에는 차나무 잎 같은 카테킨 떫음이 적어 오래 두어도 크게 떫어지지 않고, 향 성분을 충분히 뽑으려면 5분 이상이 필요합니다. 향이 날아가지 않도록 뚜껑을 덮고 우리세요. 페퍼민트는 오래 우리면 박하 향이 너무 세질 수 있어 5분 안팎에서 맛을 보세요.` },
  { q: '냉침차는 카페인이 정말 적은가요?', a: `찬물에서는 카페인이 뜨거운 물보다 느리게 우러나서 같은 찻잎이라도 대체로 적게 나옵니다. 다만 우리는 시간이 길수록 차이가 줄어들어 '몇 % 적다'로 못 박기는 어렵습니다. 이 도구는 냉침 카페인을 핫 추출 추정치의 ${Math.round(COLD_RATIO * 100)}%로 단순하게 잡아 녹차 3g이면 ${G_CAF3}mg → ${Math.round(G_CAF3 * COLD_RATIO)}mg으로 보여 줍니다. 카페인을 확실히 피해야 한다면 냉침보다 루이보스처럼 카페인이 없는 차를 고르는 편이 확실합니다. 백차는 녹차와 카페인이 비슷해 저카페인 차로 보기 어렵습니다.` },
  { q: '게이완·다관·머그·티백 중 무엇을 써야 하나요?', a: `적은 물로 짧게 여러 번 우리는 우롱·보이·백차는 뚜껑 달린 사발인 게이완이나 작은 주전자인 다관이 편하고, 한 번에 넉넉히 우리는 녹차·홍차·허브는 머그에 거름망(티볼)이면 충분합니다. 티백은 찻잎이 잘게 부서져 있어 빨리 우러나므로 도구는 시간을 30% 줄여(×0.7) 계산합니다. 홍차 기본 4분이 티백이면 ${fmtTime(BLACK_BAG)}가 되는 식입니다. 말차는 격불용으로 머그(차완 대용) 한 가지만, 옥로는 다관·게이완만 고를 수 있게 막아 두었습니다.` },
  { q: '같은 찻잎으로 몇 번까지 우릴 수 있나요?', a: `도구의 기본 스케줄은 녹차·옥로·홍차 ${maxSteeps('green')}탕, 백차 ${maxSteeps('white')}탕, 우롱차 ${maxSteeps('oolong')}탕, 보이차 ${maxSteeps('puer')}탕, 허브·루이보스 ${maxSteeps('herbal')}탕입니다. 품질 좋은 우롱차는 시간을 조금씩 늘려 7~8탕, 보이차는 8~10탕까지도 우러납니다. 탕을 거듭할수록 잎에 남은 성분이 줄어드니 시간을 늘려 가는 것이 원칙이고, 맛이 물처럼 밋밋해지면 그만 우리면 됩니다. 티백은 한 번 우리면 대부분 우러나 두 번째는 맛이 약합니다.` },
  { q: '임산부·어린이는 차를 얼마나 마셔도 되나요?', a: `식품의약품안전처는 1일 카페인 섭취를 성인 400mg 이하, 임산부 300mg 이하, 어린이·청소년은 체중 1kg당 2.5mg 이하로 권고합니다(30kg 어린이라면 하루 75mg). 일본식품표준성분표 기준으로 우린 센차는 100ml당 약 20mg, 홍차는 약 30mg이라 200ml 한 잔이면 각각 약 ${cup200('green')}mg·${cup200('black')}mg입니다. 옥로(100ml당 약 160mg)와 가루째 마시는 말차는 적은 양으로도 카페인이 많습니다. 커피·초콜릿·콜라 등 다른 카페인과 합산해서 판단하세요. 루이보스는 카페인이 없고, 허브티는 카페인이 없어도 허브 종류에 따라 임신 중 안전성 근거가 달라 담당 의사와 상의하는 것이 좋습니다.` },
  { q: '차에 가장 좋은 물은 무엇인가요?', a: '칼슘·마그네슘이 적은 연수가 차의 향과 색을 잘 살립니다. 세계보건기구(WHO) 자료는 탄산칼슘 환산 경도 60mg/L 미만을 연수로 분류합니다. 미네랄이 많은 경수로 우리면 찻물 표면에 얇은 막이 생기거나 색이 탁해지고 향이 둔해질 수 있습니다. 수돗물을 쓴다면 한 번 충분히 끓여 소독 냄새를 날린 뒤 차 종류에 맞는 온도로 식혀 쓰세요. 여러 번 다시 끓인 물은 맛이 밋밋해질 수 있어 매번 새로 받은 물을 끓이는 편이 좋습니다.' },
]

export default function TeaPage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/tea">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />차 우리기 계산기
      </h1>
      <p className="tp-lead">
        녹차·말차·우롱·홍차·보이·허브 9종 + 온도/시간/비율 + <strong style={{ color: 'var(--text)' }}>냉침 모드와 떫음 게이지</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="카페인 1일 권고량은 식약처(성인 400mg·임산부 300mg·어린이·청소년 체중 1kg당 2.5mg) · 말차·침출액 카페인은 일본식품표준성분표(8정) · 온도·시간·비율은 일반 우림 관행"
        sources={[
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
          { label: '일본 문부과학성 식품성분 데이터베이스', href: 'https://fooddb.mext.go.jp/' },
          { label: 'FDA — How Much Caffeine is Too Much?', href: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' },
        ]}
      />

      <TeaClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol className="g-list" style={{ marginBottom: 12 }}>
          <li><strong>차 종류 선택</strong> — 9종 카드 (녹차·홍차·우롱·보이·허브 등)</li>
          <li><strong>다구·진하기 선택</strong> — 게이완 / 다관 / 머그 / 티백 + 연하게/기본/진하게</li>
          <li><strong>찻잎·물 양 입력</strong> — 프리셋 또는 직접 입력 (녹차 3g이면 기본 180ml)</li>
          <li><strong>결과 확인</strong> — 권장 온도·시간·비율 + 떫음 게이지 + 카페인 추정</li>
        </ol>
        <Callout tone="tip">
          우리기 계산 탭의 <strong>다탕 스케줄</strong>에서 보이·우롱의 세차 → 1탕 → 2탕 … 탕마다 시간을 확인하고, <strong>냉침 모드</strong>를 켜면 핫 추출과 카페인·시간을 나란히 비교할 수 있어요.
        </Callout>
      </div>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산은 이렇게 됩니다 — 비율·진하기·떫음 게이지</h2>
      <p className="g-p">
        차마다 &lsquo;찻잎 1g당 물 몇 ml&rsquo;라는 기준 비율이 있고, 권장 물 양은 <strong>찻잎(g) × 기준 비율 × 진하기 계수</strong>로 구합니다. 진하기 계수는 연하게 {STRENGTHS.light.ratioMul}, 기본 {STRENGTHS.normal.ratioMul}, 진하게 {STRENGTHS.strong.ratioMul}이고,
        온도는 연하게 {STRENGTHS.light.tempDelta}°C, 진하게 +{STRENGTHS.strong.tempDelta}°C를 더합니다. 우리는 시간은 진하기와 상관없이 그대로 두고, 티백만 잘게 부서진 잎이 빨리 우러나므로 30%를 줄입니다.
        반대로 물 양을 먼저 정하면 권장 찻잎은 물 ÷ 기준 비율 ÷ 진하기 계수로 계산합니다.
      </p>
      <p className="g-p">
        녹차 3g을 기본으로 고르면 물 {recommendWaterMl(G, 3, 'normal')}ml, {G_TEMP.min}~{G_TEMP.max}°C, 1탕 {fmtTime(G_T)}이 나옵니다. 진하게로 바꾸면 물 {recommendWaterMl(G, 3, 'strong')}ml·{G_TEMP_S.min}~{G_TEMP_S.max}°C,
        연하게는 물 {recommendWaterMl(G, 3, 'light')}ml·{G_TEMP_L.min}~{G_TEMP_L.max}°C가 되고 시간은 셋 다 같습니다. 머그 300ml를 채우고 싶다면 권장 찻잎은 기본 {recommendLeafG(G, 300, 'normal')}g, 진하게 {recommendLeafG(G, 300, 'strong')}g입니다.
      </p>
      <p className="g-p">
        떫음 게이지는 실제로 우린 시간이 권장 시간의 몇 배인지로 정합니다. 권장 시간 이내는 0~30%(안전), 1~1.5배 구간은 30~70%, 1.5~2배는 70~100%로 올라가고 2배를 넘으면 100%입니다. 40% 이상이면 &lsquo;떫음 시작&rsquo;, 70% 이상이면 &lsquo;과추출&rsquo;로 표시하므로,
        녹차 기본값이라면 {fmtTime(G_WARN)}부터 떫음 시작, {fmtTime(G_OVER)}부터 과추출입니다. 게이지는 맛의 경향을 보여 주는 지표일 뿐 성분을 측정한 값은 아닙니다.
      </p>

      {/* 3. 매트릭스 — TEAS에서 생성 */}
      <h2 className="g-h2">차 종류별 권장 온도·시간·비율</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
          <thead>
            <tr>
              <th scope="col" style={th}>차</th>
              <th scope="col" style={th}>온도</th>
              <th scope="col" style={th}>1탕</th>
              <th scope="col" style={th}>비율 (찻잎:물)</th>
              <th scope="col" style={th}>찻잎 3g이면</th>
              <th scope="col" style={th}>다탕 스케줄</th>
              <th scope="col" style={th}>찻잎 3g 속 카페인</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map(r => (
              <tr key={r.id}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.name}</th>
                <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.temp}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.first}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.ratio}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.water3}</td>
                <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.schedule}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.caf3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 도구 데이터로 생성한 기본(진하기 &lsquo;기본&rsquo;·머그) 값입니다. 카페인은 찻잎에 들어 있는 양으로, 실제 찻잔에 우러나는 양은 아래 &lsquo;카페인&rsquo; 절처럼 이보다 적습니다(가루째 마시는 말차 제외).
      </p>

      {/* 4. 진하게 */}
      <h2 className="g-h2">진하게 마시고 싶을 때 — 시간을 늘리지 마세요</h2>
      <p className="g-p">
        차가 연하다고 우림 시간을 늘리면 향보다 떫은맛과 쓴맛이 먼저 커집니다. 도구의 &lsquo;진하게&rsquo;가 시간을 건드리지 않고 비율과 온도만 바꾸는 이유입니다.
      </p>
      <Callout tone="tip" title="올바르게 진하게 우리는 법">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>같은 물에 <strong>찻잎을 1.25배</strong>로 (3g → 3.75g) — 도구의 &lsquo;진하게&rsquo;와 같은 효과</li>
          <li>같은 찻잎에 <strong>물을 20% 줄이기</strong> (녹차 1:60 → 1:48)</li>
          <li><strong>물 온도 +3°C</strong> — 온도를 올리면 추출이 빨라져 같은 시간에도 진해집니다</li>
          <li>더 진한 맛이 필요하면 <strong>찻잎 등급</strong>을 바꾸는 것도 방법 (세작 → 우전·옥로 등)</li>
        </ul>
      </Callout>
      <p className="g-p" style={{ marginTop: 12 }}>
        <strong>피해야 할 것</strong> — 우림 시간을 권장 대비 1.5배 이상 늘리면 떫음 게이지가 &lsquo;과추출&rsquo;로 넘어갑니다. 특히 녹차·옥로는 시간보다 <strong>온도</strong>가 맛을 좌우하므로, 떫다면 먼저 물 온도를 확인하세요.
      </p>

      {/* 5. 다탕 */}
      <h2 className="g-h2">다탕(多湯) 우림 — 세차·1탕·2탕·3탕</h2>
      <div style={card}>
        <p className="g-p">
          다탕은 <strong>같은 찻잎으로 여러 번 우려 풍미의 변화를 즐기는 방식</strong>으로, 적은 물에 찻잎을 넉넉히 넣고 짧게 우리는 중국·대만의 우롱·보이차 문화에서 발달했습니다. 도구의 우롱차 스케줄은 세차 {getTea('oolong').rinseSec}초 뒤 {schedText('oolong')}처럼 탕마다 시간을 늘려, 잎에 남은 성분이 줄어드는 만큼을 보충합니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { t: '세차 (洗茶)', d: '뜨거운 물로 10초 헹구고 첫 물은 버림. 먼지·잡내 제거 + 말린 잎 풀기. 보이·우롱에 권장.', c: 'var(--muted)' },
            { t: '1탕', d: '본 추출 시작. 가장 산뜻하고 풀향·꽃향이 강한 단계.', c: 'var(--teal-600)' },
            { t: '2탕', d: '잎이 완전히 풀려 단맛·바디감이 가장 균형 잡히는 단계.', c: 'var(--cyan-600)' },
            { t: '3탕 이후', d: '후미가 깊고 은은해짐. 우롱은 5~8탕, 보이는 6~10탕까지 가능.', c: 'var(--amber-600)' },
          ].map(g => (
            <div key={g.t} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 냉침 */}
      <h2 className="g-h2">냉침차 만들기 — 느리게, 부드럽게</h2>
      <div style={card}>
        <p className="g-p">
          냉침(콜드브루 티)은 뜨거운 물 대신 상온이나 냉장고에서 몇 시간에 걸쳐 천천히 우리는 방식입니다. 온도가 낮으면 카페인과 떫은 카테킨이 느리게 우러나 맛이 부드럽고, 대신 향은 핫 추출보다 은은합니다.
          도구는 냉침 카페인을 핫 추출 추정치의 {Math.round(COLD_RATIO * 100)}%로 단순하게 잡습니다 — 녹차 3g이면 {G_CAF3}mg 대신 약 {Math.round(G_CAF3 * COLD_RATIO)}mg. 실제 감소 폭은 시간·온도·찻잎에 따라 달라지는 추정치입니다.
        </p>
        <ul className="g-list" style={{ marginBottom: 0 }}>
          <li><strong>{COLD_ROOM.label}</strong>: {COLD_ROOM.hourMin}~{COLD_ROOM.hourMax}시간 — 빠르고 풍미가 진함. 추천 {names(COLD_ROOM.recommend)}</li>
          <li><strong>{COLD_FRIDGE.label}</strong>: {COLD_FRIDGE.hourMin}~{COLD_FRIDGE.hourMax}시간 — 가장 부드럽고 맑음. 추천 {names(COLD_FRIDGE.recommend)}</li>
          <li><strong>비율</strong>: 핫 추출과 같은 비율에서 시작해 맛을 보고 조정</li>
          <li><strong>위생</strong>: 가열 과정이 없으므로 깨끗한 용기와 먹는 물을 쓰고, 기온이 높은 여름에는 상온 대신 냉장 냉침을 하며, 우린 뒤에는 냉장 보관해 1~2일 안에 마시세요</li>
        </ul>
      </div>

      {/* 7. 카페인 */}
      <h2 className="g-h2">카페인 — 찻잎 함량과 실제 한 잔은 다릅니다</h2>
      <p className="g-p">
        도구가 보여 주는 카페인은 <strong>찻잎 g × 차별 카페인 함량(mg/g)</strong>으로, 찻잎 속에 들어 있는 양입니다. 우려 마시는 차는 그중 일부만 물로 나오므로 실제 한 잔의 카페인은 이보다 적습니다.
        아래 표는 일본식품표준성분표(8정)가 정한 우림 조건과 침출액 카페인을 옮기고, 같은 찻잎 양을 이 도구로 계산한 값과 비교한 것입니다. 우린 물 전체의 카페인은 100ml당 함량에 물 양을 곱한 추정치입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 680 }}>
          <thead>
            <tr>
              <th scope="col" style={th}>차</th>
              <th scope="col" style={th}>성분표 우림 조건</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>우린 차 100ml당</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>우린 물 전체(추정)</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>도구의 찻잎 함량</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>비율</th>
            </tr>
          </thead>
          <tbody>
            {BREW_ROWS.map(r => (
              <tr key={r.name}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.name}</th>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.cond}</td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{r.per100}mg</td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>약 {r.brewed}mg</td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{r.leaf}mg</td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--accent-ink)', fontWeight: 700 }}>약 {r.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        ※ 침출액 카페인과 우림 조건: 일본 문부과학성 일본식품표준성분표(8정). 말차는 가루 100g당 3.2g(1g당 32mg)으로 가루째 마시므로 2g 한 잔이면 약 {MATCHA_2G}mg을 그대로 섭취합니다. 잎에 스며 남는 물은 고려하지 않았습니다.
      </p>
      <p className="g-p" style={{ marginTop: 16 }}>
        200ml 한 잔으로 환산하면 센차는 약 {cup200('green')}mg, 홍차는 약 {cup200('black')}mg, 우롱차는 약 {cup200('oolong')}mg입니다. 식품의약품안전처의 1일 권고량은 <strong>성인 400mg 이하, 임산부 300mg 이하, 어린이·청소년 체중 1kg당 2.5mg 이하</strong>이므로,
        차만 마신다면 성인이 넘기기는 쉽지 않지만 커피·에너지음료와 함께 마시거나 옥로·말차처럼 진한 차를 여러 잔 마시면 합계를 따져 볼 필요가 있습니다. 카페인에 민감하거나 임신 중이라면 도구의 추정치를 &lsquo;최대치&rsquo;로 보고 여유 있게 판단하세요.
      </p>

      <Faq items={FAQ_LD} />

      {/* cooking 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/cooking/brew" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>☕</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>커피 브루잉 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            6 추출법 + 푸어 스케줄
          </p>
        </Link>
        <Link href="/tools/health/caffeine" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>⏱️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>카페인 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            하루 섭취량·취침 시 잔존량
          </p>
        </Link>
        <Link href="/tools/cooking/recipe" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>레시피 비율·단위 변환</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            인분·큰술·g 환산
          </p>
        </Link>
        <Link href="/tools/health/supplement" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>영양제 성분 체크</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            카페인·약물 상호작용 체크
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
