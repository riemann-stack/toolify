import Link from 'next/link'
import AlcoholClient from './AlcoholClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import {
  SOJU_BRANDS, SOJU_ABV_ASOF, sojuBottleAlcoholG,
  KOREAN_GLASS_PRESETS, KOREAN_COCKTAIL_PRESETS, EQUIV_TARGETS,
  ALCOHOL_DENSITY, STANDARD_DRINK_G, calcAlcohol, riskLevel,
} from './alcoholUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/life/alcohol',
  title: '알코올 도수 계산기 — 잔 단위·소맥·하이볼·1인당 분배·기준 도수 변환',
  description:
    '소맥·하이볼 황금비율 + 목표 도수 희석(맥주·탄산수) + 같은 알코올량 비교·1인당 분배·기준 도수 변환. 소주 브랜드별 도수 표와 순수 알코올 g·잔 수 환산까지.',
  keywords: [
    '알코올도수계산기', '소맥도수계산기', '소맥 황금 비율', '하이볼 도수', '진토닉 도수',
    '술자리 1인당 알코올', '소주 맥주 환산', '와인 알코올량', '표준잔', '술자리 1인당 분배',
    '소주 도수', '저위험 음주', '혼합주도수', '폭탄주도수', '표준음주량',
  ],
})

// ── 본문 수치는 계산기와 같은 프리셋·함수로 빌드 시 계산 (도수 변경 시 본문이 옛 값으로 남지 않게) ──
const presetById = (id: string) => KOREAN_GLASS_PRESETS.find(g => g.id === id)!
const SOJU_BOTTLE = presetById('soju-bottle')
const BEER_CAN = presetById('beer-can')
/** [1인당 분배] 탭과 같은 방식: 행별 알코올 g 합 → 음주자 수로 나눔 */
function partyScenario(drinks: { ml: number; abv: number }[], people: number) {
  const total = +drinks.reduce((sum, d) => sum + calcAlcohol(d.ml, d.abv).alcoholG, 0).toFixed(1)
  const per = total / people
  return {
    total, per: per.toFixed(1), std: (per / STANDARD_DRINK_G).toFixed(1),
    male: riskLevel(per, 'male'), femalePct: riskLevel(per, 'female').pct,
  }
}
const SCN_A = partyScenario([{ ml: SOJU_BOTTLE.ml, abv: SOJU_BOTTLE.abv! }, { ml: BEER_CAN.ml * 4, abv: BEER_CAN.abv! }], 4)
const SCN_B_SOJU_G = calcAlcohol(SOJU_BOTTLE.ml * 3, SOJU_BOTTLE.abv!).alcoholG
const SCN_B_BEER_G = calcAlcohol(BEER_CAN.ml * 6, BEER_CAN.abv!).alcoholG
const SCN_B = partyScenario([{ ml: SOJU_BOTTLE.ml * 3, abv: SOJU_BOTTLE.abv! }, { ml: BEER_CAN.ml * 6, abv: BEER_CAN.abv! }], 4)
const SCN_C = partyScenario([
  { ml: SOJU_BOTTLE.ml * 5, abv: SOJU_BOTTLE.abv! }, { ml: BEER_CAN.ml * 10, abv: BEER_CAN.abv! }, { ml: 200, abv: 40 },
], 4)
/** 칵테일 프리셋의 혼합 도수 (소수 1자리) */
const cocktailAbv = (id: string) => {
  const c = KOREAN_COCKTAIL_PRESETS.find(x => x.id === id)!
  return `${((c.base.ml * c.base.abv + c.mixer.ml * c.mixer.abv) / (c.base.ml + c.mixer.ml)).toFixed(1)}%`
}
const HIGHBALL_ABV = EQUIV_TARGETS.find(t => t.name === '하이볼')!.abv

const FAQ_LD = [
              {
                q: '소맥 황금 비율의 도수는?',
                a: '가장 흔한 비율은 <strong>소주 50ml(15.7%) + 맥주 400ml(4.5%)</strong> 조합으로 약 5.7%입니다. &quot;진하게(1:5, 6.4%)&quot;, &quot;약하게(1:10, 5.5%)&quot; 취향에 따라 본 도구의 [혼합 도수] 탭에서 자유롭게 조정 가능. 단, 도수보다 마시는 속도·안주·수분이 취기에 더 큰 영향을 줍니다.',
              },
              {
                q: '알코올 순수량(g)은 어떻게 계산하나요?',
                a: '<strong>알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7893</strong>입니다. 0.7893은 에탄올 밀도(g/ml)로, 물(1g/ml)보다 가볍습니다. 예: 소주 1잔 50ml × 15.7% × 0.7893 = 약 6.2g.',
              },
              {
                q: '잔 단위와 병 단위 어느 게 더 정확한가요?',
                a: '둘 다 정확합니다. 본인이 익숙한 단위를 선택하세요. 일반적으로 1차 술자리는 잔 단위(몇 잔 마셨나), 총량 계산은 병 단위(몇 병 마셨나)를 사용합니다. 본 도구는 둘 다 지원하며, 잔 단위가 기본입니다. 단, 정확한 ml은 라벨 확인 필수 — 소주병 360ml, 맥주병/캔 500ml, 막걸리 750ml 표준.',
              },
              {
                q: '하이볼 만들 때 위스키 + 탄산수 비율은?',
                a: '일반적 황금 비율은 <strong>위스키 1 : 탄산수 9</strong> — 위스키 30ml + 탄산수 270ml로 약 4% 도수. 진하게는 1:6(약 5.7%), 약하게는 1:12(약 3.1%). 본 도구의 [목표 도수 희석] 탭에서 정확 계산 가능.',
              },
              {
                q: '같은 알코올량인데 술 종류에 따라 취하는 정도가 다른가요?',
                a: '학술적으로는 <strong>알코올 g이 같으면 BAC도 비슷</strong>합니다 (Widmark 공식). 다만 체감이 다른 이유는 ① 마시는 속도(소주 빠름·맥주 천천히) ② 위장 흡수 속도(탄산 음료 흡수↑) ③ 안주·식사(지방질 ↓) ④ 도수(높은 도수 → 식도·위 자극). 본 도구의 [알코올 환산] 탭에서 같은 8g이라도 술 종류별 양 차이를 확인할 수 있습니다.',
              },
              {
                q: '4명이 소주 3병 + 맥주 6캔 마시면 1인당 얼마인가요?',
                a: `본 도구의 [1인당 분배] 탭으로 자동 계산: 소주 3병(${SOJU_BOTTLE.abv}%, 약 ${SCN_B_SOJU_G}g) + 맥주 6캔(약 ${SCN_B_BEER_G}g) = 총 약 ${SCN_B.total}g, 4명 균등 시 <strong>1인당 약 ${SCN_B.per}g (${SCN_B.std} 표준잔)</strong>. 적정음주 참고 기준(남 32g)의 약 ${SCN_B.male.pct}%, (여 16g)의 약 ${SCN_B.femalePct}% — 기준 이내라도 안전을 뜻하지 않습니다(WHO). ⚠️ 절대 운전 X, 다음날 출근 운전도 단속 가능 (BAC 잔류). 일주일 이상 간격 권장.`,
              },
              {
                q: '소주 도수가 제품마다 다른데 정확히 계산하려면?',
                a: '본 도구 하단의 [본인 기준 도수 변환] 슬라이더에서 본인이 마신 소주 도수(14~25%)를 직접 설정하세요. 주요 도수(2026.7 기준·라벨 확인): 참이슬 후레쉬·진로·처음처럼 새로·좋은데이 15.7% · 참이슬 오리지널 16.9% · 한라산 오리지날 21%. 저도주화로 자주 바뀌므로 제품 라벨이 정확합니다. 같은 1병이라도 한라산 오리지날(약 60g) vs 15.7% 소주(약 45g) = 알코올 약 34% 차이.',
              },
              {
                q: '음주 후 운전 가능 시간은 어떻게 계산하나요?',
                a: '체내 알코올 분해 속도는 개인마다 크게 달라(시간당 7~10g) 정확한 시점 예측은 어렵습니다. 본 도구의 결과를 운전 가능 여부 판단에 사용하지 마세요. 음주 후에는 반드시 <strong>대리운전 앱(카카오 T·티맵 등)</strong> 또는 대중교통을 이용하세요. 다음날 아침 출근 운전도 BAC 잔류로 단속 가능합니다. 본 도구의 [알코올 환산] 결과 카드 → 혈중알코올 도구 링크에서 BAC 추정 가능.',
              },
              {
                q: '맥주(4.5%)로 소주를 희석하면 어떻게 되나요?',
                a: '맥주로 희석할 때는 <strong>목표 도수가 맥주(4.5%)보다 높아야</strong> 가능합니다. 예: 소주 50ml(15.7%)를 8%로 맞추려면 맥주 약 <strong>110ml</strong> 필요 — 계산식 50×(15.7−8)÷(8−4.5)≈110ml. 단, 목표가 4.5% 이하면 무한히 추가해도 도달할 수 없습니다 (수학적 한계). 본 도구의 [목표 도수 희석] 탭에 다양한 희석재료 비교표가 자동 생성됩니다.',
              },
              {
                q: '음주 칼로리는 어떻게 되나요?',
                a: '알코올 1g = 7 kcal (지방 9, 탄수화물·단백질 4보다 높음). 예: 소주 1병 360ml(15.7%) → 알코올 44.6g × 7 = <strong>약 312 kcal</strong> (밥 1공기 314 kcal). 맥주는 알코올 외에도 당분으로 칼로리 추가 — 1캔 약 200 kcal. 술자리에서의 안주 칼로리는 별도. 본 도구는 알코올 칼로리만 표시합니다.',
              },
            ]

export default function AlcoholPage() {
  return (
    <ToolPage width={760} slug="/tools/life/alcohol">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />알코올 도수 계산기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>소맥·하이볼 황금비율</strong> + 목표 도수 희석과 같은 알코올량 비교.
      </p>

      <AlcoholClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 한국 잔 단위 가이드 (NEW·SEO 핵심) ── */}
        <section>
          <h2 className="g-h2">
            한국 표준 잔·병 단위 (ml 기준)
          </h2>
          <p className="g-p">
            본 도구는 한국 음주 환경에서 가장 많이 쓰이는 잔·병 규격을 기본 제공합니다. 본인이 마신 개수만 입력하면 자동 계산됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['잔/병', '용량', '일반 도수', '1잔 알코올(g)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍶 소주잔',         '50ml',    '15.7%', '6.2g',   'var(--sky-500)'],
                  ['🍺 맥주잔 (작은)',  '300ml',   '4.5%',  '10.7g',  'var(--emerald-600)'],
                  ['🍺 맥주잔 (큰)',    '500ml',   '4.5%',  '17.8g',  'var(--emerald-600)'],
                  ['🥃 양주 샷',        '30ml',    '40%',   '9.5g',   'var(--orange-600)'],
                  ['🥃 양주 1.5온스',   '45ml',    '40%',   '14.2g',  'var(--orange-600)'],
                  ['🍷 와인잔',         '150ml',   '13%',   '15.4g',  '#C83EFF'],
                  ['🥣 막걸리 사발',    '200ml',   '6%',    '9.5g',   'var(--orange-600)'],
                  ['🍶 사케 잔',        '60ml',    '15%',   '7.1g',   'var(--pink-600)'],
                  ['🥤 종이컵',         '180ml',   '—',     '—',      'var(--cyan-600)'],
                  ['🍹 하이볼잔',       '300ml',   `~${HIGHBALL_ABV}%`, `${calcAlcohol(300, HIGHBALL_ABV).alcoholG}g`, 'var(--cyan-600)'],
                  ['🍶 소주 1병',       '360ml',   '15.7%', '44.6g',  'var(--sky-500)'],
                  ['🥫 맥주 1캔',       '500ml',   '4.5%',  '17.8g',  'var(--emerald-600)'],
                  ['🍶 막걸리 1병',     '750ml',   '6%',    '35.5g',  'var(--orange-600)'],
                  ['🍷 와인 1병',       '750ml',   '13%',   '77.0g',  '#C83EFF'],
                  ['🥃 위스키 1병',     '700ml',   '40%',   '221.0g', 'var(--orange-600)'],
                ].map(([name, vol, abv, alc, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 600 }}>{name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{vol}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{abv}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{alc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7893 (에탄올 밀도). 제품 라벨의 도수가 다르면 [기준 도수 변환] 도구로 정확 계산.
          </p>
        </section>

        {/* ── 2. 인기 칵테일·하이볼 도수 (NEW) ── */}
        <section>
          <h2 className="g-h2">
            인기 한국 칵테일·하이볼 도수
          </h2>
          <p className="g-p">
            아래 6가지는 본 도구의 [혼합 도수] 탭에서 한 번의 클릭으로 자동 채워집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>칵테일</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>레시피</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🥃 하이볼',         r: '위스키 30ml + 탄산수 270ml (1:9)',  abv: cocktailAbv('highball') },
                  { n: '🍸 진토닉',          r: '진 45ml + 토닉워터 200ml',           abv: cocktailAbv('gin-tonic') },
                  { n: '🥃 잭콕',           r: '잭다니엘 30ml + 콜라 200ml',         abv: cocktailAbv('jack-coke') },
                  { n: '🍊 스크류드라이버', r: '보드카 30ml + 오렌지주스 200ml',     abv: cocktailAbv('screw-driver') },
                  { n: '🍻 소맥 황금 (1:8)', r: '소주 50ml + 맥주 400ml',           abv: cocktailAbv('somaek-gold') },
                  { n: '🍻 소맥 진하게(1:5)', r: '소주 60ml + 맥주 300ml',           abv: cocktailAbv('somaek-strong') },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.abv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 하이볼은 가게마다 1:5(진하게)부터 1:12(약하게)까지 다양. 본인 취향은 [목표 도수 희석] 탭으로 정확 계산.
          </p>
        </section>

        {/* ── 3. 같은 알코올량 환산 (NEW) ── */}
        <section>
          <h2 className="g-h2">
            같은 알코올량 환산 (본 도구 표시 기준 1잔 = 8g)
          </h2>
          <p className="g-p">
            순수 알코올 8g(본 도구 표시 기준)에 해당하는 각 술의 양을 비교하면, 같은 한 잔이라도 종류별로 알코올 양이 크게 다름을 알 수 있습니다. <strong style={{ color: 'var(--text)' }}>표준잔의 공식 정의는 기관마다 달라</strong>(보건복지부 7g · WHO 10g), 본 도구는 표시 편의상 8g을 쓰되 정확한 값은 순수 알코올 g으로 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>술</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1잔(8g) 분량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>실제 1잔 (≈잔수)</th>
                </tr>
              </thead>
              <tbody>
                {EQUIV_TARGETS.filter(t => t.name !== '하이볼').map(t => [
                  `${t.emoji} ${t.name}`,
                  `${t.abv}%`,
                  `${Math.round((STANDARD_DRINK_G / ALCOHOL_DENSITY) * (100 / t.abv))}ml`,
                  `${t.unitLabel.replace(/\(.*\)/, '')} ${t.unitMl}ml = ${calcAlcohol(t.unitMl, t.abv).standard} 표준잔`,
                ]).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. 술자리 1인당 알코올 가이드 (NEW) ── */}
        <section>
          <h2 className="g-h2">
            술자리 1인당 알코올 가이드 (예시)
          </h2>
          <p className="g-p">
            본 도구의 [1인당 분배] 탭에서 자동 계산. 아래는 흔한 술자리 시나리오 예시입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                title: '시나리오 A — 4명, 가벼운 술자리',
                detail: `소주 1병 (${SOJU_BOTTLE.abv}%) + 맥주 4캔 (500ml, ${BEER_CAN.abv}%)`,
                perPerson: `1인당 약 ${SCN_A.per}g (${SCN_A.std} 표준잔)`,
                risk: `🟡 참고 기준 남성 ${SCN_A.male.pct}% / 여성 ${SCN_A.femalePct}% (여성 크게 초과)`,
                color: SCN_A.male.color,
              },
              {
                title: '시나리오 B — 4명, 보통 술자리',
                detail: '소주 3병 + 맥주 6캔',
                perPerson: `1인당 약 ${SCN_B.per}g (${SCN_B.std} 표준잔)`,
                risk: `🟠 참고 기준 남성 ${SCN_B.male.pct}% / 여성 ${SCN_B.femalePct}% (크게 초과)`,
                color: SCN_B.male.color,
              },
              {
                title: '시나리오 C — 4명, 회식 진한 술자리',
                detail: '소주 5병 + 맥주 10캔 + 위스키 200ml',
                perPerson: `1인당 약 ${SCN_C.per}g (${SCN_C.std} 표준잔)`,
                risk: '🔴 위험 음주 — 절대 운전 X · 다음날 출근 운전도 단속 가능',
                color: SCN_C.male.color,
              },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${s.color} 15%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: s.color, marginBottom: '6px' }}>{s.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>{s.detail}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>→ {s.perPerson}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.risk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. 본인 기준 도수 변환 (NEW) ── */}
        <section>
          <h2 className="g-h2">
            소주 도수가 제품마다 다른 이유
          </h2>
          <p className="g-p">
            한국 소주는 브랜드별로 도수가 다르므로, 같은 1병이라도 알코올 양이 크게 차이납니다. 본 도구의 슬라이더로 본인이 마시는 소주 도수를 정확히 입력하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>브랜드</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1병 (360ml) 알코올</th>
                </tr>
              </thead>
              <tbody>
                {SOJU_BRANDS.map((b) => [b.brand, `${b.abv}%`, `${sojuBottleAlcoholG(b.abv)}g`]).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 같은 1병이라도 한라산 오리지날(21%) vs 15.7% 소주 = 알코올 약 34% 차이. 큰 차이입니다. (도수는 {SOJU_ABV_ASOF} 기준·라벨 확인 — 계산기 프리셋·잔 단위 표도 같은 값을 씁니다)
          </p>
        </section>

        {/* ── 6. 표준 음주량 안내 (기존 유지·확장) ── */}
        <section>
          <h2 className="g-h2">
            📊 음주 참고 기준 & 표준잔 정의 (출처·기준일)
          </h2>
          <p className="g-p">
            &lsquo;표준잔(순수 알코올)&rsquo;의 정의는 기관마다 다릅니다 — <strong style={{ color: 'var(--text)' }}>보건복지부 절주 지침 약 7g</strong>, <strong style={{ color: 'var(--text)' }}>WHO 10g</strong>, 미국 NIAAA 14g. 본 도구는 표시 편의상 8g을 &lsquo;1잔&rsquo;으로 환산하며, 정확한 값은 순수 알코올 g으로 제공합니다. 아래는 <strong>참고용</strong> 권고이며, <strong style={{ color: 'var(--orange-600)' }}>WHO(2023)는 &ldquo;건강을 해치지 않는 안전한 음주량은 없다&rdquo;</strong>고 밝혔습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>음주 참고 기준 (기준일 2026-07)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: '남성', value: '1일 4잔 이하', sub: '주 14잔 이하 · 8g 환산 ≈ 1일 32g' },
                { label: '여성', value: '1일 2잔 이하', sub: '주 7잔 이하 · 8g 환산 ≈ 1일 16g' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '12px' }}>
              출처: 보건복지부 절주문화 확산 지침 · 서울대 국민건강지식센터(적정음주 남 4잔·여 2잔) · 국가건강정보포털 · WHO 알코올 팩트시트. <strong style={{ color: 'var(--text)' }}>&lsquo;기준 이내&rsquo;가 안전을 뜻하지는 않습니다.</strong>
            </p>
          </div>
        </section>

        {/* ── 7. FAQ (accordion) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 8. 책임 있는 음주 (강화) ── */}
        <section style={{ background: 'var(--bg2)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--red-600)', marginBottom: '12px' }}>⚠️ 책임 있는 음주 안내</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 계산기는 <strong style={{ color: 'var(--text)' }}>음주를 권장하지 않으며</strong>, 본인 음주량 인지·관리 보조 도구입니다. 계산 결과는 체내 알코올 분해 속도나 취기 정도를 보장하지 않습니다.
          </p>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>미성년자(만 19세 미만)는 주류 판매·제공이 법으로 금지됩니다 (청소년보호법)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>임신·수유 중에는 태아알코올스펙트럼장애(FASD) 위험으로 금주가 강력히 권고됩니다 (의학적 권고)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>약물 복용 중 음주는 의사 상담 필수 (수면제·항우울제·진통제 위험)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>음주 후 운전 절대 금지 (다음날 아침 운전도 BAC 잔류 가능)</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>WHO(2023): &ldquo;알코올 섭취량에 안전한 수준은 없다&rdquo; — 가능한 적게</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>1회 7잔(남) / 5잔(여) 이상을 주 2회 이상 마시면 &lsquo;고위험 음주&rsquo;(국내 기준) — 절주·휴식 필요</li>
          </ul>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>📞 도움이 필요하면 (공식 상담)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
              {[
                { label: '보건복지상담센터 (중독·정신건강, 24h)', tel: '129' },
                { label: '정신건강 위기상담 (24h)',            tel: '1577-0199' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--orange-600)' }}>{c.tel}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
              알코올 사용 문제는 가까운 <strong style={{ color: 'var(--text)' }}>중독관리통합지원센터</strong>(전국 약 50개소, 보건복지상담센터 129로 위치 안내)에서도 상담받을 수 있습니다.
              음주 후 운전은 절대 금지 — <strong style={{ color: 'var(--text)' }}>대리운전 앱(카카오 T·티맵 등)·택시·대중교통</strong>을 이용하세요.
            </p>
          </div>
        </section>

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 계산기', desc: 'BAC 참고 추정 (운전 판단 불가)' },
              { href: '/tools/life/dutch',           icon: '🍻', name: '더치페이 계산기',         desc: '술자리 비용 N빵' },
              { href: '/tools/health/bmr',           icon: '🔥', name: 'BMR 계산기',              desc: '알코올 칼로리 vs 일일 권장' },
              { href: '/tools/health/supplement',    icon: '💊', name: '영양제 성분 체크',         desc: '약물 + 알코올 주의' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
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
