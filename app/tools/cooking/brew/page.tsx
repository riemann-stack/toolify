import Link from 'next/link'
import BrewClient from './BrewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { BREW_METHODS, ROASTS, fmtTime, fmt, buildPourSchedule, coffeeToWater, waterToCoffee } from './brewUtils'

export const metadata = buildMetadata({
  path: '/tools/cooking/brew',
  title: '커피 브루잉 계산기 — 핸드드립·프렌치프레스·콜드브루 6 추출법',
  description: '핸드드립·프렌치프레스·에어로프레스·콜드브루·모카포트·에스프레소 6가지 추출법 + 비율·온도·시간·분쇄도 매트릭스.',
  keywords: ['커피 비율', '핸드드립 비율', '1:15 비율', 'SCA 골든컵', '콜드브루 비율', '에스프레소 추출', '푸어 스케줄', '블루밍', '홈카페 계산', '원두 g 물 ml'],
})

/* ── 가이드 표·예시 — 도구의 brewUtils로 빌드 시 생성 (계산기와 같은 값) ── */
const METHOD_ROWS = BREW_METHODS.map(m => ({
  id: m.id,
  name: m.shortName,
  ratio: m.id === 'espresso' ? `1:${m.ratioMin}~${m.ratioMax} (원두:샷)` : `1:${m.ratioMin}~${m.ratioMax}`,
  def: m.ratioDefault,
  temp: `${m.tempMin}~${m.tempMax}°C`,
  time: m.timeMin === m.timeMax ? fmtTime(m.timeMin) : `${fmtTime(m.timeMin)}~${fmtTime(m.timeMax)}`,
  grind: m.grind,
}))
const EX_COFFEE = 20
const EX_RATIO = 16
const EX_WATER = coffeeToWater(EX_COFFEE, EX_RATIO)          // 320
const EX_CUP_IN = EX_WATER - EX_COFFEE * 2                    // 분쇄 원두가 머금는 물(원두 무게의 약 2배)을 뺀 예상 음료량
const EX_TWO_MUGS = waterToCoffee(2 * 250, EX_RATIO)          // 머그 2잔 → 원두 g
const EX_COLD = waterToCoffee(1000, 9)                        // 콜드브루 1L · 1:9
const POUR = buildPourSchedule(EX_COFFEE, EX_WATER)
const EY_TDS = 1.3
const EX_EY = (EY_TDS * EX_CUP_IN) / EX_COFFEE                // 추출 수율(%) = TDS% × 음료 g ÷ 원두 g
/* 비용 탭 기본값(원두 20g·1:16·머그 250ml·100g당 8,000원·카페 4,500원)과 같은 식 */
const COST_CUPS = EX_WATER / 250
const COST_BEAN_PER_CUP = EX_COFFEE / COST_CUPS
const COST_PER_CUP = COST_BEAN_PER_CUP * (8000 / 100)
const COST_SAVE = 4500 - COST_PER_CUP

const FAQ_LD = [
  { q: '1:15 비율이면 정확히 얼마인가요?', a: '원두 1g당 물 15ml라는 뜻입니다. <strong>원두 20g + 물 300ml</strong>, <strong>원두 30g + 물 450ml</strong>처럼 곱셈으로 바로 환산됩니다. 국내 핸드드립·프렌치프레스 레시피에서 흔한 1:15~17 구간의 진한 쪽 끝이고, SCA 골든컵 기준(물 1L당 원두 55g)은 약 1:18로 이보다 조금 연합니다.' },
  { q: '핸드드립 표준 비율은?', a: '<strong>1:15~1:17</strong>이 가장 일반적입니다. V60·칼리타·케멕스 모두 이 범위에서 시작합니다. 진하게 마시고 싶으면 1:14~15, 연하게는 1:17~18. 머그 250ml 한 잔을 1:16으로 내리면 원두 약 16g(250÷16=15.6g)이 필요합니다.' },
  { q: '콜드브루는 왜 1:8로 진하게 추출하나요?', a: '콜드브루는 보통 <strong>농축액</strong>으로 만들어 두고 마실 때 물·우유·얼음으로 1:1~1:2 희석하기 때문입니다. 1:8 농축액을 같은 양의 물로 희석하면 원두 대비 전체 물이 약 1:16이 되어 일반 추출과 비슷한 비율이 됩니다. 희석하지 않고 바로 마실 거라면 처음부터 1:15~17로 우리면 됩니다.' },
  { q: '에스프레소 1:2 비율은 어떻게 측정하나요?', a: '에스프레소 비율은 <strong>인풋(원두):아웃풋(추출된 샷 무게)</strong>입니다. 원두 18g으로 샷 36g을 뽑으면 1:2. 다른 추출법처럼 부은 물이 아니라 컵에 나온 음료 무게를 재므로, 샷 잔을 저울에 올려 두고 추출합니다. 흔히 1:1~1.5를 리스트레토, 1:2 안팎을 노멀, 1:2.5~3을 룽고로 부릅니다. 계산기도 에스프레소를 고르면 입력을 원두→샷 기준으로 고정합니다.' },
  { q: '블루밍은 왜 하나요?', a: '로스팅된 원두에는 <strong>이산화탄소</strong>가 갇혀 있어, 첫 물을 적게 부어 30초쯤 기다리면 가스가 빠지며 커피 층이 부풀어 오릅니다. 이 과정 없이 바로 많은 물을 부으면 가스가 물의 침투를 막아 추출이 고르지 않게 됩니다. 거품이 거의 안 올라오면 로스팅 후 수 주 이상 지났거나 미리 갈아 둔 원두일 가능성이 높고, 반대로 로스팅 직후(2~3일 이내) 원두는 가스가 너무 많아 추출이 불안정할 수 있습니다.' },
  { q: '라이트와 다크 로스팅 비율 차이는?', a: '• <strong>라이트(약배전)</strong>: 조직이 단단해 잘 우러나지 않으므로 1:14~15로 진하게, 물 온도도 높은 쪽으로. 산미·꽃향·과일향이 두드러집니다.<br/>• <strong>미디엄</strong>: 핸드드립 표준 1:15~17.<br/>• <strong>다크(강배전)</strong>: 잘 우러나고 쓴맛이 빨리 나오므로 1:16~18로 연하게, 물 온도는 낮은 쪽으로. 캐러멜·초콜릿 향이 강조됩니다.' },
  { q: '아이스 커피는 얼음 무게를 어떻게 빼나요?', a: '얼음 위로 뜨거운 물을 내리는 <strong>재패니즈 아이스</strong>는 녹는 얼음도 물로 칩니다. 평소 비율을 <strong>뜨거운 물 + 얼음 합계</strong>로 맞추고 그중 1/3~40% 정도를 얼음으로 바꾸는 방식이 흔합니다. 예: 원두 20g, 총 300g = 뜨거운 물 200ml + 얼음 100g → 전체로는 1:15, 뜨거운 물만 보면 1:10으로 진하게 내린 셈이라 얼음이 녹으며 농도가 맞춰집니다. 계산기에서는 얼음을 포함한 총량으로 물을 계산한 뒤 그 일부를 얼음 무게로 바꿔 부으면 됩니다. 콜드브루는 처음부터 차갑게 우리므로 이 보정이 필요 없습니다.' },
  { q: 'SCA 골든컵은 무엇인가요?', a: 'SCA(Specialty Coffee Association)가 권장하는 <strong>균형 잡힌 추출 범위</strong>입니다. 비율은 물 1L당 원두 55g ±10%(약 1:16.5~1:20, 중심 1:18), 음료 농도 TDS 1.15~1.35%, 추출 수율 18~22%, 물 온도 약 90~96°C가 기준입니다. 국내 핸드드립 레시피는 대개 이보다 조금 진한 1:15~17에서 시작합니다.' },
  { q: '홈브루가 카페보다 얼마나 싼가요?', a: '원두 가격에 따라 차이가 큽니다. 1잔에 원두 16g을 쓴다면 100g에 2,000~3,000원대인 대용량 원두는 1잔 원가가 약 320~480원, 100g에 7,000~14,000원인 스페셜티 원두는 약 1,120~2,240원입니다. 카페 1잔 4,500원과 비교하면 1잔당 약 2,300~4,200원, 하루 1잔이면 한 달에 약 7~13만원 차이입니다. 가격은 판매처·시기마다 다르니 비용 비교 탭에 실제 구입가를 넣어 계산해 보세요(종이필터·물·전기 비용은 빠져 있습니다).' },
  { q: '추출 후 맛이 너무 쓰면? (과추출 진단)', a: '쓴맛과 떫은 뒷맛은 <strong>과추출</strong>의 신호입니다. 한 번에 한 가지씩 바꿔 보세요: ① 분쇄를 한 단계 굵게 ② 총 추출 시간을 줄이도록 푸어를 빠르게 ③ 물 온도를 2~3°C 낮게 ④ 비율을 1:16~17로 연하게 ⑤ 다크 로스팅이면 1:17~18. 반대로 <strong>시큼하고 단맛이 없고 묽으면</strong> 과소추출이므로 분쇄를 가늘게, 시간은 길게, 온도는 높게 조정합니다.' },
]

export default function BrewPage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/brew">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />커피 브루잉 계산기
      </h1>
      <p className="tp-lead">
        핸드드립·콜드브루·에어로프레스 <strong style={{ color: 'var(--text)' }}>6가지 추출법</strong> + 비율·온도·시간·분쇄도 매트릭스.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="SCA 골든컵(물 1L당 원두 55g ±10% · TDS 1.15~1.35% · 추출 수율 18~22%)과 추출법별 통용 레시피 · 카페인 1일 최대 섭취 권고량은 식약처 기준"
        sources={[
          { label: 'SCA — Protocols & Best Practices (골든컵·추출 기준)', href: 'https://sca.coffee/research/protocols-best-practices' },
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
          { label: 'FDA — How Much Caffeine is Too Much?', href: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' },
        ]}
      />

      <BrewClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <section>
          <h2 className="g-h2">어떻게 사용하나요?</h2>
          <ol className="g-list">
            <li><strong>추출법 선택</strong> — 6가지 카드 중 고르면 지금 비율이 그 추출법의 권장 범위를 벗어난 경우에만 기본값(핸드드립 1:16, 콜드브루 1:9, 에스프레소 1:2 등)으로 바뀝니다. 범위 안이면 쓰던 비율이 유지됩니다(예: 핸드드립 1:15에서 에어로프레스로 바꾸면 권장 1:13~15 안이라 1:15 그대로).</li>
            <li><strong>비율 조정</strong> — 프리셋(1:12~1:20) 또는 1:5~25 슬라이더. 에스프레소는 1:1~4 범위로 따로 움직입니다.</li>
            <li><strong>입력 모드</strong> — 원두→물 / 물→원두 / 잔수 기준 중 가진 정보에 맞춰 고릅니다.</li>
            <li><strong>결과 확인</strong> — 원두·물·잔수와 함께 권장 온도·시간·분쇄도가 표시됩니다.</li>
          </ol>
          <Callout tone="tip">
            <strong>푸어 스케줄 탭</strong>은 핸드드립의 블루밍·1차·2차 푸어를 초 단위로, <strong>강도·로스팅 탭</strong>은 지금 비율이 어느 강도 구간인지, <strong>비용 비교 탭</strong>은 홈브루 1잔 원가를 보여 줍니다.
          </Callout>
        </section>

        {/* 2. 계산 원리 */}
        <section>
          <h2 className="g-h2">비율 1:N은 이렇게 계산됩니다</h2>
          <p className="g-p">
            1:N은 <strong>원두 1g당 물 N ml</strong>라는 뜻이고, 물 1ml는 약 1g이라 저울 하나로 둘 다 잴 수 있습니다. 계산기의 식은 세 가지뿐입니다 — 원두를 알 때 <strong>물 = 원두 × N</strong>, 물을 알 때 <strong>원두 = 물 ÷ N</strong>, 잔수를 알 때 <strong>물 = 잔수 × 1잔 용량</strong>을 구한 뒤 다시 N으로 나눕니다.
            예를 들어 원두 {EX_COFFEE}g을 1:{EX_RATIO}로 내리면 물 {EX_WATER}ml, 머그(250ml) 2잔을 1:{EX_RATIO}로 내리려면 원두 {fmt(EX_TWO_MUGS, 1)}g, 콜드브루 농축액 1L를 1:9로 우리려면 원두 {fmt(EX_COLD, 0)}g이 필요합니다.
          </p>
          <p className="g-p">
            주의할 점은 <strong>부은 물이 모두 컵에 담기지는 않는다</strong>는 것입니다. 젖은 원두 가루가 자기 무게의 약 2배 물을 머금은 채 버려지므로, 원두 {EX_COFFEE}g에 물 {EX_WATER}ml를 부으면 컵에는 약 {EX_CUP_IN}ml가 남습니다. 잔 용량을 딱 맞춰야 한다면 잔수 모드에서 1잔 용량을 10~15% 넉넉하게 넣으세요.
            에스프레소만은 예외로, 비율이 부은 물이 아니라 <strong>컵에 나온 샷 무게</strong> 기준이라 입력이 원두→샷으로 고정됩니다.
          </p>
        </section>

        {/* 3. 추출법별 매트릭스 — BREW_METHODS */}
        <section>
          <h2 className="g-h2">추출법별 비율·온도·시간·분쇄도</h2>
          <p className="g-p">
            계산기가 추출법을 고를 때 쓰는 권장 범위입니다. 같은 원두라도 추출법마다 물과 닿는 시간과 압력이 달라, 비율과 분쇄도가 함께 움직입니다 — 접촉 시간이 짧을수록(에스프레소) 가늘게 갈고 진한 비율을, 길수록(콜드브루·프렌치프레스) 굵게 갈아야 과추출을 피할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['추출법', '비율', '기본값', '물 온도', '추출 시간', '분쇄도'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METHOD_ROWS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.ratio}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>1:{r.def}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.temp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.time}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.grind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 콜드브루 온도 4~22°C는 냉장 또는 실온 침지를 뜻합니다. 모카포트 비율은 바스켓에 담기는 원두와 보일러 물 기준의 대략값으로, 기구 크기(1·3·6컵)가 사실상 비율을 정합니다.
          </p>
        </section>

        {/* 4. SCA 골든컵 */}
        <section>
          <h2 className="g-h2">SCA 골든컵 표준과 TDS·추출 수율</h2>
          <p className="g-p">
            <strong>SCA(Specialty Coffee Association)</strong>가 권장하는 &lsquo;골든컵&rsquo;은 맛이 가장 균형 잡힌다고 보는 추출 범위입니다. 비율 하나가 아니라 농도와 수율을 함께 봅니다.
          </p>
          <ul className="g-list">
            <li><strong>비율</strong>: 물 1L당 원두 55g ±10% (약 1:16.5~1:20, 중심 1:18)</li>
            <li><strong>TDS(총용존고형물)</strong>: 1.15~1.35% — 음료 무게 중 녹아 나온 커피 성분의 비율, 즉 &lsquo;농도&rsquo;</li>
            <li><strong>추출 수율</strong>: 18~22% — 원두 무게 중 물에 녹아 나온 비율, 즉 &lsquo;얼마나 우려냈나&rsquo;</li>
            <li><strong>물 온도</strong>: 약 90~96°C (원두에 닿는 시점 기준)</li>
          </ul>
          <p className="g-p">
            수율은 <strong>TDS(%) × 음료 무게(g) ÷ 원두 무게(g)</strong>로 구합니다. 위 예시처럼 원두 {EX_COFFEE}g으로 음료 약 {EX_CUP_IN}g을 얻고 TDS 측정기가 {EY_TDS}%를 가리켰다면 수율은 {EY_TDS} × {EX_CUP_IN} ÷ {EX_COFFEE} = <strong>{fmt(EX_EY, 1)}%</strong>로 골든컵 범위 안입니다.
            농도(TDS)는 비율로, 수율은 분쇄도·시간·온도로 조절한다고 기억하면 됩니다 — 너무 진하면 물을 늘리고, 쓰거나 떫으면(수율 과다) 굵게 갈거나 시간을 줄입니다.
            TDS 측정기가 없다면 비율은 계산기로 고정하고 분쇄도만 한 단계씩 바꿔 가며 맛을 비교하는 것이 가장 현실적인 방법입니다.
          </p>
        </section>

        {/* 5. 로스팅 — ROASTS */}
        <section>
          <h2 className="g-h2">로스팅 정도별 비율 조정법</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['로스팅 (8단계 명칭)', '맛 특징', '권장 비율'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROASTS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.desc}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.ratioAdjust}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            약하게 볶은 원두는 조직이 단단해 성분이 잘 우러나지 않으므로 진한 비율과 높은 물 온도로, 강하게 볶은 원두는 빨리 우러나고 쓴맛이 먼저 나오므로 연한 비율과 조금 낮은 온도로 맞추는 것이 일반적입니다. 원두 봉투에 &lsquo;시티&rsquo;, &lsquo;풀시티&rsquo;처럼 일본식 8단계 명칭이 적혀 있다면 위 표의 괄호를 참고하세요.
          </p>
          <Callout tone="warn" title="비율보다 먼저 볼 변수">
            원두 신선도(로스팅 후 약 1~3주가 무난) → 분쇄도 → 물 온도 → 추출 시간 → 비율 순으로 맛에 미치는 영향이 큽니다. 오래된 원두나 맞지 않는 분쇄도는 비율 미세 조정으로 되살리기 어렵습니다.
          </Callout>
        </section>

        {/* 6. 푸어 스케줄 — buildPourSchedule */}
        <section>
          <h2 className="g-h2">푸어 스케줄 — 블루밍·1차·2차의 의미</h2>
          <p className="g-p">
            푸어 스케줄 탭은 세 가지 규칙으로 물량을 나눕니다 — 블루밍은 <strong>원두 무게 × 2</strong>, 1차 푸어는 <strong>누적 60%</strong>까지, 2차 푸어는 <strong>100%</strong>까지. 아래는 원두 {EX_COFFEE}g · 1:{EX_RATIO}(물 {EX_WATER}ml)로 넣었을 때 계산기가 내놓는 일정입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단계', '시간', '이번에 붓는 물', '누적'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POUR.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{Math.floor(p.startSec / 60)}:{String(p.startSec % 60).padStart(2, '0')}~{Math.floor(p.endSec / 60)}:{String(p.endSec % 60).padStart(2, '0')}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.waterMl > 0 ? `${p.waterMl}ml` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{p.cumulativeMl}ml</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            블루밍 30초 동안 가스가 빠지고, 1차 푸어에서 가운데부터 원을 그리며 대부분의 성분을 우려내며, 2차 푸어는 안쪽 원만 따라 농도를 맞춥니다. 마지막 물이 다 빠지는 시점이 2분 30초~3분 30초 사이면 분쇄도가 맞는 것입니다.
            3분 30초를 넘기면 가늘게 간 것이니 한 단계 굵게, 2분 30초보다 빨리 끝나면 한 단계 가늘게 조정하세요.
          </p>
        </section>

        {/* 7. 비용 — 비용 비교 탭과 같은 식 */}
        <section>
          <h2 className="g-h2">홈카페 1잔 원가는 이렇게 나옵니다</h2>
          <p className="g-p">
            비용 비교 탭은 <strong>1잔 원가 = 1잔에 쓰는 원두(g) × 100g당 가격 ÷ 100</strong>으로 계산합니다. 1잔에 쓰는 원두는 전체 원두를 &lsquo;물 ÷ 1잔 용량&rsquo;으로 나눈 값이라, 반올림한 잔수가 아니라 실제 비율로 나눕니다.
            기본값(원두 {EX_COFFEE}g · 1:{EX_RATIO} · 머그 250ml · 100g당 8,000원)이면 물 {EX_WATER}ml는 {fmt(COST_CUPS, 2)}잔, 1잔에 원두 {fmt(COST_BEAN_PER_CUP, 1)}g이 들어가 <strong>1잔 원가 {fmt(COST_PER_CUP, 0)}원</strong>입니다. 카페 아메리카노 4,500원과 비교하면 1잔에 {fmt(COST_SAVE, 0)}원, 하루 1잔 기준 30일이면 {fmt(COST_SAVE * 30, 0)}원 차이입니다.
            종이필터·물·전기, 드리퍼·그라인더 같은 도구 구입비는 빠져 있으니 실제 절감액은 이보다 조금 작습니다.
          </p>
        </section>

        {/* 8. 카페인 */}
        <section>
          <h2 className="g-h2">하루 몇 잔까지 — 카페인 기준</h2>
          <p className="g-p">
            비율을 진하게 바꾸거나 잔 크기를 키우면 한 잔에 쓰는 원두가 늘어나고 카페인도 함께 늘어납니다. 식품의약품안전처가 제시하는 카페인 1일 최대 섭취 권고량은 <strong>성인 400mg 이하, 임산부 300mg 이하, 어린이·청소년은 체중 1kg당 2.5mg 이하</strong>이고, 미국 FDA는 성인 400mg을 대략 커피 4~5잔에 해당하는 양으로 안내합니다.
            한 잔의 실제 카페인은 원두 품종(아라비카·로부스타), 원두 양, 추출 방식에 따라 크게 달라지므로 잔 수만으로 단정하기 어렵습니다. 1:12처럼 진하게 내리거나 텀블러(500ml)로 마신다면 &lsquo;잔&rsquo;이 아니라 사용한 원두 g으로 하루 양을 가늠하세요.
          </p>
          <Callout tone="note">
            시간대별로 몸에 남은 카페인은 <Link href="/tools/health/caffeine">카페인 잔존량 트래커</Link>로 확인할 수 있습니다. 임신 중이거나 불면·두근거림이 있다면 섭취량은 의료진과 상의하세요.
          </Callout>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율·단위 변환', desc: '인분·큰술·g 환산' },
              { href: '/tools/health/caffeine', icon: '☕', name: '카페인 잔존량 트래커', desc: '시간대별 체내 카페인' },
              { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트 계산기', desc: '제빵 배합비·수분율' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
                <p style={{ fontSize: 20, margin: '0 0 4px' }} aria-hidden="true">{t.icon}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
